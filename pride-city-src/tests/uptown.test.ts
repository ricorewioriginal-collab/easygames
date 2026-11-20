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
