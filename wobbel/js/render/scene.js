/* Wobbel – 3D-Ansicht: isometrische Kamera, Insel, Figuren, Animationen, Partikel. */
import { toon, mesh, G, outline, makeBlob, applyLook, makeCrate, makeTarget, makeWall, makePaint, makePlank, makeKey, makeDoor, makeDecor, makeArrow, makeCrack, makeHole, COLORS } from './models.js';
import { T as TT, DIRS, keyAt, isTargetDone } from '../game/engine.js';
const T = window.THREE, PI = Math.PI;
const ease = { out: u => 1 - Math.pow(1 - u, 3), inOut: u => u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2, back: u => { const c = 1.7; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); } };
const lerp = (a, b, u) => a + (b - a) * u;

export class GameView {
  constructor(canvas) {
    this.canvas = canvas; this.r = new T.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); this.r.outputEncoding = T.LinearEncoding; this.r.shadowMap.enabled = true; this.r.shadowMap.type = T.PCFSoftShadowMap; this.r.setClearColor(0x000000, 0);
    this.scene = new T.Scene(); this.cam = new T.PerspectiveCamera(30, 1, 0.5, 200); this.W = 1; this.H = 1; this.pad = { t: 70, b: 70, l: 10, r: 10 }; this.q = 0; this.az = 38 * PI / 180; this.el = 40 * PI / 180; this.target = new T.Vector3(); this.dist = 20; this.orbit = false; this.time = 0;
    this.hemi = new T.HemisphereLight(0xffffff, 0x8899bb, 0.55); this.scene.add(this.hemi); this.sun = new T.DirectionalLight(0xffffff, 0.8); this.sun.castShadow = true; this.sun.shadow.mapSize.set(1024, 1024); this.sun.shadow.bias = -0.0006; this.scene.add(this.sun, this.sun.target);
    this.root = new T.Group(); this.scene.add(this.root); this.dyn = new T.Group(); this.scene.add(this.dyn); this.anims = []; this.cb = { sfx() {}, onDone() {} }; this.L = null; this.world = null; this.crates = new Map(); this.doors = new Map(); this.keys = []; this.planks = new Map(); this.waters = new Map(); this.blob = null; this.targetsG = [];
    this.fx = this.initFx(); this.camAng = 0; this.camAngWant = 0;
  }
  // ------------------------------------------------------------------ Partikel
  initFx() { const N = 400, pos = new Float32Array(N * 3).fill(-50), col = new Float32Array(N * 3), vel = new Float32Array(N * 3), life = new Float32Array(N), g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setAttribute('color', new T.BufferAttribute(col, 3)); const p = new T.Points(g, new T.PointsMaterial({ size: 0.16, vertexColors: true, transparent: true, depthWrite: false })); p.frustumCulled = false; this.scene.add(p); return { N, pos, col, vel, life, p, head: 0 }; }
  burst(x, y, z, hex, n, spd, up, grav) { const f = this.fx, c = new T.Color(hex); for (let i = 0; i < n; i++) { const k = (f.head++ % f.N) * 3, a = Math.random() * PI * 2, s = (spd || 1.5) * (0.4 + Math.random() * 0.8); f.pos[k] = x; f.pos[k + 1] = y; f.pos[k + 2] = z; f.vel[k] = Math.cos(a) * s; f.vel[k + 1] = (up == null ? 2 : up) * (0.5 + Math.random()); f.vel[k + 2] = Math.sin(a) * s; f.col[k] = c.r; f.col[k + 1] = c.g; f.col[k + 2] = c.b; f.life[k / 3] = 0.6 + Math.random() * 0.7; f.grav = grav == null ? 6 : grav; } f.p.geometry.attributes.color.needsUpdate = true; }
  stepFx(dt) { const f = this.fx; for (let i = 0; i < f.N; i++) { if (f.life[i] <= 0) continue; const k = i * 3; f.life[i] -= dt; if (f.life[i] <= 0) { f.pos[k + 1] = -50; continue; } f.pos[k] += f.vel[k] * dt; f.pos[k + 1] += f.vel[k + 1] * dt; f.pos[k + 2] += f.vel[k + 2] * dt; f.vel[k + 1] -= (f.grav || 6) * dt; } f.p.geometry.attributes.position.needsUpdate = true; }
  celebrate() { const w = this.L ? this.L.w : 8, h = this.L ? this.L.h : 8; for (let i = 0; i < 6; i++) setTimeout(() => { ['#ff5a6a', '#ffd24a', '#4cd964', '#4aa8ff', '#ff7ac8', '#ffffff'].forEach(c => this.burst((Math.random() - 0.5) * w, 2.5 + Math.random(), (Math.random() - 0.5) * h, c, 10, 2.2, 3, 3.2)); }, i * 140); }
  // ------------------------------------------------------------------ Aufbau
  cpos(i) { const L = this.L; return { x: (i % L.w) - L.w / 2 + 0.5, z: ((i / L.w) | 0) - L.h / 2 + 0.5 }; }
  clear(g) { while (g.children.length) g.remove(g.children[0]); }
  loadLevel(L, state, world) {
    this.L = L; this.world = world; this.clear(this.root); this.clear(this.dyn); this.anims.length = 0; this.crates.clear(); this.doors.clear(); this.keys = []; this.planks.clear(); this.waters.clear(); this.crackG = new Map(); this.holes = new Map(); this.targetsG = [];
    this.hemi.color.set(world.sky[1]); this.sun.color.set('#fff8ee');
    const w = L.w, h = L.h, ox = -w / 2 + 0.5, oz = -h / 2 + 0.5, cells = []; for (let i = 0; i < L.n; i++) if (L.terrain[i] !== TT.VOID) cells.push(i);
    // Meer
    const sea = new T.Mesh(new T.PlaneGeometry(120, 120), new T.MeshBasicMaterial({ map: this.seaTex(world.water), transparent: true, opacity: 0.96 })); sea.rotation.x = -PI / 2; sea.position.y = -0.62; this.root.add(sea); this.sea = sea;
    // Insel: Platten + Erdblöcke (instanziert)
    const slabG = G.box(), n = cells.filter(i => L.terrain[i] !== TT.WATER).length, slabs = new T.InstancedMesh(slabG, new T.MeshToonMaterial({ color: 0xffffff, gradientMap: toon('#fff').gradientMap }), n), soil = new T.InstancedMesh(slabG, new T.MeshToonMaterial({ color: 0xffffff, gradientMap: toon('#fff').gradientMap }), n);
    slabs.instanceColor = new T.InstancedBufferAttribute(new Float32Array(n * 3), 3); soil.instanceColor = new T.InstancedBufferAttribute(new Float32Array(n * 3), 3); slabs.receiveShadow = true; soil.receiveShadow = true;
    const m4 = new T.Matrix4(), c = new T.Color(); let k = 0;
    cells.forEach(i => { if (L.terrain[i] === TT.WATER) return; const x = i % w, y = (i / w) | 0, ice = L.terrain[i] === TT.ICE;
      m4.makeScale(0.99, 0.16, 0.99).setPosition(ox + x, -0.08, oz + y); slabs.setMatrixAt(k, m4); c.set(ice ? '#bfe8ff' : world.floor[(x + y) & 1]); slabs.setColorAt(k, c);
      m4.makeScale(0.99, 0.5, 0.99).setPosition(ox + x, -0.41, oz + y); soil.setMatrixAt(k, m4); c.set(world.soil).offsetHSL(0, 0, ((x * 7 + y * 13) % 5 - 2) * 0.012); soil.setColorAt(k, c); k++; });
    this.root.add(slabs, soil);
    cells.forEach(i => { const x = i % w, y = (i / w) | 0, p = this.cpos(i), t = L.terrain[i];
      if (t === TT.WALL) { const wl = makeWall(world.wall, x, y); wl.position.set(p.x, 0, p.z); wl.scale.y = 0.66; wl.traverse(o => { if (o.isMesh) o.castShadow = true; }); this.root.add(wl); }
      else if (t === TT.WATER) { const wm = new T.Mesh(G.box(), new T.MeshPhongMaterial({ color: world.water, emissive: new T.Color(world.water).multiplyScalar(0.4), shininess: 90, specular: 0xffffff })); wm.scale.set(0.99, 0.2, 0.99); wm.position.set(p.x, -0.2, p.z); wm.userData.ph = Math.random() * 6; this.root.add(wm); this.waters.set(i, wm); }
      else if (t === TT.ICE) { const gl = new T.Mesh(G.box(), new T.MeshPhongMaterial({ color: '#d8f4ff', transparent: true, opacity: 0.55, shininess: 120, specular: 0xffffff })); gl.scale.set(0.99, 0.03, 0.99); gl.position.set(p.x, 0.005, p.z); this.root.add(gl); [[-0.25, -0.2], [0.2, 0.25]].forEach(s => { const sp = mesh(G.oct(), new T.MeshBasicMaterial({ color: '#ffffff' }), p.x + s[0], 0.02, p.z + s[1], 0.05, 0.01, 0.05, this.root); sp.rotation.y = 0.7; }); }
      if (L.arrow[i]) { const ar = makeArrow(L.arrow[i] - 1); ar.position.set(p.x, 0.005, p.z); this.root.add(ar); }
      if (L.crack[i]) { const cg = makeCrack(); cg.position.set(p.x, 0.005, p.z); this.root.add(cg); this.crackG.set(i, cg); }
      if (L.paint[i]) { const pm = makePaint(L.paint[i]); pm.position.set(p.x, 0.02, p.z); this.root.add(pm); }
      if (L.target[i]) { const tg = makeTarget(L.target[i]); tg.position.set(p.x, 0, p.z); this.root.add(tg); this.targetsG.push({ g: tg, i }); }
    });
    // Dekoration rund um die Insel
    const kinds = { wiese: ['tree'], strand: ['palm', 'palm', 'berg'], farbe: ['paint', 'tower'], eis: ['berg'], schloss: ['tower'], ruinen: ['palm', 'berg'] }[world.id] || ['tree'], rnd = (a, b) => a + Math.random() * (b - a);
    for (let j = 0; j < 12; j++) { const a = j / 12 * PI * 2 + rnd(-0.2, 0.2), rx = w / 2 + rnd(2.2, 5), rz = h / 2 + rnd(2.2, 5), d = makeDecor(kinds[j % kinds.length]); d.position.set(Math.cos(a) * rx, -0.5, Math.sin(a) * rz); d.scale.setScalar(rnd(0.8, 1.15)); d.userData.ph = Math.random() * 6; d.traverse(o => { if (o.isMesh) o.castShadow = true; }); this.root.add(d); const base = mesh(G.cyl(), toon(world.floor[0]), d.position.x, -0.62, d.position.z, 0.7, 0.3, 0.7, this.root); base.scale.set(0.8 * d.scale.x, 0.5, 0.8 * d.scale.x); }
    // Licht + Schatten
    const e = Math.max(w, h) / 2 + 3; Object.assign(this.sun.shadow.camera, { left: -e, right: e, top: e, bottom: -e, near: 1, far: 40 }); this.sun.shadow.camera.updateProjectionMatrix(); this.sun.position.set(6, 14, 7); this.sun.target.position.set(0, 0, 0);
    this.blob = makeBlob(); if (this.look) applyLook(this.blob, this.look); this.blob.g.traverse(o => { if (o.isMesh && !o.material.side) o.castShadow = true; }); this.dyn.add(this.blob.g);
    this.buildDynamic(state, false); this.camAng = this.camAngWant; this.fit();
  }
  seaTex(col) { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); x.fillStyle = col; x.fillRect(0, 0, 128, 128); x.strokeStyle = 'rgba(255,255,255,.28)'; x.lineWidth = 3; x.lineCap = 'round'; for (let i = 0; i < 7; i++) { const px = Math.random() * 128, py = Math.random() * 128; x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + 12, py - 6, px + 26, py); x.stroke(); } const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(34, 34); return t; }
  // Veränderliche Objekte (Kisten, Schlüssel, Türen, Brücken, Spieler)
  buildDynamic(s, pop) {
    const L = this.L, keep = this.blob.g; [...this.dyn.children].forEach(o => { if (o !== keep) this.dyn.remove(o); }); this.crates.clear(); this.doors.clear(); this.keys = []; this.planks.clear(); this.holes = new Map();
    const p = this.cpos(s.p); this.blob.g.position.set(p.x, 0, p.z); this.blob.g.rotation.y = this.blob.g.rotation.y || 0; this.blob.g.scale.setScalar(1); this.blob.body.scale.set(1, 1, 1);
    for (let i = 0; i < L.n; i++) {
      const q = this.cpos(i);
      if (s.crate[i]) { const cr = this.addCrate(i, s.crate[i] - 1); if (pop) this.popIn(cr.g); }
      if (L.terrain[i] === TT.WATER && s.filled[i]) { const pl = makePlank(); pl.position.set(q.x, 0, q.z); this.dyn.add(pl); this.planks.set(i, pl); const w = this.waters.get(i); if (w) w.visible = false; }
      else if (L.terrain[i] === TT.WATER) { const w = this.waters.get(i); if (w) w.visible = true; }
      if (L.crack[i]) { const dec = this.crackG.get(i); if (dec) dec.visible = !s.broken[i]; if (s.broken[i]) { const ho = makeHole(this.world.water); ho.position.set(q.x, 0, q.z); this.dyn.add(ho); this.holes.set(i, ho); } }
      if (L.terrain[i] === TT.DOOR) { const d = makeDoor(); d.position.set(q.x, 0, q.z); const open = s.open[i]; if (open) d.visible = false; this.dyn.add(d); this.doors.set(i, d); }
    }
    L.keys.forEach((ki, k) => { if (s.keyTaken[k]) return; const kk = makeKey(), q = this.cpos(ki); kk.position.set(q.x, 0, q.z); kk.userData.k = k; this.dyn.add(kk); this.keys.push({ g: kk, k, i: ki }); });
    this.refreshDone(s, false);
  }
  addCrate(i, color) { const cr = makeCrate(color), q = this.cpos(i); cr.g.position.set(q.x, 0, q.z); cr.g.traverse(o => { if (o.isMesh && !o.material.side) o.castShadow = true; }); this.dyn.add(cr.g); this.crates.set(i, cr); return cr; }
  popIn(g) { g.scale.setScalar(0.01); this.add(0.28, u => g.scale.setScalar(Math.max(0.01, ease.back(u)))); }
  setGlow(cr, v) { if (!cr.glow) { cr.glow = new T.Mesh(G.box(), new T.MeshBasicMaterial({ color: '#7cff8a', transparent: true, opacity: 0.0, blending: T.AdditiveBlending, depthWrite: false })); cr.glow.scale.set(0.95, 0.95, 0.95); cr.glow.position.y = 0.43; cr.g.add(cr.glow); } cr.glow.userData.on = v; }
  refreshDone(s, fx) { this.crates.forEach((cr, i) => { const done = isTargetDone(this.L, s, i); if (done && !cr.wasDone && fx) { const p = this.cpos(i); this.burst(p.x, 0.5, p.z, '#fff2a8', 14, 1.4, 2.2, 4); this.cb.sfx('place'); } cr.wasDone = done; this.setGlow(cr, done); }); }
  // ------------------------------------------------------------------ Animation
  add(dur, fn, done, block) { this.anims.push({ t: 0, dur, fn, done, block: !!block }); }
  get busy() { return this.anims.some(a => a.block); }
  setLook(look) { this.look = Object.assign({}, look); if (this.blob) applyLook(this.blob, this.look); }
  faceDir(dir) { const [dx, dy] = DIRS[dir]; this.blob.g.rotation.y = Math.atan2(dx, dy); }
  move(dir, res, s) {
    const L = this.L, [dx, dy] = DIRS[dir], b = this.blob, from = b.g.position.clone(), to = this.cpos(s.p); this.faceDir(dir); const push = res.push;
    this.add(0.15, u => { const e = ease.inOut(u); b.g.position.set(lerp(from.x, to.x, e), Math.sin(u * PI) * 0.2, lerp(from.z, to.z, e)); const sq = Math.sin(u * PI); b.body.scale.set(1 + 0.08 * sq, 1 - 0.14 * sq, 1 + 0.08 * sq); if (push) b.body.rotation.x = 0.22 * sq; }, () => { b.g.position.set(to.x, 0, to.z); b.body.scale.set(1, 1, 1); b.body.rotation.x = 0; }, true);
    this.cb.sfx(push ? 'push' : 'step'); if (!push) this.burst(from.x, 0.05, from.z, '#ffffff', 2, 0.5, 0.4, 2);
    let landDelay = 0;
    const evs = res.events; let cr = null, path = [], color = 0, sunk = null;
    for (const e of evs) { if (e.t === 'push') { cr = this.crates.get(e.from); if (cr) { this.crates.delete(e.from); path = [e.from, e.to]; color = e.color; } } else if (e.t === 'slide') path.push(e.to); else if (e.t === 'paint') color = e.color; else if (e.t === 'fill') sunk = e.cell; }
    if (cr) {
      const pts = path.map(i => this.cpos(i)), seg = pts.length - 1, dur = 0.15 + (seg - 1) * 0.09, g = cr.g;
      if (seg > 1) this.cb.sfx('slide');
      const first = 0.15, per = 0.09;
      this.add(dur, u => { const tt = u * dur; let a, b, f; if (tt <= first) { a = pts[0]; b = pts[1]; f = ease.inOut(tt / first); } else { const j = Math.min(seg - 1, 1 + Math.floor((tt - first) / per)); a = pts[j]; b = pts[j + 1]; f = Math.min(1, (tt - first - (j - 1) * per) / per); } g.position.set(lerp(a.x, b.x, f), 0, lerp(a.z, b.z, f)); }, () => {
        const last = pts[seg]; g.position.set(last.x, 0, last.z);
        if (sunk != null) { this.cb.sfx('fill'); this.burst(last.x, 0.2, last.z, '#9ae0ff', 22, 1.6, 3, 7); this.add(0.35, u => { g.position.y = -0.7 * ease.inOut(u); g.scale.setScalar(1 - 0.4 * u); }, () => { this.dyn.remove(g); const pl = makePlank(); pl.position.set(last.x, 0, last.z); this.dyn.add(pl); this.planks.set(sunk, pl); const w = this.waters.get(sunk); if (w) w.visible = false; this.popIn(pl); this.cb.sfx('place'); }); }
        else { const fi = path[path.length - 1]; this.crates.set(fi, cr); if (color !== cr.color) { this.recolor(cr, fi, color); this.cb.sfx('paint'); this.burst(last.x, 0.6, last.z, COLORS[color], 14, 1.4, 2.4, 5); } this.add(0.14, u => { const sq = Math.sin(u * PI); g.scale.set(1 + 0.05 * sq, 1 - 0.07 * sq, 1 + 0.05 * sq); }, () => g.scale.setScalar(1)); this.refreshDone(s, true); }
      }, true);
    }
    for (const e of evs) {
      if (e.t === 'key') { const k = this.keys.find(q => q.i === e.cell); if (k) { this.keys = this.keys.filter(q => q !== k); this.cb.sfx('key'); const p = this.cpos(e.cell); this.burst(p.x, 0.6, p.z, '#ffd24a', 16, 1.5, 2.5, 4); this.add(0.3, u => { k.g.position.y = u * 1.2; k.g.scale.setScalar(1 - u); }, () => this.dyn.remove(k.g)); } }
      if (e.t === 'crack') { const p = this.cpos(e.cell), dec = this.crackG.get(e.cell); this.cb.sfx('crack'); this.burst(p.x, 0.15, p.z, '#cba768', 16, 1.2, 2.2, 5); this.add(0.3, u => { if (dec) dec.scale.setScalar(1 + u * 0.1); }, () => { if (dec) dec.visible = false; const ho = makeHole(this.world.water); ho.position.set(p.x, 0, p.z); this.dyn.add(ho); this.holes.set(e.cell, ho); this.popIn(ho); }); }
      if (e.t === 'door') { const d = this.doors.get(e.cell); if (d) { this.cb.sfx('door'); const p = this.cpos(e.cell); this.burst(p.x, 0.6, p.z, '#c98a48', 14, 1.4, 2.2, 5); this.add(0.4, u => { d.userData.planks.position.y = u * 1.1; d.userData.planks.scale.y = 1 - u * 0.7; }, () => { d.visible = false; }); } }
    }
    if (!cr) this.refreshDone(s, false);
  }
  recolor(cr, i, color) { const q = this.cpos(i); this.dyn.remove(cr.g); const nc = makeCrate(color); nc.g.position.set(q.x, 0, q.z); nc.g.traverse(o => { if (o.isMesh && !o.material.side) o.castShadow = true; }); this.dyn.add(nc.g); cr.g = nc.g; cr.color = color; cr.glow = null; this.popIn(nc.g); }
  blocked(dir) { const b = this.blob; this.faceDir(dir); const [dx, dy] = DIRS[dir], p0 = b.g.position.clone(); this.cb.sfx('blocked'); this.add(0.2, u => { const k = Math.sin(u * PI) * 0.12; b.g.position.set(p0.x + dx * k, 0, p0.z + dy * k); b.body.scale.set(1 + 0.1 * Math.sin(u * PI * 2), 1 - 0.1 * Math.sin(u * PI * 2), 1); }, () => { b.g.position.set(p0.x, 0, p0.z); b.body.scale.set(1, 1, 1); }, true); }
  teleportTo(cell) { const p = this.cpos(cell); this.blob.g.position.set(p.x, 0, p.z); }
  // ------------------------------------------------------------------ Kamera
  setPad(t, b, l, r) { this.pad = { t, b, l, r }; this.fit(); }
  rotate(delta) { this.q = (this.q + delta + 4) % 4; this.camAngWant += delta * PI / 2; }
  placeCam(az, dist, target) { const ce = Math.cos(this.el); this.cam.position.set(target.x + Math.sin(az) * ce * dist, target.y + Math.sin(this.el) * dist, target.z + Math.cos(az) * ce * dist); this.cam.lookAt(target); this.cam.updateMatrixWorld(); this.cam.updateProjectionMatrix(); }
  fit() {
    if (!this.L) return; const L = this.L, W = this.W, H = this.H, az = this.camAng + this.az, pts = []; const hw = L.w / 2 + 0.1, hh = L.h / 2 + 0.1;
    [-hw, hw].forEach(x => [-hh, hh].forEach(z => [-0.6, 1.3].forEach(y => pts.push(new T.Vector3(x, y, z)))));
    let dist = Math.max(L.w, L.h) * 2.2 + 6; const tg = new T.Vector3(0, 0.1, 0), v = new T.Vector3(), aw = Math.max(50, W - this.pad.l - this.pad.r), ah = Math.max(50, H - this.pad.t - this.pad.b), cx = this.pad.l + aw / 2, cy = this.pad.t + ah / 2;
    for (let it = 0; it < 18; it++) {
      this.placeCam(az, dist, tg); let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; pts.forEach(p => { v.copy(p).project(this.cam); const sx = (v.x + 1) / 2 * W, sy = (1 - v.y) / 2 * H; x0 = Math.min(x0, sx); x1 = Math.max(x1, sx); y0 = Math.min(y0, sy); y1 = Math.max(y1, sy); });
      const sc = Math.min(aw / (x1 - x0), ah / (y1 - y0)); dist = dist / Math.pow(sc, 0.9); const dx = ((x0 + x1) / 2 - cx), dy = ((y0 + y1) / 2 - cy), wpp = 2 * dist * Math.tan(this.cam.fov * PI / 360) / H;
      const right = new T.Vector3().setFromMatrixColumn(this.cam.matrixWorld, 0), up = new T.Vector3().setFromMatrixColumn(this.cam.matrixWorld, 1); tg.addScaledVector(right, dx * wpp).addScaledVector(up, -dy * wpp);
    }
    this.dist = dist; this.target.copy(tg); this.placeCam(az, dist, tg);
  }
  resize(w, h) { this.W = w; this.H = h; this.r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); this.r.setSize(w, h, false); this.cam.aspect = w / h; this.cam.updateProjectionMatrix(); this.fit(); }
  // Bildschirm-Richtung jeder Spielrichtung (für Tastatur/Wischen)
  screenDirs() { const out = [], a = new T.Vector3(), b = new T.Vector3(); for (let d = 0; d < 4; d++) { a.set(0, 0, 0).project(this.cam); b.set(DIRS[d][0], 0, DIRS[d][1]).project(this.cam); out.push([(b.x - a.x) * this.W, -(b.y - a.y) * this.H]); } return out; }
  pickCell(cx, cy) { if (!this.L) return null; const rect = this.canvas.getBoundingClientRect(), nx = (cx - rect.left) / rect.width * 2 - 1, ny = -((cy - rect.top) / rect.height) * 2 + 1, ray = new T.Raycaster(); ray.setFromCamera({ x: nx, y: ny }, this.cam); const pl = new T.Plane(new T.Vector3(0, 1, 0), -0.0), pt = new T.Vector3(); if (!ray.ray.intersectPlane(pl, pt)) return null; const x = Math.floor(pt.x + this.L.w / 2), y = Math.floor(pt.z + this.L.h / 2); if (x < 0 || y < 0 || x >= this.L.w || y >= this.L.h) return null; return y * this.L.w + x; }
  // ------------------------------------------------------------------ Frame
  tick(dt) {
    if (this.blob && this.blob.hat && this.blob.hat.userData.spin) this.blob.hat.userData.spin.rotation.y += dt * 14;
    this.time += dt; const t = this.time;
    for (let i = this.anims.length - 1; i >= 0; i--) { const a = this.anims[i]; a.t += dt; const u = Math.min(1, a.t / a.dur); a.fn(u); if (u >= 1) { this.anims.splice(i, 1); if (a.done) a.done(); } }
    if (this.blob && !this.busy) { const b = this.blob, idle = Math.sin(t * 2.6); b.body.scale.set(1 - 0.018 * idle, 1 + 0.035 * idle, 1 - 0.018 * idle); const bl = (t % 3.6) > 3.45 ? 0.15 : 1; b.eyes.forEach(e => { e.scale.y = 0.15 * bl; }); b.leaves[0].rotation.z = 0.5 + Math.sin(t * 3) * 0.12; b.leaves[1].rotation.z = -0.4 - Math.sin(t * 3 + 1) * 0.12; }
    this.targetsG.forEach(({ g }, k) => { const s = 1 + Math.sin(t * 3 + k) * 0.05; g.userData.ring.scale.set(0.42 * s, 0.42 * s, 1); g.userData.pad.material.opacity = 0.45 + Math.sin(t * 3 + k) * 0.1; });
    this.keys.forEach(k => { k.g.rotation.y = t * 2; k.g.position.y = 0.1 + Math.sin(t * 3) * 0.06; });
    this.crates.forEach(cr => { if (cr.glow) cr.glow.material.opacity += ((cr.glow.userData.on ? 0.22 + Math.sin(t * 5) * 0.06 : 0) - cr.glow.material.opacity) * Math.min(1, dt * 10); });
    this.waters.forEach(w => { if (w.visible) w.position.y = -0.2 + Math.sin(t * 1.6 + w.userData.ph) * 0.02; });
    if (this.sea) { const m = this.sea.material.map; m.offset.x = t * 0.01; m.offset.y = t * 0.006; }
    this.root.children.forEach(o => { if (o.userData && o.userData.ph !== undefined && !o.userData.fixed && o.position.y < 0) o.position.y = -0.5 + Math.sin(t * 1.2 + o.userData.ph) * 0.06; });
    if (this.orbit) { this.camAngWant += dt * 0.12; this.camAng = this.camAngWant; this.fit(); } else { const d = this.camAngWant - this.camAng; if (Math.abs(d) > 0.0004) { this.camAng += d * Math.min(1, dt * 8); this.fit(); } }
    this.stepFx(dt); this.r.render(this.scene, this.cam);
  }
}
