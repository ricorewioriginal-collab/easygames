/* GayLife – eigene Wohnung: betretbarer Innenraum mit benutzbaren Möbeln (Bett, Dusche, Küche, Sofa mit Fernseher, Kleiderschrank, Laptop).
   Der Innenraum steht abseits der Stadt (Mittelpunkt x 0, z 300). Wände zeigen nur nach innen, damit die Kamera von außen hineinsieht (Puppenhaus-Ansicht).
   Beim Betreten werden Bewegungsgrenzen, Kamera, Licht und Sichtweite umgestellt, beim Verlassen zurückgesetzt. */
(function () {
  'use strict';
  var S = GL.S, L = S.life;
  var OX = 0, OZ = 300, RW = 16, RD = 12; // Raummitte und Größe
  var home = GL.home = {};
  var R = null; // Szene-Objekte der Wohnung

  function build(W) {
    var C = GL.core, g = new THREE.Group(), plates = []; g.position.set(OX, 0, OZ); W.scene.add(g);
    function box(w, h, d, col, x, y, z, o) { var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), C.lmat(col, o)); m.position.set(x, y, z); g.add(m); return m; }
    function col(x, z, w, d) { W.colliders.push({ x0: OX + x - w / 2, x1: OX + x + w / 2, z0: OZ + z - d / 2, z1: OZ + z + d / 2 }); }
    // Boden (Holzdielen)
    var fl = new THREE.Mesh(new THREE.PlaneGeometry(RW, RD), new THREE.MeshLambertMaterial({ map: C.cvTex(256, 256, function (c, w, h) {
      for (var i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#c99a6b' : '#d4a777'; c.fillRect(0, i * 32, w, 32); c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(0, i * 32, w, 2); c.fillRect(((i * 97) % 200) + 20, i * 32, 2, 32); }
    }) }));
    fl.material.map.wrapS = fl.material.map.wrapT = THREE.RepeatWrapping; fl.material.map.repeat.set(3, 2);
    fl.rotation.x = -Math.PI / 2; fl.position.y = .02; g.add(fl);
    // Wände: Flächen mit Vorderseite nach innen
    var wallM = C.lmat(0xf3e6f0), wallH = 4.2;
    [[0, -RD / 2, 0, RW], [0, RD / 2, Math.PI, RW], [-RW / 2, 0, Math.PI / 2, RD], [RW / 2, 0, -Math.PI / 2, RD]].forEach(function (q) {
      var m = new THREE.Mesh(new THREE.PlaneGeometry(q[3], wallH), wallM); m.position.set(q[0], wallH / 2, q[1]); m.rotation.y = q[2]; g.add(m);
    });
    // Fenster mit Blick auf die Stadt (Nordwand), wechselt mit der Tageszeit
    var winT = C.cvTex(256, 128, function (c, w, h) {
      c.fillStyle = '#20163f'; c.fillRect(0, 0, w, h); var cl = ['#ff3b6b', '#ff9f1c', '#ffe14d', '#3ddc84', '#2ea8ff', '#9b5cff'];
      for (var i = 0; i < 14; i++) { var bh = 30 + (i * 37) % 70, bx = i * 19; c.fillStyle = '#2d2457'; c.fillRect(bx, h - bh, 17, bh); for (var y = h - bh + 6; y < h - 6; y += 10) { c.fillStyle = (i + y) % 3 ? '#ffd98a' : cl[i % 6]; c.fillRect(bx + 4, y, 3, 4); c.fillRect(bx + 10, y, 3, 4); } }
      c.strokeStyle = '#fff'; c.lineWidth = 6; c.strokeRect(0, 0, w, h); c.beginPath(); c.moveTo(w / 2, 0); c.lineTo(w / 2, h); c.stroke();
    });
    var winM = new THREE.MeshBasicMaterial({ map: winT, color: 0xffffff });
    var win = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 2.2), winM); win.position.set(-3.6, 2.5, -RD / 2 + .02); g.add(win);
    // Teppich
    var rug = new THREE.Mesh(new THREE.CircleGeometry(2.4, 32), new THREE.MeshLambertMaterial({ map: C.cvTex(128, 128, function (c, w, h) { var cl = ['#ff3b6b', '#ff9f1c', '#ffe14d', '#3ddc84', '#2ea8ff', '#9b5cff']; for (var i = 0; i < 6; i++) { c.fillStyle = cl[i]; c.beginPath(); c.arc(64, 64, 64 - i * 9, 0, 7); c.fill(); } c.fillStyle = '#f6eefa'; c.beginPath(); c.arc(64, 64, 10, 0, 7); c.fill(); }) }));
    rug.rotation.x = -Math.PI / 2; rug.position.set(-1, .03, 1.2); g.add(rug);
    // Bett (Nordwest)
    box(3, .6, 4.2, 0x8a6a52, -5.9, .3, -3.6); box(2.8, .35, 4, 0xffffff, -5.9, .78, -3.6); box(2.85, .12, 2.6, 0x9b5cff, -5.9, .98, -2.9);
    box(1.1, .3, .6, 0xfff0f6, -6.6, 1.05, -5.2); box(1.1, .3, .6, 0xfff0f6, -5.2, 1.05, -5.2); box(3, 1.4, .25, 0x6e4f3c, -5.9, .9, -5.8);
    col(-5.9, -3.6, 3, 4.4);
    // Nachttisch mit Lampe
    box(.8, .7, .7, 0x6e4f3c, -3.9, .35, -5.3); var lamp = box(.45, .5, .45, 0xffe9a8, -3.9, 1, -5.3, { emissive: 0xffd27a, emissiveIntensity: .8 }); col(-3.9, -5.3, .8, .7);
    // Kleiderschrank (Nordwand Mitte)
    box(2.6, 3.4, 1, 0xe7d3ea, 0, 1.7, -5.4); box(.06, 3, .04, 0x9a7ca3, 0, 1.7, -4.88); box(.1, .5, .08, 0x5a4a5e, -.25, 1.8, -4.86); box(.1, .5, .08, 0x5a4a5e, .25, 1.8, -4.86); col(0, -5.4, 2.6, 1);
    // Schreibtisch mit Laptop
    box(2.2, .1, 1, 0xb07a4a, 3.3, 1.05, -5.4); [[2.3, -5.8], [4.3, -5.8], [2.3, -5], [4.3, -5]].forEach(function (q) { box(.08, 1, .08, 0x5a4636, q[0], .5, q[1]); });
    box(.9, .05, .6, 0x2a2d3a, 3.3, 1.12, -5.3); var scr = box(.9, .6, .04, 0x2a2d3a, 3.3, 1.42, -5.6); scr.rotation.x = -.2;
    var scrF = new THREE.Mesh(new THREE.PlaneGeometry(.8, .5), new THREE.MeshBasicMaterial({ color: 0x7fd3ff })); scrF.position.set(3.3, 1.43, -5.57); scrF.rotation.x = -.2; g.add(scrF);
    box(.6, .9, .6, 0x3a3a46, 3.3, .45, -4.5); col(3.3, -5.3, 2.2, 1.1);
    // Dusche (Nordost): Wanne + Glas
    box(2.4, .2, 2.4, 0xffffff, 6.6, .1, -4.6); box(.1, 2.6, 2.4, 0xcfefff, 5.4, 1.4, -4.6, { transparent: true, opacity: .35 }); box(2.4, 2.6, .1, 0xcfefff, 6.6, 1.4, -3.4, { transparent: true, opacity: .35 });
    box(.1, .1, .5, 0xc0c0c8, 7.6, 2.6, -4.6); col(6.6, -4.6, 2.4, 2.4);
    var steam = new THREE.Mesh(new THREE.SphereGeometry(.9, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })); steam.position.set(6.6, 1.8, -4.6); g.add(steam);
    // Küche (Ostwand): Zeile mit Herd und Kühlschrank
    box(1.2, 1, 3.6, 0xffffff, 7.3, .5, .4); box(1.3, .08, 3.7, 0x3a3750, 7.3, 1.04, .4);
    [[-.5], [.7]].forEach(function (q) { var p = new THREE.Mesh(new THREE.CylinderGeometry(.25, .25, .03, 16), new THREE.MeshLambertMaterial({ color: 0x222222, emissive: 0xff3b1f, emissiveIntensity: 0 })); p.position.set(7.2, 1.09, q[0]); g.add(p); plates.push(p); });
    var pot = box(.4, .3, .4, 0xc0c0c8, 7.2, 1.25, -.5); box(1.2, 3, 1.2, 0xe9eef5, 7.3, 1.5, 3.2); box(.06, .8, .06, 0x888899, 6.67, 1.9, 2.8);
    col(7.3, 1.2, 1.2, 5.6);
    // Sofa und Fernseher (Westseite)
    box(.25, 1.6, 2.8, 0x14141c, -7.8, 2.1, 2.2); var tv = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.4), new THREE.MeshBasicMaterial({ color: 0x1b1b29 })); tv.position.set(-7.66, 2.1, 2.2); tv.rotation.y = Math.PI / 2; g.add(tv);
    box(.9, .5, 2.2, 0x6a4a3a, -7.4, .25, 2.2); col(-7.5, 2.2, 1, 2.8);
    box(1.2, .5, 3, 0x3a6cff, -3.6, .45, 2.2); box(.4, .9, 3, 0x3a6cff, -3.1, .9, 2.2); box(1.2, .7, .35, 0x3255d6, -3.6, .7, .8); box(1.2, .7, .35, 0x3255d6, -3.6, .7, 3.6);
    box(.5, .4, .5, 0xff4fa3, -3.7, .85, 1.5); col(-3.5, 2.2, 1.4, 3.2);
    box(1, .45, .7, 0xb07a4a, -5.6, .23, 2.2); col(-5.6, 2.2, 1, .7);
    // Pflanzen
    [[-7.3, -1.2], [7.2, -2.4], [-1.6, 5.4]].forEach(function (q) { box(.6, .6, .6, 0xd47a5a, q[0], .3, q[1]); var l = new THREE.Mesh(new THREE.IcosahedronGeometry(.6, 0), C.lmat(0x5fbf6a)); l.position.set(q[0], 1.1, q[1]); g.add(l); col(q[0], q[1], .6, .6); });
    // Wandbilder
    function pic(x, y, z, ry, c1, r) { var p = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1), new THREE.MeshBasicMaterial({ map: C.cvTex(64, 48, function (c, w, h) { c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); c.fillStyle = c1; c.beginPath(); c.arc(w / 2, h / 2, r, 0, 7); c.fill(); c.strokeStyle = '#333'; c.lineWidth = 4; c.strokeRect(0, 0, w, h); }) })); p.position.set(x, y, z); p.rotation.y = ry; g.add(p); }
    pic(-RW / 2 + .03, 2.6, -4.4, Math.PI / 2, '#2ea8ff', 10); pic(5.2, 2.8, RD / 2 - .03, Math.PI, '#ff4fa3', 14);
    // Tür (Südwand)
    // Tür als Fläche nach innen (verdeckt die Sicht von der Kamera aus nicht)
    var door = new THREE.Mesh(new THREE.PlaneGeometry(2, 3.2), C.lmat(0x6e4f3c)); door.position.set(0, 1.6, RD / 2 - .03); door.rotation.y = Math.PI; g.add(door);
    var knob = new THREE.Mesh(new THREE.CircleGeometry(.09, 10), C.lmat(0xf3c34a)); knob.position.set(-.7, 1.6, RD / 2 - .05); knob.rotation.y = Math.PI; g.add(knob);
    // Umgebung außerhalb der Wohnung abdecken (sonst sähe man den Stadtrasen)
    var voidM = new THREE.MeshBasicMaterial({ color: 0x2a1f40 }), vd = new THREE.Mesh(new THREE.PlaneGeometry(140, 140), voidM); vd.rotation.x = -Math.PI / 2; vd.position.y = .01; g.add(vd);
    var mat = new THREE.Mesh(new THREE.PlaneGeometry(2, 1.2), C.lmat(0x7a5a4a)); mat.rotation.x = -Math.PI / 2; mat.position.set(0, .03, RD / 2 - 1); g.add(mat);
    // Wände als Hindernisse (dünn, außen)
    W.colliders.push({ x0: OX - RW / 2 - 1, x1: OX + RW / 2 + 1, z0: OZ - RD / 2 - 1, z1: OZ - RD / 2 + .3 });
    return { g: g, voidM: voidM, win: winM, lamp: lamp, steam: steam, pot: pot, tv: tv, plates: plates };
  }

  /* Benutzbare Stellen im Raum (relativ zur Raummitte) */
  var SPOTS = [
    { id: 'bed', x: -3.8, z: -3.2, label: function () { return 'Schlafen'; }, fn: sleep },
    { id: 'wardrobe', x: 0, z: -4.2, label: function () { return 'Kleiderschrank'; }, fn: function () { GL.core.editor(); } },
    { id: 'laptop', x: 3.3, z: -3.8, label: function () { return 'Laptop: Speichern, Möbel, Miete'; }, fn: function () { if (GL.furn) GL.furn.laptop(); else { GL.save(); GL.core.toast('Gespeichert.'); } } },
    { id: 'shower', x: 4.7, z: -3.6, label: function () { return 'Duschen'; }, fn: shower },
    { id: 'kitchen', x: 5.9, z: -.2, label: function () { return 'Kochen (' + L.food + ' ' + (L.food === 1 ? 'Portion' : 'Portionen') + ')'; }, fn: cook },
    { id: 'tv', x: -2.2, z: 2.2, label: function () { return 'Fernsehen'; }, fn: tv },
    { id: 'door', x: 0, z: 4.9, r: 1.2, label: function () { return 'Wohnung verlassen'; }, fn: function () { home.leave(); } }
  ];

  function busy(text, min, cb, sleeping) { GL.ui.fade(text, function () { GL.life.advance(min, sleeping); if (cb) cb(); GL.save(); }, sleeping ? 1500 : 900); }
  function sleep() {
    var h = GL.life.hour(), en = L.needs.energy;
    if (en > 85) { GL.core.toast('Du bist hellwach. Später vielleicht.'); return; }
    var night = h >= 20 || h < 10, min;
    if (night) { var to = 7 - h; if (to <= 0) to += 24; min = Math.round(Math.min(10, to) * 60); } else min = 120;
    var d0 = L.day;
    busy(night ? 'Du schläfst … 💤' : 'Ein kurzes Nickerchen … 💤', min, function () {
      L.stats.sleeps++; GL.life.change({}, 6); if (S.home.partner) { GL.dating.rel(S.home.partner).last = L.day; GL.life.change({ social: 10 }, 4); }
      GL.core.banner(night ? 'Guten Morgen!' : 'Ausgeschlafen', GL.life.weekday() + ', ' + GL.life.clock() + (L.day > d0 ? ' · Tag ' + L.day : ''));
    }, true);
  }
  function shower() {
    if (R) R.steam.material.opacity = .45;
    busy('Du duschst … 🚿', 20, function () { L.stats.showers++; GL.life.change({ hygiene: 100, stress: -5 }, 5); GL.core.toast('Frisch geduscht.'); if (R) setTimeout(function () { R.steam.material.opacity = 0; }, 1500); });
  }
  function cook() {
    if (L.food <= 0) { GL.core.toast('Der Kühlschrank ist leer. Lebensmittel gibt es im Späti Lecker.'); GL.core.sfx('no'); return; }
    if (R) R.plates.forEach(function (p) { p.material.emissiveIntensity = .9; });
    busy('Du kochst … 🍝', 45, function () {
      L.food--; L.stats.meals++; GL.life.change({ hunger: 55 }, 4); GL.core.toast('Lecker! Noch ' + L.food + ' im Kühlschrank.');
      if (R) setTimeout(function () { R.plates.forEach(function (p) { p.material.emissiveIntensity = 0; }); }, 1500);
    });
  }
  var TVSHOW = ['eine Kochshow, in der alles schiefgeht', 'die Wiederholung einer Drag-Castingshow', 'eine Doku über Pinguine, die sich verlieben', 'ein Quiz, bei dem du alles besser weißt', 'eine Seifenoper aus Rainbow City'];
  function tv() {
    if (R) R.tv.material.color.setHex(0x7fd3ff);
    var s = TVSHOW[Math.floor(Math.random() * TVSHOW.length)];
    busy('Du schaust ' + s + ' … 📺', 60, function () { GL.life.change({ stress: -20 }, 6); if (R) R.tv.material.color.setHex(0x1b1b29); GL.core.toast('Entspannt. Stress −20'); });
  }

  /* Betreten und Verlassen */
  var saved = null;
  function apply(W, inside) {
    W.inside = inside ? 1 : 0; L.inside = W.inside;
    if (inside) {
      W.bounds = { x0: OX - RW / 2 + .7, x1: OX + RW / 2 - .7, z0: OZ - RD / 2 + .7, z1: OZ + RD / 2 - .7 };
      W.camD = 7.6; W.camH = 8.2; W.cam.far = 80; W.sun.target.position.set(OX, 0, OZ); W.sun.position.set(OX + 12, 30, OZ + 18);
    } else {
      W.bounds = { x0: -96, x1: 96, z0: -68, z1: 68 }; W.camD = 10.5; W.camH = 6.4; W.cam.far = saved ? saved.far : 420; W.sun.target.position.set(0, 0, 0);
    }
    W.sun.target.updateMatrixWorld(); W.cam.updateProjectionMatrix();
  }
  function snapCam(W) { var p = W.player; W.cam.position.set(p.x + Math.sin(W.camYaw) * W.camD, W.camH, p.z + Math.cos(W.camYaw) * W.camD); }
  home.enter = function () {
    var W = GL.W; if (!W || W.inside) return;
    GL.ui.fade('Zu Hause', function () {
      saved = { far: W.cam.far }; apply(W, 1);
      W.player.x = OX; W.player.z = OZ + 3.2; W.camYaw = 0; W.yaw = Math.PI; snapCam(W);
      GL.save();
    }, 500);
  };
  home.leave = function (instant) {
    var W = GL.W; if (!W || !W.inside) return;
    function go() { apply(W, 0); var d = W.pois.home; W.player.x = d.x; W.player.z = d.z; W.camYaw = Math.PI; W.yaw = Math.PI; snapCam(W); GL.save(); }
    if (instant) go(); else GL.ui.fade('Raus in die Stadt', go, 500);
  };
  home.root = function () { return R && R.g; }; home.O = { x: OX, z: OZ };
  home.inside = function () { return !!(GL.W && GL.W.inside); };

  GL.on('poi', function (id) { if (id === 'home') { home.enter(); return true; } });
  GL.on('worldBuilt', function (W) {
    R = build(W);
    SPOTS.forEach(function (s) {
      W.inter.push({ x: OX + s.x, z: OZ + s.z, r: s.r || 1.8, get on() { return !!W.inside; }, get label() { return s.label(); }, fn: s.fn });
    });
    if (L.inside) { saved = { far: W.cam.far }; apply(W, 1); var b = W.bounds; W.player.x = Math.max(b.x0, Math.min(b.x1, W.player.x)); W.player.z = Math.max(b.z0, Math.min(b.z1, W.player.z)); }
  });
  /* Licht im Raum: hell am Tag, warm am Abend; Fensterbild folgt der Tageszeit */
  GL.on('sky', function (W) {
    if (!W.inside) return;
    var h = GL.life.hour(), day = h > 7 && h < 19, c = day ? 0xd9c8e8 : 0x2a1f40;
    if (!W._inCol || W._inCol !== c) { W._inCol = c; W.scene.background = new THREE.Color(c); W.scene.fog.color.setHex(c); R.voidM.color.setHex(day ? 0xb9a6cf : 0x1c1430); }
    W.hemi.intensity = day ? .95 : .7; W.sun.intensity = day ? .55 : .3; W.sun.color.setHex(day ? 0xffffff : 0xffc28a);
    R.win.color.setHex(day ? 0xbfe6ff : 0xffffff); R.lamp.material.emissiveIntensity = day ? .2 : 1;
    W.starsM.visible = W.sunM.visible = W.moonM.visible = false;
    return true;
  });
  GL.on('tick', function (dt, W) { if (!W.inside) { if (!W.starsM.visible) W.starsM.visible = true; W._inCol = 0; } });
})();
