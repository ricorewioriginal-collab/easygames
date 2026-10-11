/** Lokale Speicherung: versioniert, validiert, beschädigungssicher. Es gibt KEINE Konten und keine Cloud – alles bleibt im Browser. */
export const SAVE_VERSION = 2;
const KEY = 'turbokick.save';
const BACKUP = 'turbokick.save.backup';

export type QualityChoice = 'auto' | 'low' | 'medium' | 'high';
export type ColorMode = 'standard' | 'protanopia' | 'deuteranopia' | 'tritanopia';
export type ArenaChoice = 'neon' | 'eis' | 'canyon' | 'zufall';
export type Difficulty = 'easy' | 'normal' | 'hard' | 'pro';

export interface Settings {
  master: number;
  music: number;
  sfx: number;
  muted: boolean;
  quality: QualityChoice;
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  colorMode: ColorMode;
  cameraShake: boolean;
  touchControls: 'auto' | 'on' | 'off';
  /** Horizontales Kamera-Sichtfeld in Grad (Hochformat zoomt automatisch weiter heraus) */
  fov: number;
  /** Kameraabstand 0.7 … 1.4 */
  camDistance: number;
  /** Ball-Kamera beim Start an */
  ballCam: boolean;
  /** Einfache Touch-Steuerung: Der Stick zeigt die Richtung auf dem Bildschirm, das Auto lenkt selbst dorthin */
  touchAssist: boolean;
  /** Öffentlichen STUN-Dienst für Verbindungen ohne Server nutzen */
  useStun: boolean;
  language: string;
}

export interface Garage {
  body: string;
  decal: string;
  /** Akzentfarbe (Hex-String #rrggbb) oder leer = Teamfarbe */
  accent: string;
}

export interface Stats {
  matches: number;
  wins: number;
  goals: number;
  assists: number;
  demos: number;
  saves: number;
  playSeconds: number;
  onlineMatches: number;
  bestStreak: number;
  streak: number;
}

export interface SaveData {
  version: number;
  settings: Settings;
  profile: { name: string };
  garage: Garage;
  achievements: Record<string, number>;
  stats: Stats;
  lastSetup: { teamSize: 1 | 2 | 3; difficulty: Difficulty; minutes: number; arena: ArenaChoice; nitro: boolean };
}

export function defaultSave(): SaveData {
  return {
    version: SAVE_VERSION,
    settings: { master: 0.8, music: 0.5, sfx: 0.9, muted: false, quality: 'auto', reducedMotion: false, highContrast: false, largeText: false, colorMode: 'standard', cameraShake: true, touchControls: 'auto', fov: 100, camDistance: 1, ballCam: true, touchAssist: true, useStun: true, language: 'de' },
    profile: { name: 'Fahrer' },
    garage: { body: 'flitzer', decal: 'keins', accent: '' },
    achievements: {},
    stats: { matches: 0, wins: 0, goals: 0, assists: 0, demos: 0, saves: 0, playSeconds: 0, onlineMatches: 0, bestStreak: 0, streak: 0 },
    lastSetup: { teamSize: 2, difficulty: 'normal', minutes: 3, arena: 'zufall', nitro: true },
  };
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const num = (v: unknown, d: number, lo: number, hi: number): number => (typeof v === 'number' && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d);
const bool = (v: unknown, d: boolean): boolean => (typeof v === 'boolean' ? v : d);
const str = (v: unknown, d: string, max = 200): string => (typeof v === 'string' ? v.slice(0, max) : d);
const oneOf = <T extends string>(v: unknown, list: readonly T[], d: T): T => (typeof v === 'string' && (list as readonly string[]).includes(v) ? (v as T) : d);

/** Prüft beliebige Daten und macht daraus gültige SaveData (fehlende/ungültige Felder → Standardwerte). Migriert ältere Versionen. */
export function sanitize(raw: unknown): SaveData {
  const d = defaultSave();
  if (!isObj(raw)) return d;
  const s = isObj(raw.settings) ? raw.settings : {};
  const settings: Settings = {
    master: num(s.master, d.settings.master, 0, 1),
    music: num(s.music, d.settings.music, 0, 1),
    sfx: num(s.sfx, d.settings.sfx, 0, 1),
    muted: bool(s.muted, false),
    quality: oneOf(s.quality, ['auto', 'low', 'medium', 'high'], 'auto'),
    reducedMotion: bool(s.reducedMotion, false),
    highContrast: bool(s.highContrast, false),
    largeText: bool(s.largeText, false),
    colorMode: oneOf(s.colorMode, ['standard', 'protanopia', 'deuteranopia', 'tritanopia'], 'standard'),
    cameraShake: bool(s.cameraShake, true),
    touchControls: oneOf(s.touchControls, ['auto', 'on', 'off'], 'auto'),
    // Version 1 speicherte ein vertikales Sichtfeld (Standard 80) → auf das neue horizontale Maß heben
    fov: (typeof raw.version === 'number' && raw.version < 2) || s.fov === undefined ? 100 : num(s.fov, 100, 70, 120),
    camDistance: num(s.camDistance, 1, 0.7, 1.4),
    ballCam: bool(s.ballCam, true),
    touchAssist: bool(s.touchAssist, true),
    useStun: bool(s.useStun, true),
    language: str(s.language, 'de', 8),
  };
  const p = isObj(raw.profile) ? raw.profile : {};
  // eslint-disable-next-line no-control-regex
  const name = str(p.name, d.profile.name, 14).replace(/[\u0000-\u001f<>&"]/g, '').trim();
  const g = isObj(raw.garage) ? raw.garage : {};
  const garage: Garage = { body: str(g.body, d.garage.body, 20), decal: str(g.decal, d.garage.decal, 20), accent: /^#[0-9a-fA-F]{6}$/.test(str(g.accent, '')) ? str(g.accent, '') : '' };
  const achievements: Record<string, number> = {};
  if (isObj(raw.achievements)) for (const [k, v] of Object.entries(raw.achievements)) if (k.length <= 40 && typeof v === 'number' && Number.isFinite(v)) achievements[k] = v;
  const st = isObj(raw.stats) ? raw.stats : {};
  const n = (k: string): number => num(st[k], 0, 0, 1e9);
  const stats: Stats = { matches: n('matches'), wins: n('wins'), goals: n('goals'), assists: n('assists'), demos: n('demos'), saves: n('saves'), playSeconds: n('playSeconds'), onlineMatches: n('onlineMatches'), bestStreak: n('bestStreak'), streak: n('streak') };
  const ls = isObj(raw.lastSetup) ? raw.lastSetup : {};
  const lastSetup = {
    teamSize: oneOf(String(ls.teamSize), ['1', '2', '3'], '2') === '1' ? (1 as const) : String(ls.teamSize) === '3' ? (3 as const) : (2 as const),
    difficulty: oneOf(ls.difficulty, ['easy', 'normal', 'hard', 'pro'], 'normal'),
    minutes: Math.round(num(ls.minutes, 3, 1, 10)),
    arena: oneOf(ls.arena, ['neon', 'eis', 'canyon', 'zufall'], 'zufall'),
    nitro: bool(ls.nitro, true),
  };
  return { version: SAVE_VERSION, settings, profile: { name: name || d.profile.name }, garage, achievements, stats, lastSetup };
}

type Listener = (d: SaveData) => void;
export interface StorageLike {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
}

export class SaveStore {
  data: SaveData;
  private listeners: Listener[] = [];
  /** true, wenn beim Laden beschädigte Daten ersetzt wurden */
  recovered = false;
  persistent = true;

  constructor(private readonly storage: StorageLike | null = SaveStore.defaultStorage()) {
    this.data = this.load();
  }

  static defaultStorage(): StorageLike | null {
    try {
      return typeof localStorage === 'undefined' ? null : localStorage;
    } catch {
      return null;
    }
  }

  private load(): SaveData {
    if (!this.storage) {
      this.persistent = false;
      return defaultSave();
    }
    try {
      const txt = this.storage.getItem(KEY);
      if (txt === null) return defaultSave();
      return sanitize(JSON.parse(txt));
    } catch {
      this.recovered = true;
      try {
        const old = this.storage.getItem(KEY);
        if (old) this.storage.setItem(BACKUP, old);
      } catch {
        /* ignorieren */
      }
      return defaultSave();
    }
  }

  save(): void {
    if (!this.storage) return;
    try {
      this.storage.setItem(KEY, JSON.stringify(this.data));
    } catch {
      this.persistent = false;
    }
  }

  update(fn: (d: SaveData) => void): void {
    fn(this.data);
    this.data = sanitize(this.data);
    this.save();
    for (const l of this.listeners) l(this.data);
  }

  onChange(fn: Listener): () => void {
    this.listeners.push(fn);
    return () => (this.listeners = this.listeners.filter((l) => l !== fn));
  }

  reset(): void {
    this.update((d) => Object.assign(d, defaultSave()));
  }

  exportJson(): string {
    return JSON.stringify(this.data, null, 2);
  }
  importJson(txt: string): boolean {
    try {
      const raw: unknown = JSON.parse(txt);
      if (!isObj(raw)) return false;
      this.update((d) => Object.assign(d, sanitize(raw)));
      return true;
    } catch {
      return false;
    }
  }
}

export const store = new SaveStore();
