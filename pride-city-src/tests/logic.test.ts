import { describe, it, expect } from 'vitest';
import { migrate, fromGayLife, defaults } from '../src/engine/Save';
import { goal } from '../src/game/story';
import { PALETTES, BODIES } from '../src/game/palettes';

describe('Spielstand', () => {
  it('liefert Standardwerte für leere oder kaputte Daten', () => {
    expect(migrate(null).money).toBe(150);
    expect(migrate('kaputt').chapter).toBe(1);
  });
  it('übernimmt nur passende Typen', () => {
    const s = migrate({ money: 'viel', rep: 7, settings: { music: .2, quality: 'x' }, unbekannt: 1 });
    expect(s.money).toBe(150);
    expect(s.rep).toBe(7);
    expect(s.settings.music).toBe(.2);
    expect(s.settings.quality).toBe(-1);
    expect((s as unknown as Record<string, unknown>).unbekannt).toBeUndefined();
  });
  it('behält Flags und Rekorde vollständig', () => {
    const s = migrate({ flags: { feel: 'nervous', sig_lena: true }, best: { dance: 900 } });
    expect(s.flags).toEqual({ feel: 'nervous', sig_lena: true });
    expect(s.best.dance).toBe(900);
  });
  it('übernimmt Name, Geld und Glitzer aus Gay Life!', () => {
    expect(fromGayLife({ name: 'Rico', glitzer: 42, life: { money: 333.4, day: 9 } })).toEqual({ name: 'Rico', money: 333, glitter: 42 });
    expect(fromGayLife({ name: 'Du' })).toBeNull();
    expect(fromGayLife({ life: { money: 999999 } })!.money).toBe(5000);
    expect(fromGayLife(null)).toBeNull();
  });
});

describe('Story', () => {
  it('führt Kapitel 1 Schritt für Schritt', () => {
    const s = defaults();
    expect(goal(s).npc).toBe('mo');
    s.step = 2; expect(goal(s).poi).toBe('home');
    s.step = 4; s.flags.sig_lena = true; s.flags.sig_sam = false;
    expect(goal(s).title).toContain('1/3');
    s.step = 6; expect(goal(s).npc).toBe('nova');
    s.chapter = 2; expect(goal(s).title).toBe('Freies Spiel');
  });
  it('hat genug Farbwelten und Figuren', () => {
    expect(PALETTES.length).toBeGreaterThanOrEqual(12);
    expect(new Set(PALETTES.map((p) => p.id)).size).toBe(PALETTES.length);
    expect(BODIES.length).toBe(5);
  });
});
