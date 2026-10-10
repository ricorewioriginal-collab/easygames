/* Funkparcours – 3D-Arena (Three.js r128): Studio mit LED-Wand, Tribüne und Publikum, glänzende Hindernisse, Wasser-Shader, Schatten,
   Läufer mit Animationen, Staub/Spritzer/Konfetti, Kamera mit Wackeln. Passt die Qualität selbst an, wenn das Gerät zu langsam ist. */
import { movePos, swingBall } from './engine.js';
const T = window.THREE;
const COL = { a: 0x00c8ea, b: 0xff2d95, y: 0xffd24a, o: 0xff9a1f, p: 0x8b5cf6, g: 0x00e07a };
const cache = {}, C = (k, f) => cache[k] || (cache[k] = f());
const std = (c, o) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.5, metalness: 0.15 }, o || {}));
const glow = (c, o) => new T.MeshBasicMaterial(Object.assign({ color: c }, o || {}));
const cvs = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); const t = new T.CanvasTexture(c); return t; };
const label = (txt, fg, bg, w = 256, h = 64) => cvs(w, h, (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.fillStyle = fg; g.font = `900 ${H * 0.62}px Inter,Arial,sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, W / 2, H / 2 + 2); });
const puff = () => C('puff', () => cvs(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); }));
const DUMMY = new T.Object3D(), COLTMP = new T.Color();

export class Arena {
  constructor(cv, logos) {
    this.cv = cv; this.logos = logos; const coarse = matchMedia('(pointer:coarse)').matches;
    this.r = new T.WebGLRenderer({ canvas: cv, antialias: !coarse, alpha: false, powerPreference: 'high-performance' }); this.pr = Math.min(devicePixelRatio || 1, 2); this.r.setPixelRatio(this.pr); this.r.setClearColor(0x0a0c24);
    this.r.shadowMap.enabled = true; this.r.shadowMap.type = coarse ? T.BasicShadowMap : T.PCFSoftShadowMap;
    this.s = new T.Scene(); this.s.fog = new T.Fog(0x120a38, 38, 115); this.s.background = cvs(8, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#05061a'); gr.addColorStop(0.55, '#1a1250'); gr.addColorStop(1, '#3a1466'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
    this.cam = new T.PerspectiveCamera(42, 1, 0.1, 220); this.cx = 3; this.cy = 2.4; this.shake = 0; this.baseFov = 42;
    this.s.add(new T.HemisphereLight(0xcfe0ff, 0x2a1a5a, 0.85));
    const sun = new T.DirectionalLight(0xfff2dd, 0.95); sun.position.set(9, 15, 12); sun.target.position.set(3, 0, 0); this.s.add(sun, sun.target); this.sun = sun;
    sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); const sc = sun.shadow.camera; sc.left = -15; sc.right = 15; sc.top = 12; sc.bottom = -8; sc.near = 4; sc.far = 50; sun.shadow.bias = -0.0008; sun.shadow.normalBias = 0.02;
    const rim = new T.PointLight(0xff2d95, 0.6, 30); rim.position.set(0, 6, 8); this.s.add(rim); this.rim = rim;
    this.root = new T.Group(); this.s.add(this.root); this.dyn = []; this.time = 0; this.energy = 0.3; this.ghost = null; this.ghostFrames = null; this.prevG = true; this.lastVy = 0; this.dustT = 0;
    this.pool = []; this.live = []; this.initPool(); this.buildWater(); this.buildSet();
    this.runner = this.makeRunner(0xff6fb0, 6); this.s.add(this.runner.g); this.fpsT = 0; this.fpsN = 0; this.slow = 0; this.resize();
  }
  resize() { const w = this.cv.clientWidth || innerWidth, h = this.cv.clientHeight || innerHeight; this.r.setPixelRatio(this.pr); this.r.setSize(w, h, false); this.cam.aspect = w / h; this.baseFov = w / h < 1 ? 62 : 42; this.cam.fov = this.baseFov; this.cam.updateProjectionMatrix(); }
  // ---------------------------------------------------------------- Partikel (Pool aus Sprites)
  initPool() { for (let i = 0; i < 180; i++) { const sp = new T.Sprite(new T.SpriteMaterial({ map: puff(), transparent: true, depthWrite: false })); sp.visible = false; this.s.add(sp); this.pool.push(sp); } }
  emit(x, y, z, vx, vy, vz, o) {
    const sp = this.pool.pop(); if (!sp) return; sp.visible = true; sp.position.set(x, y, z); sp.material.color.setHex(o.c || 0xffffff); sp.material.opacity = o.a == null ? 0.8 : o.a; sp.material.blending = o.add ? T.AdditiveBlending : T.NormalBlending; sp.material.rotation = Math.random() * 6; sp.scale.setScalar(o.s || 0.3);
    this.live.push({ sp, vx, vy, vz, life: o.life || 0.6, max: o.life || 0.6, g: o.g == null ? 0 : o.g, grow: o.grow || 0, a: o.a == null ? 0.8 : o.a, spin: o.spin || 0 });
  }
  dust(x, y, n, spread) { for (let i = 0; i < n; i++) this.emit(x + (Math.random() - 0.5) * 0.3, y + 0.08, (Math.random() - 0.3) * 1.2, (Math.random() - 0.5) * spread, 0.4 + Math.random() * 0.8, 0, { c: 0xd9d4ff, s: 0.22 + Math.random() * 0.2, life: 0.45 + Math.random() * 0.25, grow: 0.9, a: 0.5 }); }
  splash(x) {
    this.shake = Math.max(this.shake, 0.35);
    for (let i = 0; i < 46; i++) { const a = Math.random() * Math.PI, sp = 2 + Math.random() * 5; this.emit(x + (Math.random() - 0.5) * 0.5, 0.05, (Math.random() - 0.5) * 1.4, Math.cos(a) * sp * 0.5 * (Math.random() < 0.5 ? -1 : 1), 4 + Math.random() * 6, (Math.random() - 0.5) * 3, { c: 0xe6f6ff, s: 0.16 + Math.random() * 0.14, life: 1.1, g: 16, a: 0.95 }); }
    for (let i = 0; i < 8; i++) this.emit(x + (Math.random() - 0.5) * 1.2, 0.1, (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5, 1 + Math.random(), 0, { c: 0xbfe9ff, s: 0.6, life: 0.9, grow: 1.6, a: 0.55 });
  }
  confetti(x, y) { for (let i = 0; i < 70; i++) this.emit(x + (Math.random() - 0.5) * 2, y + 2 + Math.random(), (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 6, 3 + Math.random() * 6, (Math.random() - 0.5) * 3, { c: [0x00e5ff, 0xff2d95, 0xffd24a, 0x00ff88, 0xffffff][i % 5], s: 0.2, life: 1.8 + Math.random() * 0.6, g: 9, a: 1, spin: 1 }); this.energy = 1; this.shake = Math.max(this.shake, 0.12); }
  cheer(v) { this.energy = Math.max(this.energy, v); }
  // ---------------------------------------------------------------- Wasser (Shader: Wellenlinien, Glitzer, Tiefenverlauf, Nebel)
  buildWater() {
    this.wu = { t: { value: 0 }, cx: { value: 0 } };
    const m = new T.ShaderMaterial({ transparent: true, uniforms: this.wu,
      vertexShader: 'varying vec3 vP; void main(){ vec4 w = modelMatrix*vec4(position,1.0); vP = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }',
      fragmentShader: `varying vec3 vP; uniform float t; uniform float cx;
        void main(){
          float depth = clamp((-vP.z + 6.0) / 24.0, 0.0, 1.0);
          vec3 col = mix(vec3(0.04,0.5,0.85), vec3(0.02,0.1,0.4), depth);
          float w1 = sin(vP.x*1.3 + t*1.2 + sin(vP.z*0.9 + t*0.7)*1.6), w2 = sin(vP.x*0.7 - t*0.8 + vP.z*1.7), w3 = sin(vP.x*3.1 + vP.z*2.3 + t*2.1);
          float lines = smoothstep(0.93, 1.0, w1*0.5 + w2*0.5 + 0.0) * 0.55;
          float spark = pow(max(0.0, w3*w1), 14.0) * 1.4;
          col += vec3(0.55,0.85,1.0)*lines*0.4 + vec3(1.0)*spark*0.7*(1.0-depth*0.5);
          float fog = smoothstep(40.0, 110.0, distance(vP.xz, vec2(cx, 14.0)));
          col = mix(col, vec3(0.07,0.04,0.22), fog);
          gl_FragColor = vec4(col, 0.96);
        }` });
    this.water = new T.Mesh(new T.PlaneGeometry(240, 46), m); this.water.rotation.x = -Math.PI / 2; this.water.position.set(100, -0.05, 4); this.s.add(this.water);
    const floor = new T.Mesh(new T.PlaneGeometry(480, 70), std(0x090b26, { roughness: 0.9 })); floor.rotation.x = -Math.PI / 2; floor.position.set(100, -2.2, 0); this.s.add(floor);
  }
  // ---------------------------------------------------------------- Kulisse
  buildSet() {
    const L = 300, X0 = -22;
    // Tribüne: drei Stufen
    [[0.2, -9, 0x1a1450], [1.5, -11.6, 0x241a6a], [2.8, -14.2, 0x2d2080]].forEach(([y, z, c], i) => { const t = new T.Mesh(new T.BoxGeometry(L, 1.3, 2.6), std(c, { roughness: 0.8 })); t.position.set(X0 + L / 2, y, z); t.receiveShadow = true; this.s.add(t); const e = new T.Mesh(new T.BoxGeometry(L, 0.06, 0.06), glow([0x00e5ff, 0xff2d95, 0xffd24a][i])); e.position.set(X0 + L / 2, y + 0.66, z + 1.3); this.s.add(e); });
    // LED-Wand mit laufendem Muster
    const led = cvs(512, 128, (g, w, h) => { g.fillStyle = '#10062e'; g.fillRect(0, 0, w, h); for (let i = 0; i < 16; i++) { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, ['#00e5ff', '#ff2d95', '#8b5cf6', '#ffd24a'][i % 4]); gr.addColorStop(1, 'rgba(16,6,46,0)'); g.fillStyle = gr; g.globalAlpha = 0.85; g.fillRect(i * 32 + 4, h * (0.25 + 0.5 * Math.abs(Math.sin(i * 1.7))) * 0.7, 24, h); } g.globalAlpha = 1; });
    led.wrapS = led.wrapT = T.RepeatWrapping; led.repeat.set(L / 16, 1); this.led = led; const wall = new T.Mesh(new T.PlaneGeometry(L, 14), glow(0xffffff, { map: led })); wall.position.set(X0 + L / 2, 10, -18); this.s.add(wall);
    // Publikum: Körper, Köpfe, Arme
    const n = 260; this.cdata = []; const bodyG = new T.BoxGeometry(0.62, 0.9, 0.5), headG = new T.SphereGeometry(0.28, 10, 8), armG = new T.BoxGeometry(0.13, 0.6, 0.13); armG.translate(0, -0.3, 0);
    this.bodies = new T.InstancedMesh(bodyG, new T.MeshLambertMaterial({ color: 0xffffff }), n); this.heads = new T.InstancedMesh(headG, new T.MeshLambertMaterial({ color: 0xffffff }), n); this.arms = new T.InstancedMesh(armG, new T.MeshLambertMaterial({ color: 0xffd9b0 }), n * 2);
    const skin = [0xffd9b0, 0xe8b88a, 0xc68a5e, 0x8d5a3b, 0xf3c9a0];
    for (let i = 0; i < n; i++) { const tier = i % 3, x = X0 + (i / 3 | 0) * 3.4 + Math.random() * 1.2, y = [1.4, 2.7, 4.0][tier], z = [-9, -11.6, -14.2][tier]; this.cdata.push({ x, y, z, ph: Math.random() * 6, sp: 0.8 + Math.random() * 0.6 }); COLTMP.setHSL(Math.random(), 0.65, 0.5); this.bodies.setColorAt(i, COLTMP); COLTMP.setHex(skin[(Math.random() * skin.length) | 0]); this.heads.setColorAt(i, COLTMP); }
    this.s.add(this.bodies, this.heads, this.arms); this.crowdIdx = 0;
    // Banner mit Sender-Logos (Rahmen + Leuchtfläche dahinter)
    const bm = new T.PlaneGeometry(4.2, 4.2), fr = new T.BoxGeometry(4.7, 4.7, 0.2); this.banners = []; const loader = new T.TextureLoader();
    for (let i = 0; i < 26; i++) { const x = X0 + 6 + i * 11.5, f = new T.Mesh(fr, std(0x1a1650, { emissive: [0x0b3a5a, 0x5a0b3a, 0x3a2a0b][i % 3], metalness: 0.4 })); f.position.set(x, 9, -16.6); this.s.add(f); const m = new T.Mesh(bm, new T.MeshBasicMaterial({ color: 0xffffff })); m.position.set(x, 9, -16.45); this.s.add(m); this.banners.push(m); loader.load(this.logos[i % this.logos.length], t => { m.material.map = t; m.material.needsUpdate = true; }); }
    // Traverse mit Scheinwerfern
    const truss = new T.Mesh(new T.BoxGeometry(L, 0.25, 0.25), std(0x394070, { metalness: 0.6, roughness: 0.35 })); truss.position.set(X0 + L / 2, 13, -6); this.s.add(truss);
    this.cones = []; const cg = new T.ConeGeometry(2.0, 13, 14, 1, true); cg.translate(0, -6.5, 0);
    for (let i = 0; i < 18; i++) { const col = [0x00e5ff, 0xff2d95, 0xffd24a, 0x8b5cf6][i % 4], lamp = new T.Mesh(new T.CylinderGeometry(0.28, 0.4, 0.5, 10), glow(col)); const x = X0 + 4 + i * 16; lamp.position.set(x, 13, -6); this.s.add(lamp); const cone = new T.Mesh(cg, new T.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.1, side: T.DoubleSide, depthWrite: false, blending: T.AdditiveBlending })); cone.position.set(x, 12.8, -6); this.s.add(cone); this.cones.push({ cone, ph: i * 0.9, base: x }); }
    // Kamerablitze im Publikum
    const N = 160, pos = new Float32Array(N * 3); for (let i = 0; i < N; i++) { pos[i * 3] = X0 + Math.random() * L; pos[i * 3 + 1] = 1.8 + Math.random() * 4.5; pos[i * 3 + 2] = -8.5 - Math.random() * 5; }
    const pg = new T.BufferGeometry(); pg.setAttribute('position', new T.BufferAttribute(pos, 3)); this.flash = new T.Points(pg, new T.PointsMaterial({ map: puff(), color: 0xffffff, size: 1.2, transparent: true, opacity: 0.8, depthWrite: false, blending: T.AdditiveBlending })); this.s.add(this.flash);
  }
  // ---------------------------------------------------------------- Läufer
  makeRunner(color, logo) {
    const g = new T.Group(), body = new T.Group(); g.add(body);
    const skin = C('skin', () => std(0xffd9b0, { roughness: 0.7, metalness: 0 })), shirt = std(color, { roughness: 0.55, metalness: 0.05 }), pants = C('pants', () => std(0x1b2748, { roughness: 0.7 })), shoe = C('shoe', () => std(0xf5f5ff, { roughness: 0.4 })), dark = C('dark', () => glow(0x10122a));
    const torso = new T.Mesh(C('torso', () => new T.CylinderGeometry(0.32, 0.27, 0.8, 14)), shirt); torso.position.y = 1.1; body.add(torso);
    const shorts = new T.Mesh(C('shorts', () => new T.CylinderGeometry(0.28, 0.31, 0.26, 14)), pants); shorts.position.y = 0.68; body.add(shorts);
    const head = new T.Mesh(C('head', () => new T.SphereGeometry(0.27, 18, 14)), skin); head.position.y = 1.72; body.add(head);
    const hair = new T.Mesh(C('hair', () => new T.SphereGeometry(0.285, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.46)), C('hairm', () => std(0x2a1a12, { roughness: 0.9 }))); hair.position.y = 1.74; body.add(hair);
    const band = new T.Mesh(C('band', () => new T.CylinderGeometry(0.29, 0.29, 0.08, 16, 1, true)), std(0xffd24a, { emissive: 0x332200, side: T.DoubleSide })); band.position.y = 1.82; body.add(band);
    [-0.1, 0.1].forEach(x => { const eye = new T.Mesh(C('eye', () => new T.SphereGeometry(0.045, 8, 6)), dark); eye.position.set(x, 1.74, 0.245); body.add(eye); });
    const limb = (m, x, y, len, rad, end) => { const p = new T.Group(); p.position.set(x, y, 0); const l = new T.Mesh(C('limb' + len + rad, () => new T.CylinderGeometry(rad, rad * 0.88, len, 10)), m); l.position.y = -len / 2; p.add(l); if (end) { const e = end.clone(); e.position.y = -len; p.add(e); } body.add(p); return p; };
    const foot = new T.Mesh(C('foot', () => new T.BoxGeometry(0.2, 0.12, 0.34)), shoe); foot.position.z = 0.07; const hand = new T.Mesh(C('hand', () => new T.SphereGeometry(0.1, 10, 8)), skin);
    const legL = limb(skin, -0.15, 0.62, 0.62, 0.1, foot), legR = limb(skin, 0.15, 0.62, 0.62, 0.1, foot), armL = limb(skin, -0.42, 1.4, 0.6, 0.075, hand), armR = limb(skin, 0.42, 1.4, 0.6, 0.075, hand);
    const decal = new T.Mesh(C('decal', () => new T.PlaneGeometry(0.42, 0.42)), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true })); decal.position.set(0, 1.12, 0.31); body.add(decal);
    g.traverse(o => { if (o.isMesh) o.castShadow = true; });
    const r = { g, body, legL, legR, armL, armR, shirt, decal, face: 1, prevX: 0, phase: 0 }; this.setLogo(r, logo); return r;
  }
  setLogo(r, i) { new T.TextureLoader().load(this.logos[i % this.logos.length], t => { r.decal.material.map = t; r.decal.material.needsUpdate = true; }); }
  setLook(color, logo) { this.runner.shirt.color.setHex(color); this.setLogo(this.runner, logo); }
  // ---------------------------------------------------------------- Parcours
  setCourse(c) {
    this.course = c; const keep = new Set(Object.values(cache)); while (this.root.children.length) { const ch = this.root.children[0]; this.root.remove(ch); ch.traverse(o => { if (o.geometry) o.geometry.dispose(); const ms = o.material ? [].concat(o.material) : []; ms.forEach(m => { if (!keep.has(m)) { if (m.map) m.map.dispose(); m.dispose(); } }); }); } this.dyn = []; this.rings = []; this.buzzer = null;
    const metal = C('metal', () => std(0x20264f, { metalness: 0.6, roughness: 0.35 })), pole = C('pole', () => std(0x2a3170, { metalness: 0.5, roughness: 0.4 }));
    c.o.forEach((o, i) => {
      if (o.k === 'plat' || o.k === 'move' || o.k === 'sink') {
        const w = o.w, acc = o.k === 'move' ? COL.y : o.k === 'sink' ? COL.o : [COL.a, COL.p, COL.b][i % 3], g = new T.Group();
        const body = new T.Mesh(new T.BoxGeometry(w, 0.5, 4), metal); g.add(body);
        const top = new T.Mesh(new T.BoxGeometry(w + 0.04, 0.14, 4.04), std(acc, { roughness: 0.3, metalness: 0.25, emissive: acc, emissiveIntensity: 0.12 })); top.position.y = 0.25; top.receiveShadow = true; g.add(top);
        [2.03, -2.03].forEach(z => { const st = new T.Mesh(new T.BoxGeometry(w, 0.05, 0.05), glow(acc)); st.position.set(0, 0.17, z); g.add(st); });
        const f = new T.Mesh(new T.BoxGeometry(w * 0.7, 0.03, 0.03), glow(0xffffff)); f.position.set(0, 0.33, 2.03); g.add(f);
        if (o.k === 'sink') for (let k = -1; k <= 1; k++) { const cr = new T.Mesh(new T.BoxGeometry(0.05, 0.03, 3.4), glow(0x4a1a00)); cr.position.set(k * w * 0.27, 0.33, 0); cr.rotation.y = k * 0.12; g.add(cr); }
        if (o.k === 'plat') { const p = new T.Mesh(new T.CylinderGeometry(0.24, 0.3, 3, 10), pole); p.position.y = -1.75; g.add(p); const rg = new T.Mesh(new T.RingGeometry(0.5, 0.75, 20), new T.MeshBasicMaterial({ color: 0xcdeaff, transparent: true, opacity: 0.5, side: T.DoubleSide, depthWrite: false })); rg.rotation.x = -Math.PI / 2; rg.position.set(o.x + w / 2, 0.02, 0); this.root.add(rg); this.rings.push({ m: rg, ph: i }); }
        g.traverse(m => { if (m.isMesh) m.castShadow = o.k !== 'plat' || m === body || m === top; });
        g.position.set(o.x + w / 2, o.y - 0.25, 0); this.root.add(g); this.dyn.push({ o, m: g, i });
      } else if (o.k === 'swing') {
        const grp = new T.Group(), beam = new T.Mesh(new T.BoxGeometry(0.6, 0.35, 1.2), metal); beam.position.set(o.px, o.py, 0); this.root.add(beam);
        const rope = new T.Mesh(new T.CylinderGeometry(0.035, 0.035, o.len, 6), std(0xcfd6ff, { metalness: 0.8, roughness: 0.3 })); rope.position.y = -o.len / 2; grp.add(rope);
        const ball = new T.Mesh(new T.SphereGeometry(o.r, 22, 16), std(0xff3b3b, { emissive: 0x550000, roughness: 0.3, metalness: 0.2 })); ball.position.y = -o.len; ball.castShadow = true; grp.add(ball);
        const ring = new T.Mesh(new T.TorusGeometry(o.r * 0.98, 0.07, 8, 28), glow(0xffffff)); ring.position.y = -o.len; grp.add(ring);
        const halo = new T.Sprite(new T.SpriteMaterial({ map: puff(), color: 0xff4040, transparent: true, opacity: 0.55, blending: T.AdditiveBlending, depthWrite: false })); halo.scale.setScalar(o.r * 4.5); halo.position.y = -o.len; grp.add(halo);
        grp.position.set(o.px, o.py, 0); this.root.add(grp); this.dyn.push({ o, m: grp, i });
      } else if (o.k === 'bars') {
        const len = o.x2 - o.x1, bar = new T.Mesh(new T.CylinderGeometry(0.07, 0.07, len, 10), std(0xffd24a, { emissive: 0x443300, metalness: 0.7, roughness: 0.25 })); bar.rotation.z = Math.PI / 2; bar.position.set((o.x1 + o.x2) / 2, o.y, 0); bar.castShadow = true; this.root.add(bar);
        for (let k = 0; k <= len; k += 1.5) { const rg = new T.Mesh(new T.TorusGeometry(0.22, 0.045, 8, 16), std(0xff2d95, { emissive: 0x550022, metalness: 0.4, roughness: 0.3 })); rg.position.set(o.x1 + k, o.y, 0); this.root.add(rg); }
        [o.x1, o.x2].forEach(x => { const p = new T.Mesh(new T.BoxGeometry(0.32, 6, 0.32), metal); p.position.set(x, o.y + 0.5, 0); p.castShadow = true; this.root.add(p); });
        const top = new T.Mesh(new T.BoxGeometry(len + 0.7, 0.28, 0.42), metal); top.position.set((o.x1 + o.x2) / 2, o.y + 3.5, 0); this.root.add(top);
        const lt = new T.Mesh(new T.BoxGeometry(len, 0.05, 0.05), glow(0x00e5ff)); lt.position.set((o.x1 + o.x2) / 2, o.y + 3.34, 0.2); this.root.add(lt);
      } else if (o.k === 'wall') this.buildWall(o);
      else if (o.k === 'finish') {
        const b = new T.Mesh(new T.CylinderGeometry(0.5, 0.62, 0.35, 20), std(0xff2d2d, { emissive: 0x880000, roughness: 0.3 })); b.position.set(o.x, o.y + 0.2, 0); b.castShadow = true; this.root.add(b); this.buzzer = b;
        const halo = new T.Sprite(new T.SpriteMaterial({ map: puff(), color: 0xff4040, transparent: true, opacity: 0.8, blending: T.AdditiveBlending, depthWrite: false })); halo.scale.setScalar(3); halo.position.set(o.x, o.y + 0.5, 0.2); this.root.add(halo);
        this.arch(o.x - 1.2, o.x + 3.2, o.y, 'ZIEL', '#ffffff');
        const fp = new T.Mesh(new T.CylinderGeometry(0.06, 0.06, 3, 8), std(0xffffff)); fp.position.set(o.x + 1, o.y + 1.5, 0); this.root.add(fp); const flag = new T.Mesh(new T.BoxGeometry(1.4, 0.8, 0.05), std(0xffd24a, { emissive: 0x553300 })); flag.position.set(o.x + 1.7, o.y + 2.6, 0); this.root.add(flag);
      }
    });
    this.arch(0.3, 3.7, c.o[0].y, 'START', '#ffffff');
    this.water.position.x = 100;
  }
  arch(x0, x1, y, txt, col) {
    const metal = C('metal', () => std(0x20264f, { metalness: 0.6, roughness: 0.35 }));
    [x0, x1].forEach(x => { const p = new T.Mesh(new T.BoxGeometry(0.25, 5, 0.25), metal); p.position.set(x, y + 2.5, 0); p.castShadow = true; this.root.add(p); });
    const bn = new T.Mesh(new T.BoxGeometry(x1 - x0 + 0.4, 0.9, 0.2), new T.MeshBasicMaterial({ map: label(txt, col, '#10062e', 256, 64), fog: false })); bn.position.set((x0 + x1) / 2, y + 4.7, 0); this.root.add(bn);
    const lt = new T.Mesh(new T.BoxGeometry(x1 - x0 + 0.4, 0.06, 0.06), glow(0xffffff)); lt.position.set((x0 + x1) / 2, y + 4.22, 0.12); this.root.add(lt);
  }
  buildWall(o) {
    const N = 26, W = 4, pts = []; for (let k = 0; k <= N; k++) { const u = k / N; pts.push([o.x - 2.6 * Math.pow(1 - u, 2), o.y + o.h * u]); }
    const sh = new T.Shape(); sh.moveTo(o.x - 2.6, -1.8); pts.forEach(p => sh.lineTo(p[0] - 0.02, p[1] - 0.02)); sh.lineTo(o.x + o.w, o.y + o.h); sh.lineTo(o.x + o.w, -1.8); sh.lineTo(o.x - 2.6, -1.8);
    const body = new T.Mesh(new T.ExtrudeGeometry(sh, { depth: W, bevelEnabled: false }), std(0x241a6a, { roughness: 0.6, metalness: 0.3 })); body.position.z = -W / 2; body.castShadow = true; this.root.add(body);
    const pal = [0xff2d95, 0xff9a1f, 0x8b5cf6, 0x00c8ea, 0xffd24a], tex = cvs(256, 256, (g, w, h) => { for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = '#' + pal[(i * 3 + j * 2 + (i * j)) % 5].toString(16).padStart(6, '0'); g.fillRect(i * 64, j * 64, 64, 64); g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 4; g.strokeRect(i * 64 + 2, j * 64 + 2, 60, 60); } }); tex.wrapS = tex.wrapT = T.RepeatWrapping; tex.repeat.set(0.25, 0.25);
    const face = new T.Mesh(new T.ShapeGeometry(sh), new T.MeshStandardMaterial({ map: tex, roughness: 0.4, metalness: 0.15 })); face.position.z = W / 2 + 0.01; this.root.add(face);
    for (let k = 3; k < N; k += 4) { const p = pts[k]; const h = new T.Mesh(new T.SphereGeometry(0.09, 8, 6), glow(0xffffff)); h.position.set(p[0] + 0.02, p[1], W / 2 + 0.04); this.root.add(h); }
    const edge = new T.Mesh(new T.BoxGeometry(o.w + 0.1, 0.1, W + 0.1), glow(0xffd24a)); edge.position.set(o.x + o.w / 2, o.y + o.h + 0.03, 0); this.root.add(edge);
  }
  // ---------------------------------------------------------------- Bild
  setGhost(frames) {
    this.ghostFrames = frames;
    if (frames && !this.ghost) { this.ghost = this.makeRunner(0x9fe8ff, 0); this.ghost.g.traverse(o => { if (o.isMesh) { o.castShadow = false; o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.38; o.material.depthWrite = false; if (o.material.emissive) o.material.emissive.setHex(0x2a8aa8); } }); this.s.add(this.ghost.g); }
    if (this.ghost) this.ghost.g.visible = !!frames;
  }
  pose(r, x, y, sim) {
    const g = r.g; g.position.set(x, y, 0); const dx = x - r.prevX; r.prevX = x; const mov = Math.abs(dx) > 0.001; r.phase += Math.abs(dx) * 5.2; const face = sim ? sim.face : r.face; r.face = face; r.body.rotation.set(0, face > 0 ? 1.2 : -1.2, 0);
    let st = 'run'; if (sim) { if (sim.dead) st = 'fall'; else if (sim.finished) st = 'win'; else if (sim.hang) st = 'hang'; else if (sim.wall) st = 'wall'; else if (!sim.onGround) st = 'air'; else if (!mov) st = 'idle'; }
    const sw = Math.sin(r.phase), lA = st === 'run' ? sw * 0.95 : 0, aA = st === 'run' ? -sw * 0.85 : 0;
    r.legL.rotation.set(0, 0, 0); r.legR.rotation.set(0, 0, 0); r.armL.rotation.set(0, 0, 0); r.armR.rotation.set(0, 0, 0);
    if (st === 'run') { r.legL.rotation.x = lA; r.legR.rotation.x = -lA; r.armL.rotation.x = aA; r.armR.rotation.x = -aA; r.body.rotation.z = -face * 0.12; }
    else if (st === 'air') { r.legL.rotation.x = 0.8; r.legR.rotation.x = -0.6; r.armL.rotation.x = -2.5; r.armR.rotation.x = -2.2; r.body.rotation.z = -face * 0.08; }
    else if (st === 'hang') { r.legL.rotation.x = r.legR.rotation.x = 0.1; r.armL.rotation.x = r.armR.rotation.x = Math.PI; r.armL.rotation.z = -0.2; r.armR.rotation.z = 0.2; r.legL.rotation.x += Math.sin(this.time * 6) * 0.2; }
    else if (st === 'win') { r.armL.rotation.x = r.armR.rotation.x = Math.PI * 0.95; r.armL.rotation.z = -0.4; r.armR.rotation.z = 0.4; g.position.y += Math.abs(Math.sin(this.time * 8)) * 0.25; }
    else if (st === 'wall') { r.legL.rotation.x = Math.sin(this.time * 24) * 0.9; r.legR.rotation.x = -Math.sin(this.time * 24) * 0.9; r.armL.rotation.x = r.armR.rotation.x = -2.6; r.body.rotation.z = -face * 0.5; }
    else if (st === 'fall') { r.body.rotation.z = this.time * 7; r.armL.rotation.x = r.armR.rotation.x = 2.6; }
    else { r.armL.rotation.x = r.armR.rotation.x = Math.sin(this.time * 2) * 0.06; }
    if (sim && sim.stun > 0) r.body.rotation.z = Math.sin(this.time * 40) * 0.25;
    return st;
  }
  adapt(dt) {   // Qualität senken, wenn das Gerät nicht hinterherkommt
    this.fpsT += dt; this.fpsN++; if (this.fpsT < 1.5) return; const fps = this.fpsN / this.fpsT; this.fpsT = 0; this.fpsN = 0;
    if (fps < 24 && dt < 0.2) { this.slow++; if (this.slow >= 2) { this.slow = 0; if (this.pr > 1) { this.pr = Math.max(1, this.pr - 0.5); this.resize(); } else if (this.sun.castShadow) { this.sun.castShadow = false; this.r.shadowMap.enabled = false; this.s.traverse(o => { if (o.material) o.material.needsUpdate = true; }); } } } else this.slow = 0;
  }
  /** sim: laufende Simulation (oder null), ghostPos: [x,y] oder null */
  frame(sim, dt, ghostPos, idleX) {
    this.time += dt; const t = sim ? sim.t : this.time; this.wu.t.value = this.time;
    for (const d of this.dyn) { const o = d.o; if (o.k === 'move') { const p = movePos(o, t); d.m.position.set(p.x + o.w / 2, p.y - 0.25, 0); } else if (o.k === 'sink') { const k = sim && sim.sinks[d.i]; d.m.position.y = o.y - 0.25 + (k ? k.y : 0); d.m.visible = !(k && k.gone); if (k && k.touch >= 0 && !k.gone && sim.t - k.touch < o.delay) d.m.position.x = o.x + o.w / 2 + Math.sin(this.time * 70) * 0.03; } else if (o.k === 'swing') d.m.rotation.z = swingBall(o, t).a; }
    for (const r of this.rings) { const u = (this.time * 0.6 + r.ph) % 1; r.m.scale.setScalar(1 + u * 0.8); r.m.material.opacity = 0.5 * (1 - u); }
    // Läufer + Staub/Landung
    const x = sim ? sim.x : idleX != null ? idleX : 2;
    if (sim) {
      this.pose(this.runner, sim.x, sim.y, sim);
      if (!sim.onGround) this.lastVy = sim.vy;
      if (sim.onGround && !this.prevG && this.lastVy < -5 && !sim.dead) { this.dust(sim.x, sim.y, 8, 3); this.shake = Math.max(this.shake, Math.min(0.14, -this.lastVy * 0.012)); }
      this.prevG = sim.onGround; this.dustT -= dt; if (sim.onGround && Math.abs(sim.vx) > 3 && !sim.dead && !sim.finished && this.dustT <= 0) { this.dustT = 0.13; this.dust(sim.x - sim.face * 0.2, sim.y, 1, 1); }
    } else { this.pose(this.runner, x, this.course ? this.course.o[0].y : 1, null); this.prevG = true; }
    if (this.ghost && this.ghost.g.visible && ghostPos) this.pose(this.ghost, ghostPos[0], ghostPos[1], null);
    // Kamera: leichte Vorausschau, Tempo-Zoom, Wackeln
    const vx = sim ? sim.vx || 0 : 0, tx = x + 3.2 + vx * 0.12, ty = (sim ? Math.max(sim.y, 1) : 1.4) + 1.1; this.cx += (tx - this.cx) * Math.min(1, dt * 4.5); this.cy += (ty - this.cy) * Math.min(1, dt * 3.5);
    const dist = this.cam.aspect < 1 ? 17 : 13; this.shake = Math.max(0, this.shake - dt * 1.4); const sk = this.shake, sx = (Math.random() - 0.5) * sk, sy = (Math.random() - 0.5) * sk;
    this.cam.position.set(this.cx - 1.8 + sx, this.cy + 1.5 + sy, dist); this.cam.lookAt(this.cx, this.cy - 0.3, 0); const fov = this.baseFov + Math.min(6, Math.abs(vx) * 0.7); if (Math.abs(fov - this.cam.fov) > 0.05) { this.cam.fov += (fov - this.cam.fov) * Math.min(1, dt * 3); this.cam.updateProjectionMatrix(); }
    this.sun.position.set(this.cx + 8, 15, 11); this.sun.target.position.set(this.cx, 0, 0); this.rim.position.set(this.cx, 6, 9); this.wu.cx.value = this.cx; this.water.position.x = this.cx + 30; if (this.led) this.led.offset.x += dt * 0.05;
    if (this.buzzer) this.buzzer.scale.y = 1 + Math.sin(this.time * 6) * 0.12;
    // Scheinwerfer + Blitzlichter
    this.cones.forEach(c => { c.cone.rotation.z = Math.sin(this.time * 0.8 + c.ph) * 0.3; c.cone.rotation.x = Math.cos(this.time * 0.6 + c.ph) * 0.18; });
    this.flash.material.opacity = 0.5 + 0.3 * Math.sin(this.time * 17) * Math.sin(this.time * 5.3);
    // Publikum
    const e = this.energy; this.energy = Math.max(0.25, this.energy - dt * 0.15); const bm = DUMMY, camX = this.cx; let ai = 0;
    for (let i = 0; i < this.cdata.length; i++) {
      const c = this.cdata[i];
      if (Math.abs(c.x - camX) > 45) { bm.position.set(0, -50, 0); bm.rotation.set(0, 0, 0); bm.updateMatrix(); this.bodies.setMatrixAt(i, bm.matrix); this.heads.setMatrixAt(i, bm.matrix); this.arms.setMatrixAt(i * 2, bm.matrix); this.arms.setMatrixAt(i * 2 + 1, bm.matrix); continue; }
      const b = Math.abs(Math.sin(this.time * (2 + e * 4) * c.sp + c.ph)) * (0.08 + e * 0.4);
      bm.rotation.set(0, 0, 0); bm.position.set(c.x, c.y + 0.45 + b, c.z); bm.updateMatrix(); this.bodies.setMatrixAt(i, bm.matrix); bm.position.set(c.x, c.y + 1.15 + b, c.z); bm.updateMatrix(); this.heads.setMatrixAt(i, bm.matrix);
      const up = 0.1 + Math.max(0, e - 0.3) * 3.6 + Math.sin(this.time * 6 * c.sp + c.ph) * 0.3 * e;   // Arme: runter → hoch bei Begeisterung
      [-1, 1].forEach((sd, k) => { bm.rotation.set(0, 0, sd * Math.min(2.9, up)); bm.position.set(c.x + sd * 0.38, c.y + 0.8 + b, c.z); bm.updateMatrix(); this.arms.setMatrixAt(i * 2 + k, bm.matrix); });
    }
    this.bodies.instanceMatrix.needsUpdate = this.heads.instanceMatrix.needsUpdate = this.arms.instanceMatrix.needsUpdate = true;
    // Partikel
    for (let i = this.live.length - 1; i >= 0; i--) { const p = this.live[i]; p.life -= dt; p.vy -= p.g * dt; const s = p.sp; s.position.x += p.vx * dt; s.position.y += p.vy * dt; s.position.z += p.vz * dt; if (p.grow) s.scale.addScalar(p.grow * dt); if (p.spin) s.material.rotation += 9 * dt; s.material.opacity = p.a * Math.max(0, p.life / p.max); if (p.life <= 0 || (p.g && s.position.y < -0.1 && p.vy < 0)) { s.visible = false; this.pool.push(s); this.live.splice(i, 1); } }
    this.r.render(this.s, this.cam); this.adapt(dt);
  }
}
