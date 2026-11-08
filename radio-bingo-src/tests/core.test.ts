import { describe, expect, it } from 'vitest';
import { completionIndex, Drum, makeCard75, makeCard90, marksFrom, missing, pattern, PATTERNS, PATTERNS90, rng, validClaim, letterOf } from '../src/core/bingo';
import { botsNear, callText, makeBots, prize, rounds } from '../src/core/modes';

describe('Karten', () => {
  it('75er-Karte: Spalten B-I-N-G-O, keine Doppelten, freie Mitte', () => {
    const r = rng(1);
    for (let k = 0; k < 200; k++) {
      const c = makeCard75(r);
      expect(c.cells[12]).toBe(0);
      const nums = c.cells.filter((n) => n);
      expect(new Set(nums).size).toBe(24);
      c.cells.forEach((n, i) => { if (i !== 12) expect(Math.floor((n - 1) / 15)).toBe(i % 5); });
    }
  });
  it('90er-Karte: je Zeile 5 Zahlen, jede Spalte belegt, Bereiche stimmen', () => {
    const r = rng(2);
    for (let k = 0; k < 300; k++) {
      const c = makeCard90(r);
      for (let row = 0; row < 3; row++) expect(c.cells.slice(row * 9, row * 9 + 9).filter((n) => n).length).toBe(5);
      for (let col = 0; col < 9; col++) {
        const v = [0, 1, 2].map((row) => c.cells[row * 9 + col]).filter((n) => n);
        expect(v.length).toBeGreaterThan(0);
        v.forEach((n) => expect(col === 8 ? n >= 80 && n <= 90 : col === 0 ? n >= 1 && n <= 9 : n >= col * 10 && n <= col * 10 + 9).toBe(true));
        expect([...v].sort((a, b) => a - b)).toEqual(v);
      }
    }
  });
  it('Buchstaben', () => { expect(letterOf(1)).toBe('B'); expect(letterOf(16)).toBe('I'); expect(letterOf(45)).toBe('N'); expect(letterOf(75)).toBe('O'); });
});
describe('Muster', () => {
  const c = makeCard75(rng(3));
  const m = (idx: number[]) => c.cells.map((_, i) => i === 12 || idx.includes(i));
  it('Linie: waagerecht, senkrecht, diagonal; Mitte zählt', () => {
    expect(missing(c, m([10, 11, 13, 14]), PATTERNS.linie)).toBe(0);
    expect(missing(c, m([2, 7, 17, 22]), PATTERNS.linie)).toBe(0);
    expect(missing(c, m([0, 6, 18, 24]), PATTERNS.linie)).toBe(0);
    expect(missing(c, m([0, 6, 18]), PATTERNS.linie)).toBe(1);
  });
  it('Zwei Linien, Ecken, X, volle Karte', () => {
    expect(missing(c, m([10, 11, 13, 14, 2, 7, 17, 22]), PATTERNS.zwei)).toBe(0);
    expect(missing(c, m([10, 11, 13, 14]), PATTERNS.zwei)).toBe(4);
    expect(missing(c, m([0, 4, 20]), PATTERNS.ecken)).toBe(1);
    expect(missing(c, m([0, 4, 6, 8, 16, 18, 20, 24]), PATTERNS.kreuz)).toBe(0);
    expect(missing(c, m([]), PATTERNS.voll)).toBe(24);
  });
  it('90er-Stufen', () => {
    const k = makeCard90(rng(4)), row0 = k.cells.map((n, i) => n > 0 && i < 9);
    expect(missing(k, row0, PATTERNS90[0])).toBe(0);
    expect(missing(k, row0, PATTERNS90[1])).toBe(5);
    expect(missing(k, k.cells.map((n) => n > 0), PATTERNS90[2])).toBe(0);
  });
});
describe('Ziehung und Bingo-Ruf', () => {
  it('Trommel zieht jede Zahl genau einmal', () => {
    const d = new Drum(75, rng(5)), got: number[] = [];
    for (let i = 0; i < 80; i++) { const n = d.next(); if (n) got.push(n); }
    expect(got.length).toBe(75); expect(new Set(got).size).toBe(75); expect(d.left).toBe(0);
  });
  it('Ruf zählt nur mit wirklich gezogenen, markierten Zahlen', () => {
    const c = makeCard75(rng(6)), row = [10, 11, 13, 14].map((i) => c.cells[i]);
    const marks = c.cells.map((_, i) => [10, 11, 12, 13, 14].includes(i));
    expect(validClaim(c, marks, row, PATTERNS.linie)).toBe(true);
    expect(validClaim(c, marks, row.slice(0, 3), PATTERNS.linie)).toBe(false);
    expect(validClaim(c, c.cells.map(() => false), row, PATTERNS.linie)).toBe(false);
  });
  it('Fertig-Index passt zur Ziehung', () => {
    const r = rng(7), c = makeCard75(r), d = new Drum(75, r), k = completionIndex(c, d.order, PATTERNS.linie);
    expect(k).toBeGreaterThan(2);
    expect(missing(c, marksFrom(c, d.order.slice(0, k + 1)), PATTERNS.linie)).toBe(0);
    expect(missing(c, marksFrom(c, d.order.slice(0, k)), PATTERNS.linie)).toBeGreaterThan(0);
  });
});
describe('Show', () => {
  it('Große Show: vier Runden mit Finale und Jackpot', () => {
    const rd = rounds('show', rng(8));
    expect(rd.length).toBe(4); expect(rd[3].pattern).toBe('voll'); expect(rd[3].jackpot).toBeGreaterThan(40);
    expect(rounds('neunzig', rng(1)).map((x) => x.pattern)).toEqual(['l1', 'l2', 'haus']);
    expect(rounds('schnell', rng(1), 'herz')[0].pattern).toBe('herz');
  });
  it('Punkte: frühes Bingo bringt mehr, Jackpot nur innerhalb der Grenze', () => {
    const rd = rounds('show', rng(9));
    expect(prize(rd[0], 10, 75).points).toBeGreaterThan(prize(rd[0], 30, 75).points);
    expect(prize(rd[3], 64, 75).jackpot).toBe(true);
    expect(prize(rd[3], 70, 75).jackpot).toBe(false);
  });
  it('Jackpot ist selten, aber erreichbar (1–20 % mit 4 Karten)', () => {
    let hit = 0; const N = 2000;
    for (let s = 1; s <= N; s++) { const r = rng(s), d = new Drum(75, r); const best = Math.min(...[0, 1, 2, 3].map(() => completionIndex(makeCard75(r), d.order, PATTERNS.voll))); if (best + 1 <= 66) hit++; }
    expect(hit / N).toBeGreaterThan(0.01); expect(hit / N).toBeLessThan(0.2);
  });
  it('Studio-Publikum: Bots schaffen das Muster, Spannungsanzeige zählt', () => {
    const d = new Drum(75, rng(10)), p = pattern('linie'), bots = makeBots(30, 75, d.order, p, 10);
    expect(bots.every((b) => b.done > 0)).toBe(true);
    const first = Math.min(...bots.map((b) => completionIndex(b.card, d.order, p)));
    expect(botsNear(bots, d.order.slice(0, first), p)).toBeGreaterThan(0);
  });
  it('Ansagen mit Buchstaben', () => {
    expect(callText(7, 75, false)).toBe('B – 7!');
    expect(callText(70, 75, false)).toBe('O – 70!');
    expect(callText(88, 90, false)).toBe('Die 88!');
  });
});
