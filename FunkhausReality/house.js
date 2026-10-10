/* Funkhaus – 3D-Haus (Three.js r128): aufgeschnittenes Haus mit sechs Räumen, Figuren mit Laufwegen und Posen, Tag/Nacht,
   Kamera die den Szenen folgt, Publikum vor der Tür. Qualität passt sich selbst an. */
const T = window.THREE;
export const ROOMS = { schlaf: { c: 0, r: 0 }, studio: { c: 1, r: 0 }, beicht: { c: 2, r: 0 }, kueche: { c: 0, r: 1 }, wohn: { c: 1, r: 1 }, garten: { c: 2, r: 1 } };
const RW = 8, RD = 6, DOOR = 1.3;
const SLOT = [[-2.3, -0.3], [2.3, -0.3], [-2.3, 1.5], [2.3, 1.5], [0, 0.9], [0, -1.7]];
export const centerOf = room => { const R = ROOMS[room]; return { x: (R.c - 1) * RW, z: R.r === 0 ? -RD / 2 : RD / 2 }; };
const slotPos = (room, k) => { const c = centerOf(room), s = SLOT[k % SLOT.length]; return { x: c.x + s[0], z: c.z + s[1] }; };
const cache = {}, C = (k, f) => cache[k] || (cache[k] = f());
const std = (c, o) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.6, metalness: 0.05 }, o || {}));
const glow = (c, o) => new T.MeshBasicMaterial(Object.assign({ color: c }, o || {}));
const cvs = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); return new T.CanvasTexture(c); };
const emojiTex = e => C('emo' + e, () => cvs(96, 96, (g, w, h) => { g.font = '64px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(e, w / 2, h / 2 + 4); }));
const puff = () => C('puff', () => cvs(64, 64, g => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); }));
const box = (p, w, h, d, c, x, y, z, o) => { const m = new T.Mesh(new T.BoxGeometry(w, h, d), o && o.basic ? glow(c) : std(c, o)); m.position.set(x, y + h / 2, z); m.castShadow = true; m.receiveShadow = true; p.add(m); return m; };
const cyl = (p, rt, rb, h, c, x, y, z, o) => { const m = new T.Mesh(new T.CylinderGeometry(rt, rb, h, 14), std(c, o)); m.position.set(x, y + h / 2, z); m.castShadow = true; p.add(m); return m; };
const lerp = (a, b, t) => a + (b - a) * t;
const hex = s => parseInt(s.slice(1), 16);

export class House {
  constructor(cv) {
    this.cv = cv; const coarse = matchMedia('(pointer:coarse)').matches; this.fast = () => window.__fhFast || 1;
    this.r = new T.WebGLRenderer({ canvas: cv, antialias: !coarse, powerPreference: 'high-performance' }); this.pr = Math.min(devicePixelRatio || 1, 2); this.r.setPixelRatio(this.pr);
    this.r.shadowMap.enabled = true; this.r.shadowMap.type = coarse ? T.BasicShadowMap : T.PCFSoftShadowMap;
    this.s = new T.Scene(); this.s.background = new T.Color(0x0b0d2a); this.s.fog = new T.Fog(0x0b0d2a, 60, 140);
    this.cam = new T.PerspectiveCamera(36, 1, 0.5, 300); this.hemi = new T.HemisphereLight(0xbfd8ff, 0x3a2a60, 0.8); this.s.add(this.hemi);
    this.sun = new T.DirectionalLight(0xfff0dd, 0.9); this.sun.position.set(-10, 26, 18); this.sun.target.position.set(0, 0, 0); this.s.add(this.sun, this.sun.target); this.sun.castShadow = true; this.sun.shadow.mapSize.set(1024, 1024); const sc = this.sun.shadow.camera; sc.left = -22; sc.right = 22; sc.top = 14; sc.bottom = -14; sc.near = 5; sc.far = 70; this.sun.shadow.bias = -0.0006;
    this.time = 0; this.tod = 1; this.todT = 1; this.figs = []; this.fx = []; this.pool = []; this.live = []; this.focusT = null; this.view = { x: 0, z: 1.5, w: 30 }; this.cur = { x: 0, z: 1.5, w: 30 }; this.glowing = []; this.lamps = []; this.slow = 0; this.fpsT = 0; this.fpsN = 0;
    for (let i = 0; i < 90; i++) { const sp = new T.Sprite(new T.SpriteMaterial({ map: puff(), transparent: true, depthWrite: false })); sp.visible = false; this.s.add(sp); this.pool.push(sp); }
    this.build(); this.resize();
  }
  resize() { const w = this.cv.clientWidth || innerWidth, h = this.cv.clientHeight || innerHeight; this.r.setPixelRatio(this.pr); this.r.setSize(w, h, false); this.cam.aspect = w / h; this.cam.updateProjectionMatrix(); }
  // ---------------------------------------------------------------- Aufbau
  build() {
    const g = new T.Group(); this.s.add(g); this.root = g;
    const ground = new T.Mesh(new T.PlaneGeometry(400, 200), std(0x16183a, { roughness: 1 })); ground.rotation.x = -Math.PI / 2; ground.position.y = -0.4; ground.receiveShadow = true; g.add(ground);
    const base = box(g, 25, 0.4, 13.4, 0x23265a, 0, -0.4, 0, { roughness: 0.8 });   // Sockel
    const FLOORS = { schlaf: 0xb98a5e, studio: 0x2b2250, beicht: 0x4a1020, kueche: 0xd9d4cf, wohn: 0x7c5c9a, garten: 0x3aa85a };
    for (const k in ROOMS) { const c = centerOf(k); const f = box(g, RW - 0.04, 0.12, RD - 0.04, FLOORS[k], c.x, 0, c.z, { roughness: k === 'kueche' ? 0.3 : 0.75 }); f.castShadow = false; this.decor(k, c); }
    // Außenwände hinten + Seiten, niedrige Trennwände mit Türöffnungen
    const WALL = 0xe8e2f4, wh = 4.2;
    box(g, 24.4, wh, 0.3, WALL, 0, 0, -RD - 0.15); box(g, 0.3, wh, 12.2, WALL, -12.15, 0, 0); box(g, 0.3, wh, RD, WALL, 12.15, 0, -RD / 2);
    for (let r = 0; r < 2; r++) for (const x of [-4, 4]) { const zc = r === 0 ? -RD / 2 : RD / 2; box(g, 0.2, 1.3, RD / 2 - DOOR, 0xcfc8e6, x, 0, zc - RD / 4 - DOOR / 2); box(g, 0.2, 1.3, RD / 2 - DOOR, 0xcfc8e6, x, 0, zc + RD / 4 + DOOR / 2); }
    for (let c = 0; c < 3; c++) { const x = (c - 1) * RW; box(g, RW / 2 - DOOR, 0.9, 0.2, 0xcfc8e6, x - RW / 4 - DOOR / 2, 0, 0); box(g, RW / 2 - DOOR, 0.9, 0.2, 0xcfc8e6, x + RW / 4 + DOOR / 2, 0, 0); }
    box(g, 24.4, 0.14, 0.14, 0x00e5ff, 0, 0, RD + 0.1, { basic: true });   // Glaskante vorn
    // Fenster (leuchten nachts warm)
    this.windows = []; for (const x of [-8, 0, 8]) { const w = new T.Mesh(new T.PlaneGeometry(3.2, 1.8), glow(0x9fd4ff)); w.position.set(x, 2.4, -RD + 0.02); g.add(w); this.windows.push(w); const fr = new T.Mesh(new T.BoxGeometry(3.5, 2.1, 0.1), std(0x3a2f6a)); fr.position.set(x, 2.4, -RD - 0.02); g.add(fr); }
    // Schild + Antenne
    const sign = new T.Mesh(new T.PlaneGeometry(13, 2.4), glow(0xffffff, { map: cvs(512, 96, (c, w, h) => { c.fillStyle = '#10062e'; c.fillRect(0, 0, w, h); c.font = '900 68px Inter,Arial,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.shadowColor = '#ff2d95'; c.shadowBlur = 18; c.fillStyle = '#fff'; c.fillText('FUNK', 150, 50); c.shadowColor = '#00e5ff'; c.fillText('HAUS', 360, 50); c.fillStyle = '#ff3b3b'; c.shadowBlur = 8; c.beginPath(); c.arc(470, 50, 10, 0, 7); c.fill(); }) })); sign.position.set(0, wh + 1.5, -RD - 0.1); g.add(sign);
    const mast = box(g, 0.25, 9, 0.25, 0x555a8a, -14.5, 0, -4); this.beacon = new T.Sprite(new T.SpriteMaterial({ map: puff(), color: 0xff3030, transparent: true, depthWrite: false, blending: T.AdditiveBlending })); this.beacon.scale.setScalar(1.6); this.beacon.position.set(-14.5, 9.2, -4); g.add(this.beacon);
    // Sterne
    const N = 220, pos = new Float32Array(N * 3); for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - 0.5) * 160; pos[i * 3 + 1] = 18 + Math.random() * 40; pos[i * 3 + 2] = -40 - Math.random() * 40; } const pg = new T.BufferGeometry(); pg.setAttribute('position', new T.BufferAttribute(pos, 3)); this.stars = new T.Points(pg, new T.PointsMaterial({ color: 0xffffff, size: 0.35, transparent: true, opacity: 0 })); this.s.add(this.stars);
    // Publikum vor dem Haus (Gasse für den Auszug bei x 4.5–9.5)
    this.crowd = []; const bg = new T.BoxGeometry(0.6, 0.9, 0.5), hg = new T.SphereGeometry(0.28, 8, 6); const pts = []; for (let r = 0; r < 3; r++) for (let x = -14; x <= 14; x += 1.25) { if (x > 4.4 && x < 9.6) continue; pts.push([x + (Math.random() - 0.5) * 0.5, RD + 2.7 + r * 1.2 + Math.random() * 0.3]); }
    this.cb = new T.InstancedMesh(bg, new T.MeshLambertMaterial({ color: 0xffffff }), pts.length); this.ch = new T.InstancedMesh(hg, new T.MeshLambertMaterial({ color: 0xffd9b0 }), pts.length); const col = new T.Color();
    pts.forEach((p, i) => { this.crowd.push({ x: p[0], z: p[1], ph: Math.random() * 6 }); col.setHSL(Math.random(), 0.65, 0.5); this.cb.setColorAt(i, col); col.setHex([0xffd9b0, 0xe8b88a, 0xc68a5e, 0x8d5a3b][i % 4]); this.ch.setColorAt(i, col); });
    this.s.add(this.cb, this.ch); this.energy = 0.3; box(g, 24.6, 0.9, 0.12, 0x00e5ff, 0, 0, RD + 1.7, { basic: true, transparent: true, opacity: 0.35 });   // Absperrung
  }
  decor(k, c) {
    const g = this.root, x = c.x, z = c.z;
    if (k === 'schlaf') { box(g, 2.6, 0.5, 4.2, 0x6a4a2a, x - 2.6, 0, z - 0.3); box(g, 2.4, 0.3, 4.0, 0x8b5cf6, x - 2.6, 0.5, z - 0.3); box(g, 2.6, 0.5, 4.2, 0x6a4a2a, x + 2.6, 0, z - 0.3); box(g, 2.4, 0.3, 4.0, 0xff6fb0, x + 2.6, 0.5, z - 0.3); box(g, 1.2, 0.3, 0.8, 0xffffff, x - 2.6, 0.8, z - 2); box(g, 1.2, 0.3, 0.8, 0xffffff, x + 2.6, 0.8, z - 2); box(g, 2, 0.02, 1.6, 0x00b8d9, x, 0.12, z + 1.2); }
    if (k === 'kueche') { box(g, 7, 1.1, 1.2, 0x7a8ad0, x, 0, z - 2.4); box(g, 7, 0.1, 1.3, 0xf5f5ff, x, 1.1, z - 2.4); box(g, 1.3, 2.4, 1.2, 0xe9eefc, x + 2.9, 0, z - 0.8); box(g, 2.6, 0.9, 1.6, 0xb98a5e, x - 0.3, 0, z + 0.8); [-1.3, 0.7].forEach(dx => box(g, 0.7, 0.5, 0.7, 0x8b5cf6, x - 0.3 + dx, 0, z + 2.0)); cyl(g, 0.35, 0.35, 0.4, 0xff9a1f, x - 2.6, 1.2, z - 2.4); }
    if (k === 'wohn') { box(g, 0.5, 0.5, 2.8, 0x2a1a4a, x - 3.5, 0, z + 0.4); box(g, 0.18, 1.5, 2.5, 0x10122a, x - 3.55, 0.5, z + 0.4); const tv = new T.Mesh(new T.PlaneGeometry(2.3, 1.25), glow(0x37c8ff)); tv.rotation.y = Math.PI / 2; tv.position.set(x - 3.44, 1.2, z + 0.4); g.add(tv); this.tv = tv; box(g, 1.5, 0.7, 4.2, 0xff2d95, x + 0.9, 0, z + 0.4); box(g, 0.45, 1.2, 4.2, 0xd91c7c, x + 1.5, 0.7, z + 0.4); box(g, 1.2, 0.7, 1.3, 0xff2d95, x + 0.2, 0, z - 2.2); box(g, 1.1, 0.35, 1.9, 0xffd24a, x - 1.2, 0, z + 0.4); box(g, 3.6, 0.03, 4.6, 0x23c9a8, x - 0.9, 0.12, z + 0.4); cyl(g, 0.18, 0.2, 1.6, 0x6a4a2a, x + 3.4, 0, z - 2.2); const pl = new T.Mesh(new T.SphereGeometry(0.55, 10, 8), std(0x2fa84a)); pl.position.set(x + 3.4, 2.0, z - 2.2); g.add(pl); }
    if (k === 'studio') { box(g, 6.4, 1.6, 0.3, 0x3a2f6a, x, 0, z - 2.7); for (let i = 0; i < 8; i++) box(g, 0.7, 1.4, 0.12, i % 2 ? 0x2a2150 : 0x4a3a8a, x - 2.8 + i * 0.8, 1.6, z - 2.7); box(g, 4, 0.9, 1.3, 0x6a4a2a, x, 0, z - 1.3); box(g, 3.6, 0.08, 1.1, 0x10122a, x, 0.9, z - 1.3); cyl(g, 0.05, 0.05, 1.0, 0xcfd6ff, x - 0.7, 0.98, z - 1.3); const mic = new T.Mesh(new T.SphereGeometry(0.16, 12, 10), std(0x10122a)); mic.position.set(x - 0.7, 2.1, z - 1.3); g.add(mic); this.onair = new T.Mesh(new T.PlaneGeometry(2.2, 0.7), glow(0xffffff, { map: cvs(256, 80, (c, w, h) => { c.fillStyle = '#c00018'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = '900 52px Inter,Arial,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('ON AIR', w / 2, h / 2 + 3); }) })); this.onair.position.set(x, 3.4, z - 2.55); g.add(this.onair); this.podium = box(g, 6.2, 0.35, 1.6, 0x00b8d9, x, 0.1, z + 1.5); }
    if (k === 'beicht') { box(g, 6.4, 3.0, 0.3, 0x2a0a18, x, 0, z - 2.7); const cur = box(g, 2.6, 2.6, 0.12, 0x8a0f2a, x, 0, z - 2.5); cyl(g, 0.7, 0.8, 0.5, 0xc01838, x, 0.1, z - 0.3); box(g, 1.6, 1.4, 0.3, 0xc01838, x, 0.6, z - 0.9); this.beichtLamp = new T.Mesh(new T.CylinderGeometry(0.4, 0.55, 0.5, 12), glow(0xff2020)); this.beichtLamp.position.set(x, 3.3, z); g.add(this.beichtLamp); box(g, 0.4, 0.8, 0.12, 0x10122a, x + 2.6, 0.8, z - 2.4); }
    if (k === 'garten') { box(g, 3.2, 0.1, 3.2, 0x1fa8f0, x - 1.2, 0.1, z - 0.6, { transparent: true, opacity: 0.85 }); box(g, 3.5, 0.3, 3.5, 0xe9eefc, x - 1.2, 0, z - 0.6); const w = box(g, 3.1, 0.08, 3.1, 0x4fd8ff, x - 1.2, 0.3, z - 0.6, { basic: true }); this.water = w; cyl(g, 0.5, 0.4, 0.8, 0x333344, x + 2.4, 0, z - 2.2); cyl(g, 0.4, 0.4, 0.1, 0xff6a2a, x + 2.4, 0.8, z - 2.2); box(g, 1.6, 0.18, 0.7, 0xff9a1f, x + 2.0, 0.4, z + 2.0); [-3, 3.2].forEach(dx => { cyl(g, 0.08, 0.1, 1.2, 0x6a4a2a, x + dx, 0, z + 2.5); const l = new T.Mesh(new T.SphereGeometry(0.28, 10, 8), glow(0xffe08a)); l.position.set(x + dx, 1.4, z + 2.5); g.add(l); }); for (let i = 0; i < 6; i++) { cyl(g, 0.05, 0.05, 0.4, 0x2a7a3a, x + 3.4, 0, z - 2.6 + i * 0.9); const f = new T.Mesh(new T.SphereGeometry(0.15, 8, 6), std([0xff2d95, 0xffd24a, 0xffffff][i % 3])); f.position.set(x + 3.4, 0.5, z - 2.6 + i * 0.9); g.add(f); } cyl(g, 0.25, 0.3, 1.8, 0x6a4a2a, x + 3.0, 0, z + 1.2); const tr = new T.Mesh(new T.SphereGeometry(1.0, 12, 10), std(0x2fa84a)); tr.position.set(x + 3.0, 2.3, z + 1.2); tr.castShadow = true; g.add(tr); }
    // Überwachungskamera in der Ecke
    const cam = box(g, 0.45, 0.3, 0.7, 0x20203a, x + (RW / 2 - 0.4) * (k === 'garten' || k === 'beicht' ? -1 : 1), 3.3, z - RD / 2 + 0.5); const led = new T.Sprite(new T.SpriteMaterial({ map: puff(), color: 0xff2020, transparent: true, depthWrite: false, blending: T.AdditiveBlending })); led.scale.setScalar(0.5); led.position.set(cam.position.x, cam.position.y + 0.2, cam.position.z + 0.4); g.add(led); this.lamps.push(led);
  }
  // ---------------------------------------------------------------- Figuren
  setCast(looks) {
    this.figs.forEach(f => this.s.remove(f.g)); this.figs = looks.map((l, i) => this.makeFigure(l, i)); this.figs.forEach((f, i) => { this.s.add(f.g); this.place(i, 'wohn', i); });
  }
  makeFigure(l, i) {
    const g = new T.Group(), body = new T.Group(); g.add(body); const skin = std(hex(l.skin), { roughness: 0.7 }), shirt = std(hex(l.shirt), { roughness: 0.55 }), pants = C('pants' + (i % 3), () => std([0x27355e, 0x3a2a4a, 0x2a4a3a][i % 3])), hairM = std(hex(l.hair), { roughness: 0.8 }), dark = C('dk', () => glow(0x120a24));
    const torso = new T.Mesh(C('t', () => new T.CylinderGeometry(0.36, 0.3, 0.9, 14)), shirt); torso.position.y = 1.15; body.add(torso); const sh = new T.Mesh(C('sh', () => new T.SphereGeometry(0.36, 14, 8, 0, 7, 0, 1.57)), shirt); sh.position.y = 1.6; body.add(sh);
    const head = new T.Mesh(C('hd', () => new T.SphereGeometry(0.31, 18, 14)), skin); head.position.y = 1.98; body.add(head);
    const hair = new T.Mesh(C('hr', () => new T.SphereGeometry(0.325, 18, 10, 0, 7, 0, 1.45)), hairM); hair.position.y = 2.0; body.add(hair);
    if (l.style === 2 || l.style === 4) { const back = new T.Mesh(C('hb', () => new T.CylinderGeometry(0.3, 0.26, 0.62, 12)), hairM); back.position.set(0, 1.78, -0.1); body.add(back); } if (l.style === 3) { const bun = new T.Mesh(C('bun', () => new T.SphereGeometry(0.16, 10, 8)), hairM); bun.position.set(0, 2.38, -0.05); body.add(bun); } if (l.style === 1) for (let k = -1; k <= 1; k++) { const sp = new T.Mesh(C('sp', () => new T.ConeGeometry(0.1, 0.28, 6)), hairM); sp.position.set(k * 0.15, 2.36, 0); sp.rotation.z = -k * 0.3; body.add(sp); }
    [-0.11, 0.11].forEach(x => { const e = new T.Mesh(C('eye', () => new T.SphereGeometry(0.04, 8, 6)), dark); e.position.set(x, 2.0, 0.29); body.add(e); }); const mouth = new T.Mesh(C('mo', () => new T.TorusGeometry(0.07, 0.016, 6, 10, Math.PI)), dark); mouth.rotation.z = Math.PI; mouth.position.set(0, 1.9, 0.3); body.add(mouth);
    const limb = (m, x, y, len, rad) => { const p = new T.Group(); p.position.set(x, y, 0); const lm = new T.Mesh(C('l' + len + rad, () => new T.CylinderGeometry(rad, rad * 0.9, len, 8)), m); lm.position.y = -len / 2; p.add(lm); body.add(p); return p; };
    const legL = limb(pants, -0.15, 0.7, 0.7, 0.11), legR = limb(pants, 0.15, 0.7, 0.7, 0.11), armL = limb(shirt, -0.44, 1.5, 0.65, 0.085), armR = limb(shirt, 0.44, 1.5, 0.65, 0.085);
    [legL, legR].forEach(p => { const f = new T.Mesh(C('ft', () => new T.BoxGeometry(0.2, 0.12, 0.32)), C('sh2', () => std(0xf5f5ff))); f.position.set(0, -0.7, 0.07); p.add(f); }); [armL, armR].forEach(p => { const h = new T.Mesh(C('hn', () => new T.SphereGeometry(0.09, 8, 6)), skin); h.position.y = -0.65; p.add(h); });
    g.traverse(o => { if (o.isMesh) o.castShadow = true; });
    const tag = new T.Sprite(new T.SpriteMaterial({ map: cvs(256, 64, (c, w, h) => { c.fillStyle = 'rgba(10,12,40,.85)'; c.beginPath(); c.roundRect ? c.roundRect(8, 8, w - 16, h - 16, 18) : c.rect(8, 8, w - 16, h - 16); c.fill(); c.strokeStyle = l.shirt; c.lineWidth = 4; c.stroke(); c.fillStyle = '#fff'; c.font = '800 30px Inter,Arial,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(l.n, w / 2, h / 2 + 2); }), transparent: true, depthTest: false })); tag.scale.set(1.7, 0.43, 1); tag.position.y = 2.85; tag.renderOrder = 10; g.add(tag);
    const icon = new T.Sprite(new T.SpriteMaterial({ transparent: true, depthTest: false })); icon.scale.set(0.9, 0.9, 1); icon.position.set(0.7, 2.7, 0); icon.visible = false; icon.renderOrder = 11; g.add(icon);
    return { g, body, legL, legR, armL, armR, head, tag, icon, i, l, room: 'wohn', x: 0, z: 0, path: [], pose: 'idle', phase: Math.random() * 6, face: 0, tface: 0, iconT: 0, gone: false, bob: 0 };
  }
  place(i, room, k = 0) { const f = this.figs[i], p = slotPos(room, k); f.x = p.x; f.z = p.z; f.room = room; f.path = []; f.g.position.set(p.x, 0, p.z); f.g.visible = true; f.gone = false; f.g.scale.setScalar(1); }
  /** Weg zwischen Räumen: erst waagerecht durch die Türen, dann senkrecht durch die Mitteltür */
  route(f, room, k) {
    const to = slotPos(room, k), A = ROOMS[f.room], B = ROOMS[room], pts = []; const cz = r => (r === 0 ? -RD / 2 : RD / 2), cx = c => (c - 1) * RW;
    if (A.r === B.r) { pts.push({ x: cx(B.c) + (A.c === B.c ? 0 : 0), z: cz(A.r) }); }
    else { pts.push({ x: cx(A.c), z: cz(A.r) }); pts.push({ x: cx(A.c), z: 0 }); pts.push({ x: cx(A.c), z: cz(B.r) }); pts.push({ x: cx(B.c), z: cz(B.r) }); }
    pts.push(to); return pts;
  }
  walkTo(i, room, k = 0) {
    const f = this.figs[i]; if (f.room === room && Math.hypot(f.x - slotPos(room, k).x, f.z - slotPos(room, k).z) < 0.05) return Promise.resolve();
    f.path = this.route(f, room, k); f.room = room; f.pose = 'walk'; return new Promise(res => { f.done = res; });
  }
  setPose(i, pose, icon) { const f = this.figs[i]; if (f.path.length) return; f.pose = pose; this.say(i, icon); }
  say(i, emoji, sec = 2.4) { const f = this.figs[i]; if (!emoji) { f.icon.visible = false; f.iconT = 0; return; } f.icon.material.map = emojiTex(emoji); f.icon.material.needsUpdate = true; f.icon.visible = true; f.iconT = sec; }
  face(i, tx, tz) { const f = this.figs[i]; f.tface = Math.atan2(tx - f.x, tz - f.z); }
  faceEach(a, b) { this.face(a, this.figs[b].x, this.figs[b].z); this.face(b, this.figs[a].x, this.figs[a].z); }
  slotXZ(room, k) { return slotPos(room, k); }
  // ---------------------------------------------------------------- Kamera, Licht, Effekte
  focusRoom(room) { if (!room) { this.focusT = null; return; } const c = centerOf(room); this.focusT = { x: c.x, z: c.z + (room === 'wohn' || room === 'kueche' || room === 'garten' ? 0 : 0.6), w: this.cam.aspect < 1 ? 10 : 15 }; }
  setTime(tod) { this.todT = tod; }
  cheer(v = 1) { this.energy = Math.max(this.energy, v); }
  fxEmit(x, y, z, o) { const sp = this.pool.pop(); if (!sp) return; sp.visible = true; sp.position.set(x, y, z); sp.material.color.setHex(o.c || 0xffffff); sp.material.opacity = 1; sp.material.rotation = Math.random() * 6; sp.scale.setScalar(o.s || 0.2); this.live.push({ sp, vx: o.vx || 0, vy: o.vy || 0, vz: o.vz || 0, life: o.life || 1, max: o.life || 1, g: o.g || 0 }); }
  confetti(x = 0, z = 0) { for (let i = 0; i < 60; i++) this.fxEmit(x + (Math.random() - 0.5) * 4, 4, z + (Math.random() - 0.5) * 3, { c: [0x00e5ff, 0xff2d95, 0xffd24a, 0x00ff88, 0xffffff][i % 5], s: 0.22, vx: (Math.random() - 0.5) * 5, vy: 2 + Math.random() * 5, vz: (Math.random() - 0.5) * 3, life: 2.2, g: 7 }); this.cheer(1); }
  exitHouse(i) { const f = this.figs[i]; const c = ROOMS.garten; f.path = [{ x: 7, z: RD / 2 + 1 }, { x: 7, z: RD + 1.4 }, { x: 7, z: RD + 4 }, { x: 7, z: RD + 8 }]; if (f.room !== 'garten') f.path = [...this.route(f, 'garten', 4), ...f.path]; f.room = 'garten'; f.pose = 'walk'; return new Promise(res => { f.done = () => { f.gone = true; f.g.visible = false; res(); }; }); }
  adapt(dt) { this.fpsT += dt; this.fpsN++; if (this.fpsT < 1.5) return; const fps = this.fpsN / this.fpsT; this.fpsT = 0; this.fpsN = 0; if (fps < 24 && dt < 0.2) { this.slow++; if (this.slow >= 2) { this.slow = 0; if (this.pr > 1) { this.pr = Math.max(1, this.pr - 0.5); this.resize(); } else if (this.sun.castShadow) { this.sun.castShadow = false; this.r.shadowMap.enabled = false; this.s.traverse(o => { if (o.material) o.material.needsUpdate = true; }); } } } else this.slow = 0; }
  frame(dt) {
    dt = Math.min(dt, 0.05); this.time += dt; const sp = 3.6 * this.fast();
    // Tageszeit
    this.tod += (this.todT - this.tod) * Math.min(1, dt * 1.5); const d = this.tod, night = 1 - d;
    this.hemi.intensity = 0.28 + d * 0.62; this.sun.intensity = 0.15 + d * 0.8; this.sun.color.setHex(d > 0.6 ? 0xfff0dd : 0x8aa0ff); this.s.background.setRGB(lerp(0.02, 0.38, d * d), lerp(0.03, 0.6, d * d), lerp(0.12, 0.95, d * d)); this.s.fog.color.copy(this.s.background); this.stars.material.opacity = Math.max(0, night * 1.4 - 0.3);
    this.windows.forEach(w => w.material.color.setRGB(lerp(1, 0.55, d), lerp(0.85, 0.82, d), lerp(0.4, 1, d))); if (this.tv) this.tv.material.color.setHSL((this.time * 0.1) % 1, 0.7, 0.55);
    this.beacon.material.opacity = 0.35 + 0.65 * Math.max(0, Math.sin(this.time * 4)); this.lamps.forEach((l, i) => { l.material.opacity = Math.sin(this.time * 3 + i) > 0.2 ? 1 : 0.15; }); if (this.water) this.water.material.color.setHSL(0.52, 0.8, 0.6 + Math.sin(this.time * 2) * 0.05);
    // Figuren
    for (const f of this.figs) {
      if (f.gone) continue; let moving = false;
      if (f.path.length) { const p = f.path[0], dx = p.x - f.x, dz = p.z - f.z, dist = Math.hypot(dx, dz), st = sp * dt; moving = true; if (dist <= st) { f.x = p.x; f.z = p.z; f.path.shift(); if (!f.path.length) { moving = false; f.pose = 'idle'; if (f.done) { const r = f.done; f.done = null; r(); } } } else { f.x += (dx / dist) * st; f.z += (dz / dist) * st; f.tface = Math.atan2(dx, dz); } }
      let da = f.tface - f.face; da = Math.atan2(Math.sin(da), Math.cos(da)); f.face += da * Math.min(1, dt * 9); f.g.position.set(f.x, 0, f.z); f.body.rotation.set(0, f.face, 0); f.body.position.y = 0; f.phase += dt * (moving ? 9 * this.fast() : 3);
      const s = Math.sin(f.phase), P = f.pose; f.legL.rotation.x = f.legR.rotation.x = f.armL.rotation.x = f.armR.rotation.x = 0; f.armL.rotation.z = f.armR.rotation.z = 0; f.head.rotation.set(0, 0, 0);
      if (moving) { f.legL.rotation.x = s * 0.8; f.legR.rotation.x = -s * 0.8; f.armL.rotation.x = -s * 0.7; f.armR.rotation.x = s * 0.7; f.body.position.y = Math.abs(s) * 0.06; }
      else if (P === 'talk') { f.armR.rotation.x = -0.9 + s * 0.5; f.head.rotation.x = Math.sin(f.phase * 1.7) * 0.1; f.body.position.y = Math.abs(Math.sin(f.phase * 1.7)) * 0.04; }
      else if (P === 'cook') { f.armL.rotation.x = -1.1 + s * 0.35; f.armR.rotation.x = -1.1 - s * 0.35; }
      else if (P === 'argue') { f.armL.rotation.x = -1.4 + s * 0.4; f.armR.rotation.x = -1.4 - s * 0.4; f.body.rotation.z = Math.sin(f.phase * 3) * 0.08; }
      else if (P === 'sad') { f.head.rotation.x = 0.35; f.armL.rotation.z = -0.1; f.armR.rotation.z = 0.1; }
      else if (P === 'think') { f.armR.rotation.x = -2.0; f.head.rotation.z = 0.12; }
      else if (P === 'cheer') { f.armL.rotation.x = f.armR.rotation.x = -2.9 + s * 0.3; f.armL.rotation.z = -0.3; f.armR.rotation.z = 0.3; f.body.position.y = Math.abs(s) * 0.3; }
      else if (P === 'mic') { f.armR.rotation.x = -1.6; f.body.position.y = Math.abs(Math.sin(f.phase * 1.4)) * 0.05; }
      else if (P === 'lie') { f.body.rotation.x = -1.45; f.body.position.y = 0.55; f.body.position.z = 0; }
      else if (P === 'dance') { f.armL.rotation.x = -2.5 + s; f.armR.rotation.x = -2.5 - s; f.body.rotation.z = s * 0.15; f.body.position.y = Math.abs(s) * 0.15; }
      else { f.armL.rotation.x = Math.sin(f.phase * 0.7) * 0.05; f.armR.rotation.x = -Math.sin(f.phase * 0.7) * 0.05; }
      if (f.iconT > 0) { f.iconT -= dt; f.icon.position.y = 2.7 + Math.sin(this.time * 4) * 0.06; if (f.iconT <= 0) f.icon.visible = false; }
    }
    // Kamera
    const v = this.focusT || this.viewHouse(); const k = Math.min(1, dt * 2.6); this.cur.x += (v.x - this.cur.x) * k; this.cur.z += (v.z - this.cur.z) * k; this.cur.w += (v.w - this.cur.w) * k;
    const fov = this.cam.fov * Math.PI / 180, dist = Math.max(8, (this.cur.w / this.cam.aspect) / (2 * Math.tan(fov / 2)) * (this.cam.aspect < 1 ? 0.62 : 0.78) + 2); const ang = 0.92;
    this.cam.position.set(this.cur.x, dist * Math.sin(ang), this.cur.z + dist * Math.cos(ang)); this.cam.lookAt(this.cur.x, 0.8, this.cur.z);
    if (this.onair) this.onair.visible = !(this.fOnair === false); this.beichtLamp.material.color.setHex(Math.sin(this.time * 5) > 0 ? 0xff2020 : 0x771010);
    // Publikum
    const m = new T.Matrix4(), e = this.energy; this.energy = Math.max(0.25, this.energy - dt * 0.12); for (let i = 0; i < this.crowd.length; i++) { const c = this.crowd[i], b = Math.abs(Math.sin(this.time * (2 + e * 4) + c.ph)) * (0.06 + e * 0.35); m.makeTranslation(c.x, 0.45 + b, c.z); this.cb.setMatrixAt(i, m); m.makeTranslation(c.x, 1.2 + b, c.z); this.ch.setMatrixAt(i, m); } this.cb.instanceMatrix.needsUpdate = this.ch.instanceMatrix.needsUpdate = true;
    for (let i = this.live.length - 1; i >= 0; i--) { const p = this.live[i]; p.life -= dt; p.vy -= p.g * dt; p.sp.position.x += p.vx * dt; p.sp.position.y += p.vy * dt; p.sp.position.z += p.vz * dt; p.sp.material.opacity = Math.max(0, p.life / p.max); p.sp.material.rotation += 6 * dt; if (p.life <= 0 || p.sp.position.y < 0) { p.sp.visible = false; this.pool.push(p.sp); this.live.splice(i, 1); } }
    this.r.render(this.s, this.cam); this.adapt(dt);
  }
  viewHouse() { return this.cam.aspect < 1 ? { x: 0, z: 3, w: 22 } : { x: 0, z: 4.2, w: 37 }; }
}
