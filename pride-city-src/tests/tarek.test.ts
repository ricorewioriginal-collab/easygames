import { describe, it, expect } from 'vitest';
import { defaults } from '../src/engine/Save';
import { walkable } from '../src/game/World';
import { TAREK_NPCS, TAREK_STEPS, KAUTION, tarekTalk, tarekTick, tarekGoal, tarekDone, tarekInside, tarekHidden, ways } from '../src/game/tarek';
import { NPCS, goal, chapterLabel, type StoryCtx } from '../src/game/story';
import type { Line } from '../src/ui/ui';
import type { Gig } from '../src/game/gigs';

function ctx(s = defaults(), pick = 0) {
  const log: { lines: Line[]; gigs: Gig[]; stars: number; calls: number } = { lines: [], gigs: [], stars: 0, calls: 0 };
  const run = (lines: Line[], done?: () => void) => { log.lines.push(...lines); for (const l of lines) ((pick && l.choices?.find((q) => q.label.includes('🕶️'))) || l.choices?.[0])?.fn?.(); done?.(); };
  const c: StoryCtx = { s, say: run, phone: (l, d) => { log.calls++; run(l, d); }, toast: () => {}, reward: (m, r) => { s.money += m; s.rep += r; }, step: () => {}, skipToHour: () => {}, hour: () => 22, dance: () => {},
    chapterDone: () => {}, enterHome: () => {}, barShift: () => {}, credits: () => {}, card: () => Promise.resolve(), mission: (g) => log.gigs.push(g),
    gigOn: () => false, wanted: (n) => { if (n !== undefined) log.stars = n; return log.stars; } };
  return { c, s, log };
}
const tick = (c: StoryCtx) => { for (let i = 0; i < 12; i++) tarekTick(c); };
const finish = (log: { gigs: Gig[] }) => { const g = log.gigs[log.gigs.length - 1]; expect(g.free).toBe(true); g.after?.(); };

describe('Story-Modus „Gitter und Glitzer“ (Rico und Tarek)', () => {
  it('Tarek und Mira stehen auf begehbarem Boden und sind Teil der Figurenliste', () => {
    for (const n of TAREK_NPCS) { expect(NPCS.some((q) => q.id === n.id), n.id).toBe(true); expect(walkable(n.x, n.z), n.id).toBe(true); }
  });
  it('ganzer Weg ohne Zeitdruck: Anruf, Besuch, Zeugin, Kaution, Fahrtenbuch, Freilassung, letzte Fahrt', () => {
    const { c, s, log } = ctx();
    s.flags.mode = 'story';
    // Kapitel 1: erst nach dem Koffer
    s.step = 2; tick(c); expect(s.flags.tarekCall).toBeUndefined();
    s.step = 3; tick(c); expect(s.flags.tarekCall).toBe(true);
    expect(tarekInside(s)).toBe(true);
    expect(tarekGoal(s)?.poi).toBe('police');
    expect(tarekTalk(c, 'tarek')).toBe(true);
    expect(tarekDone(s)).toBe(1);
    expect(s.flags.relModel).toBe('offen');
    // Mira erst ab Kapitel 2
    expect(tarekGoal(s)).toBeNull();
    s.chapter = 2; tick(c);
    expect(tarekGoal(s)?.npc).toBe('mira');
    expect(tarekTalk(c, 'mira')).toBe(true); finish(log);
    expect(tarekDone(s)).toBe(2); expect(s.flags.tw_zeuge).toBe('rico');
    // Kaution: sparen ohne Frist
    s.chapter = 3; s.money = 10;
    tarekTalk(c, 'mira'); expect(tarekDone(s)).toBe(2);
    s.money = KAUTION + 20; tarekTalk(c, 'mira');
    expect(tarekDone(s)).toBe(3); expect(s.money).toBe(20 + 4 * 0);
    s.chapter = 4; tarekTalk(c, 'mira'); finish(log);
    expect(tarekDone(s)).toBe(4); expect(log.stars).toBe(0);
    s.chapter = 5; expect(tarekGoal(s)?.poi).toBe('police');
    tarekTalk(c, 'tarek');
    expect(s.flags.tarekFrei).toBeTruthy(); expect(tarekInside(s)).toBe(false);
    expect(tarekHidden(s, 'tarek')).toBe(false); expect(tarekHidden(s, 'mira')).toBe(true);
    // letzte Fahrt erst nach der Pride
    tarekTalk(c, 'tarek'); expect(log.gigs.length).toBe(2);
    s.chapter = 6; expect(goal(s).npc).toBe('tarek');
    tarekTalk(c, 'tarek'); finish(log);
    expect(tarekDone(s)).toBe(TAREK_STEPS.length); expect(s.flags.tarekEnd).toBeTruthy();
    expect(ways(s)).toEqual({ t: 0, r: 3 });
    expect(tarekGoal(s)).toBeNull();
  });
  it('Tareks Weg: Abkürzungen kosten Ruf bzw. bringen einen Fahndungsstern', () => {
    const { c, s, log } = ctx(defaults(), 1);
    Object.assign(s, { chapter: 4, money: 900 }); Object.assign(s.flags, { mode: 'story', tarekCall: true, tarek: 1 });
    tarekTalk(c, 'mira'); finish(log);
    expect(s.flags.tw_zeuge).toBe('tarek');
    tarekTalk(c, 'mira'); expect(s.flags.tw_kaution).toBe('tarek');
    tarekTalk(c, 'mira'); finish(log);
    expect(s.flags.tw_graf).toBe('tarek'); expect(log.stars).toBe(1);
    expect(ways(s).t).toBe(3);
  });
  it('alte Spielstände ohne Modus: kein Anruf, bis der Story-Modus eingeschaltet wird', () => {
    const { c, s, log } = ctx();
    Object.assign(s, { chapter: 6 });
    tick(c); expect(log.calls).toBe(0);
    s.flags.mode = 'story'; tick(c); expect(log.calls).toBe(1); expect(s.flags.tarekCall).toBe(true);
  });
  it('Freie Welt: kein Tarek, keine Story-Ziele, eigenes Etikett', () => {
    const { c, s, log } = ctx();
    Object.assign(s, { chapter: 6 }); s.flags.mode = 'frei';
    tick(c);
    expect(log.calls).toBe(0);
    expect(tarekTalk(c, 'tarek')).toBe(false);
    expect(goal(s).title).not.toMatch(/Gitter|Akt|Insel|Hochstadt/);
    Object.assign(s.flags, { drag: 'Lola', dragStage: 99, wagen: true, radioShows: 1 });
    if (!/Drag/.test(goal(s).title)) expect(goal(s).title).toBe('Freie Welt');
    expect(chapterLabel(s)).toBe('Freie Welt');
    expect(tarekHidden(s, 'mira')).toBe(true);
    expect(tarekHidden(s, 'tarek')).toBe(true);
  });
});
