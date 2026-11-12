import { describe, expect, it } from 'vitest';
import {
  COIN_POINTS,
  GRID,
  LIVES,
  game,
  tileCenter,
  tileIndex,
  warnLength,
  type FarbState,
} from './farbwechsel';
import { runBot } from '../simulate';
import { NEUTRAL_INPUT } from '../types';

const opts = { playerIndex: 0, players: 2 };

describe('Farbwechsel-Arena', () => {
  it('erzeugt für dasselbe Seed dieselben Fliesen und Zielfarben, Zielfarbe kommt vor', () => {
    const a = game.init(14, opts);
    const b = game.init(14, opts);
    expect(a.colors).toEqual(b.colors);
    expect(a.target).toBe(b.target);
    expect(a.colors.length).toBe(GRID * GRID);
    expect(a.colors.filter((c) => c === a.target).length).toBeGreaterThanOrEqual(5);
  });

  it('Fliesenmitte liegt auf der richtigen Fliese', () => {
    for (let i = 0; i < GRID * GRID; i++) {
      const c = tileCenter(i);
      expect(tileIndex(c.x, c.y)).toBe(i);
    }
  });

  it('wer auf der Zielfarbe steht, übersteht die Runde und bekommt 100 Punkte', () => {
    const s: FarbState = game.init(3, opts);
    const idx = s.colors.findIndex((c) => c === s.target);
    const c = tileCenter(idx);
    s.px = c.x;
    s.py = c.y;
    for (let i = 0; i < s.warnLen + 5; i++) game.step(s, NEUTRAL_INPUT);
    expect(s.phase).toBe('drop');
    expect(s.dead).toBe(false);
    expect(s.rounds).toBe(1);
    expect(game.score(s)).toBeGreaterThanOrEqual(100);
  });

  it('wer auf einer falschen Fliese steht, fällt und verliert ein Leben, nach 2 Stürzen ist Schluss', () => {
    const s: FarbState = game.init(3, opts);
    const idx = s.colors.findIndex((c) => c !== s.target);
    const c = tileCenter(idx);
    s.px = c.x;
    s.py = c.y;
    for (let i = 0; i < s.warnLen + 80; i++) game.step(s, NEUTRAL_INPUT);
    expect(s.falls).toBe(1);
    expect(s.lives).toBe(LIVES - 1);
    expect(game.done(s)).toBe(false);
    // Wiedereinstieg auf einer stehenden Fliese
    expect(s.dead).toBe(false);
    for (let i = 0; i < 400 && !game.done(s); i++) {
      if (s.phase === 'warn') {
        const bad = s.colors.findIndex((k) => k !== s.target);
        const b = tileCenter(bad);
        s.px = b.x;
        s.py = b.y;
      }
      game.step(s, NEUTRAL_INPUT);
    }
    expect(s.falls).toBe(2);
    expect(game.done(s)).toBe(true);
    expect(s.rounds).toBe(0);
  });

  it('Farbwechsel: ab Runde 3 wechselt die Zielfarbe in manchen Runden mitten in der Warnzeit', () => {
    let switches = 0;
    for (let seed = 1; seed <= 20; seed++) {
      const s = game.init(seed, opts);
      let lastRound = -1;
      let before = -1;
      for (let i = 0; i < 1800 && !game.done(s); i++) {
        // immer auf eine Zielfliese stellen, damit man überlebt
        if (s.phase === 'warn') {
          const k = s.colors.findIndex((q) => q === s.target);
          const t = tileCenter(k);
          s.px = t.x;
          s.py = t.y;
        }
        if (s.round !== lastRound) {
          lastRound = s.round;
          before = s.target;
        }
        game.step(s, NEUTRAL_INPUT);
        if (s.phase === 'warn' && s.switched && s.sinceSwitch === 0) {
          expect(s.round).toBeGreaterThanOrEqual(2);
          expect(s.target).not.toBe(before);
          expect(s.timer).toBeGreaterThan(60);
          switches++;
        }
      }
    }
    expect(switches).toBeGreaterThan(10);
  });

  it('Münzen liegen auf fremden Fliesen und geben Punkte', () => {
    const s: FarbState = game.init(8, opts);
    expect(s.coins.length).toBe(2);
    for (const c of s.coins) expect(s.colors[tileIndex(c.x, c.y)]).not.toBe(s.target);
    s.px = s.coins[0]!.x;
    s.py = s.coins[0]!.y;
    game.step(s, NEUTRAL_INPUT);
    expect(s.coinCount).toBe(1);
    expect(game.score(s)).toBe(COIN_POINTS);
  });

  it('Steigerung und Bots: Warnzeit sinkt, 0.88 > 0.6 > 0.3, gleiche Welt für alle', () => {
    expect(warnLength(7)).toBeLessThan(warnLength(0) * 0.5);
    const avg = (skill: number) => {
      let t = 0;
      for (let i = 0; i < 16; i++) t += runBot(game, 30 + i, opts, skill, i + 1).score;
      return t / 16;
    };
    const a = avg(0.3);
    const b = avg(0.6);
    const c = avg(0.88);
    expect(b).toBeGreaterThan(a);
    expect(c).toBeGreaterThan(b);
    // Fliesen und Zielfarben hängen nicht vom Spieler ab
    const x = game.init(21, opts);
    const y = game.init(21, opts);
    for (let i = 0; i < 1800 && !game.done(x) && !game.done(y); i++) {
      game.step(x, NEUTRAL_INPUT);
      game.step(y, { ...NEUTRAL_INPUT, x: 1, a: i % 30 === 0 });
      expect(x.round).toBe(y.round);
      expect(x.target).toBe(y.target);
    }
  });
});
