import type { Rng } from '../rng';

/** Eingabe eines Spielers für genau einen Simulationsschritt (1/60 s). Alle Minispiele lesen nur diese Struktur. */
export interface InputFrame {
  /** Steuerung links/rechts (Pfeile, A/D, Stick) in [-1, 1] */
  x: number;
  /** Steuerung vor/zurück bzw. hoch/runter in [-1, 1]; positiv = nach OBEN/vorn (W, Pfeil hoch) */
  y: number;
  /** Aktionstaste A (Leertaste, Enter, linker Touch-Knopf) */
  a: boolean;
  /** Aktionstaste B (Shift, X, rechter Touch-Knopf) */
  b: boolean;
  /** Zeiger (Maus/Touch) in normalisierten Koordinaten [-1, 1]; px nach rechts, py nach OBEN positiv */
  px: number;
  py: number;
  /** Zeiger gedrückt (Maustaste/Finger) */
  pd: boolean;
}

export const NEUTRAL_INPUT: Readonly<InputFrame> = Object.freeze({ x: 0, y: 0, a: false, b: false, px: 0, py: 0, pd: false });
export const TICK_RATE = 60;
export const TICK_DT = 1 / TICK_RATE;

export type MiniGameCategory =
  | 'reaction'
  | 'race'
  | 'platform'
  | 'collect'
  | 'memory'
  | 'rhythm'
  | 'survival'
  | 'physics'
  | 'aim'
  | 'puzzle';

export interface MiniGameInitOptions {
  /** Index des Spielers in der Runde (für Teams, nicht für die Spielwelt: alle bekommen dieselbe Welt) */
  playerIndex: number;
  players: number;
}

/**
 * Ein Minispiel ist eine reine, deterministische Simulation mit festem Zeitschritt.
 * Dieselben (seed, Eingabeprotokoll) ergeben IMMER dasselbe Ergebnis – das macht den Server in der Lage,
 * jedes Ergebnis nachzurechnen. Keine Date.now(), kein Math.random(), keine DOM-/Three-Zugriffe in diesem Teil!
 */
export interface MiniGame<S = any> {
  id: string;
  /** Anzeigename (Deutsch) */
  name: string;
  /** Eine Zeile Untertitel */
  tagline: string;
  /** 2–4 kurze Sätze Anleitung (Deutsch) */
  instructions: string[];
  controls: { desktop: string; touch: string };
  category: MiniGameCategory;
  /** Maximale Spieldauer in Sekunden (Simulationszeit). done() kann früher true werden. */
  duration: number;
  /** Zeigerbedienung wird benötigt (Touch-Oberfläche zeigt dann keinen Stick) */
  usesPointer?: boolean;
  /** Welche Touch-Bedienelemente nötig sind */
  touch: { stick: boolean; a: boolean; b: boolean };
  init(seed: number, opts: MiniGameInitOptions): S;
  /** Ein Schritt (1/60 s). Muss auch nach done() ungefährlich aufrufbar sein (dann nichts tun). */
  step(s: S, input: Readonly<InputFrame>): void;
  done(s: S): boolean;
  /** Ergebnis: endlich, >= 0, höher = besser. Wird zum Ranking verwendet. */
  score(s: S): number;
  /** KI-Eingabe. skill in [0,1] (0 = ungeschickt, 1 = sehr gut). Darf den Zustand nur lesen. */
  bot(s: S, skill: number, rng: Rng): InputFrame;
  /** Kopfzeile während des Spiels */
  hud(s: S): { left: string; right: string; hint?: string };
}

/** Eingabeprotokoll: Wiederholungen werden nicht gespeichert, nur Änderungen: [tick, x, y, flags, px, py, ...] (alles ganze Zahlen) */
export type InputLog = number[];
