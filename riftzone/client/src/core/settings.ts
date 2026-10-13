// Einstellungen (lokal gespeichert): Grafik, Audio, Steuerung, Barrierefreiheit, Online.
import { load, save } from './storage';

export type QualityName = 'auto' | 'low' | 'medium' | 'high' | 'ultra';

export const KEY_ACTIONS = [
  ['forward', 'Vorwärts'],
  ['back', 'Rückwärts'],
  ['left', 'Links'],
  ['right', 'Rechts'],
  ['jump', 'Springen'],
  ['crouch', 'Ducken / Rutschen'],
  ['sprint', 'Sprinten'],
  ['reload', 'Nachladen'],
  ['interact', 'Interagieren'],
  ['build', 'Baumodus'],
  ['wall', 'Wand'],
  ['floor', 'Boden'],
  ['ramp', 'Rampe'],
  ['buildMat', 'Material wechseln'],
  ['pickaxe', 'Spitzhacke'],
  ['slot1', 'Platz 1'],
  ['slot2', 'Platz 2'],
  ['slot3', 'Platz 3'],
  ['slot4', 'Platz 4'],
  ['slot5', 'Platz 5'],
  ['map', 'Karte'],
  ['inventory', 'Inventar'],
  ['emote', 'Emote-Rad'],
  ['drop', 'Gegenstand fallen lassen'],
  ['marker', 'Markierung setzen'],
] as const;

export type KeyAction = (typeof KEY_ACTIONS)[number][0];

export const DEFAULT_KEYS: Record<KeyAction, string> = {
  forward: 'KeyW',
  back: 'KeyS',
  left: 'KeyA',
  right: 'KeyD',
  jump: 'Space',
  crouch: 'ControlLeft',
  sprint: 'ShiftLeft',
  reload: 'KeyR',
  interact: 'KeyE',
  build: 'KeyQ',
  wall: 'KeyZ',
  floor: 'KeyX',
  ramp: 'KeyC',
  buildMat: 'KeyV',
  pickaxe: 'KeyF',
  slot1: 'Digit1',
  slot2: 'Digit2',
  slot3: 'Digit3',
  slot4: 'Digit4',
  slot5: 'Digit5',
  map: 'KeyM',
  inventory: 'Tab',
  emote: 'KeyB',
  drop: 'KeyG',
  marker: 'KeyT',
};

export interface Settings {
  quality: QualityName;
  renderScale: number;
  viewDistance: number;
  shadows: boolean;
  grass: boolean;
  fpsCap: number;
  showFps: boolean;
  master: number;
  sfx: number;
  music: number;
  ui: number;
  sensitivity: number;
  aimSensitivity: number;
  invertY: boolean;
  touchSensitivity: number;
  touchScale: number;
  touchOpacity: number;
  touchAutoFire: boolean;
  touchSprintAuto: boolean;
  gamepadSensitivity: number;
  keys: Record<KeyAction, string>;
  colorblind: 'none' | 'protan' | 'deutan' | 'tritan';
  soundViz: boolean;
  textScale: number;
  reducedMotion: boolean;
  highContrast: boolean;
  vibration: boolean;
  serverUrl: string;
  playerName: string;
  fov: number;
  botSkill: number;
}

export const DEFAULT_SETTINGS: Settings = {
  quality: 'auto',
  renderScale: 1,
  viewDistance: 600,
  shadows: true,
  grass: true,
  fpsCap: 0,
  showFps: false,
  master: 0.8,
  sfx: 0.9,
  music: 0.45,
  ui: 0.7,
  sensitivity: 1,
  aimSensitivity: 0.7,
  invertY: false,
  touchSensitivity: 1,
  touchScale: 1,
  touchOpacity: 0.75,
  touchAutoFire: false,
  touchSprintAuto: true,
  gamepadSensitivity: 1,
  keys: { ...DEFAULT_KEYS },
  colorblind: 'none',
  soundViz: false,
  textScale: 1,
  reducedMotion: false,
  highContrast: false,
  vibration: true,
  serverUrl: '',
  playerName: '',
  fov: 70,
  botSkill: 1,
};

type Listener = (s: Settings) => void;

class SettingsStore {
  data: Settings;
  private listeners: Listener[] = [];
  constructor() {
    this.data = load<Settings>('settings', DEFAULT_SETTINGS);
    this.data.keys = { ...DEFAULT_KEYS, ...this.data.keys };
  }
  get<K extends keyof Settings>(k: K): Settings[K] {
    return this.data[k];
  }
  set<K extends keyof Settings>(k: K, v: Settings[K]): void {
    this.data[k] = v;
    save('settings', this.data);
    for (const l of this.listeners) l(this.data);
  }
  setKey(a: KeyAction, code: string): void {
    // Doppelte Belegung auflösen
    for (const k of Object.keys(this.data.keys) as KeyAction[]) if (this.data.keys[k] === code && k !== a) this.data.keys[k] = '';
    this.data.keys[a] = code;
    save('settings', this.data);
    for (const l of this.listeners) l(this.data);
  }
  resetKeys(): void {
    this.data.keys = { ...DEFAULT_KEYS };
    save('settings', this.data);
    for (const l of this.listeners) l(this.data);
  }
  onChange(l: Listener): () => void {
    this.listeners.push(l);
    return () => {
      this.listeners = this.listeners.filter((x) => x !== l);
    };
  }
}

export const settings = new SettingsStore();

export function keyLabel(code: string): string {
  if (!code) return '—';
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  const map: Record<string, string> = {
    Space: 'Leertaste',
    ShiftLeft: 'Umschalt',
    ShiftRight: 'Umschalt R',
    ControlLeft: 'Strg',
    ControlRight: 'Strg R',
    AltLeft: 'Alt',
    Tab: 'Tab',
    CapsLock: 'Feststell',
    Escape: 'Esc',
    Enter: 'Eingabe',
    Backquote: '^',
    Mouse3: 'Maus 4',
    Mouse4: 'Maus 5',
    Mouse1: 'Mausrad-Klick',
  };
  return map[code] ?? code;
}

/** Farbsichtschwäche: Ersatzfarben für Seltenheiten/Zone. */
export function rarityColor(r: number, cb: Settings['colorblind']): number {
  const base = [0xa8b3bf, 0x3ad6a8, 0x3f8cff, 0xd24bff, 0xffb02e];
  if (cb === 'none') return base[r] ?? base[0]!;
  const alt = [0xb0b0b0, 0x56b4e9, 0x0072b2, 0xcc79a7, 0xe69f00];
  return alt[r] ?? alt[0]!;
}
