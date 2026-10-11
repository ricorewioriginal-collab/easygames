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
  ],
  [ // Rauschling: dunkle, flimmernde Gestalt mit leuchtenden Augen und Antenne
    [-0.28, 0.75, -0.16, 0.28, 1.35, 0.16, 0x2a2440], [-0.22, 1.35, -0.22, 0.22, 1.75, 0.22, 0x342c52],
    [-0.15, 1.52, -0.24, -0.05, 1.6, -0.21, 0x6af0ff], [0.05, 1.52, -0.24, 0.15, 1.6, -0.21, 0x6af0ff],
    [-0.02, 1.75, -0.02, 0.02, 1.98, 0.02, 0x8a80b0], [-0.05, 1.96, -0.05, 0.05, 2.04, 0.05, 0xff3c8c],
    [-0.42, 0.8, -0.08, -0.28, 1.32, 0.08, 0x2a2440], [0.28, 0.8, -0.08, 0.42, 1.32, 0.08, 0x2a2440],
    [-0.22, 0, -0.1, -0.04, 0.75, 0.1, 0x221c36], [0.04, 0, -0.1, 0.22, 0.75, 0.1, 0x221c36]
  ],
  [ // Höhlenwesen: flacher Panzer, sechs Beine, rote Augen
    [-0.42, 0.25, -0.3, 0.42, 0.72, 0.5, 0x3a3a44], [-0.28, 0.3, -0.62, 0.28, 0.66, -0.3, 0x2a2a32],
    [-0.2, 0.5, -0.64, -0.08, 0.6, -0.61, 0xff3030], [0.08, 0.5, -0.64, 0.2, 0.6, -0.61, 0xff3030],
    ...[-0.2, 0.1, 0.35].flatMap(z => [[-0.82, 0, z - 0.05, -0.42, 0.4, z + 0.05, 0x24242c], [0.42, 0, z - 0.05, 0.82, 0.4, z + 0.05, 0x24242c]])
  ],
  [ // Störsender-Drohne: Gehäuse, Kuppel, rotes Auge, vier Rotoren
    [-0.35, 0.15, -0.35, 0.35, 0.42, 0.35, 0x505868], [-0.2, 0.42, -0.2, 0.2, 0.56, 0.2, 0x2a2e38],
    [-0.1, 0.2, -0.38, 0.1, 0.34, -0.35, 0xff2050], [-0.03, 0.56, -0.03, 0.03, 0.7, 0.03, 0x8a8a96],
    ...[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => [a * 0.55 - 0.13, 0.44, b * 0.55 - 0.13, a * 0.55 + 0.13, 0.48, b * 0.55 + 0.13, 0x9aa0ac])
  ],
  [ // Dorfbewohner: Hose, Kittel mit Schürze, Arme, Kopf mit Haar
    [-0.2, 0, -0.1, -0.02, 0.7, 0.1, 0x4a3a2a], [0.02, 0, -0.1, 0.2, 0.7, 0.1, 0x4a3a2a],
    [-0.25, 0.7, -0.15, 0.25, 1.35, 0.15, 0x3a6aa0], [-0.2, 0.75, -0.17, 0.2, 1.2, -0.15, 0x8a6a40],
    [-0.36, 0.8, -0.08, -0.25, 1.3, 0.08, 0x3a6aa0], [0.25, 0.8, -0.08, 0.36, 1.3, 0.08, 0x3a6aa0],
    [-0.2, 1.35, -0.2, 0.2, 1.73, 0.2, 0xe8c09a], [-0.22, 1.68, -0.22, 0.22, 1.82, 0.22, 0x6a4a2a],
    [-0.12, 1.52, -0.22, -0.05, 1.58, -0.2, 0x202020], [0.05, 1.52, -0.22, 0.12, 1.58, -0.2, 0x202020]
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
      const l = m.hostile ? Math.max(light, 0.7) * (0.85 + 0.15 * Math.sin(t * 23 + m.z)) : light; // Rauschen: flimmert, auch nachts sichtbar
      mesh.position.set(m.x, m.y + bob, m.z);
      mesh.rotation.y = m.yaw;
      if (m.hurtT > 0) mesh.material.color.setRGB(l * 1.3, l * 0.45, l * 0.45);
      else mesh.material.color.setRGB(l, l, l);
    }
  }
  clear() { for (const m of [...this.meshes.keys()]) this.remove(m); }
}
