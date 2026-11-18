/* Funkrenner – die drei Welten: Dschungel, Radiostudio, Fantasy-Welt (Strecke, Kulisse, Hindernisse, Licht). */
(function (root) {
  'use strict';
  const TAU = Math.PI * 2;
  const pick = (r, a) => a[(r() * a.length) | 0];

  /* gemeinsames Aussehen: Himmel, Nebel, Licht */
  function look(W, L) {
    const T = W.THREE;
    W.setSky(L.sky[0], L.sky[1], L.sky[2]);
    W.scene.fog = new T.Fog(L.fog[0], L.fog[1], L.fog[2]); W.scene.background = new T.Color(L.fog[0]);
    W.hemi.color.set(L.hemi[0]); W.hemi.groundColor.set(L.hemi[1]); W.hemi.intensity = L.hemi[2];
    W.sun.color.set(L.sun[0]); W.sun.intensity = L.sun[1]; W.sun.position.set(L.sun[2][0], L.sun[2][1], L.sun[2][2]);
    W.disc.material.color.set(L.disc[0]); W.disc.scale.set(L.disc[1], L.disc[1], 1); W.disc.position.set(L.disc[2][0], L.disc[2][1], L.disc[2][2]); W.disc.material.opacity = L.disc[3]; W.disc.visible = L.disc[3] > 0;
    W.stars.visible = !!L.stars;
  }
  const noiseTex = (W, size, base, spots, rep, ry) => {
    const [c, g] = W.canvas(size, size); g.fillStyle = base; g.fillRect(0, 0, size, size);
    const r = W.rngf(11);
    for (let i = 0; i < size * 1.5; i++) { g.fillStyle = spots[(r() * spots.length) | 0]; const s = 2 + r() * size / 10; g.globalAlpha = .18 + r() * .3; g.beginPath(); g.ellipse(r() * size, r() * size, s, s * (.4 + r() * .8), r() * 3, 0, TAU); g.fill(); }
    g.globalAlpha = 1; return W.tex(c, rep, ry);
  };
  const plane = (W, w, d, mat, x, y, z, par, ry) => { const m = new W.THREE.Mesh(new W.THREE.PlaneGeometry(w, d), mat); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); if (par) par.add(m); return m; };

  /* =====================================================================  DSCHUNGEL  */
  const JUNGLE = {
    id: 'jungle', seed: 11,
    models: ['tree_single_A', 'tree_single_B', 'tree_single_A_cut', 'trees_A_large', 'trees_A_medium', 'trees_B_large', 'rock_single_A', 'rock_single_B', 'rock_single_C', 'rock_single_D', 'rock_single_E', 'mountain_A_grass_trees', 'mountain_B_grass_trees', 'hills_A_trees', 'cloud_big', 'waterlily_A', 'waterplant_A', 'waterplant_B', 'column', 'pillar', 'pillar_decorated', 'wall_half', 'barrier_column', 'torch_lit', 'coin', 'skull_candle'],
    looks: [
      { sky: [0x3aa6e8, 0xb8ecd0, 0xe8f5c8], fog: [0x9ccfa0, 26, 120], hemi: [0xe8ffe8, 0x2a4a2a, .75], sun: [0xfff2c0, .95, [-30, 50, 20]], disc: [0xfff2b0, 110, [-80, 95, -260], .95] },
      { sky: [0x2c3a8a, 0xff9a5a, 0xffd28a], fog: [0xd89a70, 26, 110], hemi: [0xffd8b0, 0x4a3a2a, .7], sun: [0xffa860, 1.0, [-40, 22, 30]], disc: [0xffa050, 140, [-100, 40, -260], 1] },
      { sky: [0x040a24, 0x14305a, 0x1c4a52], fog: [0x0e2a38, 24, 120], hemi: [0x6fa0d8, 0x14281f, .8], sun: [0x8aa8ff, .6, [30, 45, 10]], disc: [0xdce8ff, 70, [90, 100, -260], .9], stars: true }
    ],
    setup(W, v) {
      look(W, this.looks[v]);
      const T = W.THREE, h = W.th = {};
      h.road = new T.MeshStandardMaterial({ map: (() => { const [c, g] = W.canvas(256, 256); g.fillStyle = '#6a4a2a'; g.fillRect(0, 0, 256, 256); const r = W.rngf(3); for (let i = 0; i < 400; i++) { g.fillStyle = ['#7a5a36', '#5a3e22', '#86683e', '#4d6a30'][(r() * 4) | 0]; g.globalAlpha = .35; g.beginPath(); g.ellipse(r() * 256, r() * 256, 3 + r() * 18, 2 + r() * 9, r() * 3, 0, TAU); g.fill(); } g.globalAlpha = 1; g.strokeStyle = 'rgba(30,18,6,.5)'; g.lineWidth = 3; for (let i = 0; i < 6; i++) { g.strokeRect(r() * 200, r() * 200, 30 + r() * 40, 30 + r() * 40); } g.strokeStyle = 'rgba(20,12,4,.45)'; g.lineWidth = 4; for (const u of [.5 - 1.2 / 8.4, .5 + 1.2 / 8.4]) { g.beginPath(); g.moveTo(u * 256, 0); g.lineTo(u * 256, 256); g.stroke(); } return W.tex(c, 1, W.SEG / 8); })(), roughness: .95 });
      h.grass = new T.MeshStandardMaterial({ map: noiseTex(W, 256, '#245a24', ['#2f7a30', '#1c4a1c', '#3a8a34', '#143a14'], 8, 8), roughness: 1 });
      h.leaf = [0x2f9a3a, 0x3fb04a, 0x1f7a30, 0x58c048].map(c => new T.MeshStandardMaterial({ color: c, roughness: .8, side: T.DoubleSide }));
      h.bark = W.mat(0x6a4a30, { r: .95 }); h.moss = W.mat(0x4a8a34, { r: 1 }); h.stone = W.mat(0x8a8a78, { r: 1, flat: true });
      const leafShape = (w, l) => { const sh = new T.Shape(); sh.moveTo(0, 0); sh.quadraticCurveTo(w, l * .35, 0, l); sh.quadraticCurveTo(-w, l * .35, 0, 0); return new T.ShapeGeometry(sh, 4); };
      h.leafGeo = leafShape(.2, 1); h.bigLeaf = leafShape(.5, 1.4);
      h.leafM = [0x2f9a3a, 0x1f8a4a, 0x3fb04a, 0x58c048, 0x1f7a5a].map(c => new T.MeshStandardMaterial({ color: c, roughness: .75, side: T.DoubleSide }));
      const blade = (par, geo, mat, ry, lean, sx, sy, y) => { const l = new T.Mesh(geo, mat); l.rotation.set(0, ry, 0); l.rotateX(-lean); l.scale.set(sx, sy, 1); l.position.y = y || 0; par.add(l); return l; };
      const fern = new T.Group(); for (let i = 0; i < 9; i++) blade(fern, h.leafGeo, h.leafM[i % 5], i / 9 * TAU, 1.0 + (i % 3) * .18, 1.6, 1.5 + (i % 3) * .35); h.fern = fern;
      const banana = new T.Group(); for (let i = 0; i < 6; i++) { W.cy(.03, .04, .9 + i % 2 * .5, 0x4a8a34, null, 0, 0, 0, banana, 4).rotation.z = 0; blade(banana, h.bigLeaf, h.leafM[(i + 1) % 5], i / 6 * TAU + .3, .75 + (i % 2) * .3, 1.3, 1.7, .6 + (i % 2) * .4); } h.banana = banana;
      const palm = new T.Group(); for (let i = 0; i < 6; i++) { const m = W.cy(.2 - i * .018, .25 - i * .018, 1.1, 0x7a5a3a, { r: .95 }, Math.sin(i * .5) * .3, i * 1.05, 0, palm, 8); m.rotation.z = -.07 * i; }
      const top = new T.Group(); top.position.set(-.25, 6.4, 0); for (let i = 0; i < 10; i++) { const l = blade(top, h.bigLeaf, h.leafM[i % 5], i / 10 * TAU, .35 + (i % 2) * .4, 1.2, 3.4); } for (const q of [0, 1, 2]) W.sp(.18, 0x5a3a20, null, Math.cos(q * 2.1) * .25, -.1, Math.sin(q * 2.1) * .25, top); palm.add(top); h.palm = palm;
      const tree = new T.Group(); { const tr = W.cy(.35, .6, 7, 0x6a4a30, { r: .95 }, 0, 0, 0, tree, 8); tr.rotation.z = .05; for (let i = 0; i < 4; i++) { const rt = W.cy(.02, .35, 1.4, 0x6a4a30, { r: .95 }, Math.cos(i * 1.6) * .6, 0, Math.sin(i * 1.6) * .6, tree, 5); rt.rotation.set(Math.sin(i * 1.6) * .7, 0, -Math.cos(i * 1.6) * .7); }
        for (let i = 0; i < 6; i++) { const c = W.sp(1.5 + (i % 3) * .5, [0x2a8a3a, 0x1f7a44, 0x3aa04a][i % 3], { r: .9, flat: true }, Math.cos(i * 1.2) * 1.8, 7 + (i % 2) * .8, Math.sin(i * 1.2) * 1.8, tree, 1); c.scale.y = .6; }
        for (let i = 0; i < 5; i++) { const hv = 2 + (i % 3); W.cy(.04, .04, hv, 0x3a7a2a, null, Math.cos(i * 1.3) * 2.2, 6.4 - hv, Math.sin(i * 1.3) * 2.2, tree, 4); } } h.tree = tree;
      h.flowerCols = [0xff4d6a, 0xffd84a, 0xff8a2a, 0xe05aff];
      h.wfTex = (() => { const [c, g] = W.canvas(64, 256); const gr = g.createLinearGradient(0, 0, 64, 0); gr.addColorStop(0, '#6ad0e8'); gr.addColorStop(.5, '#e8fbff'); gr.addColorStop(1, '#58bde0'); g.fillStyle = gr; g.fillRect(0, 0, 64, 256); const r = W.rngf(5); g.fillStyle = 'rgba(255,255,255,.7)'; for (let i = 0; i < 40; i++) g.fillRect(r() * 64, r() * 256, 1 + r() * 3, 14 + r() * 40); return W.tex(c, 1, 2); })();
      W.anim.push((dt) => { h.wfTex.offset.y -= dt * .9; });
    },
    segment(W, g, r, idx, seg) {
      const T = W.THREE, h = W.th, S = W.SEG, low = W.low, v = W.variant;
      plane(W, W.ROAD, S, h.road, 0, 0, 0, g);
      for (const s of [-1, 1]) plane(W, 70, S, h.grass, s * (W.ROAD / 2 + 35), -.04, 0, g);
      for (const s of [-1, 1]) {
        const nt = low ? 3 : 5;
        for (let i = 0; i < nt; i++) { const t = h.tree.clone(); const sc = .9 + r() * .7; t.scale.set(sc, sc * (.9 + r() * .4), sc); t.position.set(s * (6.8 + r() * 14), 0, (r() - .5) * S); t.rotation.y = r() * TAU; g.add(t); }
        if (r() < .7) W.put(pick(r, ['trees_A_large', 'trees_B_large']), g, { x: s * (26 + r() * 12), z: (r() - .5) * S, w: 12 + r() * 6, ry: r() * TAU });
        for (let i = 0; i < 2; i++) W.put(pick(r, ['rock_single_A', 'rock_single_B', 'rock_single_C', 'rock_single_D', 'rock_single_E']), g, { x: s * (5.3 + r() * 3), z: (r() - .5) * S, h: .7 + r() * 1.4, ry: r() * TAU });
        for (let i = 0; i < (low ? 3 : 6); i++) { const f = (r() < .6 ? h.fern : h.banana).clone(); const sc = .8 + r() * .9; f.scale.setScalar(sc); f.position.set(s * (4.8 + r() * 4.5), 0, (r() - .5) * S); f.rotation.y = r() * TAU; g.add(f); }
        for (let i = 0; i < (low ? 2 : 4); i++) { const p = h.palm.clone(); p.scale.setScalar(.8 + r() * .5); p.position.set(s * (5.8 + r() * 7), 0, (r() - .5) * S); p.rotation.y = r() * TAU; g.add(p); }
        for (let i = 0; i < (low ? 3 : 7); i++) { const x = s * (4.7 + r() * 2.5), z = (r() - .5) * S; W.cy(.03, .03, .5 + r() * .4, 0x3a7a2a, null, x, 0, z, g, 4); W.sp(.14, h.flowerCols[(r() * 4) | 0], { e: .3 }, x, .7 + r() * .3, z, g, 0); }
        if (v >= 1 || idx % 3 === 0) {          // Tempelruinen entlang des Weges
          const z = (r() - .5) * S; W.put(r() < .5 ? 'column' : 'pillar_decorated', g, { x: s * 5.1, z, h: 3.2 + r(), ry: r() * 3 });
          if (r() < .6) { W.put('torch_lit', g, { x: s * 4.7, z: z + 1.2, h: 1.5 }); W.glow(0xffa040, 2.6, s * 4.7, 1.4, z + 1.2, g, .7); }
        }
        if (idx % 4 === 1 && !low) {             // Wasserfall
          const wx = s * 26; W.bx(14, 26, 10, 0x4e5a44, { r: 1, flat: true }, wx + s * 4, 0, 0, g);
          const wf = new T.Mesh(new T.PlaneGeometry(5, 24), new T.MeshBasicMaterial({ map: h.wfTex, side: T.DoubleSide, transparent: true, opacity: .9 })); wf.position.set(wx - s * 1.2, 12, 0); wf.rotation.y = Math.PI / 2; g.add(wf);
          W.glow(0xe8fbff, 12, wx - s * 2, 1, 0, g, .45);
        }
        if (idx % 5 === 2) W.put(pick(r, ['mountain_A_grass_trees', 'mountain_B_grass_trees']), g, { x: s * (48 + r() * 12), z: 0, h: 36 + r() * 10, ry: r() * TAU });
      }
      if (idx % 2 === 0) {                        // Lianenbogen
        const curve = new T.CatmullRomCurve3([new T.Vector3(-6.3, 0, 0), new T.Vector3(-6.8, 4, 0), new T.Vector3(-3.6, 7.1, 0), new T.Vector3(0, 8, 0), new T.Vector3(3.6, 7.1, 0), new T.Vector3(6.8, 4, 0), new T.Vector3(6.3, 0, 0)]);
        const tube = new T.Mesh(new T.TubeGeometry(curve, 16, .28, 6), h.bark); tube.position.z = S * .15; g.add(tube);
        for (let i = 0; i < 12; i++) { const p = curve.getPoint(i / 11), l = new T.Mesh(h.leafGeo, h.leaf[i % 4]); l.position.set(p.x, p.y, tube.position.z); l.rotation.set(r() * 2, r() * 6, r() * 2); l.scale.set(2.4, 2.2, 1); g.add(l); if (i % 2 && p.y > 4) { const hv = 1.5 + r() * 3; const vine = W.cy(.05, .05, hv, 0x3a7a2a, null, p.x, p.y - hv, tube.position.z, g, 4); } }
      }
      if (v >= 1) {                                // Glühwürmchen
        const n = 16, pos = new Float32Array(n * 3); for (let i = 0; i < n; i++) { pos[i * 3] = (r() - .5) * 20; pos[i * 3 + 1] = .6 + r() * 4.5; pos[i * 3 + 2] = (r() - .5) * S; }
        const gm = new T.BufferGeometry(); gm.setAttribute('position', new T.BufferAttribute(pos, 3)); const mt = new T.PointsMaterial({ color: v === 2 ? 0xd8ff7a : 0xffd890, size: 6, sizeAttenuation: false, map: W.halo, transparent: true, blending: T.AdditiveBlending, depthWrite: false });
        g.add(new T.Points(gm, mt)); seg.anim.push((dt, t) => { mt.opacity = .55 + Math.sin(t * 3 + idx) * .35; });
      }
    },
    obstacle(W, kind, r, o) {
      const T = W.THREE, h = W.th, g = new T.Group();
      if (kind === 'low') {
        if (r() < .5) { const log = W.cy(.5, .5, 2.1, 0x6a4628, { r: .95 }, 0, .1, 0, g, 10); log.rotation.z = Math.PI / 2; W.cy(.45, .45, .12, 0xc89a6a, null, 1.06, .6, 0, g, 10).rotation.z = Math.PI / 2; W.bx(1.2, .08, .5, 0x4a8a34, { r: 1 }, -.2, .98, 0, g); for (let i = 0; i < 3; i++) W.sp(.18 + r() * .1, 0xffe0e8, null, -.7 + i * .7, 1.1, .3, g, 0); }
        else { for (let i = 0; i < 3; i++) W.put(pick(r, ['rock_single_A', 'rock_single_B', 'rock_single_D']), g, { x: -.7 + i * .7, z: (r() - .5) * .4, h: .75 + r() * .2, ry: r() * 6 }); }
      } else if (kind === 'high') {
        for (const s of [-1, 1]) W.cy(.18, .2, 2.7, 0xc8b060, { r: .8 }, s * 1.05, 0, 0, g, 8);
        const bar = W.cy(.3, .3, 2.5, 0x6a4628, { r: .95 }, 0, 1.9, 0, g, 8); bar.rotation.z = Math.PI / 2;
        for (let i = 0; i < 6; i++) { const hv = .5 + r() * .5, x = -.95 + i * .38; W.cy(.04, .04, hv, 0x3a7a2a, null, x, 1.9 - hv, 0, g, 4); const l = new T.Mesh(h.leafGeo, h.leaf[i % 4]); l.position.set(x, 1.9 - hv, 0); l.rotation.set(Math.PI, 0, 0); l.scale.set(1.2, .5, 1); g.add(l); }
      } else if (kind === 'block') {
        const c = r();
        if (c < .4) W.put(pick(r, ['rock_single_C', 'rock_single_E']), g, { h: 2.5, w: 2.1, ry: r() * 6 });
        else if (c < .75) { W.put('column', g, { h: 2.7, ry: r() * 6 }); W.cy(.5, .5, .15, 0x6aa04a, { r: 1 }, 0, 2.6, 0, g, 8); }
        else { const t = W.put('tree_single_A_cut', g, { h: 2.6, w: 2.2 }); }
      } else if (kind === 'long') {
        W.bx(1.95, 2.3, 9, 0x7a7a68, { r: 1, flat: true }, 0, 0, 0, g); W.bx(2.05, .3, 9.2, 0x4a8a34, { r: 1 }, 0, 2.3, 0, g);
        for (let i = 0; i < 5; i++) { W.bx(.5 + r() * .5, 2.4, .5, 0x4a8a34, { r: 1 }, (r() - .5) * 1.4, 0, -4 + i * 2, g); }
        W.put('skull_candle', g, { x: 0, y: 2.55, z: 4.1, h: .7 });
      } else {                                      // rollender Felsen
        const b = W.put('rock_single_B', g, { h: 1.35, w: 1.4 }); b.userData.spin = true; o._spin = b;
      }
      return g;
    }
  };

  /* =====================================================================  RADIOSTUDIO  */
  const STUDIO = {
    id: 'studio', seed: 23,
    models: ['couch', 'couch_pillows', 'armchair', 'lamp_standing', 'lamp_table', 'table_low', 'table_medium', 'shelf_B_large_decorated', 'shelf_A_big', 'cabinet_small_decorated', 'cabinet_medium', 'pictureframe_large_A', 'pictureframe_large_B', 'pictureframe_medium', 'rug_rectangle_stripes_A', 'rug_oval_A', 'chair_stool', 'chair_A', 'book_set', 'cactus_medium_A', 'box_large', 'crates_stacked', 'barrel_small', 'coin'],
    looks: [
      { sky: [0x1a1f3a, 0x2a2a52, 0x3a2a5a], fog: [0x1c1a38, 30, 120], hemi: [0xbfd0ff, 0x302848, 1.1], sun: [0xffe0ff, .8, [10, 40, 20]], disc: [0xffffff, 1, [0, 0, -260], 0], neon: [0x19f0ff, 0xff2e88] },
      { sky: [0x24103a, 0x4a1a5a, 0x6a2a5a], fog: [0x2a1038, 28, 110], hemi: [0xe0b8ff, 0x2a1838, 1.0], sun: [0xffb0e0, .8, [10, 40, 20]], disc: [0xffffff, 1, [0, 0, -260], 0], neon: [0xb06cff, 0xff8a2a] },
      { sky: [0x050818, 0x0a1230, 0x101a40], fog: [0x070a1c, 24, 100], hemi: [0x7a90d0, 0x141828, .9], sun: [0x9ab0ff, .5, [10, 40, 20]], disc: [0xffffff, 1, [0, 0, -260], 0], neon: [0xff2e55, 0x19f0ff] }
    ],
    setup(W, v) {
      const L = this.looks[v]; look(W, L);
      const T = W.THREE, h = W.th = { neonA: L.neon[0], neonB: L.neon[1] };
      h.floor = new T.MeshStandardMaterial({ map: (() => { const [c, g] = W.canvas(256, 256); g.fillStyle = '#0d1122'; g.fillRect(0, 0, 256, 256); g.fillStyle = '#141a32'; for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) if ((i + j) % 2) g.fillRect(i * 32, j * 32, 32, 32); const hex = n => '#' + n.toString(16).padStart(6, '0'); g.strokeStyle = hex(L.neon[0]); g.lineWidth = 3; g.shadowColor = hex(L.neon[0]); g.shadowBlur = 8; for (const u of [.5 - 1.2 / 8.4, .5 + 1.2 / 8.4]) { g.beginPath(); g.moveTo(u * 256, 0); g.lineTo(u * 256, 256); g.stroke(); } g.strokeStyle = hex(L.neon[1]); g.shadowColor = hex(L.neon[1]); for (const u of [.015, .985]) { g.beginPath(); g.moveTo(u * 256, 0); g.lineTo(u * 256, 256); g.stroke(); } return W.tex(c, 1, W.SEG / 8); })(), roughness: .35, metalness: .25 });
      h.carpet = new T.MeshStandardMaterial({ map: noiseTex(W, 128, '#171c34', ['#1e2442', '#10142a'], 6, 6), roughness: 1 });
      h.wall = new T.MeshStandardMaterial({ map: (() => { const [c, g] = W.canvas(128, 128); g.fillStyle = '#12142a'; g.fillRect(0, 0, 128, 128); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const x = i * 32, y = j * 32, gr = g.createLinearGradient(x, y, x + 32, y + 32); gr.addColorStop(0, '#2a2e54'); gr.addColorStop(.5, '#0c0e1e'); gr.addColorStop(1, '#1e2244'); g.fillStyle = gr; g.beginPath(); g.moveTo(x + 16, y + 1); g.lineTo(x + 31, y + 16); g.lineTo(x + 16, y + 31); g.lineTo(x + 1, y + 16); g.closePath(); g.fill(); } return W.tex(c, 5, 3); })(), roughness: 1 });
      h.black = W.mat(0x0b0c14, { r: .6, m: .3 }); h.metal = W.mat(0x707888, { r: .35, m: .8 });
      h.nA = W.basic(L.neon[0]); h.nB = W.basic(L.neon[1]);
      h.onair = (() => { const [c, g] = W.canvas(256, 96); g.fillStyle = '#2a0508'; g.fillRect(0, 0, 256, 96); g.strokeStyle = '#ff2e3a'; g.lineWidth = 6; g.strokeRect(6, 6, 244, 84); g.fillStyle = '#ff3a46'; g.shadowColor = '#ff2030'; g.shadowBlur = 14; g.font = 'bold 56px system-ui,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ON AIR', 128, 52); const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; return new T.MeshBasicMaterial({ map: t }); })();
      h.eq = [];
      // Lautsprecherturm als Vorlage
      const sp = new T.Group(); W.bx(1.6, 3.4, 1.2, 0x0e0f18, { r: .7 }, 0, 0, 0, sp);
      for (const [y, rr] of [[.9, .5], [2.4, .36]]) { const cn = W.cy(rr, rr, .1, 0x222633, { r: .5, m: .4 }, 0, y - .05, .6, sp, 20); cn.rotation.x = Math.PI / 2; W.cy(rr * .45, rr * .45, .12, 0x050508, null, 0, y - .06, .63, sp, 12).rotation.x = Math.PI / 2; const ring = new T.Mesh(new T.TorusGeometry(rr * .98, .04, 6, 24), W.mat(0x9aa0b0, { m: .9, r: .3 })); ring.position.set(0, y, .62); sp.add(ring); }
      h.speaker = sp;
    },
    segment(W, g, r, idx, seg) {
      const T = W.THREE, h = W.th, S = W.SEG, low = W.low, nA = h.neonA, nB = h.neonB;
      plane(W, W.ROAD, S, h.floor, 0, 0, 0, g);
      for (const s of [-1, 1]) {
        plane(W, 6, S, h.carpet, s * 7.2, -.01, 0, g);
        const wl = new T.Mesh(new T.PlaneGeometry(S, 12), h.wall); wl.position.set(s * 10.2, 6, 0); wl.rotation.y = -s * Math.PI / 2; g.add(wl);
        W.bx(.25, .25, S, nA, { mat: h.nA }, s * 10.0, 5.2, 0, g); W.bx(.2, .2, S, nB, { mat: h.nB }, s * 10.0, .35, 0, g); W.bx(.2, .2, S, nB, { mat: h.nB }, s * 10.0, 8.6, 0, g);
        for (let i = 0; i < 2; i++) { const sp = h.speaker.clone(); sp.position.set(s * 9.2, 0, -S / 4 + i * S / 2 + (r() - .5) * 3); sp.rotation.y = s * Math.PI / 2; sp.scale.setScalar(1 + r() * .2); g.add(sp); }
        // Equalizer-Balken
        const eqn = low ? 5 : 8, z0 = (r() - .5) * 14;
        for (let i = 0; i < eqn; i++) { const col = i % 2 ? nA : nB, b = W.bx(.5, 3, .5, col, { mat: i % 2 ? h.nA : h.nB }, s * 6.1, 0, z0 + i * .9, g); b.userData.i = i; seg.anim.push((dt, t, p) => { const k = .25 + .55 * Math.abs(Math.sin(t * 3 + i * .9 + idx)) + p * .5; b.scale.y = k; b.position.y = 1.5 * k; }); }
        // Möbel
        if (r() < .7) { const z = (r() - .5) * S * .6, rr = W.put(pick(r, ['rug_rectangle_stripes_A', 'rug_oval_A']), g, { x: s * 7.4, y: .02, z, w: 4.2 }); W.put(pick(r, ['couch', 'couch_pillows']), g, { x: s * 8.4, z, h: 1.6, ry: s * Math.PI / 2 + Math.PI }); W.put('table_low', g, { x: s * 6.6, z, h: .8 }); W.put('lamp_standing', g, { x: s * 8.5, z: z + 2.4, h: 3.2 }); W.glow(0xffd890, 3, s * 8.5, 3, z + 2.4, g, .5); }
        else { W.put(pick(r, ['shelf_B_large_decorated', 'shelf_A_big', 'cabinet_medium']), g, { x: s * 9.6, z: (r() - .5) * S * .7, h: 3.2, ry: s * Math.PI / 2 + Math.PI }); W.put('cactus_medium_A', g, { x: s * 6.2, z: (r() - .5) * S, h: 1.3 }); }
        W.put(pick(r, ['pictureframe_large_A', 'pictureframe_large_B']), g, { x: s * 10.1, y: 3, z: (r() - .5) * S * .8, h: 2.2, ry: s * Math.PI / 2 + Math.PI });
        for (let i = 0; i < 2; i++) { const z = (r() - .5) * S * .9, d = W.cy(.7, .7, .08, 0xffc83a, { e: .25, m: .8, r: .3 }, s * 10.05, 4.2 + i * 1.6, z, g, 20); d.rotation.z = Math.PI / 2; }
      }
      const zc = (r() - .5) * 6;                        // Lichttraverse
      const tr = W.bx(W.ROAD + 3, .3, .3, 0x888, { mat: h.metal }, 0, 7, zc, g); W.bx(W.ROAD + 3, .3, .3, 0x888, { mat: h.metal }, 0, 7.5, zc, g);
      for (let i = 0; i < 4; i++) { const x = -3.6 + i * 2.4, c = i % 2 ? nA : nB, sp = W.cy(.28, .4, .6, 0x222, { m: .5 }, x, 6.35, zc, g, 10); W.glow(c, 4.2, x, 5.9, zc, g, .55); const beam = new T.Mesh(new T.ConeGeometry(1.4, 6, 12, 1, true), new T.MeshBasicMaterial({ color: c, transparent: true, opacity: .09, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide })); beam.position.set(x, 3.2, zc); g.add(beam); seg.anim.push((dt, t) => { beam.rotation.z = Math.sin(t * 1.2 + i + idx) * .25; }); }
      if (idx % 2 === 0) { const ob = new T.Mesh(new T.PlaneGeometry(3.2, 1.2), h.onair); ob.position.set(0, 6.0, zc + 6); g.add(ob); }
      plane(W, W.ROAD + 14, S, h.black, 0, 8.9, 0, g).rotation.x = Math.PI / 2;
    },
    obstacle(W, kind, r, o) {
      const T = W.THREE, h = W.th, g = new T.Group();
      if (kind === 'low') {
        const c = r();
        if (c < .4) { W.bx(1.9, .9, 1.1, 0x15161e, { r: .5, m: .4 }, 0, 0, 0, g); for (const [x, y] of [[-.9, 0], [.9, 0], [-.9, .8], [.9, .8]]) W.bx(.14, .14, 1.15, 0x9aa0b0, { m: .9, r: .3 }, x, y, 0, g); W.bx(1.2, .06, .05, 0xffffff, { mat: h.nA }, 0, .5, .56, g); }
        else if (c < .75) { const sh = new T.Shape(); sh.moveTo(-.95, 0); sh.lineTo(.95, 0); sh.lineTo(.95, .3); sh.lineTo(-.95, .95); sh.closePath(); const m = new T.Mesh(new T.ExtrudeGeometry(sh, { depth: 1.1, bevelEnabled: false }), W.mat(0x1c1e2a, { r: .5, m: .5 })); m.rotation.y = Math.PI / 2; m.rotation.x = 0; const wrap = new T.Group(); wrap.add(m); m.rotation.y = 0; m.position.z = -.55; g.add(wrap); wrap.rotation.y = Math.PI; W.cy(.3, .3, .06, 0x333848, { m: .4 }, .2, .35, -.02, g, 16).rotation.x = Math.PI / 2; }
        else { const d = W.cy(.5, .5, .9, 0x2a2c3a, { m: .5, r: .5 }, 0, 0, 0, g, 16); W.cy(.62, .62, .08, 0x9aa0b0, { m: .9, r: .3 }, 0, 0, 0, g, 16); W.cy(.62, .62, .08, 0x9aa0b0, { m: .9, r: .3 }, 0, .82, 0, g, 16); W.cy(.28, .28, .9, 0xff2e88, { e: .3 }, 0, 0, 0, g, 12); }
      } else if (kind === 'high') {
        for (const s of [-1, 1]) W.cy(.1, .1, 2.8, 0x9aa0b0, { m: .8, r: .3 }, s * 1.1, 0, 0, g, 8);
        const bar = W.bx(2.4, .26, .26, 0x888, { mat: h.metal }, 0, 2.0, 0, g); W.bx(2.4, .2, .2, 0x888, { mat: h.metal }, 0, 1.55, 0, g);
        for (const x of [-.8, 0, .8]) { W.cy(.2, .3, .5, 0x222, null, x, 1.35, 0, g, 10); W.glow(x === 0 ? h.neonB : h.neonA, 1.8, x, 1.25, 0, g, .7); }
      } else if (kind === 'block') {
        const c = r();
        if (c < .5) { const sp = h.speaker.clone(); sp.scale.set(1.2, .76, 1.2); sp.position.z = -.1; g.add(sp); }
        else { W.bx(1.8, 2.5, 1.0, 0x14151e, { r: .5, m: .4 }, 0, 0, 0, g); for (let i = 0; i < 5; i++) { W.bx(1.5, .12, .05, 0x2a2e40, { m: .6 }, 0, .3 + i * .45, .52, g); for (let j = 0; j < 4; j++) W.bx(.1, .1, .06, 0x111, { mat: (i + j) % 2 ? h.nA : h.nB }, -.5 + j * .33, .45 + i * .45, .53, g); } }
      } else if (kind === 'long') {
        W.bx(1.95, 2.3, 9, 0x1a1c28, { r: .6, m: .3 }, 0, 0, 0, g); W.bx(1.97, .12, 9.02, 0x888, { mat: h.nA }, 0, 1.2, 0, g); W.bx(1.97, .12, 9.02, 0x888, { mat: h.nB }, 0, .5, 0, g);
        const ob = new T.Mesh(new T.PlaneGeometry(3.4, 1.0), h.onair); ob.scale.setScalar(.55); ob.position.set(0, 1.9, 4.51); g.add(ob);
      } else {                                      // Discokugel
        const b = new T.Mesh(new T.IcosahedronGeometry(.68, 1), new T.MeshStandardMaterial({ color: 0xcfd6e8, metalness: 1, roughness: .12, flatShading: true, emissive: h.neonA, emissiveIntensity: .25 })); b.position.y = .72; g.add(b); o._spin = b; W.glow(h.neonB, 3, 0, .8, 0, g, .5);
      }
      return g;
    }
  };

  /* =====================================================================  FANTASY-WELT  */
  const FANTASY = {
    id: 'fantasy', seed: 37,
    models: ['building_castle_blue', 'building_castle_red', 'building_tower_A_blue', 'building_tower_A_red', 'building_tower_B_green', 'building_tower_B_yellow', 'building_church_red', 'building_windmill_yellow', 'building_windmill_green', 'building_home_A_red', 'building_home_B_blue', 'building_home_A_yellow', 'building_tavern_green', 'building_watermill_red', 'building_tower_base_red', 'wall_straight', 'mountain_A_grass_trees', 'mountain_B_grass_trees', 'hills_A_trees', 'cloud_big', 'cloud_small', 'tree_single_A', 'tree_single_B', 'flag_red', 'flag_blue', 'fence_stone_straight', 'fence_wood_straight', 'crate_A_big', 'crate_A_small', 'barrel', 'barrel_large', 'sack', 'weaponrack', 'target', 'pillar', 'pillar_decorated', 'column', 'torch_lit', 'banner_triple_red', 'banner_triple_blue', 'banner_triple_yellow', 'banner_shield_red', 'banner_shield_blue', 'sword_shield', 'barrier', 'coin', 'coin_stack_large', 'chest_gold'],
    looks: [
      { sky: [0x4aa0ff, 0xb8e0ff, 0xfff0d8], fog: [0xcfe6ff, 60, 200], hemi: [0xffffff, 0x8a98b8, .6], sun: [0xfff0d0, .85, [-30, 50, 20]], disc: [0xfff4c0, 110, [-80, 95, -260], .95] },
      { sky: [0x35286e, 0xd0589a, 0xffb070], fog: [0xe89a9a, 55, 190], hemi: [0xffc8b0, 0x6a4a78, .6], sun: [0xffa860, .9, [-40, 22, 30]], disc: [0xffa050, 150, [-100, 38, -260], 1] },
      { sky: [0x03081f, 0x14245a, 0x4a3a80], fog: [0x1c2858, 40, 170], hemi: [0x8aa0e8, 0x2a2858, .85], sun: [0x9ab8ff, .6, [30, 45, 10]], disc: [0xe8f0ff, 80, [90, 100, -260], .95], stars: true }
    ],
    setup(W, v) {
      look(W, this.looks[v]);
      const T = W.THREE, h = W.th = {};
      h.deck = new T.MeshStandardMaterial({ map: (() => { const [c, g] = W.canvas(256, 256); g.fillStyle = '#3a3a52'; g.fillRect(0, 0, 256, 256); const r = W.rngf(9); for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { const o = (y % 2) * 16, l = 88 + r() * 36; g.fillStyle = `rgb(${l},${l},${l + 14})`; g.fillRect(x * 32 + o - 16, y * 32, 30, 30); } g.strokeStyle = 'rgba(176,108,255,.55)'; g.lineWidth = 3; g.shadowColor = '#b06cff'; g.shadowBlur = 8; for (const u of [.5 - 1.2 / 8.4, .5 + 1.2 / 8.4]) { g.beginPath(); g.moveTo(u * 256, 0); g.lineTo(u * 256, 256); g.stroke(); } return W.tex(c, 1, W.SEG / 8); })(), roughness: .9 });
      h.rock = new T.MeshStandardMaterial({ color: 0x6a5a4a, roughness: 1, flatShading: true }); h.grass = W.mat(0x5ab04a, { r: 1 });
      h.cloud = new T.MeshBasicMaterial({ map: (() => { const [c, g] = W.canvas(256, 256); const r = W.rngf(5); for (let i = 0; i < 70; i++) { const gr = g.createRadialGradient(0, 0, 0, 0, 0, 1); const x = r() * 256, y = r() * 256, s = 20 + r() * 40; const gg = g.createRadialGradient(x, y, 0, x, y, s); gg.addColorStop(0, 'rgba(255,255,255,.55)'); gg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gg; g.fillRect(x - s, y - s, s * 2, s * 2); } return W.tex(c, 5, 5); })(), transparent: true, opacity: v === 2 ? .35 : .9, depthWrite: false, color: v === 1 ? 0xffc8c0 : v === 2 ? 0x8a9ad0 : 0xffffff });
      h.crys = [0x19f0ff, 0xff2e88, 0xb06cff, 0xffd84a].map(c => new T.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: .8, roughness: .2, flatShading: true, transparent: true, opacity: .92 }));
      h.cg = new T.OctahedronGeometry(.5, 0); h.cg.scale(.7, 1.5, .7);
    },
    island(W, g, x, y, z, name, hgt, r) {
      const T = W.THREE, h = W.th, G = new T.Group(), rad = 4 + r() * 3; G.position.set(x, y, z);
      const cone = new T.Mesh(new T.ConeGeometry(rad, rad * 1.5, 7), h.rock); cone.position.y = -rad * .75; cone.rotation.x = Math.PI; G.add(cone);
      const top = new T.Mesh(new T.CylinderGeometry(rad, rad * 1.02, .8, 7), h.grass); top.position.y = -.4; G.add(top);
      W.put(name, G, { h: hgt, ry: r() * TAU }); g.add(G); return G;
    },
    segment(W, g, r, idx, seg) {
      const T = W.THREE, h = W.th, S = W.SEG, low = W.low, v = W.variant;
      plane(W, W.ROAD, S, h.deck, 0, 0, 0, g);
      W.bx(W.ROAD + .6, 1.4, S, 0x7a7a88, { r: 1, flat: true }, 0, -1.4, 0, g);
      const under = new T.Mesh(new T.CylinderGeometry(W.ROAD * .9, 1, 5, 6, 1), h.rock); under.scale.set(1, 1, S / (W.ROAD * 1.8) * 1.2); under.position.y = -3.9; under.rotation.y = Math.PI / 6; g.add(under);
      for (const s of [-1, 1]) {
        W.bx(.5, .9, S, 0x9a9aa8, { r: 1, flat: true }, s * (W.ROAD / 2 + .1), 0, 0, g);
        for (let i = 0; i < 2; i++) {
          const z = -S / 4 + i * S / 2;
          W.put(r() < .5 ? 'pillar_decorated' : 'column', g, { x: s * (W.ROAD / 2 + .1), z, h: 2.8 });
          W.put('torch_lit', g, { x: s * (W.ROAD / 2 - .3), z, y: 1.6, h: .9 }); W.glow(0xffa040, 2.4, s * (W.ROAD / 2 - .3), 2.5, z, g, .8);
          if (r() < .6) W.put(pick(r, ['banner_triple_red', 'banner_triple_blue', 'banner_triple_yellow']), g, { x: s * (W.ROAD / 2 - .2), y: 1.5, z: z + 2, h: 1.7, ry: -s * Math.PI / 2 });
        }
        const n = low ? 1 : 2;
        for (let i = 0; i < n; i++) {
          const name = pick(r, ['building_castle_blue', 'building_castle_red', 'building_tower_A_blue', 'building_tower_A_red', 'building_tower_B_green', 'building_windmill_yellow', 'building_church_red', 'building_home_B_blue', 'building_tavern_green', 'mountain_A_grass_trees', 'hills_A_trees', 'building_watermill_red']);
          FANTASY.island(W, g, s * (16 + r() * 34), -6 + r() * 12, (r() - .5) * S, name, name.startsWith('mountain') ? 20 + r() * 8 : name.startsWith('hills') ? 7 : 11 + r() * 8, r);
        }
        for (let i = 0; i < 3; i++) W.put(pick(r, ['cloud_big', 'cloud_small']), g, { x: s * (8 + r() * 45), y: -9 + r() * 6, z: (r() - .5) * S, w: 9 + r() * 12, ry: r() * 6 });
        for (let i = 0; i < (low ? 2 : 4); i++) {      // schwebende Kristalle
          const c = new T.Mesh(h.cg, h.crys[(r() * 4) | 0]), x = s * (6.5 + r() * 9), y = 1 + r() * 5, z = (r() - .5) * S, sc = .6 + r() * 1.2;
          c.position.set(x, y, z); c.scale.setScalar(sc); g.add(c); W.glow(c.material.color, 3.2 * sc, x, y, z, g, .5);
          const ph = r() * 6; seg.anim.push((dt, t) => { c.rotation.y += dt * .8; c.position.y = y + Math.sin(t * 1.4 + ph) * .3; });
        }
      }
      const sea = new T.Mesh(new T.PlaneGeometry(260, S), h.cloud); sea.rotation.x = -Math.PI / 2; sea.position.y = -13; g.add(sea);
      if (v === 2) for (let i = 0; i < 8; i++) { const l = W.glow(0xffd890, .9, (r() - .5) * 24, 2 + r() * 8, (r() - .5) * S, g, .9); const ph = r() * 6; seg.anim.push((dt, t) => { l.material.opacity = .5 + Math.sin(t * 2 + ph) * .4; }); }
    },
    obstacle(W, kind, r, o) {
      const T = W.THREE, h = W.th, g = new T.Group();
      if (kind === 'low') {
        const c = r();
        if (c < .35) { W.put('crate_A_big', g, { x: -.5, h: .95, ry: r() * .3 }); W.put('crate_A_small', g, { x: .65, h: .7 }); }
        else if (c < .65) { W.put('barrel', g, { x: -.55, h: .95 }); W.put('barrel', g, { x: .55, h: .9, ry: 1 }); W.put('sack', g, { x: 0, z: .5, h: .6 }); }
        else { W.put('fence_wood_straight', g, { w: 2.1, h: .95 }); }
      } else if (kind === 'high') {
        for (const s of [-1, 1]) W.put('pillar', g, { x: s * 1.15, h: 2.8 });
        W.bx(2.9, .5, .55, 0x9a9aa8, { r: 1, flat: true }, 0, 2.0, 0, g);
        W.put(pick(r, ['banner_triple_red', 'banner_triple_blue']), g, { x: -.5, y: 1.2, z: .3, h: .85 }); W.put(pick(r, ['banner_triple_yellow', 'banner_triple_red']), g, { x: .5, y: 1.2, z: .3, h: .85 });
      } else if (kind === 'block') {
        const c = r();
        if (c < .35) { W.put('pillar_decorated', g, { h: 2.7 }); }
        else if (c < .65) { for (let i = 0; i < 3; i++) { const cr = new T.Mesh(h.cg, h.crys[(r() * 4) | 0]); cr.position.set(-.6 + i * .6, .9 + (i % 2) * .3, (r() - .5) * .3); cr.scale.set(1.5, 1.5 + i * .35, 1.5); g.add(cr); } W.glow(0xb06cff, 4, 0, 1.5, .3, g, .45); W.bx(1.8, .4, 1, 0x6a6a78, { r: 1, flat: true }, 0, 0, 0, g); }
        else { W.put('building_tower_base_red', g, { w: 1.9, h: 2.5 }); }
      } else if (kind === 'long') {
        W.bx(1.95, 2.0, 9, 0x8a8a98, { r: 1, flat: true }, 0, 0, 0, g);
        for (let i = 0; i < 5; i++) W.bx(.7, .5, .8, 0x8a8a98, { r: 1, flat: true }, i % 2 ? .5 : -.5, 2.0, -3.6 + i * 1.8, g);
        W.put('torch_lit', g, { x: 0, y: 2.0, z: 4.3, h: .9 }); W.glow(0xffa040, 2.2, 0, 2.9, 4.3, g, .7);
        W.put('banner_shield_red', g, { x: 0, y: .6, z: -4.55, h: 1.2, ry: Math.PI });
      } else {
        const b = W.put('barrel_large', g, { h: 1.3, w: 1.2 }); o._spin = b; b.userData.axisZ = true;
      }
      return g;
    }
  };

  root.FRThemes = { jungle: JUNGLE, studio: STUDIO, fantasy: FANTASY };
})(window);
