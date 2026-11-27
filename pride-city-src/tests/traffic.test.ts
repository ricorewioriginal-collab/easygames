import { describe, it, expect } from 'vitest';
import { NODES, route, lane } from '../src/game/traffic';

describe('Straßennetz', () => {
  it('50 Kreuzungen, jede verbunden', () => { expect(NODES.length).toBe(50); for (const n of NODES) expect(n.nb.length).toBeGreaterThanOrEqual(2); });
  it('Route in die Hochstadt führt über die Brücke', () => {
    const r = route(-20, -30, 150, 30);
    expect(r.some(([x, z]) => x === 60 && z === 0)).toBe(true);
    expect(r.some(([x, z]) => x === 90 && z === 0)).toBe(true);
  });
  it('Rechtsverkehr: Spur 3 m neben der Mitte', () => {
    const a = NODES.findIndex((n) => n.x === 0 && n.z === -30), b = NODES.findIndex((n) => n.x === 0 && n.z === 0);
    const [x0, , x1] = lane(a, b); expect(x0).toBe(-3); expect(x1).toBe(-3);
  });
});
