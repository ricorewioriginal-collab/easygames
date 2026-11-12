import { describe, expect, it } from 'vitest';
import { NEUTRAL_INPUT } from '../types';
import { runBot } from '../simulate';
import { HEARTS, PILLAR_SCREEN, expected, game, isReverse, pickPillar, type EchoState } from './echomuster';

const OPTS = { playerIndex: 0, players: 2 };
const press = (i: number) => {
  const d = [{ y: 1 }, { x: -1 }, { x: 1 }, { y: -1 }, { b: true }, { a: true }][i];
  return { ...NEUTRAL_INPUT, ...d };
};
function runUntil(s: EchoState, phase: EchoState['phase'], max = 3000): void {
  for (let i = 0; i < max && s.phase !== phase; i++) game.step(s, NEUTRAL_INPUT);
}
/** Spielt die aktuelle Runde korrekt nach */
function playRound(s: EchoState): void {
  runUntil(s, 'input');
  const len = s.len;
  for (let k = 0; k < len; k++) {
    game.step(s, press(expected(s)));
    game.step(s, NEUTRAL_INPUT);
  }
}

describe('Echo-Muster', () => {
  it('erzeugt dieselbe Folge für dasselbe Seed und verschiedene für andere', () => {
    const a = game.init(11, OPTS);
    const b = game.init(11, OPTS);
    const c = game.init(12, OPTS);
    expect(a.seq).toEqual(b.seq);
    expect(a.seq).not.toEqual(c.seq);
    expect(a.seq.slice(0, 5).every((v) => v < 4)).toBe(true);
  });
  it('richtiges Nachspielen erhöht Länge und Wertung, Länge 6 schaltet sechs Säulen frei', () => {
    const s = game.init(5, OPTS);
    playRound(s);
    expect(s.cleared).toBe(2);
    expect(game.score(s)).toBeGreaterThanOrEqual(60);
    for (let r = 0; r < 4; r++) {
      runUntil(s, 'show');
      playRound(s);
    }
    expect(s.cleared).toBe(6);
    expect(s.hearts).toBe(HEARTS);
    runUntil(s, 'show');
    expect(s.pillars).toBe(6);
  });
  it('Rückwärts-Runden: erst ab Länge 4, fest je Länge, verlangen die umgekehrte Folge und zählen mehr', () => {
    expect(isReverse(3, 2)).toBe(false);
    expect(isReverse(3, 3)).toBe(false);
    expect(isReverse(3, 5)).toBe(true);
    const s = game.init(5, OPTS);
    while (s.len < 5) {
      playRound(s);
      runUntil(s, 'show');
    }
    expect(s.reverse).toBe(true);
    runUntil(s, 'input');
    // vorwärts gespielt ist falsch (sofern Anfang und Ende verschieden)
    const t = structuredClone(s);
    if (t.seq[0] !== t.seq[t.len - 1]) {
      game.step(t, press(t.seq[0] as number));
      expect(t.hearts).toBe(HEARTS - 1);
    }
    const before = s.points;
    playRound(s);
    expect(s.phase).toBe('ok');
    expect(s.points - before).toBeGreaterThanOrEqual(Math.round(5 * 30 * 1.5));
  });
  it('ein Fehler kostet ein Herz und wiederholt die Runde, nach drei Fehlern ist Schluss', () => {
    const s = game.init(9, OPTS);
    playRound(s);
    const kept = game.score(s);
    for (let h = HEARTS; h > 0; h--) {
      runUntil(s, 'input');
      const len = s.len;
      game.step(s, press((expected(s) + 1) % 4));
      expect(s.hearts).toBe(h - 1);
      if (h > 1) {
        expect(game.done(s)).toBe(false);
        runUntil(s, 'show');
        expect(s.len).toBe(len);
      }
    }
    expect(game.done(s)).toBe(true);
    expect(game.score(s)).toBe(kept);
  });
  it('Zögern zu lange kostet ebenfalls ein Herz, ist aber kein Spielende', () => {
    const s = game.init(4, OPTS);
    runUntil(s, 'input');
    for (let i = 0; i < 300 && s.hearts === HEARTS; i++) game.step(s, NEUTRAL_INPUT);
    expect(s.hearts).toBe(HEARTS - 1);
    expect(game.done(s)).toBe(false);
  });
  it('Bots: 0.3 < 0.6 < 0.88 und schnelleres Vorspielen bei längeren Folgen', () => {
    const avg = (skill: number) => {
      let sum = 0;
      for (let i = 0; i < 12; i++) sum += runBot(game, 70 + i, OPTS, skill, 3 + i).score;
      return sum / 12;
    };
    const [w, m, st] = [avg(0.3), avg(0.6), avg(0.88)];
    expect(m).toBeGreaterThan(w);
    expect(st).toBeGreaterThan(m);
  });
  it('Zeiger wählt die Säule nach Richtung, Tasten B/A nur bei sechs Säulen', () => {
    expect(pickPillar({ ...NEUTRAL_INPUT, pd: true, px: 0, py: 0.8 }, 4)).toBe(0);
    expect(pickPillar({ ...NEUTRAL_INPUT, pd: true, px: -0.8, py: 0 }, 4)).toBe(1);
    expect(pickPillar({ ...NEUTRAL_INPUT, pd: true, px: 0.8, py: 0 }, 4)).toBe(2);
    expect(pickPillar({ ...NEUTRAL_INPUT, pd: true, px: 0, py: -0.8 }, 4)).toBe(3);
    expect(pickPillar({ ...NEUTRAL_INPUT, b: true }, 4)).toBe(-1);
    expect(pickPillar({ ...NEUTRAL_INPUT, b: true }, 6)).toBe(4);
    expect(pickPillar({ ...NEUTRAL_INPUT, a: true }, 6)).toBe(5);
  });
  it('Tipp auf die Bildschirmposition eines Kristalls wählt genau diese Säule, die Mitte nichts', () => {
    PILLAR_SCREEN.forEach(([px, py], i) => {
      expect(pickPillar({ ...NEUTRAL_INPUT, pd: true, px, py }, 6)).toBe(i);
      // auch leicht daneben
      expect(pickPillar({ ...NEUTRAL_INPUT, pd: true, px: px * 1.15 + 0.03, py: py * 0.9 - 0.03 }, 6)).toBe(
        i,
      );
    });
    expect(pickPillar({ ...NEUTRAL_INPUT, pd: true, px: 0.02, py: -0.05 }, 6)).toBe(-1);
  });
});
