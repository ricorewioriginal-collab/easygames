// Andere Spieler im Mehrspieler: Klötzchen-Figur mit Namensschild, weich zur gemeldeten Position geführt.
import * as THREE from 'three';
import { buildGeo } from './mobview.js';

const COLORS = [0x3a8ad8, 0xd85a3a, 0x3ab86a, 0xc8a83a, 0x9a5ad8];
const body = c => [
  [-0.22, 0, -0.12, -0.02, 0.75, 0.12, 0x2a3a5a], [0.02, 0, -0.12, 0.22, 0.75, 0.12, 0x2a3a5a],
  [-0.28, 0.75, -0.16, 0.28, 1.4, 0.16, c], [-0.4, 0.8, -0.1, -0.28, 1.38, 0.1, c], [0.28, 0.8, -0.1, 0.4, 1.38, 0.1, c],
  [-0.22, 1.4, -0.22, 0.22, 1.84, 0.22, 0xe8c09a], [-0.24, 1.76, -0.24, 0.24, 1.9, 0.24, 0x4a3420],
  [-0.13, 1.6, -0.24, -0.05, 1.66, -0.22, 0x202020], [0.05, 1.6, -0.24, 0.13, 1.66, -0.22, 0x202020]
];

function label(text) {
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 64;
  const g = cv.getContext('2d');
  g.font = 'bold 34px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  const w = Math.min(250, g.measureText(text).width + 28);
  g.fillStyle = 'rgba(10,14,30,.62)'; g.fillRect(128 - w / 2, 6, w, 52);
  g.fillStyle = '#fff'; g.fillText(text, 128, 33);
  const tex = new THREE.CanvasTexture(cv);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  s.scale.set(1.6, 0.4, 1); s.position.y = 2.25; s.renderOrder = 30;
  return s;
}

export class AvatarView {
  constructor(scene) { this.group = new THREE.Group(); scene.add(this.group); this.list = new Map(); this.geos = COLORS.map(c => buildGeo(body(c))); }
  // p: { x, y, z, yaw, name? }
  set(id, p) {
    let a = this.list.get(id);
    if (!a) {
      const mat = new THREE.MeshBasicMaterial({ vertexColors: true }), root = new THREE.Group();
      root.add(new THREE.Mesh(this.geos[id % COLORS.length], mat));
      a = { root, mat, name: '', tag: null, x: p.x, y: p.y, z: p.z, yaw: p.yaw || 0, tx: p.x, ty: p.y, tz: p.z, tyaw: p.yaw || 0 };
      this.group.add(root); this.list.set(id, a);
    }
    if (p.name && p.name !== a.name) {
      a.name = p.name;
      if (a.tag) { a.root.remove(a.tag); a.tag.material.map.dispose(); a.tag.material.dispose(); }
      a.tag = label(p.name); a.root.add(a.tag);
    }
    a.tx = p.x; a.ty = p.y; a.tz = p.z; if (Number.isFinite(p.yaw)) a.tyaw = p.yaw;
  }
  remove(id) {
    const a = this.list.get(id);
    if (!a) return;
    this.group.remove(a.root); a.mat.dispose(); if (a.tag) { a.tag.material.map.dispose(); a.tag.material.dispose(); }
    this.list.delete(id);
  }
  clear() { for (const id of [...this.list.keys()]) this.remove(id); }
  update(dt, light) {
    const k = Math.min(1, dt * 12);
    for (const a of this.list.values()) {
      if (Math.hypot(a.tx - a.x, a.tz - a.z) > 20) { a.x = a.tx; a.y = a.ty; a.z = a.tz; } // weit gesprungen: nicht durch die Welt gleiten
      a.x += (a.tx - a.x) * k; a.y += (a.ty - a.y) * k; a.z += (a.tz - a.z) * k;
      let d = a.tyaw - a.yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); a.yaw += d * k;
      a.root.position.set(a.x, a.y, a.z); a.root.rotation.y = a.yaw;
      a.mat.color.setRGB(light, light, light);
    }
  }
}
