/* Rissfluss – Bewegungskunst (Kapitel 4): Wände entlanglaufen, auf Rissschienen gleiten, an Rissstangen schwingen.
   Alles hängt an der Sprungtaste (Tastatur, Controller, Touch gleich): in der Luft an einer Wand halten = Wandlauf,
   über eine Rissschiene fallen = Gleiten, bei einer Stange springen = Schwingen; erneut springen = Abstoßen.
   Die Schienen und Stangen stehen schon vor dem Lernen in jeder Welt (matt) und leuchten erst, wenn der Riss in Kapitel 4 geschlossen ist. */
export function createFlow(C) {
  const { T, mk, G, M, glow, scene, pl, keys } = C;
  const S = () => C.S();
  let rails = [], poles = [], mats = [];
  const rnd = seed => { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } };
  const V = new T.Vector3(), Q = new T.Quaternion(), UP = new T.Vector3(0, 1, 0);
  const seg = (a, b, r, mat) => { const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z, l = Math.hypot(dx, dy, dz), m = mk(G.cyl0, mat, (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2, r, l, r, false); V.set(dx / l, dy / l, dz / l); Q.setFromUnitVectors(UP, V); m.quaternion.copy(Q); return m };

  function clear() { rails = []; poles = []; mats = []; pl.flow = null }

  /* ---- Bauen: je Welt zwei Schienen und zwei Stangen an eigenen Stellen ---- */
  function mkRail(R, n, k, col) {
    for (let t = 0; t < 30; t++) {
      const s = C.spot(k * 37 + t * 11 + n * 5); if (!s) continue;
      const dir = R() < .5 ? 1 : -1, A = 1.5 + R() * 3.5, f = .22 + R() * .3, ph = R() * 6, st = 2.6; let N = 14 + Math.floor(R() * 10);
      const pts = []; let ok = true;
      for (let i = 0; i <= N && ok; i++) {
        const x = s[0] + A * Math.sin(i * f + ph) - A * Math.sin(ph), z = s[1] - dir * i * st;
        if (C.pBlocked(x, z) || !C.colFree(x, z, .9) || (i && Math.abs(C.hgt(x, z) - C.hgt(pts[i - 1].x, pts[i - 1].z)) > 1.5)) { ok = false; N = i - 1; break }
        pts.push({ x, z, y: C.hgt(x, z) + 1.55 + i * .03 });
      }
      if (N < 8) continue; pts.length = N + 1;
      for (let p = 0; p < 2; p++) for (let i = 1; i < N; i++) pts[i].y = (pts[i - 1].y + pts[i].y * 2 + pts[i + 1].y) / 4;
      for (const q of pts) q.y = Math.max(q.y, C.hgt(q.x, q.z) + 1.25);
      const L = [0]; for (let i = 1; i <= N; i++) L.push(L[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y, pts[i].z - pts[i - 1].z));
      const mat = new T.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: .2, roughness: .35, metalness: .5 }); mats.push(mat);
      const g = new T.Group(), post = M(0x5a5e72, { r: .6, m: .4 });
      for (let i = 0; i < N; i++) g.add(seg(pts[i], pts[i + 1], .09, mat));
      for (let i = 0; i <= N; i++) { const q = pts[i], gy = C.hgt(q.x, q.z); if (i % 3 === 0) g.add(mk(G.cyl0, post, q.x, (gy + q.y) / 2 - .1, q.z, .07, q.y - gy, .07)); if (i % 5 === 0) g.add(glow(col, 1.1, q.x, q.y, q.z, .5)); }
      scene.add(g);
      let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; for (const q of pts) { x0 = Math.min(x0, q.x); x1 = Math.max(x1, q.x); z0 = Math.min(z0, q.z); z1 = Math.max(z1, q.z) }
      const r = { pts, L, len: L[N], bb: [x0 - 1.5, x1 + 1.5, z0 - 1.5, z1 + 1.5] }; rails.push(r);
      /* Stange am Ende: ein Abstoß von der Schiene landet beim Schwingen */
      const e = pts[N], a = pts[N - 1], dx = e.x - a.x, dz = e.z - a.z, dl = Math.hypot(dx, dz) || 1, px = e.x + dx / dl * 4.5, pz = e.z + dz / dl * 4.5;
      mkPole(px, pz, col); return r;
    }
    return null;
  }
  function mkPole(x, z, col) {
    if (C.pBlocked(x, z) || !C.colFree(x, z, 1.4)) return null;
    const y = C.hgt(x, z), h = 4.6, g = new T.Group(), met = M(0x7a7e94, { r: .35, m: .6 }), gm = M(col, { e: col, ei: 1.2 });
    g.position.set(x, y, z); g.add(mk(G.cyl0, M(0x4a4e60, { r: .8 }), 0, .15, 0, .55, .3, .55)); g.add(mk(G.cyl0, met, 0, h / 2, 0, .16, h, .16));
    for (const k of [1.2, 2.2, 3.2]) g.add(mk(G.cyl0, gm, 0, k, 0, .21, .08, .21, false));
    g.add(mk(G.sph0, gm, 0, h + .1, 0, .24, .24, .24, false)); g.add(glow(col, 2.2, 0, h + .1, 0, .6)); scene.add(g);
    C.addCol(x, z, .42); poles.push({ x, z, y, h }); return poles[poles.length - 1];
  }
  function build(n) {
    clear(); const R = rnd(9100 + n * 173), col = C.col(n);
    mkRail(R, n, 1, col); mkRail(R, n, 2, col);
    for (let i = 0; i < 2; i++) { const s = C.spot(300 + i * 29 + n * 7); if (s) mkPole(s[0], s[1], col) }
    if (!mats.length && !poles.length) return;
    C.anim(() => { const on = C.art() ? 1.5 + Math.sin(C.time() * 3) * .3 : .15; for (const m of mats) m.emissiveIntensity = on });
  }

  /* ---- Hilfen ---- */
  /* Hindernis genau (Bäume/Felsen als Kreise, Häuser als Rechteck – nicht der grobe Hauskreis von colFree) */
  const hit = (x, z, r) => C.pBlocked(x, z) || C.COL.some(c => Math.hypot(c.x - x, c.z - z) < c.r + r) || C.HOUSES.some(H => { const dx = x - H.x, dz = z - H.z; if (Math.abs(dx) > H.R + r || Math.abs(dz) > H.R + r) return false; const lx = dx * H.c - dz * H.s, lz = dx * H.s + dz * H.c; return Math.abs(lx) < H.w / 2 + r && Math.abs(lz) < H.d / 2 + r });
  const solid = (x, z, y) => hit(x, z, .15) || C.hgt(x, z) > y + .8;
  function wallTop(x, z) {   /* Höhe der Mauer/Dachkante an dieser Stelle (Unendlich = unbekannt) */
    let top = -1e9;
    for (const B of C.CLB) { const dx = x - B.x, dz = z - B.z; if (Math.abs(dx) > B.R || Math.abs(dz) > B.R) continue; let lx, lz;
      if (B.rd) { if (dx * dx + dz * dz > B.hx * B.hx) continue; lx = dx; lz = dz } else { lx = dx * B.c - dz * B.s; lz = dx * B.s + dz * B.c; if (Math.abs(lx) > B.hx + .5 || Math.abs(lz) > B.hz + .5) continue }
      top = Math.max(top, B.y + (B.f ? B.f(lx, lz) : 0)) }
    if (top > -1e8) return top; const h = C.hgt(x, z); return h > pl.y - 2 ? h : Infinity;
  }
  function nearRail(x, y, z) {
    let best = null;
    for (const r of rails) { if (x < r.bb[0] || x > r.bb[1] || z < r.bb[2] || z > r.bb[3]) continue;
      for (let i = 0; i < r.pts.length - 1; i++) { const a = r.pts[i], b = r.pts[i + 1], dx = b.x - a.x, dz = b.z - a.z, l2 = dx * dx + dz * dz || 1, u = Math.max(0, Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / l2)), px = a.x + dx * u, pz = a.z + dz * u, py = a.y + (b.y - a.y) * u, d = Math.hypot(x - px, z - pz);
        if (d < .85 && y - py > -.3 && y - py < .95 && (!best || d < best.d)) best = { r, s: r.L[i] + (r.L[i + 1] - r.L[i]) * u, d } } }
    return best;
  }
  function at(r, s) {
    s = Math.max(0, Math.min(r.len, s)); let i = 0; while (i < r.L.length - 2 && r.L[i + 1] < s) i++;
    const a = r.pts[i], b = r.pts[i + 1], u = (s - r.L[i]) / ((r.L[i + 1] - r.L[i]) || 1), dx = b.x - a.x, dz = b.z - a.z, dl = Math.hypot(dx, dz) || 1;
    return { x: a.x + dx * u, y: a.y + (b.y - a.y) * u, z: a.z + dz * u, tx: dx / dl, tz: dz / dl };
  }
  const hv = () => Math.hypot(pl.vx + (pl.fvx || 0), pl.vz + (pl.fvz || 0));
  function wallDir() {
    const sp = hv(); if (sp < 2.2) return null; const vx = (pl.vx + (pl.fvx || 0)) / sp, vz = (pl.vz + (pl.fvz || 0)) / sp; let best = null, bd = .3;
    for (let a = 0; a < 8; a++) { const f = a * Math.PI / 4, nx = Math.sin(f), nz = Math.cos(f), px = pl.x + nx * .85, pz = pl.z + nz * .85, dot = nx * vx + nz * vz;
      if (dot > bd - .05 && dot > .25 && solid(px, pz, pl.y) && wallTop(px, pz) > pl.y + 1.2) { if (dot > bd || !best) { bd = dot; best = { nx, nz } } } }
    return best;
  }

  /* ---- Beginnen ---- */
  function begin(f) { f.hp0 = S().hp; f.t = 0; pl.flow = f; pl.air = true; pl.vy = 0; pl.on = null; pl.dash = 0; pl.atk = -1; pl.slam = false; pl.vx = pl.vz = pl.kx = pl.kz = pl.fvx = pl.fvz = 0; C.sfx('ui'); }
  function startWall(w) {
    const sp = Math.max(8.5, hv()), vx = (pl.vx + (pl.fvx || 0)), vz = (pl.vz + (pl.fvz || 0)); let tx = w.nz, tz = -w.nx;
    if (tx * vx + tz * vz < 0) { tx = -tx; tz = -tz }
    const [ix, iy] = C.inputVec(); if (ix || iy) { const d = C.worldDir(ix, iy); if (Math.hypot(d[0], d[1]) > .3 && d[0] * tx + d[1] * tz < -.4) { tx = -tx; tz = -tz } }
    if (hit(pl.x + tx * 1.2, pl.z + tz * 1.2, .3)) { tx = -tx; tz = -tz; if (hit(pl.x + tx * 1.2, pl.z + tz * 1.2, .3)) return false }
    pl.wrN = (pl.wrN || 0) + 1; begin({ k: 'wall', nx: w.nx, nz: w.nz, tx, tz, sp, y0: pl.y }); pl.face = Math.atan2(tx, tz);
    C.emit(pl.x + w.nx * .6, pl.y + 1, pl.z + w.nz * .6, 0xffe8b0, 10, 2.5, .4, .4, 0); tip('wall'); return true;
  }
  function startRail(h, dir) {
    const p = at(h.r, h.s); begin({ k: 'rail', r: h.r, s: h.s, dir, sp: 10, rv: 0 }); pl.x = p.x; pl.y = p.y; pl.z = p.z; pl.face = Math.atan2(p.tx * dir, p.tz * dir); C.emit(p.x, p.y, p.z, C.col(), 14, 3, .5, .4, 0); tip('rail');
  }
  function startPole(p) {
    const a = Math.atan2(pl.x - p.x, pl.z - p.z), vx = pl.vx + (pl.fvx || 0), vz = pl.vz + (pl.fvz || 0); let sg = (Math.cos(a) * vx - Math.sin(a) * vz) >= 0 ? 1 : -1;
    const [ix, iy] = C.inputVec(); if (ix || iy) { const d = C.worldDir(ix, iy), t = Math.cos(a) * d[0] - Math.sin(a) * d[1]; if (Math.abs(t) > .3) sg = t > 0 ? 1 : -1 }
    begin({ k: 'pole', p, a, sg, gy: Math.max(p.y + 1.5, Math.min(p.y + p.h - .6, pl.y)) }); C.emit(p.x, pl.y + 1, p.z, 0xffe8b0, 12, 3, .4, .4, 0); tip('pole');
  }
  function tip(k) {
    const s = S(); s.fl = s.fl || {}; if (s.fl['flowT' + k]) return; s.fl['flowT' + k] = 1; const J = C.KH('jump');
    C.toast(k === 'wall' ? '🌀 Wandlauf: gegen die Wand springen und ' + J + ' halten – Zotik läuft an ihr entlang. ' + J + ' tippen = abstoßen' : k === 'rail' ? '🌀 Rissschiene: aufspringen, Zotik gleitet. ' + J + ' = abspringen, in Laufrichtung drücken = schneller' : '🌀 Rissstange: ' + J + ' in der Nähe – Zotik schwingt herum, erneut ' + J + ' schleudert ihn hoch und weit');
  }

  /* ---- Beenden ---- */
  function end(vx, vz, vy, face) {
    const f = pl.flow; pl.flow = null; pl.air = true; pl.vy = vy || 0; pl.fvx = vx || 0; pl.fvz = vz || 0; pl.vx = pl.vz = 0; pl.flC = f && f.k === 'wall' ? .25 : .45; pl.dj = false; pl.ad = 0;
    if (face != null) pl.face = face;
  }
  /* Sprungtaste während des Flusses: abstoßen / abspringen / schleudern */
  function jump() {
    const f = pl.flow; if (!f) return false; C.sfx('jump');
    if (f.k === 'wall') { C.emit(pl.x + f.nx * .5, pl.y + .8, pl.z + f.nz * .5, 0xffe8b0, 14, 3, .4, .4, 0); end(-f.nx * 6.5 + f.tx * f.sp * .55, -f.nz * 6.5 + f.tz * f.sp * .55, C.JUMPV * 1.02, Math.atan2(-f.nx, -f.nz)); pl.jfw = 0 }
    else if (f.k === 'rail') { const p = at(f.r, f.s), sp = f.sp * .9; C.emit(p.x, p.y, p.z, C.col(), 16, 4, .5, .4, 0); end(p.tx * f.dir * sp, p.tz * f.dir * sp, C.JUMPV * 1.12, Math.atan2(p.tx * f.dir, p.tz * f.dir)) }
    else { const tx = Math.cos(f.a) * f.sg, tz = -Math.sin(f.a) * f.sg; C.emit(pl.x, pl.y + 1, pl.z, C.col(), 22, 5, .6, .5, 0); end(tx * 9.5, tz * 9.5, C.JUMPV * 1.3, Math.atan2(tx, tz)) }
    return true;
  }
  function drop() { const f = pl.flow; if (!f) return; end(0, 0, -1) }

  /* ---- Pro Bild ---- */
  function step(dt) {
    const f = pl.flow; f.t += dt; pl.mv = 0;
    if (pl.dead || S().hp < f.hp0 || C.busy()) { end(0, 0, 0); return }
    if (f.k === 'wall') {
      if (!keys.Space) { end(f.tx * f.sp * .35, f.tz * f.sp * .35, 0); return }
      const vy = 5.2 * (1 - f.t / 1.35) - 1.1 * (f.t / 1.35), nx = pl.x + f.tx * f.sp * dt, nz = pl.z + f.tz * f.sp * dt, ny = pl.y + vy * dt;
      if (f.t > 1.5 || ny > f.y0 + 4.4 || hit(nx, nz, .3)) { end(f.tx * f.sp * .45, f.tz * f.sp * .45, 2.5); return }
      const px = nx + f.nx * .85, pz = nz + f.nz * .85;
      if (!solid(px, pz, ny)) { end(f.tx * f.sp * .7, f.tz * f.sp * .7, 4, null); return }   /* Wand zu Ende: schwungvoll weiter */
      const top = wallTop(px, pz);
      if (top < ny + 2 && top > ny + .4) { pl.x = nx; pl.z = nz; pl.y = ny; pl.face = Math.atan2(f.nx, f.nz); end(0, 0, 1.5); C.clbTry(1, 1); return }   /* Dachkante in Reichweite: packen */
      if (top < ny + 1.1) { end(f.tx * f.sp * .5, f.tz * f.sp * .5, 3); return }
      pl.x = nx; pl.z = nz; pl.y = ny; pl.face = Math.atan2(f.tx, f.tz);
      if ((f.sp_ = (f.sp_ || 0) + dt) > .06) { f.sp_ = 0; C.emit(pl.x + f.nx * .5, pl.y + .3, pl.z + f.nz * .5, 0xffe8b0, 2, 1.2, .3, .3, 0) }
    } else if (f.k === 'rail') {
      f.rv -= dt; const p0 = at(f.r, f.s), [ix, iy] = C.inputVec();
      if (ix || iy) { const d = C.worldDir(ix, iy), dt_ = (d[0] * p0.tx + d[1] * p0.tz) * f.dir; if (dt_ > .55) f.sp = Math.min(13.5, f.sp + 8 * dt); else if (dt_ < -.55 && f.rv < 0) { f.dir = -f.dir; f.rv = .5; C.sfx('ui') } else f.sp += (10 - f.sp) * dt * 2 }
      else f.sp += (10 - f.sp) * dt * 2;
      f.s += f.dir * f.sp * dt;
      if (f.s <= 0 || f.s >= f.r.len) { const p = at(f.r, f.s <= 0 ? 0 : f.r.len); pl.x = p.x; pl.y = p.y; pl.z = p.z; end(p.tx * f.dir * f.sp, p.tz * f.dir * f.sp, 6.5, Math.atan2(p.tx * f.dir, p.tz * f.dir)); return }
      const p = at(f.r, f.s); pl.x = p.x; pl.y = p.y; pl.z = p.z; pl.face = Math.atan2(p.tx * f.dir, p.tz * f.dir);
      if ((f.sp_ = (f.sp_ || 0) + dt) > .04) { f.sp_ = 0; C.emit(p.x, p.y - .05, p.z, 0xfff0c0, 2, 2.2, .35, .3, 2) }
    } else {
      const w = 6.6 * f.sg; f.a += w * dt; const nx = f.p.x + Math.sin(f.a) * 1.1, nz = f.p.z + Math.cos(f.a) * 1.1;
      if (f.t > 1.7) { end(0, 0, 1); return }
      pl.x = nx; pl.z = nz; pl.y += (f.gy - pl.y) * Math.min(1, dt * 10); pl.face = Math.atan2(Math.cos(f.a) * f.sg, -Math.sin(f.a) * f.sg);
      if ((f.sp_ = (f.sp_ || 0) + dt) > .07) { f.sp_ = 0; C.emit(pl.x, pl.y + .6, pl.z, 0xe8e0ff, 1, 1.5, .3, .3, 0) }
    }
  }

  /* Suchen: läuft nur, wenn Zotik nicht schon im Fluss ist (billig: ohne Schienen/Stangen/Sprungtaste fast nichts) */
  function scan(dt) {
    if (pl.flC > 0) pl.flC -= dt; if (!pl.air) pl.wrN = 0;
    if (pl.flow || !C.can()) return;
    if (!C.art()) { if (rails.length + poles.length && !S().fl.flowLock && (nearP() < 7)) { S().fl.flowLock = 1; C.toast('🌀 Eine Rissschiene schimmert matt – nach Kapitel 4 weckt der geschlossene Riss den Rissfluss in Zotik') } return }
    if (pl.flC > 0) return;
    const sp = keys.Space;
    if (pl.air && pl.vy <= 4) { const h = rails.length ? nearRail(pl.x, pl.y, pl.z) : null;
      if (h) { const p = at(h.r, h.s), vx = pl.vx + (pl.fvx || 0), vz = pl.vz + (pl.fvz || 0); let dir = (vx * p.tx + vz * p.tz) >= 0 ? 1 : -1; if (Math.hypot(vx, vz) < 1.5) dir = (Math.sin(pl.face) * p.tx + Math.cos(pl.face) * p.tz) >= 0 ? 1 : -1; startRail(h, dir); return } }
    if (sp && pl.air) for (const p of poles) { if (Math.abs(p.x - pl.x) < 1.35 && Math.abs(p.z - pl.z) < 1.35 && Math.hypot(p.x - pl.x, p.z - pl.z) < 1.35 && pl.y > p.y + .3 && pl.y < p.y + p.h - .4) { startPole(p); return } }
    if (sp && pl.air && (pl.wrN || 0) < 2) { const w = wallDir(); if (w && startWall(w)) return }
  }
  const nearP = () => { let d = 99; for (const r of rails) { const p = r.pts[0]; d = Math.min(d, Math.hypot(p.x - pl.x, p.z - pl.z)) } for (const p of poles) d = Math.min(d, Math.hypot(p.x - pl.x, p.z - pl.z)); return d };
  /* Sprungtaste auf dem Boden neben einer Stange: statt zu hüpfen gleich festhalten und schwingen */
  function grabPole() {
    if (!C.art() || pl.flow || !poles.length) return false;
    for (const p of poles) if (Math.hypot(p.x - pl.x, p.z - pl.z) < 1.9 && pl.y < p.y + p.h - .8) { pl.y = Math.max(pl.y, p.y + 1.1); startPole(p); return true }
    return false;
  }

  /* Haltung der Figur */
  function pose(f) {
    const q = pl.flow; if (!q) return; const t = C.time();
    f.body.position.y = 0;
    if (q.k === 'wall') { f.body.rotation.z = .55; f.body.rotation.x = .1; f.arms[0].rotation.set(-2.6, 0, 0); f.arms[1].rotation.set(-.4 + Math.sin(t * 16) * .5, 0, 0); f.legs[0].rotation.x = Math.sin(t * 16) * .9; f.legs[1].rotation.x = -Math.sin(t * 16) * .9 }
    else if (q.k === 'rail') { f.body.rotation.x = .35; f.body.rotation.z = Math.sin(t * 5) * .08; f.body.position.y = -.16; f.arms[0].rotation.set(-.5, 0, .9); f.arms[1].rotation.set(-.5, 0, -.9); f.legs[0].rotation.set(-.55, 0, .12); f.legs[1].rotation.set(.45, 0, -.12) }
    else { f.body.rotation.x = -.18; f.arms[0].rotation.set(-3, 0, .2); f.arms[1].rotation.set(-3, 0, -.2); f.legs[0].rotation.set(-.9, 0, .45); f.legs[1].rotation.set(.1, 0, -.45) }
  }
  return { build, clear, scan, step, jump, drop, grabPole, pose, get rails() { return rails }, get poles() { return poles } };
}
