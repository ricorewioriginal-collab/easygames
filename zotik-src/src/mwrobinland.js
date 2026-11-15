// Sherwood und Nottingham (Welt 34) – anders aufgebaut als die übrigen Welten:
// ein Wald-Süden mit hohler Versammlungseiche und Lager, ein Bach als Grenze (Furt mit Baumstamm), nördlich davon die ummauerte Stadt
// (Tor, Markt, begehbare Häuser, Wirtshaus) und dahinter die Burg mit Burghof und Käfig.
export function robinLand({ T, G, M, mk }, kit) {
  return function robinhood(b, w, A) {
    const K = kit(b), STONE = 0xb8b0a0, TIM = 0x8a6a3a, ROOF = 0x6a3a22, PLA = 0xd8c8a0, BARK = 0x5a4028;
    b.tmap = { 0xb8b0a0: 'stone', 0x8a6a3a: 'wood', 0x5a4028: 'wood', 0xd8c8a0: 'plaster', 0x4a3a2a: 'wood' };
    const sign = (x, y, z, sw, sh, txt, bg, fg, ry) => { const cv = document.createElement('canvas'); cv.width = 384; cv.height = Math.round(384 * sh / sw); const c = cv.getContext('2d');
      c.fillStyle = bg; c.fillRect(0, 0, cv.width, cv.height); c.strokeStyle = fg; c.lineWidth = 6; c.strokeRect(5, 5, cv.width - 10, cv.height - 10); c.fillStyle = fg; c.font = '700 ' + Math.round(cv.height * .42) + 'px serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, cv.width / 2, cv.height / 2 + 2);
      const m = new T.Mesh(new T.PlaneGeometry(sw, sh), new T.MeshBasicMaterial({ map: new T.CanvasTexture(cv), toneMapped: false })); m.position.set(x, y, z); m.rotation.y = ry || 0; b.g.add(m); return m; };

    // ===== Süden: der Wald =====
    // Die Versammlungseiche: begehbarer hohler Stamm, mächtige Krone, Wurzeln
    K.tower(16, -34, 3.4, 8, BARK, null, 0, { tex: 'bark' });
    for (const [dx, dz, r, h, y] of [[0, 0, 11, 5, 11.5], [6, 3, 7, 4, 10.5], [-6, -2, 8, 4.4, 11], [2, -6, 7, 4, 12], [-3, 6, 6, 3.6, 10]]) b.ico(16 + dx, y, -34 + dz, r, h, r, [0x2a6a22, 0x3a7a2a, 0x2a5a22, 0x4a8a30, 0x356e28][(dx + dz + 20) % 5], { cast: false });
    for (let i = 0; i < 7; i++) { const a = i * .9, r = b.cone(16 + Math.cos(a) * 3.6, 0, -34 + Math.sin(a) * 3.6, 1.1, 2.4, BARK, { lo: 1 }); r.rotation.set(Math.sin(a) * 1.1, 0, -Math.cos(a) * 1.1); }
    for (let i = 0; i < 4; i++) { const a = i * 1.57 + .5, br = b.cyl(16 + Math.cos(a) * 3, 7.6, -34 + Math.sin(a) * 3, .38, 4.2, BARK, { lo: 1 }); br.rotation.set(Math.sin(a) * .9, 0, -Math.cos(a) * .9); }
    b.box(25.5, 0, -34, 5.2, .9, 1.3, TIM, { solid: 1, tex: 'wood' }); for (const z of [-36, -32]) for (const x of [24, 27]) b.box(x, 0, z, .8, .5, .5, TIM, { solid: 1 });   // Tafel der Bande
    for (const [x, z] of [[22, -39], [30, -37]]) K.lamp(x, z, 0xb8ff90); b.glow(0xb8ff90, 6, 16, 5, -34, 2);
    // Lager der Gesetzlosen: Zelte, Lagerfeuer mit Topf, Vorratsfässer, Wäscheleine
    K.tent(-48, -29, 2.6, 3, 0x5a7a3a, { flag: 0xc83a2a }); K.tent(-33, -31, 2.4, 2.8, 0x7a5a3a, { flag: 0x3a7a2a }); K.tent(-48, -17, 2.5, 2.9, 0x4a6a4a, { flag: 0xd8b030 }); K.tent(-32, -15, 2.2, 2.6, 0x6a5a3a, { flag: 0x3a5aa8 });
    for (let i = 0; i < 6; i++) b.cyl(-40 + Math.cos(i * 1.05) * 1.5, 0, -23 + Math.sin(i * 1.05) * 1.5, .3, .4, 0x5a5a5e, { lo: 1 }); b.glow(0xff8a30, 6, -40, 1, -23, 1); A.fire(-40, -23, 1);
    for (const s of [-1, 1]) b.cyl(-40 + s * 1.5, 0, -23, .05, 2.2, 0x3a2a1a, { lo: 1 }); b.cyl(-40, 2.2, -23, .04, 3, 0x3a2a1a, { lo: 1 }).rotation.z = Math.PI / 2; b.sph(-40, 1.6, -23, .5, .4, .5, 0x2a2a2e, { mat: { m: .8, r: .4 } });
    for (const [x, z] of [[-36, -28], [-44, -25], [-36, -19]]) b.cyl(x, 0, z, .45, 1, 0x6a4a2a, { tex: 'wood' }); b.box(-40, 1.5, -13, 7, .03, .03, 0xe8e0d0, { cast: false }); for (let i = 0; i < 4; i++) b.box(-42.6 + i * 1.7, 1, -13, .7, .8, .03, [0xc83a2a, 0xf4f0e0, 0x3a6a3a, 0xd8b030][i], { cast: false });
    // Das Dornendickicht: wuchernde Heckenwälle, Dornenranken, ein altes Jägerhaus mittendrin
    for (let i = 0; i < 14; i++) { const a = i * .45, r = 8 + (i % 3) * 2.6, x = -62 + Math.cos(a) * r, z = -50 + Math.sin(a) * r; b.ico(x, 1.3, z, 2.2, 1.6, 2.2, [0x2a5a1e, 0x1e4a18, 0x365e22][i % 3], { solid: i % 2 === 0 }); for (let k = 0; k < 4; k++) { const t = b.cone(x + Math.cos(k * 1.6) * 1.6, 2.2, z + Math.sin(k * 1.6) * 1.6, .1, .9, 0xe0d8a8, { lo: 1 }); t.rotation.set(Math.sin(k) * .9, 0, Math.cos(k) * .9); } }
    K.house(-68, -48, 6, 4.8, 3, 0x6a5a3a, 0x3a3a2a, .5, { beams: 0x3a2a1a, dark: 1 }); b.glow(0x80ff40, 4, -62, 2, -50, 1.4); A.mist(-62, -50, 9);
    // Bruder Tucks Teich: Kapelle am Wasser, Steg, Fass
    K.house(50, -12, 7, 5.5, 3.6, 0xd8d0b8, 0x4a4a5a, 3.1, { beams: 0x5a4a3a }); K.tower(55.5, -10, 1.3, 7, 0xd8d0b8, 0x6a3a22, 2.8); b.box(52, 0, -9.6, .1, 2.4, .1, 0xd8b030, { lo: 1 });
    b.box(56, .1, -20, 1.4, .12, 7, TIM, { tex: 'wood' }); for (let i = 0; i < 4; i++) b.cyl(55.3 + (i % 2) * 1.4, -.2, -17.5 - Math.floor(i / 2) * 3, .12, 1, 0x4a3a2a, { lo: 1 });
    b.cyl(46, 0, -8, .55, 1.1, 0x7a5a2a, { solid: 1, tex: 'wood' }); b.cyl(46.9, 0, -9, .5, 1, 0x7a5a2a, { solid: 1, tex: 'wood' });
    // Der Bach: Furt mit dem berühmten Baumstamm, Little Johns Stock steckt im Ufer
    { const t = b.cyl(0, .5, -58, .7, 9, 0x6a4a2a, { tex: 'bark', lo: 1 }); t.rotation.x = Math.PI / 2; t.position.y = .5; }
    b.cyl(-4.2, 0, -54.5, .07, 2.4, 0x5a4020, { lo: 1 }); b.cyl(6, 0, -62, .07, 2.6, 0x5a4020, { lo: 1 });
    // ===== Norden: Nottingham =====
    const WH = 6.4, TH = 2;
    K.wall(-40, -70, -4, -70, WH, TH, STONE, { cren: 1, walk: 1 }); K.wall(4, -70, 40, -70, WH, TH, STONE, { cren: 1, walk: 1 });
    K.wall(-40, -96, -4, -96, WH, TH, STONE, { cren: 1, walk: 1 }); K.wall(4, -96, 40, -96, WH, TH, STONE, { cren: 1, walk: 1 }); K.arch(0, -96, 6.4, 5, STONE, 0, .8); K.wall(-40, -70, -40, -96, WH, TH, STONE, { cren: 1, walk: 1 }); K.wall(40, -70, 40, -96, WH, TH, STONE, { cren: 1, walk: 1 });
    for (const [x, z] of [[-40, -70], [40, -70], [-40, -96], [40, -96]]) K.tower(x, z, 2.5, 10, STONE, ROOF, 3.4, { crown: 0 });
    for (const x of [-4, 4]) K.tower(x, -70, 1.7, 9, STONE, ROOF, 3);   // Torturm
    K.arch(0, -70, 6.4, 5.2, STONE, 0, .8); b.box(0, 5.2, -70, 8.2, .9, 1.4, STONE, { solid: 1 }); sign(0, 6.6, -69.2, 4.6, 1, 'NOTTINGHAM', '#3a2a1a', '#e8d098', 0); sign(0, 6.6, -70.8, 4.6, 1, 'Willkommen in Nottingham', '#3a2a1a', '#e8d098', Math.PI);
    for (let i = 0; i < 2; i++) { const bn = b.box(-2.6 + i * 5.2, 6.4, -69.1, .9, 2.6, .04, i ? 0x2a5a8a : 0xc83a2a, { cast: false }); A.sway(bn, i); }
    // Marktplatz mit Brunnen, Ständen, begehbaren Häusern und Wirtshaus
    b.cyl(0, 0, -84, 2.2, .8, STONE, { solid: 1, tex: 'stone' }); b.cyl(0, .8, -84, .3, 1.6, STONE); b.sph(0, 2.4, -84, .5, .15, .5, 0x4a8a9a, { mat: { m: .5, r: .2 }, cast: false }); K.water(0, -84, 1.9, 0x4a8a9a, .85);
    K.stall(-9, -80, 0xc83a2a, 0, 0xd8402a); K.stall(9, -80, 0x3a6a3a, 0, 0xe8c040); K.stall(-9, -88, 0x3a5aa8, 3.14, 0xe0a050);
    for (const [x, z, ww, d, hh, i] of [[-30, -78, 6, 5, 3.8, 0], [-30, -90, 6, 5, 3.4, 1], [30, -78, 6, 5, 3.6, 2], [30, -90, 6, 5, 4, 3], [-14, -90, 6, 5, 3.6, 4]]) K.house(x, z, ww, d, hh, [PLA, 0xe0d0b0, 0xc8b890][i % 3], [ROOF, 0x4a3a2a, 0x5a2a1a][i % 3], i < 2 ? 1.57 : i < 4 ? -1.57 : 0, { beams: 0x3a2a1a, chimney: i % 2 });
    K.house(15, -90, 10, 6, 4.2, 0xd8c090, 0x5a2a1a, 0, { beams: 0x3a2a1a, chimney: 1 }); sign(15, 3.2, -86.9, 3.4, .8, 'Zum Gehörnten Hirsch', '#3a2a1a', '#e8d098', 0);
    { const ah = b.sph(8.5, 4.8, -86.9, .35, .3, .2, 0x8a6a3a, { cast: false }); for (const s of [-1, 1]) { const h = b.cone(8.5 + s * .3, 5.1, -86.9, .05, .45, 0xd8d0b0, { lo: 1 }); h.rotation.z = -s * .5; } }
    for (const [x, z] of [[-18, -74], [18, -74], [-18, -96 + 6], [20, -80]]) K.lamp(x, z, 0xffd890);
    // ===== Der Schießplatz: Zielscheiben, Tribüne, Zelte =====
    for (let i = 0; i < 4; i++) { const x = 52 + i * 4.4, z = -100; b.cyl(x, 0, z, .08, 1.6, 0x4a3a2a, { lo: 1 }); b.cyl(x, 1.6, z, .08, 1.4, 0x4a3a2a, { lo: 1 }).rotation.x = 0; const t = b.cyl(x, 1.6, z + .04, .9, .12, 0xf4f0e0, { lo: 1 }); t.rotation.x = Math.PI / 2;
      for (const [r, c] of [[.7, 0xc83a2a], [.45, 0xf4f0e0], [.22, 0xd8b030]]) { const d = b.cyl(x, 1.6, z + .1, r, .02, c, { cast: false }); d.rotation.x = Math.PI / 2; } }
    for (let i = 0; i < 3; i++) b.box(66, i * .8, -76 - i * 1.2, 14, .8, 1.2, i % 2 ? 0x2a5a3a : 0x8a2a2a, { solid: i === 0 });
    K.tent(76, -92, 2.4, 2.8, 0xc83a2a, { flag: 0xc83a2a }); K.tent(50, -72, 2.4, 2.8, 0x2a5aa8, { flag: 0x2a5aa8 });
    { const gp = b.box(60, 1.3, -88, .08, 1.5, .04, 0xd8b030, { mat: { m: .9, r: .3, e: 0xb08a10, ei: .8 }, cast: false, ry: .4 }); A.bob(gp, .1, 1.8); b.glow(0xffd860, 3, 60, 1.4, -88, .6); b.box(60, 0, -88, 1.1, .9, 1.1, 0x6a4a2a, { solid: 1 }); }
    // ===== Die Windmühle =====
    b.cone(-62, 0, -80, 3.2, 7, 0xd8c8a0, { solid: 1, tex: 'plaster' }); b.cyl(-62, 7, -80, 1.7, 1, 0x6a3a22); b.box(-62, 8, -79.6, 1.6, 1.3, 2.2, 0x6a3a22);
    { const hub = new T.Group(); hub.position.set(-62, 7.8, -78.6); b.g.add(hub); for (let i = 0; i < 2; i++) { const bl = mk(G.box, M(0xe8e0d0), 0, 0, 0, .5, 7.6, .12, false); bl.rotation.z = i * 1.5708; hub.add(bl); } A.spin(hub, .5); }
    b.box(-62, 0, -76.6, 1.1, 2.1, .1, 0x4a3020, { cast: false }); for (let i = 0; i < 6; i++) b.sph(-56 + (i % 3) * .8, .4, -84 - Math.floor(i / 3) * .8, .45, .4, .4, 0xe8e0c8, { mat: { r: 1 } });
    K.fence(-70, -84, -70, -72, 0x6a4a2a); K.fence(-70, -72, -66, -72, 0x6a4a2a);
    // ===== Die Burg =====
    const Z = -102; K.wall(-22, Z, -4, Z, 8, 2.4, STONE, { cren: 1, walk: 1 }); K.wall(4, Z, 22, Z, 8, 2.4, STONE, { cren: 1, walk: 1 });
    K.wall(-22, Z, -22, -128, 8, 2.4, STONE, { cren: 1, walk: 1 }); K.wall(22, Z, 22, -128, 8, 2.4, STONE, { cren: 1, walk: 1 }); K.wall(-22, -128, 22, -128, 8, 2.4, STONE, { cren: 1, walk: 1 });
    for (const [x, z] of [[-22, Z], [22, Z], [-22, -128], [22, -128]]) K.tower(x, z, 3, 12, STONE, 0x3a3a4a, 5, { win: 0xffc060 }); for (const x of [-4, 4]) K.tower(x, Z, 2, 10, STONE, 0x3a3a4a, 3.4);
    K.arch(0, Z, 6, 5.8, STONE, 0, .9); b.box(0, 5.8, Z, 8.2, 1, 1.8, STONE, { solid: 1 }); for (let i = 0; i < 7; i++) b.cone(-2.7 + i * .9, 4.6, Z + 1, .1, 1.1, 0x6a6a7a, { lo: 1 }).rotation.x = Math.PI;
    K.tower(0, -124, 5.6, 22, 0x9a9080, 0x3a3a4a, 8, { win: 0xffc060 }); for (const s of [-1, 1]) { b.cyl(s * 4, 30, -124, .06, 2.6, 0x4a3a2a, { lo: 1 }); const f = b.box(s * 4 + .6, 31.4, -124, 1.1, .7, .04, s < 0 ? 0xc83a2a : 0x2a5a8a, { cast: false }); A.sway(f, s); }
    for (const [x, z] of [[14, -118], [-18, -122]]) b.box(x, 0, z, 6, 3.4, 4, 0x8a8070, { solid: 1 });   // Stallungen
    // Marians Käfig im Burghof: Eisenstäbe, Dach, Schloss
    { const cx = -12, cz = -112; for (let i = 0; i < 12; i++) { const a = i * .5236; b.cyl(cx + Math.cos(a) * 1.7, 0, cz + Math.sin(a) * 1.7, .05, 3, 0x3a3a44, { mat: { m: .8, r: .4 }, lo: 1, solid: i % 3 === 0 }); } b.cone(cx, 3, cz, 2, .8, 0x3a3a44, { lo: 1 }); b.tor(cx, 3, cz, 1.7, 0x3a3a44, { d: .06 }).rotation.x = Math.PI / 2; b.sph(cx, 1.2, cz + 1.75, .16, .2, .1, 0xd8b030, { mat: { m: .9, r: .3 }, cast: false }); }
    for (const [x, z] of [[-6, -104], [6, -104], [0, -118]]) K.lamp(x, z, 0xffb050);
    // Der Sheriff-Thron: schwarzer Stuhl mit Geweih vor dem Bergfried
    b.box(8, 0, -117, 2.4, .5, 2.4, 0x3a3a44, { solid: 1 }); b.box(8, .5, -118, 1.4, 2.6, .4, 0x2a2a34); for (const s of [-1, 1]) { const h = b.cone(8 + s * .5, 3.1, -118, .08, .9, 0xd8d0b0, { lo: 1 }); h.rotation.z = -s * .45; }
    b.glow(0xff3a4a, 4, 8, 2, -117, 1);
  };
}
