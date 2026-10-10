'use strict';
/* Bunte Insel – die Welt: Boden, Straßen, Schienen, Gebäude, Bäume, Strand, Farm, Spielplatz.
   Alles Statische steckt in EINEM Mesh (Vertexfarben), dazu je ein kleines Mesh für Fenster und Laternen (Tag/Nacht). */
BI.WORLD = { R: 190, MAP: 236, LIMIT: 178, AX: 140, AZ: 118, CR: 40, ROAD: 9, RA: 55, RB: 105, RR: 12 };

BI.buildWorld = function (scene) {
  const K = BI.WORLD, rnd = BI.rng(20240611), rr = (a, b) => a + rnd() * (b - a), pick = a => a[(rnd() * a.length) | 0];
  const st = new BI.Batch(), win = new BI.Batch(), lamp = new BI.Batch(), roofB = new BI.Batch();
  const W = { K, boxes: [], circles: [], vehicleSpawns: [], roadPts: [], houses: [], parts: [] };

  /* ---------- Kollision (Raster) ---------- */
  const CELL = 12, grid = new Map(), cellKey = (ix, iz) => (ix + 40) * 100 + (iz + 40);
  function put(it, x0, z0, x1, z1) {
    it.cells = [];
    for (let ix = Math.floor(x0 / CELL); ix <= Math.floor(x1 / CELL); ix++) for (let iz = Math.floor(z0 / CELL); iz <= Math.floor(z1 / CELL); iz++) {
      const k = cellKey(ix, iz); let a = grid.get(k); if (!a) grid.set(k, a = []); a.push(it); it.cells.push(k);
    }
  }
  /* u = vom Spieler gebaut (darf wieder entfernt werden) */
  W.addCircle = (x, z, r, u, h) => { const it = { c: 1, x, z, r, u: !!u, h: h || 7 }; W.circles.push(it); put(it, x - r, z - r, x + r, z + r); return it; };
  W.addBox = (x0, z0, x1, z1, u, h) => { const it = { c: 0, x0, z0, x1, z1, u: !!u, h: h || 12 }; W.boxes.push(it); put(it, x0, z0, x1, z1); return it; };
  W.removeCollider = it => {
    for (const k of it.cells || []) { const a = grid.get(k); if (a) { const i = a.indexOf(it); if (i >= 0) a.splice(i, 1); } }
    const arr = it.c ? W.circles : W.boxes, j = arr.indexOf(it); if (j >= 0) arr.splice(j, 1);
  };
  const seen = new Set();
  /* schiebt einen Kreis (px,pz,r) aus allen Hindernissen; liefert Verschiebung zurück */
  /* alt = Flughöhe (Hubschrauber): überfliegt Hindernisse, die niedriger sind */
  W.resolve = function (px, pz, r, out, alt) {
    out = out || {}; let hit = false;
    for (let pass = 0; pass < 2; pass++) {
      seen.clear();
      for (let ix = Math.floor((px - r) / CELL); ix <= Math.floor((px + r) / CELL); ix++) for (let iz = Math.floor((pz - r) / CELL); iz <= Math.floor((pz + r) / CELL); iz++) {
        const a = grid.get(cellKey(ix, iz)); if (!a) continue;
        for (let i = 0; i < a.length; i++) {
          const it = a[i]; if (seen.has(it)) continue; seen.add(it);
          if (it.c) {
            if (alt != null && alt > it.h) continue;
            const dx = px - it.x, dz = pz - it.z, d = Math.hypot(dx, dz), m = r + it.r;
            if (d < m) { const k = d > 1e-6 ? (m - d) / d : 0; if (d > 1e-6) { px += dx * k; pz += dz * k; } else px += m; hit = true; }
          } else {
            if (alt != null && alt > it.h) continue;
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
    if (rad > K.LIMIT - r) {
      if (alt == null && pz > 150 && Math.abs(px) < 3.3) { const nx = BI.clamp(px, -2.1, 2.1), nz = Math.min(pz, 207.5); if (nx !== px || nz !== pz) hit = true; px = nx; pz = nz; } // Steg
      else { const k = (K.LIMIT - r) / rad; px *= k; pz *= k; hit = true; }
    }
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
  function blockedAt(x, z, pad, skipUser) {
    if (nearRoad(x, z, pad)) return true;
    if (W.railSdf(x, z) < 5 + pad) return true;
    if (Math.hypot(x - LAKE.x, z - LAKE.z) < LAKE.r + 3 + pad) return true;
    for (const b of W.boxes) if (!(skipUser && b.u) && x > b.x0 - pad && x < b.x1 + pad && z > b.z0 - pad && z < b.z1 + pad) return true;
    for (const c of W.circles) if (!(skipUser && c.u) && Math.hypot(x - c.x, z - c.z) < c.r + pad) return true;
    return false;
  }
  W.blockedAt = blockedAt;
  /* Bauplatz frei? (ohne die vom Spieler gebauten Teile) */
  W.canBuild = (x, z, pad) => Math.hypot(x, z) < K.LIMIT - 8 && !blockedAt(x, z, pad == null ? 2 : pad, true);

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
  function solid(cx, cz, w, d, h) { W.addBox(cx - w / 2, cz - d / 2, cx + w / 2, cz + d / 2, false, h); }
  function house(cx, cz, w, d, h, wall, roof, doorSide, ridgeX) {
    box(cx, cz, w, d, h, wall);
    const rh = Math.min(w, d) * .45;
    if (ridgeX) st.prism(cx, h, cz, d + 1.4, rh, w + 1.4, roof, Math.PI / 2); else st.prism(cx, h, cz, w + 1.4, rh, d + 1.4, roof, 0);
    st.box(cx + w * .25, h + rh * .3, cz + d * .2, .9, rh + .6, .9, 0x9a5a48);
    windows(cx, cz, w, d, 1.4, h > 5.5 ? 2 : 1, h > 5.5 ? 2.8 : 3.4, doorSide);
    if (doorSide) { st.box(cx, 0, cz + doorSide * (d / 2 + .05), 1.3, 2.3, .12, 0x8a5a33); st.box(cx, 0, cz + doorSide * (d / 2 + 1.2), 2.2, .12, 1.6, 0xcfc7b8); }
    solid(cx, cz, w, d, h + rh + 1.5);
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
    solid(cx, cz, w, d, 13); pad(cx - 13, cz + d / 2 + .2, cx + 13, cz + d / 2 + 12.2);
    W.spots.hospital = { x: cx, z: cz + d / 2 + 6 };
    W.vehicleSpawns.push({ type: 'ambulance', x: cx - 6, z: cz + d / 2 + 7, h: 0 }, { type: 'ambulance', x: cx + 6, z: cz + d / 2 + 7, h: 0 });
  }
  { // Polizeiwache (NW)
    const cx = -56, cz = -56, w = 22, d = 16, h = 7;
    box(cx, cz, w, d, h, 0xe8eefc); box(cx, cz + d / 2 - .1, w, .5, 2, 0x2f5fd0, 0); box(cx, cz, w + .6, d + .6, .7, 0x2f5fd0, h);
    st.box(cx, h + .7, cz, 5, 1.2, 5, 0x2f5fd0); st.cyl(cx, h + 1.9, cz, .08, .08, 5, 0x888, 5);
    windows(cx, cz, w, d, 1.6, 2, 3.2, 1);
    st.box(cx, 0, cz + d / 2 + .1, 3, 2.6, .15, 0x2a3f7a); st.cyl(cx, 3.8, cz + d / 2 + .15, 1.1, 1.1, .2, 0xffcf2e, 8, Math.PI / 2);
    solid(cx, cz, w, d, 10); pad(cx - 11, cz + d / 2 + .2, cx + 11, cz + d / 2 + 11.2);
    W.vehicleSpawns.push({ type: 'police', x: cx - 5, z: cz + d / 2 + 6, h: 0 }, { type: 'police', x: cx + 5, z: cz + d / 2 + 6, h: 0 });
  }
  { // Feuerwehr (SE) – Eingang nach Norden
    const cx = 56, cz = 56, w = 24, d = 16, h = 7;
    box(cx, cz, w, d, h, 0xe04b3c); box(cx, cz, w + .6, d + .6, .6, 0xfafafa, h);
    for (const x of [-6, 6]) { st.box(cx + x, 0, cz - d / 2 - .1, 7, 5.2, .15, 0xd7dde6); for (let k = 0; k < 5; k++) st.box(cx + x, 1 + k, cz - d / 2 - .2, 7, .08, .05, 0x9aa3b0); }
    st.box(cx + 9.5, h + .6, cz + 4, 3.5, 7, 3.5, 0xd2392c); st.cone(cx + 9.5, h + 7.6, cz + 4, 2.8, 2.6, 0x333c4a, 4);
    windows(cx, cz, w, d, 1.8, 1, 5, 0); solid(cx, cz, w, d, 16); pad(cx - 12, cz - d / 2 - 12.2, cx + 12, cz - d / 2 - .2);
    W.vehicleSpawns.push({ type: 'fire', x: cx - 6, z: cz - d / 2 - 7, h: Math.PI }, { type: 'fire', x: cx + 6, z: cz - d / 2 - 7, h: Math.PI });
  }
  /* Vier Bahnhöfe auf dem Schienenring (Zug fährt im Uhrzeigersinn) */
  W.stations = [];
  function station(o) {
    const T = W.track, [px0, pz0, px1, pz1] = o.plat, pw = px1 - px0, pd = pz1 - pz0, pcx = (px0 + px1) / 2, pcz = (pz0 + pz1) / 2, [bx, bz, bw, bd] = o.bld;
    st.box(pcx, 0, pcz, pw, .2, pd, 0xcfc7b8);
    box(bx, bz, bw, bd, 5.5, 0xffe3a6);
    if (o.ridgeX) st.prism(bx, 5.5, bz, bd + 1, 2.6, bw + 1, o.roof, Math.PI / 2); else st.prism(bx, 5.5, bz, bw + 1, 2.6, bd + 1, o.roof, 0);
    windows(bx, bz, bw, bd, 1.4, 1, 3, 0);
    const [dx, dz] = o.door;
    if (o.ridgeX) { st.box(dx, 0, dz, 4, 2.6, .14, 0x8a5a33); st.box(dx, 3.0, dz, 5, .9, .16, o.sign); for (let i = 0; i < 4; i++) st.box(px0 + 4 + i * (pw - 8) / 3, .2, o.post, .3, 3.5, .3, 0x6b6f78); st.box(pcx, 3.7, pcz, pw - 2, .4, pd + 1, o.roof); }
    else { st.box(dx, 0, dz, .14, 2.6, 4, 0x8a5a33); st.box(dx, 3.0, dz, .16, .9, 5, o.sign); for (let i = 0; i < 4; i++) st.box(o.post, .2, pz0 + 4 + i * (pd - 8) / 3, .3, 3.5, .3, 0x6b6f78); st.box(pcx, 3.7, pcz, pw + 1, .4, pd - 2, o.roof); }
    W.addBox(bx - bw / 2, bz - bd / 2, bx + bw / 2, bz + bd / 2, false, 9);
    let bi = 0, bdst = 1e9; for (let i = 0; i < T.N; i++) { const d = Math.hypot(T.X[i] - o.stop[0], T.Z[i] - o.stop[1]); if (d < bdst) { bdst = d; bi = i; } }
    W.stations.push({ name: o.name, icon: o.icon, x: o.stop[0], z: o.stop[1], s: bi * T.ds, px: pcx, pz: pcz, plat: o.plat, ridgeX: o.ridgeX });
  }
  station({ name: 'Hauptbahnhof', icon: '🚉', plat: [38, -114.6, 82, -110.6], bld: [60, -106.5, 24, 8], ridgeX: true, roof: 0xc2453d, sign: 0xe0382b, door: [60, -110.55], post: -112.6, stop: [76, -118] });
  station({ name: 'Strand', icon: '🏖️', plat: [132.6, 20, 136.6, 60], bld: [128.55, 40, 8, 24], ridgeX: false, roof: 0x3f7fd9, sign: 0x2d8cff, door: [132.62, 40], post: 134.6, stop: [140, 58] });
  station({ name: 'Südhalt', icon: '🌲', plat: [-82, 110.6, -38, 114.6], bld: [-60, 106.5, 24, 8], ridgeX: true, roof: 0x3fa860, sign: 0x4cd07d, door: [-60, 110.54], post: 112.6, stop: [-76, 118] });
  station({ name: 'Leuchtturm', icon: '🗼', plat: [-136.6, -60, -132.6, -20], bld: [-128.55, -40, 8, 24], ridgeX: false, roof: 0xe0a020, sign: 0xffc933, door: [-132.62, -40], post: -134.6, stop: [-140, -56] });
  st.cyl(60, 5.8, -102.4, 1, 1, .5, 0xffffff, 16, Math.PI / 2); st.box(60, 6.5, -102.55, .1, .8, .1, 0x222222);
  W.STATION_S = W.stations[0].s; W.spots.station = { x: 60, z: -112.6 };
  { // Landeplatz für den Hubschrauber
    const hx = 100, hz = -62; W.pads.push([hx - 7, hz - 7, hx + 7, hz + 7]); W.spots.helipad = { x: hx, z: hz };
    st.disc(hx, hz, 7.2, ROADY + .01, 0x5d6470, 28); st.ring(hx, hz, 6.2, 6.8, ROADY + .03, 0xffd23f, 32);
    st.strip(hx - 1.7, hz, .7, 5, 0, ROADY + .04, 0xffffff); st.strip(hx + 1.7, hz, .7, 5, 0, ROADY + .04, 0xffffff); st.strip(hx, hz, 3.4, .7, 0, ROADY + .04, 0xffffff);
    W.vehicleSpawns.push({ type: 'heli', x: hx, z: hz, h: Math.PI });
  }
  // innere Gebäude
  { // Rathaus mit Uhrturm (NE-innen)
    const cx = 27, cz = -27;
    box(cx, cz, 14, 14, 7, 0xf1e6cf); st.prism(cx, 7, cz, 15, 3, 15, 0x7c8aa0, 0); box(cx, cz, 5, 5, 16, 0xe5d6b8, 0);
    st.cone(cx, 16, cz, 3.8, 5, 0x3f7fd9, 4); st.cyl(cx, 12, cz + 2.55, 1.2, 1.2, .2, 0xffffff, 16, Math.PI / 2); st.box(cx, 12.8, cz + 2.7, .12, .9, .08, 0x222);
    for (let k = -2; k <= 2; k++) st.cyl(cx + k * 2.4, 0, cz + 7.5, .4, .4, 5, 0xfafafa, 8);
    windows(cx, cz, 14, 14, 1.4, 1, 3.5, 1); st.cyl(cx + 9, 0, cz + 8, .08, .08, 9, 0xaaaaaa, 5); st.box(cx + 9.8, 6.5, cz + 8, 1.5, 1, .05, 0xff5a5a); solid(cx, cz, 14, 14, 22);
  }
  { // Schule (NW-innen)
    const cx = -27, cz = -27;
    box(cx, cz, 14, 14, 6, 0xffd75a); st.box(cx, 6, cz, 14.6, .5, 14.6, 0xc2453d); box(cx - 4, cz + 4, 4, 4, 9, 0xffd75a); st.cone(cx - 4, 9, cz + 4, 3.1, 3, 0xc2453d, 4);
    windows(cx, cz, 14, 14, 1.4, 2, 2.4, 1); st.box(cx + 3, 0, cz + 7.1, 2.2, 2.4, .12, 0x2d6a4f); solid(cx, cz, 14, 14, 13);
    st.sph(cx + 3, 2.2, cz + 12, 1.2, 0xff5a5a, 1); st.sph(cx - 1, 2.2, cz + 12, 1.2, 0x4da3ff, 1);
  }
  { // Eisdiele (SE-innen)
    const cx = 27, cz = 27;
    box(cx, cz, 14, 14, 5, 0xffc4dc); st.box(cx, 5, cz, 14.6, .4, 14.6, 0xffffff);
    for (let k = -3; k <= 3; k++) st.box(cx + k * 1.9, 3.2, cz - 8.5, 1.9, .5, 3, k % 2 ? 0xffffff : 0xff5a8f);
    st.sph(cx, 11, cz, 1.9, 0xff8fb8, 1); st.sph(cx, 12.8, cz, 1.5, 0xfff1b8, 1); st.sph(cx, 14.3, cz, 1.1, 0x9be0c8, 1); st.sph(cx, 15.6, cz, .35, 0xe53b3b, 0);
    st.cyl(cx, 5.4, cz, 1.9, 0.05, 5, 0xe0a458, 6);
    windows(cx, cz, 14, 14, 1.4, 1, 3.2, -1); st.box(cx, 0, cz - 7.1, 2.2, 2.4, .12, 0x8a5a33); solid(cx, cz, 14, 14, 17);
  }
  { // Spielzeugladen (SW-innen) – begehbar, mit Regalen voller Spielzeug und Verkäuferin
    const cx = -27, cz = 27, WALL = 0xffb45a, WOOD = 0xc8803c, DW = 0x8a5a33, P = [0xff5a5a, 0x4da3ff, 0xffd23f, 0x4cd07d, 0xb36bff, 0xff8fc8, 0xff9a3a];
    const wallBox = (x0, z0, x1, z1, y0, h) => { st.box((x0 + x1) / 2, y0, (z0 + z1) / 2, x1 - x0, h, z1 - z0, WALL); if (!y0) W.addBox(x0, z0, x1, z1, false, 6); };
    wallBox(cx - 7, cz - 7, cx - 6.5, cz + 7, 0, 5); wallBox(cx + 6.5, cz - 7, cx + 7, cz + 7, 0, 5); wallBox(cx - 7, cz + 6.5, cx + 7, cz + 7, 0, 5);
    wallBox(cx - 7, cz - 7, cx - 1.5, cz - 6.5, 0, 5); wallBox(cx + 1.5, cz - 7, cx + 7, cz - 6.5, 0, 5); wallBox(cx - 1.5, cz - 7, cx + 1.5, cz - 6.5, 3.2, 1.8);
    st.box(cx, 5, cz, 14.6, .5, 14.6, 0x7a5ce0);
    const cs = [0xff5a5a, 0x4da3ff, 0xffd23f, 0x4cd07d];
    for (let k = 0; k < 4; k++) st.box(cx - 4.5 + k * 3, 5.5, cz + (k % 2) * 2 - 1, 2.6, 2.6, 2.6, cs[k], k * .3);
    st.sph(cx, 10, cz, 1.2, 0xff5a5a, 1);
    for (let k = 0; k < 5; k++) st.box(cx - 2.1 + k * 1.05, 3.45, cz - 7.2, .8, .8, .16, P[k]);
    windows(cx, cz, 14, 14, 1.4, 1, 3.2, -1);
    // Boden mit Schachbrett + Fußmatte
    for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) st.rect(cx - 6.5 + i * 13 / 6, cz - 6.5 + j * 13 / 6, cx - 6.5 + (i + 1) * 13 / 6, cz - 6.5 + (j + 1) * 13 / 6, ROADY - .0, (i + j) % 2 ? 0xfff1d6 : 0xffd9a0);
    st.rect(cx - 1.3, cz - 8.4, cx + 1.3, cz - 6.9, ROADY + .01, 0x7a5ce0);
    // Spielzeug
    const tint = (c, k) => { const f = v => Math.max(0, Math.min(255, Math.round(v * k))); return (f((c >> 16) & 255) << 16) | (f((c >> 8) & 255) << 8) | f(c & 255); };
    const toy = {
      bear(x, y, z, c) { st.sph(x, y + .2, z, .2, c, 1); st.sph(x, y + .48, z, .14, c, 1); st.sph(x - .1, y + .6, z, .05, c, 0); st.sph(x + .1, y + .6, z, .05, c, 0); st.sph(x, y + .46, z + .1, .06, tint(c, 1.3), 0); },
      block(x, y, z, c) { st.box(x, y, z, .3, .3, .3, c, Math.random()); },
      stack(x, y, z, c) { st.box(x, y, z, .32, .3, .32, c); st.box(x, y + .3, z, .28, .28, .28, tint(c, .8), .4); st.box(x, y + .58, z, .24, .24, .24, tint(c, 1.2), .8); },
      ball(x, y, z, c) { st.sph(x, y + .18, z, .18, c, 1); },
      car(x, y, z, c, ry) { st.box(x, y + .06, z, .5, .12, .25, c, ry); st.box(x, y + .18, z, .26, .1, .2, tint(c, .8), ry); for (const sx of [-.15, .15]) for (const sz of [-.12, .12]) { const o = [sx * Math.cos(ry || 0) + sz * Math.sin(ry || 0), -sx * Math.sin(ry || 0) + sz * Math.cos(ry || 0)]; st.sph(x + o[0], y + .05, z + o[1], .06, 0x23262d, 0); } },
      robot(x, y, z, c) { st.box(x, y, z, .26, .34, .2, c); st.box(x, y + .34, z, .2, .18, .18, tint(c, 1.2)); st.box(x, y + .52, z, .03, .1, .03, 0xffffff); st.box(x - .17, y + .1, z, .06, .26, .06, tint(c, .8)); st.box(x + .17, y + .1, z, .06, .26, .06, tint(c, .8)); },
      duck(x, y, z, c) { st.sph(x, y + .15, z, .17, 0xffe14a, 1); st.sph(x, y + .36, z + .08, .1, 0xffe14a, 1); st.box(x, y + .34, z + .18, .08, .04, .1, 0xff8a1f); },
      doll(x, y, z, c) { st.cyl(x, y, z, .06, .14, .32, c, 8); st.sph(x, y + .42, z, .1, 0xffd6b3, 1); st.sph(x, y + .47, z - .02, .11, [0x6b4423, 0xf3d98a, 0x222222][(c >> 3) % 3], 1, 1, .7, 1); },
      puzzle(x, y, z, c) { st.box(x, y, z, .4, .05, .3, c); st.box(x + .08, y + .05, z, .2, .03, .18, tint(c, 1.3)); },
      kite(x, y, z, c) { st.box(x, y, z, .55, .55, .04, c, 0, 0, .785); st.box(x, y - .45, z, .03, .4, .03, 0x6b4a2a); }
    };
    const kinds = ['bear', 'block', 'stack', 'ball', 'car', 'robot', 'duck', 'doll', 'puzzle'];
    function shelf(x, z, len, alongX, face) { // face: Richtung, in die die Regalfront zeigt (+1/-1)
      const w = alongX ? len : .8, d = alongX ? .8 : len;
      st.box(x, 0, z, w, .1, d, DW); for (const y of [1.0, 1.9, 2.8]) st.box(x, y, z, w, .1, d, WOOD);
      if (alongX) { st.box(x - len / 2, 0, z, .1, 3, .8, DW); st.box(x + len / 2, 0, z, .1, 3, .8, DW); st.box(x, 0, z - face * .38, len, 3, .06, 0x6b4a2a); W.addBox(x - len / 2, z - .4, x + len / 2, z + .4, false, 3.2); }
      else { st.box(x, 0, z - len / 2, .8, 3, .1, DW); st.box(x, 0, z + len / 2, .8, 3, .1, DW); st.box(x - face * .38, 0, z, .06, 3, len, 0x6b4a2a); W.addBox(x - .4, z - len / 2, x + .4, z + len / 2, false, 3.2); }
      for (const y of [.1, 1.1, 2.0, 2.9]) {
        const n = Math.floor(len / .55); for (let i = 0; i < n; i++) {
          const t = -len / 2 + .35 + i * (len - .7) / Math.max(1, n - 1), px = alongX ? x + t : x + face * .05, pz = alongX ? z + face * .05 : z + t, k = kinds[(Math.abs(Math.floor(x * 3 + z * 7 + y * 11 + i * 5)) % kinds.length)];
          toy[k](px, y, pz, P[(i * 3 + Math.floor(y * 2) + Math.abs(Math.floor(x))) % P.length], 0);
        }
      }
    }
    shelf(cx - 6.05, cz - 2.5, 4.2, false, 1); shelf(cx - 6.05, cz + 2.4, 4.2, false, 1); shelf(cx + 6.05, cz - 2.5, 4.2, false, -1); shelf(cx + 6.05, cz + 2.4, 4.2, false, -1);
    shelf(cx - 4.4, cz + 6.05, 3.6, true, -1); shelf(cx + 4.4, cz + 6.05, 3.6, true, -1);
    // Theke + Kasse
    st.box(cx, 0, cz + 3.6, 5, 1.1, 1.2, WOOD); st.box(cx, 1.1, cz + 3.6, 5.2, .1, 1.4, DW); st.box(cx - 1.6, 1.2, cz + 3.6, .5, .4, .4, 0x2b2f3a); st.box(cx + 1.4, 1.2, cz + 3.5, .3, .3, .3, 0xff5a8f); st.sph(cx + 1.4, 1.65, cz + 3.5, .12, 0xffd23f, 0);
    W.addBox(cx - 2.5, cz + 3, cx + 2.5, cz + 4.2, false, 1.3);
    // Tisch mit Spielzeug-Eisenbahn in der Mitte
    st.cyl(cx, 0, cz - .5, 2.2, 2.2, .5, WOOD, 16); st.ring(cx, cz - .5, 1.5, 1.8, .55, 0x4a4a55, 24); for (let k = 0; k < 4; k++) { const a = k * .5 + .2; st.box(cx + Math.sin(a) * 1.65, .55, cz - .5 + Math.cos(a) * 1.65, .55, .3, .3, P[k], a + 1.57); }
    toy.bear(cx, .5, cz - .5, 0xc8a27a); W.addCircle(cx, cz - .5, 2.3, false, 1.2);
    // großer Teddy + Schaukelpferd
    st.sph(cx - 4.6, 1.0, cz + 1.2, .9, 0xc8a27a, 1); st.sph(cx - 4.6, 2.2, cz + 1.2, .6, 0xc8a27a, 1); st.sph(cx - 5.05, 2.75, cz + 1.2, .22, 0xc8a27a, 1); st.sph(cx - 4.15, 2.75, cz + 1.2, .22, 0xc8a27a, 1); st.sph(cx - 4.6, 2.1, cz + 1.7, .24, 0xe8d0b0, 1); st.cyl(cx - 4.6, 2.9, cz + 1.2, .5, .5, .1, 0xff5a5a, 10); W.addCircle(cx - 4.6, cz + 1.2, 1.0, false, 3);
    st.box(cx + 3.6, .5, cz - 1.8, .5, .6, 1.3, 0xb87a3a); st.box(cx + 3.6, 1.05, cz - 1.3, .4, .5, .4, 0xb87a3a); st.box(cx + 3.6, 0, cz - 2.2, .1, .25, 1.4, DW, 0, 0, 0); W.addBox(cx + 3.2, cz - 2.6, cx + 4.0, cz - 1.0, false, 1.6);
    // Luftballons unter der Decke
    for (let k = 0; k < 9; k++) { const bx = cx - 4 + (k % 3) * 4 + Math.sin(k) * .6, bz = cz - 4 + Math.floor(k / 3) * 3.6 + Math.cos(k * 2) * .5, by = 3.9 + (k % 2) * .5; st.sph(bx, by, bz, .34, P[k % P.length], 1, 1, 1.2, 1); st.cyl(bx, by - 1.4, bz, .012, .012, 1.1, 0xffffff, 3); }
    W.spots.shop = { x: cx, z: cz, half: 6.4, keeper: { x: cx, z: cz + 5.0 } };
  }
  // Brunnen
  { st.cyl(0, 0, 0, 5.8, 6.2, 1.1, 0xcfd6e2, 20); st.cyl(0, 1.0, 0, 5.2, 5.2, .15, 0x57c4ff, 20); st.cyl(0, .6, 0, 1, 1.3, 2.6, 0xcfd6e2, 10); st.cyl(0, 3.1, 0, 2.2, .6, .5, 0xcfd6e2, 12); st.cyl(0, 3.5, 0, 1.6, 1.6, .1, 0x57c4ff, 12); W.addCircle(0, 0, 6.2, false, 5); W.spots.fountain = { x: 0, z: 0, y: 4 }; }

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
    const fenceX = (xa, xb, z, g0, g1) => { for (let x = xa; x <= xb; x += 3) { if (g0 != null && x > g0 && x < g1) continue; post(x, z); } let a = xa; const seg = (u, v) => { if (v > u) { st.box((u + v) / 2, .4, z, v - u, .12, .14, 0xb07a44); st.box((u + v) / 2, .9, z, v - u, .12, .14, 0xb07a44); W.addBox(u, z - .15, v, z + .15, false, 1.6); } }; if (g0 != null) { seg(xa, g0); seg(g1, xb); } else seg(xa, xb); };
    const fenceZ = (x, za, zb) => { for (let z = za; z <= zb; z += 3) post(x, z); st.box(x, .4, (za + zb) / 2, .14, .12, zb - za, 0xb07a44); st.box(x, .9, (za + zb) / 2, .14, .12, zb - za, 0xb07a44); W.addBox(x - .15, za, x + .15, zb, false, 1.6); };
    fenceX(fx0, fx1, fz0, gate0, gate1); fenceX(fx0, fx1, fz1); fenceZ(fx0, fz0, fz1); fenceZ(fx1, fz0, fz1);
    W.farm = { x0: fx0 + 2, x1: fx1 - 2, z0: fz0 + 2, z1: fz1 - 2 };
    // Scheune
    const bx = -112, bz = 62;
    box(bx, bz, 16, 12, 6, 0xc83d34); st.prism(bx, 6, bz, 17, 4.6, 12.6, 0x8a2b2b, Math.PI / 2 * 0); st.box(bx, 0, bz + 6.05, 5, 4.4, .15, 0xf5ecd8); st.box(bx, 0, bz + 6.1, .3, 4.4, .12, 0xc83d34, 0, 0, 0);
    st.box(bx - 2.5, 0, bz + 6.12, .3, 4.4, .1, 0xc83d34, 0, 0, .0); st.box(bx, 1, bz + 6.14, 5, .25, .1, 0xc83d34, 0, 0, .75); st.box(bx, 1, bz + 6.14, 5, .25, .1, 0xc83d34, 0, 0, -.75);
    solid(bx, bz, 16, 12, 11);
    // Silo
    st.cyl(-96, 0, 60, 2.4, 2.4, 11, 0xdfe6ee, 12); st.sph(-96, 11, 60, 2.4, 0xc83d34, 1, 1, .6, 1); W.addCircle(-96, 60, 2.5, false, 14);
    // Windmühle
    st.cyl(-84, 0, 66, 1.4, 2.2, 9, 0xf3e9d2, 8); st.cone(-84, 9, 66, 2.6, 2.4, 0xc83d34, 8); W.addCircle(-84, 66, 2.3, false, 12);
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
    st.cyl(-160, 9, -36, 3.3, 3.3, .5, 0x333c4a, 12); st.cyl(-160, 9.5, -36, 2, 2, 1.8, 0xfff7c0, 10); st.cone(-160, 11.3, -36, 2.6, 2, 0xe53b3b, 10); W.addCircle(-160, -36, 3.5, false, 14);
    W.spots.lighthouse = { x: -160, z: -36, y: 10.4 };
    // Steg zum Boot (bis z=208)
    st.box(0, .35, 182, 5, .3, 52, 0xb98650); for (let k = 0; k < 21; k++) st.box(-2.4, 0, 158 + k * 2.5, .3, .5, .3, 0x7a5a33), st.box(2.4, 0, 158 + k * 2.5, .3, .5, .3, 0x7a5a33);
    W.addBox(-2.7, 156, -2.2, 209, false, 1.2); W.addBox(2.2, 156, 2.7, 209, false, 1.2);
    st.cyl(-2.1, .6, 207, .2, .2, .6, 0x333c4a, 6); st.cyl(2.1, .6, 207, .2, .2, .6, 0x333c4a, 6); st.cyl(0, 3.4, 207.6, .05, .05, 2, 0xffffff, 4); st.box(.45, 4.0, 207.6, .9, .55, .04, 0xff5a5a);
    W.pier = [-2.7, 150, 2.7, 211]; W.dock = { x: 4.5, z: 209 };
  }
  { // Piratenschiff-Spielplatz am Ost-Strand: Rampe, begehbares Deck, Kanonen, Schatztruhe
    const cx = 162, cz = -37, WD = 0x8a5a33, DK = 0x5b3a1f, SAIL = 0xfff3d6, ry0 = 0;
    st.box(cx, 0, cz + 1, 7.4, 2.2, 22, WD); st.box(cx - 1.5, 0, cz - 12.8, 3.2, 2.2, 5, WD, .5); st.box(cx + 1.5, 0, cz - 12.8, 3.2, 2.2, 5, WD, -.5);
    st.box(cx, 1.4, cz + 1, 7.6, .2, 22.2, DK); st.rect(cx - 3.55, cz - 11, cx + 3.55, cz + 6, 2.22, 0xc8a27a);
    for (let k = 0; k < 9; k++) st.box(cx - 3.8, 1.0, cz - 9 + k * 2.4, .1, .2, .5, 0xffd23f); // Bullaugen-Zierde
    st.box(cx, 2.2, cz + 8.5, 7.4, 1.8, 5, DK); st.box(cx, 4.0, cz + 8.5, 7.8, .25, 5.4, WD); for (const x of [-1.8, 1.8]) st.box(cx + x, 2.9, cz + 5.98, 1.0, .8, .05, 0xa8dcff);
    for (const sx of [-3.55, 3.55]) { st.box(cx + sx, 2.95, cz - 1.8, .14, .12, 15.6, WD); for (let k = 0; k < 6; k++) st.box(cx + sx, 2.2, cz - 9.2 + k * 3, .14, .8, .14, WD); }
    st.cyl(cx, 2.2, cz - 3, .38, .45, 11, 0x6b4423, 8); st.cyl(cx, 9.0, cz - 3, 1.15, .95, .45, DK, 8); st.box(cx, 4.5, cz - 3, 5.8, 3.6, .1, SAIL); st.box(cx, 8.0, cz - 3, 4.2, 2.0, .1, SAIL);
    st.box(cx + .5, 11.0, cz - 3, 1.1, .7, .06, 0x15151c); st.sph(cx + .45, 11.38, cz - 2.95, .17, 0xffffff, 0); st.box(cx + .45, 11.0, cz - 2.95, .5, .06, .04, 0xffffff, 0, 0, .5); st.box(cx + .45, 11.0, cz - 2.95, .5, .06, .04, 0xffffff, 0, 0, -.5);
    st.box(cx, 2.6, cz - 15.4, .25, .25, 4.2, WD, 0, -.3);
    W.ship = { cx, cz, deck: { x0: cx - 3.6, x1: cx + 3.6, z0: cz - 12, z1: cz + 6, y: 2.2 }, ramp: { x0: 153, x1: 158.4, z0: cz + .5, z1: cz + 3.5 }, chest: { x: cx - 2.3, z: cz - 7 }, wheel: { x: cx, z: cz + 5.3 }, cannons: [] };
    for (const z of [cz - 7.5, cz - 3.5, cz + .5]) { st.cyl(cx + 3.55, 2.45, z, .24, .3, 1.3, 0x23262d, 8, 0, 0, Math.PI / 2); st.sph(cx + 3.2, 2.45, z, .22, 0x23262d, 1); st.cyl(cx + 3.0, 2.2, z - .3, .22, .22, .08, 0x6b4423, 8, Math.PI / 2); st.cyl(cx + 3.0, 2.2, z + .3, .22, .22, .08, 0x6b4423, 8, Math.PI / 2); W.ship.cannons.push({ x: cx + 4.2, y: 2.75, z }); }
    st.cyl(cx, 2.2, cz + 5.3, .12, .14, 1.0, 0x6b4423, 6); st.cyl(cx, 3.2, cz + 5.4, .55, .55, .08, 0x6b4423, 12, Math.PI / 2); st.box(cx, 3.2, cz + 5.4, 1.4, .08, .06, 0xffd23f); st.box(cx, 3.2, cz + 5.4, .08, 1.4, .06, 0xffd23f);
    st.box(cx - 2.3, 2.2, cz - 7, 1.1, .6, .7, 0x8a5a33); st.box(cx - 2.3, 2.8, cz - 7, 1.1, .22, .7, 0x6b4423); st.sph(cx - 2.3, 3.0, cz - 7, .4, 0xffd23f, 1, 1, .5, 1); st.box(cx - 2.3, 2.2, cz - 6.64, 1.15, .62, .06, 0xffd23f); st.sph(cx - 2.0, 3.1, cz - 7.1, .12, 0xff5a5a, 0);
    st.box(155.7, 1.02, cz + 2, 5.9, .16, 3, 0xb98650, 0, 0, .387); for (const dz of [-1.5, 1.5]) st.box(155.7, 1.5, cz + 2 + dz, 5.9, .1, .1, WD, 0, 0, .387);
    W.addBox(cx - 3.7, cz - 13.5, cx + 3.7, cz + 12, false, 1.4); W.addBox(cx - 3.7, cz + 6, cx + 3.7, cz + 11, false, 4.4); W.addCircle(cx, cz - 3, .55, false, 12); W.addCircle(cx - 2.3, cz - 7, .75, false, 3.2);
    W.spots.ship = { x: cx, z: cz };
  }
  { // Wohnblock „Haus Sonnenschein“: 4 Wohnungen (Wohnzimmer mit Eltern vorn, Kinderzimmer mit Bett + Kleiderschrank hinten)
    const X0 = -60, FW = 12, N = 4, ZF = -124, ZB = -140, ZI = -132, WH = 3.2, TT = .4, GL = 0xa8dcff, WD = 0x8a5a33, LT = 0xd9b88a;
    const WC = [0xffd6a8, 0xbfe8ff, 0xd8f5c4, 0xffc8e6], RC = [0xe8453c, 0x3f8cff, 0x4cd07d, 0xff8a1f], CAR = [0xff9a9a, 0x9ad0ff, 0xa8e6a8, 0xffc78a], BEDC = [0xff6b6b, 0x4da3ff, 0x6bd67e, 0xb36bff];
    W.pads.push([X0 - 4, ZB - 14, X0 + FW * N + 4, ZF + 6]); W.spots.flats = [];
    st.rect(X0 - 2, ZF, X0 + FW * N + 2, ZF + 5, .035, 0xd9cfb8); // Vorplatz + Weg
    const wall = (x0, x1, z, c, gapA, gapB) => { // Wand entlang x von x0..x1 bei z, optional mit Türlücke gapA..gapB
      const seg = (a, b) => { if (b - a < .05) return; st.box((a + b) / 2, 0, z, b - a, WH, TT, c); W.addBox(a, z - TT / 2, b, z + TT / 2, false, WH); };
      if (gapA == null) seg(x0, x1); else { seg(x0, gapA); seg(gapB, x1); st.box((gapA + gapB) / 2, 2.4, z, gapB - gapA, WH - 2.4, TT, c); }
    };
    for (let i = 0; i < N; i++) {
      const x0 = X0 + FW * i, x1 = x0 + FW, cx = x0 + FW / 2, c = WC[i], dk = 0xb08a64;
      st.rect(x0, ZI, x1, ZF, .05, LT); st.rect(x0, ZB, x1, ZI, .05, CAR[i]);                                  // Böden
      wall(x0, x1, ZB, c, cx + 2.3, cx + 4.1); wall(x0, x1, ZF, c, cx - 1.3, cx + 1.3); wall(x0, x1, ZI, c, cx + 1.4, cx + 3.8);
      st.box(x0, 0, (ZB + ZF) / 2, TT, WH, ZF - ZB, c); W.addBox(x0 - TT / 2, ZB, x0 + TT / 2, ZF, false, WH);
      if (i === N - 1) { st.box(x1, 0, (ZB + ZF) / 2, TT, WH, ZF - ZB, c); W.addBox(x1 - TT / 2, ZB, x1 + TT / 2, ZF, false, WH); }
      // Haustür, Fenster, Fußmatte, Blumenkasten
      st.box(cx - 1.35, 0, ZF + .1, .14, 2.4, .5, WD); st.box(cx + 1.35, 0, ZF + .1, .14, 2.4, .5, WD); st.box(cx, 2.35, ZF + .1, 2.9, .16, .5, WD); st.box(cx, 0, ZF + 1, 2, .04, 1.2, RC[i]);
      for (const sx of [-4, 4]) { st.box(cx + sx, 1.0, ZF + .2, 2.3, 1.4, .08, GL); st.box(cx + sx, .95, ZF + .24, 2.4, .1, .1, 0xffffff); st.box(cx + sx, 1.65, ZF + .24, 2.4, .1, .1, 0xffffff); st.box(cx + sx, 1.0, ZF + .24, .1, 1.4, .1, 0xffffff); st.box(cx + sx, .55, ZF + .6, 2.3, .35, .4, 0x8a5a33); for (let k = 0; k < 5; k++) st.sph(cx + sx - 1 + k * .5, .85, ZF + .6, .16, [0xff5a8a, 0xffd23f, 0xff8a1f][k % 3], 0); }
      st.box(cx - 3.6, 1.5, ZB + .22, 1.8, 1.1, .08, GL); st.box(cx - 3.6, 1.5, ZB + .25, .1, 1.1, .1, 0xffffff);                    // Fenster hinten (über dem Bett)
      // Wohnzimmer: Teppich, Sofa, Fernseher, Esstisch, Pflanze
      st.rect(cx - 3.4, ZF - 6.2, cx + 1.4, ZF - 2.4, .062, 0xff8a8a);
      st.box(cx - 2.6, 0, ZI + 1.0, 3.2, .5, 1.1, 0x4da3ff); st.box(cx - 2.6, .5, ZI + .6, 3.2, .8, .3, 0x3d86e0); st.box(cx - 4.1, .4, ZI + 1.0, .3, .5, 1.1, 0x3d86e0); st.box(cx - 1.1, .4, ZI + 1.0, .3, .5, 1.1, 0x3d86e0); W.addBox(cx - 4.3, ZI + .2, cx - .9, ZI + 1.6, false, 1.2);
      st.box(x1 - 1.0, 0, ZF - 4.2, .7, .6, 2.6, WD); st.box(x1 - 1.0, .6, ZF - 4.2, .16, 1.1, 2.1, 0x23262d); st.box(x1 - 1.1, .68, ZF - 4.2, .04, .94, 1.9, 0x6fd0ff); W.addBox(x1 - 1.4, ZF - 5.5, x1 - .5, ZF - 2.9, false, 1.7);
      st.box(cx + 2.0, .75, ZF - 2.0, 2.2, .1, 1.3, 0xc8a27a); for (const lx of [-.95, .95]) for (const lz of [-.5, .5]) st.box(cx + 2.0 + lx, 0, ZF - 2.0 + lz, .12, .75, .12, 0x8a6a45); st.sph(cx + 2.0, .98, ZF - 2.0, .14, 0xff5a5a, 0); W.addBox(cx + .85, ZF - 2.7, cx + 3.15, ZF - 1.3, false, .9);
      st.cyl(x0 + 1.0, 0, ZF - .9, .3, .22, .5, 0xc2453d, 8); st.sph(x0 + 1.0, 1.0, ZF - .9, .55, 0x3fa84e, 1, 1, 1.2, 1); W.addCircle(x0 + 1.0, ZF - .9, .5, false, 1.6);
      // Kinderzimmer: Bett, Kleiderschrank, Spielkiste, Teppich
      st.rect(cx - 2.2, ZB + 3.6, cx + 2.6, ZB + 6.6, .062, 0xffffff); st.rect(cx - 2.0, ZB + 3.8, cx + 2.4, ZB + 6.4, .066, 0xffd86b);
      st.box(cx - 3.6, 0, ZB + 1.9, 2.1, .45, 3.3, WD); st.box(cx - 3.6, .45, ZB + 2.1, 1.95, .3, 2.9, BEDC[i]); st.box(cx - 3.6, .75, ZB + 1.0, 1.1, .16, .6, 0xffffff); st.box(cx - 3.6, .45, ZB + .35, 2.1, 1.0, .12, WD); st.box(cx - 3.6, .75, ZB + 3.0, 1.9, .06, .9, shadeC(BEDC[i]));
      W.addBox(cx - 4.65, ZB + .2, cx - 2.55, ZB + 3.6, false, 1.0);
      st.box(x1 - .95, 0, ZB + 3.6, 1.4, 2.7, 3.0, 0xb98650); st.box(x1 - 1.66, .1, ZB + 2.9, .06, 2.3, 1.3, 0x8a5a33); st.box(x1 - 1.66, .1, ZB + 4.3, .06, 2.3, 1.3, 0x8a5a33); st.sph(x1 - 1.72, 1.3, ZB + 3.5, .08, 0xffd23f, 0); st.sph(x1 - 1.72, 1.3, ZB + 3.7, .08, 0xffd23f, 0); st.box(x1 - .95, 2.7, ZB + 3.6, 1.5, .1, 3.1, 0x8a5a33); W.addBox(x1 - 1.7, ZB + 2.1, x1 - .2, ZB + 5.1, false, 2.7);
      st.box(cx + 1.2, 0, ZB + 1.1, 1.8, .7, 1.1, 0xe0382b); st.box(cx + 1.2, .7, ZB + 1.1, 1.9, .08, 1.2, 0xc02a20); st.sph(cx + .9, .9, ZB + .9, .22, 0xffd23f, 1); st.box(cx + 1.6, .78, ZB + 1.3, .35, .35, .35, 0x4da3ff); W.addBox(cx + .3, ZB + .5, cx + 2.1, ZB + 1.7, false, .8);
      // Dach (eigenes Mesh, wird innen ausgeblendet)
      roofB.prism(cx, WH, (ZB + ZF) / 2, FW + .8, 2.3, ZF - ZB + 1.6, RC[i], 0); roofB.box(cx, WH - .05, (ZB + ZF) / 2, FW + .6, .12, ZF - ZB + 1.4, shadeC(RC[i]));
      const dz = ZF + 2.6;
      W.spots.flats.push({ i, cx, x0, x1, zF: ZF, zB: ZB, door: { x: cx, z: dz }, bed: { x: cx - 3.6, z: ZB + 2.1 }, ward: { x: x1 - 2.6, z: ZB + 3.6 }, mama: { x: cx - 3.2, z: ZF - 3.2 }, papa: { x: cx + 3.6, z: ZI + 2.0 } });
    }
    W.spots.flatBlock = { x0: X0, x1: X0 + FW * N, zB: ZB, zF: ZF };
    BI.addPlaces(W, st);
    function shadeC(c) { const f = v => Math.max(0, Math.round(v * .8)); return (f((c >> 16) & 255) << 16) | (f((c >> 8) & 255) << 8) | f(c & 255); }
    W.shelter = (x, z) => { const q = W.spots.flatBlock; return x > q.x0 && x < q.x1 && z > q.zB - .5 && z < q.zF + .2 ? 2 : 0; };
  }
  { // Schießbude: eingezäunte Bahn, Fangwand, Theke mit Spielzeug-Blastern – nur Attrappen als Ziele
    const X = -105, FZ = -66, WZ = -100, WOOD = 0xc8803c, DW = 0x8a5a33, RED = 0xe0382b;
    W.pads.push([-115, WZ - 8, -95, FZ + 6]);
    st.rect(X - 8, WZ, X + 8, -70, .035, 0xe6d3a3); st.rect(X - 8, FZ + .6, X + 8, FZ + 1.0, .06, 0xffffff);          // Bahn + Linie
    st.rect(X - 9, -70, X + 9, FZ + 6, .035, 0xd9cfb8);                                                                   // Standfläche
    // Theke + Dach (rot-weiß gestreift)
    st.box(X, 0, -70, 16, 1.1, 1.0, WOOD); st.box(X, 1.1, -70, 16.4, .1, 1.4, DW); W.addBox(X - 8, -70.6, X + 8, -69.4, false, 1.5);
    for (const x of [-8.6, 8.6]) for (const z of [-71.2, -61.5]) st.box(X + x, 0, z, .3, 3.6, .3, DW);
    for (let k = 0; k < 10; k++) st.box(X - 9 + k * 1.8 + .9, 3.6, FZ - .6, 1.8, .3, 10.2, k % 2 ? 0xffffff : RED);
    for (let k = 0; k < 10; k++) st.box(X - 9 + k * 1.8 + .9, 3.2, -71.25, 1.8, .45, .1, k % 2 ? 0xffffff : RED);
    st.box(X, 4.0, FZ - .6, 5.6, 1.9, .3, 0x3f8cff); for (let r = 0; r < 4; r++) st.cyl(X, 4.2, FZ - .8 + r * .05, 1.1 - r * .25, 1.1 - r * .25, .1, [0xffffff, RED, 0xffffff, 0xffd23f][r], 20, Math.PI / 2);
    // Zaun links/rechts + Fangwand + Erdwall
    for (const sx of [-8, 8]) { st.box(X + sx, 0, (-70 + WZ) / 2, .25, 1.7, 30, DW); for (let z = -70; z >= WZ; z -= 5) st.box(X + sx, 0, z, .4, 2.0, .4, 0x6b4a2a); W.addBox(X + sx - .3, WZ, X + sx + .3, -70, false, 2.0); }
    st.box(X, 0, WZ - .6, 17, 6, 1.2, DW); W.addBox(X - 8.5, WZ - 1.2, X + 8.5, WZ, false, 6); st.box(X, 0, WZ - 2.4, 19, 4.4, 2.4, 0x7ab85a, 0);
    for (let k = 0; k < 9; k++) st.sph(X - 8 + k * 2, 0, WZ - .7, 1.0, 0xc2a876, 0, 1, 1.1, .8);                    // Sandsäcke
    // Schilder: Regeln (nur auf Zielscheiben!) – grün mit Zielscheibe, durchgestrichener Mensch gibt es nicht, nur freundliche Symbole
    for (const sx of [-6, 6]) { st.box(X + sx, 0, -69.2, .2, 2.4, .2, DW); st.box(X + sx, 2.4, -69.2, 2.4, 1.5, .15, 0x2f9a4c); st.cyl(X + sx, 2.7, -69.1, .45, .45, .1, 0xffffff, 16, Math.PI / 2); st.cyl(X + sx, 2.75, -69.05, .22, .22, .1, RED, 12, Math.PI / 2); st.box(X + sx - .9, 2.1, -69.1, .6, .12, .05, 0xffffff); st.box(X + sx + .5, 2.1, -69.1, .9, .12, .05, 0xffffff); }
    // Schienen für die Holzenten + Pfosten
    st.box(X, 2.6, -77, 18, .12, .12, 0x6b4a2a); for (const sx of [-8.4, 8.4]) st.box(X + sx, 0, -77, .25, 2.7, .25, DW);
    // Spielzeug-Blaster auf der Theke (Schaumstoff-Blaster, Wasserpistole, Saugnapf-Bogen)
    st.box(X - 5.5, 1.2, -70, .45, .18, .8, 0xff8a1f); st.cyl(X - 5.5, 1.2, -69.4, .1, .1, .5, 0x4da3ff, 8, Math.PI / 2); st.box(X - 5.5, 1.0, -70.2, .14, .3, .16, 0x23262d);
    st.box(X - 4.2, 1.2, -70, .4, .18, .7, 0x4da3ff); st.sph(X - 4.2, 1.45, -70.2, .2, 0xff5ab0, 1); st.cyl(X - 4.2, 1.2, -69.5, .07, .07, .45, 0xffffff, 8, Math.PI / 2);
    st.box(X - 3.0, 1.2, -70, .1, .9, .1, 0x8a5a33, 0, 0, .3); st.box(X - 3.0, 1.2, -70.1, .03, .9, .03, 0xffffff);
    W.spots.range = { x: X, z: FZ, sup: { x: X - 4.6, z: FZ - 1.4 }, lane: { x0: X - 8, x1: X + 8, zNear: -70, zFar: WZ } };
  }

  /* ---------- Bäume, Büsche, Blumen, Steine ---------- */
  /* Bäume: Stamm/Krone/Kegel als Instanzen (je 1 Draw-Call), damit sie einzeln wackeln können */
  W.trees = [];
  const IL = { trunk: [], crown: [], cone: [] }, _im = new THREE.Matrix4(), _iq = new THREE.Quaternion(), _ip = new THREE.Vector3(), _is = new THREE.Vector3();
  function inst(kind, T, x, y, z, sx, sy, sz, color, jit) {
    _im.compose(_ip.set(x, y, z), _iq.identity(), _is.set(sx, sy, sz)); const c = new THREE.Color(color); if (jit) c.multiplyScalar(1 + (rnd() - .5) * jit);
    const e = { m: _im.clone(), c, kind, mesh: null, i: IL[kind].length }; IL[kind].push(e); T.parts.push(e);
  }
  function tree(x, z, kind) {
    const s = rr(.85, 1.3);
    if (kind === 'palm') {
      const lean = rr(-.25, .25), tl = 6 * s;
      st.cyl(x, 0, z, .22 * s, .35 * s, tl * .5, 0xb9824a, 6, lean * .5, 0, lean * .5); st.cyl(x + lean * 1.6, tl * .48, z + lean * 1.6, .17 * s, .22 * s, tl * .55, 0xb9824a, 6, lean, 0, lean);
      const tx = x + lean * 3.4, tz = z + lean * 3.4, ty = tl * .95;
      for (let k = 0; k < 6; k++) { const a = k * 1.047; st.box(tx + Math.sin(a) * 1.5, ty - .2, tz + Math.cos(a) * 1.5, .5, .1, 3.2, pick([0x3fae4a, 0x2f9a3c]), a, .3); }
      st.sph(tx, ty - .2, tz, .45, 0x7a4a2a, 0); W.addCircle(x, z, .5);
      return;
    }
    const T = { x, z, kind, parts: [], hp: 8, cd: 0, wob: 0, wx: 0, wz: 1, tilt: 0, top: kind === 'pine' ? 5 * s : 4 * s, dirty: false };
    if (kind === 'pine') {
      inst('trunk', T, x, 0, z, .85 * s, 1.6 * s, .85 * s, 0x7a5233, 0);
      for (let k = 0; k < 3; k++) inst('cone', T, x, (1.2 + k * 1.5) * s, z, (2.1 - k * .5) * s, 2.4 * s, (2.1 - k * .5) * s, pick([0x2f8f4a, 0x3aa055, 0x2a8044]), .1);
      W.addCircle(x, z, .6);
    } else {
      inst('trunk', T, x, 0, z, s, 2.2 * s, s, 0x8a5a33, 0);
      inst('crown', T, x, 3.2 * s, z, 1.9 * s, 1.9 * s * .9, 1.9 * s, pick([0x4cb85a, 0x5ac966, 0x3fa84e, 0x8ad24f]), .12);
      inst('crown', T, x + .8 * s, 4 * s, z - .5 * s, 1.2 * s, 1.2 * s * .9, 1.2 * s, pick([0x5ac966, 0x6bd677]), .12);
      W.addCircle(x, z, .65);
    }
    W.trees.push(T);
  }
  function finalizeTrees() {
    const flat = g => { const n = g.toNonIndexed(); n.computeVertexNormals(); return n; };
    const geos = { trunk: flat(new THREE.CylinderGeometry(.3, .42, 1, 6).translate(0, .5, 0)), crown: flat(new THREE.IcosahedronGeometry(1, 1)), cone: flat(new THREE.ConeGeometry(1, 1, 7).translate(0, .5, 0)) };
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    for (const k of ['trunk', 'crown', 'cone']) {
      const list = IL[k]; if (!list.length) continue; const m = new THREE.InstancedMesh(geos[k], mat, list.length); m.frustumCulled = false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      list.forEach((e, i) => { m.setMatrixAt(i, e.m); m.setColorAt(i, e.c); e.mesh = m; }); scene.add(m);
    }
  }
  const _a = new THREE.Matrix4(), _r = new THREE.Matrix4(), _b = new THREE.Matrix4(), _ax = new THREE.Vector3(), _touch = new Set();
  /* Baum um den Fuß kippen (ang) – Kipprichtung ist die Schlagrichtung (wx,wz) */
  function poseTree(T, ang) {
    _ax.set(T.wz, 0, -T.wx).normalize(); _r.makeRotationAxis(_ax, ang); _a.makeTranslation(T.x, 0, T.z).multiply(_r).multiply(_b.makeTranslation(-T.x, 0, -T.z));
    for (const e of T.parts) { e.mesh.setMatrixAt(e.i, _im.multiplyMatrices(_a, e.m)); _touch.add(e.mesh); }
  }
  W.updateTrees = function (dt, t) {
    for (const T of W.trees) {
      if (T.cd > 0) T.cd -= dt;
      const target = T.cd > 0 ? .35 : 0, dtl = target - T.tilt;
      if (T.wob <= 0 && Math.abs(dtl) < .002) { if (T.dirty) { T.tilt = target; poseTree(T, T.tilt); T.dirty = false; } continue; }
      T.dirty = true; T.wob = Math.max(0, T.wob - dt * 1.1); T.tilt += dtl * Math.min(1, dt * 3); poseTree(T, T.tilt + T.wob * .25 * Math.sin(t * 22));
    }
    for (const m of _touch) m.instanceMatrix.needsUpdate = true; _touch.clear();
  };
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
  finalizeTrees();
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
  W.flatRoof = roofB.mesh(BI.mat()); W.flatRoof.frustumCulled = false; scene.add(W.flatRoof);
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
  W.groundY = (x, z) => {
    for (const t of W.stations) if (x > t.plat[0] && x < t.plat[2] && z > t.plat[1] && z < t.plat[3]) return .2;
    const S = W.ship; if (S) { const d = S.deck, r = S.ramp; if (x > d.x0 && x < d.x1 && z > d.z0 && z < d.z1) return d.y; if (x > r.x0 && x < r.x1 && z > r.z0 && z < r.z1) return d.y * (x - r.x0) / (r.x1 - r.x0); }
    if (Math.abs(x) < 2.5 && z > 156 && z < 208) return .65;
    return 0;
  };
  W.onDeck = (x, z) => { const S = W.ship; return x > S.deck.x0 && x < S.deck.x1 && z > S.deck.z0 && z < S.deck.z1; };
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
    const k = S / (2 * K.MAP), cx = S / 2, cy = S / 2, X = x => cx + x * k, Y = z => cy + z * k;
    ctx.fillStyle = '#3aa8e8'; ctx.fillRect(0, 0, S, S);
    ctx.fillStyle = '#f3dfa2'; ctx.beginPath(); ctx.arc(cx, cy, 180 * k, 0, BI.TAU); ctx.fill();
    ctx.fillStyle = '#86d36a'; ctx.beginPath(); ctx.arc(cx, cy, 166 * k, 0, BI.TAU); ctx.fill();
    ctx.fillStyle = '#4db6f0'; ctx.beginPath(); ctx.arc(X(LAKE.x), Y(LAKE.z), LAKE.r * k, 0, BI.TAU); ctx.fill();
    ctx.strokeStyle = '#6a717c'; ctx.lineWidth = Math.max(2, K.ROAD * k); ctx.lineCap = 'butt';
    for (const r of [K.RR, K.RA, K.RB]) { ctx.beginPath(); ctx.arc(cx, cy, r * k, 0, BI.TAU); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(X(-156), Y(0)); ctx.lineTo(X(156), Y(0)); ctx.moveTo(X(0), Y(-156)); ctx.lineTo(X(0), Y(156)); ctx.stroke();
    ctx.strokeStyle = '#3b3f48'; ctx.lineWidth = 1.5; ctx.setLineDash([3, 2]); ctx.beginPath(); const T = W.track; for (let i = 0; i <= T.N; i += 4) { const j = i % T.N; i ? ctx.lineTo(X(T.X[j]), Y(T.Z[j])) : ctx.moveTo(X(T.X[j]), Y(T.Z[j])); } ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#e8d6c0'; for (const b of W.boxes) if (b.x1 - b.x0 > 5 && b.z1 - b.z0 > 5) ctx.fillRect(X(b.x0), Y(b.z0), (b.x1 - b.x0) * k, (b.z1 - b.z0) * k);
    ctx.fillStyle = '#ffb45a'; ctx.fillRect(X(-34), Y(20), 14 * k, 14 * k);
    const mark = (x, z, e) => { ctx.font = Math.round(S * .075) + 'px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(e, X(x), Y(z)); };
    mark(56, -50, '🏥'); mark(-56, -50, '🚓'); mark(56, 50, '🚒'); for (const t of W.stations) mark(t.px, t.pz, t.icon); mark(100, -62, '🚁'); mark(-112, 62, '🚜'); mark(-59, 56, '🛝'); mark(27, 27, '🍦'); mark(0, 0, '⛲'); mark(-27, 27, '🧸'); mark(162, -37, '🏴‍☠️'); mark(-105, -84, '🎯'); mark(-36, -133, '🏠'); mark(4.5, 214, '⛵'); ctx.fillStyle = '#b98650'; ctx.fillRect(X(-2.5), Y(156), 5 * k, 52 * k);
  };
  return W;
};
