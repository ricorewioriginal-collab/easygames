// Seeded 2D value noise + fBm. Pure and deterministic.
import { hashString } from './rng.js';

export function createNoise(seed = 1) {
  let s = typeof seed === 'string' ? hashString(seed) : seed >>> 0;
  const perm = new Uint8Array(512), vals = new Float32Array(256);
  for (let i = 0; i < 256; i++) { perm[i] = i; s = (Math.imul(s, 1664525) + 1013904223) >>> 0; vals[i] = s / 4294967296; }
  for (let i = 255; i > 0; i--) { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; const j = s % (i + 1); [perm[i], perm[j]] = [perm[j], perm[i]]; }
  for (let i = 0; i < 256; i++) perm[256 + i] = perm[i];
  const lat = (x, y) => vals[perm[(x & 255) + perm[y & 255]]];
  const fade = (t) => t * t * (3 - 2 * t);
  function value(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const a = lat(xi, yi), b = lat(xi + 1, yi), c = lat(xi, yi + 1), d = lat(xi + 1, yi + 1);
    const u = fade(xf), v = fade(yf);
    return (a + (b - a) * u) + ((c + (d - c) * u) - (a + (b - a) * u)) * v;
  }
  function fbm(x, y, oct = 4) {
    let sum = 0, amp = 0.5, f = 1, norm = 0;
    for (let i = 0; i < oct; i++) { sum += value(x * f, y * f) * amp; norm += amp; amp *= 0.5; f *= 2.03; }
    return sum / norm;
  }
  return { value, fbm };
}

export const smoothstep = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

export function distToSegment(px, pz, ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz;
  let t = l2 ? ((px - ax) * dx + (pz - az) * dz) / l2 : 0;
  t = Math.max(0, Math.min(1, t));
  const x = ax + t * dx - px, z = az + t * dz - pz;
  return Math.sqrt(x * x + z * z);
}
export function distToPolyline(px, pz, pts) {
  let d = Infinity;
  for (let i = 1; i < pts.length; i++) d = Math.min(d, distToSegment(px, pz, pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1]));
  return d;
}
// Smooth a polyline with Catmull-Rom sampling (pure).
export function smoothPath(pts, step = 3) {
  if (pts.length < 3) return pts.map(p => [...p]);
  const out = [];
  const P = [pts[0], ...pts, pts[pts.length - 1]];
  for (let i = 1; i < P.length - 2; i++) {
    const [p0, p1, p2, p3] = [P[i - 1], P[i], P[i + 1], P[i + 2]];
    const len = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    const n = Math.max(1, Math.ceil(len / step));
    for (let k = 0; k < n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t;
      const f = (a, b, c, d) => 0.5 * ((2 * b) + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push([...pts[pts.length - 1]]);
  return out;
}
