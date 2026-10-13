// Eingaben aus Tastatur/Maus, Touch und Gamepad werden hier zusammengeführt.
import { settings, type KeyAction } from '../core/settings';

export type UiAction = 'map' | 'inventory' | 'pause' | 'emote' | 'marker' | 'scoreboard';

export interface InputState {
  mx: number;
  mz: number;
  fire: boolean;
  aim: boolean;
  jump: boolean;
  crouch: boolean;
  sprint: boolean;
  interact: boolean;
  dive: boolean;
}

export type OneShot =
  | { k: 'slot'; n: number }
  | { k: 'slotNext'; d: number }
  | { k: 'build' }
  | { k: 'piece'; n: number }
  | { k: 'reload' }
  | { k: 'interact' }
  | { k: 'buildMat' }
  | { k: 'drop' }
  | { k: 'ui'; a: UiAction }
  | { k: 'emote'; n: number };

export class Input {
  readonly state: InputState = { mx: 0, mz: 0, fire: false, aim: false, jump: false, crouch: false, sprint: false, interact: false, dive: false };
  /** Blickänderung seit dem letzten Abholen (Radiant) */
  lookX = 0;
  lookY = 0;
  readonly shots: OneShot[] = [];
  private keys = new Set<string>();
  private mouse = new Set<number>();
  /** Touch- und Gamepad-Beiträge */
  touch = { mx: 0, mz: 0, fire: false, aim: false, jump: false, crouch: false, sprint: false, interact: false, dive: false };
  pad = { mx: 0, mz: 0, fire: false, aim: false, jump: false, crouch: false, sprint: false, interact: false, dive: false };
  enabled = true;
  /** Kurz angetippte Tasten (Springen/Ducken) bis zum nächsten Simulationsschritt merken */
  latchJump = false;
  latchCrouch = false;
  pointerLocked = false;
  crouchToggle = false;
  aimingZoom = 1;
  lastDevice: 'kb' | 'touch' | 'pad' = 'kb';
  private canvas: HTMLElement | null = null;
  onPointerLockChange: ((locked: boolean) => void) | null = null;

  attach(canvas: HTMLElement): void {
    this.canvas = canvas;
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
    canvas.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('mousemove', this.onMouseMove);
    canvas.addEventListener('wheel', this.onWheel, { passive: false });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('pointerlockchange', this.onLockChange);
  }

  detach(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
    this.canvas?.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('pointerlockchange', this.onLockChange);
    if (document.pointerLockElement) document.exitPointerLock();
  }

  requestLock(): void {
    if (this.canvas && !this.pointerLocked && !('ontouchstart' in window && navigator.maxTouchPoints > 0 && this.lastDevice === 'touch')) {
      try {
        const r = (this.canvas as HTMLElement & { requestPointerLock: (o?: unknown) => Promise<void> | void }).requestPointerLock({ unadjustedMovement: true });
        if (r && typeof (r as Promise<void>).catch === 'function') (r as Promise<void>).catch(() => this.canvas!.requestPointerLock());
      } catch {
        this.canvas.requestPointerLock();
      }
    }
  }

  private onLockChange = (): void => {
    this.pointerLocked = document.pointerLockElement === this.canvas;
    if (!this.pointerLocked) this.mouse.clear();
    this.onPointerLockChange?.(this.pointerLocked);
  };

  private onBlur = (): void => {
    this.keys.clear();
    this.mouse.clear();
  };

  private is(a: KeyAction): boolean {
    const k = settings.data.keys[a];
    return !!k && (this.keys.has(k) || (k.startsWith('Mouse') && this.mouse.has(Number(k.slice(5)))));
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    this.lastDevice = 'kb';
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (e.code === 'Escape') {
      this.shots.push({ k: 'ui', a: 'pause' });
      return;
    }
    if (e.code === 'Tab' || e.code === 'Space' || e.code.startsWith('Arrow')) e.preventDefault();
    if (e.repeat) return;
    this.keys.add(e.code);
    if (e.code === settings.data.keys.jump) this.latchJump = true;
    if (e.code === settings.data.keys.crouch) this.latchCrouch = true;
    if (!this.enabled && e.code !== settings.data.keys.map && e.code !== settings.data.keys.inventory) return;
    const K = settings.data.keys;
    const map: [string, OneShot][] = [
      [K.slot1, { k: 'slot', n: 1 }],
      [K.slot2, { k: 'slot', n: 2 }],
      [K.slot3, { k: 'slot', n: 3 }],
      [K.slot4, { k: 'slot', n: 4 }],
      [K.slot5, { k: 'slot', n: 5 }],
      [K.pickaxe, { k: 'slot', n: 0 }],
      [K.build, { k: 'build' }],
      [K.wall, { k: 'piece', n: 0 }],
      [K.floor, { k: 'piece', n: 1 }],
      [K.ramp, { k: 'piece', n: 2 }],
      [K.reload, { k: 'reload' }],
      [K.interact, { k: 'interact' }],
      [K.buildMat, { k: 'buildMat' }],
      [K.drop, { k: 'drop' }],
      [K.map, { k: 'ui', a: 'map' }],
      [K.inventory, { k: 'ui', a: 'inventory' }],
      [K.emote, { k: 'ui', a: 'emote' }],
      [K.marker, { k: 'ui', a: 'marker' }],
    ];
    for (const [code, shot] of map) if (code && code === e.code) this.shots.push(shot);
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    this.keys.delete(e.code);
  };

  private onMouseDown = (e: MouseEvent): void => {
    this.lastDevice = 'kb';
    if (!this.pointerLocked) {
      this.requestLock();
      return;
    }
    this.mouse.add(e.button);
    if (e.button === 3) this.keys.add('Mouse3');
    if (e.button === 4) this.keys.add('Mouse4');
    if (e.button === 1) this.keys.add('Mouse1');
  };

  private onMouseUp = (e: MouseEvent): void => {
    this.mouse.delete(e.button);
    this.keys.delete('Mouse' + e.button);
  };

  private onMouseMove = (e: MouseEvent): void => {
    if (!this.pointerLocked || !this.enabled) return;
    const base = 0.0022 * settings.data.sensitivity;
    const s = this.state.aim ? base * settings.data.aimSensitivity * (1 / Math.max(1, this.aimingZoom * 0.6)) : base;
    this.lookX += e.movementX * s;
    this.lookY += e.movementY * s * (settings.data.invertY ? -1 : 1);
  };

  private onWheel = (e: WheelEvent): void => {
    e.preventDefault();
    if (!this.enabled) return;
    this.shots.push({ k: 'slotNext', d: e.deltaY > 0 ? 1 : -1 });
  };

  /** Zustand aus allen Quellen zusammenführen (jedes Bild). */
  poll(): void {
    const s = this.state;
    const kb = this.enabled;
    const t = this.touch,
      p = this.pad;
    let mx = 0,
      mz = 0;
    if (kb) {
      if (this.is('forward')) mz += 1;
      if (this.is('back')) mz -= 1;
      if (this.is('right')) mx += 1;
      if (this.is('left')) mx -= 1;
    }
    mx += t.mx + p.mx;
    mz += t.mz + p.mz;
    const l = Math.hypot(mx, mz);
    if (l > 1) {
      mx /= l;
      mz /= l;
    }
    s.mx = mx;
    s.mz = mz;
    const lockedMouse = kb && this.pointerLocked;
    s.fire = (lockedMouse && this.mouse.has(0)) || t.fire || p.fire;
    s.aim = (lockedMouse && this.mouse.has(2)) || t.aim || p.aim;
    s.jump = (kb && this.is('jump')) || t.jump || p.jump;
    const crouchKey = kb && this.is('crouch');
    s.crouch = crouchKey || t.crouch || p.crouch || this.crouchToggle;
    s.sprint = (kb && this.is('sprint')) || t.sprint || p.sprint;
    s.interact = (kb && this.is('interact')) || t.interact || p.interact;
    s.dive = s.crouch || t.dive || p.dive;
    if (!this.enabled) {
      s.fire = s.aim = s.jump = false;
      s.mx = s.mz = 0;
    }
  }

  /** Gemerkte Tastendrücke abholen (einmal pro Simulationsschritt) */
  takeLatches(): { jump: boolean; crouch: boolean } {
    const r = { jump: this.latchJump, crouch: this.latchCrouch };
    this.latchJump = this.latchCrouch = false;
    return r;
  }

  takeLook(): [number, number] {
    const r: [number, number] = [this.lookX, this.lookY];
    this.lookX = 0;
    this.lookY = 0;
    return r;
  }

  vibrate(ms: number): void {
    if (settings.data.vibration && 'vibrate' in navigator && this.lastDevice === 'touch') {
      try {
        navigator.vibrate(ms);
      } catch {
        /* nicht unterstützt */
      }
    }
  }
}
