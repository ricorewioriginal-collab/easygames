import { describe, expect, it } from 'vitest';
import { NEUTRAL_INPUT } from '../types';
import { runBot } from '../simulate';
import { game, gravityAt, ORB_POINTS, CRASH_PENALTY } from './gravifaenger';

const opts = { playerIndex: 0, players: 4 };

describe('gravifaenger', () => {
  it('Welt ist pro Seed gleich und Planeten lassen den Start frei', () => {
    for (const seed of [1, 2, 3, 99]) {
      const a = game.init(seed, opts);
      expect(a.planets).toEqual(game.init(seed, opts).planets);
      expect(a.orbs).toEqual(game.init(seed, opts).orbs);
      expect(a.planets.length).toBe(3);
      for (const p of a.planets) expect(Math.hypot(p.x, p.y)).toBeGreaterThan(p.r + 3);
    }
  });
  it('Schwerkraft fällt mit 1/r² und zieht zum Planeten', () => {
    const s = game.init(1, opts);
    const p = s.planets[0]!;
    const near = gravityAt([p], p.x + 3, p.y);
    const far = gravityAt([p], p.x + 6, p.y);
    expect(near.x).toBeLessThan(0);
    expect(Math.abs(near.x) / Math.abs(far.x)).toBeGreaterThan(3.6);
    expect(Math.abs(near.x) / Math.abs(far.x)).toBeLessThan(4.2);
  });
  it('Schub verbraucht Treibstoff, ohne Schub füllt er sich langsam auf', () => {
    const s = game.init(1, opts);
    for (let i = 0; i < 60; i++) game.step(s, { ...NEUTRAL_INPUT, a: true });
    expect(s.fuel).toBeLessThan(0.9);
    const f = s.fuel;
    for (let i = 0; i < 60; i++) game.step(s, NEUTRAL_INPUT);
    expect(s.fuel).toBeGreaterThan(f);
    expect(s.fuel).toBeLessThan(f + 0.05);
    s.fuel = 0;
    const vy = s.vy;
    game.step(s, { ...NEUTRAL_INPUT, a: true });
    expect(s.thrusting).toBe(false);
    expect(Math.abs(s.vy - vy)).toBeLessThan(0.2);
  });
  it('Absturz setzt zurück und kostet Punkte; Orb gibt 100', () => {
    const s = game.init(2, opts);
    const o = s.orbs[0]!;
    s.x = o.x;
    s.y = o.y;
    game.step(s, NEUTRAL_INPUT);
    expect(s.collected).toBe(1);
    expect(s.orbs.length).toBe(3);
    expect(game.score(s)).toBe(ORB_POINTS + Math.round(s.fuel * 60));
    const p = s.planets[0]!;
    s.x = p.x;
    s.y = p.y;
    game.step(s, NEUTRAL_INPUT);
    expect(s.crashes).toBe(1);
    expect(s.x).toBe(0);
    expect(s.safe).toBeGreaterThan(0);
    expect(game.score(s)).toBeLessThan(ORB_POINTS + 60 - CRASH_PENALTY + 1);
  });
  it('Bot 0.95 ist deutlich besser als Bot 0.1', () => {
    let hi = 0;
    let lo = 0;
    for (let i = 0; i < 10; i++) {
      hi += runBot(game, 40 + i, opts, 0.95, i).score;
      lo += runBot(game, 40 + i, opts, 0.1, i).score;
    }
    expect(hi).toBeGreaterThan(lo * 1.5);
  });
});
