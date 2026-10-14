/* Kleine Mathe-Helfer ohne Three.js-Abhängigkeit (auch in Node-Tests nutzbar). */
export const TAU = Math.PI * 2;
export const clamp = (v: number, a: number, b: number): number => (v < a ? a : v > b ? b : v);
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
export const invLerp = (a: number, b: number, v: number): number => (b === a ? 0 : (v - a) / (b - a));
export const smoothstep = (a: number, b: number, v: number): number => {
  const t = clamp(invLerp(a, b, v), 0, 1);
  return t * t * (3 - 2 * t);
};
/** Bildraten-unabhängiges Annähern (exponentiell). k = Geschwindigkeit pro Sekunde. */
export const damp = (cur: number, target: number, k: number, dt: number): number => lerp(cur, target, 1 - Math.exp(-k * dt));
/** Winkel auf (-PI, PI] normieren. */
export const wrapAngle = (a: number): number => {
  a = (a + Math.PI) % TAU;
  if (a < 0) a += TAU;
  return a - Math.PI;
};
export const angleDiff = (from: number, to: number): number => wrapAngle(to - from);
export const dampAngle = (cur: number, target: number, k: number, dt: number): number => cur + angleDiff(cur, target) * (1 - Math.exp(-k * dt));
export const dist2 = (ax: number, az: number, bx: number, bz: number): number => Math.hypot(ax - bx, az - bz);
export const len2 = (x: number, z: number): number => Math.hypot(x, z);
/** Richtung (Yaw) von a nach b – Konvention: yaw 0 schaut nach +z, Drehung im Uhrzeigersinn von oben gesehen. */
export const yawTo = (ax: number, az: number, bx: number, bz: number): number => Math.atan2(bx - ax, bz - az);
export const approach = (cur: number, target: number, step: number): number => (cur < target ? Math.min(target, cur + step) : Math.max(target, cur - step));
export const hash2 = (x: number, z: number): number => {
  let h = Math.imul(Math.floor(x) | 0, 374761393) ^ Math.imul(Math.floor(z) | 0, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
};
/** Glattes Werte-Rauschen (2D), 0..1. */
export const noise2 = (x: number, z: number): number => {
  const ix = Math.floor(x), iz = Math.floor(z), fx = x - ix, fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx), uz = fz * fz * (3 - 2 * fz);
  const a = hash2(ix, iz), b = hash2(ix + 1, iz), c = hash2(ix, iz + 1), d = hash2(ix + 1, iz + 1);
  return lerp(lerp(a, b, ux), lerp(c, d, ux), uz);
};
export const fbm2 = (x: number, z: number, oct = 3): number => {
  let s = 0, a = 0.5, f = 1, n = 0;
  for (let i = 0; i < oct; i++) { s += noise2(x * f, z * f) * a; n += a; a *= 0.5; f *= 2; }
  return s / n;
};
export const fmtTime = (sec: number): string => {
  const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
  return m + ':' + (s < 10 ? '0' : '') + s;
};
