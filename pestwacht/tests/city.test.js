/* Stadt: Bauen, Verbessern, Versetzen, Abreißen, Reparieren, Platzregeln, Rohstoffe. Aufruf: node --test pestwacht/tests/*.test.js */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const PW = require('./load.js');
const G = PW.Game, C = PW.City;

function game(seed) { const S = G.newGame({ mode: 'free', seed: seed || 'stadt', bots: 3 }); PW.RES.forEach(k => { S.res[k] = 5000; }); G.refresh(S); return S; }
function freeSpot(S, type) { for (let x = C.MIN; x <= C.MAX; x++) for (let y = C.MIN; y <= C.MAX; y++) if (C.canPlace(S, type, x, y, 0).ok) return [x, y]; return null; }
function finish(S) { for (let i = 0; i < 4000 && S.city.b.some(b => b.st !== 'ok'); i++) G.tick(S, 0.5); }

test('10 Rohstoffe, alle mit Anzeige', () => {
  assert.equal(PW.RES.length, 10);
  PW.RES.forEach(k => assert.ok(PW.RES_INFO[k] && PW.RES_INFO[k].icon && PW.RES_INFO[k].name, k));
});

test('Neues Spiel hat Ratshaus und Mauer', () => {
  const S = game();
  assert.ok(S.city.b.some(b => b.t === 'hq' && b.lv >= 1));
  assert.ok(S.city.b.some(b => b.t === 'mauer'));
});

test('Bauen kostet Rohstoffe und wird nach der Bauzeit fertig', () => {
  const S = game(), before = S.res.wood, spot = freeSpot(S, 'haus');
  assert.ok(spot, 'freier Platz für ein Haus');
  const r = C.place(S, 'haus', spot[0], spot[1], 0);
  assert.equal(r.ok, true, r.why);
  assert.ok(S.res.wood < before, 'Holz wurde bezahlt');
  assert.equal(r.b.st, 'bau');
  finish(S);
  assert.equal(C.get(S, r.b.id).st, 'ok');
  assert.equal(C.get(S, r.b.id).lv, 1);
});

test('Überlappung und Rand werden abgelehnt', () => {
  const S = game(), hq = S.city.b.find(b => b.t === 'hq');
  assert.equal(C.canPlace(S, 'haus', hq.x, hq.y, 0).ok, false);
  assert.equal(C.canPlace(S, 'haus', C.MAX + 3, C.MAX + 3, 0).ok, false);
});

test('Verbessern erhöht die Stufe, ohne Rohstoffe geht es nicht', () => {
  const S = game(), spot = freeSpot(S, 'haus'), r = C.place(S, 'haus', spot[0], spot[1], 0); finish(S);
  const hq = S.city.b.find(b => b.t === 'hq'); assert.equal(C.upgradeWhy(S, r.b) !== null, true, 'Stufe 2 braucht zuerst ein besseres Ratshaus');
  const uh = C.upgrade(S, hq.id); assert.equal(uh.ok, true, uh.why); finish(S);
  const u = C.upgrade(S, r.b.id); assert.equal(u.ok, true, u.why); finish(S);
  assert.equal(C.get(S, r.b.id).lv, 2);
  PW.RES.forEach(k => { S.res[k] = 0; });
  assert.equal(C.upgrade(S, r.b.id).ok, false);
});

test('Versetzen, Abreißen und Reparieren', () => {
  const S = game(), spot = freeSpot(S, 'haus'), r = C.place(S, 'haus', spot[0], spot[1], 0); finish(S);
  const b = C.get(S, r.b.id), to = (() => { for (let x = C.MAX - 2; x >= C.MIN; x--) for (let y = C.MAX - 2; y >= C.MIN; y--) if (C.canPlace(S, 'haus', x, y, 0, b.id).ok && (x !== b.x || y !== b.y)) return [x, y]; })();
  const m = C.move(S, b.id, to[0], to[1], 0); assert.equal(m.ok, true, m.why);
  assert.deepEqual([C.get(S, b.id).x, C.get(S, b.id).y], to);
  // Schaden → Reparatur stellt volle Lebenspunkte her
  b.hp = 1; assert.ok(C.repairCost(S, b));
  const rp = C.repair(S, b.id); assert.equal(rp.ok, true, rp.why); finish(S);
  assert.ok(C.get(S, b.id).hp >= C.maxHp(C.get(S, b.id)) - 0.01);
  const n = S.city.b.length, d = C.demolish(S, b.id); assert.equal(d.ok, true, d.why); finish(S);
  assert.equal(S.city.b.length, n - 1);
  const hq = S.city.b.find(x => x.t === 'hq'); assert.equal(C.demolish(S, hq.id).ok, false, 'Ratshaus bleibt');
});

test('Alle Gebäudearten haben ein Modell-Rezept und gültige Kosten', () => {
  assert.ok(PW.BUILDINGS.length >= 30);
  PW.BUILDINGS.forEach(d => {
    const c = PW.costOf(d.id, 1); assert.ok(c && typeof c === 'object', d.id);
    Object.keys(c).forEach(k => assert.ok(PW.RES.indexOf(k) >= 0, d.id + ': ' + k));
  });
});
