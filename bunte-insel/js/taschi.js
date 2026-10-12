'use strict';
/* Bunte Insel – Taschi-Land 🔴 (Welt): Insel im Osten mit Professor-Statue, Labor, Heilhaus, Fangladen, runder Kampf-Arena (4 Leiter + Meisterin), 4 Gras-Zonen,
   Lager von Team Funke mit Heißluftballon. Die Taschi-Modelle (Freunde & wilde Taschis) werden aus BI.TSPECIES gebaut. ALLES SELBST ERFUNDEN („inspiriert“). */
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

/* 3D-Modell eines Taschis (aus Art-Daten); Blick nach +z, ca. 1 m hoch (big = Skalierung der Entwicklung) */
BI.taschiMesh = function (id, o) {
  const S = BI.TSPECIES[id] || BI.TSPECIES.blitzi, b = new BI.Batch(), c1 = S.c1, c2 = S.c2, c3 = S.c3, K = (S.big || 1) * ((o && o.s) || 1), BK = 0x2a2230;
  const eye = (x, y, z, r) => { b.sph(x, y, z, r, BK, 0); b.sph(x + r * .3, y + r * .35, z + r * .55, r * .38, 0xffffff, 0); };
  const leg = (x, z, c, h) => b.cyl(x, 0, z, .07, .09, h || .3, c, 6);
  switch (S.shape) {
    case 'mouse':
      b.sph(0, .45, 0, .4, c1, 1, 1, 1.05, .9); b.sph(0, .42, .14, .27, c2, 1, 1, 1, .6); b.sph(0, .98, .1, .3, c1, 1, 1.05, 1, 1); eye(-.12, 1.02, .34, .05); eye(.12, 1.02, .34, .05); b.sph(0, .93, .38, .035, BK, 0);
      if (!S.nocheek) { b.sph(-.25, .88, .26, .085, c3, 0, 1, 1, .6); b.sph(.25, .88, .26, .085, c3, 0, 1, 1, .6); }
      for (const s of [-1, 1]) { b.cone(s * .2, 1.2, .02, .09, .42, c1, 6); b.cone(s * .2, 1.48, .02, .06, .12, S.nocheek ? c1 : c3, 6); b.sph(s * .33, .55, .12, .09, c1, 0); leg(s * .16, .05, c1, .2); b.sph(s * .16, .08, .13, .1, c1, 0, 1, .5, 1.3); }
      b.box(0, .4, -.45, .1, .5, .1, c1); b.box(.1, .75, -.5, .3, .09, .1, c1, 0, 0, .3); b.box(.15, .95, -.5, .1, .35, .1, c1);
      if (S.big > 1.2) b.sph(0, .5, -.5, .18, c2, 0);
      break;
    case 'fox':
      b.sph(0, .5, 0, .32, c1, 1, 1, .95, 1.4); b.sph(0, .46, .2, .22, c2, 1, 1, .9, 1.2); b.sph(0, .88, .5, .27, c1); b.sph(0, .76, .72, .13, c2, 1, 1, .8, 1); b.sph(0, .8, .84, .04, BK, 0); eye(-.12, .95, .72, .045); eye(.12, .95, .72, .045);
      b.sph(0, .72, .38, .3, c2, 1, 1.2, .8, .7); for (const s of [-1, 1]) { b.cone(s * .15, 1.08, .46, .09, .36, c1, 6); b.cone(s * .15, 1.12, .48, .05, .22, c2, 6); leg(s * .15, .4, c1, .38); leg(s * .15, -.35, c1, .38); }
      b.sph(0, .62, -.6, .24, c1, 1, .8, .8, 1.8); b.sph(0, .64, -.95, .16, c2, 1, .8, .8, 1);
      if (S.fin) { b.box(0, 1.1, .3, .05, .3, .3, c3, 0, 0, 0); for (const s of [-1, 1]) b.box(s * .22, .95, .55, .05, .3, .16, c3, 0, 0, s * .4); b.box(0, .85, -.9, .05, .3, .4, c3); }
      if (S.flame) { for (let i = 0; i < 5; i++) b.cone(Math.sin(i * 1.26) * .26, .75, .32 + Math.cos(i * 1.26) * .12, .1, .3, i & 1 ? 0xffd36a : 0xff7a1a, 5); b.sph(0, .64, -1.05, .2, 0xffb02a, 1, .8, .8, 1.2); }
      if (S.spiky) for (let i = 0; i < 7; i++) b.cone(Math.sin(i * .9 - 2.7) * .3, .78, .38 + Math.cos(i * .9 - 2.7) * .1, .06, .28, 0xfff6c0, 5);
      if (S.leaf) { for (const s of [-1, 0, 1]) b.sph(s * .12, 1.12, .62, .1, 0x3a9a3a, 0, 1, .35, 1.7); b.sph(0, .64, -1.0, .15, 0x3a9a3a, 0, 1, .4, 1.8); }
      break;
    case 'lizard':
      b.sph(0, .55, 0, .34, c1, 1, 1, 1.15, .9); b.sph(0, .5, .14, .24, c2, 1, 1, 1.1, .6); b.sph(0, 1.02, .08, .27, c1, 1, 1, .95, 1.1); b.sph(0, .94, .3, .15, c1, 1, 1, .8, 1.2); eye(-.12, 1.07, .27, .05); eye(.12, 1.07, .27, .05);
      for (const s of [-1, 1]) { leg(s * .18, .06, c1, .3); b.sph(s * .18, .06, .18, .1, c1, 0, 1, .5, 1.4); b.sph(s * .34, .6, .1, .1, c1, 0); }
      b.cyl(0, .3, -.4, .04, .12, .6, c1, 6, 1.1); b.sph(0, .62, -.82, .13, c3, 1, 1, 1.4, 1); b.cone(0, .62, -.8, .09, .3, 0xffd36a, 5);
      if (S.wings) for (const s of [-1, 1]) b.box(s * .5, .9, -.15, .5, .05, .5, c3, 0, 0, s * .5);
      break;
    case 'frog':
      b.sph(0, .42, 0, .4, c1, 1, 1.2, .9, 1); b.sph(0, .38, .16, .28, c2, 1, 1.1, .9, .7); b.sph(0, .78, .22, .24, c1, 1, 1.3, .8, 1); eye(-.2, .98, .26, .07); eye(.2, .98, .26, .07);
      for (const s of [-1, 1]) { leg(s * .32, .12, c1, .26); b.sph(s * .32, .06, .24, .13, c1, 0, 1, .45, 1.4); b.sph(s * .42, .4, 0, .13, c1, 0); }
      b.sph(0, .62, -.15, .3, c3, 1, 1, .85, 1); b.cone(0, .9, -.15, .14, .34, c3 + 0x101010, 6);
      if (S.bulb === 2) for (let i = 0; i < 6; i++) b.sph(Math.sin(i * 1.05) * .26, 1.0, -.15 + Math.cos(i * 1.05) * .26, .15, 0xff7ac0, 0, 1, .5, 1);
      break;
    case 'turtle':
      b.sph(0, .36, 0, .34, c1, 1, 1.05, .9, 1.1); b.sph(0, .52, -.1, .42, c3, 1, 1.05, .8, 1.15); b.sph(0, .3, .05, .32, c2, 1, 1, .5, 1.1); b.sph(0, .72, .36, .2, c1); eye(-.09, .76, .52, .042); eye(.09, .76, .52, .042);
      for (const s of [-1, 1]) { leg(s * .3, .25, c1, .22); leg(s * .3, -.25, c1, .22); b.sph(s * .38, .45, .2, .1, c1, 0); }
      b.sph(0, .35, -.5, .1, c1, 0); if (S.cannons) for (const s of [-1, 1]) { b.cyl(s * .25, .85, -.15, .1, .1, .4, 0xc8c8d0, 8); b.cyl(s * .25, 1.2, -.15, .06, .09, .08, 0x555a66, 8); }
      for (let i = 0; i < 4; i++) b.box(Math.sin(i * 1.57) * .2, .9 - .05, -.1 + Math.cos(i * 1.57) * .2, .12, .04, .12, 0xd8b078);
      break;
    case 'bird':
      b.sph(0, .55, 0, .3, c1, 1, 1, 1.1, .9); b.sph(0, .5, .13, .22, c2, 1, 1, 1, .7); b.sph(0, .97, .1, .21, c1); eye(-.09, 1.02, .27, .04); eye(.09, 1.02, .27, .04);
      b.cyl(0, .94, .36, 0, .07, .2, c3, 6, Math.PI / 2); for (const s of [-1, 1]) { b.box(s * .34, .6, -.02, .06, .34, .4, c1, 0, 0, s * .3); leg(s * .1, 0, c3, .3); }
      b.box(0, .5, -.4, .2, .06, .4, c3, 0, .3); if (S.crest) for (let i = -1; i <= 1; i++) b.cone(i * .08, 1.12, .02, .05, .3, 0xe83a3a, 5);
      break;
    case 'rock':
      b.sph(0, .5, 0, .45, c1, 1, 1, .95, 1, .06); b.sph(.18, .85, -.05, .22, c2, 1, 1, .8, 1, .05); b.sph(-.2, .8, -.1, .2, c1, 1, 1, .8, 1, .05); eye(-.14, .62, .4, .06); eye(.14, .62, .4, .06); b.box(0, .72, .42, .4, .06, .08, c3, 0, 0, 0);
      for (const s of [-1, 1]) { b.sph(s * .55, .4, .1, .17, c1, 1, 1, 1.2, 1, .04); b.sph(s * .55, .26, .1, .12, c3, 0); } b.sph(0, .1, .22, .22, c3, 0, 1, .4, 1);
      break;
    case 'ghost':
      b.sph(0, .72, 0, .4, c1, 1, 1, 1.1, 1); for (let i = 0; i < 5; i++) b.cone(Math.sin(i * 1.26) * .22, .02, Math.cos(i * 1.26) * .2, .1, .4, c1, 5);
      eye(-.14, .82, .34, .085); eye(.14, .82, .34, .085); b.box(0, .62, .38, .26, .05, .06, c3); for (const s of [-1, 1]) b.sph(s * .45, .6, .1, .1, c2, 0);
      if (S.flame) { for (let i = 0; i < 3; i++) b.cone((i - 1) * .16, 1.05, 0, .1, .36 - Math.abs(i - 1) * .1, i === 1 ? 0xffd36a : 0xff7a1a, 5); } else { b.sph(0, 1.15, -.05, .12, c2, 0, 1, .7, 1); }
      break;
    case 'tadpole':
      b.sph(0, .46, 0, .42, c1, 1, 1, 1, 1.05); b.sph(0, .38, .2, .3, c2, 1, 1, 1, .6); eye(-.15, .62, .34, .06); eye(.15, .62, .34, .06); b.sph(0, .72, .12, .12, c3, 0, 1, .4, 1);
      b.cone(0, .46, -.5, .2, .5, c3, 5); if (S.legs) for (const s of [-1, 1]) { leg(s * .2, .05, c1, .2); b.sph(s * .2, .05, .12, .1, c1, 0, 1, .45, 1.4); b.sph(s * .42, .35, .1, .1, c1, 0); }
      break;
    case 'bug':
      b.sph(0, .34, 0, .3, c1, 1, 1, .85, 1.25); b.sph(0, .46, .35, .2, c1); eye(-.09, .52, .5, .045); eye(.09, .52, .5, .045); for (const s of [-1, 1]) { b.cyl(s * .08, .6, .4, .015, .015, .3, BK, 4, -.4); b.sph(s * .12, .88, .36, .035, c3, 0); b.box(s * .24, .52, -.05, .18, .04, .4, c2, 0, 0, s * .5); }
      for (let i = -1; i <= 1; i++) for (const s of [-1, 1]) b.cyl(s * .25, 0, i * .22, .02, .02, .3, BK, 4, 0, 0, s * .6);
      if (S.spiky) for (let i = 0; i < 6; i++) b.cone(Math.sin(i) * .2, .58, -.1 + Math.cos(i) * .2, .05, .22, c3, 4); else b.cone(0, .62, .4, .05, .2, c3, 5);
      break;
    case 'bear':
      b.sph(0, .56, 0, .5, c1, 1, 1, 1.05, 1); b.sph(0, .5, .26, .34, c2, 1, 1, 1.05, .6); b.sph(0, 1.12, .15, .33, c1); b.sph(0, 1.05, .42, .14, c2, 1, 1.1, .8, .8); b.sph(0, 1.08, .55, .045, BK, 0);
      for (const s of [-1, 1]) { b.sph(s * .24, 1.4, .1, .12, c1, 0); b.box(s * .13, 1.16, .46, .1, .025, .03, BK); b.sph(s * .52, .5, .12, .17, c1, 0, 1, 1.3, 1); leg(s * .26, .05, c3, .32); b.sph(s * .26, .06, .3, .14, c3, 0, 1, .5, 1.3); }
      break;
    case 'cat':
      b.sph(0, .5, 0, .32, c1, 1, 1, 1.1, 1.2); b.sph(0, .46, .2, .22, c2, 1, 1, 1, .6); b.sph(0, 1.0, .12, .32, c1, 1, 1, .9, 1); eye(-.13, 1.04, .38, .05); eye(.13, 1.04, .38, .05); b.sph(0, .95, .43, .04, 0xd86a8a, 0);
      for (const s of [-1, 1]) { b.cone(s * .22, 1.2, .08, .1, .36, c1, 5); b.box(s * .3, .92, .36, .24, .015, .02, BK, 0, 0, s * .2); b.box(s * .3, .88, .36, .24, .015, .02, BK, 0, 0, -s * .2); leg(s * .15, .2, c1, .34); leg(s * .15, -.2, c1, .34); }
      b.sph(0, 1.2, .3, .08, c3, 0, 1, 1.2, .3); b.cyl(0, .5, -.5, .05, .08, .6, c1, 6, .5);
      break;
  }
  const m = b.mesh(BI.mat()), g = new THREE.Group(); g.add(m); g.scale.setScalar(K); g.userData.id = id; return g;
};
/* Vorschaubild (Daten-URL) eines Taschis – zwischengespeichert */
BI.taschiPic = function (id) { return BI.Thumb ? BI.Thumb.get('tm_' + id, () => BI.Thumb.render(BI.taschiMesh(id), null, .5, .18)) : null; };

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
  for (let i = 0; i < 46; i++) { const a = rn() * TAU, dd = T.R - 5 - rn() * 6, x = T.x + Math.sin(a) * dd, z = T.z + Math.cos(a) * dd; if (Math.hypot(x - E.x, z - E.z) < 12) continue; const h = 2.2 + rn() * 1.2; st.cyl(x, 0, z, .22, .32, h, 0x6b4a2a, 6); st.sph(x, h + 1.1, z, 1.5 + rn() * .5, [0x4cb85a, 0x5ac966, 0x3fa84e][i % 3], 1, 1, .95, 1); W.addCircle(x, z, .5, false, 3); }
  for (let k = 0; k < 6; k++) { const a = k / 6 * TAU, q = P(T.statue.a, T.statue.b); const x = q.x + Math.sin(a) * 15.5, z = q.z + Math.cos(a) * 15.5; st.cyl(x, 0, z, .08, .1, 3.4, 0x444a5a, 6); lamp.sph(x, 3.6, z, .3, 0xfff3b0, 1); }
};
