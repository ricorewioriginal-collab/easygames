import type { CharacterId } from '@shared/characters';
import { isCharacterId } from '@shared/characters';

/** Lokale Speicherung: versioniert, validiert, beschädigungssicher. Es gibt KEINE Konten und keine Cloud – alles bleibt im Browser. */
export const SAVE_VERSION = 2;
const KEY = 'partyverse.save';
const BACKUP = 'partyverse.save.backup';

export type QualityChoice = 'auto' | 'low' | 'medium' | 'high';
export type ColorMode = 'standard' | 'protanopia' | 'deuteranopia' | 'tritanopia';

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
  /** Eigener Spielserver (ws:// oder wss://), leer = Online-Modus aus */
  serverUrl: string;
  /** Öffentlichen STUN-Dienst für Verbindungen ohne Server nutzen (nötig, wenn Spieler in verschiedenen Netzen sind) */
  useStun: boolean;
  language: string;
}

export interface Cosmetics {
  hat: string | null;
  trail: string | null;
  dice: string;
}

export interface Stats {
  games: number;
  wins: number;
  minigamesPlayed: number;
  minigamesWon: number;
  coinsEarned: number;
  steps: number;
  onlineGames: number;
  playSeconds: number;
  perWorld: Record<string, number>;
}

export interface SaveData {
  version: number;
  settings: Settings;
  profile: { name: string; character: CharacterId };
  cosmetics: Cosmetics;
  /** Achievement-ID → Zeitstempel */
  achievements: Record<string, number>;
  stats: Stats;
  /** Zuletzt gewählte Spieleinstellungen */
  lastSetup: { layoutId: string; rounds: number; bots: number; difficulty: 'easy' | 'normal' | 'hard' };
  seenTutorial: boolean;
}

/** Standard-Serveradresse aus der Build-Konfiguration (VITE_SERVER_URL), sonst leer = Online aus */
function envServerUrl(): string {
  const v = (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_SERVER_URL;
  return typeof v === 'string' ? (normalizeServerUrl(v) ?? '') : '';
}

export function defaultSave(): SaveData {
  return {
    version: SAVE_VERSION,
    settings: { master: 0.8, music: 0.6, sfx: 0.9, muted: false, quality: 'auto', reducedMotion: false, highContrast: false, largeText: false, colorMode: 'standard', cameraShake: true, touchControls: 'auto', serverUrl: envServerUrl(), useStun: true, language: 'de' },
    profile: { name: 'Spieler', character: 'pip' },
    cosmetics: { hat: null, trail: null, dice: 'klassisch' },
    achievements: {},
    stats: { games: 0, wins: 0, minigamesPlayed: 0, minigamesWon: 0, coinsEarned: 0, steps: 0, onlineGames: 0, playSeconds: 0, perWorld: {} },
    lastSetup: { layoutId: 'prismara-01', rounds: 10, bots: 3, difficulty: 'normal' },
    seenTutorial: false,
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
    serverUrl: normalizeServerUrl(str(s.serverUrl, '', 200)) ?? '',
    useStun: bool(s.useStun, true),
    language: str(s.language, 'de', 8),
  };
  const p = isObj(raw.profile) ? raw.profile : {};
  // eslint-disable-next-line no-control-regex
  const name = str(p.name, d.profile.name, 14).replace(/[\u0000-\u001f<>&"]/g, '').trim();
  const profile = { name: name || d.profile.name, character: isCharacterId(p.character) ? p.character : d.profile.character };
  const c = isObj(raw.cosmetics) ? raw.cosmetics : {};
  const cosmetics: Cosmetics = { hat: typeof c.hat === 'string' ? c.hat.slice(0, 20) : null, trail: typeof c.trail === 'string' ? c.trail.slice(0, 20) : null, dice: str(c.dice, 'klassisch', 20) };
  const achievements: Record<string, number> = {};
  if (isObj(raw.achievements)) for (const [k, v] of Object.entries(raw.achievements)) if (k.length <= 40 && typeof v === 'number' && Number.isFinite(v)) achievements[k] = v;
  const st = isObj(raw.stats) ? raw.stats : {};
  const perWorld: Record<string, number> = {};
  if (isObj(st.perWorld)) for (const [k, v] of Object.entries(st.perWorld)) if (k.length <= 30) perWorld[k] = num(v, 0, 0, 1e6);
  const stats: Stats = {
    games: num(st.games, 0, 0, 1e7), wins: num(st.wins, 0, 0, 1e7), minigamesPlayed: num(st.minigamesPlayed, 0, 0, 1e7), minigamesWon: num(st.minigamesWon, 0, 0, 1e7),
    coinsEarned: num(st.coinsEarned, 0, 0, 1e9), steps: num(st.steps, 0, 0, 1e9), onlineGames: num(st.onlineGames, 0, 0, 1e7), playSeconds: num(st.playSeconds, 0, 0, 1e9), perWorld,
  };
  const ls = isObj(raw.lastSetup) ? raw.lastSetup : {};
  const lastSetup = {
    layoutId: /^[a-z-]+-\d{2}$/.test(str(ls.layoutId, '')) ? str(ls.layoutId, '') : d.lastSetup.layoutId,
    rounds: Math.round(num(ls.rounds, 10, 1, 30)),
    bots: Math.round(num(ls.bots, 3, 0, 3)),
    difficulty: oneOf(ls.difficulty, ['easy', 'normal', 'hard'], 'normal'),
  };
  return { version: SAVE_VERSION, settings, profile, cosmetics, achievements, stats, lastSetup, seenTutorial: bool(raw.seenTutorial, false) };
}

/** Akzeptiert nur ws:// oder wss://-Adressen (ohne Zugangsdaten); gibt die bereinigte Adresse oder null zurück. */
export function normalizeServerUrl(v: string): string | null {
  const s = v.trim();
  if (!s) return '';
  try {
    const u = new URL(s);
    if ((u.protocol !== 'ws:' && u.protocol !== 'wss:') || u.username || u.password) return null;
    return u.toString().replace(/\/$/, '');
  } catch {
    return null;
  }
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
      this.persistent = false; // voll oder gesperrt: Spiel läuft weiter, nur ohne Speichern
    }
  }

  /** Ändert die Daten und speichert */
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

  /** Export als JSON (zum Sichern) und Import mit Prüfung */
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
