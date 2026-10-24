/* Frequenz-Minen 3D – Bühne (Three.js r128).
 * Das Spielfeld liegt auf einer Radarscheibe: verdeckte Funkplatten (InstancedMesh) über einer Bodentextur mit den Zahlen.
 * Aufdecken = Platten klappen in einer Welle weg, Peiler = kleine Antennen, Störsender = rote Kugeln mit Explosion.
 * Im Menü dreht sich ein Demo-Feld langsam im Hintergrund. */
(function () {
  'use strict';
  const T3 = window.THREE;
  const NUMC = ['', '#00E5FF', '#2EE6A0', '#FFC94D', '#FF8A1F', '#FF4FAE', '#B47CFF', '#FF5470', '#FFFFFF'];
  const CELL = 64, H = .3;
  let renderer, scene, camera, host, low = false, ok = false, raf = 0, t = 0, last = 0, paused = false;
  let B = null, covers = null, floor = null, floorCtx = null, floorTex = null, boardG = null, cursorM = null, sweep = null, radar = null, glow = null;
  let anim = [], animN = 0, flags = {}, jam = [], parts = null, pv = [], pN = 0, shake = 0, demo = false, orbit = 0, zoom = 1, pan = { x: 0, z: 0 }, par = { x: 0, y: 0 };
  let wave = null, hover = -1, cur = -1, dirty = true, fit = { d: 20, a: 1.08 }, mode = 'idle', winT = -1, tint = null;
  const tmp = new T3.Object3D(), col = new T3.Color(), ray = new T3.Raycaster(), v2 = new T3.Vector2(), plane = new T3.Plane(new T3.Vector3(0, 1, 0), -H);
  const M = (c, o) => new T3.MeshStandardMaterial(Object.assign({ color: c, roughness: .45, metalness: .2 }, o || {}));
  function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const tx = new T3.CanvasTexture(c); tx.anisotropy = 4; return tx; }

  function init(el, opt) {
    host = el;
    if (ok) { el.appendChild(renderer.domElement); resize(); return; }
    low = !!(opt && opt.low);
    renderer = new T3.WebGLRenderer({ antialias: !low, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, low ? 1 : 1.75)); el.appendChild(renderer.domElement);
    scene = new T3.Scene(); camera = new T3.PerspectiveCamera(34, 1, .1, 200);
    scene.add(new T3.HemisphereLight(0xcfd8ff, 0x24104a, .85));
    const key = new T3.DirectionalLight(0xffffff, .75); key.position.set(-4, 12, 8); scene.add(key);
    glow = new T3.PointLight(0xff4fae, .7, 26); glow.position.set(0, 5, 0); scene.add(glow);
    // Radarscheibe mit Ringen und rotierendem Strahl
    const rt = canvasTex(512, 512, (g, w) => { const c = w / 2; g.fillStyle = 'rgba(0,0,0,0)'; g.fillRect(0, 0, w, w);
      const gr = g.createRadialGradient(c, c, 10, c, c, c); gr.addColorStop(0, 'rgba(40,28,110,.95)'); gr.addColorStop(.75, 'rgba(18,14,58,.9)'); gr.addColorStop(1, 'rgba(10,8,30,0)'); g.fillStyle = gr; g.beginPath(); g.arc(c, c, c, 0, 7); g.fill();
      g.strokeStyle = 'rgba(0,229,255,.28)'; g.lineWidth = 2; for (let r = 60; r < c; r += 55) { g.beginPath(); g.arc(c, c, r, 0, 7); g.stroke(); }
      g.strokeStyle = 'rgba(0,229,255,.14)'; for (let a = 0; a < 12; a++) { g.beginPath(); g.moveTo(c, c); g.lineTo(c + Math.cos(a * Math.PI / 6) * c, c + Math.sin(a * Math.PI / 6) * c); g.stroke(); } });
    radar = new T3.Mesh(new T3.CircleGeometry(1, 64), new T3.MeshBasicMaterial({ map: rt, transparent: true, depthWrite: false })); radar.rotation.x = -Math.PI / 2; radar.position.y = -.02; scene.add(radar);
    const st = canvasTex(256, 256, (g, w) => { const c = w / 2; for (let i = 0; i < 60; i++) { const a0 = -i * .012; g.fillStyle = 'rgba(0,229,255,' + (.5 * (1 - i / 60)) + ')'; g.beginPath(); g.moveTo(c, c); g.arc(c, c, c, a0 - .012, a0); g.closePath(); g.fill(); } });
    sweep = new T3.Mesh(new T3.CircleGeometry(1, 64), new T3.MeshBasicMaterial({ map: st, transparent: true, depthWrite: false, blending: T3.AdditiveBlending })); sweep.rotation.x = -Math.PI / 2; sweep.position.y = -.01; scene.add(sweep);
    // Sterne
    const sg = new T3.BufferGeometry(), sp = new Float32Array(600 * 3); for (let i = 0; i < 600; i++) { const r = 40 + Math.random() * 40, a = Math.random() * 6.283, y = -10 + Math.random() * 50; sp[i * 3] = Math.cos(a) * r; sp[i * 3 + 1] = y; sp[i * 3 + 2] = Math.sin(a) * r; }
    sg.setAttribute('position', new T3.BufferAttribute(sp, 3)); scene.add(new T3.Points(sg, new T3.PointsMaterial({ color: 0xbfc8ff, size: .18, transparent: true, opacity: .7 })));
    // Partikel (Explosion, Konfetti)
    const pg = new T3.BufferGeometry(); pg.setAttribute('position', new T3.BufferAttribute(new Float32Array(500 * 3), 3)); pg.setAttribute('color', new T3.BufferAttribute(new Float32Array(500 * 3), 3));
    parts = new T3.Points(pg, new T3.PointsMaterial({ size: .22, vertexColors: true, transparent: true, depthWrite: false, blending: T3.AdditiveBlending })); parts.frustumCulled = false; scene.add(parts);
    for (let i = 0; i < 500; i++) pv.push({ x: 0, y: -99, z: 0, vx: 0, vy: 0, vz: 0, l: 0 });
    // Cursor-Rahmen für Tastatur/Controller
    const cg = new T3.EdgesGeometry(new T3.BoxGeometry(1, H + .1, 1)); cursorM = new T3.LineSegments(cg, new T3.LineBasicMaterial({ color: 0xffc94d })); cursorM.visible = false; scene.add(cursorM);
    boardG = new T3.Group(); scene.add(boardG);
    ok = true; addEventListener('resize', resize); resize(); loop();
  }

  const coverTex = () => canvasTex(128, 128, (g, w) => { const gr = g.createLinearGradient(0, 0, w, w); gr.addColorStop(0, '#4a3db8'); gr.addColorStop(1, '#2a1f78'); g.fillStyle = gr; g.fillRect(0, 0, w, w);
    g.strokeStyle = 'rgba(0,229,255,.75)'; g.lineWidth = 5; g.strokeRect(9, 9, w - 18, w - 18); g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(14, 14, w - 28, 16);
    g.fillStyle = 'rgba(0,229,255,.45)'; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(w / 2, w / 2 + 10, 8 + i * 13, -2.4, -.74); g.lineWidth = 4; g.strokeStyle = 'rgba(0,229,255,' + (.55 - i * .15) + ')'; g.stroke(); } g.beginPath(); g.arc(w / 2, w / 2 + 10, 5, 0, 7); g.fill(); });
  let ctex = null;
  const cx = i => (i % B.w) - (B.w - 1) / 2, cz = i => ((i / B.w) | 0) - (B.h - 1) / 2;

  // Neues Spielfeld aufbauen (Platten, Boden, Peiler leeren)
  function setBoard(b) {
    B = b; clearBoard();
    const n = b.w * b.h; ctex = ctex || coverTex();
    covers = new T3.InstancedMesh(new T3.BoxGeometry(.92, H, .92), M(0xffffff, { map: ctex, roughness: .35, metalness: .25, emissive: 0x120a40 }), n);
    covers.instanceMatrix.setUsage(T3.DynamicDrawUsage);
    anim = new Array(n).fill(null); animN = 0;
    for (let i = 0; i < n; i++) { setCover(i, 0, 0, 1); covers.setColorAt(i, col.set(((i % b.w) + ((i / b.w) | 0)) % 2 ? 0xe8e4ff : 0xffffff)); }
    boardG.add(covers);
    const c = document.createElement('canvas'); c.width = b.w * CELL; c.height = b.h * CELL; floorCtx = c.getContext('2d');
    floorTex = new T3.CanvasTexture(c); floorTex.anisotropy = 8;
    floor = new T3.Mesh(new T3.PlaneGeometry(b.w, b.h), new T3.MeshBasicMaterial({ map: floorTex })); floor.rotation.x = -Math.PI / 2; floor.position.y = .005; boardG.add(floor);
    const frame = new T3.Mesh(new T3.BoxGeometry(b.w + .5, .22, b.h + .5), M(0x161040, { emissive: 0x0a0624 })); frame.position.y = -.12; boardG.add(frame);
    const edge = new T3.LineSegments(new T3.EdgesGeometry(new T3.BoxGeometry(b.w + .5, .22, b.h + .5)), new T3.LineBasicMaterial({ color: 0xff4fae, transparent: true, opacity: .8 })); edge.position.y = -.12; boardG.add(edge);
    const r = Math.hypot(b.w, b.h) * .5 + 3; radar.scale.setScalar(r); sweep.scale.setScalar(r);
    drawFloor(); hover = -1; cur = -1; cursorM.visible = false; mode = 'play'; winT = -1; zoom = 1; pan.x = pan.z = 0; tint = null; resize();
  }
  function clearBoard() {
    flags = {}; jam = []; wave = null; tint = null; if (glow) glow.intensity = .7;
    while (boardG.children.length) { const o = boardG.children.pop(); o.traverse(x => { if (x.geometry) x.geometry.dispose(); if (x.material) { if (x.material.map && x.material.map !== ctex) x.material.map.dispose(); x.material.dispose(); } }); }
    covers = null;
  }
  function setCover(i, lift, rot, s) { tmp.position.set(cx(i), H / 2 + lift, cz(i)); tmp.rotation.set(rot, 0, 0); tmp.scale.setScalar(s); tmp.updateMatrix(); covers.setMatrixAt(i, tmp.matrix); }
  function drawFloor() {
    const g = floorCtx, b = B; g.fillStyle = '#0a0b26'; g.fillRect(0, 0, b.w * CELL, b.h * CELL);
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '900 40px system-ui, sans-serif';
    for (let i = 0; i < b.w * b.h; i++) {
      const x = (i % b.w) * CELL, y = ((i / b.w) | 0) * CELL, open = b.st[i] === 1;
      g.fillStyle = i === b.boom ? '#6a1028' : open ? ((i % b.w + ((i / b.w) | 0)) % 2 ? '#15174a' : '#191b55') : '#0d0e2c';
      g.beginPath(); if (g.roundRect) g.roundRect(x + 3, y + 3, CELL - 6, CELL - 6, 10); else g.rect(x + 3, y + 3, CELL - 6, CELL - 6); g.fill();
      if (open && b.num[i] && !b.mine[i]) { g.shadowColor = NUMC[b.num[i]]; g.shadowBlur = 14; g.fillStyle = NUMC[b.num[i]]; g.fillText(b.num[i], x + CELL / 2, y + CELL / 2 + 2); g.shadowBlur = 0; }
    }
    floorTex.needsUpdate = true;
  }
  // Aufgedeckte Felder wegklappen – als Welle in der Reihenfolge der Liste
  function open(list, from) {
    if (!B) return;
    const fx = from != null && from >= 0 ? cx(from) : null, fz = from != null && from >= 0 ? cz(from) : null;
    list.forEach((i, k) => { if (flags[i]) unflag(i); const d = fx === null ? k * .012 : Math.min(1.1, Math.hypot(cx(i) - fx, cz(i) - fz) * .045); if (!anim[i] || anim[i].done) animN++; anim[i] = { s: t + d }; });
    drawFloor(); dirty = true;
  }
  function flagOn(i) {
    if (flags[i]) return;
    const g = new T3.Group(), mat = M(0xff4fae, { emissive: 0xff4fae, emissiveIntensity: .7 });
    const base = new T3.Mesh(new T3.CylinderGeometry(.18, .24, .08, 16), M(0x2a2a40)); g.add(base);
    const pole = new T3.Mesh(new T3.CylinderGeometry(.03, .03, .62, 8), M(0xd8dcff, { metalness: .7 })); pole.position.y = .33; g.add(pole);
    const tip = new T3.Mesh(new T3.SphereGeometry(.1, 14, 10), mat); tip.position.y = .68; g.add(tip);
    const ring = new T3.Mesh(new T3.TorusGeometry(.2, .02, 6, 24), new T3.MeshBasicMaterial({ color: 0xff4fae, transparent: true, opacity: .8 })); ring.rotation.x = Math.PI / 2; ring.position.y = .68; g.add(ring); g.userData = { ring, s: t };
    g.scale.setScalar(1.3); g.position.set(cx(i), H + 1.4, cz(i)); boardG.add(g); flags[i] = g; dirty = true;
  }
  function unflag(i) { const g = flags[i]; if (!g) return; boardG.remove(g); g.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); }); delete flags[i]; }
  function setFlag(i, on) { if (on) flagOn(i); else unflag(i); }
  // Störsender zeigen: rot bei Niederlage (vom Treffer aus), grün „eingefangen“ beim Sieg
  const jamGeo = () => new T3.IcosahedronGeometry(.34, 0);
  function showJammers(won) {
    for (let i = 0; i < B.w * B.h; i++) if (B.mine[i]) {
      const d = B.boom >= 0 ? Math.hypot(cx(i) - cx(B.boom), cz(i) - cz(B.boom)) * .09 : Math.random() * .4;
      const c = won ? 0x2ee6a0 : i === B.boom ? 0xff2b4a : 0xff5470;
      const m = new T3.Mesh(jamGeo(), M(c, { emissive: c, emissiveIntensity: won ? .6 : .9, flatShading: true })); m.position.set(cx(i), -1, cz(i)); m.userData = { s: t + d, y: .3 };
      boardG.add(m); jam.push(m);
      if (won && flags[i]) unflag(i);
      if ((won || !flags[i]) && i !== B.boom) { if (!anim[i] || anim[i].done) animN++; anim[i] = { s: t + d }; }
    }
    // falsch gesetzte Peiler grau färben
    if (!won) for (const k in flags) if (!B.mine[k]) flags[k].children[2].material.color.set(0x777788), flags[k].children[2].material.emissive.set(0x222222);
  }
  function burst(x, y, z, n, colors, speed, up) {
    for (let k = 0; k < n; k++) { const p = pv[pN = (pN + 1) % pv.length], a = Math.random() * 6.283, s = speed * (.4 + Math.random() * .8);
      p.x = x; p.y = y; p.z = z; p.vx = Math.cos(a) * s; p.vz = Math.sin(a) * s; p.vy = up * (.5 + Math.random()); p.l = 1 + Math.random() * .8;
      const c = col.set(colors[k % colors.length]), ca = parts.geometry.attributes.color; ca.setXYZ(pv.indexOf(p), c.r, c.g, c.b); ca.needsUpdate = true; }
  }
  function boom(i) { mode = 'lost'; shake = .7; wave = new T3.Mesh(new T3.RingGeometry(.4, .7, 48), new T3.MeshBasicMaterial({ color: 0xff5a3c, transparent: true, side: T3.DoubleSide, depthWrite: false, blending: T3.AdditiveBlending })); wave.rotation.x = -Math.PI / 2; wave.position.set(cx(i), .4, cz(i)); wave.userData.s = t; boardG.add(wave); burst(cx(i), .5, cz(i), 160, ['#ff2b4a', '#ff8a1f', '#ffc94d', '#ffffff'], 6, 7); tint = { c: 0xff2b4a, s: t, x: cx(i), z: cz(i) }; showJammers(false); }
  function win() { mode = 'won'; winT = t; showJammers(true); for (let k = 0; k < 5; k++) setTimeout(() => B && burst((Math.random() - .5) * B.w, 1, (Math.random() - .5) * B.h, 60, ['#ff4fae', '#00e5ff', '#ffc94d', '#2ee6a0', '#b47cff'], 3, 9), k * 260); tint = { c: 0x2ee6a0, s: t, x: 0, z: 0 }; }

  function setHover(i) { if (i === hover || !covers) return; const o = hover; hover = i; paint(o); paint(i); }
  function setCursor(i) { cur = i; if (i < 0 || !B) { cursorM.visible = false; return; } cursorM.visible = true; cursorM.position.set(cx(i), H / 2, cz(i)); setHover(i); }
  function paint(i) { if (i < 0 || !covers || i >= B.w * B.h) return; covers.setColorAt(i, col.set(i === hover && B.st[i] === 0 && mode === 'play' ? 0xa8f4ff : ((i % B.w) + ((i / B.w) | 0)) % 2 ? 0xe8e4ff : 0xffffff)); covers.instanceColor.needsUpdate = true; }
  // Bildschirmpunkt -> Feldindex (oder -1)
  function pick(px, py) {
    if (!B || !renderer) return -1; const r = renderer.domElement.getBoundingClientRect();
    v2.set((px - r.left) / r.width * 2 - 1, -(py - r.top) / r.height * 2 + 1); ray.setFromCamera(v2, camera);
    const p = new T3.Vector3(); if (!ray.ray.intersectPlane(plane, p)) return -1;
    const x = Math.round(p.x + (B.w - 1) / 2), z = Math.round(p.z + (B.h - 1) / 2);
    return x >= 0 && z >= 0 && x < B.w && z < B.h ? z * B.w + x : -1;
  }
  // Kamera so weit weg, dass das ganze Feld (abzüglich HUD oben/unten) ins Bild passt
  let insetTop = 70, insetBot = 20;
  function insets(top, bot) { insetTop = top; insetBot = bot; resize(); }
  function placeCam(d) {
    const a = fit.a + par.y * .04, rot = orbit + par.x * .05;
    camera.position.set(Math.sin(rot) * Math.cos(a) * d + pan.x, Math.sin(a) * d, Math.cos(rot) * Math.cos(a) * d + pan.z);
    camera.lookAt(pan.x, 0, pan.z);
  }
  function resize() {
    if (!renderer || !host) return; const w = host.clientWidth || innerWidth, h = host.clientHeight || innerHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    if (!B) return;
    const top = 1 - 2 * insetTop / h, bot = -1 + 2 * insetBot / h, mid = (top + bot) / 2, half = (top - bot) / 2 * .94;
    camera.setViewOffset(w, h, 0, mid * h / 2, w, h); camera.updateProjectionMatrix();
    const pts = []; for (const sx of [-1, 1]) for (const sz of [-1, 1]) for (const y of [0, H + .7]) pts.push(new T3.Vector3(sx * (B.w / 2 + .3), y, sz * (B.h / 2 + .3)));
    const o = orbit, px = par.x, py = par.y, pz = pan.x, pzz = pan.z; orbit = 0; par.x = par.y = 0; pan.x = pan.z = 0;
    let lo = 3, hi = 120; for (let k = 0; k < 24; k++) { const d = (lo + hi) / 2; placeCam(d); camera.updateMatrixWorld(); let okFit = true; for (const p of pts) { const q = p.clone().project(camera); if (Math.abs(q.x) > .96 || Math.abs(q.y - mid) > half) { okFit = false; break; } } if (okFit) hi = d; else lo = d; }
    fit.d = hi; orbit = o; par.x = px; par.y = py; pan.x = pz; pan.z = pzz; dirty = true;
  }
  function setZoom(z, keep) { zoom = Math.max(1, Math.min(3, z)); if (zoom === 1) pan.x = pan.z = 0; clampPan(); }
  function panBy(dx, dz) { pan.x += dx; pan.z += dz; clampPan(); }
  function clampPan() { if (!B) return; const lx = B.w / 2 * (1 - 1 / zoom), lz = B.h / 2 * (1 - 1 / zoom); pan.x = Math.max(-lx, Math.min(lx, pan.x)); pan.z = Math.max(-lz, Math.min(lz, pan.z)); }
  function focusCell(i) { if (zoom <= 1 || i < 0) return; const x = cx(i), z = cz(i), m = B.w / zoom / 2 - 1; if (Math.abs(x - pan.x) > m) pan.x += x - pan.x - Math.sign(x - pan.x) * m; if (Math.abs(z - pan.z) > m) pan.z += z - pan.z - Math.sign(z - pan.z) * m; clampPan(); }

  function loop(now) {
    raf = requestAnimationFrame(loop);
    if (document.hidden) return; now = (now || 0) / 1000;
    const dt = Math.min(.05, last ? now - last : .016); if (low && now - last < 1 / 32) return; last = now; t += dt;
    if (paused && !demo) return;
    sweep.rotation.z -= dt * 1.4; if (!tint) { glow.position.set(Math.sin(t * .6) * 6, 5, Math.cos(t * .6) * 6); glow.color.setHSL(.85 + Math.sin(t * .3) * .08, 1, .6); }
    if (demo) orbit += dt * .12;
    if (tint) { const k = Math.max(0, 1 - (t - tint.s) / 2.2); glow.color.set(tint.c); glow.position.set(tint.x, 2.5, tint.z); glow.intensity = .7 + k * 5; if (!k) { tint = null; glow.intensity = .7; } }
    if (wave) { const k = (t - wave.userData.s) / .9; if (k >= 1) { boardG.remove(wave); wave.geometry.dispose(); wave.material.dispose(); wave = null; } else { wave.scale.setScalar(1 + k * 14); wave.material.opacity = 1 - k; } }
    // Platten-Animation
    if (animN && covers) { for (let i = 0; i < anim.length; i++) { const a = anim[i]; if (!a || a.done) continue; const k = (t - a.s) / .38; if (k < 0) continue;
      if (k >= 1) { setCover(i, 0, 0, 0.0001); a.done = true; animN--; continue; } setCover(i, Math.sin(k * Math.PI) * .55, k * Math.PI * .9, 1 - k * k * k); }
      covers.instanceMatrix.needsUpdate = true; }
    for (const k in flags) { const g = flags[k], y = g.position.y; if (y > H) g.position.y = Math.max(H, y - dt * 6); const r = g.userData.ring, p = ((t - g.userData.s) % 1.4) / 1.4; r.scale.setScalar(1 + p * 1.6); r.material.opacity = .8 * (1 - p); }
    for (const m of jam) { const u = m.userData; if (t < u.s) continue; const k = Math.min(1, (t - u.s) / .35); m.position.y = -1 + (u.y + 1) * (1 - Math.pow(1 - k, 3)); m.rotation.y += dt * 2; m.rotation.x += dt; }
    // Partikel
    const pa = parts.geometry.attributes.position; let any = false;
    for (let i = 0; i < pv.length; i++) { const p = pv[i]; if (p.l <= 0) { if (p.y !== -99) { p.y = -99; pa.setXYZ(i, 0, -99, 0); any = true; } continue; } any = true; p.l -= dt; p.vy -= dt * 14; p.x += p.vx * dt; p.y = Math.max(.05, p.y + p.vy * dt); p.z += p.vz * dt; p.vx *= .985; p.vz *= .985; pa.setXYZ(i, p.x, p.y, p.z); }
    if (any) pa.needsUpdate = true;
    if (cursorM.visible) cursorM.material.color.setHSL(.12, 1, .55 + Math.sin(t * 6) * .15);
    // Kamera
    const d = fit.d / zoom; placeCam(d * (mode === 'won' && winT >= 0 ? 1 + Math.min(.08, (t - winT) * .04) : 1));
    if (shake > 0) { shake = Math.max(0, shake - dt * 1.4); camera.position.x += (Math.random() - .5) * shake; camera.position.y += (Math.random() - .5) * shake; }
    renderer.render(scene, camera);
  }
  function pauseR(p) { paused = !!p; }
  function setDemo(on) { demo = !!on; if (!on) orbit = 0; resize(); }
  function parallax(x, y) { par.x = Math.max(-1, Math.min(1, x)); par.y = Math.max(-1, Math.min(1, y)); }
  window.FMScene = { init, setBoard, open, setFlag, boom, win, setHover, setCursor, pick, insets, resize, pause: pauseR, setDemo, parallax, setZoom, panBy, focusCell, get zoom() { return zoom; }, get ready() { return ok; } };
})();
