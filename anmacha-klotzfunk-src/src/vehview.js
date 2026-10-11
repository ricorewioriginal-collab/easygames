// Darstellung der Fahrzeuge: Klötzchen-Modelle wie bei den Tieren, mit Paddeln (Boot) und Rädern (Lore).
import * as THREE from 'three';
import { buildGeo } from './mobview.js';

// Quader: [x0, y0, z0, x1, y1, z1, Farbe]; Bug bzw. Fahrtrichtung zeigt nach −Z
const HULL = [
  [-0.6, 0, -0.75, 0.6, 0.12, 0.75, 0x6a4a2a], // Boden
  [-0.6, 0.12, -0.75, -0.48, 0.5, 0.75, 0xa87a46], [0.48, 0.12, -0.75, 0.6, 0.5, 0.75, 0xa87a46],
  [-0.48, 0.12, 0.63, 0.48, 0.5, 0.75, 0xa87a46], [-0.48, 0.12, -0.95, 0.48, 0.45, -0.75, 0x9a6e3e],
  [-0.48, 0.28, -0.1, 0.48, 0.34, 0.12, 0x7a5430] // Sitzbank
];
const PADDLE = [[-0.03, -0.05, -0.03, 0.03, 0.75, 0.03, 0x5a3a1e], [-0.08, -0.32, -0.02, 0.08, -0.05, 0.02, 0x8a6034]];
const CART = [
  [-0.45, 0.18, -0.55, 0.45, 0.26, 0.55, 0x5a5c64],
  [-0.45, 0.26, -0.55, -0.37, 0.72, 0.55, 0x8a8c94], [0.37, 0.26, -0.55, 0.45, 0.72, 0.55, 0x8a8c94],
  [-0.37, 0.26, -0.55, 0.37, 0.72, -0.47, 0x7a7c84], [-0.37, 0.26, 0.47, 0.37, 0.72, 0.55, 0x7a7c84],
  [-0.45, 0.66, -0.55, 0.45, 0.72, -0.5, 0xb8742c], [-0.45, 0.66, 0.5, 0.45, 0.72, 0.55, 0xb8742c]
];
const WHEEL = [[-0.04, -0.12, -0.12, 0.04, 0.12, 0.12, 0x2a2a30], [-0.05, -0.03, -0.03, 0.05, 0.03, 0.03, 0x9a9aa2], [-0.045, -0.12, -0.02, 0.045, 0.12, 0.02, 0x4a4a52]];

export class VehicleView {
  constructor(scene) {
    this.group = new THREE.Group(); scene.add(this.group);
    this.geo = { hull: buildGeo(HULL), paddle: buildGeo(PADDLE), cart: buildGeo(CART), wheel: buildGeo(WHEEL) };
    this.items = new Map();
  }
  add(v) {
    const mat = new THREE.MeshBasicMaterial({ vertexColors: true }), root = new THREE.Group(), parts = [];
    if (v.kind === 'boot') {
      root.add(new THREE.Mesh(this.geo.hull, mat));
      for (const s of [-1, 1]) { const p = new THREE.Mesh(this.geo.paddle, mat); p.position.set(s * 0.62, 0.45, 0.05); root.add(p); parts.push(p); }
    } else {
      root.add(new THREE.Mesh(this.geo.cart, mat));
      for (const [x, z] of [[-0.48, -0.35], [0.48, -0.35], [-0.48, 0.35], [0.48, 0.35]]) { const w = new THREE.Mesh(this.geo.wheel, mat); w.position.set(x, 0.12, z); root.add(w); parts.push(w); }
    }
    this.group.add(root); this.items.set(v, { root, parts, mat });
  }
  remove(v) {
    const it = this.items.get(v);
    if (!it) return;
    this.group.remove(it.root); it.mat.dispose(); this.items.delete(v);
  }
  clear() { for (const v of [...this.items.keys()]) this.remove(v); }
  update(px, pz, light, maxD, time) {
    for (const [v, it] of this.items) {
      const vis = Math.hypot(v.x - px, v.z - pz) < maxD;
      it.root.visible = vis;
      if (!vis) continue;
      it.root.position.set(v.x, v.y, v.z); it.root.rotation.y = v.yaw;
      it.mat.color.setRGB(light, light, light);
      if (v.kind === 'boot') { // schaukeln, Paddel schlagen beim Fahren
        it.root.rotation.z = Math.sin(time * 1.7 + v.x) * 0.04; it.root.rotation.x = Math.sin(time * 1.3 + v.z) * 0.03;
        it.parts.forEach((p, i) => { p.rotation.x = Math.sin(v.t * 2.2 + i * Math.PI) * 0.7; p.rotation.z = (i ? -1 : 1) * 0.5; });
      } else {
        it.parts.forEach(w => { w.rotation.x = -v.t / 0.12; });
        const r = v.rail, up = r ? v.y - (r.y + 0.0625) : 0; // Neigung auf Steigungen (Bug zeigt nach −Z)
        it.root.rotation.x = up > 0.01 ? Math.PI / 4 : up < -0.01 ? -Math.PI / 4 : 0;
      }
    }
  }
}
