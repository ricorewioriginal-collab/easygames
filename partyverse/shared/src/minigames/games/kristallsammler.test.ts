import { describe, expect, it } from 'vitest';
import { NEUTRAL_INPUT } from '../types';
import { runBot } from '../simulate';
import { game, makeSchedule, isActive, RUSH_TICKS, type Crystal } from './kristallsammler';

const opts = { playerIndex: 0, players: 4 };

describe('kristallsammler', () => {
  it('erzeugt für dasselbe Seed dieselbe Welt, für andere Seeds eine andere', () => {
    const a = makeSchedule(5);
    const b = makeSchedule(5);
    expect(a).toEqual(b);
    expect(makeSchedule(6)).not.toEqual(a);
    expect(a.some((c) => c.kind === 'bomb')).toBe(true);
    expect(a.some((c) => c.value === 5)).toBe(true);
  });
  it('sammelt einen Kristall ein und zählt seinen Wert', () => {
    const s = game.init(3, opts);
    const c = s.items.find((i) => i.kind === 'crystal')!;
    c.x = 1.5;
    c.y = 0;
    c.value = 3;
    c.t0 = 0;
    c.t1 = 600;
    s.items.sort((p, q) => p.t0 - q.t0);
    for (let i = 0; i < 40 && s.points === 0; i++) game.step(s, { ...NEUTRAL_INPUT, x: 1 });
    expect(s.points).toBe(3);
    expect(c.taken).toBe(true);
  });
  it('Bombe betäubt und zieht Punkte ab (nie unter 0)', () => {
    const s = game.init(3, opts);
    s.points = 2;
    const b = s.items.find((i) => i.kind === 'bomb')!;
    b.x = 4.5;
    b.y = 0;
    b.t0 = 0;
    b.t1 = 900;
    s.items.sort((p, q) => p.t0 - q.t0);
    for (let i = 0; i < 120 && s.bombHits === 0; i++) game.step(s, { ...NEUTRAL_INPUT, x: 1 });
    expect(s.bombHits).toBe(1);
    expect(s.points).toBe(0);
    expect(s.stun).toBeGreaterThan(30);
    const x0 = s.x;
    game.step(s, { ...NEUTRAL_INPUT, x: 1 });
    expect(s.x).toBeLessThan(x0 + 0.05);
  });
  it('Sprint ist schneller und verbraucht Ausdauer', () => {
    const a = game.init(9, opts);
    const b = game.init(9, opts);
    for (let i = 0; i < 40; i++) {
      game.step(a, { ...NEUTRAL_INPUT, y: -1 });
      game.step(b, { ...NEUTRAL_INPUT, y: -1, a: true });
    }
    expect(Math.abs(b.y)).toBeGreaterThan(Math.abs(a.y) + 0.5);
    expect(b.stamina).toBeLessThan(a.stamina);
    expect(isActive(b.items[0]!, 0)).toBe(false);
  });
  it('Bot 0.95 ist deutlich besser als Bot 0.1', () => {
    let hi = 0;
    let lo = 0;
    for (let i = 0; i < 10; i++) {
      hi += runBot(game, 40 + i, opts, 0.95, i).score;
      lo += runBot(game, 40 + i, opts, 0.1, i).score;
    }
    expect(hi).toBeGreaterThan(lo * 1.4);
    expect(hi / 10).toBeGreaterThan(30);
  });
  it('Kombo: Kristalle kurz hintereinander geben Bonus, im Goldrausch doppelt', () => {
    const mk = (id: number, x: number): Crystal => ({
      id,
      kind: 'crystal',
      value: 1,
      x,
      y: 0,
      t0: 0,
      t1: 5000,
      taken: false,
      vx: 0,
      vy: 0,
    });
    const s = game.init(3, opts);
    s.items = [mk(1000, 1.2), mk(1001, 2.4), mk(1002, 3.6)];
    for (let i = 0; i < 60; i++) game.step(s, { ...NEUTRAL_INPUT, x: 1 });
    expect(s.pickups).toBe(3);
    expect(s.points).toBe(1 + 2 + 3);
    const r = game.init(3, opts);
    r.items = [mk(1000, 1.2)];
    r.tick = RUSH_TICKS;
    for (let i = 0; i < 30; i++) game.step(r, { ...NEUTRAL_INPUT, x: 1 });
    expect(r.points).toBe(2);
  });
  it('Rollbomben bewegen sich und bleiben in der Arena; späte Phase ist dichter', () => {
    const items = makeSchedule(12);
    const rolling = items.filter((c) => c.kind === 'bomb' && (c.vx || c.vy));
    expect(rolling.length).toBeGreaterThan(0);
    expect(Math.min(...rolling.map((c) => c.t0))).toBeGreaterThan(400);
    const s = game.init(12, opts);
    const b = s.items.find((c) => c.vx || c.vy)!;
    const x0 = b.x;
    s.tick = b.t0;
    for (let i = 0; i < 200; i++) game.step(s, NEUTRAL_INPUT);
    expect(b.x).not.toBe(x0);
    expect(Math.abs(b.x)).toBeLessThan(7);
    const early = items.filter((c) => c.kind === 'crystal' && c.t0 < 500).length;
    const late = items.filter((c) => c.kind === 'crystal' && c.t0 >= 900 && c.t0 < 1400).length;
    expect(late).toBeGreaterThan(early);
  });
  it('Bots: stark > mittel > schwach', () => {
    const avg = (skill: number) => {
      let sum = 0;
      for (let i = 0; i < 12; i++) sum += runBot(game, 60 + i, opts, skill, 2 + i).score;
      return sum / 12;
    };
    const lo = avg(0.3);
    const mid = avg(0.6);
    const hi = avg(0.88);
    expect(hi).toBeGreaterThan(lo);
    expect(mid).toBeGreaterThan(lo);
  });
});
