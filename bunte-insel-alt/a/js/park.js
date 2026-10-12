'use strict';
/* Bunte Insel – Freizeitpark (Erweiterung): eigene Insel im Osten, über eine Brücke erreichbar.
   Riesenrad 🎡, Karussell 🎠, Kettenkarussell, Achterbahn 🎢, Autoscooter, Imbissbuden (Zuckerwatte, Popcorn, Eis) und Besucher.
   Alles sparsam: Boden/Wege/Gerüste in wenigen Sammel-Meshes, nur die drehenden Teile sind eigene Objekte. */
BI.PARK = { x: 285, z: 20, R: 56, bridge: { x0: 168, x1: 232, z0: 15.5, z1: 24.5 }, arena: { x0: 249, x1: 267, z0: -11, z1: 3 } };

/* ---------- Boden, Brücke, Eingang, Wege (statisch, in die Welt-Sammelgeometrie) ---------- */
BI.buildParkGround = function (c) {
  const { W, st, lamp, ROADY, GRASS, SAND } = c, P = BI.PARK, WD = 0x8a5a33, COL = [0xff5a5a, 0xffd23f, 0x4da3ff, 0x4cd07d, 0xb36bff, 0xff8fc8];
  W.park = P; W.spots.park = { x: P.bridge.x1 + 4, z: P.z };
  st.disc(P.x, P.z, P.R + 9, 0, GRASS, 56); st.ring(P.x, P.z, P.R - 5, P.R + 9, .012, SAND, 56);
  /* Brücke (entlang x) */
  { const b = P.bridge, L = b.x1 - b.x0, cx = (b.x0 + b.x1) / 2; st.rect(b.x0, b.z0, b.x1, b.z1, ROADY, 0x9a6b3d); for (let x = b.x0 + 1; x < b.x1; x += 2) st.rect(x, b.z0, x + .08, b.z1, ROADY + .01, 0x7a5230);
    for (let x = b.x0 + 2; x < b.x1; x += 6) st.rect(x, P.z - .12, x + 2.4, P.z + .12, ROADY + .015, 0xfff3c0);
    for (const sd of [-1, 1]) { const z = P.z + sd * 4.6; st.box(cx, 0, z, L, 1.15, .25, 0xc8803c); st.box(cx, 1.15, z, L, .1, .35, 0xe3a45a); W.addBox(b.x0 + 2, sd > 0 ? z - .15 : z - .15, b.x1, sd > 0 ? z + .15 : z + .15, false, 1.3); }
    for (let x = b.x0 + 4; x < b.x1; x += 10) for (const sd of [-1, 1]) st.cyl(x, -1.6, P.z + sd * 3.8, .45, .5, 1.62, 0x6b4a2a, 8); }
  /* Eingangstor mit Regenbogen-Bogen */
  { const gx = P.bridge.x1 + 1.5; for (const sd of [-1, 1]) { st.box(gx, 0, P.z + sd * 6.2, .7, 6.5, .7, 0xffffff); st.sph(gx, 7, P.z + sd * 6.2, 1.1, COL[(sd + 1) ? 1 : 0], 1); }
    for (let i = 0; i < 12; i++) st.box(gx, 6.5 + Math.sin(i / 11 * Math.PI) * 1.2, P.z - 6.2 + i * 1.127, .8, .9, 1.2, COL[i % COL.length]); W.spots.parkGate = { x: gx, y: 8.6, z: P.z }; }
  /* Promenade + Platz + Ring */
  const pave = (x0, z0, x1, z1) => { for (let i = 0; i < Math.floor((x1 - x0) / 3); i++) for (let j = 0; j < Math.floor((z1 - z0) / 2); j++) st.rect(x0 + i * 3, z0 + j * 2, x0 + i * 3 + 3, z0 + j * 2 + 2, ROADY + .01, (i + j) % 2 ? 0xf1e4c8 : 0xe3d0a8); };
  pave(P.bridge.x1, P.z - 4, P.x - 12, P.z + 4);
  st.disc(P.x, P.z, 13, ROADY + .01, 0xf1e4c8, 36); st.ring(P.x, P.z, 9, 13, ROADY + .02, 0xffd23f, 36); st.ring(P.x, P.z, 4.5, 5.2, ROADY + .02, 0xff8fc8, 24);
  /* Wege zu den Attraktionen */
  const way = (x0, z0, x1, z1, w) => { const l = Math.hypot(x1 - x0, z1 - z0); st.strip((x0 + x1) / 2, (z0 + z1) / 2, w, l, Math.atan2(x1 - x0, z1 - z0), ROADY + .012, 0xe3d0a8); };
  way(P.x, P.z, 285, -14, 4); way(P.x, P.z, 252, 48, 4); way(P.x, P.z, 318, 50, 4); way(P.x, P.z, 308, 0, 4); way(P.x, P.z, 258, -4, 3);
  /* Brunnen mit Wasserspiel */
  st.cyl(P.x, 0, P.z, 3.6, 3.9, .7, 0xcfd6e2, 18); st.cyl(P.x, .65, P.z, 3.2, 3.2, .1, 0x57c4ff, 18); st.cyl(P.x, .5, P.z, .5, .7, 3, 0xff8fc8, 8); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; st.sph(P.x + Math.sin(a) * 1.2, 3.4, P.z + Math.cos(a) * 1.2, .35, COL[i], 1); } W.addCircle(P.x, P.z, 3.9, false, 1.4);
  /* Laternen mit Lichterkette */
  for (let a = 0; a < 16; a++) { const an = a / 16 * Math.PI * 2, x = P.x + Math.sin(an) * 15.5, z = P.z + Math.cos(an) * 15.5; st.cyl(x, 0, z, .08, .1, 4.2, 0x555a66, 6); lamp.sph(x, 4.4, z, .34, COL[a % COL.length], 1); }
  for (let x = P.bridge.x1 + 6; x < P.x - 14; x += 9) for (const sd of [-1, 1]) { st.cyl(x, 0, P.z + sd * 5, .08, .1, 4.2, 0x555a66, 6); lamp.sph(x, 4.4, P.z + sd * 5, .34, COL[((x / 9) | 0) % COL.length], 1); }
  /* Bäume, Bänke, Ballons am Rand */
  const crnd = BI.rng(909); for (let i = 0; i < 26; i++) { const an = crnd() * 6.283, d = 40 + crnd() * 10, x = P.x + Math.sin(an) * d, z = P.z + Math.cos(an) * d; if (x < P.bridge.x1 + 4 && Math.abs(z - P.z) < 8) continue; st.cyl(x, 0, z, .2, .3, 2, WD, 6); st.sph(x, 3.2, z, 1.6, [0x4cb85a, 0x5ac966, 0x3fa84e][i % 3], 1, 1, .95, 1); W.addCircle(x, z, .5, false, 3); }
  for (const [x, z, r] of [[270, 14, 0], [296, 26, Math.PI], [270, 26, Math.PI], [296, 14, 0]]) { st.box(x, .4, z, 2, .12, .6, 0xc8803c); st.box(x, .52, z + (r ? .3 : -.3), 2, .5, .12, 0xc8803c); st.box(x - .8, 0, z, .12, .4, .5, 0x555a66); st.box(x + .8, 0, z, .12, .4, .5, 0x555a66); W.addBox(x - 1, z - .3, x + 1, z + .3, false, .8); }
};

/* ---------- Laufzeit: Attraktionen, Imbissbuden, Besucher ---------- */
BI.createPark = function (G) {
  const { scene, W, A, fx, P, say } = G, K = { ride: null }, PK = BI.PARK, TAU = Math.PI * 2, COL = [0xff5a5a, 0xffd23f, 0x4da3ff, 0x4cd07d, 0xb36bff, 0xff8fc8];
  const ch = () => G.char();
  const mat = BI.mat();
  const add = (b, x, y, z) => { const m = b.mesh(mat); m.position.set(x || 0, y || 0, z || 0); m.frustumCulled = true; scene.add(m); return m; };
  const rot = (x, z, a) => [x * Math.cos(a) + z * Math.sin(a), -x * Math.sin(a) + z * Math.cos(a)];
  /* ===== Riesenrad ===== */
  const FW = { x: 285, y: 16, z: -14, R: 13, N: 12, w: .27, a: 0 };
  { const b = new BI.Batch(); for (const sd of [-1, 1]) { b.box(FW.x - 9, 0, FW.z + sd * 2.2, .7, FW.y + .5, .7, 0xffffff, 0, 0, .55); b.box(FW.x + 9, 0, FW.z + sd * 2.2, .7, FW.y + .5, .7, 0xffffff, 0, 0, -.55); } b.box(FW.x - 9.5, 0, FW.z, 19, .5, 6, 0x8a5a33); b.cyl(FW.x, FW.y - .5, FW.z - 1.6, .7, .7, 3.2, 0xe0382b, 10, Math.PI / 2);
    for (let i = 0; i < 5; i++) b.box(FW.x - 4 + i * 2, .5, FW.z + 4.2, 1.6, 1.2, .2, COL[i % COL.length]); /* Bahnsteig-Deko */
    add(b); W.addBox(FW.x - 10, FW.z - 3, FW.x - 8, FW.z + 3, false, 6); W.addBox(FW.x + 8, FW.z - 3, FW.x + 10, FW.z + 3, false, 6); }
  const wheel = (() => { const b = new BI.Batch(), R = FW.R, n = 24; for (const zz of [-1.4, 1.4]) { for (let i = 0; i < n; i++) { const a = i / n * TAU, x = Math.cos(a) * R, y = Math.sin(a) * R; b.box(x, y - .15, zz, 2 * Math.PI * R / n + .1, .3, .35, i % 2 ? 0xffd23f : 0xff5a5a, 0, 0, a + Math.PI / 2); } for (let i = 0; i < FW.N; i++) { const a = i / FW.N * TAU; b.box(Math.cos(a) * R / 2, Math.sin(a) * R / 2 - .1, zz, R, .2, .22, 0xffffff, 0, 0, a); } } for (let i = 0; i < FW.N; i++) { const a = i / FW.N * TAU; b.box(Math.cos(a) * R, Math.sin(a) * R - .1, 0, .2, .2, 2.8, 0xdddddd); } b.cyl(0, -.6, 0, .9, .9, 1.2, 0xe0382b, 10, Math.PI / 2);
    const g = new THREE.Group(); g.add(b.mesh(mat)); g.position.set(FW.x, FW.y, FW.z); scene.add(g); return g; })();
  const gondGeo = (() => { const b = new BI.Batch(); b.box(0, -1.5, 0, 1.7, 1.1, 1.9, 0xffffff); b.box(0, -.4, 0, 1.9, .2, 2.1, 0xe0e0e0); b.cone(0, -.2, 0, 1.3, .7, 0xffffff, 4); b.box(0, -.4, 0, .1, .6, .1, 0x555a66); return b.mesh(mat).geometry; })();
  const gond = new THREE.InstancedMesh(gondGeo, mat, FW.N); gond.frustumCulled = false; gond.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(gond);
  { const cc = new THREE.Color(); for (let i = 0; i < FW.N; i++) gond.setColorAt(i, cc.setHex(COL[i % COL.length])); }
  const gm = new THREE.Matrix4(), gp = new THREE.Vector3(), gq = new THREE.Quaternion(), gs = new THREE.Vector3(1, 1, 1);
  const gondPos = i => { const a = i / FW.N * TAU + FW.a; return { x: FW.x + Math.sin(a) * FW.R, y: FW.y - Math.cos(a) * FW.R, a }; };
  /* ===== Karussell (Pferde) + Kettenkarussell ===== */
  const CA = { x: 252, z: 48, R: 6.2, a: 0, N: 8 }, CK = { x: 318, z: 50, R: 5.4, a: 0, N: 10, h: 9 };
  const carousel = (() => { const b = new BI.Batch(); b.cyl(0, 0, 0, 7.6, 7.6, .5, 0xffd23f, 24); b.cyl(0, .5, 0, 7.2, 7.2, .1, 0xffffff, 24); b.cyl(0, .5, 0, .8, .8, 6.5, 0xff8fc8, 10); b.cone(0, 7.0, 0, 8.4, 2.6, 0xe0382b, 16); b.cyl(0, 6.8, 0, 8.2, 8.2, .3, 0xffffff, 16);
    for (let i = 0; i < CA.N; i++) { const a = i / CA.N * TAU, x = Math.sin(a) * CA.R, z = Math.cos(a) * CA.R; b.cyl(x, .5, z, .07, .07, 5.8, 0xffd23f, 5); const col = COL[i % COL.length]; b.box(x, 1.6, z, .6, .8, 1.5, col, a); b.box(x + Math.sin(a + 1.57) * 0, 2.35, z, .5, .6, .7, shade(col), a); b.box(x, 2.4, z, .35, .7, .45, shade(col), a); }
    const g = new THREE.Group(); g.add(b.mesh(mat)); g.position.set(CA.x, 0, CA.z); scene.add(g); return g; })();
  function shade(c) { const k = .78, f = v => Math.max(0, Math.min(255, Math.round(v * k))); return (f((c >> 16) & 255) << 16) | (f((c >> 8) & 255) << 8) | f(c & 255); }
  { const b = new BI.Batch(); b.cyl(0, 0, 0, 8.4, 8.6, .3, 0x8a5a33, 20); add(b, CA.x, 0, CA.z); W.addCircle(CA.x, CA.z, 8.6, false, .8); }
  const chain = (() => { const b = new BI.Batch(); b.cyl(0, 0, 0, .9, 1.1, CK.h + 1, 0xdddddd, 10); b.cyl(0, CK.h, 0, 5.2, 5.2, .35, 0xe0382b, 20); b.cone(0, CK.h + .35, 0, 5.4, 2.2, 0xffd23f, 16); for (let i = 0; i < CK.N; i++) { const a = i / CK.N * TAU, x = Math.sin(a) * CK.R, z = Math.cos(a) * CK.R; b.cyl(x, 3.0, z, .03, .03, CK.h - 3, 0x555a66, 4); b.box(x, 2.8, z, .9, .12, .9, COL[i % COL.length], a); b.box(x, 2.8, z - Math.cos(a) * .4, .9, .7, .15, COL[i % COL.length], a); }
    const g = new THREE.Group(); g.add(b.mesh(mat)); g.position.set(CK.x, 0, CK.z); scene.add(g); return g; })();
  { const b = new BI.Batch(); b.cyl(0, 0, 0, 7.4, 7.6, .3, 0x8a5a33, 20); add(b, CK.x, 0, CK.z); W.addCircle(CK.x, CK.z, 1.2, false, 6); }
  /* ===== Achterbahn ===== */
  const CC = { x: 308, z: 0, s: .85 };
  const RAW = [[-20, 8, 1.2], [-20, -1, 6], [-20, -14, 15], [-8, -20, 6], [6, -20, 11], [18, -14, 4], [22, -2, 9], [14, 8, 3.5], [2, 12, 8], [-10, 12, 2.5]];
  const PATH = RAW.map(p => [CC.x + p[0] * CC.s, p[2], CC.z + p[1] * CC.s]);
  const catmull = (pts, u) => { const n = pts.length, f = ((u % 1) + 1) % 1 * n, i = Math.floor(f), t = f - i, p0 = pts[(i + n - 1) % n], p1 = pts[i % n], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n]; return [0, 1, 2].map(k => .5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t * t + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t * t * t)); };
  const TR = []; { let acc = 0, prev = catmull(PATH, 0); TR.push({ u: 0, s: 0 }); const M = 240; for (let i = 1; i <= M; i++) { const u = i / M, p = catmull(PATH, u); acc += Math.hypot(p[0] - prev[0], p[1] - prev[1], p[2] - prev[2]); TR.push({ u, s: acc }); prev = p; } }
  const TRL = TR[TR.length - 1].s;
  const uAt = s => { s = ((s % TRL) + TRL) % TRL; let lo = 0, hi = TR.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (TR[m].s <= s) lo = m; else hi = m; } const a = TR[lo], b = TR[hi]; return a.u + (b.u - a.u) * ((s - a.s) / Math.max(1e-6, b.s - a.s)); };
  { const b = new BI.Batch(); let last = null; for (let s = 0; s < TRL; s += 1.1) { const u = uAt(s), p = catmull(PATH, u), q = catmull(PATH, uAt(s + .5)), yaw = Math.atan2(q[0] - p[0], q[2] - p[2]), pitch = -Math.atan2(q[1] - p[1], Math.hypot(q[0] - p[0], q[2] - p[2]));
      for (const sd of [-.6, .6]) { const o = rot(sd, 0, yaw); b.box(p[0] + o[0], p[1] - .1, p[2] + o[1], .12, .12, 1.3, 0xe0382b, yaw, pitch); } if ((s / 1.1 | 0) % 2 === 0) { b.box(p[0], p[1] - .22, p[2], 1.5, .1, .25, 0x8a5a33, yaw, pitch); }
      if (p[1] > 1.8 && (s / 1.1 | 0) % 7 === 0) b.cyl(p[0], 0, p[2], .22, .3, p[1] - .25, 0xdddddd, 6); last = p; }
    add(b); /* Station + Bahnsteig */ const sb = new BI.Batch(); const s0 = PATH[0]; sb.box(s0[0] + 2.4, 0, s0[2] + 0, 2, .5, 8, 0x8a5a33); sb.box(s0[0] + 3.4, 0, s0[2] - 2, .2, 3.4, .2, 0xffffff); sb.box(s0[0] + 3.4, 0, s0[2] + 2, .2, 3.4, .2, 0xffffff); sb.box(s0[0] + 2.4, 3.2, s0[2], 2.6, .3, 8.4, 0xe0382b); add(sb); }
  const cart = (() => { const b = new BI.Batch(); b.box(0, 0, 0, 1.5, .5, 3.0, 0xe0382b); b.box(0, .5, -1.2, 1.5, .8, .3, 0xffd23f); for (const z of [-.7, .7]) b.box(0, .5, z, 1.5, .25, .6, 0xffffff); b.box(0, .5, 1.4, 1.2, .5, .3, 0xff8a1f); const g = new THREE.Group(); g.add(b.mesh(mat)); scene.add(g); return g; })();
  let cartS = 0; const cartOnTrack = s => { const u = uAt(s), p = catmull(PATH, u), q = catmull(PATH, uAt(s + .6)); cart.position.set(p[0], p[1] - .05, p[2]); cart.rotation.set(0, 0, 0); cart.rotation.order = 'YXZ'; cart.rotation.y = Math.atan2(q[0] - p[0], q[2] - p[2]); cart.rotation.x = -Math.atan2(q[1] - p[1], Math.hypot(q[0] - p[0], q[2] - p[2])); return { p, yaw: cart.rotation.y, pitch: cart.rotation.x }; };
  cartOnTrack(0);
  /* ===== Autoscooter-Halle ===== */
  { const a = PK.arena, b = new BI.Batch(), cx = (a.x0 + a.x1) / 2, cz = (a.z0 + a.z1) / 2; b.box(cx, 0, cz, a.x1 - a.x0, .06, a.z1 - a.z0, 0x3a3f4d); for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) if ((i + j) % 2) b.box(a.x0 + 1.5 + i * 3, .06, a.z0 + 1.75 + j * 3.5, 3, .02, 3.5, 0x4a5064);
    const fence = (x0, z0, x1, z1) => { b.box((x0 + x1) / 2, 0, (z0 + z1) / 2, x1 - x0, 1.1, z1 - z0, 0xe0382b); b.box((x0 + x1) / 2, 1.1, (z0 + z1) / 2, x1 - x0, .15, z1 - z0, 0xffffff); W.addBox(x0, z0, x1, z1, false, 1.4); };
    fence(a.x0 - .4, a.z0 - .4, a.x1 + .4, a.z0); fence(a.x0 - .4, a.z1, a.x1 + .4, a.z1 + .4); fence(a.x0 - .4, a.z0, a.x0, a.z1); fence(a.x1, a.z0, a.x1 + .4, a.z1 - 4); /* Tor an der Ostseite offen (z1-4..z1 zu) */
    for (const [x, z] of [[a.x0, a.z0], [a.x1, a.z0], [a.x0, a.z1], [a.x1, a.z1]]) b.cyl(x, 0, z, .2, .2, 5, 0xdddddd, 6); b.box(cx, 5, cz, a.x1 - a.x0, .25, a.z1 - a.z0, 0x4da3ff, 0, 0, 0); for (let i = 0; i < 10; i++) b.box(a.x0 + i * 1.9, 5.25, cz, .3, .5, a.z1 - a.z0, COL[i % COL.length]);
    add(b); K.arenaCenter = { x: cx, z: cz }; }
  /* ===== Imbissbuden ===== */
  const STANDS = [{ k: 'cotton', x: 246, z: 11.5, icon: '🍥', name: 'Zuckerwatte', c: 0xff8fc8 }, { k: 'popcorn', x: 262, z: 29, icon: '🍿', name: 'Popcorn', c: 0xffd23f }, { k: 'icecream', x: 274, z: 11.5, icon: '🍦', name: 'Eis', c: 0x4da3ff }];
  for (const s of STANDS) { const b = new BI.Batch(); b.box(0, 0, 0, 3.2, 1.1, 2.2, 0xfff0c0); for (let i = 0; i < 8; i++) b.box(-1.4 + i * .4, 2.3, 0, .4, .12, 2.8, i % 2 ? 0xffffff : s.c, 0, .35); b.box(-1.5, 0, -1, .12, 2.4, .12, 0xdddddd); b.box(1.5, 0, -1, .12, 2.4, .12, 0xdddddd); b.sph(0, 2.9, 0, .5, s.c, 1); add(b, s.x, 0, s.z); W.addBox(s.x - 1.7, s.z - 1.2, s.x + 1.7, s.z + 1.2, false, 3); s.front = { x: s.x, z: s.z + (s.z < PK.z ? 2.6 : -2.6) }; }
  /* Schilder */
  const sign = (txt, x, y, z, w) => { const cv = document.createElement('canvas'); cv.width = 512; cv.height = 96; const c = cv.getContext('2d'); let f = 56; c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; const mw = c.measureText(txt).width; if (mw > 480) { f = Math.floor(f * 480 / mw); c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; } c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 10; c.strokeStyle = '#16335e'; c.strokeText(txt, 256, 50); c.fillStyle = '#fff'; c.fillText(txt, 256, 50); const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false })); sp.scale.set(w, w * 96 / 512, 1); sp.position.set(x, y, z); scene.add(sp); };
  { const g = W.spots.parkGate; if (g) sign('🎡 Willkommen im Freizeitpark!', g.x - .5, g.y + 1.2, g.z, 9); }
  sign('🎡 Riesenrad', FW.x, FW.y + FW.R + 3, FW.z, 6); sign('🎠 Karussell', CA.x, 10.4, CA.z, 5); sign('🎢 Achterbahn', CC.x, 20, CC.z - 14, 6); sign('🚗 Autoscooter', (PK.arena.x0 + PK.arena.x1) / 2, 7, (PK.arena.z0 + PK.arena.z1) / 2, 5); sign('🪢 Kettenkarussell', CK.x, CK.h + 4.2, CK.z, 6);
  for (const s of STANDS) sign(s.icon + ' ' + s.name, s.x, 4.1, s.z, 4);
  /* ===== Interaktion ===== */
  const d2 = (x, z) => Math.hypot(P.x - x, P.z - z);
  K.near = function () {
    if (P.veh || K.ride || P.y > 1.5) return null; if (Math.hypot(P.x - PK.x, P.z - PK.z) > PK.R + 4) return null;
    if (d2(FW.x, FW.z + 4.6) < 2.6) return { k: 'ferris' };
    if (d2(CA.x, CA.z) < 8.8 + 1.2 && d2(CA.x, CA.z) > 8.6) return { k: 'carousel' };
    if (d2(CK.x, CK.z) < 7.6 + 1.2 && d2(CK.x, CK.z) > 7.4) return { k: 'chain' };
    { const s0 = PATH[0]; if (d2(s0[0] + 3.4, s0[2]) < 3.2) return { k: 'coaster' }; }
    for (const s of STANDS) if (d2(s.front.x, s.front.z) < 2.4) return { k: s.k, s };
    return null;
  };
  K.busy = () => !!K.ride;
  const cd = {}; const ready = (k, ms) => { const n = performance.now(); if (n - (cd[k] == null ? -1e9 : cd[k]) < ms) return false; cd[k] = n; return true; };
  const start = (o) => { K.ride = Object.assign({ t: 0 }, o); A.pop && A.pop(); G.earn('play'); G.earn('park'); };
  K.act = function (n) {
    if (!n) return;
    if (n.k === 'stop') { if (K.ride && K.ride.canStop) end(true); else say('Bitte noch sitzen bleiben 😊 – gleich ist die Fahrt vorbei', 1800); return; }
    if (n.k === 'ferris') { let bi = 0, ba = 1e9; for (let i = 0; i < FW.N; i++) { const g = gondPos(i), d = Math.abs(((g.a % TAU) + TAU) % TAU - 0), dd = Math.min(d, TAU - d); if (dd < ba) { ba = dd; bi = i; } } start({ kind: 'ferris', i: bi, dur: TAU / FW.w + 1, exit: [FW.x, FW.z + 4.6] }); say('🎡 Das Riesenrad dreht sich – genieße die Aussicht!', 3000); }
    else if (n.k === 'carousel') { let bi = 0, ba = 1e9; for (let i = 0; i < CA.N; i++) { const a = i / CA.N * TAU + CA.a, d = Math.hypot(P.x - (CA.x + Math.sin(a) * CA.R), P.z - (CA.z + Math.cos(a) * CA.R)); if (d < ba) { ba = d; bi = i; } } start({ kind: 'carousel', i: bi, dur: 26, canStop: true, exit: [CA.x + 9.8 * Math.sin(P.h + Math.PI), CA.z + 9.8 * Math.cos(P.h + Math.PI)] }); A.melody && A.melody(); say('🎠 Hüh! Das Karussell fährt los – mit 🚪 absteigen', 3000); }
    else if (n.k === 'chain') { start({ kind: 'chain', i: ((Math.random() * CK.N) | 0), dur: 24, canStop: true, exit: [CK.x + 8.6 * Math.sin(P.h + Math.PI), CK.z + 8.6 * Math.cos(P.h + Math.PI)] }); A.whoosh && A.whoosh(); say('🪢 Festhalten! Das Kettenkarussell schwingt hinaus …', 3000); }
    else if (n.k === 'coaster') { start({ kind: 'coaster', s: 0, laps: 2, dur: 90, exit: [PATH[0][0] + 5.2, PATH[0][2]] }); A.whoosh && A.whoosh(); say('🎢 Achterbahn! Hände hoch! 🙌', 3000); }
    else if (n.s) {
      const s = n.s; if (save().stars < 1) { say('Dafür brauchst du 1 ⭐', 1600); return; } if (!ready('st' + s.k, 700)) return; G.takeStar(1); const iv = G.inv(), key = s.k === 'cotton' ? 'cotton' : s.k; iv[key] = (iv[key] || 0) + 1; A.buy && A.buy(); fx.burst(s.x, 2.4, s.z, 12, [BI.C.pink, BI.C.gold, BI.C.white], 3, 1, 26, 3); say(s.icon + ' ' + s.name + ' gekauft – liegt im Rucksack 🎒 (dort kannst du es essen 😋)', 3000);
    }
  };
  const save = () => G.save;
  function end(manual) {
    const r = K.ride; if (!r) return; K.ride = null; const g = ch().group, c = ch(); g.rotation.set(0, P.h, 0); c.armL.rotation.set(0, 0, 0); c.armR.rotation.set(0, 0, 0); c.legL.rotation.x = c.legR.rotation.x = 0;
    const q = W.resolve(r.exit[0], r.exit[1], .5, {}); P.x = q.x; P.z = q.z; P.y = W.groundY(P.x, P.z); P.vy = 0; g.position.set(P.x, P.y, P.z);
    if (!manual && ready('star' + r.kind, 45000)) { G.addStars(1); say('⭐ Tolle Fahrt! +1 ⭐', 1800); A.star && A.star(); } else if (!manual) say('😄 Das war toll! Nochmal?', 1600);
    fx.burst(P.x, 1.2, P.z, 8, [BI.C.gold, BI.C.white], 3, .8, 26, 3);
  }
  K.stop = () => { if (K.ride && K.ride.canStop) end(true); else if (K.ride) say('Bitte noch sitzen bleiben 😊 – gleich ist die Fahrt vorbei', 1800); };
  /* ---------- Bewegung ---------- */
  K.update = function (dt, t) {
    FW.a += FW.w * dt; wheel.rotation.z = FW.a;
    for (let i = 0; i < FW.N; i++) { const g = gondPos(i); gp.set(g.x, g.y, FW.z); gm.compose(gp, gq, gs); gond.setMatrixAt(i, gm); } gond.instanceMatrix.needsUpdate = true;
    const near = Math.hypot(P.x - PK.x, P.z - PK.z) < PK.R + 30 || K.ride;
    if (near) { CA.a += dt * .8; carousel.rotation.y = CA.a; CK.a += dt * (.9 + .4 * Math.min(1, ((K.ride && K.ride.kind === 'chain') ? K.ride.t : 0) / 4)); chain.rotation.y = CK.a; }
    const r = K.ride; if (!r) { if (near) { cartS += dt * 5; cartOnTrack(cartS); } return; }
    r.t += dt; const g = ch().group, c = ch();
    if (r.kind === 'ferris') {
      const gp_ = gondPos(r.i); P.x = gp_.x; P.z = FW.z; P.y = gp_.y - 1.55; g.position.set(P.x, P.y + .35, P.z); g.rotation.set(0, Math.PI, 0); c.sit(); c.armL.rotation.set(-.7, 0, .3); c.armR.rotation.set(-.7, 0, -.3);
      if (r.t >= r.dur) end(false);
    } else if (r.kind === 'carousel') {
      const a = r.i / CA.N * TAU + CA.a; P.x = CA.x + Math.sin(a) * CA.R; P.z = CA.z + Math.cos(a) * CA.R; P.y = 1.45 + Math.sin(t * 3 + r.i) * .35; g.position.set(P.x, P.y, P.z); g.rotation.set(0, a + Math.PI / 2, 0); c.sit(); c.armL.rotation.set(-1.3, 0, .15); c.armR.rotation.set(-1.3, 0, -.15);
      if (r.t >= r.dur) end(false);
    } else if (r.kind === 'chain') {
      const a = r.i / CK.N * TAU + CK.a, sw = .75 * Math.min(1, r.t / 4), R = CK.R + (CK.h - 3) * Math.sin(sw) * .55, y = 2.8 + (CK.h - 3) * (1 - Math.cos(sw)) * 1.2;
      P.x = CK.x + Math.sin(a) * R; P.z = CK.z + Math.cos(a) * R; P.y = y; g.position.set(P.x, P.y, P.z); g.rotation.set(0, a + Math.PI / 2, 0); c.sit(); c.armL.rotation.set(-1.2, 0, .3); c.armR.rotation.set(-1.2, 0, -.3);
      if (r.t >= r.dur) end(false);
    } else if (r.kind === 'coaster') {
      const u0 = uAt(r.s), p0 = catmull(PATH, u0), slope = Math.max(-1, Math.min(1, (catmull(PATH, uAt(r.s + .6))[1] - p0[1]) / .6));
      const v = r.t < 3 ? 3 + r.t * 2.5 : Math.max(5.5, 7.5 + (15 - p0[1]) * .95 - slope * 0 + 2); r.s += v * dt; const tr = cartOnTrack(r.s);
      P.x = tr.p[0]; P.z = tr.p[2]; P.y = tr.p[1] + .2; g.position.set(P.x, P.y, P.z); g.rotation.order = 'YXZ'; g.rotation.set(tr.pitch, tr.yaw, 0); c.sit(); c.armL.rotation.set(-2.9 + Math.sin(t * 6) * .15, 0, .35); c.armR.rotation.set(-2.9 - Math.sin(t * 6) * .15, 0, -.35);
      if (Math.random() < dt * 14) fx.emit(tr.p[0], tr.p[1] - .2, tr.p[2], (Math.random() - .5) * 2, .5, (Math.random() - .5) * 2, .5, 22, 1, .85, .4, 0, .9);
      if (r.s >= TRL * r.laps || r.t > r.dur) { g.rotation.order = 'XYZ'; end(false); }
    }
  };
  /* ---------- Besucher (feste Gesprächspartner) ---------- */
  K.people = function (folk) {
    const T = BI.TALK, mk = (x, z, look, name, lines, h) => { const cc = BI.makeChar(look); cc.group.position.set(x, 0, z); cc.group.rotation.y = h; scene.add(cc.group); const n = { c: cc, x, z, h, h0: h, p: { name, lines, i: 0 }, wait: 0, hop: 0, kid: !!look.scale && look.scale < .8, fixed: true }; folk.push(n); return n; };
    const pr = [
      ['Clown Pippo', 0xff5a5a, 'party', ['Hihi! Ich habe heute schon 100 Luftballons aufgepustet! 🎈', 'Warum können Clowns so gut Fahrrad fahren? Weil sie Übung haben! 🤡', 'Probier das Riesenrad – oben sieht man die ganze Insel!']],
      ['Kartenfrau Kim', 0x4da3ff, 'cap', ['Im Park ist alles gratis, nur Naschen kostet einen Stern! 🍬', 'Die Achterbahn fährt zwei Runden – festhalten!', 'Am Karussell kannst du jederzeit mit 🚪 absteigen.']],
      ['Zuckerwatte-Zoe', 0xff8fc8, 'none', ['Zuckerwatte ist nur gesponnener Zucker – und ganz viel Glück! 🍥', 'Iss sie schnell, sonst klebt sie an den Fingern.', 'Im Rucksack 🎒 kannst du deine Naschereien essen.']],
      ['Karussell-Karl', 0xffd23f, 'none', ['Such dir das schönste Pferd aus! 🐴', 'Ich fahre seit 30 Jahren im Kreis – und mir wird nie schwindelig.', 'Hüh hüh!']],
      ['Bahn-Berta', 0xe0382b, 'cap', ['Hände hoch beim Looping! 🙌', 'Die Achterbahn ist 120 Meter lang.', 'Wer schreit, fährt schneller. Stimmt gar nicht, aber es macht Spaß!']],
      ['Autoscooter-Anton', 0x4cd07d, 'cap', ['Fahr zu den Autoscootern – Rempeln erlaubt! 🚗', 'Ganz sanft anstoßen, dann lacht jeder.', 'Mit dem Joystick lenkst du, mit B gibst du Gas.']],
      ['Zauberer Zarino', 0xb36bff, 'wizard', ['Abrakadabra – ein Stern hinter deinem Ohr! ✨', 'Zaubern ist 90 Prozent Übung.', 'Im Park gibt es abends bunte Lichter, schau mal!']]
    ];
    const pts = [[243, 17], [250, 24], [262, 15], [270, 24], [282, 9], [296, 20], [290, 32]];
    pr.forEach((p, i) => mk(pts[i][0], pts[i][1], { shirt: p[1], pants: 0x3d4a7a, hair: 0x6b4423, skin: 0xffd2a8, hat: p[2], scale: .96 }, p[0], p[3], i % 2 ? Math.PI / 2 : -Math.PI / 2));
    const kids = [['Mia', ['Ich war schon dreimal im Riesenrad! 🎡', 'Mir ist ein bisschen schwindelig, aber lustig!', 'Hast du Zuckerwatte probiert?']], ['Lukas', ['Die Achterbahn war mega! 🎢', 'Ich will gleich nochmal!', 'Wer rempelt, gewinnt im Autoscooter!']], ['Emma', ['Ich habe einen Luftballon bekommen! 🎈', 'Das Karussell ist mein Lieblingsplatz.', 'Magst du Popcorn?']], ['Tim', ['Ich bin zu klein für die ganz große Bahn – sagt Mama. 😅', 'Hihi, die Kette schwingt weit raus!', 'Komm, wir fahren zusammen!']]];
    const kp = [[275, 18], [258, 20], [292, 26], [268, 31]];
    kids.forEach((k, i) => mk(kp[i][0], kp[i][1], { shirt: COL[i], pants: 0x5a3d2b, hair: 0xd9a441, skin: 0xf3c9a0, hat: 'party', scale: .62 }, k[0], k[1], i * 1.3));
  };
  K.stands = STANDS; K.FW = FW; K.PATH = PATH; K.lap = TRL; K.arena = PK.arena;
  return K;
};
