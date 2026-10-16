import { describe, expect, it } from 'vitest';
import { City, newCityState } from '../src/core/city';
import { migrate, parse, SaveManager, saveKey, serialize, type KV } from '../src/core/save';

function memKV(): KV & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return { data, get: (k) => data.get(k) ?? null, set: (k, v) => void data.set(k, v) };
}
const T = 1_800_000_000_000;

describe('Speichern und Laden', () => {
  it('speichert und lädt die Stadt exakt', () => {
    const kv = memKV();
    const city = new City(newCityState('Speicherstadt', 'relaxed', T), () => T);
    city.place('haus_rot', 28, 26, 0);
    city.placeRoad(30, 24);
    const plot = city.s.buildings.find((b) => b.def === 'acker')!;
    city.plant(plot.uid, 'weizen');
    const sm = new SaveManager(kv, 'main');
    expect(sm.save(city.s, T).ok).toBe(true);
    const loaded = new SaveManager(kv, 'main').load()!;
    expect(loaded.name).toBe('Speicherstadt');
    expect(loaded.buildings).toEqual(city.s.buildings);
    expect(loaded.roads).toEqual(city.s.roads);
    expect(loaded.coins).toBe(city.s.coins);
    expect(loaded.buildings.find((b) => b.uid === plot.uid)!.job).toBe('weizen');
  });
  it('erkennt manipulierte Daten per Prüfsumme und nutzt die Sicherung', () => {
    const kv = memKV();
    const s = newCityState('A', 'relaxed', T);
    const sm = new SaveManager(kv, 'main');
    sm.save(s, T);
    s.coins = 5;
    sm.save(s, T + 1);
    const raw = kv.data.get(saveKey('main'))!;
    kv.data.set(saveKey('main'), raw.replace('"coins\\":5', '"coins\\":999999'));
    expect(parse(kv.data.get(saveKey('main'))!)).toBeNull();
    const back = new SaveManager(kv, 'main').load()!;
    expect(back.coins).toBe(1200);
  });
  it('überschreibt keinen neueren Stand aus einem anderen Tab', () => {
    const kv = memKV();
    const tabA = new SaveManager(kv, 'main');
    const tabB = new SaveManager(kv, 'main');
    tabA.save(newCityState('X', 'relaxed', T), T);
    const a = tabA.load()!;
    const b = tabB.load()!;
    b.coins = 4444;
    expect(tabB.save(b, T + 10).ok).toBe(true);
    a.coins = 1;
    expect(tabA.save(a, T + 20).msg).toBe('conflict');
    expect(parse(kv.data.get(saveKey('main'))!)!.coins).toBe(4444);
    expect(tabA.adopt()!.coins).toBe(4444);
    a.coins = 7;
    expect(tabA.save(a, T + 30).ok).toBe(true);
  });
  it('Kreativstadt liegt in einem eigenen Speicherplatz', () => {
    const kv = memKV();
    new SaveManager(kv, 'creative').save(newCityState('Sandkasten', 'creative', T), T);
    expect(new SaveManager(kv, 'main').load()).toBeNull();
  });
  it('migriert alte Schemata und entfernt Unbekanntes', () => {
    const s = migrate({ name: 'Alt', items: { weizen: 3, mehl: 0 }, roads: [[1, 2]], buildings: [{ uid: 5, def: 'gibtsnicht', x: 0, y: 0, rot: 0, state: 'done', readyAt: 0 }] });
    expect(s.v).toBe(1);
    expect(s.inv).toEqual({ weizen: 3 });
    expect(s.roads).toEqual(['1,2']);
    expect(s.buildings).toHaveLength(0);
    expect(s.nextUid).toBeGreaterThanOrEqual(1);
    const text = serialize(s);
    expect(parse(text)!.name).toBe('Alt');
  });
});
