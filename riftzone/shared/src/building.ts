// Bausystem: Rasterplatzierung von Wand, Boden und Rampe (4-m-Raster), Stabilität und Einsturz.
import { BUILD_RANGE, EYE_HEIGHT, GRID, WALL_H } from './constants';
import { Kind, Mat, isBuilt, makePiece, type Piece } from './pieces';
import type { World } from './world';

export const enum BuildPiece {
  Wall = 0,
  Floor = 1,
  Ramp = 2,
}
export const BUILD_NAMES = ['Wand', 'Boden', 'Rampe'] as const;
export const BUILD_KINDS = [Kind.BWall, Kind.BFloor, Kind.BRamp] as const;

export interface Placement {
  kind: Kind;
  x: number;
  y: number;
  z: number;
  hx: number;
  hy: number;
  hz: number;
  dir: number;
  key: string;
}

/** Dominante Himmelsrichtung der Blickrichtung: 0 = +x, 1 = +z, 2 = -x, 3 = -z. */
export function facingDir(yaw: number): number {
  const fx = -Math.sin(yaw),
    fz = -Math.cos(yaw);
  if (Math.abs(fx) >= Math.abs(fz)) return fx > 0 ? 0 : 2;
  return fz > 0 ? 1 : 3;
}
export const V_SNAP = 2;
const DX = [1, 0, -1, 0],
  DZ = [0, 1, 0, -1];

/** Berechnet, wo ein Bauteil landen würde. */
export function computePlacement(piece: BuildPiece, px: number, feetY: number, pz: number, yaw: number, pitch: number): Placement {
  const dir = facingDir(yaw);
  const lookUp = pitch > 0.55,
    lookDown = pitch < -0.55;
  // Vertikal rastet das Gitter alle 2 m ein: Bauteile passen so auch an Hängen (max. 1,4 m im Boden)
  const level = Math.floor((feetY + 0.6) / V_SNAP) * V_SNAP;
  const pcx = Math.floor(px / GRID),
    pcz = Math.floor(pz / GRID);
  if (piece === BuildPiece.Wall) {
    // Wand an der Kante der eigenen Zelle in Blickrichtung (bzw. davor, wenn man sehr nah an der Kante steht)
    let cx = pcx,
      cz = pcz;
    const fx = px - pcx * GRID,
      fz = pz - pcz * GRID;
    if (dir === 0 && fx > GRID - 0.8) cx++;
    if (dir === 2 && fx < 0.8) cx--;
    if (dir === 1 && fz > GRID - 0.8) cz++;
    if (dir === 3 && fz < 0.8) cz--;
    const y = level + (lookUp ? WALL_H : 0);
    if (dir === 0 || dir === 2) {
      const ex = (cx + (dir === 0 ? 1 : 0)) * GRID;
      return { kind: Kind.BWall, x: ex, y: y + WALL_H / 2, z: cz * GRID + GRID / 2, hx: 0.16, hy: WALL_H / 2, hz: GRID / 2, dir, key: `w${ex / GRID}|${y}|${cz}|x` };
    }
    const ez = (cz + (dir === 1 ? 1 : 0)) * GRID;
    return { kind: Kind.BWall, x: cx * GRID + GRID / 2, y: y + WALL_H / 2, z: ez, hx: GRID / 2, hy: WALL_H / 2, hz: 0.16, dir, key: `w${cx}|${y}|${ez / GRID}|z` };
  }
  if (piece === BuildPiece.Floor) {
    let cx = pcx,
      cz = pcz,
      y = level;
    if (lookUp) y += WALL_H;
    else if (!lookDown) {
      cx += DX[dir]!;
      cz += DZ[dir]!;
    }
    return { kind: Kind.BFloor, x: cx * GRID + GRID / 2, y: y - 0.15, z: cz * GRID + GRID / 2, hx: GRID / 2, hy: 0.15, hz: GRID / 2, dir: 0, key: `f${cx}|${y}|${cz}` };
  }
  // Rampe: Zelle, in der der Punkt 2,2 m vor den Füßen liegt
  const ax = px + DX[dir]! * 2.2,
    az = pz + DZ[dir]! * 2.2;
  const cx = Math.floor(ax / GRID),
    cz = Math.floor(az / GRID);
  const y = level + (lookUp ? WALL_H : 0);
  return { kind: Kind.BRamp, x: cx * GRID + GRID / 2, y: y + WALL_H / 2, z: cz * GRID + GRID / 2, hx: GRID / 2, hy: WALL_H / 2, hz: GRID / 2, dir, key: `r${cx}|${y}|${cz}` };
}

export function placementInRange(p: Placement, px: number, feetY: number, pz: number): boolean {
  const ey = feetY + EYE_HEIGHT;
  const cx = Math.max(p.x - p.hx, Math.min(px, p.x + p.hx));
  const cy = Math.max(p.y - p.hy, Math.min(ey, p.y + p.hy));
  const cz = Math.max(p.z - p.hz, Math.min(pz, p.z + p.hz));
  return Math.hypot(cx - px, cy - ey, cz - pz) <= BUILD_RANGE;
}

export function makeBuilt(pl: Placement, mat: Mat, team: number): Piece {
  return makePiece(pl.kind, pl.x, pl.y, pl.z, pl.hx, pl.hy, pl.hz, { dir: pl.dir, mat, team, style: mat });
}

/** Steht ein gebautes Teil direkt auf etwas Festem (Gelände oder Weltbauteil)? */
export function grounded(world: World, p: Piece): boolean {
  const bottom = p.y - p.hy;
  const pts: [number, number][] = [
    [p.x, p.z],
    [p.x - p.hx * 0.9, p.z - p.hz * 0.9],
    [p.x + p.hx * 0.9, p.z - p.hz * 0.9],
    [p.x - p.hx * 0.9, p.z + p.hz * 0.9],
    [p.x + p.hx * 0.9, p.z + p.hz * 0.9],
  ];
  for (const [x, z] of pts) if (world.terrain.height(x, z) >= bottom - 0.4) return true;
  let touch = false;
  world.query(p.x - p.hx - 0.2, p.z - p.hz - 0.2, p.x + p.hx + 0.2, p.z + p.hz + 0.2, (q) => {
    if (touch || q.id === p.id || !q.alive || isBuilt(q.kind) || q.kind === Kind.Pad || q.kind === Kind.Bush) return;
    if (q.y + q.hy < bottom - 0.25 || q.y - q.hy > p.y + p.hy + 0.25) return;
    touch = true;
  });
  return touch;
}

function touching(a: Piece, b: Piece): boolean {
  const e = 0.25;
  return (
    Math.abs(a.x - b.x) <= a.hx + b.hx + e && Math.abs(a.y - b.y) <= a.hy + b.hy + e && Math.abs(a.z - b.z) <= a.hz + b.hz + e
  );
}

/**
 * Nach dem Zerstören eines Teils: alle gebauten Teile in der Nähe prüfen, ob sie noch (über Nachbarn)
 * mit dem Boden verbunden sind. Liefert die IDs der Teile, die einstürzen.
 */
export function findUnsupported(world: World, x: number, z: number, radius = 40): number[] {
  const near: Piece[] = [];
  world.query(x - radius, z - radius, x + radius, z + radius, (p) => {
    if (p.alive && isBuilt(p.kind)) near.push(p);
  });
  if (!near.length) return [];
  const supported = new Set<number>();
  const queue: Piece[] = [];
  for (const p of near)
    if (grounded(world, p)) {
      supported.add(p.id);
      queue.push(p);
    }
  while (queue.length) {
    const a = queue.pop()!;
    for (const b of near) {
      if (supported.has(b.id)) continue;
      if (touching(a, b)) {
        supported.add(b.id);
        queue.push(b);
      }
    }
  }
  return near.filter((p) => !supported.has(p.id)).map((p) => p.id);
}
