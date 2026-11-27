import { describe, it, expect } from 'vitest';
import { ausdauer, gainAus, AUS_DAY, giveBuff, buffOf, sprintSpeed, punch, trainBoost } from '../src/game/fit';
import { train } from '../src/game/figur';

const save = () => ({ day: 1, time: .2, flags: {} as Record<string, string | number | boolean> }) as never as import('../src/engine/Save').SaveData;

describe('Ausdauer und Boosts', () => {
  it('wächst mit Tageslimit und baut nach Pausen ab', () => {
    const s = save();
    expect(gainAus(s, 3)).toBe(3);
    expect(gainAus(s, 9)).toBe(AUS_DAY - 3);
    expect(gainAus(s, 1)).toBe(0);
    expect(ausdauer(s)).toBe(20 + AUS_DAY);
    s.day += 10;
    expect(ausdauer(s)).toBe(20);
  });
  it('Boost läuft nach Stunden ab und wirkt', () => {
    const s = save(), base = sprintSpeed(s, false);
    giveBuff(s, 'mate');
    expect(buffOf(s)?.id).toBe('mate');
    expect(sprintSpeed(s, false)).toBeGreaterThan(base);
    expect(sprintSpeed(s, true)).toBe(6.3);
    giveBuff(s, 'kaffee');
    expect(sprintSpeed(s, true)).toBeGreaterThan(6.3);
    s.time += 3 / 24;
    expect(buffOf(s)).toBeNull();
  });
  it('Shake verstärkt Training und Schläge', () => {
    const a = save(), b = save();
    giveBuff(b, 'shake');
    expect(trainBoost(b)).toBe(1.5);
    expect(train(b, 'kraft', trainBoost(b))).toBeGreaterThan(train(a, 'kraft', trainBoost(a)));
    expect(punch(b).hits).toBe(1);
    expect(punch(a).push).toBeLessThan(punch(b).push);
  });
});
