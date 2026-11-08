/**
 * Eingabe: Tastatur + Maus, Gamecontroller (analoge Sticks, eigene Belegung) und Touch (virtueller Stick, Kamera-Wischen, Knöpfe).
 * Liefert Bewegung, Kamera-Drehung und Tasten-Ereignisse (gedrückt in diesem Frame).
 */
export type Btn = 'jump' | 'act' | 'run' | 'phone' | 'pause' | 'back' | 'map' | 'up' | 'down' | 'left' | 'right' | 'ok' | 'tabL' | 'tabR';

export class Input {
  readonly move = { x: 0, y: 0 };
  readonly look = { x: 0, y: 0 };
  zoom = 0;
  runHeld = false;
  runToggle = false;
  private keys = new Set<string>();
  private pressed = new Set<Btn>();
  private padPrev: boolean[] = [];
  private padAxesPrev = { x: 0, y: 0 };
  private dragging = false;
  private lastX = 0;
  private lastY = 0;
  private stick = { id: -1, ox: 0, oy: 0, x: 0, y: 0 };
  private camTouch = { id: -1, x: 0, y: 0 };
  usingPad = false;
  touch = false;
  /** Gesperrt, solange ein Menü offen ist (Bewegung aus) */
  menu = false;

  constructor(canvas: HTMLCanvasElement, private stickEl: HTMLElement, private knobEl: HTMLElement) {
    addEventListener('keydown', (e) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      if (!this.keys.has(e.code)) this.keyBtn(e.code);
      this.keys.add(e.code);
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code)) e.preventDefault();
    });
    addEventListener('keyup', (e) => this.keys.delete(e.code));
    addEventListener('blur', () => this.keys.clear());
    canvas.addEventListener('mousedown', (e) => {
      this.dragging = true;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      if (e.button === 0 && !this.touch && document.pointerLockElement !== canvas && !this.menu) canvas.requestPointerLock?.()?.catch?.(() => {});
    });
    addEventListener('mouseup', () => (this.dragging = false));
    addEventListener('mousemove', (e) => {
      if (this.menu) return;
      if (document.pointerLockElement === canvas) {
        this.look.x += e.movementX;
        this.look.y += e.movementY;
      } else if (this.dragging) {
        this.look.x += e.clientX - this.lastX;
        this.look.y += e.clientY - this.lastY;
        this.lastX = e.clientX;
        this.lastY = e.clientY;
      }
    });
    canvas.addEventListener('wheel', (e) => (this.zoom += Math.sign(e.deltaY)), { passive: true });
    // Touch
    const area = canvas.parentElement || document.body;
    area.addEventListener('touchstart', (e) => this.onTouch(e, 'start'), { passive: false });
    area.addEventListener('touchmove', (e) => this.onTouch(e, 'move'), { passive: false });
    area.addEventListener('touchend', (e) => this.onTouch(e, 'end'));
    area.addEventListener('touchcancel', (e) => this.onTouch(e, 'end'));
  }

  private keyBtn(code: string) {
    const map: Record<string, Btn[]> = {
      Space: ['jump', 'ok'], KeyE: ['act'], KeyF: ['act'], Enter: ['act', 'ok'], Tab: ['phone'], KeyI: ['phone'], KeyM: ['map'], Escape: ['pause', 'back'], KeyP: ['pause'],
      ArrowUp: ['up'], ArrowDown: ['down'], ArrowLeft: ['left'], ArrowRight: ['right'], KeyQ: ['tabL'], KeyR: ['tabR'], Backspace: ['back'],
    };
    if (code === 'CapsLock') this.runToggle = !this.runToggle;
    map[code]?.forEach((b) => this.pressed.add(b));
    this.usingPad = false;
  }

  private onTouch(e: TouchEvent, kind: 'start' | 'move' | 'end') {
    if ((e.target as HTMLElement).closest('button,.ov,.panel,input,select,a,.phone,.dlg')) return;
    this.touch = true;
    document.body.classList.add('touch');
    for (const t of Array.from(e.changedTouches)) {
      if (kind === 'start') {
        if (t.clientX < innerWidth * 0.42 && this.stick.id < 0 && !this.menu) {
          this.stick = { id: t.identifier, ox: t.clientX, oy: t.clientY, x: 0, y: 0 };
          this.stickEl.style.left = t.clientX - 60 + 'px';
          this.stickEl.style.top = t.clientY - 60 + 'px';
          this.stickEl.classList.add('on');
        } else if (this.camTouch.id < 0) this.camTouch = { id: t.identifier, x: t.clientX, y: t.clientY };
      } else if (kind === 'move') {
        if (t.identifier === this.stick.id) {
          let dx = t.clientX - this.stick.ox,
            dy = t.clientY - this.stick.oy;
          const d = Math.hypot(dx, dy),
            m = 55;
          if (d > m) {
            dx = (dx / d) * m;
            dy = (dy / d) * m;
          }
          this.stick.x = dx / m;
          this.stick.y = dy / m;
          this.knobEl.style.transform = `translate(${dx}px,${dy}px)`;
        } else if (t.identifier === this.camTouch.id && !this.menu) {
          this.look.x += (t.clientX - this.camTouch.x) * 1.4;
          this.look.y += (t.clientY - this.camTouch.y) * 1.4;
          this.camTouch.x = t.clientX;
          this.camTouch.y = t.clientY;
        }
      } else {
        if (t.identifier === this.stick.id) {
          this.stick = { id: -1, ox: 0, oy: 0, x: 0, y: 0 };
          this.knobEl.style.transform = '';
          this.stickEl.classList.remove('on');
        }
        if (t.identifier === this.camTouch.id) this.camTouch.id = -1;
      }
    }
    if (kind !== 'end') e.preventDefault();
  }

  /** Für Touch-Knöpfe */
  press(b: Btn) {
    this.pressed.add(b);
  }

  /** Einmal pro Frame aufrufen */
  poll() {
    const k = this.keys;
    let mx = (k.has('KeyD') || k.has('ArrowRight') ? 1 : 0) - (k.has('KeyA') || k.has('ArrowLeft') ? 1 : 0);
    let my = (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0) - (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0);
    this.runHeld = k.has('ShiftLeft') || k.has('ShiftRight');
    if (this.stick.id >= 0) {
      mx = this.stick.x;
      my = this.stick.y;
      this.runHeld = Math.hypot(mx, my) > 0.92;
    }
    // Gamecontroller
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const gp of pads) {
      if (!gp || !gp.connected) continue;
      const dz = (v: number) => (Math.abs(v) < 0.18 ? 0 : (v - Math.sign(v) * 0.18) / 0.82);
      const ax = dz(gp.axes[0] || 0),
        ay = dz(gp.axes[1] || 0),
        rx = dz(gp.axes[2] || 0),
        ry = dz(gp.axes[3] || 0);
      const b = gp.buttons.map((x) => x.pressed || x.value > 0.5);
      if (ax || ay || rx || ry || b.some(Boolean)) {
        this.usingPad = true;
        this.touch = false;
      }
      if (ax || ay) {
        mx = ax;
        my = ay;
      }
      this.look.x += rx * 14;
      this.look.y += ry * 10;
      if (b[10] || b[7]) this.runHeld = true;
      const edge = (i: number, btn: Btn | Btn[]) => {
        if (b[i] && !this.padPrev[i]) (Array.isArray(btn) ? btn : [btn]).forEach((x) => this.pressed.add(x));
      };
      edge(0, ['act', 'ok']);
      edge(1, 'back');
      edge(2, 'jump');
      edge(3, 'phone');
      edge(9, 'pause');
      edge(8, 'map');
      edge(4, 'tabL');
      edge(5, 'tabR');
      edge(6, 'tabL');
      edge(12, 'up');
      edge(13, 'down');
      edge(14, 'left');
      edge(15, 'right');
      // Stick als Menü-Navigation (Flanke)
      const sx = ax > 0.6 ? 1 : ax < -0.6 ? -1 : 0,
        sy = ay > 0.6 ? 1 : ay < -0.6 ? -1 : 0;
      if (this.menu) {
        if (sx && sx !== this.padAxesPrev.x) this.pressed.add(sx > 0 ? 'right' : 'left');
        if (sy && sy !== this.padAxesPrev.y) this.pressed.add(sy > 0 ? 'down' : 'up');
      }
      this.padAxesPrev = { x: sx, y: sy };
      this.padPrev = b;
      break;
    }
    const l = Math.hypot(mx, my);
    if (l > 1) {
      mx /= l;
      my /= l;
    }
    this.move.x = this.menu ? 0 : mx;
    this.move.y = this.menu ? 0 : my;
  }
  /** Taste in diesem Frame gedrückt? (verbraucht sie) */
  take(b: Btn): boolean {
    const h = this.pressed.has(b);
    this.pressed.delete(b);
    return h;
  }
  peek(b: Btn) {
    return this.pressed.has(b);
  }
  endFrame() {
    this.pressed.clear();
    this.look.x = this.look.y = 0;
    this.zoom = 0;
  }
  get running() {
    return this.runHeld !== this.runToggle;
  }
}
