// Wortfunk – Logiktests:  node --test wortfunk/tests/
'use strict';
const test = require('node:test'), assert = require('node:assert');
const fs = require('fs'), path = require('path');
const WF = require('../js/logic.js');
const dict = WF.Dict(new Uint32Array(fs.readFileSync(path.join(__dirname, '../data/woerter.dawg')).buffer.slice(0)));
const T = s => WF.enc(s);

test('Wörterbuch kennt Grundformen, Beugungen und lehnt Unsinn ab', () => {
  for (const w of ['HAUS', 'HÄUSER', 'GING', 'SCHÖNSTEN', 'STRASSE', 'ÄRGER', 'QUIZ', 'JA', 'ZU', 'AXT']) assert.ok(dict.hasWord(w), w);
  for (const w of ['XQZ', 'HAUSS', 'A', 'BERLIN', 'ABCDE']) assert.ok(!dict.hasWord(w), w);
});

test('Steinbeutel: 104 Steine, Brett symmetrisch', () => {
  assert.strictEqual(WF.CNT.reduce((a, b) => a + b, 0), 104);
  for (let r = 0; r < 15; r++) for (let c = 0; c < 15; c++) {
    assert.strictEqual(WF.BONUS[r * 15 + c], WF.BONUS[(14 - r) * 15 + c]);
    assert.strictEqual(WF.BONUS[r * 15 + c], WF.BONUS[c * 15 + r]);
  }
  assert.strictEqual(WF.BONUS[WF.CENTER], 'ST');
});

test('Zugprüfung: Stern, Reihe, Lücken, Anschluss, Wertung', () => {
  const b = new Array(225).fill(0);
  const row = (r, c, w) => T(w).map((t, k) => ({ i: r * 15 + c + k, t }));
  assert.ok(!WF.evaluate(b, row(0, 0, 'HAUS'), dict).ok, 'nicht über Stern');
  const ev = WF.evaluate(b, row(7, 5, 'HAUS'), dict);
  assert.ok(ev.ok, ev.err);
  // H2 A1 U1 S1 = 5, Stern = Wort ×2 → 10
  assert.strictEqual(ev.score, 10);
  WF.evaluate(b, row(7, 5, 'HAUS'), dict).words.forEach(w => assert.ok(w.ok));
  row(7, 5, 'HAUS').forEach(x => { b[x.i] = x.t; });
  assert.ok(!WF.evaluate(b, row(0, 0, 'AXT'), dict).ok, 'ohne Anschluss');
  assert.ok(!WF.evaluate(b, [{ i: 8 * 15 + 5, t: T('A')[0] }, { i: 9 * 15 + 6, t: T('B')[0] }], dict).ok, 'nicht in einer Reihe');
  // senkrecht durch das H: HAUS -> H über… „HUT“ senkrecht ab H
  const v = WF.evaluate(b, [{ i: 8 * 15 + 5, t: T('U')[0] }, { i: 9 * 15 + 5, t: T('T')[0] }], dict);
  assert.ok(v.ok, v.err); assert.deepStrictEqual(v.words.map(w => w.w), ['HUT']);
  const bad = WF.evaluate(b, [{ i: 8 * 15 + 5, t: T('Q')[0] }], dict);
  assert.ok(!bad.ok && /Wörterbuch/.test(bad.err));
  // Joker zählt 0 Punkte
  const j = WF.evaluate(b, [{ i: 8 * 15 + 5, t: T('U')[0] | 32 }, { i: 9 * 15 + 5, t: T('T')[0] }], dict);
  assert.ok(j.ok); assert.strictEqual(j.score, v.score - WF.VAL[T('U')[0]] * WF.LM(WF.BONUS[8 * 15 + 5]) * WF.WM(WF.BONUS[9 * 15 + 5]) * WF.WM(WF.BONUS[8 * 15 + 5]));
});

test('Zuggenerator: jeder Zug ist gültig und die Punkte stimmen', () => {
  const st = WF.newGame(['A', 'B'], 12345);
  let checked = 0;
  for (let turn = 0; turn < 14 && !st.over; turn++) {
    const p = st.turn, moves = WF.generate(st.board, st.racks[p], dict);
    for (const m of moves.slice(0, 400)) {
      const ev = WF.evaluate(st.board, m.tiles, dict);
      assert.ok(ev.ok, ev.err + ' ' + JSON.stringify(m));
      assert.strictEqual(ev.score, m.score);
      checked++;
    }
    const m = WF.choose('schwer', moves, st.racks[p]);
    if (m) assert.ok(WF.play(st, p, m.tiles, dict).ok); else WF.pass(st, p);
  }
  assert.ok(checked > 500, 'genug Züge geprüft: ' + checked);
});

test('Ganze Partien mit 2–4 Computern laufen fehlerfrei zu Ende', () => {
  for (const [n, seed] of [[2, 1], [3, 2], [4, 3]]) {
    const st = WF.newGame(Array.from({ length: n }, (_, k) => 'P' + k), seed);
    const lv = ['schwer', 'mittel', 'leicht', 'mittel'];
    let guard = 0, tiles = 0;
    while (!st.over && guard++ < 400) {
      const p = st.turn, moves = WF.generate(st.board, st.racks[p], dict);
      const m = WF.choose(lv[p], moves, st.racks[p], WF.rng(guard));
      if (m) { const r = WF.play(st, p, m.tiles, dict); assert.ok(r.ok, r.err); }
      else if (st.bag.length >= 7) assert.ok(WF.exchange(st, p, WF.swapPick(st.racks[p])).ok);
      else WF.pass(st, p);
    }
    assert.ok(st.over, 'Partie endet');
    tiles = st.board.filter(Boolean).length + st.racks.reduce((s, r) => s + r.length, 0) + st.bag.length;
    assert.strictEqual(tiles, 104, 'keine Steine verloren');
  }
});

test('Tauschen und Passen beenden irgendwann die Partie', () => {
  const st = WF.newGame(['A', 'B'], 7);
  assert.ok(WF.exchange(st, 0, st.racks[0].slice(0, 3)).ok);
  assert.strictEqual(st.racks[0].length, 7);
  let k = 0; while (!st.over && k++ < 10) WF.pass(st, st.turn);
  assert.ok(st.over);
});
