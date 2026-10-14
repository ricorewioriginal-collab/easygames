/* Kleine DOM-Helfer für die Oberfläche. */
type Attrs = Record<string, string | number | boolean | ((e: Event) => void) | undefined | null>;
type Child = Node | string | number | null | undefined | false | Child[];

export function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs?: Attrs | null, ...kids: Child[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v as EventListener);
    else if (k === 'class') el.className = String(v);
    else if (k === 'style') el.setAttribute('style', String(v));
    else if (k === 'html') el.innerHTML = String(v);
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, String(v));
  }
  const add = (c: Child) => {
    if (c === null || c === undefined || c === false) return;
    if (Array.isArray(c)) { c.forEach(add); return; }
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  };
  kids.forEach(add);
  return el;
}
export const $ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document): T | null => root.querySelector<T>(sel);
export const clear = (el: HTMLElement): void => { while (el.firstChild) el.removeChild(el.firstChild); };
export const uiRoot = (): HTMLElement => document.getElementById('ui')!;

/** Großer Knopf; Klick UND Touch zuverlässig (ohne Doppelauslösung). */
export function btn(label: Child, onClick: () => void, cls = '', attrs: Attrs = {}): HTMLButtonElement {
  return h('button', { class: 'btn ' + cls, type: 'button', ...attrs, onclick: (e: Event) => { e.stopPropagation(); onClick(); } }, label);
}

export interface ModalOpts { title: string; icon?: string; wide?: boolean; onClose?: () => void; tabs?: { id: string; label: string }[]; tab?: string; onTab?: (id: string) => void; footer?: HTMLElement[]; closable?: boolean }
export interface Modal { wrap: HTMLElement; body: HTMLElement; close(): void; setTab(id: string): void; footer: HTMLElement }
const openModals: Modal[] = [];
export function modal(o: ModalOpts): Modal {
  const body = h('div', { class: 'body' });
  const footer = h('footer', { class: o.footer?.length ? '' : 'hidden' }, o.footer ?? []);
  let tabsEl: HTMLElement | null = null;
  const m: Modal = {
    wrap: null as unknown as HTMLElement, body, footer,
    close: () => { m.wrap.remove(); const i = openModals.indexOf(m); if (i >= 0) openModals.splice(i, 1); o.onClose?.(); },
    setTab: id => { if (tabsEl) for (const t of tabsEl.querySelectorAll<HTMLElement>('.tab')) t.classList.toggle('on', t.dataset.id === id); o.onTab?.(id); }
  };
  if (o.tabs) tabsEl = h('div', { class: 'tabs', role: 'tablist' }, o.tabs.map(t => h('button', { class: 'tab', 'data-id': t.id, type: 'button', role: 'tab', onclick: () => m.setTab(t.id) }, t.label)));
  const box = h('div', { class: 'modal panel' + (o.wide ? ' wide' : ''), role: 'dialog', 'aria-label': o.title },
    h('header', null, h('h2', null, (o.icon ? o.icon + ' ' : '') + o.title), o.closable === false ? null : h('button', { class: 'x', type: 'button', 'aria-label': 'Schließen', onclick: () => m.close() }, '✕')),
    tabsEl, body, footer);
  m.wrap = h('div', { class: 'modal-wrap', onpointerdown: (e: Event) => { if (e.target === m.wrap && o.closable !== false) m.close(); } }, box);
  uiRoot().append(m.wrap);
  openModals.push(m);
  if (o.tabs) m.setTab(o.tab ?? o.tabs[0].id);
  return m;
}
export const topModal = (): Modal | null => openModals[openModals.length - 1] ?? null;
export const anyModal = (): boolean => openModals.length > 0;
export const closeAllModals = (): void => { for (const m of [...openModals]) m.close(); };

export function confirmBox(title: string, text: string, yes: string, onYes: () => void, danger = false): void {
  const m = modal({ title, icon: '❓' });
  m.body.append(h('p', { style: 'font-size:1.1rem' }, text));
  m.footer.classList.remove('hidden');
  m.footer.append(btn('Abbrechen', () => m.close(), 'ghost'), btn(yes, () => { m.close(); onYes(); }, danger ? 'danger' : 'green'));
}

export function seg<T extends string>(opts: { v: T; l: string }[], cur: T, on: (v: T) => void): HTMLElement {
  const el = h('div', { class: 'seg' });
  const draw = (v: T) => { clear(el); for (const o of opts) el.append(h('button', { type: 'button', class: o.v === v ? 'on' : '', onclick: () => { on(o.v); draw(o.v); } }, o.l)); };
  draw(cur);
  return el;
}
export function slider(min: number, max: number, step: number, val: number, on: (v: number) => void): HTMLInputElement {
  const el = h('input', { type: 'range', min, max, step, value: val });
  el.addEventListener('input', () => on(parseFloat(el.value)));
  return el;
}
