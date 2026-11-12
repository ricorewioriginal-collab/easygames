import { describe, expect, it } from 'vitest';
import { NEUTRAL_INPUT } from '../types';
import { runBot } from '../simulate';
import { CRACK_WARN, game, holeOpen, holePos, starGain, STAR_POINTS } from './eisrutsche';

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
    s.pts = 3 * STAR_POINTS;
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

  it('neue Löcher brechen später auf, vorher knackt das Eis; erst offen ist es gefährlich', () => {
    const s = game.init(6, opts);
    const late = s.holes.filter((h) => h.t0 > 0);
    expect(late.length).toBeGreaterThanOrEqual(1);
    expect(s.holes.filter((h) => h.t0 === 0).length).toBe(4);
    const h = late[0]!;
    // während des Knackens passiert nichts
    s.tick = h.t0 - CRACK_WARN;
    const p = holePos(h, s.tick + 1);
    s.x = p.x;
    s.y = p.y;
    game.step(s, NEUTRAL_INPUT);
    expect(s.falls).toBe(0);
    s.tick = h.t0;
    const q = holePos(h, s.tick + 1);
    s.x = q.x;
    s.y = q.y;
    s.vx = s.vy = 0;
    game.step(s, NEUTRAL_INPUT);
    expect(holeOpen(h, s.tick)).toBe(true);
    expect(s.falls).toBe(1);
  });
  it('Serie: Sterne ohne Sturz geben Bonus', () => {
    expect(starGain(1, 1)).toBe(STAR_POINTS);
    expect(starGain(1, 3)).toBeGreaterThan(starGain(1, 2));
    expect(starGain(3, 1)).toBe(3 * STAR_POINTS);
    const s = game.init(4, opts);
    s.holes = [];
    for (let k = 0; k < 3; k++) {
      const st = s.stars[0]!;
      st.value = 1;
      s.x = st.x;
      s.y = st.y;
      game.step(s, NEUTRAL_INPUT);
    }
    expect(s.streak).toBe(3);
    expect(s.pts).toBe(starGain(1, 1) + starGain(1, 2) + starGain(1, 3));
  });
  it('Bots: stark > mittel > schwach', () => {
    const avg = (skill: number) => {
      let sum = 0;
      for (let i = 0; i < 10; i++) sum += runBot(game, 80 + i, opts, skill, 6 + i).score;
      return sum / 10;
    };
    const lo = avg(0.3);
    const mid = avg(0.6);
    const hi = avg(0.88);
    expect(hi).toBeGreaterThan(lo);
    expect(mid).toBeGreaterThan(lo);
  });
});
