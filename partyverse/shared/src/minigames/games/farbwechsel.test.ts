import { describe, expect, it } from 'vitest';
import { GRID, game, tileCenter, tileIndex, type FarbState } from './farbwechsel';
import { NEUTRAL_INPUT } from '../types';

const opts = { playerIndex: 0, players: 2 };

describe('Farbwechsel-Arena', () => {
  it('erzeugt für dasselbe Seed dieselben Fliesen und Zielfarben, Zielfarbe kommt vor', () => {
    const a = game.init(14, opts);
    const b = game.init(14, opts);
    expect(a.colors).toEqual(b.colors);
    expect(a.target).toBe(b.target);
    expect(a.colors.length).toBe(GRID * GRID);
    expect(a.colors.filter((c) => c === a.target).length).toBeGreaterThanOrEqual(5);
  });

  it('Fliesenmitte liegt auf der richtigen Fliese', () => {
    for (let i = 0; i < GRID * GRID; i++) {
      const c = tileCenter(i);
      expect(tileIndex(c.x, c.y)).toBe(i);
    }
  });

  it('wer auf der Zielfarbe steht, übersteht die Runde und bekommt 100 Punkte', () => {
    const s: FarbState = game.init(3, opts);
    const idx = s.colors.findIndex((c) => c === s.target);
    const c = tileCenter(idx);
    s.px = c.x;
    s.py = c.y;
    for (let i = 0; i < s.warnLen + 5; i++) game.step(s, NEUTRAL_INPUT);
    expect(s.phase).toBe('drop');
    expect(s.dead).toBe(false);
    expect(s.rounds).toBe(1);
    expect(game.score(s)).toBeGreaterThanOrEqual(100);
  });

  it('wer auf einer falschen Fliese steht, fällt und das Spiel endet', () => {
    const s: FarbState = game.init(3, opts);
    const idx = s.colors.findIndex((c) => c !== s.target);
    const c = tileCenter(idx);
    s.px = c.x;
    s.py = c.y;
    for (let i = 0; i < s.warnLen + 80; i++) game.step(s, NEUTRAL_INPUT);
    expect(s.dead).toBe(true);
    expect(game.done(s)).toBe(true);
    expect(game.score(s)).toBe(0);
  });
});
