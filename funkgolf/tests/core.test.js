// Funk-Minigolf – Tests: jede Bahn ist lösbar, Physik bleibt in der Bahn.  node --test funkgolf/tests/
'use strict';
const test = require('node:test'), assert = require('node:assert');
const FG = require('../js/core.js');

// Weglänge zum Loch auf einem Raster (um Wände und Wasser herum)
function field(h, target) {
  target = target || h.cup;
  const xs = h.bounds.flat().map(p => p[0]), zs = h.bounds.flat().map(p => p[1]), g = .1;
  const x0 = Math.min(...xs), z0 = Math.min(...zs), W = Math.ceil((Math.max(...xs) - x0) / g) + 1, D = Math.ceil((Math.max(...zs) - z0) / g) + 1;
  const segs = FG.segsOf(h), ok = new Uint8Array(W * D), dist = new Float32Array(W * D).fill(1e9);
  const near = (x, z) => segs.some(([a, c]) => { const dx = c[0] - a[0], dz = c[1] - a[1], l2 = dx * dx + dz * dz; let t = ((x - a[0]) * dx + (z - a[1]) * dz) / l2; t = Math.max(0, Math.min(1, t)); return Math.hypot(x - a[0] - t * dx, z - a[1] - t * dz) < FG.BALL + .05; });
  for (let i = 0; i < W; i++) for (let j = 0; j < D; j++) { const x = x0 + i * g, z = z0 + j * g; ok[i + j * W] = FG.inAny(h.bounds, x, z) && !(FG.inAny(h.water, x, z) && !FG.inAny(h.island ? [h.island] : null, x, z)) && !near(x, z) && !(h.bumpers || []).some(([bx, bz, r]) => Math.hypot(x - bx, z - bz) < r + FG.BALL) ? 1 : 0; }
  const ci = Math.round((target[0] - x0) / g), cj = Math.round((target[1] - z0) / g), q = [ci + cj * W]; dist[q[0]] = 0;
  while (q.length) { const k = q.shift(), i = k % W, j = (k / W) | 0; for (const [di, dj, c] of [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.41], [1, -1, 1.41], [-1, 1, 1.41], [-1, -1, 1.41]]) { const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= W || b >= D) continue; const n = a + b * W; if (!ok[n] || dist[n] <= dist[k] + c * g) continue; dist[n] = dist[k] + c * g; q.push(n); } }
  return (x, z) => { const i = Math.round((x - x0) / g), j = Math.round((z - z0) / g); return i < 0 || j < 0 || i >= W || j >= D ? 1e9 : dist[i + j * W]; };
}

test('18 Bahnen, Gesamt-Par sinnvoll, Abschlag und Loch liegen in der Bahn', () => {
  assert.strictEqual(FG.HOLES.length, 18);
  assert.ok(FG.totalPar() >= 50 && FG.totalPar() <= 60, 'Par ' + FG.totalPar());
  for (const h of FG.HOLES) { assert.ok(FG.inAny(h.bounds, ...h.tee), h.n + ' Abschlag'); assert.ok(FG.inAny(h.bounds, ...h.cup), h.n + ' Loch'); }
});

test('Jede Bahn ist lösbar (Suche über Winkel und Stärke, höchstens ' + FG.MAXSTROKES + ' Schläge)', () => {
  const res = [];
  for (const h of FG.HOLES) {
    const Dc = field(h), Dp = (h.portals || []).map(pt => field(h, pt.a));
    const D = (x, z) => { const d = Dc(x, z); if (d < 1e8) return d; const ps = Dp.map(f => f(x, z) + 30); return ps.length ? Math.min(...ps) : d; };
    let b = FG.newBall(h), t = 0, strokes = 0;
    assert.ok(D(...h.tee) < 1e8, h.n + ': Weg vom Abschlag zum Loch existiert');
    while (!b.inCup && strokes < FG.MAXSTROKES) {
      strokes++; let best = null;
      for (let a = 0; a < 48; a++) for (let p = .12; p <= 1.001; p += .055) {
        const r = FG.simulate(h, b, a / 48 * Math.PI * 2, p, t, 14), s = r.b.inCup ? -1 : D(r.b.x, r.b.z);
        if (!best || s < best.s) best = { s, r };
        if (s < 0) break;
      }
      b = best.r.b; t = best.r.t + 1.5; b.events = [];
    }
    res.push(h.n + ': ' + (b.inCup ? strokes + ' (Par ' + h.par + ')' : 'NICHT gelöst'));
    assert.ok(b.inCup, h.n + ' nicht lösbar');
  }
  console.log(res.join('\n'));
});

test('Ball bleibt in der Bahn und kommt zur Ruhe', () => {
  for (const h of FG.HOLES) for (let a = 0; a < 24; a++) {
    const r = FG.simulate(h, FG.newBall(h), a / 24 * Math.PI * 2, 1, 3, 20);
    assert.ok(FG.inAny(h.bounds, r.b.x, r.b.z), h.n + ' Ball außerhalb');
    assert.ok(!r.b.moving, h.n + ' Ball rollt endlos');
  }
});

test('Wasser setzt zurück, Teleporter versetzt, Punkte für die Rangliste', () => {
  const rock = FG.HOLES[10], b = FG.newBall(rock); b.x = .6; b.z = 3.5; b.rest = [.6, 3.5];
  const r = FG.simulate(rock, b, Math.PI / 2, .35, 0, 10);
  assert.ok(r.b.events.includes('water') && r.b.x === .6, 'zurück an die Stelle vor dem Schlag');
  const arc = FG.HOLES[13], r2 = FG.simulate(arc, FG.newBall(arc), Math.PI / 2, .8, 0, 10);
  assert.ok(r2.b.events.includes('portal') && r2.b.z > 8, 'Teleporter');
  assert.strictEqual(FG.points(FG.totalPar()), 100); assert.strictEqual(FG.points(FG.totalPar() - 3), 130);
});
