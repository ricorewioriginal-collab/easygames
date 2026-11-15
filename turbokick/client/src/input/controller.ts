import { NEUTRAL_CAR_INPUT, clampInput, type CarInput } from '@shared/sim/types';
import {
  PAD_BUTTON,
  PAD_PRESETS,
  gamepadButtons,
  gamepadLook,
  gamepadToInput,
  padGlyph,
  type GamepadSchemeId,
  type PadAction,
  type PadButtons,
  type PadKind,
  type PadLike,
  type PadPreset,
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

/** Belegungstabelle für die Anleitung (Spalten = Schemata); `pad` = Aktion der Controller-Belegung oder feste Achse */
export type HelpPad = PadAction | 'throttle' | 'steer' | 'pitch' | 'yaw' | 'look';
export const CONTROL_HELP: ReadonlyArray<{
  action: string;
  wasd: string;
  pfeile: string;
  pad: HelpPad;
  touch: string;
}> = [
  {
    action: 'Gas / Rückwärts',
    wasd: 'W / S',
    pfeile: 'Pfeil hoch / runter',
    pad: 'throttle',
    touch: 'Stick hoch / runter',
  },
  {
    action: 'Lenken',
    wasd: 'A / D',
    pfeile: 'Pfeil links / rechts',
    pad: 'steer',
    touch: 'Stick links / rechts',
  },
  {
    action: 'Luft: Nase runter / hoch',
    wasd: 'W / S',
    pfeile: 'Pfeil hoch / runter',
    pad: 'pitch',
    touch: 'Stick hoch / runter',
  },
  {
    action: 'Luft: Gieren links / rechts',
    wasd: 'A / D',
    pfeile: 'Pfeil links / rechts',
    pad: 'yaw',
    touch: 'Stick links / rechts',
  },
  {
    action: 'Air-Roll links',
    wasd: 'Strg links oder E + A',
    pfeile: 'Strg rechts + ←',
    pad: 'rollLeft',
    touch: '–',
  },
  {
    action: 'Air-Roll rechts',
    wasd: 'Strg links oder E + D',
    pfeile: 'Strg rechts + →',
    pad: 'rollRight',
    touch: '–',
  },
  {
    action: 'Freie Luftrolle (Stick = Rollen)',
    wasd: 'Strg links oder E',
    pfeile: 'Strg rechts oder Num 2',
    pad: 'rollFree',
    touch: '–',
  },
  {
    action: 'Sprung (zweimal = Hechtstoß)',
    wasd: 'Leertaste',
    pfeile: 'Enter oder Num 0',
    pad: 'jump',
    touch: 'SPRUNG',
  },
  {
    action: 'Schub (halten)',
    wasd: 'Shift links',
    pfeile: 'Shift rechts oder Num 1',
    pad: 'boost',
    touch: 'SCHUB',
  },
  {
    action: 'Handbremse / Drift (lädt Energie)',
    wasd: 'Q',
    pfeile: 'Num 3 oder Punkt',
    pad: 'handbrake',
    touch: 'DRIFT',
  },
  { action: 'Orb-Kamera umschalten', wasd: 'C', pfeile: 'Num 5 oder Komma', pad: 'ballCam', touch: 'ORB' },
  { action: 'Rückblick (halten)', wasd: 'F', pfeile: 'Num 6', pad: 'rearView', touch: '–' },
  { action: 'Kamera frei umschauen', wasd: 'Maus ziehen', pfeile: 'Maus ziehen', pad: 'look', touch: 'Wischen auf freier Fläche' },
  { action: 'Zurücksetzen (Training)', wasd: 'R', pfeile: 'Num 4', pad: 'reset', touch: '–' },
  { action: 'Pause', wasd: 'Esc oder P', pfeile: 'Num 9 (Esc geht auch)', pad: 'pause', touch: 'II' },
];

/** Controller-Spalte der Anleitung als Text mit Symbolen der gewählten Controller-Art */
export function padHelpText(what: HelpPad, preset: PadPreset, kind: PadKind, live = true): string {
  const g = (i: number): string => padGlyph(i, kind, live);
  switch (what) {
    case 'throttle':
      return `${g(PAD_BUTTON.RT)} / ${g(PAD_BUTTON.LT)}`;
    case 'steer':
    case 'yaw':
      return 'Linker Stick ← →';
    case 'pitch':
      return 'Linker Stick ↑ ↓';
    case 'look':
      return 'Rechter Stick';
    default: {
      const list = PAD_PRESETS[preset][what];
      const parts = list.map(g);
      return parts.length ? parts.join(' oder ') : '–';
    }
  }
}

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

  private readonly padOpts: { preset: PadPreset; invertY: boolean; rumble: boolean };

  constructor(
    area: HTMLElement,
    bindings: InputBinding[],
    opts?: { touchLayout?: TouchLayout; padPreset?: PadPreset; invertY?: boolean; rumble?: boolean },
  ) {
    this.padOpts = {
      preset: opts?.padPreset ?? 'nexorb',
      invertY: opts?.invertY ?? false,
      rumble: opts?.rumble ?? true,
    };
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

  /**
   * Gamepad 1/2 = erster/zweiter angeschlossener Controller mit Standard-Belegung (gamepad.js normalisiert auch
   * PlayStation-, Switch- und andere Controller auf dieses Layout). Andere HID-Geräte mit hängenden Achsen, wie sie
   * manche Handys/Adapter melden, werden übersprungen.
   */
  private padOf(scheme: GamepadSchemeId): PadLike | null {
    const want = scheme === 'gamepad0' ? 0 : 1;
    const list = getPads();
    let n = 0;
    for (let i = 0; i < list.length; i++) {
      const p = list[i];
      if (!p) continue;
      if (p.mapping !== undefined && p.mapping !== 'standard') continue;
      if (n === want) return p;
      n++;
    }
    return null;
  }

  /** Vibration am Controller eines lokalen Spielers (falls unterstützt und eingeschaltet) */
  rumble(player: 0 | 1, strong: number, weak: number, ms: number): void {
    if (!this.padOpts.rumble) return;
    for (const slot of this.slots) {
      if (slot.binding.player !== player || !isPadScheme(slot.binding.scheme)) continue;
      const pad = this.padOf(slot.binding.scheme) as
        | (PadLike & { vibrationActuator?: { playEffect?: (t: string, p: object) => Promise<unknown> } })
        | null;
      const act = pad?.vibrationActuator;
      if (!act?.playEffect) continue;
      try {
        void act
          .playEffect('dual-rumble', {
            duration: Math.round(ms),
            strongMagnitude: Math.min(1, Math.max(0, strong)),
            weakMagnitude: Math.min(1, Math.max(0, weak)),
          })
          .catch(() => {});
      } catch {
        /* nicht unterstützt */
      }
    }
  }

  /** Gamepad-Flanken in `pending` übernehmen */
  private pollPad(slot: Slot): PadLike | null {
    if (!isPadScheme(slot.binding.scheme)) return null;
    const pad = this.padOf(slot.binding.scheme);
    const cur: PadButtons = pad
      ? gamepadButtons(pad, this.padOpts.preset)
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
        if (pad)
          out = merge(
            out,
            gamepadToInput(pad, { preset: this.padOpts.preset, invertY: this.padOpts.invertY }),
          );
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

  /** Kamera-Blick für Spieler 0/1: rechter Stick (x, y) und gehaltener Rückblick */
  look(player: 0 | 1): { x: number; y: number; rear: boolean } {
    let x = 0;
    let y = 0;
    let rear = false;
    for (const slot of this.slots) {
      if (slot.binding.player !== player) continue;
      const { scheme } = slot.binding;
      if (isKeyScheme(scheme)) {
        if (KEY_SCHEMES[scheme].rearView.some((c) => this.keys.has(c))) rear = true;
      } else if (isPadScheme(scheme)) {
        const pad = this.padOf(scheme);
        if (!pad) continue;
        const l = gamepadLook(pad);
        if (Math.abs(l.x) > Math.abs(x)) x = l.x;
        if (Math.abs(l.y) > Math.abs(y)) y = l.y;
        if (gamepadButtons(pad, this.padOpts.preset).rearView) rear = true;
      }
    }
    return { x, y, rear };
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
