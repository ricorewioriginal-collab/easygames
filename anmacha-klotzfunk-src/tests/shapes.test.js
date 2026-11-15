// Formblöcke (Etappe 9): Geometrie, Verbindungen, Kollision mit Stufen/Treppen, Leiter, Mesher, Rezepte.
import test from 'node:test';
import assert from 'node:assert/strict';
import { B, BLOCKS, SHAPE, INV_BLOCKS, FORM_MATS, stairFor, OPAQUE, SOLID } from '../src/blocks.js';
import { shapeBoxes, shapeHits } from '../src/shapes.js';
import { Player } from '../src/physics.js';
import { meshFrom } from '../src/mesher.js';
import { RECIPES } from '../src/crafting.js';
import { CS, H } from '../src/consts.js';

// Testwelt: Boden bis y = 10, dazu einzelne Blöcke
function world(extra = {}) {
  const get = (x, y, z) => extra[`${x},${y},${z}`] ?? (y <= 10 ? B.STONE : B.AIR);
  return { getBlock: get, isSolid: (x, y, z) => SOLID[get(x, y, z)] === 1 };
}

test('Register: Ids bleiben, neue Blöcke hängen hinten an, Varianten werfen die Grundform ab', () => {
  assert.equal(B.RAIL, 79); assert.equal(B.STONEBRICK, 80); assert.equal(B.LADDER, 146);
  for (let i = 0; i < FORM_MATS.length; i++) {
    const slab = 101 + i, st = 109 + i * 4;
    assert.equal(SHAPE[slab], 1); assert.equal(BLOCKS[slab].full, FORM_MATS[i][2]);
    assert.ok(INV_BLOCKS.includes(st)); for (let d = 1; d < 4; d++) { assert.ok(!INV_BLOCKS.includes(st + d)); assert.equal(BLOCKS[st + d].drop, st); assert.equal(BLOCKS[st + d].dir, d); }
  }
  for (const t of [B.FENCE, B.WALL, B.PANE, B.DOOR, B.LADDER, 101, 109]) assert.equal(OPAQUE[t], 0, BLOCKS[t].name);
  assert.equal(SOLID[B.DOOR_OPEN], 0); assert.equal(SOLID[B.LADDER], 0); assert.equal(BLOCKS[B.DOOR_OPEN].drop, B.DOOR);
});

test('Treppe richtet sich nach der Blickrichtung (steigt vom Spieler weg)', () => {
  assert.equal(stairFor(109, 0), 109);              // Blick nach −z
  assert.equal(stairFor(109, -Math.PI / 2), 110);   // Blick nach +x
  assert.equal(stairFor(109, Math.PI), 111);        // Blick nach +z
  assert.equal(stairFor(109, Math.PI / 2), 112);    // Blick nach −x
  const top = shapeBoxes(109, () => 0, 0, 0, 0)[1]; assert.deepEqual(top, [0, 0.5, 0, 1, 1, 0.5]);
});

test('Zaun, Mauer und Scheibe verbinden sich mit Nachbarn', () => {
  const at = m => (x, y, z) => m[`${x},${z}`] ?? B.AIR;
  assert.equal(shapeBoxes(B.FENCE, at({}), 0, 0, 0).length, 1); // nur Pfosten
  const f = shapeBoxes(B.FENCE, at({ '1,0': B.FENCE, '0,-1': B.STONE }), 0, 0, 0);
  assert.equal(f.length, 1 + 2 * 2); // Pfosten + je zwei Latten nach +x und −z
  assert.equal(shapeBoxes(B.FENCE, at({ '1,0': B.FENCE }), 0, 0, 0, true).length, 2); // Kollision: ein Arm, volle Höhe
  assert.equal(shapeBoxes(B.PANE, at({}), 0, 0, 0).length, 5); // frei stehend: Kreuz
  assert.equal(shapeBoxes(B.WALL, at({ '-1,0': B.WALL, '1,0': B.FENCE }), 0, 0, 0).length, 2); // Mauer verbindet sich nicht mit Zaun
});

test('Tür: Ausrichtung an den Wänden, offen ist sie an die Kante geklappt', () => {
  const g = m => (x, y, z) => m[`${x},${y},${z}`] ?? B.AIR;
  const wallsX = { '-1,0,0': B.STONE, '1,0,0': B.STONE, '0,1,0': B.DOOR };
  const c = shapeBoxes(B.DOOR, g(wallsX), 0, 0, 0)[0]; assert.ok(c[3] - c[0] === 1 && c[5] - c[2] < 0.25);
  const top = shapeBoxes(B.DOOR, g(wallsX), 0, 1, 0)[0]; assert.deepEqual(top, c); // obere Hälfte folgt der unteren
  const o = shapeBoxes(B.DOOR_OPEN, g(wallsX), 0, 0, 0)[0]; assert.ok(o[5] - o[2] === 1 && o[3] - o[0] < 0.25);
  const z = shapeBoxes(B.DOOR, g({ '0,0,-1': B.STONE, '0,0,1': B.STONE }), 0, 0, 0)[0]; assert.ok(z[5] - z[2] === 1);
});

test('Leiter klebt an der Wand', () => {
  const l = shapeBoxes(B.LADDER, (x, y, z) => (x === 1 ? B.STONE : B.AIR), 0, 0, 0)[0];
  assert.equal(l[3], 1); assert.ok(l[0] > 0.9);
});

test('Stufe: man steht auf halber Höhe und läuft ohne Springen hinauf', () => {
  const w = world({ '0,11,0': 101 }), p = new Player();
  p.x = 0.5; p.z = 0.5; p.y = 13;
  for (let i = 0; i < 120; i++) p.update(w, 1 / 60, { f: 0, r: 0 }, 0);
  assert.ok(Math.abs(p.y - 11.5) < 0.02 && p.onGround, 'y = ' + p.y);
  // von daneben anlaufen: Stufe bei z = −1 vor dem Spieler (Blick nach −z)
  const w2 = world({ '0,11,-1': 101, '0,11,-2': 101 }), q = new Player();
  q.x = 0.5; q.z = 0.6; q.y = 11.001;
  let top = 0;
  for (let i = 0; i < 40; i++) { q.update(w2, 1 / 60, { f: 1, r: 0 }, 0); top = Math.max(top, q.y); }
  assert.ok(top > 11.45 && top < 11.6 && q.z < -0.5, `höchstens ${top}, z = ${q.z}`);
  assert.ok(shapeHits(101, w.getBlock, 0, 11, 0, 0.2, 11.2, 0.2, 0.8, 11.4, 0.8));
  assert.ok(!shapeHits(101, w.getBlock, 0, 11, 0, 0.2, 11.6, 0.2, 0.8, 12, 0.8));
});

test('Treppe hinauflaufen, ganzer Block bleibt eine Hürde', () => {
  // Treppe Richtung 0 bei z = −1, darauf ein Block bei z = −2 (Höhe 12)
  const w = world({ '0,11,-1': 109, '0,11,-2': B.STONE }), p = new Player();
  p.x = 0.5; p.z = 0.6; p.y = 11.001;
  let top = 0;
  for (let i = 0; i < 40; i++) { p.update(w, 1 / 60, { f: 1, r: 0 }, 0); top = Math.max(top, p.y); }
  assert.ok(top > 11.95 && p.z < -1, 'über die Treppe auf den Block, höchstens ' + top);
  const w2 = world({ '0,11,-1': B.STONE }), q = new Player();
  q.x = 0.5; q.z = 0.6; q.y = 11.001;
  for (let i = 0; i < 60; i++) q.update(w2, 1 / 60, { f: 1, r: 0 }, 0);
  assert.ok(q.y < 11.1 && q.z > -0.05, 'ohne Sprung nicht auf einen vollen Block');
});

test('Leiter: Springen klettert, sonst langsam rutschen', () => {
  const ex = {}; for (let y = 11; y < 20; y++) { ex[`0,${y},0`] = B.LADDER; ex[`1,${y},0`] = B.STONE; }
  const w = world(ex), p = new Player();
  p.x = 0.5; p.z = 0.5; p.y = 11.001;
  for (let i = 0; i < 60; i++) p.update(w, 1 / 60, { f: 0, r: 0, jump: true }, 0);
  assert.ok(p.y > 13.5, 'geklettert: ' + p.y);
  const y0 = p.y; for (let i = 0; i < 30; i++) p.update(w, 1 / 60, { f: 0, r: 0 }, 0);
  assert.ok(p.y < y0 && y0 - p.y < 1.3, 'rutscht langsam: ' + (y0 - p.y));
});

test('Mesher: Formblöcke erzeugen Quader, Nachbarn bleiben sichtbar', () => {
  const mk = () => new Uint8Array(CS * CS * H), nb = Array.from({ length: 9 }, mk), hms = Array.from({ length: 9 }, () => new Uint8Array(CS * CS));
  const at = (x, y, z, t) => { nb[4][x + (z << 4) + (y << 8)] = t; };
  at(5, 1, 5, B.STONE); at(6, 1, 5, 101);
  const m = meshFrom(nb, hms, 2), faces = m.opaque.idx.length / 6;
  assert.equal(faces, 6 + 5); // Stein: alle 6 (Stufe verdeckt nicht), Stufe: 6 minus die Seite am Stein
  at(6, 1, 5, B.STONE); assert.equal(meshFrom(nb, hms, 2).opaque.idx.length / 6, 10);
  at(6, 1, 5, B.PANE); assert.ok(meshFrom(nb, hms, 2).trans, 'Scheibe im durchsichtigen Mesh');
});

test('Rezepte für alle neuen Bauelemente', () => {
  const made = new Set(RECIPES.map(r => r.give[0]));
  for (const t of INV_BLOCKS) if (t >= 80) assert.ok(made.has(t), 'kein Rezept: ' + BLOCKS[t].name);
  assert.ok(RECIPES.every(r => r.need.every(([t, n]) => t != null && n > 0)));
});
