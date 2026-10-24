/* Die große Challenge-Show – 3D-Studio: Tribünen mit jubelndem Publikum, Lichtgerüst mit Scheinwerfern, Show-Bildschirme,
 * sechs Arenen (Ampel-Feld mit Ampel-Roboter, Pudding-Brücke über der Schaumstoffgrube, Seilzieh-Podeste, Keks-Tische,
 * Tanzfläche mit Stühlen, schrumpfende Finale-Plattform über dem Bällebad), Bohnen-Kandidaten mit Nummer und Hut,
 * Konfetti und Kamera je Runde. Nur Darstellung – die Regeln stehen in core.js. */
(function () {
  'use strict';
  const T = THREE, PI = Math.PI, C = CSCore;
  let R, scene, cam, key, hemi, W = 1, H = 1, time = 0, arena = null, arenaKind = '', studio = null, aud = null, audN = 0, cheer = 0, screenTex = null, screenCtx = null;
  const lin = c => new T.Color(c).convertSRGBToLinear();
  const MC = {}; const mat = (col, o) => { const k = col + JSON.stringify(o || {}); return MC[k] || (MC[k] = new T.MeshPhysicalMaterial(Object.assign({ color: lin(col), roughness: .38, clearcoat: .6, clearcoatRoughness: .25 }, o || {}))); };
  const glow = (col, op) => new T.MeshBasicMaterial({ color: lin(col), transparent: op !== undefined, opacity: op === undefined ? 1 : op, depthWrite: op === undefined, blending: op !== undefined ? T.AdditiveBlending : T.NormalBlending });
  const TC = {};
  function ctex(key, w, h, draw) { if (TC[key]) return TC[key]; const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 4; return TC[key] = t; }
  /* ---------- Formen ---------- */
  const RB = {};
  function rbox(w, h, d, r) {
    r = Math.min(r || .14, w / 3, d / 3, h / 3); const key = [w, h, d, r].map(v => v.toFixed(2)).join('x'); if (RB[key]) return RB[key];
    const s = new T.Shape(), x = w / 2 - r, z = d / 2 - r; s.moveTo(-x, -d / 2); s.lineTo(x, -d / 2); s.quadraticCurveTo(w / 2, -d / 2, w / 2, -z); s.lineTo(w / 2, z); s.quadraticCurveTo(w / 2, d / 2, x, d / 2); s.lineTo(-x, d / 2); s.quadraticCurveTo(-w / 2, d / 2, -w / 2, z); s.lineTo(-w / 2, -z); s.quadraticCurveTo(-w / 2, -d / 2, -x, -d / 2);
    const b = Math.min(r * .8, h / 3), g = new T.ExtrudeGeometry(s, { depth: Math.max(.01, h - 2 * b), bevelEnabled: true, bevelThickness: b, bevelSize: b * .7, bevelSegments: 2, curveSegments: 3 });
    g.rotateX(-PI / 2); g.translate(0, -h / 2 + b, 0); return RB[key] = g;
  }
  // mehrere Geometrien (mit Versatz) zu einer zusammenfügen – spart Zeichenaufrufe
  function mergeG(list) { const parts = list.map(([g, x, y, z, ry]) => { const n = g.index ? g.toNonIndexed() : g.clone(); if (ry) n.rotateY(ry); n.translate(x || 0, y || 0, z || 0); return n; }); let cnt = 0; parts.forEach(p => { cnt += p.attributes.position.count; }); const pos = new Float32Array(cnt * 3), nor = new Float32Array(cnt * 3); let o = 0; parts.forEach(p => { pos.set(p.attributes.position.array, o * 3); nor.set(p.attributes.normal.array, o * 3); o += p.attributes.position.count; p.dispose(); }); const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setAttribute('normal', new T.BufferAttribute(nor, 3)); g.computeBoundingSphere(); return g; }
  const mesh = (g, m, x, y, z, sh) => { const o = new T.Mesh(g, m); o.position.set(x || 0, y || 0, z || 0); if (sh !== false) { o.castShadow = !!sh; o.receiveShadow = true; } return o; };

  /* ---------- Grundgerüst ---------- */
  function init(canvas) {
    R = BREnv.renderer(canvas, { maxDpr: matchMedia('(pointer: coarse)').matches ? 1.5 : 1.75, exposure: 1.1 }); scene = new T.Scene();
    scene.background = lin('#120828'); scene.fog = new T.Fog(lin('#120828'), 50, 140);
    scene.environment = BREnv.env(R, { top: '#3a2a8a', mid: '#ff9ad8', bot: '#1a0a30' });
    cam = new T.PerspectiveCamera(55, 1, .1, 300);
    hemi = new T.HemisphereLight(0xc8b8ff, 0x302048, .55); scene.add(hemi);
    key = new T.DirectionalLight(0xfff4e8, 1.25); key.castShadow = true; const big = !matchMedia('(pointer: coarse)').matches; key.shadow.mapSize.set(big ? 2048 : 1024, big ? 2048 : 1024); Object.assign(key.shadow.camera, { left: -24, right: 24, top: 24, bottom: -24, near: 1, far: 100 }); key.shadow.bias = -.0006; key.shadow.normalBias = .03; scene.add(key, key.target);
    const p1 = new T.PointLight(0xff3aa8, .9, 90), p2 = new T.PointLight(0x3ad8ff, .8, 90); p1.position.set(-20, 14, 10); p2.position.set(20, 14, -6); scene.add(p1, p2);
    buildStudio(); initParts();
  }
  function resize(w, h) { W = w; H = h; R.setSize(w, h, false); cam.aspect = w / h; cam.fov = w < h ? 70 : 55; cam.updateProjectionMatrix(); }
  /* ---------- Studio (bleibt immer) ---------- */
  function buildStudio() {
    studio = new T.Group(); scene.add(studio);
    const fl = new T.Mesh(new T.CircleGeometry(70, 64), new T.MeshPhysicalMaterial({ color: lin('#1a0c34'), roughness: .25, metalness: .1, clearcoat: 1 })); fl.rotation.x = -PI / 2; fl.position.y = -7; fl.receiveShadow = true; studio.add(fl);
    // Tribünen: drei Stufen im Kreis, Leuchtkanten in Pink/Cyan/Gold
    [[37, -6, '#2a1650'], [40.5, -3.5, '#341c62'], [44, -1, '#3e2274']].forEach(([r, y, c], i) => { const g = new T.CylinderGeometry(r + 3.5, r + 3.5, y + 8, 64, 1, true); const m = new T.Mesh(g, new T.MeshStandardMaterial({ color: lin(c), roughness: .7, side: T.BackSide })); m.position.y = -7 + (y + 8) / 2; studio.add(m);
      const top = new T.Mesh(new T.RingGeometry(r, r + 3.5, 64), new T.MeshStandardMaterial({ color: lin(c), roughness: .6 })); top.rotation.x = -PI / 2; top.position.y = y + 1; studio.add(top);
      const edge = new T.Mesh(new T.TorusGeometry(r, .09, 6, 96), glow(['#ff3aa8', '#3ad8ff', '#ffd23a'][i])); edge.rotation.x = PI / 2; edge.position.y = y + 1.02; studio.add(edge); });
    // Publikum: Bohnen-Zuschauer als InstancedMesh (eine Zeichnung für alle)
    const ag = new T.SphereGeometry(.55, 10, 8); ag.scale(1, 1.35, 1); audN = 0; const pos = [];
    [[38.6, 0], [42.1, 2.5], [45.6, 5]].forEach(([r, y]) => { const n = Math.floor(r * 2 * PI / 1.45); for (let i = 0; i < n; i++) { if (Math.random() < .12) continue; const a = i / n * PI * 2 + Math.random() * .03; pos.push([Math.cos(a) * r, y, Math.sin(a) * r, Math.random() * 6]); } });
    aud = new T.InstancedMesh(ag, new T.MeshStandardMaterial({ roughness: .5 }), pos.length); const cols = ['#ff4a6a', '#ffb020', '#3ab0ff', '#3ae07a', '#b06aff', '#ff7ad0', '#20d0c0', '#ffe040', '#ffffff'];
    pos.forEach((p, i) => { aud.setColorAt(i, lin(cols[(Math.random() * cols.length) | 0])); }); aud.userData.pos = pos; audN = pos.length; studio.add(aud); syncAud(0);
    // Lichtgerüst mit Scheinwerfer-Kegeln
    const truss = new T.Mesh(new T.TorusGeometry(31, .35, 8, 80), new T.MeshStandardMaterial({ color: lin('#b8bcc8'), metalness: .9, roughness: .3 })); truss.rotation.x = PI / 2; truss.position.y = 20; studio.add(truss);
    const coneG = new T.ConeGeometry(4.5, 26, 24, 1, true); coneG.translate(0, -13, 0);
    for (let i = 0; i < 8; i++) { const a = i / 8 * PI * 2, c = new T.Mesh(coneG, glow(['#ff3aa8', '#3ad8ff', '#ffd23a', '#b06aff'][i % 4], .07)); c.position.set(Math.cos(a) * 31, 20, Math.sin(a) * 31); c.lookAt(0, -20, 0); c.rotateX(-PI / 2); c.userData.spot = a; studio.add(c); const lamp = mesh(new T.CylinderGeometry(.5, .7, 1.2, 12), mat('#2a2a34', { metalness: .8 }), c.position.x, 20.6, c.position.z, false); studio.add(lamp); }
    // vier Show-Bildschirme
    const sc = document.createElement('canvas'); sc.width = 512; sc.height = 256; screenCtx = sc.getContext('2d'); screenTex = new T.CanvasTexture(sc); screenTex.encoding = T.sRGBEncoding; setScreen('');
    for (let i = 0; i < 4; i++) { const a = i / 4 * PI * 2 + PI / 4, s = new T.Mesh(new T.PlaneGeometry(16, 8), new T.MeshBasicMaterial({ map: screenTex })); s.position.set(Math.cos(a) * 52, 12, Math.sin(a) * 52); s.lookAt(0, 8, 0); studio.add(s); const fr = mesh(rbox(17, 9, .6), mat('#20202a', { metalness: .7 }), s.position.x, 12, s.position.z, false); fr.lookAt(0, 12, 0); fr.translateZ(-.4); studio.add(fr); }
  }
  function setScreen(sub) { const x = screenCtx, g = x.createLinearGradient(0, 0, 512, 256); g.addColorStop(0, '#ff3aa8'); g.addColorStop(.5, '#6a2aff'); g.addColorStop(1, '#20b8ff'); x.fillStyle = g; x.fillRect(0, 0, 512, 256); x.fillStyle = 'rgba(255,255,255,.12)'; for (let i = 0; i < 512; i += 32) x.fillRect(i, 0, 14, 256);
    x.textAlign = 'center'; x.fillStyle = '#ffd23a'; x.font = 'bold 44px Fredoka, system-ui, sans-serif'; x.fillText('DIE GROSSE', 256, 70); x.fillStyle = '#fff'; x.font = 'bold 66px Fredoka, system-ui, sans-serif'; x.fillText('CHALLENGE-SHOW', 256, 140); if (sub) { x.font = 'bold 38px Fredoka, system-ui, sans-serif'; x.fillStyle = '#fff'; x.fillText(sub, 256, 210); } screenTex.needsUpdate = true; }
  function syncAud(dt) { if (!aud) return; cheer = Math.max(0, cheer - dt * .4); const m = new T.Matrix4(), q = new T.Quaternion(), s = new T.Vector3(1, 1, 1), v = new T.Vector3(); const P = aud.userData.pos, amp = .08 + cheer * .55, sp = 3 + cheer * 6;
    for (let i = 0; i < P.length; i++) { const p = P[i]; v.set(p[0], p[1] + Math.abs(Math.sin(time * sp + p[3])) * amp, p[2]); m.compose(v, q, s); aud.setMatrixAt(i, m); } aud.instanceMatrix.needsUpdate = true; }
  function hype(v) { cheer = Math.min(1, Math.max(cheer, v)); }

  /* ---------- Kandidaten (Bohnen) ---------- */
  const bodyG = new T.SphereGeometry(1, 24, 16); bodyG.scale(.42, .62, .42); bodyG.translate(0, .72, 0);
  const eyeG = new T.SphereGeometry(.09, 12, 8), pupG = new T.SphereGeometry(.045, 10, 6), handG = new T.SphereGeometry(.1, 10, 8), footG = new T.SphereGeometry(1, 10, 8); footG.scale(.13, .08, .18);
  const numG = new T.CylinderGeometry(.43, .43, .32, 16, 1, true, -.75, 1.5); numG.translate(0, .6, 0);
  const smileG = new T.TorusGeometry(.08, .018, 6, 12, PI); smileG.rotateZ(PI);
  function numTex(n) { return ctex('n' + n, 128, 64, (x, w, h) => { x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h); x.fillStyle = '#16122a'; x.font = 'bold 48px Fredoka, system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(String(n).padStart(3, '0'), w / 2, h / 2 + 2); }); }
  function hat(k, col) {
    const g = new T.Group(), c2 = '#ffffff';
    if (k === 0) { g.add(mesh(new T.SphereGeometry(.3, 16, 8, 0, PI * 2, 0, PI / 2), mat(col === '#ffe040' ? '#3ab0ff' : '#ffe040'), 0, 1.22, 0, false)); const b = mesh(new T.CylinderGeometry(.3, .3, .03, 16, 1, false, -PI / 2, PI), mat('#ffffff'), 0, 1.23, .12, false); b.scale.z = 1.3; g.add(b); }
    else if (k === 1) { g.add(mesh(new T.ConeGeometry(.2, .5, 16), mat('#ff3aa8'), 0, 1.53, 0, false)); g.add(mesh(new T.SphereGeometry(.07, 8, 6), mat('#ffd23a'), 0, 1.8, 0, false)); }
    else if (k === 2) { const m = mat('#ff4a8a'); const l = mesh(new T.ConeGeometry(.11, .22, 10), m, -.12, 1.3, 0, false); l.rotation.z = PI / 2; const r = mesh(new T.ConeGeometry(.11, .22, 10), m, .12, 1.3, 0, false); r.rotation.z = -PI / 2; g.add(l, r, mesh(new T.SphereGeometry(.06, 8, 6), m, 0, 1.3, 0, false)); g.position.set(.16, .02, 0); g.rotation.z = -.3; }
    else if (k === 3) { g.add(mesh(new T.SphereGeometry(.33, 16, 8, 0, PI * 2, 0, PI / 2.2), mat('#3ae07a', { roughness: .8, clearcoat: 0 }), 0, 1.16, 0, false)); g.add(mesh(new T.SphereGeometry(.1, 10, 8), mat(c2, { roughness: .9, clearcoat: 0 }), 0, 1.5, 0, false)); }
    else if (k === 4) { g.add(mesh(new T.CylinderGeometry(.02, .02, .36, 6), mat('#333344'), 0, 1.46, 0, false)); g.add(mesh(new T.SphereGeometry(.08, 10, 8), glow('#ff3aa8'), 0, 1.66, 0, false)); }
    else { g.add(mesh(new T.CylinderGeometry(.22, .22, .36, 16), mat('#22222e'), 0, 1.45, 0, false)); g.add(mesh(new T.CylinderGeometry(.34, .34, .03, 18), mat('#22222e'), 0, 1.28, 0, false)); g.add(mesh(new T.CylinderGeometry(.225, .225, .07, 16), mat('#ff3a5a'), 0, 1.33, 0, false)); }
    return g;
  }
  function crown() { const g = new T.Group(), m = mat('#ffd23a', { metalness: 1, roughness: .18 }); g.add(mesh(new T.CylinderGeometry(.26, .24, .16, 16, 1, true), m, 0, 0, 0, false)); for (let i = 0; i < 5; i++) { const a = i / 5 * PI * 2; g.add(mesh(new T.ConeGeometry(.07, .18, 6), m, Math.sin(a) * .25, .16, Math.cos(a) * .25, false)); g.add(mesh(new T.SphereGeometry(.035, 8, 6), mat('#ff3a6a', { metalness: .3, roughness: .1 }), Math.sin(a) * .26, .04, Math.cos(a) * .26, false)); } g.position.y = 1.36; return g; }
  const beans = new Map();
  function bean(c) {
    let b = beans.get(c.id); if (b) return b;
    const g = new T.Group(), body = mesh(bodyG, mat(c.col), 0, 0, 0, true), num = new T.Mesh(numG, new T.MeshStandardMaterial({ map: numTex(c.num), roughness: .6 })); g.add(body, num);
    const em = mat('#ffffff', { roughness: .1, clearcoat: 1 }), pm = mat('#141020', { roughness: .1, clearcoat: 1 });
    [-1, 1].forEach(s => { g.add(mesh(eyeG, em, s * .13, 1.02, .34, false)); g.add(mesh(pupG, pm, s * .13, 1.02, .42, false)); });
    g.add(mesh(smileG, pm, 0, .9, .39, false));
    const hl = mesh(handG, mat(c.col), -.45, .6, .05, true), hr = mesh(handG, mat(c.col), .45, .6, .05, true), fl = mesh(footG, mat('#ffffff'), -.16, .07, .04, true), fr = mesh(footG, mat('#ffffff'), .16, .07, .04, true); g.add(hl, hr, fl, fr);
    const hg = hat(c.hat, c.col); g.add(hg);
    const sh = new T.Mesh(new T.CircleGeometry(.45, 16), new T.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .28, depthWrite: false })); sh.rotation.x = -PI / 2;
    let tag = null; if (c.human) { const t = ctex('tag' + c.id + c.name, 256, 64, (x, w, h) => { x.fillStyle = 'rgba(20,8,50,.82)'; x.beginPath(); x.roundRect ? x.roundRect(4, 4, w - 8, h - 8, 26) : x.rect(4, 4, w - 8, h - 8); x.fill(); x.fillStyle = '#ffd23a'; x.font = 'bold 34px Fredoka, system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(c.name.slice(0, 12), w / 2, h / 2 + 2); }); tag = new T.Sprite(new T.SpriteMaterial({ map: t, depthTest: false, transparent: true })); tag.scale.set(1.6, .4, 1); tag.position.y = 2.05; tag.renderOrder = 9; g.add(tag); }
    scene.add(g, sh); b = { g, sh, hl, hr, fl, fr, body, tag, hg, yaw: c.yaw || 0, t: Math.random() * 9, lx: c.x, lz: c.z, crown: null, puff: false }; beans.set(c.id, b); return b;
  }
  function clearBeans() { for (const [, b] of beans) { scene.remove(b.g, b.sh); if (b.mark) scene.remove(b.mark); b.sh.geometry.dispose(); } beans.clear(); }
  function syncBeans(S, dt, meId) {
    for (const c of S.cons) {
      const b = bean(c), age = c.out ? S.t - (c.outT || 0) : -1, gone = c.out && (age > 2.6 || age < 0 || c.outRound !== S.k);
      b.g.visible = b.sh.visible = !gone; if (gone) continue;
      if (c.out && !b.puff) { b.puff = true; burst(c.x, c.y + 1, c.z, 40, null, 7, 8); hype(.7); }
      if (!c.out) b.puff = false;
      const sp = Math.hypot(c.x - b.lx, c.z - b.lz) / Math.max(dt, 1e-3); b.lx = c.x; b.lz = c.z; b.t += dt * (2 + Math.min(8, sp) * 1.4);
      const mv = Math.min(1, sp / 5); let d = (c.yaw || 0) - b.yaw; while (d > PI) d -= 2 * PI; while (d < -PI) d += 2 * PI; b.yaw += d * Math.min(1, dt * 10);
      b.g.position.set(c.x, c.y + (mv > .1 ? Math.abs(Math.sin(b.t)) * .08 : 0), c.z); b.g.rotation.set(0, b.yaw, 0);
      if (c.out) { b.g.rotation.x = age * 6; b.g.rotation.z = age * 4; const s = Math.max(.01, 1 - age * .35); b.g.scale.setScalar(s); } else b.g.scale.setScalar(1);
      const sw = Math.sin(b.t) * .5 * mv; b.hl.position.set(-.45, .6 + sw * .1, .05 + sw * .3); b.hr.position.set(.45, .6 - sw * .1, .05 - sw * .3); b.fl.position.z = .04 + sw * .25; b.fr.position.z = .04 - sw * .25;
      // rundenabhängige Posen
      if (S.round === 'seil' && !c.out) { b.hl.position.set(-.18, .7, .4); b.hr.position.set(.18, .72, .45); b.g.rotation.x = -.18 - (c.pw || 0) * .12; }
      else if (S.round === 'keks' && !c.out && !c.kDone) { const k = Math.sin(time * 5 + c.id) * .06; b.hr.position.set(.22 + k, .7, .42); b.g.rotation.x = .25; }
      else if (c.safe && !c.out && S.round !== 'stuhl') { const j = Math.abs(Math.sin(time * 6 + c.id)); b.hl.position.y = b.hr.position.y = .9 + j * .45; b.g.position.y += j * .12; }
      if (S.round === 'stuhl' && c.seat >= 0) { b.g.rotation.x = 0; b.fl.position.z = b.fr.position.z = .3; }
      b.sh.position.set(c.x, (c.falling ? -99 : groundAt(S, c)) + .02, c.z); b.sh.material.opacity = .28 * Math.max(.2, 1 - Math.abs(c.y) * .2);
      if (b.tag) b.tag.material.opacity = c.id === meId ? 1 : .8;
      if (c.id === meId && !b.mark) { const m = new T.Group(), ring = new T.Mesh(new T.RingGeometry(.5, .62, 32), glow('#ffd23a', .9)); ring.rotation.x = -PI / 2; ring.position.y = .04; const ar = new T.Mesh(new T.ConeGeometry(.2, .36, 4), glow('#ffd23a')); ar.rotation.x = PI; ar.position.y = 2.55; m.add(ring, ar); m.userData.ar = ar; scene.add(m); b.mark = m; }
      if (b.mark) { b.mark.visible = c.id === meId && !c.out; b.mark.position.set(c.x, c.y, c.z); b.mark.userData.ar.position.y = 2.55 + Math.sin(time * 4) * .12; b.mark.userData.ar.rotation.y += dt * 3; }
      const win = S.done && S.winner && S.winner.id === c.id; if (win && !b.crown) { b.crown = crown(); b.g.add(b.crown); b.hg.visible = false; } if (b.crown) b.crown.rotation.y += dt * 1.5;
    }
  }
  const groundAt = (S, c) => S.round === 'stuhl' && c.seat >= 0 ? .55 : 0;

  /* ---------- Arenen ---------- */
  const dyn = {};
  function clearArena() { if (arena) { scene.remove(arena); arena.traverse(o => { if (o.geometry && !Object.values(RB).includes(o.geometry) && o.geometry !== bodyG) o.geometry.dispose(); }); } arena = new T.Group(); scene.add(arena); for (const k in dyn) delete dyn[k]; }
  function pit(kind, w, d, cx, cz, y, n) { // Schaumstoffwürfel oder Bälle
    const g = kind === 'ball' ? new T.SphereGeometry(.32, 10, 8) : new T.BoxGeometry(.6, .6, .6), m = new T.InstancedMesh(g, new T.MeshPhysicalMaterial({ roughness: kind === 'ball' ? .2 : .85, clearcoat: kind === 'ball' ? 1 : 0 }), n), o = new T.Object3D(), cols = ['#ff4a6a', '#ffb020', '#3ab0ff', '#3ae07a', '#b06aff', '#ffe040', '#ff7ad0'];
    for (let i = 0; i < n; i++) { o.position.set(cx + (Math.random() - .5) * w, y + Math.random() * .9, cz + (Math.random() - .5) * d); o.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3); o.updateMatrix(); m.setMatrixAt(i, o.matrix); m.setColorAt(i, lin(cols[i % cols.length])); }
    m.receiveShadow = true; arena.add(m); if (kind === 'ball') return m; const tub = new T.Mesh(new T.BoxGeometry(w + .4, 1.6, d + .4), new T.MeshStandardMaterial({ color: lin('#2a1a5a'), roughness: .6 })); tub.position.set(cx, y - .4, cz); arena.add(tub); return m;
  }
  function floorTex(kind) { return ctex('fl' + kind, 256, 256, (x, w, h) => {
    if (kind === 'ampel') { for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#1e9c86' : '#178a76'; x.fillRect(i * 32, 0, 32, h); } x.fillStyle = 'rgba(255,255,255,.08)'; for (let j = 0; j < h; j += 16) x.fillRect(0, j, w, 2); }
    else if (kind === 'stuhl') { const cx = w / 2; for (let i = 0; i < 12; i++) { x.fillStyle = ['#ff4a8a', '#ffd23a', '#3ab0ff', '#b06aff'][i % 4]; x.beginPath(); x.moveTo(cx, cx); x.arc(cx, cx, cx, i / 12 * PI * 2, (i + 1) / 12 * PI * 2); x.fill(); } x.fillStyle = '#fff'; x.beginPath(); x.arc(cx, cx, 26, 0, 7); x.fill(); x.fillStyle = '#ff3aa8'; x.font = 'bold 30px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('★', cx, cx); }
    else if (kind === 'finale') { const cx = w / 2; for (let i = 10; i > 0; i--) { x.fillStyle = i % 2 ? '#ffd23a' : '#ff3aa8'; x.beginPath(); x.arc(cx, cx, cx * i / 10, 0, 7); x.fill(); } x.fillStyle = '#fff'; x.font = 'bold 40px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('👑', cx, cx); }
  }); }
  function line(w, d, x, z, col, kind) { const t = kind === 'check' ? ctex('chk', 64, 8, (c, w2, h2) => { for (let i = 0; i < 16; i++) for (let j = 0; j < 2; j++) { c.fillStyle = (i + j) % 2 ? '#111' : '#fff'; c.fillRect(i * 4, j * 4, 4, 4); } }) : null; const m = new T.Mesh(new T.PlaneGeometry(w, d), t ? new T.MeshBasicMaterial({ map: t }) : glow(col)); m.rotation.x = -PI / 2; m.position.set(x, .015, z); arena.add(m); }
  function robot() { // freundlicher Ampel-Roboter (Kasten-Körper, Bildschirm-Gesicht, Ampel auf der Brust)
    const g = new T.Group(), wm = mat('#f4f0ff', { roughness: .25, clearcoat: 1 }), pm = mat('#ff3aa8'), dm = mat('#2a2440', { metalness: .6, roughness: .3 });
    g.add(mesh(rbox(3, 3.4, 2.2, .4), wm, 0, 2.6, 0, true), mesh(rbox(3.2, .5, 2.4, .2), pm, 0, 1, 0, true), mesh(new T.CylinderGeometry(.9, 1.2, 1, 20), dm, 0, .5, 0, true));
    const head = new T.Group(); head.position.y = 5.2; g.add(head); head.add(mesh(rbox(2.6, 1.9, 1.9, .45), wm, 0, 0, 0, true));
    const face = new T.Mesh(new T.PlaneGeometry(2.1, 1.35), new T.MeshBasicMaterial({ map: faceTex('calm') })); face.position.set(0, 0, .97); head.add(face);
    head.add(mesh(new T.CylinderGeometry(.04, .04, .8, 6), dm, 0, 1.3, 0, false)); const ant = mesh(new T.SphereGeometry(.16, 12, 8), glow('#ffd23a'), 0, 1.75, 0, false); head.add(ant);
    const lamps = ['#ff2a3a', '#ffc020', '#2aff6a'].map((c, i) => { const l = new T.Mesh(new T.CircleGeometry(.32, 20), new T.MeshBasicMaterial({ color: lin('#222') })); l.position.set(0, 3.55 - i * .78, 1.11); l.userData.on = lin(c); g.add(l); return l; });
    const back = new T.Mesh(new T.PlaneGeometry(2.4, 2.6), new T.MeshBasicMaterial({ map: ctex('rback', 128, 128, (x, w, h) => { x.fillStyle = '#ff3aa8'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; x.font = 'bold 60px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('★', w / 2, h / 2); }) })); back.position.set(0, 2.6, -1.11); back.rotation.y = PI; g.add(back);
    [-1, 1].forEach(s => { const a = mesh(new T.CylinderGeometry(.22, .22, 2, 12), wm, s * 1.75, 2.8, 0, true); a.rotation.z = s * .25; g.add(a); g.add(mesh(new T.SphereGeometry(.36, 12, 8), pm, s * 2, 1.85, 0, true)); });
    g.scale.setScalar(2.3); return { g, head, face, lamps, ant };
  }
  function faceTex(k) { return ctex('face' + k, 256, 160, (x, w, h) => { x.fillStyle = '#10102a'; x.fillRect(0, 0, w, h); x.strokeStyle = x.fillStyle = k === 'scan' ? '#ff4a5a' : '#3affb0'; x.lineWidth = 12; x.lineCap = 'round';
    if (k === 'scan') { [70, 186].forEach(cx => { x.beginPath(); x.arc(cx, 76, 28, 0, 7); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.arc(cx + 6, 70, 9, 0, 7); x.fill(); x.fillStyle = '#ff4a5a'; }); x.beginPath(); x.moveTo(40, 30); x.lineTo(100, 44); x.moveTo(216, 30); x.lineTo(156, 44); x.stroke(); x.beginPath(); x.moveTo(98, 128); x.lineTo(158, 128); x.stroke(); }
    else { [70, 186].forEach(cx => { x.beginPath(); x.arc(cx, 84, 26, PI * 1.1, PI * 1.9); x.stroke(); }); x.beginPath(); x.arc(128, 104, 34, .2, PI - .2); x.stroke(); }
    for (let j = 0; j < h; j += 4) { x.fillStyle = 'rgba(255,255,255,.04)'; x.fillRect(0, j, w, 1); } }); }
  function cookieTex(shape) { return ctex('ck' + shape, 256, 256, (x, w, h) => { x.fillStyle = '#e8b45a'; x.beginPath(); x.arc(128, 128, 126, 0, 7); x.fill(); x.fillStyle = 'rgba(160,90,20,.25)'; for (let i = 0; i < 40; i++) { x.beginPath(); x.arc(Math.random() * 256, Math.random() * 256, 2 + Math.random() * 3, 0, 7); x.fill(); } x.strokeStyle = '#8a4a14'; x.lineWidth = 7; x.beginPath(); C.SHAPES[shape].pts.forEach((p, i) => { const X = 128 + p[0] * 150, Y = 128 + p[1] * 150; i ? x.lineTo(X, Y) : x.moveTo(X, Y); }); x.stroke(); }); }
  function chairGeo() { return RB.chair || (RB.chair = mergeG([[rbox(.9, .14, .9, .08), 0, .5, 0], [rbox(.9, .9, .12, .06), 0, 1, -.4], [new T.CylinderGeometry(.05, .05, .5, 6), .36, .25, .36], [new T.CylinderGeometry(.05, .05, .5, 6), -.36, .25, .36], [new T.CylinderGeometry(.05, .05, .5, 6), .36, .25, -.36], [new T.CylinderGeometry(.05, .05, .5, 6), -.36, .25, -.36]])); }

  function setArena(kind, S) {
    clearArena(); arenaKind = kind; let cz = 0; const R0 = S && S.R;
    if (kind === 'ampel') {
      const L = R0.len, w = R0.w; cz = L / 2; const fl = mesh(new T.BoxGeometry(w + 4, 1, L + 14), new T.MeshPhysicalMaterial({ map: floorTex('ampel'), roughness: .65, clearcoat: .15 }), 0, -.5, L / 2 + 2); arena.add(fl);
      line(w + 4, .5, 0, 0, '#ffffff'); line(w + 4, 1, 0, L, null, 'check');
      [-1, 1].forEach(s => { arena.add(mesh(rbox(.6, 1, L + 14, .2), mat('#ff3aa8'), s * (w / 2 + 2.3), 0, L / 2 + 2, true)); const e = new T.Mesh(new T.BoxGeometry(.12, .12, L + 14), glow('#3ad8ff')); e.position.set(s * (w / 2 + 2.3), .55, L / 2 + 2); arena.add(e); });
      const rb = robot(); rb.g.position.set(0, 0, L + 7.5); arena.add(rb.g); dyn.robot = rb; rb.ry = 0;
      for (let i = 0; i < 6; i++) { const s = i % 2 ? 1 : -1, b = mesh(new T.SphereGeometry(1.1, 16, 12), mat(['#ff4a6a', '#ffd23a', '#3ab0ff'][i % 3], { clearcoat: 1, roughness: .1 }), s * (w / 2 + 5), 3 + (i % 3), 6 + i * 9, true); b.userData.f = i; arena.add(b); (dyn.balloons = dyn.balloons || []).push(b); }
    } else if (kind === 'bruecke') {
      const rows = R0.rows, end = C.rowZ(rows); cz = end / 2;
      arena.add(mesh(rbox(9, 1, 7, .3), mat('#3ab0ff'), 0, -.5, -2.2, true), mesh(rbox(9, 1, 6, .3), mat('#3ae07a'), 0, -.5, end + 3.2, true));
      dyn.tiles = []; for (let r = 0; r < rows; r++) for (let s = 0; s < 2; s++) { const t = mesh(rbox(1.9, .32, 1.9, .2), new T.MeshPhysicalMaterial({ color: lin(r % 2 ? '#ff7ad0' : '#ffb04a'), roughness: .12, clearcoat: 1, transparent: true, opacity: .9 }), C.tileX(s), -.16, C.rowZ(r), true); t.userData = { r, s, wob: 0 }; arena.add(t); dyn.tiles.push(t); }
      [-1, 1].forEach(s => { const bar = mesh(new T.CylinderGeometry(.08, .08, end + 2, 8), mat('#d8dce8', { metalness: .9, roughness: .2 }), s * 3, .6, end / 2, false); bar.rotation.x = PI / 2; arena.add(bar); for (let z = 0; z <= end; z += 4) arena.add(mesh(new T.CylinderGeometry(.06, .06, 7.4, 6), mat('#d8dce8', { metalness: .9 }), s * 3, -3.1, z + 1, false)); });
      pit('foam', 8, end + 2, 0, end / 2 + .5, -6.4, 420);
    } else if (kind === 'seil') {
      [-1, 1].forEach(s => { arena.add(mesh(rbox(18, 1, 5, .3), mat(s < 0 ? '#ff4a6a' : '#3ab0ff'), s * 10.5, -.5, 0, true)); });
      pit('foam', 3, 5, 0, 0, -5.6, 90); line(.15, 5, 0, 0, '#ffffff'); arena.children[arena.children.length - 1].position.y = -4.4;
      const rope = mesh(new T.CylinderGeometry(.07, .07, 40, 8), mat('#d8b070', { roughness: .9, clearcoat: 0 }), 0, .78, .42, true); rope.rotation.z = PI / 2; arena.add(rope); dyn.rope = rope;
      const flag = mesh(new T.ConeGeometry(.22, .6, 8), mat('#ffd23a'), 0, .5, .42, false); flag.rotation.x = PI; arena.add(flag); dyn.flag = flag;
    } else if (kind === 'keks') {
      arena.add(mesh(rbox(18, 1, 14, .4), mat('#ffe8c8', { roughness: .6 }), 0, -.5, 5, true));
      dyn.cookies = new Map(); for (const c of S.cons) { if (!c.alive) continue; arena.add(mesh(rbox(1.7, .8, 1, .12), mat('#7a4ad0'), c.x, .4, c.z - .75, true)); const ck = mesh(new T.CylinderGeometry(.4, .4, .06, 28), [new T.MeshStandardMaterial({ color: lin('#c88a3a') }), new T.MeshStandardMaterial({ map: cookieTex(c.shape), roughness: .7 }), new T.MeshStandardMaterial({ color: lin('#c88a3a') })], c.x, .84, c.z - .75, true); dyn.cookies.set(c.id, ck); arena.add(ck); }
    } else if (kind === 'stuhl') {
      const f = mesh(new T.CylinderGeometry(C.ARENA_R, C.ARENA_R + .3, 1, 64), [new T.MeshPhysicalMaterial({ color: lin('#6a2aff') }), new T.MeshPhysicalMaterial({ map: floorTex('stuhl'), roughness: .3, clearcoat: .8 }), new T.MeshPhysicalMaterial({ color: lin('#6a2aff') })], 0, -.5, 0, true); arena.add(f);
      const ring = new T.Mesh(new T.TorusGeometry(C.ARENA_R + .2, .1, 6, 96), glow('#ffd23a')); ring.rotation.x = PI / 2; ring.position.y = .02; arena.add(ring); dyn.chairs = []; dyn.chairKey = '';
    } else if (kind === 'finale') {
      const f = mesh(new T.CylinderGeometry(10, 10, 1, 64), [new T.MeshPhysicalMaterial({ color: lin('#ff3aa8') }), new T.MeshPhysicalMaterial({ map: floorTex('finale'), roughness: .3, clearcoat: .8 }), new T.MeshPhysicalMaterial({ color: lin('#ff3aa8') })], 0, -.5, 0, true); arena.add(f); dyn.plat = f;
      const ring = new T.Mesh(new T.TorusGeometry(10, .12, 6, 96), glow('#3ad8ff')); ring.rotation.x = PI / 2; ring.position.y = .03; arena.add(ring); dyn.ring = ring;
      const bp = new T.Mesh(new T.CylinderGeometry(15, 15, 1.6, 48, 1, true), new T.MeshStandardMaterial({ color: lin('#2a1a5a'), side: T.DoubleSide })); bp.position.y = -5.2; arena.add(bp); pit('ball', 26, 26, 0, 0, -5.4, 520);
    } else { // Menü/Intro: Bühne mit Stern
      arena.add(mesh(new T.CylinderGeometry(7, 7.4, 1, 64), [new T.MeshPhysicalMaterial({ color: lin('#ff3aa8') }), new T.MeshPhysicalMaterial({ map: floorTex('finale'), roughness: .25, clearcoat: 1 }), new T.MeshPhysicalMaterial({ color: lin('#ff3aa8') })], 0, -.5, 0, true));
      const ring = new T.Mesh(new T.TorusGeometry(7.2, .1, 6, 96), glow('#ffd23a')); ring.rotation.x = PI / 2; ring.position.y = .03; arena.add(ring);
    }
    studio.position.set(0, 0, cz); setScreen(kind && C.NAMES[kind] ? C.NAMES[kind] : '');
  }
  function syncArena(S, dt) {
    const Rr = S.R; if (!Rr) return;
    if (arenaKind === 'ampel' && dyn.robot) { const rb = dyn.robot, face = Rr.light !== 'green'; rb.ry += ((face ? PI : 0) - rb.ry) * Math.min(1, dt * (face ? 7 : 4)); rb.head.rotation.y = rb.ry; rb.g.rotation.y = rb.ry * .25; rb.face.material.map = faceTex(Rr.light === 'red' ? 'scan' : 'calm');
      rb.lamps.forEach((l, i) => { const on = (i === 0 && Rr.light === 'red') || (i === 1 && Rr.light === 'turn') || (i === 2 && Rr.light === 'green'); l.material.color.copy(on ? l.userData.on : lin('#2a2a32')); }); rb.ant.scale.setScalar(1 + Math.sin(time * 8) * .2);
      (dyn.balloons || []).forEach(b => { b.position.y += Math.sin(time * 1.4 + b.userData.f) * .006; }); }
    if (arenaKind === 'bruecke' && dyn.tiles) { for (const t of dyn.tiles) { const u = t.userData, br = Rr.broken.includes(u.r * 2 + u.s); if (br && t.visible) { t.visible = false; burst(t.position.x, 0, t.position.z, 50, '#ff7ad0', 6, 5); } const known = Rr.known[u.r] === u.s; t.material.emissive = t.material.emissive || new T.Color(); t.material.emissive.set(known ? 0x1a6a3a : 0x000000); }
      if (Rr.jump && !Rr.jump.wob) { Rr.jump.wob = 1; } }
    if (arenaKind === 'seil' && dyn.rope) { const x = Rr.p * 3; dyn.rope.position.x = x; dyn.flag.position.x = x; dyn.flag.position.y = .5 + Math.sin(time * 10) * .03; }
    if (arenaKind === 'keks' && dyn.cookies) { for (const c of S.cons) { const ck = dyn.cookies.get(c.id); if (!ck) continue; if (c.out && ck.visible) { ck.visible = false; burst(ck.position.x, 1, ck.position.z, 30, '#c88a3a', 4, 4); } if (c.kDone) ck.rotation.y += dt * 2; } }
    if (arenaKind === 'stuhl') { const k = Rr.phase + Rr.lap + ':' + (Rr.chairs || []).length; if (k !== dyn.chairKey) { dyn.chairKey = k; dyn.chairs.forEach(m => arena.remove(m)); dyn.chairs = []; if (Rr.phase === 'grab') for (const ch of Rr.chairs) { const m = mesh(chairGeo(), mat(['#ffd23a', '#3ab0ff', '#3ae07a', '#ff7ad0'][dyn.chairs.length % 4]), ch.x, 0, ch.z, true); m.rotation.y = ch.rot; m.scale.setScalar(.01); m.userData.t = 0; arena.add(m); dyn.chairs.push(m); burst(ch.x, .5, ch.z, 8, '#ffffff', 3, 3); } }
      dyn.chairs.forEach(m => { m.userData.t += dt; m.scale.setScalar(Math.min(1, m.userData.t * 5) * (1 + Math.max(0, .2 - m.userData.t) * 2)); }); }
    if (arenaKind === 'finale' && dyn.plat) { const s = Rr.r / 10; dyn.plat.scale.set(s, 1, s); dyn.ring.scale.set(s, s, 1); dyn.ring.material.color.copy(lin(Rr.r < 4 ? '#ff3a4a' : '#3ad8ff')); }
  }

  /* ---------- Konfetti (Instanzen) ---------- */
  let conf = null; const CN = 600, cv = [];
  function initParts() { const g = new T.PlaneGeometry(.14, .22); conf = new T.InstancedMesh(g, new T.MeshBasicMaterial({ side: T.DoubleSide }), CN); conf.frustumCulled = false; const o = new T.Object3D(); o.position.y = -999; o.updateMatrix(); for (let i = 0; i < CN; i++) { conf.setMatrixAt(i, o.matrix); conf.setColorAt(i, lin('#ffffff')); cv.push({ life: 0 }); } scene.add(conf); }
  const CC = ['#ff4a7a', '#ffd23a', '#4ab0ff', '#5ae07a', '#c86aff', '#ffffff', '#ff8a3a'];
  function burst(x, y, z, n, col, sp, up) { let k = 0; for (let i = 0; i < CN && k < n; i++) { const p = cv[i]; if (p.life > 0) continue; Object.assign(p, { x, y, z, vx: (Math.random() - .5) * (sp || 6), vy: Math.random() * (up || 6) + 1, vz: (Math.random() - .5) * (sp || 6), life: 1.2 + Math.random() * 1.2, r: Math.random() * 6, rs: (Math.random() - .5) * 14 }); conf.setColorAt(i, lin(col || CC[(Math.random() * CC.length) | 0])); k++; } if (conf.instanceColor) conf.instanceColor.needsUpdate = true; }
  function rain(cx, cz, n) { for (let i = 0; i < n; i++) burst(cx + (Math.random() - .5) * 20, 14, cz + (Math.random() - .5) * 20, 1, null, 1, .5); }
  const _o = new T.Object3D();
  function stepParts(dt) { if (!conf) return; for (let i = 0; i < CN; i++) { const p = cv[i]; if (p.life <= 0) { if (p.life > -1) { p.life = -2; _o.position.set(0, -999, 0); _o.updateMatrix(); conf.setMatrixAt(i, _o.matrix); } continue; } p.life -= dt; p.vy = Math.max(-2.2, p.vy - 9 * dt); p.vx *= .985; p.vz *= .985; p.x += p.vx * dt + Math.sin(p.r) * dt * .6; p.y += p.vy * dt; p.z += p.vz * dt; p.r += p.rs * dt; _o.position.set(p.x, p.y, p.z); _o.rotation.set(p.r, p.r * .7, 0); _o.updateMatrix(); conf.setMatrixAt(i, _o.matrix); if (p.life <= 0) p.life = 0; } conf.instanceMatrix.needsUpdate = true; }

  /* ---------- Kamera ---------- */
  const cs = { p: new T.Vector3(0, 10, -20), l: new T.Vector3(), init: false }, tp = new T.Vector3(), tl = new T.Vector3();
  let camYaw = 0;
  function camFor(S, meId, dt) {
    const Rr = S.R, k = S.round, me = meId !== undefined && meId !== null ? S.cons[meId] : null, al = S.cons.filter(c => c.alive);
    let f = me && me.alive ? me : null; const pk = W < H ? Math.min(2, H / W * .75) : 1;   // Hochformat: weiter weg, damit alles ins Bild passt
    if (k === 'ampel') { if (!f) { const a = al.filter(c => !c.safe); f = a.length ? a.reduce((p, c) => c.z < p.z ? c : p) : (al[0] || S.cons[0]); } const z = Math.min(f.z, Rr.len - 1); tp.set(f.x * (pk > 1 ? 1 : .6), 7.5, z - 10); tl.set(f.x * (pk > 1 ? 1 : .5), 1, z + 7); camYaw = 0; }
    else if (k === 'bruecke') { const c = Rr.cur !== null && Rr.cur !== undefined ? S.cons[Rr.cur] : null, z = c ? c.z : 0; tp.set(0, 6.5, z - 7.5); tl.set(0, -.5, z + 4); camYaw = 0; }
    else if (k === 'seil') { tp.set(0, 7 * pk * 1.3, 15 * pk * 1.3); tl.set(0, .5, 0); camYaw = PI; }
    else if (k === 'keks') { const c = me && me.alive ? me : null; if (c) { tp.set(c.x, 5.5, c.z - 6.5); tl.set(c.x, .6, c.z); } else { tp.set(0, 10, -10); tl.set(0, 0, 6); } camYaw = 0; }
    else if (k === 'stuhl') { tp.set(0, 17 * pk, -13 * pk); tl.set(0, 0, 1); camYaw = 0; }
    else if (k === 'finale') { const r = Rr ? Rr.r : 10; tp.set(0, (9 + r) * pk, (-8 - r) * pk); tl.set(0, -1, 0); camYaw = 0; }
    else { tp.set(Math.sin(time * .15) * 14, 6, Math.cos(time * .15) * 14); tl.set(0, 1, 0); }
    if (S.done && S.winner) { const w = S.winner; tp.set(w.x + Math.sin(time * .4) * 6, w.y + 3, w.z + Math.cos(time * .4) * 6); tl.set(w.x, w.y + 1, w.z); }
    if (!cs.init) { cs.p.copy(tp); cs.l.copy(tl); cs.init = true; } const a = Math.min(1, dt * 2.5); cs.p.lerp(tp, a); cs.l.lerp(tl, a); cam.position.copy(cs.p); cam.lookAt(cs.l);
    key.position.set(cs.l.x + 14, 30, cs.l.z - 12); key.target.position.copy(cs.l);
  }
  function camReset() { cs.init = false; }
  function camOrbit(dt, cx, cz, r, h) { tp.set(cx + Math.sin(time * .18) * r, h, cz + Math.cos(time * .18) * r); tl.set(cx, 1.2, cz); if (!cs.init) { cs.p.copy(tp); cs.l.copy(tl); cs.init = true; } cs.p.lerp(tp, Math.min(1, dt * 2)); cs.l.lerp(tl, Math.min(1, dt * 2)); cam.position.copy(cs.p); cam.lookAt(cs.l); key.position.set(cx + 14, 30, cz - 12); key.target.position.set(cx, 0, cz); }

  /* ---------- Menü-Bühne ---------- */
  let menuS = null;
  function menuStage() { clearBeans(); setArena('menu'); camReset(); const cons = []; for (let i = 0; i < 9; i++) { const a = i / 9 * PI * 2; cons.push({ id: i, num: [1, 7, 23, 42, 77, 99, 101, 123, 456][i], col: C.COLS[i], hat: i % 6, x: Math.cos(a) * 3.6, y: 0, z: Math.sin(a) * 3.6, yaw: Math.atan2(-Math.cos(a), -Math.sin(a)) + PI, alive: true, safe: true }); } menuS = { cons, t: 0, k: 0, round: 'menu', R: null }; }
  function menuFrame(dt) { if (!menuS) return; menuS.t += dt; menuS.cons.forEach((c, i) => { const a = i / 9 * PI * 2 + menuS.t * .25; c.x = Math.cos(a) * 3.6; c.z = Math.sin(a) * 3.6; c.yaw = a + PI; }); syncBeans(menuS, dt); camOrbit(dt, 0, 0, 13, 5.5); if (Math.random() < dt * .6) burst((Math.random() - .5) * 8, 7, (Math.random() - .5) * 8, 12); hype(.25); }
  function menuOff() { menuS = null; }

  /* ---------- Öffentlich ---------- */
  function sync(S, dt, meId) { time += dt; syncArena(S, dt); syncBeans(S, dt, meId); camFor(S, meId, dt); }
  function render(dt) { time += menuS ? dt : 0; if (menuS) menuFrame(dt); syncAud(dt); studio.children.forEach(o => { if (o.userData.spot !== undefined) { o.rotation.z = Math.sin(time * .7 + o.userData.spot) * .25; } }); stepParts(dt || 0); R.render(scene, cam); }
  let q = 2; function quality(l) { if (l === undefined) return q; q = l; R.setPixelRatio(l >= 2 ? Math.min(devicePixelRatio || 1, 1.75) : l === 1 ? 1 : .75); R.shadowMap.enabled = l > 0; key.castShadow = l > 0; if (aud) aud.visible = l > 0 || true; scene.traverse(o => { if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { m.needsUpdate = true; }); }); resize(W, H); }
  // Bildschirm-Projektion für Namen/Hinweise im HUD
  const _v = new T.Vector3(); function project(x, y, z) { _v.set(x, y, z).project(cam); return { x: (_v.x + 1) / 2 * W, y: (1 - _v.y) / 2 * H, vis: _v.z < 1 }; }
  window.CSView = { init, resize, quality, setArena, clearBeans, sync, render, burst, rain, hype, camReset, menuStage, menuOff, project, setScreen, get camYaw() { return camYaw; }, get arenaKind() { return arenaKind; } };
})();
