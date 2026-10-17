// Prozedurale Außenmodelle aller Fahrzeuge (eigene Entwürfe, keine Fremd-Logos/-Designs).
//
// Koordinaten (gilt für alle Modelle dieser Datei und für cab.ts):
//   +x = Fahrzeugfront (Ende „vorn“), +y = oben, z = quer.
//   y = 0 ist Schienenoberkante, Ursprung = Fahrzeugmitte.
//   Blick des Tf in +x-Richtung mit +y oben ⇒ RECHTS = +z, LINKS = −z (Rechtssystem).
//   doorL wirkt auf die Türen der −z-Seite, doorR auf die der +z-Seite.
//
// Ressourcen: Geometrien/Materialien/Texturen werden modulweit pro Fahrzeugtyp + Qualität
// zwischengespeichert und von allen Instanzen geteilt. Statische Teile werden je Material
// zu einem Mesh verschmolzen (wenige Draw-Calls). update() alloziert nichts.
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { VehicleType } from '../../trains/stock';
import type { CargoType } from '../../railway/schema';

export type Quality = 'low' | 'medium' | 'high';
export interface VehicleAnim {
  wheelAngle: number;
  panto: number;
  doorL: number; doorR: number;
  frontLights: 0 | 1 | 2 | 3; // 3 = rote Schlusslichter am +x-Ende (gedrehtes Zugende)
  rearLights: 0 | 1 | 2;
  cabLight: boolean;
  load: number;
  cargo: CargoType | null;
  smoke: number;
  speed: number;
}
export interface VehicleModel {
  group: THREE.Group;
  bogies: THREE.Object3D[];
  update(a: VehicleAnim): void;
  dispose(): void;
}

/**
 * Bezugsradius für VehicleAnim.wheelAngle: Der Renderer akkumuliert wheelAngle = Weg / wheelRadius(type).
 * Räder mit anderem Radius (Laufräder der Dampflok usw.) werden intern umgerechnet.
 */
export function wheelRadius(type: VehicleType): number {
  switch (type.body) {
    case 'steam': return 1.0;
    case 'tram': return 0.3;
    case 'eloco': case 'dloco': case 'shunter': return 0.5;
    default: return 0.46;
  }
}

// ------------------------------------------------------------------ Grundlagen / Caches
type V3 = [number, number, number];
interface Part { geo: THREE.BufferGeometry; mat: THREE.Material }
interface St { x: number; w: number; yb: number; yt: number; rt: number; rb: number; tw?: number }
type Prof = Omit<St, 'x'>;
interface UVM { x0: number; x1: number; y0: number; y1: number }

const MATS = new Map<string, THREE.Material>();
const TEXS = new Map<string, THREE.Texture | null>();
const GEOS = new Map<string, THREE.BufferGeometry>();
const PARTS = new Map<string, Part[]>();
const TPLS = new Map<string, Tpl>();

const SEG: Record<Quality, number> = { low: 8, medium: 12, high: 18 };
const SEGS: Record<Quality, number> = { low: 6, medium: 8, high: 12 };
const CM: Record<Quality, number> = { low: 3, medium: 4, high: 6 };
const NN: Record<Quality, number> = { low: 4, medium: 7, high: 11 };
const TEXW: Record<Quality, number> = { low: 512, medium: 1024, high: 2048 };
const FTW: Record<Quality, number> = { low: 128, medium: 256, high: 256 };
const CAPW = 1.6;
const GAUGE_Z = 0.7525;
const GLASS = '#1c2833';

function makeCanvas(w: number, h: number): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  try {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    return c.getContext('2d') ? c : null;
  } catch { return null; }
}
function canvasTex(key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void): THREE.Texture | null {
  if (TEXS.has(key)) return TEXS.get(key) ?? null;
  const c = makeCanvas(w, h);
  let t: THREE.CanvasTexture | null = null;
  if (c) {
    draw(c.getContext('2d')!);
    t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  }
  TEXS.set(key, t);
  return t;
}
interface MO { color?: number; map?: THREE.Texture | null; rough?: number; metal?: number; emissive?: number; ei?: number; transparent?: boolean; opacity?: number; side?: THREE.Side; depthWrite?: boolean }
function mat(q: Quality, key: string, o: MO): THREE.Material {
  const k = (q === 'low' ? 'L|' : 'S|') + key;
  let m = MATS.get(k);
  if (m) return m;
  const base = {
    color: o.color ?? 0xffffff, map: o.map ?? null, emissive: o.emissive ?? 0, emissiveIntensity: o.ei ?? 1,
    transparent: !!o.transparent, opacity: o.opacity ?? 1, side: o.side ?? THREE.FrontSide, depthWrite: o.depthWrite ?? true,
  };
  m = q === 'low' ? new THREE.MeshLambertMaterial(base) : new THREE.MeshStandardMaterial({ ...base, roughness: o.rough ?? 0.6, metalness: o.metal ?? 0.1 });
  MATS.set(k, m);
  return m;
}
function paint(q: Quality, c: number, rough = 0.45, metal = 0.15): THREE.Material { return mat(q, `p|${c}|${rough}|${metal}`, { color: c, rough, metal }); }
const css = (c: number) => '#' + (c & 0xffffff).toString(16).padStart(6, '0');
function shade(c: number, f: number): number {
  const r = Math.min(255, ((c >> 16) & 255) * f), g = Math.min(255, ((c >> 8) & 255) * f), b = Math.min(255, (c & 255) * f);
  return (r << 16) | (g << 8) | b;
}
function lampMats(q: Quality) {
  return {
    off: mat(q, 'lamp|off', { color: 0x2a2c30, rough: 0.2, metal: 0.3 }),
    head: mat(q, 'lamp|head', { color: 0xffffff, emissive: 0xfff2d8, ei: 1.6, rough: 0.2 }),
    high: mat(q, 'lamp|high', { color: 0xffffff, emissive: 0xffffff, ei: 4, rough: 0.2 }),
    tail: mat(q, 'lamp|tail', { color: 0xff3020, emissive: 0xff1a0a, ei: 2.2, rough: 0.2 }),
  };
}
function unitPlane(): THREE.BufferGeometry {
  let g = GEOS.get('plane');
  if (!g) { g = new THREE.PlaneGeometry(1, 1); GEOS.set('plane', g); }
  return g;
}
function unitBox(): THREE.BufferGeometry {
  let g = GEOS.get('unit');
  if (!g) { g = new THREE.BoxGeometry(1, 1, 1); GEOS.set('unit', g); }
  return g;
}

const _m4 = new THREE.Matrix4(), _q4 = new THREE.Quaternion(), _eu = new THREE.Euler(), _va = new THREE.Vector3(), _vb = new THREE.Vector3();
function place(g: THREE.BufferGeometry, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1): THREE.BufferGeometry {
  _eu.set(rx, ry, rz); _q4.setFromEuler(_eu);
  _m4.compose(_va.set(x, y, z), _q4, _vb.set(sx, sy, sz));
  g.applyMatrix4(_m4);
  return g;
}

/** Sammelt Geometrien je Material und verschmilzt sie. */
class Bld {
  map = new Map<THREE.Material, THREE.BufferGeometry[]>();
  add(m: THREE.Material, g: THREE.BufferGeometry) { let a = this.map.get(m); if (!a) this.map.set(m, (a = [])); a.push(g); }
  box(m: THREE.Material, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) {
    this.add(m, place(new THREE.BoxGeometry(Math.abs(x1 - x0) || 0.001, Math.abs(y1 - y0) || 0.001, Math.abs(z1 - z0) || 0.001), (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2));
  }
  boxc(m: THREE.Material, cx: number, cy: number, cz: number, sx: number, sy: number, sz: number, rz = 0, ry = 0, rx = 0) {
    this.add(m, place(new THREE.BoxGeometry(sx, sy, sz), cx, cy, cz, rx, ry, rz));
  }
  cyl(m: THREE.Material, ax: 'x' | 'y' | 'z', cx: number, cy: number, cz: number, r: number, len: number, seg: number, r2 = r) {
    const g = new THREE.CylinderGeometry(r2, r, len, seg, 1);
    place(g, cx, cy, cz, ax === 'z' ? Math.PI / 2 : 0, 0, ax === 'x' ? -Math.PI / 2 : 0);
    this.add(m, g);
  }
  sph(m: THREE.Material, cx: number, cy: number, cz: number, r: number, seg: number, sy = 1, half = false) {
    const g = new THREE.SphereGeometry(r, seg, Math.max(3, seg >> 1), 0, Math.PI * 2, 0, half ? Math.PI / 2 : Math.PI);
    place(g, cx, cy, cz, 0, 0, 0, 1, sy, 1);
    this.add(m, g);
  }
  done(): Part[] {
    const out: Part[] = [];
    for (const [m, arr] of this.map) {
      if (!arr.length) continue;
      const g = arr.length === 1 ? arr[0] : mergeGeometries(arr, false);
      if (!g) throw new Error('mergeGeometries fehlgeschlagen');
      if (arr.length > 1) for (const a of arr) a.dispose();
      g.computeBoundingSphere();
      out.push({ geo: g, mat: m });
    }
    this.map.clear();
    return out;
  }
}

// ------------------------------------------------------------------ Querschnitte / Loft
function radii(s: St): [number, number, number] {
  const tw = s.tw ?? 1, wt = s.w * tw, h = Math.max(0.02, s.yt - s.yb);
  const rb = Math.max(0.02, Math.min(s.rb, s.w, h / 2));
  const rt = Math.max(0.02, Math.min(s.rt, wt, h - rb));
  return [rt, rb, wt];
}
function prof(s: St, m: number, out: number[]) {
  const [rt, rb, wt] = radii(s);
  let i = 0;
  const corner = (cz: number, cy: number, r: number, a0: number) => {
    for (let k = 0; k < m; k++) {
      const a = a0 + (k / (m - 1)) * Math.PI / 2;
      out[i++] = cz + r * Math.cos(a); out[i++] = cy + r * Math.sin(a);
    }
  };
  corner(s.w - rb, s.yb + rb, rb, -Math.PI / 2);
  corner(wt - rt, s.yt - rt, rt, 0);
  corner(-(wt - rt), s.yt - rt, rt, Math.PI / 2);
  corner(-(s.w - rb), s.yb + rb, rb, Math.PI);
}
/** halbe Breite des Querschnitts in Höhe y (NaN außerhalb) */
function zAt(s: St, y: number): number {
  if (y < s.yb || y > s.yt) return NaN;
  const [rt, rb, wt] = radii(s);
  const y1 = s.yb + rb, y2 = s.yt - rt;
  if (y < y1) { const d = y1 - y; return s.w - rb + Math.sqrt(Math.max(0, rb * rb - d * d)); }
  if (y > y2) { const d = y - y2; return wt - rt + Math.sqrt(Math.max(0, rt * rt - d * d)); }
  return y2 > y1 ? s.w + (wt - s.w) * (y - y1) / (y2 - y1) : s.w;
}
/** x der Oberfläche am Fahrzeugende (+x) in Höhe y, Querlage z */
function surfX(sts: St[], y: number, z: number): number {
  const zz = (s: St) => { const v = zAt(s, y); return isNaN(v) ? -1 : v; };
  for (let i = sts.length - 1; i >= 0; i--) {
    const zi = zz(sts[i]);
    if (zi >= z) {
      if (i === sts.length - 1) return sts[i].x;
      const zn = zz(sts[i + 1]);
      const f = zi - zn > 1e-6 ? (zi - z) / (zi - zn) : 0;
      return sts[i].x + f * (sts[i + 1].x - sts[i].x);
    }
  }
  return sts[0].x;
}
function loftGeo(sts: St[], m: number, uv: UVM): THREE.BufferGeometry {
  const N = 4 * m, S = sts.length, tmp: number[] = new Array(N * 2);
  const pos = new Float32Array(S * N * 3), uvs = new Float32Array(S * N * 2);
  for (let i = 0; i < S; i++) {
    prof(sts[i], m, tmp);
    for (let j = 0; j < N; j++) {
      const o = i * N + j;
      pos[o * 3] = sts[i].x; pos[o * 3 + 1] = tmp[j * 2 + 1]; pos[o * 3 + 2] = tmp[j * 2];
      uvs[o * 2] = (sts[i].x - uv.x0) / (uv.x1 - uv.x0); uvs[o * 2 + 1] = (tmp[j * 2 + 1] - uv.y0) / (uv.y1 - uv.y0);
    }
  }
  const idx: number[] = [];
  for (let i = 0; i < S - 1; i++) for (let j = 0; j < N; j++) {
    const a = i * N + j, b = i * N + ((j + 1) % N), c = (i + 1) * N + j, d = (i + 1) * N + ((j + 1) % N);
    idx.push(a, c, b, b, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}
function capGeo(s: St, m: number, dir: 1 | -1, uv: UVM): THREE.BufferGeometry {
  const N = 4 * m, tmp: number[] = new Array(N * 2);
  prof(s, m, tmp);
  const pos = new Float32Array((N + 1) * 3), nor = new Float32Array((N + 1) * 3), uvs = new Float32Array((N + 1) * 2);
  const cy = (s.yb + s.yt) / 2;
  const setV = (i: number, y: number, z: number) => {
    pos[i * 3] = s.x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z; nor[i * 3] = dir;
    uvs[i * 2] = dir > 0 ? (CAPW - z) / (2 * CAPW) : (z + CAPW) / (2 * CAPW);
    uvs[i * 2 + 1] = (y - uv.y0) / (uv.y1 - uv.y0);
  };
  setV(0, cy, 0);
  for (let j = 0; j < N; j++) setV(j + 1, tmp[j * 2 + 1], tmp[j * 2]);
  const idx: number[] = [];
  for (let j = 0; j < N; j++) {
    const a = j + 1, b = ((j + 1) % N) + 1;
    if (dir > 0) idx.push(0, b, a); else idx.push(0, a, b);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  g.setIndex(idx);
  return g;
}
/** Leuchtband entlang der Seitenkontur (folgt Bug-Verjüngung) */
function ribbonGeo(sts: St[], y: number, h: number, side: 1 | -1): THREE.BufferGeometry {
  const pos: number[] = [], nor: number[] = [], uvs: number[] = [], idx: number[] = [];
  let prev = -1;
  for (const s of sts) {
    const z1 = zAt(s, y - h / 2), z2 = zAt(s, y + h / 2);
    if (isNaN(z1) || isNaN(z2)) { prev = -1; continue; }
    const v = pos.length / 3;
    pos.push(s.x, y - h / 2, side * (z1 + 0.012), s.x, y + h / 2, side * (z2 + 0.012));
    nor.push(0, 0, side, 0, 0, side); uvs.push(0, 0, 0, 1);
    if (prev >= 0) {
      const a = prev, b = prev + 1, c = v, d = v + 1;
      if (side > 0) idx.push(a, c, b, b, c, d); else idx.push(a, b, c, b, d, c);
    }
    prev = v;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(idx);
  return g;
}
const S = (x: number, P: Prof, o: Partial<Prof> = {}): St => ({ ...P, ...o, x });
const mir = (sts: St[]): St[] => sts.map((s) => ({ ...s, x: -s.x })).reverse();
function endFlat(xe: number, P: Prof): St[] {
  return [S(xe - 0.25, P), S(xe, P, { w: P.w - 0.04, yt: P.yt - 0.06, rt: P.rt + 0.04, yb: P.yb + 0.03 })];
}
function endCab(xe: number, P: Prof, len: number, ytF: number, wF: number, rtF: number, ybF = P.yb + 0.04): St[] {
  return [
    S(xe - len, P),
    S(xe - len * 0.45, P, { yt: P.yt - (P.yt - ytF) * 0.45, w: (P.w + wF) / 2 + 0.01, rt: (P.rt + rtF) / 2, yb: (P.yb + ybF) / 2 }),
    S(xe, P, { yt: ytF, w: wF, rt: rtF, yb: ybF }),
  ];
}
function endRound(xe: number, P: Prof, len: number, k = 1): St[] {
  return [
    S(xe - len, P),
    S(xe - len * 0.55, P, { w: P.w - 0.04 * k, yt: P.yt - 0.07 * k, rt: P.rt + 0.08 }),
    S(xe - len * 0.25, P, { w: P.w - 0.13 * k, yt: P.yt - 0.24 * k, rt: P.rt + 0.15, yb: P.yb + 0.03 }),
    S(xe - len * 0.07, P, { w: P.w - 0.28 * k, yt: P.yt - 0.48 * k, rt: P.rt + 0.12, yb: P.yb + 0.06 }),
    S(xe, P, { w: P.w - 0.42 * k, yt: P.yt - 0.62 * k, rt: P.rt + 0.08, yb: P.yb + 0.1 }),
  ];
}

// ------------------------------------------------------------------ Maler (Canvas in Metern)
class Pt {
  constructor(readonly g: CanvasRenderingContext2D, readonly W: number, readonly H: number, readonly x0: number, readonly x1: number, readonly y0: number, readonly y1: number) {}
  X(x: number) { return ((x - this.x0) / (this.x1 - this.x0)) * this.W; }
  Y(y: number) { return (1 - (y - this.y0) / (this.y1 - this.y0)) * this.H; }
  get k() { return Math.abs(this.W / (this.x1 - this.x0)); }
  fill(c: string) { this.g.fillStyle = c; this.g.fillRect(0, 0, this.W, this.H); }
  rect(xa: number, xb: number, ya: number, yb: number, c: string) {
    const a = this.X(xa), b = this.X(xb), t = this.Y(Math.max(ya, yb)), u = this.Y(Math.min(ya, yb));
    this.g.fillStyle = c; this.g.fillRect(Math.min(a, b), t, Math.max(1, Math.abs(b - a)), Math.max(1, u - t));
  }
  rr(xa: number, xb: number, ya: number, yb: number, r: number, c: string, stroke = false) {
    const a = Math.min(this.X(xa), this.X(xb)), b = Math.max(this.X(xa), this.X(xb));
    const t = this.Y(Math.max(ya, yb)), u = this.Y(Math.min(ya, yb));
    const rp = Math.min(r * this.k, (b - a) / 2, (u - t) / 2);
    const g = this.g;
    g.beginPath();
    g.moveTo(a + rp, t); g.lineTo(b - rp, t); g.quadraticCurveTo(b, t, b, t + rp); g.lineTo(b, u - rp); g.quadraticCurveTo(b, u, b - rp, u);
    g.lineTo(a + rp, u); g.quadraticCurveTo(a, u, a, u - rp); g.lineTo(a, t + rp); g.quadraticCurveTo(a, t, a + rp, t); g.closePath();
    if (stroke) { g.strokeStyle = c; g.lineWidth = Math.max(1, this.k * 0.03); g.stroke(); } else { g.fillStyle = c; g.fill(); }
  }
  win(xa: number, xb: number, ya: number, yb: number, r = 0.08, frame = '#2b2f33', glass = GLASS) {
    this.rr(xa - 0.04, xb + 0.04, ya - 0.04, yb + 0.04, r + 0.03, frame);
    const a = Math.min(this.X(xa), this.X(xb)), t = this.Y(yb), u = this.Y(ya);
    const gr = this.g.createLinearGradient(a, t, a + (u - t) * 0.8, u);
    gr.addColorStop(0, '#4a6378'); gr.addColorStop(0.45, glass); gr.addColorStop(1, '#10161c');
    this.rr(xa, xb, ya, yb, r, '#000');
    this.g.fillStyle = gr; this.g.fill();
  }
  circle(x: number, y: number, r: number, c: string) { this.g.fillStyle = c; this.g.beginPath(); this.g.arc(this.X(x), this.Y(y), Math.max(1, r * this.k), 0, Math.PI * 2); this.g.fill(); }
  slats(xa: number, xb: number, ya: number, yb: number, step: number, c: string, bg = '#2c3036') {
    this.rect(xa, xb, ya, yb, bg);
    for (let x = Math.min(xa, xb) + step / 2; x < Math.max(xa, xb); x += step) this.rect(x, x + step * 0.35, ya + 0.04, yb - 0.04, c);
  }
  hl(xa: number, xb: number, y: number, h: number, c: string) { this.rect(xa, xb, y - h / 2, y + h / 2, c); }
  vl(x: number, ya: number, yb: number, w: number, c: string) { this.rect(x - w / 2, x + w / 2, ya, yb, c); }
}

// ------------------------------------------------------------------ Drehgestelle / Radsätze
type BogieKind = 'pax' | 'loco' | 'loco3' | 'freight' | 'tram' | 'rack' | 'single' | 'lead' | 'trail';
interface BogieTpl { parts: Part[]; axles: number[]; r: number; wheel: Part[] }

function wheelParts(q: Quality, r: number, style: 'std' | 'drv', col: number, acc: number): Part[] {
  const key = `ws|${r}|${style}|${col}|${acc}|${q}`;
  const c = PARTS.get(key); if (c) return c;
  const b = new Bld(), seg = SEG[q] + (style === 'drv' ? 6 : 0);
  const steel = paint(q, col, 0.45, 0.65), dark = paint(q, 0x1d1e20, 0.7, 0.3);
  for (const s of [1, -1]) {
    if (style === 'std') {
      b.cyl(steel, 'z', 0, 0, s * GAUGE_Z, r, 0.13, seg);
      if (q !== 'low') {
        b.cyl(steel, 'z', 0, 0, s * (GAUGE_Z - 0.075), r + 0.028, 0.03, seg);
        b.boxc(dark, r * 0.55, 0, s * (GAUGE_Z + 0.07), 0.12, 0.12, 0.02);
        b.boxc(dark, -r * 0.55, 0, s * (GAUGE_Z + 0.07), 0.08, 0.08, 0.02);
      }
    } else {
      const red = paint(q, acc, 0.5, 0.2), ph = s > 0 ? 0 : Math.PI / 2;
      if (q === 'low') {
        b.cyl(red, 'z', 0, 0, s * GAUGE_Z, r, 0.13, 9);
        b.boxc(dark, Math.cos(ph + Math.PI) * r * 0.5, Math.sin(ph + Math.PI) * r * 0.5, s * (GAUGE_Z + 0.07), r * 0.42, r * 0.5, 0.03, ph + Math.PI);
        continue;
      }
      b.cyl(dark, 'z', 0, 0, s * GAUGE_Z, r, 0.12, seg);
      b.cyl(q === 'high' ? paint(q, shade(acc, 0.35), 0.6, 0.2) : red, 'z', 0, 0, s * GAUGE_Z, r * 0.9, q === 'high' ? 0.06 : 0.14, seg);
      if (q === 'high') for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; b.boxc(red, Math.cos(a) * r * 0.45, Math.sin(a) * r * 0.45, s * GAUGE_Z, r * 0.85, 0.07, 0.15, a); }
      const ca = ph + Math.PI;
      b.boxc(red, Math.cos(ca) * r * 0.5, Math.sin(ca) * r * 0.5, s * GAUGE_Z, r * 0.42, r * 0.5, 0.17, ca);
      b.cyl(red, 'z', 0, 0, s * (GAUGE_Z + 0.06), 0.2, 0.12, SEGS[q]);
      b.cyl(steel, 'z', Math.cos(ph) * 0.4, Math.sin(ph) * 0.4, s * (GAUGE_Z + 0.14), 0.08, 0.2, SEGS[q]);
    }
  }
  b.cyl(steel, 'z', 0, 0, 0, 0.085, 1.5, q === 'low' ? 4 : SEGS[q]);
  const p = b.done();
  PARTS.set(key, p);
  return p;
}
function bogieTpl(q: Quality, kind: BogieKind, frameCol: number): BogieTpl {
  const key = `bg|${kind}|${frameCol}|${q}`;
  const cached = TPL_BOGIE.get(key); if (cached) return cached;
  const b = new Bld(), fm = paint(q, frameCol, 0.7, 0.3), dk = paint(q, 0x18191b, 0.8, 0.2), sp = SEGS[q];
  let r = 0.46, axles: number[] = [-1.25, 1.25];
  const side = (hl: number, y0: number, y1: number, zc = 1.0, t = 0.14) => { for (const s of [1, -1]) b.box(fm, -hl, hl, y0, y1, s * (zc - t / 2), s * (zc + t / 2)); };
  const boxes = (y: number, sx = 0.34, sy = 0.28) => { for (const ax of axles) for (const s of [1, -1]) b.boxc(fm, ax, y, s * 1.02, sx, sy, 0.2); };
  const springs = (y: number, h: number) => { if (q !== 'low') for (const ax of axles) for (const s of [1, -1]) b.cyl(dk, 'y', ax, y, s * 1.02, 0.1, h, sp); };
  switch (kind) {
    case 'pax': case 'rack':
      side(1.85, 0.42, 0.78); boxes(r); springs(r + 0.3, 0.22);
      b.box(fm, -0.3, 0.3, 0.5, 0.78, -1.0, 1.0);
      if (q !== 'low') for (const s of [1, -1]) b.cyl(dk, 'y', 0, 0.9, s * 0.95, 0.24, 0.2, sp);
      if (kind === 'rack') {
        b.box(dk, -0.62, 0.62, 0.1, 0.42, -0.24, 0.24);
        b.cyl(paint(q, 0x6d7177, 0.4, 0.7), 'z', 0, 0.36, 0, 0.34, 0.16, SEG[q]);
      }
      break;
    case 'loco': r = 0.5; axles = [-1.4, 1.4];
      side(2.25, 0.45, 0.98, 1.02, 0.18); boxes(r, 0.4, 0.36); springs(r + 0.35, 0.25);
      b.box(fm, -0.35, 0.35, 0.55, 0.95, -1.05, 1.05);
      b.box(dk, -0.95, -0.35, 0.3, 0.8, -0.55, 0.55); b.box(dk, 0.35, 0.95, 0.3, 0.8, -0.55, 0.55);
      break;
    case 'loco3': r = 0.5; axles = [-1.9, 0, 1.9];
      side(2.85, 0.45, 0.98, 1.02, 0.18); boxes(r, 0.4, 0.36); springs(r + 0.35, 0.25);
      b.box(fm, -0.3, 0.3, 0.6, 0.95, -1.05, 1.05);
      break;
    case 'freight': axles = [-0.9, 0.9];
      side(1.35, 0.36, 0.7, 1.0, 0.12); boxes(r, 0.3, 0.26);
      b.box(fm, -0.25, 0.25, 0.42, 0.7, -1.0, 1.0);
      if (q !== 'low') for (const s of [1, -1]) { b.boxc(fm, -0.55, 0.62, s * 1.0, 0.7, 0.08, 0.1, 0.5); b.boxc(fm, 0.55, 0.62, s * 1.0, 0.7, 0.08, 0.1, -0.5); }
      break;
    case 'tram': r = 0.3; axles = [-0.9, 0.9];
      side(1.25, 0.22, 0.48, 0.98, 0.12); boxes(r, 0.26, 0.22);
      b.box(fm, -0.25, 0.25, 0.25, 0.42, -0.95, 0.95);
      break;
    case 'single': r = 0.5; axles = [0];
      for (const s of [1, -1]) { b.boxc(fm, 0, 0.5, s * 1.1, 0.5, 0.5, 0.18); b.boxc(dk, 0, 0.92, s * 1.1, 1.3, 0.1, 0.16); }
      break;
    case 'lead': r = 0.5; axles = [-0.9, 0.9];
      side(1.3, 0.4, 0.75, 0.95, 0.12); boxes(r, 0.3, 0.26);
      b.box(fm, -0.3, 0.3, 0.45, 0.75, -0.95, 0.95);
      break;
    case 'trail': r = 0.6; axles = [0];
      for (const s of [1, -1]) b.boxc(fm, 0, 0.6, s * 1.0, 0.45, 0.4, 0.16);
      b.box(fm, 0, 1.6, 0.55, 0.7, -0.1, 0.1);
      break;
  }
  const t: BogieTpl = { parts: b.done(), axles, r, wheel: wheelParts(q, r, 'std', 0x4a4d52, 0) };
  TPL_BOGIE.set(key, t);
  return t;
}
const TPL_BOGIE = new Map<string, BogieTpl>();

// ------------------------------------------------------------------ Vorlagen
interface DoorT { x: number; y: number; z: number; w: number; h: number; side: 1 | -1; slide: number; out: number; mat: THREE.Material }
interface PantoT { x: number; y: number; dir: 1 | -1 }
interface CargoItem { cargo: CargoType; thr: number; geo: THREE.BufferGeometry; mat: THREE.Material | null; x: number; y: number; z: number; sx: number; sy: number; sz: number; grow: number }
interface SteamT { drivers: number[]; r: number; parts: Part[]; crank: number; cylX: number; cylY: number; rodL: number; chimney: V3 }
interface Tpl { parts: Part[]; bogies: BogieTpl[]; lamps: (THREE.BufferGeometry | null)[]; doors: DoorT[]; pantos: PantoT[]; cargo: CargoItem[]; steam: SteamT | null; nomR: number; palette: THREE.Material[] }

const PALETTE = [0xb3362b, 0x2f6aa3, 0x2e8b57, 0xd99a1e, 0x6b6f75, 0x8c3b8f, 0xe0e0dc, 0x1f4e5f, 0xc0602a, 0x3f3f44];

class Ctx {
  b = new Bld();
  lam: V3[][] = [[], [], [], []]; // headF, tailF, headR, tailR
  doors: DoorT[] = [];
  pantos: PantoT[] = [];
  cargo: CargoItem[] = [];
  steam: SteamT | null = null;
  kinds: BogieKind[] = [];
  frameCol = 0x26282b;
  seg: number; segS: number; m: number; nn: number;
  uv: UVM;
  L: number;
  constructor(readonly t: VehicleType, readonly q: Quality) {
    this.seg = SEG[q]; this.segS = SEGS[q]; this.m = CM[q]; this.nn = NN[q];
    this.L = t.len / 2;
    this.uv = { x0: -this.L, x1: this.L, y0: 0.2, y1: 4.8 };
  }
  P(c: number, r = 0.45, m = 0.15) { return paint(this.q, c, r, m); }
  get body() { return this.P(this.t.color, 0.4, 0.2); }
  get acc() { return this.P(this.t.accent, 0.4, 0.2); }
  get dark() { return this.P(0x2a2d31, 0.75, 0.25); }
  get black() { return this.P(0x141516, 0.6, 0.3); }
  get metal() { return this.P(0x7c8187, 0.35, 0.7); }
  get roof() { return this.P(0x6f747a, 0.6, 0.3); }
  get rubber() { return this.P(0x1a1a1a, 0.95, 0); }
  shell(fn: (p: Pt) => void, key = 'side', fallback = this.t.color): THREE.Material {
    const W = TEXW[this.q], H = W / 8, uv = this.uv, k = `${key}|${this.t.id}|${this.q}`;
    const tex = canvasTex(k, W, H, (g) => fn(new Pt(g, W, H, uv.x0, uv.x1, uv.y0, uv.y1)));
    return mat(this.q, 'tx|' + k, { color: tex ? 0xffffff : fallback, map: tex, rough: 0.4, metal: 0.2 });
  }
  front(fn: (p: Pt) => void, key = 'front', fallback = this.t.color): THREE.Material {
    const W = FTW[this.q], uv = this.uv, k = `${key}|${this.t.id}|${this.q}`;
    const tex = canvasTex(k, W, W, (g) => fn(new Pt(g, W, W, CAPW, -CAPW, uv.y0, uv.y1)));
    return mat(this.q, 'tx|' + k, { color: tex ? 0xffffff : fallback, map: tex, rough: 0.4, metal: 0.2 });
  }
  loft(sts: St[], side: THREE.Material, capF: THREE.Material | null, capR: THREE.Material | null) {
    this.b.add(side, loftGeo(sts, this.m, this.uv));
    if (capF) this.b.add(capF, capGeo(sts[sts.length - 1], this.m, 1, this.uv));
    if (capR) this.b.add(capR, capGeo(sts[0], this.m, -1, this.uv));
  }
  /** Pufferbohle + Seitenpuffer + Schraubenkupplung; xb = Bohlenaußenkante, dir = Ende */
  buffers(xb: number, dir: 1 | -1, beam: THREE.Material = this.dark, y = 1.06) {
    const b = this.b, xe = dir * this.L;
    b.box(beam, xb - dir * 0.22, xb, y - 0.25, y + 0.22, -1.35, 1.35);
    const len = Math.abs(xe - xb);
    for (const s of [1, -1]) {
      if (this.q === 'low') {
        b.cyl(this.black, 'x', xb + dir * (len - 0.06) / 2, y, s * 0.875, 0.15, len - 0.06, this.segS);
        b.boxc(this.metal, xe - dir * 0.03, y, s * 0.875, 0.06, 0.4, 0.4);
        continue;
      }
      b.cyl(this.black, 'x', xb + dir * (len - 0.06) / 2, y, s * 0.875, 0.1, len - 0.06, this.segS, 0.1);
      b.cyl(this.black, 'x', xb + dir * len * 0.3, y, s * 0.875, 0.17, len * 0.5, this.segS);
      b.cyl(this.metal, 'x', xe - dir * 0.03, y, s * 0.875, 0.23, 0.06, this.seg);
    }
    b.boxc(this.black, xb + dir * len * 0.5, y - 0.02, 0, len, 0.1, 0.12);
    b.boxc(this.black, xb + dir * 0.06, y - 0.05, 0, 0.12, 0.3, 0.25);
  }
  coupler(xb: number, dir: 1 | -1, y = 1.0) {
    const xe = dir * this.L, len = Math.abs(xe - xb);
    this.b.boxc(this.black, xb + dir * len * 0.45, y, 0, len * 0.9, 0.14, 0.16);
    this.b.boxc(this.dark, xe - dir * 0.12, y, 0, 0.24, 0.32, 0.34);
  }
  gangway(xb: number, dir: 1 | -1, y0 = 1.2, y1 = 3.65, w = 0.65) {
    const xe = dir * this.L, x2 = xb + (xe - xb) * 0.92;
    this.b.box(this.rubber, xb, x2, y0, y1, -w, w);
  }
  doorsAt(xs: number[], leaves: 1 | 2, wl: number, y0: number, h: number, P: Prof, m: THREE.Material) {
    const z = zAt(S(0, P), y0 + h / 2);
    const zs = isNaN(z) ? P.w : z;
    for (const x of xs) for (const side of [1, -1] as const) {
      if (leaves === 2) {
        this.doors.push({ x: x - wl / 2, y: y0 + h / 2, z: side * (zs + 0.03), w: wl, h, side, slide: -wl * 0.95, out: 0, mat: m });
        this.doors.push({ x: x + wl / 2, y: y0 + h / 2, z: side * (zs + 0.03), w: wl, h, side, slide: wl * 0.95, out: 0, mat: m });
      } else {
        const d = x > 0 ? -1 : 1;
        this.doors.push({ x, y: y0 + h / 2, z: side * (zs + 0.03), w: wl, h, side, slide: d * wl * 0.95, out: 0, mat: m });
      }
    }
  }
  doorMat(color: number, style: 'pax' | 'wall' | 'plain' = 'pax', frame = 0x2b2f33): THREE.Material {
    const key = `door|${color}|${style}|${frame}`;
    const W = style === 'wall' ? 512 : 64, H = 128;
    const tex = canvasTex(key, W, H, (g) => {
      g.fillStyle = css(color); g.fillRect(0, 0, W, H);
      if (style === 'wall') {
        g.fillStyle = css(shade(color, 0.72));
        for (let i = 0; i < 26; i++) g.fillRect((i + 0.3) * W / 26, 6, W / 70, H - 12);
        g.fillStyle = css(shade(color, 1.25)); g.fillRect(0, 0, W, 6); g.fillRect(0, H - 6, W, 6);
      } else {
        g.strokeStyle = css(shade(color, 0.6)); g.lineWidth = 3; g.strokeRect(2, 2, W - 4, H - 4);
        if (style === 'pax') {
          g.fillStyle = css(frame); g.fillRect(9, 10, W - 18, 56);
          const gr = g.createLinearGradient(0, 12, 40, 64); gr.addColorStop(0, '#4a6378'); gr.addColorStop(1, '#141b21');
          g.fillStyle = gr; g.fillRect(12, 13, W - 24, 50);
        }
        g.fillStyle = css(shade(color, 0.5)); g.fillRect(W / 2 - 2, 74, 4, 18);
      }
    });
    return mat(this.q, 'tx|' + key, { color: tex ? 0xffffff : color, map: tex, rough: 0.4, metal: 0.2 });
  }
  panto(x: number, y: number, dir: 1 | -1 = 1) {
    const b = this.b;
    b.box(this.metal, x - 0.75, x + 0.75, y + 0.18, y + 0.26, -0.55, 0.55);
    for (const sx of [-0.6, 0.6]) for (const sz of [-0.45, 0.45]) {
      if (this.q === 'low') b.boxc(this.P(0xc9b79a, 0.5, 0), x + sx, y + 0.09, sz, 0.12, 0.18, 0.12);
      else b.cyl(this.P(0xc9b79a, 0.5, 0), 'y', x + sx, y + 0.09, sz, 0.07, 0.18, this.segS, 0.05);
    }
    b.boxc(this.metal, x + 0.3, y + 0.3, 0, 0.14, 0.12, 0.3);
    this.pantos.push({ x, y, dir });
  }
  lampsF(heads: V3[], tails: V3[]) { this.lam[0].push(...heads); this.lam[1].push(...tails); }
  lampsR(heads: V3[], tails: V3[]) { this.lam[2].push(...heads); this.lam[3].push(...tails); }
  /** symmetrische Leuchten-Positionen an beiden Enden (x positiv angegeben) */
  lampsBoth(heads: V3[], tails: V3[]) {
    this.lampsF(heads, tails);
    this.lampsR(heads.map(([x, y, z]) => [-x, y, z] as V3), tails.map(([x, y, z]) => [-x, y, z] as V3));
  }
  /** Unterflurkästen zwischen x0..x1 */
  uf(x0: number, x1: number, y0 = 0.6, y1 = 1.1, m: THREE.Material = this.dark) {
    const n = Math.max(1, Math.round((x1 - x0) / 3.2));
    const step = (x1 - x0) / n;
    for (let i = 0; i < n; i++) {
      const a = x0 + i * step + 0.15, w = step - 0.3, k = (i * 7) % 3;
      const zz = k === 0 ? 1.15 : k === 1 ? 0.95 : 1.05;
      this.b.box(m, a, a + w, y0 + (k === 2 ? 0.15 : 0), y1, -zz, zz);
    }
  }
  /** einfacher Güterwagen-Rahmen */
  wagonFrame(xb: number, deck: THREE.Material | null, yTop = 1.28, beam: THREE.Material = this.dark) {
    const b = this.b, fm = this.P(this.frameCol, 0.7, 0.3);
    for (const s of [1, -1]) b.box(fm, -xb, xb, yTop - 0.36, yTop - 0.04, s * 1.22, s * 1.34);
    b.box(fm, -xb, xb, yTop - 0.42, yTop - 0.08, -0.25, 0.25);
    for (let x = -xb + 1.6; x < xb - 1; x += this.q === 'low' ? 5.2 : 2.6) b.box(fm, x - 0.08, x + 0.08, yTop - 0.3, yTop - 0.05, -1.22, 1.22);
    if (deck) b.box(deck, -xb, xb, yTop - 0.06, yTop + 0.06, -1.38, 1.38);
    this.buffers(xb, 1, beam); this.buffers(-xb, -1, beam);
    this.lampsBoth([], [[xb + 0.02, 1.55, 1.0], [xb + 0.02, 1.55, -1.0]]);
  }
}

function heapGeo(q: Quality, half: number, w: number): THREE.BufferGeometry {
  const key = `heap|${half}|${w}|${q}`;
  let g = GEOS.get(key);
  if (!g) {
    const P: Prof = { w, yb: 0, yt: 1, rt: w * 0.9, rb: 0.02 };
    g = loftGeo([S(-half, P, { yt: 0.15, w: w * 0.92 }), S(-half + 0.9, P), S(half - 0.9, P), S(half, P, { yt: 0.15, w: w * 0.92 })], CM[q], { x0: 0, x1: 1, y0: 0, y1: 1 });
    GEOS.set(key, g);
  }
  return g;
}
function logLayerGeo(q: Quality, n: number, len: number, xs: number[], odd: boolean): THREE.BufferGeometry {
  const key = `logs|${n}|${len}|${xs.join(',')}|${odd}|${q}`;
  let g = GEOS.get(key);
  if (!g) {
    const r = 0.19, list: THREE.BufferGeometry[] = [], seg = q === 'low' ? 5 : q === 'medium' ? 7 : 9;
    const cnt = odd ? n - 1 : n;
    for (const xc of xs) for (let i = 0; i < cnt; i++) {
      const z = (i - (cnt - 1) / 2) * r * 2.05;
      const c = new THREE.CylinderGeometry(r * (0.9 + 0.1 * ((i * 3) % 2)), r, len - (i % 2) * 0.3, seg, 1, q === 'low');
      place(c, xc + ((i * 5) % 3 - 1) * 0.12, 0, z, 0, 0, -Math.PI / 2);
      list.push(c);
    }
    g = mergeGeometries(list, false)!;
    for (const l of list) l.dispose();
    GEOS.set(key, g);
  }
  return g;
}
function carGeo(q: Quality): THREE.BufferGeometry {
  let g = GEOS.get('car|' + q);
  if (!g) {
    const list: THREE.BufferGeometry[] = [];
    list.push(place(new THREE.BoxGeometry(4.2, 0.62, 1.74), 0, 0.55, 0));
    list.push(place(new THREE.BoxGeometry(2.3, 0.5, 1.58), -0.25, 1.1, 0));
    if (q !== 'low') {
      list.push(place(new THREE.BoxGeometry(0.9, 0.36, 1.6), 1.15, 0.93, 0, 0, 0, -0.45));
      list.push(place(new THREE.BoxGeometry(0.7, 0.36, 1.6), -1.5, 0.93, 0, 0, 0, 0.5));
    }
    if (q === 'low') list.push(place(new THREE.BoxGeometry(3.4, 0.5, 1.6), 0, 0.27, 0));
    else for (const x of [-1.35, 1.35]) for (const z of [-0.8, 0.8]) list.push(place(new THREE.CylinderGeometry(0.3, 0.3, 0.2, SEGS[q]), x, 0.3, z, Math.PI / 2));
    g = mergeGeometries(list, false)!;
    for (const l of list) l.dispose();
    GEOS.set('car|' + q, g);
  }
  return g;
}

// ------------------------------------------------------------------ Fahrzeug-Definitionen
const PAX: Prof = { w: 1.44, yb: 1.1, yt: 4.05, rt: 0.7, rb: 0.2, tw: 0.97 };

function defHst(C: Ctx, end: boolean) {
  const t = C.t, L = C.L;
  const P: Prof = { w: 1.47, yb: 1.0, yt: 3.95, rt: 0.85, rb: 0.32, tw: 0.95 };
  const xr = -(L - 0.3), xf = end ? L - 0.08 : L - 0.3, NL = 7.4, xs = xf - NL;
  const nose = (u: number) => ({ yt: 1.55 + 2.4 * (1 - Math.pow(u, 1.7)), yb: 1.0 - 0.13 * u, w: P.w * (1 - 0.72 * Math.pow(u, 2.3)) });
  const sts: St[] = mir(endFlat(-xr, P));
  if (end) { const n = C.nn + 2; for (let i = 0; i <= n; i++) { const u = i / n; sts.push(S(xs + u * NL, P, { ...nose(u), tw: 0.95 + 0.05 * u })); } }
  else sts.push(...endFlat(xf, P));
  const doorX = end ? [xr + 1.5] : [xf - 1.5];
  const shell = C.shell((p) => {
    p.fill(css(t.color));
    p.rect(xr, xf, 0, 1.24, '#3b4046');
    p.rect(xr, xf, 3.74, 5, '#c3c7cc');
    p.rect(xr, xf, 1.42, 1.6, css(t.accent));
    const wb0 = xr + 0.6, wb1 = end ? xs - 0.6 : xf - 0.6;
    p.rect(wb0, wb1, 2.18, 3.02, GLASS);
    p.rect(wb0, wb1, 2.86, 3.02, '#2c3c48');
    for (let x = wb0 + 1.0; x < wb1; x += 2.05) p.rect(x, x + 0.07, 2.18, 3.02, '#8d969e');
    for (const x of doorX) { p.rr(x - 0.5, x + 0.5, 1.1, 3.28, 0.06, '#15191d'); }
    if (end) {
      for (let x = xs; x <= xf; x += 0.03) {
        const v = nose((x - xs) / NL);
        if (v.yt > 3.9 || v.yt < 2.35) continue;
        p.rect(x, x + 0.035, v.yt - 1.05, v.yt + 0.35, '#141c24');
        p.rect(x, x + 0.035, v.yt - 1.12, v.yt - 1.05, css(t.accent));
      }
    }
  });
  C.loft(sts, shell, C.body, C.body);
  C.gangway(xr, -1); C.coupler(xr, -1);
  if (end) {
    C.lampsF([[surfX(sts, 1.3, 0.62) + 0.02, 1.3, 0.62], [surfX(sts, 1.3, 0.62) + 0.02, 1.3, -0.62]],
      [[surfX(sts, 1.3, 0.4) + 0.02, 1.3, 0.4], [surfX(sts, 1.3, 0.4) + 0.02, 1.3, -0.4]]);
  } else { C.gangway(xf, 1); C.coupler(xf, 1); }
  C.doorsAt(doorX, 1, 0.95, 1.12, 2.12, P, C.doorMat(t.color, 'pax'));
  C.panto(end ? -6.5 : 0, P.yt - 0.02);
  C.uf(-7.4, 7.4, 0.62, 1.05);
  C.kinds = ['pax', 'pax'];
}

function defDosto(C: Ctx, cab: boolean) {
  const t = C.t, L = C.L;
  const P: Prof = { w: 1.4, yb: 1.15, yt: 4.6, rt: 0.62, rb: 0.15, tw: 0.96 };
  const xr = -(L - 0.35), xf = L - 0.35;
  const low = (x: number) => S(x, P, { yb: 0.6 });
  const sts: St[] = [...mir(endFlat(-xr, P)), S(-8.5, P), low(-8.1), low(8.1), S(8.5, P)];
  if (cab) sts.push(...endCab(xf, P, 2.0, 3.2, 1.3, 0.25, 1.2)); else sts.push(...endFlat(xf, P));
  const doorX = cab ? [-7.3, 7.0] : [-7.3, 7.3];
  const red = css(t.accent);
  const shell = C.shell((p) => {
    p.fill(css(t.color));
    p.rect(xr, xf, 4.25, 5, '#9aa0a6');
    p.rect(xr, xf, 0, 0.92, red); p.rect(-8.3, -8.0, 0, 1.4, red); p.rect(8.0, 8.3, 0, 1.4, red);
    p.rect(xr, -8.3, 0, 1.38, red); p.rect(8.3, xf, 0, 1.38, red);
    p.hl(-8.1, 8.1, 2.32, 0.1, red);
    for (let x = -6.0; x < 5.9; x += 1.85) { p.win(x, x + 1.5, 1.05, 1.95, 0.1); p.win(x, x + 1.5, 2.72, 3.72, 0.12); }
    for (const x of [-12.2, -10.4]) p.win(x, x + 1.3, 2.15, 3.05, 0.1);
    if (!cab) for (const x of [9.1, 10.9]) p.win(x, x + 1.3, 2.15, 3.05, 0.1);
    else { p.win(9.0, 10.3, 2.15, 3.05, 0.1); p.rect(11.55, xf, 2.62, 4.05, '#141c24'); p.rect(10.5, 11.2, 2.3, 3.4, '#1a2028'); }
    for (const x of doorX) { p.rr(x - 0.68, x + 0.68, 0.62, 2.62, 0.06, '#15191d'); p.hl(x - 0.75, x + 0.75, 2.72, 0.06, red); }
  });
  const frontM = cab ? C.front((p) => {
    p.fill(css(t.color));
    p.rect(1.6, -1.6, 0, 1.75, red);
    p.rect(1.3, -1.3, 2.62, 3.3, '#141c24'); p.rect(0.04, -0.04, 2.62, 3.3, '#3a3f45');
    for (const s of [1, -1]) p.rr(s * 0.95, s * 0.45, 1.45, 1.85, 0.08, '#202326');
  }) : C.body;
  C.loft(sts, shell, frontM, C.body);
  C.buffers(xr, -1); C.gangway(xr - 0.0, -1, 1.25, 3.9, 0.6);
  if (cab) {
    C.buffers(xf, 1, C.acc);
    C.lampsF([[xf + 0.02, 1.65, 0.75], [xf + 0.02, 1.65, -0.75], [surfX(sts, 3.0, 0) + 0.02, 3.0, 0]], [[xf + 0.02, 1.65, 0.48], [xf + 0.02, 1.65, -0.48]]);
    C.lampsR([], [[xr - 0.02, 1.6, 1.0], [xr - 0.02, 1.6, -1.0]]);
  } else {
    C.buffers(xf, 1); C.gangway(xf, 1, 1.25, 3.9, 0.6);
    C.lampsBoth([], [[xf + 0.02, 1.6, 1.0], [xf + 0.02, 1.6, -1.0]]);
  }
  C.doorsAt(doorX, 2, 0.68, 0.62, 2.0, P, C.doorMat(t.color, 'pax'));
  C.uf(-6.2, 6.2, 0.3, 0.6);
  C.kinds = ['pax', 'pax'];
}

function defSb(C: Ctx, end: boolean) {
  const t = C.t, L = C.L;
  const P: Prof = { w: 1.45, yb: 1.05, yt: 3.95, rt: 0.55, rb: 0.18, tw: 0.96 };
  const xr = -(L - 0.3), xf = end ? L - 0.25 : L - 0.3;
  const sts: St[] = [...mir(endFlat(-xr, P)), ...(end ? endRound(xf, P, 2.3) : endFlat(xf, P))];
  const doorX = end ? [-8.9, -3.6, 1.7, 6.8] : [-8.0, -2.7, 2.7, 8.0];
  const red = css(t.accent);
  const shell = C.shell((p) => {
    p.fill(css(t.color));
    p.rect(xr, xf, 3.72, 5, '#a3a7ab');
    p.rect(xr, xf, 0, 1.38, red);
    p.hl(xr, xf, 3.5, 0.08, red);
    const segs = [xr + 0.4, ...doorX.flatMap((x) => [x - 0.75, x + 0.75]), end ? xf - 2.4 : xf - 0.4];
    for (let i = 0; i < segs.length; i += 2) {
      const a = segs[i], b = segs[i + 1], n = Math.max(1, Math.round((b - a) / 1.8));
      const w = (b - a) / n;
      for (let k = 0; k < n; k++) p.win(a + k * w + 0.12, a + (k + 1) * w - 0.12, 2.0, 3.25, 0.1);
    }
    for (const x of doorX) p.rr(x - 0.68, x + 0.68, 1.06, 3.2, 0.06, '#14181c');
    if (end) p.rect(xf - 1.6, xf, 2.35, 3.85, '#141c24');
  });
  const frontM = end ? C.front((p) => {
    p.fill(css(t.color));
    p.rect(1.6, -1.6, 0, 1.4, red);
    p.rr(1.15, -1.15, 2.35, 3.5, 0.15, '#141c24');
    for (const s of [1, -1]) p.rr(s * 0.95, s * 0.45, 1.42, 1.72, 0.1, '#1b1d20');
    p.hl(0.4, -0.4, 2.0, 0.12, red);
  }) : C.body;
  C.loft(sts, shell, frontM, C.body);
  C.gangway(xr, -1); C.coupler(xr, -1);
  if (end) {
    C.coupler(xf, 1, 0.95);
    const xl = surfX(sts, 1.57, 0.72) + 0.02;
    C.lampsF([[xl, 1.57, 0.72], [xl, 1.57, -0.72], [surfX(sts, 3.62, 0) + 0.02, 3.62, 0]], [[xl, 1.57, 0.52], [xl, 1.57, -0.52]]);
  } else { C.gangway(xf, 1); C.coupler(xf, 1); }
  C.doorsAt(doorX, 2, 0.68, 1.07, 2.12, P, C.doorMat(t.accent, 'pax'));
  C.panto(end ? -5.5 : 0, P.yt - 0.02);
  C.uf(-6.0, 6.0, 0.6, 1.05);
  C.kinds = ['pax', 'pax'];
}

function defDmu(C: Ctx) {
  const t = C.t, L = C.L;
  const P: Prof = { w: 1.45, yb: 1.1, yt: 3.95, rt: 0.5, rb: 0.2, tw: 0.97 };
  const xr = -(L - 0.35), xf = L - 0.35;
  const sts = [...mir(endFlat(-xr, P)), ...endCab(xf, P, 1.5, 3.05, 1.36, 0.3, 1.08)];
  const doorX = [-6.6, 7.3];
  const gr = css(t.accent);
  const shell = C.shell((p) => {
    p.fill(css(t.color));
    p.rect(xr, xf, 3.78, 5, '#8d9399');
    p.rect(xr, xf, 0, 1.5, gr);
    p.hl(xr, xf, 3.42, 0.1, gr);
    for (let x = xr + 0.6; x < 10.4; x += 1.6) { if (doorX.some((d) => Math.abs(x + 0.65 - d) < 1.2)) continue; p.win(x, x + 1.3, 2.1, 3.15, 0.08); }
    for (const x of doorX) p.rr(x - 0.68, x + 0.68, 1.12, 3.25, 0.05, '#14181c');
    p.rect(xf - 1.35, xf, 2.35, 3.95, '#141c24');
    p.win(10.5, 10.95, 2.4, 3.2, 0.05);
  });
  const frontM = C.front((p) => {
    p.fill(css(t.color));
    p.rect(1.6, -1.6, 0, 1.62, gr);
    p.rect(1.3, -1.3, 2.35, 3.2, '#141c24'); p.rect(0.05, -0.05, 2.35, 3.2, '#3a3f45');
    for (const s of [1, -1]) p.rr(s * 1.0, s * 0.5, 1.7, 2.05, 0.08, '#1b1d20');
  });
  C.loft(sts, shell, frontM, C.body);
  C.buffers(xr, -1); C.gangway(xr, -1);
  C.buffers(xf, 1, C.acc);
  C.lampsF([[xf + 0.02, 1.88, 0.75], [xf + 0.02, 1.88, -0.75], [surfX(sts, 3.4, 0) + 0.02, 3.4, 0]], [[xf + 0.02, 1.88, 1.02], [xf + 0.02, 1.88, -1.02]]);
  C.lampsR([], [[xr - 0.02, 1.6, 1.0], [xr - 0.02, 1.6, -1.0]]);
  C.doorsAt(doorX, 2, 0.68, 1.12, 2.1, P, C.doorMat(t.accent, 'pax'));
  // Dach: Kühler + Auspuff
  const b = C.b;
  for (const x0 of [-5.8, 2.6]) {
    b.box(C.dark, x0, x0 + 3.0, P.yt - 0.1, P.yt + 0.32, -0.8, 0.8);
    for (const dx of [0.75, 2.25]) b.cyl(C.black, 'y', x0 + dx, P.yt + 0.34, 0, 0.5, 0.06, C.seg);
    b.cyl(C.metal, 'y', x0 - 0.3, P.yt + 0.25, 0.45, 0.08, 0.7, C.segS);
  }
  C.uf(-6.8, 6.8, 0.55, 1.1);
  b.box(C.P(0x3a3f45), -2.2, 2.2, 0.45, 0.85, -0.6, 0.6);
  C.kinds = ['pax', 'pax'];
}

function defEloco(C: Ctx) {
  const t = C.t, L = C.L;
  const P: Prof = { w: 1.5, yb: 1.25, yt: 4.0, rt: 0.4, rb: 0.12, tw: 0.97 };
  const xe = L - 0.6;
  const front = endCab(xe, P, 1.4, 2.5, 1.42, 0.22, 1.3);
  const sts = [...mir(front), ...front];
  const ac = css(t.accent);
  const shell = C.shell((p) => {
    p.fill(css(t.color));
    p.rect(-xe, xe, 3.82, 5, '#5f6469');
    p.rect(-xe, xe, 0, 1.42, '#2b2e32');
    p.hl(-xe, xe, 1.68, 0.18, ac);
    for (const s of [1, -1]) {
      p.rect(s * (xe - 1.3), s * xe, 2.5, 3.9, '#141c24');
      p.win(s * 7.05, s * 7.7, 2.6, 3.4, 0.06);
      p.rr(s * 6.1, s * 6.85, 1.5, 3.55, 0.05, css(shade(t.color, 0.7)), true);
      p.win(s * 6.25, s * 6.7, 2.75, 3.35, 0.04);
    }
    for (const x of [-5.4, -1.75, 1.95]) p.slats(x, x + 3.4, 2.45, 3.45, 0.12, '#55595e');
  });
  const frontM = C.front((p) => {
    p.fill(css(t.color));
    p.rect(1.6, -1.6, 0, 1.42, '#2b2e32');
    p.hl(1.6, -1.6, 1.68, 0.18, ac);
    p.rect(1.6, -1.6, 2.5, 3.0, '#141c24');
    for (const s of [1, -1]) p.rr(s * 1.22, s * 0.5, 1.95, 2.3, 0.1, '#1b1d20');
  });
  C.loft(sts, shell, frontM, frontM);
  C.buffers(xe, 1, C.dark); C.buffers(-xe, -1, C.dark);
  const hl: V3[] = [[xe + 0.02, 2.12, 0.85], [xe + 0.02, 2.12, -0.85], [surfX(sts, 3.93, 0) + 0.02, 3.93, 0]];
  C.lampsBoth(hl, [[xe + 0.02, 2.12, 1.1], [xe + 0.02, 2.12, -1.1]]);
  const b = C.b, y = P.yt;
  b.box(C.metal, -1.4, 1.4, y - 0.05, y + 0.25, -0.5, 0.5);
  for (const x of [-2.6, 2.6]) b.box(C.dark, x - 1.0, x + 1.0, y - 0.08, y + 0.22, -0.9, 0.9);
  b.box(C.P(0xb08d3c, 0.4, 0.6), -4.0, 4.0, y + 0.38, y + 0.44, -0.04, 0.04);
  for (const x of [-3.4, 0, 3.4]) b.cyl(C.P(0xc9b79a, 0.5, 0), 'y', x, y + 0.2, 0, 0.08, 0.4, C.segS, 0.06);
  C.panto(-4.4, y - 0.02, 1); C.panto(4.4, y - 0.02, -1);
  b.box(C.dark, -2.9, 2.9, 0.65, 1.25, -1.15, 1.15);
  b.box(C.black, -3.6, -3.0, 0.8, 1.25, -1.0, 1.0); b.box(C.black, 3.0, 3.6, 0.8, 1.25, -1.0, 1.0);
  C.kinds = ['loco', 'loco'];
}

function defDloco(C: Ctx) {
  const t = C.t, L = C.L, b = C.b, ac = css(t.accent);
  const deckY = 1.55;
  b.box(C.dark, -(L - 0.55), L - 0.55, deckY - 0.12, deckY, -1.45, 1.45);
  b.box(C.acc, -(L - 0.55), L - 0.55, deckY - 0.42, deckY - 0.12, -1.38, 1.38);
  const H: Prof = { w: 1.05, yb: deckY, yt: 3.9, rt: 0.3, rb: 0.02 };
  const CB: Prof = { w: 1.45, yb: deckY, yt: 4.3, rt: 0.38, rb: 0.02, tw: 0.97 };
  const N: Prof = { w: 1.0, yb: deckY, yt: 2.95, rt: 0.22, rb: 0.02 };
  const xh0 = -9.9, xh1 = 5.5, xc1 = 8.7, xn1 = 10.05;
  const shell = C.shell((p) => {
    p.fill(css(t.color));
    p.rect(-L, L, 0, 1.75, ac);
    for (let x = xh0 + 1.2; x < xh1 - 0.5; x += 1.45) p.rr(x, x + 1.3, 1.85, 3.6, 0.05, css(shade(t.color, 0.65)), true);
    p.slats(xh0 + 0.3, xh0 + 3.2, 2.35, 3.55, 0.11, '#5b636c', '#1c2025');
    p.slats(-3.2, -1.6, 2.6, 3.4, 0.11, '#5b636c', '#1c2025');
    p.win(6.0, 6.9, 2.95, 3.85, 0.06); p.win(7.2, 8.35, 2.95, 3.85, 0.06);
    p.rr(5.75, 6.55, 1.8, 2.75, 0.04, css(shade(t.color, 0.65)), true);
    p.rect(-L, L, 4.12, 5, '#3b434c');
  });
  const cabF = C.front((p) => {
    p.fill(css(t.color));
    p.rect(1.6, -1.6, 0, 1.75, ac);
    for (const s of [1, -1]) p.win(s * 1.25, s * 0.12, 3.0, 3.95, 0.08);
  }, 'fcab');
  const noseF = C.front((p) => {
    p.fill(css(t.color));
    for (let i = -4; i < 4; i++) { p.g.fillStyle = i % 2 ? ac : '#1b1b1b'; p.g.beginPath(); const z = i * 0.4; p.g.moveTo(p.X(z), p.Y(1.55)); p.g.lineTo(p.X(z + 0.4), p.Y(1.55)); p.g.lineTo(p.X(z + 0.8), p.Y(2.15)); p.g.lineTo(p.X(z + 0.4), p.Y(2.15)); p.g.fill(); }
    for (const s of [1, -1]) p.rr(s * 0.85, s * 0.4, 2.2, 2.55, 0.08, '#1b1d20');
  }, 'fnose');
  const rearF = C.front((p) => {
    p.fill(css(t.color));
    p.slats(0.85, -0.85, 2.55, 3.65, 0.1, '#5b636c', '#1c2025');
    for (const s of [1, -1]) p.rr(s * 0.85, s * 0.4, 1.8, 2.15, 0.08, '#1b1d20');
    p.rect(1.6, -1.6, 0, 1.75, ac);
  }, 'frear');
  C.loft([S(xh0, H), S(xh1, H)], shell, null, rearF);
  C.loft([S(xh1, CB), S(xc1 - 0.15, CB), S(xc1, CB, { yt: 4.22, w: 1.42 })], shell, cabF, C.body);
  C.loft([S(xc1, N), S(xn1 - 0.1, N), S(xn1, N, { yt: 2.88, w: 0.96 })], shell, noseF, null);
  C.buffers(L - 0.55, 1, C.acc); C.buffers(-(L - 0.55), -1, C.acc);
  C.lampsF([[xn1 + 0.02, 2.38, 0.62], [xn1 + 0.02, 2.38, -0.62], [xc1 + 0.02, 4.08, 0]], [[xn1 + 0.02, 2.0, 0.62], [xn1 + 0.02, 2.0, -0.62]]);
  C.lampsR([[xh0 - 0.02, 1.98, 0.62], [xh0 - 0.02, 1.98, -0.62], [xh0 - 0.02, 3.72, 0]], [[xh0 - 0.02, 1.98, 0.85], [xh0 - 0.02, 1.98, -0.85]]);
  for (const x of [-2.6, -1.3]) { b.cyl(C.black, 'y', x, 4.05, 0, 0.15, 0.36, C.segS); }
  if (C.q !== 'low') for (const x of [-8.6, -7.3, -6.0]) b.cyl(C.dark, 'y', x, 3.93, 0, 0.5, 0.07, C.seg);
  b.box(C.dark, -3.3, 3.3, 0.6, deckY - 0.42, -1.1, 1.1);
  const rail = C.acc;
  for (const s of [1, -1]) {
    b.box(rail, xh0, xh1, 2.5, 2.55, s * 1.36, s * 1.4);
    for (let x = xh0; x <= xh1 + 0.01; x += (xh1 - xh0) / (C.q === 'low' ? 3 : 6)) b.box(rail, x - 0.025, x + 0.025, deckY, 2.5, s * 1.36, s * 1.4);
  }
  C.kinds = ['loco3', 'loco3'];
}

function defShunter(C: Ctx) {
  const t = C.t, L = C.L, b = C.b, deckY = 1.35;
  const warnTex = canvasTex('warn', 64, 64, (g) => {
    g.fillStyle = '#f2c200'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#151515';
    for (let i = -2; i < 4; i++) { g.beginPath(); g.moveTo(i * 24, 64); g.lineTo(i * 24 + 12, 64); g.lineTo(i * 24 + 76, 0); g.lineTo(i * 24 + 64, 0); g.fill(); }
  });
  const warn = mat(C.q, 'warn', { color: warnTex ? 0xffffff : 0xf2c200, map: warnTex, rough: 0.5 });
  b.box(C.dark, -(L - 0.55), L - 0.55, deckY - 0.1, deckY, -1.42, 1.42);
  for (const s of [1, -1]) b.box(C.P(0x2a2a2a), -(L - 0.7), L - 0.7, 0.55, deckY - 0.1, s * 1.18, s * 1.28);
  const HP: Prof = { w: 0.95, yb: deckY, yt: 3.0, rt: 0.25, rb: 0.02 };
  const CP: Prof = { w: 1.4, yb: deckY, yt: 4.0, rt: 0.3, rb: 0.02, tw: 0.97 };
  const shell = C.shell((p) => {
    p.fill(css(t.color));
    p.slats(-4.4, -2.8, 2.1, 2.8, 0.1, '#6b4a2a', '#2a2420');
    p.slats(2.9, 4.4, 2.0, 2.6, 0.1, '#6b4a2a', '#2a2420');
    p.win(-0.75, 0.15, 2.65, 3.6, 0.06); p.win(0.4, 1.35, 2.65, 3.6, 0.06);
    p.rr(-4.3, -3.3, 1.5, 2.6, 0.04, css(shade(t.color, 0.6)), true);
    p.rr(3.4, 4.3, 1.45, 2.45, 0.04, css(shade(t.color, 0.6)), true);
    p.rect(-L, L, 3.85, 5, '#3a3a3a');
  });
  const cabF = C.front((p) => { p.fill(css(t.color)); for (const s of [1, -1]) p.win(s * 1.2, s * 0.15, 2.7, 3.7, 0.06); p.rect(1.6, -1.6, 3.85, 5, '#3a3a3a'); }, 'fcab');
  const hoodF = C.front((p) => {
    p.fill(css(t.color));
    for (let i = -6; i < 6; i++) { p.g.fillStyle = i % 2 ? '#f2c200' : '#151515'; p.g.beginPath(); const z = i * 0.3; p.g.moveTo(p.X(z), p.Y(1.35)); p.g.lineTo(p.X(z + 0.3), p.Y(1.35)); p.g.lineTo(p.X(z + 0.6), p.Y(1.6)); p.g.lineTo(p.X(z + 0.3), p.Y(1.6)); p.g.fill(); }
    p.slats(0.6, -0.6, 2.0, 2.75, 0.1, '#6b4a2a', '#2a2420');
  }, 'fhood');
  C.loft([S(-4.6, HP), S(-1.0, HP)], shell, null, hoodF);
  C.loft([S(-1.0, CP), S(1.6, CP)], shell, cabF, cabF);
  C.loft([S(1.6, HP, { yt: 2.8 }), S(4.6, HP, { yt: 2.8 })], shell, hoodF, null);
  for (const s of [1, -1] as const) {
    const xb = s * (L - 0.55);
    b.box(warn, xb - s * 0.25, xb, 0.75, 1.32, -1.4, 1.4);
    C.buffers(xb, s, warn);
  }
  C.lampsBoth([[4.62, 1.78, 0.55], [4.62, 1.78, -0.55], [4.62, 2.62, 0]], [[4.62, 1.78, 0.8], [4.62, 1.78, -0.8]]);
  b.cyl(C.black, 'y', -2.4, 3.2, 0, 0.12, 0.45, C.segS);
  for (const s of [1, -1]) {
    b.box(C.acc, -4.9, 4.9, 2.35, 2.4, s * 1.36, s * 1.4);
    for (const x of [-4.9, -2.5, 2.5, 4.9]) b.box(C.acc, x - 0.025, x + 0.025, deckY, 2.35, s * 1.36, s * 1.4);
  }
  b.box(C.dark, -0.9, 0.9, 0.7, deckY - 0.1, -0.9, 0.9);
  C.kinds = ['single', 'single'];
}

function defSteam(C: Ctx) {
  const t = C.t, q = C.q, b = C.b, L = C.L;
  const blk = C.P(t.color, 0.35, 0.35), red = C.acc, brass = C.P(0xb08d3c, 0.35, 0.8), gph = C.P(0x2b2b2c, 0.75, 0.3);
  const seg = C.seg + (q === 'low' ? 0 : 4);
  // Rahmen (innen) + Pufferbohlen
  for (const s of [1, -1]) b.box(red, -6.55, 6.5, 0.75, 1.55, s * 0.58, s * 0.66);
  b.box(red, 6.45, 6.68, 0.82, 1.38, -1.42, 1.42);
  C.buffers(6.68, 1, red);
  b.box(red, -6.75, -6.55, 0.9, 1.35, -1.3, 1.3);
  b.boxc(C.black, -6.85, 1.1, 0, 0.3, 0.12, 0.14);
  // Kessel
  b.cyl(blk, 'x', 1.5, 2.85, 0, 0.86, 5.8, seg);
  if (q !== 'low') for (const x of [-0.5, 1.5, 3.5]) b.cyl(brass, 'x', x, 2.85, 0, 0.875, 0.06, seg);
  b.cyl(gph, 'x', 5.15, 2.85, 0, 0.93, 1.5, seg);
  b.cyl(gph, 'x', 5.95, 2.85, 0, 0.8, 0.1, seg);
  b.boxc(C.metal, 6.02, 2.85, 0, 0.06, 0.08, 0.7); b.boxc(C.metal, 6.03, 2.85, 0, 0.06, 0.5, 0.08);
  b.cyl(gph, 'y', 5.2, 3.95, 0, 0.29, 0.75, q === 'low' ? 6 : C.seg, 0.26);
  if (q !== 'low') b.cyl(gph, 'y', 5.2, 4.32, 0, 0.34, 0.08, C.seg);
  b.cyl(blk, 'y', 2.2, 3.72, 0, 0.42, 0.5, C.seg, q === 'low' ? 0.3 : 0.42); b.cyl(blk, 'y', 0.4, 3.66, 0, 0.32, 0.38, C.seg, q === 'low' ? 0.22 : 0.32);
  if (q !== 'low') { b.sph(blk, 2.2, 3.96, 0, 0.42, C.seg, 0.5, true); b.sph(blk, 0.4, 3.84, 0, 0.32, C.seg, 0.5, true); }
  if (q !== 'low') {
    b.cyl(brass, 'y', -1.0, 3.78, 0.15, 0.06, 0.3, C.segS); b.cyl(brass, 'y', -1.0, 3.78, -0.15, 0.06, 0.3, C.segS);
    b.cyl(brass, 'y', -2.0, 3.85, 0, 0.05, 0.35, C.segS);
  }
  // Feuerbüchse + Führerhaus
  const FB: Prof = { w: 0.95, yb: 2.0, yt: 3.72, rt: 0.5, rb: 0.02 };
  const CP: Prof = { w: 1.45, yb: 1.75, yt: 4.22, rt: 0.5, rb: 0.02 };
  const shell = C.shell((p) => {
    p.fill(css(t.color));
    p.win(-5.95, -5.05, 2.85, 3.7, 0.08, '#3a1010');
    p.rect(-6.62, -6.05, 1.75, 3.35, '#0b0b0b');
    p.rr(-6.55, -3.45, 1.85, 4.0, 0.08, css(t.accent), true);
    p.rect(-7, 0, 4.0, 5, '#202020');
  }, 'side', t.color);
  const cabF = C.front((p) => { p.fill(css(t.color)); for (const s of [1, -1]) p.circle(s * 1.05, 3.55, 0.2, '#203040'); }, 'fcab');
  const cabR = C.front((p) => { p.fill(css(t.color)); p.rect(0.65, -0.65, 1.75, 3.6, '#0b0b0b'); }, 'frear');
  C.loft([S(-3.4, FB), S(-1.35, FB)], blk, null, null);
  C.loft([S(-6.6, CP), S(-3.4, CP)], shell, cabF, cabR);
  b.box(blk, -6.95, -3.2, 4.15, 4.24, -1.5, 1.5);
  // Umlauf, Windleitbleche, Zylinder, Gleitbahn
  for (const s of [1, -1]) {
    b.box(blk, -3.4, 6.3, 1.9, 1.96, s * 0.95, s * 1.42);
    if (q !== 'low') b.box(red, -3.4, 6.3, 1.85, 1.9, s * 1.38, s * 1.42);
    b.box(blk, 4.3, 6.2, 2.0, 3.85, s * 1.3, s * 1.34);
    b.cyl(blk, 'x', 5.0, 1.15, s * 1.02, 0.33, 1.1, q === 'low' ? 6 : C.seg);
    if (q !== 'low') b.cyl(C.metal, 'x', 5.58, 1.15, s * 1.02, 0.25, 0.06, C.seg);
    b.box(C.metal, 2.3, 4.45, 1.31, 1.35, s * 0.98, s * 1.08);
    if (q !== 'low') b.box(C.metal, 2.3, 4.45, 0.95, 0.99, s * 0.98, s * 1.08);
    if (q !== 'low') b.cyl(blk, 'x', 2.0, 2.15, s * 0.95, 0.1, 6.0, C.segS);
  }
  C.lampsF([[6.72, 1.6, 0.85], [6.72, 1.6, -0.85], [5.99, 3.5, 0]], [[6.72, 1.6, 1.15], [6.72, 1.6, -1.15]]);
  C.lampsR([[-6.62, 3.2, 0.95], [-6.62, 3.2, -0.95]], [[-6.62, 3.5, 0.95], [-6.62, 3.5, -0.95]]);
  C.kinds = C.t.bogies.map((x) => (x < 0 ? 'trail' : 'lead'));
  C.steam = { drivers: [1.95, -0.1, -2.15], r: 1.0, parts: wheelParts(q, 1.0, 'drv', 0x1d1e20, t.accent), crank: 0.4, cylX: 4.45, cylY: 1.15, rodL: 2.9, chimney: [5.2, 4.4, 0] };
}

function defTender(C: Ctx) {
  const t = C.t, b = C.b, L = C.L;
  C.wagonFrame(L - 0.45, null, 1.3, C.acc);
  const P: Prof = { w: 1.4, yb: 1.3, yt: 3.35, rt: 0.15, rb: 0.02 };
  const shell = C.shell((p) => {
    p.fill(css(t.color));
    p.rr(-4.4, 3.9, 1.45, 3.2, 0.12, css(t.accent), true);
    p.rect(-5, 5, 3.3, 5, '#1b1b1b');
  });
  C.loft([S(-4.6, P), S(4.1, P)], shell, C.body, C.body);
  b.box(C.body, 3.95, 4.1, 3.35, 3.85, -1.3, 1.3);
  b.add(C.P(0x111111, 0.95, 0), place(heapGeo(C.q, 1.7, 1.25).clone(), 2.15, 3.3, 0, 0, 0, 0, 1, 0.55, 1));
  b.cyl(C.black, 'y', -3.2, 3.42, 0, 0.35, 0.15, C.segS);
  b.box(C.black, -4.4, -2.0, 3.35, 3.42, -1.2, 1.2);
  C.lampsR([[-4.62, 1.75, 0.7], [-4.62, 1.75, -0.7], [-4.62, 3.1, 0]], []);
  C.lam[3].push([-4.62, 1.75, 1.05], [-4.62, 1.75, -1.05]);
  C.kinds = ['freight', 'freight'];
}

function defNeon(C: Ctx, end: boolean) {
  const t = C.t, L = C.L;
  const P: Prof = { w: 1.42, yb: 1.0, yt: 3.95, rt: 0.95, rb: 0.55, tw: 0.94 };
  const xr = -(L - 0.3), xf = end ? L - 0.1 : L - 0.3, NL = 4.6, xs = xf - NL, cy = 2.45;
  const sts: St[] = mir(endFlat(-xr, P));
  if (end) {
    const n = C.nn + 2;
    for (let i = 0; i <= n; i++) {
      const u = i / n, g = Math.max(0.16, Math.sqrt(Math.max(0, 1 - Math.pow(u, 2.6)))), g2 = Math.max(0.2, Math.sqrt(Math.max(0, 1 - Math.pow(u, 2.2))));
      sts.push(S(xs + u * NL, P, { yt: cy + (P.yt - cy) * g, yb: cy - (cy - P.yb) * g, w: P.w * g2 }));
    }
  } else sts.push(...endFlat(xf, P));
  const ac = css(t.accent);
  const doorX = end ? [-5.0, 2.5] : [-6.0, 0, 6.0];
  const shell = C.shell((p) => {
    p.fill(css(t.color));
    const w1 = end ? xs + 0.6 : xf - 0.6;
    p.rect(xr + 0.5, w1, 2.12, 3.32, '#0b2a33');
    p.rect(xr + 0.5, w1, 3.05, 3.32, '#164452');
    for (const x of doorX) p.rr(x - 0.68, x + 0.68, 1.02, 3.25, 0.12, '#06080c');
    if (end) p.rect(xs + 0.3, xf, 2.3, 4.2, '#071c26');
    p.rect(xr, xf, 3.7, 5, '#11131f');
  });
  C.loft(sts, shell, C.body, C.body);
  const glow = mat(C.q, `glow|${t.accent}`, { color: t.accent, emissive: t.accent, ei: 2.5, rough: 0.3 });
  for (const s of [1, -1] as const) {
    C.b.add(glow, ribbonGeo(sts, 1.42, 0.07, s));
    C.b.add(glow, ribbonGeo(sts, 3.5, 0.05, s));
    if (end) C.b.add(glow, ribbonGeo(sts.filter((x) => x.x >= xs - 0.01), 2.25, 0.06, s));
  }
  C.gangway(xr, -1); C.coupler(xr, -1);
  if (end) {
    const y = 1.72;
    C.lampsF([[surfX(sts, y, 0.55) + 0.02, y, 0.55], [surfX(sts, y, 0.55) + 0.02, y, -0.55]], [[surfX(sts, y, 0.32) + 0.02, y, 0.32], [surfX(sts, y, 0.32) + 0.02, y, -0.32]]);
  } else { C.gangway(xf, 1); C.coupler(xf, 1); }
  C.doorsAt(doorX, 2, 0.68, 1.04, 2.15, P, C.doorMat(shade(t.color, 1.2), 'pax', t.accent));
  C.panto(end ? -6 : 0, P.yt - 0.02);
  for (const s of [1, -1]) C.b.box(C.dark, -5.2, 5.2, 0.7, 1.05, s * 1.25, s * 1.3);
  C.uf(-5.0, 5.0, 0.7, 1.0);
  C.kinds = ['pax', 'pax'];
}

function defRack(C: Ctx) {
  const t = C.t, L = C.L;
  const P: Prof = { w: 1.42, yb: 1.15, yt: 3.95, rt: 0.4, rb: 0.15, tw: 0.97 };
  const xe = L - 0.3;
  const f = endCab(xe, P, 1.0, 3.45, 1.35, 0.3, 1.2);
  const sts = [...mir(f), ...f].map((s) => ({ ...s, yt: s.yt + 0.008 * s.x, yb: s.yb + 0.006 * s.x }));
  const doorX = [-4.1, 4.1];
  const nv = css(t.accent);
  const shell = C.shell((p) => {
    p.fill(css(t.color));
    p.rect(-L, L, 0, 1.5, nv);
    p.rect(-L, L, 3.85, 5, '#e7e7e2');
    let k = 0;
    for (let x = -7.6; x < 7.2; x += 1.62) {
      if (doorX.some((d) => Math.abs(x + 0.7 - d) < 1.25)) continue;
      const lift = 0.06 * k++;
      p.win(x, x + 1.4, 1.85 + lift, 3.5 + lift * 0.5, 0.1, '#14273d');
    }
    for (const x of doorX) p.rr(x - 0.68, x + 0.68, 1.17, 3.3, 0.06, '#14181c');
    for (const s of [1, -1]) p.rect(s * (xe - 0.95), s * xe, 2.1, 3.85, '#141c24');
  });
  const frontM = C.front((p) => {
    p.fill(css(t.color));
    p.rect(1.6, -1.6, 0, 1.5, nv);
    p.rect(1.3, -1.3, 2.1, 3.5, '#141c24'); p.rect(0.04, -0.04, 2.1, 3.5, '#2a2f35');
    for (const s of [1, -1]) p.rr(s * 1.05, s * 0.55, 1.55, 1.85, 0.08, '#1b1d20');
  });
  C.loft(sts, shell, frontM, frontM);
  C.buffers(xe, 1, C.acc); C.buffers(-xe, -1, C.acc);
  C.lampsF([[xe + 0.1, 1.72, 0.8], [xe + 0.1, 1.72, -0.8]], [[xe + 0.1, 1.72, 1.05], [xe + 0.1, 1.72, -1.05]]);
  C.lampsR([[-xe - 0.1, 1.66, 0.8], [-xe - 0.1, 1.66, -0.8]], [[-xe - 0.1, 1.66, 1.05], [-xe - 0.1, 1.66, -1.05]]);
  C.doorsAt(doorX, 2, 0.68, 1.17, 2.1, P, C.doorMat(t.accent, 'pax'));
  C.panto(0, P.yt - 0.02);
  C.b.box(C.dark, -1.5, 1.5, P.yt - 0.08, P.yt + 0.2, -0.95, 0.95);
  C.uf(-3.6, 3.6, 0.65, 1.15);
  C.kinds = ['rack', 'rack'];
}

function defTram(C: Ctx) {
  const t = C.t, L = C.L, b = C.b;
  const P: Prof = { w: 1.2, yb: 0.32, yt: 3.3, rt: 0.35, rb: 0.1, tw: 0.97 };
  const xe = L - 0.15;
  const nose = (x: number): St[] => [
    S(x - 2.4, P), S(x - 1.4, P, { w: 1.18, yt: 3.27, rt: 0.45 }), S(x - 0.7, P, { w: 1.08, yt: 3.15, rt: 0.5, yb: 0.34 }),
    S(x - 0.2, P, { w: 0.92, yt: 2.95, rt: 0.45, yb: 0.38 }), S(x, P, { w: 0.78, yt: 2.75, rt: 0.4, yb: 0.42 }),
  ];
  const A = [S(5.25, P), ...nose(xe)];
  const B = [S(-4.75, P), S(4.75, P)];
  const Cm = mir(A);
  const doorX = [-10.9, -7.4, -2.6, 2.6, 7.4, 10.9];
  const dk = css(t.accent);
  const shell = C.shell((p) => {
    p.fill(css(t.color));
    p.rect(-L, L, 0, 0.62, dk);
    p.rect(-L, L, 3.1, 5, '#e9e9e4');
    for (let x = -12.3; x < 12.3; x += 1.7) {
      if (doorX.some((d) => Math.abs(x + 0.7 - d) < 1.3) || Math.abs(Math.abs(x + 0.7) - 5) < 0.9) continue;
      p.win(x, x + 1.45, 1.22, 2.85, 0.12, dk);
    }
    for (const x of doorX) p.rr(x - 0.68, x + 0.68, 0.33, 2.7, 0.08, '#14181c');
    for (const s of [1, -1]) p.rect(s * (xe - 1.7), s * xe, 1.22, 3.0, '#141c24');
  });
  const frontM = C.front((p) => {
    p.fill(css(t.color));
    p.rect(1.6, -1.6, 0, 0.62, dk);
    p.rr(0.75, -0.75, 1.2, 2.72, 0.2, '#141c24');
    for (const s of [1, -1]) p.rr(s * 0.75, s * 0.45, 0.72, 0.98, 0.08, '#1b1d20');
  });
  C.loft(A, shell, frontM, null); C.loft(B, shell, null, null); C.loft(Cm, shell, null, frontM);
  const bel: Prof = { w: 1.1, yb: 0.5, yt: 3.15, rt: 0.3, rb: 0.05 };
  for (const s of [1, -1]) C.loft(s > 0 ? [S(4.75, bel), S(5.25, bel)] : [S(-5.25, bel), S(-4.75, bel)], C.rubber, null, null);
  C.lampsBoth([[xe + 0.02, 0.85, 0.6], [xe + 0.02, 0.85, -0.6]], [[xe + 0.02, 1.05, 0.62], [xe + 0.02, 1.05, -0.62]]);
  C.doorsAt(doorX, 2, 0.68, 0.34, 2.32, P, C.doorMat(t.color, 'pax', t.accent));
  for (const s of [1, -1]) b.box(C.P(0xd8d8d2), s * 8.0, s * 11.2, P.yt - 0.05, P.yt + 0.32, -0.75, 0.75);
  b.box(C.P(0xd8d8d2), -3.2, -0.6, P.yt - 0.05, P.yt + 0.3, -0.8, 0.8);
  b.box(C.dark, 0.2, 2.2, P.yt - 0.05, P.yt + 0.08, -0.6, 0.6);
  C.panto(1.2, P.yt + 0.06);
  C.kinds = ['tram', 'tram', 'tram'];
}

function defCoach(C: Ctx, style: 'coach' | 'hist' | 'dining' | 'sleeper') {
  const t = C.t, L = C.L, b = C.b;
  const P: Prof = style === 'hist' ? { w: 1.38, yb: 1.15, yt: 3.95, rt: 0.32, rb: 0.08 } : PAX;
  const xe = L - 0.35;
  const sts = [...mir(endFlat(xe, P)), ...endFlat(xe, P)];
  const ac = css(t.accent);
  const doorX = style === 'hist' ? [-(xe - 0.75), xe - 0.75] : [-(xe - 1.0), xe - 1.0];
  const shell = C.shell((p) => {
    p.fill(css(t.color));
    if (style === 'hist') {
      p.rect(-L, L, 3.72, 5, '#6b4a2b');
      for (let y = 3.78; y < 4.8; y += 0.07) p.hl(-L, L, y, 0.012, '#4a311c');
      p.hl(-L, L, 1.55, 0.04, ac); p.hl(-L, L, 3.48, 0.04, ac);
      for (let i = 0; i < 8; i++) {
        const x = -7.75 + i * 2.0;
        p.rr(x - 0.42, x + 0.42, 1.3, 3.38, 0.04, ac, true);
        p.win(x - 0.28, x + 0.28, 2.4, 3.15, 0.1);
        p.win(x + 0.55, x + 1.42, 2.35, 3.15, 0.14);
      }
      for (const x of doorX) p.rr(x - 0.4, x + 0.4, 1.2, 3.38, 0.04, '#0d1410');
    } else {
      p.rect(-L, L, 3.82, 5, '#8f959b');
      p.rect(-L, L, 0, 1.3, '#4a4f55');
      if (style === 'coach') {
        p.hl(-L, L, 1.95, 0.16, ac);
        for (let x = -10.4; x < 10.4; x += 1.95) p.win(x, x + 1.6, 2.2, 3.18, 0.1);
      } else if (style === 'dining') {
        p.hl(-L, L, 1.95, 0.22, ac); p.hl(-L, L, 3.45, 0.06, ac);
        for (let x = -10.4; x < -4.6; x += 1.2) p.win(x, x + 0.75, 2.75, 3.25, 0.06);
        for (let x = -3.6; x < 10.0; x += 2.55) {
          p.win(x, x + 2.25, 2.12, 3.25, 0.12);
          for (const dx of [0.55, 1.7]) { p.circle(x + dx, 2.42, 0.07, '#ffd27a'); p.rect(x + dx - 0.11, x + dx + 0.11, 2.47, 2.6, '#a8323e'); }
        }
      } else {
        p.hl(-L, L, 2.45, 0.06, ac); p.hl(-L, L, 3.52, 0.06, ac);
        for (let x = -10.2; x < 10.2; x += 2.05) p.win(x, x + 0.85, 2.72, 3.32, 0.1);
      }
      for (const x of doorX) p.rr(x - 0.47, x + 0.47, 1.12, 3.3, 0.05, '#15191d');
    }
  });
  C.loft(sts, shell, C.body, C.body);
  for (const s of [1, -1] as const) { C.buffers(s * xe, s); C.gangway(s * xe, s, 1.25, 3.6, 0.62); }
  C.lampsBoth([], [[xe + 0.02, 1.6, 1.0], [xe + 0.02, 1.6, -1.0]]);
  C.doorsAt(doorX, 1, style === 'hist' ? 0.78 : 0.92, style === 'hist' ? 1.2 : 1.12, style === 'hist' ? 2.15 : 2.15, P, C.doorMat(style === 'hist' ? t.color : t.color, style === 'hist' ? 'pax' : 'pax'));
  if (style === 'hist') {
    for (const s of [1, -1]) {
      b.box(C.black, -6.2, -3.0, 0.55, 0.6, s * 1.0, s * 1.05);
      b.box(C.black, 3.0, 6.2, 0.55, 0.6, s * 1.0, s * 1.05);
      b.box(C.black, -3.0, 3.0, 0.55, 0.6, s * 1.0, s * 1.05);
      b.boxc(C.black, -6.85, 0.85, s * 1.02, 1.35, 0.05, 0.05, -0.47); b.boxc(C.black, 6.85, 0.85, s * 1.02, 1.35, 0.05, 0.05, 0.47);
    }
    b.box(C.dark, -2.0, 2.0, 0.7, 1.15, -0.8, 0.8);
    if (C.q !== 'low') for (let x = -7.5; x <= 7.5; x += 2.5) b.cyl(C.black, 'y', x, P.yt + 0.06, 0, 0.12, 0.18, C.segS, 0.08);
  } else {
    C.uf(-7.0, 7.0, 0.6, 1.1);
    if (style === 'dining') for (const x of [-8.5, -6.5]) b.box(C.metal, x - 0.4, x + 0.4, P.yt - 0.08, P.yt + 0.22, -0.4, 0.4);
  }
  C.kinds = ['pax', 'pax'];
}

function defWagon(C: Ctx) {
  const t = C.t, L = C.L, b = C.b, q = C.q, body = t.body;
  const xb = L - 0.35;
  C.frameCol = body === 'w_cont' ? t.color : 0x26282b;
  const wood = C.P(0x6b5338, 0.85, 0);
  switch (body) {
    case 'w_cont': {
      C.wagonFrame(xb, null, 1.28, C.body);
      for (const x of [-9.0, -0.25, 0.25, 9.0]) for (const s of [1, -1]) b.box(C.acc, x - 0.12, x + 0.12, 1.24, 1.36, s * 1.1, s * 1.25);
      const contTex = canvasTex('cont', 256, 64, (g) => {
        g.fillStyle = '#d8d8d8'; g.fillRect(0, 0, 256, 64);
        g.fillStyle = '#9a9a9a'; for (let i = 0; i < 40; i++) g.fillRect(i * 6.4 + 1, 4, 2.5, 56);
        g.fillStyle = '#777'; g.fillRect(0, 0, 256, 4); g.fillRect(0, 60, 256, 4); g.fillRect(0, 0, 4, 64); g.fillRect(252, 0, 4, 64);
      });
      const pal = PALETTE.map((c) => mat(q, `cont|${c}`, { color: c, map: contTex, rough: 0.6, metal: 0.3 }));
      C.cargo.push({ cargo: 'container', thr: 0.001, geo: unitBox(), mat: null, x: 4.6, y: 1.36 + 1.3, z: 0, sx: 8.8, sy: 2.6, sz: 2.44, grow: 0 });
      C.cargo.push({ cargo: 'container', thr: 0.5, geo: unitBox(), mat: null, x: -4.6, y: 1.36 + 1.3, z: 0, sx: 8.8, sy: 2.6, sz: 2.44, grow: 0 });
      return pal;
    }
    case 'w_bulk': {
      C.wagonFrame(xb, C.dark, 1.28);
      const w = C.body, rib = C.P(shade(t.color, 0.75));
      const hx = L - 0.6;
      for (const s of [1, -1]) {
        b.box(w, -hx, hx, 1.3, 3.55, s * 1.36, s * 1.44);
        b.box(w, s * (hx - 0.08), s * hx, 1.3, 3.55, -1.36, 1.36);
        for (let x = -hx + 0.6; x < hx; x += 1.3) b.box(rib, x - 0.05, x + 0.05, 1.3, 3.55, s * 1.44, s * 1.49);
        b.box(rib, -hx, hx, 3.5, 3.6, s * 1.36, s * 1.5);
      }
      const hg = heapGeo(q, hx - 0.1, 1.33);
      C.cargo.push({ cargo: 'bulk', thr: 0.005, geo: hg, mat: C.P(0x262626, 0.95, 0), x: 0, y: 1.32, z: 0, sx: 1, sy: 2.45, sz: 1, grow: 1 });
      C.cargo.push({ cargo: 'stone', thr: 0.005, geo: hg, mat: C.P(0x8f8a82, 0.95, 0), x: 0, y: 1.32, z: 0, sx: 1, sy: 2.45, sz: 1, grow: 1 });
      return [];
    }
    case 'w_tank': {
      C.wagonFrame(xb, null, 1.25);
      const pts = [[0, -6.8], [0.55, -6.75], [0.95, -6.6], [1.2, -6.42], [1.3, -6.2], [1.3, 6.2], [1.2, 6.42], [0.95, 6.6], [0.55, 6.75], [0, 6.8]].map(([r, y]) => new THREE.Vector2(r, y));
      const lg = new THREE.LatheGeometry(pts, C.seg + 4);
      place(lg, 0, 2.62, 0, 0, 0, -Math.PI / 2);
      b.add(C.body, lg);
      for (const x of [-4.8, 4.8]) b.cyl(C.acc, 'x', x, 2.62, 0, 1.315, 0.25, C.seg + 4);
      for (const x of [-3.2, 3.2]) b.box(C.dark, x - 0.2, x + 0.2, 1.2, 1.7, -1.1, 1.1);
      b.cyl(C.body, 'y', 0, 3.95, 0, 0.38, 0.4, C.seg); b.cyl(C.dark, 'y', 0, 4.17, 0, 0.42, 0.06, C.seg);
      b.box(C.P(0x55595e), -1.0, 1.0, 3.88, 3.92, -0.7, 0.7);
      for (const s of [1, -1]) {
        for (const dz of [-0.2, 0.2]) b.box(C.metal, 0.6 - 0.02, 0.6 + 0.02, 1.35, 3.9, s * (1.36 + 0.02) + dz * 0, s * (1.4));
        for (const dx of [0.4, 0.8]) b.box(C.metal, dx - 0.02, dx + 0.02, 1.4, 3.92, s * 1.36, s * 1.4);
        const nr = q === 'low' ? 3 : 7;
        for (let i = 0; i < nr; i++) { const y = 1.6 + i * (2.2 / nr); b.box(C.metal, 0.4, 0.8, y - 0.015, y + 0.015, s * 1.36, s * 1.4); }
        b.box(C.P(0xe35b00), -2.6, -1.6, 2.3, 2.9, s * 1.3, s * 1.32);
      }
      return [];
    }
    case 'w_cars': {
      C.wagonFrame(xb, C.P(0x6d7176, 0.7, 0.4), 1.25);
      const post = C.body, rail = C.acc;
      b.box(C.P(0x6d7176, 0.7, 0.4), -xb + 0.2, xb - 0.2, 2.85, 2.95, -1.3, 1.3);
      for (const s of [1, -1]) {
        for (let x = -xb + 0.3; x <= xb - 0.2; x += (2 * xb - 0.5) / (q === 'low' ? 8 : 15)) b.box(post, x - 0.05, x + 0.05, 1.3, 4.45, s * 1.36, s * 1.42);
        for (const y of [2.2, 3.6]) b.box(post, -xb + 0.3, xb - 0.3, y - 0.04, y + 0.04, s * 1.36, s * 1.42);
        b.box(rail, -xb + 0.3, xb - 0.3, 4.4, 4.5, s * 1.34, s * 1.44);
      }
      const cg = carGeo(q);
      const xs = [-9.6, -3.2, 3.2, 9.6];
      for (let i = 0; i < 8; i++) {
        const up = i >= 4, x = xs[i % 4];
        C.cargo.push({ cargo: 'cars', thr: i / 8 + 0.001, geo: cg, mat: null, x, y: up ? 2.95 : 1.31, z: 0, sx: 1, sy: 1, sz: 1, grow: 0 });
      }
      return PALETTE.map((c) => paint(q, c, 0.25, 0.5));
    }
    case 'w_wood': case 'w_flat': {
      C.wagonFrame(xb, wood, 1.28);
      const stakeH = body === 'w_wood' ? 3.5 : 1.9;
      for (const s of [1, -1]) for (let x = -8.5; x <= 8.51; x += body === 'w_wood' ? 3.4 : (q === 'low' ? 5.66 : 2.43)) b.box(C.acc, x - 0.06, x + 0.06, 1.34, stakeH, s * 1.3, s * 1.38);
      if (body === 'w_wood') for (const s of [1, -1]) {
        b.box(C.acc, s * 9.15, s * 9.3, 1.34, 3.4, -1.3, 1.3);
      }
      const nl = body === 'w_wood' ? (q === 'low' ? 3 : 5) : 3;
      const logM = C.P(0x6b4a2f, 0.95, 0);
      for (let i = 0; i < nl; i++) {
        const g = logLayerGeo(q, q === 'low' ? 4 : 6, 8.4, [-4.45, 4.45], i % 2 === 1);
        C.cargo.push({ cargo: 'wood', thr: i / nl + 0.001, geo: g, mat: logM, x: 0, y: 1.34 + 0.19 + i * 0.335, z: (i % 2) * 0, sx: 1, sy: 1, sz: 1, grow: 0 });
      }
      if (body === 'w_flat') {
        const crate = C.P(0x9b7b4f, 0.85, 0), tarp = C.P(0x2e5a87, 0.7, 0);
        for (let i = 0; i < 6; i++) C.cargo.push({ cargo: 'goods', thr: i / 6 + 0.001, geo: unitBox(), mat: i % 2 ? tarp : crate, x: -7.5 + i * 3.0, y: 1.34 + 0.7, z: 0, sx: 2.6, sy: 1.4, sz: 2.3, grow: 0 });
        const st = C.P(0x8f8b84, 0.95, 0);
        for (let i = 0; i < 4; i++) C.cargo.push({ cargo: 'stone', thr: i / 4 + 0.001, geo: unitBox(), mat: st, x: -6.6 + i * 4.4, y: 1.34 + 0.6, z: 0, sx: 2.8, sy: 1.2, sz: 2.0, grow: 0 });
      }
      return [];
    }
    case 'w_box': default: {
      C.wagonFrame(xb, C.dark, 1.25);
      const P: Prof = { w: 1.42, yb: 1.25, yt: 4.1, rt: 0.55, rb: 0.03 };
      const shell = C.shell((p) => { p.fill(css(t.color)); p.rect(-L, L, 1.2, 3.62, '#121212'); p.rect(-L, L, 3.65, 5, css(t.accent)); });
      const xe = L - 0.55;
      C.loft([S(-xe, P), S(xe, P)], shell, C.body, C.body);
      const wm = C.doorMat(t.color, 'wall');
      const z = zAt(S(0, P), 2.4);
      for (const side of [1, -1] as const) {
        C.doors.push({ x: xe / 2, y: 2.42, z: side * (z + 0.05), w: xe - 0.08, h: 2.36, side, slide: -(xe - 0.1), out: 0.07, mat: wm });
        C.doors.push({ x: -xe / 2, y: 2.42, z: side * (z + 0.05), w: xe - 0.08, h: 2.36, side, slide: 0, out: 0, mat: wm });
      }
      return [];
    }
  }
}

function buildTpl(type: VehicleType, q: Quality): Tpl {
  const C = new Ctx(type, q);
  let palette: THREE.Material[] = [];
  switch (type.body) {
    case 'hst_end': defHst(C, true); break;
    case 'hst_mid': defHst(C, false); break;
    case 'dosto_cab': defDosto(C, true); break;
    case 'dosto': defDosto(C, false); break;
    case 'sb_end': defSb(C, true); break;
    case 'sb_mid': defSb(C, false); break;
    case 'dmu': defDmu(C); break;
    case 'eloco': defEloco(C); break;
    case 'dloco': defDloco(C); break;
    case 'shunter': defShunter(C); break;
    case 'steam': defSteam(C); break;
    case 'tender': defTender(C); break;
    case 'neon_end': defNeon(C, true); break;
    case 'neon_mid': defNeon(C, false); break;
    case 'rack': defRack(C); break;
    case 'tram': defTram(C); break;
    case 'coach': defCoach(C, 'coach'); break;
    case 'coach_hist': defCoach(C, 'hist'); break;
    case 'dining': defCoach(C, 'dining'); break;
    case 'sleeper': defCoach(C, 'sleeper'); break;
    default: palette = defWagon(C); break;
  }
  const lamps = C.lam.map((pts, i) => {
    if (!pts.length) return null;
    const dir = i < 2 ? 1 : -1, list: THREE.BufferGeometry[] = [], big = i % 2 === 0;
    for (const [x, y, z] of pts) {
      const s = big ? 0.2 : 0.14;
      list.push(q === 'low' ? place(new THREE.BoxGeometry(0.06, s * 0.8, s), x + dir * 0.02, y, z)
        : place(new THREE.CylinderGeometry(s / 2, s / 2, 0.07, SEGS[q]), x + dir * 0.02, y, z, 0, 0, Math.PI / 2));
    }
    const g = list.length === 1 ? list[0] : mergeGeometries(list, false)!;
    if (list.length > 1) for (const l of list) l.dispose();
    return g;
  });
  const kinds = type.bogies.map((_, i) => C.kinds[i] ?? C.kinds[C.kinds.length - 1] ?? 'pax');
  return {
    parts: C.b.done(), bogies: kinds.map((k) => bogieTpl(q, k, C.frameCol)), lamps, doors: C.doors, pantos: C.pantos,
    cargo: C.cargo, steam: C.steam, nomR: wheelRadius(type), palette,
  };
}

function template(type: VehicleType, q: Quality): Tpl {
  const key = `${type.id}|${type.body}|${type.len}|${q}`;
  let t = TPLS.get(key);
  if (!t) { t = buildTpl(type, q); TPLS.set(key, t); }
  return t;
}

/** Gibt alle zwischengespeicherten Geometrien/Materialien/Texturen frei (z. B. beim Qualitätswechsel). */
export function clearVehicleCache(): void {
  const geos = new Set<THREE.BufferGeometry>();
  for (const t of TPLS.values()) { for (const p of t.parts) geos.add(p.geo); for (const l of t.lamps) if (l) geos.add(l); }
  for (const t of TPL_BOGIE.values()) for (const p of t.parts) geos.add(p.geo);
  for (const ps of PARTS.values()) for (const p of ps) geos.add(p.geo);
  for (const g of GEOS.values()) geos.add(g);
  for (const g of geos) g.dispose();
  for (const m of MATS.values()) m.dispose();
  for (const t of TEXS.values()) t?.dispose();
  TPLS.clear(); TPL_BOGIE.clear(); PARTS.clear(); GEOS.clear(); MATS.clear(); TEXS.clear();
}

// ------------------------------------------------------------------ Instanz
let SERIAL = 0;
function staticMesh(p: Part, x = 0, y = 0, z = 0): THREE.Mesh {
  const m = new THREE.Mesh(p.geo, p.mat);
  m.position.set(x, y, z); m.matrixAutoUpdate = false; m.updateMatrix();
  return m;
}
function setArm(m: THREE.Object3D, x1: number, y1: number, x2: number, y2: number, z = 0) {
  m.position.set((x1 + x2) / 2, (y1 + y2) / 2, z);
  m.rotation.z = Math.atan2(y2 - y1, x2 - x1);
  m.scale.x = Math.max(0.01, Math.hypot(x2 - x1, y2 - y1));
}

export function buildVehicle(type: VehicleType, q: Quality): VehicleModel {
  const tpl = template(type, q);
  const seed = ++SERIAL;
  const group = new THREE.Group();
  group.name = type.id;
  group.userData.vehicle = type.id;
  for (const p of tpl.parts) group.add(staticMesh(p));

  const wheels: { o: THREE.Object3D; k: number }[] = [];
  const bogies: THREE.Object3D[] = tpl.bogies.map((bt, i) => {
    const o = new THREE.Group();
    o.position.set(type.bogies[i], 0, 0);
    for (const p of bt.parts) o.add(staticMesh(p));
    for (const ax of bt.axles) {
      const w = new THREE.Group();
      w.position.set(ax, bt.r, 0);
      for (const p of bt.wheel) w.add(new THREE.Mesh(p.geo, p.mat));
      o.add(w);
      wheels.push({ o: w, k: tpl.nomR / bt.r });
    }
    group.add(o);
    return o;
  });

  const LM = lampMats(q);
  const lamps = tpl.lamps.map((g) => { if (!g) return null; const m = new THREE.Mesh(g, LM.off); m.matrixAutoUpdate = false; m.updateMatrix(); group.add(m); return m; });

  const doors = tpl.doors.map((d) => {
    const flat = q !== 'high';
    const m = new THREE.Mesh(flat ? unitPlane() : unitBox(), d.mat);
    m.scale.set(d.w, d.h, flat ? 1 : 0.05); m.position.set(d.x, d.y, d.z + (flat ? d.side * 0.025 : 0));
    if (flat && d.side < 0) m.rotation.y = Math.PI;
    group.add(m);
    return { m, d };
  });

  const metal = paint(q, 0x7c8187, 0.35, 0.7), dark = paint(q, 0x2a2d31, 0.7, 0.3);
  const pantos = tpl.pantos.map((p) => {
    const lower = new THREE.Mesh(unitBox(), metal), upper = new THREE.Mesh(unitBox(), metal), head = new THREE.Mesh(unitBox(), dark);
    lower.scale.set(1, 0.07, 0.5); upper.scale.set(1, 0.05, 0.08); head.scale.set(0.14, 0.06, 1.9);
    group.add(lower, upper, head);
    return { p, lower, upper, head };
  });

  const cargo = tpl.cargo.map((c, i) => {
    const m0 = c.mat ?? (tpl.palette.length ? tpl.palette[((seed * 7919 + i * 104729) >>> 0) % tpl.palette.length] : dark);
    const m = new THREE.Mesh(c.geo, m0);
    m.position.set(c.x, c.y, c.z); m.scale.set(c.sx, c.sy, c.sz); m.visible = false;
    group.add(m);
    return { m, c };
  });

  let steam: { drivers: THREE.Object3D[]; rods: THREE.Mesh[]; puffs: THREE.Mesh[]; s: SteamT } | null = null;
  if (tpl.steam) {
    const s = tpl.steam, drivers: THREE.Object3D[] = [], rods: THREE.Mesh[] = [];
    for (const x of s.drivers) {
      const w = new THREE.Group(); w.position.set(x, s.r, 0);
      for (const p of s.parts) w.add(new THREE.Mesh(p.geo, p.mat));
      group.add(w); drivers.push(w);
    }
    for (let i = 0; i < 6; i++) {
      const m = new THREE.Mesh(unitBox(), metal);
      m.scale.set(1, i % 3 === 0 ? 0.12 : 0.1, 0.05);
      group.add(m); rods.push(m);
    }
    const puffs: THREE.Mesh[] = [];
    let pg = GEOS.get('puff|' + q);
    if (!pg) { pg = new THREE.IcosahedronGeometry(1, q === 'high' ? 1 : 0); GEOS.set('puff|' + q, pg); }
    const pm = mat(q, 'puff', { color: 0xd8d8d8, transparent: true, opacity: 0.55, rough: 1, depthWrite: false });
    for (let i = 0; i < (q === 'low' ? 2 : 3); i++) { const m = new THREE.Mesh(pg, pm); m.visible = false; group.add(m); puffs.push(m); }
    steam = { drivers, rods, puffs, s };
  }

  const A = 1.75;
  function update(a: VehicleAnim) {
    const wa = a.wheelAngle;
    for (let i = 0; i < wheels.length; i++) wheels[i].o.rotation.z = -wa * wheels[i].k;
    // Lichter
    if (lamps[0]) lamps[0].material = a.frontLights === 2 ? LM.high : a.frontLights === 1 ? LM.head : LM.off;
    if (lamps[1]) lamps[1].material = a.frontLights === 3 ? LM.tail : LM.off;
    if (lamps[2]) lamps[2].material = a.rearLights === 2 ? LM.head : LM.off;
    if (lamps[3]) lamps[3].material = a.rearLights === 1 ? LM.tail : LM.off;
    // Türen
    const dl = Math.min(1, Math.max(0, a.doorL)), dr = Math.min(1, Math.max(0, a.doorR));
    for (let i = 0; i < doors.length; i++) {
      const { m, d } = doors[i], o = d.side < 0 ? dl : dr;
      m.position.x = d.x + d.slide * o;
      m.position.z = d.z + d.side * (d.out * Math.min(1, o * 6) + (q !== 'high' ? 0.025 : 0));
    }
    // Stromabnehmer
    const pr = Math.min(1, Math.max(0, a.panto));
    for (let i = 0; i < pantos.length; i++) {
      const { p, lower, upper, head } = pantos[i];
      const h = 0.28 + 1.72 * pr;
      const bx = p.x - p.dir * 0.5, by = p.y + 0.3;
      const hx = bx + p.dir * 0.15, hy = by + h;
      const d = Math.hypot(hx - bx, hy - by);
      let al = Math.atan2(hy - by, (hx - bx) * p.dir) - Math.acos(Math.min(1, d / (2 * A)));
      if (al < 0.03) al = 0.03;
      const ex = bx + p.dir * A * Math.cos(al), ey = by + A * Math.sin(al);
      setArm(lower, bx, by, ex, ey); setArm(upper, ex, ey, hx, hy);
      head.position.set(hx, hy + 0.04, 0);
    }
    // Ladung
    const cur = a.cargo ?? type.cargo?.[0] ?? null;
    const ld = Math.min(1, Math.max(0, a.load));
    for (let i = 0; i < cargo.length; i++) {
      const { m, c } = cargo[i];
      const vis = cur === c.cargo && ld > c.thr;
      m.visible = vis;
      if (vis && c.grow) m.scale.y = c.sy * Math.max(0.04, ld);
    }
    // Dampflok: Treibräder, Stangen, Rauch
    if (steam) {
      const s = steam.s, rot = -wa;
      for (let i = 0; i < steam.drivers.length; i++) steam.drivers[i].rotation.z = rot;
      const xm = s.drivers[1], xf = s.drivers[0], xr = s.drivers[s.drivers.length - 1];
      for (let k = 0; k < 2; k++) {
        const side = k === 0 ? 1 : -1, ph = k === 0 ? 0 : Math.PI / 2;
        const ox = s.crank * Math.cos(rot + ph), oy = s.crank * Math.sin(rot + ph);
        const cr = steam.rods[k * 3], co = steam.rods[k * 3 + 1], pi = steam.rods[k * 3 + 2];
        setArm(cr, xr + ox, s.r + oy, xf + ox, s.r + oy, side * 0.92);
        const px = xm + ox, py = s.r + oy;
        const dy = s.cylY - py, hx = px + Math.sqrt(Math.max(0.01, s.rodL * s.rodL - dy * dy));
        setArm(co, px, py, hx, s.cylY, side * 1.0);
        setArm(pi, hx, s.cylY, s.cylX + 0.3, s.cylY, side * 1.02);
      }
      const sm = Math.min(1, Math.max(0, a.smoke));
      for (let i = 0; i < steam.puffs.length; i++) {
        const m = steam.puffs[i];
        m.visible = sm > 0.03;
        if (!m.visible) continue;
        let f = (wa / Math.PI) * 0.5 + i / 3; f -= Math.floor(f);
        const sc = (0.25 + f * 0.9) * (0.4 + 0.6 * sm);
        m.position.set(s.chimney[0] - f * Math.min(3, Math.abs(a.speed) * 0.15), s.chimney[1] + f * 1.8, 0);
        m.scale.set(sc, sc * 0.8, sc);
      }
    }
  }
  update({ wheelAngle: 0, panto: 0, doorL: 0, doorR: 0, frontLights: 0, rearLights: 0, cabLight: false, load: 0, cargo: null, smoke: 0, speed: 0 });

  function dispose() {
    // Alle Geometrien/Materialien sind geteilt (Cache); hier nur aus dem Szenengraph lösen.
    group.removeFromParent();
    group.clear();
  }
  return { group, bogies, update, dispose };
}
