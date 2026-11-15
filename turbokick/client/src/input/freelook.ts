/**
 * Freies Umschauen per Maus-Ziehen (jede Taste) oder Wischen auf dem Bildschirm.
 * Zählt nur Zeiger, die auf freier Fläche beginnen (Spielbild, HUD-Hintergrund) – nicht auf Knöpfen oder dem Touch-Stick.
 */
export class FreeLook {
  private dx = 0;
  private dy = 0;
  private id = -1;
  private lx = 0;
  private ly = 0;
  private lastMove = -1e9;
  private readonly off: Array<() => void> = [];

  constructor(private readonly accept: (target: EventTarget | null) => boolean) {
    if (typeof window === 'undefined') return;
    const w = window;
    const down = (e: PointerEvent): void => {
      if (this.id !== -1 || !this.accept(e.target)) return;
      this.id = e.pointerId;
      this.lx = e.clientX;
      this.ly = e.clientY;
    };
    const move = (e: PointerEvent): void => {
      if (e.pointerId !== this.id) return;
      this.dx += e.clientX - this.lx;
      this.dy += e.clientY - this.ly;
      this.lx = e.clientX;
      this.ly = e.clientY;
      this.lastMove = performance.now();
    };
    const up = (e: PointerEvent): void => {
      if (e.pointerId === this.id) this.id = -1;
    };
    const ctx = (e: MouseEvent): void => {
      if (this.accept(e.target)) e.preventDefault();
    };
    w.addEventListener('pointerdown', down);
    w.addEventListener('pointermove', move);
    w.addEventListener('pointerup', up);
    w.addEventListener('pointercancel', up);
    w.addEventListener('contextmenu', ctx);
    this.off.push(() => {
      w.removeEventListener('pointerdown', down);
      w.removeEventListener('pointermove', move);
      w.removeEventListener('pointerup', up);
      w.removeEventListener('pointercancel', up);
      w.removeEventListener('contextmenu', ctx);
    });
  }

  /** Bewegung in Pixeln seit dem letzten Aufruf; `holding` = Zeiger liegt noch, `idle` = Sekunden seit der letzten Bewegung */
  take(): { dx: number; dy: number; holding: boolean; idle: number } {
    const out = {
      dx: this.dx,
      dy: this.dy,
      holding: this.id !== -1,
      idle: (performance.now() - this.lastMove) / 1000,
    };
    this.dx = 0;
    this.dy = 0;
    return out;
  }

  reset(): void {
    this.id = -1;
    this.dx = 0;
    this.dy = 0;
  }

  dispose(): void {
    this.off.forEach((f) => f());
    this.off.length = 0;
  }
}
