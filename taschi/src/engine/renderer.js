// Renderer setup, graphics profiles, adaptive resolution, profiling and
// resource disposal for map changes.
import { THREE } from './three.js';

// Performance budget (documented in docs/ARCHITEKTUR.md):
// mobile target 30–60 fps, ≤ 150 draw calls, ≤ 350k triangles per frame.
export const PROFILES = {
  low: { label: 'Leistung', pixelRatio: 1.0, minScale: 0.6, shadows: 0, drawDistance: 85, lodDistance: 26, vegetation: 0.5, tufts: 0.35, particles: 0.4, outlines: false, terrainRes: 1024, targetFps: 30 },
  medium: { label: 'Ausgewogen', pixelRatio: 1.5, minScale: 0.7, shadows: 1024, drawDistance: 120, lodDistance: 40, vegetation: 0.8, tufts: 0.7, particles: 0.7, outlines: true, terrainRes: 1024, targetFps: 45 },
  high: { label: 'Qualität', pixelRatio: 2.0, minScale: 0.85, shadows: 2048, drawDistance: 170, lodDistance: 60, vegetation: 1, tufts: 1, particles: 1, outlines: true, terrainRes: 2048, targetFps: 55 }
};

export function detectProfile() {
  const coarse = matchMedia('(pointer:coarse)').matches;
  const mem = navigator.deviceMemory || 4, cores = navigator.hardwareConcurrency || 4;
  if (coarse && (mem <= 3 || cores <= 4)) return 'low';
  if (coarse) return 'medium';
  return mem >= 8 && cores >= 8 ? 'high' : 'medium';
}

export class Renderer {
  constructor(canvas, profileName) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: profileName !== 'low', powerPreference: 'high-performance', alpha: false });
    // Stylised pipeline: colours are authored in display space, so the
    // renderer outputs linearly without tone mapping (bright, saturated look).
    this.renderer.outputEncoding = THREE.LinearEncoding;
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(0x87b8d8);
    this.scale = 1; this.frameTimes = []; this.adaptT = 0; this.adaptive = true;
    this.setProfile(profileName);
    this.stats = { fps: 0, ms: 0, calls: 0, tris: 0, geos: 0, tex: 0, scale: 1 };
    this._acc = 0; this._frames = 0;
    addEventListener('resize', () => this.resize());
    screen.orientation?.addEventListener?.('change', () => setTimeout(() => this.resize(), 120));
  }
  setProfile(name) {
    this.profileName = PROFILES[name] ? name : 'medium';
    this.profile = PROFILES[this.profileName];
    this.scale = 1;
    this.renderer.shadowMap.enabled = this.profile.shadows > 0;
    this.resize();
  }
  resize() {
    const w = innerWidth, h = innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, this.profile.pixelRatio) * this.scale;
    this.renderer.setPixelRatio(Math.max(0.5, dpr));
    this.renderer.setSize(w, h, false);
    this.canvas.style.width = w + 'px'; this.canvas.style.height = h + 'px';
    this.onResize && this.onResize(w, h);
  }
  // Adaptive resolution: lower the render scale when frames take too long.
  adapt(dt) {
    this._acc += dt; this._frames++;
    if (this._acc >= 1) {
      this.stats.fps = Math.round(this._frames / this._acc);
      this.stats.ms = +(this._acc / this._frames * 1000).toFixed(1);
      this._acc = 0; this._frames = 0;
      if (this.adaptive && !document.hidden) {
        const target = this.profile.targetFps;
        if (this.stats.fps < target * 0.8 && this.scale > this.profile.minScale) { this.scale = Math.max(this.profile.minScale, this.scale - 0.1); this.resize(); }
        else if (this.stats.fps > target * 1.15 && this.scale < 1) { this.scale = Math.min(1, this.scale + 0.05); this.resize(); }
      }
      this.stats.scale = +this.scale.toFixed(2);
    }
  }
  render(scene, camera) {
    this.renderer.render(scene, camera);
    const info = this.renderer.info;
    this.stats.calls = info.render.calls; this.stats.tris = info.render.triangles; this.stats.geos = info.memory.geometries; this.stats.tex = info.memory.textures;
  }
}

// Disposes every geometry, material and texture below an object, except
// shared resources (flagged with userData.shared).
export function disposeTree(obj) {
  const mats = new Set(), geos = new Set(), texs = new Set();
  obj.traverse(o => {
    if (o.geometry && !o.geometry.userData?.shared) geos.add(o.geometry);
    const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
    for (const m of ms) {
      if (m.userData?.shared) continue;
      mats.add(m);
      for (const k of ['map', 'emissiveMap', 'alphaMap', 'normalMap']) if (m[k] && !m[k].userData?.shared) texs.add(m[k]);
    }
    if (o.isInstancedMesh && o.dispose) o.dispose();
  });
  geos.forEach(g => g.dispose()); mats.forEach(m => m.dispose()); texs.forEach(t => t.dispose());
  return { geometries: geos.size, materials: mats.size, textures: texs.size };
}
