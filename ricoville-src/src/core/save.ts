// Speicherstände: Versionierung, Migration, Prüfsumme und Schutz vor veralteten Tabs.
import { BUILDING } from '../catalogs/buildings';
import { SCHEMA_VERSION } from './city';
import type { CityState, Result } from './types';

export interface KV {
  get(k: string): string | null;
  set(k: string, v: string): void;
}

export const localKV: KV = {
  get: (k) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k, v) => {
    localStorage.setItem(k, v);
  },
};

export type Slot = 'main' | 'creative';
/** Präfix ricoville.save wird vom easygames-Cloud-Skript mit Google synchronisiert. */
export const saveKey = (slot: Slot): string => `ricoville.save.${slot}`;
const backupKey = (slot: Slot): string => `ricoville.backup.${slot}`;

export function checksum(text: string): string {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return (h >>> 0).toString(36);
}

export function serialize(s: CityState): string {
  const body = JSON.stringify(s);
  return JSON.stringify({ sum: checksum(body), city: body });
}

/** Ergänzt fehlende Felder und hebt ältere Schemata an. Unbekannte Gebäude werden entfernt statt abzustürzen. */
export function migrate(raw: Record<string, unknown>): CityState {
  const s = raw as unknown as CityState;
  const v = typeof s.v === 'number' ? s.v : 0;
  if (v < 1) {
    // Version 0 (Vorabstand): Inventar hieß "items", Straßen als Array von [x,y].
    const old = raw as { items?: Record<string, number>; roads?: unknown[] };
    if (old.items && !s.inv) s.inv = old.items;
    if (Array.isArray(old.roads)) s.roads = old.roads.map((r) => (Array.isArray(r) ? `${r[0]},${r[1]}` : String(r)));
  }
  s.v = SCHEMA_VERSION;
  s.rev ??= 0;
  s.name ??= 'RicoVille';
  s.slogan ??= '';
  s.crest ??= '🏰';
  s.mode ??= 'nostalgic';
  s.inv ??= {};
  s.roads ??= [];
  s.sectors ??= ['2,2', '3,2', '2,3', '3,3'];
  s.quests ??= {};
  s.achievements ??= [];
  s.stats ??= {};
  s.tutorial ??= 'done';
  s.buildings = (s.buildings ?? []).filter((b) => BUILDING.has(b.def));
  s.nextUid = Math.max(s.nextUid ?? 1, ...s.buildings.map((b) => b.uid + 1));
  for (const [k, n] of Object.entries(s.inv)) if (!(n > 0)) delete s.inv[k];
  return s;
}

export function parse(text: string | null): CityState | null {
  if (!text) return null;
  try {
    const wrap = JSON.parse(text) as { sum?: string; city?: string };
    if (typeof wrap.city !== 'string' || wrap.sum !== checksum(wrap.city)) return null;
    return migrate(JSON.parse(wrap.city) as Record<string, unknown>);
  } catch {
    return null;
  }
}

export class SaveManager {
  /** Revision, auf der dieser Tab aufbaut. Ein höherer Stand im Speicher bedeutet: anderer Tab/Gerät war schneller. */
  private base = -1;
  constructor(
    private kv: KV,
    readonly slot: Slot,
  ) {}

  load(): CityState | null {
    const s = parse(this.kv.get(saveKey(this.slot)));
    if (s) this.base = s.rev;
    else {
      const b = parse(this.kv.get(backupKey(this.slot)));
      if (b) {
        this.base = b.rev;
        return b;
      }
    }
    return s;
  }
  storedRev(): number {
    return parse(this.kv.get(saveKey(this.slot)))?.rev ?? -1;
  }
  /** Schreibt nur, wenn niemand inzwischen einen neueren Stand gespeichert hat. */
  save(s: CityState, now: number): Result {
    const prev = this.kv.get(saveKey(this.slot));
    const stored = parse(prev);
    if (stored && this.base >= 0 && stored.rev > this.base) return { ok: false, msg: 'conflict' };
    s.rev = Math.max(this.base, stored?.rev ?? -1) + 1;
    s.savedAt = now;
    try {
      if (prev && stored) this.kv.set(backupKey(this.slot), prev);
      this.kv.set(saveKey(this.slot), serialize(s));
    } catch {
      return { ok: false, msg: 'Speicher voll oder gesperrt.' };
    }
    this.base = s.rev;
    return { ok: true };
  }
  /** Übernimmt bewusst den Stand im Speicher (Konfliktauflösung „neueren laden“). */
  adopt(): CityState | null {
    return this.load();
  }
  /** Erzwingt das Überschreiben (Konfliktauflösung „diesen Stand behalten“). */
  force(s: CityState, now: number): Result {
    this.base = this.storedRev();
    return this.save(s, now);
  }
}
