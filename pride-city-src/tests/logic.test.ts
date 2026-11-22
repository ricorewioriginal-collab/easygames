import { describe, it, expect } from 'vitest';
import { migrate, fromGayLife, defaults } from '../src/engine/Save';
import { goal, talk, poi, danceResult, storyTick, hidden, marks, lichtPart, lfPart, lfGlow, lichtLight, type StoryCtx } from '../src/game/story';
import { fadenKrone, actLabel } from '../src/game/faden';
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
    s.chapter = 6; expect(goal(s).title).toContain('Hochstadt 1/8'); // Akt II übernimmt nach dem Abspann
    s.flags.saga = 1; expect(goal(s).title).toContain('Sterling Nights 1/5'); // Akt II wechselt zum Nachtleben
    s.flags.saga = 8; s.flags.nacht = 5; expect(goal(s).title).toContain('Club Prisma'); // Krönung: eigener großer Club
    s.flags.biz_prisma = 3; s.flags.cl_prisma_nights = 1; expect(goal(s).title).toContain('Insel 1/4'); // Akt III: die Inselkette
    expect(goal(s).isle).toBe('einhorn');
    s.settings.adult = true; expect(goal(s).title).toContain('Insel 1/5');
    for (const id of ['einhorn', 'canaria', 'lindenhof', 'rummel', 'cruising']) s.flags['w_' + id] = 4;
    s.flags.fadenCall = true; expect(goal(s).poi).toBe('plaza');
    s.flags.fadenEnd = 9; expect(goal(s).poi).toBe('onelove'); s.flags.dragKrone = true; expect(goal(s).title).toMatch(/Festwagen/); s.flags.wagen = 'progress,pink,0,ballons,pop'; expect(goal(s).title).toMatch(/Rainbow Talk/); s.flags.radioShows = 1; expect(goal(s).title).toBe('Freies Spiel');
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
      card: () => ({ then: (f: () => void) => f() }) as unknown as Promise<void>, mission: () => {}, phone: (l, d) => c.say(l, d),
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
    talk(c, 'jules'); expect(marks(s).filter((m) => m[1] !== '🌆' && m[1] !== '🥂').length).toBe(3);
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
      card: () => ({ then: (f: () => void) => f() }) as unknown as Promise<void>, mission: () => {}, phone: (l, d) => c.say(l, d),
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
      card: () => ({ then: (f: () => void) => f() }) as unknown as Promise<void>, mission: () => {}, phone: (l, d) => c.say(l, d),
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

describe('Roter Faden (Akt II und III)', () => {
  it('ruft zwischen den Akten an und endet mit der Pride der Inseln', () => {
    const s = defaults(); s.chapter = 6; s.step = 0;
    const calls: string[] = [], cards: string[] = [];
    let h = 14;
    const c: StoryCtx = {
      s, toast: () => {}, hour: () => h, skipToHour: (x) => { h = x; }, enterHome: (a) => a?.(), credits: () => {},
      say: (lines: Line[], done) => { for (const l of lines) { if (typeof l.text === 'function') l.text(); l.choices?.[0]?.fn?.(); } done?.(); },
      reward: (m, r) => { s.money += m; s.rep += r; }, step: (n) => { s.step = n; },
      dance: () => danceResult(c, true), barShift: (d) => d?.(), chapterDone: () => {},
      card: (k: string) => { cards.push(k); return ({ then: (f: () => void) => f() }) as unknown as Promise<void>; }, mission: () => {},
      phone: (l, d) => { calls.push(String(l[0].who)); c.say(l, d); },
    };
    const tick = () => { for (let i = 0; i < 6; i++) storyTick(c); };
    tick(); expect(calls).toEqual(['📞 Mama Vega']); expect(cards).toContain('Akt II');
    s.flags.saga = 1; tick(); expect(calls[1]).toBe('📞 Rocco Sterling');
    s.flags.saga = 8; s.flags.nacht = 5; s.flags.biz_prisma = 2; s.flags.cl_prisma_nights = 1; tick(); expect(calls[2]).toBe('📞 Jules'); expect(cards).toContain('Akt III');
    tick(); expect(calls[3]).toBe('📞 Jules'); expect(s.flags.wagenCall).toBe(true); calls.splice(3, 1); s.flags.wagen = 'progress,pink,0,ballons,pop';
    tick(); expect(calls[3]).toBe('📞 Kiki Kaleido'); calls.splice(3, 1); s.flags.radioShows = 1;
    s.flags.w_einhorn = 4; tick(); expect(calls[3]).toBe('📞 Stella Sternenstaub'); expect(goal(s).isle).toBe('canaria');
    for (const id of ['canaria', 'lindenhof', 'rummel']) s.flags['w_' + id] = 4;
    tick(); tick(); expect(s.flags.fadenCall).toBe(true); expect(goal(s).poi).toBe('plaza');
    h = 9; expect(poi(c, 'plaza')).toBe(true); expect(h).toBe(12); // wartet bis 12 Uhr
    poi(c, 'plaza'); expect(s.flags.fadenEnd).toBeTruthy(); expect(cards).toContain('Akt III abgeschlossen');
    expect(goal(s).title).toMatch(/^Drag-Karriere 1\/5/); s.flags.dragKrone = true;
    expect(goal(s).title).toBe('Freies Spiel');
    s.day = 6; s.time = 7 / 24; expect(goal(s).title).toMatch(/^CSD-Parade/); s.flags.wagenPrize = 6; expect(goal(s).title).toBe('Freies Spiel');
    s.flags.wagenWins = 1; tick(); expect(calls.at(-1)).toBe('📞 Nova'); tick(); expect(calls.at(-1)).toBe('📞 Jules'); expect(s.flags.wagenWinCall).toBe(true);
    // Akt IV „Die graue Flut“: Mo ruft an, dann Tom, Inseln Rostwerk und Kap Zuflucht, Kral, Ayla
    tick(); tick(); expect(calls.at(-1)).toBe('📞 Mo'); expect(cards).toContain('Akt IV'); expect(actLabel(s)).toMatch(/^Akt IV/);
    expect(goal(s).npc).toBe('tom'); expect(goal(s).title).toMatch(/1\/5: Farbe gegen Grau/);
    s.flags.flut = 2; expect(goal(s).isle).toBe('rostwerk'); s.flags.w_rostwerk = 4; tick(); tick(); expect(calls.at(-1)).toBe('📞 Viktor Kral'); expect(goal(s).npc).toBe('kral');
    s.flags.flut = 3; expect(goal(s).isle).toBe('zuflucht'); expect(hidden(s, 'kral')).toBe(true); s.flags.w_zuflucht = 4;
    h = 23; tick(); tick(); expect(calls.at(-1)).toBe('📞 Ayla Demir'); expect(s.flags.flutRun).toBe('moewe');
  });
  it('Wahlfamilie: Hilde ruft beim ersten festen Paar an', () => {
    const s = defaults(); s.chapter = 4; s.step = 1;
    const calls: string[] = [];
    const c = { s, say: (_l: Line[], d?: () => void) => d?.(), phone: (l: Line[], d?: () => void) => { calls.push(String(l[0].who) + l[0].text); d?.(); } } as unknown as StoryCtx;
    for (let i = 0; i < 6; i++) storyTick(c);
    expect(calls).toEqual([]);
    s.flags.bd_lena_official = 3; for (let i = 0; i < 12; i++) storyTick(c);
    expect(calls.length).toBe(1); expect(calls[0]).toMatch(/^📞 Hilde.*offiziell/);
  });
  it('dockt die Drag-Karriere an: Vega ruft nach der ersten Show, Nova nach der Krone', () => {
    const s = defaults(); s.chapter = 3; s.step = 4;
    const calls: string[] = [];
    const c = { s, say: (_l: Line[], d?: () => void) => d?.(), phone: (l: Line[], d?: () => void) => { calls.push(String(l[0].who)); d?.(); } } as unknown as StoryCtx;
    for (let i = 0; i < 6; i++) storyTick(c);
    expect(calls).toEqual(['📞 Mama Vega']); expect(s.flags.dragCall).toBe(true);
    s.chapter = 4; s.step = 9; expect(goal(s).poi).toBe('onelove');
    s.flags.dragKrone = true; for (let i = 0; i < 12; i++) storyTick(c); fadenKrone(c, 'Divine Dynamite'); expect(calls).toEqual(['📞 Mama Vega', '📞 Nova']);
  });
});

describe('3D-Minispiele in der Story', () => {
  it('Finale: Parade-Runner vor dem Tanz, Strandbad nach Playa', () => {
    const s = defaults(); s.chapter = 6; s.flags.saga = 8; s.flags.nacht = 5; s.flags.biz_prisma = 1; s.flags.cl_prisma_nights = 1;
    s.flags.faden2 = true; s.flags.faden3 = true; s.flags.fadenNext = 'canaria'; s.flags.wagenCall = true; s.flags.fmCall = true;
    const minis: string[] = [];
    const c: StoryCtx = {
      s, toast: () => {}, hour: () => 14, skipToHour: () => {}, enterHome: (a) => a?.(), credits: () => {},
      say: (lines: Line[], done) => { for (const l of lines) { if (typeof l.text === 'function') l.text(); l.choices?.[0]?.fn?.(); } done?.(); },
      reward: () => {}, step: () => {}, dance: () => danceResult(c, true), barShift: (d) => d?.(), chapterDone: () => {},
      card: () => ({ then: (f: () => void) => f() }) as unknown as Promise<void>, mission: () => {},
      phone: (l, d) => c.say(l, d), mini: (id, d) => { minis.push(id); d?.(true); },
    };
    s.flags.w_einhorn = 4; s.flags.w_canaria = 4;
    return new Promise<void>((res) => {
      for (let i = 0; i < 6; i++) storyTick(c);
      setTimeout(() => {
        expect(minis).toEqual(['pool']);
        for (const id of ['lindenhof', 'rummel']) s.flags['w_' + id] = 4;
        for (let i = 0; i < 12; i++) storyTick(c);
        poi(c, 'plaza'); expect(minis).toEqual(['pool', 'run']); expect(s.flags.fadenEnd).toBeTruthy();
        res();
      }, 300);
    });
  });
});
