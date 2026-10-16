/*! RicoPoly 3D – Darstellung: Spielbrett, Umgebung je Welt, Gebäude, Würfel, Figuren, Partikel und Kamera (Three.js r128).
 * Kennt keine Spielregeln: zeigt einen Spielstand an (sync) und spielt Ereignisse der Regel-Engine als Animation ab (play). */
(function (root) {
  'use strict';
  var T = root.THREE, R = root.RicoRules, W = root.RicoWorlds, C = root.RicoChars;
  var B = 13, CORNER = 1.7, SQW = (B - 2 * CORNER) / 9;
  var PCOL = ['#ff5a5a', '#3fa9ff', '#ffd23f', '#5ad46b', '#c77dff', '#ff9e28'];

  function smooth(a, b, x) { x = Math.max(0, Math.min(1, (x - a) / (b - a))); return x * x * (3 - 2 * x); }
  function easeOut(x) { return 1 - Math.pow(1 - x, 3); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  // ---------- Geometrie des Bretts ----------
  // Lokale Koordinaten einer Seite (Ecke rechts unten), dann um seite·90° gedreht. Liefert Mitte, Blickrichtung nach innen und Breite.
  function sqInfo(i) {
    var side = Math.floor(i / 10), k = i % 10, lx, ly, w, d = CORNER;
    if (k === 0) { lx = B / 2 - CORNER / 2; ly = B / 2 - CORNER / 2; w = CORNER; }
    else { lx = B / 2 - CORNER - (k - 0.5) * SQW; ly = B / 2 - CORNER / 2; w = SQW; }
    var a = side * Math.PI / 2, c = Math.cos(a), s = Math.sin(a);
    return { x: lx * c - ly * s, z: lx * s + ly * c, side: side, k: k, w: w, d: d, ang: a, corner: k === 0 };
  }
  // Punkt relativ zur Feldmitte (u entlang der Seite, v nach innen) in Weltkoordinaten
  function sqPoint(i, u, v) {
    var q = sqInfo(i), a = q.ang, c = Math.cos(a), s = Math.sin(a);
    // lokale Achsen: x nach rechts (entlang Seite), y nach unten (nach außen); nach innen = -y
    var lx = u, ly = -v;
    return new T.Vector3(q.x + lx * c - ly * s, 0, q.z + lx * s + ly * c);
  }
  function faceAngle(i) { return -sqInfo(i).ang; }   // Figuren schauen zur Brettmitte

  // ---------- Texturen ----------
  function boardTexture(world, lang, size) {
    var wd = W.get(world), cv = document.createElement('canvas'); cv.width = cv.height = size;
    var x = cv.getContext('2d'), S = size, px = S / B, c = CORNER * px, w = SQW * px, dark = !!wd.dark;
    var bg = '#' + new T.Color(wd.board).getHexString(), ink = dark ? '#e8f4ff' : '#1d1d2b', line = dark ? 'rgba(120,220,255,.55)' : 'rgba(40,30,20,.55)';
    x.fillStyle = bg; x.fillRect(0, 0, S, S);
    // Mitte: Logo und Kartenablagen
    var g = x.createRadialGradient(S / 2, S / 2, S * 0.05, S / 2, S / 2, S * 0.4);
    g.addColorStop(0, dark ? '#2a3170' : '#fffdf4'); g.addColorStop(1, bg); x.fillStyle = g; x.fillRect(c, c, S - 2 * c, S - 2 * c);
    x.save(); x.translate(S / 2, S / 2); x.rotate(-Math.PI / 4);
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = '900 ' + Math.round(S * 0.105) + 'px Fredoka, system-ui, sans-serif';
    x.lineWidth = S * 0.012; x.strokeStyle = dark ? '#081028' : '#fff'; x.strokeText('RicoPoly', 0, -S * 0.02);
    var lg = x.createLinearGradient(-S * 0.3, 0, S * 0.3, 0); lg.addColorStop(0, '#ff9e28'); lg.addColorStop(0.5, '#ff4f7b'); lg.addColorStop(1, '#7b5cff');
    x.fillStyle = lg; x.fillText('RicoPoly', 0, -S * 0.02);
    x.font = '600 ' + Math.round(S * 0.024) + 'px Fredoka, system-ui, sans-serif'; x.fillStyle = ink;
    x.fillText(lang === 'en' ? 'Build your empire!' : 'Baue dein Imperium!', 0, S * 0.06);
    x.font = '500 ' + Math.round(S * 0.016) + 'px Fredoka, system-ui, sans-serif'; x.globalAlpha = 0.7;
    x.fillText('RicoReWi · easygames · ' + wd.title[lang], 0, S * 0.095); x.globalAlpha = 1;
    x.restore();
    [[-1, 'chance'], [1, 'chest']].forEach(function (d) {   // Kartenfelder
      x.save(); x.translate(S / 2 + d[0] * S * 0.17, S / 2 + d[0] * S * 0.17); x.rotate(-Math.PI / 4);
      x.strokeStyle = line; x.lineWidth = S * 0.003; x.setLineDash([S * 0.01, S * 0.007]); x.strokeRect(-S * 0.08, -S * 0.05, S * 0.16, S * 0.1); x.setLineDash([]);
      x.fillStyle = ink; x.globalAlpha = 0.55; x.font = '700 ' + Math.round(S * 0.018) + 'px Fredoka, system-ui, sans-serif'; x.textAlign = 'center'; x.fillText(wd.deck[d[1]][lang], 0, S * 0.07); x.restore();
    });
    var names = wd.sq[lang] || wd.sq.de;
    for (var side = 0; side < 4; side++) {
      x.save(); x.translate(S / 2, S / 2); x.rotate(side * Math.PI / 2);
      for (var k = 0; k < 10; k++) {
        var i = side * 10 + k, b = R.BOARD[i], x0, y0 = S / 2 - c, ww;
        if (k === 0) { x0 = S / 2 - c; ww = c; } else { x0 = S / 2 - c - k * w; ww = w; }
        x.strokeStyle = line; x.lineWidth = Math.max(1, S * 0.0015); x.strokeRect(x0, y0, ww, c);
        x.fillStyle = ink; x.textAlign = 'center'; x.textBaseline = 'middle';
        var cx = x0 + ww / 2;
        if (b.t === 'prop') {
          x.fillStyle = wd.groups[b.g]; x.fillRect(x0 + 1, y0 + 1, ww - 2, c * 0.22);
          x.fillStyle = 'rgba(255,255,255,.18)'; x.fillRect(x0 + 1, y0 + 1, ww - 2, c * 0.06);
        }
        x.fillStyle = ink;
        if (k === 0) cornerArt(x, i, x0, y0, c, names[i], ink, wd, S);
        else {
          wrap(x, names[i], cx, y0 + c * (b.t === 'prop' ? 0.36 : 0.2), ww * 0.9, Math.round(S * 0.0125), ink);
          var icon = { chance: '?', chest: '♦', tax: '%', rail: '⇄', util: i === 12 ? '⚡' : '✦' }[b.t];
          if (icon) { x.font = '700 ' + Math.round(S * (b.t === 'chance' ? 0.05 : 0.032)) + 'px Fredoka, system-ui, sans-serif'; x.fillStyle = b.t === 'chance' ? wd.groups[2] : b.t === 'chest' ? wd.groups[1] : ink; x.fillText(icon, cx, y0 + c * 0.58); x.fillStyle = ink; }
          if (b.price || b.tax) { x.font = '600 ' + Math.round(S * 0.0115) + 'px Fredoka, system-ui, sans-serif'; x.fillText((b.price || b.tax) + ' RC', cx, y0 + c * 0.88); }
        }
      }
      x.restore();
    }
    var tex = new T.CanvasTexture(cv); tex.anisotropy = 4;
    return tex;
  }
  function wrap(x, text, cx, y, maxW, fs, ink) {
    x.font = '700 ' + fs + 'px Fredoka, system-ui, sans-serif'; x.fillStyle = ink;
    var words = String(text).split(/[\s-]+/), lines = [], cur = '';
    words.forEach(function (w) { var t = cur ? cur + ' ' + w : w; if (x.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; });
    if (cur) lines.push(cur);
    lines.slice(0, 3).forEach(function (l, n) { x.fillText(l, cx, y + n * fs * 1.1); });
  }
  function cornerArt(x, i, x0, y0, c, name, ink, wd, S) {
    x.save(); x.translate(x0 + c / 2, y0 + c / 2); x.rotate(-Math.PI / 4); x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = '800 ' + Math.round(S * 0.014) + 'px Fredoka, system-ui, sans-serif'; x.fillStyle = ink;
    var icon = { 0: '➜', 10: '▦', 20: '☕', 30: '⚠' }[i];
    if (i === 0) { x.fillStyle = '#ff4f5e'; x.font = '900 ' + Math.round(S * 0.05) + 'px Fredoka, system-ui, sans-serif'; x.fillText('➜', 0, c * 0.12); x.fillStyle = ink; x.font = '900 ' + Math.round(S * 0.02) + 'px Fredoka, system-ui, sans-serif'; x.fillText(name, 0, -c * 0.2); }
    else if (i === 10) { x.fillStyle = 'rgba(255,140,40,.35)'; x.fillRect(-c * 0.05, -c * 0.45, c * 0.5, c * 0.5); wrap(x, name, 0, c * 0.22, c * 0.8, Math.round(S * 0.013), ink); }
    else { x.font = '700 ' + Math.round(S * 0.045) + 'px Fredoka, system-ui, sans-serif'; x.fillText(icon, 0, c * 0.08); wrap(x, name, 0, -c * 0.22, c * 0.8, Math.round(S * 0.013), ink); }
    x.restore();
  }
  function diceTextures(world) {
    var wd = W.get(world), out = [], pips = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };
    var face = wd.dark ? '#141a36' : world === 'fantasy' ? '#f6ecd2' : '#ffffff', pip = wd.dark ? '#38e1ff' : world === 'fantasy' ? '#a3222f' : '#1b1b2a';
    [3, 4, 1, 6, 2, 5].forEach(function (v) {   // Reihenfolge der Würfelseiten: +x −x +y −y +z −z
      var cv = document.createElement('canvas'); cv.width = cv.height = 128; var x = cv.getContext('2d');
      x.fillStyle = face; x.fillRect(0, 0, 128, 128);
      x.strokeStyle = 'rgba(0,0,0,.12)'; x.lineWidth = 6; x.strokeRect(3, 3, 122, 122);
      x.fillStyle = (v === 1 && !wd.dark) ? '#d6223b' : pip;
      pips[v].forEach(function (p) { x.beginPath(); x.arc(64 + p[0] * 32, 64 + p[1] * 32, v === 1 ? 17 : 12, 0, Math.PI * 2); x.fill(); });
      var t = new T.CanvasTexture(cv); out.push(new T.MeshStandardMaterial({ map: t, roughness: 0.35, metalness: 0.05 }));
    });
    return out;
  }
  function dotTexture() {
    var cv = document.createElement('canvas'); cv.width = cv.height = 64; var x = cv.getContext('2d');
    var g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.4, 'rgba(255,255,255,.8)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new T.CanvasTexture(cv);
  }

  // ---------- Bühne ----------
  function Stage(canvas, opt) {
    this.canvas = canvas; this.opt = opt || {};
    this.quality = this.opt.quality || 'auto'; this.reduced = !!this.opt.reduced; this.particlesOn = this.opt.particles !== false; this.saver = !!this.opt.saver;
    this.lang = this.opt.lang || 'de';
    this.clock = new T.Clock(); this.anims = []; this.tokens = []; this.lost = false; this.visible = true; this.fps = 60; this.frames = 0; this.acc = 0;
    this.cam = { theta: 0.0, phi: 0.95, r: 17, tx: 0, tz: 0.6, goal: null, shake: 0, mode: 'overview', userUntil: 0 };
    this.initRenderer();
    var self = this;
    canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); self.lost = true; if (self.opt.onLost) self.opt.onLost(); }, false);
    canvas.addEventListener('webglcontextrestored', function () { self.lost = false; self.restore(); if (self.opt.onRestored) self.opt.onRestored(); }, false);
    document.addEventListener('visibilitychange', function () { self.visible = !document.hidden; if (self.visible) self.clock.getDelta(); });
    this.bindInput();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }
  Stage.prototype.initRenderer = function () {
    var q = this.resolveQuality();
    this.renderer = new T.WebGLRenderer({ canvas: this.canvas, antialias: q !== 'low', powerPreference: this.saver ? 'low-power' : 'high-performance' });
    this.renderer.outputEncoding = T.sRGBEncoding;
    this.renderer.toneMapping = T.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1.05;
    this.applyQuality();
    this.camera = new T.PerspectiveCamera(42, 1, 0.1, 200);
    this.scene = new T.Scene();
    this.dot = dotTexture();
    this.resize();
  };
  Stage.prototype.resolveQuality = function () {
    if (this.quality !== 'auto') return this.quality;
    var mobile = /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent), mem = navigator.deviceMemory || 4, cores = navigator.hardwareConcurrency || 4;
    if (this.saver) return 'low';
    if (mobile && (mem <= 3 || cores <= 4)) return 'low';
    if (mobile) return 'medium';
    return this.autoLevel || 'high';
  };
  Stage.prototype.applyQuality = function () {
    var q = this.resolveQuality(), dpr = window.devicePixelRatio || 1;
    this.q = q;
    this.renderer.setPixelRatio(Math.min(dpr, q === 'high' ? 2 : q === 'medium' ? 1.5 : 1));
    this.renderer.shadowMap.enabled = q !== 'low' && this.opt.shadows !== false;
    this.renderer.shadowMap.type = q === 'high' ? T.PCFSoftShadowMap : T.PCFShadowMap;
    if (this.sun) { this.sun.castShadow = this.renderer.shadowMap.enabled; this.sun.shadow.mapSize.set(q === 'high' ? 2048 : 1024, q === 'high' ? 2048 : 1024); if (this.sun.shadow.map) { this.sun.shadow.map.dispose(); this.sun.shadow.map = null; } }
    this.resize();
  };
  Stage.prototype.setOptions = function (o) {
    if ('quality' in o) { this.quality = o.quality; this.autoLevel = null; }
    if ('reduced' in o) this.reduced = o.reduced;
    if ('particles' in o) this.particlesOn = o.particles;
    if ('saver' in o) this.saver = o.saver;
    if ('shadows' in o) this.opt.shadows = o.shadows;
    this.applyQuality();
    var self = this; this.tokens.forEach(function (t) { if (t) t.ch.reduced = self.reduced; });
  };
  Stage.prototype.resize = function () {
    var w = this.canvas.clientWidth || window.innerWidth, h = this.canvas.clientHeight || window.innerHeight;
    if (!this.renderer) return;
    this.renderer.setSize(w, h, false);
    if (this.camera) { this.camera.aspect = w / Math.max(1, h); this.camera.fov = this.camera.aspect < 0.8 ? 55 : 42; this.camera.updateProjectionMatrix(); }
  };

  // ---------- Szene aufbauen ----------
  Stage.prototype.clearScene = function () {
    var keep = [];
    this.scene.traverse(function (o) {
      if (o.isMesh || o.isPoints || o.isInstancedMesh) {
        if (o.userData.own) { if (o.geometry) o.geometry.dispose(); var m = o.material; (Array.isArray(m) ? m : [m]).forEach(function (mm) { if (mm && mm.map && mm.map.userData && mm.map.userData.own) mm.map.dispose(); if (mm && mm.userData && mm.userData.own) mm.dispose(); }); }
      }
    });
    while (this.scene.children.length) this.scene.remove(this.scene.children[0]);
    this.tokens.forEach(function (t) { if (t) t.ch.dispose(); });
    this.tokens = []; this.anims = []; this.houses = {}; this.flags = {}; this.dice = null; this.env = [];
  };
  Stage.prototype.lights = function (wd) {
    var hemi = new T.HemisphereLight(wd.sky[0], wd.ground, wd.dark ? 0.55 : 0.75); this.scene.add(hemi);
    var sun = new T.DirectionalLight(wd.dark ? 0xb8c8ff : 0xfff1dc, wd.dark ? 0.7 : 1.15);
    sun.position.set(8, 16, 10); sun.castShadow = this.renderer.shadowMap.enabled;
    var sc = sun.shadow.camera; sc.left = -10; sc.right = 10; sc.top = 10; sc.bottom = -10; sc.near = 1; sc.far = 40; sun.shadow.bias = -0.0008;
    sun.shadow.mapSize.set(this.q === 'high' ? 2048 : 1024, this.q === 'high' ? 2048 : 1024);
    this.scene.add(sun); this.sun = sun;
    if (wd.dark) { var p = new T.PointLight(0x38e1ff, 1.2, 30); p.position.set(0, 6, 0); this.scene.add(p); var p2 = new T.PointLight(0xff3fd2, 0.9, 30); p2.position.set(-8, 4, -8); this.scene.add(p2); }
  };
  Stage.prototype.buildMenu = function (world) {
    this.clearScene();
    var wd = W.get(world || 'metropolis'); this.world = wd.id; this.mode = 'menu';
    this.scene.background = skyTexture(wd); this.scene.fog = new T.Fog(wd.sky[1], 18, 55);
    this.lights(wd);
    var ped = new T.Mesh(new T.CylinderGeometry(1.25, 1.4, 0.3, 40), new T.MeshStandardMaterial({ color: wd.accent, roughness: 0.35, metalness: 0.3 })); ped.userData.own = true; ped.material.userData.own = true;
    ped.position.y = -0.15; ped.receiveShadow = true; this.scene.add(ped);
    var ring = new T.Mesh(new T.TorusGeometry(1.3, 0.04, 8, 60), new T.MeshBasicMaterial({ color: 0xffffff })); ring.rotation.x = Math.PI / 2; ring.position.y = 0.01; ring.userData.own = true; ring.material.userData.own = true; this.scene.add(ring);
    var ground = new T.Mesh(new T.CircleGeometry(30, 48), new T.MeshStandardMaterial({ color: wd.ground, roughness: 1 })); ground.rotation.x = -Math.PI / 2; ground.position.y = -0.3; ground.receiveShadow = true; ground.userData.own = true; ground.material.userData.own = true; this.scene.add(ground);
    this.decorate(wd, 11.5, 24, 0.6);
    this.cam = { theta: 0.35, phi: 1.32, r: 5.6, tx: 0, tz: 0, ty: 1.15, goal: null, shake: 0, mode: 'menu', userUntil: 0 };
    this.particles();
  };
  Stage.prototype.showcase = function (id, look, anim) {
    if (this.preview) { this.preview.dispose(); this.preview = null; }
    var ch = C.create(id, look); ch.group.scale.setScalar(1.6); ch.reduced = this.reduced;
    ch.group.traverse(function (o) { if (o.isMesh) o.castShadow = true; });
    this.scene.add(ch.group); this.preview = ch; ch.play(anim || 'idle', { restart: true });
    return ch;
  };
  Stage.prototype.buildBoard = function (world, lang) {
    this.clearScene();
    var wd = W.get(world), self = this; this.world = wd.id; this.mode = 'board'; this.lang = lang || this.lang;
    this.scene.background = skyTexture(wd); this.scene.fog = new T.Fog(wd.sky[1], 26, 70);
    this.lights(wd);
    // Tisch / Boden
    var ground = new T.Mesh(new T.PlaneGeometry(140, 140), new T.MeshStandardMaterial({ color: wd.ground, roughness: 1 }));
    ground.rotation.x = -Math.PI / 2; ground.position.y = -0.62; ground.receiveShadow = true; ground.userData.own = true; ground.material.userData.own = true; this.scene.add(ground);
    // Brettkörper mit Kante
    var base = new T.Mesh(new T.BoxGeometry(B + 0.5, 0.6, B + 0.5), new T.MeshStandardMaterial({ color: wd.dark ? 0x101430 : world === 'fantasy' ? 0x6b4325 : 0x2a2f45, roughness: 0.6, metalness: wd.dark ? 0.5 : 0.1 }));
    base.position.y = -0.31; base.receiveShadow = true; base.castShadow = true; base.userData.own = true; base.material.userData.own = true; this.scene.add(base);
    var size = this.q === 'low' ? 1024 : 2048, tex = boardTexture(wd.id, this.lang, size); tex.userData = { own: true }; tex.encoding = T.sRGBEncoding;
    tex.anisotropy = this.renderer.capabilities.getMaxAnisotropy ? Math.min(8, this.renderer.capabilities.getMaxAnisotropy()) : 4;
    var top = new T.Mesh(new T.PlaneGeometry(B, B), new T.MeshStandardMaterial({ map: tex, roughness: 0.75, metalness: 0.0 }));
    top.rotation.x = -Math.PI / 2; top.position.y = 0.002; top.receiveShadow = true; top.userData.own = true; top.material.userData.own = true; this.scene.add(top); this.top = top;
    if (wd.dark) { var edge = new T.Mesh(new T.TorusGeometry(B * 0.72, 0.03, 6, 4), new T.MeshBasicMaterial({ color: 0x38e1ff })); edge.rotation.x = Math.PI / 2; edge.rotation.z = Math.PI / 4; edge.position.y = 0.01; edge.userData.own = true; this.scene.add(edge); }
    // Gefängnis-Gitter
    var jail = new T.Group(), jc = sqPoint(10, CORNER * 0.18, CORNER * 0.18), barM = new T.MeshStandardMaterial({ color: 0x9aa3b2, metalness: 0.8, roughness: 0.3 }); barM.userData.own = true;
    for (var b = 0; b < 7; b++) { var bar = new T.Mesh(new T.CylinderGeometry(0.02, 0.02, 0.9, 6), barM); bar.position.set(-0.55 + b * 0.18, 0.45, -0.55); bar.castShadow = true; jail.add(bar); var bar2 = bar.clone(); bar2.position.set(-0.55, 0.45, -0.55 + b * 0.18); jail.add(bar2); }
    var cap = new T.Mesh(new T.BoxGeometry(1.15, 0.05, 1.15), barM); cap.position.set(0.02, 0.92, 0.02); jail.add(cap);
    jail.position.copy(jc); jail.rotation.y = -Math.PI / 2 * 1 + Math.PI; this.scene.add(jail); this.jail = jail;
    // Kartenstapel
    this.decks = {};
    [['chance', -1], ['chest', 1]].forEach(function (d) {
      var g = new T.Group(), m = new T.MeshStandardMaterial({ color: d[0] === 'chance' ? wd.groups[2] : wd.groups[1], roughness: 0.5 }); m.userData.own = true;
      for (var n = 0; n < 6; n++) { var card = new T.Mesh(new T.BoxGeometry(1.5, 0.02, 0.95), m); card.position.y = 0.012 + n * 0.022; card.rotation.y = (n % 2 ? 0.03 : -0.03); card.castShadow = true; g.add(card); }
      g.position.set(d[1] * B * 0.17, 0, d[1] * B * 0.17); g.rotation.y = Math.PI / 4; self.scene.add(g); self.decks[d[0]] = g;
    });
    this.houses = {}; this.flags = {};
    this.decorate(wd, B / 2 + 1.6, 24, 1);
    this.makeDice(wd.id);
    this.particles();
    this.cam = { theta: 0, phi: 0.92, r: this.camera.aspect < 0.8 ? 25 : 17.5, tx: 0, tz: 0.4, ty: 0, goal: null, shake: 0, mode: 'overview', userUntil: 0 };
  };
  function skyTexture(wd) {
    var cv = document.createElement('canvas'); cv.width = 4; cv.height = 256; var x = cv.getContext('2d');
    var g = x.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#' + new T.Color(wd.sky[0]).getHexString()); g.addColorStop(1, '#' + new T.Color(wd.sky[1]).getHexString());
    x.fillStyle = g; x.fillRect(0, 0, 4, 256); var t = new T.CanvasTexture(cv); t.encoding = T.sRGBEncoding; t.userData = { own: true }; return t;
  }

  // ---------- Umgebung je Welt (Instancing für viele gleiche Objekte) ----------
  Stage.prototype.decorate = function (wd, r0, r1, scale) {
    var self = this, rnd = seeded(wd.id.length * 977 + 3), q = this.q, many = q === 'high' ? 1 : q === 'medium' ? 0.7 : 0.45;
    function inst(geom, matl, n, place) {
      var m = new T.InstancedMesh(geom, matl, n), d = new T.Object3D(), col = new T.Color();
      for (var i = 0; i < n; i++) { place(d, i, col); d.updateMatrix(); m.setMatrixAt(i, d.matrix); if (m.setColorAt) m.setColorAt(i, col); }
      m.castShadow = q === 'high'; m.receiveShadow = true; m.userData.own = true; matl.userData.own = true;
      self.scene.add(m); return m;
    }
    function ringPos(d, minR, maxR) {
      var a = rnd() * Math.PI * 2, r = lerp(minR, maxR, Math.sqrt(rnd()));
      d.position.set(Math.cos(a) * r, 0, Math.sin(a) * r); d.rotation.set(0, rnd() * Math.PI * 2, 0); return a;
    }
    function square(d, minR, maxR) {   // Plätze außerhalb des quadratischen Bretts
      var x, z; do { x = (rnd() * 2 - 1) * maxR; z = (rnd() * 2 - 1) * maxR; } while (Math.max(Math.abs(x), Math.abs(z)) < minR);
      d.position.set(x, 0, z); d.rotation.set(0, Math.floor(rnd() * 4) * Math.PI / 2, 0);
    }
    var y0 = this.mode === 'menu' ? -0.3 : -0.62;
    if (wd.id === 'metropolis') {
      var winTex = windowTexture('#2a3550', '#ffe6a8'); winTex.userData = { own: true };
      inst(new T.BoxGeometry(1, 1, 1), new T.MeshStandardMaterial({ map: winTex, roughness: 0.55, emissive: 0xffd28a, emissiveMap: winTex, emissiveIntensity: 0.35 }), Math.round(70 * many), function (d, i, col) {
        square(d, r0 + 0.6, r1); var h = 1.2 + rnd() * (i % 6 === 0 ? 7 : 3.5); d.scale.set(1.2 + rnd() * 1.2, h, 1.2 + rnd() * 1.2); d.position.y = y0 + h / 2; col.setHSL(0.58 + rnd() * 0.1, 0.15, 0.55 + rnd() * 0.3);
      });
      inst(new T.ConeGeometry(0.5, 1.4, 7), new T.MeshStandardMaterial({ color: 0x3f9b4a, roughness: 0.9, flatShading: true }), Math.round(60 * many), function (d, i, col) { square(d, r0, r1 * 0.75); d.position.y = y0 + 0.7; var s = 0.6 + rnd() * 0.6; d.scale.set(s, s, s); col.setHSL(0.3 + rnd() * 0.06, 0.55, 0.32 + rnd() * 0.12); });
      this.movers(wd, r0, y0, [0xff5a5a, 0x3fa9ff, 0xffd23f, 0xffffff], 'car');
    } else if (wd.id === 'fantasy') {
      inst(new T.ConeGeometry(0.6, 2.2, 7), new T.MeshStandardMaterial({ color: 0x2f7a46, roughness: 0.9, flatShading: true }), Math.round(110 * many), function (d, i, col) { ringPos(d, r0, r1); var s = 0.6 + rnd() * 0.9; d.scale.set(s, s, s); d.position.y = y0 + 1.1 * s; col.setHSL(0.28 + rnd() * 0.1, 0.5, 0.25 + rnd() * 0.15); });
      inst(new T.CylinderGeometry(0.7, 0.8, 3, 10), new T.MeshStandardMaterial({ color: 0xb8ad9a, roughness: 0.85 }), 6, function (d, i, col) { var a = i / 6 * Math.PI * 2 + 0.3, r = r1 * 0.62; d.position.set(Math.cos(a) * r, y0 + 1.5, Math.sin(a) * r); d.scale.set(1, 1 + (i % 2) * 0.6, 1); col.set(0xc9bda6); });
      inst(new T.ConeGeometry(0.85, 1.4, 10), new T.MeshStandardMaterial({ color: 0x8b1d2c, roughness: 0.6 }), 6, function (d, i, col) { var a = i / 6 * Math.PI * 2 + 0.3, r = r1 * 0.62; d.position.set(Math.cos(a) * r, y0 + 3.7 + (i % 2) * 1.8, Math.sin(a) * r); col.setHSL(0.97 + (i % 3) * 0.05, 0.6, 0.38); });
      inst(new T.OctahedronGeometry(0.35, 0), new T.MeshStandardMaterial({ color: 0x9ff, roughness: 0.15, metalness: 0.2, emissive: 0x3a8cff, emissiveIntensity: 0.7, flatShading: true }), Math.round(30 * many), function (d, i, col) { ringPos(d, r0, r0 + 5); d.position.y = y0 + 0.3; d.scale.set(1, 1.8, 1); col.setHSL(0.55 + rnd() * 0.3, 0.8, 0.65); });
      // Drachenstatue und magisches Portal
      var statue = C.create('dragon', { c1: '#9aa0aa', c2: '#c9ccd2' }); statue.group.scale.setScalar(3.2); statue.group.position.set(-r0 - 2.6, y0 + 0.5, -r0 - 1.5); statue.group.rotation.y = Math.PI / 4; statue.play('victory'); statue.update(1);
      var plinth = new T.Mesh(new T.BoxGeometry(2.4, 0.5, 2.4), new T.MeshStandardMaterial({ color: 0x8a8f99, roughness: 0.9 })); plinth.position.set(-r0 - 2.6, y0 + 0.25, -r0 - 1.5); plinth.userData.own = true; plinth.material.userData.own = true; this.scene.add(plinth); this.scene.add(statue.group);
      var portal = new T.Mesh(new T.TorusGeometry(1.4, 0.14, 10, 40), new T.MeshStandardMaterial({ color: 0xb46cff, emissive: 0xb46cff, emissiveIntensity: 1.2, roughness: 0.3 }));
      portal.position.set(r0 + 3, y0 + 1.6, -r0 - 2); portal.rotation.y = -Math.PI / 4; portal.userData.own = true; portal.material.userData.own = true; this.scene.add(portal);
      var swirl = new T.Mesh(new T.CircleGeometry(1.3, 32), new T.MeshBasicMaterial({ color: 0x7a3cff, transparent: true, opacity: 0.45, side: T.DoubleSide })); swirl.position.copy(portal.position); swirl.rotation.y = portal.rotation.y; swirl.userData.own = true; swirl.material.userData.own = true; this.scene.add(swirl);
      this.env.push(function (t) { portal.rotation.z = t * 0.6; swirl.material.opacity = 0.35 + Math.sin(t * 2) * 0.15; swirl.scale.setScalar(1 + Math.sin(t * 3) * 0.04); });
      this.fireflies(wd, r0, y0, 0xfff2a0);
    } else {
      var neonTex = windowTexture('#0b1030', '#38e1ff'); neonTex.userData = { own: true };
      inst(new T.CylinderGeometry(0.6, 0.8, 1, 6), new T.MeshStandardMaterial({ map: neonTex, emissiveMap: neonTex, emissive: 0xffffff, emissiveIntensity: 0.9, roughness: 0.3, metalness: 0.6 }), Math.round(60 * many), function (d, i, col) {
        square(d, r0 + 0.8, r1); var h = 2 + rnd() * (i % 5 === 0 ? 9 : 4); d.scale.set(1 + rnd(), h, 1 + rnd()); d.position.y = y0 + h / 2; col.setHSL(rnd() < 0.5 ? 0.53 : 0.85, 0.9, 0.6);
      });
      inst(new T.SphereGeometry(0.6, 16, 10), new T.MeshStandardMaterial({ color: 0xffffff, emissive: 0x38e1ff, emissiveIntensity: 1.1, roughness: 0.2 }), 4, function (d, i, col) { var a = i / 4 * Math.PI * 2 + 0.8, r = r0 + 3.5; d.position.set(Math.cos(a) * r, y0 + 1, Math.sin(a) * r); d.scale.setScalar(1.3); col.setHSL(0.5 + i * 0.12, 0.9, 0.6); });
      // Hologramm über dem Brett-Rand und Raumschiffhafen
      var holo = new T.Mesh(new T.IcosahedronGeometry(1.0, 1), new T.MeshBasicMaterial({ color: 0x38e1ff, wireframe: true, transparent: true, opacity: 0.55 }));
      holo.position.set(r0 + 3.2, y0 + 3.4, r0 + 3.2); holo.userData.own = true; holo.material.userData.own = true; this.scene.add(holo);
      var pad = new T.Mesh(new T.CylinderGeometry(2.4, 2.6, 0.3, 24), new T.MeshStandardMaterial({ color: 0x2a3060, emissive: 0xff3fd2, emissiveIntensity: 0.25, metalness: 0.7, roughness: 0.4 }));
      pad.position.set(-r0 - 3.5, y0 + 0.15, r0 + 2.5); pad.userData.own = true; pad.material.userData.own = true; this.scene.add(pad);
      var ship = new T.Group(), hull = new T.Mesh(new T.ConeGeometry(0.7, 2.6, 8), new T.MeshStandardMaterial({ color: 0xe6edf5, metalness: 0.6, roughness: 0.25 })); hull.rotation.x = Math.PI / 2; hull.userData.own = true; hull.material.userData.own = true; ship.add(hull);
      var fin = new T.Mesh(new T.BoxGeometry(2.6, 0.08, 0.8), hull.material); fin.position.z = -0.6; ship.add(fin); fin.userData.own = true;
      ship.position.set(-r0 - 3.5, y0 + 1.6, r0 + 2.5); this.scene.add(ship);
      this.env.push(function (t) { holo.rotation.y = t * 0.7; holo.rotation.x = t * 0.3; ship.position.y = y0 + 1.6 + Math.sin(t * 1.3) * 0.25; ship.rotation.y = Math.sin(t * 0.4) * 0.3; });
      this.movers(wd, r0, y0 + 1.6, [0x38e1ff, 0xff3fd2, 0xf5f04a], 'hover');
      // Kleine Roboter auf Patrouille
      var bots = [0, 1].map(function (i) { var b = C.create('robot', { c2: i ? '#ff3fd2' : '#38e1ff' }); b.group.scale.setScalar(1.6); self.scene.add(b.group); b.play('walk'); return b; });
      this.env.push(function (t, dt) { bots.forEach(function (b, i) { var a = t * 0.18 + i * Math.PI, r = r0 + 0.9; b.group.position.set(Math.cos(a) * r, y0, Math.sin(a) * r); b.group.rotation.y = -a; b.update(dt); }); });
    }
  };
  Stage.prototype.movers = function (wd, r0, y, colors, type) {
    var self = this, list = [], n = this.q === 'low' ? 3 : 6;
    for (var i = 0; i < n; i++) {
      var g = new T.Group(), m = new T.MeshStandardMaterial({ color: colors[i % colors.length], roughness: 0.35, metalness: 0.4, emissive: type === 'hover' ? colors[i % colors.length] : 0x000000, emissiveIntensity: type === 'hover' ? 0.4 : 0 }); m.userData.own = true;
      var body = new T.Mesh(new T.BoxGeometry(0.5, 0.22, 0.9), m); body.position.y = 0.2; body.castShadow = true; body.userData.own = true; g.add(body);
      var cab = new T.Mesh(new T.BoxGeometry(0.42, 0.18, 0.45), new T.MeshStandardMaterial({ color: 0x223, roughness: 0.2, metalness: 0.5 })); cab.position.set(0, 0.38, -0.05); cab.userData.own = true; cab.material.userData.own = true; g.add(cab);
      this.scene.add(g); list.push({ g: g, off: i / n, lane: i % 2, sp: 0.03 + (i % 3) * 0.008 });
    }
    var R0 = r0 + 0.7;
    this.env.push(function (t) {
      list.forEach(function (c) {   // Fahrt auf einer quadratischen Ringstraße um das Brett
        var p = ((t * c.sp + c.off) % 1 + 1) % 1, side = Math.floor(p * 4), f = p * 4 - side, half = R0 + c.lane * 0.6, x, z, ang;
        var pts = [[half, half], [-half, half], [-half, -half], [half, -half]], a = pts[side], b = pts[(side + 1) % 4];
        x = lerp(a[0], b[0], f); z = lerp(a[1], b[1], f); ang = Math.atan2(b[0] - a[0], b[1] - a[1]);
        c.g.position.set(x, y + (type === 'hover' ? Math.sin(t * 2 + c.off * 9) * 0.2 : 0), z); c.g.rotation.y = ang;
      });
    });
  };
  Stage.prototype.fireflies = function (wd, r0, y, color) {
    var n = this.q === 'low' ? 30 : 80, pos = new Float32Array(n * 3), seedv = [], rnd = seeded(5);
    for (var i = 0; i < n; i++) { seedv.push([rnd() * Math.PI * 2, r0 + rnd() * 9, rnd() * 2 + 0.3, rnd() * 3]); }
    var g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3));
    var m = new T.PointsMaterial({ color: color, size: 0.18, map: this.dot, transparent: true, depthWrite: false, blending: T.AdditiveBlending });
    var p = new T.Points(g, m); p.userData.own = true; m.userData.own = true; this.scene.add(p);
    this.env.push(function (t) {
      for (var i = 0; i < n; i++) { var s = seedv[i], a = s[0] + t * 0.05; pos[i * 3] = Math.cos(a) * s[1]; pos[i * 3 + 1] = y + s[2] + Math.sin(t * 1.5 + s[3]) * 0.4; pos[i * 3 + 2] = Math.sin(a) * s[1]; }
      g.attributes.position.needsUpdate = true; m.opacity = 0.6 + Math.sin(t * 3) * 0.3;
    });
  };
  function windowTexture(base, light) {
    var cv = document.createElement('canvas'); cv.width = 64; cv.height = 128; var x = cv.getContext('2d'), rnd = seeded(base.length * 31 + light.length);
    x.fillStyle = base; x.fillRect(0, 0, 64, 128);
    for (var r = 0; r < 16; r++) for (var c = 0; c < 6; c++) { x.fillStyle = rnd() < 0.55 ? light : 'rgba(0,0,0,.35)'; x.globalAlpha = 0.5 + rnd() * 0.5; x.fillRect(4 + c * 10, 4 + r * 8, 6, 5); }
    x.globalAlpha = 1; var t = new T.CanvasTexture(cv); t.wrapS = t.wrapT = T.RepeatWrapping; t.encoding = T.sRGBEncoding; return t;
  }
  function seeded(s) { return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

  // ---------- Würfel ----------
  Stage.prototype.makeDice = function (world) {
    var mats = diceTextures(world), g = new T.BoxGeometry(0.55, 0.55, 0.55); g.userData = {};
    this.dice = [0, 1].map(function (i) {
      var m = new T.Mesh(g, mats); m.castShadow = true; m.userData.own = true; mats.forEach(function (mm) { mm.userData.own = true; mm.map.userData = { own: true }; });
      m.position.set(-0.5 + i, 0.275, 1.2); return m;
    });
    var self = this; this.dice.forEach(function (d) { self.scene.add(d); });
    this.setDiceStill([1, 1]);
  };
  var NORMAL = { 1: [0, 1, 0], 6: [0, -1, 0], 3: [1, 0, 0], 4: [-1, 0, 0], 2: [0, 0, 1], 5: [0, 0, -1] };
  function faceUp(v, yaw) {
    var n = NORMAL[v], q = new T.Quaternion().setFromUnitVectors(new T.Vector3(n[0], n[1], n[2]), new T.Vector3(0, 1, 0));
    return new T.Quaternion().setFromAxisAngle(new T.Vector3(0, 1, 0), yaw).multiply(q);
  }
  Stage.prototype.setDiceStill = function (vals) {
    if (!this.dice) return;
    var self = this;
    this.dice.forEach(function (d, i) { d.quaternion.copy(faceUp(vals[i] || 1, 0.3 - i * 0.5)); d.position.set(-0.45 + i * 0.9, 0.275, 0.9); });
  };
  // Würfelwurf: sichtbares Ergebnis = vorgegebenes Ergebnis aus dem Spielstand
  Stage.prototype.rollDice = function (vals, from, cb) {
    var self = this, D = this.reduced ? 0.5 : 1.35, start = [], qs = [], qf = [], axis = [], tgt = [];
    var fx = from ? from.x * 0.45 : 0, fz = from ? from.z * 0.45 : 4;
    this.dice.forEach(function (d, i) {
      start.push(new T.Vector3(fx + (i - 0.5) * 0.6, 2.4, fz));
      tgt.push(new T.Vector3((i - 0.5) * 1.0 + (Math.random() - 0.5) * 0.4, 0.275, 0.6 + (Math.random() - 0.5) * 0.6));
      qs.push(new T.Quaternion().setFromEuler(new T.Euler(Math.random() * 6, Math.random() * 6, Math.random() * 6)));
      axis.push(new T.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize());
      qf.push(faceUp(vals[i], Math.random() * Math.PI * 2));
    });
    if (root.RicoAudio) root.RicoAudio.sfx('dice');
    this.anim(D, function (u) {
      self.dice.forEach(function (d, i) {
        var e = easeOut(u);
        d.position.x = lerp(start[i].x, tgt[i].x, e); d.position.z = lerp(start[i].z, tgt[i].z, e);
        d.position.y = 0.275 + Math.abs(Math.sin(Math.PI * 3 * Math.pow(u, 0.75))) * 2.1 * Math.pow(1 - u, 2) + (1 - smooth(0, 0.25, u)) * (start[i].y - 0.275) * (1 - u);
        var spin = new T.Quaternion().setFromAxisAngle(axis[i], (1 - u) * (1 - u) * 26);
        var q = qs[i].clone().multiply(spin);
        d.quaternion.copy(q.slerp(qf[i], smooth(0.5, 0.98, u)));
      });
      if (u > 0.3 && u < 0.33 && root.RicoAudio) root.RicoAudio.sfx('diceHit');
    }, function () { self.dice.forEach(function (d, i) { d.quaternion.copy(qf[i]); d.position.copy(tgt[i]); }); self.burst(new T.Vector3(0, 0.3, 0.6), 'sparkle', 12); if (cb) cb(); });
  };

  // ---------- Figuren ----------
  Stage.prototype.setPlayers = function (players) {
    var self = this;
    this.tokens.forEach(function (t) { if (t) t.ch.dispose(); });
    this.tokens = players.map(function (p, i) {
      var ch = C.create(p.char, p.look); ch.reduced = self.reduced; ch.group.scale.setScalar(1.05);
      var ring = new T.Mesh(new T.RingGeometry(0.2, 0.26, 24), new T.MeshBasicMaterial({ color: PCOL[i % 6], transparent: true, opacity: 0.9 })); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.012; ring.userData.own = true; ring.material.userData.own = true;
      ch.group.add(ring);
      self.scene.add(ch.group);
      return { ch: ch, pos: 0, jail: false, out: false, ring: ring, moving: false, fade: 1 };
    });
  };
  Stage.prototype.slot = function (pi, sq, jail, count) {
    var n = this.tokens.length, k = pi % 6, cols = 3, u = ((k % cols) - 1) * 0.3, v = (Math.floor(k / cols) - 0.5) * 0.36;
    if (sq === 10) {
      if (jail) return sqPoint(10, CORNER * 0.2 + u * 0.7, CORNER * 0.2 + v * 0.8);
      var a = (k / 6) * 1.0; return sqPoint(10, -CORNER * 0.36 + (k % 3) * 0.08, -CORNER * 0.36 + Math.floor(k / 3) * 0.3 + a * 0.2);
    }
    if (sqInfo(sq).corner) return sqPoint(sq, u * 1.3, v * 1.3 + 0.1);
    return sqPoint(sq, u * 0.95, v * 0.9 - 0.12);
  };
  Stage.prototype.placeToken = function (i, sq, jail) {
    var t = this.tokens[i]; if (!t) return;
    var p = this.slot(i, sq, jail); t.ch.group.position.copy(p); t.ch.group.rotation.y = faceAngle(sq); t.pos = sq; t.jail = jail;
  };

  // ---------- Gebäude, Besitzmarken, Hypotheken ----------
  function buildingMesh(world, hotel, color) {
    var g = new T.Group(), roofC = new T.Color(color), m, r;
    if (world === 'fantasy') {
      m = new T.Mesh(new T.CylinderGeometry(hotel ? 0.17 : 0.1, hotel ? 0.19 : 0.11, hotel ? 0.45 : 0.18, 8), new T.MeshStandardMaterial({ color: 0xd9ccb0, roughness: 0.85 }));
      m.position.y = hotel ? 0.225 : 0.09; g.add(m);
      r = new T.Mesh(new T.ConeGeometry(hotel ? 0.22 : 0.14, hotel ? 0.3 : 0.16, 8), new T.MeshStandardMaterial({ color: roofC, roughness: 0.6 })); r.position.y = hotel ? 0.6 : 0.26; g.add(r);
    } else if (world === 'future') {
      m = new T.Mesh(hotel ? new T.CylinderGeometry(0.12, 0.18, 0.55, 6) : new T.SphereGeometry(0.12, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), new T.MeshStandardMaterial({ color: 0xdfe8ff, metalness: 0.6, roughness: 0.25, emissive: roofC, emissiveIntensity: 0.35 }));
      m.position.y = hotel ? 0.275 : 0; g.add(m);
      r = new T.Mesh(new T.TorusGeometry(hotel ? 0.16 : 0.12, 0.015, 6, 20), new T.MeshBasicMaterial({ color: roofC })); r.rotation.x = Math.PI / 2; r.position.y = hotel ? 0.45 : 0.03; g.add(r);
    } else {
      m = new T.Mesh(new T.BoxGeometry(hotel ? 0.3 : 0.16, hotel ? 0.5 : 0.14, hotel ? 0.22 : 0.16), new T.MeshStandardMaterial({ color: hotel ? 0xc8d4e6 : 0xf3efe6, roughness: 0.6 }));
      m.position.y = hotel ? 0.25 : 0.07; g.add(m);
      r = new T.Mesh(hotel ? new T.BoxGeometry(0.32, 0.05, 0.24) : new T.ConeGeometry(0.14, 0.12, 4), new T.MeshStandardMaterial({ color: roofC, roughness: 0.5 }));
      r.position.y = hotel ? 0.52 : 0.2; if (!hotel) r.rotation.y = Math.PI / 4; g.add(r);
    }
    g.traverse(function (o) { if (o.isMesh) { o.castShadow = true; o.userData.own = true; o.material.userData.own = true; } });
    return g;
  }
  Stage.prototype.setBuildings = function (sq, h, animate) {
    var cur = this.houses[sq];
    if (cur && cur.h === h) return;
    if (cur) { this.scene.remove(cur.g); cur.g.traverse(function (o) { if (o.isMesh) { o.geometry.dispose(); o.material.dispose(); } }); }
    delete this.houses[sq];
    if (!h) return;
    var wd = W.get(this.world), col = wd.groups[R.BOARD[sq].g], g = new T.Group();
    if (h === 5) { var ho = buildingMesh(this.world, true, col); ho.position.copy(sqPoint(sq, 0, CORNER * 0.38)); g.add(ho); }
    else for (var i = 0; i < h; i++) { var b = buildingMesh(this.world, false, col); b.position.copy(sqPoint(sq, (i - (h - 1) / 2) * SQW * 0.24, CORNER * 0.39)); g.add(b); }
    g.children.forEach(function (c) { c.rotation.y = faceAngle(sq); });
    this.scene.add(g); this.houses[sq] = { g: g, h: h };
    if (animate) {
      var self = this; g.position.y = 2;
      this.anim(this.reduced ? 0.2 : 0.55, function (u) { g.position.y = 2 * (1 - easeOut(u)) + Math.sin(u * Math.PI) * 0.05; }, function () { g.position.y = 0; self.burst(sqPoint(sq, 0, CORNER * 0.39).setY(0.1), 'dust', 14); if (root.RicoAudio) root.RicoAudio.sfx('build'); });
    }
  };
  Stage.prototype.setOwner = function (sq, owner, mort, animate) {
    var f = this.flags[sq], key = owner + ':' + (mort ? 1 : 0);
    if (f && f.key === key) return;
    if (f) { this.scene.remove(f.g); f.g.traverse(function (o) { if (o.isMesh) { o.geometry.dispose(); o.material.dispose(); } }); delete this.flags[sq]; }
    if (owner < 0) return;
    var g = new T.Group(), col = new T.Color(PCOL[owner % 6]);
    var plate = new T.Mesh(new T.BoxGeometry(SQW * 0.86, 0.025, 0.18), new T.MeshStandardMaterial({ color: col, roughness: 0.4, emissive: col, emissiveIntensity: 0.25 }));
    plate.position.copy(sqPoint(sq, 0, -CORNER * 0.43)).setY(0.013); plate.rotation.y = faceAngle(sq);
    if (R.BOARD[sq].t !== 'prop' || sqInfo(sq).corner) plate.scale.x = 1;
    g.add(plate);
    if (mort) {
      var shade = new T.Mesh(new T.PlaneGeometry(SQW * 0.96, CORNER * 0.96), new T.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.42, depthWrite: false }));
      shade.rotation.x = -Math.PI / 2; shade.rotation.z = faceAngle(sq); shade.position.copy(sqPoint(sq, 0, 0)).setY(0.02); g.add(shade);
      var tag = new T.Mesh(new T.BoxGeometry(0.28, 0.04, 0.28), new T.MeshStandardMaterial({ color: 0xd6223b })); tag.position.copy(sqPoint(sq, 0, 0)).setY(0.04); tag.rotation.y = faceAngle(sq) + Math.PI / 4; g.add(tag);
    }
    g.traverse(function (o) { if (o.isMesh) { o.userData.own = true; o.material.userData.own = true; o.receiveShadow = true; } });
    this.scene.add(g); this.flags[sq] = { g: g, key: key };
    if (animate && !mort) { var self = this; plate.scale.y = 0.01; this.anim(0.5, function (u) { plate.scale.set(1, 1 + Math.sin(u * Math.PI) * 6, 1); }, function () { plate.scale.set(1, 1, 1); }); this.burst(plate.position.clone().setY(0.2), 'sparkle', 24, PCOL[owner % 6]); }
  };

  // Vollständige Darstellung aus dem Spielstand (nach Laden, Überspringen, Online-Abgleich)
  Stage.prototype.sync = function (s) {
    var self = this;
    if (!this.tokens.length || this.tokens.length !== s.players.length) this.setPlayers(s.players);
    s.own.forEach(function (o, i) { if (!o) return; self.setOwner(i, o.o, o.m, false); self.setBuildings(i, o.o >= 0 ? o.h : 0, false); });
    s.players.forEach(function (p, i) {
      var t = self.tokens[i]; if (!t) return;
      t.moving = false; self.placeToken(i, p.pos, p.jail);
      t.out = p.out; t.ch.group.visible = !p.out;
      if (s.phase === 'over') t.ch.play(i === s.winner ? 'victory' : 'lose');
      else t.ch.play(p.jail ? 'jail' : i === s.cur ? 'idle' : 'idle');
    });
    this.highlight(s.cur);
    if (s.dice && s.dice[0]) this.setDiceStill(s.dice);
  };
  Stage.prototype.highlight = function (cur) {
    this.tokens.forEach(function (t, i) { if (t) { t.ring.material.opacity = i === cur ? 1 : 0.45; t.ring.scale.setScalar(i === cur ? 1.35 : 1); } });
    this.curTok = cur;
  };

  // Figur läuft Feld für Feld (keine Teleports bei normalen Zügen)
  Stage.prototype.walk = function (pi, path, opt, cb) {
    var t = this.tokens[pi], self = this; if (!t || !path.length) { if (cb) cb(); return; }
    opt = opt || {};
    var run = path.length > 7 || opt.fast, step = (this.reduced ? 0.12 : run ? 0.2 : 0.3) / (this.speed || 1), i = 0;
    t.moving = true; t.ch.play(run ? 'run' : 'walk');
    function next() {
      if (i >= path.length) { t.moving = false; t.ch.play('idle'); if (cb) cb(); return; }
      var from = t.ch.group.position.clone(), sq = path[i], to = self.slot(pi, sq, false);
      var ang = Math.atan2(to.x - from.x, to.z - from.z);
      self.anim(step, function (u) {
        t.ch.group.position.lerpVectors(from, to, u);
        t.ch.group.position.y = Math.sin(u * Math.PI) * (t.ch.def.kind === 'dragon' ? 0.18 : 0.07);
        var d = ang - t.ch.group.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); t.ch.group.rotation.y += d * Math.min(1, u * 3);
      }, function () {
        t.pos = sq; i++;
        if (sq === 0 && path.length > 1 && i < path.length && root.RicoAudio) root.RicoAudio.sfx('coin');
        if (root.RicoAudio && i % 2 === 0) root.RicoAudio.sfx('step');
        next();
      });
    }
    next();
    this.follow(pi);
  };
  Stage.prototype.toJail = function (pi, cb) {
    var t = this.tokens[pi], self = this; if (!t) { if (cb) cb(); return; }
    var from = t.ch.group.position.clone(), to = this.slot(pi, 10, true);
    t.ch.play('surprised');
    if (root.RicoAudio) root.RicoAudio.sfx('jail');
    this.anim(this.reduced ? 0.3 : 1.0, function (u) {
      t.ch.group.position.lerpVectors(from, to, smooth(0, 1, u)); t.ch.group.position.y = Math.sin(u * Math.PI) * 2.2;
    }, function () { t.pos = 10; t.jail = true; t.ch.group.rotation.y = faceAngle(10); t.ch.play('jail'); self.burst(to.clone().setY(0.4), 'smoke', 18); if (cb) cb(); });
    this.focusOn(10);
  };
  Stage.prototype.react = function (pi, state, dur) { var t = this.tokens[pi]; if (t) t.ch.play(state, { restart: true, dur: dur || 1.4, then: t.jail ? 'jail' : 'idle' }); };

  // ---------- Partikel (Münzen, Funkeln, Konfetti, Staub, Rauch) ----------
  Stage.prototype.particles = function () {
    var N = 360, g = new T.BufferGeometry();
    this.pp = { N: N, pos: new Float32Array(N * 3), col: new Float32Array(N * 3), vel: new Float32Array(N * 3), life: new Float32Array(N), next: 0, grav: new Float32Array(N) };
    g.setAttribute('position', new T.BufferAttribute(this.pp.pos, 3)); g.setAttribute('color', new T.BufferAttribute(this.pp.col, 3));
    var m = new T.PointsMaterial({ size: 0.22, vertexColors: true, map: this.dot, transparent: true, depthWrite: false });
    var p = new T.Points(g, m); p.frustumCulled = false; p.userData.own = true; m.userData.own = true; this.scene.add(p); this.ppMesh = p;
    for (var i = 0; i < N; i++) this.pp.pos[i * 3 + 1] = -99;
  };
  Stage.prototype.burst = function (at, kind, n, color) {
    if (!this.pp || !this.particlesOn) return;
    n = Math.round(n * (this.q === 'low' ? 0.5 : 1));
    var P = this.pp, c = new T.Color(), cols = { coin: ['#ffd23f', '#ffb800', '#fff1a8'], sparkle: [color || '#ffffff', '#fff6c8', '#a8f0ff'], confetti: ['#ff5a5a', '#3fa9ff', '#ffd23f', '#5ad46b', '#c77dff', '#ff9e28'], dust: ['#d8cfc0', '#b9ae9c'], smoke: ['#6b6f7a', '#3b3e46'] }[kind] || ['#ffffff'];
    for (var k = 0; k < n; k++) {
      var i = P.next; P.next = (P.next + 1) % P.N;
      P.pos[i * 3] = at.x + (Math.random() - 0.5) * 0.2; P.pos[i * 3 + 1] = at.y; P.pos[i * 3 + 2] = at.z + (Math.random() - 0.5) * 0.2;
      var sp = kind === 'smoke' || kind === 'dust' ? 0.8 : kind === 'confetti' ? 3.2 : 2.2, a = Math.random() * Math.PI * 2;
      P.vel[i * 3] = Math.cos(a) * sp * Math.random(); P.vel[i * 3 + 1] = (kind === 'smoke' ? 0.8 : kind === 'dust' ? 0.6 : 2.5 + Math.random() * 2.5); P.vel[i * 3 + 2] = Math.sin(a) * sp * Math.random();
      P.grav[i] = kind === 'smoke' ? -0.3 : kind === 'confetti' ? 2.5 : 6;
      P.life[i] = kind === 'smoke' ? 1.6 : 1.1 + Math.random() * 0.5;
      c.set(cols[k % cols.length]); P.col[i * 3] = c.r; P.col[i * 3 + 1] = c.g; P.col[i * 3 + 2] = c.b;
    }
  };
  Stage.prototype.coinsFlow = function (fromPi, toPi, amount) {
    var a = fromPi >= 0 && this.tokens[fromPi] ? this.tokens[fromPi].ch.group.position.clone() : new T.Vector3(0, 0, 0);
    var b = toPi >= 0 && this.tokens[toPi] ? this.tokens[toPi].ch.group.position.clone() : new T.Vector3(0, 0, 0);
    var n = Math.min(40, 6 + Math.round(amount / 40)), P = this.pp, self = this;
    if (!P || !this.particlesOn) return;
    for (var k = 0; k < n; k++) {
      var i = P.next, dur = 0.9; P.next = (P.next + 1) % P.N;
      P.pos[i * 3] = a.x; P.pos[i * 3 + 1] = 0.5; P.pos[i * 3 + 2] = a.z;
      P.vel[i * 3] = (b.x - a.x) / dur + (Math.random() - 0.5) * 0.6; P.vel[i * 3 + 1] = 3 + Math.random(); P.vel[i * 3 + 2] = (b.z - a.z) / dur + (Math.random() - 0.5) * 0.6;
      P.grav[i] = 6.5; P.life[i] = dur + Math.random() * 0.2;
      P.col[i * 3] = 1; P.col[i * 3 + 1] = 0.82; P.col[i * 3 + 2] = 0.2;
    }
    if (amount >= 300) this.cam.shake = 0.25;
  };

  // ---------- Kamera ----------
  Stage.prototype.follow = function (pi) { if (this.reduced || this.cam.mode === 'free' || Date.now() < this.cam.userUntil) return; var t = this.tokens[pi]; if (t) this.cam.goal = { track: pi, r: this.camera.aspect < 0.8 ? 16 : 11.5, phi: 0.82 }; };
  Stage.prototype.focusOn = function (sq) { if (this.reduced || Date.now() < this.cam.userUntil) return; var p = sqPoint(sq, 0, 0); this.cam.goal = { x: p.x * 0.6, z: p.z * 0.6, r: this.camera.aspect < 0.8 ? 15 : 10.5, phi: 0.78, theta: this.thetaFor(sq) }; };
  Stage.prototype.overview = function () { this.cam.goal = { x: 0, z: 0.4, r: this.camera.aspect < 0.8 ? 25 : 17.5, phi: 0.92, theta: this.cam.theta }; };
  Stage.prototype.cinematic = function (on) { this.cam.cine = on && !this.reduced; };
  Stage.prototype.thetaFor = function (sq) { var side = Math.floor(sq / 10), want = [0, -Math.PI / 2, Math.PI, Math.PI / 2][side], d = want - this.cam.theta; d = Math.atan2(Math.sin(d), Math.cos(d)); return this.cam.theta + d * 0.5; };
  Stage.prototype.rotate = function (dTheta, dPhi) { var c = this.cam; c.theta += dTheta; c.phi = Math.max(0.3, Math.min(1.35, c.phi + dPhi)); c.userUntil = Date.now() + 6000; c.goal = null; };
  Stage.prototype.zoom = function (f) { var c = this.cam; c.r = Math.max(this.mode === 'menu' ? 2.6 : 5.5, Math.min(this.mode === 'menu' ? 8 : 30, c.r * f)); c.userUntil = Date.now() + 6000; if (c.goal) c.goal.r = null; };
  Stage.prototype.updateCamera = function (dt) {
    var c = this.cam, g = c.goal, k = this.reduced ? 1 : 1 - Math.exp(-dt * 2.5);
    if (g) {
      if (g.track != null && this.tokens[g.track]) { var p = this.tokens[g.track].ch.group.position; g.x = p.x * 0.75; g.z = p.z * 0.75; }
      if (g.x != null) { c.tx += (g.x - c.tx) * k; c.tz += (g.z - c.tz) * k; }
      if (g.r) c.r += (g.r - c.r) * k;
      if (g.phi) c.phi += (g.phi - c.phi) * k;
      if (g.theta != null) c.theta += (g.theta - c.theta) * k;
    }
    if (this.mode === 'menu' && Date.now() > c.userUntil && !this.reduced) c.theta += dt * 0.12;
    if (c.cine && Date.now() > c.userUntil) c.theta += dt * 0.25;
    // Kamera darf das Brett nicht verlieren
    var lim = this.mode === 'menu' ? 0.5 : B * 0.42; c.tx = Math.max(-lim, Math.min(lim, c.tx)); c.tz = Math.max(-lim, Math.min(lim, c.tz));
    var sh = c.shake > 0 ? (Math.random() - 0.5) * c.shake * 0.3 : 0; c.shake = Math.max(0, c.shake - dt);
    var ty = c.ty || 0, portrait = this.mode === 'menu' && this.camera.aspect < 0.9, rr = c.r * (portrait ? 1.35 : 1);
    this.camera.position.set(c.tx + Math.sin(c.theta) * Math.sin(c.phi) * rr + sh, ty + Math.cos(c.phi) * rr, c.tz + Math.cos(c.theta) * Math.sin(c.phi) * rr);
    // Hochformat-Menü: Figur in die obere Bildhälfte rücken (unten liegt das Menü)
    this.camera.lookAt(c.tx, ty - (portrait ? 1.9 : 0), c.tz);
  };

  // ---------- Eingabe: Maus, Touch (Wischen, Pinch), Tastatur ----------
  Stage.prototype.bindInput = function () {
    var self = this, el = this.canvas, pts = {}, last = null, pinch = 0, moved = 0;
    el.addEventListener('pointerdown', function (e) { pts[e.pointerId] = { x: e.clientX, y: e.clientY }; moved = 0; try { el.setPointerCapture(e.pointerId); } catch (x) {} });
    el.addEventListener('pointermove', function (e) {
      var p = pts[e.pointerId]; if (!p) return;
      var ids = Object.keys(pts);
      if (ids.length === 2) {
        p.x = e.clientX; p.y = e.clientY;
        var a = pts[ids[0]], b = pts[ids[1]], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch) self.zoom(pinch / d); pinch = d; moved += 10; return;
      }
      var dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY; moved += Math.abs(dx) + Math.abs(dy);
      if (moved > 6) self.rotate(-dx * 0.006, -dy * 0.004);
    });
    function up(e) {
      var p = pts[e.pointerId]; delete pts[e.pointerId]; pinch = 0;
      if (p && moved < 6 && self.onPick) { var r = el.getBoundingClientRect(); self.pick((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); }
    }
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', function (e) { delete pts[e.pointerId]; pinch = 0; });
    el.addEventListener('wheel', function (e) { e.preventDefault(); self.zoom(e.deltaY > 0 ? 1.1 : 0.9); }, { passive: false });
    window.addEventListener('resize', function () { self.resize(); });
  };
  Stage.prototype.pick = function (x, y) {
    if (this.mode !== 'board' || !this.top) return;
    var rc = new T.Raycaster(); rc.setFromCamera({ x: x, y: y }, this.camera);
    var hit = rc.intersectObject(this.top)[0]; if (!hit) return;
    var best = -1, bd = 1e9;
    for (var i = 0; i < 40; i++) { var q = sqInfo(i), d = Math.hypot(q.x - hit.point.x, q.z - hit.point.z); if (d < bd) { bd = d; best = i; } }
    if (bd < CORNER) this.onPick(best);
  };

  // ---------- Animationen / Schleife ----------
  Stage.prototype.anim = function (dur, step, done) { var a = { t: 0, d: Math.max(0.001, dur), step: step, done: done }; this.anims.push(a); return a; };
  Stage.prototype.finishAll = function () { var list = this.anims; this.anims = []; list.forEach(function (a) { a.step(1); if (a.done) a.done(); }); while (this.anims.length) { var l2 = this.anims; this.anims = []; l2.forEach(function (a) { a.step(1); if (a.done) a.done(); }); } };
  Stage.prototype.loop = function () {
    requestAnimationFrame(this.loop);
    if (!this.visible || this.lost) return;
    var dt = Math.min(0.1, this.clock.getDelta());
    if (this.saver) { this.acc += dt; if (this.acc < 1 / 30) return; dt = this.acc; this.acc = 0; }   // Energiesparmodus: 30 Bilder/s
    this.time = (this.time || 0) + dt;
    var list = this.anims.slice(); this.anims = [];
    var keep = [];
    for (var i = 0; i < list.length; i++) { var a = list[i]; a.t += dt; var u = Math.min(1, a.t / a.d); a.step(u); if (u >= 1) { if (a.done) a.done(); } else keep.push(a); }
    this.anims = keep.concat(this.anims);
    var self = this;
    this.tokens.forEach(function (t) { if (t && t.ch.group.visible) t.ch.update(dt); });
    if (this.preview) { this.preview.update(dt); }
    (this.env || []).forEach(function (f) { f(self.time, dt); });
    if (this.pp) {
      var P = this.pp, any = false;
      for (var k = 0; k < P.N; k++) {
        if (P.life[k] <= 0) continue; any = true;
        P.life[k] -= dt; P.vel[k * 3 + 1] -= P.grav[k] * dt;
        P.pos[k * 3] += P.vel[k * 3] * dt; P.pos[k * 3 + 1] += P.vel[k * 3 + 1] * dt; P.pos[k * 3 + 2] += P.vel[k * 3 + 2] * dt;
        if (P.pos[k * 3 + 1] < 0.05 && P.grav[k] > 0) { P.pos[k * 3 + 1] = 0.05; P.vel[k * 3 + 1] *= -0.3; P.vel[k * 3] *= 0.6; P.vel[k * 3 + 2] *= 0.6; }
        if (P.life[k] <= 0) P.pos[k * 3 + 1] = -99;
      }
      if (any || this.ppDirty) { this.ppMesh.geometry.attributes.position.needsUpdate = true; this.ppMesh.geometry.attributes.color.needsUpdate = true; }
      this.ppDirty = any;
    }
    this.updateCamera(dt);
    this.renderer.render(this.scene, this.camera);
    // Automatische Qualität: bei dauerhaft niedriger Bildrate eine Stufe runter
    this.frames++; this.fpsAcc = (this.fpsAcc || 0) + dt;
    if (this.fpsAcc > 3) { this.fps = this.frames / this.fpsAcc; this.frames = 0; this.fpsAcc = 0;
      if (this.quality === 'auto' && this.fps < 28 && this.q !== 'low') { this.autoLevel = this.q === 'high' ? 'medium' : 'low'; this.applyQuality(); } }
  };
  Stage.prototype.restore = function () {
    // Nach Verlust des WebGL-Kontexts: Szene vollständig neu aufbauen (Zustand kommt aus dem Spielstand)
    if (this.opt.rebuild) this.opt.rebuild();
  };
  Stage.prototype.screenPos = function (pi) {
    var t = this.tokens[pi]; if (!t) return null;
    var v = t.ch.group.position.clone(); v.y += 1.3; v.project(this.camera);
    return { x: (v.x + 1) / 2, y: (1 - v.y) / 2 };
  };

  root.RicoBoard = { Stage: Stage, sqInfo: sqInfo, sqPoint: sqPoint, PCOL: PCOL, SIZE: B };
})(typeof self !== 'undefined' ? self : this);
