import test from 'node:test';
import assert from 'node:assert/strict';
import { B } from '../src/blocks.js';
import { World } from '../src/world.js';
import { WorldMap, MAX_MARKS, MAX_RADIOS, TILE } from '../src/worldmap.js';

test('Weltkarte: entdeckte Gebiete werden kompakt gespeichert und wieder geladen', () => {
  const m = new WorldMap();
  assert.equal(m.serialize(), undefined); // nichts entdeckt = nichts im Spielstand
  const n = m.markAround(8, 8, 3);
  assert.ok(n > 20 && n === m.count);
  assert.equal(m.markAround(8, 8, 3), 0); // schon bekannt
  m.mark(-1, -1); m.mark(-33, 64); m.mark(31, 31);
  assert.ok(m.has(-1, -1) && m.has(-33, 64) && m.has(31, 31) && !m.has(-34, 64) && !m.has(40, 40));
  const s = JSON.parse(JSON.stringify(m.serialize()));
  for (const v of Object.values(s.seen)) assert.ok(v.length <= 172); // 1024 Chunks je Region in höchstens 172 Zeichen
  const r = new WorldMap(s);
  assert.equal(r.count, m.count);
  assert.ok(r.has(-1, -1) && r.has(-33, 64) && r.has(0, 0) && !r.has(40, 40));
});

test('Weltkarte: Markierungen begrenzt, ungültige Daten werden verworfen', () => {
  const m = new WorldMap();
  for (let i = 0; i < MAX_MARKS + 3; i++) m.addMark(i * 10.4, -i, i === 0 ? 'Basis mit sehr langem Namen über 24 Zeichen' : '');
  assert.equal(m.marks.length, MAX_MARKS);
  assert.equal(m.marks[0].n.length, 24); assert.equal(m.marks[1].n, 'Markierung 2'); assert.equal(m.marks[1].x, 10);
  m.removeMark(0); assert.equal(m.marks.length, MAX_MARKS - 1);
  const bad = new WorldMap({ seen: { 'x,y': 'AAAA', '0,0': 42 }, marks: [{ x: 'a', z: 1 }, null, { x: 1, z: 2, n: 5 }], radios: [[1, 2], [1, 2, 3], 'r'] });
  assert.equal(bad.count, 0); assert.equal(bad.regions.size, 0);
  assert.deepEqual(bad.marks, [{ x: 1, z: 2, n: '5' }]);
  assert.equal(bad.radios.size, 1);
  assert.equal(new WorldMap('kaputt').count, 0);
  assert.equal(new WorldMap({ radios: Array.from({ length: 99 }, (_, i) => [i, 1, 1]) }).radios.size, MAX_RADIOS);
});

test('Weltkarte: Farben aus geladenen Chunks und aus dem Generator, Funkstationen folgen der Welt', () => {
  const w = new World(4242, new Map(), 2), m = new WorldMap();
  const far = m.tile(w, 50, 50); // nicht geladen: Farbe aus dem Biom
  assert.equal(far.length, TILE * TILE * 4);
  assert.ok(far[3] === 255 && far[0] + far[1] + far[2] > 0);
  w.ensure(0, 0);
  const near = m.tile(w, 0, 0);
  assert.equal(near[3], 255);
  assert.equal(m.tile(w, 0, 0), near); // zwischengespeichert
  // Radio in einem entdeckten, geladenen Chunk
  m.mark(0, 0); w.setBlock(3, 60, 3, B.RADIO);
  m.syncRadios(w); assert.ok(m.radios.has('3,60,3'));
  w.setBlock(3, 60, 3, B.AIR);
  m.syncRadios(w); assert.equal(m.radios.size, 0);
});
