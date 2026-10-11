import { describe, expect, it } from 'vitest';
import { NEUTRAL_INPUT } from '../types';
import { game, pickPillar, type EchoState } from './echomuster';

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
    game.step(s, press(s.seq[k] as number));
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
    expect(game.score(s)).toBeGreaterThanOrEqual(200);
    for (let r = 0; r < 4; r++) {
      runUntil(s, 'show');
      playRound(s);
    }
    expect(s.cleared).toBe(6);
    runUntil(s, 'show');
    expect(s.pillars).toBe(6);
  });
  it('ein Fehler beendet das Spiel, bereits Geschafftes bleibt in der Wertung', () => {
    const s = game.init(9, OPTS);
    playRound(s);
    runUntil(s, 'input');
    const wrong = ((s.seq[0] as number) + 1) % 4;
    game.step(s, press(wrong));
    expect(game.done(s)).toBe(true);
    expect(s.failed).toBe(true);
    expect(game.score(s)).toBeGreaterThanOrEqual(200);
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
});
