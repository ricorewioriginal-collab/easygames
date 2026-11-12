import { describe, expect, it } from 'vitest';
import { NEUTRAL_INPUT } from '../types';
import { runBot } from '../simulate';
import {
  canMove,
  deriveSeed,
  distances,
  game,
  makeMaze,
  mazeSize,
  PHASE_TICKS,
  timePlan,
  MAZE_POINTS,
  GEM_POINTS,
  insideWall,
  makeGems,
  phaseLenAt,
  DURATION_TICKS,
} from './faltlabyrinth';

const opts = { playerIndex: 0, players: 4 };

describe('faltlabyrinth', () => {
  it('Generator: Weg in JEDER Phase von jeder Zelle zum Ziel, deterministisch, mit Falt-Wänden', () => {
    for (let seed = 1; seed <= 60; seed++) {
      for (const n of [7, 8, 9]) {
        const m = makeMaze(seed, n);
        expect(makeMaze(seed, n)).toEqual(m);
        const goal = m.goal.y * n + m.goal.x;
        for (const phase of [0, 1]) {
          const d = distances(m, phase, goal);
          expect(d.every((v) => v >= 0)).toBe(true);
          expect(d[m.start.y * n + m.start.x]).toBeGreaterThan(n); // keine triviale Strecke
        }
        const codes = [...m.vw, ...m.hw];
        expect(codes.filter((c) => c === 2).length).toBeGreaterThanOrEqual(3);
        expect(codes.filter((c) => c === 3).length).toBeGreaterThanOrEqual(3);
      }
    }
  });
  it('Auch über die Zeit gibt es von Start zum Ziel immer einen Weg (alle Phasenlagen)', () => {
    for (let seed = 1; seed <= 25; seed++) {
      const m = makeMaze(deriveSeed(seed, 1), mazeSize(1));
      const start = m.start.y * m.n + m.start.x;
      for (let pt = 0; pt < PHASE_TICKS; pt += 35) {
        for (const phase of [0, 1]) {
          const p = timePlan(m, phase, pt, start);
          expect(p).not.toBeNull();
          expect(p!.steps).toBeLessThan(70);
        }
      }
    }
  });
  it('Wände blockieren, Phasenwechsel schaltet Wände um', () => {
    const s = game.init(3, opts);
    const m = s.maze;
    // Finde eine Zelle mit Wand nur in Phase A (offen in B)
    const n = m.n;
    let found = -1;
    let dir = 0;
    for (let c = 0; c < n * n && found < 0; c++) {
      for (let d = 0; d < 4; d++)
        if (!canMove(m, 0, c, d) && canMove(m, 1, c, d)) {
          found = c;
          dir = d;
          break;
        }
    }
    expect(found).toBeGreaterThanOrEqual(0);
    s.x = (found % n) + 0.5;
    s.y = Math.floor(found / n) + 0.5;
    const mv = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 },
    ][dir]!;
    for (let i = 0; i < 40; i++) game.step(s, { ...NEUTRAL_INPUT, ...mv });
    expect(Math.floor(s.x)).toBe(found % n);
    expect(Math.floor(s.y)).toBe(Math.floor(found / n));
    // Phase B: durchgehen möglich
    s.phase = 1;
    s.phaseTick = 0;
    for (let i = 0; i < 40; i++) game.step(s, { ...NEUTRAL_INPUT, ...mv });
    expect(Math.floor(s.x) !== found % n || Math.floor(s.y) !== Math.floor(found / n)).toBe(true);
  });
  it('Ziel zählt 100 Punkte plus Bonus und lädt ein neues Labyrinth mit abgeleitetem Seed', () => {
    const s = game.init(8, opts);
    const first = s.maze;
    s.x = s.maze.goal.x + 0.5;
    s.y = s.maze.goal.y + 0.5;
    game.step(s, NEUTRAL_INPUT);
    expect(s.mazes).toBe(1);
    expect(s.maze).not.toEqual(first);
    expect(s.maze).toEqual(makeMaze(deriveSeed(8, 1), mazeSize(1)));
    expect(game.score(s)).toBeGreaterThanOrEqual(MAZE_POINTS);
    expect(Math.floor(s.x)).toBe(s.maze.start.x);
  });
  it('Bot 0.95 schafft mindestens ein Labyrinth und schlägt Bot 0.1', () => {
    let hi = 0;
    let lo = 0;
    for (let i = 0; i < 8; i++) {
      hi += runBot(game, 40 + i, opts, 0.95, i).score;
      lo += runBot(game, 40 + i, opts, 0.1, i).score;
    }
    expect(hi / 8).toBeGreaterThanOrEqual(MAZE_POINTS);
    expect(hi).toBeGreaterThan(lo * 1.3);
  });
  it('Steigerung: Der Faltakt wird schneller', () => {
    expect(phaseLenAt(0)).toBe(PHASE_TICKS);
    expect(phaseLenAt(DURATION_TICKS)).toBeLessThan(PHASE_TICKS * 0.6);
    const s = game.init(5, opts);
    const lens = new Set<number>();
    for (let i = 0; i < DURATION_TICKS; i++) {
      game.step(s, NEUTRAL_INPUT);
      lens.add(s.phaseLen);
    }
    expect(Math.min(...lens)).toBeLessThan(140);
    expect(s.folds).toBeGreaterThan(10);
  });
  it('Kristalle: deterministisch, abseits von Start/Ziel, einsammeln gibt Punkte', () => {
    const s = game.init(9, opts);
    expect(s.gems.length).toBeGreaterThanOrEqual(3);
    expect(makeGems(s.maze, 9, 0)).toEqual(s.gems);
    for (const g of s.gems) expect(g.x === s.maze.goal.x && g.y === s.maze.goal.y).toBe(false);
    const g = s.gems[0]!;
    s.x = g.x + 0.5;
    s.y = g.y + 0.5;
    game.step(s, NEUTRAL_INPUT);
    expect(s.gemCount).toBe(1);
    expect(game.score(s)).toBe(GEM_POINTS);
  });
  it('Eingeklemmt: Wer beim Falten in einer aufklappenden Wand steht, steckt kurz fest', () => {
    const s = game.init(3, opts);
    const m = s.maze;
    const n = m.n;
    // Senkrechte Wand, die nur in Phase B steht (Code 3): Spieler genau darauf stellen
    let placed = false;
    for (let j = 0; j < n && !placed; j++)
      for (let i = 1; i < n && !placed; i++)
        if (m.vw[j * (n + 1) + i] === 3) {
          s.x = i;
          s.y = j + 0.5;
          placed = true;
        }
    expect(placed).toBe(true);
    expect(insideWall(m, 1, s.x, s.y)).toBe(true);
    s.phaseTick = s.phaseLen - 1;
    game.step(s, NEUTRAL_INPUT);
    expect(s.phase).toBe(1);
    expect(s.stun).toBeGreaterThan(0);
    const x = s.x;
    for (let i = 0; i < 10; i++) game.step(s, { ...NEUTRAL_INPUT, x: 1 });
    expect(s.x).toBeCloseTo(x, 1);
    expect(insideWall(m, 1, s.x, s.y)).toBe(false);
  });
  it('Bot-Stufen: 0.88 > 0.6 > 0.3, alle ohne Absturz und mit endlichen Punkten', () => {
    const avg = (skill: number) => {
      let t = 0;
      for (let i = 0; i < 6; i++) {
        const r = runBot(game, 70 + i, opts, skill, i + 3);
        expect(Number.isFinite(r.score)).toBe(true);
        t += r.score;
      }
      return t / 6;
    };
    const a = avg(0.3);
    const b = avg(0.6);
    const c = avg(0.88);
    expect(b).toBeGreaterThan(a);
    expect(c).toBeGreaterThan(b);
  });
});
