// Spielstände: versioniert, kompakt (nur veränderte bzw. bewohnte Grundstücke), mit Prüfung, Migration, Sicherungskopie und Export/Import.
import { lotById } from '../data/lots';
import { hasDef } from '../world/defs';
import { buildTerrain } from '../world/map';
import { buildAllLots } from '../world/templates';
import { MAP_W, MAP_H, type ObjInst, type Wall } from '../world/world';
import { Game } from './game';
import { installSystems } from './setup';
import { newRuntime } from './factory';
import { rollWeather } from './world-sys';
import type { Household, Pet, Rel, Settings, Sim } from './types';
import { DEFAULT_SETTINGS } from './types';

export const SAVE_VERSION = 1;
export const SAVE_PREFIX = 'ricolife.save.';
export const BACKUP_PREFIX = 'ricolife.bak.';
export const PROFILE_KEY = 'ricolife.profile';
export const SLOTS = [1, 2, 3];

export interface LotData {
  walls: [number, Wall][];
  floors: [number, number][];
  objs: ObjInst[];
}
export interface SaveData {
  game: 'ricolife';
  v: number;
  name: string;
  slot: number;
  created: number;
  saved: number;
  meta: { hh: string; members: string[]; day: number; funds: number; date: string };
  clock: { min: number };
  rng: number;
  settings: Partial<Settings>;
  weather: Game['weather'];
  story: Game['story'];
  activeHh: string | null;
  activeSim: string | null;
  flags: Record<string, number>;
  evCool: Record<string, number>;
  nextEventAt: number;
  stats: Record<string, number>;
  sims: Omit<Sim, 'rt' | 'queue'>[];
  pets: Omit<Pet, 'rt'>[];
  hhs: Household[];
  rels: [string, Rel][];
  lots: Record<string, LotData>;
  modified: string[];
}

const round = (v: number, d = 100): number => Math.round(v * d) / d;
const inLot = (lot: string, x: number, z: number): boolean => {
  const L = lotById(lot);
  return !!L && x >= L.x && x <= L.x + L.w && z >= L.z && z <= L.z + L.d;
};

/** Daten eines einzelnen Grundstücks (Mehrspieler-Abgleich) */
export function lotData(g: Game, lot: string): LotData | null {
  const L = lotById(lot);
  if (!L) return null;
  const out: LotData = { walls: [], floors: [], objs: [] };
  for (let l = 0; l < 2; l++)
    for (let z = L.z; z <= L.z + L.d && z < MAP_H; z++)
      for (let x = L.x; x <= L.x + L.w && x < MAP_W; x++) {
        const c = (l * MAP_H + z) * MAP_W + x;
        for (const k of [c * 2, c * 2 + 1]) {
          const w = g.world.walls.get(k);
          if (w) out.walls.push([k, w]);
        }
        if (x < L.x + L.w && z < L.z + L.d) {
          const f = g.world.floors.get(c);
          if (f !== undefined) out.floors.push([c, f]);
        }
      }
  for (const o of g.world.objs.values()) if (o.lot === lot) out.objs.push({ ...o, st: o.st && Object.keys(o.st).length ? { ...o.st } : undefined });
  return out;
}

/** Grundstück aus Daten neu aufbauen */
export function applyLot(g: Game, lot: string, data: LotData): boolean {
  const L = lotById(lot);
  if (!L || !data || !Array.isArray(data.walls) || !Array.isArray(data.floors) || !Array.isArray(data.objs)) return false;
  g.world.clearLot(L);
  for (const [k, w] of data.walls) if (Number.isInteger(k)) g.world.walls.set(k, w);
  for (const [k, f] of data.floors) if (Number.isInteger(k)) g.world.floors.set(k, f);
  for (const o of data.objs) if (o && typeof o.id === 'string' && hasDef(o.def)) g.world.addObj({ ...o, st: o.st ?? {} });
  g.world.touch(lot);
  return true;
}

/** Welche Grundstücke müssen gespeichert werden? (verändert oder bewohnt) */
function lotsToSave(g: Game): string[] {
  const set = new Set(g.world.modified);
  for (const h of g.hhs.values()) if (h.lot) set.add(h.lot);
  // Grundstücke mit Objektzuständen (Beete, Kaputtes, Reste)
  for (const o of g.world.objs.values()) if (o.st && Object.keys(o.st).length) set.add(o.lot);
  return [...set].filter((l) => !!lotById(l));
}

export function serialize(g: Game): SaveData {
  const lots: Record<string, LotData> = {};
  const keep = lotsToSave(g);
  for (const lot of keep) lots[lot] = { walls: [], floors: [], objs: [] };
  for (const [k, w] of g.world.walls) {
    const c = Math.floor(k / 2);
    const rest = c % (MAP_W * MAP_H);
    const x = rest % MAP_W,
      z = Math.floor(rest / MAP_W);
    for (const lot of keep) if (inLot(lot, x, z)) {
      lots[lot]!.walls.push([k, w]);
      break;
    }
  }
  for (const [k, f] of g.world.floors) {
    const rest = k % (MAP_W * MAP_H);
    const x = rest % MAP_W,
      z = Math.floor(rest / MAP_W);
    for (const lot of keep) if (inLot(lot, x, z) && x < lotById(lot)!.x + lotById(lot)!.w && z < lotById(lot)!.z + lotById(lot)!.d) {
      lots[lot]!.floors.push([k, f]);
      break;
    }
  }
  for (const o of g.world.objs.values()) if (lots[o.lot]) lots[o.lot]!.objs.push({ ...o, st: o.st && Object.keys(o.st).length ? { ...o.st } : undefined });
  const sims = [...g.sims.values()]
    .filter((s) => !s.guest)
    .map((s) => {
      const { rt, queue, ...rest } = s;
      void rt;
      void queue;
      const needs = { ...rest.needs };
      for (const k of Object.keys(needs) as (keyof typeof needs)[]) needs[k] = round(needs[k], 10);
      const skills: Sim['skills'] = {};
      for (const [k, v] of Object.entries(rest.skills)) skills[k as keyof Sim['skills']] = Math.round(v ?? 0);
      return { ...rest, x: round(s.x), z: round(s.z), rot: round(s.rot), needs, skills, trip: undefined, mem: rest.mem.slice(0, 50) };
    });
  const pets = [...g.pets.values()].map((p) => {
    const { rt, ...rest } = p;
    void rt;
    return { ...rest, x: round(p.x), z: round(p.z) };
  });
  const hh = g.hh;
  const settings: Partial<Settings> = {};
  for (const [k, v] of Object.entries(g.settings)) if (JSON.stringify(v) !== JSON.stringify((DEFAULT_SETTINGS as unknown as Record<string, unknown>)[k])) (settings as Record<string, unknown>)[k] = v;
  return {
    game: 'ricolife',
    v: SAVE_VERSION,
    name: g.saveName,
    slot: g.slot,
    created: g.created,
    saved: Date.now(),
    meta: { hh: hh?.name ?? '', members: g.members().map((m) => m.first), day: g.clock.day + 1, funds: hh?.funds ?? 0, date: g.clock.dateStr() },
    clock: { min: round(g.clock.min, 10) },
    rng: g.rng.state,
    settings,
    weather: { ...g.weather },
    story: g.story ? { ...g.story } : null,
    activeHh: g.activeHh,
    activeSim: g.activeSim,
    flags: { ...g.flags },
    evCool: { ...g.evCool },
    nextEventAt: g.nextEventAt,
    stats: { ...g.stats },
    sims,
    pets,
    hhs: [...g.hhs.values()].map((h) => ({ ...h, ledger: h.ledger.slice(0, 40), booked: h.booked.slice(-120) })),
    rels: [...g.rels.entries()].filter(([k, r]) => (r.met || r.f !== 0 || r.k) && k.split('|').every((id) => g.sims.has(id) && !g.sims.get(id)!.guest)).map(([k, r]) => [k, { ...r, h: r.h.slice(0, 6) }]),
    lots,
    modified: [...g.world.modified],
  };
}

/** Prüft die Struktur eines Spielstands; liefert Fehlertext oder null */
export function validate(d: unknown): string | null {
  if (!d || typeof d !== 'object') return 'Keine gültige Datei';
  const s = d as Partial<SaveData>;
  if (s.game !== 'ricolife') return 'Das ist kein RicoLife-Spielstand';
  if (typeof s.v !== 'number' || s.v < 1) return 'Unbekannte Version';
  if (s.v > SAVE_VERSION) return 'Spielstand stammt aus einer neueren Version – bitte das Spiel aktualisieren';
  if (!Array.isArray(s.sims) || !Array.isArray(s.hhs) || !Array.isArray(s.rels)) return 'Spielstand ist unvollständig';
  if (!s.clock || typeof s.clock.min !== 'number' || !Number.isFinite(s.clock.min)) return 'Uhrzeit fehlt';
  if (typeof s.lots !== 'object' || s.lots === null) return 'Grundstücksdaten fehlen';
  for (const sim of s.sims) if (!sim || typeof sim.id !== 'string' || typeof sim.first !== 'string' || !sim.needs || !sim.look) return 'Fehlerhafte Figur im Spielstand';
  if (s.activeHh && !s.hhs.some((h) => h.id === s.activeHh)) return 'Aktiver Haushalt fehlt';
  return null;
}

/** Ältere Versionen anheben (Platz für spätere Änderungen) */
export function migrate(d: SaveData): SaveData {
  // v1 ist die erste Version
  return d;
}

export function deserialize(raw: SaveData): Game {
  const err = validate(raw);
  if (err) throw new Error(err);
  const d = migrate(raw);
  const g = new Game();
  installSystems(g);
  g.slot = d.slot;
  g.saveName = d.name;
  g.created = d.created;
  g.settings = { ...DEFAULT_SETTINGS, ...d.settings, keys: { ...(d.settings.keys ?? {}) } };
  g.clock.seasonDays = g.settings.seasonDays;
  g.clock.min = d.clock.min;
  g.rng.state = d.rng >>> 0;
  buildTerrain(g.world);
  buildAllLots(g.world);
  for (const [lot, data] of Object.entries(d.lots)) {
    const L = lotById(lot);
    if (!L) continue;
    g.world.clearLot(L);
    for (const [k, w] of data.walls) g.world.walls.set(k, w);
    for (const [k, f] of data.floors) g.world.floors.set(k, f);
    for (const o of data.objs) if (hasDef(o.def)) g.world.addObj({ ...o, st: o.st ?? {} });
    g.world.touch(lot);
  }
  for (const m of d.modified) g.world.modified.add(m);
  g.world.bumpIds();
  for (const h of d.hhs) {
    g.hhs.set(h.id, { ...h, storage: h.storage ?? [], booked: h.booked ?? [], ledger: h.ledger ?? [], pets: h.pets ?? [] });
    if (h.lot) g.world.privateLots.add(h.lot);
  }
  for (const s of d.sims) g.sims.set(s.id, { ...(s as Sim), queue: [], rt: newRuntime(), away: s.away && s.away.kind === 'travel' ? null : s.away });
  for (const p of d.pets) g.pets.set(p.id, { ...(p as Pet), act: { kind: 'idle', t: 1 }, rt: { anim: 'idle', animT: 0, path: null, pathI: 0, spawned: false, bubble: null } });
  for (const [k, r] of d.rels) g.rels.set(k, r);
  g.weather = d.weather ?? g.weather;
  g.story = d.story;
  g.activeHh = d.activeHh;
  g.activeSim = d.activeSim;
  g.flags = d.flags ?? {};
  g.evCool = d.evCool ?? {};
  g.nextEventAt = d.nextEventAt ?? 0;
  g.stats = d.stats ?? {};
  // Laufzeitkorrekturen: Stadtbewohner/Haushaltsmitglieder
  for (const s of g.sims.values()) {
    s.npc = !(s.hh && s.hh === g.activeHh);
    s.rt.spawned = !s.npc;
    if (s.career) {
      s.career.shift = null;
      s.career.onSite = false;
    }
    if (s.away?.kind === 'work' && !s.npc) s.away = null;
    if (!Number.isFinite(s.x) || !Number.isFinite(s.z)) {
      s.x = 24;
      s.z = 48;
    }
  }
  g.world.rebuildFlags();
  g.world.rebuildLinks();
  if (!g.weather.until) rollWeather(g);
  g.resetTimeMarks();
  return g;
}

// ---------- Speicher im Browser ----------
function ls(): Storage | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

export function saveToSlot(g: Game, slot = g.slot): { ok: boolean; error?: string; bytes?: number } {
  const st = ls();
  if (!st) return { ok: false, error: 'Speicher nicht verfügbar (privater Modus?)' };
  g.slot = slot;
  try {
    const json = JSON.stringify(serialize(g));
    const key = SAVE_PREFIX + slot;
    const old = st.getItem(key);
    if (old) {
      try {
        st.setItem(BACKUP_PREFIX + slot, old);
      } catch {
        st.removeItem(BACKUP_PREFIX + slot);
      }
    }
    st.setItem(key, json);
    return { ok: true, bytes: json.length };
  } catch (e) {
    return { ok: false, error: e instanceof Error && e.name === 'QuotaExceededError' ? 'Speicher voll – alte Spielstände löschen' : 'Speichern fehlgeschlagen' };
  }
}

export interface SlotInfo {
  slot: number;
  empty: boolean;
  name?: string;
  meta?: SaveData['meta'];
  saved?: number;
  broken?: boolean;
  hasBackup?: boolean;
}

export function slotInfo(slot: number): SlotInfo {
  const st = ls();
  const raw = st?.getItem(SAVE_PREFIX + slot);
  const hasBackup = !!st?.getItem(BACKUP_PREFIX + slot);
  if (!raw) return { slot, empty: true, hasBackup };
  try {
    const d = JSON.parse(raw) as SaveData;
    if (validate(d)) return { slot, empty: false, broken: true, hasBackup };
    return { slot, empty: false, name: d.name, meta: d.meta, saved: d.saved, hasBackup };
  } catch {
    return { slot, empty: false, broken: true, hasBackup };
  }
}

export function loadFromSlot(slot: number, backup = false): Game {
  const st = ls();
  const raw = st?.getItem((backup ? BACKUP_PREFIX : SAVE_PREFIX) + slot);
  if (!raw) throw new Error('Dieser Platz ist leer');
  let d: SaveData;
  try {
    d = JSON.parse(raw) as SaveData;
  } catch {
    throw new Error('Spielstand ist beschädigt');
  }
  const g = deserialize(d);
  g.slot = slot;
  return g;
}

export function deleteSlot(slot: number): void {
  const st = ls();
  st?.removeItem(SAVE_PREFIX + slot);
  st?.removeItem(BACKUP_PREFIX + slot);
}

export function exportJson(g: Game): string {
  return JSON.stringify(serialize(g));
}
/** Import: prüft und lädt; Fehler als Exception mit verständlichem Text */
export function importJson(text: string, slot: number): Game {
  let d: SaveData;
  try {
    d = JSON.parse(text) as SaveData;
  } catch {
    throw new Error('Datei ist kein gültiges JSON');
  }
  const g = deserialize(d);
  g.slot = slot;
  return g;
}
