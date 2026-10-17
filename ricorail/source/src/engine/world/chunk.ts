// Aufbau eines 500-m-Chunks: Gelände, Gleise, Oberleitung, Tunnel, Brücken, Bahnsteige, Signale, Bahnübergänge.
import * as THREE from 'three';
import type { PointInfo } from '../../railway/network';
import { CH, ckey, type WorldCtx } from './ctx';
import { F_BR, F_TUN } from './field';
import { GeoBuf, mix, rgb, rgbStr, scale, type RGB, type V3 } from './geo';
import { hasDom, signTexture } from './materials';
import { fbm, hash2, rng } from './noise';
import { decorate, person } from './deco';

/** Qualitätsparameter für den Aufbau */
export interface QP {
  level: 'low' | 'mid' | 'high';
  /** Gitterzellen je Chunk (nah) und für entfernte Chunks; Grenze der Nah-Auflösung (m) */
  n: number; cell: number; nFar: number; lodDist: number;
  trees: number; houses: number; people: number;
  sleepers3d: boolean; shadows: boolean; maxTex: number; wires: boolean;
}

export interface LampSet { mesh: THREE.InstancedMesh; ids: string[]; kind: Uint8Array; first: Int32Array; cache: Uint8Array }
export interface XingObj { ids: string[]; arms: THREE.Object3D[]; lights: THREE.Mesh[] }

export class Chunk {
  readonly group = new THREE.Group();
  lamps: LampSet | null = null;
  xings: XingObj[] = [];
  sleepers: THREE.InstancedMesh | null = null;
  readonly own: { dispose(): void }[] = [];
  tris = 0;
  constructor(readonly key: number, readonly cx: number, readonly cz: number, readonly n: number, readonly cell: number, readonly h: Float64Array) {}
  dispose() {
    this.group.removeFromParent();
    this.group.traverse((o) => {
      const m = o as THREE.Mesh;
      if ((m as unknown as THREE.InstancedMesh).isInstancedMesh) (m as unknown as THREE.InstancedMesh).dispose();
      if (m.isMesh && m.userData.ownGeo) m.geometry.dispose();
    });
    for (const d of this.own) d.dispose();
    this.own.length = 0; this.xings.length = 0; this.lamps = null; this.sleepers = null;
  }
}

/** Höhe im Dreiecksgitter (gleiche Aufteilung wie das Geländemesh) */
export function gridSample(h: ArrayLike<number>, n: number, fx: number, fz: number): number {
  fx = Math.min(n - 1e-6, Math.max(0, fx)); fz = Math.min(n - 1e-6, Math.max(0, fz));
  const i = Math.floor(fx), j = Math.floor(fz), u = fx - i, w = fz - j, k = j * (n + 1) + i;
  const h00 = h[k], h10 = h[k + 1], h01 = h[k + n + 1], h11 = h[k + n + 2];
  if (u + w <= 1) return h00 + (h10 - h00) * u + (h01 - h00) * w;
  return h11 + (h01 - h11) * (1 - u) + (h10 - h11) * (1 - w);
}

// Farbpalette (linear)
export const C = {
  ballast: rgb(0x9a948a), yard: rgb(0x6a655f), tunBed: rgb(0x5a5650),
  railTop: rgb(0xbdb8b0), railSide: rgb(0x5d4a3e), mast: rgb(0x6d7378), wire: rgb(0x2a2a2a),
  plat: rgb(0x9d988f), platEdge: rgb(0xcfcabc), platLine: rgb(0xf2f2f2), platSnow: rgb(0xdfe4e8),
  tunnel: rgb(0x3e3b38), portal: rgb(0x8a847a), deck: rgb(0x8f8c86), pillar: rgb(0x9a968e),
  sigHead: rgb(0x1c1c1c), sigMast: rgb(0x8a8e92), road: rgb(0x4e5054), post: rgb(0xe8e8e8),
  lampGlow: rgb(0xffe2a0), roof: rgb(0x55595e), white: rgb(0xf0f0f0), dark: rgb(0x222222),
  grassSp: rgb(0x6fa84a), grassSu: rgb(0x5c8f3c), grassAu: rgb(0x8c8a3f), snow: rgb(0xe9eef2),
  rock: rgb(0x7d7a74), dirt: rgb(0x8a7350), sand: rgb(0xd8c58e), seabed: rgb(0x6e7a5a),
  wheat: rgb(0xc8b25a), field: rgb(0x7fae4a), plough: rgb(0x7a5a3a), rape: rgb(0xd8cf3a),
  city: rgb(0x7c7f83), asphalt: rgb(0x4a4c50), neonGround: rgb(0x2a2c38),
};
const LAMP_OFF = rgb(0x111111);

const tmpM = new THREE.Matrix4(), tmpQ = new THREE.Quaternion(), tmpE = new THREE.Euler(), tmpS = new THREE.Vector3(1, 1, 1), tmpV = new THREE.Vector3();

/** Sammelt alle Geometrien eines Chunks */
export class CB {
  readonly ox: number; readonly oz: number;
  readonly st = new GeoBuf(); readonly bed = new GeoBuf(true); readonly glow = new GeoBuf(); readonly water = new GeoBuf();
  readonly signs = new Map<string, { g: GeoBuf; name: string }>();
  readonly lampPos: number[] = []; readonly lampIds: string[] = []; readonly lampKind: number[] = []; readonly lampFirst: number[] = [];
  readonly sleepM: number[] = [];
  readonly rnd: () => number;
  readonly winter: boolean;
  readonly P: PointInfo = { x: 0, y: 0, z: 0, dx: 1, dy: 0, dz: 0 };
  readonly chunk: Chunk;
  readonly n: number; readonly cell: number;
  constructor(readonly ctx: WorldCtx, readonly q: QP, readonly cx: number, readonly cz: number, n: number) {
    this.n = n; this.cell = CH / n;
    this.ox = cx * CH; this.oz = cz * CH;
    for (const g of [this.st, this.bed, this.glow, this.water]) { g.ox = this.ox; g.oz = this.oz; }
    this.rnd = rng((hash2(cx, cz, ctx.seed) * 4294967296) >>> 0);
    this.winter = (ctx.net.def.theme.season ?? 'summer') === 'winter';
    this.chunk = new Chunk(ckey(cx, cz), cx, cz, n, CH / n, new Float64Array((n + 1) * (n + 1)));
  }
  /** belegte Kreise (x, z, r) gegen Überschneidung von Gebäuden und Bäumen */
  readonly occ: number[] = [];
  free(x: number, z: number, r: number): boolean {
    const o = this.occ;
    for (let k = 0; k < o.length; k += 3) { const dx = o[k] - x, dz = o[k + 1] - z, rr = o[k + 2] + r; if (dx * dx + dz * dz < rr * rr) return false; }
    return true;
  }
  take(x: number, z: number, r: number) { this.occ.push(x, z, r); }
  inside(x: number, z: number) { return x >= this.ox && x < this.ox + CH && z >= this.oz && z < this.oz + CH; }
  /** Geländehöhe (Gitter des Chunks, außerhalb analytisch) */
  H(x: number, z: number): number {
    if (this.inside(x, z)) return gridSample(this.chunk.h, this.n, (x - this.ox) / this.cell, (z - this.oz) / this.cell);
    return this.ctx.terrain.height(x, z, null);
  }
  sign(id: string, name: string): GeoBuf {
    let s = this.signs.get(id);
    if (!s) { const g = new GeoBuf(true); g.ox = this.ox; g.oz = this.oz; s = { g, name }; this.signs.set(id, s); }
    return s.g;
  }
}

/** Chunkaufbau in Schritten (yield zwischen den Teilen → Zeitbudget je Frame einhaltbar) */
export function* chunkSteps(ctx: WorldCtx, q: QP, cx: number, cz: number, n: number): Generator<void, Chunk, void> {
  const b = new CB(ctx, q, cx, cz, n);
  yield* buildTerrain(b); yield;
  const runs = ctx.runs.get(b.chunk.key);
  if (runs) for (let k = 0; k < runs.length; k++) { buildRun(b, runs[k].t, runs[k].i0, runs[k].i1); if (k % 3 === 2) yield; }
  buildSignals(b);
  buildCrossings(b);
  buildPortals(b); yield;
  yield* decorate(b); yield;
  return yield* finish(b);
}

export function buildChunk(ctx: WorldCtx, q: QP, cx: number, cz: number, n: number): Chunk {
  const it = chunkSteps(ctx, q, cx, cz, n);
  for (;;) { const r = it.next(); if (r.done) return r.value; }
}

// ------------------------------------------------------------------ Gelände
function* buildTerrain(b: CB): Generator<void, void, void> {
  const { ctx } = b, T = ctx.terrain, n = b.n, cell = b.cell, ox = b.ox, oz = b.oz, W = n + 3;
  const theme = ctx.net.def.theme, season = theme.season ?? 'summer';
  const reach = T.reach + cell;
  // Kandidatensegmente je 4×4-Teilblock
  const all = ctx.idx.collect(ox - reach, oz - reach, ox + CH + reach, oz + CH + reach, []);
  const SB = 4, sbs = CH / SB, lists: Int32Array[] = [];
  for (let bz = 0; bz < SB; bz++) for (let bx = 0; bx < SB; bx++) {
    const x0 = ox + bx * sbs - reach, x1 = ox + (bx + 1) * sbs + reach, z0 = oz + bz * sbs - reach, z1 = oz + (bz + 1) * sbs + reach;
    const l: number[] = [];
    for (const s of all) {
      const I = ctx.idx;
      if (Math.max(I.x0[s], I.x1[s]) < x0 || Math.min(I.x0[s], I.x1[s]) > x1 || Math.max(I.z0[s], I.z1[s]) < z0 || Math.min(I.z0[s], I.z1[s]) > z1) continue;
      l.push(s);
    }
    lists.push(Int32Array.from(l));
  }
  const hb = new Float64Array(W * W), dN = new Float32Array(W * W), fN = new Uint8Array(W * W);
  const band = Math.ceil(W / 4);
  for (let j = 0; j < W; j++) for (let i = 0; i < W; i++) {
    if (i === 0 && j > 0 && j % band === 0) yield; // Höhen in Bändern über mehrere Schritte
    const x = ox + (i - 1) * cell, z = oz + (j - 1) * cell;
    const bx = Math.min(SB - 1, Math.max(0, Math.floor((x - ox) / sbs))), bz = Math.min(SB - 1, Math.max(0, Math.floor((z - oz) / sbs)));
    hb[j * W + i] = T.height(x, z, lists[bz * SB + bx]);
    dN[j * W + i] = T.lastD; fN[j * W + i] = T.lastF;
  }
  const h = b.chunk.h;
  for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) h[j * (n + 1) + i] = hb[(j + 1) * W + i + 1];

  // Farben
  const grass = theme.ground ? rgbStr(theme.ground, C.grassSu) : season === 'spring' ? C.grassSp : season === 'autumn' ? C.grassAu : season === 'winter' ? C.snow : C.grassSu;
  const city = theme.terrain === 'city', neon = theme.buildings === 'neon';
  const fields = (theme.terrain === 'plain' || theme.terrain === 'hills' || theme.terrain === 'river') && season !== 'winter';
  const sea = T.seaLevel, snowLine = season === 'winter' ? -1e9 : theme.terrain === 'mountain' ? 1650 : 1e9;
  const g = b.st, base = g.verts, cols: RGB[] = [];
  let minH = Infinity;
  for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) {
    const k = (j + 1) * W + i + 1, y = hb[k];
    minH = Math.min(minH, y);
    const gx = (hb[k + 1] - hb[k - 1]) / (2 * cell), gz = (hb[k + W] - hb[k - W]) / (2 * cell);
    const l = Math.hypot(gx, 1, gz), nx = -gx / l, ny = 1 / l, nz = -gz / l;
    const x = ox + i * cell, z = oz + j * cell, slope = 1 - ny;
    let c: RGB = grass;
    const nv = fbm(x / 170, z / 170, ctx.seed + 3, 2);
    c = scale(c, 1 + nv * 0.12);
    if (city) {
      c = neon ? C.neonGround : C.city;
      const mx = ((x % 120) + 120) % 120, mz = ((z % 120) + 120) % 120;
      if (mx < 14 || mz < 14) c = C.asphalt;
    } else if (fields && dN[k] > T.flat + 25 && slope < 0.08) {
      const fx = Math.floor(x / 170), fz = Math.floor(z / 115), r = hash2(fx, fz, ctx.seed + 77);
      if (r < 0.5) { const pick = r < 0.15 ? C.wheat : r < 0.27 ? C.field : r < 0.38 ? C.plough : season === 'spring' ? C.rape : C.wheat; c = mix(c, pick, 0.85); }
    }
    if (slope > 0.25) c = mix(c, season === 'winter' && slope < 0.45 ? C.snow : C.rock, Math.min(1, (slope - 0.25) / 0.2));
    if (y > snowLine) c = mix(c, C.snow, Math.min(1, (y - snowLine) / 120) * (slope > 0.5 ? 0.4 : 1));
    if (dN[k] < T.flat + 4 && !(fN[k] & F_TUN)) c = mix(c, season === 'winter' ? C.snow : C.dirt, 0.35);
    if (sea !== null && y < sea + 1.5) c = y < sea - 0.5 ? C.seabed : C.sand;
    g.v(x, y, z, nx, ny, nz, c); cols.push(c);
  }
  // Schürzen an den Rändern (keine Risse zwischen Chunks unterschiedlicher Auflösung)
  const hv0 = (i: number, j: number) => h[j * (n + 1) + i];
  for (let k = 0; k < n; k++) {
    for (const [i0, j0, i1, j1, ox2, oz2] of [[k, 0, k + 1, 0, 0, -1], [k, n, k + 1, n, 0, 1], [0, k, 0, k + 1, -1, 0], [n, k, n, k + 1, 1, 0]]) {
      const x0 = ox + i0 * cell, z0 = oz + j0 * cell, x1 = ox + i1 * cell, z1 = oz + j1 * cell, y0 = hv0(i0, j0), y1 = hv0(i1, j1);
      g.quad([x0, y0, z0], [x1, y1, z1], [x1, y1 - 6, z1], [x0, y0 - 6, z0], cols[j0 * (n + 1) + i0], ox2, 0, oz2);
    }
  }
  // Dreiecke; an Tunnelportalen werden störende Dreiecke ausgelassen
  const near = ctx.portals.filter((p) => p.x > ox - 80 && p.x < ox + CH + 80 && p.z > oz - 80 && p.z < oz + CH + 80);
  const V = (i: number, j: number) => base + j * (n + 1) + i;
  const hv = (i: number, j: number) => h[j * (n + 1) + i];
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const a = V(i, j), bb = V(i + 1, j), c = V(i, j + 1), d = V(i + 1, j + 1);
    if (near.length) {
      const t1 = [hv(i, j), hv(i, j + 1), hv(i + 1, j)], t2 = [hv(i + 1, j), hv(i, j + 1), hv(i + 1, j + 1)];
      const x1 = ox + (i + 1 / 3) * cell, z1 = oz + (j + 1 / 3) * cell, x2 = ox + (i + 2 / 3) * cell, z2 = oz + (j + 2 / 3) * cell;
      if (!portalCut(near, x1, z1, t1, cell)) g.tri(a, c, bb);
      if (!portalCut(near, x2, z2, t2, cell)) g.tri(bb, c, d);
    } else { g.tri(a, c, bb); g.tri(bb, c, d); }
  }
  // Wasserfläche
  if (sea !== null && minH < sea + 0.3) {
    const y = sea;
    b.water.quad([ox, y, oz], [ox + CH, y, oz], [ox + CH, y, oz + CH], [ox, y, oz + CH], C.white, 0, 1, 0);
  }
  for (const bu of T.bumps) {
    if (!bu.lake || !b.inside(bu.x, bu.z)) continue;
    const r = bu.r * 0.93, N = 28, w = b.water, c0 = w.v(bu.x, bu.level, bu.z, 0, 1, 0, C.white);
    for (let k = 0; k < N; k++) w.v(bu.x + Math.cos((k / N) * Math.PI * 2) * r, bu.level, bu.z + Math.sin((k / N) * Math.PI * 2) * r, 0, 1, 0, C.white);
    for (let k = 0; k < N; k++) w.tri(c0, c0 + 1 + ((k + 1) % N), c0 + 1 + k);
  }
}

function portalCut(ps: WorldCtx['portals'], x: number, z: number, hs: number[], cell: number): boolean {
  for (const p of ps) {
    const ax = x - p.x, az = z - p.z, along = ax * p.dx + az * p.dz, lat = ax * p.nx + az * p.nz;
    if (lat < -p.L - 3 || lat > p.R + 3 || along < -cell * 1.6 || along > cell * 1.6) continue;
    const mn = Math.min(hs[0], hs[1], hs[2]), mx = Math.max(hs[0], hs[1], hs[2]);
    if (along < 0 ? mn < p.y + 8.5 : mx > p.y + 0.3) return true;
  }
  return false;
}

// ------------------------------------------------------------------ Gleis
function buildRun(b: CB, ti: number, i0: number, i1: number) {
  const { ctx, q } = b, t = ctx.idx.tracks[ti], NX = ctx.nx[ti], NZ = ctx.nz[ti];
  const px = t.px, py = t.py, pz = t.pz, cs = t.cs;
  const FB = ctx.idx.base[ti], FL = ctx.idx.flag, yard = !!t.def.yard;
  const fAt = (s: number) => FL[FB + t.seg(s)];
  const O = (i: number, l: number, dh: number): V3 => [px[i] + NX[i] * l, py[i] + dh, pz[i] + NZ[i] * l];
  const v0 = cs[i0] - (cs[i0] % 0.6);
  const gl = ctx.gapL[ti], gr = ctx.gapR[ti];
  for (let i = i0; i <= i1; i++) {
    const tun = (FL[FB + i] & F_TUN) !== 0, bridge = (FL[FB + i] & F_BR) !== 0;
    const bedCol = tun ? C.tunBed : yard ? C.yard : C.ballast;
    const va = (cs[i] - v0) / 0.6, vb = (cs[i + 1] - v0) / 0.6;
    const nx = (NX[i] + NX[i + 1]) / 2, nz = (NZ[i] + NZ[i + 1]) / 2;
    // Schotterbett
    b.bed.quad(O(i, -1.5, -0.2), O(i, 1.5, -0.2), O(i + 1, 1.5, -0.2), O(i + 1, -1.5, -0.2), bedCol, 0, 1, 0, [0, va, 1, va, 1, vb, 0, vb]);
    b.bed.quad(O(i, -2.5, -0.85), O(i, -1.5, -0.2), O(i + 1, -1.5, -0.2), O(i + 1, -2.5, -0.85), bedCol, -nx, 1, -nz, [0.02, va, 0.02, va, 0.02, vb, 0.02, vb]);
    b.bed.quad(O(i, 1.5, -0.2), O(i, 2.5, -0.85), O(i + 1, 2.5, -0.85), O(i + 1, 1.5, -0.2), bedCol, nx, 1, nz, [0.98, va, 0.98, va, 0.98, vb, 0.98, vb]);
    // Schienen
    for (const r of [-0.7175, 0.7175]) {
      b.st.quad(O(i, r - 0.036, 0), O(i, r + 0.036, 0), O(i + 1, r + 0.036, 0), O(i + 1, r - 0.036, 0), C.railTop, 0, 1, 0);
      b.st.quad(O(i, r - 0.036, -0.17), O(i, r - 0.036, 0), O(i + 1, r - 0.036, 0), O(i + 1, r - 0.036, -0.17), C.railSide, -nx, 0, -nz);
      b.st.quad(O(i, r + 0.036, 0), O(i, r + 0.036, -0.17), O(i + 1, r + 0.036, -0.17), O(i + 1, r + 0.036, 0), C.railSide, nx, 0, nz);
    }
    if (t.def.rack) {
      b.st.quad(O(i, -0.06, -0.04), O(i, 0.06, -0.04), O(i + 1, 0.06, -0.04), O(i + 1, -0.06, -0.04), C.railSide, 0, 1, 0);
      b.st.quad(O(i, -0.06, -0.2), O(i, -0.06, -0.04), O(i + 1, -0.06, -0.04), O(i + 1, -0.06, -0.2), C.dark, -nx, 0, -nz);
      b.st.quad(O(i, 0.06, -0.04), O(i, 0.06, -0.2), O(i + 1, 0.06, -0.2), O(i + 1, 0.06, -0.04), C.dark, nx, 0, nz);
    }
    // Fahrdraht (+ Tragseil)
    if (t.def.elec) {
      for (const hh of q.wires ? [5.5, 6.7] : [5.5]) {
        b.st.quad(O(i, -0.025, hh), O(i, 0.025, hh), O(i + 1, 0.025, hh), O(i + 1, -0.025, hh), C.wire, 0, -1, 0);
        b.st.quad(O(i, -0.025, hh), O(i, -0.025, hh + 0.05), O(i + 1, -0.025, hh + 0.05), O(i + 1, -0.025, hh), C.wire, -nx, 0, -nz);
        b.st.quad(O(i, 0.025, hh + 0.05), O(i, 0.025, hh), O(i + 1, 0.025, hh), O(i + 1, 0.025, hh + 0.05), C.wire, nx, 0, nz);
      }
    }
    if (tun && gl >= 7) tubeSeg(b, O, i, nx, nz, gr < 7 ? gr + 4.4 : 4.4);
    if (bridge) deckSeg(b, O, i, nx, nz, gl < 7 ? gl / 2 : 2.9, gr < 7 ? gr / 2 : 2.9, gl < 7, gr < 7);
  }
  const sA = cs[i0], sB = cs[i1 + 1], P = b.P;
  // Masten
  if (t.def.elec) {
    const ms = gr < 7 && gl >= 7 ? -1 : 1;
    // Mittlere Gleise (beidseits Nachbarn < 7 m): keine Masten im Gleiszwischenraum
    if (gr >= 7 || gl >= 7) for (let s = Math.ceil(sA / 60) * 60; s < sB; s += 60) {
      if (fAt(s) & F_TUN) continue;
      t.point(s, P); const nx = -P.dz, nz = P.dx;
      const mx = P.x + nx * ms * 3.3, mz = P.z + nz * ms * 3.3;
      const gy = Math.min(P.y - 0.9, b.H(mx, mz));
      b.st.box(mx, gy, mz, P.dx, P.dz, 0.3, 0.3, P.y + 7.3 - gy, C.mast);
      b.st.box(P.x + nx * ms * 1.6, P.y + 6.6, P.z + nz * ms * 1.6, nx, nz, 3.8, 0.12, 0.14, C.mast);
      b.st.box(P.x + nx * ms * 1.4, P.y + 5.62, P.z + nz * ms * 1.4, nx, nz, 3.6, 0.08, 0.08, C.mast);
    }
  }
  // Tunnelbeleuchtung
  if (gl >= 7) for (let s = Math.ceil(sA / 40) * 40; s < sB; s += 40) {
    if (!(fAt(s) & F_TUN)) continue;
    t.point(s, P); b.glow.box(P.x + P.dz * 4.3, P.y + 3.6, P.z - P.dx * 4.3, P.dx, P.dz, 0.8, 0.12, 0.15, C.lampGlow);
  }
  // Brückenpfeiler
  if (gl >= 7) for (let s = Math.ceil(sA / 30) * 30; s < sB; s += 30) {
    if (!(fAt(s) & F_BR)) continue;
    t.point(s, P); const nx = -P.dz, nz = P.dx, wr = gr < 7 ? gr + 2.9 : 2.9;
    const c = (wr - 2.9) / 2, x = P.x + nx * c, z = P.z + nz * c;
    const gy = ctx.terrain.height(x, z, null) - 1.5;
    if (P.y - 2.3 - gy > 1) b.st.box(x, gy, z, nx, nz, wr + 2.9 - 0.6, 2.2, P.y - 2.3 - gy, C.pillar);
  }
  // 3D-Schwellen (hohe Qualität): Matrix direkt schreiben (Drehung um y, lokale x-Achse = Gleisnormale)
  if (q.sleepers3d && b.n === q.n) {
    const M = b.sleepM;
    for (let i = i0; i <= i1; i++) {
      const l = cs[i + 1] - cs[i], dx = (px[i + 1] - px[i]) / l, dz = (pz[i + 1] - pz[i]) / l, dy = (py[i + 1] - py[i]) / l;
      for (let s = Math.ceil(cs[i] / 0.6) * 0.6; s < cs[i + 1]; s += 0.6) {
        const f = s - cs[i];
        M.push(-dz, 0, dx, 0, 0, 1, 0, 0, -dx, 0, -dz, 0, px[i] + dx * f - b.ox, py[i] + dy * f - 0.25, pz[i] + dz * f - b.oz, 1);
      }
    }
  }
  // Bahnsteige, Ladestellen
  const pl = ctx.plats.get(ti);
  if (pl) for (const inf of pl) {
    const a = Math.max(inf.p.s0, sA), e = Math.min(inf.p.s1, sB);
    if (e - a > 0.3) platform(b, ti, inf, a, e);
  }
}

type OFn = (i: number, l: number, dh: number) => V3;

function tubeSeg(b: CB, O: OFn, i: number, nx: number, nz: number, R: number) {
  const L = 4.4, c = (R - L) / 2;
  const prof: [number, number][] = [[-L, -1], [-L, 4.6], [-L + 1.7, 6.7], [c, 7.4], [R - 1.7, 6.7], [R, 4.6], [R, -1]];
  for (let k = 0; k + 1 < prof.length; k++) {
    const [l0, h0] = prof[k], [l1, h1] = prof[k + 1];
    const ml = (l0 + l1) / 2, mh = (h0 + h1) / 2, ix = c - ml, iy = 3 - mh;
    b.st.quad(O(i, l0, h0), O(i, l1, h1), O(i + 1, l1, h1), O(i + 1, l0, h0), C.tunnel, nx * ix, iy, nz * ix);
  }
}

function deckSeg(b: CB, O: OFn, i: number, nx: number, nz: number, dl: number, dr: number, pL: boolean, pR: boolean) {
  const g = b.st, t0 = -0.86, t1 = -2.3;
  g.quad(O(i, -dl, t0), O(i, dr, t0), O(i + 1, dr, t0), O(i + 1, -dl, t0), C.deck, 0, 1, 0);
  g.quad(O(i, -dl, t1), O(i, dr, t1), O(i + 1, dr, t1), O(i + 1, -dl, t1), C.deck, 0, -1, 0);
  if (!pL) {
    g.quad(O(i, -dl, t1), O(i, -dl, 0.6), O(i + 1, -dl, 0.6), O(i + 1, -dl, t1), C.deck, -nx, 0, -nz);
    g.quad(O(i, -dl + 0.3, t0), O(i, -dl + 0.3, 0.6), O(i + 1, -dl + 0.3, 0.6), O(i + 1, -dl + 0.3, t0), C.deck, nx, 0, nz);
    g.quad(O(i, -dl, 0.6), O(i, -dl + 0.3, 0.6), O(i + 1, -dl + 0.3, 0.6), O(i + 1, -dl, 0.6), C.deck, 0, 1, 0);
  }
  if (!pR) {
    g.quad(O(i, dr, t1), O(i, dr, 0.6), O(i + 1, dr, 0.6), O(i + 1, dr, t1), C.deck, nx, 0, nz);
    g.quad(O(i, dr - 0.3, t0), O(i, dr - 0.3, 0.6), O(i + 1, dr - 0.3, 0.6), O(i + 1, dr - 0.3, t0), C.deck, -nx, 0, -nz);
    g.quad(O(i, dr, 0.6), O(i, dr - 0.3, 0.6), O(i + 1, dr - 0.3, 0.6), O(i + 1, dr, 0.6), C.deck, 0, 1, 0);
  }
}

// ------------------------------------------------------------------ Bahnsteig
function platform(b: CB, ti: number, inf: { p: { s0: number; s1: number; side: 'L' | 'R'; nr: string; height?: number; track: string }; st: { id: string; name: string; pax?: number }; w: number }, a: number, e: number) {
  const t = b.ctx.idx.tracks[ti], sg = inf.p.side === 'R' ? 1 : -1, W = inf.w;
  const ph = inf.p.height && inf.p.height > 0.2 && inf.p.height < 1.5 ? inf.p.height : 0.76;
  const top = b.winter ? C.platSnow : C.plat;
  const pts = Math.max(1, Math.ceil((e - a) / 8));
  const P = b.P;
  const at = (s: number, l: number, dh: number): V3 => { t.point(s, P); return [P.x - P.dz * sg * l, P.y + dh, P.z + P.dx * sg * l]; };
  const lat = [1.65, 1.95, 2.1, 1.65 + W];
  for (let k = 0; k < pts; k++) {
    const s0 = a + ((e - a) * k) / pts, s1 = a + ((e - a) * (k + 1)) / pts;
    t.point(s0, P); const nx = -P.dz * sg, nz = P.dx * sg;
    const cols = [C.platEdge, C.platLine, top];
    for (let m = 0; m < 3; m++) b.st.quad(at(s0, lat[m], ph), at(s0, lat[m + 1], ph), at(s1, lat[m + 1], ph), at(s1, lat[m], ph), cols[m], 0, 1, 0);
    b.st.quad(at(s0, 1.65, -0.6), at(s0, 1.65, ph), at(s1, 1.65, ph), at(s1, 1.65, -0.6), C.platEdge, -nx, 0, -nz);
    b.st.quad(at(s0, 1.65 + W, ph), at(s0, 1.65 + W, -1.6), at(s1, 1.65 + W, -1.6), at(s1, 1.65 + W, ph), C.platEdge, nx, 0, nz);
  }
  for (const [s, d] of [[inf.p.s0, -1], [inf.p.s1, 1]] as [number, number][]) {
    if (s < a - 0.01 || s > e + 0.01) continue;
    t.point(s, P);
    b.st.quad(at(s, 1.65, ph), at(s, 1.65 + W, ph), at(s, 1.65 + W, -1.6), at(s, 1.65, -1.6), C.platEdge, P.dx * d, 0, P.dz * d);
  }
  const len = inf.p.s1 - inf.p.s0, mid = (inf.p.s0 + inf.p.s1) / 2, cl = 1.65 + W / 2;
  // Lampen
  for (let s = Math.ceil(a / 25) * 25; s < e; s += 25) {
    const [x, y, z] = at(s, W > 2 ? 1.65 + W - 0.4 : cl, ph);
    b.st.box(x, y, z, P.dx, P.dz, 0.12, 0.12, 4.3, C.mast);
    b.glow.box(x - P.dz * sg * -0.2, y + 4.15, z + P.dx * sg * -0.2, -P.dz, P.dx, 0.6, 0.22, 0.12, C.lampGlow);
  }
  // Dach
  // Bahnsteigdach über der Bahnsteigmitte (dort hält die Zugspitze), in 8-m-Stücken, folgt Kurven
  const Ls = Math.min(160, len * (inf.st.pax && inf.st.pax > 1500 ? 0.7 : 0.45)), r0 = Math.max(a, mid - Ls / 2), r1 = Math.min(e, mid + Ls / 2);
  if (r1 - r0 > 1) {
    const n = Math.max(1, Math.ceil((r1 - r0) / 8)), rw = Math.max(1.4, W * 0.85);
    for (let k = 0; k < n; k++) {
      const s0 = r0 + ((r1 - r0) * k) / n, s1 = r0 + ((r1 - r0) * (k + 1)) / n, sm = (s0 + s1) / 2;
      const [x, y, z] = at(sm, cl, ph);
      b.st.box(x, y + 3.4, z, P.dx, P.dz, s1 - s0 + 0.05, rw, 0.25, C.roof, b.winter ? C.snow : C.roof);
      if (Math.floor(s0 / 16) !== Math.floor(s1 / 16) || k === 0) b.st.box(x, y, z, P.dx, P.dz, 0.22, 0.22, 3.4, C.mast);
    }
  }
  // Stationsschilder
  for (const f of [0.18, 0.82]) {
    const s = inf.p.s0 + len * f; if (s < a || s >= e) continue;
    const [x, y, z] = at(s, cl, ph), dx = P.dx, dz = P.dz;
    b.st.box(x - dx * 1.7, y, z - dz * 1.7, dx, dz, 0.1, 0.1, 2.9, C.mast);
    b.st.box(x + dx * 1.7, y, z + dz * 1.7, dx, dz, 0.1, 0.1, 2.9, C.mast);
    const g = b.sign(inf.st.id, inf.st.name), nx = -dz, nz = dx;
    const A: V3 = [x - dx * 1.6, y + 2.2, z - dz * 1.6], B: V3 = [x + dx * 1.6, y + 2.2, z + dz * 1.6];
    const A2: V3 = [A[0], y + 3.0, A[2]], B2: V3 = [B[0], y + 3.0, B[2]];
    const off = (p: V3, k: number): V3 => [p[0] + nx * k, p[1], p[2] + nz * k];
    g.quad(off(A, 0.03), off(B, 0.03), off(B2, 0.03), off(A2, 0.03), C.white, nx, 0, nz, [0, 0, 1, 0, 1, 1, 0, 1]);
    g.quad(off(B, -0.03), off(A, -0.03), off(A2, -0.03), off(B2, -0.03), C.white, -nx, 0, -nz, [0, 0, 1, 0, 1, 1, 0, 1]);
  }
  // Reisende
  const dens = b.q.people * Math.min(2, 0.5 + (inf.st.pax ?? 300) / 1000);
  const cnt = Math.round((e - a) * dens);
  const r = rng((hash2(ti, Math.floor(a), b.ctx.seed) * 4294967296) >>> 0);
  for (let k = 0; k < cnt; k++) {
    const s = a + r() * (e - a), l = 1.65 + 0.8 + r() * Math.max(0.1, W - 1.3);
    const [x, y, z] = at(s, l, ph), ang = r() * Math.PI * 2;
    person(b, x, y, z, Math.cos(ang), Math.sin(ang), r);
  }
}

// ------------------------------------------------------------------ Signale
function buildSignals(b: CB) {
  const list = b.ctx.sigs.get(b.chunk.key); if (!list) return;
  for (const s of list) {
    const { x, y, z, fx, fz, sx, sz } = s;
    const gy = Math.min(y - 0.8, b.H(x, z));
    let lamps: [number, number, number][]; // [seitlich, Höhe, vor]
    if (s.kind === 2) {
      b.st.box(x, gy, z, fx, fz, 0.35, 0.6, y + 0.55 - gy, C.sigHead);
      lamps = [[-0.15, 0.32, 0.19], [0.15, 0.32, 0.19]];
    } else {
      const top = s.kind === 0 ? 4.8 : 4.6;
      b.st.box(x, gy, z, fx, fz, 0.16, 0.16, y + top - gy, C.sigMast);
      const h0 = s.kind === 0 ? 3.2 : 3.6;
      b.st.box(x + fx * 0.16, y + h0, z + fz * 0.16, fx, fz, 0.24, 0.55, top + 0.1 - h0, C.sigHead);
      lamps = s.kind === 0 ? [[0, 4.45, 0.3], [0, 4.0, 0.3], [0, 3.55, 0.3]] : [[0, 4.3, 0.3], [0, 3.85, 0.3]];
    }
    b.lampIds.push(s.id); b.lampKind.push(s.kind); b.lampFirst.push(b.lampPos.length / 4);
    for (const [l, hh, f] of lamps) b.lampPos.push(x + sx * l + fx * f, y + hh, z + sz * l + fz * f, Math.atan2(fx, fz));
  }
}

// ------------------------------------------------------------------ Bahnübergänge
function buildCrossings(b: CB) {
  const list = b.ctx.xings.get(b.chunk.key); if (!list) return;
  const M = b.ctx.mats;
  for (const g of list) {
    const { x, y, z, rdx, rdz, tdx, tdz } = g;
    const u0 = g.uMin - 3.5, u1 = g.uMax + 3.5;
    const pt = (u: number, v: number, yy: number): V3 => [x + rdx * u + tdx * v, yy, z + rdz * u + tdz * v];
    b.st.quad(pt(u0, -3, y - 0.02), pt(u1, -3, y - 0.02), pt(u1, 3, y - 0.02), pt(u0, 3, y - 0.02), C.road, 0, 1, 0);
    // Rampen und Zufahrten (dem Gelände folgend)
    for (const sgn of [-1, 1]) {
      let uPrev = sgn < 0 ? u0 : u1, yPrev = y - 0.02;
      for (let k = 1; k <= 9; k++) {
        const u = (sgn < 0 ? u0 : u1) + sgn * (k === 1 ? 12 : 12 + (k - 1) * 10);
        const yy = b.H(x + rdx * u, z + rdz * u) + 0.2;
        const ya = sgn < 0 ? yy : yPrev, yb = sgn < 0 ? yPrev : yy, ua = sgn < 0 ? u : uPrev, ub = sgn < 0 ? uPrev : u;
        b.st.quad(pt(ua, -3, ya), pt(ub, -3, yb), pt(ub, 3, yb), pt(ua, 3, ya), C.road, 0, 1, 0);
        uPrev = u; yPrev = yy;
      }
    }
    const obj: XingObj = { ids: g.ids, arms: [], lights: [] };
    for (const [u, v, dir] of [[u0 - 1.2, 3.6, -1], [u1 + 1.2, -3.6, 1]] as [number, number, number][]) {
      const [px, , pz] = pt(u, v, 0);
      b.st.box(px, y - 0.9, pz, tdx, tdz, 0.3, 0.3, 3.0, C.post);
      const piv = new THREE.Group();
      piv.position.set(px - b.ox, y + 1.0, pz - b.oz);
      piv.rotation.set(0, Math.atan2(-tdz * dir, tdx * dir), 0);
      const arm = new THREE.Mesh(M.armGeo, M.barrier); arm.position.set(0.2, 0, 0);
      piv.add(arm); b.chunk.group.add(piv); obj.arms.push(piv);
      const light = new THREE.Mesh(M.xLightGeo, M.xOff);
      light.position.set(px - b.ox, y + 2.25, pz - b.oz);
      b.chunk.group.add(light); obj.lights.push(light);
    }
    b.chunk.xings.push(obj);
  }
}

// ------------------------------------------------------------------ Tunnelportale
function buildPortals(b: CB) {
  for (const p of b.ctx.portals) {
    if (!b.inside(p.x, p.z)) continue;
    const L = p.L + 3, R = p.R + 3, c = (R - L) / 2, w = L + R;
    const x = p.x + p.nx * c, z = p.z + p.nz * c, y0 = p.y - 3;
    // Pfeiler links/rechts und Sturz
    const side = (l: number, wd: number) => b.st.box(p.x + p.nx * l, y0, p.z + p.nz * l, p.nx, p.nz, wd, 1.6, 16, C.portal);
    side(-p.L - 1.5, 3); side(p.R + 1.5, 3);
    b.st.box(x, p.y + 7.4, z, p.nx, p.nz, w, 1.6, 5.6, C.portal);
    // Zwickel zwischen Gewölbe und Sturz (beidseitig)
    const tc = (p.R - p.L) / 2, prof: [number, number][] = [[-p.L, 4.6], [-p.L + 1.7, 6.7], [tc, 7.4], [p.R - 1.7, 6.7], [p.R, 4.6]];
    const Q = (l: number, h: number): V3 => [p.x + p.nx * l, p.y + h, p.z + p.nz * l];
    for (let k = 0; k + 1 < prof.length; k++) {
      const [l0, h0] = prof[k], [l1, h1] = prof[k + 1];
      if (h0 >= 7.39 && h1 >= 7.39) continue;
      for (const sg of [1, -1]) b.st.quad(Q(l0, h0), Q(l1, h1), Q(l1, 7.45), Q(l0, 7.45), C.portal, p.dx * sg, 0, p.dz * sg);
    }
  }
}

// ------------------------------------------------------------------ Abschluss: Meshes erzeugen
function* finish(b: CB): Generator<void, Chunk, void> {
  const ch = b.chunk, M = b.ctx.mats, grp = ch.group, q = b.q;
  grp.position.set(b.ox, 0, b.oz);
  const add = (g: GeoBuf, mat: THREE.Material, name: string, shadow: boolean) => {
    const geo = g.toGeometry(); if (!geo) return null;
    const m = new THREE.Mesh(geo, mat); m.name = name; m.userData.ownGeo = true;
    m.castShadow = shadow && q.shadows; m.receiveShadow = q.shadows;
    m.matrixAutoUpdate = false; m.updateMatrix();
    grp.add(m); ch.tris += g.tris; return m;
  };
  b.st.appendGlow(b.glow);
  add(b.st, M.stat, 'static', true);
  add(b.bed, M.bed, 'bed', false);
  add(b.water, M.water, 'water', false);
  if (b.signs.size) yield; // Schildtexturen (Canvas) im nächsten Bild
  for (const [, s] of b.signs) {
    const tex = hasDom() ? signTexture(s.name, q.maxTex) : null;
    const mat = tex ? new THREE.MeshBasicMaterial({ map: tex }) : M.signPlain;
    if (tex) { ch.own.push(tex, mat); }
    add(s.g, mat, 'sign', false);
  }
  // Signallampen (Farbe je Bild über instanceColor)
  const nl = b.lampPos.length / 4;
  if (nl) {
    const im = new THREE.InstancedMesh(M.lampGeo, M.lamp, nl); im.name = 'signalLamps';
    for (let k = 0; k < nl; k++) {
      tmpE.set(0, b.lampPos[k * 4 + 3], 0); tmpQ.setFromEuler(tmpE);
      tmpV.set(b.lampPos[k * 4] - b.ox, b.lampPos[k * 4 + 1], b.lampPos[k * 4 + 2] - b.oz);
      tmpM.compose(tmpV, tmpQ, tmpS); im.setMatrixAt(k, tmpM);
      im.setColorAt(k, LAMP_COLOR_OFF);
    }
    im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true;
    im.computeBoundingSphere();
    grp.add(im); ch.tris += nl * 8;
    ch.lamps = { mesh: im, ids: b.lampIds, kind: Uint8Array.from(b.lampKind), first: Int32Array.from(b.lampFirst), cache: new Uint8Array(b.lampIds.length).fill(255) };
  }
  const ns = b.sleepM.length / 16;
  if (ns) {
    const im = new THREE.InstancedMesh(M.sleeperGeo, M.sleeper, ns); im.name = 'sleepers';
    (im.instanceMatrix.array as Float32Array).set(b.sleepM); im.instanceMatrix.needsUpdate = true;
    im.computeBoundingSphere(); im.receiveShadow = q.shadows;
    grp.add(im); ch.sleepers = im; ch.tris += ns * 12;
  }
  return ch;
}
const LAMP_COLOR_OFF = new THREE.Color().setRGB(LAMP_OFF[0], LAMP_OFF[1], LAMP_OFF[2]);
