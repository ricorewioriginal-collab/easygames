'use strict';
/* Bunte Insel – Badestrand 🏖️ + Wasserpark 🛝: sauberer Zugang vom Land zum Strand und ins Meer (man kann schwimmen!),
   davor im Meer ein kleiner Wasserpark: Anlegesteg, Rutschen-Turm mit 2 Rutschen DIREKT INS MEER, Hüpfburg, Luftkissen (Riesen-Trampolin),
   Hüpf-Pfad aus schwimmenden Platten. Bademeisterin Maja, Eis-Kiosk, Sonnenschirme. Lokale Koordinaten (a, b): a = Abstand von der Inselmitte (Richtung 38°), b = quer dazu. */
BI.BADE = (function () {
  const ANG = 38 * Math.PI / 180, ux = Math.sin(ANG), uz = Math.cos(ANG), wx = uz, wz = -ux;
  const B = { ux, uz, wx, wz, A0: 150, A1: 244, B0: -14, BL: -6, B1: 22, SEA: 203, WY: -.05 };
  B.at = (a, b) => ({ x: ux * a + wx * b, z: uz * a + wz * b });
  B.loc = (x, z) => ({ a: x * ux + z * uz, b: x * wx + z * wz });
  /* feste Plattformen im Wasser (a0,a1,b0,b1, Oberkante y, Hüpfstärke) – ihre Kanten steigen sanft an */
  B.decks = [
    { n: 'steg', a0: 203, a1: 211, b0: 2.5, b1: 5.5, y: .4 },
    { n: 'plattform', a0: 211, a1: 221, b0: -3, b1: 9, y: .4 },
    { n: 'pad1', a0: 213.4, a1: 215.6, b0: -6.6, b1: -4.4, y: .35 },
    { n: 'pad2', a0: 215.4, a1: 217.6, b0: -9.8, b1: -7.6, y: .35 },
    { n: 'pad3', a0: 218.6, a1: 220.8, b0: -12.6, b1: -10.4, y: .35 },
    { n: 'kissen', a0: 223, a1: 235, b0: -14, b1: -6, y: .55, bounce: 17 },
    { n: 'burg', a0: 224, a1: 236, b0: 12, b1: 22, y: .5, bounce: 12.5 }
  ];
  const inZone = (a, b, r) => a >= B.A0 && a <= B.A1 - r && b >= (a < B.SEA ? B.BL : B.B0) + r && b <= B.B1 - r; /* am Land schmaler (Drachen-Brücke daneben) */
  B.walk = (x, z, r) => { if (r > 1) return false; const p = B.loc(x, z); return inZone(p.a, p.b, r); };
  /* Bodenhöhe (null = nicht mein Gebiet): Strand 0, offenes Meer knapp unter 0 (man schwimmt), Plattformen mit weichen Kanten */
  B.floor = (x, z) => {
    const p = B.loc(x, z), a = p.a, b = p.b; if (a < B.SEA - 3 || a > B.A1 + 3 || b < B.B0 - 3 || b > B.B1 + 3) return null;
    let h = a > B.SEA ? B.WY : null;
    for (const d of B.decks) { const e = Math.min(a - d.a0, d.a1 - a, b - d.b0, d.b1 - b); if (e < 0) continue; const y = B.WY + (d.y - B.WY) * Math.min(1, e / .8); if (h === null || y > h) h = y; }
    return h;
  };
  B.sea = (x, z) => { const p = B.loc(x, z); if (p.a < B.SEA || p.a > B.A1 || p.b < B.B0 || p.b > B.B1) return false; const f = B.floor(x, z); return f !== null && f < .15; };
  B.bounce = (x, z) => { const p = B.loc(x, z); for (const d of B.decks) if (d.bounce && p.a > d.a0 && p.a < d.a1 && p.b > d.b0 && p.b < d.b1) return d.bounce; return 0; };
  /* Rutschen: Ladder-Punkt (Einstieg) und Weg (a, b, y) vom Turm ins Meer */
  const wave = (a0, b0, a1, b1, y0, y1, amp, n) => { const o = []; for (let i = 0; i <= n; i++) { const u = i / n; o.push([BI.lerp(a0, a1, u), BI.lerp(b0, b1, u) + Math.sin(u * Math.PI * 2 * 1.5) * amp * Math.sin(u * Math.PI), y0 + (y1 - y0) * (u * u * .5 + u * .5)]); } return o; };
  B.slides = [
    { n: 'rot', ic: '🛝', name: 'Riesenrutsche', lad: [213.7, -3.5], path: wave(213.7, -1.6, 239, -3, 6.1, B.WY, 0, 16), col: 0xe0382b },
    { n: 'blau', ic: '🌊', name: 'Wellenrutsche', lad: [213.7, 1.5], path: wave(213.7, -.4, 237, 6.5, 6.1, B.WY, 3.2, 20), col: 0x2f8cff }
  ];
  return B;
})();

BI.buildBadeGround = function (c) {
  const { W, st, lamp, ROADY } = c, B = BI.BADE, at = B.at, ry = Math.atan2(B.ux, B.uz), rn = BI.rng(4242), TAU = Math.PI * 2;
  W.bade = B; W.spots.bade = at(172, 4); B.shade = [];
  const bx = (a, b, w, h, d, col, y0, yaw) => { const p = at(a, b); st.box(p.x, y0 || 0, p.z, w, h, d, col, ry + (yaw || 0)); return p; };
  const cyl = (a, b, r0, r1, h, col, y0, seg) => { const p = at(a, b); st.cyl(p.x, y0 || 0, p.z, r0, r1, h, col, seg || 10); return p; };
  const sph = (a, b, y, r, col, sy) => { const p = at(a, b); st.sph(p.x, y, p.z, r, col, 1, 1, sy || 1, 1); return p; };
  const solid = (a, b, r, h) => { const p = at(a, b); W.addCircle(p.x, p.z, r, false, h || 4); return p; };
  /* ---- Zugang: Holzsteg vom Weg durchs Gras bis an den Strand, Torbogen mit Tafel ---- */
  bx(187, 4, 3.2, .1, 34, 0xc98f55, 0); for (let a = 171; a < 204; a += 6) bx(a, 4, 3.5, .12, .35, 0x9a6a3a, 0);
  for (const s of [-1, 1]) { bx(172, 4 + s * 2.2, .35, 3.6, .35, 0xffffff, 0); cyl(172, 4 + s * 2.2, .26, .26, .3, 0x2f8cff, 3.6); }
  bx(172, 4, 5.6, .55, .3, 0x2f8cff, 3.4); bx(172, 4, 5.2, .25, .34, 0xffd23f, 3.55);
  /* ---- Strand: Schirme, Liegen, Handtücher, Sandburg, Wasserball ---- */
  const UMB = [[186, -5.5, 0xe0382b], [190, -3, 0xffd23f], [186, 13, 0x2f8cff], [193, 18, 0xff8fc8], [198, -5.5, 0x4cd07d], [196, 10, 0xff7a1a]];
  for (const [a, b, col] of UMB) { cyl(a, b, .06, .06, 2.4, 0xffffff); const p = at(a, b); st.cone(p.x, 2.2, p.z, 1.7, .6, col, 8); solid(a, b, .3, 2.5); bx(a + 1.1, b - 1.6, 1.2, .1, 2.3, col === 0xffd23f ? 0x2f8cff : 0xffffff, 0, .3); bx(a - 1.0, b + 1.5, .8, .3, 1.8, 0xffffff, 0, .2); }
  for (const [a, b] of [[198, 3], [198, 14], [189, -5], [192, 21]]) { bx(a, b, .8, .12, 1.9, 0xffffff, .25); bx(a, b, .8, .5, .12, 0x2f8cff, .25); }
  { const p = at(190, 8); st.sph(p.x, 0, p.z, 1.1, 0xf0d890, 1, 1, .55, 1); st.cone(p.x, .6, p.z, .6, .9, 0xf0d890, 6); st.cyl(p.x + 1.8, 0, p.z, .45, .55, .7, 0xf0d890, 8); const q = at(200, -3); st.sph(q.x, .45, q.z, .45, 0xff5fa8, 1); }
  /* ---- Eis-Kiosk ---- */
  bx(184, 12, 3.4, 2.6, 2.4, 0xfff0c8, 0); bx(184, 12, 3.9, .25, 2.9, 0xe0382b, 2.6); for (let i = -1; i <= 1; i++) bx(184, 12 + i * 1.2, 3.9, .26, .6, 0xffffff, 2.6); bx(182.6, 12, .1, 1.1, 2, 0x6ac8ff, 1.0);
  { const p = at(185.5, 12); st.sph(p.x, 3.5, p.z, .5, 0xffb3d9, 1); st.cone(p.x, 2.7, p.z, .35, .8, 0xe8b868, 6); } solid(184, 12, 1.9, 3);
  /* ---- Bademeister-Turm ---- */
  for (const [da, db] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) cyl(194 + da, -5.5 + db, .12, .12, 2.3, 0xffffff, 0, 6);
  bx(194, -5.5, 3, .2, 3, 0xffffff, 2.3); bx(194, -5.5, 2.6, 1.2, 2.6, 0xff6b4a, 2.5); bx(194, -5.5, 3.2, .2, 3.2, 0xffffff, 3.7); bx(192.7, -5.5, .1, .6, 1.6, 0x6ac8ff, 2.9); solid(194, -5.5, 1.7, 4);
  for (let i = 0; i < 5; i++) bx(192.2, -4.2, .9, .08, .1, 0xffffff, .3 + i * .45);
  /* ---- Schwimm-Absperrung (Bojen-Seil) rund um das Badegebiet ---- */
  const buoy = (a, b, col) => { const p = at(a, b); st.sph(p.x, -.2, p.z, .42, col, 1); if (col === 0xe0382b) st.cyl(p.x, 0, p.z, .05, .05, .8, 0xffffff, 4); };
  for (let a = B.SEA + 2, k = 0; a <= B.A1; a += 4, k++) { buoy(a, B.B0 + .6, k % 2 ? 0xffffff : 0xe0382b); buoy(a, B.B1 - .6, k % 2 ? 0xffffff : 0xe0382b); }
  for (let b = B.B0 + .6, k = 0; b <= B.B1 - .5; b += 4, k++) buoy(B.A1 - .6, b, k % 2 ? 0xffffff : 0xffd23f);
  /* ---- Plattformen (Ponton-Optik) ---- */
  for (const d of B.decks) {
    const w = d.b1 - d.b0, l = d.a1 - d.a0, am = (d.a0 + d.a1) / 2, bm = (d.b0 + d.b1) / 2;
    if (d.n === 'steg' || d.n === 'plattform') {
      bx(am, bm, w, d.y + .5, l, 0xffffff, -.5); bx(am, bm, w + .08, .12, l + .08, 0xff8a1f, d.y - .02); bx(am, bm, w - .5, .06, l - .5, 0xf6e6b8, d.y + .1);
      for (const [pa, pb] of [[d.a0, d.b0], [d.a0, d.b1], [d.a1, d.b0], [d.a1, d.b1]]) { const p = at(pa, pb); st.sph(p.x, -.1, p.z, .5, 0xff8a1f, 1); }
    } else if (d.n.startsWith('pad')) {
      cyl(am, bm, l / 2, l / 2, d.y + .45, d.n === 'pad2' ? 0xffd23f : d.n === 'pad1' ? 0x4cd07d : 0xff8fc8, -.45, 12); cyl(am, bm, l / 2 - .3, l / 2 - .3, .06, 0xffffff, d.y - .02, 12);
    }
  }
  /* ---- Luftkissen (großes aufgeblasenes Sprungkissen) ---- */
  { const K = B.decks[5], am = (K.a0 + K.a1) / 2, bm = (K.b0 + K.b1) / 2; const p = at(am, bm);
    st.box(p.x, K.y - .5, p.z, K.b1 - K.b0 - 1, .5, K.a1 - K.a0 - 1, 0x2f8cff, ry); st.sph(p.x, K.y - .1, p.z, 1, 0x5fb2ff, 1, 6.6, .55, 5.6);
    for (let i = 0; i < 4; i++) { const q = at(am - 3.5 + i * 2.4, bm); st.sph(q.x, K.y + .12, q.z, 1, i % 2 ? 0xffd23f : 0xff8fc8, 1, .35, .16, 3.6); }
    for (const [da, db] of [[-5.4, 0], [5.4, 0]]) { const q = at(am + da, bm + db); st.sph(q.x, K.y - .2, q.z, 1, 0x2f8cff, 1, .9, .9, 3.8); }
    /* aufgeblasener Torbogen */
    for (const s of [-1, 1]) { const q = at(K.a0 + .6, bm + s * 3.8); st.cyl(q.x, K.y - .1, q.z, .42, .5, 2.8, 0xffd23f, 8); }
    { const q = at(K.a0 + .6, bm); st.box(q.x, K.y + 2.4, q.z, 8, .8, .9, 0xff8fc8, ry + Math.PI / 2); } }
  /* ---- Hüpfburg: Eck-Türme mit Dach, niedriger Wulst, Fähnchen ---- */
  { const K = B.decks[6], am = (K.a0 + K.a1) / 2, bm = (K.b0 + K.b1) / 2, hw = (K.b1 - K.b0) / 2, hl = (K.a1 - K.a0) / 2;
    const p = at(am, bm); st.box(p.x, K.y - .6, p.z, hw * 2 - .4, .6, hl * 2 - .4, 0xffd23f, ry); st.box(p.x, K.y - .1, p.z, hw * 2 - 1.2, .14, hl * 2 - 1.2, 0xff8fc8, ry);
    const cols = [0xff5fa8, 0x2f8cff, 0x4cd07d, 0xff8a1f];
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([sa, sb], i) => { const a = am + sa * (hl - 1), b = bm + sb * (hw - 1); cyl(a, b, .95, 1.05, 3.2, cols[i], K.y - .4, 10); const q = at(a, b); st.cone(q.x, K.y + 2.8, q.z, 1.3, 1.5, cols[(i + 2) % 4], 8); st.sph(q.x, K.y + 4.4, q.z, .22, 0xffffff, 1); solid(a, b, 1.05, 4); });
    for (const sb of [-1, 1]) for (let i = -2; i <= 2; i += 2) { const q = at(am + i * hl / 2.4, bm + sb * (hw - 1)); st.sph(q.x, K.y + .4, q.z, 1, cols[(i + 2) % 4], 1, .9, .9, .9); }
    for (const sa of [-1, 1]) for (const i of [-1, 1]) { const q = at(am + sa * (hl - 1), bm + i * (hw / 2)); st.sph(q.x, K.y + .4, q.z, 1, cols[(i + 3) % 4], 1, .9, .9, .9); }
    for (let i = -2; i <= 2; i++) { const q = at(am - hl + .6, bm + i * 1.6); st.sph(q.x, K.y + 3.9, q.z, .26, cols[(i + 2) % 4], 1, 1, 1.4, .3); }
  }
  /* ---- Rutschen-Turm auf der Plattform ---- */
  { const ta = 213.7, tb = -1;
    for (const [da, db] of [[-1.2, -1.4], [-1.2, 1.4], [1.2, -1.4], [1.2, 1.4]]) cyl(ta + da, tb + db, .16, .2, 6, 0xffffff, .3, 6);
    bx(ta, tb, 3.4, .25, 3.0, 0xffd23f, 5.75); bx(ta, tb, 3.4, .5, .12, 0xffffff, 6.0, 0); bx(ta + 1.55, tb, .12, .5, 3, 0xffffff, 6.0, 0); bx(ta - 1.55, tb, .12, .5, 3, 0xffffff, 6.0, 0);
    { const p = at(ta, tb); st.cone(p.x, 7.0, p.z, 2.6, 1.3, 0xe0382b, 4); }
    for (const [la, lb] of [B.slides[0].lad, B.slides[1].lad]) { for (let i = 0; i < 12; i++) bx(ta - 1.3 + 0, lb + (lb < tb ? .8 : -.8), .1, .08, .9, 0xc98f55, .4 + i * .46); }
    solid(ta, tb, 1.6, 7);
    /* Rutschen als gebogene Röhren-Bahn */
    for (const S of B.slides) { const P = S.path; for (let i = 0; i < P.length - 1; i++) { const p = at(P[i][0], P[i][1]), q = at(P[i + 1][0], P[i + 1][1]), dx = q.x - p.x, dz = q.z - p.z, h = Math.hypot(dx, dz) || 1e-6, dy = P[i + 1][2] - P[i][2], len = Math.hypot(h, dy), ay = Math.atan2(dx, dz), ax = Math.atan2(-dy, h), mx = (p.x + q.x) / 2, mz = (p.z + q.z) / 2, my = (P[i][2] + P[i + 1][2]) / 2;
        if (P[i][2] < B.WY + .05) break;
        st.box(mx, my - .12, mz, 1.5, .18, len + .12, S.col, ay, ax); st.box(mx, my - .02, mz, .12, .4, len + .12, 0xffffff, ay, ax); st.box(mx + Math.cos(ay) * .75, my + .15, mz - Math.sin(ay) * .75, .12, .4, len + .1, 0xffffff, ay, ax); st.box(mx - Math.cos(ay) * .75, my + .15, mz + Math.sin(ay) * .75, .12, .4, len + .1, 0xffffff, ay, ax);
        if (i % 4 === 0 && P[i][2] > 1.2) st.cyl(mx, 0.3, mz, .1, .12, my - 0.5, 0xffffff, 5);
      } }
  }
  /* ---- schwimmende Deko: Flamingo-Ring & Ente ---- */
  { const p = at(228, 4); st.sph(p.x, -.05, p.z, 1, 0xff8fc8, 1, 1.2, .35, 1.2); st.sph(p.x, .1, p.z, .55, 0xffffff, 1, 1, .4, 1); const q = at(242, 16); st.sph(q.x, .2, q.z, .6, 0xffe14d, 1); st.sph(q.x, .85, q.z, .38, 0xffe14d, 1); st.cone(q.x + .4, .85, q.z, .15, .3, 0xff8a1f, 5); }
};

BI.createBade = function (G) {
  const { scene, W, A, fx, P, say, addStars } = G, B = BI.BADE, K = { ride: null }, TAU = Math.PI * 2, at = B.at;
  const near = (p, r) => Math.hypot(P.x - p.x, P.z - p.z) < r;
  const S = () => G.save.bade || (G.save.bade = { sw: 0, bounce: 0, slide: 0 });
  /* Bademeisterin Maja */
  const gp = at(192, -2.4), guard = BI.makeChar({ shirt: 0xff6b4a, pants: 0xffffff, hair: 0xf2c14e, skin: 0xe0a979, hat: 'cap', name: 'Maja' }); guard.group.position.set(gp.x, 0, gp.z); guard.group.rotation.y = Math.atan2(B.ux, B.uz); scene.add(guard.group);
  const spots = { guard: gp, ice: at(182.2, 12) };
  const catmull = (pts, u) => { const n = pts.length - 1, f = Math.min(n - 1e-6, u * n), i = Math.floor(f), t = f - i, p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n, i + 2)]; return [0, 1, 2].map(k => .5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t * t + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t * t * t)); };
  K.near = function () {
    if (P.veh || P.y > 1.2 || K.ride) return null;
    for (const s of B.slides) { const l = at(s.lad[0], s.lad[1]); if (near(l, 2.1)) return { k: 'slide', s, label: [s.ic, s.name + ' – rutschen!'] }; }
    if (near(spots.ice, 2.8)) return { k: 'ice', label: ['🍦', 'Eis kaufen'] };
    if (near(spots.guard, 3)) return { k: 'guard', label: ['💬', 'Maja'] };
    return null;
  };
  K.busy = () => !!K.ride;
  K.act = function (n) {
    if (!n) return;
    if (n.k === 'slide') {
      const path = n.s.path.map(p => { const q = at(p[0], p[1]); return [q.x, p[2] + .15, q.z]; });
      K.ride = { t: 0, dur: 3.6, path, s: n.s }; A.whoosh && A.whoosh(); say(n.s.ic + ' Wiiiii – ab ins Meer!', 1600); G.earn('wasserpark'); S().slide++; G.persist();
    } else if (n.k === 'ice') {
      const now = performance.now(); if (now - (K.iceT == null ? -1e9 : K.iceT) < 25000) { say('🍦 Du hattest gerade erst ein Eis – gleich wieder!', 2200); return; }
      K.iceT = now; addStars(1); A.buy && A.buy(); say('🍦 Lecker Eis am Strand! +1 ⭐', 2600); fx.burst(P.x, 2, P.z, 12, [BI.C.pink, BI.C.white, BI.C.gold], 3, 1, 26, 4);
    } else if (n.k === 'guard') {
      const L = ['Maja: „Schwimmen darfst du bis zu den Bojen. Dahinter ist es zu tief!“', 'Maja: „Probier die Rutschen – die gehen direkt ins Meer! 🛝“', 'Maja: „Auf der Hüpfburg 🏰 und dem Luftkissen kannst du richtig hoch springen!“', 'Maja: „Die bunten Platten sind ein Hüpf-Pfad. Schaffst du es bis zum Luftkissen?“'];
      K.talk = ((K.talk | 0) + 1) % L.length; say(L[K.talk], 4200); A.hello && A.hello();
    }
  };
  /* Springen auf Hüpfburg / Luftkissen: von main.js aufgerufen, wenn der Spieler auf der Fläche landet */
  K.onBounce = function (v) {
    A.boing && A.boing(); fx.burst(P.x, .6, P.z, 8, v > 15 ? [BI.C.blue, BI.C.white] : [BI.C.pink, BI.C.gold, BI.C.white], 3, .8, 24, 5);
    const s = S(); s.bounce++; if (s.bounce === 1) say('🏰 Hüpf, hüpf, hüpf! Spring auch selbst (Sprung-Taste) – dann wirst du noch höher!', 4200); if (s.bounce >= 6) G.earn('huepf');
  };
  K.update = function (dt, t) {
    guard.pose(t * 1.1, 0, near(spots.guard, 8));
    const sw = !P.veh && !K.ride && B.sea(P.x, P.z); if (sw) { K.swT = (K.swT || 0) + dt; if (K.swT > 6) { G.earn('seepferd'); const s = S(); if (!s.sw) { s.sw = 1; G.persist(); } } } else K.swT = 0;
    const on = !P.veh && B.walk(P.x, P.z, 0) && B.loc(P.x, P.z).a > 160; if (on !== K.was) { K.was = on; if (on) say('🏖️ Badestrand! Schwimmen 🏊, Rutschen 🛝, Hüpfburg 🏰', 4200); }
    const r = K.ride; if (!r) return; r.t += dt; const u = Math.min(1, r.t / r.dur), g = G.char().group;
    const e = u * u * .35 + u * .65, p = catmull(r.path, e); P.x = p[0]; P.y = p[1]; P.z = p[2]; const q = catmull(r.path, Math.min(1, e + .04)); P.h = Math.atan2(q[0] - p[0], q[2] - p[2]);
    g.position.set(P.x, P.y, P.z); g.rotation.set(-.5, P.h, 0); G.char().pose(0, 0, false); G.char().armL.rotation.set(-2.6, 0, .4); G.char().armR.rotation.set(-2.6, 0, -.4);
    if (Math.random() < dt * 25) fx.emit(P.x, P.y + .3, P.z, (Math.random() - .5), 1.5, (Math.random() - .5), .6, 22, .6, .85, 1, 6, .9);
    if (u >= 1) { K.ride = null; P.y = B.WY; P.vy = 0; A.splash && A.splash(); A.bigpop && A.bigpop(); fx.burst(P.x, .4, P.z, 30, [BI.C.water, BI.C.white, BI.C.blue], 6, 1.2, 30, 8); g.rotation.set(0, P.h, 0); G.char().armL.rotation.set(0, 0, 0); G.char().armR.rotation.set(0, 0, 0); say('💦 Platsch! Mitten im Meer!', 1800); }
  };
  K.log = function () { const s = S(); return { title: '🏖️ Badestrand', count: ((s.sw ? 1 : 0) + (s.slide ? 1 : 0) + (s.bounce >= 6 ? 1 : 0)) + ' von 3', rows: [{ ok: !!s.sw, icon: '🏊', text: 'Im Meer schwimmen', dest: 'bade' }, { ok: s.slide > 0, icon: '🛝', text: 'Eine Wasserrutsche ins Meer nehmen', dest: 'bade' }, { ok: s.bounce >= 6, icon: '🏰', text: 'Auf der Hüpfburg oder dem Luftkissen hüpfen', dest: 'bade' }] }; };
  return K;
};
