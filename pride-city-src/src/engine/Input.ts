/* Eingabe-System: Tastatur, Maus, Touch und Gamecontroller werden zu denselben Aktionen.
   Spielcode fragt nur Aktionen ab (pressed/held, move, look) – nie einzelne Geräte. */

export type Action =
  | 'confirm' | 'back' | 'menu' | 'phone' | 'map'
  | 'up' | 'down' | 'left' | 'right'
  | 'tabL' | 'tabR' | 'sprint' | 'camReset' | 'attack' | 'weapon'
  /** Flitzer: steigen / sinken (RB/LB, R/Q, Bild↑/Bild↓, Touch-Knöpfe) */
  | 'rise' | 'sink';

export type InputMode = 'kb' | 'touch' | 'pad';

const KEYS: Record<string, Action[]> = {
  ArrowUp: ['up'], KeyW: ['up'], ArrowDown: ['down'], KeyS: ['down'],
  ArrowLeft: ['left'], KeyA: ['left'], ArrowRight: ['right'], KeyD: ['right'],
  Enter: ['confirm'], Space: ['confirm'], KeyE: ['confirm'], NumpadEnter: ['confirm'],
  Escape: ['back', 'menu'], Backspace: ['back'],
  KeyP: ['phone'], KeyM: ['map'], ShiftLeft: ['sprint'], ShiftRight: ['sprint'],
  KeyQ: ['tabL', 'sink'], KeyR: ['tabR', 'rise'], PageUp: ['rise'], PageDown: ['sink'], KeyC: ['camReset'], KeyF: ['attack'], KeyG: ['weapon'],
};
/* Standard-Layout (gamepad.js liefert jeden Controller so): A B X Y LB RB LT(Angriff) RT Select Start L3(Waffe) R3 ↑ ↓ ← → */
const PAD: Array<Action | null> = ['confirm', 'back', 'phone', 'menu', 'tabL', 'tabR', 'attack', 'sprint', 'map', 'menu', 'weapon', 'camReset', 'up', 'down', 'left', 'right'];
const NAV: Action[] = ['up', 'down', 'left', 'right'];

export class Input {
  mode: InputMode = 'kb';
  /** Bewegung, x = rechts, y = vorwärts, Länge ≤ 1 */
  move = { x: 0, y: 0 };
  /** Kamera-Änderung in diesem Bild (Pixel-ähnlich) */
  look = { x: 0, y: 0 };
  zoom = 0;
  private kb = new Set<Action>();
  private touch = new Set<Action>();
  private pad = new Set<Action>();
  private now = new Set<Action>();
  private prev = new Set<Action>();
  private queued = new Set<Action>();
  private repeatAt = new Map<Action, number>();
  private stick = { x: 0, y: 0 };
  private padMove = { x: 0, y: 0 };
  private drag: { id: number; x: number; y: number } | null = null;
  private listeners = new Set<(m: InputMode) => void>();
  /** Wenn true, verschluckt die Eingabe nichts (Textfelder haben den Fokus) */
  typing = false;

  constructor(surface: HTMLElement) {
    if (matchMedia('(pointer: coarse)').matches) { this.mode = 'touch'; document.documentElement.dataset.input = 'touch'; }
    addEventListener('keydown', (e) => {
      const t = e.target as HTMLElement | null;
      this.typing = !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA');
      if (this.typing && e.code !== 'Escape' && e.code !== 'Enter') return;
      const a = KEYS[e.code];
      if (!a) return;
      this.setMode('kb');
      a.forEach((x) => { if (!this.kb.has(x)) this.queued.add(x); this.kb.add(x); });
      if (e.code.startsWith('Arrow') || e.code === 'Space' || e.code === 'Backspace') e.preventDefault();
    });
    addEventListener('keyup', (e) => KEYS[e.code]?.forEach((x) => this.kb.delete(x)));
    addEventListener('blur', () => { this.kb.clear(); this.touch.clear(); });
    // Kamera: Maus ziehen bzw. ein Finger außerhalb der Bedienelemente
    surface.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch' && e.isTrusted) this.setMode('touch');
      else if (e.pointerType === 'mouse' && this.mode === 'touch') this.setMode('kb');
      if (!this.drag) { this.drag = { id: e.pointerId, x: e.clientX, y: e.clientY }; surface.setPointerCapture?.(e.pointerId); }
    });
    surface.addEventListener('pointermove', (e) => {
      if (!this.drag || this.drag.id !== e.pointerId) return;
      const k = e.pointerType === 'touch' ? 1.6 : 1;
      this.look.x += (e.clientX - this.drag.x) * k; this.look.y += (e.clientY - this.drag.y) * k;
      this.drag.x = e.clientX; this.drag.y = e.clientY;
    });
    const end = (e: PointerEvent) => { if (this.drag?.id === e.pointerId) this.drag = null; };
    surface.addEventListener('pointerup', end); surface.addEventListener('pointercancel', end);
    surface.addEventListener('wheel', (e) => { this.zoom += Math.sign(e.deltaY); e.preventDefault(); }, { passive: false });
    addEventListener('touchstart', (e) => { if (e.isTrusted) this.setMode('touch'); }, { passive: true });
  }

  onMode(fn: (m: InputMode) => void) { this.listeners.add(fn); fn(this.mode); }
  setMode(m: InputMode) {
    if (m === this.mode) return;
    this.mode = m;
    document.documentElement.dataset.input = m;
    this.listeners.forEach((f) => f(m));
  }

  /* Touch-Bedienelemente melden sich hier */
  setStick(x: number, y: number) { this.stick.x = x; this.stick.y = y; }
  touchDown(a: Action) { if (!this.touch.has(a)) this.queued.add(a); this.touch.add(a); }
  touchUp(a: Action) { this.touch.delete(a); }
  /** Einmaliger Druck aus der Oberfläche (z. B. Knopf angetippt) */
  tap(a: Action) { this.queued.add(a); }

  /** Am Anfang jedes Bildes */
  update(t: number) {
    this.pollPad();
    this.prev = this.now;
    this.now = new Set<Action>([...this.kb, ...this.touch, ...this.pad]);
    // Bewegung zusammenführen
    let x = this.stick.x + this.padMove.x, y = this.stick.y + this.padMove.y;
    if (this.now.has('left')) x -= 1; if (this.now.has('right')) x += 1;
    if (this.now.has('up')) y += 1; if (this.now.has('down')) y -= 1;
    const l = Math.hypot(x, y); if (l > 1) { x /= l; y /= l; }
    this.move.x = x; this.move.y = y;
    // Menü-Navigation mit Wiederholung beim Halten (Stick zählt als Richtung)
    const dirs: Record<string, boolean> = {
      up: this.now.has('up') || this.padMove.y > .6 || this.stick.y > .7,
      down: this.now.has('down') || this.padMove.y < -.6 || this.stick.y < -.7,
      left: this.now.has('left') || this.padMove.x < -.6 || this.stick.x < -.7,
      right: this.now.has('right') || this.padMove.x > .6 || this.stick.x > .7,
    };
    for (const d of NAV) {
      if (dirs[d]) {
        const at = this.repeatAt.get(d);
        if (at === undefined) { this.repeatAt.set(d, t + 380); this.queued.add(d); }
        else if (t >= at) { this.repeatAt.set(d, t + 110); this.queued.add(d); }
      } else this.repeatAt.delete(d);
    }
  }
  /** Am Ende jedes Bildes */
  endFrame() { this.queued.clear(); this.look.x = 0; this.look.y = 0; this.zoom = 0; }

  pressed(a: Action): boolean {
    if (NAV.includes(a)) return this.queued.has(a);
    return this.queued.has(a) || (this.now.has(a) && !this.prev.has(a));
  }
  held(a: Action): boolean { return this.now.has(a); }
  /** Aktion verbrauchen, damit sie nicht doppelt wirkt (z. B. Menü schließt und Spiel springt) */
  consume(a: Action) { this.queued.delete(a); this.prev.add(a); }

  private pollPad() {
    this.pad.clear(); this.padMove.x = 0; this.padMove.y = 0;
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const p of pads) {
      if (!p || !p.connected) continue;
      const dz = (v: number) => (Math.abs(v) < .18 ? 0 : (v - Math.sign(v) * .18) / .82);
      const lx = dz(p.axes[0] || 0), ly = dz(p.axes[1] || 0), rx = dz(p.axes[2] || 0), ry = dz(p.axes[3] || 0);
      let any = Math.abs(lx) + Math.abs(ly) + Math.abs(rx) + Math.abs(ry) > 0;
      this.padMove.x += lx; this.padMove.y -= ly;
      this.look.x += rx * 9; this.look.y += ry * 7;
      p.buttons.forEach((b, i) => {
        const a = PAD[i];
        if (b.pressed) { any = true; if (a) this.pad.add(a); }
      });
      // Dpad nur für Menüs/Bewegung als Richtung, nicht als zusätzlicher Stick
      if (p.buttons[4]?.pressed && p.buttons[5]?.pressed) this.pad.add('camReset');
      if (p.buttons[4]?.pressed) this.pad.add('sink'); if (p.buttons[5]?.pressed) this.pad.add('rise');
      if (any) this.setMode('pad');
    }
  }
}
