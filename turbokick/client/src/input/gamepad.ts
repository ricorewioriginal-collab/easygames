import { NEUTRAL_CAR_INPUT, type CarInput } from '@shared/sim/types';

/** Minimale Form eines Gamepads (das echte `Gamepad` passt strukturell) */
export interface PadLike {
  axes: readonly number[];
  buttons: ReadonlyArray<{ pressed: boolean; value: number }>;
  id?: string;
  mapping?: string;
}

export type GamepadSchemeId = 'gamepad0' | 'gamepad1';

/** Standard-Mapping (W3C): Tastenindizes nach Lage (Xbox-Namen; PlayStation ✕○□△, Switch B A Y X) */
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
  UP: 12,
  DOWN: 13,
  LEFT: 14,
  RIGHT: 15,
} as const;

export const STICK_DEADZONE = 0.12;
export const STICK_EXPO = 0.35;
const TRIGGER_DEADZONE = 0.05;

/** Aktionen, die Knöpfe auslösen können */
export type PadAction =
  | 'jump'
  | 'boost'
  | 'handbrake'
  | 'rollLeft'
  | 'rollRight'
  | 'rollFree'
  | 'ballCam'
  | 'rearView'
  | 'reset'
  | 'pause';

export type PadPreset = 'nexorb' | 'klassik' | 'schulter';
export const PAD_PRESET_IDS: readonly PadPreset[] = ['nexorb', 'klassik', 'schulter'];

const B = PAD_BUTTON;
/**
 * Belegungen. Gas immer auf dem rechten Trigger, Rückwärts/Bremse auf dem linken, Lenken/Luftsteuerung auf dem linken Stick.
 * Rechter Stick = freie Kamera (in allen Belegungen).
 */
export const PAD_PRESETS: Readonly<Record<PadPreset, Readonly<Record<PadAction, readonly number[]>>>> = {
  /** NEXORB: Schub auf dem rechten Gesichtsknopf, Air-Roll links/rechts auf den Schultern */
  nexorb: {
    jump: [B.A],
    boost: [B.B],
    handbrake: [B.X, B.L3],
    rollLeft: [B.LB, B.LEFT],
    rollRight: [B.RB, B.RIGHT],
    rollFree: [],
    ballCam: [B.Y, B.UP],
    rearView: [B.R3, B.DOWN],
    reset: [B.BACK],
    pause: [B.START],
  },
  /** Klassisch: Schub auf dem linken Gesichtsknopf, freie Luftrolle auf RB */
  klassik: {
    jump: [B.A],
    boost: [B.X],
    handbrake: [B.B],
    rollLeft: [B.LEFT],
    rollRight: [B.RIGHT],
    rollFree: [B.RB],
    ballCam: [B.Y, B.UP],
    rearView: [B.LB, B.R3, B.DOWN],
    reset: [B.BACK],
    pause: [B.START],
  },
  /** Schultertasten: Schub auf RB, Drift auf LB – Daumen bleibt auf Springen */
  schulter: {
    jump: [B.A],
    boost: [B.RB],
    handbrake: [B.LB, B.B],
    rollLeft: [B.LEFT],
    rollRight: [B.RIGHT],
    rollFree: [B.X],
    ballCam: [B.Y, B.UP],
    rearView: [B.R3, B.DOWN],
    reset: [B.BACK],
    pause: [B.START],
  },
};

export interface PadOptions {
  preset?: PadPreset;
  /** Luft: Stick hoch = Nase hoch (wie im Flugsimulator umgekehrt) */
  invertY?: boolean;
  /** Boden/Luft trennen (undefined = alle Achsen gefüllt) */
  airborne?: boolean;
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
const anyPressed = (pad: PadLike, list: readonly number[]): boolean => list.some((i) => pressed(pad, i));

/** Analogwert eines Knopfes (Trigger): value, sonst pressed als 0/1 */
const analog = (pad: PadLike, i: number): number => {
  const b = pad.buttons[i] as { pressed: boolean; value: number } | undefined;
  if (!b) return 0;
  const v = Number.isFinite(b.value) ? Math.min(1, Math.max(0, b.value)) : 0;
  const val = v > 0 ? v : b.pressed ? 1 : 0;
  return val < TRIGGER_DEADZONE ? 0 : val;
};

/**
 * Gamepad → CarInput. Linker Stick: Lenken/Gieren (x) und Pitch (y: nach unten ziehen = Nase hoch, mit invertY umgekehrt);
 * RT Gas, LT Rückwärts/Bremse (analog); Knöpfe je Belegung. Air-Roll links/rechts rollt direkt, freie Luftrolle macht aus
 * Stick-x Rollen statt Gieren.
 */
export function gamepadToInput(pad: PadLike, opts: PadOptions = {}): CarInput {
  const map = PAD_PRESETS[opts.preset ?? 'nexorb'];
  const lx = shapeAxis(pad.axes[0] ?? 0);
  const ly = shapeAxis(pad.axes[1] ?? 0) * (opts.invertY ? -1 : 1);
  const free = anyPressed(pad, map.rollFree);
  const dir = (anyPressed(pad, map.rollRight) ? 1 : 0) - (anyPressed(pad, map.rollLeft) ? 1 : 0);
  const out: CarInput = {
    ...NEUTRAL_CAR_INPUT,
    jump: anyPressed(pad, map.jump),
    boost: anyPressed(pad, map.boost),
    handbrake: anyPressed(pad, map.handbrake),
  };
  const airborne = opts.airborne;
  if (airborne !== true) {
    out.throttle = analog(pad, B.RT) - analog(pad, B.LT);
    out.steer = lx;
  }
  if (airborne !== false) {
    out.pitch = ly;
    out.yaw = free ? 0 : lx;
    out.roll = dir !== 0 ? dir : free ? lx : 0;
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

/** Aktueller Zustand der Ereignis-Knöpfe je Belegung (der rechte Stick steuert die Kamera) */
export function gamepadButtons(pad: PadLike, preset: PadPreset = 'nexorb'): PadButtons {
  const map = PAD_PRESETS[preset];
  return {
    ballCam: anyPressed(pad, map.ballCam),
    reset: anyPressed(pad, map.reset),
    pause: anyPressed(pad, map.pause),
    rearView: anyPressed(pad, map.rearView),
  };
}

/** Rechter Stick als Kamera-Blick (x rechts, y unten, je −1…1, mit Totzone) */
export function gamepadLook(pad: PadLike): { x: number; y: number } {
  return { x: shapeAxis(pad.axes[2] ?? 0, 0.18, 0.2), y: shapeAxis(pad.axes[3] ?? 0, 0.18, 0.2) };
}

/** Controller-Art für Symbole */
export type PadKind = 'xbox' | 'ps' | 'switch';

/** Art aus der Gerätekennung (Hersteller-IDs: 054c Sony, 057e Nintendo, 045e Microsoft) */
export function kindFromId(id: string): PadKind {
  if (/xbox|045e|xinput/i.test(id)) return 'xbox';
  if (/054c|playstation|dualsense|dualshock|wireless controller/i.test(id)) return 'ps';
  if (/057e|nintendo|pro controller|joy-?con|switch/i.test(id)) return 'switch';
  return 'xbox';
}

/** Symbole nach Lage des Knopfs (Standard-Layout) je Controller-Art */
export const GLYPHS: Readonly<Record<PadKind, readonly string[]>> = {
  xbox: ['A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT', 'View', 'Menu', 'LS', 'RS', '↑', '↓', '←', '→'],
  ps: ['✕', '○', '□', '△', 'L1', 'R1', 'L2', 'R2', 'Create', 'Options', 'L3', 'R3', '↑', '↓', '←', '→'],
  switch: ['B', 'A', 'Y', 'X', 'L', 'R', 'ZL', 'ZR', '−', '+', 'L-Stick', 'R-Stick', '↑', '↓', '←', '→'],
};
/** Farbe der Gesichtsknöpfe (Index 0–3) je Art */
export const GLYPH_COLORS: Readonly<Record<PadKind, readonly string[]>> = {
  xbox: ['#16a34a', '#dc2626', '#2563eb', '#d97706'],
  ps: ['#5b8cff', '#ff5a6e', '#ff6ec7', '#3ddc97'],
  switch: ['#5b5f73', '#5b5f73', '#5b5f73', '#5b5f73'],
};
const STD_NAMES = [
  'a',
  'b',
  'x',
  'y',
  'lb',
  'rb',
  'lt',
  'rt',
  'select',
  'start',
  'l3',
  'r3',
  'up',
  'down',
  'left',
  'right',
];

interface EgPadApi {
  glyph?(k: string): string;
}
interface EgNormApi {
  kind?(): string;
  style?(v?: string): string;
}
const egPad = (): EgPadApi | null =>
  typeof window !== 'undefined'
    ? ((window as unknown as { EasyGamesPad?: EgPadApi }).EasyGamesPad ?? null)
    : null;
const egNorm = (): EgNormApi | null =>
  typeof window !== 'undefined'
    ? ((window as unknown as { EasyGamesPadNormal?: EgNormApi }).EasyGamesPadNormal ?? null)
    : null;

/** Erkannte (oder eingestellte) Controller-Art */
export function currentPadKind(): PadKind {
  const k = egNorm()?.kind?.();
  if (k === 'ps' || k === 'switch' || k === 'xbox') return k;
  try {
    const list = typeof navigator !== 'undefined' && navigator.getGamepads ? navigator.getGamepads() : [];
    for (let i = 0; i < list.length; i++) {
      const p = list[i];
      if (p) return kindFromId(p.id);
    }
  } catch {
    /* gesperrt */
  }
  return 'xbox';
}

/** Symbolvorgabe lesen/setzen (auto | xbox | ps | switch) – gilt für alle easygames-Spiele */
export function padStyle(v?: string): string {
  const n = egNorm();
  if (n?.style) return n.style(v);
  return v ?? 'auto';
}

/** Symbol eines Standard-Knopfs (Index) – berücksichtigt Umbelegung und Nintendo-Tausch von gamepad.js, falls geladen */
export function padGlyph(index: number, kind: PadKind = currentPadKind(), live = true): string {
  const api = live ? egPad() : null;
  const name = STD_NAMES[index];
  if (api?.glyph && name && kind === currentPadKind()) return api.glyph(name);
  return GLYPHS[kind][index] ?? '?';
}
