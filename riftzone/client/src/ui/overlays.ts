// Spiel-Overlays: große Karte (mit Markierung), Inventar (Tauschen/Fallenlassen), Emote-Rad, Pausemenü, Dialoge.
import { MAP_SIZE } from '../../../shared/src/constants';
import { EMOTES } from '../../../shared/src/cosmetics';
import { AMMO_NAMES, CONSUMABLES, GRENADE_ID, RARITY_NAMES, WEAPONS, damageFor } from '../../../shared/src/items';
import type { NetZone, SelfState } from '../../../shared/src/protocol';
import { Phase } from '../../../shared/src/types';
import { h, hex } from '../core/dom';
import { rarityColor, settings } from '../core/settings';
import { drawPoiLabels } from './mapimage';

export class MapView {
  readonly root: HTMLElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly g: CanvasRenderingContext2D;
  onMarker: ((x: number, z: number) => void) | null = null;
  onClose: (() => void) | null = null;
  open = false;

  constructor(private readonly img: HTMLCanvasElement) {
    this.canvas = h('canvas', { width: 1024, height: 1024 });
    this.g = this.canvas.getContext('2d')!;
    this.root = h(
      'div',
      { class: 'mapview', style: 'display:none' },
      this.canvas,
      h('button', { class: 'btn close', onclick: () => this.onClose?.() }, 'Schließen'),
      h('div', { class: 'legend panel' }, 'Tippen/Klicken: Markierung setzen · ', h('span', { style: 'color:#d68bff' }, '■ Sturm'), ' · ', h('span', null, '◯ nächste Zone')),
    );
    this.canvas.addEventListener('pointerdown', (e) => {
      const r = this.canvas.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * MAP_SIZE,
        z = ((e.clientY - r.top) / r.height) * MAP_SIZE;
      this.onMarker?.(x, z);
    });
  }

  show(v: boolean): void {
    this.open = v;
    this.root.style.display = v ? '' : 'none';
  }

  draw(d: { x: number; z: number; yaw: number; zone: NetZone | null; phase: Phase; bus: { x0: number; z0: number; x1: number; z1: number } | null; marker: { x: number; z: number } | null; mates: { x: number; z: number; name: string }[] }): void {
    if (!this.open) return;
    const g = this.g,
      W = this.canvas.width;
    const k = W / MAP_SIZE;
    g.drawImage(this.img, 0, 0, W, W);
    drawPoiLabels(g, k, 0, 0, 15);
    const z = d.zone;
    if (z && d.phase !== Phase.Bus) {
      g.fillStyle = 'rgba(182,75,255,0.35)';
      g.beginPath();
      g.rect(0, 0, W, W);
      g.arc(z.cx * k, z.cz * k, Math.max(0, z.r) * k, 0, Math.PI * 2, true);
      g.fill('evenodd');
      g.lineWidth = 3;
      g.strokeStyle = '#d68bff';
      g.beginPath();
      g.arc(z.cx * k, z.cz * k, Math.max(0, z.r) * k, 0, Math.PI * 2);
      g.stroke();
      g.strokeStyle = '#fff';
      g.setLineDash([10, 8]);
      g.beginPath();
      g.arc(z.tx * k, z.tz * k, Math.max(0, z.tr) * k, 0, Math.PI * 2);
      g.stroke();
      g.setLineDash([]);
      // Linie zur sicheren Zone
      g.strokeStyle = 'rgba(255,255,255,0.6)';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(d.x * k, d.z * k);
      g.lineTo(z.tx * k, z.tz * k);
      g.stroke();
    }
    if (d.bus && d.phase === Phase.Bus) {
      g.strokeStyle = '#ffb02e';
      g.lineWidth = 4;
      g.setLineDash([14, 8]);
      g.beginPath();
      g.moveTo(d.bus.x0 * k, d.bus.z0 * k);
      g.lineTo(d.bus.x1 * k, d.bus.z1 * k);
      g.stroke();
      g.setLineDash([]);
    }
    if (d.marker) {
      g.fillStyle = '#ffb02e';
      g.strokeStyle = '#000';
      g.lineWidth = 2;
      g.beginPath();
      g.arc(d.marker.x * k, d.marker.z * k, 9, 0, Math.PI * 2);
      g.fill();
      g.stroke();
    }
    g.font = '700 14px system-ui';
    for (const m of d.mates) {
      g.fillStyle = '#4fff8a';
      g.beginPath();
      g.arc(m.x * k, m.z * k, 7, 0, Math.PI * 2);
      g.fill();
      g.fillText(m.name, m.x * k, m.z * k - 14);
    }
    g.save();
    g.translate(d.x * k, d.z * k);
    g.rotate(-d.yaw);
    g.fillStyle = '#fff';
    g.strokeStyle = '#000';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(0, -14);
    g.lineTo(10, 11);
    g.lineTo(0, 5);
    g.lineTo(-10, 11);
    g.closePath();
    g.fill();
    g.stroke();
    g.restore();
  }
}

export class InventoryView {
  readonly root: HTMLElement;
  private readonly box: HTMLElement;
  private pick = -1;
  open = false;
  onSwap: ((a: number, b: number) => void) | null = null;
  onDrop: ((slot: number) => void) | null = null;
  onDropAmmo: ((a: number) => void) | null = null;
  onSelect: ((slot: number) => void) | null = null;
  onClose: (() => void) | null = null;
  private lastKey = '';

  constructor() {
    this.box = h('div', { class: 'box panel scroll' });
    this.root = h('div', { class: 'inv', style: 'display:none' }, this.box);
    this.root.addEventListener('pointerdown', (e) => {
      if (e.target === this.root) this.onClose?.();
    });
  }

  show(v: boolean): void {
    this.open = v;
    this.pick = -1;
    this.lastKey = '';
    this.root.style.display = v ? '' : 'none';
  }

  render(s: SelfState | null): void {
    if (!this.open || !s) return;
    const key = JSON.stringify([s.slots, s.ammo, s.mats, s.sel, this.pick]);
    if (key === this.lastKey) return;
    this.lastKey = key;
    const slots = s.slots.slice(1).map((sl, i) => {
      const idx = i + 1;
      const w = WEAPONS[sl.id];
      const c = CONSUMABLES.find((x) => x.id === sl.id);
      const name = w ? w.name : c ? c.name : 'Leer';
      const info = w && sl.id !== GRENADE_ID ? `${Math.round(damageFor(w, sl.rarity))} Schaden · ${sl.qty}/${w.mag}` : c ? `×${sl.qty} · ${c.hp ? `+${c.hp} Leben` : ''}${c.shield ? ` +${c.shield} Schild` : ''}` : sl.id === GRENADE_ID ? `×${sl.qty}` : '';
      return h(
        'div',
        {
          class: `islot ${this.pick === idx ? 'pick' : ''} ${s.sel === idx ? 'sel' : ''}`,
          style: sl.id >= 0 ? `border-bottom:4px solid ${hex(rarityColor(sl.rarity, settings.data.colorblind))}` : '',
          onclick: () => {
            if (this.pick < 0) {
              this.pick = idx;
            } else if (this.pick === idx) {
              this.pick = -1;
              this.onSelect?.(idx);
            } else {
              this.onSwap?.(this.pick, idx);
              this.pick = -1;
            }
            this.lastKey = '';
          },
        },
        h('span', { class: 'muted' }, `Platz ${idx}`),
        h('span', { class: 'nm' }, name),
        sl.id >= 0 ? h('span', { class: 'muted' }, RARITY_NAMES[sl.rarity] ?? '') : '',
        h('span', null, info),
        sl.id >= 0 ? h('button', { class: 'btn small ghost', onclick: (e: Event) => (e.stopPropagation(), this.onDrop?.(idx)) }, 'Fallen lassen') : '',
      );
    });
    this.box.replaceChildren(
      h('div', { class: 'row' }, h('h2', { class: 'grow' }, 'Inventar'), h('button', { class: 'btn small', onclick: () => this.onClose?.() }, 'Schließen')),
      h('p', { class: 'muted' }, 'Tippe einen Platz an und dann einen zweiten, um sie zu tauschen. Zweimal tippen wählt den Gegenstand aus.'),
      h('div', { class: 'slots' }, slots),
      h('h3', { style: 'margin-top:14px' }, 'Munition'),
      h(
        'div',
        { class: 'amrow' },
        AMMO_NAMES.map((n, i) => h('div', { class: 'am' }, h('span', null, n), h('b', null, String(s.ammo[i])), s.ammo[i]! > 0 ? h('button', { class: 'btn small ghost', onclick: () => this.onDropAmmo?.(i) }, '−30') : '')),
      ),
      h('h3', { style: 'margin-top:14px' }, 'Material'),
      h('div', { class: 'amrow' }, ['Holz', 'Stein', 'Metall'].map((n, i) => h('div', { class: 'am' }, h('span', null, n), h('b', null, String(s.mats[i]))))),
    );
  }
}

export class EmoteWheel {
  readonly root: HTMLElement;
  open = false;
  onPick: ((id: number) => void) | null = null;
  constructor() {
    this.root = h('div', { class: 'wheel', style: 'display:none' });
    this.root.addEventListener('pointerdown', (e) => {
      if (e.target === this.root) this.show(false, []);
    });
  }
  show(v: boolean, emotes: number[]): void {
    this.open = v;
    this.root.style.display = v ? '' : 'none';
    if (!v) return;
    const items = h('div', { class: 'items' });
    const n = Math.max(1, emotes.length);
    emotes.forEach((id, i) => {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      const el = h(
        'div',
        { class: 'w panel', style: `left:${150 + Math.cos(a) * 110}px;top:${150 + Math.sin(a) * 110}px`, onclick: () => (this.onPick?.(id), this.show(false, [])) },
        EMOTES[id]?.name ?? '?',
      );
      items.appendChild(el);
    });
    items.appendChild(h('div', { class: 'w', style: 'left:150px;top:150px;color:var(--dim)' }, 'Emote'));
    this.root.replaceChildren(items);
  }
}

export function pauseMenu(opts: { onResume: () => void; onSettings: () => void; onLeave: () => void; online: boolean; canSpectateLeave: boolean }): HTMLElement {
  return h(
    'div',
    { class: 'dialog-back' },
    h(
      'div',
      { class: 'dialog panel col' },
      h('h2', null, 'Pause'),
      opts.online ? h('p', { class: 'muted' }, 'Online-Match läuft weiter, solange das Menü offen ist.') : h('p', { class: 'muted' }, 'Das Offline-Match ist angehalten.'),
      h('button', { class: 'btn rift', onclick: opts.onResume }, 'Weiterspielen'),
      h('button', { class: 'btn', onclick: opts.onSettings }, 'Einstellungen'),
      h('button', { class: 'btn danger', onclick: opts.onLeave }, opts.canSpectateLeave ? 'Zur Lobby' : 'Match verlassen'),
    ),
  );
}

export function confirmDialog(text: string, yes: string, onYes: () => void, onNo: () => void): HTMLElement {
  const el = h(
    'div',
    { class: 'dialog-back' },
    h(
      'div',
      { class: 'dialog panel col' },
      h('p', null, text),
      h('div', { class: 'row' }, h('button', { class: 'btn danger grow', onclick: () => (el.remove(), onYes()) }, yes), h('button', { class: 'btn grow', onclick: () => (el.remove(), onNo()) }, 'Abbrechen')),
    ),
  );
  return el;
}

export function toast(text: string, ms = 2200): void {
  const t = h('div', { class: 'toast panel' }, text);
  document.getElementById('ui')!.appendChild(t);
  setTimeout(() => t.remove(), ms);
}
