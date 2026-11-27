/* Oberflächen-Bausteine: Menü (Konsolen-Stil), Ladebildschirm, Dialog, Tastenhilfe, Toasts.
   Alle Bausteine werden über dieselben Aktionen bedient (Input), Maus/Touch klicken direkt. */
import type { Input, InputMode } from '../engine/Input';
import { sfx } from '../engine/Audio';

export const $ = <T extends HTMLElement = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector(s) as T;
export const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
export function el(html: string): HTMLElement {
  const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild as HTMLElement;
}
export const ui = () => $('#ui');

/* ---------- Tastenhilfe ---------- */
let mode: InputMode = 'kb';
const GLYPH: Record<string, Record<InputMode, string>> = {
  a: { pad: '<i class="g a">A</i>', kb: '<i class="g">Enter</i>', touch: '' },
  b: { pad: '<i class="g b">B</i>', kb: '<i class="g">Esc</i>', touch: '' },
  x: { pad: '<i class="g x">X</i>', kb: '<i class="g">P</i>', touch: '' },
  y: { pad: '<i class="g y">Y</i>', kb: '<i class="g">Esc</i>', touch: '' },
  dpad: { pad: '<i class="g">✚</i>', kb: '<i class="g">↑↓</i>', touch: '' },
  lr: { pad: '<i class="g">◀ ▶</i>', kb: '<i class="g">←→</i>', touch: '' },
  move: { pad: '<i class="g">L</i>', kb: '<i class="g">WASD</i>', touch: '' },
  atk: { pad: '<i class="g">LT</i>', kb: '<i class="g">F</i>', touch: '' },
  wpn: { pad: '<i class="g">L3</i>', kb: '<i class="g">G</i>', touch: '' },
  cam: { pad: '<i class="g">R</i>', kb: '<i class="g">Maus</i>', touch: '' },
  rise: { pad: '<i class="g">RB</i>', kb: '<i class="g">R</i>', touch: '' },
  sink: { pad: '<i class="g">LB</i>', kb: '<i class="g">Q</i>', touch: '' },
  turbo: { pad: '<i class="g">RT</i>', kb: '<i class="g">Shift</i>', touch: '' },
};
let hintSpec: Array<[string, string]> = [];
export function glyph(k: string) { return GLYPH[k]?.[mode] ?? ''; }
export function hints(spec: Array<[string, string]>) {
  hintSpec = spec;
  let h = $('#hints');
  if (!h) { h = el('<div id="hints"></div>'); document.body.appendChild(h); }
  h.innerHTML = spec.filter(([k]) => glyph(k)).map(([k, t]) => `<span>${glyph(k)} ${esc(t)}</span>`).join('');
}
export function bindInputMode(input: Input) {
  input.onMode((m) => { mode = m; hints(hintSpec); document.documentElement.dataset.input = m; });
}

/* ---------- Toasts ---------- */
export function toast(text: string, ms = 2600) {
  let box = $('#hud .toast');
  if (!box) { box = el('<div class="toast"></div>'); (document.getElementById('hud') || document.body).appendChild(box); }
  const d = el(`<div>${esc(text)}</div>`); box.appendChild(d);
  setTimeout(() => d.remove(), ms);
}

/* ---------- Menü ---------- */
export interface Item {
  icon?: string; label: string; sub?: string;
  /** Auswahlwert (dann ←/→ blättert) */
  value?: () => string; left?: () => void; right?: () => void;
  fn?: () => void; disabled?: boolean; big?: boolean;
}

export class Menu {
  index = 0;
  el: HTMLElement;
  onBack: (() => void) | null = null;
  onMove: ((i: number) => void) | null = null;
  constructor(public items: Item[], cls = '') {
    this.el = el(`<div class="menu ${cls}" role="menu"></div>`);
    this.render();
  }
  setItems(items: Item[], keep = true) { this.items = items; if (!keep) this.index = 0; this.index = Math.min(this.index, items.length - 1); this.render(); }
  render() {
    this.el.innerHTML = this.items.map((it, i) =>
      `<button class="mi${i === this.index ? ' sel' : ''}${it.disabled ? ' dis' : ''}${it.big ? ' big' : ''}" data-i="${i}" role="menuitem">` +
      (it.icon ? `<span class="ic">${it.icon}</span>` : '') +
      `<span><b>${esc(it.label)}</b>${it.sub ? `<small>${esc(it.sub)}</small>` : ''}</span>` +
      (it.value ? `<span class="val">${esc(it.value())}</span>` : '') + '</button>').join('');
    this.el.querySelectorAll<HTMLButtonElement>('.mi').forEach((b) => {
      const i = +b.dataset.i!;
      b.onpointerenter = (e) => { if (e.pointerType === 'mouse' && this.index !== i) this.select(i); };
      b.onclick = (e) => {
        this.select(i, false);
        const it = this.items[i];
        if (it.value && it.right) {
          const r = b.getBoundingClientRect();
          if (e.clientX && e.clientX < r.left + r.width * .45 && it.left) { it.left(); } else it.right();
          sfx('move'); this.render(); return;
        }
        this.activate();
      };
    });
  }
  select(i: number, sound = true) {
    this.index = (i + this.items.length) % this.items.length;
    this.el.querySelectorAll('.mi').forEach((b, j) => b.classList.toggle('sel', j === this.index));
    (this.el.querySelectorAll('.mi')[this.index] as HTMLElement | undefined)?.scrollIntoView?.({ block: 'nearest' });
    if (sound) sfx('move');
    this.onMove?.(this.index);
  }
  activate() {
    const it = this.items[this.index];
    if (!it || it.disabled) { sfx('miss'); return; }
    if (it.value && it.right && !it.fn) { it.right(); sfx('move'); this.render(); return; }
    sfx('ok'); it.fn?.();
  }
  /** Pro Bild mit der Eingabe aufrufen */
  handle(input: Input) {
    if (input.typing) return;
    if (input.pressed('down')) this.select(this.index + 1);
    else if (input.pressed('up')) this.select(this.index - 1);
    const it = this.items[this.index];
    if (it?.value) {
      if (input.pressed('left') && it.left) { it.left(); sfx('move'); this.render(); }
      else if (input.pressed('right') && it.right) { it.right(); sfx('move'); this.render(); }
    }
    if (input.pressed('confirm')) { input.consume('confirm'); this.activate(); }
    else if (input.pressed('back') && this.onBack) { input.consume('back'); input.consume('menu'); sfx('back'); this.onBack(); }
  }
}

/* ---------- Ladebildschirm ---------- */
const TIPS = [
  'Pride City spielst du mit Controller, Touch oder Tastatur – alles mit denselben wenigen Tasten.',
  'Dein Ruf in der Szene öffnet neue Viertel, Jobs und Kapitel.',
  'Entscheidungen merkt sich die Stadt. Wer dir einmal geholfen hat, kommt wieder.',
  'Im Club Prisma wartet das Tanz-Battle. Triff die Pfeile im Takt!',
  'Alle Figuren sind erwachsen und frei erfunden. Zustimmung zählt, ein Nein wird respektiert.',
  'Dein Spielstand liegt auf diesem Gerät und lässt sich mit deinem Google-Konto sichern.',
  'Halte Sprinten (Shift, RT oder den Turbo-Knopf), um schneller durch die Stadt zu kommen.',
];
export class Loading {
  el: HTMLElement;
  private tipT = 0;
  constructor() {
    this.el = el(`<div id="loading" class="off"><div class="art">${['#e40303', '#ff8c00', '#ffed00', '#008026', '#004dff', '#750787'].map((c, i) =>
      `<i style="top:${18 + i * 7}vh;background:${c};animation-delay:-${i * .7}s"></i>`).join('')}</div><img class="key" src="cover.jpg" alt="Pride City – Ein Leben in allen Farben" decoding="async"><div class="ring"></div>
      <div class="cap"><div class="kick"></div><h2></h2><div class="tip"></div><div class="bar"><b></b></div><div class="pct"><span class="st">Lädt …</span><span class="n">0 %</span></div></div></div>`);
    document.body.appendChild(this.el);
  }
  show(kick: string, title: string) {
    $('.kick', this.el).textContent = kick; $('h2', this.el).textContent = title;
    this.progress(0); this.el.style.display = 'flex';
    void this.el.offsetWidth; this.el.classList.remove('off');
    let i = Math.floor(Math.random() * TIPS.length);
    const tip = $('.tip', this.el); tip.textContent = TIPS[i];
    clearInterval(this.tipT); this.tipT = window.setInterval(() => { tip.textContent = TIPS[++i % TIPS.length]; }, 3800);
  }
  progress(p: number, st?: string) {
    $<HTMLElement>('.bar b', this.el).style.width = Math.round(p * 100) + '%';
    $('.n', this.el).textContent = Math.round(p * 100) + ' %';
    if (st) $('.st', this.el).textContent = st;
  }
  hide() {
    clearInterval(this.tipT); this.el.classList.add('off');
    setTimeout(() => { if (this.el.classList.contains('off')) this.el.style.display = 'none'; }, 500);
  }
}

/* ---------- Dialog mit Schreibmaschinen-Text und Antworten ---------- */
export interface Line { who: string; color?: string; pron?: string; text: string | (() => string); choices?: Array<{ label: string; sub?: string; fn?: () => void }> }

export class Dialog {
  private el: HTMLElement | null = null;
  private queue: Line[] = [];
  private shown = 0;
  private full = '';
  private menu: Menu | null = null;
  private done: (() => void) | null = null;
  get open() { return !!this.el; }

  say(lines: Line[], done?: () => void) {
    this.queue = lines.slice(); this.done = done || null;
    if (!this.el) { this.el = el('<div id="dialog"><div class="box panel"><div class="who"></div><div class="txt"></div><div class="more">▼</div></div></div>'); ui().appendChild(this.el); this.el.onclick = () => this.advance(); }
    this.next();
  }
  private next() {
    const l = this.queue.shift();
    if (!l) { this.close(); return; }
    const w = $('.who', this.el!);
    w.innerHTML = esc(l.who) + (l.pron ? `<small>${esc(l.pron)}</small>` : ''); w.style.background = l.color || 'var(--hi)';
    this.full = typeof l.text === 'function' ? l.text() : l.text; this.shown = 0; $('.txt', this.el!).textContent = '';
    this.menu?.el.remove(); this.menu = null;
    if (l.choices) {
      this.menu = new Menu(l.choices.map((c) => ({ label: c.label, sub: c.sub, fn: () => { c.fn?.(); this.next(); } })));
      this.menu.el.style.display = 'none';
      $('.box', this.el!).appendChild(this.menu.el);
      this.menu.el.onclick = (e) => e.stopPropagation();
    }
    $('.more', this.el!).style.display = 'none';
    sfx('open');
  }
  private advance() {
    if (!this.el) return;
    if (this.shown < this.full.length) { this.shown = this.full.length; return; }
    if (this.menu) return;
    sfx('move'); this.next();
  }
  close() {
    this.el?.remove(); this.el = null; this.menu = null;
    const d = this.done; this.done = null; d?.();
  }
  update(dt: number, input: Input) {
    if (!this.el) return;
    if (this.shown < this.full.length) {
      this.shown = Math.min(this.full.length, this.shown + dt * 55);
      $('.txt', this.el).textContent = this.full.slice(0, Math.floor(this.shown));
      if (this.shown >= this.full.length) {
        if (this.menu) this.menu.el.style.display = '';
        else $('.more', this.el).style.display = '';
      }
      if (input.pressed('confirm')) { input.consume('confirm'); this.shown = this.full.length - .01; }
      return;
    }
    if (this.menu) { this.menu.handle(input); return; }
    if (input.pressed('confirm') || input.pressed('back')) { input.consume('confirm'); input.consume('back'); input.consume('menu'); this.advance(); }
  }
}

/** Großer Kapitel-Bildschirm (Start/Ende eines Kapitels) */
export function chapterCard(kick: string, title: string, text: string, ms = Math.max(3200, text.length * 40)): Promise<void> {
  return new Promise((res) => {
    const c = el(`<div id="chapterCard"><div><div class="k">${esc(kick)}</div><h1>${esc(title)}</h1><div class="stripe"></div><p>${esc(text)}</p></div></div>`);
    document.body.appendChild(c); sfx('win');
    const end = () => { c.remove(); res(); };
    c.onclick = end; setTimeout(end, ms);
  });
}
