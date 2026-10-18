/* Transaktionen: Jede Anfrage arbeitet auf Kopien (Entwürfen) der betroffenen Datensätze.
 * Erst wenn alles geklappt hat, werden alle Entwürfe auf einmal übernommen (synchron – Node unterbricht dazwischen nicht).
 * Bei einem Fehler wird nichts übernommen. Dazu: Idempotenz über nonce je Konto und Audit-Log je Buchung. */
'use strict';
const { ApiError } = require('./util');

const NONCE_KEEP = 500, NONCE_TTL = 48 * 36e5, NONCE_BODIES = 32;
const AUDIT_SKIP = new Set(['energyAt']);

// Keine Zahl darf NaN/Infinity/negativ sein
function assertSane(v, where) {
  if (typeof v === 'number') { if (!Number.isFinite(v) || v < 0) throw new Error('Ungültige Zahl in ' + where + ': ' + v); return; }
  if (Array.isArray(v)) { for (let i = 0; i < v.length; i++) assertSane(v[i], where + '[' + i + ']'); return; }
  if (v && typeof v === 'object') for (const k of Object.keys(v)) assertSane(v[k], where + '.' + k);
}

function numDelta(a, b, nested) {
  const d = {};
  const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
  for (const k of keys) {
    if (AUDIT_SKIP.has(k)) continue;
    const x = a ? a[k] : undefined, y = b ? b[k] : undefined;
    if ((typeof x === 'number' || typeof y === 'number') && (x || 0) !== (y || 0)) d[k] = (y || 0) - (x || 0);
  }
  if (nested) return d;
  if ((a && a.cards) || (b && b.cards)) {
    const c = numDelta(a && a.cards, b && b.cards, true);
    if (Object.keys(c).length) d.cards = c;
  }
  if (a && b && Array.isArray(a.stages) && a.stages.join() !== b.stages.join()) d.stages = b.stages.slice();
  if (!a && b) d.created = true;
  if (a && !b) d.deleted = true;
  return d;
}

class Tx {
  constructor(store, now) { this.store = store; this.now = now; this.drafts = new Map(); this.afterFns = []; }
  _key(c, id) { return c + '\u0000' + id; }
  get(coll, id) {
    const k = this._key(coll, id);
    if (this.drafts.has(k)) return this.drafts.get(k).v;
    const orig = this.store.data[coll][id];
    if (!orig) return null;
    const v = structuredClone(orig);
    this.drafts.set(k, { coll, id, v, orig });
    return v;
  }
  put(coll, id, v) {
    const k = this._key(coll, id), prev = this.drafts.get(k);
    this.drafts.set(k, { coll, id, v, orig: prev ? prev.orig : (this.store.data[coll][id] || null) });
    return v;
  }
  del(coll, id) { this.put(coll, id, null); }
  after(fn) { this.afterFns.push(fn); }
  // Alle Entwürfe prüfen, dann gemeinsam übernehmen
  commit() {
    for (const d of this.drafts.values()) if (d.v) assertSane(d.v, d.coll + '/' + d.id);
    const deltas = {};
    let changed = false;
    for (const d of this.drafts.values()) {
      // Unveränderte Entwürfe (z. B. reines Lesen von /v1/me) lösen keinen Schreibvorgang aus
      if (d.v && d.orig && JSON.stringify(d.v) === JSON.stringify(d.orig)) continue;
      changed = true;
      const data = this.store.data[d.coll];
      if (d.v) data[d.id] = d.v; else delete data[d.id];
      if (d.coll === 'accounts') { const delta = numDelta(d.orig, d.v); if (Object.keys(delta).length) deltas[d.id] = delta; }
    }
    for (const fn of this.afterFns) fn();
    if (changed) this.store.markDirty();
    return deltas;
  }
}

function nonceList(store, uid) { return store.data.nonces[uid] || null; }

function nonceGet(store, uid, nonce, now) {
  const list = nonceList(store, uid);
  if (!list) return null;
  for (let i = list.length - 1; i >= 0; i--) {
    const e = list[i];
    if (e[0] === nonce) return now - e[1] <= NONCE_TTL ? e : null;
  }
  return null;
}

function noncePut(store, uid, nonce, action, status, body, now) {
  let list = store.data.nonces[uid];
  if (!list) list = store.data.nonces[uid] = [];
  list.push([nonce, now, action, status, body]);
  let cut = 0;
  while (cut < list.length && (list.length - cut > NONCE_KEEP || now - list[cut][1] > NONCE_TTL)) cut++;
  if (cut) list.splice(0, cut);
  // Antworttexte nur für die neuesten Einträge aufheben (Netz-Wiederholungen kommen sofort); ältere: nur die nonce
  for (let i = 0; i < list.length - NONCE_BODIES; i++) list[i][4] = null;
  store.markDirty();
}

/* Führt fn(tx) als Transaktion aus. Rückgabe { status, body } (body = JSON-Text).
 * fn liefert das Antwortobjekt; ApiError → Fehlerantwort, nichts übernommen. */
function runTx(store, opts, fn) {
  const { uid, action, nonce, now } = opts;
  if (nonce) {
    const hit = nonceGet(store, uid, nonce, now);
    if (hit) {
      if (hit[2] !== action) return { status: 409, body: JSON.stringify({ ok: false, error: 'nonce_reused' }) };
      if (hit[4] == null) return { status: 409, body: JSON.stringify({ ok: false, error: 'nonce_used' }) };
      return { status: hit[3], body: hit[4], replay: true };
    }
  }
  const tx = new Tx(store, now);
  let status, obj, deltas = {};
  try {
    obj = fn(tx);
    deltas = tx.commit();
    status = 200;
  } catch (e) {
    if (!(e instanceof ApiError)) throw e;   // interner Fehler: nichts übernommen, Aufrufer meldet 500
    status = e.status; obj = { ok: false, error: e.code };
  }
  const body = JSON.stringify(obj);
  const changed = Object.keys(deltas).filter(u => Object.keys(deltas[u]).some(k => k !== 'energy'));
  if (status === 200 && (nonce || changed.length) && Object.keys(deltas).length) {
    store.audit({ t: now, uid, a: action, n: nonce || null, d: deltas });
  }
  if (nonce && store.data.accounts[uid]) noncePut(store, uid, nonce, action, status, body, now);
  return { status, body };
}

module.exports = { Tx, runTx, assertSane, numDelta, NONCE_KEEP, NONCE_TTL, NONCE_BODIES };
