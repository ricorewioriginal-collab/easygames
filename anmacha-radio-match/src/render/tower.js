/* Royal Radio Match 3D – das Funkhaus als 3D-Turm: zehn Etagen, jede Ausbaustufe zeigt sichtbare Requisiten.
 * Nicht ausgebaute Etagen stehen als Rohbau mit Gerüst da. Nutzt denselben WebGL-Kontext wie das Brett. */
(function (root) {
  'use strict';
  var RRM = root.RRM || (root.RRM = {});
  var T = root.THREE;

  var FLOOR_H = 1.1, WIDTH = 3.2, DEPTH = 2.2;

  function Tower(stage) {
    this.stage = stage;
    this.scene = new T.Scene();
    this.camera = new T.PerspectiveCamera(38, 1, 0.5, 120);
    this.scene.add(new T.HemisphereLight(0xffffff, 0x2a3350, 0.85));
    var d = new T.DirectionalLight(0xffffff, 0.8); d.position.set(5, 10, 8); this.scene.add(d);
    this.mat = new T.MeshLambertMaterial({ vertexColors: true });
    this.group = new T.Group(); this.scene.add(this.group);
    this.key = null;
    this.t = 0; this.spinT = 0;
    this.reduced = false;
    this.focus = -1;
  }
  var P = Tower.prototype;

  function M() { return RRM.Models.M.apply(null, arguments); }
  var box = function (w, h, d) { return new T.BoxGeometry(w, h, d); };
  var cyl = function (a, b, h, s) { return new T.CylinderGeometry(a, b, h, s || 12); };
  var sph = function (r) { return new T.SphereGeometry(r, 12, 8); };

  // Requisiten je Etage (lokale Koordinaten: Boden y=0, Front +z)
  var PROPS = [
    function mixer() { var p = [{ g: box(1.6, 0.35, 0.6), c: 0x2b2f3a, m: M(0, 0.18, 0.2) }, { g: box(1.6, 0.04, 0.6), c: 0x44495a, m: M(0, 0.37, 0.2, -0.25) }];
      for (var i = 0; i < 8; i++) p.push({ g: box(0.08, 0.06, 0.16), c: [0xffc531, 0x22d6c8, 0xff4a4a, 0x41d65a][i % 4], m: M(-0.7 + i * 0.2, 0.42, 0.2 + (i % 3) * 0.05, -0.25) });
      p.push({ g: box(0.5, 0.35, 0.05), c: 0x3f86ff, m: M(0, 0.75, -0.2) }); return p; },
    function booth() { return [{ g: box(1.2, 0.95, 0.9), c: 0x9fd8ff, m: M(0.4, 0.48, -0.1) }, { g: cyl(0.03, 0.03, 0.7), c: 0x333333, m: M(-0.7, 0.35, 0.2) }, { g: sph(0.13), c: 0xffc531, m: M(-0.7, 0.78, 0.2) }, { g: box(0.5, 0.05, 0.4), c: 0x553322, m: M(0.4, 0.3, 0.2) }]; },
    function lobby() { return [{ g: box(1.2, 0.3, 0.5), c: 0xc0392b, m: M(-0.3, 0.15, 0.1) }, { g: box(1.2, 0.4, 0.15), c: 0xa93226, m: M(-0.3, 0.4, -0.12) }, { g: cyl(0.15, 0.12, 0.3), c: 0x8a5a33, m: M(0.9, 0.15, 0.2) }, { g: sph(0.3), c: 0x41d65a, m: M(0.9, 0.55, 0.2) }, { g: box(0.6, 0.5, 0.05), c: 0xffd36b, m: M(0.3, 0.6, -0.4) }]; },
    function archive() { var p = [{ g: box(2.2, 0.9, 0.4), c: 0x5a3b22, m: M(0, 0.45, -0.35) }];
      for (var i = 0; i < 12; i++) p.push({ g: box(0.04, 0.32, 0.3), c: [0xa45cff, 0x1c1028, 0xff9326][i % 3], m: M(-0.95 + i * 0.17, 0.25 + (i % 2) * 0.4, -0.3) });
      p.push({ g: cyl(0.25, 0.25, 0.05, 20), c: 0x111111, m: M(0.6, 0.35, 0.35) }); return p; },
    function stage() { return [{ g: box(2.2, 0.2, 1), c: 0x2c2c2c, m: M(0, 0.1, 0) }, { g: box(0.4, 0.7, 0.4), c: 0x1b1b24, m: M(-0.9, 0.55, -0.1) }, { g: box(0.4, 0.7, 0.4), c: 0x1b1b24, m: M(0.9, 0.55, -0.1) }, { g: cyl(0.12, 0.12, 0.03), c: 0x777777, m: M(-0.9, 0.6, 0.11, Math.PI / 2) }, { g: cyl(0.12, 0.12, 0.03), c: 0x777777, m: M(0.9, 0.6, 0.11, Math.PI / 2) }, { g: box(0.08, 0.6, 0.08), c: 0xffc531, m: M(0, 0.5, 0.2) }]; },
    function mast() { return [{ g: cyl(0.06, 0.1, 1.0), c: 0xc8d0d8, m: M(1.25, 0.5, 0) }, { g: sph(0.12), c: 0xff4a4a, m: M(1.25, 1.05, 0) }, { g: box(0.9, 0.5, 0.5), c: 0x5b6470, m: M(-0.5, 0.25, -0.2) }, { g: cyl(0.3, 0.3, 0.05, 16), c: 0xe6ebf0, m: M(-0.5, 0.75, 0, 0.9) }]; },
    function podcast() { return [{ g: cyl(0.55, 0.55, 0.06, 18), c: 0x8a5a33, m: M(0, 0.45, 0) }, { g: cyl(0.06, 0.06, 0.45), c: 0x333333, m: M(0, 0.22, 0) }, { g: sph(0.1), c: 0x22d6c8, m: M(-0.3, 0.62, 0.1) }, { g: sph(0.1), c: 0xff4a4a, m: M(0.3, 0.62, 0.1) }, { g: box(0.4, 0.4, 0.4), c: 0x3f86ff, m: M(-1.0, 0.2, 0) }, { g: box(0.4, 0.4, 0.4), c: 0xff9326, m: M(1.0, 0.2, 0) }]; },
    function openair() { var p = [{ g: box(2.6, 0.08, 0.5), c: 0x777777, m: M(0, 0.04, 0.95) }];
      for (var i = 0; i < 6; i++) p.push({ g: sph(0.07), c: [0xff4a4a, 0xffc531, 0x41d65a, 0x3f86ff, 0xa45cff, 0xff9326][i], m: M(-1.1 + i * 0.44, 0.85, 0.9) });
      p.push({ g: box(2.4, 0.03, 0.03), c: 0x222222, m: M(0, 0.9, 0.9) }); return p; },
    function night() { return [{ g: box(2.0, 0.06, 0.06), c: 0xff3fae, m: M(0, 0.85, -0.35) }, { g: box(2.0, 0.06, 0.06), c: 0x22d6c8, m: M(0, 0.65, -0.35) }, { g: box(1.2, 0.35, 0.55), c: 0x1a1236, m: M(0, 0.18, 0.15) }, { g: box(0.3, 0.2, 0.05), c: 0xa45cff, m: M(0, 0.48, 0.2) }]; },
    function vip() { return [{ g: box(1.4, 0.3, 0.55), c: 0xd4af37, m: M(0, 0.15, 0) }, { g: box(1.4, 0.45, 0.15), c: 0xb8962e, m: M(0, 0.45, -0.22) }, { g: cyl(0.05, 0.05, 0.6), c: 0xffd36b, m: M(-1.0, 0.3, 0.3) }, { g: cyl(0.05, 0.05, 0.6), c: 0xffd36b, m: M(1.0, 0.3, 0.3) }, { g: box(2.1, 0.04, 0.04), c: 0xff3f6c, m: M(0, 0.55, 0.3) }]; }
  ];

  P.build = function (owned) {
    var key = owned.slice().sort().join(',');
    if (key === this.key) return;
    this.key = key;
    while (this.group.children.length) { var o = this.group.children.pop(); o.geometry && o.geometry.dispose(); }
    var parts = [], W = RRM.WORLDS, n = RRM.TOWER.length;
    parts.push({ g: box(WIDTH + 1.4, 0.3, DEPTH + 1.4), c: 0x3b4252, m: M(0, -0.15, 0) });
    for (var f = 0; f < n; f++) {
      var y = f * FLOOR_H, has = owned.indexOf(f) >= 0, acc = W[f].accent, base = has ? acc : 0x6b7280;
      // Boden + Rückwand + Seitenwände
      parts.push({ g: box(WIDTH, 0.1, DEPTH), c: has ? 0xe9dfcf : 0x8d8d8d, m: M(0, y + 0.05, 0) });
      parts.push({ g: box(WIDTH, FLOOR_H - 0.1, 0.1), c: has ? new T.Color(W[f].sky).lerp(new T.Color(0xffffff), 0.25).getHex() : 0x9aa0a6, m: M(0, y + FLOOR_H / 2, -DEPTH / 2) });
      parts.push({ g: box(0.12, FLOOR_H, DEPTH), c: base, m: M(-WIDTH / 2, y + FLOOR_H / 2, 0) });
      parts.push({ g: box(0.12, FLOOR_H, DEPTH), c: base, m: M(WIDTH / 2, y + FLOOR_H / 2, 0) });
      parts.push({ g: box(WIDTH + 0.12, 0.08, 0.12), c: base, m: M(0, y + FLOOR_H - 0.04, DEPTH / 2) });
      if (has) {
        PROPS[f]().forEach(function (p) { p.m.premultiply(new T.Matrix4().makeTranslation(0, y + 0.1, 0)); parts.push(p); });
        parts.push({ g: box(0.5, 0.18, 0.04), c: acc, m: M(0, y + FLOOR_H - 0.2, DEPTH / 2 + 0.05) });   // Schild
      } else {
        // Rohbau: Gerüst-Diagonalen und Pylonen
        parts.push({ g: box(0.05, 1.4, 0.05), c: 0xffb000, m: M(-0.6, y + 0.55, DEPTH / 2 - 0.1, 0, 0, 0.75) });
        parts.push({ g: box(0.05, 1.4, 0.05), c: 0xffb000, m: M(0.6, y + 0.55, DEPTH / 2 - 0.1, 0, 0, -0.75) });
        parts.push({ g: new T.ConeGeometry(0.1, 0.25, 8), c: 0xff6a00, m: M(0.9, y + 0.23, 0.4) });
      }
    }
    var top = n * FLOOR_H, done = owned.length === n;
    parts.push({ g: box(WIDTH + 0.3, 0.16, DEPTH + 0.3), c: 0x2a2f3a, m: M(0, top + 0.08, 0) });
    parts.push({ g: cyl(0.06, 0.12, 2.4, 8), c: 0xd0d5dc, m: M(0, top + 1.3, 0) });
    parts.push({ g: sph(0.16), c: done ? 0xffd36b : 0xff4a4a, m: M(0, top + 2.55, 0) });
    if (done) parts.push({ g: new T.TorusGeometry(0.35, 0.06, 6, 18), c: 0xffd36b, m: M(0, top + 2.0, 0, Math.PI / 2) });
    var mesh = new T.Mesh(RRM.Models.merge(parts), this.mat);
    this.group.add(mesh);
    this.height = top + 2.8;
    this.fit();
    this.stage.kick();
  };

  P.resize = function (w, h) { this.vw = w; this.vh = h; this.fit(); };
  P.fit = function () {
    if (!this.vw || !this.height) return;
    var c = this.camera; c.aspect = this.vw / this.vh;
    var hh = this.height, fov = c.fov * Math.PI / 180;
    var dV = (hh * 0.62) / Math.tan(fov / 2), dH = ((WIDTH + 2) * 0.62) / (Math.tan(fov / 2) * c.aspect);
    this.dist = Math.max(dV, dH, 6);
    c.updateProjectionMatrix();
    this.place();
  };
  P.place = function () {
    if (!this.dist) return;
    var c = this.camera, a = this.reduced ? 0.45 : 0.45 + Math.sin(this.spinT * 0.25) * 0.35, cy = this.height * 0.45;
    if (this.focus >= 0) cy = this.focus * FLOOR_H + 0.6;
    var d = this.focus >= 0 ? Math.min(this.dist, 7) : this.dist;
    c.position.set(Math.sin(a) * d, cy + d * 0.18, Math.cos(a) * d);
    c.lookAt(0, cy, 0);
  };
  P.setFocus = function (f) { this.focus = f; this.place(); this.stage.kick(); };
  P.update = function (dt) {
    if (this.reduced) return false;
    this.spinT += dt; this.place();
    return 'idle';
  };
  P.hide = function () {};

  RRM.Tower = Tower;
})(typeof window !== 'undefined' ? window : globalThis);
