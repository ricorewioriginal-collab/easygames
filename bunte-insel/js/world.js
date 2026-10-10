'use strict';
/* Bunte Insel – die Welt: Boden, Straßen, Schienen, Gebäude, Bäume, Strand, Farm, Spielplatz.
   Alles Statische steckt in EINEM Mesh (Vertexfarben), dazu je ein kleines Mesh für Fenster und Laternen (Tag/Nacht). */
BI.WORLD = { R: 190, LIMIT: 178, AX: 140, AZ: 118, CR: 40, ROAD: 9, RA: 55, RB: 105, RR: 12 };

BI.buildWorld = function (scene) {
  const K = BI.WORLD, rnd = BI.rng(20240611), rr = (a, b) => a + rnd() * (b - a), pick = a => a[(rnd() * a.length) | 0];
  const st = new BI.Batch(), win = new BI.Batch(), lamp = new BI.Batch();
  const W = { K, boxes: [], circles: [], vehicleSpawns: [], roadPts: [], houses: [], parts: [] };

  /* ---------- Kollision (Raster) ---------- */
  const CELL = 12, grid = new Map(), cellKey = (ix, iz) => (ix + 40) * 100 + (iz + 40);
  function put(it, x0, z0, x1, z1) {
    for (let ix = Math.floor(x0 / CELL); ix <= Math.floor(x1 / CELL); ix++) for (let iz = Math.floor(z0 / CELL); iz <= Math.floor(z1 / CELL); iz++) {
      const k = cellKey(ix, iz); let a = grid.get(k); if (!a) grid.set(k, a = []); a.push(it);
    }
  }
  W.addCircle = (x, z, r) => { const it = { c: 1, x, z, r }; W.circles.push(it); put(it, x - r, z - r, x + r, z + r); return it; };
  W.addBox = (x0, z0, x1, z1) => { const it = { c: 0, x0, z0, x1, z1 }; W.boxes.push(it); put(it, x0, z0, x1, z1); return it; };
  const seen = new Set();
  /* schiebt einen Kreis (px,pz,r) aus allen Hindernissen; liefert Verschiebung zurück */
  W.resolve = function (px, pz, r, out) {
    out = out || {}; let hit = false;
    for (let pass = 0; pass < 2; pass++) {
      seen.clear();
      for (let ix = Math.floor((px - r) / CELL); ix <= Math.floor((px + r) / CELL); ix++) for (let iz = Math.floor((pz - r) / CELL); iz <= Math.floor((pz + r) / CELL); iz++) {
        const a = grid.get(cellKey(ix, iz)); if (!a) continue;
        for (let i = 0; i < a.length; i++) {
          const it = a[i]; if (seen.has(it)) continue; seen.add(it);
          if (it.c) {
            const dx = px - it.x, dz = pz - it.z, d = Math.hypot(dx, dz), m = r + it.r;
            if (d < m) { const k = d > 1e-6 ? (m - d) / d : 0; if (d > 1e-6) { px += dx * k; pz += dz * k; } else px += m; hit = true; }
          } else {
            const cx = BI.clamp(px, it.x0, it.x1), cz = BI.clamp(pz, it.z0, it.z1), dx = px - cx, dz = pz - cz, d2 = dx * dx + dz * dz;
            if (d2 > 1e-9) { if (d2 < r * r) { const d = Math.sqrt(d2), k = (r - d) / d; px += dx * k; pz += dz * k; hit = true; } }
            else { // Mittelpunkt im Kasten: kürzeste Seite hinaus
              const l = px - it.x0, rg = it.x1 - px, t = pz - it.z0, b = it.z1 - pz, m = Math.min(l, rg, t, b);
              if (m === l) px = it.x0 - r; else if (m === rg) px = it.x1 + r; else if (m === t) pz = it.z0 - r; else pz = it.z1 + r; hit = true;
            }
          }
        }
      }
    }
    const rad = Math.hypot(px, pz);
    if (rad > K.LIMIT - r) { const k = (K.LIMIT - r) / rad; px *= k; pz *= k; hit = true; }
    out.x = px; out.z = pz; out.hit = hit; return out;
  };
  const _o = {};
  W.free = (x, z, r) => { const p = W.resolve(x, z, r, _o); return !p.hit; };

  /* ---------- Straßen-/Schienen-Geometrie ---------- */
  const RW = K.ROAD / 2;
  W.onRoad = function (x, z) {
    const ax = Math.abs(x), az = Math.abs(z), r = Math.hypot(x, z);
    if (r < 156 && r > 12 && (ax < RW || az < RW)) return true;
    return Math.abs(r - K.RA) < RW || Math.abs(r - K.RB) < RW || Math.abs(r - K.RR) < RW || W.onPad(x, z);
  };
  W.pads = [];
  W.onPad = (x, z) => W.pads.some(p => x > p[0] && x < p[2] && z > p[1] && z < p[3]);
  W.railSdf = function (x, z) { // Abstand zur Schienenmitte (rundes Rechteck)
    const qx = Math.abs(x) - (K.AX - K.CR), qz = Math.abs(z) - (K.AZ - K.CR);
    return Math.abs(Math.hypot(Math.max(qx, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qz), 0) - K.CR);
  };
  const LAKE = { x: 112, z: 75, r: 14 };
  W.lake = LAKE;
  function nearRoad(x, z, pad) {
    const ax = Math.abs(x), az = Math.abs(z), r = Math.hypot(x, z), h = RW + pad;
    if (r < 160 && (ax < h || az < h)) return true;
    return Math.abs(r - K.RA) < h || Math.abs(r - K.RB) < h || r < K.RR + RW + pad || W.pads.some(p => x > p[0] - pad && x < p[2] + pad && z > p[1] - pad && z < p[3] + pad);
  }
  function blockedAt(x, z, pad) {
    if (nearRoad(x, z, pad)) return true;
    if (W.railSdf(x, z) < 5 + pad) return true;
    if (Math.hypot(x - LAKE.x, z - LAKE.z) < LAKE.r + 3 + pad) return true;
    for (const b of W.boxes) if (x > b.x0 - pad && x < b.x1 + pad && z > b.z0 - pad && z < b.z1 + pad) return true;
    for (const c of W.circles) if (Math.hypot(x - c.x, z - c.z) < c.r + pad) return true;
    return false;
  }
  W.blockedAt = blockedAt;

  /* Schienentabelle (gleichmäßig 1 m) */
  (function () {
    const pts = [], { AX, AZ, CR } = K, push = (x, z) => pts.push([x, z]);
    const line = (x0, z0, x1, z1) => { const n = Math.ceil(Math.hypot(x1 - x0, z1 - z0) * 2); for (let i = 0; i < n; i++) push(x0 + (x1 - x0) * i / n, z0 + (z1 - z0) * i / n); };
    const arc = (cx, cz, f) => { const n = Math.ceil(CR * Math.PI / 2 * 2); for (let i = 0; i < n; i++) { const t = Math.PI / 2 * i / n, p = f(t); push(cx + p[0] * CR, cz + p[1] * CR); } };
    line(-(AX - CR), -AZ, AX - CR, -AZ);
    arc(AX - CR, -(AZ - CR), t => [Math.sin(t), -Math.cos(t)]);
    line(AX, -(AZ - CR), AX, AZ - CR);
    arc(AX - CR, AZ - CR, t => [Math.cos(t), Math.sin(t)]);
    line(AX - CR, AZ, -(AX - CR), AZ);
    arc(-(AX - CR), AZ - CR, t => [-Math.sin(t), Math.cos(t)]);
    line(-AX, AZ - CR, -AX, -(AZ - CR));
    arc(-(AX - CR), -(AZ - CR), t => [-Math.cos(t), -Math.sin(t)]);
    const cum = [0]; for (let i = 1; i <= pts.length; i++) { const a = pts[i - 1], b = pts[i % pts.length]; cum.push(cum[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1])); }
    const L = cum[pts.length], N = Math.round(L), ds = L / N, X = new Float32Array(N), Z = new Float32Array(N);
    let j = 0;
    for (let i = 0; i < N; i++) {
      const s = i * ds; while (cum[j + 1] < s) j++;
      const a = pts[j], b = pts[(j + 1) % pts.length], t = (s - cum[j]) / ((cum[j + 1] - cum[j]) || 1);
      X[i] = a[0] + (b[0] - a[0]) * t; Z[i] = a[1] + (b[1] - a[1]) * t;
    }
    W.track = { L, N, ds, X, Z };
  })();
  const _tr = { x: 0, z: 0, h: 0 };
  W.trackAt = function (s, out) {
    out = out || _tr; const T = W.track; s = ((s % T.L) + T.L) % T.L; const f = s / T.ds, i = Math.floor(f) % T.N, j = (i + 1) % T.N, t = f - Math.floor(f);
    out.x = T.X[i] + (T.X[j] - T.X[i]) * t; out.z = T.Z[i] + (T.Z[j] - T.Z[i]) * t; out.h = Math.atan2(T.X[j] - T.X[i], T.Z[j] - T.Z[i]); return out;
  };
  W.STATION_S = 176; // Lok-Front steht bei x=76 am Bahnsteig

  /* ---------- Boden ---------- */
  const GRASS = 0x86d36a, SAND = 0xf3dfa2, ASPH = 0x59606c, STONE = 0xd9d3c4;
  st.disc(0, 0, K.R + 12, 0, GRASS, 72);
  st.ring(0, 0, 165, K.R + 12, .012, SAND, 72);
  for (let i = 0, tries = 0; i < 46 && tries < 400; tries++) { // Wiesenflecken
    const a = rnd() * BI.TAU, d = Math.sqrt(rnd()) * 155, x = Math.sin(a) * d, z = Math.cos(a) * d, r = rr(6, 16);
    if (nearRoad(x, z, r) || W.railSdf(x, z) < r + 5) continue; i++;
    st.disc(x, z, r, .02, pick([0x78c85e, 0x93da74, 0x6fbf58, 0x9be07c]), 14);
  }
  // See
  st.disc(LAKE.x, LAKE.z, LAKE.r + 1.6, .03, SAND, 20); st.disc(LAKE.x, LAKE.z, LAKE.r, .045, 0x4db6f0, 24);
  W.addCircle(LAKE.x, LAKE.z, LAKE.r - 1);
  for (let i = 0; i < 9; i++) { const a = i * .7, d = LAKE.r + 2.5; st.cyl(LAKE.x + Math.sin(a) * d, 0, LAKE.z + Math.cos(a) * d, .08, .08, 1.4 + rnd(), 0x5a8f3c, 5); st.cyl(LAKE.x + Math.sin(a) * d, 1.4, LAKE.z + Math.cos(a) * d, .16, .16, .5, 0x8a5a33, 5); }

  /* ---------- Straßen ---------- */
  const ROADY = .06;
  // Kreisverkehr, Ringe
  st.ring(0, 0, K.RR - RW, K.RR + RW, ROADY, ASPH, 40);
  st.ring(0, 0, K.RA - RW, K.RA + RW, ROADY, ASPH, 72);
  st.ring(0, 0, K.RB - RW, K.RB + RW, ROADY, ASPH, 96);
  st.disc(0, 0, K.RR - RW, .04, 0x9be07c, 20);
  // Arme
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const x0 = dx * 14, z0 = dz * 14, x1 = dx * 156, z1 = dz * 156;
    st.rect(Math.min(x0, x1) - (dz ? RW : 0), Math.min(z0, z1) - (dx ? RW : 0), Math.max(x0, x1) + (dz ? RW : 0), Math.max(z0, z1) + (dx ? RW : 0), ROADY, ASPH);
    // Mittelstreifen
    for (let d = 20; d < 152; d += 7) {
      const r = d + 1.5; if (Math.abs(r - K.RA) < RW + 1 || Math.abs(r - K.RB) < RW + 1) continue;
      st.strip(dx * (d + 1.5), dz * (d + 1.5), .3, 3.2, Math.atan2(dx, dz), ROADY + .02, 0xf4f1d0);
    }
    // Zebrastreifen am Kreisverkehr + Ringen
    for (const d of [20, K.RA - RW - 3, K.RA + RW + 3]) for (let k = -3; k <= 3; k++) {
      const px = dx * d + (dz ? k * 1.1 : 0), pz = dz * d + (dx ? k * 1.1 : 0);
      st.strip(px, pz, .55, 2.2, Math.atan2(dx, dz), ROADY + .025, 0xffffff);
    }
  }
  for (const R0 of [K.RA, K.RB]) for (let i = 0; i < R0 * .75; i++) { // gestrichelte Ringe
    const a = i / (R0 * .75) * BI.TAU; if (i % 2) continue;
    const x = Math.sin(a) * R0, z = Math.cos(a) * R0; // Tangente
    st.strip(x, z, .3, 3.0, a + Math.PI / 2, ROADY + .02, 0xf4f1d0);
  }
  // Plätze vor Wache/Krankenhaus/Feuerwehr
  const pad = (x0, z0, x1, z1, c) => { W.pads.push([x0, z0, x1, z1]); st.rect(x0, z0, x1, z1, ROADY, c || 0x6a717c); for (let k = 0; k < 4; k++) st.strip((x0 + x1) / 2 - 7.5 + k * 5, (z0 + z1) / 2, .25, (z1 - z0) - 2, 0, ROADY + .02, 0xffffff); };

  /* ---------- Gebäude ---------- */
  const WALLS = [0xffe9a8, 0xffc4b8, 0xbfe3ff, 0xd9f0b8, 0xf6d1ff, 0xffd9a0, 0xc9f3e8], ROOFS = [0xd9534f, 0x3f7fd9, 0x8a5a44, 0xe8883a, 0x5f9d5a];
  function windows(cx, cz, w, d, y0, floors, fh, skipDoor) {
    const nx = Math.max(1, Math.floor(w / 3.2)), nz = Math.max(1, Math.floor(d / 3.2));
    for (let f = 0; f < floors; f++) {
      const y = y0 + f * fh + fh * .3;
      for (let i = 0; i < nx; i++) { const x = cx - w / 2 + (i + .5) * w / nx; for (const s of [-1, 1]) { if (skipDoor === s && f === 0 && Math.abs(x - cx) < 1.6) continue; win.box(x, y, cz + s * (d / 2 + .02), 1.1, fh * .45, .08, 0xffffff); } }
      for (let i = 0; i < nz; i++) { const z = cz - d / 2 + (i + .5) * d / nz; for (const s of [-1, 1]) win.box(cx + s * (w / 2 + .02), y, z, .08, fh * .45, 1.1, 0xffffff); }
    }
  }
  function box(cx, cz, w, d, h, color, y0 = 0) { st.box(cx, y0, cz, w, h, d, color); }
  function solid(cx, cz, w, d) { W.addBox(cx - w / 2, cz - d / 2, cx + w / 2, cz + d / 2); }
  function house(cx, cz, w, d, h, wall, roof, doorSide, ridgeX) {
    box(cx, cz, w, d, h, wall);
    const rh = Math.min(w, d) * .45;
    if (ridgeX) st.prism(cx, h, cz, d + 1.4, rh, w + 1.4, roof, Math.PI / 2); else st.prism(cx, h, cz, w + 1.4, rh, d + 1.4, roof, 0);
    st.box(cx + w * .25, h + rh * .3, cz + d * .2, .9, rh + .6, .9, 0x9a5a48);
    windows(cx, cz, w, d, 1.4, h > 5.5 ? 2 : 1, h > 5.5 ? 2.8 : 3.4, doorSide);
    if (doorSide) { st.box(cx, 0, cz + doorSide * (d / 2 + .05), 1.3, 2.3, .12, 0x8a5a33); st.box(cx, 0, cz + doorSide * (d / 2 + 1.2), 2.2, .12, 1.6, 0xcfc7b8); }
    solid(cx, cz, w, d);
    W.houses.push({ x: cx, z: cz, w, d });
  }
  function houseOnX(cx, cz, side) { // Tür zeigt zur Straße (z=0)
    const w = rr(8, 10), d = rr(7.5, 9), h = rr(4.6, 6.4), wall = pick(WALLS), roof = pick(ROOFS);
    const dz = -Math.sign(cz); // nach Norden/Süden
    house(cx, cz, w, d, h, wall, roof, dz, true);
  }
  function houseOnZ(cx, cz) { // Tür-Seite entlang z gebaut -> für Wohnhäuser an N/S-Straße Tür zur Nord-Süd-Straße: wir drehen Maße
    const w = rr(7.5, 9), d = rr(8, 10), h = rr(4.6, 6.4), wall = pick(WALLS), roof = pick(ROOFS);
    // Tür-Seite zeigt zur Straße in x; unsere Tür sitzt auf der z-Seite -> Haus quer: Tür nach +z, ok für Optik
    house(cx, cz, w, d, h, wall, roof, 1, false);
  }

  // --- Spezialgebäude ---
  W.spots = {};
  { // Krankenhaus (NE)
    const cx = 56, cz = -56, w = 26, d = 18, h = 9;
    box(cx, cz, w, d, h, 0xf6f8fc); box(cx, cz, 10, d + 2, h + 3.5, 0xeaf0f8); box(cx, cz, w + .6, d + .6, .6, 0x4da3ff, h);
    st.box(cx, h + 3.5, cz, 10.4, .6, d + 2.4, 0x4da3ff);
    windows(cx, cz, w, d, 1.6, 2, 3.6, 1); windows(cx, cz, 10, d + 2, h + .4, 1, 3.4);
    st.box(cx, 0, cz + d / 2 + .1, 3.4, 3, .2, 0x7dc4ff); st.box(cx, 3, cz + d / 2 + 1.6, 6, .4, 3.4, 0xe53b3b);
    st.box(cx, 5.5, cz + d / 2 + 1.02, 1.6, 5, .2, 0xe53b3b); st.box(cx, 7.2, cz + d / 2 + 1.02, 5, 1.6, .2, 0xe53b3b);
    st.disc(cx + 8, cz, 4.6, h + .65, 0x444a55, 16); st.strip(cx + 8, cz - 1.8, .6, 3.6, 0, h + .7, 0xffd23f); st.strip(cx + 8, cz + 1.8, .6, 3.6, 0, h + .7, 0xffd23f); st.strip(cx + 8, cz, 3.6, .6, 0, h + .7, 0xffd23f);
    solid(cx, cz, w, d); pad(cx - 13, cz + d / 2 + .2, cx + 13, cz + d / 2 + 12.2);
    W.spots.hospital = { x: cx, z: cz + d / 2 + 6 };
    W.vehicleSpawns.push({ type: 'ambulance', x: cx - 6, z: cz + d / 2 + 7, h: 0 }, { type: 'ambulance', x: cx + 6, z: cz + d / 2 + 7, h: 0 });
  }
  { // Polizeiwache (NW)
    const cx = -56, cz = -56, w = 22, d = 16, h = 7;
    box(cx, cz, w, d, h, 0xe8eefc); box(cx, cz + d / 2 - .1, w, .5, 2, 0x2f5fd0, 0); box(cx, cz, w + .6, d + .6, .7, 0x2f5fd0, h);
    st.box(cx, h + .7, cz, 5, 1.2, 5, 0x2f5fd0); st.cyl(cx, h + 1.9, cz, .08, .08, 5, 0x888, 5);
    windows(cx, cz, w, d, 1.6, 2, 3.2, 1);
    st.box(cx, 0, cz + d / 2 + .1, 3, 2.6, .15, 0x2a3f7a); st.cyl(cx, 3.8, cz + d / 2 + .15, 1.1, 1.1, .2, 0xffcf2e, 8, Math.PI / 2);
    solid(cx, cz, w, d); pad(cx - 11, cz + d / 2 + .2, cx + 11, cz + d / 2 + 11.2);
    W.vehicleSpawns.push({ type: 'police', x: cx - 5, z: cz + d / 2 + 6, h: 0 }, { type: 'police', x: cx + 5, z: cz + d / 2 + 6, h: 0 });
  }
  { // Feuerwehr (SE) – Eingang nach Norden
    const cx = 56, cz = 56, w = 24, d = 16, h = 7;
    box(cx, cz, w, d, h, 0xe04b3c); box(cx, cz, w + .6, d + .6, .6, 0xfafafa, h);
    for (const x of [-6, 6]) { st.box(cx + x, 0, cz - d / 2 - .1, 7, 5.2, .15, 0xd7dde6); for (let k = 0; k < 5; k++) st.box(cx + x, 1 + k, cz - d / 2 - .2, 7, .08, .05, 0x9aa3b0); }
    st.box(cx + 9.5, h + .6, cz + 4, 3.5, 7, 3.5, 0xd2392c); st.cone(cx + 9.5, h + 7.6, cz + 4, 2.8, 2.6, 0x333c4a, 4);
    windows(cx, cz, w, d, 1.8, 1, 5, 0); solid(cx, cz, w, d); pad(cx - 12, cz - d / 2 - 12.2, cx + 12, cz - d / 2 - .2);
    W.vehicleSpawns.push({ type: 'fire', x: cx - 6, z: cz - d / 2 - 7, h: Math.PI }, { type: 'fire', x: cx + 6, z: cz - d / 2 - 7, h: Math.PI });
  }
  { // Bahnhof (oben an der Strecke)
    const px0 = 38, px1 = 82, tz = -K.AZ;
    st.box((px0 + px1) / 2, 0, tz + 5.4, px1 - px0, .2, 4, 0xcfc7b8);
    box(60, -106.5, 24, 8, 5.5, 0xffe3a6); st.prism(60, 5.5, -106.5, 9, 2.6, 25, 0xc2453d, Math.PI / 2);
    windows(60, -106.5, 24, 8, 1.4, 1, 3, 0);
    st.box(60, 0, -110.4, 4, 2.6, .12, 0x8a5a33);
    for (const x of [42, 51, 69, 78]) st.box(x, .5, tz + 5.9, .3, 3.5, .3, 0x6b6f78); st.box(60, 4, tz + 5.4, 42, .4, 5, 0xc2453d);
    st.cyl(60, 5.8, -102.4, 1, 1, .5, 0xffffff, 16, Math.PI / 2); st.box(60, 6.5, -102.55, .1, .8, .1, 0x222222);
    W.addBox(48, -110.5, 72, -102.5);
    W.spots.station = { x: 60, z: tz + 5.4 };
  }
  // innere Gebäude
  { // Rathaus mit Uhrturm (NE-innen)
    const cx = 27, cz = -27;
    box(cx, cz, 14, 14, 7, 0xf1e6cf); st.prism(cx, 7, cz, 15, 3, 15, 0x7c8aa0, 0); box(cx, cz, 5, 5, 16, 0xe5d6b8, 0);
    st.cone(cx, 16, cz, 3.8, 5, 0x3f7fd9, 4); st.cyl(cx, 12, cz + 2.55, 1.2, 1.2, .2, 0xffffff, 16, Math.PI / 2); st.box(cx, 12.8, cz + 2.7, .12, .9, .08, 0x222);
    for (let k = -2; k <= 2; k++) st.cyl(cx + k * 2.4, 0, cz + 7.5, .4, .4, 5, 0xfafafa, 8);
    windows(cx, cz, 14, 14, 1.4, 1, 3.5, 1); st.cyl(cx + 9, 0, cz + 8, .08, .08, 9, 0xaaaaaa, 5); st.box(cx + 9.8, 6.5, cz + 8, 1.5, 1, .05, 0xff5a5a); solid(cx, cz, 14, 14);
  }
  { // Schule (NW-innen)
    const cx = -27, cz = -27;
    box(cx, cz, 14, 14, 6, 0xffd75a); st.box(cx, 6, cz, 14.6, .5, 14.6, 0xc2453d); box(cx - 4, cz + 4, 4, 4, 9, 0xffd75a); st.cone(cx - 4, 9, cz + 4, 3.1, 3, 0xc2453d, 4);
    windows(cx, cz, 14, 14, 1.4, 2, 2.4, 1); st.box(cx + 3, 0, cz + 7.1, 2.2, 2.4, .12, 0x2d6a4f); solid(cx, cz, 14, 14);
    st.sph(cx + 3, 2.2, cz + 12, 1.2, 0xff5a5a, 1); st.sph(cx - 1, 2.2, cz + 12, 1.2, 0x4da3ff, 1);
  }
  { // Eisdiele (SE-innen)
    const cx = 27, cz = 27;
    box(cx, cz, 14, 14, 5, 0xffc4dc); st.box(cx, 5, cz, 14.6, .4, 14.6, 0xffffff);
    for (let k = -3; k <= 3; k++) st.box(cx + k * 1.9, 3.2, cz - 8.5, 1.9, .5, 3, k % 2 ? 0xffffff : 0xff5a8f);
    st.sph(cx, 11, cz, 1.9, 0xff8fb8, 1); st.sph(cx, 12.8, cz, 1.5, 0xfff1b8, 1); st.sph(cx, 14.3, cz, 1.1, 0x9be0c8, 1); st.sph(cx, 15.6, cz, .35, 0xe53b3b, 0);
    st.cyl(cx, 5.4, cz, 1.9, 0.05, 5, 0xe0a458, 6);
    windows(cx, cz, 14, 14, 1.4, 1, 3.2, -1); st.box(cx, 0, cz - 7.1, 2.2, 2.4, .12, 0x8a5a33); solid(cx, cz, 14, 14);
  }
  { // Spielzeugladen (SW-innen)
    const cx = -27, cz = 27;
    box(cx, cz, 14, 14, 5, 0xffb45a); st.box(cx, 5, cz, 14.6, .5, 14.6, 0x7a5ce0);
    const cs = [0xff5a5a, 0x4da3ff, 0xffd23f, 0x4cd07d];
    for (let k = 0; k < 4; k++) st.box(cx - 4.5 + k * 3, 5.5, cz + (k % 2) * 2 - 1, 2.6, 2.6, 2.6, cs[k], k * .3);
    st.sph(cx, 10, cz, 1.2, 0xff5a5a, 1); windows(cx, cz, 14, 14, 1.4, 1, 3.2, -1); st.box(cx, 0, cz - 7.1, 2.2, 2.4, .12, 0x8a5a33); solid(cx, cz, 14, 14);
  }
  // Brunnen
  { st.cyl(0, 0, 0, 5.8, 6.2, 1.1, 0xcfd6e2, 20); st.cyl(0, 1.0, 0, 5.2, 5.2, .15, 0x57c4ff, 20); st.cyl(0, .6, 0, 1, 1.3, 2.6, 0xcfd6e2, 10); st.cyl(0, 3.1, 0, 2.2, .6, .5, 0xcfd6e2, 12); st.cyl(0, 3.5, 0, 1.6, 1.6, .1, 0x57c4ff, 12); W.addCircle(0, 0, 6.2); W.spots.fountain = { x: 0, z: 0, y: 4 }; }

  // Wohnhäuser an den Hauptstraßen
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const dists = dx ? [67, 80, 92, 124] : [67, 80, 92];
    for (const d of dists) for (const side of [-1, 1]) {
      const cx = dx * d + (dz ? side * 14 : 0), cz = dz * d + (dx ? side * 14 : 0);
      let ok = !W.boxes.some(b => cx + 6 > b.x0 && cx - 6 < b.x1 && cz + 6 > b.z0 && cz - 6 < b.z1);
      if (ok) { if (dx) houseOnX(cx, cz, side); else houseOnZ(cx, cz); }
    }
  }

  /* ---------- Park mit Spielplatz (SW) ---------- */
  { const x0 = -72, x1 = -46, z0 = 46, z1 = 66;
    st.rect(x0, z0, x1, z1, .03, 0x9be07c); st.rect(x0 + 2, z0 + 2, x1 - 2, z0 + 3.2, .045, 0xe3d3a8);
    // Rutsche
    st.box(-64, 0, 52, 2, 3, 2, 0xff5a5a); st.box(-64, 1.5, 55.2, 1.4, .2, 5.6, 0xffd23f, 0, .52); st.box(-64, 3, 51.2, 2.4, .2, 2.4, 0xc2453d); W.addBox(-65.2, 50.5, -62.8, 52.6);
    // Schaukel
    st.box(-55, 0, 56, .3, 3.4, .3, 0x4da3ff, 0, 0, .2); st.box(-51, 0, 56, .3, 3.4, .3, 0x4da3ff, 0, 0, -.2); st.box(-53, 3.2, 56, 4.6, .3, .3, 0x4da3ff);
    W.swing = new THREE.Group(); W.swing.position.set(-53, 3.2, 56); const sb = new BI.Batch(); sb.box(-.5, -2.4, 0, .06, 2.4, .06, 0x333); sb.box(.5, -2.4, 0, .06, 2.4, .06, 0x333); sb.box(0, -2.5, 0, 1.4, .12, .5, 0xffd23f); W.swing.add(sb.mesh(BI.mat())); scene.add(W.swing);
    W.addBox(-55.2, 55.6, -50.8, 56.4);
    // Sandkasten
    st.box(-66, 0, 60, 5, .4, 4, 0xa86a3c); st.box(-66, .35, 60, 4.4, .05, 3.4, 0xf1dd9a); W.addBox(-68.5, 58, -63.5, 62);
    // Wippe
    st.box(-58, 0, 61, .4, .8, .4, 0x7a5ce0); st.box(-58, .8, 61, .5, .15, 4.4, 0xff8fc8, 0, 0, 0); W.addCircle(-58, 61, 1.3);
    // Bank + Bäume
    st.box(-50, .0, 50, 2.6, .5, .8, 0x8a5a33); st.box(-50, .5, 49.6, 2.6, .6, .15, 0x8a5a33); W.addBox(-51.3, 49.5, -48.7, 50.5);
  }
  W.spots.park = { x: -59, z: 56 };

  /* ---------- Farm (SW außen) ---------- */
  { const fx0 = -126, fx1 = -98, fz0 = 72, fz1 = 98, gate0 = -116, gate1 = -108;
    st.rect(fx0, fz0, fx1, fz1, .03, 0xa9e07c);
    const post = (x, z) => st.box(x, 0, z, .25, 1.3, .25, 0x8a5a33);
    const fenceX = (xa, xb, z, g0, g1) => { for (let x = xa; x <= xb; x += 3) { if (g0 != null && x > g0 && x < g1) continue; post(x, z); } let a = xa; const seg = (u, v) => { if (v > u) { st.box((u + v) / 2, .4, z, v - u, .12, .14, 0xb07a44); st.box((u + v) / 2, .9, z, v - u, .12, .14, 0xb07a44); W.addBox(u, z - .15, v, z + .15); } }; if (g0 != null) { seg(xa, g0); seg(g1, xb); } else seg(xa, xb); };
    const fenceZ = (x, za, zb) => { for (let z = za; z <= zb; z += 3) post(x, z); st.box(x, .4, (za + zb) / 2, .14, .12, zb - za, 0xb07a44); st.box(x, .9, (za + zb) / 2, .14, .12, zb - za, 0xb07a44); W.addBox(x - .15, za, x + .15, zb); };
    fenceX(fx0, fx1, fz0, gate0, gate1); fenceX(fx0, fx1, fz1); fenceZ(fx0, fz0, fz1); fenceZ(fx1, fz0, fz1);
    W.farm = { x0: fx0 + 2, x1: fx1 - 2, z0: fz0 + 2, z1: fz1 - 2 };
    // Scheune
    const bx = -112, bz = 62;
    box(bx, bz, 16, 12, 6, 0xc83d34); st.prism(bx, 6, bz, 17, 4.6, 12.6, 0x8a2b2b, Math.PI / 2 * 0); st.box(bx, 0, bz + 6.05, 5, 4.4, .15, 0xf5ecd8); st.box(bx, 0, bz + 6.1, .3, 4.4, .12, 0xc83d34, 0, 0, 0);
    st.box(bx - 2.5, 0, bz + 6.12, .3, 4.4, .1, 0xc83d34, 0, 0, .0); st.box(bx, 1, bz + 6.14, 5, .25, .1, 0xc83d34, 0, 0, .75); st.box(bx, 1, bz + 6.14, 5, .25, .1, 0xc83d34, 0, 0, -.75);
    solid(bx, bz, 16, 12);
    // Silo
    st.cyl(-96, 0, 60, 2.4, 2.4, 11, 0xdfe6ee, 12); st.sph(-96, 11, 60, 2.4, 0xc83d34, 1, 1, .6, 1); W.addCircle(-96, 60, 2.5);
    // Windmühle
    st.cyl(-84, 0, 66, 1.4, 2.2, 9, 0xf3e9d2, 8); st.cone(-84, 9, 66, 2.6, 2.4, 0xc83d34, 8); W.addCircle(-84, 66, 2.3);
    W.mill = new THREE.Group(); W.mill.position.set(-84, 8.5, 68.4); const mb = new BI.Batch();
    mb.box(0, -2.7, 0, .7, 5.4, .12, 0xfafafa); mb.box(-2.7, -.35, 0, 5.4, .7, .12, 0xfafafa); mb.sph(0, 0, .1, .5, 0xc83d34, 1);
    W.mill.add(mb.mesh(BI.mat())); scene.add(W.mill);
    // Heuballen
    for (const [x, z] of [[-122, 94], [-120, 90], [-102, 94]]) { st.cyl(x, 0, z, .9, .9, 1.2, 0xe8c85a, 10); W.addCircle(x, z, 1); }
    W.vehicleSpawns.push({ type: 'tractor', x: -101, z: 66, h: Math.PI * .5 });
  }

  /* ---------- Strand, Leuchtturm, Steg ---------- */
  { // Sonnenschirme + Handtücher (Ost)
    const cols = [0xff5a5a, 0x4da3ff, 0xffd23f, 0x4cd07d];
    for (let i = 0; i < 5; i++) { const x = 160 + (i % 2) * 5, z = -22 + i * 11, c = cols[i % 4]; st.cyl(x, 0, z, .07, .07, 2.4, 0xeeeeee, 5); st.cone(x, 2.2, z, 2.2, .7, c, 8); st.box(x + 2.2, .03, z + 1, 1.5, .04, 2.6, i % 2 ? 0xffffff : 0xffb0c8, .3); W.addCircle(x, z, .5); }
    st.sph(163, .5, 6, .5, 0xff5a5a, 1);
    // Leuchtturm
    st.cyl(-160, 0, -36, 2.6, 3.4, 9, 0xffffff, 12); st.cyl(-160, 3, -36, 2.9, 2.9, 2, 0xe53b3b, 12); st.cyl(-160, 6, -36, 2.6, 2.7, 2, 0xe53b3b, 12);
    st.cyl(-160, 9, -36, 3.3, 3.3, .5, 0x333c4a, 12); st.cyl(-160, 9.5, -36, 2, 2, 1.8, 0xfff7c0, 10); st.cone(-160, 11.3, -36, 2.6, 2, 0xe53b3b, 10); W.addCircle(-160, -36, 3.5);
    W.spots.lighthouse = { x: -160, z: -36, y: 10.4 };
    // Steg + Boot
    st.box(0, .35, 168, 5, .3, 24, 0xb98650); for (let k = 0; k < 9; k++) st.box(-2.4, 0, 158 + k * 2.6, .3, .5, .3, 0x7a5a33), st.box(2.4, 0, 158 + k * 2.6, .3, .5, .3, 0x7a5a33);
    W.addBox(-2.7, 156, -2.2, 180); W.addBox(2.2, 156, 2.7, 180);
  }

  /* ---------- Bäume, Büsche, Blumen, Steine ---------- */
  function tree(x, z, kind) {
    const s = rr(.85, 1.3);
    if (kind === 'palm') {
      const lean = rr(-.25, .25), tl = 6 * s;
      st.cyl(x, 0, z, .22 * s, .35 * s, tl * .5, 0xb9824a, 6, lean * .5, 0, lean * .5); st.cyl(x + lean * 1.6, tl * .48, z + lean * 1.6, .17 * s, .22 * s, tl * .55, 0xb9824a, 6, lean, 0, lean);
      const tx = x + lean * 3.4, tz = z + lean * 3.4, ty = tl * .95;
      for (let k = 0; k < 6; k++) { const a = k * 1.047; st.box(tx + Math.sin(a) * 1.5, ty - .2, tz + Math.cos(a) * 1.5, .5, .1, 3.2, pick([0x3fae4a, 0x2f9a3c]), a, .3); }
      st.sph(tx, ty - .2, tz, .45, 0x7a4a2a, 0); W.addCircle(x, z, .5);
    } else if (kind === 'pine') {
      st.cyl(x, 0, z, .25 * s, .35 * s, 1.6 * s, 0x7a5233, 6);
      for (let k = 0; k < 3; k++) st.cone(x, (1.2 + k * 1.5) * s, z, (2.1 - k * .5) * s, 2.4 * s, pick([0x2f8f4a, 0x3aa055, 0x2a8044]), 7, .1);
      W.addCircle(x, z, .6);
    } else {
      st.cyl(x, 0, z, .3 * s, .42 * s, 2.2 * s, 0x8a5a33, 6);
      st.sph(x, 3.2 * s, z, 1.9 * s, pick([0x4cb85a, 0x5ac966, 0x3fa84e, 0x8ad24f]), 1, 1, .9, 1, .12); st.sph(x + .8 * s, 4 * s, z - .5 * s, 1.2 * s, pick([0x5ac966, 0x6bd677]), 1, 1, .9, 1, .12);
      if (rnd() < .25) for (let k = 0; k < 5; k++) st.sph(x + rr(-1.5, 1.5) * s, rr(2.2, 4) * s, z + rr(-1.5, 1.5) * s, .17, pick([0xff4a4a, 0xffd23f]), 0);
      W.addCircle(x, z, .65);
    }
  }
  let nT = 0;
  for (let tries = 0; nT < 190 && tries < 2500; tries++) {
    const a = rnd() * BI.TAU, d = Math.sqrt(rnd()) * 160, x = Math.sin(a) * d, z = Math.cos(a) * d;
    if (blockedAt(x, z, 3)) continue;
    if (W.farm && x > W.farm.x0 - 8 && x < W.farm.x1 + 8 && z > W.farm.z0 - 8 && z < W.farm.z1 + 8) continue;
    if (x > -78 && x < -42 && z > 42 && z < 70) { if (rnd() < .5) continue; }
    if (x > -130 && x < -78 && z > 52 && z < 78) continue; // Platz vor Scheune/Silo
    tree(x, z, d > 125 && rnd() < .5 ? 'pine' : 'round'); nT++;
  }
  for (let i = 0, tries = 0; i < 26 && tries < 300; tries++) { // Palmen am Strand
    const a = rnd() * BI.TAU, d = rr(158, 172), x = Math.sin(a) * d, z = Math.cos(a) * d;
    if (blockedAt(x, z, 4)) continue; tree(x, z, 'palm'); i++;
  }
  for (let i = 0, tries = 0; i < 90 && tries < 900; tries++) { // Büsche
    const a = rnd() * BI.TAU, d = Math.sqrt(rnd()) * 165, x = Math.sin(a) * d, z = Math.cos(a) * d;
    if (blockedAt(x, z, 1.5)) continue; st.sph(x, .55, z, rr(.6, 1.1), pick([0x3fa84e, 0x57c264, 0x6fd16e]), 1, 1, .75, 1, .1); i++; // Büsche sind weich: man fährt hindurch
  }
  for (let i = 0, tries = 0; i < 260 && tries < 1500; tries++) { // Blumen
    const a = rnd() * BI.TAU, d = Math.sqrt(rnd()) * 160, x = Math.sin(a) * d, z = Math.cos(a) * d;
    if (nearRoad(x, z, 1) || W.railSdf(x, z) < 5 || Math.hypot(x - LAKE.x, z - LAKE.z) < LAKE.r + 2) continue;
    const c = pick([0xff5a8f, 0xffd23f, 0xffffff, 0xb36bff, 0xff8a3a]); st.cyl(x, 0, z, .03, .03, .35, 0x3fa84e, 3); st.sph(x, .42, z, .16, c, 0); i++;
  }
  for (let i = 0, tries = 0; i < 26 && tries < 400; tries++) { // Steine
    const a = rnd() * BI.TAU, d = rr(60, 168), x = Math.sin(a) * d, z = Math.cos(a) * d;
    if (blockedAt(x, z, 2)) continue; const s = rr(.5, 1.4); st.sph(x, s * .4, z, s, pick([0xaab2bd, 0x9aa3ae, 0xbfc6cf]), 0, 1, .7, 1); W.addCircle(x, z, s * .8); i++;
  }

  /* ---------- Schienen ---------- */
  { const T = W.track; let i = 0;
    for (let s = 0; s < T.L - 1; s += 3) {
      const p = W.trackAt(s, {}), sx = Math.sin(p.h), sz = Math.cos(p.h);
      st.strip(p.x + sx * 1.5, p.z + sz * 1.5, 3.4, 3.1, p.h, .07, 0xb1a998);
      st.box(p.x + sx * 1.5, .075, p.z + sz * 1.5, 2.8, .1, .4, 0x7a5a33, p.h);
      for (const o of [-.75, .75]) st.box(p.x + sx * 1.5 - sz * o, .17, p.z + sz * 1.5 + sx * o, .12, .12, 3.2, 0xc9ced6, p.h);
      i++;
    }
    // Bahnübergänge: Andreaskreuze + Schranken-Pfosten
    for (const [x, z, h] of [[K.AX, 0, 0], [-K.AX, 0, 0], [0, K.AZ, Math.PI / 2], [0, -K.AZ, Math.PI / 2]]) {
      for (const sd of [-1, 1]) {
        const px = h ? x + sd * 5.6 : x + 3.8, pz = h ? z + 3.8 : z + sd * 5.6;
        st.cyl(px, 0, pz, .07, .07, 2.8, 0xdddddd, 5); st.box(px, 2.4, pz, 1.4, .22, .08, 0xffffff, 0, 0, .78); st.box(px, 2.4, pz, 1.4, .22, .08, 0xe53b3b, 0, 0, -.78);
        st.sph(px, 1.9, pz, .16, 0xff3030, 0);
      }
    }
  }

  /* ---------- Laternen ---------- */
  function lampAt(x, z) { st.cyl(x, 0, z, .07, .1, 4.2, 0x444b57, 5); lamp.sph(x, 4.35, z, .35, 0xffffff, 1); W.addCircle(x, z, .3); }
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) for (let d = 24; d < 150; d += 22) {
    const r = d; if (Math.abs(r - K.RA) < 8 || Math.abs(r - K.RB) < 8) continue; lampAt(dx * d + (dz ? 5.6 : 0), dz * d + (dx ? 5.6 : 0));
  }
  for (const R0 of [K.RA, K.RB]) for (let i = 0; i < 14; i++) { const a = (i + .5) / 14 * BI.TAU; const x = Math.sin(a) * (R0 + 5.6), z = Math.cos(a) * (R0 + 5.6); if (!(Math.abs(x) < 6 || Math.abs(z) < 6)) lampAt(x, z); }

  /* ---------- Berge, Wolken, Wasser ---------- */
  const far = new BI.Batch();
  for (let i = 0; i < 26; i++) { const a = i / 26 * BI.TAU + rnd() * .1, d = rr(300, 360), h = rr(40, 95); far.cone(Math.sin(a) * d, -2, Math.cos(a) * d, rr(40, 70), h, pick([0x8fa6c4, 0x7f97b8, 0x9db3cf]), 6); far.cone(Math.sin(a) * d, h * .72, Math.cos(a) * d, rr(10, 18), h * .3, 0xffffff, 6); }
  for (let i = 0; i < 5; i++) { const a = rnd() * BI.TAU, d = rr(235, 275); far.sph(Math.sin(a) * d, -2, Math.cos(a) * d, rr(10, 22), pick([0x86d36a, 0xf3dfa2]), 1, 1, .35, 1); }
  const farMesh = far.mesh(BI.mat()); scene.add(farMesh);
  const clouds = new THREE.Group(), cb = new BI.Batch();
  for (let i = 0; i < 16; i++) { const a = rnd() * BI.TAU, d = rr(40, 280), y = rr(55, 95), x = Math.sin(a) * d, z = Math.cos(a) * d; for (let k = 0; k < 4; k++) cb.sph(x + k * rr(5, 8), y + rr(-2, 2), z + rr(-3, 3), rr(6, 11), 0xffffff, 1, 1, .55, 1); }
  const cloudMat = new THREE.MeshLambertMaterial({ vertexColors: true, emissive: 0x555a66 });
  clouds.add(cb.mesh(cloudMat)); scene.add(clouds); W.clouds = clouds; W.cloudMat = cloudMat;
  const water = new THREE.Mesh(new THREE.CircleGeometry(900, 40), new THREE.MeshLambertMaterial({ color: 0x3aa8e8 }));
  water.rotation.x = -Math.PI / 2; water.position.y = -.35; scene.add(water); W.water = water;
  const foam = new THREE.Mesh(new THREE.RingGeometry(K.R + 8, K.R + 16, 64), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .45, depthWrite: false }));
  foam.rotation.x = -Math.PI / 2; foam.position.y = -.2; scene.add(foam); W.foam = foam;

  /* ---------- Meshes ---------- */
  const stMesh = st.mesh(BI.mat()); stMesh.frustumCulled = false; scene.add(stMesh);
  W.winMat = new THREE.MeshBasicMaterial({ color: 0x9fd8ff }); W.lampMat = new THREE.MeshBasicMaterial({ color: 0xdcdcdc });
  const winMesh = win.mesh(W.winMat), lampMesh = lamp.mesh(W.lampMat); winMesh.frustumCulled = lampMesh.frustumCulled = false; scene.add(winMesh, lampMesh);
  // Leuchtturm-Strahl (nur nachts)
  { const bg = new THREE.ConeGeometry(14, 80, 12, 1, true); bg.translate(0, -40, 0); bg.rotateX(Math.PI / 2); // Spitze am Ursprung, Öffnung nach +z
    W.beamMat = new THREE.MeshBasicMaterial({ color: 0xfff3b0, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
    W.beam = new THREE.Mesh(bg, W.beamMat); W.beam.position.set(-160, W.spots.lighthouse.y, -36); scene.add(W.beam); }

  /* ---------- Hilfsfunktionen ---------- */
  W.randRoadPoint = function (rf, minFromX, minFromZ, minDist) {
    for (let t = 0; t < 40; t++) {
      let x, z; const k = rf();
      if (k < .5) { const dir = (rf() * 4) | 0, d = 20 + rf() * 125, off = (rf() - .5) * 4; x = [d, -d, off, off][dir]; z = [off, off, d, -d][dir]; }
      else { const R0 = rf() < .5 ? K.RA : K.RB, a = rf() * BI.TAU; x = Math.sin(a) * R0; z = Math.cos(a) * R0; }
      if (minDist && Math.hypot(x - minFromX, z - minFromZ) < minDist) continue;
      if (!W.free(x, z, 2.2)) continue;
      return { x, z };
    } return { x: 0, z: 30 };
  };
  W.groundY = (x, z) => (x > 38 && x < 82 && z > -114.6 && z < -110.6) ? .2 : 0;
  W.update = function (t, dt, night) {
    W.clouds.rotation.y += dt * .006; W.foam.scale.setScalar(1 + Math.sin(t * .8) * .012); W.foam.material.opacity = .35 + Math.sin(t * .8) * .1;
    if (W.mill) W.mill.rotation.z += dt * .9;
    if (W.swing) W.swing.rotation.x = Math.sin(t * 1.6) * .45;
    W.beam.rotation.y = t * .8; W.beamMat.opacity = night * .18; W.beam.visible = night > .05;
  };
  W.setNight = function (n) {
    W.winMat.color.setHex(0x9fd8ff).lerp(new THREE.Color(0xffd36e), n); W.lampMat.color.setHex(0xdcdcdc).lerp(new THREE.Color(0xfff0a0), n);
    W.cloudMat.emissive.setHex(0x555a66).lerp(new THREE.Color(0x0e1224), n);
  };
  W.minimap = function (ctx, S) {
    const k = S / (2 * (K.R + 6)), cx = S / 2, cy = S / 2, X = x => cx + x * k, Y = z => cy + z * k;
    ctx.fillStyle = '#3aa8e8'; ctx.fillRect(0, 0, S, S);
    ctx.fillStyle = '#f3dfa2'; ctx.beginPath(); ctx.arc(cx, cy, 180 * k, 0, BI.TAU); ctx.fill();
    ctx.fillStyle = '#86d36a'; ctx.beginPath(); ctx.arc(cx, cy, 166 * k, 0, BI.TAU); ctx.fill();
    ctx.fillStyle = '#4db6f0'; ctx.beginPath(); ctx.arc(X(LAKE.x), Y(LAKE.z), LAKE.r * k, 0, BI.TAU); ctx.fill();
    ctx.strokeStyle = '#6a717c'; ctx.lineWidth = Math.max(2, K.ROAD * k); ctx.lineCap = 'butt';
    for (const r of [K.RR, K.RA, K.RB]) { ctx.beginPath(); ctx.arc(cx, cy, r * k, 0, BI.TAU); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(X(-156), Y(0)); ctx.lineTo(X(156), Y(0)); ctx.moveTo(X(0), Y(-156)); ctx.lineTo(X(0), Y(156)); ctx.stroke();
    ctx.strokeStyle = '#3b3f48'; ctx.lineWidth = 1.5; ctx.setLineDash([3, 2]); ctx.beginPath(); const T = W.track; for (let i = 0; i <= T.N; i += 4) { const j = i % T.N; i ? ctx.lineTo(X(T.X[j]), Y(T.Z[j])) : ctx.moveTo(X(T.X[j]), Y(T.Z[j])); } ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#e8d6c0'; for (const b of W.boxes) if (b.x1 - b.x0 > 5 && b.z1 - b.z0 > 5) ctx.fillRect(X(b.x0), Y(b.z0), (b.x1 - b.x0) * k, (b.z1 - b.z0) * k);
    const mark = (x, z, e) => { ctx.font = Math.round(S * .075) + 'px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(e, X(x), Y(z)); };
    mark(56, -50, '🏥'); mark(-56, -50, '🚓'); mark(56, 50, '🚒'); mark(60, -108, '🚉'); mark(-112, 62, '🚜'); mark(-59, 56, '🛝'); mark(27, 27, '🍦'); mark(0, 0, '⛲');
  };
  return W;
};
