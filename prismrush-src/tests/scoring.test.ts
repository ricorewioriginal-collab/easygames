import { describe, expect, it } from 'vitest';
import {
  ScoreKeeper,
  WINDOWS,
  gradeFor,
  judge,
  multiplierFor,
  starsFor,
} from '../src/game/scoring';

describe('Bewertung', () => {
  it('ordnet Zeitabweichungen Fenstern zu', () => {
    expect(judge(0)).toBe('perfect');
    expect(judge(WINDOWS.perfect)).toBe('perfect');
    expect(judge(-WINDOWS.great + 0.001)).toBe('great');
    expect(judge(WINDOWS.good)).toBe('good');
    expect(judge(WINDOWS.good + 0.01)).toBeNull();
  });
  it('skaliert Fenster mit der Schwierigkeit', () => {
    expect(judge(WINDOWS.perfect * 1.2, 1)).toBe('great');
    expect(judge(WINDOWS.perfect * 1.2, 1.3)).toBe('perfect');
  });
  it('Multiplikator steigt mit der Combo', () => {
    expect(multiplierFor(0)).toBe(1);
    expect(multiplierFor(10)).toBe(2);
    expect(multiplierFor(25)).toBe(3);
    expect(multiplierFor(500)).toBe(4);
  });
  it('Combo, Punkte und Genauigkeit', () => {
    const s = new ScoreKeeper();
    for (let i = 0; i < 12; i++) s.register('perfect');
    expect(s.combo).toBe(12);
    expect(s.score).toBe(9 * 300 + 3 * 600);
    s.register('miss');
    expect(s.combo).toBe(0);
    expect(s.maxCombo).toBe(12);
    expect(s.accuracy()).toBeCloseTo(12 / 13);
    s.wall();
    expect(s.wallHits).toBe(1);
    expect(s.orb(true)).toBe(50);
    expect(s.orb(false)).toBe(0);
    expect(s.orbsTotal).toBe(2);
  });
  it('Noten und Sterne', () => {
    expect(gradeFor(0.99, false)).toBe('S');
    expect(gradeFor(0.9, false)).toBe('A');
    expect(gradeFor(0.5, false)).toBe('D');
    expect(gradeFor(1, true)).toBe('F');
    expect(starsFor(0.96, false)).toBe(3);
    expect(starsFor(0.86, false)).toBe(2);
    expect(starsFor(0.5, false)).toBe(1);
    expect(starsFor(1, true)).toBe(0);
  });
});
