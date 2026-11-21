import { describe, it, expect } from 'vitest';
import { defaults } from '../src/engine/Save';
import { candidates, moveIn, moveOut, mates, MAX_MATES, EVENINGS, eveningWhy, doEvening, adoptPet, pet, petAct, petHungry } from '../src/game/wahl';
import { TREFF_GIGS, regular, treffDone, placeGigs } from '../src/game/treff';
import { dateFolge } from '../src/game/bond';
import { PROFILES, dateRec, SAFE_DATING } from '../src/game/social';

describe('Wahlfamilie', () => {
  it('Einzug erst ab Freundschaft, höchstens zwei', () => {
    const s = defaults();
    s.rel.mo = { f: 30, last: 0 }; s.rel.rex = { f: 60, last: 0 }; s.rel.nova = { f: 90, last: 0 }; s.rel.bruno = { f: 70, last: 0 };
    expect(moveIn(s, 'mo')).toMatch(/befreundet/);
    expect(moveIn(s, 'rex')).toBeNull();
    expect(moveIn(s, 'nova')).toBeNull();
    expect(mates(s)).toEqual(['rex', 'nova']);
    expect(moveIn(s, 'bruno')).toMatch(/voll/);
    expect(candidates(s).every((c) => c.why)).toBe(true);
    moveOut(s, 'rex'); expect(mates(s).length).toBe(MAX_MATES - 1);
  });
  it('Match zieht erst ein, wenn ihr zusammen seid', () => {
    const s = defaults(), id = PROFILES[0].id; dateRec(s, id).st = 2;
    expect(moveIn(s, id)).toMatch(/Zusammen/);
    dateRec(s, id).st = 3; expect(moveIn(s, id)).toBeNull();
  });
  it('gemeinsamer Abend einmal am Tag, ab 18 Uhr, mit Wissen', () => {
    const s = defaults(), film = EVENINGS.find((e) => e.id === 'film')!; s.money = 50;
    expect(eveningWhy(s, film, 20, 0)).toMatch(/Mitbewohner/);
    expect(eveningWhy(s, film, 12, 1)).toMatch(/18 Uhr/);
    expect(eveningWhy(s, film, 20, 1)).toBeNull();
    expect(doEvening(s, film)).toBe(film.facts![0]);
    expect(eveningWhy(s, film, 21, 1)).toMatch(/schon/);
  });
  it('Haustier adoptieren, füttern, Gassi nur mit Hund', () => {
    const s = defaults(); s.money = 200;
    expect(adoptPet(s, 'katze', 'Cher')).toBeNull();
    expect(pet(s)?.name).toBe('Cher'); expect(s.money).toBe(130);
    expect(adoptPet(s, 'hund', 'Keks')).toMatch(/schon/);
    expect(petHungry(s)).toBe(false); s.day++; expect(petHungry(s)).toBe(true);
    expect(petAct(s, 'feed')).toBeNull(); expect(petHungry(s)).toBe(false);
    expect(petAct(s, 'walk')).toMatch(/Katzen/);
  });
});

describe('Treffpunkte und Dates', () => {
  it('Stammgast nach allen Aufträgen eines Ortes', () => {
    const s = defaults(), rep = s.rep, gs = placeGigs('sauna');
    expect(gs.length).toBe(3); expect(TREFF_GIGS.length).toBe(6);
    expect(treffDone(s, gs[0])).toBe(false); expect(treffDone(s, gs[1])).toBe(false);
    expect(treffDone(s, gs[2])).toBe(true); expect(regular(s, 'sauna')).toBe(true); expect(s.rep).toBe(rep + 2);
    expect(regular(s, 'beach')).toBe(false);
  });
  it('Date-Folgen: Absage statt Ghosting, offiziell zusammen', () => {
    const s = defaults(), id = PROFILES[6].id;
    expect(dateFolge(s, id, 0, false)?.good).toBe(false);
    dateRec(s, id).st = 3; const r = s.rep;
    expect(dateFolge(s, id, 6, true)?.title).toMatch(/offiziell/); expect(s.rep).toBe(r + 1);
  });
  it('zwölf erwachsene Profile, Sicher-daten-Tipps', () => { expect(PROFILES.length).toBe(12); expect(PROFILES.every((p) => p.age >= 18)).toBe(true); expect(SAFE_DATING.length).toBeGreaterThan(5); });
});
