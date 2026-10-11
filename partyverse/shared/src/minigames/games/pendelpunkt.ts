import { Rng } from '../../rng';
import type { InputFrame, MiniGame } from '../types';
import { NEUTRAL_INPUT } from '../types';
import { lerp } from '../util';
import { hash } from './echomuster';

/**
 * Pendel-Punkt: Ein Pendel schwingt über eine Zielzone. Mit A stoppst du es – je näher an der Mitte, desto mehr Punkte.
 * Acht Runden: Die Zone schrumpft, das Pendel wird schneller. Es zählt Präzision, nicht Reaktionsgeschwindigkeit.
 */
export interface PendelRound {
  /** Mitte der Zielzone in [-1, 1] (Pendelweg) */
  c: number;
  /** Halbe Breite der Zielzone */
  h: number;
  /** Kreisfrequenz des Pendels (rad/s) */
  omega: number;
  phase0: number;
}

export interface PendelState {
  rounds: PendelRound[];
  round: number;
  phase: 'swing' | 'result' | 'over';
  /** Ticks seit Beginn der Pendelbewegung in dieser Runde */
  k: number;
  /** Ticks in der Ergebnisphase */
  timer: number;
  /** Gestoppte Position (nur in 'result') */
  stopPos: number;
  /** Punkte je abgeschlossener Runde */
  pts: number[];
  total: number;
  /** true, wenn die letzte Runde ohne Stopp ablief */
  timedOut: boolean;
  prevA: boolean;
  seed: number;
}

export const ROUNDS = 8;
/** Ticks, bevor das Pendel gestoppt werden darf */
export const ARM = 30;
/** Längste Schwingzeit nach dem Scharfstellen */
export const MAX_SWING = 120;
const RESULT_TICKS = 42;

/** Pendelposition in [-1, 1] nach k Ticks */
export const pendulumPos = (r: PendelRound, k: number): number => Math.sin(r.phase0 + (r.omega * k) / 60);

/** Punkte für einen Stopp bei Position p */
export function roundPoints(r: PendelRound, p: number): number {
  const e = Math.abs(p - r.c) / r.h;
  return Math.round(1000 * Math.exp(-(e * e) / 1.5));
}

export const game: MiniGame<PendelState> = {
  id: 'pendelpunkt',
  name: 'Pendel-Punkt',
  tagline: 'Stopp das Pendel mitten im Ziel',
  instructions: [
    'Ein Pendel schwingt hin und her über einer leuchtenden Zielzone.',
    'Drücke A, um es genau über der Mitte der Zone zu stoppen.',
    'Je näher an der Mitte, desto mehr Punkte (bis 1000 pro Runde).',
    'Acht Runden – die Zone wird immer kleiner und das Pendel schneller.',
  ],
  controls: { desktop: 'Leertaste, Enter oder Mausklick', touch: 'Großen Knopf antippen' },
  category: 'reaction',
  duration: 30,
  touch: { stick: false, a: true, b: false },
  init(seed) {
    const rnd = new Rng(seed);
    const rounds: PendelRound[] = [];
    let lastC = 0;
    for (let i = 0; i < ROUNDS; i++) {
      const f = i / (ROUNDS - 1);
      const period = lerp(2.5, 1.5, f);
      let c = rnd.float(-0.55, 0.55);
      if (Math.abs(c - lastC) < 0.2) c = c > 0 ? c - 0.3 : c + 0.3;
      lastC = c;
      rounds.push({
        c,
        h: lerp(0.3, 0.12, f),
        omega: (Math.PI * 2) / period,
        phase0: rnd.float(0, Math.PI * 2),
      });
    }
    return {
      rounds,
      round: 0,
      phase: 'swing',
      k: 0,
      timer: 0,
      stopPos: 0,
      pts: [],
      total: 0,
      timedOut: false,
      prevA: false,
      seed,
    };
  },
  step(s, input) {
    if (s.phase === 'over') return;
    const a = input.a || input.pd;
    const press = a && !s.prevA;
    s.prevA = a;
    const r = s.rounds[s.round] as PendelRound;
    if (s.phase === 'swing') {
      s.k++;
      let stopped = false;
      if (press && s.k > ARM) {
        s.stopPos = pendulumPos(r, s.k);
        const p = roundPoints(r, s.stopPos);
        s.pts.push(p);
        s.total += p;
        s.timedOut = false;
        stopped = true;
      } else if (s.k >= ARM + MAX_SWING) {
        s.stopPos = pendulumPos(r, s.k);
        s.pts.push(0);
        s.timedOut = true;
        stopped = true;
      }
      if (stopped) {
        s.phase = 'result';
        s.timer = 0;
      }
    } else {
      s.timer++;
      if (s.timer >= RESULT_TICKS) {
        s.round++;
        if (s.round >= ROUNDS) s.phase = 'over';
        else {
          s.phase = 'swing';
          s.k = 0;
          s.timer = 0;
        }
      }
    }
  },
  done: (s) => s.phase === 'over',
  score: (s) => s.total,
  bot(s, skill): InputFrame {
    if (s.phase !== 'swing') return { ...NEUTRAL_INPUT };
    const r = s.rounds[s.round] as PendelRound;
    const h = hash(s.seed, s.round * 5 + 1);
    // Menschlich: erst nach einer Weile "zielen", dann den nächsten Durchgang durch die Mitte anpeilen
    const kmin = ARM + Math.round(lerp(34, 6, skill)) + (h % 14);
    let kStar = kmin;
    let prev = pendulumPos(r, kmin - 1) - r.c;
    for (let k = kmin; k < ARM + MAX_SWING; k++) {
      const d = pendulumPos(r, k) - r.c;
      if (d * prev <= 0) {
        kStar = Math.abs(d) < Math.abs(prev) ? k : k - 1;
        break;
      }
      prev = d;
    }
    const u1 = ((hash(s.seed + 5, s.round * 5 + 2) % 10000) + 0.5) / 10000;
    const u2 = ((hash(s.seed + 9, s.round * 5 + 3) % 10000) + 0.5) / 10000;
    const gauss = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    let off = Math.round(gauss * lerp(9, 0.9, skill));
    if ((hash(s.seed + 11, s.round * 5 + 4) % 1000) / 1000 < 0.12 * (1 - skill)) off += (h & 1 ? 1 : -1) * 14;
    return { ...NEUTRAL_INPUT, a: s.k === Math.max(ARM + 1, kStar + off) };
  },
  hud: (s) => {
    const last = s.pts[s.pts.length - 1];
    return {
      left: `Runde ${Math.min(s.round + 1, ROUNDS)}/${ROUNDS}`,
      right: `${s.total} Pkt`,
      hint:
        s.phase === 'result' && last !== undefined
          ? s.timedOut
            ? 'Zu spät – kein Stopp!'
            : last >= 950
              ? `Mitten ins Schwarze! +${last}`
              : `+${last}`
          : s.phase === 'swing' && s.k <= ARM
            ? 'Gleich geht es los …'
            : 'Stopp mit A',
    };
  },
};
