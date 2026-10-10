'use strict';
/* Bunte Insel – feste Orte (nur Geometrie + Orte-Liste): Gärten hinter den Wohnungen, Felder + Tierpark beim Bauernhof, Freibad.
   Das Verhalten (Pflanzen, Mähen, Tiere, Rutschen …) steckt in garden.js, farm.js und pool.js. Alles landet im EINEN Welt-Mesh. */
BI.addPlaces = function (W, st) {
  const WD = 0x8a5a33, LW = 0xb07a44, SOIL = 0x7a5230;
  const post = (x, z, h) => st.box(x, 0, z, .22, h || 1.2, .22, WD);
  /* Zaun mit optionaler Lücke (gap = [a, b] in Koordinate entlang des Zauns); dicht genug für Tiere, mit Kollision */
  function fenceX(xa, xb, z, gap, high) {
    const h = high || 1.2, seg = (u, v) => { if (v - u < .1) return; st.box((u + v) / 2, h * .32, z, v - u, .1, .12, LW); st.box((u + v) / 2, h * .8, z, v - u, .1, .12, LW); W.addBox(u, z - .15, v, z + .15, false, h); };
    for (let x = xa; x <= xb + .01; x += 2.5) { if (gap && x > gap[0] && x < gap[1]) continue; post(x, z, h); }
    if (gap) { seg(xa, gap[0]); seg(gap[1], xb); post(gap[0], z, h); post(gap[1], z, h); } else seg(xa, xb);
  }
  function fenceZ(x, za, zb, gap, high) {
    const h = high || 1.2, seg = (u, v) => { if (v - u < .1) return; st.box(x, h * .32, (u + v) / 2, .12, .1, v - u, LW); st.box(x, h * .8, (u + v) / 2, .12, .1, v - u, LW); W.addBox(x - .15, u, x + .15, v, false, h); };
    for (let z = za; z <= zb + .01; z += 2.5) { if (gap && z > gap[0] && z < gap[1]) continue; post(x, z, h); }
    if (gap) { seg(za, gap[0]); seg(gap[1], zb); post(x, gap[0], h); post(x, gap[1], h); } else seg(za, zb);
  }
  const pen = (x0, z0, x1, z1, gapSide, gapC, gw, col) => { // Gatter mit Tor auf der Seite 'n' (z0) oder 's' (z1)
    st.rect(x0, z0, x1, z1, .03, col || 0xa9e07c);
    const g = [gapC - gw / 2, gapC + gw / 2];
    fenceX(x0, x1, z0, gapSide === 'n' ? g : null); fenceX(x0, x1, z1, gapSide === 's' ? g : null); fenceZ(x0, z0, z1); fenceZ(x1, z0, z1);
  };

  /* ---------- Gärten hinter den Wohnungen ---------- */
  W.spots.gardens = [];
  for (const f of W.spots.flats || []) {
    const zB = f.zB, x0 = f.x0, x1 = f.x1, cells = [];
    st.rect(x0 + .4, zB - 8.2, x1 - .4, zB - .25, .04, 0x9bd873); st.rect(f.cx + 2.3, zB - 8.2, f.cx + 4.1, zB, .045, 0xd9cfb8);               // Rasen + Weg zur Hintertür
    for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) {
      const cx = x0 + 2.0 + c * 2.4, cz = zB - 3.2 - r * 2.6; cells.push({ x: cx, z: cz });
      st.rect(cx - 1.05, cz - 1.05, cx + 1.05, cz + 1.05, .05, SOIL);
      for (const [dx, dz, w, d] of [[0, -1.12, 2.4, .12], [0, 1.12, 2.4, .12], [-1.12, 0, .12, 2.1], [1.12, 0, .12, 2.1]]) st.box(cx + dx, 0, cz + dz, w, .16, d, 0xb98650);
    }
    fenceZ(x0 + .4, zB - 8.2, zB - .3, null, 1.1); fenceZ(x1 - .4, zB - 8.2, zB - .3, null, 1.1); fenceX(x0 + .4, x1 - .4, zB - 8.2, null, 1.1);
    // Vogelscheuche, Gießkanne, Tonne
    const sx = x1 - 2.0, sz = zB - 6.6; st.box(sx, 0, sz, .1, 1.9, .1, WD); st.box(sx, 1.3, sz, 1.4, .1, .1, WD); st.sph(sx, 1.95, sz, .24, 0xf3d9a0, 1); st.cone(sx, 2.1, sz, .32, .35, 0xc2453d, 8); st.box(sx, .9, sz, .5, .6, .18, 0x4da3ff); st.box(sx - .7, 1.15, sz, .22, .5, .08, 0x4da3ff); st.box(sx + .7, 1.15, sz, .22, .5, .08, 0x4da3ff);
    st.cyl(x1 - 1.2, 0, zB - 2.2, .34, .3, .6, 0x4d6fa8, 10); st.cyl(x1 - 1.2, .55, zB - 2.2, .3, .3, .04, 0x57c4ff, 10);
    st.box(x0 + 1.0, 0, zB - .9, .5, .35, .25, 0xc2453d); st.box(x0 + 1.0, .35, zB - .9, .12, .35, .12, 0x555b66);
    // Hintertür-Rahmen
    st.box(f.cx + 2.25, 0, zB - .08, .14, 2.4, .5, WD); st.box(f.cx + 4.15, 0, zB - .08, .14, 2.4, .5, WD); st.box(f.cx + 3.2, 2.35, zB - .08, 2.1, .16, .5, WD);
    W.spots.gardens.push({ i: f.i, cells, x0, x1, zB });
  }

  /* ---------- Felder (zwischen Bahn und Ringstraße, nördlich der Scheune) zum Mähen ---------- */
  W.spots.fields = []; W.pads.push([-136, 18, -112, 56]);
  [[20, 34], [36, 50]].forEach(([z0, z1], i) => {
    const x0 = -133, x1 = -115; st.rect(x0 - .6, z0 - .6, x1 + .6, z1 + .6, .03, 0xb98650); st.rect(x0, z0, x1, z1, .045, 0xd9c26a);
    for (const z of [z0 - .6, z1 + .6]) for (let x = x0; x <= x1; x += 4.5) post(x, z, 1.0);
    for (const x of [x0 - .6, x1 + .6]) for (let z = z0; z <= z1; z += 5) post(x, z, 1.0);
    W.spots.fields.push({ id: i, x0, z0, x1, z1, cell: 2 });
  });
  W.vehicleSpawns.push({ type: 'combine', x: -100, z: 54, h: Math.PI }, { type: 'mower', x: -94, z: 54, h: Math.PI });
  st.box(-124, 0, 55.4, 7, 1.0, .25, WD); st.box(-124, 1.0, 55.4, 7.4, .5, .3, 0xfff0c0);   // Schild „Felder“

  /* ---------- Hofladen (südlich des Geheges) ---------- */
  { const sx = -112, sz = 106; W.pads.push([sx - 8, sz - 6, sx + 8, sz + 8]);
    st.rect(sx - 5, sz - 4, sx + 5, sz + 4, .04, 0xe3d6b4); st.box(sx, 0, sz, 8.4, 1.1, 1.4, 0xc8803c); st.box(sx, 1.1, sz, 8.8, .1, 1.9, WD); W.addBox(sx - 4.2, sz - .8, sx + 4.2, sz + .8, false, 1.2);
    for (let k = 0; k < 9; k++) st.box(sx - 4 + k * .95, 2.9, sz + 1.6, .9, .5, 1.2, k % 2 ? 0xffffff : 0xe0382b);
    for (const dx of [-4.2, 4.2]) st.box(sx + dx, 0, sz + 1.5, .2, 2.9, .2, WD);
    for (const [dx, c] of [[-2.4, 0xff8a1f], [.2, 0xe0382b], [2.8, 0x3fa84e]]) { st.box(sx + dx, 0, sz - 2.6, 1.0, .6, 1.3, 0xb98650); st.sph(sx + dx, .85, sz - 2.6, .5, c, 1); W.addBox(sx + dx - .6, sz - 3.3, sx + dx + .6, sz - 1.9, false, 1); }
    st.box(sx, 1.1, sz + .9, 3.2, .7, .05, 0xfff0c0);
    st.box(sx + 6.4, 0, sz - 2, 1.6, 1.0, 1.2, 0x8a8f99); st.box(sx + 6.4, 1.0, sz - 2, 1.7, .1, 1.3, 0x3a3d45); st.cyl(sx + 6.4, 1.1, sz - 2, .4, .45, .45, 0xc9ccd4, 10); st.cyl(sx + 7.2, 1.0, sz - 2.4, .12, .12, 1.8, 0x5a5f69, 6); st.sph(sx + 6.4, 1.7, sz - 2, .15, 0xff8a1f, 0); W.addBox(sx + 5.5, sz - 2.7, sx + 7.3, sz - 1.3, false, 1.2);
    W.spots.farm = { stove: { x: sx + 6.4, z: sz - 2 }, shop: { x: sx, z: sz }, customer: { x: sx, z: sz - 1.9 }, farmer: { x: sx, z: sz + 1.2 } }; }

  /* ---------- Streichelzoo (Westseite außerhalb der Bahn): 6 Gehege mit Tor nach Osten ---------- */
  /* ---------- Camp mit Lagerfeuer (Ostseite): Zelte, Baumstämme, Laterne ---------- */
  { const cx = 70, cz = 30; W.pads.push([cx - 9, cz - 9, cx + 9, cz + 9]); W.spots.camp = { x: cx, z: cz };
    st.disc(cx, cz, 8, .03, 0xc9b27a, 28); st.ring(cx, cz, 1.0, 1.5, .08, 0x8a8f99, 12); st.disc(cx, cz, 1.0, .05, 0x2b2b30, 12); W.addCircle(cx, cz, 1.4, false, .6);
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + .4, x = cx + Math.sin(a) * 3.2, z = cz + Math.cos(a) * 3.2; st.box(x, 0, z, 2.0, .5, .55, 0x8a5a33, a + Math.PI / 2); W.addCircle(x, z, .7, false, .5); }
    for (const [dx, dz, c] of [[-5.2, -3.4, 0xe0382b], [5.4, -2.6, 0x3fa0ff]]) { st.prism(cx + dx, 0, cz + dz, 3.6, 2.6, 3.4, c, 0); st.box(cx + dx, 0, cz + dz + 1.7, 1.0, 1.7, .08, 0x2b2f3a); W.addBox(cx + dx - 1.8, cz + dz - 1.7, cx + dx + 1.8, cz + dz + 1.7, false, 2.4); }
    st.box(cx - 5.5, 0, cz + 4.6, .12, 2.6, .12, 0x6b4a2a); st.sph(cx - 5.5, 2.7, cz + 4.6, .22, 0xffe27a, 1); st.box(cx + 5.5, 0, cz + 4.6, .12, 2.6, .12, 0x6b4a2a); st.sph(cx + 5.5, 2.7, cz + 4.6, .22, 0xffe27a, 1);
    st.box(cx + 6.8, 0, cz - 6.6, .1, 3.4, .1, 0x8a5a33); st.box(cx + 7.4, 3.0, cz - 6.6, 1.2, .8, .05, 0xff8a1f); }
  /* ---------- Kampfarena (Nordosten): Boxring mit Seilen, Tribüne, Fahnen ---------- */
  { const ax = 100, az = -88, R = 14, H = 8; W.pads.push([ax - R - 2, az - R - 2, ax + R + 2, az + R + 2]); W.spots.arena = { x: ax, z: az, R, half: H, kai: { x: ax, z: az + H + 3.6 } };
    st.disc(ax, az, R, .03, 0xe6d8a8, 32); st.rect(ax - H - 1, az - H - 1, ax + H + 1, az + H + 1, .05, 0xffffff); st.rect(ax - H, az - H, ax + H, az + H, .06, 0x3f7bd8); st.disc(ax, az, 3.2, .07, 0xffd23f, 20); st.ring(ax, az, 3.2, 3.7, .08, 0xe0382b, 20);
    const rope = (x0, z0, x1, z1) => { const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2, w = Math.abs(x1 - x0) || .08, d = Math.abs(z1 - z0) || .08; for (const [y, c] of [[.55, 0xe0382b], [.95, 0xffffff], [1.35, 0x3fa0ff]]) st.box(mx, y, mz, w, .08, d, c); };
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { st.box(ax + sx * (H + .3), 0, az + sz * (H + .3), .35, 1.7, .35, sx * sz > 0 ? 0xe0382b : 0x3f7bd8); W.addCircle(ax + sx * (H + .3), az + sz * (H + .3), .4, false, 1.7); }
    rope(ax - H - .3, az - H, ax + H + .3, az - H); W.addBox(ax - H, az - H - .2, ax + H, az - H + .2, false, 1.5); rope(ax - H, az - H - .3, ax - H, az + H + .3); W.addBox(ax - H - .2, az - H, ax - H + .2, az + H, false, 1.5); rope(ax + H, az - H - .3, ax + H, az + H + .3); W.addBox(ax + H - .2, az - H, ax + H + .2, az + H, false, 1.5);
    rope(ax - H - .3, az + H, ax - 2.6, az + H); W.addBox(ax - H, az + H - .2, ax - 2.6, az + H + .2, false, 1.5); rope(ax + 2.6, az + H, ax + H + .3, az + H); W.addBox(ax + 2.6, az + H - .2, ax + H, az + H + .2, false, 1.5);
    for (let k = 0; k < 3; k++) st.box(ax, k * .5, az - H - 3 - k * 1.2, 16 - k * 1.5, .5, 1.4, [0xb98650, 0xc8803c, 0xa8703a][k]); W.addBox(ax - 8, az - H - 5.4, ax + 8, az - H - 2.2, false, 1.5);
    for (let k = 0; k < 6; k++) { const bx = ax - 7 + k * 2.8; st.box(bx, 1.5, az - H - 3.6, .5, .5, .5, [0xff5a8a, 0xffd23f, 0x4da3ff][k % 3]); }
    for (const sx of [-1, 1]) { st.box(ax + sx * (H + 3.2), 0, az - 2, .15, 4.2, .15, 0x6b4a2a); st.cone(ax + sx * (H + 3.2) + sx * .5, 3.9, az - 2, .55, .25, sx > 0 ? 0xff5a8a : 0x4da3ff, 3); }
    st.box(ax, 0, az + H + 3.4, 3.6, .9, .5, 0xc8803c); W.addBox(ax - 1.8, az + H + 3.1, ax + 1.8, az + H + 3.7, false, .9); }
  /* ---------- Verbotener Wald (Nordwesten): dunkler Wald mit Zaun, hier – und nur hier – wird gekämpft ---------- */
  { const fx0 = 40, fz0 = -148, R = 16, rnd = BI.rng(77), gd = Math.atan2(-fx0, -fz0), gx = fx0 + Math.sin(gd) * R, gz = fz0 + Math.cos(gd) * R; W.pads.push([fx0 - R - 2, fz0 - R - 2, fx0 + R + 2, fz0 + R + 2]);
    W.spots.forest = { x: fx0, z: fz0, R, gate: { x: gx - Math.sin(gd) * 4, z: gz - Math.cos(gd) * 4 }, gx, gz, ang: gd };
    st.disc(fx0, fz0, R, .03, 0x33432e, 36); st.disc(fx0, fz0, R * .55, .04, 0x2a3a2a, 28); st.disc(fx0, fz0, 4, .05, 0x4a3a52, 20); st.ring(fx0, fz0, 4, 4.4, .06, 0xb36bff, 20);
    for (let i = 0; i < 30; i++) { const a = rnd() * BI.TAU, d = Math.sqrt(rnd()) * (R - 2.2), x = fx0 + Math.sin(a) * d, z = fz0 + Math.cos(a) * d; if (d < 5.5) continue; const ga = Math.abs(BI.angDiff(a, gd)); if (ga < .4 && d > R * .3) continue;
      const h = 3 + rnd() * 2.4; st.cyl(x, 0, z, .22, .34, h * .5, 0x4a3426, 6); st.cone(x, h * .35, z, 1.5 + rnd() * .5, h * .7, [0x1f4a3a, 0x2a5a46, 0x24433f][i % 3], 7); st.cone(x, h * .75, z, 1.1, h * .55, [0x2a5a46, 0x1f4a3a][i % 2], 7); W.addCircle(x, z, .75, false, 3); }
    for (let i = 0; i < 10; i++) { const a = rnd() * BI.TAU, d = 5 + rnd() * (R - 7), x = fx0 + Math.sin(a) * d, z = fz0 + Math.cos(a) * d; st.cyl(x, 0, z, .05, .08, .3, 0xe8e0d0, 5); st.sph(x, .35, z, .22, [0xb36bff, 0x3fe0c0, 0xff8fc8][i % 3], 1, 1, .6, 1); }
    for (let k = 0; k < 30; k++) { const a = k / 30 * BI.TAU; if (Math.abs(BI.angDiff(a, gd)) < .2) continue; const x = fx0 + Math.sin(a) * R, z = fz0 + Math.cos(a) * R; st.box(x, 0, z, .3, 1.5, .3, k % 2 ? 0xe0382b : 0xffffff); W.addCircle(x, z, .34, false, 1.5); if (k % 2) st.box(fx0 + Math.sin(a + .105) * R, .9, fz0 + Math.cos(a + .105) * R, 2.4, .1, .1, 0xe0382b, a + Math.PI / 2); }
    for (const s of [-1, 1]) { const x = gx + Math.cos(gd) * 2.6 * s, z = gz - Math.sin(gd) * 2.6 * s; st.box(x, 0, z, .3, 2.6, .3, 0x4a3426); st.sph(x, 2.8, z, .24, 0xe0382b, 1); } }
  W.spots.pens = []; W.pads.push([-172, -38, -144, 46]);
  { const defs = [['pig', -36, -26.5, 4, 0xb9d98a], ['goat', -26, -16.5, 5, 0xb5e08a], ['horse', -16, -6.5, 2, 0xa9e07c], ['chicken', -6, 3.5, 8, 0xc9e89a], ['rabbit', 4, 13.5, 5, 0xb5e08a], ['donkey', 14, 23.5, 2, 0xa9e07c], ['cow', 24, 33.5, 3, 0xa9e07c], ['sheep', 34, 43.5, 5, 0xb5e08a]];
    const x0 = -168, x1 = -146;
    for (const [id, z0, z1, n, col] of defs) {
      const gz = (z0 + z1) / 2; st.rect(x0, z0, x1, z1, .03, col); fenceX(x0, x1, z0); fenceX(x0, x1, z1); fenceZ(x0, z0, z1); fenceZ(x1, z0, z1, [gz - 1.6, gz + 1.6]);
      W.spots.pens.push({ id, x0: x0 + 1, z0: z0 + 1, x1: x1 - 1, z1: z1 - 1, n, gate: { x: x1, z: gz }, cx: (x0 + x1) / 2, cz: gz });
    }
    const P = Object.fromEntries(W.spots.pens.map(p => [p.id, p]));
    { const p = P.pig; st.rect(p.x1 - 7, p.cz - 2.5, p.x1 - 3, p.cz + 2, .05, 0x6b4a2a); st.box(p.x0 + 2, 0, p.z0 + 1.8, 3, 1.6, 2.4, 0xc2453d); st.prism(p.x0 + 2, 1.6, p.z0 + 1.8, 3.6, 1.0, 2.8, 0x8a2b2b, 0); W.addBox(p.x0 + .5, p.z0 + .6, p.x0 + 3.5, p.z0 + 3, false, 2.2); st.box(p.x0 + 2, 0, p.z1 - 1, 2.2, .45, .7, WD); }
    { const p = P.cow; st.box(p.x0 + 3, 0, p.z0 + 2, 3.6, 1.8, 2.6, 0xc2453d); st.prism(p.x0 + 3, 1.8, p.z0 + 2, 4.2, 1.0, 3.2, 0x8a2b2b, 0); st.box(p.x1 - 3, 0, p.cz, 3, .5, 1.1, 0x9aa0a8); st.rect(p.x1 - 4.4, p.cz - .5, p.x1 - 1.6, p.cz + .5, .06, 0x57c4ff); W.addBox(p.x0 + 1, p.z0 + .6, p.x0 + 5, p.z0 + 3.4, false, 1.8); }
    { const p = P.sheep; st.box(p.x0 + 2.4, 0, p.cz, 3, 1.4, 2.6, 0xe8c85a); st.prism(p.x0 + 2.4, 1.4, p.cz, 3.6, .9, 3.0, 0xc2453d, 0); W.addBox(p.x0 + .8, p.cz - 1.4, p.x0 + 4, p.cz + 1.4, false, 1.4); }
    { const p = P.goat; st.box(p.x0 + 3, 0, p.cz, 3.4, 1.0, 2.6, 0x9aa0a8); st.box(p.x0 + 3.4, 1.0, p.cz, 2.2, .9, 1.8, 0xb0b6be); st.box(p.x0 + 3.6, 1.9, p.cz, 1.2, .7, 1.0, 0xc6ccd4); W.addBox(p.x0 + 1.3, p.cz - 1.3, p.x0 + 4.7, p.cz + 1.3, false, 1.6); }
    { const p = P.horse; st.box(p.x0 + 2.4, 0, p.cz, 4, 2.6, 6, 0xc8803c); st.prism(p.x0 + 2.4, 2.6, p.cz, 4.8, 1.4, 6.8, 0x8a2b2b, Math.PI / 2); st.box(p.x0 + 4.45, 0, p.cz, .1, 2.1, 2.4, 0x2b2f3a); W.addBox(p.x0 + .4, p.cz - 3, p.x0 + 4.4, p.cz + 3, false, 3.4); st.box(p.x1 - 2.5, 0, p.z0 + 1.2, 2.6, .5, .8, WD); st.box(p.x1 - 2.5, .45, p.z0 + 1.2, 2.4, .06, .6, 0x57c4ff); }
    { const p = P.chicken; st.box(p.x0 + 2, 0, p.z0 + 2.2, 3.2, 1.5, 2.6, 0xe8c85a); st.prism(p.x0 + 2, 1.5, p.z0 + 2.2, 3.8, .9, 3.0, 0xc2453d, 0); st.box(p.x0 + 2, 0, p.z0 + 3.55, .9, .9, .1, 0x2b2f3a); st.box(p.x0 + 2, 0, p.z0 + 4.3, 2.4, .16, 1.2, 0x8a5a33); W.addBox(p.x0 + .4, p.z0 + .8, p.x0 + 3.6, p.z0 + 3.6, false, 2.4); for (let k = 0; k < 3; k++) { st.box(p.x0 + 2 + k * 1.1, 0, p.z1 - 1.3, .8, .3, .7, 0xb98650); st.sph(p.x0 + 2 + k * 1.1, .38, p.z1 - 1.3, .2, 0xf5efe0, 0); } }
    { const p = P.rabbit; for (let k = 0; k < 3; k++) { const hx = p.x0 + 1.8 + k * 2.8; st.box(hx, 0, p.z0 + 1.4, 2.0, 1.0, 1.4, 0xc8803c); st.box(hx, 1.0, p.z0 + 1.4, 2.3, .12, 1.7, 0x8a5a33); st.box(hx, .1, p.z0 + 2.15, 1.5, .8, .05, 0xcfd8e6); W.addBox(hx - 1.1, p.z0 + .6, hx + 1.1, p.z0 + 2.2, false, 1.2); } st.box(p.cx + 3, 0, p.cz + 1.4, 1.2, .3, .6, 0xd9b44a); }
    { const p = P.donkey; st.disc(p.x1 - 5, p.cz, 3.6, .06, 0x57c4ff, 28); st.ring(p.x1 - 5, p.cz, 3.5, 4.0, .07, 0xc9a574, 28); st.box(p.x0 + 3, 0, p.z0 + 1.6, 3, 1.1, .8, WD); st.box(p.x0 + 3, 1.1, p.z0 + 1.6, 3.2, .12, 1.0, 0xe8c85a); W.addBox(p.x0 + 1.4, p.z0 + 1, p.x0 + 4.6, p.z0 + 2.2, false, 1.2); st.cyl(p.x0 + 1.5, 0, p.z1 - 1.5, .9, .9, 1.2, 0xe8c85a, 10); W.addCircle(p.x0 + 1.5, p.z1 - 1.5, 1, false, 1.2); }
    st.box(-144.5, 0, 8, .3, 3.2, .3, WD); st.box(-144.5, 3.1, 8, .3, .5, 3.4, 0xfff0c0);   // Wegweiser „Streichelzoo“
  }
  W.spots.tierpark = { x: -146, z: 12 };

  /* ---------- Freibad (Süden, außerhalb der Bahn): Becken, Rutschen, Sprungturm, Liegen, Kiosk, Umkleiden ---------- */
  { const OX = 30, OZ = 124, X0 = OX, X1 = OX + 46, Z0 = OZ, Z1 = OZ + 28, GATE = [OX + 22.1, OX + 23.9]; W.pads.push([X0 - 3, Z0 - 3, X1 + 3, Z1 + 3]);
    const u = x => OX + x, v = z => OZ + z;
    const F = W.spots.pool = { x0: X0, x1: X1, z0: Z0, z1: Z1, main: { x0: u(6), z0: v(6), x1: u(28), z1: v(17) }, kids: { x0: u(33), z0: v(5), x1: u(39), z1: v(10) }, gate: { x: u(23), z: Z0 }, slides: [], board: null, kiosk: null, lifeguard: null, cabins: [], loungers: [] };
    st.rect(X0, Z0, X1, Z1, .035, 0xe8dcc0);
    for (let x = X0 + 4; x < X1; x += 4) st.rect(x, Z0, x + .06, Z1, .04, 0xd8c9a2); for (let z = Z0 + 4; z < Z1; z += 4) st.rect(X0, z, X1, z + .06, .04, 0xd8c9a2);
    fenceX(X0, X1, Z0, GATE, 1.6); fenceX(X0, X1, Z1, null, 1.6); fenceZ(X0, Z0, Z1, null, 1.6); fenceZ(X1, Z0, Z1, null, 1.6);
    for (const x of GATE) st.box(x, 0, Z0, .35, 2.8, .35, 0x2d8cff); st.box(u(23), 2.6, Z0, 2.6, .5, .35, 0xffd23f);
    st.box(u(17), 0, v(2), 4.2, 2.6, 2.4, 0xfff0c0); st.prism(u(17), 2.6, v(2), 4.6, .9, 2.8, 0xc2453d, 0); st.box(u(17), 0, v(2) + 1.22, 3, 1.5, .1, 0x2d8cff); W.addBox(u(17) - 2.1, v(2) - 1.2, u(17) + 2.1, v(2) + 1.2, false, 3);
    const m = F.main, k = F.kids;
    st.rect(m.x0 - .6, m.z0 - .6, m.x1 + .6, m.z1 + .6, .05, 0xf4f8ff); st.rect(k.x0 - .6, k.z0 - .6, k.x1 + .6, k.z1 + .6, .05, 0xf4f8ff);
    for (let i = 1; i < 5; i++) { const z = m.z0 + i * (m.z1 - m.z0) / 5; st.rect(m.x0 + 1, z - .05, m.x1 - 1, z + .05, .07, 0xffffff); }
    W.spots.poolWater = [{ x0: m.x0, z0: m.z0, x1: m.x1, z1: m.z1, c: 0x2fb4f0 }, { x0: k.x0, z0: k.z0, x1: k.x1, z1: k.z1, c: 0x6fd8ff }];
    { const fx = (k.x0 + k.x1) / 2, fz = (k.z0 + k.z1) / 2; st.cyl(fx, 0, fz, .22, .22, 1.6, 0xffd23f, 8); st.cyl(fx, 1.5, fz, 1.1, .3, .35, 0xff5a8a, 12); W.addCircle(fx, fz, .5, false, 1.8); F.fountain = { x: fx, z: fz }; }
    [[u(12), 0x2d8cff], [u(22), 0xe0382b]].forEach(([sx, col], i) => {
      const tz = v(25); st.box(sx, 0, tz, 2.6, 4.2, 2.6, 0xc9ced6); st.box(sx, 4.2, tz, 3.2, .2, 3.2, col); for (let s = 0; s < 8; s++) st.box(sx + 2.2, 0, tz + 1.6 - s * .4, 1.4, .5 + s * .5, .4, col);
      W.addBox(sx - 1.4, tz - 1.4, sx + 1.4, tz + 1.4, false, 4.4);
      const pts = [[sx, 4.5, tz - .6], [sx, 4.0, tz - 2.4], [sx - .6, 3.0, tz - 4.4], [sx - 1.2, 2.0, tz - 6.4], [sx - 1.0, 1.1, tz - 8.2], [sx, .6, tz - 9.4]];
      for (let q = 0; q < pts.length - 1; q++) { const a = pts[q], b = pts[q + 1], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, mz = (a[2] + b[2]) / 2, len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]), yaw = Math.atan2(b[0] - a[0], b[2] - a[2]), pit = -Math.asin((b[1] - a[1]) / len); st.box(mx, my - .1, mz, 1.0, .12, len + .2, col, yaw, pit); st.box(mx - .5, my, mz, .1, .35, len, col, yaw, pit); st.box(mx + .5, my, mz, .1, .35, len, col, yaw, pit); }
      F.slides.push({ i, x: sx + 2.2, z: tz + 2.4, path: pts, col });
    });
    { const bx = u(1.6), bz = v(11.5); st.box(bx, 0, bz, 1.6, 2.2, 1.6, 0xc9ced6); st.box(bx + 2.6, 2.1, bz, 4.4, .14, 1.0, 0xf5f5f5); st.box(bx + 4.7, 2.1, bz, .1, .1, 1.0, 0x2d8cff); for (let s = 0; s < 5; s++) st.box(bx, 0, bz + 1.4 + s * .6, 1.0, .4 + s * .4, .5, 0x2d8cff);
      W.addBox(bx - .8, bz - .8, bx + .8, bz + .8, false, 2.3); F.board = { x: bx, z: bz + 4.9, jump: { x: bx + 4.4, z: bz, y: 2.3 }, land: { x: bx + 9, z: bz } }; }
    for (const lu of [8, 12, 30, 34, 38, 42]) { const x = u(lu), z = v(3.8); st.box(x, .25, z, .8, .16, 2.0, lu % 8 ? 0xfff0c0 : 0xff8fc8); st.box(x, .55, z - .8, .8, .5, .12, lu % 8 ? 0xfff0c0 : 0xff8fc8, 0, .8); st.box(x - .3, 0, z + .8, .08, .25, .08, 0x555b66); st.box(x + .3, 0, z + .8, .08, .25, .08, 0x555b66); W.addBox(x - .45, z - 1, x + .45, z + 1, false, .5); F.loungers.push({ x, z }); }
    for (const [a, b, c] of [[10, 5.6, 0xff5a5a], [32, 6.4, 0x4da3ff], [42, 14, 0xffd23f], [30, 20, 0x4cd07d], [6, 19, 0xb36bff]]) { const x = u(a), z = v(b); st.cyl(x, 0, z, .07, .07, 2.7, 0xe8e8ee, 6); st.cone(x, 2.4, z, 1.8, .55, c, 10); W.addCircle(x, z, .2, false, 2.7); }
    { const kx = u(41.5), kz = v(22); st.box(kx, 0, kz, 3, 2.4, 5, 0xfff0c0); st.prism(kx, 2.4, kz, 3.6, .8, 5.6, 0x2d8cff, Math.PI / 2); st.box(kx - 1.52, .9, kz, .08, 1.1, 4.6, 0x3a3f4a); for (let q = 0; q < 8; q++) st.box(kx - 2.0, 2.1, kz - 2 + q * .55, .5, .26, .5, q % 2 ? 0xffffff : 0xe0382b); st.cyl(kx - 2.2, 0, kz + 3.2, .4, .25, .9, 0xd9c26a, 8); st.sph(kx - 2.2, 1.2, kz + 3.2, .42, 0xffb0d0, 1); W.addBox(kx - 1.5, kz - 2.5, kx + 1.5, kz + 2.5, false, 3); F.kiosk = { x: kx - 2.8, z: kz }; }
    { const lx = u(43), lz = v(8); for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) st.box(lx + dx, 0, lz + dz, .2, 3.2, .2, WD); st.box(lx, 3.2, lz, 2.8, .2, 2.8, 0xfff0c0); st.box(lx, 3.4, lz, 2.8, .6, .15, 0xe0382b); st.cone(lx, 4.2, lz, 2.2, .7, 0xe0382b, 4); W.addBox(lx - 1.2, lz - 1.2, lx + 1.2, lz + 1.2, false, 3.4); F.lifeguard = { x: lx - 2.6, z: lz }; }
    for (let i = 0; i < 4; i++) { const cx = u(1.4), cz = v(24 - i * 3.6); st.box(cx, 0, cz, 2.4, 2.3, 2.6, [0xff8fc8, 0x4da3ff, 0xffd23f, 0x4cd07d][i]); st.box(cx + 1.25, 0, cz, .08, 2.0, 1.2, 0xfff0c0); W.addBox(cx - 1.2, cz - 1.3, cx + 1.2, cz + 1.3, false, 2.3); F.cabins.push({ x: cx + 2.4, z: cz }); }
    for (const x of [u(19), u(27)]) { const z = Z0 - 2.4; st.cyl(x, 0, z, .18, .26, 3.4, 0x8a5a33, 6); for (let l = 0; l < 6; l++) st.box(x + Math.sin(l * 1.047) * .9, 3.3, z + Math.cos(l * 1.047) * .9, 1.7, .08, .4, 0x3fa84e, l * 1.047, 0, .35); }
  }
};
