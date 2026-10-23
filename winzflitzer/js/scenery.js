// Winzflitzer 3D – Welten bauen: Tisch/Wanne/Rasen, Strecke, Deko, Zonen, Turbo-Streifen
'use strict';
var WF = window.WF = window.WF || {};

(function () {
  var G = WF.G;

  // ---------- Texturen
  function tGingham() {
    return WF.tex('gingham', 128, function (g, s) {
      g.fillStyle = '#fbf7f0'; g.fillRect(0, 0, s, s);
      g.fillStyle = 'rgba(214,52,64,0.32)'; g.fillRect(0, 0, s / 2, s); g.fillRect(0, 0, s, s / 2);
      g.fillStyle = 'rgba(214,52,64,0.28)'; g.fillRect(0, 0, s / 2, s / 2);
      WF.noise(g, s, 14, 3);
    });
  }
  function tWood(key, base, line) {
    return WF.tex(key, 256, function (g, s) {
      g.fillStyle = base; g.fillRect(0, 0, s, s);
      var r = WF.rng(key.length * 31);
      for (var i = 0; i < 46; i++) {
        g.strokeStyle = line; g.globalAlpha = 0.12 + r() * 0.2; g.lineWidth = 1 + r() * 3;
        var y = r() * s; g.beginPath(); g.moveTo(0, y);
        for (var x = 0; x <= s; x += 16) g.lineTo(x, y + Math.sin(x * 0.03 + i) * 4);
        g.stroke();
      }
      g.globalAlpha = 1; WF.noise(g, s, 10, 5);
    });
  }
  function tFlat(key, base, amt, dots) {
    return WF.tex(key, 128, function (g, s) {
      g.fillStyle = base; g.fillRect(0, 0, s, s); WF.noise(g, s, amt, key.length);
      if (dots) { var r = WF.rng(9); g.fillStyle = dots; for (var i = 0; i < 160; i++) g.fillRect(r() * s, r() * s, 1 + r() * 2, 1 + r() * 2); }
    });
  }
  function tWater() {
    return WF.tex('water', 256, function (g, s) {
      g.fillStyle = '#4fb6e0'; g.fillRect(0, 0, s, s);
      var r = WF.rng(4);
      for (var i = 0; i < 70; i++) {
        g.strokeStyle = 'rgba(255,255,255,' + (0.12 + r() * 0.25) + ')'; g.lineWidth = 1.5 + r() * 2;
        var x = r() * s, y = r() * s, w = 10 + r() * 30;
        g.beginPath(); g.ellipse(x, y, w, w * 0.35, r() * 0.5, 0, Math.PI); g.stroke();
      }
    });
  }
  function tGrass() {
    return WF.tex('grass', 128, function (g, s) {
      g.fillStyle = '#5cb85c'; g.fillRect(0, 0, s, s);
      var r = WF.rng(11);
      for (var i = 0; i < 900; i++) { g.fillStyle = r() < 0.5 ? 'rgba(40,120,40,0.5)' : 'rgba(140,210,110,0.45)'; g.fillRect(r() * s, r() * s, 1, 2 + r() * 4); }
    });
  }
  function tCarpet() {
    return WF.tex('carpet', 128, function (g, s) {
      g.fillStyle = '#7f8fe0'; g.fillRect(0, 0, s, s); WF.noise(g, s, 34, 8);
      g.strokeStyle = 'rgba(255,255,255,0.05)'; g.lineWidth = 4; g.strokeRect(10, 10, s - 20, s - 20);
    });
  }
  // Fahrbahn-Texturen: x = quer (0 … 1), y = längs
  var TRACK_TEX = {
    cloth: function (g, s) { g.fillStyle = '#ffffff'; g.fillRect(0, 0, s, s); WF.noise(g, s, 10, 2); g.fillStyle = '#3a7bd5'; g.fillRect(4, 0, 6, s); g.fillRect(s - 10, 0, 6, s);
      g.fillStyle = '#fff'; for (var y = 0; y < s; y += 16) { g.fillRect(4, y, 6, 6); g.fillRect(s - 10, y, 6, 6); } },
    paper: function (g, s) { g.fillStyle = '#fbfbf5'; g.fillRect(0, 0, s, s); g.fillStyle = '#9cc3ef'; for (var x = 14; x < s; x += 14) g.fillRect(x, 0, 1.5, s);
      g.fillStyle = '#ef6f6f'; g.fillRect(8, 0, 2, s); g.fillStyle = '#333'; g.fillRect(0, 0, 4, s); g.fillRect(s - 4, 0, 4, s); },
    dirt: function (g, s) { g.fillStyle = '#9b7653'; g.fillRect(0, 0, s, s); WF.noise(g, s, 40, 6); g.fillStyle = 'rgba(255,255,255,0.7)'; for (var y = 0; y < s; y += 32) { g.fillRect(2, y, 5, 14); g.fillRect(s - 7, y, 5, 14); } },
    tread: function (g, s) { g.fillStyle = '#cdb070'; g.fillRect(0, 0, s, s); WF.noise(g, s, 26, 7); g.fillStyle = 'rgba(110,80,40,0.35)';
      for (var y = 0; y < s; y += 8) { g.fillRect(s * 0.3, y, 10, 4); g.fillRect(s * 0.62, y + 4, 10, 4); } g.fillStyle = 'rgba(120,80,40,0.6)'; g.fillRect(0, 0, 4, s); g.fillRect(s - 4, 0, 4, s); },
    felt: function (g, s) { g.fillStyle = '#26a05a'; g.fillRect(0, 0, s, s); WF.noise(g, s, 12, 3); g.fillStyle = 'rgba(255,255,255,0.8)'; for (var y = 0; y < s; y += 16) { g.beginPath(); g.arc(6, y + 8, 3, 0, 7); g.arc(s - 6, y + 8, 3, 0, 7); g.fill(); } },
    tape: function (g, s) { g.fillStyle = '#ddc79a'; g.fillRect(0, 0, s, s); WF.noise(g, s, 14, 4); g.fillStyle = '#f2b705'; g.fillRect(0, 0, 10, s); g.fillRect(s - 10, 0, 10, s);
      g.fillStyle = '#222'; for (var y = 0; y < s; y += 32) { g.fillRect(0, y, 10, 16); g.fillRect(s - 10, y + 16, 10, 16); } },
    road: function (g, s) { g.fillStyle = '#55586a'; g.fillRect(0, 0, s, s); WF.noise(g, s, 18, 5); g.fillStyle = '#fff'; g.fillRect(5, 0, 5, s); g.fillRect(s - 10, 0, 5, s);
      g.fillStyle = '#ffd23f'; g.fillRect(s / 2 - 3, 0, 6, s / 2); }
  };

  // ---------- Deko-Bausteine (Maßstab wie die Kollision in track.js)
  function Ctx(b, x, z, y, rot, s) { this.b = b; this.m = new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rot, 0)), new THREE.Vector3(s, s, s)); }
  var _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), _s = new THREE.Vector3(), _m = new THREE.Matrix4();
  Ctx.prototype.add = function (geo, col, x, y, z, sx, sy, sz, rx, ry, rz) {
    _e.set(rx || 0, ry || 0, rz || 0); _q.setFromEuler(_e); _v.set(x, y, z); _s.set(sx, sy == null ? sx : sy, sz == null ? sx : sz);
    _m.compose(_v, _q, _s).premultiply(this.m);
    var g = geo.index ? geo.toNonIndexed() : geo; this.b.addM(g, col, _m); if (g !== geo) g.dispose();
    return this;
  };
  var bowlG = function () { return G.lathe('bowl', [[0, 0], [3.2, 0], [4.6, 0.6], [5.6, 2.6], [5.3, 2.6], [4.3, 1.0], [0, 0.9]], 22); };
  var plateG = function () { return G.lathe('plate', [[0, 0], [4.4, 0], [5.2, 0.22], [5.0, 0.24], [4.2, 0.12], [0, 0.12]], 22); };
  var eggcupG = function () { return G.lathe('eggcup', [[0, 0], [1.3, 0], [1.3, 0.2], [0.5, 0.6], [0.5, 1.4], [1.4, 2.2], [1.3, 2.25], [0, 1.8]], 14); };
  var potG = function () { return G.lathe('pot', [[0, 0], [1.6, 0], [2.3, 2.8], [2.5, 3.2], [2.1, 3.2], [0, 3.0]], 14); };
  var bucketG = function () { return G.lathe('bucket', [[0, 0], [1.9, 0], [2.6, 3.6], [2.4, 3.6], [1.8, 0.3], [0, 0.3]], 16); };

  var PROPS = {
    bowl: function (c) { c.add(bowlG(), '#2a9df4', 0, 0, 0, 1); c.add(G.cyl(20), '#fff8e6', 0, 2.1, 0, 9.4, 0.1, 9.4);
      var r = WF.rng(5); for (var i = 0; i < 16; i++) { var a = r() * 6.28, d = r() * 3.6; c.add(G.torus(0.3), r() < 0.5 ? '#e0a040' : '#c9772a', Math.cos(a) * d, 2.25, Math.sin(a) * d, 0.9, 0.9, 0.9, Math.PI / 2, 0, 0); } },
    plate: function (c) { c.add(plateG(), '#ffffff', 0, 0, 0, 1); c.add(G.cyl(22), '#e9eef6', 0, 0.13, 0, 8, 0.02, 8); },
    cup: function (c) { c.add(G.cyl(16), '#ff6b6b', 0, 1.7, 0, 4.6, 3.4, 4.6); c.add(G.cyl(16), '#5b3a1e', 0, 3.38, 0, 4.0, 0.06, 4.0); c.add(G.torus(0.22), '#ff6b6b', 2.6, 1.8, 0, 2.2, 2.2, 2.2, 0, 0, Math.PI / 2); },
    cereal: function (c) { c.add(G.box(), '#ffb400', 0, 5, 0, 7, 10, 2.6); c.add(G.box(), '#e8432e', 0, 6.5, 0, 6, 3, 2.7); c.add(G.box(), '#ffffff', 0, 3, 0, 5, 1.2, 2.7); c.add(G.sph(10), '#8b4a1c', -1.6, 3.4, 1.35, 1.6, 1.6, 0.4); },
    toast: function (c) { c.add(G.rbox(0.2), '#b8742e', 0, 0.35, 0, 5, 0.7, 5); c.add(G.rbox(0.2), '#f3cf86', 0, 0.42, 0, 4.4, 0.62, 4.4); c.add(G.box(), '#ffe9a3', 0.6, 0.76, -0.5, 2.2, 0.06, 1.8); },
    sugar: function (c) { c.add(G.box(), '#ffffff', 0, 0.55, 0, 1.1); },
    jam: function (c) { c.add(G.cyl(14), '#c3122f', 0, 1.3, 0, 3.8, 2.6, 3.8); c.add(G.cyl(14), '#f2f2f2', 0, 2.8, 0, 3.9, 0.4, 3.9); c.add(G.cyl(14), '#ffffff', 0, 1.4, 0, 3.86, 0.9, 3.86); },
    egg: function (c) { c.add(eggcupG(), '#ffd166', 0, 0, 0, 1); c.add(G.sph(14), '#fff6e8', 0, 2.3, 0, 2.0, 2.6, 2.0); },
    milk: function (c) { c.add(G.box(), '#ffffff', 0, 3.6, 0, 3.4, 7.2, 3.4); c.add(G.box(), '#3a8ee6', 0, 3.2, 0, 3.45, 3.0, 3.45); c.add(G.cone(4), '#ffffff', 0, 8.1, 0, 4.8, 1.8, 4.8, 0, Math.PI / 4, 0); },
    spoon: function (c) { c.add(G.sph(12), '#c9d1d9', 0, 0.12, -4, 2.4, 0.3, 3.4); c.add(G.box(), '#c9d1d9', 0, 0.12, 2, 0.8, 0.22, 9); },
    knife: function (c) { c.add(G.box(), '#d7dde3', 0, 0.1, -2.5, 1.4, 0.16, 8); c.add(G.box(), '#3b3b3b', 0, 0.3, 4, 1.2, 0.55, 5); },
    book: function (c) { var r = WF.rng(c.m.elements[12] * 7 | 0); var cols = ['#c0392b', '#2471a3', '#1e8449', '#7d3c98', '#d68910'];
      c.add(G.box(), cols[(r() * 5) | 0], 0, 0.85, 0, 12, 1.7, 8.5); c.add(G.box(), '#f7f2e4', 0.3, 0.85, 0, 11.6, 1.4, 8.2); },
    mug: function (c) { c.add(G.cyl(16), '#ffffff', 0, 2.25, 0, 5, 4.5, 5); c.add(G.cyl(16), '#e74c3c', 0, 2.6, 0, 5.05, 1.2, 5.05); c.add(G.cyl(16), '#4a2c14', 0, 4.48, 0, 4.4, 0.05, 4.4);
      c.add(G.torus(0.25), '#ffffff', 2.8, 2.4, 0, 2.4, 2.4, 2.4, 0, 0, Math.PI / 2);
      for (var i = 0; i < 6; i++) c.add(G.box(), '#f4d03f', -1 + i * 0.4, 6 + i * 0.6, -1, 0.15, 6 - i * 0.4, 0.15, 0, 0, 0.15); },
    lamp: function (c) { c.add(G.cyl(18), '#2c3e50', 0, 0.6, 0, 7.2, 1.2, 7.2); c.add(G.cyl(8), '#95a5a6', 0, 6, 0, 0.6, 11, 0.6); c.add(G.cyl(8), '#95a5a6', -3, 11.5, 0, 0.5, 7, 0.5, 0, 0, 1.2);
      c.add(G.cone(16), '#2c3e50', -6.5, 12, 0, 5, 4, 5, 0, 0, 0.4); },
    eraser: function (c) { c.add(G.rbox(0.3), '#ff8fa3', 0, 0.5, 0, 3.2, 1, 1.6); c.add(G.box(), '#3a7bd5', 0.9, 0.5, 0, 1.4, 1.02, 1.62); },
    pencil: function (c) { var col = ['#f4c430', '#2ecc71', '#e74c3c', '#3498db'][(Math.abs(c.m.elements[12]) | 0) % 4];
      c.add(G.hex(), col, 0, 0.37, 0, 0.75, 12, 0.75, 0, 0, Math.PI / 2); c.add(G.cone(8), '#f1d1a5', -7, 0.37, 0, 0.74, 2, 0.74, 0, 0, Math.PI / 2); c.add(G.cone(8), '#333', -7.8, 0.37, 0, 0.25, 0.6, 0.25, 0, 0, Math.PI / 2);
      c.add(G.cyl(8), '#c0c0c0', 6.4, 0.37, 0, 0.8, 0.8, 0.8, 0, 0, Math.PI / 2); c.add(G.cyl(8), '#ff8fa3', 7.1, 0.37, 0, 0.78, 0.7, 0.78, 0, 0, Math.PI / 2); },
    note: function (c) { c.add(G.box(), '#fff176', 0, 0.03, 0, 6, 0.06, 6); c.add(G.box(), '#90a4ae', 0, 0.07, -1, 4, 0.02, 0.2); c.add(G.box(), '#90a4ae', 0, 0.07, 0.4, 4, 0.02, 0.2); },
    clip: function (c) { c.add(G.torus(0.06), '#b0bec5', 0, 0.1, 0, 3, 1.2, 6, Math.PI / 2, 0, 0); c.add(G.torus(0.07), '#b0bec5', 0, 0.12, 0.6, 2.2, 1.0, 4.4, Math.PI / 2, 0, 0); },
    calc: function (c) { c.add(G.box(), '#34495e', 0, 0.45, 0, 6, 0.9, 8.5); c.add(G.box(), '#a3c9a8', 0, 0.92, -2.6, 4.8, 0.06, 2); for (var a = 0; a < 4; a++) for (var b = 0; b < 4; b++) c.add(G.box(), b === 3 ? '#e67e22' : '#ecf0f1', -1.8 + b * 1.2, 0.95, -0.4 + a * 1.3, 0.9, 0.12, 0.9); },
    soap: function (c) { c.add(G.rbox(0.9), '#ff9ecb', 0, 0.5, 0, 6.2, 1.6, 3.8); c.add(G.rbox(0.8), '#ffc2df', 0, 0.62, 0, 5.2, 1.6, 2.8); },
    duck: function (c) { c.add(G.sph(14), '#ffd23f', 0, 0.6, 0, 3.4, 2.2, 3.8); c.add(G.sph(12), '#ffd23f', 0, 2.2, 1.0, 1.9); c.add(G.cone(10), '#ff8c1a', 0, 2.1, 2.1, 0.7, 1.2, 0.6, Math.PI / 2, 0, 0);
      c.add(G.sph(8), '#111', 0.55, 2.6, 1.7, 0.3); c.add(G.sph(8), '#111', -0.55, 2.6, 1.7, 0.3); c.add(G.cone(8), '#ffd23f', 0, 1.6, -1.9, 1.2, 1.4, 0.8, -1.0, 0, 0); },
    sponge: function (c) { c.add(G.box(), '#ffe066', 0, 1.0, 0, 6, 2.0, 4); c.add(G.box(), '#38b000', 0, 2.1, 0, 6, 0.4, 4); },
    bottle: function (c) { c.add(G.cyl(12), '#8e7cc3', 0, 3.6, 0, 3.2, 4.4, 3.2); c.add(G.cyl(12), '#fff', 0, 6.1, 0, 1.4, 0.8, 1.4); },
    drain: function (c) { c.add(G.torus(0.14), '#c0c6cc', 0, 0.02, 0, 3.6, 3.6, 3.6, Math.PI / 2, 0, 0); },
    tree: function (c) { c.add(G.cyl(9), '#7a5230', 0, 4, 0, 4.4, 8, 4.4); c.add(G.cyl(9), '#7a5230', 1.2, 7, 0, 1.2, 4, 1.2, 0, 0, -0.6); },
    flowers: function (c) { var r = WF.rng(c.m.elements[14] * 3 | 0); c.add(G.cyl(16), '#6b4226', 0, 0.3, 0, 9.4, 0.6, 9.4);
      for (var i = 0; i < 12; i++) { var a = i / 12 * 6.28, d = r() * 3; flower(c, Math.cos(a) * d, Math.sin(a) * d, ['#ff5d8f', '#ffd23f', '#a06cd5', '#ff8c42'][i % 4], 1.5 + r() * 1.4); }
      for (i = 0; i < 16; i++) { a = i / 16 * 6.28; c.add(G.sph(6), '#9e9e9e', Math.cos(a) * 4.8, 0.4, Math.sin(a) * 4.8, 1.2, 0.8, 1.2); } },
    flower: function (c) { flower(c, 0, 0, '#ff5d8f', 4.5); },
    pot: function (c) { c.add(potG(), '#c8643b', 0, 0, 0, 1); c.add(G.sph(10), '#2e8b57', 0, 3.8, 0, 3.6, 2.4, 3.6); },
    can: function (c) { c.add(G.cyl(14), '#2e86de', 0, 1.7, 0, 5.2, 3.4, 5.2); c.add(G.cyl(8), '#2e86de', 3.8, 2.6, 0, 0.6, 5, 0.6, 0, 0, -1.0); c.add(G.torus(0.15), '#2e86de', -0.5, 3.6, 0, 2.6, 2.4, 2.6); c.add(G.cyl(10), '#1b5fa8', 5.9, 4.0, 0, 1.2, 0.6, 1.2, 0, 0, -1.0); },
    gnome: function (c) { c.add(G.cyl(10), '#2f5d9a', 0, 1.2, 0, 3.2, 2.4, 3.2); c.add(G.sph(10), '#ffcfa0', 0, 2.9, 0, 1.6); c.add(G.cone(10), '#ffffff', 0, 2.3, 0.7, 1.4, 1.8, 0.8, Math.PI, 0, 0); c.add(G.cone(12), '#d62828', 0, 4.4, 0, 2.0, 2.4, 2.0); c.add(G.sph(6), '#ff9a76', 0, 2.95, 0.8, 0.5); },
    stone: function (c) { c.add(new THREE.IcosahedronGeometry(1, 0), '#9aa0a6', 0, 0.3, 0, 2.2, 0.8, 1.8); },
    hose: function (c) { for (var i = 0; i < 4; i++) c.add(G.torus(0.09), '#2ecc71', 0, 0.35 + i * 0.05, 0, 6 - i * 0.9, 6 - i * 0.9, 6 - i * 0.9, Math.PI / 2, 0, 0); },
    castle: function (c) { var sc = '#d9b871';
      c.add(G.cyl(16), sc, 0, 1.5, 0, 8.4, 3, 8.4); c.add(G.cyl(14), sc, 0, 3.8, 0, 4.5, 2.6, 4.5);
      for (var i = 0; i < 4; i++) { var a = i * Math.PI / 2 + 0.6; c.add(G.cyl(10), sc, Math.cos(a) * 4.6, 2.4, Math.sin(a) * 4.6, 2.2, 4.8, 2.2); c.add(G.cone(10), '#c79e55', Math.cos(a) * 4.6, 5.4, Math.sin(a) * 4.6, 2.4, 1.6, 2.4); }
      c.add(G.box(), '#e63946', 0, 6.4, 0, 0.1, 2.4, 0.1); c.add(G.box(), '#e63946', 0.6, 7.2, 0, 1.2, 0.7, 0.05); },
    bucket: function (c) { c.add(bucketG(), '#e63946', 0, 0, 0, 1); c.add(G.torus(0.05), '#ffb703', 0, 3.6, 0, 5, 5, 5, 0, 0, 0); c.add(G.cyl(16), '#d9b871', 0, 3.2, 0, 4.6, 0.1, 4.6); },
    spade: function (c) { c.add(G.box(), '#219ebc', 0, 0.15, -3, 3.4, 0.3, 4); c.add(G.cyl(8), '#ffb703', 0, 0.35, 2.5, 0.6, 7, 0.6, Math.PI / 2, 0, 0); },
    mold: function (c) { c.add(new THREE.CylinderGeometry(1.2, 1.7, 1, 5), '#8ecae6', 0, 0.55, 0, 1, 1.1, 1); },
    rake: function (c) { c.add(G.cyl(8), '#fb8500', 0, 0.3, 3, 0.5, 9, 0.5, Math.PI / 2, 0, 0); c.add(G.box(), '#fb8500', 0, 0.3, -1.7, 4.4, 0.5, 0.6); for (var i = 0; i < 6; i++) c.add(G.box(), '#fb8500', -1.9 + i * 0.76, 0.2, -2.4, 0.25, 0.3, 1.2); },
    chalk: function (c) { c.add(G.box(), '#3a86ff', 0, 0.7, 0, 1.4); c.add(G.box(), '#9bc1ff', 0, 1.41, 0, 1.0, 0.02, 1.0); },
    cue: function (c) { c.add(G.cyl(10), '#e9c46a', 0, 2.2, 0, 0.7, 60, 0.7, 0, 0, Math.PI / 2); c.add(G.cyl(10), '#3d2c1e', -22, 2.2, 0, 1.0, 18, 1.0, 0, 0, Math.PI / 2); c.add(G.cyl(8), '#1d70b8', 30.3, 2.2, 0, 0.6, 0.6, 0.6, 0, 0, Math.PI / 2); },
    screw: function (c) { c.add(G.cyl(10), '#9aa5b1', 0, 1.2, 0, 0.9, 2.4, 0.9); for (var i = 0; i < 5; i++) c.add(G.torus(0.25), '#7b8794', 0, 0.3 + i * 0.4, 0, 1.0, 1.0, 1.0, Math.PI / 2, 0, 0);
      c.add(G.cyl(14), '#b8c2cc', 0, 2.45, 0, 1.7, 0.3, 1.7); c.add(G.box(), '#52606d', 0, 2.62, 0, 1.2, 0.08, 0.2); },
    nut: function (c) { c.add(G.hex(), '#a0aab4', 0, 0.4, 0, 2.8, 0.8, 2.8); c.add(G.cyl(12), '#3e4c59', 0, 0.42, 0, 1.3, 0.82, 1.3); },
    hammer: function (c) { c.add(G.box(), '#c68642', 1.5, 0.45, 0, 8.5, 0.9, 1.1); c.add(G.box(), '#52606d', -4.2, 0.65, 0, 1.8, 1.3, 4.2); c.add(G.box(), '#e63946', 3.5, 0.47, 0, 3.5, 0.98, 1.2); },
    box: function (c) { c.add(G.box(), '#d62828', 0, 2.5, 0, 12, 5, 7); c.add(G.box(), '#b71c1c', 0, 5.1, 0, 12.1, 0.3, 7.1); c.add(G.box(), '#333', 0, 5.7, 0, 5, 0.5, 0.8); c.add(G.box(), '#aaa', 0, 3.6, 3.55, 2, 1, 0.2); },
    vice: function (c) { c.add(G.box(), '#2b6cb0', 0, 2, 0, 6, 4, 3); c.add(G.box(), '#2b6cb0', 0, 2.4, 2.2, 6, 3.4, 1.2); c.add(G.cyl(8), '#ccc', 0, 3.2, 4, 0.5, 4, 0.5, Math.PI / 2, 0, 0); },
    driver: function (c) { c.add(G.cyl(8), '#f4a261', 2.5, 0.55, 0, 1.1, 4, 1.1, 0, 0, Math.PI / 2); c.add(G.cyl(6), '#adb5bd', -2, 0.55, 0, 0.4, 5.5, 0.4, 0, 0, Math.PI / 2); },
    blocks: function (c) { var cols = ['#e63946', '#ffb703', '#219ebc', '#8ac926', '#9b5de5'];
      [[-1.8, 1, -1.5], [1.8, 1, -1.2], [0, 1, 1.8], [-0.2, 3, -0.4], [2, 3, 1]].forEach(function (p, i) { c.add(G.box(), cols[i % 5], p[0], p[1], p[2], 2.6, 2, 2.6, 0, i * 0.4, 0); c.add(G.cyl(8), cols[i % 5], p[0], p[1] + 1.15, p[2], 0.8, 0.3, 0.8); }); },
    ballbig: function (c) { c.add(G.sph(18), '#ff595e', 0, 3, 0, 6.2); c.add(G.cyl(18), '#ffffff', 0, 3, 0, 6.3, 1.2, 6.3); c.add(G.sph(8), '#1982c4', 0, 6.05, 0, 1.2, 0.2, 1.2); },
    teddy: function (c) { var t = '#a0703c';
      c.add(G.sph(14), t, 0, 2.8, 0, 6, 5.6, 5); c.add(G.sph(14), t, 0, 6.3, 0.6, 4.2); c.add(G.sph(8), t, 1.6, 8, 0.5, 1.4); c.add(G.sph(8), t, -1.6, 8, 0.5, 1.4);
      c.add(G.sph(10), '#e5c29f', 0, 6.0, 2.5, 1.7, 1.3, 1.2); c.add(G.sph(6), '#222', 0, 6.3, 3.0, 0.5); c.add(G.sph(6), '#222', 0.8, 7, 2.3, 0.4); c.add(G.sph(6), '#222', -0.8, 7, 2.3, 0.4);
      c.add(G.sph(10), t, 2.6, 1.0, 2.2, 2, 1.8, 3); c.add(G.sph(10), t, -2.6, 1.0, 2.2, 2, 1.8, 3); c.add(G.sph(10), t, 3.2, 3.4, 0.6, 1.8, 3.2, 1.8); c.add(G.sph(10), t, -3.2, 3.4, 0.6, 1.8, 3.2, 1.8); },
    crayon: function (c) { var col = ['#8338ec', '#ff006e', '#3a86ff', '#fb5607'][(Math.abs(c.m.elements[14]) | 0) % 4];
      c.add(G.cyl(10), col, 0, 0.5, 0, 1, 8, 1, 0, 0, Math.PI / 2); c.add(G.cone(10), col, -4.8, 0.5, 0, 1, 1.6, 1, 0, 0, Math.PI / 2); c.add(G.cyl(10), '#ffffff', 1.5, 0.5, 0, 1.02, 3, 1.02, 0, 0, Math.PI / 2); },
    train: function (c) { var cols = ['#e63946', '#2a9d8f', '#f4a261'];
      for (var i = 0; i < 3; i++) { c.add(G.box(), cols[i], -3.6 + i * 3.6, 1.4, 0, 3.2, 2, 2.6); for (var k = 0; k < 2; k++) { c.add(G.cyl(10), '#222', -4.6 + i * 3.6 + k * 2, 0.5, 1.35, 0.9, 0.2, 0.9, Math.PI / 2, 0, 0); c.add(G.cyl(10), '#222', -4.6 + i * 3.6 + k * 2, 0.5, -1.35, 0.9, 0.2, 0.9, Math.PI / 2, 0, 0); } }
      c.add(G.cyl(10), '#333', -4.2, 2.9, 0, 0.8, 1.2, 0.8); }
  };
  function flower(c, x, z, col, h) {
    c.add(G.cyl(5), '#2d8a34', x, h / 2, z, 0.25, h, 0.25);
    for (var i = 0; i < 5; i++) { var a = i / 5 * 6.28; c.add(G.sph(6), col, x + Math.cos(a) * 0.6, h, z + Math.sin(a) * 0.6, 0.9, 0.3, 0.9); }
    c.add(G.sph(6), '#ffd23f', x, h + 0.1, z, 0.6, 0.35, 0.6);
  }

  // ---------- Kanten-Markierungen je Welt (Instanzen)
  var EDGE = {
    breakfast: { geo: function () { return new THREE.TorusGeometry(0.32, 0.13, 5, 10).rotateX(Math.PI / 2); }, cols: ['#e8a33c', '#c9772a', '#f5c66e'], every: 2.6, y: 0.12, off: 0.35 },
    desk: { geo: function () { return new THREE.SphereGeometry(0.42, 8, 6); }, cols: ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f'], every: 5, y: 0.3, off: 0.4 },
    bath: { geo: function () { return new THREE.SphereGeometry(0.55, 10, 8); }, cols: ['#ff3b3b', '#ffffff'], every: 4, y: 0.15, off: 0.9 },
    garden: { geo: function () { return new THREE.IcosahedronGeometry(0.5, 0); }, cols: ['#f5f5f5', '#dcdcdc'], every: 3.2, y: 0.2, off: 0.5 },
    sandbox: { geo: function () { return new THREE.CylinderGeometry(0.22, 0.22, 1.6, 6); }, cols: ['#ff595e', '#ffffff'], every: 6, y: 0.8, off: 0.7 },
    workbench: { geo: function () { return new THREE.CylinderGeometry(0.5, 0.5, 0.35, 6); }, cols: ['#9aa5b1', '#b8c2cc'], every: 4, y: 0.18, off: 0.5 },
    kids: { geo: function () { return new THREE.ConeGeometry(0.55, 1.4, 8); }, cols: ['#ff7b00', '#ffffff'], every: 8, y: 0.7, off: 0.8 },
    pool: null
  };
  var SUPPORT = { breakfast: ['#d9a35b', '#c8893f'], desk: ['#c0392b', '#2471a3', '#1e8449', '#7d3c98', '#d68910'], bath: ['#ffffff'], garden: ['#8d6e63'], sandbox: ['#d9b871'], pool: ['#5d4037'], workbench: ['#8d6e63', '#a1887f'], kids: ['#ffb703', '#219ebc', '#e63946', '#8ac926'] };
  var ZCOL = {
    slip: { breakfast: '#ffffff', desk: '#5b3a1e', bath: '#ffffff', garden: '#7cc6fe', sandbox: '#7cc6fe', pool: '#cfe8ff', workbench: '#1b1b1b', kids: '#7cc6fe' },
    slow: { breakfast: '#e8a33c', desk: '#1f3b73', bath: '#ffffff', garden: '#6b4f2a', sandbox: '#b08850', pool: '#ffffff', workbench: '#e6c79c', kids: '#ff8fab' }
  };

  WF.buildWorld = function (scene, T) {
    var th = T.theme, key = T.def.theme, root = new THREE.Group(), b = new WF.Builder(), anim = [];
    scene.add(root);
    scene.background = new THREE.Color(th.sky);
    var g = th.ground;

    // Boden tief unten
    var floorTex = { breakfast: tWood('floorB', '#9c6b43', '#5a3a22'), desk: tFlat('floorD', '#7b7f8c', 20), bath: WF.tex('tiles', 128, function (c, s) { c.fillStyle = '#eef3f6'; c.fillRect(0, 0, s, s); c.strokeStyle = '#b8c7d1'; c.lineWidth = 3; c.strokeRect(0, 0, s, s); }),
      garden: tGrass(), sandbox: tGrass(), pool: tWood('floorP', '#4a3326', '#2a1a12'), workbench: tFlat('floorW', '#6e6e6e', 26), kids: tWood('floorK', '#c79a66', '#8a6036') }[key];
    var ft = floorTex.clone(); ft.needsUpdate = true; ft.repeat.set(30, 30);
    var floor = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), new THREE.MeshLambertMaterial({ map: ft }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = th.floorY; root.add(floor);

    // Spielfläche
    var gtex = { breakfast: tGingham(), desk: tWood('desk', '#b98a5a', '#6e4a2a'), bath: tWater(), garden: tGrass(), sandbox: tFlat('sand', '#e8cf8f', 30, 'rgba(150,120,70,0.5)'),
      pool: tFlat('felt', '#1f8a4c', 14), workbench: tWood('bench', '#d4b07a', '#8a6a3a'), kids: tCarpet() }[key];
    var gt = gtex.clone(); gt.needsUpdate = true;
    var tile = { breakfast: 8, desk: 30, bath: 22, garden: 10, sandbox: 10, pool: 8, workbench: 26, kids: 14 }[key];
    gt.repeat.set(g.w / tile, g.d / tile);
    var gmat = new THREE.MeshLambertMaterial({ map: gt });
    var gm;
    if (key === 'sandbox') {
      var pg = new THREE.PlaneGeometry(g.w, g.d, 84, 84); pg.rotateX(-Math.PI / 2);
      var pp = pg.attributes.position; for (var i = 0; i < pp.count; i++) pp.setY(i, T.hill(pp.getX(i), pp.getZ(i)));
      pg.computeVertexNormals(); gm = new THREE.Mesh(pg, gmat);
    } else if (g.t === 'rrect') {
      var sh = rrectShape(g.w / 2, g.d / 2, g.r), sg = new THREE.ShapeGeometry(sh, 8); sg.rotateX(-Math.PI / 2);
      var uv = sg.attributes.uv; for (i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / tile, uv.getY(i) / tile);
      gt.repeat.set(1, 1);
      gm = new THREE.Mesh(sg, gmat); gm.position.y = -0.05;
    } else {
      gm = new THREE.Mesh(new THREE.PlaneGeometry(g.w, g.d), gmat); gm.rotation.x = -Math.PI / 2;
    }
    root.add(gm);
    if (th.water) anim.push(function (t) { gt.offset.set(t * 0.012, t * 0.02); });

    // Tischplatte (Dicke) und Ränder
    var edgeCol = { breakfast: '#e9e2d4', desk: '#8a5a32', workbench: '#a07a48' }[key];
    if (edgeCol) {
      b.add(G.box(), edgeCol, 0, -1.5, 0, 0, 0, 0, g.w, 3, g.d);
      if (key === 'breakfast') { // überhängende Tischdecke
        for (var s2 = -1; s2 <= 1; s2 += 2) { b.add(G.box(), '#f3c9c9', 0, -1.8, s2 * (g.d / 2 + 0.15), 0, 0, 0, g.w + 0.6, 3.6, 0.3); b.add(G.box(), '#f3c9c9', s2 * (g.w / 2 + 0.15), -1.8, 0, 0, 0, 0, 0.3, 3.6, g.d + 0.6); }
      }
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (q) { b.add(G.box(), edgeCol, q[0] * (g.w / 2 - 4), -14, q[1] * (g.d / 2 - 4), 0, 0, 0, 3, 24, 3); });
    }
    if (key === 'bath') {
      var ring = rrectShape(g.w / 2 + th.rim, g.d / 2 + th.rim, g.r + th.rim); ring.holes.push(rrectShape(g.w / 2, g.d / 2, g.r));
      var rg = new THREE.ExtrudeGeometry(ring, { depth: 13, bevelEnabled: true, bevelSize: 0.8, bevelThickness: 0.8, bevelSegments: 2, curveSegments: 10 });
      rg.rotateX(-Math.PI / 2); rg.translate(0, -10, 0);
      b.addM(rg, '#fdfdfd', new THREE.Matrix4());
      b.add(G.cyl(12), '#c0c6cc', g.w / 2 + 1.6, 6, 0, 0, 0, 0, 1.4, 6, 1.4); b.add(G.cyl(12), '#c0c6cc', g.w / 2 - 1, 8.6, 0, 0, 0, Math.PI / 2, 1.2, 6, 1.2);
    }
    if (key === 'garden') hedge(b, g, th.rim);
    if (key === 'sandbox') frame(b, g, th.rim, '#b07a45', 2.6, -2);
    if (key === 'kids') frame(b, g, th.rim, '#f1e6d0', 6, -2);
    if (key === 'pool') {
      frame(b, { w: g.w + 2.4, d: g.d + 2.4 }, 4.5, '#6d3b1f', 2.0, -6);
      frame(b, g, 1.2, '#17703c', 1.6, -1);
      T.holes.forEach(function (o) { b.add(G.cyl(16), '#0b0b0b', o.x, 0.03, o.z, 0, 0, 0, o.r * 2, 0.06, o.r * 2); b.add(G.cyl(16), '#3b2416', o.x * 1.02, 1.0, o.z * 1.02, 0, 0, 0, o.r * 2.4, 2.0, o.r * 2.4); });
      b.add(G.box(), '#3b2416', 0, -8, 0, 0, 0, 0, g.w - 6, 14, g.d - 6);
    }

    // Deko
    (T.def.props || []).forEach(function (p) {
      var f = PROPS[p[0]]; if (!f) return;
      var x = p[1], z = p[2];
      if (p[0] === 'cue') z = z > 0 ? g.d / 2 + 2.4 : -g.d / 2 - 2.4;
      var base = 0; if (key === 'bath' && p[0] !== 'bottle') base = -0.25; if (p[0] === 'bottle') base = 3.2;
      if (key === 'bath' && p[0] === 'bottle') { x = WF.clamp(x, -g.w / 2 - 1.6, g.w / 2 + 1.6); z = z > 0 ? g.d / 2 + 1.6 : -g.d / 2 - 1.6; }
      f(new Ctx(b, x, z, base + (key === 'sandbox' ? T.hill(x, z) : 0), p[3] || 0, p[4] || 1));
    });
    // Baumkronen halbdurchsichtig, damit die Strecke sichtbar bleibt
    var crowns = new WF.Builder();
    (T.def.props || []).forEach(function (p) {
      if (p[0] !== 'tree') return; var s = p[4] || 1, r = WF.rng(p[1] * 13 + 7);
      for (var k = 0; k < 4; k++) crowns.add(new THREE.IcosahedronGeometry(1, 1), k % 2 ? '#3d9b3d' : '#2f7d32', p[1] + (r() - 0.5) * 6 * s, 9 + r() * 3, p[2] + (r() - 0.5) * 6 * s, 0, r(), 0, 3.6 * s);
    });
    if (!crowns.empty()) { var cm = crowns.mesh(new THREE.MeshLambertMaterial({ vertexColors: true, transparent: true, opacity: 0.55, depthWrite: false })); cm.renderOrder = 5; root.add(cm); }

    // Streudeko (ohne Kollision), nicht auf der Fahrbahn
    scatter(b, T, key);

    // Fahrbahn
    root.add(ribbon(T, key));
    supports(b, T, key);

    // Zonen
    T.zones.forEach(function (q) {
      if (q.t === 'hill') return;
      if (q.t === 'pull') {
        var tx = WF.tex('swirl', 128, function (c, s) { c.translate(s / 2, s / 2); for (var i = 0; i < 4; i++) { c.rotate(Math.PI / 2); c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 5; c.beginPath(); for (var a = 0; a < 5; a += 0.1) c.lineTo(Math.cos(a) * a * 12, Math.sin(a) * a * 12); c.stroke(); } });
        var wm = new THREE.Mesh(new THREE.CircleGeometry(q.r, 32), new THREE.MeshBasicMaterial({ map: tx, transparent: true, depthWrite: false }));
        wm.rotation.x = -Math.PI / 2; wm.position.set(q.x, 0.03, q.z); root.add(wm);
        anim.push(function (t) { wm.rotation.z = t * 2.2; });
        return;
      }
      var col = ZCOL[q.t][key], r = WF.rng(q.x * 7 + q.z);
      var shp = new THREE.Shape(); for (var k = 0; k <= 16; k++) { var a = k / 16 * 6.283, rr = q.r * (0.82 + r() * 0.3); k ? shp.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : shp.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
      var zg = new THREE.ShapeGeometry(shp); zg.rotateX(-Math.PI / 2);
      var hy = (key === 'sandbox' ? T.hill(q.x, q.z) : 0) + 0.06 + (onTrackH(T, q.x, q.z));
      var zm = new THREE.Mesh(zg, new THREE.MeshLambertMaterial({ color: col, transparent: true, opacity: key === 'bath' ? 0.35 : q.t === 'slip' ? 0.82 : 0.75, depthWrite: false }));
      zm.position.set(q.x, hy, q.z); zm.renderOrder = 2; root.add(zm);
      if (key === 'bath' && q.t === 'slow') for (k = 0; k < 14; k++) { var a2 = r() * 6.28, d2 = r() * q.r; b.add(G.sph(8), '#ffffff', q.x + Math.cos(a2) * d2, 0.1, q.z + Math.sin(a2) * d2, 0, 0, 0, 0.6 + r() * 1.2); }
    });

    // Turbo-Streifen
    var padTex = WF.tex('pad', 64, function (c, s) { c.fillStyle = '#ff2d95'; c.fillRect(0, 0, s, s); c.fillStyle = '#ffe600'; for (var y = 0; y < s; y += 32) { c.beginPath(); c.moveTo(8, y + 28); c.lineTo(s / 2, y + 6); c.lineTo(s - 8, y + 28); c.lineTo(s - 18, y + 28); c.lineTo(s / 2, y + 16); c.lineTo(18, y + 28); c.fill(); } });
    var padMat = new THREE.MeshBasicMaterial({ map: padTex, transparent: true, opacity: 0.92, depthWrite: false });
    var pads = stripMesh(T, function (i) { return T.f[i] & 4; }, T.w * 0.55, 0.09, padMat, key, true);
    if (pads) { pads.renderOrder = 3; root.add(pads); anim.push(function (t) { padTex.offset.y = -t * 1.6; }); }
    // Startlinie
    var chk = WF.tex('chk', 64, function (c, s) { for (var a = 0; a < 8; a++) for (var bb = 0; bb < 2; bb++) { c.fillStyle = (a + bb) % 2 ? '#111' : '#fff'; c.fillRect(a * 8, bb * 32, 8, 32); } });
    var startM = stripMesh(T, function (i) { return i < 3 || i > T.N - 2; }, T.w, 0.1, new THREE.MeshBasicMaterial({ map: chk, depthWrite: false, transparent: true }), key, false);
    if (startM) { startM.renderOrder = 3; root.add(startM); }
    startArch(b, T);

    // Kanten-Markierungen
    var ed = EDGE[key];
    if (ed) {
      var pts = [], acc = 0, stepN = Math.round(ed.every / T.ds);
      for (i = 0; i < T.N; i += stepN) {
        if (T.f[i] & 11 || T.h[i] > 0.05) continue;
        for (var sd = -1; sd <= 1; sd += 2) { var off = (T.w + ed.off) * sd; var x = T.x[i] + T.tz[i] * off, z = T.z[i] - T.tx[i] * off; if (!T.inGround(x, z)) continue; pts.push([x, z, (acc++) % ed.cols.length]); }
      }
      var im = new THREE.InstancedMesh(ed.geo(), new THREE.MeshLambertMaterial({ color: 0xffffff }), pts.length), mm = new THREE.Matrix4(), cc = new THREE.Color();
      pts.forEach(function (p, k) { mm.makeTranslation(p[0], ed.y + (key === 'sandbox' ? T.hill(p[0], p[1]) : 0), p[1]); im.setMatrixAt(k, mm); im.setColorAt(k, cc.set(ed.cols[p[2]])); });
      root.add(im);
      if (key === 'bath') anim.push(function (t) { im.position.y = Math.sin(t * 2) * 0.08; });
    }

    if (!b.empty()) root.add(b.mesh());
    return { root: root, anim: anim };
  };

  function onTrackH(T, x, z) { var o = {}; T.ground(x, z, 9, 0, o, 0); return Math.max(0, o.h > -1e9 ? o.h : 0); }

  function rrectShape(hw, hd, r) {
    var s = new THREE.Shape();
    s.moveTo(-hw + r, -hd); s.lineTo(hw - r, -hd); s.absarc(hw - r, -hd + r, r, -Math.PI / 2, 0, false); s.lineTo(hw, hd - r); s.absarc(hw - r, hd - r, r, 0, Math.PI / 2, false);
    s.lineTo(-hw + r, hd); s.absarc(-hw + r, hd - r, r, Math.PI / 2, Math.PI, false); s.lineTo(-hw, -hd + r); s.absarc(-hw + r, -hd + r, r, Math.PI, Math.PI * 1.5, false);
    return s;
  }
  function frame(b, g, t, col, top, bot) {
    var hw = g.w / 2, hd = g.d / 2, h = top - bot, y = (top + bot) / 2;
    b.add(G.box(), col, 0, y, -hd - t / 2, 0, 0, 0, g.w + t * 2, h, t); b.add(G.box(), col, 0, y, hd + t / 2, 0, 0, 0, g.w + t * 2, h, t);
    b.add(G.box(), col, -hw - t / 2, y, 0, 0, 0, 0, t, h, g.d); b.add(G.box(), col, hw + t / 2, y, 0, 0, 0, 0, t, h, g.d);
  }
  function hedge(b, g, t) {
    frame(b, g, t, '#2f6b2f', 3.5, -2);
    var r = WF.rng(3), hw = g.w / 2, hd = g.d / 2;
    for (var x = -hw; x <= hw; x += 4) { b.add(G.sph(6), '#3a8a3a', x, 3.6, -hd - t / 2, 0, 0, 0, 3 + r()); b.add(G.sph(6), '#3a8a3a', x, 3.6, hd + t / 2, 0, 0, 0, 3 + r()); }
    for (var z = -hd; z <= hd; z += 4) { b.add(G.sph(6), '#3a8a3a', -hw - t / 2, 3.6, z, 0, 0, 0, 3 + r()); b.add(G.sph(6), '#3a8a3a', hw + t / 2, 3.6, z, 0, 0, 0, 3 + r()); }
  }

  // Fahrbahnband (Texturstreifen) über alle Abschnitte ohne Lücke
  function ribbon(T, key) {
    if (T.theme.track === 'none') return new THREE.Group();
    var tex = WF.tex('trk-' + key, 128, TRACK_TEX[T.theme.track]);
    var pos = [], uv = [], nor = [], N = T.N, w = T.w, lenU = 0;
    function yAt(i, x, z) { return (T.h[i] < 0.01 ? T.hill(x, z) : T.h[i]) + 0.04; }
    for (var i = 0; i < N; i++) {
      var j = (i + 1) % N; if ((T.f[i] & 1) || (T.f[j] & 1)) { lenU += T.ds / (w * 2); continue; }
      var v0 = lenU, v1 = lenU + T.ds / (w * 2); lenU = v1;
      var A = edgePts(T, i, w), B = edgePts(T, j, w);
      var ya = yAt(i, A[0], A[1]), yb = yAt(i, A[2], A[3]), yc = yAt(j, B[0], B[1]), yd = yAt(j, B[2], B[3]);
      pos.push(A[0], ya, A[1], B[0], yc, B[1], A[2], yb, A[3], A[2], yb, A[3], B[0], yc, B[1], B[2], yd, B[3]);
      uv.push(0, v0, 0, v1, 1, v0, 1, v0, 0, v1, 1, v1);
      for (var k = 0; k < 6; k++) nor.push(0, 1, 0);
    }
    var gg = new THREE.BufferGeometry();
    gg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); gg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); gg.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    var m = new THREE.Mesh(gg, new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide }));
    m.renderOrder = 1;
    return m;
  }
  function edgePts(T, i, w) { return [T.x[i] - T.tz[i] * w, T.z[i] + T.tx[i] * w, T.x[i] + T.tz[i] * w, T.z[i] - T.tx[i] * w]; }

  // schmale Streifen auf der Fahrbahn (Turbo, Start)
  function stripMesh(T, pick, w, lift, mat, key, along) {
    var pos = [], uv = [], N = T.N, any = false, run = 0;
    for (var i = 0; i < N; i++) {
      var j = (i + 1) % N; if (!pick(i) || !pick(j) || (T.f[i] & 1)) { run = 0; continue; }
      any = true; var A = edgePts(T, i, w), B = edgePts(T, j, w);
      var h0 = (T.h[i] < 0.01 ? T.hill(T.x[i], T.z[i]) : T.h[i]) + lift, h1 = (T.h[j] < 0.01 ? T.hill(T.x[j], T.z[j]) : T.h[j]) + lift;
      var v0 = run, v1 = run + T.ds / (w * 2); run = v1;
      pos.push(A[0], h0, A[1], B[0], h1, B[1], A[2], h0, A[3], A[2], h0, A[3], B[0], h1, B[1], B[2], h1, B[3]);
      if (along) uv.push(0, v0, 0, v1, 1, v0, 1, v0, 0, v1, 1, v1); else uv.push(0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1);
    }
    if (!any) return null;
    var gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); gg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    mat.side = THREE.DoubleSide;
    return new THREE.Mesh(gg, mat);
  }

  // Unterbau erhöhter Abschnitte (Bücher, Kisten, Brücken) und Seitenwände
  function supports(b, T, key) {
    var N = T.N, W = T.W, cols = SUPPORT[key], seg = 0;
    for (var i = 0; i < N; i++) {
      var j = (i + 1) % N; if ((T.f[i] & 1) || (T.f[j] & 1)) continue;
      var hi = T.h[i], hj = T.h[j]; if (hi < 0.05 && hj < 0.05) continue;
      var bridge = T.f[i] & 2, col = cols[Math.floor(i * T.ds / 6) % cols.length];
      var A = edgePts(T, i, W), B = edgePts(T, j, W), a = edgePts(T, i, T.w), bb = edgePts(T, j, T.w);
      var bi = bridge ? hi - 0.35 : -0.02, bj = bridge ? hj - 0.35 : -0.02;
      // Seitenwände
      quad(b, col, A[0], hi, A[1], B[0], hj, B[1], B[0], bj, B[1], A[0], bi, A[1]);
      quad(b, col, A[2], hi, A[3], A[2], bi, A[3], B[2], bj, B[3], B[2], hj, B[3]);
      // Deckrand zwischen Fahrbahn und Kante
      quad(b, col, A[0], hi + 0.02, A[1], a[0], hi + 0.02, a[1], bb[0], hj + 0.02, bb[1], B[0], hj + 0.02, B[1]);
      quad(b, col, a[2], hi + 0.02, a[3], A[2], hi + 0.02, A[3], B[2], hj + 0.02, B[3], bb[2], hj + 0.02, bb[3]);
      if (bridge) quad(b, '#555', A[0], bi, A[1], A[2], bi, A[3], B[2], bj, B[3], B[0], bj, B[1]);
      // Lückenkanten bekommen eine Stirnseite
      var pj = (i - 1 + N) % N; if (T.f[pj] & 1) quad(b, col, A[0], hi, A[1], A[2], hi, A[3], A[2], -0.02, A[3], A[0], -0.02, A[1]);
      var nj = (j + 1) % N; if (T.f[nj] & 1) quad(b, col, B[0], hj, B[1], B[0], -0.02, B[1], B[2], -0.02, B[3], B[2], hj, B[3]);
      seg++;
    }
    // Brückenpfeiler
    for (i = 0; i < N; i += 6) if ((T.f[i] & 2) && !(T.f[(i + 6) % N] & 2)) { for (var s = -1; s <= 1; s += 2) b.add(G.box(), '#777', T.x[i] + T.tz[i] * W * 0.9 * s, T.h[i] / 2, T.z[i] - T.tx[i] * W * 0.9 * s, 0, 0, 0, 0.6, T.h[i], 0.6); }
  }
  var _tri = null;
  function quad(b, col, ax, ay, az, bx, by, bz, cx, cy, cz, dx, dy, dz) {
    var g = new THREE.BufferGeometry(), p = [ax, ay, az, bx, by, bz, cx, cy, cz, ax, ay, az, cx, cy, cz, dx, dy, dz];
    g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); g.computeVertexNormals();
    b.addM(g, col, new THREE.Matrix4()); g.dispose();
    // Rückseite (doppelseitig ohne zweites Material)
    var g2 = new THREE.BufferGeometry(); g2.setAttribute('position', new THREE.Float32BufferAttribute([ax, ay, az, cx, cy, cz, bx, by, bz, ax, ay, az, dx, dy, dz, cx, cy, cz], 3)); g2.computeVertexNormals();
    b.addM(g2, col, new THREE.Matrix4()); g2.dispose();
  }

  function startArch(b, T) {
    var i = 0, W = T.W + 0.6, h = T.h[0] + (T.h[0] < 0.01 ? T.hill(T.x[0], T.z[0]) : 0), a = T.heading(0);
    var c = new Ctx(b, T.x[0], T.z[0], h, a, 1);
    var hgt = T.theme.veh === 'heli' ? 6 : 4.2;
    c.add(G.cyl(8), '#ffffff', -W, hgt / 2, 0, 0.35, hgt, 0.35); c.add(G.cyl(8), '#ffffff', W, hgt / 2, 0, 0.35, hgt, 0.35);
    c.add(G.box(), '#ff2d95', 0, hgt, 0, W * 2 + 0.8, 0.9, 0.3);
    for (var k = 0; k < 8; k++) c.add(G.box(), k % 2 ? '#111' : '#fff', -W + 0.4 + k * (W * 2 - 0.8) / 7, hgt + 0.6, 0, (W * 2) / 8, 0.3, 0.32);
  }

  function scatter(b, T, key) {
    var g = T.theme.ground, r = WF.rng(T.def.id.charCodeAt(1) * 97 + 13), n = { breakfast: 70, desk: 26, garden: 260, sandbox: 60, workbench: 60, kids: 30, pool: 0, bath: 0 }[key];
    for (var k = 0; k < n; k++) {
      var x = g.x + (r() - 0.5) * (g.w - 4), z = g.z + (r() - 0.5) * (g.d - 4), ok = true;
      T.near(x, z, T.W + 2, function (i) { if (Math.hypot(x - T.x[i], z - T.z[i]) < T.W + 1.2) ok = false; });
      for (var q = 0; q < T.solids.length && ok; q++) if (WF.inSolid(T.solids[q], x, z, 0.8)) ok = false;
      if (!ok) continue;
      var y = key === 'sandbox' ? T.hill(x, z) : 0, rot = r() * 6.28;
      switch (key) {
        case 'breakfast': b.add(G.box(), r() < 0.5 ? '#d9a35b' : '#b5712f', x, 0.12, z, r(), rot, r(), 0.35 + r() * 0.4, 0.25, 0.35 + r() * 0.3); break;
        case 'desk': b.add(G.cone(6), '#e2b77a', x, 0.1, z, 0, rot, Math.PI / 2, 0.6, 0.5, 0.6); break;
        case 'garden': b.add(G.cone(4), r() < 0.5 ? '#3f9b3f' : '#6cc04a', x, 0.5, z, 0, rot, 0, 0.5, 1 + r() * 0.8, 0.5); break;
        case 'sandbox': b.add(new THREE.IcosahedronGeometry(1, 0), '#b9a27a', x, y + 0.1, z, r(), rot, 0, 0.3 + r() * 0.3); break;
        case 'workbench': if (r() < 0.5) b.add(G.box(), '#f0d9a8', x, 0.03, z, 0, rot, 0, 1.4, 0.05, 0.5); else b.add(G.cyl(6), '#9aa5b1', x, 0.15, z, 0, rot, Math.PI / 2, 0.2, 2.2, 0.2); break;
        case 'kids': var cc = ['#e63946', '#ffb703', '#219ebc', '#8ac926'][k % 4]; b.add(G.box(), cc, x, 0.4, z, 0, rot, 0, 1.6, 0.8, 0.8); b.add(G.cyl(6), cc, x, 0.9, z, 0, rot, 0, 0.45, 0.3, 0.45); break;
      }
    }
  }
})();
