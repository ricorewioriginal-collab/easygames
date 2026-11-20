/* Alltag (aus Gay Life! übernommen): Uhrzeit, Bedürfnisse, Stimmung, Zeit vorspulen, Tagesziele.
   Reine Funktionen auf dem Spielstand – die Szenen rufen sie auf, Tests prüfen sie ohne Browser.
   Zeitmodell: s.time = Tagesanteil (0 = 6:00, 0,25 = 12:00, 0,75 = 0:00), ein Spieltag = 16 echte Minuten in der Stadt. */
import type { SaveData } from '../engine/Save';

export type Need = keyof SaveData['needs'];
export const NEEDS: Array<{ k: Need; name: string; icon: string; tip: string }> = [
  { k: 'energy', name: 'Energie', icon: '⚡', tip: 'Schlafen, Kaffee im Café, Mate im Späti' },
  { k: 'hunger', name: 'Satt', icon: '🍝', tip: 'Kochen zu Hause, Brezel im Späti, Kuchen im Café' },
  { k: 'hygiene', name: 'Frisch', icon: '🚿', tip: 'Duschen zu Hause' },
  { k: 'social', name: 'Kontakte', icon: '💬', tip: 'Mit Leuten reden, Tanzen im Prisma' },
  { k: 'fun', name: 'Spaß', icon: '🎉', tip: 'Fernsehen, Tanz-Battle, Sticker suchen' },
];
export const DAY_SEC = 16 * 60;
export const WEEKDAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
/* Veränderung pro Spielstunde */
const AWAKE: Record<Need, number> = { energy: -4, hunger: -5, hygiene: -3.5, social: -2.5, fun: -3 };
const SLEEP: Record<Need, number> = { energy: 12.5, hunger: -2, hygiene: -1, social: 0, fun: 0 };

const clamp = (v: number) => Math.max(0, Math.min(100, v));
export const hour = (s: SaveData) => (6 + s.time * 24) % 24;
export const clock = (s: SaveData) => { const h = hour(s); return String(Math.floor(h)).padStart(2, '0') + ':' + String(Math.floor((h % 1) * 60)).padStart(2, '0'); };
export const weekday = (s: SaveData) => WEEKDAYS[(s.day - 1) % 7];
export const isNight = (s: SaveData) => { const h = hour(s); return h >= 21 || h < 6; };

export function mood(s: SaveData): number {
  const n = s.needs;
  return Math.round(clamp((n.energy + n.hunger + n.hygiene + n.social + n.fun) / 5));
}
export const moodName = (m: number) => (m >= 75 ? 'Bestens' : m >= 55 ? 'Gut' : m >= 35 ? 'Geht so' : 'Mies');
export const moodIcon = (m: number) => (m >= 75 ? '😄' : m >= 55 ? '🙂' : m >= 35 ? '😐' : '😣');
/** Faktor für Lohn und Trinkgeld: 0,8 (mies) bis 1,15 (bestens) */
export const moodFactor = (s: SaveData) => .8 + mood(s) / 100 * .35;

export function change(s: SaveData, d: Partial<Record<Need, number>>) {
  for (const [k, v] of Object.entries(d) as [Need, number][]) s.needs[k] = clamp(s.needs[k] + v);
}

/** Zeit vorspulen. Liefert die Zahl der neu begonnenen Tage (Mitternacht = t 0,75). */
export function advance(s: SaveData, minutes: number, sleeping = false): number {
  const r = sleeping ? SLEEP : AWAKE, h = minutes / 60;
  for (const k of Object.keys(r) as Need[]) s.needs[k] = clamp(s.needs[k] + r[k] * h);
  const t0 = s.time, t1 = t0 + minutes / 1440;
  // Tageswechsel um Mitternacht (t = 0,75 + n)
  const days = Math.floor(t1 - .75 + 1) - Math.floor(t0 - .75 + 1);
  s.day += Math.max(0, days);
  s.time = ((t1 % 1) + 1) % 1;
  return Math.max(0, days);
}

/** Minuten bis zu einer Uhrzeit (z. B. 7 Uhr morgens) */
export function minutesUntil(s: SaveData, h: number) {
  let d = h - hour(s); if (d <= 0) d += 24; return Math.ceil(d * 60 + .5); // aufrunden: sonst steht die Uhr bei 20:59,7 und „ab 21 Uhr“ greift nicht
}

/* ---------- Tagesziele (Idee 2: Ziele und Wachstum) ---------- */
export interface Daily { id: string; text: string; n: number; glitter: number; money: number }
const POOL: Daily[] = [
  { id: 'work', text: 'Arbeite eine Schicht', n: 1, glitter: 15, money: 10 },
  { id: 'talk', text: 'Sprich mit 3 Leuten', n: 3, glitter: 10, money: 0 },
  { id: 'eat', text: 'Iss oder koche zweimal', n: 2, glitter: 10, money: 0 },
  { id: 'dance', text: 'Tanz ein Battle im Prisma', n: 1, glitter: 20, money: 0 },
  { id: 'shower', text: 'Geh duschen', n: 1, glitter: 5, money: 0 },
  { id: 'coffee', text: 'Trink einen Kaffee bei Mo', n: 1, glitter: 5, money: 0 },
  { id: 'tram', text: 'Fahr mit der Tram', n: 1, glitter: 5, money: 0 },
  { id: 'mood', text: 'Erreiche Stimmung „Bestens“', n: 1, glitter: 15, money: 0 },
];
/** Drei Ziele je Tag, fest aus dem Tag abgeleitet (gleicher Tag = gleiche Ziele) */
export function dailies(s: SaveData): Daily[] {
  const out: Daily[] = [], used = new Set<number>();
  let x = s.day * 9301 + 49297;
  while (out.length < 3) { x = (x * 233280 + 49297) % 1000003; const i = x % POOL.length; if (!used.has(i)) { used.add(i); out.push(POOL[i]); } }
  return out;
}
/** Zählt ein Ereignis; liefert erledigte Ziele (für Belohnung und Meldung) */
export function track(s: SaveData, id: string, by = 1): Daily[] {
  if (s.daily.d !== s.day) s.daily = { d: s.day, done: [], c: {} };
  const list = dailies(s).filter((d) => d.id === id && !s.daily.done.includes(d.id));
  if (!list.length) return [];
  s.daily.c[id] = (s.daily.c[id] || 0) + by;
  const done = list.filter((d) => s.daily.c[id] >= d.n);
  for (const d of done) { s.daily.done.push(d.id); s.glitter += d.glitter; s.money += d.money; }
  return done;
}
export function dailyState(s: SaveData) {
  const fresh = s.daily.d !== s.day;
  return dailies(s).map((d) => ({ ...d, have: fresh ? 0 : Math.min(d.n, s.daily.c[d.id] || 0), done: !fresh && s.daily.done.includes(d.id) }));
}
