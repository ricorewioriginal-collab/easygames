import { Rng } from '../../rng';
import type { InputFrame, MiniGame } from '../types';
import { NEUTRAL_INPUT } from '../types';
import { clamp, lerp } from '../util';

/**
 * Blitzfunke – Reaktionsduell mit Finten.
 * Jede Runde: warten, bis die Funkbake GRÜN (Taste A) oder BLAU (Taste B) zeigt, dann so schnell wie möglich
 * die passende Taste drücken. Gelbe Blitze sind Finten. Der Ablauf jeder Runde ist fest (aus dem Seed) –
 * so sehen alle Spieler das Signal im selben Moment, egal wie schnell sie reagieren.
 */
export interface BlitzRound {
  /** Wartezeit bis zum Signal (Ticks) */
  delay: number;
  /** Welche Taste gefragt ist */
  want: 'a' | 'b';
  /** Startzeitpunkte der Finten (Ticks in der Wartephase) */
  fakes: number[];
  /** So lange gilt das Signal (Ticks) */
  window: number;
  /** Punkte-Faktor (Finale = 2) */
  mult: number;
}

/** Ergebnis einer Runde: 0 offen, 1 Treffer, 2 Fehlstart, 3 falsche Taste, 4 verpasst */
export type BlitzOutcome = 0 | 1 | 2 | 3 | 4;

export interface BlitzState {
  sched: BlitzRound[];
  round: number;
  rounds: number;
  phase: 'wait' | 'go' | 'result' | 'over';
  timer: number;
  /** Ergebnis der laufenden Runde */
  outcome: BlitzOutcome;
  /** Reaktionszeit der laufenden Runde in ms (0 = keine) */
  lastMs: number;
  /** Punkte der laufenden Runde (auch negativ bei Fehlstart) */
  lastPts: number;
  points: number[];
  outcomes: BlitzOutcome[];
  total: number;
  /** Treffer in Folge (bringt Bonus) */
  streak: number;
  bestMs: number;
  prevA: boolean;
  prevB: boolean;
  falseStarts: number;
  wrong: number;
}

export const ROUNDS = 7;
export const FAKE_LEN = 16;
const RESULT_TICKS = 42;
const FALSE_START_PENALTY = 150;

/** Feste Rundenfolge aus dem Seed, mit Schwierigkeitsanstieg: erst nur A, dann B, Finten und kürzeres Fenster. */
export function makeRounds(seed: number): BlitzRound[] {
  const r = new Rng((seed ^ 0x3b1f5a77) >>> 0);
  const out: BlitzRound[] = [];
  for (let i = 0; i < ROUNDS; i++) {
    const p = i / (ROUNDS - 1);
    const delay = 55 + r.int(Math.round(lerp(60, 100, p)));
    const want: 'a' | 'b' = i === 0 ? 'a' : i === 1 ? 'b' : r.chance(0.5) ? 'a' : 'b';
    const nf = i < 2 ? 0 : i < 4 ? 1 : r.chance(0.5) ? 2 : 1;
    const fakes: number[] = [];
    let at = 14 + r.int(12);
    for (let k = 0; k < nf && at + FAKE_LEN + 10 < delay; k++) {
      fakes.push(at);
      at += FAKE_LEN + 8 + r.int(16);
    }
    out.push({ delay, want, fakes, window: Math.round(lerp(84, 42, p)), mult: i >= ROUNDS - 2 ? 2 : 1 });
  }
  return out;
}

/** Läuft gerade eine Finte? */
export function fakeOn(s: BlitzState): boolean {
  const rd = s.sched[s.round];
  if (!rd || s.phase !== 'wait') return false;
  return rd.fakes.some((f) => s.timer >= f && s.timer < f + FAKE_LEN);
}

/** Punkte für eine Reaktionszeit (ms): unter 160 ms volle 1000, danach fallend, mindestens 150 */
export const pointsFor = (ms: number): number =>
  Math.round(clamp(1000 - Math.max(0, ms - 160) * 2.2, 150, 1000));

export const game: MiniGame<BlitzState> = {
  id: 'blitzfunke',
  name: 'Blitzfunke',
  tagline: 'Grün heißt A, Blau heißt B – und Gelb ist eine Finte!',
  instructions: [
    'Warte, bis die Funkbake GRÜN (A) oder BLAU (B) aufleuchtet – dann blitzschnell die passende Taste drücken.',
    'Gelbe Blitze sind Finten! Wer zu früh oder die falsche Taste drückt, verliert Punkte.',
    'Treffer in Folge geben Bonus, die letzten zwei Runden zählen doppelt.',
  ],
  controls: {
    desktop: 'Leertaste/Enter = A (grün), Shift/X = B (blau)',
    touch: 'Knopf A bei Grün, Knopf B bei Blau',
  },
  category: 'reaction',
  duration: 35,
  touch: { stick: false, a: true, b: true },
  init(seed) {
    const sched = makeRounds(seed);
    return {
      sched,
      round: 0,
      rounds: sched.length,
      phase: 'wait',
      timer: 0,
      outcome: 0,
      lastMs: 0,
      lastPts: 0,
      points: [],
      outcomes: [],
      total: 0,
      streak: 0,
      bestMs: 0,
      prevA: false,
      prevB: false,
      falseStarts: 0,
      wrong: 0,
    };
  },
  step(s, input) {
    if (s.phase === 'over') return;
    const aNow = !!(input.a || input.pd);
    const bNow = !!input.b;
    const pa = aNow && !s.prevA;
    const pb = bNow && !s.prevB;
    s.prevA = aNow;
    s.prevB = bNow;
    const rd = s.sched[s.round] as BlitzRound;
    s.timer++;
    const settle = (o: BlitzOutcome, pts: number) => {
      s.outcome = o;
      s.lastPts = pts;
      s.total = Math.max(0, s.total + pts);
    };
    if (s.phase === 'wait') {
      if (s.outcome === 0 && (pa || pb)) {
        s.falseStarts++;
        s.streak = 0;
        s.lastMs = 0;
        settle(2, -FALSE_START_PENALTY);
      }
      if (s.timer >= rd.delay) {
        s.phase = 'go';
        s.timer = 0;
      }
    } else if (s.phase === 'go') {
      if (s.outcome === 0 && (pa || pb)) {
        const ms = Math.round((s.timer * 1000) / 60);
        s.lastMs = ms;
        const right = rd.want === 'a' ? pa : pb;
        if (right) {
          s.streak++;
          if (!s.bestMs || ms < s.bestMs) s.bestMs = ms;
          const bonus = 1 + Math.min(4, s.streak - 1) * 0.1;
          settle(1, Math.round(pointsFor(ms) * bonus * rd.mult));
        } else {
          s.wrong++;
          s.streak = 0;
          settle(3, -Math.round(FALSE_START_PENALTY / 2));
        }
      }
      if (s.timer >= rd.window) {
        if (s.outcome === 0) {
          s.streak = 0;
          settle(4, 0);
        }
        s.phase = 'result';
        s.timer = 0;
      }
    } else if (s.timer >= RESULT_TICKS) {
      s.points.push(s.lastPts);
      s.outcomes.push(s.outcome);
      s.round++;
      s.timer = 0;
      s.outcome = 0;
      s.lastMs = 0;
      s.lastPts = 0;
      s.phase = s.round >= s.rounds ? 'over' : 'wait';
    }
  },
  done: (s) => s.phase === 'over',
  score: (s) => s.total,
  bot(s, skill, rng): InputFrame {
    const rd = s.sched[s.round];
    if (!rd || s.outcome !== 0) return { ...NEUTRAL_INPUT };
    const err = 1 - skill;
    if (s.phase === 'wait') {
      // Ungeduld und Finten: schwache Bots fallen öfter herein
      const p = fakeOn(s) ? err * err * 0.03 : err * 0.0012;
      return rng.next() < p
        ? { ...NEUTRAL_INPUT, a: rd.want !== 'a', b: rd.want === 'a' }
        : { ...NEUTRAL_INPUT };
    }
    if (s.phase === 'go') {
      // Reaktionszeit: gute Bots ~14 Ticks (230 ms), schwache ~30 Ticks; Streuung je Runde
      const target = Math.round(lerp(31, 13.5, skill) + ((s.round * 7 + 3) % 5) * lerp(1.6, 0.6, skill));
      if (s.timer < target) return { ...NEUTRAL_INPUT };
      const wrong = rng.next() < err * 0.06;
      const pressA = (rd.want === 'a') !== wrong;
      return { ...NEUTRAL_INPUT, a: pressA, b: !pressA };
    }
    return { ...NEUTRAL_INPUT };
  },
  hud: (s) => ({
    left: `Runde ${Math.min(s.round + 1, s.rounds)}/${s.rounds}${(s.sched[s.round]?.mult ?? 1) > 1 ? ' · ×2' : ''}`,
    right: `${s.total} Pkt`,
    hint:
      s.outcome === 2
        ? 'Fehlstart!'
        : s.outcome === 3
          ? 'Falsche Taste!'
          : s.outcome === 4
            ? 'Zu langsam!'
            : s.outcome === 1
              ? `${s.lastMs} ms${s.streak > 1 ? ` · Serie ×${s.streak}` : ''}`
              : s.phase === 'go'
                ? s.sched[s.round]?.want === 'a'
                  ? 'A!'
                  : 'B!'
                : fakeOn(s)
                  ? 'Finte – nicht drücken!'
                  : 'Warten …',
  }),
};
