/** Spielmodi mit ihren Regeln und Streckenerzeugung. */
import { STEPS_PER_BAR, generateSong, type MusicStyle } from '../audio/music';
import { hashString, mulberry32, pick, randInt } from '../core/rng';
import { DIFFICULTIES, type Difficulty } from './difficulty';
import { LEVELS, type LevelDef, type TunnelShape } from './levels';
import { Track, singleSongTrack } from './track';

export type ModeId = 'campaign' | 'endless' | 'zen' | 'daily' | 'hardcore' | 'tutorial';

export interface ModeRules {
  id: ModeId;
  label: string;
  description: string;
  canFail: boolean;
  wallDamage: boolean;
  oneMistakeFails: boolean;
  scoreMul: number;
  /** Benötigt die Modusauswahl ein Level? */
  needsLevel: boolean;
}

export const MODES: Record<ModeId, ModeRules> = {
  campaign: {
    id: 'campaign',
    label: 'Kampagne',
    description: '32 Level in vier Welten. Schalte Level und Effekte frei.',
    canFail: true,
    wallDamage: true,
    oneMistakeFails: false,
    scoreMul: 1,
    needsLevel: true,
  },
  endless: {
    id: 'endless',
    label: 'Endlos',
    description: 'Unendliche, immer schnellere Musik. Wie lange überlebst du?',
    canFail: true,
    wallDamage: true,
    oneMistakeFails: false,
    scoreMul: 1,
    needsLevel: false,
  },
  daily: {
    id: 'daily',
    label: 'Tagesrhythmus',
    description: 'Jeden Tag ein neues, für alle gleiches Stück.',
    canFail: true,
    wallDamage: true,
    oneMistakeFails: false,
    scoreMul: 1.2,
    needsLevel: false,
  },
  zen: {
    id: 'zen',
    label: 'Zen',
    description: 'Kein Scheitern, keine Wandschäden. Nur Fluss und Licht.',
    canFail: false,
    wallDamage: false,
    oneMistakeFails: false,
    scoreMul: 0.5,
    needsLevel: true,
  },
  hardcore: {
    id: 'hardcore',
    label: 'Präzision',
    description: 'Ein Fehler beendet den Lauf. Dafür 1,5-fache Punkte.',
    canFail: true,
    wallDamage: true,
    oneMistakeFails: true,
    scoreMul: 1.5,
    needsLevel: true,
  },
  tutorial: {
    id: 'tutorial',
    label: 'Tutorial',
    description: 'Lerne Steuerung, Orbs, Wände und Overdrive.',
    canFail: false,
    wallDamage: false,
    oneMistakeFails: false,
    scoreMul: 1,
    needsLevel: false,
  },
};

export const SELECTABLE_MODES: ModeId[] = ['campaign', 'endless', 'daily', 'zen', 'hardcore'];

export function levelTrack(level: LevelDef, difficulty: Difficulty): Track {
  const d = DIFFICULTIES[difficulty];
  const song = generateSong({
    seed: level.seed,
    bpm: level.bpm,
    bars: level.bars,
    style: level.style,
  });
  return singleSongTrack({
    song,
    params: {
      seed: level.seed ^ hashString(difficulty),
      density: Math.min(1, level.density * d.density + 0.1),
      wallRate: level.wallRate * d.wallRate,
      orbRate: level.orbRate,
      minGap: d.minGap,
      doubleWalls: d.doubleWalls && level.world >= 1,
      startStep: STEPS_PER_BAR,
      endStep: song.totalSteps - STEPS_PER_BAR,
    },
  });
}

const DAILY_STYLES: MusicStyle[] = ['synthwave', 'trance', 'techno', 'breakbeat', 'dnb'];
const SHAPES: TunnelShape[] = ['ring', 'hex', 'tri', 'square', 'star', 'octa'];

export function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Tageslevel: für alle Spieler am selben Datum identisch. */
export function dailyLevel(date: Date): LevelDef {
  const key = dateKey(date);
  const seed = hashString(`daily:${key}`);
  const rng = mulberry32(seed);
  const style = pick(rng, DAILY_STYLES);
  const bpm = style === 'dnb' ? randInt(rng, 160, 174) : randInt(rng, 110, 138);
  return {
    id: `daily-${key}`,
    index: -1,
    world: randInt(rng, 0, 3),
    name: `Tagesrhythmus ${key.split('-').reverse().join('.')}`,
    style,
    bpm,
    bars: Math.round((64 * bpm) / 240 / 4) * 4,
    seed,
    density: 0.7 + rng() * 0.25,
    wallRate: 0.5 + rng() * 0.4,
    orbRate: 0.6,
    hue: rng(),
    hue2: rng(),
    tunnel: pick(rng, SHAPES),
    bend: 0.3 + rng() * 0.6,
    twist: rng() * 0.5,
  };
}

export const ENDLESS_LEVEL: LevelDef = {
  id: 'endless',
  index: -1,
  world: 3,
  name: 'Endlosstrom',
  style: 'trance',
  bpm: 128,
  bars: 16,
  seed: hashString('prismrush:endless'),
  density: 0.6,
  wallRate: 0.5,
  orbRate: 0.7,
  hue: 0.75,
  hue2: 0.5,
  tunnel: 'hex',
  bend: 0.6,
  twist: 0.4,
};

const ENDLESS_STYLES: MusicStyle[] = ['trance', 'techno', 'synthwave', 'breakbeat'];

/** Endlos-Strecke: Abschnitte à 16 Takte mit steigender Dichte. */
export function endlessTrack(seed: number, difficulty: Difficulty): Track {
  const d = DIFFICULTIES[difficulty];
  const bpm = ENDLESS_LEVEL.bpm;
  return new Track(
    bpm,
    (i) => {
      const chunkSeed = (seed + i * 7919) >>> 0;
      const song = generateSong({
        seed: chunkSeed,
        bpm,
        bars: 16,
        style: ENDLESS_STYLES[i % ENDLESS_STYLES.length],
        rootMidi: 41,
        continuous: true,
      });
      const ramp = Math.min(1, i * 0.12);
      return {
        song,
        params: {
          seed: chunkSeed ^ 0x5bd1e995,
          density: Math.min(1, (0.45 + ramp * 0.5) * (d.density + 0.2)),
          wallRate: Math.min(1.2, (0.35 + ramp * 0.7) * d.wallRate),
          orbRate: 0.7,
          minGap: d.minGap,
          doubleWalls: d.doubleWalls && i >= 2,
          startStep: i === 0 ? STEPS_PER_BAR : 0,
          endStep: song.totalSteps,
        },
      };
    },
    true,
  );
}

/** Scrollgeschwindigkeits-Faktor: im Endlos-Modus steigt er langsam an. */
export function speedFactor(mode: ModeId, songTime: number): number {
  if (mode !== 'endless') return 1;
  return 1 + Math.min(0.6, Math.max(0, songTime) / 300);
}

export function nextLevel(level: LevelDef): LevelDef | undefined {
  return level.index >= 0 ? LEVELS[level.index + 1] : undefined;
}
