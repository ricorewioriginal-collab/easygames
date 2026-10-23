// Tortenschlacht – Logik-Tests.  node --test tortenschlacht/tests/core.test.js
'use strict';
const test = require('node:test'), assert = require('node:assert');
const TS = require('../js/core.js');
const at = (pl, x, y) => { pl.x = x; pl.y = y; };
const run = (g, s) => { for (let i = 0; i < s * 60; i++) TS.step(g, 1 / 60); };
function person(g, type, layer, x) { const p = TS.spawn(g, type, x); p.layer = layer; p.z = layer; p.gy = TS.LAYERS[layer].g; p.sc = TS.LAYERS[layer].s * TS.HMAN; p.x = x; p.v = 0; p.dir = 1; p.state = 'stand'; p.life = 99; p.up = 1; p.target = null; return p; }
const mid = p => { const b = TS.body(p); return [p.x, (b.by0 + b.by1) / 2]; };

test('Torte trifft sofort, Kopf zählt doppelt, Fehlwurf setzt Serie zurück und Sahne bleibt kleben', () => {
  const g = TS.newGame({ seed: 1, WW: 2, A: 2 }); g.spawnT = 99; const pl = g.players[0];
  const p = person(g, 'prak', 2, 1), b = TS.body(p);
  at(pl, b.hx, b.hy); TS.fire(g, pl);
  assert.strictEqual(p.state, 'hit', 'sofort getroffen, ohne Flugzeit'); assert.strictEqual(pl.score, TS.TYPES.prak.pts * 2); assert.strictEqual(pl.combo, 1);
  run(g, .2); at(pl, .2, .9); TS.fire(g, pl); assert.strictEqual(pl.combo, 0); assert.strictEqual(g.splats.length, 1); at(pl, .2, .05); run(g, .2); TS.fire(g, pl); assert.strictEqual(g.splats.length, 1, 'am Himmel bleibt nichts kleben');
});

test('Läufer werden auch bei schneller Bewegung getroffen (kein Vorhalten nötig)', () => {
  const g = TS.newGame({ seed: 2, WW: 3, A: 3 }); g.spawnT = 99; const pl = g.players[0];
  const p = person(g, 'bike', 1, 1); p.state = 'walk'; p.v = .7; run(g, .5);
  at(pl, ...mid(p)); TS.fire(g, pl); assert.strictEqual(p.state, 'hit');
});

test('Spritze braucht drei Treffer, Magazin leer → nachladen', () => {
  const g = TS.newGame({ seed: 3, WW: 2, A: 2 }); g.spawnT = 99; const pl = g.players[0]; pl.weapon = 'spritze';
  const p = person(g, 'mod', 2, 1); at(pl, ...mid(p));
  TS.fire(g, pl); run(g, .1); TS.fire(g, pl); run(g, .1); assert.strictEqual(p.state, 'stand'); TS.fire(g, pl); assert.strictEqual(p.state, 'hit');
  pl.weapon = 'torte'; run(g, .1); at(pl, .1, .02); for (let i = 0; i < 8; i++) { TS.fire(g, pl); run(g, .15); }
  assert.ok(pl.reload > 0 || pl.ammo.torte === 8); run(g, 1); assert.strictEqual(pl.ammo.torte, 8);
});

test('Vorn verdeckt hinten, DJ nur über dem Pult, Bombe trifft mehrere', () => {
  const g = TS.newGame({ seed: 4, WW: 2, A: 2 }); g.spawnT = 99; const pl = g.players[0];
  const back = person(g, 'prak', 1, 1), front = person(g, 'prak', 2, 1);
  at(pl, ...mid(front)); TS.fire(g, pl); assert.strictEqual(front.state, 'hit'); assert.strictEqual(back.state, 'stand');
  const dj = TS.spawn(g, 'dj'); dj.up = 1; const bd = TS.body(dj);
  assert.strictEqual(TS.hitTest(dj, dj.x, bd.clip + .05, 0), 0, 'Pult schützt'); assert.strictEqual(TS.hitTest(dj, dj.x, bd.hy, 0), 2);
  const g2 = TS.newGame({ seed: 5, WW: 2, A: 2 }); g2.spawnT = 99; const q = g2.players[0];
  const a1 = person(g2, 'mod', 2, 1), a2 = person(g2, 'mod', 2, 1.1); q.bombs = 1; q.weapon = 'bombe'; at(q, 1.05, mid(a1)[1]); TS.fire(g2, q);
  assert.strictEqual(a1.state, 'hit'); assert.strictEqual(a2.state, 'hit'); assert.strictEqual(q.weapon, 'torte');
});

test('Luftziele: Fallschirm, Ballon, Jetpack, Kanonenkugel, Flieger stürzen ab; Fenster, ganz nah', () => {
  for (const type of ['para', 'balloon', 'jet', 'cannon', 'plane']) {
    const g = TS.newGame({ seed: 6, WW: 2, A: 2, solo: true }); g.spawnT = 99; const pl = g.players[0];
    const p = TS.spawn(g, type, 1); run(g, .3); const b = TS.body(p);
    at(pl, p.x, type === 'plane' ? p.gy : (b.by0 + b.by1) / 2); TS.fire(g, pl);
    assert.strictEqual(p.state, 'drop', type + ' getroffen'); assert.ok(pl.score >= TS.TYPES[type].pts, type + ' Punkte'); run(g, 3); assert.ok(!g.people.includes(p), type + ' weg');
  }
  const g = TS.newGame({ seed: 7, WW: 2, A: 2, solo: true }); g.spawnT = 99; const pl = g.players[0];
  const win = g.stations.buildings[0].win[0]; at(pl, win.x + win.w / 2, win.y + win.h / 2); TS.fire(g, pl);
  const w = g.people.find(p => p.type === 'window'); assert.ok(w, 'Fenster anwerfen: jemand schaut raus'); run(g, .6); const bw = TS.body(w); at(pl, w.x, bw.hy); TS.fire(g, pl); assert.strictEqual(w.state, 'flee');
  const c = TS.spawn(g, 'close', 1); run(g, .5); const bc = TS.body(c); at(pl, c.x, bc.hy); TS.fire(g, pl); assert.strictEqual(c.state, 'flee');
});

test('Konditor wirft zurück: abwehren gibt Punkte, sonst Sahne im Gesicht', () => {
  const g = TS.newGame({ seed: 8, WW: 2, A: 2 }); g.spawnT = 99; const pl = g.players[0];
  const k = person(g, 'kond', 2, 1); k.state = 'walk'; k.t = 1.2; run(g, 2.1);
  assert.strictEqual(g.pies.length, 1, 'Torte fliegt'); run(g, 1.2); assert.ok(pl.stun > 0, 'geblendet'); assert.ok(!TS.fire(g, pl));
  const g2 = TS.newGame({ seed: 9, WW: 2, A: 2 }); g2.spawnT = 99; const q = g2.players[0];
  const k2 = person(g2, 'kond', 2, 1); k2.state = 'walk'; k2.t = 1.2; run(g2, 2.1); run(g2, .3); const pie = g2.pies[0];
  at(q, pie.x, pie.y); TS.fire(g2, q); run(g2, 1.5); assert.strictEqual(q.stun, 0); assert.ok(q.score >= 15);
});

test('Geheimnisse, Zeit, viel Betrieb, reproduzierbar', () => {
  const g = TS.newGame({ seed: 10, solo: true }); const pl = g.players[0]; const t0 = g.t;
  at(pl, g.sign.x, g.sign.y); TS.fire(g, pl); assert.ok(g.t > t0 + 9); TS.fire(g, pl); assert.ok(g.t < t0 + 10.5, 'nur einmal');
  const oa = g.stations.buildings[0].onair; at(pl, oa.x, oa.y); g.people.length = 0; run(g, .2); g.people.length = 0; TS.fire(g, pl); assert.ok(oa.hit, 'ON-AIR-Schild ist ein Geheimnis');
  run(g, 25); assert.ok(g.people.length >= 8, 'viel los: ' + g.people.length);
  const types = new Set(), g3 = TS.newGame({ seed: 11, solo: true }); for (let i = 0; i < 60 * 80; i++) { TS.step(g3, 1 / 60); g3.people.forEach(p => types.add(p.type)); }
  for (const t of ['prak', 'mod', 'bike', 'dj', 'window', 'tech', 'para', 'balloon', 'jet', 'cannon', 'plane', 'close', 'kond']) assert.ok(types.has(t), 'fehlt: ' + t);
  run(g, 200); assert.ok(g.over);
  const a = TS.newGame({ seed: 12 }), b = TS.newGame({ seed: 12 }); for (let i = 0; i < 600; i++) { TS.step(a, 1 / 60); TS.step(b, 1 / 60); }
  assert.deepStrictEqual(a.people.map(p => [p.type, p.x.toFixed(4)]), b.people.map(p => [p.type, p.x.toFixed(4)]));
});
