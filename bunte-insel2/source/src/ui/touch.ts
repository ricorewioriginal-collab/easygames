/* Touch-Steuerung: schwebender Joystick links (erscheint unter dem Daumen), rechts wischen = Kamera,
   Knöpfe zeigen nur, was gerade geht. Mehrere Finger gleichzeitig. */
import type { Game } from '../game.ts';
import type { Btn } from '../input/input.ts';
import { h } from './dom.ts';

export class TouchControls {
  readonly el: HTMLElement;
  private stick = h('div', { class: 'stick hidden' }, h('i'));
  private knob: HTMLElement;
  private stickId: number | null = null;
  private stickOrigin = { x: 0, y: 0 };
  private lookId: number | null = null;
  private lookLast = { x: 0, y: 0 };
  private act: HTMLElement;
  private jump: HTMLElement;
  private alt: HTMLElement;
  private run: HTMLElement;
  private down: HTMLElement;
  private fight: HTMLElement;
  private running = false;
  visible = false;
  constructor(private g: Game) {
    this.knob = this.stick.firstElementChild as HTMLElement;
    const zone = h('div', { class: 'stick-zone' });
    const look = h('div', { class: 'look-zone' });
    zone.addEventListener('pointerdown', e => this.stickStart(e));
    look.addEventListener('pointerdown', e => { if (this.lookId === null) { this.lookId = e.pointerId; this.lookLast = { x: e.clientX, y: e.clientY }; look.setPointerCapture(e.pointerId); } });
    look.addEventListener('pointermove', e => { if (e.pointerId !== this.lookId) return; this.g.input.touchLook(e.clientX - this.lookLast.x, e.clientY - this.lookLast.y); this.lookLast = { x: e.clientX, y: e.clientY }; });
    const endLook = (e: PointerEvent) => { if (e.pointerId === this.lookId) this.lookId = null; };
    look.addEventListener('pointerup', endLook); look.addEventListener('pointercancel', endLook);
    zone.addEventListener('pointermove', e => this.stickMove(e));
    const endStick = (e: PointerEvent) => { if (e.pointerId !== this.stickId) return; this.stickId = null; this.stick.classList.add('hidden'); this.g.input.setTouchMove(0, 0, false); };
    zone.addEventListener('pointerup', endStick); zone.addEventListener('pointercancel', endStick);
    const mk = (cls: string, icon: string, b: Btn, label = '') => {
      const el = h('div', { class: 'tb ' + cls, role: 'button', 'aria-label': label || b }, h('span', null, icon), label ? h('small', null, label) : null);
      el.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); el.setPointerCapture(e.pointerId); el.classList.add('pressed'); this.g.input.pressTouch(b, true); });
      const up = (e: PointerEvent) => { e.preventDefault(); el.classList.remove('pressed'); this.g.input.pressTouch(b, false); };
      el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); el.addEventListener('lostpointercapture', () => { el.classList.remove('pressed'); this.g.input.pressTouch(b, false); });
      return el;
    };
    this.act = mk('act', '✋', 'action', 'Aktion');
    this.jump = mk('jump', '⤒', 'jump', 'Springen');
    this.alt = mk('alt', '✦', 'action2', '');
    this.down = mk('down', '⤓', 'down', '');
    this.run = h('div', { class: 'tb run', role: 'button', 'aria-label': 'Rennen' }, '🏃');
    this.run.addEventListener('pointerdown', e => { e.stopPropagation(); this.running = !this.running; this.run.classList.toggle('on', this.running); this.g.input.pressTouch('sprint', this.running); });
    this.fight = h('div', { class: 'fightpad hidden' }, mk('fight', '⚔️', 'attack', 'Schlag'), mk('fight', '🌀', 'dodge', 'Rolle'), mk('fight', '🛡️', 'block', 'Abwehr'), mk('fight', '🌟', 'special', 'Licht'));
    const pad = h('div', { class: 'tbtns' }, this.act, this.jump, this.alt, this.run, this.down);
    this.el = h('div', { class: 'touch hidden' }, zone, look, this.stick, pad, this.fight);
  }
  private stickStart(e: PointerEvent): void {
    if (this.stickId !== null) return;
    this.stickId = e.pointerId;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    this.stickOrigin = { x: e.clientX, y: e.clientY };
    this.stick.style.left = e.clientX + 'px'; this.stick.style.top = e.clientY + 'px';
    this.knob.style.transform = '';
    this.stick.classList.remove('hidden');
    this.g.input.setTouchMove(0, 0, true);
  }
  private stickMove(e: PointerEvent): void {
    if (e.pointerId !== this.stickId) return;
    const R = 56 * (this.g.settings.touchScale || 1);
    let dx = e.clientX - this.stickOrigin.x, dy = e.clientY - this.stickOrigin.y;
    const L = Math.hypot(dx, dy);
    if (L > R) { // Stick folgt dem Daumen, wenn er weit rausgeht
      const k = (L - R) / L; this.stickOrigin.x += dx * k; this.stickOrigin.y += dy * k;
      this.stick.style.left = this.stickOrigin.x + 'px'; this.stick.style.top = this.stickOrigin.y + 'px';
      dx -= dx * k; dy -= dy * k;
    }
    this.knob.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
    const nx = dx / R, ny = -dy / R, m = Math.hypot(nx, ny);
    const dz = 0.12, k2 = m < dz ? 0 : (m - dz) / (1 - dz) / (m || 1);
    this.g.input.setTouchMove(nx * k2, ny * k2, true);
  }
  update(): void {
    const g = this.g;
    const want = g.mobile || g.input.lastDevice === 'touch';
    if (want !== this.visible) { this.visible = want; this.el.classList.toggle('hidden', !want); }
    if (!want) return;
    const n = g.nearest;
    this.act.classList.toggle('off', !n);
    this.act.firstElementChild!.textContent = n ? n.icon : '✋';
    (this.act.lastElementChild as HTMLElement).textContent = n ? g.interact.labelOf(n).slice(0, 18) : 'Aktion';
    const inVeh = g.vehicleCheck();
    const alt = n?.alt && (!n.alt.when || n.alt.when());
    this.alt.classList.toggle('hidden', !alt && !inVeh);
    if (alt) this.alt.firstElementChild!.textContent = n!.alt!.icon; else if (inVeh) this.alt.firstElementChild!.textContent = '📯';
    this.down.classList.toggle('hidden', !(inVeh || g.hasAbility('kisprung')));
    this.down.firstElementChild!.textContent = inVeh ? '⤓' : '🌀';
    this.fight.classList.toggle('hidden', !g.currentZone?.combat || inVeh);
    this.jump.firstElementChild!.textContent = inVeh ? '⤒' : '⤒';
  }
}
