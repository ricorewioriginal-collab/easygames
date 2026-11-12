import { describe, expect, it } from 'vitest';
import { runBot } from '../simulate';
import {
  FALL_PENALTY,
  game,
  GOLD_PTS,
  growRate,
  MOVE_FROM,
  PERFECT_TOL,
  towerAt,
  type BridgeState,
} from './bruecke';
import { NEUTRAL_INPUT } from '../types';

const opts = { playerIndex: 0, players: 2 };

/** Baut eine Brücke mit gewünschter Länge: A halten bis die Länge erreicht ist, loslassen, abwarten bis der Held läuft/fällt. */
function build(s: BridgeState, length: number): void {
  let guard = 0;
  while (s.phase === 'idle' && guard++ < 50) game.step(s, { ...NEUTRAL_INPUT, a: true });
  while (s.phase === 'grow' && guard++ < 600) game.step(s, { ...NEUTRAL_INPUT, a: s.len < length });
  while ((s.phase === 'fall' || s.phase === 'walk' || s.phase === 'drop') && guard++ < 800 && !game.done(s))
    game.step(s, NEUTRAL_INPUT);
}

describe('bruecke – Regeln', () => {
  it('Türme hängen nur vom Seed ab', () => {
    const a = game.init(8, opts);
    const b = game.init(8, { playerIndex: 1, players: 3 });
    expect(a.towers).toEqual(b.towers);
    expect(game.init(9, opts).towers).not.toEqual(a.towers);
    for (let i = 1; i < a.towers.length; i++) expect(a.towers[i]!.l).toBeGreaterThan(a.towers[i - 1]!.r);
  });

  it('passende Länge: Turm geschafft, Perfekt in der Mitte gibt Bonus', () => {
    const s = game.init(8, opts);
    const t0 = s.towers[0]!;
    const t1 = s.towers[1]!;
    build(s, (t1.l + t1.r) / 2 - t0.r);
    expect(s.built).toBe(1);
    expect(s.perfects).toBe(1);
    expect(s.idx).toBe(1);
    expect(game.score(s)).toBe(10 + s.bonus);
    expect(s.bonus).toBeGreaterThan(0);
  });

  it('gerade noch auf dem Turm (aber nicht in der Mitte): Turm zählt ohne Bonus', () => {
    const s = game.init(8, opts);
    const t0 = s.towers[0]!;
    const t1 = s.towers[1]!;
    const mid = (t1.l + t1.r) / 2;
    build(s, t1.l - t0.r + 0.1);
    expect(Math.abs(t0.r + s.len - mid)).toBeGreaterThan(PERFECT_TOL);
    expect(s.built).toBe(1);
    expect(s.perfects).toBe(0);
    expect(game.score(s)).toBe(10);
  });

  it('zu kurz oder zu lang: Absturz kostet Punkte, danach geht es vom selben Turm weiter', () => {
    for (const delta of [-0.5, 12]) {
      const s = game.init(8, opts);
      const t0 = s.towers[0]!;
      const t1 = s.towers[1]!;
      build(s, (t1.l + t1.r) / 2 - t0.r);
      expect(s.built).toBe(1);
      const t2 = towerAt(s.towers[2]!, s.t);
      build(s, delta < 0 ? t2.l - t1.r + delta : t2.r - t1.r + 1.0);
      let guard = 0;
      while (s.phase !== 'idle' && guard++ < 300) game.step(s, NEUTRAL_INPUT);
      expect(game.done(s)).toBe(false);
      expect(s.falls).toBe(1);
      expect(s.idx).toBe(1);
      expect(s.heroY).toBe(0);
      expect(s.pstreak).toBe(0);
      expect(game.score(s)).toBe(10 + s.bonus - FALL_PENALTY);
    }
  });

  it('Punkte fallen nie unter 0', () => {
    const s = game.init(8, opts);
    build(s, 0.3);
    let guard = 0;
    while (s.phase !== 'idle' && guard++ < 300) game.step(s, NEUTRAL_INPUT);
    expect(s.falls).toBe(1);
    expect(game.score(s)).toBe(0);
  });

  it('Steigerung: Stab wächst schneller, Türme wandern ab Turm 6, jeder fünfte ist golden', () => {
    expect(growRate(10)).toBeGreaterThan(growRate(0));
    for (const seed of [1, 2, 3]) {
      const tw = game.init(seed, opts).towers;
      expect(tw.slice(0, MOVE_FROM).every((t) => t.m === 0)).toBe(true);
      expect(tw.slice(MOVE_FROM, 20).filter((t) => t.m > 0).length).toBeGreaterThan(4);
      expect(tw[5]!.gold && tw[10]!.gold && !tw[4]!.gold).toBe(true);
      // wandernde Türme berühren sich nie
      for (let i = 1; i < tw.length; i++)
        expect(tw[i]!.l - tw[i]!.m).toBeGreaterThan(tw[i - 1]!.r + tw[i - 1]!.m + 0.5);
    }
  });

  it('goldener Turm zählt mehr, erreichte Türme bleiben stehen', () => {
    const s = game.init(8, opts);
    let guard = 0;
    while (s.idx < 5 && guard++ < 20) {
      const cur = s.towers[s.idx]!;
      const nx = s.towers[s.idx + 1]!;
      build(s, (nx.l + nx.r) / 2 - cur.r + 0.2);
    }
    expect(s.idx).toBe(5);
    expect(s.towerPts).toBe(4 * 10 + GOLD_PTS);
    expect(s.towers[5]!.m).toBe(0);
  });

  it('Bot-Stufen unterscheiden sich', () => {
    const avg = (sk: number) => {
      let t = 0;
      for (let i = 0; i < 8; i++) t += runBot(game, 30 + i, opts, sk, i).score;
      return t / 8;
    };
    const a = avg(0.3);
    const b = avg(0.6);
    const c = avg(0.88);
    expect(b).toBeGreaterThan(a);
    expect(c).toBeGreaterThan(b);
  });

  it('nichts tun gibt 0 Punkte und das Spiel endet nach 30 Sekunden', () => {
    const s = game.init(8, opts);
    let n = 0;
    while (!game.done(s)) {
      game.step(s, NEUTRAL_INPUT);
      n++;
    }
    expect(n).toBe(1800);
    expect(game.score(s)).toBe(0);
  });
});
