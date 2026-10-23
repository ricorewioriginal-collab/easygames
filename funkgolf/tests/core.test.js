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
  const arc = FG.HOLES[13], pa = arc.portals[0].a, ang = Math.atan2(pa[1] - arc.tee[1], pa[0] - arc.tee[0]);
  assert.ok([.4, .5, .6, .7, .8].some(p => { const r2 = FG.simulate(arc, FG.newBall(arc), ang, p, 0, 10); return r2.b.events.includes('portal') && r2.b.z > 8; }), 'Teleporter');
  assert.strictEqual(FG.points(FG.totalPar()), 100); assert.strictEqual(FG.points(FG.totalPar() - 3), 130);
});

test('Looping nur mit genug Schwung, Windmühle schließt und öffnet, Vulkan wirft zu langsame Bälle ab', () => {
  const ch = FG.HOLES[4], strong = FG.simulate(ch, FG.newBall(ch), Math.PI / 2, 1, 0, 10).b, weak = FG.simulate(ch, FG.newBall(ch), Math.PI / 2, .75, 0, 10).b;
  assert.ok(strong.events.includes('loop') && strong.z > 6, 'Looping geschafft');
  assert.ok(weak.events.includes('loopfail') && weak.z < 5, 'Looping zu schwach → zurück');
  const m = FG.HOLES[9].movers[0]; let open = 0, closed = 0;
  for (let t = 0; t < 6; t += .05) FG.moverSegs(m, t).segs.length ? closed++ : open++;
  assert.ok(open > 10 && closed > 10, 'Mühle offen/zu ' + open + '/' + closed);
  const v = FG.HOLES[3]; assert.ok(FG.heightAt(v, ...v.cup) > .15 && FG.heightAt(v, 2, 3) === 0, 'Vulkan-Höhe');
  const b = FG.newBall(v); b.x = 2; b.z = 9.95; b.vx = 0; b.vz = .05; b.moving = true; for (let i = 0; i < 2400 && b.moving && !b.inCup; i++) FG.step(v, b, 0, 1 / 240);
  assert.ok(b.inCup || Math.hypot(b.x - 2, b.z - 10.4) > .3, 'Ball bleibt nicht am Hang liegen');
});
