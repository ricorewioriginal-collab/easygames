/* Funkparcours – 3D-Arena (Three.js r128): Parcours aus der Engine-Beschreibung, Läufer, Wasser, Publikum, Kamera. */
import { movePos, swingBall, PW, PH } from './engine.js';
const T = window.THREE;
const COL = { a: 0x00b8d9, b: 0xff2d95, y: 0xffd24a, o: 0xff9a1f, p: 0x8b5cf6, g: 0x00c46a };
const geo = {}, G = (k, f) => geo[k] || (geo[k] = f());
const mat = (c, o) => new T.MeshLambertMaterial(Object.assign({ color: c }, o || {}));
export class Arena {
  constructor(cv, logos) {
    this.cv = cv; this.logos = logos; this.r = new T.WebGLRenderer({ canvas: cv, antialias: !matchMedia('(pointer:coarse)').matches, alpha: false, powerPreference: 'high-performance' }); this.r.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); this.r.setClearColor(0x0a0c24);
    this.s = new T.Scene(); this.s.fog = new T.Fog(0x0a0c24, 30, 95); this.cam = new T.PerspectiveCamera(42, 1, 0.1, 200); this.cx = 3; this.cy = 2.4;
    this.s.add(new T.HemisphereLight(0xbfd8ff, 0x201040, 0.95)); const sun = new T.DirectionalLight(0xffffff, 0.8); sun.position.set(8, 14, 12); this.s.add(sun); this.sun = sun;
    this.root = new T.Group(); this.s.add(this.root); this.dyn = []; this.time = 0; this.parts = []; this.runner = this.makeRunner(0xff6fb0, 6); this.s.add(this.runner.g); this.ghost = null; this.ghostFrames = null;
    // Wasser
    const wc = document.createElement('canvas'); wc.width = wc.height = 128; const g = wc.getContext('2d'); g.fillStyle = '#1fa8f0'; g.fillRect(0, 0, 128, 128); g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 3; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(0, i * 15 + 6); for (let x = 0; x <= 128; x += 8) g.lineTo(x, i * 15 + 6 + Math.sin(x / 12 + i) * 4); g.stroke(); }
    this.wtex = new T.CanvasTexture(wc); this.wtex.wrapS = this.wtex.wrapT = T.RepeatWrapping; this.wtex.repeat.set(60, 6); this.water = new T.Mesh(new T.PlaneGeometry(400, 40), new T.MeshLambertMaterial({ map: this.wtex, transparent: true, opacity: 0.92 })); this.water.rotation.x = -Math.PI / 2; this.water.position.set(100, -0.05, 0); this.s.add(this.water);
    const floor = new T.Mesh(new T.PlaneGeometry(400, 60), mat(0x0c1030)); floor.rotation.x = -Math.PI / 2; floor.position.set(100, -1.6, 0); this.s.add(floor);
    this.buildSet(); this.resize();
  }
  resize() { const w = this.cv.clientWidth || innerWidth, h = this.cv.clientHeight || innerHeight; this.r.setSize(w, h, false); this.cam.aspect = w / h; this.cam.fov = w / h < 1 ? 62 : 42; this.cam.updateProjectionMatrix(); }
  // ---------------------------------------------------------------- Kulisse: Tribüne mit Publikum, Banner, Scheinwerfer
  buildSet() {
    const L = 260; this.crowd = []; const tier = new T.Mesh(new T.BoxGeometry(L, 1.2, 3), mat(0x1a1450)); tier.position.set(L / 2 - 20, 0.2, -9); this.s.add(tier); const tier2 = new T.Mesh(new T.BoxGeometry(L, 1.2, 3), mat(0x241a6a)); tier2.position.set(L / 2 - 20, 1.4, -11.5); this.s.add(tier2);
    const bodyG = new T.BoxGeometry(0.6, 0.9, 0.5), headG = new T.SphereGeometry(0.28, 8, 6), n = 220; this.bodies = new T.InstancedMesh(bodyG, new T.MeshLambertMaterial({ color: 0xffffff }), n); this.heads = new T.InstancedMesh(headG, new T.MeshLambertMaterial({ color: 0xffd9b0 }), n); const c = new T.Color(); this.cdata = [];
    for (let i = 0; i < n; i++) { const row = i % 2, x = -18 + (i >> 1) * 2.35 + Math.random() * 0.8, y = row ? 2.4 : 1.2, z = row ? -11.5 : -9; this.cdata.push({ x, y, z, ph: Math.random() * 6 }); c.setHSL(Math.random(), 0.6, 0.45); this.bodies.setColorAt(i, c); }
    this.s.add(this.bodies, this.heads); this.energy = 0.3;
    this.banners = []; const loader = new T.TextureLoader(); const bm = new T.PlaneGeometry(4.4, 4.4);
    for (let i = 0; i < 22; i++) { const m = new T.Mesh(bm, new T.MeshBasicMaterial({ color: 0xffffff })); m.position.set(-8 + i * 12, 6.4, -14.5); this.s.add(m); this.banners.push(m); loader.load(this.logos[i % this.logos.length], t => { m.material.map = t; m.material.needsUpdate = true; }); }
    const wall = new T.Mesh(new T.PlaneGeometry(320, 16), new T.MeshBasicMaterial({ color: 0x120a38 })); wall.position.set(120, 6, -15); this.s.add(wall);
    for (let i = 0; i < 14; i++) { const cone = new T.Mesh(G('cone', () => new T.ConeGeometry(1.6, 12, 12, 1, true)), new T.MeshBasicMaterial({ color: [0x00e5ff, 0xff2d95, 0xffd24a, 0x8b5cf6][i % 4], transparent: true, opacity: 0.1, side: T.DoubleSide, depthWrite: false, blending: T.AdditiveBlending })); cone.position.set(i * 14, 8.5, -8); cone.rotation.z = (i % 2 ? 1 : -1) * 0.25; this.s.add(cone); }
  }
  // ---------------------------------------------------------------- Läufer
  makeRunner(color, logo) {
    const g = new T.Group(), body = new T.Group(); g.add(body); const skin = mat(0xffd9b0), shirt = mat(color), pants = mat(0x1b2748);
    const torso = new T.Mesh(G('torso', () => new T.BoxGeometry(0.62, 0.78, 0.36)), shirt); torso.position.y = 1.08; body.add(torso); const head = new T.Mesh(G('head', () => new T.SphereGeometry(0.27, 14, 10)), skin); head.position.y = 1.7; body.add(head);
    const band = new T.Mesh(G('band', () => new T.BoxGeometry(0.58, 0.1, 0.5)), mat(0xffd24a)); band.position.y = 1.86; body.add(band);
    const limb = (m, x, y, len) => { const p = new T.Group(); p.position.set(x, y, 0); const l = new T.Mesh(G('limb' + len, () => new T.BoxGeometry(0.2, len, 0.2)), m); l.position.y = -len / 2; p.add(l); body.add(p); return p; };
    const legL = limb(pants, -0.16, 0.7, 0.7), legR = limb(pants, 0.16, 0.7, 0.7), armL = limb(skin, -0.42, 1.4, 0.62), armR = limb(skin, 0.42, 1.4, 0.62);
    const decal = new T.Mesh(G('decal', () => new T.PlaneGeometry(0.4, 0.4)), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true })); decal.position.set(0, 1.1, 0.19); body.add(decal);
    const r = { g, body, legL, legR, armL, armR, shirt, decal, face: 1, prevX: 0, phase: 0 }; this.setLogo(r, logo); return r;
  }
  setLogo(r, i) { const ld = new T.TextureLoader(); ld.load(this.logos[i % this.logos.length], t => { r.decal.material.map = t; r.decal.material.needsUpdate = true; }); }
  setLook(color, logo) { this.runner.shirt.color.setHex(color); this.setLogo(this.runner, logo); }
  // ---------------------------------------------------------------- Parcours
  setCourse(c) {
    this.course = c; while (this.root.children.length) this.root.remove(this.root.children[0]); this.dyn = []; this.sinkM = {};
    c.o.forEach((o, i) => {
      if (o.k === 'plat' || o.k === 'move' || o.k === 'sink') { const w = o.w, col = o.k === 'move' ? COL.y : o.k === 'sink' ? COL.o : (i % 2 ? COL.a : COL.p); const m = new T.Mesh(new T.BoxGeometry(w, 0.5, 4), mat(col)); const top = new T.Mesh(new T.BoxGeometry(w + 0.04, 0.08, 4.04), mat(0xffffff, { emissive: 0x222244 })); top.position.y = 0.25; m.add(top); if (o.k === 'sink') { const cr = new T.Mesh(new T.BoxGeometry(w * 0.9, 0.02, 0.06), mat(0x5a2a00)); cr.position.set(0, 0.3, 0.8); m.add(cr); } const pole = o.k === 'plat' ? new T.Mesh(new T.BoxGeometry(Math.min(0.5, w * 0.3), 3, 0.5), mat(0x241a6a)) : null; if (pole) { pole.position.y = -1.75; m.add(pole); }
        m.position.set(o.x + w / 2, o.y - 0.25, 0); this.root.add(m); this.dyn.push({ o, m, i }); }
      else if (o.k === 'swing') { const grp = new T.Group(); const beam = new T.Mesh(new T.BoxGeometry(0.5, 0.3, 4), mat(0x555a8a)); beam.position.set(o.px, o.py, 0); this.root.add(beam); const rope = new T.Mesh(new T.CylinderGeometry(0.04, 0.04, o.len, 6), mat(0xdddddd)); rope.geometry.translate(0, -o.len / 2, 0); grp.add(rope); const ball = new T.Mesh(new T.SphereGeometry(o.r, 16, 12), mat(0xff3b3b, { emissive: 0x440000 })); ball.position.y = -o.len; grp.add(ball); grp.position.set(o.px, o.py, 0); this.root.add(grp); this.dyn.push({ o, m: grp, i }); }
      else if (o.k === 'bars') { const len = o.x2 - o.x1; const bar = new T.Mesh(new T.CylinderGeometry(0.07, 0.07, len, 8), mat(0xffd24a, { emissive: 0x332200 })); bar.rotation.z = Math.PI / 2; bar.position.set((o.x1 + o.x2) / 2, o.y, 0); this.root.add(bar); for (let k = 0; k <= len; k += 1.5) { const rg = new T.Mesh(new T.TorusGeometry(0.2, 0.04, 6, 12), mat(0xff2d95)); rg.position.set(o.x1 + k, o.y, 0); this.root.add(rg); } [o.x1, o.x2].forEach(x => { const p = new T.Mesh(new T.BoxGeometry(0.3, 6, 0.3), mat(0x555a8a)); p.position.set(x, o.y + 0.5, 0); this.root.add(p); }); const top = new T.Mesh(new T.BoxGeometry(len + 0.6, 0.25, 0.4), mat(0x555a8a)); top.position.set((o.x1 + o.x2) / 2, o.y + 3.5, 0); this.root.add(top); }
      else if (o.k === 'wall') { for (let k = 0; k < 14; k++) { const u = k / 13, y = o.h * (1 - Math.sqrt(Math.max(0, 1 - Math.pow(1 - u, 2)))) ; const sl = new T.Mesh(new T.BoxGeometry(0.6, o.h / 14 + 0.05, 4), mat(k % 2 ? 0xff9a1f : 0xff2d95)); sl.position.set(o.x - 2.3 * (1 - u) * 0 - (1 - u) * 0.0 + 0.3 - Math.pow(1 - u, 2) * 2.2, o.y + (k + 0.5) * o.h / 14, 0); this.root.add(sl); } const back = new T.Mesh(new T.BoxGeometry(o.w, o.h, 4), mat(0x241a6a)); back.position.set(o.x + o.w / 2, o.y + o.h / 2, 0); this.root.add(back); }
      else if (o.k === 'finish') { const b = new T.Mesh(new T.CylinderGeometry(0.5, 0.6, 0.35, 16), mat(0xff2d2d, { emissive: 0x660000 })); b.position.set(o.x, o.y + 0.2, 0); this.root.add(b); this.buzzer = b; const pole = new T.Mesh(new T.CylinderGeometry(0.06, 0.06, 3, 8), mat(0xffffff)); pole.position.set(o.x + 1, o.y + 1.5, 0); this.root.add(pole); const flag = new T.Mesh(new T.BoxGeometry(1.4, 0.8, 0.05), mat(0xffd24a)); flag.position.set(o.x + 1.7, o.y + 2.6, 0); this.root.add(flag); }
    });
    this.water.position.x = c.length / 2;
    // Startlinie
    const st = new T.Mesh(new T.BoxGeometry(0.2, 0.05, 4), mat(0xffffff)); st.position.set(2, c.o[0].y + 0.03, 0); this.root.add(st);
  }
  // ---------------------------------------------------------------- Bild aktualisieren
  setGhost(frames) { this.ghostFrames = frames; if (frames && !this.ghost) { this.ghost = this.makeRunner(0xffffff, 0); this.ghost.g.traverse(o => { if (o.material) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.35; } }); this.s.add(this.ghost.g); } if (this.ghost) this.ghost.g.visible = !!frames; }
  pose(r, x, y, sim, dt) {
    const g = r.g; g.position.set(x, y, 0); const dx = x - r.prevX; r.prevX = x; const mov = Math.abs(dx) > 0.001; r.phase += Math.abs(dx) * 5.2; const face = sim ? sim.face : r.face; r.face = face; r.body.rotation.y = face > 0 ? 1.2 : -1.2; r.body.rotation.z = 0; r.body.rotation.x = 0;
    let lA = 0, aA = 0, st = 'run'; if (sim) { if (sim.dead) st = 'fall'; else if (sim.finished) st = 'win'; else if (sim.hang) st = 'hang'; else if (sim.wall) st = 'wall'; else if (!sim.onGround) st = 'air'; else if (!mov) st = 'idle'; }
    const sw = Math.sin(r.phase); lA = st === 'run' ? sw * 0.9 : 0; aA = st === 'run' ? -sw * 0.8 : 0;
    r.legL.rotation.z = r.legR.rotation.z = 0; r.armL.rotation.z = r.armR.rotation.z = 0;
    const rot = a => (face > 0 ? a : -a);
    if (st === 'run') { r.legL.rotation.x = lA; r.legR.rotation.x = -lA; r.armL.rotation.x = aA; r.armR.rotation.x = -aA; }
    else if (st === 'air') { r.legL.rotation.x = 0.7; r.legR.rotation.x = -0.5; r.armL.rotation.x = -2.5; r.armR.rotation.x = -2.2; }
    else if (st === 'hang') { r.legL.rotation.x = r.legR.rotation.x = 0.1; r.armL.rotation.x = r.armR.rotation.x = Math.PI; r.armL.rotation.z = -0.2; r.armR.rotation.z = 0.2; r.legL.rotation.x += Math.sin(this.time * 6) * 0.2; }
    else if (st === 'win') { r.legL.rotation.x = r.legR.rotation.x = 0; r.armL.rotation.x = r.armR.rotation.x = Math.PI * 0.95; r.armL.rotation.z = -0.4; r.armR.rotation.z = 0.4; g.position.y += Math.abs(Math.sin(this.time * 8)) * 0.25; }
    else if (st === 'wall') { r.legL.rotation.x = Math.sin(this.time * 24) * 0.9; r.legR.rotation.x = -Math.sin(this.time * 24) * 0.9; r.armL.rotation.x = r.armR.rotation.x = -2.6; r.body.rotation.z = -face * 0.5; }
    else if (st === 'fall') { r.body.rotation.z += 1.2 * this.time; r.armL.rotation.x = r.armR.rotation.x = 2.6; }
    else { r.legL.rotation.x = r.legR.rotation.x = 0; r.armL.rotation.x = r.armR.rotation.x = Math.sin(this.time * 2) * 0.06; }
    if (sim && sim.stun > 0) { r.body.rotation.z = Math.sin(this.time * 40) * 0.25; }
    return st;
  }
  splash(x) { for (let i = 0; i < 22; i++) { const m = new T.Mesh(G('sp', () => new T.SphereGeometry(0.1, 6, 5)), new T.MeshBasicMaterial({ color: 0xcdeaff })); m.position.set(x + (Math.random() - 0.5) * 0.6, 0, (Math.random() - 0.5) * 1.5); this.s.add(m); this.parts.push({ m, vx: (Math.random() - 0.5) * 3, vy: 4 + Math.random() * 4, vz: (Math.random() - 0.5) * 2, life: 1 }); } }
  confetti(x, y) { for (let i = 0; i < 40; i++) { const m = new T.Mesh(G('cf', () => new T.BoxGeometry(0.14, 0.08, 0.02)), new T.MeshBasicMaterial({ color: [0x00e5ff, 0xff2d95, 0xffd24a, 0x00ff88][i % 4] })); m.position.set(x + (Math.random() - 0.5) * 2, y + 2, (Math.random() - 0.5) * 2); this.s.add(m); this.parts.push({ m, vx: (Math.random() - 0.5) * 4, vy: 3 + Math.random() * 5, vz: (Math.random() - 0.5) * 3, life: 1.6, spin: 1 }); } this.energy = 1; }
  cheer(v) { this.energy = Math.max(this.energy, v); }
  /** sim: laufende Simulation (oder null), ghostPos: [x,y] oder null */
  frame(sim, dt, ghostPos, idleX) {
    this.time += dt; const t = sim ? sim.t : this.time;
    for (const d of this.dyn) { const o = d.o; if (o.k === 'move') { const p = movePos(o, t); d.m.position.set(p.x + o.w / 2, p.y - 0.25, 0); } else if (o.k === 'sink') { const k = sim && sim.sinks[d.i]; d.m.position.y = o.y - 0.25 + (k ? k.y : 0); d.m.visible = !(k && k.gone); if (k && k.touch >= 0 && !k.gone && sim.t - k.touch < o.delay) d.m.position.x = o.x + o.w / 2 + Math.sin(this.time * 70) * 0.03; } else if (o.k === 'swing') { const b = swingBall(o, t); d.m.rotation.z = b.a; } }
    if (sim) { this.pose(this.runner, sim.x, sim.y, sim, dt); } else { this.pose(this.runner, idleX != null ? idleX : 2, this.course ? this.course.o[0].y : 1, null, dt); }
    if (this.ghost && this.ghost.g.visible && ghostPos) this.pose(this.ghost, ghostPos[0], ghostPos[1], null, dt);
    // Kamera
    const tx = (sim ? sim.x : idleX != null ? idleX : 2) + 3.2, ty = (sim ? Math.max(sim.y, 1) : 1.4) + 1.1; this.cx += (tx - this.cx) * Math.min(1, dt * 4.5); this.cy += (ty - this.cy) * Math.min(1, dt * 3.5);
    const asp = this.cam.aspect, dist = asp < 1 ? 17 : 13; this.cam.position.set(this.cx - 1.5, this.cy + 1.2, dist); this.cam.lookAt(this.cx, this.cy - 0.2, 0);
    this.wtex.offset.x += dt * 0.04; this.wtex.offset.y += dt * 0.02; if (this.buzzer) this.buzzer.scale.y = 1 + Math.sin(this.time * 6) * 0.1;
    // Publikum
    const m = new T.Matrix4(), e = this.energy; this.energy = Math.max(0.25, this.energy - dt * 0.15); const camX = this.cx;
    for (let i = 0; i < this.cdata.length; i++) { const c = this.cdata[i]; if (Math.abs(c.x - camX) > 40) { m.makeTranslation(0, -50, 0); this.bodies.setMatrixAt(i, m); this.heads.setMatrixAt(i, m); continue; } const b = Math.abs(Math.sin(this.time * (2 + e * 4) + c.ph)) * (0.08 + e * 0.35); m.makeTranslation(c.x, c.y + 0.45 + b, c.z); this.bodies.setMatrixAt(i, m); m.makeTranslation(c.x, c.y + 1.15 + b, c.z); this.heads.setMatrixAt(i, m); }
    this.bodies.instanceMatrix.needsUpdate = this.heads.instanceMatrix.needsUpdate = true;
    // Partikel
    for (let i = this.parts.length - 1; i >= 0; i--) { const p = this.parts[i]; p.life -= dt; p.vy -= 14 * dt; p.m.position.x += p.vx * dt; p.m.position.y += p.vy * dt; p.m.position.z += p.vz * dt; if (p.spin) { p.m.rotation.x += 8 * dt; p.m.rotation.y += 6 * dt; } if (p.life <= 0 || (p.m.position.y < -0.2 && !p.spin)) { this.s.remove(p.m); this.parts.splice(i, 1); } }
    this.r.render(this.s, this.cam);
  }
}
