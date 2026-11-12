import { Rng } from '../../rng';
import type { InputFrame, MiniGame } from '../types';
import { NEUTRAL_INPUT } from '../types';
import { clamp, lerp } from '../util';
import { hash } from './echomuster';

/**
 * Pendel-Punkt: Deine Figur schwingt am Pendel über einer Zielzone. Mit A lässt du los – je näher an der Mitte, desto mehr Punkte.
 * Acht Runden mit steigender Schwierigkeit: Die Zone schrumpft, das Pendel wird schneller, ab Runde 3 wandert die Zone,
 * ab Runde 6 schwingt das Pendel ungleichmäßig. Treffer ab 800 in Serie geben Bonus, die letzte Runde zählt doppelt.
 */
export interface PendelRound {
  /** Grundmitte der Zielzone in [-1, 1] (Pendelweg) */
  c: number;
  /** Halbe Breite der Zielzone */
  h: number;
  /** Kreisfrequenz des Pendels (rad/s) */
  omega: number;
  phase0: number;
  /** Wandernde Zone: Amplitude, Kreisfrequenz (rad/s), Phase */
  zm: number;
  zw: number;
  zph: number;
  /** Ungleichmäßiges Schwingen: Phasenmodulation (Amplitude, Kreisfrequenz rad/s) */
  wa: number;
  ww: number;
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
  /** Zonenmitte beim Stopp */
  stopC: number;
  /** Punkte je abgeschlossener Runde (mit Bonus) */
  pts: number[];
  total: number;
  /** Treffer ab GOOD in Folge */
  streak: number;
  /** Serienbonus der letzten Runde */
  lastBonus: number;
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
/** Ab so vielen Punkten zählt ein Stopp für die Serie */
export const GOOD = 800;
const RESULT_TICKS = 42;

/** Pendelposition in [-1, 1] nach k Ticks */
export const pendulumPos = (r: PendelRound, k: number): number => {
  const t = k / 60;
  return Math.sin(r.phase0 + r.omega * t + r.wa * Math.sin(r.ww * t));
};
/** Mitte der Zielzone nach k Ticks */
export const zoneCenter = (r: PendelRound, k: number): number =>
  r.zm ? clamp(r.c + r.zm * Math.sin(r.zw * (k / 60) + r.zph), -0.88 + r.h, 0.88 - r.h) : r.c;

/** Grundpunkte für einen Stopp bei Position p, wenn die Zonenmitte bei c liegt */
export function roundPoints(r: PendelRound, p: number, c = r.c): number {
  const e = Math.abs(p - c) / r.h;
  return Math.round(1000 * Math.exp(-(e * e) / 1.5));
}
/** Serienbonus für die n-te gute Runde in Folge */
export const streakBonus = (n: number): number => 100 * clamp(n - 1, 0, 4);

/** Art der Runde für Anzeige und Anleitung */
export const roundKind = (r: PendelRound): string =>
  r.wa ? 'Wackelpendel' : r.zm ? 'Wandernde Zone' : 'Ruhige Zone';

export const game: MiniGame<PendelState> = {
  id: 'pendelpunkt',
  name: 'Pendel-Punkt',
  tagline: 'Lass im richtigen Moment los – mitten ins Ziel!',
  instructions: [
    'Deine Figur schwingt am Pendel. Drücke A, um loszulassen – sie fällt senkrecht nach unten.',
    'Je näher an der Mitte der Zielzone, desto mehr Punkte (bis 1000). Ab 800 Punkten in Folge gibt es Serienbonus.',
    'Die Zone schrumpft, wandert ab Runde 3, ab Runde 6 schwingt das Pendel ungleichmäßig. Die letzte Runde zählt doppelt!',
  ],
  controls: { desktop: 'Leertaste, Enter oder Mausklick', touch: 'Knopf A antippen' },
  category: 'reaction',
  duration: 30,
  touch: { stick: false, a: true, b: false },
  init(seed) {
    const rnd = new Rng(seed);
    const rounds: PendelRound[] = [];
    let lastC = 0;
    for (let i = 0; i < ROUNDS; i++) {
      const f = i / (ROUNDS - 1);
      const period = lerp(2.4, 1.35, f);
      const h = lerp(0.3, 0.11, f);
      let c = rnd.float(-0.55, 0.55);
      if (Math.abs(c - lastC) < 0.2) c = c > 0 ? c - 0.3 : c + 0.3;
      lastC = c;
      const moving = i >= 2;
      const wobbly = i >= 5;
      rounds.push({
        c,
        h,
        omega: (Math.PI * 2) / period,
        phase0: rnd.float(0, Math.PI * 2),
        zm: moving ? lerp(0.18, 0.42, f) * rnd.float(0.85, 1.1) : 0,
        zw: moving ? rnd.float(1.0, 1.7) : 0,
        zph: rnd.float(0, Math.PI * 2),
        wa: wobbly ? rnd.float(0.45, 0.75) : 0,
        ww: wobbly ? rnd.float(1.4, 2.2) : 0,
      });
    }
    return {
      rounds,
      round: 0,
      phase: 'swing',
      k: 0,
      timer: 0,
      stopPos: 0,
      stopC: 0,
      pts: [],
      total: 0,
      streak: 0,
      lastBonus: 0,
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
        s.stopC = zoneCenter(r, s.k);
        const base = roundPoints(r, s.stopPos, s.stopC);
        if (base >= GOOD) s.streak++;
        else s.streak = 0;
        s.lastBonus = base >= GOOD ? streakBonus(s.streak) : 0;
        const p = (base + s.lastBonus) * (s.round === ROUNDS - 1 ? 2 : 1);
        s.pts.push(p);
        s.total += p;
        s.timedOut = false;
        stopped = true;
      } else if (s.k >= ARM + MAX_SWING) {
        s.stopPos = pendulumPos(r, s.k);
        s.stopC = zoneCenter(r, s.k);
        s.pts.push(0);
        s.streak = 0;
        s.lastBonus = 0;
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
    // Menschlich: erst nach einer Weile "zielen", dann den nächsten Durchgang durch die Zonenmitte anpeilen
    const kmin = ARM + Math.round(lerp(34, 6, skill)) + (h % 14);
    let kStar = kmin;
    let prev = pendulumPos(r, kmin - 1) - zoneCenter(r, kmin - 1);
    for (let k = kmin; k < ARM + MAX_SWING; k++) {
      const d = pendulumPos(r, k) - zoneCenter(r, k);
      if (d * prev <= 0) {
        kStar = Math.abs(d) < Math.abs(prev) ? k : k - 1;
        break;
      }
      prev = d;
    }
    const u1 = ((hash(s.seed + 5, s.round * 5 + 2) % 10000) + 0.5) / 10000;
    const u2 = ((hash(s.seed + 9, s.round * 5 + 3) % 10000) + 0.5) / 10000;
    const gauss = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    // schwierige Runden (wandernde Zone, Wackelpendel) streuen bei schwächeren Bots stärker
    const hard = 1 + (r.zm ? 0.35 : 0) + (r.wa ? 0.5 : 0);
    let off = Math.round(gauss * lerp(9, 0.9, skill) * lerp(hard, 1, skill));
    if ((hash(s.seed + 11, s.round * 5 + 4) % 1000) / 1000 < 0.12 * (1 - skill)) off += (h & 1 ? 1 : -1) * 14;
    return { ...NEUTRAL_INPUT, a: s.k === Math.max(ARM + 1, kStar + off) };
  },
  hud: (s) => {
    const last = s.pts[s.pts.length - 1];
    const r = s.rounds[Math.min(s.round, ROUNDS - 1)] as PendelRound;
    const fin = s.round === ROUNDS - 1;
    return {
      left: `Runde ${Math.min(s.round + 1, ROUNDS)}/${ROUNDS}`,
      right: `${s.total} Pkt`,
      hint:
        s.phase === 'result' && last !== undefined
          ? s.timedOut
            ? 'Zu spät – nicht losgelassen!'
            : s.lastBonus
              ? `+${last} (Serie ${s.streak}!)`
              : `+${last}`
          : s.phase === 'swing' && s.k <= ARM
            ? fin
              ? 'FINALE: doppelte Punkte!'
              : roundKind(r)
            : 'Loslassen mit A',
    };
  },
};
