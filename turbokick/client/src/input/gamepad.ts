import { NEUTRAL_CAR_INPUT, type CarInput } from '@shared/sim/types';

/** Minimale Form eines Gamepads (das echte `Gamepad` passt strukturell) */
export interface PadLike {
  axes: readonly number[];
  buttons: ReadonlyArray<{ pressed: boolean; value: number }>;
}

export type GamepadSchemeId = 'gamepad0' | 'gamepad1';

/** Standard-Mapping (W3C): Tastenindizes */
export const PAD_BUTTON = {
  A: 0,
  B: 1,
  X: 2,
  Y: 3,
  LB: 4,
  RB: 5,
  LT: 6,
  RT: 7,
  BACK: 8,
  START: 9,
  L3: 10,
  R3: 11,
} as const;

export const STICK_DEADZONE = 0.12;
export const STICK_EXPO = 0.35;
const TRIGGER_DEADZONE = 0.05;

/** Index im `navigator.getGamepads()`-Feld */
export function padIndexOf(scheme: GamepadSchemeId): 0 | 1 {
  return scheme === 'gamepad0' ? 0 : 1;
}

/**
 * Totzone mit Wiederskalierung (kein Sprung am Rand) und Expo-Kurve:
 * out = (1 − e)·x + e·x³ – monoton, Ende bei ±1, feinfühlig um die Mitte.
 */
export function shapeAxis(v: number, deadzone: number = STICK_DEADZONE, expo: number = STICK_EXPO): number {
  if (!Number.isFinite(v)) return 0;
  const a = Math.min(1, Math.abs(v));
  if (a <= deadzone) return 0;
  const x = (a - deadzone) / (1 - deadzone);
  return Math.sign(v) * ((1 - expo) * x + expo * x * x * x);
}

const pressed = (pad: PadLike, i: number): boolean => {
  const b = pad.buttons[i] as { pressed: boolean; value: number } | undefined;
  return b !== undefined && b.pressed;
};

/** Analogwert eines Knopfes (Schultertasten): value, sonst pressed als 0/1 */
const analog = (pad: PadLike, i: number): number => {
  const b = pad.buttons[i] as { pressed: boolean; value: number } | undefined;
  if (!b) return 0;
  const v = Number.isFinite(b.value) ? Math.min(1, Math.max(0, b.value)) : 0;
  const val = v > 0 ? v : b.pressed ? 1 : 0;
  return val < TRIGGER_DEADZONE ? 0 : val;
};

/**
 * Gamepad → CarInput. Beide Pad-Schemata sind gleich belegt (der Index wird außerhalb gewählt).
 * Linker Stick: Lenken/Gieren (x) und Gas-unabhängiger Pitch (y: nach unten ziehen = Nase hoch);
 * RT Gas, LT Rückwärts; A Sprung, X Boost, B Handbremse, RB Air-Roll (Stick x = Rollen statt Gieren).
 * `airborne` wie bei keysToInput (weggelassen = alle Achsen gefüllt).
 */
export function gamepadToInput(pad: PadLike, _scheme?: GamepadSchemeId, airborne?: boolean): CarInput {
  const lx = shapeAxis(pad.axes[0] ?? 0);
  const ly = shapeAxis(pad.axes[1] ?? 0);
  const airRoll = pressed(pad, PAD_BUTTON.RB);
  const out: CarInput = {
    ...NEUTRAL_CAR_INPUT,
    jump: pressed(pad, PAD_BUTTON.A),
    boost: pressed(pad, PAD_BUTTON.X),
    handbrake: pressed(pad, PAD_BUTTON.B),
  };
  if (airborne !== true) {
    out.throttle = analog(pad, PAD_BUTTON.RT) - analog(pad, PAD_BUTTON.LT);
    out.steer = lx;
  }
  if (airborne !== false) {
    out.pitch = ly;
    out.yaw = airRoll ? 0 : lx;
    out.roll = airRoll ? lx : 0;
  }
  return out;
}

/** Einmal-Knöpfe, die als Flanke ausgewertet werden */
export interface PadButtons {
  ballCam: boolean;
  reset: boolean;
  pause: boolean;
  rearView: boolean;
}

/** Aktueller Zustand der Ereignis-Knöpfe: Y Ballkamera, Back Zurücksetzen, Start Pause, LB/R3 Rückblick */
export function gamepadButtons(pad: PadLike): PadButtons {
  return {
    ballCam: pressed(pad, PAD_BUTTON.Y),
    reset: pressed(pad, PAD_BUTTON.BACK),
    pause: pressed(pad, PAD_BUTTON.START),
    rearView: pressed(pad, PAD_BUTTON.LB) || pressed(pad, PAD_BUTTON.R3),
  };
}
