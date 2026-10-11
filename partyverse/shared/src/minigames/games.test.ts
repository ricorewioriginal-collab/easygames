import { describe, expect, it } from 'vitest';
import { Rng } from '../rng';
import { MINIGAMES } from './registry';
import { runBot, simulate } from './simulate';
import { validateLog } from './input';

/** Allgemeine Prüfungen für JEDES Minispiel: Determinismus, Nachrechnen, Bot-Qualität, Wertebereiche. */
describe.each(MINIGAMES.map((g) => [g.id, g] as const))('Minispiel %s', (_id, g) => {
  const opts = { playerIndex: 0, players: 4 };
  it('hat vollständige Beschreibung', () => {
    expect(g.name.length).toBeGreaterThan(2);
    expect(g.tagline.length).toBeGreaterThan(5);
    expect(g.instructions.length).toBeGreaterThanOrEqual(2);
    expect(g.instructions.length).toBeLessThanOrEqual(5);
    expect(g.controls.desktop.length).toBeGreaterThan(3);
    expect(g.controls.touch.length).toBeGreaterThan(3);
    expect(g.duration).toBeGreaterThanOrEqual(10);
    expect(g.duration).toBeLessThanOrEqual(60);
  });
  it('ist deterministisch und der Server rechnet das Bot-Ergebnis exakt nach', () => {
    for (const seed of [1, 99, 123456]) {
      const r = runBot(g, seed, opts, 0.7, 5);
      expect(validateLog(r.log, Math.ceil(g.duration * 60) + 2)).toBe(true);
      const again = simulate(g, seed, opts, r.log);
      expect(again.score).toBe(r.score);
      expect(again.ticks).toBe(r.ticks);
      const r2 = runBot(g, seed, opts, 0.7, 5);
      expect(r2.score).toBe(r.score);
      expect(r2.log).toEqual(r.log);
    }
  });
  it('endet nach höchstens duration Sekunden mit endlichem Ergebnis', () => {
    const r = runBot(g, 7, opts, 0.5, 1);
    expect(Number.isFinite(r.score)).toBe(true);
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.ticks).toBeLessThanOrEqual(Math.ceil(g.duration * 60) + 2);
  });
  it('gute Bots schlagen schwache im Durchschnitt (Fähigkeit zählt)', () => {
    const avg = (skill: number) => {
      let sum = 0;
      for (let i = 0; i < 12; i++) sum += runBot(g, 1000 + i, opts, skill, 77 + i).score;
      return sum / 12;
    };
    expect(avg(0.95)).toBeGreaterThan(avg(0.1));
  });
  it('Nichtstun ist nie besser als ein guter Bot', () => {
    let idle = 0;
    let good = 0;
    for (let i = 0; i < 8; i++) {
      idle += simulate(g, 500 + i, opts, []).score;
      good += runBot(g, 500 + i, opts, 0.9, 3 + i).score;
    }
    expect(good).toBeGreaterThan(idle);
  });
  it('widersteht zufälligen Eingaben (kein Absturz, endliche Werte)', () => {
    const rng = new Rng(4242);
    const s = g.init(31, opts);
    for (let t = 0; t < Math.ceil(g.duration * 60) + 5; t++) {
      g.step(s, { x: rng.float(-1, 1), y: rng.float(-1, 1), a: rng.chance(0.3), b: rng.chance(0.3), px: rng.float(-1, 1), py: rng.float(-1, 1), pd: rng.chance(0.5) });
    }
    expect(Number.isFinite(g.score(s))).toBe(true);
    expect(g.hud(s).left).toBeTypeOf('string');
  });
});
