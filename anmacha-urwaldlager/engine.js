/* Urwaldlager – 3D-Kern: Renderer, Qualitätsstufen, adaptive Auflösung, Spielschleife, geteilte Geometrien, Figuren */
(function (root) {
  'use strict';
  const THREE = root.THREE;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t;
  const QUALITY = {
    low: { level: 'low', maxPR: 1, shadows: false, shadowSize: 0, density: .45, aa: false, far: 70, npcHz: 4, rain: 350, fx: .5 },
    mid: { level: 'mid', maxPR: 1.5, shadows: false, shadowSize: 0, density: .75, aa: false, far: 95, npcHz: 8, rain: 700, fx: .8 },
    high: { level: 'high', maxPR: 2, shadows: true, shadowSize: 1024, density: 1, aa: true, far: 130, npcHz: 15, rain: 1200, fx: 1 }
  };
  const E = {
    THREE, renderer: null, canvas: null, mode: null, paused: false, time: 0, q: QUALITY.mid, W: 1, H: 1,
    scale: 1, fps: 60, frameMs: 16, onResize: [], hooks: [], lowPower: false, stats: { calls: 0, tris: 0 }
  };
  function isMobile() { return (root.matchMedia && matchMedia('(pointer:coarse)').matches) || /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent); }
  E.isMobile = isMobile;
  E.autoQuality = () => { const m = isMobile(), cores = navigator.hardwareConcurrency || 4, mem = navigator.deviceMemory || 4; if (m) return (cores >= 8 && mem >= 6) ? 'mid' : 'low'; return cores >= 6 ? 'high' : 'mid'; };

  E.init = function (canvas, level) {
    E.canvas = canvas; E.q = QUALITY[level] || QUALITY[E.autoQuality()];
    try {
      E.renderer = new THREE.WebGLRenderer({ canvas, antialias: E.q.aa, powerPreference: 'high-performance', alpha: false, stencil: false });
    } catch (e) { E.renderer = null; return false; }
    const r = E.renderer; r.setClearColor(0x0b2416); r.outputEncoding = THREE.sRGBEncoding; r.shadowMap.enabled = E.q.shadows; r.shadowMap.type = THREE.PCFShadowMap; r.shadowMap.autoUpdate = true;
    E.scale = 1; resize(); root.addEventListener('resize', resize); root.addEventListener('orientationchange', () => setTimeout(resize, 200));
    if (root.visualViewport) root.visualViewport.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', () => { if (document.hidden) E.hooks.forEach(h => h('hidden')); });
    requestAnimationFrame(frame); return true;
  };
  E.setQuality = function (level) {
    const q = QUALITY[level] || QUALITY[E.autoQuality()], shadowChange = q.shadows !== E.q.shadows; E.q = q; E.scale = 1;
    if (E.renderer) { E.renderer.shadowMap.enabled = q.shadows; if (shadowChange) E.hooks.forEach(h => h('quality')); }
    resize(); E.hooks.forEach(h => h('quality'));
  };
  function pr() { return clamp((root.devicePixelRatio || 1), .5, E.q.maxPR) * E.scale; }
  function resize() {
    if (!E.renderer) return; const vv = root.visualViewport, w = Math.max(1, Math.round(vv ? vv.width : innerWidth)), h = Math.max(1, Math.round(vv ? vv.height : innerHeight));
    E.W = w; E.H = h; E.renderer.setPixelRatio(pr()); E.renderer.setSize(w, h, false); E.canvas.style.width = w + 'px'; E.canvas.style.height = h + 'px';
    E.onResize.forEach(f => f(w, h));
  }
  E.resize = resize;
  E.fitCamera = cam => { cam.aspect = E.W / E.H; cam.updateProjectionMatrix(); };

  // ---- Schleife: bildratenunabhängige Logik in Teilschritten, adaptive Renderauflösung
  let last = 0, acc = 0, accN = 0, adaptT = 0;
  E.speed = 1; // Testhilfe (Zeitraffer)
  function frame(ts) {
    requestAnimationFrame(frame);
    const raw = last ? (ts - last) / 1000 : 1 / 60; last = ts; if (document.hidden) return;
    E.frameMs = lerp(E.frameMs, raw * 1000, .05); E.fps = 1000 / E.frameMs;
    let dt = Math.min(.1, raw) * E.speed; const m = E.mode;
    if (!m) return;
    if (!E.paused && m.update) { while (dt > 1e-4) { const s = Math.min(dt, 1 / 30); m.update(s); dt -= s; E.time += s; } }
    if (m.render) m.render(E.renderer); else if (m.scene && m.camera) E.renderer.render(m.scene, m.camera);
    E.stats.calls = E.renderer.info.render.calls; E.stats.tris = E.renderer.info.render.triangles;
    // adaptive Auflösung (nur bei aktiver 3D-Szene)
    if (E.adaptive !== false && !E.paused && m.scene) {
      acc += raw; accN++; adaptT += raw;
      if (adaptT > 1.5) {
        const avg = acc / accN * 1000; acc = 0; accN = 0; adaptT = 0;
        let ns = E.scale; if (avg > 24) ns = Math.max(.5, E.scale - .12); else if (avg < 15 && E.scale < 1) ns = Math.min(1, E.scale + .06);
        if (Math.abs(ns - E.scale) > .01) { E.scale = ns; E.renderer.setPixelRatio(pr()); E.renderer.setSize(E.W, E.H, false); }
      }
    }
  }
  E.setMode = m => { E.mode = m; acc = 0; accN = 0; adaptT = 0; };

  // ---- Materialien & Geometrien (geteilt, werden nie entsorgt)
  const matCache = new Map();
  E.mat = (color, o) => {
    const key = color + '|' + (o ? JSON.stringify(o) : ''); let m = matCache.get(key);
    if (!m) { m = new THREE.MeshLambertMaterial(Object.assign({ color }, o || {})); m.userData.shared = true; matCache.set(key, m); }
    return m;
  };
  E.vcMat = new THREE.MeshLambertMaterial({ vertexColors: true }); E.vcMat.userData.shared = true;
  E.basic = (color, o) => { const key = 'b' + color + '|' + (o ? JSON.stringify(o) : ''); let m = matCache.get(key); if (!m) { m = new THREE.MeshBasicMaterial(Object.assign({ color }, o || {})); m.userData.shared = true; matCache.set(key, m); } return m; };
  E.share = o => { o.userData.shared = true; return o; };

  // statische Teile zu einer Geometrie mit Vertexfarben verschmelzen (weniger Draw Calls)
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), _s = new THREE.Vector3(), _c = new THREE.Color();
  E.mtx = (x, y, z, rx, ry, rz, sx, sy, sz) => { _e.set(rx || 0, ry || 0, rz || 0); _q.setFromEuler(_e); _v.set(x || 0, y || 0, z || 0); _s.set(sx == null ? 1 : sx, sy == null ? (sx == null ? 1 : sx) : sy, sz == null ? (sx == null ? 1 : sx) : sz); return new THREE.Matrix4().compose(_v, _q, _s); };
  E.merge = parts => { // parts: [{g, m (Matrix4), c (color)}]
    let n = 0; const list = parts.map(p => { let g = p.g.index ? p.g.toNonIndexed() : p.g.clone(); g.applyMatrix4(p.m || _m.identity()); n += g.attributes.position.count; return [g, p.c, p.jit || 0]; });
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3); let o = 0;
    list.forEach(([g, c, jit]) => {
      const a = g.attributes.position.array; pos.set(a, o * 3); _c.set(c); const cnt = g.attributes.position.count;
      for (let i = 0; i < cnt; i++) { let k = 1; if (jit) k = 1 + (((i / 3 | 0) * 9301 + 49297) % 233280 / 233280 - .5) * jit; col[(o + i) * 3] = _c.r * k; col[(o + i) * 3 + 1] = _c.g * k; col[(o + i) * 3 + 2] = _c.b * k; }
      o += cnt; g.dispose();
    });
    const out = new THREE.BufferGeometry(); out.setAttribute('position', new THREE.BufferAttribute(pos, 3)); out.setAttribute('color', new THREE.BufferAttribute(col, 3)); out.computeVertexNormals(); out.computeBoundingSphere(); return out;
  };
  const G = E.geo = {
    box: new THREE.BoxGeometry(1, 1, 1), sph: new THREE.SphereGeometry(1, 10, 8), sphLo: new THREE.IcosahedronGeometry(1, 0), ico: new THREE.IcosahedronGeometry(1, 1),
    cyl: new THREE.CylinderGeometry(1, 1, 1, 8), cylLo: new THREE.CylinderGeometry(1, 1, 1, 6), cone: new THREE.ConeGeometry(1, 1, 7), plane: new THREE.PlaneGeometry(1, 1),
    circle: new THREE.CircleGeometry(1, 16), torus: new THREE.TorusGeometry(1, .12, 6, 14), dodec: new THREE.DodecahedronGeometry(1, 0)
  };
  Object.values(G).forEach(g => { g.userData.shared = true; });
  E.texCache = {};
  E.canvasTex = (key, w, h, draw, repeat) => {
    if (E.texCache[key]) return E.texCache[key]; const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; } t.userData = { shared: true }; E.texCache[key] = t; return t;
  };
  E.blobTex = () => E.canvasTex('blob', 64, 64, (c, w) => { const g = c.createRadialGradient(w / 2, w / 2, 2, w / 2, w / 2, w / 2); g.addColorStop(0, 'rgba(0,0,0,.55)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, w, w); });
  E.glowTex = () => E.canvasTex('glow', 64, 64, (c, w) => { const g = c.createRadialGradient(w / 2, w / 2, 1, w / 2, w / 2, w / 2); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.3, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, w); });
  E.blobMat = () => { if (!E._blob) { E._blob = new THREE.MeshBasicMaterial({ map: E.blobTex(), transparent: true, depthWrite: false }); E._blob.userData.shared = true; } return E._blob; };

  // Szene sauber entsorgen (nur nicht geteilte Ressourcen)
  E.dispose = obj => {
    if (!obj) return; obj.traverse(o => {
      if (o.geometry && !o.geometry.userData.shared) o.geometry.dispose();
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { if (m.userData.shared) return; ['map', 'alphaMap', 'emissiveMap'].forEach(k => { if (m[k] && !(m[k].userData && m[k].userData.shared)) m[k].dispose(); }); m.dispose(); });
    });
    if (obj.parent) obj.parent.remove(obj);
  };

  // ---- Figuren (Kandidaten, Moderatoren): 6 Draw Calls je Figur, Geometrie je Aussehen zwischengespeichert
  const figCache = new Map();
  function shade(hex, a) { _c.set(hex); const f = v => clamp(a < 0 ? v * (1 + a) : v + (1 - v) * a, 0, 1); return '#' + new THREE.Color(f(_c.r), f(_c.g), f(_c.b)).getHexString(); }
  E.shade = shade;
  function headGeo(L) {
    const key = 'h' + [L.skin, L.hair, L.hs, (L.acc || []).join()].join('|'); if (figCache.has(key)) return figCache.get(key);
    const sk = L.skin, hr = L.hair, hs = L.hs || 'short', acc = L.acc || [], P = [], M = E.mtx;
    P.push({ g: G.sph, m: M(0, 0, 0, 0, 0, 0, .15, .175, .155), c: sk });
    P.push({ g: G.sph, m: M(-.145, -.01, 0, 0, 0, 0, .03, .045, .03), c: shade(sk, -.08) }, { g: G.sph, m: M(.145, -.01, 0, 0, 0, 0, .03, .045, .03), c: shade(sk, -.08) });
    P.push({ g: G.sph, m: M(-.052, .02, .135, 0, 0, 0, .026, .03, .015), c: '#ffffff' }, { g: G.sph, m: M(.052, .02, .135, 0, 0, 0, .026, .03, .015), c: '#ffffff' });
    P.push({ g: G.sph, m: M(-.052, .02, .148, 0, 0, 0, .014, .017, .008), c: '#1d1d1d' }, { g: G.sph, m: M(.052, .02, .148, 0, 0, 0, .014, .017, .008), c: '#1d1d1d' });
    P.push({ g: G.sph, m: M(-.05, .07, .142, 0, 0, .1, .035, .009, .01), c: shade(hr, -.2) }, { g: G.sph, m: M(.05, .07, .142, 0, 0, -.1, .035, .009, .01), c: shade(hr, -.2) });
    P.push({ g: G.cone, m: M(0, -.025, .16, Math.PI / 2 - .3, 0, 0, .022, .05, .022), c: shade(sk, -.1) });
    P.push({ g: G.box, m: M(0, -.085, .138, 0, 0, 0, .06, .012, .01), c: '#7a2a2a' });
    const cap = (s, y, c) => P.push({ g: G.sph, m: M(0, y || .03, -.01, -.15, 0, 0, s * .162, s * .15, s * .165), c: c || hr });
    if (hs === 'short') { cap(1.02, .045); }
    if (hs === 'long') { cap(1.04, .04); P.push({ g: G.box, m: M(0, -.1, -.07, .08, 0, 0, .3, .32, .12), c: hr }); }
    if (hs === 'bun') { cap(1.02, .045); P.push({ g: G.sph, m: M(0, .17, -.07, 0, 0, 0, .07, .065, .07), c: hr }); }
    if (hs === 'pony') { cap(1.03, .045); P.push({ g: G.cyl, m: M(0, -.05, -.17, .5, 0, 0, .035, .26, .035), c: hr }); }
    if (hs === 'curly') { for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; P.push({ g: G.sphLo, m: M(Math.cos(a) * .12, .09 + Math.sin(i * 2.1) * .03, Math.sin(a) * .1 - .03, 0, a, 0, .075), c: hr }); } P.push({ g: G.sphLo, m: M(0, .15, -.02, 0, 0, 0, .09), c: hr }); }
    if (hs === 'cap') { cap(1.04, .05, '#1f2937'); P.push({ g: G.box, m: M(0, .06, .15, -.1, 0, 0, .22, .02, .12), c: '#111827' }); }
    if (hs === 'bald') { P.push({ g: G.sph, m: M(0, .02, -.02, 0, 0, 0, .152, .17, .152), c: shade(sk, .04) }); }
    if (acc.includes('beard')) P.push({ g: G.sph, m: M(0, -.085, .07, .2, 0, 0, .12, .085, .09), c: shade(hr, -.2) });
    if (acc.includes('glasses')) { P.push({ g: G.torus, m: M(-.052, .02, .152, 0, 0, 0, .036, .036, .036), c: '#222222' }, { g: G.torus, m: M(.052, .02, .152, 0, 0, 0, .036, .036, .036), c: '#222222' }, { g: G.box, m: M(0, .022, .153, 0, 0, 0, .03, .008, .008), c: '#222222' }); }
    if (acc.includes('ring')) { P.push({ g: G.sph, m: M(-.15, -.06, 0, 0, 0, 0, .012), c: '#ffd24a' }, { g: G.sph, m: M(.15, -.06, 0, 0, 0, 0, .012), c: '#ffd24a' }); }
    if (acc.includes('hat')) { P.push({ g: G.cyl, m: M(0, .13, 0, 0, 0, 0, .27, .02, .27), c: '#c8a464' }, { g: G.cyl, m: M(0, .19, 0, 0, 0, 0, .14, .1, .14), c: '#b8945a' }); }
    const g = E.merge(P); g.userData.shared = true; figCache.set(key, g); return g;
  }
  function bodyGeo(L) {
    const key = 'b' + [L.skin, L.top, L.pants, L.build].join('|'); if (figCache.has(key)) return figCache.get(key);
    const b = L.build || 1, M = E.mtx, top = L.top, pants = L.pants || '#3d4a3a', P = [];
    P.push({ g: G.cyl, m: M(0, .3, 0, 0, 0, 0, .2 * b, .52, .14 * b), c: top });
    P.push({ g: G.sph, m: M(0, .56, 0, 0, 0, 0, .21 * b, .08, .145 * b), c: top });
    P.push({ g: G.cyl, m: M(0, .02, 0, 0, 0, 0, .19 * b, .14, .135 * b), c: pants });
    P.push({ g: G.cyl, m: M(0, .64, 0, 0, 0, 0, .05, .1, .05), c: shade(L.skin, -.08) });
    P.push({ g: G.box, m: M(0, .52, .12 * b, -.2, 0, 0, .1, .1, .02), c: shade(top, -.25) });
    const g = E.merge(P); g.userData.shared = true; figCache.set(key, g); return g;
  }
  function limbGeo(kind, L) {
    const key = kind + [L.skin, L.top, L.pants, L.build].join('|'); if (figCache.has(key)) return figCache.get(key);
    const M = E.mtx, b = L.build || 1, P = [];
    if (kind === 'arm') { P.push({ g: G.cyl, m: M(0, -.12, 0, 0, 0, 0, .055 * b, .26, .055 * b), c: L.top }, { g: G.cyl, m: M(0, -.38, 0, 0, 0, 0, .045 * b, .28, .045 * b), c: L.skin }, { g: G.sph, m: M(0, -.55, 0, 0, 0, 0, .05, .06, .04), c: L.skin }); }
    else { P.push({ g: G.cyl, m: M(0, -.4, 0, 0, 0, 0, .075 * b, .82, .075 * b), c: L.pants || '#3d4a3a' }, { g: G.box, m: M(0, -.84, .04, 0, 0, 0, .1, .07, .22), c: '#3a2a1c' }); }
    const g = E.merge(P); g.userData.shared = true; figCache.set(key, g); return g;
  }
  const carryGeo = {};
  function carryMesh(kind) {
    if (!carryGeo[kind]) {
      const M = E.mtx; let P;
      if (kind === 'wood') P = [{ g: G.cylLo, m: M(0, 0, 0, 0, 0, Math.PI / 2, .07, .7, .07), c: '#7a4e2a' }, { g: G.cylLo, m: M(0, .1, .03, 0, .3, Math.PI / 2, .06, .6, .06), c: '#8a5a32' }];
      else if (kind === 'bucket' || kind === 'bucketFull') { P = [{ g: G.cyl, m: M(0, 0, 0, 0, 0, 0, .14, .22, .14), c: '#8a8f96' }, { g: G.torus, m: M(0, .14, 0, 0, 0, 0, .13, .13, .13), c: '#5d6168' }]; if (kind === 'bucketFull') P.push({ g: G.cyl, m: M(0, .1, 0, 0, 0, 0, .12, .02, .12), c: '#4aa3d8' }); }
      else if (kind === 'food') P = [{ g: G.cyl, m: M(0, 0, 0, 0, 0, 0, .14, .06, .14), c: '#d8d0c0' }, { g: G.sph, m: M(0, .04, 0, 0, 0, 0, .11, .05, .11), c: '#f2e6c4' }];
      else if (kind === 'torch') P = [{ g: G.cylLo, m: M(0, 0, 0, 0, 0, 0, .03, .5, .03), c: '#6a4426' }, { g: G.sph, m: M(0, .28, 0, 0, 0, 0, .06), c: '#ffb43a' }];
      else P = [{ g: G.box, m: M(0, 0, 0, 0, 0, 0, .2, .15, .2), c: '#c8a464' }];
      carryGeo[kind] = E.merge(P); carryGeo[kind].userData.shared = true;
    }
    const me = new THREE.Mesh(carryGeo[kind], E.vcMat); return me;
  }
  E.Figure = function (look, opts) {
    opts = opts || {}; const L = Object.assign({ skin: '#e8b98f', hair: '#3b2a1c', hs: 'short', top: '#2a9d8f', pants: '#3d4a3a', acc: [], build: 1, h: 1 }, look);
    const g = new THREE.Group(), hips = new THREE.Group(), torso = new THREE.Mesh(bodyGeo(L), E.vcMat), head = new THREE.Mesh(headGeo(L), E.vcMat);
    hips.position.y = .92; g.add(hips); torso.position.y = .02; hips.add(torso);
    const neck = new THREE.Group(); neck.position.y = .74; torso.add(neck); head.position.y = .1; neck.add(head);
    const mk = (kind, x, y, parent) => { const p = new THREE.Group(); p.position.set(x, y, 0); p.add(new THREE.Mesh(limbGeo(kind, L), E.vcMat)); parent.add(p); return p; };
    const armL = mk('arm', -.25 * L.build, .6, torso), armR = mk('arm', .25 * L.build, .6, torso), legL = mk('leg', -.1, 0, hips), legR = mk('leg', .1, 0, hips);
    g.scale.setScalar(L.h || 1);
    let blob = null; if (opts.blob !== false) { blob = new THREE.Mesh(G.circle, E.blobMat()); blob.rotation.x = -Math.PI / 2; blob.position.y = .02; blob.scale.set(.42, .42, 1); blob.renderOrder = -1; g.add(blob); }
    const meshes = [torso, head, armL.children[0], armR.children[0], legL.children[0], legR.children[0]];
    const F = { group: g, look: L, hips, torso, head, neck, armL, armR, legL, legR, blob, pose: 'idle', ph: Math.random() * 6, held: null, heldKind: null, emote: 0 };
    F.setShadows = on => meshes.forEach(m => { m.castShadow = on; }) ;
    F.hold = kind => { if (F.heldKind === kind) return; if (F.held) { F.held.parent.remove(F.held); F.held = null; } F.heldKind = kind || null; if (!kind) return; F.held = carryMesh(kind); if (kind === 'wood') { F.held.position.set(.25, -.25, .25); torso.add(F.held); } else { F.held.position.set(0, -.62, 0); armR.add(F.held); } };
    // Pose-Animation; speed = Bodengeschwindigkeit in m/s
    F.anim = (dt, pose, speed) => {
      pose = pose || 'idle'; F.pose = pose; const sp = speed || 0; F.ph += dt * (pose === 'run' ? 11 : pose === 'walk' ? Math.max(4, sp * 3.2) : 2.2);
      const s = Math.sin(F.ph), c = Math.cos(F.ph); let aL = 0, aR = 0, lL = 0, lR = 0, hy = .92, tx = 0, tz = 0, hz = 0, hx = 0, gz = 0, azL = 0, azR = 0, lie = 0;
      if (pose === 'walk' || pose === 'run' || pose === 'carry') { const k = pose === 'run' ? .9 : .55; lL = s * k; lR = -s * k; aL = -s * k * .9; aR = s * k * .9; hy = .92 + Math.abs(c) * (pose === 'run' ? .05 : .025); tx = pose === 'run' ? .18 : .04; if (pose === 'carry' || F.heldKind === 'wood') { aL = aR = -1.1; } else if (F.heldKind) aR = -.3; }
      else if (pose === 'sit') { lL = lR = -1.45; hy = .5; aL = aR = -.25; tx = -.05; hx = Math.sin(F.ph * .5) * .05; }
      else if (pose === 'sleep') { lie = 1; }
      else if (pose === 'work') { aR = -1.4 + Math.sin(F.ph * 3) * .7; aL = -1 + Math.cos(F.ph * 3) * .5; tx = .45; hy = .82; lL = .3; lR = -.2; }
      else if (pose === 'crouch') { lL = lR = -.9; hy = .62; tx = .4; aL = aR = -.6; }
      else if (pose === 'talk') { aR = -.4 + Math.sin(F.ph * 2.2) * .35; azR = .2; hz = Math.sin(F.ph * 1.3) * .08; hx = Math.sin(F.ph * 2) * .05; }
      else if (pose === 'argue') { aR = -1.2 + Math.sin(F.ph * 5) * .6; aL = -1.0 + Math.cos(F.ph * 4) * .5; azL = -.3; azR = .3; tx = .12 + Math.sin(F.ph * 3) * .05; hx = Math.sin(F.ph * 6) * .08; }
      else if (pose === 'cheer') { aL = aR = -2.8 + Math.sin(F.ph * 6) * .3; azL = -.3; azR = .3; hy = .92 + Math.abs(Math.sin(F.ph * 3)) * .12; }
      else if (pose === 'sad') { tx = .25; hx = .35; aL = aR = .1; }
      else if (pose === 'swim') { lie = 2; }
      else if (pose === 'scared') { aL = aR = -2.2; azL = .5; azR = -.5; tx = -.12; hy = .9 + Math.sin(F.ph * 20) * .01; }
      else { aL = Math.sin(F.ph) * .04; aR = -aL; tx = Math.sin(F.ph * .5) * .02; if (F.heldKind === 'wood') aL = aR = -1.1; else if (F.heldKind) aR = -.15; }
      const k = Math.min(1, dt * 12), L2 = (o, p, v) => { o[p] = lerp(o[p], v, k); };
      L2(armL.rotation, 'x', aL); L2(armR.rotation, 'x', aR); L2(armL.rotation, 'z', azL - .08); L2(armR.rotation, 'z', azR + .08); L2(legL.rotation, 'x', lL); L2(legR.rotation, 'x', lR);
      L2(hips.position, 'y', hy); L2(torso.rotation, 'x', tx); L2(torso.rotation, 'z', tz); L2(neck.rotation, 'z', hz); L2(neck.rotation, 'x', hx);
      const lieT = lie === 1 ? -Math.PI / 2 : lie === 2 ? Math.PI / 2 - .2 : 0; L2(hips.rotation, 'x', lieT); L2(hips.position, 'z', lie === 1 ? .0 : 0); if (lie === 1) { L2(hips.position, 'y', .35); legL.rotation.x = lerp(legL.rotation.x, 0, k); legR.rotation.x = lerp(legR.rotation.x, 0, k); }
      if (lie === 2) { const sw = Math.sin(F.ph * 2.5); legL.rotation.x = sw * .5; legR.rotation.x = -sw * .5; armL.rotation.x = -2.6 + Math.sin(F.ph * 2.5) * 1.2; armR.rotation.x = -2.6 - Math.sin(F.ph * 2.5) * 1.2; }
      if (blob) blob.visible = lie !== 2;
    };
    F.lookAt = (yaw) => { g.rotation.y = yaw; };
    return F;
  };
  E.HOST_LOOKS = [{ skin: '#f0c9a8', hair: '#ff8a3d', hs: 'long', top: '#ff5fa2', pants: '#2b2d42', acc: ['ring'] }, { skin: '#d9a47a', hair: '#1b1b1b', hs: 'short', top: '#37d6a0', pants: '#2b2d42', acc: ['glasses', 'beard'], build: 1.08 }];

  // kleine Helfer
  E.rand = s => { let x = s >>> 0 || 1; return () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return ((x >>> 0) % 100000) / 100000; }; };
  E.clamp = clamp; E.lerp = lerp;
  E.angLerp = (a, b, t) => { let d = ((b - a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI; return a + d * t; };
  // Zahl über Wert-Rauschen (für Gelände/Wind)
  E.noise2 = (x, z) => { const h = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); }; const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi, u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf); return lerp(lerp(h(xi, zi), h(xi + 1, zi), u), lerp(h(xi, zi + 1), h(xi + 1, zi + 1), u), v); };
  root.UE = E;
})(window);
