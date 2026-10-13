// Geländehöhe der Insel. Wird einmal als Höhenkarte berechnet (2-m-Raster) und dann bilinear abgefragt.
import { HEIGHT_RES, MAP_CENTER, MAP_SIZE, SEA_FLOOR, WATER_LEVEL } from './constants';
import { CRATER, DESERT, ISLAND_RADIUS, LAKES, MOUNTAINS, POIS, RIVER, ROADS, type Line } from './mapdef';
import { clamp, distToPolyline, fbm, lerp, smoothstep, valueNoise } from './math';

const SEED = 7331;

interface Box {
  x0: number;
  z0: number;
  x1: number;
  z1: number;
}
const bbox = (l: Line, pad: number): Box => {
  let x0 = Infinity,
    z0 = Infinity,
    x1 = -Infinity,
    z1 = -Infinity;
  for (const [x, z] of l) {
    x0 = Math.min(x0, x);
    z0 = Math.min(z0, z);
    x1 = Math.max(x1, x);
    z1 = Math.max(z1, z);
  }
  return { x0: x0 - pad, z0: z0 - pad, x1: x1 + pad, z1: z1 + pad };
};
const inBox = (b: Box, x: number, z: number): boolean => x >= b.x0 && x <= b.x1 && z >= b.z0 && z <= b.z1;
const RIVER_BOX = bbox(RIVER, 80);
const ROAD_BOXES = ROADS.map((r) => bbox(r, 14));

/** Abstand zur Küstenlinie normiert: < 1 = Land. */
export function islandDist(x: number, z: number): number {
  const dx = x - MAP_CENTER,
    dz = z - MAP_CENTER;
  const d = Math.hypot(dx, dz);
  const warp = fbm(x / 260, z / 260, SEED + 3, 3) * 0.14 + fbm(x / 80, z / 80, SEED + 9, 2) * 0.035;
  return d / (ISLAND_RADIUS * (1 + warp));
}

/** Grundgelände ohne Orte, Flüsse und Straßen. detail=false liefert eine geglättete Variante für Straßen. */
function baseHeight(x: number, z: number, detail: boolean): number {
  const id = islandDist(x, z);
  const land = 1 - smoothstep(0.84, 1.0, id);
  // Strandnähe flach halten
  const coast = smoothstep(0.84, 0.7, id);
  let h = 4.2 + coast * (5 + 12 * Math.max(0, fbm(x / 240, z / 240, SEED, 3) + 0.25));
  if (detail) h += coast * 3.2 * fbm(x / 60, z / 60, SEED + 17, 3);
  for (const m of MOUNTAINS) {
    const d2 = (x - m.x) ** 2 + (z - m.z) ** 2;
    const g = Math.exp(-d2 / (2 * (m.r * 0.62) ** 2));
    if (g > 0.001) {
      const ridge = 1 - Math.abs(valueNoise(x / 55, z / 55, SEED + 31));
      h += m.h * g * (0.82 + 0.25 * ridge);
    }
  }
  // Mesas der Rostschlucht
  const dd = Math.hypot(x - DESERT.x, z - DESERT.z);
  if (dd < DESERT.r) {
    const w = 1 - smoothstep(DESERT.r * 0.55, DESERT.r, dd);
    const r = Math.abs(valueNoise(x / 90, z / 90, SEED + 41));
    const mesa = smoothstep(0.25, 0.32, r) * 16;
    h += w * mesa * coast;
  }
  // Riftkrater
  const dc = Math.hypot(x - CRATER.x, z - CRATER.z);
  if (dc < CRATER.rim * 1.6) {
    const rim = Math.exp(-((dc - CRATER.rim) ** 2) / (2 * 22 ** 2)) * CRATER.rimH;
    const inner = 1 - smoothstep(CRATER.r * 0.55, CRATER.rim, dc);
    h = lerp(h + rim, CRATER.floor + (dc / CRATER.rim) ** 2 * 6, inner);
  }
  return lerp(SEA_FLOOR, h, land);
}

/** Exakte Höhe an einer Stelle (teuer – zur Höhenkarten-Erzeugung). */
export function computeHeight(x: number, z: number): number {
  let h = baseHeight(x, z, true);
  // Orte einebnen
  for (const p of POIS) {
    if (!p.flat) continue;
    const d = Math.hypot(x - p.x, z - p.z);
    if (d > p.flat * 1.25) continue;
    const target = Math.max(WATER_LEVEL + 1.6, p.level ?? baseHeight(p.x, p.z, false));
    const w = 1 - smoothstep(p.flat * 0.72, p.flat * 1.25, d);
    h = lerp(h, target, w);
  }
  // Straßen glätten
  for (let i = 0; i < ROADS.length; i++) {
    if (!inBox(ROAD_BOXES[i]!, x, z)) continue;
    const d = distToPolyline(x, z, ROADS[i]!);
    if (d < 12) {
      const smooth = Math.max(WATER_LEVEL + 1.2, baseHeight(x, z, false));
      h = lerp(h, Math.max(h - 1.5, Math.min(h + 1.5, smooth)), 1 - smoothstep(3, 12, d));
    }
  }
  // Seen
  for (const l of LAKES) {
    const d = Math.hypot(x - l.x, z - l.z);
    if (d < l.r * 1.6) {
      const w = 1 - smoothstep(l.r * 0.6, l.r * 1.25, d);
      h = Math.min(h, lerp(h, WATER_LEVEL - 4, w));
    }
  }
  // Fluss
  if (inBox(RIVER_BOX, x, z)) {
    const d = distToPolyline(x, z, RIVER);
    const depth = Math.max(0, h - (WATER_LEVEL - 2.6));
    const width = 8 + depth * 0.9;
    if (d < width + 4) {
      const w = 1 - smoothstep(7, width, d);
      h = Math.min(h, lerp(h, WATER_LEVEL - 2.6, w));
    }
  }
  return h;
}

// Höhen werden auf 1 cm gerundet, damit Server, Worker und eine vorberechnete Datei exakt übereinstimmen.
export const HEIGHT_MIN = -16;
export const HEIGHT_Q = 100;
export const quantizeHeight = (h: number): number => Math.round((h - HEIGHT_MIN) * HEIGHT_Q) / HEIGHT_Q + HEIGHT_MIN;

/** Höhenkarte als Uint16 (für die vorberechnete Datei). */
export function encodeHeights(h: Float32Array): Uint16Array {
  const out = new Uint16Array(h.length);
  for (let i = 0; i < h.length; i++) out[i] = Math.max(0, Math.min(65535, Math.round((h[i]! - HEIGHT_MIN) * HEIGHT_Q)));
  return out;
}
export function decodeHeights(u: Uint16Array): Float32Array {
  const out = new Float32Array(u.length);
  for (let i = 0; i < u.length; i++) out[i] = u[i]! / HEIGHT_Q + HEIGHT_MIN;
  return out;
}

export const enum Biome {
  Meadow = 0,
  Forest = 1,
  Beach = 2,
  Rock = 3,
  Snow = 4,
  Desert = 5,
  Crater = 6,
  Road = 7,
  Seabed = 8,
  Farm = 9,
  Town = 10,
}

export class Terrain {
  readonly n: number;
  readonly res = HEIGHT_RES;
  readonly h: Float32Array;

  constructor(heights?: Float32Array) {
    this.n = Math.round(MAP_SIZE / HEIGHT_RES) + 1;
    if (heights && heights.length === this.n * this.n) {
      this.h = heights;
    } else {
      this.h = new Float32Array(this.n * this.n);
      for (let j = 0; j < this.n; j++) {
        for (let i = 0; i < this.n; i++) this.h[j * this.n + i] = quantizeHeight(computeHeight(i * HEIGHT_RES, j * HEIGHT_RES));
      }
    }
  }

  /** Höhe am Rasterpunkt. */
  at(i: number, j: number): number {
    i = i < 0 ? 0 : i >= this.n ? this.n - 1 : i;
    j = j < 0 ? 0 : j >= this.n ? this.n - 1 : j;
    return this.h[j * this.n + i]!;
  }

  /** Höhe an beliebiger Stelle; außerhalb der Karte: Meeresboden. Interpoliert wie das Dreiecksnetz. */
  height(x: number, z: number): number {
    if (x < 0 || z < 0 || x > MAP_SIZE || z > MAP_SIZE) return SEA_FLOOR;
    const fx = x / HEIGHT_RES,
      fz = z / HEIGHT_RES;
    const i = Math.min(this.n - 2, Math.floor(fx)),
      j = Math.min(this.n - 2, Math.floor(fz));
    const u = fx - i,
      v = fz - j;
    const n = this.n,
      H = this.h;
    const a = H[j * n + i]!,
      b = H[j * n + i + 1]!,
      c = H[(j + 1) * n + i]!,
      d = H[(j + 1) * n + i + 1]!;
    // Zwei Dreiecke je Zelle (Diagonale von b nach c), passend zum gerenderten Netz
    if (u + v <= 1) return a + (b - a) * u + (c - a) * v;
    return d + (c - d) * (1 - u) + (b - d) * (1 - v);
  }

  /** Normale (nicht normiert ist ok für Neigungsprüfungen) – liefert ny nach Normierung. */
  normal(x: number, z: number, out: { x: number; y: number; z: number }): typeof out {
    const e = HEIGHT_RES;
    const hx = this.height(x + e, z) - this.height(x - e, z);
    const hz = this.height(x, z + e) - this.height(x, z - e);
    const nx = -hx,
      ny = 2 * e,
      nz = -hz;
    const l = Math.hypot(nx, ny, nz);
    out.x = nx / l;
    out.y = ny / l;
    out.z = nz / l;
    return out;
  }

  /** Wassertiefe an der Stelle (0 = trocken). */
  waterDepth(x: number, z: number): number {
    return Math.max(0, WATER_LEVEL - this.height(x, z));
  }

  biome(x: number, z: number, h: number, slope: number): Biome {
    if (h < WATER_LEVEL - 0.4) return Biome.Seabed;
    for (let i = 0; i < ROADS.length; i++) {
      if (inBox(ROAD_BOXES[i]!, x, z) && distToPolyline(x, z, ROADS[i]!) < 3.2) return Biome.Road;
    }
    const dc = Math.hypot(x - CRATER.x, z - CRATER.z);
    if (dc < CRATER.rim * 0.92) return Biome.Crater;
    if (h > 62 + fbm(x / 40, z / 40, 5, 2) * 6) return Biome.Snow;
    if (slope > 0.62) return Biome.Rock;
    if (h < WATER_LEVEL + 1.4 && islandDist(x, z) > 0.78) return Biome.Beach;
    const dd = Math.hypot(x - DESERT.x, z - DESERT.z);
    if (dd < DESERT.r * (0.72 + 0.12 * fbm(x / 70, z / 70, 3, 2))) return Biome.Desert;
    for (const p of POIS) {
      const d = Math.hypot(x - p.x, z - p.z);
      if (p.kind === 'farm' && d < p.r * 1.1) return Biome.Farm;
      if ((p.kind === 'city' || p.kind === 'harbor') && d < p.r * 0.85) return Biome.Town;
    }
    if (forestDensity(x, z) > 0.45) return Biome.Forest;
    return Biome.Meadow;
  }
}

/** Walddichte 0 … 1 (Glimmerwald und Hänge). */
export function forestDensity(x: number, z: number): number {
  const g = POIS[4]!;
  const d = Math.hypot(x - g.x, z - g.z);
  let v = 1 - smoothstep(g.r * 0.7, g.r * 1.9, d);
  v += 0.55 * (1 - smoothstep(60, 240, Math.hypot(x - 650, z - 470)));
  v += 0.35 * (1 - smoothstep(80, 260, Math.hypot(x - 980, z - 900)));
  v += 0.35 * (1 - smoothstep(60, 200, Math.hypot(x - 1300, z - 300)));
  v += fbm(x / 90, z / 90, 61, 3) * 0.45;
  return clamp(v, 0, 1);
}

let shared: Terrain | null = null;
/** Einmal pro Prozess/Worker berechnete Insel. */
export function getTerrain(): Terrain {
  if (!shared) shared = new Terrain();
  return shared;
}
export function setTerrain(t: Terrain): void {
  shared = t;
}
