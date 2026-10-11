import { describe, expect, it } from 'vitest';
import { NEUTRAL_INPUT } from '../types';
import { ARM, game, pendulumPos, roundPoints, ROUNDS, type PendelState } from './pendelpunkt';

const OPTS = { playerIndex: 0, players: 2 };

describe('Pendel-Punkt', () => {
  it('Runden sind vom Seed abhängig, die Zone schrumpft und das Pendel wird schneller', () => {
    const a = game.init(2, OPTS);
    expect(a.rounds).toHaveLength(ROUNDS);
    expect(game.init(2, OPTS).rounds).toEqual(a.rounds);
    expect(game.init(3, OPTS).rounds).not.toEqual(a.rounds);
    for (let i = 1; i < ROUNDS; i++) {
      expect(a.rounds[i]!.h).toBeLessThan(a.rounds[i - 1]!.h);
      expect(a.rounds[i]!.omega).toBeGreaterThan(a.rounds[i - 1]!.omega);
    }
  });
  it('Mitte gibt das Maximum, Abstand weniger, außerhalb nahezu nichts', () => {
    const r = game.init(1, OPTS).rounds[0]!;
    expect(roundPoints(r, r.c)).toBe(1000);
    expect(roundPoints(r, r.c + r.h * 0.5)).toBeLessThan(1000);
    expect(roundPoints(r, r.c + r.h * 0.5)).toBeGreaterThan(roundPoints(r, r.c + r.h));
    expect(roundPoints(r, r.c + r.h * 3)).toBeLessThan(5);
  });
  it('A stoppt das Pendel erst nach dem Scharfstellen, ohne Eingabe läuft die Runde ohne Punkte ab', () => {
    const s: PendelState = game.init(6, OPTS);
    game.step(s, { ...NEUTRAL_INPUT, a: true }); // zu früh
    expect(s.phase).toBe('swing');
    game.step(s, NEUTRAL_INPUT);
    while (s.k < ARM + 2) game.step(s, NEUTRAL_INPUT);
    game.step(s, { ...NEUTRAL_INPUT, a: true });
    expect(s.phase).toBe('result');
    expect(s.stopPos).toBeCloseTo(pendulumPos(s.rounds[0]!, s.k), 10);
    const idle = game.init(6, OPTS);
    for (let i = 0; i < 3000 && !game.done(idle); i++) game.step(idle, NEUTRAL_INPUT);
    expect(game.done(idle)).toBe(true);
    expect(game.score(idle)).toBe(0);
  });
});
