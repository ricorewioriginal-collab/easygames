// Wahrzeichen von „Gullivers Inseln“: Liliput (alles winzig), Brobdingnag (alles riesig), Laputa (Schwebeplateau).
// Aufbau wie die anderen Welten (siehe mwland.js); Baustein-Satz `kit` kommt von dort.
export function makeGulliverLand(kit) {
  return function gulliver(b, w, A) {
    const K = kit(b), P = { tex: 'plaster' };
    b.tmap = { 0xd8cfc0: 'plaster', 0xf0e4d0: 'plaster', 0xb89a6a: 'plaster', 0x7a5a3a: 'wood', 0x5a4a3a: 'wood', 0x8a8a98: 'stone' };
    const hsh = (i, k) => { const t = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return t - Math.floor(t); };

    /* ---- Liliput: Mildendo mit Häuschen, Brunnen, Palast; Ufer mit Wrack; Tempel; Bucht mit Flotte ---- */
    const mini = (x, z, s, wall, roof, ry) => {   // winziges Häuschen (Knöchelhöhe): Körper, Kegeldach, Tür, Fenster
      const wd = 2.3 * s, dp = 1.9 * s, h = 1.5 * s, sx = Math.sin(ry), sz = Math.cos(ry);
      b.box(x, 0, z, wd, h, dp, wall, { ry, solid: 1, ...P }); b.cone(x, h, z, wd * .82, h * .8, roof, { lo: 1, ry: ry + .78, rz2: dp * .82 });
      b.box(x + sx * (dp / 2 + .02), 0, z + sz * (dp / 2 + .02), .55 * s, 1 * s, .06, 0x4a3020, { ry, cast: false });
      b.box(x + sx * (dp / 2 + .02) + sz * .8 * s, .7 * s, z + sz * (dp / 2 + .02) - sx * .8 * s, .32 * s, .32 * s, .05, 0xffd890, { ry, cast: false, mat: { e: 0xffc060, ei: 1.4 } });
    };
    const CX = -44, CZ = -34, WALL = [0xf0e4d0, 0xe8d0a8, 0xd8b890, 0xf0d8c8, 0xc8d8e0], ROOF = [0xc83a3a, 0x3a6aa8, 0xd8a030, 0x6a8a4a, 0x8a4a8a];
    let hn = 0;
    for (const [rad, cnt] of [[11.5, 12], [15.5, 14]]) for (let i = 0; i < cnt; i++) { const a = (i + (rad > 12 ? .5 : 0)) / cnt * Math.PI * 2; if (a > .35 && a < 2.3) continue;   // Osten/Südosten bleiben frei: Weg vom Ankunftsplatz
      const x = CX + Math.sin(a) * rad, z = CZ + Math.cos(a) * rad; mini(x, z, 1 + hsh(hn, 1) * .35, WALL[hn % 5], ROOF[(hn * 3) % 5], a + Math.PI); hn++; }
    // Brunnen, Fahnenmasten, Kaiserpalast (begehbar), Ehrenbogen
    b.cyl(CX, 0, CZ, 1.3, .5, 0x9a9aa8, { solid: 1 }); b.cyl(CX, .5, CZ, .25, 1.5, 0x9a9aa8); b.sph(CX, 2.2, CZ, .35, .22, .35, 0x6ad8ff, { mat: { e: 0x3a9ae8, ei: 1.4 }, cast: false }); b.glow(0x6ad8ff, 3, CX, 2.2, CZ, .5);
    for (const sx of [-1, 1]) { b.cyl(CX + sx * 5, 0, CZ + 4, .06, 2.6, 0x5a4030, { lo: 1 }); const f = b.box(CX + sx * 5 + .4, 2.1, CZ + 4, .8, .5, .03, sx < 0 ? 0xc83a3a : 0x3a6aa8, { cast: false }); A.sway(f, sx); }
    K.house(CX, -54, 9, 6, 3.4, 0xf0e4d0, 0xc83a3a, 0, { beams: 0x5a4a3a, chimney: 1 });
    for (const sx of [-4.2, 4.2]) b.cyl(CX + sx, 0, -50.2, .3, 3.2, 0xe8e0d0, { solid: 1 });
    b.glow(0xffd890, 5, CX, 2.6, -50, .7);
    // Ufer: gestrandetes Boot und Fäden am Boden
    b.box(16, 0, -2, 7, 1.1, 2.6, 0x7a5a3a, { ry: .45, solid: 1, tex: 'wood' }); b.cyl(15, 1.1, -2, .1, 4, 0x5a4030, { lo: 1 }); { const f = b.box(15.8, 3.2, -2, 1.4, 1.8, .05, 0xf0ece0, { cast: false }); A.sway(f, 3); }
    for (let i = 0; i < 6; i++) { const t = b.box(-12 + i * 3.2, .04, -6 + (i % 2) * 6, 7, .05, .05, 0xe8e0c8, { ry: .5 + i, cast: false, mat: { e: 0xd8c870, ei: .8 } }); }
    // Tempel (begehbar), Pfosten und Seile
    K.house(-76, -58, 13, 10, 4.2, 0xd8cfc0, 0x7a5a3a, 0, {});
    for (const sx of [-5.6, 5.6]) b.cyl(-76 + sx, 0, -52.2, .35, 3.6, 0xe8e0d0, { solid: 1 });
    for (let i = 0; i < 4; i++) b.cyl(-66 - i * 1.6, 0, -50 + (i % 2), .08, 1.6, 0x5a4030, { lo: 1 });
    b.box(-62, 1.5, -50, 6.6, .05, .05, 0xd8c8a0, { ry: 0, cast: false });
    // Bucht von Blefuscu: Flotte im Wasser, Steg
    for (const [x, z, ry] of [[-66, -92, .4], [-58, -95, -.3], [-62, -86, 1.2], [-56, -89, .1], [-68, -99, .8]]) {
      b.box(x, -.55, z, 3.2, .8, 1.1, 0x6a4a2a, { ry, cast: false, tex: 'wood' }); b.cyl(x, .2, z, .06, 2.4, 0x5a4030, { lo: 1 }); const s = b.box(x, 1.1, z, .1, 1.5, 1, 0xf4f0e4, { ry, cast: false }); A.sway(s, x);
    }
    b.box(-62, 0, -81.6, 2.2, .25, 4.4, 0x7a5a3a, { cast: false, tex: 'wood' }); for (const sx of [-1, 1]) b.cyl(-62 + sx, -.4, -79.6, .1, 1.1, 0x5a4030, { lo: 1 });
    for (const [x, z] of [[-76, -86], [-74, -88]]) b.cyl(x, 0, z, .4, .8, 0x6a4a2a, { tex: 'wood', solid: 1 });

    /* ---- Brobdingnag: Bauernhof mit Riesenrequisiten, Kornfeld, Lorbrulgrud ---- */
    K.house(44, -44, 14, 10, 4.2, 0xb89a6a, 0x6a3a2a, 0, { beams: 0x4a3220, chimney: 1 });
    b.cyl(30, 0, -34, 2.2, 4.6, 0x6a4a2a, { solid: 1, tex: 'wood' }); for (const y of [1, 3.4]) b.tor(30, y, -34, 2.25, 0x3a3a42, { rx: Math.PI / 2, d: .12 });
    b.box(60, 6.2, -14, 10, .6, 6, 0x8a6a3a, { tex: 'wood' }); for (const [dx, dz] of [[-4.4, -2.4], [4.4, -2.4], [-4.4, 2.4], [4.4, 2.4]]) b.cyl(60 + dx, 0, -14 + dz, .7, 6.2, 0x6a4a2a, { solid: 1, tex: 'wood' });   // Riesentisch: man läuft hindurch
    b.cyl(52, 0, -6, 1.3, 2, 0xc8c8d0, { solid: 1, mat: { m: .8, r: .3 } }); for (let i = 0; i < 10; i++) b.sph(52 + Math.cos(i * .63) * 1.3, 1.4 + (i % 2) * .5, -6 + Math.sin(i * .63) * 1.3, .14, .14, .14, 0x4a4a52, { cast: false });   // Fingerhut
    b.cyl(34, 0, -8, 1.4, 2.4, 0xd8b878, { solid: 1 }); b.tor(34, 1.2, -8, 1.45, 0xc83a3a, { rx: Math.PI / 2, d: .35 });   // Garnrolle
    for (const dx of [-1.2, 0, 1.2]) b.box(66 + dx, 0, -36, .3, 6, .3, 0xc8c8d0, { mat: { m: .9, r: .3 } }); b.box(66, 6, -36, 3, .35, .35, 0xc8c8d0, { mat: { m: .9, r: .3 } }); b.box(66, 0, -36, .5, 8.4, .5, 0xc8c8d0, { solid: 1, mat: { m: .9, r: .3 } });   // Riesengabel steckt im Boden
    b.cyl(24, 0, -14, 3, 3.6, 0xe0c060, { solid: 1 }); b.cone(24, 3.6, -14, 3.2, 2.6, 0xc8a840, {});   // Heuhaufen
    const SP = [[72, -62, 9.5], [70, -50, 3.6], [82, -38, 3], [58, -42, 3], [62, -40, 3], [84, -50, 3.4], [76, -76, 2.6], [60, -82, 2.6], [88, -66, 3]];
    let ci = 0; for (let gx = 54; gx <= 90; gx += 3.5) for (let gz = -84; gz <= -38; gz += 3.5) { const x = gx + (hsh(ci, 2) - .5) * 1.4, z = gz + (hsh(ci, 3) - .5) * 1.4; ci++;
      if (SP.some(([sx, sz, r]) => Math.hypot(x - sx, z - sz) < r) || Math.hypot(x - 72, z + 62) > 24) continue;
      const hh = 8 + hsh(ci, 4) * 4.5; b.cyl(x, 0, z, .2, hh, 0xc8b040, { lo: 1, solid: 1 }); b.sph(x, hh, z, .42, .95, .42, 0xe0c050, { cast: false }); const lf = b.box(x + .5, hh * .55, z, 1.1, .05, .26, 0x8aa83a, { cast: false }); lf.rotation.z = .5; }
    // Lorbrulgrud: riesiges Tor, Turm (begehbar), Spinett, Sahnetopf
    for (const sx of [26, 46]) { b.cyl(sx, 0, -72, 1.6, 12, 0xd8d0c0, { solid: 1, tex: 'stone' }); b.cone(sx, 12, -72, 1.9, 1.8, 0x2a5aa8, {}); }
    b.box(36, 12.2, -72, 22, 1.6, 2.6, 0xd8d0c0, { tex: 'stone' });
    K.tower(36, -106, 5.5, 22, 0xd8d0c0, 0x2a5aa8, 8, { crown: 1, win: 0xffd890 });
    b.box(46, 3, -96, 8, .5, 4, 0x5a3a22, { tex: 'wood', cast: false }); for (const [dx, dz] of [[-3.4, -1.6], [3.4, -1.6], [-3.4, 1.6], [3.4, 1.6]]) b.cyl(46 + dx, 0, -96 + dz, .3, 3, 0x4a3020, { solid: 1 });   // Spinett (hohl, man läuft unten hindurch)
    b.box(46, 3.5, -96, 7.4, 1.2, 3.6, 0x7a4a2a, { solid: 0 }); for (let i = 0; i < 14; i++) b.box(43 + i * .5, 4.7, -94.2, .4, .1, 1.2, i % 3 === 1 ? 0x1a1a1a : 0xf4f0e0, { cast: false });
    b.cyl(41, 0, -76, 1.8, 2.6, 0xe8e0d0, { solid: 1 }); b.cyl(41, 2.5, -76, 1.6, .15, 0xfff8e0, { cast: false });
    for (const [x, z] of [[24, -98], [50, -78]]) K.fence(x, z, x + 6, z, 0x7a5a3a);

    /* ---- Laputa: Plateau (Höhe 7) mit Magnetstein, Sternwarte, Geländer und schwebenden Felsen ---- */
    const PY = 7, PX = 0, PZ = -62;
    { const m = b.ico(PX, PY + 3.6, PZ, 1.6, 1.3, 1.6, 0x5a6a9a, { cast: false, mat: { e: 0x3a5ad8, ei: 1.2 } }); A.bob(m, .3, 1.1);
      for (const [r, rx, sp] of [[2.6, 0, .6], [3.2, 1.1, -.45]]) { const t = b.tor(PX, PY + 3.6, PZ, r, 0x8ab0ff, { rx, d: .07, mat: { e: 0x5a8aff, ei: 1.8, m: .6 } }); A.spin(t, sp); }
      b.glow(0x6a9aff, 10, PX, PY + 3.6, PZ, 1.2); }
    b.cyl(-6.5, PY, -62.5, 1.4, 1.6, 0xe8e0f0, { solid: 1, tex: 'stone' }); b.sph(-6.5, PY + 1.6, -62.5, 1.5, 1.1, 1.5, 0x8a9ad8, { mat: { m: .7, r: .3 } }); { const t = b.cyl(-5.6, PY + 2.5, -62.5, .12, 2, 0x2a2a3a, { lo: 1, mat: { m: .8, r: .3 } }); t.rotation.z = -.9; }
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; if (Math.cos(a) > .55) continue; b.cyl(PX + Math.sin(a) * 7.2, PY, PZ + Math.cos(a) * 7.2, .12, 1, 0xd8d8e8, { lo: 1 }); b.sph(PX + Math.sin(a) * 7.2, PY + 1.1, PZ + Math.cos(a) * 7.2, .14, .14, .14, 0x8ab0ff, { mat: { e: 0x5a8aff, ei: 1.6 }, cast: false }); }
    for (const [x, y, z, s] of [[-16, 4, -70, 2.4], [14, 9, -72, 1.8], [-14, 11, -52, 1.5], [18, 5, -56, 2], [4, 13, -80, 2.6], [-22, 8, -62, 1.7]]) { const m = b.ico(x, y, z, s, s * .7, s, 0x6a7090, { cast: false }); A.bob(m, .4, .7 + s * .1); b.cone(x, y - s * 1.8, z, s * .6, s * 1.4, 0x4a5070, { lo: 1 }).rotation.x = Math.PI; }
    b.glow(0xa0c0ff, 6, PX, PY + 1.4, PZ, 1);
  };
}
