import { describe, it, expect } from 'vitest';
import { Save } from '../src/engine/Save';
import { goViral, canGoViral, PER_DAY, Stunts } from '../src/game/viral';

const fresh = () => { const s = new Save(); s.newGame(); return s.data; };

describe('viral', () => {
  it('Clip bringt Aufrufe, Follower und einen Feed-Eintrag', () => {
    const s = fresh();
    const c = goViral(s, 'drift', 1, 'Mila', .5)!;
    expect(c.views).toBeGreaterThan(1000);
    expect(Number(s.flags.fol)).toBe(c.gain);
    expect(s.feed[0].who).toBe('@mila_filmt');
  });
  it('höchstens PER_DAY Clips pro Tag', () => {
    const s = fresh();
    for (let i = 0; i < PER_DAY; i++) expect(goViral(s, 'crash', .5, 'Jo', .3)).not.toBeNull();
    expect(canGoViral(s)).toBe(false);
    expect(goViral(s, 'crash', .5, 'Jo')).toBeNull();
    s.day++; expect(canGoViral(s)).toBe(true);
  });
  it('erkennt langen Drift erst am Ende, kurzen nicht', () => {
    const st = new Stunts();
    for (let i = 0; i < 10; i++) expect(st.update(.1, { slip: .5, v: 15, max: 30, plain: true })).toBeNull();
    expect(st.update(.1, { slip: 0, v: 15, max: 30, plain: true })).toBeNull();
    for (let i = 0; i < 25; i++) st.update(.1, { slip: .5, v: 15, max: 30, plain: true });
    expect(st.update(.1, { slip: 0, v: 15, max: 30, plain: true })?.kind).toBe('drift');
    expect(st.crash(5)).toBeNull(); expect(st.crash(20)?.kind).toBe('crash');
  });
});
