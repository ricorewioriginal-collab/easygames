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

test('Belagerung: Ziel-Fokus hält Nahkampf und Rammen nicht von der Mauer ab', () => {
  const b = BT.make({ seed: 4, att: { units: { spear: 100, ram: 20 } }, def: { units: { bow: 1 } }, siege: { wall: 600, towers: 0 } });
  b.focus[0] = b.sq.findIndex(q => q.s === 1 && q.n > 0);
  for (let i = 0; i < 300 && !b.done; i++) BT.step(b, 0.2);
  assert.ok(b.wall < 600, 'Mauer nimmt trotz Fokus Schaden');
});

test('Rückruf einer Karawane bringt die unverkaufte Ware heim', () => {
  const S = G.newGame({ mode: 'free', seed: 'karawane', bots: 3 });
  const cap = S.world.caps[0], far = W.within(S.world, cap, 4).find(t => t !== cap && W.dist(S.world, cap, t) >= 3 && W.path(S.world, cap, t));
  S.res.wood = 50;
  const a = M.create(S, { owner: 'P', units: {}, target: far, mission: 'trade', cargo: { wood: 100 } });
  assert.ok(a && a.cargo);
  run(S, 5); M.recall(S, a.id);
  for (let i = 0; i < 4000 && S.marches.indexOf(a) >= 0; i++) G.tick(S, 0.5);
  assert.equal(S.marches.indexOf(a), -1, 'Karawane ist zurück');
  assert.ok(S.res.wood >= 140, 'Holz zurück: ' + S.res.wood);
});

test('Aufgeriebene Expedition: Verwundete kommen trotzdem ins Lazarett', () => {
  const S = G.newGame({ mode: 'free', seed: 'verwundet', bots: 3 });
  const cap = S.world.caps[0], s = S.world.sites.find(x => x.gar && !x.cleared && x.tile != null && W.path(S.world, cap, x.tile));
  s.gar = { mon: { gaenger: 80, bestie: 4 } };
  S.troops.spear = 20; S.cfg.watchBattles = false;
  const w0 = S.wounded.spear || 0;
  const r = M.send(S, { target: s.tile, mission: 'occupy', units: { spear: 20 }, heroes: [], formation: 'ausgewogen' });
  assert.equal(r.ok, true, r.why);
  for (let i = 0; i < 6000 && S.marches.indexOf(r.a) >= 0; i++) G.tick(S, 0.5);
  assert.equal(S.marches.indexOf(r.a), -1);
  assert.ok((S.wounded.spear || 0) > w0, 'Verwundete im Lazarett: ' + S.wounded.spear);
});

test('Eroberung: neuer Sitz zählt als Hauptstadt, Kampagnen-Ort gibt sein Flag auch nach Bot-Besetzung', () => {
  const S = G.newGame({ mode: 'free', seed: 'sitz', bots: 3 });
  const f = S.factions[0], other = W.tilesOf(S, f.id).find(t => t !== f.cap);
  assert.ok(other != null);
  f.cap = other;                                   // Hauptstadt wurde schon einmal verlegt
  W.tilesOf(S, f.id).forEach(t => { if (t !== other) S.world.tiles[t].own = null; });
  PW.Conquest.capture(S, { owner: 'P', units: { spear: 50 }, heroes: [], mission: 'occupy' }, other, {});
  assert.equal(f.alive, false, 'letzter Sitz gefallen: Fraktion zerfällt');
  const s = S.world.sites.find(x => x.tile != null && x.type !== 'capital');
  s.story = 'test_flag'; s.cleared = true; s.gar = null; S.world.tiles[s.tile].own = S.factions[1].id;
  PW.Conquest.capture(S, { owner: 'P', units: { spear: 50 }, heroes: [], mission: 'occupy' }, s.tile, {});
  assert.equal(S.storyFlags.test_flag, 1);
});
