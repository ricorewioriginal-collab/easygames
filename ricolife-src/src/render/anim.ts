// Gemeinsame Helfer für prozedurale Figuren (Menschen und Haustiere):
// - GeoBuilder: setzt einfache Grundkörper zu EINER BufferGeometry mit Vertexfarben und starrer Bone-Zuordnung zusammen
// - gemeinsam genutzte Materialien (alle Figuren teilen sich ein Material → wenige Shader-Programme, keine Material-Kopien)
// - kleine Mathe-Helfer für Animationen
import * as THREE from 'three';

// ---------- Mathe ----------
export const PI = Math.PI;
export const TAU = Math.PI * 2;
export const clamp = (v: number, a: number, b: number): number => (v < a ? a : v > b ? b : v);
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
export const smooth01 = (t: number): number => {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
};
/** Sinus mit Frequenz f (Hz) und Phase ph (0..1) */
export const osc = (t: number, f: number, ph = 0): number => Math.sin((t * f + ph) * TAU);
/** 0..1-Puls (halbe Sinuswelle positiv) */
export const pulse = (t: number, f: number, ph = 0): number => Math.max(0, osc(t, f, ph));
/** deterministischer Pseudozufall 0..1 aus einer Zahl */
export const hash01 = (n: number): number => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

// ---------- Materialien (geteilt) ----------
let matNormal: THREE.MeshLambertMaterial | null = null;
let matHigh: THREE.MeshLambertMaterial | null = null;

/** Gemeinsames Figuren-Material (Vertexfarben). Nie pro Figur kopieren oder freigeben. */
export function figureMaterial(): THREE.MeshLambertMaterial {
  if (!matNormal) matNormal = new THREE.MeshLambertMaterial({ vertexColors: true });
  return matNormal;
}
/** Variante mit leichtem Leuchten für die ausgewählte Figur (Markierung) */
export function figureHighlightMaterial(): THREE.MeshLambertMaterial {
  if (!matHigh) matHigh = new THREE.MeshLambertMaterial({ vertexColors: true, emissive: new THREE.Color('#4a3c12') });
  return matHigh;
}

// ---------- Geometrie-Baukasten ----------
const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
const _s = new THREE.Vector3();
const _p = new THREE.Vector3();
const _v = new THREE.Vector3();
const _n = new THREE.Vector3();
const _nm = new THREE.Matrix3();
const _up = new THREE.Vector3(0, 1, 0);
const _c = new THREE.Color();

const unitCache = new Map<string, THREE.BufferGeometry>();
function unitSphere(ws: number, hs: number): THREE.BufferGeometry {
  const k = `s${ws}_${hs}`;
  let g = unitCache.get(k);
  if (!g) unitCache.set(k, (g = new THREE.SphereGeometry(1, ws, hs)));
  return g;
}
function unitBox(): THREE.BufferGeometry {
  let g = unitCache.get('box');
  if (!g) unitCache.set('box', (g = new THREE.BoxGeometry(1, 1, 1)));
  return g;
}

export type Col = string | THREE.Color;
export type VFn = (v: THREE.Vector3) => void;

/** Sammelt Dreiecke mit Vertexfarbe und genau einem Bone pro Vertex. */
export class GeoBuilder {
  private pos: number[] = [];
  private nor: number[] = [];
  private col: number[] = [];
  private bones: number[] = [];
  private idx: number[] = [];
  /** Dreiecke bisher */
  get tris(): number {
    return this.idx.length / 3;
  }

  /** fügt eine Geometrie mit Transformation (Mittelpunkt, Euler-Drehung, Skalierung) hinzu */
  add(g: THREE.BufferGeometry, bone: number, color: Col, px: number, py: number, pz: number, sx: number, sy: number, sz: number, rx = 0, ry = 0, rz = 0, fn?: VFn): void {
    _e.set(rx, ry, rz);
    _q.setFromEuler(_e);
    _m.compose(_p.set(px, py, pz), _q, _s.set(sx, sy, sz));
    this.addMatrix(g, bone, color, _m, fn);
  }

  addMatrix(g: THREE.BufferGeometry, bone: number, color: Col, m: THREE.Matrix4, fn?: VFn): void {
    const P = g.getAttribute('position');
    const N = g.getAttribute('normal');
    _nm.getNormalMatrix(m);
    if (typeof color === 'string') _c.set(color);
    else _c.copy(color);
    const base = this.pos.length / 3;
    for (let i = 0; i < P.count; i++) {
      _v.set(P.getX(i), P.getY(i), P.getZ(i));
      if (fn) fn(_v);
      _v.applyMatrix4(m);
      _n.set(N.getX(i), N.getY(i), N.getZ(i)).applyMatrix3(_nm).normalize();
      this.pos.push(_v.x, _v.y, _v.z);
      this.nor.push(_n.x, _n.y, _n.z);
      this.col.push(_c.r, _c.g, _c.b);
      this.bones.push(bone);
    }
    const I = g.getIndex();
    if (I) for (let i = 0; i < I.count; i++) this.idx.push(base + I.getX(i));
    else for (let i = 0; i < P.count; i++) this.idx.push(base + i);
  }

  /** Quader (Breite, Höhe, Tiefe) mit Mittelpunkt */
  box(bone: number, c: Col, w: number, h: number, d: number, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0): void {
    this.add(unitBox(), bone, c, x, y, z, w, h, d, rx, ry, rz);
  }

  /** Ellipsoid mit Radien */
  sph(bone: number, c: Col, rx: number, ry: number, rz: number, x: number, y: number, z: number, ws = 8, hs = 6, ex = 0, ey = 0, ez = 0, fn?: VFn): void {
    this.add(unitSphere(ws, hs), bone, c, x, y, z, rx, ry, rz, ex, ey, ez, fn);
  }

  /** Teil-Kugel (Kappe oben bis Winkel thetaLen), gekippt um rx */
  cap(bone: number, c: Col, rx: number, ry: number, rz: number, x: number, y: number, z: number, thetaLen: number, tilt: number, ws = 10, hs = 5, phiStart = 0, phiLen = TAU): void {
    const g = new THREE.SphereGeometry(1, ws, hs, phiStart, phiLen, 0, thetaLen);
    // Kippen vor dem Skalieren, damit die Haarlinie vorne höher liegt
    _e.set(tilt, 0, 0);
    _q.setFromEuler(_e);
    const pre = new THREE.Matrix4().makeRotationFromQuaternion(_q);
    _m.compose(_p.set(x, y, z), _q.identity(), _s.set(rx, ry, rz)).multiply(pre);
    this.addMatrix(g, bone, c, _m);
    g.dispose();
  }

  /** Zylinder/Kegelstumpf, mittig, entlang lokaler y-Achse; dz = Tiefenfaktor (elliptischer Querschnitt) */
  cyl(bone: number, c: Col, rTop: number, rBot: number, h: number, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0, seg = 7, dz = 1, open = false, thetaStart = 0, thetaLen = TAU): void {
    const g = new THREE.CylinderGeometry(rTop, rBot, h, seg, 1, open, thetaStart, thetaLen);
    this.add(g, bone, c, x, y, z, 1, 1, dz, rx, ry, rz);
    g.dispose();
  }

  /** Glied zwischen zwei Punkten (Radius oben r0 am Punkt a, unten r1 am Punkt b) */
  limb(bone: number, c: Col, r0: number, r1: number, ax: number, ay: number, az: number, bx: number, by: number, bz: number, seg = 7): void {
    const g = new THREE.CylinderGeometry(r0, r1, 1, seg, 1, false);
    _v.set(ax - bx, ay - by, az - bz);
    const len = _v.length() || 0.001;
    _v.divideScalar(len);
    _q.setFromUnitVectors(_up, _v);
    _m.compose(_p.set((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2), _q, _s.set(1, len, 1));
    this.addMatrix(g, bone, c, _m);
    g.dispose();
  }

  /** Torus (Ring) in der lokalen xy-Ebene, z. B. Brille/Kette; sx/sy = Verzerrung des Rings (Verhältnis ~1) */
  ring(bone: number, c: Col, r: number, tube: number, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, seg = 10): void {
    const g = new THREE.TorusGeometry(r, tube, 3, seg);
    this.add(g, bone, c, x, y, z, sx, sy, 1, rx, ry, rz);
    g.dispose();
  }

  build(skinned: boolean): THREE.BufferGeometry {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.nor, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.col, 3));
    if (skinned) {
      const n = this.bones.length;
      const si = new Uint16Array(n * 4);
      const sw = new Float32Array(n * 4);
      for (let i = 0; i < n; i++) {
        si[i * 4] = this.bones[i]!;
        sw[i * 4] = 1;
      }
      g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(si, 4));
      g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(sw, 4));
    }
    const vc = this.pos.length / 3;
    g.setIndex(vc > 65535 ? new THREE.Uint32BufferAttribute(this.idx, 1) : new THREE.Uint16BufferAttribute(this.idx, 1));
    return g;
  }
}

// ---------- Farb-Helfer ----------
const _c1 = new THREE.Color();
const _c2 = new THREE.Color();
/** mischt zwei Hex-Farben (t = Anteil b) */
export function mix(a: string, b: string, t: number): THREE.Color {
  _c1.set(a);
  _c2.set(b);
  return new THREE.Color().copy(_c1).lerp(_c2, t);
}
/** dunkler (f < 1) oder heller (f > 1) */
export function shade(a: string, f: number): THREE.Color {
  const c = new THREE.Color(a);
  if (f < 1) return c.multiplyScalar(f);
  return c.lerp(_c2.set('#ffffff'), Math.min(1, f - 1));
}

// ---------- Skelett-Helfer ----------
/** legt Bones mit absoluten Bind-Positionen an (Elternindex p < eigener Index, -1 = Wurzel) */
export function makeBones(defs: readonly { p: number; x: number; y: number; z: number }[]): THREE.Bone[] {
  const bones: THREE.Bone[] = [];
  for (const d of defs) {
    const b = new THREE.Bone();
    if (d.p >= 0) {
      const pd = defs[d.p]!;
      b.position.set(d.x - pd.x, d.y - pd.y, d.z - pd.z);
      bones[d.p]!.add(b);
    } else b.position.set(d.x, d.y, d.z);
    bones.push(b);
  }
  return bones;
}

/** SkinnedMesh mit großzügiger fester Hüllkugel (spart Neuberechnung, deckt Liegen/Krabbeln ab) */
export function makeSkinned(geo: THREE.BufferGeometry, bones: THREE.Bone[], cy: number, radius: number): { mesh: THREE.SkinnedMesh; skeleton: THREE.Skeleton } {
  const mesh = new THREE.SkinnedMesh(geo, figureMaterial());
  mesh.add(bones[0]!);
  mesh.updateMatrixWorld(true);
  const skeleton = new THREE.Skeleton(bones);
  mesh.bind(skeleton);
  mesh.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, cy, 0), radius);
  mesh.boundingBox = new THREE.Box3(new THREE.Vector3(-radius, cy - radius, -radius), new THREE.Vector3(radius, cy + radius, radius));
  mesh.castShadow = true;
  return { mesh, skeleton };
}
