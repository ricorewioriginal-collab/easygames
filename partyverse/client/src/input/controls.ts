import { InputFrame, MiniGame, NEUTRAL_INPUT } from '@shared/minigames/types';

/**
 * Liest Tastatur, Zeiger und Touch-Bedienelemente für ein Minispiel.
 * - Tastatur: Pfeile/WASD, Leertaste/Enter = A, Shift/X/Z = B
 * - Zeiger: Position relativ zum Spielfeld-Element (px/py in [-1,1], py nach oben positiv)
 * - Touch: virtueller Stick (links), Knöpfe A/B (rechts), nur wenn das Spiel sie braucht
 */
export class MiniInput {
  private keys = new Set<string>();
  private pointer = { px: 0, py: 0, pd: false };
  private stick = { x: 0, y: 0 };
  private btn = { a: false, b: false };
  private cleanup: Array<() => void> = [];
  private ui: HTMLElement | null = null;

  constructor(
    private readonly area: HTMLElement,
    game: Pick<MiniGame, 'touch' | 'usesPointer'>,
    showTouch: boolean,
  ) {
    const on = <K extends keyof WindowEventMap>(t: Window, ev: K, fn: (e: WindowEventMap[K]) => void) => {
      t.addEventListener(ev, fn as EventListener);
      this.cleanup.push(() => t.removeEventListener(ev, fn as EventListener));
    };
    on(window, 'keydown', (e) => {
      if (e.repeat) return;
      this.keys.add(e.code);
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    });
    on(window, 'keyup', (e) => this.keys.delete(e.code));
    on(window, 'blur', () => (this.keys.clear(), (this.pointer.pd = false), (this.btn.a = this.btn.b = false)));
    const move = (e: PointerEvent) => {
      const r = this.area.getBoundingClientRect();
      this.pointer.px = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
      this.pointer.py = Math.max(-1, Math.min(1, 1 - ((e.clientY - r.top) / r.height) * 2));
    };
    const down = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('.mg-touch')) return;
      move(e);
      this.pointer.pd = true;
      if (game.touch.a && !game.usesPointer && !showTouch) this.btn.a = true;
    };
    const up = () => ((this.pointer.pd = false), !showTouch && (this.btn.a = false));
    area.addEventListener('pointerdown', down);
    area.addEventListener('pointermove', move);
    on(window, 'pointerup', up);
    on(window, 'pointercancel', up);
    this.cleanup.push(() => (area.removeEventListener('pointerdown', down), area.removeEventListener('pointermove', move)));
    if (showTouch) this.buildTouchUi(game);
  }

  private buildTouchUi(game: Pick<MiniGame, 'touch' | 'usesPointer'>): void {
    const ui = document.createElement('div');
    ui.className = 'mg-touch';
    ui.innerHTML =
      (game.touch.stick ? '<div class="mg-stick"><div class="mg-knob"></div></div>' : '') +
      '<div class="mg-btns">' +
      (game.touch.b ? '<button class="mg-btn b" data-b="b">B</button>' : '') +
      (game.touch.a ? '<button class="mg-btn a" data-b="a">A</button>' : '') +
      '</div>';
    this.area.appendChild(ui);
    this.ui = ui;
    const stick = ui.querySelector('.mg-stick') as HTMLElement | null;
    const knob = ui.querySelector('.mg-knob') as HTMLElement | null;
    if (stick && knob) {
      let id = -1;
      const upd = (e: PointerEvent) => {
        const r = stick.getBoundingClientRect();
        let dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        let dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        const len = Math.hypot(dx, dy);
        if (len > 1) {
          dx /= len;
          dy /= len;
        }
        this.stick.x = Math.abs(dx) < 0.12 ? 0 : dx;
        this.stick.y = Math.abs(dy) < 0.12 ? 0 : -dy;
        knob.style.transform = `translate(${dx * 38}px, ${dy * 38}px)`;
      };
      stick.addEventListener('pointerdown', (e) => ((id = e.pointerId), stick.setPointerCapture(id), upd(e), e.preventDefault()));
      stick.addEventListener('pointermove', (e) => e.pointerId === id && upd(e));
      const end = (e: PointerEvent) => {
        if (e.pointerId !== id) return;
        id = -1;
        this.stick.x = this.stick.y = 0;
        knob.style.transform = '';
      };
      stick.addEventListener('pointerup', end);
      stick.addEventListener('pointercancel', end);
    }
    ui.querySelectorAll<HTMLButtonElement>('.mg-btn').forEach((b) => {
      const k = b.dataset.b as 'a' | 'b';
      b.addEventListener('pointerdown', (e) => ((this.btn[k] = true), b.setPointerCapture(e.pointerId), b.classList.add('on'), e.preventDefault()));
      const end = () => ((this.btn[k] = false), b.classList.remove('on'));
      b.addEventListener('pointerup', end);
      b.addEventListener('pointercancel', end);
    });
  }

  read(): InputFrame {
    const k = this.keys;
    let x = (k.has('ArrowRight') || k.has('KeyD') ? 1 : 0) - (k.has('ArrowLeft') || k.has('KeyA') ? 1 : 0);
    let y = (k.has('ArrowUp') || k.has('KeyW') ? 1 : 0) - (k.has('ArrowDown') || k.has('KeyS') ? 1 : 0);
    if (x === 0) x = this.stick.x;
    if (y === 0) y = this.stick.y;
    return {
      ...NEUTRAL_INPUT,
      x,
      y,
      a: k.has('Space') || k.has('Enter') || this.btn.a,
      b: k.has('ShiftLeft') || k.has('ShiftRight') || k.has('KeyX') || k.has('KeyZ') || this.btn.b,
      px: this.pointer.px,
      py: this.pointer.py,
      pd: this.pointer.pd,
    };
  }

  dispose(): void {
    this.cleanup.forEach((f) => f());
    this.ui?.remove();
  }
}
