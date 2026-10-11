/** Kleine DOM-Helfer (kein Framework). Texte immer per textContent setzen – nie unbereinigtes HTML einfügen. */
type Child = Node | string | number | null | undefined | false;
export interface Attrs {
  class?: string;
  id?: string;
  title?: string;
  type?: string;
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  min?: number;
  max?: number;
  step?: number;
  checked?: boolean;
  maxlength?: number;
  role?: string;
  tabindex?: number;
  'aria-label'?: string;
  'aria-pressed'?: string;
  'aria-live'?: string;
  'data-id'?: string;
  style?: string;
  onclick?: (e: MouseEvent) => void;
  oninput?: (e: Event) => void;
  onchange?: (e: Event) => void;
}

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Attrs | null = null,
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v === undefined || v === null || v === false) continue;
      if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v as EventListener);
      else if (k === 'class') el.className = String(v);
      else if (k === 'disabled' || k === 'checked') (el as unknown as Record<string, unknown>)[k] = v;
      else if (k === 'value') (el as HTMLInputElement).value = String(v);
      else el.setAttribute(k, String(v));
    }
  }
  for (const c of children)
    if (c !== null && c !== undefined && c !== false) el.append(typeof c === 'number' ? String(c) : c);
  return el;
}

export function btn(label: string, onClick: () => void, cls = '', attrs: Attrs = {}): HTMLButtonElement {
  return h(
    'button',
    { type: 'button', ...attrs, class: ('btn ' + cls).trim(), onclick: () => onClick() },
    label,
  );
}

export function clear(el: Element): void {
  while (el.firstChild) el.removeChild(el.firstChild);
}

/** Schieberegler mit Beschriftung und Wertanzeige */
export function slider(
  label: string,
  value: number,
  min: number,
  max: number,
  step: number,
  onInput: (v: number) => void,
  fmt: (v: number) => string = (v) => String(Math.round(v * 100)) + ' %',
): HTMLElement {
  const out = h('span', { class: 'val' }, fmt(value));
  const input = h('input', {
    type: 'range',
    min,
    max,
    step,
    value: String(value),
    'aria-label': label,
    oninput: () => {
      const v = Number(input.value);
      out.textContent = fmt(v);
      onInput(v);
    },
  });
  return h('label', { class: 'row' }, h('span', { class: 'lbl' }, label), input, out);
}

export function toggle(
  label: string,
  value: boolean,
  onChange: (v: boolean) => void,
  hint?: string,
): HTMLElement {
  const input = h('input', { type: 'checkbox', checked: value, onchange: () => onChange(input.checked) });
  return h(
    'label',
    { class: 'row toggle' },
    h('span', { class: 'lbl' }, label, hint ? h('small', null, hint) : null),
    input,
  );
}

export function select<T extends string>(
  label: string,
  value: T,
  options: Array<[T, string]>,
  onChange: (v: T) => void,
): HTMLElement {
  const sel = h(
    'select',
    { 'aria-label': label, onchange: () => onChange(sel.value as T) },
    ...options.map(([v, l]) => {
      const o = h('option', { value: v }, l);
      if (v === value) o.selected = true;
      return o;
    }),
  );
  return h('label', { class: 'row' }, h('span', { class: 'lbl' }, label), sel);
}

/** Zeigt kurz eine Meldung (Toast) unten in der Mitte */
export function toast(text: string, kind: 'info' | 'error' | 'good' = 'info', ms = 3200): void {
  let box = document.getElementById('toasts');
  if (!box) {
    box = h('div', { id: 'toasts', 'aria-live': 'polite', role: 'status' });
    document.body.appendChild(box);
  }
  const el = h('div', { class: 'toast ' + kind }, text);
  box.appendChild(el);
  while (box.children.length > 4) box.firstChild?.remove();
  setTimeout(() => el.remove(), ms);
}
