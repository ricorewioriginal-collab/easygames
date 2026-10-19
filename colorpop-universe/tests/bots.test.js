'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const CPU = require('./load.js');
test('Bots: drei unterscheidbare, reproduzierbare Spielstärken', () => {
  const sum = { easy: 0, medium: 0, hard: 0 };
  for (let s = 1; s <= 8; s++) {
    const g = new CPU.Game({ board: CPU.modes.classicBoard(10, 10, 4, s), colors: 4 });
    for (const lv of Object.keys(sum)) {
      const a = CPU.bots.play(g, lv, s), b = CPU.bots.play(g, lv, s);
      assert.deepEqual(a.moves, b.moves, lv + ' reproduzierbar');
      const r = g.clone(); a.moves.forEach(i => assert.ok(r.move(i))); assert.equal(r.score, a.score, 'echte Punkte');
      sum[lv] += a.score;
    }
  }
  assert.ok(sum.hard > sum.medium && sum.medium > sum.easy, JSON.stringify(sum));
});
test('Hinweis zeigt eine legale Gruppe', () => {
  const g = new CPU.Game({ board: CPU.modes.classicBoard(8, 8, 4, 3), colors: 4 });
  const i = CPU.bots.hint(g); assert.ok(g.preview(i));
});
