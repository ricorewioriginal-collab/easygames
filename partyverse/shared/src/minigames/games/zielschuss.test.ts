import { describe, expect, it } from 'vitest';
import { FINALE_TICK, MAG, game, multOf, type Target, type ZielState } from './zielschuss';
import { runBot } from '../simulate';
import { NEUTRAL_INPUT } from '../types';

const opts = { playerIndex: 0, players: 2 };
const mk = (kind: Target['kind'], x: number, y: number, pts: number): Target => ({
  id: 99,
  kind,
  x,
  y0: y,
  y,
  vx: 0,
  r: 0.15,
  age: 20,
  life: 0,
  amp: 0,
  freq: 0,
  pts,
});

describe('Zielschuss', () => {
  it('erzeugt für dasselbe Seed dieselbe Zielfolge', () => {
    const run = (seed: number) => {
      const s = game.init(seed, opts);
      for (let i = 0; i < 400; i++) game.step(s, NEUTRAL_INPUT);
      return JSON.stringify(s.targets);
    };
    expect(run(8)).toBe(run(8));
    expect(run(8)).not.toBe(run(9));
  });

  it('Treffer per Zeiger-Klick zählt Punkte, Köder kosten Punkte, Kontrolle über Flanke', () => {
    const s: ZielState = game.init(1, opts);
    s.nextSpawn = 1e9;
    s.targets.push(mk('duck', 0.5, 0.2, 10));
    const aim = { ...NEUTRAL_INPUT, px: 0.5 / 1.6, py: 0.2, pd: true };
    game.step(s, aim);
    expect(s.points).toBeGreaterThanOrEqual(10);
    expect(s.ammo).toBe(MAG - 1);
    // gehaltene Taste schießt nicht erneut
    s.targets.push(mk('decoy', 0.5, 0.2, -40));
    const p = s.points;
    for (let i = 0; i < 5; i++) game.step(s, aim);
    expect(s.points).toBe(p);
    game.step(s, { ...aim, pd: false });
    for (let i = 0; i < 10; i++) game.step(s, { ...aim, pd: false });
    game.step(s, aim);
    expect(s.points).toBeLessThan(p);
    expect(game.score(s)).toBeGreaterThanOrEqual(0);
  });

  it('Fadenkreuz per Tasten, Schuss mit A, leeres Magazin lädt nach', () => {
    const s: ZielState = game.init(1, opts);
    s.nextSpawn = 1e9;
    for (let i = 0; i < 30; i++) game.step(s, { ...NEUTRAL_INPUT, x: 1 });
    expect(s.cx).toBeGreaterThan(0.5);
    for (let k = 0; k < MAG; k++) {
      game.step(s, { ...NEUTRAL_INPUT, a: true });
      for (let i = 0; i < 10; i++) game.step(s, NEUTRAL_INPUT);
    }
    expect(s.shots).toBe(MAG);
    expect(s.reload).toBeGreaterThan(0);
    game.step(s, { ...NEUTRAL_INPUT, a: true });
    expect(s.shots).toBe(MAG);
    for (let i = 0; i < 80; i++) game.step(s, NEUTRAL_INPUT);
    expect(s.ammo).toBe(MAG);
  });

  it('Serie steigert den Multiplikator, Fehlschuss setzt zurück, Finale zählt doppelt', () => {
    expect(multOf(0)).toBe(1);
    expect(multOf(4)).toBe(2);
    expect(multOf(50)).toBe(3);
    const s: ZielState = game.init(1, opts);
    s.nextSpawn = 1e9;
    const shoot = (hit: boolean) => {
      if (hit) s.targets.push(mk('big', 0, 0, 10));
      game.step(s, { ...NEUTRAL_INPUT, px: 0, py: 0, pd: true });
      for (let i = 0; i < 10; i++) game.step(s, { ...NEUTRAL_INPUT, px: 0, py: 0 });
      if (s.ammo === 0) for (let i = 0; i < 70; i++) game.step(s, { ...NEUTRAL_INPUT, px: 0, py: 0 });
    };
    for (let k = 0; k < 5; k++) shoot(true);
    expect(s.combo).toBe(5);
    expect(s.lastShot.mult).toBe(2);
    shoot(false);
    expect(s.combo).toBe(0);
    s.tick = FINALE_TICK;
    shoot(true);
    expect(s.lastShot.mult).toBe(2);
    expect(s.lastShot.pts).toBeGreaterThanOrEqual(20);
  });

  it('wird schwerer: spätere Ziele schneller und kleiner', () => {
    const s = game.init(4, opts);
    const early: Target[] = [];
    const late: Target[] = [];
    for (let i = 0; i < 25 * 60; i++) {
      game.step(s, NEUTRAL_INPUT);
      for (const t of s.targets)
        if (t.age === 1 && t.kind === 'duck') (i < 8 * 60 ? early : i > 17 * 60 ? late : []).push(t);
    }
    const avg = (a: Target[], f: (t: Target) => number) => a.reduce((x, t) => x + f(t), 0) / a.length;
    expect(early.length).toBeGreaterThan(0);
    expect(late.length).toBeGreaterThan(0);
    expect(avg(late, (t) => Math.abs(t.vx))).toBeGreaterThan(avg(early, (t) => Math.abs(t.vx)));
    expect(avg(late, (t) => t.r)).toBeLessThan(avg(early, (t) => t.r));
  });

  it('Bot-Stufen: stark > mittel > schwach', () => {
    const avg = (sk: number) => {
      let sum = 0;
      for (let i = 0; i < 6; i++) sum += runBot(game, 20 + i, opts, sk, i).score;
      return sum / 6;
    };
    const [lo, mid, hi] = [avg(0.3), avg(0.6), avg(0.88)];
    expect(hi).toBeGreaterThan(mid);
    expect(mid).toBeGreaterThan(lo);
    expect(lo).toBeGreaterThan(0);
  });
});
