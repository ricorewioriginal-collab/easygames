import { describe, expect, it } from 'vitest';
import { BUILDING, BUILDINGS } from '../src/catalogs/buildings';
import { CROPS, ITEM, ITEMS, ORDERS, RECIPES } from '../src/catalogs/items';
import { ACHIEVEMENTS, QUESTS } from '../src/catalogs/quests';
import { City, ENERGY_REGEN_S, isWater, maxEnergy, newCityState, sectorCost, xpToNext } from '../src/core/city';
import type { CityState, Mode } from '../src/core/types';

const T0 = new Date(2026, 9, 16, 12, 0, 0).getTime();

function setup(mode: Mode = 'relaxed', patch: Partial<CityState> = {}) {
  let t = T0;
  const clock = { advance: (s: number) => (t += s * 1000), set: (v: number) => (t = v) };
  const city = new City({ ...newCityState('Testdorf', mode, T0), ...patch }, () => t);
  return { city, clock };
}
/** Fertigt alle laufenden Bauten fertig. */
function finish(city: City, clock: { advance: (s: number) => number }) {
  clock.advance(3 * 3600);
  city.update();
}

describe('Kataloge', () => {
  it('erfüllen den Mindestumfang', () => {
    const cat = (c: string) => BUILDINGS.filter((b) => b.cat === c).length;
    expect(cat('residential')).toBeGreaterThanOrEqual(30);
    expect(cat('business')).toBeGreaterThanOrEqual(15);
    expect(cat('community')).toBeGreaterThanOrEqual(15);
    expect(cat('decoration')).toBeGreaterThanOrEqual(50);
    expect(CROPS.length).toBeGreaterThanOrEqual(12);
    expect(ITEMS.filter((i) => i.kind === 'good').length).toBeGreaterThanOrEqual(8);
    expect(new Set(ORDERS.map((o) => o.station)).size).toBe(3);
    expect(QUESTS.length).toBeGreaterThanOrEqual(50);
  });
  it('sind in sich stimmig (IDs eindeutig, Verweise gültig)', () => {
    expect(new Set(BUILDINGS.map((b) => b.id)).size).toBe(BUILDINGS.length);
    expect(new Set(QUESTS.map((q) => q.id)).size).toBe(QUESTS.length);
    for (const b of BUILDINGS) {
      for (const a of b.accepts ?? []) expect(ITEM.has(a), `${b.id} akzeptiert ${a}`).toBe(true);
      for (const m of Object.keys(b.materials ?? {})) expect(ITEM.has(m), `${b.id} Material ${m}`).toBe(true);
      for (const r of b.recipes ?? []) expect(RECIPES.some((x) => x.id === r), `${b.id} Rezept ${r}`).toBe(true);
    }
    for (const r of RECIPES) {
      expect(ITEM.has(r.output)).toBe(true);
      for (const i of Object.keys(r.inputs)) expect(ITEM.has(i), `${r.id} Zutat ${i}`).toBe(true);
    }
    for (const o of ORDERS) for (const i of Object.keys({ ...o.give, ...o.get })) expect(ITEM.has(i)).toBe(true);
    const ids = new Set(QUESTS.map((q) => q.id));
    for (const q of QUESTS) {
      for (const a of q.after ?? []) expect(ids.has(a)).toBe(true);
      for (const g of q.goals) {
        if ('own' in g) expect(BUILDING.has(g.own), `${q.id} -> ${g.own}`).toBe(true);
        if ('ev' in g && g.ev === 'build' && g.id) expect(BUILDING.has(g.id)).toBe(true);
      }
    }
    for (const a of ACHIEVEMENTS) expect(a.n).toBeGreaterThan(0);
  });
  it('jede Ware im Geschäft ist irgendwie beschaffbar', () => {
    const sources = new Set<string>([...CROPS.map((c) => c.id), ...RECIPES.map((r) => r.output)]);
    for (const o of ORDERS) for (const k of Object.keys(o.get ?? {})) sources.add(k);
    for (const b of BUILDINGS) for (const a of b.accepts ?? []) expect(sources.has(a), a).toBe(true);
  });
});

describe('Bauen und Platzieren', () => {
  it('verhindert Überlappung, Wasser, gesperrte Gebiete und fehlende Straßen', () => {
    const { city } = setup();
    expect(city.canPlace('haus_gelb', 18, 26, 0).msg).toMatch(/belegt/);
    expect(city.canPlace('haus_gelb', 2, 20, 0).msg).toMatch(/erschlossen/);
    expect(city.canPlace('haus_gelb', 28, 18, 0).msg).toMatch(/Straße/);
    expect(city.canPlace('haus_gelb', 16, 25, 0).msg).toMatch(/Straße|belegt/);
    expect(city.canPlace('haus_gelb', 28, 26, 0).msg).toMatch(/level 2/i);
    expect(city.canPlace('haus_rot', 28, 26, 0).ok).toBe(true);
    expect(isWater(1, 10)).toBe(true);
  });
  it('platziert, zieht Kosten ab und blockiert dieselben Felder danach', () => {
    const { city } = setup();
    const coins = city.s.coins;
    const r = city.place('haus_rot', 28, 26, 0);
    expect(r.ok).toBe(true);
    expect(city.s.coins).toBe(coins - BUILDING.get('haus_rot')!.cost);
    expect(city.canPlace('gartenhaus', 29, 27, 0).ok).toBe(false);
  });
  it('dreht rechteckige Gebäude mit getauschter Grundfläche', () => {
    const { city } = setup('creative');
    city.s.roads.push('20,14');
    // Bahnhof 4×3: gedreht 3×4
    expect(city.canPlace('bahnhof', 22, 16, 1).ok).toBe(true);
    const r = city.place('bahnhof', 22, 16, 1);
    expect(r.ok).toBe(true);
    expect(city.at(24, 19)?.def).toBe('bahnhof');
    expect(city.at(25, 16)).toBeUndefined();
  });
  it('versetzt, dreht und reißt ab mit 50 % Erstattung', () => {
    const { city } = setup();
    const uid = city.place('haus_rot', 28, 26, 0).uid!;
    expect(city.move(uid, 29, 26, 1).ok).toBe(true);
    expect(city.at(28, 26)).toBeUndefined();
    const before = city.s.coins;
    expect(city.demolish(uid).ok).toBe(true);
    expect(city.s.coins).toBe(before + 90);
    expect(city.demolish(city.s.buildings.find((b) => b.def === 'rathaus')!.uid).ok).toBe(false);
  });
  it('verbindet Straßen und erkennt Straßenanschluss', () => {
    const { city } = setup();
    const house = city.s.buildings.find((b) => b.def === 'haus_rot')!;
    expect(city.hasRoadAccess(house)).toBe(true);
    for (let x = 16; x < 32; x++) city.removeRoad(x, 25);
    expect(city.hasRoadAccess(house)).toBe(false);
    expect(city.status(house).kind).toBe('noroad');
    expect(city.placeRoad(18, 25).ok).toBe(true);
    expect(city.hasRoadAccess(house)).toBe(true);
    expect(city.placeRoad(18, 25).ok).toBe(false);
  });
});

describe('Einwohner und Mieten', () => {
  it('beachtet die Einwohnergrenze und erhöht sie durch Gemeinschaftsgebäude', () => {
    const { city, clock } = setup('relaxed', { coins: 100000, level: 20 });
    expect(city.popCap()).toBe(60);
    for (const x of [16, 18]) city.s.buildings.push({ uid: 900 + x, def: 'mehrfamilien', x, y: 40, rot: 0, state: 'done', readyAt: 0 });
    expect(city.place('haus_rot', 28, 26, 0).ok).toBe(true);
    expect(city.place('haus_rot', 30, 26, 0).ok).toBe(true);
    expect(city.plannedPopulation()).toBe(60);
    expect(city.canPlace('haus_rot', 16, 26, 0).msg).toMatch(/Einwohnergrenze/);
    expect(city.placeRoad(25, 17).ok).toBe(true);
    expect(city.place('schule', 26, 17, 0).ok).toBe(true);
    finish(city, clock);
    expect(city.popCap()).toBe(140);
    expect(city.population()).toBe(city.plannedPopulation());
  });
  it('kassiert Miete genau einmal pro Zyklus', () => {
    const { city, clock } = setup();
    const h = city.s.buildings.find((b) => b.def === 'haus_rot')!;
    const c0 = city.s.coins;
    expect(city.collect(h.uid).ok).toBe(true);
    expect(city.s.coins).toBeGreaterThan(c0);
    const c1 = city.s.coins;
    expect(city.collect(h.uid).ok).toBe(false);
    expect(city.s.coins).toBe(c1);
    clock.advance(BUILDING.get('haus_rot')!.rentTime! / 2);
    expect(city.collect(h.uid).ok).toBe(true);
  });
  it('Miete ist nie geringer als 85 % durch Unzufriedenheit', () => {
    const { city } = setup();
    expect(city.rentFactor()).toBeGreaterThanOrEqual(0.85);
    expect(city.rentFactor()).toBeLessThanOrEqual(1.15);
  });
});

describe('Farm, Produktion, Geschäfte', () => {
  it('säen, wachsen, ernten – ohne Doppelernte', () => {
    const { city, clock } = setup();
    const plot = city.s.buildings.find((b) => b.def === 'acker')!;
    expect(city.plant(plot.uid, 'weizen').ok).toBe(true);
    expect(city.plant(plot.uid, 'weizen').ok).toBe(false);
    expect(city.collect(plot.uid).ok).toBe(false);
    clock.advance(150);
    const before = city.item('weizen');
    expect(city.collect(plot.uid).ok).toBe(true);
    expect(city.item('weizen')).toBe(before + 4);
    expect(city.collect(plot.uid).ok).toBe(false);
    expect(city.item('weizen')).toBe(before + 4);
  });
  it('sperrt Ernte bei vollem Lager und lässt Werte nie negativ werden', () => {
    const { city, clock } = setup('relaxed', { inv: { weizen: 49 } });
    const plot = city.s.buildings.find((b) => b.def === 'acker')!;
    city.plant(plot.uid, 'weizen');
    clock.advance(1000);
    expect(city.collect(plot.uid).msg).toMatch(/Lager/);
    expect(city.status(plot).kind).toBe('harvest');
    for (const v of Object.values(city.s.inv)) expect(v).toBeGreaterThan(0);
  });
  it('Lieferkette Weizen → Mehl → Bäckerei → Münzen', () => {
    const { city, clock } = setup('relaxed', { inv: { weizen: 6 } });
    const mill = city.place('muehle', 26, 17, 0).uid!;
    const bakery = city.place('baeckerei', 28, 26, 0).uid!;
    finish(city, clock);
    expect(city.collect(bakery).msg).toMatch(/Waren/);
    expect(city.startProduction(mill, 'r_mehl').ok).toBe(true);
    expect(city.item('weizen')).toBe(3);
    expect(city.startProduction(mill, 'r_mehl').ok).toBe(false);
    clock.advance(200);
    expect(city.collect(mill).ok).toBe(true);
    expect(city.item('mehl')).toBe(3);
    city.startProduction(mill, 'r_mehl');
    clock.advance(200);
    city.collect(mill);
    expect(city.item('mehl')).toBe(6);
    expect(city.supply(bakery).ok).toBe(true);
    expect(city.item('mehl')).toBe(2);
    expect(city.supply(bakery).ok).toBe(false);
    const coins = city.s.coins;
    expect(city.collect(bakery).ok).toBe(false);
    clock.advance(200);
    expect(city.collect(bakery).ok).toBe(true);
    expect(city.s.coins).toBeGreaterThanOrEqual(coins + 90);
    expect(city.status(city.get(bakery)!).kind).toBe('supply');
  });
  it('startet nur, wenn das Ergebnis danach ins Lager passt', () => {
    const { city, clock } = setup('relaxed', { coins: 20000, level: 30, inv: { mais: 3, weizen: 47 } });
    const fab = city.place('snackfabrik', 26, 17, 0).uid!;
    city.deliver(fab);
    finish(city, clock);
    expect(city.get(fab)!.state).toBe('done');
    expect(city.startProduction(fab, 'r_popcorn').msg).toMatch(/Lager/);
    expect(city.item('mais')).toBe(3);
    city.s.inv.weizen = 46;
    expect(city.startProduction(fab, 'r_popcorn').ok).toBe(true);
  });
  it('Deko erhöht die Einnahmen, höchstens um 50 %', () => {
    const { city } = setup('creative');
    const h = city.s.buildings.find((b) => b.def === 'haus_rot')!;
    const base = city.appeal(h);
    city.place('brunnen', 17, 28, 0);
    expect(city.appeal(h)).toBeGreaterThan(base);
    for (let i = 0; i < 40; i++) city.place('rosen', 16 + (i % 8), 28 + Math.floor(i / 8), 0);
    expect(city.appeal(h)).toBe(0.5);
  });
});

describe('Zeit und Energie', () => {
  it('regeneriert Energie im Nostalgie-Modus und begrenzt sie', () => {
    const { city, clock } = setup('nostalgic');
    city.s.energy = 0;
    city.s.energyAt = T0;
    const h = city.s.buildings.find((b) => b.def === 'haus_rot')!;
    expect(city.collect(h.uid).msg).toMatch(/Energie/);
    clock.advance(ENERGY_REGEN_S * 2 + 5);
    city.regen();
    expect(city.s.energy).toBe(2);
    clock.advance(ENERGY_REGEN_S * 1000);
    city.regen();
    expect(city.s.energy).toBe(maxEnergy(1));
  });
  it('Entspannt braucht keine Energie und halbiert Zeiten', () => {
    const { city } = setup('relaxed');
    city.s.energy = 0;
    expect(city.dur(100)).toBe(50000);
    const plot = city.s.buildings.find((b) => b.def === 'acker')!;
    expect(city.plant(plot.uid, 'erdbeere').ok).toBe(true);
  });
  it('wertet Offline-Zeit korrekt aus und ignoriert zurückgestellte Uhren', () => {
    const { city, clock } = setup('nostalgic');
    const plot = city.s.buildings.find((b) => b.def === 'acker')!;
    city.plant(plot.uid, 'erdbeere');
    clock.advance(3 * 24 * 3600); // drei Tage offline
    city.update();
    expect(city.status(plot).kind).toBe('harvest');
    clock.set(T0 - 86400000); // Uhr zurückgestellt
    expect(city.now()).toBeGreaterThanOrEqual(T0 + 3 * 24 * 3600 * 1000);
    expect(city.status(plot).kind).toBe('harvest');
  });
  it('Bauzeiten laufen und Großbauten brauchen Material', () => {
    const { city, clock } = setup('relaxed', { coins: 50000, level: 20 });
    city.s.roads.push('25,17');
    const uid = city.place('bibliothek', 26, 17, 0).uid!;
    expect(city.get(uid)!.state).toBe('site');
    finish(city, clock);
    expect(city.get(uid)!.state).toBe('site');
    expect(city.deliver(uid).ok).toBe(false);
    expect(city.buyMaterial('bretter', 4).ok).toBe(true);
    expect(city.deliver(uid).ok).toBe(true);
    expect(city.get(uid)!.state).toBe('building');
    finish(city, clock);
    expect(city.get(uid)!.state).toBe('done');
    expect(city.item('bretter')).toBe(0);
  });
});

describe('Level, Quests, Erweiterungen', () => {
  it('steigt im Level auf und füllt Energie', () => {
    const { city } = setup('nostalgic');
    city.s.energy = 0;
    city.addXp(xpToNext(1) + 1);
    expect(city.s.level).toBe(2);
    expect(city.s.energy).toBe(maxEnergy(2));
  });
  it('Tutorialquest wird erfüllt und nur einmal belohnt', () => {
    const { city, clock } = setup();
    expect(city.activeQuests()[0]!.id).toBe('m01');
    city.place('gartenhaus', 28, 26, 0);
    finish(city, clock);
    expect(city.s.quests.m01!.done).toBe(true);
    const c = city.s.coins;
    expect(city.claimQuest('m01').ok).toBe(true);
    expect(city.s.coins).toBe(c + 100);
    expect(city.claimQuest('m01').ok).toBe(false);
    expect(city.s.coins).toBe(c + 100);
    expect(city.activeQuests().some((q) => q.id === 'm02')).toBe(true);
  });
  it('erschließt nur angrenzende Gebiete mit Kosten und Einwohnerbedarf', () => {
    const { city } = setup('relaxed', { coins: 5000, level: 20 });
    expect(city.canExpand(0, 0).ok).toBe(false);
    expect(city.canExpand(1, 2).msg).toMatch(/Einwohner/);
    city.s.buildings.push({ uid: 999, def: 'mehrfamilien', x: 28, y: 28, rot: 0, state: 'done', readyAt: 0 });
    const cost = sectorCost(4).coins;
    expect(city.expand(1, 2).ok).toBe(true);
    expect(city.s.coins).toBe(5000 - cost);
    expect(city.isUnlocked(8, 16)).toBe(true);
    expect(sectorCost(5).coins).toBeGreaterThan(cost);
  });
  it('Tagesaufgaben werden täglich neu erzeugt und einmal belohnt', () => {
    const { city, clock } = setup();
    city.update();
    const k = city.s.daily!.key;
    expect(city.s.daily!.tasks.length).toBe(3);
    const t = city.s.daily!.tasks[0]!;
    t.c = t.n;
    expect(city.claimTask(false, 0).ok).toBe(true);
    expect(city.claimTask(false, 0).ok).toBe(false);
    clock.advance(86400);
    city.update();
    expect(city.s.daily!.key).not.toBe(k);
  });
});

describe('Transport', () => {
  it('Zuglieferung: bestellen, warten, abholen, Lager wächst', () => {
    const { city, clock } = setup('relaxed', { coins: 20000, level: 10, inv: { bretter: 6 } });
    city.s.roads.push('20,17');
    const uid = city.place('bahnhof', 22, 16, 1).uid!;
    city.deliver(uid);
    finish(city, clock);
    expect(city.get(uid)!.state).toBe('done');
    expect(city.startOrder(uid, 'o_fisch').ok).toBe(false);
    expect(city.startOrder(uid, 'o_holz').ok).toBe(true);
    expect(city.startOrder(uid, 'o_ziegel').ok).toBe(false);
    clock.advance(400);
    expect(city.collect(uid).ok).toBe(true);
    expect(city.item('holz')).toBe(10);
    expect(city.collect(uid).ok).toBe(false);
  });
  it('ohne Straße keine neuen Aufträge (sonst wäre die Lieferung nicht abholbar)', () => {
    const { city, clock } = setup('relaxed', { coins: 20000, level: 10, inv: { bretter: 6 } });
    city.s.roads.push('20,17');
    const uid = city.place('bahnhof', 22, 16, 1).uid!;
    city.deliver(uid);
    finish(city, clock);
    for (const r of [...city.s.roads]) {
      const [x, y] = r.split(',').map(Number);
      city.removeRoad(x!, y!);
    }
    expect(city.hasRoadAccess(city.get(uid)!)).toBe(false);
    const coins = city.s.coins;
    expect(city.startOrder(uid, 'o_holz').msg).toMatch(/Straße/);
    expect(city.s.coins).toBe(coins);
  });
  it('Hafen muss am Wasser stehen', () => {
    const { city } = setup('creative');
    city.s.sectors.push('0,2');
    expect(city.canPlace('hafen', 26, 17, 0).msg).toMatch(/Wasser/);
    expect(city.canPlace('hafen', 4, 19, 0).ok).toBe(true);
  });
});
