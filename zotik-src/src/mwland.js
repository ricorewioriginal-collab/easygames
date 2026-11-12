// Wahrzeichen der Märchenwelten – gebaut aus einfachen Formen, nach den Beschreibungen der Vorlagen.
// Jeder Bau bekommt Kollision nur dort, wo er sichtbar steht (Kreisketten entlang der Wände, siehe solidBox in maerchen.js).
export function makeLand({ T, G, M, mk, glow }) {
  // Kleine Bausteine, die mehrere Welten nutzen
const dark = c => ((c >> 16 & 255) * .3 + (c >> 8 & 255) * .59 + (c & 255) * .11) < 90;
  function kit(b) {
    const K = {
      // Fachwerk-/Steinhaus mit Satteldach, Tür, leuchtenden Fenstern
      house(x, z, w, d, h, wall, roof, ry, o = {}) {
        const g = new T.Group(); g.position.set(x, 0, z); g.rotation.y = ry || 0; b.g.add(g); const bb = { g };
        g.add(mk(G.box, b.mat(wall, 'plaster'), 0, h / 2, 0, w, h, d));
        if (o.beams) for (const sx of [-w / 2, w / 2]) g.add(mk(G.box, b.mat(o.beams, 'wood'), sx, h / 2, 0, .26, h, d + .05, false));
        for (const s of [-1, 1]) { const r = mk(G.box, b.mat(roof, dark(roof) ? 'slate' : 'roof', { s: .6 }), 0, h + d * .27, s * d * .26, w + .7, .28, d * .62); r.rotation.x = s * .72; g.add(r); }
        g.add(mk(G.box, M(wall), 0, h + d * .14, 0, w * .99, d * .3, d * .02, false));
        g.add(mk(G.box, M(0x4a3020), 0, 1.05, d / 2 + .02, 1.1, 2.1, .08, false));
        for (const sx of [-w * .3, w * .3]) g.add(mk(G.box, M(0xffd890, { e: 0xffc060, ei: o.dark ? .5 : 1.4 }), sx, h * .55, d / 2 + .03, .8, .7, .05, false));
        if (o.chimney) g.add(mk(G.box, M(0x6a5a50), w * .3, h + d * .45, -d * .15, .6, 1.4, .6));
        b.solid(x, z, w, d, ry); return bb;
      },
      tower(x, z, r, h, wall, roofC, roofH, o = {}) { b.cyl(x, 0, z, r, h, wall, { solid: 1, tex: o.tex || 'stone' }); if (roofC) b.cone(x, h, z, r * 1.18, roofH || r * 2, roofC, { tex: dark(roofC) ? 'slate' : 'roof', to: { s: .7 } });
        if (o.crown) for (let i = 0; i < 8; i++) { const a = i * .785; b.box(x + Math.cos(a) * r * .9, h, z + Math.sin(a) * r * .9, .6, .7, .6, wall); }
        if (o.win) for (let i = 0; i < 3; i++) b.box(x + Math.sin(i * 2.1) * (r + .02), h * .6, z + Math.cos(i * 2.1) * (r + .02), .35, .8, .35, 0xffd890, { mat: { e: o.win, ei: 1.4 }, cast: false }); },
      // Mauer zwischen zwei Punkten, optional mit Zinnen
      wall(x0, z0, x1, z1, h, th, col, o = {}) { const dx = x1 - x0, dz = z1 - z0, L = Math.hypot(dx, dz), ry = Math.atan2(dx, dz) + Math.PI / 2, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
        b.box(cx, 0, cz, L, h, th, col, { ry, solid: 1, tex: o.tex || 'stone' });
        if (o.cren) for (let i = 0; i < L / 2 - .5; i++) { const t = (i + .75) / (L / 2), px = x0 + dx * t, pz = z0 + dz * t; b.box(px, h, pz, 1, .8, th * .9, col, { ry }); } },
      tent(x, z, r, h, col, o = {}) { b.cyl(x, 0, z, .1, h + .4, 0x5a4030, { lo: 1 }); const t = b.cone(x, 0, z, r, h, col, { lo: 1, solid: 1 }); t.rotation.y = o.ry || .3;
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
    }
  };
  return { LAND, kit };
}
