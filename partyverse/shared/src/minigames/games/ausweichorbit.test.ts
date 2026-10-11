import { describe, expect, it } from 'vitest';
import { game, hitAt, wrapPi, type OrbitState } from './ausweichorbit';
import { NEUTRAL_INPUT } from '../types';

const opts = { playerIndex: 0, players: 2 };

describe('Ausweich-Orbit', () => {
  it('erzeugt für dasselbe Seed dieselbe Welt (Muster und Münzen)', () => {
    const run = (seed: number) => {
      const s = game.init(seed, opts);
      for (let i = 0; i < 600; i++) game.step(s, NEUTRAL_INPUT);
      return JSON.stringify({ c: s.comets, b: s.beams, w: s.waves, f: s.field, n: s.nextSpawn });
    };
    expect(run(5)).toBe(run(5));
    expect(run(5)).not.toBe(run(6));
  });

  it('zählt einen Treffer und gewährt danach kurze Unverwundbarkeit', () => {
    const s: OrbitState = game.init(3, opts);
    s.nextSpawn = 1e9;
    s.comets.push({ a: s.ang, r: s.rad, v: 0, warn: 0 });
    game.step(s, NEUTRAL_INPUT);
    expect(s.lives).toBe(2);
    expect(s.inv).toBeGreaterThan(0);
    game.step(s, NEUTRAL_INPUT);
    expect(s.lives).toBe(2);
  });

  it('beendet das Spiel nach drei Treffern und wertet Zeit und Münzen', () => {
    const s: OrbitState = game.init(3, opts);
    s.nextSpawn = 1e9;
    s.tick = 120;
    s.coins = 2;
    expect(game.score(s)).toBe(20 + 50);
    s.lives = 1;
    s.comets.push({ a: s.ang, r: s.rad, v: 0, warn: 0 });
    game.step(s, NEUTRAL_INPUT);
    expect(game.done(s)).toBe(true);
  });

  it('Druckwelle ist durch die Lücke ungefährlich, sonst nicht', () => {
    const s: OrbitState = game.init(3, opts);
    s.waves.push({ r: 5, v: 0, t: 100, warn: 80, gap: 1, gapH: 0.5 });
    expect(hitAt(s, 1, 5, 0)).toBe(false);
    expect(hitAt(s, wrapPi(1 + Math.PI), 5, 0)).toBe(false);
    expect(hitAt(s, wrapPi(1 + 1.5), 5, 0)).toBe(true);
  });

  it('sammelt Münzen ein', () => {
    const s: OrbitState = game.init(3, opts);
    s.nextSpawn = 1e9;
    s.field[0] = { a: s.ang, r: s.rad, wait: 0, life: 100 };
    game.step(s, NEUTRAL_INPUT);
    expect(s.coins).toBe(1);
  });
});
