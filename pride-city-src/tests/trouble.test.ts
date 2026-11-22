import { describe, it, expect } from 'vitest';
import { TROUBLE } from '../src/game/trouble';
import { LIFE_EVENTS } from '../src/game/citylife';

describe('Ärger auf der Straße', () => {
  it('jedes Ereignis baut einen Auftrag mit Verfolgung oder Schlägerei', () => {
    const route: Array<[number, number]> = [[0, 0], [30, 0], [30, 30], [60, 30], [60, 0], [90, 0], [90, 30], [120, 30]];
    const ids = new Set<string>();
    for (const d of TROUBLE) {
      expect(ids.has(d.id)).toBe(false); ids.add(d.id);
      const st = d.steps(5.4, 12, route);
      expect(st.length).toBeGreaterThan(0);
      expect(st.some((s) => s.chase || s.fight)).toBe(true);
      for (const s of st) if (s.fight) { expect(s.gang?.who).toBeTruthy(); expect(s.gang!.taunt.length).toBeGreaterThan(0); }
      // Fußverfolgung beginnt am Spot
      const ch = st.find((s) => s.chase?.path && !s.chase.car); if (ch) expect(ch.chase!.path![0]).toEqual([5.4, 12]);
      expect(d.pay).toBeGreaterThan(0);
    }
    expect(TROUBLE.some((d) => d.mode === 'car')).toBe(true);
    expect(TROUBLE.some((d) => d.mode === 'foot')).toBe(true);
  });
  it('neue Alltagsereignisse sind im Stadtleben', () => {
    expect(LIFE_EVENTS.find((e) => e.id === 'unfall')).toBeTruthy();
    expect(LIFE_EVENTS.find((e) => e.id === 'streit')?.choices.some((c) => c.out.fight)).toBe(true);
  });
});
