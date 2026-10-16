// Maus, Touch und Tastatur für die Stadtansicht: Tippen, Ziehen (Kamera oder Straßen malen), Pinch- und Mausrad-Zoom.
import type { World } from '../rendering/world';

export interface ControlHandlers {
  tap(x: number, y: number): void;
  hover(x: number, y: number): void;
  /** true = Ziehen malt (Straßenmodus) statt die Kamera zu schieben. */
  paints(): boolean;
  /** cancel = Strich verwerfen (zweiter Finger zum Zoomen, Abbruch durch den Browser). */
  paint(x: number, y: number, phase: 'start' | 'move' | 'end' | 'cancel'): void;
}

export class Controls {
  private pts = new Map<number, { x: number; y: number }>();
  private downAt: { x: number; y: number } | null = null;
  private moved = false;
  private painting = false;
  private pinch = 0;
  private keys = new Set<string>();
  enabled = true;

  constructor(
    private el: HTMLElement,
    private world: World,
    private h: ControlHandlers,
  ) {
    el.addEventListener('pointerdown', this.down);
    el.addEventListener('pointermove', this.move);
    el.addEventListener('pointerup', this.up);
    el.addEventListener('pointercancel', this.cancel);
    el.addEventListener('wheel', this.wheel, { passive: false });
    el.addEventListener('contextmenu', (e) => e.preventDefault());
    window.addEventListener('keydown', (e) => {
      if ((e.target as HTMLElement)?.closest?.('input,textarea,select')) return;
      this.keys.add(e.key.toLowerCase());
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
    window.addEventListener('blur', () => this.keys.clear());
  }

  private down = (e: PointerEvent): void => {
    if (!this.enabled) return;
    this.el.setPointerCapture?.(e.pointerId);
    this.pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (this.pts.size === 1) {
      this.downAt = { x: e.clientX, y: e.clientY };
      this.moved = false;
      this.painting = this.h.paints() && e.button === 0;
      if (this.painting) this.h.paint(e.clientX, e.clientY, 'start');
    } else if (this.pts.size === 2) {
      if (this.painting) this.h.paint(e.clientX, e.clientY, 'cancel');
      this.painting = false;
      this.moved = true;
      this.pinch = this.dist();
    }
  };
  private dist(): number {
    const [a, b] = [...this.pts.values()];
    return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
  }
  private move = (e: PointerEvent): void => {
    if (!this.enabled) return;
    const prev = this.pts.get(e.pointerId);
    if (!prev) {
      if (e.pointerType === 'mouse') this.h.hover(e.clientX, e.clientY);
      return;
    }
    const dx = e.clientX - prev.x;
    const dy = e.clientY - prev.y;
    if (this.pts.size === 2) {
      const before = this.dist();
      this.pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const after = this.dist();
      if (before > 0 && this.pinch > 0) this.world.setZoom(this.world.zoom * (after / before));
      this.world.pan(dx / 2, dy / 2);
      return;
    }
    this.pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (this.downAt && Math.hypot(e.clientX - this.downAt.x, e.clientY - this.downAt.y) > 8) this.moved = true;
    if (this.painting) {
      this.h.paint(e.clientX, e.clientY, 'move');
      return;
    }
    if (this.moved) this.world.pan(dx, dy);
    if (e.pointerType === 'mouse') this.h.hover(e.clientX, e.clientY);
  };
  private up = (e: PointerEvent): void => {
    const had = this.pts.has(e.pointerId);
    this.pts.delete(e.pointerId);
    if (!had || !this.enabled) return;
    if (this.painting) {
      this.painting = false;
      this.h.paint(e.clientX, e.clientY, 'end');
      if (!this.moved) this.h.tap(e.clientX, e.clientY);
    } else if (this.pts.size === 0 && !this.moved) this.h.tap(e.clientX, e.clientY);
    if (this.pts.size === 0) this.downAt = null;
  };
  private cancel = (e: PointerEvent): void => {
    this.pts.delete(e.pointerId);
    if (this.painting) this.h.paint(e.clientX, e.clientY, 'cancel');
    this.painting = false;
  };
  private wheel = (e: WheelEvent): void => {
    e.preventDefault();
    this.world.setZoom(this.world.zoom * (e.deltaY > 0 ? 0.9 : 1.1));
  };

  /** Tastatur-Kamerafahrt, pro Frame aufgerufen. */
  frame(dt: number): void {
    if (!this.enabled) return;
    const s = 500 * dt;
    const k = this.keys;
    let dx = 0;
    let dy = 0;
    if (k.has('arrowleft') || k.has('a')) dx += s;
    if (k.has('arrowright') || k.has('d')) dx -= s;
    if (k.has('arrowup') || k.has('w')) dy += s;
    if (k.has('arrowdown') || k.has('s')) dy -= s;
    if (dx || dy) this.world.pan(dx, dy);
    if (k.has('+') || k.has('=')) this.world.setZoom(this.world.zoom * (1 + dt));
    if (k.has('-')) this.world.setZoom(this.world.zoom * (1 - dt));
  }
}
