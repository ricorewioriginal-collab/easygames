// 2048 Deluxe – Logik-Tests.  node --test deluxe-2048/tests/core.test.js
'use strict';
const test = require('node:test'), assert = require('node:assert');
const D = require('../js/core.js');
let id = 1000;
function board(G, rows) { G.cells = rows.flat().map(v => v ? { id: id++, v } : null); G.over = false; G.won = false; return G; }
const vals = G => { const r = []; for (let y = 0; y < G.n; y++) r.push(G.cells.slice(y * G.n, y * G.n + G.n).map(c => c ? c.v : 0)); return r; };
const noSpawn = G => { G.rs = 1; };

test('Neues Spiel: 2 Kacheln (2 oder 4), Größen 3–6', () => {
  for (const n of [3, 4, 5, 6]) { const G = D.newGame(n, 7); assert.strictEqual(G.cells.length, n * n); const t = G.cells.filter(Boolean); assert.strictEqual(t.length, 2); assert.ok(t.every(c => c.v === 2 || c.v === 4)); }
});

test('Schieben und Verschmelzen: jede Kachel nur einmal pro Zug, Punkte = Summe der neuen Kacheln', () => {
  const G = board(D.newGame(4, 1), [[2, 2, 2, 2], [4, 4, 8, 0], [2, 0, 2, 4], [0, 0, 0, 0]]); noSpawn(G);
  const r = D.move(G, 'left'); assert.ok(r);
  const v = vals(G);
  assert.deepStrictEqual(v[0].slice(0, 2), [4, 4]); assert.deepStrictEqual(v[1].slice(0, 2), [8, 8]); assert.deepStrictEqual(v[2].slice(0, 2), [4, 4]);
  assert.strictEqual(r.gain, 4 + 4 + 8 + 4); assert.strictEqual(G.score, 20); assert.strictEqual(r.merges.length, 4); assert.ok(r.spawn);
  // rechts: [2,2,2,0] -> [0,0,2,4]
  const H = board(D.newGame(4, 1), [[2, 2, 2, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]); D.move(H, 'right');
  assert.deepStrictEqual(vals(H)[0].slice(2), [2, 4]);
  // hoch/runter
  const U = board(D.newGame(4, 1), [[2, 0, 0, 0], [2, 0, 0, 0], [4, 0, 0, 0], [4, 0, 0, 0]]); D.move(U, 'up');
  assert.strictEqual(vals(U)[0][0], 4); assert.strictEqual(vals(U)[1][0], 8);
  const Dn = board(D.newGame(4, 1), [[8, 0, 0, 0], [0, 0, 0, 0], [8, 0, 0, 0], [16, 0, 0, 0]]); D.move(Dn, 'down');
  assert.strictEqual(vals(Dn)[3][0], 16); assert.strictEqual(vals(Dn)[2][0], 16);
});

test('Kein Zug, wenn sich nichts bewegt; keine neue Kachel', () => {
  const G = board(D.newGame(4, 1), [[2, 4, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]);
  assert.strictEqual(D.move(G, 'left'), null); assert.strictEqual(G.cells.filter(Boolean).length, 2); assert.strictEqual(G.moves, 0);
});

test('Spielende und Sieg', () => {
  const G = board(D.newGame(2, 1), [[2, 4], [8, 0]]); G.n = 2;
  G.cells = [{ id: 1, v: 2 }, { id: 2, v: 4 }, { id: 3, v: 8 }, null]; G.rs = 3;
  const r = D.move(G, 'left');
  // nach dem Zug ist das 2x2-Feld voll; ob es weitergeht, hängt von der neuen Kachel ab – canMove muss konsistent sein
  if (r) assert.strictEqual(!!r.over, !D.canMove(G));
  const W = board(D.newGame(4, 1), [[1024, 1024, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]);
  const w = D.move(W, 'left'); assert.ok(w.won); assert.ok(W.won); assert.strictEqual(D.maxTile(W), 2048);
  const F = board(D.newGame(4, 1), [[2, 4, 2, 4], [4, 2, 4, 2], [2, 4, 2, 4], [4, 2, 4, 2]]); assert.strictEqual(D.canMove(F), false);
});

test('Rückgängig stellt den Zustand samt Zufallsfolge wieder her; Hammer entfernt eine Kachel', () => {
  const G = D.newGame(4, 42), before = JSON.stringify(G.cells), sc = G.score;
  let r = null; for (const d of ['left', 'up', 'right', 'down']) { r = D.move(G, d); if (r) break; }
  assert.ok(r); const after = JSON.stringify(G.cells);
  assert.ok(D.undo(G)); assert.strictEqual(JSON.stringify(G.cells), before); assert.strictEqual(G.score, sc);
  // gleicher Zug nach Rückgängig ergibt die gleiche neue Kachel (kein Würfeln durch Rückgängig)
  for (const d of ['left', 'up', 'right', 'down']) { if (D.move(G, d)) break; }
  assert.strictEqual(JSON.stringify(G.cells), after);
  const n = G.cells.filter(Boolean).length, i = G.cells.findIndex(Boolean);
  assert.ok(D.smash(G, i)); assert.strictEqual(G.cells.filter(Boolean).length, n - 1); assert.ok(D.undo(G)); assert.strictEqual(G.cells.filter(Boolean).length, n);
});

test('Tagesaufgabe ist für alle gleich; Speichern/Laden', () => {
  const a = D.daily(new Date(2026, 9, 24)), b = D.daily(new Date(2026, 9, 24)), c = D.daily(new Date(2026, 9, 25));
  assert.strictEqual(a.seed, b.seed); assert.notStrictEqual(a.seed, c.seed);
  assert.strictEqual(JSON.stringify(D.newGame(4, a.seed).cells), JSON.stringify(D.newGame(4, b.seed).cells));
  const G = D.newGame(5, 9); D.move(G, 'left') || D.move(G, 'right'); const L = D.load(D.save(G));
  assert.strictEqual(L.n, 5); assert.strictEqual(JSON.stringify(L.cells), JSON.stringify(G.cells)); assert.strictEqual(L.score, G.score);
  assert.strictEqual(D.load('kaputt'), null);
});

test('Zufallsspieler: Spiel endet irgendwann, Punkte steigen, Zustand bleibt gültig', () => {
  const G = D.newGame(4, 5), dirs = ['left', 'down', 'right', 'up']; let k = 0;
  while (!G.over && k < 5000) { D.move(G, dirs[k % 4]) || D.move(G, dirs[(k + 1) % 4]) || D.move(G, dirs[(k + 2) % 4]) || D.move(G, dirs[(k + 3) % 4]); k++; }
  assert.ok(G.over); assert.ok(G.score > 100); assert.ok(G.cells.every(c => c && c.v >= 2));
  const ids = G.cells.map(c => c.id); assert.strictEqual(new Set(ids).size, ids.length);
});
