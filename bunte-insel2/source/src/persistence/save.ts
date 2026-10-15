/* Spielstände: versioniertes Format, Migrationen, Prüfung, Sicherungskopie, Export/Import, Übernahme aus Bunte Insel 1.
   Speicherfehler führen nie zum Absturz – das Spiel läuft dann ohne Speichern weiter und meldet es. */
import { type Appearance, DEFAULT_APPEARANCE, sanitizeAppearance } from '../characters/appearance.ts';

export const SAVE_VERSION = 2;
export const SLOT_COUNT = 3;
export type GameMode = 'story' | 'free';

export interface QuestState { stage: number; progress: Record<string, number>; done: boolean; started: number; hints: number }
export interface NpcState { friend: number; lastTalkDay: number; talks: number; gifts: number }
export interface CreatureState { id: string; species: string; name: string; stage: number; bond: number; xp: number; hunger: number; mood: number }
export interface SaveData {
  version: number;
  slot: number;
  created: number;
  updated: number;
  playTime: number;
  mode: GameMode;
  name: string;
  look: Appearance;
  pos: { world: string; x: number; y: number; z: number; yaw: number };
  stars: number;
  xp: number;
  hp: number;
  inventory: Record<string, number>;
  equip: { sword: string; tool: string };
  cosmetics: string[];
  abilities: string[];
  quests: Record<string, QuestState>;
  tracked: string | null;
  story: { chapter: number; choices: Record<string, string>; seen: string[] };
  flags: Record<string, number>;
  discovered: string[];
  visited: string[];
  collected: string[];
  npcs: Record<string, NpcState>;
  achievements: string[];
  sammel: { fish: Record<string, { n: number; best: number }>; bugs: Record<string, number>; finds: Record<string, number> };
  companion: string | null;
  companions: string[];
  creatures: CreatureState[];
  cards: { owned: Record<string, number>; deck: string[] };
  clock: { day: number; t: number };
  fight: { defeated: number; bosses: string[]; faints: number };
  stats: Record<string, number>;
  imported: { from: string; stars: number; stickers: number; at: number } | null;
}

export interface Settings {
  version: number;
  quality: 'auto' | 'low' | 'medium' | 'high';
  musicVol: number;
  sfxVol: number;
  ambientVol: number;
  muted: boolean;
  tts: boolean;
  difficulty: 'easy' | 'normal' | 'hard';
  hints: 'off' | 'gentle' | 'full';
  invertY: boolean;
  camSens: number;
  showFps: boolean;
  keys: Record<string, string>;
  touchScale: number;
  reduceMotion: boolean;
  textSpeed: number;
}

export const DEFAULT_SETTINGS: Settings = {
  version: 1, quality: 'auto', musicVol: 0.6, sfxVol: 0.8, ambientVol: 0.6, muted: false, tts: false,
  difficulty: 'normal', hints: 'gentle', invertY: false, camSens: 1, showFps: false, keys: {}, touchScale: 1, reduceMotion: false, textSpeed: 1
};

export function newSave(slot: number, mode: GameMode, name: string, look: Appearance): SaveData {
  const now = Date.now();
  return {
    version: SAVE_VERSION, slot, created: now, updated: now, playTime: 0, mode, name: name.slice(0, 16) || 'Held', look,
    pos: { world: 'hub', x: 7, y: 2, z: -12, yaw: Math.PI },
    stars: 10, xp: 0, hp: 5, inventory: { apfel: 2 }, equip: { sword: 'holz', tool: 'none' }, cosmetics: [], abilities: ['doppelsprung'],
    quests: {}, tracked: null, story: { chapter: 0, choices: {}, seen: [] }, flags: {}, discovered: [], visited: ['hub'], collected: [],
    npcs: {}, achievements: [], sammel: { fish: {}, bugs: {}, finds: {} }, companion: 'blitz', companions: ['blitz', 'pappnase'],
    creatures: [], cards: { owned: { c_funke: 2, c_welle: 2, c_blatt: 2, c_stein: 1, c_wind: 1 }, deck: [] }, clock: { day: 1, t: 0.32 },
    fight: { defeated: 0, bosses: [], faints: 0 }, stats: {}, imported: null
  };
}

/* ---------- Prüfung ---------- */
const num = (v: unknown, d: number, min = -Infinity, max = Infinity): number => (typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : d);
const str = (v: unknown, d: string): string => (typeof v === 'string' ? v : d);
const strArr = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);
const rec = <T>(v: unknown, fix: (x: unknown) => T | null): Record<string, T> => {
  const out: Record<string, T> = {};
  if (v && typeof v === 'object' && !Array.isArray(v)) for (const [k, x] of Object.entries(v)) { const f = fix(x); if (f !== null) out[k] = f; }
  return out;
};
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {});

/** Füllt Lücken mit Standardwerten und verwirft kaputte Teile, statt den ganzen Spielstand zu verwerfen. */
export function sanitizeSave(raw: unknown, slot: number): SaveData {
  const s = obj(raw);
  const mode: GameMode = s.mode === 'free' ? 'free' : 'story';
  const base = newSave(slot, mode, str(s.name, 'Held'), sanitizeAppearance(s.look ?? DEFAULT_APPEARANCE));
  const pos = obj(s.pos);
  const story = obj(s.story);
  const sammel = obj(s.sammel);
  const cards = obj(s.cards);
  const fight = obj(s.fight);
  const clock = obj(s.clock);
  const equip = obj(s.equip);
  const imp = obj(s.imported);
  return {
    ...base,
    version: SAVE_VERSION,
    created: num(s.created, base.created),
    updated: num(s.updated, base.updated),
    playTime: num(s.playTime, 0, 0),
    pos: { world: str(pos.world, 'hub'), x: num(pos.x, base.pos.x), y: num(pos.y, base.pos.y, -50, 500), z: num(pos.z, base.pos.z), yaw: num(pos.yaw, 0) },
    stars: Math.floor(num(s.stars, base.stars, 0, 999999)),
    xp: Math.floor(num(s.xp, 0, 0)),
    hp: num(s.hp, 5, 1, 20),
    inventory: rec(s.inventory, x => (typeof x === 'number' && x > 0 ? Math.floor(x) : null)),
    equip: { sword: str(equip.sword, 'holz'), tool: str(equip.tool, 'none') },
    cosmetics: strArr(s.cosmetics),
    abilities: strArr(s.abilities).length ? strArr(s.abilities) : base.abilities,
    quests: rec(s.quests, x => {
      const q = obj(x); if (!x) return null;
      return { stage: Math.floor(num(q.stage, 0, 0)), progress: rec(q.progress, p => (typeof p === 'number' ? p : null)), done: q.done === true, started: num(q.started, 0), hints: num(q.hints, 0, 0) };
    }),
    tracked: typeof s.tracked === 'string' ? s.tracked : null,
    story: { chapter: Math.floor(num(story.chapter, 0, 0)), choices: rec(story.choices, c => (typeof c === 'string' ? c : null)), seen: strArr(story.seen) },
    flags: rec(s.flags, f => (typeof f === 'number' ? f : typeof f === 'boolean' ? (f ? 1 : 0) : null)),
    discovered: strArr(s.discovered),
    visited: strArr(s.visited).length ? strArr(s.visited) : ['hub'],
    collected: strArr(s.collected),
    npcs: rec(s.npcs, x => { const n = obj(x); return { friend: num(n.friend, 0, 0, 10), lastTalkDay: num(n.lastTalkDay, -1), talks: num(n.talks, 0, 0), gifts: num(n.gifts, 0, 0) }; }),
    achievements: strArr(s.achievements),
    sammel: {
      fish: rec(sammel.fish, x => { const f = obj(x); return { n: num(f.n, 0, 0), best: num(f.best, 0, 0) }; }),
      bugs: rec(sammel.bugs, x => (typeof x === 'number' ? x : null)),
      finds: rec(sammel.finds, x => (typeof x === 'number' ? x : null))
    },
    companion: typeof s.companion === 'string' || s.companion === null ? (s.companion as string | null) : 'blitz',
    companions: strArr(s.companions).length ? strArr(s.companions) : base.companions,
    creatures: Array.isArray(s.creatures) ? s.creatures.map(obj).filter(c => typeof c.id === 'string' && typeof c.species === 'string').map(c => ({
      id: c.id as string, species: c.species as string, name: str(c.name, 'Freund'), stage: num(c.stage, 0, 0, 3), bond: num(c.bond, 0, 0, 100), xp: num(c.xp, 0, 0), hunger: num(c.hunger, 50, 0, 100), mood: num(c.mood, 50, 0, 100)
    })) : [],
    cards: { owned: rec(cards.owned, x => (typeof x === 'number' && x > 0 ? Math.floor(x) : null)), deck: strArr(cards.deck) },
    clock: { day: Math.floor(num(clock.day, 1, 1)), t: num(clock.t, 0.32, 0, 1) },
    fight: { defeated: num(fight.defeated, 0, 0), bosses: strArr(fight.bosses), faints: num(fight.faints, 0, 0) },
    stats: rec(s.stats, x => (typeof x === 'number' ? x : null)),
    imported: s.imported ? { from: str(imp.from, 'bunte-insel'), stars: num(imp.stars, 0), stickers: num(imp.stickers, 0), at: num(imp.at, 0) } : null
  };
}

/* ---------- Migrationen ---------- */
export type Migration = (d: Record<string, unknown>) => Record<string, unknown>;
/** MIGRATIONS[n] hebt Version n auf n+1. */
export const MIGRATIONS: Record<number, Migration> = {
  /* Version 1 (Entwicklungsstand) speicherte die Figur unter "character" und Sterne unter "coins". */
  1: d => {
    const o = { ...d };
    if (o.character && !o.look) o.look = o.character;
    if (typeof o.coins === 'number' && typeof o.stars !== 'number') o.stars = o.coins;
    delete o.character; delete o.coins;
    o.version = 2;
    return o;
  }
};
export function migrate(raw: Record<string, unknown>, migrations: Record<number, Migration> = MIGRATIONS, target = SAVE_VERSION): Record<string, unknown> {
  let d = { ...raw };
  let v = typeof d.version === 'number' ? d.version : 1;
  if (v > target) throw new Error('Spielstand stammt aus einer neueren Version (' + v + ')');
  while (v < target) {
    const m = migrations[v];
    if (!m) throw new Error('Keine Migration für Version ' + v);
    d = m(d);
    v = typeof d.version === 'number' && d.version > v ? d.version : v + 1;
    d.version = v;
  }
  return d;
}

/* ---------- Speicher-Zugriff ---------- */
export interface KV { get(k: string): string | null; set(k: string, v: string): void; remove(k: string): void; }
export const browserKV = (): KV => ({
  get: k => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { localStorage.setItem(k, v); },
  remove: k => { try { localStorage.removeItem(k); } catch { /* egal */ } }
});
export const memoryKV = (): KV & { data: Map<string, string> } => {
  const data = new Map<string, string>();
  return { data, get: k => data.get(k) ?? null, set: (k, v) => { data.set(k, v); }, remove: k => { data.delete(k); } };
};

export const PREFIX = 'bunteInsel2.';
export const slotKey = (n: number): string => PREFIX + 'slot' + n;
export interface SlotInfo { slot: number; exists: boolean; corrupt: boolean; name: string; mode: GameMode; stars: number; level: number; chapter: number; playTime: number; updated: number; look: Appearance | null }
export type LoadResult = { ok: true; data: SaveData; fromBackup: boolean } | { ok: false; reason: 'empty' | 'corrupt' | 'newer'; message: string };

export const levelFromXp = (xp: number): number => {
  let lv = 1, need = 60, left = xp;
  while (left >= need && lv < 50) { left -= need; lv++; need = Math.round(need * 1.18 + 20); }
  return lv;
};
export const xpForLevel = (lv: number): { start: number; need: number } => {
  let start = 0, need = 60;
  for (let l = 1; l < lv; l++) { start += need; need = Math.round(need * 1.18 + 20); }
  return { start, need };
};

export class SaveStore {
  lastError = '';
  private kv: KV;
  constructor(kv: KV) { this.kv = kv; }
  private parse(txt: string | null, slot: number): LoadResult {
    if (txt == null) return { ok: false, reason: 'empty', message: 'leer' };
    try {
      const raw = JSON.parse(txt);
      if (!raw || typeof raw !== 'object') throw new Error('kein Objekt');
      const m = migrate(raw as Record<string, unknown>);
      return { ok: true, data: sanitizeSave(m, slot), fromBackup: false };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { ok: false, reason: /neueren/.test(msg) ? 'newer' : 'corrupt', message: msg };
    }
  }
  load(slot: number): LoadResult {
    const main = this.parse(this.kv.get(slotKey(slot)), slot);
    if (main.ok || main.reason === 'empty' || main.reason === 'newer') return main;
    const bak = this.parse(this.kv.get(slotKey(slot) + '.bak'), slot);
    if (bak.ok) return { ok: true, data: bak.data, fromBackup: true };
    return main;
  }
  /** Speichert; der vorige gültige Stand bleibt als .bak erhalten. Gibt false zurück, wenn der Browser nichts speichern lässt. */
  save(d: SaveData): boolean {
    d.updated = Date.now();
    const key = slotKey(d.slot);
    try {
      const prev = this.kv.get(key);
      if (prev && this.parse(prev, d.slot).ok) this.kv.set(key + '.bak', prev);
      this.kv.set(key, JSON.stringify(d));
      this.lastError = '';
      return true;
    } catch (e) {
      this.lastError = e instanceof Error ? e.message : String(e);
      return false;
    }
  }
  remove(slot: number): void { this.kv.remove(slotKey(slot)); this.kv.remove(slotKey(slot) + '.bak'); }
  info(slot: number): SlotInfo {
    const txt = this.kv.get(slotKey(slot));
    const empty: SlotInfo = { slot, exists: false, corrupt: false, name: '', mode: 'story', stars: 0, level: 1, chapter: 0, playTime: 0, updated: 0, look: null };
    if (txt == null) return empty;
    const r = this.load(slot);
    if (!r.ok) return { ...empty, exists: true, corrupt: true };
    const d = r.data;
    return { slot, exists: true, corrupt: false, name: d.name, mode: d.mode, stars: d.stars, level: levelFromXp(d.xp), chapter: d.story.chapter, playTime: d.playTime, updated: d.updated, look: d.look };
  }
  exportSlot(slot: number): string | null {
    const r = this.load(slot);
    if (!r.ok) return null;
    return JSON.stringify({ game: 'bunte-insel-2', format: SAVE_VERSION, exported: Date.now(), data: r.data });
  }
  importSlot(slot: number, text: string): { ok: boolean; message: string } {
    try {
      const o = JSON.parse(text);
      if (!o || o.game !== 'bunte-insel-2' || typeof o.data !== 'object') return { ok: false, message: 'Das ist keine Sicherungsdatei von Bunte Insel 2.' };
      const d = sanitizeSave(migrate(o.data), slot);
      d.slot = slot;
      return this.save(d) ? { ok: true, message: 'Spielstand geladen.' } : { ok: false, message: 'Speichern im Browser nicht möglich.' };
    } catch (e) {
      return { ok: false, message: 'Datei ist beschädigt: ' + (e instanceof Error ? e.message : String(e)) };
    }
  }
  getMeta(): { last: number } {
    try { const m = JSON.parse(this.kv.get(PREFIX + 'meta') || '{}'); return { last: typeof m.last === 'number' ? m.last : 0 }; } catch { return { last: 0 }; }
  }
  setMeta(m: { last: number }): void { try { this.kv.set(PREFIX + 'meta', JSON.stringify(m)); } catch { /* egal */ } }
  loadSettings(): Settings {
    try {
      const s = JSON.parse(this.kv.get(PREFIX + 'settings') || '{}') as Partial<Settings>;
      const out = { ...DEFAULT_SETTINGS, ...s };
      if (!['auto', 'low', 'medium', 'high'].includes(out.quality)) out.quality = 'auto';
      if (!['easy', 'normal', 'hard'].includes(out.difficulty)) out.difficulty = 'normal';
      if (!['off', 'gentle', 'full'].includes(out.hints)) out.hints = 'gentle';
      for (const k of ['musicVol', 'sfxVol', 'ambientVol', 'camSens', 'touchScale', 'textSpeed'] as const) out[k] = num(out[k], DEFAULT_SETTINGS[k], 0, 3);
      out.keys = out.keys && typeof out.keys === 'object' ? out.keys : {};
      return out;
    } catch { return { ...DEFAULT_SETTINGS }; }
  }
  saveSettings(s: Settings): void { try { this.kv.set(PREFIX + 'settings', JSON.stringify(s)); } catch { /* egal */ } }
}

/* ---------- Bunte Insel 1: Spielstände nur LESEN ---------- */
export interface BI1Info { slot: number; stars: number; name: string; stickers: number; pet: string; hero: string; storyChapter: number }
const bi1Key = (s: number) => 'bunteInsel.' + (s === 1 ? '' : 's' + s + '.') + 'save';
/** Liest die Spielstände des Originals (bunteInsel.save, bunteInsel.s2.save, bunteInsel.s3.save). Schreibt NIE dorthin. */
export function readBI1Saves(kv: KV): BI1Info[] {
  const out: BI1Info[] = [];
  for (let s = 1; s <= 3; s++) {
    const txt = kv.get(bi1Key(s));
    if (!txt) continue;
    try {
      const v = JSON.parse(txt);
      if (!v || typeof v !== 'object') continue;
      const st = obj(v.story);
      out.push({ slot: s, stars: num(v.stars, 0, 0), name: str(v.pname, ''), stickers: Array.isArray(v.stk) ? v.stk.length : 0, pet: str(v.pet, 'blitz'), hero: str(v.hero, 'jannis'), storyChapter: num(st.c, 0, 0) });
    } catch { /* kaputter Originalstand wird übersprungen */ }
  }
  return out;
}
/** Erinnerungen aus Bunte Insel 1 in einen NEUEN BI2-Spielstand übernehmen: Name, Startsterne (gedeckelt), Abzeichen. */
export function applyBI1Import(d: SaveData, info: BI1Info): SaveData {
  const bonus = Math.min(300, Math.floor(info.stars / 4));
  d.stars += bonus;
  if (info.name) d.name = info.name.slice(0, 16);
  d.imported = { from: 'bunte-insel', stars: bonus, stickers: info.stickers, at: Date.now() };
  if (!d.cosmetics.includes('erinnerung')) d.cosmetics.push('erinnerung');
  if (info.stickers >= 40 && !d.cosmetics.includes('hat:krone')) d.cosmetics.push('hat:krone');
  d.flags.bi1_veteran = 1;
  return d;
}
