/* HUD in der Stadt: Kapitel-Ziel, Geld/Ruf/Uhrzeit, Aktions-Hinweis, Markierungen über Zielen. */
import { el, esc, glyph } from './ui';
import { sfx, buzz } from '../engine/Audio';

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
  onStation: ((i: number) => void) | null = null;
  private needsEl!: HTMLElement;
  constructor() {
    this.el = el(`<div id="hud" class="hidden"><div class="speedo"></div><div class="lcol"><div class="goal"></div><div class="needs"></div></div>
      <div class="rcol"><div class="stats"></div><div class="rrow"><canvas class="radar" width="200" height="200"></canvas><div class="rside"><div class="menuBtn"><button data-k="radio" aria-label="Radiosender wechseln" hidden>📻</button><button data-k="phone" aria-label="Handy">📱</button><button data-k="menu" aria-label="Menü">☰</button></div><button class="weapon" aria-label="Waffe wechseln"></button></div></div></div>
      <div class="markers pass"></div><div class="prompt"></div><div class="toast"></div><div class="gigbar"></div><div class="banner"></div><div class="rwheel"><div class="ring"></div><div class="mid"><em>Radio</em><b></b><small></small></div></div><button class="nowplay" aria-label="Radiosender wählen"><b></b><span></span></button><div class="wanted"></div></div>`);
    document.body.appendChild(this.el);
    this.goalEl = this.el.querySelector('.goal')!; this.statsEl = this.el.querySelector('.stats')!;
    this.promptEl = this.el.querySelector('.prompt')!; this.markersEl = this.el.querySelector('.markers')!;
    this.promptEl.addEventListener('click', () => this.onPrompt?.());
    this.el.querySelector<HTMLButtonElement>('[data-k=menu]')!.onclick = () => this.onMenu?.();
    this.el.querySelector<HTMLButtonElement>('[data-k=phone]')!.onclick = () => this.onPhone?.();
    this.el.querySelector<HTMLButtonElement>('[data-k=radio]')!.onclick = () => this.onRadio?.();
    this.el.querySelector<HTMLButtonElement>('.nowplay')!.onclick = () => this.onRadio?.();
    this.needsEl = this.el.querySelector('.needs')!;
    this.el.querySelector<HTMLButtonElement>('.weapon')!.onclick = () => this.onWeapon?.();
    this.needsEl.innerHTML = NEED_ICONS.map(([k, i]) => `<span data-n="${k}" title="${k}">${i}<i><b></b></i></span>`).join('');
  }
  /* ---------- Radar (Minikarte unten links, dreht mit der Kamera) ---------- */
  private radarBase: HTMLCanvasElement | null = null;
  /** Karte einmal zeichnen: Straßen alle 30 m, Häuserblöcke, Wasser und Hafen */
  setRadarMap(draw: (g: CanvasRenderingContext2D, px: (v: number) => number) => void) {
    const c = document.createElement('canvas'); c.width = c.height = 1536;
    const g = c.getContext('2d')!;
    draw(g, (v) => 768 + v * 2); // 2 px je Meter, Mitte = Weltursprung (±384 m, reicht bis zur Inselkette)
    this.radarBase = c;
  }
  radar(x: number, z: number, yaw: number, blips: Blip[], gps?: { pts: Array<[number, number]>; color: string } | null) {
    const cv = this.el.querySelector<HTMLCanvasElement>('.radar')!, g = cv.getContext('2d')!, R = 100;
    if (!this.radarBase) return;
    g.clearRect(0, 0, 200, 200);
    g.save(); g.beginPath(); g.arc(R, R, R - 3, 0, Math.PI * 2); g.clip();
    g.fillStyle = '#123a52'; g.fillRect(0, 0, 200, 200);
    g.translate(R, R); g.rotate(yaw); g.scale(1.4, 1.4); g.translate(-(768 + x * 2), -(768 + z * 2));
    g.drawImage(this.radarBase, 0, 0);
    // GPS-Route wie im Open-World-Krimi: dicke Linie über die Straßen bis zum Ziel
    if (gps && gps.pts.length > 1) {
      g.lineJoin = g.lineCap = 'round';
      g.beginPath(); gps.pts.forEach(([px, pz], i) => (i ? g.lineTo(768 + px * 2, 768 + pz * 2) : g.moveTo(768 + px * 2, 768 + pz * 2)));
      g.strokeStyle = 'rgba(0,0,0,.55)'; g.lineWidth = 7; g.stroke();
      g.strokeStyle = gps.color; g.lineWidth = 4.5; g.stroke();
    }
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
  /* ---------- Senderrad: alle Sender im Kreis, der gewählte steht oben; Antippen wählt direkt ---------- */
  wheelOpen = false;
  private wheelT = 0; private wheelRot = 0; private wheelCur = -1;
  radioWheel(list: Array<{ icon: string; color: string; name: string }> | null, cur = 0, name = '', sub = '', live = false, ms = 4200) {
    const w = this.el.querySelector<HTMLElement>('.rwheel')!, ring = w.querySelector<HTMLElement>('.ring')!;
    clearTimeout(this.wheelT);
    if (!list) { w.classList.remove('on'); this.wheelOpen = false; return; }
    const n = list.length;
    if (ring.children.length !== n) {
      ring.innerHTML = list.map((s, i) => `<button data-i="${i}" style="--c:${s.color};--a:${i * 360 / n}deg" aria-label="${esc(s.name)}">${s.icon}</button>`).join('');
      ring.onclick = (e) => { const b = (e.target as HTMLElement).closest('button'); if (b) this.onStation?.(+b.dataset.i!); };
      this.wheelCur = cur; this.wheelRot = cur;
    }
    // kürzester Weg, damit das Rad nicht einmal ganz herumdreht
    let d = cur - this.wheelCur; if (d > n / 2) d -= n; if (d < -n / 2) d += n;
    this.wheelRot += d; this.wheelCur = cur;
    [...ring.children].forEach((b, i) => b.classList.toggle('cur', i === cur));
    ring.style.setProperty('--r', (-this.wheelRot * 360 / n) + 'deg');
    w.querySelector('em')!.textContent = live ? '● LIVE' : 'Radio';
    w.querySelector('b')!.textContent = name; w.querySelector('small')!.textContent = sub;
    w.style.setProperty('--c', list[cur].color);
    w.classList.add('on'); this.wheelOpen = true;
    this.wheelT = window.setTimeout(() => { w.classList.remove('on'); this.wheelOpen = false; }, ms);
  }
  /** Kleine Anzeige beim Fahren: Sender und laufender Titel (null = aus) */
  nowPlaying(station: string | null, song = '') {
    const e = this.el.querySelector<HTMLElement>('.nowplay')!;
    e.classList.toggle('on', !!station);
    if (station) { e.querySelector('b')!.textContent = station; e.querySelector('span')!.textContent = song; }
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
  /** Tacho beim Fahren (Tempo, beim eigenen Wagen auch der Tank) */
  speedo(text: string | null, low = false) { const e = this.el.querySelector<HTMLElement>('.speedo')!; e.classList.toggle('on', !!text); e.classList.toggle('low', low); if (text && e.textContent !== text) e.textContent = text; }
  weapon(text: string | null) { const e = this.el.querySelector<HTMLElement>('.weapon')!; e.classList.toggle('on', !!text); if (text && e.textContent !== text) e.textContent = text; }
  private lastWanted = '';
  /** Fahndungssterne oben in der Mitte: hohl, wenn dich gerade keine Streife sieht (sie suchen, aber nicht dich direkt),
      darunter die Täterbeschreibung */
  wanted(n: number, hollow = false, desc = '') {
    const k = n + (hollow ? 'h' : '') + desc; if (k === this.lastWanted) return; this.lastWanted = k;
    const e = this.el.querySelector<HTMLElement>('.wanted')!;
    e.className = 'wanted' + (n ? ' on' : '') + (hollow ? ' hollow' : '');
    e.innerHTML = (hollow ? '☆' : '★').repeat(n) + '<i>' + '★'.repeat(Math.max(0, 5 - n)) + '</i>' + (desc ? `<small>${desc.replace(/[<>&]/g, '')}</small>` : '');
  }
  radarOn(on: boolean) { this.el.querySelector<HTMLElement>('.radar')!.style.display = on ? '' : 'none'; }
  show(on: boolean) { this.el.classList.toggle('hidden', !on); }
  private lastGoal = '';
  goal(ch: string, title: string, sub = '') {
    // neues Ziel: kurz aufleuchten lassen, Ton und Vibration (nicht beim ersten Anzeigen)
    const key = ch.includes('Drinnen') || ch === 'Zuhause' ? sub.replace(/^Ziel: /, '') : title;
    if (key !== this.lastGoal) {
      if (this.lastGoal && key && key !== 'Schau dich um.') { this.goalEl.classList.remove('new'); void this.goalEl.offsetWidth; this.goalEl.classList.add('new'); sfx('ok'); buzz([18, 40, 18]); }
      this.lastGoal = key;
    }
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
  /** Bereiche, in denen keine Zielmarke liegen darf (Touch-Stick, Touch-Knöpfe, Aktions-Hinweis), alle 0,4 s neu gemessen */
  private markerSize = new WeakMap<HTMLElement, { html: string; w: number; h: number }>();
  private zones: Array<{ l: number; t: number; r: number; b: number }> = [];
  private zoneT = 0;
  private freeZones() {
    const now = performance.now(); if (now - this.zoneT < 400) return this.zones;
    this.zoneT = now;
    this.zones = [...document.querySelectorAll<HTMLElement>('#touch.on .stick, #touch.on .btns button, #hud .prompt.on, #hud .rcol, #hud .lcol')]
      .map((e) => e.getBoundingClientRect()).filter((r) => r.width > 0 && r.height > 0)
      .map((r) => ({ l: r.left - 6, t: r.top - 6, r: r.right + 6, b: r.bottom + 6 }));
    return this.zones;
  }
  markers(list: Marker[], project?: Project) {
    const seen = new Set<string>();
    const w = innerWidth, h = innerHeight, zones = list.length ? this.freeZones() : this.zones;
    for (const m of list) {
      if (!project) break;
      seen.add(m.id);
      let e = this.markerEls.get(m.id);
      if (!e) { e = el('<div class="marker"></div>'); this.markersEl.appendChild(e); this.markerEls.set(m.id, e); }
      const html = m.icon + (m.label ? `<small>${esc(m.label)}</small>` : '');
      // Größe nur bei neuem Inhalt messen (einmal Layout), nicht in jedem Bild
      let sz = this.markerSize.get(e);
      if (!sz || sz.html !== html) { e.innerHTML = html; this.markerSize.set(e, (sz = { html, w: e.offsetWidth || 40, h: e.offsetHeight || 30 })); }
      const ew = sz.w, eh = sz.h;
      const v = project(m.pos);
      let x = v.x, y = v.y;
      // Ziele außerhalb des Bildes am Rand anzeigen
      if (v.behind) { x = w - x; y = h - 40; }
      // ganz im Bild (auch die Beschriftung) und nie unter Stick, Knöpfen, Hinweis oder den HUD-Spalten
      x = Math.max(ew / 2 + 4, Math.min(w - ew / 2 - 4, x)); y = Math.max(eh + 8, Math.min(h - 8, y));
      for (let k = 0; k < 4; k++) {
        const z = zones.find((q) => x + ew / 2 > q.l && x - ew / 2 < q.r && y > q.t && y - eh < q.b);
        if (!z) break;
        // nach oben ausweichen, oben (HUD-Spalten) nach unten
        if (z.b < h / 2) y = z.b + eh + 6; else y = z.t - 8;
      }
      e.style.left = x + 'px'; e.style.top = y + 'px';
    }
    for (const [id, e] of this.markerEls) if (!seen.has(id)) { e.remove(); this.markerEls.delete(id); }
  }
}
