// Eingabe: Maus, Touch (Tippen, Ziehen, Pinch, Drehen, langes Tippen), Tastatur (frei belegbar) und eigene Controller-Abfrage.
import type { CameraRig } from './camera';

export interface ControlHandlers {
  tap(x: number, y: number, button: number): void;
  longPress(x: number, y: number): void;
  hover(x: number, y: number): void;
  /** Ziehen mit gedrückter Taste im Baumodus (Wände/Räume) – liefert true, wenn verbraucht */
  dragStart(x: number, y: number): boolean;
  dragMove(x: number, y: number): void;
  dragEnd(x: number, y: number): void;
  key(action: string, e: KeyboardEvent): void;
  pad(action: string): void;
  /** Tastenbelegung: Taste → Aktion */
  keymap(): Record<string, string>;
  edgeScroll(): boolean;
  deadzone(): number;
  uiBlocked(): boolean;
  /** Bodenpunkt unter dem Mauszeiger (für Zoom zum Zeiger) */
  groundAt?(x: number, y: number): { x: number; z: number } | null;
}

interface Ptr {
  id: number;
  x: number;
  y: number;
  sx: number;
  sy: number;
  t: number;
  button: number;
}

export class Controls {
  private ptrs = new Map<number, Ptr>();
  private dragging = false;
  private buildDrag = false;
  private longTimer = 0;
  private pinch: { d: number; a: number } | null = null;
  private keys = new Set<string>();
  private mouse = { x: -1, y: -1, in: false };
  private padPrev: boolean[] = [];
  padActive = false;
  /** virtueller Cursor für Controller (Bildschirmmitte) */
  cursor = { x: 0, y: 0 };

  constructor(private el: HTMLElement, private rig: CameraRig, private hd: ControlHandlers) {
    el.addEventListener('pointerdown', this.down);
    window.addEventListener('pointermove', this.move);
    window.addEventListener('pointerup', this.up);
    window.addEventListener('pointercancel', this.up);
    el.addEventListener('wheel', this.wheel, { passive: false });
    el.addEventListener('contextmenu', (e) => e.preventDefault());
    el.addEventListener('pointerleave', () => (this.mouse.in = false));
    window.addEventListener('keydown', this.keydown);
    window.addEventListener('keyup', (e) => this.keys.delete(this.norm(e)));
    window.addEventListener('blur', () => this.keys.clear());
  }

  private norm(e: KeyboardEvent): string {
    return e.key === ' ' ? ' ' : e.key.toLowerCase();
  }

  private down = (e: PointerEvent): void => {
    this.el.setPointerCapture?.(e.pointerId);
    this.padActive = false;
    const p: Ptr = { id: e.pointerId, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, t: performance.now(), button: e.button };
    this.ptrs.set(e.pointerId, p);
    this.dragging = false;
    this.buildDrag = false;
    if (this.ptrs.size === 1 && e.button === 0) {
      clearTimeout(this.longTimer);
      if (e.pointerType !== 'mouse') this.longTimer = window.setTimeout(() => {
        if (!this.dragging && this.ptrs.size === 1) {
          this.dragging = true; // kein Tippen mehr auslösen
          this.hd.longPress(p.x, p.y);
        }
      }, 520);
    }
    if (this.ptrs.size === 2) {
      clearTimeout(this.longTimer);
      const [a, b] = [...this.ptrs.values()];
      this.pinch = { d: Math.hypot(a!.x - b!.x, a!.y - b!.y), a: Math.atan2(b!.y - a!.y, b!.x - a!.x) };
      this.dragging = true;
      if (this.buildDrag) {
        this.buildDrag = false;
        this.hd.dragEnd(p.x, p.y);
      }
    }
  };

  private move = (e: PointerEvent): void => {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
    this.mouse.in = e.target === this.el;
    const p = this.ptrs.get(e.pointerId);
    if (!p) {
      if (e.pointerType === 'mouse' && e.target === this.el) this.hd.hover(e.clientX, e.clientY);
      return;
    }
    const dx = e.clientX - p.x,
      dy = e.clientY - p.y;
    p.x = e.clientX;
    p.y = e.clientY;
    if (this.ptrs.size === 2 && this.pinch) {
      const [a, b] = [...this.ptrs.values()];
      const d = Math.hypot(a!.x - b!.x, a!.y - b!.y);
      const ang = Math.atan2(b!.y - a!.y, b!.x - a!.x);
      if (d > 10) this.rig.zoom(this.pinch.d / d);
      let da = ang - this.pinch.a;
      if (da > Math.PI) da -= Math.PI * 2;
      if (da < -Math.PI) da += Math.PI * 2;
      this.rig.rotate(-da);
      this.rig.pan(dx / 2, dy / 2);
      this.pinch = { d, a: ang };
      return;
    }
    const moved = Math.hypot(p.x - p.sx, p.y - p.sy);
    if (!this.dragging && moved > 8) {
      this.dragging = true;
      clearTimeout(this.longTimer);
      // im Baumodus zieht die linke Taste/der Finger Wände – außer es wird nichts gebaut
      if (p.button === 0 && this.hd.dragStart(p.sx, p.sy)) this.buildDrag = true;
    }
    if (!this.dragging) return;
    if (this.buildDrag) {
      this.hd.dragMove(p.x, p.y);
      return;
    }
    if (p.button === 2 || (e.pointerType === 'mouse' && e.altKey)) {
      this.rig.rotate(-dx * 0.006);
      this.rig.tilt(dy * 0.004);
    } else this.rig.pan(dx, dy);
    if (e.pointerType === 'mouse') this.hd.hover(e.clientX, e.clientY);
  };

  private up = (e: PointerEvent): void => {
    const p = this.ptrs.get(e.pointerId);
    if (!p) return;
    this.ptrs.delete(e.pointerId);
    clearTimeout(this.longTimer);
    if (this.ptrs.size < 2) this.pinch = null;
    if (this.buildDrag) {
      this.buildDrag = false;
      this.hd.dragEnd(e.clientX, e.clientY);
      this.dragging = false;
      return;
    }
    if (!this.dragging && e.type === 'pointerup' && performance.now() - p.t < 700) this.hd.tap(p.x, p.y, p.button);
    if (!this.ptrs.size) this.dragging = false;
  };

  private wheel = (e: WheelEvent): void => {
    e.preventDefault();
    const f = e.ctrlKey ? 1 + e.deltaY * 0.01 : e.deltaY > 0 ? 1.12 : 1 / 1.12;
    // wie im Genre üblich: zum Mauszeiger hin zoomen
    const gp = this.hd.groundAt?.(e.clientX, e.clientY) ?? null;
    if (gp) this.rig.zoomAt(f, gp.x, gp.z);
    else this.rig.zoom(f);
  };

  private keydown = (e: KeyboardEvent): void => {
    const t = e.target as HTMLElement | null;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return;
    const k = this.norm(e);
    this.keys.add(k);
    const map = this.hd.keymap();
    if (k === 'escape') return this.hd.key('escape', e);
    if ((e.ctrlKey || e.metaKey) && k === 'z') return this.hd.key('undo', e);
    if ((e.ctrlKey || e.metaKey) && (k === 'y' || (e.shiftKey && k === 'z'))) return this.hd.key('redo', e);
    if (k === 'pagedown') return this.hd.key('levelDown', e);
    if (k === 'delete' || k === 'backspace') return this.hd.key('delete', e);
    if (k === 'tab') {
      e.preventDefault();
      return this.hd.key('nextSim', e);
    }
    const act = map[k];
    if (act && !['up', 'down', 'left', 'right', 'rotL', 'rotR', 'zoomIn', 'zoomOut'].includes(act)) {
      if (act === 'pause' || act === 'level') e.preventDefault();
      this.hd.key(act, e);
    }
  };

  /** pro Frame: gehaltene Tasten, Bildschirmrand, Controller */
  update(dt: number): void {
    const blocked = this.hd.uiBlocked();
    if (!blocked) {
      const map = this.hd.keymap();
      const held = (a: string): boolean => {
        for (const [k, v] of Object.entries(map)) if (v === a && this.keys.has(k)) return true;
        return (a === 'up' && this.keys.has('arrowup')) || (a === 'down' && this.keys.has('arrowdown')) || (a === 'left' && this.keys.has('arrowleft')) || (a === 'right' && this.keys.has('arrowright'));
      };
      const sp = this.rig.dist * 0.9 * dt;
      if (held('up')) this.rig.move(0, sp);
      if (held('down')) this.rig.move(0, -sp);
      if (held('left')) this.rig.move(-sp, 0);
      if (held('right')) this.rig.move(sp, 0);
      if (held('rotL')) this.rig.rotate(1.6 * dt);
      if (held('rotR')) this.rig.rotate(-1.6 * dt);
      if (held('zoomIn')) this.rig.zoom(1 - dt * 1.5);
      if (held('zoomOut')) this.rig.zoom(1 + dt * 1.5);
      if (this.hd.edgeScroll() && this.mouse.in && !this.ptrs.size) {
        const m = 14,
          W = window.innerWidth,
          H = window.innerHeight;
        if (this.mouse.x < m) this.rig.move(-sp, 0);
        if (this.mouse.x > W - m) this.rig.move(sp, 0);
        if (this.mouse.y < m) this.rig.move(0, sp);
        if (this.mouse.y > H - m) this.rig.move(0, -sp);
      }
    }
    this.pollPad(dt, blocked);
  }

  private pollPad(dt: number, blocked: boolean): void {
    const pads = typeof navigator !== 'undefined' && navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = [...(pads ?? [])].find((p) => p && p.connected);
    if (!gp) return;
    const dz = this.hd.deadzone();
    const ax = (i: number): number => {
      const v = gp.axes[i] ?? 0;
      return Math.abs(v) < dz ? 0 : (v - Math.sign(v) * dz) / (1 - dz);
    };
    const b = (i: number): boolean => !!gp.buttons[i]?.pressed;
    const lx = ax(0),
      ly = ax(1),
      rx = ax(2),
      ry = ax(3);
    if (lx || ly || rx || ry) this.padActive = true;
    if (!blocked) {
      const sp = this.rig.dist * 1.1 * dt;
      if (lx || ly) this.rig.move(lx * sp, -ly * sp);
      if (rx) this.rig.rotate(-rx * 2 * dt);
      if (ry) this.rig.zoom(1 + ry * dt * 1.6);
    }
    this.cursor.x = window.innerWidth / 2;
    this.cursor.y = window.innerHeight / 2;
    // Tasten: 0 A, 1 B, 2 X, 3 Y, 4 LB, 5 RB, 8 Back, 9 Start, 12-15 Steuerkreuz
    const names: [number, string][] = [[0, 'a'], [1, 'b'], [2, 'x'], [3, 'y'], [4, 'lb'], [5, 'rb'], [8, 'back'], [9, 'start'], [12, 'dup'], [13, 'ddown'], [14, 'dleft'], [15, 'dright']];
    for (const [i, n] of names) {
      const now = b(i);
      if (now && !this.padPrev[i]) {
        this.padActive = true;
        this.hd.pad(n);
      }
      this.padPrev[i] = now;
    }
  }
}

/** Fokus-Navigation in Dialogen per Steuerkreuz */
export function moveFocus(dir: 1 | -1): void {
  const scope = document.querySelector<HTMLElement>('.modal-back:last-child .modal') ?? document.querySelector<HTMLElement>('.pie') ?? document.querySelector<HTMLElement>('#menu:not(.hidden)') ?? document.querySelector<HTMLElement>('#cas') ?? document.body;
  const els = [...scope.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input, select, [tabindex="0"]')].filter((e) => e.offsetParent !== null);
  if (!els.length) return;
  const i = els.indexOf(document.activeElement as HTMLElement);
  const n = els[(i + dir + els.length) % els.length]!;
  n.focus();
  n.scrollIntoView?.({ block: 'nearest' });
}
