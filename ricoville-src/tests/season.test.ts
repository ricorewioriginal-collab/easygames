import { describe, expect, it } from 'vitest';
import { daylight, seasonOf, weatherAt, WEATHER_SLOT } from '../src/rendering/season';

describe('Jahreszeit und Wetter (nur Optik)', () => {
  it('ordnet Monate den Jahreszeiten zu', () => {
    expect(seasonOf(new Date(2026, 0, 15))).toBe('winter');
    expect(seasonOf(new Date(2026, 3, 1))).toBe('spring');
    expect(seasonOf(new Date(2026, 6, 1))).toBe('summer');
    expect(seasonOf(new Date(2026, 9, 17))).toBe('autumn');
    expect(seasonOf(new Date(2026, 11, 24))).toBe('winter');
  });
  it('Wetter ist je Abschnitt fest, meist klar, Schnee nur im Winter', () => {
    const t = 1_800_000_000_000;
    const start = Math.floor(t / WEATHER_SLOT) * WEATHER_SLOT;
    for (let i = 0; i < 50; i++) expect(weatherAt(start + i * WEATHER_SLOT + 1000, 'autumn')).toBe(weatherAt(start + (i + 1) * WEATHER_SLOT - 1, 'autumn'));
    const count = (s: 'spring' | 'summer' | 'autumn' | 'winter', w: string) => {
      let n = 0;
      for (let i = 0; i < 2000; i++) if (weatherAt(t + i * WEATHER_SLOT, s) === w) n++;
      return n / 2000;
    };
    expect(count('summer', 'rain')).toBeGreaterThan(0.08);
    expect(count('summer', 'rain')).toBeLessThan(0.25);
    expect(count('summer', 'snow')).toBe(0);
    expect(count('winter', 'rain')).toBe(0);
    expect(count('winter', 'snow')).toBeGreaterThan(0.3);
    expect(count('autumn', 'clear')).toBeGreaterThan(0.5);
  });
  it('Tageslicht bleibt zwischen 0 und 1 und hat Tag und Nacht', () => {
    const vals = Array.from({ length: 480 }, (_, i) => daylight(i));
    expect(Math.min(...vals)).toBe(0);
    expect(Math.max(...vals)).toBe(1);
  });
});
