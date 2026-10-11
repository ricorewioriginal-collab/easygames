// Bau-Werkzeuge: Formen, Größengrenzen, Kopieren und Einfügen.
import test from 'node:test';
import assert from 'node:assert/strict';
import { shapeCells, bounds, copyRegion, pasteCells, MAX_CELLS } from '../src/build.js';
import { B } from '../src/blocks.js';

test('Formen zwischen zwei Ecken', () => {
  assert.equal(shapeCells('linie', [0, 10, 0], [5, 10, 0]).length, 6);
  assert.equal(shapeCells('linie', [0, 10, 0], [4, 14, 2]).length, 5, 'diagonal: so viele wie die längste Achse');
  assert.equal(shapeCells('flaeche', [0, 10, 0], [3, 20, 2]).length, 12, 'Fläche bleibt auf Höhe der ersten Ecke');
  assert.ok(shapeCells('flaeche', [0, 10, 0], [3, 20, 2]).every(c => c[1] === 10));
  const wall = shapeCells('wand', [0, 10, 0], [4, 12, 1]);
  assert.equal(wall.length, 15); assert.ok(wall.every(c => c[2] === 0), 'Wand entlang der längeren Achse');
  assert.equal(shapeCells('saeule', [2, 10, 2], [9, 5, 9]).length, 6);
  assert.deepEqual(shapeCells('einzeln', [1, 2, 3], [9, 9, 9]), [[1, 2, 3]]);
  assert.equal(shapeCells('flaeche', [0, 10, 0], [99, 10, 99], MAX_CELLS.survival), null, 'zu groß');
  assert.ok(shapeCells('saeule', [0, 90, 0], [0, 200, 0]).every(c => c[1] < 96), 'nicht über die Welt hinaus');
  assert.deepEqual(bounds([5, 1, 2], [1, 4, 0]), [1, 1, 0, 5, 4, 2]);
});

test('Kopieren und Einfügen', () => {
  const blocks = new Map([['1,5,1', B.STONE], ['2,5,1', B.WATER], ['1,6,2', B.LAMP]]);
  const w = { getBlock: (x, y, z) => blocks.get(`${x},${y},${z}`) || B.AIR };
  const clip = copyRegion(w, [2, 6, 2], [1, 5, 1]);
  assert.deepEqual([clip.sx, clip.sy, clip.sz, clip.n], [2, 2, 2, 2]);
  const cells = pasteCells(clip, [10, 20, 30]);
  assert.deepEqual(cells.sort(), [[10, 20, 30, B.STONE], [10, 21, 31, B.LAMP]].sort(), 'Wasser und Luft werden nicht eingefügt');
  assert.equal(copyRegion(w, [0, 0, 0], [40, 40, 40]), null, 'zu groß');
});
