// Wahrzeichen der Märchenwelten – gebaut aus einfachen Formen, nach den Beschreibungen der Vorlagen.
// Jeder Bau bekommt Kollision nur dort, wo er sichtbar steht (Kreisketten entlang der Wände, siehe solidBox in maerchen.js).
export function makeLand({ T, G, M, mk, glow }) {
  // Kleine Bausteine, die mehrere Welten nutzen
const dark = c => ((c >> 16 & 255) * .3 + (c >> 8 & 255) * .59 + (c & 255) * .11) < 90;
  function kit(b) {
    const K = {
      // Fachwerk-/Steinhaus mit Satteldach, Tür, leuchtenden Fenstern
      house(x, z, w, d, h, wall, roof, ry, o = {}) {
        /* begehbar: dasselbe Haus wie in den Kapitelwelten (Tür, Innenraum mit Einrichtung, Dach blendet beim Eintreten aus) */
        if (b.house && !o.solid && w >= 4.5 && d >= 3.8) return { g: b.house(x, z, w, d, Math.max(2.9, Math.min(h, 4.2)), wall, roof, ry || 0, { hs: { w: 'plaster', r: dark(roof) ? 'slate' : 'roof', f: 'gable', win: o.dark ? 0xb08aff : undefined }, chimney: o.chimney, kind: w >= 8.5 ? 'tavern' : 'home', dim: .4, rug: o.dark ? 0x3a2a5a : undefined }) };
        const g = new T.Group(); g.position.set(x, 0, z); g.rotation.y = ry || 0; b.g.add(g); const bb = { g };
        g.add(mk(G.box, b.mat(wall, 'plaster', o.dark ? null : { s: .45, gain: 1.7, n: .6, e: 0x3a3026, ei: 1 }), 0, h / 2, 0, w, h, d));
        if (o.beams) for (const sx of [-w / 2, w / 2]) g.add(mk(G.box, b.mat(o.beams, 'wood'), sx, h / 2, 0, .26, h, d + .05, false));
        for (const s of [-1, 1]) { const r = mk(G.box, b.mat(roof, dark(roof) ? 'slate' : 'roof', { s: .6 }), 0, h + d * .27, s * d * .26, w + .7, .28, d * .62); r.rotation.x = s * .72; g.add(r); }
        g.add(mk(G.box, M(wall), 0, h + d * .14, 0, w * .99, d * .3, d * .02, false));
        g.add(mk(G.box, M(0x4a3020), 0, 1.05, d / 2 + .02, 1.1, 2.1, .08, false));
        for (const sx of [-w * .3, w * .3]) g.add(mk(G.box, M(0xffd890, { e: 0xffc060, ei: o.dark ? .5 : 1.4 }), sx, h * .55, d / 2 + .03, .8, .7, .05, false));
        if (o.chimney) g.add(mk(G.box, M(0x6a5a50), w * .3, h + d * .45, -d * .15, .6, 1.4, .6));
        b.solid(x, z, w, d, ry, h, (lx, lz) => Math.max(0, d * .47 - .88 * Math.abs(lz))); return bb;
      },
      tower(x, z, r, h, wall, roofC, roofH, o = {}) { b.cyl(x, 0, z, r, h, wall, { solid: 1, tex: o.tex || 'stone' }); if (b.enter && !o.closed) b.enter('tower', x, z, r, { h, wall, roof: roofC }); if (roofC) b.cone(x, h, z, r * 1.18, roofH || r * 2, roofC, { tex: dark(roofC) ? 'slate' : 'roof', to: { s: .7 } });
        if (o.crown) for (let i = 0; i < 8; i++) { const a = i * .785; b.box(x + Math.cos(a) * r * .9, h, z + Math.sin(a) * r * .9, .6, .7, .6, wall); }
        if (o.win) for (let i = 0; i < 3; i++) b.box(x + Math.sin(i * 2.1) * (r + .02), h * .6, z + Math.cos(i * 2.1) * (r + .02), .35, .8, .35, 0xffd890, { mat: { e: o.win, ei: 1.4 }, cast: false }); },
      // Mauer zwischen zwei Punkten, optional mit Zinnen
      wall(x0, z0, x1, z1, h, th, col, o = {}) { const dx = x1 - x0, dz = z1 - z0, L = Math.hypot(dx, dz), ry = Math.atan2(dx, dz) + Math.PI / 2, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
        b.box(cx, 0, cz, L, h, th, col, { ry, solid: 1, tex: o.tex || 'stone' });
        if (o.cren) for (let i = 0; i < L / 2 - .5; i++) { const t = (i + .75) / (L / 2), px = x0 + dx * t, pz = z0 + dz * t; b.box(px, h, pz, 1, .8, th * .9, col, { ry }); } },
      tent(x, z, r, h, col, o = {}) { b.cyl(x, 0, z, .1, h + .4, 0x5a4030, { lo: 1 }); const t = b.cone(x, 0, z, r, h, col, { lo: 1, solid: 1 }); t.rotation.y = o.ry || .3; if (b.enter && r >= 1.6) b.enter('tent', x, z, r * .85, { h, wall: col });
        if (o.flag) b.box(x + .35, h + .3, z, .7, .4, .03, o.flag, { cast: false }); },
      stall(x, z, cloth, ry, goods) { const g = new T.Group(); g.position.set(x, 0, z); g.rotation.y = ry || 0; b.g.add(g);
        g.add(mk(G.box, b.mat(0x7a5a3a, 'wood'), 0, .5, 0, 3, 1, 1.4)); for (const sx of [-1.4, 1.4]) for (const sz of [-.65, .65]) g.add(mk(G.cyl0, M(0x5a4030), sx, 1.25, sz, .05, 2.5, .05));
        const c = mk(G.box, M(cloth), 0, 2.55, 0, 3.4, .1, 1.9); c.rotation.x = .12; g.add(c);
        for (let i = 0; i < 4; i++) g.add(mk(G.sph, M(goods || 0xd8a040), -1 + i * .65, 1.15, 0, .22, .18, .22));
        b.solid(x, z, 3, 1.4, ry); },
      arch(x, z, w, h, col, ry, th) { const g = new T.Group(); g.position.set(x, 0, z); g.rotation.y = ry || 0; b.g.add(g); const t = th || .7;
        for (const s of [-1, 1]) g.add(mk(G.box, b.mat(col, 'stone'), s * w / 2, h / 2, 0, t, h, t)); g.add(mk(G.box, b.mat(col, 'stone'), 0, h + t / 2, 0, w + t, t, t));
        for (const s of [-1, 1]) b.addCol(x + Math.cos(ry || 0) * s * w / 2, z - Math.sin(ry || 0) * s * w / 2, t * .6); },
      lamp(x, z, col) { b.cyl(x, 0, z, .08, 2.8, 0x2a2a2e, { lo: 1, solid: 1 }); b.sph(x, 2.95, z, .2, .26, .2, col || 0xffd890, { mat: { e: col || 0xffc060, ei: 2 }, cast: false }); b.glow(col || 0xffc060, 2.2, x, 2.95, z, .6); },
      fence(x0, z0, x1, z1, col) { const n = Math.max(2, Math.round(Math.hypot(x1 - x0, z1 - z0) / 1.6)); for (let i = 0; i <= n; i++) { const t = i / n; b.box(x0 + (x1 - x0) * t, 0, z0 + (z1 - z0) * t, .16, 1.1, .16, col || 0x6a4a2a, { tex: 'wood' }); }
        const L = Math.hypot(x1 - x0, z1 - z0), ry = Math.atan2(x1 - x0, z1 - z0) + Math.PI / 2; for (const y of [.45, .9]) b.box((x0 + x1) / 2, y, (z0 + z1) / 2, L, .08, .06, col || 0x6a4a2a, { ry }); b.solid((x0 + x1) / 2, (z0 + z1) / 2, L, .3, ry); },
      tree(x, z, s, trunk, leaf, o = {}) { b.cyl(x, 0, z, .35 * s, 2.6 * s, trunk || 0x5a3a22, { solid: 1, tex: 'bark', to: { s: 1 } }); for (let i = 0; i < (o.n || 3); i++) b.ico(x + Math.cos(i * 2.1) * .7 * s, (2.8 + (i % 2) * .7) * s, z + Math.sin(i * 2.1) * .7 * s, 1.5 * s, 1.2 * s, 1.5 * s, leaf || 0x3a6a2a);
        if (o.fruit) for (let i = 0; i < 9; i++) b.sph(x + Math.cos(i * .7) * 1.4 * s, (2.4 + (i % 3) * .5) * s, z + Math.sin(i * .7) * 1.4 * s, .16 * s, .16 * s, .16 * s, o.fruit, { mat: { e: o.fruit, ei: o.glowF || .4 }, cast: false }); },
      cliff(list, col) { for (const [x, z, r, h] of list) b.ico(x, h * .45, z, r, h, r * .9, col || 0x6a6460, { solid: 1, tex: 'rock', to: { s: .3 } }); },
      water(x, z, r, col, y) { const m = mk(new T.CircleGeometry(r, 36), new T.MeshStandardMaterial({ color: col, metalness: .5, roughness: .1, transparent: true, opacity: .8 }), x, y ?? .05, z, 1, 1, 1, false); m.rotation.x = -Math.PI / 2; b.g.add(m); return m; }
    };
    return K;
  }

  const LAND = {
    spiegel(b, w, A) {
      const K = kit(b);
      b.tmap = { 0x3a3442: 'stone', 0x2a2432: 'stone', 0x2a2232: 'stone', 0x7a5a3a: 'wood', 0x6a4a2a: 'wood', 0x5a4a3a: 'wood', 0x8a6a4a: 'wood', 0x2a2a1e: 'rock' };
      // Zwergenhaus: Fachwerk, Satteldach, Schornstein mit Rauch; davor Tisch mit sieben Stühlchen, Wäscheleine, Holzstapel
      K.house(-26, -21, 10, 7, 3.2, 0xe8dcc0, 0x7a3a2a, 0, { beams: 0x5a3a22, chimney: 1 });
      A.smoke(-23, 5.6, -22);
      b.box(-22, 0, -12.6, 3.2, .8, 1.3, 0x7a5a3a, { solid: 1 }); for (let i = 0; i < 7; i++) { const a = i / 7 * 6.283; b.box(-22 + Math.cos(a) * 2.1, 0, -12.6 + Math.sin(a) * 1.2, .35, .45, .35, 0x8a6a4a); b.cyl(-23.3 + i * .44, .82, -12.6, .1, .05, 0xd8d0c0, { cast: false }); }
      for (const x of [-34, -28]) b.cyl(x, 0, -27, .07, 1.9, 0x5a4030, { lo: 1, solid: 1 }); b.box(-31, 1.8, -27, 6, .02, .02, 0xe8e0d0, { cast: false }); for (let i = 0; i < 7; i++) b.box(-33.4 + i * .8, 1.45, -27, .4, .55, .03, [0xc84a3a, 0x4a7ac8, 0x5aa04a, 0xd8b040, 0x8a4ac8, 0xe07a2a, 0x4ab0b0][i], { cast: false });
      for (let i = 0; i < 4; i++) b.cyl(-19 + (i % 2) * .5, .3 + i * .45, -24 + (i % 2) * .3, .25, 2.2, 0x6a4a2a, { cast: false }).rotation.x = Math.PI / 2; b.addCol(-19, -24, 1);
      // Spiegelsee: Schilf, Ruderboot
      for (let i = 0; i < 22; i++) { const a = i * .29, r = 7.8 + (i % 3) * .4; b.cyl(26 + Math.cos(a) * r, 0, -24 + Math.sin(a) * r, .04, 1.3 + (i % 3) * .3, 0x5a7a3a, { lo: 1, cast: false }); }
      b.box(24, .05, -22, 1.2, .35, 3, 0x6a4a2a);
      // Erzstollen: Felswand, Stolleneingang mit Holzrahmen, Schienen, Lore
      K.cliff([[-48, -60, 4, 6], [-42, -70, 4.4, 7], [-34, -72, 4.4, 8], [-26, -70, 4, 7], [-20, -64, 3.4, 5.4], [-50, -50, 3, 4.6]]);
      b.box(-34, 0, -67.6, 3, 3.2, .3, 0x0e0c0e, { cast: false }); for (const s of [-1, 1]) b.box(-34 + s * 1.7, 0, -67.2, .35, 3.4, .35, 0x6a4a2a); b.box(-34, 3.3, -67.2, 3.8, .35, .35, 0x6a4a2a);
      for (const s of [-.45, .45]) b.box(-34 + s, .03, -59.5, .08, .08, 15, 0x5a5a62, { cast: false }); for (let i = 0; i < 15; i++) b.box(-34, .01, -66.5 + i, 1.4, .05, .25, 0x5a4030, { cast: false });
      b.box(-34, .35, -54.5, 1.4, 1, 1.9, 0x5a4a3a, { solid: 1 }); for (let i = 0; i < 4; i++) b.oct(-34 + (i - 1.5) * .3, 1.05, -54.5 + (i % 2) * .4, .18, .26, .18, 0xc8a0ff, { mat: { e: 0x8a5ad8, ei: 1.4 } });
      // Schloss der Königin: Bergfried, Türme mit Spitzdächern, violette Fenster, Dornenhecken
      const SW = 0x3a3442, SR = 0x2a1a3a;
      b.box(10, 0, -89, 14, 12, 10, SW, { solid: 1, mat: { r: .9 } }); b.box(10, 12, -89, 15, .8, 11, 0x2a2432); for (let i = 0; i < 6; i++) b.box(4 + i * 2.4, 12.8, -83.6, .9, .9, .5, SW);
      for (const [x, z, r, h] of [[1, -82, 2.4, 17], [19, -82, 2.4, 17], [5, -95, 2, 22], [15, -95, 2, 20]]) K.tower(x, z, r, h, SW, SR, r * 3.2, { win: 0xa060ff });
      b.box(10, 0, -83.98, 4, 5.4, .1, 0x0a080c, { cast: false }); b.cone(10, 5.4, -83.95, 2, 1.6, SW, { cast: false, rz2: .1 });
      for (const x of [6.2, 13.8]) b.box(x, 6.5, -83.96, 1.2, 1.8, .08, 0xb080ff, { mat: { e: 0x8a4aff, ei: 1.6 }, cast: false });
      K.wall(1, -82, 6, -82, 7, 1.6, SW, { cren: 1 }); K.wall(14, -82, 19, -82, 7, 1.6, SW, { cren: 1 });
      for (let i = 0; i < 9; i++) { b.ico(-3, .6, -66 - i * 1.6, 1, .9, .9, 0x2a2a1e, { solid: 1 }); b.ico(23, .6, -66 - i * 1.6, 1, .9, .9, 0x2a2a1e, { solid: 1 }); }
      // der große Zauberspiegel (dort erscheint das Schlüsselloch)
      b.box(10, 0, -72.6, 5, .9, 1.4, 0x2a2232, { solid: 1 }); const fr = b.tor(10, 4.2, -72.6, 2.3, 0xc8a24a, { mat: { m: .9, r: .25 }, rx: 0, d: 1.3 }); fr.scale.y = 2.7;
      const mir = b.sph(10, 4.2, -72.6, 2.1, 2.9, .06, 0xd8e8ff, { mat: { m: 1, r: .04, e: 0x4a2a7a, ei: .6 } }); A.pulse(mir.material, 0x4a2a7a, .3, 1.2);
      b.glow(0xc8a0ff, 8, 10, 4.2, -72, .4);
      // Apfelbaum der Königin mit giftig schimmernden Äpfeln
      K.tree(-6, -74, 1.1, 0x3a2a2a, 0x2a3a2a, { fruit: 0xc81a3a, glowF: 1 });
      // Dornenwald (West): Jägerhütte, Köhlermeiler, Dornenhecken mit Spitzen, Wegweiser
      K.house(-86, -38, 7, 5.4, 2.8, 0x8a7a64, 0x3a2a22, .6, { beams: 0x3a2a1a, chimney: 1 }); A.smoke(-83, 4.6, -39);
      b.cone(-70, 0, -36, 2.6, 3.4, 0x1a1a1a, { solid: 1, mat: { r: 1 } }); A.fire(-70, -36, .6);
      for (let i = 0; i < 26; i++) { const a = i * .24 + .3, r = 17 + (i % 3) * 1.2, x = -78 + Math.cos(a) * r, z = -34 + Math.sin(a) * r; if (a > 1.2 && a < 2.1) continue; b.cone(x, 0, z, .7, 2.6 + (i % 4) * .4, 0x1e2a18, { solid: 1, lo: 1 }).rotation.z = (i % 5 - 2) * .06; for (let k = 0; k < 3; k++) b.cone(x + Math.cos(k * 2.1) * .5, 1.4 + k * .4, z + Math.sin(k * 2.1) * .5, .1, .8, 0x3a2a2a, { lo: 1, cast: false }).rotation.z = 1.2; }
      b.box(-66, 0, -22, .2, 2, .2, 0x5a3a22, { lo: 1 }); b.box(-65.4, 1.7, -22, 1.4, .4, .08, 0x7a5a3a, { cast: false });
      // Giftküche (Ost): Hütte, brodelnder Kessel, Fässer, Kräuterbunde, grünes Glühen
      K.house(80, -56, 9, 6.4, 3, 0x4a4252, 0x2a1a3a, -.5, { beams: 0x2a1a1a, chimney: 1, dark: 1 }); A.smoke(83, 5.4, -57);
      b.cyl(68, 0, -50, 1.5, 1.1, 0x2a2a30, { solid: 1, mat: { m: .6, r: .4 } }); b.sph(68, 1.1, -50, 1.3, .25, 1.3, 0x5aff8a, { mat: { e: 0x2adf5a, ei: 2.2 }, cast: false }); b.glow(0x5aff8a, 6, 68, 1.6, -50, .7); A.fire(68, -50, .5);
      for (const [x, z] of [[64, -58], [74, -42], [78, -46], [62, -46]]) b.cyl(x, 0, z, .55, 1, 0x5a3a22, { solid: 1, tex: 'wood' });
      for (let i = 0; i < 6; i++) { b.box(60 + i * .6, 1.9, -52, .35, .05, .05, 0x8a8a40, { cast: false }); b.cone(60 + i * .6, 1.2, -52, .12, .7, [0x3a7a2a, 0x7a3a8a, 0x8a8a2a][i % 3], { lo: 1, cast: false }).rotation.x = Math.PI; }
      for (let i = 0; i < 5; i++) b.sph(72 + Math.cos(i * 1.3) * 7, .3, -50 + Math.sin(i * 1.3) * 7, .3, .3, .3, 0xc81a3a, { mat: { e: 0x5a0a10, ei: .8 }, cast: false });
      // Der gläserne Sarg (Nordwest): Sockel, Glassarg mit goldener Schrift, Zwergen-Stühlchen, Steinbögen, Trauerweide
      b.box(-58, 0, -100, 4.4, .7, 2.6, 0x7a7a82, { solid: 1, tex: 'marble' }); b.box(-58, .7, -100, 3.8, 1, 2, 0xc8e8ff, { mat: { m: .9, r: .05, t: .42, e: 0x4a6a9a, ei: .3 }, cast: false }); b.box(-58, 1.72, -100, 3.9, .08, 2.1, 0xd8b040, { mat: { m: .9, r: .2 }, cast: false });
      for (let i = 0; i < 7; i++) { const a = i / 7 * 6.283; b.box(-58 + Math.cos(a) * 6, 0, -100 + Math.sin(a) * 5.6, .45, .55, .45, [0xb02a2a, 0x2a4ab0, 0x2a8a3a, 0xc8a020, 0x8a2ab0, 0xc86a20, 0x2a9a9a][i], { solid: 1 }); }
      K.arch(-58, -88, 5.4, 4.2, 0x7a7a82, 0, .7); K.arch(-58, -112, 5.4, 4.2, 0x7a7a82, 0, .7); b.glow(0xc8e8ff, 9, -58, 2.4, -100, .35);
      K.tree(-72, -108, 1.4, 0x3a2a22, 0x2a5a3a, { n: 4 });
      // Splitterkluft (Ost): Spiegelmonolithen, Kristallsplitter, geborstener Rahmen
      for (const [x, z, h, ry] of [[52, -112, 7, .3], [70, -114, 9, -.4], [76, -98, 6, .8], [54, -96, 5, -.9], [62, -118, 8, 0]]) { const m = b.box(x, 0, z, 2.2, h, .5, 0xd8e8ff, { solid: 1, ry, mat: { m: 1, r: .04, e: 0x4a2a7a, ei: .6 } }); b.glow(0xc8a0ff, 5, x, h * .55, z, .35); }
      for (let i = 0; i < 18; i++) { const a = i * .7, r = 4 + (i % 4) * 2.4; b.oct(62 + Math.cos(a) * r, .6 + (i % 3) * .4, -104 + Math.sin(a) * r, .22, .7 + (i % 3) * .3, .22, 0xc8a0ff, { mat: { e: 0x8a5ad8, ei: 1.6 }, cast: false }); }
      b.tor(62, 3.4, -112, 2.4, 0xc8a24a, { mat: { m: .9, r: .25 }, rx: 0, d: 1 }).scale.y = 1.8;
    },
    dschungel(b, w, A) {
      const K = kit(b);
      b.tmap = { 0x8a8a78: 'brick', 0x868674: 'brick', 0x828270: 'brick', 0x7e7e6c: 'brick', 0x7a7a6a: 'brick', 0x8a7a64: 'rock', 0x6a6458: 'rock', 0xb08a5a: 'mud', 0x5a4430: 'bark', 0x6a5440: 'bark' };
      // Wolfshöhle: Felsen mit dunkler Höhle
      K.cliff([[-37, -7, 4, 4.4], [-41, -14, 3, 3.4], [-34, 0, 2.4, 2.6]], 0x7a6a58); b.box(-35.5, 0, -4, 2.2, 1.8, .2, 0x0e0c0a, { cast: false });
      // Ratsfelsen: flacher, mächtiger Felsblock mit Steinkreis
      b.ico(0, .8, -76, 5.6, 1.7, 4.4, 0x8a7a64, { solid: 1, mat: { r: 1 } }); for (let i = 0; i < 9; i++) { const a = i * .62 - 2.5; b.ico(Math.sin(a) * 9, .45, -72 + Math.cos(a) * 8, .8, .7, .8, 0x6a6458, { solid: 1 }); }
      // Kalte Höhlen: Stufentempel, zerfallene Mauern, Kuppeln, Säulen voller Ranken
      const ST = 0x8a8a78; for (let k = 0; k < 4; k++) b.box(40, k * 2, -74, 12 - k * 3, 2, 12 - k * 3, ST - k * 0x040404, { solid: k === 0, mat: { r: 1 } }); b.sph(40, 8.4, -74, 1.4, 1.6, 1.4, 0x7a7a6a);
      for (const [x, z, h] of [[22, -56, 4.6], [28, -74, 3.2], [46, -50, 5], [20, -70, 2.4], [50, -64, 4], [36, -48, 3]]) { b.box(x, 0, z, 1.6, h, 1.6, ST, { solid: 1, mat: { r: 1 } }); b.ico(x, h + .2, z, 1.2, .5, 1.2, 0x3a7a2a); if (h > 4) b.sph(x, h + .3, z, 1.2, .9, 1.2, 0x7a7a6a); }
      K.wall(18, -64, 26, -66, 3, 1.2, ST); K.wall(48, -56, 48, -46, 3.4, 1.2, ST); K.arch(30, -54, 4, 3.6, ST, .3, .9);
      for (let i = 0; i < 10; i++) { const a = i * .63; b.cyl(26 + Math.cos(a) * 3.2, 0, -50 + Math.sin(a) * 3.2, .55, .5, ST, { cast: false }); }
      K.water(26, -50, 3, 0x3a7a6a, .2);
      // Banyanbaum mit Luftwurzeln
      b.cyl(-14, 0, -58, 1.4, 6, 0x5a4430, { solid: 1 }); b.ico(-14, 7.5, -58, 6, 2.5, 6, 0x2a6a2a); for (let i = 0; i < 8; i++) b.cyl(-14 + Math.cos(i * .8) * 4.2, 0, -58 + Math.sin(i * .8) * 4.2, .12, 6.6, 0x6a5440, { lo: 1, solid: 1 });
      // Menschendorf: Lehmhütten mit Strohdach, Feuerstellen (die Rote Blume), Büffel
      for (const [x, z] of [[42, -4], [36, -17], [24, -4], [46, -12]]) { b.cyl(x, 0, z, 2.2, 2, 0xb08a5a, { solid: 1 }); b.cone(x, 2, z, 2.9, 2.2, 0xc8b070, {}); b.box(x, 0, z + 2.18, .9, 1.5, .06, 0x3a2a1a, { cast: false }); }
      for (const [x, z] of [[30, -1], [40, -11], [27, -12]]) { for (let i = 0; i < 6; i++) b.ico(x + Math.cos(i) * .8, .15, z + Math.sin(i) * .8, .22, .18, .22, 0x6a6458); A.fire(x, z, .7); }
      for (const [x, z, r] of [[48, -24, .4], [52, -18, 1.6], [44, -28, 2.8]]) { const g = A.creature('eber', 0x3a3a3e, 1.2); g.position.set(x, b.h(x, z), z); g.rotation.y = r; b.addCol(x, z, 1.1); }
      // Friedensfelsen (Wasserfrieden): flacher Fels am Wasserloch, Hathis Ruheplatz
      b.ico(-88, .3, -2, 4.6, 1.6, 3.6, 0x8a7a64, { solid: 1, mat: { r: 1 } }); for (let i = 0; i < 7; i++) b.ico(-80 + Math.cos(i) * 9, .3, -4 + Math.sin(i) * 8, .9, .6, .8, 0x6a6458, { solid: 1 });
      // Bienenfelsen: zerklüftete Felsen voller Waben, summende Lichtpunkte
      K.cliff([[-82, -96, 4, 7], [-70, -100, 4.6, 8], [-62, -92, 3.4, 6], [-84, -84, 3, 5]], 0x7a6a58);
      for (let i = 0; i < 16; i++) { const x = -74 + Math.cos(i * .9) * (6 + i % 3), z = -94 + Math.sin(i * .9) * 4; b.sph(x, 2 + (i % 4) * .9, z, .5, .7, .4, 0xd8a030, { mat: { e: 0x8a5a10, ei: .8 }, cast: false }); }
      for (let i = 0; i < 8; i++) b.glow(0xffd040, 1.2, -74 + Math.cos(i * 2.3) * 7, 3 + (i % 3), -92 + Math.sin(i * 2.3) * 5, .7);
      // Schatzgewölbe unter den Kalten Höhlen: Torbogen, Goldhaufen, Kobra-Statue
      K.arch(66, -86, 5, 4.6, 0x8a8a78, 0, .9); K.wall(60, -100, 72, -100, 4, 1.2, 0x8a8a78); K.wall(58, -88, 58, -100, 4, 1.2, 0x8a8a78); K.wall(74, -88, 74, -100, 4, 1.2, 0x8a8a78);
      for (let i = 0; i < 9; i++) b.sph(62 + (i % 3) * 3, .2, -96 + Math.floor(i / 3) * 2.4, .9, .45, .9, 0xd8b040, { mat: { m: .9, r: .3, e: 0x6a4a10, ei: .5 }, cast: false });
      b.cyl(66, 0, -98, .5, 3.2, 0xe8e4d8, { solid: 1 }); b.sph(66, 3.3, -97.6, .6, .5, .45, 0xe8e4d8); b.glow(0xffe08a, 6, 66, 1.5, -94, .4);
      // Büffelschlucht (Tiger! Tiger!): zwei Felswände, Büffelherde am Hang
      K.cliff([[64, 4, 3, 7], [64, -8, 3.4, 8], [64, -20, 3, 7], [86, 2, 3, 7], [86, -10, 3.6, 8], [86, -22, 3, 6]], 0x8a7a64);
      for (const [x, z, r] of [[70, -2, .2], [76, 0, -.4], [80, -6, .8], [72, -14, 2.8], [78, -18, 3.1]]) { const g = A.creature('eber', 0x2a2a2e, 1.4); g.position.set(x, b.h(x, z), z); g.rotation.y = r; b.addCol(x, z, 1.2); }
      // Bungalow (Rikki-tikki-tavi): weißes Haus mit Veranda und Garten
      K.house(-50, 42, 9, 7, 3.2, 0xf0ece0, 0x8a3a2a, .3, {}); for (let i = 0; i < 4; i++) b.cyl(-54 + i * 2.6, 0, 46.5, .12, 3, 0xe8e0d0, { lo: 1, solid: 1 });
      for (let i = 0; i < 10; i++) b.ico(-40 + Math.cos(i * .63) * 6, .3, 34 + Math.sin(i * .63) * 5, .7, .6, .7, [0x3a8a2a, 0xc84a6a, 0xe0a030][i % 3], { cast: false });
    },
    notredame(b, w, A) {
      const K = kit(b);
      b.tmap = { 0xc0b8a8: 'stone', 0xa29a8c: 'stone', 0x9a9284: 'stone', 0x8a8478: 'stone', 0xa8a090: 'cobble', 0x6a4a2a: 'wood', 0x5a3a22: 'wood', 0x9a9488: 'stone', 0x5a4a3a: 'wood' };
      // Westfassade von Notre-Dame: zwei Türme, Fensterrose, drei Portale, Königsgalerie, Kirchenschiff mit Dachreiter
      const Z = -76, S = 0xc0b8a8, D = 0xa29a8c;
      b.box(0, 0, Z, 34, 18, 10, S, { solid: 1, mat: { r: .95 } });
      for (const x of [-11.5, 11.5]) { b.box(x, 18, Z, 9, 14, 9, S); for (const dx of [-2.4, 0, 2.4]) b.box(x + dx, 22.5, Z + 4.52, .9, 6.4, .1, 0x2a2a34, { cast: false }); b.box(x, 32, Z, 9.8, .6, 9.8, D); for (let i = 0; i < 8; i++) b.box(x - 4.2 + i * 1.2, 32.6, Z + 4.6, .4, .9, .4, D); }
      b.box(0, 18, Z, 14, 2.6, 7, D); for (let i = 0; i < 10; i++) b.box(-6 + i * 1.33, 18.6, Z + 3.6, .5, 1.8, .2, 0x8a8478);
      b.tor(0, 12, Z + 5.05, 3.2, D, { rx: 0, d: .8 }); const rose = b.cyl(0, 12, Z + 5.02, 3, .12, 0x6a5aff, { mat: { e: 0x4a3ad8, ei: 1.4 }, cast: false }); rose.rotation.x = Math.PI / 2; rose.position.y = 12; A.pulse(rose.material, 0x4a3ad8, 1, 1.6);
      for (let i = 0; i < 12; i++) { const a = i * .5236, sp = b.box(Math.cos(a) * 1.5, 12 + Math.sin(a) * 1.5, Z + 5.1, .1, 1.6, .06, D, { cast: false }); sp.rotation.z = a; }
      for (const x of [-10, 0, 10]) { const pw = x ? 4 : 5; b.box(x, 0, Z + 5.06, pw, 7, .1, 0x2a2420, { cast: false }); b.cone(x, 7, Z + 5.06, pw / 2 + .1, 2.2, D, { cast: false, rz2: .1 }); for (let i = 0; i < 4; i++) b.box(x - pw / 2 - .4, 1 + i * 1.5, Z + 5.2, .4, 1.1, .3, 0x9a9284); }
      for (let i = 0; i < 28; i++) b.box(-14.5 + i * 1.07, 9.4, Z + 5.15, .55, 1.5, .35, D, { cast: false });   // Königsgalerie
      b.box(0, 0, -90, 18, 20, 18, S); const nr = b.cone(0, 20, -90, 12.8, 6, 0x4a5a6a, { lo: 1 }); nr.rotation.y = Math.PI / 4; nr.scale.set(9.6, 6, 13); b.cone(0, 23, -92, .8, 14, 0x4a5a6a);
      for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { const fb = b.box(s * 12, 8, -86 - i * 5, 6, .7, .9, S); fb.rotation.z = s * .55; b.box(s * 15, 0, -86 - i * 5, 1.2, 12, 1.2, S); }
      // Glockenturm mit Steinvorsprüngen zum Hochklettern (die Glockenstube oben)
      A.climbTower(w.climb.cx, w.climb.cz, w.climb.top, S, D);
      // Seine mit Steinbrücke und Kähnen
      b.box(0, .25, -19, 10, .4, 15, 0xa8a090, { cast: false }); for (const s of [-1, 1]) b.box(s * 5, .4, -19, .5, 1, 14, D, { solid: 1 });
      for (const [x, z, r] of [[-24, -18, .2], [30, -17, -.3], [-44, -21, .5]]) { const bt = b.box(x, -.3, z, 5, .5, 1.6, 0x5a3a22, { ry: r }); A.bob(bt, .08, 1.2); }
      // Häuser am Ufer und an den Gassen
      for (const [x, z, ry, c] of [[-22, 4, 0, 0xd8c8a8], [22, 6, 0, 0xe0d0b0], [-38, -2, .3, 0xc8b898], [38, 0, -.3, 0xd0c0a0], [-46, -30, 1.2, 0xc8b8a0], [48, -30, -1.2, 0xd8c8b0]]) K.house(x, z, 6, 5, 7, c, 0x4a4a5a, ry, { beams: 0x5a3a22 });
      // Hof der Wunder: Zeltplanen, Feuertonnen, Kisten
      for (const [x, z, c] of [[-42, -36, 0x8a2a2a], [-30, -48, 0x4a6a2a], [-48, -42, 0x6a4a8a]]) K.tent(x, z, 2.6, 2.4, c, { flag: 0xd8b040 });
      for (const [x, z] of [[-36, -42], [-40, -51]]) { b.cyl(x, 0, z, .45, 1, 0x3a3a3a, { solid: 1 }); A.fire(x, z, .5, 1); }
      // Place de Grève: Pranger mit Rad, Brunnen, Marktstände
      b.box(40, 0, -44, 3.2, 1, 3.2, 0x6a4a2a, { solid: 1 }); b.cyl(40, 1, -44, .15, 2.4, 0x5a3a22, { lo: 1 }); const wh = b.tor(40, 3.4, -44, .9, 0x5a3a22, { rx: Math.PI / 2, d: .1 }); A.spin(wh, .3);
      b.cyl(30, 0, -54, 1.8, .8, 0x9a9488, { solid: 1 }); b.cyl(30, .8, -54, .3, 1.4, 0x9a9488); K.water(30, -54, 1.5, 0x6a9ab8, .78);
      K.stall(24, -48, 0xc83a2a, 1.5); K.stall(42, -54, 0x3a6ac8, -1.2, 0xc8a070);
      for (const [x, z] of [[-14, -40], [14, -40], [-16, -64], [16, -64], [-6, -30], [6, -30]]) K.lamp(x, z);
      // Großer Saal des Justizpalastes (Narrenfest): Halle mit Spitzbögen, Bühne, Freudenfeuer-Plätze
      b.box(-70, 0, 14, 16, 7, 8, 0x8a8274, { solid: 1, tex: 'stone' }); for (let i = 0; i < 4; i++) K.arch(-76 + i * 4, 9.6, 2.6, 4.4, 0x9a9284, 0, .5); b.box(-64, 0, 4, 6, .9, 3, 0x6a4a2a, { solid: 1, tex: 'wood' });
      for (const [x, z, c] of [[-60, 6, 0xc8402a], [-66, 6, 0xd8b040], [-62, 2.6, 0x4a6ac8]]) b.box(x, .9, z, 1.4, 2.2, .1, c, { cast: false });
      // Schenke „Zum Apfel Evas“: Fachwerkhaus, Fässer, Schild, Laternen
      K.house(72, -8, 9, 7, 3.6, 0xe0d4b8, 0x5a3a2a, -.4, { beams: 0x4a2a1a, chimney: 1 }); b.box(66, 2.6, -3.2, .1, .1, 1.6, 0x2a2a2a, { cast: false }); b.box(66, 1.9, -2.6, .1, 1, 1, 0xc83a2a, { cast: false });
      for (const [x, z] of [[62, 2], [64, 4], [70, 4], [60, -4]]) b.cyl(x, 0, z, .5, 1, 0x6a4a2a, { solid: 1, tex: 'wood' }); K.lamp(58, 0); K.lamp(74, 2);
      // Frollos Alchemistenzelle im Nordturm-Rest: runder Turm, grünes Leuchten, Bücher, Destillierkolben
      K.tower(-70, -94, 4.2, 12, 0x6a6468, 0x2a2232, 7, { win: 0x5aff8a, crown: 1 }); b.box(-70, 0, -89.6, 1.6, 2.6, .2, 0x0e0c0a, { cast: false });
      for (let i = 0; i < 6; i++) b.sph(-64 + (i % 3) * 1.2, .5, -86 + Math.floor(i / 3) * 1.2, .35, .5, .35, 0x7affaa, { mat: { e: 0x2adf6a, ei: 1.6, t: .7 }, cast: false }); b.glow(0x5aff8a, 6, -63, 1, -85.4, .5);
      // Montfaucon: kahler Hügel mit Steinpfeilern und Raben
      for (let i = 0; i < 8; i++) { const a = i * .785; b.box(64 + Math.cos(a) * 7, 0, -96 + Math.sin(a) * 7, 1.2, 6, 1.2, 0x5a5652, { solid: 1, tex: 'stone' }); }
      b.box(64, 6, -96, 15.4, .7, 1, 0x4a4642, { tex: 'stone' }); b.box(64, 6, -96, 1, .7, 15.4, 0x4a4642, { tex: 'stone' });
    },
    theben(b, w, A) {
      const K = kit(b), S = 0xece4d4;
      b.tmap = { 0xece4d4: 'marble', 0xd8d0c0: 'marble', 0xd8ccb4: 'stone', 0xc8bca4: 'stone', 0x6a5a44: 'bark', 0x3a3428: 'bark', 0x9a7a5a: 'rock' };
      // Agora: Säulenhalle (Stoa), Brunnen, Amphoren
      b.box(-16, 0, -15, 22, 4.5, .8, 0xd8d0c0, { solid: 1 }); b.box(-16, 4.5, -13, 23, .5, 5, S); for (let i = 0; i < 9; i++) b.cyl(-26 + i * 2.5, 0, -11, .35, 4.5, S, { solid: 1 });
      b.cyl(14, 0, -4, 1.8, .7, S, { solid: 1 }); b.cyl(14, .7, -4, .35, 1.6, S); K.water(14, -4, 1.55, 0x6ab8e8, .68);
      for (const [x, z] of [[-12, -1], [20, -12], [-22, 1]]) for (let i = 0; i < 3; i++) { b.sph(x + i * .8, .55, z, .35, .55, .35, 0xc06a2a); b.cyl(x + i * .8, 1.05, z, .14, .3, 0x1a1410); } b.addCol(-11.2, -1, 1.4); b.addCol(20.8, -12, 1.4); b.addCol(-21.2, 1, 1.4);
      // Arena der Prüfungen: Rund mit Rängen, Tor im Süden
      const AX = 30, AZ = -46, AR = 12.5;
      for (let i = 0; i < 26; i++) { const a = i / 26 * 6.283; if (Math.abs(Math.sin(a)) < .42 && Math.cos(a) > 0) continue; const x = AX + Math.sin(a) * AR, z = AZ + Math.cos(a) * AR;
        b.box(x, 0, z, 3.2, 3.4, 1.4, 0xd8ccb4, { ry: a, solid: 1 }); b.box(AX + Math.sin(a) * (AR + 1.6), 0, AZ + Math.cos(a) * (AR + 1.6), 3.4, 4.8, 1.6, 0xc8bca4, { ry: a }); }
      const fl = mk(new T.CircleGeometry(AR - .5, 32), M(0xe0cc98, { r: 1 }), AX, .04, AZ, 1, 1, 1, false); fl.rotation.x = -Math.PI / 2; b.g.add(fl);
      for (const s of [-1, 1]) { b.cyl(AX + s * 4.4, 0, AZ + AR + .2, .6, 6, S, { solid: 1 }); b.cone(AX + s * 4.4, 6, AZ + AR + .2, .9, 1.4, 0xd8b040); } b.box(AX, 6, AZ + AR + .2, 10, .7, 1, S);
      // Garten der Hesperiden: goldener Apfelbaum, schlafender Drache Ladon, Heckenrund
      K.tree(-32, -40, 1.4, 0x6a5a44, 0x5a8a3a, { fruit: 0xffc830, glowF: 1.2, n: 4 });
      const ld = A.creature('schlange', 0xb0a040, 1.9); ld.position.set(-29.5, b.h(-29.5, -40), -40); ld.rotation.y = 1.2; b.addCol(-29.5, -40, 1.4);
      for (let i = 0; i < 26; i++) { const a = i / 26 * 6.283; if (Math.sin(a) > .75) continue; b.ico(-32 + Math.sin(a) * 11.5, .7, -40 + Math.cos(a) * 11.5, 1.1, .95, 1.1, 0x3a6a2a, { solid: 1 }); }
      // Höhle von Nemea
      K.cliff([[46, -12, 3.6, 4.6], [45, -22, 3.4, 4.2], [50, -17, 3, 5]], 0x9a7a5a); b.box(43.2, 0, -17, .2, 2.8, 2.8, 0x14100c, { cast: false });
      // Sumpf von Lerna: Schilf, abgestorbene Bäume
      for (let i = 0; i < 24; i++) b.cyl(-22 + Math.sin(i * 2.3) * 10, 0, -74 + Math.cos(i * 1.7) * 8, .05, 1.4, 0x6a8a3a, { lo: 1, cast: false });
      for (const [x, z] of [[-34, -66], [-10, -82], [-30, -84]]) { b.cyl(x, 0, z, .3, 3.4, 0x3a3428, { solid: 1 }); const br = b.cyl(x + .5, 2.6, z, .1, 1.6, 0x3a3428, { lo: 1 }); br.rotation.z = -.7; }
      // Tempel des Zeus: Stufenbau, zwei Säulenreihen, Giebel, Statue
      const TZ = -82; b.box(10, 0, TZ, 22, 1, 12, S, { solid: 1 }); b.box(10, 1, TZ, 20, .5, 10.4, S);
      for (let i = 0; i < 7; i++) for (const dz of [-4.2, 4.2]) b.cyl(1.4 + i * 2.85, 1.5, TZ + dz, .5, 6, S);
      b.box(10, 7.5, TZ, 21, .9, 11, S); const pd = b.cone(10, 8.4, TZ, 1, 2.6, S, { lo: 1 }); pd.rotation.y = Math.PI / 4; pd.scale.set(10.8, 2.6, 6.2);
      b.box(10, 1.5, TZ - 2, 1.4, 4, 1.4, 0xe8dca0, { mat: { m: .6, r: .3 } }); b.sph(10, 6, TZ - 2, .7, .8, .7, 0xe8dca0, { mat: { m: .6, r: .3 } });
      // Augiasstall: lange Stallgebäude, Mist, zwei Flussläufe mit Dämmen
      for (const z of [-2, 8]) b.box(-80, 0, z, 18, 3.4, 5, 0x8a6a4a, { solid: 1, tex: 'wood' }); for (const z of [-2, 8]) b.box(-80, 3.4, z, 19, .4, 6, 0x6a4a2a, { tex: 'roof' });
      for (let i = 0; i < 12; i++) b.ico(-90 + i * 1.8, .1, 3 + (i % 3) - 1, .9, .4, .7, 0x5a4a2a, { cast: false });
      for (const [x, z] of [[-92, -12], [-64, -14]]) { b.box(x, 0, z, 6, 1.4, 1.4, 0x8a7a64, { tex: 'stone', solid: 1 }); }
      // Stymphalischer See: dunkles Ufer, tote Bäume, eherne Klappern auf einem Felsen
      for (let i = 0; i < 9; i++) { const a = i * .7; b.cyl(70 + Math.cos(a) * 12, 0, -90 + Math.sin(a) * 9, .25, 4 + (i % 3), 0x3a2a1a, { lo: 1, solid: 1, tex: 'bark' }); }
      b.ico(74, .5, -82, 2.6, 1.6, 2.2, 0x7a6a58, { solid: 1 }); for (const s of [-1, 1]) b.cyl(74 + s * .5, 2.1, -82, .35, .12, 0xc8902a, { mat: { m: .9, r: .2 }, cast: false });
      // Erymanthos: verschneiter Berghang mit Felsen und Kiefern
      K.cliff([[-80, -104, 5, 9], [-66, -110, 5, 10], [-56, -100, 4, 7]], 0xd8dce4); for (let i = 0; i < 8; i++) b.ico(-74 + Math.cos(i) * 8, .1, -96 + Math.sin(i) * 6, 1.4, .3, 1.4, 0xf4f8ff, { cast: false });
      // Heiliger Hain der Artemis: Rundtempel mit Säulen, goldener Altar
      for (let i = 0; i < 8; i++) { const a = i * .785; b.cyl(78 + Math.cos(a) * 5, 0, -22 + Math.sin(a) * 5, .45, 5, 0xf0ece0, { solid: 1, tex: 'marble' }); }
      b.cyl(78, 5, -22, 6, .6, 0xe8e4d8, { tex: 'marble' }); b.cone(78, 5.6, -22, 6.4, 2, 0xc8b070, { tex: 'roof' }); b.box(78, 0, -22, 1.6, 1, 1, 0xd8b040, { mat: { m: .9, r: .3 }, solid: 1 }); b.glow(0xffe8a0, 5, 78, 1.6, -22, .5);
      // Tainaron: Felsentor zur Unterwelt mit rotem Glühen
      K.cliff([[-8, -126, 4, 8], [8, -126, 4, 8]], 0x4a3a3a); K.arch(0, -124, 6, 5.4, 0x3a2a2a, 0, 1.2); b.box(0, 0, -125, 5.4, 5.2, .2, 0x0a0404, { cast: false }); b.glow(0xff3a1a, 9, 0, 2.4, -123.6, .5);
    },
    meer(b, w, A) {
      const K = kit(b);
      b.tmap = { 0xe8b0c0: 'coral', 0xf0c8d8: 'coral', 0x5a3a24: 'wood', 0x6a4a30: 'wood', 0x3a3428: 'stone' };
      // Schloss des Meerkönigs: Korallenmauern, hohe Bernsteinfenster, Muschelschalen auf dem Dach, die sich öffnen und schließen
      const CO = 0xe8b0c0, Z = -79;
      b.box(0, 0, Z, 26, 9, 5, CO, { solid: 1, mat: { e: 0x5a2a3a, ei: .4 } });
      for (let i = 0; i < 7; i++) { const x = -10.5 + i * 3.5; if (i === 3) continue; b.box(x, 2, Z + 2.55, 1.3, 4.2, .1, 0xffb040, { mat: { e: 0xff8a10, ei: 1.6 }, cast: false }); b.cone(x, 6.2, Z + 2.55, .66, 1.3, 0xffb040, { mat: { e: 0xff8a10, ei: 1.6 }, cast: false, rz2: .06 }); }
      b.tor(0, 3.6, Z + 2.6, 2.4, 0xf8f0ff, { mat: { e: 0xa0d8ff, ei: .8, m: .6, r: .2 }, rx: 0, d: 1 }); b.box(0, 0, Z + 2.56, 3.6, 4.4, .1, 0x0a2a3a, { cast: false });
      for (const x of [-15, 15]) { K.tower(x, Z + .5, 2.2, 13, 0xf0c8d8); b.sph(x, 13, Z + .5, 2.3, 1.6, 2.3, 0x2a4a8a, { mat: { m: .4, r: .3 } }); }
      for (let i = 0; i < 8; i++) { const sh = b.sph(-10.5 + i * 3, 9.2, Z, 1.3, .8, 1.3, 0x3a5a9a, { mat: { m: .5, r: .25 } }); A.shell(sh, i); b.sph(-10.5 + i * 3, 9.3, Z, .3, .3, .3, 0xf8f8ff, { mat: { e: 0xd8e8ff, ei: 1.2 }, cast: false }); }
      for (const x of [-6, 6]) { b.cyl(x, 0, Z + 6, .5, 4, 0xf0c8d8, { solid: 1 }); b.cone(x, 4, Z + 6, .8, 2, 0x6ad8c8, { mat: { e: 0x2a7a6a, ei: .8 } }); }
      b.glow(0xa0f0ff, 12, 0, 5, Z + 3, .35);
      // Gärten der Prinzessinnen: sechs runde Beete; das jüngste rund wie die Sonne, rot, mit Marmorstatue und rosa Trauerweide
      const GC = [[-30, -28, 0x4a8ac8, 'Walfisch'], [-24, -34, 0xd8b040, 'Meerweib'], [-36, -34, 0x8a4ac8, ''], [-27, -40, 0x4ac88a, ''], [-34, -42, 0xe0e0f0, ''], [-30, -34, 0xe0302a, 'sonne']];
      for (const [x, z, c, t] of GC) { const bed = mk(new T.CircleGeometry(t === 'sonne' ? 2.8 : 2.2, 24), M(0x6a5a3a), x, .06, z, t === 'Walfisch' ? 1.5 : 1, 1, 1, false); bed.rotation.x = -Math.PI / 2; b.g.add(bed);
        for (let i = 0; i < 10; i++) { const a = i * .63, r = (t === 'sonne' ? 2.2 : 1.6) * (.4 + (i % 2) * .5); b.sph(x + Math.cos(a) * r * (t === 'Walfisch' ? 1.5 : 1), .35, z + Math.sin(a) * r, .26, .26, .26, c, { mat: { e: c, ei: .9 }, cast: false }); } }
      b.cyl(-30, 0, -34, .45, .7, 0xf0f0f4, { solid: 1 }); b.cyl(-30, .7, -34, .22, 1.1, 0xf8f8fc); b.sph(-30, 2.05, -34, .22, .25, .22, 0xf8f8fc);
      K.tree(-33.5, -31, .9, 0x8a5a6a, 0xe890b0, { n: 3 });
      // Schiffswrack: schräger Rumpf, Mast, Segel, Kanone
      b.box(32, -.3, -32, 4, 3, 13, 0x5a3a24, { solid: 1, ry: .3, rz: .25 }); b.box(32, 2.4, -32, 3.6, .2, 12, 0x6a4a30, { ry: .3, rz: .25 }); const ms = b.cyl(31, 0, -30, .22, 10, 0x4a3020, { lo: 1 }); ms.rotation.z = .4; b.box(28.5, 5, -30, 4.4, 3, .05, 0xd8d0b8, { rz: .4, cast: false });
      b.cyl(28, .3, -38, .3, 1.8, 0x2a2a30, { cast: false }).rotation.z = Math.PI / 2; b.addCol(28, -38, .6);
      // Strudel: drehende Wirbel (Kraft im Spiel, siehe currents)
      for (const [x, z, r] of w.currents) A.vortex(x, z, r);
      // Haus der Meerhexe: Knochenbögen, Polypenwald
      for (const s of [-1, 1]) { const r = b.tor(-42 + s * 2.2, 2.6, -76, 2.6, 0xe8e0c8, { rx: 0, ry: s * .5, d: .5 }); r.scale.y = 1.6; } b.box(-42, 0, -78, 6, 4.4, 4, 0x3a3428, { solid: 1 }); b.box(-42, 0, -75.98, 1.6, 2.4, .1, 0x0a0a0c, { cast: false });
      for (let i = 0; i < 14; i++) { const a = i * .45, r = 6 + (i % 3); const t = b.cyl(-40 + Math.cos(a) * r, 0, -72 + Math.sin(a) * r * .8, .14, 2.6 + (i % 3), 0x5a8a3a, { lo: 1, mat: { e: 0x1a4a1a, ei: 1 } }); A.sway(t, i); }
      for (const [x, z] of w.vents) A.vent(x, z);
      for (const [x, z] of [[-10, -36], [12, -18], [6, -46], [-28, -14], [20, -60]]) { const m = mk(G.cyl, new T.MeshBasicMaterial({ color: 0x8ae8ff, transparent: true, opacity: .06, depthWrite: false, blending: T.AdditiveBlending }), x, 12, z, 2.6, 24, 2.6, false); b.g.add(m); }
      // Eisberg (was die zweite Schwester sah): großer Eisblock bis über das Wasser, Glühen von oben
      b.ico(-78, 2, -14, 7, 9, 6, 0xd8f0ff, { solid: 1, mat: { r: .15, m: .1, e: 0x4a8aaa, ei: .4 } }); b.ico(-70, 1, -6, 3, 4, 3, 0xe8f8ff, { solid: 1, mat: { r: .15, e: 0x4a8aaa, ei: .4 } }); b.glow(0xc8f4ff, 12, -78, 12, -14, .35);
      // Garten mit dem Marmorjüngling: rundes Beet, rote Trauerweide, Statue
      for (let i = 0; i < 12; i++) { const a = i * .52; b.sph(-70 + Math.cos(a) * 6, .2, -60 + Math.sin(a) * 6, .7, .4, .7, 0xe84a3a, { mat: { e: 0x8a1a1a, ei: .6 }, cast: false }); }
      b.box(-70, 0, -60, 1.6, 1.2, 1.6, 0xe8e4dc, { solid: 1, tex: 'marble' }); b.cyl(-70, 1.2, -60, .32, 1.6, 0xf0ece4, { tex: 'marble' }); b.sph(-70, 3.1, -60, .34, .4, .34, 0xf0ece4, { tex: 'marble' }); for (const s of [-1, 1]) b.cyl(-70 + s * .45, 1.9, -60, .1, .9, 0xf0ece4, { lo: 1, cast: false });
      for (let i = 0; i < 9; i++) b.cyl(-62 + Math.cos(i * .7) * 1.2, 0, -54 + Math.sin(i * .7) * 1.2, .08, 4 + (i % 3), 0xc8402a, { lo: 1, cast: false });
      // Zweites Wrack aus der Sturmnacht: geborstener Rumpf, Mast, Laternen
      b.box(70, .8, -70, 12, 3, 4, 0x5a3a22, { solid: 1, tex: 'wood', rz: .2, ry: .5 }); b.cyl(66, 0, -66, .3, 9, 0x4a2e1a, { tex: 'wood' }).rotation.z = .6; for (const [x, z] of [[74, -66], [64, -74]]) b.glow(0xffc060, 3, x, 1.2, z, .6);
      // Polypenwald vor dem Haus der Hexe: graue Polypen mit Armen, Knochen
      for (let i = 0; i < 16; i++) { const a = i * .4, r = 6 + (i % 4) * 2.4, x = 60 + Math.cos(a) * r, z = -92 + Math.sin(a) * r; b.cyl(x, 0, z, .35, 2 + (i % 3), 0x6a7a5a, { lo: 1, solid: 1 }); for (let k = 0; k < 4; k++) b.cyl(x + Math.cos(k * 1.6) * .5, 2.4 + (i % 3), z + Math.sin(k * 1.6) * .5, .07, 1.4, 0x5a6a4a, { lo: 1, cast: false }).rotation.z = .9; }
      for (let i = 0; i < 6; i++) b.box(56 + i * 1.4, .1, -86 + (i % 2), .9, .14, .14, 0xe8e0d0, { cast: false, ry: i });
      // Lichtsäule der Töchter der Luft: helle Säule von der Oberfläche
      { const m = b.cyl(0, 0, 40, 3, 30, 0xfff8e0, { mat: { e: 0xfff0c0, ei: 1, t: .18 }, cast: false }); m.material.depthWrite = false; } b.glow(0xfff0c0, 14, 0, 6, 40, .4);
    },
    mauer(b, w, A) {
      const K = kit(b), S = 0x9a948a, R = 0xb83a2a;
      b.tmap = { 0x9a948a: 'stone', 0xa8a296: 'stone', 0x7a746a: 'stone', 0xe0d4bc: 'plaster', 0x6a4a2a: 'wood', 0x7a5a3a: 'wood' };
      // Hof der Familie Hua: Haus mit geschwungenem Dach, Webstuhl, Pflaumenbaum, Brunnen
      b.box(-34, 0, -21, 8, 3, 5, 0xe0d4bc, { solid: 1 }); const rf = b.cone(-34, 3, -21, 1, 1.8, 0x2a2a30, { lo: 1 }); rf.rotation.y = Math.PI / 4; rf.scale.set(6.6, 1.8, 4.4);
      for (const s of [-1, 1]) { const tip = b.cone(-34 + s * 4.4, 3.1, -18.4, .15, .6, 0x2a2a30); tip.rotation.z = -s * 1; } b.box(-34, 0, -18.45, 1.2, 2, .08, R, { cast: false });
      for (const s of [-1, 1]) b.box(-28 + s * 1, 0, -14, .15, 1.8, 1.6, 0x6a4a2a); b.box(-28, 1.4, -14, 2.2, .12, 1.4, 0x6a4a2a); b.box(-28, .9, -14, 1.6, .5, .05, 0xe0e0f0, { cast: false }); b.addCol(-28, -14, 1.1);
      K.tree(-38, -8, 1, 0x4a3a2a, 0xf0a0c0, { n: 3 }); b.cyl(-26, 0, -9, .9, .8, 0x7a746a, { solid: 1 }); b.box(-26, .8, -9, 2.1, .1, .1, 0x6a4a2a);
      for (const z of [-24, -8]) K.fence(-41, z, -24, z, 0x7a5a3a);
      // Die vier Märkte: Stände nach Ost, West, Süd und Nord, Laternenmast in der Mitte
      b.cyl(14, 0, -28, .15, 5, 0x3a2a1a, { lo: 1, solid: 1 }); for (let i = 0; i < 4; i++) { const a = i * 1.57; b.sph(14 + Math.cos(a) * .9, 4.2, -28 + Math.sin(a) * .9, .32, .42, .32, 0xe84a2a, { mat: { e: 0xc02a10, ei: 1.4 } }); }
      K.stall(31, -28, R, Math.PI / 2, 0xc8a070); K.stall(-3, -28, 0x3a6ac8, -Math.PI / 2, 0x8a5a3a); K.stall(14, -12, 0xd8b040, 0, 0x6a4a2a); K.stall(14, -44, 0x4a8a4a, Math.PI, 0x3a2a1a);
      // Heerlager: Zelte, Banner, Trommel
      for (const [x, z] of [[42, -52], [41, -63], [30, -61]]) { b.box(x, 0, z, 3.6, 1.6, 3, 0xd8ccb0, { solid: 1 }); const tr = b.cone(x, 1.6, z, 1, 1.4, 0xc8bca0, { lo: 1 }); tr.rotation.y = Math.PI / 4; tr.scale.set(2.9, 1.4, 2.5); }
      for (const [x, z] of [[28, -48], [44, -46], [46, -58]]) { b.cyl(x, 0, z, .07, 4.4, 0x3a2a1a, { lo: 1, solid: 1 }); const f = b.box(x + .55, 3.4, z, 1, 1.8, .04, R, { cast: false }); A.sway(f, x); }
      b.cyl(38, .5, -48, .8, 1, 0x8a2a1a, { solid: 1 }); b.cyl(38, 1.5, -48, .82, .06, 0xe8d8c0, { cast: false });
      // Große Mauer mit Torturm (rotes Dach) und Wachtürmen
      const Z = -87; K.wall(-62, Z, -6, Z, 7, 4, S, { cren: 1 }); K.wall(6, Z, 62, Z, 7, 4, S, { cren: 1 });
      b.box(0, 0, Z, 12, 10, 6, 0xa8a296, { solid: 1 }); b.box(0, 0, Z + 3.05, 3.6, 5, .1, 0x2a2420, { cast: false }); b.box(0, 10, Z, 8, 3, 4.6, R);
      const gr = b.cone(0, 13, Z, 1, 2.6, 0x2a2a30, { lo: 1 }); gr.rotation.y = Math.PI / 4; gr.scale.set(7.4, 2.6, 5.2); for (const s of [-1, 1]) { const tip = b.cone(s * 5.2, 13.1, Z + 2.4, .15, .7, 0x2a2a30); tip.rotation.z = -s; }
      for (const x of [-30, 30]) { b.box(x, 0, Z, 6.4, 11, 6.4, S, { solid: 1 }); b.box(x, 11, Z, 7, .8, 7, 0x7a746a); }
      for (const x of [-3.4, 3.4]) { b.cyl(x, 0, Z + 4.4, .08, 4.4, 0x5a4030, { lo: 1, solid: 1 }); const f = b.box(x + .5, 3, Z + 4.4, .9, 1.7, .04, R, { cast: false }); A.sway(f, x); }
      const roof = (x, z, w, d, y, col) => { const r = b.cone(x, y, z, 1, 1.8, col || 0x2a2a30, { lo: 1 }); r.rotation.y = Math.PI / 4; r.scale.set(w * .82, 1.8, d * .82); for (const s of [-1, 1]) { const tip = b.cone(x + s * w * .55, y + .1, z + d * .4, .15, .6, col || 0x2a2a30); tip.rotation.z = -s; } };
      // Gelber Fluss: Lagerfeuer, Zelte am Ufer, Bogenbrücke aus Stein
      A.fire(-40, 12, 1); for (const [x, z] of [[-46, 6], [-34, 4]]) { b.box(x, 0, z, 3, 1.4, 2.6, 0xd8ccb0, { solid: 1 }); roof(x, z, 3.4, 3, 1.4, 0xc8bca0); }
      for (const [x, z, r] of [[-50, 20, .4], [-46, 22, 2.2], [-30, 18, -1]]) { const h = A.creature('reiter', [0x8a5a3a, 0xe8e0d0, 0x3a2a1a][Math.abs(x) % 3], .75); h.children[0] && h.traverse(c => { if (c.isMesh && c.position.y > 1.5) c.visible = false; }); h.position.set(x, b.h(x, z), z); h.rotation.y = r; b.addCol(x, z, .9); }
      // Turm der Nachtwache: hoher Wachturm mit Dach, Gong-Gestell
      b.box(78, 0, -44, 6, 12, 6, 0x9a948a, { solid: 1, tex: 'stone' }); b.box(78, 12, -44, 7, .6, 7, 0x7a746a); for (const [dx, dz] of [[-3, -3], [3, -3], [-3, 3], [3, 3]]) b.box(78 + dx, 12.6, -44 + dz, .4, 2.4, .4, R); roof(78, -44, 7.6, 7.6, 15, 0x2a2a30);
      for (let i = 0; i < 4; i++) b.box(78 + (i % 2 ? 2.2 : -2.2), 13.4, -44, .5, .5, .5, 0xe84a2a, { mat: { e: 0xc02a10, ei: 1.4 }, cast: false });
      // Schwarze Berge jenseits der Mauer: dunkle Felsen, Reiterlager mit Feuern
      K.cliff([[-98, -86, 8, 14], [-100, -112, 9, 16], [-70, -116, 7, 12], [-102, -98, 6, 10], [-66, -104, 5, 8]], 0x2a2a30);
      for (const [x, z] of [[-86, -94], [-78, -106]]) { K.tent(x, z, 2.2, 2.6, 0x3a2e24, { flag: 0x1a1410 }); } A.fire(-82, -100, 1.2);
      // Halle des Lichts: Kaiserhalle auf Terrasse, rote Säulen, goldene Dachkante
      b.box(72, 0, 12, 16, 1.2, 12, 0xd8d0c0, { solid: 1, tex: 'marble' }); b.box(72, 1.2, 9, 12, 5, 6, 0xe0d4bc, { solid: 1 });
      for (let i = 0; i < 6; i++) b.cyl(66.5 + i * 2.2, 1.2, 13, .28, 4.6, R, { solid: 1 }); roof(72, 9, 14, 9, 6.2, 0x2a2a30); b.box(72, 6.1, 13.4, 14, .25, .25, 0xd8b040, { mat: { m: .9, r: .3 } });
      for (const x of [64, 80]) { b.box(x, 1.2, 16, 1, 1.2, 1, 0x9a948a); b.sph(x, 2.8, 16, .55, .5, .55, 0x9a948a); }
      for (let i = 0; i < 6; i++) { const l = b.sph(66 + i * 2.4, 4.6, 16, .3, .4, .3, 0xe84a2a, { mat: { e: 0xc02a10, ei: 1.6 }, cast: false }); A.bob(l, .08, 1 + i * .1); }
      // Karawanenrast: Kamel, Wasserstelle, Lasten
      { const C2 = 0xc8a070; b.sph(40, 1.9, 52, 1.5, .8, .7, C2); for (const dx of [-.5, .55]) b.sph(40 + dx, 2.6, 52, .5, .6, .5, C2); b.cyl(41.5, 2, 52, .2, 1.2, C2); b.sph(41.9, 3.2, 52, .45, .28, .26, C2); b.sph(41.65, 3.25, 52, .12, .2, .1, C2);
        for (const [dx, dz] of [[-.9, -.4], [-.9, .4], [.9, -.4], [.9, .4]]) b.cyl(40 + dx, 0, 52 + dz, .13, 1.6, C2); b.box(40, 2.3, 52, 1.6, .2, 1.5, 0x8a2a1a, { cast: false }); b.addCol(40, 52, 1.6); }
      K.water(46, 46, 2.6, 0x5a8a9a); for (let i = 0; i < 5; i++) b.box(34 + (i % 3) * 1.4, 0, 54 + (i > 2 ? 1.4 : 0), 1.1, .8, .8, [0x8a5a3a, 0xc8a070, 0x6a4a2a][i % 3], { tex: 'wood' }); K.lamp(36, 48, 0xff6a3a);
    },
    nimmerland(b, w, A) {
      const K = kit(b), WD = 0x6a4a2a, DK = 0x2a1e14, h = (x, z) => b.h(x, z);
      b.tmap = { 0x6a4a2a: 'wood', 0x5a3a22: 'wood', 0x8a6a4a: 'wood', 0x7a7470: 'rock', 0xe8dcc0: 'plaster' };
      // Haus unter der Erde: sieben hohle Bäume um den Hängebaum, Peters Hut als Schornstein
      for (let i = 0; i < 7; i++) { const a = i * .9 + .3, x = -24 + Math.cos(a) * 8, z = -58 + Math.sin(a) * 8; K.tree(x, z, 1.25, 0x5a3a22, 0x3a7a3a, { n: 4 }); b.ico(x + Math.cos(a) * .45, .9, z + Math.sin(a) * .45, .3, .55, .1, DK, { cast: false }); }
      b.cyl(-24, 0, -58, 1.3, 4.2, 0x5a3a22, { solid: 1, tex: 'bark' }); for (let i = 0; i < 5; i++) b.ico(-24 + Math.cos(i * 1.3) * 2.2, 5 + (i % 2), -58 + Math.sin(i * 1.3) * 2.2, 2.4, 1.8, 2.4, 0x2a6a2a);
      b.cyl(-19, 0, -54, .26, .7, 0x2a2a1a, { lo: 1 }); b.cyl(-19, .7, -54, .5, .06, 0x3a7a3a, { lo: 1 }); b.box(-18.8, .5, -54, .05, .3, .2, 0xc83a2a, { cast: false }); A.smoke(-19, 1.1, -54);
      // Wendys kleines Haus: von den Jungen gebaut, Johns Zylinder als Schornstein, Rosen an der Wand
      K.house(-6, -30, 5, 4, 2.4, 0xe8dcc0, 0xc85a3a, .2, { beams: 0x8a6a4a }); b.cyl(-5, 3.6, -30.6, .26, .9, 0x1a1a22, { lo: 1 }); b.cyl(-5, 3.6, -30.6, .42, .05, 0x1a1a22, { lo: 1 }); A.smoke(-5, 4.6, -30.6);
      for (let i = 0; i < 6; i++) b.sph(-8.2 + i * .9, .5 + (i % 2) * .3, -27.8, .22, .22, .16, 0xe03a5a, { cast: false });
      // Tigerlilies Lager: Zelte, Totempfahl, Lagerfeuer, Trommeln
      for (const [x, z, c] of [[34, -34, 0xd8c8a0], [46, -36, 0xc8b890], [52, -24, 0xd8c8a0], [36, -18, 0xc8b890], [48, -14, 0xd0c098]]) K.tent(x, z, 2.2, 3.6, c, { flag: 0xc83a2a });
      for (let i = 0; i < 4; i++) b.box(42, i * 1.1, -28, .9, 1.1, .9, [0xc83a2a, 0x2a6ac8, 0xe8c040, 0x3a8a3a][i], { tex: 'wood', solid: i === 0 }); for (const s of [-1, 1]) b.box(42 + s * .9, 3.4, -28, 1, .2, .4, 0xc83a2a);
      A.fire(42, -22, 1.1); for (let i = 0; i < 3; i++) b.cyl(38 + i * 2.5, 0, -40, .45, .8, 0x8a5a3a, { tex: 'wood' });
      // Nixenlagune mit dem Strafenfelsen
      b.ico(-50, .2, -14, 2.2, 2.6, 1.8, 0x7a7470, { solid: 1, tex: 'rock' }); for (const [x, z] of [[-58, -8], [-42, -22], [-56, -22]]) b.ico(x, 0, z, 1.1, .8, 1, 0x7a7470, { tex: 'rock' });
      for (const [x, z, c] of [[-58, -8, 0x3ac8a0], [-42, -22, 0x8a6ae0]]) { b.sph(x, .9, z, .28, .4, .24, 0xf0d0c0, { cast: false }); b.cone(x, .2, z + .1, .32, .7, c, { lo: 1 }); b.glow(c, 2.6, x, 1, z, .6); }
      // Feenhain: Pilzring, schwebende Feenlichter, Glöckchens Laterne
      for (let i = 0; i < 12; i++) { const a = i * .5236, x = -72 + Math.cos(a) * 6, z = -66 + Math.sin(a) * 6; b.cyl(x, 0, z, .14, .6, 0xf0e8d8, { lo: 1 }); b.cone(x, .6, z, .45, .35, [0xe83a5a, 0xf0c040, 0x8a6ae0][i % 3], { lo: 1 }); }
      for (let i = 0; i < 9; i++) { const f = b.sph(-72 + Math.cos(i * 2.1) * 3.5, 1.4 + (i % 3) * .6, -66 + Math.sin(i * 2.1) * 3.5, .09, .09, .09, 0xfff0a0, { mat: { e: 0xffe060, ei: 3 }, cast: false }); A.bob(f, .35, 1.2 + i * .1); }
      b.glow(0xffe8a0, 6, -72, 1.6, -66, .8); b.cyl(-70, 0, -60, .06, 1.6, 0x3a2a1a, { lo: 1 }); b.sph(-70, 1.7, -60, .16, .2, .16, 0xfff0a0, { mat: { e: 0xffe060, ei: 2.6 }, cast: false });
      // Nest des Nimmervogels: schwimmendes Nest mit Vogel
      b.tor(74, .45, -58, 2.4, 0x8a6a3a, { rx: Math.PI / 2, d: 1.4 }); b.cyl(74, 0, -58, 2.2, .3, 0x6a4a2a, { solid: 1 }); A.creature('vogel', 0xe8d8b0, 1.5).position.set(74, .8, -58);
      // Krokodilsumpf: Schilf und ein alter Wecker im Schlamm
      for (let i = 0; i < 26; i++) { const a = i * 2.4, r = 6 + (i % 4); b.cyl(-60 + Math.cos(a) * r, 0, 16 + Math.sin(a) * r, .04, 1.4 + (i % 3) * .4, 0x5a7a3a, { lo: 1, cast: false }); }
      b.cyl(-54, .1, 22, .4, .14, 0xd8b040, { mat: { m: .9, r: .3 } }); b.glow(0xffd060, 2, -54, .4, 22, .5);
      // Kidds Bucht: die Jolly Roger vor Anker (Rumpf begehbar, Masten, Segel, Totenkopfflagge)
      const sx = 30, sz = -94, sy = Math.max(-.4, h(sx, sz)) + .2;
      b.box(sx, sy, sz, 6, 2.2, 15, 0x3a2a1a, { solid: 1, tex: 'wood' }); b.box(sx, sy + 2.2, sz - 5.2, 6, 1.6, 4.6, 0x4a3420, { solid: 1, tex: 'wood' }); b.box(sx, sy, sz + 7.4, 4.2, 2.2, 4.2, 0x3a2a1a, { ry: Math.PI / 4, tex: 'wood' }); b.box(sx, sy + 1.6, sz + 10.2, .25, .25, 3, 0x4a3420);
      for (const s of [-1, 1]) b.box(sx + s * 2.9, sy + 2.2, sz + 1, .2, .7, 10, 0x2a1e14);
      for (const [dz, ht] of [[3, 11], [-2, 13]]) { b.cyl(sx, sy + 2.2, sz + dz, .22, ht, 0x4a3420, { lo: 1 }); for (let k = 0; k < 2; k++) { const sl = b.box(sx, sy + 5 + k * 4, sz + dz, 5 - k * 1.2, 3, .08, 0x1a1a22, { cast: false }); A.sway(sl, dz + k); } }
      b.box(sx, sy + 16, sz - 2, 1.4, .9, .05, 0x0a0a0a, { cast: false }); b.sph(sx, sy + 16.1, sz - 1.97, .22, .22, .02, 0xf0f0e8, { cast: false });
      b.box(sx, sy + 3.8, sz - 6.8, .2, 1, .2, 0x2a1e14); b.tor(sx, sy + 4.6, sz - 6.8, .5, 0x6a4a2a, { d: .1 }); b.glow(0xffb060, 4, sx + 2, sy + 4, sz - 4, .6);
      // Totenschädelfelsen am Rand der Bucht
      b.sph(62, 3, -100, 4, 3.6, 3.4, 0xd8d0c0, { solid: 1, tex: 'rock' }); for (const s of [-1, 1]) b.sph(62 + s * 1.4, 3.6, -96.8, .9, 1, .4, 0x14100c, { cast: false }); b.box(62, 1.6, -96.9, 1.6, .5, .3, 0x14100c, { cast: false });
      // Zweiter Stern rechts: ein heller Stern über der Insel
      const st = b.oct(26, 46, -150, 2.2, 2.2, 2.2, 0xfff4d0, { mat: { e: 0xfff0b0, ei: 3 } }); b.glow(0xfff0c0, 22, 26, 46, -150, .9); A.spin(st, .3);
    },
    wunderland(b, w, A) {
      const K = kit(b), HD = 0x2a6a2a, RD = 0xd82a3a, WT = 0xf4f0e6;
      b.tmap = { 0x6a4a2a: 'wood', 0x5a3a22: 'wood', 0xe8dcc0: 'plaster', 0x7a7470: 'rock' };
      // Kaninchenbau unter einem alten Baum
      K.tree(2, -8, 1.6, 0x5a3a22, 0x3a7a3a, { n: 5 }); b.ico(2, .1, -4.6, 1.6, 1.1, 1.2, 0x14100c, { cast: false }); b.ico(2, .2, -4.2, 2.2, .6, 1.6, 0x6a4a2a, { cast: false });
      // Verrückte Teegesellschaft: langer Tisch, Stühle, Teekannen, Tassen, der große Sessel
      b.box(-34, 0, -30, 12, .9, 2.2, 0xf4f0e6, { solid: 1 }); b.box(-34, .9, -30, 12.2, .06, 2.4, 0xe8e0f0, { cast: false });
      for (let i = 0; i < 9; i++) { const x = -39.5 + i * 1.35; b.box(x, 0, -31.8 - (i % 2) * .2, .6, .55, .6, [0xc83a5a, 0x3a8a5a, 0x5a5ac8][i % 3]); b.box(x, .55, -32.1, .6, .9, .1, [0xc83a5a, 0x3a8a5a, 0x5a5ac8][i % 3]); }
      for (let i = 0; i < 7; i++) { const x = -39 + i * 1.7; b.cyl(x, .95, -30, .14, .12, WT, { mat: { r: .3 } }); if (i % 3 === 0) { b.sph(x + .6, 1.15, -29.6, .3, .26, .3, [0xe8c040, 0x5ac8c8, 0xd8a0e0][i % 3], { mat: { r: .3 } }); b.cone(x + .95, 1.2, -29.6, .06, .3, 0xe8c040, { lo: 1 }); } }
      b.box(-26, 0, -30, 1.4, 1.2, 1.4, 0x8a2a4a); b.box(-26, 1.2, -30.6, 1.4, 1.6, .25, 0x8a2a4a); b.cyl(-34, 2.2, -27, .4, .5, 0x2a2a2a, { lo: 1 }); b.cyl(-34, 2.2, -27, .65, .05, 0x2a2a2a, { lo: 1 });
      K.lamp(-42, -24, 0xffd8a0); K.lamp(-26, -24, 0xffd8a0);
      // Pilz der Raupe und weitere Riesenpilze
      for (const [x, z, s, c] of [[30, -26, 2.2, 0x8a6ae0], [38, -18, 1.4, 0xe83a5a], [22, -34, 1.2, 0xf0c040], [40, -32, 1.6, 0x5ac8a0], [-14, -46, 1.5, 0xe83a5a], [48, -46, 1.8, 0x8a6ae0]]) { b.cyl(x, 0, z, .45 * s, 2.2 * s, 0xf0e8d8, { solid: 1 }); b.sph(x, 2.2 * s, z, 1.8 * s, .7 * s, 1.8 * s, c, { mat: { r: .6 } }); for (let i = 0; i < 5; i++) b.sph(x + Math.cos(i * 1.3) * s, 2.55 * s, z + Math.sin(i * 1.3) * s, .25 * s, .12 * s, .25 * s, WT, { cast: false }); }
      b.cyl(31, 4.9, -26, .04, .6, 0x8a6a4a, { lo: 1 }); A.smoke(31, 5.6, -26);
      // Haus der Herzogin mit Pfefferrauch
      K.house(-62, -66, 7, 5.4, 3.2, 0xe8dcc0, 0x6a4a8a, .4, { beams: 0x5a3a22, chimney: 1 }); A.smoke(-60, 6, -67); A.smoke(-59, 6.2, -66);
      // Rosengarten: Hecken, Bögen, Brunnen
      for (const [x0, z0, x1, z1] of [[10, -50, 10, -74], [38, -50, 38, -74], [10, -74, 20, -74], [28, -74, 38, -74]]) { const L = Math.hypot(x1 - x0, z1 - z0), ry = Math.atan2(x1 - x0, z1 - z0) + Math.PI / 2; b.box((x0 + x1) / 2, 0, (z0 + z1) / 2, L, 1.8, 1.2, HD, { ry, solid: 1, tex: 'grass', to: { s: .6 } }); }
      for (const z of [-56, -66]) b.tor(24, 2, z, 1.8, HD, { d: .5, rx: 0 }); b.cyl(24, 0, -62, 1.6, .6, 0xd8d0c8, { solid: 1, tex: 'marble' }); b.cyl(24, .6, -62, .2, 1.2, 0xd8d0c8); b.sph(24, 1.9, -62, .5, .3, .5, RD, { mat: { e: 0xa01020, ei: .6 } });
      // Krocketplatz: Torbögen, Igel-Bälle, Zielstab
      for (let i = 0; i < 6; i++) { const x = 50 + (i % 3) * 7, z = -74 - (i > 2 ? 10 : 0); b.tor(x, 0, z, .7, WT, { d: .08, rx: 0 }); b.sph(x + 1.2, .25, z + 1, .3, .26, .3, 0x6a5a4a, { mat: { r: 1 } }); }
      b.cyl(66, 0, -80, .07, 1.4, WT, { lo: 1 }); for (let i = 0; i < 4; i++) b.cyl(66, .3 + i * .28, -80, .09, .08, [RD, 0x2a6ac8, 0xe8c040, 0x2a8a3a][i], { lo: 1 });
      // Hinter den Spiegeln: Schachbrett mit Riesenfiguren und Spiegelrahmen
      for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) b.box(-40 + i * 2.6, 0, -102 + j * 2.6, 2.6, .06, 2.6, (i + j) % 2 ? 0xf0ece0 : 0x2a2a30, { cast: false, mat: { r: .3 } });
      for (const [x, z, c, k] of [[-37.4, -99.4, 0xf0ece0, 'k'], [-22, -86, 0x2a2a30, 'q'], [-32, -94, 0xc82a2a, 'k'], [-27, -99, 0xf0ece0, 'p'], [-35, -89, 0x2a2a30, 'p']]) { b.cyl(x, 0, z, .8, .5, c, { solid: 1 }); b.cyl(x, .5, z, .45, k === 'p' ? 1 : 2.2, c); b.sph(x, k === 'p' ? 1.7 : 2.9, z, .45, .45, .45, c); if (k !== 'p') b.cone(x, 3.2, z, .3, .5, c, { lo: 1 }); }
      b.box(-44, 0, -84, 3, 4.4, .3, 0xd8b040, { solid: 1, mat: { m: .9, r: .3 } }); b.box(-44, .3, -83.82, 2.4, 3.8, .04, 0xd8e8ff, { cast: false, mat: { m: 1, r: .05 } }); b.glow(0xd8e8ff, 3, -44, 2.2, -83.5, .5);
      // Das Herzschloss: Kartenhaus-Burg in Rot und Weiß mit Herzen
      for (const x of [-10, 14]) { K.tower(x, -106, 2.4, 9, WT, RD, 4, { tex: 'plaster' }); b.sph(x - .3, 9.4, -103.5, .5, .5, .25, RD, { cast: false }); b.sph(x + .3, 9.4, -103.5, .5, .5, .25, RD, { cast: false }); }
      K.wall(-8, -106, 12, -106, 6.5, 2, WT, { cren: 1, tex: 'plaster' }); b.box(2, 0, -104.9, 4, 4.4, .1, RD, { cast: false }); for (let i = 0; i < 5; i++) b.box(-6 + i * 4, 6.6, -104.7, 1.4, 2, .1, i % 2 ? RD : 0x1a1a2a, { cast: false });
      // verstreute Riesenkarten im Gras
      for (let i = 0; i < 10; i++) { const a = i * 2.3, x = Math.cos(a) * (30 + i * 4), z = -40 + Math.sin(a) * 34; const c = b.box(x, 0, z, 1.6, 2.4, .08, WT, { ry: a, cast: false }); c.rotation.z = .25 * Math.sin(i); b.sph(x, 1.25, z, .2, .2, .1, i % 2 ? RD : 0x1a1a2a, { cast: false }); }
    },
    pinocchio(b, w, A) {
      const K = kit(b), WD = 0x8a5a3a, h = (x, z) => b.h(x, z);
      b.tmap = { 0x8a5a3a: 'wood', 0x6a4a2a: 'wood', 0xe8d8b8: 'plaster', 0xd8c8a0: 'plaster', 0x8a8478: 'stone' };
      // Geppettos Werkstatt: Häuschen, Hobelbank, Holzscheite, Puppen an der Wand, gemalter Kamin
      K.house(-6, -24, 7, 5.4, 3.2, 0xe8d8b8, 0xb85a3a, .15, { beams: 0x6a4a2a, chimney: 1 }); A.smoke(-4, 6, -24.6);
      b.box(-2, 0, -19.6, 2.4, .9, .9, WD, { solid: 1 }); for (let i = 0; i < 5; i++) b.cyl(-11 + (i % 3) * .5, .2 + (i > 2 ? .4 : 0), -19.6, .2, .9, 0xa07a4a, { tex: 'wood' }).rotation.z = 1.5708;
      for (const x of [-8.6, -7.4]) { const P = A.creature('marionette', 0xd8a060, .55); P.position.set(x, 1.3, -20.9); }
      // Marionettentheater: Bühne, rote Vorhänge, Bänke, Laternen
      b.box(34, 0, -36, 12, 1.2, 5, WD, { solid: 1, tex: 'wood' }); for (const s of [-1, 1]) { b.box(34 + s * 6.2, 0, -34, .5, 6, .5, 0xd8b040, { solid: 1, mat: { m: .7, r: .4 } }); const c = b.box(34 + s * 4.4, 1.2, -33.8, 3.2, 4.6, .15, 0xb81a2a, { cast: false }); A.sway(c, s); }
      b.box(34, 5.8, -34, 13, 1.2, .4, 0xb81a2a); b.box(34, 6.4, -33.7, 4, .8, .05, 0xd8b040, { cast: false });
      for (let r = 0; r < 3; r++) b.box(34, 0, -27 + r * 2.2, 9, .5, .5, 0x6a4a2a, { tex: 'wood' }); K.lamp(26, -26); K.lamp(42, -26);
      // Gasthaus zum Roten Krebs mit Schild
      K.house(-40, -42, 8, 6, 3.4, 0xd8c8a0, 0x8a4a2a, -.3, { beams: 0x5a3a22, chimney: 1 }); b.cyl(-35, 0, -37, .08, 3, 0x3a2a1a, { lo: 1 }); b.box(-34.4, 2.6, -37, 1.1, .7, .06, 0xf0e0c0, { cast: false }); b.sph(-34.4, 2.6, -36.95, .28, .18, .04, 0xd82a1a, { cast: false });
      // Wunderfeld: Ackerfurchen, ein falscher „Goldbaum“, Vogelscheuche
      for (let i = 0; i < 7; i++) b.box(-66, .02, -80 + i * 2.2, 18, .18, .5, 0x6a4a2a, { cast: false }); K.tree(-56, -86, .9, 0x5a3a22, 0x8a8a3a, { fruit: 0xd8b040, n: 3, glowF: 1.2 });
      b.cyl(-80, 0, -70, .07, 2.2, 0x6a4a2a, { lo: 1 }); b.box(-80, 1.7, -70, 1.6, .1, .1, 0x6a4a2a); b.sph(-80, 2.3, -70, .25, .25, .25, 0xd8c070); b.cone(-80, 2.45, -70, .35, .3, 0x6a5a3a, { lo: 1 });
      // Haus der Fee: weißes Häuschen mit türkisblauem Licht
      K.house(20, -72, 6, 5, 3, 0xf4f0ec, 0x3ab8c8, 0, {}); b.glow(0x6ae8f0, 6, 20, 2.4, -69, .7); for (let i = 0; i < 6; i++) { const f = b.sph(20 + Math.cos(i) * 4, 1.6 + (i % 2) * .5, -72 + Math.sin(i) * 4, .08, .08, .08, 0x9af0ff, { mat: { e: 0x6ae8f0, ei: 3 }, cast: false }); A.bob(f, .3, 1.1 + i * .1); }
      // Spielzeugland: bunte Bögen, Karussell, Riesenkreisel
      for (let i = 0; i < 4; i++) b.tor(56 + i * 3.4, 0, -60 - i * 2, 2.2, [0xe83a5a, 0xf0c040, 0x3ab8e8, 0x6ac84a][i], { d: .3, rx: 0, ry: .5 });
      { const car = b.cyl(68, 0, -72, 3.6, .4, 0xf0c040, { solid: 1 }); b.cyl(68, .4, -72, .25, 3.4, 0xe8e0d0); b.cone(68, 3.8, -72, 4, 1.6, 0xe83a5a, { lo: 1 }); for (let i = 0; i < 6; i++) { const a = i * 1.047; b.cyl(68 + Math.cos(a) * 2.8, .4, -72 + Math.sin(a) * 2.8, .05, 3.4, 0xd8b040, { lo: 1 }); b.box(68 + Math.cos(a) * 2.8, 1.2, -72 + Math.sin(a) * 2.8, .4, .5, .9, [0xf4f0e6, 0x8a6a4a][i % 2], { ry: -a }); } }
      b.cone(76, 0, -60, 1.2, 2.2, 0x3ab8e8, { lo: 1 }); b.cone(76, 2.2, -60, 1.2, .8, 0xe83a5a, { lo: 1 });
      // Strand mit Steg, Fischerboot und Leuchtturm
      b.box(0, -.1, -104, 2, .2, 9, WD, { tex: 'wood' }); for (let i = 0; i < 4; i++) b.cyl(-.8 + (i % 2) * 1.6, -1, -100 - (i > 1 ? 6 : 0), .12, 1.4, 0x5a3a22, { lo: 1 });
      b.box(-12, 0, -102, 1.4, .6, 3.4, 0x8a5a3a, { tex: 'wood' }); K.tower(-48, -96, 1.8, 9, 0xf0ece4, 0xc83a2a, 2.4, { tex: 'plaster', win: 0xffd060 }); b.glow(0xffe0a0, 8, -48, 9.6, -96, .8);
      // Bucht des Riesenhais: gewaltiger Kopf mit Zähnen, der aus dem Wasser ragt
      { const X = 30, Z = -118, Y = Math.min(-.4, h(X, Z)); b.sph(X, Y, Z, 6, 3.4, 7, 0x4a5a6a, { mat: { r: .5 } }); b.sph(X, Y + .1, Z + 6.3, 3.6, 1.3, 1.2, 0x14141a, { cast: false }); for (let i = 0; i < 9; i++) b.cone(X - 3.4 + i * .85, Y + .9, Z + 6.6, .18, .6, 0xf4f0e6, { lo: 1 }).rotation.x = Math.PI;
        for (const s of [-1, 1]) b.sph(X + s * 3.4, Y + 2.2, Z + 4.6, .45, .45, .3, 0xf0f0e8, { cast: false }); b.cone(X, Y + 3, Z - 4, .5, 3.4, 0x4a5a6a, { lo: 1 }); }
    },
    aladdin(b, w, A) {
      const K = kit(b), WL = 0xf0e4c8, SA = 0xe0c898, GD = 0xd8a020, TQ = 0x2ab0b0;
      b.tmap = { 0xc8b088: 'stone', 0x6a4a2a: 'wood', 0x7a5a3a: 'wood' }; const P = { tex: 'plaster', to: { s: .45, gain: 1.7, n: .6, e: 0x4a3a28, ei: 1 } };
      const flat = (x, z, w2, d, h, col, dome) => { b.box(x, 0, z, w2, h, d, col, { solid: 1, ...P }); for (const s of [-1, 1]) { b.box(x, h, z + s * d / 2, w2, .45, .25, col); b.box(x + s * w2 / 2, h, z, .25, .45, d, col); }
        b.box(x, 1, z + d / 2 + .03, 1.1, 2, .06, 0x5a3a22, { cast: false }); for (const sx of [-w2 * .3, w2 * .3]) b.box(x + sx, h * .6, z + d / 2 + .04, .7, .9, .05, 0xffd890, { mat: { e: 0xffb040, ei: 1.2 }, cast: false });
        if (dome) { b.sph(x, h, z, dome, dome * .9, dome, dome > 2 ? GD : TQ, { mat: { m: .6, r: .35 } }); b.cone(x, h + dome * .85, z, .12, 1, GD, { lo: 1 }); } };
      const minaret = (x, z, hh) => { b.cyl(x, 0, z, .9, hh, WL, { solid: 1, ...P }); b.cyl(x, hh * .7, z, 1.25, .35, SA); b.cyl(x, hh, z, .7, 1.6, WL); b.sph(x, hh + 1.6, z, .75, .8, .75, GD, { mat: { m: .7, r: .3 } }); b.cone(x, hh + 2.3, z, .08, 1, GD, { lo: 1 }); };
      // Der große Basar: Stände mit Seide, Gewürzen und Lampen, Sonnensegel, Teppiche
      const cl = [0xc83a3a, 0x2a8ac8, 0xd8a020, 0x8a3ab0, 0x3aa86a, 0xe86a2a];
      for (let i = 0; i < 8; i++) { const a = i * .785 + .3, x = -6 + Math.cos(a) * 12, z = -26 + Math.sin(a) * 12; K.stall(x, z, cl[i % 6], -a + 1.5708, [0xd8a020, 0xc84a1a, 0x8a3a1a, 0xe8d8b0][i % 4]); }
      for (let i = 0; i < 3; i++) { const c = b.box(-6 + (i - 1) * 5, 4.2, -26, 4.6, .06, 6, cl[(i + 2) % 6], { cast: false }); A.sway(c, i); } for (const x of [-16, 4]) for (const z of [-30, -22]) b.cyl(x, 0, z, .12, 4.4, 0x6a4a2a, { lo: 1 });
      for (let i = 0; i < 3; i++) b.box(-10 + i * 4, .02, -19, 2.4, .04, 1.6, [0xb81a2a, 0x2a4a9a, 0xd8a020][i], { cast: false });
      for (let i = 0; i < 6; i++) { const l = b.sph(-14 + i * 3.4, 3.6, -30, .2, .16, .14, GD, { mat: { m: .9, r: .3, e: 0xffa020, ei: .6 }, cast: false }); A.bob(l, .06, 1.4 + i * .2); }
      // Aladdins Elternhaus: Flachdach mit Brüstung (erkletterbar), Spinnrad, Krüge
      flat(-40, -18, 7, 6, 3.4, SA); b.cyl(-36, 0, -14, .5, .9, 0xb86a3a, {}); b.cyl(-35, 0, -14.6, .35, .7, 0xa05a2a, {}); b.tor(-43, .7, -14.4, .45, 0x6a4a2a, { d: .06, rx: 0 });
      flat(-30, -10, 5, 5, 2.8, WL); flat(-48, -28, 6, 5, 3, WL, 1.4);
      // Palast des Sultans: Hauptbau, goldene Hauptkuppel, Nebenkuppeln, vier Minarette, Juwelenfenster
      b.box(6, 0, -101, 26, 8, 9, WL, { solid: 1, ...P }); b.box(6, 0, -96.2, 8, 6, .6, WL); b.box(6, 0, -95.8, 4, 4.4, .1, 0x3a2410, { cast: false });
      b.sph(6, 8, -101, 5, 5.2, 5, GD, { mat: { m: .75, r: .25 } }); b.cone(6, 12.8, -101, .2, 2.4, GD, { lo: 1 }); b.sph(6, 15.4, -101, .4, .4, .4, GD, { mat: { m: .9, e: 0xffc040, ei: .8 } });
      for (const sx of [-1, 1]) { b.sph(6 + sx * 9, 8, -101, 2.4, 2.4, 2.4, TQ, { mat: { m: .4, r: .3 } }); b.cone(6 + sx * 9, 10.3, -101, .1, 1, GD, { lo: 1 }); minaret(6 + sx * 14, -96.5, 13); minaret(6 + sx * 14, -105.5, 13); }
      for (let i = 0; i < 12; i++) { const c = [0xd81a3a, 0x2ac86a, 0x3a6ad8, 0xf4f0f8][i % 4], x = -5 + i * 2 + (i > 5 ? 2 : 0); b.box(x, 7, -96.45, .9, 1.2, .08, c, { mat: { e: c, ei: i === 11 ? .1 : 1.4 }, cast: false }); }
      for (let i = 0; i < 6; i++) b.cyl(-6 + i * 4.8, 0, -92, .28, 3.6, WL, { solid: 1 }); K.lamp(-8, -88, 0xffc060); K.lamp(20, -84, 0xffc060);
      // Die Schatzhöhle: Felsen im Halbkreis, Treppe, Bäume mit Früchten aus Edelsteinen
      for (let i = 0; i < 7; i++) { const a = 2.2 + i * .36, r = 20 + (i % 2) * 1.5; b.ico(-64 + Math.cos(a) * r, 2.2, -72 + Math.sin(a) * r, 3.4, 4.6, 3, 0xa07a50, { solid: 1 }); }
      for (let i = 0; i < 4; i++) b.box(-50 + i * .9, i * .3, -80, 1, .3, 3, 0xc8b088, { tex: 'stone' });
      for (const [x, z, f] of [[-68, -66, 0xd81a3a], [-60, -78, 0x2ac86a], [-72, -80, 0x3a6ad8], [-62, -64, 0xf4f0f8]]) K.tree(x, z, .8, 0x6a5a4a, 0x4a8a5a, { fruit: f, n: 3, glowF: 1.6 });
      b.glow(0xffd860, 10, -64, 2, -72, .3);
      // Die Oase: Palmen, Sitzkissen, Krüge am Wasser
      for (let i = 0; i < 6; i++) { const a = i * 1.047 + .4, x = 46 + Math.cos(a) * 9, z = -24 + Math.sin(a) * 9; b.cyl(x, 0, z, .25, 5, 0x8a6a3a, { tex: 'bark' }); for (let k = 0; k < 5; k++) { const l = b.box(x + Math.cos(k * 1.26) * 1.2, 5, z + Math.sin(k * 1.26) * 1.2, 2.6, .08, .7, 0x3a8a3a, { ry: -k * 1.26 }); l.rotation.z = -.3; A.sway(l, k); } }
      for (let i = 0; i < 3; i++) b.box(38 + i * 1.4, .1, -15, 1, .3, 1, cl[i], { cast: false });
      // Lager des Zauberers: violettes Zelt, Sternenglobus, Fernrohr, Lampenkarren
      K.tent(70, -76, 4, 4.6, 0x4a2a6a, { flag: 0xd8a020 }); b.glow(0x9a6aff, 6, 70, 2, -72, .5);
      { const gl = b.sph(64, 1.6, -70, .7, .7, .7, 0x1a1a3a, { mat: { e: 0x4a3aa8, ei: 1.2, m: .3 } }); A.spin(gl, .4); b.cyl(64, 0, -70, .1, 1, GD, { lo: 1 }); }
      { const t = b.cyl(75, 1.4, -70, .12, 1.8, GD, { lo: 1, mat: { m: .9 } }); t.rotation.z = .9; b.cyl(75, 0, -70, .05, 1.4, 0x3a2a1a, { lo: 1 }); }
      b.box(60, 0, -84, 3, .9, 1.6, 0x6a4a2a, { solid: 1 }); for (let i = 0; i < 5; i++) b.sph(59 + i * .5, 1.1, -84, .2, .14, .14, 0xd8a040, { mat: { m: .9, r: .3 }, cast: false });
      // Das Badehaus: Kuppel mit Lichtlöchern, Dampf
      flat(-36, -50, 8, 7, 3.2, WL, 2.6); for (let i = 0; i < 5; i++) b.sph(-36 + Math.cos(i * 1.26) * 1.6, 5.4, -50 + Math.sin(i * 1.26) * 1.6, .16, .1, .16, 0xfff0c0, { mat: { e: 0xffe080, ei: 2 }, cast: false }); A.smoke(-36, 6.4, -50);
      // Karawanserei: Hof mit Mauern und Tor, Säcke, Kisten
      K.wall(26, -66, 42, -66, 3.4, 1, 0xc8b088); K.wall(26, -66, 26, -52, 3.4, 1, 0xc8b088); K.wall(42, -66, 42, -52, 3.4, 1, 0xc8b088); K.wall(26, -52, 31.5, -52, 3.4, 1, 0xc8b088); K.wall(36.5, -52, 42, -52, 3.4, 1, 0xc8b088); K.arch(34, -52, 4.4, 4, 0xc8b088, 0, .9);
      for (let i = 0; i < 6; i++) b.sph(29 + (i % 3) * 1.1, .45, -63 + (i > 2 ? 1 : 0), .5, .45, .45, 0xc8a878, { mat: { r: 1 } }); b.box(37, 0, -57, 1.4, 1.2, 1.4, 0x7a5a3a, { solid: 1 }); b.box(38.4, 0, -55.6, 1, .9, 1, 0x7a5a3a);
      // Stadthäuser mit Kuppeln rund um die Gassen
      for (const [x, z, w2, d, hh, dm] of [[-22, -40, 6, 6, 3.6, 1.6], [10, -46, 6, 5, 3.2, 0], [18, -22, 7, 6, 4, 1.8], [-26, -66, 6, 6, 3.4, 0], [16, -70, 7, 5, 3.6, 1.6], [-14, -78, 6, 6, 3, 0]]) flat(x, z, w2, d, hh, [WL, SA][(x + z) & 1], dm);
      minaret(-18, -10, 11);
    },
    kurbelhafen(b, w, A) {
      const K = kit(b), WH = 0xe8e8e8, GR = 0x8a8a8a, BK = 0x1e1e1e, P = { tex: 'plaster', to: { s: .45, gain: 1.7, n: .6, e: 0x3a3a3a, ei: 1 } };
      b.tmap = { 0x5a5a5a: 'wood', 0x6a6a6a: 'wood', 0x7a7a7a: 'stone' };
      // Raddampfer „Tuut-Tuut“ im Hafenbecken: Rumpf, Kajüte, zwei Schornsteine mit Rauch, drehende Schaufelräder
      b.box(58, -.9, -30, 16.4, .9, 6.2, BK); b.box(58, 0, -30, 16, 1.7, 6, WH, P); b.box(58, 1.7, -30, 9, 2.2, 4.4, WH, P); b.box(58, 3.9, -30, 10, .16, 5, BK);
      for (let i = 0; i < 5; i++) b.box(54.6 + i * 1.7, 2.6, -27.75, .8, .8, .05, 0xfff8e0, { mat: { e: 0xfff0c0, ei: 1.2 }, cast: false });
      for (const x of [56, 60]) { b.cyl(x, 4, -30, .55, 3.6, BK); b.cyl(x, 6.9, -30, .62, .35, WH); A.smoke(x, 7.8, -30); }
      for (const z of [-33.4, -26.6]) { const wh = b.tor(58, 1.2, z, 2, BK, { d: .5 }); A.spin(wh, 1.4); const hub = b.tor(58, 1.2, z, 1.1, GR, { d: .4 }); A.spin(hub, 1.4); }
      // Kai mit Pollern, Kran mit schaukelnder Kiste, Kistenstapel
      b.box(43.6, -.2, -30, 3, .5, 26, 0x7a7a7a); for (let i = 0; i < 5; i++) b.cyl(44.6, .3, -42 + i * 6, .25, .7, BK, { lo: 1 });
      b.box(38, 0, -14, 1, 9, 1, 0x3a3a3a, { solid: 1 }); b.box(41.5, 9, -14, 8, .5, .5, 0x3a3a3a); b.cyl(45, 5, -14, .04, 4, BK, { lo: 1 }); { const c = b.box(45, 4, -14, 1.2, 1, 1.2, 0x6a6a6a); A.bob(c, .25, 1.3); }
      for (const [x, y] of [[48, 0], [49.3, 0], [48.6, 1]]) b.box(x, y, -12, 1.2, 1, 1.2, 0x6a6a6a, { solid: y === 0 ? 1 : 0 });
      // Lagerhaus mit Fässern
      K.house(-34, -25, 10, 6, 4.4, 0x9a9a9a, 0x2a2a2a, 0, { beams: 0x4a4a4a }); for (const [x, z] of [[-40.5, -21], [-41.4, -22.2], [-27.4, -21]]) b.cyl(x, 0, z, .5, 1.1, 0x5a5a5a, { tex: 'wood' });
      // Hauptstraße: Häuser, die im Takt wippen, Laternen
      for (const [x, z, ww, d, hh, i] of [[-12, -34, 6, 5, 3.8, 0], [20, -30, 6, 6, 4.2, 1], [-14, -46, 6, 5, 3.6, 2], [20, -46, 6, 5, 4, 3]]) { const H = K.house(x, z, ww, d, hh, [WH, 0xd0d0d0][i % 2], [BK, 0x4a4a4a][i % 2], 0, { beams: 0x3a3a3a, chimney: i % 2 }); A.bob(H.g, .06, 3.2 + i * .3); }
      for (const [x, z] of [[-4, -26], [12, -38], [-4, -52], [12, -60], [30, -24]]) K.lamp(x, z, 0xffffff);
      // Musikhalle: Bühne, Rückwand, Riesengrammofon, Tuba
      b.box(-12, 0, -82, 12, 1.2, 6, 0x5a5a5a, { solid: 1 }); b.box(-12, 0, -85.4, 13, 7, .6, WH, { solid: 1, ...P }); b.box(-12, 7, -85.4, 13.6, .8, .9, BK);
      for (const s of [-1, 1]) { b.cyl(-12 + s * 6.2, 0, -79.4, .35, 6.4, WH, { solid: 1 }); const c = b.box(-12 + s * 5, 1.2, -79.2, 2.6, 5.2, .12, 0x2a2a2a, { cast: false }); A.sway(c, s); }
      b.box(-6, 1.2, -83, 2, 1.4, 2, 0x3a3a3a); { const hn = b.cone(-6, 2.6, -82, 2.4, 3.2, 0xd8d8d8, { mat: { m: .7, r: .3 } }); hn.rotation.x = -Math.PI / 2; hn.position.set(-6, 4.4, -81.4); A.bob(hn, .08, 2.6); }
      { const t = b.tor(-17, 3, -83, .9, 0xc8c8c8, { d: .4, mat: { m: .9, r: .25 } }); A.bob(t, .1, 2); } for (let i = 0; i < 5; i++) { const n = b.box(-14 + i * 1.6, 5 + (i % 2) * .6, -80, .3, .5, .05, BK, { cast: false }); A.bob(n, .4, 1.6 + i * .3); }
      // Windmühle mit drehenden Flügeln
      b.cyl(-64, 0, -68, 2.2, 8, WH, { solid: 1, ...P }); b.cone(-64, 8, -68, 2.6, 2.4, 0x3a3a3a);
      { const bl = new T.Group(); for (let k = 0; k < 4; k++) { const pv = new T.Group(); pv.rotation.z = k * Math.PI / 2; pv.add(mk(G.box, M(0xe8e8e8), 0, 2.6, 0, .9, 5, .08)); pv.add(mk(G.box, M(0x3a3a3a), .5, 2.6, 0, .06, 5, .1, false)); bl.add(pv); }
        bl.position.set(-64, 6.6, -65.6); b.g.add(bl); A.spin(bl, .9); b.box(-64, 6.3, -65.8, .6, .6, .6, BK); }
      for (let i = 0; i < 4; i++) b.box(-68 + i * 1.3, 0, -61, .9, .7, .9, 0xd8d8d8);
      // Scheune mit Heuballen und Zaun
      K.house(62, -86, 10, 8, 4.6, 0x6a6a6a, 0x2a2a2a, 0, { beams: 0x3a3a3a }); for (const [x, z] of [[56, -76], [58, -77.6], [60, -75.6]]) b.cyl(x, 0, z, .8, 1, 0xb8b8b8, {}); K.fence(54, -70, 70, -70, 0x5a5a5a);
      // Filmpalast: Fassade, Leuchtschrift-Rahmen mit Glühbirnen, große Filmspule, Säulen
      b.box(18, 0, -105, 16, 8, 8, WH, { solid: 1, ...P }); b.box(18, 8, -105, 16.6, .6, 8.6, BK); b.box(18, 5.6, -100.9, 10, 2, .5, BK);
      for (let i = 0; i < 12; i++) b.sph(13.4 + i * .84, 6.7, -100.6, .12, .12, .08, 0xffffff, { mat: { e: 0xffffff, ei: 2.4 }, cast: false }); b.box(18, 0, -100.9, 3, 4, .1, 0x2a2a2a, { cast: false });
      for (const x of [11, 25]) b.cyl(x, 0, -100.4, .4, 5.6, 0xd0d0d0, { solid: 1 }); { const r = b.tor(18, 11, -105, 2.4, 0x2a2a2a, { d: .4 }); A.spin(r, .6); const r2 = b.tor(18, 11, -105, 1, 0x6a6a6a, { d: .4 }); A.spin(r2, .6); }
      // Radier-Lücke: weiße, leere Flecken, halb ausradierte Bäume, Radierkrümel
      for (const [x, z, r] of [[-40, -100, 6], [-48, -94, 3.4], [-32, -106, 3], [-46, -108, 2.4]]) b.cyl(x, .02, z, r, .05, 0xffffff, { mat: { e: 0xffffff, ei: .7 }, cast: false });
      for (const [x, z] of [[-44, -102], [-36, -98]]) { b.cyl(x, 0, z, .25, 1.4, 0x5a5a5a); b.ico(x, 1.9, z, .9, .5, .9, 0x6a6a6a); }
      for (let i = 0; i < 10; i++) b.box(-40 + Math.cos(i * 2.3) * 5, .05, -100 + Math.sin(i * 1.7) * 5, .3, .12, .16, 0xc8c8c8, { cast: false, ry: i });
      b.glow(0xffffff, 10, -40, 1.5, -100, .35);
    },
    camelot(b, w, A) {
      const K = kit(b), S = 0xeae6de, B2 = 0x3a5aa8;
      b.tmap = { 0xeae6de: 'stone', 0xd8d0c0: 'plaster', 0x6a4a2a: 'wood', 0x5a3a22: 'wood', 0x8a8a8e: 'rock', 0x8a8a90: 'rock', 0x8a6a3a: 'wood' };
      // Burg Camelot: Ringmauer mit Torhaus, Ecktürme, Bergfried mit Bannern
      const Z = -80; K.wall(-20, Z, -4.5, Z, 8, 2.4, S, { cren: 1 }); K.wall(4.5, Z, 20, Z, 8, 2.4, S, { cren: 1 });
      for (const x of [-4, 4]) K.tower(x, Z + .4, 2.3, 11, S, B2, 4.6, { crown: 1 }); for (const x of [-20, 20]) K.tower(x, Z, 3, 13, S, B2, 6);
      b.box(0, 0, Z + 1.25, 3.4, 5, .1, 0x3a2a1a, { cast: false }); b.box(0, 6, Z, 5.6, 1.4, 2.6, S);
      b.box(0, 0, -90, 12, 16, 8, S, { solid: 1 }); for (const x of [-6, 6]) K.tower(x, -90, 2, 20, S, B2, 5);
      for (const x of [-6, 6]) { b.cyl(x, 25, -90, .06, 2.4, 0x5a4030, { lo: 1 }); const f = b.box(x + .5, 26.2, -90, 1, .6, .04, 0xd8b030, { cast: false }); A.sway(f, x); }
      // Tafelrunde: offene Halle mit Säulen, runder Tisch, zwölf Stühle
      for (let i = 0; i < 8; i++) { const a = i * .785; b.cyl(-14 + Math.cos(a) * 4.6, 0, -64 + Math.sin(a) * 4.6, .3, 3.6, S, { solid: 1 }); } b.cone(-14, 3.6, -64, 5.4, 2.6, B2, {});
      b.cyl(-14, 0, -64, 2.4, .9, 0x6a4a2a, { solid: 1 }); for (let i = 0; i < 12; i++) { const a = i * .5236; b.box(-14 + Math.cos(a) * 3, 0, -64 + Math.sin(a) * 3, .5, 1.2, .5, 0x5a3a22, { ry: -a }); }
      // Kirchhof mit Kapelle und dem Schwert im Stein
      b.box(19, 0, -51, 6, 5, 9, 0xd8d0c0, { solid: 1 }); const cr = b.cone(19, 5, -51, 1, 2.6, 0x4a4a5a, { lo: 1 }); cr.rotation.y = Math.PI / 4; cr.scale.set(4.4, 2.6, 6.6); b.box(19, 7.4, -47, 1, 2, 1, 0xd8d0c0);
      for (let i = 0; i < 7; i++) b.box(4 + (i % 4) * 2.4, 0, -50 - (i > 3 ? 3 : 0), .7, 1 + (i % 2) * .3, .2, 0x8a8a8e);
      b.ico(12, .6, -40, 1.6, 1.1, 1.4, 0x8a8a90, { solid: 1, mat: { r: 1 } }); b.box(12, 1.3, -40, .9, .5, .6, 0x4a4a52, { mat: { m: .7 } });
      const sw = b.box(12, 1.8, -40, .12, 1.6, .04, 0xd8e0ea, { mat: { m: .95, r: .15 } }); b.box(12, 2.6, -40, .7, .1, .1, 0xd8b030, { mat: { m: .9, r: .3 } }); b.box(12, 2.75, -40, .07, .4, .07, 0x4a2a1a); b.glow(0xd8e8ff, 3, 12, 2.2, -40, .5); A.sword = sw;
      // Turnierplatz: Schranke, Tribüne, Zelte mit Wimpeln
      b.box(34, 0, -26, 12, 1.2, .3, 0x8a6a3a, { solid: 1 }); for (let i = 0; i < 3; i++) b.box(34, i * .9, -36.5 - i * 1.1, 16, .9, 1.2, i % 2 ? 0x2a4a8a : 0x8a2a2a, { solid: i === 0 });
      for (const [x, z, c] of [[24, -18, 0xc83a2a], [44, -18, 0x2a5ac8], [46, -30, 0xd8b040]]) K.tent(x, z, 2.4, 2.8, c, { flag: c });
      // See von Avalon: Nebelinsel mit Apfelbäumen
      b.ico(-32, -.4, -52, 4, 1.6, 4, 0x4a7a3a); K.tree(-32, -52, .7, 0x5a4030, 0x5a8a3a, { fruit: 0xd84a2a, n: 2 }); A.mist(-32, -50, 9);
      // Merlins Steinkreis: Trilithen
      for (let i = 0; i < 9; i++) { const a = i / 9 * 6.283, x = -30 + Math.sin(a) * 10, z = -10 + Math.cos(a) * 10; if (Math.cos(a) > .9) continue; b.box(x, 0, z, 1.4, 3.6, .9, 0x8a8a8e, { ry: a, solid: 1 }); if (i % 2 === 0) b.box(x + Math.cos(a) * 1.1, 3.6, z - Math.sin(a) * 1.1, 3.2, .7, 1, 0x8a8a8e, { ry: a }); }
      // Michaelsberg: Felskuppe mit Riesenhöhle, Knochen und Feuerstelle
      K.cliff([[90, -20, 7, 9], [86, -4, 5, 6], [92, -10, 4, 11], [70, -26, 4, 5], [84, -30, 5, 7]], 0x7a746a);
      b.ico(88, 0, -12, 3.2, 3.6, 2, 0x1a1612, { cast: false }); for (let i = 0; i < 6; i++) b.box(72 + (i % 3) * 2.2, .1, -8 - (i > 2 ? 3 : 0), 1.4, .22, .22, 0xe8e0c8, { ry: i, cast: false });
      for (let i = 0; i < 6; i++) b.box(78 + Math.cos(i) * 1.1, 0, -16 + Math.sin(i) * 1.1, .4, .4, .4, 0x5a5a5e); b.glow(0xff8a30, 5, 78, 1, -16, .9); A.fire(78, -16, 1);
      // Berg Badon: Sachsenlager mit Palisade, dunklen Zelten und Bannern; gegenüber Artus' Banner
      K.fence(-18, 60, 18, 60, 0x4a3420); K.fence(-18, 60, -18, 44, 0x4a3420); K.fence(18, 60, 18, 44, 0x4a3420);
      for (const [x, z, c] of [[-10, 56, 0x5a4a3a], [0, 58, 0x3a3a2e], [10, 56, 0x5a4a3a]]) K.tent(x, z, 2.6, 3, c, { flag: 0xd8d0b0 });
      for (const x of [-12, 12]) { b.cyl(x, 0, 36, .07, 4.6, 0x5a4030, { lo: 1 }); const f = b.box(x + .55, 4, 36, 1.1, 1.4, .04, 0x3a5aa8, { cast: false }); A.sway(f, x); b.sph(x + .55, 4, 36.03, .3, .3, .02, 0xf0f0f0, { cast: false }); }
      // Brocéliande: alte Eichen, Merlins Weißdorn und der Felsen der Nimue
      for (let i = 0; i < 9; i++) { const a = i * .7, r = 7 + (i % 3) * 3; K.tree(-76 + Math.cos(a) * r, -84 + Math.sin(a) * r, 1.15 + (i % 2) * .3, 0x3a2a1a, 0x2a4a2a, { n: 4 }); }
      b.ico(-76, 1.4, -84, 2.6, 2.8, 2.2, 0x6a6a72, { solid: 1, tex: 'rock' }); K.tree(-73, -82, .7, 0x6a5a4a, 0xe8e0f0, { n: 3 }); b.glow(0xb8a0ff, 4, -76, 2.6, -84, .8); A.mist(-76, -84, 12);
      // Grüne Kapelle: bemooster Hügel mit Höhlenmund, Axt im Boden
      b.ico(-84, 0, -28, 7, 4.2, 6, 0x3a6a2a, { solid: 1, tex: 'grass' }); b.ico(-80, .6, -23.5, 1.8, 2, .6, 0x14180e, { cast: false });
      b.cyl(-76, 0, -22, .07, 2, 0x5a4030, { lo: 1 }); b.box(-75.8, 1.9, -22, .9, .6, .08, 0x2a6a3a, { mat: { m: .8, r: .3 } });
      // Gralskapelle: kleine Kapelle mit leuchtendem Kelch
      b.box(72, 0, -96, 7, 5.4, 8, 0xc8c0b0, { solid: 1 }); K.tower(72, -100, 1.4, 9, 0xc8c0b0, 0x8a6a3a, 3.4);
      for (let i = 0; i < 3; i++) b.box(70 + i * 2, 0, -91.9, 1.2, 3 + (i === 1) * .8, .1, 0x3a2a1a, { cast: false });
      b.box(72, 0, -88, 1.6, 1, .9, 0xd8d0c0); b.cyl(72, 1, -88, .25, .5, 0xffd860, { mat: { m: .9, r: .2, e: 0xffb020, ei: 1.6 } }); b.glow(0xfff0b0, 3, 72, 2, -88, .7);
    }
  };
  return { LAND, kit };
}
