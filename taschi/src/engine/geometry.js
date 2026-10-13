// Geometry helpers: merge many primitives into one vertex-coloured
// BufferGeometry (one draw call per material), plus a few stylised shapes.
import { THREE } from './three.js';

const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new THREE.Vector3(), _p = new THREE.Vector3();

export function matrix(x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = sx, sz = sx) {
  _e.set(rx, ry, rz); _q.setFromEuler(_e); _p.set(x, y, z); _s.set(sx, sy, sz);
  return new THREE.Matrix4().compose(_p, _q, _s);
}

// A builder that collects parts and merges them.
export class Builder {
  constructor() { this.parts = []; }
  add(geo, color, mat = null, opts = {}) {
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    if (mat) g.applyMatrix4(mat);
    const n = g.attributes.position.count;
    let cols;
    if ((color === null || color === undefined) && g.attributes.color) cols = g.attributes.color.array.slice();
    else {
      const c = new THREE.Color(color ?? 0xffffff);
      cols = new Float32Array(n * 3);
      const jitter = opts.jitter || 0;
      for (let i = 0; i < n; i++) {
        const j = jitter ? 1 + (pseudo(i * 7.13 + n) - 0.5) * jitter : 1;
        cols[i * 3] = c.r * j; cols[i * 3 + 1] = c.g * j; cols[i * 3 + 2] = c.b * j;
      }
    }
    // vertical gradient (darker at the bottom) for a soft painted look
    if (opts.shade) {
      g.computeBoundingBox();
      const { min, max } = g.boundingBox, h = Math.max(0.001, max.y - min.y);
      const pos = g.attributes.position;
      for (let i = 0; i < n; i++) {
        const t = (pos.getY(i) - min.y) / h, f = 1 - opts.shade * (1 - t);
        cols[i * 3] *= f; cols[i * 3 + 1] *= f; cols[i * 3 + 2] *= f;
      }
    }
    g.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    if (!g.attributes.normal) g.computeVertexNormals();
    if (g.attributes.uv) g.deleteAttribute('uv');
    if (g.attributes.uv2) g.deleteAttribute('uv2');
    this.parts.push(g);
    return this;
  }
  box(w, h, d, color, x, y, z, ry = 0, opts) { return this.add(new THREE.BoxGeometry(w, h, d), color, matrix(x, y, z, 0, ry, 0), opts); }
  cyl(rt, rb, h, color, x, y, z, seg = 8, opts) { return this.add(new THREE.CylinderGeometry(rt, rb, h, seg), color, matrix(x, y, z), opts); }
  sphere(r, color, x, y, z, sx = 1, sy = 1, sz = 1, seg = 8, opts) { return this.add(new THREE.SphereGeometry(r, seg, Math.max(4, seg - 2)), color, matrix(x, y, z, 0, 0, 0, sx, sy, sz), opts); }
  build() { return mergeGeometries(this.parts); }
  get empty() { return !this.parts.length; }
}

function pseudo(x) { const s = Math.sin(x * 12.9898) * 43758.5453; return s - Math.floor(s); }

export function mergeGeometries(list) {
  let count = 0;
  for (const g of list) count += g.attributes.position.count;
  const pos = new Float32Array(count * 3), nor = new Float32Array(count * 3), col = new Float32Array(count * 3);
  let o = 0;
  for (const g of list) {
    pos.set(g.attributes.position.array, o * 3);
    nor.set(g.attributes.normal.array, o * 3);
    if (g.attributes.color) col.set(g.attributes.color.array, o * 3); else col.fill(1, o * 3, (o + g.attributes.position.count) * 3);
    o += g.attributes.position.count;
    g.dispose();
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  out.setAttribute('color', new THREE.BufferAttribute(col, 3));
  out.computeBoundingSphere();
  out.computeBoundingBox();
  return out;
}

// Gabled roof prism (width along x, depth along z), apex at height h.
export function roofGeometry(w, d, h, overhang = 0.35) {
  const W = w / 2 + overhang, D = d / 2 + overhang;
  const shape = new THREE.Shape();
  shape.moveTo(-W, 0); shape.lineTo(0, h); shape.lineTo(W, 0); shape.lineTo(W - 0.18, 0); shape.lineTo(0, h - 0.22); shape.lineTo(-W + 0.18, 0); shape.lineTo(-W, 0);
  const g = new THREE.ExtrudeGeometry(shape, { depth: D * 2, bevelEnabled: false });
  g.translate(0, 0, -D);
  return g;
}

// Solid roof volume (for filling)
export function roofSolid(w, d, h) {
  const shape = new THREE.Shape();
  shape.moveTo(-w / 2, 0); shape.lineTo(0, h); shape.lineTo(w / 2, 0); shape.lineTo(-w / 2, 0);
  const g = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false });
  g.translate(0, 0, -d / 2);
  return g;
}

// Capsule built from a lathe profile.
export function capsule(r, len, seg = 10, rings = 4) {
  const pts = [];
  for (let i = 0; i <= rings; i++) { const a = -Math.PI / 2 + (i / rings) * Math.PI / 2; pts.push(new THREE.Vector2(Math.cos(a) * r, Math.sin(a) * r - len / 2)); }
  for (let i = 0; i <= rings; i++) { const a = (i / rings) * Math.PI / 2; pts.push(new THREE.Vector2(Math.cos(a) * r, Math.sin(a) * r + len / 2)); }
  return new THREE.LatheGeometry(pts, seg);
}

// Rounded body from a list of [radius, y] pairs (lathe), used by creatures.
export function lathe(profile, seg = 14) {
  return new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(Math.max(0.001, r), y)), seg);
}

// Rounded box (soft edges) – cheap approximation via scaled sphere + box.
export function softBox(w, h, d, seg = 2) {
  const g = new THREE.BoxGeometry(w, h, d, seg, seg, seg);
  const pos = g.attributes.position, v = new THREE.Vector3();
  const r = Math.min(w, h, d) * 0.22;
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const cx = Math.max(-w / 2 + r, Math.min(w / 2 - r, v.x)), cy = Math.max(-h / 2 + r, Math.min(h / 2 - r, v.y)), cz = Math.max(-d / 2 + r, Math.min(d / 2 - r, v.z));
    const dx = v.x - cx, dy = v.y - cy, dz = v.z - cz, len = Math.hypot(dx, dy, dz);
    if (len > 0) { v.set(cx + dx / len * r, cy + dy / len * r, cz + dz / len * r); pos.setXYZ(i, v.x, v.y, v.z); }
  }
  g.computeVertexNormals();
  return g;
}

// Deform a geometry with smooth pseudo-noise (used for rocks and canopies).
export function lumpy(geo, amount = 0.15, seed = 1) {
  const g = geo.index ? geo.toNonIndexed() : geo;
  const pos = g.attributes.position, v = new THREE.Vector3();
  const map = new Map();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const k = v.x.toFixed(3) + v.y.toFixed(3) + v.z.toFixed(3);
    let f = map.get(k);
    if (f === undefined) { f = 1 + (Math.sin(v.x * 3.1 + seed) * Math.cos(v.y * 2.7 + seed * 1.7) * Math.sin(v.z * 3.3 + seed * 0.3)) * amount; map.set(k, f); }
    pos.setXYZ(i, v.x * f, v.y * f, v.z * f);
  }
  g.computeVertexNormals();
  return g;
}
