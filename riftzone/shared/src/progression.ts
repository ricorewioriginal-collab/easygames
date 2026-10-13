// Spielerstufen, Erfahrungspunkte und Herausforderungen.
import type { PlacementResult } from './types';
import { Rng } from './math';

export const MAX_LEVEL = 50;

/** Benötigte EP für den Aufstieg von Stufe n auf n+1. */
export const xpForLevel = (n: number): number => Math.round(900 + n * 260 + n * n * 6);

export function levelFromXp(total: number): { level: number; into: number; need: number } {
  let level = 1,
    rest = total;
  while (level < MAX_LEVEL && rest >= xpForLevel(level)) {
    rest -= xpForLevel(level);
    level++;
  }
  return { level, into: rest, need: level >= MAX_LEVEL ? 1 : xpForLevel(level) };
}

export interface XpLine {
  label: string;
  xp: number;
}

/** EP aus einem Match-Ergebnis. */
export function matchXp(r: PlacementResult, players: number, teamSize: number): XpLine[] {
  const out: XpLine[] = [];
  const teams = Math.max(1, Math.ceil(players / teamSize));
  const rel = 1 - (r.place - 1) / teams;
  out.push({ label: 'Überlebenszeit', xp: Math.round(Math.min(r.survived, 900) * 1.4) });
  out.push({ label: `Platz ${r.place}`, xp: Math.round(rel * rel * 900) });
  if (r.kills) out.push({ label: `${r.kills} Ausschaltungen`, xp: r.kills * 120 });
  if (r.assists) out.push({ label: `${r.assists} Vorlagen`, xp: r.assists * 40 });
  if (r.revives) out.push({ label: `${r.revives} Wiederbelebungen`, xp: r.revives * 90 });
  if (r.chests) out.push({ label: `${r.chests} Riftkisten`, xp: r.chests * 35 });
  if (r.won) out.push({ label: 'Sieg!', xp: 1500 });
  return out.filter((l) => l.xp > 0);
}

export type ChallengeStat = 'kills' | 'damage' | 'chests' | 'harvested' | 'built' | 'survived' | 'distance' | 'revives' | 'top10' | 'matches' | 'headshots' | 'wins';

export interface Challenge {
  id: string;
  text: string;
  stat: ChallengeStat;
  goal: number;
  xp: number;
  weekly: boolean;
}

const POOL: Omit<Challenge, 'id' | 'weekly'>[] = [
  { text: 'Schalte 3 Gegner aus', stat: 'kills', goal: 3, xp: 900 },
  { text: 'Füge 600 Schaden zu', stat: 'damage', goal: 600, xp: 800 },
  { text: 'Öffne 5 Riftkisten', stat: 'chests', goal: 5, xp: 700 },
  { text: 'Sammle 300 Material', stat: 'harvested', goal: 300, xp: 600 },
  { text: 'Baue 40 Bauteile', stat: 'built', goal: 40, xp: 600 },
  { text: 'Überlebe insgesamt 15 Minuten', stat: 'survived', goal: 900, xp: 800 },
  { text: 'Lege 3 km zu Fuß zurück', stat: 'distance', goal: 3000, xp: 600 },
  { text: 'Erreiche die Top 10', stat: 'top10', goal: 1, xp: 900 },
  { text: 'Spiele 3 Matches', stat: 'matches', goal: 3, xp: 500 },
  { text: 'Triff 5 Kopftreffer', stat: 'headshots', goal: 5, xp: 700 },
  { text: 'Belebe 2 Teamkameraden wieder', stat: 'revives', goal: 2, xp: 700 },
];

const WEEKLY: Omit<Challenge, 'id' | 'weekly'>[] = [
  { text: 'Gewinne ein Match', stat: 'wins', goal: 1, xp: 3000 },
  { text: 'Schalte 20 Gegner aus', stat: 'kills', goal: 20, xp: 2500 },
  { text: 'Füge 5000 Schaden zu', stat: 'damage', goal: 5000, xp: 2500 },
  { text: 'Öffne 30 Riftkisten', stat: 'chests', goal: 30, xp: 2000 },
  { text: 'Erreiche 5-mal die Top 10', stat: 'top10', goal: 5, xp: 2200 },
];

/** Tägliche (3) und wöchentliche (2) Herausforderungen – für alle gleich, abhängig vom Datum. */
export function challengesFor(date: Date): Challenge[] {
  const day = Math.floor(date.getTime() / 86400000);
  const week = Math.floor((day + 3) / 7);
  const rd = new Rng(day * 7919 + 13);
  const rw = new Rng(week * 104729 + 7);
  const daily = rd.shuffle([...POOL]).slice(0, 3).map((c, i) => ({ ...c, id: `d${day}-${i}`, weekly: false }));
  const weekly = rw.shuffle([...WEEKLY]).slice(0, 2).map((c, i) => ({ ...c, id: `w${week}-${i}`, weekly: true }));
  return [...daily, ...weekly];
}

export function statFromResult(stat: ChallengeStat, r: PlacementResult): number {
  switch (stat) {
    case 'top10':
      return r.place <= 10 ? 1 : 0;
    case 'matches':
      return 1;
    case 'wins':
      return r.won ? 1 : 0;
    default:
      return r[stat];
  }
}
