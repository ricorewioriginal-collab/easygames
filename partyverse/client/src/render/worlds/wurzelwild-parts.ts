import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { toon } from '../materials';

/** Sammelt Instanzen (Matrix + Farbe) und baut daraus ein einziges InstancedMesh. */
export class InstBuilder {
  private readonly mats: THREE.Matrix4[] = [];
  private readonly cols: THREE.Color[] = [];
  mesh!: THREE.InstancedMesh;

  add(p: THREE.Vector3, q: THREE.Quaternion, s: THREE.Vector3, color: number = 0xffffff): number {
    this.mats.push(new THREE.Matrix4().compose(p, q, s));
    this.cols.push(new THREE.Color(color));
    return this.mats.length - 1;
  }

  get size(): number {
    return this.mats.length;
  }

  build(geo: THREE.BufferGeometry, mat: THREE.Material, parent: THREE.Group): THREE.InstancedMesh {
    const n = this.mats.length;
    const mesh = new THREE.InstancedMesh(geo, mat, Math.max(1, n));
    mesh.count = n;
    for (let i = 0; i < n; i++) {
      mesh.setMatrixAt(i, this.mats[i]!);
      mesh.setColorAt(i, this.cols[i]!);
    }
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.frustumCulled = false;
    parent.add(mesh);
    this.mesh = mesh;
    return mesh;
  }
}

/** Färbt eine Geometrie komplett in einer Vertexfarbe ein (für verschmolzene Mehrfarb-Modelle). */
export function paint(g: THREE.BufferGeometry, hex: number): THREE.BufferGeometry {
  const n = g.getAttribute('position').count;
  const c = new THREE.Color(hex);
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    arr[i * 3] = c.r;
    arr[i * 3 + 1] = c.g;
    arr[i * 3 + 2] = c.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  return g;
}

function merge(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const g = mergeGeometries(parts, false);
  for (const p of parts) p.dispose();
  if (!g) throw new Error('wurzelwild: Geometrien nicht verschmelzbar');
  return g;
}

/** Pilz mit Stiel, Hut, Lamellen und Tupfen; Fußpunkt bei y = 0, Höhe ca. 1,5, Hutradius 1. */
export function mushroomGeo(cap: number, spot: number): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const stem = new THREE.CylinderGeometry(0.27, 0.4, 1, 8, 1);
  stem.translate(0, 0.5, 0);
  parts.push(paint(stem, 0xf6eed2));
  const hat = new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  hat.scale(1, 0.75, 1);
  hat.translate(0, 0.92, 0);
  parts.push(paint(hat, cap));
  const under = new THREE.CircleGeometry(1, 14);
  under.rotateX(Math.PI / 2);
  under.translate(0, 0.92, 0);
  parts.push(paint(under, 0xe6d2a0));
  for (let k = 0; k < 7; k++) {
    const az = k * 2.4;
    const el = 0.3 + (k % 3) * 0.32;
    const sx = Math.sin(el) * Math.cos(az);
    const sy = Math.cos(el);
    const sz = Math.sin(el) * Math.sin(az);
    const dot = new THREE.SphereGeometry(0.17, 6, 5);
    dot.scale(1, 0.45, 1);
    dot.translate(sx * 0.99, sy * 0.75 * 0.99 + 0.92, sz * 0.99);
    parts.push(paint(dot, spot));
  }
  return merge(parts);
}

/** Marienkäfer-ähnlicher Cartoon-Käfer, Blick nach +x, Füße bei y = 0, Länge ca. 1,4. */
export function beetleGeo(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const body = new THREE.SphereGeometry(0.5, 12, 8);
  body.scale(1.1, 0.72, 0.95);
  body.translate(0, 0.3, 0);
  parts.push(paint(body, 0xe8402e));
  const head = new THREE.SphereGeometry(0.26, 8, 6);
  head.translate(0.6, 0.27, 0);
  parts.push(paint(head, 0x2a2024));
  for (const z of [-0.12, 0.12]) {
    const eye = new THREE.SphereGeometry(0.07, 5, 4);
    eye.translate(0.8, 0.36, z);
    parts.push(paint(eye, 0xffffff));
  }
  const line = new THREE.BoxGeometry(1.0, 0.03, 0.03);
  line.translate(-0.05, 0.62, 0);
  parts.push(paint(line, 0x2a2024));
  const spots: [number, number][] = [
    [0.2, 0.28],
    [0.2, -0.28],
    [-0.2, 0.32],
    [-0.2, -0.32],
    [-0.45, 0],
  ];
  for (const [x, z] of spots) {
    const s = new THREE.SphereGeometry(0.1, 6, 5);
    s.scale(1, 0.5, 1);
    s.translate(
      x,
      0.3 + 0.72 * 0.5 * Math.sqrt(Math.max(0, 1 - (x / 0.55) ** 2 - (z / 0.475) ** 2)) - 0.01,
      z,
    );
    parts.push(paint(s, 0x2a2024));
  }
  return merge(parts);
}

/** Großes Blatt: liegt flach, Spitze zeigt nach -z, Länge 1, Breite ca. 0,55, hängt zur Spitze hin leicht durch. */
export function leafGeo(): THREE.BufferGeometry {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(0.34, 0.12, 0.3, 0.7, 0, 1);
  s.bezierCurveTo(-0.3, 0.7, -0.34, 0.12, 0, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: false, curveSegments: 10 });
  g.translate(0, 0, -0.025);
  g.rotateX(-Math.PI / 2);
  const pos = g.getAttribute('position');
  for (let i = 0; i < pos.count; i++) {
    const z = pos.getZ(i);
    pos.setY(i, pos.getY(i) - 0.22 * z * z);
  }
  g.computeVertexNormals();
  return g;
}

/** Flügel eines Schmetterlings: liegt in der xz-Ebene und ragt nach +z, Spannweite 1. */
export function wingGeo(): THREE.BufferGeometry {
  const s = new THREE.Shape();
  s.moveTo(0.05, 0.02);
  s.bezierCurveTo(0.55, 0.1, 0.85, 0.85, 0.22, 1.0);
  s.bezierCurveTo(-0.12, 1.06, -0.1, 0.62, -0.08, 0.5);
  s.bezierCurveTo(-0.62, 0.6, -0.72, 0.08, -0.05, 0.02);
  s.lineTo(0.05, 0.02);
  const g = new THREE.ShapeGeometry(s, 8);
  g.rotateX(Math.PI / 2);
  return g;
}

/** Eigenes (nicht geteiltes) Toon-Material, z. B. beidseitig oder mit Vertexfarben */
export function ownToon(color: number, tweak: (m: THREE.MeshToonMaterial) => void): THREE.MeshToonMaterial {
  const m = toon(color).clone();
  m.userData.shared = false;
  tweak(m);
  return m;
}
