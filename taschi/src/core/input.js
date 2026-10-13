// Unified input: keyboard (remappable), mouse, touch (floating joystick,
// camera drag, action buttons) and Gamepad API (remappable buttons, stick
// dead zones, controller detection). The game polls actions per frame, so
// input is only ever consumed by the active state (no leaks into the world
// while dialogs, battles or loading screens are shown).
import { Emitter } from './events.js';

export const ACTIONS = ['up', 'down', 'left', 'right', 'confirm', 'back', 'menu', 'run', 'team', 'map', 'camLeft', 'camRight', 'tabPrev', 'tabNext'];
export const ACTION_LABELS = { up: 'Hoch / Vorwärts', down: 'Runter / Zurück', left: 'Links', right: 'Rechts', confirm: 'Bestätigen / Aktion', back: 'Zurück / Abbrechen', menu: 'Menü', run: 'Sprinten (halten)', team: 'Team', map: 'Karte', camLeft: 'Kamera links', camRight: 'Kamera rechts', tabPrev: 'Reiter links', tabNext: 'Reiter rechts' };

export const DEFAULT_KEYS = {
  up: ['w', 'arrowup'], down: ['s', 'arrowdown'], left: ['a', 'arrowleft'], right: ['d', 'arrowright'],
  confirm: ['e', 'enter', ' '], back: ['backspace', 'q'], menu: ['escape', 'p'], run: ['shift'], team: ['t'], map: ['m'],
  camLeft: ['z'], camRight: ['c'], tabPrev: ['[', 'pageup', '1'], tabNext: [']', 'pagedown', '3']
};
// Standard gamepad mapping indices
export const DEFAULT_PAD = { confirm: 0, back: 1, run: 2, team: 3, tabPrev: 4, tabNext: 5, camLeft: 6, camRight: 7, map: 8, menu: 9, up: 12, down: 13, left: 14, right: 15 };
export const PAD_NAMES = { 0: 'A / ✕', 1: 'B / ◯', 2: 'X / ▢', 3: 'Y / △', 4: 'LB / L1', 5: 'RB / R1', 6: 'LT / L2', 7: 'RT / R2', 8: 'Select', 9: 'Start', 10: 'L3', 11: 'R3', 12: '↑', 13: '↓', 14: '←', 15: '→', 16: 'Home' };

export class Input extends Emitter {
  constructor(settings) {
    super();
    this.settings = settings;
    this.down = new Set(); this.edges = new Set(); this.released = new Set();
    this.move = { x: 0, y: 0 }; this.cam = { x: 0, y: 0, zoom: 0 };
    this.keysHeld = new Set();
    this.pad = null; this.padPrev = []; this.padType = null; this.lastDevice = 'keyboard';
    this.touch = { joyId: null, joyOrigin: null, joyVec: { x: 0, y: 0 }, camId: null, camLast: null };
    this.remap = null;
    this.enabled = true;
    this.bindKeyboard(); this.bindMouse();
    addEventListener('gamepadconnected', (e) => { this.emit('pad', e.gamepad); this.lastDevice = 'gamepad'; });
    addEventListener('gamepaddisconnected', () => { this.pad = null; this.emit('pad', null); });
  }
  get keys() { return this.settings.get('keys'); }
  get padMap() { return this.settings.get('pad'); }
  actionsForKey(k) { return ACTIONS.filter(a => (this.keys[a] || []).includes(k)); }
  bindKeyboard() {
    addEventListener('keydown', (e) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key.toLowerCase();
      if (this.remap) { e.preventDefault(); this.finishRemapKey(k); return; }
      if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
      const acts = this.actionsForKey(k);
      if (acts.length || ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'tab'].includes(k)) e.preventDefault();
      if (e.repeat) { for (const a of acts) if (['up', 'down', 'left', 'right'].includes(a)) this.edges.add(a); return; }
      this.lastDevice = 'keyboard';
      this.keysHeld.add(k);
      for (const a of acts) { this.down.add(a); this.edges.add(a); }
    });
    addEventListener('keyup', (e) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key.toLowerCase();
      this.keysHeld.delete(k);
      for (const a of this.actionsForKey(k)) {
        const stillHeld = (this.keys[a] || []).some(other => other !== k && this.keysHeld.has(other));
        if (!stillHeld) this.down.delete(a);
        this.released.add(a);
      }
    });
    addEventListener('blur', () => { this.down.clear(); this.keysHeld.clear(); this.move.x = this.move.y = 0; this.touch.joyVec = { x: 0, y: 0 }; });
  }
  bindMouse() {
    let drag = null;
    addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.target.tagName !== 'CANVAS') return;
      if (e.button === 2 || e.button === 0) drag = { x: e.clientX, y: e.clientY, button: e.button };
    });
    addEventListener('pointermove', (e) => {
      if (!drag || e.pointerType !== 'mouse') return;
      this.cam.x += (e.clientX - drag.x) * 0.006 * this.settings.get('camSensitivity');
      this.cam.y += (e.clientY - drag.y) * 0.004 * this.settings.get('camSensitivity');
      drag.x = e.clientX; drag.y = e.clientY;
    });
    addEventListener('pointerup', () => { drag = null; });
    addEventListener('contextmenu', (e) => { if (e.target.tagName === 'CANVAS') e.preventDefault(); });
    addEventListener('wheel', (e) => { if (e.target.tagName === 'CANVAS') this.cam.zoom += Math.sign(e.deltaY) * 0.12; }, { passive: true });
  }
  // Touch layer: floating joystick on the movement side, camera drag on the
  // other side; buttons are DOM elements that call press()/release().
  bindTouch(layer, joyEl, nubEl) {
    this.joyEl = joyEl; this.nubEl = nubEl;
    const size = () => this.settings.get('joySize');
    const moveSide = (x) => (this.settings.get('hand') === 'left') ? x < innerWidth * 0.5 : x > innerWidth * 0.5;
    layer.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse') return;
      this.lastDevice = 'touch';
      if (this.touch.joyId === null && moveSide(e.clientX)) {
        this.touch.joyId = e.pointerId;
        const fixed = this.settings.get('joyMode') === 'fixed';
        const r = joyEl.getBoundingClientRect();
        this.touch.joyOrigin = fixed ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: e.clientX, y: e.clientY };
        if (!fixed) { joyEl.style.left = (e.clientX - size() / 2) + 'px'; joyEl.style.top = (e.clientY - size() / 2) + 'px'; joyEl.style.right = 'auto'; joyEl.style.bottom = 'auto'; }
        joyEl.classList.add('active');
        this.updateJoy(e);
      } else if (this.touch.camId === null) {
        this.touch.camId = e.pointerId; this.touch.camLast = { x: e.clientX, y: e.clientY };
      }
      layer.setPointerCapture?.(e.pointerId);
    });
    layer.addEventListener('pointermove', (e) => {
      if (e.pointerId === this.touch.joyId) this.updateJoy(e);
      else if (e.pointerId === this.touch.camId) {
        this.cam.x += (e.clientX - this.touch.camLast.x) * 0.008 * this.settings.get('camSensitivity');
        this.cam.y += (e.clientY - this.touch.camLast.y) * 0.005 * this.settings.get('camSensitivity');
        this.touch.camLast = { x: e.clientX, y: e.clientY };
      }
    });
    const end = (e) => {
      if (e.pointerId === this.touch.joyId) { this.touch.joyId = null; this.touch.joyVec = { x: 0, y: 0 }; nubEl.style.transform = ''; joyEl.classList.remove('active'); if (this.settings.get('joyMode') !== 'fixed') this.placeJoystick(); }
      if (e.pointerId === this.touch.camId) this.touch.camId = null;
    };
    layer.addEventListener('pointerup', end); layer.addEventListener('pointercancel', end);
    this.placeJoystick();
  }
  placeJoystick() {
    if (!this.joyEl) return;
    const s = this.settings.get('joySize'), left = this.settings.get('hand') === 'left';
    this.joyEl.style.width = this.joyEl.style.height = s + 'px';
    this.nubEl.style.width = this.nubEl.style.height = Math.round(s * 0.42) + 'px';
    this.joyEl.style.opacity = String(this.settings.get('joyOpacity') / 100);
    this.joyEl.style.top = 'auto'; this.joyEl.style.bottom = 'calc(28px + env(safe-area-inset-bottom))';
    this.joyEl.style.left = left ? 'calc(26px + env(safe-area-inset-left))' : 'auto';
    this.joyEl.style.right = left ? 'auto' : 'calc(26px + env(safe-area-inset-right))';
  }
  updateJoy(e) {
    const o = this.touch.joyOrigin, s = this.settings.get('joySize') * 0.42;
    let dx = (e.clientX - o.x) / s, dy = (e.clientY - o.y) / s;
    const len = Math.hypot(dx, dy);
    if (len > 1) { dx /= len; dy /= len; }
    const mag = Math.min(1, len), dz = this.settings.get('deadzone');
    const k = mag < dz ? 0 : (mag - dz) / (1 - dz);
    const n = Math.max(mag, 1e-4);
    this.touch.joyVec = { x: dx / n * k, y: dy / n * k };
    this.nubEl.style.transform = `translate(${dx * s * 0.75}px, ${dy * s * 0.75}px)`;
  }
  press(action) { this.down.add(action); this.edges.add(action); }
  release(action) { this.down.delete(action); this.released.add(action); }

  pollGamepad() {
    const pads = navigator.getGamepads ? [...navigator.getGamepads()].filter(Boolean) : [];
    const pad = pads.find(p => p.connected);
    if (!pad) { if (this.pad) { this.pad = null; this.emit('pad', null); } this.padMove = { x: 0, y: 0 }; return; }
    if (!this.pad || this.pad.id !== pad.id) { this.padType = detectPadType(pad.id); this.emit('pad', pad); }
    this.pad = pad;
    const dz = this.settings.get('deadzone');
    const ax = (v) => Math.abs(v) < dz ? 0 : Math.sign(v) * (Math.abs(v) - dz) / (1 - dz);
    this.padMove = { x: ax(pad.axes[0] || 0), y: ax(pad.axes[1] || 0) };
    const cx = ax(pad.axes[2] || 0), cy = ax(pad.axes[3] || 0);
    this.cam.x += cx * 0.045 * this.settings.get('camSensitivity'); this.cam.y += cy * 0.03 * this.settings.get('camSensitivity');
    if (this.remapPad) {
      pad.buttons.forEach((b, i) => { if (b.pressed && !this.padPrev[i]) this.finishRemapPad(i); });
      this.padPrev = pad.buttons.map(b => b.pressed);
      return;
    }
    const map = this.padMap;
    let any = false;
    for (const a of ACTIONS) {
      const i = map[a]; if (i === undefined || !pad.buttons[i]) continue;
      const p = pad.buttons[i].pressed || pad.buttons[i].value > 0.55;
      if (p) { any = true; if (!this.padPrev[i]) { this.edges.add(a); this.down.add(a); } else this.down.add(a); }
      else if (this.padPrev[i]) { this.down.delete(a); this.released.add(a); }
    }
    // stick as menu navigation with repeat
    const now = performance.now();
    const navDir = Math.abs(this.padMove.y) > 0.6 ? (this.padMove.y < 0 ? 'up' : 'down') : Math.abs(this.padMove.x) > 0.6 ? (this.padMove.x < 0 ? 'left' : 'right') : null;
    if (navDir) { if (this._navDir !== navDir || now > this._navNext) { this.edges.add('nav_' + navDir); this._navNext = now + (this._navDir === navDir ? 140 : 380); } any = true; }
    this._navDir = navDir;
    this.padPrev = pad.buttons.map((b) => b.pressed || b.value > 0.55);
    if (any || Math.abs(this.padMove.x) + Math.abs(this.padMove.y) > 0.3) this.lastDevice = 'gamepad';
  }
  // Called once per frame by the game loop before states read input.
  update() {
    this.pollGamepad();
    const k = (a) => (this.keys[a] || []).some(key => this.keysHeld.has(key));
    let x = 0, y = 0;
    if (k('left')) x -= 1; if (k('right')) x += 1; if (k('up')) y -= 1; if (k('down')) y += 1;
    const pm = this.padMove || { x: 0, y: 0 };
    x += pm.x + this.touch.joyVec.x; y += pm.y + this.touch.joyVec.y;
    if (this.pad && this.down.has('left') && this.padMap.left !== undefined && this.pad.buttons[this.padMap.left]?.pressed) x = -1;
    if (this.pad && this.down.has('right') && this.padMap.right !== undefined && this.pad.buttons[this.padMap.right]?.pressed) x = 1;
    if (this.pad && this.down.has('up') && this.padMap.up !== undefined && this.pad.buttons[this.padMap.up]?.pressed) y = -1;
    if (this.pad && this.down.has('down') && this.padMap.down !== undefined && this.pad.buttons[this.padMap.down]?.pressed) y = 1;
    const len = Math.hypot(x, y);
    if (len > 1) { x /= len; y /= len; }
    this.move.x = x; this.move.y = y;
    if (this.down.has('camLeft')) this.cam.x -= 0.035; if (this.down.has('camRight')) this.cam.x += 0.035;
  }
  // read-and-clear
  pressed(a) { if (this.edges.has(a)) { this.edges.delete(a); return true; } return false; }
  peek(a) { return this.edges.has(a); }
  held(a) { return this.down.has(a); }
  nav() {
    for (const d of ['up', 'down', 'left', 'right']) if (this.pressed(d) || this.pressed('nav_' + d)) return d;
    return null;
  }
  takeCamera() { const c = { ...this.cam }; this.cam.x = 0; this.cam.y = 0; this.cam.zoom = 0; return c; }
  endFrame() { this.edges.clear(); this.released.clear(); }
  flush() { this.edges.clear(); this.released.clear(); this.down.forEach(a => { if (!['run'].includes(a)) this.down.delete(a); }); this.keysHeld.clear(); }

  startRemapKey(action, done) { this.remap = { action, done }; }
  finishRemapKey(k) {
    const { action, done } = this.remap; this.remap = null;
    if (k === 'escape') { done(false); return; }
    const keys = { ...this.keys };
    for (const a of ACTIONS) keys[a] = (keys[a] || []).filter(x => x !== k);
    keys[action] = [k, ...(keys[action] || []).filter(x => x !== k)].slice(0, 3);
    this.settings.set('keys', keys);
    done(true, k);
  }
  startRemapPad(action, done) { this.remapPad = { action, done }; }
  finishRemapPad(i) {
    const { action, done } = this.remapPad; this.remapPad = null;
    const map = { ...this.padMap };
    for (const a of Object.keys(map)) if (map[a] === i) delete map[a];
    map[action] = i;
    this.settings.set('pad', map);
    done(true, i);
  }
  padLabel(action) { const i = this.padMap[action]; return i === undefined ? '–' : (glyph(this.padType, i)); }
  keyLabel(action) { return (this.keys[action] || []).map(keyName).join(' / '); }
}

export function detectPadType(id = '') {
  const s = id.toLowerCase();
  if (/054c|playstation|dualshock|dualsense|wireless controller/.test(s)) return 'playstation';
  if (/057e|nintendo|switch|pro controller|joy-con/.test(s)) return 'nintendo';
  if (/045e|xbox|xinput/.test(s)) return 'xbox';
  return 'generic';
}
export function glyph(type, i) {
  const ps = { 0: '✕', 1: '◯', 2: '▢', 3: '△', 4: 'L1', 5: 'R1', 6: 'L2', 7: 'R2', 8: 'Share', 9: 'Options' };
  const xb = { 0: 'A', 1: 'B', 2: 'X', 3: 'Y', 4: 'LB', 5: 'RB', 6: 'LT', 7: 'RT', 8: 'View', 9: 'Menu' };
  const nt = { 0: 'B', 1: 'A', 2: 'Y', 3: 'X', 4: 'L', 5: 'R', 6: 'ZL', 7: 'ZR', 8: '−', 9: '+' };
  const t = type === 'playstation' ? ps : type === 'nintendo' ? nt : xb;
  return t[i] || PAD_NAMES[i] || ('Taste ' + i);
}

const KEY_NAMES = { arrowup: '↑', arrowdown: '↓', arrowleft: '←', arrowright: '→', ' ': 'Leertaste', escape: 'Esc', enter: 'Enter', shift: 'Shift', backspace: '⌫', pageup: 'Bild↑', pagedown: 'Bild↓', tab: 'Tab', control: 'Strg', alt: 'Alt' };
export function keyName(k) { return KEY_NAMES[k] || (k.length === 1 ? k.toUpperCase() : k[0].toUpperCase() + k.slice(1)); }
