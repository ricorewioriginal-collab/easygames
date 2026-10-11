/** Kleine Hilfen für Minispiel-Simulationen (rein, ohne Zufall und ohne Zeit). */
export const clamp = (v: number, a: number, b: number): number => Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
export const sign = (v: number): number => (v > 0 ? 1 : v < 0 ? -1 : 0);
export const dist2 = (ax: number, ay: number, bx: number, by: number): number => (ax - bx) ** 2 + (ay - by) ** 2;
export const approach = (v: number, target: number, maxStep: number): number =>
  v < target ? Math.min(target, v + maxStep) : Math.max(target, v - maxStep);
/** Flankenerkennung für Tasten: true nur im Schritt, in dem die Taste neu gedrückt wurde */
export class Edge {
  private prev = false;
  /** Zustandsfeld, damit Edge in JSON-/Klon-sicheren Zuständen funktioniert */
  press(now: boolean): boolean {
    const r = now && !this.prev;
    this.prev = now;
    return r;
  }
}
export const seconds = (ticks: number): number => ticks / 60;
