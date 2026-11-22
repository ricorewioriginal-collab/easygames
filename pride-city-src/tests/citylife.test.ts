import { describe, it, expect } from 'vitest';
import { defaults } from '../src/engine/Save';
import { skyAt, rainbowAt, forecast, slotOf, SKY, useSeason } from '../src/game/weather';
import { LIFE_EVENTS, eventFits, kerbSpot, applyOut, paradeOn } from '../src/game/citylife';
import { walkable } from '../src/game/World';

describe('Wetter', () => {
  it('steht je Tag und Abschnitt fest und kennt alle Arten', () => {
    const seen = new Set<string>();
    useSeason('winter'); for (let d = 2; d < 120; d++) seen.add(skyAt(d, .3));   // Schnee gibt es nur im Winter
    useSeason('fruehling');
    for (let d = 2; d < 120; d++) for (let sl = 0; sl < 4; sl++) { const k = skyAt(d, sl / 4 + .1); expect(skyAt(d, sl / 4 + .2)).toBe(k); seen.add(k); }
    expect(seen.size).toBe(Object.keys(SKY).length);
    expect(slotOf(0)).toBe(0); expect(slotOf(.26)).toBe(1); expect(slotOf(.99)).toBe(3);
  });
  it('zur Parade am Samstagnachmittag scheint die Sonne', () => {
    for (let w = 0; w < 30; w++) expect(skyAt(6 + w * 7, .3)).toBe('klar');
  });
  it('Regenbogen gibt es nur tagsüber direkt nach Regen', () => {
    let n = 0;
    for (let d = 2; d < 200; d++) for (const t of [.05, .3, .55, .8]) if (rainbowAt(d, t)) { n++; expect(SKY[skyAt(d, t)].rain).toBe(0); expect(slotOf(t)).toBeLessThan(2); }
    expect(n).toBeGreaterThan(3);
    expect(forecast(3, .6)).toHaveLength(4);
  });
});
describe('Stadtleben', () => {
  it('jedes Ereignis hat Auswahl und Folgen, und es gibt immer eines, das passt', () => {
    for (const e of LIFE_EVENTS) { expect(e.choices.length).toBeGreaterThan(1); for (const c of e.choices) expect(c.out.text.length).toBeGreaterThan(10); }
    for (const night of [false, true]) for (const rain of [false, true]) expect(LIFE_EVENTS.filter((e) => eventFits(e, night, rain)).length).toBeGreaterThan(1);
  });
  it('Ereignisse stehen auf dem Gehweg', () => {
    let n = 0;
    for (let x = -60; x <= 200; x += 7) for (let z = -55; z <= 55; z += 9) { const q = kerbSpot(x, z); if (!q) continue; n++; expect(walkable(q.x, q.z)).toBe(true); expect(Math.abs(q.x - Math.round(q.x / 30) * 30)).toBeCloseTo(5.4); expect(Math.abs(q.z - Math.round(q.z / 30) * 30)).toBeGreaterThanOrEqual(7); }
    expect(n).toBeGreaterThan(50);
  });
  it('Folgen ändern Geld und Ruf, nie unter null', () => {
    const s = defaults(); s.money = 3; s.rep = 1;
    applyOut(s, { text: '', money: -20, rep: -5 });
    expect(s.money).toBe(0); expect(s.rep).toBe(0);
  });
  it('die Parade läuft samstags von 12 bis 18 Uhr', () => {
    const s = defaults(); s.day = 6; s.time = .3; expect(paradeOn(s)).toBe(true);
    s.time = .1; expect(paradeOn(s)).toBe(false); s.time = .55; expect(paradeOn(s)).toBe(false);
    s.day = 7; s.time = .3; expect(paradeOn(s)).toBe(false);
  });
});
