/* HUD in der Stadt: Kapitel-Ziel, Geld/Ruf/Uhrzeit, Aktions-Hinweis, Markierungen über Zielen. */
import { el, esc, glyph } from './ui';

const NEED_ICONS: Array<[string, string]> = [['energy', '⚡'], ['hunger', '🍝'], ['hygiene', '🚿'], ['social', '💬'], ['fun', '🎉']];

export interface Marker { id: string; icon: string; label?: string; pos: { x: number; y: number; z: number } }
/** Weltpunkt → Bildschirm (Pixel) */
export type Project = (p: { x: number; y: number; z: number }) => { x: number; y: number; behind: boolean };
/** Punkt auf dem Radar (Welt-Koordinaten) */
export interface Blip { x: number; z: number; icon?: string; color?: string; goal?: boolean }

export class Hud {
  el: HTMLElement;
  private goalEl: HTMLElement;
  private statsEl: HTMLElement;
  private promptEl: HTMLElement;
  private markersEl: HTMLElement;
  private markerEls = new Map<string, HTMLElement>();
  onPrompt: (() => void) | null = null;
  onMenu: (() => void) | null = null;
  onPhone: (() => void) | null = null;
  onRadio: (() => void) | null = null;
  onWeapon: (() => void) | null = null;
  private needsEl!: HTMLElement;
  constructor() {
    this.el = el(`<div id="hud" class="hidden"><div class="lcol"><div class="goal"></div><div class="needs"></div></div><div class="stats"></div>
      <div class="menuBtn"><button data-k="radio" aria-label="Radiosender wechseln" hidden>📻</button><button data-k="phone" aria-label="Handy">📱</button><button data-k="menu" aria-label="Menü">☰</button></div>
      <div class="markers pass"></div><div class="prompt"></div><div class="toast"></div><canvas class="radar" width="200" height="200"></canvas><div class="gigbar"></div><div class="banner"></div><div class="wanted"></div><button class="weapon" aria-label="Waffe wechseln"></button></div>`);
    document.body.appendChild(this.el);
    this.goalEl = this.el.querySelector('.goal')!; this.statsEl = this.el.querySelector('.stats')!;
    this.promptEl = this.el.querySelector('.prompt')!; this.markersEl = this.el.querySelector('.markers')!;
    this.promptEl.addEventListener('click', () => this.onPrompt?.());
    this.el.querySelector<HTMLButtonElement>('[data-k=menu]')!.onclick = () => this.onMenu?.();
    this.el.querySelector<HTMLButtonElement>('[data-k=phone]')!.onclick = () => this.onPhone?.();
    this.el.querySelector<HTMLButtonElement>('[data-k=radio]')!.onclick = () => this.onRadio?.();
    this.needsEl = this.el.querySelector('.needs')!;
    this.el.querySelector<HTMLButtonElement>('.weapon')!.onclick = () => this.onWeapon?.();
    this.needsEl.innerHTML = NEED_ICONS.map(([k, i]) => `<span data-n="${k}" title="${k}">${i}<i><b></b></i></span>`).join('');
  }
  /* ---------- Radar (Minikarte unten links, dreht mit der Kamera) ---------- */
  private radarBase: HTMLCanvasElement | null = null;
  /** Karte einmal zeichnen: Straßen alle 30 m, Häuserblöcke, Wasser und Hafen */
  setRadarMap(draw: (g: CanvasRenderingContext2D, px: (v: number) => number) => void) {
    const c = document.createElement('canvas'); c.width = c.height = 512;
    const g = c.getContext('2d')!;
    draw(g, (v) => 256 + v * 2); // 2 px je Meter, Mitte = Weltursprung
    this.radarBase = c;
  }
  radar(x: number, z: number, yaw: number, blips: Blip[]) {
    const cv = this.el.querySelector<HTMLCanvasElement>('.radar')!, g = cv.getContext('2d')!, R = 100;
    if (!this.radarBase) return;
    g.clearRect(0, 0, 200, 200);
    g.save(); g.beginPath(); g.arc(R, R, R - 3, 0, Math.PI * 2); g.clip();
    g.fillStyle = '#123a52'; g.fillRect(0, 0, 200, 200);
    g.translate(R, R); g.rotate(yaw); g.scale(1.4, 1.4); g.translate(-(256 + x * 2), -(256 + z * 2));
    g.drawImage(this.radarBase, 0, 0);
    g.restore();
    // Blips (Ziel am Rand festhalten wie im Radar üblich)
    const cs = Math.cos(yaw), sn = Math.sin(yaw);
    for (const b of blips) {
      const dx = (b.x - x) * 2.8, dz = (b.z - z) * 2.8;
      let px = dx * cs - dz * sn, pz = dx * sn + dz * cs;
      const d = Math.hypot(px, pz), max = R - 14;
      if (d > max) { if (!b.goal) continue; px *= max / d; pz *= max / d; }
      if (b.icon) { g.font = '16px system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(b.icon, R + px, R + pz); }
      else { g.fillStyle = b.color || '#fff'; g.beginPath(); g.arc(R + px, R + pz, b.goal ? 7 : 4, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#000'; g.lineWidth = 1.5; g.stroke(); }
    }
    // Spieler-Pfeil
    g.fillStyle = '#fff'; g.strokeStyle = '#000'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(R, R - 9); g.lineTo(R + 6, R + 7); g.lineTo(R, R + 3); g.lineTo(R - 6, R + 7); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 3; g.beginPath(); g.arc(R, R, R - 3, 0, Math.PI * 2); g.stroke();
  }
  /** Radio-Knopf nur im Auto */
  radioBtn(on: boolean) { this.el.querySelector<HTMLButtonElement>('[data-k=radio]')!.hidden = !on; }
  /** Laufender Auftrag: Zeit und nächste Station (null = aus) */
  gig(text: string | null, urgent = false) {
    const e = this.el.querySelector<HTMLElement>('.gigbar')!;
    e.classList.toggle('on', !!text); e.classList.toggle('urgent', urgent);
    if (text && e.textContent !== text) e.textContent = text;
  }
  /** Großer Schriftzug in der Bildmitte (Auftrag erledigt / gescheitert, Radiosender) */
  banner(title: string, sub = '', kind: 'good' | 'bad' | 'info' = 'good', ms = 3200) {
    const e = this.el.querySelector<HTMLElement>('.banner')!;
    e.className = 'banner on ' + kind;
    e.innerHTML = `<b>${esc(title)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}`;
    clearTimeout(this.bannerT); this.bannerT = window.setTimeout(() => (e.className = 'banner'), ms);
  }
  private bannerT = 0;
  /** Aktuelle Spaßwaffe (null = ausblenden) */
  weapon(text: string | null) { const e = this.el.querySelector<HTMLElement>('.weapon')!; e.classList.toggle('on', !!text); if (text && e.textContent !== text) e.textContent = text; }
  private lastWanted = '';
  /** Fahndungssterne oben in der Mitte, blinken, wenn dich gerade keine Streife sieht */
  wanted(n: number, flash = false) {
    const k = n + (flash ? 'f' : ''); if (k === this.lastWanted) return; this.lastWanted = k;
    const e = this.el.querySelector<HTMLElement>('.wanted')!;
    e.className = 'wanted' + (n ? ' on' : '') + (flash ? ' flash' : '');
    e.innerHTML = '★'.repeat(n) + '<i>' + '★'.repeat(Math.max(0, 5 - n)) + '</i>';
  }
  radarOn(on: boolean) { this.el.querySelector<HTMLElement>('.radar')!.style.display = on ? '' : 'none'; }
  show(on: boolean) { this.el.classList.toggle('hidden', !on); }
  goal(ch: string, title: string, sub = '') {
    this.goalEl.innerHTML = `<div class="ch">${esc(ch)}</div><b>${esc(title)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}`;
  }
  stats(items: string[]) { this.statsEl.innerHTML = items.map((s) => `<span class="chip">${esc(s)}</span>`).join(''); }
  /** Kleine Balken für die Bedürfnisse (rot unter 25) */
  needs(n: Record<string, number>) {
    for (const e of this.needsEl.children as unknown as HTMLElement[]) {
      const v = Math.round(n[e.dataset.n!] ?? 0), b = e.querySelector('b') as HTMLElement;
      b.style.width = v + '%'; e.classList.toggle('low', v < 25);
    }
  }
  private lastPrompt = '';
  prompt(text: string | null) {
    const k = text || '';
    if (k === this.lastPrompt) return;
    this.lastPrompt = k;
    this.promptEl.classList.toggle('on', !!text);
    if (text) this.promptEl.innerHTML = (glyph('a') || '<i class="g a">A</i>') + ' ' + esc(text);
  }
  markers(list: Marker[], project?: Project) {
    const seen = new Set<string>();
    const w = innerWidth, h = innerHeight;
    for (const m of list) {
      if (!project) break;
      seen.add(m.id);
      let e = this.markerEls.get(m.id);
      if (!e) { e = el('<div class="marker"></div>'); this.markersEl.appendChild(e); this.markerEls.set(m.id, e); }
      const html = m.icon + (m.label ? `<small>${esc(m.label)}</small>` : '');
      if (e.dataset.h !== html) { e.innerHTML = html; e.dataset.h = html; }
      const v = project(m.pos);
      let x = v.x, y = v.y;
      // Ziele außerhalb des Bildes am Rand anzeigen
      if (v.behind) { x = w - x; y = h - 40; }
      x = Math.max(28, Math.min(w - 28, x)); y = Math.max(70, Math.min(h - 60, y));
      e.style.left = x + 'px'; e.style.top = y + 'px';
    }
    for (const [id, e] of this.markerEls) if (!seen.has(id)) { e.remove(); this.markerEls.delete(id); }
  }
}
