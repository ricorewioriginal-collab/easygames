/* Royal Radio Match 3D – 3D-Spielbrett: Felder, Steine, Hindernisse, Effekte.
 * Spielt die Ereignisse der Engine (swap/wave/fall/collect/turn/shuffle/transform/end) als Animation ab und gleicht
 * danach IMMER mit dem echten Engine-Zustand ab (sync) – die Anzeige kann also nie dauerhaft falsch sein. */
(function (root) {
  'use strict';
  var RRM = root.RRM || (root.RRM = {});
  var T = root.THREE, MD;

  var ease = {
    lin: function (t) { return t; },
    out: function (t) { return 1 - (1 - t) * (1 - t); },
    inq: function (t) { return t * t; },
    io: function (t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; },
    back: function (t) { var c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
    drop: function (t) { if (t < 0.8) { var u = t / 0.8; return u * u; } var v = (t - 0.8) / 0.2; return 1 + Math.sin(v * Math.PI) * 0.06; }
  };

  function Board(stage, hooks) {
    MD = RRM.Models;
    this.stage = stage;
    this.hooks = hooks || {};
    this.scene = new T.Scene();
    this.camera = new T.PerspectiveCamera(36, 1, 0.5, 80);
    this.pitch = 1.02;   // Blickwinkel von oben (rad)
    this.insets = { top: 120, bottom: 110, side: 8 };
    this.tw = [];          // laufende Tweens
    this.q = [];           // Ereignis-Schritte
    this.stepEnd = 0;
    this.pieces = {};      // id -> Halter
    this.over = [];        // Zelle -> { b, c, n, keys }
    this.parts = [];
    this.beams = [];
    this.shake = 0;
    this.speed = 1;
    this.cb = false;
    this.sel = -1; this.hintCells = null; this.target = -1;
    this.t = 0;

    var hemi = new T.HemisphereLight(0xffffff, 0x334055, 0.82);
    var dir = new T.DirectionalLight(0xffffff, 0.75); dir.position.set(-3, 9, 6);
    var rim = new T.DirectionalLight(0x9fc7ff, 0.3); rim.position.set(4, 3, -6);
    this.scene.add(hemi, dir, rim);
    this.root = new T.Group(); this.scene.add(this.root);
    this.fxRoot = new T.Group(); this.scene.add(this.fxRoot);

    this.mat = {
      lam: new T.MeshLambertMaterial({ vertexColors: true }),
      pho: new T.MeshPhongMaterial({ vertexColors: true, shininess: 70, specular: 0x2a2a2a }),
      glow: new T.MeshPhongMaterial({ vertexColors: true, shininess: 90, specular: 0x444444, emissive: 0x222222 }),
      ice: new T.MeshPhongMaterial({ color: 0x9be7ff, transparent: true, opacity: 0.45, shininess: 100, specular: 0xffffff, depthWrite: false }),
      ice2: new T.MeshPhongMaterial({ color: 0x5fc4f0, transparent: true, opacity: 0.62, shininess: 100, specular: 0xffffff, depthWrite: false }),
      glass: new T.MeshPhongMaterial({ color: 0xd8f4ff, transparent: true, opacity: 0.32, shininess: 120, specular: 0xffffff, depthWrite: false }),
      noise: new T.MeshBasicMaterial({ map: noiseTex(), transparent: true, opacity: 0.85, depthWrite: false }),
      noise2: new T.MeshBasicMaterial({ map: noiseTex(), color: 0xff9aa8, transparent: true, opacity: 0.95, depthWrite: false }),
      arrow: new T.MeshBasicMaterial({ color: 0xffffff }),
      ring: new T.MeshBasicMaterial({ color: 0xffe27a, transparent: true, opacity: 0.9, depthWrite: false }),
      target: new T.MeshBasicMaterial({ color: 0x7affc8, transparent: true, opacity: 0.9, depthWrite: false }),
      beam: new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, blending: T.AdditiveBlending, depthWrite: false }),
      portal: new T.MeshBasicMaterial({ color: 0x7a5cff, transparent: true, opacity: 0.85, depthWrite: false }),
      exit: new T.MeshBasicMaterial({ color: 0x41d65a, transparent: true, opacity: 0.8, depthWrite: false })
    };
    this.pmat = this.mat.pho;
    this.partMats = MD.PIECE_HEX.map(function (h) { return new T.MeshBasicMaterial({ color: h, transparent: true }); });
    this.partMats.push(new T.MeshBasicMaterial({ color: 0xffffff, transparent: true }), new T.MeshBasicMaterial({ color: 0xb08a5a, transparent: true }));
    this.partGeo = new T.BoxGeometry(0.11, 0.11, 0.11);
    this.beamGeo = new T.BoxGeometry(1, 0.12, 0.22);
    this.selRing = new T.Mesh(MD.shared().ring, this.mat.ring); this.selRing.visible = false; this.scene.add(this.selRing);
    this.tgtRing = new T.Mesh(MD.shared().ring, this.mat.target); this.tgtRing.visible = false; this.scene.add(this.tgtRing);
    this.ray = new T.Raycaster();
    this.plane = new T.Plane(new T.Vector3(0, 1, 0), -0.32);
  }

  function noiseTex() {
    var c = document.createElement('canvas'); c.width = c.height = 64;
    var g = c.getContext('2d'), d = g.createImageData(64, 64), s = 7;
    for (var i = 0; i < d.data.length; i += 4) {
      s = (s * 16807) % 2147483647; var v = 90 + (s % 140);
      d.data[i] = v; d.data[i + 1] = v * 0.9; d.data[i + 2] = v + 30; d.data[i + 3] = 150 + (s % 90);
    }
    g.putImageData(d, 0, 0);
    g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 2;
    for (var y = 6; y < 64; y += 10) { g.beginPath(); g.moveTo(0, y); g.lineTo(64, y + 3); g.stroke(); }
    var t = new T.CanvasTexture(c); t.magFilter = T.NearestFilter;
    return t;
  }

  var B = Board.prototype;

  B.onQuality = function (q) {
    this.pmat = q.phong ? this.mat.pho : this.mat.lam;
    this.maxParts = q.particles;
    var self = this;
    Object.keys(this.pieces).forEach(function (id) { var h = self.pieces[id]; h.userData.key = ''; });
    if (this.e) this.sync();
  };
  B.setOptions = function (o) {
    this.reduced = !!o.reduced; this.speed = o.reduced ? 0.6 : 1;
    if (this.cb !== !!o.cb) { this.cb = !!o.cb; var self = this; Object.keys(this.pieces).forEach(function (id) { self.pieces[id].userData.key = ''; }); if (this.e) this.sync(); }
  };

  // ---------- Koordinaten ----------
  B.pos = function (x, y, out) {
    out = out || new T.Vector3();
    return out.set(x - (this.W - 1) / 2, 0, y - (this.H - 1) / 2);
  };
  B.ipos = function (i, out) { return this.pos(i % this.W, (i / this.W) | 0, out); };

  // ---------- Level aufbauen ----------
  B.load = function (engine, world) {
    this.clear();
    this.e = engine; this.W = engine.W; this.H = engine.H;
    var wd = RRM.WORLDS[world] || RRM.WORLDS[0];
    this.world = wd;
    this.buildTiles(wd);
    this.over = new Array(this.W * this.H);
    this.sync();
    this.fit();
    this.stage.kick();
  };

  B.clear = function () {
    var self = this;
    this.q.length = 0; this.tw.length = 0; this.done = null;
    Object.keys(this.pieces).forEach(function (id) { self.root.remove(self.pieces[id]); });
    this.pieces = {};
    while (this.root.children.length) this.root.remove(this.root.children[0]);
    this.parts.forEach(function (p) { p.m.visible = false; p.life = 0; });
    this.beams.forEach(function (b) { b.m.visible = false; b.life = 0; });
    if (this.tiles) { this.tiles.geometry.dispose(); this.tiles = null; }
    if (this.extras) { this.extras.forEach(function (g) { g.dispose(); }); }
    this.extras = [];
    this.sel = -1; this.hintCells = null; this.target = -1; this.selRing.visible = false; this.tgtRing.visible = false;
  };

  // Alle Felder als EINE Geometrie (ein Draw-Call): Schachbrett + Rahmen + Ausgänge/Portale
  B.buildTiles = function (wd) {
    var e = this.e, parts = [], self = this, a = new T.Color(wd.board), b = new T.Color(wd.board).lerp(new T.Color(0xffffff), 0.1);
    var fr = new T.Color(wd.accent).lerp(new T.Color(0x000000), 0.35).getHex();
    for (var y = 0; y < this.H; y++) for (var x = 0; x < this.W; x++) {
      var i = y * this.W + x;
      if (!e.cells[i]) continue;
      var p = this.pos(x, y);
      parts.push({ g: new T.BoxGeometry(0.98, 0.16, 0.98), c: ((x + y) & 1 ? a : b).getHex(), m: MD.M(p.x, -0.08, p.z) });
      parts.push({ g: new T.BoxGeometry(1.08, 0.2, 1.08), c: fr, m: MD.M(p.x, -0.13, p.z) });
    }
    // Ausgänge für Kassetten/Pakete (Kettenende) markieren, wenn das Level Gegenstände nutzt
    var usesItems = (e.def.items && e.def.items.length) || e.spawn || (e.def.blockers || []).some(function (o) { return o.t === 'glass'; });
    var ex = [];
    if (usesItems) e.chains.forEach(function (ch) { ex.push(ch[ch.length - 1]); });
    ex.forEach(function (i) { var p = self.ipos(i); parts.push({ g: new T.BoxGeometry(0.7, 0.04, 0.12), c: 0x41d65a, m: MD.M(p.x, 0.01, p.z + 0.5) }); parts.push({ g: new T.ConeGeometry(0.1, 0.16, 3), c: 0x41d65a, m: MD.M(p.x, 0.02, p.z + 0.38, Math.PI / 2, 0, 0) }); });
    // Portale: Eingang lila Ring unten, Ausgang oben
    (e.def.portals || []).forEach(function (pt) {
      var p1 = self.pos(pt[0], pt[1]), p2 = self.pos(pt[2], pt[3]);
      parts.push({ g: new T.TorusGeometry(0.3, 0.05, 6, 20), c: 0x9a6bff, m: MD.M(p1.x, 0.0, p1.z + 0.5, Math.PI / 2) });
      parts.push({ g: new T.TorusGeometry(0.3, 0.05, 6, 20), c: 0x9a6bff, m: MD.M(p2.x, 0.0, p2.z - 0.5, Math.PI / 2) });
    });
    // Kassettenspender oben
    if (e.spawn) e.spawn.cols.forEach(function (cx) { var p = self.pos(cx, 0); parts.push({ g: new T.BoxGeometry(0.6, 0.18, 0.18), c: 0xffd36b, m: MD.M(p.x, 0.05, p.z - 0.56) }); });
    this.tiles = new T.Mesh(MD.merge(parts), this.mat.lam);
    this.root.add(this.tiles);
  };

  // ---------- Modelle ----------
  function pieceKey(p, cb) { return p.item ? 'i' + p.item : p.k + '|' + p.s + (cb ? 'c' : ''); }
  B.makeModel = function (h, p) {
    while (h.children.length) h.remove(h.children[0]);
    var m;
    if (p.item) m = new T.Mesh(p.item === 'cassette' ? MD.cassette() : MD.parcel(), this.pmat);
    else if (p.s === 'orb') m = new T.Mesh(MD.orb(), this.mat.glow);
    else if (p.s === 'remix') m = new T.Mesh(MD.remix(), this.mat.glow);
    else if (p.s === 'bomb') m = new T.Mesh(MD.bomb(p.k), this.mat.glow);
    else if (p.s === 'drone') m = new T.Mesh(MD.drone(p.k), this.mat.glow);
    else m = new T.Mesh(MD.piece(p.k), this.pmat);
    m.scale.setScalar(1.12);
    h.add(m);
    h.userData.spin = p.s === 'orb' || p.s === 'remix' || p.s === 'drone';
    h.userData.model = m;
    if (p.s === 'rh' || p.s === 'rv') {
      var a = new T.Mesh(MD.shared().arrow, this.mat.arrow);
      a.position.set(0, 0.98, 0.05); if (p.s === 'rv') a.rotation.y = Math.PI / 2;
      a.scale.set(1.05, 1.6, 1.6);
      var a2 = a.clone(); a2.position.y = 0.06; a2.scale.set(1.35, 1, 2.2);
      h.add(a, a2);
    }
    if (this.cb && !p.item && p.k >= 0 && RRM.PIECES[p.k]) {
      var s = new T.Sprite(MD.label(RRM.PIECES[p.k].glyph, RRM.PIECES[p.k].hex)); s.position.set(0.3, 0.85, 0.3); s.scale.set(0.34, 0.34, 1); h.add(s);
    }
    h.userData.key = pieceKey(p, this.cb);
  };
  B.holder = function (p) {
    var h = new T.Group(); h.userData.id = p.id;
    this.makeModel(h, p);
    this.root.add(h);
    this.pieces[p.id] = h;
    return h;
  };
  B.dropHolder = function (id) { var h = this.pieces[id]; if (h) { this.root.remove(h); delete this.pieces[id]; } };

  function blockKey(b, e) {
    if (!b) return '';
    switch (b.t) {
      case 'amp': return 'amp' + b.charge;
      case 'generator': return 'gen' + b.k + '_' + b.charge + '_' + b.need;
      case 'shield': return 'sh' + b.k + '_' + b.hp;
      case 'switch': return 'sw' + b.n + (b.n === e.nextSwitch ? 'on' : '');
      case 'jammer': return 'jam' + b.hp + '_' + (b.period - b.timer);
      default: return b.t + (b.hp || 1);
    }
  }
  B.blockMesh = function (b) {
    var g = new T.Group(), m;
    switch (b.t) {
      case 'crate': m = MD.crate(Math.min(3, b.hp)); break;
      case 'moss': m = MD.moss(); break;
      case 'barrier': m = MD.barrier(); break;
      case 'dusty': m = MD.dusty(Math.min(3, b.hp)); break;
      case 'amp': m = MD.amp(b.charge); break;
      case 'antenna': m = MD.antenna(Math.min(3, b.hp)); break;
      case 'jammer': m = MD.jammer(); break;
      case 'generator': m = MD.generator(b.k, b.charge, b.need); break;
      case 'shield': m = MD.shield(b.k, b.hp); break;
      case 'rolling': m = MD.rolling(); break;
      case 'switch': m = MD.switchBox(b.n === this.e.nextSwitch); break;
      case 'glass':
        g.add(new T.Mesh(MD.parcel(), this.pmat));
        g.children[0].scale.setScalar(0.75);
        var gl = new T.Mesh(MD.shared().glass, this.mat.glass); g.add(gl);
        if (b.hp > 1) { var gl2 = new T.Mesh(MD.shared().glass, this.mat.glass); gl2.scale.setScalar(1.08); g.add(gl2); }
        return g;
      default: m = MD.crate(1);
    }
    g.add(new T.Mesh(m, this.pmat));
    if (b.t === 'switch') this.addLabel(g, String(b.n), b.n === this.e.nextSwitch ? '#41d65a' : '#ffd36b', 0.95);
    if (b.t === 'jammer') this.addLabel(g, String(b.period - b.timer), '#ff5a5a', 1.12);
    if (b.t === 'shield' && this.cb && RRM.PIECES[b.k]) this.addLabel(g, RRM.PIECES[b.k].glyph, RRM.PIECES[b.k].hex, 0.7);
    if (b.t === 'generator' && this.cb && RRM.PIECES[b.k]) this.addLabel(g, RRM.PIECES[b.k].glyph, RRM.PIECES[b.k].hex, 1.05);
    return g;
  };
  B.addLabel = function (g, text, color, y) { var s = new T.Sprite(MD.label(text, color)); s.position.set(0, y, 0.2); s.scale.set(0.42, 0.42, 1); s.renderOrder = 5; g.add(s); };

  // Hindernis-/Abdeckungs-/Rauschschicht einer Zelle an den Engine-Zustand anpassen
  B.updateCell = function (i, pop) {
    var c = this.e.cells[i];
    if (!c) return;
    var o = this.over[i] || (this.over[i] = { b: null, c: null, n: null, kb: '', kc: '', kn: '' });
    var p = this.ipos(i), kb = blockKey(c.b, this.e), kc = c.c ? c.c.t + c.c.hp : '', kn = c.n ? 'n' + c.n : '';
    if (kb !== o.kb) {
      if (o.b) { this.root.remove(o.b); this.burst(p, 9, 6); }
      o.b = c.b ? this.blockMesh(c.b) : null; o.kb = kb;
      if (o.b) { o.b.position.copy(p); this.root.add(o.b); if (pop) this.popIn(o.b); }
    }
    if (kc !== o.kc) {
      if (o.c) { this.root.remove(o.c); this.burst(p, c.c ? 8 : 7, 6); }
      o.c = null; o.kc = kc;
      if (c.c) {
        o.c = c.c.t === 'ice' ? new T.Mesh(MD.shared().ice, c.c.hp > 1 ? this.mat.ice2 : this.mat.ice) : new T.Mesh(MD.cable(c.c.hp), this.pmat);
        if (c.c.t === 'ice' && c.c.hp > 2) o.c.scale.set(1.04, 1.1, 1.04);
        o.c.position.copy(p); this.root.add(o.c);
      }
    }
    if (kn !== o.kn) {
      if (o.n) this.root.remove(o.n);
      o.n = null; o.kn = kn;
      if (c.n) { o.n = new T.Mesh(MD.shared().noise, c.n > 1 ? this.mat.noise2 : this.mat.noise); o.n.position.copy(p); this.root.add(o.n); }
    }
  };

  // Harter Abgleich mit der Engine (nach jeder Animation, bei Qualitätswechsel, nach Kontextverlust)
  B.sync = function () {
    var e = this.e, seen = {}, self = this, v = new T.Vector3();
    for (var i = 0; i < e.cells.length; i++) {
      var c = e.cells[i];
      if (!c) continue;
      this.updateCell(i);
      if (c.p) {
        var h = this.pieces[c.p.id] || this.holder(c.p);
        if (h.userData.key !== pieceKey(c.p, this.cb)) this.makeModel(h, c.p);
        h.position.copy(this.ipos(i, v)); h.scale.setScalar(1); h.rotation.set(0, 0, 0); h.visible = true;
        seen[c.p.id] = 1;
      }
    }
    Object.keys(this.pieces).forEach(function (id) { if (!seen[id]) self.dropHolder(id); });
    this.updateMarks();
    this.stage.kick();
  };

  // ---------- Kamera ----------
  B.setInsets = function (top, bottom) { this.insets.top = top; this.insets.bottom = bottom; this.fit(); };
  B.resize = function (w, h) { this.vw = w; this.vh = h; this.fit(); };
  B.fit = function () {
    if (!this.W || !this.vw) return;
    var cam = this.camera, w = this.vw, h = this.vh, ins = this.insets;
    var aw = Math.max(100, w - ins.side * 2), ah = Math.max(100, h - ins.top - ins.bottom);
    cam.aspect = w / h; cam.clearViewOffset();
    var hw = this.W / 2 + 0.12, hh = this.H / 2 + 0.12;
    var pts = [], v = new T.Vector3();
    [-hw, hw].forEach(function (x) { [-hh, hh].forEach(function (z) { [0, 0.95].forEach(function (y) { pts.push(new T.Vector3(x, y, z)); }); }); });
    var self = this, lo = 3, hi = 60, bb;
    function measure(d) {
      cam.position.set(0, Math.sin(self.pitch) * d, Math.cos(self.pitch) * d);
      cam.lookAt(0, 0, 0); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
      var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      pts.forEach(function (p) { v.copy(p).project(cam); var px = (v.x + 1) / 2 * w, py = (1 - v.y) / 2 * h; x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py); });
      return { x0: x0, x1: x1, y0: y0, y1: y1 };
    }
    for (var it = 0; it < 22; it++) {
      var mid = (lo + hi) / 2; bb = measure(mid);
      if (bb.x1 - bb.x0 <= aw && bb.y1 - bb.y0 <= ah) hi = mid; else lo = mid;
    }
    bb = measure(hi);
    var cx = (bb.x0 + bb.x1) / 2, cy = (bb.y0 + bb.y1) / 2;
    var wantY = ins.top + ah / 2;
    cam.setViewOffset(w, h, cx - w / 2, cy - wantY, w, h);
    cam.updateProjectionMatrix();
    this.camBase = cam.position.clone();
    this.stage.kick();
  };

  // Bildschirmpunkt -> Zellindex (oder -1)
  B.pick = function (clientX, clientY) {
    if (!this.e) return -1;
    var r = this.stage.canvas.getBoundingClientRect();
    var nd = new T.Vector2((clientX - r.left) / r.width * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    this.ray.setFromCamera(nd, this.camera);
    var hit = new T.Vector3();
    if (!this.ray.ray.intersectPlane(this.plane, hit)) return -1;
    var x = Math.round(hit.x + (this.W - 1) / 2), y = Math.round(hit.z + (this.H - 1) / 2);
    if (x < 0 || y < 0 || x >= this.W || y >= this.H) return -1;
    var i = y * this.W + x;
    return this.e.cells[i] ? i : -1;
  };
  // Zelle -> Bildschirmpunkt (für Punkte-Popups und Tutorial-Hinweise)
  B.screen = function (i, y) {
    var v = this.ipos(i).setY(y || 0.5).project(this.camera), r = this.stage.canvas.getBoundingClientRect();
    return { x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height };
  };

  // ---------- Markierungen ----------
  B.select = function (i) { this.sel = i; this.updateMarks(); this.stage.kick(); };
  B.hint = function (cells) { this.hintCells = cells; this.hintT = 0; this.stage.kick(); };
  B.setTarget = function (i) { this.target = i; this.updateMarks(); this.stage.kick(); };
  B.updateMarks = function () {
    if (this.sel >= 0 && this.e && this.e.cells[this.sel]) { this.ipos(this.sel, this.selRing.position).setY(0.03); this.selRing.visible = true; } else this.selRing.visible = false;
    if (this.target >= 0 && this.e && this.e.cells[this.target]) { this.ipos(this.target, this.tgtRing.position).setY(0.05); this.tgtRing.visible = true; } else this.tgtRing.visible = false;
  };

  // ---------- Tweens / Partikel ----------
  B.tween = function (dur, fn, done, delay) {
    this.tw.push({ t0: this.t + (delay || 0) / 1000, d: Math.max(0.001, dur * this.speed / 1000), fn: fn, done: done });
  };
  B.popIn = function (obj) { obj.scale.setScalar(0.01); this.tween(220, function (t) { obj.scale.setScalar(Math.max(0.01, ease.back(t))); }); };
  B.burst = function (p, matIdx, n) {
    if (this.reduced) n = Math.min(n, 3);
    n = Math.min(n, this.maxParts || 40);
    for (var k = 0; k < n; k++) {
      var pt = null;
      for (var j = 0; j < this.parts.length; j++) if (this.parts[j].life <= 0) { pt = this.parts[j]; break; }
      if (!pt) {
        if (this.parts.length >= (this.maxParts || 40)) return;
        pt = { m: new T.Mesh(this.partGeo, this.partMats[0]), v: new T.Vector3(), life: 0 };
        this.fxRoot.add(pt.m); this.parts.push(pt);
      }
      pt.m.material = this.partMats[matIdx] || this.partMats[7];
      pt.m.position.set(p.x, 0.45, p.z); pt.m.visible = true; pt.m.scale.setScalar(1);
      var a = Math.random() * Math.PI * 2, s = 1.2 + Math.random() * 2.2;
      pt.v.set(Math.cos(a) * s, 2.5 + Math.random() * 2.5, Math.sin(a) * s);
      pt.life = pt.max = 0.45 + Math.random() * 0.3;
    }
  };
  B.beam = function (from, sx, sz, color, life) {
    var b = null;
    for (var j = 0; j < this.beams.length; j++) if (this.beams[j].life <= 0) { b = this.beams[j]; break; }
    if (!b) {
      b = { m: new T.Mesh(this.beamGeo, this.mat.beam.clone()), life: 0 };
      this.fxRoot.add(b.m); this.beams.push(b);
    }
    b.m.material.color.set(color || 0xffffff);
    b.m.position.set(from.x, 0.5, from.z); b.m.scale.set(sx, 1, sz); b.m.visible = true;
    b.life = b.max = (life || 0.32) * this.speed;
    b.sx = sx; b.sz = sz;
  };

  // ---------- Ereignisse abspielen ----------
  // events: Liste aus engine.ev (wird kopiert); done(): nach Animation und Abgleich
  B.play = function (events, done) {
    var self = this;
    events.forEach(function (ev) { self.q.push(ev); });
    this.done = done;
    this.stepEnd = this.t;
    this.stage.kick();
  };
  B.busy = function () { return this.q.length > 0 || this.tw.length > 0 || this.t < this.stepEnd; };

  B.runStep = function (ev) {
    var self = this, v = new T.Vector3(), H = this.hooks, A = RRM.Audio || { play: function () {} };
    switch (ev.e) {
      case 'swap': {
        var ha = this.pieces[ev.ids[0]], hb = this.pieces[ev.ids[1]];
        if (!ha || !hb) return 0;
        var pa = this.ipos(ev.a), pb = this.ipos(ev.b);
        A.play(ev.ok ? 'swap' : 'bad');
        if (ev.ok) {
          this.tween(150, function (t) { var k = ease.io(t); ha.position.lerpVectors(pa, pb, k); hb.position.lerpVectors(pb, pa, k); ha.position.y = Math.sin(t * Math.PI) * 0.25; });
          return 150;
        }
        this.tween(260, function (t) { var k = Math.sin(t * Math.PI) * 0.45; ha.position.lerpVectors(pa, pb, k); hb.position.lerpVectors(pb, pa, k); });
        return 260;
      }
      case 'wave': {
        var big = false;
        ev.removed.forEach(function (r) {
          var h = self.pieces[r.id];
          if (!h) return;
          var p = h.position.clone();
          self.burst(p, r.k >= 0 ? r.k : 7, r.s ? 10 : 5);
          self.tween(170, function (t) { h.scale.setScalar(Math.max(0.01, 1 - ease.inq(t))); h.position.y = t * 0.3; }, function () { self.dropHolder(r.id); });
        });
        ev.fx.forEach(function (f) { big = self.fx(f) || big; });
        var dur = (ev.removed.length ? 190 : 90) + (ev.fx.length ? 140 : 0);
        H.onWave && H.onWave(ev);
        if (ev.combo > 1) A.play('match', ev.combo); else if (ev.removed.length) A.play('match', 1);
        if (ev.hits.length && !ev.removed.length && !ev.fx.length) A.play('block');
        if (big && !this.reduced) this.shake = 0.25;
        this.tween(1, function () {}, function () {
          ev.dirty.forEach(function (i) { self.updateCell(i, true); });
          ev.spawned.forEach(function (s) { self.dropHolder(s.id); var h = self.holder(s.piece); self.ipos(s.i, h.position); self.popIn(h); A.play('special'); });
          ev.transformed.forEach(function (s) { var h = self.pieces[s.id]; if (!h) return; self.makeModel(h, s.piece); self.popIn(h); });
        }, dur * 0.55);
        return dur;
      }
      case 'transform': {
        ev.list.forEach(function (s) { var h = self.pieces[s.id]; if (!h) return; self.makeModel(h, s.piece); self.popIn(h); self.burst(h.position, 7, 4); });
        A.play('booster');
        return 260;
      }
      case 'fall': {
        var maxD = 0;
        ev.moves.forEach(function (m) {
          var h = self.pieces[m.id];
          if (m.isNew || !h) { if (!m.piece) return; h = self.pieces[m.id] || self.holder(m.piece); }
          var from = self.pos(m.from[0], m.from[1]), to = self.ipos(m.to), dist = from.distanceTo(to);
          var d = Math.min(460, 90 + dist * 55); maxD = Math.max(maxD, d);
          h.position.copy(from); h.visible = true;
          if (m.portal) {
            self.tween(d, function (t) { h.position.lerpVectors(from, to, ease.inq(t)); var s = t < 0.5 ? 1 - t * 1.6 : (t - 0.5) * 2; h.scale.setScalar(Math.max(0.2, Math.min(1, s))); });
          } else self.tween(d, function (t) { h.position.lerpVectors(from, to, ease.drop(t)); h.position.y = 0; });
        });
        return maxD + 10;
      }
      case 'collect': {
        ev.items.forEach(function (it) {
          var h = self.pieces[it.id]; if (!h) return;
          var p0 = h.position.clone();
          self.burst(p0, 3, 8);
          self.tween(320, function (t) { h.position.set(p0.x, t * 1.6, p0.z + t * 0.6); h.scale.setScalar(1 + t * 0.4); h.rotation.y = t * 6; }, function () { self.dropHolder(it.id); });
          H.onCollect && H.onCollect(it);
        });
        A.play('collect');
        return 330;
      }
      case 'shuffle': {
        A.play('swap');
        ev.pos.forEach(function (s) {
          var h = self.pieces[s.id]; if (!h) return;
          var from = h.position.clone(), to = self.ipos(s.i), c = new T.Vector3(0, 0, 0);
          self.tween(420, function (t) { var k = ease.io(t); h.position.lerpVectors(from, to, k); var m = Math.sin(t * Math.PI); h.position.lerp(c, m * 0.35); h.position.y = m * 0.8; }, function () { if (h.userData.key !== pieceKey(s.piece, self.cb)) self.makeModel(h, s.piece); });
        });
        H.onShuffle && H.onShuffle(ev);
        return 440;
      }
      case 'turn': {
        ev.removed.forEach(function (r) { var h = self.pieces[r.id]; if (h) { self.burst(h.position, 4, 5); self.tween(200, function (t) { h.scale.setScalar(Math.max(0.01, 1 - t)); }, function () { self.dropHolder(r.id); }); } });
        ev.rolls.forEach(function (r) {
          var h = self.pieces[r.id], o1 = self.over[r.from], to = self.ipos(r.from), bto = self.ipos(r.to);
          if (h) { var hf = h.position.clone(); self.tween(240, function (t) { h.position.lerpVectors(hf, to, ease.io(t)); }); }
          if (o1 && o1.b) { var bm = o1.b, bf = bm.position.clone(); self.tween(240, function (t) { bm.position.lerpVectors(bf, bto, ease.io(t)); bm.rotation.z = -t * Math.PI * 2 * Math.sign(r.to - r.from); }); }
        });
        ev.fx.forEach(function (f) { self.fx(f); });
        this.tween(1, function () {}, function () {
          // Rollende Platten: Überlagerungen einfach neu aufbauen
          if (ev.rolls.length) ev.rolls.forEach(function (r) { [r.from, r.to].forEach(function (i) { var o = self.over[i]; if (o && o.b) { self.root.remove(o.b); o.b = null; o.kb = ''; } }); });
          ev.dirty.forEach(function (i) { self.updateCell(i, false); });
          for (var i = 0; i < self.e.cells.length; i++) if (self.e.cells[i] && self.e.cells[i].b && self.e.cells[i].b.t === 'jammer') self.updateCell(i);
        }, 250);
        return ev.rolls.length || ev.removed.length || ev.fx.length ? 280 : 20;
      }
      case 'end': return 0;
    }
    return 0;
  };

  // Effekte; liefert true für große Explosionen (Bildschirmwackeln)
  B.fx = function (f) {
    var self = this, A = RRM.Audio || { play: function () {} }, p = f.i != null ? this.ipos(f.i) : null, W = this.W, H = this.H;
    var acc = this.world ? this.world.accent : 0xffffff;
    switch (f.t) {
      case 'row': A.play('rocket'); this.beam(new T.Vector3(0, 0, p.z), W + 0.4, f.beam ? 1.6 : 1.1, f.beam ? 0x7ad7ff : 0xfff2a8); return false;
      case 'col': A.play('rocket'); this.beam(new T.Vector3(p.x, 0, 0), 0.25, (H + 0.4) / 0.22, 0xfff2a8); return false;
      case 'cross':
        A.play('rocket');
        [-1, 0, 1].forEach(function (d) {
          if (!f.wide && d) return;
          self.beam(new T.Vector3(0, 0, p.z + d), W + 0.4, 1.1, 0xffc7f2);
          self.beam(new T.Vector3(p.x + d, 0, 0), 0.25, (H + 0.4) / 0.22, 0xffc7f2);
        });
        return !!f.wide;
      case 'blast': {
        A.play('bomb');
        var s = f.r * 2 + 1;
        this.beam(p, s, s / 0.22 * 0.98, f.r > 1 ? 0xff7a3d : 0xffb347, 0.4);
        for (var k = 0; k < f.r * 3; k++) this.burst(p, 7, 3);
        return f.r >= 2;
      }
      case 'board': A.play('orb'); this.beam(new T.Vector3(0, 0, 0), W + 0.4, (H + 0.4) / 0.22, 0xffffff, 0.55); return true;
      case 'orb':
        A.play('orb');
        (f.to || []).forEach(function (j, n) { var q = self.ipos(j); self.tween(1, function () {}, function () { self.burst(q, f.k >= 0 ? f.k : 7, 3); }, n * 18); });
        this.beam(p, 1.2, 1.2 / 0.22, 0xffffff, 0.35);
        return false;
      case 'drone': {
        A.play('drone');
        var q = this.ipos(f.to), d = new T.Group(); d.add(new T.Mesh(MD.drone(-1), this.mat.glow));
        d.position.copy(p); this.fxRoot.add(d);
        this.tween(300, function (t) { d.position.lerpVectors(p, q, ease.io(t)); d.position.y = 0.4 + Math.sin(t * Math.PI) * 1.4; d.rotation.y = t * 8; }, function () { self.fxRoot.remove(d); self.burst(q, 7, 6); });
        return false;
      }
      case 'hammer': {
        A.play('bomb');
        this.beam(p, 1, 1 / 0.22, 0xffe27a, 0.3); this.burst(p, 0, 8);
        return true;
      }
      case 'scan': (f.to || []).forEach(function (j) { var q = self.ipos(j); self.beam(q, 0.9, 0.9 / 0.22, 0x7affc8, 0.45); }); A.play('drone'); return false;
      case 'lift': { var o = this.over[f.i]; if (o && o.b) { var bm = o.b; this.tween(300, function (t) { bm.position.y = t * 2; bm.scale.setScalar(1 - t * 0.6); }); } this.burst(p, 4, 6); return false; }
      case 'moss': this.burst(p, 4, 6); return false;
      case 'jam': { var q2 = this.ipos(f.to); this.burst(q2, 5, 5); this.beam(q2, 0.95, 0.95 / 0.22, 0xff5a7a, 0.35); return false; }
    }
    void acc;
    return false;
  };

  // ---------- Bildfortschritt (von der Bühne aufgerufen) ----------
  B.update = function (dt) {
    this.t += dt;
    var t = this.t, self = this, active = false;
    // Ereignisschritte nacheinander
    while (this.q.length && t >= this.stepEnd) {
      var d = this.runStep(this.q.shift());
      this.stepEnd = t + d * this.speed / 1000;
    }
    // Tweens
    for (var i = 0; i < this.tw.length; i++) {
      var w = this.tw[i];
      if (t < w.t0) { active = true; continue; }
      var k = Math.min(1, (t - w.t0) / w.d);
      w.fn(k);
      if (k >= 1) { this.tw.splice(i--, 1); if (w.done) w.done(); }
      else active = true;
    }
    // Partikel
    for (var j = 0; j < this.parts.length; j++) {
      var p = this.parts[j];
      if (p.life <= 0) continue;
      active = true;
      p.life -= dt; p.v.y -= 9.8 * dt;
      p.m.position.addScaledVector(p.v, dt);
      p.m.scale.setScalar(Math.max(0.05, p.life / p.max));
      p.m.rotation.x += dt * 6; p.m.rotation.y += dt * 4;
      if (p.life <= 0) p.m.visible = false;
    }
    for (var b = 0; b < this.beams.length; b++) {
      var bm = this.beams[b];
      if (bm.life <= 0) continue;
      active = true;
      bm.life -= dt;
      var r = Math.max(0, bm.life / bm.max);
      bm.m.material.opacity = r * 0.9;
      bm.m.scale.y = 1 + (1 - r) * 2;
      if (bm.life <= 0) bm.m.visible = false;
    }
    // Wackeln
    if (this.shake > 0 && this.camBase) {
      this.shake -= dt; active = true;
      var s = Math.max(0, this.shake) * 0.25;
      this.camera.position.set(this.camBase.x + (Math.random() - 0.5) * s, this.camBase.y + (Math.random() - 0.5) * s, this.camBase.z);
      if (this.shake <= 0) this.camera.position.copy(this.camBase);
    }
    // Idle: Spezialteile drehen sich, Auswahl wippt, Hinweis hüpft
    var idle = !this.reduced;
    if (idle) {
      Object.keys(this.pieces).forEach(function (id) { var h = self.pieces[id]; if (h.userData.spin && h.userData.model) h.userData.model.rotation.y += dt * 1.6; });
    }
    if (this.sel >= 0) {
      var c = this.e && this.e.cells[this.sel], hs = c && c.p && this.pieces[c.p.id];
      if (hs && !this.busy()) { hs.position.y = idle ? 0.12 + Math.sin(t * 7) * 0.06 : 0.12; }
      this.selRing.rotation.y += dt;
    }
    if (this.hintCells && !this.busy()) {
      this.hintT += dt;
      this.hintCells.forEach(function (ci, n) {
        var cc = self.e.cells[ci], hh = cc && cc.p && self.pieces[cc.p.id];
        if (hh) { var k = Math.max(0, Math.sin(self.hintT * 6 + n)); hh.position.y = k * 0.18; }
      });
    }
    var animating = this.q.length > 0 || this.tw.length > 0 || t < this.stepEnd;
    if (!animating && this.done) { var cb = this.done; this.done = null; this.sync(); cb(); }
    var idleAnim = idle && (this.sel >= 0 || this.hintCells || this.hasSpinners());
    if (active || animating) return true;
    return idleAnim || this.sel >= 0 ? 'idle' : false;
  };
  B.hasSpinners = function () { for (var id in this.pieces) if (this.pieces[id].userData.spin) return true; return false; };
  B.stopHint = function () {
    var self = this;
    if (this.hintCells) this.hintCells.forEach(function (ci) { var c = self.e.cells[ci]; var h = c && c.p && self.pieces[c.p.id]; if (h) h.position.y = 0; });
    this.hintCells = null;
  };
  B.hide = function () {};

  RRM.Board = Board;
  RRM.ease = ease;
})(typeof window !== 'undefined' ? window : globalThis);
