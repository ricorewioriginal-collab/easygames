import { describe, expect, it } from 'vitest';
import { NEUTRAL_INPUT } from '../types';
import { runBot } from '../simulate';
import { BLAST_R, game, makeDrops, MAGNET_COOLDOWN, multOf, RUSH_TICK, WIND_TICK } from './muenzregen';

const opts = { playerIndex: 0, players: 4 };

describe('muenzregen', () => {
  it('Fallmuster hängt nur vom Seed ab', () => {
    expect(makeDrops(11)).toEqual(makeDrops(11));
    expect(makeDrops(12)).not.toEqual(makeDrops(11));
    const k = new Set(makeDrops(11).map((d) => d.kind));
    expect(k.has('coin') && k.has('star') && k.has('stone') && k.has('bomb')).toBe(true);
  });
  it('fängt eine Münze und wertet sie, Steine ziehen Punkte ab', () => {
    const s = game.init(1, opts);
    s.drops = [
      { id: 0, kind: 'star', x: 0, t0: 0, y: 2, speed: 1, vx: 0, state: 0 },
      { id: 1, kind: 'stone', x: 0, t0: 60, y: 9, speed: 1, vx: 0, state: 0 },
    ];
    for (let i = 0; i < 200; i++) game.step(s, NEUTRAL_INPUT);
    expect(s.drops[0]!.state).toBe(1);
    expect(s.drops[1]!.state).toBe(1);
    expect(s.points).toBe(2); // 5 - 3
    expect(s.caught).toBe(1);
    expect(s.hits).toBe(1);
  });
  it('Magnet braucht 6 s Abklingzeit und zieht Münzen heran', () => {
    const s = game.init(1, opts);
    s.drops = [{ id: 0, kind: 'coin', x: 3, t0: 0, y: 5, speed: 1, vx: 0, state: 0 }];
    game.step(s, { ...NEUTRAL_INPUT, a: true });
    expect(s.cooldown).toBe(MAGNET_COOLDOWN - 0);
    for (let i = 0; i < 60; i++) game.step(s, NEUTRAL_INPUT);
    expect(s.drops[0]!.state).toBe(1); // ohne Magnet läge sie bei x=3 daneben
    // erneutes Drücken während der Abklingzeit bewirkt nichts
    const cd = s.cooldown;
    for (let i = 0; i < 30; i++) game.step(s, NEUTRAL_INPUT);
    expect(s.magnet).toBe(0);
    game.step(s, { ...NEUTRAL_INPUT, a: true });
    expect(s.magnet).toBe(0);
    expect(s.cooldown).toBeLessThan(cd);
  });
  it('Serie steigert den Multiplikator, ein Stein setzt ihn zurück', () => {
    expect(multOf(0)).toBe(1);
    expect(multOf(6)).toBe(2);
    expect(multOf(40)).toBe(3);
    const s = game.init(1, opts);
    s.drops = Array.from({ length: 7 }, (_, i) => ({
      id: i,
      kind: 'coin' as const,
      x: 0,
      t0: i * 10,
      y: 2,
      speed: 1,
      vx: 0,
      state: 0 as const,
    }));
    s.drops.push({ id: 7, kind: 'stone', x: 0, t0: 80, y: 2, speed: 1, vx: 0, state: 0 });
    for (let i = 0; i < 200; i++) game.step(s, NEUTRAL_INPUT);
    expect(s.points).toBe(6 + 2 - 3); // sechs ×1, die siebte ×2, dann Stein
    expect(s.bestCombo).toBe(7);
    expect(s.combo).toBe(0);
  });
  it('Bomben explodieren am Boden neben dem Korb', () => {
    const s = game.init(1, opts);
    s.points = 10;
    s.drops = [{ id: 0, kind: 'bomb', x: BLAST_R - 0.2, t0: 0, y: 1, speed: 1, vx: 0, state: 0 }];
    for (let i = 0; i < 60 && !s.blasts; i++) game.step(s, NEUTRAL_INPUT);
    expect(s.blasts).toBe(1);
    expect(s.lastBlast.near).toBe(true);
    expect(s.stun).toBeGreaterThan(0);
    expect(s.points).toBe(8);
  });
  it('Wind und Goldrausch kommen erst später', () => {
    const d = makeDrops(5);
    expect(d.filter((x) => x.t0 < WIND_TICK).every((x) => x.vx === 0)).toBe(true);
    expect(d.some((x) => x.t0 >= WIND_TICK && x.vx !== 0)).toBe(true);
    expect(d.filter((x) => x.kind === 'big').every((x) => x.t0 >= RUSH_TICK)).toBe(true);
    expect(d.some((x) => x.kind === 'big')).toBe(true);
  });
  it('Bot-Stufen unterscheiden sich', () => {
    const avg = (sk: number) => {
      let t = 0;
      for (let i = 0; i < 8; i++) t += runBot(game, 70 + i, opts, sk, i).score;
      return t / 8;
    };
    const a = avg(0.3);
    const b = avg(0.6);
    const c = avg(0.88);
    expect(b).toBeGreaterThan(a);
    expect(c).toBeGreaterThan(b);
  });
  it('Bot 0.95 ist deutlich besser als Bot 0.1', () => {
    let hi = 0;
    let lo = 0;
    for (let i = 0; i < 10; i++) {
      hi += runBot(game, 40 + i, opts, 0.95, i).score;
      lo += runBot(game, 40 + i, opts, 0.1, i).score;
    }
    expect(hi).toBeGreaterThan(lo * 1.3);
  });
});
