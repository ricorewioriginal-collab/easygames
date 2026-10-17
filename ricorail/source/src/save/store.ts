// Spielstände: 3 Profile, Autosave, Versionsmigration, Schreibprüfung, Export/Import, Editor-Netze (IndexedDB).
// Alles Cloud-relevante liegt klein in localStorage unter „ricorail.“ (wird von cloud/anmacha-cloud.js synchronisiert).
import { NETWORK_SCHEMA, type NetworkDef } from '../railway/schema';

export const SAVE_VERSION = 1;

/** Texte (für spätere Übersetzung gesammelt) */
export const SAVE_TEXT = {
  player: 'Spieler',
  noStorage: 'Lokaler Speicher nicht verfügbar (privates Fenster?) – Fortschritt geht beim Schließen verloren.',
  quota: 'Speicher voll – Spielstand konnte nicht geschrieben werden.',
  verify: 'Spielstand wurde nicht korrekt geschrieben – vorherige Version bleibt erhalten.',
  corrupt: 'Spielstand war beschädigt – Sicherung angelegt, Standardwerte geladen.',
  restoredPrev: 'Spielstand war beschädigt – letzte gute Kopie wiederhergestellt.',
  newer: 'Spielstand stammt aus einer neueren Version – unbekannte Daten bleiben erhalten.',
  importBadJson: 'Import fehlgeschlagen: keine gültige JSON-Datei.',
  importBadShape: 'Import fehlgeschlagen: Datei enthält keinen RicoRail-Spielstand.',
  importSaveFail: 'Import fehlgeschlagen: konnte nicht gespeichert werden – alte Daten bleiben erhalten.',
  importOk: 'Spielstand importiert.',
  netSaveFail: 'Netz konnte nicht gespeichert werden.',
};

export interface Settings {
  lang: 'de' | 'en'; quality: 'low' | 'mid' | 'high' | 'auto'; fpsCap: 30 | 60 | 0;
  volume: { master: number; train: number; env: number; ui: number; voice: number };
  assist: 'easy' | 'standard' | 'expert'; units: 'kmh'; invertLook: boolean; touchLayout: 'left' | 'right'; hud: 'full' | 'minimal';
  announcements: boolean; subtitles: boolean; colorblind: boolean; reducedMotion: boolean; textScale: number;
}
export interface Profile {
  id: 0 | 1 | 2; name: string; created: number; updated: number;
  career: { rank: number; xp: number; exams: string[]; licences: string[] };
  scenarios: Record<string, { best: number; stars: number; done: boolean; time?: number }>;
  company: unknown | null; settings: Settings;
  stats: { km: number; hours: number; trains: number; spad: number };
  resume: unknown | null;
}

const KEY = 'ricorail.save', KEY_PREV = 'ricorail.save.prev', KEY_BACKUP = 'ricorail.backup.';
/** Editor-Netze im Ersatzspeicher: bewusst NICHT unter „ricorail.“, damit große Netze die Cloud-Synchronisation (max. ~900 kB) nicht sprengen */
const KEY_NET = 'ricorail_net.';
const MAX_BACKUPS = 2;
type Slot = 0 | 1 | 2;

export function defaultSettings(): Settings {
  return {
    lang: 'de', quality: 'auto', fpsCap: 60, volume: { master: 0.8, train: 1, env: 0.8, ui: 0.7, voice: 0.9 },
    assist: 'standard', units: 'kmh', invertLook: false, touchLayout: 'right', hud: 'full',
    announcements: true, subtitles: true, colorblind: false, reducedMotion: false, textScale: 1,
  };
}

function newProfile(id: Slot, name?: string, now = Date.now()): Profile {
  return {
    id, name: name || `${SAVE_TEXT.player} ${id + 1}`, created: now, updated: now,
    career: { rank: 0, xp: 0, exams: [], licences: [] }, scenarios: {}, company: null,
    settings: defaultSettings(), stats: { km: 0, hours: 0, trains: 0, spad: 0 }, resume: null,
  };
}

// ---------------------------------------------------------------- Bereinigung (unbekannte Felder bleiben erhalten)
const isObj = (v: unknown): v is Record<string, any> => !!v && typeof v === 'object' && !Array.isArray(v);
const num = (v: unknown, d: number, lo = -Infinity, hi = Infinity) => (typeof v === 'number' && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d);
const bool = (v: unknown, d: boolean) => (typeof v === 'boolean' ? v : d);
const pick = <T>(v: unknown, allowed: readonly T[], d: T): T => (allowed.includes(v as T) ? (v as T) : d);
const strs = (v: unknown) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []);

function cleanSettings(raw: unknown): Settings {
  const d = defaultSettings(); const r = isObj(raw) ? raw : {}; const vol = isObj(r.volume) ? r.volume : {};
  return {
    ...r,
    lang: pick(r.lang, ['de', 'en'] as const, d.lang), quality: pick(r.quality, ['low', 'mid', 'high', 'auto'] as const, d.quality),
    fpsCap: pick(r.fpsCap, [30, 60, 0] as const, d.fpsCap),
    volume: { ...vol, master: num(vol.master, d.volume.master, 0, 1), train: num(vol.train, d.volume.train, 0, 1), env: num(vol.env, d.volume.env, 0, 1), ui: num(vol.ui, d.volume.ui, 0, 1), voice: num(vol.voice, d.volume.voice, 0, 1) },
    assist: pick(r.assist, ['easy', 'standard', 'expert'] as const, d.assist), units: 'kmh', invertLook: bool(r.invertLook, d.invertLook),
    touchLayout: pick(r.touchLayout, ['left', 'right'] as const, d.touchLayout), hud: pick(r.hud, ['full', 'minimal'] as const, d.hud),
    announcements: bool(r.announcements, d.announcements), subtitles: bool(r.subtitles, d.subtitles), colorblind: bool(r.colorblind, d.colorblind),
    reducedMotion: bool(r.reducedMotion, d.reducedMotion), textScale: num(r.textScale, d.textScale, 0.75, 2),
  } as Settings;
}

function cleanProfile(raw: unknown, id: Slot): Profile | null {
  if (!isObj(raw) || typeof raw.name !== 'string') return null;
  const base = newProfile(id, raw.name.slice(0, 40) || undefined, num(raw.created, Date.now()));
  const c = isObj(raw.career) ? raw.career : {}, st = isObj(raw.stats) ? raw.stats : {};
  const sc: Profile['scenarios'] = {};
  if (isObj(raw.scenarios)) for (const [k, v] of Object.entries(raw.scenarios)) if (isObj(v)) {
    sc[k] = { ...v, best: num(v.best, 0), stars: num(v.stars, 0, 0, 5), done: bool(v.done, false) };
    if (typeof v.time === 'number') sc[k].time = v.time;
  }
  return {
    ...raw, ...base,
    updated: num(raw.updated, base.created),
    career: { ...c, rank: num(c.rank, 0, 0), xp: num(c.xp, 0, 0), exams: strs(c.exams), licences: strs(c.licences) },
    scenarios: sc, company: raw.company ?? null, settings: cleanSettings(raw.settings),
    stats: { ...st, km: num(st.km, 0, 0), hours: num(st.hours, 0, 0), trains: num(st.trains, 0, 0), spad: num(st.spad, 0, 0) },
    resume: raw.resume ?? null,
  } as Profile;
}

interface SaveData { v: number; active: Slot; profiles: (Profile | null)[] }

function cleanData(d: any): SaveData {
  const arr: unknown[] = Array.isArray(d?.profiles) ? d.profiles : [];
  const profiles = ([0, 1, 2] as Slot[]).map((i) => cleanProfile(arr[i], i));
  const active = pick(d?.active, [0, 1, 2] as const, 0);
  return { ...(isObj(d) ? d : {}), v: Math.max(SAVE_VERSION, num(d?.v, SAVE_VERSION)), active, profiles };
}

// ---------------------------------------------------------------- Migration
/** Schritt i hebt Version i auf i+1. Neue Version: SAVE_VERSION erhöhen und Schritt anhängen. */
const STEPS: ((d: any) => any)[] = [
  // v0 → v1: unversioniert. Entweder {profiles:[…]} oder ein einzelnes Profilobjekt (frühe Testversion) oder nichts.
  (d) => {
    if (isObj(d) && Array.isArray(d.profiles)) return { ...d, v: 1, active: d.active ?? 0 };
    if (isObj(d) && typeof d.name === 'string') return { v: 1, active: 0, profiles: [{ ...d, id: 0 }, null, null] };
    return { v: 1, active: 0, profiles: [null, null, null] };
  },
];

export function migrate(raw: any): { data: any; from: number } {
  const from = isObj(raw) && typeof raw.v === 'number' && Number.isInteger(raw.v) && raw.v >= 0 ? raw.v : 0;
  let d = raw, v = from;
  while (v < SAVE_VERSION) { d = STEPS[v](d); v++; d.v = v; }
  return { data: d, from };
}

// ---------------------------------------------------------------- Speicherzugriff (localStorage oder Speicher im RAM)
interface KV { get(k: string): string | null; set(k: string, v: string): void; del(k: string): void; keys(): string[] }
function makeKV(): { kv: KV; persistent: boolean } {
  try {
    const ls = (globalThis as any).localStorage as Storage | undefined;
    if (ls) {
      const probe = 'ricorail.probe'; ls.setItem(probe, '1'); ls.removeItem(probe);
      return {
        persistent: true,
        kv: {
          get: (k) => ls.getItem(k), set: (k, v) => ls.setItem(k, v), del: (k) => ls.removeItem(k),
          keys: () => { const out: string[] = []; for (let i = 0; i < ls.length; i++) { const k = ls.key(i); if (k !== null) out.push(k); } return out; },
        },
      };
    }
  } catch { /* privater Modus o. ä. */ }
  const m = new Map<string, string>();
  return { persistent: false, kv: { get: (k) => m.get(k) ?? null, set: (k, v) => void m.set(k, v), del: (k) => void m.delete(k), keys: () => [...m.keys()] } };
}

const isQuota = (e: unknown) => {
  const n = (e as any)?.name, c = (e as any)?.code;
  return n === 'QuotaExceededError' || n === 'NS_ERROR_DOM_QUOTA_REACHED' || c === 22 || c === 1014;
};

// ---------------------------------------------------------------- IndexedDB (Editor-Netze)
interface NetRec { id: string; name: string; updated: number; def: NetworkDef }
function idbOpen(): Promise<IDBDatabase | null> {
  const idb = (globalThis as any).indexedDB as IDBFactory | undefined;
  if (!idb) return Promise.resolve(null);
  return new Promise((res) => {
    // Hängt das Öffnen (manche WebViews), nach 4 s auf localStorage ausweichen
    const to = setTimeout(() => res(null), 4000);
    const done = (db: IDBDatabase | null) => { clearTimeout(to); res(db); };
    try {
      const rq = idb.open('ricorail', 1);
      rq.onupgradeneeded = () => { if (!rq.result.objectStoreNames.contains('nets')) rq.result.createObjectStore('nets', { keyPath: 'id' }); };
      rq.onsuccess = () => done(rq.result);
      rq.onerror = () => done(null);
      rq.onblocked = () => done(null);
    } catch { done(null); }
  });
}
function idbReq<T>(db: IDBDatabase, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  return new Promise((res, rej) => {
    const tx = db.transaction('nets', mode); const rq = fn(tx.objectStore('nets'));
    let val: T; rq.onsuccess = () => { val = rq.result as T; };
    tx.oncomplete = () => res(val); tx.onerror = () => rej(tx.error); tx.onabort = () => rej(tx.error);
  });
}

// ---------------------------------------------------------------- SaveStore
export class SaveStore {
  private kv: KV;
  /** false = kein dauerhafter Speicher (nur RAM) */
  readonly persistent: boolean;
  /** Letzter Fehler (deutscher Text) oder '' */
  lastError = '';
  /** Hinweis beim Laden (Wiederherstellung, Sicherung …) oder '' */
  notice = '';
  private data: SaveData;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private dbP: Promise<IDBDatabase | null> | null = null;

  private constructor() {
    const { kv, persistent } = makeKV(); this.kv = kv; this.persistent = persistent;
    if (!persistent) this.lastError = SAVE_TEXT.noStorage;
    this.data = { v: SAVE_VERSION, active: 0, profiles: [null, null, null] };
  }

  static async open(): Promise<SaveStore> {
    const s = new SaveStore();
    try { s.load(); } catch (e) { s.data = { v: SAVE_VERSION, active: 0, profiles: [null, null, null] }; s.lastError = String((e as Error)?.message ?? e); }
    if (!s.data.profiles[s.data.active]) s.data.profiles[s.data.active] = newProfile(s.data.active);
    return s;
  }

  private parse(text: string | null): SaveData | null {
    if (text === null) return null;
    try { const raw = JSON.parse(text); if (!isObj(raw)) return null; const { data } = migrate(raw); return isObj(data) ? cleanData(data) : null; } catch { return null; }
  }

  private load() {
    let main: string | null = null;
    try { main = this.kv.get(KEY); } catch { /* ignorieren */ }
    const d = this.parse(main);
    if (d) {
      if (num((JSON.parse(main!) as any).v, 0) > SAVE_VERSION) this.notice = SAVE_TEXT.newer;
      this.data = d; return;
    }
    if (main !== null) {
      // Beschädigt: Rohdaten sichern, dann letzte gute Kopie versuchen
      this.backup(main);
      let prev: string | null = null;
      try { prev = this.kv.get(KEY_PREV); } catch { /* ignorieren */ }
      const p = this.parse(prev);
      if (p) { this.data = p; this.notice = SAVE_TEXT.restoredPrev; } else this.notice = SAVE_TEXT.corrupt;
      return;
    }
    // Erster Start (oder nur Vorgängerkopie vorhanden)
    let prev: string | null = null;
    try { prev = this.kv.get(KEY_PREV); } catch { /* ignorieren */ }
    const p = this.parse(prev); if (p) this.data = p;
  }

  private backup(raw: string) {
    try {
      this.kv.set(KEY_BACKUP + Date.now(), raw);
      const old = this.kv.keys().filter((k) => k.startsWith(KEY_BACKUP)).sort((a, b) => Number(a.slice(KEY_BACKUP.length)) - Number(b.slice(KEY_BACKUP.length)));
      while (old.length > MAX_BACKUPS) this.kv.del(old.shift()!);
    } catch { /* Sicherung best effort */ }
  }

  get active(): Profile { return this.data.profiles[this.data.active] ?? this.select(this.data.active); }
  get activeId(): Slot { return this.data.active; }
  profiles(): (Profile | null)[] { return [...this.data.profiles]; }

  select(id: Slot): Profile {
    let p = this.data.profiles[id];
    if (!p) { p = newProfile(id); this.data.profiles[id] = p; }
    this.data.active = id; this.autosave();
    return p;
  }
  rename(id: Slot, name: string): void {
    const p = this.data.profiles[id] ?? (this.data.profiles[id] = newProfile(id));
    p.name = String(name ?? '').trim().slice(0, 40) || `${SAVE_TEXT.player} ${id + 1}`; p.updated = Date.now(); this.autosave();
  }
  /** Setzt das Profil auf Anfang zurück (Name bleibt). Leere Plätze bleiben leer – außer dem aktiven. */
  reset(id: Slot): void {
    const old = this.data.profiles[id];
    this.data.profiles[id] = old || id === this.data.active ? newProfile(id, old?.name) : null;
    this.autosave();
  }

  /** Schreiben, zurücklesen, vergleichen. false bei Fehler – vorherige Kopie bleibt erhalten. */
  async save(): Promise<boolean> {
    if (this.timer) { clearTimeout(this.timer); this.timer = null; }
    const p = this.data.profiles[this.data.active]; if (p) p.updated = Date.now();
    const r = this.write();
    if (r === 'mem') { this.lastError = SAVE_TEXT.noStorage; return false; }
    if (r === 'ok') this.lastError = '';
    return r === 'ok';
  }
  /** Synchrones Schreiben mit Prüfung. 'mem' = nur im RAM (kein dauerhafter Speicher). */
  private write(): 'ok' | 'mem' | 'fail' {
    let text: string;
    try { text = JSON.stringify(this.data); } catch (e) { this.lastError = String((e as Error).message); return 'fail'; }
    let old: string | null = null;
    try { old = this.kv.get(KEY); } catch { /* ignorieren */ }
    try {
      if (old !== null && old !== text && this.parse(old)) this.kv.set(KEY_PREV, old);
      this.kv.set(KEY, text);
      if (this.kv.get(KEY) !== text) throw new Error(SAVE_TEXT.verify);
    } catch (e) {
      this.lastError = isQuota(e) ? SAVE_TEXT.quota : (e as Error)?.message || SAVE_TEXT.verify;
      try { if (old !== null) this.kv.set(KEY, old); } catch { /* vorherige Kopie liegt ggf. noch in KEY_PREV */ }
      return 'fail';
    }
    return this.persistent ? 'ok' : 'mem';
  }

  /** Verzögertes Speichern (2 s nach der letzten Änderung) */
  autosave(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => { this.timer = null; void this.save(); }, 2000);
  }

  exportJSON(): string {
    return JSON.stringify({ app: 'ricorail', exported: new Date().toISOString(), ...this.data }, null, 1);
  }

  importJSON(text: string): { ok: boolean; msg: string } {
    let raw: any;
    try { raw = JSON.parse(text); } catch { return { ok: false, msg: SAVE_TEXT.importBadJson }; }
    if (!isObj(raw) || (raw.app !== undefined && raw.app !== 'ricorail')) return { ok: false, msg: SAVE_TEXT.importBadShape };
    if (typeof raw.v === 'number' && !Array.isArray(raw.profiles)) return { ok: false, msg: SAVE_TEXT.importBadShape };
    let d: SaveData;
    try { d = cleanData(migrate(raw).data); } catch { return { ok: false, msg: SAVE_TEXT.importBadShape }; }
    if (!d.profiles.some(Boolean)) return { ok: false, msg: SAVE_TEXT.importBadShape };
    delete (d as any).app; delete (d as any).exported;
    if (!d.profiles[d.active]) d.active = d.profiles.findIndex(Boolean) as Slot;
    const before = this.data;
    this.data = d;
    if (this.write() === 'fail') { this.data = before; return { ok: false, msg: SAVE_TEXT.importSaveFail }; }
    return { ok: true, msg: SAVE_TEXT.importOk };
  }

  // ---------------------------------------------------------------- Editor-Netze
  private db(): Promise<IDBDatabase | null> { return (this.dbP ??= idbOpen()); }

  async listNets(): Promise<{ id: string; name: string; updated: number }[]> {
    const db = await this.db();
    let out: { id: string; name: string; updated: number }[] = [];
    if (db) {
      try { const all = await idbReq<NetRec[]>(db, 'readonly', (s) => s.getAll()); out = all.map((r) => ({ id: r.id, name: r.name, updated: r.updated })); }
      catch (e) { this.lastError = String((e as Error)?.message ?? e); }
    } else {
      for (const k of this.kv.keys()) if (k.startsWith(KEY_NET)) {
        try { const r = JSON.parse(this.kv.get(k)!) as NetRec; out.push({ id: r.id, name: r.name, updated: r.updated }); } catch { /* beschädigt: überspringen */ }
      }
    }
    return out.sort((a, b) => b.updated - a.updated);
  }

  async loadNet(id: string): Promise<NetworkDef | null> {
    const db = await this.db();
    try {
      if (db) { const r = await idbReq<NetRec | undefined>(db, 'readonly', (s) => s.get(id)); return r?.def ?? null; }
      const t = this.kv.get(KEY_NET + id); return t ? (JSON.parse(t) as NetRec).def : null;
    } catch (e) { this.lastError = String((e as Error)?.message ?? e); return null; }
  }

  async saveNet(def: NetworkDef): Promise<boolean> {
    if (!def || typeof def.id !== 'string' || !def.id || def.schema !== NETWORK_SCHEMA) { this.lastError = SAVE_TEXT.netSaveFail; return false; }
    const rec: NetRec = { id: def.id, name: def.name || def.id, updated: Date.now(), def };
    const db = await this.db();
    try {
      const text = JSON.stringify(rec);
      if (db) {
        await idbReq(db, 'readwrite', (s) => s.put(JSON.parse(text)));
        const back = await idbReq<NetRec | undefined>(db, 'readonly', (s) => s.get(def.id));
        if (!back || JSON.stringify(back) !== text) throw new Error(SAVE_TEXT.netSaveFail);
      } else {
        const k = KEY_NET + def.id, old = this.kv.get(k);
        try { this.kv.set(k, text); if (this.kv.get(k) !== text) throw new Error(SAVE_TEXT.netSaveFail); }
        catch (e) { try { if (old !== null) this.kv.set(k, old); else this.kv.del(k); } catch { /* ignorieren */ } throw e; }
      }
      return true;
    } catch (e) { this.lastError = isQuota(e) ? SAVE_TEXT.quota : SAVE_TEXT.netSaveFail; return false; }
  }

  async deleteNet(id: string): Promise<void> {
    const db = await this.db();
    try { if (db) await idbReq(db, 'readwrite', (s) => s.delete(id)); else this.kv.del(KEY_NET + id); }
    catch (e) { this.lastError = String((e as Error)?.message ?? e); }
  }
}
