// Darts-Arena 3D – Kern-Tests: node --test darts-arena/tests/core.test.js
const test = require('node:test'), assert = require('node:assert');
const D = require('../js/core.js');
const seq = s => { let x = s; return () => (x = (x * 16807) % 2147483647) / 2147483647; };
const at = code => { const t = D.parse(code), a = D.aimPoint(t.n, t.m); return D.hit(a.x, a.y); };
const play = (G, codes) => codes.map(c => D.throwDart(G, at(c)));
// Punktestand des Spielers am Zug setzen (auch für die Rückkehr bei Bust)
const setScore = (G, i, s) => { const p = G.players[i]; p.score = s; if (p.snap) p.snap.score = s; };

test('Board: Felder, Ringe und Reihenfolge nach Turniermaß', () => {
  assert.equal(D.hit(0, 0).code, 'DB'); assert.equal(D.hit(0, 10).code, 'SB'); assert.equal(D.hit(0, 103).code, 'T20');
  assert.equal(D.hit(0, 166).code, 'D20'); assert.equal(D.hit(0, 140).code, 'S20'); assert.equal(D.hit(0, 60).code, 'S20');
  assert.equal(D.hit(0, 175).n, 0); assert.ok(D.hit(0, 240).off); assert.equal(D.hit(103, 0).code, 'T6'); assert.equal(D.hit(-103, 0).code, 'T11');
  assert.equal(D.hit(0, -103).code, 'T3');
  D.ORDER.forEach(n => { for (const m of [1, 2, 3]) assert.equal(at((m === 3 ? 'T' : m === 2 ? 'D' : 'S') + n).code, (m === 3 ? 'T' : m === 2 ? 'D' : 'S') + n); });
  assert.equal(at('DB').v, 50); assert.equal(at('SB').v, 25);
});

test('Checkouts: 170 bis 2, keine Wege für Bogey-Zahlen', () => {
  assert.deepEqual(D.checkout(170), ['T20', 'T20', 'DB']); assert.deepEqual(D.checkout(40), ['D20']); assert.deepEqual(D.checkout(100), ['T20', 'D20']);
  for (const s of [169, 168, 166, 165, 163, 162, 159]) assert.equal(D.checkout(s), null, s + ' ist kein Finish');
  for (let s = 2; s <= 158; s++) { const c = D.checkout(s); assert.ok(c, s + ' hat ein Finish'); const tot = c.reduce((a, x) => { const p = D.parse(x); return a + p.n * p.m; }, 0); assert.equal(tot, s); assert.equal(D.parse(c[c.length - 1]).m, 2); }
  assert.equal(D.checkout(99, 1), null); assert.ok(D.checkout(60, 1, 'master')); assert.deepEqual(D.checkout(7, 1, 'single'), ['S7']);
});

test('501: Double-Out, Bust, Leg, Statistik', () => {
  const G = D.newGame('x01', [{ name: 'A' }, { name: 'B' }], { start: 501, legs: 2 });
  play(G, ['T20', 'T20', 'T20']); assert.equal(G.players[0].score, 321); assert.equal(G.players[0].n180, 1); D.nextTurn(G); assert.equal(G.cur, 1);
  setScore(G, 1, 32); play(G, ['S16', 'S8']); assert.equal(G.players[1].score, 8); const r = D.throwDart(G, at('S8')); assert.ok(r.bust); assert.equal(G.players[1].score, 32, 'Bust: zurück auf 32');
  D.nextTurn(G); setScore(G, 0, 40); const w = D.throwDart(G, at('D20')); assert.ok(w.legWon && !w.over); assert.equal(G.players[0].legs, 1); assert.equal(G.players[0].hiCo, 40);
  D.nextTurn(G); assert.equal(G.players[0].score, 501); assert.equal(G.cur, 1, 'Nächstes Leg: anderer Spieler beginnt');
  setScore(G, 1, 2); assert.ok(D.throwDart(G, at('S2')).bust, 'Finish nur mit Doppel'); D.nextTurn(G);
  setScore(G, 0, 50); const f = D.throwDart(G, at('DB')); assert.ok(f.over); assert.equal(G.winner.name, 'A');
  assert.ok(D.avg(G.players[0]) > 0);
});

test('Double-In und Master-/Single-Out', () => {
  const G = D.newGame('x01', [{ name: 'A' }], { start: 301, in: 'double' });
  play(G, ['T20', 'D10', 'T20']); assert.equal(G.players[0].score, 301 - 20 - 60);
  const M = D.newGame('x01', [{ name: 'A' }], { start: 301, out: 'master' }); M.players[0].score = 60; assert.ok(D.throwDart(M, at('T20')).over);
  const S = D.newGame('x01', [{ name: 'A' }], { start: 301, out: 'single' }); S.players[0].score = 1; assert.ok(D.throwDart(S, at('S1')).over);
});

test('Cricket: schließen, punkten, Cut-Throat', () => {
  const G = D.newGame('cricket', [{ name: 'A' }, { name: 'B' }], { variant: 'std' });
  play(G, ['T20', 'T20', 'S20']); assert.equal(G.players[0].marks[20], 3); assert.equal(G.players[0].score, 80);
  D.nextTurn(G); play(G, ['T20', 'D20', 'S19']); assert.equal(G.players[1].marks[20], 3); assert.equal(G.players[1].score, 0, 'nach dem Schließen durch beide keine Punkte');
  D.nextTurn(G); play(G, ['DB', 'SB', 'T19']); assert.equal(G.players[0].marks[25], 3);
  const C = D.newGame('cricket', [{ name: 'A' }, { name: 'B' }, { name: 'C' }], { variant: 'cut' });
  play(C, ['T18', 'T18', 'S1']); assert.equal(C.players[1].score, 54); assert.equal(C.players[2].score, 54); assert.equal(C.players[0].score, 0);
  // Sieg: alles zu und mindestens gleich viele Punkte
  const W = D.newGame('cricket', [{ name: 'A' }, { name: 'B' }], {}); D.CRICKET.forEach(n => { W.players[0].marks[n] = 3; }); W.players[0].marks[15] = 2;
  assert.ok(D.throwDart(W, at('S15')).over);
});

test('Elimination: Hochzählen bis 301, gleiche Punktzahl wirft raus, überwerfen', () => {
  const G = D.newGame('elimination', [{ name: 'A' }, { name: 'B' }], { target: 301 });
  play(G, ['T20', 'S20', 'S5']); assert.equal(G.players[0].score, 85); D.nextTurn(G);
  const r = play(G, ['T20', 'S20', 'S5']); assert.deepEqual(r[2].after.kicked, ['A']); assert.equal(G.players[0].score, 0, 'A muss wieder bei 0 anfangen');
  D.nextTurn(G); setScore(G, 0, 290); const b = play(G, ['S10', 'S5'])[1]; assert.ok(b.bust); assert.equal(G.players[0].score, 290);
  D.nextTurn(G); D.nextTurn(G); setScore(G, 0, 290); assert.ok(D.throwDart(G, at('S11')).over);
});

test('Around the Clock, Shanghai, Halve-It, Bob\'s 27, Count-Up', () => {
  const A = D.newGame('clock', [{ name: 'A' }], {}); play(A, ['S1', 'S2', 'S4']); assert.equal(A.players[0].next, 2);
  const S = D.newGame('shanghai', [{ name: 'A' }, { name: 'B' }], {}); play(S, ['S1', 'D1', 'T1']); assert.ok(S.over, 'Shanghai gewinnt sofort');
  const H = D.newGame('halveit', [{ name: 'A' }], {}); play(H, ['T15', 'S15', 'S1']); assert.equal(H.players[0].score, 60); D.nextTurn(H);
  play(H, ['S1', 'S1', 'S1']); assert.equal(H.players[0].score, 30, 'kein Treffer = halbiert'); D.nextTurn(H); assert.equal(H.round, 2);
  const B = D.newGame('bobs27', [{ name: 'A' }], {}); play(B, ['D1', 'D1', 'S1']); assert.equal(B.players[0].score, 31); D.nextTurn(B);
  play(B, ['S2', 'S2', 'S2']); assert.equal(B.players[0].score, 27);
  const U = D.newGame('countup', [{ name: 'A' }], { rounds: 2 }); play(U, ['T20', 'T20', 'T20']); D.nextTurn(U); play(U, ['T20', 'T20', 'T20']); assert.ok(D.nextTurn(U).over); assert.equal(U.players[0].score, 360);
});

test('Killer: Killer werden, Leben nehmen, letzter gewinnt', () => {
  const G = D.newGame('killer', [{ name: 'A' }, { name: 'B' }], { lives: 1 }, seq(3)); const [a, b] = G.players;
  D.throwDart(G, at('D' + b.num)); assert.equal(b.lives, 1, 'ohne Killer-Status kein Leben weg');
  D.throwDart(G, at('D' + a.num)); assert.ok(a.killer);
  const r = D.throwDart(G, at('D' + b.num)); assert.ok(b.out && r.over); assert.equal(G.winner, a);
});

test('Computer: alle Modi laufen durch, Profi wirft besser als Leicht', () => {
  for (const mode of Object.keys(D.MODES)) {
    if (mode === 'training') continue;
    for (const lvl of [0, 1, 2]) {
      const rnd = seq(7 + lvl), G = D.newGame(mode, [{ name: 'A', cpu: lvl }, { name: 'B', cpu: lvl }, { name: 'C', cpu: lvl }], { legs: 1 }, rnd);
      let n = 0; while (!G.over && n < 3000) { const t = D.cpuThrow(G, lvl, rnd); D.throwDart(G, t.hit); if (G.turnOver) D.nextTurn(G); n++; }
      assert.ok(G.over, mode + ' Stufe ' + lvl + ' endet (' + n + ' Darts)'); assert.ok(G.winner);
    }
  }
  const avgOf = lvl => { const rnd = seq(99 + lvl); let pts = 0, darts = 0; for (let i = 0; i < 300; i++) { const G = D.newGame('countup', [{ name: 'A' }], {}); const t = D.cpuThrow(G, lvl, rnd); pts += t.hit.v; darts++; } return pts / darts * 3; };
  const a = [0, 1, 2].map(avgOf); assert.ok(a[0] < a[1] && a[1] < a[2], 'Schnitt steigt mit der Stärke: ' + a.map(Math.round).join(' / '));
});
