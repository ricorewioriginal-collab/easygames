/* Küchen-Chaos – 3D-Ansicht (Three.js r128): Küche schräg von oben, Theken, Kisten, Herde, Spüle, Förderband,
 * Zutaten/Teller/Töpfe als kleine Modelle, Köche mit Kochmütze, Feuer, Fortschrittsbalken (DOM-Ebene darüber). */
(function () {
  'use strict';
  const T = THREE, D = KC_DATA, { ING, THEMES, CHEFS } = D;
  let hint = null, hintTi = -1, R = null, scene, cam, W = 1, H = 1, G = null, th = null, root = null, ovl = null, time = 0;
  const mats = {}, lam = (c, o) => { const k = c + (o ? JSON.stringify(o) : ''); return mats[k] || (mats[k] = new T.MeshLambertMaterial(Object.assign({ color: c }, o || {}))); };
  const bas = (c, o) => { const k = 'b' + c + (o ? JSON.stringify(o) : ''); return mats[k] || (mats[k] = new T.MeshBasicMaterial(Object.assign({ color: c }, o || {}))); };
  const GE = {}, geo = (k, f) => GE[k] || (GE[k] = f());
  const box = () => geo('box', () => new T.BoxGeometry(1, 1, 1)), sph = () => geo('sph', () => new T.SphereGeometry(1, 14, 10)), cyl = () => geo('cyl', () => new T.CylinderGeometry(1, 1, 1, 18)), cone = () => geo('cone', () => new T.ConeGeometry(1, 1, 12)), tor = () => geo('tor', () => new T.TorusGeometry(1, .18, 8, 20));
  function part(p, g, m, x, y, z, sx, sy, sz, rx, ry, rz) { const o = new T.Mesh(g, m); o.position.set(x, y, z); o.scale.set(sx, sy == null ? sx : sy, sz == null ? sx : sz); if (rx || ry || rz) o.rotation.set(rx || 0, ry || 0, rz || 0); p.add(o); return o; }
  const texC = {}; function emojiTex(e, bg) { const k = e + bg; if (texC[k]) return texC[k]; const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); x.fillStyle = bg; x.fillRect(0, 0, 128, 128); x.strokeStyle = 'rgba(0,0,0,.25)'; x.lineWidth = 8; x.strokeRect(4, 4, 120, 120); x.font = '84px serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(e, 64, 70); const t = new T.CanvasTexture(c); return texC[k] = t; }

  function init(canvas) {
    R = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' }); R.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
    scene = new T.Scene(); scene.add(new T.HemisphereLight(0xffffff, 0x8a7a6a, .68)); const d = new T.DirectionalLight(0xffffff, .5); d.position.set(-4, 10, 6); scene.add(d);
    cam = new T.PerspectiveCamera(38, 1, .1, 200);
  }
  const TILE_H = .9;
  function setLevel(g, overlay) {
    G = g; th = THEMES[G.L.theme]; ovl = overlay; if (root) scene.remove(root); root = new T.Group(); scene.add(root);
    scene.background = new T.Color(th.bg);
    // Boden: Schachbrett als eine Fläche
    const c = document.createElement('canvas'); c.width = G.W * 32; c.height = G.H * 32; const x = c.getContext('2d');
    for (let r = 0; r < G.H; r++) for (let q = 0; q < G.W; q++) { x.fillStyle = th.floor[(r + q) % 2]; x.fillRect(q * 32, r * 32, 32, 32); }
    if (G.L.ice) { x.fillStyle = 'rgba(255,255,255,.35)'; for (let i = 0; i < 60; i++) x.fillRect((i * 53) % c.width, (i * 37) % c.height, 18, 2); }
    const ft = new T.CanvasTexture(c); ft.magFilter = T.NearestFilter;
    const fl = part(root, new T.PlaneGeometry(G.W, G.H), new T.MeshLambertMaterial({ map: ft }), G.W / 2, 0, G.H / 2, 1, 1, 1, -Math.PI / 2); void fl;
    part(root, new T.PlaneGeometry(G.W + 40, G.H + 40), lam(th.wall), G.W / 2, -.02, G.H / 2, 1, 1, 1, -Math.PI / 2);
    // Rand-Mauer hinten
    part(root, box(), lam(th.wall), G.W / 2, .9, -.35, G.W + .6, 1.8, .7);
    G.tiles.forEach((t, i) => { t.view = null; if (t.kind === 'floor') return; const grp = new T.Group(); grp.position.set(t.c + .5, 0, t.r + .5); root.add(grp); t.view = { grp, sig: '', itm: null, extra: null }; station(grp, t); });
    // Köche
    G.chefs.forEach(ch => { ch.view = chefMesh(CHEFS[ch.look % CHEFS.length]); root.add(ch.view); });
    // Markierungen der Zielfelder
    G.mark = G.chefs.map(ch => { const m = part(root, box(), new T.MeshBasicMaterial({ color: CHEFS[ch.look % CHEFS.length].col, transparent: true, opacity: .35, depthWrite: false }), 0, TILE_H + .02, 0, 1.02, .04, 1.02); m.visible = false; return m; });
    hint = new T.Group(); hint.visible = false; root.add(hint); part(hint, cone(), bas('#ffd02a'), 0, 0, 0, .28, .45, .28, Math.PI); part(hint, tor(), bas('#ffd02a', { transparent: true, opacity: .8 }), 0, -.55, 0, .55, .55, .55, Math.PI / 2);
    fitCam();
    if (ovl) ovl.innerHTML = '';
  }
  function station(g, t) {
    const k = t.kind;
    const body = k === 'stove' ? '#3a3a42' : k === 'crate' ? '#a8743a' : k === 'trash' ? null : th.counter;
    if (body) { part(g, box(), lam(body), 0, TILE_H / 2 - .02, 0, .98, TILE_H - .04, .98); part(g, box(), lam(k === 'stove' ? '#1e1e24' : k === 'serve' ? '#ffd24a' : k === 'belt' ? '#2a2a30' : th.top), 0, TILE_H - .02, 0, 1, .06, 1); }
    if (k === 'crate') { const top = part(g, new T.PlaneGeometry(.8, .8), new T.MeshBasicMaterial({ map: emojiTex(ING[t.ing].icon, '#e8c08a') }), 0, TILE_H + .02, 0, 1, 1, 1, -Math.PI / 2); void top; for (const s of [-1, 1]) part(g, box(), lam('#7a4a1a'), s * .46, TILE_H / 2, 0, .06, TILE_H, 1); }
    else if (k === 'board') part(g, box(), lam('#e0b070'), 0, TILE_H + .03, 0, .78, .05, .62);
    else if (k === 'stove') { t.view.ring = part(g, tor(), lam('#5a1a1a'), 0, TILE_H + .02, 0, .3, .3, .3, Math.PI / 2); for (const s of [-1, 1]) part(g, cyl(), lam('#c8c8d0'), s * .35, TILE_H * .55, .5, .05, .1, .05, Math.PI / 2); }
    else if (k === 'serve') { part(g, box(), lam('#ff7a3a'), 0, TILE_H + .45, -.42, 1, .9, .12); part(g, sph(), lam('#e8e8f0'), .25, TILE_H + .1, .1, .12, .08, .12); }
    else if (k === 'plates') part(g, box(), lam('#e8e0d0'), 0, TILE_H + .01, 0, .8, .02, .8);
    else if (k === 'ret') part(g, new T.PlaneGeometry(.8, .8), new T.MeshBasicMaterial({ map: emojiTex('🍽️', '#c8b8a8') }), 0, TILE_H + .02, 0, 1, 1, 1, -Math.PI / 2);
    else if (k === 'sink') { part(g, box(), lam('#7ab8e8'), 0, TILE_H + .01, 0, .78, .04, .7); part(g, cyl(), lam('#c8c8d0'), 0, TILE_H + .25, -.38, .04, .5, .04); part(g, cyl(), lam('#c8c8d0'), 0, TILE_H + .48, -.25, .03, .3, .03, Math.PI / 2); }
    else if (k === 'trash') { part(g, cyl(), lam('#6a7078'), 0, .42, 0, .36, .84, .36); part(g, cyl(), lam('#3a3e44'), 0, .86, 0, .38, .06, .38); }
    else if (k === 'belt') { const c = document.createElement('canvas'); c.width = 32; c.height = 32; const x = c.getContext('2d'); x.fillStyle = '#2a2a30'; x.fillRect(0, 0, 32, 32); x.fillStyle = '#ffd24a'; x.beginPath(); x.moveTo(8, 6); x.lineTo(24, 16); x.lineTo(8, 26); x.fill(); const tx = new T.CanvasTexture(c); tx.wrapS = tx.wrapT = T.RepeatWrapping; const m = part(g, new T.PlaneGeometry(.96, .96), new T.MeshBasicMaterial({ map: tx }), 0, TILE_H + .02, 0, 1, 1, 1, -Math.PI / 2); m.rotation.z = -Math.atan2(t.dir[1], t.dir[0]); t.view.belt = tx; }
  }
  /* ---------- Gegenstände ---------- */
  function ingMesh(g, ingId, st, y, s) {
    s = s || 1; const I = ING[ingId], c = st === 'x' ? '#1a1a1a' : st === 'k' ? (ingId === 'fish' ? '#e0a050' : '#6a3a22') : I.col;
    if (st === 'c' || st === 'k' && ingId !== 'meat' && ingId !== 'fish') { for (let i = 0; i < 3; i++) part(g, ingId === 'cheese' ? box() : sph(), lam(c), (i - 1) * .12 * s, y + .05 * s, (i % 2 ? .06 : -.05) * s, .09 * s, .06 * s, .09 * s); return; }
    if (ingId === 'meat') { part(g, cyl(), lam(c), 0, y + .05 * s, 0, .2 * s, .09 * s, .2 * s); return; }
    if (ingId === 'fish') { part(g, sph(), lam(c), 0, y + .07 * s, 0, .26 * s, .09 * s, .12 * s); part(g, cone(), lam(c), .28 * s, y + .07 * s, 0, .09 * s, .14 * s, .09 * s, 0, 0, Math.PI / 2); return; }
    if (ingId === 'bun') { part(g, sph(), lam(c), 0, y + .02 * s, 0, .2 * s, .13 * s, .2 * s); return; }
    if (ingId === 'cheese') { part(g, box(), lam(c), 0, y + .08 * s, 0, .3 * s, .16 * s, .22 * s); return; }
    if (ingId === 'lettuce') { part(g, sph(), lam(c), 0, y + .12 * s, 0, .21 * s, .17 * s, .21 * s); part(g, sph(), lam('#8ae05a'), .05 * s, y + .18 * s, .04 * s, .12 * s); return; }
    if (st === 'x') { part(g, sph(), lam(c), 0, y + .08 * s, 0, .16 * s, .1 * s, .16 * s); return; }
    part(g, sph(), lam(c), 0, y + .13 * s, 0, .17 * s); if (ingId === 'tomato') part(g, cone(), lam('#3a8a2a'), 0, y + .3 * s, 0, .05 * s, .07 * s, .05 * s);
  }
  const SOUP = { tomato: '#d8401a', onion: '#d8a050', mix: '#8a6a4a' };
  function plateMesh(g, parts, y) {
    part(g, cyl(), lam('#ffffff'), 0, y + .02, 0, .3, .04, .3);
    const has = k => parts.includes(k);
    if (has('bun')) { let h = y + .05; part(g, sph(), lam('#e0a050'), 0, h, 0, .2, .07, .2); h += .06; if (has('meat:k')) { part(g, cyl(), lam('#6a3a22'), 0, h, 0, .19, .06, .19); h += .05; } if (has('cheese:c')) { part(g, box(), lam('#ffd040'), 0, h, 0, .3, .02, .3, 0, .4); h += .03; } part(g, sph(), lam('#e8b060'), 0, h + .04, 0, .2, .09, .2); return; }
    let i = 0; for (const p of parts) {
      const a = i * 2.1, ox = parts.length > 1 ? Math.cos(a) * .1 : 0, oz = parts.length > 1 ? Math.sin(a) * .1 : 0, sub = new T.Group(); sub.position.set(ox, 0, oz); g.add(sub); i++;
      if (p.startsWith('soup:')) { part(sub, cyl(), lam(SOUP[p.slice(5)] || '#8a6a4a'), 0, y + .05, 0, .24, .03, .24); continue; }
      const [x, st] = p.split(':'); ingMesh(sub, x, st || 'raw', y + .02, .8);
    }
  }
  function containerMesh(g, c, y) {
    if (c.t === 'pot') { part(g, cyl(), lam('#9aa0a8'), 0, y + .16, 0, .27, .3, .27); for (const s of [-1, 1]) part(g, box(), lam('#2a2a30'), s * .32, y + .26, 0, .1, .04, .06); if (c.parts.length) { const col = c.burnt ? '#1a1a1a' : c.cook >= 1 ? SOUP[c.parts.every(p => p === c.parts[0]) ? c.parts[0] : 'mix'] : ING[c.parts[0]].col; part(g, cyl(), lam(col), 0, y + .2 + c.parts.length * .03, 0, .24, .02, .24); } }
    else { part(g, cyl(), lam('#2a2a30'), 0, y + .05, 0, .3, .06, .3); part(g, box(), lam('#2a2a30'), .45, y + .07, 0, .3, .04, .06); if (c.parts.length) ingMesh(g, c.parts[0], c.burnt ? 'x' : c.cook >= 1 ? 'k' : 'c', y + .07, .9); }
  }
  function itemMesh(it, y) {
    const g = new T.Group(); if (!it) return g;
    if (it.t === 'ing') ingMesh(g, it.ing, it.st, y);
    else if (it.t === 'plate') plateMesh(g, it.parts, y);
    else if (it.t === 'pot' || it.t === 'pan') containerMesh(g, it, y);
    else if (it.t === 'ext') { part(g, cyl(), lam('#e8202a'), 0, y + .25, 0, .1, .5, .1); part(g, cyl(), lam('#1a1a1a'), .05, y + .52, 0, .05, .1, .05); part(g, cyl(), lam('#1a1a1a'), .14, y + .5, 0, .02, .2, .02, 0, 0, 1.2); }
    else if (it.t === 'dirty') { for (let i = 0; i < Math.min(5, it.n); i++) part(g, cyl(), lam('#b8a890'), 0, y + .02 + i * .05, 0, .28, .04, .28); }
    return g;
  }
  const sigOf = it => !it ? '' : it.t === 'ing' ? it.ing + it.st : it.t === 'plate' ? 'p' + it.parts.join() : it.t === 'pot' || it.t === 'pan' ? it.t + it.parts.join() + (it.burnt ? 'B' : it.cook >= 1 ? 'K' : '') : it.t === 'dirty' ? 'd' + it.n : it.t;
  /* ---------- Köche ---------- */
  function chefMesh(c) {
    const g = new T.Group(), skin = lam(c.skin), shirt = lam(c.col);
    part(g, sph(), new T.MeshBasicMaterial({ color: '#000', transparent: true, opacity: .25, depthWrite: false }), 0, .01, 0, .34, .01, .34);
    const body = new T.Group(); g.add(body);
    part(body, cyl(), shirt, 0, .38, 0, .25, .5, .22); part(body, cyl(), lam('#ffffff'), 0, .33, .06, .23, .42, .18);
    for (const s of [-1, 1]) part(body, cyl(), lam('#3a3a4a'), s * .1, .08, 0, .07, .16, .07);
    const head = new T.Group(); head.position.y = .82; body.add(head);
    part(head, sph(), skin, 0, 0, 0, .21); for (const s of [-1, 1]) part(head, sph(), lam('#1a1a1a'), s * .07, .02, .18, .03);
    part(head, sph(), lam('#e88a8a'), 0, -.05, .2, .03);
    part(head, cyl(), lam('#ffffff'), 0, .18, -.01, .17, .14, .17); part(head, sph(), lam('#ffffff'), 0, .3, -.01, .22, .14, .22);
    const hands = []; for (const s of [-1, 1]) hands.push(part(body, sph(), skin, s * .2, .52, .25, .07));
    const hold = new T.Group(); hold.position.set(0, .0, .32); body.add(hold);
    g.userData = { body, head, hands, hold, sig: null, held: null };
    return g;
  }
  /* ---------- Kamera ---------- */
  const zoom = { f: 1, dz: 0 };
  function fitCam() {
    if (!G) return; const a = W / H, vf = 38 * Math.PI / 180, hf = 2 * Math.atan(Math.tan(vf / 2) * a);
    const needW = (G.W + 1.2) / 2 / Math.tan(hf / 2), needH = (G.H + 2.2) / 2 / Math.tan(vf / 2) * .92, d = Math.max(needW, needH);
    const cx = G.W / 2, cz = G.H / 2, dd = d * zoom.f; cam.position.set(cx, dd * .86, cz + dd * .52); cam.lookAt(cx, 0, cz + .25 + zoom.dz); cam.aspect = a; cam.updateProjectionMatrix();
  }
  /* ---------- Bild ---------- */
  const v3 = new T.Vector3(); let fires = [], bars = {};
  function proj(x, y, z) { v3.set(x, y, z).project(cam); return [(v3.x + 1) / 2 * W, (1 - v3.y) / 2 * H]; }
  function bar(key, x, y, z, p, cls) {
    let e = bars[key]; if (!e) { e = bars[key] = document.createElement('div'); e.className = 'pbar ' + (cls || ''); e.innerHTML = '<i></i>'; ovl.appendChild(e); }
    const [sx, sy] = proj(x, y, z); e.style.transform = `translate(${sx - 22}px,${sy}px)`; e.firstChild.style.width = Math.round(Math.min(1, p) * 100) + '%'; e.hidden = false; e.dataset.seen = 1;
  }
  function render(dt, opt) {
    if (!R || !G) return; time += dt; opt = opt || {};
    for (const k in bars) bars[k].dataset.seen = '';
    let fi = 0;
    G.tiles.forEach((t, i) => {
      const v = t.view; if (!v) return;
      let sig = sigOf(t.it) + '|' + (t.kind === 'plates' || t.kind === 'ret' || t.kind === 'sink' ? t.n : '');
      if (sig !== v.sig) { v.sig = sig; if (v.itm) v.grp.remove(v.itm); v.itm = new T.Group(); v.grp.add(v.itm);
        if (t.it) v.itm.add(itemMesh(t.it, TILE_H + (t.kind === 'board' ? .05 : 0)));
        if (t.kind === 'plates') for (let k = 0; k < Math.min(6, t.n); k++) part(v.itm, cyl(), lam('#ffffff'), 0, TILE_H + .04 + k * .05, 0, .3, .04, .3);
        if (t.kind === 'ret' || t.kind === 'sink') for (let k = 0; k < Math.min(6, t.n); k++) part(v.itm, cyl(), lam('#b8a890'), 0, TILE_H + .04 + k * .05, 0, .28, .04, .28);
      }
      const c = t.it;
      if (t.kind === 'stove' && v.ring) { const on = c && !c.burnt && (c.t === 'pot' ? c.parts.length === 3 : c.parts.length === 1); v.ring.material = on ? bas('#ff5a1a') : lam('#5a1a1a'); if (v.itm) v.itm.position.y = on ? Math.abs(Math.sin(time * 18)) * .015 : 0; }
      if (c && (c.t === 'pot' || c.t === 'pan') && t.kind === 'stove' && !c.burnt && c.parts.length) { if (c.cook < 1) { if ((c.t === 'pot' ? c.parts.length === 3 : true)) bar('c' + i, t.c + .5, TILE_H + .7, t.r + .5, c.cook, 'cook'); else bar('c' + i, t.c + .5, TILE_H + .7, t.r + .5, c.parts.length / 3, 'fill'); } else if (c.over > .35) bar('c' + i, t.c + .5, TILE_H + .7, t.r + .5, c.over, Math.sin(time * 14) > 0 ? 'warn' : 'warn2'); else bar('c' + i, t.c + .5, TILE_H + .7, t.r + .5, 1, 'ok'); }
      if (t.kind === 'board' && c && c.t === 'ing' && c.prog > 0) bar('b' + i, t.c + .5, TILE_H + .5, t.r + .5, c.prog);
      if (t.kind === 'sink' && t.prog > 0) bar('s' + i, t.c + .5, TILE_H + .5, t.r + .5, t.prog);
      if (t.view.belt) t.view.belt.offset.x = -time;
      if (t.fire > 0) { for (let k = 0; k < 3; k++) { let f = fires[fi]; if (!f) { f = part(root, cone(), bas(k % 2 ? '#ffb020' : '#ff4a1a', { transparent: true, opacity: .9 }), 0, 0, 0, 1); fires.push(f); } fi++; f.visible = true; const ph = time * 9 + k * 2 + i; f.position.set(t.c + .5 + Math.sin(ph) * .15 + (k - 1) * .2, TILE_H + .3 + Math.sin(ph * 1.3) * .05, t.r + .5 + Math.cos(ph) * .1); const s = .22 + .08 * Math.sin(ph * 2); f.scale.set(s, .6 + .2 * Math.sin(ph * 1.7), s); } }
    });
    for (let k = fi; k < fires.length; k++) fires[k].visible = false;
    for (const k in bars) if (!bars[k].dataset.seen) bars[k].hidden = true;
    G.chefs.forEach((ch, i) => {
      const m = ch.view, u = m.userData; m.position.set(ch.x, 0, ch.z);
      const ang = Math.atan2(ch.fx, ch.fz); let d = ang - m.rotation.y; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; m.rotation.y += d * Math.min(1, dt * 16);
      const sp = Math.hypot(ch.vx, ch.vz); u.body.position.y = sp > .5 ? Math.abs(Math.sin(time * 14 + i)) * .06 : 0; u.body.rotation.x = ch.dashT > 0 ? .3 : sp * .02;
      const chop = ch.act === 'chop' || ch.act === 'wash'; u.hands.forEach((h, k) => { h.position.y = .52 + (chop ? Math.sin(time * 22 + k * 3) * .1 : 0) + (ch.held ? .1 : 0); });
      const hs = sigOf(ch.held); if (hs !== u.sig) { u.sig = hs; if (u.held) u.hold.remove(u.held); u.held = itemMesh(ch.held, .5); u.hold.add(u.held); }
      if (ch.held && ch.held.t === 'ext' && ch.act === 'spray') { let f = fires[fi]; if (!f) { f = part(root, sph(), bas('#ffffff', { transparent: true, opacity: .6 }), 0, 0, 0, 1); fires.push(f); } f.material = bas('#ffffff', { transparent: true, opacity: .6 }); fi++; f.visible = true; const k = (time * 3) % 1; f.position.set(ch.x + ch.fx * (.6 + k * 1.6), .9, ch.z + ch.fz * (.6 + k * 1.6)); f.scale.setScalar(.15 + k * .3); }
      const mk = G.mark[i]; if (mk) { mk.visible = !ch.bot && ch.tgt >= 0 && !opt.noMark; if (mk.visible) { const t = G.tiles[ch.tgt]; mk.position.set(t.c + .5, TILE_H + .03, t.r + .5); } }
      if (opt.names) { let e = bars['n' + i]; if (!e) { e = bars['n' + i] = document.createElement('div'); e.className = 'cname'; e.style.setProperty('--c', CHEFS[ch.look % CHEFS.length].col); ovl.appendChild(e); } e.textContent = ch.name + (ch.bot ? ' 🤖' : ''); const [sx, sy] = proj(ch.x, 1.45, ch.z); e.style.transform = `translate(${sx}px,${sy}px) translate(-50%,-100%)`; e.hidden = false; e.dataset.seen = 1; }
    });
    for (let k = fi; k < fires.length; k++) fires[k].visible = false;
    if (hint) { hint.visible = hintTi >= 0 && !!G.tiles[hintTi]; if (hint.visible) { const t = G.tiles[hintTi]; hint.position.set(t.c + .5, TILE_H + .62, t.r + .5); hint.children[0].position.y = Math.abs(Math.sin(time * 5)) * .25; hint.children[1].position.y = -.58; hint.children[1].scale.setScalar(.45 + .08 * Math.sin(time * 8)); } }
    R.render(scene, cam);
  }
  function resize(w, h) { W = w; H = h; if (R) R.setSize(w, h, false); fitCam(); }
  function clearOverlay() { bars = {}; fires.forEach(f => root && root.remove(f)); fires = []; if (ovl) ovl.innerHTML = ''; }
  function screenOf(x, y, z) { return proj(x, y, z); }
  window.KCView = { setHint: ti => { hintTi = ti; }, setZoom: (f, dz) => { zoom.f = f; zoom.dz = dz || 0; fitCam(); }, init, setLevel: (g, o) => { clearOverlay(); setLevel(g, o); }, render, resize, screenOf, TILE_H };
})();
