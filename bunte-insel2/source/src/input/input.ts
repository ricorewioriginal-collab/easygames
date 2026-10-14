/* Eingabe: Tastatur (frei belegbar), Maus, Gamepad und Touch werden zu denselben Aktionen zusammengeführt. */
import { clamp } from '../core/math.ts';

export type Btn = 'jump' | 'action' | 'action2' | 'sprint' | 'attack' | 'dodge' | 'block' | 'special' | 'down' | 'horn' | 'pause' | 'map' | 'journal' | 'inventory' | 'emote' | 'camera' | 'lockon' | 'hint';
export const BTN_LABEL: Record<Btn, string> = {
  jump: 'Springen / Steigen', action: 'Aktion / Reden', action2: 'Zweite Aktion', sprint: 'Rennen', attack: 'Angriff (Wald)', dodge: 'Ausweichen (Wald)',
  block: 'Abwehr (Wald)', special: 'Lichtwelle (Wald)', down: 'Sinken / Ducken', horn: 'Hupe / Rufen', pause: 'Pause', map: 'Karte', journal: 'Tagebuch',
  inventory: 'Rucksack', emote: 'Gesten', camera: 'Kamera-Abstand', lockon: 'Ziel erfassen', hint: 'Hinweis'
};
export const DEFAULT_KEYS: Record<Btn, string[]> = {
  jump: ['Space'], action: ['KeyE', 'Enter'], action2: ['KeyF'], sprint: ['ShiftLeft', 'ShiftRight'], attack: ['KeyJ'], dodge: ['KeyK'], block: ['KeyL'],
  special: ['KeyU'], down: ['KeyX', 'ControlLeft'], horn: ['KeyH'], pause: ['Escape', 'KeyP'], map: ['KeyM'], journal: ['KeyQ'], inventory: ['KeyI', 'Tab'],
  emote: ['KeyG'], camera: ['KeyC'], lockon: ['KeyT'], hint: ['KeyY']
};
const MOVE = { up: ['KeyW', 'ArrowUp'], down: ['KeyS', 'ArrowDown'], left: ['KeyA', 'ArrowLeft'], right: ['KeyD', 'ArrowRight'] };

export class Input {
  moveX = 0; moveY = 0;        // -1..1 (y: vorwärts positiv)
  lookX = 0; lookY = 0;        // Kameradrehung (pro Bild gesammelt)
  zoom = 0;
  private held = new Set<Btn>();
  private down = new Set<Btn>();
  private keys = new Set<string>();
  private map: Record<Btn, string[]> = { ...DEFAULT_KEYS };
  private touchMove = { x: 0, y: 0, active: false };
  private touchHeld = new Set<Btn>();
  gamepadName = '';
  lastDevice: 'keyboard' | 'touch' | 'gamepad' = 'keyboard';
  enabled = true;
  invertY = false;
  sens = 1;
  private dragging = false;
  private lastMouse = { x: 0, y: 0 };
  private padPrev: boolean[] = [];
  /** Wenn gesetzt: Tastendruck wird für Neubelegung abgefangen. */
  capture: ((code: string) => void) | null = null;

  constructor(canvas: HTMLElement) {
    window.addEventListener('keydown', e => this.onKey(e, true));
    window.addEventListener('keyup', e => this.onKey(e, false));
    window.addEventListener('blur', () => this.releaseAll());
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.releaseAll(); });
    canvas.addEventListener('mousedown', e => { if (e.button === 0 || e.button === 2) { this.dragging = true; this.lastMouse = { x: e.clientX, y: e.clientY }; this.lastDevice = 'keyboard'; } });
    window.addEventListener('mouseup', () => { this.dragging = false; });
    window.addEventListener('mousemove', e => {
      if (document.pointerLockElement === canvas) { this.lookX += e.movementX * 0.0025 * this.sens; this.lookY += e.movementY * 0.0025 * this.sens * (this.invertY ? -1 : 1); return; }
      if (!this.dragging) return;
      this.lookX += (e.clientX - this.lastMouse.x) * 0.006 * this.sens;
      this.lookY += (e.clientY - this.lastMouse.y) * 0.006 * this.sens * (this.invertY ? -1 : 1);
      this.lastMouse = { x: e.clientX, y: e.clientY };
    });
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    canvas.addEventListener('wheel', e => { this.zoom += Math.sign(e.deltaY); e.preventDefault(); }, { passive: false });
  }
  setKeys(custom: Record<string, string>): void {
    this.map = { ...DEFAULT_KEYS };
    for (const [b, code] of Object.entries(custom)) if (b in this.map && typeof code === 'string') this.map[b as Btn] = [code];
  }
  keysFor(b: Btn): string[] { return this.map[b]; }
  private onKey(e: KeyboardEvent, isDown: boolean): void {
    const t = e.target as HTMLElement | null;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
    if (isDown && this.capture) { e.preventDefault(); const c = this.capture; this.capture = null; c(e.code); return; }
    this.lastDevice = 'keyboard';
    if (isDown) this.keys.add(e.code); else this.keys.delete(e.code);
    for (const b of Object.keys(this.map) as Btn[]) {
      if (!this.map[b].includes(e.code)) continue;
      if (isDown && !this.held.has(b)) this.down.add(b);
      if (isDown) this.held.add(b); else this.held.delete(b);
      if (['Space', 'Tab', 'ArrowUp', 'ArrowDown'].includes(e.code)) e.preventDefault();
    }
  }
  releaseAll(): void { this.keys.clear(); this.held.clear(); this.touchHeld.clear(); this.touchMove = { x: 0, y: 0, active: false }; this.dragging = false; }
  /* Touch-Schnittstelle (vom HUD benutzt) */
  setTouchMove(x: number, y: number, active: boolean): void { this.touchMove = { x, y, active }; if (active) this.lastDevice = 'touch'; }
  touchLook(dx: number, dy: number): void { this.lookX += dx * 0.008 * this.sens; this.lookY += dy * 0.008 * this.sens * (this.invertY ? -1 : 1); this.lastDevice = 'touch'; }
  pressTouch(b: Btn, isDown: boolean): void {
    this.lastDevice = 'touch';
    if (isDown) { if (!this.touchHeld.has(b)) this.down.add(b); this.touchHeld.add(b); } else this.touchHeld.delete(b);
  }
  tap(b: Btn): void { this.down.add(b); }
  isHeld(b: Btn): boolean { return this.enabled && (this.held.has(b) || this.touchHeld.has(b) || this.padHeld.has(b)); }
  pressed(b: Btn): boolean { return this.enabled && this.down.has(b); }
  consume(b: Btn): boolean { const p = this.pressed(b); this.down.delete(b); return p; }
  private padHeld = new Set<Btn>();
  /** Einmal pro Bild vor der Spiellogik. */
  poll(): void {
    let mx = 0, my = 0;
    if (MOVE.left.some(k => this.keys.has(k))) mx -= 1;
    if (MOVE.right.some(k => this.keys.has(k))) mx += 1;
    if (MOVE.up.some(k => this.keys.has(k))) my += 1;
    if (MOVE.down.some(k => this.keys.has(k))) my -= 1;
    if (mx || my) { const l = Math.hypot(mx, my); mx /= l; my /= l; }
    if (this.touchMove.active) { mx = this.touchMove.x; my = this.touchMove.y; }
    // Gamepad
    this.padHeld.clear();
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const p of pads) {
      if (!p || !p.connected) continue;
      this.gamepadName = p.id;
      const dz = (v: number) => (Math.abs(v) < 0.18 ? 0 : (v - Math.sign(v) * 0.18) / 0.82);
      const ax = dz(p.axes[0] || 0), ay = dz(p.axes[1] || 0);
      if (ax || ay) { mx = ax; my = -ay; this.lastDevice = 'gamepad'; }
      const rx = dz(p.axes[2] || 0), ry = dz(p.axes[3] || 0);
      this.lookX += rx * 0.05 * this.sens; this.lookY += ry * 0.04 * this.sens * (this.invertY ? -1 : 1);
      const b = (i: number) => !!p.buttons[i]?.pressed;
      const MAP: [number, Btn][] = [[0, 'action'], [1, 'jump'], [2, 'attack'], [3, 'action2'], [4, 'block'], [5, 'dodge'], [6, 'down'], [7, 'sprint'], [9, 'pause'], [8, 'journal'], [10, 'lockon'], [11, 'camera'], [12, 'map'], [13, 'inventory'], [14, 'emote'], [15, 'special']];
      for (const [i, btn] of MAP) {
        if (b(i)) { this.padHeld.add(btn); if (!this.padPrev[i]) { this.down.add(btn); this.lastDevice = 'gamepad'; } }
        this.padPrev[i] = b(i);
      }
      break;
    }
    const l = Math.hypot(mx, my);
    if (l > 1) { mx /= l; my /= l; }
    this.moveX = this.enabled ? clamp(mx, -1, 1) : 0;
    this.moveY = this.enabled ? clamp(my, -1, 1) : 0;
  }
  /** Nach der Spiellogik: Einmal-Ereignisse leeren. */
  endFrame(): void { this.down.clear(); this.lookX = 0; this.lookY = 0; this.zoom = 0; }
  /** Gibt es irgendeinen Tastendruck (für „Weiter“)? */
  anyPressed(): boolean { return this.down.size > 0; }
}
