'use strict';
/* Bunte Insel – Hüpfland 🍄 (Welt im Westen): eine bunte Hüpf-Abenteuer-Insel. ALLES SELBST ERFUNDEN – Figuren, Namen und Aussehen sind eigene Entwürfe
   (nur „inspiriert“ vom Genre der Jump-'n'-Run- und Kart-Spiele, keine fremden Figuren oder Marken):
   • Dino Tupfi 🦕 (Reittier, Fahrzeug 'dino'): orange mit türkisen Tupfen, kleine lila Rückenplatten, Seil-Sattel. Hupe-Knopf = großer Sprung.
   • Röhren in vier Farben: Paare bringen dich über die Insel; oben schaut eine freundliche Kicher-Blume 🌻 heraus.
   • Sternblöcke ⭐: schweben in Sprunghöhe – von unten anstoßen = Münzen + Stern.
   • Flitzer-Kart 🏎️ + Rennstrecke: 3 Runden gegen Flitzefuchs Ferdi, Pia und Pelle, Glitzerkisten (Extras) und Turbo-Pfeile.
   • Hüpf-Abenteuer (Automat): 2D-Level aus jump.js mit Röhren und Sternblöcken.
   • Felsenkönig Brocko 🪨👑: grummeliger, aber gutmütiger Felsenriese in seiner Burg. Mutprobe: leuchtende Knöpfe drücken, rollenden Kieseln ausweichen – dann lacht er und gibt den Sonnenstern zurück.
   • Figuren: Pia & Pelle (Geschwister, Insel-Helfer), Flitzefuchs Ferdi (frecher Rivale), Dino-Oma Mira. */
BI.HUEPF = (function () {
  const R = 85, cx = -560, cz = 180, len = Math.hypot(cx, cz), ux = cx / len, uz = cz / len;
  const A0 = { x: ux * 171, z: uz * 171 }, A1 = { x: cx - ux * (R - 5), z: cz - uz * (R - 5) };
  const T = { id: 'huepf', x: cx, z: cz, R, ux, uz, entry: { x: cx - ux * (R - 14), z: cz - uz * (R - 14) },
    bridge: { mx: (A0.x + A1.x) / 2, mz: (A0.z + A1.z) / 2, L: Math.hypot(A1.x - A0.x, A1.z - A0.z) + 2, w: 7, ry: Math.atan2(ux, uz) } };
  T.at = (dx, dz) => ({ x: cx + dx, z: cz + dz });
  /* Rennstrecke: Ellipse um (0|38), Halbachsen A (Ost-West) und B (Nord-Süd), Breite w. Start/Ziel bei θ = 0 (Ostseite), gefahren wird mit wachsendem θ (nach Süden los). */
  T.track = { cx: 0, cz: 38, A: 46, B: 22, w: 9 };
  T.tp = (th, off) => { const k = T.track, c = Math.cos(th), s = Math.sin(th), nx = k.B * c, nz = k.A * s, nl = Math.hypot(nx, nz) || 1, o = off || 0; return { x: cx + k.cx + k.A * c + nx / nl * o, z: cz + k.cz + k.B * s + nz / nl * o, h: Math.atan2(-k.A * s, k.B * c) }; };
  T.castle = { x: -35, z: -38, s: 12, gate: 2.6 };          /* Burg: Mitte, halbe Seitenlänge, halbe Torbreite (Tor in der Ostmauer) */
  T.stable = { x: 38, z: -52 };                                /* Dino-Stall */
  T.hills = [{ x: -66, z: 6, r: 12, h: 3 }, { x: 8, z: -70, r: 11, h: 2.6 }];
  /* Röhren: [x, z, Farbe, Ziel-Index] – je zwei gehören zusammen */
  T.pipes = [[55, -6, 0x2fb84a, 1], [-8, -52, 0x2fb84a, 0], [0, 38, 0xe8453c, 3], [-62, -26, 0xe8453c, 2], [20, -30, 0x3f8cff, 5], [-20, 70, 0x3f8cff, 4], [-40, 30, 0xffc928, 7], [36, -66, 0xffc928, 6]];
  T.blocks = [[30, -12], [33, -12], [36, -12], [-10, -18], [-6, -18], [10, 2], [14, 2], [-40, -8], [-36, -8], [-60, -46], [22, -62], [26, -62]];
  T.floor = (x, z) => { let best = 0; for (const H of T.hills) { const d = Math.hypot(x - cx - H.x, z - cz - H.z); if (d < H.r) best = Math.max(best, H.h * Math.sqrt(1 - (d / H.r) * (d / H.r))); } return best; };
  return T;
})();
(BI.EXTRA_ARCADES2 = BI.EXTRA_ARCADES2 || []).push({ kind: 'jump_huepf', at: () => { const H = BI.HUEPF, p = H.at(58, -34); return { x: p.x, z: p.z, c: H }; }, body: 0x2fb84a, top: 0xffc928 });

/* ---------- Dino Tupfi (Reittier): Körper, 4 Beine, Schwanz, Kopf – Blick nach +z, Sattel oben ---------- */
BI.makeDino = function () {
  const OR = 0xff9a3c, SP = 0x2ec4b6, BE = 0xfff1c8, PU = 0x9b6bff, DK = 0x2a2230, mat = BI.mat(), root = new THREE.Group();
  const body = new BI.Batch();
  body.sph(0, 1.05, 0, .85, OR, 1, 1, .85, 1.25); body.sph(0, .92, .25, .6, BE, 1, .95, .8, 1.05);                   /* Bauch */
  for (const [x, y, z, r] of [[.55, 1.25, .2, .16], [-.6, 1.15, -.3, .2], [.45, 1.0, -.6, .14], [-.4, 1.45, .45, .13], [.2, 1.6, -.4, .15], [-.15, 1.62, .1, .1]]) body.sph(x, y, z, r, SP, 0, 1, .5, 1);
  for (let i = 0; i < 4; i++) body.cone(0, 1.62 - i * .06, -.55 + i * .32, .16 - i * .02, .32, PU, 4);             /* Rückenplatten */
  body.box(0, 1.5, -.05, .95, .1, .9, 0x3f8cff); body.box(0, 1.58, -.05, .7, .14, .6, 0x8a5a33);                  /* Decke + Sattel */
  for (const sd of [-1, 1]) { body.cyl(sd * .5, 1.05, -.05, .03, .03, .55, 0xc8a27a, 5); body.box(sd * .52, .98, -.05, .14, .06, .22, 0x555a66); }  /* Seile + Steigbügel */
  root.add(body.mesh(mat));
  const head = new THREE.Group(), hb = new BI.Batch(); head.position.set(0, 1.45, .95);
  hb.cyl(0, -.35, 0, .3, .38, .55, OR, 10, -.5); hb.sph(0, .35, .25, .52, OR, 1, 1, .9, 1.05); hb.sph(0, .2, .62, .34, BE, 1, 1.1, .75, .8);        /* Hals, Kopf, Schnauze */
  for (const sd of [-1, 1]) { hb.sph(sd * .22, .55, .55, .14, 0xffffff, 1); hb.sph(sd * .23, .56, .66, .07, DK, 0); hb.sph(sd * .25, .6, .7, .025, 0xffffff, 0); hb.sph(sd * .1, .25, .9, .04, DK, 0); hb.cone(sd * .2, .78, .2, .07, .18, BE, 5); }
  hb.box(0, .08, .78, .28, .03, .06, 0xc0503a); hb.sph(.38, .3, .55, .07, 0xff8fa8, 0, 1, .6, 1); hb.sph(-.38, .3, .55, .07, 0xff8fa8, 0, 1, .6, 1);
  head.add(hb.mesh(mat)); root.add(head);
  const tail = new THREE.Group(), tb = new BI.Batch(); tail.position.set(0, 1.0, -.95);
  for (let i = 0; i < 5; i++) tb.sph(0, -i * .07, -i * .3, .34 - i * .055, i % 2 ? SP : OR, 1); tail.add(tb.mesh(mat)); root.add(tail);
  const legs = [[.42, .45], [-.42, .45], [.42, -.45], [-.42, -.45]].map(([x, z]) => { const g = new THREE.Group(), lb = new BI.Batch(); g.position.set(x, .75, z); lb.cyl(0, -.7, 0, .17, .2, .72, OR, 8); lb.sph(0, -.68, .08, .2, BE, 1, 1, .55, 1.25); g.add(lb.mesh(mat)); root.add(g); return g; });
  return { root, legs, tail, head };
};

/* ---------- Felsenkönig Brocko: großer runder Felsenriese mit Moos, Krone und Umhang ---------- */
BI.makeBrocko = function () {
  const ST = 0x9a92a8, ST2 = 0x7f778f, MO = 0x5ab85a, GD = 0xffc928, DK = 0x2a2230, mat = BI.mat(), root = new THREE.Group(), inner = new THREE.Group(); root.add(inner);
  const b = new BI.Batch();
  b.sph(0, 1.3, 0, 1.15, ST, 1, 1.05, 1, .95); b.sph(0, 1.0, .45, .75, 0xc8bfd6, 1, 1, .9, .7);                     /* Körper + heller Bauch */
  b.box(0, .2, -.75, 2.0, 2.4, .18, 0xd0383c, 0, .12);                                                             /* Umhang */
  for (const [x, y, z, r] of [[.7, 2.0, -.2, .28], [-.6, 2.05, .1, .24], [.2, 2.25, -.5, .2], [-.8, 1.3, -.4, .22]]) b.sph(x, y, z, r, MO, 0, 1, .55, 1);
  for (const sd of [-1, 1]) { b.sph(sd * 1.15, 1.45, .1, .42, ST2, 1); b.sph(sd * 1.3, .85, .25, .38, ST, 1); b.sph(sd * .5, .25, .25, .42, ST2, 1, 1.1, .7, 1.2); }   /* Schultern, Fäuste, Füße */
  const hd = new BI.Batch();
  hd.sph(0, 0, 0, .78, ST, 1, 1.05, .95, 1); hd.sph(0, -.2, .55, .3, ST2, 1, 1.3, .9, .8);                          /* Kopf, Knubbelnase */
  for (const sd of [-1, 1]) { hd.sph(sd * .3, .15, .62, .17, 0xffffff, 1); hd.sph(sd * .3, .14, .76, .08, DK, 0); hd.box(sd * .3, .36, .62, .34, .1, .08, 0x4a4458, 0, 0, sd * -.35); }
  hd.box(0, -.48, .6, .44, .08, .05, DK); hd.sph(0, -.62, .45, .32, MO, 0, 1.4, .6, .8);                             /* Mund + Moosbart */
  hd.cyl(0, .58, 0, .5, .55, .32, GD, 10); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; hd.cone(Math.sin(a) * .48, .9, Math.cos(a) * .48, .1, .28, GD, 4); } hd.sph(0, .76, .52, .08, 0xe8453c, 0);
  inner.add(b.mesh(mat)); const head = new THREE.Group(); head.add(hd.mesh(mat)); head.position.set(0, 2.55, .05); inner.add(head);
  return { root, inner, head };
};

/* ---------- Insel bauen (statisch ins Welt-Mesh) ---------- */
BI.buildHuepfGround = function (c) {
  const { W, st, lamp, ROADY } = c, H = BI.HUEPF, TAU = Math.PI * 2, rn = BI.rng(4471), E = H.entry, at = H.at, k = H.track;
  W.spots.huepf = { x: E.x, z: E.z }; W.huepf = H;
  st.disc(H.x, H.z, H.R + 9, 0, 0x86de6a, 90); st.ring(H.x, H.z, H.R - 5, H.R + 9, .012, 0xf6e6b4, 90);
  BI.buildIsleBridge(c, H);
  /* Eingangsplatz mit Blumen-Rand */
  st.disc(E.x, E.z, 9, ROADY + .01, 0xfff0d0, 36); st.ring(E.x, E.z, 7, 8, ROADY + .02, 0xff8fc8, 36);
  for (let i = 0; i < 14; i++) { const a = i / 14 * TAU, x = E.x + Math.sin(a) * 9.8, z = E.z + Math.cos(a) * 9.8; if (Math.abs(BI.angDiff(a, Math.atan2(H.ux, H.uz))) < .5) continue; st.sph(x, .25, z, .28, [0xff5a8a, 0xffd23f, 0x7fd0ff, 0xb48aff][i % 4], 0); }
  for (let q = 0; q < 4; q++) { const a = q / 4 * TAU + .8, x = E.x + Math.sin(a) * 8.4, z = E.z + Math.cos(a) * 8.4; st.cyl(x, 0, z, .08, .1, 3.2, 0x4a3a6a, 6); lamp.sph(x, 3.4, z, .3, 0xfff3b0, 1); W.addCircle(x, z, .25, false, 3.4); }
  /* Weg vom Platz zur Rennstrecke */
  { const a = at(60, -14), b = at(47, 15), mx = (a.x + b.x) / 2, mz = (a.z + b.z) / 2, L = Math.hypot(b.x - a.x, b.z - a.z); st.strip(mx, mz, 4, L, Math.atan2(b.x - a.x, b.z - a.z), ROADY + .006, 0xf0d9a8); }
  /* Rennstrecke: Asphalt, rot-weiße Randsteine, Innenrasen, Start/Ziel, Turbo-Pfeile */
  { const N = 160, P = (th, o) => H.tp(th, o);
    for (let i = 0; i < N; i++) { const t0 = i / N * TAU, t1 = (i + 1) / N * TAU, a = P(t0, -k.w / 2), b = P(t0, k.w / 2), c2 = P(t1, k.w / 2), d = P(t1, -k.w / 2);
      st.quad(a.x, a.z, b.x, b.z, c2.x, c2.z, d.x, d.z, ROADY + .008, 0x5a6070);
      for (const [o0, o1] of [[-k.w / 2 - .7, -k.w / 2], [k.w / 2, k.w / 2 + .7]]) { const e0 = P(t0, o0), e1 = P(t0, o1), e2 = P(t1, o1), e3 = P(t1, o0); st.quad(e0.x, e0.z, e1.x, e1.z, e2.x, e2.z, e3.x, e3.z, ROADY + .014, (i >> 1) % 2 ? 0xffffff : 0xe8453c); }
      if (i % 8 < 4) { const m0 = P(t0, -.12), m1 = P(t0, .12), m2 = P(t1, .12), m3 = P(t1, -.12); st.quad(m0.x, m0.z, m1.x, m1.z, m2.x, m2.z, m3.x, m3.z, ROADY + .016, 0xe8e2c8); } }
    /* Innenrasen in hellerem Grün */
    for (let i = 0; i < 64; i++) { const t0 = i / 64 * TAU, t1 = (i + 1) / 64 * TAU, a = P(t0, -k.w / 2 - .7), b = P(t1, -k.w / 2 - .7), cc = at(k.cx, k.cz); st.tri(cc.x, cc.z, a.x, a.z, b.x, b.z, .004, 0x9be884); }
    /* Start/Ziel-Linie (Schachbrett) bei θ = 0 */
    for (let r = 0; r < 2; r++) for (let j = 0; j < 9; j++) { const o = -k.w / 2 + j * k.w / 9, p0 = P(r * .012, o), p1 = P(r * .012, o + k.w / 9), p2 = P(r * .012 + .012, o + k.w / 9), p3 = P(r * .012 + .012, o); st.quad(p0.x, p0.z, p1.x, p1.z, p2.x, p2.z, p3.x, p3.z, ROADY + .02, (r + j) % 2 ? 0x222222 : 0xffffff); }
    /* Start-Tor: zwei bunte Säulen, Balken mit Schachbrett, Ampel */
    { const l = P(0, -k.w / 2 - 1.4), r2 = P(0, k.w / 2 + 1.4); for (const q of [l, r2]) { st.cyl(q.x, 0, q.z, .35, .4, 5.2, 0xff8a1f, 8); st.sph(q.x, 5.4, q.z, .5, 0xffd23f, 1); W.addCircle(q.x, q.z, .45, false, 5.2); }
      const mx = (l.x + r2.x) / 2, mz = (l.z + r2.z) / 2, L = Math.hypot(r2.x - l.x, r2.z - l.z), ry = Math.atan2(r2.x - l.x, r2.z - l.z) + Math.PI / 2;
      for (let j = 0; j < 12; j++) { const f = (j + .5) / 12 - .5; st.box(mx + (r2.x - l.x) * f, 4.4, mz + (r2.z - l.z) * f, L / 12, .8, .3, j % 2 ? 0x222222 : 0xffffff, ry); }
      st.box(mx, 5.2, mz, 1.0, 1.6, .5, 0x23262d, ry); W.spots.huepfLight = { x: mx, y: 5.2, z: mz, ry }; }
    /* Turbo-Pfeile (gelb-orange) bei θ ≈ 0.9 und 3.9 */
    W.spots.huepfBoost = [];
    for (const th of [.9, 3.9]) { for (let j = 0; j < 3; j++) { const a = P(th + j * .025, -1.6), b = P(th + j * .025 + .02, 0), c3 = P(th + j * .025, 1.6), m = P(th + j * .025 + .006, 0); st.tri(a.x, a.z, b.x, b.z, m.x, m.z, ROADY + .022, 0xffd23f); st.tri(m.x, m.z, b.x, b.z, c3.x, c3.z, ROADY + .022, 0xff8a1f); } W.spots.huepfBoost.push(th + .025); }
    /* Tribüne an der Südseite */
    { const b0 = at(0, 70); for (let r = 0; r < 3; r++) st.box(b0.x, r * .6, b0.z + 1.2 + r * 1.1, 20, .6, 1.1, [0xff8fc8, 0x7fd0ff, 0xffd23f][r]); W.addBox(b0.x - 10, b0.z + .6, b0.x + 10, b0.z + 4.6, false, 2); } }
  /* Hüpfhügel (begehbar, runde Kuppeln mit Blumen) */
  for (const h of H.hills) { const p = at(h.x, h.z); st.sph(p.x, 0, p.z, h.r, 0x6fd060, 1, 1, h.h / h.r, 1); for (let i = 0; i < 10; i++) { const a = rn() * TAU, d = rn() * h.r * .7, y = h.h * Math.sqrt(1 - (d / h.r) * (d / h.r)); st.sph(p.x + Math.sin(a) * d, y + .05, p.z + Math.cos(a) * d, .22, [0xff5a8a, 0xffd23f, 0xffffff][i % 3], 0); } }
  /* Burg von Felsenkönig Brocko: Steinmauern mit Zinnen, vier Türme mit lila Dächern, Tor im Osten, Thron im Westen */
  { const C = H.castle, c0 = at(C.x, C.z), s = C.s, T = 1.2, HW = 4.5, STN = 0xa8a2b8, STN2 = 0x8f899f, x0 = c0.x - s, x1 = c0.x + s, z0 = c0.z - s, z1 = c0.z + s, g = C.gate;
    st.rect(x0, z0, x1, z1, ROADY + .012, 0xd8d0c0); for (let i = -2; i <= 2; i++) st.rect(x0 + 1, c0.z + i * 4.4 - .1, x1 - 1, c0.z + i * 4.4 + .1, ROADY + .016, 0xc0b8a8);
    const wall = (ax, az, bx, bz) => { const mx = (ax + bx) / 2, mz = (az + bz) / 2, L = Math.hypot(bx - ax, bz - az), ry = Math.atan2(bx - ax, bz - az); st.box(mx, 0, mz, T, HW, L, STN, ry); for (let t = -L / 2 + .6; t < L / 2; t += 1.6) st.box(mx + Math.sin(ry) * t, HW, mz + Math.cos(ry) * t, T + .1, .7, .8, STN2, ry); W.addBox(Math.min(ax, bx) - T / 2, Math.min(az, bz) - T / 2, Math.max(ax, bx) + T / 2, Math.max(az, bz) + T / 2, false, HW); };
    wall(x0, z0, x0, z1); wall(x0, z0, x1, z0); wall(x0, z1, x1, z1); wall(x1, z0, x1, c0.z - g); wall(x1, c0.z + g, x1, z1);
    for (const [tx, tz] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) { st.cyl(tx, 0, tz, 2.1, 2.3, 7, STN, 12); st.cone(tx, 7, tz, 2.6, 3.2, 0x7a4ad8, 12); st.cyl(tx, 10.1, tz, .05, .05, 1.6, 0x555a66, 5); st.box(tx + .45, 11.0, tz, .9, .55, .05, 0xffc928); W.addCircle(tx, tz, 2.3, false, 7); }
    st.box(x1, HW, c0.z, T + .2, 1.8, g * 2 + 1.6, STN2); st.box(x1 + .7, HW + .3, c0.z, .1, .9, 2.6, 0xffc928);       /* Torbogen + Schild */
    st.box(x0 + 2.8, 0, c0.z, 3.6, .9, 6, STN2); st.box(x0 + 2.2, .9, c0.z, 1.6, 2.8, 2.6, 0xd0383c); st.box(x0 + 1.6, .9, c0.z, .5, 4.2, 3.2, 0xffc928);  /* Thron-Podest */
    W.addBox(x0 + 1, c0.z - 3, x0 + 4.6, c0.z + 3, false, .9); W.addFloor(c0.x - s + 2.8, c0.z, 2.6, .9);
    W.spots.huepfCastle = { x: c0.x, z: c0.z, x0, x1, z0, z1, gate: { x: x1 + 3, z: c0.z } }; }
  /* Dino-Stall: offenes Dach auf vier Pfosten, Heuballen, Wassertrog, Zaun */
  { const p = at(H.stable.x, H.stable.z); for (const [dx, dz] of [[-4, -3], [4, -3], [-4, 3], [4, 3]]) { st.cyl(p.x + dx, 0, p.z + dz, .2, .22, 3.4, 0x8a5a33, 6); W.addCircle(p.x + dx, p.z + dz, .3, false, 3.4); }
    st.prism(p.x, 3.4, p.z, 9.6, 1.6, 7.6, 0xe8453c); st.rect(p.x - 4.4, p.z - 3.4, p.x + 4.4, p.z + 3.4, ROADY + .01, 0xe6c88a);
    for (const [dx, dz] of [[-2.8, -2], [-1.4, -2.2], [-2.2, -1.2]]) { st.cyl(p.x + dx, .55, p.z + dz, .55, .55, 1.1, 0xf2d26a, 10, Math.PI / 2); } W.addCircle(p.x - 2.1, p.z - 1.8, 1.2, false, 1.2);
    st.box(p.x + 2.6, 0, p.z - 2.2, 2.2, .6, .9, 0x8a5a33); st.box(p.x + 2.6, .55, p.z - 2.2, 1.9, .06, .65, 0x6fc8ff); W.addBox(p.x + 1.5, p.z - 2.7, p.x + 3.7, p.z - 1.7, false, .6);
    W.spots.huepfDino = { x: p.x, z: p.z + 5.5, h: Math.PI }; }
  /* Röhren (Kollision + begehbare Oberkante) */
  for (const [dx, dz, col] of H.pipes) { const p = at(dx, dz), lite = new THREE.Color(col).lerp(new THREE.Color(0xffffff), .25).getHex();
    st.cyl(p.x, 0, p.z, 1.25, 1.25, 2.0, col, 18); st.cyl(p.x, 2.0, p.z, 1.55, 1.55, .5, lite, 18); st.disc(p.x, p.z, 1.2, 2.51, 0x123018, 18); st.box(p.x - .8, .3, p.z + .9, .22, 1.5, .1, 0xffffff, .6);
    W.addCircle(p.x, p.z, 1.6, false, 2.5); W.addFloor(p.x, p.z, 1.5, 2.5); }
  /* Riesenpilze (Deko) und Büsche am Rand */
  const free = (x, z, r) => { const lx = x - H.x, lz = z - H.z; if (Math.hypot(lx, lz) > H.R - 6) return false; if (Math.hypot(x - E.x, z - E.z) < 12) return false; const e = ((lx - k.cx) / (k.A + 7)) ** 2 + ((lz - k.cz) / (k.B + 7)) ** 2, ei = ((lx - k.cx) / (k.A - 7)) ** 2 + ((lz - k.cz) / (k.B - 7)) ** 2; if (e < 1 && ei > 1) return false;
    const C = H.castle; if (Math.abs(lx - C.x) < C.s + 5 && Math.abs(lz - C.z) < C.s + 5) return false; for (const q of H.pipes) if (Math.hypot(lx - q[0], lz - q[1]) < 4) return false; for (const q of H.blocks) if (Math.hypot(lx - q[0], lz - q[1]) < 3) return false; for (const h of H.hills) if (Math.hypot(lx - h.x, lz - h.z) < h.r + 1) return false;
    if (Math.hypot(lx - H.stable.x, lz - H.stable.z) < 9) return false; return W.free(x, z, r); };
  const CAPS = [0xff8a3c, 0x7a4ad8, 0x2ec4b6, 0xff5a8a, 0x3f8cff];
  for (let i = 0, n = 0; i < 400 && n < 16; i++) { const a = rn() * TAU, d = 20 + rn() * (H.R - 26), x = H.x + Math.sin(a) * d, z = H.z + Math.cos(a) * d; if (!free(x, z, 2.5)) continue; n++;
    const s = 1.2 + rn() * 1.2, h = 2.2 * s, col = CAPS[n % CAPS.length]; st.cyl(x, 0, z, .32 * s, .42 * s, h, 0xfff3dc, 8); st.sph(x, h, z, 1.3 * s, col, 1, 1, .55, 1);
    for (let j = 0; j < 6; j++) { const b = j / 6 * TAU + rn(), r = .85 * s; st.sph(x + Math.sin(b) * r, h + .42 * s, z + Math.cos(b) * r, .17 * s, 0xffffff, 0, 1, .5, 1); } st.sph(x, h + .7 * s, z, .2 * s, 0xffffff, 0, 1, .5, 1); W.addCircle(x, z, .5 * s, false, h); }
  for (let i = 0; i < 70; i++) { const a = rn() * TAU, d = H.R - 6 - rn() * 6, x = H.x + Math.sin(a) * d, z = H.z + Math.cos(a) * d; if (!free(x, z, 1)) continue; st.sph(x, .55, z, .9 + rn() * .4, [0x4cb85a, 0x5ac966, 0x3fa84e][i % 3], 1, 1, .8, 1); W.addCircle(x, z, .8, false, 1.2); }
  /* Blumenwiesen */
  for (let i = 0; i < 160; i++) { const a = rn() * TAU, d = 8 + rn() * (H.R - 14), x = H.x + Math.sin(a) * d, z = H.z + Math.cos(a) * d; if (!free(x, z, .3)) continue; st.cyl(x, 0, z, .03, .03, .35, 0x3f9a3f, 4); st.sph(x, .4, z, .14, [0xff5a8a, 0xffd23f, 0xffffff, 0x7fd0ff][i % 4], 0); }
  /* Rennkart und Dino stehen bereit */
  { const g = H.tp(-.18, 2.2); W.vehicleSpawns.push({ type: 'kart', x: g.x + 3, z: g.z, h: g.h, color: 0xffc928 }); const d = W.spots.huepfDino; W.vehicleSpawns.push({ type: 'dino', x: d.x, z: d.z, h: d.h }); }
};

/* ---------- Spiel: Röhren, Sternblöcke, Münzen, Dino, Kart-Rennen, Burg-Mutprobe, Figuren ---------- */
BI.createHuepf = function (G) {
  const { scene, W, A, fx, P, say, save, persist } = G, H = BI.HUEPF, K = { race: null }, TAU = Math.PI * 2, at = H.at, k = H.track;
  const S = () => { const s = save.huepf || (save.huepf = {}); s.blocks = s.blocks || []; s.coins = s.coins | 0; s.paid = s.paid | 0; s.pipes = s.pipes | 0; s.races = s.races | 0; s.wins = s.wins | 0; s.best = s.best || 0; return s; };
  const snd = n => { try { A[n] && A[n](); } catch (e) { } }, earn = id => { G.earn && G.earn(id); };
  const near = (r) => Math.hypot(P.x - H.x, P.z - H.z) < H.R + (r || 40);
  const sign = (txt, x, y, z, w) => { const cv = document.createElement('canvas'); cv.width = 512; cv.height = 96; const c = cv.getContext('2d'); let f = 52; c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; const mw = c.measureText(txt).width; if (mw > 480) { f = Math.floor(f * 480 / mw); c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; }
    c.fillStyle = 'rgba(255,255,255,.92)'; c.strokeStyle = '#2fb84a'; c.lineWidth = 8; c.beginPath(); c.roundRect ? c.roundRect(6, 6, 500, 84, 24) : c.rect(6, 6, 500, 84); c.fill(); c.stroke(); c.fillStyle = '#16335e'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, 256, 50);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: BI.labelTexture ? BI.labelTexture(cv) : new THREE.CanvasTexture(cv), transparent: true, depthWrite: false })); sp.scale.set(w, w * 96 / 512, 1); sp.position.set(x, y, z); scene.add(sp); return sp; };
  { const E = H.entry, C = W.spots.huepfCastle, D = W.spots.huepfDino, g = H.tp(0, 0); sign('🍄 Hüpfland', E.x, 6.2, E.z, 10); sign('🏰 Burg Felsenstein', C.gate.x + 1, 7.2, C.gate.z, 9); sign('🦕 Dino-Stall', D.x, 5.2, D.z - 5, 6.5); sign('🏁 Flitzer-Rennbahn', g.x + 6, 7, g.z, 9); }

  /* ===== Sternblöcke: schweben mit der Unterkante auf 2,75 m – von unten anstoßen (Sprung) ===== */
  const BLK_Y = 2.75, blocks = [];
  { const geo = new THREE.BoxGeometry(1.05, 1.05, 1.05), cv = document.createElement('canvas'); cv.width = cv.height = 64; const c = cv.getContext('2d'); c.fillStyle = '#ffc928'; c.fillRect(0, 0, 64, 64); c.strokeStyle = '#c88a00'; c.lineWidth = 6; c.strokeRect(3, 3, 58, 58); c.font = 'bold 40px system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#fff6c8'; c.fillText('★', 32, 35);
    const live = new THREE.MeshLambertMaterial({ map: new THREE.CanvasTexture(cv) }), used = new THREE.MeshLambertMaterial({ color: 0xa8763a });
    H.blocks.forEach(([dx, dz], i) => { const p = at(dx, dz), m = new THREE.Mesh(geo, S().blocks.includes(i) ? used : live); m.position.set(p.x, BLK_Y + .525, p.z); scene.add(m); blocks.push({ i, x: p.x, z: p.z, m, bump: 0, used }); }); }
  function hitBlock(b) {
    const s = S(); b.bump = .25; snd('ding'); fx.burst(b.x, BLK_Y + 1.4, b.z, 12, [BI.C.gold, BI.C.white], 4, 1, 26, 4);
    if (s.blocks.includes(b.i)) { say('🪙 Dieser Block ist schon leer – such die anderen ⭐-Blöcke!', 1800); return; }
    s.blocks.push(b.i); b.m.material = b.used; G.addStars(1); coin(3); say('⭐ Sternblock! +1 ⭐ (' + s.blocks.length + ' von ' + H.blocks.length + ')', 2200);
    if (s.blocks.length >= H.blocks.length) { G.addStars(5); earn('huepf_bloecke'); A.fanfare && A.fanfare(); say('🌟 Alle Sternblöcke angestoßen! +5 ⭐', 4200); } persist();
  }
  /* ===== Münzen: goldene Taler auf Wegen und Hügeln (20 Münzen = 1 ⭐), kommen nach einer Weile wieder ===== */
  const coins = [];
  { const add = (dx, dz, y) => { const p = at(dx, dz); coins.push({ x: p.x, z: p.z, y: (y || 0) + 1.1, t: 0 }); };
    for (let i = 0; i < 8; i++) add(60 - i * 1.7, -12 + i * 3.4);                                          /* Weg zur Rennbahn */
    for (const h of H.hills) for (let i = 0; i < 6; i++) { const a = i / 6 * TAU, r = h.r * .55; add(h.x + Math.sin(a) * r, h.z + Math.cos(a) * r, h.h * Math.sqrt(1 - .3)); }
    for (let i = 0; i < 6; i++) add(-18 + i * 2.2, -38);                                                  /* vor der Burg */
    for (let i = 0; i < 6; i++) add(30 + i * 1.5, -56 + Math.sin(i) * .5);                                /* am Stall */
    for (const b of H.blocks.slice(0, 6)) add(b[0], b[1] + 2.4); }
  const coinMesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(.42, .42, .1, 14).rotateX(Math.PI / 2), new THREE.MeshLambertMaterial({ color: 0xffc928, emissive: 0x6a4a00 }), coins.length); coinMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(coinMesh);
  { const bs = new THREE.Box3(); for (const c of coins) bs.expandByPoint(new THREE.Vector3(c.x, c.y, c.z)); coinMesh.geometry.boundingSphere = bs.getBoundingSphere(new THREE.Sphere()); coinMesh.geometry.boundingSphere.radius += 2; }
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _ax = new THREE.Vector3(0, 1, 0);
  function coin(n) { const s = S(); s.coins += n; snd('coins'); while (s.coins - s.paid * 20 >= 20) { s.paid++; G.addStars(1); say('🪙 20 Münzen gesammelt! +1 ⭐', 2200); } }
  /* ===== Röhren mit Kicher-Blume ===== */
  const pipes = H.pipes.map(([dx, dz, col, to], i) => { const p = at(dx, dz), g = new THREE.Group(), b = new BI.Batch();
    b.cyl(0, -1.6, 0, .07, .09, 1.6, 0x3f9a3f, 6); b.sph(.22, -.9, 0, .2, 0x4cb85a, 0, 1.6, .4, 1); b.sph(-.22, -1.2, 0, .2, 0x4cb85a, 0, 1.6, .4, 1);
    for (let j = 0; j < 10; j++) { const a = j / 10 * TAU; b.sph(Math.sin(a) * .42, Math.cos(a) * .42, 0, .17, 0xffd23f, 0, 1, 1, .5); }
    b.sph(0, 0, 0, .3, 0x8a5a33, 1, 1, 1, .6); b.sph(-.1, .07, .17, .045, 0x2a2230, 0); b.sph(.1, .07, .17, .045, 0x2a2230, 0); b.box(0, -.13, .17, .14, .03, .02, 0xff5a8a);
    g.add(b.mesh(BI.mat())); g.position.set(p.x, 1.2, p.z); scene.add(g); return { i, x: p.x, z: p.z, to, g, up: 0, said: 0 }; });
  const pipeLines = ['🌻 Hihi! Kitzel mich nicht!', '🌻 Hallo! Spring rein, ich halt den Deckel auf!', '🌻 Kicher-kicher! Die Röhre bringt dich weit weg!', '🌻 Ich bin die Kicher-Blume. Ich beiße nicht – ich lache nur!'];
  function usePipe(p) {
    const q = pipes[p.to], ox = H.x - q.x, oz = H.z - q.z, l = Math.hypot(ox, oz) || 1, tx = q.x + ox / l * 2.8, tz = q.z + oz / l * 2.8;
    fx.burst(p.x, 2.6, p.z, 16, [BI.C.white, BI.C.gold], 4, 1, 26, 4); snd('whoosh'); G.setStick && G.setStick(0, 0);
    const r = W.resolve(tx, tz, .5, {}); P.x = r.x; P.z = r.z; P.y = 0; P.vy = 4; P.h = Math.atan2(tx - q.x, tz - q.z); fx.burst(q.x, 2.6, q.z, 16, [BI.C.white, BI.C.gold], 5, 1.2, 26, 4); snd('boing');
    const s = S(); s.pipes++; if (s.pipes === 1) { earn('huepf_roehre'); G.addStars(1); say('🟢 Wusch! Durch die Röhre gereist! +1 ⭐', 2600); } persist();
  }
  /* ===== Dino Tupfi und Kart finden ===== */
  const vehs = () => (G.vehicles ? G.vehicles() : []), dino = () => vehs().find(v => v.type === 'dino'), kart = () => vehs().find(v => v.type === 'kart' && !v.toy) || vehs().find(v => v.type === 'kart');
  let dinoAway = 0;

  /* ===== Kart-Rennen 🏁: 3 Runden, 3 Gegner, Glitzerkisten, Turbo-Pfeile ===== */
  const N = 240, TR = []; { let acc = 0, prev = null; for (let i = 0; i < N; i++) { const p = H.tp(i / N * TAU, 0); if (prev) acc += Math.hypot(p.x - prev.x, p.z - prev.z); TR.push({ x: p.x, z: p.z, h: p.h, s: acc, th: i / N * TAU }); prev = p; } TR.len = acc + Math.hypot(TR[0].x - prev.x, TR[0].z - prev.z); }
  const LAPS = 3, BOTDEF = [{ name: 'Flitzefuchs Ferdi', col: 0x4cd07d, look: { shirt: 0x2e9a5a, pants: 0x2a2f3a, hair: 0xff8a3c, skin: 0xff9a4a, fox: true, hat: 'none', style: 'short' }, sp: 1.0 },
    { name: 'Pia', col: 0xff8fc8, look: { shirt: 0xffd23f, pants: 0x2ec4b6, hair: 0x6b4423, skin: 0xf3c9a0, style: 'ponytail', hat: 'none' }, sp: .93 },
    { name: 'Pelle', col: 0x3f8cff, look: { shirt: 0x9b6bff, pants: 0x3d4a7a, hair: 0x222222, skin: 0x8d5a3b, style: 'curly', glassT: 1, hat: 'none' }, sp: .9 }];
  const bots = []; let botsMade = false;
  function mkBots() { if (botsMade) return; botsMade = true; for (const d of BOTDEF) { const v = new BI.Vehicle('kart', 0, 0, 0, { color: d.col }); v.root.visible = false; scene.add(v.root); const c = BI.makeChar(d.look); v.tilt.add(c.group); c.group.position.set(v.seat[0], v.seat[1] - .42, v.seat[2]); c.sit(); bots.push({ d, v, c, s: 0, lap: 0, off: 0, vel: 0, boost: 0, slow: 0, done: false, place: 0 }); } }
  const idxOf = (x, z, hint) => { let best = hint == null ? 0 : hint, bd = 1e9; const rng = hint == null ? N : 24; for (let j = -rng; j <= rng; j++) { const i = hint == null ? (j + rng) % N : (hint + j + N) % N, q = TR[i], d = (q.x - x) * (q.x - x) + (q.z - z) * (q.z - z); if (d < bd) { bd = d; best = i; } } return { i: best, d: Math.sqrt(bd) }; };
  const posAt = (s, off) => { s = ((s % TR.len) + TR.len) % TR.len; let lo = 0, hi = N - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (TR[m].s <= s) lo = m; else hi = m - 1; } const a = TR[lo], b = TR[(lo + 1) % N], seg = ((lo + 1) % N ? b.s : TR.len) - a.s || 1, f = (s - a.s) / seg; const th = a.th + (((lo + 1) % N ? b.th : TAU) - a.th) * f; return H.tp(th, off); };
  /* Glitzerkisten (Extras): zwei Reihen à 3, drehen sich, kommen nach 3 s wieder */
  const boxes = []; { const geo = new THREE.BoxGeometry(1.1, 1.1, 1.1), cv = document.createElement('canvas'); cv.width = cv.height = 64; const c = cv.getContext('2d'), g = c.createLinearGradient(0, 0, 64, 64); ['#ff5a8a', '#ffd23f', '#4cd07d', '#3f8cff', '#b48aff'].forEach((col, i) => g.addColorStop(i / 4, col)); c.fillStyle = g; c.fillRect(0, 0, 64, 64); c.fillStyle = '#fff'; c.font = 'bold 44px system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('✦', 32, 34);
    const mat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, opacity: .92 }); for (const th of [Math.PI * .5, Math.PI * 1.5]) for (const off of [-2.6, 0, 2.6]) { const p = H.tp(th, off), m = new THREE.Mesh(geo, mat); m.position.set(p.x, 1.1, p.z); scene.add(m); boxes.push({ x: p.x, z: p.z, m, t: 0 }); } }
  const ITEMS = [['🚀', 'Turbo-Rakete!', 2.4, 0], ['🌟', 'Sternen-Flitzer! +3 🪙', 1.6, 3], ['🫧', 'Kicher-Wolke: Die anderen werden langsamer!', 0, 0]];
  /* Startampel */
  const lightG = new THREE.Group(), lamps = []; { const L = W.spots.huepfLight; lightG.position.set(L.x, L.y, L.z); lightG.rotation.y = L.ry; for (let i = 0; i < 3; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(.22, 10, 8), new THREE.MeshBasicMaterial({ color: 0x331111 })); m.position.set(0, .35 + i * .45, .3); lightG.add(m); lamps.push(m); } scene.add(lightG); }
  const setLights = n => lamps.forEach((m, i) => m.material.color.setHex(n === 'go' ? 0x2fe060 : i < n ? 0xff3030 : 0x331111));
  const hud = document.createElement('div'); hud.id = 'huepfRace'; hud.hidden = true; hud.style.cssText = 'position:fixed;top:64px;left:50%;transform:translateX(-50%);z-index:60;padding:8px 16px;border-radius:16px;background:rgba(20,24,52,.78);color:#fff;font:800 20px Fredoka,system-ui,sans-serif;pointer-events:none;text-align:center;white-space:nowrap'; document.body.appendChild(hud);
  function raceStart(v) {
    mkBots(); { const p = posAt(TR.len - 8, -2.2); v.setPose(p.x, p.z, p.h); } v.v = 0;
    /* Alle stehen vor der Linie: Runde −1, das erste Überfahren der Linie startet Runde 0 */
    const st = [[-8, 2.2], [-14, -2.2], [-14, 2.2]]; bots.forEach((b, i) => { b.s = TR.len + st[i][0]; b.off = st[i][1]; b.lap = -1; b.vel = 0; b.boost = 0; b.slow = 0; b.done = false; b.place = 0; b.v.root.visible = true; const p = posAt(b.s, b.off); b.v.setPose(p.x, p.z, p.h); });
    K.race = { phase: 'count', t: 3.2, v, lap: -1, idx: idxOf(v.x, v.z).i, cp: 3, boost: 0, done: false, time: 0, place: 0 };
    hud.hidden = false; say('🏁 Gleich geht’s los! 3 Runden – Glitzerkisten ✦ geben Extras, gelbe Pfeile machen schnell!', 3600); A.speak && A.speak('Auf die Plätze!');
  }
  function raceStop(quiet, why) { const R = K.race; if (!R) return; K.race = null; K.stopWhy = why || ''; hud.hidden = true; setLights(0); for (const b of bots) b.v.root.visible = false; if (!quiet) say('🏁 Rennen beendet', 1600); }
  const progOf = b => b.lap * TR.len + b.s;
  function raceUpdate(dt, t) {
    const R = K.race, v = R.v; if (P.veh !== v) { raceStop(false, 'veh'); return; }
    if (R.phase === 'count') { R.t -= dt; v.v = 0; const n = R.t > 2.2 ? 1 : R.t > 1.2 ? 2 : 3; if (n !== R.n) { R.n = n; snd('ding'); } setLights(n); hud.textContent = ['', '🔴', '🔴🔴', '🔴🔴🔴'][n] + ' Achtung …'; if (R.t <= 0) { R.phase = 'run'; setLights('go'); snd('fanfare'); say('🟢 LOS!', 1200); } }
    else {
      R.time += dt; if (R.time > 1.5) setLights(0);
      /* Spieler-Fortschritt auf der Strecke */
      /* Fortschritt: nächster Streckenpunkt; Runde zählt nur nach allen drei Kontrollpunkten (¼, ½, ¾) – Abkürzen über den Rasen zählt nicht */
      let f = idxOf(v.x, v.z, R.idx); if (f.d > 10) f = idxOf(v.x, v.z);
      while (R.cp < 3 && f.i >= (R.cp + 1) * N / 4 && f.i < (R.cp + 1) * N / 4 + N / 6) R.cp++; /* überfahren zählt, auch bei großen Sprüngen pro Bild */
      if (f.i < 40 && R.idx > N - 40 && R.cp >= 3) { R.lap++; R.cp = 0; if (R.lap >= 1 && R.lap < LAPS) { say('🏁 Runde ' + (R.lap + 1) + ' von ' + LAPS + (R.lap === LAPS - 1 ? ' – letzte Runde!' : ''), 1800); snd('ding'); } }
      R.idx = f.i;
      if (f.d > k.w / 2 + 1.5) v.v *= Math.max(0, 1 - 1.6 * dt);                                     /* neben der Strecke bremst der Rasen */
      if (R.boost > 0) { R.boost -= dt; v.v = Math.max(v.v, v.spec.max * 1.55); if (Math.random() < dt * 40) fx.emit(v.x - Math.sin(v.h) * 1.4, .45, v.z - Math.cos(v.h) * 1.4, 0, 1, 0, .4, 30, 1, .7, .2, 0, .6); }
      for (const th of W.spots.huepfBoost) { const p = H.tp(th, 0); if (Math.hypot(v.x - p.x, v.z - p.z) < 3 && R.boostCd !== th) { R.boost = Math.max(R.boost, 1.4); R.boostCd = th; snd('whoosh'); } else if (R.boostCd === th && Math.hypot(v.x - p.x, v.z - p.z) > 6) R.boostCd = null; }
      for (const bx of boxes) if (bx.t <= 0 && Math.hypot(v.x - bx.x, v.z - bx.z) < 1.9) { bx.t = 3; const it = ITEMS[(Math.random() * ITEMS.length) | 0]; snd('pop'); fx.burst(bx.x, 1.2, bx.z, 14, [BI.C.gold, BI.C.pink, BI.C.blue, BI.C.white], 4, 1, 26, 4); say(it[0] + ' ' + it[1], 1800); if (it[2]) R.boost = Math.max(R.boost, it[2]); if (it[3]) coin(it[3]); if (!it[2] && !it[3]) for (const b of bots) if (progOf(b) > R.lap * TR.len + TR[R.idx].s) b.slow = 2.5; }
      const me = R.lap * TR.len + TR[R.idx].s + (R.cp === 0 && R.idx > N * .75 ? -TR.len : 0);
      /* Gegner: fahren ihre Spur, Gummiband (nie zu weit weg), eigene Turbo-Pfeile */
      const lvl = Math.min(2, S().races); for (const b of bots) { if (b.done) { b.vel = BI.damp(b.vel, 6, 2, dt); } else { let want = 18.2 * b.d.sp * (1 + lvl * .04); const gap = progOf(b) - me; if (gap > 25) want *= .82; else if (gap < -35) want *= 1.15; if (b.slow > 0) { b.slow -= dt; want *= .55; } if (b.boost > 0) { b.boost -= dt; want *= 1.35; }
          b.vel = BI.damp(b.vel, want, 1.4, dt); }
        const s0 = b.s; b.s += b.vel * dt; for (const th of W.spots.huepfBoost) { const ss = TR[Math.round(th / TAU * N) % N].s; if (s0 < ss && b.s >= ss) b.boost = 1.1; } if (b.s >= TR.len) { b.s -= TR.len; b.lap++; if (b.lap >= LAPS && !b.done) { b.done = true; b.place = 1 + bots.filter(q => q.done && q !== b).length + (R.done ? 1 : 0); } }
        const p = posAt(b.s, b.off + Math.sin(t * .7 + b.d.sp * 9) * .8); b.v.setPose(p.x, p.z, p.h); b.v.v = b.vel; b.v.visual(dt, t, fx); }
      const place = 1 + bots.filter(b => progOf(b) > me).length; R.place = place;
      hud.textContent = '🏁 Runde ' + Math.max(1, Math.min(LAPS, R.lap + 1)) + '/' + LAPS + ' · Platz ' + place + '/4' + (R.boost > 0 ? ' 🚀' : '');
      if (R.lap >= LAPS && !R.done) raceFinish(place);
    }
  }
  function raceFinish(place) {
    const R = K.race; R.done = true; const s = S(), stars = [5, 3, 2, 1][place - 1] || 1; s.races++; if (place === 1) s.wins++; s.best = s.best ? Math.min(s.best, place) : place; G.addStars(stars); earn('huepf_kart'); if (place === 1) earn('huepf_pokal');
    fx.burst(R.v.x, 2.5, R.v.z, 40, [BI.C.gold, BI.C.white, BI.C.pink, BI.C.blue], 6, 1.5, 30, 6); A.fanfare && A.fanfare(); persist();
    say(['🏆 1. PLATZ – Pokal für dich!', '🥈 2. Platz – super gefahren!', '🥉 3. Platz – stark!', '🏁 Ins Ziel gekommen – beim nächsten Mal klappt’s!'][place - 1] + ' +' + stars + ' ⭐', 4600); A.speak && A.speak(place === 1 ? 'Gewonnen!' : 'Im Ziel!');
    setTimeout(() => { if (K.race === R) raceStop(true, 'ziel'); }, 4000);
  }
  /* ===== Burg-Mutprobe gegen Felsenkönig Brocko ===== */
  const C = W.spots.huepfCastle, brocko = BI.makeBrocko(); brocko.root.position.set(C.x0 + 3.4, .9, C.z); brocko.root.rotation.y = Math.PI / 2; brocko.root.scale.setScalar(1.25); scene.add(brocko.root);
  const BTN = [[C.x - 3, C.z - 6.5], [C.x + 4, C.z], [C.x - 3, C.z + 6.5]], btns = BTN.map(([x, z]) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.1, .22, 18), new THREE.MeshLambertMaterial({ color: 0x8f899f, emissive: 0x000000 })); m.position.set(x, .11 + .08, z); scene.add(m); return { x, z, m }; });
  const rockGeo = new THREE.IcosahedronGeometry(.85, 1), rockMat = new THREE.MeshLambertMaterial({ color: 0x8a8296 }), rocks = [];
  const B = { on: false, step: 0, hits: 0, spawn: 0, mood: 0 };
  function bossStart() { B.on = true; B.step = 0; B.hits = 0; B.spawn = 1.2; lightBtn(); say('🪨 Brocko: „Grrr! Du willst meinen Sonnenstern? Dann drück meine drei Kitzel-Knöpfe – wenn du dich traust!“', 4200); A.speak && A.speak('Grrr!'); }
  function lightBtn() { btns.forEach((b, i) => { b.m.material.color.setHex(i === B.step ? 0xffc928 : 0x8f899f); b.m.material.emissive.setHex(i === B.step ? 0x6a4a00 : 0); }); }
  function bossStop(win) {
    B.on = false; for (const r of rocks) scene.remove(r.m); rocks.length = 0; btns.forEach(b => { b.m.material.color.setHex(0x8f899f); b.m.material.emissive.setHex(0); });
    if (win) { const s = S(), first = !s.boss; s.boss = 1; persist(); B.mood = 6; fx.burst(brocko.root.position.x, 4, brocko.root.position.z, 60, [BI.C.gold, BI.C.white, BI.C.pink], 7, 1.8, 30, 6); A.fanfare && A.fanfare();
      if (first) { G.addStars(10); earn('huepf_brocko'); say('🌞 Brocko lacht so laut, dass die Burg wackelt: „Hahaha! Du hast mich durchgekitzelt! Hier ist der Sonnenstern – und ab jetzt sind wir Freunde!“ +10 ⭐', 6500); } else say('🪨 Brocko kichert: „Schon wieder durchgekitzelt! Du bist echt mutig!“', 3200); }
  }
  /* ===== Figuren ===== */
  K.people = function (folk) {
    const mk = (dx, dz, look, name, lines, face) => { const p = at(dx, dz), c = BI.makeChar(look), h = face != null ? face : Math.atan2(H.x - p.x, H.z - p.z); c.group.position.set(p.x, W.groundY(p.x, p.z), p.z); c.group.rotation.y = h; scene.add(c.group); const n = { c, x: p.x, z: p.z, h, h0: h, p: { name, lines, i: 0 }, wait: 0, hop: 0, kid: !!look.scale && look.scale < .9, fixed: true }; folk.push(n); return n; };
    mk(63, -15, BOTDEF[1].look, 'Pia', ['Willkommen im Hüpfland! Ich bin Pia. 🍄', 'Felsenkönig Brocko hat unseren Sonnenstern in seine Burg geholt. Ohne ihn ist es hier so … grau.', 'Erst zeig ich dir alles: Reite Dino Tupfi am Stall, reise durch die Röhren und stoß die ⭐-Blöcke von unten an!', 'Wenn du dich traust: In der Burg wartet Brockos Mutprobe.']);
    mk(50, -4, BOTDEF[2].look, 'Pelle', ['Ich bin Pelle, Pias großer Bruder. 🤓', 'Die Röhren gehören immer zu zweit zusammen – gleiche Farbe, anderer Ort!', 'Die Kicher-Blume beißt nicht. Sie lacht nur, wenn man sie kitzelt.', 'Im Automaten am Platz gibt es das Hüpf-Abenteuer. Bis zur Burg schaffst du’s!']);
    mk(56, 30, BOTDEF[0].look, 'Flitzefuchs Ferdi', ['Na, kleiner Flitzer? Ich bin Ferdi – der schnellste Fuchs der Insel! 🦊', 'Setz dich ins gelbe Kart und fahr durchs Start-Tor – dann zeig ich dir meinen Auspuff!', 'Glitzerkisten ✦ geben Extras: Turbo, Sterne oder eine Kicher-Wolke für uns. Hmpf!', 'Ich sammle Münzen wie verrückt. Na gut … ich teile auch mal. Manchmal.']);
    mk(H.stable.x - 5, H.stable.z + 3, { shirt: 0x7fd0ff, pants: 0x6b4a8a, hair: 0xe8e8e8, skin: 0xf3c9a0, style: 'bun', glassT: 1, hat: 'none', dress: true }, 'Dino-Oma Mira', ['Das ist Tupfi, mein Lieblings-Dino! 🦕', 'Setz dich auf den Sattel – mit der Hupe macht er einen Riesensprung.', 'Mit Tupfi kommst du sogar an die hohen ⭐-Blöcke.']);
  };
  /* ===== Nähe-Aktionen ===== */
  K.near = function () {
    if (!near(10)) return null;
    const R = K.race, v = P.veh;
    if (v && v.type === 'kart' && !R) { const g = H.tp(0, 0); if (Math.hypot(v.x - g.x, v.z - g.z) < 9) return { k: 'hrace', label: ['🏁', 'Rennen starten (3 Runden)'] }; }
    if (v || P.y > 2.8) return null;
    for (const p of pipes) if (Math.hypot(P.x - p.x, P.z - p.z) < 2.9) return { k: 'hpipe', p, label: ['🟢', 'In die Röhre!'] };
    const g = C.gate; if (!B.on && Math.hypot(P.x - (C.x1 - 3), P.z - C.z) < 3.4) return { k: 'hboss', label: S().boss ? ['🪨', 'Nochmal kitzeln (Mutprobe)'] : ['🪨', 'Mutprobe bei Brocko starten'] };
    return null;
  };
  K.act = function (n) { if (!n) return; if (n.k === 'hpipe') usePipe(n.p); else if (n.k === 'hboss') bossStart(); else if (n.k === 'hrace' && P.veh) raceStart(P.veh); };
  /* ===== Jede Runde ===== */
  let seen = false;
  K.update = function (dt, t) {
    if (!near(60)) { if (K.race) raceStop(true, 'weg'); if (B.on) bossStop(false); return; }
    const s = S(); if (!seen && near(0) && Math.hypot(P.x - H.x, P.z - H.z) < H.R) { seen = true; if (!s.visit) { s.visit = 1; earn('huepf_insel'); persist(); say('🍄 Willkommen im Hüpfland! Pia am Platz erklärt dir alles.', 3600); } }
    /* Sternblöcke: Kopfstoß beim Springen (zu Fuß) oder auf Dino Tupfi */
    const v = P.veh, dv = v && v.type === 'dino' ? v : null;
    for (const b of blocks) { b.bump = Math.max(0, b.bump - dt); b.m.position.y = BLK_Y + .525 + Math.sin(b.bump / .25 * Math.PI) * .35; b.m.rotation.y = Math.sin(t * .8 + b.i) * .08;
      if (b.cool > 0) { b.cool -= dt; continue; }
      if (!v && P.vy > .5 && Math.hypot(P.x - b.x, P.z - b.z) < .95 && P.y + 1.85 >= BLK_Y - .05 && P.y + 1.85 < BLK_Y + .6) { P.vy = -1.5; b.cool = .5; hitBlock(b); }
      else if (dv && dv.hvy > .5 && Math.hypot(dv.x - b.x, dv.z - b.z) < 1.3 && dv.y + 2.9 >= BLK_Y) { dv.hvy = -2; b.cool = .5; hitBlock(b); } }
    /* Münzen */
    for (let i = 0; i < coins.length; i++) { const c = coins[i]; if (c.t > 0) { c.t -= dt; _s.set(0, 0, 0); } else { _s.set(1, 1, 1); const px = v ? v.x : P.x, pz = v ? v.z : P.z, py = v ? v.y : P.y; if (Math.hypot(px - c.x, pz - c.z) < 1.2 && py < c.y + 1 && py + 2.2 > c.y - .6) { c.t = 45; coin(1); fx.burst(c.x, c.y, c.z, 6, [BI.C.gold, BI.C.white], 2, .5, 22, 2); } }
      _q.setFromAxisAngle(_ax, t * 3 + i); coinMesh.setMatrixAt(i, _m.compose(_p.set(c.x, c.y + Math.sin(t * 2 + i) * .1, c.z), _q, _s)); } coinMesh.instanceMatrix.needsUpdate = true;
    /* Röhren: Kicher-Blume schaut heraus, wenn jemand in der Nähe ist */
    for (const p of pipes) { const d = Math.hypot(P.x - p.x, P.z - p.z), want = d < 8 ? 1 : 0; p.up = BI.damp(p.up, want, 4, dt); p.g.position.y = .9 + p.up * 2.3; p.g.rotation.z = Math.sin(t * 2.2 + p.i) * .12 * p.up; p.g.rotation.y = Math.atan2(P.x - p.x, P.z - p.z); p.g.visible = p.up > .03;
      if (want && p.up > .8 && !p.said) { p.said = 1; snd('pop'); if (d < 5) say(pipeLines[(p.i + (S().pipes | 0)) % pipeLines.length], 2200); } else if (!want) p.said = 0; }
    /* Dino: Sticker beim ersten Ritt, verlassener Dino trabt zurück zum Stall */
    const dn = dino(); if (dn) { if (P.veh === dn && !s.dino) { s.dino = 1; earn('huepf_dino'); G.addStars(2); persist(); say('🦕 Tupfi freut sich! Mit dem Hupe-Knopf macht er einen Riesensprung. +2 ⭐', 4200); }
      if (!dn.driver) { dinoAway += dt; const h = W.spots.huepfDino; if (dinoAway > 40 && Math.hypot(dn.x - h.x, dn.z - h.z) > 6 && Math.hypot(P.x - dn.x, P.z - dn.z) > 16) { dn.setPose(h.x, h.z, h.h); dn.v = 0; dinoAway = 0; } } else dinoAway = 0; }
    /* Glitzerkisten drehen sich */
    for (const bx of boxes) { bx.t -= dt; bx.m.visible = bx.t <= 0; bx.m.rotation.y += dt * 1.6; bx.m.rotation.x = Math.sin(t + bx.x) * .3; bx.m.position.y = 1.1 + Math.sin(t * 2 + bx.z) * .15; }
    if (K.race) raceUpdate(dt, t); else K.autoStart();
    /* Burg */
    const bp = brocko.root.position, inside = P.x > C.x0 && P.x < C.x1 + 1 && P.z > C.z0 && P.z < C.z1; brocko.root.rotation.y = BI.damp(brocko.root.rotation.y, Math.atan2(P.x - bp.x, P.z - bp.z), 2, dt);
    B.mood = Math.max(0, B.mood - dt); brocko.inner.position.y = B.mood > 0 ? Math.abs(Math.sin(t * 9)) * .35 : Math.sin(t * 1.4) * .04; brocko.head.rotation.z = B.mood > 0 ? Math.sin(t * 12) * .15 : Math.sin(t * .9) * .05;
    if (B.on) {
      if (!inside && Math.hypot(P.x - C.x, P.z - C.z) > C.x1 - C.x0) { bossStop(false); say('🪨 Brocko brummt: „Weggelaufen? Hehe!“', 2000); return; }
      B.spawn -= dt; if (B.spawn <= 0) { B.spawn = Math.max(.85, 1.6 - B.step * .25); const m = new THREE.Mesh(rockGeo, rockMat), z = C.z + ((Math.random() * 5) | 0) * 2.9 - 5.8; m.position.set(bp.x + 2, .85, z); scene.add(m); rocks.push({ m, x: bp.x + 2, z, v: 6 + B.step * 1.3 + Math.random() * 1.5 }); snd('thwack'); brocko.inner.rotation.x = -.3; }
      brocko.inner.rotation.x = BI.damp(brocko.inner.rotation.x, 0, 4, dt);
      for (let i = rocks.length - 1; i >= 0; i--) { const r = rocks[i]; r.x += r.v * dt; r.m.position.x = r.x; r.m.rotation.z -= r.v * dt / .85; if (r.x > C.x1 - .6) { fx.burst(r.x, .6, r.z, 6, [BI.C.dust], 2, .5, 26, 2); scene.remove(r.m); rocks.splice(i, 1); continue; }
        if (!v && Math.hypot(P.x - r.x, P.z - r.z) < 1.35 && P.y < 1.1) { scene.remove(r.m); rocks.splice(i, 1); B.hits++; snd('bump'); const q = W.resolve(Math.min(C.x1 - 1.5, P.x + 3.5), P.z, .5, {}); P.x = q.x; P.z = q.z; P.vy = 5; fx.burst(P.x, 1, P.z, 10, [BI.C.dust, BI.C.white], 3, .7, 26, 3);
          if (B.hits >= 3) { bossStop(false); B.mood = 3; say('🪨 Brocko lacht: „Bumm, bumm, bumm! Drei Kiesel erwischt – probier’s gleich nochmal!“', 3600); return; } say('💥 Bumm! Noch ' + (3 - B.hits) + ' Versuche – spring über die Kiesel!', 1800); } }
      const bt = btns[B.step]; if (bt && !v && Math.hypot(P.x - bt.x, P.z - bt.z) < 1.15 && P.y < .6) { B.step++; B.mood = 1.5; snd('ding'); fx.burst(bt.x, .6, bt.z, 14, [BI.C.gold, BI.C.white], 3, .8, 26, 3); say(['🤭 Brocko: „Hihi! Das kitzelt!“', '😆 Brocko: „Hahaha – hör auf!“', ''][B.step - 1] || '', 1800); if (B.step >= btns.length) bossStop(true); else lightBtn(); }
      for (const b of btns) b.m.position.y = .19 + (b === btns[B.step] ? Math.sin(t * 6) * .04 : 0);
    }
  };
  /* Kart-Rennen startet auch, wenn man im Kart durchs Start-Tor fährt (ohne Knopf) */
  K.autoStart = function () { const v = P.veh; if (!v || v.type !== 'kart' || K.race || !near(0)) return; const g = H.tp(0, 0); if (Math.abs(v.v) > 3 && Math.hypot(v.x - g.x, v.z - g.z) < 3) raceStart(v); };
  /* Hüpf-Abenteuer (Automat) geschafft */
  const prevWin = BI.JUMP && BI.JUMP.onWin; if (BI.JUMP) BI.JUMP.onWin = (kind, score) => { if (prevWin) prevWin(kind, score); if (kind !== 'jump_huepf') return; const s = S(); if (!s.level) { s.level = 1; G.addStars(3); persist(); } earn('huepf_level'); };
  K.log = () => { const s = S(); return { title: '🍄 Hüpfland', count: s.blocks.length + ' von ' + H.blocks.length + ' Sternblöcken', rows: [
    { ok: !!s.visit, icon: '🍄', text: 'Das Hüpfland besuchen (Brücke im Westen)', dest: 'huepf' },
    { ok: !!s.dino, icon: '🦕', text: 'Auf Dino Tupfi reiten (Dino-Stall) – Hupe = Riesensprung', dest: 'huepf' },
    { ok: s.pipes > 0, icon: '🟢', text: 'Durch eine Röhre reisen', dest: 'huepf' },
    { ok: s.blocks.length >= H.blocks.length, icon: '⭐', text: 'Alle Sternblöcke von unten anstoßen: ' + s.blocks.length + ' von ' + H.blocks.length, dest: 'huepf' },
    { ok: s.races > 0, icon: '🏁', text: 'Ein Kart-Rennen fahren (gelbes Kart, durchs Start-Tor)', dest: 'huepf' },
    { ok: s.wins > 0, icon: '🏆', text: 'Ein Kart-Rennen gewinnen', dest: 'huepf' },
    { ok: !!s.level, icon: '🦖', text: 'Das Hüpf-Abenteuer am Automaten schaffen', dest: 'huepf' },
    { ok: !!s.boss, icon: '🪨', text: 'Felsenkönig Brocko durchkitzeln (Mutprobe in der Burg)', dest: 'huepf' }] }; };
  K.cheatAll = function () { const s = S(); s.visit = s.dino = s.level = s.boss = 1; s.pipes = Math.max(1, s.pipes); s.races = Math.max(1, s.races); s.wins = Math.max(1, s.wins); s.blocks = H.blocks.map((_, i) => i); for (const b of blocks) b.m.material = b.used; ['huepf_insel', 'huepf_dino', 'huepf_roehre', 'huepf_bloecke', 'huepf_kart', 'huepf_pokal', 'huepf_level', 'huepf_brocko'].forEach(earn); persist(); };
  K.dbg = { blocks, pipes, coins, bots, B, btns, rocks, TR, raceStart, raceStop, hitBlock, usePipe, bossStart, posAt, idxOf };
  K.busy = () => !!(K.race || B.on);
  return K;
};
