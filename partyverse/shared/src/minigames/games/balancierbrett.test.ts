import { describe, expect, it } from 'vitest';
import { BOARD_R, game, type BoardState } from './balancierbrett';
import { NEUTRAL_INPUT } from '../types';

const opts = { playerIndex: 0, players: 2 };

describe('Balancier-Brett', () => {
  it('erzeugt für dasselbe Seed dieselbe Welt und Ziele abseits der Löcher', () => {
    const a = game.init(11, opts);
    const b = game.init(11, opts);
    expect(a.holes).toEqual(b.holes);
    expect(a.targets).toEqual(b.targets);
    expect(game.init(12, opts).holes).not.toEqual(a.holes);
    for (const t of a.targets) {
      expect(Math.hypot(t.x, t.y)).toBeLessThan(BOARD_R);
      for (const h of a.holes) expect(Math.hypot(t.x - h.x, t.y - h.y)).toBeGreaterThan(1.5);
    }
  });

  it('Neigung nach rechts beschleunigt die Kugel nach rechts (mit Trägheit)', () => {
    const s: BoardState = game.init(2, opts);
    s.dist = { a1: 0, p1: 0, w1: 1, a2: 0, p2: 0, w2: 1 };
    for (let i = 0; i < 30; i++) game.step(s, { ...NEUTRAL_INPUT, x: 1 });
    expect(s.px).toBeGreaterThan(0.3);
    const v = s.vx;
    for (let i = 0; i < 5; i++) game.step(s, NEUTRAL_INPUT);
    expect(s.vx).toBeGreaterThan(v * 0.5); // rollt weiter
  });

  it('Ziel zählt 100 Punkte, Absturz kostet Punkte und setzt die Kugel zurück', () => {
    const s: BoardState = game.init(2, opts);
    s.dist = { a1: 0, p1: 0, w1: 1, a2: 0, p2: 0, w2: 1 };
    const t = s.targets[0]!;
    s.px = t.x;
    s.py = t.y;
    game.step(s, NEUTRAL_INPUT);
    expect(s.cp).toBe(1);
    expect(game.score(s)).toBeGreaterThanOrEqual(100);
    const before = game.score(s);
    s.px = BOARD_R + 1;
    s.py = 0;
    game.step(s, NEUTRAL_INPUT);
    expect(s.falls).toBe(1);
    for (let i = 0; i < 70; i++) game.step(s, NEUTRAL_INPUT);
    expect(s.px).toBeCloseTo(0, 1);
    expect(game.score(s)).toBeLessThan(before);
  });
});
