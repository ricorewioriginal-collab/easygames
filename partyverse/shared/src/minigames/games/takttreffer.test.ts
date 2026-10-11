import { describe, expect, it } from 'vitest';
import { NEUTRAL_INPUT } from '../types';
import {
  bpmAt,
  game,
  GOOD_WINDOW,
  lanesDown,
  multiplier,
  PERFECT_WINDOW,
  type BeatState,
} from './takttreffer';

const OPTS = { playerIndex: 0, players: 2 };
function advanceTo(s: BeatState, t: number): void {
  while (s.t < t) game.step(s, NEUTRAL_INPUT);
}

describe('Takt-Treffer', () => {
  it('Muster ist vom Seed abhängig, geordnet und das Tempo steigt', () => {
    const a = game.init(3, OPTS);
    const b = game.init(3, OPTS);
    const c = game.init(4, OPTS);
    expect(a.notes).toEqual(b.notes);
    expect(a.notes).not.toEqual(c.notes);
    for (let i = 1; i < a.notes.length; i++)
      expect((a.notes[i] as { t: number }).t).toBeGreaterThan((a.notes[i - 1] as { t: number }).t);
    expect(bpmAt(1700)).toBeGreaterThan(bpmAt(0) + 30);
    const early = a.notes.filter((n) => n.t < 600).length;
    const late = a.notes.filter((n) => n.t >= 1100 && n.t < 1700).length;
    expect(late).toBeGreaterThan(early * 0.9);
  });
  it('wertet Perfekt, Gut und Daneben nach Zeitfenster', () => {
    const lanePress = (lane: number) =>
      lane === 0
        ? { ...NEUTRAL_INPUT, x: -1 }
        : lane === 2
          ? { ...NEUTRAL_INPUT, x: 1 }
          : { ...NEUTRAL_INPUT, a: true };
    const s = game.init(8, OPTS);
    const n = s.notes[0] as { t: number; lane: number; res: number };
    advanceTo(s, n.t); // der nächste Schritt hat genau Zeit n.t
    game.step(s, lanePress(n.lane));
    expect(n.res).toBe(1);
    expect(game.score(s)).toBe(100);
    // zweite Note: knapp im "Gut"-Fenster
    const m = s.notes[1] as { t: number; lane: number; res: number };
    advanceTo(s, m.t + PERFECT_WINDOW + 2);
    game.step(s, lanePress(m.lane));
    expect(m.res).toBe(2);
    // Taste ohne Note in der Nähe: Daneben, Kombo weg
    s.prevLane = [false, false, false];
    const before = s.combo;
    expect(before).toBe(2);
    game.step(s, NEUTRAL_INPUT);
    const lastNote = s.notes[s.notes.length - 1] as { t: number };
    advanceTo(s, lastNote.t + GOOD_WINDOW + 5);
    expect(s.combo).toBe(0);
  });
  it('Kombo-Multiplikator wächst bis x4 und Spuren werden aus Taste und Zeiger erkannt', () => {
    expect(multiplier(0)).toBe(1);
    expect(multiplier(8)).toBe(2);
    expect(multiplier(100)).toBe(4);
    expect(lanesDown({ ...NEUTRAL_INPUT, pd: true, px: -0.8 })).toEqual([true, false, false]);
    expect(lanesDown({ ...NEUTRAL_INPUT, pd: true, px: 0.1 })).toEqual([false, true, false]);
    expect(lanesDown({ ...NEUTRAL_INPUT, pd: true, px: 0.9 })).toEqual([false, false, true]);
    expect(lanesDown({ ...NEUTRAL_INPUT, a: true })).toEqual([false, true, false]);
  });
  it('Dauerfeuer auf allen Spuren bringt keinen Vorteil', () => {
    const s = game.init(21, OPTS);
    let flip = false;
    while (!game.done(s)) {
      flip = !flip;
      game.step(s, flip ? { ...NEUTRAL_INPUT, x: -1, a: true } : NEUTRAL_INPUT);
    }
    expect(game.score(s)).toBeLessThan(3500);
  });
});
