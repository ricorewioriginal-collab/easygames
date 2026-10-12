/** Persistente lokale Spielstände, Einstellungen, Rekorde und Bestzeiten. */
import { DIFFICULTY_ORDER, isDifficulty, type Difficulty } from '../game/difficulty';
import { LEVELS } from '../game/levels';
import type { ModeId } from '../game/modes';
import {
  DEFAULT_EQUIPPED,
  EFFECTS,
  isUnlocked,
  type EffectSlot,
  type Progress,
} from '../game/unlocks';

export type Quality = 'auto' | 'low' | 'medium' | 'high';
export type TouchPads = 'auto' | 'on' | 'off';

export interface Settings {
  master: number;
  music: number;
  sfx: number;
  latencyMs: number;
  quality: Quality;
  shake: boolean;
  haptics: boolean;
  touchPads: TouchPads;
  reducedMotion: boolean;
  difficulty: Difficulty;
}

export interface RunRecord {
  bestScore: number;
  bestAccuracy: number;
  stars: number;
  bestCombo: number;
  clears: number;
  plays: number;
  /** Längste Überlebenszeit in Sekunden (Endlos/Präzision). */
  bestTime: number;
}

export interface Stats {
  plays: number;
  notesHit: number;
  perfects: number;
  orbs: number;
  playSeconds: number;
  bestCombo: number;
}

export interface SaveData {
  version: 1;
  settings: Settings;
  records: Record<string, RunRecord>;
  equipped: Record<EffectSlot, string>;
  stats: Stats;
  tutorialDone: boolean;
  lastLevel: string;
}

export interface RunResult {
  mode: ModeId;
  levelId: string;
  difficulty: Difficulty;
  score: number;
  accuracy: number;
  stars: number;
  maxCombo: number;
  cleared: boolean;
  seconds: number;
  notesHit: number;
  perfects: number;
  orbs: number;
}

export interface KV {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const STORAGE_KEY = 'prismrush.save.v1';

export const DEFAULT_SETTINGS: Settings = {
  master: 0.8,
  music: 0.8,
  sfx: 0.7,
  latencyMs: 0,
  quality: 'auto',
  shake: true,
  haptics: true,
  touchPads: 'auto',
  reducedMotion: false,
  difficulty: 'normal',
};

export function defaultSave(): SaveData {
  return {
    version: 1,
    settings: { ...DEFAULT_SETTINGS },
    records: {},
    equipped: { ...DEFAULT_EQUIPPED },
    stats: { plays: 0, notesHit: 0, perfects: 0, orbs: 0, playSeconds: 0, bestCombo: 0 },
    tutorialDone: false,
    lastLevel: LEVELS[0].id,
  };
}

const num = (v: unknown, def: number, min = -Infinity, max = Infinity): number =>
  typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : def;
const bool = (v: unknown, def: boolean): boolean => (typeof v === 'boolean' ? v : def);
const oneOf = <T extends string>(v: unknown, opts: readonly T[], def: T): T =>
  typeof v === 'string' && (opts as readonly string[]).includes(v) ? (v as T) : def;

/** Prüft und repariert geladene Daten, damit kaputte Spielstände nie abstürzen. */
export function sanitize(raw: unknown): SaveData {
  const d = defaultSave();
  if (!raw || typeof raw !== 'object') return d;
  const r = raw as Partial<Record<keyof SaveData, unknown>>;
  const s = (r.settings ?? {}) as Partial<Record<keyof Settings, unknown>>;
  d.settings = {
    master: num(s.master, d.settings.master, 0, 1),
    music: num(s.music, d.settings.music, 0, 1),
    sfx: num(s.sfx, d.settings.sfx, 0, 1),
    latencyMs: num(s.latencyMs, 0, -250, 250),
    quality: oneOf(s.quality, ['auto', 'low', 'medium', 'high'] as const, 'auto'),
    shake: bool(s.shake, true),
    haptics: bool(s.haptics, true),
    touchPads: oneOf(s.touchPads, ['auto', 'on', 'off'] as const, 'auto'),
    reducedMotion: bool(s.reducedMotion, false),
    difficulty: isDifficulty(s.difficulty) ? s.difficulty : 'normal',
  };
  if (r.records && typeof r.records === 'object') {
    for (const [k, v] of Object.entries(r.records as Record<string, unknown>)) {
      if (!v || typeof v !== 'object') continue;
      const x = v as Partial<Record<keyof RunRecord, unknown>>;
      d.records[k] = {
        bestScore: num(x.bestScore, 0, 0),
        bestAccuracy: num(x.bestAccuracy, 0, 0, 1),
        stars: Math.round(num(x.stars, 0, 0, 3)),
        bestCombo: num(x.bestCombo, 0, 0),
        clears: num(x.clears, 0, 0),
        plays: num(x.plays, 0, 0),
        bestTime: num(x.bestTime, 0, 0),
      };
    }
  }
  if (r.equipped && typeof r.equipped === 'object') {
    const e = r.equipped as Record<string, unknown>;
    for (const slot of Object.keys(d.equipped) as EffectSlot[]) {
      const id = e[slot];
      if (typeof id === 'string' && EFFECTS.some((x) => x.id === id && x.slot === slot)) {
        d.equipped[slot] = id;
      }
    }
  }
  const st = (r.stats ?? {}) as Partial<Record<keyof Stats, unknown>>;
  d.stats = {
    plays: num(st.plays, 0, 0),
    notesHit: num(st.notesHit, 0, 0),
    perfects: num(st.perfects, 0, 0),
    orbs: num(st.orbs, 0, 0),
    playSeconds: num(st.playSeconds, 0, 0),
    bestCombo: num(st.bestCombo, 0, 0),
  };
  d.tutorialDone = bool(r.tutorialDone, false);
  if (typeof r.lastLevel === 'string' && LEVELS.some((l) => l.id === r.lastLevel)) {
    d.lastLevel = r.lastLevel;
  }
  return d;
}

export function recordKey(mode: ModeId, levelId: string, difficulty: Difficulty): string {
  return `${mode}:${levelId}:${difficulty}`;
}

export function memoryKV(): KV {
  const m = new Map<string, string>();
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => void m.set(k, v),
    removeItem: (k) => void m.delete(k),
  };
}

export class SaveStore {
  data: SaveData;

  constructor(private readonly kv: KV) {
    this.data = this.load();
  }

  private load(): SaveData {
    try {
      const raw = this.kv.getItem(STORAGE_KEY);
      return raw ? sanitize(JSON.parse(raw)) : defaultSave();
    } catch {
      return defaultSave();
    }
  }

  save(): void {
    try {
      this.kv.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch {
      // Speicher voll oder blockiert: Spiel läuft trotzdem weiter.
    }
  }

  get settings(): Settings {
    return this.data.settings;
  }

  updateSettings(patch: Partial<Settings>): void {
    Object.assign(this.data.settings, patch);
    this.save();
  }

  record(key: string): RunRecord | undefined {
    return this.data.records[key];
  }

  /** Speichert ein Laufergebnis und meldet neue Bestwerte. */
  recordRun(r: RunResult): { newBestScore: boolean; newBestTime: boolean } {
    const key = recordKey(r.mode, r.levelId, r.difficulty);
    const prev = this.data.records[key] ?? {
      bestScore: 0,
      bestAccuracy: 0,
      stars: 0,
      bestCombo: 0,
      clears: 0,
      plays: 0,
      bestTime: 0,
    };
    const newBestScore = r.score > prev.bestScore;
    const newBestTime =
      r.seconds > prev.bestTime && (r.mode === 'endless' || r.mode === 'hardcore');
    this.data.records[key] = {
      bestScore: Math.max(prev.bestScore, Math.round(r.score)),
      bestAccuracy: r.cleared ? Math.max(prev.bestAccuracy, r.accuracy) : prev.bestAccuracy,
      stars: Math.max(prev.stars, r.stars),
      bestCombo: Math.max(prev.bestCombo, r.maxCombo),
      clears: prev.clears + (r.cleared ? 1 : 0),
      plays: prev.plays + 1,
      bestTime: Math.max(prev.bestTime, r.seconds),
    };
    const st = this.data.stats;
    st.plays++;
    st.notesHit += r.notesHit;
    st.perfects += r.perfects;
    st.orbs += r.orbs;
    st.playSeconds += r.seconds;
    st.bestCombo = Math.max(st.bestCombo, r.maxCombo);
    if (r.mode === 'tutorial' && r.cleared) this.data.tutorialDone = true;
    if (r.mode === 'campaign') this.data.lastLevel = r.levelId;
    this.save();
    return { newBestScore, newBestTime };
  }

  /** Beste Sterne eines Kampagnenlevels über alle Schwierigkeiten. */
  levelStars(levelId: string): number {
    let best = 0;
    for (const d of DIFFICULTY_ORDER) {
      best = Math.max(best, this.data.records[recordKey('campaign', levelId, d)]?.stars ?? 0);
    }
    return best;
  }

  levelCleared(levelId: string): boolean {
    return DIFFICULTY_ORDER.some(
      (d) => (this.data.records[recordKey('campaign', levelId, d)]?.clears ?? 0) > 0,
    );
  }

  isLevelUnlocked(index: number): boolean {
    if (index <= 0) return true;
    const prev = LEVELS[index - 1];
    return prev ? this.levelCleared(prev.id) : false;
  }

  progress(): Progress {
    let totalStars = 0;
    let cleared = 0;
    let highest = -1;
    for (const l of LEVELS) {
      totalStars += this.levelStars(l.id);
      if (this.levelCleared(l.id)) {
        cleared++;
        highest = Math.max(highest, l.index);
      }
    }
    let endlessBest = 0;
    let dailyPlays = 0;
    let hardcoreClears = 0;
    for (const [k, v] of Object.entries(this.data.records)) {
      if (k.startsWith('endless:')) endlessBest = Math.max(endlessBest, v.bestTime);
      if (k.startsWith('daily:')) dailyPlays += v.plays;
      if (k.startsWith('hardcore:')) hardcoreClears += v.clears;
    }
    return {
      totalStars,
      clearedLevels: cleared,
      highestCleared: highest,
      bestCombo: this.data.stats.bestCombo,
      endlessBest,
      tutorialDone: this.data.tutorialDone,
      dailyPlays,
      hardcoreClears,
    };
  }

  equip(slot: EffectSlot, id: string): boolean {
    const item = EFFECTS.find((e) => e.id === id && e.slot === slot);
    if (!item || !isUnlocked(item, this.progress())) return false;
    this.data.equipped[slot] = id;
    this.save();
    return true;
  }

  reset(): void {
    const settings = this.data.settings;
    this.data = defaultSave();
    this.data.settings = settings;
    this.save();
  }
}
