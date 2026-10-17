// Reine Geometrie für den Editor (Polylinien im Schema-Format x,y,z,x,y,z,…), ohne DOM.

export interface P2 { x: number; z: number }

const r2 = (v: number) => Math.round(v * 100) / 100;

/** Kumulierte Bogenlängen (3D, wie Network/Track – damit Bahnsteig-s identisch sind) */
export function arc(pts: number[]): number[] {
  const n = pts.length / 3, cs = [0];
  for (let i = 1; i < n; i++) cs.push(cs[i - 1] + Math.hypot(pts[i * 3] - pts[i * 3 - 3], pts[i * 3 + 1] - pts[i * 3 - 2], pts[i * 3 + 2] - pts[i * 3 - 1]));
  return cs;
}
export function polyLen(pts: number[]): number { const cs = arc(pts); return cs[cs.length - 1]; }

/** Punkt bei Bogenlänge s (geklemmt) */
export function pointAt(pts: number[], s: number): { x: number; y: number; z: number; i: number; dx: number; dz: number } {
  const cs = arc(pts), n = cs.length;
  const L = cs[n - 1]; s = Math.max(0, Math.min(L, s));
  let i = 0; while (i < n - 2 && cs[i + 1] < s) i++;
  const l = cs[i + 1] - cs[i] || 1e-9, f = (s - cs[i]) / l;
  const ax = pts[i * 3], ay = pts[i * 3 + 1], az = pts[i * 3 + 2], bx = pts[i * 3 + 3], by = pts[i * 3 + 4], bz = pts[i * 3 + 5];
  const h = Math.hypot(bx - ax, bz - az) || 1e-9;
  return { x: ax + (bx - ax) * f, y: ay + (by - ay) * f, z: az + (bz - az) * f, i, dx: (bx - ax) / h, dz: (bz - az) / h };
}

/** Nächster Punkt einer Polylinie zu (x,z): Bogenlänge und Abstand */
export function nearest(pts: number[], x: number, z: number): { s: number; d: number } {
  const cs = arc(pts); let best = { s: 0, d: Infinity };
  for (let i = 0; i + 1 < cs.length; i++) {
    const ax = pts[i * 3], az = pts[i * 3 + 2], bx = pts[i * 3 + 3], bz = pts[i * 3 + 5];
    const vx = bx - ax, vz = bz - az, ll = vx * vx + vz * vz;
    const f = ll > 0 ? Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / ll)) : 0;
    const d = Math.hypot(ax + vx * f - x, az + vz * f - z);
    if (d < best.d) best = { s: cs[i] + (cs[i + 1] - cs[i]) * f, d };
  }
  return best;
}

/** Gleisgeometrie A→B, gerade oder als quadratische Bézierkurve über Kontrollpunkt c; Punkte etwa alle `step` m, Höhe linear */
export function makePts(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }, c?: P2 | null, step = 10): number[] {
  const at = (t: number): P2 => c
    ? { x: (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * c.x + t * t * b.x, z: (1 - t) * (1 - t) * a.z + 2 * (1 - t) * t * c.z + t * t * b.z }
    : { x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t };
  // dichte Abtastung → gleichmäßige Bogenlänge
  const M = c ? 256 : 1, dense: P2[] = [], dl = [0];
  for (let k = 0; k <= M; k++) { dense.push(at(k / M)); if (k) dl.push(dl[k - 1] + Math.hypot(dense[k].x - dense[k - 1].x, dense[k].z - dense[k - 1].z)); }
  const L = dl[M], n = Math.max(1, Math.ceil(L / step)), out: number[] = [];
  let j = 0;
  for (let i = 0; i <= n; i++) {
    const s = (L * i) / n, f = L > 0 ? s / L : i / n;
    while (j < M - 1 && dl[j + 1] < s) j++;
    const seg = dl[j + 1] - dl[j] || 1e-9, g = Math.max(0, Math.min(1, (s - dl[j]) / seg));
    const p = i === 0 ? a : i === n ? b : { x: dense[j].x + (dense[j + 1].x - dense[j].x) * g, z: dense[j].z + (dense[j + 1].z - dense[j].z) * g };
    out.push(r2(p.x), r2(a.y + (b.y - a.y) * f), r2(p.z));
  }
  return out;
}

/** Teilt eine Polylinie bei Bogenlänge s in zwei (Teilungspunkt in beiden enthalten) */
export function splitPts(pts: number[], s: number): { A: number[]; B: number[]; P: [number, number, number] } {
  const p = pointAt(pts, s);
  const P: [number, number, number] = [r2(p.x), r2(p.y), r2(p.z)];
  const A = [...pts.slice(0, (p.i + 1) * 3), ...P], B = [...P, ...pts.slice((p.i + 1) * 3)];
  // doppelte Punkte (Teilung genau auf Stützpunkt) entfernen
  const dedupe = (q: number[]) => { const o: number[] = []; for (let i = 0; i < q.length; i += 3) { if (o.length && Math.hypot(q[i] - o[o.length - 3], q[i + 2] - o[o.length - 1]) < 0.05) continue; o.push(q[i], q[i + 1], q[i + 2]); } return o; };
  return { A: dedupe(A), B: dedupe(B), P };
}

/** Richtung (Einheitsvektor) eines Gleisendes vom Knoten weg, gemessen über ~dist m */
export function endDir(pts: number[], atA: boolean, dist = 15): P2 {
  const L = polyLen(pts), s = Math.min(dist, L * 0.5);
  const o = pointAt(pts, atA ? 0 : L), q = pointAt(pts, atA ? s : L - s);
  const dx = q.x - o.x, dz = q.z - o.z, h = Math.hypot(dx, dz) || 1;
  return { x: dx / h, z: dz / h };
}
