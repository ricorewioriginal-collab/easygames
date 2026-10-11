import { NEUTRAL_CAR_INPUT, clampInput, type CarInput } from '@shared/sim/types';
import {
  gamepadButtons,
  gamepadToInput,
  padIndexOf,
  type GamepadSchemeId,
  type PadButtons,
  type PadLike,
} from './gamepad';
import { KEY_SCHEMES, keysToInput, rampInput, schemeCodes, type KeySchemeId } from './keys';
import { TouchControls, type TouchLayout } from './touch';

export interface ControlScheme {
  id: 'wasd' | 'pfeile' | 'gamepad0' | 'gamepad1' | 'touch';
  name: string;
}
export interface InputBinding {
  player: 0 | 1;
  scheme: ControlScheme['id'];
}

export const CONTROL_SCHEMES: readonly ControlScheme[] = [
  { id: 'wasd', name: 'Tastatur (WASD)' },
  { id: 'pfeile', name: 'Tastatur (Pfeiltasten)' },
  { id: 'gamepad0', name: 'Gamepad 1' },
  { id: 'gamepad1', name: 'Gamepad 2' },
  { id: 'touch', name: 'Touch' },
];

/** Belegungstabelle für die Anleitung (Spalten = Schemata) */
export const CONTROL_HELP: ReadonlyArray<{
  action: string;
  wasd: string;
  pfeile: string;
  gamepad: string;
  touch: string;
}> = [
  {
    action: 'Gas / Rückwärts',
    wasd: 'W / S',
    pfeile: 'Pfeil hoch / runter',
    gamepad: 'RT / LT',
    touch: 'Stick hoch / runter',
  },
  {
    action: 'Lenken',
    wasd: 'A / D',
    pfeile: 'Pfeil links / rechts',
    gamepad: 'Linker Stick links / rechts',
    touch: 'Stick links / rechts',
  },
  {
    action: 'Luft: Nase runter / hoch',
    wasd: 'W / S',
    pfeile: 'Pfeil hoch / runter',
    gamepad: 'Linker Stick hoch / runter',
    touch: 'Stick hoch / runter',
  },
  {
    action: 'Luft: Gieren links / rechts',
    wasd: 'A / D',
    pfeile: 'Pfeil links / rechts',
    gamepad: 'Linker Stick links / rechts',
    touch: 'Stick links / rechts',
  },
  {
    action: 'Air-Roll (mit Lenken = Rollen)',
    wasd: 'Strg links oder E',
    pfeile: 'Strg rechts oder Num 2',
    gamepad: 'RB',
    touch: '–',
  },
  {
    action: 'Sprung (zweimal = Flip)',
    wasd: 'Leertaste',
    pfeile: 'Enter oder Num 0',
    gamepad: 'A',
    touch: 'SPRUNG',
  },
  {
    action: 'Boost (halten)',
    wasd: 'Shift links',
    pfeile: 'Shift rechts oder Num 1',
    gamepad: 'X',
    touch: 'BOOST',
  },
  { action: 'Handbremse / Drift', wasd: 'Q', pfeile: 'Num 3 oder Punkt', gamepad: 'B', touch: 'DRIFT' },
  { action: 'Ballkamera umschalten', wasd: 'C', pfeile: 'Num 5 oder Komma', gamepad: 'Y', touch: 'BALL' },
  { action: 'Rückblick', wasd: 'F', pfeile: 'Num 6', gamepad: 'LB oder R3', touch: '–' },
  { action: 'Zurücksetzen (Training)', wasd: 'R', pfeile: 'Num 4', gamepad: 'Back', touch: '–' },
  { action: 'Pause', wasd: 'Esc oder P', pfeile: 'Num 9 (Esc geht auch)', gamepad: 'Start', touch: 'II' },
];

export function defaultBindings(players: 1 | 2, touch: boolean): InputBinding[] {
  const b: InputBinding[] = [];
  if (players === 1) {
    b.push({ player: 0, scheme: 'wasd' }, { player: 0, scheme: 'pfeile' }, { player: 0, scheme: 'gamepad0' });
  } else {
    b.push(
      { player: 0, scheme: 'wasd' },
      { player: 0, scheme: 'gamepad0' },
      { player: 1, scheme: 'pfeile' },
      { player: 1, scheme: 'gamepad1' },
    );
  }
  if (touch) b.push({ player: 0, scheme: 'touch' });
  return b;
}

type EventFlags = { ballCam: boolean; reset: boolean; pause: boolean; rearView: boolean };
const noEvents = (): EventFlags => ({ ballCam: false, reset: false, pause: false, rearView: false });

interface Slot {
  binding: InputBinding;
  /** Tastatur: geglätteter Zustand */
  ramp: CarInput;
  lastT: number;
  /** Gamepad: Knöpfe des letzten Abrufs (Flankenerkennung) */
  prevButtons: PadButtons;
}

const now = (): number => (typeof performance !== 'undefined' ? performance.now() : Date.now());
const isKeyScheme = (s: ControlScheme['id']): s is KeySchemeId => s === 'wasd' || s === 'pfeile';
const isPadScheme = (s: ControlScheme['id']): s is GamepadSchemeId => s === 'gamepad0' || s === 'gamepad1';

function getPads(): ArrayLike<PadLike | null> {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.getGamepads === 'function')
      return navigator.getGamepads();
  } catch {
    /* gesperrt (z. B. fehlende Berechtigung) */
  }
  return [];
}

/** Zwei Eingaben zusammenführen: größere Achse gewinnt, Knöpfe ODER */
function merge(a: CarInput, b: CarInput): CarInput {
  const m = (x: number, y: number): number => (Math.abs(y) > Math.abs(x) ? y : x);
  return {
    throttle: m(a.throttle, b.throttle),
    steer: m(a.steer, b.steer),
    pitch: m(a.pitch, b.pitch),
    yaw: m(a.yaw, b.yaw),
    roll: m(a.roll, b.roll),
    jump: a.jump || b.jump,
    boost: a.boost || b.boost,
    handbrake: a.handbrake || b.handbrake,
  };
}

/** Lokale Eingabe für bis zu 2 Spieler (Tastatur, Gamepads, Touch) – ein CarInput pro Bild. */
export class LocalInput {
  private readonly keys = new Set<string>();
  private readonly slots: Slot[];
  private readonly pending: [EventFlags, EventFlags] = [noEvents(), noEvents()];
  private readonly cleanup: Array<() => void> = [];
  private readonly touch: TouchControls | null;
  private readonly touchPlayers: Array<0 | 1>;

  constructor(area: HTMLElement, bindings: InputBinding[], opts?: { touchLayout?: TouchLayout }) {
    this.slots = bindings.map((binding) => ({
      binding,
      ramp: { ...NEUTRAL_CAR_INPUT },
      lastT: -1,
      prevButtons: { ballCam: false, reset: false, pause: false, rearView: false },
    }));
    this.touchPlayers = bindings.filter((b) => b.scheme === 'touch').map((b) => b.player);
    this.touch = this.touchPlayers.length > 0 ? new TouchControls(area, opts?.touchLayout ?? 'auto') : null;

    const win = typeof window !== 'undefined' ? window : null;
    if (win) {
      const bound = new Set<string>();
      const keySchemes = bindings.map((b) => b.scheme).filter(isKeyScheme);
      for (const s of keySchemes) schemeCodes(s).forEach((c) => bound.add(c));
      const hasWasd = keySchemes.includes('wasd');
      const firstKeyPlayer = bindings.find((b) => isKeyScheme(b.scheme))?.player;

      const onDown = (e: KeyboardEvent): void => {
        if (isEditable(e.target)) return;
        if (bound.has(e.code) || (e.code === 'Escape' && keySchemes.length > 0)) {
          if (!e.metaKey) e.preventDefault();
        }
        if (e.repeat) return;
        this.keys.add(e.code);
        for (const b of bindings) {
          if (!isKeyScheme(b.scheme)) continue;
          const s = KEY_SCHEMES[b.scheme];
          const p = this.pending[b.player];
          if (s.ballCam.includes(e.code)) p.ballCam = true;
          if (s.reset.includes(e.code)) p.reset = true;
          if (s.pause.includes(e.code)) p.pause = true;
          if (s.rearView.includes(e.code)) p.rearView = true;
        }
        // Esc pausiert auch, wenn nur das Pfeil-Schema belegt ist
        if (e.code === 'Escape' && !hasWasd && firstKeyPlayer !== undefined)
          this.pending[firstKeyPlayer].pause = true;
      };
      const onUp = (e: KeyboardEvent): void => {
        this.keys.delete(e.code);
      };
      const onLoss = (): void => this.resetAll();
      const onVis = (): void => {
        if (typeof document !== 'undefined' && document.visibilityState === 'hidden') this.resetAll();
      };
      win.addEventListener('keydown', onDown);
      win.addEventListener('keyup', onUp);
      win.addEventListener('blur', onLoss);
      this.cleanup.push(() => {
        win.removeEventListener('keydown', onDown);
        win.removeEventListener('keyup', onUp);
        win.removeEventListener('blur', onLoss);
      });
      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', onVis);
        this.cleanup.push(() => document.removeEventListener('visibilitychange', onVis));
      }
    }
  }

  /** Alle Eingaben zurücksetzen (Fokusverlust, Tab-Wechsel): kein hängender Boost */
  private resetAll(): void {
    this.keys.clear();
    for (const s of this.slots) s.ramp = { ...NEUTRAL_CAR_INPUT };
    this.touch?.reset();
    for (const p of this.pending) Object.assign(p, noEvents());
  }

  private padOf(scheme: GamepadSchemeId): PadLike | null {
    const p = getPads()[padIndexOf(scheme)];
    // Nur Controller mit Standard-Belegung (kein Zufalls-HID-Gerät mit hängenden Achsen, wie es manche Handys/Adapter melden)
    if (
      p &&
      (p as { mapping?: string }).mapping !== undefined &&
      (p as { mapping?: string }).mapping !== 'standard'
    )
      return null;
    return p ?? null;
  }

  /** Gamepad-Flanken in `pending` übernehmen */
  private pollPad(slot: Slot): PadLike | null {
    if (!isPadScheme(slot.binding.scheme)) return null;
    const pad = this.padOf(slot.binding.scheme);
    const cur: PadButtons = pad
      ? gamepadButtons(pad)
      : { ballCam: false, reset: false, pause: false, rearView: false };
    const p = this.pending[slot.binding.player];
    if (cur.ballCam && !slot.prevButtons.ballCam) p.ballCam = true;
    if (cur.reset && !slot.prevButtons.reset) p.reset = true;
    if (cur.pause && !slot.prevButtons.pause) p.pause = true;
    if (cur.rearView && !slot.prevButtons.rearView) p.rearView = true;
    slot.prevButtons = cur;
    return pad;
  }

  /** Aktuelle Eingabe für lokalen Spieler 0/1 (bereits geklemmt/geglättet) */
  read(player: 0 | 1): CarInput {
    let out: CarInput = { ...NEUTRAL_CAR_INPUT };
    const t = now();
    for (const slot of this.slots) {
      const { scheme } = slot.binding;
      if (slot.binding.player !== player) continue;
      if (isKeyScheme(scheme)) {
        const dt = slot.lastT < 0 ? 1 / 60 : Math.min(0.1, Math.max(0, (t - slot.lastT) / 1000));
        slot.lastT = t;
        slot.ramp = rampInput(slot.ramp, keysToInput(this.keys, scheme), dt);
        out = merge(out, slot.ramp);
      } else if (isPadScheme(scheme)) {
        const pad = this.pollPad(slot);
        if (pad) out = merge(out, gamepadToInput(pad, scheme));
      } else if (this.touch?.visible) {
        const s = this.touch.read();
        out = merge(out, {
          throttle: s.y,
          steer: s.x,
          pitch: 0 - s.y,
          yaw: s.x,
          roll: 0,
          jump: s.jump,
          boost: s.boost,
          handbrake: s.handbrake,
        });
      }
    }
    return clampInput(out);
  }

  /** Einmal-Ereignisse seit dem letzten Aufruf (true nur einmal) */
  consume(player: 0 | 1): { ballCam: boolean; reset: boolean; pause: boolean; rearView: boolean } {
    for (const slot of this.slots) if (slot.binding.player === player) this.pollPad(slot);
    if (this.touch?.visible) {
      const ev = this.touch.consume();
      const target = this.touchPlayers[0];
      if (target !== undefined) {
        this.pending[target].ballCam ||= ev.ballCam;
        this.pending[target].pause ||= ev.pause;
      }
    }
    const out = { ...this.pending[player] };
    this.pending[player] = noEvents();
    return out;
  }

  /** Roher Touch-Stick (x rechts, y oben, je −1…1) oder null, wenn kein Touch aktiv */
  touchStick(): { x: number; y: number } | null {
    if (!this.touch?.visible) return null;
    const s = this.touch.read();
    return { x: s.x, y: s.y };
  }

  /** Aktuell gezählte Touch-Zeiger (Diagnose) */
  get pointerCount(): number {
    return this.touch?.pointerCount ?? 0;
  }

  /** Anzahl angeschlossener Gamepads (0, wenn die API fehlt) */
  static gamepadsConnected(): number {
    const pads = getPads();
    let n = 0;
    for (let i = 0; i < pads.length; i++) if (pads[i]) n++;
    return n;
  }

  dispose(): void {
    this.cleanup.forEach((f) => f());
    this.cleanup.length = 0;
    this.touch?.dispose();
    this.keys.clear();
  }
}

function isEditable(t: EventTarget | null): boolean {
  const el = t as HTMLElement | null;
  if (!el || typeof el.tagName !== 'string') return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable === true;
}
