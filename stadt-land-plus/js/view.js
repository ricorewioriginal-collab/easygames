/* Stadt Land Plus – 3D (Three.js r128): schwebende Buchstaben-Würfel als Hintergrund, Buchstaben-Trommel für die Auslosung,
 * großer leuchtender Buchstabe und ein Globus mit Stecknadel für die Infos zu Städten, Ländern und Flüssen. */
(function () {
  'use strict';
  const T = THREE;
  let R = null, scene, cam, W = 1, H = 1, time = 0, cubes = [], drum = null, big = null, mode = 'menu', roll = null;
  const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), COLS = ['#ff5a7a', '#ffc23a', '#3ad0ff', '#7a6aff', '#3ae09a', '#ff8a3a'];
  const texC = {};
  function letterTex(l, bg, fg) {
    const k = l + bg + fg; if (texC[k]) return texC[k];
    const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 128, 128); g.addColorStop(0, bg); g.addColorStop(1, shade(bg, -40)); x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = 6; x.strokeRect(5, 5, 118, 118);
    x.fillStyle = fg || '#ffffff'; x.font = '700 92px Fredoka, system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(l, 64, 70);
    const t = new T.CanvasTexture(c); t.anisotropy = 4; return texC[k] = t;
  }
  function shade(hex, d) { const n = parseInt(hex.slice(1), 16), c = v => Math.max(0, Math.min(255, v + d)); return '#' + ((c(n >> 16) << 16) | (c((n >> 8) & 255) << 8) | c(n & 255)).toString(16).padStart(6, '0'); }
  function init(canvas) {
    R = new T.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); R.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
    scene = new T.Scene(); scene.add(new T.HemisphereLight(0xffffff, 0x3a2a6a, .9)); const d = new T.DirectionalLight(0xffffff, .6); d.position.set(3, 5, 6); scene.add(d);
    cam = new T.PerspectiveCamera(50, 1, .1, 100); cam.position.set(0, 0, 12);
    const geo = new T.BoxGeometry(1, 1, 1);
    for (let i = 0; i < 34; i++) {
      const l = ABC[i % 26], col = COLS[i % COLS.length], m = new T.Mesh(geo, new T.MeshLambertMaterial({ map: letterTex(l, col) }));
      m.position.set((Math.random() - .5) * 22, (Math.random() - .5) * 13, -Math.random() * 14 - 2); m.rotation.set(Math.random() * 6, Math.random() * 6, 0);
      const s = .6 + Math.random() * .8; m.scale.setScalar(s); m.userData = { vx: (Math.random() - .5) * .3, vy: .15 + Math.random() * .35, rx: (Math.random() - .5) * .6, ry: (Math.random() - .5) * .6 };
      scene.add(m); cubes.push(m);
    }
    // Trommel mit allen Buchstaben
    drum = new T.Group(); drum.visible = false; scene.add(drum); const R0 = 4.2;
    ABC.forEach((l, i) => { const a = i / 26 * Math.PI * 2, m = new T.Mesh(geo, new T.MeshLambertMaterial({ map: letterTex(l, COLS[i % COLS.length]) })); m.position.set(0, Math.sin(a) * R0, Math.cos(a) * R0); m.rotation.x = -a; m.scale.set(1.5, 1.5, .5); m.userData.l = l; drum.add(m); });
    const ring = new T.Mesh(new T.TorusGeometry(R0, .12, 8, 64), new T.MeshLambertMaterial({ color: '#ffffff' })); ring.rotation.y = Math.PI / 2; drum.add(ring);
    big = new T.Mesh(geo, new T.MeshLambertMaterial({ map: letterTex('A', '#ffc23a', '#2a1a4a') })); big.visible = false; big.scale.setScalar(3.4); scene.add(big);
  }
  function setMode(m) { mode = m; drum.visible = m === 'roll'; if (m !== 'roll' && m !== 'letter') big.visible = false; }
  // Auslosung: Trommel dreht und bleibt beim Buchstaben stehen, dann springt er nach vorn
  function rollTo(letter, dur, cb) {
    setMode('roll'); big.visible = false; const i = ABC.indexOf(letter), target = (i / 26) * Math.PI * 2 + Math.PI * 2 * 4;
    roll = { t: 0, dur: dur || 2.6, from: drum.rotation.x % (Math.PI * 2), to: target, letter, cb };
  }
  function showLetter(l) { big.material.map = letterTex(l, '#ffc23a', '#2a1a4a'); big.material.needsUpdate = true; big.visible = true; mode = 'letter'; big.userData.t = 0; }
  function render(dt) {
    if (!R) return; time += dt;
    for (const m of cubes) { const u = m.userData; m.position.x += u.vx * dt; m.position.y += u.vy * dt; m.rotation.x += u.rx * dt; m.rotation.y += u.ry * dt; if (m.position.y > 8) { m.position.y = -8; m.position.x = (Math.random() - .5) * 22; } }
    if (mode === 'roll' && roll) {
      roll.t += dt; const p = Math.min(1, roll.t / roll.dur), e = 1 - Math.pow(1 - p, 3); drum.rotation.x = roll.from + (roll.to - roll.from) * e; drum.position.z = 2;
      if (p >= 1) { const r = roll; roll = null; drum.visible = false; showLetter(r.letter); if (r.cb) r.cb(); }
    }
    if (big.visible) { big.userData.t = (big.userData.t || 0) + dt; const k = Math.min(1, big.userData.t * 3); big.position.set(0, 0, 3 * (1 - k) + 1); big.rotation.y = Math.sin(time * 1.2) * .35; big.rotation.x = Math.sin(time * .9) * .15; }
    cam.position.x = Math.sin(time * .1) * .8; cam.lookAt(0, 0, 0);
    R.render(scene, cam);
  }
  function resize(w, h) { W = w; H = h; if (!R) return; R.setSize(w, h, false); cam.aspect = w / h; cam.fov = w < h ? 70 : 50; cam.updateProjectionMatrix(); }
  /* ---------- Globus für die Infos ---------- */
  let G = null;
  function globeTex() {
    const D = window.SLF_DB && window.SLF_DB.welt; const c = document.createElement('canvas'); c.width = 720; c.height = 360; const x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 0, 360); g.addColorStop(0, '#1a4a9a'); g.addColorStop(.5, '#2a7ad8'); g.addColorStop(1, '#1a4a9a'); x.fillStyle = g; x.fillRect(0, 0, 720, 360);
    if (D) { const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'; let i = 0; for (const ch of D.d) { const v = A.indexOf(ch); for (let b = 5; b >= 0; b--, i++) if ((v >> b) & 1) { const cx = i % D.w, cy = (i / D.w) | 0; x.fillStyle = cy > 76 ? '#eef4ff' : cy < 12 ? '#dfe8f0' : ['#4ab05a', '#5ac06a', '#3a9a4a'][(cx + cy) % 3]; x.fillRect(cx * 4, cy * 4, 4.4, 4.4); } } }
    return new T.CanvasTexture(c);
  }
  function globe(canvas, lat, lon, label) {
    if (!G) { const r = new T.WebGLRenderer({ canvas, antialias: true, alpha: true }); const s = new T.Scene(); s.add(new T.HemisphereLight(0xffffff, 0x223355, 1)); const d = new T.DirectionalLight(0xffffff, .5); d.position.set(3, 2, 5); s.add(d);
      const c = new T.PerspectiveCamera(35, 1, .1, 50); c.position.set(0, 0, 4.2);
      const sphere = new T.Mesh(new T.SphereGeometry(1, 48, 32), new T.MeshLambertMaterial({ map: globeTex() })); const grp = new T.Group(); grp.add(sphere); s.add(grp);
      const pin = new T.Group(); const head = new T.Mesh(new T.SphereGeometry(.07, 16, 12), new T.MeshBasicMaterial({ color: '#ff2a4a' })); head.position.y = .2; pin.add(head); const st = new T.Mesh(new T.CylinderGeometry(.012, .012, .2, 8), new T.MeshBasicMaterial({ color: '#ffffff' })); st.position.y = .1; pin.add(st); grp.add(pin);
      const glow = new T.Mesh(new T.SphereGeometry(1.06, 32, 24), new T.MeshBasicMaterial({ color: '#7ad0ff', transparent: true, opacity: .12 })); s.add(glow);
      G = { r, s, c, grp, pin, canvas, rot: 0, want: 0, wantX: 0 }; }
    if (G.canvas !== canvas) { G.r.dispose(); G = null; return globe(canvas, lat, lon, label); }
    const w = canvas.clientWidth || 220, h = canvas.clientHeight || 220; G.r.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); G.r.setSize(w, h, false); G.c.aspect = w / h; G.c.updateProjectionMatrix();
    G.pin.visible = lat != null; if (lat != null) { const phi = (90 - lat) * Math.PI / 180, th = (lon + 180) * Math.PI / 180, v = new T.Vector3(-Math.sin(phi) * Math.cos(th), Math.cos(phi), Math.sin(phi) * Math.sin(th)); G.pin.position.copy(v); G.pin.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), v); G.want = -(lon + 90) * Math.PI / 180; G.wantX = lat * Math.PI / 180 * .8; }
    G.active = true;
  }
  function globeFrame(dt) { if (!G || !G.active) return; G.grp.rotation.y += (G.want - G.grp.rotation.y) * Math.min(1, dt * 3) + (G.pin.visible ? 0 : dt * .3); G.grp.rotation.x += (G.wantX - G.grp.rotation.x) * Math.min(1, dt * 3); G.r.render(G.s, G.c); }
  function globeOff() { if (G) G.active = false; }
  window.SLFView = { init, render, resize, setMode, rollTo, showLetter, globe, globeFrame, globeOff };
})();
