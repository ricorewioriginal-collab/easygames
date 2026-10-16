// UI core: DOM helper, screen stack with spatial focus navigation (keyboard,
// gamepad and touch share the same focus model), dialog boxes with
// typewriter text, toasts, prompts, banners and fades.
import { TYPES } from '../data/types.js';

export function h(tag, attrs = {}, ...kids) {
  let [t, ...cls] = tag.split('.');
  let id = null;
  if (t.includes('#')) [t, id] = t.split('#');
  const el = document.createElement(t || 'div');
  if (id) el.id = id;
  if (cls.length) el.className = cls.join(' ');
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') el.className += ' ' + v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'text') el.textContent = v;
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat(Infinity)) { if (kid === null || kid === undefined || kid === false) continue; el.append(kid.nodeType ? kid : document.createTextNode(String(kid))); }
  return el;
}
export const $ = (sel, root = document) => root.querySelector(sel);
export function typeBadge(t) { const d = TYPES[t]; return d ? h('span.type', { style: { background: d.color } }, d.icon + ' ' + d.name) : null; }
export function hpBar(hp, max, cls = '') { const p = Math.max(0, Math.min(100, hp / max * 100)); return h('div.bar' + (cls ? '.' + cls : '') + (p < 22 ? '.low' : p < 50 ? '.mid' : ''), {}, h('i', { style: { width: p + '%' } })); }

// --------------------------------------------------------------------------
// Focus navigation
// --------------------------------------------------------------------------
export class FocusNav {
  constructor(root) { this.root = root; this.current = null; }
  items() { return [...this.root.querySelectorAll('.focusable')].filter(e => !e.disabled && !e.classList.contains('disabled') && e.offsetParent !== null); }
  focus(el) {
    if (!el) return;
    if (this.current) this.current.classList.remove('focus');
    this.current = el; el.classList.add('focus');
    el.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
  }
  ensure() { const items = this.items(); if (!this.current || !items.includes(this.current)) this.focus(items.find(e => e.dataset.autofocus !== undefined) || items[0]); }
  move(dir) {
    const items = this.items();
    if (!items.length) return false;
    if (!this.current || !items.includes(this.current)) { this.focus(items[0]); return true; }
    const a = this.current.getBoundingClientRect(), ax = a.left + a.width / 2, ay = a.top + a.height / 2;
    let best = null, bestScore = Infinity;
    for (const el of items) {
      if (el === this.current) continue;
      const b = el.getBoundingClientRect(), bx = b.left + b.width / 2, by = b.top + b.height / 2;
      const dx = bx - ax, dy = by - ay;
      const ok = dir === 'up' ? dy < -4 : dir === 'down' ? dy > 4 : dir === 'left' ? dx < -4 : dx > 4;
      if (!ok) continue;
      const main = dir === 'up' || dir === 'down' ? Math.abs(dy) : Math.abs(dx);
      const cross = dir === 'up' || dir === 'down' ? Math.abs(dx) : Math.abs(dy);
      const score = main + cross * 2.2;
      if (score < bestScore) { bestScore = score; best = el; }
    }
    if (best) { this.focus(best); return true; }
    // wrap vertically in lists
    if (dir === 'down' || dir === 'up') { const i = items.indexOf(this.current); this.focus(items[(i + (dir === 'down' ? 1 : -1) + items.length) % items.length]); return true; }
    return false;
  }
  activate() { if (this.current) { this.current.click(); return true; } return false; }
}

// --------------------------------------------------------------------------
// UI manager
// --------------------------------------------------------------------------
export class UI {
  constructor(root, { audio, input, settings }) {
    this.root = root; this.audio = audio; this.input = input; this.settings = settings;
    this.stack = [];
    this.toastBox = h('div.toasts'); root.append(this.toastBox);
    this.fadeEl = h('div#fade'); root.append(this.fadeEl);
    this.dialogEl = null;
    document.addEventListener('pointerdown', (e) => {
      const f = e.target.closest?.('.focusable');
      if (f && this.top?.nav && this.top.el.contains(f)) this.top.nav.focus(f);
    }, true);
  }
  get top() { return this.stack[this.stack.length - 1] || null; }
  get blocking() { return this.stack.length > 0; }
  // A screen: { el, nav?, onBack?, onInput?(input) → handled?, onClose? }
  push(screen) {
    screen.nav ||= new FocusNav(screen.el);
    this.root.append(screen.el);
    this.stack.push(screen);
    requestAnimationFrame(() => screen.nav.ensure());
    return screen;
  }
  pop(screen = this.top) {
    const i = this.stack.indexOf(screen);
    if (i < 0) return;
    this.stack.splice(i, 1);
    screen.el.remove();
    screen.onClose && screen.onClose();
    if (this.top) requestAnimationFrame(() => this.top?.nav?.ensure());
  }
  replace(screen) { if (this.top) this.pop(); return this.push(screen); }
  clear() { while (this.stack.length) this.pop(); }
  // Called each frame by the game when UI has focus.
  handleInput(input) {
    const s = this.top;
    if (!s) return false;
    if (s.onInput && s.onInput(input)) return true;
    const d = input.nav();
    if (d) { if (s.nav.move(d)) this.audio.sfx('move'); else if (s.onSide) s.onSide(d); }
    if (input.pressed('confirm')) { if (s.nav.activate()) this.audio.sfx('confirm'); }
    if (input.pressed('back')) { if (s.onBack) { this.audio.sfx('back'); s.onBack(); } }
    if (input.pressed('menu') && s.onMenu) s.onMenu();
    if (input.pressed('tabPrev') && s.onTab) { s.onTab(-1); this.audio.sfx('move'); }
    if (input.pressed('tabNext') && s.onTab) { s.onTab(1); this.audio.sfx('move'); }
    return true;
  }
  toast(text, icon = '') {
    const t = h('div.toast', {}, icon ? icon + ' ' : '', text);
    this.toastBox.append(t);
    setTimeout(() => t.remove(), 3300);
  }
  fade(on, white = false) {
    return new Promise(res => {
      this.fadeEl.classList.toggle('white', white);
      this.fadeEl.classList.toggle('on', on);
      setTimeout(res, 380);
    });
  }
  hint(action) {
    const dev = this.input.lastDevice;
    if (dev === 'gamepad') return this.input.padLabel(action);
    if (dev === 'touch') return { confirm: 'Tippen', back: '✕', menu: '☰', team: 'Team', tabPrev: '◀', tabNext: '▶' }[action] || '';
    return this.input.keyLabel(action).split(' / ')[0];
  }
  hintsBar(list) {
    return h('div.panel-foot', {}, list.map(([a, label]) => h('span.hint', {}, h('span.key', {}, this.hint(a)), label)));
  }

  // ----------------------------------------------------------------- dialog
  // lines: [{ who, text, mood }], options: { choices: [label], onLine(line) }
  say(lines, { choices = null, onLine = null, guild = false, cancelIndex = null } = {}) {
    if (!Array.isArray(lines)) lines = [lines];
    lines = lines.map(l => typeof l === 'string' ? { text: l } : l);
    return new Promise(resolve => {
      const box = h('div.dlg'), nameEl = h('div.name' + (guild ? '.guild' : '')), textEl = h('div'), next = h('div.next', {}, '▼');
      box.append(nameEl, textEl, next);
      const el = h('div#dialog', {}, box);
      let i = 0, shown = 0, full = '', timer = null, choiceEl = null;
      const speed = [0, 12, 24, 60][this.settings.get('textSpeed') ?? 2] || 24;
      const screen = { el, nav: new FocusNav(el), dialog: true };
      const showLine = () => {
        const L = lines[i];
        nameEl.textContent = L.who || ''; nameEl.style.display = L.who ? '' : 'none';
        nameEl.className = 'name' + (/Gilde|Varga|Selma|Kett|Kora|Brix/.test(L.who || '') && guild !== false ? ' guild' : '');
        full = L.text; shown = 0; textEl.textContent = ''; next.style.visibility = 'hidden';
        onLine && onLine(L, i);
        clearInterval(timer);
        timer = setInterval(() => {
          shown = Math.min(full.length, shown + Math.max(1, Math.round(speed / 30)));
          textEl.textContent = full.slice(0, shown);
          if (shown % 3 === 0) this.audio.sfx('text');
          if (shown >= full.length) { clearInterval(timer); lineDone(); }
        }, 1000 / Math.max(10, speed));
      };
      const lineDone = () => {
        textEl.textContent = full;
        const last = i === lines.length - 1;
        if (last && choices) {
          if (choiceEl) return;
          choiceEl = h('div.choices', {}, choices.map((c, ci) => h('button.choice.focusable', { onclick: () => finish(ci) }, c)));
          el.append(choiceEl);
          screen.nav.ensure();
        } else next.style.visibility = 'visible';
      };
      const advance = () => {
        if (shown < full.length) { clearInterval(timer); shown = full.length; lineDone(); return; }
        if (choiceEl) return;
        if (i < lines.length - 1) { i++; showLine(); } else finish(0);
      };
      const finish = (ci) => { clearInterval(timer); this.pop(screen); onLine && onLine(null); resolve(ci); };
      screen.onInput = (input) => {
        if (choiceEl) {
          const d = input.nav(); if (d) { screen.nav.move(d); this.audio.sfx('move'); }
          if (input.pressed('confirm')) { this.audio.sfx('confirm'); screen.nav.activate(); }
          if (input.pressed('back') && cancelIndex !== null) { this.audio.sfx('back'); finish(cancelIndex); }
          return true;
        }
        if (input.pressed('confirm') || input.pressed('back')) advance();
        input.nav();
        return true;
      };
      box.addEventListener('click', advance);
      this.push(screen);
      showLine();
    });
  }
  async ask(lines, choices, opts = {}) { return this.say(lines, { ...opts, choices }); }
}
