// Interaktionsmenü an der Klickposition (gruppierte Liste, per Touch, Maus, Tastatur und Controller bedienbar).
import { menuFor, targetName, type MenuItem, type Target } from '../sim/menu';
import type { AppApi } from './api';
import { h } from './dom';

let cur: HTMLElement | null = null;
let onCloseCb: (() => void) | null = null;

export function closePie(): boolean {
  if (!cur) return false;
  cur.remove();
  cur = null;
  onCloseCb?.();
  onCloseCb = null;
  return true;
}
export const pieOpen = (): boolean => !!cur;

export function openPie(app: AppApi, tg: Target, x: number, y: number, onClose?: () => void): void {
  closePie();
  const g = app.g;
  const s = g.active;
  if (!s) return;
  let items: MenuItem[] = menuFor(g, s, tg);
  if (tg.kind === 'ground' && !items.length) return;
  const el = h('div', { class: 'pie', role: 'menu', 'aria-label': `Aktionen: ${targetName(g, tg)}` });
  el.appendChild(h('h3', null, h('span', null, targetName(g, tg)), h('button', { class: 'btn small ghost', 'aria-label': 'Schließen', onclick: () => closePie() }, '✕')));
  if (!items.length) el.appendChild(h('p', { class: 'muted', style: 'margin:6px' }, 'Hier gibt es gerade nichts zu tun.'));
  // Gruppen in fester Reihenfolge der ersten Nennung
  const groups: string[] = [];
  for (const it of items) if (!groups.includes(it.group)) groups.push(it.group);
  items = groups.flatMap((gr) => items.filter((i) => i.group === gr));
  let lastGroup = '';
  for (const it of items) {
    if (it.group !== lastGroup && groups.length > 1) {
      el.appendChild(h('div', { class: 'grp' }, it.group || 'Allgemein'));
      lastGroup = it.group;
    }
    const b = h('button', { class: `it ${it.avail === true ? '' : 'dis'}`, role: 'menuitem', title: it.avail === true ? it.label : it.avail }, h('span', { class: 'ico' }, it.icon), h('span', null, it.label, it.avail !== true ? h('small', null, it.avail) : null));
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      if (it.avail !== true) return;
      app.command(s.id, tg, it);
      app.sfx('click');
      closePie();
    });
    el.appendChild(b);
  }
  document.getElementById('ui')!.appendChild(el);
  // Position: im Bild halten
  const r = el.getBoundingClientRect();
  const W = window.innerWidth,
    H = window.innerHeight;
  el.style.left = `${Math.max(6, Math.min(W - r.width - 6, x + 12))}px`;
  el.style.top = `${Math.max(6, Math.min(H - r.height - 6, y - 20))}px`;
  cur = el;
  onCloseCb = onClose ?? null;
  requestAnimationFrame(() => el.querySelector<HTMLElement>('.it:not(.dis)')?.focus());
}
