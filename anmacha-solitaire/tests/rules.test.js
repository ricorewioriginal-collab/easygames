// AnMaCha Solitaire – Regeltests:  node --test anmacha-solitaire/tests/
'use strict';
const test = require('node:test'), assert = require('node:assert'), fs = require('fs'), path = require('path');
const AS = require('../js/rules.js');
const count = st => st.t.flat().length + st.f.flat().length + st.stock.length + st.waste.length + (st.cells || []).filter(Boolean).length;

test('Austeilen: Kartenzahl, Startwert reproduzierbar', () => {
  const k = AS.deal('klondike', { draw: 1 }, 5);
  assert.deepStrictEqual(k.t.map(p => p.length), [1, 2, 3, 4, 5, 6, 7]); assert.strictEqual(k.stock.length, 24);
  assert.ok(k.t.every(p => p[p.length - 1].up && p.slice(0, -1).every(c => !c.up)));
  assert.deepStrictEqual(AS.deal('klondike', { draw: 1 }, 5), k);
  const s = AS.deal('spider', { suits: 2 }, 5);
  assert.strictEqual(count(s), 104); assert.strictEqual(s.stock.length, 50); assert.deepStrictEqual([...new Set(s.t.flat().concat(s.stock).map(c => c.s))].sort(), [0, 1]);
  const f = AS.deal('freecell', {}, 5); assert.strictEqual(count(f), 52); assert.ok(f.t.flat().every(c => c.up));
});

test('Patience-Regeln: rot auf schwarz, König in leere Spalte, Ablage ab Ass', () => {
  const st = AS.deal('klondike', { draw: 1 }, 1);
  st.t = [[{ id: 1, s: 0, r: 8, up: true }], [{ id: 2, s: 1, r: 7, up: true }], [{ id: 3, s: 3, r: 7, up: true }], [], [{ id: 4, s: 2, r: 1, up: true }], [{ id: 8, s: 3, r: 9, up: false }, { id: 5, s: 2, r: 13, up: true }], [{ id: 6, s: 0, r: 2, up: false }, { id: 7, s: 2, r: 2, up: true }]];
  assert.ok(AS.legal(st, { from: { k: 't', i: 1, n: 0 }, to: { k: 't', i: 0 } }), '♥7 auf ♠8');
  assert.ok(!AS.legal(st, { from: { k: 't', i: 2, n: 0 }, to: { k: 't', i: 0 } }), '♣7 nicht auf ♠8');
  assert.ok(!AS.legal(st, { from: { k: 't', i: 1, n: 0 }, to: { k: 't', i: 3 } }), 'nur König in leere Spalte');
  assert.ok(AS.legal(st, { from: { k: 't', i: 5, n: 1 }, to: { k: 't', i: 3 } }), 'König in leere Spalte');
  assert.ok(!AS.legal(st, { from: { k: 't', i: 3, n: 0 }, to: { k: 't', i: 3 } }), 'nicht auf sich selbst');
  assert.ok(AS.apply(st, { from: { k: 't', i: 4, n: 0 }, to: { k: 'f', i: 0 } }));
  assert.ok(AS.apply(st, { from: { k: 't', i: 6, n: 1 }, to: { k: 'f', i: 0 } }), '♦2 auf ♦A');
  assert.ok(st.t[6][0].up, 'verdeckte Karte wird aufgedeckt');
});

test('Patience: Ziehen 1/3 und Stapel zurücklegen', () => {
  for (const draw of [1, 3]) {
    const st = AS.deal('klondike', { draw }, 9); let n = 0;
    while (st.stock.length) { AS.draw(st); n++; }
    assert.strictEqual(n, Math.ceil(24 / draw)); assert.strictEqual(st.waste.length, 24);
    AS.draw(st); assert.strictEqual(st.stock.length, 24); assert.ok(st.stock.every(c => !c.up));
  }
});

test('FreeCell: Zellen und Grenze für Mehrfach-Züge', () => {
  const st = AS.deal('freecell', {}, 3);
  assert.strictEqual(AS.freeCellMax(st, false), 5);
  const m = { from: { k: 't', i: 0, n: st.t[0].length - 1 }, to: { k: 'c', i: 0 } };
  assert.ok(AS.apply(st, m)); assert.ok(st.cells[0]); assert.strictEqual(AS.freeCellMax(st, false), 4);
});

test('Spider: fertige Reihe wird abgelegt, Austeilen nur ohne leere Spalte', () => {
  const st = AS.deal('spider', { suits: 1 }, 2);
  st.t[0] = []; for (let r = 13; r >= 2; r--) st.t[0].push({ id: 1000 + r, s: 0, r, up: true });
  st.t[1].push({ id: 2000, s: 0, r: 1, up: true });
  assert.ok(AS.apply(st, { from: { k: 't', i: 1, n: st.t[1].length - 1 }, to: { k: 't', i: 0 } }));
  assert.strictEqual(st.done, 1); assert.strictEqual(st.t[0].length, 0);
  assert.ok(!AS.canDraw(st), 'leere Spalte verhindert Austeilen');
});

test('Patience-Löser löst eine Partie, die dann wirklich gewonnen ist; lösbar-Liste vorhanden', () => {
  const file = path.join(__dirname, '../data/loesbar.json');
  assert.ok(fs.existsSync(file), 'data/loesbar.json fehlt');
  const j = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert.ok(j.d1.length >= 100 && j.d3.length >= 100, 'genug lösbare Partien: ' + j.d1.length + '/' + j.d3.length);
  const r = AS.solveKlondike(AS.deal('klondike', { draw: 1 }, j.d1[0]), 60000); assert.ok(r.ok);
});

test('Automatisch fertig spielen und Tipps führen zu gültigen Zügen', () => {
  // zufällig mit Tipps spielen: jeder Tipp ist ein legaler Zug, keine Karte geht verloren
  for (const [g, opt] of [['klondike', { draw: 1 }], ['spider', { suits: 1 }], ['freecell', {}]]) {
    const st = AS.deal(g, opt, 77), total = count(st);
    for (let k = 0; k < 150 && !st.won; k++) {
      const a = AS.safeAuto(st); if (a) { assert.ok(AS.apply(st, a)); continue; }
      const h = AS.hint(st); if (!h) break;
      if (h.draw) assert.ok(AS.draw(st)); else assert.ok(AS.apply(st, h), JSON.stringify(h));
      assert.strictEqual(count(st), total);
    }
  }
  const st = AS.deal('freecell', {}, 1); st.t = st.t.map(() => []); st.cells = [null, null, null, null];
  st.f = [0, 1, 2, 3].map(s => Array.from({ length: 12 }, (_, k) => ({ id: s * 20 + k, s, r: k + 1, up: true })));
  st.t[0] = [0, 1, 2, 3].map(s => ({ id: 900 + s, s, r: 13, up: true }));
  st.t[0] = [st.t[0][0]]; st.t[1] = [{ id: 901, s: 1, r: 13, up: true }]; st.t[2] = [{ id: 902, s: 2, r: 13, up: true }]; st.t[3] = [{ id: 903, s: 3, r: 13, up: true }];
  assert.ok(AS.canFinish(st));
  let m; while ((m = AS.finishStep(st))) AS.apply(st, m);
  assert.ok(st.won);
});
