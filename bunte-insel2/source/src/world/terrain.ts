/* Gelände: Inseln aus Kreisen (mit Ausbuchtungen), Hügel, Plateaus, Stufen, eingeebnete Plätze und gemalte Wege.
   Die Höhenfunktion ist rein (ohne Three.js) und wird von Physik, Figuren und Gelände-Mesh gemeinsam benutzt. */
import { clamp, fbm2, lerp, smoothstep } from '../core/math.ts';

export interface Hill { x: number; z: number; r: number; h: number; flat?: number; tiers?: number; sx?: number }
export interface Flat { x: number; z: number; r: number; y: number; edge?: number }
export interface PathSeg { ax: number; az: number; bx: number; bz: number; w: number; color: number; y?: number }
export interface PaintCircle { x: number; z: number; r: number; color: number; ring?: number }
export interface IslandShape {
  id: string;
  x: number; z: number; r: number;
  lobes?: { x: number; z: number; r: number }[];
  height: number;          // Grundhöhe des Plateaus über dem Meer
  beach: number;           // Strandbreite
  bumps: number;           // Unebenheit
  hills: Hill[];
  flats: Flat[];
  paths: PathSeg[];
  paints: PaintCircle[];
  grass: number; grass2: number; sand: number; rock: number;
  /** Optional: eigene Bodenfarbe (z. B. Schachbrett im Dampfer-Hafen). */
  colorFn?: (x: number, z: number, y: number) => number | null;
  /** Optional: unterirdische Welten haben keinen Meeresstrand. */
  noSea?: boolean;
}

export const SEA_FLOOR = -6;

function segDist(px: number, pz: number, s: PathSeg): number {
  const vx = s.bx - s.ax, vz = s.bz - s.az, L = vx * vx + vz * vz || 1;
  const t = clamp(((px - s.ax) * vx + (pz - s.az) * vz) / L, 0, 1);
  return Math.hypot(px - (s.ax + vx * t), pz - (s.az + vz * t));
}

/** Abstand ins Inselinnere (positiv innen) – berücksichtigt Ausbuchtungen. */
export function insideDepth(s: IslandShape, x: number, z: number): number {
  let f = s.r - Math.hypot(x - s.x, z - s.z);
  if (s.lobes) for (const l of s.lobes) f = Math.max(f, l.r - Math.hypot(x - l.x, z - l.z));
  return f;
}
export function maxExtent(s: IslandShape): number {
  let m = s.r;
  if (s.lobes) for (const l of s.lobes) m = Math.max(m, Math.hypot(l.x - s.x, l.z - s.z) + l.r);
  return m;
}

export function islandHeight(s: IslandShape, x: number, z: number): number {
  const f = insideDepth(s, x, z);
  let y: number;
  if (s.noSea) y = s.height;
  else if (f >= s.beach) y = s.height;
  else if (f > 0) y = lerp(0.25, s.height, smoothstep(0, s.beach, f));
  else y = lerp(0.25, SEA_FLOOR, smoothstep(0, 22, -f));
  if (f > 0 && s.bumps > 0) y += (fbm2(x * 0.045, z * 0.045) - 0.5) * s.bumps * smoothstep(0, s.beach * 2, f);
  for (const h of s.hills) {
    const d = Math.hypot((x - h.x) / (h.sx ?? 1), z - h.z);
    if (d >= h.r) continue;
    let k: number;
    if (h.flat) k = smoothstep(h.r, h.r - h.flat, d);
    else { const t = 1 - d / h.r; k = t * t * (3 - 2 * t); }
    if (h.tiers) { const q = k * h.tiers, b = Math.floor(q); k = Math.min(1, (b + smoothstep(0.72, 1, q - b)) / h.tiers); }
    y += h.h * k;
  }
  for (const fl of s.flats) {
    const d = Math.hypot(x - fl.x, z - fl.z), e = fl.edge ?? 4;
    if (d < fl.r + e) y = lerp(fl.y, y, smoothstep(fl.r, fl.r + e, d));
  }
  for (const p of s.paths) {
    if (p.y === undefined) continue;
    const d = segDist(x, z, p);
    if (d < p.w / 2 + 3) y = lerp(p.y, y, smoothstep(p.w / 2, p.w / 2 + 3, d));
  }
  return y;
}

export function islandColor(s: IslandShape, x: number, z: number, y: number, slope: number): number {
  if (s.colorFn) { const c = s.colorFn(x, z, y); if (c !== null) return c; }
  for (let i = s.paths.length - 1; i >= 0; i--) {
    const p = s.paths[i];
    if (segDist(x, z, p) < p.w / 2) return p.color;
  }
  for (let i = s.paints.length - 1; i >= 0; i--) {
    const p = s.paints[i], d = Math.hypot(x - p.x, z - p.z);
    if (d < p.r && (!p.ring || d > p.r - p.ring)) return p.color;
  }
  if (slope > 0.9) return s.rock;
  if (y < 0.7 && !s.noSea) return y < -0.6 ? 0xc9b48a : s.sand;
  const n = fbm2(x * 0.06, z * 0.06);
  return n > 0.56 ? s.grass2 : s.grass;
}

/** Gemeinsame Höhenabfrage über alle Inseln (räumlich vorsortiert). */
export class TerrainField {
  private shapes: IslandShape[] = [];
  private ext = new Map<IslandShape, number>();
  add(s: IslandShape): void { this.shapes.push(s); this.ext.set(s, maxExtent(s) + 24); }
  get list(): readonly IslandShape[] { return this.shapes; }
  byId(id: string): IslandShape | undefined { return this.shapes.find(s => s.id === id); }
  height = (x: number, z: number): number => {
    let y = SEA_FLOOR;
    for (const s of this.shapes) {
      const e = this.ext.get(s)!;
      const dx = x - s.x, dz = z - s.z;
      if (dx * dx + dz * dz > e * e) continue;
      const h = islandHeight(s, x, z);
      if (h > y) y = h;
    }
    return y;
  };
  /** Welche Insel liegt hier? (tiefste Lage im Inneren gewinnt) */
  islandAt(x: number, z: number, margin = 0): IslandShape | null {
    let best: IslandShape | null = null, bf = -margin;
    for (const s of this.shapes) {
      const f = insideDepth(s, x, z);
      if (f > bf) { bf = f; best = s; }
    }
    return best;
  }
}
