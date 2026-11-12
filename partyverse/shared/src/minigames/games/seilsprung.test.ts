import { describe, expect, it } from 'vitest';
import { crossTick, game, multiplier, nextCrossing, type RopeState, type Turn } from './seilsprung';
import { NEUTRAL_INPUT } from '../types';
import { runBot } from '../simulate';

const opts = { playerIndex: 0, players: 2 };
const A = { ...NEUTRAL_INPUT, a: true };

/** Springt `lead` Ticks vor jedem Durchgang; bei goldenen Umläufen wird A gehalten, wenn high = true */
function play(s: RopeState, high: boolean, lead = 13, maxTicks = 1900): void {
  let holding = false;
  for (let i = 0; i < maxTicks && !game.done(s); i++) {
    const nc = nextCrossing(s);
    let a = false;
    if (s.y > 0) a = holding && s.vy > 0;
    else if (!(nc.gold && nc.k === 1) && !s.prevA) {
      const l = nc.gold ? 11 : lead;
      a = nc.tc === l;
      holding = a && nc.gold && high;
    }
    game.step(s, a ? A : NEUTRAL_INPUT);
  }
}

describe('seilsprung – Regeln', () => {
  it('Umläufe hängen nur vom Seed ab und wechseln', () => {
    const a = game.init(77, opts);
    const b = game.init(77, { playerIndex: 1, players: 5 });
    expect(a.turns).toEqual(b.turns);
    expect(game.init(78, opts).turns).not.toEqual(a.turns);
    expect(new Set(a.turns.map((t) => t.p)).size).toBeGreaterThan(3);
    expect(Math.min(...a.turns.filter((t) => t.n === 1).map((t) => t.p))).toBeGreaterThanOrEqual(44);
  });

  it('Schwierigkeit steigt: Täuschungen und goldene Doppelschwünge erst später', () => {
    for (const seed of [1, 2, 3, 4, 5, 6]) {
      const turns = game.init(seed, opts).turns;
      let at = 0;
      const startOf: number[] = [];
      for (const tr of turns) {
        startOf.push(at);
        at += tr.hold + tr.p * tr.n;
      }
      const firstSpecial = turns.findIndex((tr: Turn) => tr.hold > 0 || tr.n === 2);
      if (firstSpecial >= 0) expect(startOf[firstSpecial]!).toBeGreaterThan(300);
    }
    // Jede Runde hat beide Sonderformen
    for (let sd = 0; sd < 40; sd++) {
      const turns = game.init(sd, opts).turns;
      expect(turns.some((tr) => tr.n === 2)).toBe(true);
      expect(turns.some((tr) => tr.n === 1 && tr.hold > 0)).toBe(true);
    }
  });

  it('Serien-Multiplikator wächst und ist gedeckelt', () => {
    expect(multiplier(0)).toBe(1);
    expect(multiplier(3)).toBe(1);
    expect(multiplier(4)).toBe(2);
    expect(multiplier(7)).toBe(3);
    expect(multiplier(100)).toBe(5);
  });

  it('wer nie springt, stolpert dreimal und das Spiel endet', () => {
    const s: RopeState = game.init(5, opts);
    let ticks = 0;
    while (!game.done(s) && ticks++ < 1900) game.step(s, NEUTRAL_INPUT);
    expect(s.hits).toBe(3);
    expect(game.score(s)).toBe(0);
    expect(ticks).toBeLessThan(500);
  });

  it('ein Sprung zur richtigen Zeit zählt, Serie erhöht die Punkte', () => {
    const s: RopeState = game.init(5, opts);
    const pts: number[] = [];
    let last = 0;
    let guard = 0;
    while (s.clears < 5 && guard++ < 2000) {
      const c = crossTick(s.turns[s.turn]!, 0);
      game.step(s, s.u === c - 13 && s.y === 0 ? A : NEUTRAL_INPUT);
      if (s.points !== last) {
        pts.push(s.points - last);
        last = s.points;
      }
    }
    expect(s.hits).toBe(0);
    expect(pts.slice(0, 3)).toEqual([10, 10, 10]);
    expect(pts[3]).toBe(20);
  });

  it('goldener Doppelschwung: nur der hohe Sprung (A halten) schafft beide Durchgänge', () => {
    const s: RopeState = game.init(1, opts);
    s.turns = [
      { p: 96, n: 1, hold: 0 },
      { p: 27, n: 2, hold: 14 },
      { p: 96, n: 1, hold: 0 },
    ];
    const hi = structuredClone(s);
    play(hi, true, 13, 230);
    expect(hi.hits).toBe(0);
    expect(hi.golds).toBe(2);
    const lo = structuredClone(s);
    play(lo, false, 13, 230);
    expect(lo.hits).toBe(1);
    // ein normaler (kurzer) Sprung bleibt niedrig
    const tap = game.init(1, opts);
    game.step(tap, A);
    let maxY = 0;
    for (let i = 0; i < 40; i++) {
      game.step(tap, NEUTRAL_INPUT);
      maxY = Math.max(maxY, tap.y);
    }
    const big = game.init(1, opts);
    let bigY = 0;
    for (let i = 0; i < 40; i++) {
      game.step(big, A);
      bigY = Math.max(bigY, big.y);
    }
    expect(bigY).toBeGreaterThan(maxY * 1.8);
  });

  it('Täuschung: wer nach Rhythmus springt, landet zu früh', () => {
    const s: RopeState = game.init(1, opts);
    s.turns = [
      { p: 60, n: 1, hold: 0 },
      { p: 60, n: 1, hold: 30 },
      { p: 60, n: 1, hold: 0 },
    ];
    // Rhythmus-Springer: springt immer 60 Ticks nach dem letzten Sprung
    const r = structuredClone(s);
    for (let i = 0; i < 170; i++) game.step(r, (i - 17) % 60 === 0 ? A : NEUTRAL_INPUT);
    expect(r.hits).toBe(1);
    // wer aufs Seil schaut, schafft es
    const w = structuredClone(s);
    play(w, false, 13, 170);
    expect(w.hits).toBe(0);
  });

  it('Bots: 0.3 < 0.6 < 0.88, keiner hängt fest', () => {
    const avg = (skill: number) => {
      let sum = 0;
      for (let i = 0; i < 12; i++) sum += runBot(game, 300 + i, opts, skill, 5 + i).score;
      return sum / 12;
    };
    const [w, m, st] = [avg(0.3), avg(0.6), avg(0.88)];
    expect(m).toBeGreaterThan(w);
    expect(st).toBeGreaterThan(m);
  });
});
