/* Funk-Minigolf 3D – Darstellung (Three.js r128), Kulissen aus dem RicoReWi × AnMaCha Radioportal, Steuerung, Spieler, Scorekarte.
 * Physik und Bahnen: js/core.js (FG). Senderlogos: ../anmacha-memory/logos/NN.png. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const P = 'funkgolf-';
  const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } } };
  const SET = Object.assign({ sound: true, help: true, low: false }, LS.get(P + 'settings', {}));
  const saveSet = () => LS.set(P + 'settings', SET);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let toastT = 0; function toast(m) { const t = $('toast'); t.textContent = m; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2400); }
  const PCOL = ['#ffffff', '#FF4FAE', '#00E5FF', '#FFC94D'];
  const T3 = window.THREE;

  /* ---------- Szene ---------- */
  const renderer = new T3.WebGLRenderer({ antialias: !SET.low, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, SET.low ? 1 : 1.75));
  $('view').appendChild(renderer.domElement);
  const scene = new T3.Scene(), camera = new T3.PerspectiveCamera(55, 1, .1, 200);
  scene.add(new T3.HemisphereLight(0xffffff, 0x404070, .7));
  const sun = new T3.DirectionalLight(0xffffff, .75); sun.position.set(-6, 12, -4); scene.add(sun);
  let course = new T3.Group(); scene.add(course);
  function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = w < h ? 68 : 55; camera.updateProjectionMatrix(); }
  addEventListener('resize', resize); resize();

  const texCache = new Map(), loader = new T3.TextureLoader();
  function logoTex(n) { const k = 'logo' + n; if (!texCache.has(k)) { const t = loader.load('../anmacha-memory/logos/' + String(n).padStart(2, '0') + '.png'); texCache.set(k, t); } return texCache.get(k); }
  function textTex(lines, o) {
    o = Object.assign({ w: 512, h: 256, bg: '#0b0f2a', fg: '#ffffff', font: 'bold 64px system-ui', border: '#FF4FAE' }, o || {});
    const c = document.createElement('canvas'); c.width = o.w; c.height = o.h; const g = c.getContext('2d');
    if (o.bg) { g.fillStyle = o.bg; g.fillRect(0, 0, o.w, o.h); }
    if (o.border) { g.strokeStyle = o.border; g.lineWidth = 12; g.strokeRect(6, 6, o.w - 12, o.h - 12); }
    g.fillStyle = o.fg; g.textAlign = 'center'; g.textBaseline = 'middle';
    const L = [].concat(lines); L.forEach((t, i) => { g.font = i === 0 ? o.font : o.font2 || o.font.replace(/\d+px/, m => Math.round(parseInt(m) * .55) + 'px'); g.fillText(t, o.w / 2, o.h / 2 + (i - (L.length - 1) / 2) * o.h * .32); });
    const t = new T3.CanvasTexture(c); t.anisotropy = 4; return t;
  }
  function chevronTex(color) { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); g.strokeStyle = color; g.lineWidth = 14; g.lineCap = 'round'; for (const y of [30, 80]) { g.beginPath(); g.moveTo(24, y + 26); g.lineTo(64, y - 6); g.lineTo(104, y + 26); g.stroke(); } const t = new T3.CanvasTexture(c); t.wrapS = t.wrapT = T3.RepeatWrapping; return t; }
  const M = (color, o) => new T3.MeshLambertMaterial(Object.assign({ color }, o || {}));
  const MS = (color, o) => new T3.MeshStandardMaterial(Object.assign({ color, roughness: .45, metalness: .1 }, o || {}));
  function shapeMesh(poly, mat, y) {
    const sh = new T3.Shape(poly.map(([x, z]) => new T3.Vector2(x, -z)));
    const m = new T3.Mesh(new T3.ShapeGeometry(sh), mat); m.rotation.x = -Math.PI / 2; m.position.y = y || 0; return m;
  }
  function box(w, h, d, mat, x, y, z) { const m = new T3.Mesh(new T3.BoxGeometry(w, h, d), mat); m.position.set(x || 0, y || 0, z || 0); return m; }
  function cyl(rt, rb, h, mat, x, y, z, seg) { const m = new T3.Mesh(new T3.CylinderGeometry(rt, rb, h, seg || 20), mat); m.position.set(x || 0, y || 0, z || 0); return m; }
  function plane(w, h, mat, x, y, z, ry) { const m = new T3.Mesh(new T3.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.y = ry || 0; return m; }
  function billboard(tex, w, h, x, z, ry, y) { const g = new T3.Group(); const mat = new T3.MeshBasicMaterial({ map: tex, side: T3.DoubleSide }); g.add(plane(w, h, mat, 0, (y || 1.3), 0)); const pm = M(0x2a2f55); g.add(cyl(.04, .04, (y || 1.3), pm, -w * .42, (y || 1.3) / 2, -.02)); g.add(cyl(.04, .04, (y || 1.3), pm, w * .42, (y || 1.3) / 2, -.02)); g.position.set(x, 0, z); g.rotation.y = ry || 0; return g; }

  const THEMES = {
    portal: { sky: 'linear-gradient(180deg,#2a1b6b,#070a1c)', ground: 0x0d1230, fair: 0x2fbf71, wall: 0xFF4FAE },
    strand: { sky: 'linear-gradient(180deg,#ff9a5a,#ffcf7a 40%,#4fb3d9)', ground: 0xe8c98a, fair: 0x3fcf6f, wall: 0xffffff },
    street: { sky: 'linear-gradient(180deg,#2b2b3a,#0d0d18)', ground: 0x2a2a33, fair: 0x3a9a4a, wall: 0xffd600 },
    party: { sky: 'linear-gradient(180deg,#ff4fae,#5a1a7a)', ground: 0x2a0f3a, fair: 0x3ad07a, wall: 0xffc94d },
    charts: { sky: 'linear-gradient(180deg,#1a3a8a,#070a1c)', ground: 0x101a3a, fair: 0x2fb86a, wall: 0x00e5ff },
    club: { sky: 'linear-gradient(180deg,#14002a,#000)', ground: 0x120020, fair: 0x2aa86a, wall: 0xff2d95 },
    studio: { sky: 'linear-gradient(180deg,#3a1240,#120a24)', ground: 0x1a1030, fair: 0x33c27a, wall: 0xff8a1f },
    plan: { sky: 'linear-gradient(180deg,#234a8a,#0b1a3a)', ground: 0x102040, fair: 0x3ac47a, wall: 0xffffff },
    voting: { sky: 'linear-gradient(180deg,#5a1aa0,#140a3a)', ground: 0x1a1040, fair: 0x2fbf71, wall: 0xFF4FAE },
    kids: { sky: 'linear-gradient(180deg,#7fd8ff,#c9f0ff)', ground: 0xfff1b8, fair: 0x5ad86a, wall: 0xff6a3a },
    rock: { sky: 'linear-gradient(180deg,#3a0a0a,#0a0505)', ground: 0x1a0a0a, fair: 0x2f9a4a, wall: 0xdddddd },
    winter: { sky: 'linear-gradient(180deg,#9fc7ff,#e9f4ff)', ground: 0xf4f8ff, fair: 0x5ab88a, wall: 0xc0392b },
    retro: { sky: 'linear-gradient(180deg,#ff8a1f,#5a1a3a)', ground: 0x2a1a20, fair: 0x3ab06a, wall: 0xffc94d },
    arcade: { sky: 'linear-gradient(180deg,#0a0a2a,#000)', ground: 0x050518, fair: 0x2aa8a0, wall: 0x00e5ff },
    insel: { sky: 'linear-gradient(180deg,#6fc7ff,#c9ecff)', ground: 0x1f7fc4, fair: 0x4fd66f, wall: 0xf4e1b0 },
    podcast: { sky: 'linear-gradient(180deg,#3a1a00,#120a00)', ground: 0x1a1008, fair: 0x3ab86a, wall: 0xff8a1f },
    nacht: { sky: 'linear-gradient(180deg,#05051a,#1a0a3a)', ground: 0x08081c, fair: 0x2a8a5a, wall: 0x8b5cf6 },
    turm: { sky: 'linear-gradient(180deg,#ff6a3a,#3a1a6b 60%,#070a1c)', ground: 0x0d1230, fair: 0x2fbf71, wall: 0xFF4FAE }
  };

  /* ---------- Bahn bauen ---------- */
  let H = null, movers = [], extras = [], cupFlag = null;
  function bbox(h) { const p = h.bounds.flat(); const xs = p.map(q => q[0]), zs = p.map(q => q[1]); return { x0: Math.min(...xs), x1: Math.max(...xs), z0: Math.min(...zs), z1: Math.max(...zs) }; }
  function build(h, num) {
    scene.remove(course); course.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material && o.material.dispose && !o.material.keep) o.material.dispose(); });
    course = new T3.Group(); scene.add(course); movers = []; extras = [];
    const th = THEMES[h.theme] || THEMES.portal, B = bbox(h), cx = (B.x0 + B.x1) / 2, cz = (B.z0 + B.z1) / 2;
    $('sky').style.background = th.sky;
    const gr = new T3.Mesh(new T3.PlaneGeometry(80, 80), M(th.ground)); gr.rotation.x = -Math.PI / 2; gr.position.set(cx, -.06, cz); course.add(gr);
    // Rand unter der Bahn, Spielfläche, Zonen
    for (const p of h.bounds) { course.add(shapeMesh(p, M(0x1a1a2a), -.05)); course.add(shapeMesh(p, M(th.fair), 0)); }
    const zone = (list, color, y, extra) => (list || []).forEach(p => { const m = shapeMesh(p, M(color, extra), y); course.add(m); });
    zone(h.sand, 0xe9d08f, .004); zone(h.ice, 0xcfefff, .004, { transparent: true, opacity: .85 });
    (h.water || []).forEach(p => { const m = shapeMesh(p, new T3.MeshLambertMaterial({ color: 0x1e88e5, transparent: true, opacity: .9 }), .006); course.add(m); extras.push({ k: 'water', m }); });
    if (h.island) course.add(shapeMesh(h.island, M(th.fair), .008));
    (h.slopes || []).forEach(s => {
      const tex = chevronTex('rgba(255,255,255,.55)'); const xs = s.p.map(q => q[0]), zs = s.p.map(q => q[1]);
      tex.repeat.set((Math.max(...xs) - Math.min(...xs)) / .8, (Math.max(...zs) - Math.min(...zs)) / .8);
      const m = shapeMesh(s.p, new T3.MeshBasicMaterial({ map: tex, transparent: true, color: 0xffffff }), .007);
      // Pfeile in Kraftrichtung: Textur zeigt nach oben (−z in der Form = +z in der Welt)
      tex.center.set(.5, .5); tex.rotation = Math.atan2(-s.f[0], s.f[1]) + Math.PI;
      course.add(m); course.add(shapeMesh(s.p, new T3.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .08 }), .005));
      extras.push({ k: 'slope', tex, f: s.f });
    });
    // Wände
    const wm = MS(th.wall);
    for (const [a, c] of FG.segsOf(h)) { const L = Math.hypot(c[0] - a[0], c[1] - a[1]); const m = box(L + .08, .16, .08, wm, (a[0] + c[0]) / 2, .08, (a[1] + c[1]) / 2); m.rotation.y = -Math.atan2(c[1] - a[1], c[0] - a[0]); course.add(m); }
    // Bumper je Thema
    for (const [x, z, r] of h.bumpers || []) {
      if (h.theme === 'party') { const s = new T3.Mesh(new T3.SphereGeometry(r, 18, 12), MS(0xe8e8ff, { metalness: .25, roughness: .25, emissive: 0x5a3a7a })); s.position.set(x, r, z); course.add(s); extras.push({ k: 'spin', m: s }); }
      else if (h.theme === 'winter') { course.add(cyl(.06, .08, .25, M(0x6b3a1a), x, .12, z)); const t = new T3.Mesh(new T3.ConeGeometry(r * 1.3, r * 4, 10), M(0x1f7a3a)); t.position.set(x, r * 2 + .2, z); course.add(t); const top = new T3.Mesh(new T3.ConeGeometry(r * .6, r * .9, 10), M(0xffffff)); top.position.set(x, r * 4 + .1, z); course.add(top); }
      else { const col = h.theme === 'kids' ? [0xff4f4f, 0x4fa8ff, 0xffd84f, 0x5ad86a][Math.abs((x * 7 + z * 3) | 0) % 4] : h.theme === 'plan' ? 0xffffff : th.wall; course.add(cyl(r, r, .22, MS(col), x, .11, z)); course.add(cyl(r * .7, r * .7, .02, M(0x0b0f2a), x, .23, z)); }
    }
    // bewegliche Hindernisse
    for (const m of h.movers || []) {
      if (m.k === 'rot') {
        const g = new T3.Group(); const L = m.half ? m.len : m.len;
        const bar = box(L, .18, m.w, MS(h.theme === 'nacht' ? 0xfff3b0 : h.theme === 'retro' ? 0x222222 : 0xffffff, h.theme === 'nacht' ? { emissive: 0x665522 } : {}), m.half ? L / 2 : 0, .09, 0); g.add(bar);
        g.add(cyl(.12, .12, .3, MS(0x333344), 0, .15, 0));
        if (h.theme === 'club' || h.theme === 'retro') { const d = cyl(m.len / 2 + .1, m.len / 2 + .1, .02, M(h.theme === 'club' ? 0x111111 : 0xf4f4f4), 0, .01, 0, 40); course.add(d); d.position.set(m.c[0], .012, m.c[1]); const lab = cyl(.35, .35, .025, M(h.theme === 'club' ? 0xff2d95 : 0xff8a1f), m.c[0], .02, m.c[1], 24); course.add(lab); }
        if (h.theme === 'nacht') { const moon = new T3.Mesh(new T3.SphereGeometry(.22, 16, 12), MS(0xfff6c8, { emissive: 0x887744 })); moon.position.set(m.len + .05, .2, 0); g.add(moon); }
        g.position.set(m.c[0], 0, m.c[1]); course.add(g); movers.push({ m, g });
      } else {
        const g = box(m.w, .2, m.d, MS(h.theme === 'studio' ? 0xff8a1f : 0xffffff), 0, .1, 0);
        if (h.theme === 'studio') g.add(box(.25, .08, m.d * 1.2, MS(0xffffff), 0, .12, 0));
        course.add(g); movers.push({ m, g });
        if (h.theme === 'studio') { const tr = box(Math.hypot(m.b[0] - m.a[0], m.b[1] - m.a[1]) + m.w, .01, .06, M(0x111111), (m.a[0] + m.b[0]) / 2, .005, (m.a[1] + m.b[1]) / 2); course.add(tr); }
      }
    }
    // Teleporter
    for (const pt of h.portals || []) for (const [p, col] of [[pt.a, 0x00e5ff], [pt.b, 0xff2d95]]) { const r = new T3.Mesh(new T3.TorusGeometry(.26, .04, 8, 28), new T3.MeshBasicMaterial({ color: col })); r.rotation.x = Math.PI / 2; r.position.set(p[0], .03, p[1]); course.add(r); const d = new T3.Mesh(new T3.CircleGeometry(.24, 24), new T3.MeshBasicMaterial({ color: col, transparent: true, opacity: .35 })); d.rotation.x = -Math.PI / 2; d.position.set(p[0], .02, p[1]); course.add(d); extras.push({ k: 'pulse', m: d }); }
    // Abschlag und Loch
    const tee = box(.5, .01, .5, M(0x1b5e3a), h.tee[0], .004, h.tee[1]); course.add(tee);
    const cup = new T3.Mesh(new T3.CircleGeometry(FG.CUP, 28), new T3.MeshBasicMaterial({ color: 0x050505 })); cup.rotation.x = -Math.PI / 2; cup.position.set(h.cup[0], .01, h.cup[1]); course.add(cup);
    const ring = new T3.Mesh(new T3.RingGeometry(FG.CUP, FG.CUP + .03, 28), new T3.MeshBasicMaterial({ color: 0xffffff })); ring.rotation.x = -Math.PI / 2; ring.position.set(h.cup[0], .011, h.cup[1]); course.add(ring);
    cupFlag = new T3.Group(); cupFlag.add(cyl(.015, .015, 1.1, MS(0xffffff), 0, .55, 0)); const fl = plane(.42, .28, new T3.MeshBasicMaterial({ map: textTex(String(num), { w: 128, h: 96, bg: '#FF4FAE', border: null, font: 'bold 64px system-ui' }), side: T3.DoubleSide }), .21, .95, 0); cupFlag.add(fl); cupFlag.position.set(h.cup[0], 0, h.cup[1]); course.add(cupFlag);
    // Kulisse
    decorate(h, th, B, cx, cz);
    return B;
  }
  function decorate(h, th, B, cx, cz) {
    const L = B.x0 - 1.1, Rt = B.x1 + 1.1, back = B.z1 + 1.4, add = o => { course.add(o); return o; };
    if (h.logo) { add(billboard(logoTex(h.logo), 1.7, 1.7, L, cz, Math.PI / 2, 1.5)); add(billboard(logoTex(h.logo), 1.4, 1.4, cx, back, Math.PI, 1.2)); }
    const sign = (lines, x, z, ry, o, w, hh) => add(billboard(textTex(lines, o), w || 2.4, hh || 1.2, x, z, ry, 1.4));
    switch (h.theme) {
      case 'portal':
        add(billboard(textTex(['Schön, dass du da bist!', 'RicoReWi × AnMaCha Radioportal'], { w: 1024, h: 256, font: 'bold 76px system-ui' }), 3.6, .9, cx, B.z0 + 3.2, Math.PI, 1.9));
        sign(['Start · Sender · Sendeplan', 'Voting · Podcast · News'], Rt, cz, -Math.PI / 2, { font: 'bold 50px system-ui' }); break;
      case 'strand':
        for (const [x, z] of [[L, 2], [Rt + 4.6, 6], [L + .3, 9.5]]) palm(x, z);
        add(new T3.Mesh(new T3.SphereGeometry(2, 20, 14), new T3.MeshBasicMaterial({ color: 0xffd27a }))).position.set(cx + 6, 6, back + 8); break;
      case 'street':
        sign(['RAP 24', 'Rapradio 24'], Rt, 5, -Math.PI / 2, { bg: '#111', fg: '#ffd600', border: '#ff2d95', font: 'bold 96px system-ui' });
        add(box(.8, .5, .3, MS(0x222222), Rt, .25, 10)); add(cyl(.12, .12, .05, M(0x888888), Rt - .2, .3, 9.84)).rotation.x = Math.PI / 2; break;
      case 'party':
        for (let k = 0; k < 4; k++) { const c = new T3.Mesh(new T3.ConeGeometry(.9, 4, 16, 1, true), new T3.MeshBasicMaterial({ color: [0xff4fae, 0x00e5ff, 0xffc94d, 0x8b5cf6][k], transparent: true, opacity: .14, side: T3.DoubleSide })); c.position.set(cx + (k - 1.5) * 1.3, 2, cz + (k % 2 ? 2 : -2)); add(c); extras.push({ k: 'sway', m: c, p: k }); }
        sign(['Schlagerpop 24', '♪ Party ohne Ende ♪'], Rt, cz, -Math.PI / 2, { bg: '#ff4fae', border: '#ffc94d' }); break;
      case 'charts':
        [[2, .6, 0xc0c0c0], [1, .9, 0xffc94d], [3, .4, 0xcd7f32]].forEach(([n, hgt, col], i) => { add(box(.9, hgt, .9, MS(col), Rt + .2 + (i - 1) * .95, hgt / 2, back - .6)); });
        sign(['HITPARADE', 'Chartradio 24 · Platz 1'], L, 3, Math.PI / 2, { bg: '#1a3a8a', border: '#ffc94d' }); break;
      case 'club': for (const x of [L, Rt]) { add(box(.8, 1.4, .7, MS(0x111111), x, .7, cz + 2)); add(cyl(.25, .25, .05, M(0x444444), x + (x < cx ? .36 : -.36), 1, cz + 2)).rotation.z = Math.PI / 2; } sign(['Clubradio 24', 'DJ am Plattenteller'], Rt, 9, -Math.PI / 2, { bg: '#14002a', border: '#ff2d95' }); break;
      case 'studio': {
        const on = add(billboard(textTex('ON AIR', { bg: '#d0102a', border: '#fff', font: 'bold 120px system-ui' }), 2.2, 1, cx, back, Math.PI, 1.9)); extras.push({ k: 'blink', m: on.children[0] });
        for (const x of [L + .4, Rt - .4]) { add(cyl(.03, .05, 1.1, MS(0x333333), x, .55, cz - 2)); add(new T3.Mesh(new T3.SphereGeometry(.13, 14, 10), MS(0x888888, { metalness: .6 }))).position.set(x, 1.15, cz - 2); }
        break;
      }
      case 'plan': sign(['SENDEPLAN', 'Mo Di Mi Do Fr Sa So'], L, cz, Math.PI / 2, { bg: '#ffffff', fg: '#1a2a6a', border: '#FF4FAE' }); break;
      case 'voting': {
        const c = document.createElement('canvas'); c.width = 512; c.height = 256; const g = c.getContext('2d'); g.fillStyle = '#140a3a'; g.fillRect(0, 0, 512, 256); g.fillStyle = '#fff'; g.font = 'bold 56px system-ui'; g.textAlign = 'center'; g.fillText('VOTING', 256, 60);
        g.fillStyle = '#FF4FAE'; g.fillRect(60, 110, 180, 40); g.fillStyle = '#00E5FF'; g.fillRect(60, 170, 300, 40); g.fillStyle = '#fff'; g.font = 'bold 30px system-ui'; g.textAlign = 'left'; g.fillText('Links', 260, 140); g.fillText('Rechts', 380, 200);
        add(billboard(new T3.CanvasTexture(c), 2.4, 1.2, cx, back, Math.PI, 1.5)); break;
      }
      case 'kids': for (let k = 0; k < 7; k++) add(box(.45, .45, .45, MS([0xff4f4f, 0x4fa8ff, 0xffd84f, 0x5ad86a][k % 4]), Rt + .2 + (k % 2) * .5, .22 + (k > 3 ? .45 : 0), 2 + k * .5)); break;
      case 'rock': {
        const body = new T3.Mesh(new T3.CylinderGeometry(1.6, 1.6, .2, 30), MS(0xb3001b)); body.scale.set(1, 1, 1.2); body.position.set(cx, .1, back + .6); add(body);
        for (const x of [L, Rt]) add(box(.9, 1.1, .5, MS(0x111111), x, .55, cz)); sign(['ROCK', 'Rockradio 24'], L, 11, Math.PI / 2, { bg: '#111', fg: '#fff', border: '#b3001b', font: 'bold 110px system-ui' }); break;
      }
      case 'winter': for (const [x, z] of [[L, 2], [Rt, 5], [L + .2, 9], [Rt - .2, 11]]) { const t = new T3.Mesh(new T3.ConeGeometry(.7, 2.2, 10), M(0x1f6a3a)); t.position.set(x, 1.1, z); add(t); }
        extras.push({ k: 'snow', m: snow(B) }); break;
      case 'retro': add(box(5.4, .12, 3.2, MS(0x2b2b2b), cx, .0, cz).translateY(-.06)); sign(['KULT', 'Kultradio 24 · 80er 90er'], Rt, 3, -Math.PI / 2, { bg: '#ff8a1f', fg: '#2a1a20', border: '#2a1a20' }); break;
      case 'arcade': sign(['ZOCKER-FM', '🎮 Press Start'], L, 7, Math.PI / 2, { bg: '#000', fg: '#00e5ff', border: '#ff2d95' }); break;
      case 'insel': palm(3, 9.8); palm(L - 1, 3); break;
      case 'podcast': { const arc = new T3.Mesh(new T3.TorusGeometry(1.8, .12, 10, 30, Math.PI), MS(0x222222)); arc.position.set(cx, 1.4, back); add(arc); for (const s of [-1, 1]) add(box(.5, .7, .5, MS(0xff8a1f), cx + s * 1.8, 1.2, back)); sign(['AnMaChaCast', 'Der Podcast'], L, 6, Math.PI / 2, { bg: '#1a1008', border: '#ff8a1f' }); break; }
      case 'nacht': { const m = new T3.Mesh(new T3.SphereGeometry(1.4, 20, 14), new T3.MeshBasicMaterial({ color: 0xfff6c8 })); m.position.set(cx + 5, 7, back + 6); add(m); stars(); sign(['Sleep-Timer', '15 · 30 · 60 Minuten'], Rt, 4, -Math.PI / 2, { bg: '#05051a', border: '#8b5cf6' }); break; }
      case 'turm': {
        const tw = new T3.Group(), mat = MS(0xd0d0d0), H2 = 6;
        for (const [dx, dz] of [[-.5, -.5], [.5, -.5], [.5, .5], [-.5, .5]]) { const leg = cyl(.03, .05, H2, mat, dx * .4, H2 / 2, dz * .4); leg.rotation.z = -dx * .14; leg.rotation.x = dz * .14; tw.add(leg); }
        for (let y = .6; y < H2; y += .7) { const r = box(1.1 - y * .13, .03, .03, mat, 0, y, 0); r.rotation.y = (y * 3) % 2; tw.add(r); }
        const lamp = new T3.Mesh(new T3.SphereGeometry(.12, 10, 8), new T3.MeshBasicMaterial({ color: 0xff2020 })); lamp.position.y = H2 + .1; tw.add(lamp); extras.push({ k: 'blink', m: lamp });
        tw.position.set(8.9, 0, 17.4); add(tw); sign(['EMPFANG', 'UKW · DAB+ · Stream · App'], L, 6, Math.PI / 2, { bg: '#0b0f2a', border: '#FF4FAE' }); break;
      }
    }
  }
  function palm(x, z) { const g = new T3.Group(); const tr = cyl(.07, .11, 2.2, M(0x8a5a2b), 0, 1.1, 0, 8); tr.rotation.z = .12; g.add(tr); for (let k = 0; k < 6; k++) { const l = new T3.Mesh(new T3.ConeGeometry(.16, 1.3, 4), M(0x2f9a3f)); l.position.set(Math.cos(k) * .45 + .25, 2.15, Math.sin(k) * .45); l.rotation.z = Math.PI / 2 + Math.cos(k) * .6; l.rotation.x = Math.sin(k) * .6; g.add(l); } g.position.set(x, 0, z); course.add(g); }
  function stars() { const geo = new T3.BufferGeometry(), n = 200, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { a[i * 3] = (Math.random() - .5) * 60; a[i * 3 + 1] = 6 + Math.random() * 14; a[i * 3 + 2] = Math.random() * 40 - 5; } geo.setAttribute('position', new T3.BufferAttribute(a, 3)); course.add(new T3.Points(geo, new T3.PointsMaterial({ color: 0xffffff, size: .08 }))); }
  function snow(B) { const geo = new T3.BufferGeometry(), n = SET.low ? 120 : 400, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { a[i * 3] = B.x0 - 3 + Math.random() * (B.x1 - B.x0 + 6); a[i * 3 + 1] = Math.random() * 6; a[i * 3 + 2] = B.z0 - 2 + Math.random() * (B.z1 - B.z0 + 4); } geo.setAttribute('position', new T3.BufferAttribute(a, 3)); const p = new T3.Points(geo, new T3.PointsMaterial({ color: 0xffffff, size: .06 })); course.add(p); return p; }

  // Ball, Schatten, Zielpfeil
  const ballMesh = new T3.Mesh(new T3.SphereGeometry(FG.BALL, 20, 14), MS(0xffffff, { roughness: .3 })); scene.add(ballMesh);
  const shadow = new T3.Mesh(new T3.CircleGeometry(FG.BALL * 1.1, 16), new T3.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .3 })); shadow.rotation.x = -Math.PI / 2; scene.add(shadow);
  const aimG = new T3.Group(); const aimMat = new T3.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .9 });
  const shaft = box(1, .02, .05, aimMat, .5, .03, 0), head = new T3.Mesh(new T3.ConeGeometry(.1, .22, 3), aimMat); head.rotation.z = -Math.PI / 2; head.position.set(1.05, .03, 0);
  aimG.add(shaft, head); scene.add(aimG);
  const dots = []; for (let i = 0; i < 14; i++) { const d = new T3.Mesh(new T3.CircleGeometry(.025, 8), new T3.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .55 })); d.rotation.x = -Math.PI / 2; scene.add(d); dots.push(d); }

  /* ---------- Ton ---------- */
  let AC = null;
  function sfx(k, v) {
    if (!SET.sound) return;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); const t = AC.currentTime;
      const tone = (f, d, vol, type, f2, at) => { const o = AC.createOscillator(), g = AC.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t + (at || 0)); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + (at || 0) + d); g.gain.setValueAtTime(.0001, t + (at || 0)); g.gain.exponentialRampToValueAtTime(vol, t + (at || 0) + .006); g.gain.exponentialRampToValueAtTime(.0001, t + (at || 0) + d); o.connect(g); g.connect(AC.destination); o.start(t + (at || 0)); o.stop(t + (at || 0) + d + .02); };
      const noise = (d, f, vol) => { const n = AC.sampleRate * d, b = AC.createBuffer(1, n, AC.sampleRate), dd = b.getChannelData(0); for (let i = 0; i < n; i++) dd[i] = (Math.random() * 2 - 1) * (1 - i / n); const s = AC.createBufferSource(), fl = AC.createBiquadFilter(), g = AC.createGain(); s.buffer = b; fl.type = 'lowpass'; fl.frequency.value = f; g.gain.value = vol; s.connect(fl); fl.connect(g); g.connect(AC.destination); s.start(t); };
      if (k === 'putt') { tone(900, .05, .25 * (v || .6), 'triangle', 400); noise(.04, 3000, .2 * (v || .6)); }
      else if (k === 'wall') tone(160, .08, .18, 'sine', 90);
      else if (k === 'bump') tone(500, .18, .14, 'sine', 900);
      else if (k === 'cup') { noise(.15, 1800, .3); [0, .1, .2].forEach((d, i) => tone(660 * Math.pow(1.26, i), .18, .1, 'triangle', 0, .15 + d)); }
      else if (k === 'water') noise(.5, 900, .5);
      else if (k === 'portal') tone(300, .35, .12, 'sawtooth', 1400);
      else if (k === 'ace') [0, 1, 2, 3, 4].forEach(i => tone(523 * Math.pow(1.19, i), .2, .1, 'triangle', 0, i * .09));
    } catch (e) { }
  }

  /* ---------- Spielzustand ---------- */
  const G = { state: 'menu', players: [], holes: [], hi: 0, pi: 0, scores: [], ball: null, t: 0, aim: 0, power: 0, drag: null, charge: 0, chargeDir: 1, cam: 'follow', yaw: 0, camYaw: 0, done: [], banner: 0 };
  const curHole = () => FG.HOLES[G.holes[G.hi]];
  function startGame() {
    G.players = setupPlayers.map((n, i) => ({ name: (n || '').trim().slice(0, 14) || 'Spieler ' + (i + 1), col: PCOL[i] }));
    LS.set(P + 'names', G.players.map(p => p.name));
    const c = document.querySelector('#course .chip.on').dataset.c;
    G.holes = c === 'front' ? [...Array(9).keys()] : c === 'back' ? [...Array(9).keys()].map(i => i + 9) : [...Array(18).keys()];
    G.scores = G.players.map(() => G.holes.map(() => null)); G.hi = 0; G.course = c; G.cam = 'follow';
    $('sMenu').classList.remove('on'); $('hud').hidden = false; padNav(false);
    startHole();
  }
  let bounds = null;
  function startHole() { const h = curHole(); bounds = build(h, G.holes[G.hi] + 1); G.t = 0; G.pi = 0; G.done = G.players.map(() => false); startPlayer(true); }
  function startPlayer(first) {
    const h = curHole(); G.ball = FG.newBall(h); G.strokes = 0; G.state = 'aim'; G.power = 0; G.drag = null; G.charge = 0;
    G.aim = Math.atan2(h.cup[1] - h.tee[1], h.cup[0] - h.tee[0]); G.yaw = G.aim; G.camYaw = 0;
    ballMesh.material.color.set(G.players[G.pi].col);
    hud(); showBanner(first ? 'Bahn ' + (G.holes[G.hi] + 1) + '<small>' + esc(h.n) + ' · Par ' + h.par + '</small>' : esc(G.players[G.pi].name) + ' ist dran<small>Bahn ' + (G.holes[G.hi] + 1) + ' · Par ' + h.par + '</small>', 1800);
    if (first && G.players.length > 1) setTimeout(() => { if (G.state === 'aim' && G.strokes === 0) showBanner(esc(G.players[G.pi].name) + ' beginnt', 1100); }, 1900);
    snapCam();
  }
  function hud() {
    const h = curHole(), p = G.players[G.pi], tot = G.scores[G.pi].reduce((s, v) => s + (v || 0), 0), parSoFar = G.holes.slice(0, G.hi).reduce((s, i) => s + FG.HOLES[i].par, 0), diff = tot - parSoFar;
    $('hNum').textContent = G.holes[G.hi] + 1; $('hName').textContent = h.n; $('hSub').textContent = h.sub + ' · Par ' + h.par;
    $('hWho').innerHTML = '<i style="background:' + p.col + '"></i>' + esc(p.name) + ' · Schlag ' + (G.strokes + (G.state === 'aim' ? 1 : 0)) + '<small>Gesamt ' + tot + (G.hi ? ' (' + (diff > 0 ? '+' : '') + diff + ')' : '') + '</small>';
    $('tip').textContent = G.state === 'aim' ? (lastInput === 'pad' ? 'Stick zielen · A halten und loslassen' : lastInput === 'key' ? '← → zielen · Leertaste halten und loslassen' : 'Ziehen wie eine Steinschleuder · Loslassen schlägt') : '';
  }
  function showBanner(html, ms) { const b = $('banner'); b.innerHTML = html; b.hidden = false; b.style.animation = 'none'; void b.offsetWidth; b.style.animation = ''; clearTimeout(G.bannerT); G.bannerT = setTimeout(() => { b.hidden = true; }, ms || 1600); }
  function shoot(power) {
    if (G.state !== 'aim' || power < .05) return;
    FG.shoot(G.ball, G.aim, power); G.strokes++; G.state = 'roll'; G.power = 0; sfx('putt', power); hud();
  }
  function finishPlayer(inCup) {
    const h = curHole(), s = inCup ? G.strokes : FG.MAXSTROKES; G.scores[G.pi][G.hi] = s; G.done[G.pi] = true;
    const d = s - h.par, name = s === 1 ? 'Hole-in-One! 🎉' : d <= -2 ? 'Eagle 🦅' : d === -1 ? 'Birdie 🐦' : d === 0 ? 'Par 👍' : d === 1 ? 'Bogey' : d === 2 ? 'Doppel-Bogey' : s + ' Schläge';
    if (inCup) { sfx(s === 1 ? 'ace' : 'cup'); if (s === 1) { const st = LS.get(P + 'stats', {}); st.asse = (st.asse || 0) + 1; LS.set(P + 'stats', st); } }
    showBanner(inCup ? name + '<small>' + esc(G.players[G.pi].name) + ' · ' + s + (s === 1 ? ' Schlag' : ' Schläge') + '</small>' : 'Maximal ' + FG.MAXSTROKES + ' Schläge<small>Weiter geht\'s!</small>', 1800);
    G.state = 'done';
    setTimeout(() => {
      const nx = G.done.indexOf(false);
      if (nx >= 0) { G.pi = nx; startPlayer(false); }
      else showCard(false);
    }, 1900);
  }
  function table(hl) {
    const pars = G.holes.map(i => FG.HOLES[i].par), parT = pars.reduce((a, b) => a + b, 0);
    let t = '<table><tr><th>Bahn</th>' + G.holes.map(i => '<th>' + (i + 1) + '</th>').join('') + '<th>Σ</th></tr><tr><td>Par</td>' + pars.map(p => '<td>' + p + '</td>').join('') + '<td class="tot">' + parT + '</td></tr>';
    G.players.forEach((p, k) => {
      const row = G.scores[k]; let sum = 0;
      t += '<tr><td><i style="display:inline-block;width:10px;height:10px;border-radius:50%;background:' + p.col + ';margin-right:6px"></i>' + esc(p.name) + '</td>' + row.map((v, j) => { if (v == null) return '<td>·</td>'; sum += v; const cls = v === 1 ? 'ace' : v < pars[j] ? 'under' : v > pars[j] ? 'over' : ''; return '<td class="' + cls + (j === hl ? ' cur' : '') + '">' + v + '</td>'; }).join('') + '<td class="tot">' + sum + '</td></tr>';
    });
    return t + '</table>';
  }
  function showCard(view) {
    $('cardTitle').textContent = view ? 'Scorekarte' : 'Nach Bahn ' + (G.holes[G.hi] + 1) + ' von ' + G.holes.length;
    $('cardTbl').innerHTML = table(G.hi);
    $('cardGo').textContent = view ? 'Zurück zum Spiel' : G.hi + 1 >= G.holes.length ? 'Endstand ▶' : 'Nächste Bahn ▶';
    $('cardGo').onclick = () => { $('ovCard').hidden = true; padNav(false); if (view) return; G.hi++; if (G.hi >= G.holes.length) end(); else startHole(); };
    $('ovCard').hidden = false; padNav(true); focusEl($('cardGo'));
    if (!view) G.state = 'card';
  }
  function end() {
    G.state = 'end';
    const tot = G.players.map((p, k) => ({ p, s: G.scores[k].reduce((a, b) => a + (b || 0), 0) })).sort((a, b) => a.s - b.s);
    const parT = G.holes.reduce((s, i) => s + FG.HOLES[i].par, 0);
    $('endTitle').textContent = G.players.length > 1 ? '🏆 ' + tot[0].p.name + ' gewinnt!' : '⛳ Runde geschafft!';
    $('endRank').innerHTML = tot.map((x, i) => '<li class="' + (i === 0 ? 'win' : '') + '"><span>' + (i + 1) + '. ' + esc(x.p.name) + '</span><b>' + x.s + ' (' + (x.s - parT > 0 ? '+' : '') + (x.s - parT) + ')</b></li>').join('');
    $('endTbl').innerHTML = table(-1);
    const st = LS.get(P + 'stats', {}); st.runden = (st.runden || 0) + 1;
    let info = '';
    if (G.course === 'all' && G.players.length === 1) { const pts = FG.points(tot[0].s); const prev = LS.get(P + 'highscore', 0); if (pts > prev) { LS.set(P + 'highscore', pts); info = '🏆 Neuer Rekord: ' + tot[0].s + ' Schläge (' + pts + ' Punkte für die Rangliste)'; } else info = 'Rekord: ' + prev + ' Punkte'; st.bester = Math.min(st.bester || 999, tot[0].s); }
    LS.set(P + 'stats', st);
    $('endInfo').textContent = info;
    $('ovEnd').hidden = false; padNav(true); focusEl($('endAgain')); sfx('ace');
  }

  /* ---------- Kamera ---------- */
  const camPos = new T3.Vector3(), camLook = new T3.Vector3();
  function camTarget(out, look) {
    const b = G.ball, B = bounds;
    if (G.cam === 'top' && B) {
      const cx = (B.x0 + B.x1) / 2, cz = (B.z0 + B.z1) / 2, tf = Math.tan(camera.fov * Math.PI / 360);
      const hh = Math.max(((B.z1 - B.z0) / 2 + .6) / tf, ((B.x1 - B.x0) / 2 + .6) / (tf * camera.aspect)) * 1.04;
      out.set(cx, hh, cz - hh * .12); look.set(cx, 0, cz + .25); return;
    }
    let yaw = G.state === 'roll' && Math.hypot(b.vx, b.vz) > .3 ? Math.atan2(b.vz, b.vx) : G.aim;
    G.yaw += angDiff(G.yaw, yaw) * .08; yaw = G.yaw + G.camYaw;
    const d = innerWidth > innerHeight ? 3.6 : 4.2, hgt = innerWidth > innerHeight ? 2.2 : 2.8;
    out.set(b.x - Math.cos(yaw) * d, hgt, b.z - Math.sin(yaw) * d); look.set(b.x + Math.cos(yaw) * 1.4, 0, b.z + Math.sin(yaw) * 1.4);
  }
  const angDiff = (a, b) => { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; };
  function snapCam() { G.yaw = G.aim; camTarget(camPos, camLook); camera.position.copy(camPos); camera.lookAt(camLook); }
  $('bCam').onclick = e => { G.cam = G.cam === 'top' ? 'follow' : 'top'; if (e.detail) e.currentTarget.blur(); };

  /* ---------- Hauptschleife ---------- */
  let last = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (G.ball && (G.state === 'aim' || G.state === 'roll' || G.state === 'done')) update(dt);
    renderer.render(scene, camera);
  }
  function update(dt) {
    const h = curHole(), b = G.ball;
    G.t += dt;
    pollPad(dt); keyAim(dt);
    if (G.state === 'roll') {
      const n = Math.ceil(dt * 240); for (let i = 0; i < n && b.moving; i++) FG.step(h, b, G.t - dt + i / 240, 1 / 240);
      for (const e of b.events.splice(0)) { if (e === 'wall') sfx('wall'); if (e === 'bump') sfx('bump'); if (e === 'portal') { sfx('portal'); G.yaw = Math.atan2(b.vz, b.vx); } if (e === 'water') { sfx('water'); G.strokes++; toast('Platsch! 💦 +1 Strafschlag – zurück an den Ausgangspunkt'); } }
      if (b.inCup) finishPlayer(true);
      else if (!b.moving) { if (G.strokes >= FG.MAXSTROKES) finishPlayer(false); else { G.state = 'aim'; G.aim = Math.atan2(h.cup[1] - b.z, h.cup[0] - b.x); hud(); } }
    }
    // bewegliche Teile
    for (const { m, g } of movers) {
      if (m.k === 'rot') g.rotation.y = -m.sp * G.t;
      else { const S = FG.moverSegs(m, G.t).box; g.position.set(S.cx, g.position.y, S.cz); }
    }
    for (const e of extras) {
      if (e.k === 'spin') e.m.rotation.y += dt;
      else if (e.k === 'pulse') e.m.material.opacity = .25 + .2 * Math.sin(G.t * 5);
      else if (e.k === 'blink') e.m.visible = Math.sin(G.t * 4) > -.3;
      else if (e.k === 'sway') e.m.rotation.z = Math.sin(G.t * 1.2 + e.p) * .5;
      else if (e.k === 'slope') e.tex.offset.y = -G.t * .4;
      else if (e.k === 'snow') { const a = e.m.geometry.attributes.position; for (let i = 0; i < a.count; i++) { let y = a.getY(i) - dt * .5; if (y < 0) y = 6; a.setY(i, y); } a.needsUpdate = true; }
    }
    // Ball
    const sink = b.inCup ? -.12 : 0;
    ballMesh.position.set(b.x, FG.BALL + sink, b.z); ballMesh.rotation.x += b.vz * dt / FG.BALL; ballMesh.rotation.z -= b.vx * dt / FG.BALL;
    shadow.position.set(b.x + .03, .012, b.z + .03); shadow.visible = !b.inCup;
    cupFlag.position.y = Math.hypot(b.x - h.cup[0], b.z - h.cup[1]) < 1.2 && G.state === 'roll' ? .6 : 0;
    // Zielhilfe
    const aiming = G.state === 'aim';
    aimG.visible = aiming; const pw = aiming ? Math.max(G.power, .08) : 0;
    aimG.position.set(b.x, 0, b.z); aimG.rotation.y = -G.aim; aimG.scale.set(.4 + pw * 1.6, 1, 1);
    aimMat.color.setHSL((1 - G.power) * .33, 1, .55);
    dots.forEach((d, i) => { const k = (i + 1) * .25; d.visible = aiming && SET.help; d.position.set(b.x + Math.cos(G.aim) * k, .02, b.z + Math.sin(G.aim) * k); });
    $('power').classList.toggle('on', aiming && G.power > 0); $('powerFill').style.width = Math.round(G.power * 100) + '%';
    // Kamera
    camTarget(camPos, camLook); camera.position.lerp(camPos, Math.min(1, dt * 4)); const cl = new T3.Vector3(); camera.getWorldDirection(cl);
    const want = camLook.clone().sub(camera.position).normalize(); cl.lerp(want, Math.min(1, dt * 5)); camera.lookAt(camera.position.clone().add(cl));
  }

  /* ---------- Eingabe: Ziehen (Touch/Maus) ---------- */
  let lastInput = 'ptr';
  const cvs = renderer.domElement;
  function groundBasis() { const m = camera.matrixWorld.elements; let rx = m[0], rz = m[2], fx = -m[8], fz = -m[10]; const rl = Math.hypot(rx, rz) || 1, fl = Math.hypot(fx, fz) || 1; return { rx: rx / rl, rz: rz / rl, fx: fx / fl, fz: fz / fl }; }
  cvs.addEventListener('pointerdown', e => {
    if (G.state !== 'aim' || anyOv()) return; lastInput = 'ptr'; hud();
    G.drag = { x: e.clientX, y: e.clientY, aim0: G.aim }; try { cvs.setPointerCapture(e.pointerId); } catch (x) { }
  });
  cvs.addEventListener('pointermove', e => {
    if (!G.drag || G.state !== 'aim') return;
    const vx = e.clientX - G.drag.x, vy = e.clientY - G.drag.y, len = Math.hypot(vx, vy), ref = Math.min(innerWidth, innerHeight) * .34;
    if (len < 14) { G.power = 0; return; }
    const B = groundBasis(), dx = B.rx * -vx + B.fx * vy, dz = B.rz * -vx + B.fz * vy;
    G.aim = Math.atan2(dz, dx); G.power = Math.min(1, len / ref);
  });
  const ptrUp = () => { if (!G.drag) return; G.drag = null; if (G.power >= .05) shoot(G.power); else G.power = 0; };
  cvs.addEventListener('pointerup', ptrUp); cvs.addEventListener('pointercancel', () => { G.drag = null; G.power = 0; });
  cvs.addEventListener('wheel', e => { G.camYaw += e.deltaY * .002; }, { passive: true });

  /* ---------- Tastatur ---------- */
  const keys = new Set();
  addEventListener('keydown', e => {
    const ov = anyOv();
    if (ov || $('sMenu').classList.contains('on')) { if (e.key === 'Escape' && ov && ov.id !== 'ovEnd' && ov.id !== 'ovCard') { e.preventDefault(); ov.hidden = true; padNav(G.state === 'menu'); } return; }
    if (e.target && /INPUT/.test(e.target.tagName)) return;
    const k = e.key.toLowerCase();
    if (k === 'escape') { e.preventDefault(); openMenu(); return; }
    if (k === 'c') { G.cam = G.cam === 'top' ? 'follow' : 'top'; return; }
    if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown', 'a', 'd', ' ', 'q', 'e'].includes(k)) { e.preventDefault(); if (!keys.has(k)) keys.add(k); lastInput = 'key'; hud(); }
  });
  addEventListener('keyup', e => { const k = e.key.toLowerCase(); if (k === ' ' && keys.has(' ') && G.state === 'aim') shoot(G.power); keys.delete(k); });
  addEventListener('blur', () => keys.clear());
  function keyAim(dt) {
    if (G.state !== 'aim') return;
    if (keys.has('arrowleft') || keys.has('a')) G.aim -= dt * 1.3 * (keys.has('arrowdown') ? .3 : 1);
    if (keys.has('arrowright') || keys.has('d')) G.aim += dt * 1.3 * (keys.has('arrowdown') ? .3 : 1);
    if (keys.has('q')) G.camYaw -= dt * 1.5; if (keys.has('e')) G.camYaw += dt * 1.5;
    if (keys.has(' ')) charge(dt);
  }
  function charge(dt) { G.charge += dt * G.chargeDir / 1.3; if (G.charge >= 1) { G.charge = 1; G.chargeDir = -1; } if (G.charge <= 0) { G.charge = 0; G.chargeDir = 1; } G.power = G.charge; }

  /* ---------- Gamecontroller (im Spiel eigene Steuerung; Menüs über ../gamepad.js) ---------- */
  const prev = {};
  function padNav(on) { if (window.EasyGamesPad && EasyGamesPad.enabled) try { EasyGamesPad.enabled(on); } catch (e) { } }
  function pollPad(dt) {
    const pads = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(p => p && p.connected) : [];
    for (const pad of pads) {
      const bt = i => !!(pad.buttons[i] && pad.buttons[i].pressed), pv = prev[pad.index] || {};
      const st = { a: bt(0), y: bt(3), start: bt(9), lb: bt(4), rb: bt(5) }; prev[pad.index] = st;
      if (st.start && !pv.start) { if (anyOv()) $('mGo').click(); else openMenu(); }
      if (anyOv()) continue;
      if (st.y && !pv.y) G.cam = G.cam === 'top' ? 'follow' : 'top';
      if (st.lb) G.camYaw -= dt * 1.6; if (st.rb) G.camYaw += dt * 1.6;
      if (G.state !== 'aim') continue;
      const x = Math.abs(pad.axes[0] || 0) > .2 ? pad.axes[0] : 0, y = Math.abs(pad.axes[1] || 0) > .2 ? pad.axes[1] : 0;
      if (x || y) { lastInput = 'pad'; const B = groundBasis(); if (Math.hypot(x, y) > .6) { const tgt = Math.atan2(B.rz * x + B.fz * -y, B.rx * x + B.fx * -y); G.aim += angDiff(G.aim, tgt) * Math.min(1, dt * 6); } else G.aim += x * dt * .8; }
      if (bt(14)) G.aim -= dt * .6; if (bt(15)) G.aim += dt * .6;
      if (st.a) { lastInput = 'pad'; charge(dt); } else if (pv.a && G.power > .05) shoot(G.power);
    }
  }
  addEventListener('gamepadconnected', () => { lastInput = 'pad'; toast('🎮 Controller verbunden – Stick zielt, A halten und loslassen'); if (G.ball) hud(); });

  /* ---------- Menüs ---------- */
  const anyOv = () => Array.from(document.querySelectorAll('.ov')).find(o => !o.hidden);
  function focusEl(el) { if (el && !('ontouchstart' in window && lastInput === 'ptr')) try { el.focus({ preventScroll: true }); } catch (e) { } }
  let setupPlayers = LS.get(P + 'names', ['Spieler 1']);
  function renderSetup() {
    $('pList').innerHTML = setupPlayers.map((n, i) => '<div class="pRow"><span class="dot" style="background:' + PCOL[i] + '"></span><input data-i="' + i + '" maxlength="14" value="' + esc(n) + '" aria-label="Name">' + (setupPlayers.length > 1 ? '<button class="rm" data-i="' + i + '" aria-label="Entfernen">✕</button>' : '') + '</div>').join('');
    $('bAddP').disabled = setupPlayers.length >= 4;
  }
  $('pList').addEventListener('input', e => { setupPlayers[+e.target.dataset.i] = e.target.value; });
  $('pList').addEventListener('click', e => { const b = e.target.closest('.rm'); if (b) { setupPlayers.splice(+b.dataset.i, 1); renderSetup(); } });
  $('bAddP').onclick = () => { if (setupPlayers.length < 4) { setupPlayers.push('Spieler ' + (setupPlayers.length + 1)); renderSetup(); } };
  $('course').onclick = e => { const b = e.target.closest('.chip'); if (!b) return; document.querySelectorAll('#course .chip').forEach(c => c.classList.toggle('on', c === b)); };
  $('bPlay').onclick = startGame;
  $('bHelp').onclick = () => { $('ovHelp').hidden = false; focusEl($('helpX')); }; $('helpX').onclick = () => { $('ovHelp').hidden = true; };
  $('bSet').onclick = () => { $('sSound').checked = SET.sound; $('sHelp').checked = SET.help; $('sLow').checked = SET.low; $('ovSet').hidden = false; focusEl($('setX')); };
  $('setX').onclick = () => { const low = SET.low; SET.sound = $('sSound').checked; SET.help = $('sHelp').checked; SET.low = $('sLow').checked; saveSet(); $('ovSet').hidden = true; if (low !== SET.low) location.reload(); };
  function openMenu() { if (G.state === 'menu') return; $('mSound').textContent = SET.sound ? '🔊 Ton an' : '🔇 Ton aus'; $('ovMenu').hidden = false; padNav(true); focusEl($('mGo')); }
  $('bMenu').onclick = e => { openMenu(); if (e.detail) e.currentTarget.blur(); };
  $('bCard').onclick = e => { if (G.state === 'aim' || G.state === 'roll') showCard(true); if (e.detail) e.currentTarget.blur(); };
  $('mGo').onclick = () => { $('ovMenu').hidden = true; padNav(false); };
  $('mSound').onclick = () => { SET.sound = !SET.sound; saveSet(); $('mSound').textContent = SET.sound ? '🔊 Ton an' : '🔇 Ton aus'; };
  $('mSkip').onclick = () => { $('ovMenu').hidden = true; padNav(false); if (G.state === 'aim' || G.state === 'roll') { G.ball.moving = false; finishPlayer(false); } };
  $('mQuit').onclick = () => { $('ovMenu').hidden = true; toMenu(); };
  $('endMenu').onclick = () => { $('ovEnd').hidden = true; toMenu(); };
  $('endAgain').onclick = () => { $('ovEnd').hidden = true; startGame(); };
  function toMenu() { G.state = 'menu'; $('hud').hidden = true; $('sMenu').classList.add('on'); padNav(true); renderSetup(); menuStat(); demoHole(); focusEl($('bPlay')); }
  function menuStat() { const st = LS.get(P + 'stats', {}), hs = LS.get(P + 'highscore', 0); $('menuStat').textContent = st.runden ? st.runden + ' Runden gespielt' + (st.bester ? ' · beste 18er-Runde ' + st.bester + ' Schläge (Par ' + FG.totalPar() + ')' : '') + (st.asse ? ' · ' + st.asse + '× Hole-in-One' : '') + (hs ? ' · Rekord ' + hs + ' Punkte' : '') : 'Par ' + FG.totalPar() + ' auf 18 Bahnen'; }
  let demoT = 0;
  function demoHole() { const i = (Math.random() * 18) | 0, h = FG.HOLES[i]; bounds = build(h, i + 1); G.ball = FG.newBall(h); G.cam = 'top'; ballMesh.position.set(h.tee[0], FG.BALL, h.tee[1]); aimG.visible = false; dots.forEach(d => { d.visible = false; }); camTarget(camPos, camLook); camera.position.copy(camPos); camera.lookAt(camLook); }
  (function demoLoop() { requestAnimationFrame(demoLoop); if (G.state !== 'menu') return; demoT += 1 / 60; const B = bounds; if (!B) return; const cx = (B.x0 + B.x1) / 2, cz = (B.z0 + B.z1) / 2, r = Math.max(B.x1 - B.x0, B.z1 - B.z0) * .75 + 3; camera.position.set(cx + Math.cos(demoT * .15) * r, r * .55, cz + Math.sin(demoT * .15) * r); camera.lookAt(cx, 0, cz); for (const { m, g } of movers) { if (m.k === 'rot') g.rotation.y = -m.sp * demoT; else { const S = FG.moverSegs(m, demoT).box; g.position.set(S.cx, g.position.y, S.cz); } } renderer.render(scene, camera); })();

  /* ---------- Start ---------- */
  if (window.self !== window.top) $('backLink').hidden = true;
  renderSetup(); menuStat(); demoHole(); requestAnimationFrame(frame);
  setTimeout(() => padNav(true), 400); focusEl($('bPlay'));
  addEventListener('visibilitychange', () => { if (document.hidden && (G.state === 'aim' || G.state === 'roll')) openMenu(); });
  window.FUNKGOLF = { state: () => ({ state: G.state, hole: G.holes[G.hi], hi: G.hi, pi: G.pi, strokes: G.strokes, ball: G.ball && { x: G.ball.x, z: G.ball.z, inCup: G.ball.inCup, moving: G.ball.moving }, aim: G.aim, scores: G.scores, t: G.t }), shootAt: (ang, p) => { G.aim = ang; shoot(p); }, goto: i => { G.hi = i; startHole(); }, cam: c => { G.cam = c; } }; // für Tests
})();
