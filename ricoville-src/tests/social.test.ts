import { describe, expect, it } from 'vitest';
import { City, GIFT_AMOUNT, NEIGHBOR_HELPS, newCityState, utcDay } from '../src/core/city';
import { helpable, LAYOUT_MAX, msgId, toPublic, validMsg, visitState, type PublicCity } from '../src/social/codec';

const T0 = Date.UTC(2026, 9, 16, 12, 0, 0);

function setup(mode: 'relaxed' | 'creative' = 'relaxed') {
  let t = T0;
  const city = new City(newCityState('Testdorf', mode, T0), () => t);
  return { city, advance: (s: number) => (t += s * 1000) };
}
const pub = (o: Partial<PublicCity> = {}): PublicCity => ({ uid: 'bob', name: 'Bobhausen', crest: '🦊', slogan: '', level: 4, pop: 30, t: T0, layout: '{"b":[],"r":"","s":""}', ...o });

describe('Nachbarn: Regeln im Spiel', () => {
  it('UTC-Tag wie in den Firestore-Regeln', () => {
    expect(utcDay(Date.UTC(2026, 0, 5, 23, 59))).toBe(20260105);
    expect(utcDay(Date.UTC(2026, 11, 31, 0, 0))).toBe(20261231);
  });

  it(`höchstens ${NEIGHBOR_HELPS}× helfen je Nachbar und Tag, jedes Gebäude einmal`, () => {
    const { city, advance } = setup();
    const coins = city.s.coins;
    expect(city.helpNeighbor('bob', 1).ok).toBe(true);
    expect(city.helpNeighbor('bob', 1).ok).toBe(false);
    for (let u = 2; u <= NEIGHBOR_HELPS; u++) expect(city.helpNeighbor('bob', u).ok).toBe(true);
    expect(city.helpNeighbor('bob', 99).ok).toBe(false);
    expect(city.helpsLeft('bob')).toBe(0);
    expect(city.helpsLeft('carl')).toBe(NEIGHBOR_HELPS);
    expect(city.s.coins).toBeGreaterThan(coins);
    advance(24 * 3600);
    expect(city.helpsLeft('bob')).toBe(NEIGHBOR_HELPS);
    expect(city.helpedToday('bob', 1)).toBe(false);
  });

  it('ein Geschenk je Nachbar und Tag', () => {
    const { city, advance } = setup();
    expect(city.canGift('bob')).toBe(true);
    city.markGifted('bob');
    expect(city.canGift('bob')).toBe(false);
    expect(city.canGift('carl')).toBe(true);
    advance(24 * 3600);
    expect(city.canGift('bob')).toBe(true);
  });

  it('Besuch und Geschenk empfangen: feste kleine Werte, nur erlaubte Waren, Lagergrenze', () => {
    const { city } = setup();
    const c0 = city.s.coins;
    city.receiveVisit(999);
    expect(city.s.coins - c0).toBe(15 * NEIGHBOR_HELPS);
    expect(city.receiveGift('ziegel').ok).toBe(true);
    expect(city.item('ziegel')).toBe(GIFT_AMOUNT);
    expect(city.receiveGift('gold').ok).toBe(false);
    city.s.inv.weizen = 1000;
    expect(city.receiveGift('glas').ok).toBe(false);
    expect(city.item('glas')).toBe(0);
  });

  it('Kreativ-Sandkasten hat keine Nachbarn', () => {
    const { city } = setup('creative');
    expect(city.helpNeighbor('bob', 1).ok).toBe(false);
    expect(city.canGift('bob')).toBe(false);
    expect(city.receiveGift('ziegel').ok).toBe(false);
  });
});

describe('Nachbarn: öffentliche Kurzansicht', () => {
  it('enthält keine Münzen, kein Lager, keine Aufgaben', () => {
    const s = newCityState('Sonnental', 'relaxed', T0);
    s.coins = 123456;
    const p = toPublic(s, 10, T0);
    expect(JSON.stringify(p)).not.toContain('123456');
    expect(Object.keys(p).sort()).toEqual(['crest', 'layout', 'level', 'name', 'pop', 'slogan', 't']);
    expect(p.layout.length).toBeLessThanOrEqual(LAYOUT_MAX);
  });

  it('bleibt auch bei riesigen Städten unter der Größengrenze', () => {
    const s = newCityState('Groß', 'relaxed', T0);
    for (let i = 0; i < 6000; i++) s.buildings.push({ uid: 1000 + i, def: 'eiche', x: i % 48, y: Math.floor(i / 48) % 48, rot: 0, state: 'done', readyAt: 0 });
    expect(toPublic(s, 0, T0).layout.length).toBeLessThanOrEqual(LAYOUT_MAX);
  });

  it('Hin und zurück: Gebäude und Straßen kommen an', () => {
    const s = newCityState('Sonnental', 'relaxed', T0);
    const v = visitState({ uid: 'x', ...toPublic(s, 10, T0) }, T0);
    expect(v.buildings.map((b) => b.def).sort()).toEqual(s.buildings.map((b) => b.def).sort());
    expect(new Set(v.roads)).toEqual(new Set(s.roads));
    expect(v.name).toBe('Sonnental');
  });

  it('fremde Daten werden geprüft: Unbekanntes, Kaputtes und Überlappendes fällt weg', () => {
    const layout = JSON.stringify({
      b: [['rathaus', 22, 22, 0, 1], ['gibtsnicht', 1, 1, 0, 1], ['haus_rot', 99, 1, 0, 1], ['haus_rot', 22, 22, 0, 1], ['haus_rot', 5, 5, 7, 1], ['haus_rot', 30, 30, 1, 0], 'quatsch'],
      r: '1,1;999,2;a,b;3,3',
      s: '2,2;9,9',
    });
    const v = visitState(pub({ layout, name: '<img src=x onerror=alert(1)>Bob' }), T0);
    expect(v.buildings.map((b) => b.def)).toEqual(['rathaus', 'haus_rot']);
    expect(v.buildings[1]!.state).toBe('building');
    expect(v.roads).toEqual(['1,1', '3,3']);
    expect(v.sectors).toEqual(['2,2']);
    expect(v.name).not.toContain('<');
    expect(visitState(pub({ layout: 'kein json' }), T0).buildings).toEqual([]);
  });

  it('helfen geht an Häusern, Läden, Feldern und Betrieben, nicht an Deko', () => {
    expect(helpable('haus_rot')).toBe(true);
    expect(helpable('acker')).toBe(true);
    expect(helpable('eiche')).toBe(false);
    expect(helpable('rathaus')).toBe(false);
  });
});

describe('Nachbarn: Post prüfen', () => {
  const day = utcDay(T0);
  const m = (o: Record<string, unknown>) => ({ id: msgId('anna', day, 'gift'), from: 'anna', name: 'Anna', type: 'gift', day, item: 'ziegel', done: false, ...o });
  it('nimmt nur gültige Nachrichten an', () => {
    expect(validMsg(m({}), T0)).toBe(true);
    expect(validMsg(m({ item: 'gold' }), T0)).toBe(false);
    expect(validMsg(m({ id: 'falsch' }), T0)).toBe(false);
    expect(validMsg(m({ day: day + 1, id: msgId('anna', day + 1, 'gift') }), T0)).toBe(false);
    expect(validMsg(m({ type: 'visit', id: msgId('anna', day, 'visit'), n: 3 }), T0)).toBe(true);
    expect(validMsg(m({ type: 'visit', id: msgId('anna', day, 'visit'), n: 9 }), T0)).toBe(false);
    expect(validMsg(m({ type: 'coins', id: msgId('anna', day, 'gift') }), T0)).toBe(false);
  });
});
