import { describe, expect, it } from 'vitest';
import { Rng } from '../../rng';
import { runBot } from '../simulate';
import {
  ANCHOR_X,
  ANCHOR_Y,
  ISLANDS,
  MAX_TICKS,
  WIND_PERIOD,
  game,
  streakBonus,
  type SlingState,
} from './schleuderflug';
import { NEUTRAL_INPUT } from '../types';

const opts = { playerIndex: 0, players: 2 };

describe('Schleuderflug', () => {
  it('erzeugt für dasselbe Seed dieselben Inseln und denselben Wind, der Wind wird stärker', () => {
    const a = game.init(5, opts);
    const b = game.init(5, opts);
    expect(a.islands).toEqual(b.islands);
    expect(a.winds).toEqual(b.winds);
    expect(game.init(6, opts).winds).not.toEqual(a.winds);
    expect(a.islands.length).toBe(ISLANDS);
    expect(a.winds.length).toBeGreaterThanOrEqual(MAX_TICKS / WIND_PERIOD);
    const first = Math.abs(a.winds[0]!);
    const last = Math.abs(a.winds[a.winds.length - 1]!);
    expect(last).toBeGreaterThan(first);
  });

  it('Tastatur: A drücken schießt, Wind verschiebt die Flugbahn', () => {
    const land = (wind: number): number => {
      const s: SlingState = game.init(5, opts);
      s.winds = s.winds.map(() => wind);
      s.islands.forEach((i) => (i.respawn = 9999));
      for (let i = 0; i < 12; i++) game.step(s, NEUTRAL_INPUT);
      game.step(s, { ...NEUTRAL_INPUT, a: true });
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
    expect(land(0.5)).toBeGreaterThan(land(0) + 0.1);
    expect(land(-0.5)).toBeLessThan(land(0) - 0.1);
  });

  it('getroffene Inseln tauchen neu auf, Serien geben Bonus, Fehlschuss beendet die Serie', () => {
    expect(streakBonus(1)).toBe(0);
    expect(streakBonus(3)).toBe(20);
    const s: SlingState = game.init(40, opts);
    const rng = new Rng(9);
    let t = 0;
    const seen = new Set<number>();
    while (!game.done(s) && t < MAX_TICKS + 5) {
      game.step(s, game.bot(s, 1, rng));
      s.islands.forEach((i) => seen.add(i.id));
      t++;
    }
    expect(s.hits).toBeGreaterThanOrEqual(8);
    expect(seen.size).toBeGreaterThan(ISLANDS + 4);
    expect(s.bestStreak).toBeGreaterThanOrEqual(2);
    expect(s.points).toBeGreaterThanOrEqual(s.hits * 20);
    // Fehlschuss: senkrecht nach oben ins Leere
    const m: SlingState = game.init(40, opts);
    m.streak = 3;
    m.islands.forEach((i) => (i.respawn = 9999));
    for (let i = 0; i < 6; i++) game.step(m, NEUTRAL_INPUT);
    game.step(m, { ...NEUTRAL_INPUT, a: true });
    while (m.phase !== 'wait') game.step(m, NEUTRAL_INPUT);
    expect(m.streak).toBe(0);
    expect(m.last.hit).toBe(false);
  });

  it('flottes Tempo: ein guter Bot schießt in 30 s mindestens 14-mal', () => {
    const s: SlingState = game.init(3, opts);
    const rng = new Rng(2);
    while (!game.done(s)) game.step(s, game.bot(s, 0.88, rng));
    expect(s.shot).toBeGreaterThanOrEqual(14);
  });

  it('Bot-Stufen: stark > mittel > schwach', () => {
    const avg = (sk: number) => {
      let sum = 0;
      for (let i = 0; i < 6; i++) sum += runBot(game, 30 + i, opts, sk, i).score;
      return sum / 6;
    };
    const [mid, hi] = [avg(0.6), avg(0.88)];
    expect(hi).toBeGreaterThan(mid);
    expect(mid).toBeGreaterThan(avg(0.1));
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
