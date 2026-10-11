import { ARENA, type TeamId, type Vec3 } from './types';

/**
 * Arena als Signed-Distance-Funktion des Innenraums (positiv = innen).
 * Innenraum = Vereinigung (max der Innenabstände) aus der abgerundeten Hauptbox und zwei abgerundeten Tor-Boxen.
 */

const R = ARENA.coveRadius;
const MAIN_CY = ARENA.height / 2;
const MAIN_HX = ARENA.halfWidth - R;
const MAIN_HY = ARENA.height / 2 - R;
const MAIN_HZ = ARENA.halfLength - R;

/** Rundung der Torkanten */
export const GOAL_ROUND = 1.2;
/** Wie weit die Tor-Box in die Hauptbox hineinragt (nur für saubere Vereinigung) */
const GOAL_OVERLAP = 4;
const GOAL_CY = ARENA.goalHeight / 2;
const GOAL_CZ = ARENA.halfLength + (ARENA.goalDepth - GOAL_OVERLAP) / 2;
const GOAL_HX = ARENA.goalHalfWidth - GOAL_ROUND;
const GOAL_HY = ARENA.goalHeight / 2 - GOAL_ROUND;
const GOAL_HZ = (ARENA.goalDepth + GOAL_OVERLAP) / 2 - GOAL_ROUND;

const T = new Float64Array(4);

/** Innenabstand zu einer abgerundeten Box (Mitte c, innere Halbmaße h, Rundung rad); schreibt [dist, nx, ny, nz] (Normale nach innen) in T */
function roundedBox(
  px: number,
  py: number,
  pz: number,
  cy: number,
  cz: number,
  hx: number,
  hy: number,
  hz: number,
  rad: number,
): void {
  const dx = px;
  const dy = py - cy;
  const dz = pz - cz;
  const sx = dx < 0 ? -1 : 1;
  const sy = dy < 0 ? -1 : 1;
  const sz = dz < 0 ? -1 : 1;
  const qx = dx * sx - hx;
  const qy = dy * sy - hy;
  const qz = dz * sz - hz;
  const mx = qx > 0 ? qx : 0;
  const my = qy > 0 ? qy : 0;
  const mz = qz > 0 ? qz : 0;
  const l2 = mx * mx + my * my + mz * mz;
  if (l2 > 0) {
    const l = Math.sqrt(l2);
    T[0] = rad - l;
    T[1] = (-mx * sx) / l;
    T[2] = (-my * sy) / l;
    T[3] = (-mz * sz) / l;
  } else if (qx >= qy && qx >= qz) {
    T[0] = rad - qx;
    T[1] = -sx;
    T[2] = 0;
    T[3] = 0;
  } else if (qy >= qz) {
    T[0] = rad - qy;
    T[1] = 0;
    T[2] = -sy;
    T[3] = 0;
  } else {
    T[0] = rad - qz;
    T[1] = 0;
    T[2] = 0;
    T[3] = -sz;
  }
}

/** Schnelle Variante ohne Allokation: schreibt [dist, nx, ny, nz] nach out und gibt dist zurück */
export function arenaSdf(x: number, y: number, z: number, out: Float64Array | number[]): number {
  roundedBox(x, y, z, MAIN_CY, 0, MAIN_HX, MAIN_HY, MAIN_HZ, R);
  let d = T[0] as number;
  let nx = T[1] as number;
  let ny = T[2] as number;
  let nz = T[3] as number;
  const az = z < 0 ? -z : z;
  roundedBox(x, y, az, GOAL_CY, GOAL_CZ, GOAL_HX, GOAL_HY, GOAL_HZ, GOAL_ROUND);
  if ((T[0] as number) > d) {
    d = T[0] as number;
    nx = T[1] as number;
    ny = T[2] as number;
    nz = z < 0 ? -(T[3] as number) : (T[3] as number);
  }
  out[0] = d;
  out[1] = nx;
  out[2] = ny;
  out[3] = nz;
  return d;
}

const TMP = new Float64Array(4);

/** Abstand zur nächsten Arena-Innenfläche (positiv = innen) + Normale nach innen */
export function arenaDistance(
  p: Vec3,
  out: { dist: number; nx: number; ny: number; nz: number } = { dist: 0, nx: 0, ny: 1, nz: 0 },
): { dist: number; nx: number; ny: number; nz: number } {
  arenaSdf(p[0], p[1], p[2], TMP);
  out.dist = TMP[0] as number;
  out.nx = TMP[1] as number;
  out.ny = TMP[2] as number;
  out.nz = TMP[3] as number;
  return out;
}

/** Liegt der Mittelpunkt hinter der Torlinie in der Toröffnung? Gibt das angreifende Team zurück (Team 0 trifft bei +z) oder −1. */
export function goalAt(x: number, y: number, z: number): TeamId | -1 {
  if (x < -ARENA.goalHalfWidth || x > ARENA.goalHalfWidth || y > ARENA.goalHeight) return -1;
  if (z > ARENA.halfLength) return 0;
  if (z < -ARENA.halfLength) return 1;
  return -1;
}

/** Boost-Pads: 6 große + 28 kleine, symmetrisch (Spiegelung an x und z). Reihenfolge ist fest (Determinismus). */
function buildPads(): Array<{ pos: Vec3; big: boolean }> {
  const out: Array<{ pos: Vec3; big: boolean }> = [];
  const mirror = (x: number, z: number, big: boolean): void => {
    const xs = x === 0 ? [1] : [1, -1];
    const zs = z === 0 ? [1] : [1, -1];
    for (const sx of xs) for (const sz of zs) out.push({ pos: [x * sx, 0, z * sz], big });
  };
  // große: vier Ecken nahe den Torlinien + zwei an den Seitenwänden (Mitte)
  mirror(30, 42, true);
  mirror(33, 0, true);
  // kleine: 5 Viertelpunkte (x4) + 3 Mittellinie x=0 (x2) + 1 Querlinie z=0 (x2) = 28
  mirror(22, 38, false);
  mirror(12, 24, false);
  mirror(28, 16, false);
  mirror(18, 8, false);
  mirror(30, 28, false);
  mirror(0, 40, false);
  mirror(0, 26, false);
  mirror(0, 12, false);
  mirror(20, 0, false);
  return out;
}

export const BOOST_PADS: ReadonlyArray<{ pos: Vec3; big: boolean }> = buildPads();

export interface KickoffSlot {
  pos: Vec3;
  /** Blickrichtung: +1 = +z (Team 0), −1 = −z */
  facing: 1 | -1;
}

/** Anstoß-Plätze für Team 0 (Hälfte z < 0, Blick nach +z), je Teamgröße 1–3. Team 1 wird gespiegelt (siehe kickoffSlot). */
export const KICKOFF_POSITIONS: Readonly<Record<1 | 2 | 3, ReadonlyArray<KickoffSlot>>> = {
  1: [{ pos: [0, 0.185, -30], facing: 1 }],
  2: [
    { pos: [-9, 0.185, -30], facing: 1 },
    { pos: [9, 0.185, -30], facing: 1 },
  ],
  3: [
    { pos: [-14, 0.185, -30], facing: 1 },
    { pos: [14, 0.185, -30], facing: 1 },
    { pos: [0, 0.185, -38], facing: 1 },
  ],
};

/** Platz Nr. index (0-basiert) für ein Team der Größe teamSize; Team 1 gespiegelt (x, z negiert, Blick −z) */
export function kickoffSlot(team: TeamId, teamSize: number, index: number): { pos: Vec3; facing: 1 | -1 } {
  const size = (teamSize < 1 ? 1 : teamSize > 3 ? 3 : teamSize) as 1 | 2 | 3;
  const list = KICKOFF_POSITIONS[size];
  const base = list[index % list.length] as KickoffSlot;
  const extra = Math.floor(index / list.length) * 5; // mehr als 3 pro Team: weiter hinten
  const z = base.pos[2] - extra;
  if (team === 0) return { pos: [base.pos[0], base.pos[1], z], facing: 1 };
  return { pos: [-base.pos[0], base.pos[1], -z], facing: -1 };
}
