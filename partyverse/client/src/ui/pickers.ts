import { CHARACTERS, type CharacterId } from '@shared/characters';
import { LAYOUTS, layoutsOfWorld } from '@shared/levels';
import { WORLD_IDS, type Layout, type NodeKind, type WorldId } from '@shared/levels/types';
import { THEMES } from '../render/worlds/common';
import { h } from './dom';

const SVG = 'http://www.w3.org/2000/svg';
const KIND_COLOR: Record<NodeKind, string> = {
  start: '#ffd84a',
  glimmer: '#4fd6ff',
  thorn: '#ff5a7a',
  event: '#b77bff',
  item: '#6bdc7a',
  shop: '#ffa43a',
  portal: '#9a7bff',
  gate: '#d9b36a',
  chaos: '#ff7be0',
};

/** Kleine Draufsicht eines Layouts als SVG (aus den echten Daten, kein Bild nötig) */
export function minimap(layout: Layout, size = 120): SVGSVGElement {
  let minX = Infinity,
    maxX = -Infinity,
    minZ = Infinity,
    maxZ = -Infinity;
  for (const n of layout.nodes) {
    minX = Math.min(minX, n.pos[0]);
    maxX = Math.max(maxX, n.pos[0]);
    minZ = Math.min(minZ, n.pos[2]);
    maxZ = Math.max(maxZ, n.pos[2]);
  }
  const w = Math.max(1, maxX - minX),
    d = Math.max(1, maxZ - minZ);
  const s = (size - 14) / Math.max(w, d);
  const ox = (size - w * s) / 2 - minX * s,
    oz = (size - d * s) / 2 - minZ * s;
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('aria-hidden', 'true');
  for (const e of layout.edges) {
    const a = layout.nodes[e.from],
      b = layout.nodes[e.to];
    if (!a || !b) continue;
    const l = document.createElementNS(SVG, 'line');
    l.setAttribute('x1', String(a.pos[0] * s + ox));
    l.setAttribute('y1', String(a.pos[2] * s + oz));
    l.setAttribute('x2', String(b.pos[0] * s + ox));
    l.setAttribute('y2', String(b.pos[2] * s + oz));
    l.setAttribute('stroke', e.folds ? '#ff9ad5' : 'rgba(255,255,255,0.45)');
    l.setAttribute('stroke-width', '1.3');
    if (e.folds) l.setAttribute('stroke-dasharray', '3 2');
    svg.appendChild(l);
  }
  for (const n of layout.nodes) {
    const c = document.createElementNS(SVG, 'circle');
    c.setAttribute('cx', String(n.pos[0] * s + ox));
    c.setAttribute('cy', String(n.pos[2] * s + oz));
    c.setAttribute('r', n.kind === 'start' ? '4' : '2.6');
    c.setAttribute('fill', KIND_COLOR[n.kind]);
    svg.appendChild(c);
  }
  return svg;
}

const DIFF = ['', 'leicht', 'mittel', 'schwer'];

/** Auswahl von Welt (5) und Brett (10 je Welt) mit Mini-Karte */
export function layoutPicker(
  value: string,
  onChange: (id: string) => void,
): { el: HTMLElement; set(id: string): void; get(): string } {
  let cur = LAYOUTS.find((l) => l.id === value) ?? LAYOUTS[0]!;
  const root = h('div', { class: 'picker' });
  const tabs = h('div', { class: 'chips' });
  const grid = h('div', { class: 'lgrid' });
  root.append(tabs, grid);
  const render = (): void => {
    tabs.textContent = '';
    for (const w of WORLD_IDS) {
      const th = THEMES[w as WorldId];
      tabs.appendChild(
        h(
          'button',
          {
            type: 'button',
            class: 'chip' + (cur.world === w ? ' on' : ''),
            'aria-pressed': String(cur.world === w),
            onclick: () => select(layoutsOfWorld(w as WorldId)[0]!),
          },
          th.name,
        ),
      );
    }
    grid.textContent = '';
    for (const l of layoutsOfWorld(cur.world)) {
      const card = h(
        'button',
        {
          type: 'button',
          class: 'card pick' + (l.id === cur.id ? ' on' : ''),
          'aria-pressed': String(l.id === cur.id),
          onclick: () => select(l),
        },
        h('div', { class: 'mm' }, minimap(l, 92)),
        h('b', null, `${l.index}. ${l.name}`),
        h('small', null, `${l.nodes.length} Felder · ${DIFF[l.difficulty]} · ${l.recommendedRounds} Runden`),
        h('small', { class: 'feat' }, l.features.slice(0, 3).join(' · ')),
      );
      grid.appendChild(card);
    }
    grid.appendChild(h('p', { class: 'blurb' }, cur.blurb));
  };
  const select = (l: Layout): void => {
    cur = l;
    render();
    onChange(l.id);
  };
  render();
  return {
    el: root,
    set: (id) => {
      const l = LAYOUTS.find((x) => x.id === id);
      if (l) {
        cur = l;
        render();
      }
    },
    get: () => cur.id,
  };
}

/** Figurenauswahl als Reihe von Schaltflächen; `taken` markiert bereits vergebene Figuren */
export function characterPicker(
  value: CharacterId,
  taken: () => CharacterId[],
  onChange: (c: CharacterId) => void,
): HTMLElement {
  const row = h('div', { class: 'chars', role: 'radiogroup', 'aria-label': 'Figur' });
  let cur = value;
  const render = (): void => {
    row.textContent = '';
    const used = taken();
    for (const c of CHARACTERS) {
      const dis = used.includes(c.id) && c.id !== cur;
      row.appendChild(
        h(
          'button',
          {
            type: 'button',
            class: 'char' + (c.id === cur ? ' on' : ''),
            title: `${c.name} – ${c.species}`,
            'aria-label': `${c.name}, ${c.species}`,
            'aria-pressed': String(c.id === cur),
            disabled: dis,
            style: `--a:${c.colors.primary};--b:${c.colors.secondary}`,
            onclick: () => {
              cur = c.id;
              onChange(c.id);
              render();
            },
          },
          h('span', null, c.name.slice(0, 1)),
        ),
      );
    }
  };
  render();
  (row as HTMLElement & { refresh?: () => void }).refresh = render;
  return row;
}
