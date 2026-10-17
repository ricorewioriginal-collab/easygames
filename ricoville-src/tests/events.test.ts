import { describe, expect, it } from 'vitest';
import { BUILDING, BUILDINGS } from '../src/catalogs/buildings';
import { QUEST, QUESTS } from '../src/catalogs/quests';
import { City, newCityState } from '../src/core/city';
import { seasonKey, SEASONS } from '../src/core/season';
import type { Mode } from '../src/core/types';

const AUTUMN = new Date(2026, 9, 16, 12).getTime();

function setup(mode: Mode = 'relaxed', start = AUTUMN) {
  let t = start;
  const clock = { advance: (s: number) => (t += s * 1000), set: (v: number) => (t = v) };
  const city = new City(newCityState('Festdorf', mode, start), () => t);
  city.s.level = 3;
  city.refreshQuests();
  return { city, clock };
}
const ids = (c: City) => c.activeQuests().map((q) => q.id);

describe('Saison-Events', () => {
  it('jede Jahreszeit hat eine Kette mit Belohnungs-Deko, die es nur dort gibt', () => {
    for (const s of SEASONS) {
      const qs = QUESTS.filter((q) => q.season === s);
      expect(qs.length).toBe(3);
      const unlock = qs.map((q) => q.reward.unlock).filter(Boolean);
      expect(unlock.length).toBe(1);
      expect(BUILDING.get(unlock[0]!)?.event).toBe(s);
    }
    expect(BUILDINGS.filter((b) => b.event).length).toBe(4);
  });
  it('Dezember zählt zum Winter des Folgejahres', () => {
    expect(seasonKey(new Date(2026, 11, 20))).toBe(seasonKey(new Date(2027, 0, 20)));
    expect(seasonKey(new Date(2026, 9, 1))).not.toBe(seasonKey(new Date(2027, 9, 1)));
  });
  it('nur in der eigenen Jahreszeit sichtbar, erst ab Level 3, nicht im Kreativmodus', () => {
    const { city } = setup();
    expect(ids(city)).toContain('e_he1');
    expect(ids(city)).not.toContain('e_wi1');
    expect(ids(city)).not.toContain('e_he2');
    city.s.level = 2;
    expect(ids(city)).not.toContain('e_he1');
    const cr = setup('creative').city;
    expect(ids(cr)).not.toContain('e_he1');
  });
  it('Kette abschließen schaltet die Deko frei; vorher lässt sie sich nicht bauen', () => {
    const { city } = setup();
    city.s.coins = 99999;
    expect(city.canPlace('laternenbogen', 28, 20, 0).ok).toBe(false);
    for (const id of ['e_he1', 'e_he2', 'e_he3']) {
      const q = QUEST.get(id)!;
      const p = city.s.quests[id]!;
      expect(p, id).toBeTruthy();
      q.goals.forEach((g, i) => 'ev' in g && (p.c[i] = g.n));
      city.refreshQuests();
      const r = city.claimQuest(id);
      expect(r.ok, `${id}: ${r.msg}`).toBe(true);
    }
    expect(city.s.unlocks).toEqual(['laternenbogen']);
    expect(city.canPlace('laternenbogen', 28, 20, 0).ok).toBe(true);
    expect(ids(city)).not.toContain('e_he1');
  });
  it('nächstes Jahr beginnt das Event neu, die Deko bleibt freigeschaltet', () => {
    const { city, clock } = setup();
    city.s.quests.e_he1!.c[0] = 30;
    city.refreshQuests();
    expect(city.claimQuest('e_he1').ok).toBe(true);
    city.s.unlocks = ['laternenbogen'];
    clock.set(new Date(2027, 0, 10).getTime()); // Winter: Herbst-Fortschritt verfällt
    city.refreshQuests();
    expect(city.s.quests.e_he1).toBeUndefined();
    expect(ids(city)).toContain('e_wi1');
    clock.set(new Date(2027, 9, 10).getTime()); // Herbst im Folgejahr
    city.refreshQuests();
    expect(ids(city)).toContain('e_he1');
    expect(city.s.quests.e_he1!.c[0]).toBe(0);
    expect(city.s.unlocks).toContain('laternenbogen');
  });
});

describe('Alles einsammeln', () => {
  it('kassiert Miete aller fertigen Häuser auf einmal', () => {
    const { city } = setup();
    const before = city.s.coins;
    const n = city.collectable().length;
    expect(n).toBeGreaterThanOrEqual(2); // zwei Starthäuser
    const r = city.collectAll();
    expect(r.n).toBe(n);
    expect(city.s.coins).toBeGreaterThan(before);
    expect(city.collectable().length).toBe(0);
  });
  it('hält im Nostalgie-Modus bei leerer Energie an', () => {
    const { city } = setup('nostalgic');
    city.s.energy = 1;
    city.s.energyAt = Date.now() + 1e12; // keine Aufladung im Test
    const r = city.collectAll();
    expect(r.n).toBe(1);
    expect(r.msg).toMatch(/Energie/);
    expect(city.collectable().length).toBeGreaterThanOrEqual(1);
  });
});
