/* Royal Radio Match 3D – originale 3D-Modelle aus Three.js-Grundkörpern (keine fremden Assets).
 * Jedes Modell ist EINE zusammengeführte Geometrie mit Vertex-Farben -> wenige Draw-Calls, geteilte Materialien.
 * Steine: Mikrofon, Kopfhörer, Schallplatte, Sendeturm, Equalizer, Radio, Fader. Dazu Spezialteile, Gegenstände, Hindernisse. */
(function (root) {
  'use strict';
  var RRM = root.RRM || (root.RRM = {});
  var T = root.THREE;

  function M(x, y, z, rx, ry, rz, sx, sy, sz) {
    var m = new T.Matrix4().makeRotationFromEuler(new T.Euler(rx || 0, ry || 0, rz || 0));
    if (sx) m.scale(new T.Vector3(sx, sy || sx, sz || sx));
    m.setPosition(x || 0, y || 0, z || 0);
    return m;
  }
  // parts: [{ g: Geometrie, c: Farbe, m: Matrix, c2: Farbe oben (Verlauf) }]
  function merge(parts) {
    var pos = [], nor = [], col = [], a = new T.Color(), b = new T.Color(), tmp = new T.Color();
    parts.forEach(function (p) {
      var g = p.g.index ? p.g.toNonIndexed() : p.g.clone();
      if (p.m) g.applyMatrix4(p.m);
      g.computeBoundingBox();
      var P = g.attributes.position.array, N = g.attributes.normal.array, y0 = g.boundingBox.min.y, y1 = g.boundingBox.max.y;
      a.set(p.c); b.set(p.c2 != null ? p.c2 : p.c);
      for (var i = 0; i < P.length; i += 3) {
        pos.push(P[i], P[i + 1], P[i + 2]); nor.push(N[i], N[i + 1], N[i + 2]);
        var k = y1 > y0 ? (P[i + 1] - y0) / (y1 - y0) : 0;
        tmp.copy(a).lerp(b, k); col.push(tmp.r, tmp.g, tmp.b);
      }
      g.dispose(); p.g.dispose && p.g !== g && p.g.dispose();
    });
    var o = new T.BufferGeometry();
    o.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    o.setAttribute('normal', new T.Float32BufferAttribute(nor, 3));
    o.setAttribute('color', new T.Float32BufferAttribute(col, 3));
    o.computeBoundingSphere();
    return o;
  }
  var cyl = function (rt, rb, h, s, open) { return new T.CylinderGeometry(rt, rb, h, s || 14, 1, !!open); };
  var box = function (w, h, d) { return new T.BoxGeometry(w, h, d); };
  var sph = function (r, ws, hs) { return new T.SphereGeometry(r, ws || 14, hs || 10); };
  var tor = function (r, t, rs, ts, arc) { return new T.TorusGeometry(r, t, rs || 8, ts || 20, arc); };
  var cone = function (r, h, s) { return new T.ConeGeometry(r, h, s || 12); };
  var shade = function (hex, f) { var c = new T.Color(hex); c.multiplyScalar(f); return c.getHex(); };
  var light = function (hex, f) { var c = new T.Color(hex); c.lerp(new T.Color(0xffffff), f); return c.getHex(); };

  // ---------- Steine (stehen auf y=0, Vorderseite +Z) ----------
  // Kräftige, gut lesbare Formen wie Spielsymbole: das Brett dreht sie zur Kamera und bringt sie auf gleiche Größe.
  var PIECE_BUILD = [
    function mic() {
      var G = 0xffc531, D = 0xb77a0c;
      return merge([
        { g: cyl(0.1, 0.13, 0.36, 14), c: 0x2b2d3a, c2: 0x50536a, m: M(0, 0.18, 0) },
        { g: cyl(0.17, 0.14, 0.1, 18), c: D, c2: G, m: M(0, 0.4, 0) },
        { g: sph(0.32, 20, 14), c: shade(G, 0.85), c2: light(G, 0.45), m: M(0, 0.7, 0) },
        { g: tor(0.32, 0.035, 8, 26), c: D, m: M(0, 0.7, 0, Math.PI / 2) },
        { g: sph(0.07, 10, 8), c: 0xffffff, m: M(-0.12, 0.84, 0.24) }
      ]);
    },
    function headphones() {
      var C = 0x22d6c8, D = 0x0d8a82;
      return merge([
        { g: tor(0.33, 0.085, 10, 24, Math.PI), c: C, c2: light(C, 0.35), m: M(0, 0.4, 0) },
        { g: tor(0.33, 0.05, 8, 24, Math.PI), c: 0x16323a, m: M(0, 0.4, -0.05) },
        { g: cyl(0.2, 0.2, 0.2, 20), c: shade(C, 0.9), c2: light(C, 0.3), m: M(-0.33, 0.3, 0, 0, 0, Math.PI / 2) },
        { g: cyl(0.2, 0.2, 0.2, 20), c: shade(C, 0.9), c2: light(C, 0.3), m: M(0.33, 0.3, 0, 0, 0, Math.PI / 2) },
        { g: cyl(0.15, 0.15, 0.06, 18), c: 0x16323a, m: M(-0.2, 0.3, 0, 0, 0, Math.PI / 2) },
        { g: cyl(0.15, 0.15, 0.06, 18), c: 0x16323a, m: M(0.2, 0.3, 0, 0, 0, Math.PI / 2) },
        { g: cyl(0.1, 0.1, 0.21, 14), c: D, m: M(-0.34, 0.3, 0, 0, 0, Math.PI / 2) },
        { g: cyl(0.1, 0.1, 0.21, 14), c: D, m: M(0.34, 0.3, 0, 0, 0, Math.PI / 2) }
      ]);
    },
    function vinyl() {
      var V = 0x8a46f5;
      return merge([
        { g: cyl(0.42, 0.42, 0.12, 30), c: shade(V, 0.75), c2: light(V, 0.3), m: M(0, 0.42, 0, Math.PI / 2) },
        { g: tor(0.34, 0.016, 4, 30), c: 0x3a1680, m: M(0, 0.42, 0.06) },
        { g: tor(0.27, 0.016, 4, 30), c: 0x3a1680, m: M(0, 0.42, 0.06) },
        { g: tor(0.39, 0.02, 4, 30), c: 0xd9bdff, m: M(0, 0.42, 0.06) },
        { g: cyl(0.16, 0.16, 0.14, 22), c: 0xffd84a, c2: 0xfff2b0, m: M(0, 0.42, 0, Math.PI / 2) },
        { g: cyl(0.04, 0.04, 0.15, 8), c: 0x15101f, m: M(0, 0.42, 0, Math.PI / 2) },
        { g: sph(0.06, 8, 6), c: 0xffffff, m: M(-0.2, 0.62, 0.06, 0, 0, 0, 1, 1, 0.4) }
      ]);
    },
    function tower() {
      var B = 0x3f86ff, L = 0xbcd8ff, p = [
        { g: cone(0.46, 0.8, 4), c: shade(B, 0.8), c2: light(B, 0.25), m: M(0, 0.44, 0, 0, Math.PI / 4) },
        { g: box(0.66, 0.1, 0.4), c: shade(B, 0.6), m: M(0, 0.05, 0) },
        { g: sph(0.12, 14, 10), c: 0xfff3a0, c2: 0xffffff, m: M(0, 0.82, 0) }
      ];
      [0.24, 0.42].forEach(function (y, j) { p.push({ g: box(0.5 - j * 0.18, 0.06, 0.36 - j * 0.12), c: 0xffffff, m: M(0, y, 0.04) }); });
      [0.24].forEach(function (r) {
        p.push({ g: tor(r, 0.05, 6, 14, Math.PI * 0.5), c: 0xffffff, c2: L, m: M(0, 0.82, 0.04, 0, 0, Math.PI / 4 * -1) });
        p.push({ g: tor(r, 0.05, 6, 14, Math.PI * 0.5), c: 0xffffff, c2: L, m: M(0, 0.82, 0.04, 0, 0, Math.PI * 0.75) });
      });
      return merge(p);
    },
    function equalizer() {
      var G = 0x41d65a, p = [{ g: box(0.78, 0.12, 0.3), c: 0x1b5a28, c2: 0x2c7a3a, m: M(0, 0.06, 0) }];
      [0.42, 0.7, 0.54, 0.82].forEach(function (h, i) {
        var x = -0.27 + i * 0.18;
        p.push({ g: box(0.15, h, 0.2), c: shade(G, 0.7), c2: light(G, 0.3), m: M(x, 0.12 + h / 2, 0) });
        p.push({ g: box(0.16, 0.06, 0.21), c: 0xeaffdf, m: M(x, 0.14 + h, 0) });
      });
      return merge(p);
    },
    function radio() {
      var R = 0xff4a4a;
      return merge([
        { g: box(0.78, 0.54, 0.3), c: shade(R, 0.75), c2: light(R, 0.2), m: M(0, 0.3, 0) },
        { g: cyl(0.17, 0.17, 0.06, 22), c: 0x4a1010, m: M(-0.17, 0.28, 0.14, Math.PI / 2) },
        { g: tor(0.17, 0.03, 6, 22), c: 0xffe0d6, m: M(-0.17, 0.28, 0.17) },
        { g: box(0.24, 0.11, 0.04), c: 0xfff1c9, m: M(0.19, 0.38, 0.15) },
        { g: cyl(0.055, 0.055, 0.06, 12), c: 0xffd36b, m: M(0.13, 0.19, 0.16, Math.PI / 2) },
        { g: cyl(0.055, 0.055, 0.06, 12), c: 0xffd36b, m: M(0.26, 0.19, 0.16, Math.PI / 2) },
        { g: tor(0.2, 0.04, 6, 16, Math.PI), c: shade(R, 0.5), m: M(0, 0.57, 0) },
        { g: cyl(0.02, 0.02, 0.4, 6), c: 0xeeeeee, m: M(0.28, 0.75, -0.06, 0, 0, -0.5) },
        { g: sph(0.05, 8, 6), c: 0xffffff, m: M(0.38, 0.93, -0.06) }
      ]);
    },
    function fader() {
      var O = 0xff9326;
      return merge([
        { g: box(0.5, 0.82, 0.16), c: 0x4a3322, c2: 0x6e5038, m: M(0, 0.41, 0) },
        { g: box(0.07, 0.66, 0.03), c: 0x120c08, m: M(0, 0.41, 0.085) },
        { g: box(0.44, 0.18, 0.18), c: shade(O, 0.85), c2: light(O, 0.4), m: M(0, 0.54, 0.1) },
        { g: box(0.44, 0.03, 0.19), c: 0xffffff, m: M(0, 0.54, 0.105) },
        { g: box(0.1, 0.03, 0.03), c: 0xffc27a, m: M(-0.17, 0.2, 0.085) },
        { g: box(0.1, 0.03, 0.03), c: 0xffc27a, m: M(-0.17, 0.32, 0.085) },
        { g: box(0.1, 0.03, 0.03), c: 0xffc27a, m: M(0.17, 0.2, 0.085) },
        { g: box(0.1, 0.03, 0.03), c: 0xffc27a, m: M(0.17, 0.32, 0.085) }
      ]);
    }
  ];
  var PIECE_HEX = [0xffc531, 0x22d6c8, 0xa45cff, 0x3f86ff, 0x41d65a, 0xff4a4a, 0xff9326];

  var cache = {};
  function get(key, fn) { return cache[key] || (cache[key] = fn()); }

  function piece(k) { return get('p' + k, PIECE_BUILD[k]); }
  function bomb(k) {
    return get('bomb' + k, function () {
      var c = k >= 0 ? PIECE_HEX[k] : 0xffffff;
      return merge([
        { g: box(0.62, 0.62, 0.36), c: 0x1b1b24, c2: 0x34343f, m: M(0, 0.34, 0) },
        { g: cyl(0.25, 0.25, 0.06, 20), c: c, c2: light(c, 0.4), m: M(0, 0.38, 0.17, Math.PI / 2) },
        { g: cone(0.18, 0.12, 18), c: shade(c, 0.6), m: M(0, 0.38, 0.22, -Math.PI / 2) },
        { g: sph(0.06), c: 0xffffff, m: M(0, 0.38, 0.27) },
        { g: tor(0.25, 0.025, 6, 20), c: 0xffe27a, m: M(0, 0.38, 0.2) },
        { g: box(0.18, 0.04, 0.02), c: c, m: M(0, 0.6, 0.18) }
      ]);
    });
  }
  function drone(k) {
    return get('drone' + k, function () {
      var c = k >= 0 ? PIECE_HEX[k] : 0xffffff, p = [
        { g: sph(0.17, 14, 10), c: c, c2: light(c, 0.4), m: M(0, 0.4, 0, 0, 0, 0, 1, 0.7, 1) },
        { g: sph(0.07, 10, 8), c: 0x16202a, m: M(0, 0.38, 0.14) }
      ];
      for (var i = 0; i < 4; i++) {
        var a = Math.PI / 4 + i * Math.PI / 2, x = Math.cos(a) * 0.28, z = Math.sin(a) * 0.28;
        p.push({ g: box(0.3, 0.035, 0.05), c: 0x2a2f38, m: M(x / 2, 0.42, z / 2, 0, -a, 0) });
        p.push({ g: cyl(0.12, 0.12, 0.02, 16), c: 0xdfe8f2, m: M(x, 0.46, z) });
        p.push({ g: cyl(0.03, 0.03, 0.06, 8), c: 0x2a2f38, m: M(x, 0.43, z) });
      }
      return merge(p);
    });
  }
  function rainbow(g, m) {
    g = g.index ? g.toNonIndexed() : g; g.applyMatrix4(m);
    var P = g.attributes.position.array, col = [], c = new T.Color();
    for (var i = 0; i < P.length; i += 3) { c.setHSL(((Math.atan2(P[i + 2], P[i]) / (Math.PI * 2) + 0.5) + P[i + 1] * 0.9) % 1, 0.85, 0.6); col.push(c.r, c.g, c.b); }
    g.setAttribute('color', new T.Float32BufferAttribute(col, 3));
    return g;
  }
  function orb() {
    return get('orb', function () {
      var a = rainbow(sph(0.32, 20, 14), M(0, 0.44, 0)), b = merge([{ g: tor(0.4, 0.035, 6, 28), c: 0xffffff, m: M(0, 0.44, 0, Math.PI / 2.4) }, { g: cyl(0.2, 0.24, 0.06, 16), c: 0x2b2440, m: M(0, 0.03, 0) }]);
      return joinGeo([a, b]);
    });
  }
  function remix() {
    return get('remix', function () {
      var a = rainbow(new T.TorusKnotGeometry(0.2, 0.07, 48, 8), M(0, 0.45, 0)), b = merge([{ g: cyl(0.22, 0.26, 0.06, 16), c: 0x2b2440, m: M(0, 0.03, 0) }, { g: sph(0.08), c: 0xffffff, m: M(0, 0.45, 0) }]);
      return joinGeo([a, b]);
    });
  }
  function joinGeo(list) {
    var pos = [], nor = [], col = [];
    list.forEach(function (g) {
      g = g.index ? g.toNonIndexed() : g;
      pos.push.apply(pos, g.attributes.position.array); nor.push.apply(nor, g.attributes.normal.array); col.push.apply(col, g.attributes.color.array);
    });
    var o = new T.BufferGeometry();
    o.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); o.setAttribute('normal', new T.Float32BufferAttribute(nor, 3)); o.setAttribute('color', new T.Float32BufferAttribute(col, 3));
    o.computeBoundingSphere();
    return o;
  }
  function cassette() {
    return get('cassette', function () {
      return merge([
        { g: box(0.62, 0.4, 0.1), c: 0x2b2f3a, c2: 0x3d4250, m: M(0, 0.3, 0) },
        { g: box(0.5, 0.16, 0.02), c: 0xffd36b, m: M(0, 0.38, 0.055) },
        { g: box(0.3, 0.1, 0.02), c: 0x11131a, m: M(0, 0.24, 0.055) },
        { g: cyl(0.06, 0.06, 0.03, 12), c: 0xf4f4f4, m: M(-0.09, 0.24, 0.06, Math.PI / 2) },
        { g: cyl(0.06, 0.06, 0.03, 12), c: 0xf4f4f4, m: M(0.09, 0.24, 0.06, Math.PI / 2) },
        { g: box(0.5, 0.04, 0.02), c: 0xff4a4a, m: M(0, 0.44, 0.06) }
      ]);
    });
  }
  function parcel() {
    return get('parcel', function () {
      return merge([
        { g: box(0.56, 0.5, 0.4), c: 0xc98a4b, c2: 0xe0a868, m: M(0, 0.27, 0) },
        { g: box(0.58, 0.08, 0.42), c: 0xff3f6c, m: M(0, 0.27, 0) },
        { g: box(0.08, 0.52, 0.42), c: 0xff3f6c, m: M(0, 0.27, 0) },
        { g: cyl(0.16, 0.16, 0.03, 18), c: 0x2a1440, m: M(0, 0.57, 0) },
        { g: cyl(0.06, 0.06, 0.035, 12), c: 0xffd36b, m: M(0, 0.57, 0) }
      ]);
    });
  }

  // ---------- Hindernisse ----------
  function crate(hp) {
    return get('crate' + hp, function () {
      var W = [0, 0xc48a4f, 0xa66b38, 0x8a5a33][hp], p = [{ g: box(0.9, 0.62, 0.9), c: shade(W, 0.85), c2: W, m: M(0, 0.31, 0) }];
      [-0.3, 0, 0.3].forEach(function (z) { p.push({ g: box(0.92, 0.04, 0.05), c: shade(W, 0.6), m: M(0, 0.63, z) }); });
      p.push({ g: box(0.05, 0.6, 0.92), c: shade(W, 0.6), m: M(-0.42, 0.31, 0) }, { g: box(0.05, 0.6, 0.92), c: shade(W, 0.6), m: M(0.42, 0.31, 0) });
      if (hp >= 2) p.push({ g: box(0.94, 0.08, 0.94), c: 0x9aa3ad, m: M(0, 0.18, 0) });
      if (hp >= 3) p.push({ g: box(0.94, 0.08, 0.94), c: 0x9aa3ad, m: M(0, 0.46, 0) }, { g: box(0.12, 0.12, 0.02), c: 0xffd36b, m: M(0, 0.32, 0.47) });
      return merge(p);
    });
  }
  function moss() {
    return get('moss', function () {
      var p = [{ g: box(0.9, 0.18, 0.9), c: 0x245c22, m: M(0, 0.09, 0) }];
      [[-0.22, -0.2, 0.22], [0.2, -0.18, 0.2], [0, 0.18, 0.26], [-0.2, 0.22, 0.18], [0.24, 0.22, 0.17], [0, 0, 0.3]].forEach(function (s) {
        p.push({ g: sph(s[2], 10, 8), c: 0x3fae37, c2: 0x9bf27a, m: M(s[0], 0.22, s[1]) });
      });
      p.push({ g: sph(0.05, 6, 5), c: 0xff7ad9, m: M(0.08, 0.5, 0.12) }, { g: sph(0.05, 6, 5), c: 0xfff27a, m: M(-0.16, 0.44, -0.05) });
      return merge(p);
    });
  }
  function barrier() {
    return get('barrier', function () {
      var p = [{ g: box(0.92, 0.7, 0.92), c: 0x30343c, c2: 0x474c57, m: M(0, 0.35, 0) }];
      for (var i = 0; i < 4; i++) p.push({ g: box(0.18, 0.72, 0.94), c: i % 2 ? 0xffffff : 0xff3b3b, m: M(-0.33 + i * 0.22, 0.35, 0, 0, 0, 0.5) });
      p.push({ g: box(0.3, 0.26, 0.1), c: 0xffd36b, m: M(0, 0.4, 0.47) }, { g: tor(0.08, 0.025, 6, 12, Math.PI), c: 0xd9d9d9, m: M(0, 0.55, 0.47) });
      return merge(p);
    });
  }
  function dusty(hp) {
    return get('dusty' + hp, function () {
      var p = [{ g: cyl(0.42, 0.42, 0.08, 24), c: 0x2a1840, m: M(0, 0.05, 0) }, { g: cyl(0.15, 0.15, 0.09, 16), c: 0xe0c7ff, m: M(0, 0.06, 0) }];
      var spots = [[-0.18, 0.1, 0.17], [0.16, -0.14, 0.16], [0.05, 0.22, 0.14], [-0.2, -0.18, 0.13], [0.24, 0.12, 0.12], [0, 0, 0.2]];
      spots.slice(0, hp * 2).forEach(function (s) { p.push({ g: sph(s[2], 8, 6), c: 0x9a9184, c2: 0xc9c2b4, m: M(s[0], 0.12, s[1], 0, 0, 0, 1, 0.45, 1) }); });
      return merge(p);
    });
  }
  function amp(charge) {
    return get('amp' + charge, function () {
      var p = [{ g: box(0.84, 0.5, 0.6), c: 0x3a2a1e, c2: 0x55402e, m: M(0, 0.25, 0) }, { g: box(0.7, 0.24, 0.02), c: 0x1b120c, m: M(0, 0.24, 0.31) }];
      for (var i = 0; i < 3; i++) {
        var lit = i < charge;
        p.push({ g: cyl(0.08, 0.08, 0.28, 10), c: lit ? 0xffb347 : 0x6b6b6b, c2: lit ? 0xfff0b0 : 0x9a9a9a, m: M(-0.24 + i * 0.24, 0.64, 0) });
        p.push({ g: sph(0.08, 10, 6), c: lit ? 0xfff0b0 : 0x9a9a9a, m: M(-0.24 + i * 0.24, 0.78, 0) });
      }
      p.push({ g: cyl(0.05, 0.05, 0.04, 10), c: 0xffd36b, m: M(-0.25, 0.3, 0.32, Math.PI / 2) }, { g: cyl(0.05, 0.05, 0.04, 10), c: 0xffd36b, m: M(0.25, 0.3, 0.32, Math.PI / 2) });
      return merge(p);
    });
  }
  function antenna(hp) {
    return get('antenna' + hp, function () {
      var p = [{ g: box(0.7, 0.14, 0.7), c: 0x5b6470, m: M(0, 0.07, 0) }, { g: cyl(0.04, 0.05, 0.64, 8), c: 0xc8d0d8, m: M(0, 0.44, 0, 0, 0, hp > 1 ? 0.35 : 0) }];
      p.push({ g: new T.SphereGeometry(0.24, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2.4), c: 0xe6ebf0, m: M(hp > 1 ? 0.15 : 0, 0.66, 0.06, -1.1, 0, hp > 1 ? 0.4 : 0) });
      for (var i = 0; i < 3; i++) p.push({ g: sph(0.045, 6, 5), c: i < 3 - hp + 1 ? 0x41d65a : 0xff4a4a, m: M(-0.2 + i * 0.2, 0.16, 0.33) });
      return merge(p);
    });
  }
  function jammer() {
    return get('jammer', function () {
      var p = [{ g: box(0.86, 0.6, 0.86), c: 0x46121a, c2: 0x7a1d2a, m: M(0, 0.3, 0) }, { g: cyl(0.2, 0.2, 0.05, 18), c: 0x111111, m: M(0, 0.32, 0.44, Math.PI / 2) }];
      for (var i = 0; i < 4; i++) { var a = i * Math.PI / 2 + Math.PI / 4; p.push({ g: cone(0.08, 0.24, 6), c: 0xc9c9c9, m: M(Math.cos(a) * 0.38, 0.7, Math.sin(a) * 0.38) }); }
      p.push({ g: cyl(0.02, 0.02, 0.3, 6), c: 0xcccccc, m: M(0, 0.75, 0) }, { g: sph(0.08), c: 0xff2a2a, m: M(0, 0.92, 0) });
      p.push({ g: tor(0.14, 0.02, 6, 16), c: 0xff5a5a, m: M(0, 0.32, 0.47) });
      return merge(p);
    });
  }
  function generator(k, charge, need) {
    return get('gen' + k + '_' + charge + '_' + need, function () {
      var c = PIECE_HEX[k] || 0xffffff, p = [{ g: cyl(0.38, 0.42, 0.26, 18), c: 0x2d3440, m: M(0, 0.13, 0) }, { g: cyl(0.22, 0.26, 0.4, 14), c: 0x46505f, c2: 0x6a7686, m: M(0, 0.46, 0) }];
      for (var i = 0; i < need; i++) {
        var a = i / need * Math.PI * 2, lit = i < charge;
        p.push({ g: box(0.12, 0.08, 0.06), c: lit ? c : 0x2a2a2a, m: M(Math.cos(a) * 0.34, 0.3, Math.sin(a) * 0.34, 0, -a, 0) });
      }
      p.push({ g: sph(0.13, 12, 8), c: charge >= need ? 0xffffff : c, c2: light(c, 0.5), m: M(0, 0.74, 0) });
      return merge(p);
    });
  }
  function shield(k, hp) {
    return get('shield' + k + '_' + hp, function () {
      var c = PIECE_HEX[k] || 0xffffff;
      var p = [{ g: cyl(0.44, 0.44, hp > 1 ? 0.34 : 0.2, 6), c: shade(c, 0.55), c2: light(c, 0.3), m: M(0, hp > 1 ? 0.17 : 0.1, 0) }];
      p.push({ g: cyl(0.36, 0.36, 0.03, 6), c: light(c, 0.55), m: M(0, hp > 1 ? 0.35 : 0.21, 0) });
      return merge(p);
    });
  }
  function rolling() {
    return get('rolling', function () {
      return merge([
        { g: cyl(0.4, 0.4, 0.12, 24), c: 0x1c1028, m: M(0, 0.42, 0, Math.PI / 2) },
        { g: tor(0.3, 0.015, 4, 24), c: 0x6d4aa0, m: M(0, 0.42, 0.065) },
        { g: tor(0.22, 0.015, 4, 24), c: 0x6d4aa0, m: M(0, 0.42, 0.065) },
        { g: cyl(0.13, 0.13, 0.13, 16), c: 0xff9326, m: M(0, 0.42, 0, Math.PI / 2) }
      ]);
    });
  }
  function switchBox(on) {
    return get('switch' + (on ? 1 : 0), function () {
      return merge([
        { g: box(0.8, 0.3, 0.8), c: 0x2c3e50, c2: 0x3f5870, m: M(0, 0.15, 0) },
        { g: box(0.5, 0.06, 0.2), c: 0x111, m: M(0, 0.31, 0) },
        { g: cyl(0.03, 0.03, 0.4, 8), c: 0xd0d0d0, m: M(0, 0.48, 0, 0.5) },
        { g: sph(0.08), c: on ? 0x41d65a : 0xff4a4a, m: M(0, 0.66, -0.1) }
      ]);
    });
  }
  function cable(hp) {
    return get('cable' + hp, function () {
      var p = [], cols = [0x111111, 0xff4a4a, 0x2f7bff, 0xffd400];
      var n = hp > 1 ? 4 : 2;
      for (var i = 0; i < n; i++) p.push({ g: tor(0.34 - i * 0.02, 0.03, 6, 18), c: cols[i % 4], m: M(0, 0.18 + i * 0.16, 0, Math.PI / 2 + (i % 2 ? 0.35 : -0.35), i * 0.7, 0) });
      p.push({ g: box(0.12, 0.12, 0.12), c: 0x777777, m: M(0.28, 0.26, 0.2) });
      return merge(p);
    });
  }
  var GEO = {
    tile: null, ice: null, glass: null, noise: null, ring: null, arrow: null, shieldGlass: null
  };
  function shared() {
    if (GEO.tile) return GEO;
    GEO.ice = new T.BoxGeometry(0.9, 0.86, 0.9); GEO.ice.translate(0, 0.43, 0);
    GEO.glass = new T.BoxGeometry(0.86, 0.8, 0.86); GEO.glass.translate(0, 0.4, 0);
    GEO.noise = new T.PlaneGeometry(0.96, 0.96).rotateX(-Math.PI / 2); GEO.noise.translate(0, 0.012, 0);
    GEO.ring = new T.TorusGeometry(0.42, 0.045, 8, 28).rotateX(Math.PI / 2);
    GEO.tile = true;
    // Raketen-Pfeil (liegt flach, zeigt in X-Richtung)
    GEO.arrow = merge([{ g: box(0.62, 0.05, 0.1), c: 0xffffff, m: M(0, 0, 0) }, { g: cone(0.11, 0.2, 4), c: 0xffffff, m: M(0.38, 0, 0, 0, 0, -Math.PI / 2) }, { g: cone(0.11, 0.2, 4), c: 0xffffff, m: M(-0.38, 0, 0, 0, 0, Math.PI / 2) }]);
    return GEO;
  }

  // ---------- Booster-Symbole (nur als Bild in der Leiste) ----------
  var BOOST_BUILD = {
    hammer: function () {
      return merge([
        { g: cyl(0.06, 0.07, 0.8, 10), c: 0x8a4a1c, c2: 0xc77a3a, m: M(0.05, 0.4, 0, 0, 0, -0.5) },
        { g: box(0.62, 0.3, 0.3), c: 0xe0a21a, c2: 0xffe27a, m: M(-0.12, 0.78, 0, 0, 0, -0.5) },
        { g: box(0.08, 0.34, 0.34), c: 0xd8282e, m: M(-0.38, 0.92, 0, 0, 0, -0.5) },
        { g: box(0.08, 0.34, 0.34), c: 0xd8282e, m: M(0.15, 0.64, 0, 0, 0, -0.5) },
        { g: sph(0.08, 10, 8), c: 0xffd84a, m: M(0.26, 0.04, 0) }
      ]);
    },
    laser: function () {
      return merge([
        { g: cyl(0.07, 0.07, 0.9, 10), c: 0x9a5a22, c2: 0xd28a44, m: M(0, 0.45, 0, 0, 0, Math.PI / 2) },
        { g: cone(0.24, 0.4, 4), c: 0xffc531, c2: 0xfff1a0, m: M(0.6, 0.45, 0, 0, 0, -Math.PI / 2) },
        { g: box(0.34, 0.28, 0.05), c: 0xd8282e, m: M(-0.36, 0.6, 0, 0, 0, 0.55) },
        { g: box(0.34, 0.28, 0.05), c: 0xd8282e, m: M(-0.36, 0.3, 0, 0, 0, -0.55) },
        { g: box(0.3, 0.06, 0.06), c: 0xffd84a, m: M(-0.36, 0.45, 0) }
      ]);
    },
    blitz: function () {
      return merge([
        { g: cyl(0.17, 0.22, 0.78, 16), c: 0x2b2f3d, c2: 0x5a6078, m: M(0.04, 0.5, 0, 0, 0, 0.9) },
        { g: tor(0.19, 0.04, 6, 16), c: 0xffc531, m: M(0.32, 0.7, 0, 0, Math.PI / 2, 0.9) },
        { g: tor(0.22, 0.04, 6, 16), c: 0xffc531, m: M(-0.12, 0.38, 0, 0, Math.PI / 2, 0.9) },
        { g: cyl(0.24, 0.24, 0.07, 16), c: 0x8a4a1c, c2: 0xc77a3a, m: M(-0.05, 0.24, 0.2, Math.PI / 2) },
        { g: cyl(0.24, 0.24, 0.07, 16), c: 0x8a4a1c, c2: 0xc77a3a, m: M(-0.05, 0.24, -0.2, Math.PI / 2) },
        { g: sph(0.07, 8, 6), c: 0xffd84a, m: M(-0.05, 0.24, 0.25) }
      ]);
    },
    bass: function () {
      return merge([
        { g: cyl(0.38, 0.3, 0.42, 22), c: 0xb3141f, c2: 0xff4a4a, m: M(0, 0.32, 0) },
        { g: cyl(0.4, 0.4, 0.05, 22), c: 0xfff6e0, m: M(0, 0.55, 0) },
        { g: tor(0.4, 0.035, 6, 24), c: 0xffc531, m: M(0, 0.55, 0, Math.PI / 2) },
        { g: tor(0.31, 0.03, 6, 24), c: 0xffc531, m: M(0, 0.12, 0, Math.PI / 2) },
        { g: cyl(0.03, 0.03, 0.6, 8), c: 0xc77a3a, m: M(-0.18, 0.8, 0.05, 0, 0, 0.7) },
        { g: sph(0.07, 10, 8), c: 0xfff6e0, m: M(-0.39, 1.03, 0.05) },
        { g: cyl(0.03, 0.03, 0.6, 8), c: 0xc77a3a, m: M(0.18, 0.8, 0.05, 0, 0, -0.7) },
        { g: sph(0.07, 10, 8), c: 0xfff6e0, m: M(0.39, 1.03, 0.05) }
      ]);
    },
    shuffle: function () {
      var p = [{ g: cyl(0.36, 0.4, 0.16, 20), c: 0xffc531, c2: 0xffe27a, m: M(0, 0.08, 0) }];
      [[-0.32, 0x7b2fd6, 0.55], [0, 0xd8282e, 0], [0.32, 0x2a6be0, -0.55]].forEach(function (h) {
        p.push({ g: cone(0.17, 0.66, 12), c: shade(h[1], 0.75), c2: light(h[1], 0.25), m: M(h[0] * 0.75, 0.46, 0, 0, 0, h[2]) });
        p.push({ g: sph(0.08, 10, 8), c: 0xffd84a, m: M(h[0] * 0.75 - Math.sin(h[2]) * 0.34, 0.16 + Math.cos(h[2]) * 0.62, 0) });
      });
      return merge(p);
    },
    preRocket: function () {
      return merge([
        { g: cyl(0.16, 0.16, 0.6, 16), c: 0xd8282e, c2: 0xff6a5a, m: M(0, 0.5, 0, 0, 0, -0.7) },
        { g: cone(0.16, 0.28, 16), c: 0xffffff, m: M(0.31, 0.77, 0, 0, 0, -0.7) },
        { g: box(0.36, 0.14, 0.04), c: 0x2a6be0, m: M(-0.24, 0.3, 0, 0, 0, -0.7) },
        { g: box(0.04, 0.14, 0.36), c: 0x2a6be0, m: M(-0.24, 0.3, 0, 0, 0, -0.7) },
        { g: cone(0.12, 0.26, 10), c: 0xffc531, m: M(-0.36, 0.13, 0, 0, 0, Math.PI - 0.7) }
      ]);
    }
  };
  function boostIcon(id) {
    if (id === 'preBomb') return bomb(-1);
    if (id === 'preOrb') return orb();
    return BOOST_BUILD[id] ? get('b' + id, BOOST_BUILD[id]) : null;
  }

  // Sprite mit Text (Zahlen auf Schaltern, Störsender-HP)
  var spriteCache = {};
  function label(text, color) {
    var k = text + '|' + (color || '');
    if (spriteCache[k]) return spriteCache[k];
    var c = document.createElement('canvas'); c.width = c.height = 64;
    var g = c.getContext('2d');
    g.fillStyle = 'rgba(10,12,24,.82)'; g.beginPath(); g.arc(32, 32, 28, 0, Math.PI * 2); g.fill();
    g.lineWidth = 4; g.strokeStyle = color || '#ffd36b'; g.stroke();
    g.fillStyle = '#fff'; g.font = 'bold 34px system-ui,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 32, 34);
    var tex = new T.CanvasTexture(c);
    return (spriteCache[k] = new T.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  }

  RRM.Models = {
    M: M, merge: merge, PIECE_HEX: PIECE_HEX, shared: shared, label: label,
    piece: piece, bomb: bomb, drone: drone, orb: orb, remix: remix, cassette: cassette, parcel: parcel,
    crate: crate, moss: moss, barrier: barrier, dusty: dusty, amp: amp, antenna: antenna, jammer: jammer, generator: generator,
    shield: shield, rolling: rolling, switchBox: switchBox, cable: cable, boostIcon: boostIcon
  };
})(typeof window !== 'undefined' ? window : globalThis);
