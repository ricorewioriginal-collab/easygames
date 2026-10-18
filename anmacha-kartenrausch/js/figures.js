'use strict';
/* AnMaCha Kartenrausch 3D – wählbare 3D-Spielfiguren aus einfachen Grundkörpern (wenige Dreiecke, geteilte Geometrien und Materialien).
   KR.FIGS: Liste der Figuren; KR.buildFig(THREE, id) → Group (ca. 1 Einheit hoch); KR.figThumbs(renderer, THREE) → Bild-URLs fürs Menü. */
(function (root) {
  const KR = root.KR = root.KR || {};
  KR.FIGS = [
    { name: 'Robo', emo: '🤖', col: 0x22d3ee },
    { name: 'Fuchs', emo: '🦊', col: 0xff8a3d },
    { name: 'Mieze', emo: '🐱', col: 0xa78bfa },
    { name: 'Pingu', emo: '🐧', col: 0x334155 },
    { name: 'Zorg', emo: '👽', col: 0x84cc16 },
    { name: 'Hoppel', emo: '🐰', col: 0xf8fafc },
    { name: 'Quaki', emo: '🐸', col: 0x22c55e },
    { name: 'Krone', emo: '👑', col: 0xff2d95 }
  ];
  let GEO = null; const MAT = {};
  function geo(T) {
    if (GEO) return GEO;
    GEO = {
      body: new T.CylinderGeometry(.27, .36, .56, 14), head: new T.SphereGeometry(.28, 16, 12), eye: new T.SphereGeometry(.075, 10, 8),
      pup: new T.SphereGeometry(.04, 8, 6), cone: new T.ConeGeometry(.1, .24, 8), box: new T.BoxGeometry(1, 1, 1), ball: new T.SphereGeometry(.05, 8, 6),
      stick: new T.CylinderGeometry(.018, .018, .22, 6), ear: new T.CylinderGeometry(.055, .07, .38, 8), foot: new T.SphereGeometry(.11, 10, 6), crown: new T.CylinderGeometry(.2, .17, .14, 10, 1, true)
    };
    return GEO;
  }
  const mat = (T, c) => MAT[c] || (MAT[c] = new T.MeshLambertMaterial({ color: c, side: T.DoubleSide }));
  function add(T, g, geom, c, x, y, z, sx, sy, sz, rz, rx) {
    const m = new T.Mesh(geom, mat(T, c)); m.position.set(x, y, z);
    if (sx) m.scale.set(sx, sy || sx, sz || sx); if (rz) m.rotation.z = rz; if (rx) m.rotation.x = rx; g.add(m); return m;
  }
  KR.buildFig = function (T, id) {
    const f = KR.FIGS[id] || KR.FIGS[0], G = geo(T), g = new T.Group(), c = f.col;
    const W = 0xffffff, B = 0x111827;
    const eyes = (y, z, s) => { [-1, 1].forEach(k => { add(T, g, G.eye, W, k * .1, y, z, s); add(T, g, G.pup, B, k * .1, y, z + .055 * (s || 1), s); }); };
    if (id === 0) { // Robo: Kastenkopf mit Antenne
      add(T, g, G.box, 0x94a3b8, 0, .3, 0, .5, .52, .36); add(T, g, G.box, c, 0, .78, 0, .5, .4, .42);
      add(T, g, G.box, 0x0f172a, 0, .79, .2, .38, .2, .04); [-1, 1].forEach(k => add(T, g, G.ball, 0x67e8f9, k * .1, .79, .23, .9));
      add(T, g, G.stick, 0x94a3b8, 0, 1.06, 0); add(T, g, G.ball, 0xff2d95, 0, 1.18, 0, 1.4);
      return g;
    }
    if (id === 3) { // Pingu: eiförmig, weißer Bauch, Schnabel
      add(T, g, G.head, c, 0, .42, 0, 1.25, 1.55, 1.15); add(T, g, G.head, W, 0, .38, .1, .95, 1.2, .9);
      eyes(.68, .25, .9); add(T, g, G.cone, 0xff9d2e, 0, .58, .34, .7, .7, .7, 0, Math.PI / 2);
      [-1, 1].forEach(k => add(T, g, G.foot, 0xff9d2e, k * .12, .03, .12, 1, .4, 1.3));
      return g;
    }
    add(T, g, G.body, c, 0, .28, 0);
    add(T, g, G.head, c, 0, .78, 0, id === 4 ? 1.25 : 1, id === 4 ? 1.1 : 1, 1);
    if (id === 1) { // Fuchs: spitze Ohren, helle Schnauze
      [-1, 1].forEach(k => add(T, g, G.cone, c, k * .15, 1.06, 0, 1, 1, 1, -k * .25));
      add(T, g, G.cone, 0xfff1e6, 0, .72, .27, .9, .8, .9, 0, Math.PI / 2); add(T, g, G.ball, B, 0, .72, .38);
      add(T, g, G.head, 0xfff1e6, 0, .3, .17, .7, .9, .5); eyes(.84, .22);
    } else if (id === 2) { // Mieze: Ohren, Schnurrhaare
      [-1, 1].forEach(k => add(T, g, G.cone, c, k * .16, 1.04, 0, .9, .8, .9, -k * .3));
      add(T, g, G.ball, 0xff7ab8, 0, .74, .28); [-1, 1].forEach(k => add(T, g, G.box, W, k * .18, .72, .25, .16, .012, .01));
      eyes(.84, .22);
    } else if (id === 4) { // Zorg: großer Kopf, Fühler, drei Augen
      [-1, 1].forEach(k => { const s = add(T, g, G.stick, c, k * .14, 1.12, 0, 1, 1.2, 1, -k * .4); s.position.x = k * .16; add(T, g, G.ball, 0xfde047, k * .21, 1.25, 0, 1.3); });
      [-.13, 0, .13].forEach(x => { add(T, g, G.eye, 0x0f172a, x, .82, .27, .9); add(T, g, G.ball, W, x + .02, .84, .33, .45); });
    } else if (id === 5) { // Hoppel: lange Ohren
      [-1, 1].forEach(k => { add(T, g, G.ear, c, k * .11, 1.18, 0, 1, 1, 1, -k * .15); add(T, g, G.ear, 0xffc2dd, k * .11, 1.18, .03, .55, .9, .4, -k * .15); });
      add(T, g, G.ball, 0xff7ab8, 0, .74, .28); eyes(.84, .22);
    } else if (id === 6) { // Quaki: Augen oben auf dem Kopf, breiter Mund
      [-1, 1].forEach(k => { add(T, g, G.head, c, k * .14, 1.0, .05, .42); add(T, g, G.eye, W, k * .14, 1.02, .14, 1); add(T, g, G.pup, B, k * .14, 1.02, .2); });
      add(T, g, G.box, 0x14532d, 0, .7, .26, .3, .03, .03);
    } else { // Krone: goldene Krone
      add(T, g, G.crown, 0xffd426, 0, 1.08, 0); [0, 1, 2, 3, 4].forEach(k => { const a = k / 5 * Math.PI * 2; add(T, g, G.ball, 0xffd426, Math.sin(a) * .19, 1.17, Math.cos(a) * .19, .9); });
      add(T, g, G.ball, 0x22d3ee, 0, 1.08, .2, .9); eyes(.82, .23);
    }
    [-1, 1].forEach(k => add(T, g, G.foot, c, k * .14, .03, .1, 1, .45, 1.2));
    return g;
  };
  // Kleine Vorschaubilder der Figuren (einmalig über ein Render-Ziel des vorhandenen Renderers, kein zweiter WebGL-Kontext)
  KR.figThumbs = function (renderer, T) {
    const S = 128, sc = new T.Scene(), cam = new T.PerspectiveCamera(30, 1, .1, 20), rt = new T.WebGLRenderTarget(S, S), buf = new Uint8Array(S * S * 4);
    sc.add(new T.HemisphereLight(0xffffff, 0x334155, 1.0)); const dl = new T.DirectionalLight(0xffffff, .7); dl.position.set(1, 2, 2); sc.add(dl);
    cam.position.set(0, .95, 2.75); cam.lookAt(0, .6, 0);
    const cv = document.createElement('canvas'); cv.width = cv.height = S; const x = cv.getContext('2d'), img = x.createImageData(S, S), out = [];
    const old = renderer.getClearColor(new T.Color()).getHex(), oldA = renderer.getClearAlpha();
    renderer.setClearColor(0x000000, 0);
    KR.FIGS.forEach((f, id) => {
      const g = KR.buildFig(T, id); g.rotation.y = -.35; sc.add(g);
      renderer.setRenderTarget(rt); renderer.clear(); renderer.render(sc, cam); renderer.readRenderTargetPixels(rt, 0, 0, S, S, buf);
      for (let r = 0; r < S; r++) img.data.set(buf.subarray((S - 1 - r) * S * 4, (S - r) * S * 4), r * S * 4);
      x.putImageData(img, 0, 0); out.push(cv.toDataURL()); sc.remove(g);
    });
    renderer.setRenderTarget(null); renderer.setClearColor(old, oldA); rt.dispose();
    return out;
  };
})(typeof window !== 'undefined' ? window : globalThis);
