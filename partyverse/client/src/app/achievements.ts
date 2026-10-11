import type { SaveData, Stats } from './save';

/** Reine Logik (kein DOM): Erfolge, Statistik-Fortschreibung und Kosmetik-Freischaltungen. */

export type CosmeticKind = 'hat' | 'trail' | 'dice';

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  /** Zielwert für den Fortschrittsbalken */
  goal: number;
  /** Fortschritt aus der Gesamtstatistik (Erfolg gilt bei progress >= goal) */
  progress(stats: Stats): number;
  /** Erfolge, die nur an einem einzelnen Spiel hängen: wird nach jedem Spiel geprüft */
  onGame?(g: GameSummary): boolean;
  unlocks?: { hat?: string; trail?: string; dice?: string };
}

export interface GameSummary {
  layoutId: string;
  world: string;
  won: boolean;
  online: boolean;
  rounds: number;
  players: number;
  coinsEarned: number;
  steps: number;
  minigameWins: number;
  minigamesPlayed: number;
  seconds: number;
  finalShards: number;
  /** Platz 1 = Sieger */
  rank: number;
}

const WORLD_COUNT = 5;
/** Zahl >= 0, sonst 0 (schützt vor NaN, Infinity, negativen und falschen Typen) */
const n = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : 0);
const worldsPlayed = (s: Stats): number => Object.values(s.perWorld ?? {}).filter((v) => n(v) > 0).length;

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'erstes-spiel', name: 'Erster Schritt', description: 'Beende deine erste Partie.', goal: 1, progress: (s) => n(s.games) },
  { id: 'stammgast', name: 'Stammgast', description: 'Beende 10 Partien.', goal: 10, progress: (s) => n(s.games), unlocks: { trail: 'violett' } },
  { id: 'veteran', name: 'Veteran', description: 'Beende 50 Partien.', goal: 50, progress: (s) => n(s.games), unlocks: { dice: 'neon' } },
  { id: 'erster-sieg', name: 'Erster Triumph', description: 'Gewinne eine Partie.', goal: 1, progress: (s) => n(s.wins) },
  { id: 'serienmeister', name: 'Serienmeister', description: 'Gewinne 10 Partien.', goal: 10, progress: (s) => n(s.wins), unlocks: { hat: 'krone' } },
  { id: 'unbesiegbar', name: 'Unbesiegbar', description: 'Gewinne 25 Partien.', goal: 25, progress: (s) => n(s.wins), unlocks: { trail: 'gold' } },
  { id: 'minispieler', name: 'Minispieler', description: 'Spiele 10 Minispiele.', goal: 10, progress: (s) => n(s.minigamesPlayed) },
  { id: 'minispiel-profi', name: 'Minispiel-Profi', description: 'Gewinne 25 Minispiele.', goal: 25, progress: (s) => n(s.minigamesWon), unlocks: { hat: 'zylinder' } },
  { id: 'minispiel-legende', name: 'Minispiel-Legende', description: 'Spiele 100 Minispiele.', goal: 100, progress: (s) => n(s.minigamesPlayed) },
  { id: 'glimmersammler', name: 'Glimmersammler', description: 'Sammle insgesamt 100 Glimmer.', goal: 100, progress: (s) => n(s.coinsEarned) },
  { id: 'glimmerhort', name: 'Glimmerhort', description: 'Sammle insgesamt 1000 Glimmer.', goal: 1000, progress: (s) => n(s.coinsEarned), unlocks: { dice: 'kristall' } },
  { id: 'wanderer', name: 'Wanderer', description: 'Laufe insgesamt 500 Felder.', goal: 500, progress: (s) => n(s.steps) },
  { id: 'weltenbummler', name: 'Weltenbummler', description: 'Laufe insgesamt 5000 Felder.', goal: 5000, progress: (s) => n(s.steps), unlocks: { trail: 'orange' } },
  { id: 'online-debuet', name: 'Online-Debüt', description: 'Beende eine Online-Partie.', goal: 1, progress: (s) => n(s.onlineGames), unlocks: { trail: 'weiss' } },
  { id: 'weltenreisende', name: 'Weltenreisende', description: 'Spiele auf allen 5 Welten.', goal: WORLD_COUNT, progress: (s) => Math.min(WORLD_COUNT, worldsPlayed(s)), unlocks: { hat: 'sternenband' } },
  { id: 'ausdauer', name: 'Ausdauer', description: 'Spiele insgesamt eine Stunde.', goal: 3600, progress: (s) => n(s.playSeconds) },
  { id: 'allein-gegen-alle', name: 'Allein gegen alle', description: 'Gewinne eine Partie mit vier Spielern.', goal: 1, progress: () => 0, onGame: (g) => g.won && g.players >= 4 },
  { id: 'minispiel-serie', name: 'Minispiel-Dominator', description: 'Gewinne in einer Partie mindestens 3 Minispiele.', goal: 1, progress: () => 0, onGame: (g) => g.minigameWins >= 3 },
  { id: 'lange-reise', name: 'Lange Reise', description: 'Beende eine Partie mit mindestens 15 Runden.', goal: 1, progress: () => 0, onGame: (g) => g.rounds >= 15 },
  { id: 'splittersammler', name: 'Splittersammler', description: 'Habe am Ende einer Partie mindestens 3 Siegpunkt-Splitter.', goal: 1, progress: () => 0, onGame: (g) => g.finalShards >= 3 },
];

/** Kosmetik-Katalog (IDs werden in store.data.cosmetics gespeichert; Darstellung übernimmt das Spiel) */
export const HAT_COSMETICS: ReadonlyArray<{ id: string; name: string; free: boolean }> = [
  { id: 'propeller', name: 'Propellerkappe', free: true },
  { id: 'blumenkranz', name: 'Blumenkranz', free: true },
  { id: 'krone', name: 'Krone', free: false },
  { id: 'zylinder', name: 'Zylinder', free: false },
  { id: 'sternenband', name: 'Sternenband', free: false },
];
export const TRAILS: ReadonlyArray<{ id: string; name: string; color: number; free: boolean }> = [
  { id: 'rosa', name: 'Rosa', color: 0xff3e9d, free: true },
  { id: 'cyan', name: 'Türkis', color: 0x2de2e6, free: true },
  { id: 'gelb', name: 'Gelb', color: 0xffd23f, free: true },
  { id: 'gruen', name: 'Grün', color: 0x6bff8f, free: true },
  { id: 'violett', name: 'Violett', color: 0x7c5cff, free: false },
  { id: 'orange', name: 'Orange', color: 0xff9f1c, free: false },
  { id: 'weiss', name: 'Weiß', color: 0xffffff, free: false },
  { id: 'gold', name: 'Gold', color: 0xffc400, free: false },
];
export const DICE_SKINS: ReadonlyArray<{ id: string; name: string; free: boolean }> = [
  { id: 'klassisch', name: 'Klassisch', free: true },
  { id: 'holz', name: 'Holz', free: true },
  { id: 'kristall', name: 'Kristall', free: false },
  { id: 'neon', name: 'Neon', free: false },
];

const CATALOG: Record<CosmeticKind, ReadonlyArray<{ id: string; free: boolean }>> = { hat: HAT_COSMETICS, trail: TRAILS, dice: DICE_SKINS };

/** Welcher Erfolg schaltet dieses Kosmetik-Stück frei? */
export function unlockingAchievement(kind: CosmeticKind, id: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find((a) => a.unlocks?.[kind] === id);
}

/** Ist das Kosmetik-Stück nutzbar (frei oder durch Erfolg freigeschaltet)? */
export function isUnlocked(s: SaveData, kind: CosmeticKind, id: string): boolean {
  const entry = CATALOG[kind].find((c) => c.id === id);
  if (!entry) return false;
  if (entry.free) return true;
  const a = unlockingAchievement(kind, id);
  return !!a && typeof s.achievements?.[a.id] === 'number';
}

/**
 * Schreibt eine beendete Partie in die Statistik und vergibt neue Erfolge.
 * Liefert die IDs der NEU freigeschalteten Erfolge (jeder Erfolg wird nur einmal vergeben).
 * Ungültige Zahlen (NaN, negativ, Infinity) zählen als 0.
 */
export function recordGame(s: SaveData, g: GameSummary, now: number = Date.now()): string[] {
  const st = s.stats;
  st.games = n(st.games) + 1;
  st.wins = n(st.wins) + (g.won ? 1 : 0);
  st.onlineGames = n(st.onlineGames) + (g.online ? 1 : 0);
  st.minigamesPlayed = n(st.minigamesPlayed) + Math.floor(n(g.minigamesPlayed));
  st.minigamesWon = n(st.minigamesWon) + Math.floor(n(g.minigameWins));
  st.coinsEarned = n(st.coinsEarned) + n(g.coinsEarned);
  st.steps = n(st.steps) + Math.floor(n(g.steps));
  st.playSeconds = n(st.playSeconds) + n(g.seconds);
  if (!st.perWorld || typeof st.perWorld !== 'object') st.perWorld = {};
  const w = typeof g.world === 'string' ? g.world.slice(0, 30) : '';
  if (w && w !== '__proto__' && w !== 'constructor' && w !== 'prototype') st.perWorld[w] = n(st.perWorld[w]) + 1;
  if (!s.achievements || typeof s.achievements !== 'object') s.achievements = {};
  const stamp = Number.isFinite(now) ? now : 0;
  const clean: GameSummary = {
    ...g,
    rounds: n(g.rounds),
    players: n(g.players),
    minigameWins: n(g.minigameWins),
    finalShards: n(g.finalShards),
    won: g.won === true,
  };
  const fresh: string[] = [];
  for (const a of ACHIEVEMENTS) {
    if (typeof s.achievements[a.id] === 'number') continue;
    if (a.progress(st) >= a.goal || a.onGame?.(clean)) {
      s.achievements[a.id] = stamp;
      fresh.push(a.id);
    }
  }
  return fresh;
}
