/* Funk-Billard 3D – Lounge mit Neon, Tisch mit Filz, Holzbanden und Taschen, glänzende nummerierte Kugeln (rollen echt),
 * Queue mit Ausholen, Ziellinie mit Geisterkugel und Laufrichtungen, Kamera hinter der Weißen oder von oben (hochkant gedreht). */
(function () {
  'use strict';
  const T3 = window.THREE, FB = window.FB;
  let R, SC, CAM, el, low = false, t = 0, G = null, view = 'aim', camT = 0, shift = false;
  const perf = { a: 1 / 60, n: 0 };
  const COL = ['#ffffff', '#f5c518', '#1f5fd1', '#d8262c', '#5b2c91', '#f07b16', '#1e8f3e', '#7a2a17', '#111111'];
  const ballCol = n => COL[n > 8 ? n - 8 : n];
  let lamps, balls = [], cueStick, aimLine, ghost, objLine, cueLine, handRing, felt, aimGrp;
  const quat = [];
  function ballTex(n) {
    const c = document.createElement('canvas'); c.width = 256; c.height = 128; const x = c.getContext('2d');
    const col = ballCol(n);
    if (n > 8) { x.fillStyle = '#f7f4ea'; x.fillRect(0, 0, 256, 128); x.fillStyle = col; x.fillRect(0, 34, 256, 60); } else { x.fillStyle = col; x.fillRect(0, 0, 256, 128); }
    if (n) for (const u of [64, 192]) { x.fillStyle = '#f7f4ea'; x.beginPath(); x.ellipse(u, 64, 22, 26, 0, 0, Math.PI * 2); x.fill(); x.fillStyle = '#111'; x.font = '900 30px system-ui,Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(String(n), u, 66); }
    else { x.fillStyle = '#e53935'; x.beginPath(); x.arc(64, 64, 5, 0, Math.PI * 2); x.fill(); }
    const tx = new T3.CanvasTexture(c); tx.anisotropy = 2; return tx;
  }
  function init(container, opt) {
    el = container; low = !!(opt && opt.low);
    R = new T3.WebGLRenderer({ antialias: !low, powerPreference: 'high-performance' }); R.setPixelRatio(Math.min(devicePixelRatio || 1, low ? 1 : matchMedia('(pointer: coarse)').matches ? 1.5 : 1.75));
    if (!low) { R.shadowMap.enabled = true; R.shadowMap.type = T3.PCFSoftShadowMap; }
    el.appendChild(R.domElement);
    SC = new T3.Scene(); SC.background = new T3.Color('#0e0718'); SC.fog = new T3.Fog('#0e0718', 6, 16);
    CAM = new T3.PerspectiveCamera(48, 1, .02, 40);
    SC.add(new T3.HemisphereLight(0xc9b8ff, 0x1a0f24, .55));
    const key = new T3.DirectionalLight(0xffffff, .85); key.position.set(.4, 3, .3); if (!low) { key.castShadow = true; key.shadow.mapSize.set(1024, 1024); const c = key.shadow.camera; c.left = -1.5; c.right = 1.5; c.top = 1; c.bottom = -1; c.near = .5; c.far = 5; key.shadow.bias = -.0008; } SC.add(key);
    const pl = new T3.PointLight(0xff4fd8, .5, 6); pl.position.set(-1.6, 1.2, -1.2); SC.add(pl); const pl2 = new T3.PointLight(0x3dd6ff, .45, 6); pl2.position.set(1.6, 1.2, 1.2); SC.add(pl2);
    room(); table();
    for (let n = 0; n < 16; n++) { const m = new T3.Mesh(new T3.SphereGeometry(FB.R, low ? 16 : 24, low ? 12 : 16), new T3.MeshPhongMaterial({ map: ballTex(n), shininess: 90, specular: 0x666666 })); m.castShadow = !low; SC.add(m); balls[n] = m; quat[n] = new T3.Quaternion(); }
    // Queue
    cueStick = new T3.Group(); const sh = new T3.Mesh(new T3.CylinderGeometry(.0055, .0125, 1.42, 12), new T3.MeshPhongMaterial({ color: '#d9b27a', shininess: 40 })); sh.rotation.z = Math.PI / 2; sh.position.x = -.71;
    const butt = new T3.Mesh(new T3.CylinderGeometry(.0128, .0145, .45, 12), new T3.MeshPhongMaterial({ color: '#2a1a40', shininess: 60 })); butt.rotation.z = Math.PI / 2; butt.position.x = -1.2;
    const tip = new T3.Mesh(new T3.CylinderGeometry(.0058, .0058, .012, 10), new T3.MeshPhongMaterial({ color: '#3d7cff' })); tip.rotation.z = Math.PI / 2; tip.position.x = -.006;
    const neon = new T3.Mesh(new T3.CylinderGeometry(.013, .013, .02, 12), new T3.MeshBasicMaterial({ color: '#ff4fd8' })); neon.rotation.z = Math.PI / 2; neon.position.x = -.98;
    cueStick.add(sh, butt, tip, neon); SC.add(cueStick);
    // Zielhilfe
    aimGrp = new T3.Group(); SC.add(aimGrp);
    const lm = new T3.LineDashedMaterial({ color: 0xffffff, dashSize: .02, gapSize: .015, transparent: true, opacity: .8 });
    aimLine = new T3.Line(new T3.BufferGeometry().setFromPoints([new T3.Vector3(), new T3.Vector3(1, 0, 0)]), lm); aimGrp.add(aimLine);
    ghost = new T3.Mesh(new T3.RingGeometry(FB.R * .9, FB.R, 24), new T3.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .8, side: T3.DoubleSide })); ghost.rotation.x = -Math.PI / 2; aimGrp.add(ghost);
    objLine = new T3.Line(new T3.BufferGeometry().setFromPoints([new T3.Vector3(), new T3.Vector3(1, 0, 0)]), new T3.LineBasicMaterial({ color: 0xffd23f })); aimGrp.add(objLine);
    cueLine = new T3.Line(new T3.BufferGeometry().setFromPoints([new T3.Vector3(), new T3.Vector3(1, 0, 0)]), new T3.LineBasicMaterial({ color: 0x80d8ff, transparent: true, opacity: .6 })); aimGrp.add(cueLine);
    handRing = new T3.Mesh(new T3.RingGeometry(FB.R * 1.4, FB.R * 1.8, 28), new T3.MeshBasicMaterial({ color: 0x9be37a, transparent: true, opacity: .9, side: T3.DoubleSide })); handRing.rotation.x = -Math.PI / 2; SC.add(handRing);
    addEventListener('resize', resize); resize();
  }
  function room() {
    const fl = new T3.Mesh(new T3.PlaneGeometry(20, 20), new T3.MeshLambertMaterial({ color: '#1a1026' })); fl.rotation.x = -Math.PI / 2; fl.position.y = -.78; fl.receiveShadow = !low; SC.add(fl);
    for (const [x, z, ry, c] of [[0, -4, 0, '#ff4fd8'], [0, 4, Math.PI, '#3dd6ff'], [-5, 0, Math.PI / 2, '#a259ff'], [5, 0, -Math.PI / 2, '#ffd23f']]) {
      const w = new T3.Mesh(new T3.PlaneGeometry(10, 4), new T3.MeshLambertMaterial({ color: '#160c22' })); w.position.set(x, 1.2, z); w.rotation.y = ry; SC.add(w);
      const s = new T3.Mesh(new T3.PlaneGeometry(8, .05), new T3.MeshBasicMaterial({ color: c })); s.position.set(x * .99, .9, z * .99); s.rotation.y = ry; SC.add(s);
    }
    // Hängelampen
    lamps = new T3.Group(); SC.add(lamps);
    for (const x of [-.6, .6]) { const sh = new T3.Mesh(new T3.CylinderGeometry(.08, .22, .14, 20, 1, true), new T3.MeshLambertMaterial({ color: '#2a1a40', side: T3.DoubleSide })); sh.position.set(x, 2.2, 0); lamps.add(sh); const b = new T3.Mesh(new T3.SphereGeometry(.05, 10, 8), new T3.MeshBasicMaterial({ color: '#fff4d6' })); b.position.set(x, 2.15, 0); lamps.add(b); const cord = new T3.Mesh(new T3.CylinderGeometry(.004, .004, 1.2, 4), new T3.MeshBasicMaterial({ color: '#000' })); cord.position.set(x, 2.85, 0); lamps.add(cord); }
  }
  function table() {
    const L = FB.L, B = FB.B, rw = .1, rh = .045;
    felt = new T3.Mesh(new T3.BoxGeometry(L + .02, .04, B + .02), new T3.MeshLambertMaterial({ color: '#3b2380' })); felt.position.y = -.02; felt.receiveShadow = !low; SC.add(felt);
    const wood = new T3.MeshPhongMaterial({ color: '#3a2014', shininess: 30 }), cush = new T3.MeshLambertMaterial({ color: '#30196a' });
    const frame = new T3.Mesh(new T3.BoxGeometry(L + rw * 2 + .1, .16, B + rw * 2 + .1), wood); frame.position.y = -.1; frame.castShadow = !low; frame.receiveShadow = !low; SC.add(frame);
    // Banden (zwischen den Taschen)
    const segs = [[-L / 4 - .005, -B / 2 - .025, L / 2 - .14, 'x'], [L / 4 + .005, -B / 2 - .025, L / 2 - .14, 'x'], [-L / 4 - .005, B / 2 + .025, L / 2 - .14, 'x'], [L / 4 + .005, B / 2 + .025, L / 2 - .14, 'x'], [-L / 2 - .025, 0, B - .14, 'z'], [L / 2 + .025, 0, B - .14, 'z']];
    for (const [x, z, len, ax] of segs) { const m = new T3.Mesh(ax === 'x' ? new T3.BoxGeometry(len, rh, .05) : new T3.BoxGeometry(.05, rh, len), cush); m.position.set(x, rh / 2 - .005, z); SC.add(m); }
    const top = new T3.MeshPhongMaterial({ color: '#4a2a1a', shininess: 50 });
    for (const s of [-1, 1]) { const a = new T3.Mesh(new T3.BoxGeometry(L + rw * 2 + .1, .03, rw), top); a.position.set(0, rh - .005, s * (B / 2 + rw / 2 + .05)); SC.add(a); const b2 = new T3.Mesh(new T3.BoxGeometry(rw, .03, B + rw * 2 + .1), top); b2.position.set(s * (L / 2 + rw / 2 + .05), rh - .005, 0); SC.add(b2); }
    // Neonleiste um den Tisch
    const neon = new T3.Mesh(new T3.BoxGeometry(L + rw * 2 + .14, .01, B + rw * 2 + .14), new T3.MeshBasicMaterial({ color: '#ff4fd8' })); neon.position.y = -.17; SC.add(neon);
    for (const [x, z, r] of FB.POCKETS) { const p = new T3.Mesh(new T3.CylinderGeometry(r, r * .9, .05, 18), new T3.MeshBasicMaterial({ color: '#050208' })); p.position.set(x, -.004, z); SC.add(p); const rim = new T3.Mesh(new T3.TorusGeometry(r + .004, .007, 6, 20), new T3.MeshPhongMaterial({ color: '#c9a14a', shininess: 80 })); rim.rotation.x = Math.PI / 2; rim.position.set(x, .03, z); SC.add(rim); }
    // Kopflinie und Punkte
    const ln = new T3.Mesh(new T3.PlaneGeometry(.004, B), new T3.MeshBasicMaterial({ color: '#7a66c9' })); ln.rotation.x = -Math.PI / 2; ln.position.set(-L / 4, .001, 0); SC.add(ln);
    for (const x of [-L / 4, L / 4]) { const d = new T3.Mesh(new T3.CircleGeometry(.006, 10), new T3.MeshBasicMaterial({ color: '#cfc4ff' })); d.rotation.x = -Math.PI / 2; d.position.set(x, .002, 0); SC.add(d); }
    for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const l = new T3.Mesh(new T3.BoxGeometry(.12, .6, .12), wood); l.position.set(x * (L / 2 - .05), -.48, z * (B / 2 - .05)); SC.add(l); }
  }
  function resize() { if (!R) return; const w = el.clientWidth || innerWidth, h = el.clientHeight || innerHeight; R.setSize(w, h, false); CAM.aspect = w / h; CAM.updateProjectionMatrix(); }
  function setGame(g) { G = g; for (let n = 0; n < 16; n++) quat[n].identity(); }
  function setView(v) { view = v; camT = 0; }

  /* ---------- Bild ---------- */
  const v3 = new T3.Vector3(), cp = new T3.Vector3(), cl = new T3.Vector3(), q = new T3.Quaternion(), ax = new T3.Vector3();
  let camPos = new T3.Vector3(0, 2.2, 1.6), camLook = new T3.Vector3();
  function update(dt, ui) {
    if (!R) return; t += dt;
    if (dt > 0) { perf.a += (dt - perf.a) * .05; perf.n++; if (perf.n > 90 && perf.a > 1 / 38 && R.getPixelRatio() > .75) { R.setPixelRatio(Math.max(.75, R.getPixelRatio() - .25)); resize(); perf.n = 0; } }
    if (G) G.balls.forEach(b => {
      const m = balls[b.n]; if (b.in) { if (m.visible) { m.userData.fall = (m.userData.fall || 0) + dt; m.position.y = FB.R - m.userData.fall * .6; if (m.userData.fall > .25) m.visible = false; } return; }
      m.visible = true; m.userData.fall = 0;
      const dx = b.x - m.position.x, dz = b.z - m.position.z, d = Math.sqrt(dx * dx + dz * dz);
      if (d > 1e-6 && d < .5) { ax.set(dz, 0, -dx).normalize(); q.setFromAxisAngle(ax, d / FB.R); quat[b.n].premultiply(q); }
      m.position.set(b.x, FB.R, b.z); m.quaternion.copy(quat[b.n]);
    });
    // Queue, Zielhilfe
    const aiming = G && G.phase === 'aim' && !G.over && ui && ui.dir, c = G && G.balls[0];
    cueStick.visible = !!aiming; aimGrp.visible = !!aiming && ui.guide !== false; handRing.visible = !!(aiming && ui.inHand);
    if (aiming) {
      const [dx, dz] = ui.dir, pull = .03 + (ui.power || 0) * .32 + (ui.shotAnim || 0);
      cueStick.position.set(c.x - dx * (FB.R + pull), FB.R + .012, c.z - dz * (FB.R + pull)); cueStick.rotation.set(0, Math.atan2(-dz, dx), .07, 'YXZ');
      const a = FB.aimInfo(G, dx, dz), y = FB.R * .3;
      setLine(aimLine, c.x, y, c.z, a.gx, y, a.gz); aimLine.computeLineDistances();
      ghost.position.set(a.gx, .002, a.gz); ghost.visible = !!a.hit;
      objLine.visible = cueLine.visible = !!a.hit;
      if (a.hit) { setLine(objLine, a.hit.x, y, a.hit.z, a.hit.x + a.ox * .45, y, a.hit.z + a.oz * .45); setLine(cueLine, a.gx, y, a.gz, a.gx + a.cx * .25, y, a.gz + a.cz * .25); }
      handRing.position.set(c.x, .003, c.z); handRing.scale.setScalar(1 + Math.sin(t * 6) * .1);
    }
    camera(dt, ui);
    R.render(SC, CAM);
  }
  function setLine(l, x1, y1, z1, x2, y2, z2) { const p = l.geometry.attributes.position; p.setXYZ(0, x1, y1, z1); p.setXYZ(1, x2, y2, z2); p.needsUpdate = true; l.geometry.computeBoundingSphere(); }
  function camera(dt, ui) {
    if (!G) { CAM.position.set(Math.cos(t * .15) * 2.6, 1.4, Math.sin(t * .15) * 2.6); CAM.lookAt(0, 0, 0); return; }
    const por = CAM.aspect < 1, c = G.balls[0];
    let want = view;
    if (G.phase === 'roll' && view === 'aim') want = 'follow';
    if (want === 'top' || (G.phase === 'aim' && ui && ui.inHand && view !== 'aim')) {
      const fov = CAM.fov * Math.PI / 360, hFit = (por ? FB.L : FB.B) / 2 + .2, wFit = (por ? FB.B : FB.L) / 2 + .2, h = Math.max(hFit / Math.tan(fov), wFit / (Math.tan(fov) * CAM.aspect));
      cp.set(0, h + .1, .001); cl.set(0, 0, 0); lamps.visible = false; CAM.up.set(por ? -1 : 0, por ? 0 : 0, por ? 0 : -1);
    } else if (want === 'follow') { cp.set(-.3, 1.6 + (por ? 1.4 : 0), 1.7 + (por ? .4 : 0)); cl.set(0, 0, por && shift ? .75 : 0); CAM.up.set(0, 1, 0); }
    else if (ui && ui.dir) { const [dx, dz] = ui.dir, back = por ? 1.1 : .82; cp.set(c.x - dx * back, .32 + (por ? .42 : 0), c.z - dz * back); cl.set(c.x + dx * (por ? .95 : .55), 0, c.z + dz * (por ? .95 : .55)); CAM.up.set(0, 1, 0); }
    if (want !== 'top' && !(G.phase === 'aim' && ui && ui.inHand && view !== 'aim')) lamps.visible = true;
    const k = Math.min(1, dt * (want === 'aim' ? 9 : 3));
    camPos.lerp(cp, k); camLook.lerp(cl, k); CAM.position.copy(camPos); CAM.lookAt(camLook);
  }
  // Bildschirm → Tischpunkt
  const ray = new T3.Raycaster(), nd = new T3.Vector2(), plane = new T3.Plane(new T3.Vector3(0, 1, 0), -FB.R);
  function pick(x, y) { const r = R.domElement.getBoundingClientRect(); nd.set((x - r.left) / r.width * 2 - 1, -(y - r.top) / r.height * 2 + 1); ray.setFromCamera(nd, CAM); const p = new T3.Vector3(); return ray.ray.intersectPlane(plane, p) ? { x: p.x, z: p.z } : null; }
  // Weltrichtung → Bildschirmrichtung (für Ziehen in der Draufsicht)
  window.FBScene = { init, setGame, setView, update, pick, resize, get view() { return view; }, set shift(v) { shift = !!v; }, ballCol };
})();
