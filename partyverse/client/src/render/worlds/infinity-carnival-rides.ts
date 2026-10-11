import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { glow, toon } from '../materials';

/** Bausteine der INFINITY-CARNIVAL-Dekoration: Riesenrad, Karussell, Zirkuszelte, Achterbahn */
export interface Part {
  group: THREE.Group;
  update(dt: number, t: number): void;
  /** Aufhängepunkt (Weltkoordinaten) für Lichterketten */
  anchor?: THREE.Vector3;
  /** Alle InstancedMeshes (für dispose) */
  instanced?: THREE.InstancedMesh[];
}

export const PALETTE = [0xff4a6a, 0xffd04a, 0x4ae0ff, 0x7be86a, 0xb77bff, 0xff9a3a, 0xff7be0];

const Y_AXIS = new THREE.Vector3(0, 1, 0);
const _a = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _m = new THREE.Matrix4();
const _s = new THREE.Vector3();
const _c = new THREE.Color();
const ZERO = new THREE.Vector3();

/** Material mit Vertexfarben (eigene Kopie, wird beim Aufräumen freigegeben) */
export function vertexToon(): THREE.MeshToonMaterial {
  const m = toon(0xffffff).clone();
  m.userData = {};
  m.vertexColors = true;
  return m;
}

/** Färbt eine Geometrie pro Dreieck/Höhe ein (macht sie nicht-indiziert). */
export function paint(g: THREE.BufferGeometry, fn: (tri: number, y: number) => number): THREE.BufferGeometry {
  let ng = g;
  if (g.index) {
    ng = g.toNonIndexed();
    g.dispose();
  }
  const pos = ng.getAttribute('position');
  const col = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    _c.setHex(fn(Math.floor(i / 3), pos.getY(i)));
    col[i * 3] = _c.r;
    col[i * 3 + 1] = _c.g;
    col[i * 3 + 2] = _c.b;
  }
  ng.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return ng;
}

/** Zylinder zwischen zwei Punkten */
export function strut(a: THREE.Vector3, b: THREE.Vector3, r: number, hex: number): THREE.BufferGeometry {
  const g = new THREE.CylinderGeometry(1, 1, 1, 6, 1);
  const d = new THREE.Vector3().subVectors(b, a);
  const len = d.length();
  _q.setFromUnitVectors(Y_AXIS, d.normalize());
  _m.compose(new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5), _q, _s.set(r, len, r));
  g.applyMatrix4(_m);
  return paint(g, () => hex);
}

/** Einfarbige, nicht-indizierte Geometrie mit Vertexfarbe, optional verschoben */
export function solid(g: THREE.BufferGeometry, hex: number, x = 0, y = 0, z = 0): THREE.BufferGeometry {
  g.translate(x, y, z);
  return paint(g, () => hex);
}

/** Gestreifter, oben offener Kegel/Zylinder (Segment-Streifen) */
export function striped(g: THREE.BufferGeometry, a: number, b: number, x = 0, y = 0, z = 0): THREE.BufferGeometry {
  g.translate(x, y, z);
  return paint(g, (tri) => (((tri >> 1) & 1) === 0 ? a : b));
}

const v3 = (x: number, y: number, z: number): THREE.Vector3 => new THREE.Vector3(x, y, z);

/** Dreht eine Gruppe so, dass ihre lokale +Z-Achse zum Punkt (tx, tz) zeigt */
export function faceTowards(g: THREE.Object3D, tx: number, tz: number): void {
  g.rotation.y = Math.atan2(tx - g.position.x, tz - g.position.z);
}

// ---------------------------------------------------------------- Riesenrad

export function createFerris(s: number, x: number, y: number, z: number, tx: number, tz: number): Part {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  faceTowards(group, tx, tz);
  const R = 6.5 * s;
  const H = 8.2 * s; // Achshöhe über dem Boden
  const zz = 0.7 * s;

  // Rad: Felgen, Speichen, Nabe
  const parts: THREE.BufferGeometry[] = [];
  for (const side of [-1, 1]) {
    const rim = new THREE.TorusGeometry(R, 0.22 * s, 6, 44);
    parts.push(solid(rim, 0xfff0d0, 0, 0, side * zz));
    const inner = new THREE.TorusGeometry(R * 0.55, 0.14 * s, 6, 30);
    parts.push(solid(inner, 0xff4a6a, 0, 0, side * zz));
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      parts.push(strut(v3(0, 0, side * zz), v3(Math.cos(a) * R, Math.sin(a) * R, side * zz), 0.08 * s, i % 2 ? 0xfff0d0 : 0xffd04a));
    }
  }
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    parts.push(strut(v3(Math.cos(a) * R, Math.sin(a) * R, -zz), v3(Math.cos(a) * R, Math.sin(a) * R, zz), 0.1 * s, 0xff9a3a));
  }
  parts.push(solid(new THREE.SphereGeometry(1.0 * s, 12, 8), 0xff4a6a, 0, 0, 0));
  const wheelGeo = mergeGeometries(parts, false)!;
  for (const p of parts) p.dispose();
  const vc = vertexToon();
  const wheel = new THREE.Mesh(wheelGeo, vc);
  wheel.frustumCulled = false;

  // Glühbirnen an den Felgen (blinken im Laufschritt)
  const BULBS = 32;
  const bulbs = new THREE.InstancedMesh(new THREE.SphereGeometry(0.2 * s, 6, 4), glow(0xffffff), BULBS);
  const bulbCol = new Float32Array(BULBS * 3);
  for (let i = 0; i < BULBS; i++) {
    const side = i < BULBS / 2 ? -1 : 1;
    const k = i % (BULBS / 2);
    const a = (k / (BULBS / 2)) * Math.PI * 2;
    _m.makeTranslation(Math.cos(a) * R, Math.sin(a) * R, side * (zz + 0.25 * s));
    bulbs.setMatrixAt(i, _m);
    _c.setHex(PALETTE[k % PALETTE.length]!);
    bulbCol[i * 3] = _c.r;
    bulbCol[i * 3 + 1] = _c.g;
    bulbCol[i * 3 + 2] = _c.b;
    bulbs.setColorAt(i, _c);
  }
  bulbs.frustumCulled = false;
  wheel.add(bulbs);
  const axle = new THREE.Group();
  axle.position.y = H;
  axle.add(wheel);

  // Gestell
  const legs: THREE.BufferGeometry[] = [];
  for (const side of [-1, 1]) {
    for (const lx of [-1, 1]) {
      legs.push(strut(v3(0, H, side * 1.3 * s), v3(lx * 4.4 * s, 0, side * 2.0 * s), 0.28 * s, 0xff4a6a));
    }
  }
  legs.push(strut(v3(0, H, -1.5 * s), v3(0, H, 1.5 * s), 0.22 * s, 0xffd04a));
  legs.push(strut(v3(-4.4 * s, 0.1 * s, 2.0 * s), v3(4.4 * s, 0.1 * s, 2.0 * s), 0.2 * s, 0xffd04a));
  legs.push(strut(v3(-4.4 * s, 0.1 * s, -2.0 * s), v3(4.4 * s, 0.1 * s, -2.0 * s), 0.2 * s, 0xffd04a));
  const legGeo = mergeGeometries(legs, false)!;
  for (const p of legs) p.dispose();
  const stand = new THREE.Mesh(legGeo, vc);

  // Gondeln
  const N = 12;
  const gondolas = new THREE.InstancedMesh(new THREE.BoxGeometry(1.5 * s, 1.1 * s, 0.95 * s), toon(0xffffff), N);
  for (let i = 0; i < N; i++) gondolas.setColorAt(i, _c.setHex(PALETTE[i % PALETTE.length]!));
  gondolas.frustumCulled = false;
  axle.add(gondolas);
  group.add(stand, axle);

  let step = -1;
  const anchor = new THREE.Vector3(x, y + H + R + 1.2 * s, z);
  return {
    group,
    anchor,
    instanced: [bulbs, gondolas],
    update(_dt, t) {
      const ang = t * 0.11;
      wheel.rotation.z = -ang;
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2 - ang;
        _a.set(Math.cos(a) * R, Math.sin(a) * R - 0.85 * s, 0);
        _m.makeTranslation(_a.x, _a.y, _a.z);
        gondolas.setMatrixAt(i, _m);
      }
      gondolas.instanceMatrix.needsUpdate = true;
      const st = Math.floor(t * 4);
      if (st !== step && bulbs.instanceColor) {
        step = st;
        for (let i = 0; i < BULBS; i++) {
          const on = (i + st) % 3 === 0 ? 1 : 0.25;
          bulbs.setColorAt(i, _c.setRGB(bulbCol[i * 3]! * on, bulbCol[i * 3 + 1]! * on, bulbCol[i * 3 + 2]! * on));
        }
        bulbs.instanceColor.needsUpdate = true;
      }
    },
  };
}

// ---------------------------------------------------------------- Karussell

export function createCarousel(s: number, x: number, y: number, z: number, dir: number, colors: [number, number]): Part {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  const parts: THREE.BufferGeometry[] = [];
  parts.push(solid(new THREE.CylinderGeometry(3.7 * s, 3.9 * s, 0.55 * s, 16), 0xff7be0, 0, 0.28 * s, 0));
  parts.push(solid(new THREE.CylinderGeometry(0.4 * s, 0.4 * s, 3.4 * s, 8), 0xffd04a, 0, 2.2 * s, 0));
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const px = Math.cos(a) * 3.0 * s;
    const pz = Math.sin(a) * 3.0 * s;
    parts.push(strut(v3(px, 0.5 * s, pz), v3(px, 3.7 * s, pz), 0.1 * s, 0xffd04a));
    const horse = new THREE.SphereGeometry(0.55 * s, 8, 6);
    horse.scale(0.8, 1, 1.35);
    parts.push(solid(horse, PALETTE[i % PALETTE.length]!, px, 1.5 * s + (i % 2) * 0.25 * s, pz));
  }
  parts.push(solid(new THREE.TorusGeometry(4.3 * s, 0.17 * s, 6, 28).rotateX(Math.PI / 2), 0xffd04a, 0, 3.7 * s, 0));
  parts.push(striped(new THREE.ConeGeometry(4.4 * s, 2.3 * s, 16, 1, true), colors[0], colors[1], 0, 4.85 * s, 0));
  parts.push(solid(new THREE.SphereGeometry(0.45 * s, 8, 6), 0xffd04a, 0, 6.2 * s, 0));
  const geo = mergeGeometries(parts, false)!;
  for (const p of parts) p.dispose();
  const mesh = new THREE.Mesh(geo, vertexToon());
  group.add(mesh);
  return {
    group,
    anchor: new THREE.Vector3(x, y + 6.4 * s, z),
    update(dt) {
      mesh.rotation.y += dt * 0.4 * dir;
    },
  };
}

// ---------------------------------------------------------------- Zirkuszelte

export interface TentSpot {
  x: number;
  y: number;
  z: number;
  scale: number;
  yaw: number;
}

export function createTents(s: number, spots: TentSpot[], a: number, b: number): Part {
  const group = new THREE.Group();
  const parts: THREE.BufferGeometry[] = [];
  parts.push(striped(new THREE.CylinderGeometry(3, 3.1, 2.4, 12, 1, true), a, b, 0, 1.2, 0));
  parts.push(striped(new THREE.ConeGeometry(3.7, 2.9, 12, 1, true), b, a, 0, 3.85, 0));
  parts.push(solid(new THREE.TorusGeometry(3.05, 0.14, 5, 24).rotateX(Math.PI / 2), 0xffd04a, 0, 2.4, 0));
  parts.push(strut(v3(0, 5.2, 0), v3(0, 6.9, 0), 0.07, 0xfff0d0));
  parts.push(solid(new THREE.ConeGeometry(0.55, 0.9, 3).rotateZ(-Math.PI / 2), 0xff4a6a, 0.5, 6.5, 0));
  parts.push(solid(new THREE.SphereGeometry(0.22, 8, 6), 0xffd04a, 0, 5.2, 0));
  parts.push(solid(new THREE.BoxGeometry(1.3, 1.7, 0.3), 0x2a1a4a, 0, 0.85, 2.95));
  const geo = mergeGeometries(parts, false)!;
  for (const p of parts) p.dispose();
  const mesh = new THREE.InstancedMesh(geo, vertexToon(), spots.length);
  spots.forEach((sp, i) => {
    _q.setFromAxisAngle(Y_AXIS, sp.yaw);
    _m.compose(_a.set(sp.x, sp.y, sp.z), _q, _s.setScalar(sp.scale * s));
    mesh.setMatrixAt(i, _m);
  });
  mesh.frustumCulled = false;
  group.add(mesh);
  return { group, update() {}, instanced: [mesh] };
}

// ---------------------------------------------------------------- Achterbahn (Lemniskate)

export function createCoaster(s: number, x: number, y: number, z: number, tx: number, tz: number, quality: number): Part {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  faceTowards(group, tx, tz);
  const A = 15 * s;
  const B = 21 * s;
  const lift = 9.5 * s;
  const pts: THREE.Vector3[] = [];
  const N = 96;
  for (let i = 0; i < N; i++) {
    const t = (i / N) * Math.PI * 2;
    const den = 1 + Math.sin(t) ** 2;
    pts.push(new THREE.Vector3((A * Math.cos(t)) / den, lift + (B * Math.sin(t) * Math.cos(t)) / den + 1.3 * s * Math.sin(3 * t), 1.7 * s * Math.sin(t)));
  }
  const curve = new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0.5);
  curve.arcLengthDivisions = 400;
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, Math.round(120 + 100 * quality), 0.3 * s, 6, true), toon(0xff4a6a));
  tube.frustumCulled = false;

  // Schwellen
  const TIES = Math.round(40 + 40 * quality);
  const ties = new THREE.InstancedMesh(new THREE.BoxGeometry(1.5 * s, 0.1 * s, 0.22 * s), toon(0xffe08a), TIES);
  const tan = new THREE.Vector3();
  const p = new THREE.Vector3();
  for (let i = 0; i < TIES; i++) {
    const u = i / TIES;
    curve.getPointAt(u, p);
    curve.getTangentAt(u, tan);
    _m.lookAt(tan, ZERO, Y_AXIS);
    // Breite (lokal x) quer zur Fahrtrichtung: Box um 90 Grad um Y drehen, damit z entlang der Bahn liegt
    _q.setFromRotationMatrix(_m);
    _m.compose(p, _q, _s.set(1, 1, 1));
    ties.setMatrixAt(i, _m);
  }
  ties.frustumCulled = false;

  // Stützen
  const sup: THREE.BufferGeometry[] = [];
  for (let i = 0; i < N; i += 4) {
    const q = pts[i]!;
    sup.push(strut(v3(q.x, 0.2 * s, q.z), v3(q.x, q.y - 0.3 * s, q.z), 0.14 * s, i % 8 === 0 ? 0xfff0d0 : 0xffd04a));
  }
  const supMesh = new THREE.Mesh(mergeGeometries(sup, false)!, vertexToon());
  for (const g of sup) g.dispose();
  supMesh.frustumCulled = false;

  // Wagenzug
  const CARTS = 7;
  const carts = new THREE.InstancedMesh(new THREE.BoxGeometry(1.2 * s, 0.8 * s, 1.7 * s), toon(0xffffff), CARTS);
  for (let i = 0; i < CARTS; i++) carts.setColorAt(i, _c.setHex(i === 0 ? 0xffd04a : PALETTE[(i + 2) % PALETTE.length]!));
  carts.frustumCulled = false;
  group.add(tube, ties, supMesh, carts);

  return {
    group,
    instanced: [ties, carts],
    update(_dt, t) {
      for (let i = 0; i < CARTS; i++) {
        let u = (t * 0.028 - i * 0.012) % 1;
        if (u < 0) u += 1;
        curve.getPointAt(u, p);
        curve.getTangentAt(u, tan);
        _m.lookAt(tan, ZERO, Y_AXIS);
        _q.setFromRotationMatrix(_m);
        p.y += 0.6 * s;
        _m.compose(p, _q, _s.set(1, 1, 1));
        carts.setMatrixAt(i, _m);
      }
      carts.instanceMatrix.needsUpdate = true;
    },
  };
}

/** Schwebende Plattformen unter den Bauwerken (2 Draw Calls) */
export interface PlatformSpot {
  x: number;
  y: number;
  z: number;
  r: number;
}
export function createPlatforms(spots: PlatformSpot[], top: number, body: number): Part {
  const group = new THREE.Group();
  const n = Math.max(1, spots.length);
  const discs = new THREE.InstancedMesh(new THREE.CylinderGeometry(1, 1, 0.5, 20, 1), toon(top), n);
  const tips = new THREE.InstancedMesh(new THREE.ConeGeometry(1, 1, 14), toon(body), n);
  spots.forEach((sp, i) => {
    _m.compose(_a.set(sp.x, sp.y - 0.25, sp.z), _q.identity(), _s.set(sp.r, 1, sp.r));
    discs.setMatrixAt(i, _m);
    _q.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI);
    _m.compose(_a.set(sp.x, sp.y - 0.5 - sp.r * 0.45, sp.z), _q, _s.set(sp.r * 0.97, sp.r * 0.9, sp.r * 0.97));
    tips.setMatrixAt(i, _m);
  });
  discs.count = tips.count = spots.length;
  discs.frustumCulled = tips.frustumCulled = false;
  group.add(discs, tips);
  return { group, update() {}, instanced: [discs, tips] };
}
