import { describe, expect, it } from 'vitest';
import { NEUTRAL_INPUT } from '../types';
import { runBot } from '../simulate';
import {
  ARM,
  game,
  pendulumPos,
  roundPoints,
  ROUNDS,
  streakBonus,
  zoneCenter,
  type PendelState,
} from './pendelpunkt';

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
  it('ab Runde 3 wandert die Zone, ab Runde 6 schwingt das Pendel ungleichmäßig', () => {
    const s = game.init(4, OPTS);
    expect(s.rounds[0]!.zm).toBe(0);
    expect(zoneCenter(s.rounds[0]!, 0)).toBe(zoneCenter(s.rounds[0]!, 90));
    const r3 = s.rounds[2]!;
    expect(r3.zm).toBeGreaterThan(0);
    expect(zoneCenter(r3, 0)).not.toBeCloseTo(zoneCenter(r3, 45), 3);
    expect(s.rounds[4]!.wa).toBe(0);
    expect(s.rounds[5]!.wa).toBeGreaterThan(0);
  });
  it('Serienbonus für gute Stopps in Folge, letzte Runde doppelt', () => {
    expect(streakBonus(1)).toBe(0);
    expect(streakBonus(3)).toBe(200);
    const s: PendelState = game.init(9, OPTS);
    // perfekter Spieler: drückt genau im Moment, in dem Pendel und Zonenmitte am nächsten sind
    let guard = 0;
    while (!game.done(s) && guard++ < 5000) {
      let a = false;
      if (s.phase === 'swing' && s.k > ARM) {
        const r = s.rounds[s.round]!;
        const d0 = pendulumPos(r, s.k + 1) - zoneCenter(r, s.k + 1);
        const d1 = pendulumPos(r, s.k + 2) - zoneCenter(r, s.k + 2);
        a = Math.abs(d0) < r.h * 0.25 && Math.abs(d0) <= Math.abs(d1);
      }
      game.step(s, { ...NEUTRAL_INPUT, a: a && !s.prevA });
    }
    expect(s.pts.length).toBe(ROUNDS);
    expect(s.streak).toBeGreaterThanOrEqual(3);
    expect(s.pts[ROUNDS - 1]!).toBeGreaterThan(1600);
  });
  it('Bot-Stufen: stark > mittel > schwach', () => {
    const avg = (sk: number) => {
      let sum = 0;
      for (let i = 0; i < 8; i++) sum += runBot(game, 60 + i, OPTS, sk, i).score;
      return sum / 8;
    };
    const [lo, mid, hi] = [avg(0.3), avg(0.6), avg(0.88)];
    expect(hi).toBeGreaterThan(mid);
    expect(mid).toBeGreaterThan(lo);
  });
});
