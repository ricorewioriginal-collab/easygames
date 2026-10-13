// Spielerprofil: Name, Stufe, EP, Kosmetik, Herausforderungen, Statistik und Matchhistorie (lokal).
import { BACKS, EMOTES, GLIDERS, HATS, OUTFITS, PICKAXES, VICTORY_POSES } from '../../../shared/src/cosmetics';
import { challengesFor, levelFromXp, matchXp, statFromResult, type Challenge, type XpLine } from '../../../shared/src/progression';
import { defaultCosmetics, type Cosmetics, type PlacementResult } from '../../../shared/src/types';
import { load, save } from './storage';

export interface HistoryEntry {
  date: number;
  mode: string;
  online: boolean;
  place: number;
  of: number;
  kills: number;
  damage: number;
  survived: number;
  xp: number;
  won: boolean;
}

export interface Totals {
  matches: number;
  wins: number;
  top10: number;
  kills: number;
  deaths: number;
  damage: number;
  survived: number;
  built: number;
  harvested: number;
  chests: number;
  revives: number;
  headshots: number;
  distance: number;
  bestKills: number;
  bestPlace: number;
}

export interface ProfileData {
  id: string;
  name: string;
  xp: number;
  cos: Cosmetics;
  emotes: number[];
  challengeProgress: Record<string, number>;
  claimed: string[];
  bonusUnlocks: string[];
  totals: Totals;
  history: HistoryEntry[];
  seenLevel: number;
}

const randomId = (): string => {
  const a = new Uint8Array(12);
  (globalThis.crypto ?? { getRandomValues: (x: Uint8Array) => x.map(() => Math.floor(Math.random() * 256)) }).getRandomValues(a);
  return Array.from(a, (b) => b.toString(16).padStart(2, '0')).join('');
};

const NAMES_A = ['Flink', 'Wild', 'Leise', 'Kühn', 'Hell', 'Schnell', 'Sturm', 'Rift', 'Funk', 'Glut'];
const NAMES_B = ['fuchs', 'falke', 'wolf', 'luchs', 'otter', 'rabe', 'dachs', 'hase', 'eule', 'biber'];

const DEFAULT_TOTALS: Totals = {
  matches: 0,
  wins: 0,
  top10: 0,
  kills: 0,
  deaths: 0,
  damage: 0,
  survived: 0,
  built: 0,
  harvested: 0,
  chests: 0,
  revives: 0,
  headshots: 0,
  distance: 0,
  bestKills: 0,
  bestPlace: 0,
};

function defaults(): ProfileData {
  return {
    id: randomId(),
    name: NAMES_A[Math.floor(Math.random() * NAMES_A.length)]! + NAMES_B[Math.floor(Math.random() * NAMES_B.length)]! + Math.floor(Math.random() * 90 + 10),
    xp: 0,
    cos: defaultCosmetics(),
    emotes: [0, 1, 9, 2],
    challengeProgress: {},
    claimed: [],
    bonusUnlocks: [],
    totals: { ...DEFAULT_TOTALS },
    history: [],
    seenLevel: 1,
  };
}

export interface MatchSummary {
  lines: XpLine[];
  total: number;
  levelBefore: number;
  levelAfter: number;
  completed: Challenge[];
}

class Profile {
  data: ProfileData;
  constructor() {
    this.data = load<ProfileData>('profile', defaults());
    this.data.totals = { ...DEFAULT_TOTALS, ...this.data.totals };
    if (!this.data.id) this.data.id = randomId();
    this.data.cos = { ...defaultCosmetics(), ...this.data.cos };
    save('profile', this.data);
  }
  save(): void {
    save('profile', this.data);
  }
  get level(): number {
    return levelFromXp(this.data.xp).level;
  }
  get levelInfo(): { level: number; into: number; need: number } {
    return levelFromXp(this.data.xp);
  }
  setName(n: string): void {
    const clean = n.replace(/[^\p{L}\p{N} _.-]/gu, '').trim().slice(0, 16);
    if (clean.length >= 2) {
      this.data.name = clean;
      this.save();
    }
  }
  /** Ist ein kosmetischer Gegenstand freigeschaltet? */
  unlocked(kind: 'outfit' | 'hat' | 'back' | 'glider' | 'pickaxe' | 'emote' | 'victory', id: number): boolean {
    const lists = { outfit: OUTFITS, hat: HATS, back: BACKS, glider: GLIDERS, pickaxe: PICKAXES, emote: EMOTES, victory: VICTORY_POSES };
    const def = (lists[kind] as readonly { id: number; level: number }[]).find((d) => d.id === id);
    if (!def) return false;
    return def.level <= this.level || this.data.bonusUnlocks.includes(`${kind}:${id}`);
  }
  equip(kind: keyof Cosmetics, id: number): void {
    this.data.cos[kind] = id;
    this.save();
  }
  challenges(): (Challenge & { progress: number; done: boolean })[] {
    return challengesFor(new Date()).map((c) => {
      const progress = this.data.challengeProgress[c.id] ?? 0;
      return { ...c, progress: Math.min(progress, c.goal), done: progress >= c.goal };
    });
  }

  /** Match auswerten: EP, Herausforderungen, Statistik, Historie. */
  recordMatch(r: PlacementResult, players: number, teamSize: number, mode: string, online: boolean): MatchSummary {
    const before = this.level;
    const lines = matchXp(r, players, teamSize);
    const completed: Challenge[] = [];
    for (const c of this.challenges()) {
      if (c.done) continue;
      const add = statFromResult(c.stat, r);
      const np = (this.data.challengeProgress[c.id] ?? 0) + add;
      this.data.challengeProgress[c.id] = np;
      if (np >= c.goal) {
        completed.push(c);
        lines.push({ label: `Herausforderung: ${c.text}`, xp: c.xp });
      }
    }
    // alte Fortschritte aufräumen
    const live = new Set(challengesFor(new Date()).map((c) => c.id));
    for (const k of Object.keys(this.data.challengeProgress)) if (!live.has(k)) delete this.data.challengeProgress[k];
    const total = lines.reduce((s, l) => s + l.xp, 0);
    this.data.xp += total;
    const t = this.data.totals;
    t.matches++;
    if (r.won) t.wins++;
    if (r.place <= 10) t.top10++;
    t.kills += r.kills;
    if (!r.won) t.deaths++;
    t.damage += r.damage;
    t.survived += r.survived;
    t.built += r.built;
    t.harvested += r.harvested;
    t.chests += r.chests;
    t.revives += r.revives;
    t.headshots += r.headshots;
    t.distance += r.distance;
    t.bestKills = Math.max(t.bestKills, r.kills);
    t.bestPlace = t.bestPlace ? Math.min(t.bestPlace, r.place) : r.place;
    this.data.history.unshift({ date: Date.now(), mode, online, place: r.place, of: Math.ceil(players / teamSize), kills: r.kills, damage: r.damage, survived: r.survived, xp: total, won: r.won });
    this.data.history = this.data.history.slice(0, 50);
    this.save();
    return { lines, total, levelBefore: before, levelAfter: this.level, completed };
  }
}

export const profile = new Profile();
