import { describe, expect, it } from 'vitest';
import { game, PERFECT_TOL, type BridgeState } from './bruecke';
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

  it('zu kurz oder zu lang endet mit Absturz', () => {
    for (const delta of [-0.5, 12]) {
      const s = game.init(8, opts);
      const t0 = s.towers[0]!;
      const t1 = s.towers[1]!;
      build(s, delta < 0 ? t1.l - t0.r + delta : t1.r - t0.r + 1.0);
      let guard = 0;
      while (!game.done(s) && guard++ < 300) game.step(s, NEUTRAL_INPUT);
      expect(game.done(s)).toBe(true);
      expect(s.built).toBe(0);
      expect(game.score(s)).toBe(0);
    }
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
