import { describe, expect, it } from 'vitest';
import { NEUTRAL_INPUT } from '../types';
import { runBot } from '../simulate';
import { game, holePos, STAR_POINTS } from './eisrutsche';

const opts = { playerIndex: 0, players: 4 };

describe('eisrutsche', () => {
  it('Welt ist pro Seed gleich; Löcher liegen nicht auf dem Start, Sterne nicht in Löchern', () => {
    for (const seed of [1, 2, 3, 77]) {
      const a = game.init(seed, opts);
      const b = game.init(seed, opts);
      expect(a.holes).toEqual(b.holes);
      expect(a.stars).toEqual(b.stars);
      expect(a.holes.length).toBeGreaterThanOrEqual(3);
      for (const h of a.holes) expect(Math.hypot(h.x, h.y)).toBeGreaterThan(h.r + 2);
      for (const st of a.stars)
        for (const h of a.holes) expect(Math.hypot(st.x - h.x, st.y - h.y)).toBeGreaterThan(h.r);
    }
    expect(game.init(1, opts).holes).not.toEqual(game.init(2, opts).holes);
  });
  it('rutscht weiter, wenn man loslässt, und bremst mit A', () => {
    const s = game.init(1, opts);
    for (let i = 0; i < 20; i++) game.step(s, { ...NEUTRAL_INPUT, y: -1 });
    const v = Math.hypot(s.vx, s.vy);
    expect(v).toBeGreaterThan(2);
    const s2 = JSON.parse(JSON.stringify(s)) as typeof s;
    for (let i = 0; i < 30; i++) game.step(s, NEUTRAL_INPUT);
    for (let i = 0; i < 30; i++) game.step(s2, { ...NEUTRAL_INPUT, a: true });
    expect(Math.hypot(s.vx, s.vy)).toBeGreaterThan(v * 0.4);
    expect(Math.hypot(s2.vx, s2.vy)).toBeLessThan(v * 0.1);
  });
  it('Sturz ins Loch: Rückkehr zum Start, Zeitverlust und Strafpunkte', () => {
    const s = game.init(5, opts);
    s.starPts = 3;
    const h = s.holes[0]!;
    const p = holePos(h, 1);
    s.x = p.x;
    s.y = p.y;
    game.step(s, NEUTRAL_INPUT);
    expect(s.falls).toBe(1);
    expect(s.respawn).toBeGreaterThan(50);
    expect(Math.hypot(s.x, s.y)).toBe(0);
    expect(game.score(s)).toBe(3 * STAR_POINTS - 80);
    const x0 = s.x;
    game.step(s, { ...NEUTRAL_INPUT, x: 1 });
    expect(s.x).toBe(x0);
  });
  it('Sterne zählen, goldene dreifach, Ersatzstern erscheint', () => {
    const s = game.init(4, opts);
    const st = s.stars[0]!;
    st.value = 3;
    s.x = st.x;
    s.y = st.y;
    s.respawn = 0;
    // Position knapp außerhalb von Löchern erzwingen: Loch-Treffer ausschließen
    s.holes = [];
    game.step(s, NEUTRAL_INPUT);
    expect(s.starPts).toBe(3);
    expect(s.stars.length).toBe(5);
    expect(game.score(s)).toBe(300);
  });
  it('Bot 0.95 ist deutlich besser als Bot 0.1', () => {
    let hi = 0;
    let lo = 0;
    for (let i = 0; i < 10; i++) {
      hi += runBot(game, 40 + i, opts, 0.95, i).score;
      lo += runBot(game, 40 + i, opts, 0.1, i).score;
    }
    expect(hi).toBeGreaterThan(lo * 1.4);
  });
});
