// Winzige DOM-Helfer statt UI-Framework: schlank, schnell, ohne Abhängigkeiten.

type Child = Node | string | number | null | undefined | false;
type Attrs = Record<string, string | number | boolean | ((e: Event) => void) | undefined>;

export function h(tag: string, attrs: Attrs = {}, ...children: (Child | Child[])[]): HTMLElement {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v as EventListener);
    else if (k === 'class') el.className = String(v);
    else if (k === 'html') el.innerHTML = String(v);
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of children.flat()) if (c !== null && c !== undefined && c !== false) el.append(typeof c === 'number' ? String(c) : c);
  return el;
}

export function fmtTime(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}:${String(s % 60).padStart(2, '0')} Min`;
  const hh = Math.floor(m / 60);
  if (hh < 48) return `${hh} Std ${String(m % 60).padStart(2, '0')} Min`;
  return `${Math.floor(hh / 24)} Tage`;
}
export function fmtDur(sec: number): string {
  if (sec < 60) return `${Math.round(sec)} s`;
  if (sec < 3600) return `${Math.round(sec / 60)} Min`;
  const hh = sec / 3600;
  return `${Number.isInteger(hh) ? hh : hh.toFixed(1).replace('.', ',')} Std`;
}
export const num = (n: number): string => Math.round(n).toLocaleString('de-DE');
