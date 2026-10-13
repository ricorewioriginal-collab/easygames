'use strict';
/* Bunte Insel – Rätsel-Insel der Uralten 🗿⚔️ (Erweiterung): ein klassisches Rollenspiel-Abenteuer, INSPIRIERT von den Rätsel-Verliesen und Kapselmonstern der 16-Bit-Zeit
   (Lufia 2), aber mit ganz EIGENEN Namen, Figuren und Formen: Held Milo & Freunde, der Prüfungsturm mit Werkzeug-Rätseln (Bomben, Bogen, Enterhaken, Schieberblöcke,
   Bodenschalter, Kristallschalter, Tore), das Kapsel-Schrein-Tierchen „Kapsli“ (füttern → entwickelt sich in 5 Stufen, kämpft im Verbotenen Wald mit), die Schmiede (Schwert verbessern),
   die Uralte Höhle (Mini-Spiel mit immer neuen Stockwerken), rote und blaue Schatztruhen, eine schwebende Titanen-Festung am Himmel und im Verbotenen Wald der Titan Kron.
   Lokale Koordinaten (a, b): a = Richtung Inselmitte (weg von der Brücke), b = quer dazu. */
BI.RAETSEL = (function () {
  const R = 84, cx = -298, cz = 374, len = Math.hypot(cx, cz), ux = cx / len, uz = cz / len; // ux,uz: Richtung Hauptinsel → Rätsel-Insel
  const A0 = { x: ux * 171, z: uz * 171 }, A1 = { x: cx - ux * (R - 5), z: cz - uz * (R - 5) };
  return { x: cx, z: cz, R, ux, uz, entry: { x: cx - ux * (R - 12), z: cz - uz * (R - 12) }, hills: [], rects: [],
    bridge: { mx: (A0.x + A1.x) / 2, mz: (A0.z + A1.z) / 2, L: Math.hypot(A1.x - A0.x, A1.z - A0.z) + 2, w: 7, ry: Math.atan2(ux, uz) } };
})();
BI.RAETSEL.at = function (a, b) { const M = BI.RAETSEL; return { x: M.x + M.ux * a - M.uz * b, z: M.z + M.uz * a + M.ux * b }; };
BI.RAETSEL.loc = function (x, z) { const M = BI.RAETSEL, dx = x - M.x, dz = z - M.z; return { a: dx * M.ux + dz * M.uz, b: -dx * M.uz + dz * M.ux }; };
/* Prüfungsturm (lokal): Räume, Rätsel, Truhen */
BI.RAETSEL.T = { a0: 4, a1: 68, b0: -14, b1: 14, hall: 16, r1: 32, r2: 48, door: 2.5, gap: 3,
  block0: [22, -6], plate: [26, 6], crystal: [46, 0], pool: [38, 44], pit: [56, 60], postN: [54.5, 0], postF: [61.5, 0], altar: [10, 10], wall: [35.5, -14], alcove: [35.5, -18.2] };
BI.RAETSEL.CHESTS = [
  { id: 'c1', a: 10, b: -10, kind: 'red', tool: 'bomb', txt: '💣 Bomben! Damit sprengst du rissige Wände (Aktionstaste an der Wand).' },
  { id: 'c2', a: 30, b: -11, kind: 'red', tool: 'bow', txt: '🏹 Bogen! Schieß auf Kristalle, die zu weit weg sind.' },
  { id: 'c3', a: 35.5, b: -18.2, kind: 'blue', tool: 'hook', txt: '🪝 Enterhaken! Zieh dich an goldenen Haken-Pfosten über Abgründe.' },
  { id: 'c4', a: 65, b: 0, kind: 'blue', big: 1, txt: '🏆 Der Schatz des Prüfungsturms!' },
  { id: 'v1', a: -66, b: -30, kind: 'red', stars: 1, food: 'apple' }, { id: 'v2', a: -52, b: 42, kind: 'red', stars: 1, food: 'cookie' }, { id: 'v3', a: -8, b: -46, kind: 'red', stars: 1, food: 'banana' },
  { id: 'v4', a: 22, b: 44, kind: 'blue', stars: 2, food: 'cakeslice' }, { id: 'v5', a: 60, b: -40, kind: 'blue', stars: 2, food: 'icecream' }, { id: 'v6', a: -74, b: 20, kind: 'blue', stars: 3, food: 'cake', bomb: 1 }];
BI.RAETSEL.CAPS = [['feuer', '🔥', 'Feuer', 0xff6a3a, ['Funkel', 'Flammi', 'Brenner', 'Glutdrache', 'Phönix']], ['wasser', '💧', 'Wasser', 0x4da3ff, ['Tropf', 'Pläscher', 'Wellino', 'Flutdrache', 'Meerkönig']], ['wind', '🌪️', 'Wind', 0x4cd07d, ['Pust', 'Brisi', 'Wirbler', 'Sturmdrache', 'Himmelsfürst']]];
BI.RAETSEL.STAGE_XP = [0, 3, 8, 15, 26];
BI.RAETSEL.FOODS = ['apple', 'banana', 'carrot', 'tomato', 'corn', 'strawberry', 'cookie', 'croissant', 'cakeslice', 'cake', 'icecream', 'pancake', 'pizza', 'popcorn', 'juice', 'bread', 'cheese', 'choc', 'cotton', 'fruitsalad', 'sandwich', 'soup', 'jam', 'cocoa', 'krabbenburger', 'quallenshake', 'pommes', 'seetang'];
BI.RAETSEL.SWORDS = [['Holzschwert', '🪵', 0], ['Eisenschwert', '⚔️', 3], ['Silberschwert', '🗡️', 6], ['Runenschwert', '✨', 10], ['Titanenschwert', '👑', 15]];

BI.buildRaetselGround = function (c) {
  const { W, st, lamp, ROADY } = c, M = BI.RAETSEL, T = M.T, TAU = Math.PI * 2, rn = BI.rng(6161), L = M.at, ry = Math.atan2(M.ux, M.uz);
  W.spots.raetsel = { x: M.entry.x, z: M.entry.z }; W.raetsel = M; M.shade = []; M.dyn = {};
  st.disc(M.x, M.z, M.R + 9, 0, 0x93d078, 96); st.ring(M.x, M.z, M.R - 5, M.R + 9, .012, 0xe8dca8, 96); BI.buildIsleBridge(c, M);
  const bx = (a, b, wb, h, da, col, y0, yaw) => { const p = L(a, b); st.box(p.x, y0 || 0, p.z, wb, h, da, col, ry + (yaw || 0)); return p; };
  const cyl = (a, b, r0, r1, h, col, y0, seg) => { const p = L(a, b); st.cyl(p.x, y0 || 0, p.z, r0, r1, h, col, seg || 12); return p; };
  const cone = (a, b, r, h, col, y0, seg) => { const p = L(a, b); st.cone(p.x, y0 || 0, p.z, r, h, col, seg || 8); return p; };
  const sph = (a, b, y, r, col, sy) => { const p = L(a, b); st.sph(p.x, y, p.z, r, col, 1, 1, sy || 1, 1); return p; };
  const glow = (a, b, y, r, col) => { const p = L(a, b); lamp.sph(p.x, y, p.z, r, col, 1); return p; };
  const solid = (a, b, r, h) => { const p = L(a, b); W.addCircle(p.x, p.z, r, false, h || 4); return p; };
  const path = (a0, b0, a1, b1, w, col) => { const p = L((a0 + a1) / 2, (b0 + b1) / 2), q0 = L(a0, b0), q1 = L(a1, b1); st.strip(p.x, p.z, w, Math.hypot(a1 - a0, b1 - b0), Math.atan2(q1.x - q0.x, q1.z - q0.z), ROADY, col || 0xe8d8a8); };
  const zone = (a, b, r, col, y) => { const p = L(a, b); st.disc(p.x, p.z, r, y || ROADY + .004, col, 40); };
  const wallC = (a0, b0, a1, b1) => { const n = Math.max(1, Math.round(Math.hypot(a1 - a0, b1 - b0) / 1.1)); for (let i = 0; i <= n; i++) solid(a0 + (a1 - a0) * i / n, b0 + (b1 - b0) * i / n, .8, 7); };
  const dynC = (a, b, r) => { const q = L(a, b), o = { x: q.x, z: q.z, r, on: true }; W.dyn.push(o); return o; };
  const dynChain = (a0, b0, a1, b1, r) => { const n = Math.max(1, Math.round(Math.hypot(a1 - a0, b1 - b0) / (r * 1.2))), o = []; for (let i = 0; i <= n; i++) o.push(dynC(a0 + (a1 - a0) * i / n, b0 + (b1 - b0) * i / n, r)); return o; };
  const tree = (a, b, h, col) => { cyl(a, b, .25, .4, h, 0x7a4a2a, 0, 6); sph(a, b, h + 1.3, 2, col, .95); sph(a + .5, b - .3, h + 2.6, 1.3, col + 0x0a140a, .95); solid(a, b, .5, 3); M.shade.push([L(a, b), 2.2, h]); };
  /* ---- Wege, Dorfplatz „Wiesenhain“ mit Helden-Statue, Häuser, Brunnen ---- */
  path(-72, 0, 4, 0, 6); path(-44, 0, -44, -24, 3.4); path(-44, 0, -44, 26, 3.4); path(-20, 0, -20, 28, 3.2); path(-20, 0, -20, -26, 3.2); path(-44, 32, -34, 44, 3);
  { zone(-44, 0, 12, 0xf0e4b8); const p = L(-44, 0); st.ring(p.x, p.z, 8.5, 9.4, ROADY + .02, 0x6a8ad8, 40); st.ring(p.x, p.z, 5, 5.6, ROADY + .02, 0xffd23f, 40);
    cyl(-44, 0, 3.4, 3.7, .7, 0xc9d0e0, 0, 14); cyl(-44, 0, 2.4, 2.6, 1.1, 0xaab2c6, .7, 12); bx(-44, 0, 1.1, 3.4, .9, 0x8f98ad, 1.8); sph(-44, 0, 5.5, .8, 0xf3c9a0); bx(-44, -1.3, .5, 2.8, .5, 0xe0382b, 2.4); { const q = L(-44, 1.6); st.box(q.x, 3.6, q.z, .22, 3.2, .22, 0xffd23f, ry, 0, .3); } solid(-44, 0, 3.7, 6); W.spots.rz_statue = L(-44, 6); zone(-44, 6, 2, 0xe0d098); }
  { const HC = [0xe8c88a, 0xd8a870, 0xe0b890, 0xc8d8a0, 0xd0b0d8, 0xe8d0a0];
    [[-58, -22], [-58, 22], [-44, -24], [-44, 24], [-30, -22], [-30, 22]].forEach(([a, b], i) => { bx(a, b, 7, 5, 6, HC[i]); const p = L(a, b); st.prism(p.x, 5, p.z, 8, 2.8, 7, [0xb04a3a, 0x4a6ab0, 0x6a8a3a][i % 3], ry + Math.PI / 2); const dg = b < 0 ? 1 : -1, q = L(a, b + dg * 3.55); st.box(q.x, 0, q.z, 1.3, 2.4, .2, 0x6a3a1a, ry); for (const sd of [-1, 1]) { const w = L(a + sd * 2.2, b + dg * 3.55); lamp.box(w.x, 2.2, w.z, 1, 1.1, .1, 0xffe9a0, ry); } solid(a, b, 4.4, 6); M.shade.push([L(a, b), 5, 6]); }); }
  for (const [a, b] of [[-52, -10], [-52, 10], [-36, -10], [-36, 10], [-66, 0], [-12, -10], [-12, 10]]) { cyl(a, b, .07, .09, 3.3, 0x4a505c, 0, 6); glow(a, b, 3.6, .3, 0xfff0b0); }
  /* ---- Schmiede (Amboss, Esse) ---- */
  { const A = -20, B = -36; bx(A, B, 8, 4.4, 6, 0xb08a6a); const p = L(A, B); st.prism(p.x, 4.4, p.z, 9, 2.4, 7, 0x6a3a2a, ry + Math.PI / 2); cyl(A - 2.5, B - 1, .8, 1.0, 7, 0x8a7a6a, 0, 8); lamp.sph(L(A - 2.5, B - 1).x, 7.4, L(A - 2.5, B - 1).z, .6, 0xff7a2a, 1); const q = L(A, B + 3.2); st.box(q.x, 0, q.z, 1.4, .9, .9, 0x3a3f4a, ry); st.box(q.x, .9, q.z, 1.8, .3, .7, 0x5a6070, ry); const e = L(A + 2, B + 3.3); lamp.box(e.x, .5, e.z, 1.5, .5, 1, 0xff7a2a, ry); solid(A, B, 4.8, 5); W.spots.rz_schmiede = L(A, B + 6); zone(A, B + 6, 3.5, 0xe0d098); path(A, B + 5, A, -26, 3.2); }
  /* ---- Kapsel-Schrein: Rundplatz mit drei Elementar-Eiern ---- */
  { const A = -20, B = 34, p = L(A, B); zone(A, B, 9, 0xe8e4f4); st.ring(p.x, p.z, 7.2, 8, ROADY + .02, 0xb48aff, 36); cyl(A, B, 3.1, 3.4, .6, 0xc9d0e0, 0, 16); cyl(A, B, 2.5, 2.5, .15, 0x8f98ad, .6, 16); for (let k = 0; k < 3; k++) { const g = k / 3 * TAU, a = A + Math.sin(g) * 1.5, b = B + Math.cos(g) * 1.5; sph(a, b, 1.5, .55, [0xff6a3a, 0x4da3ff, 0x4cd07d][k], 1.25); cyl(a, b, .3, .4, .25, 0xffd23f, .7, 8); glow(a, b, 2.3, .22, [0xffb08a, 0x9fd0ff, 0xaaf0c0][k]); }
    for (let k = 0; k < 6; k++) { const g = k / 6 * TAU + .5, a = A + Math.sin(g) * 6.6, b = B + Math.cos(g) * 6.6; cyl(a, b, .5, .6, 3.6, 0xc9d0e0, 0, 8); sph(a, b, 4, .5, 0xb48aff); solid(a, b, .7, 4); } solid(A, B, 3.4, 1.2); W.spots.rz_schrein = L(A, B + 4.5); }
  /* ---- Uralte Höhle: Felsbogen mit dunklem Eingang ---- */
  { const A = -40, B = 52; for (let k = 0; k < 7; k++) { const g = (k - 3) * .5, a = A + Math.sin(g) * 5.5, b = B + Math.cos(g) * 1.2; sph(a, b, 2.8 + (3 - Math.abs(k - 3)) * .5, 2.2, 0x8a8a96, .9); solid(a, b, 2, 7); } bx(A, B - .5, 6, 5, .5, 0x1a1a24, 0); sph(A, B - 1.2, 4.6, 1.3, 0x5a5a68); glow(A - 3, B - 3.5, 1.4, .3, 0xffa04a); glow(A + 3, B - 3.5, 1.4, .3, 0xffa04a); cyl(A - 3, B - 3.5, .1, .1, 1.4, 0x6a4a2a, 0, 5); cyl(A + 3, B - 3.5, .1, .1, 1.4, 0x6a4a2a, 0, 5); W.spots.rz_hoehle = L(A, B - 5); zone(A, B - 5, 4, 0xd8cca0); path(-44, 32, A, B - 5, 3); }
  /* ---- Prüfungsturm: drei Kammern hinter Toren ---- */
  { const rb = M.roofB = new BI.Batch(), rbx = (a, b, wb, h, da, col, y0) => { const q = L(a, b); rb.box(q.x, y0 || 0, q.z, wb, h, da, col, ry); }, H = 7, WL = 0x9a9aa8, WL2 = 0xb4b4c4, FL = [0xd8d0b8, 0xc8d8c8, 0xd0c8d8, 0xd8c8b8];
    const wl = (a0, b0, a1, b1, noC) => { bx((a0 + a1) / 2, (b0 + b1) / 2, Math.max(b1 - b0, .9), H, Math.max(a1 - a0, .9), WL); if (!noC) wallC(a0, b0, a1, b1); };
    wl(T.a1 - 1, T.b0, T.a1, T.b1); /* Rückwand */
    wl(T.a0, T.b0, T.a1, T.b0 + 1, true); wl(T.a0, T.b1 - 1, T.a1, T.b1, true); /* Seitenwände: Kollision unten (der Spalt der rissigen Wand ist beweglich) */
    wallC(T.a0, T.b1 - .5, T.a1, T.b1 - .5); wallC(T.a0, T.b0 + .5, T.wall[0] - 2, T.b0 + .5); wallC(T.wall[0] + 2.2, T.b0 + .5, T.a1, T.b0 + .5);
    wl(T.a0, T.b0, T.a0 + 1, -T.gap); wl(T.a0, T.gap, T.a0 + 1, T.b1); /* Vorderwand mit Eingang */
    for (const a of [T.hall, T.r1, T.r2]) { wl(a, T.b0, a + 1, -T.door); wl(a, T.door, a + 1, T.b1); }
    for (const [i, a0] of [[0, T.a0 + 1], [1, T.hall + 1], [2, T.r1 + 1], [3, T.r2 + 1]]) { const a1 = [T.hall, T.r1, T.r2, T.a1 - 1][i]; bx((a0 + a1) / 2, 0, T.b1 - T.b0 - 2, .1, a1 - a0, FL[i], 0); for (let k = 0; k < 4; k++) { bx((a0 + a1) / 2 - (a1 - a0) / 2 + 2 + k * (a1 - a0 - 4) / 3, 0, T.b1 - T.b0 - 3, .02, .3, 0xffffff, .1); } }
    for (const a of [T.a0 + 2.5, T.hall + 3, T.r1 + 3, T.r2 + 3, T.a1 - 3]) for (const sd of [-1, 1]) { const b = sd * (T.b1 - 1.4); cyl(a, b, .1, .12, 2.2, 0x6a4a2a, 0, 6); glow(a, b, 2.5, .3, 0xffa04a); }
    rbx((T.a0 + T.a1) / 2, 0, T.b1 - T.b0 + 2, 1, T.a1 - T.a0 + 2, 0x7a7a8a, H); for (let k = 0; k < 14; k++) for (const sd of [-1, 1]) rbx(T.a0 + 1 + k * (T.a1 - T.a0 - 2) / 13, sd * (T.b1 + .6), 1.3, 1.3, 1.3, WL2, H + 1);
    { const q = L((T.a0 + T.a1) / 2, 0); rb.prism(q.x, H + 1, q.z, T.b1 - T.b0 - 4, 4, T.a1 - T.a0 - 6, 0x5a6aa8, ry + Math.PI / 2); }
    { const q = L(T.a0, 0); rb.box(q.x, H - 2.6, q.z, 7, 1.2, 1.6, 0x6a6a7a, ry); }
    /* Eingangsbogen und Titel */ for (const sd of [-1, 1]) { cyl(T.a0, sd * (T.gap + .6), .9, 1, 7.4, 0xc9d0e0, 0, 10); sph(T.a0, sd * (T.gap + .6), 7.6, .7, 0xffd23f); }
    for (let k = -2; k <= 2; k++) bx(T.a0, k * 1.1, 1.3, .8, 1.2, k % 2 ? 0xffd23f : 0x5a6aa8, 5.6 + 1.2 - Math.abs(k) * .2);
    W.spots.rz_turm = L(T.a0 - 5, 0); W.spots.rz_tuerwaechter = L(T.a0 - 3, 4); path(0, 0, T.a0, 0, 6, 0xd8d0b8);
    /* Becken (Rätsel 2) und Grube (Rätsel 3) als Mulden mit Wasser/Lava */
    bx((T.pool[0] + T.pool[1]) / 2, 0, T.b1 - T.b0 - 2, .14, T.pool[1] - T.pool[0], 0x4ac8ff, 0); bx((T.pool[0] + T.pool[1]) / 2, 0, T.b1 - T.b0 - 2, .02, T.pool[1] - T.pool[0] - .4, 0x8fe0ff, .14);
    bx((T.pit[0] + T.pit[1]) / 2, 0, T.b1 - T.b0 - 2, .14, T.pit[1] - T.pit[0], 0x2a1a1a, 0); const pq = L((T.pit[0] + T.pit[1]) / 2, 0); lamp.box(pq.x, .15, pq.z, T.b1 - T.b0 - 3, .05, T.pit[1] - T.pit[0] - 1, 0xff5a2a, ry);
    M.dyn.pool = dynChain(T.pool[0] + 2, T.b0 + 1.2, T.pool[0] + 2, T.b1 - 1.2, 1.6).concat(dynChain(T.pool[0] + 4.4, T.b0 + 1.2, T.pool[0] + 4.4, T.b1 - 1.2, 1.6));
    M.pitC = dynChain(T.pit[0] + 2, T.b0 + 1.2, T.pit[0] + 2, T.b1 - 1.2, 1.6).concat(dynChain(T.pit[0] + 3.2, T.b0 + 1.2, T.pit[0] + 3.2, T.b1 - 1.2, 1.6));
    /* Tor-Hindernisse (bewegliche Kreise) */
    M.dyn.gateA = dynChain(T.r1 + .5, -T.door + .6, T.r1 + .5, T.door - .6, .9); M.dyn.gateB = dynChain(T.r2 + .5, -T.door + .6, T.r2 + .5, T.door - .6, .9);
    M.dyn.wall = dynChain(T.wall[0] - 2.8, T.b0 + .5, T.wall[0] + 2.8, T.b0 + .5, 1.35);
    /* Alkoven hinter der rissigen Wand */
    { const al = T.alcove[0], A0 = al - 3.7, A1 = al + 3.7, B1 = -22.6; bx(al, (T.b0 + B1) / 2, 1, 5, A1 - A0, WL2, 0); bx(A0, (T.b0 - 1 + B1) / 2, T.b0 - 1 - B1, 5, 1, WL2, 0); bx(A1, (T.b0 - 1 + B1) / 2, T.b0 - 1 - B1, 5, 1, WL2, 0); bx(al, (T.b0 + B1) / 2, -(B1 - T.b0) - 1, .1, A1 - A0, 0xc8c0a8, 0); wallC(A0, T.b0 - .5, A0, B1); wallC(A1, T.b0 - .5, A1, B1); wallC(A0, B1, A1, B1); }
    M.roofIn = { a0: T.a0 + 1, a1: T.a1 - 1, b0: T.b0 + 1, b1: T.b1 - 1 };
  }
  /* ---- Schwebende Titanen-Festung mit Lichtlift und begehbarer Plattform ---- */
  { const A = 2, B = 0, Y = 58; const deck=L(A,B); M.skyBase=L(-10,0); M.skyDeck={x:deck.x,z:deck.z,y:72,r:22}; st.disc(deck.x,deck.z,22,72,0x777b8a,48); st.ring(deck.x,deck.z,20.8,22,.35,0xe9d9ff,48); st.disc(M.skyBase.x,M.skyBase.z,4.2,.08,0x8c78e8,24); st.ring(M.skyBase.x,M.skyBase.z,3.3,4.25,.22,0xb8aaff,24); for(let k=0;k<4;k++){const a=-10+Math.sin(k*Math.PI/2)*3.2,b=Math.cos(k*Math.PI/2)*3.2,q=L(a,b); cyl(a,b,.35,.55,3,[0x79dcff,0xc9a8ff,0xffdf75,0x8df0c0][k],.1,8); glow(a,b,2,.8,0xaedfff);} M.floor=(x,z)=>Math.hypot(x-deck.x,z-deck.z)<21.5?72:null; cyl(A, B, 24, 12, 14, 0x7a7a8a, Y, 20); cone(A, B, 12, 8, 0x5a5a6a, Y - 8, 20); for (let k = 0; k < 4; k++) { const g = k * 1.571 + .785, a = A + Math.sin(g) * 17, b = B + Math.cos(g) * 17; cyl(a, b, 2.4, 2.8, 18, [0xff6a3a, 0x4da3ff, 0x4cd07d, 0xb48aff][k], Y + 14, 10); cone(a, b, 3.4, 6, 0x3a3a4a, Y + 32, 10); glow(a, b, Y + 40, .8, [0xffb08a, 0x9fd0ff, 0xaaf0c0, 0xd8b8ff][k]); }
    cyl(A, B, 7, 8, 12, 0xc9d0e0, Y + 14, 14); cone(A, B, 8.4, 10, 0x2a2a3a, Y + 26, 14); sph(A, B, Y + 38, 1.4, 0xffd23f); glow(A, B, Y + 38, 2.2, 0xfff3b0); W.spots.rz_festung = { x: L(A, B).x, z: L(A, B).z, y: Y + 44 }; }
  /* ---- Wald, Wiese, Truhen-Plätze, Blumen ---- */
  for (let i = 0; i < 40; i++) { const a = rn() * TAU, d = 40 + rn() * 30, la = Math.sin(a) * d, lb = Math.cos(a) * d; if (Math.hypot(la - 36, lb) < 38 && la > -4 && la < 76) continue; if (Math.hypot(la + 44, lb) < 18 || Math.hypot(la + 20, lb - 34) < 12 || Math.hypot(la + 40, lb - 52) < 10 || Math.hypot(la + 20, lb + 36) < 10) continue; if (Math.hypot(la, lb) > M.R - 8) continue; if (BI.RAETSEL.CHESTS.some(c => Math.hypot(c.a - la, c.b - lb) < 6)) continue; tree(la, lb, 3 + rn() * 2.4, [0x4cb85a, 0x3fa84e, 0x5ac966, 0xe8b84a][i % 4]); }
  for (const ch of BI.RAETSEL.CHESTS) if (ch.id[0] === 'v') { zone(ch.a, ch.b, 2.4, 0xd8cca0); }
  { const cols = [0x82c174, 0xa6d591, 0x77b869, 0x8cc77d, 0xb4dd8f], put = [[], [], []]; for (let i = 0, n = 0; i < 400 && n < 50; i++) { const a = rn() * TAU, d = Math.sqrt(rn()) * (M.R - 14), r = 3 + rn() * 6, x = M.x + Math.sin(a) * d, z = M.z + Math.cos(a) * d, k = n % 3; if (put[k].some(q => Math.hypot(q[0] - x, q[1] - z) < q[2] + r + .2)) continue; put[k].push([x, z, r]); st.disc(x, z, r, .024 + k * .0008, cols[n % cols.length], 14); n++; } }
  /* rissige Felswand beim Dorf (Bomben-Geheimnis) */
  { const a = -74, b = 20; M.dyn.rock = [...Array(7).keys()].map(k => dynC(a + Math.sin(k / 7 * TAU) * 2.6, b + Math.cos(k / 7 * TAU) * 2.6, 1.5)); W.spots.rz_fels = L(a, b); }
};

/* Kapselmonster-Modell (auch als Haustier/Begleiter nutzbar) */
BI.kapselMesh = function (el, stage) { const M = BI.RAETSEL, mat = BI.mat(); const C = M.CAPS.find(q => q[0] === el), col = C[3], b = new BI.Batch(), sz = .38 + stage * .07; b.sph(0, sz, 0, sz, col, 1, 1, .95, 1.1); b.sph(0, sz * 1.5, sz * .65, sz * .7, col, 1); b.sph(-.1 * sz * 2, sz * 1.62, sz * 1.25, sz * .22, 0xffffff, 0); b.sph(.1 * sz * 2, sz * 1.62, sz * 1.25, sz * .22, 0xffffff, 0); b.sph(-.1 * sz * 2, sz * 1.62, sz * 1.4, sz * .1, 0x222222, 0); b.sph(.1 * sz * 2, sz * 1.62, sz * 1.4, sz * .1, 0x222222, 0);
    b.cone(-sz * .5, sz * 2.0, sz * .5, sz * .3, sz * .6, 0xfff0d0, 5); b.cone(sz * .5, sz * 2.0, sz * .5, sz * .3, sz * .6, 0xfff0d0, 5); b.cone(0, sz * .9, -sz * 1.1, sz * .3, sz * .9, col, 5);
    if (stage >= 2) for (const sx of [-1, 1]) b.cone(sx * sz * .3, sz * 2.3, sz * .4, sz * .18, sz * .9, 0xffd23f, 5);
    if (stage >= 3) for (const sx of [-1, 1]) { b.box(sx * sz * 1.1, sz * 1.2, -sz * .3, sz * .1, sz * 1.1, sz * .9, 0xffffff, 0, 0, sx * .6); b.box(sx * sz * 1.5, sz * 1.5, -sz * .3, sz * .1, sz * .8, sz * .7, col, 0, 0, sx * .9); }
    if (stage >= 4) { for (let i = 0; i < 5; i++) b.cone(Math.sin(i * 1.26) * sz * .5, sz * 2.45, Math.cos(i * 1.26) * sz * .3 + sz * .4, sz * .12, sz * .5, 0xffd23f, 4); }
    if (stage >= 5) { b.cyl(0, sz * 2.9, sz * .4, sz * .5, sz * .5, sz * .15, 0xffd23f, 12); b.sph(0, sz * 3.2, sz * .4, sz * .16, 0xff5a8a, 1); for (let i = 0; i < 8; i++) b.sph(Math.sin(i * .785) * sz * 2, sz * .2, Math.cos(i * .785) * sz * 2, sz * .1, 0xffe9a0, 0); }
    const m = new THREE.Mesh(b.mesh(mat).geometry, mat); return m; };
BI.kapselStage = () => 1; /* wird zur Laufzeit von createRaetsel auf die echte Stufe des Spielstands gesetzt */
BI.makeKapselPet = function (def) {
  const root = new THREE.Group(), inner = new THREE.Group(); root.add(inner); inner.add(BI.kapselMesh(def.kapsel, BI.kapselStage()));
  return { group: root, reset() { inner.position.y = 0; inner.rotation.set(0, 0, 0); }, trick(nm, k) { inner.rotation.y = k * 6.283; inner.position.y = Math.abs(Math.sin(k * 9)) * .5; },
    pose(phase, amp) { const mv = amp > .05; inner.position.y = mv ? Math.abs(Math.sin(phase)) * .14 : Math.sin(phase * .5) * .03; inner.rotation.y = 0; } };
};
for (const c of BI.RAETSEL.CAPS) if (!BI.PETS.some(q => q.id === 'kapsel_' + c[0])) BI.PETS.push({ id: 'kapsel_' + c[0], name: 'Kapsel ' + c[2], icon: c[1], mascot: true, kapsel: c[0] });

/* ===================================================================== Laufzeit ===================================================================== */
BI.createRaetsel = function (G) {
  const { scene, W, A, fx, P, say, save, persist } = G, K = { open: null }, M = BI.RAETSEL, T = M.T, L = M.at, TAU = Math.PI * 2, SP = W.spots, mat = BI.mat();
  const S = () => { const s = save.raetsel || (save.raetsel = {}); s.tools = s.tools || {}; s.chests = s.chests || []; s.puz = s.puz || {}; s.cap = s.cap || null; s.sword |= 0; s.once = s.once || {}; s.feeds |= 0; return s; };
  S();
  const note = (f, d, ty, v, del) => { try { A.note && A.note(f, d, ty, v, del || 0); } catch (e) { } };
  const stars = n => G.addStars(n), earn = id => G.earn && G.earn(id), nr = (o, r) => o && Math.hypot(P.x - o.x, P.z - o.z) < r, onIsle = () => Math.hypot(P.x - M.x, P.z - M.z) < M.R + 4;
  const sign = (txt, p, y, w) => { const cv = document.createElement('canvas'); cv.width = 512; cv.height = 96; const c = cv.getContext('2d'); let f = 52; c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; const mw = c.measureText(txt).width; if (mw > 480) { f = Math.floor(f * 480 / mw); c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; } c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 10; c.strokeStyle = '#2a2a5a'; c.strokeText(txt, 256, 50); c.fillStyle = '#ffe9a0'; c.fillText(txt, 256, 50); const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false })); sp.scale.set(w, w * 96 / 512, 1); sp.position.set(p.x, y, p.z); scene.add(sp); return sp; };
  { const g = L(-70, 0); sign('🗿 Rätsel-Insel der Uralten ⚔️', { x: g.x, z: g.z }, 11, 13); }
  sign('✨ Lichtlift zur Himmelsfestung', M.skyBase, 5.2, 8);
  sign('🏯 Prüfungsturm', SP.rz_turm, 12, 9); sign('🧱 Block hierher schieben!', L(...T.plate), 4.2, 5); sign('🥚 Kapsel-Schrein', SP.rz_schrein, 7, 8); sign('⚒️ Schmiede', SP.rz_schmiede, 6.4, 6); sign('🕳️ Uralte Höhle', SP.rz_hoehle, 8, 8); sign('🦸 Held Milo', SP.rz_statue, 7.6, 6); sign('🏰 Titanen-Festung', { x: SP.rz_festung.x, z: SP.rz_festung.z }, SP.rz_festung.y, 12);
  /* ---------- Dach des Turms ---------- */
  const roof = M.roofB.mesh(mat); roof.frustumCulled = false; scene.add(roof); M.roofB = null; const RI = M.roofIn;
  /* ---------- Truhen ---------- */
  const chestG = (kind) => { const b = new BI.Batch(), body = kind === 'blue' ? 0x3a6ad8 : 0xc23a2a; b.box(0, 0, 0, 1.5, .8, 1.0, 0x8a5a2a); b.box(0, .8, 0, 1.5, .1, 1.0, body); b.box(0, .2, .52, .3, .3, .06, 0xffd23f); for (const sx of [-.6, .6]) b.box(sx, 0, 0, .12, .85, 1.04, 0xffd23f); const lb = new BI.Batch(); lb.box(0, 0, -.5, 1.5, .3, 1.0, body); lb.cyl(0, .3, -.5, .4, .4, 1.5, body, 8, 0, 0, Math.PI / 2); for (const sx of [-.6, .6]) lb.box(sx, 0, -.5, .12, .5, 1.04, 0xffd23f); const g = new THREE.Group(), base = new THREE.Mesh(b.mesh(mat).geometry, mat), lid = new THREE.Group(); lid.add(new THREE.Mesh(lb.mesh(mat).geometry, mat)); lid.position.set(0, .9, .5); g.add(base, lid); g.userData.lid = lid; return g; };
  const CH = M.CHESTS = BI.RAETSEL.CHESTS.map(c => { const g = chestG(c.kind), q = L(c.a, c.b); g.position.set(q.x, 0, q.z); g.rotation.y = Math.atan2(M.ux, M.uz) + (c.a > 0 ? Math.PI / 2 * (c.b > 0 ? 1 : -1) : Math.PI); scene.add(g); W.addCircle(q.x, q.z, .9, false, 1.2); return Object.assign({ g, x: q.x, z: q.z }, c); });
  const openVis = c => { c.g.userData.lid.rotation.x = 1.6; };
  /* ---------- Block, Platte, Kristall, Brücke, Tore, rissige Wand, Haken-Pfosten ---------- */
  const mk = (fn, x, z, y) => { const b = new BI.Batch(); fn(b); const g = new THREE.Group(); g.add(new THREE.Mesh(b.mesh(mat).geometry, mat)); g.position.set(x, y || 0, z); scene.add(g); return g; };
  const blk = (() => { const q = L(...T.block0); const g = mk(b => { b.box(0, 0, 0, 1.9, 1.9, 1.9, 0x9a9aa8); b.box(0, 1.9, 0, 2.0, .15, 2.0, 0xb8b8c8); b.box(0, .5, .96, .9, .9, .06, 0x5a6aa8); b.box(0, 1.0, .98, .3, .3, .06, 0xffd23f); }, q.x, q.z); g.rotation.y = Math.atan2(M.ux, M.uz); return { g, a: T.block0[0], b: T.block0[1], tw: null, o: null }; })();
  blk.o = { x: blk.g.position.x, z: blk.g.position.z, r: 1.15, on: true }; W.dyn.push(blk.o);
  const plateQ = L(...T.plate), plate = (() => { const m = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, .14, 24), new THREE.MeshBasicMaterial({ color: 0xffb04a })); m.position.set(plateQ.x, .17, plateQ.z); scene.add(m); return m; })();
  /* Block-Rätsel: Zielplatte mit Leuchtring und Lichtstrahl, damit man sie schon von weitem sieht */
  const plateRing = (() => { const m = new THREE.Mesh(new THREE.RingGeometry(1.7, 2.5, 28), new THREE.MeshBasicMaterial({ color: 0xffe27a, transparent: true, opacity: .8, side: THREE.DoubleSide, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(plateQ.x, .2, plateQ.z); scene.add(m); return m; })();
  const plateBeam = (() => { const m = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 9, 14, 1, true), new THREE.MeshBasicMaterial({ color: 0xffd23f, transparent: true, opacity: .22, side: THREE.DoubleSide, depthWrite: false })); m.position.set(plateQ.x, 4.6, plateQ.z); scene.add(m); return m; })();
  const crQ = L(...T.crystal), crystal = (() => { const g = new THREE.Group(), m = new THREE.Mesh(new THREE.OctahedronGeometry(.9, 0), new THREE.MeshBasicMaterial({ color: 0x4a6aa8 })); m.scale.set(1, 1.5, 1); m.position.y = 3.2; g.add(m); const b = new BI.Batch(); b.cyl(0, 0, 0, .8, 1, 2.2, 0x8a8a98, 8); g.add(new THREE.Mesh(b.mesh(mat).geometry, mat)); g.position.set(crQ.x, 0, crQ.z); g.userData.m = m; scene.add(g); return g; })();
  const poolCtr = L((T.pool[0] + T.pool[1]) / 2, 0), bridgeG = mk(b => { for (let k = 0; k < 9; k++) b.box(0, .02, -3.6 + k * .9, 3.2, .16, .8, 0xb98650); for (const sx of [-1.6, 1.6]) b.box(sx, 0, 0, .15, .5, 8.2, 0x8a5a33); }, poolCtr.x, poolCtr.z, .12); bridgeG.rotation.y = Math.atan2(M.ux, M.uz); bridgeG.visible = false;
  const gateG = a => { const q = L(a + .5, 0), g = mk(b => { for (let k = -2; k <= 2; k++) b.box(k * 1.0, 0, 0, .25, 5.6, .3, 0x4a4a58); b.box(0, 5.2, 0, 5.4, .5, .5, 0xffd23f); b.box(0, 1.6, 0, 5.4, .3, .3, 0x6a6a78); }, q.x, q.z); g.rotation.y = Math.atan2(M.ux, M.uz); return g; };
  const gA = gateG(T.r1), gB = gateG(T.r2);
  /* Rissige Wand: leuchtende Platte an der INNENSEITE der Seitenwand von Raum 2 (vorher saß sie im Mauerwerk und war nicht zu sehen) + Schild */
  const wlQ = L(...T.wall), wlV = L(T.wall[0], T.b0 + 2.25), crack = mk(b => { b.box(0, 0, 0, 4.6, 5.8, .3, 0x9b8564); b.box(0, 0, -.2, 4.9, .22, .14, 0xffb52e); b.box(0, 5.6, -.2, 4.9, .22, .14, 0xffb52e); b.box(-2.35, 0, -.2, .22, 5.8, .14, 0xffb52e); b.box(2.35, 0, -.2, .22, 5.8, .14, 0xffb52e); b.box(-.8, .7, -.3, .2, 3.9, .14, 0x241512); b.box(.7, 1.5, -.3, .2, 3.8, .14, 0x241512, 0, 0, .55); b.box(0, 3.4, -.3, 2.2, .2, .14, 0x241512); b.box(-.65, 2.4, -.3, 1.4, .2, .14, 0x241512, 0, 0, -.65); b.box(.55, 4.25, -.3, 1.1, .2, .14, 0xffe36d, 0, 0, -.5); }, wlV.x, wlV.z); crack.rotation.y = Math.atan2(M.ux, M.uz) + Math.PI / 2; const crackSign = sign('💣 Rissige Wand – Bombe legen!', wlV, 6.9, 10);
  const rkQ = L(-74, 20), rockCrack = (() => { const g = mk(b => { for (let k = 0; k < 7; k++) { const q = k / 7 * TAU; b.sph(Math.sin(q) * 2.6, 1.1, Math.cos(q) * 2.6, 1.7 + (k % 2) * .3, 0xa8a090, 1, .85, 1); b.box(Math.sin(q) * 3.9, .9, Math.cos(q) * 3.9, .1, 1.6, .1, 0x3a3a3a); } }, rkQ.x, rkQ.z); return g; })();
  const posts = [T.postN, T.postF].map(([a, b]) => { const q = L(a, b), g = mk(bb => { bb.cyl(0, 0, 0, .25, .3, 2.6, 0x6a4a2a, 6); bb.box(0, 2.4, 0, .15, .6, .15, 0xffd23f); bb.box(.35, 3.0, 0, .7, .12, .12, 0xffd23f); bb.sph(.7, 2.75, 0, .22, 0xffd23f); }, q.x, q.z); return { g, x: q.x, z: q.z }; });
  const altQ = L(...T.altar), altar = mk(b => { b.cyl(0, 0, 0, .9, 1.1, .7, 0xc9d0e0, 8); b.sph(0, 1.2, 0, .45, 0xb48aff); }, altQ.x, altQ.z);
  /* ---------- Zustand anwenden ---------- */
  const setGate = (g, dyn, open) => { g.visible = !open; for (const o of dyn) o.on = !open; };
  const placeBlock = (a, b) => { blk.a = a; blk.b = b; const q = L(a, b); blk.g.position.set(q.x, 0, q.z); blk.o.x = q.x; blk.o.z = q.z; };
  function apply() { const s = S(), p = s.puz; if (p.block) placeBlock(...T.plate); else if (s.blockAt) placeBlock(...s.blockAt); setGate(gA, M.dyn.gateA, !!p.block); plate.material.color.setHex(p.block ? 0x4cd07d : 0xffb04a); plateRing.material.color.setHex(p.block ? 0x9affb0 : 0xffe27a); plateBeam.material.color.setHex(p.block ? 0x4cd07d : 0xffd23f);
    crystal.userData.m.material.color.setHex(p.crystal ? 0x7fe0ff : 0x4a6aa8); bridgeG.visible = !!p.crystal; for (const o of M.dyn.pool) o.on = !p.crystal; setGate(gB, M.dyn.gateB, !!p.crystal);
    crack.visible = crackSign.visible = !p.wall; for (const o of M.dyn.wall) o.on = !p.wall; rockCrack.visible = !p.rock; for (const o of M.dyn.rock) o.on = !p.rock; for (const c of CH) if (s.chests.includes(c.id)) openVis(c); }
  apply();
  /* ---------- Hilfen ---------- */
  const note2 = (txt, d) => say(txt, d || 3200);
  function chestReward(c) {
    const s = S(); s.chests.push(c.id); openVis(c); A.fanfare && A.fanfare(); fx.burst(c.x, 1.6, c.z, 22, [[1, .9, .4], [1, 1, 1], c.kind === 'blue' ? [.5, .7, 1] : [1, .5, .4]], 4, 1.2, 28, 3);
    if (c.tool) { s.tools[c.tool] = 1; say(c.txt, 5200); stars(1); }
    else if (c.big) { stars(8); s.puz.tower = 1; say(c.txt + ' +8 ⭐', 5200); earn('turm_s'); }
    else { stars(c.stars); const iv = G.inv && G.inv(); if (iv && c.food) iv[c.food] = (iv[c.food] || 0) + 1; say((c.kind === 'blue' ? '🔷 Blaue' : '🟥 Rote') + ' Truhe! +' + c.stars + ' ⭐ und etwas zum Füttern für dein Kapselmonster 🥚', 4200); }
    persist();
  }
  const dirTo = (x, z) => { const dx = x - P.x, dz = z - P.z; return Math.abs(dx) > Math.abs(dz) ? [Math.sign(dx), 0] : [0, Math.sign(dz)]; };
  /* Block schieben: eine Zelle (2 m) in lokaler a/b-Richtung */
  function pushBlock() {
    const s = S(); if (s.puz.block) return; const lp = M.loc(P.x, P.z), da = blk.a - lp.a, db = blk.b - lp.b; let ua = 0, ub = 0; if (Math.abs(da) > Math.abs(db)) ua = Math.sign(da); else ub = Math.sign(db);
    const na = blk.a + ua * 2, nb = blk.b + ub * 2, r1 = [T.hall + 3, T.r1 - 2.5, T.b0 + 2.5, T.b1 - 2.5]; if (na < r1[0] || na > r1[1] || nb < r1[2] || nb > r1[3] || CH.some(c => Math.hypot(c.a - na, c.b - nb) < 2.2)) { A.bonk && A.bonk(); say('🧱 Der Block bewegt sich nicht weiter.', 1800); return; }
    blk.tw = { t: 0, a0: blk.a, b0: blk.b, a1: na, b1: nb }; blk.a = na; blk.b = nb; A.whoosh && A.whoosh(); note(110, .4, 'sawtooth', .08);
  }
  /* Haken */
  let ride = null;
  function hook(from, to) { ride = { t: 0, dur: 1.5, fx: from.x, fz: from.z, tx: to.x, tz: to.z, h: Math.atan2(to.x - from.x, to.z - from.z) }; A.whoosh && A.whoosh(); say('🪝 Enterhaken!', 1200); }
  /* Bombe & Pfeil */
  const bombM = (() => { const m = new THREE.Mesh(new THREE.SphereGeometry(.4, 10, 8), new THREE.MeshBasicMaterial({ color: 0x222222 })); m.visible = false; scene.add(m); const sp = new THREE.Mesh(new THREE.SphereGeometry(.12, 6, 5), new THREE.MeshBasicMaterial({ color: 0xffa02a })); sp.position.set(0, .5, 0); m.add(sp); return m; })();
  let bomb = null; const arrowM = (() => { const b = new BI.Batch(); b.box(0, 0, 0, .06, .06, 1.2, 0x8a5a2a); b.cone(0, 0, .75, .12, .3, 0xdddddd, 4); const m = new THREE.Mesh(b.mesh(mat).geometry, mat); m.visible = false; m.rotation.order = 'YXZ'; scene.add(m); return m; })(); let arrow = null;
  /* ---------- Kapselmonster ---------- */
  const capMesh = {}; const capModel = (el, stage) => { const k = el + stage; if (!capMesh[k]) capMesh[k] = BI.kapselMesh(el, stage); return capMesh[k].clone(); };
  const capG = new THREE.Group(); scene.add(capG); let capShown = null, capPos = { x: 0, z: 0 }, capCd = 0, capHop = 0;
  BI.kapselStage = () => { const c = S().cap; return c ? stageOf(c.xp) : 1; };
  const stageOf = xp => { let st = 1; BI.RAETSEL.STAGE_XP.forEach((v, i) => { if (xp >= v) st = i + 1; }); return st; };
  function refreshCap() { const s = S(), c = s.cap; const key = c && !c.hid ? c.el + stageOf(c.xp) : null; if (key === capShown) return; capShown = key; while (capG.children.length) capG.remove(capG.children[0]); if (key) { capG.add(capModel(c.el, stageOf(c.xp))); capPos = { x: P.x - 1.5, z: P.z - 1.5 }; capG.position.set(capPos.x, 0, capPos.z); } capG.visible = !!key; }
  const capName = () => { const c = S().cap; if (!c) return ''; const C = M.CAPS.find(q => q[0] === c.el); return C[4][stageOf(c.xp) - 1]; };
  /* ---------- Schwert in der Hand ---------- */
  let swG = null, swAt = null, swLv = -1; const swordMesh = lv => { const b = new BI.Batch(), cols = [0x8a5a2a, 0xc9ccdc, 0xe8eef8, 0x7ae0ff, 0xffd23f]; b.box(0, 0, .55, .07, .12, 1.0 + lv * .12, cols[lv]); b.box(0, 0, 0, .35, .07, .08, 0x6a4a2a); b.sph(0, 0, -.12, .09, 0xffd23f, 1); if (lv >= 3) b.sph(0, 0, 1.3, .08, 0xffffff, 0); return b.mesh(mat); };
  const attachSword = () => { const ch = G.char && G.char(); if (!ch || !ch.armR) return false; if (swAt !== ch.armR) { swAt = ch.armR; swG = null; swLv = -1; } if (swLv !== S().sword) { if (swG) swAt.remove(swG); swLv = S().sword; swG = new THREE.Group(); swG.add(swordMesh(swLv)); swG.position.set(.1, -.78, .06); swG.rotation.set(-Math.PI / 2 + .3, 0, 0); swAt.add(swG); } return true; };
  K.swordMul = () => 1 + .18 * S().sword;
  /* ---------- Figuren ---------- */
  K.people = function (folk) {
    const free = (x, z) => { if (W.free(x, z, .6)) return { x, z }; for (let r = 1; r <= 5; r += 1) for (let k = 0; k < 12; k++) { const g = k / 12 * TAU + r, qx = x + Math.sin(g) * r, qz = z + Math.cos(g) * r; if (W.free(qx, qz, .6)) return { x: qx, z: qz }; } return { x, z }; };
    const mk2 = (a, b, look, name, lines, face) => { const p = free(L(a, b).x, L(a, b).z), c = BI.makeChar(look), f = face ? L(face[0], face[1]) : L(-70, 0), h = Math.atan2(f.x - p.x, f.z - p.z); c.group.position.set(p.x, 0, p.z); c.group.rotation.y = h; scene.add(c.group); const n = { c, x: p.x, z: p.z, h, h0: h, p: { name, lines, i: 0 }, wait: 0, hop: 0, kid: !!look.scale && look.scale < .8, fixed: true }; folk.push(n); return n; };
    const SK = { fair: 0xf6d2b0, tan: 0xd8a070, dark: 0x8a5a33 };
    mk2(-44, 8.5, { shirt: 0xe0382b, pants: 0x2a3a6a, hair: 0xd83a2a, skin: SK.fair, hat: 'none', style: 'spiky', scale: 1.0 }, 'Held Milo', ['Hallo! Ich bin Milo, der Held von Wiesenhain! ⚔️', 'Im Prüfungsturm warten drei Kammern mit Rätseln. Dort brauchst du Bomben, Bogen und Enterhaken!', 'Dein Kapselmonster wird stark, wenn du es fütterst. Es hilft dir im Verbotenen Wald!'], [-44, 0]);
    mk2(-46, 8, { shirt: 0x6a4ae0, pants: 0xf4f4ff, hair: 0xf4d060, skin: SK.fair, hat: 'none', style: 'long', dress: true, scale: .96 }, 'Sela die Magierin', ['Ich bin Sela. Magie ist wie ein Rätsel: Man muss nur genau hinschauen. ✨', 'Der Kristall im Turm leuchtet blau, wenn du ihn mit einem Pfeil triffst.'], [-44, 0]);
    mk2(-42, 8, { shirt: 0x3a6ae8, pants: 0x4a4a5a, hair: 0x3a2a1a, skin: SK.tan, hat: 'none', style: 'short', beard: 3, beardc: 0x3a2a1a, scale: 1.18, build: 2 }, 'Gunnar der Starke', ['Hmpf! Ich schiebe Blöcke, bis sie weinen! 💪', 'Schieb den Block im ersten Raum erst nach oben, dann zur Platte.'], [-44, 0]);
    mk2(-48, 5, { shirt: 0x8a5a2a, pants: 0x4a3a2a, hair: 0xe8e8e8, skin: SK.fair, hat: 'wizard', style: 'long', beard: 6, beardc: 0xffffff, scale: 1.0 }, 'Alchemist Arto', ['Ich mische Tränke und forsche an Kapselmonstern. 🧪', 'Jedes Kapselmonster hat ein Element: Feuer, Wasser oder Wind.'], [-44, 0]);
    mk2(-20, 38, { shirt: 0xffffff, pants: 0xb48aff, hair: 0xb48aff, skin: SK.fair, hat: 'bunny', style: 'twinbuns', dress: true, scale: .9 }, 'Kapselmeisterin Pim', ['Willkommen am Kapsel-Schrein! 🥚 Such dir ein Ei aus: Feuer, Wasser oder Wind.', 'Füttere dein Kapselmonster mit Essen aus dem Rucksack – dann entwickelt es sich in fünf Stufen!', 'Im Verbotenen Wald hilft es dir im Kampf.'], [-20, 34]);
    mk2(-20, -30, { shirt: 0x8a3a2a, pants: 0x3a3a3a, hair: 0x222222, skin: SK.dark, hat: 'cap', style: 'short', beard: 5, beardc: 0x222222, scale: 1.1, build: 2 }, 'Schmied Brokk', ['Klong! Ich bin Brokk. Ich mache dein Schwert stärker. ⚒️', 'Mit stärkerem Schwert machst du im Verbotenen Wald mehr Schaden.'], [-20, -36]);
    mk2(-4, 2, { shirt: 0xffd23f, pants: 0x5a3a2a, hair: 0x6a4a2a, skin: SK.tan, hat: 'helmet', style: 'ponytail', dress: true, scale: 1.0 }, 'Turmwächterin Ilka', ['Der Prüfungsturm hat drei Kammern. In der Vorhalle liegt eine Truhe mit Bomben. 💣', 'Aktionstaste an Truhen, Blöcken, Kristallen und Haken-Pfosten! Das Spiel nimmt automatisch das passende Werkzeug.'], [4, 0]);
    mk2(-58, -17, { shirt: 0xc8d8a0, pants: 0x6a8a3a, hair: 0x6a4a2a, skin: SK.fair, hat: 'cowboy', style: 'short', scale: .62 }, 'Lupo', ['Ich suche rote und blaue Truhen! 📦', 'Blaue Truhen sind selten und geben mehr.'], [-58, -26]);
    mk2(-30, 17, { shirt: 0xff8fc8, pants: 0xffffff, hair: 0xffb0d8, skin: SK.fair, hat: 'flowers', style: 'wavy', dress: true, scale: .95 }, 'Wirtin Rosa', ['Bei mir im Gasthaus gibt es den besten Eintopf! 🍲', 'Hast du schon die Uralte Höhle besucht? Da geht es tief hinunter!'], [-30, 10]);
    mk2(-42, 46, { shirt: 0x4a4a5a, pants: 0x2a2a3a, hair: 0x8a8a96, skin: 0xc0c0cc, hat: 'tophat', style: 'short', beard: 5, beardc: 0xdddddd, scale: 1.05 }, 'Höhlenführer Brum', ['Die Uralte Höhle hat immer neue Stockwerke. Jedes Mal anders! 🕳️', 'Tipp: Weich den Schleimis aus und sammle die Truhen.'], [-40, 50]);
    mk2(-60, 8, { shirt: 0xe8453c, pants: 0xffffff, hair: 0x4a2a1a, skin: SK.tan, hat: 'none', style: 'bob', dress: true, scale: .96 }, 'Dorfälteste Mara', ['Vor langer Zeit lebten vier Titanen am Himmel. Ihre Festung schwebt dort noch immer! 🏰', 'Einer von ihnen, Kron, treibt sich im Verbotenen Wald herum.'], [-58, 0]);
    mk2(-14, -10, { shirt: 0x7fe0ff, pants: 0x3a6ad8, hair: 0xffe27a, skin: SK.fair, hat: 'none', style: 'pixie', scale: .6 }, 'Fina', ['Mein Kapselmonster ist noch ein Ei. Gleich schlüpft es!', 'Bomben knallen so laut! Buuum!'], [-14, -2]);
  };
  /* ---------- Menüs: Kapsel & Schmiede ---------- */
  const panel = document.createElement('div'); panel.hidden = true; panel.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(10,12,40,.6);z-index:60;font-family:Fredoka,system-ui,sans-serif'; document.body.appendChild(panel);
  const el = (t, css, h) => { const e = document.createElement(t); if (css) e.style.cssText = css; if (h != null) e.innerHTML = h; return e; };
  const btn = (txt, col, f) => { const b = el('button', 'font-family:inherit;font-weight:800;font-size:16px;border-radius:14px;border:3px solid ' + col + ';background:#fff;padding:8px 12px;margin:3px;cursor:pointer', txt); b.type = 'button'; b.onclick = f; return b; };
  function render() {
    const s = S(); panel.innerHTML = ''; const card = el('div', 'background:#f6f4ff;border:6px solid #6a4ae0;border-radius:24px;padding:14px 16px;width:min(92vw,440px);max-height:90vh;overflow:auto;text-align:center;box-shadow:0 8px 30px rgba(0,0,0,.45)'); panel.appendChild(card);
    if (K.open === 'cap') {
      card.appendChild(el('div', 'font-size:28px;font-weight:900;color:#4a2ab0', '🥚 Kapsel-Schrein'));
      if (!s.cap) { card.appendChild(el('div', 'font-size:16px;font-weight:700;color:#4a3a6a;margin:6px 0', 'Kapselmeisterin Pim: „Wähle dein Ei!“')); const row = el('div', 'display:flex;gap:8px;justify-content:center'); for (const [id, ic, nm, col] of M.CAPS) { const b = el('button', 'font-family:inherit;font-weight:800;font-size:15px;border-radius:16px;border:4px solid #' + col.toString(16).padStart(6, '0') + ';background:#fff;padding:10px 8px;cursor:pointer;min-width:90px', '<div style="font-size:44px">' + ic + '</div>' + nm); b.type = 'button'; b.onclick = () => { s.cap = { el: id, xp: 0, hid: 0 }; persist(); if (G.unlockPet) G.unlockPet('kapsel_' + id); A.fanfare && A.fanfare(); earn('kapsel'); say('🥚 Das Ei schlüpft: ' + M.CAPS.find(q => q[0] === id)[4][0] + ' ist da! Füttere es mit Essen aus dem Rucksack.', 5200); fx.burst(P.x, 1.6, P.z, 24, [[1, .9, .5], [1, 1, 1]], 4, 1.2, 28, 3); render(); }; row.appendChild(b); } card.appendChild(row); }
      else { const c = s.cap, st = stageOf(c.xp), C = M.CAPS.find(q => q[0] === c.el), nxt = BI.RAETSEL.STAGE_XP[st] != null ? BI.RAETSEL.STAGE_XP[st] : null;
        card.appendChild(el('div', 'font-size:20px;font-weight:900;color:#2a1a6a;margin:4px 0', C[1] + ' ' + C[4][st - 1] + ' · Stufe ' + st + ' von 5')); card.appendChild(el('div', 'background:#ddd;border-radius:10px;height:16px;margin:4px 20px;overflow:hidden', '<div style="height:100%;width:' + (nxt ? Math.min(100, (c.xp - BI.RAETSEL.STAGE_XP[st - 1]) / (nxt - BI.RAETSEL.STAGE_XP[st - 1]) * 100) : 100) + '%;background:#' + C[3].toString(16).padStart(6, '0') + '"></div>'));
        card.appendChild(el('div', 'font-size:14px;font-weight:700;color:#5a4a8a;margin:2px 0 8px', nxt ? 'Futter: ' + c.xp + ' / ' + nxt + ' bis zur nächsten Stufe' : 'Voll entwickelt! Es hilft dir im Verbotenen Wald.'));
        const iv = G.inv && G.inv() || {}, FD = (G.foods && G.foods()) || {}, have = BI.RAETSEL.FOODS.filter(k => (iv[k] | 0) > 0); if (!have.length) card.appendChild(el('div', 'font-size:15px;font-weight:700;color:#8a6a4a;margin:6px', 'Dein Rucksack hat kein Futter. Sammle Truhen, koche oder kaufe etwas! 🍎')); const grid = el('div', 'display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:6px 0');
        for (const k of have) { const fd = FD[k] || ['🍽️', k]; grid.appendChild(btn(fd[0] + ' ' + fd[1] + ' ×' + iv[k], '#8fb8ff', () => feed(k))); } card.appendChild(grid);
        card.appendChild(btn(c.hid ? '🥚 Kapselmonster rufen' : '🎒 Kapselmonster zurückrufen (ausruhen)', '#b48aff', () => { c.hid = c.hid ? 0 : 1; persist(); refreshCap(); render(); })); }
    } else if (K.open === 'forge') {
      card.appendChild(el('div', 'font-size:28px;font-weight:900;color:#8a3a1a', '⚒️ Schmiede')); card.appendChild(el('div', 'font-size:16px;font-weight:700;color:#4a3a2a;margin:6px 0', 'Schmied Brokk: „Ein besseres Schwert – mehr Schaden im Verbotenen Wald!“   ⭐ ' + (save.stars | 0)));
      BI.RAETSEL.SWORDS.forEach((q, i) => { const row = el('div', 'display:flex;align-items:center;gap:8px;margin:5px 0;background:#fff;border:3px solid ' + (i === s.sword ? '#4cd07d' : '#e0c090') + ';border-radius:14px;padding:6px 8px'); row.appendChild(el('div', 'font-size:34px', q[1])); row.appendChild(el('div', 'flex:1;text-align:left;font-weight:800;color:#4a2a1a', q[0] + '<br><span style="font-size:13px;color:#b07a00">+' + (i * 18) + ' % Schaden</span>'));
        if (i === s.sword) row.appendChild(el('div', 'font-weight:900;color:#2a9a4a', '✔ in der Hand')); else if (i === s.sword + 1) row.appendChild(btn('⚒️ ' + q[2] + ' ⭐', '#e08a2a', () => forge(i))); else row.appendChild(el('div', 'font-size:13px;color:#aaa', i < s.sword ? 'schon geschmiedet' : 'später')); card.appendChild(row); });
    }
    card.appendChild(btn('✔ Fertig', '#4cd07d', () => K.close()));
  }
  K.show = function (w) { if (K.open || ride) return; K.open = w; G.setStick && G.setStick(0, 0); render(); panel.hidden = false; };
  K.close = function () { if (!K.open) return; K.open = null; panel.hidden = true; G.updateButtons && G.updateButtons(true); persist(); };
  addEventListener('keydown', e => { if (K.open && e.code === 'Escape') { K.close(); e.preventDefault(); } });
  function feed(k) {
    const s = S(), c = s.cap, iv = G.inv(); if (!c || !(iv[k] > 0)) return; iv[k]--; const before = stageOf(c.xp); c.xp += ['cake', 'krabbenburger', 'pizza'].includes(k) ? 2 : 1; s.feeds++; A.buy && A.buy(); const after = stageOf(c.xp); refreshCap();
    if (after > before) { A.fanfare && A.fanfare(); fx.burst(P.x, 2, P.z, 40, [[1, .9, .5], [1, 1, 1], [1, .6, .9]], 6, 1.5, 30, 3); say('✨ ' + capName() + ' hat sich entwickelt! Stufe ' + after + ' von 5!', 4600); if (after >= 5) earn('kapsel5'); if (G.refreshPet) G.refreshPet(); } else say('😋 Mmh! ' + capName() + ' freut sich.', 1600); persist(); render();
  }
  function forge(i) { const s = S(), q = BI.RAETSEL.SWORDS[i]; if ((save.stars | 0) < q[2]) { say('⭐ Dafür fehlen dir noch ' + (q[2] - save.stars) + ' Sterne.', 2600); A.bonk && A.bonk(); return; } stars(-q[2]); s.sword = i; A.fanfare && A.fanfare(); for (let k = 0; k < 6; k++) note(300 + k * 60, .12, 'square', .08, k * .1); say('⚒️ Klong-klong! ' + q[0] + ' geschmiedet: ' + (i * 18) + ' % mehr Schaden!', 4200); if (i >= 2) earn('schmied'); persist(); render(); }
  /* ---------- Aktionen ---------- */
  const nearChest = () => CH.find(c => !S().chests.includes(c.id) && nr(c, 2.6) && (!c.bomb || S().puz.rock));
  K.near = function () {
    if (P.veh || ride || K.open) return null;
    if (M.skyBase && P.y < 10 && nr(M.skyBase, 4.2)) return { k: 'rzsky', up: true, label: ['✨', 'Zur Himmelsfestung'] };
    if (M.skyDeck && P.y > 20 && Math.hypot(P.x-M.skyDeck.x,P.z-M.skyDeck.z)<19) return { k: 'rzsky', up: false, label: ['⬇️', 'Zur Rätsel-Insel'] };
    if (P.y > 4 || !onIsle()) return null; const s = S(), p = s.puz, tl = s.tools;
    const c = nearChest(); if (c) return { k: 'rzchest', c, label: ['🎁', c.kind === 'blue' ? 'Blaue Truhe öffnen' : 'Truhe öffnen'] };
    if (!p.block && nr({ x: blk.g.position.x, z: blk.g.position.z }, 2.7) && !blk.tw) return { k: 'rzblock', label: ['🧱', 'Block schieben'] };
    if (!p.crystal && nr(crQ, 17) && !bomb) { const lp = M.loc(P.x, P.z); if (lp.a > T.r2 - 14 && lp.a < T.pool[0] + .5) return tl.bow ? { k: 'rzcrystal', label: ['🏹', 'Pfeil auf den Kristall'] } : { k: 'rzhint', msg: '🔷 Der Kristall ist zu weit weg. Du brauchst einen Bogen (Truhe im 1. Raum)!', label: ['❓', 'Kristall ansehen'] }; }
    if (!p.wall && nr(wlQ, 3.8)) return tl.bomb ? { k: 'rzwall', which: 'wall', label: ['💣', 'Bombe legen'] } : { k: 'rzhint', msg: '🧱 Die Wand ist rissig. Mit Bomben könntest du sie sprengen! (Truhe in der Vorhalle)', label: ['❓', 'Rissige Wand'] };
    if (!p.rock && nr(rockCrack.position, 6.4)) return tl.bomb ? { k: 'rzwall', which: 'rock', label: ['💣', 'Bombe legen'] } : { k: 'rzhint', msg: '🪨 Der Fels hat Risse … Bomben aus dem Prüfungsturm könnten ihn sprengen!', label: ['❓', 'Rissiger Fels'] };
    for (const q of posts) if (nr(q, 3.6)) return tl.hook ? { k: 'rzhook', from: q, label: ['🪝', 'Enterhaken'] } : { k: 'rzhint', msg: '🪝 Ein Haken-Pfosten! Dafür brauchst du den Enterhaken (Truhe hinter der rissigen Wand: Raum 2, an der Seitenwand leuchtet ein 💣-Schild).', label: ['❓', 'Haken-Pfosten'] };
    if (nr(altQ, 2.8)) return { k: 'rzaltar', label: ['🔄', p.block ? 'Block-Rätsel gelöst ✔' : 'Block zurücksetzen'] };
    if (nr(SP.rz_schrein, 4.5)) return { k: 'rzcap', label: ['🥚', s.cap ? 'Kapselmonster füttern' : 'Kapsel-Ei wählen'] };
    if (nr(SP.rz_schmiede, 3.8)) return { k: 'rzforge', label: ['⚒️', 'Schwert schmieden'] };
    if (nr(SP.rz_hoehle, 3.6)) return { k: 'rzhoehle', label: ['🕳️', 'Uralte Höhle betreten'] };
    return null;
  };
  K.busy = () => !!ride || !!K.open;
  K.act = function (n) {
    if (!n) return; const s = S();
    if (n.k === 'rzsky') { const q=n.up?M.skyDeck:M.skyBase; P.x=q.x; P.z=q.z; P.y=n.up?M.skyDeck.y+.35:.2; P.vy=0; P.speed=0; say(n.up?'✨ Der Lichtlift bringt dich zur schwebenden Festung!':'⬇️ Du bist zurück auf der Rätsel-Insel.',3000); return; }
    if (n.k === 'rzchest') chestReward(n.c);
    else if (n.k === 'rzhint') say(n.msg, 4200);
    else if (n.k === 'rzblock') pushBlock();
    else if (n.k === 'rzcrystal') { const f = M.loc(P.x, P.z); const sx = P.x, sz = P.z; arrow = { t: 0, dur: .6, sx, sz, tx: crQ.x, tz: crQ.z }; A.whoosh && A.whoosh(); P.punchT = .4; P.punchHit = true; }
    else if (n.k === 'rzwall') { bomb = { t: 0, which: n.which, x: P.x + Math.sin(P.h) * 1.2, z: P.z + Math.cos(P.h) * 1.2 }; bombM.visible = true; say('💣 Bombe gelegt – Abstand halten!', 1800); note(200, .6, 'sawtooth', .05); }
    else if (n.k === 'rzhook') { const to = n.from === posts[0] ? posts[1] : posts[0]; hook({ x: P.x, z: P.z }, { x: to.x + (to.x - n.from.x) * .12, z: to.z + (to.z - n.from.z) * .12 }); }
    else if (n.k === 'rzaltar') { if (s.puz.block) { say('🔄 Das Block-Rätsel ist gelöst!', 2200); return; } placeBlock(...T.block0); s.blockAt = null; persist(); A.pop && A.pop(); say('🔄 Der Block steht wieder am Anfang.', 2200); }
    else if (n.k === 'rzcap') K.show('cap'); else if (n.k === 'rzforge') K.show('forge');
    else if (n.k === 'rzhoehle') { if (inn && M.hoehleDoor) inn.enter(M.hoehleDoor); else { caveOnce(); G.start && G.start('hoehle_raetsel'); } }
  };
  /* ---------- Bild für Bild ---------- */
  let was = false;
  let inn = null; const caveOnce = () => { const s = S(); if (!s.once.hoehle) { s.once.hoehle = 1; persist(); stars(1); earn('hoehle'); } };
  K.setInnen = i => { inn = i; if (M.hoehleDoor) M.hoehleDoor.onEnter = caveOnce; };
  K.update = function (dt, t) {
    { const k = .5 + .5 * Math.sin((t || 0) * 3.2); plateRing.scale.setScalar(1 + k * .14); plateRing.material.opacity = .55 + k * .4; plateBeam.material.opacity = .14 + k * .12; }
    const raw = Math.min(dt, .25), s = S(), p = s.puz, d0 = Math.hypot(P.x - M.x, P.z - M.z), ins = d0 < M.R + 12, near = d0 < 280;
    refreshCap(); { const forest = W.spots.forest && Math.hypot(P.x - W.spots.forest.x, P.z - W.spots.forest.z) < W.spots.forest.R; if (attachSword()) swG.visible = s.sword > 0 && (onIsle() || forest) && !P.veh; }
    { const lp = M.loc(P.x, P.z), inside = !P.veh && P.y < 4 && lp.a > RI.a0 && lp.a < RI.a1 && lp.b > RI.b0 && lp.b < RI.b1; if (roof.visible === inside) roof.visible = !inside; }
    if (ins !== was) { was = ins; if (ins) { if (!s.once.visit) { s.once.visit = 1; persist(); stars(1); earn('raetsel'); say('🗿 Willkommen auf der Rätsel-Insel der Uralten! +1 ⭐', 4200); } else say('🗿 Rätsel-Insel', 2000); } }
    /* Kapselmonster folgt dir (auch im Fahrzeug) */
    if (s.cap && !s.cap.hid) { const pk = G.petKapsel && G.petKapsel(); if (pk) { const pp = G.petPos(); capPos.x = pp.x; capPos.z = pp.z; capG.visible = false; } else { capG.visible = true; const tx = P.x - Math.sin(P.h) * 1.8 + Math.cos(P.h) * 1.1, tz = P.z - Math.cos(P.h) * 1.8 - Math.sin(P.h) * 1.1, dd = Math.hypot(tx - capPos.x, tz - capPos.z); if (dd > 40) { capPos.x = tx; capPos.z = tz; } else if (dd > .6) { const k = Math.min(1, raw * (dd > 4 ? 5 : 2.4)); capPos.x += (tx - capPos.x) * k; capPos.z += (tz - capPos.z) * k; } const q = W.resolve(capPos.x, capPos.z, .3, {}, undefined, false, true); capPos.x = q.x; capPos.z = q.z;
      capHop = Math.max(0, capHop - raw * 3); const hop = Math.abs(Math.sin(t * (dd > .8 ? 9 : 2.5))) * (dd > .8 ? .25 : .06) + Math.sin(capHop * Math.PI) * .6; capG.position.set(capPos.x, Math.max(W.groundY(capPos.x, capPos.z), 0) + hop + (P.veh ? 1.2 : 0), capPos.z); capG.rotation.y = Math.atan2(P.x - capPos.x, P.z - capPos.z);
      } /* hilft im Verbotenen Wald */ capCd -= raw; const cb = G.combat && G.combat(); if (capCd <= 0 && cb && cb.active() && cb.helper) { const stg = stageOf(s.cap.xp), e = cb.helper(capPos.x, capPos.z, 6 + stg, 5 + stg * 5); if (e) { capCd = 2.4 - stg * .2; capHop = 1; const C = M.CAPS.find(q => q[0] === s.cap.el), col = [[1, .5, .3], [.3, .6, 1], [.4, 1, .6]][M.CAPS.indexOf(C)]; fx.burst(e.x, 1.2, e.z, 12, [col, [1, 1, 1]], 4, 1, 26, 3); A.pop && A.pop(); } else capCd = .5; } }
    if (!near) return;
    /* Block rutscht */
    if (blk.tw) { const w = blk.tw; w.t += raw * 2.2; const u = Math.min(1, w.t), q = L(w.a0 + (w.a1 - w.a0) * u, w.b0 + (w.b1 - w.b0) * u); blk.g.position.set(q.x, 0, q.z); blk.o.x = q.x; blk.o.z = q.z; if (u >= 1) { blk.tw = null; s.blockAt = [blk.a, blk.b]; if (Math.hypot(blk.a - T.plate[0], blk.b - T.plate[1]) < .5) { p.block = 1; apply(); A.fanfare && A.fanfare(); note(262, .6, 'square', .1); say('🟢 Klick! Die Platte ist gedrückt – das Tor öffnet sich!', 3600); stars(1); fx.burst(plateQ.x, .5, plateQ.z, 18, [[.4, 1, .6], [1, 1, 1]], 3, 1, 26, 3); } persist(); } }
    /* Bombe */
    if (bomb) { bomb.t += raw; bombM.position.set(bomb.x, .5 + Math.abs(Math.sin(bomb.t * 6)) * .1, bomb.z); bombM.scale.setScalar(1 + Math.sin(bomb.t * 18) * .06); if (bomb.t > 1.9) { bombM.visible = false; fx.burst(bomb.x, 1, bomb.z, 40, [[1, .7, .2], [1, .3, .1], [.5, .5, .5]], 7, 1.6, 30, 3); A.bigpop && A.bigpop(); const tg = bomb.which === 'wall' ? wlQ : rkQ; if (Math.hypot(bomb.x - tg.x, bomb.z - tg.z) < 5.5) { p[bomb.which] = 1; apply(); stars(1); say(bomb.which === 'wall' ? '💥 Rumms! Die Wand ist weg – dahinter liegt ein Raum!' : '💥 Rumms! Im Fels war eine Höhle mit einer Truhe!', 4200); persist(); } else say('💥 Buuum! Die Bombe lag zu weit weg von der Wand.', 2600); if (Math.hypot(P.x - bomb.x, P.z - bomb.z) < 2.6) { P.x += Math.sin(P.h + Math.PI) * 2; P.z += Math.cos(P.h + Math.PI) * 2; } bomb = null; } }
    /* Pfeil */
    if (arrow) { arrow.t += raw; const u = Math.min(1, arrow.t / arrow.dur), x = arrow.sx + (arrow.tx - arrow.sx) * u, z = arrow.sz + (arrow.tz - arrow.sz) * u, y = 1.4 + 1.8 * u; arrowM.visible = true; arrowM.position.set(x, y, z); arrowM.rotation.set(Math.atan2(-1.8, Math.hypot(arrow.tx - arrow.sx, arrow.tz - arrow.sz)) * .5, Math.atan2(arrow.tx - arrow.sx, arrow.tz - arrow.sz), 0); if (u >= 1) { arrow = null; arrowM.visible = false; if (!p.crystal) { p.crystal = 1; apply(); A.fanfare && A.fanfare(); note(523, .8, 'sine', .12); note(784, .8, 'sine', .1, .15); fx.burst(crQ.x, 3.2, crQ.z, 30, [[.5, .8, 1], [1, 1, 1]], 5, 1.4, 28, 3); say('🔷 Der Kristall leuchtet! Eine Brücke fährt aus und das Tor öffnet sich!', 4200); stars(1); persist(); } } }
    crystal.userData.m.rotation.y = t * (p.crystal ? 2.4 : .8); crystal.userData.m.position.y = 3.2 + Math.sin(t * 2) * .12;
    /* Haken-Fahrt */
    if (ride) { ride.t += raw; const u = Math.min(1, ride.t / ride.dur), g = G.char().group; P.x = ride.fx + (ride.tx - ride.fx) * u; P.z = ride.fz + (ride.tz - ride.fz) * u; P.y = Math.sin(u * Math.PI) * 2.2; P.h = ride.h; P.vy = 0; g.position.set(P.x, P.y, P.z); g.rotation.set(0, P.h, 0); G.char().pose(0, 0, false); G.char().armR.rotation.set(-2.6, 0, 0); if (u >= 1) { ride = null; P.y = W.groundY(P.x, P.z); G.char().armR.rotation.set(0, 0, 0); say('🪝 Geschafft!', 1400); const lp = M.loc(P.x, P.z); if (lp.a > T.pit[1] && !s.once.pit) { s.once.pit = 1; persist(); stars(1); } } }
    /* Prüfungsturm-Wächter-Hinweis */
    if (ins && !s.once.turmhint && nr(SP.rz_turm, 8)) { s.once.turmhint = 1; persist(); say('🏯 Prüfungsturm! In der Vorhalle liegt die erste Truhe. Tipp: Aktionstaste an Truhen, Blöcken, Kristallen und Haken!', 5200); }
  };
  K.log = function () {
    const s = S(), p = s.puz, tl = s.tools, n = (s.once.visit ? 1 : 0) + (tl.bomb ? 1 : 0) + (tl.bow ? 1 : 0) + (p.block ? 1 : 0) + (p.crystal ? 1 : 0) + (tl.hook ? 1 : 0) + (p.tower ? 1 : 0) + (s.cap ? 1 : 0) + (s.cap && stageOf(s.cap.xp) >= 5 ? 1 : 0) + (s.sword > 0 ? 1 : 0) + (s.once.hoehle ? 1 : 0) + (s.chests.filter(i => i[0] === 'v').length >= 6 ? 1 : 0);
    return { title: '🗿 Rätsel-Insel', count: n + ' von 12', rows: [
      { ok: !!s.once.visit, icon: '🗿', text: 'Rätsel-Insel besuchen (Brücke im Süden)', dest: 'raetsel' }, { ok: !!tl.bomb, icon: '💣', text: 'Prüfungsturm: Bomben aus der Truhe der Vorhalle holen', dest: 'turm_r' }, { ok: !!tl.bow, icon: '🏹', text: 'Block auf die Platte schieben → Bogen-Truhe im 1. Raum', dest: 'turm_r' },
      { ok: !!p.block, icon: '🧱', text: 'Block-Rätsel lösen (Block nach oben, dann zur Platte)', dest: 'turm_r' }, { ok: !!p.crystal, icon: '🔷', text: 'Kristall mit einem Pfeil treffen (2. Raum)', dest: 'turm_r' }, { ok: !!tl.hook, icon: '🪝', text: 'Rissige Wand sprengen und den Enterhaken holen', dest: 'turm_r' },
      { ok: !!p.tower, icon: '🏆', text: 'Mit dem Haken über den Abgrund: Schatz des Turms', dest: 'turm_r' }, { ok: !!s.cap, icon: '🥚', text: 'Am Kapsel-Schrein ein Ei wählen', dest: 'schrein_r' }, { ok: !!s.cap && stageOf(s.cap.xp) >= 5, icon: '✨', text: 'Kapselmonster bis Stufe 5 füttern' + (s.cap ? ' (Stufe ' + stageOf(s.cap.xp) + ')' : ''), dest: 'schrein_r' },
      { ok: s.sword > 0, icon: '⚒️', text: 'In der Schmiede das Schwert verbessern', dest: 'schmiede_r' }, { ok: !!s.once.hoehle, icon: '🕳️', text: 'Die Uralte Höhle betreten (Mini-Spiel)', dest: 'hoehle_r' }, { ok: s.chests.filter(i => i[0] === 'v').length >= 6, icon: '🎁', text: 'Alle 6 Schatztruhen im Dorf-Umland finden: ' + s.chests.filter(i => i[0] === 'v').length + ' von 6', dest: 'raetsel' }] };
  };
  K.dbg = { blk, pushBlock, apply, chestReward, CH, posts, crystal, hook, S, feed, forge, stageOf, get ride() { return ride; }, get bomb() { return bomb; }, get arrow() { return arrow; }, capG, get panel() { return panel; } };
  return K;
};
