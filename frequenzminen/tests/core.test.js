// Frequenz-Minen – Logik-Tests.  node --test frequenzminen/tests/core.test.js
'use strict';
const test = require('node:test'), assert = require('node:assert');
const FM = require('../js/core.js');
const count = (a, v) => a.reduce((s, x) => s + (x === v ? 1 : 0), 0);

test('Erster Klick ist sicher, Störsender-Anzahl stimmt, Zahlen passen', () => {
  for (let s = 1; s < 60; s++) {
    const b = FM.newBoard(9, 9, 10, s), c = (s * 7) % 81, r = FM.reveal(b, c);
    assert.notStrictEqual(r.res, 'boom'); assert.strictEqual(count(Array.from(b.mine), 1), 10);
    for (const n of FM.nb(b, c)) assert.strictEqual(b.mine[n], 0);
    for (let i = 0; i < 81; i++) assert.strictEqual(b.num[i], FM.nb(b, i).reduce((t, j) => t + b.mine[j], 0));
  }
});

test('Flutfüllung öffnet zusammenhängende Nullen samt Rand, nie einen Störsender', () => {
  const b = FM.newBoard(12, 12, 20, 42), r = FM.reveal(b, 66);
  assert.ok(r.opened.length >= 9); assert.strictEqual(r.opened.length, b.opened);
  for (const i of r.opened) { assert.strictEqual(b.mine[i], 0); assert.strictEqual(b.st[i], 1); }
  for (const i of r.opened) if (b.num[i] === 0) for (const n of FM.nb(b, i)) assert.strictEqual(b.st[n], 1);
});

test('Peiler setzen/entfernen, Zahl antippen (Chord) und Störsender treffen', () => {
  const b = FM.newBoard(9, 9, 10, 7); FM.reveal(b, 40);
  const num = Array.from(b.st).findIndex((s, i) => s === 1 && b.num[i] > 0);
  const ns = FM.nb(b, num), mines = ns.filter(n => b.mine[n]);
  assert.deepStrictEqual(FM.chord(b, num).res, 'noop');                     // noch keine Peiler
  for (const m of mines) assert.ok(FM.flag(b, m));
  assert.strictEqual(b.flags, mines.length);
  const before = b.opened, r = FM.chord(b, num);
  assert.ok(r.res === 'open' || r.res === 'win' || r.res === 'noop'); assert.ok(b.opened >= before);
  assert.ok(FM.flag(b, mines[0])); assert.strictEqual(b.st[mines[0]], 0);  // wieder weg
  assert.strictEqual(FM.flag(b, num), false);                              // offene Platte: kein Peiler
  const boom = FM.reveal(b, mines[0]); assert.strictEqual(boom.res, 'boom'); assert.ok(b.done && !b.won);
});

test('Alle freien Platten aufdecken gewinnt, Punkte mit Tempo-Bonus', () => {
  const b = FM.newBoard(9, 9, 10, 3); FM.reveal(b, 0);
  let last; for (let i = 0; i < 81; i++) if (!b.mine[i] && b.st[i] === 0) last = FM.reveal(b, i);
  assert.ok(b.won && b.done); assert.strictEqual(last.res, 'win'); assert.strictEqual(b.opened, 71);
  const fast = FM.points(b, 'leicht', 30), slow = FM.points(b, 'leicht', 500);
  assert.ok(fast > slow && slow >= 71); assert.strictEqual(fast, 71 + 500 + 90 * 5);
});

test('Peilung deckt nur sichere Platten auf und ist begrenzt', () => {
  const b = FM.newBoard(12, 12, 24, 9); assert.strictEqual(FM.hint(b), -1);  // vor dem ersten Klick nichts
  FM.reveal(b, 70);
  for (let k = 0; k < FM.HINTS; k++) { const i = FM.hint(b); assert.ok(i >= 0); assert.strictEqual(b.mine[i], 0); FM.reveal(b, i); }
  assert.strictEqual(FM.hint(b), -1); assert.strictEqual(b.hintsUsed, FM.HINTS);
});

test('Tagesrätsel ist für alle gleich und startet in der Mitte sicher', () => {
  const d = new Date(2026, 9, 24), a = FM.daily(d), c = FM.daily(d);
  FM.reveal(a.board, FM.dailyStart(a.board)); FM.reveal(c.board, FM.dailyStart(c.board));
  assert.deepStrictEqual(Array.from(a.board.mine), Array.from(c.board.mine)); assert.strictEqual(a.key, '2026-10-24');
  const o = FM.daily(new Date(2026, 9, 25)); FM.reveal(o.board, FM.dailyStart(o.board));
  assert.notDeepStrictEqual(Array.from(o.board.mine), Array.from(a.board.mine));
  assert.strictEqual(FM.fmt(125), '2:05');
});
