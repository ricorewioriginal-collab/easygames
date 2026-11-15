// KayKit-Deko (Etappe 10): Daten passen zum Register, Modelle lesbar, Ausrichtung und Platz in der Zelle.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { B, DECO, DECO_DEF, DECO0, SHAPE, SOLID, INV_BLOCKS, BLOCKS } from '../src/blocks.js';
import { parseDeco, decoMatrix } from '../src/deco.js';
import { decoRot, decoLift, shapeBoxes } from '../src/shapes.js';
import { meshFrom } from '../src/mesher.js';
import { CS, H } from '../src/consts.js';

const dir = new URL('../public/kaykit/', import.meta.url);
const man = JSON.parse(readFileSync(new URL('deco.json', dir), 'utf8'));
const bin = readFileSync(new URL('deco.bin', dir));

test('deco.json passt zu DECO_DEF (Reihenfolge, Ids hinten angehängt), Dateien klein', () => {
  assert.deepEqual(man.map(m => m.name), DECO_DEF.map(d => d[0]));
  assert.equal(DECO0, 147); assert.equal(B.DECO_CHAIR, 147); assert.ok(B.DECO_CRATES < 256);
  for (let k = 0; k < DECO_DEF.length; k++) { const t = DECO0 + k; assert.equal(DECO[t], k); assert.equal(SHAPE[t], 8); assert.ok(INV_BLOCKS.includes(t)); assert.ok(BLOCKS[t].emoji); }
  assert.ok(statSync(new URL('deco.bin', dir)).size < 400 * 1024 && statSync(new URL('deco.png', dir)).size < 64 * 1024, 'mobil klein halten');
  for (const f of ['LICENSE-KayKit-Furniture-Bits.txt', 'LICENSE-KayKit-City-Builder-Bits.txt', 'LICENSE-KayKit-Dungeon.txt']) assert.ok(statSync(new URL(f, dir)).size > 0);
});

test('Modelle lesen: Größe in Blockmaß, Indizes gültig, Normalen und UV im Bereich', () => {
  const buf = bin.buffer.slice(bin.byteOffset, bin.byteOffset + bin.byteLength), ms = parseDeco(man, buf);
  for (const m of ms) {
    const nv = m.pos.length / 3;
    assert.ok(m.idx.every(i => i < nv), m.name);
    let ylo = Infinity, yhi = -Infinity; for (let i = 1; i < m.pos.length; i += 3) { ylo = Math.min(ylo, m.pos[i]); yhi = Math.max(yhi, m.pos[i]); }
    assert.ok(Math.abs(ylo) < 0.01 && yhi > 0.03 && yhi < 3.5, `${m.name}: ${ylo}..${yhi}`);
    assert.ok(m.uv.every(v => v >= 0 && v <= 1) && m.nor.every(v => Math.abs(v) <= 1.0001), m.name);
  }
});

test('Platz in der Zelle: Drehung um die Blockmitte, Wandstücke an die Wand', () => {
  const m = { elements: [], set(...a) { this.elements = a; return this; } }, at = (M, x, y, z) => [M[0] * x + M[1] * y + M[2] * z + M[3], M[4] * x + M[5] * y + M[6] * z + M[7], M[8] * x + M[9] * y + M[10] * z + M[11]];
  decoMatrix(m, 10, 5, 20, 0, false, 0.2, 0); assert.deepEqual(at(m.elements, 0.5, 0, 0.5), [10.5, 5, 20.5]);
  decoMatrix(m, 10, 5, 20, 1, false, 0.2, -0.2); const c = at(m.elements, 0.5, 0, 0.5); assert.ok(Math.abs(c[0] - 10.5) < 1e-9 && Math.abs(c[2] - 20.5) < 1e-9 && Math.abs(c[1] - 4.8) < 1e-9);
  const f = at(m.elements, 0.5, 0, 1); assert.ok(Math.abs(f[0] - 11) < 1e-9, 'Vorderseite zeigt nach +x');
  decoMatrix(m, 0, 0, 0, 0, true, 0.2, 0); assert.ok(at(m.elements, 0.5, 0, 0.5)[2] < 0.2, 'Bild rückt an die Wand hinter sich (−z)');
});

test('Ausrichtung: Rücken zur Wand, Stuhl zum Tisch, auf dem Tisch abgestellt', () => {
  const g = m => (x, y, z) => m[`${x},${y},${z}`] ?? B.AIR;
  assert.equal(decoRot(g({ '0,0,-1': B.STONE }), 0, 0, 0), 0);   // Wand hinten (−z) → schaut nach +z
  assert.equal(decoRot(g({ '1,0,0': B.STONE }), 0, 0, 0), 3);    // Wand rechts → schaut nach −x
  assert.equal(decoRot(g({ '-1,0,0': B.DECO_TABLE }), 0, 0, 0), 3); // Tisch links → zum Tisch drehen
  assert.equal(decoRot(g({}), 0, 0, 0), 0);
  assert.ok(Math.abs(decoLift(g({ '0,-1,0': B.DECO_TABLE }), 0, 0, 0) + 0.2) < 1e-9);
  assert.equal(decoLift(g({ '0,-1,0': B.STONE }), 0, 0, 0), 0);
  assert.equal(SOLID[B.DECO_CHAIR], 0); assert.equal(SOLID[B.DECO_BARREL], 1);
  assert.deepEqual(shapeBoxes(B.DECO_TABLE, g({}), 0, 0, 0)[0], [0, 0, 0, 1, 0.8, 1]);
});

test('Mesher: Deko erzeugt keine Würfel, sondern eine Liste für die Modelle', () => {
  const nb = Array.from({ length: 9 }, () => new Uint8Array(CS * CS * H)), hms = Array.from({ length: 9 }, () => new Uint8Array(CS * CS));
  nb[4][3 + (4 << 4) + (2 << 8)] = B.DECO_TABLE; nb[4][3 + (4 << 4) + (3 << 8)] = B.DECO_TABLELAMP;
  const r = meshFrom(nb, hms, 4);
  assert.equal(r.opaque, null);
  assert.equal(r.deco.length, 14);
  assert.deepEqual(r.deco.slice(0, 4), [3, 2, 4, B.DECO_TABLE]);
  assert.ok(Math.abs(r.deco[13] + 0.2) < 1e-9, 'Lampe sitzt auf dem Tisch');
});
