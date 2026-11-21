/* Dein Zuhause ausbauen: Möbel und Deko kaufen (sichtbar in der Wohnung, viele davon benutzbar), Boden und Lichtstimmung
   wählen und durch die Tür „Anbau“ neue Räume dazubauen – Partykeller, Wellness-Oase, Ankleide mit Fotostudio und
   Dachgarten, je drei Ausbaustufen. Spielstand in s.flags unter h_…; das Aussehen bauen HomeScene.ts und InteriorScene.ts. */
import type { SaveData } from '../engine/Save';
import type { Item, Spot, Theme } from './interiors';
import { pcEvents } from './hooks';

type Need = 'energy' | 'hunger' | 'hygiene' | 'social' | 'fun';
export interface HomeItem { id: string; name: string; icon: string; cost: number; text: string; use?: { label: string; min: number; d: Partial<Record<Need, number>>; msg: string; x: number; z: number } }
export const HOME_ITEMS: HomeItem[] = [
  { id: 'himmelbett', name: 'Himmelbett', icon: '🛏️', cost: 650, text: 'Vier Pfosten, rosa Baldachin. Du wachst mit besserer Laune auf (+10 Spaß nach dem Schlafen).' },
  { id: 'musik', name: 'Musikanlage', icon: '🔊', cost: 480, text: 'Zwei Lautsprechertürme neben dem Fernseher.', use: { label: '🎶 Musik aufdrehen', min: 30, d: { fun: 18, energy: 4 }, msg: 'Diva-Hymnen in voller Lautstärke. Die Nachbarn klopfen im Takt mit. Spaß +18', x: 2.3, z: .5 } },
  { id: 'hausbar', name: 'Hausbar', icon: '🍸', cost: 720, text: 'Eine kleine Bar mit Flaschen und Lichtleiste.', use: { label: '🍸 Cocktail mixen', min: 20, d: { fun: 12, social: 4, energy: -2 }, msg: 'Ein „Pride Sour“ nach eigenem Rezept. Spaß +12', x: -3.35, z: 1.2 } },
  { id: 'hantel', name: 'Hantelbank', icon: '🏋️', cost: 380, text: 'Für den Pump vor der Party.', use: { label: '🏋️ Trainieren', min: 40, d: { fun: 8, energy: -12, hygiene: -10 }, msg: 'Drei Sätze, viel Schweiß, sehr zufrieden. Spaß +8', x: -2.6, z: .45 } },
  { id: 'aquarium', name: 'Aquarium', icon: '🐠', cost: 900, text: 'Leuchtende Fische in allen Regenbogenfarben.', use: { label: '🐠 Fische beobachten', min: 15, d: { fun: 8, energy: 6 }, msg: 'Die Fische schwimmen im Kreis. Sehr beruhigend. Energie +6', x: -2.4, z: 2.3 } },
  { id: 'flaggen', name: 'Flaggenwand', icon: '🏳️‍🌈', cost: 260, text: 'Sechs echte Pride-Flaggen: Regenbogen, Progress, Trans, Bi, Lesbisch, Nichtbinär.', use: { label: '🏳️‍🌈 Flaggen ansehen', min: 5, d: { fun: 4 }, msg: '', x: -1.3, z: 2.5 } },
  { id: 'neon', name: 'Neon „LOVE IS LOVE“', icon: '💡', cost: 320, text: 'Pinke Leuchtschrift über der Küche.' },
  { id: 'disco', name: 'Discokugel', icon: '🪩', cost: 280, text: 'Dreht sich an der Decke, immer.' },
];
/** Woher die Flaggen kommen (echte Geschichte) */
export const FLAG_FACTS = [
  'Regenbogenflagge: Gilbert Baker entwarf sie 1978 für den Pride in San Francisco.',
  'Progress-Flagge: Daniel Quasar ergänzte 2018 den Regenbogen um Schwarz und Braun für queere People of Color und um die Farben der Trans-Flagge.',
  'Trans-Flagge: Hellblau, Rosa und Weiß, 1999 von Monica Helms entworfen.',
  'Bi-Flagge: Pink, Lila und Blau, 1998 von Michael Page.',
  'Lesbische Flagge: die Sonnenuntergangs-Variante in Orange, Weiß und Pink ist seit 2018 verbreitet.',
  'Nichtbinäre Flagge: Gelb, Weiß, Lila und Schwarz, 2014 von Kye Rowan.',
];
export const FLOORS = [
  { id: 'dielen', name: 'Holzdielen', cost: 0 },
  { id: 'marmor', name: 'Marmor', cost: 900 },
  { id: 'regenbogen', name: 'Regenbogen-Parkett', cost: 1200 },
  { id: 'teppich', name: 'Flauschteppich Lila', cost: 600 },
];
export const LIGHTS = [
  { id: 'warm', name: 'Warmweiß', c: 0xffb070, cost: 0 },
  { id: 'pink', name: 'Rosa', c: 0xff6ad5, cost: 120 },
  { id: 'blau', name: 'Mitternachtsblau', c: 0x7f9cff, cost: 120 },
  { id: 'lila', name: 'Lila', c: 0xb56bff, cost: 120 },
];

/* ---------- Anbau: neue Räume hinter der Tür „Anbau“ ---------- */
export interface Room { id: string; name: string; icon: string; costs: number[]; text: string; lv: string[] }
export const ROOMS: Room[] = [
  { id: 'party', name: 'Partykeller', icon: '🪩', costs: [1800, 2600, 3800], text: 'Tanzfläche, Bar und eigene Hauspartys', lv: ['Tanzfläche und Bar', 'DJ-Pult und Karaoke', 'Neon, Lounge und Leinwand'] },
  { id: 'wellness', name: 'Wellness-Oase', icon: '🧖', costs: [1500, 2400, 3400], text: 'Whirlpool, Sauna und Massage', lv: ['Whirlpool', 'Sauna aus Zirbenholz', 'Massageliege und Pflanzen'] },
  { id: 'ankleide', name: 'Ankleide und Fotostudio', icon: '👗', costs: [1200, 2000, 3000], text: 'Kleiderstangen, Spiegel, Fotowand, Laufsteg', lv: ['Kleiderstangen und Spiegel', 'Fotowand mit Licht', 'Eigener Laufsteg'] },
  { id: 'dachgarten', name: 'Dachgarten', icon: '🌇', costs: [2000, 2800, 4200], text: 'Lounge über den Dächern mit Blick auf die Skyline', lv: ['Lounge und Pflanzen', 'Grill und Feuerschale', 'Hot Tub und Lichterketten'] },
];

const has = (s: SaveData, id: string) => !!s.flags['h_' + id];
export const ownsItem = has;
export const floorOf = (s: SaveData) => FLOORS.find((f) => f.id === s.flags.h_floor) || FLOORS[0];
export const lightOf = (s: SaveData) => LIGHTS.find((f) => f.id === s.flags.h_light) || LIGHTS[0];
const list = (s: SaveData, k: string) => String(s.flags[k] || '').split(',').filter(Boolean);
export const ownsStyle = (s: SaveData, kind: 'floor' | 'light', id: string) => id === (kind === 'floor' ? 'dielen' : 'warm') || list(s, `h_${kind}s`).includes(id);
export const roomLevel = (s: SaveData, id: string) => Math.max(0, Math.min(3, Number(s.flags['h_room_' + id]) || 0));
export const anyRoom = (s: SaveData) => ROOMS.some((r) => roomLevel(s, r.id) > 0);

export function buyItem(s: SaveData, id: string): string | null {
  const it = HOME_ITEMS.find((x) => x.id === id); if (!it) return 'Gibt es nicht.';
  if (has(s, id)) return 'Steht schon in deiner Wohnung.';
  if (s.money < it.cost) return `Dafür fehlen dir ${it.cost - s.money} €.`;
  s.money -= it.cost; s.flags['h_' + id] = s.day;
  pcEvents.emit('hausAusbau', { kind: 'item', id, level: 1 });
  return null;
}
/** Boden oder Licht wählen; noch nicht gekauft = kaufen */
export function setStyle(s: SaveData, kind: 'floor' | 'light', id: string): string | null {
  const opts = kind === 'floor' ? FLOORS : LIGHTS, o = opts.find((x) => x.id === id); if (!o) return 'Gibt es nicht.';
  if (!ownsStyle(s, kind, id)) {
    if (s.money < o.cost) return `Dafür fehlen dir ${o.cost - s.money} €.`;
    s.money -= o.cost; s.flags[`h_${kind}s`] = [...list(s, `h_${kind}s`), id].join(',');
  }
  s.flags['h_' + kind] = id;
  pcEvents.emit('hausAusbau', { kind: 'style', id, level: 1 });
  return null;
}
export function buildRoom(s: SaveData, id: string): string | null {
  const r = ROOMS.find((x) => x.id === id); if (!r) return 'Gibt es nicht.';
  const l = roomLevel(s, id); if (l >= 3) return 'Voll ausgebaut.';
  const c = r.costs[l]; if (s.money < c) return `Dafür fehlen dir ${c - s.money} €.`;
  s.money -= c; s.flags['h_room_' + id] = l + 1; s.rep += 1;
  pcEvents.emit('hausAusbau', { kind: 'room', id, level: l + 1 });
  return null;
}
/** Wert des Zuhauses (für Anzeige) */
export const homeValue = (s: SaveData) => HOME_ITEMS.filter((i) => has(s, i.id)).reduce((n, i) => n + i.cost, 0) + ROOMS.reduce((n, r) => n + r.costs.slice(0, roomLevel(s, r.id)).reduce((a, b) => a + b, 0), 0);

/* ---------- Räume als Innenraum (InteriorScene, eigener Raum ohne Fremde) ---------- */
const dance = (c1: number, c2: number, n = 16): Item[] => Array.from({ length: n }, (_, i) => ({ box: [1.4, .06, 1.4], c: i % 2 ? c1 : c2, x: -2.8 + (i % 4) * 1.4, z: -1 + Math.floor(i / 4) * 1.4, e: .6 } as Item));
const doIt = (id: string, label: string, x: number, z: number, min: number, d: Partial<Record<Need, number>>, msg: string, cost = 0, sfx?: string): Spot => ({ id, label, x, z, r: 1.7, act: { k: 'do', min, d, msg, cost, sfx } });
export function roomTheme(id: string, lv: number): Theme {
  const L = (n: number, ...a: Item[]) => (lv >= n ? a : []);
  const S = (n: number, ...a: Spot[]) => (lv >= n ? a : []);
  if (id === 'party') return { id: 'h_party', title: 'Dein Partykeller', icon: '🪩', floor: 0x16101f, wall: 0x2a1a3a, light: 0xff6ad5, music: 'club', own: true,
    items: [...dance(0xff3bd1, 0x3be8ff), { box: [.9, 1.1, 4], c: 0x3a1a4a, x: 4.9, z: -.8, col: true }, { box: [1.1, .08, 4.2], c: 0xffc83d, x: 4.9, z: -.8, y: 1.12, e: .15 },
      ...L(2, { box: [2.6, 1.1, .8], c: 0x2a1650, x: -.7, z: -3.7, col: true, e: .3 }, { neon: '🎧 DJ', c: '#5ce1ff', x: -.7, z: -4.38, y: 2.4, w: 1.6 }),
      ...L(3, { screen: [4, 2], c: 0x7b5cff, x: 3, z: -4.38, y: 2.1 }, { m: 'home/couch_pillows', x: -4.4, z: 2.8, r: Math.PI, col: true }, { box: [.08, 2.6, .08], c: 0xff3bd1, x: -5.8, z: -2, y: .2, e: 1.2 }, { box: [.08, 2.6, .08], c: 0x3be8ff, x: -5.8, z: 0, y: .2, e: 1.2 }),
      { neon: 'PARTYKELLER', c: '#ff6ad5', x: -3.6, z: -4.38, y: 3.1, w: 3.6 }],
    spots: [doIt('feier', '🎉 Hausparty schmeißen (60 €)', 3.8, -.8, 180, { social: 40, fun: 30, energy: -25 }, 'Die halbe Szene tanzt in deinem Keller. Kontakte +40, Spaß +30', 60, 'cheer'),
      { id: 'dance', label: '🪩 Tanzen', x: -.7, z: 1, r: 1.8, act: { k: 'dance' } },
      ...S(2, { id: 'gl_kara', label: '🎤 Karaoke', x: -3.6, z: -2.6, r: 1.6, act: { k: 'gl', id: 'kara' } }),
      ...S(3, doIt('lounge', '🛋️ In der Lounge chillen', -4.4, 1.6, 30, { energy: 10, fun: 8 }, 'Musikvideos auf der Leinwand, Füße hoch. Energie +10'))] };
  if (id === 'wellness') return { id: 'h_wellness', title: 'Deine Wellness-Oase', icon: '🧖', floor: 0xe6f2ec, wall: 0xffffff, light: 0xbfe8ff, own: true,
    items: [{ box: [2.6, .7, 2.6], c: 0xe8f4ff, x: -3.2, z: -2.4, col: true }, { box: [2.2, .06, 2.2], c: 0x2f8fd0, x: -3.2, z: -2.4, y: .68, e: .5 },
      ...L(2, { box: [2.6, 2.3, 2.1], c: 0xc8925e, x: 3, z: -3.2, col: true }, { neon: 'SAUNA', c: '#ffb36b', x: 3, z: -2.1, y: 2.5, w: 1.6 }),
      ...L(3, { box: [.8, .7, 2], c: 0xffffff, x: -.2, z: 2.2, col: true }, { m: 'home/cactus_medium_A', x: -5.2, z: 3.4 }, { m: 'home/cactus_medium_B', x: -5.2, z: .6 }, { neon: '🌿 SPA', c: '#3ee69a', x: 0, z: -4.38, y: 3, w: 2 })],
    spots: [doIt('pool', '🛁 In den Whirlpool', -3.2, -.6, 40, { hygiene: 100, fun: 16, energy: 8 }, 'Sprudel bis zum Kinn. Hygiene voll, Spaß +16', 0, 'shower'),
      ...S(2, doIt('sauna', '🧖 Saunagang', 3, -1.4, 45, { hygiene: 60, energy: 18, fun: 6 }, 'Drei Aufgüsse mit Zitronengras. Energie +18')),
      ...S(3, doIt('massage', '💆 Massage', -.2, .7, 50, { energy: 30, fun: 12 }, 'Jemand aus dem Freundeskreis hat goldene Hände. Energie +30'))] };
  if (id === 'ankleide') return { id: 'h_ankleide', title: 'Deine Ankleide', icon: '👗', floor: 0xf4d6e6, wall: 0xfff6fb, light: 0xffc0e8, own: true,
    items: [{ box: [4.2, 1.9, .6], c: 0xff6ad5, x: -2.6, z: -3.9, col: true }, { box: [.6, 1.9, 3.2], c: 0x7b5cff, x: -5.6, z: -.6, col: true }, { screen: [1.2, 2.2], c: 0xdde8ff, x: 1.6, z: -4.38, y: 1.3 },
      ...L(2, { neon: '📸 STRIKE A POSE', c: '#ff6ad5', x: 3.8, z: -4.38, y: 2.6, w: 3.2 }, { box: [3, .05, 1.4], c: 0xffffff, x: 3.8, z: -3.4, e: .6 }),
      ...L(3, { box: [1.4, .2, 6], c: 0xff2f7a, x: 0, z: .6, e: .3 }, { neon: 'RUNWAY', c: '#ffd23b', x: 0, z: -4.38, y: 3.1, w: 2.4 })],
    spots: [{ id: 'wardrobe', label: '👗 Outfit und Figur ändern', x: -2.6, z: -2.9, r: 1.6, act: { k: 'annex', room: 'wardrobe' } },
      ...S(2, doIt('foto', '📸 Fotoshooting', 3.8, -2.4, 30, { fun: 14, social: 6 }, 'Ringlicht an, Kinn runter, Blick rauf. Das neue Profilbild sitzt. Spaß +14')),
      ...S(3, doIt('walk', '💃 Über den Laufsteg', 0, 2.6, 15, { fun: 16 }, 'Kategorie: Wohnzimmer-Realness. Zehn von zehn. Spaß +16', 0, 'cheer'))] };
  return { id: 'h_dach', title: 'Dein Dachgarten', icon: '🌇', floor: 0xb8875a, wall: 0xdfe8f0, light: 0xffd9a0, own: true,
    items: [{ view: [10.6, 2.5], x: 0, z: -4.38, y: 2.1 }, { m: 'home/couch_pillows', x: -2.6, z: 2.6, r: Math.PI, col: true }, { m: 'home/table_low', x: -2.6, z: 1.4, col: true }, { m: 'home/cactus_medium_A', x: -5.2, z: -3.4 }, { m: 'home/cactus_medium_B', x: 2, z: -3.6 },
      ...L(2, { box: [1.2, .9, .7], c: 0x2a2a30, x: 3.6, z: -2.6, col: true }, { box: [.9, .35, .9], c: 0xff7a2a, x: 0, z: 0, e: .9, col: true }),
      ...L(3, { box: [2.4, .7, 2.4], c: 0x8a5a35, x: -3.8, z: -1.6, col: true }, { box: [2, .06, 2], c: 0x2f8fd0, x: -3.8, z: -1.6, y: .68, e: .5 })],
    spots: [doIt('chill', '🌇 Über die Stadt schauen', -2.6, .4, 30, { fun: 12, energy: 8 }, 'Die Regenbogenbrücke leuchtet, unten rattert die Hochbahn. Spaß +12'),
      ...S(2, doIt('grill', '🔥 Grillen mit Freund*innen (20 €)', 3.6, -1.6, 60, { hunger: 60, social: 25, fun: 10 }, 'Halloumi, Maiskolben und Klatsch. Hunger +60, Kontakte +25', 20)),
      ...S(3, doIt('tub', '🛁 Hot Tub unter den Sternen', -3.8, .1, 40, { hygiene: 80, fun: 18, energy: 8 }, 'Dampf, Sterne, Skyline. Spaß +18', 0, 'shower'))] };
}
