// Secondary renderer for UI: live 3D previews (starter balls, status page,
// Taschidex, character creator) and cached portrait thumbnails.
import { THREE } from './three.js';
import { createCreature, displayScale } from './creatures.js';
import { createCharacter } from './characters.js';

export class Preview {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x9aa6b8, 0.75));
    const d = new THREE.DirectionalLight(0xffffff, 0.55); d.position.set(2, 4, 3); this.scene.add(d);
    const base = new THREE.Mesh(new THREE.CircleGeometry(1.4, 32), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.12 }));
    base.rotation.x = -Math.PI / 2; this.scene.add(base); this.base = base;
    this.model = null; this.active = null; this.thumbs = new Map(); this.spin = true; this.t = 0;
  }
  clearModel() { if (this.model) { this.scene.remove(this.model.root); this.model.dispose?.(); this.model = null; } }
  showCreature(id, { shiny = false } = {}) {
    this.clearModel();
    const c = createCreature(id, { outline: true, shiny });
    const s = displayScale(id, 'battle');
    c.root.scale.setScalar(s * 0.62);
    this.scene.add(c.root); this.model = c;
    this.frame(1.25 * s * 0.62 + 0.4, 0.55 * s);
    return c;
  }
  showCharacter(look) {
    this.clearModel();
    const ch = createCharacter(look, { outline: true });
    this.scene.add(ch.root); this.model = { root: ch.root, update: (dt) => ch.update(dt), character: ch };
    this.frame(1.0, 0.85);
    return ch;
  }
  frame(height, lookY) { this.camera.position.set(0, lookY + height * 0.35, height * 2.6 + 1.2); this.camera.lookAt(0, lookY * 0.95, 0); }
  attach(container) {
    this.active = container;
    container.append(this.canvas);
    this.resize();
  }
  detach() { if (this.active && this.canvas.parentNode === this.active) this.active.removeChild(this.canvas); this.active = null; this.clearModel(); }
  resize() {
    if (!this.active) return;
    const r = this.active.getBoundingClientRect();
    const w = Math.max(64, r.width), hgt = Math.max(64, r.height);
    this.renderer.setSize(w, hgt, false);
    this.camera.aspect = w / hgt; this.camera.updateProjectionMatrix();
  }
  update(dt) {
    if (!this.active || !this.model) return;
    if (!this.canvas.isConnected) { this.active = null; return; }
    this.t += dt;
    if (this.spin) this.model.root.rotation.y = Math.sin(this.t * 0.6) * 0.6 + 0.2;
    this.model.update?.(dt);
    this.renderer.render(this.scene, this.camera);
  }
  // Portrait thumbnail (data URL), cached per species.
  thumbnail(id) {
    if (this.thumbs.has(id)) return this.thumbs.get(id);
    const keepActive = this.active, keepModel = this.model;
    this.model = null;
    const c = createCreature(id, { outline: true });
    const s = displayScale(id, 'battle');
    c.root.scale.setScalar(s * 0.62); c.root.rotation.y = 0.45;
    this.scene.add(c.root);
    this.renderer.setSize(128, 128, false);
    this.camera.aspect = 1; this.camera.updateProjectionMatrix();
    this.frame(1.0 * s * 0.62 + 0.35, 0.55 * s);
    c.update(0.01);
    this.base.visible = false;
    this.renderer.render(this.scene, this.camera);
    const url = this.canvas.toDataURL('image/png');
    this.base.visible = true;
    this.scene.remove(c.root); c.dispose();
    this.thumbs.set(id, url);
    this.model = keepModel; this.active = keepActive;
    if (keepActive) this.resize();
    return url;
  }
}
