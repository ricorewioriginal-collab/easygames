'use strict';
/* Bunte Insel – Block-Bauen (Minecraft-/Roblox-Mix) im Bauland.
   1-Meter-Würfel in einem Raster (bis 12 000 Blöcke, 32 m hoch), die man stapeln, begehen und abbauen kann – dazu Spezialblöcke
   (Sprungblock, Lavablock, Startblock, Glas, Neon). Die Welt ist in 16×16-Blöcke große Stücke („Chunks“) geteilt: nur geänderte Stücke
   werden neu gebaut, verdeckte Flächen werden weggelassen (sparsam!). Kollision läuft über den Raster direkt (kein Collider pro Block).
   Alles wird gespeichert (Spielstand-Platz). Nicht mit Freunden synchronisiert. */
BI.VOX_TYPES = (function () {
  const T = (id, name, icon, top, side, bottom, o) => Object.assign({ id, name, icon, top, side: side == null ? top : side, bottom: bottom == null ? (side == null ? top : side) : bottom }, o || {});
  const wool = [['weiss', 'Wolle weiß', 0xf4f4f4], ['rot', 'Wolle rot', 0xe8453c], ['blau', 'Wolle blau', 0x3f8cff], ['gelb', 'Wolle gelb', 0xffd23f], ['gruen', 'Wolle grün', 0x4cd07d], ['rosa', 'Wolle rosa', 0xff8fc8], ['orange', 'Wolle orange', 0xff8a1f], ['lila', 'Wolle lila', 0xa66bff]];
  return [
    T('gras', 'Gras', '🟩', 0x5fd05a, 0x8a5a33, 0x6b4423, { g: 'nat' }), T('erde', 'Erde', '🟫', 0x8a5a33, 0x7a4e2c, 0x6b4423, { g: 'nat' }), T('stein', 'Stein', '⬜', 0x9aa0a8, 0x8e949c, 0x80868e, { g: 'nat' }),
    T('kopf', 'Kopfstein', '🔲', 0x7f858f, 0x737982, 0x6a6f78, { g: 'nat' }), T('sand', 'Sand', '🟨', 0xf1d98a, 0xe6cc7a, 0xd9be6b, { g: 'nat' }), T('schnee', 'Schnee', '⬜', 0xf6faff, 0xe4edf7, 0xd2dce8, { g: 'nat' }),
    T('eis', 'Eis', '🧊', 0xbfe8ff, 0xaedcf5, 0x9fd0ee, { g: 'nat' }), T('holz', 'Holzbrett', '🟧', 0xd2a574, 0xc8a27a, 0xb58f63, { g: 'nat' }), T('stamm', 'Baumstamm', '🪵', 0xd9b27a, 0x6b4a2a, 0xd9b27a, { g: 'nat' }),
    T('laub', 'Blätter', '🌿', 0x45b055, 0x3fa84e, 0x3a9648, { g: 'nat' }), T('ziegel', 'Ziegel', '🧱', 0xc9524a, 0xc2453d, 0xb23c35, { g: 'nat' }), T('sandstein', 'Sandstein', '🟫', 0xe8d398, 0xe0c98a, 0xd2bc7c, { g: 'nat' })
  ].concat(wool.map(w => T('w' + w[0], w[1], '🟦', w[2], null, null, { g: 'col' })), [
    T('gold', 'Gold', '🟡', 0xffe27a, 0xffd23f, 0xe6b800, { g: 'col' }), T('schwarz', 'Schwarz', '⬛', 0x3a3d46, 0x2b2e36, 0x23262d, { g: 'col' }),
    T('glas', 'Glas', '🔷', 0xa8dcff, 0xa8dcff, 0xa8dcff, { g: 'spc', glass: true }),
    T('nblau', 'Neon blau', '💠', 0x4de0ff, 0x4de0ff, 0x4de0ff, { g: 'spc', neon: true }), T('nrosa', 'Neon pink', '💗', 0xff5ab4, 0xff5ab4, 0xff5ab4, { g: 'spc', neon: true }),
    T('ngruen', 'Neon grün', '💚', 0x6bff8a, 0x6bff8a, 0x6bff8a, { g: 'spc', neon: true }), T('ngelb', 'Neon gelb', '💛', 0xfff04d, 0xfff04d, 0xfff04d, { g: 'spc', neon: true }),
    T('sprung', 'Sprungblock', '🟢', 0xffffff, 0x4cd07d, 0x4cd07d, { g: 'spc', bounce: true }), T('lava', 'Lavablock', '🌋', 0xff7a2a, 0xe0451a, 0xb83210, { g: 'spc', lava: true }),
    T('start', 'Startblock', '🚩', 0x2d6be0, 0x2457b8, 0x1d4896, { g: 'spc', spawn: true })
  ]);
})();
BI.VOX_GROUPS = [{ id: 'nat', icon: '🌿', name: 'Natur' }, { id: 'col', icon: '🎨', name: 'Farben' }, { id: 'spc', icon: '✨', name: 'Spezial' }];

BI.createVoxels = function (G) {
  const { scene, W, A, fx, P, say } = G, B = BI.BAULAND, TY = BI.VOX_TYPES, V = {}, CH = 16, HY = 32, MAXV = 12000, STEP = 1.05, HEAD = 1.8;
  const chunks = new Map(), mat = BI.mat(), gmat = new THREE.MeshLambertMaterial({ vertexColors: true, transparent: true, opacity: .5, depthWrite: false });
  V.count = 0; V.sel = 0; V.cur = { px: 0, py: 0, pz: 0, hit: null }; V.active = false; V.MAXV = MAXV; V.TYPES = TY; V.placed = 0;
  const rgb = TY.map(t => [t.top, t.side, t.bottom].map(c => [((c >> 16) & 255) / 255, ((c >> 8) & 255) / 255, (c & 255) / 255]));
  const ck = (cx, cz) => cx + ',' + cz;
  const getC = (cx, cz, mk) => { const k = ck(cx, cz); let c = chunks.get(k); if (!c && mk) { c = { d: new Uint8Array(CH * CH * HY), cx, cz, mesh: null, gm: null, dirty: false, n: 0 }; chunks.set(k, c); } return c; };
  const idx = (lx, y, lz) => (y * CH + lz) * CH + lx;
  V.get = (ix, iy, iz) => { if (iy < 0 || iy >= HY) return 0; const c = chunks.get(ck(Math.floor(ix / CH), Math.floor(iz / CH))); return c ? c.d[idx(ix - c.cx * CH, iy, iz - c.cz * CH)] : 0; };
  const dirtyQ = new Set();
  const markDirty = (cx, cz) => { const c = chunks.get(ck(cx, cz)); if (c) { c.dirty = true; dirtyQ.add(c); } };
  V.set = function (ix, iy, iz, t) { // t = 0 (Luft) oder Typ+1
    if (iy < 0 || iy >= HY) return false; const cx = Math.floor(ix / CH), cz = Math.floor(iz / CH), c = getC(cx, cz, t > 0); if (!c) return false;
    const lx = ix - cx * CH, lz = iz - cz * CH, i = idx(lx, iy, lz), old = c.d[i]; if (old === t) return false;
    c.d[i] = t; if (!old && t) { V.count++; c.n++; } else if (old && !t) { V.count--; c.n--; }
    markDirty(cx, cz); if (lx === 0) markDirty(cx - 1, cz); if (lx === CH - 1) markDirty(cx + 1, cz); if (lz === 0) markDirty(cx, cz - 1); if (lz === CH - 1) markDirty(cx, cz + 1);
    saveT = 1.2; return true;
  };
  /* ---------- Mesh je Chunk ---------- */
  const FACES = [[1, 0, 0, .8], [-1, 0, 0, .8], [0, 0, 1, .7], [0, 0, -1, .7], [0, 1, 0, 1], [0, -1, 0, .55]];
  function buildChunk(c) {
    const p = [], n = [], col = [], gp = [], gn = [], gc = [], x0 = c.cx * CH, z0 = c.cz * CH;
    if (c.n > 0) for (let y = 0; y < HY; y++) for (let lz = 0; lz < CH; lz++) for (let lx = 0; lx < CH; lx++) {
      const t = c.d[idx(lx, y, lz)]; if (!t) continue; const info = TY[t - 1], x = x0 + lx, z = z0 + lz, cc = rgb[t - 1], glass = !!info.glass, P_ = glass ? gp : p, N_ = glass ? gn : n, C_ = glass ? gc : col;
      const nz = ((x * 73856093) ^ (y * 19349663) ^ (z * 83492791)) & 255, jit = info.neon || glass ? 0 : (nz / 255 - .5) * .09;
      for (let f = 0; f < 6; f++) {
        const F = FACES[f], nx = F[0], ny = F[1], nzz = F[2], nb = V.get(x + nx, y + ny, z + nzz);
        if (nb) { const ni = TY[nb - 1]; if (!(ni.glass && !glass)) continue; }
        if (y === 0 && ny < 0) continue;
        const base = f === 4 ? cc[0] : f === 5 ? cc[2] : cc[1], k = (info.neon ? 1 : F[3]) + jit;
        let v; // vier Eckpunkte gegen den Uhrzeigersinn von außen gesehen
        if (nx === 1) v = [[x + 1, y, z + 1], [x + 1, y, z], [x + 1, y + 1, z], [x + 1, y + 1, z + 1]]; else if (nx === -1) v = [[x, y, z], [x, y, z + 1], [x, y + 1, z + 1], [x, y + 1, z]];
        else if (nzz === 1) v = [[x, y, z + 1], [x + 1, y, z + 1], [x + 1, y + 1, z + 1], [x, y + 1, z + 1]]; else if (nzz === -1) v = [[x + 1, y, z], [x, y, z], [x, y + 1, z], [x + 1, y + 1, z]];
        else if (ny === 1) v = [[x, y + 1, z + 1], [x + 1, y + 1, z + 1], [x + 1, y + 1, z], [x, y + 1, z]]; else v = [[x, y, z], [x + 1, y, z], [x + 1, y, z + 1], [x, y, z + 1]];
        for (const i of [0, 1, 2, 0, 2, 3]) { P_.push(v[i][0], v[i][1], v[i][2]); N_.push(nx, ny, nzz); C_.push(base[0] * k, base[1] * k, base[2] * k); }
      }
    }
    const mk = (pa, na, ca, m, old) => { if (old) { scene.remove(old); old.geometry.dispose(); } if (!pa.length) return null; const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pa, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(na, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(ca, 3)); g.computeBoundingSphere(); const me = new THREE.Mesh(g, m); scene.add(me); return me; };
    c.mesh = mk(p, n, col, mat, c.mesh); c.gm = mk(gp, gn, gc, gmat, c.gm); c.dirty = false;
    if (c.n === 0 && !c.mesh && !c.gm) chunks.delete(ck(c.cx, c.cz));
  }
  /* ---------- Kollision / Begehen ---------- */
  const near = (x, z, m) => x > B.x - B.R - m && x < B.x + B.R + m && z > B.z - B.R - m && z < B.z + B.R + m;
  V.floorAt = function (x, z, y) {
    if (!V.count || !near(x, z, 2)) return 0; const ix = Math.floor(x), iz = Math.floor(z), c = chunks.get(ck(Math.floor(ix / CH), Math.floor(iz / CH))); if (!c) return 0;
    const lx = ix - c.cx * CH, lz = iz - c.cz * CH; for (let iy = Math.min(HY - 1, Math.floor(y + STEP - 1 + 1e-6)); iy >= 0; iy--) if (c.d[idx(lx, iy, lz)]) return iy + 1; return 0;
  };
  /* schiebt den Kreis (px,pz,r) aus Blöcken, die dem Körper im Weg sind (Füße auf Höhe y) */
  V.push = function (px, pz, r, y) {
    if (!V.count || !near(px, pz, 2)) return null; let hit = false; const lo = Math.floor(y + STEP), hi = Math.ceil(y + HEAD) - 1;
    for (let iy = Math.max(0, lo); iy <= hi && iy < HY; iy++) for (let ix = Math.floor(px - r); ix <= Math.floor(px + r); ix++) for (let iz = Math.floor(pz - r); iz <= Math.floor(pz + r); iz++) {
      if (!V.get(ix, iy, iz)) continue; const cx = BI.clamp(px, ix, ix + 1), cz = BI.clamp(pz, iz, iz + 1), dx = px - cx, dz = pz - cz, d2 = dx * dx + dz * dz;
      if (d2 > 1e-9) { if (d2 < r * r) { const d = Math.sqrt(d2), k = (r - d) / d; px += dx * k; pz += dz * k; hit = true; } }
      else { const l = px - ix, rg = ix + 1 - px, t = pz - iz, b = iz + 1 - pz, m = Math.min(l, rg, t, b); if (m === l) px = ix - r; else if (m === rg) px = ix + 1 + r; else if (m === t) pz = iz - r; else pz = iz + 1 + r; hit = true; }
    }
    return hit ? { x: px, z: pz } : null;
  };
  /* ---------- Bauen / Abbauen (mit Rückgängig) ---------- */
  const undo = []; let saveT = 0;
  const inArea = (ix, iz) => { const x = ix + .5, z = iz + .5; return Math.hypot(x - B.x, z - B.z) < B.R - 6 && Math.hypot(x - B.entry.x, z - B.entry.z) > 15; };
  V.canPlace = (ix, iy, iz) => {
    if (iy < 0 || iy >= HY || V.count >= MAXV || !inArea(ix, iz) || V.get(ix, iy, iz)) return false;
    const x = ix + .5, z = iz + .5; if (!P.veh && Math.abs(P.x - x) < .8 && Math.abs(P.z - z) < .8 && P.y < iy + 1 && P.y + HEAD > iy) return false;
    return !W.blockedAt(x, z, .6, true);
  };
  const pushU = o => { undo.push(o); if (undo.length > 120) undo.shift(); };
  V.place = function () {
    const c = V.cur; if (!V.canPlace(c.px, c.py, c.pz)) { say(V.count >= MAXV ? 'Das Bauland ist voll 🧱' : 'Hier kann man nicht bauen 🚫', 1400); return false; }
    V.set(c.px, c.py, c.pz, V.sel + 1); pushU({ a: 1, x: c.px, y: c.py, z: c.pz, t: 0 }); A.place(); fx.burst(c.px + .5, c.py + .5, c.pz + .5, 6, [BI.C.gold, BI.C.white], 2.4, .6, 26, 4);
    V.placed++; milestone(); return true;
  };
  V.remove = function () {
    const h = V.cur.hit; if (!h) { say('Tippe auf einen Block, den du abbauen willst ⛏', 1600); return false; }
    const t = V.get(h.x, h.y, h.z); if (!t) return false; V.set(h.x, h.y, h.z, 0); pushU({ a: 0, x: h.x, y: h.y, z: h.z, t }); A.pop(); fx.burst(h.x + .5, h.y + .5, h.z + .5, 6, [BI.C.dust, BI.C.white], 2.4, .6, 28, 4);
    V.cur.hit = null; return true;
  };
  V.undo = function () {
    const o = undo.pop(); if (!o) { say('Nichts zum Zurücknehmen', 1200); return false; }
    V.set(o.x, o.y, o.z, o.a ? 0 : o.t); A.pop(); return true;
  };
  V.clearAll = function () { for (const c of [...chunks.values()]) { c.d.fill(0); c.n = 0; c.dirty = true; dirtyQ.add(c); } V.count = 0; undo.length = 0; saveT = .2; };
  V.height = (ix, iz) => { let h = 0; for (let y = 0; y < HY; y++) if (V.get(ix, y, iz)) h = y + 1; return h; };
  const MS = [[25, 2, '🧱 25 Blöcke gebaut!'], [100, 3, '🏠 100 Blöcke – ein kleines Haus!'], [300, 5, '🏰 300 Blöcke – eine Burg entsteht!'], [1000, 10, '🌆 1000 Blöcke – ein ganzes Dorf!'], [3000, 20, '🚀 3000 Blöcke – Meister-Baumeister!']];
  V.ms = () => MS.filter(m => V.placed >= m[0]).length;
  function milestone() { const s = G.save.bauland || (G.save.bauland = { placed: 0, ms: 0 }); s.placed = V.placed; for (let i = s.ms | 0; i < MS.length; i++) if (V.placed >= MS[i][0]) { s.ms = i + 1; G.addStars(MS[i][1]); say(MS[i][2] + ' +' + MS[i][1] + ' ⭐', 3600); A.fanfare(); } G.persist(); }
  /* ---------- Zielen (Tippen auf Boden oder Block) ---------- */
  const ghostM = new THREE.MeshBasicMaterial({ color: 0x66ff99, transparent: true, opacity: .45, depthWrite: false }), ghost = new THREE.Mesh(new THREE.BoxGeometry(1.01, 1.01, 1.01), ghostM); ghost.visible = false; scene.add(ghost);
  const hl = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.04, 1.04, 1.04)), new THREE.LineBasicMaterial({ color: 0xffffff })); hl.visible = false; scene.add(hl);
  V.aim = function (origin, dir) {
    let lx = Math.floor(origin.x), ly = Math.floor(origin.y), lz = Math.floor(origin.z), hit = null, k = 0;
    for (let s = 0; s < 480; s++) {
      k = s * .2; const x = origin.x + dir.x * k, y = origin.y + dir.y * k, z = origin.z + dir.z * k, ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
      if (y < 0) { V.cur.px = ix; V.cur.py = 0; V.cur.pz = iz; V.cur.hit = null; return true; } // Boden
      if (ix === lx && iy === ly && iz === lz) continue;
      if (V.get(ix, iy, iz)) { hit = { x: ix, y: iy, z: iz }; V.cur.px = lx; V.cur.py = ly; V.cur.pz = lz; V.cur.hit = hit; return true; }
      lx = ix; ly = iy; lz = iz;
    }
    return false;
  };
  /* Vorschau-Würfel (3 Seiten sichtbar) für das Baumenü (js/thumbs.js) */
  V.thumbMesh = i => {
    const info = TY[i], cc = rgb[i], p = [], n = [], col = [], face = (v, nr, c, k) => { for (const q of [0, 1, 2, 0, 2, 3]) { p.push(v[q][0], v[q][1], v[q][2]); n.push(nr[0], nr[1], nr[2]); col.push(c[0] * k, c[1] * k, c[2] * k); } };
    face([[1, 0, 1], [1, 0, 0], [1, 1, 0], [1, 1, 1]], [1, 0, 0], cc[1], info.neon ? 1 : .8); face([[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]], [0, 0, 1], cc[1], info.neon ? 1 : .7); face([[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]], [0, 1, 0], cc[0], 1);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(n, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); return new THREE.Mesh(g, mat);
  };
  V.shift = dy => { V.cur.py = BI.clamp(V.cur.py + dy, 0, HY - 1); V.cur.hit = null; A.pop(); };
  V.setType = i => { V.sel = BI.clamp(i | 0, 0, TY.length - 1); };
  V.enter = function (x, z, h) { V.active = true; V.cur.px = Math.floor(x + Math.sin(h) * 4); V.cur.pz = Math.floor(z + Math.cos(h) * 4); V.cur.py = 0; V.cur.hit = null; };
  V.exit = function () { V.active = false; ghost.visible = hl.visible = false; };
  V.inBauland = () => Math.hypot(P.x - B.x, P.z - B.z) < B.R + 4;
  /* ---------- Spezialblöcke ---------- */
  let spawn = BI.store.get('voxspawn', null), bounceCd = 0;
  V.respawn = () => (spawn && Array.isArray(spawn) ? { x: spawn[0], y: spawn[1], z: spawn[2] } : { x: B.entry.x, y: 0, z: B.entry.z });
  function special(dt) {
    bounceCd -= dt; if (P.veh || P.y < .02 || !near(P.x, P.z, 0)) return; const ix = Math.floor(P.x), iz = Math.floor(P.z), iy = Math.round(P.y) - 1; if (iy < 0 || Math.abs(P.y - Math.round(P.y)) > .08) return;
    const t = V.get(ix, iy, iz); if (!t) return; const info = TY[t - 1];
    if (info.bounce && bounceCd <= 0 && P.vy <= .5) { bounceCd = .35; P.vy = 14; A.boing(); fx.burst(P.x, P.y + .1, P.z, 8, [BI.C.green || BI.C.gold, BI.C.white], 3, .6, 24, 5); }
    else if (info.lava) { const r = V.respawn(); fx.burst(P.x, P.y + 1, P.z, 16, [BI.C.red, BI.C.gold], 4, 1, 30, 3); P.x = r.x + (r.x === B.entry.x ? 0 : .5); P.z = r.z + (r.x === B.entry.x ? 0 : .5); P.y = r.y; P.vy = 0; A.bump(); say('🔥 Heiß! Zurück zum Start', 1800); }
    else if (info.spawn && (!spawn || spawn[0] !== ix || spawn[2] !== iz)) { spawn = [ix, iy + 1, iz]; BI.store.set('voxspawn', spawn); say('🚩 Neuer Startpunkt gesetzt!', 1600); A.star(); }
  }
  /* ---------- Frame ---------- */
  V.update = function (dt, t) {
    let n = 0; for (const c of dirtyQ) { dirtyQ.delete(c); buildChunk(c); if (++n >= 2) break; }
    if (saveT > 0) { saveT -= dt; if (saveT <= 0) flush(); }
    if (V.active) {
      const c = V.cur, ok = V.canPlace(c.px, c.py, c.pz); ghost.visible = true; ghost.position.set(c.px + .5, c.py + .5, c.pz + .5); ghostM.color.setHex(ok ? TY[V.sel].top : 0xff5a5a); ghostM.opacity = ok ? .5 : .4;
      hl.visible = !!c.hit; if (c.hit) hl.position.set(c.hit.x + .5, c.hit.y + .5, c.hit.z + .5);
    }
    if (V.count) special(dt);
  };
  /* ---------- Speichern / Laden (Folge von [x,y,z,typ] als Zahlen, als Text gepackt) ---------- */
  function flush() { const a = []; for (const c of chunks.values()) { if (!c.n) continue; for (let y = 0; y < HY; y++) for (let lz = 0; lz < CH; lz++) for (let lx = 0; lx < CH; lx++) { const t = c.d[idx(lx, y, lz)]; if (t) a.push(c.cx * CH + lx, y, c.cz * CH + lz, t); } } BI.store.set('vox', a); }
  V.saveNow = () => { saveT = 0; flush(); };
  const saved = BI.store.get('vox', []);
  if (Array.isArray(saved)) for (let i = 0; i + 3 < saved.length && V.count < MAXV; i += 4) { const t = saved[i + 3] | 0; if (t > 0 && t <= TY.length) V.set(saved[i] | 0, saved[i + 1] | 0, saved[i + 2] | 0, t); }
  saveT = 0; V.placed = Math.max((G.save.bauland && G.save.bauland.placed) | 0, 0);
  W.vox = V;
  return V;
};
