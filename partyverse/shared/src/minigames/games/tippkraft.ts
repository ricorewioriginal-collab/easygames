import { Rng } from '../../rng';
import type { InputFrame, MiniGame } from '../types';
import { NEUTRAL_INPUT } from '../types';
import { clamp, lerp } from '../util';
import { hash } from './echomuster';

/**
 * Tippkraft: Abwechselnd A und B tippen lädt die Kraftleiste, die ständig abfällt.
 * Bei einer Böe (Warnung vorher!) heißt es: Taste HALTEN statt tippen. Je höher die Kraft, desto schneller zieht die Figur den Felsen.
 */
export interface Gust {
  /** Beginn der Böe (Tick); die Warnung beginnt WARN Ticks früher */
  start: number;
  end: number;
}

export interface TippState {
  t: number;
  /** Kraft 0..100 */
  power: number;
  /** Zurückgelegte Strecke in Metern */
  dist: number;
  gusts: Gust[];
  /** -1 nichts, 0 A/links, 1 B/rechts: zuletzt gezählte Seite */
  lastSide: number;
  /** Ticks seit dem letzten gezählten Tippen (beliebige Seite) */
  sinceTap: number;
  taps: number;
  stumbles: number;
  prevA: boolean;
  prevB: boolean;
  prevPd: boolean;
  /** Zähler für die Ansicht */
  tapSeq: number;
  stumbleSeq: number;
  /** Gerade festgehalten (Böe überstanden)? */
  bracing: boolean;
  /** Ticks, die während Böen verloren gingen */
  windLost: number;
  seed: number;
}

export const WARN = 50;
const DURATION = 20;
export const TICKS = DURATION * 60;
const TAP_GAIN = 5.2;
const STUMBLE_LOSS = 4;

/** Index der aktiven Böe zum Zeitpunkt t, -1 = keine */
export function gustAt(gusts: readonly Gust[], t: number): number {
  for (let i = 0; i < gusts.length; i++) if (t >= (gusts[i] as Gust).start && t < (gusts[i] as Gust).end) return i;
  return -1;
}
/** Warnphase vor einer Böe? */
export function warnAt(gusts: readonly Gust[], t: number): boolean {
  return gusts.some((g) => t >= g.start - WARN && t < g.start);
}

/** Geschwindigkeit (m/s) bei Kraft p */
export const speedOf = (p: number): number => 0.3 + 5.6 * Math.pow(p / 100, 1.15);

export const game: MiniGame<TippState> = {
  id: 'tippkraft',
  name: 'Tippkraft',
  tagline: 'Zieh den Felsen so weit du kannst',
  instructions: [
    'Tippe abwechselnd A und B (links und rechts), um Kraft aufzubauen.',
    'Die Kraftleiste fällt ständig ab – bleib im Rhythmus! Zweimal dieselbe Taste kostet Kraft.',
    'Kündigt sich eine Böe an, halte eine Taste gedrückt, bis sie vorbei ist. Tippen hilft dann nicht.',
    'Je mehr Kraft, desto schneller zieht deine Figur den Felsen.',
  ],
  controls: { desktop: 'Abwechselnd Leertaste (A) und Shift (B) tippen – oder abwechselnd links und rechts klicken', touch: 'Abwechselnd die Knöpfe A und B tippen (oder links/rechts auf den Bildschirm)' },
  category: 'race',
  duration: DURATION,
  usesPointer: true,
  touch: { stick: false, a: true, b: true },
  init(seed) {
    const rnd = new Rng(seed);
    const gusts: Gust[] = [];
    let t = 240 + rnd.int(60);
    while (t < TICKS - 200) {
      const len = 66 + rnd.int(40);
      gusts.push({ start: t, end: t + len });
      t += len + 200 + rnd.int(110);
    }
    return { t: 0, power: 0, dist: 0, gusts, lastSide: -1, sinceTap: 99, taps: 0, stumbles: 0, prevA: false, prevB: false, prevPd: false, tapSeq: 0, stumbleSeq: 0, bracing: false, windLost: 0, seed };
  },
  step(s, input) {
    if (s.t >= TICKS) return;
    const holding = input.a || input.b || input.pd;
    // Tipp-Flanken: A, B oder Zeiger (linke/rechte Hälfte). Pro Schritt zählt höchstens eine Seite.
    let side = -1;
    if (input.a && !s.prevA) side = 0;
    else if (input.b && !s.prevB) side = 1;
    else if (input.pd && !s.prevPd) side = input.px < 0 ? 0 : 1;
    s.prevA = input.a;
    s.prevB = input.b;
    s.prevPd = input.pd;
    const gust = gustAt(s.gusts, s.t) >= 0;
    s.sinceTap++;
    s.bracing = gust && holding;
    if (gust) {
      if (s.bracing) {
        s.power = clamp(s.power - 0.05, 0, 100);
      } else {
        // Die Böe drückt die Kraft weg und die Figur zurück
        s.power = clamp(s.power - 1.1, 0, 100);
        s.windLost++;
      }
    } else {
      if (side >= 0) {
        if (s.lastSide === side) {
          s.power = clamp(s.power - STUMBLE_LOSS, 0, 100);
          s.stumbles++;
          s.stumbleSeq++;
        } else {
          s.power = clamp(s.power + TAP_GAIN, 0, 100);
          s.taps++;
          s.tapSeq++;
        }
        s.lastSide = side;
        s.sinceTap = 0;
      }
      s.power = clamp(s.power - (0.1 + 0.0065 * s.power), 0, 100);
    }
    let v = speedOf(s.power) * (s.power <= 0.01 ? 0 : 1);
    if (gust) v = s.bracing ? v * 0.55 : v * 0.3 - 1.8;
    s.dist = Math.max(0, s.dist + v / 60);
    s.t++;
  },
  done: (s) => s.t >= TICKS,
  score: (s) => Math.max(0, Math.round(s.dist * 10)),
  bot(s, skill, rng): InputFrame {
    const gi = gustAt(s.gusts, s.t);
    if (gi >= 0) {
      // Reaktion auf die Böe: schlechte Spieler halten erst spät
      const react = Math.round(lerp(30, 5, skill));
      return s.t - (s.gusts[gi] as Gust).start >= react - WARN * Math.min(1, skill * 0.7) ? { ...NEUTRAL_INPUT, a: true } : { ...NEUTRAL_INPUT };
    }
    const iv = lerp(15, 8.2, skill);
    // Zeitpunkt nächstes Tippen: iv + Streuung (aus dem Zustand abgeleitet, nicht gespeichert)
    const jitter = ((hash(s.seed, s.taps + s.stumbles * 13) % 1000) / 1000 - 0.5) * lerp(7, 2, skill);
    if (s.sinceTap + 1 < iv + jitter) return { ...NEUTRAL_INPUT };
    // Patzer: gelegentlich dieselbe Seite
    const slip = rng.next() < (1 - skill) * 0.07;
    const want = slip ? (s.lastSide < 0 ? 0 : s.lastSide) : s.lastSide === 0 ? 1 : 0;
    // Taste war im Schritt davor noch gedrückt (z. B. nach einer Böe)? Erst loslassen.
    if ((want === 0 && s.prevA) || (want === 1 && s.prevB)) return { ...NEUTRAL_INPUT };
    return want === 0 ? { ...NEUTRAL_INPUT, a: true } : { ...NEUTRAL_INPUT, b: true };
  },
  hud: (s) => {
    const g = gustAt(s.gusts, s.t) >= 0;
    return {
      left: `${(s.dist).toFixed(1)} m`,
      right: `Kraft ${Math.round(s.power)}`,
      hint: g ? (s.bracing ? 'Halten! Gut so!' : 'BÖE – Taste halten!') : warnAt(s.gusts, s.t) ? 'Böe kommt – gleich halten!' : 'Abwechselnd A und B tippen',
    };
  },
};
