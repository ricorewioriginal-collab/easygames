import { arenaSdf, BALL_TUNING, BALL_RADIUS, type CarState, type PadState } from '../sim';

/**
 * Navigation für die Bot-KI: Ballvorhersage (eigener kleiner Integrator, keine Sim-Aufrufe),
 * Winkelhilfen und Boost-Pad-Auswahl. Alles ohne Allokation im laufenden Betrieb.
 */

/** Zeitschritt der gespeicherten Vorhersagepunkte (s) */
export const PRED_STEP = 1 / 30;
/** Maximale Anzahl Vorhersagepunkte (2,1 s) */
export const PRED_MAX = 64;

export function wrapAngle(a: number): number {
  while (a > Math.PI) a -= 2 * Math.PI;
  while (a < -Math.PI) a += 2 * Math.PI;
  return a;
}

export function clampN(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

/** Fahrzeugachsen in Weltkoordinaten (aus dem Quaternion [x,y,z,w]): links, oben, Nase */
export class Basis {
  lx = 1;
  ly = 0;
  lz = 0;
  ux = 0;
  uy = 1;
  uz = 0;
  fx = 0;
  fy = 0;
  fz = 1;
  set(q: ArrayLike<number>): void {
    const x = q[0] as number;
    const y = q[1] as number;
    const z = q[2] as number;
    const w = q[3] as number;
    const xx = x * x;
    const yy = y * y;
    const zz = z * z;
    this.lx = 1 - 2 * (yy + zz);
    this.ly = 2 * (x * y + w * z);
    this.lz = 2 * (x * z - w * y);
    this.ux = 2 * (x * y - w * z);
    this.uy = 1 - 2 * (xx + zz);
    this.uz = 2 * (y * z + w * x);
    this.fx = 2 * (x * z + w * y);
    this.fy = 2 * (y * z - w * x);
    this.fz = 1 - 2 * (xx + yy);
  }
}

/**
 * Ballvorhersage: Ballistik mit Luftwiderstand, Boden-/Wandreflexion an der Arena-SDF (ohne Spin und Reibung).
 * Die Punkte 0..n liegen im Abstand PRED_STEP; Punkt 0 ist der Startzustand.
 */
export class BallPredictor {
  readonly x = new Float64Array(PRED_MAX + 1);
  readonly y = new Float64Array(PRED_MAX + 1);
  readonly z = new Float64Array(PRED_MAX + 1);
  readonly vx = new Float64Array(PRED_MAX + 1);
  readonly vy = new Float64Array(PRED_MAX + 1);
  readonly vz = new Float64Array(PRED_MAX + 1);
  n = 0;
  private readonly sd = new Float64Array(4);

  predict(px: number, py: number, pz: number, vx: number, vy: number, vz: number, steps: number): void {
    const n = steps > PRED_MAX ? PRED_MAX : steps < 1 ? 1 : steps;
    const h = PRED_STEP / 2;
    const sd = this.sd;
    const g = BALL_TUNING.gravity;
    const drag = 1 - BALL_TUNING.airDrag * h;
    this.x[0] = px;
    this.y[0] = py;
    this.z[0] = pz;
    this.vx[0] = vx;
    this.vy[0] = vy;
    this.vz[0] = vz;
    for (let i = 1; i <= n; i++) {
      for (let s = 0; s < 2; s++) {
        vy -= g * h;
        vx *= drag;
        vy *= drag;
        vz *= drag;
        px += vx * h;
        py += vy * h;
        pz += vz * h;
        const d = arenaSdf(px, py, pz, sd);
        const pen = BALL_RADIUS - d;
        if (pen > 0) {
          const nx = sd[1] as number;
          const ny = sd[2] as number;
          const nz = sd[3] as number;
          px += nx * pen;
          py += ny * pen;
          pz += nz * pen;
          const vn = vx * nx + vy * ny + vz * nz;
          if (vn < 0) {
            const ap = -vn;
            const e = ap > BALL_TUNING.restThreshold ? BALL_TUNING.restitution : 0;
            const dj = (1 + e) * ap;
            vx += nx * dj;
            vy += ny * dj;
            vz += nz * dj;
          }
        }
      }
      this.x[i] = px;
      this.y[i] = py;
      this.z[i] = pz;
      this.vx[i] = vx;
      this.vy[i] = vy;
      this.vz[i] = vz;
    }
    this.n = n;
  }
}

/**
 * Bestes Boost-Pad: kleinster Umweg (Weg Auto→Pad→Ziel minus direkter Weg) abzüglich eines Bonus für den Ladungsgewinn.
 * Nur aktive Pads. Gibt den Index oder −1 zurück. maxDetour begrenzt den Umweg (m), maxDist die Entfernung zum Pad.
 */
export function bestPad(
  pads: ReadonlyArray<PadState>,
  car: CarState,
  tx: number,
  tz: number,
  maxDist: number,
  maxDetour: number,
  ownSign: number,
  halfOnly: boolean,
): number {
  const px = car.pos[0];
  const pz = car.pos[2];
  const direct = Math.hypot(tx - px, tz - pz);
  const need = 100 - car.boost;
  let best = -1;
  let bestScore = Infinity;
  for (let i = 0; i < pads.length; i++) {
    const p = pads[i] as PadState;
    if (!p.active) continue;
    // Pad darf nicht erst zurückkehren, wenn wir ankommen (Timer ist öffentlich)
    const gain = p.big ? Math.min(100, need) : Math.min(12, need);
    if (gain < 8) continue;
    if (halfOnly && p.pos[2] * ownSign > 12) continue;
    const d1 = Math.hypot(p.pos[0] - px, p.pos[2] - pz);
    if (d1 > maxDist) continue;
    const detour = d1 + Math.hypot(tx - p.pos[0], tz - p.pos[2]) - direct;
    if (detour > maxDetour) continue;
    const score = detour + d1 * 0.5 - gain * 0.25;
    if (score < bestScore) {
      bestScore = score;
      best = i;
    }
  }
  return best;
}
