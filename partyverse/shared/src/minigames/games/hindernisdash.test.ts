import { describe, expect, it } from 'vitest';
import { game, BOOST_TICKS, type DashState } from './hindernisdash';
import { runBot } from '../simulate';
import { NEUTRAL_INPUT, type InputFrame } from '../types';

const opts = { playerIndex: 0, players: 3 };

function withRow(cell: number, lane = 0): DashState {
  const s = game.init(7, opts);
  s.coins = [];
  s.boosts = [];
  const c: [number, number, number] = [-1, -1, -1];
  c[lane + 1] = cell;
  s.rows = [{ z: 8, c }];
  return s;
}
const run = (s: DashState, ticks: number, f: (t: number) => InputFrame = () => NEUTRAL_INPUT) => {
  for (let t = 0; t < ticks; t++) game.step(s, f(t));
};

describe('hindernisdash – Regeln', () => {
  it('erzeugt für dasselbe Seed dieselbe Bahn', () => {
    const a = game.init(11, opts);
    const b = game.init(11, { playerIndex: 2, players: 4 });
    expect(JSON.stringify([a.rows, a.coins])).toBe(JSON.stringify([b.rows, b.coins]));
    expect(JSON.stringify(a.rows)).not.toBe(JSON.stringify(game.init(12, opts).rows));
    // jede Reihe lässt mindestens eine Spur ohne Mauer
    expect(a.rows.every((r) => r.c.some((v) => v !== 2))).toBe(true);
  });

  it('Spurwechsel geschieht bei der x-Flanke, nicht bei gehaltener Richtung', () => {
    const s = game.init(1, opts);
    run(s, 10, () => ({ ...NEUTRAL_INPUT, x: 1 }));
    expect(s.lane).toBe(1);
    run(s, 5, () => ({ ...NEUTRAL_INPUT, x: 0 }));
    run(s, 1, () => ({ ...NEUTRAL_INPUT, x: -1 }));
    run(s, 1, () => ({ ...NEUTRAL_INPUT, x: -1 }));
    expect(s.lane).toBe(0);
    run(s, 10, () => ({ ...NEUTRAL_INPUT, x: -1 }));
    run(s, 3);
    run(s, 1, () => ({ ...NEUTRAL_INPUT, x: -1 }));
    expect(s.lane).toBe(-1);
  });

  it('Hürde: ohne Sprung Treffer, mit Sprung frei', () => {
    const hit = withRow(0);
    run(hit, 120);
    expect(hit.crashes).toBe(1);
    expect(hit.stun).toBeGreaterThan(0);
    const ok = withRow(0);
    // bei ~9 m/s erreicht man z = 8 nach rund 53 Ticks; Absprung davor
    run(ok, 120, (t) => ({ ...NEUTRAL_INPUT, y: t === 38 ? 1 : 0 }));
    expect(ok.crashes).toBe(0);
    expect(ok.jumps).toBe(1);
  });

  it('Balken: Rutschen ist frei, Stehen und Springen sind Treffer', () => {
    const stand = withRow(1);
    run(stand, 120);
    expect(stand.crashes).toBe(1);
    const slide = withRow(1);
    run(slide, 120, (t) => ({ ...NEUTRAL_INPUT, y: t === 42 ? -1 : 0 }));
    expect(slide.crashes).toBe(0);
    expect(slide.slides).toBe(1);
  });

  it('Mauer: nur Spurwechsel hilft; Betäubung bremst', () => {
    const wall = withRow(2);
    run(wall, 120);
    expect(wall.crashes).toBe(1);
    const dodge = withRow(2);
    run(dodge, 120, (t) => ({ ...NEUTRAL_INPUT, x: t === 3 ? 1 : 0 }));
    expect(dodge.crashes).toBe(0);
    // Betäubung bremst deutlich
    const a = withRow(2);
    run(a, 20);
    const z0 = a.z;
    const b = withRow(2);
    b.rows = [{ z: 2, c: [-1, 2, -1] }];
    run(b, 20);
    expect(b.stun).toBeGreaterThan(0);
    expect(b.z - 0).toBeLessThan(z0);
  });

  it('Münzen und Strecke bilden die Wertung', () => {
    const s = game.init(1, opts);
    s.rows = [];
    s.coins = [{ z: 3, lane: 0, y: 0.8, got: false }];
    run(s, 60);
    expect(s.coinCount).toBe(1);
    expect(game.score(s)).toBe(Math.floor(s.z) + 3);
  });

  it('Turbo-Feld macht schneller, Anstoßen beendet den Turbo', () => {
    const a = game.init(7, opts);
    const b = game.init(7, opts);
    for (const s of [a, b]) {
      s.rows = [];
      s.coins = [];
    }
    a.boosts = [];
    b.boosts = [{ z: 3, lane: 0, got: false }];
    run(a, 60);
    run(b, 60);
    expect(b.boostCount).toBe(1);
    expect(b.boost).toBeGreaterThan(0);
    expect(b.boost).toBeLessThan(BOOST_TICKS);
    expect(b.z).toBeGreaterThan(a.z + 1);
    const c = withRow(2);
    c.boost = 50;
    run(c, 60);
    expect(c.crashes).toBe(1);
    expect(c.boost).toBe(0);
  });

  it('wird dichter: späte Reihen liegen enger und es gibt Sperrreihen ohne freie Spur', () => {
    const s = game.init(21, opts);
    const gaps = s.rows.slice(1).map((r, i) => r.z - s.rows[i]!.z);
    const early = gaps.slice(0, 6).reduce((x, y) => x + y, 0) / 6;
    const late = gaps.slice(-6).reduce((x, y) => x + y, 0) / 6;
    expect(late).toBeLessThan(early - 3);
    let blocked = 0;
    for (const seed of [1, 2, 3, 4, 5])
      blocked += game.init(seed, opts).rows.filter((r) => r.c.every((v) => v === 0 || v === 1)).length;
    expect(blocked).toBeGreaterThan(5);
    expect(s.boosts.length).toBeGreaterThan(0);
  });

  it('Bots: stark > mittel > schwach', () => {
    const avg = (skill: number) => {
      let sum = 0;
      for (let i = 0; i < 10; i++) sum += runBot(game, 70 + i, opts, skill, 1 + i).score;
      return sum / 10;
    };
    const lo = avg(0.3);
    const mid = avg(0.6);
    const hi = avg(0.88);
    expect(hi).toBeGreaterThan(mid);
    expect(mid).toBeGreaterThan(lo);
  });
});
