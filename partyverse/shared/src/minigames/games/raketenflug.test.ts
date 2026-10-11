import { describe, expect, it } from 'vitest';
import { game, caveAt, type RocketState } from './raketenflug';
import { NEUTRAL_INPUT } from '../types';

const opts = { playerIndex: 0, players: 2 };
const A = { ...NEUTRAL_INPUT, a: true };

describe('raketenflug – Regeln', () => {
  it('Höhle, Tore und Felsen hängen nur vom Seed ab', () => {
    const a = game.init(3, opts);
    const b = game.init(3, { playerIndex: 1, players: 2 });
    expect(JSON.stringify([a.cy, a.gh, a.gates, a.rocks])).toBe(JSON.stringify([b.cy, b.gh, b.gates, b.rocks]));
    expect(JSON.stringify(game.init(4, opts).cy)).not.toBe(JSON.stringify(a.cy));
    expect(a.gates.length).toBeGreaterThan(15);
    expect(a.gh.every((g) => g >= 2.5)).toBe(true);
  });

  it('Schub hebt, sonst zieht die Schwerkraft', () => {
    const up = game.init(3, opts);
    const down = game.init(3, opts);
    for (let i = 0; i < 20; i++) {
      game.step(up, A);
      game.step(down, NEUTRAL_INPUT);
    }
    expect(up.y).toBeGreaterThan(0.3);
    expect(down.y).toBeLessThan(-0.3);
    // Zeiger gedrückt = ebenfalls Schub
    const ptr = game.init(3, opts);
    for (let i = 0; i < 20; i++) game.step(ptr, { ...NEUTRAL_INPUT, pd: true });
    expect(ptr.y).toBeGreaterThan(0.3);
  });

  it('ein Tor bringt 100 Punkte, ein verfehltes keine', () => {
    const s: RocketState = game.init(3, opts);
    s.rocks = [];
    const g = s.gates[0]!;
    s.x = g.x - 0.05;
    s.y = g.y;
    s.vy = 0;
    s.invuln = 100;
    game.step(s, NEUTRAL_INPUT);
    expect(s.gatesPassed).toBe(1);
    expect(game.score(s)).toBe(100 + Math.floor(s.x));
    const m: RocketState = game.init(3, opts);
    m.rocks = [];
    const g2 = m.gates[0]!;
    m.x = g2.x - 0.05;
    m.y = g2.y + 2.6;
    m.invuln = 100;
    game.step(m, NEUTRAL_INPUT);
    expect(m.gatesPassed).toBe(0);
    expect(m.gatesMissed).toBe(1);
  });

  it('Wandberührung kostet ein Leben, danach kurz unverwundbar; drei Leben dann Ende', () => {
    const s: RocketState = game.init(3, opts);
    s.rocks = [];
    for (let i = 0; i < 400 && s.crashes === 0; i++) game.step(s, NEUTRAL_INPUT);
    expect(s.crashes).toBe(1);
    expect(s.lives).toBe(2);
    expect(s.invuln).toBeGreaterThan(0);
    expect(Math.abs(s.y - caveAt(s.cy, s.x))).toBeLessThan(0.01);
    for (let i = 0; i < 1800 && !game.done(s); i++) game.step(s, NEUTRAL_INPUT);
    expect(s.lives).toBe(0);
    expect(game.done(s)).toBe(true);
  });

  it('ein Felsen trifft ebenfalls', () => {
    const s: RocketState = game.init(3, opts);
    s.rocks = [{ x: 5, y: 0, r: 0.8 }];
    s.x = 4.6;
    s.y = 0;
    s.vy = 0;
    s.cy = s.cy.map(() => 0);
    for (let i = 0; i < 30; i++) game.step(s, i < 6 ? A : NEUTRAL_INPUT);
    expect(s.crashes).toBeGreaterThanOrEqual(1);
  });
});
