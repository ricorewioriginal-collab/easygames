import { describe, it, expect } from 'vitest';
import { defaults } from '../src/engine/Save';
import { walkable } from '../src/game/World';
import { MISSIONS, SAGA_NPCS, sagaTalk, sagaDone, sagaGoal, sagaHidden, sagaMarks } from '../src/game/saga';
import { goal, talk, type StoryCtx } from '../src/game/story';
import { owns, income } from '../src/game/empire';
import { NACHT, NACHT_NPCS, nachtTalk, nachtDone } from '../src/game/nacht';
import type { Line } from '../src/ui/ui';
import type { Gig } from '../src/game/gigs';

describe('Akt II – Die Lichter der Hochstadt', () => {
  it('alle Stationen und Figuren stehen auf begehbarem Boden', () => {
    for (const n of SAGA_NPCS) expect(walkable(n.x, n.z), n.id).toBe(true);
    for (const m of MISSIONS) for (const st of m.steps) expect(walkable(st.x, st.z), m.id + ': ' + st.label).toBe(true);
    for (const m of MISSIONS) expect(SAGA_NPCS.some((n) => n.id === m.giver)).toBe(true);
    for (const n of NACHT_NPCS) expect(walkable(n.x, n.z), n.id).toBe(true);
    for (const m of NACHT) for (const st of m.steps) expect(walkable(st.x, st.z), m.id + ': ' + st.label).toBe(true);
  });
  it('lässt sich von der ersten bis zur letzten Mission durchspielen', () => {
    const s = defaults(); let h = 12, gig: Gig | null = null;
    const c = {
      s, toast: () => {}, hour: () => h, skipToHour: (x: number) => { h = x; },
      say: (lines: Line[], done?: () => void) => { for (const l of lines) { if (typeof l.text === 'function') l.text(); l.choices?.[0]?.fn?.(); } done?.(); },
      card: () => Promise.resolve(), mission: (g: Gig) => { gig = g; },
    } as unknown as StoryCtx;
    // vor Kapitel 2 gibt es noch keine Missionen
    sagaTalk(c, 'vega'); expect(gig).toBe(null); expect(sagaMarks(s).length).toBe(0);
    s.chapter = 6; s.flags.nacht = 5; s.flags.biz_prisma = 1; // Nachtleben schon erledigt
    expect(sagaHidden(s, 'kron')).toBe(true);
    for (let i = 0; i < MISSIONS.length; i++) {
      const m = MISSIONS[i];
      expect(sagaGoal(s)!.npc).toBe(m.giver); expect(goal(s).title).toContain(m.title);
      expect(sagaMarks(s)[0][0]).toBe(m.giver);
      gig = null; expect(talk(c, m.giver)).toBe(true);
      if (m.night && !gig) { expect(h).toBe(21); talk(c, m.giver); }
      expect(gig, m.id).not.toBe(null);
      expect(s.flags.sagaRun).toBe(m.id);
      const run = gig as unknown as Gig;
      gig = null; talk(c, m.giver); expect(gig).toBe(null); // läuft schon: kein zweiter Start
      run.after!(); expect(sagaDone(s)).toBe(i + 1);
    }
  });
  it('schließt Missionen ab, vergibt das Theater und merkt sich das Ende', () => {
    const s = defaults(); s.chapter = 6; let cards = 0; const h = 22;
    const c = {
      s, toast: () => {}, hour: () => h, skipToHour: () => {},
      say: (lines: Line[], done?: () => void) => { for (const l of lines) { if (typeof l.text === 'function') l.text(); l.choices?.[0]?.fn?.(); } done?.(); },
      card: () => { cards++; return Promise.resolve(); }, mission: (g: Gig) => { g.after!(); },
    } as unknown as StoryCtx;
    for (const m of MISSIONS) { const before = sagaDone(s); sagaTalk(c, m.giver); expect(sagaDone(s)).toBe(before + 1); }
    expect(sagaDone(s)).toBe(8); expect(cards).toBe(1); expect(s.flags.sagaEnd).toBe('bridge');
    expect(owns(s, 'kaleido')).toBe(true); expect(income(s)).toBe(180);
    expect(sagaGoal(s)).toBe(null); expect(goal(s).title).toContain('Sterling Nights 1/');
    expect(sagaHidden(s, 'kron')).toBe(false);
  });
  it('gescheiterte Mission lässt sich neu starten', () => {
    const s = defaults(); s.chapter = 3; let n = 0;
    const c = { s, toast: () => {}, hour: () => 12, skipToHour: () => {}, say: (lines: Line[], done?: () => void) => { for (const l of lines) l.choices?.[0]?.fn?.(); done?.(); }, card: () => Promise.resolve(), mission: (g: Gig) => { n++; g.failed!(); } } as unknown as StoryCtx;
    sagaTalk(c, 'vega'); sagaTalk(c, 'vega');
    expect(n).toBe(2); expect(sagaDone(s)).toBe(0);
  });
});

describe('Sterling Nights – Nachtleben', () => {
  it('fünf Nächte bis zum eigenen Club', () => {
    const s = defaults(); s.chapter = 6; s.flags.saga = 8; let h = 12, gig: Gig | null = null;
    const c = {
      s, toast: () => {}, hour: () => h, skipToHour: (x: number) => { h = x; },
      say: (lines: Line[], done?: () => void) => { for (const l of lines) { if (typeof l.text === 'function') l.text(); l.choices?.[0]?.fn?.(); } done?.(); },
      card: () => Promise.resolve(), mission: (g: Gig) => { gig = g; },
    } as unknown as StoryCtx;
    for (let i = 0; i < NACHT.length; i++) {
      expect(goal(s).title).toContain(NACHT[i].title);
      gig = null; h = 12; talk(c, 'rocco'); expect(h).toBe(21); talk(c, 'rocco');
      expect(s.flags.nachtRun).toBe(NACHT[i].id);
      (gig as unknown as Gig).after!(0);
    }
    expect(nachtDone(s)).toBe(5); expect(s.money).toBeGreaterThanOrEqual(1500);
    expect(goal(s).poi).toBe('club');
    s.flags.biz_prisma = 1; expect(goal(s).title).toContain('Insel 1/');
    expect(nachtTalk(c, 'rocco')).toBe(true);
  });
});
