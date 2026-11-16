import { describe, it, expect } from 'vitest';
import { defaults, migrate } from '../src/engine/Save';
import { PROFILES, dateRec, finishDate, canStay, testDue, TEST_EVERY, GLOSSARY, feed, post, rollEvent, bond } from '../src/game/social';

describe('Beziehungen und Gesundheit', () => {
  it('18+ ist standardmäßig aus und bleibt beim Laden erhalten', () => {
    expect(defaults().settings.adult).toBe(false);
    const s = migrate({ settings: { adult: true }, inv: { condom: 2 } });
    expect(s.settings.adult).toBe(true);
    expect(s.inv.condom).toBe(2);
  });
  it('alle Profile sind erwachsen', () => { for (const p of PROFILES) expect(p.age).toBeGreaterThanOrEqual(18); });
  it('Date-Stufen steigen nur bei gutem Date', () => {
    const s = defaults(), id = PROFILES[0].id;
    expect(finishDate(s, id, 2).up).toBe(false);
    expect(finishDate(s, id, 5).up).toBe(true);
    expect(dateRec(s, id).st).toBe(1);
  });
  it('gemeinsame Nacht nur mit 18+, Vertrautheit und Kondom', () => {
    const s = defaults(), id = PROFILES[1].id;
    dateRec(s, id).st = 2;
    expect(canStay(s, id)).toBe('off');
    s.settings.adult = true;
    expect(canStay(s, id)).toBe('condom');
    s.inv.condom = 1;
    expect(canStay(s, id)).toBeNull();
    dateRec(s, id).st = 1;
    expect(canStay(s, id)).toBe('early');
  });
  it('Test-Erinnerung mit PrEP', () => {
    const s = defaults(); s.health.prep = true; s.health.test = 1; s.day = 1 + TEST_EVERY - 1;
    expect(testDue(s)).toBe(false); s.day++; expect(testDue(s)).toBe(true);
  });
  it('Glossar trennt 18+-Begriffe, Feed und Ereignisse', () => {
    expect(GLOSSARY.some(([, , a]) => !a)).toBe(true);
    expect(GLOSSARY.some(([, , a]) => a)).toBe(true);
    const s = defaults(); post(s, 'Du', 'Hallo');
    expect(feed(s)[0].t).toBe('Hallo');
    expect(rollEvent(s, .1)).toBeNull();
    expect(rollEvent(s, .6)?.money).toBe(5);
    expect(bond(85)).toBe('Wahlfamilie');
  });
});

import { playerLook } from '../src/game/Actor';
import { profileShots } from '../src/game/social';
describe('Outfits und Profilfotos', () => {
  it('Harness nur mit 18+, Oberteil außer bei er', () => {
    const s = defaults(); s.flags.outfit = 'harness';
    expect(playerLook(s).outfit).toBe('clothed');
    s.settings.adult = true; expect(playerLook(s).outfit).toBe('harness');
    s.pronouns = 'he'; expect(playerLook(s).top).toBe(false);
    s.pronouns = 'she'; expect(playerLook(s).top).toBe(true);
  });
  it('Profilfotos: zwei ohne, drei mit 18+', () => {
    expect(profileShots(PROFILES[0], false)).toHaveLength(2);
    const a = profileShots(PROFILES[0], true);
    expect(a.map((x) => x.look.outfit)).toEqual(['clothed', 'shirtless', 'underwear']);
  });
});
