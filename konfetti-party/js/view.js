/* Konfetti-Party – 3D-Ansicht (Three.js r128): Arena schräg von oben, Säulen wie Torten, Geschenkkartons, Knallbonbons,
 * Konfetti-Strahlen mit bunten Schnipseln, Extras, Partygäste mit Partyhut. Namen und Sprechblasen über eine DOM-Ebene. */
(function () {
  'use strict';
  const T = THREE, D = KP_DATA, { GUESTS, POWERS } = D;
  let R = null, scene, cam, W = 1, H = 1, G = null, th = null, root = null, ovl = null, time = 0, cells = [], itemsM = [], bombsM = new Map(), bits = [], names = {}, shake = 0;
  const mats = {}, lam = (c, o) => { const k = c + (o ? JSON.stringify(o) : ''); return mats[k] || (mats[k] = new T.MeshLambertMaterial(Object.assign({ color: c }, o || {}))); };
  const bas = (c, o) => { const k = 'b' + c + (o ? JSON.stringify(o) : ''); return mats[k] || (mats[k] = new T.MeshBasicMaterial(Object.assign({ color: c }, o || {}))); };
  const GE = {}, geo = (k, f) => GE[k] || (GE[k] = f());
  const box = () => geo('box', () => new T.BoxGeometry(1, 1, 1)), sph = () => geo('sph', () => new T.SphereGeometry(1, 14, 10)), cyl = () => geo('cyl', () => new T.CylinderGeometry(1, 1, 1, 18)), cone = () => geo('cone', () => new T.ConeGeometry(1, 1, 14)), pln = () => geo('pln', () => new T.PlaneGeometry(1, 1));
  function part(p, g, m, x, y, z, sx, sy, sz, rx, ry, rz) { const o = new T.Mesh(g, m); o.position.set(x, y, z); o.scale.set(sx, sy == null ? sx : sy, sz == null ? sx : sz); if (rx || ry || rz) o.rotation.set(rx || 0, ry || 0, rz || 0); p.add(o); return o; }
  const texC = {}; function emojiTex(e) { if (texC[e]) return texC[e]; const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); x.fillStyle = '#ffffff'; x.beginPath(); x.arc(64, 64, 60, 0, 7); x.fill(); x.strokeStyle = '#ffd02a'; x.lineWidth = 8; x.stroke(); x.font = '78px serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(e, 64, 70); return texC[e] = new T.CanvasTexture(c); }
  const CONF = ['#ff4a6a', '#ffd02a', '#3ab0ff', '#5ad06a', '#ff6ad8', '#ffffff', '#8a6aff'];

  function init(canvas) {
    R = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' }); R.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
    scene = new T.Scene(); scene.add(new T.HemisphereLight(0xffffff, 0x6a5a7a, .72)); const d = new T.DirectionalLight(0xffffff, .5); d.position.set(-5, 12, 7); scene.add(d);
    cam = new T.PerspectiveCamera(36, 1, .1, 200);
  }
  function setArena(g, overlay) {
    G = g; th = G.A.theme; ovl = overlay; if (root) scene.remove(root); root = new T.Group(); scene.add(root); scene.background = new T.Color(th.bg);
    const c = document.createElement('canvas'); c.width = G.W * 32; c.height = G.H * 32; const x = c.getContext('2d');
    for (let r = 0; r < G.H; r++) for (let q = 0; q < G.W; q++) { x.fillStyle = th.floor[(r + q) % 2]; x.fillRect(q * 32, r * 32, 32, 32); }
    const ft = new T.CanvasTexture(c); ft.magFilter = T.NearestFilter;
    G.floorTex = ft; G.floorCan = c;
    part(root, pln(), new T.MeshLambertMaterial({ map: ft }), G.W / 2, 0, G.H / 2, G.W, G.H, 1, -Math.PI / 2);
    part(root, pln(), lam(th.wall), G.W / 2, -.02, G.H / 2, G.W + 40, G.H + 40, 1, -Math.PI / 2);
    cells = new Array(G.W * G.H).fill(null); itemsM = new Array(G.W * G.H).fill(null); bombsM = new Map(); bits = []; names = {};
    if (ovl) ovl.innerHTML = '';
    G.players.forEach(p => { p.view = guestMesh(GUESTS[p.look % GUESTS.length]); p.view.scale.setScalar(1.3); root.add(p.view); });
    fitCam(); sync(true);
  }
  function cellMesh(kind, i) {
    const g = new T.Group(), c = i % G.W, r = (i / G.W) | 0; g.position.set(c + .5, 0, r + .5); g.userData.kind = kind;
    const edge = c === 0 || r === 0 || c === G.W - 1 || r === G.H - 1;
    if (kind === 1) { if (edge) { part(g, box(), lam(th.wall), 0, .45, 0, 1, .9, 1); part(g, box(), lam(th.pillar), 0, .92, 0, 1, .06, 1); } else { part(g, cyl(), lam(th.pillar), 0, .45, 0, .46, .9, .46); part(g, cyl(), lam(th.top), 0, .93, 0, .48, .08, .48); for (let k = 0; k < 6; k++) { const a = k / 6 * 6.28; part(g, sph(), lam(CONF[k % CONF.length]), Math.cos(a) * .33, .99, Math.sin(a) * .33, .06); } part(g, cyl(), lam('#fff8e0'), 0, 1.1, 0, .03, .28, .03); part(g, cone(), bas('#ffb020'), 0, 1.3, 0, .05, .1, .05); } }
    else if (kind === 2) { const col = th.crate[(i * 7) % th.crate.length]; part(g, box(), lam(col), 0, .38, 0, .84, .76, .84); part(g, box(), lam('#ffffff'), 0, .38, 0, .86, .78, .16); part(g, box(), lam('#ffffff'), 0, .38, 0, .16, .78, .86); part(g, sph(), lam('#ffffff'), -.1, .82, 0, .14, .08, .1, 0, 0, .5); part(g, sph(), lam('#ffffff'), .1, .82, 0, .14, .08, .1, 0, 0, -.5); g.rotation.y = ((i * 13) % 5 - 2) * .05; }
    else if (kind === 3) { part(g, box(), lam('#3a3a4a'), 0, .45, 0, .98, .9, .98); part(g, box(), lam('#ffd02a'), 0, .91, 0, .98, .04, .2); g.position.y = 3; g.userData.fall = true; }
    root.add(g); return g;
  }
  function itemMesh(k) {
    const g = new T.Group(); const m = part(g, pln(), new T.MeshBasicMaterial({ map: emojiTex(POWERS[k].icon), transparent: true }), 0, .45, 0, .66, .66, 1, -1.0); m.userData.bob = true;
    part(g, geo('ring', () => new T.RingGeometry(.3, .4, 20)), bas('#ffd02a', { transparent: true, opacity: .7, side: T.DoubleSide }), 0, .03, 0, 1, 1, 1, -Math.PI / 2);
    root.add(g); return g;
  }
  function bombMesh(b) {
    const g = new T.Group(), col = b.remote ? '#3ab0ff' : CONF[(b.owner * 2) % CONF.length];
    const body = new T.Group(); body.position.y = .32; g.add(body);
    part(body, cyl(), lam(col), 0, 0, 0, .22, .5, .22, 0, 0, Math.PI / 2); part(body, cyl(), lam('#ffffff'), 0, 0, 0, .225, .08, .225, 0, 0, Math.PI / 2);
    for (const s of [-1, 1]) part(body, cone(), lam(col), s * .38, 0, 0, .2, .28, .2, 0, 0, s * Math.PI / 2);
    if (b.remote) part(body, cyl(), lam('#2a2a30'), 0, .3, 0, .02, .3, .02); else part(body, sph(), bas('#ffd02a'), 0, .27, 0, .06);
    g.userData.body = body; root.add(g); return g;
  }
  function guestMesh(c) {
    const g = new T.Group(), skin = lam(c.skin);
    part(g, sph(), new T.MeshBasicMaterial({ color: '#000', transparent: true, opacity: .25, depthWrite: false }), 0, .01, 0, .32, .01, .32);
    const body = new T.Group(); g.add(body);
    part(body, sph(), lam(c.col), 0, .34, 0, .27, .3, .25); for (const s of [-1, 1]) part(body, sph(), lam('#3a2a4a'), s * .12, .06, .05, .09, .06, .12);
    const head = new T.Group(); head.position.y = .76; body.add(head);
    part(head, sph(), skin, 0, 0, 0, .22); for (const s of [-1, 1]) { part(head, sph(), lam('#1a1a1a'), s * .08, .03, .19, .035); part(head, sph(), lam('#ff9a9a'), s * .13, -.05, .16, .04); }
    part(head, cone(), lam(c.hat), 0, .3, -.02, .14, .34, .14, -.15); part(head, sph(), lam('#ffffff'), 0, .48, -.05, .06);
    const hands = []; for (const s of [-1, 1]) hands.push(part(body, sph(), skin, s * .29, .38, .06, .07));
    const shield = part(g, sph(), new T.MeshLambertMaterial({ color: '#ff8ad8', transparent: true, opacity: .3, depthWrite: false }), 0, .45, 0, .52); shield.visible = false;
    const stars = new T.Group(); stars.position.y = 1.25; g.add(stars); for (let k = 0; k < 3; k++) part(stars, sph(), bas('#ffd02a'), Math.cos(k * 2.1) * .2, 0, Math.sin(k * 2.1) * .2, .05); stars.visible = false;
    g.userData = { body, head, hands, shield, stars };
    return g;
  }
  function burst(x, z, n, y) { for (let k = 0; k < n; k++) { let b = bits.find(q => !q.visible); if (!b) { if (bits.length > 260) return; b = part(root, pln(), bas(CONF[bits.length % CONF.length], { side: T.DoubleSide }), 0, 0, 0, .1, .06, 1); bits.push(b); } b.visible = true; b.position.set(x + (Math.random() - .5) * .4, y || .5, z + (Math.random() - .5) * .4); b.userData = { vx: (Math.random() - .5) * 5, vy: 2 + Math.random() * 4, vz: (Math.random() - .5) * 5, t: .8 + Math.random() * .6, sp: (Math.random() - .5) * 20 }; } }
  // Raster, Extras, Bonbons mit dem Spielstand abgleichen
  function sync(all) {
    for (let i = 0; i < G.grid.length; i++) {
      const k = G.grid[i], m = cells[i];
      if (k && (!m || m.userData.kind !== k)) { if (m) root.remove(m); cells[i] = cellMesh(k, i); }
      else if (!k && m) { root.remove(m); cells[i] = null; if (!all) burst(i % G.W + .5, ((i / G.W) | 0) + .5, 10, .5); }
      const it = G.items[i], im = itemsM[i];
      if (it >= 0 && (!im || im.userData.k !== it)) { if (im) root.remove(im); const nm = itemMesh(KP.PKEYS[it]); nm.position.set(i % G.W + .5, 0, ((i / G.W) | 0) + .5); nm.userData.k = it; itemsM[i] = nm; }
      else if (it < 0 && im) { root.remove(im); itemsM[i] = null; }
    }
    const seen = new Set();
    for (const b of G.bombs) { let m = bombsM.get(b); if (!m) { m = bombMesh(b); bombsM.set(b, m); } m.position.set(b.x, 0, b.z); const f = b.remote ? 1 : 1 + Math.sin(time * (b.t < .8 ? 30 : 10)) * .08 + (b.t < .8 ? .1 : 0); m.userData.body.scale.setScalar(f); m.userData.body.rotation.y = b.slide ? time * 12 : 0; seen.add(b); }
    for (const [b, m] of bombsM) if (!seen.has(b)) { root.remove(m); bombsM.delete(b); }
  }
  function onEvent(e) {
    if (e.e === 'boom') { shake = Math.min(.25, shake + .12); }
    if (e.e === 'out') { const p = G.players[e.i]; burst(p.x, p.z, 40, .6); }
    if (e.e === 'power') { const p = G.players[e.i]; burst(p.x, p.z, 8, 1); }
  }
  let blastM = [];
  function render(dt, opt) {
    if (!R || !G) return; time += dt; opt = opt || {};
    sync(false);
    // Konfetti-Strahlen
    let bi = 0; for (const bl of G.blasts) for (const [x, z] of bl.cells) { let m = blastM[bi]; if (!m) { m = part(root, box(), bas('#ffffff', { transparent: true, opacity: .85 }), 0, 0, 0, 1); blastM.push(m); } bi++; const f = bl.t / KP.BLAST; m.visible = true; m.material = bas(CONF[(x * 3 + z * 5 + ((time * 20) | 0)) % CONF.length], { transparent: true, opacity: .85 }); m.position.set(x + .5, .35, z + .5); m.scale.set(.86 * (.4 + .6 * f), .5 * f + .1, .86 * (.4 + .6 * f)); if (Math.random() < .25) burst(x + .5, z + .5, 1, .6); }
    for (let k = bi; k < blastM.length; k++) blastM[k].visible = false;
    cells.forEach(m => { if (m && m.userData.fall) { m.position.y = Math.max(0, m.position.y - dt * 14); if (!m.position.y) m.userData.fall = false; } });
    itemsM.forEach(m => { if (m) { m.children[0].position.y = .45 + Math.sin(time * 4 + m.position.x) * .07; m.children[1].scale.setScalar(1 + .12 * Math.sin(time * 6)); } });
    bits.forEach(b => { if (!b.visible) return; const u = b.userData; u.t -= dt; if (u.t <= 0 || b.position.y < .02) { b.visible = u.t > 0 && false; return; } b.position.x += u.vx * dt; b.position.y += u.vy * dt; b.position.z += u.vz * dt; u.vy -= 9 * dt; u.vx *= .98; u.vz *= .98; b.rotation.x += u.sp * dt; b.rotation.y += u.sp * .7 * dt; });
    if (G.A.id === 'disco' && G.floorTex && ((time * 4) | 0) !== G.discoT) { G.discoT = (time * 4) | 0; const x = G.floorCan.getContext('2d'); for (let r = 1; r < G.H - 1; r++) for (let q = 1; q < G.W - 1; q++) { const lit = ((q * 7 + r * 13 + G.discoT) % 9) < 2; x.fillStyle = lit ? CONF[(q + r + G.discoT) % CONF.length] : th.floor[(r + q) % 2]; x.fillRect(q * 32, r * 32, 32, 32); } G.floorTex.needsUpdate = true; }
    G.players.forEach((p, i) => {
      const m = p.view, u = m.userData; m.visible = p.alive || G.roundOver === undefined; if (!p.alive) { m.visible = false; return; } m.visible = true;
      m.position.set(p.x, G.A.id === 'weltall' ? Math.sin(time * 2 + i) * .06 : 0, p.z);
      const ang = Math.atan2(p.dir[0], p.dir[1]); let d = ang - m.rotation.y; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; m.rotation.y += d * Math.min(1, dt * 18);
      u.body.position.y = p.moving ? Math.abs(Math.sin(time * 16 + i)) * .08 : Math.sin(time * 3 + i) * .015;
      u.hands.forEach((h, k) => { h.position.y = .38 + (p.moving ? Math.sin(time * 16 + k * 3) * .06 : 0); });
      u.shield.visible = p.shield || p.inv > 0; if (u.shield.visible) u.shield.material.opacity = p.inv > 0 ? .15 + .15 * Math.sin(time * 30) : .3;
      u.stars.visible = p.wirr > 0; if (u.stars.visible) u.stars.rotation.y = time * 6;
      if (opt.names && ovl) { let e = names[i]; if (!e) { e = names[i] = document.createElement('div'); e.className = 'pname'; e.style.setProperty('--c', GUESTS[p.look % 4].col); ovl.appendChild(e); } e.textContent = p.name; const v = new T.Vector3(p.x, 1.55, p.z).project(cam); e.style.transform = `translate(${(v.x + 1) / 2 * W}px,${(1 - v.y) / 2 * H}px) translate(-50%,-100%)`; e.hidden = false; }
    });
    for (const k in names) if (!G.players[k] || !G.players[k].alive || !opt.names) names[k].hidden = true;
    if (shake > 0) { shake = Math.max(0, shake - dt * .8); cam.position.x = camBase.x + (Math.random() - .5) * shake; cam.position.z = camBase.z + (Math.random() - .5) * shake; } else if (camBase) cam.position.copy(camBase);
    R.render(scene, cam);
  }
  let camBase = null;
  function fitCam() {
    if (!G) return; const a = W / H, vf = 36 * Math.PI / 180, hf = 2 * Math.atan(Math.tan(vf / 2) * a);
    const d = Math.max((G.W + .6) / 2 / Math.tan(hf / 2), (G.H + 1.6) / 2 / Math.tan(vf / 2) * .9);
    cam.position.set(G.W / 2, d * .9, G.H / 2 + d * .42); cam.lookAt(G.W / 2, 0, G.H / 2 + .2); cam.aspect = a; cam.updateProjectionMatrix(); camBase = cam.position.clone();
  }
  function screenOf(x, y, z) { const v = new T.Vector3(x, y, z).project(cam); return [(v.x + 1) / 2 * W, (1 - v.y) / 2 * H]; }
  function resize(w, h) { W = w; H = h; if (R) R.setSize(w, h, false); fitCam(); }
  window.KPView = { init, setArena, render, resize, onEvent, screenOf, burst };
})();
