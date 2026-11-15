// Winzflitzer 3D – Hilfsfunktionen: Mathe, Zufall, Geometrie-Bündelung, Canvas-Texturen
'use strict';
var WF = window.WF = window.WF || {};

WF.clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
WF.lerp = function (a, b, t) { return a + (b - a) * t; };
WF.angDiff = function (a, b) { var d = (b - a) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return d; };
WF.smooth = function (t) { t = WF.clamp(t, 0, 1); return t * t * (3 - 2 * t); };
WF.rng = function (seed) { var s = (seed >>> 0) || 1; return function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; };
WF.fmtTime = function (t) {
  if (!isFinite(t) || t <= 0) return '–:––.–';
  var m = Math.floor(t / 60), s = t - m * 60;
  return m + ':' + (s < 10 ? '0' : '') + s.toFixed(2);
};
WF.col = function (c) { return new THREE.Color(c); };

// Bündelt viele einfache Formen in EIN Mesh (Vertex-Farben) – wenige Draw-Calls, schont Handy-GPUs.
WF.Builder = function () { this.pos = []; this.nor = []; this.col = []; };
WF.Builder.prototype.add = function (geo, color, x, y, z, rx, ry, rz, sx, sy, sz) {
  var g = geo.index ? geo.toNonIndexed() : geo;
  var m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(rx || 0, ry || 0, rz || 0);
  q.setFromEuler(e);
  m.compose(new THREE.Vector3(x || 0, y || 0, z || 0), q, new THREE.Vector3(sx == null ? 1 : sx, sy == null ? (sx == null ? 1 : sx) : sy, sz == null ? (sx == null ? 1 : sx) : sz));
  this.addM(g, color, m);
  if (g !== geo) g.dispose();
  return this;
};
WF.Builder.prototype.addM = function (g, color, m) {
  var p = g.attributes.position, n = g.attributes.normal, c = new THREE.Color(color);
  var nm = new THREE.Matrix3().getNormalMatrix(m), v = new THREE.Vector3();
  var vc = g.attributes.color;
  for (var i = 0; i < p.count; i++) {
    v.set(p.getX(i), p.getY(i), p.getZ(i)).applyMatrix4(m); this.pos.push(v.x, v.y, v.z);
    v.set(n.getX(i), n.getY(i), n.getZ(i)).applyMatrix3(nm).normalize(); this.nor.push(v.x, v.y, v.z);
    if (vc) this.col.push(vc.getX(i) * c.r, vc.getY(i) * c.g, vc.getZ(i) * c.b); else this.col.push(c.r, c.g, c.b);
  }
};
WF.Builder.prototype.geometry = function () {
  var g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(this.nor, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(this.col, 3));
  g.computeBoundingSphere();
  return g;
};
WF.Builder.prototype.mesh = function (mat) {
  return new THREE.Mesh(this.geometry(), mat || WF.vcMat());
};
WF.Builder.prototype.empty = function () { return this.pos.length === 0; };

var _vcMat = null;
WF.vcMat = function () { return _vcMat || (_vcMat = new THREE.MeshLambertMaterial({ vertexColors: true })); };

// Geometrie-Cache für wiederkehrende Grundformen
var GC = {};
WF.G = {
  box: function () { return GC.box || (GC.box = new THREE.BoxGeometry(1, 1, 1)); },
  cyl: function (seg) { seg = seg || 12; var k = 'cyl' + seg; return GC[k] || (GC[k] = new THREE.CylinderGeometry(0.5, 0.5, 1, seg)); },
  cone: function (seg) { seg = seg || 12; var k = 'cone' + seg; return GC[k] || (GC[k] = new THREE.ConeGeometry(0.5, 1, seg)); },
  sph: function (seg) { seg = seg || 10; var k = 'sph' + seg; return GC[k] || (GC[k] = new THREE.SphereGeometry(0.5, seg, Math.max(6, seg * 0.7 | 0))); },
  hex: function () { return GC.hex || (GC.hex = new THREE.CylinderGeometry(0.5, 0.5, 1, 6)); },
  torus: function (t) { var k = 'tor' + t; return GC[k] || (GC[k] = new THREE.TorusGeometry(0.5, t || 0.12, 6, 18)); },
  rbox: function (r) { // abgerundete Kiste (Toast, Radiergummi …)
    var k = 'rb' + r; if (GC[k]) return GC[k];
    var s = new THREE.Shape(), w = 0.5, h = 0.5; r = r || 0.15;
    s.moveTo(-w + r, -h); s.lineTo(w - r, -h); s.quadraticCurveTo(w, -h, w, -h + r); s.lineTo(w, h - r); s.quadraticCurveTo(w, h, w - r, h);
    s.lineTo(-w + r, h); s.quadraticCurveTo(-w, h, -w, h - r); s.lineTo(-w, -h + r); s.quadraticCurveTo(-w, -h, -w + r, -h);
    var g = new THREE.ExtrudeGeometry(s, { depth: 1, bevelEnabled: false, curveSegments: 3 });
    g.translate(0, 0, -0.5); g.rotateX(-Math.PI / 2);
    return (GC[k] = g);
  },
  lathe: function (key, pts, seg) {
    if (GC[key]) return GC[key];
    return (GC[key] = new THREE.LatheGeometry(pts.map(function (p) { return new THREE.Vector2(p[0], p[1]); }), seg || 16));
  }
};

// Canvas-Texturen (einmal erzeugt, klein, kachelbar)
var TC = {};
WF.tex = function (key, size, draw, rep) {
  if (TC[key]) return TC[key];
  var c = document.createElement('canvas'); c.width = c.height = size;
  var g = c.getContext('2d'); draw(g, size);
  var t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 2;
  if (rep) t.repeat.set(rep[0], rep[1]);
  return (TC[key] = t);
};
WF.noise = function (g, s, a, seed) {
  var r = WF.rng(seed || 7), d = g.getImageData(0, 0, s, s), p = d.data;
  for (var i = 0; i < p.length; i += 4) { var n = (r() - 0.5) * a; p[i] += n; p[i + 1] += n; p[i + 2] += n; }
  g.putImageData(d, 0, 0);
};

// runder, weicher Schatten (eine Textur für alle)
WF.shadowTex = function () {
  return WF.tex('shadow', 64, function (g, s) {
    var gr = g.createRadialGradient(s / 2, s / 2, 2, s / 2, s / 2, s / 2);
    gr.addColorStop(0, 'rgba(0,0,0,0.55)'); gr.addColorStop(0.6, 'rgba(0,0,0,0.3)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, s, s);
  });
};

WF.store = {
  get: function (k, d) { try { var v = localStorage.getItem('winzflitzer-' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set: function (k, v) { try { localStorage.setItem('winzflitzer-' + k, JSON.stringify(v)); } catch (e) {} }
};
