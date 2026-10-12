/** Kleine, typsichere DOM-Helfer statt eines UI-Frameworks. */
type Child = Node | string | number | null | undefined | false;
type Props = {
  class?: string;
  text?: string;
  html?: never;
  attrs?: Record<string, string | number | boolean>;
  style?: Partial<Record<string, string>>;
  dataset?: Record<string, string>;
  on?: Partial<{ [K in keyof HTMLElementEventMap]: (ev: HTMLElementEventMap[K]) => void }>;
};

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Props = {},
  children: Child[] = [],
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (props.class) el.className = props.class;
  if (props.text !== undefined) el.textContent = props.text;
  if (props.attrs) {
    for (const [k, v] of Object.entries(props.attrs)) {
      if (v === false) continue;
      el.setAttribute(k, v === true ? '' : String(v));
    }
  }
  if (props.style) {
    for (const [k, v] of Object.entries(props.style)) {
      if (v !== undefined) el.style.setProperty(k, v);
    }
  }
  if (props.dataset) Object.assign(el.dataset, props.dataset);
  if (props.on) {
    for (const [type, fn] of Object.entries(props.on)) {
      el.addEventListener(type, fn as EventListener);
    }
  }
  for (const c of children) {
    if (c === null || c === undefined || c === false) continue;
    el.append(typeof c === 'object' ? c : String(c));
  }
  return el;
}

export function clear(el: Element): void {
  while (el.firstChild) el.removeChild(el.firstChild);
}

export function qs<T extends Element = HTMLElement>(sel: string, root: ParentNode = document): T {
  const el = root.querySelector<T>(sel);
  if (!el) throw new Error(`Element nicht gefunden: ${sel}`);
  return el;
}

/** Button mit einheitlichem Stil; Aktion wird bei Klick ausgelöst. */
export function button(
  label: string,
  action: () => void,
  opts: { variant?: 'primary' | 'ghost' | 'danger'; testId?: string; disabled?: boolean } = {},
): HTMLButtonElement {
  return h('button', {
    class: `btn ${opts.variant ? `btn-${opts.variant}` : ''}`.trim(),
    text: label,
    attrs: {
      type: 'button',
      ...(opts.testId ? { 'data-testid': opts.testId } : {}),
      ...(opts.disabled ? { disabled: true } : {}),
    },
    on: { click: () => action() },
  });
}
