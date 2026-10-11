// Darstellung der Tiere: einfache Klötzchen-Modelle mit eingebackener Flächenschattierung.
// Ein gemeinsames Modell je Tierart, je Tier ein eigenes Material (für Licht und Treffer-Färbung).
import * as THREE from 'three';

// Quader: [x0, y0, z0, x1, y1, z1, Farbe]; Kopf zeigt nach −Z (Blickrichtung wie beim Spieler)
const MODELS = [
  [ // Huhn
    [-0.2, 0.25, -0.25, 0.2, 0.6, 0.27, 0xf4f2ec], [-0.13, 0.5, -0.42, 0.13, 0.82, -0.18, 0xf4f2ec],
    [-0.06, 0.6, -0.52, 0.06, 0.68, -0.42, 0xf0a020], [-0.03, 0.82, -0.36, 0.03, 0.9, -0.24, 0xd83030],
    [-0.13, 0, -0.04, -0.07, 0.25, 0.02, 0xe8b030], [0.07, 0, -0.04, 0.13, 0.25, 0.02, 0xe8b030]
  ],
  [ // Schaf
    [-0.4, 0.45, -0.6, 0.4, 1.08, 0.6, 0xeceae2], [-0.2, 0.72, -0.95, 0.2, 1.12, -0.56, 0xc8b8a0],
    [-0.21, 1.0, -0.9, 0.21, 1.16, -0.6, 0xeceae2],
    [-0.32, 0, -0.5, -0.14, 0.46, -0.32, 0x4a4440], [0.14, 0, -0.5, 0.32, 0.46, -0.32, 0x4a4440],
    [-0.32, 0, 0.32, -0.14, 0.46, 0.5, 0x4a4440], [0.14, 0, 0.32, 0.32, 0.46, 0.5, 0x4a4440]
  ],
  [ // Kuh
    [-0.42, 0.55, -0.7, 0.42, 1.22, 0.7, 0x6a4428], [-0.43, 0.75, -0.2, 0.43, 1.12, 0.25, 0xf2eee6],
    [-0.25, 0.85, -1.08, 0.25, 1.36, -0.7, 0x5a3a22], [-0.16, 0.86, -1.13, 0.16, 1.02, -1.06, 0xe6b0a0],
    [-0.32, 1.3, -0.95, -0.24, 1.46, -0.88, 0xe8e2d0], [0.24, 1.3, -0.95, 0.32, 1.46, -0.88, 0xe8e2d0],
    [-0.36, 0, -0.62, -0.16, 0.56, -0.42, 0x3a281a], [0.16, 0, -0.62, 0.36, 0.56, -0.42, 0x3a281a],
    [-0.36, 0, 0.42, -0.16, 0.56, 0.62, 0x3a281a], [0.16, 0, 0.42, 0.36, 0.56, 0.62, 0x3a281a]
  ]
];
// Helligkeit je Flächenrichtung: +X, −X, +Y, −Y, +Z, −Z
const SHADE = [0.8, 0.8, 1.0, 0.5, 0.68, 0.68];

function buildGeo(boxes) {
  const pos = [], col = [], idx = [], c = new THREE.Color();
  for (const [x0, y0, z0, x1, y1, z1, hex] of boxes) {
    const g = new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0);
    g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    const p = g.attributes.position.array, base = pos.length / 3;
    c.setHex(hex);
    for (let v = 0; v < p.length / 3; v++) {
      const s = SHADE[Math.floor(v / 4)];
      pos.push(p[v * 3], p[v * 3 + 1], p[v * 3 + 2]); col.push(c.r * s, c.g * s, c.b * s);
    }
    for (const i of g.index.array) idx.push(base + i);
    g.dispose();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  geo.setIndex(idx);
  geo.computeBoundingSphere();
  return geo;
}

export class MobView {
  constructor(scene) {
    this.group = new THREE.Group();
    scene.add(this.group);
    this.geos = MODELS.map(buildGeo);
    this.meshes = new Map();
  }
  add(m) {
    const mesh = new THREE.Mesh(this.geos[m.type], new THREE.MeshBasicMaterial({ vertexColors: true }));
    mesh.matrixAutoUpdate = true;
    this.group.add(mesh); this.meshes.set(m, mesh);
  }
  remove(m) {
    const mesh = this.meshes.get(m);
    if (!mesh) return;
    this.group.remove(mesh); mesh.material.dispose(); this.meshes.delete(m);
  }
  // light: Helligkeit 0..1, maxD: Sichtweite in Blöcken
  update(px, pz, light, maxD, t) {
    for (const [m, mesh] of this.meshes) {
      const d = Math.hypot(m.x - px, m.z - pz);
      mesh.visible = d < maxD;
      if (!mesh.visible) continue;
      const bob = m.moving ? Math.abs(Math.sin(t * 9 + m.x)) * 0.05 : 0;
      mesh.position.set(m.x, m.y + bob, m.z);
      mesh.rotation.y = m.yaw;
      if (m.hurtT > 0) mesh.material.color.setRGB(light * 1.3, light * 0.45, light * 0.45);
      else mesh.material.color.setRGB(light, light, light);
    }
  }
  clear() { for (const m of [...this.meshes.keys()]) this.remove(m); }
}
