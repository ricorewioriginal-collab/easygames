import { describe, it, expect } from 'vitest';
import { busTalk, busAfter, TALK_COUNT } from '../src/game/bus';
import { burn, tankOf, TANK } from '../src/game/tank';

const save = () => ({ day: 1, time: .2, flags: {} as Record<string, string | number | boolean> }) as never as import('../src/engine/Save').SaveData;

describe('Bus und Tank', () => {
  it('jede Busfahrt hat ein Gespräch mit zwei Antworten', () => {
    for (let i = 0; i < TALK_COUNT; i++) {
      let got: boolean | null = null;
      const l = busTalk((i + .5) / TALK_COUNT, (n) => { got = n; });
      const ch = l[l.length - 1].choices!;
      expect(ch.length).toBe(2);
      ch[0].fn!(); expect(got).toBe(true);
      expect(busAfter((i + .5) / TALK_COUNT, true).text.length).toBeGreaterThan(10);
    }
  });
  it('Tank leert sich, warnt und bleibt bei 0', () => {
    const s = save();
    expect(tankOf(s)).toBe(100);
    expect(burn(s, TANK.m * 50)).toBeNull();
    expect(burn(s, TANK.m * 40)).toBe('low');
    expect(burn(s, TANK.m * 20)).toBe('empty');
    expect(tankOf(s)).toBe(0);
    expect(burn(s, 100)).toBeNull();
    expect(TANK.price(s)).toBe(40);
  });
});
