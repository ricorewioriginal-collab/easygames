// Kollisionen in der Stadt: feste Deko (Bäume, Laternen, Bänke, Felsen) blockiert Wege, Zugänge zu Grundstücken bleiben frei.
import { describe, expect, it } from 'vitest';
import { LOTS } from '../src/data/lots';
import { buildDeco, lotEntrance } from '../src/world/map';
import { findPath } from '../src/world/nav';
import { F_BLOCK, cellKey } from '../src/world/world';
import { createGame } from '../src/sim/setup';

describe('Stadt-Kollisionen', () => {
  const g = createGame({ household: 'hh-sonnberg', seed: 3 });
  const w = g.world;
  it('blockiert Baumstämme, Laternen und Felsen', () => {
    const deco = buildDeco(w);
    const solid = deco.filter((d) => ['tree', 'pine', 'lamp', 'rock'].includes(d.kind));
    expect(solid.length).toBeGreaterThan(50);
    expect(w.staticBlock.size).toBeGreaterThan(50);
    const blocked = solid.filter((d) => w.flags[cellKey(0, Math.floor(d.x), Math.floor(d.z))]! & F_BLOCK).length;
    // fast alle (Ausnahmen: Felder direkt an Grundstückszugängen)
    expect(blocked / solid.length).toBeGreaterThan(0.9);
    expect(deco.some((d) => d.kind === 'rock') && deco.some((d) => d.kind === 'stump')).toBe(true);
  });
  it('Zugänge zu allen Grundstücken sind frei und erreichbar', () => {
    const [sx, sz] = lotEntrance(LOTS[0]!.id);
    for (const l of LOTS) {
      const [ex, ez] = lotEntrance(l.id);
      expect(w.flags[cellKey(0, Math.floor(ex), Math.floor(ez))]! & F_BLOCK, l.id).toBe(0);
      const p = findPath(w, sx, sz, 0, [{ x: ex, z: ez, l: 0 }]);
      expect(p, `Weg zu ${l.id}`).not.toBeNull();
    }
  });
  it('Wege führen nicht durch blockierte Felder', () => {
    const [sx, sz] = lotEntrance(LOTS[0]!.id);
    const [ex, ez] = lotEntrance(LOTS[LOTS.length - 1]!.id);
    const p = findPath(w, sx, sz, 0, [{ x: ex, z: ez, l: 0 }])!;
    for (let i = 1; i < p.length; i++) {
      const a = p[i - 1]!, b = p[i]!;
      const n = Math.ceil(Math.hypot(b.x - a.x, b.z - a.z) * 4);
      for (let k = 0; k <= n; k++) {
        const x = Math.floor(a.x + ((b.x - a.x) * k) / n), z = Math.floor(a.z + ((b.z - a.z) * k) / n);
        expect(w.flags[cellKey(0, x, z)]! & F_BLOCK, `${x},${z}`).toBe(0);
      }
    }
  });
});
