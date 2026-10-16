/* Rico Flap 3D – Flatter-Spiel in 3D (Three.js r128).
 * Figur „Rico“ trägt einen Hoodie mit RicoReWi-Emblem. 10 Level in 5 Welten + Endlos-Modus.
 * Steuerung: Touch, Maus, Tastatur, Gamecontroller (eigene Abfrage, daher ohne ../gamepad.js).
 * Spielstand: localStorage-Schlüssel "easygames.rico-flap.v1" (wird von ../cloud/anmacha-cloud.js mit Google synchronisiert). */
(function () {
  'use strict';
  if (!window.THREE) { document.body.insertAdjacentHTML('beforeend', '<p style="position:fixed;inset:auto 0 40%;text-align:center">3D-Grafik konnte nicht geladen werden. Bitte Seite neu laden.</p>'); return; }
  var T = THREE, $ = function (id) { return document.getElementById(id); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var rand = function (a, b) { return a + Math.random() * (b - a); };

  // ---------- Welten und Level ----------
  var WORLDS = [
    { name: 'Morgenrot-Stadt', sky: ['#3b2a7a', '#ff9e6e', '#ffd7a0'], fog: '#f2a585', ground: ['#5a3d8a', '#6c4aa3'], pipe: '#7b4bd1', cap: '#9b6cf0', accent: '#c8f55a', glow: .5, far: '#8a5aa8', deco: 'city', hemi: [1.0, '#ffe0c8', '#5a3d8a'], sun: .85, clouds: true },
    { name: 'Funkwald', sky: ['#1d5f86', '#7fd3c4', '#d9f7cf'], fog: '#a9dfc2', ground: ['#3f8a3a', '#4f9e45'], pipe: '#2f9e6a', cap: '#48c488', accent: '#ff4fa3', glow: .5, far: '#3f7f73', deco: 'forest', hemi: [1.0, '#e8fff0', '#3f8a3a'], sun: .8, clouds: true },
    { name: 'Sonnenwüste', sky: ['#e2703a', '#ffb25c', '#ffe9a8'], fog: '#ffcf8a', ground: ['#d9a35a', '#e6b56c'], pipe: '#c0612f', cap: '#e07c43', accent: '#c8f55a', glow: .45, far: '#d98a55', deco: 'desert', hemi: [1.05, '#fff2d6', '#c98a4a'], sun: .95, clouds: false },
    { name: 'Eisgipfel', sky: ['#2b5aa8', '#8fc7f0', '#e6f7ff'], fog: '#cfe8fb', ground: ['#cfe7fa', '#b5d6f2'], pipe: '#4a8fd6', cap: '#74b3f0', accent: '#ff4fa3', glow: .5, far: '#9fc3e6', deco: 'ice', hemi: [1.0, '#ffffff', '#9fc3e6'], sun: .75, clouds: true },
    { name: 'Neon-Nacht', sky: ['#05021a', '#1d0a3d', '#4a1466'], fog: '#2a0b45', ground: ['#1b0d33', '#2c1652'], pipe: '#2a1a57', cap: '#3d2780', accent: '#ff4fa3', glow: 1.2, far: '#2a1650', deco: 'neon', hemi: [.7, '#9a7cff', '#1b0d33'], sun: .45, clouds: false }
  ];
  // count = Säulen, gap = Lücke, speed = Tempo, space = Abstand, move = Auf-und-ab der Lücke
  var LEVELS = [
    { world: 0, count: 8, gap: 3.7, speed: 3.2, space: 5.4, move: 0 },
    { world: 0, count: 10, gap: 3.5, speed: 3.4, space: 5.2, move: 0 },
    { world: 1, count: 12, gap: 3.4, speed: 3.6, space: 5.1, move: 0 },
    { world: 1, count: 14, gap: 3.3, speed: 3.7, space: 5.0, move: .6 },
    { world: 2, count: 15, gap: 3.2, speed: 3.9, space: 5.0, move: .8 },
    { world: 2, count: 16, gap: 3.1, speed: 4.0, space: 4.9, move: 1.0 },
    { world: 3, count: 18, gap: 3.05, speed: 4.2, space: 4.9, move: 1.1 },
    { world: 3, count: 20, gap: 3.0, speed: 4.3, space: 4.8, move: 1.2 },
    { world: 4, count: 22, gap: 2.95, speed: 4.5, space: 4.8, move: 1.35 },
    { world: 4, count: 25, gap: 2.9, speed: 4.7, space: 4.7, move: 1.5 }
  ];
  function endlessCfg(score) {
    return { world: Math.floor(score / 15) % WORLDS.length, gap: Math.max(2.85, 3.6 - score * .015), speed: Math.min(5, 3.3 + score * .03), space: Math.max(4.6, 5.3 - score * .01), move: score < 12 ? 0 : Math.min(1.4, (score - 12) * .05) };
  }

  // ---------- Spielstand ----------
  var KEY = 'easygames.rico-flap.v1';
  var S = load();
  function load() {
    var d = { v: 1, unlocked: 1, last: 1, stars: {}, endless: 0, mute: false };
    try { var s = JSON.parse(localStorage.getItem(KEY)); if (s && s.v === 1) { d.unlocked = clamp(s.unlocked | 0, 1, LEVELS.length); d.last = clamp(s.last | 0, 1, d.unlocked); d.stars = s.stars && typeof s.stars === 'object' ? s.stars : {}; d.endless = Math.max(0, s.endless | 0); d.mute = !!s.mute; } } catch (e) {}
    return d;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

  // ---------- Ton (im Browser erzeugt) ----------
  var ac = null;
  function audio() {
    if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }
  function tone(f1, f2, dur, type, vol, delay) {
    if (S.mute) return; var a = audio(); if (!a) return;
    var t0 = a.currentTime + (delay || 0), o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.setValueAtTime(f1, t0); o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
    g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
    o.connect(g); g.connect(a.destination); o.start(t0); o.stop(t0 + dur + .02);
  }
  var sfx = {
    flap: function () { tone(420, 760, .09, 'triangle', .1); },
    point: function () { tone(880, 1320, .11, 'sine', .12); },
    note: function () { tone(1046, 1046, .08, 'square', .06); tone(1568, 1568, .14, 'square', .06, .07); },
    hit: function () { tone(220, 55, .35, 'sawtooth', .16); tone(90, 40, .3, 'square', .1); },
    win: function () { [523, 659, 784, 1046].forEach(function (f, i) { tone(f, f * 1.01, .18, 'triangle', .12, i * .11); }); }
  };

  // ---------- Renderer, Szene, Kamera ----------
  var stage = $('stage');
  var renderer = new T.WebGLRenderer({ antialias: (window.devicePixelRatio || 1) < 2, powerPreference: 'high-performance' });
  var quality = 2, pixelCap = 1.75;   // 2 = Schatten, 1 = ohne Schatten, 0 = zusätzlich geringere Auflösung
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pixelCap));
  renderer.shadowMap.enabled = true;
  stage.appendChild(renderer.domElement);
  var scene = new T.Scene();
  var camera = new T.PerspectiveCamera(50, 1, .5, 160);
  var view = { w: 16, h: 13, camX: 3 };
  var hemi = new T.HemisphereLight('#ffffff', '#444444', 1);
  var sun = new T.DirectionalLight('#ffffff', .8);
  sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
  var sc = sun.shadow.camera; sc.left = -14; sc.right = 14; sc.top = 14; sc.bottom = -14; sc.near = 1; sc.far = 60;
  scene.add(hemi, sun, sun.target);

  function resize() {
    var w = window.innerWidth || 1, h = window.innerHeight || 1, aspect = w / h, tanH = Math.tan(T.MathUtils.degToRad(25));
    var wantW = aspect < 1 ? 8 : 15, needH = 12.6;
    var dist = Math.max(needH / (2 * tanH), wantW / (2 * tanH * aspect));
    view.h = 2 * dist * tanH; view.w = view.h * aspect;
    view.camX = view.w * (aspect < 1 ? .14 : .24);
    view.dist = dist; view.cy = -.9 + view.h / 2;
    camera.aspect = aspect; camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }
  window.addEventListener('resize', resize);
  resize();

  // ---------- Hintergrund: Himmel, Boden, Deko ----------
  var skyCanvas = document.createElement('canvas'); skyCanvas.width = 4; skyCanvas.height = 256;
  var skyTex = new T.CanvasTexture(skyCanvas); scene.background = skyTex;
  scene.fog = new T.Fog('#ffffff', 30, 95);
  var groundCanvas = document.createElement('canvas'); groundCanvas.width = 128; groundCanvas.height = 32;
  var groundTex = new T.CanvasTexture(groundCanvas); groundTex.wrapS = groundTex.wrapT = T.RepeatWrapping; groundTex.repeat.set(100, 1);
  var groundMat = new T.MeshLambertMaterial({ map: groundTex });
  var ground = new T.Mesh(new T.BoxGeometry(400, 2, 9), groundMat);
  ground.position.set(0, -1, -1.5); ground.receiveShadow = true; scene.add(ground);
  var backMat = new T.MeshLambertMaterial({ color: '#888888' });
  var backGround = new T.Mesh(new T.PlaneGeometry(600, 120), backMat);
  backGround.rotation.x = -Math.PI / 2; backGround.position.set(0, -.05, -66); scene.add(backGround);

  var layers = [], decoTrash = [], stars = null;
  function own(x) { decoTrash.push(x); return x; }
  function phong(c, extra) { var m = new T.MeshPhongMaterial(Object.assign({ color: c, flatShading: true, shininess: 0, specular: '#000000' }, extra || {})); return own(m); }
  function clearDeco() {
    layers.forEach(function (l) { l.items.forEach(function (o) { scene.remove(o); }); });
    layers = [];
    if (stars) { scene.remove(stars); stars = null; }
    decoTrash.forEach(function (x) { x.dispose(); }); decoTrash = [];
  }
  function layer(factor, span, items) { layers.push({ factor: factor, span: span, items: items }); items.forEach(function (o) { scene.add(o); }); }

  function buildDeco(w) {
    clearDeco();
    var W = WORLDS[w];
    // ferne Berge
    var cone = own(new T.ConeGeometry(1, 1, 6)), far = [], farMat = phong(W.far), farMat2 = phong(new T.Color(W.far).offsetHSL(0, -.05, .06));
    for (var i = 0; i < 16; i++) {
      var m = new T.Mesh(cone, i % 2 ? farMat : farMat2), r = rand(6, 11), hh = rand(5, 13);
      m.scale.set(r, hh, r * .8); m.position.set(-80 + i * 10 + rand(-2, 2), hh / 2 - .2, -40 - rand(0, 10)); m.rotation.y = rand(0, 3);
      far.push(m);
    }
    layer(.12, 160, far);
    // Mittelgrund je nach Welt
    var mid = [], n = 20, span = 100, box = own(new T.BoxGeometry(1, 1, 1)), cyl = own(new T.CylinderGeometry(1, 1, 1, 8));
    for (i = 0; i < n; i++) {
      var g = new T.Group(), x = -span / 2 + i * span / n + rand(-1, 1), z = -11 - rand(0, 5);
      if (W.deco === 'city') {
        var bw = rand(1.6, 3.2), bh = rand(3, 9), b = new T.Mesh(box, phong(['#6a3f9e', '#7f4fb5', '#58337f'][i % 3]));
        b.scale.set(bw, bh, rand(1.6, 3)); b.position.y = bh / 2; g.add(b);
        var win = new T.Mesh(box, own(new T.MeshBasicMaterial({ color: i % 2 ? '#ffd27a' : '#ffb36b', fog: true })));
        win.scale.set(bw * .7, bh * .75, .05); win.position.set(0, bh * .5, b.scale.z / 2 + .03); win.material.transparent = true; win.material.opacity = .45; g.add(win);
      } else if (W.deco === 'forest') {
        var th = rand(2.5, 5), tr = new T.Mesh(cyl, phong('#6b4a2f')); tr.scale.set(.18, th * .4, .18); tr.position.y = th * .2; g.add(tr);
        var cr = new T.Mesh(cone, phong(i % 2 ? '#2f7d3f' : '#3c9a4a')); cr.scale.set(th * .32, th, th * .32); cr.position.y = th * .4 + th / 2; g.add(cr);
      } else if (W.deco === 'desert') {
        if (i % 3 === 0) { var me = new T.Mesh(box, phong('#c7773e')), mh = rand(2, 4.5); me.scale.set(rand(3, 5), mh, 2.5); me.position.y = mh / 2; g.add(me); }
        else {
          var ch = rand(1.6, 3.2), cm = phong('#5f9a45'), c1 = new T.Mesh(cyl, cm); c1.scale.set(.28, ch, .28); c1.position.y = ch / 2; g.add(c1);
          var a1 = new T.Mesh(cyl, cm); a1.scale.set(.18, ch * .35, .18); a1.position.set(.45, ch * .6, 0); g.add(a1);
          var a2 = new T.Mesh(cyl, cm); a2.scale.set(.18, ch * .3, .18); a2.position.set(-.45, ch * .45, 0); g.add(a2);
        }
      } else if (W.deco === 'ice') {
        var ih = rand(2, 6), sp = new T.Mesh(cone, phong(i % 2 ? '#bfe6ff' : '#e9f8ff', { emissive: '#203a55' })); sp.scale.set(ih * .25, ih, ih * .25); sp.position.y = ih / 2; g.add(sp);
      } else {
        var nh = rand(4, 11), tw = new T.Mesh(box, phong('#1c1240')); tw.scale.set(rand(1.4, 2.6), nh, 2); tw.position.y = nh / 2; g.add(tw);
        var st = new T.Mesh(box, own(new T.MeshBasicMaterial({ color: i % 2 ? '#ff4fa3' : '#c8f55a', fog: false })));
        st.scale.set(.12, nh * .8, .05); st.position.set(0, nh * .5, 1.03); g.add(st);
      }
      g.position.set(x, 0, z); mid.push(g);
    }
    layer(.45, span, mid);
    // Wolken oder Sterne
    if (W.clouds) {
      var ico = own(new T.IcosahedronGeometry(1, 0)), cmat = phong('#ffffff', { transparent: true, opacity: .92 }), cl = [];
      for (i = 0; i < 7; i++) {
        var c = new T.Group();
        for (var k = 0; k < 3; k++) { var p = new T.Mesh(ico, cmat), s = rand(.8, 1.4) * (k === 1 ? 1.3 : 1); p.scale.set(s * 1.4, s, s); p.position.set((k - 1) * 1.4, k === 1 ? .3 : 0, 0); c.add(p); }
        c.position.set(-50 + i * 15 + rand(-3, 3), rand(8, 13), -20 - rand(0, 6)); cl.push(c);
      }
      layer(.22, 105, cl);
    } else if (W.deco === 'neon') {
      var pg = own(new T.BufferGeometry()), pts = [];
      for (i = 0; i < 260; i++) pts.push(rand(-90, 110), rand(6, 45), rand(-70, -50));
      pg.setAttribute('position', new T.Float32BufferAttribute(pts, 3));
      stars = new T.Points(pg, own(new T.PointsMaterial({ color: '#ffffff', size: .35, fog: false })));
      scene.add(stars);
    }
  }

  function setWorld(w) {
    var W = WORLDS[w], ctx = skyCanvas.getContext('2d'), gr = ctx.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, W.sky[0]); gr.addColorStop(.6, W.sky[1]); gr.addColorStop(1, W.sky[2]);
    ctx.fillStyle = gr; ctx.fillRect(0, 0, 4, 256); skyTex.needsUpdate = true;
    scene.fog.color.set(W.fog);
    var g = groundCanvas.getContext('2d'); g.fillStyle = W.ground[0]; g.fillRect(0, 0, 128, 32);
    g.fillStyle = W.ground[1]; for (var i = -1; i < 4; i++) { g.beginPath(); g.moveTo(i * 40, 32); g.lineTo(i * 40 + 20, 32); g.lineTo(i * 40 + 44, 0); g.lineTo(i * 40 + 24, 0); g.fill(); }
    g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(0, 0, 128, 3);
    groundTex.needsUpdate = true;
    backMat.color.set(W.ground[0]).offsetHSL(0, 0, -.06);
    hemi.intensity = W.hemi[0]; hemi.color.set(W.hemi[1]); hemi.groundColor.set(W.hemi[2]); sun.intensity = W.sun;
    pipeMat.color.set(W.pipe); capMat.color.set(W.cap); accentMat.color.set(W.accent); accentMat.emissive.set(W.accent); accentMat.emissiveIntensity = W.glow;
    finishMat.color.set(W.accent); finishMat.emissive.set(W.accent);
    world = w; buildDeco(w);
  }

  // ---------- Säulen (Funktürme), Noten, Ziel ----------
  var pipeMat = new T.MeshStandardMaterial({ roughness: .45, metalness: .15 });
  var capMat = new T.MeshStandardMaterial({ roughness: .35, metalness: .2 });
  var accentMat = new T.MeshStandardMaterial({ roughness: .3, emissive: '#000000' });
  var noteMat = new T.MeshStandardMaterial({ color: '#ffd34d', emissive: '#ffb000', emissiveIntensity: .6, roughness: .25, metalness: .5 });
  var finishMat = new T.MeshStandardMaterial({ emissive: '#000000', emissiveIntensity: .8, roughness: .3 });
  var bodyGeo = new T.CylinderGeometry(.72, .72, 1, 22), capGeo = new T.CylinderGeometry(.9, .9, .45, 22), ringGeo = new T.TorusGeometry(.86, .07, 8, 28);
  var coinGeo = new T.CylinderGeometry(.34, .34, .09, 22), noteStemGeo = new T.BoxGeometry(.06, .34, .1);
  var POOL = 12, pipes = [];
  function part(geo, mat) { var m = new T.Mesh(geo, mat); m.castShadow = true; return m; }
  for (var pi = 0; pi < POOL; pi++) {
    var grp = new T.Group(), p = { g: grp, active: false };
    p.lb = part(bodyGeo, pipeMat); p.lc = part(capGeo, capMat); p.lr = part(ringGeo, accentMat);
    p.ub = part(bodyGeo, pipeMat); p.uc = part(capGeo, capMat); p.ur = part(ringGeo, accentMat);
    p.lr.rotation.x = p.ur.rotation.x = Math.PI / 2;
    var note = new T.Group(), coin = new T.Mesh(coinGeo, noteMat); coin.rotation.x = Math.PI / 2; note.add(coin);
    var stem = new T.Mesh(noteStemGeo, accentMat); stem.position.set(.08, .06, .07); note.add(stem);
    var head = new T.Mesh(new T.SphereGeometry(.09, 10, 8), accentMat); head.scale.set(1.2, .9, .6); head.position.set(-.01, -.1, .07); note.add(head);
    p.note = note;
    grp.add(p.lb, p.lc, p.lr, p.ub, p.uc, p.ur, note); grp.visible = false; scene.add(grp);
    pipes.push(p);
  }
  var finish = new T.Mesh(new T.TorusGeometry(2.2, .2, 10, 40), finishMat); finish.visible = false; scene.add(finish);

  function layoutPipe(p) {
    var gb = p.c - p.gap / 2, gt = p.c + p.gap / 2, lh = Math.max(.01, gb - .45 + 1), uh = Math.max(.01, 30 - gt - .45);
    p.lb.scale.y = lh; p.lb.position.y = -1 + lh / 2; p.lc.position.y = gb - .225; p.lr.position.y = gb - .45;
    p.ub.scale.y = uh; p.ub.position.y = gt + .45 + uh / 2; p.uc.position.y = gt + .225; p.ur.position.y = gt + .45;
    p.note.position.y = p.c;
  }

  // ---------- Figur: Rico mit RicoReWi-Hoodie ----------
  var emblemCanvas = document.createElement('canvas'); emblemCanvas.width = emblemCanvas.height = 256;
  var emblemTex = new T.CanvasTexture(emblemCanvas);
  function drawEmblem(img) {
    var c = emblemCanvas.getContext('2d'); c.clearRect(0, 0, 256, 256);
    c.save(); c.beginPath(); c.arc(128, 128, 120, 0, Math.PI * 2); c.clip();
    if (img) { c.fillStyle = '#1d0f3a'; c.fillRect(0, 0, 256, 256); c.drawImage(img, 14, 14, 228, 228); }
    else { c.fillStyle = '#1d0f3a'; c.fillRect(0, 0, 256, 256); c.fillStyle = '#fff'; c.font = 'bold 64px sans-serif'; c.textAlign = 'center'; c.fillText('RRW', 128, 150); }
    c.restore();
    c.lineWidth = 12; c.strokeStyle = '#ff4fa3'; c.beginPath(); c.arc(128, 128, 120, 0, Math.PI * 2); c.stroke();
    emblemTex.needsUpdate = true;
  }
  drawEmblem(null);
  var emblemImg = new Image();
  emblemImg.onload = function () { drawEmblem(emblemImg); };
  emblemImg.src = window.RICO_EMBLEM || './emblem.jpg';

  var bird = new T.Group(), tilt = new T.Group(); bird.add(tilt); tilt.scale.setScalar(1.2); scene.add(bird);
  (function buildRico() {
    var std = function (c, r) { return new T.MeshStandardMaterial({ color: c, roughness: r == null ? .55 : r }); };
    var yellow = std('#ffcf3a'), hoodie = std('#4b2585', .8), pink = std('#ff4fa3', .5), white = std('#ffffff', .3), black = std('#15102a', .2), orange = std('#ff8a1f', .4), dark = std('#241638', .4);
    var add = function (geo, mat, x, y, z) { var m = new T.Mesh(geo, mat); m.position.set(x || 0, y || 0, z || 0); m.castShadow = true; tilt.add(m); return m; };
    add(new T.SphereGeometry(.5, 26, 18), yellow);
    add(new T.SphereGeometry(.53, 26, 18, 0, Math.PI * 2, 1.2, Math.PI - 1.2), hoodie);           // Hoodie
    var collar = add(new T.TorusGeometry(.5, .035, 8, 26), pink, 0, .19, 0); collar.rotation.x = Math.PI / 2;
    // Emblem auf der Brust (zur Kamera hin)
    var patch = add(new T.SphereGeometry(.545, 20, 16, 1.8 - .62, 1.24, 1.82 - .62, 1.24), new T.MeshStandardMaterial({ map: emblemTex, transparent: true, alphaTest: .5, roughness: .6 }));
    patch.castShadow = false;
    // Kordeln des Hoodies
    var cord = new T.CylinderGeometry(.018, .018, .22, 6);
    add(cord, white, .44, .02, .14); add(cord, white, .44, .02, -.14);
    // Augen
    var eye = new T.SphereGeometry(.16, 16, 12), pup = new T.SphereGeometry(.075, 12, 10);
    [1, -1].forEach(function (s) { add(eye, white, .3, .26, .35 * s); add(pup, black, .37, .28, .46 * s); });
    // Schnabel
    var beak = add(new T.ConeGeometry(.14, .34, 14), orange, .6, .06, 0); beak.rotation.z = -Math.PI / 2;
    // Kopfhörer (Radio!)
    var band = add(new T.TorusGeometry(.44, .04, 8, 22, Math.PI), dark, -.06, .3, 0); band.rotation.y = Math.PI / 2;
    var cup = new T.CylinderGeometry(.14, .14, .1, 16);
    [1, -1].forEach(function (s) { var c = add(cup, pink, -.06, .3, .43 * s); c.rotation.x = Math.PI / 2; });
    // Schwanzfedern
    var tail = add(new T.ConeGeometry(.13, .32, 8), yellow, -.58, .08, 0); tail.rotation.z = Math.PI / 2 + .3;
    // Flügel als Hoodie-Ärmel
    var wingGeo = new T.SphereGeometry(1, 14, 10);
    bird.wings = [1, -1].map(function (s) {
      var pivot = new T.Group(); pivot.position.set(-.22, .1, .5 * s); tilt.add(pivot);
      var w = new T.Mesh(wingGeo, hoodie); w.scale.set(.32, .11, .2); w.position.set(-.26, 0, .04 * s); w.castShadow = true; pivot.add(w);
      var tip = new T.Mesh(wingGeo, yellow); tip.scale.set(.1, .08, .12); tip.position.set(-.55, 0, .04 * s); pivot.add(tip);
      return pivot;
    });
  })();

  // ---------- Spielzustand ----------
  var STEP = 1 / 120, GRAV = 24, FLAP = 7.6, R = .46;
  var state = 'menu', world = 0, run = null, t = 0, by = 5.5, vy = 0, wingKick = 0, deadT = 0, wonT = 0, scroll = 0, speed = 3.2;

  function newRun(mode, lv) {
    var cfg = mode === 'level' ? LEVELS[lv - 1] : endlessCfg(0);
    run = { mode: mode, lv: lv, cfg: cfg, passed: 0, notes: 0, notesTotal: mode === 'level' ? Math.floor(cfg.count / 2) : 0, spawned: 0, lastX: 0, finishX: null, score: 0 };
    pipes.forEach(function (p) { p.active = false; p.g.visible = false; });
    finish.visible = false;
    by = 5.5; vy = 0; t = 0; speed = cfg.speed;
    run.lastX = Math.max(view.camX + view.w / 2 + 1.5, 9) - cfg.space;
    if (world !== cfg.world || !layers.length) setWorld(cfg.world);
    state = 'ready';
    showScreen(null); $('hud').hidden = false; $('tapHint').hidden = false;
    hud(true);
  }

  function spawnPipe() {
    var c = run.mode === 'endless' ? endlessCfg(run.passed) : run.cfg, p = null;
    for (var i = 0; i < POOL; i++) if (!pipes[i].active) { p = pipes[i]; break; }
    if (!p) return false;
    var prev = run.prevC == null ? 5.2 : run.prevC, lo = 1.3 + c.gap / 2 + c.move, hi = 9.7 - c.gap / 2 - c.move;
    var base = clamp(prev + rand(-3, 3), lo, hi);
    run.prevC = base;
    p.active = true; p.passed = false; p.x = run.lastX + c.space; p.base = base; p.c = base; p.gap = c.gap; p.amp = c.move; p.ph = rand(0, 6.28); p.freq = rand(1.1, 1.6);
    run.spawned++;
    p.hasNote = run.mode === 'level' ? run.spawned % 2 === 0 : run.spawned % 3 === 0;
    p.note.visible = p.hasNote; p.note.scale.setScalar(1);
    p.g.visible = true; p.g.position.x = p.x;
    run.lastX = p.x;
    layoutPipe(p);
    return true;
  }

  function flap() {
    if (state === 'ready') { state = 'play'; $('tapHint').hidden = true; }
    if (state !== 'play') return;
    vy = FLAP; wingKick = 1; sfx.flap();
  }

  function hitRect(cy, x0, x1, y0, y1) {
    var nx = clamp(0, x0, x1), ny = clamp(cy, y0, y1), dx = -nx, dy = cy - ny;
    return dx * dx + dy * dy < R * R;
  }

  function die() {
    if (state !== 'play') return;
    state = 'dead'; deadT = 0; vy = Math.max(vy, 4); sfx.hit();
    if (navigator.vibrate) try { navigator.vibrate(60); } catch (e) {}
  }

  function step(dt) {
    t += dt;
    var moving = state === 'menu' || state === 'ready' || state === 'play' || state === 'won';
    if (moving) { scroll += speed * dt; groundTex.offset.x = (scroll / 4) % 1; }
    if (moving) layers.forEach(function (l) {
      var half = l.span / 2, d = speed * l.factor * dt;
      l.items.forEach(function (o) { o.position.x -= d; if (o.position.x < view.camX - half) o.position.x += l.span; });
    });
    wingKick = Math.max(0, wingKick - dt * 3);

    if (state === 'menu' || state === 'ready') { by = 5.5 + Math.sin(t * 3) * .25; return; }
    if (state === 'won') { by += (5.5 - by) * Math.min(1, dt * 3); vy = 0; wonT += dt; if (finish.visible) finish.position.x -= speed * dt; return; }
    if (state === 'dead') {
      deadT += dt; vy = Math.max(vy - GRAV * dt, -16); by = Math.max(R * .8, by + vy * dt);
      if (deadT > .9) endDialog();
      return;
    }
    if (state !== 'play') return;

    vy = Math.max(vy - GRAV * dt, -14); by += vy * dt;
    if (by > 12.4) { by = 12.4; vy = Math.min(vy, 0); }
    if (by - R <= 0) { by = R; die(); return; }

    var c = run.mode === 'endless' ? endlessCfg(run.passed) : run.cfg;
    speed = c.speed;
    var dx = speed * dt;
    run.lastX -= dx;
    var spawnLine = view.camX + view.w / 2 + 2;
    if (run.mode === 'endless' || run.spawned < run.cfg.count) { while (run.lastX + c.space < spawnLine + c.space && (run.mode === 'endless' || run.spawned < run.cfg.count)) { if (!spawnPipe()) break; } }
    else if (run.finishX == null) { run.finishX = run.lastX + c.space; finish.position.set(run.finishX, 5.5, 0); finish.visible = true; }
    if (run.finishX != null) { run.finishX -= dx; finish.position.x = run.finishX; }

    for (var i = 0; i < POOL; i++) {
      var p = pipes[i]; if (!p.active) continue;
      p.x -= dx; p.g.position.x = p.x;
      if (p.amp) { p.c = clamp(p.base + Math.sin(t * p.freq + p.ph) * p.amp, 1.3 + p.gap / 2, 9.7 - p.gap / 2); layoutPipe(p); }
      if (p.x < view.camX - view.w / 2 - 3) { p.active = false; p.g.visible = false; continue; }
      if (p.hasNote && p.note.visible) {
        p.note.rotation.y = t * 3;
        if (Math.abs(p.x) < .7 && Math.abs(by - p.c) < .75) { p.note.visible = false; run.notes++; sfx.note(); if (run.mode === 'endless') run.score++; hud(); }
      }
      if (Math.abs(p.x) < 1.4) {
        var gb = p.c - p.gap / 2, gt = p.c + p.gap / 2;
        if (hitRect(by, p.x - .72, p.x + .72, -5, gb - .45) || hitRect(by, p.x - .9, p.x + .9, gb - .45, gb) ||
            hitRect(by, p.x - .9, p.x + .9, gt, gt + .45) || hitRect(by, p.x - .72, p.x + .72, gt + .45, 40)) { die(); return; }
      }
      if (!p.passed && p.x + .9 < -R) {
        p.passed = true; run.passed++; run.score++; sfx.point(); hud();
        if (run.mode === 'endless') { var nw = endlessCfg(run.passed).world; if (nw !== world) setWorld(nw); }
      }
    }
    if (run.finishX != null && run.finishX < 0) win();
  }

  function win() {
    state = 'won'; wonT = 0; sfx.win();
    var total = run.notesTotal, st = 1 + (run.notes >= Math.ceil(total / 2) ? 1 : 0) + (run.notes >= total ? 1 : 0);
    run.stars = st;
    S.stars[run.lv] = Math.max(S.stars[run.lv] | 0, st);
    S.unlocked = Math.max(S.unlocked, Math.min(LEVELS.length, run.lv + 1));
    S.last = Math.min(LEVELS.length, run.lv + 1);
    save();
    setTimeout(function () { if (state === 'won') endDialog(); }, 700);
  }

  // ---------- Darstellung pro Bild ----------
  function render() {
    bird.position.set(0, by, 0);
    var target = state === 'play' ? clamp(vy * .075, -1.25, .45) : state === 'dead' ? -1.4 : Math.sin(t * 3) * .08;
    tilt.rotation.z += (target - tilt.rotation.z) * (state === 'dead' ? .08 : .25);
    var fl = state === 'dead' ? .2 : Math.sin(t * (14 + wingKick * 16)) * (.35 + wingKick * .55);
    bird.wings[0].rotation.z = fl; bird.wings[1].rotation.z = fl;
    if (finish.visible) finish.rotation.y = Math.sin(t * 1.5) * .3;
    var cx = view.camX;
    camera.position.set(cx - 2.2, view.cy + (by - 5.5) * .06, view.dist);
    camera.lookAt(cx, view.cy - .2, 0);
    sun.position.set(cx - 6, 18, 12); sun.target.position.set(cx, 4, 0);
    if (stars) stars.position.x = cx * .1;
    backGround.position.x = cx;
    renderer.render(scene, camera);
  }

  // ---------- Bildrate beobachten, ggf. Qualität senken ----------
  var perfN = 0, perfSum = 0;
  function watchPerf(dt) {
    if (state !== 'play' || quality === 0) { perfN = 0; perfSum = 0; return; }
    perfSum += dt; if (++perfN < 120) return;
    var avg = perfSum / perfN; perfN = 0; perfSum = 0;
    if (avg <= 1 / 42) return;
    quality--;
    if (quality === 1) { renderer.shadowMap.enabled = false; scene.traverse(function (o) { if (o.material) o.material.needsUpdate = true; }); }
    else { renderer.setPixelRatio(1); resize(); }
  }

  // ---------- HUD und Bildschirme ----------
  var lastHud = '';
  function hud(force) {
    if (!run) return;
    var lvText = run.mode === 'level' ? 'Level ' + run.lv + ' · ' + WORLDS[run.cfg.world].name : 'Endlos · Rekord ' + S.endless;
    var key = run.score + '|' + run.notes + '|' + lvText;
    if (!force && key === lastHud) return; lastHud = key;
    $('hudScore').textContent = run.mode === 'level' ? run.passed : run.score;
    $('hudLevel').textContent = lvText;
    if (run.mode === 'level') {
      $('hudBar').style.width = (100 * run.passed / run.cfg.count) + '%';
      $('hudNotes').textContent = '♪ ' + run.notes + '/' + run.notesTotal;
      $('hudBar').parentNode.hidden = false;
    } else {
      $('hudBar').parentNode.hidden = true;
      $('hudNotes').textContent = '♪ ' + run.notes;
    }
  }

  var screens = ['menu', 'picker', 'dialog'], dialogAt = 0;
  function showScreen(id) {
    screens.forEach(function (s) { $(s).hidden = s !== id; });
    if (id) { $('hud').hidden = id !== 'dialog'; $('tapHint').hidden = true; }
  }
  function menu() {
    state = 'menu'; run = null;
    pipes.forEach(function (p) { p.active = false; p.g.visible = false; });
    finish.visible = false; by = 5.5; vy = 0;
    $('hud').hidden = true;
    var n = Math.min(S.last || 1, S.unlocked);
    $('playBtn').textContent = 'Weiterspielen: Level ' + n;
    $('endlessBest').textContent = S.endless ? '· Rekord ' + S.endless : '';
    $('muteBtn').textContent = 'Ton: ' + (S.mute ? 'aus' : 'an');
    showScreen('menu');
    focusFirst();
  }
  function picker() {
    var grid = $('levelGrid'); grid.innerHTML = '';
    LEVELS.forEach(function (L, i) {
      var b = document.createElement('button'), n = i + 1, st = S.stars[n] | 0;
      b.className = 'lv world-' + L.world; b.disabled = n > S.unlocked;
      b.innerHTML = '<b>' + n + '</b><span>' + WORLDS[L.world].name + ' · ' + L.count + ' Türme</span><i>' + (b.disabled ? '🔒' : '★★★'.slice(0, st) + '☆☆☆'.slice(0, 3 - st)) + '</i>';
      b.addEventListener('click', function () { newRun('level', n); });
      grid.appendChild(b);
    });
    showScreen('picker'); focusFirst();
  }
  var dlg = {};
  function dialog(o) {
    $('dlgTitle').textContent = o.title; $('dlgText').textContent = o.text || '';
    $('dlgStars').innerHTML = o.stars ? '★★★'.slice(0, o.stars) + '<span class="off">' + '★★★'.slice(0, 3 - o.stars) + '</span>' : '';
    $('dlgPrimary').textContent = o.primary[0]; dlg.primary = o.primary[1];
    $('dlgSecondary').hidden = !o.secondary; if (o.secondary) { $('dlgSecondary').textContent = o.secondary[0]; dlg.secondary = o.secondary[1]; }
    showScreen('dialog'); dialogAt = performance.now();
    $('dlgPrimary').focus();
  }
  function endDialog() {
    if (!$('dialog').hidden || !run) return;
    var again = function () { newRun(run.mode, run.lv); };
    if (state === 'won') {
      var last = run.lv >= LEVELS.length;
      dialog({ title: 'Level ' + run.lv + ' geschafft!', stars: run.stars, text: 'Noten gesammelt: ' + run.notes + ' von ' + run.notesTotal + (last ? '. Alle Level geschafft! Weiter geht es im Endlos-Modus.' : ''),
        primary: last ? ['Endlos-Modus', function () { newRun('endless', 0); }] : ['Nächstes Level', function () { newRun('level', run.lv + 1); }], secondary: ['Nochmal', again] });
    } else if (run.mode === 'endless') {
      var rec = run.score > S.endless; if (rec) { S.endless = run.score; save(); }
      dialog({ title: rec ? 'Neuer Rekord!' : 'Autsch!', text: run.score + ' Punkte (' + run.passed + ' Türme, ' + run.notes + ' Noten) · Rekord ' + S.endless, primary: ['Nochmal', again] });
    } else {
      dialog({ title: 'Autsch!', text: 'Turm ' + run.passed + ' von ' + run.cfg.count + ' geschafft, ' + run.notes + ' von ' + run.notesTotal + ' Noten.', primary: ['Nochmal', again] });
    }
  }
  function pause() {
    if (state !== 'play' && state !== 'ready') return;
    run.resume = state; state = 'pause';
    dialog({ title: 'Pause', text: run.mode === 'level' ? 'Level ' + run.lv + ' · Turm ' + run.passed + ' von ' + run.cfg.count : 'Endlos · ' + run.score + ' Punkte', primary: ['Weiter', resume], secondary: ['Nochmal', function () { newRun(run.mode, run.lv); }] });
  }
  function resume() { if (state !== 'pause') return; state = run.resume; showScreen(null); $('hud').hidden = false; if (state === 'ready') $('tapHint').hidden = false; }

  $('playBtn').addEventListener('click', function () { newRun('level', Math.min(S.last || 1, S.unlocked)); });
  $('levelsBtn').addEventListener('click', picker);
  $('endlessBtn').addEventListener('click', function () { newRun('endless', 0); });
  $('muteBtn').addEventListener('click', toggleMute);
  $('pickerClose').addEventListener('click', menu);
  $('pauseBtn').addEventListener('click', function (e) { e.currentTarget.blur(); pause(); });
  $('dlgPrimary').addEventListener('click', function () { if (dlg.primary) dlg.primary(); });
  $('dlgSecondary').addEventListener('click', function () { if (dlg.secondary) dlg.secondary(); });
  $('dlgMenu').addEventListener('click', menu);
  function toggleMute() { S.mute = !S.mute; save(); $('muteBtn').textContent = 'Ton: ' + (S.mute ? 'aus' : 'an'); if (!S.mute) audio(); }

  // ---------- Eingabe: Touch, Maus, Tastatur ----------
  document.addEventListener('pointerdown', function (e) {
    audio();
    if (e.target.closest && e.target.closest('button,a,summary,.screen')) return;
    if (state === 'ready' || state === 'play') { e.preventDefault(); flap(); }
  }, { passive: false });
  document.addEventListener('keydown', function (e) {
    var k = e.code || e.key, playing = state === 'ready' || state === 'play';
    if (k === 'Space' || k === 'ArrowUp' || k === 'KeyW' || k === ' ') {
      if (playing) { e.preventDefault(); if (!e.repeat) flap(); }
    } else if (k === 'Escape' || k === 'KeyP') {
      if (playing) pause(); else if (state === 'pause') resume(); else if (!$('picker').hidden) menu();
    } else if (k === 'KeyM') toggleMute();
  });
  document.addEventListener('visibilitychange', function () { if (document.hidden) pause(); });
  window.addEventListener('blur', function () { if (state === 'play') pause(); });

  // ---------- Gamecontroller ----------
  var padPrev = {}, padRepeat = 0;
  function focusables() {
    var scr = screens.map($).filter(function (s) { return !s.hidden; })[0];
    if (!scr) return [];
    return Array.prototype.filter.call(scr.querySelectorAll('button,a[href],summary'), function (el) { return !el.disabled && el.offsetParent !== null; });
  }
  function focusFirst() { var f = focusables(); if (f[0] && padUsed) padFocus(f[0]); }
  var padUsed = false;
  function padFocus(el) { el.focus({ preventScroll: false }); el.classList.add('pad-focus'); if (el.scrollIntoView) el.scrollIntoView({ block: 'nearest' }); }
  document.addEventListener('focusout', function (e) { if (e.target.classList) e.target.classList.remove('pad-focus'); });
  function navigate(dir) {
    var els = focusables(); if (!els.length) return;
    var cur = document.activeElement;
    if (els.indexOf(cur) < 0) { padFocus(els[0]); return; }
    var r = cur.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, best = null, bd = 1e9;
    els.forEach(function (el) {
      if (el === cur) return;
      var q = el.getBoundingClientRect(), dx = q.left + q.width / 2 - cx, dy = q.top + q.height / 2 - cy;
      var along = dir === 'l' ? -dx : dir === 'r' ? dx : dir === 'u' ? -dy : dy, across = dir === 'l' || dir === 'r' ? Math.abs(dy) : Math.abs(dx);
      if (along <= 4) return;
      var d = along + across * 2; if (d < bd) { bd = d; best = el; }
    });
    if (best) padFocus(best);
  }
  function pollPad(dt) {
    if (!navigator.getGamepads) return;
    var pads = navigator.getGamepads(), gp = null;
    for (var i = 0; i < pads.length; i++) if (pads[i] && pads[i].connected) { gp = pads[i]; break; }
    if (!gp) return;
    var b = function (n) { var x = gp.buttons[n]; return !!x && (x.pressed || x.value > .5); };
    var now = {}, ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
    now.a = b(0); now.b = b(1); now.x = b(2); now.y = b(3); now.rt = b(7); now.start = b(9); now.sel = b(8);
    now.u = b(12) || ay < -.6; now.d = b(13) || ay > .6; now.l = b(14) || ax < -.6; now.r = b(15) || ax > .6;
    var edge = function (k) { return now[k] && !padPrev[k]; };
    var any = false; for (var k in now) if (now[k]) any = true;
    if (any) { padUsed = true; audio(); }
    var playing = state === 'ready' || state === 'play';
    if (playing) {
      if (edge('a') || edge('b') || edge('x') || edge('y') || edge('rt')) flap();
      if (edge('start')) pause();
    } else if (performance.now() - dialogAt > 350) {
      var dirs = ['u', 'd', 'l', 'r'], held = dirs.filter(function (d) { return now[d]; });
      if (held.length) {
        if (dirs.some(edge)) { navigate(held[0]); padRepeat = .35; }
        else { padRepeat -= dt; if (padRepeat <= 0) { navigate(held[0]); padRepeat = .14; } }
      }
      if (edge('a')) { var f = focusables(), cur = document.activeElement; if (f.indexOf(cur) >= 0) cur.click(); else if (f[0]) padFocus(f[0]); }
      if (edge('b')) { if (state === 'pause') resume(); else if (!$('picker').hidden) menu(); }
      if (edge('start') && state === 'pause') resume();
    }
    if (edge('sel')) toggleMute();
    padPrev = now;
  }
  window.addEventListener('gamepadconnected', function () { padUsed = true; if (state !== 'play' && state !== 'ready') focusFirst(); });

  // ---------- Hauptschleife ----------
  var last = performance.now(), acc = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    var dt = Math.min(.1, Math.max(0, (now - last) / 1000)); last = now;
    pollPad(dt);
    if (state !== 'pause') { acc += dt; var n = 0; while (acc >= STEP && n++ < 24) { step(STEP); acc -= STEP; } if (n >= 24) acc = 0; }
    render();
    watchPerf(dt);
  }
  setWorld(0);
  menu();
  requestAnimationFrame(frame);
  // für Tests
  window.__ricoFlap = { get state() { return state; }, get run() { return run; }, get by() { return by; }, flap: flap, newRun: newRun, pipes: pipes, bird: bird, menu: menu, LEVELS: LEVELS, get quality() { return quality; } };
})();
