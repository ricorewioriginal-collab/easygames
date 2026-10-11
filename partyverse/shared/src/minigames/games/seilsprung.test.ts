import { describe, expect, it } from 'vitest';
import { game, multiplier, crossTick, type RopeState } from './seilsprung';
import { NEUTRAL_INPUT } from '../types';

const opts = { playerIndex: 0, players: 2 };
const A = { ...NEUTRAL_INPUT, a: true };

describe('seilsprung – Regeln', () => {
  it('Tempo-Muster hängt nur vom Seed ab und wechselt', () => {
    const a = game.init(77, opts);
    const b = game.init(77, { playerIndex: 1, players: 5 });
    expect(a.turns).toEqual(b.turns);
    expect(game.init(78, opts).turns).not.toEqual(a.turns);
    expect(new Set(a.turns).size).toBeGreaterThan(3);
    expect(Math.min(...a.turns)).toBeGreaterThanOrEqual(44);
  });

  it('Serien-Multiplikator wächst und ist gedeckelt', () => {
    expect(multiplier(0)).toBe(1);
    expect(multiplier(3)).toBe(1);
    expect(multiplier(4)).toBe(2);
    expect(multiplier(7)).toBe(3);
    expect(multiplier(100)).toBe(5);
  });

  it('wer nie springt, stolpert dreimal und das Spiel endet', () => {
    const s: RopeState = game.init(5, opts);
    let ticks = 0;
    while (!game.done(s) && ticks++ < 1900) game.step(s, NEUTRAL_INPUT);
    expect(s.hits).toBe(3);
    expect(game.done(s)).toBe(true);
    expect(game.score(s)).toBe(0);
    expect(ticks).toBeLessThan(500);
  });

  it('ein Sprung zur richtigen Zeit zählt, Serie erhöht die Punkte', () => {
    const s: RopeState = game.init(5, opts);
    const pts: number[] = [];
    let last = 0;
    let guard = 0;
    while (s.clears < 5 && guard++ < 2000) {
      // Absprung ca. 13 Ticks vor der Seilwende
      const c = crossTick(s.turns[s.turn] as number);
      const jumpNow = s.u === c - 13 && s.y === 0;
      game.step(s, jumpNow ? A : NEUTRAL_INPUT);
      if (s.points !== last) {
        pts.push(s.points - last);
        last = s.points;
      }
    }
    expect(s.hits).toBe(0);
    expect(s.streak).toBe(5);
    expect(pts.slice(0, 3)).toEqual([10, 10, 10]);
    expect(pts[3]).toBe(20);
  });

  it('ein Treffer unterbricht die Serie', () => {
    const s: RopeState = game.init(5, opts);
    s.streak = 6;
    s.bestStreak = 6;
    let guard = 0;
    while (s.hits === 0 && guard++ < 400) game.step(s, NEUTRAL_INPUT);
    expect(s.hits).toBe(1);
    expect(s.streak).toBe(0);
    expect(s.stumble).toBeGreaterThan(0);
  });
});
