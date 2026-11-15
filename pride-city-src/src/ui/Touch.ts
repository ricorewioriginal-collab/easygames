/* Touch-Steuerung: Stick links, Aktion/Zurück/Turbo rechts. Kamera durch Wischen auf dem Bild. Hoch- und Querformat. */
import type { Input, Action } from '../engine/Input';
import { el } from './ui';

export class Touch {
  el: HTMLElement;
  private sprint = false;
  constructor(private input: Input) {
    this.el = el(`<div id="touch"><div class="stick"><i></i></div><div class="btns">
      <button class="bA" data-a="confirm">A<small>Aktion</small></button>
      <button class="bB" data-a="back">B<small>Zurück</small></button>
      <button class="bS" data-a="sprint">»<small>Turbo</small></button></div></div>`);
    document.body.appendChild(this.el);
    const stick = this.el.querySelector('.stick') as HTMLElement, knob = stick.querySelector('i') as HTMLElement;
    let id = -1, cx = 0, cy = 0;
    const R = 52;
    const set = (x: number, y: number) => {
      let dx = x - cx, dy = y - cy; const l = Math.hypot(dx, dy); if (l > R) { dx *= R / l; dy *= R / l; }
      knob.style.transform = `translate(${dx}px,${dy}px)`;
      input.setStick(dx / R, -dy / R);
    };
    stick.addEventListener('pointerdown', (e) => {
      e.preventDefault(); e.stopPropagation(); if (e.isTrusted) input.setMode('touch');
      id = e.pointerId; stick.setPointerCapture(id);
      const r = stick.getBoundingClientRect(); cx = r.left + r.width / 2; cy = r.top + r.height / 2; set(e.clientX, e.clientY);
    });
    stick.addEventListener('pointermove', (e) => { if (e.pointerId === id) set(e.clientX, e.clientY); });
    const up = (e: PointerEvent) => { if (e.pointerId !== id) return; id = -1; knob.style.transform = ''; input.setStick(0, 0); };
    stick.addEventListener('pointerup', up); stick.addEventListener('pointercancel', up);
    this.el.querySelectorAll<HTMLButtonElement>('.btns button').forEach((b) => {
      const a = b.dataset.a as Action;
      b.addEventListener('pointerdown', (e) => {
        e.preventDefault(); e.stopPropagation();
        if (a === 'sprint') { this.sprint = !this.sprint; b.classList.toggle('on', this.sprint); if (this.sprint) input.touchDown('sprint'); else input.touchUp('sprint'); return; }
        input.touchDown(a);
      });
      const rel = () => { if (a !== 'sprint') input.touchUp(a); };
      b.addEventListener('pointerup', rel); b.addEventListener('pointercancel', rel); b.addEventListener('pointerleave', rel);
    });
  }
  show(on: boolean) { this.el.classList.toggle('on', on); if (!on) this.input.setStick(0, 0); }
  label(a: string) { const b = this.el.querySelector('.bA small'); if (b) b.textContent = a; }
}
