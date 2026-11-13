// Echte 3D-Modelle (Kenney, CC0): Binärdatei lesbar, Maße plausibel, Stadt baut mit und ohne Modelle ohne NaN.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { MTag, modelGeometry, modelRaw, parseModels, setModels } from '../src/render/models';
import { buildStatic } from '../src/render/static-world';
import { createGame } from '../src/sim/setup';

const buf = readFileSync(new URL('../public/models/kenney.bin', import.meta.url));
const models = parseModels(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));

const finite = (a: ArrayLike<number>): boolean => {
  for (let i = 0; i < a.length; i++) if (!Number.isFinite(a[i]!)) return false;
  return true;
};

describe('Kenney-Modelle', () => {
  it('enthält alle 17 Modelle mit Boden bei y = 0', () => {
    expect(models.size).toBe(17);
    for (const n of ['tree_oak', 'tree_fat', 'tree_autumn', 'tree_pine', 'tree_pine_tall', 'bush', 'bush_large', 'flower_red', 'rock_large', 'rock_small', 'stump', 'log', 'sedan', 'taxi', 'van', 'suv', 'hatchback_sports']) {
      const m = models.get(n)!;
      expect(m, n).toBeTruthy();
      expect(finite(m.p) && finite(m.n) && finite(m.c), n).toBe(true);
      let minY = Infinity;
      for (let i = 1; i < m.p.length; i += 3) minY = Math.min(minY, m.p[i]!);
      expect(Math.abs(minY), n).toBeLessThan(1e-3);
      for (const i of m.i) expect(i).toBeLessThan(m.p.length / 3);
    }
  });
  it('Bäume haben Laub und Stamm, Autos sind bunt', () => {
    setModels(models);
    const crown = modelRaw('tree_oak', { height: 3.8, tags: [MTag.Leaf] })!;
    const trunk = modelRaw('tree_oak', { height: 3.8, tags: [MTag.Bark] })!;
    expect(crown.v).toBeGreaterThan(30);
    expect(trunk.v).toBeGreaterThan(10);
    let top = 0;
    for (let i = 1; i < crown.p.length; i += 3) top = Math.max(top, crown.p[i]!);
    expect(top).toBeCloseTo(3.8, 1);
    const car = modelGeometry('taxi', 3.4)!;
    const col = car.getAttribute('color');
    const set = new Set<string>();
    for (let i = 0; i < col.count; i++) set.add(`${col.getX(i).toFixed(2)},${col.getY(i).toFixed(2)},${col.getZ(i).toFixed(2)}`);
    expect(set.size).toBeGreaterThan(3);
  });
  it('Stadt baut mit echten Modellen ohne NaN und im Dreiecksbudget', () => {
    setModels(models);
    const g = createGame({ household: 'hh-sonnberg', seed: 5 });
    const st = buildStatic(g.world);
    for (const geo of [...st.solid, ...st.foliage]) expect(finite(geo.getAttribute('position').array as Float32Array)).toBe(true);
    expect(st.tris).toBeLessThan(400_000);
    console.log('Stadt mit Modellen: Dreiecke', st.tris);
  });
});
