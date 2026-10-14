/* Minispiel-Gerüst: Fenster mit Canvas (feste logische Größe 800×450, skaliert), Spielschleife, Eingabe (Touch, Maus, Tastatur, Gamepad),
   Anleitung mit Bildern, Ergebnis mit Belohnung. Die 3D-Welt pausiert solange. */
import type { Game } from '../game.ts';
import type { AudioEngine } from '../audio/music.ts';
import { btn, h, uiRoot } from '../ui/dom.ts';

export const W = 800, H = 450;
export interface MgInput { tap: boolean; held: boolean; left: boolean; right: boolean; up: boolean; down: boolean; px: number; py: number; pdown: boolean; ptap: boolean; key: string | null }
export interface MgResult { score: number; win: boolean; text?: string }
export interface MgOpts { level?: number; title?: string; target?: number; [k: string]: unknown }

export abstract class Minigame {
  abstract readonly title: string;
  abstract readonly icon: string;
  abstract readonly howto: string[];
  abstract readonly controls: string;
  score = 0;
  time = 0;
  done: MgResult | null = null;
  constructor(protected g: Game, protected audio: AudioEngine, protected o: MgOpts) { }
  abstract init(): void;
  abstract step(dt: number, i: MgInput): void;
  abstract draw(c: CanvasRenderingContext2D): void;
  finish(win: boolean, text?: string): void { if (!this.done) { this.done = { score: Math.round(this.score), win, text }; this.audio.sfx(win ? 'success' : 'fail'); } }
  sfx(n: string, v = 1): void { this.audio.sfx(n, v); }
  /** Zusätzliche Bedienelemente unter dem Canvas (optional). */
  buttons(): { label: string; key: string }[] { return []; }
  /** Eigene DOM-Oberfläche statt Canvas (z. B. Kartenspiel). */
  dom(): HTMLElement | null { return null; }
}

/* Zeichenhelfer */
export const rr = (c: CanvasRenderingContext2D, x: number, y: number, w: number, h2: number, r: number) => { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h2, r); c.arcTo(x + w, y + h2, x, y + h2, r); c.arcTo(x, y + h2, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); };
export const txt = (c: CanvasRenderingContext2D, s: string, x: number, y: number, size = 24, col = '#fff', align: CanvasTextAlign = 'center') => {
  c.font = 'bold ' + size + 'px Fredoka, sans-serif'; c.textAlign = align; c.textBaseline = 'middle';
  c.lineWidth = Math.max(3, size / 6); c.strokeStyle = 'rgba(42,31,74,.75)'; c.strokeText(s, x, y); c.fillStyle = col; c.fillText(s, x, y);
};
export const emoji = (c: CanvasRenderingContext2D, e: string, x: number, y: number, size: number) => { c.font = size + 'px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(e, x, y); };
export const sky = (c: CanvasRenderingContext2D, top: string, bottom: string) => { const gr = c.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, top); gr.addColorStop(1, bottom); c.fillStyle = gr; c.fillRect(0, 0, W, H); };

export interface RunOpts { onEnd(r: MgResult): void }

/** Startet ein Minispiel im Fenster. */
export function runMinigame(g: Game, game: Minigame, onEnd: (r: MgResult) => void): void {
  g.busy++;
  (window as unknown as { __mg?: Minigame }).__mg = game;   // für automatische Tests
  const prevPaused = g.paused;
  g.paused = true;
  const cv = h('canvas', { width: W, height: H }) as HTMLCanvasElement;
  const c = cv.getContext('2d')!;
  const scoreEl = h('span', { class: 'chip' }, '⭐ 0');
  const ctl = h('div', { class: 'ctl' });
  const domUi = game.dom();
  const box = h('div', { class: 'box panel' }, h('div', { class: 'hdr' }, h('h2', null, game.icon + ' ' + game.title), scoreEl, h('button', { class: 'x', type: 'button', style: 'width:44px;height:44px;border-radius:50%;background:#ffe3df;color:#b3261e;font-weight:700', 'aria-label': 'Beenden', onclick: () => end(true) }, '✕')),
    domUi ?? cv, ctl);
  const wrap = h('div', { class: 'mg' }, box);
  uiRoot().append(wrap);
  const inp: MgInput = { tap: false, held: false, left: false, right: false, up: false, down: false, px: 0, py: 0, pdown: false, ptap: false, key: null };
  const keys = new Set<string>();
  const kd = (e: KeyboardEvent) => { keys.add(e.code); inp.key = e.code; if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault(); if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE') inp.tap = true; if (e.code === 'Escape') end(true); };
  const ku = (e: KeyboardEvent) => keys.delete(e.code);
  window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);
  const toLocal = (e: PointerEvent) => { const r = cv.getBoundingClientRect(); inp.px = (e.clientX - r.left) / r.width * W; inp.py = (e.clientY - r.top) / r.height * H; };
  cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); toLocal(e); inp.pdown = true; inp.ptap = true; inp.tap = true; });
  cv.addEventListener('pointermove', e => toLocal(e));
  cv.addEventListener('pointerup', () => { inp.pdown = false; });
  cv.addEventListener('pointercancel', () => { inp.pdown = false; });
  for (const b of game.buttons()) {
    const el = btn(b.label, () => {}, 'ghost');
    el.addEventListener('pointerdown', e => { e.preventDefault(); keys.add(b.key); inp.key = b.key; if (b.key === 'Space') inp.tap = true; });
    const up = () => keys.delete(b.key);
    el.addEventListener('pointerup', up); el.addEventListener('pointerleave', up); el.addEventListener('pointercancel', up);
    ctl.append(el);
  }
  // Anleitung
  let state: 'howto' | 'play' | 'result' = 'howto';
  const howto = h('div', { style: 'position:absolute;inset:0;display:grid;place-items:center;background:rgba(255,250,240,.95);border-radius:16px;padding:16px;text-align:center' },
    h('div', null, h('div', { style: 'font-size:3rem' }, game.icon), h('h2', null, game.title), ...game.howto.map(t => h('p', { style: 'font-size:1.1rem;margin:.4em 0' }, t)), h('p', { class: 'muted' }, game.controls), btn('▶ Los geht’s!', () => { howto.remove(); state = 'play'; game.init(); }, 'green')));
  const holder = (domUi ?? cv).parentElement!;
  holder.style.position = 'relative';
  const overlay = h('div', { style: 'position:relative' });
  holder.insertBefore(overlay, domUi ?? cv); overlay.append(domUi ?? cv, howto);
  let last = performance.now(), raf = 0;
  const loop = () => {
    raf = requestAnimationFrame(loop);
    const now = performance.now(); const dt = Math.min(0.05, (now - last) / 1000); last = now;
    g.input.poll();
    inp.left = keys.has('ArrowLeft') || keys.has('KeyA') || g.input.moveX < -0.5;
    inp.right = keys.has('ArrowRight') || keys.has('KeyD') || g.input.moveX > 0.5;
    inp.up = keys.has('ArrowUp') || keys.has('KeyW') || g.input.moveY > 0.5;
    inp.down = keys.has('ArrowDown') || keys.has('KeyS') || g.input.moveY < -0.5;
    inp.held = keys.has('Space') || inp.pdown || g.input.isHeld('jump') || g.input.isHeld('action');
    if (g.input.pressed('jump') || g.input.pressed('action')) inp.tap = true;
    if (state === 'howto' && inp.tap && !domUi) { howto.remove(); state = 'play'; game.init(); inp.tap = false; }
    if (state === 'play') {
      game.time += dt;
      game.step(dt, inp);
      if (!domUi) { c.save(); game.draw(c); c.restore(); }
      scoreEl.textContent = '⭐ ' + Math.round(game.score);
      if (game.done) { state = 'result'; showResult(game.done); }
    } else if (state === 'howto' && !domUi) { c.fillStyle = '#102040'; c.fillRect(0, 0, W, H); }
    inp.tap = false; inp.ptap = false; inp.key = null;
    g.input.endFrame();
  };
  raf = requestAnimationFrame(loop);
  const showResult = (r: MgResult) => {
    const res = h('div', { style: 'position:absolute;inset:0;display:grid;place-items:center;background:rgba(255,250,240,.95);border-radius:16px;padding:16px;text-align:center' },
      h('div', null, h('div', { style: 'font-size:3.4rem' }, r.win ? '🏆' : '💪'), h('h2', null, r.win ? 'Geschafft!' : 'Fast!'), h('p', { style: 'font-size:1.2rem' }, 'Punkte: ' + r.score), r.text ? h('p', null, r.text) : null,
        h('div', { class: 'row', style: 'justify-content:center' }, btn('↻ Nochmal', () => { res.remove(); game.score = 0; game.time = 0; game.done = null; state = 'play'; game.init(); }, 'ghost'), btn('✔ Fertig', () => end(false), 'green'))));
    overlay.append(res);
  };
  let ended = false;
  const end = (abort: boolean) => {
    if (ended) return; ended = true;
    cancelAnimationFrame(raf);
    window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku);
    wrap.remove();
    g.paused = prevPaused;
    g.busy = Math.max(0, g.busy - 1);
    g.input.releaseAll();
    onEnd(abort && !game.done ? { score: 0, win: false } : game.done ?? { score: Math.round(game.score), win: false });
  };
}
