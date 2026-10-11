import { describe, expect, it } from 'vitest';
import { game, type WolkenState } from './wolkenhuepfer';
import { NEUTRAL_INPUT } from '../types';

const opts = { playerIndex: 0, players: 3 };
const A = { ...NEUTRAL_INPUT, a: true };

/** Eine flache, lange Testwolke und sonst nichts im Weg */
function flat(): WolkenState {
  const s = game.init(1, opts);
  s.clouds = [{ x0: -4, x1: 400, y: 0, kind: 0, amp: 0, w: 0, ph: 0 }];
  s.stars = [];
  return s;
}

describe('wolkenhuepfer – Regeln', () => {
  it('erzeugt für dasselbe Seed dasselbe Level (alle Spieler gleich), für andere ein anderes', () => {
    const a = game.init(42, { playerIndex: 0, players: 4 });
    const b = game.init(42, { playerIndex: 3, players: 4 });
    const c = game.init(43, opts);
    expect(JSON.stringify([a.clouds, a.stars])).toBe(JSON.stringify([b.clouds, b.stars]));
    expect(JSON.stringify(a.clouds)).not.toBe(JSON.stringify(c.clouds));
    expect(a.clouds.some((x) => x.kind === 3)).toBe(true);
    expect(a.clouds.some((x) => x.kind === 1 || x.kind === 2)).toBe(true);
  });

  it('längeres Halten ergibt einen höheren Sprung', () => {
    const peak = (hold: number) => {
      const s = flat();
      let max = 0;
      for (let i = 0; i < 70; i++) {
        game.step(s, i < hold ? A : NEUTRAL_INPUT);
        max = Math.max(max, s.y);
      }
      return max;
    };
    const lo = peak(1);
    const hi = peak(30);
    expect(lo).toBeGreaterThan(0.5);
    expect(hi).toBeGreaterThan(lo + 0.8);
  });

  it('ein Absturz kostet ein Leben und setzt auf die letzte Wolke zurück', () => {
    const s = game.init(9, opts);
    for (let i = 0; i < 400 && s.falls === 0; i++) game.step(s, NEUTRAL_INPUT);
    expect(s.falls).toBe(1);
    expect(s.lives).toBe(2);
    expect(s.grounded).toBe(true);
    expect(s.respawn).toBeGreaterThan(0);
    const c = s.clouds[s.lastPlat]!;
    expect(s.x).toBeLessThan(c.x0 + 1);
    expect(s.maxX).toBeGreaterThan(s.x);
  });

  it('nach drei Abstürzen ist Schluss; die Wertung behält die weiteste Strecke', () => {
    const s = game.init(9, opts);
    for (let i = 0; i < 1800 && !game.done(s); i++) game.step(s, NEUTRAL_INPUT);
    expect(s.lives).toBe(0);
    expect(game.done(s)).toBe(true);
    expect(game.score(s)).toBe(Math.floor(s.maxX - 1) + 3 * s.starCount);
  });

  it('Sterne und Strecke zählen zur Wertung', () => {
    const s = flat();
    s.stars = [{ x: 5, y: 0.6, got: false }];
    for (let i = 0; i < 60; i++) game.step(s, NEUTRAL_INPUT);
    expect(s.starCount).toBe(1);
    expect(game.score(s)).toBe(Math.floor(s.maxX - 1) + 3);
  });

  it('Federwolken schleudern hoch', () => {
    const s = flat();
    s.clouds = [{ x0: -4, x1: 400, y: 0, kind: 3, amp: 0, w: 0, ph: 0 }];
    s.grounded = false;
    s.y = 0.3;
    s.vy = -5;
    let max = 0;
    for (let i = 0; i < 60; i++) {
      game.step(s, NEUTRAL_INPUT);
      max = Math.max(max, s.y);
    }
    expect(s.springs).toBeGreaterThan(0);
    expect(max).toBeGreaterThan(3);
  });
});
