import { describe, it, expect } from 'vitest';
import { defaults } from '../src/engine/Save';
import { Wanted, arsenal, LAWS, MAX_STARS } from '../src/game/crime';
import { dateRec } from '../src/game/social';
import { canPropose, propose, wed, canAdopt, applyAdopt, arrive, spouse, kid, kidLook, spouseLook, WEDDING, ADOPT, ADOPT_DAYS } from '../src/game/family';

describe('Gesetze und Fahndungssterne', () => {
  it('Vergehen geben Sterne bis höchstens fünf, Bußgeld summiert sich', () => {
    const w = new Wanted();
    expect(w.add('assault')).toBe(true);
    expect(w.stars).toBe(1);
    w.add('police'); expect(w.stars).toBe(3);
    for (let i = 0; i < 5; i++) w.add('police');
    expect(w.stars).toBe(MAX_STARS);
    expect(w.add('slip')).toBe(false);
    expect(w.fines).toBe(LAWS.assault.fine + 6 * LAWS.police.fine + LAWS.slip.fine);
  });
  it('abhängen, wenn dich lange keine Streife sieht', () => {
    const w = new Wanted(); w.add('theft');
    expect(w.tick(5, false)).toBeNull();
    expect(w.tick(1, true)).toBeNull(); // gesehen: Zähler von vorn
    expect(w.unseen).toBe(0);
    expect(w.tick(w.escapeTime, false)).toBe('lost');
    expect(w.stars).toBe(0);
  });
  it('Festnahme kostet nie mehr, als du hast', () => {
    const w = new Wanted(); w.add('police');
    expect(w.arrest(20)).toBe(20);
    expect(w.stars).toBe(0);
    w.add('slip'); expect(w.arrest(1000)).toBe(LAWS.slip.fine + 25);
  });
  it('Glitzer-Dildo nur mit 18+ und gekauftem Toy', () => {
    expect(arsenal(false, 3)).not.toContain('dildo');
    expect(arsenal(true, 0)).not.toContain('dildo');
    expect(arsenal(true, 1)).toEqual(['hand', 'noodle', 'dildo', 'lube']);
  });
});

describe('Heiraten und Adoption', () => {
  it('Antrag braucht „Zusammen“ und einen Ring, Hochzeit kostet Geld', () => {
    const s = defaults(); s.money = 1000;
    expect(canPropose(s, 'kai')).toMatch(/Zusammen/);
    dateRec(s, 'kai').st = 3;
    expect(canPropose(s, 'kai')).toMatch(/Ring/);
    s.inv.ring = 1;
    expect(propose(s, 'kai')).toBeNull();
    expect(s.inv.ring).toBe(0);
    expect(spouse(s)).toBeUndefined();
    expect(wed(s)).toBeNull();
    expect(spouse(s)?.name).toBe('Kai');
    expect(s.money).toBe(1000 - WEDDING);
    expect(spouseLook(s)?.palette).toBe('bear');
  });
  it('Kind kommt nach ein paar Tagen, nur verheiratet und mit Ruf', () => {
    const s = defaults(); s.money = 1000;
    expect(canAdopt(s)).toMatch(/Hochzeit/);
    s.flags.spouse = 'robin'; s.rep = 0;
    expect(canAdopt(s)).toMatch(/Ruf/);
    s.rep = 10;
    expect(applyAdopt(s, 'f', 'Mila')).toBeNull();
    expect(s.money).toBe(1000 - ADOPT);
    expect(canAdopt(s)).toMatch(/läuft/);
    expect(arrive(s)).toBeNull();
    s.day += ADOPT_DAYS;
    expect(arrive(s)?.name).toBe('Mila');
    expect(kid(s)?.g).toBe('f');
    expect(kidLook(s)?.body).toBe('Female_Child_01');
    expect(arrive(s)).toBeNull();
  });
});
