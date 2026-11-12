/* Waffenmodelle je Ausrüstung: jede Klinge hat eigene Form, Farbe und Leuchten.
   Griff liegt bei y≈0–0.17, die Klinge zeigt nach +y (gleiche Lage wie das alte Standardschwert). */
export function createWeapons(C) {
  const { T, M, mk, G, glow } = C;
  const add = (g, geo, mat, x, y, z, sx, sy, sz, rx, ry, rz) => { const m = mk(geo, mat, x, y, z, sx, sy, sz, false); if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0); g.add(m); return m; };
  const metal = c => M(c, { m: .85, r: .26 }), gem = (c, e, ei) => M(c, { e: e ?? c, ei: ei ?? 2, r: .2 });
  const grip = (g, wood, guard, gc, w) => {
    add(g, G.cyl0, M(wood, { r: .6 }), 0, .08, 0, .032, .17, .032);
    add(g, G.sph0, metal(guard), 0, -.01, 0, .04, .035, .04);
    add(g, G.box, metal(guard), 0, .17, 0, w ?? .22, .04, .06);
    if (gc != null) add(g, G.oct, gem(gc), 0, .17, .035, .045, .06, .03);
  };
  const B = {
    /* Standard-Übungsklinge */
    base(g) {
      grip(g, 0x4a2e1c, 0xb98a4a, 0x3a8cff);
      add(g, G.box, metal(0xaab6c8), 0, .52, 0, .08, .7, .024);
      add(g, G.cone0, metal(0xaab6c8), 0, .93, 0, .058, .14, .02);
      add(g, G.box, M(0x5ab0ff, { e: 0x3a9cff, ei: 1.4 }), 0, .52, .013, .022, .62, .01);
    },
    /* Mondsichel: gebogene, silberblaue Klinge mit Mondstein */
    w_mond(g) {
      grip(g, 0x2c3350, 0xc8d4ea, 0x9fd0ff, .2);
      const arc = new T.TorusGeometry(.5, .045, 6, 22, Math.PI * .62);
      const bl = new T.Mesh(arc, metal(0xd7e3f6)); bl.scale.set(1, 1, .45); bl.rotation.z = -.15; bl.position.set(-.48, .2, 0); g.add(bl);
      const ed = new T.Mesh(new T.TorusGeometry(.5, .012, 4, 22, Math.PI * .62), M(0xbfe6ff, { e: 0x9fd6ff, ei: 2 })); ed.rotation.z = -.15; ed.position.set(-.44, .2, .012); g.add(ed);
      add(g, G.sph0, gem(0xe8f2ff, 0xa8d4ff, 1.6), 0, .2, 0, .05, .05, .03);
    },
    /* Dornenschwert: grünes Holz mit Ranken und Dornen */
    w_dorn(g) {
      grip(g, 0x3a2a16, 0x5a7a2a, 0x7cff6a, .18);
      add(g, G.cyl0, M(0x4a6e2a, { r: .7 }), 0, .55, 0, .045, .76, .03);
      add(g, G.cone0, M(0x5f8a34, { r: .7 }), 0, 1.0, 0, .045, .16, .03);
      for (let i = 0; i < 7; i++) { const y = .26 + i * .1, s = i % 2 ? 1 : -1; add(g, G.cone0, M(0x9ac860, { r: .6 }), s * .05, y, 0, .018, .09, .018, 0, 0, -s * 1.2); }
      for (let i = 0; i < 4; i++) add(g, G.tor, M(0x2f5a1c, { r: .7 }), 0, .3 + i * .17, 0, .055, .055, .055, Math.PI / 2 + .4, 0, i * .7);
      add(g, G.sph0, M(0xff7aa8, { e: 0xff4a8a, ei: .8 }), .05, .62, .02, .03, .03, .03);
    },
    /* Glutklinge: breite Klinge mit glühendem Kern und Flammenspitze */
    w_glut(g) {
      grip(g, 0x2a1410, 0x6a2a18, 0xff7a2a, .26);
      add(g, G.box, metal(0x3a2420), 0, .52, 0, .12, .7, .03);
      add(g, G.box, M(0xff8a3a, { e: 0xff4a10, ei: 1.3 }), 0, .52, .016, .05, .64, .01);
      add(g, G.cone0, M(0xff9a40, { e: 0xff5a10, ei: 1.1 }), 0, .96, 0, .07, .2, .03);
      for (const s of [-1, 1]) add(g, G.cone0, M(0xffb050, { e: 0xff7a20, ei: 2 }), s * .06, .8, 0, .025, .12, .02, 0, 0, -s * .5);
      g.add(glow(0xff7a2a, .5, 0, .7, 0, .5));
    },
    /* Sternenklinge: nachtblaue Klinge mit Sternfunken und goldenem Sternenschutz */
    w_stern(g) {
      grip(g, 0x1a1e3a, 0xe8c25a, null, .1);
      add(g, G.oct, metal(0xf0cc60), 0, .17, 0, .13, .13, .04);
      add(g, G.box, M(0x1c2a6a, { m: .6, r: .3 }), 0, .56, 0, .085, .74, .024);
      add(g, G.cone0, M(0x1c2a6a, { m: .6, r: .3 }), 0, 1.0, 0, .06, .16, .02);
      for (let i = 0; i < 6; i++) add(g, G.oct, gem(0xfff2b0, 0xffe27a, 2.4), (i % 2 ? .018 : -.018), .3 + i * .11, .016, .014, .014, .006);
      add(g, G.oct, gem(0xfff2b0, 0xffe27a, 2.8), 0, 1.1, 0, .05, .05, .02);
      g.add(glow(0xffe27a, .35, 0, 1.1, 0, .55));
    },
    /* Erzählerklinge: elfenbeinfarbene Federklinge mit goldenen Seitenringen */
    w_maer(g) {
      grip(g, 0x5a3a6a, 0xe6c46a, 0xc89aff, .2);
      const f = add(g, G.sph, M(0xf4ecd8, { r: .5 }), 0, .6, 0, .07, .45, .018);
      add(g, G.box, metal(0xe6c46a), 0, .6, .01, .012, .82, .01);
      for (let i = 0; i < 3; i++) add(g, G.tor, metal(0xe6c46a), 0, .36 + i * .2, 0, .06 - i * .012, .06 - i * .012, .06, Math.PI / 2, 0, 0);
      add(g, G.sph0, gem(0xd8b4ff, 0xb07aff, 1.8), 0, 1.04, 0, .03, .03, .03);
      f.rotation.z = .04;
    },
    /* Uralte Klinge: breiter Bronze-Stein mit türkisen Runen */
    w_ur(g) {
      grip(g, 0x2a2420, 0x8a6a3a, 0x3affd8, .28);
      add(g, G.box, M(0x6a6058, { r: .85 }), 0, .55, 0, .14, .76, .04);
      add(g, G.cone0, M(0x6a6058, { r: .85 }), 0, .99, 0, .1, .14, .04);
      for (let i = 0; i < 5; i++) add(g, G.box, M(0x5affe0, { e: 0x2affd0, ei: 2.2 }), (i % 2 ? .025 : -.025), .3 + i * .13, .021, .03, .05, .005);
      add(g, G.box, metal(0xb08a4a), 0, .2, 0, .17, .03, .05);
    },
    /* Splitterschlüssel: Kristall-Schlüsselklinge. Ringschutz um den Griff, Schaft aus Mondsilber,
       Schlüsselbart aus Kernsplittern, am Knauf eine Kette mit Sternkristall. */
    w_schl(g) {
      add(g, G.cyl0, M(0x2a2140, { r: .6 }), 0, .08, 0, .034, .17, .034);
      const ring = M(0xf2d27a, { m: .9, r: .22 });
      add(g, G.tor, ring, 0, .08, 0, .11, .13, .11, 0, Math.PI / 2, 0);
      add(g, G.box, ring, 0, .18, 0, .2, .035, .05);
      add(g, G.oct, gem(0x8ad8ff, 0x5ac0ff, 2.4), 0, .19, .03, .04, .055, .025);
      add(g, G.cyl0, metal(0xdfe8f6), 0, .56, 0, .035, .76, .035);
      add(g, G.box, M(0x9fe0ff, { e: 0x6ac8ff, ei: 1.6 }), 0, .56, .03, .01, .7, .008);
      /* Schlüsselbart aus Kristallen */
      const cr = gem(0x6ac8ff, 0x2a90ff, 1.1), cv = gem(0xa880ff, 0x7a4aff, 1.1);
      add(g, G.box, metal(0xdfe8f6), .07, .9, 0, .14, .05, .04);
      add(g, G.oct, cr, .15, .93, 0, .05, .08, .03);
      add(g, G.oct, cv, .1, .82, 0, .04, .06, .025, 0, 0, .4);
      add(g, G.box, metal(0xdfe8f6), .05, .78, 0, .1, .035, .035);
      add(g, G.oct, cr, .12, .74, 0, .035, .05, .02);
      add(g, G.oct, gem(0x9ad8ff, 0x4aa8ff, 1.2), 0, .99, 0, .045, .09, .03);
      g.add(glow(0x7ad0ff, .45, .08, .88, 0, .55));
      /* Kettenanhänger */
      for (let i = 0; i < 3; i++) add(g, G.tor, metal(0xc8d0dc), 0, -.05 - i * .045, 0, .018, .018, .018, i % 2 ? 0 : Math.PI / 2, 0, 0);
      add(g, G.oct, gem(0xffd860, 0xffb020, 1.1), 0, -.2, 0, .035, .045, .015);
    },
  };
  const make = id => { const g = new T.Group(); (B[id] || B.base)(g); g.userData.wid = id || ''; return g; };
  /** Gruppe in-place neu bestücken (Lage und Sichtbarkeit bleiben). */
  const swap = (grp, id) => { if (!grp || grp.userData.wid === (id || '')) return; for (const c of [...grp.children]) grp.remove(c); const n = make(id); for (const c of [...n.children]) grp.add(c); grp.userData.wid = id || ''; };
  /* Vorschaubilder: einmal je Waffe mit dem Hauptrenderer in ein kleines Ziel gerendert, als Bild-URL gemerkt */
  const TH = {}; let ts = null;
  const thumb = (renderer, id) => {
    if (TH[id]) return TH[id];
    try {
      const W = 256;
      if (!ts) {
        const sc = new T.Scene(), cam = new T.PerspectiveCamera(30, 1, .1, 20);
        sc.add(new T.AmbientLight(0xffffff, .7)); const d = new T.DirectionalLight(0xffffff, 1.3); d.position.set(1.5, 2, 3); sc.add(d);
        const r2 = new T.DirectionalLight(0x9ab8ff, .6); r2.position.set(-2, -1, 1); sc.add(r2);
        cam.position.set(0, 0, 2.35); cam.lookAt(0, 0, 0);
        ts = { sc, cam, rt: new T.WebGLRenderTarget(W, W), px: new Uint8Array(W * W * 4) };
      }
      const w = new T.Group(), m = make(id); m.position.y = id === 'w_mond' ? -.42 : -.5; if (id === 'w_mond') m.position.x = .22; w.add(m); w.rotation.set(.25, .35, -.78); ts.sc.add(w);
      const prev = renderer.getRenderTarget(), pc = renderer.getClearColor(new T.Color()).getHex(), pa = renderer.getClearAlpha();
      renderer.setRenderTarget(ts.rt); renderer.setClearColor(0, 0); renderer.clear(); renderer.render(ts.sc, ts.cam);
      renderer.readRenderTargetPixels(ts.rt, 0, 0, W, W, ts.px); renderer.setRenderTarget(prev); renderer.setClearColor(pc, pa);
      ts.sc.remove(w);
      const c = document.createElement('canvas'); c.width = c.height = W; const x = c.getContext('2d'), im = x.createImageData(W, W);
      for (let y = 0; y < W; y++) im.data.set(ts.px.subarray((W - 1 - y) * W * 4, (W - y) * W * 4), y * W * 4);
      x.putImageData(im, 0, 0); return (TH[id] = c.toDataURL());
    } catch (e) { return ''; }
  };
  return { make, swap, thumb, B };
}
