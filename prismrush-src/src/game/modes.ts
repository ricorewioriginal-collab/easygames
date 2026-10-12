/** Spielmodi mit ihren Regeln und Streckenerzeugung. */
import { STEPS_PER_BAR, generateSong, type MusicStyle } from '../audio/music';
import { hashString, mulberry32, pick, randInt } from '../core/rng';
import { DIFFICULTIES, type Difficulty } from './difficulty';
import { LEVELS, type LevelDef, type TunnelShape } from './levels';
import { LANES, type ChartEvent } from './chart';
import { Track, singleSongTrack } from './track';
import { tutorialTrack } from './tutorial';

export type ModeId =
  | 'campaign'
  | 'endless'
  | 'daily'
  | 'sprint'
  | 'remix'
  | 'zen'
  | 'hardcore'
  | 'mirror'
  | 'turbo'
  | 'hidden'
  | 'glide'
  | 'gauntlet'
  | 'tutorial';

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
  /** Kristalle werden automatisch getroffen, sobald man in ihrer Spur ist. */
  autoHit?: boolean;
  /** Punkte für jede ausgewichene Wand (mal Multiplikator). */
  wallBonus?: number;
  /** Lauf endet nach so vielen Sekunden erfolgreich. */
  timeLimit?: number;
  /** Spuren links/rechts vertauscht. */
  mirror?: boolean;
  /** Kristalle und Orbs verschwinden kurz vor dem Gleiter. */
  hidden?: boolean;
  /** Tempo-Faktor für Musik und Scrollgeschwindigkeit. */
  tempo?: number;
  densityMul?: number;
  wallMul?: number;
}

const base = {
  canFail: true,
  wallDamage: true,
  oneMistakeFails: false,
  scoreMul: 1,
  needsLevel: true,
};

export const MODES: Record<ModeId, ModeRules> = {
  campaign: {
    ...base,
    id: 'campaign',
    label: 'Kampagne',
    description: '32 Level in vier Welten. Schalte Level und Effekte frei.',
  },
  endless: {
    ...base,
    id: 'endless',
    label: 'Endlos',
    description: 'Unendliche, immer schnellere Musik. Wie lange überlebst du?',
    needsLevel: false,
  },
  daily: {
    ...base,
    id: 'daily',
    label: 'Tagesrhythmus',
    description: 'Jeden Tag ein neues, für alle gleiches Stück.',
    scoreMul: 1.2,
    needsLevel: false,
  },
  sprint: {
    ...base,
    id: 'sprint',
    label: 'Sprint 90',
    description: '90 Sekunden Punktejagd auf frisch generierter Musik, die immer schneller wird.',
    needsLevel: false,
    timeLimit: 90,
  },
  remix: {
    ...base,
    id: 'remix',
    label: 'Remix',
    description: 'Jedes Mal ein brandneues Zufallsstück mit eigener Strecke und Farbwelt.',
    needsLevel: false,
    scoreMul: 1.1,
  },
  zen: {
    ...base,
    id: 'zen',
    label: 'Zen',
    description: 'Kein Scheitern, keine Wandschäden. Nur Fluss und Licht.',
    canFail: false,
    wallDamage: false,
    scoreMul: 0.5,
  },
  hardcore: {
    ...base,
    id: 'hardcore',
    label: 'Präzision',
    description: 'Ein Fehler beendet den Lauf. Dafür 1,5-fache Punkte.',
    oneMistakeFails: true,
    scoreMul: 1.5,
  },
  mirror: {
    ...base,
    id: 'mirror',
    label: 'Spiegelwelt',
    description: 'Bekannte Level, aber links und rechts sind vertauscht.',
    mirror: true,
    scoreMul: 1.1,
  },
  turbo: {
    ...base,
    id: 'turbo',
    label: 'Turbo',
    description: 'Musik und Strecke laufen 30 % schneller. 1,4-fache Punkte.',
    tempo: 1.3,
    scoreMul: 1.4,
  },
  hidden: {
    ...base,
    id: 'hidden',
    label: 'Blindflug',
    description: 'Kristalle und Orbs verblassen kurz vor dir. Hör auf den Takt! 1,3-fache Punkte.',
    hidden: true,
    scoreMul: 1.3,
  },
  glide: {
    ...base,
    id: 'glide',
    label: 'Gleitflug',
    description: 'Nur lenken: Kristalle sammelst du automatisch in ihrer Spur. Ideal fürs Handy.',
    autoHit: true,
    scoreMul: 0.8,
  },
  gauntlet: {
    ...base,
    id: 'gauntlet',
    label: 'Wandlauf',
    description: 'Doppelt so viele Prismenwände. Jede ausgewichene Wand bringt Punkte.',
    wallMul: 2.2,
    densityMul: 0.6,
    wallBonus: 40,
  },
  tutorial: {
    ...base,
    id: 'tutorial',
    label: 'Tutorial',
    description: 'Lerne Steuerung, Orbs, Wände und Overdrive.',
    canFail: false,
    wallDamage: false,
    needsLevel: false,
  },
};

/** Reihenfolge im Modusmenü. */
export const SELECTABLE_MODES: ModeId[] = [
  'campaign',
  'endless',
  'daily',
  'sprint',
  'remix',
  'zen',
  'hardcore',
  'mirror',
  'turbo',
  'hidden',
  'glide',
  'gauntlet',
];

export function mirrorEvent(e: ChartEvent): ChartEvent {
  const flip = (l: number) => LANES - 1 - l;
  const lanes = e.lanes.map(flip).sort((a, b) => a - b);
  return { ...e, lane: e.kind === 'wall' ? lanes[0] : flip(e.lane), lanes };
}

export function levelTrack(
  level: LevelDef,
  difficulty: Difficulty,
  rules: ModeRules = MODES.campaign,
): Track {
  const d = DIFFICULTIES[difficulty];
  const song = generateSong({
    seed: level.seed,
    bpm: Math.round(level.bpm * (rules.tempo ?? 1)),
    bars: level.bars,
    style: level.style,
  });
  return singleSongTrack(
    {
      song,
      params: {
        seed: level.seed ^ hashString(difficulty),
        density: Math.min(1, (level.density * d.density + 0.1) * (rules.densityMul ?? 1)),
        wallRate: level.wallRate * d.wallRate * (rules.wallMul ?? 1),
        orbRate: level.orbRate,
        minGap: d.minGap,
        doubleWalls: d.doubleWalls && level.world >= 1,
        startStep: STEPS_PER_BAR,
        endStep: song.totalSteps - STEPS_PER_BAR,
      },
    },
    rules.mirror ? mirrorEvent : undefined,
  );
}

const DAILY_STYLES: MusicStyle[] = ['synthwave', 'trance', 'techno', 'breakbeat', 'dnb'];
const SHAPES: TunnelShape[] = ['ring', 'hex', 'tri', 'square', 'star', 'octa'];

export function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Prozedurales Level aus einem Seed (Tagesrhythmus, Remix). */
export function proceduralLevel(seed: number, id: string, name: string): LevelDef {
  const rng = mulberry32(seed);
  const style = pick(rng, DAILY_STYLES);
  const bpm = style === 'dnb' ? randInt(rng, 160, 174) : randInt(rng, 110, 138);
  return {
    id,
    index: -1,
    world: randInt(rng, 0, 3),
    name,
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

/** Tageslevel: für alle Spieler am selben Datum identisch. */
export function dailyLevel(date: Date): LevelDef {
  const key = dateKey(date);
  return proceduralLevel(
    hashString(`daily:${key}`),
    `daily-${key}`,
    `Tagesrhythmus ${key.split('-').reverse().join('.')}`,
  );
}

/** Remix: jedes Mal neu; die ID bleibt gleich, damit es einen Highscore gibt. */
export function remixLevel(seed: number): LevelDef {
  return proceduralLevel(
    seed >>> 0,
    'remix',
    `Remix #${String((seed >>> 0) % 10000).padStart(4, '0')}`,
  );
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

export const SPRINT_LEVEL: LevelDef = {
  ...ENDLESS_LEVEL,
  id: 'sprint',
  name: 'Sprint 90',
  hue: 0.08,
  hue2: 0.9,
  tunnel: 'star',
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

/** Scrollgeschwindigkeits-Faktor: Endlos und Sprint werden langsam schneller, Turbo sofort. */
export function speedFactor(mode: ModeId, songTime: number): number {
  const t = Math.max(0, songTime);
  if (mode === 'endless') return 1 + Math.min(0.6, t / 300);
  if (mode === 'sprint') return 1 + Math.min(0.4, t / 150);
  return MODES[mode].tempo ?? 1;
}

/** Erzeugt die Strecke für einen Modus. */
export function buildTrack(
  mode: ModeId,
  level: LevelDef,
  difficulty: Difficulty,
  seed: number,
): Track {
  if (mode === 'tutorial') return tutorialTrack();
  if (mode === 'endless' || mode === 'sprint') return endlessTrack(seed, difficulty);
  return levelTrack(level, difficulty, MODES[mode]);
}

export function nextLevel(level: LevelDef): LevelDef | undefined {
  return level.index >= 0 ? LEVELS[level.index + 1] : undefined;
}
