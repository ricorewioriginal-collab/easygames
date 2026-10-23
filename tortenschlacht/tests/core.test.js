// Tortenschlacht – Logik-Tests.  node --test tortenschlacht/tests/
'use strict';
const test = require('node:test'), assert = require('node:assert');
const TS = require('../js/core.js');
const at = (g, pl, x, y) => { pl.x = x; pl.y = y; };
const run = (g, s) => { for (let i = 0; i < s * 60; i++) TS.step(g, 1 / 60); };
function person(g, type, layer, x) { const p = TS.spawn(g, type); p.layer = layer; p.g = TS.LAYERS[layer].g; p.x = x; p.v = 0; p.dir = 1; p.state = type === 'dj' || type === 'board' ? 'pop' : 'stand'; p.life = 99; p.up = 1; p.target = null; return p; }

test('Torte trifft Kopf doppelt, Combo steigt, Fehlwurf setzt Combo zurück', () => {
  const g = TS.newGame({ seed: 1, WW: 2, A: 2 }); g.spawnT = 99; const pl = g.players[0];
  const p = person(g, 'prak', 2, 1); const b = TS.body(p);
  at(g, pl, b.hx, b.hy); TS.fire(g, pl); run(g, .4);
  assert.strictEqual(p.state, 'flee'); assert.strictEqual(pl.score, TS.TYPES.prak.pts * 2); assert.strictEqual(pl.combo, 1);
  at(g, pl, .2, .1); TS.fire(g, pl); run(g, .4); assert.strictEqual(pl.combo, 0); assert.ok(g.splats.length === 1, 'Klecks bleibt kleben');
});

test('Spritze braucht drei Treffer, Magazin leer → automatisch nachladen', () => {
  const g = TS.newGame({ seed: 2, WW: 2, A: 2 }); g.spawnT = 99; const pl = g.players[0]; pl.weapon = 'spritze';
  const p = person(g, 'mod', 2, 1); const b = TS.body(p);
  at(g, pl, p.x, (b.by0 + b.by1) / 2);
  for (let i = 0; i < 2; i++) { TS.fire(g, pl); run(g, .2); }
  assert.notStrictEqual(p.state, 'flee'); TS.fire(g, pl); run(g, .2); assert.strictEqual(p.state, 'flee');
  pl.weapon = 'torte'; at(g, pl, .1, .1); for (let i = 0; i < 5; i++) { TS.fire(g, pl); run(g, .3); }
  assert.strictEqual(pl.ammo.torte, 0); assert.ok(pl.reload > 0 || pl.ammo.torte === 5);
  run(g, 1); assert.strictEqual(pl.ammo.torte, 5);
});

test('Vorne verdeckt hinten, DJ nur über dem Pult, Bombe trifft mehrere', () => {
  const g = TS.newGame({ seed: 3, WW: 2, A: 2 }); g.spawnT = 99; const pl = g.players[0];
  const back = person(g, 'prak', 1, 1), front = person(g, 'prak', 2, 1), bf = TS.body(front);
  at(g, pl, 1, (bf.by0 + bf.by1) / 2); TS.fire(g, pl); run(g, .4);
  assert.strictEqual(front.state, 'flee'); assert.notStrictEqual(back.state, 'flee');
  const dj = person(g, 'dj', 1, 1.6), bd = TS.body(dj);
  assert.strictEqual(TS.hitTest(dj, 1.6, bd.clip + .05, 0), 0, 'Pult schützt'); assert.ok(TS.hitTest(dj, 1.6, bd.hy, 0) === 2);
  const g2 = TS.newGame({ seed: 4, WW: 2, A: 2 }); g2.spawnT = 99; const q = g2.players[0];
  const a1 = person(g2, 'mod', 2, 1), a2 = person(g2, 'mod', 2, 1.1); q.bombs = 1; q.weapon = 'bombe'; const ba = TS.body(a1);
  at(g2, q, 1.05, (ba.by0 + ba.by1) / 2); TS.fire(g2, q); run(g2, .5);
  assert.strictEqual(a1.state, 'flee'); assert.strictEqual(a2.state, 'flee'); assert.strictEqual(q.weapon, 'torte');
});

test('Konditor wirft zurück: Abwehren gibt Punkte, sonst Sahne im Gesicht', () => {
  const g = TS.newGame({ seed: 5, WW: 2, A: 2 }); g.spawnT = 99; const pl = g.players[0];
  const k = person(g, 'kond', 2, 1); k.state = 'walk'; k.t = 1.3; run(g, 2.2);
  assert.strictEqual(g.pies.length, 1, 'Torte fliegt'); run(g, 1.2); assert.ok(pl.stun > 0, 'geblendet'); assert.ok(!TS.fire(g, pl), 'kein Wurf mit Sahne im Gesicht');
  const g2 = TS.newGame({ seed: 6, WW: 2, A: 2 }); g2.spawnT = 99; const q = g2.players[0];
  const k2 = person(g2, 'kond', 2, 1); k2.state = 'walk'; k2.t = 1.3; run(g2, 2.2); const pie = g2.pies[0]; run(g2, .4);
  at(g2, q, pie.x, pie.y); TS.fire(g2, q); run(g2, .3); assert.strictEqual(q.stun, 0); assert.ok(q.score >= 10, 'abgewehrt');
});

test('Schild gibt einmal +10 s, Zeit läuft ab, Figuren kommen nach, Ablauf ist reproduzierbar', () => {
  const g = TS.newGame({ seed: 7, solo: true }); const pl = g.players[0]; const t0 = g.t;
  at(g, pl, g.sign.x, g.sign.y); TS.fire(g, pl); run(g, .4); assert.ok(g.t > t0 + 9); TS.fire(g, pl); run(g, .4); assert.ok(g.t < t0 + 10.5, 'nur einmal');
  run(g, 30); assert.ok(g.people.length >= 4, 'Figuren: ' + g.people.length);
  const types = new Set(); const g3 = TS.newGame({ seed: 9, solo: true }); for (let i = 0; i < 60 * 80; i++) { TS.step(g3, 1 / 60); g3.people.forEach(p => types.add(p.type)); }
  assert.ok(['prak', 'mod', 'dj', 'tech', 'kond', 'board'].every(t => types.has(t)), [...types].join());
  run(g, 200); assert.ok(g.over); assert.ok(g.events.some(e => e.k === 'end'));
  const a = TS.newGame({ seed: 11 }), b = TS.newGame({ seed: 11 }); for (let i = 0; i < 600; i++) { TS.step(a, 1 / 60); TS.step(b, 1 / 60); }
  assert.deepStrictEqual(a.people.map(p => [p.type, p.x.toFixed(4)]), b.people.map(p => [p.type, p.x.toFixed(4)]));
});
