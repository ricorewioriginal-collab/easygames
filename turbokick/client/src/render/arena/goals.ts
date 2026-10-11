import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { GOAL_ROUND } from '@shared/sim/arena';
import { ARENA } from '@shared/sim/types';
import type { SimState } from '@shared/sim/types';
import { Batch, axisCoords, buildShell } from './geometry';
import type { V3 } from './geometry';
import { glowMaterial, netMaterial } from './shaders';
import type { ArenaUniforms } from './shaders';
import { TEAM_COLORS } from './themes';

const GOAL_R = GOAL_ROUND; // Rundung im Torraum (identisch zur Physik)
const BOARD_W = 22;
const BOARD_H = 5.5;

/** Tore: Netzraum, leuchtendes Gestell und Anzeigetafeln hinter dem Glas */
export class GoalsView {
  readonly group = new THREE.Group();
  private tex: THREE.CanvasTexture;
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private boardMat: THREE.MeshBasicMaterial;
  private geos: THREE.BufferGeometry[] = [];
  private mats: THREE.Material[] = [];
  // Zwischenspeicher der letzten Anzeige (nur bei Änderung neu zeichnen)
  private lastKey = -1;

  constructor(u: ArenaUniforms) {
    const L = ARENA.halfLength;
    const D = ARENA.goalDepth;
    const GW = ARENA.goalHalfWidth;
    const GH = ARENA.goalHeight;

    // Netzraum beider Tore
    const mk = (s: 1 | -1): THREE.BufferGeometry => {
      const lo: V3 = s > 0 ? [-GW, 0, L - GOAL_R] : [-GW, 0, -L - D];
      const hi: V3 = s > 0 ? [GW, GH, L + D] : [GW, GH, -L + GOAL_R];
      const zg = axisCoords(lo[2], hi[2], GOAL_R, 4, [], 5);
      const keep =
        s > 0
          ? (t: { cz: number }): boolean => t.cz > L + 1e-4
          : (t: { cz: number }): boolean => t.cz < -L - 1e-4;
      return buildShell(
        lo,
        hi,
        GOAL_R,
        [axisCoords(-GW, GW, GOAL_R, 4, [], 5), axisCoords(0, GH, GOAL_R, 4, [], 3), zg],
        keep,
      );
    };
    const netGeo = mergeGeometries([mk(1), mk(-1)]);
    this.geos.push(netGeo);
    const netMat = netMaterial(u);
    this.mats.push(netMat);
    const net = new THREE.Mesh(netGeo, netMat);
    net.renderOrder = 2;
    this.group.add(net);

    // Gestell: Pfosten + Latte am Torlinien-Rahmen, Rückholme, dazu additiver Schein
    const solid = new Batch();
    const halo = new Batch();
    for (const s of [-1, 1]) {
      const team = s < 0 ? 0 : 1;
      const c = new THREE.Color(TEAM_COLORS[team]);
      const hc = c.clone().multiplyScalar(0.4);
      const zf = s * L;
      const zb = s * (L + D);
      const zm = s * (L + D / 2);
      const bar = (
        x: number,
        y: number,
        z: number,
        sx: number,
        sy: number,
        sz: number,
        thick: number,
      ): void => {
        solid.box(x, y, z, sx, sy, sz, c);
        halo.box(x, y, z, sx + thick, sy + thick, sz + thick, hc);
      };
      // Rahmen am Spielfeldrand
      bar(-GW, GH / 2, zf, 0.4, GH + 0.4, 0.6, 0.7);
      bar(GW, GH / 2, zf, 0.4, GH + 0.4, 0.6, 0.7);
      bar(0, GH, zf, 2 * GW + 0.4, 0.4, 0.6, 0.7);
      // Rückseite (dünner)
      bar(-GW, GH / 2, zb, 0.28, GH, 0.28, 0.45);
      bar(GW, GH / 2, zb, 0.28, GH, 0.28, 0.45);
      bar(0, GH, zb, 2 * GW, 0.28, 0.28, 0.45);
      bar(-GW, GH, zm, 0.28, 0.28, D, 0.45);
      bar(GW, GH, zm, 0.28, 0.28, D, 0.45);
    }
    const frameGeo = solid.build();
    const haloGeo = halo.build();
    this.geos.push(frameGeo, haloGeo);
    const frameMat = glowMaterial(u, 0, 1.15);
    const haloMat = glowMaterial(u, 2, 1, 0.28);
    this.mats.push(frameMat, haloMat);
    this.group.add(new THREE.Mesh(frameGeo, frameMat));
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.renderOrder = 4;
    this.group.add(haloMesh);

    // Anzeigetafeln über den Toren (hinter der Glaswand)
    this.canvas = document.createElement('canvas');
    this.canvas.width = 512;
    this.canvas.height = 128;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.tex = new THREE.CanvasTexture(this.canvas);
    this.tex.colorSpace = THREE.SRGBColorSpace;
    this.tex.anisotropy = 4;
    this.boardMat = new THREE.MeshBasicMaterial({ map: this.tex, toneMapped: false });
    this.mats.push(this.boardMat);
    const make = (s: 1 | -1): THREE.BufferGeometry => {
      const p = new THREE.PlaneGeometry(BOARD_W, BOARD_H);
      if (s > 0) p.rotateY(Math.PI);
      p.translate(0, 11.2, s * (L + 0.9));
      return p;
    };
    const boardGeo = mergeGeometries([make(1), make(-1)]);
    this.geos.push(boardGeo);
    this.group.add(new THREE.Mesh(boardGeo, this.boardMat));
    // Rahmen der Tafeln
    const fb = new Batch();
    for (const s of [-1, 1]) {
      const c = new THREE.Color(TEAM_COLORS[s < 0 ? 0 : 1]).multiplyScalar(1.3);
      const z = s * (L + 1.0);
      fb.box(0, 11.2 + BOARD_H / 2 + 0.15, z, BOARD_W + 0.8, 0.28, 0.5, c);
      fb.box(0, 11.2 - BOARD_H / 2 - 0.15, z, BOARD_W + 0.8, 0.28, 0.5, c);
      fb.box(-BOARD_W / 2 - 0.2, 11.2, z, 0.28, BOARD_H + 0.6, 0.5, c);
      fb.box(BOARD_W / 2 + 0.2, 11.2, z, 0.28, BOARD_H + 0.6, 0.5, c);
      // Träger zum Boden
      fb.box(-6, 5.5, s * (L + 1.5), 0.3, 11, 0.3, new THREE.Color(0.12, 0.13, 0.2));
      fb.box(6, 5.5, s * (L + 1.5), 0.3, 11, 0.3, new THREE.Color(0.12, 0.13, 0.2));
    }
    const fbGeo = fb.build();
    this.geos.push(fbGeo);
    const fbMat = glowMaterial(u, 0, 1);
    this.mats.push(fbMat);
    this.group.add(new THREE.Mesh(fbGeo, fbMat));
    this.drawBoard(0, 0, '5:00', '');
  }

  private drawBoard(s0: number, s1: number, center: string, sub: string): void {
    const g = this.ctx;
    const w = 512;
    const h = 128;
    const bg = g.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#0a0d1c');
    bg.addColorStop(1, '#04050c');
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    const c0 = '#' + new THREE.Color(TEAM_COLORS[0]).getHexString();
    const c1 = '#' + new THREE.Color(TEAM_COLORS[1]).getHexString();
    // Teamflächen
    const gl = g.createLinearGradient(0, 0, 190, 0);
    gl.addColorStop(0, c0 + '66');
    gl.addColorStop(1, c0 + '00');
    g.fillStyle = gl;
    g.fillRect(0, 0, 190, h);
    const gr = g.createLinearGradient(w, 0, w - 190, 0);
    gr.addColorStop(0, c1 + '66');
    gr.addColorStop(1, c1 + '00');
    g.fillStyle = gr;
    g.fillRect(w - 190, 0, 190, h);
    g.lineWidth = 6;
    g.strokeStyle = c0;
    g.beginPath();
    g.moveTo(0, 3);
    g.lineTo(w / 2 - 70, 3);
    g.moveTo(0, h - 3);
    g.lineTo(w / 2 - 70, h - 3);
    g.stroke();
    g.strokeStyle = c1;
    g.beginPath();
    g.moveTo(w, 3);
    g.lineTo(w / 2 + 70, 3);
    g.moveTo(w, h - 3);
    g.lineTo(w / 2 + 70, h - 3);
    g.stroke();
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.shadowBlur = 18;
    g.font = '800 18px "Segoe UI", Arial, sans-serif';
    g.shadowColor = c0;
    g.fillStyle = c0;
    g.fillText('FUNKEN', 92, 20);
    g.shadowColor = c1;
    g.fillStyle = c1;
    g.fillText('FROST', w - 92, 20);
    g.font = '900 78px "Arial Black", Impact, "Segoe UI", sans-serif';
    g.shadowColor = c0;
    g.fillStyle = '#ffffff';
    g.fillText(String(s0), 92, 78);
    g.shadowColor = c1;
    g.fillText(String(s1), w - 92, 78);
    g.shadowColor = '#ffffff';
    g.shadowBlur = 10;
    g.font = '800 46px "Segoe UI", Arial, sans-serif';
    g.fillStyle = '#e8ecff';
    g.fillText(center, w / 2, sub ? 52 : 64);
    if (sub) {
      g.font = '800 20px "Segoe UI", Arial, sans-serif';
      g.fillStyle = '#9fb0ff';
      g.fillText(sub, w / 2, 100);
    }
    g.shadowBlur = 0;
    this.tex.needsUpdate = true;
  }

  update(state: SimState): void {
    // Schlüssel aus Zahlen: nur bei Änderung wird neu gezeichnet (keine Allokation pro Bild)
    const secs = Math.max(0, Math.ceil(state.clock));
    const ph = state.phase === 'countdown' ? 1 : state.phase === 'goal' ? 2 : state.phase === 'ended' ? 3 : 0;
    const cd = ph === 1 ? Math.max(1, Math.ceil(state.phaseTimer)) : 0;
    const key =
      ((state.score[0] * 64 + state.score[1]) * 8 + ph) * 8 + cd + (state.overtime ? 0.5 : 0) + secs * 1e6;
    if (key === this.lastKey) return;
    this.lastKey = key;
    let center: string;
    let sub = '';
    if (ph === 1) {
      center = String(cd);
      sub = 'ANSTOSS';
    } else if (ph === 2) {
      center = 'TOR!';
    } else if (ph === 3) {
      center = 'ENDE';
    } else if (state.overtime) {
      center = 'GOLDEN GOAL';
    } else {
      center = Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0');
    }
    this.drawBoard(state.score[0], state.score[1], center, sub);
  }

  dispose(): void {
    this.tex.dispose();
    for (const g of this.geos) g.dispose();
    for (const m of this.mats) m.dispose();
    this.group.removeFromParent();
  }
}
