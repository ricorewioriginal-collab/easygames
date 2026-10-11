/* Funkparcours – 3D-Arena (Three.js r128) im Look einer großen TV-Hindernis-Show (eigenes Design, keine fremden Logos):
   Wasserbecken mit Unterwasserlicht, Stahl-Traversen über jedem Hindernis mit LED-Schild, Moving-Heads, steile Tribüne mit Publikum,
   LED-Bande, Startturm und Buzzer-Turm mit Flammen und Zeit-Anzeige. Läufer mit Gelenken (Knie, Ellbogen) und 8 wählbaren Figuren.
   Passt die Qualität selbst an, wenn das Gerät zu langsam ist. */
import { movePos, swingBall, fmtTime } from './engine.js';
import { CHARS } from './chars.js';
const T = window.THREE;
const COL = { a: 0x00c8ea, b: 0xff2d95, y: 0xffd24a, o: 0xff9a1f, p: 0x8b5cf6, g: 0x00e07a };
const cache = {}, C = (k, f) => cache[k] || (cache[k] = f());
const std = (c, o) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.5, metalness: 0.15 }, o || {}));
const glow = (c, o) => new T.MeshBasicMaterial(Object.assign({ color: c }, o || {}));
const cvs = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); const t = new T.CanvasTexture(c); return t; };
const sign = (txt, w = 512, h = 96, fg = '#ffffff', edge = '#00e5ff') => cvs(w, h, (g, W, H) => { g.fillStyle = '#070a26'; g.fillRect(0, 0, W, H); g.strokeStyle = edge; g.lineWidth = 6; g.strokeRect(5, 5, W - 10, H - 10); g.fillStyle = fg; g.shadowColor = edge; g.shadowBlur = 14; g.font = `900 ${H * 0.52}px Inter,Arial,sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt.toUpperCase(), W / 2, H / 2 + 2); });
const puff = () => C('puff', () => cvs(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); }));
const DUMMY = new T.Object3D(), BD = new T.Object3D(), COLTMP = new T.Color(), V0 = new T.Vector3(), UP = new T.Vector3(0, 1, 0);
const CROWD_W = 96;

/** Sammelt Stahlträger als Instanzen eines Würfels: viele Traversen = ein einziger Zeichenaufruf */
class Beams {
  constructor() { this.m = []; }
  add(ax, ay, az, bx, by, bz, t) { V0.set(bx - ax, by - ay, bz - az); const len = V0.length(); if (len < 1e-4) return; V0.multiplyScalar(1 / len); BD.position.set((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2); BD.quaternion.setFromUnitVectors(UP, V0); BD.scale.set(t, len, t); BD.updateMatrix(); this.m.push(BD.matrix.clone()); }
  /** Gittermast (achsparallel) von a nach b: vier Gurte und Zickzack-Streben auf zwei Seiten */
  truss(a, b, w = 0.55, step = 0.75) {
    const ax = [0, 1, 2].find(i => Math.abs(a[i] - b[i]) > 1e-6), [p, q] = [0, 1, 2].filter(i => i !== ax), h = w / 2, len = Math.abs(b[ax] - a[ax]);
    const cor = [[-h, -h], [h, -h], [h, h], [-h, h]].map(([u, v]) => { const A = a.slice(), B = b.slice(); A[p] += u; A[q] += v; B[p] += u; B[q] += v; return [A, B]; });
    cor.forEach(([A, B]) => this.add(A[0], A[1], A[2], B[0], B[1], B[2], 0.07));
    const n = Math.max(1, Math.round(len / step)), at = (c, t) => { const [A, B] = cor[c]; return [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]; };
    for (const f of [0, 2]) for (let i = 0; i < n; i++) { const c0 = i % 2 ? f : f + 1, c1 = i % 2 ? f + 1 : f, P = at(c0, i / n), Q = at(c1, (i + 1) / n); this.add(P[0], P[1], P[2], Q[0], Q[1], Q[2], 0.035); }
  }
  mesh(mat) { const im = new T.InstancedMesh(C('ubox', () => new T.CylinderGeometry(0.5, 0.5, 1, 4, 1, true).rotateY(Math.PI / 4)), mat, this.m.length); this.m.forEach((m, i) => im.setMatrixAt(i, m)); im.instanceMatrix.needsUpdate = true; im.frustumCulled = false; return im; }
}
const steel = () => C('steel', () => std(0x9aa3c0, { metalness: 0.85, roughness: 0.32 }));

export class Arena {
  constructor(cv, logos) {
    this.cv = cv; this.logos = logos; const coarse = matchMedia('(pointer:coarse)').matches;
    this.r = new T.WebGLRenderer({ canvas: cv, antialias: !coarse, alpha: false, powerPreference: 'high-performance' }); this.pr = Math.min(devicePixelRatio || 1, coarse ? 1.5 : 2); this.r.setPixelRatio(this.pr); this.r.setClearColor(0x05061a);
    this.r.shadowMap.enabled = true; this.r.shadowMap.type = coarse ? T.BasicShadowMap : T.PCFSoftShadowMap;
    this.s = new T.Scene(); this.s.fog = new T.Fog(0x060716, 20, 80); this.s.background = cvs(8, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#020310'); gr.addColorStop(0.6, '#0b0d33'); gr.addColorStop(1, '#1a0f45'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
    this.cam = new T.PerspectiveCamera(42, 1, 0.1, 220); this.cx = 3; this.cy = 2.4; this.shake = 0; this.baseFov = 42; this.dist = 12.5;
    this.s.add(new T.HemisphereLight(0xb8ccff, 0x1a1040, 0.7));
    const sun = new T.DirectionalLight(0xfff2dd, 1.0); sun.position.set(9, 15, 12); sun.target.position.set(3, 0, 0); this.s.add(sun, sun.target); this.sun = sun;
    sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); const sc = sun.shadow.camera; sc.left = -15; sc.right = 15; sc.top = 12; sc.bottom = -8; sc.near = 4; sc.far = 50; sun.shadow.bias = -0.0008; sun.shadow.normalBias = 0.02;
    const rim = new T.PointLight(0x2f7bff, 0.9, 30); rim.position.set(0, 6, -6); this.s.add(rim); this.rim = rim;
    this.boom = new T.PointLight(0xff8a2a, 0, 26); this.boom.position.set(0, 6, 3); this.s.add(this.boom);
    this.root = new T.Group(); this.s.add(this.root); this.dyn = []; this.rings = []; this.heads = []; this.pots = []; this.time = 0; this.energy = 0.3; this.ghost = null; this.ghostFrames = null; this.prevG = true; this.lastVy = 0; this.dustT = 0; this.clockT = 0;
    this.pool = []; this.live = []; this.initPool(); this.buildWater(); this.buildSet();
    this.runner = this.makeRunner(0xff6fb0, 6, 0); this.s.add(this.runner.g); this.fpsT = 0; this.fpsN = 0; this.slow = 0; this.resize();
  }
  resize() { const w = this.cv.clientWidth || innerWidth, h = this.cv.clientHeight || innerHeight, port = w / h < 1; this.r.setPixelRatio(this.pr); this.r.setSize(w, h, false); this.cam.aspect = w / h; this.baseFov = port ? 58 : 44; this.dist = port ? 13.5 : 11.5; this.cam.fov = this.baseFov; this.cam.updateProjectionMatrix(); }
  // ---------------------------------------------------------------- Partikel (Pool aus Sprites)
  initPool() { for (let i = 0; i < 240; i++) { const sp = new T.Sprite(new T.SpriteMaterial({ map: puff(), transparent: true, depthWrite: false })); sp.visible = false; this.s.add(sp); this.pool.push(sp); } }
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
  /** Flammensäulen der Feuertöpfe in der Nähe von x */
  fire(x) {
    let n = 0; for (const p of this.pots) if (Math.abs(p.x - x) < 9) { n++; for (let i = 0; i < 22; i++) this.emit(p.x + (Math.random() - 0.5) * 0.25, p.y + 0.2, p.z + (Math.random() - 0.5) * 0.25, (Math.random() - 0.5) * 0.6, 6 + Math.random() * 5, (Math.random() - 0.5) * 0.6, { c: [0xff7a1a, 0xffb02a, 0xff4a10][i % 3], s: 0.55 + Math.random() * 0.35, life: 0.55 + Math.random() * 0.3, g: 4, grow: 1.4, a: 0.95, add: true }); }
    if (n) { this.boom.position.set(x, 6, 3); this.boom.intensity = 3; }
  }
  confetti(x, y) { for (let i = 0; i < 70; i++) this.emit(x + (Math.random() - 0.5) * 2, y + 2 + Math.random(), (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 6, 3 + Math.random() * 6, (Math.random() - 0.5) * 3, { c: [0x00e5ff, 0xff2d95, 0xffd24a, 0x00ff88, 0xffffff][i % 5], s: 0.2, life: 1.8 + Math.random() * 0.6, g: 9, a: 1, spin: 1 }); this.energy = 1; this.shake = Math.max(this.shake, 0.12); this.fire(x); }
  cheer(v) { this.energy = Math.max(this.energy, v); }
  // ---------------------------------------------------------------- Wasserbecken (Shader: Wellen, Glitzer, Unterwasserlampen)
  buildWater() {
    this.wu = { t: { value: 0 }, cx: { value: 0 } };
    const m = new T.ShaderMaterial({ uniforms: this.wu,
      vertexShader: 'varying vec3 vP; void main(){ vec4 w = modelMatrix*vec4(position,1.0); vP = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }',
      fragmentShader: `varying vec3 vP; uniform float t; uniform float cx;
        void main(){
          float depth = clamp((-vP.z + 4.5) / 9.5, 0.0, 1.0);
          vec3 col = mix(vec3(0.02,0.42,0.78), vec3(0.01,0.12,0.42), depth);
          float lx = mod(vP.x, 6.0) - 3.0;
          col += vec3(0.1,0.75,1.0) * (exp(-(lx*lx + (vP.z+4.1)*(vP.z+4.1)) * 0.35) * 0.55 + exp(-(lx*lx + (vP.z-3.9)*(vP.z-3.9)) * 0.45) * 0.35);
          float w1 = sin(vP.x*1.3 + t*1.2 + sin(vP.z*0.9 + t*0.7)*1.6), w2 = sin(vP.x*0.7 - t*0.8 + vP.z*1.7), w3 = sin(vP.x*3.1 + vP.z*2.3 + t*2.1);
          float lines = smoothstep(0.93, 1.0, w1*0.5 + w2*0.5) * 0.55;
          float spark = pow(max(0.0, w3*w1), 14.0) * 1.4;
          col += vec3(0.55,0.85,1.0)*lines*0.4 + vec3(1.0)*spark*0.6*(1.0-depth*0.5);
          float fog = smoothstep(36.0, 100.0, distance(vP.xz, vec2(cx, 14.0)));
          gl_FragColor = vec4(mix(col, vec3(0.03,0.03,0.13), fog), 1.0);
        }` });
    this.water = new T.Mesh(new T.PlaneGeometry(150, 9.6), m); this.water.rotation.x = -Math.PI / 2; this.water.position.set(60, -0.05, -0.3); this.s.add(this.water);
    const L = 480, X = 100, floorM = std(0x0b0d2a, { roughness: 0.55, metalness: 0.3 }), rimM = std(0x161a40, { roughness: 0.4, metalness: 0.5 });
    const front = new T.Mesh(new T.PlaneGeometry(L, 30), floorM); front.rotation.x = -Math.PI / 2; front.position.set(X, 0.33, 19.6); front.receiveShadow = true; this.s.add(front);
    const back = new T.Mesh(new T.PlaneGeometry(L, 3.2), floorM); back.rotation.x = -Math.PI / 2; back.position.set(X, 0.33, -6.8); this.s.add(back);
    [[4.65, 0x00e5ff], [-5.25, 0x2f7bff]].forEach(([z, c]) => { const rm = new T.Mesh(new T.BoxGeometry(L, 0.75, 0.3), rimM); rm.position.set(X, -0.05, z); this.s.add(rm); const ln = new T.Mesh(new T.BoxGeometry(L, 0.05, 0.05), glow(c)); ln.position.set(X, 0.34, z + (z > 0 ? -0.16 : 0.16)); this.s.add(ln); });
    const deep = new T.Mesh(new T.PlaneGeometry(L, 60), std(0x04051a, { roughness: 1 })); deep.rotation.x = -Math.PI / 2; deep.position.set(X, -2.2, 0); this.s.add(deep);
  }
  // ---------------------------------------------------------------- Kulisse: Tribüne, Publikum, Bande, Rig
  buildSet() {
    const L = 480, X = 100;
    // Steile Tribüne mit Sitzreihen-Lichtern
    const tierM = std(0x14123e, { roughness: 0.85 }); this.tiers = [];
    for (let i = 0; i < 6; i++) { const y = 0.33 + i * 1.05, z = -8.6 - i * 1.5; this.tiers.push({ y: y + 0.52, z }); const t = new T.Mesh(new T.BoxGeometry(L, 1.05, 1.5), tierM); t.position.set(X, y, z); this.s.add(t); if (i % 2 === 0) { const e = new T.Mesh(new T.BoxGeometry(L, 0.04, 0.04), glow([0x00e5ff, 0xff2d95, 0x8b5cf6][i / 2])); e.position.set(X, y + 0.53, z + 0.76); this.s.add(e); } }
    // LED-Bande vor der Tribüne mit Lauftext
    const ad = cvs(1024, 64, (g, w, h) => { g.fillStyle = '#05071c'; g.fillRect(0, 0, w, h); g.font = '900 34px Inter,Arial,sans-serif'; g.textBaseline = 'middle'; const parts = [['FUNKPARCOURS', '#00e5ff'], ['◆', '#ff2d95'], ['PRÄSENTIERT VOM RICOREWI RADIOPORTAL', '#ffffff'], ['◆', '#ffd24a']]; let x = 16; for (const [s, c] of parts) { g.fillStyle = c; g.fillText(s, x, h / 2 + 2); x += g.measureText(s).width + 28; } });
    ad.wrapS = T.RepeatWrapping; ad.repeat.set(L / 22, 1); this.ad = ad;
    const board = new T.Mesh(new T.BoxGeometry(L, 1.0, 0.25), std(0x0b0d2a)); board.position.set(X, 0.83, -7.4); this.s.add(board);
    const face = new T.Mesh(new T.PlaneGeometry(L, 0.8), glow(0xffffff, { map: ad, fog: false })); face.position.set(X, 0.83, -7.26); this.s.add(face);
    // Publikum: wandert mit der Kamera mit (immer volle Ränge, gleiche Kosten)
    const n = 240; this.cdata = []; const bodyG = new T.BoxGeometry(0.6, 0.85, 0.45), headG = new T.SphereGeometry(0.26, 7, 5), armG = new T.BoxGeometry(0.12, 0.58, 0.12); armG.translate(0, -0.29, 0);
    this.bodies = new T.InstancedMesh(bodyG, new T.MeshLambertMaterial({ color: 0x6a7090 }), n); this.cheads = new T.InstancedMesh(headG, new T.MeshLambertMaterial({ color: 0x7a7a90 }), n); this.arms = new T.InstancedMesh(armG, new T.MeshLambertMaterial({ color: 0x8a7468 }), n * 2);
    const skin = [0xffd9b0, 0xe8b88a, 0xc68a5e, 0x8d5a3b, 0xf3c9a0], shirts = [0x00c8ea, 0xff2d95, 0xffd24a, 0xffffff, 0x8b5cf6, 0x2f7bff, 0xff7a1a, 0x1a1a2e];
    for (let i = 0; i < n; i++) { const tr = this.tiers[i % 6]; this.cdata.push({ bx: ((i / 6) | 0) * (CROWD_W / (n / 6)) + Math.random() * 0.9, y: tr.y, z: tr.z + (Math.random() - 0.5) * 0.3, ph: Math.random() * 6, sp: 0.8 + Math.random() * 0.6 }); COLTMP.setHex(shirts[(Math.random() * shirts.length) | 0]).offsetHSL(0, 0, (Math.random() - 0.5) * 0.15); this.bodies.setColorAt(i, COLTMP); COLTMP.setHex(skin[(Math.random() * skin.length) | 0]); this.cheads.setColorAt(i, COLTMP); }
    [this.bodies, this.cheads, this.arms].forEach(m => { m.frustumCulled = false; this.s.add(m); });
    // LED-Wand über der Tribüne mit laufendem Muster + Sender-Logos
    const led = cvs(512, 128, (g, w, h) => { g.fillStyle = '#060418'; g.fillRect(0, 0, w, h); for (let i = 0; i < 16; i++) { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, ['#00e5ff', '#2f7bff', '#8b5cf6', '#ff2d95'][i % 4]); gr.addColorStop(1, 'rgba(6,4,24,0)'); g.fillStyle = gr; g.globalAlpha = 0.7; g.fillRect(i * 32 + 4, h * (0.25 + 0.5 * Math.abs(Math.sin(i * 1.7))) * 0.7, 24, h); } g.globalAlpha = 1; });
    led.wrapS = led.wrapT = T.RepeatWrapping; led.repeat.set(L / 16, 1); this.led = led; const wall = new T.Mesh(new T.PlaneGeometry(L, 12), glow(0xffffff, { map: led })); wall.position.set(X, 14, -18.5); this.s.add(wall);
    const bm = new T.PlaneGeometry(4.2, 4.2), fr = new T.BoxGeometry(4.7, 4.7, 0.2); const loader = new T.TextureLoader();
    for (let i = 0; i < 34; i++) { const x = -24 + i * 11.5, f = new T.Mesh(fr, std(0x1a1650, { emissive: [0x0b3a5a, 0x5a0b3a, 0x0b1a5a][i % 3], metalness: 0.4 })); f.position.set(x, 12.6, -17.6); this.s.add(f); const m = new T.Mesh(bm, new T.MeshBasicMaterial({ color: 0xffffff })); m.position.set(x, 12.6, -17.45); this.s.add(m); loader.load(this.logos[i % this.logos.length], t => { m.material.map = t; m.material.needsUpdate = true; }); }
    // Licht-Rig über dem Becken (Traversen, Scheinwerfer, Lichtkegel, Blitzlichter): 150 m Stück, das in 15-m-Schritten mit der Kamera wandert
    const rig = new T.Group(); this.rig = rig; this.s.add(rig);
    const bs = new Beams(); [-5.6, 4.4].forEach(z => bs.truss([-75, 10.5, z], [75, 10.5, z])); rig.add(bs.mesh(steel()));
    const pars = new T.InstancedMesh(new T.CylinderGeometry(0.18, 0.24, 0.36, 8), glow(0xffffff), 40); let k = 0;
    for (let x = -75; x < 75; x += 7.5) for (const z of [-5.6, 4.4]) { DUMMY.position.set(x, 10.05, z); DUMMY.rotation.set(0, 0, 0); DUMMY.scale.set(1, 1, 1); DUMMY.updateMatrix(); pars.setMatrixAt(k, DUMMY.matrix); pars.setColorAt(k, COLTMP.setHex([0x00e5ff, 0xffffff, 0x2f7bff, 0xff2d95][k % 4])); k++; }
    pars.frustumCulled = false; rig.add(pars);
    this.cones = []; const cg = new T.ConeGeometry(1.7, 12, 14, 1, true); cg.translate(0, -6, 0);
    for (let i = 0; i < 10; i++) { const col = [0x00e5ff, 0x2f7bff, 0xffffff, 0x8b5cf6][i % 4], x = -75 + i * 15, cone = new T.Mesh(cg, new T.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.075, side: T.DoubleSide, depthWrite: false, blending: T.AdditiveBlending })); cone.position.set(x, 10.1, -5.6); rig.add(cone); this.cones.push({ cone, x }); }
    const N = 80, pos = new Float32Array(N * 3); for (let i = 0; i < N; i++) { pos[i * 3] = -75 + Math.random() * 150; pos[i * 3 + 1] = 1.6 + Math.random() * 6; pos[i * 3 + 2] = -8.6 - Math.random() * 7.5; }
    const pg = new T.BufferGeometry(); pg.setAttribute('position', new T.BufferAttribute(pos, 3)); this.flash = new T.Points(pg, new T.PointsMaterial({ map: puff(), color: 0xffffff, size: 1.0, transparent: true, opacity: 0.7, depthWrite: false, blending: T.AdditiveBlending })); this.flash.frustumCulled = false; rig.add(this.flash);
  }
  // ---------------------------------------------------------------- Läufer (Figuren mit Gelenken)
  makeRunner(color, logo, ci = 0) {
    const ch = CHARS[((ci % CHARS.length) + CHARS.length) % CHARS.length], bw = ch.build;
    const g = new T.Group(), body = new T.Group(); g.add(body);
    const skin = std(ch.skin, { roughness: 0.65, metalness: 0 }), shirt = std(color, { roughness: 0.5, metalness: 0.05 }), hairM = std(ch.hc, { roughness: 0.85, metalness: 0 });
    const pants = C('pants', () => std(0x161d3a, { roughness: 0.7 })), shoe = C('shoe', () => std(0xf5f5ff, { roughness: 0.4 })), sole = C('sole', () => std(0x00c8ea, { emissive: 0x004455, roughness: 0.4 }));
    const geo = (k, f) => C('g' + k, f), mesh = (gm, mat, par, x = 0, y = 0, z = 0) => { const m = new T.Mesh(gm, mat); m.position.set(x, y, z); par.add(m); return m; };
    const limb = (par, x, y, len, rad, mat) => { const p = new T.Group(); p.position.set(x, y, 0); par.add(p); mesh(geo('l' + len + rad, () => new T.CylinderGeometry(rad, rad * 0.85, len, 10)), mat, p, 0, -len / 2, 0); const e = new T.Group(); e.position.y = -len; p.add(e); mesh(geo('j' + rad, () => new T.SphereGeometry(rad, 10, 8)), mat, p); return { p, e }; };
    // Becken + Oberkörper (Oberkörper kippt um die Hüfte)
    const pelvis = mesh(geo('pelvis', () => new T.CylinderGeometry(0.19, 0.2, 0.22, 12)), pants, body, 0, 0.98, 0); pelvis.scale.set(bw, 1, 0.8);
    const chest = new T.Group(); chest.position.y = 0.97; body.add(chest);
    const torso = mesh(geo('torso', () => new T.CylinderGeometry(0.25, 0.18, 0.52, 14)), shirt, chest, 0, 0.29, 0); torso.scale.set(bw, 1, 0.68);
    if (ch.top === 'tank') { const tm = mesh(geo('trim', () => new T.TorusGeometry(0.115, 0.018, 6, 16, Math.PI)), C('trimM', () => glow(0xffffff)), chest, 0, 0.53, 0.07); tm.rotation.x = -0.3; tm.rotation.z = Math.PI; }
    mesh(geo('neck', () => new T.CylinderGeometry(0.065, 0.075, 0.12, 8)), skin, chest, 0, 0.6, 0);
    const head = new T.Group(); head.position.y = 0.74; chest.add(head);
    mesh(geo('head', () => new T.SphereGeometry(0.17, 18, 14)), skin, head).scale.set(1, 1.1, 1);
    const faceTex = C('face' + (ch.beard ? 'b' : ''), () => cvs(128, 96, (gx, W, H) => { gx.fillStyle = '#ffffff'; [[42, 40], [86, 40]].forEach(([x, y]) => { gx.beginPath(); gx.ellipse(x, y, 10, 12, 0, 0, 7); gx.fill(); }); gx.fillStyle = '#14162e'; [[45, 42], [89, 42]].forEach(([x, y]) => { gx.beginPath(); gx.arc(x, y, 6.5, 0, 7); gx.fill(); }); gx.strokeStyle = '#2a1a12'; gx.lineWidth = 5; gx.lineCap = 'round'; [[30, 22, 52, 19], [76, 19, 98, 22]].forEach(([a, b, c, d]) => { gx.beginPath(); gx.moveTo(a, b); gx.lineTo(c, d); gx.stroke(); }); if (!ch.beard) { gx.strokeStyle = '#7a2a2a'; gx.lineWidth = 4; gx.beginPath(); gx.arc(64, 62, 13, 0.3, Math.PI - 0.3); gx.stroke(); } }));
    const face = mesh(geo('faceP', () => new T.PlaneGeometry(0.24, 0.18)), C('faceM' + (ch.beard ? 'b' : ''), () => new T.MeshBasicMaterial({ map: faceTex, transparent: true, depthWrite: false })), head, 0, 0.0, 0.172);
    face.renderOrder = 2;
    const cap = (th, r = 0.178) => geo('hair' + th + r, () => new T.SphereGeometry(r, 18, 10, 0, Math.PI * 2, 0, Math.PI * th));
    let tail = null;
    if (ch.hair !== 'bald' && ch.hair !== 'cap') { const hm = mesh(cap(ch.hair === 'buzz' ? 0.36 : 0.44), hairM, head, 0, 0.02, -0.012); hm.scale.set(1.02, 1.1, 1.04); hm.rotation.x = -0.25; }
    if (ch.hair === 'ponytail') { tail = new T.Group(); tail.position.set(0, 0.1, -0.15); head.add(tail); mesh(geo('tail', () => new T.CylinderGeometry(0.055, 0.025, 0.3, 8)), hairM, tail, 0, -0.15, 0); }
    if (ch.hair === 'bun') mesh(geo('bun', () => new T.SphereGeometry(0.08, 10, 8)), hairM, head, 0, 0.17, -0.1);
    if (ch.hair === 'long') mesh(geo('long', () => new T.BoxGeometry(0.3, 0.34, 0.08)), hairM, head, 0, -0.1, -0.13);
    if (ch.hair === 'mohawk') mesh(geo('mohawk', () => new T.BoxGeometry(0.05, 0.11, 0.3)), hairM, head, 0, 0.18, -0.02);
    if (ch.hair === 'cap') { const cm = std(color, { roughness: 0.6 }); mesh(cap(0.42, 0.182), cm, head, 0, 0.03, 0).rotation.x = -0.15; mesh(geo('brim', () => new T.BoxGeometry(0.22, 0.025, 0.14)), cm, head, 0, 0.07, 0.2); }
    if (ch.beard) { const bd = mesh(geo('beard', () => new T.SphereGeometry(0.172, 14, 8, 0, Math.PI * 2, Math.PI * 0.55, Math.PI * 0.42)), hairM, head, 0, -0.01, 0.012); bd.scale.set(1.02, 1.1, 1.05); }
    // Brustlogo
    const decal = mesh(C('decal', () => new T.PlaneGeometry(0.24, 0.24)), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true }), chest, 0, 0.32, 0.25 * 0.68 + 0.012);
    // Arme (Schulter → Ellbogen → Hand) und Beine (Hüfte → Knie → Fuß)
    const sx = 0.27 * bw, armR = 0.058 * bw;
    const mkArm = side => { const up = limb(chest, side * sx, 0.48, 0.29, armR, skin), lo = limb(up.e, 0, 0, 0.27, armR * 0.85, skin); mesh(geo('hand', () => new T.SphereGeometry(0.058, 10, 8)), skin, lo.e); if (ch.top === 'tee') mesh(geo('sleeve' + bw, () => new T.CylinderGeometry(armR + 0.022, armR + 0.016, 0.14, 10)), shirt, up.p, 0, -0.06, 0); return { sh: up.p, el: lo.p }; };
    const mkLeg = side => { const th = limb(body, side * 0.105 * bw, 0.94, 0.45, 0.082 * bw, skin), sh = limb(th.e, 0, 0, 0.42, 0.064 * bw, skin); mesh(geo('short' + bw, () => new T.CylinderGeometry(0.098 * bw, 0.092 * bw, 0.2, 10)), pants, th.p, 0, -0.08, 0); mesh(geo('foot', () => new T.BoxGeometry(0.13, 0.08, 0.27)), shoe, sh.e, 0, -0.035, 0.05); mesh(geo('sole', () => new T.BoxGeometry(0.135, 0.025, 0.275)), sole, sh.e, 0, -0.07, 0.05); return { hip: th.p, knee: sh.p }; };
    const aL = mkArm(-1), aR = mkArm(1), lL = mkLeg(-1), lR = mkLeg(1);
    g.traverse(o => { if (o.isMesh && o !== face) o.castShadow = true; });
    const r = { g, body, chest, head, tail, aL, aR, lL, lR, shirt, decal, own: [skin, shirt, hairM, decal.material], ci, face: 1, prevX: 0, phase: 0 }; this.setLogo(r, logo); return r;
  }
  disposeRunner(r) { this.s.remove(r.g); r.own.forEach(m => { if (m.map && m.map !== cache.puff) m.map.dispose(); m.dispose(); }); r.g.traverse(o => { if (o.isMesh && !Object.values(cache).includes(o.material)) o.material.dispose(); }); }
  setLogo(r, i) { new T.TextureLoader().load(this.logos[i % this.logos.length], t => { if (r.decal.material.map) r.decal.material.map.dispose(); r.decal.material.map = t; r.decal.material.needsUpdate = true; }); }
  setLook(color, logo, ci) { if (ci != null && ci !== this.runner.ci) { const x = this.runner.prevX; this.disposeRunner(this.runner); this.runner = this.makeRunner(color, logo, ci); this.runner.prevX = x; this.s.add(this.runner.g); return; } this.runner.shirt.color.setHex(color); this.setLogo(this.runner, logo); }
  // ---------------------------------------------------------------- Parcours
  setCourse(c) {
    this.course = c; const keep = new Set(Object.values(cache)); while (this.root.children.length) { const ch = this.root.children[0]; this.root.remove(ch); ch.traverse(o => { if (o.geometry && !keep.has(o.geometry) && o.geometry !== cache.ubox) o.geometry.dispose(); const ms = o.material ? [].concat(o.material) : []; ms.forEach(m => { if (!keep.has(m)) { if (m.map && m.map !== cache.puff) m.map.dispose(); m.dispose(); } }); }); }
    this.dyn = []; this.rings = []; this.heads = []; this.pots = []; this.buzzer = null; this.clock = null;
    const metal = C('metal', () => std(0x2a2f55, { metalness: 0.6, roughness: 0.35 })), pole = C('pole', () => std(0x3a4170, { metalness: 0.6, roughness: 0.35 })), mat = C('mat', () => std(0x1d2147, { roughness: 0.75, metalness: 0.05 })), bs = new Beams();
    c.o.forEach((o, i) => {
      if (o.k === 'plat' || o.k === 'move' || o.k === 'sink') {
        const w = o.w, acc = o.k === 'move' ? COL.y : o.k === 'sink' ? COL.o : i === 0 ? COL.b : COL.a, g = new T.Group();
        const body = new T.Mesh(new T.BoxGeometry(w, 0.5, 4), metal); g.add(body);
        const top = new T.Mesh(new T.BoxGeometry(w - 0.12, 0.1, 3.88), mat); top.position.y = 0.28; top.receiveShadow = true; g.add(top);
        const band = new T.Mesh(new T.BoxGeometry(w + 0.02, 0.16, 0.04), glow(acc)); band.position.set(0, 0.12, 2.02); g.add(band);
        [-1, 1].forEach(sd => { const e = new T.Mesh(new T.BoxGeometry(w, 0.05, 0.08), glow(acc)); e.position.set(0, 0.33, sd * 1.94); g.add(e); const s2 = new T.Mesh(new T.BoxGeometry(0.08, 0.05, 3.88), glow(acc)); s2.position.set(sd * (w / 2 - 0.04), 0.33, 0); g.add(s2); });
        if (o.k === 'sink') for (let k = -1; k <= 1; k++) { const cr = new T.Mesh(new T.BoxGeometry(0.05, 0.03, 3.4), glow(0xff5a00)); cr.position.set(k * w * 0.27, 0.34, 0); cr.rotation.y = k * 0.12; g.add(cr); }
        if (o.k === 'plat') { const p = new T.Mesh(new T.CylinderGeometry(0.24, 0.3, 3, 10), pole); p.position.y = -1.75; g.add(p); const rg = new T.Mesh(new T.RingGeometry(0.5, 0.75, 20), new T.MeshBasicMaterial({ color: 0xcdeaff, transparent: true, opacity: 0.5, side: T.DoubleSide, depthWrite: false })); rg.rotation.x = -Math.PI / 2; rg.position.set(o.x + w / 2, 0.02, 0); this.root.add(rg); this.rings.push({ m: rg, ph: i }); }
        g.traverse(m => { if (m.isMesh) m.castShadow = m === body || m === top; });
        g.position.set(o.x + w / 2, o.y - 0.25, 0); this.root.add(g); this.dyn.push({ o, m: g, i });
      } else if (o.k === 'swing') {
        const grp = new T.Group(); bs.add(o.px, o.py, -2.4, o.px, o.py, 2.4, 0.3); bs.add(o.px, o.py, -2.4, o.px, 10.5, -5.6, 0.12);
        const rope = new T.Mesh(new T.CylinderGeometry(0.035, 0.035, o.len, 6), std(0xcfd6ff, { metalness: 0.8, roughness: 0.3 })); rope.position.y = -o.len / 2; grp.add(rope);
        const ball = new T.Mesh(new T.SphereGeometry(o.r, 22, 16), std(0xd8202a, { emissive: 0x440000, roughness: 0.25, metalness: 0.5 })); ball.position.y = -o.len; ball.castShadow = true; grp.add(ball);
        const ring = new T.Mesh(new T.TorusGeometry(o.r * 0.98, 0.06, 8, 28), glow(0xffd24a)); ring.position.y = -o.len; grp.add(ring);
        const halo = new T.Sprite(new T.SpriteMaterial({ map: puff(), color: 0xff4040, transparent: true, opacity: 0.45, blending: T.AdditiveBlending, depthWrite: false })); halo.scale.setScalar(o.r * 4.5); halo.position.y = -o.len; grp.add(halo);
        grp.position.set(o.px, o.py, 0); this.root.add(grp); this.dyn.push({ o, m: grp, i });
      } else if (o.k === 'bars') {
        const len = o.x2 - o.x1, bar = new T.Mesh(new T.CylinderGeometry(0.07, 0.07, len, 10), std(0xffd24a, { emissive: 0x443300, metalness: 0.7, roughness: 0.25 })); bar.rotation.z = Math.PI / 2; bar.position.set((o.x1 + o.x2) / 2, o.y, 0); bar.castShadow = true; this.root.add(bar);
        for (let k = 0; k <= len; k += 1.5) { const rg = new T.Mesh(new T.TorusGeometry(0.22, 0.045, 8, 16), std(0xff2d95, { emissive: 0x550022, metalness: 0.4, roughness: 0.3 })); rg.position.set(o.x1 + k, o.y, 0); this.root.add(rg); }
        [o.x1, o.x2].forEach(x => bs.truss([x, -0.2, -2.2], [x, o.y + 3.6, -2.2], 0.4)); bs.truss([o.x1 - 0.2, o.y + 3.6, -2.2], [o.x2 + 0.2, o.y + 3.6, -2.2], 0.4); for (let x = o.x1; x <= o.x2 + 0.01; x += 1.5) bs.add(x, o.y, 0, x, o.y + 3.4, -2.2, 0.04);
      } else if (o.k === 'wall') this.buildWall(o, bs);
      else if (o.k === 'finish') this.buildFinish(o, bs);
    });
    // Startturm und Hindernis-Portale mit LED-Schildern
    const s0 = c.o[0]; this.gantry(bs, 0.6, 'Start', '#ff2d95'); [-1.6, 1.6].forEach(z => this.pot(1.0, s0.y, z));
    let last = 0.6; for (const s of c.secs || []) { if (s.x - last < 7) continue; last = s.x; this.gantry(bs, s.x, s.n, '#00e5ff'); }
    // Beckenende
    const capM = C('capM', () => std(0x0b0d2a, { roughness: 0.55, metalness: 0.3 }));
    [[-12 - 40, 80], [c.length + 14 + 40, 80]].forEach(([x, w]) => { const cp = new T.Mesh(new T.BoxGeometry(w, 0.76, 9.9), capM); cp.position.set(x, -0.05, -0.3); this.root.add(cp); });
    this.root.add(bs.mesh(steel()));
  }
  gantry(bs, x, name, edge) {
    bs.truss([x, 0.3, -5.6], [x, 10.5, -5.6]); bs.truss([x, 10.5, -5.6], [x, 10.5, 4.4]);
    const tex = sign(name, 512, 96, '#ffffff', edge), sg = new T.Mesh(new T.PlaneGeometry(5.4, 1.01), new T.MeshBasicMaterial({ map: tex, fog: false })); sg.position.set(x, 6.5, -1.2); this.root.add(sg);
    [-2.4, 2.4].forEach(dx => bs.add(x + dx, 7.0, -1.2, x + dx, 10.2, -1.2, 0.03));
    [-2.6, 2.6].forEach(z => { const lamp = new T.Mesh(C('headG', () => new T.CylinderGeometry(0.22, 0.3, 0.45, 10)), C('headM', () => std(0x1a1d33, { metalness: 0.7, roughness: 0.3 }))); lamp.position.set(x, 10.0, z); this.root.add(lamp);
      const col = z < 0 ? 0x00e5ff : 0xffffff, cone = new T.Mesh(C('beamG', () => { const g = new T.ConeGeometry(1.3, 10, 14, 1, true); g.translate(0, -5, 0); return g; }), new T.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.085, side: T.DoubleSide, depthWrite: false, blending: T.AdditiveBlending })); cone.position.set(x, 9.8, z); cone.visible = !this.lowFx; this.root.add(cone); this.heads.push({ cone, ph: x * 0.37 + z }); });
  }
  pot(x, y, z) { const p = new T.Mesh(C('potG', () => new T.CylinderGeometry(0.2, 0.26, 0.3, 10)), C('potM', () => std(0x22263f, { metalness: 0.8, roughness: 0.3, emissive: 0x331100 }))); p.position.set(x, y + 0.15, z); this.root.add(p); this.pots.push({ x, y: y + 0.3, z }); }
  buildFinish(o, bs) {
    const ped = new T.Mesh(new T.CylinderGeometry(0.16, 0.22, 1.15, 12), steel()); ped.position.set(o.x + 0.9, o.y + 0.58, -0.6); this.root.add(ped);
    const b = new T.Mesh(new T.CylinderGeometry(0.34, 0.4, 0.22, 20), std(0xff2d2d, { emissive: 0x990000, roughness: 0.3 })); b.position.set(o.x + 0.9, o.y + 1.24, -0.6); b.castShadow = true; this.root.add(b); this.buzzer = b;
    const halo = new T.Sprite(new T.SpriteMaterial({ map: puff(), color: 0xff4040, transparent: true, opacity: 0.8, blending: T.AdditiveBlending, depthWrite: false })); halo.scale.setScalar(2.4); halo.position.set(o.x + 0.9, o.y + 1.4, -0.4); this.root.add(halo);
    bs.truss([o.x + 2.2, o.y, -1.8], [o.x + 2.2, o.y + 6.2, -1.8], 0.45); bs.truss([o.x - 2.4, o.y + 6.2, -1.8], [o.x + 2.6, o.y + 6.2, -1.8], 0.45);
    const zs = new T.Mesh(new T.PlaneGeometry(3.4, 0.64), new T.MeshBasicMaterial({ map: sign('Ziel', 512, 96, '#ffd24a', '#ff2d95'), fog: false })); zs.position.set(o.x, o.y + 6.95, -1.5); this.root.add(zs);
    this.clockTex = cvs(256, 80, () => {}); this.clockCtx = this.clockTex.image.getContext('2d'); this.drawClock(0);
    const ck = new T.Mesh(new T.PlaneGeometry(3.4, 1.06), new T.MeshBasicMaterial({ map: this.clockTex, fog: false })); ck.position.set(o.x, o.y + 5.4, -1.5); this.root.add(ck); this.clock = ck;
    [-1.4, 2.0].forEach(dx => [-1.6, 1.6].forEach(z => this.pot(o.x + dx, o.y, z)));
  }
  drawClock(t) { const g = this.clockCtx, W = 256, H = 80; g.fillStyle = '#05071c'; g.fillRect(0, 0, W, H); g.strokeStyle = '#ffd24a'; g.lineWidth = 4; g.strokeRect(3, 3, W - 6, H - 6); g.fillStyle = '#ffd24a'; g.font = '900 52px Inter,Arial,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(fmtTime(t), W / 2, H / 2 + 3); this.clockTex.needsUpdate = true; }
  buildWall(o, bs) {
    const N = 26, W = 4, pts = []; for (let k = 0; k <= N; k++) { const u = k / N; pts.push([o.x - 2.6 * Math.pow(1 - u, 2), o.y + o.h * u]); }
    const sh = new T.Shape(); sh.moveTo(o.x - 2.6, -1.8); pts.forEach(p => sh.lineTo(p[0] - 0.02, p[1] - 0.02)); sh.lineTo(o.x + o.w, o.y + o.h); sh.lineTo(o.x + o.w, -1.8); sh.lineTo(o.x - 2.6, -1.8);
    const body = new T.Mesh(new T.ExtrudeGeometry(sh, { depth: W, bevelEnabled: false }), std(0x1a1f45, { roughness: 0.5, metalness: 0.35 })); body.position.z = -W / 2; body.castShadow = true; this.root.add(body);
    const tex = cvs(256, 256, (g, w, h) => { g.fillStyle = '#20265a'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 3; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, h); g.stroke(); g.beginPath(); g.moveTo(0, i * 64); g.lineTo(w, i * 64); g.stroke(); } g.fillStyle = 'rgba(0,229,255,.25)'; g.fillRect(0, 0, w, 10); });
    tex.wrapS = tex.wrapT = T.RepeatWrapping; tex.repeat.set(0.5, 0.5);
    const face = new T.Mesh(new T.ShapeGeometry(sh), new T.MeshStandardMaterial({ map: tex, roughness: 0.45, metalness: 0.2 })); face.position.z = W / 2 + 0.01; this.root.add(face);
    for (let k = 3; k < N; k += 4) { const p = pts[k]; const h = new T.Mesh(new T.BoxGeometry(0.06, 0.06, 0.4), glow(0x00e5ff)); h.position.set(p[0] + 0.02, p[1], W / 2 - 0.1); this.root.add(h); }
    const edge = new T.Mesh(new T.BoxGeometry(o.w + 0.1, 0.1, W + 0.1), glow(0xffd24a)); edge.position.set(o.x + o.w / 2, o.y + o.h + 0.03, 0); this.root.add(edge);
    bs.truss([o.x + 3.8, -0.2, -2.2], [o.x + 3.8, o.y + o.h, -2.2], 0.45);
  }
  // ---------------------------------------------------------------- Bild
  setGhost(frames) {
    this.ghostFrames = frames;
    if (frames && !this.ghost) { this.ghost = this.makeRunner(0x9fe8ff, 0, 0); this.ghost.g.traverse(o => { if (o.isMesh) { o.castShadow = false; o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.38; o.material.depthWrite = false; if (o.material.emissive) o.material.emissive.setHex(0x2a8aa8); } }); this.s.add(this.ghost.g); }
    if (this.ghost) this.ghost.g.visible = !!frames;
  }
  pose(r, x, y, sim) {
    const g = r.g, t = this.time; g.position.set(x, y, 0); const dx = x - r.prevX; r.prevX = x; const mov = Math.abs(dx) > 0.001; r.phase += Math.abs(dx) * 4.6; const face = sim ? sim.face : r.face; r.face = face; r.body.rotation.set(0, face > 0 ? 1.15 : -1.15, 0);
    let st = 'run'; if (sim) { if (sim.dead) st = 'fall'; else if (sim.finished) st = 'win'; else if (sim.hang) st = 'hang'; else if (sim.wall) st = 'wall'; else if (!sim.onGround) st = sim.vy > 0 ? 'air' : 'drop'; else if (!mov) st = 'idle'; } else if (!mov) st = 'idle';
    const { aL, aR, lL, lR, chest } = r, set = (j, x2, z2 = 0) => { j.rotation.set(x2, 0, z2); };
    const sw = Math.sin(r.phase), cw = Math.cos(r.phase), spd = sim ? Math.min(1, Math.abs(sim.vx) / 5.6) : 0.6;
    chest.rotation.set(0, 0, 0); r.head.rotation.set(0, 0, 0);
    if (st === 'run' || st === 'wall') {
      const k = st === 'wall' ? 1.15 : 0.55 + spd * 0.45, ph = st === 'wall' ? t * 22 : r.phase, s2 = Math.sin(ph), c2 = Math.cos(ph);
      set(lL.hip, -s2 * 0.95 * k); set(lR.hip, s2 * 0.95 * k); set(lL.knee, 0.15 + Math.max(0, c2) * 1.5 * k); set(lR.knee, 0.15 + Math.max(0, -c2) * 1.5 * k);
      set(aL.sh, s2 * 0.9 * k, 0.08); set(aR.sh, -s2 * 0.9 * k, -0.08); set(aL.el, -1.45); set(aR.el, -1.45);
      chest.rotation.x = (st === 'wall' ? 0.55 : 0.12 + spd * 0.2); g.position.y += Math.abs(s2) * 0.07 * k;
    } else if (st === 'air') { set(lL.hip, -1.2); set(lL.knee, 1.5); set(lR.hip, -0.3); set(lR.knee, 0.9); set(aL.sh, -2.6, 0.2); set(aR.sh, -2.3, -0.2); set(aL.el, -0.3); set(aR.el, -0.3); chest.rotation.x = 0.15; }
    else if (st === 'drop') { set(lL.hip, -0.7); set(lL.knee, 0.8); set(lR.hip, -0.35); set(lR.knee, 0.5); set(aL.sh, -1.2, 0.9); set(aR.sh, -1.0, -0.9); set(aL.el, -0.5); set(aR.el, -0.5); chest.rotation.x = 0.1; }
    else if (st === 'hang') { const hm = sim && sim.vx ? Math.sin(t * 9) : 0, swg = Math.sin(t * 4) * 0.18; set(aL.sh, Math.PI - 0.15 + hm * 0.35, 0.12); set(aR.sh, Math.PI - 0.15 - hm * 0.35, -0.12); set(aL.el, -0.15 - Math.max(0, hm) * 0.6); set(aR.el, -0.15 - Math.max(0, -hm) * 0.6); set(lL.hip, -0.35 + swg); set(lR.hip, -0.15 + swg); set(lL.knee, 0.6); set(lR.knee, 0.35); chest.rotation.x = -0.05; g.position.y -= 0.36; }
    else if (st === 'win') { const j = Math.abs(Math.sin(t * 8)); set(aL.sh, Math.PI * 0.92, 0.5); set(aR.sh, Math.PI * 0.92, -0.5); set(aL.el, -0.2); set(aR.el, -0.2); set(lL.hip, -0.3 * j); set(lR.hip, -0.3 * j); set(lL.knee, 0.6 * j); set(lR.knee, 0.6 * j); g.position.y += j * 0.25; r.body.rotation.y = 0; }
    else if (st === 'fall') { r.body.rotation.z = t * 7; set(aL.sh, 2.6 + Math.sin(t * 20) * 0.6, 0.5); set(aR.sh, 2.6 - Math.sin(t * 20) * 0.6, -0.5); set(aL.el, -0.4); set(aR.el, -0.4); set(lL.hip, -0.6); set(lR.hip, 0.3); set(lL.knee, 1.0); set(lR.knee, 0.4); }
    else { const b = Math.sin(t * 2.2); set(aL.sh, 0.05 + b * 0.04, 0.14); set(aR.sh, 0.05 - b * 0.04, -0.14); set(aL.el, -0.25); set(aR.el, -0.25); set(lL.hip, -0.05); set(lR.hip, 0.05); set(lL.knee, 0.08); set(lR.knee, 0.08); chest.rotation.x = 0.03 + b * 0.015; g.position.y += (b + 1) * 0.005; r.head.rotation.y = Math.sin(t * 0.7) * 0.35; }
    if (r.tail) r.tail.rotation.x = 0.3 + (st === 'run' ? 0.5 + Math.sin(r.phase * 2) * 0.25 : st === 'air' || st === 'drop' ? -0.4 : 0.05);
    if (sim && sim.stun > 0) r.body.rotation.z = Math.sin(t * 40) * 0.25;
    return st;
  }
  adapt(dt) {   // Qualität senken, wenn das Gerät nicht hinterherkommt
    this.fpsT += dt; this.fpsN++; if (this.fpsT < 1.5) return; const fps = this.fpsN / this.fpsT; this.fpsT = 0; this.fpsN = 0;
    if (fps < 24 && dt < 0.2) { this.slow++; if (this.slow >= 2) { this.slow = 0; if (this.pr > 1) { this.pr = Math.max(1, this.pr - 0.5); this.resize(); } else if (this.sun.castShadow) { this.sun.castShadow = false; this.r.shadowMap.enabled = false; this.s.traverse(o => { if (o.material) o.material.needsUpdate = true; }); } else if (!this.lowFx) { this.lowFx = true; this.flash.visible = false; this.cones.forEach(c => { c.cone.visible = false; }); this.heads.forEach(h => { h.cone.visible = false; }); } } } else this.slow = 0;
  }
  /** sim: laufende Simulation (oder null), ghostPos: [x,y] oder null */
  frame(sim, dt, ghostPos, idleX) {
    this.time += dt; const t = sim ? sim.t : this.time; this.wu.t.value = this.time;
    for (const d of this.dyn) { const o = d.o; if (o.k === 'move') { const p = movePos(o, t); d.m.position.set(p.x + o.w / 2, p.y - 0.25, 0); } else if (o.k === 'sink') { const k = sim && sim.sinks[d.i]; d.m.position.y = o.y - 0.25 + (k ? k.y : 0); d.m.visible = !(k && k.gone); if (k && k.touch >= 0 && !k.gone && sim.t - k.touch < o.delay) d.m.position.x = o.x + o.w / 2 + Math.sin(this.time * 70) * 0.03; else d.m.position.x = o.x + o.w / 2; } else if (o.k === 'swing') d.m.rotation.z = swingBall(o, t).a; }
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
    if (this.clock && (this.clockT -= dt) <= 0) { this.clockT = 0.1; this.drawClock(sim ? sim.t : 0); }
    // Kamera: leichte Vorausschau, Tempo-Zoom, Wackeln
    const vx = sim ? sim.vx || 0 : 0, tx = x + 3.0 + vx * 0.15, ty = (sim ? Math.max(sim.y, 1) : 1.4) + 1.0; this.cx += (tx - this.cx) * Math.min(1, dt * 4.5); this.cy += (ty - this.cy) * Math.min(1, dt * 3.5);
    this.shake = Math.max(0, this.shake - dt * 1.4); const sk = this.shake, sx = (Math.random() - 0.5) * sk, sy = (Math.random() - 0.5) * sk;
    this.cam.position.set(this.cx - 1.6 + sx, this.cy + 3.6 + sy, this.dist); this.cam.lookAt(this.cx, this.cy - 0.1, 0); const fov = this.baseFov + Math.min(5, Math.abs(vx) * 0.6); if (Math.abs(fov - this.cam.fov) > 0.05) { this.cam.fov += (fov - this.cam.fov) * Math.min(1, dt * 3); this.cam.updateProjectionMatrix(); }
    this.sun.position.set(this.cx + 8, 15, 11); this.sun.target.position.set(this.cx, 0, 0); this.rim.position.set(this.cx, 6, -6); this.wu.cx.value = this.cx; this.water.position.x = this.cx + 20; if (this.led) this.led.offset.x += dt * 0.05; if (this.ad) this.ad.offset.x += dt * 0.04;
    if (this.buzzer) this.buzzer.scale.y = 1 + Math.sin(this.time * 6) * 0.12;
    if (this.boom.intensity > 0) this.boom.intensity = Math.max(0, this.boom.intensity - dt * 4);
    // Scheinwerfer + Blitzlichter
    this.rig.position.x = Math.round(this.cx / 15) * 15; this.cones.forEach(c => { const ph = (c.x + this.rig.position.x) * 0.06; c.cone.rotation.z = Math.sin(this.time * 0.8 + ph) * 0.35; c.cone.rotation.x = 0.35 + Math.cos(this.time * 0.6 + ph) * 0.15; });
    this.heads.forEach(h => { h.cone.rotation.z = Math.sin(this.time * 0.9 + h.ph) * 0.45; h.cone.rotation.x = Math.cos(this.time * 0.7 + h.ph) * 0.25; });
    this.flash.material.opacity = 0.45 + 0.3 * Math.sin(this.time * 17) * Math.sin(this.time * 5.3);
    // Publikum (läuft mit der Kamera mit)
    const e = this.energy; this.energy = Math.max(0.25, this.energy - dt * 0.15); const bm = DUMMY, x0 = this.cx - CROWD_W / 2;
    bm.scale.set(1, 1, 1);
    for (let i = 0; i < this.cdata.length; i++) {
      const c = this.cdata[i], cx = x0 + ((((c.bx - x0) % CROWD_W) + CROWD_W) % CROWD_W);
      const b = Math.abs(Math.sin(this.time * (2 + e * 4) * c.sp + c.ph)) * (0.08 + e * 0.4);
      bm.rotation.set(0, 0, 0); bm.position.set(cx, c.y + 0.42 + b, c.z); bm.updateMatrix(); this.bodies.setMatrixAt(i, bm.matrix); bm.position.set(cx, c.y + 1.1 + b, c.z); bm.updateMatrix(); this.cheads.setMatrixAt(i, bm.matrix);
      const up = 0.1 + Math.max(0, e - 0.3) * 3.6 + Math.sin(this.time * 6 * c.sp + c.ph) * 0.3 * e;   // Arme: runter → hoch bei Begeisterung
      for (let k = 0; k < 2; k++) { const sd = k ? 1 : -1; bm.rotation.set(0, 0, sd * Math.min(2.9, up)); bm.position.set(cx + sd * 0.36, c.y + 0.76 + b, c.z); bm.updateMatrix(); this.arms.setMatrixAt(i * 2 + k, bm.matrix); }
    }
    this.bodies.instanceMatrix.needsUpdate = this.cheads.instanceMatrix.needsUpdate = this.arms.instanceMatrix.needsUpdate = true;
    // Partikel
    for (let i = this.live.length - 1; i >= 0; i--) { const p = this.live[i]; p.life -= dt; p.vy -= p.g * dt; const s = p.sp; s.position.x += p.vx * dt; s.position.y += p.vy * dt; s.position.z += p.vz * dt; if (p.grow) s.scale.addScalar(p.grow * dt); if (p.spin) s.material.rotation += 9 * dt; s.material.opacity = p.a * Math.max(0, p.life / p.max); if (p.life <= 0 || (p.g > 5 && s.position.y < -0.1 && p.vy < 0)) { s.visible = false; this.pool.push(s); this.live.splice(i, 1); } }
    this.r.render(this.s, this.cam); this.adapt(dt);
  }
}
