/* HUD in der Stadt: Kapitel-Ziel, Geld/Ruf/Uhrzeit, Aktions-Hinweis, Markierungen über Zielen. */
import * as THREE from 'three';
import { el, esc, glyph } from './ui';

const NEED_ICONS: Array<[string, string]> = [['energy', '⚡'], ['hunger', '🍝'], ['hygiene', '🚿'], ['social', '💬'], ['fun', '🎉']];

export interface Marker { id: string; icon: string; label?: string; pos: THREE.Vector3 }

export class Hud {
  el: HTMLElement;
  private goalEl: HTMLElement;
  private statsEl: HTMLElement;
  private promptEl: HTMLElement;
  private markersEl: HTMLElement;
  private markerEls = new Map<string, HTMLElement>();
  onPrompt: (() => void) | null = null;
  onMenu: (() => void) | null = null;
  onPhone: (() => void) | null = null;
  private needsEl!: HTMLElement;
  constructor() {
    this.el = el(`<div id="hud" class="hidden"><div class="lcol"><div class="goal"></div><div class="needs"></div></div><div class="stats"></div>
      <div class="menuBtn"><button data-k="phone" aria-label="Handy">📱</button><button data-k="menu" aria-label="Menü">☰</button></div>
      <div class="markers pass"></div><div class="prompt"></div><div class="toast"></div></div>`);
    document.body.appendChild(this.el);
    this.goalEl = this.el.querySelector('.goal')!; this.statsEl = this.el.querySelector('.stats')!;
    this.promptEl = this.el.querySelector('.prompt')!; this.markersEl = this.el.querySelector('.markers')!;
    this.promptEl.addEventListener('click', () => this.onPrompt?.());
    this.el.querySelector<HTMLButtonElement>('[data-k=menu]')!.onclick = () => this.onMenu?.();
    this.el.querySelector<HTMLButtonElement>('[data-k=phone]')!.onclick = () => this.onPhone?.();
    this.needsEl = this.el.querySelector('.needs')!;
    this.needsEl.innerHTML = NEED_ICONS.map(([k, i]) => `<span data-n="${k}" title="${k}">${i}<i><b></b></i></span>`).join('');
  }
  show(on: boolean) { this.el.classList.toggle('hidden', !on); }
  goal(ch: string, title: string, sub = '') {
    this.goalEl.innerHTML = `<div class="ch">${esc(ch)}</div><b>${esc(title)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}`;
  }
  stats(items: string[]) { this.statsEl.innerHTML = items.map((s) => `<span class="chip">${esc(s)}</span>`).join(''); }
  /** Kleine Balken für die Bedürfnisse (rot unter 25) */
  needs(n: Record<string, number>) {
    for (const e of this.needsEl.children as unknown as HTMLElement[]) {
      const v = Math.round(n[e.dataset.n!] ?? 0), b = e.querySelector('b') as HTMLElement;
      b.style.width = v + '%'; e.classList.toggle('low', v < 25);
    }
  }
  private lastPrompt = '';
  prompt(text: string | null) {
    const k = text || '';
    if (k === this.lastPrompt) return;
    this.lastPrompt = k;
    this.promptEl.classList.toggle('on', !!text);
    if (text) this.promptEl.innerHTML = (glyph('a') || '<i class="g a">A</i>') + ' ' + esc(text);
  }
  markers(list: Marker[], cam: THREE.Camera) {
    const seen = new Set<string>();
    const v = new THREE.Vector3(), w = innerWidth, h = innerHeight;
    for (const m of list) {
      seen.add(m.id);
      let e = this.markerEls.get(m.id);
      if (!e) { e = el('<div class="marker"></div>'); this.markersEl.appendChild(e); this.markerEls.set(m.id, e); }
      const html = m.icon + (m.label ? `<small>${esc(m.label)}</small>` : '');
      if (e.dataset.h !== html) { e.innerHTML = html; e.dataset.h = html; }
      v.copy(m.pos).project(cam);
      const behind = v.z > 1;
      let x = (v.x * .5 + .5) * w, y = (-v.y * .5 + .5) * h;
      // Ziele außerhalb des Bildes am Rand anzeigen
      if (behind) { x = w - x; y = h - 40; }
      x = Math.max(28, Math.min(w - 28, x)); y = Math.max(70, Math.min(h - 60, y));
      e.style.left = x + 'px'; e.style.top = y + 'px';
    }
    for (const [id, e] of this.markerEls) if (!seen.has(id)) { e.remove(); this.markerEls.delete(id); }
  }
}
