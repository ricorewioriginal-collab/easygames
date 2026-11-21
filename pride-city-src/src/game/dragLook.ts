/* Drag-Look am Schminkspiegel: Kleid, Schnitt, Beine und Perücke werden zu einem Szene-Look aus queer.ts zusammengesetzt
   (gemalt auf die eigene Figur, wie die Looks der Stadt). Jedes Teil gehört zu einer Kategorie; passt der Look zur
   Kategorie eines Lip-Sync-Battles, singt man leichter gegen die Rivalin an. Reine Daten, ohne Szene (auch für Actor.ts). */
import { STYLES } from './queer';

export type Cat = 'glitzer' | 'retro' | 'neon' | 'regenbogen' | 'royal';
export const CATS: Record<Cat, { name: string; icon: string }> = {
  glitzer: { name: 'Pailletten-Nacht', icon: '✨' },
  retro: { name: 'Diven von damals', icon: '🎞️' },
  neon: { name: 'Neon-Futur', icon: '💡' },
  regenbogen: { name: 'Regenbogen-Revue', icon: '🌈' },
  royal: { name: 'Königlicher Auftritt', icon: '👑' },
};
export interface Piece { id: string; name: string; cat: Cat; c?: number; flag?: string; glitter?: boolean }
export const KLEID: Piece[] = [
  { id: 'pink', name: 'Pailletten in Pink', cat: 'glitzer', c: 0xff2fd2 },
  { id: 'chrom', name: 'Silber-Chrom', cat: 'retro', c: 0xd8dde6 },
  { id: 'tuerkis', name: 'Neon-Türkis', cat: 'neon', c: 0x00e5d0 },
  { id: 'regenbogen', name: 'Regenbogenkleid', cat: 'regenbogen', flag: 'rainbow' },
  { id: 'gold', name: 'Goldrobe', cat: 'royal', c: 0xffc400 },
  { id: 'rot', name: 'Rote Diva', cat: 'retro', c: 0xe0102a },
];
export const SCHNITT: Piece[] = [
  { id: 'lang', name: 'Bodenlang', cat: 'royal' },
  { id: 'crop', name: 'Bauchfrei', cat: 'neon' },
];
export const BEINE: Piece[] = [
  { id: 'pink', name: 'Glitzer-Strumpfhose', cat: 'glitzer', c: 0xff2fd2, glitter: true },
  { id: 'netz', name: 'Schwarze Netzstrümpfe', cat: 'retro', c: 0x15151a },
  { id: 'tuerkis', name: 'Türkis-Glitzer', cat: 'neon', c: 0x00e5d0, glitter: true },
  { id: 'lila', name: 'Lila Lack', cat: 'regenbogen', c: 0x6a2bd8 },
  { id: 'gold', name: 'Gold-Leggings', cat: 'royal', c: 0xffc400, glitter: true },
];
export const PERUECKE: Piece[] = [
  { id: 'pink', name: 'Zuckerwatte-Pink', cat: 'glitzer', c: 0xff4fb0 },
  { id: 'platin', name: 'Platin-Toupet', cat: 'retro', c: 0xf3e6b0 },
  { id: 'tuerkis', name: 'Neon-Mähne', cat: 'neon', c: 0x3ee6c8 },
  { id: 'lila', name: 'Lila Locken', cat: 'regenbogen', c: 0xb57bff },
  { id: 'rot', name: 'Feuerrot', cat: 'royal', c: 0xff3b1f },
];
export const PARTS = [['kleid', '👗 Kleid', KLEID], ['schnitt', '✂️ Schnitt', SCHNITT], ['beine', '🦵 Beine', BEINE], ['peruecke', '💇 Perücke', PERUECKE]] as const;
export type PartKey = typeof PARTS[number][0];
export type DragLook = Record<PartKey, string>;
const DEF: DragLook = { kleid: 'pink', schnitt: 'lang', beine: 'pink', peruecke: 'pink' };

/** Echte Drag-Geschichte zu jedem Sieg (ergänzt die „Damals“-Karten der Story und die Wissen-App, nichts doppelt; Flag dwiss_<key>) */
export const DRAG_HISTORY: Record<string, { year: string; title: string; text: string }> = {
  sarria: { year: '1961', title: 'José Sarria, die Nelly Queen', text: 'Im Black Cat Café in San Francisco singt José Sarria in Drag Opern-Parodien und lässt das Publikum am Ende „God Save Us Nelly Queens“ singen. 1961 kandidiert Sarria für den Stadtrat, als erste offen schwule Person, die in den USA für ein öffentliches Amt antritt.' },
  mahlsdorf: { year: '1928 bis 2002', title: 'Charlotte von Mahlsdorf', text: 'Charlotte von Mahlsdorf lebt in Frauenkleidern durch die NS-Zeit und die DDR. In Berlin gründet sie das Gründerzeitmuseum und rettet dort die Einrichtung der Mulackritze, einer berühmten Kneipe der Szene. 1992 bekommt sie das Bundesverdienstkreuz.' },
  divine: { year: '1972', title: 'Divine', text: 'Harris Glenn Milstead wird als Divine zum Kultstar: Im Film „Pink Flamingos“ von John Waters spielt die Drag-Ikone 1972 „die schmutzigste Person der Welt“. Später singt Divine Disco-Hits wie „You Think You’re a Man“.' },
  conchita: { year: '10. Mai 2014', title: 'Rise Like a Phoenix', text: 'Conchita Wurst gewinnt in Kopenhagen den Eurovision Song Contest für Österreich. Mit Bart und Abendkleid wird sie zum Gesicht für Toleranz in ganz Europa.' },
  race: { year: 'seit 2009', title: 'Lip-Sync for Your Life', text: 'Seit 2009 läuft „RuPaul’s Drag Race“. Die Show macht Lip-Sync-Battles weltweit bekannt und gewinnt viele Emmys. Drag ist damit endgültig aus den Kellerclubs auf die großen Bühnen gekommen.' },
};

type Flags = Record<string, unknown>;
export function lookOf(f: Flags): DragLook {
  const v = String(f.dragLook || '').split(','), out = { ...DEF };
  PARTS.forEach(([k, , list], i) => { if (list.some((p) => p.id === v[i])) out[k] = v[i]; });
  return out;
}
/** Speicherform im Spielstand (flags.dragLook): Teile mit Komma */
export const lookKey = (l: DragLook) => PARTS.map(([k]) => l[k]).join(',');
export const piece = (k: PartKey, id: string): Piece => { const list = PARTS.find((p) => p[0] === k)![2]; return list.find((p) => p.id === id) || list[0]; };
/** Wie viele der vier Teile passen zur Kategorie (0–4) */
export const match = (l: DragLook, cat: Cat) => PARTS.filter(([k]) => piece(k, l[k]).cat === cat).length;

/** Look als Szene-Look registrieren (Schlüssel aus den Teilen, damit der Bild-Zwischenspeicher passt) */
export function dragStyle(l: DragLook): string {
  const id = `drag_${l.kleid}_${l.schnitt}_${l.beine}_${l.peruecke}`;
  if (!STYLES[id]) {
    const k = piece('kleid', l.kleid), crop = l.schnitt === 'crop', b = piece('beine', l.beine);
    STYLES[id] = { name: 'Drag-Look', top: k.flag ? { flag: k.flag, crop } : { glitter: k.c!, crop }, legs: b.glitter ? { glitter: b.c! } : b.c, hair: piece('peruecke', l.peruecke).c };
  }
  return id;
}
/** Szene-Look der Spielfigur, wenn sie im Drag-Look unterwegs ist (sonst undefined) */
export const playerDrag = (f: Flags) => (f.dragOn ? dragStyle(lookOf(f)) : undefined);
