/* EASYCLASH – 3D-Bühne: sechs Arenen aus der easygames-Welt, Kampfkamera (Spieler 1 immer links, folgt dem Abstand),
 * Trefferfunken, Energiestöße, Zeitlupe und Finale-Blitz, Siegerpose, Auswahl-Podeste und Vorschaubilder der Figuren. */
(function () {
  'use strict';
  const T3 = window.THREE, M = window.ECModel;
  let R, SC, CAM, el, low = false, t = 0, W = null, stageGrp = null, sun, hemi;
  const perf = { a: 1 / 60, n: 0 };
  const fighters = [null, null], blobs = [];
  let parts, pData = [], projM = [], camN = new T3.Vector3(0, 0, 1), camD = 5, shake = 0, mode = 'fight', zoom = 0;
  const STAGES = [
    { id: 'studio', n: 'Radiostudio „On Air“', sky: '#1b0a33', fog: '#2a1050', floor: '#2c1656', ring: '#ff5fa2', light: .75, from: '2048 Deluxe' },
    { id: 'mast', n: 'Sendemast über den Wolken', sky: '#ff9a6b', fog: '#ffc69a', floor: '#d9c3a0', ring: '#ffd23f', light: 1, from: 'Sendemast-Sumo' },
    { id: 'strasse', n: 'Hüpfstraße', sky: '#bfe9ff', fog: '#d8f2ff', floor: '#8fd96b', ring: '#ffffff', light: 1, from: 'Hüpfstraße' },
    { id: 'wolken', n: 'Wolkenmeer', sky: '#7fd3ff', fog: '#cdeeff', floor: '#ffffff', ring: '#9be37a', light: 1.05, from: 'Wolkenhopser' },
    { id: 'jade', n: 'Jadepalast', sky: '#16303a', fog: '#24505a', floor: '#3a8a6a', ring: '#ffd23f', light: .85, from: 'Mahjong 3D' },
    { id: 'urwald', n: 'Urwaldlichtung', sky: '#2e5d3a', fog: '#4f8a5a', floor: '#6b8f3a', ring: '#ffb74d', light: .85, from: 'Urwaldlager' }
  ];
  const lam = c => new T3.MeshLambertMaterial({ color: c });

  function init(container, opt) {
    el = container; low = !!(opt && opt.low); M.setup({ low });
    R = new T3.WebGLRenderer({ antialias: !low, powerPreference: 'high-performance' }); R.setPixelRatio(Math.min(devicePixelRatio || 1, low ? 1 : 1.5));
    el.appendChild(R.domElement);
    SC = new T3.Scene(); SC.fog = new T3.Fog('#000', 14, 40); CAM = new T3.PerspectiveCamera(40, 1, .1, 120);
    hemi = new T3.HemisphereLight(0xffffff, 0x445566, .8); SC.add(hemi); sun = new T3.DirectionalLight(0xffffff, .8); sun.position.set(-4, 10, 6); SC.add(sun);
    const PN = low ? 80 : 180; parts = new T3.InstancedMesh(new T3.BoxGeometry(.07, .07, .07), new T3.MeshBasicMaterial({ color: 0xffffff }), PN); parts.instanceMatrix.setUsage(T3.DynamicDrawUsage); parts.frustumCulled = false;
    const hid = new T3.Matrix4().makeScale(0, 0, 0); for (let i = 0; i < PN; i++) { parts.setMatrixAt(i, hid); parts.setColorAt(i, new T3.Color(1, 1, 1)); pData.push({ l: 0 }); } SC.add(parts);
    const sc = document.createElement('canvas'); sc.width = sc.height = 64; const x = sc.getContext('2d'), g = x.createRadialGradient(32, 32, 2, 32, 32, 31); g.addColorStop(0, 'rgba(0,0,0,.5)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    const sm = new T3.MeshBasicMaterial({ map: new T3.CanvasTexture(sc), transparent: true, depthWrite: false });
    for (let i = 0; i < 2; i++) { const b = new T3.Mesh(new T3.PlaneGeometry(1.4, 1.4), sm); b.rotation.x = -Math.PI / 2; b.position.y = .01; SC.add(b); blobs.push(b); }
    setStage(0); addEventListener('resize', resize); resize();
  }
  function resize() { if (!R) return; const w = el.clientWidth || innerWidth, h = el.clientHeight || innerHeight; R.setSize(w, h, false); CAM.aspect = w / h; CAM.updateProjectionMatrix(); }

  /* ---------- Bühnen ---------- */
  function setStage(i) {
    const S = STAGES[i % STAGES.length]; if (stageGrp) SC.remove(stageGrp); stageGrp = new T3.Group(); SC.add(stageGrp);
    SC.background = new T3.Color(S.sky); SC.fog.color.set(S.fog); hemi.intensity = .55 * S.light + .2; sun.intensity = .6 * S.light + .15;
    const RG = window.EC ? EC.RING : 7.2, g = stageGrp;
    const fl = new T3.Mesh(new T3.CylinderGeometry(RG + .8, RG + 1.1, .5, 48), lam(S.floor)); fl.position.y = -.25; g.add(fl);
    const ring = new T3.Mesh(new T3.TorusGeometry(RG + .55, .06, 6, 64), new T3.MeshBasicMaterial({ color: S.ring })); ring.rotation.x = Math.PI / 2; ring.position.y = .02; g.add(ring);
    // Wand (halbdurchsichtig)
    const wall = new T3.Mesh(new T3.CylinderGeometry(RG + .75, RG + .75, 1.1, 48, 1, true), new T3.MeshBasicMaterial({ color: S.ring, transparent: true, opacity: .14, side: T3.DoubleSide, depthWrite: false })); wall.position.y = .55; g.add(wall);
    const rnd = (k => () => (k = (k * 16807) % 2147483647) / 2147483647)(i * 97 + 13);
    const box = (w, h, d, c, x, y, z) => { const m = new T3.Mesh(new T3.BoxGeometry(w, h, d), lam(c)); m.position.set(x, y, z); g.add(m); return m; };
    if (S.id === 'studio') {
      for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2, r = 14 + rnd() * 3; box(.6, 3 + rnd() * 5, .6, ['#ff5fa2', '#a259ff', '#4aa8ff'][k % 3], Math.cos(a) * r, 2, Math.sin(a) * r).material = new T3.MeshBasicMaterial({ color: ['#ff5fa2', '#a259ff', '#4aa8ff'][k % 3] }); }
      const cv = document.createElement('canvas'); cv.width = 256; cv.height = 96; const x = cv.getContext('2d'); x.fillStyle = '#1b0c30'; x.fillRect(0, 0, 256, 96); x.strokeStyle = '#ff3d6e'; x.lineWidth = 8; x.strokeRect(6, 6, 244, 84); x.fillStyle = '#ff3d6e'; x.font = '900 52px system-ui,Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('ON AIR', 128, 52);
      const air = new T3.Mesh(new T3.PlaneGeometry(4, 1.5), new T3.MeshBasicMaterial({ map: new T3.CanvasTexture(cv) })); air.position.set(0, 6, -13); g.add(air);
      for (let k = 0; k < 4; k++) { const sp = box(1.4, 2.2, 1.2, '#26232b', (k < 2 ? -1 : 1) * (9 + (k % 2) * 3), 1.1, -8 + (k % 2) * 4); sp.rotation.y = .4; }
    } else if (S.id === 'mast') {
      const mast = new T3.Mesh(new T3.CylinderGeometry(1.4, 3, 30, 4, 6, true), new T3.MeshBasicMaterial({ color: '#c0392b', wireframe: true })); mast.position.y = -15.5; g.add(mast);
      for (let k = 0; k < 22; k++) { const c = new T3.Mesh(new T3.SphereGeometry(1.5 + rnd() * 2.5, 10, 8), lam('#fff4ea')); c.position.set((rnd() - .5) * 60, -6 - rnd() * 8, (rnd() - .5) * 60); c.scale.y = .45; g.add(c); }
    } else if (S.id === 'strasse') {
      for (let z = -30; z <= 30; z += 2) { if (Math.abs(z) < 10) continue; const road = Math.abs(z) % 6 === 0; box(80, .3, 2, road ? '#4b505e' : (z / 2 & 1 ? '#8fd96b' : '#86d062'), 0, -.4, z); if (!road && rnd() < .6) for (let k = 0; k < 4; k++) { const x2 = (rnd() - .5) * 40; box(.3, .5, .3, '#8d5a3b', x2, 0, z); box(1, .8 + rnd(), 1, '#4caf50', x2, .9, z); } if (road) box(1.4, .5, .8, ['#ff5252', '#ffb300', '#40c4ff'][k3(z)], (rnd() - .5) * 30, .2, z); }
      for (let a = 0; a < 16; a++) { const x2 = Math.cos(a) * 12, z2 = Math.sin(a) * 12; if (Math.abs(z2) < 10) { box(.3, .5, .3, '#8d5a3b', x2, 0, z2); box(1, 1.1, 1, '#5cc25f', x2, 1, z2); } }
    } else if (S.id === 'wolken') {
      for (let k = 0; k < 30; k++) { const c = new T3.Mesh(new T3.SphereGeometry(1 + rnd() * 2, 10, 8), lam('#ffffff')); c.position.set((rnd() - .5) * 70, -3 + (rnd() - .5) * 14, (rnd() - .5) * 70); c.scale.y = .55; if (c.position.length() > 14) g.add(c); }
      for (let k = 0; k < 10; k++) { const p = box(2, .3, 1, ['#9be37a', '#4fc3f7', '#ffd23f'][k % 3], (rnd() - .5) * 40, rnd() * 10, -14 - rnd() * 14); void p; }
    } else if (S.id === 'jade') {
      for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2, x2 = Math.cos(a) * 12, z2 = Math.sin(a) * 12; box(.7, 6, .7, '#c62828', x2, 3, z2); box(1.2, .4, 1.2, '#ffd23f', x2, 6.2, z2); }
      const roof = new T3.Mesh(new T3.ConeGeometry(17, 4, 8, 1, true), new T3.MeshLambertMaterial({ color: '#1b5e20', side: T3.DoubleSide })); roof.position.y = 9; g.add(roof);
      for (let k = 0; k < 6; k++) { const l = new T3.Mesh(new T3.SphereGeometry(.4, 10, 8), new T3.MeshBasicMaterial({ color: '#ff7043' })); l.position.set(Math.cos(k) * 9, 5.5, Math.sin(k) * 9); g.add(l); }
    } else if (S.id === 'urwald') {
      for (let k = 0; k < 26; k++) { const a = rnd() * Math.PI * 2, r = 11 + rnd() * 12, x2 = Math.cos(a) * r, z2 = Math.sin(a) * r; box(.5, 5, .5, '#6d4c41', x2, 2.5, z2); const cr = new T3.Mesh(new T3.SphereGeometry(1.6 + rnd(), 8, 6), lam(['#2e7d32', '#43a047', '#558b2f'][k % 3])); cr.position.set(x2, 5.5, z2); g.add(cr); }
      for (let k = 0; k < 8; k++) box(.9, .5, .9, '#7d6b5a', (rnd() - .5) * 26, .1, -9 - rnd() * 6);
    }
    function k3(z) { return Math.abs(z / 2) % 3 | 0; }
  }

  /* ---------- Kämpfer ---------- */
  function setFighters(chars) {
    for (let i = 0; i < 2; i++) { if (fighters[i]) SC.remove(fighters[i]); fighters[i] = chars[i] ? M.build(chars[i]) : null; if (fighters[i]) SC.add(fighters[i]); }
  }
  function setWorld(w) { W = w; mode = 'fight'; for (const p of projM) SC.remove(p); projM.length = 0; if (W) { const [A, B] = W.f; const a = new T3.Vector3(B.x - A.x, 0, B.z - A.z).normalize(); camN.set(-a.z, 0, a.x); } }
  function setMode(m) { mode = m; }

  /* ---------- Effekte ---------- */
  const tv = new T3.Vector3(), tq = new T3.Quaternion(), ts = new T3.Vector3(), tm = new T3.Matrix4(), tc = new T3.Color();
  function burst(x, y, z, col, n, sp) {
    tc.set(col); let k = 0;
    for (let j = 0; j < pData.length && k < n; j++) { const d = pData[j]; if (d.l > 0) continue; k++; const a = Math.random() * 6.28, b = Math.random() * 3.14 - 1.57, v = (sp || 4) * (.4 + Math.random());
      Object.assign(d, { l: .25 + Math.random() * .3, x, y, z, vx: Math.cos(a) * Math.cos(b) * v, vy: Math.sin(b) * v + 1.5, vz: Math.sin(a) * Math.cos(b) * v }); parts.setColorAt(j, Math.random() < .35 ? new T3.Color(1, 1, 1) : tc); }
    if (parts.instanceColor) parts.instanceColor.needsUpdate = true;
  }
  function onEvent(e) {
    if (e.k === 'hit') { if (e.block) burst(e.x, e.y, e.z, '#80d8ff', 8, 3); else { burst(e.x, e.y, e.z, e.counter ? '#ff1744' : e.super ? '#ffd23f' : '#ffab40', e.big ? 26 : 12, e.big ? 7 : 4.5); shake = Math.max(shake, e.big ? .3 : .12); } }
    else if (e.k === 'throw') { burst(e.x, .2, e.z, '#ffffff', 18, 3); shake = .25; }
    else if (e.k === 'ko') { shake = .5; zoom = 1; }
    else if (e.k === 'finale') { zoom = .8; }
    else if (e.k === 'land') { const F = W.f[e.i]; burst(F.x, .1, F.z, '#d7ccc8', 10, 2.5); }
    else if (e.k === 'wall') { const F = W.f[e.i]; burst(F.x, 1, F.z, '#ffffff', 16, 4); shake = .3; }
  }

  /* ---------- Bildschleife ---------- */
  function update(dt, slowK) {
    if (!R) return; t += dt;
    if (dt > 0) { perf.a += (dt - perf.a) * .05; perf.n++; if (perf.n > 90 && perf.a > 1 / 38 && R.getPixelRatio() > .75) { R.setPixelRatio(Math.max(.75, R.getPixelRatio() - .25)); resize(); perf.n = 0; } }
    if (mode === 'select') { selectView(dt); R.render(SC, CAM); return; }
    if (W) {
      W.f.forEach((F, i) => { const m = fighters[i]; if (!m) return; m.position.set(F.x, F.y, F.z); const ry = Math.atan2(F.fx, F.fz) + (m.userData.spin || 0); m.rotation.y = ry; M.apply(m, F, dt * (slowK || 1), t); blobs[i].position.set(F.x, .01, F.z); blobs[i].scale.setScalar(Math.max(.4, 1 - F.y * .25)); m.visible = true; });
      // Energiestöße
      while (projM.length < W.proj.length) { const p = W.proj[projM.length], c = (W.f[p.o].ch.look && W.f[p.o].ch.look.fx) || '#40c4ff', m = new T3.Mesh(new T3.SphereGeometry(.3, 14, 10), new T3.MeshBasicMaterial({ color: c })); const h = new T3.Mesh(new T3.SphereGeometry(.45, 12, 8), new T3.MeshBasicMaterial({ color: c, transparent: true, opacity: .35 })); m.add(h); SC.add(m); projM.push(m); }
      while (projM.length > W.proj.length) SC.remove(projM.pop());
      W.proj.forEach((p, k) => { projM[k].position.set(p.x, p.y, p.z); const s = 1 + Math.sin(t * 30) * .12; projM[k].scale.setScalar(s); if (Math.random() < .5) burst(p.x, p.y, p.z, (W.f[p.o].ch.look && W.f[p.o].ch.look.fx) || '#40c4ff', 1, 1); });
      fightCam(dt);
    }
    // Funken
    let any = false;
    for (let j = 0; j < pData.length; j++) { const d = pData[j]; if (d.l <= 0) continue; any = true; d.l -= dt; if (d.l <= 0) { tm.makeScale(0, 0, 0); parts.setMatrixAt(j, tm); continue; } d.vy -= 9 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.z += d.vz * dt; const s = Math.min(1.4, d.l * 5); ts.set(s, s, s); tm.compose(tv.set(d.x, d.y, d.z), tq, ts); parts.setMatrixAt(j, tm); }
    if (any || parts.userData.any) parts.instanceMatrix.needsUpdate = true; parts.userData.any = any;
    R.render(SC, CAM);
  }
  function fightCam(dt) {
    const [A, B] = W.f, mx = (A.x + B.x) / 2, mz = (A.z + B.z) / 2, sep = Math.hypot(B.x - A.x, B.z - A.z);
    const a = new T3.Vector3(B.x - A.x, 0, B.z - A.z); if (a.lengthSq() > .01) { a.normalize(); const n = new T3.Vector3(-a.z, 0, a.x); camN.lerp(n, Math.min(1, dt * 3)).normalize(); }
    const asp = CAM.aspect, tf = Math.tan(CAM.fov * Math.PI / 360), want = Math.max(4.6, (sep / 2 + 1.45) / (tf * Math.min(asp, 1.6))) * (1 - zoom * .3);
    camD += (want - camD) * Math.min(1, dt * 3); zoom = Math.max(0, zoom - dt * .5);
    shake = Math.max(0, shake - dt); const sk = shake * .4;
    const ty = Math.max(A.y, B.y) * .4 + 1.15;
    CAM.position.set(mx + camN.x * camD + (Math.random() - .5) * sk, 1.55 + camD * .1 + (Math.random() - .5) * sk, mz + camN.z * camD); CAM.lookAt(mx, ty, mz);
  }
  // Auswahl: zwei Podeste mit Figuren
  let selChars = [null, null], selPods = null;
  function setSelect(chars) {
    mode = 'select'; W = null; for (const p of projM) SC.remove(p); projM.length = 0;
    for (let i = 0; i < 2; i++) { const c = chars[i] || null; if (c !== selChars[i] || !fighters[i]) { if (fighters[i]) SC.remove(fighters[i]); fighters[i] = c ? M.build(c) : null; if (fighters[i]) SC.add(fighters[i]); selChars[i] = c; } }
    if (!selPods) { selPods = []; for (let i = 0; i < 2; i++) { const p = new T3.Mesh(new T3.CylinderGeometry(.9, 1, .3, 6), lam(i ? '#4aa8ff' : '#ff5fa2')); SC.add(p); selPods.push(p); } }
  }
  const idleF = { state: 'idle', t: 0, block: false, crouch: 0, ch: {} }, winF = { state: 'win', t: 0, block: false, crouch: 0, ch: {} };
  function selectView(dt) {
    const por = CAM.aspect < 1, xs = por ? 1.15 : 1.6;
    for (let i = 0; i < 2; i++) { const m = fighters[i], p = selPods[i]; p.visible = !!m; p.position.set((i ? 1 : -1) * xs, -.15, 0); if (!m) continue; m.position.set((i ? 1 : -1) * xs, 0, 0); m.rotation.y = (i ? -1 : 1) * .45 + Math.sin(t * .7 + i) * .15; M.apply(m, idleF, dt, t); blobs[i].position.set(m.position.x, .02, 0); blobs[i].scale.setScalar(1); }
    CAM.position.set(0, por ? 1.9 : 1.6, por ? 7.4 : 5.2); CAM.lookAt(0, por ? 1.25 : 1.05, 0);
  }
  // Vorschaubilder (einmalig, eigener kleiner Renderer)
  function portraits(chars, size, cb) {
    const r = new T3.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); r.setSize(size, size); r.setPixelRatio(1);
    const sc = new T3.Scene(); sc.add(new T3.HemisphereLight(0xffffff, 0x556677, .95)); const dl = new T3.DirectionalLight(0xffffff, .6); dl.position.set(-2, 3, 4); sc.add(dl);
    const cam = new T3.PerspectiveCamera(30, 1, .1, 20); const out = {};
    let i = 0;
    (function next() {
      const end = Math.min(chars.length, i + 6);
      for (; i < end; i++) { const c = chars[i], m = M.build(c); sc.add(m); const hy = (m.userData.look.kind === 'blob' || m.userData.look.kind === 'bird' ? 1.75 : 1.95) * (c.look && c.look.size || 1); cam.position.set(.35, hy, 1.55 * (c.look && c.look.size || 1) + .2); cam.lookAt(0, hy - .12, 0); m.rotation.y = .25; r.render(sc, cam); out[c.id] = r.domElement.toDataURL('image/png'); sc.remove(m); }
      if (i < chars.length) setTimeout(next, 0); else { r.dispose(); cb(out); }
    })();
  }
  window.ECScene = { STAGES, init, setStage, setFighters, setWorld, setMode, setSelect, update, onEvent, burst, resize, portraits };
})();
