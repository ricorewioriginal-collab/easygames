import './touch.css';
import { shapeAxis } from './gamepad';

export type TouchLayout = 'auto' | 'on' | 'off';

/** Stick-Radius in Pixeln (Weg des Daumens bis Vollausschlag) */
const STICK_RADIUS = 56;

export interface TouchState {
  /** Stick x: Lenken/Gieren, −1 links … +1 rechts */
  x: number;
  /** Stick y: Gas/Pitch, +1 = oben (Gas), −1 = unten (Rückwärts) */
  y: number;
  jump: boolean;
  boost: boolean;
  handbrake: boolean;
}

/**
 * Virtuelle Touch-Bedienung: schwebender Stick links, große Knöpfe rechts, kleine Knöpfe oben.
 * Mehrere Finger gleichzeitig (Pointer Events mit Pointer-Capture, je Element eigene Zeiger-ID).
 */
export class TouchControls {
  private root: HTMLElement | null = null;
  private readonly cleanup: Array<() => void> = [];
  private readonly state: TouchState = { x: 0, y: 0, jump: false, boost: false, handbrake: false };
  private readonly events = { ballCam: false, pause: false };
  private readonly held = new Map<string, Set<number>>();
  private stickId = -1;
  private resetStick: () => void = () => undefined;
  private prevPosition: string | null = null;
  private prevTouchAction: string | null = null;
  /** Alle Zeiger, die gerade wirklich auf dem Bildschirm sind (Sicherheitsnetz gegen verlorene pointerup-Ereignisse) */
  private readonly active = new Set<number>();

  /** Soll die Oberfläche sichtbar sein? 'on' immer, 'auto' nur bei grobem Zeiger (Touch). */
  static shouldShow(layout: TouchLayout): boolean {
    if (layout === 'on') return true;
    if (layout === 'off') return false;
    try {
      return (
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(pointer: coarse)').matches
      );
    } catch {
      return false;
    }
  }

  constructor(
    private readonly area: HTMLElement,
    layout: TouchLayout = 'auto',
  ) {
    if (typeof document === 'undefined' || !TouchControls.shouldShow(layout)) return;
    this.build();
  }

  get visible(): boolean {
    return this.root !== null;
  }

  private build(): void {
    const area = this.area;
    // Der Container muss positioniert sein, damit die Oberfläche ihn ausfüllt
    try {
      if (getComputedStyle(area).position === 'static') {
        this.prevPosition = area.style.position;
        area.style.position = 'relative';
      }
    } catch {
      /* ohne Stilabfrage weiter */
    }
    this.prevTouchAction = area.style.touchAction;
    area.style.touchAction = 'none';

    const root = document.createElement('div');
    root.className = 'tk-touch';
    root.innerHTML =
      '<div class="tk-stick-zone"><div class="tk-stick-base"><div class="tk-stick-knob"></div></div></div>' +
      '<div class="tk-top">' +
      '<button type="button" class="tk-mini" data-act="ballcam" aria-label="Ballkamera">BALL</button>' +
      '<button type="button" class="tk-mini" data-act="pause" aria-label="Pause">II</button>' +
      '</div>' +
      '<div class="tk-btns">' +
      '<button type="button" class="tk-btn tk-drift" data-hold="handbrake">DRIFT</button>' +
      '<button type="button" class="tk-btn tk-boost" data-hold="boost">BOOST</button>' +
      '<button type="button" class="tk-btn tk-jump" data-hold="jump">SPRUNG</button>' +
      '</div>';
    area.appendChild(root);
    this.root = root;

    const block = (e: Event): void => e.preventDefault();
    root.addEventListener('contextmenu', block);
    root.addEventListener('selectstart', block);
    this.cleanup.push(() => {
      root.removeEventListener('contextmenu', block);
      root.removeEventListener('selectstart', block);
    });

    this.buildStick(root);
    this.watchWindow();

    // Haltetasten (Sprung, Boost, Drift): gedrückt, solange mindestens ein Finger drauf ist
    root.querySelectorAll<HTMLButtonElement>('[data-hold]').forEach((btn) => {
      const key = btn.dataset.hold as 'jump' | 'boost' | 'handbrake';
      const ids = new Set<number>();
      this.held.set(key, ids);
      const sync = (): void => {
        this.state[key] = ids.size > 0;
        btn.classList.toggle('on', ids.size > 0);
      };
      const down = (e: PointerEvent): void => {
        e.preventDefault();
        ids.add(e.pointerId);
        try {
          btn.setPointerCapture(e.pointerId);
        } catch {
          /* Capture nicht möglich: Loslassen kommt über pointerup/cancel */
        }
        sync();
      };
      const end = (e: PointerEvent): void => {
        ids.delete(e.pointerId);
        sync();
      };
      this.listen(btn, 'pointerdown', down);
      this.listen(btn, 'pointerup', end);
      this.listen(btn, 'pointercancel', end);
      this.listen(btn, 'lostpointercapture', end);
    });

    // Einmal-Knöpfe (Ballkamera, Pause)
    root.querySelectorAll<HTMLButtonElement>('[data-act]').forEach((btn) => {
      const act = btn.dataset.act === 'pause' ? 'pause' : 'ballCam';
      this.listen(btn, 'pointerdown', (e: PointerEvent) => {
        e.preventDefault();
        this.events[act] = true;
        btn.classList.add('on');
      });
      const end = (): void => btn.classList.remove('on');
      this.listen(btn, 'pointerup', end);
      this.listen(btn, 'pointercancel', end);
    });
  }

  private buildStick(root: HTMLElement): void {
    const zone = root.querySelector<HTMLElement>('.tk-stick-zone');
    const base = root.querySelector<HTMLElement>('.tk-stick-base');
    const knob = root.querySelector<HTMLElement>('.tk-stick-knob');
    if (!zone || !base || !knob) return;
    let ox = 0;
    let oy = 0;
    const update = (e: PointerEvent): void => {
      let dx = (e.clientX - ox) / STICK_RADIUS;
      let dy = (e.clientY - oy) / STICK_RADIUS;
      const len = Math.hypot(dx, dy);
      if (len > 1) {
        dx /= len;
        dy /= len;
      }
      this.state.x = shapeAxis(dx, 0.1, 0.2);
      this.state.y = shapeAxis(-dy, 0.1, 0.2);
      knob.style.transform = `translate(${dx * STICK_RADIUS}px, ${dy * STICK_RADIUS}px)`;
    };
    const release = (): void => {
      this.stickId = -1;
      this.state.x = 0;
      this.state.y = 0;
      knob.style.transform = '';
      base.style.left = '';
      base.style.top = '';
      base.classList.remove('active');
    };
    this.resetStick = release;
    this.listen(zone, 'pointerdown', (e: PointerEvent) => {
      // Ein neuer Daumen übernimmt den Stick immer (ein verlorenes Loslassen darf ihn nie blockieren)
      e.preventDefault();
      this.stickId = e.pointerId;
      const r = zone.getBoundingClientRect();
      ox = e.clientX;
      oy = e.clientY;
      base.style.left = `${ox - r.left}px`;
      base.style.top = `${oy - r.top}px`;
      base.classList.add('active');
      try {
        zone.setPointerCapture(e.pointerId);
      } catch {
        /* siehe oben */
      }
      update(e);
    });
    this.listen(zone, 'pointermove', (e: PointerEvent) => {
      if (e.pointerId === this.stickId) update(e);
    });
    const end = (e: PointerEvent): void => {
      if (e.pointerId === this.stickId) release();
    };
    this.listen(zone, 'pointerup', end);
    this.listen(zone, 'pointercancel', end);
    this.listen(zone, 'lostpointercapture', end);
  }

  /**
   * Sicherheitsnetz: Geht ein Loslassen am Element verloren (System-Geste, Benachrichtigung, Browser-Eigenheit),
   * bliebe der Stick sonst „hängen" und das Auto würde von allein lenken/fahren. Deshalb werden alle Zeiger zusätzlich
   * am Fenster verfolgt: Ist ein Zeiger weg, wird alles losgelassen, was von ihm abhing.
   */
  private watchWindow(): void {
    const w = window;
    const down = (e: PointerEvent): void => void this.active.add(e.pointerId);
    const up = (e: PointerEvent): void => {
      this.active.delete(e.pointerId);
      this.releaseLost();
    };
    const touchEnd = (e: TouchEvent): void => {
      if (e.touches.length === 0) {
        this.active.clear();
        this.reset();
      }
    };
    w.addEventListener('pointerdown', down, true);
    w.addEventListener('pointerup', up, true);
    w.addEventListener('pointercancel', up, true);
    w.addEventListener('touchend', touchEnd, true);
    w.addEventListener('touchcancel', touchEnd, true);
    w.addEventListener('pagehide', () => this.reset());
    this.cleanup.push(() => {
      w.removeEventListener('pointerdown', down, true);
      w.removeEventListener('pointerup', up, true);
      w.removeEventListener('pointercancel', up, true);
      w.removeEventListener('touchend', touchEnd, true);
      w.removeEventListener('touchcancel', touchEnd, true);
    });
  }

  /** Lässt alles los, was von einem nicht mehr vorhandenen Zeiger gehalten wird */
  private releaseLost(): void {
    if (this.stickId !== -1 && !this.active.has(this.stickId)) this.resetStick();
    for (const [key, ids] of this.held) {
      for (const id of [...ids]) if (!this.active.has(id)) ids.delete(id);
      this.state[key as 'jump' | 'boost' | 'handbrake'] = ids.size > 0;
      if (ids.size === 0)
        this.root?.querySelectorAll(`[data-hold="${key}"]`).forEach((el) => el.classList.remove('on'));
    }
  }

  /** Aktuell gezählte Zeiger (für die Diagnose) */
  get pointerCount(): number {
    return this.active.size;
  }

  private listen<K extends keyof HTMLElementEventMap>(
    el: HTMLElement,
    type: K,
    fn: (e: HTMLElementEventMap[K]) => void,
  ): void {
    el.addEventListener(type, fn as EventListener);
    this.cleanup.push(() => el.removeEventListener(type, fn as EventListener));
  }

  /** Aktueller Zustand (Kopie) */
  read(): TouchState {
    if (this.stickId !== -1 || this.held.size) this.releaseLost();
    return { ...this.state };
  }

  /** Einmal-Ereignisse seit dem letzten Aufruf */
  consume(): { ballCam: boolean; pause: boolean } {
    const out = { ...this.events };
    this.events.ballCam = false;
    this.events.pause = false;
    return out;
  }

  /** Alles loslassen (Fokusverlust) */
  reset(): void {
    this.resetStick();
    this.stickId = -1;
    this.state.x = this.state.y = 0;
    for (const [key, ids] of this.held) {
      ids.clear();
      this.state[key as 'jump' | 'boost' | 'handbrake'] = false;
    }
    this.root?.querySelectorAll('.on').forEach((el) => el.classList.remove('on'));
    this.events.ballCam = this.events.pause = false;
  }

  dispose(): void {
    this.cleanup.forEach((f) => f());
    this.cleanup.length = 0;
    this.root?.remove();
    if (this.root) {
      this.area.style.touchAction = this.prevTouchAction ?? '';
      if (this.prevPosition !== null) this.area.style.position = this.prevPosition;
    }
    this.root = null;
  }
}
