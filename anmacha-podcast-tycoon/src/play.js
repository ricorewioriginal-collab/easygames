/* AnMaCha – Der Podcast – Die Stadt: Andrew und Marco laufen, springen, weichen aus und senden Schallwellen.
   Ziele je Kapitel (Themen-Funken, Gäste, Sendemast, Haltestellen, Kassetten, Funkloch), Störsender, Hörer, Minikarte. */
(function (root) {
  'use strict';
  const AMC = root.AMC = root.AMC || {};
  const U = AMC.U, D = AMC.Data, W = AMC.World, I = AMC.Input;
  const P = AMC.Play = { active: false };
  let T, S = null;   // S = Zustand des laufenden Levels

  const ROADS = [-45, 0, 45], BLOCKS = [-67.5, -22.5, 22.5, 67.5], HALF = 90;
  const FUNKHAUS = { x0: 12, x1: 33, z0: -36, z1: -14, h: 14, door: { x: 22.5, z: -12 } };
  const PARK = { x: -22.5, z: 22.5 }, MAST = { x: -67.5, z: -67.5 };

  // ------------------------------------------------------------------ Kollision
  // Kontext für das Fahr-Modul (src/drive.js)
  const CTX = { get S() { return S; }, solidAt: (x, y, z) => solidAt(x, y, z), addBox: (...a) => addBox(...a), msg: (...a) => msg(...a), setAnim: (...a) => setAnim(...a), moveBody: (...a) => moveBody(...a), freeSpot: (...a) => freeSpot(...a), swapHost: () => swapHost(), honk: () => honk(), drawRub: () => drawRub(), padHeld: b => padHeld(b), addStation: (...a) => addStation(...a), ROADS };
  function addBox(x0, x1, z0, z1, top, bot) { S.col.push({ x0: Math.min(x0, x1), x1: Math.max(x0, x1), z0: Math.min(z0, z1), z1: Math.max(z0, z1), top, bot: bot || 0 }); }
  function solidAt(x, y, z) { for (const c of S.col) if (x > c.x0 && x < c.x1 && z > c.z0 && z < c.z1 && y < c.top && y > c.bot) return true; return false; }
  function groundAt(x, z, y, r) {
    let g = 0; r = r == null ? 0.22 : r;
    for (const c of S.col) if (x > c.x0 - r && x < c.x1 + r && z > c.z0 - r && z < c.z1 + r && c.top <= y + 0.4 && c.top > g) g = c.top;
    return g;
  }
  function pushOut(e, rad) {
    for (const c of S.col) {
      if (e.y >= c.top - 0.36 || e.y + 1.7 <= c.bot) continue;   // kleine Stufen (Bordstein) hochlaufen
      const nx = U.clamp(e.x, c.x0, c.x1), nz = U.clamp(e.z, c.z0, c.z1), dx = e.x - nx, dz = e.z - nz, d2 = dx * dx + dz * dz;
      if (d2 >= rad * rad) continue;
      if (d2 > 1e-6) { const d = Math.sqrt(d2), k = (rad - d) / d; e.x += dx * k; e.z += dz * k; }
      else { const l = e.x - c.x0, r = c.x1 - e.x, b = e.z - c.z0, f = c.z1 - e.z, m = Math.min(l, r, b, f); if (m === l) e.x = c.x0 - rad; else if (m === r) e.x = c.x1 + rad; else if (m === b) e.z = c.z0 - rad; else e.z = c.z1 + rad; }
    }
    e.x = U.clamp(e.x, -HALF + 1, HALF - 1); e.z = U.clamp(e.z, -HALF + 1, HALF - 1);
  }

  // ------------------------------------------------------------------ Stadt bauen
  function buildCity(sky, rng) {
    const g = S.group, M = W.mat;
    const night = !!W.SKIES[sky].lamps, snow = !!W.SKIES[sky].snow, neon = !!W.SKIES[sky].neon;
    // Boden
    const grassTex = W.canvasTex(256, 256, (c, w, h) => W.speckle(c, w, h, snow ? '#dfe7f2' : '#5f9a45', 0.25, 4000), [90, 90]);
    const ground = new T.Mesh(new T.PlaneGeometry(500, 500), new T.MeshStandardMaterial({ map: grassTex, roughness: 0.95 }));
    ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; g.add(ground);
    const roadTex = W.canvasTex(256, 256, (c, w, h) => { W.speckle(c, w, h, '#33363d', 0.18, 6000); c.fillStyle = 'rgba(255,255,255,.85)'; for (let y = 0; y < h; y += 64) c.fillRect(w / 2 - 3, y, 6, 34); c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(6, 0, 4, h); c.fillRect(w - 10, 0, 4, h); });
    const roadMat = new T.MeshStandardMaterial({ map: roadTex, roughness: 0.85 });
    ROADS.forEach(r => {
      for (let i = 0; i < 2; i++) {
        const geo = new T.PlaneGeometry(10, 180); geo.attributes.uv.array.forEach((v, k, a) => { if (k % 2) a[k] = v * 18; });
        const m = new T.Mesh(geo, roadTex && roadMat); m.rotation.x = -Math.PI / 2; if (i) m.rotation.z = Math.PI / 2;
        m.position.set(i ? 0 : r, 0.01 + i * 0.002, i ? r : 0); m.receiveShadow = true; g.add(m);
      }
    });
    const walkTex = W.canvasTex(128, 128, (c, w, h) => { c.fillStyle = snow ? '#cfd6e2' : '#b9b5ad'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 2; for (let i = 0; i <= w; i += 32) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, h); c.stroke(); c.beginPath(); c.moveTo(0, i); c.lineTo(w, i); c.stroke(); } }, [12, 12]);
    const walkMat = new T.MeshStandardMaterial({ map: walkTex, roughness: 0.9 });
    const parkTex = W.canvasTex(128, 128, (c, w, h) => W.speckle(c, w, h, snow ? '#e6edf6' : '#6aaa4c', 0.25, 1500), [6, 6]);
    BLOCKS.forEach(bx => BLOCKS.forEach(bz => {
      const s = W.box(35, 0.16, 35, walkMat, bx, 0.08, bz, g, false); s.castShadow = false;
      addBox(bx - 17.5, bx + 17.5, bz - 17.5, bz + 17.5, 0.16);
    }));
    // Stadtrand: Hecke/Wand
    const edge = M(snow ? 0xdde6f0 : 0x3d6b35, { r: 0.9 });
    [[0, -HALF - 1, 182, 2], [0, HALF + 1, 182, 2], [-HALF - 1, 0, 2, 182], [HALF + 1, 0, 2, 182]].forEach(([x, z, w, d]) => W.box(w, 2.4, d, edge, x, 1.2, z, g));
    // Skyline hinter dem Rand (einfach, mit Fenstern)
    const winTex = W.canvasTex(128, 256, (c, w, h) => { c.fillStyle = '#1b1f2c'; c.fillRect(0, 0, w, h); for (let y = 8; y < h; y += 20) for (let x = 8; x < w; x += 20) { c.fillStyle = Math.random() < (night ? 0.55 : 0.2) ? '#ffd890' : '#2a3142'; c.fillRect(x, y, 10, 12); } });
    winTex.wrapS = winTex.wrapT = T.RepeatWrapping;
    const skyMat = new T.MeshStandardMaterial({ color: W.lin(night ? 0x2a2f44 : 0x8a90a8), map: winTex, emissive: night ? 0xffffff : 0x000000, emissiveMap: night ? winTex : null, emissiveIntensity: 0.5, roughness: 0.8 });
    for (let i = 0; i < 46; i++) {
      const a = (i / 46) * Math.PI * 2, rr = 140 + rng() * 40, h = 20 + rng() * 45, w = 14 + rng() * 12;
      const b = W.box(w, h, w, skyMat, Math.cos(a) * rr, h / 2, Math.sin(a) * rr, g, false); b.rotation.y = -a;
    }
    // Gebäude je Block (Quaternius, als Instanzen)
    const types = ['bld_2Story_Mat', 'bld_1Story_Sign_Mat', 'bld_2Story_GableRoof_Mat', 'bld_2Story_Slim_Mat'].filter(t => W.models[t]);
    const place = {}; types.forEach(t => (place[t] = []));
    const trees = [], treesB = [], flat = [];
    BLOCKS.forEach(bx => BLOCKS.forEach(bz => {
      if (bx === 22.5 && bz === -22.5) return;   // Funkhaus
      if (bx === PARK.x && bz === PARK.z) return;   // Park / Bühne
      if (bx === MAST.x && bz === MAST.z) return;   // Sendemast
      // Hauptgebäude: zwei am Blockrand zur Straße hin
      const sx = bx > 0 ? -1 : 1, sz = bz > 0 ? -1 : 1;   // Richtung zur Stadtmitte
      const spots = [[bx - 8, bz - sz * 9, sz > 0 ? 0 : Math.PI], [bx + 8, bz - sz * 9, sz > 0 ? 0 : Math.PI], [bx - sx * 9, bz + sz * 8, sx > 0 ? Math.PI / 2 : -Math.PI / 2]];
      spots.forEach((sp, i) => {
        if (!types.length) return;
        const t = types[Math.floor(rng() * types.length)], w = 12 + rng() * 2.5;
        place[t].push({ x: sp[0], z: sp[1], rot: sp[2], s: w, i });
      });
      // Flachbau mit Kisten-Treppe (begehbares Dach)
      const fx = bx + sx * 8, fz = bz + sz * 8, fh = 4.2 + Math.floor(rng() * 2) * 0.9;
      flat.push({ x: fx, z: fz, w: 9, d: 8, h: fh, sx, sz });
      trees.push({ x: bx + sx * 15.5, z: bz - sz * 1, rot: rng() * 6, s: 4.2 + rng() });
      treesB.push({ x: bx - sx * 1, z: bz + sz * 15.5, rot: rng() * 6, s: 5.5 + rng() * 1.5 });
    }));
    for (const t of types) {
      const dims = W.instances(g, t, place[t]);
      place[t].forEach((p, i) => { const d = dims[i]; if (d) addBox(p.x - d.w / 2, p.x + d.w / 2, p.z - d.d / 2, p.z + d.d / 2, d.h * (t.includes('Gable') ? 0.72 : 1)); });
    }
    // Flachbauten
    const flatTex = W.canvasTex(256, 128, (c, w, h) => { c.fillStyle = '#e8e1d6'; c.fillRect(0, 0, w, h); c.fillStyle = '#c9c0b2'; c.fillRect(0, h - 10, w, 10); for (let x = 14; x < w; x += 46) { c.fillStyle = night ? '#ffd890' : '#7aa0c8'; c.fillRect(x, 26, 30, 40); c.fillStyle = '#5a5248'; c.fillRect(x - 2, 66, 34, 4); } });
    const flatMat = new T.MeshStandardMaterial({ map: flatTex, roughness: 0.85, emissive: night ? 0x5a4520 : 0x000000, emissiveMap: night ? flatTex : null, emissiveIntensity: 0.6 });
    const roofMat = M(0x6c6a70, { r: 0.95 }), crate = M(0xb8853f, { r: 0.8 }), crate2 = M(0x8a6230, { r: 0.8 });
    S.roofs = [];
    flat.forEach((f, k) => {
      const b = W.box(f.w, f.h, f.d, [flatMat, flatMat, roofMat, roofMat, flatMat, flatMat], f.x, f.h / 2, f.z, g);
      W.box(f.w + 0.4, 0.3, f.d + 0.4, M(0xff8a1e, { r: 0.6, e: neon ? 0xff6a00 : 0x000000, ei: 0.6 }), f.x, f.h + 0.15, f.z, g);
      addBox(f.x - f.w / 2, f.x + f.w / 2, f.z - f.d / 2, f.z + f.d / 2, f.h + 0.3);
      // Kisten-Treppe an der Straßenseite
      const cx = f.x + f.sx * (f.w / 2 + 0.8), cz = f.z - f.sz * 1.6;
      [[1.1, 0, 0], [2.2, 0, 1.6], [3.3, -f.sx * 1.6, 2.4]].forEach(([h, ox, oz], i) => {
        if (h > f.h) return;
        const x = cx + ox * 0, z = cz + f.sz * oz, w = 1.6;
        W.box(w, h, w, i % 2 ? crate2 : crate, x, h / 2, z, g); addBox(x - w / 2, x + w / 2, z - w / 2, z + w / 2, h);
      });
      S.roofs.push({ x: f.x, z: f.z, y: f.h + 0.3 });
      // Werbetafel auf jedem zweiten Dach
      if (k % 2 === 0) {
        const st = D.STATIONS[k % D.STATIONS.length];
        const tex = W.textTex([st.name, st.desc.split(' – ')[0].slice(0, 30)], { accent: st.color, size: 60 });
        const bb = new T.Group(); bb.position.set(f.x, f.h + 0.3, f.z - f.sz * 2.5); bb.rotation.y = f.sz > 0 ? Math.PI : 0; g.add(bb);
        W.box(0.2, 3, 0.2, M(0x333333), -2.6, 1.5, 0, bb); W.box(0.2, 3, 0.2, M(0x333333), 2.6, 1.5, 0, bb);
        const pl = new T.Mesh(new T.PlaneGeometry(6, 3), new T.MeshBasicMaterial({ map: tex, toneMapped: false, side: T.DoubleSide })); pl.position.set(0, 4.2, 0); bb.add(pl);
      }
    });
    buildVenues(g, flat);
    // Bäume (Kenney)
    if (!snow) { W.instances(g, 'tree', trees, { byHeight: true }); W.instances(g, 'tree-high-round', treesB, { byHeight: true }); }
    else {
      const pine = M(0x2f5a3a, { r: 0.9 }), snowM = M(0xf4f8ff, { r: 0.8 });
      trees.concat(treesB).forEach(t => { W.cyl(0.25, 0.3, 1.4, M(0x6b4a30), t.x, 0.7, t.z, g); const c = W.cyl(0, 2.2, 4.2, pine, t.x, 3.4, t.z, g, 10); c.castShadow = true; W.cyl(0, 1.0, 1.4, snowM, t.x, 5.1, t.z, g, 10); });
    }
    trees.concat(treesB).forEach(t => addBox(t.x - 0.5, t.x + 0.5, t.z - 0.5, t.z + 0.5, 4));
    // Straßenlaternen (eine Instanz-Gruppe) + Leuchtpunkte
    const lamps = [];
    ROADS.forEach(r => { for (let s = -80; s <= 80; s += 20) { if (Math.abs(s - r) < 8 || ROADS.some(q => Math.abs(q - s) < 7)) continue; lamps.push([r + 5.6, s], [s, r + 5.6]); } });
    const pole = new T.InstancedMesh(new T.CylinderGeometry(0.08, 0.1, 5, 8), M(0x2a2c33, { m: 0.6, r: 0.4 }), lamps.length);
    const head = new T.InstancedMesh(new T.BoxGeometry(0.5, 0.18, 0.5), M(0xfff1c8, { e: night ? 0xffd890 : 0x222222, ei: night ? 2 : 0.2 }), lamps.length);
    const m4 = new T.Matrix4();
    lamps.forEach(([x, z], i) => { m4.makeTranslation(x, 2.5, z); pole.setMatrixAt(i, m4); m4.makeTranslation(x, 5.05, z); head.setMatrixAt(i, m4); });
    pole.castShadow = true; g.add(pole, head);
    if (night) S.glows.push(glowCloud(lamps.map(([x, z]) => [x, 4.9, z]), 0xffcf80, 3.2));
    // Neon-Party: bunte Lichtpunkte über den Straßen
    if (neon) { const pts = [], cols = [0xff3da8, 0x3dd6ff, 0xffe03d, 0x9b5cff]; for (let i = 0; i < 90; i++) pts.push([U.rand(-85, 85), U.rand(6, 9), ROADS[i % 3] + U.rand(-4, 4)]); S.glows.push(glowCloud(pts, cols, 1.6, true)); }
    // Funkhaus, Park, Sendemast
    buildFunkhaus(g, night);
    buildPark(g, sky);
    buildMast(g, night);
    // Schnee
    if (snow) {
      const n = W.quality > 1 ? 2400 : 1200, geo = new T.BufferGeometry(), arr = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) { arr[i * 3] = U.rand(-60, 60); arr[i * 3 + 1] = U.rand(0, 40); arr[i * 3 + 2] = U.rand(-60, 60); }
      geo.setAttribute('position', new T.BufferAttribute(arr, 3));
      S.snow = new T.Points(geo, new T.PointsMaterial({ color: 0xffffff, size: 0.18, transparent: true, opacity: 0.85, depthWrite: false })); S.snow.frustumCulled = false; g.add(S.snow);
    }
  }
  function glowCloud(pts, color, size, multi) {
    const geo = new T.BufferGeometry(), p = new Float32Array(pts.length * 3), c = new Float32Array(pts.length * 3), s = new Float32Array(pts.length);
    pts.forEach((q, i) => { p.set(q, i * 3); const col = new T.Color(multi ? color[i % color.length] : color); c.set([col.r, col.g, col.b], i * 3); s[i] = size; });
    geo.setAttribute('position', new T.BufferAttribute(p, 3)); geo.setAttribute('color', new T.BufferAttribute(c, 3)); geo.setAttribute('size', new T.BufferAttribute(s, 1));
    const pts3 = new T.Points(geo, W.particles.points.material); pts3.frustumCulled = false; S.group.add(pts3); return pts3;
  }

  function buildFunkhaus(g, night) {
    const F = FUNKHAUS, M = W.mat, w = F.x1 - F.x0, d = F.z1 - F.z0, cx = (F.x0 + F.x1) / 2, cz = (F.z0 + F.z1) / 2;
    const glassTex = W.canvasTex(256, 256, (c, W2, H) => { c.fillStyle = '#121826'; c.fillRect(0, 0, W2, H); for (let y = 0; y < H; y += 32) { c.fillStyle = night ? 'rgba(255,190,110,.55)' : 'rgba(120,170,230,.35)'; c.fillRect(0, y + 6, W2, 18); c.fillStyle = '#0a0d14'; for (let x = 0; x < W2; x += 32) c.fillRect(x, y, 3, 32); } }, [3, 2]);
    const glass = new T.MeshStandardMaterial({ map: glassTex, roughness: 0.15, metalness: 0.6, emissive: 0xffffff, emissiveMap: glassTex, emissiveIntensity: night ? 0.7 : 0.25 });
    // Begehbar: Glasfassade als vier Wände, Eingang offen, Dach drüber (wirft keinen Schatten, damit innen Tageslicht ist)
    const inner = M(0xece4d6, { r: 0.85 }), band = M(0xff8a1e, { e: 0xff6a00, ei: 0.8 }), T2 = 0.6, dl = F.door.x - 1.6, dr = F.door.x + 1.6;
    const wall = (x0, x1, z0, z1, y0, y1, inFace) => { const mats = [glass, glass, glass, glass, glass, glass]; mats[inFace] = inner; const m = W.box(x1 - x0, y1 - y0, z1 - z0, mats, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, g, false); addBox(x0, x1, z0, z1, y1, y0); return m; };
    wall(F.x0, F.x1, F.z0, F.z0 + T2, 0, F.h, 4); wall(F.x0, F.x0 + T2, F.z0 + T2, F.z1, 0, F.h, 0); wall(F.x1 - T2, F.x1, F.z0 + T2, F.z1, 0, F.h, 1);
    wall(F.x0 + T2, dl, F.z1 - T2, F.z1, 0, F.h, 5); wall(dr, F.x1 - T2, F.z1 - T2, F.z1, 0, F.h, 5); wall(dl, dr, F.z1 - T2, F.z1, 4, F.h, 5);
    const roof = W.box(w + 0.6, 0.6, d + 0.6, M(0x16171c, { r: 0.4, m: 0.4 }), cx, F.h + 0.3, cz, g, false); roof.castShadow = false;
    addBox(F.x0, F.x1, F.z0, F.z1, F.h + 0.6, F.h);
    [[cx, F.z0 - 0.1, w + 0.2, 0.2], [cx, F.z1 + 0.1, w + 0.2, 0.2], [F.x0 - 0.1, cz, 0.2, d], [F.x1 + 0.1, cz, 0.2, d]].forEach(([x, z, bw, bd]) => W.box(bw, 0.5, bd, band, x, 4.4, z, g, false));
    buildFunkhausInside(g, night);
    // großes Logo auf dem Dach und über dem Eingang
    const logo = W.logoTex({ sub: 'FUNKHAUS · Wir ♥ Medien' });
    const sg = new T.Group(); sg.position.set(cx, F.h + 0.6, F.z1 - 2); g.add(sg);
    W.box(0.3, 3, 0.3, M(0x222222), -5, 1.5, 0, sg); W.box(0.3, 3, 0.3, M(0x222222), 5, 1.5, 0, sg);
    W.sign(sg, logo, 13, 4, 0, 4.4, 0.1, 0, true);
    S.glows.push(glowCloud([[cx - 6, F.h + 5, F.z1 - 1.5], [cx + 6, F.h + 5, F.z1 - 1.5]], 0xff8a1e, 9));
    // Eingang mit Vordach, „ON AIR“ und Tür
    const door = F.door;
    W.box(6, 0.3, 3.4, M(0x16171c, { r: 0.4 }), door.x, 4.2, F.z1 + 1.5, g);
    const onair = W.textTex(['ON AIR'], { w: 512, h: 160, bg: '#300808', fg: '#ff3a3a', accent: '#ff3a3a', size: 96 });
    W.sign(g, onair, 3.4, 1.05, door.x, 5.2, F.z1 + 0.05, 0);
    const doorMesh = W.box(3.4, 0.4, 0.7, M(0xff8a1e, { e: 0xff7a10, ei: 1.2, r: 0.3 }), door.x, 3.8, F.z1 - 0.3, g);
    [-1.75, 1.75].forEach(o => W.box(0.25, 3.8, 0.7, M(0x16171c, { r: 0.4 }), door.x + o, 1.9, F.z1 - 0.3, g));
    S.doorMesh = doorMesh;
    // Riesen-Mikrofon vor dem Funkhaus (Wahrzeichen)
    const mg = new T.Group(); mg.position.set(door.x - 8, 0.16, F.z1 + 6); g.add(mg);
    W.cyl(1.4, 1.6, 0.5, M(0x16171c, { r: 0.3, m: 0.6 }), 0, 0.25, 0, mg);
    W.cyl(0.12, 0.12, 4.5, M(0x2c2e38, { m: 0.8, r: 0.3 }), 0, 2.7, 0, mg);
    const head = new T.Mesh(new T.SphereGeometry(1, 24, 16), M(0x9aa0ad, { m: 0.9, r: 0.25 })); head.scale.set(0.9, 1.25, 0.9); head.position.y = 5.8; head.castShadow = true; mg.add(head);
    W.cyl(0.95, 0.95, 0.3, M(0xff8a1e, { e: 0xff6a00, ei: 0.7 }), 0, 4.9, 0, mg);
    addBox(door.x - 9.6, door.x - 6.4, F.z1 + 4.4, F.z1 + 7.6, 0.5); addBox(door.x - 8.3, door.x - 7.7, F.z1 + 5.7, F.z1 + 6.3, 9);
  }
  // Im Funkhaus: Empfang, Studio, Redaktion, Quiz-Bühne, Radio-Lounge, Fanshop, Koop-Terminal – jeder Menüpunkt als Ort
  function buildFunkhausInside(g, night) {
    const F = FUNKHAUS, M = W.mat, cx = (F.x0 + F.x1) / 2, cz = (F.z0 + F.z1) / 2;
    const ftex = W.canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#2a2c36'; c.fillRect(0, 0, w, h); c.fillStyle = '#353845'; for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) if ((x + y) % 2) c.fillRect(x * 32, y * 32, 32, 32); c.fillStyle = 'rgba(255,138,30,.6)'; c.fillRect(0, 0, w, 3); c.fillRect(0, 0, 3, h); }, [5, 5]);
    const fl = new T.Mesh(new T.PlaneGeometry(F.x1 - F.x0 - 1.2, F.z1 - F.z0 - 1.2), new T.MeshStandardMaterial({ map: ftex, roughness: 0.6 })); fl.rotation.x = -Math.PI / 2; fl.position.set(cx, 0.175, cz); fl.receiveShadow = true; g.add(fl);
    const B = (w, h, d, c, x, y, z, o, solid) => { const m = W.box(w, h, d, M(c, o || { r: 0.6 }), x, y, z, g, false); if (solid) addBox(x - w / 2, x + w / 2, z - d / 2, z + d / 2, y + h / 2); return m; };
    const sign = (txt, sub, col, x, y, z, ry, w) => { const t = W.textTex([txt].concat(sub ? [sub] : []), { w: 512, h: sub ? 200 : 128, size: sub ? 62 : 70, accent: col }); const m = new T.Mesh(new T.PlaneGeometry(w || 4, (w || 4) * (sub ? 200 : 128) / 512), new T.MeshBasicMaterial({ map: t, toneMapped: false })); m.position.set(x, y, z); m.rotation.y = ry || 0; g.add(m); return m; };
    // Empfang
    B(5, 1.1, 1.2, 0xff8a1e, cx, 0.72, -20, { e: 0xff6a00, ei: 0.3 }, true); B(5.2, 0.08, 1.4, 0x16171c, cx, 1.31, -20);
    sign('EMPFANG', 'Funkhaus · Wir ♥ Medien', '#ff8a1e', cx, 3.2, -20.8, 0, 4.2);
    // Studio mit Pult an der Rückwand
    B(9, 0.2, 6, 0x1c1e26, cx, 0.27, -32.4); B(4.2, 0.9, 1.4, 0x3a3d4a, cx, 0.82, -32.2, null, true); B(4.4, 0.08, 1.6, 0x16171c, cx, 1.3, -32.2);
    [-1.2, 1.2].forEach(o => { W.cyl(0.03, 0.03, 0.5, M(0x222222), cx + o, 1.6, -31.8, g, 6); const h = new T.Mesh(new T.SphereGeometry(0.12, 10, 8), M(0x9aa0ad, { m: 0.8, r: 0.3 })); h.position.set(cx + o, 1.9, -31.8); g.add(h); });
    sign('ON AIR', '', '#ff3a3a', cx, 5.2, -35.3, 0, 3.4).material.color.set(0xffd0d0);
    const logo = W.logoTex({ sub: 'STUDIO A' }); W.sign(g, logo, 6, 2, cx, 3.4, -35.3, 0, true);
    // Werkstatt (Studio umbauen) und Redaktion (Story)
    B(2.6, 0.9, 1.2, 0x8a6a48, 29.4, 0.62, -33.6, null, true); B(0.8, 0.5, 0.5, 0xff8a1e, 29, 1.32, -33.6); sign('STUDIO UMBAUEN', '🛠️ Möbel, Deko, Technik', '#3dd6ff', 29.4, 3.2, -35.3, 0, 3.6);
    B(3.6, 2.4, 0.12, 0xc8a070, 15.6, 2.2, -35.2); for (let i = 0; i < 9; i++) B(0.6, 0.45, 0.02, [0xffd23f, 0xff8a1e, 0x3dd6ff][i % 3], 14.6 + (i % 3) * 1, 1.6 + Math.floor(i / 3) * 0.6, -35.12);
    sign('REDAKTION', '📜 Story: alle Kapitel', '#ffd23f', 15.6, 4.2, -35.2, 0, 3.6);
    // Quiz-Bühne links
    B(3.2, 0.24, 6, 0x5a2bb0, 14.4, 0.29, -25.5, { e: 0x3a1a80, ei: 0.4 }); [-1.5, 1.5].forEach(o => { B(0.8, 1.1, 0.6, 0x3dd6ff, 14.6, 0.95, -25.5 + o, { e: 0x2090c0, ei: 0.5 }, true); });
    sign('KI-QUIZSHOW', '🧠 Andrew gegen Marco', '#a46bff', F.x0 + 0.65, 3.6, -25.5, Math.PI / 2, 3.8);
    // Radio-Lounge rechts
    B(1, 0.5, 3.2, 0x3a5a85, 31.2, 0.45, -26, null, true); B(0.3, 0.8, 3.2, 0x3a5a85, 31.9, 0.85, -26);
    D.STATIONS.slice(0, 6).forEach((st, i) => { const t = W.textTex([st.name], { w: 256, h: 64, size: 30, accent: st.color }); const m = new T.Mesh(new T.PlaneGeometry(1.9, 0.48), new T.MeshBasicMaterial({ map: t, toneMapped: false })); m.position.set(F.x1 - 0.65, 1.7 + (i % 3) * 0.6, -27 + Math.floor(i / 3) * 2); m.rotation.y = -Math.PI / 2; g.add(m); });
    sign('RADIO-LOUNGE', '📻 Alle Sender & Folgen', '#3dd6ff', F.x1 - 0.65, 4.2, -26, -Math.PI / 2, 3.8);
    // Fanshop rechts vorn
    B(0.1, 1.6, 2.6, 0x888888, 31.6, 1.0, -18.5); for (let i = 0; i < 5; i++) B(0.5, 0.7, 0.05, [0xff8a1e, 0x3a3d4a, 0xa46bff, 0x3dd6ff, 0xffd23f][i], 31.4, 1.3, -19.6 + i * 0.55);
    B(1.6, 0.9, 0.8, 0xff8a1e, 30, 0.62, -16.6, null, true); sign('FANSHOP', '🛍️ Outfits & Upgrades', '#ff8a1e', F.x1 - 0.65, 3.4, -18.5, -Math.PI / 2, 3.6);
    // Koop-Terminal links vorn
    B(0.8, 1.6, 0.6, 0x16171c, 14, 1.0, -18, null, true); B(0.66, 0.8, 0.04, 0x3dd6ff, 14, 1.4, -17.68, { e: 0x3dd6ff, ei: 0.9 }); sign('ONLINE-KOOP', '🌐 per Link, Code, QR', '#3dd6ff', F.x0 + 0.65, 3.4, -18, Math.PI / 2, 3.6);
    // Deckenlichter
    if (S.glows) { const pts = []; for (let x = F.x0 + 3; x < F.x1 - 2; x += 4.5) for (let z = F.z0 + 3; z < F.z1 - 2; z += 4.5) pts.push([x, F.h - 1, z]); S.glows.push(glowCloud(pts, 0xfff1c8, 2.4)); }
    addStation('menu', '☰ Empfang: Gesamtmenü & Einstellungen', cx, -18.6, 2.2);
    addStation('live', '🎙️ Ins Studio: Live-Aufnahme starten', cx, -30.2, 2.2);
    addStation('edit', '🛠️ Studio umbauen', 29.4, -31.6, 1.9);
    addStation('story', '📜 Redaktion: Story-Kapitel', 15.6, -33, 2.0);
    addStation('quiz', '🧠 KI-Quizshow-Bühne', 16.6, -25.5, 2.0);
    addStation('radio', '📻 Radio-Lounge: Radio & Podcast', 29.6, -26, 2.0);
    addStation('shop', '🛍️ Fanshop', 29.2, -18.5, 2.0);
    addStation('koop', '🌐 Online-Koop-Terminal', 15.6, -18, 1.8);
  }
  // Orte in der Welt, die einen Menüpunkt öffnen (nur im freien Spiel; im Story-Modus bleiben sie Kulisse)
  function addStation(id, label, x, z, r) {
    S.stations = S.stations || [];
    const icon = label.split(' ')[0], tx = W.textTex([icon], { w: 128, h: 128, bg: '#14161f', size: 80, accent: '#ff8a1e' });
    const sp = new T.Sprite(new T.SpriteMaterial({ map: tx, toneMapped: false })); sp.scale.set(0.9, 0.9, 1); sp.position.set(x, 2.9, z); S.group.add(sp);
    S.stations.push({ id, label, x, z, r: r || 2, sp });
  }
  // Eigene Gebäude in der Stadt: Spielhalle, Musikladen, Andrews Wohnung, Marcos Haus
  function buildVenues(g, flat) {
    const door = FUNKHAUS.door, list = flat.slice().sort((a, b) => Math.hypot(a.x - door.x, a.z - door.z) - Math.hypot(b.x - door.x, b.z - door.z));
    const V = [['arcade', '🕹️', 'AnMaCha Arcade', 'Spielhalle · 3D-Minispiele', '#a46bff'], ['music', '🎹', 'Klavierlicht', 'Musikladen', '#3dd6ff'], ['home:andrew', '🏠', 'Andrews Wohnung', 'Feelgood-Zentrale', '#ff9d2e'], ['home:marco', '🏡', 'Marcos Haus', 'mit Gisela-Parkplatz', '#3aa7a0']];
    V.forEach((v, i) => {
      const f = list[i]; if (!f) return;
      const zf = f.z + f.sz * (f.d / 2), ry = f.sz > 0 ? 0 : Math.PI;
      const t = W.textTex([v[1] + ' ' + v[2], v[3]], { w: 512, h: 160, size: 56, accent: v[4] });
      const m = new T.Mesh(new T.PlaneGeometry(4.6, 1.44), new T.MeshBasicMaterial({ map: t, toneMapped: false })); m.position.set(f.x, f.h - 0.85, zf + f.sz * 0.06); m.rotation.y = ry; g.add(m);
      const dm = W.box(1.8, 2.3, 0.12, W.mat(new T.Color(v[4]).getHex(), { e: new T.Color(v[4]).getHex(), ei: 0.7, r: 0.4 }), f.x, 1.31, zf + f.sz * 0.07, g, false);
      W.box(2.6, 0.15, 1.4, W.mat(0x16171c), f.x, 2.55, zf + f.sz * 0.7, g, false);
      addStation(v[0], v[1] + ' ' + v[2] + (v[0].startsWith('home') ? ' betreten' : ' – rein da!'), f.x, zf + f.sz * 1.4, 2.0);
      f.venue = v[0]; dm.userData.venue = v[0];
    });
    // Senderhäuser: die übrigen Flachbauten und vier Pavillons am Sendemast – jeder AnMaCha-Sender hat ein eigenes Haus
    const order = ['anmacha24', 'clubradio24', 'christmasradio24', 'yourtime-fm', 'rockradio24', 'ricorewi', 'chartradio24', 'kultradio24', 'special-radio', 'zockerfm', 'rapradio24', 'schlagerpop24', 'radiofloh'];
    const spots = list.slice(V.length).map(f => ({ x: f.x, zf: f.z + f.sz * (f.d / 2), sz: f.sz, top: f.h - 0.85 }));
    [[-11, 11], [11, 11], [-11, -11], [11, -11]].forEach(([dx, dz]) => {
      const x = MAST.x + dx, z = MAST.z + dz, sz = dz > 0 ? 1 : -1;
      W.box(7, 4.6, 7, [W.mat(0xe8e1d6), W.mat(0xe8e1d6), W.mat(0x6c6a70), W.mat(0x6c6a70), W.mat(0xe8e1d6), W.mat(0xe8e1d6)], x, 2.3, z, g);
      addBox(x - 3.5, x + 3.5, z - 3.5, z + 3.5, 4.6);
      spots.push({ x, zf: z + sz * 3.5, sz, top: 3.75, band: true });
    });
    order.forEach((slug, i) => {
      const sp = spots[i], st = D.STATIONS.find(x => x.slug === slug); if (!sp || !st) return;
      const col = new T.Color(st.color).getHex(), ry = sp.sz > 0 ? 0 : Math.PI;
      if (sp.band) W.box(7.2, 0.3, 7.2, W.mat(col, { e: col, ei: 0.5 }), sp.x, 4.75, sp.zf - sp.sz * 3.5, g, false);
      const t = W.textTex([st.icon + ' ' + st.name, 'Senderhaus'], { w: 512, h: 160, size: 56, accent: st.color });
      const m = new T.Mesh(new T.PlaneGeometry(4.6, 1.44), new T.MeshBasicMaterial({ map: t, toneMapped: false })); m.position.set(sp.x, sp.top, sp.zf + sp.sz * 0.06); m.rotation.y = ry; g.add(m);
      W.box(1.8, 2.3, 0.12, W.mat(col, { e: col, ei: 0.7, r: 0.4 }), sp.x, 1.31, sp.zf + sp.sz * 0.07, g, false);
      W.box(2.6, 0.15, 1.4, W.mat(0x16171c), sp.x, 2.55, sp.zf + sp.sz * 0.7, g, false);
      addStation('sender:' + slug, '📻 ' + st.name + ': Senderhaus betreten', sp.x, sp.zf + sp.sz * 1.4, 2.0);
    });
  }
  // Story: Im Senderhaus des Kapitel-Senders wartet ein Interview (Bonus-Funken, die Stadt bleibt offen)
  function senderInterview(st) {
    S.senderDone = true;
    const rub = (AMC.Home && AMC.Home.SENDER_RUB[st.slug]) || 'musik', H = AMC.Home && AMC.Home.SENDER[st.slug];
    S.got[rub] += 3; S.score += 400; drawRub();
    AMC.UI.bubble(st.name, (H ? H.talk[0] : st.desc) + ' Schön, dass ihr vorbeischaut – das Interview geht direkt in eure Folge!', '+3 ' + D.RUBRICS[rub].icon + ' ' + D.RUBRICS[rub].name);
    AMC.Audio.sfx('applause'); W.particles.burst(S.pl.x, S.pl.y + 2, S.pl.z, new T.Color(st.color).getHex(), 30);
  }
  function buildPark(g, sky) {
    const M = W.mat, { x, z } = PARK;
    const pk = W.box(31, 0.05, 31, new T.MeshStandardMaterial({ color: W.lin(sky === 'xmas' ? 0xe6edf6 : 0x6aaa4c), roughness: 0.95 }), x, 0.18, z, g, false);
    if (sky === 'festival' || sky === 'party') {
      // Bühne (Side-Stage) mit LED-Wand
      const st = new T.Group(); st.position.set(x, 0.16, z - 11); g.add(st);
      W.box(16, 1.2, 7, M(0x16171c, { r: 0.5 }), 0, 0.6, 0, st); addBox(x - 8, x + 8, z - 14.5, z - 7.5, 1.36);
      const truss = M(0x9aa0ad, { m: 0.9, r: 0.3 });
      [[-7.6, -3.2], [7.6, -3.2], [-7.6, 3.2], [7.6, 3.2]].forEach(([a, b]) => W.box(0.3, 8, 0.3, truss, a, 5, b, st));
      W.box(15.6, 0.4, 0.4, truss, 0, 9, -3.2, st); W.box(15.6, 0.4, 0.4, truss, 0, 9, 3.2, st);
      W.sign(st, W.logoTex({ sub: sky === 'festival' ? 'LIVE · Podfluencer Festival · München' : 'LIVE · 1996er-Party · Rückspul Helden' }), 12, 3.8, 0, 4.4, -3, 0, true);
      const cols = [0xff3da8, 0x3dd6ff, 0xffe03d, 0xff8a1e];
      S.stageLights = cols.map((c, i) => { const l = new T.SpotLight(c, 3, 40, 0.35, 0.6); l.position.set(x - 6 + i * 4, 9.5, z - 13); l.target.position.set(x, 0, z); g.add(l, l.target); return l; });
      if (W.quality < 2) S.stageLights.forEach((l, i) => { if (i % 2) l.visible = false; });
      return;
    }
    if (W.models['fountain-round']) { W.instances(g, 'fountain-round', [{ x, z, s: 7 }]); addBox(x - 3.3, x + 3.3, z - 3.3, z + 3.3, 1.2); }
    const bench = M(0x8a5a30, { r: 0.8 }), iron = M(0x2a2c33, { m: 0.6 });
    [[0, 9, 0], [0, -9, Math.PI], [9, 0, Math.PI / 2], [-9, 0, -Math.PI / 2]].forEach(([bx, bz, r]) => {
      const b = new T.Group(); b.position.set(x + bx, 0.2, z + bz); b.rotation.y = r; g.add(b);
      W.box(2.4, 0.12, 0.6, bench, 0, 0.5, 0, b); W.box(2.4, 0.5, 0.1, bench, 0, 0.85, -0.28, b); W.box(0.1, 0.5, 0.5, iron, -1, 0.25, 0, b); W.box(0.1, 0.5, 0.5, iron, 1, 0.25, 0, b);
    });
    if (W.models['rock-large']) W.instances(g, 'rock-large', [{ x: x + 11, z: z + 11, s: 2.5, rot: 1 }, { x: x - 12, z: z - 11, s: 2, rot: 2 }]);
    if (sky !== 'xmas') W.instances(g, 'tree', [{ x: x - 12, z: z + 12, s: 5 }, { x: x + 12, z: z - 12, s: 5.5 }], { byHeight: true });
  }
  function buildMast(g, night) {
    const M = W.mat, { x, z } = MAST, steel = M(0xd04030, { m: 0.5, r: 0.45 }), white = M(0xeeeeee, { m: 0.5, r: 0.45 });
    const H = 40;
    for (let s = 0; s < 8; s++) {
      const y = s * 5, mat = s % 2 ? white : steel, w = 2.6 - s * 0.18;
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([a, b]) => W.box(0.22, 5, 0.22, mat, x + a * w / 2, y + 2.5, z + b * w / 2, g));
      W.box(w, 0.15, 0.15, mat, x, y + 5, z - w / 2, g); W.box(w, 0.15, 0.15, mat, x, y + 5, z + w / 2, g); W.box(0.15, 0.15, w, mat, x - w / 2, y + 5, z, g); W.box(0.15, 0.15, w, mat, x + w / 2, y + 5, z, g);
    }
    W.cyl(0.08, 0.08, 6, white, x, H + 3, z, g);
    addBox(x - 1.4, x + 1.4, z - 1.4, z + 1.4, H);
    S.mastBlink = W.glow(0xff2020, 3, g, x, H + 6.2, z);
    // Wendel-Plattformen um den Mast
    const plat = M(0x3a3f4a, { m: 0.6, r: 0.5 }), rail = M(0xff8a1e, { e: 0x502000 });
    S.mastSteps = [];
    const n = 34;
    for (let i = 0; i < n; i++) {
      const a = i * 0.62, r = 4.2, px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r, py = 0.9 + i * 1.05, big = i % 11 === 10;
      const w = big ? 3.2 : 2.1;
      const p = W.box(w, 0.25, w, big ? rail : plat, px, py, pz, g); p.rotation.y = -a;
      addBox(px - w / 2, px + w / 2, pz - w / 2, pz + w / 2, py + 0.125, py - 0.3);
      S.mastSteps.push({ x: px, y: py + 0.125, z: pz, big });
    }
    const sign = W.textTex(['SENDEMAST', 'AnMaCha24 · 24/7'], { size: 64 });
    W.sign(g, sign, 5, 2.5, x + 6, 3, z + 6, -Math.PI * 0.75, true);
  }

  // ------------------------------------------------------------------ Objekte im Level
  function funkeMesh(rub) {
    const c = new T.Color(D.RUBRICS[rub] ? D.RUBRICS[rub].color : '#ffd23f'), g = new T.Group();
    const core = new T.Mesh(new T.OctahedronGeometry(0.42, 0), new T.MeshStandardMaterial({ color: c.clone().convertSRGBToLinear(), emissive: c.clone().convertSRGBToLinear(), emissiveIntensity: 1.1, roughness: 0.2, metalness: 0.3 }));
    core.castShadow = true; g.add(core);
    const ring = new T.Mesh(new T.TorusGeometry(0.62, 0.035, 6, 32), new T.MeshBasicMaterial({ color: c, toneMapped: false })); ring.rotation.x = Math.PI / 2; g.add(ring);
    W.glow(c, 2.6, g); g.userData.core = core; g.userData.ring = ring; return g;
  }
  function goldMesh() {
    const g = new T.Group(), m = new T.MeshStandardMaterial({ color: W.lin(0xffd23f), emissive: W.lin(0xffa000), emissiveIntensity: 0.9, metalness: 0.9, roughness: 0.2 });
    const s = new T.Shape(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 0.28 : 0.62, a = (i / 10) * Math.PI * 2 - Math.PI / 2; s[i ? 'lineTo' : 'moveTo'](Math.cos(a) * r, Math.sin(a) * r); }
    const st = new T.Mesh(new T.ExtrudeGeometry(s, { depth: 0.18, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 1 }), m); st.position.z = -0.09; st.castShadow = true; g.add(st);
    W.glow(0xffc040, 3.6, g); g.userData.core = st; return g;
  }
  function tapeMesh() {
    const g = new T.Group(), tex = W.canvasTex(128, 80, (c, w, h) => { c.fillStyle = '#1d1d24'; c.fillRect(0, 0, w, h); c.fillStyle = U.pick(['#ff3da8', '#3dd6ff', '#ffe03d', '#ff8a1e']); c.fillRect(8, 8, w - 16, 30); c.fillStyle = '#111'; c.font = '700 18px Fredoka, sans-serif'; c.fillText('MIXTAPE 96', 14, 30); c.fillStyle = '#eee'; c.beginPath(); c.arc(38, 56, 10, 0, 7); c.arc(90, 56, 10, 0, 7); c.fill(); });
    const b = new T.Mesh(new T.BoxGeometry(0.9, 0.56, 0.12), [W.mat(0x1d1d24), W.mat(0x1d1d24), W.mat(0x1d1d24), W.mat(0x1d1d24), new T.MeshStandardMaterial({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.5 }), new T.MeshStandardMaterial({ map: tex })]);
    b.castShadow = true; g.add(b); W.glow(0xff6ad0, 2.4, g); g.userData.core = b; return g;
  }
  function addPickup(kind, rub, x, y, z) {
    const m = kind === 'gold' ? goldMesh() : kind === 'tape' ? tapeMesh() : funkeMesh(rub);
    m.position.set(x, y, z); S.group.add(m);
    const p = { kind, rub, x, y, z, m, taken: false, t: Math.random() * 6, dirty: true }; S.pickups.push(p); return p;
  }
  function beam(color) {
    const g = new T.Group();
    const m = new T.Mesh(new T.CylinderGeometry(0.9, 1.4, 60, 16, 1, true), new T.MeshBasicMaterial({ color, transparent: true, opacity: 0.22, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide, toneMapped: false }));
    m.position.y = 30; g.add(m); W.glow(color, 5, g, 0, 1.2, 0); S.group.add(g); g.visible = false; return g;
  }
  function droneMesh(big) {
    const g = new T.Group(), s = big ? 2.4 : 1;
    const body = new T.Mesh(new T.SphereGeometry(0.42 * s, 20, 14), W.mat(0x22242c, { m: 0.85, r: 0.25 })); body.castShadow = true; g.add(body);
    const eye = new T.Mesh(new T.SphereGeometry(0.18 * s, 16, 10), new T.MeshBasicMaterial({ color: 0xff2a3a, toneMapped: false })); eye.position.z = 0.32 * s; g.add(eye);
    const ring = new T.Mesh(new T.TorusGeometry(0.62 * s, 0.05 * s, 6, 28), W.mat(0xff2a3a, { e: 0xff1020, ei: 1.4 })); ring.rotation.x = Math.PI / 2; g.add(ring);
    const ant = W.cyl(0.02 * s, 0.02 * s, 0.5 * s, W.mat(0x888888, { m: 0.8 }), 0, 0.6 * s, 0, g); ant.castShadow = false;
    const tip = W.glow(0xff3030, 0.8 * s, g, 0, 0.88 * s, 0);
    const rotors = [];
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4, r = W.box(0.5 * s, 0.02, 0.07 * s, W.mat(0x111111), Math.cos(a) * 0.62 * s, 0.12 * s, Math.sin(a) * 0.62 * s, g, false); rotors.push(r); }
    W.glow(0xff2030, 2.2 * s, g);
    if (big) { const sh = new T.Mesh(new T.IcosahedronGeometry(2.4, 1), new T.MeshBasicMaterial({ color: 0x8a3dff, wireframe: true, transparent: true, opacity: 0.55, toneMapped: false })); g.add(sh); g.userData.shield = sh; }
    g.userData = Object.assign(g.userData, { eye, ring, tip, rotors, body });
    S.group.add(g); return g;
  }
  function addDrone(x, z, o) {
    o = o || {}; const m = droneMesh(false);
    const d = { x, y: 2, z, hx: x, hz: z, m, hp: 2, stun: 0, state: 'patrol', a: Math.random() * 6, dead: false, respawn: 0, vx: 0, vz: 0, speed: o.speed || 5.2, cd: 0 };
    m.position.set(x, 2, z); S.drones.push(d); return d;
  }
  function freeSpot(rng, margin) {
    for (let k = 0; k < 60; k++) {
      const x = U.lerp(-84, 84, rng()), z = U.lerp(-84, 84, rng());
      if (!solidAt(x, 0.5, z) && !solidAt(x + 0.8, 0.5, z) && !solidAt(x - 0.8, 0.5, z) && !solidAt(x, 0.5, z + 0.8) && !solidAt(x, 0.5, z - 0.8) && Math.hypot(x - FUNKHAUS.door.x, z - FUNKHAUS.door.z) > (margin || 6)) return [x, groundAt(x, z, 0.5), z];
    }
    return [U.rand(-40, 40), 0.16, 3];
  }

  // ------------------------------------------------------------------ Figuren steuern
  function setAnim(e, name, o) { if (e.fig && e.anim !== name) { e.fig.play(name, o); e.anim = name; } }
  function spawnHosts(id, x, z) {
    const other = id === 'andrew' ? 'marco' : 'andrew';
    S.pl = mkHost(id, x, z); S.fo = mkHost(other, x - 1.6, z + 1.2);
  }
  function mkHost(id, x, z) {
    const fig = W.hosts[id]; if (fig) { S.group.add(fig.root); fig.root.position.set(x, 0.16, z); fig.root.visible = true; }
    return { id, H: D.HOSTS[id], fig, x, y: 0.16, z, vx: 0, vy: 0, vz: 0, yaw: 0, onGround: true, jumps: 0, dodge: 0, inv: 0, cd: 0, anim: '', busy: 0, landT: 0 };
  }
  function moveBody(e, dt, wantX, wantZ, speed, accel) {
    e.vx = U.damp(e.vx, wantX * speed, accel, dt); e.vz = U.damp(e.vz, wantZ * speed, accel, dt);
    e.vy -= 24 * dt;
    e.x += e.vx * dt; e.z += e.vz * dt; e.y += e.vy * dt;
    pushOut(e, 0.38);
    // Decke (unter Plattformen)
    const gr = groundAt(e.x, e.z, e.y);
    if (e.y <= gr) { if (!e.onGround && e.vy < -6) e.landT = 0.18; e.y = gr; e.vy = 0; e.onGround = true; e.jumps = 0; }
    else if (e.y > gr + 0.05) e.onGround = false;
    if (e.y < -20) { e.x = FUNKHAUS.door.x; e.z = FUNKHAUS.door.z + 4; e.y = 2; e.vy = 0; }
    const sp = Math.hypot(e.vx, e.vz);
    if (sp > 0.4) e.yaw = Math.atan2(e.vx, e.vz);
    if (e.fig) {
      const r = e.fig.root; r.position.set(e.x, e.y, e.z);
      r.rotation.y += U.angDiff(r.rotation.y, e.yaw) * Math.min(1, dt * 14);
    }
    return sp;
  }
  function animFor(e, sp) {
    if (e.busy > 0) return;
    if (e.dodge > 0) return setAnim(e, 'roll', { speed: 1.4 });
    if (!e.onGround) return setAnim(e, e.vy > 0 ? 'jumpStart' : 'jump', { fade: 0.12 });
    if (e.landT > 0) return setAnim(e, 'land', { fade: 0.08 });
    if (sp < 0.5) return setAnim(e, 'idle');
    if (sp < 3.2) return setAnim(e, 'walk');
    if (sp < 8.6) { setAnim(e, 'jog'); e.fig && e.fig.speed(sp / 6.5); return; }
    setAnim(e, 'sprint'); e.fig && e.fig.speed(sp / 10);
  }

  // ------------------------------------------------------------------ Start eines Levels
  /** cfg: { mode: 'story'|'jagd'|'free', chapter, host } */
  P.start = function (cfg) {
    T = root.THREE;
    P.stop();
    const ch = cfg.chapter || null, sky = ch ? ch.sky : cfg.mode === 'jagd' ? 'sunset' : 'day';
    const rng = U.seeded(cfg.seed != null ? cfg.seed : ch ? ch.ep * 31 + 7 : (Date.now() & 0xffff));
    S = { cfg, ch, mode: cfg.mode, sky, rng, scene: new T.Scene(), group: new T.Group(), col: [], pickups: [], drones: [], npcs: [], glows: [], gates: [], relays: [], guests: [],
      time: 0, left: ch ? ch.obj.t : cfg.mode === 'jagd' ? 180 : 0, energy: 100, hurtT: 9, got: {}, gold: 0, tapes: 0, kills: 0, talks: 0, score: 0, done: false, ended: false, phase: 'play', t0: performance.now(), hud: {}, msgT: 0 };
    D.RUBRIC_IDS.forEach(r => (S.got[r] = 0));
    S.bossName = (ch && ch.obj.name) || 'Das Funkloch';
    S.net = cfg.net || null; S.remote = null; S.netT = 0; S.events = [];
    S.carry = 0; S.fed = 0; S.caught = 0; S.dist = 0; S.maxY = 0; S.swaps = 0; S.radioT = 0; S.qT = 0;
    S.fast = AMC.Save.has('shoes') ? 1.08 : 1;
    if (ch && cfg.mode === 'story' && AMC.Save.has('watch') && ch.obj.type !== 'train') S.left += 20;
    S.scene.add(S.group);
    const env = W.makeSky(S.scene, sky); S.env = env;
    W.particles.attach(S.scene);
    buildCity(sky, rng);
    { const ga = S.mode === 'free' && AMC.Save.data.giselaAt; buildGisela(ga ? ga.x : FUNKHAUS.door.x + 11, ga ? ga.z : FUNKHAUS.door.z + 3.5, ga ? ga.h : -0.35); }
    buildRico(FUNKHAUS.door.x - 6.5, FUNKHAUS.door.z + 4);
    if (AMC.Drive && !cfg.net) AMC.Drive.build(CTX);
    if (AMC.Transit) AMC.Transit.build(CTX);
    if (AMC.District) AMC.District.build(CTX);
    if (AMC.Home && cfg.mode !== 'race') AMC.Home.tire([cfg.host || 'andrew'], 0.5);
    spawnHosts(cfg.host || 'andrew', FUNKHAUS.door.x, FUNKHAUS.door.z + 6);
    W.cam.yaw = 0; W.cam.pitch = 0.32; W.cam.cur = null; W.cam.tx = S.pl.x; W.cam.ty = 1.6; W.cam.tz = S.pl.z;
    S.beacon = beam(0xff8a1e);
    setupObjective(rng);
    spawnFans(rng);
    P.active = true;
    buildHud();
    if (AMC.CityVibe) AMC.CityVibe.start(S);
    if (AMC.Career) AMC.Career.start(S);
    AMC.Audio.music(sky === 'party' ? 'party' : ch && ch.obj.type === 'boss' ? 'city' : 'city');
    return S;
  };
  P.stop = function () {
    if (!S) return;
    if (AMC.Drive) AMC.Drive.stop();
    if (AMC.CityVibe) AMC.CityVibe.stop();
    if (AMC.Career) AMC.Career.stop();
    if (AMC.District) AMC.District.stop();
    ['andrew', 'marco', 'rico'].forEach(id => { const f = W.hosts[id]; if (f && f.root.parent) f.root.parent.remove(f.root); });
    S.npcs.forEach(n => { if (n.fig) n.fig.dispose(); n.fig = null; });
    if (S.cat) { if (S.cat.mixer) S.cat.mixer.stopAllAction(); S.group.remove(S.cat.m); }
    S.group.traverse(o => { if (o.geometry && !o.isSkinnedMesh) o.geometry.dispose(); });
    const hud = U.$('hud'); hud.hidden = true; hud.innerHTML = '';
    S = null; P.active = false;
  };
  P.state = () => S;

  function setupObjective(rng) {
    const ch = S.ch, type = ch ? ch.obj.type : S.mode;
    S.type = type;
    const rubricW = ch && ch.obj.focus ? r => (r === ch.obj.focus ? 4 : 1) : () => 1;
    const pickRub = () => { const ws = D.RUBRIC_IDS.map(rubricW), sum = ws.reduce((a, b) => a + b, 0); let v = rng() * sum; for (let i = 0; i < ws.length; i++) { v -= ws[i]; if (v <= 0) return D.RUBRIC_IDS[i]; } return 'feel'; };
    const spawnFunken = n => { for (let i = 0; i < n; i++) { const [x, y, z] = freeSpot(rng); addPickup('funke', pickRub(), x, y + 1.1, z); } };
    const roofSpots = U.shuffle(S.roofs);
    const droneN = ch ? ch.drones : S.mode === 'jagd' ? 6 : S.mode === 'race' ? 3 : 4;
    if (type === 'collect' || type === 'jagd' || type === 'free') {
      spawnFunken(ch ? ch.obj.n + 8 : 26);
      roofSpots.slice(0, ch && ch.obj.gold ? 4 : 2).forEach(r => addPickup('gold', null, r.x, r.y + 1.2, r.z));
    }
    if (type === 'guest') {
      spawnFunken(12);
      S.guestNeed = ch.obj.n;
    }
    if (type === 'antenna') {
      spawnFunken(10);
      S.mastSteps.filter(s => s.big).slice(0, ch.obj.n).forEach((s, i) => {
        const g = new T.Group(); g.position.set(s.x, s.y, s.z); S.group.add(g);
        W.box(0.8, 1.1, 0.6, W.mat(0x2a2c33, { m: 0.7, r: 0.3 }), 0, 0.55, 0, g);
        const led = new T.Mesh(new T.SphereGeometry(0.14, 12, 8), new T.MeshBasicMaterial({ color: 0xff2a2a, toneMapped: false })); led.position.set(0, 1.25, 0); g.add(led);
        const gl = W.glow(0xff2a2a, 2.2, g, 0, 1.25, 0);
        S.relays.push({ x: s.x, y: s.y, z: s.z, g, led, gl, fixed: false, prog: 0 });
      });
      roofSpots.slice(0, 2).forEach(r => addPickup('gold', null, r.x, r.y + 1.2, r.z));
    }
    if (type === 'train' || type === 'race') {
      // Route über die Straßen: Haltestellen-Tore (Funk-Rennen: alle 10 Tore auf Zeit)
      const race = type === 'race';
      const route = [[0, 20], [0, 42], [-30, 45], [-45, 20], [-45, -30], [-10, -45], [30, -45], [45, -10], [45, 30], [20, 45]];
      route.slice(0, race ? route.length : ch.obj.n).forEach(([x, z], i) => {
        const g = new T.Group(); g.position.set(x, 0, z); S.group.add(g);
        const ring = new T.Mesh(new T.TorusGeometry(2.6, 0.18, 10, 40), W.mat(0x3dd6ff, { e: 0x2090ff, ei: 1.2 })); ring.position.y = 2.8; g.add(ring);
        const sgn = race ? W.textTex([String(i + 1), 'Funk-Rennen'], { w: 256, h: 256, bg: '#3a1a5a', fg: '#ff8a1e', accent: '#ffffff', size: 110 }) : W.textTex(['H', 'Haltestelle ' + (i + 1)], { w: 256, h: 256, bg: '#0a5a2a', fg: '#ffd400', accent: '#ffffff', size: 110 });
        W.sign(g, sgn, 1.3, 1.3, 3.4, 3.2, 0, 0);
        W.cyl(0.06, 0.06, 2.6, W.mat(0x888888), 3.4, 1.3, 0, g);
        S.gates.push({ x, z, g, ring, i, passed: false });
      });
      if (race) S.left = 0; else { S.left = 32; S.gateBonus = 11.5; }
      spawnFunken(8);
    }
    if (type === 'party') {
      for (let i = 0; i < ch.obj.n; i++) { const r = i < 4 ? roofSpots[i] : null; if (r) addPickup('tape', null, r.x, r.y + 1.1, r.z); else { const [x, y, z] = freeSpot(rng); addPickup('tape', null, x, y + 1.1, z); } }
      spawnFunken(10);
      S.dancers = [];
    }
    if (type === 'deliver') {
      spawnFunken(10);
      buildImbiss(PARK.x + 11, PARK.z - 10);
      S.hungryNeed = ch.obj.n;
    }
    if (type === 'cat') { spawnFunken(10); spawnCat(rng); }
    if (type === 'hunt') { spawnFunken(8); roofSpots.slice(0, 2).forEach(r => addPickup('gold', null, r.x, r.y + 1.2, r.z)); }
    if (type === 'free') S.mastTop = S.mastSteps.length ? S.mastSteps[S.mastSteps.length - 1].y : 30;
    if (type === 'boss') {
      spawnFunken(6);
      const m = droneMesh(true);
      const hp = ch.obj.hp || 9;
      S.boss = { m, x: PARK.x, y: 6, z: PARK.z + 2, hp, max: hp, phase: 0, t: 0, state: 'intro', open: 0, waves: [], hitT: 0 };
      m.position.set(S.boss.x, S.boss.y, S.boss.z);
    }
    for (let i = 0; i < droneN; i++) {
      let x, z;
      if (type === 'antenna' && i < 3) { x = MAST.x + U.rand(-6, 6); z = MAST.z + U.rand(-6, 6); }
      else[x, , z] = freeSpot(rng, 18);
      addDrone(x, z, { speed: 4.6 + (ch ? ch.ep / 12 : 0.6) });
    }
  }
  async function spawnFans(rng) {
    const n = [4, 8, 12][W.quality] + (S.mode === 'free' ? 4 + W.quality * 3 : 0) + (S.type === 'guest' ? 3 : 0) + (S.type === 'party' ? 3 : 0) + (S.type === 'deliver' ? S.hungryNeed : 0);
    const myS = S;
    for (let i = 0; i < n; i++) {
      let x, y, z;
      if (S.type === 'party' && i < 6) { x = PARK.x + Math.cos(i) * 5; z = PARK.z + 2 + Math.sin(i) * 4; y = 0.2; }
      else[x, y, z] = freeSpot(rng, 10);
      const fig = await W.makeFan(Math.floor(rng() * 1e6)).catch(() => null);
      if (S !== myS) { if (fig) fig.dispose(); return; }
      if (!fig) continue;
      const guest = S.type === 'guest' && i < S.guestNeed;
      const dancer = S.type === 'party' && i < 6, hungry = S.type === 'deliver' && i < S.hungryNeed;
      const npc = { fig, x, y, z, yaw: rng() * 6, name: D.FAN_NAMES[i % D.FAN_NAMES.length], line: D.FAN_LINES[Math.floor(rng() * D.FAN_LINES.length)], talked: false, guest, follow: false, delivered: false, dancer, hungry, fed: false, hyped: false, vx: 0, vz: 0, vy: 0, onGround: true, anim: '' };
      fig.root.position.set(x, y, z); fig.root.rotation.y = npc.yaw; S.group.add(fig.root);
      setAnim(npc, dancer ? 'dance' : 'idle');
      npc.mark = W.glow(guest ? 0xffd23f : dancer ? 0xff3da8 : hungry ? 0xff8a1e : 0x3dd6ff, 1.4, fig.root, 0, 2.35, 0);
      const tx = W.textTex([guest ? '⭐' : dancer ? '♪' : hungry ? '🍟' : '!'], { w: 128, h: 128, bg: '#14161f', size: 90, accent: guest ? '#ffd23f' : hungry ? '#ff8a1e' : '#3dd6ff' });
      npc.icon = new T.Sprite(new T.SpriteMaterial({ map: tx, depthTest: false })); npc.icon.scale.set(0.5, 0.5, 1); npc.icon.position.y = 2.35; fig.root.add(npc.icon);
      S.npcs.push(npc);
    }
  }

  // ------------------------------------------------------------------ HUD
  function buildHud() {
    const hud = U.$('hud'); hud.hidden = false;
    const ch = S.ch;
    hud.innerHTML = '<div class="h-tl"><div class="h-obj glass"><b id="hTitle"></b><span id="hObj"></span><i class="h-objbar"><em id="hObjBar"></em></i></div>' +
      '<div class="h-rub" id="hRub"></div></div>' +
      '<div class="h-tr"><canvas id="hMap" width="180" height="180" class="glass"></canvas><div class="h-time glass" id="hTime"></div></div>' +
      '<div class="h-bl"><div class="h-host glass" id="hHost"><img id="hFace" alt=""><div><b id="hName"></b><i class="h-en"><em id="hEn"></em></i><small id="hSwap"></small></div></div></div>' +
      '<div class="h-prompt" id="hPrompt"></div><div class="h-msg" id="hMsg"></div><div class="h-boss" id="hBoss" hidden><b>📡 ' + S.bossName + '</b><i><em id="hBossBar"></em></i></div><div class="h-hit" id="hHit"></div>';
    U.$('hTitle').textContent = ch ? 'Kapitel ' + (D.CHAPTERS.indexOf(ch) + 1) + ' · ' + ch.title : S.mode === 'jagd' ? 'Themenjagd' : S.mode === 'race' ? 'Funk-Rennen' : 'Funkhaus-Viertel';
    S.hud = { map: U.$('hMap').getContext('2d'), mapT: 0, txtT: 0 };
    drawRub();
    updHost();
    U.$('hMap').addEventListener('click', () => AMC.UI && AMC.UI.toast('🗺️ Orange = Ziel, Punkte = Funken, Rot = Störsender'));
  }
  function updHost() {
    const H = S.pl.H, other = S.fo.H;
    U.$('hName').textContent = H.name; U.$('hFace').src = AMC.UI.face(S.pl.id);
    U.$('hSwap').innerHTML = S.net ? '🌐 ' + other.name : AMC.glyph('y') + ' ' + other.name;
    U.$('hHost').style.setProperty('--hc', H.color);
  }
  function drawRub() {
    const el = U.$('hRub'); if (!el) return;
    el.innerHTML = D.RUBRIC_IDS.map(r => '<span style="--c:' + D.RUBRICS[r].color + '" title="' + D.RUBRICS[r].name + '">' + D.RUBRICS[r].icon + '<b>' + S.got[r] + '</b></span>').join('') +
      (S.gold || S.type === 'collect' ? '<span style="--c:#ffd23f">🌟<b>' + S.gold + '</b></span>' : '');
  }
  function msg(text, sec, local) { const m = U.$('hMsg'); if (!m) return; m.textContent = text; m.classList.add('on'); S.msgT = sec || 2.4; if (S.net === 'host' && !local) S.events.push(['msg', text]); }
  P.msg = msg;
  function objText() {
    if (S.net === 'guest' && S.netObj) return S.netObj;
    const ch = S.ch, t = S.type;
    const total = D.RUBRIC_IDS.reduce((a, r) => a + S.got[r], 0);
    if (S.done) return ['Ab ins Funkhaus! Folge dem orangen Lichtstrahl.', 1];
    if (t === 'collect') { const need = ch.obj.n, g = ch.obj.gold || 0; return ['Themen-Funken ' + Math.min(total, need) + '/' + need + (g ? ' · 🌟 ' + S.gold + '/' + g : ''), (Math.min(total, need) + Math.min(S.gold, g)) / (need + g)]; }
    if (t === 'guest') { const fol = S.npcs.filter(n => n.follow && !n.delivered).length, del = S.npcs.filter(n => n.delivered).length; return ['Gäste im Funkhaus ' + del + '/' + S.guestNeed + (fol ? ' · ' + fol + ' folgen dir' : ''), del / S.guestNeed]; }
    if (t === 'antenna') { const f = S.relays.filter(r => r.fixed).length; return ['Verteiler repariert ' + f + '/' + S.relays.length + ' – rauf auf den Sendemast!', f / S.relays.length]; }
    if (t === 'train') { const k = S.gates.filter(g => g.passed).length; return ['Haltestellen ' + k + '/' + S.gates.length + ' – lauf durch das blaue Tor', k / S.gates.length]; }
    if (t === 'deliver') return ['Satte Fans 🍟 ' + S.fed + '/' + S.hungryNeed + (S.carry ? ' · du trägst ' + S.carry + ' Tüte' + (S.carry > 1 ? 'n' : '') : ' · hol Essen am Imbiss'), S.fed / S.hungryNeed];
    if (t === 'cat') return ['Katze gefangen 🐈 ' + S.caught + '/' + ch.obj.n + ' – folge dem Lichtstrahl', S.caught / ch.obj.n];
    if (t === 'hunt') return ['KI-Drohnen abgeschaltet 🤖 ' + Math.min(S.kills, ch.obj.n) + '/' + ch.obj.n, S.kills / ch.obj.n];
    if (t === 'party') return ['Kassetten 📼 ' + S.tapes + '/' + ch.obj.n + ' · Tanzende mit ' + AMC.glyph('x') + ' anfeuern', S.tapes / ch.obj.n];
    if (t === 'boss') return [S.boss.state === 'intro' ? S.bossName + ' erscheint …' : 'Triff ' + S.bossName.replace(/^Das /, 'das ') + ', wenn der Schild offen ist', 1 - S.boss.hp / S.boss.max];
    if (t === 'race') { const k = S.gates.filter(g => g.passed).length, b = AMC.Save.data.best.race; return ['🏁 Tore ' + k + '/' + S.gates.length + ' – so schnell wie möglich!' + (b ? ' · Bestzeit ' + b.toFixed(1) + ' s' : ''), k / S.gates.length]; }
    if (t === 'jagd') return ['Sammle so viele Themen wie möglich! Punkte: ' + U.fmt(S.score), 1 - S.left / 180];
    const q = nextQuest(), er = AMC.Drive ? AMC.Drive.errandText() : '';
    if (er && (S.drive || !q)) return [er + (S.drive ? '' : ' · Marco fährt Gisela'), 0.5];
    if (q) { const v = Math.min(q.goal, q.val(S)); return ['📋 Nebenauftrag: ' + q.icon + ' ' + q.desc + ' (' + U.fmt(v) + '/' + U.fmt(q.goal) + ') · 🏢 Funkhaus & Läden betreten', v / q.goal]; }
    return ['Alle Nebenaufträge erledigt! Erkunde weiter oder geh ins Funkhaus.', 1];
  }
  function updHud(dt) {
    S.hud.txtT -= dt;
    if (S.hud.txtT <= 0) {
      S.hud.txtT = 0.15;
      const [txt, frac] = objText();
      const o = U.$('hObj'); if (o.innerHTML !== txt) o.innerHTML = txt;
      U.$('hObjBar').style.width = Math.round(U.clamp(frac, 0, 1) * 100) + '%';
      const te = U.$('hTime');
      if (S.type === 'race') { te.hidden = false; te.textContent = '⏱ ' + S.time.toFixed(1) + ' s'; te.classList.remove('warn'); }
      else if (S.left > 0 || S.mode === 'jagd' || (S.ch && S.type !== 'free')) { te.hidden = false; te.textContent = '⏱ ' + U.time(S.left); te.classList.toggle('warn', S.left < 20); } else te.hidden = true;
      U.$('hEn').style.width = S.energy + '%';
      const pr = U.$('hPrompt'), near = interactTarget();
      pr.innerHTML = near ? AMC.glyph('x') + ' ' + near.label : '';
      if (S.boss) { const b = U.$('hBoss'); b.hidden = S.boss.state === 'intro'; U.$('hBossBar').style.width = (S.boss.hp / S.boss.max * 100) + '%'; }
    }
    if (S.msgT > 0 && (S.msgT -= dt) <= 0) { const m = U.$('hMsg'); m && m.classList.remove('on'); }
    S.hud.mapT -= dt; if (S.hud.mapT <= 0) { S.hud.mapT = 0.1; drawMap(); }
  }
  function drawMap() {
    const g = S.hud.map, s = 180 / 184, cx = 90, cz = 90, X = x => cx + x * s, Z = z => cz + z * s;
    g.clearRect(0, 0, 180, 180);
    g.fillStyle = 'rgba(30,60,30,.75)'; g.fillRect(0, 0, 180, 180);
    g.fillStyle = 'rgba(160,160,170,.85)'; ROADS.forEach(r => { g.fillRect(X(r) - 5 * s, 0, 10 * s, 180); g.fillRect(0, Z(r) - 5 * s, 180, 10 * s); });
    g.fillStyle = 'rgba(255,138,30,.85)'; g.fillRect(X(FUNKHAUS.x0), Z(FUNKHAUS.z0), (FUNKHAUS.x1 - FUNKHAUS.x0) * s, (FUNKHAUS.z1 - FUNKHAUS.z0) * s);
    g.fillStyle = '#d04030'; g.fillRect(X(MAST.x) - 3, Z(MAST.z) - 3, 6, 6);
    for (const p of S.pickups) if (!p.taken) { g.fillStyle = p.kind === 'gold' ? '#ffd23f' : p.kind === 'tape' ? '#ff6ad0' : D.RUBRICS[p.rub].color; g.beginPath(); g.arc(X(p.x), Z(p.z), p.kind === 'funke' ? 2 : 3.2, 0, 7); g.fill(); }
    for (const d of S.drones) if (!d.dead) { g.fillStyle = '#ff2a3a'; g.fillRect(X(d.x) - 2, Z(d.z) - 2, 4, 4); }
    for (const n of S.npcs) if ((n.guest && !n.delivered) || (n.dancer && !n.hyped)) { g.fillStyle = n.guest ? '#ffd23f' : '#ff3da8'; g.fillText ? (g.font = '10px sans-serif', g.fillText(n.guest ? '⭐' : '♪', X(n.x) - 4, Z(n.z) + 4)) : 0; }
    for (const n of S.npcs) if (n.hungry && !n.fed) { g.font = '10px sans-serif'; g.fillText('🍟', X(n.x) - 5, Z(n.z) + 4); }
    if (S.imbiss) { g.fillStyle = '#ff8a1e'; g.fillRect(X(S.imbiss.x) - 4, Z(S.imbiss.z) - 4, 8, 8); }
    if (S.cat) { g.font = '11px sans-serif'; g.fillText('🐈', X(S.cat.x) - 6, Z(S.cat.z) + 4); }
    const ng = S.gates.find(q => !q.passed); if (ng) { g.strokeStyle = '#3dd6ff'; g.lineWidth = 2; g.beginPath(); g.arc(X(ng.x), Z(ng.z), 5, 0, 7); g.stroke(); }
    if (S.stations) for (const st of S.stations) { if (!st.sp.visible) continue; const sd = st.id.startsWith('sender:'); g.fillStyle = sd ? (D.STATIONS.find(x => 'sender:' + x.slug === st.id) || {}).color || '#fff' : '#ffffff'; g.fillRect(X(st.x) - 2.5, Z(st.z) - 2.5, 5, 5); }
    if (AMC.Transit) for (const d of AMC.Transit.mapDots()) { g.fillStyle = d.c; g.fillRect(X(d.x) - 4, Z(d.z) - 3, 8, 6); }
    if (AMC.Drive) for (const d of AMC.Drive.mapDots()) { g.fillStyle = d.c; g.beginPath(); g.arc(X(d.x), Z(d.z), d.big ? 4.5 : 2.6, 0, 7); g.fill(); if (d.big) { g.strokeStyle = '#000'; g.lineWidth = 1; g.stroke(); } }
    if (S.beacon.visible) { g.strokeStyle = '#ff8a1e'; g.lineWidth = 2.5; g.beginPath(); g.arc(X(S.beacon.position.x), Z(S.beacon.position.z), 6 + Math.sin(S.time * 6) * 1.5, 0, 7); g.stroke(); }
    // Spieler-Pfeil (Blickrichtung der Kamera)
    const p = S.pl; g.save(); g.translate(X(p.x), Z(p.z)); g.rotate(-p.yaw + Math.PI); g.fillStyle = '#fff'; g.strokeStyle = '#000'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(0, -6); g.lineTo(4.5, 5); g.lineTo(0, 2.5); g.lineTo(-4.5, 5); g.closePath(); g.fill(); g.stroke(); g.restore();
  }

  // ------------------------------------------------------------------ Interaktion
  function interactTarget(ent) {
    const p = ent || S.pl;
    if (S.drive) return { label: 'Aussteigen 🚪' };
    const dv = AMC.Drive && p === S.pl ? AMC.Drive.interact(p) : null; if (dv) return dv;
    for (const n of S.npcs) {
      const d = Math.hypot(n.x - p.x, n.z - p.z);
      if (d < 2.4) {
        if (n.guest && !n.follow && !n.delivered) return { label: 'Gast einladen', run: () => inviteGuest(n) };
        if (n.dancer && !n.hyped) return null;
        if (n.hungry && !n.fed) return S.carry > 0 ? { label: 'Essen bringen 🍟', run: () => feed(n) } : null;
        if (!n.talked && !n.guest && !n.dancer) return { label: 'Mit ' + n.name + ' sprechen', run: () => talk(n) };
      }
    }
    for (const r of S.relays) if (!r.fixed && Math.hypot(r.x - p.x, r.z - p.z) < 2.2 && Math.abs(r.y - p.y) < 1.6) return { label: 'Verteiler reparieren (halten)', hold: r };
    if (S.gisela && S.gisela.t <= 0 && Math.hypot(S.gisela.x - p.x, S.gisela.z - p.z) < 3.6) return { label: 'Gisela hupen 📯', run: honk };
    if (S.rico && S.rico.t <= 0 && Math.hypot(S.rico.x - p.x, S.rico.z - p.z) < 2.6) return { label: 'Mit RicoReWi quatschen 📱', run: ricoTalk };
    if (S.imbiss && Math.hypot(S.imbiss.x - p.x, S.imbiss.z - p.z) < 3.4 && S.carry < 3 && S.fed + S.carry < S.hungryNeed) return { label: 'Bestellungen abholen 🍟', run: pickOrder };
    if (S.ch && S.ch.radio && !S.senderDone && p === S.pl && S.stations) { const st = S.stations.find(x => x.id === 'sender:' + S.ch.radio); if (st && Math.hypot(st.x - p.x, st.z - p.z) < st.r) { const ss = D.STATIONS.find(x => x.slug === S.ch.radio); return { label: '🎙️ Interview bei ' + ss.name + ' (Bonus)', run: () => senderInterview(ss) }; } }
    if (S.mode === 'free' && S.net !== 'guest' && p === S.pl && S.stations) for (const st of S.stations) if (Math.hypot(st.x - p.x, st.z - p.z) < st.r && p.y < 2) return { label: st.label, run: () => { AMC.Audio.sfx('door'); if (P.onAction) P.onAction(st.id); else finish(true); } };
    return null;
  }
  function talk(n) {
    n.talked = true; S.talks++; n.icon.visible = false; n.mark.visible = false;
    n.fig.root.rotation.y = Math.atan2(S.pl.x - n.x, S.pl.z - n.z); setAnim(n, 'yes');
    setTimeout(() => n.fig && setAnim(n, 'idle'), 1600);
    const [text, rub] = n.line;
    S.got[rub] += 2; drawRub();
    AMC.UI.bubble(n.name, text, '+2 ' + D.RUBRICS[rub].icon + ' ' + D.RUBRICS[rub].name);
    AMC.Audio.sfx('talk'); W.particles.burst(n.x, n.y + 2, n.z, D.RUBRICS[rub].color, 16);
    S.score += 150;
  }
  function inviteGuest(n) {
    n.follow = true; n.icon.visible = false; S.talks++;
    AMC.UI.bubble(n.name, U.pick(['Ich bin dabei! Ab ins Studio!', 'Echt jetzt? Ich darf in den Podcast? Los!', 'Meine Weihnachtsgeschichte wird euch umhauen!', 'Ich bin der Typ, der Geschenke erst an Heiligabend kauft. Erzähl ich gern!']), 'Gast folgt dir ⭐');
    AMC.Audio.sfx('ok');
    S.beacon.visible = true; S.beacon.position.set(FUNKHAUS.door.x, 0, FUNKHAUS.door.z + 1);
  }

  // ------------------------------------------------------------------ Aktionen
  function doWave(ent, fxOnly) {
    const p = ent || S.pl, H = p.H;
    if (p.cd > 0 && !fxOnly) return;
    p.cd = 0.9; p.busy = 0.35; setAnim(p, 'push', { speed: 1.6, once: true, restart: true });
    AMC.Audio.sfx('wave');
    // sichtbarer Ring
    const ring = new T.Mesh(new T.RingGeometry(0.88, 1, 48), new T.MeshBasicMaterial({ color: H.id === 'marco' ? 0x3dd6ff : 0xffb02e, transparent: true, opacity: 0.6, side: T.DoubleSide, blending: T.AdditiveBlending, depthWrite: false, toneMapped: false }));
    ring.rotation.x = -Math.PI / 2; ring.position.set(p.x, p.y + 0.9, p.z); S.group.add(ring); S.rings = S.rings || []; S.rings.push({ m: ring, t: 0, max: H.wave, e: p });
    W.particles.burst(p.x, p.y + 1.2, p.z, H.id === 'marco' ? 0x3dd6ff : 0xffb02e, 18, { speed: 7, up: 0, grav: 0, life: 0.5 });
    if (fxOnly) return;   // Gast: Wirkung rechnet der Gastgeber
    for (const d of S.drones) {
      if (d.dead) continue;
      const dist = Math.hypot(d.x - p.x, d.z - p.z);
      if (dist < H.wave + 0.6 && Math.abs(d.y - p.y - 1) < 3) {
        d.hp -= H.waveDmg; d.stun = H.id === 'andrew' ? 3.2 : 1.6; const k = 9 / Math.max(1, dist);
        d.vx = (d.x - p.x) * k; d.vz = (d.z - p.z) * k; AMC.Audio.sfx('zap');
        if (d.hp <= 0) killDrone(d);
      }
    }
    // Tanzende anfeuern
    for (const n of S.npcs) if (n.dancer && !n.hyped && Math.hypot(n.x - p.x, n.z - p.z) < H.wave + 1.5) {
      n.hyped = true; n.icon.visible = false; S.left += 6; msg('🕺 Stimmung! +6 Sekunden', 1.6); AMC.Audio.sfx('cheer'); W.particles.burst(n.x, n.y + 2, n.z, 0xff3da8, 24, { speed: 6 }); S.score += 200;
    }
    // Boss
    const b = S.boss;
    if (b && b.state !== 'intro' && b.state !== 'dead' && b.open > 0 && Math.hypot(b.x - p.x, b.z - p.z) < H.wave + 3 && b.y < 4.5) {
      b.hp -= H.id === 'marco' ? 1.5 : 1; b.hitT = 0.3; AMC.Audio.sfx('hit'); W.cam.shake = 0.5;
      W.particles.burst(b.x, b.y, b.z, 0x8a3dff, 40, { speed: 9 });
      if (b.hp <= 0) bossDown();
      else if (b.hp <= b.max * (2 - b.phase) / 3) { b.phase++; b.open = 0; b.state = 'rise'; b.t = 0; msg('📡 ' + S.bossName + ' wird wütend! Phase ' + (b.phase + 1), 2); AMC.Audio.sfx('boss'); }
    }
  }
  function killDrone(d) {
    d.dead = true; d.m.visible = false; d.respawn = S.type === 'boss' ? 1e9 : 22; S.kills++; S.score += 250;
    W.particles.burst(d.x, d.y, d.z, 0xff3a3a, 36, { speed: 8 }); W.particles.burst(d.x, d.y, d.z, 0xffd060, 16, { speed: 5 });
    AMC.Audio.sfx('hit'); W.cam.shake = 0.25;
    if (Math.random() < 0.5 && S.type !== 'boss') addPickup('funke', U.pick(D.RUBRIC_IDS), d.x, Math.max(1.2, groundAt(d.x, d.z, d.y) + 1.1), d.z);
  }
  function hurt(dmg, fromX, fromZ, ent) {
    if (ent && ent === S.fo && S.net === 'host') { if (S.foInv > 0 || S.ended) return; S.foInv = 1.2; if (AMC.Save.has('power')) dmg *= 0.7; S.energy = Math.max(0, S.energy - dmg); S.hurtT = 0; S.events.push(['hurt', fromX, fromZ]); if (S.energy <= 0) { S.energy = 70; msg('📴 Sendepause! Ihr verliert 10 Sekunden.', 2.4); if (S.left > 0) S.left = Math.max(1, S.left - 10); } return; }
    const p = S.pl; if (p.inv > 0 || p.dodge > 0 || S.ended) return;
    if (AMC.Save.has('power')) dmg *= 0.7;
    S.energy = Math.max(0, S.energy - dmg); p.inv = 1.2; S.hurtT = 0;
    const dx = p.x - fromX, dz = p.z - fromZ, l = Math.hypot(dx, dz) || 1; p.vx = dx / l * 10; p.vz = dz / l * 10; p.vy = 5;
    AMC.Audio.sfx('static'); W.cam.shake = 0.6; const h = U.$('hHit'); if (h) { h.classList.remove('on'); void h.offsetWidth; h.classList.add('on'); }
    if (S.energy <= 0) {
      S.energy = 70; msg('📴 Sendepause! Du verlierst 3 Funken und 10 Sekunden.', 2.6);
      let lost = 3; for (const r of U.shuffle(D.RUBRIC_IDS)) while (lost > 0 && S.got[r] > 0) { S.got[r]--; lost--; }
      if (S.left > 0) S.left = Math.max(1, S.left - 10); drawRub();
      p.x = FUNKHAUS.door.x; p.z = FUNKHAUS.door.z + 5; p.y = 0.5; p.vx = p.vz = 0;
    }
  }
  function swapHost() {
    const a = S.pl, b = S.fo;
    S.pl = b; S.fo = a; S.pl.vx = a.vx; S.pl.vz = a.vz; S.swaps++;
    AMC.Audio.sfx('swap'); W.particles.burst(S.pl.x, S.pl.y + 1, S.pl.z, 0xff8a1e, 26, { speed: 4 });
    updHost(); msg('Jetzt spielst du ' + S.pl.H.name + ' – ' + S.pl.H.perk, 3);
  }

  function bossDown() {
    const b = S.boss; b.state = 'dead'; b.open = 0; AMC.Audio.sfx('win'); W.cam.shake = 1;
    for (let i = 0; i < 5; i++) setTimeout(() => S && W.particles.burst(b.x + U.rand(-2, 2), b.y + U.rand(-1, 2), b.z + U.rand(-2, 2), U.pick([0x8a3dff, 0xff8a1e, 0x3dd6ff]), 40, { speed: 10 }), i * 180);
    setTimeout(() => {
      if (!S) return; b.m.visible = false; S.drones.forEach(d => { if (!d.dead) killDrone(d); });
      // Kein Fantasiewesen: Hinter der Störsender-Drohne steckt ein echter Mensch – jetzt wird gerangelt
      if (AMC.Drive && !S.net && AMC.Drive.spawnRival) {
        const name = (S.ch && S.ch.obj.rival) || 'Ralf Rauschmann';
        msg('🎛️ Die Drohne ist down! ' + name + ' springt aus dem Störsender-Wagen – schnapp ihn dir und rangel ihn mit ' + AMC.glyph('x') + ' nieder!', 4);
        AMC.Drive.spawnRival(name, b.x, b.z, () => { msg('🤼 ' + name + ' gibt auf: „Okay, okay! Ich mach ab jetzt auch einen Podcast. Einen netten.“', 4); objectiveDone(); });
      } else objectiveDone();
    }, 1100);
  }
  function objectiveDone() {
    if (S.done) return; S.done = true; AMC.Audio.sfx('star');
    if (S.mode === 'jagd' || S.mode === 'free') return;
    S.beacon.visible = true; S.beacon.position.set(FUNKHAUS.door.x, 0, FUNKHAUS.door.z + 1);
    msg('✅ Geschafft! Ab ins Funkhaus – die Aufnahme wartet!', 3);
  }
  function finish(ok, reason) {
    if (S.ended) return; S.ended = true;
    const res = { ok, reason, got: Object.assign({}, S.got), gold: S.gold, kills: S.kills, talks: S.talks, tapes: S.tapes, left: S.left, time: S.time, score: S.score, host: S.pl.id };
    AMC.Save.data.stats.funken += D.RUBRIC_IDS.reduce((a, r) => a + S.got[r], 0); AMC.Save.data.stats.drones += S.kills; AMC.Save.save();
    if (ok) AMC.Audio.sfx('door');
    P.onEnd && P.onEnd(res);
  }

  // ------------------------------------------------------------------ Bild für Bild
  P.update = function (dt) {
    if (!S || S.ended) return;
    S.time += dt;
    const p = S.pl, H = p.H, cam = W.cam;
    const driving = !S.net && AMC.Drive ? AMC.Drive.update(dt) : false;
    let sp = 0; const f = S.fo;
    if (!driving) {
    // Eingaben
    if (I.hit('swap') && !S.net) swapHost();
    const fwdX = -Math.sin(cam.yaw), fwdZ = -Math.cos(cam.yaw), rX = Math.cos(cam.yaw), rZ = -Math.sin(cam.yaw);
    let wx = rX * I.move.x + fwdX * I.move.y, wz = rZ * I.move.x + fwdZ * I.move.y;
    const mag = Math.min(1, Math.hypot(wx, wz)); if (mag > 0.01) { const l = Math.hypot(wx, wz); wx /= l; wz /= l; }
    const sprint = I.sprint || (I.device === 'touch' && mag > 0.92);
    let speed = H.speed * mag * (sprint ? 1.55 : 1) * (S.fast || 1);
    if (I.hit('jump') && (p.onGround || p.jumps < 2)) {
      p.vy = p.onGround ? H.jump : H.jump * 0.85; p.jumps = p.onGround ? 1 : 2; p.onGround = false; AMC.Audio.sfx('jump');
      if (p.jumps === 2) { W.particles.burst(p.x, p.y + 0.2, p.z, 0xffffff, 10, { speed: 3, up: -1, life: 0.4 }); setAnim(p, 'ninja', { restart: true }); }
    }
    if (!I.jumpHeld && p.vy > 3) p.vy *= 0.88;   // kurz tippen = kleiner Sprung
    if (I.hit('dodge') && p.dodge <= 0 && !(p.cd2 > 0)) {
      p.dodge = 0.42; p.cd2 = 0.75; const dx = mag > 0.1 ? wx : Math.sin(p.yaw), dz = mag > 0.1 ? wz : Math.cos(p.yaw); p.vx = dx * 15; p.vz = dz * 15; AMC.Audio.sfx('dash');
    }
    const it = interactTarget(), held = I.keys.has('KeyE') || I.keys.has('Enter') || padHeld(2) || AMC.UI.touchHeld('x');
    if (S.net === 'guest') { if (I.hit('act')) { if (!it || !it.hold) { if (!(p.cd > 0)) { doWave(p, true); p.cd = 0.9; p.busy = 0.35; setAnim(p, 'push', { speed: 1.6, once: true, restart: true }); AMC.Audio.sfx('wave'); } } S.events.push(['act']); } S.holding = !!(it && it.hold && held); if (S.holding) { p.busy = 0.1; setAnim(p, 'knock'); } }
    else if (I.hit('act')) { if (it && it.run) it.run(); else if (!it || !it.hold) doWave(); }
    if (S.net !== 'guest' && it && it.hold && held) {
      const r = it.hold; r.prog += dt / (H.id === 'marco' ? 0.8 : 1.6); p.busy = 0.1; setAnim(p, 'knock');
      if (Math.random() < dt * 12) W.particles.burst(r.x, r.y + 1, r.z, 0x3dd6ff, 3, { speed: 3, life: 0.4 });
      if (r.prog >= 1) { r.fixed = true; r.led.material.color.set(0x30ff60); r.gl.material.color.set(0x30ff60); AMC.Audio.sfx('perfect'); msg('🔧 Verteiler läuft wieder!', 2); S.score += 500; W.particles.burst(r.x, r.y + 1.2, r.z, 0x30ff60, 30); }
    }
    p.cd = Math.max(0, p.cd - dt); p.cd2 = Math.max(0, (p.cd2 || 0) - dt); p.inv = Math.max(0, p.inv - dt); p.busy = Math.max(0, p.busy - dt); p.landT = Math.max(0, p.landT - dt);
    if (p.dodge > 0) { p.dodge -= dt; sp = moveBody(p, dt, p.vx / 15, p.vz / 15, 15, 30); }
    else sp = moveBody(p, dt, wx, wz, speed, p.onGround ? 12 : 4);
    animFor(p, sp);
    if (p.fig) p.fig.root.visible = !S.drive && !(p.inv > 0 && Math.floor(S.time * 20) % 2);
    // Mitspieler: online vom anderen Gerät gesteuert
    if (S.net) netRemote(dt, f);
    else {
    const tx = p.x - Math.sin(p.yaw) * 2.2 + Math.cos(p.yaw) * 1.1, tz = p.z - Math.cos(p.yaw) * 2.2 - Math.sin(p.yaw) * 1.1;
    let fdx = tx - f.x, fdz = tz - f.z; const fd = Math.hypot(fdx, fdz);
    if (fd > 24 || Math.abs(p.y - f.y) > 4 && fd < 5) { f.x = tx; f.z = tz; f.y = p.y; f.vy = 0; W.particles.burst(f.x, f.y + 1, f.z, 0xff8a1e, 12); }
    if (fd > 0.01) { fdx /= fd; fdz /= fd; }
    if (p.y > f.y + 0.9 && f.onGround && fd < 6) { f.vy = 8; f.onGround = false; }
    const fsp = moveBody(f, dt, fdx, fdz, fd > 2 ? Math.min(11, H.speed * (fd > 6 ? 1.6 : 1)) : 0, 8);
    animFor(f, fsp);
    }
    }
    if (p.fig) p.fig.update(dt); if (f.fig) f.fig.update(dt);
    if (S.foInv > 0) S.foInv -= dt;
    if (S.net === 'guest') { netGuestFrame(dt, sp); return; }
    // Energie
    S.hurtT += dt; if (S.hurtT > 4) S.energy = Math.min(100, S.energy + dt * 6);
    // Zeit
    if (S.left > 0 && S.mode !== 'free') { S.left -= dt; if (S.left <= 0) { S.left = 0; if (S.mode === 'jagd') return finish(true, 'time'); if (!S.done) return finish(false, 'time'); } }
    updPickups(dt); updDrones(dt); updNpcs(dt); if (AMC.Transit) AMC.Transit.update(dt); if (AMC.District) AMC.District.update(dt); if (AMC.CityVibe) AMC.CityVibe.update(dt, S); if (AMC.Career) AMC.Career.update(dt, S); updObjective(dt); updRings(dt);
    if (S.rico) { S.rico.f.update(dt); if (S.rico.t > 0) S.rico.t -= dt; }
    if (S.gisela) { if (S.gisela.t > 0) S.gisela.t -= dt; S.gisela.g.position.y = S.gisela.t > 0 ? Math.abs(Math.sin(S.time * 18)) * 0.06 : 0; }
    if (S.boss) updBoss(dt);
    if (S.cat) updCat(dt);
    if (S.mode === 'free') updQuests(dt, sp);
    if (S.net === 'host') netHostFrame(dt);
    // Tür
    if (S.done && S.mode === 'story' && [p].concat(S.net === 'host' ? [S.fo] : []).some(e => Math.hypot(FUNKHAUS.door.x - e.x, FUNKHAUS.door.z - e.z) < 3 && e.y < 1.5)) return finish(true);
    // Effekte
    if (S.ch && S.ch.radio && !S.senderHint && S.time > 8) { S.senderHint = true; const ss = D.STATIONS.find(x => x.slug === S.ch.radio); if (ss) msg('📻 Tipp: Im Senderhaus von ' + ss.name + ' wartet ein Interview – Bonus-Funken! (Quadrat auf der Karte)', 4); }
    if (S.stations) for (const st of S.stations) { st.sp.visible = S.mode === 'free' || (!!S.ch && st.id === 'sender:' + S.ch.radio && !S.senderDone); st.sp.position.y = 2.9 + Math.sin(S.time * 2.4 + st.x) * 0.15; }
    S.beacon.rotation.y += dt; if (S.doorMesh) S.doorMesh.material.emissiveIntensity = S.done ? 1 + Math.sin(S.time * 6) * 0.6 : 0.8;
    if (S.mastBlink) S.mastBlink.material.opacity = Math.sin(S.time * 4) > 0 ? 1 : 0.15;
    if (S.snow) { const a = S.snow.geometry.attributes.position.array; for (let i = 1; i < a.length; i += 3) { a[i] -= dt * 2.2; if (a[i] < 0) a[i] = 40; } S.snow.geometry.attributes.position.needsUpdate = true; S.snow.position.set(Math.round(p.x / 10) * 10, 0, Math.round(p.z / 10) * 10); }
    if (S.stageLights) S.stageLights.forEach((l, i) => { l.target.position.set(PARK.x + Math.sin(S.time * 0.9 + i * 1.7) * 9, 0, PARK.z + Math.cos(S.time * 0.7 + i) * 8); });
    W.particles.update(dt);
    // Licht folgt (Schatten um den Spieler)
    const sun = S.env.sun, sp0 = W.SKIES[S.sky].sunPos;
    sun.position.set(p.x + sp0[0] * 0.5, sp0[1] * 0.5, p.z + sp0[2] * 0.5); sun.target.position.set(p.x, 0, p.z);
    W.updateCamera(dt, p, solidAt);
    updHud(dt);
  };
  function padHeld(btn) { const ps = I.pads(); return ps[0] && ps[0].buttons[btn] && ps[0].buttons[btn].pressed; }

  function updPickups(dt) {
    const who = S.net === 'host' ? [S.pl, S.fo] : [S.pl];
    for (const k of S.pickups) {
      if (k.taken) continue;
      k.t += dt; k.m.position.y = k.y + Math.sin(k.t * 2.4) * 0.18; k.m.rotation.y += dt * 2;
      if (k.m.userData.ring) k.m.userData.ring.rotation.z += dt;
      if (S.net === 'guest') continue;
      const p = who.find(e => { const dx = k.x - e.x, dz = k.z - e.z, dy = k.y - (e.y + 0.9); return dx * dx + dz * dz < 1.6 && Math.abs(dy) < 1.6; });
      if (p) {
        k.taken = true; k.m.visible = false; k.dirty = true;
        if (k.kind === 'gold') { S.gold++; S.score += 800; AMC.Audio.sfx('gold'); msg('🌟 Goldene Erinnerung!', 1.8); W.particles.burst(k.x, k.y, k.z, 0xffd23f, 40, { speed: 7 }); }
        else if (k.kind === 'tape') { S.tapes++; S.score += 400; AMC.Audio.sfx('gold'); W.particles.burst(k.x, k.y, k.z, 0xff6ad0, 30, { speed: 6 }); msg('📼 Mixtape ' + S.tapes + ' gefunden!', 1.6); }
        else { S.got[k.rub]++; S.score += 100; AMC.Audio.sfx('collect'); W.particles.burst(k.x, k.y, k.z, D.RUBRICS[k.rub].color, 22, { speed: 5 }); if (S.mode === 'jagd' || S.mode === 'free') setTimeout(() => respawnPickup(k), 9000); }
        drawRub();
      }
    }
  }
  function respawnPickup(k) { if (!S || S.ended) return; const [x, y, z] = freeSpot(S.rng); k.x = x; k.y = y + 1.1; k.z = z; k.m.position.set(x, k.y, z); k.taken = false; k.m.visible = true; k.dirty = true; }
  function updDrones(dt) {
    const p = S.pl;
    for (const d of S.drones) {
      if (d.dead) { if ((d.respawn -= dt) <= 0) { const [x, , z] = freeSpot(S.rng, 20); Object.assign(d, { x, z, hx: x, hz: z, hp: 2, dead: false, y: 8 }); d.m.visible = true; } continue; }
      d.a += dt;
      const tgt = S.net === 'host' && Math.hypot(S.fo.x - d.x, S.fo.z - d.z) < Math.hypot(S.pl.x - d.x, S.pl.z - d.z) ? S.fo : S.pl;
      const p = tgt, dist = Math.hypot(p.x - d.x, p.z - d.z), U2 = d.m.userData;
      U2.rotors.forEach((r, i) => (r.rotation.y += dt * (d.stun > 0 ? 4 : 30) * (i % 2 ? 1 : -1)));
      U2.tip.material.opacity = Math.sin(d.a * 8) > 0 ? 1 : 0.2;
      if (d.stun > 0) {
        d.stun -= dt; d.x += d.vx * dt; d.z += d.vz * dt; d.vx *= 0.92; d.vz *= 0.92; d.m.rotation.z = Math.sin(d.a * 20) * 0.4;
        U2.eye.material.color.set(0x553333);
      } else {
        U2.eye.material.color.set(0xff2a3a); d.m.rotation.z *= 0.9;
        let tx, tz;
        if (dist < 15 && Math.abs(p.y - d.y) < 8 && S.mode !== 'free' || dist < 7) { tx = p.x; tz = p.z; d.state = 'chase'; }
        else { d.state = 'patrol'; tx = d.hx + Math.cos(d.a * 0.5) * 7; tz = d.hz + Math.sin(d.a * 0.5) * 7; }
        const dx = tx - d.x, dz = tz - d.z, l = Math.hypot(dx, dz) || 1, sp = d.state === 'chase' ? d.speed : 2.4;
        d.vx = U.damp(d.vx, dx / l * sp, 3, dt); d.vz = U.damp(d.vz, dz / l * sp, 3, dt);
        d.x += d.vx * dt; d.z += d.vz * dt;
        d.m.rotation.y = Math.atan2(d.vx, d.vz);
        if (dist < 1.1 && Math.abs(p.y + 1 - d.y) < 1.5) hurt(18, d.x, d.z, p);
      }
      const gy = groundAt(d.x, d.z, 50, 0.5), ty = (d.state === 'chase' ? Math.max(gy, p.y) + 1.3 : gy + 2.4) + Math.sin(d.a * 3) * 0.25;
      d.y = U.damp(d.y, ty, 3, dt);
      d.x = U.clamp(d.x, -88, 88); d.z = U.clamp(d.z, -88, 88);
      d.m.position.set(d.x, d.y, d.z); U2.ring.rotation.z += dt * 3;
    }
  }
  function updNpcs(dt) {
    const p = S.pl;
    for (const n of S.npcs) {
      if (!n.fig) continue;
      n.fig.update(dt);
      if (n.icon && n.icon.visible) n.icon.position.y = 2.35 + Math.sin(S.time * 3 + n.x) * 0.08;
      if (n.follow && !n.delivered) {
        const dx = p.x - n.x, dz = p.z - n.z, d = Math.hypot(dx, dz);
        const sp = d > 2.6 ? Math.min(9, d * 1.6) : 0;
        if (d > 30) { n.x = p.x - 2; n.z = p.z - 2; n.y = p.y; }
        const e = n; e.vy = e.vy || 0;
        const s = moveBody(e, dt, d > 0.01 ? dx / d : 0, d > 0.01 ? dz / d : 0, sp, 8);
        if (p.y > n.y + 0.9 && n.onGround && d < 4) { n.vy = 8.5; n.onGround = false; }
        setAnim(n, s < 0.4 ? 'idle' : s < 3.4 ? 'walk' : 'jog');
        n.yaw = n.fig.root.rotation.y;
        if (Math.hypot(FUNKHAUS.door.x - n.x, FUNKHAUS.door.z - n.z) < 4) {
          n.delivered = true; n.fig.root.visible = false; AMC.Audio.sfx('door'); W.particles.burst(n.x, n.y + 1, n.z, 0xffd23f, 30);
          S.score += 600; msg('⭐ ' + n.name + ' ist im Studio!', 2);
        }
      } else if (!n.dancer) {
        // zum Spieler drehen, wenn nah
        const d = Math.hypot(p.x - n.x, p.z - n.z);
        if (d < 5) { n.fig.root.rotation.y += U.angDiff(n.fig.root.rotation.y, Math.atan2(p.x - n.x, p.z - n.z)) * Math.min(1, dt * 4); if (n.anim === 'walk') setAnim(n, 'idle'); }
        else if (!n.guest && !n.hungry && d < 60) {   // Passanten schlendern umher
          n.hx = n.hx == null ? n.x : n.hx; n.hz = n.hz == null ? n.z : n.hz; n.wt = (n.wt || (n.x * 7) % 6) + dt * 0.25;
          const tx = n.hx + Math.cos(n.wt) * 4, tz = n.hz + Math.sin(n.wt * 0.8) * 4, dx = tx - n.x, dz = tz - n.z, dd = Math.hypot(dx, dz);
          const s2 = moveBody(n, dt, dd > 0.3 ? dx / dd : 0, dd > 0.3 ? dz / dd : 0, dd > 0.3 ? 1.3 : 0, 4); setAnim(n, s2 > 0.4 ? 'walk' : 'idle');
        }
      }
    }
  }
  function updObjective() {
    if (S.done) return;
    const t = S.type, ch = S.ch, total = D.RUBRIC_IDS.reduce((a, r) => a + S.got[r], 0);
    if (t === 'collect' && total >= ch.obj.n && S.gold >= (ch.obj.gold || 0)) objectiveDone();
    if (t === 'guest' && S.npcs.filter(n => n.delivered).length >= S.guestNeed) { objectiveDone(); finishSoon(); }
    if (t === 'antenna' && S.relays.length && S.relays.every(r => r.fixed)) objectiveDone();
    if (t === 'party' && S.tapes >= ch.obj.n) objectiveDone();
    if (t === 'deliver') { if (S.fed >= S.hungryNeed) objectiveDone(); else { S.beacon.visible = true; const h = S.carry > 0 ? S.npcs.filter(n => n.hungry && !n.fed).sort((a, b) => Math.hypot(a.x - S.pl.x, a.z - S.pl.z) - Math.hypot(b.x - S.pl.x, b.z - S.pl.z))[0] : null; if (h) S.beacon.position.set(h.x, 0, h.z); else S.beacon.position.set(S.imbiss.x, 0, S.imbiss.z); } }
    if (t === 'cat') { if (S.caught >= ch.obj.n) objectiveDone(); else { S.beacon.visible = true; S.beacon.position.set(S.cat.x, 0, S.cat.z); } }
    if (t === 'hunt' && S.kills >= ch.obj.n) objectiveDone();
    if (t === 'train' || t === 'race') {
      const g = S.gates.find(q => !q.passed), race = t === 'race';
      S.gates.forEach(q => { q.ring.material.emissive.set(q === g ? 0x2090ff : q.passed ? 0x20a040 : 0x222233); q.ring.rotation.y += 0.02; });
      if (g) { S.beacon.visible = true; S.beacon.position.set(g.x, 0, g.z); if (Math.hypot(S.pl.x - g.x, S.pl.z - g.z) < 2.8 || (S.net === 'host' && Math.hypot(S.fo.x - g.x, S.fo.z - g.z) < 2.8)) { g.passed = true; AMC.Audio.sfx('perfect'); W.particles.burst(g.x, 2.8, g.z, 0x3dd6ff, 30); S.score += 300; if (race) msg('🏁 Tor ' + (g.i + 1) + '/' + S.gates.length + ' · ' + S.time.toFixed(1) + ' s', 1.2); else { S.left += S.gateBonus; msg('🚉 Haltestelle ' + (g.i + 1) + ' · +' + S.gateBonus + ' s', 1.4); } } }
      else if (race) { objectiveDone(); return finish(true, 'race'); }
      else objectiveDone();
    }
  }
  function finishSoon() { /* Gäste sind schon im Funkhaus – Tür bleibt das Ziel */ }
  function updRings(dt) {
    if (!S.rings) return;
    S.rings = S.rings.filter(r => { r.t += dt; const k = r.t / 0.35, s = 0.4 + k * r.max; r.m.scale.set(s, s, s); r.m.material.opacity = Math.max(0, 0.6 * (1 - k)); const e = r.e || S.pl; r.m.position.set(e.x, e.y + 0.9, e.z); if (k >= 1) { S.group.remove(r.m); r.m.geometry.dispose(); return false; } return true; });
  }
  // ------------------------------------------------------------------ Gisela: Marcos umgebauter Camper parkt vor dem Funkhaus (hupen!)
  function buildGisela(x, z, h) {
    if (!AMC.StudioEdit) return;
    const g = AMC.StudioEdit.camper(1); if (AMC.Camper) AMC.Camper.decorate(g); g.position.set(x, 0, z); g.rotation.y = h; S.group.add(g);
    g.traverse(o => { if (o.isMesh) { o.castShadow = W.quality > 0; o.receiveShadow = true; } });
    const c = Math.cos(h), sn = Math.sin(h), hw = 1.1, hl = 2.3, xs = [], zs = [];
    [[-hw, -hl], [hw, -hl], [-hw, hl], [hw, hl]].forEach(([a, b]) => { xs.push(x + a * c + b * sn); zs.push(z - a * sn + b * c); });
    addBox(Math.min(...xs) + 0.4, Math.max(...xs) - 0.4, Math.min(...zs) + 0.4, Math.max(...zs) - 0.4, 2.1);
    S.gisela = { x, z, g, t: 0, honk: 0 };
  }
  const HONK = [['m', 'Das ist Gisela! Umgebaut mit meinen eigenen Händen. Und etwas Panzertape.'], ['a', 'Marco, die Tür hängt schief.'], ['m', 'Das ist kein Fehler, das ist Charakter!'],
    ['a', 'Ich glaub, Gisela hat gerade ein Kabel verloren.'], ['m', 'Gisela fährt mit Liebe. Und mit ein bisschen Diesel.'], ['a', 'Wann machen wir endlich die Podcast-Tour mit ihr?'], ['m', 'Psst, nicht so laut – sie ist empfindlich.']];
  // RicoReWi: Social-Media-Junkie vor dem Funkhaus, immer am Planen (Handy, Tools, Ideen)
  function buildRico(x, z) {
    const f = W.hosts.rico; if (!f) return;
    S.group.add(f.root); f.root.position.set(x, 0, z); f.root.rotation.y = 0.6; f.root.visible = true; f.play('idle');
    S.rico = { x, z, f, t: 0, n: 0 };
  }
  function ricoTalk() {
    const R = S.rico; R.t = 1.2; R.n++;
    R.f.root.rotation.y = Math.atan2(S.pl.x - R.x, S.pl.z - R.z); R.f.play('arms', { fade: 0.2 }); setTimeout(() => S && S.rico && R.f.play('idle', { fade: 0.4 }), 1700);
    const first = R.n === 1, rub = U.pick(D.RUBRIC_IDS);
    if (first) { S.got[rub] += 3; drawRub(); S.score += 200; }
    AMC.UI.bubble('RicoReWi', U.pick(D.RICO_LINES), first ? '+3 ' + D.RUBRICS[rub].icon + ' ' + D.RUBRICS[rub].name + ' · Rico teilt euch' : null);
    AMC.Audio.sfx('talk'); W.particles.burst(R.x, 2.2, R.z, 0xa46bff, 14);
  }
  function honk() {
    const G2 = S.gisela; G2.honk++; G2.t = 0.6; S.honks = (S.honks || 0) + 1;
    AMC.Audio.sfx('horn'); W.particles.burst(G2.x, 2.6, G2.z, 0xff8a1e, 26, { speed: 5 }); W.particles.burst(G2.x, 0.6, G2.z, 0xcccccc, 14, { speed: 2, up: 1 });
    const L = HONK[(G2.honk - 1) % HONK.length]; msg((L[0] === 'm' ? 'Marco: ' : 'Andrew: ') + L[1], 3.2);
    if (G2.honk === 3) { S.score += 300; msg('📯 Hup-Konzert! +300 – Gisela ist begeistert.', 2.6); }
  }

  // ------------------------------------------------------------------ Imbiss (Kapitel „Imbisskind“)
  function buildImbiss(x, z) {
    const g = new T.Group(); g.position.set(x, 0, z); S.group.add(g);
    W.box(4.2, 2.2, 2.2, W.mat(0xf4f4f4, { r: 0.6 }), 0, 1.1, 0, g);
    W.box(4.4, 0.18, 1.2, W.mat(0x8a5a2b), 0, 1.25, 1.5, g);
    const aw = W.box(4.6, 0.16, 1.8, W.mat(0xff8a1e, { e: 0x331500 }), 0, 2.8, 1.2, g); aw.rotation.x = 0.25;
    [-1.9, 1.9].forEach(px => W.cyl(0.06, 0.06, 2.8, W.mat(0x888888, { m: 0.8 }), px, 1.4, 2.0, g));
    W.sign(g, W.textTex(['🍟 IMBISS', 'Mensakind oder Imbisskind?'], { size: 60 }), 4, 1.3, 0, 3.8, 0, 0, true);
    W.glow(0xffb347, 4, g, 0, 2.4, 1.6);
    addBox(x - 2.1, x + 2.1, z - 1.1, z + 1.1, 2.2);
    S.imbiss = { x, z: z + 2.4, g };
  }
  function pickOrder() {
    const n = Math.min(3, S.hungryNeed - S.fed - S.carry); if (n <= 0) return;
    S.carry += n; AMC.Audio.sfx('buy'); msg('🍟 ' + n + ' Bestellung' + (n > 1 ? 'en' : '') + ' eingepackt – ab zu den hungrigen Fans!', 2.4);
    W.particles.burst(S.imbiss.x, 2, S.imbiss.z, 0xffb347, 24, { speed: 5 });
  }
  function feed(n) {
    S.carry--; S.fed++; n.fed = true; n.icon.visible = false; n.mark.visible = false; S.score += 500;
    n.fig.root.rotation.y = Math.atan2(S.pl.x - n.x, S.pl.z - n.z); setAnim(n, 'yes'); setTimeout(() => n.fig && setAnim(n, 'idle'), 1600);
    const rub = U.pick(['feel', 'serious', 'tv']); S.got[rub] += 2; drawRub();
    AMC.UI.bubble(n.name, U.pick(['Pommes rot-weiß! Ihr seid die Besten!', 'Currywurst! Ich bin eindeutig Imbisskind.', 'Mensa war gestern. Danke, Jungs!', 'Mit extra Zwiebeln? Ihr kennt mich!']), '+2 ' + D.RUBRICS[rub].icon + ' ' + D.RUBRICS[rub].name);
    AMC.Audio.sfx('cheer'); W.particles.burst(n.x, n.y + 2, n.z, 0xff8a1e, 26, { speed: 6 });
  }
  // ------------------------------------------------------------------ Katze (Kapitel „Die Katze und die Gurke“)
  function spawnCat(rng) {
    if (!W.cat) { S.catFake = true; }
    const [x, , z] = freeSpot(rng, 25);
    const c = { x, y: 0.2, z, vx: 0, vz: 0, vy: 0, onGround: true, yaw: 0, tire: 0, rest: 0, jumpT: 0 };
    if (W.cat) {
      const m = W.cat.scene; m.position.set(0, 0, 0); m.scale.set(1, 1, 1); m.rotation.set(0, 0, 0); m.updateMatrixWorld(true);
      const box = new T.Box3().setFromObject(m), h = box.max.y - box.min.y || 1, k = 0.85 / h;
      m.scale.setScalar(k); m.traverse(o => { if (o.isMesh) { o.castShadow = true; o.frustumCulled = false; } });
      // ein Mixer für die Katze über alle Läufe (sonst kollidieren Bindungen am selben Modell)
      if (!W.cat.mixer) { W.cat.mixer = new T.AnimationMixer(m); W.cat.act = {}; W.cat.animations.forEach(a => (W.cat.act[a.name] = W.cat.mixer.clipAction(a))); }
      W.cat.mixer.stopAllAction();
      c.m = m; c.mixer = W.cat.mixer; c.act = W.cat.act;
      c.play = n => { if (c.cur === n || !c.act[n]) return; try { const a = c.act[n]; a.reset().fadeIn(0.15).play(); if (c.cur && c.act[c.cur]) c.act[c.cur].fadeOut(0.15); } catch (e) { /* Bewegung überspringen */ } c.cur = n; };
      c.play('idle');
    } else {
      c.m = new T.Mesh(new T.SphereGeometry(0.35, 14, 10), W.mat(0xff9a40)); c.play = () => {};
    }
    S.group.add(c.m); c.m.position.set(x, c.y, z); S.cat = c;
  }
  function updCat(dt) {
    const c = S.cat; let p = S.pl; if (c.mixer) c.mixer.update(dt);
    if (S.net === 'guest') { c.m.position.set(c.x, c.y, c.z); c.m.rotation.y = c.yaw; return; }
    if (S.net === 'host' && Math.hypot(S.fo.x - c.x, S.fo.z - c.z) < Math.hypot(p.x - c.x, p.z - c.z)) p = S.fo;
    const dx = c.x - p.x, dz = c.z - p.z, d = Math.hypot(dx, dz);
    if (S.done) { moveBody(c, dt, 0, 0, 0, 8); c.play('idle'); c.m.position.set(c.x, c.y, c.z); return; }
    if (d < 1.35 && Math.abs(p.y - c.y) < 1.4) {
      S.caught++; S.score += 900; AMC.Audio.sfx('gold'); W.particles.burst(c.x, c.y + 0.6, c.z, 0xffb347, 40, { speed: 7 });
      const left = S.ch.obj.n - S.caught;
      msg(left > 0 ? '🐈 Gefangen! … und schon wieder weg. Noch ' + left + '×!' : '🐈 Hab dich! Der Studio-Schlüssel ist zurück!', 2.4);
      if (left > 0) { let best = null; for (let i = 0; i < 8; i++) { const s2 = freeSpot(S.rng, 20); if (!best || Math.hypot(s2[0] - p.x, s2[2] - p.z) > Math.hypot(best[0] - p.x, best[2] - p.z)) best = s2; } c.x = best[0]; c.z = best[2]; c.y = 0.4; c.vx = c.vz = 0; c.tire = 0; }
      return;
    }
    let wx = 0, wz = 0, sp = 0;
    if (c.rest > 0) { c.rest -= dt; sp = 0; }
    else if (d < 11) {
      c.tire += dt; if (c.tire > 4.5) { c.rest = 1.6; c.tire = 0; msg('🐈 Die Katze verschnauft – jetzt!', 1.2); }
      const a = Math.atan2(dx, dz) + Math.sin(S.time * 1.3) * 0.6; wx = Math.sin(a); wz = Math.cos(a);
      // an Wänden entlang ausweichen
      if (solidAt(c.x + wx * 1.2, c.y + 0.5, c.z + wz * 1.2)) { const t = Math.sign(Math.sin(S.time * 0.4)) || 1; const a2 = a + t * Math.PI / 2; wx = Math.sin(a2); wz = Math.cos(a2); }
      sp = 7.8 + S.caught * 0.5;
    } else { c.tire = Math.max(0, c.tire - dt); }
    const v = moveBody(c, dt, wx, wz, sp, 10);
    if (c.onGround && sp > 0 && solidAt(c.x + wx * 0.7, c.y + 0.3, c.z + wz * 0.7) && !solidAt(c.x + wx * 0.7, c.y + 1.6, c.z + wz * 0.7)) { c.vy = 7; c.onGround = false; c.play('jump'); }
    if (c.onGround) { if (v > 0.6) { c.play('walk'); if (c.act && c.act.walk) c.act.walk.timeScale = Math.min(2.6, v / 3); } else c.play(c.rest > 0 ? 'no' : 'idle'); }
    c.m.position.set(c.x, c.y, c.z); c.m.rotation.y = c.yaw;
  }
  // ------------------------------------------------------------------ Online-Koop: Gastgeber rechnet, Gast steuert seine Figur selbst
  const r2 = v => Math.round(v * 100) / 100;
  function netRemote(dt, f) {
    const R = S.remote; if (!R) { animFor(f, 0); return; }
    const k = Math.min(1, dt * 14);
    f.x += (R.x - f.x) * k; f.y += (R.y - f.y) * k; f.z += (R.z - f.z) * k; f.yaw = R.yaw;
    if (Math.hypot(R.x - f.x, R.z - f.z) > 8) { f.x = R.x; f.y = R.y; f.z = R.z; }
    f.onGround = !R.air; f.vy = R.vy || 0; f.dodge = R.dodge || 0;
    if (f.fig) { f.fig.root.position.set(f.x, f.y, f.z); f.fig.root.rotation.y += U.angDiff(f.fig.root.rotation.y, f.yaw) * Math.min(1, dt * 14); }
    if (R.busy) { f.busy = 0.1; setAnim(f, R.busy); } else { f.busy = 0; animFor(f, R.sp); }
  }
  function meState(p, sp) { return [r2(p.x), r2(p.y), r2(p.z), r2(p.yaw), r2(sp || 0), p.onGround ? 0 : 1, r2(p.vy), p.dodge > 0 ? 1 : 0, p.busy > 0 ? p.anim : 0]; }
  function readRemote(a) { if (!Array.isArray(a)) return; S.remote = { x: +a[0] || 0, y: +a[1] || 0, z: +a[2] || 0, yaw: +a[3] || 0, sp: +a[4] || 0, air: !!a[5], vy: +a[6] || 0, dodge: a[7] ? 0.2 : 0, busy: typeof a[8] === 'string' && /^[a-zA-Z]{2,12}$/.test(a[8]) ? a[8] : 0 }; }
  function netHostFrame(dt) {
    if ((S.netT -= dt) > 0) return; S.netT = 1 / 12;
    const k = []; S.pickups.forEach((q, i) => { if (q.dirty) { q.dirty = false; k.push([i, q.kind, q.rub || 0, r2(q.x), r2(q.y), r2(q.z), q.taken ? 1 : 0]); } });
    const [txt, frac] = objText();
    const snap = {
      t: 's', p: meState(S.pl, Math.hypot(S.pl.vx, S.pl.vz)), k,
      d: S.drones.map(d => [r2(d.x), r2(d.y), r2(d.z), d.dead ? 1 : 0, d.stun > 0 ? 1 : 0, r2(d.m.rotation.y)]),
      n: S.npcs.map(n => [r2(n.x), r2(n.y), r2(n.z), r2(n.fig ? n.fig.root.rotation.y : 0), (n.talked ? 1 : 0) | (n.follow ? 2 : 0) | (n.delivered ? 4 : 0) | (n.hyped ? 8 : 0) | (n.fed ? 16 : 0)]),
      h: [txt, r2(frac), Math.ceil(S.left), Math.round(S.energy), D.RUBRIC_IDS.map(r => S.got[r]), S.gold, S.score, S.done ? 1 : 0, S.carry || 0],
      e: S.events.splice(0)
    };
    if (S.boss) { const b = S.boss; snap.b = [r2(b.x), r2(b.y), r2(b.z), r2(b.hp), b.state, r2(b.open)]; }
    if (S.cat) snap.c = [r2(S.cat.x), r2(S.cat.y), r2(S.cat.z), r2(S.cat.yaw), S.cat.cur || 'idle', S.caught];
    if (S.gates.length) snap.g = S.gates.map(g => (g.passed ? 1 : 0));
    if (S.relays.length) snap.r = S.relays.map(r => [r2(r.prog), r.fixed ? 1 : 0]);
    if (S.beacon.visible) snap.bc = [r2(S.beacon.position.x), r2(S.beacon.position.z)];
    P.netSend && P.netSend(snap);
  }
  function netGuestFrame(dt, sp) {
    updRings(dt); updPickups(dt);
    if (S.cat) updCat(dt);
    for (const n of S.npcs) if (n.fig) { n.fig.update(dt); if (n.tx != null) { const k = Math.min(1, dt * 10); n.x += (n.tx - n.x) * k; n.y += (n.ty - n.y) * k; n.z += (n.tz - n.z) * k; n.fig.root.position.set(n.x, n.y, n.z); const s2 = Math.hypot(n.tx - n.x, n.tz - n.z) / Math.max(dt, 0.001); if (!n.dancer && !n.busyAnim) setAnim(n, s2 < 0.4 ? 'idle' : s2 < 3.4 ? 'walk' : 'jog'); } }
    for (const d of S.drones) { if (d.tx == null) continue; const k = Math.min(1, dt * 10); d.x += (d.tx - d.x) * k; d.y += (d.ty - d.y) * k; d.z += (d.tz - d.z) * k; d.m.position.set(d.x, d.y, d.z); d.m.userData.rotors.forEach((r, i) => (r.rotation.y += dt * 30 * (i % 2 ? 1 : -1))); }
    if (S.boss) { const b = S.boss, U2 = b.m.userData; U2.ring.rotation.z += dt * 2; if (U2.shield) U2.shield.visible = b.open <= 0; U2.eye.material.color.set(b.open > 0 ? 0x30ff90 : 0xff2a3a); b.m.position.set(b.x, b.y, b.z); b.m.visible = b.state !== 'dead'; }
    S.shocks = (S.shocks || []).filter(s => { s.r += dt * 10; s.m.scale.set(s.r, s.r, 1); s.m.material.opacity = Math.max(0, 0.9 - s.r / 34); const p = S.pl, d = Math.hypot(p.x - s.x, p.z - s.z); if (!s.hit && Math.abs(d - s.r) < 0.7 && p.y < 1.06 && !(p.dodge > 0)) { s.hit = true; guestKnock(s.x, s.z); } if (s.r > 30) { S.group.remove(s.m); return false; } return true; });
    S.beacon.rotation.y += dt; W.particles.update(dt);
    const sun = S.env.sun, sp0 = W.SKIES[S.sky].sunPos, p = S.pl;
    sun.position.set(p.x + sp0[0] * 0.5, sp0[1] * 0.5, p.z + sp0[2] * 0.5); sun.target.position.set(p.x, 0, p.z);
    W.updateCamera(dt, p, solidAt); updHud(dt);
    if ((S.netT -= dt) <= 0) { S.netT = 1 / 15; P.netSend && P.netSend({ t: 'i', p: meState(p, sp), hold: S.holding ? 1 : 0, e: S.events.splice(0) }); }
  }
  function guestKnock(fx, fz) {
    const p = S.pl; if (p.inv > 0) return; p.inv = 1.2;
    const dx = p.x - fx, dz = p.z - fz, l = Math.hypot(dx, dz) || 1; p.vx = dx / l * 10; p.vz = dz / l * 10; p.vy = 5;
    AMC.Audio.sfx('static'); W.cam.shake = 0.6; const h = U.$('hHit'); if (h) { h.classList.remove('on'); void h.offsetWidth; h.classList.add('on'); }
  }
  /** Nachricht vom anderen Gerät */
  P.netRecv = function (m) {
    if (!S || !m || typeof m !== 'object') return;
    if (S.net === 'host' && m.t === 'i') {
      readRemote(m.p);
      const f = S.fo;
      (Array.isArray(m.e) ? m.e.slice(0, 8) : []).forEach(ev => { if (ev && ev[0] === 'act') { const it = interactTarget(f); if (it && it.run) it.run(); else if (!it || !it.hold) { f.cd = 0; doWave(f); } } });
      if (m.hold) { const it = interactTarget(f); if (it && it.hold) { const r = it.hold; r.prog += (1 / 15) / (f.H.id === 'marco' ? 0.8 : 1.6); if (r.prog >= 1 && !r.fixed) { r.fixed = true; r.led.material.color.set(0x30ff60); r.gl.material.color.set(0x30ff60); AMC.Audio.sfx('perfect'); msg('🔧 Verteiler läuft wieder!', 2); S.score += 500; } } }
      return;
    }
    if (S.net !== 'guest' || m.t !== 's') return;
    readRemote(m.p);
    (Array.isArray(m.k) ? m.k : []).forEach(a => { if (!Array.isArray(a)) return; let q = S.pickups[a[0]]; if (!q) { if (a[0] !== S.pickups.length || !/^(funke|gold|tape)$/.test(a[1])) return; q = addPickup(a[1], D.RUBRICS[a[2]] ? a[2] : 'feel', a[3], a[4], a[5]); } q.x = a[3]; q.y = a[4]; q.z = a[5]; q.m.position.set(q.x, q.y, q.z); const was = q.taken; q.taken = !!a[6]; q.m.visible = !q.taken; if (q.taken && !was && Math.hypot(q.x - S.pl.x, q.z - S.pl.z) < 3) { AMC.Audio.sfx(q.kind === 'funke' ? 'collect' : 'gold'); W.particles.burst(q.x, q.y, q.z, q.kind === 'funke' ? D.RUBRICS[q.rub].color : 0xffd23f, 18, { speed: 5 }); } });
    (Array.isArray(m.d) ? m.d.slice(0, 40) : []).forEach((a, i) => { if (!Array.isArray(a)) return; if (!S.drones[i] && i === S.drones.length) addDrone(+a[0] || 0, +a[2] || 0, {}); const d = S.drones[i]; if (!d) return; d.tx = a[0]; d.ty = a[1]; d.tz = a[2]; if (a[3] && !d.dead) W.particles.burst(d.x, d.y, d.z, 0xff3a3a, 30, { speed: 8 }); d.dead = !!a[3]; d.m.visible = !d.dead; d.m.rotation.y = a[5]; d.m.userData.eye.material.color.set(a[4] ? 0x553333 : 0xff2a3a); if (!d.dead && d.tx != null && Math.hypot(d.x - d.tx, d.z - d.tz) > 6) { d.x = d.tx; d.y = d.ty; d.z = d.tz; } });
    (Array.isArray(m.n) ? m.n : []).forEach((a, i) => { const n = S.npcs[i]; if (!n || !n.fig || !Array.isArray(a)) return; n.tx = a[0]; n.ty = a[1]; n.tz = a[2]; n.fig.root.rotation.y = a[3]; const f = a[4] | 0; n.talked = !!(f & 1); n.follow = !!(f & 2); n.delivered = !!(f & 4); n.hyped = !!(f & 8); n.fed = !!(f & 16);
      if (n.icon) n.icon.visible = !(n.talked || n.follow || n.delivered || n.hyped || n.fed); if (n.mark) n.mark.visible = !(n.talked || n.fed); n.fig.root.visible = !n.delivered; });
    if (Array.isArray(m.h)) { const h = m.h; S.netObj = [typeof h[0] === 'string' ? h[0].slice(0, 200) : '', +h[1] || 0]; S.left = +h[2] || 0; S.energy = +h[3] || 0; if (Array.isArray(h[4])) D.RUBRIC_IDS.forEach((r, i) => (S.got[r] = +h[4][i] || 0)); S.gold = +h[5] || 0; S.score = +h[6] || 0; const dn = !!h[7]; if (dn && !S.done) AMC.Audio.sfx('star'); S.done = dn; S.carry = +h[8] || 0; drawRub(); }
    if (S.boss && Array.isArray(m.b)) { const b = S.boss, a = m.b; b.x = a[0]; b.y = a[1]; b.z = a[2]; b.hp = a[3]; if (b.state === 'intro' && a[4] !== 'intro') AMC.Audio.music('boss'); b.state = String(a[4]); b.open = a[5]; }
    if (S.cat && Array.isArray(m.c)) { const c = S.cat, a = m.c; c.x = a[0]; c.y = a[1]; c.z = a[2]; c.yaw = a[3]; c.play(String(a[4])); S.caught = a[5] | 0; }
    if (Array.isArray(m.g)) m.g.forEach((v, i) => { const g = S.gates[i]; if (g) { g.passed = !!v; g.ring.material.emissive.set(g.passed ? 0x20a040 : 0x2090ff); } });
    if (Array.isArray(m.r)) m.r.forEach((a, i) => { const r = S.relays[i]; if (r && Array.isArray(a)) { r.prog = a[0]; if (a[1] && !r.fixed) { r.fixed = true; r.led.material.color.set(0x30ff60); r.gl.material.color.set(0x30ff60); AMC.Audio.sfx('perfect'); } } });
    if (Array.isArray(m.bc)) { S.beacon.visible = true; S.beacon.position.set(m.bc[0], 0, m.bc[1]); } else S.beacon.visible = false;
    (Array.isArray(m.e) ? m.e.slice(0, 12) : []).forEach(ev => { if (!Array.isArray(ev)) return; if (ev[0] === 'hurt') guestKnock(+ev[1], +ev[2]); if (ev[0] === 'shock') spawnShock(+ev[1], +ev[2]); if (ev[0] === 'msg' && typeof ev[1] === 'string') msg(ev[1].slice(0, 140), 2.4); });
  };
  P.netFinish = res => { if (S && !S.ended) { S.ended = true; P.onEnd && P.onEnd(res); } };

  // ------------------------------------------------------------------ Nebenaufträge (Stadt erkunden)
  function nextQuest() { const qs = AMC.Save.data.quests; return D.QUESTS.find(q => !qs[q.id]); }
  function updQuests(dt, sp) {
    const p = S.pl;
    S.dist += Math.min(sp || 0, 20) * dt; S.maxY = Math.max(S.maxY, p.y);
    S.onFunkhaus = S.onFunkhaus || (p.y >= FUNKHAUS.h - 0.6 && p.x > FUNKHAUS.x0 && p.x < FUNKHAUS.x1 && p.z > FUNKHAUS.z0 && p.z < FUNKHAUS.z1);
    if (AMC.Media.active()) S.radioT += dt;
    if ((S.qT -= dt) > 0) return; S.qT = 0.5;
    const qs = AMC.Save.data.quests;
    for (const q of D.QUESTS) if (!qs[q.id] && q.val(S) >= q.goal) {
      qs[q.id] = Date.now(); const n = AMC.Save.earn(q.pts);
      AMC.Audio.sfx('star'); W.particles.burst(p.x, p.y + 2, p.z, 0xffd23f, 40, { speed: 7 });
      AMC.UI.toast('📋 Nebenauftrag geschafft: ' + q.icon + ' ' + q.name + ' · +' + n + ' 🎟️ Fan-Punkte');
      S.score += 500;
    }
  }
  // Boss „Das Funkloch“
  function updBoss(dt) {
    const b = S.boss, p = S.pl, U2 = b.m.userData;
    b.t += dt; U2.ring.rotation.z += dt * (2 + b.phase); U2.ring.rotation.x = Math.PI / 2 + Math.sin(b.t) * 0.3;
    if (U2.shield) { U2.shield.visible = b.open <= 0; U2.shield.rotation.y += dt * 0.8; }
    if (b.hitT > 0) b.hitT -= dt;
    U2.eye.material.color.set(b.open > 0 ? 0x30ff90 : b.hitT > 0 ? 0xffffff : 0xff2a3a);
    if (b.state === 'dead') return;
    if (b.state === 'intro') { b.y = U.damp(b.y, 7, 1, dt); if (b.t > 2.5) { b.state = 'rise'; b.t = 0; AMC.Audio.sfx('boss'); AMC.Audio.music('boss'); msg('📡 ' + S.bossName + ' greift an! Spring über die Rauschwellen!', 3); } }
    else if (b.state === 'rise') { b.y = U.damp(b.y, 7, 2, dt); b.x = U.damp(b.x, PARK.x + Math.sin(b.t * 0.7) * 8, 1, dt); b.z = U.damp(b.z, PARK.z + Math.cos(b.t * 0.5) * 6, 1, dt); if (b.t > 2.2 - b.phase * 0.3) { b.state = 'slam'; b.t = 0; } }
    else if (b.state === 'slam') {
      b.y = U.damp(b.y, 2, 6, dt);
      if (b.t > 0.6) {
        // Rauschwelle(n) am Boden
        for (let k = 0; k <= b.phase; k++) setTimeout(() => S && S.boss && spawnShock(b.x, b.z), k * 550);
        AMC.Audio.sfx('boss'); W.cam.shake = 0.7; b.state = 'open'; b.t = 0; b.open = 3.6 - b.phase * 0.5;
        if (b.phase >= 1) { const alive = S.drones.filter(d => !d.dead).length; if (alive < 2 + b.phase) addDrone(b.x + U.rand(-4, 4), b.z + U.rand(-4, 4), { speed: 5.4 }); }
      }
    } else if (b.state === 'open') {
      b.open -= dt; b.y = U.damp(b.y, 2.4, 3, dt);
      if (b.open <= 0) { b.state = 'rise'; b.t = 0; }
    }
    b.m.position.set(b.x, b.y + Math.sin(b.t * 2) * 0.2, b.z);
    // Berührung
    for (const e of S.net === 'host' ? [S.pl, S.fo] : [S.pl]) if (Math.hypot(e.x - b.x, e.z - b.z) < 2.6 && Math.abs(e.y + 1 - b.y) < 2.4) hurt(22, b.x, b.z, e);
    // Schockwellen
    S.shocks = (S.shocks || []).filter(s => {
      s.r += dt * (9 + b.phase * 2); s.m.scale.set(s.r, s.r, 1); s.m.material.opacity = Math.max(0, 0.9 - s.r / 34);
      const d = Math.hypot(p.x - s.x, p.z - s.z);
      if (!s.hit && Math.abs(d - s.r) < 0.7 && p.y < 0.9 + 0.16) { s.hit = true; hurt(20, s.x, s.z); }
      if (S.net === 'host' && !s.hitF) { const f = S.fo, df = Math.hypot(f.x - s.x, f.z - s.z); if (Math.abs(df - s.r) < 0.7 && f.y < 1.06) { s.hitF = true; hurt(20, s.x, s.z, f); } }
      if (s.r > 30) { S.group.remove(s.m); return false; } return true;
    });
  }
  function spawnShock(x, z) {
    const m = new T.Mesh(new T.RingGeometry(0.92, 1, 64), new T.MeshBasicMaterial({ color: 0x9a4dff, transparent: true, opacity: 0.9, side: T.DoubleSide, blending: T.AdditiveBlending, depthWrite: false, toneMapped: false }));
    m.rotation.x = -Math.PI / 2; m.position.set(x, 0.45, z); S.group.add(m);
    S.shocks = S.shocks || []; S.shocks.push({ m, x, z, r: 1, hit: false });
    if (S.net === 'host') S.events.push(['shock', x, z]);
  }

  P.render = function () { if (S) W.renderer.render(S.scene, W.camera); };
  P.addTime = s => { if (S) S.left += s; };
  P.isDone = () => S && S.done;
  P.result = () => S;
  P.refreshHud = () => { if (S) { updHost(); S.hud.txtT = 0; } };
})(typeof window !== 'undefined' ? window : globalThis);
