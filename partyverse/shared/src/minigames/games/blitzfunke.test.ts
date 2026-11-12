import { describe, expect, it } from 'vitest';
import { NEUTRAL_INPUT } from '../types';
import { runBot } from '../simulate';
import { fakeOn, game, makeRounds, pointsFor, type BlitzState } from './blitzfunke';

const opts = { playerIndex: 0, players: 4 };
const A = { ...NEUTRAL_INPUT, a: true };
const B = { ...NEUTRAL_INPUT, b: true };

/** Bis zur nächsten Phase laufen lassen (ohne Eingabe) */
const until = (s: BlitzState, pred: (s: BlitzState) => boolean, max = 600) => {
  for (let i = 0; i < max && !pred(s); i++) game.step(s, NEUTRAL_INPUT);
};

describe('blitzfunke', () => {
  it('Rundenfolge hängt nur vom Seed ab und wird schwerer', () => {
    const a = makeRounds(7);
    expect(makeRounds(7)).toEqual(a);
    expect(makeRounds(8)).not.toEqual(a);
    expect(a[0]!.want).toBe('a');
    expect(a[1]!.want).toBe('b');
    expect(a[0]!.fakes.length).toBe(0);
    expect(a[a.length - 1]!.window).toBeLessThan(a[0]!.window);
    expect(a[a.length - 1]!.mult).toBe(2);
    // über viele Seeds gibt es in späten Runden Finten
    let fakes = 0;
    for (let sd = 0; sd < 20; sd++)
      fakes += makeRounds(sd)
        .slice(2)
        .reduce((n, r) => n + r.fakes.length, 0);
    expect(fakes).toBeGreaterThan(20);
  });

  it('richtige Taste nach dem Signal gibt Punkte, schneller = mehr', () => {
    expect(pointsFor(150)).toBe(1000);
    expect(pointsFor(300)).toBeLessThan(pointsFor(200));
    const s = game.init(3, opts);
    until(s, (q) => q.phase === 'go');
    for (let i = 0; i < 14; i++) game.step(s, NEUTRAL_INPUT);
    game.step(s, A);
    expect(s.outcome).toBe(1);
    expect(s.total).toBeGreaterThan(700);
  });

  it('Fehlstart und falsche Taste kosten Punkte, nie unter 0', () => {
    const s = game.init(3, opts);
    game.step(s, A);
    expect(s.outcome).toBe(2);
    expect(s.total).toBe(0);
    // weitere Eingaben in derselben Runde ändern nichts
    game.step(s, NEUTRAL_INPUT);
    game.step(s, B);
    expect(s.falseStarts).toBe(1);
    until(s, (q) => q.round === 1 && q.phase === 'go');
    expect(s.sched[1]!.want).toBe('b');
    game.step(s, A);
    expect(s.outcome).toBe(3);
  });

  it('der Ablauf ist unabhängig von der Reaktion (alle sehen das Signal gleichzeitig)', () => {
    const run = (press: boolean) => {
      const s = game.init(11, opts);
      const goTicks: number[] = [];
      let t = 0;
      let last = '';
      while (!game.done(s) && t < 5000) {
        game.step(s, press && s.phase === 'go' && s.timer > 10 ? A : NEUTRAL_INPUT);
        if (s.phase === 'go' && last !== 'go') goTicks.push(t);
        last = s.phase;
        t++;
      }
      return { goTicks, t };
    };
    expect(run(true)).toEqual(run(false));
    expect(run(false).t).toBeLessThanOrEqual(game.duration * 60);
  });

  it('Finte ist erkennbar und Drücken während der Finte ist ein Fehlstart', () => {
    let seed = 0;
    while (makeRounds(seed)[2]!.fakes.length === 0) seed++;
    const s = game.init(seed, opts);
    until(s, (q) => q.round === 2);
    until(s, (q) => fakeOn(q));
    expect(fakeOn(s)).toBe(true);
    game.step(s, A);
    expect(s.outcome).toBe(2);
  });

  it('Bots: stark > mittel > schwach, keiner hängt', () => {
    const avg = (skill: number) => {
      let sum = 0;
      for (let i = 0; i < 16; i++) {
        const r = runBot(game, 200 + i, opts, skill, 9 + i);
        expect(r.finished).toBe(true);
        sum += r.score;
      }
      return sum / 16;
    };
    const lo = avg(0.3);
    const mid = avg(0.6);
    const hi = avg(0.88);
    expect(hi).toBeGreaterThan(mid);
    expect(mid).toBeGreaterThan(lo);
    expect(hi).toBeLessThan(7 * 1000 * 1.4);
  });
});
