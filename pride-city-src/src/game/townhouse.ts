/* Stadthäuser der Innenstadt statt KayKit-Klötzen: Baukörper mit echten Foto-Fassaden (ambientCG Facade018A–020A, CC0),
   Ladenfront aus Glas mit Pfeilern und Gesims, Markise in Pride-Farben, Dachkante und Technik auf dem Dach.
   Alle Häuser einer Szene landen in wenigen zusammengefassten Meshes (ein Zeichenaufruf je Material), nachts leuchten
   zufällige Fenster (Leuchtkarte aus den beleuchteten Varianten der Fassade) und die Schaufenster. */
import { Color3, PBRMaterial, type Scene } from '../engine/bjs';
import { pbr, canvasTex } from '../engine/geo';
import { worldTex } from '../engine/surfaces';
import { Batch } from './uptown';
import { PALETTES } from './palettes';
import type { World } from './World';

export const HOUSE_W = 8.8;          // Grundriss (Fassade 4,4 m vor der Kachelmitte, wie die Läden es erwarten)
const FLOOR = 3.4, AXES = 6, AX = HOUSE_W / 3; // Textur: 6 Fensterachsen × 6 Etagen
const FACADES = ['018', '019', '020'] as const;
/** leichte Anstriche wie an der Küste von Florida (Rosa, Mint, Pfirsich, Flieder, Himmelblau, Creme, unverändert) */
const TINTS: Array<[number, number, number]> = [[1.12, .9, .98], [.9, 1.08, 1], [1.12, .98, .86], [1, .92, 1.1], [.9, 1, 1.12], [1.08, 1.04, .94], [1, 1, 1]];

export interface HouseOpts { floors?: number; facade?: number; awning?: number; shop?: boolean }

export class Townhouses {
  private fac = FACADES.map(() => new Batch(AX * AXES, FLOOR * 6));
  private roof = new Batch(6, 6);
  private trim = new Batch(4, 4);
  private glass = new Batch(HOUSE_W - 1.9, 2.9);
  private aw = PALETTES[0].colors.map(() => new Batch(4, 4));
  private n = 0;
  constructor(private w: World) {}

  /** Haus mit Mittelpunkt x/z, Front zeigt in Richtung yaw (wie rotation.y). Liefert die Kollision. */
  add(x: number, z: number, yaw: number, o: HouseOpts = {}) {
    const i = this.n++, h = (i * 2654435761) >>> 0, rr = (k: number) => ((h >>> k) & 255) / 255;
    const floors = o.floors ?? 3 + Math.floor(rr(3) * 3), W = HOUSE_W, H = floors * FLOOR + .5;
    const s = Math.sin(yaw), c = Math.cos(yaw), rot: [number, number, number] = [0, yaw, 0];
    const at = (lx: number, lz: number): [number, number] => [x + s * lz + c * lx, z + c * lz - s * lx];
    const put = (b: Batch, lx: number, y: number, lz: number, sx: number, sy: number, sz: number, roof: Batch | null | undefined = undefined, tilt = 0) => {
      const [px, pz] = at(lx, lz); b.box(px, y, pz, sx, sy, sz, { rot: tilt ? [tilt, yaw, 0] : rot, roof });
    };
    const f = this.fac[(o.facade ?? Math.floor(rr(11) * 3)) % 3];
    { const [px, pz] = at(0, 0); f.box(px, H / 2, pz, W, H, W, { rot, roof: this.roof, off: [Math.floor(rr(19) * AXES) / AXES, 0], tint: TINTS[Math.floor(rr(7) * TINTS.length)] }); }
    // Ladenfront: Schaufenster, Pfeiler, Gesims über dem Erdgeschoss
    const fz = W / 2;
    if (o.shop !== false) {
      put(this.glass, 0, 1.55, fz + .04, W - 1.9, 2.9, .12);
      for (const e of [-1, 1]) put(this.trim, e * (W / 2 - .45), 1.6, fz + .08, .9, 3.2, .3, null);
      put(this.trim, 0, 3.15, fz + .12, W + .1, .32, .36);
      // Markise in Pride-Farben, leicht geneigt
      const a = (o.awning ?? Math.floor(rr(23) * this.aw.length)) % this.aw.length;
      put(this.aw[a], 0, 2.78, fz + .72, W - 2.4, .06, 1.35, undefined, .28);
    }
    // Dachkante und Technik
    put(this.trim, 0, H + .12, 0, W + .4, .3, W + .4);
    if (rr(27) < .7) put(this.trim, (rr(5) - .5) * 4, H + .75, (rr(13) - .5) * 4, 1.6, 1, 1.1);
    const r = { x, z, hx: W / 2 - .1, hz: W / 2 - .1 };
    this.w.colliders.push(r);
    return { r, front: W / 2 };
  }

  /** Meshes bauen (einmal, nachdem alle Häuser angelegt sind) */
  build(sc: Scene) {
    const w = this.w;
    FACADES.forEach((id, k) => {
      const m = new PBRMaterial('facade' + id, sc);
      m.albedoTexture = worldTex(sc, `fac${id}_col.jpg`); m.bumpTexture = worldTex(sc, `fac${id}_nor.jpg`); m.invertNormalMapY = true;
      m.emissiveTexture = worldTex(sc, `fac${id}_emi.jpg`); m.emissiveColor = new Color3(0, 0, 0);
      m.roughness = .82; m.metallic = 0;
      w.nightMats.push(m);
      const me = this.fac[k].mesh(sc, 'houses' + id, m); if (me) w.still(me);
    });
    const roof = pbr(sc, 0x55575c, .95); roof.albedoTexture = worldTex(sc, 'asphalt_col.jpg');
    // Schaufenster: Alurahmen, Glastür in der Mitte, Spiegelungen; nachts warmes Licht von innen
    const W = 512, Hh = 216, frame = (g: CanvasRenderingContext2D, fill: string) => {
      g.fillStyle = fill; g.fillRect(0, 0, W, 10); g.fillRect(0, Hh - 14, W, 14); g.fillRect(0, 0, 10, Hh); g.fillRect(W - 10, 0, 10, Hh);
      for (const x of [150, 206, 306, 362]) g.fillRect(x - 4, 0, 8, Hh); g.fillRect(0, 52, W, 6);
    };
    const shopTex = canvasTex(sc, W, Hh, (g) => {
      const gr = g.createLinearGradient(0, 0, W, Hh); gr.addColorStop(0, '#3d5468'); gr.addColorStop(.5, '#1a2530'); gr.addColorStop(1, '#2c3c4a');
      g.fillStyle = gr; g.fillRect(0, 0, W, Hh);
      g.fillStyle = 'rgba(255,255,255,.08)'; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(i * 110, Hh); g.lineTo(i * 110 + 60, 0); g.lineTo(i * 110 + 85, 0); g.lineTo(i * 110 + 25, Hh); g.fill(); }
      g.fillStyle = '#5a3d2a'; g.fillRect(212, 62, 88, Hh - 76); g.fillStyle = '#1f2a33'; g.fillRect(220, 70, 72, Hh - 90); // Tür
      g.fillStyle = '#c9c9c4'; g.fillRect(284, 130, 4, 26);
      frame(g, '#8d9196');
    });
    const shopGlow = canvasTex(sc, W, Hh, (g) => {
      const gr = g.createLinearGradient(0, 0, 0, Hh); gr.addColorStop(0, '#fff1c8'); gr.addColorStop(1, '#c8823a');
      g.fillStyle = gr; g.fillRect(0, 0, W, Hh); frame(g, '#000');
    });
    const glass = pbr(sc, 0xffffff, .12, .2); glass.albedoTexture = shopTex; glass.emissiveTexture = shopGlow; glass.emissiveColor = new Color3(0, 0, 0); w.nightMats.push(glass);
    const trim = pbr(sc, 0xd8d0c2, .7); trim.detailMap.texture = w.detailTex(); trim.detailMap.isEnabled = true; trim.detailMap.diffuseBlendLevel = .25; trim.detailMap.bumpLevel = .5;
    for (const [b, m, n] of [[this.roof, roof, 'roofs'], [this.glass, glass, 'shopglass'], [this.trim, trim, 'trim']] as const) { const me = b.mesh(sc, n, m); if (me) w.still(me); }
    PALETTES[0].colors.forEach((cl, k) => { const me = this.aw[k].mesh(sc, 'awning' + k, pbr(sc, cl, .85)); if (me) w.still(me); });
  }
}
