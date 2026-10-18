/* Royal Radio Match 3D – Bühne: EIN WebGL-Kontext für Brett und Funkhaus, Render-Schleife nur bei Bedarf,
 * Qualitätsstufen, Kontextverlust, Symbole (3D-Modelle als kleine Bilder für HUD und Menüs). */
(function (root) {
  'use strict';
  var RRM = root.RRM || (root.RRM = {});
  var T = root.THREE;

  var QUALITY = {
    low: { pr: 1, aa: false, particles: 24, phong: false },
    mid: { pr: 1.5, aa: true, particles: 60, phong: true },
    high: { pr: 2, aa: true, particles: 120, phong: true }
  };

  function autoQuality() {
    var cores = navigator.hardwareConcurrency || 4, mem = navigator.deviceMemory || 4, dpr = root.devicePixelRatio || 1;
    if (cores <= 4 || mem <= 2) return 'low';
    if (cores >= 8 && mem >= 6 && dpr <= 2.5) return 'high';
    return 'mid';
  }

  function Stage(canvas, opt) {
    this.canvas = canvas;
    this.opt = opt || {};
    this.view = null;
    this.wanted = true;     // nächster Frame nötig
    this.running = false;
    this.lost = false;
    this.slow = 0;
    this.reduced = false;
    this.icons = {};
  }

  Stage.prototype.init = function (quality) {
    if (!T) return 'Three.js konnte nicht geladen werden.';
    this.auto = !QUALITY[quality];
    this.qname = this.auto ? autoQuality() : quality;
    this.q = QUALITY[this.qname];
    try {
      this.renderer = new T.WebGLRenderer({ canvas: this.canvas, antialias: this.q.aa, alpha: true, powerPreference: 'default' });
    } catch (e) {
      try { this.renderer = new T.WebGLRenderer({ canvas: this.canvas, antialias: false, alpha: true }); } catch (e2) { return 'WebGL ist auf diesem Gerät nicht verfügbar.'; }
    }
    var r = this.renderer;
    r.setClearColor(0x000000, 0);
    r.setPixelRatio(Math.min(root.devicePixelRatio || 1, this.q.pr));
    var self = this;
    this.canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); self.lost = true; self.opt.onLost && self.opt.onLost(); }, false);
    this.canvas.addEventListener('webglcontextrestored', function () { self.lost = false; self.icons = {}; self.opt.onRestored && self.opt.onRestored(); self.kick(); }, false);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) self.kick(); });
    root.addEventListener('resize', function () { self.resize(); });
    this.resize();
    return null;
  };

  Stage.prototype.setQuality = function (quality, internal) {
    if (!internal) this.auto = !QUALITY[quality];
    this.qname = !QUALITY[quality] ? autoQuality() : quality;
    this.q = QUALITY[this.qname];
    if (this.renderer) { this.renderer.setPixelRatio(Math.min(root.devicePixelRatio || 1, this.q.pr)); this.resize(); }
    if (this.view && this.view.onQuality) this.view.onQuality(this.q);
  };

  Stage.prototype.resize = function () {
    if (!this.renderer) return;
    var w = this.canvas.clientWidth || root.innerWidth, h = this.canvas.clientHeight || root.innerHeight;
    if (w === this.w && h === this.h) { this.kick(); return; }
    this.w = w; this.h = h;
    this.renderer.setSize(w, h, false);
    if (this.view && this.view.resize) this.view.resize(w, h);
    this.kick();
  };

  Stage.prototype.show = function (view) {
    if (this.view && this.view !== view && this.view.hide) this.view.hide();
    this.view = view;
    if (!view && this.renderer) this.renderer.clear();
    if (view) { view.resize && view.resize(this.w, this.h); view.onQuality && view.onQuality(this.q); }
    this.kick();
  };

  // Rendern nur, solange eine Ansicht animiert (sonst steht die GPU still: akkuschonend)
  Stage.prototype.kick = function () {
    this.wanted = true;
    if (this.running || !this.renderer) return;
    this.running = true;
    var self = this, last = performance.now();
    function frame(now) {
      if (document.hidden || self.lost || !self.view) { self.running = false; return; }
      var dt = Math.min(0.05, (now - last) / 1000); last = now;
      var more = self.view.update ? self.view.update(dt, now) : false;
      if (more || self.wanted) {
        self.wanted = false;
        self.renderer.render(self.view.scene, self.view.camera);
        // Automatische Qualität: dauerhaft langsame Frames -> eine Stufe herunter
        if (self.auto && dt > 0.034) { if (++self.slow > 90 && self.qname !== 'low') { self.slow = 0; self.setQuality(self.qname === 'high' ? 'mid' : 'low', true); } }
        else if (self.slow > 0) self.slow--;
      }
      if (self.wanted || (more && more !== 'idle')) requestAnimationFrame(frame);
      else if (more === 'idle') setTimeout(function () { if (document.hidden) { self.running = false; return; } requestAnimationFrame(frame); }, 40);   // Leerlauf-Animation nur ~20 fps
      else self.running = false;
    }
    requestAnimationFrame(frame);
  };

  // 3D-Modell als kleines Bild (HUD-Ziele, Booster-Vorschau). Wird gecacht.
  // front: Ansicht von vorn wie auf dem Brett (Steine, Booster), sonst leicht von oben
  Stage.prototype.icon = function (key, geoFn, matFn, front) {
    if (this.icons[key]) return this.icons[key];
    if (!this.renderer || this.lost) return '';
    var S = 128, rt = new T.WebGLRenderTarget(S, S), sc = new T.Scene(), cam = new T.PerspectiveCamera(30, 1, 0.1, 20);
    sc.add(new T.HemisphereLight(0xffffff, 0x445566, 0.9));
    var dl = new T.DirectionalLight(0xffffff, 0.8); dl.position.set(1, 3, 2); sc.add(dl);
    var obj = geoFn();
    if (obj.isBufferGeometry) obj = new T.Mesh(obj, matFn ? matFn() : new T.MeshLambertMaterial({ vertexColors: true }));
    sc.add(obj);
    var box = new T.Box3().setFromObject(obj), c = box.getCenter(new T.Vector3()), sz = box.getSize(new T.Vector3()).length();
    if (front) cam.position.set(c.x, c.y + sz * 0.25, c.z + sz * 1.55); else cam.position.set(c.x, c.y + sz * 0.9, c.z + sz * 1.7);
    cam.lookAt(c);
    var r = this.renderer, old = r.getRenderTarget();
    r.setRenderTarget(rt); r.setClearColor(0x000000, 0); r.clear(); r.render(sc, cam);
    var px = new Uint8Array(S * S * 4); r.readRenderTargetPixels(rt, 0, 0, S, S, px);
    r.setRenderTarget(old);
    rt.dispose();
    var cv = document.createElement('canvas'); cv.width = cv.height = S;
    var g = cv.getContext('2d'), img = g.createImageData(S, S);
    for (var y = 0; y < S; y++) img.data.set(px.subarray((S - 1 - y) * S * 4, (S - y) * S * 4), y * S * 4);   // WebGL liefert Zeilen von unten
    g.putImageData(img, 0, 0);
    this.kick();
    return (this.icons[key] = cv.toDataURL('image/png'));
  };

  Stage.QUALITY = QUALITY;
  Stage.autoQuality = autoQuality;
  RRM.Stage = Stage;
})(typeof window !== 'undefined' ? window : globalThis);
