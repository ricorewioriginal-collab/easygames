/* Sendemast-Sumo – 3D-Bühne (Three.js r128) im Toon-Look: Cel-Shading mit Umrisslinien, Plattform ganz oben auf einem
 * rot-weißen Sendemast über den Wolken. Die App ruft frame(W, dt) einmal pro Bild auf; fx(e) zeigt Ereignisse (Stoß, Sturz …). */
(function () {
  'use strict';
  const T3 = window.THREE, SM = window.SM;
  let R, scene, cam, host, low = false, ok = false, grad, W0 = null;
  let world, plat, rings = [], core = null, mast, clouds = null, fighters = [], pus = new Map(), warn = [], fx = [], parts, pv = [], pN = 0, windLines = null;
  let camT = { x: 0, z: 0, d: 18 }, shake = 0, t = 0, orbit = 0, attract = false, tags = true;
  const v3 = new T3.Vector3();

  function toonGrad() { const d = new Uint8Array([85, 155, 225]); const tx = new T3.DataTexture(d, 3, 1, T3.LuminanceFormat); tx.minFilter = tx.magFilter = T3.NearestFilter; tx.needsUpdate = true; return tx; }
  const toon = (c, o) => new T3.MeshToonMaterial(Object.assign({ color: c, gradientMap: grad }, o || {}));
  const OUT = new T3.MeshBasicMaterial({ color: 0x1a1230, side: T3.BackSide });
  function outline(mesh, s) { if (low) return mesh; const o = new T3.Mesh(mesh.geometry, OUT); o.scale.setScalar(s || 1.06); mesh.add(o); return mesh; }
  function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const tx = new T3.CanvasTexture(c); tx.anisotropy = 4; return tx; }

  // Fantasie-Embleme: Symbol + Sendername auf rundem Schild
  function iconPath(g, ic, s) {
    g.beginPath();
    if (ic === 'bolt') { g.moveTo(.1 * s, -.5 * s); g.lineTo(-.25 * s, .05 * s); g.lineTo(0, .05 * s); g.lineTo(-.1 * s, .5 * s); g.lineTo(.28 * s, -.08 * s); g.lineTo(.02 * s, -.08 * s); g.closePath(); }
    else if (ic === 'note') { g.arc(-.12 * s, .28 * s, .14 * s, 0, 7); g.rect(-.02 * s, -.42 * s, .07 * s, .7 * s); g.moveTo(.05 * s, -.42 * s); g.lineTo(.3 * s, -.3 * s); g.lineTo(.3 * s, -.18 * s); g.lineTo(.05 * s, -.28 * s); }
    else if (ic === 'mount') { g.moveTo(-.45 * s, .35 * s); g.lineTo(-.1 * s, -.35 * s); g.lineTo(.08 * s, 0); g.lineTo(.2 * s, -.18 * s); g.lineTo(.45 * s, .35 * s); g.closePath(); }
    else if (ic === 'star') { for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = (k % 2 ? .2 : .46) * s; g[k ? 'lineTo' : 'moveTo'](Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); }
    else if (ic === 'wave') { for (let k = 0; k < 3; k++) { g.moveTo(-.42 * s, (k - 1) * .24 * s); g.bezierCurveTo(-.2 * s, (k - 1.4) * .24 * s, .2 * s, (k - .6) * .24 * s, .42 * s, (k - 1) * .24 * s); } }
    else if (ic === 'flake') { for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; g.moveTo(0, 0); g.lineTo(Math.cos(a) * .45 * s, Math.sin(a) * .45 * s); } }
    else if (ic === 'hex') { for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3 + Math.PI / 6; g[k ? 'lineTo' : 'moveTo'](Math.cos(a) * .42 * s, Math.sin(a) * .42 * s); } g.closePath(); }
    else if (ic === 'moon') { g.arc(0, 0, .4 * s, .6, 2 * Math.PI - .6 + 7, false); g.arc(.18 * s, 0, .3 * s, 2 * Math.PI - .8, .8, true); g.closePath(); }
  }
  function emblem(fd, size) {
    return canvasTex(size, size, (g, w) => {
      const c = w / 2; g.fillStyle = fd.col2; g.beginPath(); g.arc(c, c, c - 4, 0, 7); g.fill(); g.lineWidth = w * .05; g.strokeStyle = '#1a1230'; g.stroke();
      g.save(); g.translate(c, c * .82); g.fillStyle = fd.col; g.strokeStyle = fd.col; g.lineWidth = w * .06; g.lineCap = 'round'; iconPath(g, fd.ic, w * .5);
      if (fd.ic === 'wave' || fd.ic === 'flake') g.stroke(); else { g.fill(); g.stroke(); } g.restore();
      g.fillStyle = '#1a1230'; g.font = '900 ' + Math.round(w * .11) + 'px system-ui, sans-serif'; g.textAlign = 'center'; g.fillText(fd.st.toUpperCase(), c, w * .84, w * .8);
    });
  }
  window.SMEmblem = function (fd, size) { const c = document.createElement('canvas'); c.width = c.height = size; const g = c.getContext('2d'), w = size, cc = w / 2;
    g.fillStyle = fd.col2; g.beginPath(); g.arc(cc, cc, cc - 3, 0, 7); g.fill(); g.lineWidth = w * .05; g.strokeStyle = '#1a1230'; g.stroke();
    g.save(); g.translate(cc, cc * .82); g.fillStyle = fd.col; g.strokeStyle = fd.col; g.lineWidth = w * .06; g.lineCap = 'round'; iconPath(g, fd.ic, w * .5); if (fd.ic === 'wave' || fd.ic === 'flake') g.stroke(); else { g.fill(); g.stroke(); } g.restore();
    g.fillStyle = '#1a1230'; g.font = '900 ' + Math.round(w * .11) + 'px system-ui, sans-serif'; g.textAlign = 'center'; g.fillText(fd.st.toUpperCase(), cc, w * .84, w * .8); return c.toDataURL(); };

  function init(el, opt) {
    host = el; if (ok) { el.appendChild(R.domElement); resize(); return; }
    low = !!(opt && opt.low);
    R = new T3.WebGLRenderer({ antialias: !low, alpha: true, powerPreference: 'high-performance' });
    R.setPixelRatio(Math.min(devicePixelRatio || 1, low ? 1 : 1.75)); el.appendChild(R.domElement);
    scene = new T3.Scene(); cam = new T3.PerspectiveCamera(40, 1, .1, 400); grad = toonGrad();
    scene.add(new T3.HemisphereLight(0xffffff, 0x8a7fb0, .5));
    const sun = new T3.DirectionalLight(0xffffff, .7); sun.position.set(-8, 20, 10); scene.add(sun);
    scene.fog = new T3.Fog(0xffc79a, 30, 120);
    world = new T3.Group(); scene.add(world);
    plat = new T3.Group(); world.add(plat);
    // Sendemast unter der Plattform: vier Beine, rot-weiß gestreift, mit Streben
    mast = new T3.Group(); world.add(mast);
    const red = toon(0xe63946), white = toon(0xf8f4ec), steel = toon(0x8d99ae);
    const legGeo = new T3.CylinderGeometry(.22, .22, 1, 6), legR = new T3.InstancedMesh(legGeo, red, 20), legW = new T3.InstancedMesh(legGeo, white, 20), o3 = new T3.Object3D(); let nr = 0, nw = 0;
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4;
      for (let s = 0; s < 10; s++) { const y0 = -1 - s * 5, r0 = 2.2 + s * .55, r1 = 2.2 + (s + 1) * .55, x0 = Math.cos(a) * r0, z0 = Math.sin(a) * r0, x1 = Math.cos(a) * r1, z1 = Math.sin(a) * r1, len = Math.hypot(5, r1 - r0);
        o3.position.set((x0 + x1) / 2, y0 - 2.5, (z0 + z1) / 2); o3.scale.set(1, 1, 1); o3.lookAt(x1, y0 - 5, z1); o3.rotateX(Math.PI / 2); o3.scale.set(1, len, 1); o3.updateMatrix();
        if (s % 2) legW.setMatrixAt(nw++, o3.matrix); else legR.setMatrixAt(nr++, o3.matrix); } }
    mast.add(legR, legW);
    const ringI = new T3.InstancedMesh(new T3.TorusGeometry(1, .08, 4, 4), steel, 10);
    for (let s = 0; s < 10; s++) { const r = (2.2 + s * .55 + .2) * 1.02; o3.position.set(0, -1 - s * 5, 0); o3.rotation.set(Math.PI / 2, 0, Math.PI / 4); o3.scale.set(r, r, 1); o3.updateMatrix(); ringI.setMatrixAt(s, o3.matrix); }
    mast.add(ringI);
    const lamp = new T3.Mesh(new T3.SphereGeometry(.18, 8, 6), new T3.MeshBasicMaterial({ color: 0xff2d55 })); lamp.position.set(0, -1, 0); mast.add(lamp); mast.userData.lamp = lamp;
    // Wolken: alle Wolkenbällchen in einem InstancedMesh (ein Zeichenaufruf)
    const nC = low ? 9 : 16, puffs = [];
    for (let k = 0; k < nC; k++) { const n = 3 + (k % 3), a = Math.random() * 6.283, d = 16 + Math.random() * 45, cx = Math.cos(a) * d, cy = -6 - Math.random() * 22, cz = Math.sin(a) * d, sp = .3 + Math.random() * .6;
      for (let j = 0; j < n; j++) puffs.push({ x: cx + j * 2.4 - n, y: cy + Math.random() * .8, z: cz + Math.random() * 1.5, sx: 2.4 + Math.random() * 2, sy: 1.2 + Math.random(), sz: 2 + Math.random() * 1.5, sp }); }
    const cloudI = new T3.InstancedMesh(new T3.SphereGeometry(1, 10, 8), toon(0xffffff), puffs.length); cloudI.instanceMatrix.setUsage(T3.DynamicDrawUsage); cloudI.frustumCulled = false; scene.add(cloudI); clouds = { m: cloudI, p: puffs, o: new T3.Object3D() };
    // Partikel
    const pg = new T3.BufferGeometry(); pg.setAttribute('position', new T3.BufferAttribute(new Float32Array(600 * 3), 3)); pg.setAttribute('color', new T3.BufferAttribute(new Float32Array(600 * 3), 3));
    parts = new T3.Points(pg, new T3.PointsMaterial({ size: .28, vertexColors: true, transparent: true, depthWrite: false })); parts.frustumCulled = false; scene.add(parts);
    for (let i = 0; i < 600; i++) pv.push({ x: 0, y: -999, z: 0, vx: 0, vy: 0, vz: 0, l: 0, g: 1 });
    ok = true; addEventListener('resize', resize); resize();
  }
  function resize() { if (!R || !host) return; const w = host.clientWidth || innerWidth, h = host.clientHeight || innerHeight; R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }

  // Arena aufbauen: Ringplatte (Lehm-Look wie ein Sumo-Ring) aus abbrechbaren Ringen, Farben und Nebel je Arena
  function platTex(A) {
    const RG = SM.RINGS, R0 = RG[0];
    return canvasTex(1024, 1024, (g, w) => {
      const c = w / 2, k = c / R0, base = new T3.Color(A.plat), hex = x => '#' + x.getHexString();
      g.fillStyle = A.plat; g.fillRect(0, 0, w, w);
      for (let n = 0; n < 2600; n++) { const a = Math.random() * 6.283, r = Math.sqrt(Math.random()) * c; g.fillStyle = Math.random() < .5 ? 'rgba(0,0,0,.05)' : 'rgba(255,255,255,.08)'; g.fillRect(c + Math.cos(a) * r, c + Math.sin(a) * r, 3, 3); }
      g.strokeStyle = 'rgba(0,0,0,.08)'; g.lineWidth = 3; for (let n = 0; n < 24; n++) { const a = n / 24 * 6.283; g.beginPath(); g.moveTo(c + Math.cos(a) * RG[RG.length - 1] * k, c + Math.sin(a) * RG[RG.length - 1] * k); g.lineTo(c + Math.cos(a) * c, c + Math.sin(a) * c); g.stroke(); }
      RG.forEach((r, n) => { g.strokeStyle = n ? 'rgba(60,40,30,.35)' : hex(base.clone().multiplyScalar(.6)); g.lineWidth = n ? 6 : 14; g.beginPath(); g.arc(c, c, r * k - 3, 0, 7); g.stroke(); });
      // Strohring (Tawara) innen
      g.strokeStyle = '#d8b56a'; g.lineWidth = 22; g.beginPath(); g.arc(c, c, RG[RG.length - 1] * k - 26, 0, 7); g.stroke(); g.strokeStyle = 'rgba(120,80,30,.4)'; g.lineWidth = 2; for (let n = 0; n < 90; n++) { const a = n / 90 * 6.283, r = RG[RG.length - 1] * k - 26; g.beginPath(); g.moveTo(c + Math.cos(a) * (r - 10), c + Math.sin(a) * (r - 10)); g.lineTo(c + Math.cos(a) * (r + 10), c + Math.sin(a) * (r + 10)); g.stroke(); }
      // Startlinien und Fantasie-Emblem in der Mitte
      g.fillStyle = '#ffffff'; g.fillRect(c - 70, c - 60, 12, 120); g.fillRect(c + 58, c - 60, 12, 120);
      g.globalAlpha = .9; g.fillStyle = A.acc; g.beginPath(); g.arc(c, c, 46, 0, 7); g.fill(); g.globalAlpha = 1; g.fillStyle = '#fff'; g.font = '900 26px system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('SUMO', c, c - 2);
    });
  }
  function setArena(A) {
    for (const r of rings) plat.remove(r); rings = []; if (core) plat.remove(core);
    const RG = SM.RINGS, R0 = RG[0], accent = new T3.Color(A.acc), tex = platTex(A), topMat = toon(0xffffff, { map: tex, side: T3.DoubleSide });
    scene.fog.color.set(A.fog); host.style.background = 'linear-gradient(180deg,' + A.sky[0] + ' 0%,' + A.sky[1] + ' 55%,' + A.sky[2] + ' 100%)';
    const mk = (r0, r1) => {
      const g = new T3.Group(), geo = new T3.RingGeometry(r0, r1, 72, 1), pos = geo.attributes.position, uv = geo.attributes.uv;
      for (let n = 0; n < pos.count; n++) uv.setXY(n, pos.getX(n) / (2 * R0) + .5, pos.getY(n) / (2 * R0) + .5);
      const top = new T3.Mesh(geo, topMat); top.rotation.x = -Math.PI / 2; g.add(top);
      const side = new T3.Mesh(new T3.CylinderGeometry(r1, r1 * .96, .55, 72, 1, true), toon(accent)); side.position.y = -.275; g.add(side);
      const band = new T3.Mesh(new T3.CylinderGeometry(r1 * 1.002, r1 * 1.002, .12, 72, 1, true), toon(0xffffff)); band.position.y = -.2; g.add(band);
      const bot = new T3.Mesh(new T3.RingGeometry(r0, r1 * .96, 72, 1), toon(0x433a5e, { side: T3.DoubleSide })); bot.rotation.x = Math.PI / 2; bot.position.y = -.55; g.add(bot);
      const stripe = new T3.Mesh(new T3.RingGeometry(r1 - .16, r1, 72, 1), new T3.MeshBasicMaterial({ color: accent, side: T3.DoubleSide })); stripe.rotation.x = -Math.PI / 2; stripe.position.y = .012; g.add(stripe);
      g.userData = { top, stripe, fall: -1 }; return g;
    };
    for (let k = 0; k < RG.length - 1; k++) { const g = mk(RG[k + 1], RG[k]); plat.add(g); rings.push(g); }
    core = mk(0, RG[RG.length - 1]); plat.add(core);
  }
  // Kämpfer bauen: Sumo-Ringer (Mensch) im Toon-Stil – Kopf mit Frisur, kräftiger Körper, Mawashi-Gürtel mit Fantasie-Emblem, Arme, Beine
  function limb(len, r, mat) { const g = new T3.Group(), m = outline(new T3.Mesh(new T3.CylinderGeometry(r, r * .92, len, 8), mat), 1.12); m.position.y = -len / 2; g.add(m); const e = new T3.Mesh(new T3.SphereGeometry(r * 1.08, 8, 6), mat); e.position.y = -len; g.add(e); g.userData.end = e; return g; }
  function mkFighter(fd, name) {
    const g = new T3.Group(), body = new T3.Group(); g.add(body);
    const skin = toon(fd.skin), dark = toon(new T3.Color(fd.skin).multiplyScalar(.82)), hair = toon(fd.hair), belt = toon(fd.col), belt2 = toon(new T3.Color(fd.col).multiplyScalar(.7));
    // Beine (Hüfte bei y .62)
    const legs = [];
    for (const s of [-1, 1]) { const L = limb(.42, .15, skin); L.position.set(0, .62, s * .24); body.add(L); const foot = new T3.Mesh(new T3.SphereGeometry(.15, 8, 6), dark); foot.scale.set(1.5, .55, 1); foot.position.set(.06, -.02, 0); L.userData.end.add(foot); legs.push(L); }
    // Körper
    const torso = outline(new T3.Mesh(new T3.SphereGeometry(.5, 22, 16), skin), 1.05); torso.scale.set(.95, 1.02, 1.08); torso.position.y = 1.0; body.add(torso);
    const belly = new T3.Mesh(new T3.SphereGeometry(.36, 18, 14), skin); belly.scale.set(.75, .8, 1); belly.position.set(.24, .86, 0); body.add(belly);
    // Mawashi (Gürtel) mit Schurz und Emblem
    const mw = outline(new T3.Mesh(new T3.CylinderGeometry(.47, .43, .26, 22), belt), 1.04); mw.position.y = .66; body.add(mw);
    const knotB = new T3.Mesh(new T3.SphereGeometry(.13, 8, 6), belt2); knotB.position.set(-.45, .7, 0); body.add(knotB);
    const apron = new T3.Mesh(new T3.PlaneGeometry(.42, .5), toon(fd.col, { side: T3.DoubleSide })); apron.position.set(.47, .46, 0); apron.rotation.y = Math.PI / 2; apron.rotation.x = 0; body.add(apron);
    const emb = new T3.Mesh(new T3.CircleGeometry(.17, 28), new T3.MeshBasicMaterial({ map: emblem(fd, 128), transparent: true })); emb.position.set(.475, .5, 0); emb.rotation.y = Math.PI / 2; body.add(emb);
    // Arme (Schulter bei y 1.22)
    const arms = [];
    for (const s of [-1, 1]) { const A = limb(.42, .13, skin); A.position.set(.02, 1.22, s * .5); A.rotation.x = -s * .55; body.add(A); const hand = new T3.Mesh(new T3.SphereGeometry(.13, 8, 6), skin); A.userData.end.add(hand); arms.push(A); }
    // Kopf
    const head = new T3.Group(); head.position.y = 1.62; body.add(head);
    const hd = outline(new T3.Mesh(new T3.SphereGeometry(.28, 18, 14), skin), 1.06); hd.scale.set(1, 1.04, .96); head.add(hd);
    for (const s of [-1, 1]) {
      const ear = new T3.Mesh(new T3.SphereGeometry(.07, 8, 6), skin); ear.position.set(-.02, -.02, s * .27); head.add(ear);
      const eye = new T3.Mesh(new T3.SphereGeometry(.045, 8, 6), new T3.MeshBasicMaterial({ color: 0x1a1230 })); eye.scale.set(.6, 1.2, 1); eye.position.set(.255, .04, s * .1); head.add(eye);
      const brow = new T3.Mesh(new T3.BoxGeometry(.03, .025, .1), new T3.MeshBasicMaterial({ color: fd.hair === '#e8eef7' ? 0x9aa5b8 : 0x1a1230 })); brow.position.set(.255, .13, s * .1); brow.rotation.x = s * -.25; head.add(brow); head.userData['brow' + s] = brow;
      const blush = new T3.Mesh(new T3.CircleGeometry(.045, 12), new T3.MeshBasicMaterial({ color: 0xff8fa3, transparent: true, opacity: .55 })); blush.position.set(.262, -.05, s * .16); blush.rotation.y = Math.PI / 2; head.add(blush);
    }
    const mouth = new T3.Mesh(new T3.BoxGeometry(.02, .028, .1), new T3.MeshBasicMaterial({ color: 0x7a2e2e })); mouth.position.set(.275, -.09, 0); head.add(mouth); head.userData.mouth = mouth;
    const nose = new T3.Mesh(new T3.SphereGeometry(.04, 8, 6), dark); nose.position.set(.285, -.01, 0); head.add(nose);
    // Haare / Frisur
    const cap = outline(new T3.Mesh(new T3.SphereGeometry(.295, 18, 12, 0, Math.PI * 2, 0, Math.PI * .45), hair), 1.04); cap.rotation.z = .35; cap.position.x = -.03; head.add(cap);
    const hs = fd.hs;
    if (hs === 'knot' || hs === 'beard') { const k = outline(new T3.Mesh(new T3.SphereGeometry(.09, 10, 8), hair), 1.12); k.scale.set(1.6, .8, .8); k.position.set(.02, .32, 0); head.add(k); }
    if (hs === 'buns') for (const s of [-1, 1]) { const b = outline(new T3.Mesh(new T3.SphereGeometry(.11, 10, 8), hair), 1.12); b.position.set(-.05, .24, s * .2); head.add(b); }
    if (hs === 'pony') { const pt = outline(new T3.Mesh(new T3.ConeGeometry(.1, .36, 10), hair), 1.1); pt.position.set(-.3, .02, 0); pt.rotation.z = -2.4; head.add(pt); }
    if (hs === 'mohawk') { for (let k = 0; k < 4; k++) { const m = new T3.Mesh(new T3.ConeGeometry(.06, .2, 6), hair); m.position.set(.14 - k * .1, .3 - Math.abs(k - 1.5) * .02, 0); m.rotation.z = .3 - k * .2; head.add(m); } }
    if (hs === 'beard') { const bd = outline(new T3.Mesh(new T3.SphereGeometry(.2, 12, 10, 0, Math.PI * 2, Math.PI * .45, Math.PI * .55), hair), 1.05); bd.position.set(.06, -.02, 0); head.add(bd); }
    if (fd.band) { const b = new T3.Mesh(new T3.TorusGeometry(.285, .035, 6, 24), toon(fd.col2)); b.rotation.z = Math.PI / 2 + .25; b.position.set(-.01, .12, 0); head.add(b); }
    // Schatten, Schild-Ring, Namensschild
    const sh = new T3.Mesh(new T3.CircleGeometry(.62, 24), new T3.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .25, depthWrite: false })); sh.rotation.x = -Math.PI / 2; sh.position.y = .015; g.add(sh);
    const ring = new T3.Mesh(new T3.TorusGeometry(.85, .05, 6, 40), new T3.MeshBasicMaterial({ color: 0x9ef0ff, transparent: true, opacity: 0 })); ring.rotation.x = Math.PI / 2; ring.position.y = .9; g.add(ring);
    let tag = null;
    if (name) { tag = new T3.Sprite(new T3.SpriteMaterial({ map: canvasTex(256, 64, (c, w, h) => { c.fillStyle = 'rgba(26,18,48,.8)'; c.beginPath(); if (c.roundRect) c.roundRect(4, 6, w - 8, h - 12, 26); else c.rect(4, 6, w - 8, h - 12); c.fill(); c.fillStyle = fd.col; c.font = '900 30px system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(name, w / 2, h / 2 + 1, w - 30); }), depthTest: false, transparent: true })); tag.scale.set(1.9, .48, 1); tag.position.y = 2.35; tag.renderOrder = 5; g.add(tag); }
    g.userData = { body, sh, ring, tag, squash: 0, mega: 1, legs, arms, head, walk: 0 };
    return g;
  }
  // Runde einrichten
  function setup(W, names) {
    W0 = W; for (const f of fighters) world.remove(f); fighters = [];
    for (const [, m] of pus) world.remove(m); pus.clear(); for (const w of warn) world.remove(w.m); warn = [];
    rings.forEach(r => { r.visible = true; r.position.set(0, 0, 0); r.rotation.set(0, 0, 0); r.userData.fall = -1; r.userData.stripe.material.color.set(W.A.acc); });
    core.scale.set(1, 1, 1);
    W.f.forEach((f, i) => { const g = mkFighter(SM.fighter(f.fid), names && names[i]); world.add(g); fighters.push(g); });
    camT = { x: 0, z: 0, d: 18 }; if (windLines) windLines.visible = false;
  }
  function burst(x, y, z, n, cols, sp, up, grav) {
    const ca = parts.geometry.attributes.color;
    for (let k = 0; k < n; k++) { pN = (pN + 1) % pv.length; const p = pv[pN], a = Math.random() * 6.283, s = sp * (.35 + Math.random() * .8);
      p.x = x; p.y = y; p.z = z; p.vx = Math.cos(a) * s; p.vz = Math.sin(a) * s; p.vy = up * (.4 + Math.random()); p.l = .6 + Math.random() * .7; p.g = grav == null ? 1 : grav;
      const c = new T3.Color(cols[k % cols.length]); ca.setXYZ(pN, c.r, c.g, c.b); }
    ca.needsUpdate = true;
  }
  function wave(x, z, r, col, dur) { const m = new T3.Mesh(new T3.RingGeometry(.7, 1, 48), new T3.MeshBasicMaterial({ color: col, transparent: true, side: T3.DoubleSide, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(x, .08, z); world.add(m); fx.push({ m, t: 0, d: dur || .5, r, kind: 'wave' }); }
  function bolt(x, z) {
    const pts = [], y0 = 22; let cx = x, cz = z; for (let k = 0; k <= 10; k++) { pts.push(new T3.Vector3(cx, y0 - k * y0 / 10, cz)); cx = x + (Math.random() - .5) * 1.4 * (1 - k / 10); cz = z + (Math.random() - .5) * 1.4 * (1 - k / 10); }
    pts[10].set(x, 0, z); const m = new T3.Line(new T3.BufferGeometry().setFromPoints(pts), new T3.LineBasicMaterial({ color: 0xfff6a8, transparent: true }));
    world.add(m); fx.push({ m, t: 0, d: .35, kind: 'bolt' });
  }
  const FC = i => W0 && W0.f[i] ? SM.fighter(W0.f[i].fid) : SM.FIGHTERS[0];
  // Ereignisse aus der Logik
  function onEvent(e) {
    if (e.k === 'clash' && e.p > 3) { burst(e.x, .7, e.z, Math.min(30, 6 + e.p * 2), ['#ffffff', '#ffe066', FC(e.i).col, FC(e.j).col], 3 + e.p * .3, 3); if (e.p > 7) shake = Math.max(shake, .25); }
    else if (e.k === 'dash') { burst(e.x, .2, e.z, 10, ['#ffffff', '#e8e2d6'], 2, 1.5); const g = fighters[e.i]; if (g) g.userData.squash = .35; }
    else if (e.k === 'slam') { wave(e.x, e.z, e.r, 0xffffff, .5); burst(e.x, .2, e.z, 26, ['#ffffff', FC(e.i).col], 6, 2); shake = Math.max(shake, .45); const g = fighters[e.i]; if (g) g.userData.squash = .6; }
    else if (e.k === 'fall') { burst(e.x, .3, e.z, 18, [FC(e.i).col, '#ffffff'], 3, 4); }
    else if (e.k === 'pu') { const g = fighters[e.i]; if (g) burst(g.position.x, 1, g.position.z, 24, ['#ffe066', '#ffffff', '#9ef0ff'], 3, 5); if (e.type === 'welle') shake = .4; }
    else if (e.k === 'strikeWarn') { const m = new T3.Mesh(new T3.RingGeometry(1.45, 1.7, 40), new T3.MeshBasicMaterial({ color: 0xffd23f, transparent: true, side: T3.DoubleSide, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(e.x, .06, e.z); world.add(m); warn.push({ m, x: e.x, z: e.z, t: 0 }); }
    else if (e.k === 'strike') { bolt(e.x, e.z); wave(e.x, e.z, 1.8, 0xfff6a8, .4); burst(e.x, .3, e.z, 30, ['#fff6a8', '#ffffff', '#b07ad9'], 5, 4); shake = Math.max(shake, .5); const i = warn.findIndex(w => Math.abs(w.x - e.x) < .01 && Math.abs(w.z - e.z) < .01); if (i >= 0) { world.remove(warn[i].m); warn.splice(i, 1); } }
    else if (e.k === 'ring') { const r = rings[e.ring - 1]; if (r) { r.userData.fall = 0; shake = Math.max(shake, .3); } }
    else if (e.k === 'roundEnd' && e.i >= 0) { const g = fighters[e.i]; if (g) for (let k = 0; k < 4; k++) setTimeout(() => burst(g.position.x, 2, g.position.z, 30, ['#ff5a4e', '#ffd166', '#06d6a0', '#3a86ff', '#c77dff'], 3, 8), k * 220); }
  }
  // Einzelbild: Kämpfer, Plattform, Effekte, Kamera
  function frame(W, dt, opts) {
    if (!ok) return; t += dt; opts = opts || {};
    if (W) {
      const A = W.A, tiltK = .1;
      world.rotation.set(A.haz === 'tilt' ? W.tilt.z * tiltK : 0, 0, A.haz === 'tilt' ? -W.tilt.x * tiltK : 0);
      // Ringe: Warnung blinkt, fallende Ringe kippen weg
      rings.forEach((r, k) => { const u = r.userData;
        if (u.fall >= 0) { u.fall += dt; r.position.y = -u.fall * u.fall * 9; r.rotation.x = u.fall * .6 * (k % 2 ? 1 : -1); r.rotation.z = u.fall * .4; if (u.fall > 3) r.visible = false; }
        else { u.stripe.visible = k === W.ring; u.stripe.material.color.set(W.warnRing === k + 1 && Math.sin(t * 18) > 0 ? '#ff2d55' : A.acc); } });
      core.userData.stripe.visible = W.ring >= rings.length;
      if (W.suddenDeath) { const s = W.R / SM.RINGS[SM.RINGS.length - 1]; core.scale.set(s, 1, s); core.userData.stripe.material.color.set(Math.sin(t * 10) > 0 ? '#ff2d55' : A.acc); }
      // Kämpfer
      W.f.forEach((f, i) => { const g = fighters[i]; if (!g) return; const u = g.userData;
        g.visible = f.alive || f.y > -14; if (!g.visible) return;
        g.position.set(f.x, f.y, f.z); g.rotation.y = -f.face;
        const mega = f.pu.mega > 0 ? 1.38 : 1; u.mega += (mega - u.mega) * Math.min(1, dt * 8); g.scale.setScalar(u.mega);
        u.squash = Math.max(0, u.squash - dt * 2.5); const sp = Math.hypot(f.vx, f.vz), bob = f.falling ? 0 : Math.abs(Math.sin(t * 10 + i)) * Math.min(.08, sp * .015);
        u.body.scale.set(1 + u.squash * .25, 1 - u.squash * .22 + (f.slamT > 0 ? .08 : 0), 1 + u.squash * .15); u.body.position.y = bob;
        if (f.falling) { u.body.rotation.z += dt * 5; u.body.rotation.x += dt * 3; } else { u.body.rotation.z = f.stun > 0 ? Math.sin(t * 40) * .15 : -Math.min(.25, sp * .03) - (f.dashT > 0 ? .3 : 0); u.body.rotation.x = 0; }
        // Laufen: Beine schwingen, Arme pendeln; Schubs = Arme nach vorn; Stampfer = Beine gespreizt; Sturz = zappeln
        const run = f.falling ? 1 : Math.min(1, sp / 4); u.walk += dt * (6 + sp * 1.6);
        u.legs.forEach((L, k) => { const s = k ? 1 : -1; L.rotation.z = f.slamT > 0 ? 0 : Math.sin(u.walk + k * Math.PI) * .7 * run; L.rotation.x = f.slamT > 0 ? s * -.5 : f.falling ? s * -.4 + Math.sin(t * 20 + k) * .3 : 0; });
        u.arms.forEach((A, k) => { const s = k ? 1 : -1, push = f.dashT > 0 || (f.dashCd > 0 && f.dashCd > 1.0); A.rotation.z = push ? 1.45 : f.falling ? 2.6 + Math.sin(t * 18 + k * 2) * .5 : f.slamT > 0 ? 2.8 : -Math.sin(u.walk + k * Math.PI) * .5 * run + .15; A.rotation.x = -s * (push ? .15 : f.falling ? 1.1 : f.slamT > 0 ? .4 : .55); });
        u.head.userData.mouth.scale.set(1, f.falling || f.dashT > 0 || f.slamT > 0 ? 3 : 1, f.falling ? .6 : 1);
        u.sh.visible = !f.falling; u.sh.position.y = -f.y + .015; u.sh.scale.setScalar(Math.max(.4, 1 - f.y * .2));
        u.ring.material.opacity = f.pu.schild > 0 ? .55 + Math.sin(t * 12) * .25 : 0; u.ring.rotation.z += dt * 3;
        u.ring.material.color.set(f.pu.turbo > 0 && f.pu.schild <= 0 ? '#ffe066' : '#9ef0ff'); if (f.pu.turbo > 0 && f.pu.schild <= 0) u.ring.material.opacity = .4 + Math.sin(t * 20) * .2;
        if (u.tag) u.tag.visible = tags && !f.falling;
        if (f.pu.turbo > 0 && Math.random() < .3 && !f.falling) burst(f.x, .2, f.z, 1, ['#ffe066'], .5, 1);
      });
      // Power-ups
      const seen = new Set();
      for (const p of W.pus) { seen.add(p); let m = pus.get(p);
        if (!m) { m = new T3.Group(); const ic = SM.PU[p.type].ic, sp = new T3.Sprite(new T3.SpriteMaterial({ map: canvasTex(128, 128, (g, w) => { g.fillStyle = '#ffffff'; g.beginPath(); g.arc(w / 2, w / 2, w / 2 - 6, 0, 7); g.fill(); g.lineWidth = 8; g.strokeStyle = '#1a1230'; g.stroke(); g.font = '64px system-ui, "Apple Color Emoji", "Segoe UI Emoji", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ic, w / 2, w / 2 + 4); }), transparent: true })); sp.scale.set(1, 1, 1); sp.position.y = .9; m.add(sp);
          const base = new T3.Mesh(new T3.CylinderGeometry(.35, .45, .15, 20), toon(0xffe066)); base.position.y = .08; m.add(base); m.userData.sp = sp; world.add(m); pus.set(p, m); burst(p.x, .5, p.z, 14, ['#ffe066', '#ffffff'], 2, 3); }
        m.position.set(p.x, 0, p.z); m.userData.sp.position.y = .9 + Math.sin(t * 3 + p.x) * .15; }
      for (const [p, m] of pus) if (!seen.has(p)) { world.remove(m); pus.delete(p); }
      // Blitz-Warnkreise pulsieren
      for (const w of warn) { w.t += dt; const s = 1 + Math.sin(w.t * 20) * .06; w.m.scale.set(s, s, s); w.m.material.opacity = .5 + w.t * .4; }
      // Wind: Streifen in Windrichtung
      if (W.wind.t > 0 || W.wind.warn > 0) {
        if (!windLines) { const g = new T3.BufferGeometry(), n = 60, a = new Float32Array(n * 6); g.setAttribute('position', new T3.BufferAttribute(a, 3)); windLines = new T3.LineSegments(g, new T3.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: .7 })); windLines.frustumCulled = false; world.add(windLines); windLines.userData.p = Array.from({ length: n }, () => ({ x: (Math.random() - .5) * 24, y: .3 + Math.random() * 3, z: (Math.random() - .5) * 24 })); }
        windLines.visible = true; windLines.material.opacity = W.wind.t > 0 ? .75 : .25; const a = windLines.geometry.attributes.position, sp = W.wind.t > 0 ? 22 : 6;
        windLines.userData.p.forEach((p, k) => { p.x += W.wind.x * sp * dt; p.z += W.wind.z * sp * dt; if (Math.abs(p.x) > 12 || Math.abs(p.z) > 12) { p.x = -W.wind.x * 11 + (Math.random() - .5) * 20 * Math.abs(W.wind.z); p.z = -W.wind.z * 11 + (Math.random() - .5) * 20 * Math.abs(W.wind.x); }
          a.setXYZ(k * 2, p.x, p.y, p.z); a.setXYZ(k * 2 + 1, p.x - W.wind.x * 1.2, p.y, p.z - W.wind.z * 1.2); }); a.needsUpdate = true;
      } else if (windLines) windLines.visible = false;
      // Kamera: rahmt alle, die noch oben sind
      const L = W.f.filter(f => f.alive && !f.falling); let cx = 0, cz = 0, sp = 0;
      if (L.length && !opts.orbit) { for (const f of L) { cx += f.x; cz += f.z; } cx /= L.length; cz /= L.length; for (const f of L) sp = Math.max(sp, Math.hypot(f.x - cx, f.z - cz)); cx *= .55; cz *= .55; }
      const asp = Math.max(.6, Math.min(1.8, cam.aspect)), want = Math.max(8, (Math.max(sp + 2, W.R * .62 + 1.2)) * 2.3 / Math.sqrt(asp) + 2);
      camT.x += (cx - camT.x) * Math.min(1, dt * 2.2); camT.z += (cz - camT.z) * Math.min(1, dt * 2.2); camT.d += (want - camT.d) * Math.min(1, dt * 1.6);
    }
    if (opts.orbit) orbit += dt * .12; else orbit += (0 - orbit) * Math.min(1, dt * 2);
    const el = opts.orbit ? .5 : .74, d = camT.d * (opts.orbit ? 1.2 : 1);
    cam.position.set(camT.x + Math.sin(orbit) * Math.cos(el) * d, Math.sin(el) * d + 1, camT.z + Math.cos(orbit) * Math.cos(el) * d);
    if (shake > 0) { shake = Math.max(0, shake - dt * 1.6); cam.position.x += (Math.random() - .5) * shake; cam.position.y += (Math.random() - .5) * shake; }
    cam.lookAt(camT.x, 0, camT.z);
    // Wolken treiben, Masten-Lampe blinkt
    { const C = clouds; C.p.forEach((q, n) => { q.x += q.sp * dt; if (q.x > 70) q.x = -70; C.o.position.set(q.x, q.y, q.z); C.o.scale.set(q.sx, q.sy, q.sz); C.o.updateMatrix(); C.m.setMatrixAt(n, C.o.matrix); }); C.m.instanceMatrix.needsUpdate = true; }
    mast.userData.lamp.material.color.set(Math.sin(t * 4) > 0 ? 0xff2d55 : 0x5a1020);
    // Effekte
    for (let i = fx.length - 1; i >= 0; i--) { const e = fx[i]; e.t += dt; const k = e.t / e.d;
      if (k >= 1) { world.remove(e.m); e.m.geometry.dispose(); e.m.material.dispose(); fx.splice(i, 1); continue; }
      if (e.kind === 'wave') { e.m.scale.setScalar(.5 + k * e.r); e.m.material.opacity = 1 - k; } else e.m.material.opacity = 1 - k; }
    const pa = parts.geometry.attributes.position; let any = false;
    for (let i = 0; i < pv.length; i++) { const p = pv[i]; if (p.l <= 0) { if (p.y !== -999) { p.y = -999; pa.setXYZ(i, 0, -999, 0); any = true; } continue; } any = true; p.l -= dt; p.vy -= 12 * p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; pa.setXYZ(i, p.x, p.y, p.z); }
    if (any) pa.needsUpdate = true;
    R.render(scene, cam);
  }
  // Bildschirmposition eines Kämpfers (für Treffer-Texte im HUD)
  function screenPos(f) { v3.set(f.x, f.y + 1.6, f.z); world.localToWorld(v3); v3.project(cam); return { x: (v3.x + 1) / 2, y: (1 - v3.y) / 2 }; }
  window.SMScene = { info: () => R.info.render, init, resize, setArena, setup, frame, fx: onEvent, screenPos, set tags(v) { tags = !!v; }, get ready() { return ok; } };
})();
