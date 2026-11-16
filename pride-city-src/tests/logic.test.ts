import { describe, it, expect } from 'vitest';
import { migrate, fromGayLife, defaults } from '../src/engine/Save';
import { goal, talk, poi, danceResult, storyTick, hidden, marks, lichtPart, lfPart, lfGlow, lichtLight, type StoryCtx } from '../src/game/story';
import { LICHT_CHAPTERS, lichtMax } from '../src/game/licht';
import { LF_CHAPTERS, lfMax } from '../src/game/leuchtfeuer';
import type { Line } from '../src/ui/ui';
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
    s.chapter = 2; s.step = 0; expect(goal(s).npc).toBe('mo');
    s.chapter = 6; expect(goal(s).title).toBe('Freies Spiel');
  });
  it('lässt sich von Kapitel 2 bis zum Abspann durchspielen', () => {
    const s = defaults(); s.chapter = 2; s.step = 0;
    let credits = 0, h = 12;
    const c: StoryCtx = {
      s, toast: () => {}, hour: () => h, skipToHour: (x) => { h = x; }, enterHome: (a) => a?.(), credits: () => { credits++; },
      say: (lines: Line[], done) => { for (const l of lines) { if (typeof l.text === 'function') l.text(); l.choices?.[0]?.fn?.(); } done?.(); },
      reward: (m, r) => { s.money += m; s.rep += r; }, step: (n) => { s.step = n; },
      dance: () => danceResult(c, true), barShift: (d) => d?.(),
      chapterDone: () => { s.chapter++; s.step = 0; },
      card: () => ({ then: (f: () => void) => f() }) as unknown as Promise<void>,
    };
    // Kapitel 2
    talk(c, 'mo'); expect(s.step).toBe(1);
    s.jobs.cafe = { xp: 1, shifts: 1, earned: 40 }; storyTick(c); expect(s.step).toBe(2);
    for (const id of ['mo', 'jules', 'nova', 'rex', 'bruno', 'lena']) s.rel[id] = { f: 6, last: 1 };
    storyTick(c); expect(s.step).toBe(3);
    h = 12; talk(c, 'hilde'); expect(s.chapter).toBe(2);
    h = 19; talk(c, 'hilde'); expect(s.chapter).toBe(3);
    // Kapitel 3
    talk(c, 'nova'); poi(c, 'boutique'); expect(s.flags.drag).toBeTruthy();
    h = 22; talk(c, 'nova'); expect(s.step).toBe(3);
    talk(c, 'rex'); expect(s.flags.rex).toBe('friend');
    s.money = 10; poi(c, 'bar'); expect(s.flags.bar).toBeUndefined();
    s.money = 400; poi(c, 'bar'); expect(s.flags.bar).toBe(true); expect(s.chapter).toBe(4);
    // Kapitel 4
    expect(hidden(s, 'nova')).toBe(true);
    talk(c, 'jules'); expect(marks(s).length).toBe(3);
    for (const id of ['rex', 'bruno', 'kim']) talk(c, id);
    expect(s.step).toBe(2);
    poi(c, 'studio'); h = 23; poi(c, 'park'); expect(s.step).toBe(4); expect(hidden(s, 'nova')).toBe(false);
    talk(c, 'jules'); expect(s.chapter).toBe(5);
    // Kapitel 5
    talk(c, 'jules'); for (const id of ['lena', 'bruno', 'tariq']) talk(c, id);
    expect(goal(s).poi).toBe('plaza');
    h = 13; poi(c, 'plaza');
    expect(s.chapter).toBe(6); expect(credits).toBe(1);
  });
  it('hat genug Farbwelten und Figuren', () => {
    expect(PALETTES.length).toBeGreaterThanOrEqual(12);
    expect(new Set(PALETTES.map((p) => p.id)).size).toBe(PALETTES.length);
    expect(BODIES.length).toBe(6);
  });
  it('erzählt „Ich bin das Licht“ als Rückblenden bis zum Ende', async () => {
    const s = defaults(); s.chapter = 2;
    let danced = 0;
    const c: StoryCtx = {
      s, toast: () => {}, hour: () => 12, skipToHour: () => {}, enterHome: (a) => a?.(), credits: () => {},
      say: (lines: Line[], done) => { for (const l of lines) { l.choices?.[l.choices.length > 1 && l.choices[0].label.startsWith('Später') ? 1 : 0]?.fn?.(); if (typeof l.text === 'function') l.text(); } done?.(); },
      reward: (m, r) => { s.money += m; s.rep += r; }, step: () => {}, chapterDone: () => {}, barShift: (d) => d?.(),
      dance: () => { danced++; danceResult(c, true); },
      card: () => ({ then: (f: () => void) => f() }) as unknown as Promise<void>,
    };
    expect(hidden(defaults(), 'leon')).toBe(true);
    for (let k = 0; k < 8; k++) { talk(c, 'leon'); await new Promise((r) => setTimeout(r, 80)); }
    expect(lichtPart(s)).toBe(3); // Kapitel 2 gibt nur die ersten Rückblenden frei
    s.chapter = 6;
    talk(c, 'leon'); await new Promise((r) => setTimeout(r, 100));
    expect(s.flags.lichtIntro).toBe(true);
    for (let k = 0; k < 30 && lichtPart(s) < LICHT_CHAPTERS.length; k++) { talk(c, 'leon'); await new Promise((r) => setTimeout(r, 80)); }
    expect(lichtPart(s)).toBe(LICHT_CHAPTERS.length);
    expect(danced).toBe(1);
    expect(s.flags.luma_dress).toBeTruthy();
    expect(['licht', 'glanz', 'funke']).toContain(s.flags.lichtEnd);
    expect(lichtLight(s)).toBeLessThanOrEqual(lichtMax());
  });

  it('erzählt „Leuchtfeuer“ als Rückblenden bis zum Ende', async () => {
    const s = defaults(); s.chapter = 2;
    const c: StoryCtx = {
      s, toast: () => {}, hour: () => 12, skipToHour: () => {}, enterHome: (a) => a?.(), credits: () => {},
      say: (lines: Line[], done) => { for (const l of lines) { l.choices?.[0]?.fn?.(); if (typeof l.text === 'function') l.text(); } done?.(); },
      reward: (m, r) => { s.money += m; s.rep += r; }, step: () => {}, chapterDone: () => {}, barShift: (d) => d?.(), dance: () => {},
      card: () => ({ then: (f: () => void) => f() }) as unknown as Promise<void>,
    };
    expect(hidden(defaults(), 'finn')).toBe(true);
    for (let k = 0; k < 8; k++) { talk(c, 'finn'); await new Promise((r) => setTimeout(r, 70)); }
    expect(lfPart(s)).toBe(4);
    s.chapter = 4;
    for (let k = 0; k < 12; k++) { talk(c, 'finn'); await new Promise((r) => setTimeout(r, 70)); }
    expect(lfPart(s)).toBe(12);
    s.chapter = 6;
    for (let k = 0; k < 40 && lfPart(s) < LF_CHAPTERS.length; k++) { talk(c, 'finn'); await new Promise((r) => setTimeout(r, 70)); }
    expect(lfPart(s)).toBe(LF_CHAPTERS.length);
    expect(['feuer', 'fenster', 'strahl']).toContain(s.flags.lfEnd);
    expect(lfGlow(s)).toBeLessThanOrEqual(lfMax());
  });
});

import { PLACE_THEMES, HOUSE_THEMES, houseTheme } from '../src/game/interiors';
describe('Innenräume', () => {
  const GL = ['dates', 'club', 'rave', 'style', 'gym', 'match', 'run', 'dance', 'pool', 'kara', 'sauna', 'dark', 'cast', 'quiz'];
  const all = [...Object.values(PLACE_THEMES), ...HOUSE_THEMES];
  it('jeder Raum hat benutzbare Stellen im Raum und gültige Minispiele', () => {
    for (const t of all) {
      expect(t.spots.length).toBeGreaterThan(0);
      for (const sp of t.spots) {
        expect(Math.abs(sp.x)).toBeLessThan(6); expect(Math.abs(sp.z)).toBeLessThan(4.5);
        if (sp.act.k === 'gl') expect(GL).toContain(sp.act.id);
      }
    }
  });
  it('ohne 18+ nie ein 18+-Haus', () => {
    for (let i = 0; i < 300; i++) expect(houseTheme(i, false).adult).toBeFalsy();
    expect(new Set(Array.from({ length: 300 }, (_, i) => houseTheme(i, false).id)).size).toBe(HOUSE_THEMES.filter((t) => !t.adult).length);
  });
});
