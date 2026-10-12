/** Gestenerkennung für Touch-Steuerung (rein, testbar). */
export type Gesture = 'tap' | 'swipe-left' | 'swipe-right' | 'swipe-up' | 'swipe-down';

export interface GestureOptions {
  minSwipe: number;
  maxTapMove: number;
  maxTapMs: number;
}

export const DEFAULT_GESTURE: GestureOptions = { minSwipe: 36, maxTapMove: 14, maxTapMs: 350 };

export function classifyGesture(
  dx: number,
  dy: number,
  ms: number,
  o: GestureOptions = DEFAULT_GESTURE,
): Gesture | null {
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);
  if (ax >= o.minSwipe || ay >= o.minSwipe) {
    if (ax >= ay) return dx < 0 ? 'swipe-left' : 'swipe-right';
    return dy < 0 ? 'swipe-up' : 'swipe-down';
  }
  if (ax <= o.maxTapMove && ay <= o.maxTapMove && ms <= o.maxTapMs) return 'tap';
  return null;
}

export function laneFromX(x: number, width: number, lanes = 3): number {
  if (width <= 0) return Math.floor(lanes / 2);
  const l = Math.floor((x / width) * lanes);
  return Math.min(lanes - 1, Math.max(0, l));
}

/**
 * Verfolgt mehrere Finger; meldet eine Wischgeste sofort, sobald die Schwelle
 * überschritten ist (geringe Latenz), und erlaubt verkettete Wischer.
 */
export class SwipeTracker {
  private pointers = new Map<number, { x: number; y: number; t: number }>();

  constructor(private readonly opts: GestureOptions = DEFAULT_GESTURE) {}

  down(id: number, x: number, y: number, t: number): void {
    this.pointers.set(id, { x, y, t });
  }

  move(id: number, x: number, y: number, t: number): Gesture | null {
    const p = this.pointers.get(id);
    if (!p) return null;
    const g = classifyGesture(x - p.x, y - p.y, t - p.t, this.opts);
    if (g && g !== 'tap') {
      this.pointers.set(id, { x, y, t });
      return g;
    }
    return null;
  }

  up(id: number): void {
    this.pointers.delete(id);
  }

  get active(): number {
    return this.pointers.size;
  }
}
