import { describe, it, expect } from 'vitest';
import { levels, nextFx } from '../src/game/soundscape';

const base = { sea: 0, cars: 0, people: 0, night: false, rain: false, inCar: false, high: false, dogs: 0 };
describe('Stadt-Atmo', () => {
  it('Meer am Wasser, Stimmen bei vielen Leuten, im Auto gedämpft', () => {
    expect(levels({ ...base, sea: .8 }).sea).toBeGreaterThan(.9);
    expect(levels({ ...base, people: 8 }).crowd).toBeGreaterThan(.9);
    expect(levels({ ...base, people: 8, inCar: true }).crowd).toBeLessThan(.5);
  });
  it('tags Vögel, nachts Grillen, Möwen am Wasser, nichts hoch in der Luft', () => {
    expect(nextFx(base, .5, .5).fx?.[0]).toBe('bird');
    expect(nextFx({ ...base, night: true }, .5, .5).fx?.[0]).toBe('cricket');
    expect(nextFx({ ...base, sea: .6 }, .1, .5).fx?.[0]).toBe('gull');
    expect(nextFx({ ...base, high: true }, .1, .5).fx).toBeNull();
  });
});
