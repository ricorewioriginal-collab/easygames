/* GayLife – echte, animierte 3D-Menschen statt Klötzchen-Figuren.
   Körper und 22 Bewegungen: Quaternius „Universal Base Characters“ und „Universal Animation Library“ (CC0) aus ../figuren/.
   makePerson() baut wie bisher sofort die einfache Figur (läuft auch ohne Netz/WebGL-Erweiterungen); sobald das Modell geladen ist,
   ersetzt GL.fig.upgrade() sie durch den echten Körper mit Hautton, Frisur, Bart, Oberteil und Hose aus dem Look.
   Grafik „Niedrig“ behält die einfachen Figuren. animPerson() spielt dann Stehen, Gehen, Joggen, Sprinten oder Tanzen. */
(function () {
  'use strict';
  var F = GL.fig = { kit: null, n: 0, failed: false };
  function kit() {
    if (F.kit || F.failed) return F.kit;
    try { if (window.EasyFiguren && window.THREE && THREE.GLTFLoader) F.kit = EasyFiguren.create({ THREE: THREE, base: '../figuren/' }); } catch (e) { F.kit = null; }
    if (!F.kit) F.failed = true;
    return F.kit;
  }
  F.on = function () { return !!kit() && (GL.S.settings.q | 0) !== 0 && !window.__GL_NOFIG; };
  var HAIR = ['short', 'fringe', 'curly', 'buzz', 'long', 'mohawk'];
  function look(L) {
    var C = GL.core, SK = C.SKIN, HC = C.HC, TC = C.TC, sk = SK[L.skin] || SK[1], hc = HC[L.hc] || HC[1], tc = TC[L.tc] || TC[0];
    if (L.top === 6) tc = '#2a2d3a'; if (L.top === 5) tc = '#ff4f9a'; if (L.top === 3) tc = C.mix(tc, '#000000', .12);
    var o = {
      body: L.body === 'w' ? 'w' : 'm', skin: sk[0], top: tc, topStyle: L.top === 1 ? 'tank' : (L.top === 3 || L.top === 6) ? 'long' : 'tee',
      bottom: ['#2b3050', '#3a3a46', '#5a4636', '#27415c'][((L.tc | 0) + (L.top | 0)) % 4], bottomStyle: 'pants', shoes: '#f4f4f6',
      hair: { style: HAIR[L.hair] || 'short', color: hc }
    };
    if (L.beard >= 1 && L.beard <= 4) o.beard = hc;
    if (L.acc === 3) o.hat = { type: 'cap', color: C.mix(tc, '#000000', .2) };
    return o;
  }
  /* Einfache Figur g gegen den echten Körper tauschen (asynchron; g bleibt dieselbe Gruppe, Position/Drehung gelten weiter) */
  F.upgrade = function (g, L) {
    if (!F.on() || !g || g.userData.fig || g.userData.figLoading) return;
    g.userData.figLoading = true; var old = g.children.slice();   // nur die einfache Figur ausblenden, später angehängte Namensschilder bleiben
    kit().make(look(L)).then(function (fig) {
      g.userData.figLoading = false;
      if (g.userData.dead) { fig.dispose(); return; }
      fig.root.scale.setScalar(2.15 / (fig.height * .95));   // so groß wie die alten Figuren (Türen, Kamera, Namensschilder passen weiter)
      g.userData.old = old.filter(function (c) { return !(c.geometry && c.geometry.type === 'CircleGeometry'); });
      g.add(fig.root); g.userData.fig = fig; F.n++; lod(g, true);
      fig.update(0.016);
    }).catch(function () { g.userData.figLoading = false; F.failed = true; });
  };
  /* Detailstufe: nahe Figuren als echter Körper, ferne als einfache Figur (spart Rechenzeit auf Handys) */
  var V = null;
  function lod(g, near) {
    var u = g.userData; if (u.near === near) return; u.near = near;
    u.fig.root.visible = near; u.old.forEach(function (c) { c.visible = !near; });
  }
  F.far = function () { var q = GL.S.settings.q, c = GL.perf ? GL.perf.cap : 2; return q === 2 ? 46 : q === 1 ? 30 : [14, 24, 40][c] || 14; };   // Automatisch: der Leistungswächter verkleinert den Abstand
  /* Bewegung: v 0 Stehen, 1 Gehen, 1.4 Tanzen, 2 Joggen, 3 Sprinten */
  F.anim = function (g, v) {
    var f = g.userData.fig; if (!f) return false;
    var now = performance.now(), dt = Math.min(.1, (now - (g.userData.ft || now)) / 1000); g.userData.ft = now;
    var a = v >= 2.5 ? 'sprint' : v >= 1.8 ? 'jog' : v > 1.2 ? 'dance' : v > .05 ? 'walk' : 'idle';
    if (f.curName !== a) f.play(a, { fade: .2 });
    var W = GL.W, near = true;
    if (W && W.cam && g.parent === W.scene) { V = V || new THREE.Vector3(); near = V.set(g.position.x, 0, g.position.z).distanceTo(W.cam.position) < F.far(); }
    lod(g, near);
    if (g.visible && near) f.update(dt); else g.userData.ft = now;
    return true;
  };
})();
