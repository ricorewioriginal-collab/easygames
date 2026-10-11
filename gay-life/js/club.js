/* GayLife – Club Glitzer als begehbarer Innenraum (Mittelpunkt x 0, z 450, abseits der Stadt wie die Wohnung):
   leuchtende Tanzfläche im Takt, Discokugel, DJ-Pult, Bar mit Bruno, tanzende Gäste, Musik aus dem Beat-Generator (js/audio.js).
   Eintritt wie bisher (einmal pro Nacht bezahlt), geöffnet 20–5 Uhr; um 5 Uhr schließt der Club und man steht draußen.
   Stellen im Raum: Tanzfläche (Tanzen), Bar (Getränke), DJ-Pult (Club-Menü mit Gruppentanz), Tür. W.inside = 2 (die Wohnung ist 1). */
(function () {
  'use strict';
  var S = GL.S, L = S.life, K = GL.club = {};
  var OX = 0, OZ = 450, RW = 26, RD = 20, R = null, saved = null, ambT = 0;

  function build(W) {
    var C = GL.core, g = new THREE.Group(), tiles = [], dancers = [], fx = {}, i;
    g.position.set(OX, 0, OZ); W.scene.add(g);
    function box(w, h, d, col, x, y, z, o) { var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), C.lmat(col, o)); m.position.set(x, y, z); g.add(m); return m; }
    function colr(x, z, w, d) { W.colliders.push({ x0: OX + x - w / 2, x1: OX + x + w / 2, z0: OZ + z - d / 2, z1: OZ + z + d / 2 }); }
    var fl = new THREE.Mesh(new THREE.PlaneGeometry(RW, RD), C.lmat(0x1a1030)); fl.rotation.x = -Math.PI / 2; fl.position.y = .02; g.add(fl);
    var wallM = C.lmat(0x2a1a4a), wallH = 6;
    [[0, -RD / 2, 0, RW], [0, RD / 2, Math.PI, RW], [-RW / 2, 0, Math.PI / 2, RD], [RW / 2, 0, -Math.PI / 2, RD]].forEach(function (q) {
      var m = new THREE.Mesh(new THREE.PlaneGeometry(q[3], wallH), wallM); m.position.set(q[0], wallH / 2, q[1]); m.rotation.y = q[2]; g.add(m);
    });
    // Tanzfläche: 6 x 6 Kacheln, jede mit eigener Farbe (Pride-Farben)
    var cols = [0xff3b6b, 0xff9f1c, 0xffe14d, 0x3ddc84, 0x2ea8ff, 0x9b5cff];
    for (var a = 0; a < 6; a++) for (var b = 0; b < 6; b++) {
      var t = new THREE.Mesh(new THREE.BoxGeometry(1.4, .08, 1.4), new THREE.MeshLambertMaterial({ color: cols[(a + b) % 6], emissive: cols[(a + b) % 6], emissiveIntensity: .3 }));
      t.position.set(-4.2 + a * 1.68, .06, -3 + b * 1.68 - .6); g.add(t); tiles.push(t);
    }
    // Discokugel und zwei Strahlen
    var ball = new THREE.Mesh(new THREE.IcosahedronGeometry(.9, 1), new THREE.MeshLambertMaterial({ color: 0xdfe6ff, emissive: 0x8899cc, emissiveIntensity: .8, flatShading: true })); ball.position.set(0, 5.1, -.6); g.add(ball);
    box(.05, 1, .05, 0x888899, 0, 5.8, -.6);
    var beams = [0xff3b9a, 0x2ee6d6].map(function (c, k) {
      var m = new THREE.Mesh(new THREE.ConeGeometry(1.3, 6, 12, 1, true), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: .16, side: THREE.DoubleSide, depthWrite: false }));
      m.position.set(k ? 5 : -5, 3, -.6); g.add(m); return m;
    });
    // DJ-Pult (Nordwand) mit DJ
    box(6, 1.2, 1.6, 0x14141c, 0, .6, -8.4); box(5.4, .1, 1.2, 0x7c4dff, 0, 1.25, -8.4, { emissive: 0x7c4dff, emissiveIntensity: .6 }); box(.9, .5, .7, 0x2a2d3a, -1, 1.55, -8.4); box(.9, .5, .7, 0x2a2d3a, 1, 1.55, -8.4);
    box(2.2, 2.6, .8, 0x0e0e16, -4.5, 1.3, -9.3); box(2.2, 2.6, .8, 0x0e0e16, 4.5, 1.3, -9.3);
    colr(0, -8.4, 6, 1.6);
    var dj = C.makePerson({ skin: 3, hair: 5, hc: 4, beard: 0, acc: 7, top: 3, tc: 0, eye: 1, build: 1, h: 1, tat: 4 }); dj.position.set(0, 0, -9.4); g.add(dj);
    // Bar (Ostwand) mit Bruno
    box(1.4, 1.2, 8, 0x3a2a5a, 10.6, .6, -2); box(1.7, .1, 8.3, 0xff4fa3, 10.6, 1.25, -2, { emissive: 0xff4fa3, emissiveIntensity: .5 });
    for (i = 0; i < 4; i++) box(.4, 1, .4, 0x14141c, 8.8, .5, -4.5 + i * 1.8);
    box(.3, 2.2, 8, 0x1a1030, 12.7, 1.1, -2); for (i = 0; i < 5; i++) box(.3, .6, .3, cols[i], 12.4, 2.2 + (i % 2) * .5, -5 + i * 1.8, { emissive: cols[i], emissiveIntensity: .6 });
    colr(10.6, -2, 1.7, 8.3);
    var bruno = C.makePerson(C.NPCDEF.filter(function (n) { return n.id === 'bruno'; })[0].look); bruno.position.set(11.9, 0, -2); bruno.rotation.y = -Math.PI / 2; g.add(bruno);
    // Sitzecke (Westwand)
    for (i = 0; i < 3; i++) { box(1.8, .5, 2.6, 0x7c4dff, -11, .25, -5 + i * 3.4); box(.5, 1.1, 2.6, 0x5b34c9, -12.1, .7, -5 + i * 3.4); colr(-11.3, -5 + i * 3.4, 2.2, 2.8); }
    // Tänzer (nur nachts sichtbar)
    var looks = [{ skin: 1, hair: 2, hc: 8, top: 2, tc: 6 }, { skin: 4, hair: 5, hc: 0, top: 1, tc: 3 }, { skin: 2, hair: 4, hc: 3, top: 4, tc: 5 }, { skin: 0, hair: 0, hc: 6, top: 3, tc: 1 }, { skin: 5, hair: 1, hc: 0, top: 5, tc: 0 }, { skin: 3, hair: 6, hc: 0, top: 0, tc: 4 }];
    looks.forEach(function (lk, k) {
      lk = Object.assign({ beard: 0, acc: 0, eye: k % 4, build: k % 3, h: (k + 1) % 3, tat: 0 }, lk);
      var p = C.makePerson(lk); var a2 = k / 6 * 6.283; p.position.set(Math.cos(a2) * 2.3 + (k % 2 ? 1 : -1), 0, Math.sin(a2) * 2.3 - .6); g.add(p); dancers.push({ g: p, ph: k * 1.3, bx: p.position.x, bz: p.position.z });
    });
    // Tür (Südwand) und Matte
    var door = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 3.4), C.lmat(0x7c4dff, { emissive: 0x3a1a88, emissiveIntensity: .6 })); door.position.set(0, 1.7, RD / 2 - .03); door.rotation.y = Math.PI; g.add(door);
    var mat = new THREE.Mesh(new THREE.PlaneGeometry(3, 1.4), C.lmat(0xff3b6b)); mat.rotation.x = -Math.PI / 2; mat.position.set(0, .03, RD / 2 - 1); g.add(mat);
    var vd = new THREE.Mesh(new THREE.PlaneGeometry(140, 140), new THREE.MeshBasicMaterial({ color: 0x0c0818 })); vd.rotation.x = -Math.PI / 2; vd.position.y = .01; g.add(vd);
    W.colliders.push({ x0: OX - RW / 2 - 1, x1: OX + RW / 2 + 1, z0: OZ - RD / 2 - 1, z1: OZ - RD / 2 + .3 });
    return { g: g, tiles: tiles, dancers: dancers, ball: ball, beams: beams, dj: dj, bruno: bruno };
  }

  var SPOTS = [
    { x: 0, z: -.6, r: 3.4, label: function () { return 'Tanzen'; }, fn: function () { if (L.needs.energy < 15) { GL.core.toast('Du bist zu müde zum Tanzen.'); return; } GL.night.dance(); } },
    { x: 8.6, z: -2, r: 2.2, label: function () { return 'Bar: Getränke'; }, fn: function () { GL.night.drinks(); } },
    { x: 0, z: -6.9, r: 2.2, label: function () { return 'DJ-Pult: Club-Menü'; }, fn: function () { GL.night.menu(); } },
    { x: 0, z: 8.7, r: 1.6, label: function () { return 'Club verlassen'; }, fn: function () { K.leave(); } }
  ];

  function apply(W, inside) {
    W.inside = inside ? 2 : 0;
    if (inside) { W.bounds = { x0: OX - RW / 2 + .8, x1: OX + RW / 2 - .8, z0: OZ - RD / 2 + .8, z1: OZ + RD / 2 - .8 }; W.camD = 9; W.camH = 10; W.cam.far = 90; W.sun.target.position.set(OX, 0, OZ); W.sun.position.set(OX + 12, 30, OZ + 18); }
    else { W.bounds = { x0: -96, x1: 96, z0: -68, z1: 68 }; W.camD = 10.5; W.camH = 6.4; W.cam.far = saved ? saved.far : 420; W.sun.target.position.set(0, 0, 0); }
    W.sun.target.updateMatrixWorld(); W.cam.updateProjectionMatrix();
  }
  function snap(W) { var p = W.player; W.cam.position.set(p.x + Math.sin(W.camYaw) * W.camD, W.camH, p.z + Math.cos(W.camYaw) * W.camD); }
  K.inside = function () { return !!(GL.W && GL.W.inside === 2); };
  K.O = { x: OX, z: OZ };
  K.enter = function () {
    var W = GL.W; if (!W || W.inside) return false;
    if (!GL.night.isOpen()) { GL.core.toast('Der Club öffnet um 20 Uhr.'); return false; }
    if (!GL.night.enter()) return false;
    GL.ui.close();
    GL.ui.fade('Club Glitzer 🪩', function () {
      saved = { far: W.cam.far }; apply(W, 1); W.player.x = OX; W.player.z = OZ + 6.5; W.camYaw = 0; W.yaw = Math.PI; snap(W);
      if (GL.audio) GL.audio.song(GL.night.theme().st); ambT = 0; GL.core.toast('Heute: ' + GL.night.theme().n);
    }, 600);
    return true;
  };
  K.leave = function (instant) {
    var W = GL.W; if (!W || W.inside !== 2) return;
    function go() { apply(W, 0); var d = W.pois.club; W.player.x = d.x; W.player.z = d.z; W.camYaw = Math.PI; W.yaw = Math.PI; snap(W); if (GL.audio) GL.audio.stop(); GL.save(); }
    if (instant) go(); else GL.ui.fade('Raus in die Nacht', go, 500);
  };

  GL.on('worldBuilt', function (W) {
    R = build(W);
    SPOTS.forEach(function (s) { W.inter.push({ x: OX + s.x, z: OZ + s.z, r: s.r, get on() { return W.inside === 2; }, get label() { return s.label(); }, fn: s.fn }); });
  });
  /* Licht im Club und Takt der Tanzfläche */
  GL.on('sky', function (W) {
    if (W.inside !== 2) return;
    if (W._inCol !== 'club') { W._inCol = 'club'; W.scene.background = new THREE.Color(0x0c0818); W.scene.fog.color.setHex(0x0c0818); }
    W.hemi.intensity = .6; W.sun.intensity = .25; W.sun.color.setHex(0xb48cff);
    W.starsM.visible = W.sunM.visible = W.moonM.visible = false;
    return true;
  });
  var acc = 0;
  GL.on('tick', function (dt, W) {
    if (W.inside !== 2 || !R) return;
    var t = W.t, bpm = ({ Lounge: 84, Pop: 112, Salsa: 100, Disco: 118, House: 124, Techno: 132 })[GL.night.theme().st] || 110, beat = t * bpm / 60 * 6.283;
    R.tiles.forEach(function (m, i) { m.material.emissiveIntensity = .25 + .55 * Math.max(0, Math.sin(beat / 2 + i * .5)); });
    R.ball.rotation.y += dt * .8; R.beams.forEach(function (b, k) { b.rotation.z = Math.sin(t * .9 + k * 2) * .5; b.rotation.x = Math.cos(t * .7 + k) * .35; });
    R.dancers.forEach(function (d) { d.g.visible = true; d.g.position.y = Math.abs(Math.sin(beat / 2 + d.ph)) * .18; d.g.position.x = d.bx + Math.sin(t * .8 + d.ph) * .5; d.g.rotation.y = Math.sin(t * .6 + d.ph) * 2; GL.core.animPerson(d.g, 1, t * (bpm / 90)); });
    R.dj.position.y = Math.abs(Math.sin(beat / 2)) * .08;
    acc += dt; if (acc < 1) return; acc = 0;
    if (!GL.night.isOpen()) { GL.core.toast('Der Club schließt. Schönen Heimweg!'); K.leave(); return; }
    if (GL.audio && S.sound && !GL.ui.fading && !GL.audio.state().music) GL.audio.song(GL.night.theme().st);
  });
  K.theme = function () { return GL.night.theme(); };
})();
