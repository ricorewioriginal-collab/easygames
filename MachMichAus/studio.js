/* Mach mich aus! – 3D-Studio (Three.js r128): zwei Ränge mit 20 Funk-Pulten und Lampen, Bühne mit Kandidat, LED-Wand, Scheinwerfer, Kamerafahrten. */
const T = window.THREE;
export const SEATS = 20;
const cache = {}, C = (k, f) => cache[k] || (cache[k] = f());
const std = (c, o) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.55, metalness: 0.15 }, o || {}));
const glow = (c, o) => new T.MeshBasicMaterial(Object.assign({ color: c }, o || {}));
const cvs = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); return new T.CanvasTexture(c); };
const puff = () => C('puff', () => cvs(64, 64, g => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); }));
const emojiTex = e => C('emo' + e, () => cvs(96, 96, (g, w, h) => { g.font = '64px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(e, w / 2, h / 2 + 4); }));
const hex = s => parseInt(s.slice(1), 16), lerp = (a, b, t) => a + (b - a) * t;
const seatPos = k => { const tier = k < 10 ? 0 : 1, i = k % 10, R = tier ? 13.8 : 10.2, span = tier ? 64 : 70, th = ((i / 9) * 2 - 1) * span * Math.PI / 180 + (tier ? 0.04 : 0); return { x: R * Math.sin(th), y: tier ? 1.5 : 0, z: -R * Math.cos(th) + 1, tier }; };
export const STAGE = { x: 0, z: 3.4 };

export class Studio {
  constructor(cv) {
    this.cv = cv; const coarse = matchMedia('(pointer:coarse)').matches; this.fast = () => window.__mmFast || 1;
    this.r = new T.WebGLRenderer({ canvas: cv, antialias: !coarse, powerPreference: 'high-performance' }); this.pr = Math.min(devicePixelRatio || 1, 2); this.r.setPixelRatio(this.pr);
    this.s = new T.Scene(); this.s.background = cvs(8, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#05061a'); gr.addColorStop(1, '#2a1050'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }); this.s.fog = new T.Fog(0x120a38, 45, 120);
    this.cam = new T.PerspectiveCamera(42, 1, 0.3, 200); this.s.add(new T.HemisphereLight(0xcfd8ff, 0x3a2060, 0.75)); const sun = new T.DirectionalLight(0xfff0e0, 0.55); sun.position.set(4, 14, 14); this.s.add(sun);
    this.time = 0; this.energy = 0.3; this.fig = {}; this.seats = []; this.pool = []; this.live = []; this.cones = []; this.look = { pos: new T.Vector3(0, 6, 16), at: new T.Vector3(0, 3.4, -3) }; this.tgt = null; this.fo = 'all'; this.fpsT = 0; this.fpsN = 0; this.slow = 0; this.flashK = -1; this.flashT = 0;
    for (let i = 0; i < 100; i++) { const sp = new T.Sprite(new T.SpriteMaterial({ map: puff(), transparent: true, depthWrite: false })); sp.visible = false; this.s.add(sp); this.pool.push(sp); }
    this.build(); this.resize();
  }
  resize() { const w = this.cv.clientWidth || innerWidth, h = this.cv.clientHeight || innerHeight; this.r.setPixelRatio(this.pr); this.r.setSize(w, h, false); this.cam.aspect = w / h; this.cam.fov = w / h < 1 ? 66 : 42; this.cam.updateProjectionMatrix(); }
  // ---------------------------------------------------------------- Aufbau
  build() {
    const g = this.root = new T.Group(); this.s.add(g);
    const floor = new T.Mesh(new T.PlaneGeometry(80, 60), std(0x0d0f2e, { roughness: 0.25, metalness: 0.4 })); floor.rotation.x = -Math.PI / 2; floor.position.set(0, -0.02, -6); g.add(floor);
    // Bühne
    const st = new T.Mesh(new T.CylinderGeometry(4.2, 4.5, 0.35, 48), std(0x1a1650, { roughness: 0.2, metalness: 0.5 })); st.position.set(STAGE.x, 0.17, STAGE.z); g.add(st);
    const ring = new T.Mesh(new T.TorusGeometry(4.15, 0.07, 8, 64), glow(0x00e5ff)); ring.rotation.x = Math.PI / 2; ring.position.set(STAGE.x, 0.38, STAGE.z); g.add(ring); this.ring = ring;
    const emb = new T.Mesh(new T.CircleGeometry(2.6, 40), glow(0xffffff, { map: cvs(256, 256, (c, w, h) => { c.fillStyle = '#10062e'; c.fillRect(0, 0, w, h); c.translate(w / 2, h / 2); c.strokeStyle = '#ff2d95'; c.lineWidth = 8; for (let i = 1; i <= 3; i++) { c.beginPath(); c.arc(0, 40, i * 34, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); } c.fillStyle = '#ffd24a'; c.beginPath(); c.arc(0, 40, 14, 0, 7); c.fill(); }) })); emb.rotation.x = -Math.PI / 2; emb.position.set(STAGE.x, 0.37, STAGE.z); g.add(emb);
    // LED-Wand
    const led = cvs(512, 128, (c, w, h) => { c.fillStyle = '#10062e'; c.fillRect(0, 0, w, h); for (let i = 0; i < 16; i++) { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, ['#00e5ff', '#ff2d95', '#8b5cf6', '#ffd24a'][i % 4]); gr.addColorStop(1, 'rgba(16,6,46,0)'); c.fillStyle = gr; c.globalAlpha = 0.8; c.fillRect(i * 32 + 4, h * (0.2 + 0.5 * Math.abs(Math.sin(i * 1.7))) * 0.7, 24, h); } c.globalAlpha = 1; }); led.wrapS = led.wrapT = T.RepeatWrapping; led.repeat.set(5, 1); this.led = led;
    const wall = new T.Mesh(new T.PlaneGeometry(80, 22), glow(0xffffff, { map: led })); wall.position.set(0, 10, -21); g.add(wall);
    const sign = new T.Mesh(new T.PlaneGeometry(16, 3.4), glow(0xffffff, { map: cvs(768, 160, (c, w, h) => { c.fillStyle = 'rgba(8,4,28,.96)'; c.fillRect(0, 0, w, h); c.font = '900 80px Inter,Arial,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.shadowColor = '#ff2d95'; c.shadowBlur = 24; c.fillStyle = '#fff'; c.fillText('MACH MICH', 262, 58); c.shadowColor = '#00e5ff'; c.fillText('AUS!', 640, 58); c.shadowBlur = 0; c.font = '700 28px Inter,Arial,sans-serif'; c.fillStyle = '#ffd24a'; c.fillText('DIE FUNK-DATING-SHOW', w / 2, 132); }) })); sign.position.set(0, 12.4, -19.8); g.add(sign);
    // Traverse + Scheinwerfer
    const tr = new T.Mesh(new T.BoxGeometry(46, 0.3, 0.3), std(0x394070, { metalness: 0.6 })); tr.position.set(0, 15.2, -2); g.add(tr); const cg = new T.ConeGeometry(2.1, 15, 14, 1, true); cg.translate(0, -7.5, 0);
    for (let i = 0; i < 12; i++) { const col = [0x00e5ff, 0xff2d95, 0xffd24a, 0x8b5cf6][i % 4], x = -21 + i * 3.8, lamp = new T.Mesh(new T.CylinderGeometry(0.28, 0.4, 0.5, 10), glow(col)); lamp.position.set(x, 15.2, -2); g.add(lamp); const cone = new T.Mesh(cg, new T.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.08, side: T.DoubleSide, depthWrite: false, blending: T.AdditiveBlending })); cone.position.set(x, 15, -2); g.add(cone); this.cones.push({ cone, ph: i }); }
    // Pulte (Konsolen mit Röhrenlampe) – Personen werden mit setSeats() gesetzt
    for (let k = 0; k < SEATS; k++) {
      const P = seatPos(k), grp = new T.Group(); grp.position.set(P.x, P.y, P.z); grp.lookAt(STAGE.x, P.y, STAGE.z); g.add(grp);
      if (P.tier) { const dk = new T.Mesh(new T.BoxGeometry(2.3, 1.5, 2.2), std(0x1b1f4a, { metalness: 0.3 })); dk.position.set(0, -0.75, 0); grp.add(dk); }
      const desk = new T.Mesh(new T.BoxGeometry(1.7, 1.15, 0.9), std(0x2c2a66, { metalness: 0.45, roughness: 0.35 })); desk.position.set(0, 0.575, 0.7); grp.add(desk);
      const trim = new T.Mesh(new T.BoxGeometry(1.74, 0.07, 0.94), glow(0x00e5ff)); trim.position.set(0, 1.18, 0.7); grp.add(trim);
      const base = new T.Mesh(new T.CylinderGeometry(0.26, 0.32, 0.2, 14), std(0x555a8a, { metalness: 0.7 })); base.position.set(0.58, 1.28, 0.7); grp.add(base);
      const bulb = new T.Mesh(new T.SphereGeometry(0.31, 18, 14), glow(0xffb347)); bulb.position.set(0.58, 1.68, 0.7); grp.add(bulb);
      const halo = new T.Sprite(new T.SpriteMaterial({ map: puff(), color: 0xffb347, transparent: true, depthWrite: false, blending: T.AdditiveBlending })); halo.scale.setScalar(2.4); halo.position.set(0.58, 1.68, 0.7); grp.add(halo);
      const plate = new T.Sprite(new T.SpriteMaterial({ transparent: true, depthTest: false })); plate.scale.set(1.7, 0.43, 1); plate.position.set(0, 0.62, 1.22); plate.renderOrder = 5; grp.add(plate);
      this.seats.push({ k, grp, bulb, halo, plate, on: true, lv: 1, pos: P, ph: Math.random() * 6, human: false });
    }
  }
  // ---------------------------------------------------------------- Figuren
  makeFigure(l) {
    const g = new T.Group(), body = new T.Group(); g.add(body); const skin = std(hex(l.skin), { roughness: 0.7, metalness: 0 }), shirt = std(hex(l.shirt), { roughness: 0.55, metalness: 0 }), pants = C('pants', () => std(0x27355e)), hairM = std(hex(l.hair), { roughness: 0.8, metalness: 0 }), dark = C('dk', () => glow(0x120a24));
    const torso = new T.Mesh(C('t', () => new T.CylinderGeometry(0.36, 0.3, 0.9, 12)), shirt); torso.position.y = 1.15; body.add(torso); const sh = new T.Mesh(C('sh', () => new T.SphereGeometry(0.36, 12, 8, 0, 7, 0, 1.57)), shirt); sh.position.y = 1.6; body.add(sh);
    const head = new T.Mesh(C('hd', () => new T.SphereGeometry(0.31, 14, 12)), skin); head.position.y = 1.98; body.add(head); const hair = new T.Mesh(C('hr', () => new T.SphereGeometry(0.325, 14, 10, 0, 7, 0, 1.45)), hairM); hair.position.y = 2.0; body.add(hair);
    if (l.style === 2 || l.style === 4) { const back = new T.Mesh(C('hb', () => new T.CylinderGeometry(0.3, 0.26, 0.62, 10)), hairM); back.position.set(0, 1.78, -0.1); body.add(back); } if (l.style === 3) { const bun = new T.Mesh(C('bun', () => new T.SphereGeometry(0.16, 8, 6)), hairM); bun.position.set(0, 2.38, -0.05); body.add(bun); } if (l.style === 1) for (let k = -1; k <= 1; k++) { const sp = new T.Mesh(C('sp', () => new T.ConeGeometry(0.1, 0.28, 6)), hairM); sp.position.set(k * 0.15, 2.36, 0); sp.rotation.z = -k * 0.3; body.add(sp); }
    [-0.11, 0.11].forEach(x => { const e = new T.Mesh(C('eye', () => new T.SphereGeometry(0.04, 6, 5)), dark); e.position.set(x, 2.0, 0.29); body.add(e); }); const mouth = new T.Mesh(C('mo', () => new T.TorusGeometry(0.07, 0.016, 5, 8, Math.PI)), dark); mouth.rotation.z = Math.PI; mouth.position.set(0, 1.9, 0.3); body.add(mouth);
    const limb = (m, x, y, len, rad) => { const p = new T.Group(); p.position.set(x, y, 0); const lm = new T.Mesh(C('l' + len + rad, () => new T.CylinderGeometry(rad, rad * 0.9, len, 8)), m); lm.position.y = -len / 2; p.add(lm); body.add(p); return p; };
    const legL = limb(pants, -0.15, 0.7, 0.7, 0.11), legR = limb(pants, 0.15, 0.7, 0.7, 0.11), armL = limb(shirt, -0.44, 1.5, 0.65, 0.085), armR = limb(shirt, 0.44, 1.5, 0.65, 0.085);
    [legL, legR].forEach(p => { const f = new T.Mesh(C('ft', () => new T.BoxGeometry(0.2, 0.12, 0.32)), C('sh2', () => std(0xf5f5ff))); f.position.set(0, -0.7, 0.07); p.add(f); }); [armL, armR].forEach(p => { const h = new T.Mesh(C('hn', () => new T.SphereGeometry(0.09, 6, 5)), skin); h.position.y = -0.65; p.add(h); });
    const icon = new T.Sprite(new T.SpriteMaterial({ transparent: true, depthTest: false })); icon.scale.set(0.95, 0.95, 1); icon.position.set(0.7, 2.8, 0); icon.visible = false; icon.renderOrder = 11; g.add(icon);
    return { g, body, legL, legR, armL, armR, head, icon, x: 0, z: 0, path: [], pose: 'idle', phase: Math.random() * 6, face: 0, tface: 0, iconT: 0, done: null, sit: null };
  }
  nameTex(n, human) { return cvs(256, 64, (c, w, h) => { c.fillStyle = human ? 'rgba(255,210,74,.95)' : 'rgba(10,12,40,.85)'; c.beginPath(); c.roundRect ? c.roundRect(6, 6, w - 12, h - 12, 16) : c.rect(6, 6, w - 12, h - 12); c.fill(); c.fillStyle = human ? '#1a1200' : '#fff'; c.font = '800 34px Inter,Arial,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(n, w / 2, h / 2 + 2); }); }
  /** seats: [{p:{n}, look, human}] */
  setSeats(list) {
    list.forEach((s, k) => { const S = this.seats[k]; if (S.fig) { S.grp.remove(S.fig.g); } const f = this.makeFigure(s.look); f.g.position.set(-0.3, 0, -0.05); S.grp.add(f.g); S.fig = f; f.sit = true; S.plate.material.map = this.nameTex(s.p.n, s.human); S.plate.material.needsUpdate = true; S.human = !!s.human; this.setLamp(k, true, true); });
  }
  setLamp(k, on, instant) { const S = this.seats[k]; S.on = on; if (instant) S.lv = on ? 1 : 0; }
  lampOff(k) { const S = this.seats[k]; if (!S.on) return; S.on = false; const w = new T.Vector3(); S.bulb.getWorldPosition(w); for (let i = 0; i < 5; i++) this.emit(w.x, w.y, w.z, { vx: (Math.random() - 0.5) * 0.4, vy: 0.7 + Math.random() * 0.5, vz: 0, c: 0x9a9aaa, s: 0.35, life: 1.4, grow: 0.8 }); if (S.fig) { S.fig.pose = 'shrug'; } }
  lampOn(k) { const S = this.seats[k]; S.on = true; if (S.fig) S.fig.pose = 'cheer'; setTimeout(() => { if (S.fig && S.fig.pose === 'cheer') S.fig.pose = 'idle'; }, 1600 / this.fast()); }
  spot(k, t = 1.2) { this.flashK = k; this.flashT = t; }
  // ---------------------------------------------------------------- Kandidat
  setCandidate(look) { if (this.cand) this.s.remove(this.cand.g); if (!look) { this.cand = null; return; } const f = this.makeFigure(look); this.cand = f; this.s.add(f.g); f.x = -9; f.z = 9; f.face = f.tface = 0; f.g.position.set(f.x, 0, f.z); f.g.scale.setScalar(1.05); }
  walkCand(x, z) { const f = this.cand; if (!f) return Promise.resolve(); f.path = [{ x, z }]; f.pose = 'walk'; return new Promise(res => { f.done = res; }); }
  stand() { const f = this.cand; if (!f) return; f.x = STAGE.x; f.z = STAGE.z; f.tface = Math.PI; f.face = Math.PI; }
  pose(who, pose, icon, sec = 2.4) { const f = who === 'cand' ? this.cand : who === 'host' ? this.host : this.seats[who].fig; if (!f) return; f.pose = pose; if (icon) { f.icon.material.map = emojiTex(icon); f.icon.material.needsUpdate = true; f.icon.visible = true; f.iconT = sec; } else f.icon.visible = false; }
  /** gewähltes Pult kommt auf die Bühne */
  walkSeat(k) { const S = this.seats[k], f = S.fig; if (!f) return Promise.resolve(); const w = new T.Vector3(); f.g.getWorldPosition(w); S.grp.remove(f.g); this.s.add(f.g); f.x = w.x; f.z = w.z; f.g.position.set(w.x, w.y, w.z); this.seatFloorY = w.y; f.y = w.y; f.path = [{ x: S.pos.x * 0.55 + STAGE.x * 0.45, z: S.pos.z * 0.5 + 2 }, { x: STAGE.x + 1.3, z: STAGE.z - 0.3 }]; f.pose = 'walk'; return new Promise(res => { f.done = () => { f.tface = Math.atan2(-1.3, -0.6) + 0; res(); }; }); }
  // ---------------------------------------------------------------- Kamera, Effekte
  focus(name, k) { this.fo = name + (k != null ? ':' + k : ''); const a = this.cam.aspect; if (name === 'all') this.tgt = a < 1 ? { p: [0, 8, 24], l: [0, 4.2, -4] } : { p: [0, 6.4, 17], l: [0, 3.6, -3.5] };
    else if (name === 'cand') this.tgt = { p: [2.6, 2.6, -2.2], l: [0, 2.1, 3.4] }; else if (name === 'candBack') this.tgt = a < 1 ? { p: [0, 4.2, 13], l: [0, 3.2, 0] } : { p: [0, 3.6, 11], l: [0, 3.4, -1] };
    else if (name === 'seat') { const P = seatPos(k), d = new T.Vector3(STAGE.x - P.x, 0, STAGE.z - P.z).normalize(); this.tgt = { p: [P.x + d.x * 5.5 + 1, P.y + 2.6, P.z + d.z * 5.5], l: [P.x, P.y + 1.8, P.z] }; }
    else if (name === 'stage') this.tgt = { p: [0, 3.2, 12], l: [0, 2.0, 3.4] }; else this.tgt = null; }
  emit(x, y, z, o) { const sp = this.pool.pop(); if (!sp) return; sp.visible = true; sp.position.set(x, y, z); sp.material.color.setHex(o.c || 0xffffff); sp.material.opacity = 1; sp.material.rotation = Math.random() * 6; sp.scale.setScalar(o.s || 0.2); this.live.push({ sp, vx: o.vx || 0, vy: o.vy || 0, vz: o.vz || 0, life: o.life || 1, max: o.life || 1, g: o.g || 0, grow: o.grow || 0 }); }
  confetti(n = 70) { for (let i = 0; i < n; i++) this.emit((Math.random() - 0.5) * 8, 8 + Math.random() * 2, STAGE.z + (Math.random() - 0.5) * 6, { c: [0x00e5ff, 0xff2d95, 0xffd24a, 0x00ff88, 0xffffff][i % 5], s: 0.22, vx: (Math.random() - 0.5) * 3, vy: -1 - Math.random() * 2, vz: (Math.random() - 0.5) * 2, life: 3, g: -1 }); this.energy = 1; }
  sparks(x, y, z, c = 0xffd24a) { for (let i = 0; i < 24; i++) { const a = Math.random() * 6.28, sp = 2 + Math.random() * 3; this.emit(x, y, z, { c, s: 0.18, vx: Math.cos(a) * sp, vy: 2 + Math.random() * 3, vz: Math.sin(a) * sp * 0.4, life: 1.1, g: 6 }); } }
  cheer(v = 1) { this.energy = Math.max(this.energy, v); }
  adapt(dt) { this.fpsT += dt; this.fpsN++; if (this.fpsT < 1.5) return; const fps = this.fpsN / this.fpsT; this.fpsT = 0; this.fpsN = 0; if (fps < 24 && dt < 0.2) { this.slow++; if (this.slow >= 2) { this.slow = 0; if (this.pr > 1) { this.pr = Math.max(1, this.pr - 0.5); this.resize(); } } } else this.slow = 0; }
  animFig(f, dt, moving) {
    const s = Math.sin(f.phase), P = f.pose; f.legL.rotation.x = f.legR.rotation.x = f.armL.rotation.x = f.armR.rotation.x = 0; f.armL.rotation.z = f.armR.rotation.z = 0; f.head.rotation.set(0, 0, 0); f.body.position.y = 0; f.body.rotation.z = 0;
    if (moving) { f.legL.rotation.x = s * 0.8; f.legR.rotation.x = -s * 0.8; f.armL.rotation.x = -s * 0.7; f.armR.rotation.x = s * 0.7; f.body.position.y = Math.abs(s) * 0.06; }
    else if (P === 'cheer') { f.armL.rotation.x = f.armR.rotation.x = -2.9 + s * 0.3; f.armL.rotation.z = -0.3; f.armR.rotation.z = 0.3; f.body.position.y = f.sit ? 0 : Math.abs(s) * 0.25; }
    else if (P === 'talk') { f.armR.rotation.x = -0.9 + s * 0.5; f.head.rotation.x = Math.sin(f.phase * 1.7) * 0.1; }
    else if (P === 'think') { f.armR.rotation.x = -2.0; f.head.rotation.z = 0.12; }
    else if (P === 'sad' || P === 'shrug') { f.head.rotation.x = 0.35; f.armL.rotation.z = -0.15; f.armR.rotation.z = 0.15; if (P === 'shrug') { f.armL.rotation.x = f.armR.rotation.x = -0.6; } }
    else if (P === 'shock') { f.armL.rotation.x = f.armR.rotation.x = -2.2; f.armL.rotation.z = -0.5; f.armR.rotation.z = 0.5; f.head.rotation.x = -0.15; }
    else if (P === 'dance') { f.armL.rotation.x = -2.5 + s; f.armR.rotation.x = -2.5 - s; f.body.rotation.z = s * 0.15; f.body.position.y = Math.abs(s) * 0.15; }
    else { f.armL.rotation.x = Math.sin(f.phase * 0.7) * 0.05; f.armR.rotation.x = -Math.sin(f.phase * 0.7) * 0.05; }
    if (f.iconT > 0) { f.iconT -= dt; if (f.iconT <= 0) f.icon.visible = false; }
  }
  stepFig(f, dt, sp) {
    let moving = false; if (f.path.length) { const p = f.path[0], dx = p.x - f.x, dz = p.z - f.z, dist = Math.hypot(dx, dz), st = sp * dt; moving = true; if (dist <= st) { f.x = p.x; f.z = p.z; f.path.shift(); if (!f.path.length) { moving = false; f.pose = 'idle'; if (f.done) { const r = f.done; f.done = null; r(); } } } else { f.x += dx / dist * st; f.z += dz / dist * st; f.tface = Math.atan2(dx, dz); } }
    let da = f.tface - f.face; da = Math.atan2(Math.sin(da), Math.cos(da)); f.face += da * Math.min(1, dt * 9); f.phase += dt * (moving ? 9 * this.fast() : 3); return moving;
  }
  frame(dt) {
    dt = Math.min(dt, 0.05); this.time += dt; const sp = 3.8 * this.fast();
    if (this.led) this.led.offset.x += dt * 0.06; this.ring.material.color.setHSL((this.time * 0.15) % 1, 0.9, 0.55);
    this.cones.forEach(c => { c.cone.rotation.z = Math.sin(this.time * 0.9 + c.ph) * 0.35; c.cone.rotation.x = Math.cos(this.time * 0.7 + c.ph) * 0.2; });
    // Lampen
    for (const S of this.seats) {
      S.lv += ((S.on ? 1 : 0) - S.lv) * Math.min(1, dt * 7); const pulse = S.on ? 0.85 + 0.15 * Math.sin(this.time * 3 + S.ph) : 0, lv = S.lv; S.bulb.material.color.setRGB(lerp(0.12, 1, lv) * (0.9 + 0.1 * pulse), lerp(0.12, 0.7, lv), lerp(0.16, 0.28, lv)); S.halo.material.opacity = lv * pulse * (this.flashK === S.k ? 1 : 0.75); S.halo.scale.setScalar(1.7 + (this.flashK === S.k ? 1.4 * Math.sin(this.time * 12) * 0.2 + 0.8 : 0) + pulse * 0.3);
      if (S.fig) { if (S.fig.sit) { S.fig.phase += dt * 3; this.animFig(S.fig, dt, false); } }
    }
    if (this.flashT > 0) { this.flashT -= dt; if (this.flashT <= 0) this.flashK = -1; }
    // wandernde Figuren (Kandidat, Moderator, gewähltes Pult)
    for (const f of [this.cand, this.host, ...this.seats.map(s => s.fig && !s.fig.sit ? s.fig : null)]) { if (!f) continue; const mv = this.stepFig(f, dt, sp); if (f.y) f.y *= Math.max(0, 1 - dt * 2); f.g.position.set(f.x, f.y || 0, f.z); f.body.rotation.y = f.face; this.animFig(f, dt, mv); }
    for (const S of this.seats) if (S.fig && S.fig.sit) S.fig.body.rotation.y = 0;
    // Kamera
    if (this.tgt) { const k = Math.min(1, dt * 2.6); this.look.pos.x += (this.tgt.p[0] - this.look.pos.x) * k; this.look.pos.y += (this.tgt.p[1] - this.look.pos.y) * k; this.look.pos.z += (this.tgt.p[2] - this.look.pos.z) * k; this.look.at.x += (this.tgt.l[0] - this.look.at.x) * k; this.look.at.y += (this.tgt.l[1] - this.look.at.y) * k; this.look.at.z += (this.tgt.l[2] - this.look.at.z) * k; }
    const sw = Math.sin(this.time * 0.35) * 0.35; this.cam.position.set(this.look.pos.x + sw, this.look.pos.y, this.look.pos.z); this.cam.lookAt(this.look.at);
    for (let i = this.live.length - 1; i >= 0; i--) { const p = this.live[i]; p.life -= dt; p.vy -= p.g * dt; p.sp.position.x += p.vx * dt; p.sp.position.y += p.vy * dt; p.sp.position.z += p.vz * dt; if (p.grow) p.sp.scale.addScalar(p.grow * dt); p.sp.material.opacity = Math.max(0, p.life / p.max); p.sp.material.rotation += 4 * dt; if (p.life <= 0 || p.sp.position.y < 0) { p.sp.visible = false; this.pool.push(p.sp); this.live.splice(i, 1); } }
    this.r.render(this.s, this.cam); this.adapt(dt);
  }
  addHost(look) { const f = this.makeFigure(look); f.x = 6.4; f.z = 2.2; f.tface = Math.atan2(-6.4, 1.2); f.face = f.tface; this.host = f; this.s.add(f.g); f.g.position.set(f.x, 0, f.z); const mic = new T.Mesh(new T.SphereGeometry(0.08, 8, 6), std(0x10122a)); mic.position.set(0, -0.65, 0.05); f.armR.add(mic); }
}
