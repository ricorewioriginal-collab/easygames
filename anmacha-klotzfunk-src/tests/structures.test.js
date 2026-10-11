// Generator 3: Dörfer mit Flächenausgleich, verlassene Minen, Startpunkt; Generator 2 bleibt unverändert.
import test from 'node:test';
import assert from 'node:assert/strict';
import { World, GEN_LATEST } from '../src/world.js';
import { B } from '../src/blocks.js';
import { CS } from '../src/consts.js';
import { villageIn, mineIn, nearestVillage, REGION, workSpot } from '../src/structures.js';

const SEED = 12345;
function around(w, x, z, r = 2) { for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) w.ensure((x >> 4) + dx, (z >> 4) + dz); }

test('Neue Welten nutzen Generator 3', () => assert.equal(GEN_LATEST, 3));

test('Dorf: fest je Seed, Häuser mit Tür, Brunnen, Feld und Funkmast', () => {
  const v = nearestVillage(SEED);
  assert.ok(v, 'Dorf in der Nähe des Ursprungs');
  assert.deepEqual(villageIn(SEED, Math.floor(v.x / REGION), Math.floor(v.z / REGION)), v);
  const w = new World(SEED, null, 3);
  around(w, v.x, v.z);
  assert.equal(w.getBlock(v.x, v.y, v.z), B.WATER, 'Brunnen');
  assert.equal(w.getBlock(v.x + 3, v.y, v.z + 3), B.PATH, 'Dorfplatz');
  for (const h of v.houses) {
    assert.equal(w.getBlock(h.door.x, v.y + 1, h.door.z), B.AIR, 'Tür offen');
    assert.equal(w.getBlock(h.door.x, v.y + 2, h.door.z), B.AIR);
    assert.equal(w.getBlock(h.x, v.y + 9, h.z), v.roof, 'Dachspitze');
    assert.equal(w.getBlock(h.x, v.y + 1, h.z), B.AIR, 'Raum frei');
    const ws = workSpot(v, h);
    assert.ok(!w.isSolid(Math.floor(ws.x), v.y + 1, Math.floor(ws.z)), 'Arbeitsplatz begehbar: ' + h.role.key);
  }
  assert.equal(w.getBlock(v.field.x0, v.y, v.field.z0), B.FARMLAND);
  assert.ok([B.WHEAT2, B.WHEAT3].includes(w.getBlock(v.field.x0, v.y + 1, v.field.z0)));
  assert.ok([...w.radios.values()].some(([x, , z]) => x === v.mast.x + 1 && z === v.mast.z), 'Radio am Mast spielt');
  // Platz ist eben
  for (let d = -15; d <= 15; d += 5) assert.equal(w.getBlock(v.x + d, v.y + 1, v.z + 15) === B.AIR || w.isSolid(v.x + d, v.y, v.z + 15), true);
});

test('Erzeugung ist unabhängig von der Reihenfolge der Chunks', () => {
  const v = nearestVillage(SEED), cx = v.x >> 4, cz = v.z >> 4;
  const a = new World(SEED, null, 3), b = new World(SEED, null, 3);
  a.ensure(cx, cz); a.ensure(cx + 1, cz);
  b.ensure(cx + 1, cz); b.ensure(cx, cz);
  assert.deepEqual(a.getChunk(cx, cz).data, b.getChunk(cx, cz).data);
  assert.deepEqual(a.getChunk(cx + 1, cz).data, b.getChunk(cx + 1, cz).data);
});

test('Generator 2 bleibt unverändert (keine Dörfer)', () => {
  const v = nearestVillage(SEED), g2 = new World(SEED, null, 2), g3 = new World(SEED, null, 3);
  const c2 = g2.ensure(v.x >> 4, v.z >> 4), c3 = g3.ensure(v.x >> 4, v.z >> 4);
  assert.notDeepEqual(c2.data, c3.data, 'Dorf nur in Generator 3');
  assert.ok(!c2.data.includes(B.PATH));
  // Region ohne Dorf und Mine: Generator 3 = Generator 2
  let rx = 0;
  while (villageIn(SEED, rx, 5) || mineIn(SEED, rx, 5)) rx++;
  const x = rx * REGION + 64, z = 5 * REGION + 64;
  assert.deepEqual(g2.ensure(x >> 4, z >> 4).data, g3.ensure(x >> 4, z >> 4).data);
});

test('Verlassene Mine: Stollen, Stützbalken, Kammer mit Ofen', () => {
  let m = null, rx = 0, rz = 0;
  for (rz = -3; rz <= 3 && !m; rz++) for (rx = -3; rx <= 3 && !m; rx++) m = mineIn(SEED, rx, rz);
  assert.ok(m, 'Mine gefunden');
  const w = new World(SEED, null, 3);
  around(w, m.x, m.z, 1);
  assert.equal(w.getBlock(m.x + 2, m.y, m.z + 2), B.FURNACE);
  assert.equal(w.getBlock(m.x + 1, m.y + 1, m.z), B.AIR, 'Kammer frei');
  let beams = 0;
  for (let t = 5; t <= m.L && t < 30; t += 5) if (w.getBlock(m.x + t, m.y + 2, m.z) === B.PLANKS || w.getBlock(m.x + t, m.y + 2, m.z) === B.LAMP) beams++;
  assert.ok(beams > 0, 'Stützbalken');
});

test('Startpunkt: Dorfplatz, außer in der Story', () => {
  const v = nearestVillage(SEED), w = new World(SEED, null, 3);
  const s = w.findSpawn();
  assert.equal(Math.floor(s.x), v.x); assert.equal(Math.floor(s.z), v.z + 3);
  const st = w.findSpawn(false);
  assert.ok(Math.hypot(st.x - v.x, st.z - v.z) > 3, 'Story startet woanders');
  assert.ok(w.villageAt(v.x, v.z) === v && w.villageAt(v.x + 200, v.z) !== v);
  // Story-Welt (Startwert 777) hat ein erreichbares Dorf
  const sv = nearestVillage(777);
  assert.ok(sv && Math.hypot(sv.x, sv.z) < 300);
});
