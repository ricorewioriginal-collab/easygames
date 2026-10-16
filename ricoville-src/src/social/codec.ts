// Nachbarn: öffentliche Kurzansicht einer Stadt und Posteingangs-Nachrichten.
// Reine Funktionen ohne Netz, damit sie in Node testbar sind. Alles, was von fremden Spielern kommt, wird hier geprüft.
import { BUILDING } from '../catalogs/buildings';
import { GIFT_ITEMS, MAP, NEIGHBOR_HELPS, newCityState, utcDay } from '../core/city';
import type { Building, CityState, Rot } from '../core/types';

export const LAYOUT_MAX = 60000;

export interface PublicCity {
  uid: string;
  name: string;
  crest: string;
  slogan: string;
  level: number;
  pop: number;
  t: number;
  layout: string;
}

export type MsgType = 'visit' | 'gift' | 'hello';
export interface InboxMsg {
  id: string;
  from: string;
  name: string;
  type: MsgType;
  day: number;
  item?: string;
  n?: number;
  done: boolean;
}

interface Layout {
  /** [Gebäude-ID, x, y, Drehung, fertig 0/1] */
  b: [string, number, number, number, number][];
  /** Straßen "x,y;x,y;…" */
  r: string;
  /** Gebiete "x,y;…" */
  s: string;
}

const clean = (t: unknown, max: number): string => (typeof t === 'string' ? t : '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, max);

/** Eigene Stadt → öffentliche Kurzansicht (ohne Münzen, Lager, Aufgaben). */
export function toPublic(s: CityState, pop: number, now: number): Omit<PublicCity, 'uid'> {
  const lay: Layout = {
    b: s.buildings.map((b) => [b.def, b.x, b.y, b.rot, b.state === 'done' ? 1 : 0]),
    r: s.roads.join(';'),
    s: s.sectors.join(';'),
  };
  let layout = JSON.stringify(lay);
  // Sehr große Städte: erst Deko weglassen, dann hart kürzen, damit die Regel-Grenze nie überschritten wird.
  if (layout.length > LAYOUT_MAX) {
    lay.b = lay.b.filter(([d]) => BUILDING.get(d)?.cat !== 'decoration');
    layout = JSON.stringify(lay);
  }
  while (layout.length > LAYOUT_MAX && lay.b.length) {
    lay.b = lay.b.slice(0, Math.floor(lay.b.length * 0.9));
    layout = JSON.stringify(lay);
  }
  return {
    name: clean(s.name, 24) || 'RicoVille',
    crest: clean(s.crest, 8) || '🏰',
    slogan: clean(s.slogan, 60),
    level: Math.max(1, Math.min(999, Math.floor(s.level))),
    pop: Math.max(0, Math.floor(pop)),
    t: Math.floor(now),
    layout,
  };
}

const tile = (v: unknown): number | null => (typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < MAP ? v : null);
function keys(str: unknown, max: number): string[] {
  if (typeof str !== 'string') return [];
  const out: string[] = [];
  for (const k of str.split(';').slice(0, max)) {
    const [x, y] = k.split(',').map(Number);
    if (tile(x) !== null && tile(y) !== null) out.push(`${x},${y}`);
  }
  return [...new Set(out)];
}

/** Fremde Kurzansicht → nur zum Ansehen gebaute Stadt. Unbekanntes oder Kaputtes fällt still weg. */
export function visitState(p: PublicCity, now: number): CityState {
  const s = newCityState(clean(p.name, 24) || 'Nachbarstadt', 'relaxed', now);
  s.crest = clean(p.crest, 8) || '🏰';
  s.slogan = clean(p.slogan, 60);
  s.level = Math.max(1, Math.min(999, Math.floor(Number(p.level) || 1)));
  s.tutorial = 'done';
  let lay: Partial<Layout> = {};
  try {
    lay = JSON.parse(p.layout) as Partial<Layout>;
  } catch {
    lay = {};
  }
  s.roads = keys(lay.r, 3000);
  const sectors = keys(lay.s, 36).filter((k) => k.split(',').every((n) => +n < 6));
  if (sectors.length) s.sectors = sectors;
  s.buildings = [];
  s.nextUid = 1;
  const taken = new Set<string>();
  for (const row of Array.isArray(lay.b) ? lay.b.slice(0, 2000) : []) {
    if (!Array.isArray(row)) continue;
    const [def, x, y, rot, done] = row;
    const d = typeof def === 'string' ? BUILDING.get(def) : undefined;
    if (!d || tile(x) === null || tile(y) === null || ![0, 1, 2, 3].includes(rot as number)) continue;
    const w = (rot as number) % 2 ? d.h : d.w;
    const hh = (rot as number) % 2 ? d.w : d.h;
    let free = x + w <= MAP && y + hh <= MAP;
    for (let dx = 0; dx < w && free; dx++) for (let dy = 0; dy < hh && free; dy++) if (taken.has(`${x + dx},${y + dy}`)) free = false;
    if (!free) continue;
    for (let dx = 0; dx < w; dx++) for (let dy = 0; dy < hh; dy++) taken.add(`${x + dx},${y + dy}`);
    const b: Building = { uid: s.nextUid++, def: d.id, x, y, rot: rot as Rot, state: done ? 'done' : 'building', readyAt: done ? 0 : now + 365 * 864e5 };
    if (d.rent || d.revenue) b.t = now;
    s.buildings.push(b);
  }
  return s;
}

/** Bei Nachbarn helfen kann man an Häusern, Läden, Feldern und Betrieben. */
export function helpable(defId: string): boolean {
  const c = BUILDING.get(defId)?.cat;
  return c === 'residential' || c === 'business' || c === 'farm' || c === 'production';
}

export const msgId = (from: string, day: number, type: MsgType): string => `${from}_${day}_${type}`;

/** Nachricht aus dem Posteingang prüfen (zusätzlich zu den Regeln auf dem Server). */
export function validMsg(m: { [K in keyof InboxMsg]?: unknown }, now: number): m is InboxMsg {
  if (typeof m.from !== 'string' || !m.from || typeof m.id !== 'string') return false;
  if (m.type !== 'visit' && m.type !== 'gift' && m.type !== 'hello') return false;
  if (typeof m.day !== 'number' || m.day > utcDay(now) || m.id !== msgId(m.from, m.day, m.type)) return false;
  if (m.type === 'gift' && !(typeof m.item === 'string' && (GIFT_ITEMS as readonly string[]).includes(m.item))) return false;
  if (m.type === 'visit' && !(typeof m.n === 'number' && m.n >= 1 && m.n <= NEIGHBOR_HELPS)) return false;
  return true;
}

export function msgName(m: Pick<InboxMsg, 'name'>): string {
  return clean(m.name, 24) || 'Ein Nachbar';
}
