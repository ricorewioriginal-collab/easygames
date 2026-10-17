// Statisches Stadtbild: Geländetextur, Umland, Wasser-/Kaikante, Steg, Deko (Bäume, Laternen, Bänke, Boote, Haltestellen),
// Wohnblöcke (APARTMENTS) und ein Leuchtturm. Alles wird in wenige zusammengeführte Geometrien je Sektor gebacken.
import * as THREE from 'three';
import { APARTMENTS, LOTS } from '../data/lots';
import type { Part } from '../data/types';
import { buildDeco, ROADS_H, ROADS_V, ROAD_END_X, WATER_X, type Deco } from '../world/map';
import { MAP_H, MAP_W, Ter, type World } from '../world/world';
import { GeoBuf, col, hash2, rawToGeometry, type Raw } from './geo-builder';
import { addPart } from './object-mesh';

export const PX = 6; // Texel je Kachel
export const TEX_W = WATER_X * PX;
export const TEX_H = MAP_H * PX;
/** zusätzliche Texelzeilen unten: mittlere Wiesenfarbe für das Umland */
export const TEX_EXTRA = 4;
export const TEX_ROWS = TEX_H + TEX_EXTRA;
export const WATER_Y = -0.32;

// ---------- Geländetextur ----------
type RGB = [number, number, number];
const isHRoad = (z: number): [number, number] | undefined => ROADS_H.find(([a, b]) => z >= a && z < b);
const isVRoad = (x: number): [number, number] | undefined => ROADS_V.find(([a, b]) => x >= a && x < b);

/** Geländetextur (sRGB, Alpha = Schnee-/Grasmaske: 1 = Gras, Straßen niedrig) */
export function buildTerrainTexture(w: World): THREE.DataTexture {
  const data = new Uint8Array(TEX_W * TEX_ROWS * 4);
  let gr = 0, gg = 0, gb = 0, gn = 0;
  const t = w.terrain;
  const ter = (x: number, z: number): number => (x >= 0 && z >= 0 && x < MAP_W && z < MAP_H ? t[z * MAP_W + x]! : Ter.Grass);
  const out: RGB = [0, 0, 0];
  for (let gz = 0; gz < TEX_H; gz++) {
    const z = Math.floor(gz / PX), pz = gz - z * PX;
    for (let gx = 0; gx < TEX_W; gx++) {
      const x = Math.floor(gx / PX), px = gx - x * PX;
      const tt = ter(x, z);
      const n = hash2(gx, gz) - 0.5; // feines Rauschen
      const tn = hash2(x * 3 + 11, z * 7 + 5) - 0.5; // je Kachel
      let a = 255;
      switch (tt) {
        case Ter.Road: {
          let v = 80 + n * 10 + tn * 4;
          out[0] = v; out[1] = v + 2; out[2] = v + 7;
          const hr = isHRoad(z), vr = isVRoad(x);
          let mark = false;
          if (hr && !vr && x < ROAD_END_X) {
            // Mittellinie gestrichelt
            if (z === hr[0] + 2 && pz === 0 && Math.floor(gx / (PX * 1.5)) % 2 === 0) mark = true;
            // Zebrastreifen vor Kreuzungen
            const nearV = ROADS_V.some(([va, vb]) => (x >= va - 3 && x < va - 1) || (x >= vb + 1 && x < vb + 3));
            if (nearV && Math.floor(gz / 3) % 2 === 0) mark = true;
          }
          if (vr && !hr) {
            if (x === vr[0] + 2 && px === 0 && Math.floor(gz / (PX * 1.5)) % 2 === 0) mark = true;
            const nearH = ROADS_H.some(([ha, hb]) => (z >= ha - 3 && z < ha - 1) || (z >= hb + 1 && z < hb + 3));
            if (nearH && Math.floor(gx / 3) % 2 === 0) mark = true;
          }
          // Randlinie
          const edgeZ = hr && !vr && ((z === hr[0] && pz === 1) || (z === hr[1] - 1 && pz === PX - 2));
          const edgeX = vr && !hr && ((x === vr[0] && px === 1) || (x === vr[1] - 1 && px === PX - 2));
          if (mark) { v = 228; out[0] = v; out[1] = v; out[2] = v - 6; }
          else if (edgeZ || edgeX) { out[0] = 170; out[1] = 170; out[2] = 166; }
          a = 70;
          break;
        }
        case Ter.Walk: {
          const alt = x >= 50 && x < 96; // Altstadt: Kopfsteinpflaster
          if (alt) {
            const cx = Math.floor(gx / 2), cz = Math.floor(gz / 2);
            const h = hash2(cx, cz);
            const v = 150 + h * 34 + n * 6;
            const joint = (gx + (cz % 2)) % 2 === 0 && gz % 2 === 0;
            out[0] = v + 14 - (joint ? 22 : 0); out[1] = v + 4 - (joint ? 22 : 0); out[2] = v - 8 - (joint ? 20 : 0);
          } else {
            const joint = px % 3 === 0 || pz % 3 === 0;
            const v = 196 + n * 8 + tn * 6 - (joint ? 16 : 0);
            out[0] = v + 2; out[1] = v - 2; out[2] = v - 10;
          }
          // Bordstein zur Straße
          const roadN = ter(x, z - 1) === Ter.Road && pz === 0, roadS = ter(x, z + 1) === Ter.Road && pz === PX - 1;
          const roadW = ter(x - 1, z) === Ter.Road && px === 0, roadE = ter(x + 1, z) === Ter.Road && px === PX - 1;
          if (roadN || roadS || roadW || roadE) { out[0] = 222; out[1] = 220; out[2] = 212; }
          a = 150;
          break;
        }
        case Ter.Plaza: {
          const joint = px === 0 || pz === 0;
          const v = 204 + tn * 18 + n * 6 - (joint ? 18 : 0);
          out[0] = v + 6; out[1] = v - 6; out[2] = v - 26;
          a = 160;
          break;
        }
        case Ter.Sand: {
          const v = 222 + n * 16 + tn * 6;
          out[0] = v + 4; out[1] = v - 16; out[2] = v - 62;
          a = 210;
          break;
        }
        case Ter.Water: {
          out[0] = 70; out[1] = 140; out[2] = 170;
          a = 0;
          break;
        }
        case Ter.Wood: {
          const plank = px % 2 === 0 ? -10 : 0;
          const v = 150 + plank + n * 8;
          out[0] = v; out[1] = v - 40; out[2] = v - 78;
          a = 120;
          break;
        }
        case Ter.Lot: {
          // gepflegter Rasen mit Mähstreifen
          const stripe = z % 2 === 0 ? 4 : -3;
          out[0] = 112 + stripe * 0.6 + n * 14 + tn * 6;
          out[1] = 170 + stripe + n * 16 + tn * 8;
          out[2] = 78 + stripe * 0.4 + n * 10;
          a = 248;
          break;
        }
        default: {
          // Wiese, im Westen (Sonnenhain) etwas saftiger, mit großflächiger Variation
          const big = hash2(Math.floor(x / 5), Math.floor(z / 5)) - 0.5;
          const lush = x < 46 ? 6 : 0;
          out[0] = 104 + n * 20 + tn * 10 + big * 14;
          out[1] = 158 + lush + n * 22 + tn * 12 + big * 16;
          out[2] = 70 + n * 12 + big * 8;
          a = 255;
        }
      }
      const i = (gz * TEX_W + gx) * 4;
      if (tt === Ter.Grass) { gr += out[0]; gg += out[1]; gb += out[2]; gn++; }
      data[i] = Math.max(0, Math.min(255, out[0]));
      data[i + 1] = Math.max(0, Math.min(255, out[1]));
      data[i + 2] = Math.max(0, Math.min(255, out[2]));
      data[i + 3] = a;
    }
  }
  // Grundstücksränder: dezente Hecke/Kante als dunklere Linie
  for (const lot of LOTS) {
    for (let x = lot.x * PX; x < (lot.x + lot.w) * PX && x < TEX_W; x++)
      for (const gz of [lot.z * PX, (lot.z + lot.d) * PX - 1]) darken(data, x, gz, 0.82);
    for (let z = lot.z * PX; z < (lot.z + lot.d) * PX; z++)
      for (const gx of [lot.x * PX, (lot.x + lot.w) * PX - 1]) if (gx < TEX_W) darken(data, gx, z, 0.82);
  }
  // Umland-Zeilen: mittlere Wiesenfarbe
  gn = Math.max(1, gn);
  for (let i = TEX_W * TEX_H * 4; i < data.length; i += 4) {
    data[i] = gr / gn; data[i + 1] = gg / gn; data[i + 2] = gb / gn; data[i + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, TEX_W, TEX_ROWS, THREE.RGBAFormat, THREE.UnsignedByteType);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.needsUpdate = true;
  return tex;
}
function darken(d: Uint8Array, gx: number, gz: number, f: number): void {
  const i = (gz * TEX_W + gx) * 4;
  d[i] = d[i]! * f;
  d[i + 1] = d[i + 1]! * f;
  d[i + 2] = d[i + 2]! * f;
}

// ---------- Deko-Vorlagen ----------
const B = (x: number, y: number, z: number, w: number, h: number, d: number, c: string, r?: [number, number, number]): Part => ({ s: 'box', p: [x, y + h / 2, z], d: [w, h, d], c, r });
const C = (x: number, y: number, z: number, dx: number, h: number, dz: number, c: string, t?: number, r?: [number, number, number]): Part => ({ s: 'cyl', p: [x, y + h / 2, z], d: [dx, h, dz], c, t, r });
const S = (x: number, y: number, z: number, dx: number, dy: number, dz: number, c: string): Part => ({ s: 'sph', p: [x, y, z], d: [dx, dy, dz], c });

/** Laub-Arten (für saisonale Färbung) */
export const enum Leaf {
  Tree = 0,
  Pine = 1,
  Bush = 2,
  Petal = 3,
  Green = 4,
}

const tmp = new GeoBuf(4096);
function rawOf(parts: Part[]): Raw {
  tmp.clear();
  for (const p of parts) {
    tmp.colorC(col(p.c));
    addPart(tmp, p, true);
  }
  return tmp.toRaw();
}
/** Laubvorlage: Farbe kodiert Metadaten (r = Art/10, g = frei für Zufall, b = Normal-y) */
function leafRaw(parts: Part[], kind: Leaf): Raw {
  tmp.clear();
  for (const p of parts) {
    tmp.color(kind / 10, 0, 0);
    addPart(tmp, p, true);
  }
  const r = tmp.toRaw();
  for (let i = 0; i < r.v * 3; i += 3) r.c[i + 2] = r.n[i + 1]! * 0.5 + 0.5;
  return r;
}

const TRUNK = '#7a5a3e', IRON = '#2e3b36';
let templates: ReturnType<typeof makeTemplates> | null = null;
function makeTemplates() {
  return {
    trunk: rawOf([C(0, 0, 0, 0.24, 1.9, 0.24, TRUNK, 0.7)]),
    crown: leafRaw([S(0, 2.55, 0, 2.1, 1.9, 2.1, ''), S(0.55, 2.15, 0.35, 1.4, 1.25, 1.4, ''), S(-0.5, 2.25, -0.3, 1.5, 1.3, 1.5, '')], Leaf.Tree),
    pineTrunk: rawOf([C(0, 0, 0, 0.2, 0.9, 0.2, TRUNK)]),
    pineCrown: leafRaw([C(0, 0.6, 0, 1.9, 1.5, 1.9, '', 0), C(0, 1.45, 0, 1.45, 1.35, 1.45, '', 0), C(0, 2.3, 0, 1.0, 1.25, 1.0, '', 0)], Leaf.Pine),
    bush: leafRaw([S(0, 0.38, 0, 1.05, 0.8, 1.05, ''), S(0.32, 0.3, 0.22, 0.72, 0.58, 0.72, ''), S(-0.3, 0.28, -0.15, 0.66, 0.5, 0.66, '')], Leaf.Bush),
    flowerLeaves: leafRaw([S(0, 0.07, 0, 0.9, 0.16, 0.9, '')], Leaf.Green),
    petals: leafRaw([0, 1, 2, 3, 4, 5].map((i) => S(Math.cos(i * 1.05) * 0.27, 0.17, Math.sin(i * 1.05) * 0.27, 0.15, 0.1, 0.15, '')), Leaf.Petal),
    lamp: rawOf([
      C(0, 0, 0, 0.28, 0.4, 0.28, IRON, 0.8), C(0, 0.4, 0, 0.11, 3.0, 0.11, IRON), C(0, 3.4, 0, 0.18, 0.1, 0.18, IRON),
      B(0, 3.5, 0, 0.38, 0.05, 0.38, IRON), C(0, 3.82, 0, 0.5, 0.22, 0.5, IRON, 0.25), C(0, 4.04, 0, 0.08, 0.1, 0.08, IRON, 0.3),
      B(-0.17, 3.55, -0.17, 0.04, 0.28, 0.04, IRON), B(0.17, 3.55, -0.17, 0.04, 0.28, 0.04, IRON), B(-0.17, 3.55, 0.17, 0.04, 0.28, 0.04, IRON), B(0.17, 3.55, 0.17, 0.04, 0.28, 0.04, IRON),
    ]),
    lampGlow: rawOf([B(0, 3.56, 0, 0.3, 0.26, 0.3, '#ffe4a8')]),
    bench: rawOf([
      B(0, 0.4, 0.02, 1.6, 0.05, 0.42, '#a8754a'), B(0, 0.52, -0.2, 1.6, 0.3, 0.05, '#a8754a', [-10, 0, 0]),
      B(-0.7, 0, 0, 0.06, 0.4, 0.42, IRON), B(0.7, 0, 0, 0.06, 0.4, 0.42, IRON), B(-0.7, 0.4, -0.2, 0.06, 0.45, 0.05, IRON), B(0.7, 0.4, -0.2, 0.06, 0.45, 0.05, IRON),
    ]),
    hydrant: rawOf([C(0, 0, 0, 0.22, 0.6, 0.22, '#c43b2f'), S(0, 0.62, 0, 0.22, 0.16, 0.22, '#c43b2f'), C(0, 0.35, 0, 0.32, 0.08, 0.1, '#a83228', 1, [90, 0, 0])]),
    sign: rawOf([C(0, 0, 0, 0.07, 2.2, 0.07, '#9aa0a6'), B(0, 1.9, 0.04, 0.6, 0.4, 0.03, '#2f6f9f')]),
    busstop: rawOf([
      B(-1.05, 0, -0.4, 0.07, 2.3, 0.07, '#4a6070'), B(1.05, 0, -0.4, 0.07, 2.3, 0.07, '#4a6070'), B(-1.05, 0, 0.45, 0.07, 2.3, 0.07, '#4a6070'), B(1.05, 0, 0.45, 0.07, 2.3, 0.07, '#4a6070'),
      B(0, 2.3, 0.02, 2.4, 0.1, 1.2, '#3a7a9a'), B(0, 0.25, -0.42, 2.05, 1.85, 0.03, '#b9d8e6'), B(0, 0.45, -0.25, 1.7, 0.05, 0.35, '#c08a50'),
      C(1.45, 0, 0.5, 0.08, 2.6, 0.08, '#9aa0a6'), C(1.45, 2.35, 0.5, 0.45, 0.45, 0.06, '#f2c230', 1, [90, 0, 0]), C(1.45, 2.35, 0.5, 0.3, 0.47, 0.07, '#2e8a4a', 1, [90, 0, 0]),
    ]),
    boat: rawOf([
      B(0, 0, 0.2, 1.7, 0.7, 3.6, '#f4f1ea'), C(0, 0.35, -1.6, 1.7, 1.2, 0.7, '#f4f1ea', 0, [-90, 0, 0]), B(0, 0.42, 0.2, 1.72, 0.1, 3.62, '#2f5f8a'),
      B(0, 0.7, 0.8, 1.0, 0.6, 1.3, '#e8e2d6'), B(0, 1.3, 0.8, 1.1, 0.06, 1.4, '#a63d32'), C(0, 0.7, -0.6, 0.07, 3.2, 0.07, '#8a6a4a'), B(0, 0.7, 1.95, 1.5, 0.12, 0.08, '#8a6a4a'),
    ]),
  };
}

// ---------- Sektoren ----------
export const SECT_X = 4;
export const SECT_Z = 2;
export const N_SECT = SECT_X * SECT_Z + 1; // + Umland
const sectOf = (x: number, z: number): number => {
  if (x < 0 || z < 0 || x >= MAP_W || z >= MAP_H) return N_SECT - 1;
  return Math.min(SECT_Z - 1, Math.floor(z / 50)) * SECT_X + Math.min(SECT_X - 1, Math.floor(x / 40));
};

export interface StaticOut {
  solid: THREE.BufferGeometry[];
  foliage: THREE.BufferGeometry[];
  /** Laub-Metadaten je Sektor (Kopie der kodierten Farben) */
  foliageMeta: Float32Array[];
  lamps: THREE.BufferGeometry;
  /** Laternenpositionen (x,y,z) für Punktlichter */
  lampPos: Float32Array;
  windows: THREE.BufferGeometry;
  boats: THREE.BufferGeometry;
  ground: THREE.BufferGeometry;
  tris: number;
}

const APT_STYLE: Record<string, { walls: string[]; roof: string; floors: number[]; flat: boolean; balcony: boolean }> = {
  sonnenhain: { walls: ['#efe0bf', '#e7d0ab', '#dfe7d2', '#f1ece2'], roof: '#b5523b', floors: [3, 3, 3], flat: false, balcony: true },
  altstadt: { walls: ['#e3b4ae', '#ecc66a', '#a9c8de', '#efe0bf', '#d08a68', '#b5dccb'], roof: '#7a4436', floors: [4, 3, 4, 3, 4, 3], flat: false, balcony: false },
  hafen: { walls: ['#9a4a3a', '#8e3b32', '#a95a44', '#7d4a3e'], roof: '#4f5d6b', floors: [4, 4, 5, 4], flat: true, balcony: false },
};

export function buildStatic(w: World): StaticOut {
  templates ??= makeTemplates();
  const T = templates;
  const solid: GeoBuf[] = [], foliage: GeoBuf[] = [];
  for (let i = 0; i < N_SECT; i++) {
    solid.push(new GeoBuf(8192));
    foliage.push(new GeoBuf(8192));
  }
  const lamps = new GeoBuf(2048), windows = new GeoBuf(8192), boats = new GeoBuf(1024), ground = new GeoBuf(1024);
  const lampPos: number[] = [];
  const deco: Deco[] = buildDeco(w);
  const rng = (i: number): number => hash2(i * 17 + 3, i * 29 + 7);
  let seq = 0;
  const leaf = (raw: Raw, s: number, x: number, z: number, r: number, scale: number): void => {
    const b = foliage[s]!;
    const from = b.v;
    b.appendRaw(raw, Math.cos(r), Math.sin(r), x, 0, z, 1, 1, 1, scale);
    const rv = rng(seq++);
    for (let i = from * 3; i < b.v * 3; i += 3) b.c[i + 1] = rv;
  };
  const addTree = (kind: Deco['kind'], x: number, z: number, r: number, s: number): void => {
    const sec = sectOf(x, z);
    const c = Math.cos(r), sn = Math.sin(r);
    switch (kind) {
      case 'tree':
        solid[sec]!.appendRaw(T.trunk, c, sn, x, 0, z, 1, 1, 1, s);
        leaf(T.crown, sec, x, z, r, s);
        break;
      case 'pine':
        solid[sec]!.appendRaw(T.pineTrunk, c, sn, x, 0, z, 1, 1, 1, s);
        leaf(T.pineCrown, sec, x, z, r, s * 1.15);
        break;
      case 'bush':
        leaf(T.bush, sec, x, z, r, s);
        break;
      case 'flowers':
        leaf(T.flowerLeaves, sec, x, z, r, s);
        leaf(T.petals, sec, x, z, r, s);
        break;
      default:
    }
  };
  for (const d of deco) {
    const sec = sectOf(d.x, d.z);
    const c = Math.cos(d.r), s = Math.sin(d.r);
    switch (d.kind) {
      case 'tree': case 'pine': case 'bush': case 'flowers':
        addTree(d.kind, d.x, d.z, d.r, d.s);
        break;
      case 'lamp':
        solid[sec]!.appendRaw(T.lamp, 1, 0, d.x, 0, d.z);
        lamps.appendRaw(T.lampGlow, 1, 0, d.x, 0, d.z);
        lampPos.push(d.x, 3.5, d.z);
        break;
      case 'bench':
        solid[sec]!.appendRaw(T.bench, c, s, d.x, 0, d.z, 1, 1, 1, d.s);
        break;
      case 'hydrant':
        solid[sec]!.appendRaw(T.hydrant, c, s, d.x, 0, d.z);
        break;
      case 'sign':
        solid[sec]!.appendRaw(T.sign, c, s, d.x, 0, d.z);
        break;
      case 'busstop':
        solid[sec]!.appendRaw(T.busstop, c, s, d.x, 0, d.z);
        break;
      case 'boat':
        boats.appendRaw(T.boat, c, s, d.x, WATER_Y - 0.22, d.z, 1, 1, 1, d.s);
        break;
    }
  }
  // Umland: Bäume außerhalb der Karte (Horizont)
  for (let i = 0; i < 260; i++) {
    const a = rng(i * 3 + 1), b = rng(i * 3 + 2);
    let x: number, z: number;
    const side = i % 3;
    if (side === 0) { x = -4 - a * 70; z = -40 + b * 180; }
    else if (side === 1) { x = a * WATER_X; z = -4 - b * 50; }
    else { x = a * WATER_X; z = MAP_H + 4 + b * 50; }
    addTree(rng(i) < 0.35 ? 'pine' : 'tree', x, z, a * 6.28, 0.9 + b * 0.6);
  }

  // Steg: Planken auf Pfählen
  const t = w.terrain;
  for (let z = 0; z < MAP_H; z++)
    for (let x = WATER_X; x < MAP_W; x++) {
      if (t[z * MAP_W + x] !== Ter.Wood) continue;
      const sec = sectOf(x, z), b = solid[sec]!;
      for (let i = 0; i < 4; i++) {
        b.colorC(col('#a7794e'), 0.88 + 0.2 * hash2(x * 4 + i, z));
        b.box(x + i * 0.25 + 0.01, -0.12, z, x + (i + 1) * 0.25 - 0.01, 0.05, z + 1, { skipBottom: true });
      }
      const wood = (xx: number, zz: number): boolean => t[zz * MAP_W + xx] === Ter.Wood;
      b.colorC(col('#5a4030'));
      if ((x + z) % 2 === 0) {
        if (!wood(x, z - 1)) b.box(x + 0.4, WATER_Y - 1, z - 0.05, x + 0.6, 0.0, z + 0.15);
        if (z + 1 < MAP_H && !wood(x, z + 1)) b.box(x + 0.4, WATER_Y - 1, z + 0.85, x + 0.6, 0.0, z + 1.05);
      }
      // Poller am Kopf
      if (x >= 154 && (z === 77 || z === 83) && x % 2 === 0) {
        b.colorC(col('#3a3d42'));
        b.box(x + 0.4, 0.05, z + 0.4, x + 0.6, 0.45, z + 0.6);
      }
    }

  // Boden außerhalb der Karte, Kaimauer
  const g = ground;
  
  g.colorC(col('#9d9a92'));
  g.quad(WATER_X, WATER_Y - 0.5, 600, WATER_X, WATER_Y - 0.5, -500, WATER_X, 0, -500, WATER_X, 0, 600);
  g.colorC(col('#cfc9bd'));
  g.box(WATER_X - 0.25, -0.03, -500, WATER_X + 0.05, 0.07, 600, { skipBottom: true });

  // Leuchtturm auf einer kleinen Insel
  {
    const ix = 196, iz = 34, sec = N_SECT - 1;
    const b = solid[sec]!;
    const parts: Part[] = [
      C(ix, WATER_Y - 0.6, iz, 18, 0.9, 15, '#d9c79a', 0.8), C(ix + 1, WATER_Y + 0.3, iz - 1, 12, 0.5, 10, '#7aa05a', 0.7),
      S(ix - 5, WATER_Y + 0.3, iz + 3, 3, 1.6, 2.4, '#8a8478'), S(ix + 6, WATER_Y + 0.2, iz - 2, 2.2, 1.2, 2, '#9a958a'),
      C(ix, 0, iz, 2.6, 11, 2.6, '#f4f1ea', 0.7), C(ix, 2.5, iz, 2.35, 1.4, 2.35, '#c43b2f', 0.97), C(ix, 6.5, iz, 2.0, 1.4, 2.0, '#c43b2f', 0.97),
      C(ix, 11, iz, 2.4, 0.2, 2.4, '#3a3d42'), C(ix, 12.6, iz, 2.0, 1.0, 2.0, '#c43b2f', 0.1),
    ];
    for (const p of parts) {
      b.colorC(col(p.c));
      addPart(b, p);
    }
    lamps.colorC(col('#ffe9b0'));
    addPart(lamps, C(ix, 11.2, iz, 1.4, 1.4, 1.4, '#ffe9b0'));
    lampPos.push(ix, 11.8, iz);
  }

  // Wohnblöcke
  for (const apt of Object.values(APARTMENTS)) {
    const [ax, az, aw, ad] = apt.box;
    const st = APT_STYLE[apt.district] ?? APT_STYLE.sonnenhain!;
    const sec = sectOf(ax + aw / 2, az + ad / 2), b = solid[sec]!;
    const nSeg = Math.max(1, Math.round(aw / 7));
    const segW = aw / nSeg;
    for (let si = 0; si < nSeg; si++) {
      const sx0 = ax + si * segW, sx1 = sx0 + segW;
      const floors = st.floors[si % st.floors.length]!;
      const H = floors * 3 + 0.3;
      const wc = col(st.walls[(si + Math.floor(hash2(ax, si) * 3)) % st.walls.length]!);
      // Sockel, Körper, Gesimse
      b.colorC(wc, 0.72);
      b.box(sx0 - 0.05, 0, az - 0.05, sx1 + 0.05, 0.6, az + ad + 0.05, { skipBottom: true });
      b.colorC(wc);
      b.ao = 0.9;
      b.box(sx0, 0.6, az, sx1, H, az + ad, { skipBottom: true, skipTop: !st.flat });
      b.ao = 1;
      b.colorC(wc, 1.08);
      for (let f = 1; f < floors; f++) b.box(sx0 - 0.06, f * 3 - 0.08, az - 0.06, sx1 + 0.06, f * 3 + 0.04, az + ad + 0.06, { skipBottom: false });
      // Dach
      if (st.flat) {
        b.colorC(col('#6d6a66'));
        b.box(sx0 - 0.1, H, az - 0.1, sx1 + 0.1, H + 0.5, az + 0.1);
        b.box(sx0 - 0.1, H, az + ad - 0.1, sx1 + 0.1, H + 0.5, az + ad + 0.1);
        b.box(sx0 - 0.1, H, az, sx0 + 0.1, H + 0.5, az + ad);
        b.box(sx1 - 0.1, H, az, sx1 + 0.1, H + 0.5, az + ad);
        b.colorC(col('#8f8b84'));
        b.box(sx0 + 0.1, H - 0.1, az + 0.1, sx1 - 0.1, H + 0.12, az + ad - 0.1, { skipBottom: true });
        b.colorC(col('#9aa0a6'));
        b.box(sx0 + segW * 0.3, H, az + 2, sx0 + segW * 0.3 + 1.4, H + 1.1, az + 3.2);
      } else {
        const rise = ad * 0.42, o = 0.35, rc = col(st.roof);
        const zc = az + ad / 2, yr = H + rise, slope = rise / (ad / 2), ye = H - o * slope;
        b.colorC(rc, 0.88);
        b.quad(sx1 + o, ye, az - o, sx0 - o, ye, az - o, sx0 - o, yr, zc, sx1 + o, yr, zc);
        b.colorC(rc);
        b.quad(sx0 - o, ye, az + ad + o, sx1 + o, ye, az + ad + o, sx1 + o, yr, zc, sx0 - o, yr, zc);
        b.colorC(col('#6b5a4a'));
        b.quad(sx0 - o, ye, az - o, sx1 + o, ye, az - o, sx1 + o, ye - 0.0, az + ad + o, sx0 - o, ye, az + ad + o);
        b.colorC(wc, 0.95);
        b.tri(sx0, H, az, sx0, H, az + ad, sx0, yr, zc);
        b.tri(sx1, H, az, sx1, yr, zc, sx1, H, az + ad);
        b.colorC(rc, 0.7);
        b.box(sx0 - o, yr - 0.05, zc - 0.1, sx1 + o, yr + 0.08, zc + 0.1);
        if (si % 2 === 0) {
          b.colorC(col('#9a5444'));
          b.box(sx0 + 1.2, H + rise * 0.4, zc + 0.6, sx0 + 1.8, yr + 0.8, zc + 1.2);
        }
      }
      // Fenster (Süd- und Nordseite) + Rahmen
      const nWin = Math.max(1, Math.floor(segW / 2));
      const step = segW / nWin;
      for (let f = 0; f < floors; f++)
        for (let wi = 0; wi < nWin; wi++) {
          const cx = sx0 + step * (wi + 0.5);
          for (const side of [1, -1]) {
            const zf = side > 0 ? az + ad : az;
            const isDoor = f === 0 && side > 0 && Math.abs(cx - (apt.door[0] + 0.5)) < step / 2;
            const y0 = f * 3 + (f === 0 ? 0.9 : 0.85), y1 = y0 + 1.35;
            if (isDoor) {
              b.colorC(col('#5a3d2b'));
              b.box(cx - 0.6, 0, Math.min(zf - 0.05 * side, zf + 0.06 * side), cx + 0.6, 2.3, Math.max(zf - 0.05 * side, zf + 0.06 * side));
              b.colorC(col('#3a3d42'));
              b.box(cx - 0.9, 2.45, Math.min(zf, zf + 0.9 * side), cx + 0.9, 2.55, Math.max(zf, zf + 0.9 * side));
              b.colorC(col('#cfc9bd'));
              b.box(cx - 0.9, 0, Math.min(zf, zf + 0.7 * side), cx + 0.9, 0.12, Math.max(zf, zf + 0.7 * side), { skipBottom: true });
              continue;
            }
            b.colorC(col('#f4f1ea'));
            const fz = zf + 0.02 * side;
            if (side > 0) b.quad(cx - 0.55, y0 - 0.1, fz, cx + 0.55, y0 - 0.1, fz, cx + 0.55, y1 + 0.1, fz, cx - 0.55, y1 + 0.1, fz);
            else b.quad(cx + 0.55, y0 - 0.1, fz, cx - 0.55, y0 - 0.1, fz, cx - 0.55, y1 + 0.1, fz, cx + 0.55, y1 + 0.1, fz);
            b.box(cx - 0.6, y0 - 0.16, Math.min(zf, zf + 0.12 * side), cx + 0.6, y0 - 0.08, Math.max(zf, zf + 0.12 * side));
            const lit = hash2(Math.floor(cx * 3) + f * 101, side * 7 + ax) < 0.5 ? 1 : 0;
            windows.color(lit, hash2(Math.floor(cx * 5), f), 0);
            const wz = zf + 0.035 * side;
            if (side > 0) windows.quad(cx - 0.45, y0, wz, cx + 0.45, y0, wz, cx + 0.45, y1, wz, cx - 0.45, y1, wz);
            else windows.quad(cx + 0.45, y0, wz, cx - 0.45, y0, wz, cx - 0.45, y1, wz, cx + 0.45, y1, wz);
            b.colorC(col('#f4f1ea'));
            if (side > 0) b.box(cx - 0.02, y0, wz - 0.01, cx + 0.02, y1, wz + 0.02);
            if (st.balcony && f > 0 && side > 0 && wi % 2 === 0) {
              b.colorC(col('#e8e2d6'));
              b.box(cx - 0.8, f * 3 - 0.05, zf, cx + 0.8, f * 3 + 0.08, zf + 0.75);
              b.colorC(col('#f4f1ea'));
              b.box(cx - 0.8, f * 3 + 0.08, zf + 0.7, cx + 0.8, f * 3 + 0.95, zf + 0.75);
              b.box(cx - 0.8, f * 3 + 0.08, zf, cx - 0.76, f * 3 + 0.95, zf + 0.75);
              b.box(cx + 0.76, f * 3 + 0.08, zf, cx + 0.8, f * 3 + 0.95, zf + 0.75);
            }
          }
        }
      // Stirnseiten
      if (si === 0 || si === nSeg - 1)
        for (let f = 0; f < floors; f++)
          for (const zz of [az + 1.6, az + ad - 1.6]) {
            const xf = si === 0 ? sx0 - 0.035 : sx1 + 0.035, side = si === 0 ? -1 : 1;
            const y0 = f * 3 + 0.9, y1 = y0 + 1.3;
            const lit = hash2(Math.floor(zz * 3) + f * 31, si + ax) < 0.45 ? 1 : 0;
            windows.color(lit, hash2(Math.floor(zz), f + 3), 0);
            if (side > 0) windows.quad(xf, y0, zz + 0.4, xf, y0, zz - 0.4, xf, y1, zz - 0.4, xf, y1, zz + 0.4);
            else windows.quad(xf, y0, zz - 0.4, xf, y0, zz + 0.4, xf, y1, zz + 0.4, xf, y1, zz - 0.4);
          }
    }
  }

  let tris = 0;
  const geo = (b: GeoBuf): THREE.BufferGeometry => {
    tris += b.v / 3;
    return b.toGeometry();
  };
  const out: StaticOut = {
    solid: solid.map(geo),
    foliage: foliage.map(geo),
    foliageMeta: foliage.map((b) => b.c.slice(0, b.v * 3)),
    lamps: geo(lamps),
    lampPos: new Float32Array(lampPos),
    windows: windowsGeometry(windows),
    boats: geo(boats),
    ground: geo(ground),
    tris: 0,
  };
  tris += windows.v / 3;
  out.tris = tris;
  return out;
}

/** Fenster: Farbe kodiert (r = beleuchtet, g = Zufall) → eigenes Shader-Material liest das */
function windowsGeometry(b: GeoBuf): THREE.BufferGeometry {
  return rawToGeometry(b.p, b.n, b.c, 0, b.v);
}

// ---------- saisonale Laubfarben ----------
const PAL = {
  summer: [col('#4f8a3a'), col('#5f9c42'), col('#6aa84a')],
  spring: [col('#79bd55'), col('#8fcf62'), col('#a3d96e')],
  blossom: [col('#f2a9c4'), col('#f8cfdf'), col('#e996b6')],
  autumn: [col('#d9822b'), col('#c4472f'), col('#e3b23c'), col('#9a8a32'), col('#b8562a')],
  winterTree: col('#8a7a6a'),
  snow: col('#eef3f7'),
  pine: [col('#2f5e3a'), col('#3a6b42'), col('#28523a')],
  bush: [col('#4a7f38'), col('#558c3e')],
  bushAutumn: [col('#a8442e'), col('#b8702e')],
  petals: [col('#f2c230'), col('#e8607a'), col('#f4f1ea'), col('#b06ad8'), col('#ff8a5a'), col('#6aa0e8')],
  green: col('#4f8a3a'),
};
const _f = new THREE.Color();

/** Laubfarbe aus Metadaten (Art, Zufall, Oberseite) und Jahreszeit; p = Fortschritt in der Saison 0..1, snow 0..1 */
export function leafColor(kind: number, rnd: number, up: number, season: string, p: number, snow: number, out: THREE.Color): THREE.Color {
  const pick = (a: THREE.Color[]): THREE.Color => a[Math.floor(rnd * a.length) % a.length]!;
  switch (kind) {
    case Leaf.Pine:
      out.copy(pick(PAL.pine));
      break;
    case Leaf.Bush:
      out.copy(pick(PAL.bush));
      if (season === 'autumn') out.lerp(pick(PAL.bushAutumn), Math.min(1, 0.3 + p) * (rnd > 0.4 ? 0.9 : 0.4));
      else if (season === 'spring') out.lerp(PAL.spring[1]!, 0.4);
      break;
    case Leaf.Petal:
      out.copy(pick(PAL.petals));
      if (season === 'winter') out.copy(PAL.winterTree);
      else if (season === 'autumn') out.lerp(col('#a07040'), 0.5 * p);
      break;
    case Leaf.Green:
      out.copy(PAL.green);
      if (season === 'autumn') out.lerp(col('#8a8a3a'), 0.5);
      break;
    default: // Laubbaum
      if (season === 'spring') {
        out.copy(pick(PAL.spring));
        if (rnd > 0.78) out.copy(PAL.blossom[Math.floor(rnd * 977) % 3]!).lerp(pick(PAL.spring), Math.min(1, p * 1.2));
      } else if (season === 'summer') out.copy(pick(PAL.summer));
      else if (season === 'autumn') {
        _f.copy(PAL.autumn[Math.floor(rnd * 997) % PAL.autumn.length]!);
        out.copy(pick(PAL.summer)).lerp(_f, Math.min(1, 0.35 + p * 0.9));
      } else out.copy(PAL.winterTree).lerp(PAL.snow, 0.15);
  }
  // Oberseite heller, Unterseite dunkler
  out.multiplyScalar(0.72 + 0.36 * up);
  if (snow > 0 && up > 0.6) out.lerp(PAL.snow, Math.min(1, snow * (up - 0.55) * 2.2));
  return out;
}
