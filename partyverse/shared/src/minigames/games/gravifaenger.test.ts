import { describe, expect, it } from 'vitest';
import { NEUTRAL_INPUT } from '../types';
import { runBot } from '../simulate';
import {
  COMET_TICK,
  CRASH_PENALTY,
  GOLD_POINTS,
  NOVA_TICK,
  ORB_POINTS,
  game,
  gravityAt,
  type GraviState,
} from './gravifaenger';

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
  it('Stick gibt die Flugrichtung vor, Turbo verbraucht Energie und lädt sich wieder auf', () => {
    const s = game.init(1, opts);
    for (let i = 0; i < 40; i++) game.step(s, { ...NEUTRAL_INPUT, x: 1 });
    expect(Math.abs(s.ang)).toBeLessThan(0.05);
    expect(s.vx).toBeGreaterThan(2);
    expect(s.fuel).toBe(1);
    for (let i = 0; i < 60; i++) game.step(s, { ...NEUTRAL_INPUT, a: true });
    expect(s.fuel).toBeLessThan(0.6);
    const f = s.fuel;
    for (let i = 0; i < 60; i++) game.step(s, NEUTRAL_INPUT);
    expect(s.fuel).toBeGreaterThan(f);
    s.fuel = 0;
    const vy = s.vy;
    game.step(s, { ...NEUTRAL_INPUT, a: true });
    expect(s.thrusting).toBe(false);
    expect(Math.abs(s.vy - vy)).toBeLessThan(0.2);
  });
  it('Orbs geben Punkte und eine Kette, Absturz kostet Punkte und beendet die Kette', () => {
    const s: GraviState = game.init(2, opts);
    const take = () => {
      const o = s.orbs.find((q) => q.planet < 0)!;
      s.x = o.x;
      s.y = o.y;
      s.vx = s.vy = 0;
      game.step(s, NEUTRAL_INPUT);
    };
    take();
    expect(s.collected).toBe(1);
    expect(s.orbs.length).toBe(3);
    expect(s.points).toBe(ORB_POINTS);
    take();
    expect(s.chain).toBe(2);
    expect(s.points).toBe(ORB_POINTS * 2 + 25);
    const p = s.planets[0]!;
    s.x = p.x;
    s.y = p.y;
    game.step(s, NEUTRAL_INPUT);
    expect(s.crashes).toBe(1);
    expect(s.chain).toBe(0);
    expect(s.x).toBe(0);
    expect(s.safe).toBeGreaterThan(0);
    expect(game.score(s)).toBe(ORB_POINTS * 2 + 25 - CRASH_PENALTY);
  });
  it('goldene Orbs kreisen um Planeten und bringen mehr, Supernova verdoppelt', () => {
    const s: GraviState = game.init(5, opts);
    for (let i = 0; i < 5; i++) {
      const o = s.orbs.find((q) => q.planet < 0)!;
      s.x = o.x;
      s.y = o.y;
      game.step(s, NEUTRAL_INPUT);
      s.chainT = 999;
    }
    const gold = s.orbs.find((q) => q.planet >= 0)!;
    expect(gold).toBeDefined();
    const a0 = { x: gold.x, y: gold.y };
    game.step(s, NEUTRAL_INPUT);
    expect(Math.hypot(gold.x - a0.x, gold.y - a0.y)).toBeGreaterThan(0.005);
    s.tick = NOVA_TICK;
    s.chain = 0;
    s.safe = 50;
    s.x = gold.x;
    s.y = gold.y;
    const before = s.points;
    game.step(s, NEUTRAL_INPUT);
    expect(s.points - before).toBe(GOLD_POINTS * 2);
  });
  it('Kometen kommen erst ab der zweiten Phase und sind für alle gleich', () => {
    const a = game.init(8, opts);
    const b = game.init(8, opts);
    let early = 0;
    for (let i = 0; i < COMET_TICK + 400; i++) {
      game.step(a, { ...NEUTRAL_INPUT, x: Math.sin(i / 30) });
      game.step(b, NEUTRAL_INPUT);
      if (i < COMET_TICK - 1) early += a.comets.length;
    }
    expect(early).toBe(0);
    expect(a.cometId).toBeGreaterThan(2);
    expect(a.cometId).toBe(b.cometId);
  });
  it('Bot-Stufen: 0.88 > 0.6 > 0.3', () => {
    const avg = (sk: number) => {
      let sum = 0;
      for (let i = 0; i < 8; i++) sum += runBot(game, 40 + i, opts, sk, i).score;
      return sum / 8;
    };
    const lo = avg(0.3);
    const mid = avg(0.6);
    expect(mid).toBeGreaterThan(lo * 1.3);
    expect(avg(0.88)).toBeGreaterThan(mid);
  });
});
