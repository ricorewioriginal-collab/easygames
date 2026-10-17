// Kleine DOM-Helfer für die Oberfläche (ohne Framework, ressourcensparend).
type Child = Node | string | number | null | undefined | false | Child[];
type Attrs = Record<string, unknown> & { class?: string; style?: string | Partial<CSSStyleDeclaration> };

export function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Attrs | null = null, ...children: Child[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (attrs)
    for (const [k, v] of Object.entries(attrs)) {
      if (v === undefined || v === null || v === false) continue;
      if (k === 'class') el.className = String(v);
      else if (k === 'style') {
        if (typeof v === 'string') el.setAttribute('style', v);
        else Object.assign(el.style, v);
      } else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v as EventListener);
      else if (k === 'html') el.innerHTML = String(v);
      else if (v === true) el.setAttribute(k, '');
      else el.setAttribute(k, String(v));
    }
  append(el, children);
  return el;
}
export function append(el: Node, children: Child[]): void {
  for (const c of children) {
    if (c === null || c === undefined || c === false) continue;
    if (Array.isArray(c)) append(el, c);
    else el.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
  }
}
export const $ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document): T | null => root.querySelector<T>(sel);
export function clear(el: HTMLElement): HTMLElement {
  while (el.firstChild) el.removeChild(el.firstChild);
  return el;
}

export function btn(label: Child, onClick: () => void, cls = '', attrs: Attrs = {}): HTMLButtonElement {
  return h('button', { class: `btn ${cls}`, type: 'button', onclick: (e: Event) => { e.stopPropagation(); onClick(); }, ...attrs }, label);
}

// ---------- Dialoge ----------
let modalRoot: HTMLElement | null = null;
const stack: { el: HTMLElement; close: () => void; locked: boolean }[] = [];
function root(): HTMLElement {
  if (!modalRoot) {
    modalRoot = h('div', { id: 'modals' });
    document.body.appendChild(modalRoot);
  }
  return modalRoot;
}
export interface ModalOpts {
  title?: string;
  icon?: string;
  body: Child;
  buttons?: { label: string; onClick?: () => void | boolean; cls?: string; keep?: boolean }[];
  onClose?: () => void;
  wide?: boolean;
  /** kann nicht per Hintergrund/Escape geschlossen werden */
  locked?: boolean;
  cls?: string;
}
export function modal(o: ModalOpts): { el: HTMLElement; close: () => void } {
  const r = root();
  const card = h('div', { class: `modal ${o.wide ? 'wide' : ''} ${o.cls ?? ''}`, role: 'dialog', 'aria-modal': 'true', 'aria-label': o.title ?? 'Dialog' });
  const back = h('div', { class: 'modal-back' }, card);
  let closed = false;
  const close = (): void => {
    if (closed) return;
    closed = true;
    back.remove();
    const i = stack.findIndex((x) => x.el === back);
    if (i >= 0) stack.splice(i, 1);
    o.onClose?.();
  };
  if (o.title) card.appendChild(h('div', { class: 'modal-title' }, o.icon ? h('span', { class: 'ico' }, o.icon) : null, h('h2', null, o.title), o.locked ? null : h('button', { class: 'x', 'aria-label': 'Schließen', onclick: close }, '✕')));
  card.appendChild(h('div', { class: 'modal-body' }, o.body));
  if (o.buttons?.length)
    card.appendChild(
      h(
        'div',
        { class: 'modal-btns' },
        o.buttons.map((b) =>
          btn(b.label, () => {
            const r2 = b.onClick?.();
            if (r2 !== false && !b.keep) close();
          }, b.cls ?? ''),
        ),
      ),
    );
  back.addEventListener('pointerdown', (e) => {
    if (e.target === back && !o.locked) close();
  });
  r.appendChild(back);
  stack.push({ el: back, close, locked: !!o.locked });
  // Fokus auf den ersten Knopf (Tastatur/Controller)
  requestAnimationFrame(() => (card.querySelector<HTMLElement>('.modal-btns .btn, .modal-body .btn, input, select') ?? card.querySelector<HTMLElement>('.x'))?.focus());
  return { el: card, close };
}
export function closeTopModal(): boolean {
  const top = stack[stack.length - 1];
  if (!top || top.locked) return false;
  top.close();
  return true;
}
export const modalOpen = (): boolean => stack.length > 0;

export function confirmDlg(title: string, text: string, yes: string, onYes: () => void, no = 'Abbrechen'): void {
  modal({ title, body: h('p', null, text), buttons: [{ label: no, cls: 'ghost' }, { label: yes, cls: 'primary', onClick: onYes }] });
}
export function promptDlg(title: string, label: string, value: string, onOk: (v: string) => void, max = 24): void {
  const inp = h('input', { type: 'text', value, maxlength: max, 'aria-label': label });
  modal({ title, body: h('label', { class: 'field' }, h('span', null, label), inp), buttons: [{ label: 'Abbrechen', cls: 'ghost' }, { label: 'OK', cls: 'primary', onClick: () => onOk(inp.value.trim()) }] });
  inp.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      onOk(inp.value.trim());
      closeTopModal();
    }
  });
}

// ---------- Hinweise ----------
let toastBox: HTMLElement | null = null;
export function toast(text: string, icon = 'ℹ️', kind: 'info' | 'good' | 'bad' | 'warn' = 'info', ms = 4200, onClick?: () => void): void {
  if (!toastBox) {
    toastBox = h('div', { id: 'toasts', 'aria-live': 'polite' });
    document.body.appendChild(toastBox);
  }
  const t = h('div', { class: `toast ${kind}`, onclick: () => { onClick?.(); t.remove(); } }, h('span', { class: 'ico' }, icon), h('span', null, text));
  toastBox.appendChild(t);
  while (toastBox.children.length > 4) toastBox.firstElementChild?.remove();
  setTimeout(() => t.classList.add('out'), ms);
  setTimeout(() => t.remove(), ms + 400);
}

/** Fortschrittsbalken */
export function bar(v: number, cls = ''): HTMLElement {
  const p = Math.max(0, Math.min(100, v));
  return h('div', { class: `pbar ${cls} ${p < 20 ? 'crit' : p < 40 ? 'low' : ''}` }, h('i', { style: `width:${p}%` }));
}

export function tabs(items: { id: string; label: string; render: () => Node }[], active: string, onChange?: (id: string) => void): HTMLElement {
  const body = h('div', { class: 'tab-body' });
  const head = h('div', { class: 'tabs', role: 'tablist' });
  const show = (id: string): void => {
    for (const b of head.children) b.classList.toggle('on', (b as HTMLElement).dataset.id === id);
    clear(body).appendChild(items.find((x) => x.id === id)?.render() ?? h('div'));
    onChange?.(id);
  };
  for (const it of items) head.appendChild(h('button', { class: 'tab', role: 'tab', 'data-id': it.id, onclick: () => show(it.id) }, it.label));
  const wrap = h('div', { class: 'tabwrap' }, head, body);
  show(items.some((x) => x.id === active) ? active : items[0]!.id);
  return wrap;
}

export function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}
