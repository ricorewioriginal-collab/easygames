'use strict';
/* Bunte Insel – Stadt: alle Häuser sind begehbar (Tür, Möbel zum Ausprobieren, Bewohner), die Einkaufsstraße (Ost-West-Achse) hat 8 Läden
   mit Ladentheke, Regalen und Verkäufer/in. Dieser Teil baut nur die Geometrie (läuft in world.js); die Spielregeln stehen in createTown. */
BI.TOWN_SHOPS = [
  { id: 'supermarkt', name: 'Supermarkt', icon: '🛒', wall: 0xc9efd2, awn: [0x2fae5a, 0xffffff], goods: [0xe0382b, 0xffd23f, 0x4cd07d, 0xff8a1f, 0xffffff, 0x8a5a33] },
  { id: 'baeckerei', name: 'Bäckerei', icon: '🥐', wall: 0xffe3b5, awn: [0xe0a458, 0xffffff], goods: [0xe0a458, 0xc2853a, 0xf3d089, 0xffe9b8, 0xb06a2a] },
  { id: 'blumen', name: 'Blumenladen', icon: '💐', wall: 0xffd6ea, awn: [0xff5a8a, 0xffffff], goods: [0xff5a8a, 0xffd23f, 0xb36bff, 0xffffff, 0xff8a1f, 0x4cd07d] },
  { id: 'apotheke', name: 'Apotheke', icon: '⚕️', wall: 0xe6f3ff, awn: [0x3fa0ff, 0xffffff], goods: [0xff4f7a, 0x4da3ff, 0xffffff, 0x4cd07d, 0xffd23f] },
  { id: 'cafe', name: 'Café', icon: '☕', wall: 0xffd0ac, awn: [0xc2453d, 0xfff1d6], goods: [0xffffff, 0xc2853a, 0xf3d089, 0xff8fb8, 0x8a5a33] },
  { id: 'buecherei', name: 'Bücherei', icon: '📚', wall: 0xdccfb0, awn: [0x6a3fd0, 0xffd23f], goods: [0xe0382b, 0x3fa0ff, 0x4cd07d, 0xffd23f, 0xb36bff, 0xff8a1f] },
  { id: 'tiere', name: 'Tierhandlung', icon: '🐾', wall: 0xd2ebff, awn: [0x2d8cff, 0xffffff], goods: [0xffd23f, 0xff8a1f, 0x4cd07d, 0xffffff, 0xb36bff] },
  { id: 'mode', name: 'Kleiderladen', icon: '👕', wall: 0xf1d8ff, awn: [0xb36bff, 0xffffff], goods: [0xff5a5a, 0x3fa0ff, 0xffd23f, 0x4cd07d, 0xff8fc8, 0x23262d] }
];

/* baut ein begehbares Gebäude. c = { W, st, win, ROADY, windows, rr, pick }, o = { cx, cz, w, d, h, wall, roof, s (Türseite ±1 auf z), ridgeX, shop } */
BI.buildEnterable = function (c, o) {
  const { W, st, win, ROADY, rr, pick } = c, { cx, cz, w, d, h, wall, roof, s, ridgeX } = o, T = .4, x0 = cx - w / 2, x1 = cx + w / 2, z0 = cz - d / 2, z1 = cz + d / 2;
  const back = s > 0 ? z0 : z1, front = s > 0 ? z1 : z0, GAP = 1.15, DH = 2.6, shop = o.shop || null;
  const slab = (ax0, az0, ax1, az1, y0, hh, col) => { st.box((ax0 + ax1) / 2, y0, (az0 + az1) / 2, ax1 - ax0, hh, az1 - az0, col || wall); };
  const solid = (ax0, az0, ax1, az1, hh) => W.addBox(ax0, az0, ax1, az1, false, hh);
  const ba0 = s > 0 ? z0 : z1 - T, ba1 = s > 0 ? z0 + T : z1, fa0 = s > 0 ? z1 - T : z0, fa1 = s > 0 ? z1 : z0 + T;
  // Wände: hinten, links, rechts, vorn mit Türlücke
  slab(x0, ba0, x1, ba1, 0, h); solid(x0, ba0, x1, ba1, h + 1);
  slab(x0, z0, x0 + T, z1, 0, h); solid(x0, z0, x0 + T, z1, h + 1);
  slab(x1 - T, z0, x1, z1, 0, h); solid(x1 - T, z0, x1, z1, h + 1);
  slab(x0, fa0, cx - GAP, fa1, 0, h); solid(x0, fa0, cx - GAP, fa1, h + 1);
  slab(cx + GAP, fa0, x1, fa1, 0, h); solid(cx + GAP, fa0, x1, fa1, h + 1);
  slab(cx - GAP, fa0, cx + GAP, fa1, DH, h - DH);
  for (const sd of [-1, 1]) st.box(cx + sd * GAP, 0, (fa0 + fa1) / 2, .14, DH, T + .12, 0x8a5a33); st.box(cx, DH - .1, (fa0 + fa1) / 2, GAP * 2 + .3, .14, T + .12, 0x8a5a33);
  // Boden innen + Fußmatte vor der Tür
  const floorC = shop ? 0xf0e2c8 : pick([0xd9b88a, 0xe2c79a, 0xcfae80]);
  st.rect(x0 + T, z0 + T, x1 - T, z1 - T, ROADY + .01, floorC);
  if (shop) for (let i = 0; i < 6; i++) for (let j = 0; j < 5; j++) if ((i + j) % 2) st.rect(x0 + T + i * (w - 2 * T) / 6, z0 + T + j * (d - 2 * T) / 5, x0 + T + (i + 1) * (w - 2 * T) / 6, z0 + T + (j + 1) * (d - 2 * T) / 5, ROADY + .012, 0xe2d2b0);
  st.rect(cx - 1.3, front + s * .1, cx + 1.3, front + s * 1.5, ROADY + .02, shop ? shop.awn[0] : 0xb08a64);
  c.windows(cx, cz, w, d, 1.4, h > 5.5 ? 2 : 1, h > 5.5 ? 2.8 : 3.4, s);
  // Dach (eigenes Mesh, verschwindet, wenn man drin ist)
  const rb = new BI.Batch(), rh = Math.min(w, d) * .45;
  if (ridgeX) rb.prism(cx, h, cz, d + 1.4, rh, w + 1.4, roof, Math.PI / 2); else rb.prism(cx, h, cz, w + 1.4, rh, d + 1.4, roof, 0);
  rb.box(cx + w * .25, h + rh * .3, cz + d * .2, .9, rh + .6, .9, 0x9a5a48);
  // Gesimse, Dachziegel-Reihen und First bleiben im ausblendbaren Dachmesh.
  const trim = 0xfff1d5, tile = new THREE.Color(roof).multiplyScalar(.82).getHex();
  rb.box(cx, h - .16, cz, w + 1.05, .22, d + 1.05, trim);
  for (let row = 1; row < 7; row++) {
    const t = row / 7, offset = (ridgeX ? d + 1.4 : w + 1.4) * .5 * (1 - t);
    for (const side of [-1, 1]) rb.box(cx + (ridgeX ? 0 : side * offset), h + rh * t + .015, cz + (ridgeX ? side * offset : 0), ridgeX ? w + 1.42 : .055, .045, ridgeX ? .055 : d + 1.42, tile);
  }
  rb.box(cx, h + rh - .015, cz, ridgeX ? w + 1.5 : .2, .16, ridgeX ? .2 : d + 1.5, tile);
  rb.box(cx + w * .25, h + rh * 1.3 + .55, cz + d * .2, 1.13, .16, 1.13, trim);
  // Ecksteine und Sockel: keine Geometrie in der Türöffnung.
  for (const xx of [x0, x1]) for (const zz of [z0, z1]) st.box(xx, 0, zz, .22, h - .18, .22, trim);
  st.box(cx, .1, back, w, .3, .48, 0xc9bca6);
  for (const sd of [-1, 1]) {
    st.box(cx + sd * (w / 4 + GAP / 2), .1, front, w / 2 - GAP, .3, .48, 0xc9bca6);
    const bx = cx + sd * w * .32, bz = front + s * .24;
    st.box(bx, 1.05, bz, 1.35, .28, .38, 0xb77e62);
    st.box(bx, 1.31, bz, 1.22, .07, .3, 0x537b4b);
    for (let flower = -1; flower <= 1; flower++) {
      st.sph(bx + flower * .35, 1.5, bz, .17, flower === 0 ? 0xffce68 : 0xef8fa7, 0);
      st.sph(bx + flower * .35, 1.63, bz, .055, 0xfff1bb, 0);
    }
  }
  const it = { x0: x0 + T, x1: x1 - T, z0: z0 + T, z1: z1 - T, cx, cz, w, d, s, shop: shop ? shop.id : null, kind: shop ? 'shop' : 'house', items: [], roofB: rb, h };
  const X = u => cx + u, Z = v => back + s * v; // u: seitlich ab Mitte, v: Abstand von der Rückwand nach vorn
  const Win = w - 2 * T, LU = -Win / 2, RU = Win / 2, V0 = T;
  const furn = (u, v, bw, bd, hh, col, y0) => { st.box(X(u), y0 || 0, Z(v), bw, hh, bd, col); };
  const block = (u, v, bw, bd, hh) => solid(X(u) - bw / 2, Math.min(Z(v) - bd / 2, Z(v) + bd / 2), X(u) + bw / 2, Math.max(Z(v) - bd / 2, Z(v) + bd / 2), hh);
  const item = (k, u, v, extra) => it.items.push(Object.assign({ k, x: X(u), z: Z(v) }, extra || {}));
  if (!shop) {
    // Wohnhaus: Bett (hinten links), Fernseher + Sofa (Mitte), Regal oder Klavier (hinten rechts), Küche (rechts), Pflanze + Lampe vorn
    const bc = pick([0xff7aa8, 0x6fb3ff, 0xffd23f, 0x7de0a0]);
    furn(LU + 1.05, V0 + 1.3, 1.8, 2.4, .45, 0x8a5a33); furn(LU + 1.05, V0 + 1.35, 1.7, 2.25, .22, bc, .45); furn(LU + .9, V0 + .55, .9, .5, .16, 0xffffff, .67); block(LU + 1.05, V0 + 1.3, 1.8, 2.4, .9); item('bed', LU + 1.05, V0 + 1.6);
    furn(0, V0 + .3, 1.7, .5, .6, 0x5a3d2b); furn(0, V0 + .3, 1.3, .1, .8, 0x14161c, .6); st.box(X(0), .65, Z(V0 + .36), 1.15, .7, .05, 0x3a8ae0); block(0, V0 + .3, 1.7, .5, 1.4);
    furn(0, V0 + 3.7, 2.3, .9, .5, pick([0x4da3ff, 0xff7a7a, 0x4cd07d])); furn(0, V0 + 4.15, 2.3, .3, .55, 0x3d86e0, .5); block(0, V0 + 3.8, 2.3, 1.2, .9); item('tv', 0, V0 + 3.1);
    st.rect(X(-1.7), Z(V0 + 2.2), X(1.7), Z(V0 + 5.2), ROADY + .02, pick([0xff8a8a, 0xffd86b, 0x8ad0ff]));
    if (rr(0, 1) < .38) { furn(RU - 1.1, V0 + .5, 1.9, .8, 1.1, 0x14161c); st.box(X(RU - 1.1), 1.1, Z(V0 + .5), 1.95, .08, .5, 0xffffff); block(RU - 1.1, V0 + .5, 1.9, .8, 1.2); item('piano', RU - 1.1, V0 + 1.5); }
    else { furn(RU - 1.4, V0 + .3, 2.6, .5, 2.1, 0xb98650); for (let i = 0; i < 8; i++) for (let r = 0; r < 3; r++) st.box(X(RU - 2.45 + i * .33), .2 + r * .62, Z(V0 + .58), .26, .46, .06, pick([0xe0382b, 0x3fa0ff, 0x4cd07d, 0xffd23f, 0xb36bff, 0xff8a1f])); block(RU - 1.4, V0 + .3, 2.6, .5, 2.2); item('books', RU - 1.4, V0 + 1.4); }
    furn(RU - .5, V0 + 3.0, .9, .8, 1.9, 0xf4f6fa); st.box(X(RU - .96), .9, Z(V0 + 3.0), .04, .5, .12, 0x9aa3b0); block(RU - .5, V0 + 3.0, .9, .8, 1.9); item('fridge', RU - 1.4, V0 + 3.0);
    furn(RU - .45, V0 + 4.5, .8, 1.5, .95, 0xc8803c); block(RU - .45, V0 + 4.5, .8, 1.5, .95);
    st.cyl(X(LU + .6), 0, Z(Win - .4 > 4 ? Win - .4 : 6), .22, .18, .45, 0xc2453d, 8); st.sph(X(LU + .6), .85, Z(Win - .4 > 4 ? Win - .4 : 6), .42, 0x3fa84e, 1, 1, 1.2, 1); item('plant', LU + 1.0, (d - 2 * T) - .6);
    st.cyl(X(RU - .5), 0, Z(d - 2 * T - .5), .06, .06, 1.6, 0x555a66, 6); st.cone(X(RU - .5), 1.4, Z(d - 2 * T - .5), .35, .35, 0xffe27a, 8);
    it.resident = { x: X(.8), z: Z(V0 + 6.0) };
  } else {
    // Laden: Regale an Rück- und Seitenwänden, Theke mit Kasse, Verkäufer/in dahinter
    const G = shop.goods;
    furn(0, V0 + .3, Win - .3, .5, 2.0, 0xb98650); for (let r = 0; r < 4; r++) for (let i = 0; i < Math.floor((Win - .6) / .6); i++) st.box(X(LU + .5 + i * .6), .25 + r * .5, Z(V0 + .6), .45, .34, .1, pick(G)); block(0, V0 + .3, Win - .3, .5, 2.1);
    for (const sd of [-1, 1]) { const u = sd * (Win / 2 - .3); furn(u, V0 + 4.0, .5, 3.4, 1.9, 0xb98650); for (let r = 0; r < 3; r++) for (let i = 0; i < 5; i++) st.box(X(u - sd * .27), .25 + r * .55, Z(V0 + 2.6 + i * .65), .08, .38, .5, pick(G)); block(u, V0 + 4.0, .5, 3.4, 2.0); }
    furn(-1.4, V0 + 3.0, Win - 3.6, .9, 1.0, 0xc8803c); st.box(X(-1.4), 1.0, Z(V0 + 3.0), Win - 3.5, .08, 1.0, 0xf3e3c3); st.box(X(-1.4 + (Win - 3.6) / 2 - .6), 1.08, Z(V0 + 3.0), .5, .35, .4, 0x4a4f5a); block(-1.4, V0 + 3.0, Win - 3.6, .9, 1.1);
    for (let k = 0; k < 4; k++) st.box(X(-Win / 2 + 1 + k * 1.2), 1.08, Z(V0 + 3.1), .5, .3, .4, pick(G));
    item('store', -.6, V0 + 4.2, { shop: shop.id }); it.keeper = { x: X(-1.0), z: Z(V0 + 2.1) };
    // Markise über der Tür
    for (let i = 0; i < 8; i++) st.box(cx - 3.5 + i * .875, DH + .35, front + s * .95, .875, .1, 1.8, shop.awn[i % 2], 0, 0, s * -.12);
    if (shop.id === 'buecherei') { item('books', -Win / 2 + 1.0, V0 + 1.4); item('books', Win / 2 - 1.0, V0 + 1.4); }
    if (shop.id === 'cafe') { for (const sd of [-1, 1]) { st.cyl(X(sd * 1.2), 0, Z(V0 + 5.6), .45, .45, .75, 0xffffff, 10); st.cyl(X(sd * 1.2), 0, Z(V0 + 5.6), .06, .06, .75, 0x555a66, 6); } item('sit', 0, V0 + 5.6); }
  }
  it.sign = { x: cx, y: Math.min(h - .3, DH + 1.2), z: front + s * .35, text: shop ? shop.icon + ' ' + shop.name : null };
  W.interiors.push(it); W.houses.push({ x: cx, z: cz, w, d });
  return it;
};

/* ---------- Laufzeit: Dächer, Bewohner, Möbel zum Ausprobieren, Läden ---------- */
BI.createTown = function (G) {
  const { scene, W, A, P, fx, save, persist, say, addStars, inv } = G, $ = id => document.getElementById(id), K = { open: false, folk: [], cur: null };
  const TALK = BI.TALK, TAU = BI.TAU, SK = [0xffd2a8, 0xe0a979, 0x8d5a3b, 0xf3c9a0], HR = [0x6b4423, 0x222222, 0xd9a441, 0xa14a2b, 0xf3d98a], PN = [0x3d4a7a, 0x5a3d2b, 0x2d6a4f, 0x7a3d6a];
  const rnd = BI.rng(31), pick = a => a[(rnd() * a.length) | 0];
  /* Bewohner & Verkäufer (stehen drinnen, erzählen etwas) */
  let ai = 3, ki = 2;
  function folk(x, z, look, persona, h) { const c = BI.makeChar(look); c.group.position.set(x, 0, z); c.group.rotation.y = h; scene.add(c.group); const n = { c, x, z, h, h0: h, p: persona, wait: 0, hop: 0, kid: !!look.scale && look.scale < .8, fixed: true }; K.folk.push(n); return n; }
  for (const q of W.interiors) {
    if (q.shop) { const sh = BI.TOWN_SHOPS.find(s => s.id === q.shop), t = TALK.shops[q.shop]; q.keeperNpc = folk(q.keeper.x, q.keeper.z, { shirt: sh.awn[0], pants: 0x3d4a7a, hair: pick(HR), skin: pick(SK), hat: ['baeckerei', 'cafe'].includes(q.shop) ? 'chef' : 'cap', scale: .95 }, { name: t[0], lines: [t[1], 'Willkommen! Schau dich in Ruhe um. 😊', 'Zur Kasse kommst du an der Theke.'], i: 0 }, q.s > 0 ? Math.PI : 0); }
    else { const a = TALK.adults[ai++ % TALK.adults.length]; q.resNpc = folk(q.resident.x, q.resident.z, { shirt: pick(BI.SHIRTS.slice(0, 6)), pants: pick(PN), hair: pick(HR), skin: pick(SK), hat: rnd() < .12 ? 'cap' : 'none', scale: .92 + rnd() * .08 }, { name: a[0], lines: a[1], i: 0 }, q.s > 0 ? Math.PI : 0);
      if (rnd() < .5) { const k = TALK.kids[ki++ % TALK.kids.length]; folk(q.resident.x - 1.6, q.resident.z - q.s * 1.0, { shirt: pick(BI.SHIRTS.slice(0, 6)), pants: pick(PN), hair: pick(HR), skin: pick(SK), hat: 'none', scale: .6 + rnd() * .1 }, { name: k[0], lines: k[1], i: 0 }, q.s > 0 ? Math.PI : 0); } }
  }
  K.sign = null;
  K.inside = () => { if (P.veh) return null; for (const q of W.interiors) if (P.x > q.x0 && P.x < q.x1 && P.z > q.z0 && P.z < q.z1) return q; return null; };
  K.update = function (dt, t) {
    const ins = K.inside(); K.cur = ins; for (const q of W.interiors) { const v = ins !== q; if (q.roof.visible !== v) q.roof.visible = v; }
    for (const n of K.folk) { const d = Math.hypot(P.x - n.x, P.z - n.z), vis = d < 70; if (n.c.group.visible !== vis) n.c.group.visible = vis; if (!vis) continue; const near = d < 6 && ins; if (near) n.h += BI.angDiff(n.h, Math.atan2(P.x - n.x, P.z - n.z)) * Math.min(1, dt * 4); else n.h += BI.angDiff(n.h, n.h0) * Math.min(1, dt * 2);
      n.hop = Math.max(0, n.hop - dt); n.c.group.rotation.y = n.h; n.c.group.position.y = n.hop > 0 ? Math.sin(n.hop / .6 * Math.PI) * .5 : 0; n.c.pose(t * 1.2 + n.x, 0, near && Math.sin(t * .8 + n.x) > .6); }
  };
  /* Möbel-Interaktionen */
  const LAB = { bed: ['🛏️', 'Schlafen'], tv: ['📺', 'Fernsehen'], books: ['📖', 'Lesen'], piano: ['🎹', 'Klavier'], fridge: ['🧊', 'Kühlschrank'], plant: ['🪴', 'Gießen'], store: ['🛒', 'Einkaufen'], sit: ['☕', 'Hinsetzen'] };
  K.near = function () { const q = K.inside(); if (!q) return null; let best = null, bd = 99; for (const it of q.items) { const d = Math.hypot(P.x - it.x, P.z - it.z); if (d < (it.k === 'store' ? 2.4 : 2.0) && d < bd) { bd = d; best = it; } } return best ? { it: best, q } : null; };
  K.label = n => { if (n.it.k === 'store') { const sh = BI.TOWN_SHOPS.find(s => s.id === n.it.shop); return [sh.icon, sh.id === 'buecherei' ? 'Bücherei' : 'Einkaufen']; } return LAB[n.it.k] || ['❔', '?']; };
  let fridgeT = -1e9, tvN = 0, tales = 0, planted = 0;
  K.act = function (n) {
    const it = n.it, now = performance.now();
    if (it.k === 'fridge') { if (now - fridgeT < 40000) { say('🧊 Der Kühlschrank ist gerade leer – gleich wieder!', 2200); return; } fridgeT = now; const iv = inv(); const k = Math.random() < .5 ? 'apple' : 'juice'; iv[k] = (iv[k] || 0) + 1; persist(); A.star && A.star(); say((k === 'apple' ? '🍎 Ein Apfel' : '🧃 Ein Saft') + ' aus dem Kühlschrank! (' + iv[k] + ')', 2600); }
    else if (it.k === 'tv') { const j = TALK.jokes[tvN++ % TALK.jokes.length]; A.giggle && A.giggle(); fx.burst(it.x, 1.5, it.z, 10, [BI.C.blue, BI.C.white], 3, 1, 26, 1); say('📺 ' + j, 5200); if (A.speak) A.speak(j); G.earn && G.earn('tv'); }
    else if (it.k === 'books') { const tl = TALK.tales[tales++ % TALK.tales.length]; say('📖 ' + tl[0] + ' – ' + tl[1].split('. ')[0] + '. …', 6000); if (A.speak) A.speak(tl[0] + '. ' + tl[1]); G.earn && G.earn('story'); if (tales >= 3) G.earn && G.earn('reader'); }
    else if (it.k === 'piano') G.openMusic && G.openMusic();
    else if (it.k === 'bed') G.sleep && G.sleep(n.q, it);
    else if (it.k === 'plant') { A.splash && A.splash(); fx.burst(it.x, 1.2, it.z, 14, [BI.C.water, BI.C.white], 3, 1, 26, 5); say('🪴 Die Pflanze freut sich! 💧', 2000); planted++; }
    else if (it.k === 'sit') { A.pop && A.pop(); say('☕ Gemütlich hier! Die Kellnerin bringt gleich etwas.', 2400); }
    else if (it.k === 'store') K.openStore(it.shop);
  };
  /* Läden */
  K.CAT = {
    supermarkt: [['apple', '🍎', 'Apfel', 1], ['banana', '🍌', 'Banane', 1], ['bread', '🍞', 'Brot', 2], ['cheese', '🧀', 'Käse', 2], ['milk', '🥛', 'Milch', 2], ['egg', '🥚', 'Ei', 1], ['flour', '🌾', 'Mehl', 1], ['tomato', '🍅', 'Tomate', 1], ['carrot', '🥕', 'Möhre', 1], ['juice', '🧃', 'Saft', 2], ['choc', '🍫', 'Schoko', 2]],
    baeckerei: [['bread', '🍞', 'Brot', 2], ['croissant', '🥐', 'Croissant', 1], ['cookie', '🍪', 'Keks', 1], ['cake', '🍰', 'Kuchen', 4]],
    blumen: [['tulip', '🌷', 'Tulpe', 1], ['sunflower', '🌻', 'Sonnenblume', 1], ['bouquet', '💐', 'Blumenstrauß (zum Verschenken)', 3]],
    apotheke: [['potion_hp', '❤️', 'Heiltrank (für den Wald)', 3], ['potion_ep', '⚡', 'Energietrank (für den Wald)', 3], ['juice', '🧃', 'Saft', 2]],
    cafe: [['cocoa', '☕', 'Kakao', 1], ['cakeslice', '🍰', 'Kuchenstück', 2], ['icecream', '🍦', 'Eis', 1]],
    tiere: [['carrot', '🥕', 'Möhre', 1], ['corn', '🌽', 'Mais', 1], ['sunflower', '🌻', 'Sonnenblume', 1], ['apple', '🍎', 'Apfel', 1]],
    buecherei: [], mode: []
  };
  K.openStore = function (id) {
    if (id === 'buecherei') { const tl = TALK.tales[tales++ % TALK.tales.length]; say('📚 ' + tl[0] + ' – wird vorgelesen …', 3000); if (A.speak) A.speak(tl[0] + '. ' + tl[1]); G.earn && G.earn('story'); return; }
    K.open = true; K.shopId = id; G.setStick(0, 0); renderStore(); $('storePanel').hidden = false; const sh = BI.TOWN_SHOPS.find(s => s.id === id); const t = TALK.shops[id]; say(sh.icon + ' ' + t[0] + ': „' + t[1] + '“', 3600); if (A.speak) A.speak(t[1]);
  };
  K.closeStore = function () { K.open = false; $('storePanel').hidden = true; G.updateButtons && G.updateButtons(true); };
  function items() { return K.shopId === 'mode' ? G.modeItems() : K.CAT[K.shopId].map(([id, icon, name, price]) => ({ id, icon, name, price, food: true })); }
  function renderStore() {
    const sh = BI.TOWN_SHOPS.find(s => s.id === K.shopId); $('storeTitle').textContent = sh.icon + ' ' + sh.name; $('storeStars').textContent = '⭐ ' + save.stars; const g = $('storeGrid'); g.innerHTML = ''; const iv = inv();
    for (const it of items()) { const have = it.food ? (iv[it.id] || 0) : (save.owned.includes(it.id) ? 1 : 0), b = document.createElement('button'); b.disabled = !it.food && have > 0; b.innerHTML = '<b>' + it.icon + '</b><span>' + it.name + '</span><small>' + (!it.food && have ? '✔ gehört dir' : it.price + ' ⭐' + (it.food && have ? ' · hast ' + have : '')) + '</small>'; b.onclick = () => buy(it); g.appendChild(b); }
  }
  function buy(it) {
    if (save.stars < it.price) { say('Dafür fehlen dir noch Sterne ⭐', 1800); A.bonk && A.bonk(); return; }
    save.stars -= it.price; $('starN').textContent = save.stars; A.buy && A.buy(); fx.burst(P.x, 1.6, P.z, 12, [BI.C.gold, BI.C.white], 4, 1, 26, 4);
    if (it.food) { const iv = inv(); iv[it.id] = (iv[it.id] || 0) + 1; say(it.icon + ' ' + it.name + ' gekauft!', 1600); } else { save.owned.push(it.id); say(it.icon + ' ' + it.name + ' gekauft – im Kleiderschrank!', 2400); }
    persist(); G.earn && G.earn('shopper'); renderStore();
  }
  $('storeClose').addEventListener('click', K.closeStore);
  return K;
};

/* ---------- Stadtviertel (Erweiterung): eigene Insel im Norden, über eine Brücke erreichbar ---------- */
BI.CITY = { x: 0, z: -290, R: 62, bridge: { x0: -4.5, x1: 4.5, z0: -232, z1: -170 } };
BI.buildCity = function (c) {
  const { W, st, win, lamp, ROADY, windows, GRASS, SAND } = c, C = BI.CITY, crnd = BI.rng(555), rr = (a, b) => a + crnd() * (b - a), pick = a => a[(crnd() * a.length) | 0];
  const ctx = { W, st, win, ROADY, windows, rr, pick }, ASPH = 0x586c7c, WALK = 0xeee1c8, WD = 0x8a5a33;
  W.city = C; W.spots.city = { x: 0, z: -236 };
  // Boden: Wiese + Sandring + Wasserschaum liegt in world.js
  st.disc(C.x, C.z, C.R + 9, 0, GRASS, 56); st.ring(C.x, C.z, C.R - 5, C.R + 9, .012, SAND, 56);
  // Brücke
  { const b = C.bridge, L = b.z1 - b.z0; st.rect(b.x0, b.z0, b.x1, b.z1, ROADY, 0x9a6b3d); for (let z = b.z0 + 1; z < b.z1; z += 2) st.rect(b.x0, z, b.x1, z + .08, ROADY + .01, 0x7a5230);
    for (let z = b.z0 + 2; z < b.z1; z += 6) st.rect(-.12, z, .12, z + 2.4, ROADY + .015, 0xfff3c0);
    for (const sd of [-1, 1]) { st.box(sd * 4.6, 0, (b.z0 + b.z1) / 2, .25, 1.15, L, 0xc8803c); st.box(sd * 4.6, 1.15, (b.z0 + b.z1) / 2, .35, .1, L, 0xe3a45a); W.addBox(sd > 0 ? 4.45 : -4.75, b.z0, sd > 0 ? 4.75 : -4.45, b.z1 - 2, false, 1.3); }
    for (let z = b.z0 + 4; z < b.z1; z += 10) for (const sd of [-1, 1]) st.cyl(sd * 3.8, -1.6, z, .45, .5, 1.62, 0x6b4a2a, 8);
    for (const sd of [-1, 1]) { st.box(sd * 6.2, 0, b.z0 + .2, .5, 5.2, .5, WD); } st.box(0, 4.7, b.z0 + .2, 13.4, .7, .4, 0xe0382b); st.box(0, 5.4, b.z0 + .2, 13.4, .12, .5, 0xffd23f); W.spots.cityGate = { x: 0, y: 5.05, z: b.z0 + .6 }; }
  // Straßen: Hauptstraße A (z -265), Querstraße B (z -296), Allee in der Mitte; Gehwege
  const road = (x0, z0, x1, z1) => st.rect(x0, z0, x1, z1, ROADY, ASPH), walk = (x0, z0, x1, z1) => {
    const ax = Math.min(x0, x1), bx = Math.max(x0, x1), az = Math.min(z0, z1), bz = Math.max(z0, z1);
    st.rect(ax, az, bx, bz, ROADY + .012, WALK);
    st.rect(ax, az, bx, az + .12, ROADY + .015, 0xc5baa3);
    st.rect(ax, bz - .12, bx, bz, ROADY + .015, 0xc5baa3);
    if (bx - ax > bz - az) for (let x = ax + 2; x < bx; x += 2) st.rect(x, az, x + .035, bz, ROADY + .016, 0xd4c8b1);
    else for (let z = az + 2; z < bz; z += 2) st.rect(ax, z, bx, z + .035, ROADY + .016, 0xd4c8b1);
  };
  road(-52, -270, 52, -260); road(-52, -301, 52, -291); road(-5, -291, 5, -232 + 0); road(-5, -270, 5, -232);
  walk(-52, -273, 52, -270); walk(-52, -260, 52, -257); walk(-52, -304, 52, -301); walk(-52, -291, 52, -288); for (const sd of [-1, 1]) { walk(sd * 5, -257, sd * 8, -240); walk(sd * 5, -291, sd * 8, -273); }
  for (let x = -50; x < 50; x += 6) { if (Math.abs(x) < 6) continue; st.rect(x, -265.1, x + 3, -264.9, ROADY + .01, 0xfff3c0); st.rect(x, -296.1, x + 3, -295.9, ROADY + .01, 0xfff3c0); }
  for (let z = -258; z > -270 + 0; z -= 4) { /* Zebrastreifen an der Allee */ }
  for (let i = 0; i < 6; i++) { st.rect(-4.5 + i * 1.6, -259.5, -3.3 + i * 1.6, -257.2, ROADY + .02, 0xffffff); st.rect(-4.5 + i * 1.6, -272.6, -3.3 + i * 1.6, -270.3, ROADY + .02, 0xffffff); }
  // Brunnen auf der Kreuzung
  st.cyl(0, 0, -265, 3.0, 3.2, .8, 0xcfd6e2, 16); st.cyl(0, .75, -265, 2.6, 2.6, .1, 0x57c4ff, 16); st.cyl(0, .5, -265, .5, .6, 1.6, 0xcfd6e2, 8); st.sph(0, 2.2, -265, .45, 0x57c4ff, 1); W.addCircle(0, -265, 3.2, false, 1.2); W.cityFountain = { x: 0, z: -265 };
  // Gebäude: S1 (Süd der Hauptstraße), N1 (Nord), H1 (Wohnhäuser an der Querstraße)
  const XS = [-38, -26, -14, 14, 26, 38], S1 = ['supermarkt', 'baeckerei', 'blumen', 'apotheke', 'cafe', 'buecherei'], N1 = [null, null, 'tiere', 'mode', null, null], WALLS = [0xffe9a8, 0xffc4b8, 0xbfe3ff, 0xd9f0b8, 0xf6d1ff, 0xffd9a0, 0xc9f3e8], ROOFS = [0xd9534f, 0x3f7fd9, 0x8a5a44, 0xe8883a, 0x5f9d5a];
  const shopOf = id => BI.TOWN_SHOPS.find(s => s.id === id), place = (x, zFront, s, id) => { const w = 10, d = 9, cz = zFront + s * (d / 2) * -1; const shop = id ? shopOf(id) : null; BI.buildEnterable(ctx, { cx: x, cz: s > 0 ? zFront - d / 2 : zFront + d / 2, w, d, h: rr(3.3, 3.6), wall: shop ? shop.wall : pick(WALLS), roof: pick(ROOFS), s, ridgeX: true, shop }); };
  XS.forEach((x, i) => { place(x, -257, -1, S1[i]); place(x, -273, 1, N1[i]); place(x, -304, 1, null); });
  // Skyline: hohe Häuser am Nordrand + Uhrturm (nur Kulisse)
  for (const [x, z, w, d, h, col] of [[-34, -327, 14, 9, 17, 0xc9d6e8], [-12, -330, 12, 9, 23, 0xe8d6c9], [14, -329, 14, 10, 19, 0xd6e8c9], [36, -326, 12, 9, 15, 0xe8c9d6]]) { st.box(x, 0, z, w, h, d, col); st.box(x, h, z, w + .8, .5, d + .8, 0x7c8aa0); windows(x, z, w, d, 1.6, Math.floor(h / 3.2), 3.2, -1); W.addBox(x - w / 2, z - d / 2, x + w / 2, z + d / 2, false, h + 1); }
  { const x = 0, z = -326; st.box(x, 0, z, 6, 28, 6, 0xe5d6b8); st.cone(x, 28, z, 4.6, 6, 0x3f7fd9, 4); st.cyl(x, 20, z + 3.05, 1.5, 1.5, .25, 0xffffff, 16, Math.PI / 2); st.box(x, 20.8, z + 3.2, .14, 1.1, .08, 0x222); W.addBox(x - 3, z - 3, x + 3, z + 3, false, 30); }
  // Straßenlaternen, Bänke, Bäume
  for (let x = -46; x <= 46; x += 12) for (const z of [-258.6, -271.6, -289.6, -302.6]) { if (Math.abs(x) < 8) continue; st.cyl(x, 0, z, .08, .08, 3.4, 0x555a66, 6); lamp.sph(x, 3.5, z, .26, 0xffffff, 1); }
  for (const x of [-20, 20, -32, 32]) for (const z of [-258.8, -271.2]) { st.box(x, .4, z, 1.8, .1, .5, 0xc8803c); st.box(x, 0, z + (z > -265 ? .12 : -.12), 1.6, .4, .08, 0x555a66); }
  const tree = (x, z, s) => { if (Math.hypot(x - C.x, z - C.z) > C.R - 3) return; st.cyl(x, 0, z, .22 * s, .32 * s, 2.2 * s, 0x8a5a33, 6); st.sph(x, 3.1 * s, z, 1.7 * s, pick([0x4cb85a, 0x5ac966, 0x3fa84e]), 1, 1, .9, 1); W.addCircle(x, z, .6, false, 3); };
  for (let x = -48; x <= 48; x += 8) { if (Math.abs(x) < 7) continue; tree(x, -286, 1); tree(x + 3, -234 - Math.abs(x) * .18, 1.1); } for (const [x, z] of [[-10, -240], [10, -240], [-10, -282], [10, -282], [-8, -312], [8, -312], [-54, -300], [54, -300], [-44, -330], [44, -330]]) tree(x, z, 1.1);
  // geparkte Autos an der Hauptstraße
  W.vehicleSpawns.push({ type: 'car', x: -30, z: -261.4, h: Math.PI / 2 }, { type: 'taxi', x: 22, z: -268.6, h: -Math.PI / 2 }, { type: 'bus', x: 40, z: -261.6, h: Math.PI / 2 }, { type: 'car', x: -44, z: -268.6, h: -Math.PI / 2 });
  W.pads.push([C.x - C.R, C.z - C.R, C.x + C.R, C.z + C.R]);
};

