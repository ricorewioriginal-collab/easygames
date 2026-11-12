import { describe, expect, it } from 'vitest';
import { NEUTRAL_INPUT } from '../types';
import { BOARD, cellAt, cellCenter, cellValue, game, gridSize, isGold, type SpuerState } from './spuernase';
import { runBot } from '../simulate';

const OPTS = { playerIndex: 0, players: 2 };
const click = (s: SpuerState, idx: number) => {
  const c = cellCenter(s.n, idx);
  game.step(s, { ...NEUTRAL_INPUT, pd: true, px: c.px, py: c.py });
  game.step(s, NEUTRAL_INPUT);
};

describe('Spürnase', () => {
  it('genau ein Symbol weicht in genau einer Eigenschaft ab, dieselbe Welt für dasselbe Seed', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const s = game.init(seed, OPTS);
      const odd = s.cells[s.oddIdx]!;
      const base = s.cells[(s.oddIdx + 1) % s.cells.length]!;
      const diff =
        (odd.shape !== base.shape ? 1 : 0) +
        (odd.color !== base.color ? 1 : 0) +
        (odd.rot !== base.rot ? 1 : 0);
      expect(diff).toBe(1);
      expect(
        s.cells.filter((c) => c.shape === base.shape && c.color === base.color && c.rot === base.rot),
      ).toHaveLength(s.cells.length - 1);
    }
    expect(game.init(4, OPTS).cells).toEqual(game.init(4, OPTS).cells);
  });
  it('Zeigerzellen: Mittelpunkte werden wieder auf dieselbe Zelle abgebildet, außerhalb gibt es keine', () => {
    for (const n of [3, 4, 5, 6, 7])
      for (let i = 0; i < n * n; i++) {
        const c = cellCenter(n, i);
        expect(cellAt(n, c.px, c.py)).toBe(i);
      }
    expect(cellAt(3, BOARD.x0 - 0.05, 0)).toBe(-1);
    expect(cellAt(3, 0, BOARD.y1 + 0.2)).toBe(-1);
  });
  it('richtig = Punkte + Raster wächst, falsch = Zeitstrafe und kurze Sperre', () => {
    const s = game.init(12, OPTS);
    expect(s.n).toBe(3);
    const wrong = (s.oddIdx + 1) % 9;
    click(s, wrong);
    expect(s.clock).toBeGreaterThanOrEqual(90);
    expect(s.wrong).toBe(1);
    expect(game.score(s)).toBe(0);
    for (let i = 0; i < 30; i++) game.step(s, NEUTRAL_INPUT);
    click(s, s.oddIdx);
    expect(s.found).toBe(1);
    expect(game.score(s)).toBeGreaterThanOrEqual(cellValue(3));
    // Raster wächst
    expect(gridSize(0)).toBe(3);
    expect(gridSize(2)).toBe(4);
    expect(gridSize(20)).toBe(7);
  });
  it('Cursor per Tasten bewegen und mit A bestätigen', () => {
    const s = game.init(13, OPTS);
    const target = s.oddIdx;
    // zuerst in die obere linke Ecke, dann zum Ziel
    for (let i = 0; i < 3; i++) {
      game.step(s, { ...NEUTRAL_INPUT, x: -1 });
      game.step(s, NEUTRAL_INPUT);
    }
    for (let i = 0; i < 3; i++) {
      game.step(s, { ...NEUTRAL_INPUT, y: 1 });
      game.step(s, NEUTRAL_INPUT);
    }
    expect(s.curC + s.curR).toBe(0);
    for (let i = 0; i < target % 3; i++) {
      game.step(s, { ...NEUTRAL_INPUT, x: 1 });
      game.step(s, NEUTRAL_INPUT);
    }
    for (let i = 0; i < Math.floor(target / 3); i++) {
      game.step(s, { ...NEUTRAL_INPUT, y: -1 });
      game.step(s, NEUTRAL_INPUT);
    }
    game.step(s, { ...NEUTRAL_INPUT, a: true });
    expect(s.found).toBe(1);
  });
  it('Blinzeln: ab dem 5. Fund springt der Ausreißer nach kurzer Zeit an einen anderen Platz', () => {
    const s = game.init(21, OPTS);
    for (let k = 0; k < 4; k++) click(s, s.oddIdx);
    expect(s.found).toBe(4);
    expect(s.blinkAt).toBeGreaterThan(0);
    const before = s.oddIdx;
    const odd = { ...s.cells[before]! };
    for (let i = 0; i < s.blinkAt + 2; i++) game.step(s, NEUTRAL_INPUT);
    expect(s.blinks).toBe(1);
    expect(s.oddIdx).not.toBe(before);
    expect(s.cells[s.oddIdx]).toEqual(odd);
    // weiterhin genau ein Ausreißer
    const same = s.cells.filter((c) => JSON.stringify(c) === JSON.stringify(odd));
    expect(same).toHaveLength(1);
    // dieselbe Welt: gleiches Seed, gleicher Sprung
    const t = game.init(21, OPTS);
    for (let k = 0; k < 4; k++) click(t, t.oddIdx);
    for (let i = 0; i < t.blinkAt + 2; i++) game.step(t, NEUTRAL_INPUT);
    expect(t.oddIdx).toBe(s.oddIdx);
  });
  it('Kombo und Goldtafel: Serien ohne Fehler zahlen mehr, ein Fehler setzt die Kombo zurück', () => {
    const s = game.init(5, OPTS);
    const gains: number[] = [];
    for (let k = 0; k < 5; k++) {
      const before = s.total;
      click(s, s.oddIdx);
      gains.push(s.total - before);
    }
    expect(s.streak).toBe(5);
    expect(isGold(4)).toBe(true);
    expect(gains[4]!).toBeGreaterThan(gains[3]! * 1.6); // Goldtafel
    click(s, (s.oddIdx + 1) % (s.n * s.n));
    expect(s.streak).toBe(0);
  });
  it('Bot-Stufen: 0.88 > 0.6 > 0.3, Punkte endlich', () => {
    const avg = (skill: number) => {
      let t = 0;
      for (let i = 0; i < 10; i++) {
        const r = runBot(game, 50 + i, OPTS, skill, i + 1);
        expect(Number.isFinite(r.score)).toBe(true);
        t += r.score;
      }
      return t / 10;
    };
    const a = avg(0.3);
    const b = avg(0.6);
    const c = avg(0.88);
    expect(b).toBeGreaterThan(a);
    expect(c).toBeGreaterThan(b);
  });
});
