import type { Quat, Vec3 } from './types';

/**
 * Vektor-/Quaternion-Helfer. Quaternionen sind [x, y, z, w]. Alles nur mit + − * / und sqrt (exakt, engine-unabhängig).
 * Funktionen schreiben in `out`, damit im Hot-Path nichts allokiert wird.
 */

export function dot3(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

export function len3(a: Vec3): number {
  return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
}

export function cross3(a: Vec3, b: Vec3, out: Vec3): Vec3 {
  const x = a[1] * b[2] - a[2] * b[1];
  const y = a[2] * b[0] - a[0] * b[2];
  const z = a[0] * b[1] - a[1] * b[0];
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
}

export function lerp3(a: Vec3, b: Vec3, t: number, out: Vec3): Vec3 {
  out[0] = a[0] + (b[0] - a[0]) * t;
  out[1] = a[1] + (b[1] - a[1]) * t;
  out[2] = a[2] + (b[2] - a[2]) * t;
  return out;
}

export function copy3(a: Vec3, out: Vec3): Vec3 {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  return out;
}

export function isFinite3(a: ArrayLike<number>): boolean {
  return Number.isFinite(a[0]) && Number.isFinite(a[1]) && Number.isFinite(a[2]);
}

export function quatNormalize(q: Quat): Quat {
  const l2 = q[0] * q[0] + q[1] * q[1] + q[2] * q[2] + q[3] * q[3];
  if (!(l2 > 1e-12) || !Number.isFinite(l2)) {
    q[0] = 0;
    q[1] = 0;
    q[2] = 0;
    q[3] = 1;
    return q;
  }
  const inv = 1 / Math.sqrt(l2);
  q[0] *= inv;
  q[1] *= inv;
  q[2] *= inv;
  q[3] *= inv;
  return q;
}

export function copyQuat(a: Quat, out: Quat): Quat {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  return out;
}

/** Dreht Vektor v mit Quaternion q */
export function quatRotate(q: Quat, v: Vec3, out: Vec3): Vec3 {
  const x = q[0];
  const y = q[1];
  const z = q[2];
  const w = q[3];
  const tx = 2 * (y * v[2] - z * v[1]);
  const ty = 2 * (z * v[0] - x * v[2]);
  const tz = 2 * (x * v[1] - y * v[0]);
  out[0] = v[0] + w * tx + (y * tz - z * ty);
  out[1] = v[1] + w * ty + (z * tx - x * tz);
  out[2] = v[2] + w * tz + (x * ty - y * tx);
  return out;
}

/** Schreibt die drei Fahrzeugachsen in Weltkoordinaten: m[0..2] = +x (links), m[3..5] = +y (oben), m[6..8] = +z (Nase) */
export function quatBasis(q: Quat, m: Float64Array): void {
  const x = q[0];
  const y = q[1];
  const z = q[2];
  const w = q[3];
  const xx = x * x;
  const yy = y * y;
  const zz = z * z;
  m[0] = 1 - 2 * (yy + zz);
  m[1] = 2 * (x * y + w * z);
  m[2] = 2 * (x * z - w * y);
  m[3] = 2 * (x * y - w * z);
  m[4] = 1 - 2 * (xx + zz);
  m[5] = 2 * (y * z + w * x);
  m[6] = 2 * (x * z + w * y);
  m[7] = 2 * (y * z - w * x);
  m[8] = 1 - 2 * (xx + yy);
}

/** Integriert die Winkelgeschwindigkeit (Welt, rad/s) über dt in q (in place, danach normalisiert) */
export function quatIntegrate(q: Quat, wx: number, wy: number, wz: number, dt: number): void {
  const hx = wx * 0.5 * dt;
  const hy = wy * 0.5 * dt;
  const hz = wz * 0.5 * dt;
  const qx = q[0];
  const qy = q[1];
  const qz = q[2];
  const qw = q[3];
  const nx = qx + (hx * qw + hy * qz - hz * qy);
  const ny = qy + (-hx * qz + hy * qw + hz * qx);
  const nz = qz + (hx * qy - hy * qx + hz * qw);
  const nw = qw + (-hx * qx - hy * qy - hz * qz);
  const inv = 1 / Math.sqrt(nx * nx + ny * ny + nz * nz + nw * nw);
  q[0] = nx * inv;
  q[1] = ny * inv;
  q[2] = nz * inv;
  q[3] = nw * inv;
}

/** Sphärische Interpolation (nur für Darstellung/Client, nicht im Simulationspfad: nutzt Math.sin/acos) */
export function quatSlerp(a: Quat, b: Quat, t: number, out: Quat): Quat {
  let bx = b[0];
  let by = b[1];
  let bz = b[2];
  let bw = b[3];
  let d = a[0] * bx + a[1] * by + a[2] * bz + a[3] * bw;
  if (d < 0) {
    d = -d;
    bx = -bx;
    by = -by;
    bz = -bz;
    bw = -bw;
  }
  let ka: number;
  let kb: number;
  if (d > 0.9995) {
    ka = 1 - t;
    kb = t;
  } else {
    const th = Math.acos(d);
    const s = 1 / Math.sin(th);
    ka = Math.sin((1 - t) * th) * s;
    kb = Math.sin(t * th) * s;
  }
  out[0] = a[0] * ka + bx * kb;
  out[1] = a[1] * ka + by * kb;
  out[2] = a[2] * ka + bz * kb;
  out[3] = a[3] * ka + bw * kb;
  return quatNormalize(out);
}
