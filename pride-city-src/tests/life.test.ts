import { describe, it, expect } from 'vitest';
import { defaults } from '../src/engine/Save';
import { advance, minutesUntil, mood, track, dailies, hour, moodFactor } from '../src/game/life';
import { JOBS, blocked, finish, level, wage, open, situations } from '../src/game/jobs';

describe('Alltag', () => {
  it('Zeit läuft, Bedürfnisse sinken, Tageswechsel um Mitternacht', () => {
    const s = defaults(); s.time = 0; // 6 Uhr
    expect(advance(s, 17 * 60)).toBe(0); // 23 Uhr
    expect(Math.round(hour(s))).toBe(23);
    expect(s.needs.energy).toBeLessThan(85);
    expect(advance(s, 120)).toBe(1);
    expect(s.day).toBe(2);
  });
  it('Schlafen bis 7 Uhr füllt Energie', () => {
    const s = defaults(); s.time = .7; s.needs.energy = 10;
    advance(s, minutesUntil(s, 7), true);
    expect(Math.round(hour(s))).toBe(7);
    expect(s.needs.energy).toBeGreaterThan(80);
  });
  it('Stimmung und Lohnfaktor', () => {
    const s = defaults();
    for (const k of Object.keys(s.needs) as (keyof typeof s.needs)[]) s.needs[k] = 100;
    expect(mood(s)).toBe(100);
    expect(moodFactor(s)).toBeCloseTo(1.15);
  });
  it('Tagesziele: drei verschiedene, Belohnung nur einmal', () => {
    const s = defaults(), d = dailies(s);
    expect(new Set(d.map((x) => x.id)).size).toBe(3);
    const g = d.find((x) => x.n === 1)!;
    const before = s.glitter;
    expect(track(s, g.id).length).toBe(1);
    expect(s.glitter).toBe(before + g.glitter);
    expect(track(s, g.id).length).toBe(0);
  });
});

describe('Jobs', () => {
  it('Öffnungszeiten auch über Mitternacht', () => {
    const dj = JOBS.find((j) => j.id === 'stage')!;
    expect(open(dj, 23)).toBe(true); expect(open(dj, 1)).toBe(true); expect(open(dj, 12)).toBe(false);
  });
  it('Schicht zahlt, höchstens zwei am Tag, Beförderung', () => {
    const s = defaults(), j = JOBS[0]; s.time = (12 - 6) / 24;
    expect(blocked(s, j)).toBeNull();
    expect(situations(s, j)).toHaveLength(3);
    const m = s.money, r = finish(s, j, 6);
    expect(s.money).toBeGreaterThan(m + wage(s, j) * 3);
    expect(r.promoted).toBeTruthy();
    expect(level(s, j.id)).toBe(1);
    s.needs.energy = 100; finish(s, j, 0);
    s.needs.energy = 100;
    expect(blocked(s, j)).toContain('zwei Schichten');
  });
});
