import { describe, expect, it } from 'vitest';
import { NEUTRAL_INPUT } from '../types';
import { runBot } from '../simulate';
import {
  BOMBS_FROM,
  BOMB_PENALTY,
  HOLDS_FROM,
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
    s.notes = s.notes.filter((x) => !x.bomb && !x.len);
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
  it('Haltenoten und Bomben kommen erst später, während einer Haltenote bleibt alles frei', () => {
    for (const seed of [1, 2, 3, 4, 5]) {
      const notes = game.init(seed, OPTS).notes;
      const holds = notes.filter((n) => n.len > 0);
      const bombs = notes.filter((n) => n.bomb);
      expect(holds.length).toBeGreaterThan(1);
      expect(bombs.length).toBeGreaterThan(2);
      expect(bombs.length).toBeLessThan(notes.length / 4);
      expect(Math.min(...holds.map((n) => n.t))).toBeGreaterThan(HOLDS_FROM - 1);
      expect(Math.min(...bombs.map((n) => n.t))).toBeGreaterThan(BOMBS_FROM - 1);
      for (const h of holds)
        expect(notes.some((n) => n !== h && n.t > h.t && n.t < h.t + h.len + GOOD_WINDOW)).toBe(false);
    }
  });
  it('Haltenote: halten bis zum Ende gibt Bonus, zu früh loslassen bricht die Kombo', () => {
    const play = (holdTicks: number) => {
      const s = game.init(2, OPTS);
      const h = s.notes.find((n) => n.len > 0)!;
      s.notes = [h];
      advanceTo(s, h.t);
      const press =
        h.lane === 0
          ? { ...NEUTRAL_INPUT, x: -1 }
          : h.lane === 2
            ? { ...NEUTRAL_INPUT, x: 1 }
            : { ...NEUTRAL_INPUT, a: true };
      for (let i = 0; i < holdTicks; i++) game.step(s, press);
      for (let i = 0; i < 20; i++) game.step(s, NEUTRAL_INPUT);
      return { s, h };
    };
    const full = play(400);
    expect(full.h.hold).toBe(2);
    expect(full.s.combo).toBe(2);
    const short = play(5);
    expect(short.h.hold).toBe(3);
    expect(short.s.combo).toBe(0);
    expect(game.score(full.s)).toBeGreaterThan(game.score(short.s) + 50);
  });
  it('Bombe drücken kostet Punkte und Kombo, in Ruhe lassen kostet nichts', () => {
    const s = game.init(3, OPTS);
    const b = s.notes.find((n) => n.bomb)!;
    s.notes = [b];
    s.points = 500;
    s.combo = 5;
    const t = structuredClone(s);
    advanceTo(s, b.t);
    game.step(
      s,
      b.lane === 0
        ? { ...NEUTRAL_INPUT, x: -1 }
        : b.lane === 2
          ? { ...NEUTRAL_INPUT, x: 1 }
          : { ...NEUTRAL_INPUT, a: true },
    );
    expect(s.points).toBe(500 - BOMB_PENALTY);
    expect(s.combo).toBe(0);
    advanceTo(t, b.t + 40);
    expect(t.points).toBe(500);
    expect(t.combo).toBe(5);
    expect(t.miss).toBe(0);
  });
  it('Mitte auch mit Hoch/Runter; Bots: 0.3 < 0.6 < 0.88', () => {
    expect(lanesDown({ ...NEUTRAL_INPUT, y: 1 })).toEqual([false, true, false]);
    expect(lanesDown({ ...NEUTRAL_INPUT, y: -1 })).toEqual([false, true, false]);
    const avg = (skill: number) => {
      let sum = 0;
      for (let i = 0; i < 10; i++) sum += runBot(game, 60 + i, OPTS, skill, 2 + i).score;
      return sum / 10;
    };
    const [w, m, st] = [avg(0.3), avg(0.6), avg(0.88)];
    expect(m).toBeGreaterThan(w);
    expect(st).toBeGreaterThan(m);
  });
});
