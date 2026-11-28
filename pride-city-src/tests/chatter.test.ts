import { describe, it, expect } from 'vitest';
import { pickChat } from '../src/game/chatter';

describe('Stadtgeflüster', () => {
  it('liefert Wortwechsel mit mindestens zwei Zeilen', () => {
    for (let r = 0; r < 1; r += .05) expect(pickChat({ night: r > .5, rain: r > .7, viral: '', wanted: false, parade: false }, r).length).toBeGreaterThanOrEqual(2);
  });
  it('spricht über deinen viralen Clip', () => {
    const all = Array.from({ length: 20 }, (_, i) => pickChat({ night: false, rain: false, viral: 'Drift des Tages', wanted: false, parade: false }, i / 20).join(' '));
    expect(all.some((t) => t.includes('Drift des Tages'))).toBe(true);
  });
});
