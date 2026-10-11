import { describe, expect, it } from 'vitest';
import { NEUTRAL_INPUT } from '../types';
import { runBot } from '../simulate';
import { game, makeDrops, MAGNET_COOLDOWN } from './muenzregen';

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
      { id: 0, kind: 'star', x: 0, t0: 0, y: 2, speed: 1, state: 0 },
      { id: 1, kind: 'stone', x: 0, t0: 60, y: 9, speed: 1, state: 0 },
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
    s.drops = [{ id: 0, kind: 'coin', x: 3, t0: 0, y: 5, speed: 1, state: 0 }];
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
