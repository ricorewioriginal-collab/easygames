import type { Difficulty, StartPlayer } from '@shared/net/p2p';
import type { TeamId } from '@shared/sim/types';
import { Rng } from '@shared/rng';
import type { Garage } from '../app/save';
import type { LocalPlan } from './session';

export type PlayMode = 'quick' | 'split' | 'training';
export interface PlanOptions {
  mode: PlayMode;
  teamSize: 1 | 2 | 3;
  difficulty: Difficulty;
  minutes: number;
  arena: string;
  nitro: boolean;
  /** Splitscreen: zweiter Mensch im anderen Team (true) oder im eigenen Team (false) */
  splitVersus: boolean;
  name: string;
  garage: Garage;
  seed: number;
}

const BODIES = ['pfeil', 'brocken', 'libelle', 'kaefer', 'flitzer'];
const DECALS = ['streifen', 'blitz', 'punkte', 'keins'];
const BOT_NAMES = ['Blitz', 'Drift', 'Kolben', 'Nitro', 'Rotor', 'Funke', 'Turbo', 'Ritzel'];

/** Baut aus den Menü-Einstellungen die Fahrzeugliste einer lokalen Partie (Team 0 zuerst) */
export function buildLocalPlan(o: PlanOptions): LocalPlan {
  const rng = new Rng(o.seed);
  const players: StartPlayer[] = [];
  const humans: Array<{ name: string; team: TeamId; look: StartPlayer['look'] }> = [{ name: o.name, team: 0, look: { body: o.garage.body, decal: o.garage.decal, accent: o.garage.accent } }];
  if (o.mode === 'split') humans.push({ name: 'Spieler 2', team: o.splitVersus ? 1 : 0, look: { body: 'pfeil', decal: 'blitz', accent: '' } });
  const size = o.mode === 'training' ? 1 : o.teamSize;
  const teams: StartPlayer[][] = [[], []];
  for (const hmn of humans) teams[hmn.team]?.push({ carId: 0, name: hmn.name, team: hmn.team, kind: 'human', difficulty: 'normal', look: hmn.look });
  if (o.mode !== 'training') {
    let n = 0;
    for (const team of [0, 1] as TeamId[]) {
      while ((teams[team] as StartPlayer[]).length < size) {
        const name = BOT_NAMES[(n + (rng.int(BOT_NAMES.length) as number)) % BOT_NAMES.length] as string;
        (teams[team] as StartPlayer[]).push({ carId: 0, name: `${name}${n > 7 ? n : ''}`, team, kind: 'bot', difficulty: o.difficulty, look: { body: BODIES[rng.int(BODIES.length)] as string, decal: DECALS[rng.int(DECALS.length)] as string, accent: '' } });
        n++;
      }
    }
  }
  for (const t of teams) for (const p of t) players.push({ ...p, carId: players.length });
  const localCars = players.map((p, i) => (p.kind === 'human' ? i : -1)).filter((i) => i >= 0);
  return { players, seed: o.seed, matchSeconds: o.mode === 'training' ? 3600 : o.minutes * 60, arena: o.arena, nitro: o.nitro, training: o.mode === 'training', localCars };
}

export const ARENA_IDS = ['neon', 'eis', 'canyon'] as const;
export const pickArena = (choice: string, rng: Rng): string => (choice === 'zufall' ? (ARENA_IDS[rng.int(ARENA_IDS.length)] as string) : choice);
