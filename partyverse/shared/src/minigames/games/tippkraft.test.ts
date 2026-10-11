import { describe, expect, it } from 'vitest';
import { NEUTRAL_INPUT } from '../types';
import { game, gustAt, speedOf, type TippState } from './tippkraft';

const OPTS = { playerIndex: 0, players: 2 };
const A = { ...NEUTRAL_INPUT, a: true };
const B = { ...NEUTRAL_INPUT, b: true };

describe('Tippkraft', () => {
  it('Böen kommen aus dem Seed und liegen im Spielzeitraum', () => {
    const a = game.init(5, OPTS);
    expect(a.gusts.length).toBeGreaterThanOrEqual(3);
    expect(game.init(5, OPTS).gusts).toEqual(a.gusts);
    expect(game.init(6, OPTS).gusts).not.toEqual(a.gusts);
    expect(a.gusts.every((g) => g.start > 100 && g.end < 1200)).toBe(true);
  });
  it('abwechselndes Tippen lädt Kraft, dieselbe Taste wiederholt kostet Kraft', () => {
    const alt = game.init(1, OPTS);
    for (let i = 0; i < 6; i++) {
      game.step(alt, i % 2 ? B : A);
      game.step(alt, NEUTRAL_INPUT);
    }
    const same = game.init(1, OPTS);
    for (let i = 0; i < 6; i++) {
      game.step(same, A);
      game.step(same, NEUTRAL_INPUT);
    }
    expect(alt.power).toBeGreaterThan(20);
    expect(same.power).toBeLessThan(alt.power / 2);
    expect(same.stumbles).toBe(5);
    expect(speedOf(80)).toBeGreaterThan(speedOf(20));
  });
  it('in einer Böe hilft nur Halten: Tippen verliert Kraft und Strecke, Halten bewahrt sie', () => {
    const run = (hold: boolean) => {
      const s: TippState = game.init(2, OPTS);
      s.t = s.gusts[0]!.start;
      s.power = 70;
      s.dist = 5;
      for (let i = 0; i < 40; i++) game.step(s, hold ? A : NEUTRAL_INPUT);
      return s;
    };
    expect(gustAt(game.init(2, OPTS).gusts, game.init(2, OPTS).gusts[0]!.start)).toBe(0);
    const held = run(true);
    const idle = run(false);
    expect(held.power).toBeGreaterThan(idle.power + 20);
    expect(held.dist).toBeGreaterThan(idle.dist);
  });
  it('ein guter Dauer-Tipper kommt weiter als ein langsamer', () => {
    const play = (iv: number) => {
      const s = game.init(9, OPTS);
      let side = 0;
      for (let t = 0; t < 1200; t++) {
        if (t % iv === 0 && gustAt(s.gusts, s.t) < 0) {
          game.step(s, side ? B : A);
          side = 1 - side;
        } else game.step(s, gustAt(s.gusts, s.t) >= 0 ? A : NEUTRAL_INPUT);
      }
      return game.score(s);
    };
    expect(play(8)).toBeGreaterThan(play(18) * 1.3);
  });
});
