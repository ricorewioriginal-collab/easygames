// Bowling-Bahn 3D – Kern-Tests: node --test bowling-bahn/tests/core.test.js
const test = require('node:test'), assert = require('node:assert');
const BW = require('../js/core.js');
const seq = s => { let x = s; return () => (x = (x * 16807) % 2147483647) / 2147483647; };

test('Zählweise: Perfektes Spiel, Spares, Rinne, 10. Frame', () => {
  assert.equal(BW.total(Array(12).fill(10)), 300);
  assert.equal(BW.total(Array(21).fill(5)), 150);
  assert.equal(BW.total(Array(20).fill(0)), 0);
  assert.equal(BW.total([9, 1, 10, 7, 2]), 48);
  const f = BW.frames([...Array(18).fill(0), 10, 7, 3]); assert.deepEqual(f[9].marks, ['X', '7', '/']); assert.equal(f[9].score, 20);
  const g = BW.frames([...Array(18).fill(0), 10, 10, 10]); assert.deepEqual(g[9].marks, ['X', 'X', 'X']); assert.equal(g[9].score, 30);
  const h = BW.frames([3, 7]); assert.equal(h[0].score, null); assert.deepEqual(h[0].marks, ['3', '/']);
  assert.equal(BW.running([3, 7, 4]), 18);
});

test('Spielablauf: Frames, Strike wechselt, 10. Frame mit Bonuswürfen, mehrere Spieler', () => {
  const G = BW.newGame([{ name: 'A' }, { name: 'B' }]);
  let r = BW.addRoll(G, 10); assert.ok(r.next && r.reset); assert.equal(G.cur, 1);
  r = BW.addRoll(G, 4); assert.ok(!r.next && !r.reset); assert.equal(G.cur, 1);
  r = BW.addRoll(G, 6); assert.ok(r.next); assert.equal(G.cur, 0);
  // bis zum 10. Frame: lauter Strikes für A, Nullen für B
  while (G.players[0].frame < 9) { BW.addRoll(G, 10); if (G.cur === 1) { BW.addRoll(G, 0); BW.addRoll(G, 0); } }
  assert.equal(G.cur, 0);
  r = BW.addRoll(G, 10); assert.ok(r.reset && !r.next);
  r = BW.addRoll(G, 3); assert.ok(!r.reset && !r.next);
  r = BW.addRoll(G, 7); assert.ok(r.next); assert.equal(BW.total(G.players[0].rolls), 283);
  assert.equal(G.players[0].done, true); assert.equal(G.over, false);
  r = BW.addRoll(G, 2); r = BW.addRoll(G, 3); assert.ok(r.over && G.over);
});

test('Physik: gerader Wurf auf den Kopfpin räumt ab, Rinnenkugel trifft nichts', () => {
  const L = BW.newLane(), R = BW.simulate(BW.clone(L), { x: 0, angle: 0, speed: 8, spin: 0 });
  assert.ok(R.pins.filter(p => p.down).length >= 5, 'mindestens 5 Kegel');
  const G2 = BW.simulate(BW.newLane(), { x: .45, angle: .06, speed: 8, spin: 0 });
  assert.ok(G2.ball.gutter); assert.equal(G2.pins.filter(p => p.down).length, 0);
});

test('Physik: Effet biegt die Kugel im trockenen Ende ab', () => {
  const run = spin => { const L = BW.newLane(); L.pins.forEach(p => { p.gone = true; }); BW.throwBall(L, { x: 0, angle: 0, speed: 8, spin }); while (L.ball.z < 9) BW.step(L, 1 / 60); const xo = L.ball.x; while (L.ball.z < BW.LANE_L) BW.step(L, 1 / 60); return [xo, L.ball.x]; };
  const [a0, a1] = run(1), [b0, b1] = run(-1), [c0, c1] = run(0);
  assert.ok(Math.abs(a0) < .01 && Math.abs(b0) < .01, 'auf dem Öl kaum Hook');
  assert.ok(a1 < -.2 && b1 > .2 && Math.abs(c1) < .01, 'Hook links/rechts: ' + a1.toFixed(2) + ' ' + b1.toFixed(2));
});

test('Abräumen: Zweiter Wurf hat nur die stehenden Kegel; gleiche Eingabe = gleiches Ergebnis', () => {
  const L = BW.newLane(); BW.simulate(L, { x: .2, angle: 0, speed: 8, spin: 0 }); const down = L.pins.filter(p => p.down || p.gone).map(p => p.n);
  BW.rack(L, true); assert.deepEqual(L.pins.filter(p => p.down || p.gone).map(p => p.n), down); assert.equal(BW.standing(L), 10 - down.length);
  const a = BW.simulate(BW.newLane(), { x: .1, angle: -.01, speed: 7.5, spin: .6 }), b = BW.simulate(BW.newLane(), { x: .1, angle: -.01, speed: 7.5, spin: .6 });
  assert.deepEqual(a.pins.map(p => [p.x, p.z, p.down]), b.pins.map(p => [p.x, p.z, p.down]));
});

test('Computer: Profi wirft viele Strikes, Leicht spielt schwächer, ganzes Spiel endet', () => {
  const play = lvl => { const rnd = seq(7 + lvl), G = BW.newGame([{ name: 'CPU' }]); let L = BW.newLane(), n = 0;
    while (!G.over && n < 30) { const before = L.pins.filter(p => p.down || p.gone).length; BW.simulate(L, BW.ai(L, lvl, rnd)); const now = L.pins.filter(p => p.down || p.gone).length; const r = BW.addRoll(G, now - before); if (r.reset) BW.rack(L, false); else BW.rack(L, true); n++; }
    assert.ok(G.over, 'Spiel endet'); return BW.total(G.players[0].rolls); };
  const pro = play(2), easy = play(0); console.log('Profi', pro, 'Leicht', easy);
  assert.ok(pro >= 150, 'Profi ' + pro); assert.ok(easy < pro + 40, 'Leicht ' + easy);
});
