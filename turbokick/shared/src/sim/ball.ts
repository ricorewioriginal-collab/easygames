import { arenaSdf } from './arena';
import { quatBasis } from './math';
import { ARENA, BALL_RADIUS, CAR_HALF, TICK_DT, type BallState, type CarState, type SimEvent } from './types';

/** Werte der Plasmakugel */
export const BALL_TUNING = {
  gravity: 6.5,
  restitution: 0.6,
  /** Aufprallgeschwindigkeit, unter der nicht mehr gefedert wird */
  restThreshold: 1.0,
  /** Reibwert an Wänden/Boden */
  friction: 0.3,
  airDrag: 0.03,
  rollDamp: 0.1,
  spinDamp: 0.1,
  maxSpeed: 60,
  maxSpin: 6,
  substeps: 3,
  /** Auto–Ball */
  carRestitution: 0.4,
  carFriction: 0.35,
  powerBase: 0.55,
  powerSpeed: 0.4,
  powerRefSpeed: 23,
  hitFlatten: 0.35,
  hitLift: 0.1,
  /** Rückstoß auf das Auto relativ zur Ballgeschwindigkeitsänderung */
  carRecoil: 0.04,
  wallEventSpeed: 4,
} as const;

const T = BALL_TUNING;
const R = BALL_RADIUS;
const S4 = new Float64Array(4);
const BAS = new Float64Array(9);
let bases = new Float64Array(9 * 8);

export interface BallStepInfo {
  /** Stärkster Wandaufprall in diesem Tick (m/s) */
  wallSpeed: number;
}

/** Reibungsimpuls an einem Kontakt: n = Normale zur Kugel (nach außen vom Hindernis), maxJ = Coulomb-Grenze */
function applyFriction(ball: BallState, nx: number, ny: number, nz: number, maxJ: number): void {
  const v = ball.vel;
  const w = ball.angVel;
  // Kontaktpunkt relativ zum Mittelpunkt: −n·R
  const rx = -nx * R;
  const ry = -ny * R;
  const rz = -nz * R;
  const px = v[0] + (w[1] * rz - w[2] * ry);
  const py = v[1] + (w[2] * rx - w[0] * rz);
  const pz = v[2] + (w[0] * ry - w[1] * rx);
  const pn = px * nx + py * ny + pz * nz;
  const tx = px - nx * pn;
  const ty = py - ny * pn;
  const tz = pz - nz * pn;
  const tl = Math.sqrt(tx * tx + ty * ty + tz * tz);
  if (tl < 1e-9) return;
  const j = Math.min(tl / 3.5, maxJ);
  const jx = (-tx / tl) * j;
  const jy = (-ty / tl) * j;
  const jz = (-tz / tl) * j;
  v[0] += jx;
  v[1] += jy;
  v[2] += jz;
  const inv = 1 / (0.4 * R * R);
  w[0] += (ry * jz - rz * jy) * inv;
  w[1] += (rz * jx - rx * jz) * inv;
  w[2] += (rx * jy - ry * jx) * inv;
}

/** Kugel gegen orientierte Box; cx,cy,cz = Autoposition (zeitlich interpoliert), b = Basis (9) des Autos */
function collideCar(
  ball: BallState,
  car: CarState,
  cx: number,
  cy: number,
  cz: number,
  b: Float64Array,
  o: number,
  ev: SimEvent[] | null,
): boolean {
  const p = ball.pos;
  const dx = p[0] - cx;
  const dy = p[1] - cy;
  const dz = p[2] - cz;
  const lx = dx * b[o]! + dy * b[o + 1]! + dz * b[o + 2]!;
  const ly = dx * b[o + 3]! + dy * b[o + 4]! + dz * b[o + 5]!;
  const lz = dx * b[o + 6]! + dy * b[o + 7]! + dz * b[o + 8]!;
  const hx = CAR_HALF[0];
  const hy = CAR_HALF[1];
  const hz = CAR_HALF[2];
  const qx = lx < -hx ? -hx : lx > hx ? hx : lx;
  const qy = ly < -hy ? -hy : ly > hy ? hy : ly;
  const qz = lz < -hz ? -hz : lz > hz ? hz : lz;
  const ex = lx - qx;
  const ey = ly - qy;
  const ez = lz - qz;
  const d2 = ex * ex + ey * ey + ez * ez;
  if (d2 >= R * R) return false;
  let nlx: number;
  let nly: number;
  let nlz: number;
  let pen: number;
  if (d2 > 1e-12) {
    const d = Math.sqrt(d2);
    nlx = ex / d;
    nly = ey / d;
    nlz = ez / d;
    pen = R - d;
  } else {
    // Mittelpunkt in der Box: kleinste Austrittsfläche
    const fx = hx - Math.abs(lx);
    const fy = hy - Math.abs(ly);
    const fz = hz - Math.abs(lz);
    nlx = 0;
    nly = 0;
    nlz = 0;
    if (fx <= fy && fx <= fz) {
      nlx = lx < 0 ? -1 : 1;
      pen = R + fx;
    } else if (fy <= fz) {
      nly = ly < 0 ? -1 : 1;
      pen = R + fy;
    } else {
      nlz = lz < 0 ? -1 : 1;
      pen = R + fz;
    }
  }
  const nx = nlx * b[o]! + nly * b[o + 3]! + nlz * b[o + 6]!;
  const ny = nlx * b[o + 1]! + nly * b[o + 4]! + nlz * b[o + 7]!;
  const nz = nlx * b[o + 2]! + nly * b[o + 5]! + nlz * b[o + 8]!;
  p[0] += nx * pen;
  p[1] += ny * pen;
  p[2] += nz * pen;

  // Geschwindigkeit des Autos am Kontaktpunkt
  const rx = qx * b[o]! + qy * b[o + 3]! + qz * b[o + 6]!;
  const ry = qx * b[o + 1]! + qy * b[o + 4]! + qz * b[o + 7]!;
  const rz = qx * b[o + 2]! + qy * b[o + 5]! + qz * b[o + 8]!;
  const cw = car.angVel;
  const cvx = car.vel[0] + (cw[1] * rz - cw[2] * ry);
  const cvy = car.vel[1] + (cw[2] * rx - cw[0] * rz);
  const cvz = car.vel[2] + (cw[0] * ry - cw[1] * rx);
  const v = ball.vel;
  const rvx = v[0] - cvx;
  const rvy = v[1] - cvy;
  const rvz = v[2] - cvz;
  const vn = rvx * nx + rvy * ny + rvz * nz;
  if (vn >= 0) return true;
  const rel = Math.sqrt(rvx * rvx + rvy * rvy + rvz * rvz);

  // Treffernormale: von der Autoachse zur Kugel, flach gedrückt und leicht angehoben („Power-Hit“)
  const dh = Math.sqrt(dx * dx + dz * dz);
  let hnx = dx;
  let hny = dy * T.hitFlatten + T.hitLift * dh;
  let hnz = dz;
  const hl = Math.sqrt(hnx * hnx + hny * hny + hnz * hnz);
  if (hl > 1e-6) {
    hnx /= hl;
    hny /= hl;
    hnz /= hl;
  }
  if (hl <= 1e-6 || hnx * rvx + hny * rvy + hnz * rvz >= 0) {
    hnx = nx;
    hny = ny;
    hnz = nz;
  }
  const phys = -(1 + T.carRestitution) * vn;
  const k = T.powerBase + T.powerSpeed * Math.min(1, rel / T.powerRefSpeed);
  const pow = k * rel;
  const dvx = nx * phys + hnx * pow;
  const dvy = ny * phys + hny * pow;
  const dvz = nz * phys + hnz * pow;
  v[0] += dvx;
  v[1] += dvy;
  v[2] += dvz;
  applyFriction(ball, nx, ny, nz, T.carFriction * phys);
  car.vel[0] -= dvx * T.carRecoil;
  car.vel[1] -= dvy * T.carRecoil;
  car.vel[2] -= dvz * T.carRecoil;
  if (ev && rel > 1) {
    ev.push({
      t: 'touch',
      car: car.id,
      speed: rel,
      ballSpeed: Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]),
    });
  }
  return true;
}

/** Kollision Kugel gegen Arena. Gibt die Aufprallgeschwindigkeit (0 = kein Aufprall) zurück. */
function collideArena(ball: BallState): number {
  const p = ball.pos;
  const v = ball.vel;
  let impact = 0;
  for (let it = 0; it < 2; it++) {
    const d = arenaSdf(p[0], p[1], p[2], S4);
    const pen = R - d;
    if (pen <= 0) break;
    const nx = S4[1]!;
    const ny = S4[2]!;
    const nz = S4[3]!;
    p[0] += nx * pen;
    p[1] += ny * pen;
    p[2] += nz * pen;
    const vn = v[0] * nx + v[1] * ny + v[2] * nz;
    if (vn < 0) {
      const approach = -vn;
      const bounce = approach > T.restThreshold;
      const e = bounce ? T.restitution : 0;
      const dj = (1 + e) * approach;
      v[0] += nx * dj;
      v[1] += ny * dj;
      v[2] += nz * dj;
      applyFriction(ball, nx, ny, nz, T.friction * dj);
      if (!bounce) {
        // Rollen: leichte Dämpfung
        const k = 1 - T.rollDamp * (TICK_DT / T.substeps);
        v[0] *= k;
        v[1] *= k;
        v[2] *= k;
      } else if (approach > impact) impact = approach;
    }
  }
  return impact;
}

/**
 * Ein Tick für den Ball (mehrere Teilschritte). Autos werden zeitlich zwischen prevPos (3 je Auto) und ihrer aktuellen Position interpoliert.
 * goalNet: ±1 = Seite des erzielten Tores (Ball kann während der Torfeier nicht zurück ins Feld), 0 = kein Netz.
 */
export function stepBall(
  ball: BallState,
  cars: CarState[],
  prevPos: Float64Array,
  dt: number,
  ev: SimEvent[],
  goalNet: -1 | 0 | 1,
  onTouch: (carId: number) => void,
  info: BallStepInfo,
): void {
  const n = cars.length;
  if (bases.length < n * 9) bases = new Float64Array(n * 9);
  for (let i = 0; i < n; i++) {
    quatBasis(cars[i]!.quat, BAS);
    for (let k = 0; k < 9; k++) bases[i * 9 + k] = BAS[k]!;
  }
  const sub = T.substeps;
  const h = dt / sub;
  const p = ball.pos;
  const v = ball.vel;
  const w = ball.angVel;
  let wall = 0;
  for (let s = 0; s < sub; s++) {
    v[1] -= T.gravity * h;
    const drag = 1 - T.airDrag * h;
    v[0] *= drag;
    v[1] *= drag;
    v[2] *= drag;
    p[0] += v[0] * h;
    p[1] += v[1] * h;
    p[2] += v[2] * h;
    const t = (s + 1) / sub;
    for (let i = 0; i < n; i++) {
      const car = cars[i]!;
      if (car.demolished > 0) continue;
      const px = prevPos[i * 3]!;
      const py = prevPos[i * 3 + 1]!;
      const pz = prevPos[i * 3 + 2]!;
      const cx = px + (car.pos[0] - px) * t;
      const cy = py + (car.pos[1] - py) * t;
      const cz = pz + (car.pos[2] - pz) * t;
      // grobe Vorprüfung
      const ddx = p[0] - cx;
      const ddy = p[1] - cy;
      const ddz = p[2] - cz;
      const lim = R + 0.8;
      if (ddx * ddx + ddy * ddy + ddz * ddz > lim * lim) continue;
      if (collideCar(ball, car, cx, cy, cz, bases, i * 9, ev)) onTouch(car.id);
    }
    const imp = collideArena(ball);
    if (imp > wall) wall = imp;
    if (goalNet !== 0) {
      // Netz an der Torlinie: der Ball kann nicht zurück ins Feld
      const hl = ARENA.halfLength * goalNet;
      if (goalNet > 0 ? p[2] < hl : p[2] > hl) {
        p[2] = hl;
        v[2] = -v[2] * 0.3;
        if (goalNet > 0 ? v[2] < 0 : v[2] > 0) v[2] = -v[2];
      }
    }
    // Spin-Dämpfung
    const sd = 1 - T.spinDamp * h;
    w[0] *= sd;
    w[1] *= sd;
    w[2] *= sd;
  }
  // Grenzen
  const sp2 = v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
  if (sp2 > T.maxSpeed * T.maxSpeed) {
    const k = T.maxSpeed / Math.sqrt(sp2);
    v[0] *= k;
    v[1] *= k;
    v[2] *= k;
  }
  const ws2 = w[0] * w[0] + w[1] * w[1] + w[2] * w[2];
  if (ws2 > T.maxSpin * T.maxSpin) {
    const k = T.maxSpin / Math.sqrt(ws2);
    w[0] *= k;
    w[1] *= k;
    w[2] *= k;
  }
  info.wallSpeed = wall;
}
