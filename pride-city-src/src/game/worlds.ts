/* Welten jenseits von Rainbow City: eigene Inseln im selben Stil, erreichbar durch das Weltentor am Hafen (hinlaufen)
   oder per Schnellreise im Handy. Jede Welt hat einen Ortskern aus dem Stadt-Bausatz (Straßen, Häuser, Verkehr),
   eine Gastgeberin oder einen Gastgeber, eine Geschichte in vier Aufgaben (sammeln, Ringe fliegen, Botengang, Finale),
   einen Lieferauftrag auf Zeit und Leute zum Reden. Alles hier ist eigene Erfindung von Pride City. */
import type { Mesh, PBRMaterial, Scene } from '../engine/bjs';
import type { Spot } from './interiors';

/** Baukasten, den WorldScene den Welten reicht */
export interface Kit {
  sc: Scene;
  /** mattes Material (je Farbe einmal) */ M(c: number, rough?: number, metal?: number): PBRMaterial;
  /** leuchtendes Material */ G(c: number, k?: number, alpha?: number): PBRMaterial;
  box(w: number, h: number, d: number, m: PBRMaterial, x: number, y: number, z: number, ry?: number): Mesh;
  cyl(rt: number, rb: number, h: number, m: PBRMaterial, x: number, y: number, z: number, seg?: number): Mesh;
  ball(r: number, m: PBRMaterial, x: number, y: number, z: number, sx?: number, sy?: number, sz?: number): Mesh;
  arc(r: number, tube: number, m: PBRMaterial, x: number, y: number, z: number, ry?: number): Mesh;
  /** Schriftzug als Neon */ sign(text: string, color: string, x: number, y: number, z: number, ry: number, w: number): void;
  /** Hindernis (Kreis) */ solid(x: number, z: number, r: number): void;
  /** Zufall 0…1, je Welt gleich */ rnd(): number;
  /** Platz frei? Nicht auf Straße, Haus oder Hindernis (pad = Abstand in Metern) */ free(x: number, z: number, pad?: number): boolean;
}

/* Ortskern jeder Welt, gebaut aus demselben Bausatz wie Rainbow City: ein Straßenring um den Platz (x ±20, z −10…20),
   Häuserzeilen im Westen und Osten, zwei Häuser im Norden. Dazwischen: Platz (Mitte), Wahrzeichen (Norden), Natur (Süden). */
/** Häuser: [x, z, Drehung] (Tür zeigt zur Straße) */
export const SLOTS: Array<[number, number, number]> = [
  ...[-20, -10, 0, 10, 20, 30].map((z) => [-30, z, Math.PI / 2] as [number, number, number]),
  ...[-20, -10, 0, 10, 20, 30].map((z) => [30, z, -Math.PI / 2] as [number, number, number]),
  [-20, -20, 0], [20, -20, 0],
];
/** Reihenfolge, in der die Läden einer Welt auf die Häuser verteilt werden (die mittleren zuerst) */
export const SHOP_SLOTS = [2, 8, 3, 9, 1, 7, 4, 10, 12, 13];
/** frei von Straßenring und Häusern */
export function townFree(x: number, z: number, pad = 1) {
  const ax = Math.abs(x);
  if (ax < 25 + pad && z > -15 - pad && z < 25 + pad && !(ax < 15 - pad && z > -5 + pad && z < 15 - pad)) return false;
  if (ax > 25 - pad && ax < 35 + pad && z > -25 - pad && z < 35 + pad) return false;
  if (ax > 15 - pad && ax < 25 + pad && z > -25 - pad && z < -15 + pad) return false;
  if (Math.hypot(ax - SIDE_GATE.x, z - SIDE_GATE.z) < 3.5 + pad) return false;
  return true;
}
/** Tore am Ortsrand (x gespiegelt): im Westen zur vorigen, im Osten zur nächsten Welt */
export const SIDE_GATE = { x: 33, z: 37 };

export interface WorldNpc { name: string; rb: string; x: number; z: number; yaw?: number; anim?: 'idle' | 'talk' | 'dance1' | 'dance2' | 'dance3' | 'sit' | 'cheer'; color: string; lines?: string[] }
export interface WorldDef {
  id: string; name: string; icon: string; sub: string; adult?: boolean;
  /** Himmel oben/unten, Boden, Wasser */ sky: [string, string]; ground: number; water: number; light: number;
  /** Halbmesser der Insel in Metern */ r: number;
  music: 'city' | 'club' | 'show';
  host: WorldNpc & { intro: string[]; ask1: string; ask2: string; /** Botengang vor dem Finale: allen Bescheid sagen */ ask3: string; finale: string[]; after: string[] };
  /** was gesammelt wird */ item: { icon: string; name: string; color: number; n: number };
  /** Lohn für die drei Aufgaben */ pay: [number, number, number];
  folk: WorldNpc[];
  /** Nachtwelt: gedämpftes Licht (0…1) */ dim?: number;
  /** Stellen mit Wirkung auf die Bedürfnisse (wie in den Häusern) */ spots?: Spot[];
  /** Ortskern: Fassadenfarben (Faktoren je Haus), Pflaster des Platzes, Läden [Leuchtschrift, Farbe, Innenraum aus interiors.ts] */
  town: { tint: number[][]; plaza: number; shops: Array<[string, string, string]>; /** geparkte Autos [x, z, Drehung] */ parked?: Array<[number, number, number]> };
  /** Lieferauftrag auf Zeit (wiederholbar) */ job: { icon: string; name: string; text: string };
  build(k: Kit): void;
}

const RAINBOW = [0xff3b3b, 0xff8a3b, 0xffd23b, 0x3ee69a, 0x3a7bff, 0xb56bff];

/** Einhorn aus Grundformen (Tiere dürfen stilisiert sein, Menschen bleiben echte Figuren) */
function unicorn(k: Kit, x: number, z: number, ry: number, coat: number, s = 1) {
  const c = Math.cos(ry), sn = Math.sin(ry), P = (lx: number, lz: number): [number, number] => [x + (lx * c + lz * sn) * s, z + (-lx * sn + lz * c) * s];
  const m = k.M(coat, .55), hoof = k.M(0xffd23b, .3, .6);
  const [bx, bz] = P(0, 0); const body = k.ball(.55 * s, m, bx, 1.15 * s, bz, 1, .95, 1.75); body.rotation.y = ry;
  for (const [lx, lz] of [[-.28, .6], [.28, .6], [-.28, -.6], [.28, -.6]]) { const [px, pz] = P(lx, lz); k.cyl(.09 * s, .08 * s, .85 * s, m, px, .45 * s, pz, 8); k.cyl(.1 * s, .1 * s, .1 * s, hoof, px, .05 * s, pz, 8); }
  const [nx, nz] = P(0, .95); const neck = k.cyl(.2 * s, .26 * s, .8 * s, m, nx, 1.7 * s, nz, 10); neck.rotation.set(.5 * c, 0, -.5 * sn);
  const [hx, hz] = P(0, 1.25); const head = k.ball(.26 * s, m, hx, 2.1 * s, hz, 1, 1, 1.5); head.rotation.y = ry;
  const [ox, oz] = P(0, 1.35); k.cyl(0, .06 * s, .55 * s, k.G(0xffe07a, 1.3), ox, 2.55 * s, oz, 8);
  RAINBOW.forEach((col, i) => { const [mx, mz] = P(0, .95 - i * .16); k.ball(.13 * s, k.M(col, .6), mx, (2.05 - i * .13) * s, mz); });
  RAINBOW.slice(0, 4).forEach((col, i) => { const [tx, tz] = P(0, -1 - i * .12); k.ball(.11 * s, k.M(col, .6), tx, (1.2 - i * .16) * s, tz); });
  k.solid(bx, bz, .9 * s);
}
function palm(k: Kit, x: number, z: number, h = 5) {
  const trunk = k.M(0x9a6a3a, .9), leaf = k.M(0x2f9f5a, .8);
  k.cyl(.16, .24, h, trunk, x, h / 2, z, 8);
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2, l = k.box(.5, .06, 2.4, leaf, x + Math.sin(a) * 1.1, h - .15, z + Math.cos(a) * 1.1, a); l.rotation.x = .35; }
  k.solid(x, z, .35);
}

const CITY_TINT = [[1.6, .7, 1.25], [.55, 2, 2.2], [1.6, 1.7, .5], [1.05, .8, 2.1], [.6, 2.1, 1.1], [1.8, 1.25, .5], [1.75, .55, 1.05], [.6, 1.3, 2.4]];
/** Punkt irgendwo auf der Insel (Abstand a…b von der Mitte) */
const any = (k: Kit, a: number, b: number): [number, number] => { const w = k.rnd() * 6.283, d = a + k.rnd() * (b - a); return [Math.sin(w) * d, Math.cos(w) * d]; };

export const WORLDS: WorldDef[] = [
  {
    id: 'einhorn', name: 'Glitzeria', icon: '🦄', sub: 'Einhorn-Welt: Zuckerwatte, Regenbögen und eine Herde ohne Glitzer',
    sky: ['#8fd3ff', '#ffd0ef'], ground: 0xffc4e6, water: 0xa7e8ff, light: 0xfff0fa, r: 52, music: 'show',
    town: { tint: [[1.9, 1.1, 1.7], [1.3, 1.2, 2.2], [1, 1.9, 1.7], [2, 1.7, 1], [1.9, .9, 1.4], [1.1, 1.6, 2.2]], plaza: 0xffe9f6,
      shops: [['ZUCKERBÄCKEREI', '#ff9ad5', 'cafe'], ['GLITZER-MODE', '#c99aff', 'boutique'], ['STERNENKINO', '#ffe14a', 'kino'], ['MÄRCHENBÜCHER', '#9fe3ff', 'books'], ['HUF & HORN FIT', '#9af0c0', 'gym'], ['KARAOKE WOLKE', '#ff7bd5', 'karaoke'], ['PIZZA REGENBOGEN', '#ffb347', 'pizza'], ['SPÄTI STERNCHEN', '#7fd4ff', 'spaeti']] },
    job: { icon: '🧁', name: 'Törtchen-Kurier', text: 'Bring die Glitzertörtchen an die Türen, bevor die Sahne schmilzt.' },
    host: { name: 'Stella Sternenstaub', rb: 'Female_Party_01', x: 0, z: 9, yaw: 0, anim: 'idle', color: '#ff7bd5',
      intro: ['Willkommen in Glitzeria, Schatz! Ich bin Stella, die Hüterin der Herde.', 'Heute Abend ist die große Glitzerparade. Aber der Sturm hat den Einhörnern den Sternenstaub aus der Mähne gepustet.', 'Ohne Glitzer keine Parade. Hilfst du mir?'],
      ask1: 'Sammle die Glitzersterne ein, die über die Insel verstreut liegen. Ein paar schweben in der Luft, dafür brauchst du den Flitzer.',
      ask2: 'Jetzt muss der Staub in den Himmel. Flieg durch alle Regenbogenringe über der Ringstraße, dann rieselt er auf die Herde herab.',
      ask3: 'Fast geschafft! Sag noch allen im Ort Bescheid, dass die Parade heute Abend startet. Dann komm zu mir zurück.',
      finale: ['Schau sie dir an. Sie funkeln wieder!', 'Die Parade kann starten. Und du läufst ganz vorne mit, das hast du dir verdient.', 'Hier, dein Anteil aus der Glitzerkasse. Komm bald wieder, Glitzeria vergisst niemanden.'],
      after: ['Die Herde fragt jeden Tag nach dir.', 'Einhörner mögen dich. Das merkt man daran, dass sie dir nicht auf den Fuß treten.'] },
    item: { icon: '⭐', name: 'Glitzersterne', color: 0xffe14a, n: 8 }, pay: [120, 180, 400],
    spots: [
      { id: 'streicheln', label: '🦄 Einhorn streicheln', x: -8.2, z: 4.6, r: 2, act: { k: 'do', min: 15, d: { fun: 14, social: 6 }, msg: 'Es schnaubt Glitzer und legt den Kopf auf deine Schulter. Spaß +14' } },
      { id: 'brunnen', label: '⛲ Am Glitzerbrunnen etwas wünschen', x: 0, z: 5.6, r: 1.8, act: { k: 'do', cost: 1, min: 5, d: { fun: 10 }, msg: 'Du wirfst eine Münze hinein. Der Brunnen blubbert zustimmend. Spaß +10' } },
      { id: 'wiese', label: '🧺 Picknick auf der Wolkenwiese', x: 11, z: 33, r: 2.4, act: { k: 'do', cost: 4, min: 40, d: { hunger: 22, energy: 8, fun: 6 }, msg: 'Zuckerwatte, Erdbeeren und ein Einhorn, das mitessen will. Hunger gestillt.' } },
    ],
    folk: [
      { name: 'Wolke', rb: 'Female_Adult_04', x: -10, z: 11, anim: 'dance1', color: '#9fd0ff', lines: ['Ich wohne hier seit einem Urlaub, der nie aufgehört hat.', 'Zuckerwatte zum Frühstück. Mein Zahnarzt weint, ich nicht.'] },
      { name: 'Prinz Karamell', rb: 'Male_Adult_07', x: 10, z: 8, anim: 'talk', color: '#ffb347', lines: ['Jedes Einhorn hier hat einen eigenen Regenbogen. Meins teilt nicht gern.', 'Der Flitzer? Glitzert, fliegt und ist nicht zu übersehen. Passt zu dir.'] },
      { name: 'Fee Fabiola', rb: 'Female_Adult_09', x: -5, z: 31, anim: 'dance2', color: '#b56bff', lines: ['Wünsch dir was. Nein, lauter. Das Universum ist schwerhörig.', 'In Glitzeria ist jeden Tag Pride.'] },
      { name: 'Hofdame Praline', rb: 'Female_Adult_06', x: 5, z: -20, anim: 'cheer', color: '#ffd23b', lines: ['Im Schloss wohnt niemand. Es ist nur für die Fotos, aber sag es nicht weiter.', 'Die Parade geht einmal um die Ringstraße. Die Autos warten gern.'] },
    ],
    build(k) {
      const candy = [0xff8fd0, 0x9fe3ff, 0xfff08a, 0xc9a2ff, 0x9af0c0];
      // Zuckerwattebäume: Wiese im Süden, hinter den Häusern, ein paar auf dem Platz
      for (let i = 0; i < 46; i++) {
        const [x, z] = any(k, 7, 49), h = 2.2 + k.rnd() * 2.2;
        if (!k.free(x, z, 1.6) || (Math.abs(x) < 4 && z > 0) || (z < -22 && Math.abs(x) < 12)) continue;
        k.cyl(.14, .2, h, k.M(0xfff3e0, .8), x, h / 2, z, 8);
        const c = candy[i % 5]; k.ball(1.1 + k.rnd() * .5, k.M(c, .95), x, h + .7, z); k.ball(.7, k.M(c, .95), x + .7, h + .3, z + .2); k.ball(.6, k.M(c, .95), x - .6, h + .4, z - .3);
        k.solid(x, z, .4);
      }
      // Regenbögen überspannen die Ringstraße (Autos fahren darunter durch) und den Weg vom Tor
      for (const [x, z, ry, r] of [[20, 5, 0, 5.4], [-20, 5, 0, 5.4], [0, 31, 0, 6]] as const) RAINBOW.forEach((c, i) => k.arc(r - i * .3, .16, k.G(c, .85), x, 0, z, ry));
      // Wolken
      for (let i = 0; i < 11; i++) { const a = i / 11 * Math.PI * 2, x = Math.sin(a) * 34, z = Math.cos(a) * 34, y = 17 + (i % 3) * 3, w = k.M(0xffffff, 1); k.ball(2.4, w, x, y, z, 1.6, .7, 1); k.ball(1.7, w, x + 2.2, y - .2, z, 1.3, .7, 1); k.ball(1.5, w, x - 2.1, y - .1, z + .4, 1.3, .7, 1); }
      // Kristallschloss im Norden
      const wall = k.M(0xfdf1ff, .35, .1), roof = k.M(0xff7bd5, .4);
      k.box(11, 6, 7, wall, 0, 3, -31); k.solid(-3.5, -31, 3.6); k.solid(3.5, -31, 3.6); k.solid(0, -31, 4);
      for (const tx of [-6.4, 6.4]) { k.cyl(1.6, 1.7, 10, wall, tx, 5, -31, 14); k.cyl(0, 2.1, 3.8, roof, tx, 11.9, -31, 14); k.solid(tx, -31, 1.9); }
      k.cyl(1.3, 1.4, 13, wall, 0, 6.5, -33, 14); k.cyl(0, 1.8, 4, roof, 0, 15, -33, 14);
      k.cyl(0, 4.2, 3.2, roof, 0, 7.6, -31, 4).rotation.y = Math.PI / 4; k.box(2.4, 3.4, .2, k.G(0xffd6f4, 1), 0, 1.7, -27.45);
      for (const sx of [-1, 1]) for (const y of [2.4, 4.4]) k.box(1, 1.3, .12, k.G(0xbfe6ff, .9), sx * 3.4, y, -27.46);
      k.sign('GLITZERIA', '#ff7bd5', 0, 5.4, -27.4, 0, 7);
      for (let i = 0; i < 6; i++) k.cyl(.7, .7, .06, k.M(candy[i % 5], .5), 0, .04, -17 - i * 1.7, 14);
      // Glitzerbrunnen auf dem Platz
      k.cyl(2.6, 2.8, .5, k.M(0xffffff, .4), 0, .3, 2, 20); k.cyl(2.3, 2.3, .06, k.G(0x9fe3ff, .8), 0, .56, 2, 20); k.cyl(.3, .4, 1.8, k.M(0xffffff, .4), 0, 1.1, 2, 10);
      RAINBOW.forEach((c, i) => k.ball(.22, k.G(c, 1.3), Math.sin(i * 1.05) * .5, 2.1 + (i % 2) * .3, 2 + Math.cos(i * 1.05) * .5)); k.solid(0, 2, 2.9);
      // Herde
      unicorn(k, -9, 3, .6, 0xffffff); unicorn(k, 9, 1, -1.9, 0xffe3f4); unicorn(k, -11, 34, 2.4, 0xe4f1ff, .8); unicorn(k, 14, 31, .2, 0xfff3c4, 1.1); unicorn(k, -5, -21, 2.6, 0xf1e4ff, .7);
      // Bonbonweg vom Tor zum Platz und Lutscher
      for (let i = 0; i < 12; i++) { const z = 39 - i * 2.6; if (z < 25.5 && z > 14.5) continue; k.cyl(.7, .7, .06, k.M(candy[i % 5], .5), Math.sin(i * .5) * .8, .1, z, 14); }
      for (let i = 0; i < 16; i++) { const [x, z] = any(k, 6, 48); if (!k.free(x, z, 1)) continue; k.cyl(.05, .05, 1.6, k.M(0xffffff), x, .8, z, 6); const l = k.cyl(.55, .55, .12, k.M(RAINBOW[i % 6], .4), x, 1.9, z, 16); l.rotation.x = Math.PI / 2; }
      // Picknickdecke
      k.box(2.6, .04, 2, k.M(0xff8fd0, .9), 11, .03, 34.6); for (let i = 0; i < 3; i++) k.ball(.22, k.M(candy[i], .6), 10.4 + i * .6, .25, 34.6);
    },
  },
  {
    id: 'canaria', name: 'Playa Arcoíris', icon: '🏝️', sub: 'Insel-Pride wie auf Gran Canaria: Promenade, Strandbars und die große Bühne',
    sky: ['#3aa0ff', '#ffe2b0'], ground: 0xf2d79a, water: 0x23b6d8, light: 0xfff4dc, r: 52, music: 'club',
    town: { tint: [[2.3, 2.2, 2], [2.2, 1.25, .75], [2.3, 1.9, .85], [.95, 1.8, 2.2], [2.3, 1.45, 1.35], [1.2, 2.1, 1.6]], plaza: 0xf3e2c6,
      shops: [['BAR LOLA', '#ff3b6b', 'komet'], ['TAPAS', '#ffd23b', 'diner'], ['MOJITO', '#5ce1ff', 'cafe'], ['CABARET', '#b56bff', 'karaoke'], ['STRANDMODE', '#ff9ad5', 'boutique'], ['SUPERMERCADO', '#3ee69a', 'spaeti'], ['SAUNA SOL', '#ff8a3b', 'sauna'], ['PIZZA PLAYA', '#ffb347', 'pizza']] },
    job: { icon: '🍹', name: 'Sangria-Service', text: 'Die Bars warten auf Nachschub. Liefere die Krüge aus, solange das Eis hält.' },
    host: { name: 'Lola Caliente', rb: 'Female_Party_02', x: 0, z: 9, yaw: 0, anim: 'idle', color: '#ff8a3b',
      intro: ['¡Hola, guapo! Ich bin Lola, ich moderiere seit zwanzig Jahren die Pride-Gala auf dieser Insel.', 'Heute Nacht steigt die große Show. Und irgendein Witzbold hat meine Fächer über die ganze Insel verteilt. Alle acht!', 'Eine Dragqueen ohne Fächer ist wie Sangria ohne Obst. Hilf mir, cariño.'],
      ask1: 'Such meine acht Pride-Fächer. Sie liegen in den Dünen, an der Promenade und, frag mich nicht wie, ein paar hängen in der Luft.',
      ask2: 'Jetzt die Werbung: Flieg mit dem Flitzer durch alle Ringe über der Promenade, damit die ganze Insel weiß, dass heute Gala ist.',
      ask3: 'Eine Bitte noch, cariño: Lauf herum und lade alle persönlich ein. Wer von mir eingeladen wird, kommt auch.',
      finale: ['Die Dünen sind voll, der Platz ist voll, sogar die Liegen sind voll. Das warst du!', 'Komm mit auf die Bühne. Heute verbeugst du dich neben mir.', 'Und hier ist deine Gage. Auf der Insel sagt man: Wer einmal bei der Gala war, kommt jedes Jahr wieder.'],
      after: ['Die Gala läuft jeden Abend. Dein Platz in der ersten Reihe ist reserviert.', 'Trink Wasser, cariño. Die Sonne hier kennt keine Gnade.'] },
    item: { icon: '🪭', name: 'Pride-Fächer', color: 0xff4fa3, n: 8 }, pay: [150, 220, 500],
    spots: [
      { id: 'chiringuito', label: '🍹 Chiringuito: Sangria', x: -8, z: 4.4, r: 2, act: { k: 'do', cost: 6, min: 30, d: { fun: 16, social: 12, hunger: 6 }, msg: 'Eiskalt, mit zu viel Obst. Javi zwinkert. Spaß +16' } },
      { id: 'liege', label: '🏖️ Auf der Liege sonnen', x: -9, z: 31.4, r: 2, act: { k: 'do', min: 60, d: { energy: 22, fun: 8 }, msg: 'Eine Stunde Sonne, Meeresrauschen, irgendwo läuft ein Sommerhit. Energie +22' } },
      { id: 'tanzen', label: '💃 Vor der Bühne tanzen', x: 0, z: -17.6, r: 2.2, act: { k: 'do', min: 30, d: { fun: 22, social: 10, energy: -10 }, msg: 'Der Bass kommt bis in die Dünen. Alle Arme sind oben. Spaß +22' } },
    ],
    folk: [
      { name: 'Javi', rb: 'Male_Adult_05', x: -8, z: 1.2, yaw: 0, anim: 'talk', color: '#5ce1ff', lines: ['Ich mache die besten Mojitos im Centro. Sagt meine Mutter, und die trinkt nicht mal.', 'Mittags Düne, abends Bühne. So geht Insel.'] },
      { name: 'Bärbel und ihr Mann', rb: 'Female_Adult_06', x: 10, z: 10, anim: 'cheer', color: '#ffd23b', lines: ['Wir kommen seit 1998 jedes Jahr her. Früher wegen der Sonne, heute wegen der Show.', 'Die jungen Leute sind so nett. Einer hat mir Glitzer geschenkt.'] },
      { name: 'Milo', rb: 'Male_Adult_02', x: -5, z: -18, yaw: Math.PI, anim: 'dance1', color: '#b56bff', lines: ['Erste Pride meines Lebens. Ich wusste nicht, dass man so viel grinsen kann.', 'In den Dünen verläuft man sich. Manche mit Absicht.'] },
      { name: 'Rico', rb: 'Sports_Male_01', x: 5, z: -18.2, yaw: Math.PI, anim: 'dance2', color: '#ff3fb0', lines: ['Ich tanze seit gestern Mittag. Meine Füße haben gekündigt.', 'Der Flitzer ist das beste Strandfahrzeug aller Zeiten.'] },
      { name: 'Dana', rb: 'Sports_Female_01', x: 7, z: 33, anim: 'dance3', color: '#3ee69a', lines: ['Sonnencreme, Wasser, Glitzer. In der Reihenfolge.', 'Heute Abend singen alle mit, auch die, die den Text nicht können.'] },
    ],
    build(k) {
      const sand = k.M(0xf6dfa6, 1), sand2 = k.M(0xeccb86, 1);
      // Dünen im Süden und am Rand
      for (let i = 0; i < 26; i++) { const [x, z] = any(k, 30, 49); if (!k.free(x, z, 4) || (Math.abs(x) < 7 && z > 0)) continue; const r = 4 + k.rnd() * 5; k.ball(r, i % 2 ? sand : sand2, x, -r * .55, z, 1.5, .8, 1.1); }
      // Palmen: Allee auf dem Platz, am Weg vom Tor und verstreut
      for (const sx of [-13, 13]) for (const z of [-3, 5, 13]) palm(k, sx, z, 5.5);
      for (const z of [28, 34, 40]) for (const sx of [-4.5, 4.5]) palm(k, sx, z, 5);
      for (let i = 0; i < 30; i++) { const [x, z] = any(k, 27, 49); if (!k.free(x, z, 1.6) || (Math.abs(x) < 16 && z < -16) || (Math.abs(x) < 6 && z > 0)) continue; palm(k, x, z, 4 + k.rnd() * 2.5); }
      // Pride-Bühne im Norden (schaut zum Platz)
      const black = k.M(0x16161c, .6), truss = k.M(0xb9c0c8, .3, .8);
      k.box(18, 1.2, 8, black, 0, .6, -26); for (const sx of [-1, 1]) for (const sz of [-1, 1]) k.cyl(.18, .18, 9, truss, sx * 8.6, 5.7, -26 + sz * 3.6, 8);
      k.box(17.6, .3, 7.6, truss, 0, 10.2, -26); k.box(13, 5.4, .2, k.G(0xff4fa3, .9), 0, 4.9, -29.6);
      RAINBOW.forEach((c, i) => k.box(2.1, 5.4, .22, k.G(c, .9), -5.25 + i * 2.1, 4.9, -29.5));
      k.sign('PRIDE GALA', '#ffffff', 0, 8.6, -29.3, 0, 11);
      for (const sx of [-1, 1]) { k.box(1.6, 3.4, 1.6, black, sx * 10.8, 1.7, -22.6); k.solid(sx * 10.8, -22.6, 1.3); for (let i = 0; i < 4; i++) k.ball(.3, k.G(RAINBOW[(i * 2 + (sx > 0 ? 1 : 0)) % 6], 1.3), sx * (7.4 - i * 2), 9.9, -22.4); }
      for (let x = -8; x <= 8; x += 2) k.solid(x, -26, 1.7);
      // Chiringuito auf dem Platz: runde Theke mit Strohdach
      k.cyl(1.9, 1.9, 1.05, k.M(0xfffaf0, .8), -8, .55, 2, 16); k.cyl(2.05, 2.05, .08, k.M(0x8a5a35, .7), -8, 1.12, 2, 16); k.cyl(.12, .12, 3.2, k.M(0x8a5a35, .8), -8, 1.6, 2, 8); k.cyl(.3, 3.2, 1.3, k.M(0xd9b46a, .95), -8, 3.6, 2, 14);
      k.sign('CHIRINGUITO', '#ffd23b', -8, 2.5, 4.1, 0, 3.4); k.solid(-8, 2, 2.2);
      for (const [x, z] of [[-4.6, 3], [-10.5, 5.4], [-5.4, 5.2]]) { k.cyl(.45, .45, .06, k.M(0xffffff, .6), x, .78, z, 12); k.cyl(.05, .05, .78, truss, x, .39, z, 6); }
      // Liegen und Sonnenschirme am Strand
      for (let i = 0; i < 10; i++) {
        const x = -27 + i * 6, z = 31 + (i % 2) * 2.5; if (Math.abs(x) < 5) continue;
        k.box(.8, .25, 2, k.M(0xffffff, .7), x, .25, z); k.box(.8, .5, .2, k.M(0xffffff, .7), x, .5, z - .9);
        k.cyl(.04, .04, 2.4, truss, x + .9, 1.2, z, 6); k.cyl(.1, 1.5, .5, k.M(RAINBOW[i % 6], .7), x + .9, 2.55, z, 10); k.solid(x, z, .7);
      }
      // Wimpel-Masten rund um den Platz
      for (const sx of [-1, 1]) for (let i = 0; i < 4; i++) { const x = sx * 14.2, z = -4 + i * 6; k.cyl(.06, .06, 5, truss, x, 2.5, z, 6); RAINBOW.forEach((c, j) => k.box(.02, .22, .8, k.M(c, .6), x, 4.9 - j * .22, z + .45)); }
      // Leuchtturm-Imbiss als Blickfang im Nordwesten, Surfbretter am Strand
      k.cyl(1.2, 1.5, 7, k.M(0xffffff, .6), -38, 3.5, -30, 14); k.cyl(1.25, 1.25, 1.2, k.M(0xff3b3b, .6), -38, 4.6, -30, 14); k.cyl(0, 1.5, 1.6, k.M(0xff3b3b, .6), -38, 7.8, -30, 14); k.solid(-38, -30, 1.7);
      RAINBOW.forEach((c, i) => { const b = k.box(.5, 2.2, .08, k.M(c, .4), 14 + i * .7, 1.1, 39); b.rotation.x = -.25; });
    },
  },
  {
    id: 'cruising', name: 'Lustwäldchen', icon: '🌲', sub: 'Cruising-Viertel bei Nacht: Laternen, Wald, Dampfbad und Blicke im Neonlicht', adult: true, dim: .42,
    sky: ['#070a22', '#2a1848'], ground: 0x24402c, water: 0x0b1c33, light: 0xb8c8ff, r: 52, music: 'club',
    town: { tint: [[.9, .65, 1.4], [.65, .85, 1.25], [1.3, .65, .9], [.75, .75, .9], [1.1, .6, 1.2]], plaza: 0x3a3f4a, parked: [[-17, 29.6, .2], [-13.4, 32.8, 3.3], [-10.2, 29.8, -.3]],
      shops: [['DAMPFBAD', '#ff5a5a', 'sauna'], ['VIDEOTHEK', '#ff3fb0', 'kopfkino'], ['BAR NACHTFALTER', '#b56bff', 'komet'], ['DUNKELKAMMER', '#8a6bff', 'dunkel'], ['SPÄTI 24', '#7fd4ff', 'spaeti'], ['CHECKPOINT', '#3ee69a', 'checkpoint'], ['IMBISS', '#ffd23b', 'diner'], ['WASCHSALON', '#9fe3ff', 'wasch']] },
    job: { icon: '🎁', name: 'Päckchen-Runde', text: 'Bring Kondome und Gleitgel an die Türen im Viertel, bevor die Nacht richtig losgeht.' },
    host: { name: 'Bruno', rb: 'Male_Adult_08', x: 0, z: 9, yaw: 0, anim: 'idle', color: '#3ee69a',
      intro: ['Na, zum ersten Mal im Lustwäldchen? Ich bin Bruno vom Checkpoint, ich mache hier die Nachtschicht.', 'Hier gilt: Nur wer will, nur was beide wollen, und immer mit Gummi. Dafür sorge ich.', 'Blöd nur, dass der Wind meine Safer-Sex-Päckchen im ganzen Viertel verteilt hat.'],
      ask1: 'Sammle die acht Päckchen ein, Kondome und Gleitgel für alle. Ein paar hängen oben in der Luft, nimm den Flitzer.',
      ask2: 'Jetzt die Runde: Flieg durch die Ringe über der Straße, dann sehen alle das Licht und wissen, dass der Stand offen ist.',
      ask3: 'Dreh noch eine Runde zu Fuß und sag den Jungs, dass es bei mir alles gratis gibt. Manche trauen sich nicht zu fragen.',
      finale: ['So voll war mein Stand noch nie. Alle versorgt, alle entspannt.', 'Das ist Cruising, wie es sein soll: frei, freundlich, sicher.', 'Hier, Trinkgeld aus der Spendenbüchse. Und jetzt geh ruhig selber eine Runde drehen.'],
      after: ['Päckchen gibt es bei mir immer gratis. Nimm zwei.', 'Ein Nein ist hier ein ganzer Satz. Merk dir das, dann wirst du gemocht.'] },
    item: { icon: '🎁', name: 'Safer-Sex-Päckchen', color: 0x3ee69a, n: 8 }, pay: [160, 240, 520],
    spots: [
      { id: 'teich', label: '🌙 Nachtbaden im Mondteich', x: 0, z: -22.6, r: 2.4, act: { k: 'do', min: 45, d: { hygiene: 22, fun: 18, social: 10, energy: -8 }, msg: 'Kaltes Wasser, warmes Lachen, niemand hat eine Badehose dabei. Der Rest bleibt am Teich. Spaß +18', adult: true } },
      { id: 'duene', label: '🌙 Hinter die Düne gehen', x: 18, z: 36, r: 2.6, act: { k: 'do', min: 60, d: { fun: 24, social: 16, energy: -12, hygiene: -14 }, msg: 'Ein Nicken, ein Lächeln, ihr verschwindet hinter der Düne. Mit Gummi, versteht sich. Spaß +24', adult: true } },
      { id: 'bank', label: '🪑 Auf der Bank flirten', x: -6, z: -17.6, r: 2, act: { k: 'do', min: 30, d: { social: 18, fun: 8 }, msg: 'Ihr redet eine halbe Stunde über alles und nichts. Nummern getauscht. Kontakte +18' } },
      { id: 'parkplatz', label: '🚗 Am Parkplatz Blicke tauschen', x: -14, z: 30, r: 2.2, act: { k: 'do', min: 40, d: { fun: 20, social: 12, energy: -8 }, msg: 'Lichthupe, Lächeln, eine beschlagene Scheibe. Mehr wird nicht verraten. Spaß +20', adult: true } },
    ],
    folk: [
      { name: 'Der Stille', rb: 'Male_Adult_04', x: -9, z: -19, anim: 'idle', color: '#9fb6ff', lines: ['…', 'Schöne Nacht.', 'Du bist neu hier. Das sieht man. Nicht schlimm.'] },
      { name: 'Ledermann Lutz', rb: 'Security_Male_01', x: 11, z: 3, anim: 'talk', color: '#ff7a3b', lines: ['Früher gab es das nur draußen im Wald. Heute gibt es Apps. Ich bleibe beim Wald.', 'Regel eins: fragen. Regel zwei: Antwort akzeptieren.'] },
      { name: 'Timo und Deniz', rb: 'Male_Adult_01', x: 6, z: 33, anim: 'talk', color: '#ffd23b', lines: ['Wir haben uns genau hier kennengelernt. Jetzt kommen wir zum Jahrestag her.', 'Das Dampfbad hat den besten Aufguss weit und breit, ehrlich.'] },
      { name: 'Kalle', rb: 'Male_Adult_06', x: -11, z: 32, anim: 'idle', color: '#b56bff', lines: ['Ich gucke nur. Sage ich seit zehn Jahren.', 'Bruno ist ein Schatz. Ohne den wäre hier nur halb so viel los.'] },
    ],
    build(k) {
      const bark = k.M(0x3a2a20, .95), leaf = [k.M(0x1f4a2c, .95), k.M(0x275c36, .95), k.M(0x183a24, .95)];
      for (let i = 0; i < 80; i++) {
        const [x, z] = any(k, 8, 49), h = 4 + k.rnd() * 4;
        if (!k.free(x, z, 1.6) || (Math.abs(x) < 3.4 && z > 0) || Math.hypot(x, z + 28) < 8 || (x < -8 && x > -20 && z > 26 && z < 36) || (Math.abs(x) < 9 && z > 0 && z < 15)) continue;
        k.cyl(.18, .28, h, bark, x, h / 2, z, 7); k.cyl(0, 1.9, 3.2, leaf[i % 3], x, h + .6, z, 8); k.cyl(0, 1.5, 2.6, leaf[(i + 1) % 3], x, h + 2.2, z, 8); k.solid(x, z, .45);
      }
      // Büsche und Dünen
      for (let i = 0; i < 40; i++) { const [x, z] = any(k, 6, 49); if (!k.free(x, z, 1.4) || (Math.abs(x) < 3 && z > 0)) continue; k.ball(.9 + k.rnd() * .8, leaf[i % 3], x, .4, z, 1.3, .8, 1); }
      for (let i = 0; i < 7; i++) { const x = 9 + k.rnd() * 24, z = 30 + k.rnd() * 14, r = 3 + k.rnd() * 3; if (Math.hypot(x, z) > 49) continue; k.ball(r, k.M(0x6f6650, 1), x, -r * .5, z, 1.5, .8, 1.1); }
      // Trampelpfad vom Tor und Laternen
      const path = k.M(0x5a4f44, 1), lamp = k.G(0xffd9a0, 1.5), pole = k.M(0x20202a, .5, .5);
      for (let i = 0; i < 6; i++) k.box(2.4, .05, 3, path, Math.sin(i * .9) * .6, .03, 40 - i * 2.8, Math.cos(i * .55) * .3);
      for (const [x, z] of [[3.5, 36], [-3.5, 29], [-8, -18], [8, -18], [0, -38], [-13, 37], [15, 31], [-11, 0], [11, 12]]) { k.cyl(.06, .08, 3.4, pole, x, 1.7, z, 6); k.ball(.24, lamp, x, 3.5, z); k.cyl(1.6, 1.6, .02, k.G(0xffd9a0, .5, .22), x, .1, z, 16); k.solid(x, z, .2); }
      // Mondteich im Norden
      k.cyl(6, 6, .06, k.G(0x2a5a9a, .6), 0, .05, -29, 28); k.cyl(6.6, 6.6, .04, k.M(0x4a4436, 1), 0, .03, -29, 28); k.ball(.9, k.G(0xf4f0d8, 1.4), 9, 15, -40);
      for (let i = 0; i < 5; i++) k.ball(.5 + k.rnd() * .4, k.M(0x55524a, .9), Math.sin(i * 1.3) * 6.4, .2, -29 + Math.cos(i * 1.3) * 6.4, 1.3, .7, 1);
      // Brunos Stand auf dem Platz
      k.box(3, 1, 1.2, k.M(0x3ee69a, .5), -3.4, .55, 8.2); k.box(3.4, .12, 1.6, k.M(0xffffff, .5), -3.4, 2.5, 8.2); for (const sx of [-1, 1]) k.cyl(.05, .05, 2.5, pole, -3.4 + sx * 1.5, 1.25, 8.2, 6);
      k.sign('SAFER SEX GRATIS', '#3ee69a', -3.4, 2.05, 8.84, 0, 3); k.solid(-3.4, 8.2, 1.5);
      // Bänke
      const wood = k.M(0x6a4428, .8);
      for (const [x, z, ry] of [[-6, -19, 0], [7, -20, .6], [-13, 34, 1.4], [8, 2, 0], [-8, 13, 0]]) { k.box(2, .12, .55, wood, x, .58, z, ry); k.box(2, .5, .1, wood, x, .93, z - .25, ry); k.solid(x, z, .8); }
      // Parkplatz: Kiesfläche (die Autos stellt der Ortskern)
      k.box(11, .04, 9, k.M(0x4a4640, 1), -14, .03, 31);
      // Glühwürmchen
      for (let i = 0; i < 50; i++) { const [x, z] = any(k, 6, 48); k.ball(.05, k.G(0xe8ff9a, 1.6), x, .6 + k.rnd() * 3, z); }
    },
  },
  {
    id: 'lindenhof', name: 'Lindenhof', icon: '🍂', sub: 'Ehemaligentreffen in der Kleinstadt: erste Liebe, zweiter Versuch',
    sky: ['#6fb4ff', '#ffe9c8'], ground: 0x7fbf6a, water: 0x4aa3d8, light: 0xfff2dc, r: 52, music: 'city',
    town: { tint: [[1.8, .95, .75], [1.9, 1.7, 1.3], [1.25, 1.4, 1.15], [1.7, 1.25, .85], [1.1, 1.3, 1.7]], plaza: 0xd6cab4,
      shops: [['EISCAFÉ LINDE', '#ff9ad5', 'cafe'], ['BUCHHANDLUNG', '#ffe9a8', 'books'], ['KINO CAPITOL', '#ff9a6a', 'kino'], ['TANZSCHULE', '#c99aff', 'tanzschule'], ['PIZZERIA', '#ffb347', 'pizza'], ['SPORTHALLE', '#9af0c0', 'gym'], ['KIOSK', '#7fd4ff', 'spaeti'], ['GALERIE', '#ffffff', 'galerie']] },
    job: { icon: '💐', name: 'Blumen für alle', text: 'Der Förderverein schickt jedem Haus einen Strauß. Liefere sie aus, bevor sie welken.' },
    host: { name: 'Frau Ahmadi', rb: 'Female_Adult_05', x: 0, z: 9, yaw: 0, anim: 'idle', color: '#ffb347',
      intro: ['Da bist du ja! Zehn Jahre nach dem Abschluss, und du siehst aus wie am letzten Schultag. Fast.', 'Ich war eure Kunstlehrerin, falls du es verdrängt hast. Heute ist Ehemaligentreffen.', 'Damals habt ihr euch Zettel geschrieben, die nie angekommen sind. Ich habe sie aufgehoben. Der Wind leider nicht.'],
      ask1: 'Such die acht Liebesbriefe von damals. Sie liegen auf dem Marktplatz, am Sportplatz und irgendwo über den Dächern.',
      ask2: 'Und jetzt das, was ihr euch früher nie getraut habt: einmal durch die Stadt fliegen. Nimm alle Ringe über der Ringstraße.',
      ask3: 'Jetzt verteil die Briefe. Sprich mit allen auf dem Treffen, jeder bekommt seinen. Dann komm wieder zu mir.',
      finale: ['Alle Briefe sind bei den Richtigen angekommen. Zehn Jahre zu spät, aber angekommen.', 'Schau mal rüber. Jonas und Emre halten Händchen. Mitten auf dem Marktplatz! Das hätte es früher nicht gegeben.', 'Für dich gibt es den Ehrenpreis des Fördervereins. Und eine Eins in Mut.'],
      after: ['Nächstes Jahr wieder, ja? Ich backe den Kuchen.', 'Manche Dinge brauchen zehn Jahre. Das ist keine Schande.'] },
    item: { icon: '💌', name: 'Liebesbriefe', color: 0xff6a8a, n: 8 }, pay: [150, 220, 480],
    spots: [
      { id: 'kuchen', label: '🍰 Kuchenbuffet', x: 9, z: 5.2, r: 2, act: { k: 'do', cost: 3, min: 20, d: { hunger: 26, social: 8 }, msg: 'Marmorkuchen wie früher in der großen Pause. Hunger gestillt.' } },
      { id: 'platz', label: '⚽ Kicken wie früher', x: -18, z: 36, r: 3, act: { k: 'do', min: 45, d: { fun: 20, energy: -14, hygiene: -10, social: 10 }, msg: 'Diesmal wirst du nicht als Letzte*r gewählt. Spaß +20' } },
      { id: 'tt', label: '🏓 Tischtennis-Rundlauf', x: 10, z: 12.6, r: 2, act: { k: 'do', min: 25, d: { fun: 14, social: 10, energy: -6 }, msg: 'Rundlauf wie in der großen Pause. Du fliegst als Dritte*r raus und lachst trotzdem. Spaß +14' } },
      { id: 'bank', label: '🪑 Auf der alten Schulbank sitzen', x: -8, z: 3.2, r: 1.8, act: { k: 'do', min: 20, d: { energy: 10, social: 6 }, msg: 'In die Lehne ist ein Herz geritzt. Die Buchstaben darin kennst du. Energie +10' } },
    ],
    folk: [
      { name: 'Jonas', rb: 'Male_Adult_09', x: -5, z: -2.6, anim: 'talk', color: '#5ce1ff', lines: ['Ich saß sechs Jahre neben Emre und habe kein Wort rausgebracht.', 'Heute frage ich ihn. Wirklich. Gleich. Nach dem Kuchen.'] },
      { name: 'Emre', rb: 'Male_Adult_03', x: -3.6, z: -3, yaw: -1.2, anim: 'idle', color: '#ffd23b', lines: ['Jonas hat mir in der Neunten einen Stift geliehen. Ich habe ihn noch.', 'Meinst du, er merkt, dass ich seit einer Stunde neben ihm stehe?'] },
      { name: 'Svenja', rb: 'Female_Adult_02', x: 7, z: -1, anim: 'cheer', color: '#ff6ad5', lines: ['Ich war die Erste an der Schule, die sich geoutet hat. Es war die Hölle. Heute hängt hier eine Regenbogenfahne.', 'Meine Frau findet das Schulklo immer noch gruselig.'] },
      { name: 'Hausmeister Kowalski', rb: 'Male_Adult_06', x: 10.5, z: -20, anim: 'idle', color: '#b9c0c8', lines: ['Ich habe alles gesehen. Ich sage nichts. So bleibt man vierzig Jahre Hausmeister.', 'Über die Stadt fliegen ist verboten. Ich schaue heute woandershin.'] },
    ],
    build(k) {
      const brick = k.M(0xa5553f, .9), stone = k.M(0xe7dcc8, .8), roof = k.M(0x4a4f5a, .8), glass = k.G(0xbfe6ff, .8);
      // Schulgebäude mit Uhrturm im Norden
      k.box(27, 8, 9, brick, 0, 4, -31); k.box(28, .6, 10, stone, 0, 8.3, -31); k.box(8, 12, 9.4, brick, 0, 6, -31); k.cyl(0, 6.2, 3.4, roof, 0, 13.7, -31, 4).rotation.y = Math.PI / 4;
      k.cyl(1.2, 1.2, .2, stone, 0, 10, -26.2, 20).rotation.x = Math.PI / 2;
      for (let x = -12; x <= 12; x += 3) { if (Math.abs(x) < 4) continue; for (const y of [2.2, 5.8]) k.box(1.6, 2, .12, glass, x, y, -26.46); }
      k.box(2.6, 3.4, .14, k.M(0x3a5f8a, .5), 0, 1.7, -26.26); k.sign('LINDENHOF', '#ffe9a8', 0, 5.2, -26.2, 0, 6);
      for (let x = -10; x <= 10; x += 5) k.solid(x, -31, 5);
      // Regenbogenfahne am Mast
      k.cyl(.07, .07, 9, k.M(0xd8d8e0, .3, .7), 8, 4.5, -22, 6); RAINBOW.forEach((c, i) => k.box(2.4, .3, .04, k.M(c, .6), 9.25, 8.6 - i * .3, -22)); k.solid(8, -22, .3);
      // Linden im Herbst: Allee auf dem Marktplatz, Stadtpark im Süden, hinter den Häusern
      const herbst = [0xe8912a, 0xd9542a, 0xf0c13a, 0xb8482a];
      const linde = (x: number, z: number, i: number) => { const h = 3 + k.rnd() * 2; k.cyl(.2, .3, h, k.M(0x5a3d28, .9), x, h / 2, z, 7); k.ball(2 + k.rnd(), k.M(herbst[i % 4], .95), x, h + 1.4, z, 1, .85, 1); k.solid(x, z, .5); };
      [[-13, -3], [-13, 5], [-13, 13], [13, -3], [13, 5.4], [13, 13]].forEach(([x, z], i) => linde(x, z, i));
      for (let i = 0; i < 44; i++) { const [x, z] = any(k, 27, 49); if (!k.free(x, z, 1.8) || (z < -18 && Math.abs(x) < 16) || (x < -7 && x > -29 && z > 29 && z < 43) || (Math.abs(x) < 4 && z > 0)) continue; linde(x, z, i); }
      for (let i = 0; i < 70; i++) { const [x, z] = any(k, 0, 48); if (!k.free(x, z, .2)) continue; k.box(.3, .02, .2, k.M(herbst[i % 4], .9), x, .1, z, k.rnd() * 3); }
      // Sportplatz mit Toren im Südwesten
      k.box(18, .04, 10, k.M(0x5aa64a, 1), -18, .03, 36); const line = k.M(0xffffff, .8);
      k.box(18, .05, .12, line, -18, .05, 31); k.box(18, .05, .12, line, -18, .05, 41); k.box(.12, .05, 10, line, -18, .05, 36); k.box(.12, .05, 10, line, -27, .05, 36); k.box(.12, .05, 10, line, -9, .05, 36);
      for (const gx of [-26.6, -9.4]) { for (const gz of [34, 38]) k.cyl(.07, .07, 2.2, line, gx, 1.1, gz, 6); k.box(.1, .1, 4.1, line, gx, 2.2, 36); }
      // Marktplatz: Bänke, Tischtennisplatte, Kuchenbuffet, Banner, Fahrradständer vor der Schule
      const wood = k.M(0x8a5a35, .8);
      for (const [x, z] of [[-8, 2], [-8, 12], [5, 13.6]]) { k.box(2.2, .12, .6, wood, x, .58, z); k.box(.12, .5, .5, wood, x - .9, .33, z); k.box(.12, .5, .5, wood, x + .9, .33, z); k.solid(x, z, .9); }
      for (let i = 0; i < 6; i++) k.arc(.45, .03, k.M(0xb9c0c8, .3, .8), -11 + i * .7, 0, -19, Math.PI / 2);
      k.box(2.7, .08, 1.5, k.M(0x2a6f5a, .6), 10, .86, 11); k.box(.04, .2, 1.5, line, 10, .98, 11); for (const sx of [-1, 1]) k.box(.1, .78, 1.2, k.M(0x33333a, .6), 10 + sx, .47, 11); k.solid(10, 11, 1.2);
      k.box(3.4, .9, 1, k.M(0xffffff, .7), 9, .53, 3.6); for (let i = 0; i < 4; i++) k.cyl(.3, .3, .16, k.M([0x8a5a35, 0xffd9a0, 0xff9ad5, 0xffffff][i], .7), 7.8 + i * .8, 1.06, 3.6, 14); k.solid(9, 3.6, 1.5);
      k.sign('10 JAHRE ABSCHLUSS', '#ffffff', 0, 3.6, 2, 0, 7); for (const sx of [-1, 1]) { k.cyl(.06, .06, 3.2, k.M(0xd8d8e0, .3, .7), sx * 3.8, 1.6, 2, 6); k.solid(sx * 3.8, 2, .2); }
    },
  },
  {
    id: 'rummel', name: 'Sternwerder Rummel', icon: '🎡', sub: 'Sommerrummel in der Stadt am See: Riesenrad, Zuckerwatte und der Mut zur ersten Frage',
    sky: ['#2b2f7a', '#ff9a6b'], ground: 0x6f8a6a, water: 0x2a4f8a, light: 0xffe0c8, r: 52, music: 'show', dim: .8,
    town: { tint: CITY_TINT, plaza: 0x9a94a6,
      shops: [['SPIELHALLE', '#8a6bff', 'arcade'], ['KARAOKE', '#ff7bd5', 'karaoke'], ['RAMEN', '#ffb070', 'ramen'], ['DINER', '#5ce1ff', 'diner'], ['KIOSK', '#ffd23b', 'spaeti'], ['EISDIELE', '#ff9ad5', 'cafe'], ['FOTOSTUDIO', '#c99aff', 'studio'], ['PIZZA', '#ffb347', 'pizza']] },
    job: { icon: '🧸', name: 'Hauptgewinn-Bote', text: 'Die Losbude hat lauter Hauptgewinne zu verteilen. Bring die Plüscheinhörner zu den Gewinnern.' },
    host: { name: 'Mika', rb: 'Male_Adult_10', x: 0, z: 9, yaw: 0, anim: 'idle', color: '#5ce1ff',
      intro: ['Hey. Du kommst wie gerufen. Ich arbeite am Riesenrad und habe ein Problem.', 'Seit drei Wochen kauft Ben jeden Abend eine Fahrkarte und fährt allein. Ich würde so gern mitfahren.', 'Ich habe mir geschworen: Wenn ich alle Fahrchips zusammenhabe, frage ich ihn. Dann sind sie mir aus der Tasche gefallen. Alle.'],
      ask1: 'Hilf mir, die acht Fahrchips zu finden. Sie liegen zwischen den Buden und am See, ein paar hat der Wind hoch über die Dächer geweht.',
      ask2: 'Jetzt brauche ich noch ein Zeichen. Flieg durch die Ringe über der Ringstraße, das ist mein Feuerwerk.',
      ask3: 'Ich traue mich fast. Frag du erst mal herum, was die anderen meinen. Vor allem Ben. Dann komm zurück.',
      finale: ['Ich habe ihn gefragt. Er hat Ja gesagt, bevor ich fertig war.', 'Wir fahren gleich die letzte Runde. Ganz oben hält das Rad immer kurz an. Du weißt schon.', 'Das hier ist für dich. Ohne dich würde ich immer noch Chips zählen.'],
      after: ['Ben und ich haben jetzt eine Dauerkarte.', 'Ganz oben sieht man bis nach Rainbow City. Fahr mal mit.'] },
    item: { icon: '🎟️', name: 'Fahrchips', color: 0xffd23b, n: 8 }, pay: [150, 220, 480],
    spots: [
      { id: 'rad', label: '🎡 Riesenrad fahren', x: 0, z: -19.4, r: 2.6, act: { k: 'do', cost: 5, min: 20, d: { fun: 26, social: 6 }, msg: 'Ganz oben hält das Rad kurz an. Die Lichter, der See, die Stadt in der Ferne. Spaß +26' } },
      { id: 'watte', label: '🍭 Zuckerwatte', x: 9.4, z: 0, r: 1.9, act: { k: 'do', cost: 3, min: 10, d: { hunger: 12, fun: 8 }, msg: 'Rosa, klebrig, perfekt. Hunger +12' } },
      { id: 'dosen', label: '🥫 Dosenwerfen', x: -9.4, z: 0, r: 1.9, act: { k: 'do', cost: 2, min: 15, d: { fun: 16 }, msg: 'Neun von zehn Dosen. Du gewinnst ein Regenbogen-Einhorn aus Plüsch. Spaß +16' } },
      { id: 'scooter', label: '🚗 Autoscooter', x: 10.4, z: 36, r: 2.2, act: { k: 'do', cost: 4, min: 15, d: { fun: 20, social: 8, energy: -5 }, msg: 'Du wirst dreimal gerammt und rammst viermal zurück. Alle lachen. Spaß +20' } },
      { id: 'karussell', label: '🎠 Karussell', x: -16, z: 30.6, r: 2.2, act: { k: 'do', cost: 3, min: 10, d: { fun: 14 }, msg: 'Du nimmst das Einhorn, was sonst. Spaß +14' } },
    ],
    folk: [
      { name: 'Ben', rb: 'Male_Adult_07', x: 4.5, z: -19.6, anim: 'idle', color: '#ffd23b', lines: ['Ich fahre jeden Abend. Die Aussicht ist schön. Ja, die Aussicht.', 'Meinst du, der Typ vom Riesenrad heißt Mika? Auf seinem Schild steht Mika.'] },
      { name: 'Oma Gerda', rb: 'Female_Adult_06', x: -5, z: 5, anim: 'cheer', color: '#ff9ad5', lines: ['Mein Enkel hat mir seinen Freund vorgestellt. Ich habe gesagt: Endlich einer, der Skat kann.', 'Früher hätten die zwei sich das nicht getraut. Gut, dass früher vorbei ist.'] },
      { name: 'Leyla', rb: 'Female_Adult_09', x: 7, z: 33, anim: 'dance1', color: '#b56bff', lines: ['Ich habe meine Freundin auf dem Autoscooter kennengelernt. Sie hat mich gerammt.', 'Die Zuckerwatte ist heute doppelt so groß. Sagt nichts dem Chef.'] },
      { name: 'Budenchef Paule', rb: 'Male_Adult_05', x: -9.6, z: 1.8, yaw: Math.PI / 2, anim: 'talk', color: '#ff7a3b', lines: ['Drei Wurf, zwei Euro. Für Verliebte gratis, aber das sage ich keinem.', 'Der Mika guckt seit Wochen nur auf Gondel sieben. Ich bin nicht blind.'] },
    ],
    build(k) {
      const steel = k.M(0xd8dde6, .3, .8), RB = RAINBOW, FZ = -25;
      // Riesenrad im Norden
      const hub = 12.5, R = 10.5;
      for (const dz of [-.7, .7]) k.arc(R, .14, steel, 0, hub, FZ + dz);
      for (let i = 0; i < 12; i++) {
        const a = i / 12 * Math.PI * 2, x = Math.sin(a) * R, y = hub + Math.cos(a) * R;
        const sp = k.box(.1, R, .1, steel, Math.sin(a) * R / 2, hub + Math.cos(a) * R / 2, FZ); sp.rotation.z = -a;
        k.box(1.5, 1.3, 1.5, k.M(RB[i % 6], .5), x, y - .9, FZ); k.box(1.7, .12, 1.7, k.M(0xffffff, .5), x, y - .2, FZ); k.ball(.16, k.G(RB[(i + 3) % 6], 1.5), x, y, FZ + .9);
      }
      for (const sx of [-1, 1]) for (const dz of [-1.6, 1.6]) { const leg = k.box(.3, 14, .3, steel, sx * 3.4, 6.3, FZ + dz); leg.rotation.z = sx * .27; }
      k.cyl(.5, .5, 3.6, steel, 0, hub, FZ, 12).rotation.x = Math.PI / 2; k.box(8, .5, 5, k.M(0x3a3f4a, .7), 0, .25, FZ); k.sign('RIESENRAD', '#ffd23b', 0, 2.2, FZ + 2.6, 0, 6);
      for (const x of [-3, 0, 3]) k.solid(x, FZ, 2.6);
      // Buden: vier auf dem Platz, zwei neben dem Riesenrad
      const booth = (x: number, z: number, c: number, name: string, col2: string, ry: number) => {
        const fx = Math.sin(ry), fz = Math.cos(ry);
        k.box(4, 2.6, 3, k.M(0xfffaf0, .8), x, 1.4, z, ry); k.cyl(0, 3.2, 1.6, k.M(c, .6), x, 3.5, z, 4).rotation.y = Math.PI / 4; k.box(4.2, .9, .3, k.M(c, .6), x + fx * 1.6, .55, z + fz * 1.6, ry);
        k.sign(name, col2, x + fx * 1.56, 2.3, z + fz * 1.56, ry, 3.4); for (let i = 0; i < 5; i++) k.ball(.12, k.G(RB[i], 1.5), x + fx * 1.62 + fz * (i * .8 - 1.6), 2.85, z + fz * 1.62 - fx * (i * .8 - 1.6)); k.solid(x, z, 2.2);
      };
      booth(-12, 0, 0xff3b6b, 'DOSENWERFEN', '#ff8aa0', Math.PI / 2); booth(12, 0, 0xff9ad5, 'ZUCKERWATTE', '#ff9ad5', -Math.PI / 2); booth(-12, 11, 0x3a7bff, 'LOSE', '#7fb0ff', Math.PI / 2); booth(12, 11, 0xffd23b, 'WAFFELN', '#ffd23b', -Math.PI / 2);
      booth(-10.5, -19.4, 0x3ee69a, 'ENTENANGELN', '#3ee69a', 0); booth(10.5, -19.4, 0xb56bff, 'FOTOBOX', '#c99aff', 0);
      // Karussell im Südwesten
      k.cyl(4.2, 4.2, .4, k.M(0xff4fa3, .5), -16, .2, 36, 20); k.cyl(0, 4.8, 2.2, k.M(0xffd23b, .5), -16, 5.3, 36, 12); k.cyl(.3, .3, 4.4, steel, -16, 2.4, 36, 10);
      for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28; k.cyl(.04, .04, 3.8, steel, -16 + Math.sin(a) * 3.2, 2.3, 36 + Math.cos(a) * 3.2, 6); k.ball(.5, k.M(RB[i % 6], .5), -16 + Math.sin(a) * 3.2, 1.3, 36 + Math.cos(a) * 3.2, .7, .9, 1.3); }
      k.solid(-16, 36, 4.6);
      // Autoscooter im Südosten
      k.box(10, .3, 8, k.M(0x2a2f3a, .4, .4), 16, .15, 36); k.box(10.6, .3, 8.6, k.M(0xff3b6b, .5), 16, 4.4, 36); for (const sx of [-1, 1]) for (const sz of [-1, 1]) k.cyl(.14, .14, 4.4, steel, 16 + sx * 4.8, 2.2, 36 + sz * 3.8, 8);
      for (let i = 0; i < 6; i++) { const x = 13 + (i % 3) * 3, z = 34.4 + Math.floor(i / 3) * 3.2; k.ball(.7, k.M(RB[i], .35, .3), x, .7, z, 1, .6, 1.4); k.cyl(.03, .03, 3.4, steel, x, 2.5, z - .7, 5); }
      k.sign('AUTOSCOOTER', '#ff8aa0', 10.66, 3.9, 36, -Math.PI / 2, 6); for (let i = 0; i < 9; i++) k.ball(.13, k.G(RB[i % 6], 1.6), 10.7, 4.75, 32.4 + i * .9);
      k.solid(18, 34, 3.4); k.solid(18, 38, 3.4);
      // Lichterketten über dem Platz und über dem Weg vom Tor
      for (let i = 0; i < 4; i++) { const z = -4 + i * 6; for (const sx of [-1, 1]) k.cyl(.06, .06, 5.6, k.M(0x33333a, .5), sx * 14.4, 2.8, z, 6); for (let j = 0; j < 12; j++) k.ball(.13, k.G(RB[(i + j) % 6], 1.6), -14.4 + j * 2.62, 5.5 - Math.sin(j / 11 * Math.PI) * 1, z); }
      for (let i = 0; i < 3; i++) { const z = 28 + i * 5; for (const sx of [-1, 1]) { k.cyl(.06, .06, 5, k.M(0x33333a, .5), sx * 4.6, 2.5, z, 6); k.solid(sx * 4.6, z, .2); } for (let j = 0; j < 7; j++) k.ball(.13, k.G(RB[(i + j) % 6], 1.6), -4.6 + j * 1.53, 4.9 - Math.sin(j / 6 * Math.PI) * .6, z); }
      // Bäume am Ufer und hinter den Häusern
      for (let i = 0; i < 40; i++) { const [x, z] = any(k, 28, 49); if (!k.free(x, z, 2) || (z < -14 && Math.abs(x) < 15) || (Math.abs(x) < 24 && z > 26)) continue; k.cyl(.2, .3, 3.6, k.M(0x4a3222, .9), x, 1.8, z, 7); k.ball(2.2, k.M(0x2f6f4a, .95), x, 4.6, z, 1, .9, 1); k.solid(x, z, .5); }
    },
  },
];

export const worldDef = (id: string) => WORLDS.find((w) => w.id === id);
/* Wege zwischen Hauptstadt und Welten: am Kai von Rainbow City steht je Welt ein Tor (durchlaufen, durchfahren),
   draußen vor der Küste liegt je Welt eine Insel mit Leuchtsäule (hinfliegen). Die Welten selbst bilden einen Ring. */
export const cityGate = (id: string) => ({ x: -88.6, z: 2 + Math.max(0, WORLDS.findIndex((w) => w.id === id)) * 4.5 });
export const cityIsle = (id: string) => ({ x: -152, z: -56 + Math.max(0, WORLDS.findIndex((w) => w.id === id)) * 28 });
/** Nachbarwelt im Ring (dir −1 Westen, +1 Osten); ohne 18+ wird die Cruising-Welt übersprungen */
export function neighbour(id: string, dir: 1 | -1, adult: boolean) {
  const l = WORLDS.filter((w) => adult || !w.adult || w.id === id), i = l.findIndex((w) => w.id === id);
  return l[(i + dir + l.length) % l.length];
}
/** Stand der Geschichte einer Welt: 0 neu, 1 sammeln, 2 Ringe, 3 Botengang und Finale offen, 4 geschafft */
export const worldStage = (flags: Record<string, unknown>, id: string) => Number(flags['w_' + id]) || 0;
