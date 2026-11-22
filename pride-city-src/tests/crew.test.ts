import { describe, it, expect } from 'vitest';
import { defaults } from '../src/engine/Save';
import { walkable } from '../src/game/World';
import { CREW, VIERTEL, crewTalk, crewTick, crewGoal, crewOf, kiezKasse, payKasse, crewOdds, crewFighters, schutz, patrol } from '../src/game/crew';
import { HIDES } from '../src/game/flucht';
import { NPCS, type StoryCtx } from '../src/game/story';
import { Wanted, LAWS } from '../src/game/crime';
import { act } from '../src/game/faden';
import type { Line } from '../src/ui/ui';
import type { Gig } from '../src/game/gigs';

function ctx(s = defaults()) {
  const log: { lines: Line[]; gigs: Gig[]; stars: number } = { lines: [], gigs: [], stars: 0 };
  const run = (lines: Line[], done?: () => void) => { log.lines.push(...lines); for (const l of lines) l.choices?.[0]?.fn?.(); done?.(); };
  const c: StoryCtx = { s, say: run, phone: run, toast: () => {}, reward: (m, r) => { s.money += m; s.rep += r; }, step: () => {}, skipToHour: () => {}, hour: () => 22, dance: () => {},
    chapterDone: () => {}, enterHome: () => {}, barShift: () => {}, credits: () => {}, card: () => Promise.resolve(), mission: (g) => log.gigs.push(g),
    gigOn: () => false, wanted: (n) => { if (n !== undefined) log.stars = n; return log.stars; } };
  return { c, s, log };
}
const late = () => { const s = defaults(); Object.assign(s, { chapter: 6, day: 9, rep: 200 }); Object.assign(s.flags, { saga: 99, nacht: 99, biz_prisma: 1, cl_prisma_nights: 1, fadenEnd: 2, flutEnd: 3, flut: 5 }); return s; };

describe('Akt V – Die Lichterkette', () => {
  it('Crew-Figuren gibt es in der Stadt, Viertel und Verstecke liegen auf begehbarem Boden', () => {
    for (const m of CREW) expect(NPCS.some((n) => n.id === m.id), m.id).toBe(true);
    // Inseln (Rostwerk, Kap Zuflucht) melden sich erst im Spiel an; ihre Punkte stammen aus Akt IV
    for (const v of VIERTEL.filter((q) => q.id !== 'rostwerk' && q.id !== 'zuflucht')) expect(walkable(v.x, v.z), v.id).toBe(true);
    for (const h of HIDES) expect(walkable(h.x, h.z), h.name).toBe(true);
  });
  it('Tom ruft an, drei Leute treten bei, dann folgt die falsche Anzeige mit drei Sternen', () => {
    const { c, s, log } = ctx(late());
    expect(act(s)).toBe(5);
    for (let i = 0; i < 12; i++) crewTick(c);
    expect(s.flags.crewCall).toBe(true);
    expect(crewGoal(s)?.title).toContain('Crew');
    for (const id of ['bruno', 'jules', 'kim']) expect(crewTalk(c, id)).toBe(true);
    expect(crewOf(s).length).toBe(4);
    expect(s.flags.crew).toBe(1);
    for (let i = 0; i < 12; i++) crewTick(c);
    expect(log.stars).toBe(3);
    log.stars = 0;
    for (let i = 0; i < 12; i++) crewTick(c);
    expect(s.flags.crew).toBe(2);
    expect(log.gigs.at(-1)?.id).toBe('crew_video');
  });
  it('Streife schützt ein Viertel und füllt die Kiezkasse', () => {
    const { c, s, log } = ctx(late());
    Object.assign(s.flags, { crewCall: true, crew_tom: 1, crew_bruno: 1, crew_sam: 1, crew_jules: 1, crew: 4, crewWatch: true });
    patrol(c, 'hafen');
    const g = log.gigs.at(-1)!;
    expect(g.steps.some((st) => st.fight?.length)).toBe(true);
    g.after?.();
    expect(schutz(s, 'hafen')).toBe(1);
    expect(kiezKasse(s)).toBe(Math.round(15 * 1.5));
    const m = s.money; expect(payKasse(s)).toBeGreaterThan(0); expect(s.money).toBeGreaterThan(m); expect(payKasse(s)).toBe(0);
    expect(crewFighters(s).map((f) => f.id)).toEqual(['bruno', 'sam']);
    expect(crewOdds(s)).toBeGreaterThan(.5);
  });
  it('Fahndung: falscher Verdacht ohne Bußgeld, Versteck hängt schneller ab', () => {
    const w = new Wanted();
    w.force(3, 'verdacht');
    expect(w.stars).toBe(3); expect(LAWS.verdacht.fine).toBe(0);
    const t = w.escapeTime; let lost = false;
    for (let i = 0; i < Math.ceil(t / 2.5) + 1 && !lost; i++) lost = w.tick(1, false, 2.5) === 'lost';
    expect(lost).toBe(true);
  });
});
