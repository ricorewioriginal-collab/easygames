import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Terrain, computeHeight, decodeHeights, encodeHeights, quantizeHeight } from '../shared/src/terrain';
import { World } from '../shared/src/world';
import { generateWorld } from '../shared/src/worldgen';
import { Kind, makePiece, rampHeight } from '../shared/src/pieces';
import { POIS } from '../shared/src/mapdef';
import { WATER_LEVEL } from '../shared/src/constants';
import { sharedTerrain } from './helpers';

test('Höhenkarte: Datei-Kodierung ist verlustfrei gegenüber der Berechnung', () => {
  const t = sharedTerrain();
  const back = decodeHeights(encodeHeights(t.h));
  for (let i = 0; i < t.h.length; i += 97) assert.equal(back[i], t.h[i]);
  assert.equal(Math.fround(quantizeHeight(computeHeight(500, 500))), t.at(250, 250));
});

test('Insel: Orte liegen über Wasser, Rand ist Meer', () => {
  const t = sharedTerrain();
  for (const p of POIS) assert.ok(t.height(p.x, p.z) > WATER_LEVEL, `${p.name} liegt unter Wasser`);
  assert.ok(t.height(10, 10) < WATER_LEVEL);
  assert.ok(t.height(1520, 768) < WATER_LEVEL);
});

test('Weltgenerierung ist deterministisch und hat genug Inhalt', () => {
  const t = sharedTerrain();
  const a = new World(t),
    b = new World(t);
  const ca = generateWorld(a),
    cb = generateWorld(b);
  assert.equal(a.pieces.length, b.pieces.length);
  assert.ok(a.pieces.length > 4000, 'zu wenige Bauteile');
  assert.ok(ca.loot.length > 300, 'zu wenige Beutepunkte');
  assert.ok(ca.buildings.length > 60);
  assert.equal(ca.loot.length, cb.loot.length);
  for (let i = 0; i < a.pieces.length; i += 53) assert.deepEqual({ ...a.pieces[i] }, { ...b.pieces[i] });
});

test('Raycast trifft Wand und Rampe, Bodenhöhe auf Rampe', () => {
  const w = new World(new Terrain(new Float32Array(sharedTerrain().h.length).fill(10)));
  const wall = makePiece(Kind.Block, 100, 12, 100, 0.2, 2, 2);
  w.add(wall);
  const hit = w.raycast(95, 12, 100, 1, 0, 0, 20);
  assert.equal(hit.piece, wall.id);
  assert.ok(Math.abs(hit.t - 4.8) < 1e-6);
  assert.equal(hit.nx, -1);
  const ramp = makePiece(Kind.Ramp, 120, 12, 120, 2, 2, 2, { dir: 0 });
  w.add(ramp);
  assert.ok(Math.abs(rampHeight(ramp, 120, 120) - 12) < 1e-9);
  const g = w.groundAt(121, 120, 0.4, 12.6);
  assert.equal(g.piece, ramp.id);
  assert.ok(Math.abs(g.h - 13) < 1e-6);
  // Strahl von oben auf die Rampe
  const down = w.raycast(121, 30, 120, 0, -1, 0, 40);
  assert.equal(down.piece, ramp.id);
  assert.ok(Math.abs(30 - down.t - 13) < 1e-6);
});

test('Entfernte Bauteile verschwinden aus Kollision und Raster', () => {
  const w = new World(new Terrain(new Float32Array(sharedTerrain().h.length).fill(10)));
  const wall = makePiece(Kind.Block, 50, 12, 50, 0.2, 2, 2);
  w.add(wall);
  w.remove(wall.id);
  assert.equal(w.raycast(45, 12, 50, 1, 0, 0, 20).piece, -2);
  // ID-treues Einfügen (Client übernimmt Server-IDs)
  const p = makePiece(Kind.BWall, 60, 12, 60, 0.2, 2, 2);
  p.id = 10;
  w.addWithId(p);
  assert.equal(w.pieces[10], p);
  assert.equal(w.raycast(55, 12, 60, 1, 0, 0, 20).piece, 10);
});
