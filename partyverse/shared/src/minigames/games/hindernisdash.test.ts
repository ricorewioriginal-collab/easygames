import { describe, expect, it } from 'vitest';
import { game, type DashState } from './hindernisdash';
import { NEUTRAL_INPUT, type InputFrame } from '../types';

const opts = { playerIndex: 0, players: 3 };

function withRow(cell: number, lane = 0): DashState {
  const s = game.init(7, opts);
  s.coins = [];
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
});
