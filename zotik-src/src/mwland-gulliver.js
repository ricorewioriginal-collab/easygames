// Wahrzeichen von „Gullivers Inseln“: Liliput (alles winzig), Brobdingnag (alles riesig), Laputa (Schwebeplateau).
// Aufbau wie die anderen Welten (siehe mwland.js); Baustein-Satz `kit` kommt von dort.
export function makeGulliverLand(kit) {
  return function gulliver(b, w, A) {
    const K = kit(b), P = { tex: 'plaster' };
    b.tmap = { 0xd8cfc0: 'plaster', 0xf0e4d0: 'plaster', 0xb89a6a: 'plaster', 0x7a5a3a: 'wood', 0x5a4a3a: 'wood', 0x8a8a98: 'stone' };
    const hsh = (i, k) => { const t = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return t - Math.floor(t); };

    /* ---- Liliput: Mildendo mit Häuschen, Brunnen, Palast; Ufer mit Wrack; Tempel; Bucht mit Flotte ---- */
    const mini = (x, z, s, wall, roof, ry) => {   // winziges Häuschen (kniehoch für Zotik): Körper, Kegeldach, Tür, Fenster
      const wd = 2.3 * s, dp = 1.9 * s, h = 1.5 * s, sx = Math.sin(ry), sz = Math.cos(ry);
      b.box(x, 0, z, wd, h, dp, wall, { ry, solid: 1, ...P }); b.cone(x, h, z, wd * .82, h * .8, roof, { lo: 1, ry: ry + .78, rz2: dp * .82 });
      b.box(x + sx * (dp / 2 + .01), 0, z + sz * (dp / 2 + .01), .55 * s, 1 * s, .03, 0x4a3020, { ry, cast: false });
      b.box(x + sx * (dp / 2 + .01) + sz * .8 * s, .7 * s, z + sz * (dp / 2 + .01) - sx * .8 * s, .32 * s, .32 * s, .03, 0xffd890, { ry, cast: false, mat: { e: 0xffc060, ei: 1.4 } });
    };
    const CX = -44, CZ = -34, WALL = [0xf0e4d0, 0xe8d0a8, 0xd8b890, 0xf0d8c8, 0xc8d8e0], ROOF = [0xc83a3a, 0x3a6aa8, 0xd8a030, 0x6a8a4a, 0x8a4a8a];
    let hn = 0;
    for (const [rad, cnt] of [[9, 14], [12, 18], [15, 22]]) for (let i = 0; i < cnt; i++) { const a = (i + (hn & 1) * .5) / cnt * Math.PI * 2; if (a > .35 && a < 2.3) continue;   // Osten/Südosten bleiben frei: Weg vom Ankunftsplatz
      const x = CX + Math.sin(a) * rad, z = CZ + Math.cos(a) * rad; mini(x, z, .36 + hsh(hn, 1) * .14, WALL[hn % 5], ROOF[(hn * 3) % 5], a + Math.PI); hn++; }
    // Brunnen, Fähnchen, Kaiserpalast (nur kniehoch, aber das größte Haus der Stadt), Ehrenbogen
    b.cyl(CX, 0, CZ, .5, .22, 0x9a9aa8, { solid: 1 }); b.cyl(CX, .22, CZ, .1, .6, 0x9a9aa8); b.sph(CX, .9, CZ, .15, .1, .15, 0x6ad8ff, { mat: { e: 0x3a9ae8, ei: 1.4 }, cast: false }); b.glow(0x6ad8ff, 1.4, CX, .9, CZ, .4);
    for (const sx of [-1, 1]) { b.cyl(CX + sx * 2.4, 0, CZ + 2, .03, 1.1, 0x5a4030, { lo: 1 }); const f = b.box(CX + sx * 2.4 + .2, .9, CZ + 2, .4, .22, .02, sx < 0 ? 0xc83a3a : 0x3a6aa8, { cast: false }); A.sway(f, sx); }
    mini(CX, -54, .95, 0xf0e4d0, 0xc83a3a, 0); b.glow(0xffd890, 3, CX, 1.4, -52, .6);
    // Ufer: gestrandetes Boot (Gullivers Beiboot, für ihn nur ein Spielzeug), Fäden am Boden
    b.box(16, 0, -2, 7, 1.1, 2.6, 0x7a5a3a, { ry: .45, solid: 1, tex: 'wood' }); b.cyl(15, 1.1, -2, .1, 4, 0x5a4030, { lo: 1 }); { const f = b.box(15.8, 3.2, -2, 1.4, 1.8, .05, 0xf0ece0, { cast: false }); A.sway(f, 3); }
    for (let i = 0; i < 6; i++) { const t = b.box(-12 + i * 3.2, .04, -6 + (i % 2) * 6, 7, .05, .05, 0xe8e0c8, { ry: .5 + i, cast: false, mat: { e: 0xd8c870, ei: .8 } }); }
    // Tempel (begehbar), Pfosten und Seile
    K.house(-76, -58, 13, 10, 4.2, 0xd8cfc0, 0x7a5a3a, 0, {});
    for (const sx of [-5.6, 5.6]) b.cyl(-76 + sx, 0, -52.2, .35, 3.6, 0xe8e0d0, { solid: 1 });
    for (let i = 0; i < 4; i++) b.cyl(-66 - i * 1.6, 0, -50 + (i % 2), .08, 1.6, 0x5a4030, { lo: 1 });
    b.box(-62, 1.5, -50, 6.6, .05, .05, 0xd8c8a0, { ry: 0, cast: false });
    // Bucht von Blefuscu: Flotte aus Schuh-großen Schiffen im Wasser, Steg
    for (const [x, z, ry] of [[-66, -92, .4], [-58, -95, -.3], [-62, -86, 1.2], [-56, -89, .1], [-68, -99, .8], [-60, -91, .9], [-64, -96, 1.5], [-57, -84, .3]]) {
      b.box(x, -.5, z, 1.3, .35, .5, 0x6a4a2a, { ry, cast: false, tex: 'wood' }); b.cyl(x, -.2, z, .03, 1.1, 0x5a4030, { lo: 1 }); const s = b.box(x, .15, z, .04, .7, .5, 0xf4f0e4, { ry, cast: false }); A.sway(s, x);
    }
    b.box(-62, 0, -81.6, 1.2, .15, 4.4, 0x7a5a3a, { cast: false, tex: 'wood' });

    /* ---- Brobdingnag: alles riesig. Das Bauernhaus ist eine Wand aus Holz; begehbar ist nur Gullivers Reisekasten davor ---- */
    b.box(44, 0, -60, 30, 28, 16, 0xb89a6a, { solid: 1, ...P }); for (const sd of [-1, 1]) { const r = b.box(44, 28 + 4, -60 + sd * 4.2, 32, .9, 10, 0x6a3a2a, { cast: false }); r.rotation.x = sd * .62; }
    b.box(44, 0, -51.9, 7, 12, .3, 0x4a3220, { cast: false }); b.box(36, 12, -51.9, 4, 4.4, .3, 0xffd890, { cast: false, mat: { e: 0xffc060, ei: 1.2 } }); b.box(52, 12, -51.9, 4, 4.4, .3, 0xffd890, { cast: false, mat: { e: 0xffc060, ei: 1.2 } });
    K.house(44, -40, 8, 6, 3.4, 0xc8a070, 0x6a3a2a, 0, { beams: 0x4a3220 });   // Gullivers Reisekasten: für die Riesen eine Spielzeugkiste, für Zotik ein Haus
    b.glow(0xffe0a0, 4, 44, 2, -36.6, .5);
    b.cyl(30, 0, -34, 4.6, 10, 0x6a4a2a, { solid: 1, tex: 'wood' }); for (const y of [2, 7.6]) b.tor(30, y, -34, 4.65, 0x3a3a42, { rx: Math.PI / 2, d: .25 });
    b.box(60, 12.6, -14, 22, 1.2, 13, 0x8a6a3a, { tex: 'wood' }); for (const [dx, dz] of [[-9, -5], [9, -5], [-9, 5], [9, 5]]) b.cyl(60 + dx, 0, -14 + dz, 1.4, 12.6, 0x6a4a2a, { solid: 1, tex: 'wood' });   // Riesentisch: man läuft hindurch
    b.cyl(66, 13.8, -14, 3, 3.4, 0xf0e8d8, { cast: false }); b.cyl(54, 13.8, -12, 2.2, 3, 0xd8b878, { cast: false });   // Becher und Topf auf dem Tisch
    b.cyl(27, 0, -6, 2.6, 4, 0xc8c8d0, { solid: 1, mat: { m: .8, r: .3 } }); for (let i = 0; i < 12; i++) b.sph(27 + Math.cos(i * .52) * 2.6, 2.6 + (i % 2) * 1, -6 + Math.sin(i * .52) * 2.6, .28, .28, .28, 0x4a4a52, { cast: false });   // Fingerhut
    b.cyl(36, 0, -3, 2.8, 5, 0xd8b878, { solid: 1 }); b.tor(36, 2.5, -3, 2.85, 0xc83a3a, { rx: Math.PI / 2, d: .6 });   // Garnrolle
    for (const dx of [-2.4, 0, 2.4]) b.box(66 + dx, 0, -36, .8, 11, .8, 0xc8c8d0, { mat: { m: .9, r: .3 } }); b.box(66, 11, -36, 6.4, .9, .9, 0xc8c8d0, { mat: { m: .9, r: .3 } }); b.box(66, 11.9, -36, 1.2, 22, 1.2, 0xc8c8d0, { solid: 1, mat: { m: .9, r: .3 } });   // Riesengabel steckt im Boden
    b.cyl(20, 0, -28, 6, 7, 0xe0c060, { solid: 1 }); b.cone(20, 7, -28, 6.4, 5, 0xc8a840, {});   // Heuhaufen
    const SP = [[72, -62, 11], [70, -50, 4.4], [82, -38, 3.6], [58, -42, 3.6], [62, -40, 3.6], [84, -50, 4], [76, -76, 3.4], [60, -82, 3.4], [88, -66, 4]];
    let ci = 0; for (let gx = 54; gx <= 92; gx += 5.2) for (let gz = -86; gz <= -36; gz += 5.2) { const x = gx + (hsh(ci, 2) - .5) * 1.6, z = gz + (hsh(ci, 3) - .5) * 1.6; ci++;
      if (SP.some(([sx, sz, r]) => Math.hypot(x - sx, z - sz) < r) || Math.hypot(x - 72, z + 62) > 26) continue;
      const hh = 20 + hsh(ci, 4) * 10; b.cyl(x, 0, z, .45, hh, 0xc8b040, { lo: 1, solid: 1 }); b.sph(x, hh, z, .9, 2.2, .9, 0xe0c050, { cast: false }); const lf = b.box(x + 1.2, hh * .5, z, 2.8, .1, .6, 0x8aa83a, { cast: false }); lf.rotation.z = .5; }
    // Lorbrulgrud: Riesentor, Turm, Spinett, Sahnetopf
    for (const sx of [24, 48]) { b.cyl(sx, 0, -76, 3.6, 30, 0xd8d0c0, { solid: 1, tex: 'stone' }); b.cone(sx, 30, -76, 4.2, 4, 0x2a5aa8, {}); }
    b.box(36, 30, -76, 30, 3.6, 5.4, 0xd8d0c0, { tex: 'stone' });
    K.tower(36, -112, 9, 50, 0xd8d0c0, 0x2a5aa8, 14, { crown: 1, closed: 1, win: 0xffd890 });
    b.box(56, 7, -96, 18, 1.2, 9, 0x5a3a22, { tex: 'wood', cast: false }); for (const [dx, dz] of [[-7.6, -3.6], [7.6, -3.6], [-7.6, 3.6], [7.6, 3.6]]) b.cyl(56 + dx, 0, -96 + dz, .8, 7, 0x4a3020, { solid: 1 });   // Spinett (Beine tragen die Tasten, man läuft unten hindurch)
    b.box(56, 8.2, -96, 17, 2.4, 8, 0x7a4a2a, { cast: false }); for (let i = 0; i < 18; i++) b.box(48.2 + i * .9, 10.7, -92.6, .75, .2, 2.4, i % 3 === 1 ? 0x1a1a1a : 0xf4f0e0, { cast: false });
    b.cyl(34, 0, -94, 3.6, 5, 0xe8e0d0, { solid: 1 }); b.cyl(34, 4.9, -94, 3.3, .3, 0xfff8e0, { cast: false });

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
