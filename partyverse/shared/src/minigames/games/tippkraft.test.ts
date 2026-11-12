import { describe, expect, it } from 'vitest';
import { NEUTRAL_INPUT } from '../types';
import { runBot } from '../simulate';
import { HILL_FROM, SPRINT_FROM, flowLevel, game, gustAt, speedOf, type TippState } from './tippkraft';

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
  it('schnelles sauberes Wechseln baut Schwung auf, ein Stolperer nimmt ihn weg', () => {
    const s = game.init(1, OPTS);
    s.gusts = [];
    for (let i = 0; i < 40; i++) {
      game.step(s, i % 2 ? B : A);
      for (let k = 0; k < 6; k++) game.step(s, NEUTRAL_INPUT);
    }
    expect(flowLevel(s.flow)).toBe(3);
    game.step(s, B);
    game.step(s, NEUTRAL_INPUT);
    game.step(s, B);
    expect(s.flow).toBe(0);
    // Langsames Tippen baut keinen Schwung auf
    const slow = game.init(1, OPTS);
    for (let i = 0; i < 20; i++) {
      game.step(slow, i % 2 ? B : A);
      for (let k = 0; k < 16; k++) game.step(slow, NEUTRAL_INPUT);
    }
    expect(flowLevel(slow.flow)).toBe(0);
  });
  it('Abschnitte: bergauf langsamer, im Endspurt zählen Meter doppelt', () => {
    const run = (t0: number) => {
      const s: TippState = game.init(3, OPTS);
      s.gusts = [];
      s.t = t0;
      s.power = 80;
      for (let i = 0; i < 60; i++) game.step(s, i % 8 === 0 ? (i % 16 ? B : A) : NEUTRAL_INPUT);
      return s;
    };
    const flat = run(60);
    const hill = run(HILL_FROM + 60);
    const sprint = run(SPRINT_FROM + 60);
    expect(hill.dist).toBeLessThan(flat.dist * 0.9);
    expect(flat.sprint).toBe(0);
    expect(sprint.sprint).toBeCloseTo(sprint.dist, 5);
    expect(game.score(sprint)).toBeGreaterThan(game.score(flat) * 1.5);
  });
  it('Böen werden später länger und die Warnung kürzer', () => {
    for (const seed of [1, 2, 3, 4]) {
      const g = game.init(seed, OPTS).gusts;
      const first = g[0]!;
      const last = g[g.length - 1]!;
      expect(last.warn).toBeLessThan(first.warn);
      expect(g.every((x) => x.end <= 1200 && x.end > x.start)).toBe(true);
    }
  });
  it('Bots: 0.3 < 0.6 < 0.88 im Schnitt, nie Absturz', () => {
    const avg = (skill: number) => {
      let sum = 0;
      for (let i = 0; i < 10; i++) sum += runBot(game, 40 + i, OPTS, skill, 9 + i).score;
      return sum / 10;
    };
    const [w, m, st] = [avg(0.3), avg(0.6), avg(0.88)];
    expect(m).toBeGreaterThan(w);
    expect(st).toBeGreaterThan(m * 1.3);
  });
});
