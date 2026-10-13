// Prozedurale Modelle (alles im Code erzeugt – keine fremden Assets).
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/** Geometrie einfärben (Vertex-Farben) */
export function tint(g: THREE.BufferGeometry, color: number): THREE.BufferGeometry {
  const c = new THREE.Color(color);
  const n = g.attributes.position!.count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    arr[i * 3] = c.r;
    arr[i * 3 + 1] = c.g;
    arr[i * 3 + 2] = c.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  return g;
}

export function merge(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const clean = parts.map((g) => {
    const ng = g.index ? g.toNonIndexed() : g;
    for (const k of Object.keys(ng.attributes)) if (k !== 'position' && k !== 'normal' && k !== 'color') ng.deleteAttribute(k);
    return ng;
  });
  const m = mergeGeometries(clean, false);
  if (!m) throw new Error('merge fehlgeschlagen');
  m.computeBoundingSphere();
  return m;
}

const at = (g: THREE.BufferGeometry, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0): THREE.BufferGeometry => {
  if (rx) g.rotateX(rx);
  if (ry) g.rotateY(ry);
  if (rz) g.rotateZ(rz);
  return g.translate(x, y, z);
};

/** Keil: Grundfläche 1×1, steigt entlang +x von 0 auf 1, zentriert. */
export function wedgeGeometry(): THREE.BufferGeometry {
  const v = [
    // Unterseite
    [-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, -0.5, 0.5],
    [-0.5, -0.5, -0.5], [0.5, -0.5, 0.5], [-0.5, -0.5, 0.5],
    // Schräge
    [-0.5, -0.5, -0.5], [-0.5, -0.5, 0.5], [0.5, 0.5, 0.5],
    [-0.5, -0.5, -0.5], [0.5, 0.5, 0.5], [0.5, 0.5, -0.5],
    // Rückwand (x = +0.5)
    [0.5, -0.5, -0.5], [0.5, 0.5, -0.5], [0.5, 0.5, 0.5],
    [0.5, -0.5, -0.5], [0.5, 0.5, 0.5], [0.5, -0.5, 0.5],
    // Seiten
    [-0.5, -0.5, -0.5], [0.5, 0.5, -0.5], [0.5, -0.5, -0.5],
    [-0.5, -0.5, 0.5], [0.5, -0.5, 0.5], [0.5, 0.5, 0.5],
  ];
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(v.flat()), 3));
  g.computeVertexNormals();
  return g;
}

/** Baum (10 m hoch, Fuß bei y = 0) je Stil. */
export function treeGeometry(style: number): THREE.BufferGeometry {
  const trunkCol = style === 2 ? 0xd8d2c4 : style === 4 ? 0x9a7652 : 0x6b4a2f;
  const trunk = tint(new THREE.CylinderGeometry(0.22, 0.38, style === 4 ? 9 : 5, 6).translate(0, style === 4 ? 4.5 : 2.5, 0), trunkCol);
  const parts = [trunk];
  if (style === 0) {
    parts.push(tint(at(new THREE.IcosahedronGeometry(2.8, 0), 0, 6.2, 0), 0x4fa83a));
    parts.push(tint(at(new THREE.IcosahedronGeometry(2.1, 0), 1.2, 7.8, 0.6), 0x5cba44));
    parts.push(tint(at(new THREE.IcosahedronGeometry(1.9, 0), -1.1, 7.3, -0.8), 0x46993a));
  } else if (style === 1 || style === 3) {
    const c = style === 3 ? 0xe8f2ff : 0x2f7a43;
    const c2 = style === 3 ? 0x3f7a5a : 0x276a3a;
    parts.push(tint(at(new THREE.ConeGeometry(2.6, 3.6, 7), 0, 4.2, 0), c2));
    parts.push(tint(at(new THREE.ConeGeometry(2.1, 3.2, 7), 0, 6.3, 0), c));
    parts.push(tint(at(new THREE.ConeGeometry(1.4, 2.8, 7), 0, 8.4, 0), style === 3 ? 0xffffff : 0x358a4a));
  } else if (style === 2) {
    parts.push(tint(at(new THREE.IcosahedronGeometry(2.2, 0), 0, 6.8, 0), 0xa6d65a));
    parts.push(tint(at(new THREE.IcosahedronGeometry(1.6, 0), 0.6, 8.4, 0.3), 0xbfe36a));
  } else {
    // Palme
    for (let i = 0; i < 6; i++) {
      const leaf = new THREE.BoxGeometry(3.4, 0.08, 0.7).translate(1.7, 0, 0);
      leaf.rotateZ(-0.35);
      leaf.rotateY((i / 6) * Math.PI * 2);
      parts.push(tint(leaf.translate(0, 9, 0), i % 2 ? 0x3fa34a : 0x58b84a));
    }
    parts.push(tint(at(new THREE.SphereGeometry(0.45, 6, 4), 0, 8.8, 0), 0x6b4a2f));
  }
  return merge(parts);
}

export function rockGeometry(): THREE.BufferGeometry {
  const g = new THREE.IcosahedronGeometry(0.62, 1);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i),
      y = p.getY(i),
      z = p.getZ(i);
    const n = 0.82 + 0.25 * Math.sin(x * 9.1 + z * 4.3) * Math.cos(y * 7.7);
    p.setXYZ(i, x * n, Math.max(-0.5, y * n), z * n);
  }
  const ng = g.toNonIndexed();
  ng.computeVertexNormals();
  return tint(ng, 0xffffff);
}

export function bushGeometry(): THREE.BufferGeometry {
  return merge([
    tint(at(new THREE.IcosahedronGeometry(0.55, 0), 0, 0.45, 0), 0xffffff),
    tint(at(new THREE.IcosahedronGeometry(0.42, 0), 0.35, 0.35, 0.2), 0xe8e8e8),
    tint(at(new THREE.IcosahedronGeometry(0.38, 0), -0.3, 0.32, -0.15), 0xf0f0f0),
  ]);
}

export function cactusGeometry(): THREE.BufferGeometry {
  return merge([
    tint(new THREE.CylinderGeometry(0.18, 0.22, 1, 7).translate(0, 0.5, 0), 0xffffff),
    tint(new THREE.CylinderGeometry(0.1, 0.1, 0.35, 6).rotateZ(Math.PI / 2).translate(0.25, 0.55, 0), 0xffffff),
    tint(new THREE.CylinderGeometry(0.09, 0.09, 0.3, 6).translate(0.4, 0.7, 0), 0xffffff),
  ]);
}

/** Auto-Wrack/Parkauto: Länge entlang z (4,4 m), Fuß bei y = 0 */
export function carGeometry(): THREE.BufferGeometry {
  const parts = [
    tint(new THREE.BoxGeometry(1.9, 0.75, 4.3).translate(0, 0.65, 0), 0xffffff),
    tint(new THREE.BoxGeometry(1.7, 0.6, 2.2).translate(0, 1.32, 0.2), 0xf2f2f2),
    tint(new THREE.BoxGeometry(1.72, 0.45, 2.0).translate(0, 1.33, 0.2), 0x29324a),
  ];
  for (const [x, z] of [
    [-0.95, -1.35],
    [0.95, -1.35],
    [-0.95, 1.35],
    [0.95, 1.35],
  ])
    parts.push(tint(new THREE.CylinderGeometry(0.38, 0.38, 0.3, 10).rotateZ(Math.PI / 2).translate(x!, 0.38, z!), 0x1a1a1f));
  parts.push(tint(new THREE.BoxGeometry(0.4, 0.15, 0.05).translate(-0.6, 0.75, -2.17), 0xfff3b0));
  parts.push(tint(new THREE.BoxGeometry(0.4, 0.15, 0.05).translate(0.6, 0.75, -2.17), 0xfff3b0));
  return merge(parts);
}

/** Riftkiste: Körper + Deckel, 1×0.65×0.6 */
export function chestGeometry(): THREE.BufferGeometry {
  return merge([
    tint(new THREE.BoxGeometry(1, 0.42, 0.6).translate(0, 0.21, 0), 0xffffff),
    tint(new THREE.BoxGeometry(1.04, 0.2, 0.64).translate(0, 0.52, 0), 0xe8e8e8),
    tint(new THREE.BoxGeometry(0.16, 0.18, 0.05).translate(0, 0.38, -0.32), 0x3ff2ff),
    tint(new THREE.BoxGeometry(1.06, 0.06, 0.06).translate(0, 0.43, -0.3), 0x6a3cff),
  ]);
}

export function ammoBoxGeometry(): THREE.BufferGeometry {
  return merge([
    tint(new THREE.BoxGeometry(1.2, 0.5, 0.7).translate(0, 0.25, 0), 0x56653a),
    tint(new THREE.BoxGeometry(0.3, 0.06, 0.72).translate(-0.3, 0.52, 0), 0xffd23f),
    tint(new THREE.BoxGeometry(0.3, 0.06, 0.72).translate(0.3, 0.52, 0), 0xffd23f),
  ]);
}

export function padGeometry(): THREE.BufferGeometry {
  return merge([
    tint(new THREE.CylinderGeometry(1.3, 1.45, 0.35, 16).translate(0, 0.17, 0), 0x2a2f45),
    tint(new THREE.CylinderGeometry(1.0, 1.0, 0.06, 16).translate(0, 0.37, 0), 0x3ff2ff),
    tint(new THREE.TorusGeometry(1.15, 0.07, 6, 24).rotateX(Math.PI / 2).translate(0, 0.38, 0), 0xb64bff),
  ]);
}

export function crystalGeometry(): THREE.BufferGeometry {
  const g = new THREE.OctahedronGeometry(0.5, 0);
  g.scale(1, 2.4, 1);
  g.translate(0, 0.6, 0);
  return tint(g.toNonIndexed(), 0xffffff);
}
