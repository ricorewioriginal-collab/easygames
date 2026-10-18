/* Anwendungskern ohne HTTP: Routen, Anmeldung, Rate-Limits, Eingabeprüfung, Transaktionen.
 * handle() ist die „Logik-Schicht“ – server.js übersetzt nur HTTP davon und dorthin. */
'use strict';
const crypto = require('crypto');
const { ApiError, fail, isObj, NONCE_RE } = require('./util');
const { runTx } = require('./transactions');
const { Buckets } = require('./ratelimit');
const { createVerifier, googleCertSource } = require('./auth');
const { loadGame } = require('./game');

const VERSION = require('../package.json').version;
const ANON_NAME = 'Gelöschter Spieler';

function createApp(opts) {
  const cfg = opts.config, store = opts.store;
  const now = opts.now || Date.now;
  if (cfg.testMode && process.env.NODE_ENV !== 'test') throw new Error('Testmodus nur mit NODE_ENV=test');
  const SW = opts.SW || loadGame(cfg.gameDir);
  const rate = Object.assign({ spin: [3, 5], action: [10, 20], ip: [40, 80] }, opts.rate || {});

  // Öffentliche Kennung: HMAC-SHA256(TARGET_SECRET, uid) – die echte uid verlässt den Server nie
  const pidCache = new Map(), byPid = new Map();
  const pid = uid => {
    let p = pidCache.get(uid);
    if (!p) { p = crypto.createHmac('sha256', cfg.targetSecret).update(uid).digest('hex').slice(0, 24); pidCache.set(uid, p); }
    return p;
  };
  const ctx = {
    SW, E: SW.ECON, store, now, cfg, pid,
    uidOfPid: p => { const u = byPid.get(p); return u && store.data.accounts[u] ? u : null; },
    indexAccount: uid => byPid.set(pid(uid), uid),
    unindexAccount: uid => { byPid.delete(pid(uid)); pidCache.delete(uid); }
  };
  for (const uid of Object.keys(store.data.accounts)) ctx.indexAccount(uid);

  ctx.econ = require('./economy')(ctx);
  ctx.pvp = require('./pvp')(ctx);
  const attacks = require('./attacks')(ctx), raids = require('./raids')(ctx), teams = require('./teams')(ctx);
  const trades = require('./trades')(ctx), rooms = require('./rooms')(ctx), lb = require('./leaderboards')(ctx), events = require('./events')(ctx);

  const verifier = opts.verifier || createVerifier({
    projectId: cfg.projectId, now,
    certSource: cfg.testMode
      ? async () => { if (!opts.testKeys && !cfg.testKeys) throw new Error('keine Testschlüssel'); return { keys: opts.testKeys || cfg.testKeys, maxAgeSec: 3600 }; }
      : googleCertSource(opts.fetch)
  });
  const buckets = new Buckets(now);

  function deleteAccount({ t, user, now: ts }) {
    const uid = user.uid, me = t.get('accounts', uid);
    if (!me) return { deleted: false };
    const myPid = pid(uid);
    teams.removeMember(t, uid);
    for (const tr of Object.values(store.data.trades)) if (tr.from === uid || tr.to === uid) t.del('trades', tr.id);
    for (const [tok, r] of Object.entries(store.data.revenge)) if (r.v === uid || r.a === uid) t.del('revenge', tok);
    // Bei anderen: Verlaufseinträge anonymisieren, Verweise entfernen
    for (const other of Object.values(store.data.accounts)) {
      if (other.uid === uid) continue;
      const touches = other.history.some(e => e.pid === myPid) || other.hits.some(h => h.by === uid)
        || (other.pending && other.pending.target === uid) || other.gifts.to.includes(uid);
      if (!touches) continue;
      const o = t.get('accounts', other.uid);
      for (const e of o.history) if (e.pid === myPid) { e.pid = null; e.name = ANON_NAME; e.revengeToken = null; }
      o.hits = o.hits.map(h => h.by === uid ? { t: h.t, by: '-' } : h);
      o.gifts.to = o.gifts.to.map(u => u === uid ? '-' : u);
      if (o.pending && o.pending.target === uid) o.pending = null;
    }
    t.del('accounts', uid);
    t.after(() => { delete store.data.nonces[uid]; ctx.unindexAccount(uid); rooms.remove(uid); lb.invalidate(); });
    void ts;
    return { deleted: true };
  }

  // kind: public (ohne Anmeldung) | user (jede Firebase-Anmeldung, auch anonym) | account (kein anonymes Konto; Transaktion)
  const R = [];
  const route = (method, path, kind, fn, o) => R.push(Object.assign({ method, path, kind, fn, name: path.slice(4) || 'root', nonce: false, needAccount: true, rl: 'action', state: true }, o || {}));
  route('GET', '/v1/health', 'public', () => ({ ok: true, version: VERSION, time: new Date(now()).toISOString() }));
  route('GET', '/v1/events', 'public', events.events);
  route('GET', '/v1/teams/names', 'public', () => ({ ok: true, result: teams.names() }));
  route('GET', '/v1/leaderboard', 'user', lb.leaderboard);
  route('GET', '/v1/teams', 'user', teams.list);
  route('POST', '/v1/rooms/publish', 'user', rooms.publish);
  route('POST', '/v1/rooms/unpublish', 'user', rooms.unpublish);
  route('GET', '/v1/rooms', 'user', rooms.list);
  route('GET', '/v1/rooms/quick', 'user', rooms.quick);
  route('POST', '/v1/account/init', 'account', ctx.econ.init, { nonce: 'optional', needAccount: false });
  route('GET', '/v1/me', 'account', () => ({}));
  route('DELETE', '/v1/account', 'account', deleteAccount, { needAccount: false, state: false });
  route('POST', '/v1/spin', 'account', ctx.econ.spin, { nonce: 'required', rl: 'spin' });
  route('POST', '/v1/build', 'account', ctx.econ.build, { nonce: 'required' });
  route('POST', '/v1/repair', 'account', ctx.econ.repair, { nonce: 'required' });
  route('GET', '/v1/targets', 'account', ctx.pvp.targets);
  route('POST', '/v1/attack', 'account', attacks.attack, { nonce: 'required' });
  route('POST', '/v1/raid', 'account', raids.raid, { nonce: 'required' });
  route('POST', '/v1/revenge', 'account', ctx.pvp.revenge, { nonce: 'required' });
  route('GET', '/v1/history', 'account', ctx.pvp.history);
  route('POST', '/v1/teams/create', 'account', teams.create, { nonce: 'required' });
  route('POST', '/v1/teams/join', 'account', teams.join, { nonce: 'required' });
  route('POST', '/v1/teams/leave', 'account', teams.leave, { nonce: 'required' });
  route('POST', '/v1/teams/gift', 'account', teams.gift, { nonce: 'required' });
  route('GET', '/v1/teams/mine', 'account', teams.mine);
  route('POST', '/v1/trades/offer', 'account', trades.offer, { nonce: 'required' });
  route('POST', '/v1/trades/accept', 'account', trades.accept, { nonce: 'required' });
  route('POST', '/v1/trades/cancel', 'account', trades.cancel, { nonce: 'required' });
  route('GET', '/v1/trades', 'account', trades.list);
  if (cfg.testMode) route('POST', '/v1/test/patch', 'account', ctx.econ.testPatch);   // existiert NUR im Testmodus

  const json = (status, obj, headers) => ({ status, body: JSON.stringify(obj), headers: headers || {} });
  const err = (status, code, headers) => json(status, { ok: false, error: code }, headers);

  async function handle(req) {
    const ts = now();
    const r = R.find(x => x.path === req.path && x.method === req.method);
    if (!r) return R.some(x => x.path === req.path) ? err(405, 'method_not_allowed') : err(404, 'not_found');
    const query = req.query || new URLSearchParams();
    try {
      if (r.kind !== 'public') {
        const wait = buckets.take('ip:' + (req.ip || '?'), rate.ip[0], rate.ip[1]);
        if (wait) return err(429, 'rate_limited', { 'Retry-After': String(wait) });
      }
      let body = {};
      if (req.method === 'POST') {
        if (req.rawBody && req.rawBody.length) {
          try { body = JSON.parse(req.rawBody); } catch (e) { return err(400, 'bad_json'); }
          if (!isObj(body)) return err(400, 'bad_json');
        }
      }
      if (r.kind === 'public') return json(200, r.fn({ query, now: ts }));
      const auth = (req.headers && req.headers.authorization) || '';
      const m = /^Bearer ([^\s]+)$/.exec(auth);
      if (!m) return err(401, 'auth_required');
      const user = await verifier.verify(m[1]);
      const wait = buckets.take(r.rl + ':' + user.uid, rate[r.rl][0], rate[r.rl][1]);
      if (wait) return err(429, 'rate_limited', { 'Retry-After': String(wait) });
      const t2 = now();
      if (r.kind === 'user') return json(200, r.fn({ user, body, query, now: t2 }));
      if (user.anonymous) return err(403, 'anonymous_not_allowed');
      let nonce = null;
      if (r.nonce) {
        if (body.nonce !== undefined || r.nonce === 'required') {
          if (typeof body.nonce !== 'string' || !NONCE_RE.test(body.nonce)) return err(400, 'bad_nonce');
          nonce = body.nonce;
        }
      }
      const res = runTx(store, { uid: user.uid, action: r.name, nonce, now: t2 }, t => {
        let me = t.get('accounts', user.uid);
        if (r.needAccount) { if (!me) fail(404, 'no_account'); ctx.econ.normalize(me, t2); }
        const result = r.fn({ t, me, user, input: body, query, now: t2 });
        me = t.get('accounts', user.uid);
        const out = { ok: true, result };
        if (r.state && me) out.state = ctx.econ.view(me, t2);
        return out;
      });
      if (res.status === 200 && /^(build|repair|attack|raid|account\/init)$/.test(r.name)) lb.invalidate();
      return { status: res.status, body: res.body, headers: res.replay ? { 'X-Idempotent-Replay': '1' } : {} };
    } catch (e) {
      if (e instanceof ApiError) return err(e.status, e.code);
      console.error('[app] interner Fehler bei', req.method, req.path, e && e.stack || e);
      return err(500, 'internal');
    }
  }

  // Aufräumen: abgelaufene Angebote/Rache-Token, alte Rate-Limit-Eimer
  function sweep() {
    const t = now();
    let changed = false;
    for (const [id, tr] of Object.entries(store.data.trades)) if (tr.exp <= t) { delete store.data.trades[id]; changed = true; }
    for (const [tok, r] of Object.entries(store.data.revenge)) if (r.exp <= t) { delete store.data.revenge[tok]; changed = true; }
    if (changed) store.markDirty();
    buckets.sweep(10 * 60e3);
  }

  return { handle, sweep, ctx, version: VERSION, routes: R.map(x => x.method + ' ' + x.path) };
}

module.exports = { createApp, VERSION };
