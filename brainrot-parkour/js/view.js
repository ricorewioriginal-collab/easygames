/* Brainrot Parkour – 3D-Darstellung: Welten (Cucina Cosmica, Spiaggia Assurda, Galassia Gelato), abgerundete glänzende Plattformen
 * (statische zu wenigen Meshes zusammengefasst), animierte Soße/Wasser/Schoko, Drehbalken, Münzen, Fahnen, Kulisse, Figuren mit
 * Namensschild, Partikel, Kamera hinter der Figur und Menü-Bühne. */
(function () {
  'use strict';
  const T = THREE, PI = Math.PI;
  let R, scene, cam, sun, hemi, W = 1, H = 1, envT = {}, theme = null, worldGroup = null, propGroup = null, menuGroup = null, time = 0;
  const actors = [], parts = [];
  const lin = c => new T.Color(c).convertSRGBToLinear();
  const THEMES = {
    cucina: { sky: ['#ff9a5a', '#ffe2b8', '#ffcf9a'], fog: '#ffd6a8', pal: ['#ff6a3a', '#e8333f', '#ffb81a', '#5ab83c', '#f4ece0', '#c8763a', '#3a9adf'], top: 'check', kill: 'sauce', sun: '#fff2dc', exp: .95 },
    spiaggia: { sky: ['#3aa8ff', '#bfe9ff', '#fff2cf'], fog: '#cfefff', pal: ['#f2c27a', '#ff5a4a', '#1ac0b0', '#ffffff', '#ffc21a', '#ff6aa8', '#3a8aff'], top: 'stripe', kill: 'water', sun: '#ffffff', exp: 1 },
    galassia: { sky: ['#0e0628', '#3a1670', '#c84a9a'], fog: '#2a1250', pal: ['#9ad04a', '#ff6a9a', '#6a8aff', '#fff0c8', '#b06aff', '#3ad0c0', '#ffb84a'], top: 'dots', kill: 'choco', sun: '#e8dcff', exp: 1.15, stars: true },
    menu: { sky: ['#6a3aff', '#ff7ab8', '#ffc86a'], fog: '#ff9ac0', pal: ['#ffffff'], top: 'check', kill: 'sauce', sun: '#ffffff', exp: 1.05 },
  };
  /* ---------- Texturen ---------- */
  const TC = {};
  function ctex(key, w, h, draw, srgb) { if (TC[key]) return TC[key]; const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new T.CanvasTexture(c); if (srgb !== false) t.encoding = T.sRGBEncoding; t.wrapS = t.wrapT = T.RepeatWrapping; t.anisotropy = 4; return TC[key] = t; }
  const topTex = kind => ctex('top' + kind, 128, 128, (x, w, h) => {
    x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h);
    if (kind === 'check') { x.fillStyle = '#d8d0c8'; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) if ((i + j) % 2) x.fillRect(i * 32, j * 32, 32, 32); x.strokeStyle = 'rgba(0,0,0,.06)'; for (let i = 0; i < w; i += 4) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); } }
    if (kind === 'stripe') { x.fillStyle = '#e2dcd2'; for (let i = 0; i < 4; i++) x.fillRect(0, i * 32, w, 16); }
    if (kind === 'dots') { x.fillStyle = '#e8e0ff'; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { x.beginPath(); x.arc(16 + i * 32 + (j % 2) * 16, 16 + j * 32, 7, 0, 7); x.fill(); } }
  });
  const sideTex = () => ctex('side', 64, 128, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#b8b0a8'); x.fillStyle = g; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(0,0,0,.05)'; for (let i = 0; i < h; i += 16) x.fillRect(0, i, w, 2); });
  function killTex(kind) {
    return ctex('kill' + kind, 256, 256, (x, w, h) => {
      const base = { sauce: ['#c8200e', '#ff5a2a', '#8a0e06'], water: ['#28c8d8', '#bff8ff', '#1890b0'], choco: ['#5a2a14', '#a8643a', '#2a1006'] }[kind];
      x.fillStyle = base[0]; x.fillRect(0, 0, w, h); let s = 9; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
      for (let i = 0; i < 90; i++) { const cx = r() * w, cy = r() * h, rr = 6 + r() * 22, g = x.createRadialGradient(cx, cy, 0, cx, cy, rr); g.addColorStop(0, base[1]); g.addColorStop(1, 'rgba(0,0,0,0)'); x.globalAlpha = .45; x.fillStyle = g; x.beginPath(); x.arc(cx, cy, rr, 0, 7); x.fill(); }
      x.globalAlpha = 1; x.strokeStyle = base[2]; x.lineWidth = 2; for (let i = 0; i < 30; i++) { x.beginPath(); x.arc(r() * w, r() * h, 3 + r() * 6, 0, 7); x.stroke(); }
      if (kind === 'water') { x.fillStyle = 'rgba(255,255,255,.8)'; for (let i = 0; i < 120; i++) { x.beginPath(); x.arc(r() * w, r() * h, 1 + r() * 2, 0, 7); x.fill(); } }
    });
  }
  /* ---------- Abgerundete Quader (zusammenführbar) ---------- */
  const RB = {};
  function rbox(w, h, d) {
    const r = Math.min(.16, w / 4, d / 4, h / 3), key = [w, h, d].map(v => v.toFixed(2)).join('x'); if (RB[key]) return RB[key];
    const s = new T.Shape(), x0 = -w / 2 + r, z0 = -d / 2 + r, x1 = w / 2 - r, z1 = d / 2 - r, q = r * .2; // Grundriss mit runden Ecken
    s.moveTo(x0 - q, -d / 2 + q); s.lineTo(x1 + q, -d / 2 + q); s.quadraticCurveTo(w / 2 - q, -d / 2 + q, w / 2 - q, z0 - q); s.lineTo(w / 2 - q, z1 + q); s.quadraticCurveTo(w / 2 - q, d / 2 - q, x1 + q, d / 2 - q); s.lineTo(x0 - q, d / 2 - q); s.quadraticCurveTo(-w / 2 + q, d / 2 - q, -w / 2 + q, z1 + q); s.lineTo(-w / 2 + q, z0 - q); s.quadraticCurveTo(-w / 2 + q, -d / 2 + q, x0 - q, -d / 2 + q);
    const b = Math.min(r * .8, h / 3), g = new T.ExtrudeGeometry(s, { depth: Math.max(.01, h - 2 * b), bevelEnabled: true, bevelThickness: b, bevelSize: b * .85, bevelSegments: 3, curveSegments: 3 });
    g.rotateX(-PI / 2); g.translate(0, -h / 2 + b, 0); // Extrusion zeigt nach oben
    // UV in Welt-Einheiten (Muster gleich groß, egal wie groß der Block ist)
    const p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv; for (let i = 0; i < p.count; i++) { const ny = n.getY(i); if (Math.abs(ny) > .5) uv.setXY(i, p.getX(i) * .5, p.getZ(i) * .5); else uv.setXY(i, (p.getX(i) + p.getZ(i)) * .5, p.getY(i) * .5 + .5); }
    return RB[key] = g;
  }
  function merge(list) { // [{g, x, y, z, col}] → eine Geometrie mit Farben
    let n = 0; for (const it of list) n += it.g.attributes.position.count;
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2), col = new Float32Array(n * 3); let o = 0;
    for (const it of list) { const g = it.g, p = g.attributes.position.array, nn = g.attributes.normal.array, u = g.attributes.uv.array, c = it.col, k = g.attributes.position.count;
      for (let i = 0; i < k; i++) { pos[(o + i) * 3] = p[i * 3] + it.x; pos[(o + i) * 3 + 1] = p[i * 3 + 1] + it.y; pos[(o + i) * 3 + 2] = p[i * 3 + 2] + it.z; nor.set(nn.subarray(i * 3, i * 3 + 3), (o + i) * 3); uv[(o + i) * 2] = u[i * 2] + it.x * .5; uv[(o + i) * 2 + 1] = u[i * 2 + 1] + (Math.abs(nn[i * 3 + 1]) > .5 ? it.z * .5 : 0); col[(o + i) * 3] = c.r; col[(o + i) * 3 + 1] = c.g; col[(o + i) * 3 + 2] = c.b; }
      o += k; }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setAttribute('normal', new T.BufferAttribute(nor, 3)); g.setAttribute('uv', new T.BufferAttribute(uv, 2)); g.setAttribute('color', new T.BufferAttribute(col, 3)); g.computeBoundingSphere(); return g;
  }
  /* ---------- Grundgerüst ---------- */
  function init(canvas) {
    R = BREnv.renderer(canvas, { maxDpr: matchMedia('(pointer: coarse)').matches ? 1.5 : 1.75 }); scene = new T.Scene();
    cam = new T.PerspectiveCamera(60, 1, .1, 400);
    hemi = new T.HemisphereLight(0xffffff, 0x8a6a5a, .35); scene.add(hemi);
    sun = new T.DirectionalLight(0xffffff, 1.5); sun.castShadow = true; const big = !matchMedia('(pointer: coarse)').matches; sun.shadow.mapSize.set(big ? 2048 : 1024, big ? 2048 : 1024); Object.assign(sun.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 1, far: 90 }); sun.shadow.bias = -.0006; sun.shadow.normalBias = .03; scene.add(sun, sun.target);
    setTheme('menu');
  }
  function skyTex(th) { return ctex('sky' + th.sky.join(), 8, 512, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, th.sky[0]); g.addColorStop(.55, th.sky[1]); g.addColorStop(1, th.sky[2]); x.fillStyle = g; x.fillRect(0, 0, w, h); }); }
  let sky = null, stars = null;
  function setTheme(id) {
    const th = THEMES[id] || THEMES.cucina; theme = Object.assign({ id }, th);
    if (!envT[id]) envT[id] = BREnv.env(R, { top: th.sky[0], mid: th.sky[1], bot: th.sky[2] }); scene.environment = envT[id];
    if (!sky) { sky = new T.Mesh(new T.SphereGeometry(300, 32, 16), new T.MeshBasicMaterial({ side: T.BackSide, fog: false, depthWrite: false })); scene.add(sky); }
    sky.material.map = skyTex(th); sky.material.needsUpdate = true;
    scene.fog = new T.Fog(lin(th.fog), 90, 420); R.toneMappingExposure = th.exp;
    sun.color.set(th.sun); hemi.color.set(th.sky[1]); hemi.groundColor.set(th.sky[2]);
    if (th.stars && !stars) { const g = new T.BufferGeometry(), n = 900, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const u = Math.random() * 2 - 1, t = Math.random() * PI * 2, rr = 280; a[i * 3] = Math.sqrt(1 - u * u) * Math.cos(t) * rr; a[i * 3 + 1] = Math.abs(u) * rr; a[i * 3 + 2] = Math.sqrt(1 - u * u) * Math.sin(t) * rr; } g.setAttribute('position', new T.BufferAttribute(a, 3)); stars = new T.Points(g, new T.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, fog: false })); scene.add(stars); }
    if (stars) stars.visible = !!th.stars;
  }
  function resize(w, h) { W = w; H = h; R.setSize(w, h, false); cam.aspect = w / h; cam.fov = w < h ? 72 : 60; cam.updateProjectionMatrix(); }

  /* ---------- Welt aufbauen ---------- */
  let dynMeshes = new Map(), coinMeshes = new Map(), killMats = [], flags = new Map(), spinMeshes = [], npcs = [];
  function clearWorld() { sauceM = null; built = 0; if (worldGroup) { scene.remove(worldGroup); worldGroup.traverse(o => { if (o.geometry && !Object.values(RB).includes(o.geometry)) o.geometry.dispose(); }); } if (propGroup) { scene.remove(propGroup); } worldGroup = propGroup = null; dynMeshes = new Map(); coinMeshes = new Map(); killMats = []; flags = new Map(); spinMeshes = []; npcs = []; }
  const TINT = { cp: '#5ae07a', start: '#ffffff', goal: '#ffd23a', mover: '#4ab0ff', pole: '#c8ccd3', pillar: null, alt: null };
  function buildWorld(Wd, themeId) {
    clearWorld(); setTheme(themeId); arches.length = 0; const th = theme; worldGroup = new T.Group(); scene.add(worldGroup);
    const topM = new T.MeshStandardMaterial({ map: topTex(th.top), vertexColors: true, roughness: .38, metalness: 0, envMapIntensity: .55 });
    const statics = [];
    built = 0; topMat = topM; addObjs(Wd, statics);
    if (statics.length) { const g = merge(statics); const m = new T.Mesh(g, topM); m.castShadow = m.receiveShadow = true; worldGroup.add(m); }
    npcSetup(Wd, themeId); props(themeId, Wd);
  }
  let built = 0, topMat = null, sauceM = null;
  function addObjs(Wd, statics) {
    const th = theme, colFor = o => lin(o.tint && TINT[o.tint] ? TINT[o.tint] : o.kind === 'ice' ? '#bfeaff' : o.kind === 'bounce' ? '#ff4a7a' : o.kind === 'fall' ? '#c8a07a' : o.kind === 'conv' ? '#3a3a44' : th.pal[(Math.abs(Math.round(o.x * 3 + o.z * 7)) + (o.seg || '').length) % th.pal.length]);
    for (let oi = built; oi < Wd.objs.length; oi++) { const o = Wd.objs[oi];
      if (o.kind === 'solid' && !o.move && statics) statics.push({ g: rbox(o.w, o.h, o.d), x: o.x, y: o.y, z: o.z, col: colFor(o) });
      else if (['solid', 'fall', 'ice', 'bounce', 'conv', 'tile'].includes(o.kind)) {
        const m = new T.Mesh(rbox(o.w, o.h, o.d), o.kind === 'ice' ? new T.MeshPhysicalMaterial({ color: lin('#cfefff'), roughness: .05, transmission: 0, transparent: true, opacity: .85, clearcoat: 1 }) : o.kind === 'conv' ? new T.MeshStandardMaterial({ map: convTex(), roughness: .6, color: lin('#ffffff') }) : new T.MeshStandardMaterial({ map: topTex(th.top), roughness: .4, color: o.kind === 'tile' ? lin(th.pal[(o.gi + o.gj) % th.pal.length]) : colFor(o) }));
        m.position.set(o.x, o.y, o.z); m.castShadow = m.receiveShadow = true; worldGroup.add(m); dynMeshes.set(o.id, m);
        if (o.kind === 'bounce') { const pad = new T.Mesh(new T.CylinderGeometry(Math.min(o.w, o.d) * .38, Math.min(o.w, o.d) * .42, .18, 32), new T.MeshPhysicalMaterial({ color: lin('#ffe14a'), roughness: .2, clearcoat: 1 })); pad.position.y = o.h / 2 + .09; m.add(pad); m.userData.pad = pad; }
        if (o.kind === 'conv') { m.userData.conv = true; }
        if (o.kind === 'fall') { m.material.color = lin('#d8b088'); m.userData.fall = true; }
      }
      else if (o.kind === 'kill') { const km = new T.MeshStandardMaterial({ map: killTex(th.kill).clone(), roughness: th.kill === 'water' ? .08 : .25, metalness: 0, emissive: lin(th.kill === 'sauce' ? '#4a0800' : th.kill === 'water' ? '#05303a' : '#1a0800'), envMapIntensity: 1.2 }); km.map.needsUpdate = true; km.map.repeat.set(o.w / 8, o.d / 8); killMats.push(km); const m = new T.Mesh(new T.BoxGeometry(o.w, o.h, o.d), km); m.position.set(o.x, o.y, o.z); m.receiveShadow = true; worldGroup.add(m); }
      else if (o.kind === 'spin') { const g = new T.Group(); g.position.set(o.x, o.y + .5, o.z); const beam = new T.Mesh(new T.CylinderGeometry(o.r, o.r, o.len * 2, 16), new T.MeshPhysicalMaterial({ map: stripeTex(), roughness: .25, clearcoat: 1 })); beam.rotation.z = PI / 2; beam.castShadow = true; g.add(beam); for (const s of [-1, 1]) { const cap = new T.Mesh(new T.SphereGeometry(o.r * 1.15, 16, 12), new T.MeshPhysicalMaterial({ color: lin('#ff3a3a'), roughness: .2, clearcoat: 1 })); cap.position.x = s * o.len; g.add(cap); } worldGroup.add(g); spinMeshes.push({ o, g }); }
      else if (o.kind === 'coin') { const m = coinMesh(); m.position.set(o.x, o.y, o.z); worldGroup.add(m); coinMeshes.set(o.id, m); }
      else if (o.kind === 'check') { const f = flag(); f.position.set(o.x + Math.min(o.w, o.d) * .38, o.y - 1, o.z); worldGroup.add(f); flags.set(o.n, f); }
      else if (o.kind === 'goal') { const a = arch(o); worldGroup.add(a); }
      else if (o.kind === 'solid' && !o.move) { const m = new T.Mesh(rbox(o.w, o.h, o.d), new T.MeshStandardMaterial({ map: topTex(th.top), roughness: .38, envMapIntensity: .55, color: colFor(o) })); m.position.set(o.x, o.y, o.z); m.castShadow = m.receiveShadow = true; worldGroup.add(m); }
    }
    built = Wd.objs.length;
  }
  function appendObjs(Wd) { addObjs(Wd, null); }
  // Torre Infinita: steigende Soße
  function sauce(y, x, z) { if (!sauceM) { sauceM = new T.Mesh(new T.PlaneGeometry(220, 220), new T.MeshStandardMaterial({ map: (() => { const t = killTex(theme.kill).clone(); t.needsUpdate = true; t.repeat.set(20, 20); return t; })(), roughness: .2, emissive: lin('#3a0800'), transparent: true, opacity: .96 })); sauceM.rotation.x = -PI / 2; killMats.push(sauceM.material); } if (!sauceM.parent && worldGroup) worldGroup.add(sauceM); sauceM.position.set(x || 0, y, z || 0); }
  function npcSetup(Wd, themeId) {
    // Brainrot-Figuren als Zuschauer an manchen Checkpoints
    const L = BRChars.LIST; if (Wd.mode !== 'obby') return; (Wd.cps || []).forEach((c, i) => { if (!c.n || i % 2) return; const ch = L[(i * 5 + (themeId.length)) % L.length], b = BRChars.build(ch.id); const side = 2.7; const ang = [0, PI / 2, PI, -PI / 2][c.hd || 0]; b.group.position.set(c.x + Math.cos(ang) * side, c.y, c.z - Math.sin(ang) * side); b.group.rotation.y = ang - PI / 2 + .4; b.group.traverse(o => { o.castShadow = false; }); worldGroup.add(b.group); npcs.push({ b, ch, cp: c.n, x: b.group.position.x, z: b.group.position.z, said: false }); });
  }
  function convTex() { return ctex('conv', 64, 64, (x, w, h) => { x.fillStyle = '#2a2a33'; x.fillRect(0, 0, w, h); x.fillStyle = '#ffd23a'; x.beginPath(); x.moveTo(16, 44); x.lineTo(32, 20); x.lineTo(48, 44); x.lineTo(40, 44); x.lineTo(32, 32); x.lineTo(24, 44); x.fill(); }); }
  function stripeTex() { return ctex('stripes', 128, 16, (x, w, h) => { for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#ffffff' : '#ff2a3a'; x.fillRect(i * 16, 0, 16, h); } }); }
  let coinGeo = null, coinMat = null;
  function coinMesh() {
    if (!coinGeo) { coinGeo = new T.CylinderGeometry(.42, .42, .1, 32); coinGeo.rotateX(PI / 2); const face = ctex('coinface', 128, 128, (x, w, h) => { const g = x.createRadialGradient(64, 54, 10, 64, 64, 64); g.addColorStop(0, '#fff2a0'); g.addColorStop(.7, '#ffc21a'); g.addColorStop(1, '#c88a00'); x.fillStyle = g; x.fillRect(0, 0, w, h); x.fillStyle = '#a86a00'; x.font = '700 64px Fredoka, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('B', 64, 68); }); coinMat = [new T.MeshStandardMaterial({ color: lin('#ffb81a'), metalness: 1, roughness: .25 }), new T.MeshStandardMaterial({ map: face, metalness: .6, roughness: .3, emissive: lin('#3a2400') }), new T.MeshStandardMaterial({ map: face, metalness: .6, roughness: .3, emissive: lin('#3a2400') })]; }
    const m = new T.Mesh(coinGeo, coinMat); m.castShadow = true; return m;
  }
  function flag() {
    const g = new T.Group(), pole = new T.Mesh(new T.CylinderGeometry(.06, .07, 3, 12), new T.MeshStandardMaterial({ color: lin('#e8e8ee'), metalness: 1, roughness: .2 })); pole.position.y = 1.5; g.add(pole);
    const knob = new T.Mesh(new T.SphereGeometry(.13, 16, 12), new T.MeshPhysicalMaterial({ color: lin('#ffd23a'), clearcoat: 1, roughness: .2 })); knob.position.y = 3.05; g.add(knob);
    const cloth = new T.Mesh(new T.PlaneGeometry(1.3, .8, 12, 4), new T.MeshStandardMaterial({ color: lin('#c8c8d0'), side: T.DoubleSide, roughness: .7 })); cloth.position.set(.68, 2.5, 0); g.add(cloth); g.userData.cloth = cloth; g.userData.base = cloth.geometry.attributes.position.array.slice(); pole.castShadow = true; return g;
  }
  function arch(o) {
    const g = new T.Group(); g.position.set(o.x, o.y - 1.2, o.z); const mat = new T.MeshPhysicalMaterial({ color: lin('#ffd23a'), metalness: .6, roughness: .2, clearcoat: 1 });
    const ar = new T.Mesh(new T.TorusGeometry(3, .32, 16, 48, PI), mat); ar.rotation.y = o.w > o.d ? 0 : PI / 2; ar.castShadow = true; g.add(ar);
    const cup = new T.Group(); cup.position.y = 4.3; const bowl = new T.Mesh(new T.LatheGeometry([[0, 0], [.5, .1], [.75, .8], [.8, 1.1], [0, 1.0]].map(p => new T.Vector2(p[0], p[1])), 32), mat); cup.add(bowl); const stem = new T.Mesh(new T.CylinderGeometry(.12, .4, .7, 20), mat); stem.position.y = -.3; cup.add(stem); g.add(cup); g.userData.cup = cup; arches.push(g);
    return g;
  }
  const arches = [];
  // Kulisse je Welt (weit weg, ohne Schatten)
  function props(id, Wd) {
    propGroup = new T.Group(); scene.add(propGroup); let s = 3; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    let cx = 0, cz = 0, n = 0; for (const c of Wd.cps || []) { cx += c.x; cz += c.z; n++; } cx /= n || 1; cz /= n || 1; const spread = Math.max(40, ...(Wd.cps || []).map(c => Math.hypot(c.x - cx, c.z - cz)));
    const gm = (c, o) => new T.MeshPhysicalMaterial(Object.assign({ color: lin(c), roughness: .3, clearcoat: .8 }, o || {}));
    for (let i = 0; i < 40 && propGroup.children.length < 16; i++) {
      const a = r() * PI * 2, d = spread * .6 + 30 + r() * 50, g = new T.Group(); g.position.set(cx + Math.cos(a) * d, -10 + r() * 30, cz + Math.sin(a) * d);
      // nie zu nah an der Strecke (sonst verdeckt die Kulisse die Sicht)
      const pts = (Wd.route || []).concat(Wd.cps || []); if (pts.some(p => Math.hypot(p.x - g.position.x, p.z - g.position.z) < 34)) continue; const k = r(), sc = 5 + r() * 7; g.scale.setScalar(sc); g.rotation.set(r() * .6, r() * 6, r() * .6);
      if (id === 'cucina') {
        if (k < .3) { const m = new T.Mesh(new T.CylinderGeometry(1, 1, .12, 3), gm('#f2c25a')); m.rotation.x = PI / 2; g.add(m); const c = new T.Mesh(new T.CylinderGeometry(.18, .18, .14, 16), gm('#b8301a')); c.position.set(.2, 0, .1); c.rotation.x = PI / 2; g.add(c); }
        else if (k < .55) { const t = new T.Mesh(new T.SphereGeometry(1, 24, 16), gm('#e0301a', { roughness: .15 })); g.add(t); const l = new T.Mesh(new T.ConeGeometry(.3, .3, 5), gm('#3a8a2a')); l.position.y = 1; g.add(l); }
        else if (k < .8) { const c = new T.Mesh(new T.CylinderGeometry(1, .7, 1.2, 32, 1, true), gm('#ffffff', { side: T.DoubleSide })); g.add(c); const e = new T.Mesh(new T.CircleGeometry(.95, 32), gm('#5a2a10')); e.rotation.x = -PI / 2; e.position.y = .45; g.add(e); const h = new T.Mesh(new T.TorusGeometry(.35, .1, 8, 16), gm('#ffffff')); h.position.x = 1.1; g.add(h); }
        else { const f = new T.Mesh(new T.BoxGeometry(.2, 3, .1), new T.MeshStandardMaterial({ color: lin('#d0d4da'), metalness: 1, roughness: .2 })); g.add(f); for (let p = 0; p < 4; p++) { const t = new T.Mesh(new T.BoxGeometry(.06, 1, .06), f.material); t.position.set(-.15 + p * .1, 2, 0); g.add(t); } }
      } else if (id === 'spiaggia') {
        if (k < .4) { const tr = new T.Mesh(new T.CylinderGeometry(.15, .25, 4, 10), gm('#a8743a', { roughness: .8 })); tr.position.y = 2; tr.rotation.z = .15; g.add(tr); for (let p = 0; p < 6; p++) { const l = new T.Mesh(new T.SphereGeometry(1, 12, 8), gm('#3aa83a')); l.scale.set(1.6, .12, .45); const aa = p / 6 * PI * 2; l.position.set(Math.cos(aa) * 1.2 + .3, 4, Math.sin(aa) * 1.2); l.rotation.y = -aa; l.rotation.z = -.4; g.add(l); } }
        else if (k < .7) { const b = new T.Mesh(new T.SphereGeometry(1, 32, 16), new T.MeshPhysicalMaterial({ map: ctex('ball', 256, 128, (x, w, h) => { const c = ['#ff3a3a', '#ffffff', '#3a8aff', '#ffffff', '#ffd23a', '#ffffff']; for (let i = 0; i < 6; i++) { x.fillStyle = c[i]; x.fillRect(i * w / 6, 0, w / 6 + 1, h); } }), roughness: .2, clearcoat: 1 })); g.add(b); }
        else { const u = new T.Mesh(new T.ConeGeometry(2, .7, 12, 1, true), new T.MeshStandardMaterial({ map: ctex('umbp', 256, 32, (x, w, h) => { for (let i = 0; i < 12; i++) { x.fillStyle = i % 2 ? '#ffffff' : '#ff5a8a'; x.fillRect(i * w / 12, 0, w / 12 + 1, h); } }), side: T.DoubleSide })); u.position.y = 3; g.add(u); const p = new T.Mesh(new T.CylinderGeometry(.06, .06, 3, 8), gm('#ffffff')); p.position.y = 1.5; g.add(p); }
      } else {
        if (k < .45) { const p = new T.Mesh(new T.SphereGeometry(1.6, 32, 20), gm(['#ff9ab0', '#9ab8ff', '#bfe08a', '#ffd27a'][i % 4], { roughness: .5 })); g.add(p); if (k < .2) { const ring = new T.Mesh(new T.TorusGeometry(2.6, .15, 8, 48), gm('#ffffff', { transparent: true, opacity: .7 })); ring.rotation.x = 1.2; g.add(ring); } }
        else { const cone = new T.Mesh(new T.ConeGeometry(.7, 2, 20), new T.MeshStandardMaterial({ map: ctex('cone', 64, 64, (x, w, h) => { x.fillStyle = '#d99a4a'; x.fillRect(0, 0, w, h); x.strokeStyle = '#a8662a'; x.lineWidth = 4; for (let i = -64; i < 128; i += 12) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 64, 64); x.stroke(); x.beginPath(); x.moveTo(i, 64); x.lineTo(i + 64, 0); x.stroke(); } }), roughness: .7 })); cone.rotation.x = PI; g.add(cone); const sc2 = new T.Mesh(new T.SphereGeometry(.8, 24, 16), gm(['#ff9ab0', '#bfe08a', '#fff3d6'][i % 3], { roughness: .6 })); sc2.position.y = 1.1; g.add(sc2); }
      }
      g.userData.spin = (r() - .5) * .3; propGroup.add(g);
    }
    // Boden ganz unten (Soße/Wasser/Schoko-Meer)
    const sea = new T.Mesh(new T.PlaneGeometry(900, 900), new T.MeshStandardMaterial({ map: (() => { const t = killTex(theme.kill).clone(); t.needsUpdate = true; t.repeat.set(60, 60); return t; })(), roughness: .2, emissive: lin(theme.kill === 'water' ? '#0a3a4a' : '#300a00') })); sea.rotation.x = -PI / 2; sea.position.set(cx, (Wd.killY || -10) - 2, cz); propGroup.add(sea); killMats.push(sea.material);
  }

  /* ---------- Jede Frame: bewegte Teile ---------- */
  function syncWorld(Wd, dt, local) {
    time += dt;
    for (const o of Wd.dyn) { const m = dynMeshes.get(o.id); if (!m) continue; m.position.set(o.x, o.y, o.z); if (o.kind === 'fall') { const w = o.trig > 0 && o.trig < .55 ? Math.sin(time * 60) * .04 : 0; m.position.x += w; m.visible = !o.gone; }
      if (o.kind === 'tile') { m.visible = o.y > -8; const shake = o.state === 1 ? Math.sin(time * 50) * .05 : 0; m.position.x += shake; if (o.state === 1) m.material.emissive = lin('#5a1000'); } }
    for (const s of spinMeshes) s.g.rotation.y = -s.o.ang;
    for (const m of dynMeshes.values()) if (m.userData.conv) m.material.map.offset.y -= dt * .6;
    for (const km of killMats) { km.map.offset.x += dt * .02; km.map.offset.y += dt * .015; }
    if (local) for (const [id, m] of coinMeshes) { m.visible = !local.got.has(id); m.rotation.y += dt * 3; m.position.y += Math.sin(time * 3 + id) * .003; }
    for (const [n, f] of flags) { const c = f.userData.cloth, p = c.geometry.attributes.position, b = f.userData.base; for (let i = 0; i < p.count; i++) { const x = b[i * 3]; p.setZ(i, Math.sin(time * 6 + x * 4) * .08 * (x + .65)); } p.needsUpdate = true; if (local && local.cp >= n) c.material.color = lin('#3ae07a'); }
    for (const a of arches) a.userData.cup.rotation.y += dt;
    if (propGroup) propGroup.children.forEach(g => { if (g.userData.spin) g.rotation.y += g.userData.spin * dt; });
    for (const n of npcs) BRChars.animate(n.b.rig, time + n.cp, 0, false);
  }
  // Zuschauer-Figur in der Nähe? → einmal ihren Spruch sagen
  function npcNear(x, z) { for (const n of npcs) if (!n.said && Math.hypot(n.x - x, n.z - z) < 6) { n.said = true; return n.ch; } return null; }

  /* ---------- Figuren (Spieler, Computer, Mitspieler) ---------- */
  function tagSprite(text, color) { const c = document.createElement('canvas'); c.width = 256; c.height = 64; const x = c.getContext('2d'); x.font = '600 30px Fredoka, sans-serif'; const w = Math.min(250, x.measureText(text).width + 30); x.fillStyle = 'rgba(20,10,40,.7)'; x.beginPath(); x.roundRect ? x.roundRect(128 - w / 2, 8, w, 46, 23) : x.rect(128 - w / 2, 8, w, 46); x.fill(); x.fillStyle = color || '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, 128, 32); const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; const s = new T.Sprite(new T.SpriteMaterial({ map: t, depthTest: false, transparent: true })); s.scale.set(2, .5, 1); s.renderOrder = 10; return s; }
  function addActor(charId, name, color, ghost) {
    const b = BRChars.build(charId), g = new T.Group(); g.add(b.group); scene.add(g);
    if (name) { const t = tagSprite(name, color); t.position.y = 2.3; g.add(t); }
    if (ghost) b.group.traverse(o => { if (o.isMesh) { o.castShadow = false; } });
    const sh = new T.Mesh(new T.CircleGeometry(.45, 24), new T.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .22, depthWrite: false })); sh.rotation.x = -PI / 2; sh.renderOrder = 1; scene.add(sh);
    const a = { g, b, sh, yaw: 0, sq: 1, t: Math.random() * 10, ghost }; actors.push(a); return a;
  }
  function removeActor(a) { scene.remove(a.g); scene.remove(a.sh); const i = actors.indexOf(a); if (i >= 0) actors.splice(i, 1); }
  function clearActors() { while (actors.length) removeActor(actors[0]); }
  // P: Physik-Zustand; Figur folgt mit Drehung, Squash beim Landen, Animation
  function syncActor(a, P, dt) {
    a.t += dt; a.g.visible = !(P.dead > 0) && !P.hidden; a.sh.visible = a.g.visible;
    a.g.position.set(P.x, P.y, P.z); let d = (P.yaw || 0) - a.yaw; while (d > PI) d -= 2 * PI; while (d < -PI) d += 2 * PI; a.yaw += d * Math.min(1, dt * 12); a.b.group.rotation.y = a.yaw;
    if (P.events && P.events.includes('land')) a.sq = .75; a.sq += (1 - a.sq) * Math.min(1, dt * 10); a.b.group.scale.set(1 + (1 - a.sq) * .5, a.sq, 1 + (1 - a.sq) * .5);
    const mv = Math.min(1, Math.hypot(P.vx || 0, P.vz || 0) / 7), air = !P.ground && (P.air || 0) > .06; BRChars.animate(a.b.rig, a.t, mv, air);
    if (air) a.b.group.rotation.x = Math.max(-.25, Math.min(.25, (P.vy || 0) * -.012)); else a.b.group.rotation.x = 0;
    if (P.inv > 0) a.g.visible = Math.floor(a.t * 16) % 2 === 0 || P.dead > 0 ? a.g.visible : a.g.visible;
    // Schatten auf dem Boden darunter
    a.sh.position.set(P.x, (P.groundY !== undefined ? P.groundY : P.y) + .03, P.z); const hgt = Math.max(0, P.y - (P.groundY !== undefined ? P.groundY : P.y)); a.sh.scale.setScalar(Math.max(.4, 1 - hgt * .08)); a.sh.material.opacity = .25 * Math.max(.2, 1 - hgt * .1);
  }
  /* ---------- Partikel ---------- */
  let pts = null; const PN = 400, pv = [];
  function initParts() { const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(new Float32Array(PN * 3), 3)); g.setAttribute('color', new T.BufferAttribute(new Float32Array(PN * 3), 3)); pts = new T.Points(g, new T.PointsMaterial({ size: .22, vertexColors: true, transparent: true, depthWrite: false })); pts.frustumCulled = false; scene.add(pts); for (let i = 0; i < PN; i++) pv.push({ life: 0 }); }
  const COLS = ['#ff4a7a', '#ffd23a', '#4ab0ff', '#5ae07a', '#c86aff', '#ffffff'];
  function burst(x, y, z, n, col, sp, up) { if (!pts) initParts(); let k = 0; for (const p of pv) { if (p.life > 0) continue; const c = lin(col || COLS[(Math.random() * COLS.length) | 0]); Object.assign(p, { x, y, z, vx: (Math.random() - .5) * sp, vy: Math.random() * (up || sp), vz: (Math.random() - .5) * sp, life: .6 + Math.random() * .7, c }); if (++k >= n) break; } }
  function stepParts(dt) { if (!pts) return; const P = pts.geometry.attributes.position, C = pts.geometry.attributes.color; pv.forEach((p, i) => { if (p.life > 0) { p.life -= dt; p.vy -= 14 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; P.setXYZ(i, p.x, p.y, p.z); C.setXYZ(i, p.c.r, p.c.g, p.c.b); } else P.setXYZ(i, 0, -999, 0); }); P.needsUpdate = C.needsUpdate = true; }
  /* ---------- Kamera ---------- */
  const camS = { x: 0, y: 0, z: 0, init: false };
  function follow(tx, ty, tz, yaw, pitch, dist, dt) {
    if (!camS.init) { camS.x = tx; camS.y = ty; camS.z = tz; camS.init = true; } const k = Math.min(1, dt * 8); camS.x += (tx - camS.x) * k; camS.y += (ty - camS.y) * Math.min(1, dt * 5); camS.z += (tz - camS.z) * k;
    const cp = Math.cos(pitch); cam.position.set(camS.x - Math.sin(yaw) * cp * dist, camS.y + 1.4 + Math.sin(pitch) * dist, camS.z - Math.cos(yaw) * cp * dist); cam.lookAt(camS.x, camS.y + 1.2, camS.z);
    sun.position.set(camS.x + 18, camS.y + 30, camS.z + 10); sun.target.position.set(camS.x, camS.y, camS.z);
  }
  function camReset() { camS.init = false; }
  /* ---------- Menü-Bühne ---------- */
  let podium = null, menuChar = null;
  function menuStage(charId) {
    clearWorld(); setTheme('menu'); camReset();
    if (!menuGroup) { menuGroup = new T.Group(); scene.add(menuGroup); const pod = new T.Mesh(new T.CylinderGeometry(2.2, 2.4, .5, 64), new T.MeshPhysicalMaterial({ color: lin('#ffffff'), roughness: .15, clearcoat: 1 })); pod.position.y = -.25; pod.receiveShadow = true; menuGroup.add(pod); const ring = new T.Mesh(new T.TorusGeometry(2.3, .08, 12, 64), new T.MeshPhysicalMaterial({ color: lin('#ffd23a'), metalness: .8, roughness: .2 })); ring.rotation.x = PI / 2; menuGroup.add(ring); podium = pod;
      for (let i = 0; i < 26; i++) { const c = BRChars.LIST[i % BRChars.LIST.length]; const m = new T.Mesh(new T.IcosahedronGeometry(.3 + Math.random() * .5, 1), new T.MeshPhysicalMaterial({ color: lin(c.color), roughness: .2, clearcoat: 1 })); const a = Math.random() * PI * 2, d = 6 + Math.random() * 10; m.position.set(Math.cos(a) * d, Math.random() * 8 - 1, Math.sin(a) * d - 4); m.userData.f = Math.random() * 2; menuGroup.add(m); } }
    menuGroup.visible = true; if (menuChar) menuGroup.remove(menuChar.group);
    menuChar = BRChars.build(charId); menuGroup.add(menuChar.group);
  }
  function menuOff() { if (menuGroup) menuGroup.visible = false; }
  function menuFrame(dt, rot, offsetX) {
    if (!menuGroup || !menuGroup.visible) return; menuChar.group.rotation.y += dt * (rot || .6); BRChars.animate(menuChar.rig, time, 0, false); time += dt;
    menuGroup.children.forEach(m => { if (m.userData.f !== undefined) { m.position.y += Math.sin(time + m.userData.f * 5) * .005; m.rotation.x += dt * .3; m.rotation.y += dt * .2; } });
    const ox = offsetX || 0; cam.position.set(ox + Math.sin(time * .2) * .4, 1.9, 6.2); cam.lookAt(ox, .95, 0); sun.position.set(4, 9, 6); sun.target.position.set(0, 0, 0);
  }
  /* ---------- Vorschaubilder der Figuren ---------- */
  let thumbR = null; const thumbs = {};
  function thumb(id) {
    if (thumbs[id]) return thumbs[id];
    if (!thumbR) { const c = document.createElement('canvas'); c.width = c.height = 256; thumbR = { r: BREnv.renderer(c, { maxDpr: 1, alpha: true }), s: new T.Scene(), c: new T.PerspectiveCamera(28, 1, .1, 50) }; thumbR.r.setSize(256, 256, false); thumbR.s.environment = BREnv.env(thumbR.r, { top: '#ffffff', mid: '#ffe8f4', bot: '#8a6aa0' }); const l = new T.DirectionalLight(0xffffff, 1.4); l.position.set(3, 6, 5); thumbR.s.add(l, new T.HemisphereLight(0xffffff, 0x664488, .5)); thumbR.c.position.set(0, 1.25, 5.6); thumbR.c.lookAt(0, .9, 0); }
    const b = BRChars.build(id); b.group.rotation.y = .5; BRChars.animate(b.rig, .4, 0, false); thumbR.s.add(b.group); thumbR.r.setClearColor(0x000000, 0); thumbR.r.render(thumbR.s, thumbR.c); const url = thumbR.r.domElement.toDataURL('image/png'); thumbR.s.remove(b.group);
    b.group.traverse(o => { if (o.geometry) o.geometry.dispose(); }); return thumbs[id] = url;
  }
  function render(dt) { stepParts(dt || 0); R.render(scene, cam); }
  // Qualität: 2 = voll, 1 = weniger Pixel, 0 = zusätzlich ohne Schatten (schwache Geräte)
  let q = 2; function quality(l) { if (l === undefined) return q; q = l; R.setPixelRatio(l >= 2 ? Math.min(devicePixelRatio || 1, 1.75) : l === 1 ? 1 : .75); R.shadowMap.enabled = l > 0; sun.castShadow = l > 0; scene.traverse(o => { if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { m.needsUpdate = true; }); }); resize(W, H); }
  window.BRView = { quality, appendObjs, sauce, init, resize, setTheme, buildWorld, clearWorld, syncWorld, npcNear, addActor, removeActor, clearActors, syncActor, burst, follow, camReset, menuStage, menuOff, menuFrame, thumb, render, get cam() { return cam; }, get theme() { return theme; } };
})();
