/* Instanzierte Vegetation: Bäume, Büsche, Gras, Blumen, Steine. Eine Geometrie je Art, viele Instanzen, Wind im Shader. */
import { GeoBuilder } from '../engine/geo.ts';
import { mats } from '../engine/materials.ts';
import { makeRng } from '../core/rng.ts';

export type TreeKind = 'laub' | 'tanne' | 'palme' | 'busch' | 'pilz' | 'kirsch' | 'dunkel' | 'kristall' | 'mond' | 'herbst' | 'schnee' | 'koralle' | 'pixel' | 'bunt';

const geoCache = new Map<string, THREE.BufferGeometry>();
function treeGeo(kind: TreeKind): THREE.BufferGeometry {
  const c = geoCache.get(kind);
  if (c) return c;
  const b = new GeoBuilder();
  const trunk = 0x8a5a33, trunkD = 0x6e4526;
  switch (kind) {
    case 'laub': case 'herbst': case 'kirsch': case 'bunt': case 'dunkel': {
      const leaf = kind === 'laub' ? [0x4fbf4a, 0x6fd65a, 0x3fae46] : kind === 'herbst' ? [0xf2a33a, 0xe8712f, 0xf6c445] : kind === 'kirsch' ? [0xffb3d1, 0xff92bf, 0xffd1e3] : kind === 'bunt' ? [0xff7fd1, 0x8fd3ff, 0xfff07a] : [0x2f5d3a, 0x24493a, 0x3b6b46];
      b.cyl(0, 0, 0, 0.22, 0.34, 2.6, kind === 'dunkel' ? 0x4a3526 : trunk, 7);
      b.sph(0, 3.4, 0, 1.7, leaf[0], { sy: 0.9, detail: 1 });
      b.sph(0.9, 3.0, 0.3, 1.1, leaf[1], { detail: 1 });
      b.sph(-0.8, 3.1, -0.4, 1.15, leaf[2], { detail: 1 });
      b.sph(0.1, 4.4, -0.1, 1.0, leaf[1], { detail: 1 });
      break;
    }
    case 'tanne': case 'schnee': {
      b.cyl(0, 0, 0, 0.18, 0.28, 1.4, trunkD, 6);
      const g = kind === 'schnee' ? [0x3f7f5a, 0xf4fbff] : [0x2f8a4f, 0x3fa35c];
      b.cone(0, 1.0, 0, 1.9, 2.4, g[0], 8); b.cone(0, 2.4, 0, 1.5, 2.1, g[1] === 0xf4fbff ? 0x4a8f66 : g[1], 8); b.cone(0, 3.6, 0, 1.0, 1.8, g[0], 8);
      if (kind === 'schnee') { b.cone(0, 4.5, 0, 0.55, 0.9, 0xf4fbff, 8); b.cone(0, 2.95, 0, 1.25, 0.5, 0xf4fbff, 8); }
      break;
    }
    case 'palme': {
      for (let i = 0; i < 6; i++) b.cyl(i * 0.08, i * 0.75, 0, 0.17, 0.2, 0.8, i % 2 ? 0xb0874f : 0x9a7442, 7, { rz: -0.05 });
      for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; b.box(Math.sin(a) * 1.1 + 0.48, 4.55, Math.cos(a) * 1.1, 0.5, 0.08, 2.4, 0x3fbf5a, { ry: a, rx: 0.35 }); }
      b.sph(0.48, 4.5, 0, 0.3, 0x7a5a2a);
      break;
    }
    case 'busch': {
      b.sph(0, 0.55, 0, 0.8, 0x4cbf55, { sy: 0.8 }); b.sph(0.5, 0.45, 0.2, 0.55, 0x5fd06a); b.sph(-0.45, 0.45, -0.1, 0.55, 0x43ad4e);
      b.sph(0.2, 0.95, 0.45, 0.12, 0xff6fb5); b.sph(-0.35, 0.8, 0.5, 0.11, 0xfff07a); b.sph(0.45, 0.75, -0.4, 0.11, 0xffffff);
      break;
    }
    case 'pilz': {
      b.cyl(0, 0, 0, 0.35, 0.5, 2.2, 0xf4e6c8, 10); b.sph(0, 2.4, 0, 1.6, 0xe8453c, { sy: 0.55 });
      for (const [x, z] of [[0.6, 0.5], [-0.7, 0.2], [0.1, -0.8], [0.9, -0.3]]) b.sph(x, 2.95, z, 0.22, 0xffffff);
      break;
    }
    case 'kristall': {
      b.cone(0, 0, 0, 0.6, 3.2, 0x8fe7ff, 5); b.cone(0.6, 0, 0.3, 0.35, 2.0, 0xc79bff, 5, { rz: -0.3 }); b.cone(-0.5, 0, -0.2, 0.4, 2.3, 0x7fd8ff, 5, { rz: 0.3 });
      break;
    }
    case 'mond': {
      b.cyl(0, 0, 0, 0.2, 0.3, 2.8, 0xbcc6e6, 7); b.sph(0, 3.4, 0, 1.5, 0x9fb3ff, { sy: 0.85 }); b.sph(0.7, 3.0, 0.4, 0.9, 0xc5d1ff); b.sph(-0.6, 3.8, 0, 0.8, 0xe0e8ff);
      break;
    }
    case 'koralle': {
      for (let i = 0; i < 5; i++) { const a = i * 1.3; b.cyl(Math.sin(a) * 0.4, 0, Math.cos(a) * 0.4, 0.12, 0.2, 1.4 + (i % 3) * 0.6, [0xff6f91, 0xffa94d, 0xb36bff][i % 3], 6, { rx: Math.cos(a) * 0.3, rz: Math.sin(a) * 0.3 }); }
      break;
    }
    case 'pixel': {
      b.box(0, 0, 0, 0.5, 2.5, 0.5, 0x8a5a33); b.box(0, 2.3, 0, 2.4, 1.6, 2.4, 0x4cbf55); b.box(0, 3.8, 0, 1.6, 1.0, 1.6, 0x5fd06a);
      break;
    }
  }
  const g = b.build();
  geoCache.set(kind, g);
  return g;
}

const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _e = new THREE.Euler(), _col = new THREE.Color();

/** Sammelt Instanzen einer Welt und erzeugt am Ende je Art ein InstancedMesh. */
export class Scatter {
  private items = new Map<string, { x: number; y: number; z: number; s: number; r: number; tint: number }[]>();
  add(kind: TreeKind, x: number, y: number, z: number, s = 1, r = 0, tint = 1): void {
    let a = this.items.get(kind);
    if (!a) { a = []; this.items.set(kind, a); }
    a.push({ x, y, z, s, r, tint });
  }
  get count(): number { let n = 0; for (const a of this.items.values()) n += a.length; return n; }
  build(shadows: boolean): THREE.Object3D[] {
    const out: THREE.Object3D[] = [];
    for (const [kind, arr] of this.items) {
      if (!arr.length) continue;
      const mat = kind === 'kristall' ? mats().shiny : mats().foliage;
      const im = new THREE.InstancedMesh(treeGeo(kind as TreeKind), mat, arr.length);
      arr.forEach((t, i) => {
        _e.set(0, t.r, 0); _q.setFromEuler(_e);
        _m.compose(_p.set(t.x, t.y - 0.05, t.z), _q, _s.set(t.s, t.s * (0.9 + (i % 5) * 0.05), t.s));
        im.setMatrixAt(i, _m);
        if (t.tint !== 1) { _col.setScalar(t.tint); im.setColorAt(i, _col); } else { _col.setScalar(1); im.setColorAt(i, _col); }
      });
      im.castShadow = shadows; im.receiveShadow = true;
      im.frustumCulled = false;
      out.push(im);
    }
    return out;
  }
}

/* ---------- Gras & Blumen (sehr kleine Geometrie, viele Instanzen) ---------- */
let grassGeo: THREE.BufferGeometry | null = null;
function getGrass(): THREE.BufferGeometry {
  if (grassGeo) return grassGeo;
  const b = new GeoBuilder();
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    b.cone(Math.cos(a) * 0.12, 0, Math.sin(a) * 0.12, 0.05, 0.42 + (i % 2) * 0.16, i % 2 ? 0x5fcf55 : 0x49b84a, 3, { rx: Math.sin(a) * 0.3, rz: Math.cos(a) * 0.3 });
  }
  grassGeo = b.build();
  return grassGeo;
}
const flowerGeos = new Map<number, THREE.BufferGeometry>();
function getFlower(color: number): THREE.BufferGeometry {
  let g = flowerGeos.get(color);
  if (g) return g;
  const b = new GeoBuilder();
  b.cyl(0, 0, 0, 0.025, 0.025, 0.35, 0x3fa34a, 4);
  for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; b.sph(Math.cos(a) * 0.09, 0.38, Math.sin(a) * 0.09, 0.07, color, { detail: 0, sy: 0.5 }); }
  b.sph(0, 0.4, 0, 0.05, 0xffe14a, { detail: 0 });
  g = b.build();
  flowerGeos.set(color, g);
  return g;
}

export function buildGroundCover(points: { x: number; y: number; z: number }[], flowers: { x: number; y: number; z: number; c: number }[]): THREE.Object3D[] {
  const out: THREE.Object3D[] = [];
  const rng = makeRng(points.length + 7);
  if (points.length) {
    const im = new THREE.InstancedMesh(getGrass(), mats().grass, points.length);
    points.forEach((p, i) => {
      _e.set(0, rng() * 6.28, 0); _q.setFromEuler(_e);
      const s = 0.8 + rng() * 0.7;
      im.setMatrixAt(i, _m.compose(_p.set(p.x, p.y - 0.03, p.z), _q, _s.set(s, s, s)));
    });
    im.frustumCulled = false; im.receiveShadow = true;
    out.push(im);
  }
  const byColor = new Map<number, typeof flowers>();
  for (const f of flowers) { let a = byColor.get(f.c); if (!a) { a = []; byColor.set(f.c, a); } a.push(f); }
  for (const [c, arr] of byColor) {
    const im = new THREE.InstancedMesh(getFlower(c), mats().grass, arr.length);
    arr.forEach((p, i) => {
      _e.set(0, rng() * 6.28, 0); _q.setFromEuler(_e);
      const s = 0.8 + rng() * 0.6;
      im.setMatrixAt(i, _m.compose(_p.set(p.x, p.y - 0.02, p.z), _q, _s.set(s, s, s)));
    });
    im.frustumCulled = false;
    out.push(im);
  }
  return out;
}
