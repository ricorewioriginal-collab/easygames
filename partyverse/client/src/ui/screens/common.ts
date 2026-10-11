import { btn, h } from '../dom';
import type { App, RouteParams } from '../../app/app';
import './screens.css';

/** Kopfzeile mit Titel und Zurück-Schaltfläche (Standard: Hauptmenü) */
export function header(app: App, params: RouteParams | undefined, title: string): HTMLElement {
  return h(
    'div',
    { class: 'head' },
    btn('← Zurück', () => void app.go(params?.back ?? 'menu'), 'ghost back'),
    h('h2', null, title),
  );
}

export function section(title: string, ...children: Array<Node | string | null>): HTMLElement {
  return h('div', null, h('h3', { class: 'sec' }, title), ...children);
}

export const fmtInt = (n: number): string => Math.round(n).toLocaleString('de-DE');

export function fmtTime(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  if (hh > 0) return `${hh} Std. ${mm} Min.`;
  if (mm > 0) return `${mm} Min. ${s % 60} Sek.`;
  return `${s} Sek.`;
}
