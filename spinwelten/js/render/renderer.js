/* Spinwelten 3D – gemeinsamer WebGL-Renderer: Qualitätsstufen, dynamische Auflösung, Kontextverlust, Pause im Hintergrund.
 * Es gibt genau einen WebGLRenderer. Pro Bild wird eine Hauptszene und optional die Maschinen-Überlagerung gezeichnet. */
(function (SW) {
  'use strict';
  const T = () => globalThis.THREE;
  const PRESETS = {
    low: { pr: 1, shadow: false, shadowSize: 512, decor: 0.45, aa: false, minScale: 0.6 },
    medium: { pr: 1.5, shadow: true, shadowSize: 1024, decor: 0.75, aa: false, minScale: 0.7 },
    high: { pr: 2, shadow: true, shadowSize: 2048, decor: 1, aa: true, minScale: 0.75 }
  };
  function guessAuto() {
    const n = navigator, mem = n.deviceMemory || 4, cores = n.hardwareConcurrency || 4;
    const small = Math.min(screen.width, screen.height) < 500;
    if (mem <= 2 || cores <= 2) return 'low';
    if (small || mem <= 4) return 'medium';
    return 'high';
  }
  class Renderer {
    constructor(canvas, quality) {
      this.canvas = canvas; this.setting = quality || 'auto';
      this.level = this.setting === 'auto' ? guessAuto() : this.setting;
      this.q = Object.assign({}, PRESETS[this.level]);
      this.scale = 1; this.lost = false; this.paused = false; this.frames = 0; this.acc = 0; this.slow = 0;
      this.main = null; this.overlay = null; this.onFrame = null; this.onLost = null; this.onRestore = null;
      this.make();
      canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); this.lost = true; if (this.onLost) this.onLost(); }, false);
      canvas.addEventListener('webglcontextrestored', () => { this.lost = false; this.make(); if (this.onRestore) this.onRestore(); }, false);
      document.addEventListener('visibilitychange', () => { this.paused = document.hidden; if (!this.paused) this.last = 0; });
      this.loop = this.loop.bind(this); this.last = 0; this.t = 0;
    }
    make() {
      const THREE = T();
      if (this.gl) { try { this.gl.dispose(); } catch (e) { /* alt */ } }
      this.gl = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: this.q.aa, alpha: false, powerPreference: this.level === 'low' ? 'low-power' : 'high-performance' });
      this.gl.shadowMap.enabled = this.q.shadow; this.gl.shadowMap.type = THREE.PCFSoftShadowMap;
      this.gl.autoClear = false;
      this.resize();
    }
    setQuality(setting) {
      this.setting = setting; const lv = setting === 'auto' ? guessAuto() : setting;
      if (lv === this.level && this.gl) return false;
      const aaChanged = PRESETS[lv].aa !== this.q.aa;
      this.level = lv; this.q = Object.assign({}, PRESETS[lv]); this.scale = 1;
      if (aaChanged) this.make(); else { this.gl.shadowMap.enabled = this.q.shadow; this.resize(); }
      return true; // Szenen müssen neu geladen werden (Deko-Dichte, Schatten)
    }
    resize() {
      const w = Math.max(1, this.canvas.clientWidth || innerWidth), h = Math.max(1, this.canvas.clientHeight || innerHeight);
      const pr = Math.min(devicePixelRatio || 1, this.q.pr) * this.scale;
      this.gl.setPixelRatio(pr); this.gl.setSize(w, h, false);
      this.w = w; this.h = h;
      if (this.main && this.main.resize) this.main.resize(w, h);
      if (this.overlay && this.overlay.resize) this.overlay.resize(w, h);
    }
    // Dynamische Auflösung: hält ungefähr 50+ fps, ohne zu flackern
    adapt(dt) {
      this.acc += dt; this.frames++;
      if (this.acc < 2) return;
      const fps = this.frames / this.acc; this.acc = 0; this.frames = 0;
      let s = this.scale;
      if (fps < 42 && s > this.q.minScale) s = Math.max(this.q.minScale, s - 0.1);
      else if (fps > 57 && s < 1) s = Math.min(1, s + 0.05);
      if (fps < 30) this.slow++; else this.slow = 0;
      if (this.setting === 'auto' && this.slow >= 3 && this.level !== 'low') {
        this.slow = 0; const lv = this.level === 'high' ? 'medium' : 'low';
        this.level = lv; this.q = Object.assign({}, PRESETS[lv]); this.gl.shadowMap.enabled = this.q.shadow; s = 1;
        if (this.onDowngrade) this.onDowngrade(lv);
      }
      if (s !== this.scale) { this.scale = s; this.resize(); }
    }
    start() { if (!this.running) { this.running = true; requestAnimationFrame(this.loop); } }
    loop(ts) {
      if (!this.running) return;
      requestAnimationFrame(this.loop);
      if (this.paused || this.lost) return;
      const dt = this.last ? Math.min(0.1, (ts - this.last) / 1000) : 0.016; this.last = ts; this.t += dt;
      if (this.onFrame) this.onFrame(dt, this.t);
      this.draw(dt);
      this.adapt(dt);
    }
    draw(dt) {
      const gl = this.gl; gl.clear(true, true, true);
      if (this.main) { this.main.update(dt, this.t); gl.render(this.main.scene, this.main.camera); }
      if (this.overlay && this.overlay.visible !== false) { gl.clearDepth(); this.overlay.update(dt, this.t); gl.render(this.overlay.scene, this.overlay.camera); }
    }
    ndc(x, y) { const r = this.canvas.getBoundingClientRect(); return new (T().Vector2)(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1); }
    info() { const i = this.gl.info; return { calls: i.render.calls, tris: i.render.triangles, geos: i.memory.geometries, tex: i.memory.textures, level: this.level, scale: this.scale }; }
  }
  SW.Renderer = Renderer; SW.QUALITY = PRESETS; SW.guessQuality = guessAuto;
})(globalThis.SW = globalThis.SW || {});
