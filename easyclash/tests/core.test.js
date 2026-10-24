// EASYCLASH – Logik-Tests.  node --test easyclash/tests/core.test.js
'use strict';
const test = require('node:test'), assert = require('node:assert');
const EC = require('../js/core.js');
const CH = { id: 'a', sp: 'shot', stats: {} }, CH2 = { id: 'b', sp: 'rush', stats: {} };
function fight(chars) { const M = EC.newMatch({ chars: chars || [CH, CH2], target: 2, seed: 3 }), W = EC.newRound(M); for (let k = 0; k < 110; k++) EC.step(W, [{}, {}]); assert.strictEqual(W.phase, 'fight'); return W; }
function run(W, n, fn) { const ev = []; for (let k = 0; k < n; k++) { EC.step(W, fn ? fn(k, W) : [{}, {}]); ev.push(...W.ev); } return ev; }
const near = (W, d) => { W.f[0].x = -d / 2; W.f[1].x = d / 2; W.f[0].z = W.f[1].z = 0; };

test('Runde startet mit Ansage, dann Kampf', () => {
  const M = EC.newMatch({ chars: [CH, CH2] }), W = EC.newRound(M), ev = run(W, 110);
  assert.ok(ev.some(e => e.k === 'round')); assert.ok(ev.some(e => e.k === 'fight')); assert.strictEqual(W.f[0].hp, EC.HP);
});

test('Schlag trifft, Kette P,P,P macht mehr Schaden; Block hält Mitte/Hoch, nicht Tief', () => {
  let W = fight(); near(W, 1.1);
  let ev = run(W, 60, k => [{ p: k === 0 || k === 12 || k === 24 }, {}]);
  const hits = ev.filter(e => e.k === 'hit' && !e.block); assert.strictEqual(hits.length, 3, 'drei Treffer'); assert.ok(W.f[1].hp <= EC.HP - 25);
  W = fight(); near(W, 1.1); ev = run(W, 40, k => [{ k: k === 0 }, { fx: -1, block: true }]);
  assert.ok(ev.some(e => e.k === 'hit' && e.block), 'Tritt geblockt'); assert.strictEqual(W.f[1].hp, EC.HP);
  W = fight(); near(W, 1.1); ev = run(W, 50, k => [{ sy: 1, k: k === 10 }, { fx: -1, block: true }]);
  assert.ok(ev.some(e => e.k === 'hit' && !e.block && e.h === 'low'), 'Feger trifft stehenden Blocker');
});

test('Ducken lässt hohe Schläge durch, Seitschritt weicht geraden Angriffen aus', () => {
  let W = fight(); near(W, 1.1); let ev = run(W, 40, k => [{ p: k === 12 }, { sy: 1 }]);
  assert.ok(ev.some(e => e.k === 'duck')); assert.strictEqual(W.f[1].hp, EC.HP);
  W = fight(); near(W, 1.3);
  ev = run(W, 50, k => [{ k: k === 0, fx: 0 }, { sy: k < 3 ? -1 : 0 }]);
  assert.ok(ev.some(e => e.k === 'side')); assert.strictEqual(W.f[1].hp, EC.HP, 'Seitschritt ausgewichen');
});

test('Aushebler + Luft-Kombo, Konter-Treffer, Wurf und Wurf-Befreiung', () => {
  let W = fight(); near(W, 1.1);
  let ev = run(W, 220, (k, W) => [{ fx: k < 2 || (k > 20 && k < 90 && EC.len(W.f[1].x - W.f[0].x, W.f[1].z - W.f[0].z) > 1.2) ? 1 : 0, k: k === 0, p: k > 22 && k < 90 && k % 10 === 0 && EC.len(W.f[1].x - W.f[0].x, W.f[1].z - W.f[0].z) <= 1.2 ? true : false }, {}]);
  assert.ok(ev.some(e => e.k === 'launch')); assert.ok(ev.some(e => e.k === 'combo' && e.n >= 3), 'Luft-Kombo');
  W = fight(); near(W, 1.2); ev = run(W, 40, k => [{ p: k === 2 }, { k: k === 0 }]);
  assert.ok(ev.some(e => e.k === 'counter'), 'Konter');
  W = fight(); near(W, .95); ev = run(W, 80, k => [{ g: k === 0 }, {}]);
  assert.ok(ev.some(e => e.k === 'throw' && e.dmg > 20));
  W = fight(); near(W, .95); ev = run(W, 80, (k, W) => [{ g: k === 0 }, { g: W.f[1].state === 'thrown' && W.f[1].t === 5 }]);
  assert.ok(ev.some(e => e.k === 'break')); assert.strictEqual(W.f[1].hp, EC.HP);
});

test('Spezial: Energiestoß fliegt und trifft auf Distanz; Sturmangriff überbrückt Abstand', () => {
  let W = fight(); near(W, 5); let ev = run(W, 120, k => [{ s: k === 0 }, {}]);
  assert.ok(ev.some(e => e.k === 'proj')); assert.ok(W.f[1].hp < EC.HP);
  W = fight([CH2, CH]); near(W, 2.6); ev = run(W, 60, k => [{ s: k === 0 }, {}]);
  assert.ok(W.f[1].hp < EC.HP, 'Sturmangriff trifft');
});

test('Wut bei wenig Leben, Finale einmal pro Runde; K.O. beendet Runde, Match bis 2 Siege', () => {
  const W = fight(); near(W, 1.2); W.f[0].hp = 40;
  let ev = run(W, 2); assert.ok(W.f[0].rage);
  ev = run(W, 80, k => [{ f: k === 0 }, {}]); assert.ok(ev.some(e => e.k === 'finale')); assert.ok(W.f[1].hp <= EC.HP - 50);
  ev = run(W, 80, k => [{ f: k === 0 }, {}]); assert.ok(!ev.some(e => e.k === 'finale'), 'nur einmal');
  W.f[1].hp = 5; near(W, 1.1); ev = run(W, 220, k => [{ p: k % 15 === 0 }, {}]);
  assert.ok(ev.some(e => e.k === 'ko')); assert.ok(ev.some(e => e.k === 'roundEnd')); assert.strictEqual(W.M.wins[0], 1);
  const W2 = EC.newRound(W.M); for (let k = 0; k < 110; k++) EC.step(W2, [{}, {}]); W2.f[1].hp = 3; W2.f[0].x = -.55; W2.f[1].x = .55;
  run(W2, 220, k => [{ p: k % 15 === 0 }, {}]); assert.ok(W.M.over); assert.strictEqual(W.M.winner, 0);
});

test('Zeit läuft ab → wer mehr Leben hat, gewinnt; Bühne hat eine Wand', () => {
  const W = fight(); W.time = .05; W.f[1].hp = 100; const ev = run(W, 200);
  assert.ok(ev.some(e => e.k === 'time')); assert.strictEqual(W.M.wins[0], 1);
  const V = fight(); for (let k = 0; k < 600; k++) EC.step(V, [{ fx: -1 }, {}]); assert.ok(EC.len(V.f[0].x, V.f[0].z) <= EC.RING + 1e-6);
});

test('Computer-Gegner kämpfen auf allen Stufen ohne Fehler und Runden enden', () => {
  for (const lvl of [0, 1, 2]) {
    const M = EC.newMatch({ chars: [CH, { id: 'c', sp: 'upper', stats: { power: 1.1 } }], target: 1, seed: lvl + 5, time: 60 }); const W = EC.newRound(M);
    for (let k = 0; k < 60 * 70 && W.phase !== 'end'; k++) EC.step(W, [EC.ai(W, 0, lvl), EC.ai(W, 1, 2)]);
    assert.strictEqual(W.phase, 'end'); assert.ok(W.f[0].hp < EC.HP || W.f[1].hp < EC.HP, 'es wurde gekämpft');
    for (const F of W.f) { assert.ok(Number.isFinite(F.x) && Number.isFinite(F.z) && F.y >= 0); }
  }
});
