import * as THREE from 'three';
import { glow } from '../materials';
import type { DecorContext } from './common';

/** 4D-inspirierte Elemente der Welt PRISMARA: Tesserakt-Drahtgitter und Portalringe (Koordinaten relativ zum Brett-Mittelpunkt). */
export interface Part {
  objects: THREE.Object3D[];
  update(dt: number, t: number): void;
}

export const PALETTE = [0xff7bd8, 0x7be8ff, 0xffe27b, 0xa89bff, 0x7bffc4, 0xffa07b];

const UP = new THREE.Vector3(0, 1, 0);
const Z = new THREE.Vector3(0, 0, 1);
const tmpM = new THREE.Matrix4();
const tmpQ = new THREE.Quaternion();
const tmpQ2 = new THREE.Quaternion();
const tmpS = new THREE.Vector3();
const tmpP = new THREE.Vector3();
const tmpD = new THREE.Vector3();
const tmpC = new THREE.Color();

const EDGES: { a: number; b: number; type: 0 | 1 | 2 }[] = [];
for (let a = 0; a < 16; a++) {
  for (let bit = 0; bit < 4; bit++) {
    const b = a ^ (1 << bit);
    if (b > a) EDGES.push({ a, b, type: bit === 3 ? 2 : (a & 8) !== 0 ? 1 : 0 });
  }
}
const proj = new Float32Array(16 * 4);

interface Tess {
  x: number;
  y: number;
  z: number;
  size: number;
  speed: number;
  phase: number;
}

export function createTesseracts(ctx: DecorContext, k: number): Part {
  const rng = ctx.rng;
  const R = ctx.radius;
  const count = ctx.quality.particles < 0.5 ? 1 : 2;
  const list: Tess[] = [];
  const a0 = rng.float(0, Math.PI * 2);
  for (let i = 0; i < count; i++) {
    const size = (4.2 + rng.float(0, 1.6)) * k;
    const d = R * 1.1 + size * 3.3 + R * rng.float(0.35, 0.9);
    const a = a0 + i * Math.PI * (0.8 + rng.float(0, 0.5));
    list.push({ x: Math.cos(a) * d, z: Math.sin(a) * d, y: rng.float(8, 20) * k, size, speed: rng.float(0.7, 1.2), phase: rng.float(0, 6) });
  }
  const edgeGeo = new THREE.CylinderGeometry(0.5, 0.5, 1, 5, 1);
  const edges = new THREE.InstancedMesh(edgeGeo, glow(0xffffff), count * EDGES.length);
  const verts = new THREE.InstancedMesh(new THREE.OctahedronGeometry(1, 0), glow(0xffffff), count * 16);
  edges.frustumCulled = verts.frustumCulled = false;
  const cols = [0xff7bd8, 0x7be8ff, 0xfff0a0];
  for (let i = 0; i < count; i++) {
    for (let e = 0; e < EDGES.length; e++) edges.setColorAt(i * EDGES.length + e, tmpC.setHex(cols[EDGES[e]!.type]!));
    for (let v = 0; v < 16; v++) verts.setColorAt(i * 16 + v, tmpC.setHex(0xffffff));
  }

  const update = (_dt: number, t: number): void => {
    for (let i = 0; i < list.length; i++) {
      const T = list[i]!;
      const s = t * 0.28 * T.speed + T.phase;
      const c1 = Math.cos(s), s1 = Math.sin(s);
      const c2 = Math.cos(s * 0.77 + 1), s2 = Math.sin(s * 0.77 + 1);
      const c3 = Math.cos(s * 0.51 + 2), s3 = Math.sin(s * 0.51 + 2);
      const c4 = Math.cos(s * 0.33), s4 = Math.sin(s * 0.33);
      for (let v = 0; v < 16; v++) {
        let x = v & 1 ? 1 : -1;
        let y = v & 2 ? 1 : -1;
        let z = v & 4 ? 1 : -1;
        let w = v & 8 ? 1 : -1;
        let q = x * c1 - w * s1; w = x * s1 + w * c1; x = q; // XW
        q = y * c2 - w * s2; w = y * s2 + w * c2; y = q; // YW
        q = z * c3 - w * s3; w = z * s3 + w * c3; z = q; // ZW
        q = x * c4 - z * s4; z = x * s4 + z * c4; x = q; // XZ
        const f = (2 / (3.4 - w)) * T.size;
        proj[v * 4] = x * f;
        proj[v * 4 + 1] = y * f;
        proj[v * 4 + 2] = z * f;
        proj[v * 4 + 3] = f;
      }
      const cy = T.y + Math.sin(t * 0.6 + T.phase) * 0.8 * k;
      const th = 0.11 * T.size;
      for (let e = 0; e < EDGES.length; e++) {
        const E = EDGES[e]!;
        const ax = proj[E.a * 4]!, ay = proj[E.a * 4 + 1]!, az = proj[E.a * 4 + 2]!;
        const bx = proj[E.b * 4]!, by = proj[E.b * 4 + 1]!, bz = proj[E.b * 4 + 2]!;
        tmpD.set(bx - ax, by - ay, bz - az);
        const len = Math.max(0.001, tmpD.length());
        tmpD.multiplyScalar(1 / len);
        tmpQ.setFromUnitVectors(UP, tmpD);
        tmpP.set(T.x + (ax + bx) * 0.5, cy + (ay + by) * 0.5, T.z + (az + bz) * 0.5);
        const wd = th * (E.type === 2 ? 0.7 : 1);
        tmpS.set(wd, len, wd);
        edges.setMatrixAt(i * EDGES.length + e, tmpM.compose(tmpP, tmpQ, tmpS));
      }
      tmpQ.identity();
      for (let v = 0; v < 16; v++) {
        tmpP.set(T.x + proj[v * 4]!, cy + proj[v * 4 + 1]!, T.z + proj[v * 4 + 2]!);
        tmpS.setScalar(th * 1.9 * (proj[v * 4 + 3]! / T.size) * 1.6);
        verts.setMatrixAt(i * 16 + v, tmpM.compose(tmpP, tmpQ, tmpS));
      }
    }
    edges.instanceMatrix.needsUpdate = true;
    verts.instanceMatrix.needsUpdate = true;
    if (edges.instanceColor) edges.instanceColor.needsUpdate = true;
    if (verts.instanceColor) verts.instanceColor.needsUpdate = true;
  };
  update(0, 0);
  return { objects: [edges, verts], update };
}

interface Portal {
  x: number;
  y: number;
  z: number;
  face: THREE.Quaternion;
  radius: number;
  phase: number;
}

export function createPortals(ctx: DecorContext, k: number): Part {
  const rng = ctx.rng;
  const R = ctx.radius;
  const n = ctx.quality.particles < 0.5 ? 2 : 3;
  const RINGS = 3;
  const list: Portal[] = [];
  const a0 = rng.float(0, Math.PI * 2);
  const up = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    const radius = (6 + rng.float(0, 3)) * k;
    const d = R * 1.12 + radius * 1.5 + R * rng.float(0.5, 1.1);
    const a = a0 + i * ((Math.PI * 2) / n) + rng.float(-0.4, 0.4);
    const x = Math.cos(a) * d;
    const z = Math.sin(a) * d;
    // Ringebene zeigt zum Mittelpunkt (Normale = Richtung zum Zentrum), der Rand bleibt radial >= d
    up.set(-x, 0, -z).normalize();
    const face = new THREE.Quaternion().setFromUnitVectors(Z, up);
    list.push({ x, z, y: rng.float(-4, 14) * k, face, radius, phase: rng.float(0, 6) });
  }
  const rings = new THREE.InstancedMesh(new THREE.TorusGeometry(1, 0.045, 6, 48), glow(0xffffff), n * RINGS);
  const cores = new THREE.InstancedMesh(new THREE.CircleGeometry(1, 28), glow(0xffffff, 0.22), n);
  (cores.material as THREE.MeshBasicMaterial).depthWrite = false;
  (cores.material as THREE.MeshBasicMaterial).side = THREE.DoubleSide;
  rings.frustumCulled = cores.frustumCulled = false;
  for (let i = 0; i < n; i++) {
    for (let r = 0; r < RINGS; r++) rings.setColorAt(i * RINGS + r, tmpC.setHex(PALETTE[(i + r * 2) % PALETTE.length]!));
    cores.setColorAt(i, tmpC.setHex(PALETTE[(i * 2 + 1) % PALETTE.length]!));
  }
  const update = (_dt: number, t: number): void => {
    for (let i = 0; i < n; i++) {
      const P = list[i]!;
      const y = P.y + Math.sin(t * 0.5 + P.phase) * 0.8 * k;
      for (let r = 0; r < RINGS; r++) {
        const sc = P.radius * (1 - r * 0.22);
        tmpQ2.setFromAxisAngle(Z, t * (0.35 + r * 0.25) * (r % 2 ? -1 : 1) + P.phase);
        tmpQ.copy(P.face).multiply(tmpQ2);
        tmpP.set(P.x, y, P.z);
        const pulse = 1 + Math.sin(t * 1.3 + r + P.phase) * 0.03;
        tmpS.set(sc * pulse, sc * pulse, sc * pulse * (r === 1 ? 2.2 : 1));
        rings.setMatrixAt(i * RINGS + r, tmpM.compose(tmpP, tmpQ, tmpS));
      }
      tmpP.set(P.x, y, P.z);
      tmpS.setScalar(P.radius * 0.72);
      cores.setMatrixAt(i, tmpM.compose(tmpP, P.face, tmpS));
    }
    rings.instanceMatrix.needsUpdate = true;
    cores.instanceMatrix.needsUpdate = true;
    if (rings.instanceColor) rings.instanceColor.needsUpdate = true;
    if (cores.instanceColor) cores.instanceColor.needsUpdate = true;
  };
  update(0, 0);
  return { objects: [rings, cores], update };
}
