#!/usr/bin/env node
// Prüft den Abgleich in cloud/anmacha-cloud.js (ohne Netz, mit Attrappen):
//  1) Gleichstand beim ersten Abgleich mit abweichenden Ständen: nichts wird überschrieben, die Cloud-Kopie landet in der älteren Sicherung (kein stiller Verlust)
//  2) Fremde Cloud-Schlüssel (nicht im aktuellen Präfix) überschreiben nie lokale Daten, bleiben aber in der Cloud erhalten
//   node tools/test-cloud-merge.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../cloud/anmacha-cloud.js', import.meta.url), 'utf8');

function harness({ prefix, remote = {}, local = {}, alt = null, failAlt = 0 }) {
  class Storage {
    constructor() { this.items = new Map(); }
    getItem(k) { return this.items.get(String(k)) ?? null; }
    setItem(k, v) { this.items.set(String(k), String(v)); }
    removeItem(k) { this.items.delete(String(k)); }
    key(i) { return Array.from(this.items.keys())[i] ?? null; }
    get length() { return this.items.size; }
  }
  const ls = new Storage(), session = new Storage(), requests = [], tasks = new Map(); let next = 0, altPatches = 0, reloads = 0;
  for (const [k, v] of Object.entries(local)) ls.setItem(k, v);
  ls.setItem('anmacha-cloud-on', '1'); ls.setItem('anmacha-cloud-rt', 'test-only-refresh-token');
  const fetch = async (url, options = {}) => {
    requests.push({ url, options });
    let data = {};
    if (url.includes('securetoken.googleapis.com')) data = { id_token: 'test-only-id-token', expires_in: 3600, user_id: 'test-user' };
    else if (url.includes('accounts:lookup')) data = { users: [{ displayName: 'Test' }] };
    else if (url.includes('action=saves_put') && url.includes('') && JSON.parse(options.body).game.endsWith('__alt') && ++altPatches <= failAlt) return { ok: false, status: 500, json: async () => ({}) };
    else if (url.includes('action=saves_put')) data = { status: 'ok', ver: 'v' + requests.length };
    else if (url.includes('action=saves_get')) {
      if (url.includes('__alt')) { if (!alt) return { ok: false, status: 404, json: async () => ({}) }; data = { status: 'ok', d: JSON.stringify(alt), ver: 'va' }; }
      else data = { status: 'ok', d: JSON.stringify(remote), ver: 'v0' };
    }
    return { ok: true, status: 200, json: async () => data };
  };
  const document = { currentScript: { dataset: { game: 'testgame', prefix, ui: 'off' } }, body: {}, visibilityState: 'visible', addEventListener() {}, querySelectorAll: () => [] };
  const window = { localStorage: ls, Promise, fetch, addEventListener() {} };
  const context = { window, document, Storage, fetch, sessionStorage: session, confirm: () => true, location: { hostname: 'appassets.local', reload() { reloads++; } }, navigator: { userAgent: 'RicoReWiApp/test' },
    setTimeout(fn) { const id = ++next; tasks.set(id, fn); return id; }, clearTimeout(id) { tasks.delete(id); }, setInterval() { return 0; }, clearInterval() {}, console, Date, JSON, Object, Array, Promise, String, Math, Error, encodeURIComponent, decodeURIComponent };
  vm.runInNewContext(source, context);
  return { ls, requests, api: window.AnMaChaCloud, get reloads() { return reloads; }, async idle() { for (let i = 0; i < 20; i++) await new Promise(r => setImmediate(r)); } };
}
const uploads = (h, alt) => h.requests.filter(r => r.options.method === 'POST' && r.url.includes('action=saves_put')).map(r => JSON.parse(r.options.body)).filter(o => o.game.endsWith('__alt') === !!alt)
  .map(o => JSON.parse(o.d));

test('Gleichstand beim ersten Abgleich: Cloud-Kopie wird als ältere Sicherung aufgehoben, lokal bleibt unverändert', async () => {
  const h = harness({ prefix: 'mygame.', remote: { 'mygame.save': { v: 'CLOUD', t: 1 } }, local: { 'mygame.save': 'LOKAL' } });
  await h.idle();
  assert.equal(h.ls.getItem('mygame.save'), 'LOKAL', 'lokaler Stand wird bei Gleichstand nicht überschrieben');
  const alt = uploads(h, true);
  assert.equal(alt.length, 1, 'ältere Sicherung wurde hochgeladen');
  assert.equal(alt[0]['mygame.save'].v, 'CLOUD', 'Cloud-Kopie ist gesichert');
});

test('Gleicher Wert bei Gleichstand erzeugt keine Sicherung', async () => {
  const h = harness({ prefix: 'mygame.', remote: { 'mygame.save': { v: 'GLEICH', t: 1 } }, local: { 'mygame.save': 'GLEICH' } });
  await h.idle();
  assert.equal(uploads(h, true).length, 0);
});

test('Fremde Cloud-Schlüssel überschreiben lokal nichts, bleiben aber in der Cloud', async () => {
  const h = harness({ prefix: 'bi.', remote: { 'bi.save': { v: 'EINS', t: 5 }, 'bi2.slot1': { v: 'ALT-AUS-BREITEM-PRAEFIX', t: 9 } }, local: { 'bi2.slot1': 'NEUER-STAND', 'bi.save': 'EINS' } });
  await h.idle();
  assert.equal(h.ls.getItem('bi2.slot1'), 'NEUER-STAND', 'fremder Schlüssel bleibt unangetastet');
  h.ls.setItem('bi.save', 'ZWEI'); await h.api.sync(); await h.idle();
  const main = uploads(h, false);
  const last = main[main.length - 1];
  assert.ok(last['bi2.slot1'], 'fremder Schlüssel bleibt im Cloud-Dokument');
});

test('Manuelles Wiederherstellen wendet nur eigene Schlüssel an', async () => {
  const h = harness({ prefix: 'bi.', remote: { 'bi.save': { v: 'CLOUD', t: 5 }, 'bi2.slot1': { v: 'ALT-AUS-BREITEM-PRAEFIX', t: 9 } }, local: { 'bi.save': 'LOKAL', 'bi2.slot1': 'NEUER-STAND' } });
  h.ls.removeItem('anmacha-cloud-on'); // nur manuell
  h.ls.setItem('anmacha-cloud-on', '1');
  await h.api.restore(); await h.idle();
  assert.equal(h.ls.getItem('bi.save'), 'CLOUD');
  assert.equal(h.ls.getItem('bi2.slot1'), 'NEUER-STAND', 'fremder Schlüssel bleibt bei restore() unangetastet');
});

test('Ältere Sicherung zurückholen wendet nur eigene Schlüssel an', async () => {
  const h = harness({ prefix: 'bi.', remote: { 'bi.save': { v: 'JETZT', t: 5 } }, alt: { 'bi.save': { v: 'FRUEHER', t: 1 }, 'bi2.slot1': { v: 'ALT-AUS-BREITEM-PRAEFIX', t: 1 } }, local: { 'bi.save': 'JETZT', 'bi2.slot1': 'NEUER-STAND' } });
  await h.idle();
  await h.api.restoreOlder(); await h.idle();
  assert.equal(h.ls.getItem('bi.save'), 'FRUEHER');
  assert.equal(h.ls.getItem('bi2.slot1'), 'NEUER-STAND', 'fremder Schlüssel bleibt bei restoreOlder() unangetastet');
});

test('Schlägt die Sicherung fehl, bleibt lokal alles unverändert und der erste Abgleich wird wiederholt', async () => {
  const h = harness({ prefix: 'g.', remote: { 'g.save': { v: 'NEUER', t: 9 } }, local: { 'g.save': 'ALT' }, failAlt: 1 });
  await h.idle();
  assert.equal(h.ls.getItem('g.save'), 'ALT', 'nach fehlgeschlagener Sicherung nichts überschreiben');
  await h.api.sync(); await h.idle();
  assert.equal(h.ls.getItem('g.save'), 'NEUER', 'zweiter Versuch gelingt');
  const alt = uploads(h, true);
  assert.equal(alt[alt.length - 1]['g.save'].v, 'ALT', 'der alte Stand ist gesichert');
});

test('Nach drei Fehlversuchen der Sicherung wird trotzdem abgeglichen (keine Dauerblockade)', async () => {
  const h = harness({ prefix: 'g.', remote: { 'g.save': { v: 'NEUER', t: 9 } }, local: { 'g.save': 'ALT' }, failAlt: 99 });
  await h.idle();
  for (let i = 0; i < 3; i++) { await h.api.sync(); await h.idle(); }
  assert.equal(h.ls.getItem('g.save'), 'NEUER');
});
