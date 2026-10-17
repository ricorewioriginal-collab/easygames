// Baut die zusammengeführte Geometrie eines Grundstücks: Böden, Wände (mit Öffnungen), automatische Dächer und Objekte.
// Reihenfolge in den Puffern: [Etage 0 | Etage 1 | Dach] → Sichtbarkeit je Etage per drawRange (1 Draw-Call je Puffer).
import * as THREE from 'three';
import type { LotDef } from '../data/lots';
import { getDef } from '../world/defs';
import { LEVELS, LEVEL_H, WALL_H, World, cellKey, dimsOf, edgeKey, type ObjInst, type Rot, type Wall } from '../world/world';
import { GeoBuf, col, hash2 } from './geo-builder';
import { OF_BROKEN, OF_OFF, OF_ON, emissiveOn, objectRaw, surfaceTop } from './object-mesh';
import { ROOF_COLORS, floorStyle, wallStyle } from './palette';

/** Oberkante der Bodenbeläge im Erdgeschoss (über dem Gelände) */
export const FLOOR_Y = 0.03;
export const WALL_T = 0.12;
export const LOW_WALL_H = 0.25;
const SLAB = LEVEL_H - WALL_H; // Deckenstärke zwischen den Etagen

/** Wandvariante: full = alle hoch; low = Wände der Etage `level` niedrig; cut = Schnittansicht für Etage `level` (cx/cz = Richtung Fokus→Kamera) */
export interface LotVariant {
  mode: 'full' | 'low' | 'cut';
  level: number;
  cx: number;
  cz: number;
}
export const FULL_VARIANT: LotVariant = { mode: 'full', level: 0, cx: 0, cz: 1 };

export interface PickBox {
  id: string;
  l: number;
  indoor: boolean;
  x0: number; y0: number; z0: number;
  x1: number; y1: number; z1: number;
  /** Transformation für Hervorhebung */
  px: number; py: number; pz: number; yaw: number;
}

export interface LotOut {
  shell: GeoBuf;
  indoor: GeoBuf;
  glass: GeoBuf;
  emis: GeoBuf;
  /** Vertex-Endmarken: shell [E0, E1, Dach], übrige [E0, E1] */
  shellMarks: number[];
  indoorMarks: number[];
  glassMarks: number[];
  emisMarks: number[];
  picks: PickBox[];
  /** Leuchtenpositionen x,y,z (für echte Punktlichter nahe dem Fokus) */
  lights: number[];
  topLevel: number;
  hasRoof: boolean;
}

export function makeLotOut(): LotOut {
  return {
    shell: new GeoBuf(32768), indoor: new GeoBuf(32768), glass: new GeoBuf(2048), emis: new GeoBuf(2048),
    shellMarks: [0, 0, 0], indoorMarks: [0, 0], glassMarks: [0, 0], emisMarks: [0, 0], picks: [], lights: [], topLevel: 0, hasRoof: false,
  };
}

const C_CAP = col('#e9e4da');
const C_CEIL = col('#f3efe8');
const C_SLAB = col('#ddd5c6');
const C_SOFFIT = col('#7a6656');
const C_FLATROOF = col('#8f8b84');
const C_PARAPET = col('#d6cfc2');
const _ca = new THREE.Color();
const _cb = new THREE.Color();

/** Öffnungs-Drehung: Achse aus dir, r ≥ 2 dreht um 180° (Vorderseite +z lokal) */
export function openingQuarter(o: ObjInst): number {
  return ((o.dir === 1 ? 1 : 0) + (o.r >= 2 ? 2 : 0)) % 4;
}
const COS = [1, 0, -1, 0];
const SIN = [0, 1, 0, -1];

export function objFlags(o: ObjInst): number {
  const s = o.st;
  if (!s) return 0;
  return (s.on ? OF_ON : 0) | (s.on === false ? OF_OFF : 0) | (s.broken ? OF_BROKEN : 0);
}

/** Weltposition (Mitte, Boden) und Viertel-Drehung eines Objekts */
export function objectPlacement(w: World, o: ObjInst): { x: number; y: number; z: number; q: number } {
  const def = getDef(o.def);
  const [cx, cz] = w.centerOf(o);
  let y = o.l * LEVEL_H + (o.l === 0 ? FLOOR_Y : 0);
  let q: number = o.r;
  let x = cx, z = cz;
  if (def.mount === 'opening') {
    q = openingQuarter(o);
    y = o.l * LEVEL_H;
  } else if (def.mount === 'surface') {
    const base = w.occ.get(cellKey(o.l, Math.floor(cx), Math.floor(cz)));
    const bo = base ? w.objs.get(base) : undefined;
    if (bo) y += surfaceTop(bo.def);
    else y += 0.75;
  } else if (def.mount === 'wall') {
    // Teile sitzen bei z = -0.5 (Kachelrand); um die halbe Wandstärke nach vorn schieben
    x += SIN[q]! * (WALL_T / 2);
    z += COS[q]! * (WALL_T / 2);
  }
  return { x, y, z, q };
}

/** Rotierte AABB einer lokalen Box (Viertel-Drehung q) */
function rotBox(min: number[], max: number[], q: number): [number, number, number, number] {
  switch (q) {
    case 1: return [min[2]!, max[2]!, -max[0]!, -min[0]!];
    case 2: return [-max[0]!, -min[0]!, -max[2]!, -min[2]!];
    case 3: return [-max[2]!, -min[2]!, min[0]!, max[0]!];
    default: return [min[0]!, max[0]!, min[2]!, max[2]!];
  }
}

// ---------- Hilfsraster ----------
class LotGrid {
  readonly x0: number; readonly z0: number; readonly w: number; readonly d: number;
  /** eingeschlossene Zellen je Etage (Index lokal) */
  enc: Uint8Array[] = [];
  constructor(readonly world: World, readonly lot: LotDef) {
    this.x0 = lot.x; this.z0 = lot.z; this.w = lot.w; this.d = lot.d;
    for (let l = 0; l < LEVELS; l++) this.enc.push(this.enclosure(l));
  }
  inLot(x: number, z: number): boolean {
    return x >= this.x0 && z >= this.z0 && x < this.x0 + this.w && z < this.z0 + this.d;
  }
  isEnc(l: number, x: number, z: number): boolean {
    return this.inLot(x, z) && this.enc[l]![(z - this.z0) * this.w + (x - this.x0)] === 1;
  }
  /** Flutfüllung vom Rand aus; nur feste Wände (k = 0) begrenzen Räume */
  private enclosure(l: number): Uint8Array {
    const W = this.w + 2, D = this.d + 2;
    const seen = new Uint8Array(W * D);
    const stack: number[] = [];
    for (let i = 0; i < W; i++) { stack.push(i, (D - 1) * W + i); }
    for (let j = 0; j < D; j++) { stack.push(j * W, j * W + W - 1); }
    for (const s of stack) seen[s] = 1;
    const walls = this.world.walls;
    const solid = (x: number, z: number, dir: 0 | 1): boolean => walls.get(edgeKey(l, x, z, dir))?.k === 0;
    while (stack.length) {
      const i = stack.pop()!;
      const gx = i % W, gz = (i - gx) / W;
      const x = gx - 1 + this.x0, z = gz - 1 + this.z0;
      // Nachbarn: Westen/Osten über senkrechte Kanten, Norden/Süden über waagerechte Kanten
      if (gx > 0 && !seen[i - 1] && !solid(x, z, 1)) { seen[i - 1] = 1; stack.push(i - 1); }
      if (gx < W - 1 && !seen[i + 1] && !solid(x + 1, z, 1)) { seen[i + 1] = 1; stack.push(i + 1); }
      if (gz > 0 && !seen[i - W] && !solid(x, z, 0)) { seen[i - W] = 1; stack.push(i - W); }
      if (gz < D - 1 && !seen[i + W] && !solid(x, z + 1, 0)) { seen[i + W] = 1; stack.push(i + W); }
    }
    const out = new Uint8Array(this.w * this.d);
    for (let z = 0; z < this.d; z++) for (let x = 0; x < this.w; x++) out[z * this.w + x] = seen[(z + 1) * W + x + 1] ? 0 : 1;
    return out;
  }
}

// ---------- Böden ----------
function floorCell(b: GeoBuf, x: number, z: number, y: number, style: number): void {
  const fs = floorStyle(style);
  const base = col(fs.c);
  const h = hash2(x * 7 + style, z * 13);
  switch (fs.pat) {
    case 'planks':
      for (let i = 0; i < 4; i++) {
        const v = 0.9 + 0.16 * hash2(x * 31 + i, z * 17 + style);
        b.colorC(base, v);
        const z0 = z + i * 0.25, z1 = z0 + 0.25;
        b.quad(x, y, z1, x + 1, y, z1, x + 1, y, z0, x, y, z0);
      }
      return;
    case 'tiles':
      for (let i = 0; i < 4; i++) {
        const sx = x + (i % 2) * 0.5, sz = z + (i >> 1) * 0.5;
        b.colorC(base, ((i + (i >> 1)) % 2 ? 0.95 : 1.02) * (0.98 + 0.04 * h));
        b.quad(sx, y, sz + 0.5, sx + 0.5, y, sz + 0.5, sx + 0.5, y, sz, sx, y, sz);
      }
      return;
    case 'checker': {
      const c = (x + z) % 2 === 0 ? base : col(fs.c2 ?? '#444444');
      b.colorC(c);
      break;
    }
    case 'stone':
      b.colorC(base, 0.86 + 0.22 * h);
      break;
    case 'carpet':
      b.colorC(base, 0.99);
      break;
    default:
      b.colorC(base, 0.96 + 0.06 * h);
  }
  b.quad(x, y, z + 1, x + 1, y, z + 1, x + 1, y, z, x, y, z);
}

// ---------- Wände ----------
interface Gap { u0: number; u1: number; v0: number; v1: number }

/** skip0/skip1: Endkappe am Anfang/Ende weglassen (gerade fortgesetzte Wand gleicher Höhe → sonst Pixelnaht) */
function wallPieces(
  b: GeoBuf, x: number, z: number, dir: 0 | 1, y0: number, h: number, s0: number, s1: number, gap: Gap | null,
  ca: THREE.Color, cb: THREE.Color, skip0: boolean, skip1: boolean,
): void {
  const t = WALL_T / 2;
  const piece = (u0: number, u1: number, v0: number, v1: number): void => {
    if (u1 - u0 < 0.005 || v1 - v0 < 0.005) return;
    const yy0 = y0 + v0, yy1 = y0 + v1;
    const full = v0 < 0.01 && v1 >= h - 0.01;
    const c0 = full && skip0 && u0 <= s0 + 1e-4 ? null : C_CAP;
    const c1 = full && skip1 && u1 >= s1 - 1e-4 ? null : C_CAP;
    b.ao = v0 < 0.01 ? 0.8 : 1;
    if (dir === 0) b.box(x + u0, yy0, z - t, x + u1, yy1, z + t, { nz: ca, pz: cb, top: C_CAP, nx: c0, px: c1, skipBottom: v0 < 0.01 });
    else b.box(x - t, yy0, z + u0, x + t, yy1, z + u1, { nx: ca, px: cb, top: C_CAP, nz: c0, pz: c1, skipBottom: v0 < 0.01 });
    b.ao = 1;
  };
  if (!gap) {
    piece(s0, s1, 0, h);
    return;
  }
  piece(s0, gap.u0, 0, h);
  piece(gap.u1, s1, 0, h);
  piece(gap.u0, gap.u1, 0, gap.v0);
  piece(gap.u0, gap.u1, gap.v1, h);
}

function fencePieces(b: GeoBuf, x: number, z: number, dir: 0 | 1, y0: number, c: THREE.Color, half: boolean): void {
  const at = (u0: number, u1: number, v0: number, v1: number, th: number): void => {
    if (dir === 0) b.box(x + u0, y0 + v0, z - th, x + u1, y0 + v1, z + th, { skipBottom: v0 < 0.01 });
    else b.box(x - th, y0 + v0, z + u0, x + th, y0 + v1, z + u1, { skipBottom: v0 < 0.01 });
  };
  b.colorC(c);
  if (half) {
    // halbe Wand / Geländer: massiv, 1 m hoch, mit heller Abdeckung
    b.ao = 0.85;
    at(0, 1, 0, 0.95, 0.06);
    b.ao = 1;
    b.colorC(C_CAP);
    at(-0.02, 1.02, 0.95, 1.02, 0.08);
    return;
  }
  // Lattenzaun: Pfosten, zwei Riegel, drei Latten
  at(-0.05, 0.05, 0, 1.05, 0.05);
  b.colorC(c, 0.92);
  at(0.05, 0.95, 0.25, 0.32, 0.025);
  at(0.05, 0.95, 0.68, 0.75, 0.025);
  b.colorC(c);
  for (const u of [0.2, 0.5, 0.8]) at(u - 0.05, u + 0.05, 0.05, 0.92, 0.03);
}

// ---------- Dächer ----------
interface Rect { x0: number; z0: number; x1: number; z1: number }

/** größtes Rechteck in einer Maske (Histogramm-Verfahren) */
function maxRect(mask: Uint8Array, w: number, d: number): Rect | null {
  const hgt = new Int32Array(w);
  let best = 0, br: Rect | null = null;
  for (let z = 0; z < d; z++) {
    for (let x = 0; x < w; x++) hgt[x] = mask[z * w + x] ? hgt[x]! + 1 : 0;
    for (let x = 0; x < w; x++) {
      if (!hgt[x]) continue;
      let mh = hgt[x]!;
      for (let x2 = x; x2 < w && hgt[x2]; x2++) {
        mh = Math.min(mh, hgt[x2]!);
        const a = mh * (x2 - x + 1);
        // leicht quadratische Rechtecke bevorzugen (schönere Dächer)
        const score = a - 0.01 * Math.abs(mh - (x2 - x + 1));
        if (score > best) {
          best = score;
          br = { x0: x, z0: z - mh + 1, x1: x2 + 1, z1: z + 1 };
        }
      }
    }
  }
  return br;
}

function slab(b: GeoBuf, pts: number[], th: number, top: THREE.Color, under: THREE.Color, edge: THREE.Color): void {
  // pts: 4 Ecken (x,y,z) gegen den Uhrzeigersinn von oben
  const [ax, ay, az, bx, by, bz, cx, cy, cz, dx, dy, dz] = pts as [number, number, number, number, number, number, number, number, number, number, number, number];
  b.colorC(top);
  b.quad(ax, ay, az, bx, by, bz, cx, cy, cz, dx, dy, dz);
  b.colorC(under);
  b.quad(dx, dy - th, dz, cx, cy - th, cz, bx, by - th, bz, ax, ay - th, az);
  b.colorC(edge);
  const P = [ax, ay, az, bx, by, bz, cx, cy, cz, dx, dy, dz];
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4;
    const px = P[i * 3]!, py = P[i * 3 + 1]!, pz = P[i * 3 + 2]!, qx = P[j * 3]!, qy = P[j * 3 + 1]!, qz = P[j * 3 + 2]!;
    b.quad(px, py - th, pz, qx, qy - th, qz, qx, qy, qz, px, py, pz);
  }
}

function buildRoofs(b: GeoBuf, g: LotGrid, lot: LotDef): boolean {
  const w = g.w, d = g.d, world = g.world;
  const roofSet = ROOF_COLORS[lot.district] ?? ROOF_COLORS.sonnenhain!;
  const rc = col(roofSet[Math.floor(hash2(lot.x, lot.z) * roofSet.length) % roofSet.length]!);
  let any = false;
  for (let lev = LEVELS - 1; lev >= 0; lev--) {
    const mask = new Uint8Array(w * d);
    let n = 0;
    for (let z = 0; z < d; z++)
      for (let x = 0; x < w; x++) {
        const wx = x + g.x0, wz = z + g.z0;
        if (!g.enc[lev]![z * w + x]) continue;
        // höhere Etage mit Boden oder Raum darüber → kein Dach auf dieser Etage
        let covered = false;
        for (let l2 = lev + 1; l2 < LEVELS; l2++) if (g.enc[l2]![z * w + x] || world.floors.has(cellKey(l2, wx, wz))) covered = true;
        if (covered) continue;
        mask[z * w + x] = 1;
        n++;
      }
    if (!n) continue;
    any = true;
    const baseY = lev * LEVEL_H + WALL_H;
    const flat = new Uint8Array(w * d);
    let guard = 0;
    let chimney = lot.kind === 'home';
    while (guard++ < 64) {
      const r = maxRect(mask, w, d);
      if (!r) break;
      const rw = r.x1 - r.x0, rd = r.z1 - r.z0;
      for (let z = r.z0; z < r.z1; z++) for (let x = r.x0; x < r.x1; x++) mask[z * w + x] = 0;
      const span = Math.min(rw, rd);
      if (span >= 2 && span <= 12 && rw * rd >= 4) {
        gable(b, g, r.x0 + g.x0, r.z0 + g.z0, r.x1 + g.x0, r.z1 + g.z0, baseY, lev, rc, chimney);
        chimney = false;
      } else for (let z = r.z0; z < r.z1; z++) for (let x = r.x0; x < r.x1; x++) flat[z * w + x] = 1;
    }
    // Flachdach mit Attika für Restflächen
    for (let z = 0; z < d; z++)
      for (let x = 0; x < w; x++) {
        if (!flat[z * w + x]) continue;
        const wx = x + g.x0, wz = z + g.z0, y = baseY + 0.12;
        b.colorC(C_FLATROOF, 0.95 + 0.08 * hash2(wx, wz));
        b.quad(wx, y, wz + 1, wx + 1, y, wz + 1, wx + 1, y, wz, wx, y, wz);
        const isF = (xx: number, zz: number): boolean => xx >= 0 && zz >= 0 && xx < w && zz < d && flat[zz * w + xx] === 1;
        b.colorC(C_PARAPET);
        const T = 0.14, H = 0.5;
        if (!isF(x, z - 1)) b.box(wx - 0.02, baseY - 0.1, wz - 0.08, wx + 1.02, baseY + H, wz - 0.08 + T);
        if (!isF(x, z + 1)) b.box(wx - 0.02, baseY - 0.1, wz + 1.08 - T, wx + 1.02, baseY + H, wz + 1.08);
        if (!isF(x - 1, z)) b.box(wx - 0.08, baseY - 0.1, wz - 0.02, wx - 0.08 + T, baseY + H, wz + 1.02);
        if (!isF(x + 1, z)) b.box(wx + 1.08 - T, baseY - 0.1, wz - 0.02, wx + 1.08, baseY + H, wz + 1.02);
        // Deckel zwischen Wandoberkante und Dachfläche (verhindert Lichtspalt)
        b.colorC(C_SLAB);
        b.box(wx, baseY, wz, wx + 1, baseY + 0.11, wz + 1, { skipBottom: false });
      }
  }
  return any;
}

function gable(b: GeoBuf, g: LotGrid, x0: number, z0: number, x1: number, z1: number, base: number, lev: number, rc: THREE.Color, chimney: boolean): void {
  const alongX = x1 - x0 >= z1 - z0;
  const o = 0.32, th = 0.14;
  const span = alongX ? z1 - z0 : x1 - x0;
  const half = span / 2;
  const rise = Math.min(half * 0.62, 3.2);
  const slope = rise / half;
  const wallTop = base;
  base += 0.04 + (WALL_T / 2) * slope; // Dachfläche liegt über der Wandkrone
  const ye = base - o * slope, yr = base + rise;
  const gableColor = (x: number, z: number, dir: 0 | 1, sideA: boolean): THREE.Color => {
    const wl = g.world.walls.get(edgeKey(lev, x, z, dir));
    return wl ? col(wallStyle(sideA ? wl.a : wl.b).c) : col('#efe6d6');
  };
  const top = _ca.copy(rc);
  const edge = _cb.copy(rc).multiplyScalar(0.7);
  if (alongX) {
    const zc = (z0 + z1) / 2;
    slab(b, [x1 + o, ye, z0 - o, x0 - o, ye, z0 - o, x0 - o, yr, zc, x1 + o, yr, zc], th, top.clone().multiplyScalar(0.9), C_SOFFIT, edge);
    slab(b, [x0 - o, ye, z1 + o, x1 + o, ye, z1 + o, x1 + o, yr, zc, x0 - o, yr, zc], th, top, C_SOFFIT, edge);
    // Giebeldreiecke
    const zm = Math.floor(zc);
    b.colorC(gableColor(x0, zm, 1, true), 0.95);
    b.tri(x0, wallTop, z0, x0, wallTop, z1, x0, yr - th, zc);
    b.colorC(gableColor(x1, zm, 1, false), 0.95);
    b.tri(x1, wallTop, z0, x1, yr - th, zc, x1, wallTop, z1);
    // First
    b.colorC(rc, 0.75);
    b.box(x0 - o, yr - 0.04, zc - 0.09, x1 + o, yr + 0.08, zc + 0.09);
    if (chimney && x1 - x0 >= 3) {
      const cx = x0 + (x1 - x0) * 0.72, cz = zc + half * 0.45;
      b.colorC(col('#9a5444'));
      b.box(cx - 0.28, base + rise * 0.3, cz - 0.28, cx + 0.28, yr + 0.7, cz + 0.28);
      b.colorC(col('#5a4a44'));
      b.box(cx - 0.33, yr + 0.7, cz - 0.33, cx + 0.33, yr + 0.82, cz + 0.33);
    }
  } else {
    const xc = (x0 + x1) / 2;
    slab(b, [x0 - o, ye, z0 - o, x0 - o, ye, z1 + o, xc, yr, z1 + o, xc, yr, z0 - o], th, top.clone().multiplyScalar(0.9), C_SOFFIT, edge);
    slab(b, [x1 + o, ye, z1 + o, x1 + o, ye, z0 - o, xc, yr, z0 - o, xc, yr, z1 + o], th, top, C_SOFFIT, edge);
    const xm = Math.floor(xc);
    b.colorC(gableColor(xm, z0, 0, true), 0.95);
    b.tri(x0, wallTop, z0, xc, yr - th, z0, x1, wallTop, z0);
    b.colorC(gableColor(xm, z1, 0, false), 0.95);
    b.tri(x0, wallTop, z1, x1, wallTop, z1, xc, yr - th, z1);
    b.colorC(rc, 0.75);
    b.box(xc - 0.09, yr - 0.04, z0 - o, xc + 0.09, yr + 0.08, z1 + o);
    if (chimney && z1 - z0 >= 3) {
      const cz = z0 + (z1 - z0) * 0.3, cx = xc + half * 0.45;
      b.colorC(col('#9a5444'));
      b.box(cx - 0.28, base + rise * 0.3, cz - 0.28, cx + 0.28, yr + 0.7, cz + 0.28);
      b.colorC(col('#5a4a44'));
      b.box(cx - 0.33, yr + 0.7, cz - 0.33, cx + 0.33, yr + 0.82, cz + 0.33);
    }
  }
}

// ---------- Hauptfunktion ----------
export function buildLot(world: World, lot: LotDef, objs: ObjInst[], variant: LotVariant, out: LotOut): void {
  const { shell, indoor, glass, emis } = out;
  shell.clear(); indoor.clear(); glass.clear(); emis.clear();
  out.picks.length = 0;
  out.lights.length = 0;
  const g = new LotGrid(world, lot);
  const x0 = lot.x, z0 = lot.z, x1 = lot.x + lot.w, z1 = lot.z + lot.d;

  // Treppenaugen im Obergeschoss
  const stairHole = new Set<number>();
  for (const o of objs) {
    const def = getDef(o.def);
    if (!def.func?.includes('stairs')) continue;
    for (const [cx, cz] of world.cellsOf(o)) stairHole.add(cellKey(o.l + 1, cx, cz));
  }

  let topLevel = 0;

  // Objekte nach Etage sortieren
  const byLevel: ObjInst[][] = [];
  for (let l = 0; l < LEVELS; l++) byLevel.push([]);
  for (const o of objs) if (o.l >= 0 && o.l < LEVELS) byLevel[o.l]!.push(o);

  const lowered = (l: number, x: number, z: number, dir: 0 | 1, wl: Wall): boolean => {
    if (variant.mode === 'full' || l !== variant.level || wl.k !== 0) return false;
    if (variant.mode === 'low') return true;
    if (dir === 0) {
      if (Math.abs(variant.cz) < 0.3) return false;
      return variant.cz > 0 ? g.isEnc(l, x, z - 1) : g.isEnc(l, x, z);
    }
    if (Math.abs(variant.cx) < 0.3) return false;
    return variant.cx > 0 ? g.isEnc(l, x - 1, z) : g.isEnc(l, x, z);
  };

  const placeObj = (o: ObjInst, isIndoor: boolean): void => {
    const def = getDef(o.def);
    const flags = objFlags(o);
    const raw = objectRaw(o.def, o.ca ?? 0, o.cb ?? 0, flags);
    const pl = objectPlacement(world, o);
    const c = COS[pl.q]!, s = SIN[pl.q]!;
    (isIndoor ? indoor : shell).appendRaw(raw.solid, c, s, pl.x, pl.y, pl.z);
    glass.appendRaw(raw.glass, c, s, pl.x, pl.y, pl.z);
    emis.appendRaw(raw.emis, c, s, pl.x, pl.y, pl.z);
    const [bx0, bx1, bz0, bz1] = rotBox(raw.min, raw.max, pl.q);
    out.picks.push({
      id: o.id, l: o.l, indoor: isIndoor,
      x0: pl.x + bx0, x1: pl.x + bx1, z0: pl.z + bz0, z1: pl.z + bz1, y0: pl.y + raw.min[1], y1: pl.y + raw.max[1],
      px: pl.x, py: pl.y, pz: pl.z, yaw: (pl.q * Math.PI) / 2,
    });
    if (def.light && emissiveOn(def, flags)) out.lights.push(pl.x, pl.y + Math.min(raw.max[1], 2.4) * 0.85, pl.z);
  };

  for (let l = 0; l < LEVELS; l++) {
    const baseY = l * LEVEL_H;
    // --- Böden ---
    for (let z = z0; z < z1; z++)
      for (let x = x0; x < x1; x++) {
        const k = cellKey(l, x, z);
        if (stairHole.has(k)) continue;
        let st = world.floors.get(k);
        if (st === undefined && l === 0 && g.isEnc(0, x, z)) st = 1; // eingeschlossene Räume ohne Belag: Parkett
        if (st === undefined) continue;
        if (l === 0) floorCell(shell, x, z, FLOOR_Y, st);
        else {
          floorCell(shell, x, z, baseY, st);
          // Decke darunter + Kanten
          shell.colorC(C_CEIL);
          shell.quad(x, baseY - SLAB, z, x + 1, baseY - SLAB, z, x + 1, baseY - SLAB, z + 1, x, baseY - SLAB, z + 1);
          shell.colorC(C_SLAB);
          const has = (xx: number, zz: number): boolean => world.floors.has(cellKey(l, xx, zz)) && !stairHole.has(cellKey(l, xx, zz));
          const yb = baseY - SLAB, yt = baseY;
          if (!has(x, z - 1)) shell.quad(x + 1, yb, z, x, yb, z, x, yt, z, x + 1, yt, z);
          if (!has(x, z + 1)) shell.quad(x, yb, z + 1, x + 1, yb, z + 1, x + 1, yt, z + 1, x, yt, z + 1);
          if (!has(x - 1, z)) shell.quad(x, yb, z, x, yb, z + 1, x, yt, z + 1, x, yt, z);
          if (!has(x + 1, z)) shell.quad(x + 1, yb, z + 1, x + 1, yb, z, x + 1, yt, z, x + 1, yt, z + 1);
        }
      }

    // --- Wände ---
    const drawnOpen = new Set<string>();
    const lowEdges = new Set<number>();
    for (let z = z0; z <= z1; z++)
      for (let x = x0; x <= x1; x++)
        for (const dir of [0, 1] as const) {
          const k = edgeKey(l, x, z, dir);
          const wl = world.walls.get(k);
          if (!wl) continue;
          const low = lowered(l, x, z, dir, wl);
          if (low) lowEdges.add(k);
          if (wl.k !== 0) {
            fencePieces(shell, x, z, dir, baseY, col(wallStyle(wl.a).c), wl.k === 2);
            continue;
          }
          // Verlängerung/Kürzung an Ecken (saubere Stöße ohne Z-Fighting)
          const wallAt = (xx: number, zz: number, dd: 0 | 1): boolean => world.walls.get(edgeKey(l, xx, zz, dd))?.k === 0;
          let s0 = 0, s1 = 1;
          if (dir === 0) {
            if ((wallAt(x, z - 1, 1) || wallAt(x, z, 1)) && !wallAt(x - 1, z, 0)) s0 = -WALL_T / 2;
            if ((wallAt(x + 1, z - 1, 1) || wallAt(x + 1, z, 1)) && !wallAt(x + 1, z, 0)) s1 = 1 + WALL_T / 2;
          } else {
            if (wallAt(x - 1, z, 0) || wallAt(x, z, 0)) s0 = WALL_T / 2;
            if (wallAt(x - 1, z + 1, 0) || wallAt(x, z + 1, 0)) s1 = 1 - WALL_T / 2;
          }
          const ca = _ca.copy(col(wallStyle(wl.a).c));
          const cb = _cb.copy(col(wallStyle(wl.b).c));
          let gap: Gap | null = null;
          const opId = low ? undefined : world.openings.get(k);
          const op = opId ? world.objs.get(opId) : undefined;
          if (op) {
            const raw = objectRaw(op.def, op.ca ?? 0, op.cb ?? 0, objFlags(op));
            const half = Math.min(getDef(op.def).w / 2, Math.max(Math.abs(raw.min[0]), Math.abs(raw.max[0])));
            const [ocx, ocz] = world.centerOf(op);
            const c = dir === 0 ? ocx - x : ocz - z;
            gap = { u0: Math.max(s0, c - half), u1: Math.min(s1, c + half), v0: Math.max(0, raw.min[1]), v1: Math.min(WALL_H, raw.max[1]) };
            if (gap.v0 < 0.05) gap.v0 = 0;
            if (!drawnOpen.has(op.id)) {
              drawnOpen.add(op.id);
              placeObj(op, false);
            }
          }
          // gerade Fortsetzung ohne Öffnung und mit gleicher Höhe → keine Endkappe
          const cont = (xx: number, zz: number): boolean => {
            const k2 = edgeKey(l, xx, zz, dir);
            const w2 = world.walls.get(k2);
            if (!w2 || w2.k !== 0) return false;
            const low2 = lowered(l, xx, zz, dir, w2);
            return low2 === low && (low2 || !world.openings.has(k2));
          };
          const skip0 = !gap && (dir === 0 ? cont(x - 1, z) : cont(x, z - 1));
          const skip1 = !gap && (dir === 0 ? cont(x + 1, z) : cont(x, z + 1));
          wallPieces(shell, x, z, dir, baseY, low ? LOW_WALL_H : WALL_H, s0, s1, gap, ca, cb, skip0, skip1);
        }

    // --- Objekte ---
    for (const o of byLevel[l]!) {
      const def = getDef(o.def);
      if (def.mount === 'opening') {
        // Öffnungen ohne Wand (sollte nicht vorkommen) trotzdem zeigen, auf niedrigen Wänden ausblenden
        if (drawnOpen.has(o.id)) continue;
        const k = edgeKey(o.l, o.x, o.z, o.dir ?? 0);
        if (lowEdges.has(k) || world.walls.has(k)) continue;
        placeObj(o, false);
        continue;
      }
      if (def.mount === 'wall') {
        let hidden = false;
        for (const [cx, cz] of world.cellsOf(o)) {
          const e = world.backEdge(cx, cz, o.r as Rot);
          if (lowEdges.has(edgeKey(o.l, e[0], e[1], e[2]))) hidden = true;
        }
        if (hidden) continue;
      }
      const [w, d] = dimsOf(def, o.r);
      const ccx = Math.floor(o.x + w / 2 - 0.01), ccz = Math.floor(o.z + d / 2 - 0.01);
      placeObj(o, g.isEnc(l, ccx, ccz));
    }
    out.shellMarks[l] = shell.v;
    out.indoorMarks[l] = indoor.v;
    out.glassMarks[l] = glass.v;
    out.emisMarks[l] = emis.v;
    if (l > 0 && (byLevel[l]!.length || out.shellMarks[l]! > out.shellMarks[l - 1]!)) topLevel = Math.max(topLevel, l);
  }
  out.hasRoof = buildRoofs(shell, g, lot);
  out.shellMarks[LEVELS] = shell.v;
  out.topLevel = topLevel;
}
