// Prozedurale Objektgeometrie aus ObjectDef.parts (Quader/Zylinder/Ellipsoide) + gemeinsame Materialien.
// Jede Variante (Def, Farbe A, Farbe B, Zustand) wird einmal gebaut und gecacht.
// Ausgabe getrennt nach Materialgruppe: solid (Lambert, Vertexfarben), glass (durchscheinend), emissive (leuchtend, unbeleuchtet).
import * as THREE from 'three';
import type { ObjectDef, Part } from '../data/types';
import { getDef } from '../world/defs';
import { GeoBuf, col, type Raw } from './geo-builder';

/** Zustandsbits für objectRaw */
export const OF_ON = 1; // Bildschirme/Geräte eingeschaltet
export const OF_OFF = 2; // Leuchten ausgeschaltet
export const OF_BROKEN = 4;

export interface ObjRaw {
  solid: Raw;
  glass: Raw;
  emis: Raw;
  /** lokale Bounding-Box (ungedreht) */
  min: [number, number, number];
  max: [number, number, number];
  tris: number;
}

const SCREEN_FUNCS = new Set(['tv', 'computer', 'radiodesk', 'mixer', 'stereo', 'camera']);

/** Leuchten emissive Teile dieses Objekts im angegebenen Zustand? */
export function emissiveOn(def: ObjectDef, flags: number): boolean {
  if (flags & OF_BROKEN) return false;
  const screen = def.func?.some((f) => SCREEN_FUNCS.has(f)) && !def.light;
  if (screen) return (flags & OF_ON) !== 0;
  return (flags & OF_OFF) === 0;
}

const sbuf = new GeoBuf(8192);
const gbuf = new GeoBuf(1024);
const ebuf = new GeoBuf(1024);
const _m = new THREE.Matrix4();
const _e = new THREE.Euler();
const _v = new THREE.Vector3();
const _n = new THREE.Vector3();
const _nm = new THREE.Matrix3();
const _q = new THREE.Quaternion();
const _s = new THREE.Vector3(1, 1, 1);
const _tc = new THREE.Color();

function partColor(def: ObjectDef, p: Part, ca: number, cb: number): string {
  if (p.c === 'A') return def.colorsA?.[ca] ?? def.colorsA?.[0] ?? '#cfc8bc';
  if (p.c === 'B') return def.colorsB?.[cb] ?? def.colorsB?.[0] ?? def.colorsA?.[ca] ?? '#9a9288';
  return p.c;
}

/** Segmentzahl nach Größe (sparsam für Handys) */
function segsFor(r: number): number {
  return r < 0.035 ? 5 : r < 0.1 ? 7 : r < 0.3 ? 10 : r < 0.7 ? 14 : 18;
}

/** Teil in lokaler Form in den Puffer schreiben; Transformation erfolgt danach über transformRange */
function emitPart(b: GeoBuf, p: Part, low = false): void {
  const [dx, dy, dz] = p.d;
  const rx = Math.max(1e-4, dx / 2), ry = Math.max(1e-4, dy / 2), rz = Math.max(1e-4, dz / 2);
  const onFloor = !p.r && p.p[1] - ry <= 0.002;
  if (p.s === 'box') {
    b.box(-rx, -ry, -rz, rx, ry, rz, { skipBottom: onFloor });
    return;
  }
  if (p.s === 'cyl') {
    const t = p.t ?? 1;
    const n = Math.min(low ? 8 : 99, segsFor(Math.max(rx, rz) * Math.max(1, t)));
    const rTopX = rx * t, rTopZ = rz * t;
    b.reserve(n * 12);
    const avg = (rx + rz) / 2;
    const ny0 = ((1 - t) * avg) / (2 * ry);
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2;
      const c0 = Math.cos(a0), s0 = Math.sin(a0), c1 = Math.cos(a1), s1 = Math.sin(a1);
      // Seitennormalen (weich)
      let n0x = (c0 / rx) * avg, n0z = (s0 / rz) * avg, n1x = (c1 / rx) * avg, n1z = (s1 / rz) * avg;
      const l0 = Math.hypot(n0x, ny0, n0z) || 1, l1 = Math.hypot(n1x, ny0, n1z) || 1;
      n0x /= l0; n0z /= l0; n1x /= l1; n1z /= l1;
      const ny0n = ny0 / l0, ny1n = ny0 / l1;
      const r = b.r, g = b.g, bb = b.b;
      const ax = c0 * rx, az = s0 * rz, bx = c1 * rx, bz = s1 * rz;
      const tx0 = c0 * rTopX, tz0 = s0 * rTopZ, tx1 = c1 * rTopX, tz1 = s1 * rTopZ;
      // Dreiecke von außen gegen den Uhrzeigersinn: a, oben, b
      b.vtx(ax, -ry, az, n0x, ny0n, n0z, r * 0.9, g * 0.9, bb * 0.9);
      b.vtx(tx0, ry, tz0, n0x, ny0n, n0z, r, g, bb);
      b.vtx(bx, -ry, bz, n1x, ny1n, n1z, r * 0.9, g * 0.9, bb * 0.9);
      if (t > 0.001) {
        b.vtx(bx, -ry, bz, n1x, ny1n, n1z, r * 0.9, g * 0.9, bb * 0.9);
        b.vtx(tx0, ry, tz0, n0x, ny0n, n0z, r, g, bb);
        b.vtx(tx1, ry, tz1, n1x, ny1n, n1z, r, g, bb);
        // Deckel oben
        b.vtx(0, ry, 0, 0, 1, 0, r, g, bb);
        b.vtx(tx1, ry, tz1, 0, 1, 0, r, g, bb);
        b.vtx(tx0, ry, tz0, 0, 1, 0, r, g, bb);
      }
      if (!onFloor) {
        b.vtx(0, -ry, 0, 0, -1, 0, r, g, bb);
        b.vtx(ax, -ry, az, 0, -1, 0, r, g, bb);
        b.vtx(bx, -ry, bz, 0, -1, 0, r, g, bb);
      }
    }
    return;
  }
  // Ellipsoid
  const maxR = Math.max(rx, ry, rz);
  const w = low ? (maxR < 0.25 ? 6 : 8) : maxR < 0.06 ? 6 : maxR < 0.25 ? 8 : maxR < 0.6 ? 10 : 12;
  const h = low ? (maxR < 0.25 ? 4 : 5) : maxR < 0.06 ? 4 : maxR < 0.25 ? 5 : 7;
  b.reserve(w * h * 6);
  const r = b.r, g = b.g, bb = b.b;
  const pt = (i: number, j: number): [number, number, number, number, number, number] => {
    const th = (j / h) * Math.PI, ph = (i / w) * Math.PI * 2;
    const sx = Math.sin(th) * Math.cos(ph), sy = Math.cos(th), sz = Math.sin(th) * Math.sin(ph);
    let nx = sx / rx, ny = sy / ry, nz = sz / rz;
    const l = Math.hypot(nx, ny, nz) || 1;
    nx /= l; ny /= l; nz /= l;
    return [sx * rx, sy * ry, sz * rz, nx, ny, nz];
  };
  for (let j = 0; j < h; j++)
    for (let i = 0; i < w; i++) {
      const a = pt(i, j), bq = pt(i + 1, j), c = pt(i + 1, j + 1), d = pt(i, j + 1);
      const shadeTop = 0.86 + 0.14 * (1 - j / h);
      const sr = r * shadeTop, sg = g * shadeTop, sb = bb * shadeTop;
      // von außen gegen den Uhrzeigersinn: a, b, c und a, c, d
      if (j > 0) {
        b.vtx(a[0], a[1], a[2], a[3], a[4], a[5], sr, sg, sb);
        b.vtx(bq[0], bq[1], bq[2], bq[3], bq[4], bq[5], sr, sg, sb);
        b.vtx(c[0], c[1], c[2], c[3], c[4], c[5], sr, sg, sb);
      }
      if (j < h - 1) {
        b.vtx(a[0], a[1], a[2], a[3], a[4], a[5], sr, sg, sb);
        b.vtx(c[0], c[1], c[2], c[3], c[4], c[5], sr, sg, sb);
        b.vtx(d[0], d[1], d[2], d[3], d[4], d[5], sr, sg, sb);
      }
    }
}

/** Vertices [from, b.v) mit Drehung (Grad, XYZ) und Verschiebung transformieren */
function transformRange(b: GeoBuf, from: number, p: Part): void {
  const r = p.r;
  if (r && (r[0] || r[1] || r[2])) {
    _e.set((r[0] * Math.PI) / 180, (r[1] * Math.PI) / 180, (r[2] * Math.PI) / 180, 'XYZ');
    _q.setFromEuler(_e);
  } else _q.identity();
  _v.set(p.p[0], p.p[1], p.p[2]);
  _m.compose(_v, _q, _s);
  _nm.setFromMatrix4(_m);
  for (let i = from * 3; i < b.v * 3; i += 3) {
    _v.set(b.p[i]!, b.p[i + 1]!, b.p[i + 2]!).applyMatrix4(_m);
    b.p[i] = _v.x;
    b.p[i + 1] = _v.y;
    b.p[i + 2] = _v.z;
    _n.set(b.n[i]!, b.n[i + 1]!, b.n[i + 2]!).applyMatrix3(_nm);
    b.n[i] = _n.x;
    b.n[i + 1] = _n.y;
    b.n[i + 2] = _n.z;
  }
}

const cache = new Map<string, ObjRaw>();

/** Einzelnes Teil mit der aktuellen Pufferfarbe in einen Puffer schreiben (auch für Stadt-Deko verwendet) */
export function addPart(b: GeoBuf, p: Part, lowPoly = false): void {
  const from = b.v;
  emitPart(b, p, lowPoly);
  transformRange(b, from, p);
}

/** Rohgeometrie einer Objektvariante (gecacht). flags: OF_ON / OF_OFF / OF_BROKEN */
export function objectRaw(defId: string, ca = 0, cb = 0, flags = 0): ObjRaw {
  const key = `${defId}|${ca}|${cb}|${flags}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const def = getDef(defId);
  const lit = emissiveOn(def, flags);
  const broken = (flags & OF_BROKEN) !== 0;
  sbuf.clear();
  gbuf.clear();
  ebuf.clear();
  for (const p of def.parts) {
    if (!p.d.every(Number.isFinite) || !p.p.every(Number.isFinite)) continue;
    let target = sbuf;
    if (p.c === 'glass') {
      target = gbuf;
      target.colorC(col('#d6ecf5'));
    } else {
      const c = col(partColor(def, p, ca, cb));
      if (p.e && lit) {
        target = ebuf;
        _tc.copy(c);
        // dunkle Flächen mit Leuchtkraft = Bildschirme → hell bläulich
        const lum = 0.2126 * _tc.r + 0.7152 * _tc.g + 0.0722 * _tc.b;
        if (lum < 0.08) _tc.lerp(col('#a8d8ff'), 0.75);
        else _tc.lerp(col('#fff6e0'), 0.25 * p.e);
        target.colorC(_tc);
      } else if (broken) {
        _tc.copy(c).multiplyScalar(0.45).lerp(col('#4a4640'), 0.3);
        target.colorC(_tc);
      } else target.colorC(c);
    }
    const from = target.v;
    target.ao = 1;
    emitPart(target, p);
    transformRange(target, from, p);
  }
  const min: [number, number, number] = [Infinity, Infinity, Infinity];
  const max: [number, number, number] = [-Infinity, -Infinity, -Infinity];
  for (const b of [sbuf, gbuf, ebuf])
    for (let i = 0; i < b.v * 3; i += 3)
      for (let k = 0; k < 3; k++) {
        const v = b.p[i + k]!;
        if (v < min[k]!) min[k] = v;
        if (v > max[k]!) max[k] = v;
      }
  if (!Number.isFinite(min[0])) {
    min[0] = min[1] = min[2] = -0.25;
    max[0] = max[1] = max[2] = 0.25;
  }
  const out: ObjRaw = { solid: sbuf.toRaw(), glass: gbuf.toRaw(), emis: ebuf.toRaw(), min, max, tris: (sbuf.v + gbuf.v + ebuf.v) / 3 };
  cache.set(key, out);
  return out;
}

/** Höhe der Abstellfläche (Tisch/Theke) für Objekte mit mount 'surface' */
const topCache = new Map<string, number>();
export function surfaceTop(defId: string): number {
  const hit = topCache.get(defId);
  if (hit !== undefined) return hit;
  const def = getDef(defId);
  let maxA = 0;
  const reach = (p: Part): boolean => p.s !== 'sph' && !p.r && p.p[1] + p.d[1] / 2 <= 1.3; // Schirme/Aufbauten ignorieren
  for (const p of def.parts) if (reach(p)) maxA = Math.max(maxA, p.d[0] * p.d[2]);
  let top = 0;
  for (const p of def.parts) {
    if (!reach(p)) continue;
    if (p.d[0] * p.d[2] >= maxA * 0.6) top = Math.max(top, p.p[1] + p.d[1] / 2);
  }
  if (!(top > 0)) top = Math.min(def.h, 1.2);
  topCache.set(defId, top);
  return top;
}

// ---------- Materialien (gemeinsam) ----------
let mats: Record<'solid' | 'glass' | 'emissive', THREE.Material> | null = null;

/** gemeinsame Materialien; Farben/Leuchtkraft werden von der Umgebung (environment.ts) tageszeitabhängig gesetzt */
export function objectMaterial(kind: 'solid' | 'glass' | 'emissive'): THREE.Material {
  if (!mats) {
    mats = {
      solid: new THREE.MeshLambertMaterial({ vertexColors: true }),
      glass: new THREE.MeshLambertMaterial({ vertexColors: true, transparent: true, opacity: 0.42, depthWrite: false, emissive: new THREE.Color(0, 0, 0) }),
      emissive: new THREE.MeshBasicMaterial({ vertexColors: true }),
    };
    mats.solid.name = 'rl-solid';
    mats.glass.name = 'rl-glass';
    mats.emissive.name = 'rl-emissive';
  }
  return mats[kind];
}

// ---------- Geometrie für Vorschau/Thumbnails ----------
const geoCache = new Map<string, THREE.BufferGeometry>();

/** Zusammengeführte Geometrie einer Objektvariante mit Gruppen (0 = solid, 1 = glass, 2 = emissive). Gecacht – nicht disposen. */
export function objectGeometry(defId: string, ca = 0, cb = 0, flags = 0): THREE.BufferGeometry {
  const key = `${defId}|${ca}|${cb}|${flags}`;
  const hit = geoCache.get(key);
  if (hit) return hit;
  const r = objectRaw(defId, ca, cb, flags);
  const b = new GeoBuf(r.solid.v + r.glass.v + r.emis.v + 3);
  b.appendRaw(r.solid, 1, 0, 0, 0, 0);
  b.appendRaw(r.glass, 1, 0, 0, 0, 0);
  b.appendRaw(r.emis, 1, 0, 0, 0, 0);
  const g = b.toGeometry();
  if (r.solid.v) g.addGroup(0, r.solid.v, 0);
  if (r.glass.v) g.addGroup(r.solid.v, r.glass.v, 1);
  if (r.emis.v) g.addGroup(r.solid.v + r.glass.v, r.emis.v, 2);
  g.boundingBox = new THREE.Box3(new THREE.Vector3(...r.min), new THREE.Vector3(...r.max));
  geoCache.set(key, g);
  return g;
}

/** Einzelnes Mesh (Baumodus-Vorschau, CAS, Thumbnails). Geometrie/Material sind geteilt: nur aus der Szene entfernen, nicht disposen. */
export function makeObjectMesh(defId: string, ca = 0, cb = 0, flags = 0): THREE.Object3D {
  const g = objectGeometry(defId, ca, cb, flags);
  const m = new THREE.Mesh(g, [objectMaterial('solid'), objectMaterial('glass'), objectMaterial('emissive')]);
  m.castShadow = true;
  m.name = defId;
  return m;
}

/** Cache leeren (z. B. nach Qualitätswechsel; normalerweise unnötig) */
export function clearObjectCache(): void {
  cache.clear();
  for (const g of geoCache.values()) g.dispose();
  geoCache.clear();
}
