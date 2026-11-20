import { describe, it, expect } from 'vitest';
import { walkable } from '../src/game/World';
import { CURB } from '../src/game/social';
import { QUIET, CURB_SPOTS, EAST } from '../src/game/uptown';

describe('Hochstadt', () => {
  it('Brücke und Viertel sind begehbar, der Fluss nicht', () => {
    expect(walkable(75, 0)).toBe(true);      // Regenbogenbrücke
    expect(walkable(75, 12)).toBe(false);    // Fluss neben der Brücke
    expect(walkable(150, 40)).toBe(true);    // Hochstadt
    expect(walkable(EAST + 2, 0)).toBe(false);
    expect(walkable(150, 80)).toBe(false);   // Skyline am Horizont
  });
  it('Laternenmeile: erwachsene Figuren mit Plätzen und ruhigen Ecken', () => {
    expect(CURB.length).toBe(CURB_SPOTS.length);
    expect(CURB.every((w) => w.age >= 18 && w.price > 0)).toBe(true);
    for (const q of QUIET) expect(walkable(q.x, q.z)).toBe(true);
  });
});

import { UPTOWN_PLACES, doorStep } from '../src/game/uptown';
import { PLACE_THEMES } from '../src/game/interiors';
describe('Betretbare Orte der Hochstadt', () => {
  it('haben alle eine Einrichtung mit erreichbaren Stellen', () => {
    for (const p of UPTOWN_PLACES) {
      const t = PLACE_THEMES[p.id];
      expect(t, p.id).toBeTruthy();
      expect(t.spots.length).toBeGreaterThan(1);
      for (const s of t.spots) { expect(Math.abs(s.x), p.id + ' ' + s.id).toBeLessThan(5.5); expect(Math.abs(s.z)).toBeLessThan(4); }
    }
  });
  it('stehen mit der Tür am Gehweg, nicht auf der Fahrbahn', () => {
    for (const p of UPTOWN_PLACES) {
      const d = doorStep(p), near = (v: number) => Math.abs(v - Math.round(v / 30) * 30);
      expect(Math.min(near(d.x), near(d.z)), p.id).toBeGreaterThan(4);
    }
  });
});
