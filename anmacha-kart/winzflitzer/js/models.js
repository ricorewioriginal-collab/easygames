// Winzflitzer 3D – Fahrzeugmodelle (Low-Poly, je Fahrzeug 1–2 Draw-Calls), Partikel
'use strict';
var WF = window.WF = window.WF || {};

(function () {
  var G = WF.G;
  function wheel(b, x, y, z, r, w) { b.add(G.cyl(10), '#1d1d1f', x, y, z, 0, 0, Math.PI / 2, r * 2, w, r * 2); b.add(G.cyl(8), '#c8ccd2', x + (x > 0 ? 0.01 : -0.01), y, z, 0, 0, Math.PI / 2, r * 1.1, w + 0.02, r * 1.1); }
  function shade(c, k) { var o = new THREE.Color(c); o.multiplyScalar(k); return o; }

  var BUILD = {
    sport: function (b, c) {
      b.add(G.box(), c, 0, 0.3, 0, 0, 0, 0, 0.82, 0.28, 1.5);
      b.add(G.box(), c, 0, 0.28, 0.72, 0.25, 0, 0, 0.8, 0.18, 0.3);
      b.add(G.box(), '#1b2a3a', 0, 0.52, -0.08, 0, 0, 0, 0.62, 0.22, 0.62);
      b.add(G.box(), shade(c, 0.7), 0, 0.64, -0.12, 0, 0, 0, 0.58, 0.04, 0.5);
      b.add(G.box(), '#222', 0, 0.55, -0.72, 0, 0, 0, 0.84, 0.05, 0.16);
      b.add(G.box(), '#fff', 0, 0.45, 0.2, 0, 0, 0, 0.16, 0.02, 0.9);
      b.add(G.box(), '#ffe8a0', 0.28, 0.33, 0.76, 0, 0, 0, 0.16, 0.08, 0.02); b.add(G.box(), '#ffe8a0', -0.28, 0.33, 0.76, 0, 0, 0, 0.16, 0.08, 0.02);
      wheel(b, 0.43, 0.16, 0.48, 0.16, 0.14); wheel(b, -0.43, 0.16, 0.48, 0.16, 0.14); wheel(b, 0.43, 0.17, -0.48, 0.17, 0.16); wheel(b, -0.43, 0.17, -0.48, 0.17, 0.16);
    },
    formula: function (b, c) {
      b.add(G.box(), c, 0, 0.24, 0.1, 0, 0, 0, 0.34, 0.2, 1.5);
      b.add(G.box(), c, 0, 0.26, -0.3, 0, 0, 0, 0.7, 0.2, 0.6);
      b.add(G.box(), shade(c, 0.75), 0, 0.2, 0.85, 0, 0, 0, 0.95, 0.04, 0.16);
      b.add(G.box(), '#222', 0, 0.5, -0.72, 0, 0, 0, 0.8, 0.04, 0.2); b.add(G.box(), '#222', 0, 0.38, -0.68, 0, 0, 0, 0.06, 0.24, 0.06);
      b.add(G.sph(10), '#fff', 0, 0.42, -0.12, 0, 0, 0, 0.24); b.add(G.box(), '#1b2a3a', 0, 0.43, -0.03, 0, 0, 0, 0.18, 0.06, 0.06);
      wheel(b, 0.46, 0.16, 0.55, 0.16, 0.16); wheel(b, -0.46, 0.16, 0.55, 0.16, 0.16); wheel(b, 0.47, 0.19, -0.5, 0.19, 0.22); wheel(b, -0.47, 0.19, -0.5, 0.19, 0.22);
    },
    boat: function (b, c) {
      b.add(G.box(), c, 0, 0.2, -0.15, 0, 0, 0, 0.8, 0.34, 1.1);
      b.add(new THREE.ConeGeometry(0.565, 0.7, 4), c, 0, 0.2, 0.75, Math.PI / 2, Math.PI / 4, 0, 1, 1, 0.48);
      b.add(G.box(), '#f5f5f5', 0, 0.38, -0.2, 0, 0, 0, 0.7, 0.04, 0.9);
      b.add(G.box(), '#9ad1ff', 0, 0.5, 0.12, -0.5, 0, 0, 0.62, 0.22, 0.04);
      b.add(G.box(), '#333', 0, 0.48, -0.78, 0, 0, 0, 0.26, 0.4, 0.18); b.add(G.box(), '#555', 0, 0.12, -0.84, 0, 0, 0, 0.08, 0.3, 0.08);
      b.add(G.box(), shade(c, 0.65), 0, 0.06, 0, 0, 0, 0, 0.82, 0.08, 1.2);
    },
    heli: function (b, c) {
      b.add(G.sph(12), c, 0, 0.45, 0.15, 0, 0, 0, 0.75, 0.62, 1.05);
      b.add(G.sph(10), '#9ad1ff', 0, 0.55, 0.42, 0, 0, 0, 0.6, 0.42, 0.5);
      b.add(G.box(), c, 0, 0.5, -0.65, 0, 0, 0, 0.14, 0.14, 0.95);
      b.add(G.box(), shade(c, 0.7), 0, 0.68, -1.08, 0, 0, 0, 0.05, 0.36, 0.2);
      b.add(G.box(), '#333', 0.28, 0.06, 0.1, 0, 0, 0, 0.05, 0.05, 0.9); b.add(G.box(), '#333', -0.28, 0.06, 0.1, 0, 0, 0, 0.05, 0.05, 0.9);
      b.add(G.box(), '#333', 0.28, 0.14, 0.1, 0, 0, 0, 0.04, 0.16, 0.04); b.add(G.box(), '#333', -0.28, 0.14, 0.1, 0, 0, 0, 0.04, 0.16, 0.04);
      b.add(G.cyl(8), '#333', 0, 0.86, 0.1, 0, 0, 0, 0.08, 0.16, 0.08);
    },
    offroad: function (b, c) {
      b.add(G.box(), c, 0, 0.45, 0, 0, 0, 0, 0.82, 0.36, 1.35);
      b.add(G.box(), '#1b2a3a', 0, 0.74, -0.08, 0, 0, 0, 0.7, 0.24, 0.6);
      b.add(G.box(), shade(c, 0.7), 0, 0.88, -0.08, 0, 0, 0, 0.72, 0.05, 0.62);
      b.add(G.box(), '#333', 0, 0.36, 0.72, 0, 0, 0, 0.84, 0.16, 0.1);
      b.add(G.box(), '#ffe8a0', 0.25, 0.5, 0.68, 0, 0, 0, 0.14, 0.08, 0.02); b.add(G.box(), '#ffe8a0', -0.25, 0.5, 0.68, 0, 0, 0, 0.14, 0.08, 0.02);
      b.add(G.cyl(10), '#222', 0, 0.55, -0.74, Math.PI / 2, 0, 0, 0.42, 0.12, 0.42);
      wheel(b, 0.46, 0.24, 0.45, 0.24, 0.2); wheel(b, -0.46, 0.24, 0.45, 0.24, 0.2); wheel(b, 0.46, 0.24, -0.45, 0.24, 0.2); wheel(b, -0.46, 0.24, -0.45, 0.24, 0.2);
    },
    mini: function (b, c) {
      b.add(G.sph(14), c, 0, 0.36, -0.05, 0, 0, 0, 0.78, 0.5, 1.15);
      b.add(G.sph(12), '#9ad1ff', 0, 0.58, 0.12, 0, 0, 0, 0.5, 0.36, 0.5);
      b.add(G.box(), '#fff', 0, 0.62, -0.18, 0, 0, 0, 0.1, 0.06, 0.4);
      wheel(b, 0.36, 0.14, 0.38, 0.14, 0.12); wheel(b, -0.36, 0.14, 0.38, 0.14, 0.12); wheel(b, 0.36, 0.14, -0.38, 0.14, 0.12); wheel(b, -0.36, 0.14, -0.38, 0.14, 0.12);
    },
    tank: function (b, c) {
      b.add(G.box(), c, 0, 0.32, 0, 0, 0, 0, 0.76, 0.26, 1.35);
      b.add(G.box(), '#2b2b2b', 0.45, 0.2, 0, 0, 0, 0, 0.22, 0.32, 1.45); b.add(G.box(), '#2b2b2b', -0.45, 0.2, 0, 0, 0, 0, 0.22, 0.32, 1.45);
      for (var i = 0; i < 5; i++) { b.add(G.cyl(8), '#555', 0.57, 0.16, -0.55 + i * 0.27, 0, 0, Math.PI / 2, 0.2, 0.02, 0.2); b.add(G.cyl(8), '#555', -0.57, 0.16, -0.55 + i * 0.27, 0, 0, Math.PI / 2, 0.2, 0.02, 0.2); }
    },
    monster: function (b, c) {
      b.add(G.box(), c, 0, 0.82, 0.05, 0, 0, 0, 0.78, 0.3, 1.35);
      b.add(G.box(), '#1b2a3a', 0, 1.08, 0.08, 0, 0, 0, 0.68, 0.24, 0.52);
      b.add(G.box(), shade(c, 0.75), 0, 1.22, 0.08, 0, 0, 0, 0.7, 0.05, 0.54);
      b.add(G.box(), shade(c, 0.6), 0, 0.98, -0.45, 0, 0, 0, 0.78, 0.04, 0.45);
      b.add(G.box(), '#444', 0, 0.55, 0, 0, 0, 0, 0.3, 0.12, 1.1);
      b.add(G.box(), '#ffe8a0', 0, 1.28, 0.3, 0, 0, 0, 0.5, 0.06, 0.06);
      wheel(b, 0.5, 0.4, 0.48, 0.4, 0.34); wheel(b, -0.5, 0.4, 0.48, 0.4, 0.34); wheel(b, 0.5, 0.4, -0.48, 0.4, 0.34); wheel(b, -0.5, 0.4, -0.48, 0.4, 0.34);
    }
  };

  var shadowMat = null;
  // Fahrzeug-Gruppe: g.body (dreht/neigt), g.rotor (Hubschrauber), g.turret (Panzer), g.shadow (Bodenschatten)
  WF.makeVehicle = function (type, color) {
    var g = new THREE.Group(), body = new THREE.Group(), b = new WF.Builder();
    BUILD[type](b, color);
    body.add(b.mesh()); g.add(body); g.body = body;
    if (type === 'heli') {
      var rb = new WF.Builder();
      rb.add(G.box(), '#2b2b2b', 0, 0, 0, 0, 0, 0, 2.3, 0.03, 0.12); rb.add(G.box(), '#2b2b2b', 0, 0, 0, 0, Math.PI / 2, 0, 2.3, 0.03, 0.12);
      var rotor = rb.mesh(); rotor.position.set(0, 0.95, 0.1); body.add(rotor); g.rotor = rotor;
      var tb = new WF.Builder(); tb.add(G.box(), '#2b2b2b', 0, 0, 0, 0, 0, 0, 0.03, 0.5, 0.08);
      var tr = tb.mesh(); tr.position.set(0.09, 0.68, -1.08); body.add(tr); g.tail = tr;
    }
    if (type === 'tank') {
      var t = new WF.Builder();
      t.add(G.cyl(12), shade(color, 0.8), 0, 0, 0, 0, 0, 0, 0.6, 0.22, 0.6);
      t.add(G.cyl(8), '#333', 0, 0.02, 0.45, Math.PI / 2, 0, 0, 0.1, 0.7, 0.1);
      t.add(G.sph(8), '#fff', 0, 0.14, -0.1, 0, 0, 0, 0.16);
      var tur = t.mesh(); tur.position.set(0, 0.55, -0.05); body.add(tur); g.turret = tur;
    }
    if (!shadowMat) shadowMat = new THREE.MeshBasicMaterial({ map: WF.shadowTex(), transparent: true, depthWrite: false });
    var sh = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.0), shadowMat); sh.rotation.x = -Math.PI / 2; sh.renderOrder = 4; g.shadow = sh;
    return g;
  };

  // ---------- Partikel: ein InstancedMesh für Staub, Wasser, Funken, Rauch
  WF.FX = function (scene, max) {
    this.max = max; this.n = 0; this.list = [];
    var geo = new THREE.IcosahedronGeometry(0.5, 0);
    this.mesh = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({ color: 0xffffff }), max);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;
    var m = new THREE.Matrix4().makeScale(0, 0, 0), c = new THREE.Color(1, 1, 1);
    for (var i = 0; i < max; i++) { this.mesh.setMatrixAt(i, m); this.mesh.setColorAt(i, c); this.list.push({ life: 0 }); }
    scene.add(this.mesh);
    this._m = new THREE.Matrix4(); this._c = new THREE.Color(); this.cursor = 0;
  };
  WF.FX.prototype.spawn = function (x, y, z, vx, vy, vz, size, life, col, grav) {
    if (!this.max) return;
    var idx = this.cursor, p = this.list[idx]; this.cursor = (idx + 1) % this.max;
    p.x = x; p.y = y; p.z = z; p.vx = vx; p.vy = vy; p.vz = vz; p.s = size; p.life = p.max = life; p.g = grav || 0;
    this.mesh.setColorAt(idx, this._c.set(col)); this.mesh.instanceColor.needsUpdate = true;
  };
  WF.FX.prototype.burst = function (x, y, z, n, spd, size, life, col, grav) {
    for (var i = 0; i < n; i++) { var a = Math.random() * 6.28, s = spd * (0.4 + Math.random() * 0.6); this.spawn(x, y, z, Math.cos(a) * s, spd * (0.3 + Math.random()), Math.sin(a) * s, size * (0.6 + Math.random() * 0.6), life * (0.6 + Math.random() * 0.6), col, grav); }
  };
  WF.FX.prototype.update = function (dt) {
    var any = false, m = this._m;
    for (var i = 0; i < this.max; i++) {
      var p = this.list[i]; if (p.life <= 0) { if (p.was) { m.makeScale(0, 0, 0); this.mesh.setMatrixAt(i, m); p.was = false; any = true; } continue; }
      p.life -= dt; p.vy -= p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.vx *= 0.96; p.vz *= 0.96;
      var k = p.life / p.max, s = p.s * (k < 0.3 ? k / 0.3 : 1) * (1.3 - k * 0.3);
      m.makeScale(s, s, s); m.setPosition(p.x, p.y, p.z); this.mesh.setMatrixAt(i, m); p.was = true; any = true;
    }
    if (any) this.mesh.instanceMatrix.needsUpdate = true;
  };
})();
