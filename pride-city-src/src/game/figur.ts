/* Fitness und Körper: Training in der Muckibude baut Muskeln auf, die man an der Figur sieht (Oberarme, Brust,
   Oberschenkel, figur3d.ts). Wer eine Weile nicht trainiert, baut langsam wieder ab. Dazu Tattoos und Piercings im
   Studio „Tinte & Stolz“ in der Boutique und der Barbier-Stuhl für Bärte. Alles bleibt im Spielstand (flags). */
import type { SaveData } from '../engine/Save';
import { pcEvents } from './hooks';

/** Was die Figur trägt: Muskeln 0 … 1, Tattoos, Piercings, Bart (Stil:Farbe) */
export interface Fig { m: number; tat?: string[]; pier?: string[]; beard?: string }

export const MUS_START = 20;
const num = (v: unknown, d = 0) => (typeof v === 'number' && isFinite(v) ? v : d);
/** Muskeln heute: nach drei Tagen ohne Training 1,5 Punkte am Tag weniger (nie unter den Start) */
export function muskel(s: SaveData) {
  const m = num(s.flags.mus, MUS_START), last = num(s.flags.musDay, s.day);
  return Math.round(Math.max(Math.min(m, MUS_START), m - Math.max(0, s.day - last - 3) * 1.5));
}
export const MUS_NAMES: Array<[number, string]> = [[85, 'Bodybuilder*in'], [65, 'Muskelpaket'], [45, 'Durchtrainiert'], [30, 'Sportlich'], [0, 'Normal']];
export const musName = (m: number) => MUS_NAMES.find(([n]) => m >= n)![1];

export const TRAININGS = {
  kraft: { icon: '🏋️', name: 'Krafttraining', sub: 'Hanteln, Bankdrücken, Klimmzüge', cost: 4, min: 60, gain: 6, d: { fun: 12, energy: -20, hygiene: -20, hunger: -10 } },
  coach: { icon: '🧑‍🏫', name: 'Personal Training mit Coach Mehmet', sub: 'Plan, Technik, Motivation', cost: 25, min: 90, gain: 10, d: { fun: 10, energy: -26, hygiene: -24, hunger: -14, social: 8 } },
  beine: { icon: '🦵', name: 'Beinetag', sub: 'Kniebeugen-Minispiel', cost: 0, min: 0, gain: 5, d: {} },
  lauf: { icon: '🏃', name: 'Laufband', sub: 'Ausdauer', cost: 0, min: 0, gain: 2, d: {} },
} as const;
export type Train = keyof typeof TRAININGS;
/** Zwei Einheiten am Tag zählen, danach braucht der Körper Pause */
export const SESSIONS = 2;
/** Training: liefert den Muskel-Zuwachs (0 = heute genug) */
export function train(s: SaveData, kind: Train): number {
  const t = TRAININGS[kind], m = muskel(s);
  const today = s.flags.musToday === s.day ? num(s.flags.musN) : 0;
  s.flags.mus = m; s.flags.musDay = s.day;
  if (today >= SESSIONS) return 0;
  const g = Math.max(1, Math.round(t.gain * (1 - m / 125)));
  s.flags.mus = Math.min(100, m + g); s.flags.musToday = s.day; s.flags.musN = today + 1;
  s.flags.workouts = num(s.flags.workouts) + 1;
  pcEvents.emit('training', { kind, mus: s.flags.mus as number });
  return g;
}

/* ---------- Tattoos, Piercings, Bart ---------- */
export interface Tattoo { id: string; name: string; icon: string; where: string; price: number; text: string }
export const TATTOOS: Tattoo[] = [
  { id: 'winkel', name: 'Rosa Winkel', icon: '🔺', where: 'Nacken', price: 60, text: 'Klein, rosa, im Nacken. Einst ein Zeichen der Verfolgung, heute ein Zeichen des Erinnerns und des Stolzes.' },
  { id: 'herz', name: 'Regenbogenherz', icon: '❤️', where: 'Brust', price: 90, text: 'Ein Herz in sechs Farben über dem eigenen Herzen.' },
  { id: 'anker', name: 'Hafen-Anker', icon: '⚓', where: 'linker Oberarm', price: 110, text: 'Klassisch, mit Schwalbe und Band: „Rainbow City“. Tom vom Hafen hat denselben.' },
  { id: 'pride', name: 'Schriftzug „PRIDE“', icon: '✒️', where: 'rechter Unterarm', price: 80, text: 'Fünf Buchstaben in Schreibschrift, damit du es nie vergisst.' },
  { id: 'fluegel', name: 'Regenbogenflügel', icon: '🪽', where: 'Rücken', price: 260, text: 'Zwei große Flügel zwischen den Schulterblättern, jede Feder eine Farbe. Drei Sitzungen, ein Leben lang.' },
];
export interface Piercing { id: string; name: string; icon: string; price: number }
export const PIERCINGS: Piercing[] = [
  { id: 'ohrL', name: 'Ohrring links', icon: '💫', price: 25 },
  { id: 'ohrR', name: 'Ohrring rechts', icon: '💫', price: 25 },
  { id: 'nase', name: 'Nasenring', icon: '💍', price: 35 },
  { id: 'braue', name: 'Augenbraue', icon: '✨', price: 30 },
  { id: 'lippe', name: 'Lippe', icon: '💋', price: 35 },
];
export const BEARDS: Array<{ id: string; name: string; icon: string; price: number }> = [
  { id: '', name: 'Glatt rasiert', icon: '🪒', price: 8 },
  { id: 'stoppel', name: 'Dreitagebart', icon: '🧔', price: 12 },
  { id: 'kinn', name: 'Kinnbart', icon: '🐐', price: 15 },
  { id: 'voll', name: 'Vollbart', icon: '🧔‍♂️', price: 20 },
];
export const BEARD_COLORS: Array<{ id: string; name: string; c: number }> = [
  { id: 'dunkel', name: 'Dunkel', c: 0x24160e }, { id: 'braun', name: 'Braun', c: 0x5a3820 }, { id: 'blond', name: 'Blond', c: 0xb89058 },
  { id: 'rot', name: 'Rot', c: 0x9a3e1a }, { id: 'grau', name: 'Grau', c: 0x9a9a9a }, { id: 'pink', name: 'Pink', c: 0xff4fb0 },
];
export const LASER = 120;

const list = (v: unknown) => (typeof v === 'string' && v ? v.split(',').filter(Boolean) : []);
export const tattoos = (s: SaveData) => list(s.flags.tat).filter((id) => TATTOOS.some((t) => t.id === id));
export const piercings = (s: SaveData) => list(s.flags.pier).filter((id) => PIERCINGS.some((p) => p.id === id));
export const beardOf = (s: SaveData) => String(s.flags.beard || '');

/** Tattoo stechen lassen oder weglasern; liefert einen Grund, falls es nicht geht */
export function setTattoo(s: SaveData, id: string, on: boolean): string | null {
  const t = TATTOOS.find((x) => x.id === id); if (!t) return 'Gibt es nicht.';
  const have = tattoos(s);
  if (on === have.includes(id)) return on ? 'Hast du schon.' : 'Hast du gar nicht.';
  const cost = on ? t.price : LASER;
  if (s.money < cost) return `Dafür fehlen dir ${cost - s.money} €.`;
  s.money -= cost; s.flags.tat = (on ? [...have, id] : have.filter((x) => x !== id)).join(',');
  if (on) pcEvents.emit('tattoo', { id });
  return null;
}
export function setPiercing(s: SaveData, id: string, on: boolean): string | null {
  const p = PIERCINGS.find((x) => x.id === id); if (!p) return 'Gibt es nicht.';
  const have = piercings(s);
  if (on === have.includes(id)) return on ? 'Hast du schon.' : 'Hast du gar nicht.';
  if (on && s.money < p.price) return `Dafür fehlen dir ${p.price - s.money} €.`;
  if (on) s.money -= p.price;
  s.flags.pier = (on ? [...have, id] : have.filter((x) => x !== id)).join(',');
  return null;
}
export function setBeard(s: SaveData, style: string, color = 'dunkel'): string | null {
  const b = BEARDS.find((x) => x.id === style); if (!b) return 'Gibt es nicht.';
  if (s.money < b.price) return `Dafür fehlen dir ${b.price - s.money} €.`;
  s.money -= b.price; s.flags.beard = style ? `${style}:${BEARD_COLORS.some((c) => c.id === color) ? color : 'dunkel'}` : '';
  return null;
}
/** Was die Spielfigur trägt (für Actor und Fotos) */
export function figOf(s: SaveData): Fig {
  return { m: muskel(s) / 100, tat: tattoos(s), pier: piercings(s), beard: beardOf(s) || undefined };
}
