import { describe, expect, it } from 'vitest';
import {
  BOARD_R,
  GUST_WARN,
  HOLE_R,
  TARGET_R,
  edgeR,
  game,
  gustAt,
  speedBonus,
  type BoardState,
} from './balancierbrett';
import { runBot } from '../simulate';
import { NEUTRAL_INPUT } from '../types';
import { Rng } from '../../rng';

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
  it('Regression: auch Welten mit weniger als 7 platzierbaren Löchern lassen den Bot nie abstürzen', () => {
    for (let seed = 1; seed <= 400; seed++) {
      const st = game.init((seed * 7919) % 2147483647, opts);
      const r = new Rng(seed);
      for (let i = 0; i < 1800 && !game.done(st); i++) game.step(st, game.bot(st, 0.21, r));
      expect(Number.isFinite(game.score(st))).toBe(true);
    }
  }, 60000);
  it('Regression: jede Welt hat 40 Ziele, keines im Loch (früher gab es Welten ganz ohne Ziel)', () => {
    for (let seed = 1; seed <= 300; seed++) {
      const st = game.init(seed * 37, opts);
      expect(st.targets).toHaveLength(40);
      for (const t of st.targets)
        for (const h of st.holes) expect(Math.hypot(t.x - h.x, t.y - h.y)).toBeGreaterThan(HOLE_R + TARGET_R);
    }
  });
  it('Windböe: erst Warnung, dann Schub in Böenrichtung', () => {
    const s: BoardState = game.init(4, opts);
    s.dist = { a1: 0, p1: 0, w1: 1, a2: 0, p2: 0, w2: 1 };
    const g = s.gusts[0]!;
    expect(g.at).toBeGreaterThanOrEqual(6 * 60);
    expect(gustAt(s, g.at + 5).warn).toBe(g);
    expect(gustAt(s, g.at + 5).x).toBe(0);
    const mid = gustAt(s, g.at + GUST_WARN + 20);
    expect(mid.active).toBe(g);
    expect(mid.x * Math.cos(g.a) + mid.y * Math.sin(g.a)).toBeGreaterThan(5);
    // Kugel wird mitgeschoben
    s.tick = g.at + GUST_WARN;
    for (let i = 0; i < 30; i++) game.step(s, NEUTRAL_INPUT);
    expect(s.px * Math.cos(g.a) + s.py * Math.sin(g.a)).toBeGreaterThan(0.3);
  });
  it('Steigerung: Rand bröckelt, Tempo-Bonus nur für schnelle Ziele, Bots 0.88 > 0.6 > 0.3', () => {
    expect(edgeR(0)).toBe(BOARD_R);
    expect(edgeR(30 * 60)).toBeLessThan(BOARD_R - 0.7);
    expect(speedBonus(30)).toBeGreaterThan(40);
    expect(speedBonus(300)).toBe(0);
    const avg = (skill: number) => {
      let t = 0;
      for (let i = 0; i < 10; i++) t += runBot(game, 90 + i, opts, skill, i + 1).score;
      return t / 10;
    };
    const a = avg(0.3);
    const b = avg(0.6);
    const c = avg(0.88);
    expect(b).toBeGreaterThan(a);
    expect(c).toBeGreaterThan(b);
  });
});
