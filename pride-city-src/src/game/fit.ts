/* Ausdauer und Essens-Boosts: Wer viel rennt oder auf dem Laufband schwitzt, bekommt mehr Puste (schneller sprinten,
   später müde). Bestimmtes Essen gibt für ein paar Stunden einen Boost. Muskeln (figur.ts) machen Schläge kräftiger.
   Alles bleibt im Spielstand (flags: aus, ausDay, ausN, buffK, buffT). */
import type { SaveData } from '../engine/Save';
import { muskel } from './figur';

const num = (v: unknown, d = 0) => (typeof v === 'number' && isFinite(v) ? v : d);
export const AUS_START = 20;
/** Ausdauer heute: nach vier Tagen ohne Bewegung 1 Punkt am Tag weniger (nie unter den Start) */
export function ausdauer(s: SaveData) {
  const a = num(s.flags.aus, AUS_START), last = num(s.flags.ausDay, s.day);
  return Math.round(Math.max(Math.min(a, AUS_START), a - Math.max(0, s.day - last - 4)));
}
export const ausName = (a: number) => (a >= 80 ? 'Marathon-Maschine' : a >= 60 ? 'Läufer*in' : a >= 40 ? 'Fit' : a >= 28 ? 'Geht so' : 'Schnell aus der Puste');
/** Höchstens so viele Punkte am Tag (Laufband und Rennen zusammen) */
export const AUS_DAY = 6;

/** Ausdauer steigern; liefert den Zuwachs (0 = heute ausgereizt) */
export function gainAus(s: SaveData, n: number) {
  const a = ausdauer(s), today = s.flags.ausToday === s.day ? num(s.flags.ausN) : 0;
  s.flags.aus = a; s.flags.ausDay = s.day;
  const g = Math.max(0, Math.min(n, AUS_DAY - today, 100 - a));
  if (!g) return 0;
  s.flags.aus = a + g; s.flags.ausToday = s.day; s.flags.ausN = today + g;
  return g;
}

/** Essens-Boosts: wirken ein paar Spielstunden */
export const BUFFS = {
  kaffee: { icon: '☕', name: 'Hellwach', sub: 'Rennen ohne Müdigkeit', h: 2 },
  mate: { icon: '⚡', name: 'Mate-Kick', sub: 'schneller sprinten', h: 1.5 },
  shake: { icon: '🥤', name: 'Protein-Boost', sub: 'Training wirkt stärker, Schläge kräftiger', h: 3 },
  bowl: { icon: '🥗', name: 'Power-Bowl', sub: 'mehr Puste beim Rennen', h: 4 },
  doener: { icon: '🥙', name: 'Satt & stark', sub: 'Schläge kräftiger', h: 3 },
} as const;
export type BuffId = keyof typeof BUFFS;
/** Jetzt in Spieltagen (Tag + Tageszeit) */
const now = (s: SaveData) => s.day + s.time;
export function giveBuff(s: SaveData, id: BuffId) { s.flags.buffK = id; s.flags.buffT = now(s) + BUFFS[id].h / 24; return BUFFS[id]; }
export function buffOf(s: SaveData) {
  const k = s.flags.buffK as BuffId | undefined;
  if (!k || !(k in BUFFS) || num(s.flags.buffT) <= now(s)) return null;
  return { id: k, ...BUFFS[k], left: (num(s.flags.buffT) - now(s)) * 24 };
}
export const buffLine = (s: SaveData) => { const b = buffOf(s); return b ? `${b.icon} ${b.name} (${b.sub}, noch ${Math.max(1, Math.round(b.left * 60))} Min.)` : ''; };

/** Sprinttempo in m/s: Ausdauer und Boosts machen schneller, Müdigkeit langsamer (außer mit Kaffee) */
export function sprintSpeed(s: SaveData, tired: boolean) {
  const b = buffOf(s)?.id, a = ausdauer(s);
  if (tired && b !== 'kaffee') return 6.3;
  return 7.4 + a * .012 + (b === 'mate' ? .7 : b === 'bowl' ? .4 : 0);
}
/** Ab wie viel Energie man müde rennt: mit Ausdauer hält man länger durch */
export const tiredAt = (s: SaveData) => Math.max(4, 12 - ausdauer(s) * .08);
/** Schlagkraft: Muskeln und Boosts – weniger Treffer bis zum Umfallen, weiter geschubst */
export function punch(s: SaveData) {
  const m = muskel(s), b = buffOf(s)?.id, boost = b === 'shake' || b === 'doener';
  return { hits: (m >= 60 ? 1 : 0) + (boost ? 1 : 0), push: 1 + m / 200 + (boost ? .2 : 0) };
}
/** Trainings-Faktor (Protein-Shake: +50 %) */
export const trainBoost = (s: SaveData) => (buffOf(s)?.id === 'shake' ? 1.5 : 1);
