// Device-local settings (controls, graphics, audio). Version-1 input settings
// (taschi.input.v2) are migrated once.
import { DEFAULT_KEYS, DEFAULT_PAD } from './input.js';
import { detectProfile } from '../engine/renderer.js';
import { Emitter } from './events.js';

const KEY = 'taschi.settings.v3';
export const DEFAULTS = {
  graphics: null, adaptive: true, showStats: false, dayCycle: 'cycle', // cycle | day | realtime
  musicVolume: 0.6, sfxVolume: 0.8, ambienceVolume: 0.5, muted: false,
  hand: 'left', joySize: 132, joyOpacity: 80, joyMode: 'floating', deadzone: 0.14, camSensitivity: 1, invertY: false,
  walkSpeed: 1, autoRun: false, textSpeed: 2, vibration: true, camDistance: 1, camAuto: true,
  keys: DEFAULT_KEYS, pad: DEFAULT_PAD, showHints: true
};

export class Settings extends Emitter {
  constructor(storage = localStorage) {
    super();
    this.storage = storage;
    let data = {};
    try { data = JSON.parse(storage.getItem(KEY) || '{}') || {}; } catch {}
    if (!Object.keys(data).length) data = migrateV1(storage);
    this.data = { ...DEFAULTS, ...data, keys: { ...DEFAULT_KEYS, ...(data.keys || {}) }, pad: { ...DEFAULT_PAD, ...(data.pad || {}) } };
    if (!this.data.graphics) this.data.graphics = detectProfile();
  }
  get(k) { return this.data[k]; }
  set(k, v) { this.data[k] = v; this.save(); this.emit('change', k, v); }
  reset(keys) { for (const k of keys) this.data[k] = structuredClone(DEFAULTS[k]); this.save(); this.emit('change', '*'); }
  save() { try { this.storage.setItem(KEY, JSON.stringify(this.data)); } catch {} }
}

function migrateV1(storage) {
  try {
    const old = JSON.parse(storage.getItem('taschi.input.v2') || 'null');
    if (!old) return {};
    const keys = { ...DEFAULT_KEYS };
    const map = { up: 'up', down: 'down', left: 'left', right: 'right', action: 'confirm', menu: 'menu', run: 'run' };
    for (const [from, to] of Object.entries(map)) if (old[from]) keys[to] = [old[from] === 'space' ? ' ' : old[from], ...DEFAULT_KEYS[to].filter(k => k !== old[from])].slice(0, 3);
    return {
      hand: old.hand === 'right' ? 'right' : 'left', joySize: Math.max(90, Math.min(200, Number(old.joystickSize) || 132)),
      joyOpacity: Math.max(30, Math.min(100, Number(old.joystickOpacity) || 80)), deadzone: Math.max(0.05, Math.min(0.35, Number(old.deadzone) || 0.14)),
      walkSpeed: Math.max(0.7, Math.min(1.5, Number(old.speed) || 1)), camDistance: old.camera === 'classic' ? 1.35 : 1,
      graphics: old.graphics === 'performance' ? 'low' : old.graphics === 'quality' ? 'high' : old.graphics === 'balanced' ? 'medium' : null, keys
    };
  } catch { return {}; }
}
