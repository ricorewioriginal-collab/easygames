/** Bewertung, Combo, Multiplikatoren, Genauigkeit und Noten. */
export type Judgement = 'perfect' | 'great' | 'good' | 'miss';

export const WINDOWS = { perfect: 0.05, great: 0.095, good: 0.14 } as const;

export const JUDGE_POINTS: Record<Judgement, number> = {
  perfect: 300,
  great: 200,
  good: 100,
  miss: 0,
};

const ACC_WEIGHT: Record<Judgement, number> = { perfect: 1, great: 0.7, good: 0.4, miss: 0 };

export const ORB_POINTS = 50;
export const MULTIPLIER_STEPS = [
  { combo: 0, mul: 1 },
  { combo: 10, mul: 2 },
  { combo: 25, mul: 3 },
  { combo: 50, mul: 4 },
] as const;

/** Bewertet einen Zeitversatz in Sekunden; null = außerhalb jedes Fensters. */
export function judge(delta: number, scale = 1): Exclude<Judgement, 'miss'> | null {
  const d = Math.abs(delta);
  if (d <= WINDOWS.perfect * scale) return 'perfect';
  if (d <= WINDOWS.great * scale) return 'great';
  if (d <= WINDOWS.good * scale) return 'good';
  return null;
}

export function multiplierFor(combo: number): number {
  let mul = 1;
  for (const s of MULTIPLIER_STEPS) if (combo >= s.combo) mul = s.mul;
  return mul;
}

export type Grade = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

export function gradeFor(accuracy: number, failed: boolean): Grade {
  if (failed) return 'F';
  if (accuracy >= 0.95) return 'S';
  if (accuracy >= 0.88) return 'A';
  if (accuracy >= 0.78) return 'B';
  if (accuracy >= 0.65) return 'C';
  return 'D';
}

export function starsFor(accuracy: number, failed: boolean): number {
  if (failed) return 0;
  if (accuracy >= 0.95) return 3;
  if (accuracy >= 0.85) return 2;
  return 1;
}

export class ScoreKeeper {
  score = 0;
  combo = 0;
  maxCombo = 0;
  orbs = 0;
  orbsTotal = 0;
  wallHits = 0;
  readonly counts: Record<Judgement, number> = { perfect: 0, great: 0, good: 0, miss: 0 };

  constructor(private readonly scoreMul = 1) {}

  get notesJudged(): number {
    return this.counts.perfect + this.counts.great + this.counts.good + this.counts.miss;
  }

  /** Registriert eine Bewertung und liefert die vergebenen Punkte. */
  register(j: Judgement, bonusMul = 1): number {
    this.counts[j]++;
    if (j === 'miss') {
      this.combo = 0;
      return 0;
    }
    this.combo++;
    if (this.combo > this.maxCombo) this.maxCombo = this.combo;
    const pts = JUDGE_POINTS[j] * multiplierFor(this.combo) * bonusMul * this.scoreMul;
    this.score += pts;
    return pts;
  }

  orb(collected: boolean, bonusMul = 1): number {
    this.orbsTotal++;
    if (!collected) return 0;
    this.orbs++;
    const pts = ORB_POINTS * multiplierFor(this.combo) * bonusMul * this.scoreMul;
    this.score += pts;
    return pts;
  }

  wall(): void {
    this.wallHits++;
    this.combo = 0;
  }

  addBonus(points: number): void {
    this.score += points;
  }

  accuracy(): number {
    const n = this.notesJudged;
    if (n === 0) return 1;
    let sum = 0;
    for (const j of Object.keys(this.counts) as Judgement[]) sum += this.counts[j] * ACC_WEIGHT[j];
    return sum / n;
  }
}
