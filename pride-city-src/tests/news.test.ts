import { describe, it, expect } from 'vitest';
import { Save } from '../src/engine/Save';
import { bulletin } from '../src/game/news';
import { goViral } from '../src/game/viral';

const fresh = () => { const s = new Save(); s.newGame(); return s.data; };
const ctx = { hour: 20, sky: 'regen', stars: 0, parade: false, name: 'Rico' };

describe('Rainbow News', () => {
  it('meldet deinen viralen Clip genau einmal', () => {
    const s = fresh(); goViral(s, 'drift', 1, 'Mila', .5);
    const a = bulletin(s, ctx, 0);
    expect(a[0]).toContain('Guten Abend');
    expect(a[1]).toContain('Rico');
    expect(a[2]).toContain('Regen');
    expect(bulletin(s, ctx, 0)[1]).not.toContain('Video des Tages');
  });
  it('meldet die Fahndung', () => {
    const s = fresh();
    expect(bulletin(s, { ...ctx, stars: 2 }, 0)[1]).toContain('Polizei');
  });
});
