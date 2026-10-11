/**
 * Vertrag zwischen Physik/Spielregeln (shared/src/sim), KI (shared/src/ai), Darstellung (client/src/render) und Netzwerk.
 * Alle Einheiten in Metern/Sekunden. Koordinaten: y = oben, x = quer zum Feld, z = Längsrichtung (Tore bei z = ±HALF_LENGTH).
 * Team 0 („Funken“, orange) verteidigt das Tor bei z = −HALF_LENGTH und greift das Tor bei z = +HALF_LENGTH an;
 * Team 1 („Frost“, blau) umgekehrt.
 */
export type Vec3 = [number, number, number];
export type Quat = [number, number, number, number];
export type TeamId = 0 | 1;

/** Feste Simulationsrate. Die Simulation ist deterministisch: gleicher Startwert + gleiche Eingaben = gleicher Zustand. */
export const TICK_RATE = 60;
export const TICK_DT = 1 / TICK_RATE;

/** Spielfeld (Innenmaße) */
export const ARENA = {
  halfWidth: 40,
  halfLength: 50,
  height: 20,
  /** Radius der abgerundeten Übergänge Boden↔Wand, Wand↔Wand, Wand↔Decke */
  coveRadius: 6,
  goalHalfWidth: 8,
  goalHeight: 6.4,
  goalDepth: 8,
} as const;

export const BALL_RADIUS = 0.92;
/** Fahrzeug-Hitbox (Halbmaße) */
export const CAR_HALF: Vec3 = [0.42, 0.18, 0.59];

export const MAX_BOOST = 100;
export const MAX_CARS = 6;

/** Eingabe für einen Simulationsschritt. Alle Achsen in [−1, 1], Knöpfe true/false. Muss vor dem Schritt bereinigt werden (clampInput). */
export interface CarInput {
  /** +1 Gas, −1 Rückwärts/Bremse */
  throttle: number;
  /** +1 rechts, −1 links (am Boden Lenkung) */
  steer: number;
  /** Luft: +1 Nase hoch */
  pitch: number;
  /** Luft: +1 nach rechts drehen */
  yaw: number;
  /** Luft: +1 im Uhrzeigersinn rollen (Air-Roll) */
  roll: number;
  /** Sprung gedrückt (Flanke löst Sprung/Doppelsprung/Ausweichmanöver aus) */
  jump: boolean;
  boost: boolean;
  /** Handbremse/Drift */
  handbrake: boolean;
}

export const NEUTRAL_CAR_INPUT: Readonly<CarInput> = Object.freeze({
  throttle: 0,
  steer: 0,
  pitch: 0,
  yaw: 0,
  roll: 0,
  jump: false,
  boost: false,
  handbrake: false,
});

export interface CarState {
  /** 0 … n−1, fester Platz im Spiel */
  id: number;
  team: TeamId;
  pos: Vec3;
  quat: Quat;
  vel: Vec3;
  /** Winkelgeschwindigkeit (rad/s) im Weltsystem */
  angVel: Vec3;
  boost: number;
  /** Anzahl der Räder mit Bodenkontakt (0–4); „am Boden“ = mindestens 3 */
  wheelsOnSurface: number;
  /** Erster Sprung benutzt (läuft die Doppelsprung-/Ausweichzeit?) */
  jumpUsed: boolean;
  /** Ausweichmanöver (Flip) noch verfügbar */
  canDodge: boolean;
  /** Sekunden bis Respawn, wenn > 0 ist das Fahrzeug zerstört (nicht berührbar, nicht sichtbar) */
  demolished: number;
  /** Aktuell ausgeführtes Ausweichmanöver (für Animation), 0 = keins */
  dodgeTimer: number;
  /**
   * ERGÄNZUNG (Sim): Sekunden seit Sprung bzw. seit Verlassen des Bodens (steuert Sprung-Halten bis 0,2 s und Ausweichfenster 1,5 s).
   * Achsen des Fahrzeugs im Modellsystem: +x = links, +y = oben, +z = Nase. Quaternionen sind [x, y, z, w].
   */
  jumpTimer: number;
  /** true, solange Boost wirklich Schub gibt (für Effekte/Ton) */
  boosting: boolean;
  /** Letzte Eingabe (für Animationen: Lenkeinschlag, Gas) */
  input: CarInput;
  /** Supersonic-Tempo erreicht (für Effekt) */
  supersonic: boolean;
}

export interface BallState {
  pos: Vec3;
  vel: Vec3;
  angVel: Vec3;
}

export interface PadState {
  /** Feste Position (aus der Arena), hier nur zum bequemen Zugriff */
  pos: Vec3;
  big: boolean;
  /** true = abholbereit */
  active: boolean;
  /** Sekunden bis zur Rückkehr, wenn !active */
  timer: number;
}

export type Phase = 'countdown' | 'playing' | 'goal' | 'ended';

export interface SimState {
  tick: number;
  phase: Phase;
  /** Sekunden bis zum Ende der Phase (countdown: 3→0; goal: Feier-Pause; playing: unbenutzt) */
  phaseTimer: number;
  /** Verbleibende Spielzeit in Sekunden (stoppt in Verlängerung bei 0) */
  clock: number;
  /** Verlängerung (Golden Goal) läuft */
  overtime: boolean;
  score: [number, number];
  cars: CarState[];
  ball: BallState;
  pads: PadState[];
  /** Letzter Ballkontakt: Fahrzeug-ID oder −1 */
  lastTouch: number;
  /** Vorletzter Kontakt (für Vorlage), −1 = keiner */
  prevTouch: number;
  /** Sieger nach phase 'ended': 0, 1 oder −1 (unentschieden gibt es nicht: Verlängerung) */
  winner: -1 | 0 | 1;
  /** ERGÄNZUNG (Sim): Zustand des Zufallsgenerators (mulberry32), damit der gesamte dynamische Zustand im SimState liegt. */
  rngState: number;
}

export type SimEvent =
  | { t: 'countdown'; n: number }
  | { t: 'kickoff' }
  | { t: 'touch'; car: number; speed: number; ballSpeed: number }
  | { t: 'jump'; car: number; kind: 'jump' | 'dodge' }
  | { t: 'pad'; car: number; pad: number; big: boolean }
  | { t: 'wall'; speed: number }
  | { t: 'goal'; team: TeamId; scorer: number; assist: number; speed: number }
  | { t: 'demo'; victim: number; attacker: number }
  | { t: 'respawn'; car: number }
  | { t: 'overtime' }
  | { t: 'end'; winner: TeamId };

export interface SimConfig {
  /** Fahrzeuge in Reihenfolge der IDs; Teamgrößen dürfen verschieden sein (1–3 je Team) */
  cars: Array<{ team: TeamId }>;
  /** Spielzeit in Sekunden (Standard 300) */
  matchSeconds?: number;
  /** Startwert für alles, was zufällig ist (Ballwurf bei Anstoß, Pad-Verhalten) */
  seed: number;
  /** Boost-Pads nutzen (Training darf sie ausschalten) */
  pads?: boolean;
  /** Freies Training: keine Uhr, kein Spielende, Tore zählen nur */
  training?: boolean;
}

/** Einfaches Standardfeld für Boost-Felder: 6 große („Nitro-Kanister“, +100) und 28 kleine (+12), symmetrisch. Die Arena liefert die echten Positionen. */
export const BIG_PAD_BOOST = 100;
export const SMALL_PAD_BOOST = 12;
export const BIG_PAD_RESPAWN = 10;
export const SMALL_PAD_RESPAWN = 4;

export const clamp = (v: number, lo: number, hi: number): number => (v < lo ? lo : v > hi ? hi : v);

/** Macht aus beliebigen (z. B. über das Netz empfangenen) Daten eine gültige Eingabe */
export function clampInput(raw: unknown): CarInput {
  const r = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>;
  const ax = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? clamp(v, -1, 1) : 0);
  return {
    throttle: ax(r.throttle),
    steer: ax(r.steer),
    pitch: ax(r.pitch),
    yaw: ax(r.yaw),
    roll: ax(r.roll),
    jump: r.jump === true,
    boost: r.boost === true,
    handbrake: r.handbrake === true,
  };
}
