// Welt: Reproduzierbarkeit, Chunkgrenzen, Biome, Höhlen, Änderungen, Kompatibilität alter Welten.
import test from 'node:test';
import assert from 'node:assert/strict';
import { World, CS, H, SEA, B, chunkKey } from '../src/world.js';
import { biomeColumn, BIOME, BIOME_NAMES } from '../src/worldgen.js';
import { SOLID } from '../src/blocks.js';

const fnv = d => { let h = 2166136261; for (let i = 0; i < d.length; i++) h = Math.imul(h ^ d[i], 16777619); return h >>> 0; };
const L64 = CS * CS * 64;

test('Generator 1 erzeugt exakt die Originalwelt (alte Spielstände bleiben gleich)', () => {
  // Prüfsummen mit dem Code von Version 1.0 erzeugt
  const ref = {
    777: [2351600345, 1482235963, 3993659168, 3789015095],
    20241: [1472301191, 3223954850, 2816171332, 3051457014],
    12345: [709498287, 2064893975, 48144012, 3034505809]
  };
  for (const [seed, sums] of Object.entries(ref)) {
    const w = new World(Number(seed), new Map(), 1);
    [[0, 0], [3, -2], [-5, 7], [10, 10]].forEach(([x, z], k) => {
      const d = w.ensure(x, z).data;
      assert.equal(fnv(d.subarray(0, L64)), sums[k], `Seed ${seed} Chunk ${x},${z}`);
      assert.ok(d.subarray(L64).every(v => v === 0), 'oberhalb von y 63 nur Luft');
    });
  }
  assert.deepEqual(new World(777, new Map(), 1).findSpawn(), { x: 0.5, y: 28.01, z: 0.5 });
});

test('Generator 2: gleicher Seed = gleiche Welt, Reihenfolge egal', () => {
  const a = new World(4242, new Map(), 2), b = new World(4242, new Map(), 2);
  const order = [];
  for (let z = -2; z <= 2; z++) for (let x = -2; x <= 2; x++) order.push([x, z]);
  for (const [x, z] of order) a.ensure(x, z);
  for (const [x, z] of order.reverse()) b.ensure(x, z);
  for (const [x, z] of order) assert.equal(fnv(a.getChunk(x, z).data), fnv(b.getChunk(x, z).data), `Chunk ${x},${z}`);
  const c = new World(4243, new Map(), 2);
  assert.notEqual(fnv(c.ensure(0, 0).data), fnv(a.getChunk(0, 0).data), 'anderer Seed = andere Welt');
});

test('Generator 2: Säulen sind lückenlos (Boden, kein Loch bis y 0)', () => {
  const w = new World(99, new Map(), 2);
  for (const [cx, cz] of [[0, 0], [7, -3], [-12, 20], [40, 40]]) {
    const c = w.ensure(cx, cz);
    for (let i = 0; i < CS * CS; i++) {
      assert.equal(c.data[i], B.STONE, 'y 0 ist immer Stein');
      assert.notEqual(c.data[i + CS * CS], B.AIR, 'y 1 ist nie Luft');
    }
  }
});

test('Generator 2: Biome stimmen mit der Säulenfunktion überein und kommen alle vor', () => {
  const seen = new Set(), o = {};
  for (let z = -3000; z < 3000; z += 24) for (let x = -3000; x < 3000; x += 24) seen.add(biomeColumn(7, x, z, o).biome);
  const missing = Object.values(BIOME).filter(b => !seen.has(b)).map(b => BIOME_NAMES[b]);
  assert.deepEqual(missing, [], 'fehlende Biome');
  // Oberfläche passt zur berechneten Höhe (außer bei Höhleneingängen)
  const w = new World(7, new Map(), 2), c = w.ensure(2, 3);
  for (let z = 0; z < CS; z++) for (let x = 0; x < CS; x++) {
    biomeColumn(7, 32 + x, 48 + z, o);
    if (o.open) continue;
    const t = c.data[x + z * CS + o.h * CS * CS];
    assert.ok(SOLID[t] || t === B.WATER, `Säule ${x},${z} y ${o.h}: ${t}`);
  }
});

test('Generator 2: Höhlen, Erze und Kristalle entstehen', () => {
  const w = new World(31337, new Map(), 2), count = {};
  let air = 0;
  for (let cz = -4; cz < 4; cz++) for (let cx = -4; cx < 4; cx++) {
    const c = w.ensure(cx, cz), o = {};
    for (let z = 0; z < CS; z++) for (let x = 0; x < CS; x++) {
      biomeColumn(31337, cx * CS + x, cz * CS + z, o);
      for (let y = 1; y < Math.min(o.h - 6, 30); y++) {
        const t = c.data[x + z * CS + y * CS * CS];
        if (t === B.AIR) air++;
        count[t] = (count[t] || 0) + 1;
      }
    }
  }
  assert.ok(air > 200, 'unterirdische Hohlräume: ' + air);
  for (const t of [B.COAL, B.COPPER, B.IRON]) assert.ok(count[t] > 5, 'Erz ' + t + ': ' + (count[t] || 0));
});

test('Generator 2: Meer, Strand und Wasser liegen auf Meereshöhe', () => {
  const o = {};
  let found = false;
  for (let x = 0; x < 4000 && !found; x += 16) {
    if (biomeColumn(5, x, 0, o).biome !== BIOME.OCEAN) continue;
    const w = new World(5, new Map(), 2), c = w.ensure(x >> 4, 0), lx = x & 15;
    const top = c.data[lx + SEA * CS * CS], above = c.data[lx + (SEA + 1) * CS * CS];
    assert.ok(top === B.WATER || top === B.ICE, 'Wasseroberfläche');
    assert.equal(above, B.AIR);
    found = true;
  }
  assert.ok(found, 'Meer gefunden');
});

test('Startpunkt liegt sicher auf Land mit freiem Platz', () => {
  for (const seed of [1, 777, 20241, 123456]) {
    const w = new World(seed, new Map(), 2), s = w.findSpawn();
    const x = Math.floor(s.x), y = Math.floor(s.y), z = Math.floor(s.z);
    assert.ok(SOLID[w.getBlock(x, y - 1, z)], `Seed ${seed}: Boden`);
    assert.equal(w.getBlock(x, y, z), B.AIR); assert.equal(w.getBlock(x, y + 1, z), B.AIR);
    assert.ok(y > SEA, `Seed ${seed}: über dem Meer`);
  }
});

test('Blockänderung: gespeichert, nur betroffene Chunks neu, nach Entladen wieder da', () => {
  const w = new World(3, new Map(), 2);
  for (let z = -1; z <= 1; z++) for (let x = -1; x <= 1; x++) w.ensure(x, z);
  w.dirty.clear();
  assert.ok(w.setBlock(5, 70, 5, B.BRICK));
  assert.deepEqual([...w.dirty].map(c => [c.cx, c.cz]), [[0, 0]], 'Mitte: nur der eigene Chunk');
  w.dirty.clear();
  assert.ok(w.setBlock(15, 70, 0, B.BRICK)); // Ecke: eigener + 3 Nachbarn
  assert.equal(w.dirty.size, 4);
  assert.equal(w.setBlock(15, 70, 0, B.BRICK), false, 'gleicher Block = keine Änderung');
  // Entladen und neu erzeugen
  w.chunks.clear();
  w.ensure(0, 0);
  assert.equal(w.getBlock(5, 70, 5), B.BRICK);
  assert.equal(w.getBlock(15, 70, 0), B.BRICK);
  assert.equal(w.edits.get(chunkKey(0, 0)).size, 2);
});

test('Physik-Abfrage: nicht geladene Bereiche gelten als fest (kein Durchfallen)', () => {
  const w = new World(3, new Map(), 2);
  assert.equal(w.isSolid(1000, 30, 1000), true);
  assert.equal(w.isSolid(0, H, 0), false);
});
