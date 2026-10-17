// Royal Radio Match 3D – Prüft alle 200 Kampagnen- und 10 Bonuslevel: Aufbau, Vielfalt und gespeicherte Siegpfade.
//   node anmacha-radio-match/tests/levels.test.mjs
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
globalThis.window = globalThis;
require('../src/core/defs.js'); require('../src/core/rng.js');
const Engine = require('../src/core/engine.js');
require('../data/levels.js');
const { replay } = require('../tools/solver.js');
const SOL = require('./solutions.json');
const RRM = globalThis.RRM;

let n = 0;
const ok = (name, fn) => { fn(); n++; console.log('PASS ' + name); };
const L = RRM.LEVELS, B = RRM.BONUS;

ok('200 Kampagnenlevel mit fortlaufenden IDs', () => {
  assert.equal(L.length, 200);
  L.forEach((l, i) => assert.equal(l.id, i + 1));
});
ok('10 Bonuslevel B1–B10', () => { assert.equal(B.length, 10); B.forEach((b, i) => assert.equal(b.id, 'B' + (i + 1))); });
ok('Aufbau jedes Levels gültig (Maske, Ziele, Züge, Welt)', () => {
  const worlds = RRM.WORLDS.map(w => w.id);
  [...L, ...B].forEach(l => {
    assert.equal(l.mask.length, l.h, 'Maskenhöhe L' + l.id);
    l.mask.forEach(r => assert.equal(r.length, l.w, 'Maskenbreite L' + l.id));
    assert(l.goals.length >= 1, 'Ziel fehlt L' + l.id);
    assert(l.moves >= 8 && l.moves <= 99, 'Züge L' + l.id);
    assert(worlds.includes(l.world), 'Welt L' + l.id);
    new Engine(l, { events: false });   // wirft bei Fehlern (Hindernis auf Funkloch, kein Startbrett, Portalschleife)
  });
});
ok('Welten à 20 Level, jedes 10. Spezial, jedes 20. Welt-Finale (10 Boss-Level)', () => {
  L.forEach(l => {
    assert.equal(l.world, RRM.WORLDS[Math.floor((l.id - 1) / 20)].id);
    if (l.id % 20 === 0) { assert.equal(l.tag, 'final'); assert.equal(l.diff, 'boss'); }
    else if (l.id % 10 === 0) assert.equal(l.tag, 'special');
  });
  assert.equal(L.filter(l => l.diff === 'boss').length, 10);
});
ok('mindestens 60 verschiedene Brettformen', () => {
  const masks = new Set(L.map(l => l.mask.join('/')));
  assert(masks.size >= 60, 'nur ' + masks.size);
  console.log('     ' + masks.size + ' Brettformen');
});
ok('mindestens 15 Hindernisarten im Einsatz', () => {
  const t = new Set();
  L.forEach(l => {
    (l.blockers || []).forEach(b => t.add(b.t)); (l.covers || []).forEach(c => t.add(c.t));
    if ((l.noise || []).length) t.add('noise'); if (l.mask.some(r => r.includes('.'))) t.add('hole');
    if ((l.portals || []).length) t.add('portal'); if (l.spawn) t.add('cassette'); if ((l.items || []).length) t.add('parcel');
  });
  assert(t.size >= 15, [...t].join(','));
  console.log('     ' + t.size + ' Hindernisarten: ' + [...t].sort().join(', '));
});
ok('mindestens 12 Missionsarten', () => {
  const t = new Set();
  L.forEach(l => l.goals.forEach(g => t.add(g.type + (g.what ? ':' + g.what : ''))));
  assert(t.size >= 12, [...t].join(','));
  console.log('     ' + t.size + ' Missionsarten');
});
ok('kein Level hat doppelte Liefer-Ziele (die Engine zählt Lieferungen gemeinsam)', () => {
  [...L, ...B].forEach(l => { const k = l.goals.filter(g => g.type === 'deliver').map(g => g.what); assert.equal(new Set(k).size, k.length, 'L' + l.id); });
});
ok('jedes Level hat einen gespeicherten Siegpfad, der innerhalb der Züge gewinnt', () => {
  let tot = 0;
  [...L, ...B].forEach(l => {
    const steps = SOL[l.id];
    assert(steps && steps.length, 'kein Siegpfad L' + l.id);
    assert(steps.length <= l.moves, 'Siegpfad länger als Züge L' + l.id);
    const r = replay(l, steps);
    assert(r.won, 'Siegpfad gewinnt nicht L' + l.id + (r.error ? ' (' + r.error + ')' : ''));
    tot += steps.length;
  });
  console.log('     210 Siegpfade nachgespielt, Ø ' + (tot / 210).toFixed(1) + ' Züge');
});
ok('Engine ist deterministisch (gleicher Seed = gleiches Brett)', () => {
  [1, 57, 133, 200].forEach(id => assert.equal(new Engine(L[id - 1], { events: false }).hash(), new Engine(L[id - 1], { events: false }).hash()));
});

console.log(n + ' Level-Tests bestanden');
