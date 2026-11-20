/* Innenräume aller Häuser: jeder Laden und jedes Wohnhaus ist betretbar und eigen eingerichtet.
   Die Orte stammen aus Pride City und aus Gay Life! (Viertel-Orte, Minispiel-Orte, Bewohner). Jede Stelle im Raum hat eine Aktion:
   Ladenmenü, Minispiel (Gay-Life-Original, Tanz-Battle, Drag-Show, Barkeeper), Tätigkeit mit Wirkung auf die Bedürfnisse, Roman lesen. */

export type Act =
  | { k: 'menu' }                                   // bisheriges Ladenmenü des Ortes (alle Angebote bleiben)
  | { k: 'gl'; id: string }                         // Gay-Life-Minispiel (Original)
  | { k: 'dance' } | { k: 'show' } | { k: 'bar' }
  | { k: 'book'; id: 'licht' | 'leuchtfeuer' }
  | { k: 'do'; cost?: number; min: number; d: Partial<Record<'energy' | 'hunger' | 'hygiene' | 'social' | 'fun', number>>; msg: string; sfx?: string; adult?: boolean }
  | { k: 'talk'; who: string; color: string; lines: string[] };

/** Möbel: KayKit-Modell (gltf) oder Platzhalter-Form (box/screen/neon) */
export type Item =
  | { m: string; x: number; z: number; r?: number; s?: number; y?: number; col?: boolean }
  | { box: [number, number, number]; c: number; x: number; z: number; y?: number; col?: boolean; e?: number }
  | { screen: [number, number]; c: number; x: number; z: number; y: number; ry?: number }
  | { neon: string; c: string; x: number; z: number; y: number; ry?: number; w?: number };

export interface Spot { id: string; label: string; x: number; z: number; r?: number; act: Act }
export interface Theme { id: string; title: string; icon: string; floor: number; wall: number; light: number; items: Item[]; spots: Spot[]; music?: 'city' | 'club' | 'show'; adult?: boolean }

const C = { wood: 0x8a5a35, dark: 0x1c1430, white: 0xf2f2f2, steel: 0x9aa3ad, red: 0xd8261e, pink: 0xff4fa3, black: 0x16161c, green: 0x2f8f5a, blue: 0x3a7bff, gold: 0xffc83d };
const menu = (label = '🛎️ Theke'): Spot => ({ id: 'menu', label, x: 0, z: -2.6, r: 2, act: { k: 'menu' } });
const counter: Item[] = [{ box: [4.2, 1.1, .9], c: C.wood, x: 0, z: -3.4, col: true }, { box: [4.4, .08, 1], c: C.white, x: 0, z: -3.4, y: 1.12 }];
const tables = (n: number, z = 1.4, span = 8): Item[] => Array.from({ length: n }, (_, i) => [
  { m: 'home/table_medium', x: -4 + i * (span / Math.max(1, n - 1)), z, s: .75, col: true } as Item,
  { m: 'home/chair_A', x: -4 + i * (span / Math.max(1, n - 1)) - .7, z, r: Math.PI / 2 } as Item,
  { m: 'home/chair_A', x: -4 + i * (span / Math.max(1, n - 1)) + .7, z, r: -Math.PI / 2 } as Item]).flat();
const shelves = (z = -4.1): Item[] => [-4.4, -2.2, 2.2, 4.4].map((x) => ({ m: 'home/shelf_A_big', x, z, col: true } as Item));
const dancefloor = (c1: number, c2: number): Item[] => Array.from({ length: 16 }, (_, i) => ({ box: [1.4, .06, 1.4], c: i % 2 ? c1 : c2, x: -2.1 + (i % 4) * 1.4, z: -.6 + Math.floor(i / 4) * 1.4, e: .6 } as Item));
const gl = (id: string, label: string, x: number, z: number): Spot => ({ id: 'gl_' + id, label, x, z, r: 1.8, act: { k: 'gl', id } });
const doIt = (id: string, label: string, x: number, z: number, a: Omit<Extract<Act, { k: 'do' }>, 'k'>): Spot => ({ id, label, x, z, r: 1.8, act: { k: 'do', ...a } });

/** Läden und Treffpunkte mit eigenem Ladenmenü (Schlüssel = POI-ID) */
export const PLACE_THEMES: Record<string, Theme> = {
  cafe: { id: 'cafe', title: 'Café Kaffeeklatsch', icon: '☕', floor: 0xc7925e, wall: 0xffe9d0, light: 0xffc890,
    items: [...counter, ...tables(3), { m: 'kitchen/kitchencounter_straight_A', x: 3.6, z: -4.1 }, { m: 'home/cactus_medium_A', x: 5.3, z: -1.2 }, { neon: 'KAFFEEKLATSCH', c: '#ffb347', x: 0, z: -4.38, y: 3.1 }],
    spots: [menu('☕ Bestellen'), doIt('coffee', '☕ Kaffee am Tisch', -3, 1.4, { cost: 3, min: 20, d: { energy: 12, social: 6 }, msg: 'Cappuccino mit Herz-Schaum. Energie +12', sfx: 'pour' }), gl('dates', '🎲 Date-Roulette', 3, 1.4)] },
  club: { id: 'club', title: 'Club Prisma', icon: '🪩', floor: 0x120c22, wall: 0x241640, light: 0xb56bff, music: 'club',
    items: [...dancefloor(0xff3b8d, 0x3bd1ff), { box: [3, 1.1, .9], c: 0x2a1650, x: 0, z: -3.6, col: true, e: .3 }, { box: [2.4, 1.1, .8], c: C.dark, x: 4.4, z: 1.6, col: true }, { neon: 'PRISMA', c: '#b56bff', x: 0, z: -4.38, y: 3 }],
    spots: [{ id: 'dance', label: '🪩 Tanz-Battle', x: 0, z: .8, r: 2, act: { k: 'dance' } }, { id: 'menu', label: '🍸 Bar und Club', x: 4.4, z: .6, r: 1.8, act: { k: 'menu' } }, gl('rave', '🌈 Regenbogen-Rave', -4, 1), gl('club', '🎛️ Clubnacht-Manager (DJ-Pult)', 0, -2.6)] },
  center: { id: 'center', title: 'Regenbogenhaus', icon: '🌈', floor: 0xd9c7a6, wall: 0xfff0fb, light: 0xffd6f4,
    items: [{ m: 'home/couch_pillows', x: -3, z: 2.6, r: Math.PI, col: true }, { m: 'home/armchair_pillows', x: -.6, z: 1.6, r: -Math.PI / 2, col: true }, { m: 'home/rug_oval_A', x: -2.4, z: 1.6 }, ...shelves().slice(0, 2), { box: [2.6, 1, .8], c: C.wood, x: 3.4, z: -3.4, col: true }, { neon: 'REGENBOGENHAUS', c: '#ff6ad5', x: 0, z: -4.38, y: 3.1 }],
    spots: [{ id: 'menu', label: '🌈 Info und Angebote', x: 3.4, z: -2.6, r: 2, act: { k: 'menu' } }, doIt('kreis', '💬 Gesprächskreis', -3, 1.4, { min: 60, d: { social: 18, fun: 6 }, msg: 'Eine Stunde reden, lachen, zuhören. Kontakte +18' }), gl('quiz', '❓ Klischee-Quiz', 0, -2)] },
  spaeti: { id: 'spaeti', title: 'Späti Lecker', icon: '🛒', floor: 0xbdbdbd, wall: 0xf4f4f4, light: 0xffffff,
    items: [...shelves(), { m: 'kitchen/fridge_A', x: 5.2, z: -1, r: -Math.PI / 2, col: true }, { m: 'kitchen/fridge_A', x: 5.2, z: .4, r: -Math.PI / 2, col: true }, { box: [2.4, 1.1, .8], c: C.red, x: -3.6, z: 1.8, col: true }],
    spots: [{ id: 'menu', label: '🛒 Kasse', x: -3.6, z: 2.8, r: 1.8, act: { k: 'menu' } }, doIt('drink', '🧃 Kalte Mate aus dem Kühlschrank', 4.2, -.3, { cost: 2, min: 5, d: { energy: 8, fun: 3 }, msg: 'Kalt und klebrig. Energie +8', sfx: 'glass' })] },
  boutique: { id: 'boutique', title: 'Boutique Fabelhaft', icon: '👗', floor: 0xf4d6e6, wall: 0xfff6fb, light: 0xffc0e8,
    items: [...[-4, -1.6, 1.6, 4].map((x, i) => ({ box: [1.8, 1.8, .5], c: [C.pink, 0x9b5cff, 0x5ce1ff, C.gold][i], x, z: -3.9, col: true } as Item)), { box: [1.4, 2.6, .1], c: 0xbfe8ff, x: 5.6, z: 1, e: .2 }, { box: [2.4, 1, .8], c: C.white, x: -3.6, z: 2, col: true }, { neon: 'FABELHAFT', c: '#ff9ad5', x: 0, z: -4.38, y: 3.2 }],
    spots: [{ id: 'menu', label: '👗 Kollektion und Kasse', x: -3.6, z: 3, r: 1.8, act: { k: 'menu' } }, gl('style', '🪞 Outfit-Check am Spiegel', 4.6, 1), gl('match', '✨ Glitzer-Match', 0, -2.6)] },
  gym: { id: 'gym', title: 'Muckibude Muskelkater', icon: '🏋️', floor: 0x3a3a44, wall: 0xdcdce6, light: 0xffffff,
    items: [...[-4, -1.3, 1.4].map((x) => ({ box: [1.2, 1.4, 2], c: C.steel, x, z: -3, col: true } as Item)), { box: [1, 1.2, 2.4], c: C.black, x: 4.4, z: -2.8, col: true }, { box: [3, .1, 2], c: 0x2b6cff, x: -2, z: 2 }, { neon: 'MUCKIBUDE', c: '#ffd23b', x: 0, z: -4.38, y: 3.2 }],
    spots: [gl('gym', '🏋️ Beinetag (Kniebeugen)', -1.3, -1.6), doIt('lauf', '🏃 Laufband', 4.4, -1.2, { min: 30, d: { energy: -14, fun: 8, hygiene: -10 }, msg: '5 km gelaufen. Spaß +8', sfx: 'step' }), { id: 'menu', label: '💳 Theke und Kurse', x: -2, z: 2.6, r: 1.8, act: { k: 'menu' } }] },
  studio: { id: 'studio', title: 'Studio Klappe Auf', icon: '📸', floor: 0x2a2a2a, wall: 0x3a3a3a, light: 0xffffff,
    items: [{ box: [6, 3.4, .1], c: 0x5ce1ff, x: 0, z: -4.2, e: .25 }, { box: [.3, 2.4, .3], c: C.black, x: -3.6, z: 1.6, col: true }, { box: [.3, 2.4, .3], c: C.black, x: 3.6, z: 1.6, col: true }, { screen: [.6, .6], c: 0xffffff, x: -3.6, z: 1.6, y: 2.5 }, { screen: [.6, .6], c: 0xffffff, x: 3.6, z: 1.6, y: 2.5 }, { box: [.5, 1.4, .5], c: C.black, x: 0, z: 2.6, col: true }],
    spots: [gl('cast', '🎬 Casting-Tag', 0, -2.4), { id: 'menu', label: '📸 Fotoshooting und Studio', x: 0, z: 1.6, r: 1.8, act: { k: 'menu' } }] },
  checkpoint: { id: 'checkpoint', title: 'Checkpoint Regenbogen', icon: '🩺', floor: 0xe6f2ec, wall: 0xffffff, light: 0xe6fff2,
    items: [{ box: [3, 1, .8], c: 0x3ee69a, x: 0, z: -3.4, col: true }, ...[-4, -2.8, -1.6].map((x) => ({ m: 'home/chair_A', x, z: 2.4, r: Math.PI } as Item)), { m: 'home/cactus_medium_A', x: 5.2, z: -1.2 }, { neon: 'CHECKPOINT', c: '#3ee69a', x: 0, z: -4.38, y: 3.1 }],
    spots: [menu('🩺 Beratung, Test, PrEP'), doIt('info', '📋 Infowand lesen', -4.6, -3, { min: 10, d: { fun: 1 }, msg: 'U=U: Unter der Nachweisgrenze heißt nicht übertragbar. Tests sind hier anonym und kostenlos.' })] },
  kopfkino: { id: 'kopfkino', title: 'Videothek Kopfkino', icon: '📼', floor: 0x1a1018, wall: 0x2a1424, light: 0xff3b6b, adult: true,
    items: [...shelves(), { box: [2.4, 1, .8], c: C.black, x: 3.6, z: 2, col: true }, { box: [1.6, 2.4, 1.6], c: 0x3a1020, x: -4.4, z: 2.4, col: true }, { neon: 'KOPFKINO', c: '#ff3b6b', x: 0, z: -4.38, y: 3.2 }],
    spots: [{ id: 'menu', label: '📼 Theke (18+)', x: 3.6, z: 3, r: 1.8, act: { k: 'menu' } }, gl('dark', '🌑 Dunkelkammer', -4.4, 1)] },
  rosa: { id: 'rosa', title: 'Haus Rosa', icon: '🏮', floor: 0x3a1020, wall: 0x5a1a34, light: 0xff6ad5, adult: true,
    items: [{ m: 'home/couch_pillows', x: -2.6, z: 1.8, r: Math.PI, col: true }, { m: 'home/lamp_standing', x: -5, z: 2.6 }, { box: [2.4, 1, .8], c: C.wood, x: 3, z: -3.4, col: true }, { neon: 'HAUS ROSA', c: '#ff6ad5', x: 0, z: -4.38, y: 3.1 }],
    spots: [{ id: 'menu', label: '🏮 Empfang (18+)', x: 3, z: -2.6, r: 1.8, act: { k: 'menu' } }] },
  onelove: { id: 'onelove', title: 'One Love Bar', icon: '💗', floor: 0x2a0f22, wall: 0x3a1430, light: 0xff3fb0, music: 'show',
    items: [{ box: [6, .5, 2.4], c: 0x5a1a44, x: 0, z: -3.2, col: true, e: .2 }, { screen: [5, .12], c: 0xffd23b, x: 0, z: -2, y: .52 }, { box: [.8, 1.1, 3], c: C.wood, x: 5, z: 1.4, col: true }, ...tables(2, 2.6, 5), { neon: 'ONE LOVE', c: '#ff3fb0', x: 0, z: -4.38, y: 3.2 }],
    spots: [{ id: 'show', label: '🎤 Bühne: Lady Lumas Drag-Show', x: 0, z: -1.2, r: 1.8, act: { k: 'show' } }, { id: 'menu', label: '🍸 Bar, Leon, Lady Luma', x: 4, z: 1.4, r: 1.8, act: { k: 'menu' } }, gl('kara', '🎤 Karaoke', -3.6, 1.2), { id: 'book', label: '📖 „Ich bin das Licht“ lesen', x: -4.8, z: -2, r: 1.6, act: { k: 'book', id: 'licht' } }] },
  police: { id: 'police', title: 'Polizeiwache Mitte', icon: '🚓', floor: 0xb8c0cc, wall: 0xe8eef6, light: 0xdde8ff,
    items: [{ box: [4, 1.1, .9], c: 0x5b86d6, x: 0, z: -3.4, col: true }, ...[-4, -2.8].map((x) => ({ m: 'home/chair_A', x, z: 2.4, r: Math.PI } as Item)), { neon: 'POLIZEI', c: '#5b86d6', x: 0, z: -4.38, y: 3.1 }],
    spots: [menu('🚓 Wache')] },
  fire: { id: 'fire', title: 'Feuerwache Regenbogen', icon: '🚒', floor: 0x7a7a80, wall: 0xd8d8de, light: 0xffe0d0,
    items: [{ box: [3, 2.2, 6], c: C.red, x: -3, z: -.6, col: true }, { box: [.2, 3.2, .2], c: C.steel, x: 3, z: -1 }, { box: [2.4, 1, .8], c: C.white, x: 3.6, z: 2.6, col: true }, { neon: 'FEUERWACHE', c: '#ff4b3b', x: 1.6, z: -4.38, y: 3.1 }],
    spots: [{ id: 'menu', label: '🚒 Wachleitung', x: 3.6, z: 3.4, r: 1.8, act: { k: 'menu' } }, doIt('stange', '🧯 Rutschstangen-Übung', 3, -.2, { min: 15, d: { fun: 10, energy: -4 }, msg: 'Einmal die Stange runter. Wie im Film! Spaß +10', sfx: 'siren' })] },
  bar: { id: 'bar', title: 'Club Leuchtturm', icon: '🗼', floor: 0x16121e, wall: 0x2a2234, light: 0xffd23b, music: 'club',
    items: [...dancefloor(0xffd23b, 0x5ce1ff), { box: [.8, 1.1, 4], c: C.wood, x: 4.8, z: .6, col: true }, { neon: 'LEUCHTTURM', c: '#ffd23b', x: 0, z: -4.38, y: 3.1 }],
    spots: [{ id: 'menu', label: '🗼 Dein Club', x: 0, z: -3, r: 1.8, act: { k: 'menu' } }, { id: 'bar', label: '🍸 Hinter die Bar', x: 3.8, z: .6, r: 1.8, act: { k: 'bar' } }, { id: 'dance', label: '🪩 Tanzen', x: 0, z: 1, r: 1.8, act: { k: 'dance' } }] },
};

/** Weitere Häuser der Stadt: Orte und Bewohner aus Gay Life! (jedes Wohnhaus bekommt fest einen davon) */
const R = (who: string, color: string, lines: string[], extra: Spot[] = []): Theme => ({
  id: 'res_' + who.toLowerCase(), title: `Wohnung von ${who}`, icon: '🏠', floor: 0xb98a5e, wall: 0xf6eee4, light: 0xffd6a8,
  items: [{ m: 'home/couch_pillows', x: -2.6, z: 2.6, r: Math.PI, col: true }, { m: 'home/table_low', x: -2.6, z: 1.4, col: true }, { m: 'home/bed_double_A', x: 3.6, z: -3, col: true }, { m: 'kitchen/kitchencounter_sink', x: -3.6, z: -3.9, col: true }, { m: 'kitchen/stove_single', x: -2, z: -3.9, col: true }, { m: 'home/lamp_standing', x: -5.2, z: 3.4 }, { m: 'home/pictureframe_large_A', x: 0, z: -4.35, y: 1.9 }],
  spots: [{ id: 'talk', label: `💬 Mit ${who} reden`, x: -2.6, z: 1, r: 2, act: { k: 'talk', who, color, lines } }, doIt('kaffee', '☕ Zusammen Kaffee trinken', -2.8, -3, { min: 30, d: { social: 14, energy: 6 }, msg: `${who} macht den besten Kaffee im Viertel. Kontakte +14`, sfx: 'pour' }), ...extra],
});
export const HOUSE_THEMES: Theme[] = [
  { id: 'kino', title: 'Kino Lichtspiel', icon: '🎬', floor: 0x2a1018, wall: 0x3a1420, light: 0xff9a6a,
    items: [{ screen: [8, 3.2], c: 0xdde8ff, x: 0, z: -4.3, y: 2.2 }, ...[0, 1, 2, 3].flatMap((r) => [-3.6, -2.7, -1.8, -.9, .9, 1.8, 2.7, 3.6].map((x) => ({ box: [.7, .95, .7], c: 0x8a1a2a, x, z: -.8 + r * 1.3, col: true } as Item)))],
    spots: [doIt('film', '🎬 Film ansehen (12 €)', 0, 3.4, { cost: 12, min: 120, d: { fun: 22, social: 6, hunger: -5 }, msg: 'Ein Film, in dem am Ende alle glücklich sind. Spaß +22' })] },
  { id: 'books', title: 'Buchladen Bunte Seiten', icon: '📚', floor: 0x9a6a44, wall: 0xf3e6d0, light: 0xffd6a0,
    items: [...shelves(), { m: 'home/armchair_pillows', x: -3, z: 2, r: Math.PI, col: true }, { m: 'home/lamp_standing', x: -4.6, z: 2.6 }, { box: [2.2, 1, .8], c: C.wood, x: 3.4, z: 2, col: true }],
    spots: [{ id: 'licht', label: '📖 „Ich bin das Licht“ lesen', x: -2.2, z: -3, r: 1.6, act: { k: 'book', id: 'licht' } }, { id: 'lf', label: '🗼 „Leuchtfeuer“ lesen', x: 2.2, z: -3, r: 1.6, act: { k: 'book', id: 'leuchtfeuer' } }, doIt('lesen', '🛋️ Im Sessel schmökern', -3, 1.2, { min: 60, d: { fun: 10, energy: 4 }, msg: 'Eine Stunde in einer anderen Welt. Spaß +10' }), gl('quiz', '❓ Klischee-Quiz an der Kasse', 3.4, 3)] },
  { id: 'arcade', title: 'Arcade Funkel', icon: '🕹️', floor: 0x14102a, wall: 0x1e1840, light: 0x8a2bff, music: 'club',
    items: [-4.4, -2.2, 0, 2.2, 4.4].flatMap((x, i) => [{ box: [1.2, 2, 1], c: 0x1a1a2a, x, z: -3.8, col: true } as Item, { screen: [.9, .7], c: [0xff2fd2, 0x00f0ff, 0xffe600, 0x5dff7a, 0xff8a3b][i], x, z: -3.28, y: 1.5 } as Item]),
    spots: [gl('match', '✨ Glitzer-Match', -3.3, -2.6), gl('run', '🏃 Parade-Runner', 0, -2.6), gl('rave', '🌈 Regenbogen-Rave', 3.3, -2.6)] },
  { id: 'sauna', title: 'Sauna Heißer Stein', icon: '🧖', floor: 0xb08050, wall: 0xc8925a, light: 0xffb070,
    items: [{ box: [10, .6, 1.2], c: 0xa87040, x: 0, z: -3.6, col: true }, { box: [10, .6, 1.2], c: 0xa87040, x: 0, z: -2.2, y: -.3, col: true }, { box: [1, .8, 1], c: 0x5a5a5a, x: 4.6, z: 2.4, col: true }],
    spots: [gl('sauna', '🧖 Aufguss (Sauna-Aufguss)', 0, -1.2), doIt('schwitzen', '♨️ Schwitzen und entspannen', -3, 1, { min: 45, d: { fun: 12, hygiene: 10, energy: -6 }, msg: 'Herrlich durchgeschwitzt. Spaß +12', sfx: 'shower' })] },
  { id: 'karaoke', title: 'Karaoke Mikro-Mimosa', icon: '🎤', floor: 0x2a1040, wall: 0x3a1a5a, light: 0xff6ad5, music: 'show',
    items: [{ box: [4, .4, 2], c: 0x5a2a8a, x: 0, z: -3.4, col: true, e: .3 }, { screen: [3, 1.6], c: 0x5ce1ff, x: 0, z: -4.3, y: 2.2 }, ...tables(2, 2.4, 5)],
    spots: [gl('kara', '🎤 Karaoke singen', 0, -1.8), doIt('mimosa', '🥂 Mimosa an der Bar', 4.4, 0, { cost: 6, min: 15, d: { fun: 8, social: 6 }, msg: 'Prickelnd! Spaß +8', sfx: 'glass' })] },
  { id: 'tanzschule', title: 'Tanzschule Pirouette', icon: '💃', floor: 0xc8a070, wall: 0xf6f0ff, light: 0xffffff,
    items: [{ box: [10, 2.4, .08], c: 0xbfe8ff, x: 0, z: -4.3, y: .4, e: .15 }, { box: [10, .08, .1], c: C.steel, x: 0, z: -3.9, y: 1.1 }],
    spots: [gl('dance', '💃 Tanzbattle (Tanzschule)', 0, -1.6), doIt('kurs', '🩰 Salsa-Kurs (8 €)', 3, 1.4, { cost: 8, min: 60, d: { fun: 14, social: 10, energy: -10 }, msg: 'Eins, zwei, drei … und Drehung! Kontakte +10' })] },
  { id: 'bad', title: 'Strandbad Sonnenbrand (Halle)', icon: '🏊', floor: 0xe8f4ff, wall: 0xdff0ff, light: 0xe0f4ff,
    items: [{ box: [8, .05, 4.4], c: 0x2f8fd0, x: 0, z: -1.6, e: .35 }, { box: [.6, 3, .6], c: C.white, x: 4.6, z: -3.6, col: true }, { box: [1.8, .1, .5], c: C.blue, x: 3.8, z: -3.6, y: 3 }],
    spots: [gl('pool', '🏊 Strandbad-Sprung (Turm)', 4.6, -2.4), doIt('schwimmen', '🌊 Bahnen schwimmen', -2, 1.2, { min: 40, d: { energy: -10, fun: 10, hygiene: 8 }, msg: 'Zwanzig Bahnen. Spaß +10', sfx: 'splash' })] },
  { id: 'werkstatt', title: 'Festwagen-Werkstatt', icon: '🛠️', floor: 0x5a5a60, wall: 0xb8b8c0, light: 0xfff0d0,
    items: [{ box: [3.4, 1.4, 5], c: C.pink, x: -1.4, z: -1, col: true, e: .2 }, { box: [3.6, .2, 5.2], c: C.gold, x: -1.4, z: -1, y: 1.5 }, { box: [2.4, 1, .8], c: C.steel, x: 4, z: -3.4, col: true }],
    spots: [gl('run', '🏃 Parade-Runner (Probefahrt)', 2.2, 1.2), doIt('deko', '🎨 Festwagen dekorieren', 4, -2.4, { min: 60, d: { fun: 12, energy: -6 }, msg: 'Glitzer, Federn, Regenbogen. Spaß +12' })] },
  { id: 'ramen', title: 'Ramen Nachteule', icon: '🍜', floor: 0x3a2a22, wall: 0x5a3a2a, light: 0xffb070,
    items: [...counter, ...[-3, -1, 1, 3].map((x) => ({ box: [.5, .8, .5], c: C.red, x, z: -2.4, col: true } as Item)), { neon: 'RAMEN', c: '#ff8a3b', x: 0, z: -4.38, y: 3.1 }],
    spots: [doIt('ramen', '🍜 Ramen essen (11 €)', 0, -1.6, { cost: 11, min: 30, d: { hunger: 50 }, msg: 'Heiße Brühe. Hunger +50', sfx: 'cook' })] },
  { id: 'dunkel', title: 'Dunkelkammer Blackout', icon: '🌑', floor: 0x0a0a0a, wall: 0x111111, light: 0x5a2a8a, adult: true,
    items: [{ box: [1.4, 2.4, 1.4], c: 0x1a1a1a, x: -3, z: -2.6, col: true }, { box: [1.4, 2.4, 1.4], c: 0x1a1a1a, x: 3, z: -2.6, col: true }],
    spots: [gl('dark', '🌑 Dunkelkammer (18+)', 0, -1.6)] },
  R('Jonas', '#5ce1ff', ['Hey! Komm rein, Schuhe kannst du anlassen.', 'Ich sammle Vinyl. Willst du was hören? Am liebsten Disco aus den 80ern.']),
  R('Mika', '#ff9ad5', ['Willkommen in meinem Chaos. Ich nähe gerade ein Pride-Outfit.', 'Glitzer findest du hier in jeder Ritze. Für immer.'], [gl('style', '🪡 Outfit-Check an Mikas Spiegel', 4.4, 1.4)]),
  R('Deniz', '#3ee69a', ['Ich koche gerade Linsensuppe. Bleib doch zum Essen!', 'Seit ich hier wohne, hab ich das erste Mal das Gefühl, angekommen zu sein.']),
  R('Elif', '#ffd23b', ['Pst, meine Katze schläft. … Okay, jetzt nicht mehr.', 'Ich arbeite im Checkpoint. Frag mich alles, ohne Scham.']),
  R('Torsten', '#d56300', ['Moin! Ich bin der Sauna-Torsten. Na, schon mal beim Aufguss gewesen?', 'Mein Sofa ist dein Sofa. Bier ist im Kühlschrank.']),
  R('Noor', '#9b4f96', ['Ich male gerade die Wand neu. In allen Farben, versteht sich.', 'Ich organisiere den Lesekreis im Regenbogenhaus. Komm mal vorbei!'], [gl('quiz', '❓ Noors Klischee-Quiz', 4.4, 1.4)]),
  R('Kai', '#5bcefa', ['Hi! Ich bin neu in der Stadt, wie du am Anfang.', 'Ich spiel Gitarre. Schlecht, aber laut.'], [gl('kara', '🎸 Mit Kai singen (Karaoke)', 4.4, 1.4)]),
  R('Rosa', '#ff6ad5', ['Ach, Besuch! Setz dich, Schätzchen. Ich bin seit 1975 in der Szene.', 'Früher mussten wir uns verstecken. Heute tanzt ihr auf der Straße. Wunderbar.']),
];

/** Fester Innenraum je Wohnhaus (gleiches Haus = gleicher Ort) */
export function houseTheme(i: number, adult: boolean) {
  const list = HOUSE_THEMES.filter((t) => adult || !t.adult);
  return list[((i * 7919) >>> 0) % list.length];
}
