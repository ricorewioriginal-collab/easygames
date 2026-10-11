import { describe, expect, it } from 'vitest';
import { Rng } from '../../rng';
import { ANCHOR_X, ANCHOR_Y, SHOTS, game, type SlingState } from './schleuderflug';
import { NEUTRAL_INPUT } from '../types';

const opts = { playerIndex: 0, players: 2 };

describe('Schleuderflug', () => {
  it('erzeugt für dasselbe Seed dieselben Inseln und denselben Wind', () => {
    const a = game.init(5, opts);
    const b = game.init(5, opts);
    expect(a.islands).toEqual(b.islands);
    expect(a.winds).toEqual(b.winds);
    expect(game.init(6, opts).winds).not.toEqual(a.winds);
    expect(a.winds.length).toBe(SHOTS);
    // fernere Inseln geben mehr Punkte
    const sorted = [...a.islands].sort(
      (p, q) => Math.hypot(p.x - ANCHOR_X, p.y0 - ANCHOR_Y) - Math.hypot(q.x - ANCHOR_X, q.y0 - ANCHOR_Y),
    );
    expect(sorted[sorted.length - 1]!.pts).toBeGreaterThanOrEqual(sorted[0]!.pts);
  });

  it('Tastatur: Halten und Loslassen von A schießt, Wind verschiebt die Flugbahn', () => {
    const land = (wind: number): number => {
      const s: SlingState = game.init(5, opts);
      s.winds[0] = wind;
      s.wind = wind;
      s.islands = [];
      for (let i = 0; i < 12; i++) game.step(s, NEUTRAL_INPUT);
      for (let i = 0; i < 5; i++) game.step(s, { ...NEUTRAL_INPUT, a: true });
      expect(s.phase).toBe('aim');
      game.step(s, NEUTRAL_INPUT); // loslassen
      expect(s.phase).toBe('fly');
      let last = 0;
      while (s.phase === 'fly' && s.proj) {
        last = s.proj.x;
        game.step(s, NEUTRAL_INPUT);
      }
      return last;
    };
    expect(land(0.4)).toBeGreaterThan(land(0) + 0.1);
    expect(land(-0.4)).toBeLessThan(land(0) - 0.1);
  });

  it('ein präziser Bot trifft die meisten Inseln, Mitteltreffer geben Bonus', () => {
    let hits = 0;
    let bulls = 0;
    for (let k = 0; k < 6; k++) {
      const s: SlingState = game.init(40 + k, opts);
      const rng = new Rng(9 + k);
      let t = 0;
      while (!game.done(s) && t < 2200) {
        game.step(s, game.bot(s, 1, rng));
        t++;
      }
      hits += s.hits;
      bulls += s.bulls;
      expect(s.points).toBeGreaterThanOrEqual(s.hits * 20);
    }
    expect(hits).toBeGreaterThanOrEqual(28);
    expect(bulls).toBeGreaterThan(0);
  });

  it('Zeiger: Ziehen und Loslassen schießt; zu schwach gezogen = kein Schuss', () => {
    const s: SlingState = game.init(5, opts);
    for (let i = 0; i < 12; i++) game.step(s, NEUTRAL_INPUT);
    const px = (ANCHOR_X - 0.3) / 1.6;
    for (let i = 0; i < 3; i++) game.step(s, { ...NEUTRAL_INPUT, px, py: ANCHOR_Y - 0.3, pd: true });
    game.step(s, { ...NEUTRAL_INPUT, px, py: ANCHOR_Y - 0.3, pd: false });
    expect(s.phase).toBe('fly');
    const s2: SlingState = game.init(5, opts);
    for (let i = 0; i < 12; i++) game.step(s2, NEUTRAL_INPUT);
    const near = { ...NEUTRAL_INPUT, px: ANCHOR_X / 1.6, py: ANCHOR_Y, pd: true };
    for (let i = 0; i < 3; i++) game.step(s2, near);
    game.step(s2, { ...near, pd: false });
    expect(s2.phase).toBe('aim');
  });
});
