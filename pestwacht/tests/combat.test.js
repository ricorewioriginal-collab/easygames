/* Kampf: Schlachten, Wellen mit 5 Feindarten und 3 Bossen, Zielwahl der Türme, Weltkarte und Expeditionen. */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const PW = require('./load.js');
const G = PW.Game, BT = PW.Battle, WV = PW.Waves, W = PW.World, M = PW.March;

function run(S, sec) { for (let t = 0; t < sec; t += PW.TICK) G.tick(S, PW.TICK); }

test('5 Feindarten und 3 Bosse', () => {
  assert.equal(Object.keys(PW.ENEMIES).length, 5);
  assert.equal(Object.keys(PW.BOSSES).length, 3);
  assert.ok(PW.UNIT_IDS.length >= 6);
});

test('Schlacht: die klar stärkere Seite gewinnt, Ergebnis ist vollständig', () => {
  const b = BT.make({ seed: 1, att: { units: { spear: 60, bow: 40, rider: 20 } }, def: { units: { spear: 10 } } });
  BT.run(b);
  assert.equal(b.done, true); assert.equal(b.win, 0);
  const r = BT.result(b);
  assert.equal(r.sides.length, 2); assert.ok(r.t > 0);
  const m = BT.make({ seed: 2, att: { units: { spear: 5 } }, def: { mon: { gaenger: 40 }, boss: 'hauptmann' } });
  BT.run(m); assert.equal(m.win, 1, 'gegen eine Übermacht mit Boss verliert der Angreifer');
});

test('Schlacht ist reproduzierbar (gleicher Startwert, gleiches Ergebnis)', () => {
  const mk = () => { const b = BT.make({ seed: 'gleich', att: { units: { spear: 30, bow: 20 } }, def: { units: { spear: 25, bow: 25 } } }); BT.run(b); return JSON.stringify(BT.result(b)); };
  assert.equal(mk(), mk());
});

test('Mauer: Fernkampf hinter der Mauer, Rammbock beschädigt sie', () => {
  const b = BT.make({ seed: 3, att: { units: { ram: 6, spear: 40 } }, def: { units: { bow: 20 } }, siege: { wall: 800, towers: 10 } });
  for (let i = 0; i < 300 && !b.done; i++) BT.step(b, 0.2);
  assert.ok(b.wall < 800, 'Mauer hat Schaden genommen');
});

test('Wellen: Feindarten wachsen mit der Wellennummer, jeder Boss erscheint', () => {
  const S = G.newGame({ mode: 'free', seed: 'wellen', bots: 2 });
  const t1 = new Set(WV.compose(S, 1).q.map(e => e.type)), t5 = new Set(WV.compose(S, 6).q.map(e => e.type));
  assert.ok(t5.size > t1.size, 'spätere Wellen mischen mehr Feindarten');
  Object.keys(PW.BOSSES).forEach(k => { const c = WV.compose(S, 5, k); assert.ok(c.q.some(e => e.boss && e.type === k), k); });
});

test('Welle läuft durch: Türme treffen, Welle endet mit Sieg oder Niederlage', () => {
  const S = G.newGame({ mode: 'free', seed: 'welle-lauf', bots: 2 });
  WV.start(S, {});
  let shots = 0;
  for (let i = 0; i < 4000 && S.waves.active; i++) { G.tick(S, 0.5); if (S.waves.active) shots += S.waves.active.proj.length; }
  assert.equal(S.waves.active, null, 'Welle ist beendet');
  assert.ok(shots > 0, 'Türme haben geschossen');
});

test('Türme: Balliste zielt auf den stärksten Gegner, Pfeilturm auf den am weitesten vorgedrungenen', () => {
  const a = { en: [{ hp: 20, x: 1, y: 0, prog: 5 }, { hp: 400, x: 4, y: 0, prog: 2, boss: 1 }, { hp: 60, x: 3, y: 0, prog: 9 }] };
  const tw = { x: 0, y: 0 };
  assert.equal(WV.pickTarget(a, tw, { range: 10, kind: 'bolzen' }), a.en[1]);
  assert.equal(WV.pickTarget(a, tw, { range: 10, kind: 'pfeil' }), a.en[2]);
  assert.equal(WV.pickTarget(a, tw, { range: 0.5, kind: 'pfeil' }), null, 'außer Reichweite: kein Ziel');
});

test('Weltkarte: alle Hauptstädte sind erreichbar, Nebel lichtet sich nur beim Erkunden', () => {
  const S = G.newGame({ mode: 'free', seed: 'karte', bots: 8 });
  const cap = S.world.caps[0];
  S.world.caps.forEach(c => assert.ok(W.path(S.world, cap, c), 'Weg zur Hauptstadt ' + c));
  const seen0 = S.fog.split('').filter(x => x === '1').length;
  assert.ok(seen0 > 0 && seen0 < S.fog.length, 'zu Beginn ist nur ein Teil sichtbar');
  const far = S.world.caps[S.world.caps.length - 1];
  const r = M.send(S, { target: far, mission: 'scout', units: { spear: 2 }, heroes: [], formation: 'ausgewogen' });
  assert.equal(r.ok, true, r.why);
  run(S, 1200);
  assert.ok(S.fog.split('').filter(x => x === '1').length > seen0, 'Erkundung deckt Felder auf');
});
