import { describe, it, expect } from 'vitest';
import { defaults } from '../src/engine/Save';
import { BUSINESSES, buy, priceOf, haggle } from '../src/game/empire';
import { daily, popOf, setPop } from '../src/game/manage';
import { clubOf, clubFactor, setDj, setPrice, setDoor, setDeco, setAware, runNight, bookNight, nightDone, anniversary, upcoming, momentsFor, QEVENTS, DECOS } from '../src/game/club';
import { pcEvents } from '../src/game/hooks';
import { HOME_ITEMS, buyItem, ownsItem, setStyle, floorOf, buildRoom, roomLevel, roomTheme, ROOMS } from '../src/game/house';

const start = (id = 'prisma') => { const s = defaults(); s.money = 90000; s.rep = 60; const b = BUSINESSES.find((x) => x.id === id)!; return { s, b }; };

describe('Club kaufen', () => {
  it('meldet den Kauf als clubGekauft und nutzt Story-Rabatt', () => {
    const { s, b } = start(); const got: string[] = [];
    const off = pcEvents.on('clubGekauft', (e) => got.push(e.id));
    s.flags.deal_prisma = 50; expect(priceOf(s, b)).toBe(b.price / 2);
    const before = s.money; expect(buy(s, b)).toBeNull(); expect(before - s.money).toBe(b.price / 2);
    expect(got).toEqual(['prisma']); off();
  });
  it('Verhandeln klappt nur mit genug Ruf und einmal am Tag', () => {
    const { s, b } = start('komet'); s.rep = b.need;
    expect(haggle(s, b)).toBe(false); expect(haggle(s, b)).toMatch(/morgen/);
    s.day++; s.rep = b.need + 5; expect(haggle(s, b)).toBe(true); expect(priceOf(s, b)).toBe(Math.round(b.price * .85));
  });
});

describe('Club führen', () => {
  it('ohne Einstellungen bleibt der Tagesertrag gleich', () => {
    const { s, b } = start(); buy(s, b);
    expect(clubFactor(s, b.id).mult).toBe(1); expect(daily(s, b).net).toBe(b.daily);
  });
  it('DJ, Preise, Tür und Deko ändern Umsatz und Kosten', () => {
    const { s, b } = start(); buy(s, b); const base = daily(s, b).gross;
    setDj(s, b.id, 'bass'); setPrice(s, b.id, 3); setDoor(s, b.id, 2);
    expect(setDeco(s, b.id, 'disco')).toBeNull(); expect(clubOf(s, b.id).decos).toContain('disco');
    expect(daily(s, b).gross).toBeGreaterThan(base); expect(daily(s, b).wage).toBeGreaterThan(0);
    s.money = 0; expect(setDeco(s, b.id, 'ballroom')).toMatch(/fehlen/); expect(setDeco(s, b.id, '')).toBeNull();
    expect(DECOS.length).toBe(4);
  });
  it('Clubnacht: Themennacht am Jahrestag bringt mehr Gäste, danach ist der Abend vorbei', () => {
    const { s, b } = start(); buy(s, b); setAware(s, b.id, true); s.time = .6; // 20:24 Uhr
    const ev = QEVENTS.find((e) => e.id === 'stonewall')!;
    const plain = runNight(s, b, 60, 10, undefined, new Date(2026, 0, 10));
    const anniv = runNight(s, b, 60, 10, ev, new Date(2026, 5, 28));
    expect(anniv.anniv).toBe(true); expect(anniv.guests).toBeGreaterThan(plain.guests);
    const got: number[] = []; const off = pcEvents.on('clubNacht', (e) => got.push(e.guests));
    bookNight(s, b, anniv, (v) => setPop(s, b.id, v), popOf(s, b.id));
    expect(nightDone(s, b.id)).toBe(true); expect(got).toEqual([anniv.guests]); off();
  });
  it('kennt echte Jahrestage und drei Momente je Nacht', () => {
    expect(anniversary(QEVENTS.find((e) => e.id === 'tdor')!, new Date(2026, 10, 21))).toBe(true);
    expect(upcoming(new Date(2026, 10, 21), 3)[0].e.id).toBe('tdor');
    expect(new Set(momentsFor(5, 'prisma').map((m) => m.who)).size).toBe(3);
  });
});

describe('Zuhause ausbauen', () => {
  it('Möbel, Boden und Anbau kaufen', () => {
    const s = defaults(); s.money = 50000;
    expect(buyItem(s, 'aquarium')).toBeNull(); expect(ownsItem(s, 'aquarium')).toBe(true); expect(buyItem(s, 'aquarium')).toMatch(/schon/);
    expect(setStyle(s, 'floor', 'marmor')).toBeNull(); expect(floorOf(s).id).toBe('marmor');
    for (let i = 0; i < 3; i++) expect(buildRoom(s, 'party')).toBeNull();
    expect(roomLevel(s, 'party')).toBe(3); expect(buildRoom(s, 'party')).toMatch(/Voll/);
    expect(HOME_ITEMS.length).toBeGreaterThanOrEqual(8);
  });
  it('jede Ausbaustufe bringt mehr Einrichtung und Stellen', () => {
    for (const r of ROOMS) {
      const a = roomTheme(r.id, 1), c = roomTheme(r.id, 3);
      expect(c.items.length).toBeGreaterThan(a.items.length); expect(c.spots.length).toBeGreaterThan(a.spots.length); expect(c.own).toBe(true);
      for (const sp of c.spots) expect(Math.hypot(sp.x - 5.2, sp.z - 3.4)).toBeGreaterThan(1.4);   // nicht auf der Tür
    }
  });
});
