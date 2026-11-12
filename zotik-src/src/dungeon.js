// Höhlen, Vorhallen und Ruinen im Fantasy-Stil: unregelmäßige Felswände mit CC0-Texturen (statt glatter Kästen),
// Tropfsteine, leuchtende Kristallgruppen, Wandfackeln mit flackernder Flamme, Säulen, Bögen und Ranken.
// Ohne zusätzliche Punktlichter (die würden alle Materialien neu übersetzen) – Licht kommt aus Leuchtfarben und Lichthöfen.
export function createDungeon({ T, TX, M, mk, G, glow, scene }) {
  const geos = {};
  // Felsblock in Zellgröße: unterteilter Kasten, Seitenflächen nach außen/innen verbeult, Oberkante zerklüftet
  function rockGeo(cs, h) {
    const k = cs + '|' + h; if (geos[k]) return geos[k];
    const g = new T.BoxGeometry(cs, h, cs, 6, 5, 6), p = g.attributes.position, hx = cs / 2, hy = h / 2;
    const n3 = (x, y, z) => Math.sin(x * 1.7 + z * .9) * Math.cos(y * 2.1 - x * .7) + .5 * Math.sin(z * 3.3 + y * 1.3) + .25 * Math.cos(x * 5.1 - z * 4.2);
    for (let i = 0; i < p.count; i++) { let x = p.getX(i), y = p.getY(i), z = p.getZ(i); const ex = Math.abs(Math.abs(x) - hx) < 1e-3, ez = Math.abs(Math.abs(z) - hx) < 1e-3, top = y > hy - 1e-3;
      const d = n3(x, y, z) * .32 * (y > -hy + 1e-3 ? 1 : 0);
      if (ex) x += Math.sign(x) * d; if (ez) z += Math.sign(z) * d; if (top) y += n3(z, x, y) * .35; p.setXYZ(i, x, y, z); }
    g.computeVertexNormals(); return geos[k] = g;
  }
  const mats = {};
  const rockMat = (col, key) => mats['r' + col + key] || (mats['r' + col + key] = TX.tri(key || 'rock', col, { s: .4, gain: 2.4, n: 1.1, r: .95, e: 0x2a1c12, ei: 1 }));
  // Wände eines Rasters (g[i][j] === 1) als Instanzen; jede Zelle zufällig gedreht/gespiegelt, damit sich der Fels nicht wiederholt
  function walls(g, N, cx, cz, cs, h, col, R, key) {
    let n = 0; for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if (g[i][j]) n++;
    const im = new T.InstancedMesh(rockGeo(cs, h), rockMat(col, key), n), o = new T.Object3D(); let k = 0;
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if (g[i][j]) { o.position.set(cx(i), h / 2, cz(j)); o.rotation.set(0, (R() * 4 | 0) * Math.PI / 2, 0); o.scale.set(1, 1 + R() * .3, 1); o.updateMatrix(); im.setMatrixAt(k++, o.matrix); }
    im.castShadow = true; im.receiveShadow = true; im.frustumCulled = false; return im;
  }
  const flameTex = (() => { const c = document.createElement('canvas'); c.width = 32; c.height = 64; const x = c.getContext('2d'), gr = x.createRadialGradient(16, 44, 2, 16, 40, 22);
    gr.addColorStop(0, 'rgba(255,250,210,1)'); gr.addColorStop(.35, 'rgba(255,170,60,.9)'); gr.addColorStop(1, 'rgba(255,60,0,0)'); x.fillStyle = gr; x.beginPath(); x.moveTo(16, 2); x.quadraticCurveTo(30, 40, 16, 62); x.quadraticCurveTo(2, 40, 16, 2); x.fill(); return new T.CanvasTexture(c); })();
  // Wandfackel: Halter, Flamme (flackert beim Zeichnen), Lichthof
  function torch(par, x, y, z, ry, col) {
    const g = new T.Group(); g.position.set(x, y, z); g.rotation.y = ry || 0; const iron = M(0x2a2420, { m: .6, r: .5 });
    g.add(mk(G.box, iron, 0, 0, -.12, .12, .5, .12, false)); const st = mk(G.cyl, TX.tri('wood', 0x8a6a4a, { s: 1.2, gain: 1.6 }), 0, .15, .1, .07, .7, .07, false); st.rotation.x = .5; g.add(st);
    const f = new T.Sprite(new T.SpriteMaterial({ map: flameTex, color: col || 0xffffff, transparent: true, blending: T.AdditiveBlending, depthWrite: false })); f.position.set(0, .72, .28); f.scale.set(.4, .75, 1);
    const ph = x * 3.1 + z; f.onBeforeRender = () => { const t = performance.now() / 1000 + ph; f.scale.set(.36 + Math.sin(t * 13) * .04, .7 + Math.sin(t * 9.3) * .08 + Math.sin(t * 23) * .04, 1); };
    g.add(f); g.add(glow(col || 0xffa040, 3.6, 0, .75, .3, .55)); par.add(g); return g;
  }
  // Tropfsteine und Kristallgruppen an freien Plätzen (Liste [x, z, Wandrichtung])
  function cavern(par, spots, glowCol, R, rockCol) {
    const nSt = spots.length, st = new T.InstancedMesh(G.cone, rockMat(rockCol || 0x8a8070, 'rock'), nSt * 2), o = new T.Object3D(); let k = 0;
    const cr = new T.InstancedMesh(G.oct, M(glowCol, { e: glowCol, ei: 1.5, r: .15, m: .2 }), nSt * 4); let c = 0;
    for (const [x, z, a] of spots) { const s = .5 + R() * .7;
      for (let q = 0; q < 2; q++) { o.position.set(x + Math.cos(a + q) * .4, s * .9 * (q ? .6 : 1), z + Math.sin(a + q) * .4); o.rotation.set(0, R() * 6, (R() - .5) * .2); o.scale.set(s * .35, s * 1.8 * (q ? .6 : 1), s * .35); o.updateMatrix(); st.setMatrixAt(k++, o.matrix); }
      if (R() < .55) { for (let q = 0; q < 4; q++) { const l = .35 + R() * .6; o.position.set(x + (R() - .5) * .9, l * .5, z + (R() - .5) * .9); o.rotation.set((R() - .5) * .9, R() * 6, (R() - .5) * .9); o.scale.set(l * .22, l, l * .22); o.updateMatrix(); cr.setMatrixAt(c++, o.matrix); }
        par.add(glow(glowCol, 2.6, x, .6, z, .45)); } }
    st.count = k; cr.count = c; st.castShadow = true; st.frustumCulled = cr.frustumCulled = false; par.add(st); par.add(cr); return { st, cr };
  }
  // Säule mit Basis und Kapitell (Ruinen, Vorhallen), wahlweise abgebrochen; Ranken als grüne Bänder
  function column(par, x, y, z, h, col, broken) {
    const sm = TX.tri('marble', col || 0xd8d0c0, { s: .7, gain: 1.6 }); par.add(mk(G.box, sm, x, y + .15, z, .95, .3, .95));
    par.add(mk(G.cyl, sm, x, y + .3 + h * (broken ? .32 : .5), z, .34, h * (broken ? .64 : 1), .34)); if (!broken) par.add(mk(G.box, sm, x, y + .4 + h, z, .9, .25, .9));
    else par.add(mk(G.cyl, sm, x + .6, y + .2, z + .3, .3, .5, .3, false));
    const vm = M(0x3a6a2a, { r: .9 }); for (let i = 0; i < 3; i++) { const v = mk(G.box, vm, x + Math.cos(i * 2.1) * .36, y + .6 + i * h * .22, z + Math.sin(i * 2.1) * .36, .06, h * .3, .14, false); v.rotation.y = i * 2.1; par.add(v); }
  }
  // Spinnweben-Textur (einmal)
  const webTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); x.strokeStyle = 'rgba(235,235,245,.75)'; x.lineWidth = 1;
    for (let a = 0; a < 7; a++) { const t = a / 6 * Math.PI / 2; x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(t) * 64, Math.sin(t) * 64); x.stroke(); }
    for (let r = 10; r < 64; r += 10) { x.beginPath(); for (let a = 0; a <= 6; a++) { const t = a / 6 * Math.PI / 2, rr = r * (1 - .12 * Math.sin(a * 2)); a ? x.lineTo(Math.cos(t) * rr, Math.sin(t) * rr) : x.moveTo(Math.cos(t) * rr, Math.sin(t) * rr); } x.stroke(); }
    return new T.CanvasTexture(c); })();
  // Kohlebecken: Schale auf Dreibein mit Flamme
  function brazier(par, x, z, col) { const g = new T.Group(); g.position.set(x, 0, z); const iron = M(0x3a3430, { m: .7, r: .45 });
    for (let i = 0; i < 3; i++) { const l = mk(G.cyl, iron, Math.cos(i * 2.1) * .25, .45, Math.sin(i * 2.1) * .25, .04, .9, .04, false); l.rotation.z = Math.cos(i * 2.1) * .25; l.rotation.x = -Math.sin(i * 2.1) * .25; g.add(l); }
    g.add(mk(G.cyl, iron, 0, .95, 0, .42, .18, .42)); g.add(mk(G.sph, M(0xff7a2a, { e: 0xff5a10, ei: 2 }), 0, 1.02, 0, .32, .08, .32, false));
    const f = new T.Sprite(new T.SpriteMaterial({ map: flameTex, color: col || 0xffffff, transparent: true, blending: T.AdditiveBlending, depthWrite: false })); f.position.set(0, 1.45, 0); const ph = x + z * 1.3;
    f.onBeforeRender = () => { const t = performance.now() / 1000 + ph; f.scale.set(.7 + Math.sin(t * 11) * .06, 1.1 + Math.sin(t * 8.1) * .12 + Math.sin(t * 19) * .05, 1); }; g.add(f); g.add(glow(col || 0xffa040, 4.5, 0, 1.4, 0, .5)); par.add(g); return g; }
  // Wächterstatue auf Sockel (Ritter mit Schwert, schlicht gemeißelt)
  function statue(par, x, z, ry, col) { const g = new T.Group(); g.position.set(x, 0, z); g.rotation.y = ry || 0; const sm = TX.tri('stone', col || 0xb8b0a0, { s: .8, gain: 1.9 });
    g.add(mk(G.box, sm, 0, .35, 0, 1.2, .7, 1.2)); g.add(mk(G.cyl, sm, 0, 1.35, 0, .38, 1.3, .3)); g.add(mk(G.sph, sm, 0, 2.2, 0, .26, .3, .26)); g.add(mk(G.cone, sm, 0, 2.5, 0, .2, .25, .2));
    for (const s of [-1, 1]) g.add(mk(G.sph, sm, s * .42, 1.85, 0, .18, .16, .18)); const sw = mk(G.box, sm, 0, 1.25, .36, .1, 1.5, .05); g.add(sw); g.add(mk(G.box, sm, 0, 1.75, .36, .45, .07, .07)); par.add(g); return g; }
  // Wandbanner
  function banner(par, x, y, z, ry, col) { const g = new T.Group(); g.position.set(x, y, z); g.rotation.y = ry || 0; g.add(mk(G.cyl, M(0x6a5030, { m: .3 }), 0, 0, 0, .04, 1.4, .04, false)).rotation.z = Math.PI / 2;
    const cl = M(col || 0x8a1a2a, { r: .85 }); g.add(mk(G.box, cl, 0, -1, 0, 1.1, 1.9, .04, false)); g.add(mk(G.cone, cl, 0, -2.1, 0, .55, .4, .02, false)).rotation.z = Math.PI;
    g.add(mk(G.oct, M(0xe8c060, { m: .8, r: .3, e: 0x6a4a10, ei: .6 }), 0, -.8, .04, .22, .3, .03, false)); par.add(g); return g; }
  // Kleinkram entlang der Wände wie in alten Dungeons: Krüge, Kisten, Fässer, Geröll, Knochen, Schädel, Spinnweben.
  // spots: [x, z, Richtung zur Wand (Winkel)]; alles bleibt dicht an der Wand, damit Wege und Rätselflächen frei bleiben.
  function clutter(par, spots, R, o = {}) {
    const n = spots.length, ob = new T.Object3D(); const L = {};
    const mkI = (k, geo, mat, cap) => { const im = new T.InstancedMesh(geo, mat, cap); im.count = 0; im.castShadow = true; im.receiveShadow = true; im.frustumCulled = false; par.add(im); return L[k] = im; };
    mkI('jar', G.sph, TX.tri('plaster', 0xc08a5a, { s: 1.4, gain: 1.6, n: .5 }), n * 3); mkI('neck', G.cyl, TX.tri('plaster', 0xa8784a, { s: 1.4, gain: 1.6, n: .5 }), n * 3);
    mkI('crate', G.box, TX.tri('wood', 0xb08a5a, { s: 1.1, gain: 1.7 }), n * 2); mkI('barrel', G.cyl, TX.tri('wood', 0x8a5a3a, { s: 1.1, gain: 1.7 }), n * 2);
    mkI('rub', G.ico, TX.tri('rock', o.rock || 0x9a9088, { s: 1, gain: 2 }), n * 6); mkI('bone', G.cyl, M(0xe8e0c8, { r: .7 }), n * 4); mkI('skull', G.sph, M(0xece4d0, { r: .6 }), n);
    const put = (k, x, y, z, sx, sy, sz, rx, ry, rz) => { const im = L[k]; ob.position.set(x, y, z); ob.rotation.set(rx || 0, ry || 0, rz || 0); ob.scale.set(sx, sy, sz); ob.updateMatrix(); im.setMatrixAt(im.count++, ob.matrix); };
    const web = new T.MeshBasicMaterial({ map: webTex, transparent: true, side: T.DoubleSide, depthWrite: false, opacity: .8 });
    for (const [x, z, a] of spots) { const r = R(), tx = Math.cos(a + 1.57), tz = Math.sin(a + 1.57);
      if (r < .3) { const c = 1 + (R() * 3 | 0); for (let i = 0; i < c; i++) { const s = .32 + R() * .14, px = x + tx * (i - (c - 1) / 2) * .75, pz = z + tz * (i - (c - 1) / 2) * .75; put('jar', px, s, pz, s, s * 1.1, s); put('neck', px, s * 2.05, pz, s * .45, s * .5, s * .45); } }
      else if (r < .5) { put('crate', x, .4, z, .8, .8, .8, 0, R()); if (R() < .5) put('crate', x + tx * .3, 1.05, z + tz * .3, .55, .5, .55, 0, R()); if (R() < .6) put('barrel', x + tx * .9, .45, z + tz * .9, .36, .9, .36); }
      else if (r < .75) { for (let i = 0; i < 4; i++) { const s = .18 + R() * .35; put('rub', x + (R() - .5) * 1.4, s * .4, z + (R() - .5) * 1.4, s, s * .7, s, R(), R() * 6, R()); } }
      else { put('skull', x, .14, z, .15, .14, .17, 0, a); for (let i = 0; i < 3; i++) put('bone', x + (R() - .5) * .9, .05, z + (R() - .5) * .9, .035, .5, .035, 1.57, R() * 6, 0); }
      if (R() < .35) { const w = new T.Mesh(new T.PlaneGeometry(1.4, 1.4), web); w.position.set(x + Math.cos(a) * .3, (o.h || 2.6) - .8, z + Math.sin(a) * .3); w.rotation.set(0, -a + Math.PI / 2 + (R() < .5 ? 0 : Math.PI / 2), 0); par.add(w); } }
    for (const k in L) L[k].instanceMatrix.needsUpdate = true; return L;
  }
  // Freie Rasterzellen mit Wand daneben → Plätze an der Wand ([x, z, Winkel zur Wand]); skip(i, j) lässt Zellen aus (Start, Treppe, Rätsel)
  function gridSpots(g, N, cx, cz, cs, skip) { const out = [];
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { if (g[i][j] || (skip && skip(i, j))) continue;
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= N || b >= N || g[a][b] !== 1) continue;
        out.push([cx(i) + di * cs * .36, cz(j) + dj * cs * .36, Math.atan2(dj, di), i, j]); } }
    return out; }
  // Ein ganzes Raster einrichten: Fackeln, Kohlebecken, Tropfsteine/Kristalle, Kleinkram, Statuen
  function dress(par, g, N, cx, cz, cs, R, o = {}) {
    const sp = gridSpots(g, N, cx, cz, cs, o.skip), torches = [], cav = [], clut = [], stat = [];
    sp.forEach((q, k) => { const r = R(); if (r < .24) torches.push(q); else if (r < .46) cav.push(q); else if (r < .9) clut.push(q); else stat.push(q); });
    for (const [x, z, a] of torches) torch(par, x + Math.cos(a) * .55, 1.6, z + Math.sin(a) * .55, Math.atan2(-Math.cos(a), -Math.sin(a)), o.flame);
    if (o.cave !== false) cavern(par, cav, o.glow || 0x7fa8ff, R, o.rock); else clut.push(...cav);
    clutter(par, clut, R, { rock: o.rock, h: o.h });
    for (const [x, z, a] of stat.slice(0, o.statues ?? 6)) (R() < .5 ? statue(par, x, z, Math.atan2(-Math.cos(a), -Math.sin(a)), o.stone) : brazier(par, x, z, o.flame));
    floor(par, cellPts(g, N, cx, cz, o.skip), R, { slab: o.rock ? new T.Color(o.rock).lerp(new T.Color(0xb0a898), .5).getHex() : undefined });
    return sp.length;
  }
  // Bodendetails: Pfützen (spiegelnd), Moosflecken, lose und gekippte Bodenplatten, Risse – flach, ohne Kollision.
  // pts: freie Punkte [x, z]; Platten sind gebrochen und schief, damit man sie nicht mit Druckplatten verwechselt.
  function floor(par, pts, R, o = {}) {
    const n = pts.length, ob = new T.Object3D();
    const mkI = (geo, mat, cap) => { const im = new T.InstancedMesh(geo, mat, cap); im.count = 0; im.receiveShadow = true; im.frustumCulled = false; par.add(im); return im; };
    const pud = mkI(G.cyl, new T.MeshStandardMaterial({ color: o.water || 0x1a2a3a, roughness: .04, metalness: .6, transparent: true, opacity: .78 }), n);
    const moss = mkI(G.cyl, TX.tri('grass', o.moss || 0x4a7a3a, { s: 1.2, gain: 1.6, n: .4 }), n * 3);
    const slab = mkI(G.box, TX.tri('stone', o.slab || 0x8a8478, { s: .9, gain: 2.1, e: 0x1a140e, ei: 1 }), n * 4);
    const crack = mkI(G.box, M(0x0c0a0a, { r: 1 }), n * 3);
    const put = (im, x, y, z, sx, sy, sz, rx, ry, rz) => { ob.position.set(x, y, z); ob.rotation.set(rx || 0, ry || 0, rz || 0); ob.scale.set(sx, sy, sz); ob.updateMatrix(); im.setMatrixAt(im.count++, ob.matrix); };
    for (const [x, z] of pts) { const r = R(), jx = (R() - .5) * 1.6, jz = (R() - .5) * 1.6;
      if (r < .28) { const s = .7 + R() * .9; put(pud, x + jx, .025, z + jz, s, .01, s * (.6 + R() * .4), 0, R() * 6); }
      else if (r < .55) { for (let i = 0; i < 1 + (R() * 3 | 0); i++) { const s = .4 + R() * .8; put(moss, x + jx + (R() - .5) * 1.2, .02, z + jz + (R() - .5) * 1.2, s, .015, s * (.5 + R() * .5), 0, R() * 6); } }
      else if (r < .85) { for (let i = 0; i < 2 + (R() * 3 | 0); i++) { const w = .5 + R() * .5; put(slab, x + jx + (R() - .5) * 1.8, .05, z + jz + (R() - .5) * 1.8, w, .08 + R() * .06, w * (.6 + R() * .4), (R() - .5) * .12, R() * 6, (R() - .5) * .12); } }
      else { for (let i = 0; i < 3; i++) put(crack, x + jx + (R() - .5) * 1.2, .012, z + jz + (R() - .5) * 1.2, .05, .01, .5 + R() * .8, 0, R() * 6); } }
    for (const im of [pud, moss, slab, crack]) im.instanceMatrix.needsUpdate = true;
  }
  // freie Zellmitten eines Rasters (für floor)
  const cellPts = (g, N, cx, cz, skip) => { const out = []; for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if (!g[i][j] && !(skip && skip(i, j))) out.push([cx(i), cz(j)]); return out; };
  return { walls, rockGeo, rockMat, torch, cavern, column, brazier, statue, banner, clutter, gridSpots, dress, floor, cellPts };
}
