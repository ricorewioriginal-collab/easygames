// Blockregister, Texturen und Mesher.
import test from 'node:test';
import assert from 'node:assert/strict';
import { BLOCKS, B, NAMES, SOLID, OPAQUE, EMIT, TRANS, TILES, INV_BLOCKS, CATS, LOGO0, LOGO_COUNT, isLogo } from '../src/blocks.js';
import { World, CS } from '../src/world.js';
import { buildMesh } from '../src/mesher.js';

// Werte aus Version 1.0: dürfen sich nie ändern (stehen in Spielständen)
const LEGACY = { AIR: 0, GRASS: 1, DIRT: 2, STONE: 3, SAND: 4, WOOD: 5, LEAVES: 6, PLANKS: 7, GLASS: 8, LAMP: 9, WATER: 10,
  FEDER: 27, TURBO: 28, WIND: 29, RADIO: 30, RAINBOW: 31, NEON_R: 32, NEON_B: 33, NEON_G: 34, NEON_P: 35, BRICK: 36, MARBLE: 37 };

test('Alte Block-Ids und Eigenschaften sind unverändert', () => {
  for (const [k, id] of Object.entries(LEGACY)) assert.equal(B[k], id, k);
  assert.deepEqual([1, 2, 3, 4, 5, 6, 7, 8, 9].map(t => SOLID[t]), [1, 1, 1, 1, 1, 1, 1, 1, 1]);
  assert.deepEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(t => OPAQUE[t]), [1, 1, 1, 1, 1, 0, 1, 0, 1, 0]);
  assert.equal(SOLID[B.WATER], 0);
  assert.equal(EMIT[B.LAMP], 1); assert.equal(EMIT[B.RAINBOW], 2);
  for (let i = 0; i < LOGO_COUNT; i++) { assert.ok(isLogo(LOGO0 + i)); assert.equal(SOLID[LOGO0 + i], 1); }
  assert.equal(NAMES[B.PLANKS], 'Bretter');
});

test('Jeder Block ist vollständig definiert', async () => {
  const { TILE_COUNT } = await import('../src/textures.js').catch(() => ({ TILE_COUNT: 64 }));
  const cats = new Set(CATS.map(c => c.id));
  for (const b of BLOCKS) {
    if (!b || b.id === 0) continue;
    assert.ok(b.name && b.key, 'Name ' + b.id);
    if (!b.logo) {
      assert.equal(TILES[b.id].length, 3, 'Kacheln ' + b.name);
      for (const t of TILES[b.id]) assert.ok(t >= 0 && t < TILE_COUNT, `${b.name}: Kachel ${t} fehlt im Atlas`);
    }
    if (b.inv) { assert.ok(cats.has(b.cat), 'Kategorie ' + b.name); assert.ok(b.icon >= 0 && (b.logo || b.icon < TILE_COUNT)); }
    if (TRANS[b.id]) assert.equal(OPAQUE[b.id], 0);
  }
  assert.ok(!INV_BLOCKS.includes(B.AIR) && !INV_BLOCKS.includes(B.WATER));
});

test('Mesher: Flächen nur an Luft, Glas und Wasser im durchsichtigen Mesh', () => {
  const w = new World(11, new Map(), 2);
  for (let z = -1; z <= 1; z++) for (let x = -1; x <= 1; x++) w.ensure(x, z);
  const c = w.getChunk(0, 0);
  const quads = m => ['opaque', 'trans', 'logo'].reduce((s, k) => s + (m[k] ? m[k].pos.length / 12 : 0), 0);
  const before = buildMesh(w, c);
  assert.deepEqual(before, buildMesh(w, c), 'deterministisch');
  // freistehender Block hoch in der Luft: genau 6 neue Flächen
  w.setBlock(8, 90, 8, B.STONE);
  assert.equal(quads(buildMesh(w, c)) - quads(before), 6);
  w.setBlock(8, 90, 8, B.GLASS);
  const g = buildMesh(w, c);
  assert.equal(quads(g) - quads(before), 6);
  assert.equal((g.trans ? g.trans.pos.length / 12 : 0) - (before.trans ? before.trans.pos.length / 12 : 0), 6);
  w.setBlock(8, 90, 8, LOGO0);
  assert.ok(buildMesh(w, c).logo.pos.length / 12 >= 6);
  assert.equal(buildMesh(w, w.ensure(5, 5)), null, 'ohne Nachbarn kein Mesh');
});
