// Physik: Kollision, Raycast und bildratenunabhängige Bewegung (30/60/120 Hz).
import test from 'node:test';
import assert from 'node:assert/strict';
import { Player, raycast } from '../src/physics.js';
import { B } from '../src/blocks.js';

// flache Testwelt: Boden bis y = 10, optional eine Wand
function flatWorld(wallX = null) {
  const get = (x, y, z) => (y <= 10 ? B.STONE : wallX !== null && x === wallX && y <= 14 ? B.STONE : B.AIR);
  return { getBlock: get, isSolid: (x, y, z) => get(x, y, z) !== B.AIR };
}
function simulate(hz, seconds, input, world = flatWorld()) {
  const p = new Player();
  p.x = 0.5; p.y = 11.001; p.z = 0.5;
  const dt = 1 / hz;
  let apex = p.y;
  for (let i = 0; i < Math.round(seconds * hz); i++) {
    p.update(world, dt, typeof input === 'function' ? input(i * dt) : input, 0);
    apex = Math.max(apex, p.y);
  }
  return { p, apex };
}

test('Spieler steht stabil auf dem Boden', () => {
  const { p } = simulate(60, 2, { f: 0, r: 0, jump: false, down: false, sprint: false });
  assert.ok(Math.abs(p.y - 11) < 0.01, 'y = ' + p.y);
  assert.ok(p.onGround);
});

test('Laufen ist bei 30, 60 und 120 Hz gleich weit (±3 %)', () => {
  const inp = { f: 1, r: 0, jump: false, down: false, sprint: false };
  const d = [30, 60, 120].map(hz => -simulate(hz, 2, inp).p.z);
  for (const v of d) assert.ok(Math.abs(v - d[2]) / d[2] < 0.03, d.join(' / '));
  assert.ok(d[2] > 7 && d[2] < 9, 'Strecke ' + d[2]);
});

test('Sprunghöhe ist bei 30, 60 und 120 Hz gleich (±0,1 Block)', () => {
  const inp = t => ({ f: 0, r: 0, jump: t < 0.05, down: false, sprint: false });
  const a = [30, 60, 120].map(hz => simulate(hz, 1.2, inp).apex - 11);
  for (const v of a) assert.ok(Math.abs(v - a[2]) < 0.1, a.join(' / '));
  assert.ok(a[2] > 1.1 && a[2] < 1.6, 'Sprunghöhe ' + a[2]);
});

test('Wand stoppt den Spieler', () => {
  const { p } = simulate(60, 3, { f: 0, r: 1, jump: false, down: false, sprint: true }, flatWorld(3));
  assert.ok(p.x < 3 - 0.29 && p.x > 2.5, 'x = ' + p.x);
});

test('Raycast trifft den ersten festen Block mit richtiger Fläche', () => {
  const w = flatWorld(5);
  const r = raycast(w, 0.5, 12.5, 0.5, 1, 0, 0, 10);
  assert.deepEqual([r.x, r.y, r.z, r.nx, r.ny, r.nz], [5, 12, 0, -1, 0, 0]);
  assert.equal(raycast(w, 0.5, 12.5, 0.5, 1, 0, 0, 3), null);
  const down = raycast(w, 0.5, 12.5, 0.5, 0, -1, 0, 6);
  assert.deepEqual([down.y, down.ny], [10, 1]);
});

test('Nicht geladener Bereich: Spieler wartet an Ort und Stelle', () => {
  const w = { ...flatWorld(), isLoaded: () => false };
  const p = new Player(); p.x = 0.5; p.y = 40; p.z = 0.5; p.vy = -10;
  p.update(w, 1 / 60, { f: 1, r: 0, jump: false, down: false, sprint: false }, 0);
  assert.deepEqual([p.x, p.y, p.z, p.vy], [0.5, 40, 0.5, 0]);
  assert.equal(p.waiting, true);
});
