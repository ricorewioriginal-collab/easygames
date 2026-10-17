// Royal Radio Match 3D – Spielstand: Migration aus 'anmacha-radio-match-v1', Idempotenz, Zusammenführen, kaputte Daten.
//   node anmacha-radio-match/tests/save.test.mjs
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
globalThis.window = globalThis;
require('../src/core/defs.js');
const Save = require('../src/save/storage.js');

let n = 0;
const ok = (name, fn) => { fn(); n++; console.log('PASS ' + name); };
function mem(init) {
  const d = Object.assign({}, init);
  return { getItem: k => (k in d ? d[k] : null), setItem: (k, v) => { d[k] = String(v); }, removeItem: k => { delete d[k]; }, d };
}
const V1 = JSON.stringify({ unlocked: 37, stars: { 1: 3, 2: 2, 36: 1, 150: 3, x: 2 }, mute: true });

ok('neuer Spieler bekommt Startwerte', () => {
  const s = Save.load(mem());
  assert.equal(s.unlocked, 1); assert.equal(s.coins, 500); assert.equal(s.from, 0); assert.equal(s.inv.hammer, 3);
});
ok('v1-Stand wird übernommen (Level, Sterne, Ton aus), ungültige Einträge verworfen', () => {
  const s = Save.load(mem({ 'anmacha-radio-match-v1': V1 }));
  assert.equal(s.unlocked, 37); assert.deepEqual(s.stars, { 1: 3, 2: 2, 36: 1 });
  assert.equal(s.from, 1); assert.equal(s.set.sfx, false); assert.equal(s.set.music, false); assert.equal(s.coins, 500);
});
ok('Migration ist idempotent und lässt den alten Schlüssel unverändert', () => {
  const ls = mem({ 'anmacha-radio-match-v1': V1 });
  const a = Save.load(ls); Save.store(ls, a, 1000);
  const b = Save.load(ls); Save.store(ls, b, 2000);
  const c = Save.load(ls);
  assert.equal(c.unlocked, 37); assert.deepEqual(c.stars, a.stars); assert.equal(c.coins, 500);
  assert.equal(ls.getItem('anmacha-radio-match-v1'), V1);
  assert.equal(JSON.parse(ls.getItem('royal-radio-match-v2')).v, 2);
});
ok('Fortschritt nach der Migration bleibt erhalten, auch wenn v1 nachträglich (Cloud) zurückkommt', () => {
  const ls = mem({ 'anmacha-radio-match-v1': V1 });
  const s = Save.load(ls); s.unlocked = 60; s.stars[50] = 3; s.coins = 120; Save.store(ls, s, 5000);
  ls.setItem('anmacha-radio-match-v1', V1);
  const t = Save.load(ls);
  assert.equal(t.unlocked, 60); assert.equal(t.stars[50], 3); assert.equal(t.coins, 120);
});
ok('älterer Cloud-Stand kann lokalen Fortschritt nicht zurücksetzen (Hochwasser-Marke)', () => {
  const ls = mem();
  const s = Save.load(ls); s.unlocked = 80; s.stars[79] = 2; Save.store(ls, s, 9000);
  ls.setItem('royal-radio-match-v2', JSON.stringify({ v: 2, unlocked: 12, stars: { 3: 1 }, coins: 999, t: 100 }));
  const t = Save.load(ls);
  assert.equal(t.unlocked, 80); assert.equal(t.stars[79], 2); assert.equal(t.stars[3], 1);
});
ok('merge: Fortschritt als Maximum, Münzen vom neueren Stand', () => {
  const m = Save.merge({ unlocked: 10, stars: { 1: 1 }, coins: 50, t: 1, tower: [0] }, { unlocked: 4, stars: { 1: 3, 2: 2 }, coins: 70, t: 2, tower: [1] });
  assert.equal(m.unlocked, 10); assert.deepEqual(m.stars, { 1: 3, 2: 2 }); assert.equal(m.coins, 70); assert.deepEqual(m.tower, [0, 1]);
});
ok('kaputte oder fremde Daten führen nicht zum Absturz', () => {
  ['{', 'null', '[]', '"x"', JSON.stringify({ unlocked: 'abc', stars: 5, coins: -3, inv: { hammer: 'z' }, tower: [99, 1.5, 2] })].forEach(raw => {
    const s = Save.load(mem({ 'royal-radio-match-v2': raw, 'anmacha-radio-match-v1': raw }));
    assert(s.unlocked >= 1 && s.unlocked <= 200); assert(s.coins >= 0); assert(Number.isFinite(s.inv.hammer));
    s.tower.forEach(f => assert(Number.isInteger(f) && f >= 0 && f < 10));
  });
});
ok('Speichern schlägt bei vollem Speicher still fehl', () => {
  const ls = { getItem: () => null, setItem: () => { throw new Error('QuotaExceeded'); } };
  assert.equal(Save.store(ls, Save.load(ls)), false);
});

console.log(n + ' Spielstand-Tests bestanden');
