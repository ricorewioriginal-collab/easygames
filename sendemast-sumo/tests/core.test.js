// Sendemast-Sumo – Logik-Tests.  node --test sendemast-sumo/tests/core.test.js
'use strict';
const test = require('node:test'), assert = require('node:assert');
const SM = require('../js/core.js');
const players = (n, kind) => SM.FIGHTERS.slice(0, n).map(f => ({ fid: f.id, kind: kind || 'cpu', diff: 1 }));
function run(W, inputs, sec) { for (let k = 0; k < sec * 60 && W.phase !== 'end'; k++) { SM.step(W, inputs ? inputs(W) : W.f.map((f, i) => SM.ai(W, i, W.M.players[i].diff)), 1 / 60); W.ev.length = 0; } }

test('Kämpfer: 8 verschiedene mit Fantasie-Sendern, Arenen vollständig', () => {
  assert.strictEqual(SM.FIGHTERS.length, 8); assert.strictEqual(new Set(SM.FIGHTERS.map(f => f.id)).size, 8);
  for (const f of SM.FIGHTERS) for (const k of ['n', 'st', 'col', 'col2', 'ic', 'skin', 'hair', 'hs']) assert.ok(f[k], f.id + '.' + k);
  assert.strictEqual(SM.ARENAS.length, 5);
});

test('Countdown, dann Kampf; wer über den Rand geschoben wird, fällt und der Schubser bekommt den KO', () => {
  const M = SM.newMatch({ arena: 0, target: 2, seed: 1, players: players(2) }), W = SM.newRound(M), ev = [];
  assert.strictEqual(W.phase, 'count');
  for (let k = 0; k < 200; k++) { SM.step(W, [{}, {}], 1 / 60); ev.push(...W.ev); W.ev.length = 0; }
  assert.strictEqual(W.phase, 'fight'); assert.ok(ev.some(e => e.k === 'go'));
  const a = W.f[0], b = W.f[1]; a.x = 5.2; a.z = 0; b.x = 6.5; b.z = 0; a.dashCd = 0;
  for (let k = 0; k < 240 && W.phase !== 'end'; k++) { SM.step(W, [{ x: 1, z: 0, dash: k === 0 }, {}], 1 / 60); ev.push(...W.ev); W.ev.length = 0; }
  assert.ok(ev.some(e => e.k === 'fall' && e.i === 1 && e.by === 0), 'Sturz mit KO-Zuordnung');
  assert.strictEqual(W.phase, 'end'); assert.strictEqual(W.winner, 0); assert.strictEqual(M.players[0].wins, 1); assert.strictEqual(M.players[0].ko, 1);
});

test('Schubs ist stärker als normales Anrempeln, Schild dämpft', () => {
  const push = (dash, schild) => { const M = SM.newMatch({ arena: 0, players: players(2), seed: 2 }), W = SM.newRound(M); W.phase = 'fight'; W.t = 0;
    const a = W.f[0], b = W.f[1]; a.x = -1.5; a.z = 0; b.x = 0; b.z = 0; a.dashCd = 0; if (schild) b.pu.schild = 5;
    for (let k = 0; k < 30; k++) { SM.step(W, [{ x: 1, z: 0, dash: dash && k === 0 }, {}], 1 / 60); W.ev.length = 0; } return b.x; };
  assert.ok(push(true) > push(false) + .5, 'Schubs schiebt weiter'); assert.ok(push(true, true) < push(true) - .3, 'Schild dämpft');
});

test('Stampfer: in der Luft unantastbar, Druckwelle schiebt Nachbarn weg', () => {
  const M = SM.newMatch({ arena: 0, players: players(3), seed: 3 }), W = SM.newRound(M); W.phase = 'fight';
  const [a, b, c] = W.f; a.x = 0; a.z = 0; b.x = 1.4; b.z = 0; c.x = -1.4; c.z = 0; a.slamCd = 0;
  SM.step(W, [{ slam: true }, {}, {}], 1 / 60); assert.ok(a.slamT > 0 && a.y >= 0);
  for (let k = 0; k < 40; k++) { SM.step(W, [{}, {}, {}], 1 / 60); }
  assert.ok(b.x > 1.9 && c.x < -1.9, 'beide weggeschoben ' + b.x.toFixed(2) + ' ' + c.x.toFixed(2)); assert.strictEqual(M.players[0].slams, 1);
});

test('Plattform bröckelt nach Plan, Power-ups erscheinen und wirken', () => {
  const M = SM.newMatch({ arena: 0, players: players(2), seed: 4 }), W = SM.newRound(M); W.phase = 'fight';
  const still = () => [{}, {}]; W.f[0].x = 0; W.f[0].z = -1; W.f[1].x = 0; W.f[1].z = 1;
  run(W, still, SM.SHRINK_AT + SM.SHRINK_EVERY + 1);
  assert.strictEqual(W.ring, 2); assert.strictEqual(W.R, SM.RINGS[2]);
  W.pus = [{ type: 'mega', x: W.f[0].x, z: W.f[0].z, t: 0 }]; SM.step(W, still(), 1 / 60); SM.step(W, still(), 1 / 60);
  assert.ok(W.f[0].pu.mega > 0 && W.f[0].m > 1.5, 'Mega macht schwer');
});

test('Match: KI-Kämpfe enden, Gewinner hat die nötigen Siege; alle Arenen laufen ohne Fehler', () => {
  for (let a = 0; a < 5; a++) {
    const M = SM.newMatch({ arena: a, target: 2, seed: 10 + a, players: players(4) });
    for (let r = 0; r < 12 && !M.done; r++) { const W = SM.newRound(M); run(W, null, 200); assert.strictEqual(W.phase, 'end', 'Runde endet (Arena ' + a + ')'); for (const f of W.f) assert.ok(Number.isFinite(f.x) && Number.isFinite(f.z)); }
    assert.ok(M.done); assert.ok(M.players[M.winner].wins >= 2);
  }
});

test('Turnier: 5 Masten, Gegner werden stärker, Punkte für Siege und KOs', () => {
  const s0 = SM.tourStage(0, 'toni'), s4 = SM.tourStage(4, 'toni');
  assert.strictEqual(s0.players.length, 4); assert.ok(s0.players.every((p, i) => !i || p.fid !== 'toni'));
  assert.ok(s4.players.slice(1).every(p => p.diff === 2) && s0.players.slice(1).every(p => p.diff === 0));
  assert.notStrictEqual(s0.arena, s4.arena);
  const M = SM.newMatch(s0); M.players[0].wins = 2; M.players[0].ko = 3; M.done = true; M.winner = 0; M.stage = 0;
  assert.strictEqual(SM.tourPoints(M, 0), 2 * 250 + 3 * 100 + 500 + 300);
});
