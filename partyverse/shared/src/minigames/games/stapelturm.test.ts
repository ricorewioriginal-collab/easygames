import { describe, expect, it } from 'vitest';
import { FALL_TICKS, PERFECT_TOL, game, heightOf, type TowerState } from './stapelturm';
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

  it('Verfehlen beendet das Spiel; Höhe zählt weiter', () => {
    const s = game.init(4, opts);
    dropAt(s, 0);
    dropAt(s, 5);
    expect(game.done(s)).toBe(true);
    expect(s.lost).toBe(true);
    expect(game.score(s)).toBeGreaterThanOrEqual(50);
  });

  it('dasselbe Seed gibt denselben Kranstart', () => {
    expect(game.init(21, opts).cx).toBe(game.init(21, opts).cx);
  });
});
