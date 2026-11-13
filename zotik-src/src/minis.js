/* Kleine Insel-Modelle je Welt (angedeutet wie auf einer Weltkarte): Felssockel, Wiese in der Weltfarbe,
   ein paar Bäume/Häuser und das Wahrzeichen. Genutzt für die Sternenkarte im Menü und für die Seereise. */
export const ISLE = {
  1: { n: 'Lunaris', g: 0x5aa060, r: 0x6a6a7a, lf: 0x4ab870, h: [0xe8dcc0, 0x5a6ab8], lm: 'clock', c: 0x9ab8ff },
  2: { n: 'Elaris', g: 0x3aa050, r: 0x5a6a5a, lf: 0x4adf8a, h: [0xd8e8c0, 0x3a8a50], lm: 'bigtree', c: 0x6affaa },
  3: { n: 'Valdoria', g: 0x6a6a74, r: 0x5a5a6a, lf: 0x6ab070, h: [0xcbb8a0, 0xa04a3a], lm: 'skyline', c: 0xffc070 },
  4: { n: 'Solmera', g: 0xd9b36a, r: 0x9a6a3a, lf: 0x6ac060, h: [0xf0d8a8, 0x2a8a9a], lm: 'pyramid', c: 0xffd070, tree: 'palm' },
  5: { n: 'Aqualis', g: 0x2a8a9a, r: 0x3a6a8a, lf: 0x6ad8c0, h: [0xcfe8f0, 0x2a8aa8], lm: 'dome', c: 0x6ad8ff, tree: 'coral' },
  6: { n: 'Frosthain', g: 0xe8f0f8, r: 0x7a90a8, lf: 0x3a6a5a, h: [0xe8d8c0, 0x8a3a3a], lm: 'glacier', c: 0xbfe8ff, tree: 'pine' },
  7: { n: 'Ignara', g: 0x4a3a38, r: 0x3a2a28, lf: 0x5a4a40, h: [0x6a5a58, 0xa03a20], lm: 'volcano', c: 0xff6a2a, tree: 'dead' },
  8: { n: 'Noctaris', g: 0x3a3060, r: 0x4a4070, lf: 0x8a6ad8, h: [0x4a4068, 0x6a3a9a], lm: 'spire', c: 0xb08aff, tree: 'crystal' },
  9: { n: 'Astralis', g: 0x8a90d0, r: 0x7a80b8, lf: 0xc8c0ff, h: [0xe8e8f8, 0x6a70d8], lm: 'rings', c: 0xc8d0ff, tree: 'crystal' },
  10: { n: 'Elyndra', g: 0xd8c898, r: 0xa09070, lf: 0xf0e0a0, h: [0xf0e8d0, 0xc8a050], lm: 'core', c: 0xffe8a0, tree: 'crystal' },
  11: { n: 'Weltenriss', g: 0x4a3a6a, r: 0x2a2440, lf: 0x8a6ad8, h: [0x5a4a78, 0x3a2a5a], lm: 'rift', c: 0xff6ae8, tree: 'crystal' },
  13: { n: 'Camp', g: 0x4a8a50, r: 0x5a5a5a, lf: 0x3a8a4a, h: [0xd8c8a0, 0x8a4a2a], lm: 'camp', c: 0xffb060, tree: 'pine' },
  14: { n: 'Pixelpforte', g: 0x48b048, r: 0x8a6a48, lf: 0x38a038, h: [0xf0e0c0, 0xd04a3a], lm: 'pixel', c: 0x6aff6a },
  21: { n: 'Spiegelwald', g: 0x2a4a30, r: 0x3a3a48, lf: 0x2a6a3a, h: [0xd0c8e0, 0x6a3a8a], lm: 'mirror', c: 0xc070ff, tree: 'pine' },
  22: { n: 'Seeonee', g: 0x3a8a3a, r: 0x6a5a3a, lf: 0x3ab84a, h: [0xc8a878, 0x7a5a30], lm: 'jungle', c: 0xe8a040, tree: 'palm' },
  23: { n: 'Meerkönigreich', g: 0xe8d8a8, r: 0x3a6a8a, lf: 0xff8aa8, h: [0xf0e8f0, 0x6ad8ff], lm: 'shell', c: 0x6ad8ff, tree: 'coral' },
  24: { n: 'Notre-Dame', g: 0x6a7a5a, r: 0x6a6a72, lf: 0x5a8a4a, h: [0xd8ccb0, 0x4a5a6a], lm: 'cathedral', c: 0xffd070 },
  25: { n: 'Camelot', g: 0x4a9a4a, r: 0x6a6a6a, lf: 0x3a8a3a, h: [0xe0dcd0, 0x3a5ab8], lm: 'castle', c: 0x8ab8ff },
  26: { n: 'Theben', g: 0xc8b07a, r: 0x9a8060, lf: 0x6a9a4a, h: [0xf0ead8, 0xc85a3a], lm: 'temple', c: 0xffc060, tree: 'palm' },
  28: { n: 'Nimmerland', g: 0x4a8a3a, r: 0x7a7470, lf: 0x3ab84a, h: [0x3a2a1a, 0xf0ece4], lm: 'ship', c: 0x7ae8a0, tree: 'palm' },
  29: { n: 'Wunderland', g: 0x5aaa52, r: 0x8a7a9a, lf: 0xd84a8a, h: [0xf4f0e6, 0xd82a3a], lm: 'mush', c: 0xff7ab0 },
  30: { n: 'Marionettenland', g: 0x7a9a42, r: 0x8a7a5a, lf: 0x4a7a3a, h: [0xd8a060, 0xc83a2a], lm: 'puppet', c: 0xffb060, tree: 'pine' },
  27: { n: 'Große Mauer', g: 0x6a8a4a, r: 0x7a6a5a, lf: 0x4a7a3a, h: [0xc8b8a0, 0xc83a2a], lm: 'wall', c: 0xff6a4a, tree: 'pine' },
};

export function createMinis(C) {
  const { T, M, mk, G, glow } = C;
  const add = (g, geo, mat, x, y, z, sx, sy, sz, rx, ry, rz) => { const m = mk(geo, mat, x, y, z, sx, sy, sz, false); if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0); g.add(m); return m; };
  const em = (c, i) => M(c, { e: c, ei: i ?? 1.4, r: .3 });
  const tree = (g, d, x, z, s) => {
    const k = d.tree || 'broad', lf = M(d.lf, { r: .8 });
    if (k === 'pine') { add(g, G.cyl0, M(0x5a3a22), x, .12 * s, z, .04 * s, .24 * s, .04 * s); add(g, G.cone, lf, x, .38 * s, z, .17 * s, .42 * s, .17 * s); add(g, G.cone, lf, x, .58 * s, z, .12 * s, .3 * s, .12 * s); }
    else if (k === 'palm') { add(g, G.cyl0, M(0x8a6a40), x, .28 * s, z, .035 * s, .56 * s, .035 * s, 0, 0, .15); for (let i = 0; i < 5; i++) add(g, G.sph0, lf, x + Math.cos(i * 1.26) * .13 * s + .04 * s, .56 * s, z + Math.sin(i * 1.26) * .13 * s, .16 * s, .03 * s, .06 * s, 0, -i * 1.26, -.3); }
    else if (k === 'crystal') { add(g, G.oct, em(d.lf, 1.1), x, .24 * s, z, .1 * s, .26 * s, .1 * s); }
    else if (k === 'coral') { for (let i = 0; i < 3; i++) add(g, G.cyl0, em(d.lf, .5), x + (i - 1) * .05 * s, .16 * s, z, .03 * s, (.22 + i * .06) * s, .03 * s, 0, 0, (i - 1) * .4); }
    else if (k === 'dead') { add(g, G.cyl0, M(0x2a2220), x, .2 * s, z, .035 * s, .4 * s, .035 * s); add(g, G.cyl0, M(0x2a2220), x + .06 * s, .32 * s, z, .02 * s, .18 * s, .02 * s, 0, 0, -.8); }
    else { add(g, G.cyl0, M(0x5a3a22), x, .14 * s, z, .045 * s, .28 * s, .045 * s); add(g, G.sph, lf, x, .38 * s, z, .2 * s, .18 * s, .2 * s); add(g, G.sph, lf, x + .08 * s, .46 * s, z - .04 * s, .13 * s, .12 * s, .13 * s); }
  };
  const house = (g, d, x, z, ry) => { const w = M(d.h[0], { r: .7 }), r = M(d.h[1], { r: .6 }); const h = new T.Group(); h.position.set(x, 0, z); h.rotation.y = ry || 0; add(h, G.box, w, 0, .1, 0, .2, .2, .18); add(h, G.cone0, r, 0, .27, 0, .17, .16, .17, 0, Math.PI / 4, 0); g.add(h); };
  const LM = {
    clock(g, d) { add(g, G.cyl, M(d.h[0]), 0, .45, 0, .14, .9, .14); add(g, G.cone, M(d.h[1]), 0, 1.02, 0, .17, .26, .17); add(g, G.cyl, em(0xfff0c0, 1.6), 0, .72, .13, .1, .02, .1, Math.PI / 2, 0, 0); add(g, G.sph0, em(0xbfd8ff, 2), .3, 1.2, 0, .1, .1, .1); },
    bigtree(g, d) { add(g, G.cyl, M(0x5a4030), 0, .45, 0, .14, .9, .14); for (let i = 0; i < 4; i++) add(g, G.sph, M(d.lf), Math.cos(i * 1.6) * .22, 1.0 + (i % 2) * .12, Math.sin(i * 1.6) * .22, .32, .26, .32); add(g, G.sph0, em(0x9affc8, 1.4), 0, 1.15, .25, .06, .06, .06); },
    skyline(g, d) { [[0, .9, .14], [-.25, .6, .12], [.24, .7, .11], [.1, .45, .1]].forEach(([x, h, w], i) => { add(g, G.box, M(d.h[0]), x, h / 2, i ? -.1 : 0, w * 2, h, w * 2); add(g, G.cone0, M(d.h[1]), x, h + .08, i ? -.1 : 0, w * 1.3, .18, w * 1.3, 0, Math.PI / 4, 0); }); add(g, G.sph0, em(0xffd070, 2), 0, 1.05, 0, .05, .05, .05); },
    pyramid(g, d) { add(g, G.cone0, M(0xe8c888, { r: .9 }), 0, .4, 0, .62, .8, .62, 0, Math.PI / 4, 0); add(g, G.sph0, em(0xffe08a, 2), 0, .84, 0, .06, .06, .06); },
    dome(g, d) { add(g, G.cyl, M(d.h[0]), 0, .1, 0, .45, .2, .45); add(g, G.sph, M(0x8ae8ff, { t: .55, e: 0x3a8aa8, ei: .6, r: .1 }), 0, .2, 0, .42, .42, .42); add(g, G.cyl, M(d.h[1]), 0, .45, 0, .05, .5, .05); },
    glacier(g) { for (let i = 0; i < 5; i++) add(g, G.cone0, M(0xcfeaff, { e: 0x6aa8d8, ei: .35, r: .2 }), (i - 2) * .16, .35 + (i % 2) * .2, (i % 3 - 1) * .1, .12, .7 + (i % 2) * .4, .12, 0, i, (i - 2) * .08); },
    volcano(g) { add(g, G.cone, M(0x3a2a28, { r: .9 }), 0, .45, 0, .6, .9, .6); add(g, G.cyl0, em(0xff5a10, 2.2), 0, .86, 0, .14, .04, .14); g.add(glow(0xff6a2a, .9, 0, .95, 0, .7)); },
    spire(g, d) { add(g, G.cone0, M(d.h[0], { m: .4 }), 0, .6, 0, .14, 1.2, .14); add(g, G.cyl0, M(d.h[1]), 0, .35, 0, .22, .1, .22); add(g, G.sph0, em(0xe8d8ff, 2), .22, 1.15, 0, .08, .08, .08); },
    rings(g, d) { add(g, G.cyl, M(d.h[0]), 0, .3, 0, .08, .6, .08); for (let i = 0; i < 2; i++) add(g, G.tor, em(0xc8d0ff, 1.2), 0, .8, 0, .32 - i * .1, .32 - i * .1, .32, Math.PI / 2 + i * .7, i, 0); add(g, G.sph0, em(0xffffff, 2), 0, .8, 0, .07, .07, .07); },
    core(g) { add(g, G.oct, em(0xffe8a0, 1.6), 0, .65, 0, .22, .42, .22); add(g, G.tor, M(0xc8a050, { m: .8, r: .3 }), 0, .65, 0, .3, .3, .3, Math.PI / 2, 0, 0); g.add(glow(0xffe8a0, 1, 0, .65, 0, .6)); },
    rift(g) { for (let i = 0; i < 3; i++) add(g, G.oct, em(i ? 0x8a6ad8 : 0xff6ae8, 1.5), (i - 1) * .2, .5 + (i === 1 ? .2 : 0), 0, .1, .4, .06, 0, 0, (i - 1) * .3); g.add(glow(0xff6ae8, .9, 0, .6, 0, .55)); },
    camp(g) { add(g, G.cone0, M(0xd8c8a0, { r: .8 }), -.12, .2, 0, .26, .4, .26, 0, Math.PI / 4, 0); add(g, G.cone0, em(0xff8a2a, 2), .24, .1, .1, .06, .16, .06); g.add(glow(0xffa040, .6, .24, .16, .1, .7)); },
    pixel(g) { const c = [0xd04a3a, 0x48b048, 0x3a6ad8, 0xf0c040]; for (let i = 0; i < 7; i++) add(g, G.box, M(c[i % 4], { r: .6 }), ((i * 37) % 5 - 2) * .1, .08 + Math.floor(i / 3) * .16, ((i * 53) % 3 - 1) * .12, .15, .15, .15); },
    mirror(g, d) { add(g, G.box, M(d.h[0]), 0, .35, 0, .4, .7, .3); for (const s of [-1, 1]) { add(g, G.cyl, M(d.h[0]), s * .24, .45, 0, .08, .9, .08); add(g, G.cone0, M(d.h[1]), s * .24, .98, 0, .1, .22, .1); } add(g, G.sph0, M(0xd8e8ff, { m: 1, r: .05 }), 0, .5, .16, .09, .13, .02); },
    jungle(g, d) { for (let i = 0; i < 4; i++) tree(g, Object.assign({}, d, { tree: 'palm' }), (i - 1.5) * .18, (i % 2) * .15 - .05, 1.6); add(g, G.cone0, M(0x7a6a50), .25, .25, -.15, .18, .5, .18); },
    shell(g) { add(g, G.sph, M(0xffd8e8, { r: .4 }), 0, .25, 0, .4, .3, .35); for (let i = 0; i < 5; i++) add(g, G.box, M(0xffb8c8), (i - 2) * .12, .3, .05, .03, .5, .4, 0, 0, (i - 2) * .3); add(g, G.sph0, M(0xffffff, { m: .6, r: .1 }), 0, .2, .3, .07, .07, .07); },
    cathedral(g, d) { add(g, G.box, M(d.h[0]), 0, .3, 0, .5, .6, .3); for (const s of [-1, 1]) add(g, G.box, M(d.h[0]), s * .2, .55, .1, .14, 1.1, .14); add(g, G.cone0, M(d.h[1]), 0, .75, -.05, .1, .5, .1); add(g, G.cyl, em(0xffd070, 1), 0, .5, .16, .09, .02, .09, Math.PI / 2, 0, 0); },
    castle(g, d) { add(g, G.box, M(d.h[0]), 0, .25, 0, .55, .5, .4); for (const [x, z] of [[-.28, -.2], [.28, -.2], [-.28, .2], [.28, .2]]) { add(g, G.cyl, M(d.h[0]), x, .35, z, .09, .7, .09); add(g, G.cone0, M(d.h[1]), x, .8, z, .12, .22, .12); } add(g, G.cyl, M(d.h[0]), 0, .55, 0, .12, 1.1, .12); add(g, G.cone0, M(d.h[1]), 0, 1.2, 0, .15, .3, .15); },
    temple(g, d) { add(g, G.box, M(d.h[0]), 0, .05, 0, .7, .1, .45); for (let i = 0; i < 5; i++) for (const z of [-.16, .16]) add(g, G.cyl0, M(d.h[0]), (i - 2) * .15, .3, z, .035, .45, .035); add(g, G.cone0, M(d.h[1]), 0, .62, 0, .5, .2, .3, 0, Math.PI / 4, 0); },
    ship(g, d) { add(g, G.box, M(d.h[0]), 0, .14, 0, .3, .2, .8); add(g, G.cyl, M(d.h[0]), 0, .55, .05, .025, .8, .025); add(g, G.box, M(d.h[1]), 0, .62, .05, .32, .36, .02); add(g, G.box, M(0x0a0a0a), 0, .98, .05, .1, .07, .01); },
    mush(g, d) { add(g, G.cyl, M(0xf0e8d8), 0, .3, 0, .1, .6, .1); add(g, G.sph, M(d.h[1]), 0, .62, 0, .36, .16, .36); for (let i = 0; i < 4; i++) add(g, G.sph0, M(d.h[0]), Math.cos(i * 1.6) * .2, .72, Math.sin(i * 1.6) * .2, .05, .03, .05); add(g, G.box, M(d.h[0]), .4, .2, .1, .18, .26, .02, 0, .4, .1); },
    puppet(g, d) { add(g, G.cyl, M(d.h[1]), 0, .32, 0, .14, .3, .1); add(g, G.sph, M(d.h[0]), 0, .6, 0, .13, .14, .13); add(g, G.cone0, M(d.h[0]), 0, .6, .2, .025, .22, .025, 1.5708, 0, 0); add(g, G.cone0, M(0x3a8a3a), 0, .8, 0, .11, .2, .11); for (const x of [-.06, .06]) add(g, G.cyl0, M(d.h[0]), x, .1, 0, .025, .2, .025); },
    wall(g, d) { add(g, G.box, M(d.h[0]), 0, .18, 0, 1.1, .3, .14, 0, .3, 0); for (const x of [-.45, .45]) { add(g, G.box, M(d.h[0]), x, .3, x * .3, .22, .55, .22); add(g, G.cone0, M(d.h[1]), x, .66, x * .3, .2, .18, .2, 0, Math.PI / 4, 0); } add(g, G.sph0, em(0xff6a4a, 1.5), .45, .48, .25, .05, .07, .05); },
  };
  /** Insel-Modell (Durchmesser ca. 2, Wiese bei y=0). */
  function island(n, o) {
    const d = ISLE[n] || ISLE[1], g = new T.Group(), rk = M(d.r, { r: .95 });
    add(g, G.cone, rk, 0, -.55, 0, 1, 1.1, 1, Math.PI, 0, 0);
    add(g, G.ico || G.sph, rk, .25, -.6, .15, .5, .5, .45);
    add(g, G.cyl, M(d.g, { r: .9 }), 0, -.04, 0, 1.02, .1, 1.02);
    add(g, G.cyl, M(d.g, { r: .9 }), .3, .02, -.2, .55, .08, .5);
    if (!(o && o.bare)) {
      (LM[d.lm] || LM.clock)(g, d);
      tree(g, d, -.62, .35, 1); tree(g, d, .6, .45, .9); tree(g, d, -.3, -.62, .85);
      if (!/pixel|camp|glacier|volcano/.test(d.lm)) { house(g, d, .5, -.25, .4); house(g, d, -.55, -.15, -.3); }
    }
    g.userData.col = d.c; return g;
  }
  /* Vorschaubilder wie bei den Waffen */
  const TH = {}; let ts = null;
  function thumb(renderer, n) {
    if (TH[n]) return TH[n];
    try {
      const W = 200;
      if (!ts) { const sc = new T.Scene(), cam = new T.PerspectiveCamera(32, 1, .1, 30); sc.add(new T.HemisphereLight(0xdfe8ff, 0x3a3050, .9)); const l = new T.DirectionalLight(0xfff2e0, 1.2); l.position.set(2, 4, 3); sc.add(l); cam.position.set(0, 2.1, 3.9); cam.lookAt(0, .1, 0); ts = { sc, cam, rt: new T.WebGLRenderTarget(W, W), px: new Uint8Array(W * W * 4) }; }
      const g = island(n); g.rotation.y = .5; ts.sc.add(g);
      const prev = renderer.getRenderTarget(), pc = renderer.getClearColor(new T.Color()).getHex(), pa = renderer.getClearAlpha();
      renderer.setRenderTarget(ts.rt); renderer.setClearColor(0, 0); renderer.clear(); renderer.render(ts.sc, ts.cam);
      renderer.readRenderTargetPixels(ts.rt, 0, 0, W, W, ts.px); renderer.setRenderTarget(prev); renderer.setClearColor(pc, pa); ts.sc.remove(g);
      const c = document.createElement('canvas'); c.width = c.height = W; const x = c.getContext('2d'), im = x.createImageData(W, W);
      for (let y = 0; y < W; y++) im.data.set(ts.px.subarray((W - 1 - y) * W * 4, (W - y) * W * 4), y * W * 4);
      x.putImageData(im, 0, 0); return (TH[n] = c.toDataURL());
    } catch (e) { return ''; }
  }
  return { island, thumb, ISLE };
}
