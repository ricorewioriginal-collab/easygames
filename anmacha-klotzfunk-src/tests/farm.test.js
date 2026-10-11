// Landwirtschaft: Wachstum über Zeitstempel, Ernte, Boden-Regeln, Speicherung.
import test from 'node:test';
import assert from 'node:assert/strict';
import { World } from '../src/world.js';
import { B, CROPS, CROSS, SOLID, TILES } from '../src/blocks.js';
import { I } from '../src/items.js';
import { Farm, cropStage, cropDrops, STAGE_SECS } from '../src/farm.js';
import { buildMesh } from '../src/mesher.js';
import { RECIPES } from '../src/crafting.js';

function field() {
  const w = new World(12345, new Map(), 2);
  for (let z = -1; z <= 1; z++) for (let x = -1; x <= 1; x++) w.ensure(x, z);
  const y = 60; // freie Luft über dem Gelände: eigener kleiner Acker
  w.setBlock(3, y - 1, 3, B.FARMLAND);
  for (let k = 0; k < 3; k++) w.setBlock(3, y + k, 3, B.AIR);
  return { w, y };
}

test('Wachstumsstufe aus dem Zeitstempel', () => {
  assert.equal(cropStage(100, 100), 0);
  assert.equal(cropStage(100, 100 + STAGE_SECS - 1), 0);
  assert.equal(cropStage(100, 100 + STAGE_SECS), 1);
  assert.equal(cropStage(100, 100 + STAGE_SECS * 10), CROPS.length - 1);
  assert.equal(cropStage(100, 50), 0, 'nie negativ');
});

test('Pflanze wächst ohne Dauer-Simulation: ein Aufruf nach langer Pause genügt', () => {
  const { w, y } = field(), f = new Farm();
  w.setBlock(3, y, 3, B.WHEAT0); f.plant(3, y, 3, 0);
  f.update(w, STAGE_SECS * 2 + 1);
  assert.equal(w.getBlock(3, y, 3), B.WHEAT2);
  f.update(w, STAGE_SECS * 50);
  assert.equal(w.getBlock(3, y, 3), B.WHEAT3);
});

test('Ohne Ackerboden vergeht die Pflanze, abgeerntete werden vergessen', () => {
  const { w, y } = field(), f = new Farm();
  w.setBlock(3, y, 3, B.WHEAT1); f.plant(3, y, 3, 0);
  w.setBlock(3, y - 1, 3, B.DIRT);
  f.update(w, 10);
  assert.equal(w.getBlock(3, y, 3), B.AIR);
  assert.equal(f.plants.size, 0);
  w.setBlock(3, y - 1, 3, B.FARMLAND); w.setBlock(3, y, 3, B.WHEAT0); f.plant(3, y, 3, 0);
  w.setBlock(3, y, 3, B.AIR); f.update(w, 10);
  assert.equal(f.plants.size, 0);
});

test('Nicht geladene Pflanzen bleiben unberührt und wachsen beim Laden nach', () => {
  const f = new Farm({ '500,40,500': 0 }), w = new World(1, new Map(), 2);
  assert.equal(f.update(w, 9999), 0);
  assert.equal(f.plants.size, 1);
});

test('Speichern und Laden, kaputte Einträge werden verworfen', () => {
  const f = new Farm({ '1,2,3': 50, 'x,1,2': 5, '4,5,6': 'neu', '7,8': 1 });
  assert.deepEqual(JSON.parse(JSON.stringify(f.serialize())), { '1,2,3': 50 });
});

test('Ernte und Brot', () => {
  assert.deepEqual(cropDrops(B.WHEAT3, () => 0), [[I.WHEAT, 1], [I.SEEDS, 1]]);
  assert.deepEqual(cropDrops(B.WHEAT1), [[I.SEEDS, 1]]);
  assert.ok(RECIPES.some(r => r.give[0] === I.BREAD && r.need[0][0] === I.WHEAT));
});

test('Pflanzen: nicht fest, als gekreuzte Flächen gezeichnet', () => {
  const { w, y } = field();
  for (const t of CROPS) { assert.equal(SOLID[t], 0); assert.equal(CROSS[t], 1); assert.ok(TILES[t]); }
  const before = buildMesh(w, w.getChunk(0, 0)).opaque.idx.length;
  w.setBlock(3, y, 3, B.WHEAT3);
  const after = buildMesh(w, w.getChunk(0, 0)).opaque.idx.length;
  assert.equal(after - before, 4 * 6, 'vier Flächen (zwei Ebenen, beidseitig)');
});
