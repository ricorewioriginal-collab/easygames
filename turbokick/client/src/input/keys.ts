import { NEUTRAL_CAR_INPUT, type CarInput } from '@shared/sim/types';

/** Tastatur-Schemata (zwei Spieler an einer Tastatur). Reine Abbildung ohne DOM, daher testbar. */
export type KeySchemeId = 'wasd' | 'pfeile';

/** Tastenbelegung: Werte sind `KeyboardEvent.code` (physische Tasten, unabhängig vom Tastaturlayout). */
export interface KeyScheme {
  up: readonly string[];
  down: readonly string[];
  left: readonly string[];
  right: readonly string[];
  jump: readonly string[];
  boost: readonly string[];
  airRoll: readonly string[];
  handbrake: readonly string[];
  /** Einmal-Ereignisse (Flanke) */
  ballCam: readonly string[];
  reset: readonly string[];
  pause: readonly string[];
  rearView: readonly string[];
}

export const KEY_SCHEMES: Readonly<Record<KeySchemeId, KeyScheme>> = {
  wasd: {
    up: ['KeyW'],
    down: ['KeyS'],
    left: ['KeyA'],
    right: ['KeyD'],
    jump: ['Space'],
    boost: ['ShiftLeft'],
    airRoll: ['ControlLeft', 'KeyE'],
    handbrake: ['KeyQ'],
    ballCam: ['KeyC'],
    reset: ['KeyR'],
    pause: ['Escape', 'KeyP'],
    rearView: ['KeyF'],
  },
  pfeile: {
    up: ['ArrowUp'],
    down: ['ArrowDown'],
    left: ['ArrowLeft'],
    right: ['ArrowRight'],
    jump: ['Enter', 'NumpadEnter', 'Numpad0'],
    boost: ['ShiftRight', 'Numpad1'],
    airRoll: ['ControlRight', 'Numpad2'],
    handbrake: ['Numpad3', 'Period'],
    ballCam: ['Numpad5', 'Comma'],
    reset: ['Numpad4'],
    pause: ['Numpad9'],
    rearView: ['Numpad6'],
  },
};

/** Alle Tasten eines Schemas (für preventDefault und Überschneidungsprüfung) */
export function schemeCodes(scheme: KeySchemeId): string[] {
  const s = KEY_SCHEMES[scheme];
  return [
    ...s.up,
    ...s.down,
    ...s.left,
    ...s.right,
    ...s.jump,
    ...s.boost,
    ...s.airRoll,
    ...s.handbrake,
    ...s.ballCam,
    ...s.reset,
    ...s.pause,
    ...s.rearView,
  ];
}

const anyDown = (pressed: ReadonlySet<string>, codes: readonly string[]): boolean =>
  codes.some((c) => pressed.has(c));

/**
 * Zielwerte (hart ±1) aus den gedrückten Tasten.
 * - `airborne === false`: nur Boden-Achsen (Gas, Lenken)
 * - `airborne === true`: nur Luft-Achsen (Pitch, Gieren, Rollen)
 * - `airborne` weggelassen: beide Gruppen gefüllt, die Simulation nutzt je nach Lage die passende.
 * Luft: S = Nase hoch (+1), W = Nase runter; A/D = Gieren; Air-Roll-Taste + A/D = Rollen statt Gieren.
 * Gegenrichtungen heben sich auf.
 */
export function keysToInput(pressed: ReadonlySet<string>, scheme: KeySchemeId, airborne?: boolean): CarInput {
  const s = KEY_SCHEMES[scheme];
  const fwd = (anyDown(pressed, s.up) ? 1 : 0) - (anyDown(pressed, s.down) ? 1 : 0);
  const side = (anyDown(pressed, s.right) ? 1 : 0) - (anyDown(pressed, s.left) ? 1 : 0);
  const airRoll = anyDown(pressed, s.airRoll);
  const out: CarInput = {
    ...NEUTRAL_CAR_INPUT,
    jump: anyDown(pressed, s.jump),
    boost: anyDown(pressed, s.boost),
    handbrake: anyDown(pressed, s.handbrake),
  };
  if (airborne !== true) {
    out.throttle = fwd;
    out.steer = side;
  }
  if (airborne !== false) {
    out.pitch = fwd === 0 ? 0 : -fwd;
    out.yaw = airRoll ? 0 : side;
    out.roll = airRoll ? side : 0;
  }
  return out;
}

/** Rampenzeit der Tastatur-Achsen (Sekunden von 0 auf ±1) */
export const KEY_RAMP_SECONDS = 0.08;

/** Bewegt `current` höchstens um dt/rampTime in Richtung `target` (linear, springt nie darüber hinaus). */
export function rampToward(
  current: number,
  target: number,
  dt: number,
  rampTime: number = KEY_RAMP_SECONDS,
): number {
  if (!(dt > 0)) return current;
  const step = rampTime > 0 ? dt / rampTime : Infinity;
  const diff = target - current;
  if (Math.abs(diff) <= step) return target;
  return current + Math.sign(diff) * step;
}

/** Rampt alle fünf Achsen einer Eingabe; Knöpfe werden unverändert aus `target` übernommen. */
export function rampInput(
  current: CarInput,
  target: CarInput,
  dt: number,
  rampTime: number = KEY_RAMP_SECONDS,
): CarInput {
  return {
    throttle: rampToward(current.throttle, target.throttle, dt, rampTime),
    steer: rampToward(current.steer, target.steer, dt, rampTime),
    pitch: rampToward(current.pitch, target.pitch, dt, rampTime),
    yaw: rampToward(current.yaw, target.yaw, dt, rampTime),
    roll: rampToward(current.roll, target.roll, dt, rampTime),
    jump: target.jump,
    boost: target.boost,
    handbrake: target.handbrake,
  };
}
