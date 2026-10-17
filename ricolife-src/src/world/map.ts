// Statisches Stadtbild von Lindenhafen: Straßen, Gehwege, Wasser, Bäume, Laternen und Verkehrswege.
import { LOTS } from '../data/lots';
import { Rng } from '../core/rng';
import { MAP_H, MAP_W, Ter, type World } from './world';

export const ROADS_H: [number, number][] = [
  [0, 4],
  [46, 50],
  [69, 73],
  [96, 100],
];
export const ROADS_V: [number, number][] = [
  [46, 50],
  [96, 100],
];
export const WATER_X = 148;
export const ROAD_END_X = 144;

export const isRoad = (x: number, z: number): boolean =>
  (x < ROAD_END_X && ROADS_H.some(([a, b]) => z >= a && z < b)) || ROADS_V.some(([a, b]) => x >= a && x < b);

export interface Deco {
  kind: 'tree' | 'pine' | 'bush' | 'lamp' | 'bench' | 'flowers' | 'hydrant' | 'sign' | 'boat' | 'busstop';
  x: number;
  z: number;
  r: number;
  s: number;
}

export function buildTerrain(w: World): void {
  const t = w.terrain;
  t.fill(Ter.Grass);
  for (let z = 0; z < MAP_H; z++)
    for (let x = 0; x < MAP_W; x++) {
      const i = z * MAP_W + x;
      if (x >= WATER_X) t[i] = Ter.Water;
      else if (isRoad(x, z)) t[i] = Ter.Road;
      else if (x >= ROAD_END_X) t[i] = Ter.Plaza; // Promenade
      else if (w.lotMap[i]) t[i] = Ter.Lot;
    }
  // Gehwege: 2 Kacheln neben Straßen, außerhalb von Lots
  for (let z = 0; z < MAP_H; z++)
    for (let x = 0; x < WATER_X; x++) {
      const i = z * MAP_W + x;
      if (t[i] !== Ter.Grass) continue;
      let near = false;
      for (let dz = -2; dz <= 2 && !near; dz++) for (let dx = -2; dx <= 2 && !near; dx++) if (isRoad(x + dx, z + dz)) near = true;
      if (near) t[i] = Ter.Walk;
    }
  // Steg am Pier
  for (let z = 79; z <= 81; z++) for (let x = WATER_X; x < 157; x++) t[z * MAP_W + x] = Ter.Wood;
  for (let z = 77; z <= 83; z++) for (let x = 154; x < 157; x++) t[z * MAP_W + x] = Ter.Wood;
  // Sandstreifen an der Promenade
  for (let z = 6; z < 26; z++) t[z * MAP_W + 147] = Ter.Sand;
}

/** Dekoration entlang der Straßen (deterministisch). Blockiert keine Wege außer Bäumen auf Grünflächen. */
export function buildDeco(w: World): Deco[] {
  const rng = new Rng(4711);
  const out: Deco[] = [];
  const t = w.terrain;
  const at = (x: number, z: number): number => (x >= 0 && z >= 0 && x < MAP_W && z < MAP_H ? t[z * MAP_W + x]! : -1);
  // Laternen und Bäume entlang der waagerechten Straßen
  for (const [a, b] of ROADS_H) {
    for (let x = 2; x < ROAD_END_X; x += 6) {
      for (const z of [a - 1, b]) {
        if (at(x, z) !== Ter.Walk) continue;
        if (ROADS_V.some(([va, vb]) => x >= va - 2 && x < vb + 2)) continue;
        if ((x / 6) % 2 === 0) out.push({ kind: 'lamp', x: x + 0.5, z: z + (z < a ? 0.15 : 0.85), r: 0, s: 1 });
        else out.push({ kind: 'tree', x: x + 0.5, z: z + 0.5, r: rng.range(0, 6.28), s: rng.range(0.85, 1.2) });
      }
    }
  }
  for (const [a, b] of ROADS_V) {
    for (let z = 2; z < MAP_H; z += 6) {
      for (const x of [a - 1, b]) {
        if (at(x, z) !== Ter.Walk) continue;
        if (ROADS_H.some(([ha, hb]) => z >= ha - 2 && z < hb + 2)) continue;
        if ((z / 6) % 2 === 0) out.push({ kind: 'lamp', x: x + (x < a ? 0.15 : 0.85), z: z + 0.5, r: 0, s: 1 });
        else out.push({ kind: 'tree', x: x + 0.5, z: z + 0.5, r: rng.range(0, 6.28), s: rng.range(0.85, 1.2) });
      }
    }
  }
  // Grünflächen zwischen Lots: Bäume und Büsche
  for (let i = 0; i < 260; i++) {
    const x = rng.int(0, WATER_X - 1),
      z = rng.int(0, MAP_H - 1);
    if (at(x, z) !== Ter.Grass) continue;
    const kind = rng.chance(0.25) ? 'pine' : rng.chance(0.4) ? 'bush' : rng.chance(0.3) ? 'flowers' : 'tree';
    out.push({ kind, x: x + 0.5, z: z + 0.5, r: rng.range(0, 6.28), s: rng.range(0.7, 1.25) });
  }
  // Promenade
  for (let z = 4; z < 96; z += 7) {
    out.push({ kind: 'lamp', x: 147.6, z: z + 0.5, r: 0, s: 1 });
    if (z % 2) out.push({ kind: 'bench', x: 146.3, z: z + 3, r: Math.PI / 2, s: 1 });
  }
  out.push({ kind: 'boat', x: 152, z: 60, r: 0.2, s: 1 }, { kind: 'boat', x: 153, z: 35, r: -0.4, s: 0.8 }, { kind: 'boat', x: 151, z: 90, r: 1.2, s: 1.1 });
  // Bushaltestellen je Bezirk
  out.push({ kind: 'busstop', x: 24, z: 45.2, r: 0, s: 1 }, { kind: 'busstop', x: 72, z: 50.8, r: Math.PI, s: 1 }, { kind: 'busstop', x: 120, z: 45.2, r: 0, s: 1 });
  return out;
}

/** Fahrspuren für den Verkehr (Mittellinien der Spuren) */
export interface Lane {
  ax: number;
  az: number;
  bx: number;
  bz: number;
}
export function lanes(): Lane[] {
  const out: Lane[] = [];
  for (const [a] of ROADS_H) {
    out.push({ ax: 0.5, az: a + 1.1, bx: ROAD_END_X - 0.5, bz: a + 1.1 });
    out.push({ ax: ROAD_END_X - 0.5, az: a + 2.9, bx: 0.5, bz: a + 2.9 });
  }
  for (const [a] of ROADS_V) {
    out.push({ ax: a + 2.9, az: 0.5, bx: a + 2.9, bz: MAP_H - 0.5 });
    out.push({ ax: a + 1.1, az: MAP_H - 0.5, bx: a + 1.1, bz: 0.5 });
  }
  return out;
}

/** Zugangspunkt eines Lots am Gehweg (Mitte der Straßenseite, eine Kachel außerhalb) */
export function lotEntrance(lotId: string): [number, number] {
  const l = LOTS.find((x) => x.id === lotId);
  if (!l) return [24, 48];
  switch (l.front) {
    case 0:
      return [l.x + l.w / 2, l.z - 0.5];
    case 1:
      return [l.x + l.w + 0.5, l.z + l.d / 2];
    case 2:
      return [l.x + l.w / 2, l.z + l.d + 0.5];
    default:
      return [l.x - 0.5, l.z + l.d / 2];
  }
}
