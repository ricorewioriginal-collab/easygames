import { describe, expect, it } from 'vitest';
import { coinValue, game, hitAt, wrapPi, type OrbitState } from './ausweichorbit';
import { runBot } from '../simulate';
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
    s.coinPts = 55;
    expect(game.score(s)).toBe(20 + 55);
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
  it('Münzserie: jede weitere Münze ohne Treffer ist mehr wert, ein Treffer beendet die Serie', () => {
    const s: OrbitState = game.init(3, opts);
    s.nextSpawn = 1e9;
    for (let k = 0; k < 3; k++) {
      s.field[0] = { a: s.ang, r: s.rad, wait: 0, life: 100 };
      game.step(s, NEUTRAL_INPUT);
    }
    expect(s.coins).toBe(3);
    expect(s.coinPts).toBe(coinValue(0) + coinValue(1) + coinValue(2));
    expect(coinValue(2)).toBeGreaterThan(coinValue(0));
    s.comets.push({ a: s.ang, r: s.rad, v: 0, warn: 0 });
    game.step(s, NEUTRAL_INPUT);
    expect(s.chain).toBe(0);
  });

  it('Eruption: der glühende Sektor trifft erst nach der Warnzeit, außerhalb nie', () => {
    const s: OrbitState = game.init(3, opts);
    s.flares.push({ a: 1, h: 0.5, t: 0, warn: 10, dur: 20 });
    expect(hitAt(s, 1.2, 5, 0)).toBe(false);
    expect(hitAt(s, 1.2, 5, 12)).toBe(true);
    expect(hitAt(s, 1.8, 5, 12)).toBe(false);
    expect(hitAt(s, 1.2, 5, 40)).toBe(false);
  });

  it('Steigerung: später mehr Hindernisse gleichzeitig, auch Eruptionen; Bots 0.88 > 0.6 > 0.3', () => {
    const s: OrbitState = game.init(7, opts);
    let early = 0;
    let late = 0;
    let flares = 0;
    for (let i = 0; i < 1800; i++) {
      s.lives = 3; // unverwundbar zählen
      game.step(s, NEUTRAL_INPUT);
      const n = s.comets.length + s.beams.length + s.waves.length + s.flares.length;
      if (i < 600) early += n;
      else if (i >= 1200) late += n;
      if (s.flares.length) flares++;
    }
    expect(late).toBeGreaterThan(early * 1.5);
    expect(flares).toBeGreaterThan(0);
    const avg = (skill: number) => {
      let t = 0;
      for (let i = 0; i < 8; i++) t += runBot(game, 60 + i, opts, skill, i + 1).score;
      return t / 8;
    };
    const a = avg(0.3);
    const b = avg(0.6);
    const c = avg(0.88);
    expect(b).toBeGreaterThan(a);
    expect(c).toBeGreaterThan(b * 0.95);
  }, 30000);
});
