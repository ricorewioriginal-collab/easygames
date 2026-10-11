// Tiere: feste Erstbesiedlung, Physik, Treffer, Aktivbereich und Speicherung je Chunk.
import test from 'node:test';
import assert from 'node:assert/strict';
import { World } from '../src/world.js';
import { B } from '../src/blocks.js';
import { Mobs, Mob, MOB_TYPES, rayBox, rollDrops, ACTIVE_R } from '../src/mobs.js';

function loaded(seed, r = ACTIVE_R + 1) {
  const w = new World(seed, new Map(), 2);
  for (let z = -r; z <= r; z++) for (let x = -r; x <= r; x++) w.ensure(x, z);
  return w;
}
const seeded = s => () => (s = (Math.imul(s, 1103515245) + 12345) >>> 0) / 4294967296;

test('Erstbesiedlung ist fest: gleicher Startwert, gleiche Tiere', () => {
  const a = new Mobs(loaded(12345), 12345, null), b = new Mobs(loaded(12345), 12345, null);
  a.refresh(8, 8); b.refresh(8, 8);
  assert.ok(a.list.length > 0, 'es gibt Tiere');
  assert.deepEqual(a.list.map(m => m.record()), b.list.map(m => m.record()));
  for (const m of a.list) {
    const below = a.world.getBlock(Math.floor(m.x), Math.floor(m.y) - 1, Math.floor(m.z));
    assert.ok([B.GRASS, B.FLOWERS, B.SNOW, B.MYCEL].includes(below), 'steht auf Wiese/Schnee');
  }
});

test('Tiere fallen nicht durch den Boden und bleiben in der Nähe', () => {
  const w = loaded(12345), mobs = new Mobs(w, 12345, null);
  mobs.rnd = seeded(7); mobs.refresh(8, 8);
  const start = mobs.list.map(m => [m.x, m.z]);
  for (let i = 0; i < 60 * 30; i++) mobs.update(1 / 60, 8, 8);
  assert.ok(mobs.list.length > 0);
  for (const m of mobs.list) {
    assert.ok(!m.collides(w, m.x, m.y, m.z), 'steckt nicht im Block');
    assert.ok(m.y > 0 && m.y < 96);
  }
  const moved = mobs.list.some((m, i) => start[i] && Math.hypot(m.x - start[i][0], m.z - start[i][1]) > 0.5);
  assert.ok(moved, 'Tiere bewegen sich');
});

test('Speichern und Laden: erlegte Tiere kommen nicht wieder', () => {
  const w = loaded(12345), mobs = new Mobs(w, 12345, null);
  mobs.refresh(8, 8);
  const n = mobs.list.length, victim = mobs.list[0];
  assert.equal(victim.hit(99, victim.x + 1, victim.z), true);
  mobs.remove(victim, false);
  const saved = JSON.parse(JSON.stringify(mobs.serialize()));
  const again = new Mobs(loaded(12345), 12345, saved);
  again.refresh(8, 8);
  assert.equal(again.list.length, n - 1);
});

test('Aktivbereich: entfernte Tiere werden abgelegt und später wieder geweckt', () => {
  const w = loaded(12345, 12), mobs = new Mobs(w, 12345, null);
  mobs.refresh(8, 8);
  const n = mobs.list.length;
  mobs.refresh(8 + 16 * 10, 8); // weit weg
  assert.ok(mobs.list.every(m => Math.abs(m.x - (8 + 160)) < 16 * (ACTIVE_R + 1.5)), 'nur Tiere in der Nähe aktiv');
  mobs.refresh(8, 8);
  const back = mobs.list.filter(m => Math.abs(m.x - 8) < 16 * (ACTIVE_R + 1)).length;
  assert.equal(back, n);
});

test('Nicht geladener Bereich: Tier friert ein', () => {
  const w = new World(1, new Map(), 2), m = new Mob(0, 100.5, 40, 100.5);
  m.update(w, 0.1, () => 0.5, 0, 0);
  assert.deepEqual([m.x, m.y, m.z], [100.5, 40, 100.5]);
});

test('Treffer-Strahl und Beute', () => {
  assert.ok(Math.abs(rayBox(0, 0.5, 0, 0, 0, -1, -0.5, 0, -3.5, 0.5, 1, -2.5) - 2.5) < 1e-9);
  assert.equal(rayBox(0, 0.5, 0, 0, 0, 1, -0.5, 0, -3.5, 0.5, 1, -2.5), Infinity);
  for (let t = 0; t < MOB_TYPES.length; t++) for (const [id, n] of rollDrops(t, () => 0.99)) assert.ok(n >= 1 && id > 0);
  assert.deepEqual(rollDrops(1, () => 0).map(d => d[1]), [1, 1]);
});

test('Ungültige Einträge im Spielstand werden verworfen', () => {
  const mobs = new Mobs(loaded(5), 5, { abc: [[0, 1, 2, 3, 3]], 2147516416: [[9, 0, 0, 0, 1], [0, 'x', 0, 0, 1], [1, 5, 40, 5, 3]] });
  assert.equal(mobs.store.size, 1);
  assert.equal([...mobs.store.values()][0].length, 1);
});
