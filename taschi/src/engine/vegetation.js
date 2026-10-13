// Vegetation and rock geometry (two detail levels each) and a chunked
// instancing system with manual frustum culling and distance-based LOD.
import { THREE } from './three.js';
import { Builder, matrix, lumpy } from './geometry.js';
import { foliageMaterial, envMaterial, grassMaterial } from './materials.js';

const C = (c) => new THREE.Color(c);
function shade(c, f) { return C(c).multiplyScalar(f).getHex(); }
function mix(a, b, t) { return C(a).lerp(C(b), t).getHex(); }

function canopy(b, r, color, x, y, z, sx = 1, sy = 1, sz = 1, detail = 1, seed = 1) {
  const g = lumpy(new THREE.IcosahedronGeometry(r, detail), 0.16, seed);
  b.add(g, color, matrix(x, y, z, 0, seed, 0, sx, sy, sz), { shade: 0.35 });
}

// Returns { high, low } geometries for a vegetation type, tinted by palette.
export function vegetationGeometry(type, pal) {
  const leaf = pal.leaf || shade(pal.grass, 0.78), leaf2 = mix(leaf, 0xd8f080, 0.18), bark = pal.bark || 0x6e4e36;
  const hi = new Builder(), lo = new Builder();
  switch (type) {
    case 'oak':
      hi.cyl(0.22, 0.36, 2.6, bark, 0, 1.3, 0, 7, { shade: 0.3 });
      hi.add(new THREE.CylinderGeometry(0.06, 0.12, 1.3, 5), bark, matrix(0.45, 2.3, 0, 0, 0, -0.8));
      canopy(hi, 1.5, leaf, 0, 3.6, 0, 1.25, 1, 1.2, 1, 1);
      canopy(hi, 1.1, leaf2, 0.9, 3.1, 0.4, 1, 0.9, 1, 1, 2);
      canopy(hi, 1.0, leaf, -0.8, 3.3, -0.5, 1, 0.9, 1, 1, 3);
      canopy(hi, 0.9, leaf2, 0.1, 4.5, -0.2, 1, 0.9, 1, 1, 4);
      lo.cyl(0.25, 0.35, 2.6, bark, 0, 1.3, 0, 5); lo.add(new THREE.IcosahedronGeometry(1.9, 0), leaf, matrix(0, 3.7, 0, 0, 0, 0, 1.1, 0.9, 1.1), { shade: 0.3 });
      break;
    case 'blossom': {
      const pink = pal.blossom || 0xf5a9c6;
      hi.cyl(0.18, 0.3, 2.4, 0x5a3c34, 0, 1.2, 0, 7, { shade: 0.3 });
      hi.add(new THREE.CylinderGeometry(0.05, 0.1, 1.4, 5), 0x5a3c34, matrix(-0.5, 2.3, 0.1, 0, 0, 0.7));
      canopy(hi, 1.3, pink, 0, 3.4, 0, 1.4, 0.85, 1.3, 1, 5);
      canopy(hi, 0.9, mix(pink, 0xffffff, 0.35), 1.0, 3.0, 0.3, 1, 0.8, 1, 1, 6);
      canopy(hi, 0.9, shade(pink, 0.9), -1.0, 3.2, -0.3, 1, 0.8, 1, 1, 7);
      lo.cyl(0.2, 0.3, 2.4, 0x5a3c34, 0, 1.2, 0, 5); lo.add(new THREE.IcosahedronGeometry(1.8, 0), pink, matrix(0, 3.3, 0, 0, 0, 0, 1.2, 0.8, 1.2));
      break;
    }
    case 'pine': case 'snowpine': {
      const needle = type === 'snowpine' ? 0x3f6a5a : shade(leaf, 0.82);
      hi.cyl(0.16, 0.28, 1.6, bark, 0, 0.8, 0, 6);
      for (let i = 0; i < 4; i++) {
        const y = 1.4 + i * 1.05, r = 1.7 - i * 0.36;
        hi.add(new THREE.ConeGeometry(r, 1.7, 9), needle, matrix(0, y + 0.6, 0, 0, i * 0.4, 0), { shade: 0.4 });
        if (type === 'snowpine') hi.add(new THREE.ConeGeometry(r * 0.8, 0.6, 9), 0xf4f8fb, matrix(0, y + 1.05, 0, 0, i * 0.4, 0));
      }
      lo.cyl(0.18, 0.28, 1.6, bark, 0, 0.8, 0, 4); lo.add(new THREE.ConeGeometry(1.7, 4.8, 6), needle, matrix(0, 3.6, 0), { shade: 0.4 });
      if (type === 'snowpine') lo.add(new THREE.ConeGeometry(0.9, 1.2, 6), 0xf4f8fb, matrix(0, 5.4, 0));
      break;
    }
    case 'palm': {
      for (let i = 0; i < 6; i++) hi.add(new THREE.CylinderGeometry(0.17 - i * 0.012, 0.2 - i * 0.012, 0.75, 6), mix(0x8a6a48, 0xb89a72, i % 2 * 0.5), matrix(Math.sin(i * 0.3) * 0.3 * i * 0.25, 0.37 + i * 0.7, 0, 0, 0, -0.06 * i));
      const top = [0.7, 4.3, 0];
      for (let k = 0; k < 7; k++) {
        const a = k / 7 * Math.PI * 2;
        const fr = new THREE.BoxGeometry(2.6, 0.05, 0.55);
        hi.add(fr, k % 2 ? leaf : leaf2, matrix(top[0] + Math.cos(a) * 1.2, top[1] - 0.3, Math.sin(a) * 1.2, 0, -a, -0.45));
      }
      hi.sphere(0.25, 0x6b4a2a, top[0], top[1] - 0.15, 0.2, 1, 1, 1, 6);
      lo.cyl(0.15, 0.2, 4.2, 0x8a6a48, 0.3, 2.1, 0, 4); lo.add(new THREE.ConeGeometry(2, 0.8, 6), leaf, matrix(0.7, 4.0, 0, Math.PI, 0, 0));
      break;
    }
    case 'mushroom': {
      const cap = pal.mushroom || 0xd8574a;
      hi.cyl(0.35, 0.5, 2.4, 0xf1e6cf, 0, 1.2, 0, 10, { shade: 0.2 });
      hi.add(new THREE.SphereGeometry(1.8, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), cap, matrix(0, 2.3, 0, 0, 0, 0, 1, 0.7, 1));
      for (let i = 0; i < 7; i++) { const a = i * 2.4; hi.sphere(0.18, 0xfff5e0, Math.cos(a) * 1.1, 3.25 - (i % 2) * 0.2, Math.sin(a) * 1.1, 1, 0.4, 1, 6); }
      lo.cyl(0.35, 0.5, 2.4, 0xf1e6cf, 0, 1.2, 0, 5); lo.add(new THREE.ConeGeometry(1.8, 1.2, 7), cap, matrix(0, 2.9, 0));
      break;
    }
    case 'dead': {
      const wood = 0x4a3a34;
      hi.cyl(0.18, 0.32, 3.2, wood, 0, 1.6, 0, 6, { shade: 0.3 });
      for (let i = 0; i < 4; i++) hi.add(new THREE.CylinderGeometry(0.04, 0.1, 1.4, 4), wood, matrix(Math.cos(i * 1.6) * 0.4, 2.2 + i * 0.35, Math.sin(i * 1.6) * 0.4, Math.sin(i) * 0.6, i * 1.6, 0.9));
      lo.cyl(0.18, 0.3, 3.2, wood, 0, 1.6, 0, 4);
      break;
    }
    case 'willow': {
      hi.cyl(0.28, 0.45, 2.4, 0x5a4a3a, 0, 1.2, 0, 7);
      canopy(hi, 1.6, shade(leaf, 0.9), 0, 3.4, 0, 1.3, 0.7, 1.3, 1, 8);
      for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; hi.add(new THREE.BoxGeometry(0.3, 2.2, 0.05), mix(leaf, 0x9ab06a, 0.3), matrix(Math.cos(a) * 1.7, 2.3, Math.sin(a) * 1.7, 0, -a, 0)); }
      lo.cyl(0.3, 0.45, 2.4, 0x5a4a3a, 0, 1.2, 0, 4); lo.add(new THREE.ConeGeometry(2.2, 3, 7), leaf, matrix(0, 3, 0));
      break;
    }
    case 'giant': {
      hi.cyl(1.4, 2.4, 14, 0x6a4a32, 0, 7, 0, 12, { shade: 0.35 });
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; hi.add(new THREE.CylinderGeometry(0.2, 0.7, 4.2, 6), 0x5a3e2a, matrix(Math.cos(a) * 2.2, 1.0, Math.sin(a) * 2.2, Math.sin(a) * 0.8, 0, -Math.cos(a) * 0.8)); }
      canopy(hi, 5, leaf, 0, 15, 0, 1.4, 0.8, 1.4, 1, 9);
      canopy(hi, 3.5, leaf2, 4, 13, 2, 1, 0.8, 1, 1, 10);
      canopy(hi, 3.5, leaf, -4, 13.5, -2, 1, 0.8, 1, 1, 11);
      canopy(hi, 3, leaf2, 0, 18, 1, 1, 0.8, 1, 1, 12);
      lo.cyl(1.4, 2.4, 14, 0x6a4a32, 0, 7, 0, 6); lo.add(new THREE.IcosahedronGeometry(6.5, 0), leaf, matrix(0, 15, 0, 0, 0, 0, 1.2, 0.8, 1.2));
      break;
    }
    case 'acacia': {
      hi.add(new THREE.CylinderGeometry(0.16, 0.3, 3, 6), 0x6a503a, matrix(0, 1.5, 0, 0, 0, 0.15));
      hi.add(new THREE.CylinderGeometry(0.08, 0.14, 1.6, 5), 0x6a503a, matrix(0.5, 2.9, 0, 0, 0, -0.7));
      canopy(hi, 1.6, shade(leaf, 0.95), 0.4, 3.8, 0, 1.9, 0.4, 1.6, 1, 13);
      lo.cyl(0.18, 0.3, 3, 0x6a503a, 0, 1.5, 0, 4); lo.add(new THREE.CylinderGeometry(2.8, 2.2, 0.7, 7), leaf, matrix(0.4, 3.8, 0));
      break;
    }
    case 'cactus': {
      const g = 0x5f9a5a;
      hi.add(new THREE.CapsuleGeometry ? new THREE.CapsuleGeometry(0.35, 2.4, 4, 8) : new THREE.CylinderGeometry(0.35, 0.38, 3, 8), g, matrix(0, 1.5, 0), { shade: 0.3 });
      hi.add(new THREE.CylinderGeometry(0.22, 0.24, 1.2, 7), g, matrix(0.55, 1.6, 0, 0, 0, Math.PI / 2));
      hi.add(new THREE.CylinderGeometry(0.2, 0.22, 1.0, 7), g, matrix(0.95, 2.1, 0));
      hi.sphere(0.12, 0xf4a6c8, 0, 3.0, 0, 1, 1, 1, 6);
      lo.cyl(0.35, 0.38, 3, g, 0, 1.5, 0, 5);
      break;
    }
    case 'crystal': {
      const cc = pal.accent || 0x9ef0ff;
      for (let i = 0; i < 5; i++) { const a = i * 1.3; hi.add(new THREE.ConeGeometry(0.35 + (i % 2) * 0.2, 2.2 + i * 0.4, 5), mix(cc, 0xffffff, i % 2 * 0.3), matrix(Math.cos(a) * 0.5, 1.1 + i * 0.2, Math.sin(a) * 0.5, Math.sin(a) * 0.3, a, Math.cos(a) * 0.3)); }
      lo.add(new THREE.ConeGeometry(0.8, 3, 4), cc, matrix(0, 1.5, 0));
      break;
    }
    case 'bush': default: {
      canopy(hi, 0.75, shade(leaf, 0.95), 0, 0.55, 0, 1.3, 0.8, 1.1, 1, 14);
      canopy(hi, 0.55, leaf2, 0.5, 0.45, 0.3, 1, 0.8, 1, 0, 15);
      if (pal.berries) for (let i = 0; i < 5; i++) hi.sphere(0.07, pal.berries, Math.cos(i * 1.3) * 0.7, 0.6 + (i % 2) * 0.2, Math.sin(i * 1.3) * 0.6, 1, 1, 1, 5);
      lo.add(new THREE.IcosahedronGeometry(0.8, 0), leaf, matrix(0, 0.5, 0, 0, 0, 0, 1.2, 0.7, 1));
    }
  }
  return { high: hi.build(), low: lo.build() };
}

export function rockGeometry(kind, color) {
  const hi = new Builder(), lo = new Builder();
  if (kind === 'crystal') {
    for (let i = 0; i < 4; i++) hi.add(new THREE.OctahedronGeometry(0.6 + i * 0.15, 0), mix(color, 0xffffff, i * 0.15), matrix(Math.cos(i * 1.7) * 0.4, 0.6 + i * 0.1, Math.sin(i * 1.7) * 0.4, 0.2, i, 0.3, 0.7, 1.8, 0.7));
    lo.add(new THREE.OctahedronGeometry(0.9, 0), color, matrix(0, 0.8, 0, 0, 0, 0, 0.8, 1.6, 0.8));
  } else if (kind === 'flat') {
    hi.add(lumpy(new THREE.DodecahedronGeometry(1, 1), 0.12, 3), color, matrix(0, 0.15, 0, 0, 0, 0, 1.3, 0.45, 1), { shade: 0.35 });
    lo.add(new THREE.DodecahedronGeometry(1, 0), color, matrix(0, 0.15, 0, 0, 0, 0, 1.3, 0.45, 1));
  } else {
    hi.add(lumpy(new THREE.DodecahedronGeometry(0.9, 1), 0.18, 7), color, matrix(0, 0.45, 0, 0, 0, 0, 1, 0.85, 0.95), { shade: 0.35 });
    hi.add(lumpy(new THREE.DodecahedronGeometry(0.5, 0), 0.15, 9), shade(color, 1.08), matrix(0.6, 0.25, 0.4), { shade: 0.3 });
    if (kind !== 'snow') hi.add(new THREE.SphereGeometry(0.5, 6, 3, 0, Math.PI * 2, 0, 1.2), 0x6f8f4f, matrix(-0.1, 0.92, -0.05, 0, 0, 0, 1, 0.3, 1)); // moss cap
    else hi.add(new THREE.SphereGeometry(0.6, 6, 3, 0, Math.PI * 2, 0, 1.2), 0xf6fafc, matrix(-0.1, 0.92, -0.05, 0, 0, 0, 1, 0.35, 1));
    lo.add(new THREE.DodecahedronGeometry(0.9, 0), color, matrix(0, 0.45, 0, 0, 0, 0, 1, 0.85, 0.95));
  }
  return { high: hi.build(), low: lo.build() };
}

// Tall grass blade cluster (for encounter zones) and flowers.
export function tallGrassGeometry(color) {
  const b = new Builder();
  for (let i = 0; i < 7; i++) {
    const a = i / 7 * Math.PI * 2, r = 0.15 + (i % 3) * 0.12;
    const g = new THREE.ConeGeometry(0.11, 1.15 + (i % 3) * 0.25, 3, 1, true);
    b.add(g, i % 2 ? color : shade(color, 1.15), matrix(Math.cos(a) * r, 0.55, Math.sin(a) * r, Math.sin(a) * 0.2, a, Math.cos(a) * 0.2), { shade: 0.55 });
  }
  return b.build();
}
export function tuftGeometry(color) {
  const b = new Builder();
  for (let i = 0; i < 4; i++) { const a = i * 1.6; b.add(new THREE.ConeGeometry(0.06, 0.45, 3, 1, true), color, matrix(Math.cos(a) * 0.1, 0.22, Math.sin(a) * 0.1, Math.sin(a) * 0.35, a, Math.cos(a) * 0.35), { shade: 0.5 }); }
  return b.build();
}
export function flowerGeometry() {
  const b = new Builder();
  b.add(new THREE.CylinderGeometry(0.02, 0.025, 0.4, 3), 0x4d8a45, matrix(0, 0.2, 0));
  for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; b.add(new THREE.SphereGeometry(0.07, 5, 3), 0xffffff, matrix(Math.cos(a) * 0.08, 0.42, Math.sin(a) * 0.08, 0, 0, 0, 1, 0.4, 1)); }
  b.add(new THREE.SphereGeometry(0.05, 5, 3), 0xffd75a, matrix(0, 0.44, 0));
  return b.build();
}

// ---------------------------------------------------------------------------
// Chunked instancing with LOD and manual frustum culling
// ---------------------------------------------------------------------------
export class InstanceField {
  constructor({ chunk = 40, lodDistance = 45, drawDistance = 140 } = {}) {
    this.chunk = chunk; this.lodDistance = lodDistance; this.drawDistance = drawDistance;
    this.items = new Map(); // type -> list
    this.groups = []; // { center, radius, high, low }
    this.root = new THREE.Group();
    this.root.name = 'instances';
    this._frustum = new THREE.Frustum(); this._m = new THREE.Matrix4(); this._s = new THREE.Sphere();
  }
  add(type, x, y, z, s = 1, ry = 0, color = null) {
    if (!this.items.has(type)) this.items.set(type, []);
    this.items.get(type).push({ x, y, z, s, ry, color });
  }
  // geos: type -> { high, low, material, castShadow }
  build(geos) {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3(), c = new THREE.Color();
    for (const [type, list] of this.items) {
      const def = geos[type];
      if (!def) continue;
      const chunks = new Map();
      for (const it of list) {
        const k = Math.floor(it.x / this.chunk) + ':' + Math.floor(it.z / this.chunk);
        if (!chunks.has(k)) chunks.set(k, []);
        chunks.get(k).push(it);
      }
      for (const arr of chunks.values()) {
        const mk = (geo) => {
          if (!geo) return null;
          const mesh = new THREE.InstancedMesh(geo, def.material, arr.length);
          arr.forEach((it, i) => {
            e.set(0, it.ry, 0); q.setFromEuler(e); v.set(it.x, it.y, it.z); sc.set(it.s, it.s, it.s);
            m.compose(v, q, sc); mesh.setMatrixAt(i, m);
            if (def.tint !== false) { c.set(it.color ?? 0xffffff); mesh.setColorAt(i, c); }
          });
          mesh.instanceMatrix.needsUpdate = true;
          if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
          mesh.frustumCulled = false; // culled per chunk below
          mesh.castShadow = !!def.castShadow; mesh.receiveShadow = !!def.receiveShadow;
          this.root.add(mesh);
          return mesh;
        };
        let cx = 0, cz = 0, cy = 0;
        for (const it of arr) { cx += it.x; cz += it.z; cy += it.y; }
        cx /= arr.length; cz /= arr.length; cy /= arr.length;
        let radius = 0;
        for (const it of arr) radius = Math.max(radius, Math.hypot(it.x - cx, it.z - cz) + 6 * it.s + (def.extent || 0));
        this.groups.push({ center: new THREE.Vector3(cx, cy + 3, cz), radius, high: mk(def.high), low: mk(def.low ?? def.high), lod: def.low !== undefined, far: def.far ?? 1 });
      }
    }
    return this.root;
  }
  update(camera, focus) {
    this._m.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    this._frustum.setFromProjectionMatrix(this._m);
    let visible = 0;
    for (const g of this.groups) {
      this._s.set(g.center, g.radius);
      const d = Math.max(0, g.center.distanceTo(focus) - g.radius);
      const inView = d < this.drawDistance * g.far && this._frustum.intersectsSphere(this._s);
      const useHigh = d < this.lodDistance || !g.lod;
      if (g.high) g.high.visible = inView && useHigh;
      if (g.low && g.low !== g.high) g.low.visible = inView && !useHigh;
      if (inView) visible++;
    }
    return visible;
  }
  dispose() {
    for (const g of this.groups) { g.high?.dispose?.(); if (g.low !== g.high) g.low?.dispose?.(); }
  }
}

export const MATERIALS = {
  foliage: () => foliageMaterial({ sway: 1 }),
  stiff: () => foliageMaterial({ sway: 0.25 }),
  rock: () => envMaterial({ detail: true, scale: 0.8, strength: 0.4 }),
  grass: () => grassMaterial()
};
