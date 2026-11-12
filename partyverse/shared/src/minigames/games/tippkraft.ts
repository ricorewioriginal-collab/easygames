import { Rng } from '../../rng';
import type { InputFrame, MiniGame } from '../types';
import { NEUTRAL_INPUT } from '../types';
import { clamp, lerp } from '../util';
import { hash } from './echomuster';

/**
 * Tippkraft: Abwechselnd A und B tippen lädt die Kraftleiste, die ständig abfällt. Schnelles, sauberes Wechseln baut
 * Schwung auf (bis Stufe 3: mehr Kraft pro Tipp, höheres Tempo). Böen (mit Warnung) muss man durch HALTEN abwettern.
 * Drei Abschnitte: Wiese, Bergauf (Kraft fällt schneller, Felsen langsamer), Endspurt (jeder Meter zählt doppelt).
 */
export interface Gust {
  /** Beginn der Böe (Tick); die Warnung beginnt warn Ticks früher */
  start: number;
  end: number;
  warn: number;
}

export interface TippState {
  t: number;
  /** Kraft 0..100 */
  power: number;
  /** Zurückgelegte Strecke in Metern */
  dist: number;
  /** Zusätzliche Wertungsmeter aus dem Endspurt */
  sprint: number;
  gusts: Gust[];
  /** -1 nichts, 0 A/links, 1 B/rechts: zuletzt gezählte Seite */
  lastSide: number;
  /** Ticks seit dem letzten gezählten Tippen (beliebige Seite) */
  sinceTap: number;
  taps: number;
  stumbles: number;
  /** Schwung 0..FLOW_MAX; Stufe = floor(flow / FLOW_STEP) */
  flow: number;
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
  /** Überstandene Böen (ganz gehalten) */
  braved: number;
  /** Ticks der laufenden Böe ohne Halten */
  gustMiss: number;
  seed: number;
}

const DURATION = 20;
export const TICKS = DURATION * 60;
/** Abschnittsgrenzen in Ticks */
export const HILL_FROM = 7 * 60;
export const SPRINT_FROM = 15 * 60;
const TAP_GAIN = 4.6;
const STUMBLE_LOSS = 6;
export const FLOW_STEP = 10;
export const FLOW_MAX = 30;
/** Ein Tipp zählt für den Schwung, wenn er höchstens so viele Ticks nach dem letzten kommt */
const FLOW_GAP = 11;

export type Section = 'wiese' | 'berg' | 'sprint';
export const sectionAt = (t: number): Section =>
  t >= SPRINT_FROM ? 'sprint' : t >= HILL_FROM ? 'berg' : 'wiese';
export const flowLevel = (flow: number): number => Math.min(3, Math.floor(flow / FLOW_STEP));

/** Index der aktiven Böe zum Zeitpunkt t, -1 = keine */
export function gustAt(gusts: readonly Gust[], t: number): number {
  for (let i = 0; i < gusts.length; i++)
    if (t >= (gusts[i] as Gust).start && t < (gusts[i] as Gust).end) return i;
  return -1;
}
/** Warnphase vor einer Böe? */
export function warnAt(gusts: readonly Gust[], t: number): boolean {
  return gusts.some((g) => t >= g.start - g.warn && t < g.start);
}

/** Geschwindigkeit (m/s) bei Kraft p */
export const speedOf = (p: number): number => 0.3 + 5.6 * Math.pow(p / 100, 1.15);

export const game: MiniGame<TippState> = {
  id: 'tippkraft',
  name: 'Tippkraft',
  tagline: 'Tippen, Schwung holen, Böen trotzen!',
  instructions: [
    'Tippe abwechselnd A und B – schnell und sauber im Wechsel gibt Schwung (bis Stufe 3).',
    'Zweimal dieselbe Taste: Stolperer, Kraft und Schwung weg.',
    'BÖE-Warnung: eine Taste HALTEN, bis der Wind vorbei ist.',
    'Bergauf wird es zäh, im Endspurt zählt jeder Meter doppelt!',
  ],
  controls: {
    desktop: 'Abwechselnd Leertaste (A) und Shift (B) tippen – oder links/rechts klicken. Böe: Taste halten',
    touch: 'Abwechselnd A und B tippen (oder links/rechts auf den Bildschirm). Böe: Knopf halten',
  },
  category: 'race',
  duration: DURATION,
  usesPointer: true,
  touch: { stick: false, a: true, b: true },
  init(seed) {
    const rnd = new Rng(seed);
    const gusts: Gust[] = [];
    let t = 200 + rnd.int(60);
    while (t < TICKS - 120) {
      // Später: längere Böen, kürzere Pausen, knappere Warnung
      const d = t / TICKS;
      const len = Math.round(lerp(60, 95, d)) + rnd.int(30);
      const warn = Math.round(lerp(55, 30, d));
      gusts.push({ start: t, end: Math.min(TICKS - 30, t + len), warn });
      t += len + Math.round(lerp(230, 140, d)) + rnd.int(80);
    }
    return {
      t: 0,
      power: 0,
      dist: 0,
      sprint: 0,
      gusts,
      lastSide: -1,
      sinceTap: 99,
      taps: 0,
      stumbles: 0,
      flow: 0,
      prevA: false,
      prevB: false,
      prevPd: false,
      tapSeq: 0,
      stumbleSeq: 0,
      bracing: false,
      windLost: 0,
      braved: 0,
      gustMiss: 0,
      seed,
    };
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
    const gi = gustAt(s.gusts, s.t);
    const gust = gi >= 0;
    const sec = sectionAt(s.t);
    s.sinceTap++;
    s.bracing = gust && holding;
    if (gust) {
      if (gi >= 0 && s.t === (s.gusts[gi] as Gust).start) s.gustMiss = 0;
      if (s.bracing) {
        s.power = clamp(s.power - 0.05, 0, 100);
      } else {
        // Die Böe drückt die Kraft weg, den Schwung und die Figur zurück
        s.power = clamp(s.power - 1.2, 0, 100);
        s.flow = Math.max(0, s.flow - 0.5);
        s.windLost++;
        s.gustMiss++;
      }
      if (s.t === (s.gusts[gi] as Gust).end - 1 && s.gustMiss <= 6) s.braved++;
    } else {
      if (side >= 0) {
        if (s.lastSide === side) {
          s.power = clamp(s.power - STUMBLE_LOSS, 0, 100);
          s.flow = 0;
          s.stumbles++;
          s.stumbleSeq++;
        } else {
          const lvl = flowLevel(s.flow);
          s.power = clamp(s.power + TAP_GAIN * (1 + 0.18 * lvl), 0, 100);
          if (s.sinceTap <= FLOW_GAP) s.flow = Math.min(FLOW_MAX, s.flow + 1);
          s.taps++;
          s.tapSeq++;
        }
        s.lastSide = side;
        s.sinceTap = 0;
      }
      // Schwung verfliegt, wenn man zu langsam wird
      if (s.sinceTap > FLOW_GAP + 6) s.flow = Math.max(0, s.flow - 0.25);
      const decay = (0.1 + 0.0065 * s.power) * (sec === 'berg' ? 1.45 : sec === 'sprint' ? 1.25 : 1);
      s.power = clamp(s.power - decay, 0, 100);
    }
    const lvl = flowLevel(s.flow);
    let v = speedOf(s.power) * (s.power <= 0.01 ? 0 : 1) * (1 + 0.08 * lvl);
    if (sec === 'berg') v *= 0.8;
    if (gust) v = s.bracing ? v * 0.55 : v * 0.3 - 1.8;
    const before = s.dist;
    s.dist = Math.max(0, s.dist + v / 60);
    if (sec === 'sprint' && s.dist > before) s.sprint += s.dist - before;
    s.t++;
  },
  done: (s) => s.t >= TICKS,
  score: (s) => Math.max(0, Math.round((s.dist + s.sprint) * 10)),
  bot(s, skill, rng): InputFrame {
    const gi = gustAt(s.gusts, s.t);
    if (gi >= 0) {
      // Reaktion auf die Böe: schlechte Spieler halten erst spät
      const react = Math.round(lerp(26, 2, skill));
      return s.t - (s.gusts[gi] as Gust).start >= react
        ? { ...NEUTRAL_INPUT, a: true }
        : { ...NEUTRAL_INPUT };
    }
    // Gute Spieler halten schon kurz vor der Böe fest
    if (skill > 0.7 && s.gusts.some((g) => s.t >= g.start - 4 && s.t < g.start))
      return { ...NEUTRAL_INPUT, a: true };
    const iv = lerp(15, 7.4, skill);
    // Zeitpunkt nächstes Tippen: iv + Streuung (aus dem Zustand abgeleitet, nicht gespeichert)
    const jitter = ((hash(s.seed, s.taps + s.stumbles * 13) % 1000) / 1000 - 0.5) * lerp(8, 2, skill);
    if (s.sinceTap + 1 < iv + jitter) return { ...NEUTRAL_INPUT };
    // Patzer: gelegentlich dieselbe Seite
    const slip = rng.next() < (1 - skill) * 0.08;
    const want = slip ? (s.lastSide < 0 ? 0 : s.lastSide) : s.lastSide === 0 ? 1 : 0;
    // Taste war im Schritt davor noch gedrückt (z. B. nach einer Böe)? Erst loslassen.
    if (s.prevA || s.prevB) return { ...NEUTRAL_INPUT };
    return want === 0 ? { ...NEUTRAL_INPUT, a: true } : { ...NEUTRAL_INPUT, b: true };
  },
  hud: (s) => {
    const g = gustAt(s.gusts, s.t) >= 0;
    const sec = sectionAt(s.t);
    const lvl = flowLevel(s.flow);
    return {
      left: `${Math.round((s.dist + s.sprint) * 10)} Pkt · ${s.dist.toFixed(1)} m`,
      right: lvl > 0 ? `Schwung ${lvl}` : `Kraft ${Math.round(s.power)}`,
      hint: g
        ? s.bracing
          ? 'Halten! Gut so!'
          : 'BÖE – Taste halten!'
        : warnAt(s.gusts, s.t)
          ? 'Böe kommt – gleich halten!'
          : sec === 'sprint'
            ? 'ENDSPURT ×2!'
            : sec === 'berg'
              ? 'Bergauf!'
              : 'A und B im Wechsel!',
    };
  },
};
