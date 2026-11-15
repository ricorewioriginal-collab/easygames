// Etappe 12: Generator 4 (große eingerichtete Dörfer, Höhlenhallen) und Fanwelten
import test from 'node:test';
import assert from 'node:assert/strict';
import { World } from '../src/world.js';
import { B, SHAPE, BLOCKS } from '../src/blocks.js';
import { nearestVillage, villageIn, caveIn, regionPlan, REGION } from '../src/structures.js';
import { FANWORLDS, FAN_IDS, fanPlan, fanSpawn, fanSkip, fanBase } from '../src/fanworlds.js';
import { Plan, bigHouse } from '../src/blueprint.js';
import { encodeEdits } from '../src/storage.js';

const SEED = 12345;
const around = (w, x, z, r = 2) => { for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) w.ensure((x >> 4) + dx, (z >> 4) + dz); };

test('Großes Haus: zwei Etagen, Tür, Leiter, Möbel, Licht – Räume 11×11', () => {
  const p = new Plan(); const r = bigHouse(p, 0, 40, 0, 0, 1, {}, 'wohnen');
  assert.equal(p.get(0, 41, 6), B.DOOR); assert.equal(p.get(0, 42, 6), B.DOOR);
  assert.deepEqual(r.door, [0, 6]);
  let air = 0; for (let z = -5; z <= 5; z++) for (let x = -5; x <= 5; x++) if (p.get(x, 42, z) === B.AIR || SHAPE[p.get(x, 42, z)] === 8) air++;
  assert.ok(air > 100, 'Erdgeschoss ist weit und frei begehbar');
  assert.equal(p.get(-5, 45, -5), B.LADDER, 'Leiter durch die Decke');
  const all = [...p.by.values()].flatMap(m => [...m.values()]);
  assert.ok(all.filter(t => SHAPE[t] === 8).length >= 15, 'eingerichtet');
  assert.ok(all.includes(B.LANTERN) && all.includes(B.PANE));
});

test('Generator 4: Dorf mit großen Häusern (Abstand 13), Tür am Platz, gleiche Welt egal in welcher Reihenfolge', () => {
  const v = nearestVillage(SEED, 0, 0, 2, 4);
  assert.ok(v && v.big);
  for (const h of v.houses) assert.equal(Math.abs(h.x - v.x) + Math.abs(h.z - v.z), 13);
  const a = new World(SEED, null, 4), b = new World(SEED, null, 4);
  around(a, v.x, v.z);
  for (let dz = 2; dz >= -2; dz--) for (let dx = -2; dx <= 2; dx++) b.ensure((v.x >> 4) + dx, (v.z >> 4) + dz);
  const h = v.houses[0];
  assert.equal(a.getBlock(h.door.x, v.y + 1, h.door.z), B.DOOR, 'Tür');
  for (let dz = -2; dz <= 2; dz++) for (let dx = -2; dx <= 2; dx++) assert.deepEqual(a.getChunk((v.x >> 4) + dx, (v.z >> 4) + dz).data, b.getChunk((v.x >> 4) + dx, (v.z >> 4) + dz).data);
  assert.equal(a.villageAt(v.x, v.z).id, v.id);
});

test('Generator 4: Höhlenhalle mit Treppengang zur Oberfläche, hohes Gras', () => {
  let c = null, rx, rz;
  for (rz = -2; rz <= 2 && !c; rz++) for (rx = -2; rx <= 2 && !c; rx++) c = caveIn(SEED, rx, rz);
  assert.ok(c, 'Höhlenhalle in der Nähe');
  const w = new World(SEED, null, 4); around(w, c.x, c.z, 3);
  let air = 0; for (let z = c.z - 4; z <= c.z + 4; z++) for (let x = c.x - 4; x <= c.x + 4; x++) if (w.getBlock(x, c.y, z) === B.AIR) air++;
  assert.ok(air >= 70, 'Halle ist groß und frei');
  const plan = regionPlan(SEED, Math.floor(c.x / REGION), Math.floor(c.z / REGION));
  const ids = [...plan.by.values()].flatMap(m => [...m.values()]);
  assert.ok(ids.some(t => BLOCKS[t] && BLOCKS[t].shape === 'stair'), 'Treppengang');
  let grass = 0; for (const [, ch] of w.chunks) for (const t of ch.data) if (t === B.TALLGRASS) grass++;
  assert.ok(grass > 0, 'hohes Gras');
  assert.equal(new World(SEED, null, 3).gen, 3, 'alte Welten bleiben');
});

test('Fanwelten: vier Welten, fester Plan je Seed, Spawn frei, Strukturen in der Welt, Spielstand merkt sich die Welt', () => {
  assert.deepEqual(FAN_IDS, ['taschi', 'zotik', 'anmacha', 'maerchen']);
  assert.ok(fanSkip(0, -1) && !fanSkip(1, 0));
  for (const id of FAN_IDS) {
    assert.ok(FANWORLDS[id].name && FANWORLDS[id].desc);
    const p = fanPlan(id, SEED), s = fanSpawn(id, SEED);
    assert.equal(fanPlan(id, SEED), p, 'zwischengespeichert');
    const w = new World(SEED, null, 4, id);
    assert.equal(w.preset, id);
    const sp = w.findSpawn();
    assert.deepEqual(sp, s);
    around(w, 0, 0, 3);
    const x = Math.floor(sp.x), z = Math.floor(sp.z), y = Math.floor(sp.y);
    assert.equal(w.getBlock(x, y, z), B.AIR); assert.equal(w.getBlock(x, y + 1, z), B.AIR); assert.ok(w.getBlock(x, y - 1, z) !== B.AIR, 'fester Boden');
    let cells = 0; for (const m of p.by.values()) cells += m.size;
    assert.ok(cells > 15000, id + ' ist voll ausgestattet');
  }
  assert.equal(new World(SEED, null, 3, 'taschi').preset, null, 'nur ab Generator 4');
  assert.equal(new World(SEED, null, 4, 'quatsch').preset, null);
  const w = new World(SEED, null, 4, 'maerchen'); around(w, 0, 0, 1);
  assert.equal(w.getBlock(0, fanBase(SEED) + 4, 0), B.GOLDBLOCK, 'goldene Kugel am Froschkönig-Brunnen');
  w.setBlock(1, fanBase(SEED) + 6, 1, B.STONE);
  assert.ok(Object.keys(encodeEdits(w.edits)).length === 1, 'eigene Änderungen werden gespeichert');
});
