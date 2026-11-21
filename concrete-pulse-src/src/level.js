// Park-Geometrie: analytische Höhenfunktionen (Kollision ohne Durchfallen/Hängenbleiben) und passgenaue Meshes.
// Jedes Element liefert seine Oberfläche als Funktion – Optik und Physik nutzen dieselben Formeln.
import { Vector3 } from '@babylonjs/core/Maths/math';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';

export const SOLID = new Set(['box', 'wall', 'rail', 'stairs', 'cyl']);

// ---------------------------------------------------------------- Elemente vorbereiten
export function prepare(el) {
  const e = Object.assign({ x: 0, z: 0, rot: 0, y0: 0 }, el);
  e.c = Math.cos(e.rot); e.s = Math.sin(e.rot);
  switch (e.t) {
    case 'box': case 'wall': case 'stairs': case 'ramp': e.hw = e.w / 2; e.hd = e.d / 2; e.rad = Math.hypot(e.hw, e.hd); break;
    case 'qp': {
      e.h = Math.min(e.h, e.r * 0.98);
      e.zTop = Math.sqrt(e.r * e.r - (e.r - e.h) * (e.r - e.h)); e.deck = e.deck ?? 1.2; e.len = e.zTop + e.deck; e.hw = e.w / 2;
      e.rad = Math.hypot(e.hw, e.len) + 0.5; break;
    }
    case 'bowl': {
      e.uEnd = Math.sqrt(e.rt * e.rt - (e.rt - e.depth) * (e.rt - e.depth)); e.rFlat = e.R - e.uEnd; e.rad = e.R; break;
    }
    case 'rail': {
      e.a = new Vector3(...e.a); e.b = new Vector3(...e.b);
      e.x = (e.a.x + e.b.x) / 2; e.z = (e.a.z + e.b.z) / 2; e.rad = Vector3.Distance(e.a, e.b) / 2 + 0.3; break;
    }
    case 'cyl': e.rad = e.r + 0.1; break;
  }
  return e;
}
const toLocal = (e, x, z) => { const dx = x - e.x, dz = z - e.z; return [dx * e.c - dz * e.s, dx * e.s + dz * e.c]; };
const toWorld = (e, lx, lz) => [e.x + lx * e.c + lz * e.s, e.z - lx * e.s + lz * e.c];
const gradWorld = (e, gx, gz) => [gx * e.c + gz * e.s, -gx * e.s + gz * e.c];

// Höhe eines Elements an (x,z) → {h, gx, gz} oder null
function evalEl(e, x, z, out) {
  if (Math.abs(x - e.x) > e.rad || Math.abs(z - e.z) > e.rad) return false;
  let h, gx = 0, gz = 0;
  switch (e.t) {
    case 'box': case 'wall': { const [lx, lz] = toLocal(e, x, z); if (Math.abs(lx) > e.hw || Math.abs(lz) > e.hd) return false; h = e.h; break; }
    case 'ramp': {
      const [lx, lz] = toLocal(e, x, z); if (Math.abs(lx) > e.hw || Math.abs(lz) > e.hd) return false;
      const t = (lz + e.hd) / e.d; h = e.y0 + t * e.h; [gx, gz] = gradWorld(e, 0, e.h / e.d); break;
    }
    case 'stairs': {
      const [lx, lz] = toLocal(e, x, z); if (Math.abs(lx) > e.hw || Math.abs(lz) > e.hd) return false;
      const k = Math.min(e.n - 1, Math.floor((lz + e.hd) / e.d * e.n)); h = e.y0 + e.h * (e.n - k) / e.n; break;
    }
    case 'qp': {
      const [lx, lz] = toLocal(e, x, z); if (Math.abs(lx) > e.hw || lz < 0 || lz > e.len) return false;
      if (lz <= e.zTop) { const q = Math.sqrt(Math.max(1e-6, e.r * e.r - lz * lz)); h = e.y0 + e.r - q; [gx, gz] = gradWorld(e, 0, lz / q); }
      else h = e.y0 + e.h;
      break;
    }
    case 'bowl': {
      const dx = x - e.x, dz = z - e.z, rho = Math.hypot(dx, dz); if (rho > e.R) return false;
      if (rho <= e.rFlat) h = -e.depth;
      else { const u = rho - e.rFlat, q = Math.sqrt(Math.max(1e-6, e.rt * e.rt - u * u)); h = -e.depth + e.rt - q; const g = u / q; gx = g * dx / rho; gz = g * dz / rho; }
      break;
    }
    case 'rail': {
      const ax = e.a.x, az = e.a.z, bx = e.b.x - ax, bz = e.b.z - az, L2 = bx * bx + bz * bz;
      const t = ((x - ax) * bx + (z - az) * bz) / L2; if (t <= 0 || t >= 1) return false;
      const px = ax + bx * t, pz = az + bz * t; if (Math.hypot(x - px, z - pz) > 0.14) return false;
      h = e.a.y + (e.b.y - e.a.y) * t + 0.03; break;
    }
    case 'cyl': { if (Math.hypot(x - e.x, z - e.z) > e.r) return false; h = e.h; break; }
    default: return false;
  }
  out.h = h; out.gx = gx; out.gz = gz; out.el = e; return true;
}

export class Level {
  constructor(def) {
    this.def = def;
    this.els = def.elements.map(prepare);
    this.bowls = this.els.filter(e => e.t === 'bowl');
    this.solids = this.els.filter(e => e.t !== 'bowl');
    this.bounds = def.bounds; // [minX, minZ, maxX, maxZ]
    this.segs = buildSegments(this.els);
    this._o = { h: 0, gx: 0, gz: 0, el: null };
  }
  // Oberfläche: {h, gx, gz, el}
  surface(x, z, out = { h: 0, gx: 0, gz: 0, el: null }) {
    let h = 0, gx = 0, gz = 0, el = null;
    const o = this._o;
    for (const b of this.bowls) if (evalEl(b, x, z, o)) { h = o.h; gx = o.gx; gz = o.gz; el = b; break; }
    for (const e of this.solids) if (e.t !== 'rail' && evalEl(e, x, z, o) && o.h > h) { h = o.h; gx = o.gx; gz = o.gz; el = e; }
    const [x0, z0, x1, z1] = this.bounds;
    if (x < x0 || x > x1 || z < z0 || z > z1) { h = 50; el = { t: 'wall' }; gx = gz = 0; }
    out.h = h; out.gx = gx; out.gz = gz; out.el = el; return out;
  }
  height(x, z) { return this.surface(x, z, this._tmp || (this._tmp = {})).h; }
  // nur feste Körper (Kisten, Wände, Geländer, Treppen) an (x,z)
  solidTop(x, z) {
    const o = this._o; let h = -Infinity;
    for (const e of this.solids) if (SOLID.has(e.t) && evalEl(e, x, z, o) && o.h > h) h = o.h;
    const [x0, z0, x1, z1] = this.bounds;
    if (x < x0 || x > x1 || z < z0 || z > z1) h = 50;
    return h;
  }
  // Auswärts-Normale der nächsten Kante des Elements, das (x,z) blockiert
  wallNormal(x, z, fromX, fromZ) {
    const o = this._o;
    const [x0, z0, x1, z1] = this.bounds;
    if (x < x0) return [1, 0]; if (x > x1) return [-1, 0]; if (z < z0) return [0, 1]; if (z > z1) return [0, -1];
    let best = null, bh = -Infinity;
    for (const e of this.els) if (e.t !== 'bowl' && evalEl(e, x, z, o) && o.h > bh) { bh = o.h; best = e; }
    if (!best) { const dx = x - fromX, dz = z - fromZ, l = Math.hypot(dx, dz) || 1; return [-dx / l, -dz / l]; }
    const e = best;
    if (e.t === 'cyl') { const dx = x - e.x, dz = z - e.z, l = Math.hypot(dx, dz) || 1; return [dx / l, dz / l]; }
    if (e.t === 'rail') { const bx = e.b.x - e.a.x, bz = e.b.z - e.a.z, l = Math.hypot(bx, bz); let nx = -bz / l, nz = bx / l; if ((fromX - e.a.x) * nx + (fromZ - e.a.z) * nz < 0) { nx = -nx; nz = -nz; } return [nx, nz]; }
    // rechteckige Grundfläche: Kante, auf die der Ausgangspunkt zeigt
    const [lx, lz] = toLocal(e, fromX, fromZ);
    let hw = e.hw, zmin = -e.hd, zmax = e.hd;
    if (e.t === 'qp') { zmin = 0; zmax = e.len; }
    const zc = (zmin + zmax) / 2, hz = (zmax - zmin) / 2;
    const ex = Math.abs(lx) - hw, ez = Math.abs(lz - zc) - hz;
    let n = ex > ez ? [Math.sign(lx) || 1, 0] : [0, Math.sign(lz - zc) || 1];
    const [wx, wz] = gradWorld(e, n[0], n[1]);
    return [wx, wz];
  }
}

// ---------------------------------------------------------------- Grind-Kanten
function seg(a, b, kind, el, out) {
  const d = b.subtract(a), len = d.length();
  return { a, b, len, dir: d.scale(1 / len), kind, el, out: out || null };
}
function buildSegments(els) {
  const S = [];
  for (const e of els) {
    if (e.t === 'rail') S.push(seg(e.a.clone(), e.b.clone(), 'rail', e));
    else if ((e.t === 'box') && e.grind) {
      const P = (lx, lz) => { const [x, z] = toWorld(e, lx, lz); return new Vector3(x, e.h, z); };
      const edges = { n: [[-e.hw, e.hd], [e.hw, e.hd], [0, 1]], s: [[e.hw, -e.hd], [-e.hw, -e.hd], [0, -1]], e: [[e.hw, e.hd], [e.hw, -e.hd], [1, 0]], w: [[-e.hw, -e.hd], [-e.hw, e.hd], [-1, 0]] };
      const list = e.grind === true ? ['n', 's', 'e', 'w'] : e.grind;
      for (const k of list) { const [p, q, n] = edges[k]; const [ox, oz] = gradWorld(e, n[0], n[1]); S.push(seg(P(...p), P(...q), 'ledge', e, [ox, oz])); }
    } else if (e.t === 'qp' && e.coping !== false) {
      const [x1, z1] = toWorld(e, -e.hw, e.zTop), [x2, z2] = toWorld(e, e.hw, e.zTop);
      const [ox, oz] = gradWorld(e, 0, -1);
      S.push(seg(new Vector3(x1, e.y0 + e.h, z1), new Vector3(x2, e.y0 + e.h, z2), 'coping', e, [ox, oz]));
    } else if (e.t === 'bowl' && e.coping !== false) {
      const N = 28;
      for (let i = 0; i < N; i++) {
        const a1 = (i / N) * Math.PI * 2, a2 = ((i + 1) / N) * Math.PI * 2;
        const p = new Vector3(e.x + Math.cos(a1) * e.R, 0, e.z + Math.sin(a1) * e.R), q = new Vector3(e.x + Math.cos(a2) * e.R, 0, e.z + Math.sin(a2) * e.R);
        const am = (a1 + a2) / 2; S.push(seg(p, q, 'coping', e, [-Math.cos(am), -Math.sin(am)]));
      }
    }
  }
  return S;
}

// ---------------------------------------------------------------- Meshes
class Geo {
  constructor() { this.p = []; this.i = []; this.uv = []; this.n = []; }
  get count() { return this.p.length / 3; }
  quad(a, b, c, d, tile = 2) { // flache Fläche, eigene Ecken, planare UV
    const n = Vector3.Cross(b.subtract(a), d.subtract(a)).normalize();
    const base = this.count;
    for (const v of [a, b, c, d]) { this.p.push(v.x, v.y, v.z); this.n.push(n.x, n.y, n.z); this.uv.push(...planar(v, n, tile)); }
    this.i.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  tri(a, b, c, tile = 2) {
    const n = Vector3.Cross(b.subtract(a), c.subtract(a)).normalize(), base = this.count;
    for (const v of [a, b, c]) { this.p.push(v.x, v.y, v.z); this.n.push(n.x, n.y, n.z); this.uv.push(...planar(v, n, tile)); }
    this.i.push(base, base + 1, base + 2);
  }
  poly(pts, tile = 2) { for (let k = 1; k < pts.length - 1; k++) this.tri(pts[0], pts[k], pts[k + 1], tile); }
  // glattes Gitter rows[r][c] mit uv[r][c]
  grid(rows, uvs) {
    const base = this.count, C = rows[0].length;
    rows.forEach((row, r) => row.forEach((v, c) => { this.p.push(v.x, v.y, v.z); this.n.push(0, 0, 0); this.uv.push(...uvs[r][c]); }));
    const local = [];
    for (let r = 0; r < rows.length - 1; r++) for (let c = 0; c < C - 1; c++) {
      const a = base + r * C + c, b = a + 1, d = a + C, e = d + 1; local.push(a, d, b, b, d, e);
    }
    // Normalen dieses Gitters berechnen
    const P = this.p, N = this.n;
    for (let k = 0; k < local.length; k += 3) {
      const [i0, i1, i2] = [local[k], local[k + 1], local[k + 2]];
      const v0 = new Vector3(P[i0 * 3], P[i0 * 3 + 1], P[i0 * 3 + 2]), v1 = new Vector3(P[i1 * 3], P[i1 * 3 + 1], P[i1 * 3 + 2]), v2 = new Vector3(P[i2 * 3], P[i2 * 3 + 1], P[i2 * 3 + 2]);
      const n = Vector3.Cross(v1.subtract(v0), v2.subtract(v0));
      for (const i of [i0, i1, i2]) { N[i * 3] += n.x; N[i * 3 + 1] += n.y; N[i * 3 + 2] += n.z; }
    }
    // Fahrflächen zeigen immer nach oben/innen
    let sy = 0; for (let i = base; i < this.count; i++) sy += N[i * 3 + 1];
    const flip = sy < 0 ? -1 : 1;
    for (let i = base; i < this.count; i++) { const l = (Math.hypot(N[i * 3], N[i * 3 + 1], N[i * 3 + 2]) || 1) * flip; N[i * 3] /= l; N[i * 3 + 1] /= l; N[i * 3 + 2] /= l; }
    this.i.push(...local);
  }
  mesh(name, scene) {
    orient(this.p, this.i, this.n);
    const m = new Mesh(name, scene), vd = new VertexData();
    vd.positions = this.p; vd.indices = this.i; vd.normals = this.n; vd.uvs = this.uv; vd.applyToMesh(m);
    return m;
  }
}
// Dreiecks-Umlauf passend zur Normale ausrichten (rechtshändige Szene: Vorderseite = Umlauf entgegen der Normalen-Regel)
export function orient(P, I, N) {
  for (let k = 0; k < I.length; k += 3) {
    const a = I[k] * 3, b = I[k + 1] * 3, c = I[k + 2] * 3;
    const ux = P[b] - P[a], uy = P[b + 1] - P[a + 1], uz = P[b + 2] - P[a + 2], vx = P[c] - P[a], vy = P[c + 1] - P[a + 1], vz = P[c + 2] - P[a + 2];
    const gx = uy * vz - uz * vy, gy = uz * vx - ux * vz, gz = ux * vy - uy * vx;
    const nx = N[a] + N[b] + N[c], ny = N[a + 1] + N[b + 1] + N[c + 1], nz = N[a + 2] + N[b + 2] + N[c + 2];
    if (gx * nx + gy * ny + gz * nz > 0) { const t = I[k + 1]; I[k + 1] = I[k + 2]; I[k + 2] = t; }
  }
}
function planar(v, n, tile) {
  const ax = Math.abs(n.x), ay = Math.abs(n.y), az = Math.abs(n.z);
  if (ay >= ax && ay >= az) return [v.x / tile, v.z / tile];
  if (ax >= az) return [v.z / tile, v.y / tile];
  return [v.x / tile, v.y / tile];
}

// Baut alle Meshes eines Parks; mats = { key: Material }, Rückgabe: Liste der Meshes (für Schatten)
export function buildMeshes(level, scene, mats) {
  const groups = {};                     // Material-Schlüssel → Geo (Weltkoordinaten)
  const G = k => groups[k] || (groups[k] = new Geo());
  const W = (e, lx, y, lz) => { const [x, z] = toWorld(e, lx, lz); return new Vector3(x, y, z); };
  const extra = [];
  const tubes = [];                      // Metallrohre (Coping, Geländer)
  for (const e of level.els) {
    const m = e.mat || ({ box: 'concrete', wall: 'wall', ramp: 'ramp', qp: 'ramp', stairs: 'concrete', bowl: 'pool', rail: 'metal', cyl: 'concrete' })[e.t];
    const side = e.side || (e.t === 'qp' || e.t === 'ramp' ? 'rampSide' : m);
    switch (e.t) {
      case 'box': case 'wall': {
        const y0 = e.base ?? 0, y1 = e.h, hw = e.hw, hd = e.hd;
        const P = (lx, y, lz) => W(e, lx, y, lz);
        G(e.top || m).quad(P(-hw, y1, -hd), P(-hw, y1, hd), P(hw, y1, hd), P(hw, y1, -hd));
        const g = G(side);
        g.quad(P(-hw, y0, hd), P(hw, y0, hd), P(hw, y1, hd), P(-hw, y1, hd));
        g.quad(P(hw, y0, -hd), P(-hw, y0, -hd), P(-hw, y1, -hd), P(hw, y1, -hd));
        g.quad(P(hw, y0, hd), P(hw, y0, -hd), P(hw, y1, -hd), P(hw, y1, hd));
        g.quad(P(-hw, y0, -hd), P(-hw, y0, hd), P(-hw, y1, hd), P(-hw, y1, -hd));
        break;
      }
      case 'ramp': {
        const { hw, hd, y0, h } = e, P = (lx, y, lz) => W(e, lx, y, lz), b = e.base ?? 0;
        G(m).quad(P(-hw, y0, -hd), P(-hw, y0 + h, hd), P(hw, y0 + h, hd), P(hw, y0, -hd));
        const g = G(side);
        g.poly([P(hw, b, -hd), P(hw, b, hd), P(hw, y0 + h, hd), P(hw, y0, -hd)]);
        g.poly([P(-hw, b, hd), P(-hw, b, -hd), P(-hw, y0, -hd), P(-hw, y0 + h, hd)]);
        g.quad(P(-hw, b, hd), P(hw, b, hd), P(hw, y0 + h, hd), P(-hw, y0 + h, hd));
        break;
      }
      case 'stairs': {
        const { hw, hd, n, h, y0 } = e, P = (lx, y, lz) => W(e, lx, y, lz), g = G(m), sd = G(side);
        for (let k = 0; k < n; k++) {
          const z0 = -hd + (e.d * k) / n, z1 = -hd + (e.d * (k + 1)) / n, top = y0 + (h * (n - k)) / n, low = y0 + (h * (n - k - 1)) / n;
          g.quad(P(-hw, top, z0), P(-hw, top, z1), P(hw, top, z1), P(hw, top, z0));
          g.quad(P(-hw, low, z1), P(hw, low, z1), P(hw, top, z1), P(-hw, top, z1));   // Stufenkante
          sd.quad(P(hw, 0, z1), P(hw, 0, z0), P(hw, top, z0), P(hw, top, z1));
          sd.quad(P(-hw, 0, z0), P(-hw, 0, z1), P(-hw, top, z1), P(-hw, top, z0));
        }
        sd.quad(P(hw, 0, -hd), P(-hw, 0, -hd), P(-hw, y0 + h, -hd), P(hw, y0 + h, -hd));
        break;
      }
      case 'qp': {
        const { hw, r, zTop, len, y0, h } = e, N = 22, rows = [], uvs = [];
        let arc = 0, prev = null;
        for (let k = 0; k <= N; k++) {
          const lz = (zTop * k) / N, y = y0 + r - Math.sqrt(Math.max(0, r * r - lz * lz));
          const p = new Vector3(0, y, lz); if (prev) arc += Vector3.Distance(p, prev); prev = p;
          rows.push([W(e, -hw, y, lz), W(e, hw, y, lz)]); uvs.push([[0, arc / 2], [e.w / 2, arc / 2]]);
        }
        // Gitter quer feiner unterteilen (bessere Beleuchtung)
        const CX = Math.max(2, Math.ceil(e.w / 1.5));
        const rows2 = rows.map((row, ri) => { const out = []; for (let c = 0; c <= CX; c++) out.push(Vector3.Lerp(row[0], row[1], c / CX)); return out; });
        const uv2 = uvs.map(u => { const out = []; for (let c = 0; c <= CX; c++) out.push([(e.w * c / CX) / 2, u[0][1]]); return out; });
        G(m).grid(rows2, uv2);
        // Deck
        const deckM = e.deckMat || 'deck';
        if (e.deck > 0.01) G(deckM).quad(W(e, -hw, y0 + h, zTop), W(e, -hw, y0 + h, len), W(e, hw, y0 + h, len), W(e, hw, y0 + h, zTop));
        // Seiten
        const b = e.base ?? 0;
        for (const sx of [-1, 1]) {
          const pts = [];
          for (let k = 0; k <= N; k++) { const lz = (zTop * k) / N; pts.push(W(e, sx * hw, y0 + r - Math.sqrt(Math.max(0, r * r - lz * lz)), lz)); }
          pts.push(W(e, sx * hw, y0 + h, len), W(e, sx * hw, b, len), W(e, sx * hw, b, 0));
          if (sx > 0) pts.reverse();
          // Fächer vom Fußpunkt hinten
          const g = G(side); const pivot = W(e, sx * hw, b, len);
          for (let k = 0; k < pts.length - 1; k++) { if (pts[k] === pivot || pts[k + 1] === pivot) continue; g.tri(pivot, pts[k], pts[k + 1]); }
        }
        G(side).quad(W(e, hw, b, len), W(e, -hw, b, len), W(e, -hw, y0 + h, len), W(e, hw, y0 + h, len));
        if (e.coping !== false) tubes.push([W(e, -hw, y0 + h + 0.0, zTop), W(e, hw, y0 + h + 0.0, zTop), 0.035, 'metal']);
        break;
      }
      case 'bowl': {
        const N = 64, K = 18, rows = [], uvs = [];
        // Ring von innen (Boden) nach außen (Kante)
        for (let k = 0; k <= K; k++) {
          const u = (e.uEnd * k) / K, rho = e.rFlat + u, y = -e.depth + e.rt - Math.sqrt(Math.max(0, e.rt * e.rt - u * u));
          const row = [], ur = [];
          for (let j = 0; j <= N; j++) { const a = (j / N) * Math.PI * 2; row.push(new Vector3(e.x + Math.cos(a) * rho, y, e.z + Math.sin(a) * rho)); ur.push([j / N * e.R * 3, k / K * 3]); }
          rows.push(row); uvs.push(ur);
        }
        G(m).grid(rows, uvs);
        // Boden
        const floor = [], fu = [];
        for (const rr of [0, 1]) { const row = [], ur = []; for (let j = 0; j <= N; j++) { const a = (j / N) * Math.PI * 2, rho = rr ? e.rFlat : 0.001; const v = new Vector3(e.x + Math.cos(a) * rho, -e.depth, e.z + Math.sin(a) * rho); row.push(v); ur.push([v.x / 2, v.z / 2]); } floor.push(row); fu.push(ur); }
        G(e.floorMat || m).grid(floor, fu);
        if (e.coping !== false) for (let j = 0; j < 40; j++) { const a1 = j / 40 * Math.PI * 2, a2 = (j + 1) / 40 * Math.PI * 2; tubes.push([new Vector3(e.x + Math.cos(a1) * e.R, 0, e.z + Math.sin(a1) * e.R), new Vector3(e.x + Math.cos(a2) * e.R, 0, e.z + Math.sin(a2) * e.R), 0.045, 'metal']); }
        break;
      }
      case 'rail': {
        tubes.push([e.a.clone(), e.b.clone(), 0.03, e.mat || 'metal']);
        const L = Vector3.Distance(e.a, e.b), n = Math.max(2, Math.ceil(L / 2.5) + 1);
        for (let k = 0; k < n; k++) { const t = 0.04 + 0.92 * k / (n - 1), p = Vector3.Lerp(e.a, e.b, t); const g = level.surfaceUnder ? 0 : 0; extra.push(['post', p, e.mat || 'metal']); }
        break;
      }
      case 'cyl': {
        const c = MeshBuilder.CreateCylinder('cyl', { diameter: e.r * 2, height: e.h - (e.base ?? 0), tessellation: 24 }, scene);
        c.position.set(e.x, (e.h + (e.base ?? 0)) / 2, e.z); c.material = mats[m] || mats.concrete; c.receiveShadows = true; extra.push(['mesh', c]);
        break;
      }
    }
  }
  const out = [];
  for (const k in groups) { const msh = groups[k].mesh('lvl_' + k, scene); msh.material = mats[k] || mats.concrete; msh.receiveShadows = true; out.push(msh); }
  // Rohre
  const tubeMeshes = {};
  const T = k => tubeMeshes[k] || (tubeMeshes[k] = []);
  for (const [a, b, r, k] of tubes) {
    const t = MeshBuilder.CreateTube('tube', { path: [a, b], radius: r, tessellation: 12, cap: Mesh.CAP_ALL }, scene); T(k).push(t);
  }
  for (const x of extra) {
    if (x[0] === 'post') { const p = x[1]; const hgt = Math.max(0.05, p.y - groundBelow(level, p)); const c = MeshBuilder.CreateCylinder('post', { diameter: 0.05, height: hgt, tessellation: 8 }, scene); c.position.set(p.x, p.y - hgt / 2, p.z); T('metal').push(c); }
    if (x[0] === 'mesh') out.push(x[1]);
  }
  for (const k in tubeMeshes) { const merged = Mesh.MergeMeshes(tubeMeshes[k], true, true); merged.material = mats[k] || mats.metal; merged.receiveShadows = true; out.push(merged); }
  for (const m of out) { m.freezeWorldMatrix(); m.isPickable = false; m.doNotSyncBoundingInfo = true; }
  return out;
}
// Boden unter einem Geländerpfosten (ohne das Geländer selbst)
function groundBelow(level, p) {
  let h = 0; const o = {};
  for (const b of level.bowls) if (evalEl(b, p.x, p.z, o)) h = o.h;
  for (const e of level.solids) if (e.t !== 'rail' && evalEl(e, p.x, p.z, o) && o.h > h && o.h < p.y) h = o.h;
  return h;
}
export { toWorld, toLocal };
