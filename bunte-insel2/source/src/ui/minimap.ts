/* Karten-Bild der ganzen Welt (einmal berechnet, schrittweise) + runde Minikarte mit Ziel-Pfeil. */
import type { Game } from '../game.ts';
import { islandColor } from '../world/terrain.ts';
import { BRIDGES, bridgeEnds } from '../world/layout.ts';
import { h } from './dom.ts';

export const MAP = { x0: -820, z0: -660, x1: 700, z1: 580, px: 3 };

/** Erzeugt das Kartenbild Zeile für Zeile (ruckelfrei). */
export class MapImage {
  readonly canvas = document.createElement('canvas');
  private row = 0;
  private img: ImageData;
  private ctx: CanvasRenderingContext2D;
  done = false;
  constructor(private g: Game) {
    this.canvas.width = Math.ceil((MAP.x1 - MAP.x0) / MAP.px);
    this.canvas.height = Math.ceil((MAP.z1 - MAP.z0) / MAP.px);
    this.ctx = this.canvas.getContext('2d')!;
    this.img = this.ctx.createImageData(this.canvas.width, this.canvas.height);
  }
  step(budgetMs = 4): void {
    if (this.done) return;
    const t0 = performance.now(), W = this.canvas.width, Hh = this.canvas.height, d = this.img.data, field = this.g.field;
    while (this.row < Hh && performance.now() - t0 < budgetMs) {
      const z = MAP.z0 + this.row * MAP.px;
      for (let i = 0; i < W; i++) {
        const x = MAP.x0 + i * MAP.px, y = field.height(x, z), k = (this.row * W + i) * 4;
        let c: number;
        if (y < -0.2) { const t = Math.max(0, Math.min(1, (y + 6) / 6)); c = (Math.round(30 + 40 * t) << 16) | (Math.round(140 + 60 * t) << 8) | Math.round(210 + 20 * t); }
        else { const s = field.islandAt(x, z, 30); c = s ? islandColor(s, x, z, y, 0) : 0x6fcf5a; }
        d[k] = (c >> 16) & 255; d[k + 1] = (c >> 8) & 255; d[k + 2] = c & 255; d[k + 3] = 255;
      }
      this.row++;
    }
    if (this.row >= Hh) {
      this.ctx.putImageData(this.img, 0, 0);
      // Brücken
      this.ctx.strokeStyle = '#c9a26b'; this.ctx.lineWidth = 2.2;
      for (const b of BRIDGES) { const e = bridgeEnds(b); this.ctx.beginPath(); this.ctx.moveTo((e.ax - MAP.x0) / MAP.px, (e.az - MAP.z0) / MAP.px); this.ctx.lineTo((e.bx - MAP.x0) / MAP.px, (e.bz - MAP.z0) / MAP.px); this.ctx.stroke(); }
      this.done = true;
    }
  }
}

export class Minimap {
  readonly el: HTMLElement;
  private cv = h('canvas', { width: 220, height: 220 });
  private c: CanvasRenderingContext2D;
  image: MapImage;
  private t = 0;
  target: () => { x: number; z: number } | null = () => null;
  markers: () => { x: number; z: number; icon: string }[] = () => [];
  constructor(private g: Game) {
    this.c = this.cv.getContext('2d')!;
    this.el = h('div', { class: 'minimap', role: 'button', 'aria-label': 'Karte öffnen' }, this.cv);
    this.image = new MapImage(g);
  }
  update(dt: number): void {
    this.image.step(this.image.done ? 0 : 3);
    this.t += dt;
    if (this.t < 0.1) return;
    this.t = 0;
    const g = this.g, c = this.c, W = 220, p = g.player.pos, scale = 1.6; // px pro m
    c.save();
    c.fillStyle = '#2aa3e0'; c.fillRect(0, 0, W, W);
    c.translate(W / 2, W / 2);
    c.rotate(g.rig.yaw - Math.PI);
    if (this.image.done) {
      const s = scale * MAP.px;
      c.imageSmoothingEnabled = true;
      c.drawImage(this.image.canvas, (MAP.x0 - p.x) * scale, (MAP.z0 - p.z) * scale, this.image.canvas.width * s, this.image.canvas.height * s);
    }
    // Markierungen
    c.font = '18px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    for (const m of this.markers()) {
      const dx = (m.x - p.x) * scale, dz = (m.z - p.z) * scale;
      if (Math.hypot(dx, dz) > W / 2 - 12) continue;
      c.save(); c.translate(dx, dz); c.rotate(-(g.rig.yaw - Math.PI)); c.fillText(m.icon, 0, 0); c.restore();
    }
    const tg = this.target();
    if (tg) {
      let dx = (tg.x - p.x) * scale, dz = (tg.z - p.z) * scale;
      const L = Math.hypot(dx, dz), R = W / 2 - 14;
      if (L > R) { dx *= R / L; dz *= R / L; }
      c.save(); c.translate(dx, dz);
      c.fillStyle = '#ffd23f'; c.strokeStyle = '#2a1f4a'; c.lineWidth = 3;
      c.beginPath(); c.arc(0, 0, 8, 0, Math.PI * 2); c.fill(); c.stroke();
      c.restore();
    }
    c.restore();
    // Spieler-Pfeil (zeigt Blickrichtung relativ zur Kamera)
    c.save(); c.translate(W / 2, W / 2); c.rotate(-(g.player.yaw - g.rig.yaw));
    c.fillStyle = '#ffffff'; c.strokeStyle = '#2a1f4a'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(0, -11); c.lineTo(8, 9); c.lineTo(0, 4); c.lineTo(-8, 9); c.closePath(); c.fill(); c.stroke();
    c.restore();
  }
}
