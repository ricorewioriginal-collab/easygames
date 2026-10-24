/* Lazarett: Patienten kommen, werden untersucht, behandelt und entlassen; Wartende sterben; Personal; Kräuterbeete. */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const PW = require('./load.js');
const G = PW.Game, WD = PW.Ward;

function run(S, sec) { for (let t = 0; t < sec; t += PW.TICK) G.tick(S, PW.TICK); }
function fresh(seed) { const S = G.newGame({ mode: 'free', seed, bots: 2, waves: false }); S.cfg.waves = false; S.pop.i += 6; S.res.herb = 200; S.res.med = 50; S.res.water = 300; S.res.wood = 300; S.res.food = 400; S.res.cloth = 50; return S; }

test('Ohne Heilstube kein Lazarett, mit Heilstube kommen Patienten', () => {
  const S = fresh('ward-a');
  assert.ok(WD.cap(S) > 0, 'Start hat eine Heilstube');
  run(S, 120);
  assert.ok(WD.state(S).list.length > 0, 'Patienten warten');
});

test('Untersuchen → Behandeln → Entlassen heilt einen Bewohner und belohnt', () => {
  const S = fresh('ward-b');
  const c = WD.spawn(S, true);
  assert.equal(WD.treat(S, c.id), false, 'ohne Untersuchung keine Behandlung');
  assert.equal(WD.exam(S, c.id), true);
  const cu = WD.cureOf(c), before = Object.assign({}, S.res);
  assert.equal(WD.treat(S, c.id), true);
  Object.keys(cu.cost).forEach(k => assert.ok(S.res[k] < before[k] + 1e-9, k + ' bezahlt'));
  for (let i = 0; i < 400 && c.st !== 'gesund'; i++) G.tick(S, 0.5);
  assert.equal(c.st, 'gesund');
  const sick = WD.sickN(S), coin = S.res.coin, cured = S.stats.wardCured || 0;
  assert.ok(WD.discharge(S, c.id));
  assert.equal(WD.sickN(S), sick - 1, 'ein Kranker weniger');
  assert.ok(S.res.coin > coin, 'Münzen als Dank');
  assert.equal(S.stats.wardCured, cured + 1);
  assert.equal(WD.state(S).list.indexOf(c), -1);
});

test('Leichte Fälle gehen unbehandelt heim, schwere sterben, wenn niemand kommt', () => {
  const T = fresh('ward-c2'), a = WD.spawn(T, true); a.sev = 1; a.hp = 5; const d0 = T.pop.dead;
  for (let i = 0; i < 200 && WD.state(T).list.indexOf(a) >= 0; i++) G.tick(T, 0.5);
  assert.equal(WD.state(T).list.indexOf(a), -1); assert.equal(T.pop.dead, d0, 'leichter Fall stirbt nicht');
  const S = fresh('ward-c');
  const c = WD.spawn(S, true); c.sev = 3; c.hp = 30;
  const dead = S.pop.dead;
  for (let i = 0; i < 400 && WD.state(S).list.indexOf(c) >= 0; i++) G.tick(S, 0.5);
  assert.equal(WD.state(S).list.indexOf(c), -1);
  assert.ok(S.pop.dead > dead);
});

test('Personal arbeitet von selbst', () => {
  const S = fresh('ward-d');
  const hs = S.city.b.find(b => b.t === 'heilstube'); hs.lv = 3; G.refresh(S);
  S.res.coin = 2000;
  ['empfang', 'pflege', 'trage'].forEach(k => assert.equal(WD.hire(S, k), true, k));
  const c = WD.spawn(S, true), cured = S.stats.wardCured || 0;
  for (let i = 0; i < 600 && WD.state(S).list.indexOf(c) >= 0; i++) G.tick(S, 0.5);
  assert.equal(WD.state(S).list.indexOf(c), -1);
  assert.ok((S.stats.wardCured || 0) > cured, 'vom Personal entlassen');
});

test('Kräuterbeete: säen, wachsen, ernten', () => {
  const S = fresh('ward-e');
  if (!WD.bedCount(S)) { const b = S.city.b.find(x => x.t === 'farm') || S.city.b[0]; S.city.b.push(Object.assign({}, b, { id: 9999, t: 'kraeuter', lv: 1, st: null, x: 5, y: 5 })); G.refresh(S); }
  assert.ok(WD.bedCount(S) > 0);
  assert.equal(WD.plant(S, 0, 'kraut'), true);
  assert.equal(WD.harvest(S, 0), null, 'noch nicht reif');
  run(S, 50);
  const herb = S.res.herb; const y = WD.harvest(S, 0);
  assert.ok(y && S.res.herb > herb);
});

test('Lazarett übersteht Speichern und Laden', () => {
  const S = fresh('ward-f'); WD.spawn(S, true); WD.exam(S, WD.state(S).list[0].id);
  const L = PW.Save.importText(PW.Save.exportText(S));
  assert.equal(L.ward.list.length, S.ward.list.length);
  assert.equal(L.ward.list[0].st, 'untersucht');
});
