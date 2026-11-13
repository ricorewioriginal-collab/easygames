'use strict';
/* Bunte Insel – Taschi-Land 🌀 (Welt): Insel im Osten mit Professor-Statue, Labor, Heilhaus, Fangladen, runder Arena mit dem Taschi-Portal (taschi-game.js),
   Wiesen und Lager mit Heißluftballon. Fangen/Kämpfen gibt es im eigenen easygames-Spiel „Taschi“. ALLES SELBST ERFUNDEN („inspiriert“). */
BI.TASCHI = (function () {
  const R = 80, d = 450, ang = 20.5 * Math.PI / 180, cx = Math.cos(ang) * d, cz = Math.sin(ang) * d, ux = Math.cos(ang), uz = Math.sin(ang);
  const A0 = { x: ux * 171, z: uz * 171 }, A1 = { x: cx - ux * (R - 5), z: cz - uz * (R - 5) };
  const T = { id: 'taschi', x: cx, z: cz, R, ux, uz, entry: { x: cx - ux * (R - 14), z: cz - uz * (R - 14) },
    bridge: { mx: (A0.x + A1.x) / 2, mz: (A0.z + A1.z) / 2, L: Math.hypot(A1.x - A0.x, A1.z - A0.z) + 2, w: 7, ry: Math.atan2(ux, uz) } };
  T.at = (a, b) => ({ x: cx + ux * a - uz * b, z: cz + uz * a + ux * b }); /* a = nach außen, b = zur Seite */
  T.zones = [{ id: 'wiese', a: -6, b: 52, r: 15, n: 'Blumenwiese' }, { id: 'teich', a: 46, b: 36, r: 14, n: 'Teichufer' }, { id: 'fels', a: 48, b: -34, r: 13, n: 'Felsgrat' }, { id: 'huegel', a: -6, b: -52, r: 14, n: 'Glut-Hügel' }];
  T.arena = { a: 24, b: 0, r: 22 };
  T.statue = { a: -34, b: 0 };
  /* Stehplatz in der Arena: off = Winkel zur Rückwand (0 = hinten Mitte), rad = Abstand zur Arena-Mitte; h = Blick zur Mitte */
  T.arenaPos = (off, rad) => { const m = T.at(T.arena.a, T.arena.b), g = Math.atan2(T.entry.x - m.x, T.entry.z - m.z) + Math.PI + off, x = m.x + Math.sin(g) * rad, z = m.z + Math.cos(g) * rad; return { x, z, h: Math.atan2(m.x - x, m.z - z) }; };
  return T;
})();

BI.buildTaschiGround = function (c) {
  const { W, st, lamp, ROADY } = c, T = BI.TASCHI, TAU = Math.PI * 2, rn = BI.rng(5151), at = T.at, E = T.entry;
  W.spots.taschi = { x: E.x, z: E.z }; W.taschi = T;
  st.disc(T.x, T.z, T.R + 9, 0, 0x7fd66b, 80); st.ring(T.x, T.z, T.R - 5, T.R + 9, .012, 0xf1e3b0, 80);
  BI.buildIsleBridge(c, T);
  const P = (a, b) => at(a, b), pave = (a, b, r, col) => { const p = P(a, b); st.disc(p.x, p.z, r, ROADY + .01, col, 40); };
  /* Platz: Pflaster mit großem Ball-Zeichen, Weg zum Eingang */
  { const e = E; st.disc(e.x, e.z, 9, ROADY + .01, 0xf0e4c8, 36); st.ring(e.x, e.z, 6.5, 7.6, ROADY + .02, 0xe8453c, 36); const s = P(T.statue.a, T.statue.b); pave(T.statue.a, T.statue.b, 18, 0xe8dcc0); const q = P(T.statue.a, T.statue.b); st.ring(q.x, q.z, 12, 13.2, ROADY + .03, 0xe8453c, 48); st.ring(q.x, q.z, 6.6, 7.2, ROADY + .03, 0xffffff, 40); st.strip((e.x + s.x) / 2, (e.z + s.z) / 2, 4, Math.hypot(s.x - e.x, s.z - e.z), T.bridge.ry, ROADY + .015, 0xd8c8a0); }
  /* Gebäude: (a,b) Mitte, w Seitenlänge, wall/roof Farben */
  const house = (a, b, w, hh, wall, roof, cross) => { const p = P(a, b), r = w * .72; st.box(p.x, 0, p.z, w, hh, w, wall, T.bridge.ry); st.box(p.x, hh, p.z, w + 1, .35, w + 1, roof, T.bridge.ry); st.cyl(p.x, hh + .35, p.z, 0, r + .8, 3.2, roof, 4, 0, T.bridge.ry + Math.PI / 4); W.addBox(p.x - w / 2 - .1, p.z - w / 2 - .1, p.x + w / 2 + .1, p.z + w / 2 + .1, false, hh + 3);
    for (const sd of [-1, 1]) for (const k of [-1, 1]) { const wx = p.x + (Math.cos(T.bridge.ry) * k * w * .25 + Math.sin(T.bridge.ry) * sd * w * .5), wz = p.z + (-Math.sin(T.bridge.ry) * k * w * .25 + Math.cos(T.bridge.ry) * sd * w * .5); st.box(wx, 1.4, wz, 1.5, 1.4, 1.5, 0x9fd8ff, T.bridge.ry); }
    if (cross) { st.box(p.x, hh + 4.2, p.z, .8, 2.4, .8, 0xffffff); st.box(p.x, hh + 4.7, p.z, 2.4, .8, .8, 0xffffff); } return p; };
  house(-38, 28, 12, 5, 0xf4f4fa, 0xe8453c, 0);                   /* Labor */
  { const p = P(-38, 28); st.sph(p.x, 10.4, p.z, 1.0, 0xe8453c, 1); st.sph(p.x, 10.4, p.z, 1.01, 0xffffff, 1, 1, .12, 1); }
  house(-38, -28, 11, 4.6, 0xffd6e0, 0xe8453c, 1);                /* Heilhaus */
  house(-16, -30, 9, 4, 0xd8ecff, 0x3f8cff, 0);                   /* Fangladen */
  /* Professor-Statue (groß): Sockel, Hose, Kittel, Arme (rechts hoch mit riesigem Taschiball), Kopf mit Haaren, Brille, Lächeln – schaut zum Eingang */
  { const q = P(T.statue.a, T.statue.b), fx0 = -T.ux, fz0 = -T.uz, ry = Math.atan2(fx0, fz0), sx0 = fz0, sz0 = -fx0;
    const at2 = (f, sd) => [q.x + fx0 * f + sx0 * sd, q.z + fz0 * f + sz0 * sd], bx = (f, sd, y, w, h, d, col) => { const [x, z] = at2(f, sd); st.box(x, y, z, w, h, d, col, ry); }, sp = (f, sd, y, r, col, sx, sy, sz) => { const [x, z] = at2(f, sd); st.sph(x, y, z, r, col, 1, sx || 1, sy || 1, sz || 1); };
    st.cyl(q.x, 0, q.z, 5.2, 5.6, 1.1, 0xb8bac4, 24); st.cyl(q.x, 1.1, q.z, 4.2, 4.6, .6, 0xc8cad4, 24);
    for (const sd of [-1, 1]) { bx(0, sd * 1.0, 1.7, 1.6, 4.6, 1.8, 0x7d88a8); bx(.5, sd * 1.0, 1.7, 1.7, .6, 2.6, 0x4a4a5a); }
    bx(0, 0, 4.0, 4.7, 2.9, 2.7, 0xf4f4f8); bx(0, 0, 6.5, 4.3, 4.3, 2.4, 0xf4f4f8); bx(1.22, 0, 6.6, 1.3, 4.0, .12, 0x4a6ad8); bx(1.25, -1.5, 7.2, .5, 3.4, .1, 0xdfe2ee); bx(1.25, 1.5, 7.2, .5, 3.4, .1, 0xdfe2ee);
    bx(1.24, 1.1, 9.4, 1.0, 1.0, .1, 0xe8453c); /* Anstecker */
    bx(0, -2.9, 6.9, 1.3, 3.9, 1.4, 0xf4f4f8); sp(.1, -2.9, 6.7, .75, 0xe9c9a8);          /* linker Arm hängt */
    bx(0, 2.9, 9.8, 1.3, 3.3, 1.4, 0xf4f4f8); sp(.1, 2.9, 13.4, .8, 0xe9c9a8);           /* rechter Arm hoch */
    { const [x, z] = at2(.1, 2.9); st.sph(x, 15.4, z, 2.0, 0xe8453c, 2); st.sph(x, 15.4, z, 2.03, 0xffffff, 2, 1, .5, 1); st.sph(x, 15.4, z, 2.07, 0x2a2230, 2, 1, .09, 1); const [x2, z2] = at2(2.0, 2.9); st.sph(x2, 15.4, z2, .5, 0xffffff, 1); st.sph(x2, 15.4, z2, .3, 0xe8453c, 1); lamp.sph(x, 17.9, z, .4, 0xfff3b0, 1); }
    sp(0, 0, 12.3, 1.6, 0xe9c9a8); sp(-.35, 0, 13.35, 1.55, 0xd8d8e2, 1.05, .6, 1.05); for (const sd of [-1, 1]) sp(-.4, sd * 1.45, 12.6, .6, 0xd8d8e2, .8, 1.2, 1);
    for (const sd of [-1, 1]) { bx(1.55, sd * .62, 12.5, .95, .75, .12, 0x333a4a); bx(1.6, sd * .62, 12.6, .62, .5, .1, 0x9fd8ff); sp(1.5, sd * .62, 12.9, .1, 0x2a2230); } bx(1.56, 0, 12.8, .45, .12, .12, 0x333a4a); sp(1.65, 0, 12.1, .25, 0xdcb494); bx(1.55, 0, 11.45, 1.0, .14, .1, 0xb86a5a);
    W.addCircle(q.x, q.z, 5.4, false, 16); }
  /* Starter-Tisch vor dem Labor: drei Taschibälle */
  { const q = P(-30, 16); st.cyl(q.x, 0, q.z, 2.4, 2.6, 1.1, 0xc8803c, 14); for (let i = 0; i < 3; i++) { const bx = q.x + Math.sin(i * 2.1) * 1.2, bz = q.z + Math.cos(i * 2.1) * 1.2; st.sph(bx, 1.5, bz, .45, [0xe8453c, 0x3f8cff, 0x4cc05a][i], 1); st.sph(bx, 1.5, bz, .47, 0xffffff, 1, 1, .4, 1); } W.addCircle(q.x, q.z, 2.6, false, 1.3); }
  /* Arena: runde Mauer mit Tor zum Platz, Boden mit Kampfkreis, Tribünen-Fahnen */
  { const A = T.arena, m = P(A.a, A.b), N = 30, gate = Math.atan2(E.x - m.x, E.z - m.z); st.disc(m.x, m.z, A.r - 1.2, ROADY + .01, 0xe3d4a8, 48); st.ring(m.x, m.z, 9, 10, ROADY + .03, 0xe8453c, 40); st.ring(m.x, m.z, 3.2, 3.8, ROADY + .03, 0xffffff, 28); st.disc(m.x, m.z, 1.1, ROADY + .04, 0xe8453c, 14);
    st.rect(m.x - 1, m.z - 10, m.x + 1, m.z + 10, ROADY, 0xe3d4a8);
    const COL = [0xa89878, 0x3f9cff, 0xffd23f, 0x4cc05a, 0xf0c038];
    for (let i = 0; i < N; i++) { const a = i / N * TAU, da = Math.abs(Math.atan2(Math.sin(a - gate), Math.cos(a - gate))); if (da < .24) continue; const x = m.x + Math.sin(a) * A.r, z = m.z + Math.cos(a) * A.r; st.box(x, 0, z, 4.4, 5.4, 1.6, 0xefe6d2, a); st.box(x, 5.4, z, 4.6, .5, 1.9, COL[i % 5], a); W.addCircle(x, z, 1.5, false, 5.4); if (i % 5 === 0) { st.box(x - Math.sin(a) * .9, 2.2, z - Math.cos(a) * .9, .2, 3, 1.2, COL[(i / 5) % 5 | 0], a); } }
    for (const s of [-1, 1]) { const a = gate + s * .27, x = m.x + Math.sin(a) * A.r, z = m.z + Math.cos(a) * A.r; st.cyl(x, 0, z, 1.0, 1.1, 8, 0xd8c8a0, 10); st.sph(x, 8.5, z, 1.2, 0xe8453c, 1); W.addCircle(x, z, 1.2, false, 8); }
    lamp.sph(m.x, 9, m.z, .5, 0xfff3b0, 1);
    [[-1.3, 0xa89878], [-.65, 0x3f9cff], [.65, 0xffd23f], [1.3, 0x4cc05a]].forEach(([o, col]) => { const q = T.arenaPos(o, 17.5); st.box(q.x, 0, q.z, 3, 4.6, .3, col, q.h); st.box(q.x, 0, q.z, 3.4, .3, 1.2, 0xd8c8a0, q.h); W.addBox(q.x - 1.6, q.z - 1.6, q.x + 1.6, q.z + 1.6, false, 1); });
    { const q = T.arenaPos(0, 16.5); st.cyl(q.x, 0, q.z, 2.6, 2.9, .7, 0xffd23f, 16); st.cyl(q.x, .7, q.z, 1.6, 1.8, .15, 0xfff0a0, 16); const b = T.arenaPos(0, 19.5); st.box(b.x, 0, b.z, 5, 5.2, .3, 0xb36bff, b.h); st.sph(b.x, 4.8, b.z, .6, 0xffd23f, 1); W.addCircle(q.x, q.z, 2.9, false, .7); } }
  /* Gras-Zonen: dunklere Flecken mit Halmen, Teich, Felsen, Glut-Steine */
  for (const Z of T.zones) { const p = P(Z.a, Z.b); st.disc(p.x, p.z, Z.r, ROADY + .015, Z.id === 'fels' ? 0x6fae5a : Z.id === 'huegel' ? 0x8aa84a : 0x4fb04a, 32);
    for (let i = 0; i < 70; i++) { const a = rn() * TAU, dd = Math.sqrt(rn()) * (Z.r - .6), x = p.x + Math.sin(a) * dd, z = p.z + Math.cos(a) * dd, h = .8 + rn() * .6; st.cone(x, 0, z, .2, h, [0x2f9a3f, 0x3fb04a, 0x58c050][i % 3], 4); st.cone(x + .15, 0, z + .1, .16, h * .8, 0x2f9a3f, 4); }
    if (Z.id === 'teich') { st.disc(p.x, p.z, 4, ROADY + .02, 0x5bb8f0, 24); st.ring(p.x, p.z, 4, 4.7, ROADY + .03, 0xc8e8ff, 24); W.addCircle(p.x, p.z, 3.6, false, .4); }
    if (Z.id === 'fels') for (let i = 0; i < 4; i++) { const a = i * 1.6, x = p.x + Math.sin(a) * 6, z = p.z + Math.cos(a) * 6; st.sph(x, .7, z, 1.3 + rn() * .5, 0x9a9aa6, 1, 1, .8, 1); W.addCircle(x, z, 1.4, false, 2); }
    if (Z.id === 'huegel') for (let i = 0; i < 5; i++) { const a = i * 1.3, x = p.x + Math.sin(a) * 5.5, z = p.z + Math.cos(a) * 5.5; st.cone(x, 0, z, 1.0, 1.6, 0xb8583a, 6); lamp.sph(x, 1.7, z, .22, 0xff9a3a, 1); }
    if (Z.id === 'wiese') for (let i = 0; i < 12; i++) { const a = rn() * TAU, dd = rn() * (Z.r - 2), x = p.x + Math.sin(a) * dd, z = p.z + Math.cos(a) * dd; st.cyl(x, 0, z, .03, .03, .5, 0x2f9a3f, 4); st.sph(x, .55, z, .17, [0xff7ac0, 0xffd23f, 0xffffff, 0xa66bff][i % 4], 0); } }
  /* Lager von Team Funke: Zelt mit F-Flagge, Kisten, Lagerfeuer; hier startet der Heißluftballon */
  { const q = P(63, -6); st.cyl(q.x, 0, q.z, 0, 4.6, 4, 0xffffff, 6); st.cyl(q.x, 0, q.z, 0, 4.7, 1.2, 0xe8453c, 6); st.cyl(q.x, 4, q.z, .06, .06, 2.4, 0x555a66, 6); st.box(q.x + .5, 5.6, q.z, 1.1, .8, .08, 0xe8453c); st.box(q.x + .5, 5.65, q.z, .75, .12, .1, 0xffffff); st.box(q.x + .25, 5.4, q.z, .12, .5, .1, 0xffffff); W.addCircle(q.x, q.z, 3.6, false, 3);
    for (let i = 0; i < 3; i++) { const k = P(60 + i * 1.5, 2 + i * .6); st.box(k.x, 0, k.z, 1.3, 1.1, 1.3, 0xc8803c, i); W.addCircle(k.x, k.z, .9, false, 1.1); } const f = P(58, -12); st.disc(f.x, f.z, 1.1, ROADY + .02, 0x3a3a46, 10); for (let i = 0; i < 3; i++) st.cone(f.x + (i - 1) * .3, .1, f.z, .22, .8, [0xff7a1a, 0xffd23f, 0xff5a1a][i], 5); lamp.sph(f.x, .9, f.z, .3, 0xff9a3a, 1);
    const bq = P(64, 9); W.vehicleSpawns.push({ type: 'funkenballon', x: bq.x, z: bq.z, h: Math.atan2(-T.ux, -T.uz) }); W.spots.funkenballon = bq; }
  /* Bäume am Rand, Laternen am Platz */
  for (let i = 0; i < 46; i++) { const a = rn() * TAU, dd = T.R - 5 - rn() * 6, x = T.x + Math.sin(a) * dd, z = T.z + Math.cos(a) * dd; if (Math.hypot(x - E.x, z - E.z) < 12) continue; const h = 2.2 + rn() * 1.2; st.cyl(x, 0, z, .22, .32, h, 0x6b4a2a, 6); st.sph(x, h + 1.1, z, 1.5 + rn() * .5, [0x4cb85a, 0x5ac966, 0x3fa84e][i % 3], 1, 1, .95, 1); W.addCircle(x, z, .5, false, 3); BI.isleTree(x, z, h + 1.6); }
  for (let k = 0; k < 6; k++) { const a = k / 6 * TAU, q = P(T.statue.a, T.statue.b); const x = q.x + Math.sin(a) * 15.5, z = q.z + Math.cos(a) * 15.5; st.cyl(x, 0, z, .08, .1, 3.4, 0x444a5a, 6); lamp.sph(x, 3.6, z, .3, 0xfff3b0, 1); }
};
