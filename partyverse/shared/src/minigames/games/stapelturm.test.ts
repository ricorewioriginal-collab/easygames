import { describe, expect, it } from 'vitest';
import { runBot } from '../simulate';
import {
  BASE_W,
  FALL_TICKS,
  PERFECT_TOL,
  SPARES,
  WIND_FROM,
  craneSpeed,
  game,
  heightOf,
  isGold,
  windFactor,
  type TowerState,
} from './stapelturm';
import { NEUTRAL_INPUT } from '../types';

const opts = { playerIndex: 0, players: 2 };

/** Setzt den Kran auf x und lässt den Block fallen, bis er gelandet ist. */
function dropAt(s: TowerState, x: number): void {
  s.phase = 'swing';
  s.cx = x;
  s.dir = 0; // Kran steht still (dir 0 → keine Bewegung)
  game.step(s, NEUTRAL_INPUT);
  s.prevA = false;
  game.step(s, { ...NEUTRAL_INPUT, a: true });
  for (let i = 0; i < FALL_TICKS + 1; i++) game.step(s, NEUTRAL_INPUT);
}

describe('Stapelturm', () => {
  it('schneidet überstehende Teile ab und verkleinert den Block', () => {
    const s = game.init(4, opts);
    const w0 = s.w;
    dropAt(s, 1.5);
    expect(heightOf(s)).toBe(1);
    const b = s.blocks[1]!;
    expect(b.w).toBeCloseTo(w0 - 1.5, 5);
    expect(b.x).toBeCloseTo(0.75, 5);
    expect(s.last.cutW).toBeCloseTo(1.5, 5);
    expect(s.last.perfect).toBe(false);
  });

  it('perfekte Landung behält die Breite und gibt Bonus (Serie wächst)', () => {
    const s = game.init(4, opts);
    const w0 = s.w;
    dropAt(s, PERFECT_TOL * 0.5);
    expect(s.last.perfect).toBe(true);
    expect(s.w).toBe(w0);
    expect(s.bonus).toBe(30);
    dropAt(s, 0);
    expect(s.bonus).toBe(30 + 60);
    expect(game.score(s)).toBe(2 * 50 + 90);
  });

  it('Verfehlen kostet einen Ersatzblock, erst ohne Ersatz ist Schluss; Höhe zählt weiter', () => {
    const s = game.init(4, opts);
    dropAt(s, 0);
    for (let k = 0; k < SPARES; k++) {
      dropAt(s, 5);
      expect(game.done(s)).toBe(false);
      expect(s.spares).toBe(SPARES - 1 - k);
      expect(heightOf(s)).toBe(1);
    }
    dropAt(s, 5);
    expect(game.done(s)).toBe(true);
    expect(s.lost).toBe(true);
    expect(game.score(s)).toBeGreaterThanOrEqual(50);
  });

  it('drei Perfekte in Folge machen den Block wieder breiter', () => {
    const s = game.init(4, opts);
    dropAt(s, 1);
    const w1 = s.w;
    expect(w1).toBeCloseTo(BASE_W - 1, 5);
    const x = s.blocks[1]!.x;
    dropAt(s, x);
    dropAt(s, x);
    expect(s.w).toBeCloseTo(w1, 5);
    dropAt(s, x);
    expect(s.last.grow).toBe(true);
    expect(s.w).toBeCloseTo(w1 + 0.5, 5);
  });

  it('Goldblock jedes 5. Stockwerk: perfekt gibt +100 extra', () => {
    expect(isGold(4)).toBe(true);
    expect(isGold(3)).toBe(false);
    const s = game.init(4, opts);
    dropAt(s, 1);
    for (let i = 0; i < 3; i++) dropAt(s, s.blocks[heightOf(s)]!.x + 0.4);
    expect(heightOf(s)).toBe(4);
    const before = s.bonus;
    dropAt(s, s.blocks[4]!.x);
    expect(s.last.gold).toBe(true);
    expect(s.bonus - before).toBe(30 + 100);
  });

  it('Schwierigkeit steigt: Kran schneller, ab Stockwerk 8 Wind', () => {
    expect(craneSpeed(20)).toBeGreaterThan(craneSpeed(2) * 1.8);
    expect(windFactor(WIND_FROM - 1, 35)).toBe(1);
    const f = [0, 20, 35, 70, 105].map((w) => windFactor(WIND_FROM + 4, w));
    expect(Math.max(...f) - Math.min(...f)).toBeGreaterThan(0.4);
  });

  it('Bots: 0.3 < 0.6 < 0.88 im Schnitt', () => {
    const avg = (skill: number) => {
      let sum = 0;
      for (let i = 0; i < 12; i++) sum += runBot(game, 90 + i, opts, skill, 4 + i).score;
      return sum / 12;
    };
    const [w, m, st] = [avg(0.3), avg(0.6), avg(0.88)];
    expect(m).toBeGreaterThan(w);
    expect(st).toBeGreaterThan(m);
  });

  it('dasselbe Seed gibt denselben Kranstart', () => {
    expect(game.init(21, opts).cx).toBe(game.init(21, opts).cx);
  });
});
