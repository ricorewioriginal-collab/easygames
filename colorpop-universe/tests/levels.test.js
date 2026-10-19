'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const CPU = require('./load.js');
const validate = require('../tools/validate-levels.js');

test('300 Level, IDs 1..300 lückenlos, 12 Welten je 25', () => {
  assert.equal(CPU.LEVELS.length, 300);
  CPU.LEVELS.forEach((l, i) => assert.equal(l.id, i + 1));
  for (let w = 1; w <= 12; w++) assert.equal(CPU.LEVELS.filter(l => l.world === w).length, 25);
  assert.equal(CPU.WORLDS.length, 12);
  assert.equal(new Set(CPU.WORLDS.map(w => w.name)).size, 12);
});
test('Schema aller Level gültig', () => {
  const errs = CPU.LEVELS.flatMap(l => CPU.levels.check(l));
  assert.deepEqual(errs, []);
});
test('Zertifikate: jedes Level ohne Booster lösbar, Ziel + 3 Sterne erreichbar, Bretter verschieden', () => {
  const r = validate({ write: false });
  assert.deepEqual(r.errors, []);
  assert.equal(r.summary.valid, 300);
  assert.equal(r.summary.puzzles, 30);
  assert.ok(r.levels.slice(0, 25).every(l => l.solvableWithoutBoosters), 'Welt 1 garantiert lösbar');
});
test('Welten haben unterschiedliche Mechaniken und Zieltypen', () => {
  const mech = w => new Set(CPU.LEVELS.filter(l => l.world === w).flatMap(l => CPU.levels.mechanics(l)));
  assert.equal(mech(1).size, 0, 'Welt 1 klassisch');
  assert.ok(mech(2).has('marks')); assert.ok(mech(3).has('wind') && mech(3).has('void') && mech(3).has('gravity'));
  assert.ok(mech(4).has('item') && mech(4).has('wood')); assert.ok(mech(5).has('ice') && mech(5).has('chain'));
  assert.ok(mech(6).has('rock') && mech(6).has('bomb')); assert.ok(mech(7).has('neon') && mech(7).has('rocket'));
  assert.ok(mech(8).has('anchor')); assert.ok(mech(9).has('conveyor')); assert.ok(mech(10).has('portal'));
  assert.ok(mech(11).has('rainbow')); assert.ok(mech(12).has('prism'));
  const types = new Set(CPU.LEVELS.flatMap(l => l.goals.map(g => g.t)));
  ['clear', 'leave', 'score', 'color', 'items', 'ice', 'blocks', 'marks', 'groups'].forEach(t => assert.ok(types.has(t), t));
  assert.ok(CPU.LEVELS.some(l => l.moves), 'Zuglimit-Level vorhanden');
  assert.ok(CPU.LEVELS.some(l => l.goals.length >= 2), 'Kombinationsziele vorhanden');
  assert.ok(CPU.LEVELS.filter(l => l.challenge).length === 12, 'eine feste Herausforderung je Welt');
  assert.equal(CPU.LEVELS[299].goals.length, 3, 'Finale mit drei Teilzielen');
});
test('Puzzle-Labor: 30 Rätsel, nachweislich leerbar (vollständige Suche)', () => {
  assert.equal(CPU.PUZZLES.length, 30);
  CPU.PUZZLES.forEach(p => assert.ok(p.min >= 4));
});
