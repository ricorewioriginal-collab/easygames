export type Difficulty = 'easy' | 'normal' | 'hard' | 'extreme';

export interface DifficultySpec {
  id: Difficulty;
  label: string;
  density: number;
  /** Minimaler Abstand zwischen Noten in 16tel-Schritten. */
  minGap: number;
  wallRate: number;
  doubleWalls: boolean;
  /** Scrollgeschwindigkeit in Welteinheiten pro Sekunde. */
  speed: number;
  windowScale: number;
  wallDamage: number;
  missDamage: number;
  scoreMul: number;
}

export const DIFFICULTIES: Record<Difficulty, DifficultySpec> = {
  easy: {
    id: 'easy',
    label: 'Leicht',
    density: 0.5,
    minGap: 4,
    wallRate: 0.4,
    doubleWalls: false,
    speed: 16,
    windowScale: 1.3,
    wallDamage: 0.14,
    missDamage: 0.04,
    scoreMul: 1,
  },
  normal: {
    id: 'normal',
    label: 'Normal',
    density: 0.7,
    minGap: 2,
    wallRate: 0.6,
    doubleWalls: false,
    speed: 20,
    windowScale: 1.1,
    wallDamage: 0.17,
    missDamage: 0.05,
    scoreMul: 1.25,
  },
  hard: {
    id: 'hard',
    label: 'Schwer',
    density: 0.88,
    minGap: 2,
    wallRate: 0.8,
    doubleWalls: true,
    speed: 25,
    windowScale: 1,
    wallDamage: 0.2,
    missDamage: 0.06,
    scoreMul: 1.5,
  },
  extreme: {
    id: 'extreme',
    label: 'Extrem',
    density: 1,
    minGap: 2,
    wallRate: 1,
    doubleWalls: true,
    speed: 30,
    windowScale: 0.85,
    wallDamage: 0.25,
    missDamage: 0.08,
    scoreMul: 2,
  },
};

export const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'normal', 'hard', 'extreme'];

export function isDifficulty(v: unknown): v is Difficulty {
  return typeof v === 'string' && v in DIFFICULTIES;
}
