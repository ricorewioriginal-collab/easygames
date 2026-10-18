/* AnMaCha UNDERCOVER 3D – statische Kartenszene. AMU.WorldMap.build(map, quality) → { group, grid, doors, gates, glowGeo, jagen, ext, dispose }
   Alles Unbewegliche wird zu wenigen Geometrien zusammengefügt: Boden (1), Wände/Requisiten (1), Leuchtteile (1),
   Raumnamen (1), Umgebung (1), dazu Türflügel als InstancedMesh (1). Stations-Bildschirme sind Tags im Leucht-Mesh und
   werden vom Renderer bei Bedarf umgefärbt (eigene offene/erledigte Aufgaben). 1 Zelle = 1 Einheit, Sim (x, y) → (X, Z). */
(function (root) {
  'use strict';
  const AMU = root.AMU = root.AMU || {};
  const T = root.THREE;
  const PI = Math.PI;

  // Kartenbezogene Gestaltung (Umgebung, Gänge, Raumtönungen)
  const ART = {
    funkhaus: { ground: '#0a1128', hall: '#232c4a' },
    radiocity: { ground: '#0d0f24', hall: '#25284a', grid: true },
    express: { ground: '#1a1d22', hall: '#3a3330', rails: true },
    festival: { ground: '#1e3a1c', hall: '#5c5340' },
    insel: { ground: '#0f4a66', hall: '#b8955e', tint: { huette: '#9c7a52', generator: '#6f6a60', leuchtturm: '#b0a28c', bar: '#9c7a52', hoehle: '#5e544a', steg: '#8d6b46', strand: '#d6b878' } },
    orbital: { ground: '#03050d', hall: '#262d40', stars: true }
  };
  const WOOD = '#8a5a3a', METAL = '#7d889e', DARK = '#1c2133', GREEN = '#3f9a4a';
  let ringThin = null;

  function build(map, quality) {
    const K = AMU.WorldKit, M = K.mats(), q = K.qOf(quality), th = map.theme, art = ART[map.id] || {};
    const G = AMU.Grid.compile(map), W = G.W, H = G.H, fl = G.floor;
    const isF = (x, y) => x >= 0 && y >= 0 && x < W && y < H && fl[y * W + x] === 1;
    const indoor = !map.outdoor;
    const WH = indoor ? 1.75 : 1.2, LOW = indoor ? 0.42 : 0.55, TK = 0.3, CAP = 0.07;
    const group = new T.Group(); group.name = 'amu-map';
    const geos = [], texs = [];
    const solid = K.builder(q), glow = K.builder(q);
    const rnd = K.rand(K.hash(map.id));
    const wallCol = K.shade(th.wall, indoor ? 1.9 : 1.6), capCol = K.mix(th.wallTop, th.wall, 0.15);
    const accent = th.accent, accDim = K.mix(accent, '#000000', 0.2);

    // ---------- Boden: je Zelle ein Quad, Schachbrett-Nuance + Eckenverdunklung an Wänden ----------
    const roomCol = map.rooms.map((rm, i) => (art.tint && art.tint[rm.k]) || (i % 2 ? th.floor2 : th.floor));
    const hallCol = art.hall || K.shade(K.mix(th.floor, th.wall, 0.35), 0.9);
    {
      let n = 0; for (let c = 0; c < W * H; c++) n += fl[c];
      const pos = new Float32Array(n * 12), nor = new Float32Array(n * 12), col = new Float32Array(n * 12), uv = new Float32Array(n * 8);
      const idx = n * 4 > 65535 ? new Uint32Array(n * 6) : new Uint16Array(n * 6);
      const cc = new T.Color(), tmp = new T.Color();
      const ao = (cx, cy) => { let k = 0; if (!isF(cx - 1, cy - 1)) k++; if (!isF(cx, cy - 1)) k++; if (!isF(cx - 1, cy)) k++; if (!isF(cx, cy)) k++; return 1 - 0.14 * k; };
      let v = 0, i = 0;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const c = y * W + x; if (!fl[c]) continue;
        const r = G.room[c]; cc.set(r >= 0 ? roomCol[r] : hallCol);
        const chk = (x + y) & 1 ? 0.94 : 1;
        const cs = [[x, y], [x + 1, y], [x + 1, y + 1], [x, y + 1]];
        for (let k = 0; k < 4; k++) {
          const o = (v + k) * 3, f = chk * ao(cs[k][0], cs[k][1]);
          pos[o] = cs[k][0]; pos[o + 1] = 0; pos[o + 2] = cs[k][1]; nor[o + 1] = 1;
          tmp.copy(cc).multiplyScalar(f); col[o] = tmp.r; col[o + 1] = tmp.g; col[o + 2] = tmp.b;
          uv[(v + k) * 2] = k === 1 || k === 2 ? 1 : 0; uv[(v + k) * 2 + 1] = k >= 2 ? 0 : 1;
        }
        idx[i++] = v; idx[i++] = v + 3; idx[i++] = v + 1; idx[i++] = v + 1; idx[i++] = v + 3; idx[i++] = v + 2;
        v += 4;
      }
      const g = new T.BufferGeometry();
      g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setAttribute('normal', new T.BufferAttribute(nor, 3));
      g.setAttribute('color', new T.BufferAttribute(col, 3)); g.setAttribute('uv', new T.BufferAttribute(uv, 2));
      g.setIndex(new T.BufferAttribute(idx, 1)); g.computeBoundingSphere();
      const m = new T.Mesh(g, M.floor); m.receiveShadow = true; m.name = 'floor';
      group.add(m); geos.push(g);
    }

    // ---------- Umgebung ----------
    {
      const pad = 70, g = new T.PlaneGeometry(W + pad * 2, H + pad * 2); g.rotateX(-PI / 2); g.translate(W / 2, -0.03, H / 2);
      const mat = new T.MeshLambertMaterial({ color: art.ground || K.shade(th.sky, 1.6) });
      if (art.rails || art.grid) {
        const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
        x.fillStyle = art.rails ? '#ffffff' : '#9a9aa8'; x.fillRect(0, 0, 64, 64);
        if (art.rails) { x.fillStyle = '#7a6a58'; for (let k = 0; k < 64; k += 16) x.fillRect(k, 0, 6, 64); }
        else { x.fillStyle = '#ffffff'; x.fillRect(0, 0, 64, 2); x.fillRect(0, 0, 2, 64); }
        const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set((W + pad * 2) / (art.rails ? 4 : 2), (H + pad * 2) / (art.rails ? 4 : 2));
        mat.map = t; texs.push(t);
      }
      const m = new T.Mesh(g, mat); m.name = 'ground'; m.receiveShadow = true;
      group.add(m); geos.push(g); group.userData.groundMat = mat;
      if (art.stars) {
        const n = q === 'low' ? 220 : 420, p = new Float32Array(n * 3);
        for (let k = 0; k < n; k++) { p[k * 3] = W / 2 + (rnd() - 0.5) * (W + 120); p[k * 3 + 1] = -2 - rnd() * 8; p[k * 3 + 2] = H / 2 + (rnd() - 0.5) * (H + 120); }
        const sg = new T.BufferGeometry(); sg.setAttribute('position', new T.BufferAttribute(p, 3));
        const sm = new T.PointsMaterial({ color: 0xcfe3ff, size: 2, sizeAttenuation: false });
        const pts = new T.Points(sg, sm); group.add(pts); geos.push(sg); group.userData.starMat = sm;
      }
    }

    // ---------- Wände: Kanten Boden/Nicht-Boden, zu Lauflängen zusammengefasst; Südwände niedrig (Blick der Kamera) ----------
    solid.at(0, 0, 0); glow.at(0, 0, 0);
    function wall(x0, z0, x1, z1, h) {
      const w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
      solid.add('box', wallCol, cx, (h - CAP) / 2, cz, w, h - CAP, d, 0, 0, 0, 0.55);
      glow.add('box', capCol, cx, h - CAP / 2, cz, w + 0.002, CAP, d + 0.002);
    }
    for (let y = 0; y < H; y++) {
      for (const dir of [-1, 1]) {
        let x = 0;
        while (x < W) {
          if (isF(x, y) && !isF(x, y + dir)) {
            const s = x; while (x < W && isF(x, y) && !isF(x, y + dir)) x++;
            const e0 = !isF(s - 1, y) ? TK : 0, e1 = !isF(x, y) ? TK : 0;
            if (dir < 0) wall(s - e0, y - TK, x + e1, y, WH); else wall(s - e0, y + 1, x + e1, y + 1 + TK, LOW);
          } else x++;
        }
      }
    }
    for (let x = 0; x < W; x++) {
      for (const dir of [-1, 1]) {
        let y = 0;
        while (y < H) {
          if (isF(x, y) && !isF(x + dir, y)) {
            const s = y; while (y < H && isF(x, y) && !isF(x + dir, y)) y++;
            const e0 = !isF(x, s - 1) ? TK : 0, e1 = !isF(x, y) ? TK : 0;
            // Am Südende (zur Kamera) nur bis zur niedrigen Wand hochziehen
            if (dir < 0) wall(x - TK, s - e0, x, y + e1, WH); else wall(x + 1, s - e0, x + 1 + TK, y + e1, WH);
          } else y++;
        }
      }
    }

    // ---------- Belegte Zellen (keine Deko darauf) ----------
    const used = new Uint8Array(W * H);
    const mark = (px, py, r) => { r = r == null ? 1 : r; const cx = Math.floor(px), cy = Math.floor(py); for (let yy = cy - r; yy <= cy + r; yy++) for (let xx = cx - r; xx <= cx + r; xx++) if (xx >= 0 && yy >= 0 && xx < W && yy < H) used[yy * W + xx] = 1; };
    map.stations.forEach(s => mark(s.at[0], s.at[1]));
    (map.vents || []).forEach(v => { mark(v[0], v[1]); mark(v[2], v[3]); });
    (map.hides || []).forEach(h => mark(h.at[0], h.at[1]));
    (map.exits || []).forEach(p => mark(p[0], p[1]));
    if (map.cage) mark(map.cage[0], map.cage[1], 2);
    mark(map.button[0], map.button[1], 2); mark(map.spawn[0], map.spawn[1]);
    Object.values(map.repairs || {}).forEach(r => (Array.isArray(r[0]) ? r : [r]).forEach(p => mark(p[0], p[1])));
    (map.features || []).forEach(f => { if (f.a) { mark(f.a[0], f.a[1]); mark(f.b[0], f.b[1]); } if (f.at) mark(f.at[0], f.at[1]); if (f.type === 'gate') for (let yy = f.r[1]; yy < f.r[1] + f.r[3]; yy++) for (let xx = f.r[0]; xx < f.r[0] + f.r[2]; xx++) mark(xx + 0.5, yy + 0.5); });
    G.doors.forEach(d => d.cells.forEach(c => mark(c % W + 0.5, Math.floor(c / W) + 0.5)));

    /** Blickrichtung weg von der nächsten Wand (Vorderseite = lokale +Z-Achse). */
    function faceAway(px, py) {
      const cx = Math.floor(px), cy = Math.floor(py);
      const dirs = [[0, -1, 0], [0, 1, PI], [-1, 0, PI / 2], [1, 0, -PI / 2]];
      let best = 0, bd = 9;
      dirs.forEach((d, i) => { for (let k = 1; k <= 3; k++) if (!isF(cx + d[0] * k, cy + d[1] * k)) { if (k < bd) { bd = k; best = i; } break; } });
      return bd > 3 ? 0 : dirs[best][2];
    }

    // ---------- Stationen ----------
    const consoleCol = K.mix(th.wall, '#a8b2cc', 0.6);
    map.stations.forEach((s, i) => {
      const ry = faceAway(s.at[0], s.at[1]);
      solid.at(s.at[0], s.at[1], ry);
      solid.add('box', consoleCol, 0, 0.37, -0.05, 0.78, 0.74, 0.5, 0, 0, 0, 0.45);
      solid.add('box', K.shade(consoleCol, 0.7), 0, 0.78, 0.02, 0.84, 0.08, 0.5, 0.45);
      solid.add('box', DARK, 0, 1.02, -0.26, 0.78, 0.42, 0.06);
      glow.at(s.at[0], s.at[1], ry);
      glow.add('box', accDim, 0, 0.84, 0.045, 0.66, 0.02, 0.36, 0.45, 0, 0, 0, 's' + i);
      glow.add('box', accDim, 0, 1.04, -0.225, 0.66, 0.3, 0.01, 0, 0, 0, 0, 's' + i);
    });

    // ---------- Notruf-Pult ----------
    {
      const [bx, by] = map.button;
      solid.at(bx, by, 0);
      solid.add('cyl', '#2c3246', 0, 0.04, 0, 1.6, 0.08, 1.6);
      solid.add('cyl', '#d4d8e4', 0, 0.45, 0, 0.6, 0.76, 0.6, 0, 0, 0, 0.45);
      solid.add('cyl', '#ffc93c', 0, 0.86, 0, 0.78, 0.08, 0.78);
      glow.at(bx, by, 0);
      glow.add('hemi', '#ff2a3c', 0, 0.89, 0, 0.5, 0.36, 0.5);
      glow.add('ring', '#ffc93c', 0, 0.09, 0, 1.5, 1.5, 0.6, PI / 2);
    }

    // ---------- Geheimgänge (Bodenklappen), Aufzüge, Kameras ----------
    (map.vents || []).forEach(v => [[v[0], v[1]], [v[2], v[3]]].forEach(p => {
      solid.at(p[0], p[1], 0);
      solid.add('box', '#3b4459', 0, 0.025, 0, 0.92, 0.05, 0.92);
      for (let k = -1.5; k <= 1.5; k++) solid.add('box', '#121624', 0, 0.035, k * 0.19, 0.74, 0.05, 0.08);
    }));
    (map.features || []).forEach(f => {
      if (f.type === 'lift') [f.a, f.b].forEach(p => {
        solid.at(p[0], p[1], 0);
        solid.add('cyl', '#596580', 0, 0.035, 0, 1.6, 0.07, 1.6);
        solid.add('box', METAL, 0.85, 0.8, 0, 0.12, 1.6, 0.12); solid.add('box', METAL, -0.85, 0.8, 0, 0.12, 1.6, 0.12);
        glow.at(p[0], p[1], 0);
        glow.add('ring', accent, 0, 0.08, 0, 1.3, 1.3, 0.5, PI / 2);
        glow.add('sph', accent, 0.85, 1.66, 0, 0.16); glow.add('sph', accent, -0.85, 1.66, 0, 0.16);
      });
      if (f.type === 'cams') {
        const ry = faceAway(f.at[0], f.at[1]);
        solid.at(f.at[0], f.at[1], ry);
        solid.add('box', consoleCol, 0, 0.37, -0.05, 1.3, 0.74, 0.5, 0, 0, 0, 0.45);
        solid.add('box', DARK, 0, 1.05, -0.26, 1.3, 0.5, 0.06);
        glow.at(f.at[0], f.at[1], ry);
        for (let k = -1; k <= 1; k++) glow.add('box', k ? '#5fd38a' : accent, k * 0.42, 1.06, -0.225, 0.36, 0.38, 0.01);
        map.rooms.forEach(rm => {
          const [rx, rz] = rm.r;
          solid.at(rx + 0.45, rz + 0.3, PI / 4);
          solid.add('box', '#2a3045', 0, WH - 0.3, 0, 0.22, 0.18, 0.32);
          solid.add('box', METAL, 0, WH - 0.15, -0.1, 0.05, 0.2, 0.05);
          glow.at(rx + 0.45, rz + 0.3, PI / 4);
          glow.add('sph', '#ff3040', 0.07, WH - 0.24, 0.17, 0.06);
        });
      }
    });

    // ---------- Verstecke ----------
    const leafy = map.id === 'insel' || map.id === 'festival';
    (map.hides || []).forEach(h => {
      const ry = faceAway(h.at[0], h.at[1]);
      solid.at(h.at[0], h.at[1], ry);
      if (leafy) {
        solid.add('ico', '#2f7a3a', 0, 0.45, 0, 1.1, 0.9, 1.0); solid.add('ico', '#3f9a4a', 0.25, 0.7, 0.1, 0.7);
      } else {
        const c = K.mix(th.wall, '#9aa6c0', 0.5);
        solid.add('box', c, 0, 0.68, -0.05, 0.9, 1.36, 0.6, 0, 0, 0, 0.35);
        solid.add('box', K.shade(c, 0.6), 0, 0.68, 0.26, 0.03, 1.2, 0.02);
        solid.add('box', '#d8dde8', 0.12, 0.75, 0.27, 0.04, 0.18, 0.03); solid.add('box', '#d8dde8', -0.12, 0.75, 0.27, 0.04, 0.18, 0.03);
        for (let k = 0; k < 3; k++) solid.add('box', K.shade(c, 0.55), 0.25, 1.15 - k * 0.06, 0.26, 0.24, 0.02, 0.02);
      }
    });

    // ---------- Raumdeko ----------
    const P = props(solid, glow, th, K);
    const DECO = {
      studio: ['mixer', 'speaker', 'plant', 'lamp', 'speaker'], roof: ['antenna', 'acunit', 'crate', 'antenna'], office: ['desk', 'desk', 'plant', 'shelf'],
      lobby: ['plant', 'sofa', 'lamp', 'plant'], control: ['console', 'rack', 'desk', 'console'], lounge: ['sofa', 'table', 'plant', 'lamp'],
      archive: ['shelf', 'shelf', 'crate', 'shelf'], tech: ['rack', 'barrel', 'crate', 'reel'], tower: ['antenna', 'rack', 'crate'],
      server: ['rack', 'rack', 'console', 'rack'], club: ['booth', 'speaker', 'lamp', 'speaker'], plaza: ['lamp', 'bench', 'plant', 'lamp'],
      food: ['counter', 'table', 'plant', 'table'], cab: ['console', 'rack', 'lamp'], engine: ['engine', 'barrel', 'rack', 'reel'],
      stage: ['speaker', 'truss', 'speaker', 'truss'], field: ['hay', 'flag', 'lamp', 'hay'], camp: ['tent', 'fire', 'tent', 'crate'],
      beach: ['palm', 'umbrella', 'palm', 'crate'], cave: ['rock', 'crystal', 'rock', 'crate'], dock: ['bollard', 'crate', 'barrel', 'bollard'],
      hub: ['console', 'lamp', 'plant'], lab: ['labbench', 'rack', 'labbench', 'plant'], garden: ['planter', 'plant', 'planter']
    };
    const RUG = { studio: 1, lounge: 1, lobby: 1, office: 1, control: 1, archive: 1, club: 2, plaza: 2, hub: 2, stage: 3 };
    map.rooms.forEach((rm, ri) => {
      const [rx, rz, rw, rh] = rm.r, list = DECO[rm.deco] || ['crate', 'plant'];
      // Raumname-Bereich (unten links) freihalten
      for (let xx = rx; xx < Math.min(rx + rw, rx + 1 + Math.ceil(rm.n.length * 0.36)); xx++) used[(rz + rh - 1) * W + xx] = 1;
      const cand = [];
      for (let y = rz; y < rz + rh; y++) for (let x = rx; x < rx + rw; x++) {
        if (x !== rx && x !== rx + rw - 1 && y !== rz && y !== rz + rh - 1) continue;
        if (used[y * W + x] || !isF(x, y)) continue;
        cand.push([x + 0.5, y + 0.5]);
      }
      for (let k = cand.length - 1; k > 0; k--) { const j = Math.floor(rnd() * (k + 1)); const t = cand[k]; cand[k] = cand[j]; cand[j] = t; }
      const want = Math.max(2, Math.min(7, Math.round(rw * rh / 13)));
      const placed = []; let ti = Math.floor(rnd() * list.length);
      for (const c of cand) {
        if (placed.length >= want) break;
        if (placed.some(p => Math.max(Math.abs(p[0] - c[0]), Math.abs(p[1] - c[1])) < 2)) continue;
        placed.push(c);
        const kind = list[ti++ % list.length], ry = faceAway(c[0], c[1]);
        solid.at(c[0], c[1], ry); glow.at(c[0], c[1], ry);
        (P[kind] || P.crate)(rnd);
      }
      // flache Teppiche/Bodenlichter (begehbar)
      const rug = RUG[rm.deco], cx = rx + rw / 2, cz = rz + rh / 2;
      solid.at(cx, cz, 0); glow.at(cx, cz, 0);
      if (rug === 1) solid.add('box', K.shade(K.mix(roomCol[ri], accent, 0.08), 0.82), 0, 0.006, 0, Math.min(rw - 4, 6), 0.012, Math.min(rh - 4, 4));
      else if (rug === 2) { glow.add('ring', K.mix(accent, roomCol[ri], 0.35), 0, 0.012, 0, Math.min(rw, rh) * 0.5, Math.min(rw, rh) * 0.5, 0.05, PI / 2); glow.add('ring', K.mix(th.wallTop, roomCol[ri], 0.4), 0, 0.012, 0, Math.min(rw, rh) * 0.32, Math.min(rw, rh) * 0.32, 0.05, PI / 2); }
      else if (rug === 3) { solid.add('box', K.mix(th.wall, '#4a4f66', 0.5), 0, 0.006, -rh * 0.15, rw - 3, 0.012, rh * 0.45); glow.add('box', th.wallTop, 0, 0.014, -rh * 0.15 + rh * 0.225, rw - 3, 0.012, 0.08); }
      if (rm.deco === 'studio' && indoor) { glow.at(rx + rw / 2, rz + 0.05, 0); glow.add('box', '#ff3448', 0, 1.25, 0.02, 1.2, 0.34, 0.04); }
    });

    // ---------- Türen: Rahmen (statisch) + Flügel (InstancedMesh) ----------
    const doors = [], gates = [];
    const frameCol = K.mix(th.wall, '#b8c2d8', 0.35);
    G.doors.forEach(d => {
      if (d.gate != null) return;
      const xs = d.cells.map(c => c % W), ys = d.cells.map(c => Math.floor(c / W));
      let line, a0, a1, low;
      if (d.axis === 'x') {
        const cx = xs[0]; line = G.room[ys[0] * W + cx - 1] === d.room ? cx : cx + 1; a0 = Math.min(...ys); a1 = Math.max(...ys) + 1; low = false;
      } else {
        const cy = ys[0], above = G.room[(cy - 1) * W + xs[0]] === d.room; line = above ? cy : cy + 1; a0 = Math.min(...xs); a1 = Math.max(...xs) + 1; low = above;
      }
      const h = low ? Math.max(LOW, 0.42) : WH, len = a1 - a0, mid = (a0 + a1) / 2;
      const P2 = (u, y, v, su, sy, sv) => d.axis === 'x' ? [line + v, y, u, sv, sy, su] : [u, y, line + v, su, sy, sv];
      const add = (b, col, u, y, su, sy, sv) => { const p = P2(u, y, 0, su, sy, sv); b.add('box', col, p[0], p[1], p[2], p[3], p[4], p[5]); };
      solid.at(0, 0, 0); glow.at(0, 0, 0);
      add(solid, frameCol, a0 - TK / 2, h / 2, TK + 0.04, h, TK + 0.1);
      add(solid, frameCol, a1 + TK / 2, h / 2, TK + 0.04, h, TK + 0.1);
      if (!low) { add(solid, frameCol, mid, h - 0.13, len + 0.02, 0.26, TK + 0.1); add(glow, accent, mid, h - 0.3, len, 0.05, TK + 0.12); }
      doors.push({ id: d.id, axis: d.axis, line, a0, a1, h: low ? h : h - 0.26, o: 1 });
    });
    let doorMesh = null;
    if (doors.length) {
      const dm = new T.MeshLambertMaterial({ color: K.mix(th.wallTop, '#ffffff', 0.15), emissive: K.shade(th.wallTop, 0.25) });
      doorMesh = new T.InstancedMesh(K.protos(q).box, dm, doors.length * 2); doorMesh.name = 'doors';
      doorMesh.castShadow = true; doorMesh.userData.mat = dm;
      group.add(doorMesh);
    }
    // Zeitgesteuerte Tore (Kupplungstür, Flut): Energiefeld bzw. Wasser
    G.doors.forEach(d => {
      if (d.gate == null) return;
      const f = map.features[d.gate], r = f.r, water = /flut/i.test(f.n);
      const alongX = isF(r[0] - 1, r[1]) && isF(r[0] + r[2], r[1]);
      let mesh;
      if (water) {
        mesh = new T.Mesh(K.protos(q).box, M.water); mesh.position.set(r[0] + r[2] / 2, 0, r[1] + r[3] / 2); mesh.scale.set(r[2], 0.5, r[3]);
      } else {
        const mat = new T.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.42, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide });
        mesh = new T.Mesh(K.protos(q).box, mat); mesh.userData.own = mat;
        if (alongX) { mesh.position.set(r[0] + r[2] / 2, 0, r[1] + r[3] / 2); mesh.scale.set(0.12, WH, r[3]); }
        else { mesh.position.set(r[0] + r[2] / 2, 0, r[1] + r[3] / 2); mesh.scale.set(r[2], WH, 0.12); }
        solid.at(0, 0, 0);
        const ends = alongX ? [[mesh.position.x, r[1] - 0.1], [mesh.position.x, r[1] + r[3] + 0.1]] : [[r[0] - 0.1, mesh.position.z], [r[0] + r[2] + 0.1, mesh.position.z]];
        ends.forEach(e => { solid.add('box', frameCol, e[0], WH / 2, e[1], 0.3, WH, 0.3); glow.at(0, 0, 0); glow.add('box', accent, e[0], WH + 0.04, e[1], 0.32, 0.06, 0.32); });
      }
      mesh.userData.h = mesh.scale.y; mesh.name = 'gate';
      group.add(mesh);
      gates.push({ id: d.id, mesh, water, o: 1 });
    });

    // ---------- Raumnamen (ein Atlas, ein Mesh) ----------
    {
      const at = K.textAtlas(map.rooms.map(r => r.n), '#ffffff'); texs.push(at.tex);
      const n = map.rooms.length, pos = new Float32Array(n * 12), uv = new Float32Array(n * 8), idx = new Uint16Array(n * 6);
      map.rooms.forEach((rm, i) => {
        const [rx, rz, , rh] = rm.r, u = at.uv[i], hh = 0.62, ww = Math.min(rm.r[2] - 1, hh * u[4]), x0 = rx + 0.45, z1 = rz + rh - 0.25, z0 = z1 - hh * (ww / (hh * u[4]));
        const xs = [x0, x0 + ww, x0 + ww, x0], zs = [z0, z0, z1, z1], us = [u[0], u[2], u[2], u[0]], vs = [u[3], u[3], u[1], u[1]];
        for (let k = 0; k < 4; k++) { pos[(i * 4 + k) * 3] = xs[k]; pos[(i * 4 + k) * 3 + 1] = 0.02; pos[(i * 4 + k) * 3 + 2] = zs[k]; uv[(i * 4 + k) * 2] = us[k]; uv[(i * 4 + k) * 2 + 1] = vs[k]; }
        idx.set([i * 4, i * 4 + 3, i * 4 + 1, i * 4 + 1, i * 4 + 3, i * 4 + 2], i * 6);
      });
      const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setAttribute('uv', new T.BufferAttribute(uv, 2)); g.setIndex(new T.BufferAttribute(idx, 1));
      g.computeBoundingSphere();
      const mat = new T.MeshBasicMaterial({ map: at.tex, transparent: true, opacity: 0.5, depthWrite: false, color: K.mix('#ffffff', accent, 0.25) });
      const m = new T.Mesh(g, mat); m.renderOrder = 1; m.name = 'labels'; m.userData.own = mat;
      group.add(m); geos.push(g);
    }

    // ---------- Verstecken & Jagen: Ausgänge + Käfig (nur in diesem Modus sichtbar) ----------
    const jagen = new T.Group(); jagen.name = 'jagen'; jagen.visible = false;
    {
      const js = K.builder(q), jg = K.builder(q);
      (map.exits || []).forEach(p => {
        const ry = faceAway(p[0], p[1]);
        js.at(p[0], p[1], ry); jg.at(p[0], p[1], ry);
        js.add('box', '#3a4258', 0.75, 0.95, -0.2, 0.16, 1.9, 0.16); js.add('box', '#3a4258', -0.75, 0.95, -0.2, 0.16, 1.9, 0.16);
        js.add('box', '#3a4258', 0, 1.92, -0.2, 1.66, 0.16, 0.18);
        jg.add('box', '#3fe07a', 0, 1.62, -0.12, 0.8, 0.26, 0.04, 0, 0, 0, 0, 'exitSign');
        jg.add('box', '#2a8f55', 0, 0.02, 0, 1.4, 0.02, 1.0, 0, 0, 0, 0, 'exitFloor');
      });
      if (map.cage) {
        const [cx, cz] = map.cage, n = q === 'low' ? 12 : 16;
        js.at(cx, cz, 0); jg.at(cx, cz, 0);
        js.add('cyl', '#262b3c', 0, 0.03, 0, 2.8, 0.06, 2.8);
        for (let k = 0; k < n; k++) { const a = k / n * PI * 2; js.add('cyl', '#aeb6c8', Math.cos(a) * 1.35, 0.8, Math.sin(a) * 1.35, 0.07, 1.6, 0.07); }
        js.add('ring', '#aeb6c8', 0, 1.62, 0, 2.74, 2.74, 2.0, PI / 2);
        jg.add('ring', '#ff9a2e', 0, 0.08, 0, 2.7, 2.7, 0.6, PI / 2);
        if (!ringThin) { ringThin = new T.RingGeometry(0.97, 1, 48); ringThin.rotateX(-PI / 2); }
        jg.add(ringThin, '#6a4a20', 0, 0.015, 0, 4.5, 1, 4.5);
      }
      const a = js.build(), b = jg.build();
      if (a) { const m = new T.Mesh(a, M.solid); m.castShadow = true; jagen.add(m); geos.push(a); }
      if (b) { jagen.add(new T.Mesh(b, M.glow)); geos.push(b); jagen.userData.glowGeo = b; }
      group.add(jagen);
    }

    // ---------- Zusammenfügen ----------
    const sg = solid.build(), gg = glow.build();
    const sm = new T.Mesh(sg, M.solid); sm.name = 'solid'; sm.castShadow = true; sm.receiveShadow = true;
    const gm = new T.Mesh(gg, M.glow); gm.name = 'glow';
    group.add(sm); group.add(gm); geos.push(sg, gg);

    return {
      group, grid: G, map, doors, gates, doorMesh, glowGeo: gg, jagen, indoor, wallH: WH, accDim, accent,
      dispose() {
        if (group.parent) group.parent.remove(group);
        geos.forEach(g => g.dispose()); texs.forEach(t => t.dispose());
        group.traverse(o => { if (o.userData.own) o.userData.own.dispose(); if (o.userData.mat) o.userData.mat.dispose(); });
        if (group.userData.groundMat) group.userData.groundMat.dispose();
        if (group.userData.starMat) group.userData.starMat.dispose();
        if (doorMesh) doorMesh.dispose();
      }
    };
  }

  // ---------- Requisiten (lokal: Vorderseite +Z, Ursprung am Boden) ----------
  function props(s, g, th, K) {
    const acc = th.accent, top = th.wallTop, accD = K.mix(acc, '#000000', 0.3);
    const pick = (r, a) => a[Math.floor(r() * a.length)];
    return {
      desk() {
        s.add('box', WOOD, 0, 0.72, 0, 1.15, 0.06, 0.62); s.add('box', K.shade(WOOD, 0.7), 0.52, 0.36, 0, 0.06, 0.7, 0.56); s.add('box', K.shade(WOOD, 0.7), -0.52, 0.36, 0, 0.06, 0.7, 0.56);
        s.add('box', DARK, 0, 1.0, -0.15, 0.52, 0.34, 0.04); s.add('box', DARK, 0, 0.8, -0.15, 0.06, 0.12, 0.06);
        g.add('box', accD, 0, 1.0, -0.125, 0.46, 0.28, 0.01);
      },
      mixer() {
        s.add('box', DARK, 0, 0.35, -0.05, 1.25, 0.7, 0.6, 0, 0, 0, 0.4); s.add('box', '#2a3148', 0, 0.74, 0, 1.25, 0.06, 0.6, 0.3);
        [acc, top, '#5fd38a'].forEach((c, k) => g.add('box', c, 0, 0.785 - k * 0.03, -0.12 + k * 0.12, 1.05, 0.02, 0.04, 0.3));
      },
      rack() {
        s.add('box', '#191e2c', 0, 0.75, -0.05, 0.72, 1.5, 0.52, 0, 0, 0, 0.3);
        for (let k = 0; k < 4; k++) g.add('box', k % 2 ? acc : '#5fd38a', -0.08, 0.32 + k * 0.32, 0.215, 0.42, 0.04, 0.01);
      },
      plant(r) {
        s.add('cyl', '#b0603a', 0, 0.2, 0, 0.42, 0.4, 0.42, 0, 0, 0, 0.3);
        s.add('ico', GREEN, 0, 0.72, 0, 0.72); s.add('ico', '#55b860', 0.1, 1.02, 0.05, 0.42, 0.42, 0.42, 0, r() * 3);
      },
      crate(r) {
        s.add('box', '#9a6a3a', 0, 0.35, 0, 0.72, 0.7, 0.72, 0, 0, 0, 0.3);
        s.add('box', '#7a4f2a', 0, 0.35, 0.365, 0.6, 0.06, 0.01);
        if (r() < 0.6) s.add('box', '#b07a44', 0.05, 0.95, 0, 0.5, 0.5, 0.5, 0, 0.4, 0, 0.3);
      },
      barrel() {
        s.add('cyl', '#c0503a', 0, 0.42, 0, 0.58, 0.84, 0.58, 0, 0, 0, 0.35);
        s.add('cyl', '#5a2a20', 0, 0.62, 0, 0.6, 0.05, 0.6); s.add('cyl', '#5a2a20', 0, 0.22, 0, 0.6, 0.05, 0.6);
      },
      sofa() {
        const c = K.mix(top, '#3a2a40', 0.45);
        s.add('box', c, 0, 0.22, 0.05, 1.6, 0.44, 0.7, 0, 0, 0, 0.3); s.add('box', K.shade(c, 0.85), 0, 0.55, -0.24, 1.6, 0.56, 0.22);
        s.add('box', K.shade(c, 0.8), 0.8, 0.34, 0.05, 0.18, 0.5, 0.72); s.add('box', K.shade(c, 0.8), -0.8, 0.34, 0.05, 0.18, 0.5, 0.72);
      },
      shelf() {
        s.add('box', K.shade(WOOD, 0.75), 0, 0.8, -0.05, 1.25, 1.6, 0.42, 0, 0, 0, 0.3);
        const cols = ['#c0503a', '#3a7ac0', '#e0b040', '#5a9a4a', '#8a5ac0'];
        for (let k = 0; k < 3; k++) for (let j = 0; j < 3; j++) s.add('box', cols[(k * 3 + j) % 5], -0.38 + j * 0.38, 0.32 + k * 0.48, 0.12, 0.33, 0.32, 0.1);
      },
      speaker() {
        s.add('box', '#14171f', 0, 0.58, -0.05, 0.62, 1.16, 0.5, 0, 0, 0, 0.25);
        s.add('cyl', '#3c4254', 0, 0.8, 0.205, 0.38, 0.04, 0.38, PI / 2); s.add('cyl', '#3c4254', 0, 0.36, 0.205, 0.26, 0.04, 0.26, PI / 2);
        g.add('box', acc, 0, 1.1, 0.205, 0.4, 0.03, 0.01);
      },
      lamp() {
        s.add('cyl', METAL, 0, 0.03, 0, 0.4, 0.06, 0.4); s.add('cyl', METAL, 0, 0.78, 0, 0.06, 1.5, 0.06);
        g.add('sph', '#ffe9a8', 0, 1.58, 0, 0.32);
      },
      engine() {
        s.add('box', '#2a3044', 0, 0.12, 0, 1.4, 0.24, 0.8); s.add('cyl', METAL, 0, 0.6, 0, 0.8, 1.3, 0.8, 0, 0, PI / 2, 0.3);
        s.add('cyl', '#5a6478', 0.4, 1.1, -0.2, 0.12, 0.8, 0.12); s.add('cyl', '#5a6478', -0.3, 1.1, -0.2, 0.12, 0.8, 0.12);
        g.add('sph', '#ff8a2e', 0, 0.6, 0.42, 0.16);
      },
      antenna() {
        s.add('box', '#3a4258', 0, 0.1, 0, 0.6, 0.2, 0.6); s.add('cyl', METAL, 0, 1.3, 0, 0.08, 2.4, 0.08);
        s.add('cone', '#c8ccd8', 0, 1.6, 0.12, 0.8, 0.22, 0.8, -1.0);
        g.add('sph', '#ff3040', 0, 2.55, 0, 0.14);
      },
      acunit() {
        s.add('box', '#8d97ad', 0, 0.38, 0, 1.0, 0.76, 0.8, 0, 0, 0, 0.35); s.add('cyl', '#2a3044', 0, 0.77, 0, 0.6, 0.03, 0.6);
      },
      reel() { s.add('cyl', '#7a4f2a', 0, 0.42, 0, 0.84, 0.5, 0.84, PI / 2, 0, 0, 0.2); s.add('cyl', '#202634', 0, 0.42, 0, 0.6, 0.52, 0.6, PI / 2); },
      console() {
        s.add('box', K.mix(th.wall, '#8a94b0', 0.45), 0, 0.37, -0.05, 1.3, 0.74, 0.5, 0, 0, 0, 0.45); s.add('box', '#2a3148', 0, 0.78, 0.02, 1.34, 0.08, 0.5, 0.45);
        g.add('box', accD, -0.32, 0.84, 0.045, 0.56, 0.02, 0.34, 0.45); g.add('box', K.mix(top, '#000000', 0.3), 0.32, 0.84, 0.045, 0.56, 0.02, 0.34, 0.45);
      },
      booth() {
        s.add('box', '#14171f', 0, 0.46, 0, 1.5, 0.92, 0.62, 0, 0, 0, 0.3);
        s.add('cyl', '#2c3040', -0.38, 0.94, -0.02, 0.44, 0.04, 0.44); s.add('cyl', '#2c3040', 0.38, 0.94, -0.02, 0.44, 0.04, 0.44);
        g.add('box', '#ff4fb0', 0, 0.55, 0.315, 1.4, 0.06, 0.01); g.add('box', acc, 0, 0.35, 0.315, 1.4, 0.06, 0.01);
      },
      bench() {
        s.add('box', WOOD, 0, 0.42, 0, 1.4, 0.08, 0.45); s.add('box', '#3a4258', 0.55, 0.2, 0, 0.08, 0.4, 0.4); s.add('box', '#3a4258', -0.55, 0.2, 0, 0.08, 0.4, 0.4);
      },
      table() {
        s.add('cyl', '#d8d2c4', 0, 0.72, 0, 0.95, 0.05, 0.95); s.add('cyl', METAL, 0, 0.36, 0, 0.08, 0.7, 0.08);
        s.add('cyl', K.mix(top, '#ffffff', 0.2), 0.75, 0.24, 0.1, 0.36, 0.46, 0.36); s.add('cyl', K.mix(top, '#ffffff', 0.2), -0.75, 0.24, 0.1, 0.36, 0.46, 0.36);
      },
      counter() {
        s.add('box', '#e6ded0', 0, 0.45, 0, 1.45, 0.9, 0.62, 0, 0, 0, 0.3); s.add('box', '#c0503a', 0, 0.93, 0, 1.55, 0.06, 0.7);
        g.add('box', '#ffd27a', 0, 1.5, -0.28, 1.2, 0.4, 0.03);
      },
      truss() {
        s.add('box', METAL, 0.7, 1.1, 0, 0.12, 2.2, 0.12); s.add('box', METAL, -0.7, 1.1, 0, 0.12, 2.2, 0.12); s.add('box', METAL, 0, 2.2, 0, 1.6, 0.12, 0.12);
        g.add('sph', top, 0.35, 2.05, 0.08, 0.22); g.add('sph', acc, -0.35, 2.05, 0.08, 0.22);
      },
      rock(r) { s.add('ico', '#6a6058', 0, 0.32, 0, 1.0, 0.7, 0.9, 0, r() * 3); s.add('ico', '#7a7068', 0.45, 0.2, 0.25, 0.5, 0.4, 0.5); },
      crystal() { s.add('ico', '#4a4450', 0, 0.15, 0, 0.6, 0.3, 0.6); g.add('cone4', '#5ee6ff', 0, 0.5, 0, 0.22, 0.7, 0.22, 0.2); g.add('cone4', '#b07cff', 0.2, 0.35, 0.1, 0.16, 0.45, 0.16, -0.3); },
      bollard() { s.add('cyl', '#2a2a2e', 0, 0.26, 0, 0.32, 0.52, 0.32); s.add('cyl', '#3a3a40', 0, 0.54, 0, 0.42, 0.06, 0.42); s.add('ring', '#c0a070', 0.45, 0.04, 0.2, 0.7, 0.7, 1.5, PI / 2); },
      planter() {
        s.add('box', '#5a6a7a', 0, 0.2, 0, 1.3, 0.4, 0.6, 0, 0, 0, 0.3);
        for (let k = -1; k <= 1; k++) s.add('ico', GREEN, k * 0.4, 0.55, 0, 0.42);
        s.add('box', METAL, 0.62, 0.7, -0.25, 0.04, 1.4, 0.04); s.add('box', METAL, -0.62, 0.7, -0.25, 0.04, 1.4, 0.04);
        g.add('box', '#d07cff', 0, 1.38, -0.1, 1.3, 0.05, 0.12);
      },
      labbench() {
        s.add('box', '#d8dee8', 0, 0.4, 0, 1.3, 0.8, 0.6, 0, 0, 0, 0.3); s.add('box', '#9aa4b8', 0, 0.82, 0, 1.36, 0.04, 0.64);
        ['#5ee6ff', '#5fd38a', '#ff6fb5'].forEach((c, k) => g.add('cyl', c, -0.4 + k * 0.4, 0.97, 0.05, 0.13, 0.26, 0.13));
      },
      hay() { s.add('cyl', '#d8b65a', 0, 0.45, 0, 0.9, 1.0, 0.9, 0, 0, PI / 2, 0.25); },
      flag(r) { s.add('cyl', METAL, 0, 1.2, 0, 0.06, 2.4, 0.06); s.add('box', pick(r, [acc, top, '#ff4fb0', '#ffe066']), 0.32, 2.1, 0, 0.6, 0.4, 0.02); },
      tent(r) { s.add('cone4', pick(r, ['#e0603a', '#3a8ac0', '#e0c040', '#7a5ac0']), 0, 0.65, 0, 1.7, 1.3, 1.7, 0, PI / 4, 0, 0.3); g.add('sph', '#ffd27a', 0, 0.12, 0.75, 0.12); },
      fire() {
        for (let k = 0; k < 3; k++) s.add('cyl', '#6a4a30', 0, 0.08, 0, 0.12, 0.7, 0.12, PI / 2, k * PI / 3);
        g.add('cone', '#ff8a2e', 0, 0.3, 0, 0.36, 0.5, 0.36); g.add('cone', '#ffd23f', 0, 0.25, 0, 0.2, 0.32, 0.2);
      },
      palm(r) {
        s.add('cyl', '#8a6a44', 0, 1.0, 0, 0.18, 2.0, 0.18, 0, 0, 0.08, 0.3);
        for (let k = 0; k < 4; k++) s.add('ico', k % 2 ? '#3f9a4a' : '#2f8a3a', Math.sin(k * 1.6) * 0.45, 2.0, Math.cos(k * 1.6) * 0.45, 1.3, 0.18, 0.5, 0, k * 1.6 + r());
      },
      umbrella(r) {
        s.add('cyl', '#e8e8e8', 0, 0.8, 0, 0.05, 1.6, 0.05);
        s.add('cone', pick(r, ['#ff6fb5', '#29d3ff', '#ffd23f', '#ff9a2e']), 0, 1.62, 0, 1.6, 0.4, 1.6);
        s.add('box', pick(r, ['#ff6fb5', '#29d3ff', '#ffe066']), 0.2, 0.02, 0.5, 0.7, 0.02, 1.3);
      }
    };
  }

  AMU.WorldMap = { build, ART };
})(typeof window !== 'undefined' ? window : globalThis);
