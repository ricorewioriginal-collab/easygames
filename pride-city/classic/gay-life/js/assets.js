/* GayLife – freie Assets (Lizenzen und Herkunft: ../CREDITS.md):
   - Bäume im Pride District: Kenney „Fantasy Town Kit“ (CC0), drei Sorten als InstancedMesh (ein Zeichenaufruf je Sorte).
     Bis zum Laden (und ohne Netz) bleiben die einfachen Bäume stehen.
   - Geräusche: Kenney „Impact Sounds“/„RPG Audio“ (CC0) und Tierstimmen von OpenGameArt (CC0) für Sticker, Belohnungen,
     Türen, Hund Gerd und Katze Pixel. Lautlos, wenn der Ton aus ist. */
(function () {
  'use strict';
  var A = GL.assets = { trees: 0 }, S = GL.S;
  /* ---------- Geräusche ---------- */
  var SND = {};
  A.sound = function (n, vol) {
    if (!S.sound) return;
    try {
      var a = SND[n] || (SND[n] = new Audio('sounds/' + n + '.mp3'));
      var b = a.paused ? a : a.cloneNode(); b.volume = vol == null ? .6 : vol; var p = b.play(); if (p && p.catch) p.catch(function () { });
    } catch (e) { }
  };
  GL.on('earn', function (a, t) { if (a > 0 && /Tagesziel|Sticker|Schicht/.test(t || '')) A.sound('coins', .5); });
  GL.on('poi', function () { A.sound('enter', .45); });
  /* Hund und Katze: Laut, wenn sie mitkommen */
  var pet = { dog: -1, cat: -1 };
  GL.on('tick', function (dt, W) {
    ['dog', 'cat'].forEach(function (k) { var o = W[k]; if (!o) return; if (pet[k] >= 0 && o.mode !== pet[k] && o.mode >= 2) A.sound(k, .55); pet[k] = o.mode; });
  });

  /* ---------- Bäume ---------- */
  var FILES = ['tree', 'tree-high', 'tree-high-round'];
  function load(f) { return new Promise(function (res, rej) { new THREE.GLTFLoader().load('models/' + f + '.glb', function (g) { res(g); }, null, rej); }); }
  GL.on('worldBuilt', function (W) {
    if (!THREE.GLTFLoader || !W.trees || !W.trees.length || window.__GL_NOASSETS) return;
    Promise.all(FILES.map(load)).then(function (gs) {
      var parts = gs.map(function (g) {
        var mesh = null; g.scene.traverse(function (o) { if (o.isMesh && !mesh) mesh = o; });
        if (!mesh) return null;
        mesh.geometry.computeBoundingBox(); var bb = mesh.geometry.boundingBox, h = bb.max.y - bb.min.y || 1;
        var m = mesh.material; if (m.map) m.map.encoding = THREE.LinearEncoding;
        var lam = new THREE.MeshLambertMaterial({ map: m.map || null, color: m.map ? 0xffffff : m.color });   // wie die übrige Stadt beleuchtet
        return { geo: mesh.geometry, mat: lam, s: 5.6 / h, y0: -bb.min.y };
      });
      if (parts.some(function (p) { return !p; })) return;
      var by = [[], [], []];
      W.trees.forEach(function (t) { by[Math.abs(Math.round(t.x * 3 + t.z * 7)) % 3].push(t); });
      var M = new THREE.Matrix4(), Q = new THREE.Quaternion(), P = new THREE.Vector3(), SC = new THREE.Vector3(), Y = new THREE.Vector3(0, 1, 0);
      by.forEach(function (list, k) {
        if (!list.length) return; var p = parts[k], im = new THREE.InstancedMesh(p.geo, p.mat, list.length);
        list.forEach(function (t, i) {
          var r = Math.abs(Math.sin(t.x * 12.9 + t.z * 78.2)), sc = p.s * (.9 + r * .25);
          Q.setFromAxisAngle(Y, r * 6.283); P.set(t.x, p.y0 * sc, t.z); SC.set(sc, sc, sc); M.compose(P, Q, SC); im.setMatrixAt(i, M);
          t.m.forEach(function (o) { o.visible = false; });
        });
        im.instanceMatrix.needsUpdate = true; W.scene.add(im); A.trees += list.length;
      });
    }).catch(function () { /* ohne Modelle: einfache Bäume bleiben */ });
  });
})();
