'use strict';
/* 3D-Ansicht: Strecke, Karts, Items, Kameras und Splitscreen (Three.js r128). */
const View = (() => {
  const T = THREE, PI2 = Math.PI * 2;
  let hemi, sun, renderer, scene, tr = null, world = null, sky, karts = [], kmesh = [], logoTex = {}, logos = [], W = 1, H = 1, pr = 1;
  const cams = [], menuCam = { f: 0 };
  const wrap = a => { while (a > Math.PI) a -= PI2; while (a < -Math.PI) a += PI2; return a; };
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const KCOL = ['#00e5ff', '#ff2d95', '#ffd24a', '#7cff6a', '#8b5cf6', '#ff9a1f', '#e84118', '#ffffff'];
  const mats = {}, lam = (c, o) => { const k = c + (o ? JSON.stringify(o) : ''); return mats[k] || (mats[k] = new T.MeshLambertMaterial(Object.assign({ color: c }, o || {}))); };
  const bas = (c, o) => new T.MeshBasicMaterial(Object.assign({ color: c }, o || {}));
  const canvasTex = (w, h, draw, rep) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const x = new T.CanvasTexture(c); x.encoding = T.sRGBEncoding; x.anisotropy = 4; if (rep) { x.wrapS = x.wrapT = T.RepeatWrapping; } return x; };
  const logoMat = i => { const t = logoTex[i]; return t ? new T.MeshBasicMaterial({ map: t, transparent: true }) : bas(0x223355); };

  function init(canvas, lg) {
    renderer = new T.WebGLRenderer({ canvas, antialias: true, stencil: false, powerPreference: 'high-performance' }); if (renderer.debug) renderer.debug.checkShaderErrors = false; renderer.outputEncoding = T.sRGBEncoding; renderer.setScissorTest(true); renderer.autoClear = true;
    logos = lg || []; logos.forEach(l => { const x = new T.Texture(l.im); x.encoding = T.sRGBEncoding; x.anisotropy = 4; x.needsUpdate = true; logoTex[l.idx] = x; });
    scene = new T.Scene(); hemi = new T.HemisphereLight(0xcfd8ff, 0x405030, 0.75); scene.add(hemi); sun = new T.DirectionalLight(0xffffff, 0.8); sun.position.set(60, 120, 40); scene.add(sun);
    const sg = new T.SphereGeometry(900, 16, 10), cols = new Float32Array(sg.attributes.position.count * 3); sg.setAttribute('color', new T.BufferAttribute(cols, 3));
    sky = new T.Mesh(sg, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide, fog: false, depthWrite: false })); sky.renderOrder = -1; scene.add(sky);
    makeShared();
  }
  let boxMat, padMat, rocketGeo, mineGeo, boomMeshes = [], shared = {};
  function makeShared() {
    const qt = canvasTex(128, 128, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, h); ['#ff2d95', '#ffd24a', '#00e5ff', '#7cff6a'].forEach((c, i) => gr.addColorStop(i / 3, c)); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = '900 100px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('?', w / 2, h / 2 + 6); });
    boxMat = new T.MeshBasicMaterial({ map: qt, transparent: true, opacity: 0.92 });
    padMat = new T.MeshBasicMaterial({ map: canvasTex(128, 192, (g, w, h) => { g.fillStyle = '#10143a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#ffd24a'; g.lineWidth = 16; g.lineJoin = 'round'; for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(16, 150 - k * 52); g.lineTo(w / 2, 100 - k * 52); g.lineTo(w - 16, 150 - k * 52); g.stroke(); } }) });
    shared.boxGeo = new T.BoxGeometry(2.2, 2.2, 2.2); shared.wheelGeo = new T.CylinderGeometry(0.5, 0.5, 0.45, 12); shared.wheelGeo.rotateZ(Math.PI / 2);
    rocketGeo = new T.ConeGeometry(0.5, 2.4, 8); rocketGeo.rotateX(Math.PI / 2); mineGeo = new T.IcosahedronGeometry(1.3, 0);
    shared.sphere = new T.SphereGeometry(1, 12, 8);
    shared.dot = canvasTex(32, 32, (g, w, h) => { const r = g.createRadialGradient(16, 16, 0, 16, 16, 16); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.4, 'rgba(255,255,255,.8)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, w, h); });
  }

  // ------------------------------------------------------------------ Strecke bauen
  let skyGroup = null, dustCol = 0xcccccc; const anim = [], blinkers = [];
  function strip(a, b, y, vs, mat, wall, h) {
    const N = tr.N, pos = [], uv = [], idx = [];
    for (let i = 0; i <= N; i++) {
      const j = i % N, nx = tr.Nm[j * 2], nz = tr.Nm[j * 2 + 1], px = tr.P[j * 2], pz = tr.P[j * 2 + 1], v = i * 3 / vs;
      if (wall) { pos.push(px + nx * a, tr.height(j), pz + nz * a, px + nx * a, tr.height(j) + h, pz + nz * a); uv.push(0, v, 1, v); } else { pos.push(px + nx * a, tr.height(j) + y, pz + nz * a, px + nx * b, tr.height(j) + y, pz + nz * b); uv.push(0, v, 1, v); }
      if (i < N) { const k = i * 2; idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); }
    }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    const m = new T.Mesh(g, mat); m.frustumCulled = false; return m;
  }
  const instLam = new T.MeshLambertMaterial({ color: 0xffffff }), instBas = () => new T.MeshBasicMaterial({ color: 0xffffff });
  function inst(geo, mat, list) {
    if (!list.length) return null; const m = new T.InstancedMesh(geo, mat, list.length); m.instanceColor = new T.InstancedBufferAttribute(new Float32Array(list.length * 3), 3);
    const m4 = new T.Matrix4(), q = new T.Quaternion(), e = new T.Euler(), v = new T.Vector3(), s = new T.Vector3(), c = new T.Color();
    list.forEach((o, i) => { q.setFromEuler(e.set(o.rx || 0, o.ry || 0, o.rz || 0)); const sx = o.sx == null ? 1 : o.sx; m4.compose(v.set(o.x, o.y, o.z), q, s.set(sx, o.sy == null ? sx : o.sy, o.sz == null ? sx : o.sz)); m.setMatrixAt(i, m4); c.set(o.c || '#ffffff'); m.setColorAt(i, c); });
    m.frustumCulled = false; world.add(m); return m;
  }
  const G_ = {}, geoC = (k, f) => G_[k] || (G_[k] = f());
  const rr = (a, b) => a + Math.random() * (b - a), pk = a => a[Math.floor(Math.random() * a.length)];
  let CX = 0, CZ = 0, R0 = 300; const pr_ = { i: 0, f: 0, d: 0 };
  function clouds(n, tint, y0, y1) { for (let k = 0; k < n; k++) { const cl = new T.Group(); for (let j = 0; j < 4; j++) { const b = new T.Mesh(shared.sphere, bas(tint || 0xffffff, { fog: false })); b.scale.set(rr(26, 42), rr(12, 20), 18); b.position.set(j * 26 - 40, Math.random() * 6, Math.random() * 10); cl.add(b); } const a = Math.random() * PI2, r = rr(450, 750); cl.position.set(CX + Math.cos(a) * r, rr(y0 || 190, y1 || 280), CZ + Math.sin(a) * r); cl.rotation.y = a; world.add(cl); } }
  const wallTex = (th, d) => canvasTex(128, 32, (g, w, h) => {
    if (th === 'gruft') { g.fillStyle = d.wall[1]; g.fillRect(0, 0, w, h); g.strokeStyle = '#2a2f3a'; g.lineWidth = 2; for (let r = 0; r < 2; r++) for (let x = (r ? 0 : 16); x < w + 32; x += 32) g.strokeRect(x - 32, r * 16, 32, 16); for (let i = 0; i < 30; i++) { g.fillStyle = 'rgba(80,140,70,.35)'; g.fillRect(Math.random() * w, Math.random() * h, 8, 4); } return; }
    if (th === 'fantasia') { g.fillStyle = d.wall[1]; g.fillRect(0, 0, w, h); g.fillStyle = d.wall[0]; for (let x = -h; x < w; x += 24) { g.beginPath(); g.moveTo(x, h); g.lineTo(x + 12, h); g.lineTo(x + 12 + h, 0); g.lineTo(x + h, 0); g.fill(); } return; }
    g.fillStyle = d.wall[1]; g.fillRect(0, 0, w, h); g.fillStyle = d.wall[0]; for (let x = -h; x < w; x += 32) { g.beginPath(); g.moveTo(x, h); g.lineTo(x + 16, h); g.lineTo(x + 16 + h / 2, h / 2); g.lineTo(x + 16, 0); g.lineTo(x, 0); g.lineTo(x + h / 2, h / 2); g.fill(); } g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(0, h - 4, w, 4); }, true);


  // ------------------------------------------------------------------ Fahrbahn-Look je Welt: Untergrund, Markierungen, Curbs, Banden, Neon-Glow
  const SURF = { wiese: 'asphalt', strand: 'asphalt', gruft: 'cobble', fantasia: 'carpet', neon: 'neon', vulkan: 'basalt', eis: 'ice', dschungel: 'dirt', kosmos: 'neon', wueste: 'asphalt', regenbogen: 'neon', herzportal: 'neon', kristallsturm: 'ice', monsterfreunde: 'dirt', ahnenruinen: 'slab', drachenflug: 'slab', splitterwelten: 'neon', farbeninsel: 'tiles', zotik: 'dirt', taschi: 'cobble', aeru: 'neon', bunte: 'wood', leuchtfeuer: 'asphalt', sonnenhof: 'dirt', ricopoly: 'asphalt', wolken: 'cloud', huepf: 'asphalt' };
  const WALLS = { asphalt: 'rail', neon: 'neon', basalt: 'neon', ice: 'neon', cloud: 'neon', dirt: 'wood', cobble: 'stone', slab: 'stone', carpet: 'soft', tiles: 'soft', wood: 'rail' };
  const isNight = d => { const c = new T.Color(d.sky[1]), h = {}; c.getHSL(h); return h.l < 0.3; };
  const noiseFill = (g, w, h, base, amt, sat) => { const im = g.createImageData(w, h), b = new T.Color(base), D = im.data; for (let i = 0; i < w * h; i++) { const n = (Math.random() - 0.5) * amt + (Math.random() < 0.04 ? (Math.random() - 0.5) * amt * 2.2 : 0); D[i * 4] = clamp(b.r * 255 + n * (sat || 1), 0, 255); D[i * 4 + 1] = clamp(b.g * 255 + n, 0, 255); D[i * 4 + 2] = clamp(b.b * 255 + n, 0, 255); D[i * 4 + 3] = 255; } g.putImageData(im, 0, 0); };
  function roadTex(sf, d, night) {
    const S = 512, rc = d.road, acc = d.wall[0], acc2 = d.wall[1];
    const t = canvasTex(S, S, (g, w, h) => {
      const line = (x, col, lw, dash) => { g.fillStyle = col; if (!dash) g.fillRect(x - lw / 2, 0, lw, h); else for (let k = 0; k < 2; k++) g.fillRect(x - lw / 2, k * h / 2 + h * 0.08, lw, h * 0.26); };
      if (sf === 'asphalt') { noiseFill(g, w, h, rc, 34); g.fillStyle = 'rgba(0,0,0,.10)'; [0.3, 0.7].forEach(x => g.fillRect(w * x - 36, 0, 72, h)); for (let i = 0; i < 5; i++) { g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(Math.random() * w, Math.random() * h, 30 + Math.random() * 60, 20 + Math.random() * 50); } g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 1.5; for (let i = 0; i < 3; i++) { g.beginPath(); let x = Math.random() * w, y = Math.random() * h; g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (Math.random() - 0.5) * 30; y += 10 + Math.random() * 14; g.lineTo(x, y); } g.stroke(); } line(w * 0.035, '#f2f2ea', 9); line(w * 0.965, '#f2f2ea', 9); if (d.id === 'wueste' || d.id === 'dschungel') { line(w / 2 - 8, '#f5c227', 8); line(w / 2 + 8, '#f5c227', 8); } else line(w / 2, '#f2f2ea', 8, true); }
      else if (sf === 'neon') { const b = new T.Color(rc); g.fillStyle = rc; g.fillRect(0, 0, w, h); const tl = 64; for (let y = 0; y < h; y += tl) for (let x = 0; x < w; x += tl) { g.fillStyle = `rgba(255,255,255,${0.02 + Math.random() * 0.04})`; g.fillRect(x + 2, y + 2, tl - 4, tl - 4); } g.strokeStyle = 'rgba(255,255,255,.10)'; g.lineWidth = 2; for (let x = 0; x <= w; x += tl) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y <= h; y += tl) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } g.fillStyle = acc2; [[0.25, 0.2], [0.75, 0.7], [0.5, 0.45]].forEach(([x, y]) => { g.globalAlpha = 0.55; g.fillRect(w * x - 14, h * y - 6, 28, 12); }); g.globalAlpha = 1; const gr = g.createLinearGradient(0, 0, w * 0.1, 0); gr.addColorStop(0, acc); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w * 0.1, h); const gr2 = g.createLinearGradient(w, 0, w * 0.9, 0); gr2.addColorStop(0, acc); gr2.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr2; g.fillRect(w * 0.9, 0, w * 0.1, h); line(w * 0.03, '#ffffff', 6); line(w * 0.97, '#ffffff', 6); void b; }
      else if (sf === 'basalt') { noiseFill(g, w, h, rc, 40); g.strokeStyle = '#ff7a1a'; g.lineWidth = 3; g.shadowColor = '#ffb03a'; g.shadowBlur = 8; for (let i = 0; i < 7; i++) { g.beginPath(); let x = Math.random() * w, y = Math.random() * h; g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (Math.random() - 0.5) * 60; y += (Math.random() - 0.5) * 60; g.lineTo(x, y); } g.stroke(); } g.shadowBlur = 0; line(w * 0.035, acc2, 8); line(w * 0.965, acc2, 8); }
      else if (sf === 'ice') { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, rc); gr.addColorStop(0.5, new T.Color(rc).offsetHSL(0, 0, 0.08).getStyle()); gr.addColorStop(1, rc); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 1.5; for (let i = 0; i < 14; i++) { g.beginPath(); let x = Math.random() * w, y = Math.random() * h; g.moveTo(x, y); for (let k = 0; k < 4; k++) { x += (Math.random() - 0.5) * 80; y += (Math.random() - 0.5) * 80; g.lineTo(x, y); } g.stroke(); } for (let i = 0; i < 300; i++) { g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } line(w * 0.035, '#ffffff', 8); line(w * 0.965, '#ffffff', 8); line(w / 2, 'rgba(255,255,255,.7)', 6, true); }
      else if (sf === 'dirt') { noiseFill(g, w, h, new T.Color(rc).lerp(new T.Color('#8a6a44'), 0.55).getStyle(), 46, 1.2); g.fillStyle = 'rgba(0,0,0,.13)'; [0.32, 0.68].forEach(x => g.fillRect(w * x - 40, 0, 80, h)); for (let i = 0; i < 90; i++) { g.fillStyle = `rgba(${Math.random() < 0.5 ? '255,240,210' : '40,30,20'},.35)`; const r = 2 + Math.random() * 5; g.beginPath(); g.arc(Math.random() * w, Math.random() * h, r, 0, PI2); g.fill(); } const e = g.createLinearGradient(0, 0, w * 0.08, 0); e.addColorStop(0, 'rgba(70,120,40,.85)'); e.addColorStop(1, 'rgba(70,120,40,0)'); g.fillStyle = e; g.fillRect(0, 0, w * 0.08, h); const e2 = g.createLinearGradient(w, 0, w * 0.92, 0); e2.addColorStop(0, 'rgba(70,120,40,.85)'); e2.addColorStop(1, 'rgba(70,120,40,0)'); g.fillStyle = e2; g.fillRect(w * 0.92, 0, w * 0.08, h); }
      else if (sf === 'cobble' || sf === 'slab' || sf === 'tiles') { g.fillStyle = new T.Color(rc).offsetHSL(0, 0, -0.08).getStyle(); g.fillRect(0, 0, w, h); const cs = sf === 'cobble' ? 32 : sf === 'slab' ? 85 : 64; for (let y = 0, r = 0; y < h; y += cs, r++) for (let x = (r % 2) * cs / 2 - cs; x < w; x += cs) { const v = (Math.random() - 0.5) * (sf === 'tiles' ? 0.12 : 0.1); g.fillStyle = sf === 'tiles' ? new T.Color(d.props[(Math.random() * d.props.length) | 0]).lerp(new T.Color(rc), 0.55).getStyle() : new T.Color(rc).offsetHSL(0, 0, v).getStyle(); const m = sf === 'cobble' ? 3 : 2.5; if (sf === 'cobble') { g.beginPath(); g.roundRect ? g.roundRect(x + m, y + m, cs - m * 2, cs - m * 2, 8) : g.rect(x + m, y + m, cs - m * 2, cs - m * 2); g.fill(); } else g.fillRect(x + m, y + m, cs - m * 2, cs - m * 2); g.fillStyle = 'rgba(255,255,255,.07)'; g.fillRect(x + m, y + m, cs - m * 2, 3); } if (sf !== 'cobble') { line(w * 0.035, acc2, 8); line(w * 0.965, acc2, 8); } }
      else if (sf === 'carpet') { noiseFill(g, w, h, rc, 18); for (let y = 0; y < h; y += 4) { g.fillStyle = `rgba(255,255,255,${0.03 + (y % 8 ? 0 : 0.03)})`; g.fillRect(0, y, w, 2); } g.strokeStyle = acc; g.lineWidth = 6; g.globalAlpha = 0.5; for (let y = 32; y < h; y += 128) { g.beginPath(); for (let x = 0; x <= w; x += 16) g.lineTo(x, y + Math.sin(x / 32) * 12); g.stroke(); } g.globalAlpha = 1; line(w * 0.04, acc2, 14); line(w * 0.96, acc2, 14); }
      else if (sf === 'wood') { for (let y = 0; y < h; y += 32) { g.fillStyle = new T.Color('#b07a46').offsetHSL(0, 0, (Math.random() - 0.5) * 0.1).getStyle(); g.fillRect(0, y, w, 30); g.fillStyle = 'rgba(60,30,10,.6)'; g.fillRect(0, y + 30, w, 2); for (let k = 0; k < 6; k++) { g.fillStyle = 'rgba(80,40,10,.18)'; g.fillRect(0, y + 4 + Math.random() * 22, w, 1.5); } [0.2, 0.8].forEach(x => { g.fillStyle = '#5a3a1a'; g.beginPath(); g.arc(w * x + (y % 64 ? 40 : 0), y + 15, 3, 0, PI2); g.fill(); }); } line(w * 0.035, '#ffffff', 8); line(w * 0.965, '#ffffff', 8); }
      else if (sf === 'cloud') { const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.5, rc); gr.addColorStop(1, '#ffffff'); g.fillStyle = gr; g.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.arc(Math.random() * w, Math.random() * h, 10 + Math.random() * 30, 0, PI2); g.fill(); } line(w / 2, 'rgba(255,255,255,.9)', 8, true); }
    }, true);
    t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); return t;
  }
  const glowTex = () => shared.glow || (shared.glow = canvasTex(8, 64, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.55, 'rgba(255,255,255,.55)'); gr.addColorStop(0.62, 'rgba(255,255,255,1)'); gr.addColorStop(0.7, 'rgba(255,255,255,.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }));
  function buildSurface(d, th) {
    const sf = SURF[d.id] || 'asphalt', night = isNight(d), ws = WALLS[sf]; tr.surf = sf;
    const rm = sf === 'neon' || sf === 'cloud' ? new T.MeshLambertMaterial({ map: roadTex(sf, d, night), emissive: new T.Color(d.road).multiplyScalar(night ? 0.5 : 0.25) }) : new T.MeshLambertMaterial({ map: roadTex(sf, d, night) });
    world.add(strip(-tr.half, tr.half, 0.02, 20, rm));
    // Curbs mit Kante (hell/dunkel, leicht erhaben) – bei Erde/Holz eine Grasnarbe bzw. Planke
    const curbC = d.curb || (th === 'gruft' ? ['#8a8fa0', '#4a4f60'] : th === 'fantasia' ? ['#ff6ac8', '#ffffff'] : th === 'strand' ? ['#1a9ae0', '#ffffff'] : ['#e8412a', '#ffffff']);
    const curb = canvasTex(64, 128, (g, w, h) => { g.fillStyle = curbC[0]; g.fillRect(0, 0, w, h / 2); g.fillStyle = curbC[1]; g.fillRect(0, h / 2, w, h / 2); const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, 'rgba(0,0,0,.35)'); gr.addColorStop(0.25, 'rgba(255,255,255,.18)'); gr.addColorStop(0.5, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.25)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }, true);
    const rough = new T.Color(d.ground).offsetHSL(0, 0, 0.05).getStyle(), cm = sf === 'neon' || sf === 'cloud' ? bas(new T.Color(d.wall[0])) : new T.MeshLambertMaterial({ map: curb });
    [-1, 1].forEach(s => { if (sf !== 'dirt') world.add(strip(s > 0 ? tr.half : -tr.half - 1.3, s > 0 ? tr.half + 1.3 : -tr.half, 0.07, 6, sf === 'neon' || sf === 'cloud' ? cm : cm)); world.add(strip(s > 0 ? tr.half + (sf === 'dirt' ? 0 : 1.3) : -tr.wallD, s > 0 ? tr.wallD : -tr.half - (sf === 'dirt' ? 0 : 1.3), 0.01, 10, lam(rough))); });
    // Banden
    const H = ws === 'stone' ? 2.2 : ws === 'neon' ? 0.9 : ws === 'wood' ? 1.2 : ws === 'soft' ? 1.4 : 1.1;
    let wm;
    if (ws === 'rail') wm = new T.MeshLambertMaterial({ side: T.DoubleSide, map: canvasTex(128, 32, (g, w, h) => { g.fillStyle = 'rgba(0,0,0,0)'; g.clearRect(0, 0, w, h); const gr = g.createLinearGradient(0, 4, 0, 22); gr.addColorStop(0, '#f4f7fb'); gr.addColorStop(0.3, '#9aa4b4'); gr.addColorStop(0.55, '#e4e9f0'); gr.addColorStop(1, '#7a8494'); g.fillStyle = gr; g.fillRect(0, 4, w, 18); g.fillStyle = '#5a6272'; g.fillRect(0, 21, w, 2); [16, 80].forEach(x => { g.fillStyle = '#4a5262'; g.fillRect(x, 0, 8, h); g.fillStyle = '#d0d6e0'; g.beginPath(); g.arc(x + 4, 13, 2.5, 0, PI2); g.fill(); }); }, true), transparent: true, alphaTest: 0.5 });
    else if (ws === 'wood') wm = new T.MeshLambertMaterial({ side: T.DoubleSide, transparent: true, alphaTest: 0.5, map: canvasTex(128, 32, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = '#8a5a30'; g.fillRect(0, 6, w, 7); g.fillRect(0, 18, w, 7); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, 12, w, 1); g.fillRect(0, 24, w, 1); [10, 74].forEach(x => { g.fillStyle = '#6a4220'; g.fillRect(x, 0, 10, h); g.fillStyle = 'rgba(255,255,255,.15)'; g.fillRect(x, 0, 3, h); }); }, true) });
    else if (ws === 'neon') wm = new T.MeshLambertMaterial({ side: T.DoubleSide, color: new T.Color(d.wall[1]).lerp(new T.Color('#151828'), 0.75) });
    else if (ws === 'soft') wm = new T.MeshLambertMaterial({ side: T.DoubleSide, map: canvasTex(128, 32, (g, w, h) => { g.fillStyle = d.wall[0]; g.fillRect(0, 0, w, h); g.fillStyle = d.wall[1]; for (let x = 0; x < w; x += 32) g.fillRect(x, 0, 16, h); const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,.35)'); gr.addColorStop(0.4, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(0,0,0,.3)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }, true) });
    else wm = new T.MeshBasicMaterial({ map: wallTex(th === 'gruft' || ws === 'stone' ? 'gruft' : th, d), side: T.DoubleSide });
    [-1, 1].forEach(s => world.add(strip(s * tr.wallD, 0, 0, ws === 'rail' || ws === 'wood' ? 8 : 16, wm, true, H)));
    // Neon: leuchtende Röhre oben auf der Bande + weicher Lichtschein, dazu Leuchtlinien an der Fahrbahnkante
    if (ws === 'neon' || night) {
      const nc = new T.Color(ws === 'neon' ? d.wall[0] : d.wall[0]), nc2 = new T.Color(d.wall[1]);
      const tube = bas(nc.clone().offsetHSL(0, 0, 0.12), { fog: false }), glow = new T.MeshBasicMaterial({ map: glowTex(), color: nc, transparent: true, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide, fog: false, opacity: 0.85 });
      [-1, 1].forEach(s => { const t1 = strip(s * tr.wallD, 0, 0, 16, tube, true, 0.22); t1.position.y = H; world.add(t1); const gl = strip(s * tr.wallD, 0, 0, 16, glow, true, 2.6); gl.position.y = H - 1.5; gl.renderOrder = 2; world.add(gl);
        const el = strip(s > 0 ? tr.half - 0.15 : -tr.half - 0.15, s > 0 ? tr.half + 0.15 : -tr.half + 0.15, 0.09, 6, bas(nc2.clone().lerp(new T.Color('#ffffff'), 0.4), { fog: false })); world.add(el); });
    }
    if (ws === 'rail' || ws === 'wood') [-1, 1].forEach(s => world.add(strip(s * tr.wallD, 0, 0, 16, lam(ws === 'wood' ? '#5a3a1a' : '#3a404c', { side: T.DoubleSide }), true, 0.12)));
  }
  // Hintergrund-Silhouetten: zwei Ringe (nah/fern) mit Dunst – Tiefe ohne Zusatzgeometrie (2 Draw-Calls)
  const BACK = { wiese: 'hills', strand: 'sea', gruft: 'spooky', fantasia: 'castle', neon: 'city', vulkan: 'volcano', eis: 'peaks', dschungel: 'forest', kosmos: null, wueste: 'mesa', regenbogen: 'hills', herzportal: 'castle', kristallsturm: 'peaks', monsterfreunde: 'forest', ahnenruinen: 'spooky', drachenflug: 'peaks', splitterwelten: 'city', farbeninsel: 'sea', zotik: 'forest', taschi: 'hills', aeru: null, bunte: 'sea', leuchtfeuer: 'sea', sonnenhof: 'hills', ricopoly: 'city', wolken: null, huepf: 'city' };
  function backdrop(d) {
    const kind = BACK[d.id]; if (kind === undefined ? false : !kind) return; const k = kind || 'hills', night = isNight(d), fogC = new T.Color(d.fog), base = new T.Color(d.ground).offsetHSL(0, -0.1, night ? -0.05 : -0.12);
    [[760, 150, 0.68, 1], [640, 90, 0.38, 0]].forEach(([r, h, mix, far]) => {
      const col = base.clone().lerp(fogC, mix), tex = canvasTex(1024, 256, (g, w, hh) => { g.clearRect(0, 0, w, hh); g.fillStyle = col.getStyle(); const top = y => hh - y * hh; g.beginPath(); g.moveTo(0, hh);
        const P = (x, y) => g.lineTo(x, top(y));
        if (k === 'city') { let x = 0; while (x < w) { const bw = 20 + Math.random() * 46, bh = (far ? 0.35 : 0.2) + Math.random() * (far ? 0.6 : 0.45); P(x, bh); P(x + bw, bh); if (Math.random() < 0.3) { P(x + bw, bh + 0.12); P(x + bw + 3, bh + 0.12); P(x + bw + 3, bh); } x += bw; } }
        else if (k === 'mesa') { let x = 0; while (x < w) { const bw = 90 + Math.random() * 160, bh = (far ? 0.4 : 0.22) + Math.random() * 0.3; P(x, 0.05); P(x + 18, bh * 0.85); P(x + 26, bh); P(x + bw - 26, bh); P(x + bw - 18, bh * 0.85); P(x + bw, 0.05); x += bw + Math.random() * 120; P(x, 0.05); } }
        else if (k === 'forest') { for (let x = 0; x <= w; x += 6) { const y = (far ? 0.45 : 0.28) + Math.sin(x / 70) * 0.06 + Math.random() * 0.12; P(x, y); } }
        else if (k === 'sea') { for (let x = 0; x <= w; x += 8) P(x, (far ? 0.06 : 0.02) + Math.max(0, Math.sin(x / 140 + far * 2) * (far ? 0.16 : 0.05))); }
        else if (k === 'volcano') { for (let x = 0; x <= w; x += 8) { const c = x % 512, y = (far ? 0.25 : 0.12) + Math.max(0, 0.55 - Math.abs(c - 256) / 300) * (far ? 1 : 0.4) + Math.random() * 0.02; P(x, Math.min(y, far ? 0.7 : 0.4)); } }
        else { const amp = k === 'peaks' ? 0.7 : k === 'spooky' ? 0.35 : 0.3, sh = k === 'peaks' ? 1 : 0; let y = 0.3; for (let x = 0; x <= w; x += 8) { y += (Math.random() - 0.5) * (sh ? 0.09 : 0.03); y = clamp(y, 0.12, (far ? 0.25 : 0.12) + amp * (far ? 1 : 0.55)); const ww = Math.sin(x / (sh ? 60 : 160)) * (sh ? 0.18 : 0.08); P(x, clamp(y + ww, 0.05, 0.95)); } }
        P(w, 0); g.closePath(); g.fill();
        if (k === 'castle' || k === 'spooky') for (let i = 0; i < 4; i++) { const x = Math.random() * w, bh = (far ? 0.45 : 0.3) + Math.random() * 0.2; g.fillRect(x, top(bh), 14, bh * hh); g.beginPath(); g.moveTo(x - 4, top(bh)); g.lineTo(x + 7, top(bh + 0.12)); g.lineTo(x + 18, top(bh)); g.fill(); }
        if (k === 'peaks' && far) { g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(0, 0, w, hh * 0.42); g.globalCompositeOperation = 'source-over'; }
        if (night && (k === 'city') && !far) for (let i = 0; i < 700; i++) { const x = Math.random() * w, y = hh - Math.random() * hh * 0.6; const px = g.getImageData(x | 0, y | 0, 1, 1).data; if (px[3] > 0) { g.fillStyle = pk(['#ffd88a', '#8ae8ff', '#ff8ad0', '#ffffff']); g.fillRect(x, y, 2, 3); } }
        const hz = g.createLinearGradient(0, hh * 0.5, 0, hh); hz.addColorStop(0, 'rgba(0,0,0,0)'); hz.addColorStop(1, fogC.getStyle()); g.globalCompositeOperation = 'source-atop'; g.fillStyle = hz; g.fillRect(0, 0, w, hh); g.globalCompositeOperation = 'source-over';
      }); tex.wrapS = T.RepeatWrapping; tex.repeat.set(3, 1);
      const m = new T.Mesh(new T.CylinderGeometry(r, r, h, 48, 1, true), new T.MeshBasicMaterial({ map: tex, transparent: true, side: T.BackSide, fog: false, depthWrite: false })); m.position.y = h / 2 - 12; m.renderOrder = -1 + (far ? 0.1 : 0.2); m.rotation.y = Math.random() * PI2; skyGroup.add(m);
    });
  }
  function setTrack(track) {
    if (world) { scene.remove(world); world.traverse(o => { if (o.geometry && !o.userData.keep && !Object.values(G_).includes(o.geometry)) o.geometry.dispose(); }); }
    if (skyGroup) scene.remove(skyGroup); anim.length = 0; blinkers.length = 0; skidClear(); tr = track; const d = tr.def, th = d.theme || 'wiese'; world = new T.Group(); scene.add(world); skyGroup = new T.Group(); scene.add(skyGroup);
    let sx = 0, sz = 0; for (let i = 0; i < tr.N; i++) { sx += tr.P[i * 2]; sz += tr.P[i * 2 + 1]; } CX = sx / tr.N; CZ = sz / tr.N; R0 = 0; for (let i = 0; i < tr.N; i++) R0 = Math.max(R0, Math.hypot(tr.P[i * 2] - CX, tr.P[i * 2 + 1] - CZ));
    scene.background = new T.Color(d.sky[0]); scene.fog = new T.Fog(d.fog, d.fogR[0], d.fogR[1]); const L = d.light; hemi.intensity = L[0]; sun.intensity = L[1]; sun.color.set(L[2]); hemi.groundColor.set(L[3]); hemi.color.set(th === 'gruft' ? '#8aa0ff' : th === 'fantasia' ? '#fff0ff' : '#cfd8ff');
    const cA = new T.Color(d.sky[0]), cB = new T.Color(d.sky[1]), cC = new T.Color(d.sky[2]), pa = sky.geometry.attributes.position, ca = sky.geometry.attributes.color, c = new T.Color();
    for (let i = 0; i < pa.count; i++) { const y = pa.getY(i) / 900; if (y > 0.25) c.copy(cB).lerp(cA, clamp((y - 0.25) / 0.6, 0, 1)); else c.copy(cC).lerp(cB, clamp((y + 0.1) / 0.35, 0, 1)); ca.setXYZ(i, c.r, c.g, c.b); } ca.needsUpdate = true;
    const gtex = canvasTex(128, 128, (g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { const v = 200 + Math.random() * 55 | 0; g.fillStyle = `rgba(${v},${v},${v},.5)`; g.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 5, 2 + Math.random() * 5); } }, true); gtex.repeat.set(90, 90);
    const ground = new T.Mesh(new T.PlaneGeometry(3000, 3000), new T.MeshLambertMaterial({ color: d.ground, map: gtex })); ground.rotation.x = -Math.PI / 2; ground.position.y = -0.1; world.add(ground);
    buildSurface(d, th); backdrop(d);
    // Start/Ziel
    const p0 = { x: tr.P[0], z: tr.P[1] }, th0 = Math.atan2(tr.T[0], tr.T[1]);
    const chk = canvasTex(256, 32, (g, w, h) => { for (let x = 0; x < 16; x++) for (let y = 0; y < 2; y++) { g.fillStyle = (x + y) % 2 ? '#fff' : '#111'; g.fillRect(x * 16, y * 16, 16, 16); } });
    const line = new T.Mesh(new T.PlaneGeometry(tr.W, 3), new T.MeshBasicMaterial({ map: chk })); line.position.set(p0.x, 0.06 + tr.height(0), p0.z); line.userData.keep = true; line.rotation.order = 'YXZ'; line.rotation.x = -Math.PI / 2; line.rotation.y = th0 + Math.PI; world.add(line);
    const gantry = new T.Group(); gantry.userData.keep = true; gantry.position.set(p0.x, tr.height(0), p0.z); gantry.rotation.y = th0;
    [-1, 1].forEach(s => { const p = new T.Mesh(new T.BoxGeometry(1, 9, 1), lam('#1a1d33')); p.position.set(s * (tr.wallD - 0.5), 4.5, 0); gantry.add(p); });
    const beam = new T.Mesh(new T.BoxGeometry(tr.wallD * 2, 2.6, 0.8), lam('#10143a')); beam.position.y = 9; gantry.add(beam);
    const bn = new T.Mesh(new T.PlaneGeometry(tr.wallD * 2 - 1, 2.2), new T.MeshBasicMaterial({ map: canvasTex(512, 64, (g, w, h) => { g.fillStyle = '#10143a'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffd24a'; g.font = '900 40px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('KART RUSH · WELTENTOUR · START / ZIEL', w / 2, h / 2 + 2); }) })); bn.position.set(0, 9, 0.45); gantry.add(bn); const bn2 = bn.clone(); bn2.rotation.y = Math.PI; bn2.position.z = -0.45; gantry.add(bn2); world.add(gantry);
    // Sichtbare Brückenkonstruktionen unter erhöhten Fahrbahnen.
    // Brückenkante unter erhöhter Fahrbahn (wirkt wie ein echtes Deck statt einer dünnen Folie)
    if (tr.hilly) [-1, 1].forEach(s => world.add(strip(s * tr.wallD, 0, 0, 16, lam(d.wall[0], { side: T.DoubleSide }), true, -1.8)));
    if (d.mechanic || (tr.hilly && d.world !== 'wolken' && d.world !== 'aeru')) {
      const pillarGeo=new T.CylinderGeometry(1.25,1.6,1,8), supportMat=lam(d.wall[0]);
      for(let j=0;j<tr.N;j+=22){
        const h=tr.height(j);
        if(h<3||(tr.crossPt&&Math.hypot(tr.P[j*2]-tr.crossPt.x,tr.P[j*2+1]-tr.crossPt.z)<tr.wallD*2.2))continue;
        const g=new T.Group();
        for(const side of [-1,1]){
          const pillar=new T.Mesh(pillarGeo,supportMat);
          pillar.position.set(tr.P[j*2]+tr.Nm[j*2]*side*(tr.half-1),h/2,tr.P[j*2+1]+tr.Nm[j*2+1]*side*(tr.half-1));
          pillar.scale.set(1,Math.max(0.1,h),1);
          g.add(pillar);
        }
        world.add(g);
      }
    }
    // Reklametafeln mit Sender-Logos
    const nb = 16; for (let k = 0; k < nb; k++) { const i = Math.floor(tr.N * (k + 0.3) / nb), s = k % 2 ? 1 : -1, nx = tr.Nm[i * 2], nz = tr.Nm[i * 2 + 1], lid = logos.length ? logos[k % logos.length].idx : 0, g = new T.Group(); g.position.set(tr.P[i * 2] + nx * s * (tr.wallD + 5), 0, tr.P[i * 2 + 1] + nz * s * (tr.wallD + 5)); g.rotation.y = Math.atan2(-nx * s, -nz * s);
      [-2.6, 2.6].forEach(x => { const p = new T.Mesh(new T.BoxGeometry(0.5, 7, 0.5), lam('#1a1d33')); p.position.set(x, 3.5, 0); g.add(p); }); const bd = new T.Mesh(new T.BoxGeometry(6.4, 4.2, 0.4), lam('#0a0f2a')); bd.position.y = 6; g.add(bd); const lg = new T.Mesh(new T.PlaneGeometry(4, 4), logoMat(lid)); lg.position.set(0, 6, 0.22); g.add(lg); world.add(g); }
    tourLandscape(d); clearRoads();
    // Rennrelevante Weltenobjekte – an denselben Streckenkoordinaten wie in Sim.
    if (d.mechanic === 'portal' || d.mechanic === 'shards') {
      [0.18, 0.57].forEach((fraction, idx) => {
        const i = Math.floor(tr.N * fraction), g = new T.Group(); g.userData.keep = true;
        g.position.set(tr.P[i * 2], 0, tr.P[i * 2 + 1]);
        g.rotation.y = Math.atan2(tr.T[i * 2], tr.T[i * 2 + 1]);
        const ring = new T.Mesh(new T.TorusGeometry(5.5, 0.65, 8, 24),
          new T.MeshBasicMaterial({ color: idx ? 0xffbd72 : 0x76eaff, transparent: true, opacity: 0.8 }));
        ring.position.y = 5.8; g.add(ring);
        const core = new T.Mesh(new T.CircleGeometry(5.1, 24),
          new T.MeshBasicMaterial({ color: idx ? 0xf16ba4 : 0x8076ef, transparent: true, opacity: 0.25, side: T.DoubleSide, depthWrite: false }));
        core.position.y = 5.8; g.add(core); world.add(g);
        anim.push(time => { ring.rotation.z = time * (idx ? -0.35 : 0.35); core.material.opacity = 0.19 + 0.12 * Math.sin(time * 3 + idx); });
      });
    }
    if (d.mechanic === 'safari' || d.mechanic === 'dragon' || d.mechanic === 'island') {
      [0.16, 0.38, 0.62, 0.84].forEach((fraction, idx) => {
        const i = Math.floor(tr.N * fraction), side = idx % 2 ? 1 : -1;
        const x = tr.P[i*2] + tr.Nm[i*2] * side * 5.2;
        const z = tr.P[i*2+1] + tr.Nm[i*2+1] * side * 5.2;
        const creature = new T.Group();
        const mat = new T.MeshLambertMaterial({ color: ['#ffb05e','#a1ea8b','#b890ed','#6ddddd'][idx] });
        const face = new T.MeshLambertMaterial({ color: 0x22243d });
        const body = new T.Mesh(new T.IcosahedronGeometry(1.25, 1), mat);
        body.position.y = 1.55; creature.add(body);
        const head = new T.Mesh(new T.SphereGeometry(0.9, 8, 6), mat);
        head.position.set(0, 2.7, 0.55); creature.add(head);
        [-1,1].forEach(side => {
          const eye = new T.Mesh(new T.SphereGeometry(0.13, 6, 4), face);
          eye.position.set(side*0.3, 2.85, 1.3); creature.add(eye);
        });
        creature.position.set(x, 0, z); creature.userData.keep = true; world.add(creature);
        const seed = idx * 1.7;
        anim.push(time => { creature.position.x = x + Math.sin(time * 0.7 + seed) * 2.2; creature.position.z = z + Math.cos(time * 0.7 + seed) * 2.2; creature.children[0].rotation.y = time * 0.4; });
      });
    }
    world.children.forEach(o => { if (o.userData.blink) blinkers.push(o); }); dustCol = new T.Color(d.ground).lerp(new T.Color(0xffffff), th === 'gruft' || th === 'neon' ? 0.25 : 0.4).getHex();
  }

  // ------------------------------------------------------------------ Weltentour-Kulissen (Welten der easygames)
  // Alles instanziert (wenige Draw-Calls, handytauglich), feste Zufallsfolge je Strecke, Animationen über anim[].
  // Enge Layouts (Kamm, Serpentinen, Acht): Deko, die auf einer anderen Fahrbahn landen würde, entfällt.
  const ro_ = { i: 0, f: 0, d: 0 };
  const offRoad = (geo, x, y, z, sx, sz) => { if (geo === 'arc' || y > 14) return true; tr.nearest(x, z, -1, ro_); return Math.abs(ro_.d) > tr.wallD + 0.5 + Math.min(8, Math.max(sx || 0, sz || 0) * 0.5); };
  function clearRoads() { const rm = []; world.children.forEach(o => { if (o.userData.keep || (o.position.x === 0 && o.position.z === 0) || o.position.y > 14) return; tr.nearest(o.position.x, o.position.z, -1, ro_); if (Math.abs(ro_.d) < tr.wallD + 2) rm.push(o); }); rm.forEach(o => world.remove(o)); }
  function tourLandscape(d) {
    let sd = 0; for (const ch of d.id) sd = (sd * 31 + ch.charCodeAt(0)) >>> 0;
    const R = () => { sd = (sd + 0x6D2B79F5) >>> 0; let t = sd; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const ra = (a, b) => a + R() * (b - a), pick = a => a[Math.floor(R() * a.length)];
    const G = {
      box: geoC('b', () => new T.BoxGeometry(1, 1, 1)), cyl: geoC('cyl8', () => new T.CylinderGeometry(1, 1, 1, 8)), cone: geoC('cone7', () => new T.ConeGeometry(1, 1, 7)),
      pyr: geoC('pyr4', () => { const g = new T.ConeGeometry(1, 1, 4); g.rotateY(Math.PI / 4); return g; }), sph: geoC('ico1', () => new T.IcosahedronGeometry(1, 1)),
      tor: geoC('tor', () => new T.TorusGeometry(1, 0.12, 6, 24)), arc: geoC('arc', () => new T.TorusGeometry(1, 0.06, 5, 28, Math.PI)), prism: geoC('prism', () => { const g = new T.CylinderGeometry(1, 1, 1, 3); g.rotateZ(Math.PI / 2); return g; })
    };
    const lists = {}, L = (geo, glow) => { const k = geo + (glow ? '*' : ''); return lists[k] || (lists[k] = []); };
    const put = (geo, c, x, y, z, sx, sy, sz, ry, glow, rx, rz) => offRoad(geo, x, y, z, sx, sz) && L(geo, glow).push({ x, y, z, sx, sy: sy == null ? sx : sy, sz: sz == null ? sx : sz, ry: ry || 0, rx: rx || 0, rz: rz || 0, c });
    // Positionen: entlang der Strecke (Abstand zur Mauer) oder frei verteilt
    const pr = { i: 0, f: 0, d: 0 };
    const along = (n, o0, o1, fn) => { for (let j = 0; j < n; j++) { const i = Math.floor((j + R()) * tr.N / n) % tr.N, s = R() < 0.5 ? -1 : 1, off = tr.wallD + ra(o0, o1); fn(tr.P[i * 2] + tr.Nm[i * 2] * s * off, tr.P[i * 2 + 1] + tr.Nm[i * 2 + 1] * s * off, i, s, j); } };
    const free = (n, margin, r0, r1, fn) => { for (let j = 0, t = 0; j < n && t < n * 30; t++) { const a = R() * PI2, r = ra(r0, r1), x = CX + Math.cos(a) * r, z = CZ + Math.sin(a) * r; tr.nearest(x, z, -1, pr); if (Math.abs(pr.d) > tr.wallD + margin) { fn(x, z, j, a, r); j++; } } };
    const face = i => Math.atan2(tr.T[i * 2], tr.T[i * 2 + 1]);
    const tree = (x, z, h, leaf, trunk, round) => { put('cyl', trunk || '#7a5230', x, h * 0.25, z, h * 0.07, h * 0.5); if (round) put('sph', leaf, x, h * 0.72, z, h * 0.34, h * 0.3); else { put('cone', leaf, x, h * 0.62, z, h * 0.3, h * 0.7); put('cone', leaf, x, h * 0.95, z, h * 0.2, h * 0.45); } };
    const lamp = (x, z, h, col) => { put('cyl', '#2a2d3a', x, h / 2, z, 0.18, h); put('sph', col, x, h + 0.4, z, 0.65, 0.65, 0.65, 0, true); };
    const points = (n, col, size, spread, y0, y1, drift) => {
      const pos = new Float32Array(n * 3); for (let k = 0; k < n; k++) { const a = R() * PI2, r = Math.sqrt(R()) * spread; pos[k * 3] = CX + Math.cos(a) * r; pos[k * 3 + 1] = ra(y0, y1); pos[k * 3 + 2] = CZ + Math.sin(a) * r; }
      const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3));
      const p = new T.Points(g, new T.PointsMaterial({ color: col, size, map: shared.dot, transparent: true, depthWrite: false, blending: T.AdditiveBlending, fog: false, sizeAttenuation: true }));
      p.frustumCulled = false; world.add(p); if (drift) anim.push(t => { p.position.y = Math.sin(t * 0.6) * drift; p.rotation.y = t * 0.01; }); return p;
    };
    const land = (col, extra) => world.add(strip(-tr.wallD - extra, tr.wallD + extra, -0.06, 30, lam(col)));
    const sun = (col, el, size) => { const m = new T.Mesh(shared.sphere, bas(col, { fog: false })); const a = 0.7; m.position.set(CX + Math.cos(a) * 820, el, CZ + Math.sin(a) * 820); m.scale.setScalar(size); skyGroup.add(m); return m; };
    const grp = (x, y, z) => { const g = new T.Group(); g.position.set(x, y, z); world.add(g); return g; };
    const mesh = (parent, geo, col, x, y, z, sx, sy, sz, glow) => { const m = new T.Mesh(G[geo], glow ? bas(col) : lam(col)); m.position.set(x, y, z); m.scale.set(sx, sy == null ? sx : sy, sz == null ? sx : sz); parent.add(m); return m; };
    const W = d.world || d.id, P = d.props;
    if (W === 'zotik') {
      free(110, 8, 0, R0 + 360, (x, z) => tree(x, z, ra(9, 20), pick(['#2e7d32', '#1b5e20', '#388e3c', '#43a047']), null, R() < 0.3)); along(110, 6, 46, (x, z) => tree(x, z, ra(8, 18), pick(['#2e7d32', '#1b5e20', '#388e3c', '#43a047']), null, R() < 0.35));
      along(26, 6, 30, (x, z) => { const h = ra(3, 7); put('cyl', '#f4ecd8', x, h / 2, z, h * 0.16, h); put('sph', pick(['#e53935', '#d84315', '#8e24aa']), x, h, z, h * 0.55, h * 0.28); for (let q = 0; q < 3; q++) put('sph', '#ffffff', x + ra(-h, h) * 0.3, h * 1.18, z + ra(-h, h) * 0.3, h * 0.07); });
      along(30, 1.5, 3, (x, z) => lamp(x, z, 4.5, '#ffcc66'));
      for (let k = 0; k < 7; k++) { const a = k / 7 * PI2 + 0.3, r = R0 + ra(90, 180), x = CX + Math.cos(a) * r, z = CZ + Math.sin(a) * r, h = ra(30, 55); put('cyl', '#9e9e9e', x, h / 2, z, 7, h); put('cone', pick(['#1e88e5', '#c62828', '#6a1b9a']), x, h + 7, z, 9, 14); put('box', pick(['#ffd54f', '#e53935']), x + 2, h + 18, z, 4, 2.4, 0.2); if (k % 2) { put('box', '#8d8d8d', x + 14, h * 0.3, z, 18, h * 0.6, 6); } }
      along(8, 4, 12, (x, z, i) => { const g = grp(x, 2.6, z); g.rotation.y = face(i) + Math.PI / 2; [['#ffffff', 2.2], ['#e53935', 1.7], ['#ffffff', 1.1], ['#ffd54f', 0.55]].forEach(([c, r], q) => { const m = mesh(g, 'cyl', c, 0, 0, q * 0.06, r, 0.1, r); m.rotation.x = Math.PI / 2; }); mesh(g, 'cyl', '#6d4c41', 0, -1.6, -0.3, 0.15, 2.4, 0.15); });
      points(160, 0xfff2a8, 1.4, R0 + 120, 1, 10, 0.8);
    } else if (W === 'taschi') {
      const L16 = ['#ff5252', '#ff9800', '#ffeb3b', '#8bc34a', '#00e676', '#1de9b6', '#00e5ff', '#448aff', '#7c4dff', '#e040fb', '#ff4081', '#ffffff', '#ffd180', '#b2ff59', '#84ffff', '#ea80fc'];
      const orbs = [];
      for (let k = 0; k < 16; k++) { const i = Math.floor((k + 0.5) * tr.N / 16), s = k % 2 ? 1 : -1, x = tr.P[i * 2] + tr.Nm[i * 2] * s * (tr.wallD + 7), z = tr.P[i * 2 + 1] + tr.Nm[i * 2 + 1] * s * (tr.wallD + 7); put('cyl', '#3a2f6a', x, 6, z, 0.5, 12); put('tor', '#ffd54a', x, 13, z, 2.2, 2.2, 2.2, face(i)); const o = new T.Mesh(shared.sphere, bas(L16[k], { transparent: true, opacity: 0.9 })); o.position.set(x, 13, z); o.scale.setScalar(1.6); world.add(o); orbs.push(o); }
      anim.push(t => orbs.forEach((o, k) => { o.scale.setScalar(1.45 + Math.sin(t * 2.2 + k) * 0.25); }));
      free(46, 40, R0 * 0.2, R0 + 320, (x, z) => { const s = ra(18, 40); put('sph', pick(['#5a8f4a', '#4f7f45', '#6a9a50']), x, -s * 0.55, z, s, s * 0.7, s); });
      free(70, 6, 0, R0 + 260, (x, z) => tree(x, z, ra(7, 14), pick(['#3e7a46', '#5a3a8a', '#2e6a5a']), '#4a3424', true)); along(90, 6, 40, (x, z) => tree(x, z, ra(6, 12), pick(['#3e7a46', '#6a4a9a', '#2e6a5a', '#8a5aa8']), '#4a3424', true));
      along(40, 4, 24, (x, z) => { put('cyl', '#3a8a3a', x, 0.6, z, 0.06, 1.2); put('sph', pick(['#ffd54a', '#ff8a65', '#4dd0e1', '#e040fb']), x, 1.3, z, 0.35, 0.35, 0.35, 0, true); });
      along(24, 2, 3.5, (x, z) => lamp(x, z, 3.5, pick(L16)));
      const tas = [];
      along(12, 3, 9, (x, z, i, s, j) => { const c = pick(['#ffb74d', '#81d4fa', '#f48fb1', '#aed581', '#ce93d8', '#fff176']), g = grp(x, 0, z); g.rotation.y = face(i) + (s > 0 ? -1.2 : 1.2); mesh(g, 'sph', c, 0, 1.3, 0, 1.3, 1.15, 1.2); [-1, 1].forEach(e => { mesh(g, 'cone', c, e * 0.7, 2.6, 0, 0.35, 0.9, 0.35).rotation.z = -e * 0.4; mesh(g, 'sph', '#1a1a2a', e * 0.45, 1.6, 1.05, 0.16); mesh(g, 'sph', '#ffffff', e * 0.4, 1.68, 1.15, 0.06); }); mesh(g, 'sph', '#ff8a80', 0, 1.1, 1.18, 0.12); tas.push([g, j]); });
      anim.push(t => tas.forEach(([g, j]) => { g.position.y = Math.abs(Math.sin(t * 3 + j)) * 0.9; }));
      points(260, 0xffe9a0, 1.6, R0 + 160, 1, 14, 1.2); points(400, 0xffffff, 3, 900, 220, 420);
    } else if (W === 'aeru') {
      world.add(strip(-tr.wallD - 3, tr.wallD + 3, -1.6, 20, lam('#8a7a9a')));
      const isles = [];
      free(34, 30, R0 * 0.1, R0 + 420, (x, z, j) => { const s = ra(10, 32), y = ra(-6, 70), g = grp(x, y, z); mesh(g, 'cone', '#7a6a8a', 0, -s * 0.8, 0, s, s * 1.6, s).rotation.x = Math.PI; mesh(g, 'cyl', pick(['#8ae0a0', '#a0e8b0', '#7ad090']), 0, 0.2, 0, s, 1.4, s); for (let q = 0; q < 3; q++) { const tx = ra(-s, s) * 0.6, tz = ra(-s, s) * 0.6; mesh(g, 'cyl', '#7a5230', tx, 2.5, tz, 0.4, 4); mesh(g, 'sph', pick(['#ffd08a', '#c0a0ff', '#8ae0a0']), tx, 5.5, tz, 2.6, 2.2); } isles.push([g, y, j]); });
      anim.push(t => isles.forEach(([g, y, j]) => { g.position.y = y + Math.sin(t * 0.5 + j) * 2.2; }));
      for (let k = 0; k < 6; k++) { const a = k / 6 * PI2, r = R0 + ra(160, 260), x = CX + Math.cos(a) * r, z = CZ + Math.sin(a) * r, h = ra(90, 160); put('cone', '#5a4a6a', x, h / 2 - 20, z, ra(30, 50), h); put('sph', '#ffd08a', x, h - 14, z, 6, 6, 6, 0, true); }
      along(10, -tr.wallD, -tr.wallD, (x, z, i) => put('arc', pick(['#ffe08a', '#c0a0ff', '#8ae0ff']), tr.P[i * 2], tr.height(i), tr.P[i * 2 + 1], tr.wallD + 4, tr.wallD + 4, tr.wallD + 4, face(i), true));
      points(600, 0xffffff, 2.4, 950, 120, 500); points(140, 0xffd0f0, 1.8, R0 + 200, 4, 40, 3);
    } else if (W === 'bunte') {
      land(d.land, 70); world.add(strip(tr.wallD + 70, tr.wallD + 86, -0.05, 30, lam('#f2dc9a'))); world.add(strip(-tr.wallD - 86, -tr.wallD - 70, -0.05, 30, lam('#f2dc9a')));
      const cols = ['#ff5a8a', '#ffd24a', '#4ac8ff', '#7cff9a', '#b07aff', '#ff8a3a'];
      along(30, 14, 50, (x, z, i) => { const w = ra(7, 12), h = ra(6, 11), ry = face(i); put('box', pick(cols), x, h / 2, z, w, h, w * 0.8, ry); put('pyr', pick(['#e53935', '#3949ab', '#fb8c00']), x, h + w * 0.35, z, w * 0.78, w * 0.7, w * 0.62, ry); put('box', '#5a3a2a', x, 1.4, z, 1.6, 2.8, w * 0.82, ry); });
      along(46, 4, 66, (x, z) => { const h = ra(8, 13), lean = ra(-0.25, 0.25); put('cyl', '#a67a44', x, h / 2, z, 0.45, h, 0.45, 0, false, 0, lean); for (let q = 0; q < 5; q++) { const a = q / 5 * PI2; put('sph', pick(['#2fa84f', '#3fbf5a']), x + Math.cos(a) * 2.2 - lean * h * 0.5, h + 0.2, z + Math.sin(a) * 2.2, 2.4, 0.5, 1.1, -a); } });
      free(12, 120, R0 + 100, R0 + 360, (x, z) => { const g = grp(x, 0, z); g.rotation.y = R() * PI2; mesh(g, 'box', pick(['#ffffff', '#ff5a8a', '#ffd24a']), 0, 0.8, 0, 3, 1.6, 8); mesh(g, 'cyl', '#8a6a4a', 0, 4.5, 0, 0.15, 7); mesh(g, 'cone', '#ffffff', 0, 4.5, 1.2, 2, 6, 0.1); anim.push(t => { g.position.y = Math.sin(t * 1.3 + x) * 0.3; }); });
      { const i = Math.floor(tr.N * 0.72), x = tr.P[i * 2] + tr.Nm[i * 2] * (tr.wallD + 40), z = tr.P[i * 2 + 1] + tr.Nm[i * 2 + 1] * (tr.wallD + 40); for (let q = 0; q < 5; q++) put('cyl', q % 2 ? '#ffffff' : '#e53935', x, q * 5 + 2.5, z, 3 - q * 0.25, 5); put('sph', '#fff59d', x, 27, z, 2.4, 2.4, 2.4, 0, true); }
      { const i = Math.floor(tr.N * 0.3), x = tr.P[i * 2] + tr.Nm[i * 2] * -(tr.wallD + 26), z = tr.P[i * 2 + 1] + tr.Nm[i * 2 + 1] * -(tr.wallD + 26), g = grp(x, 0, z); g.rotation.y = face(i); mesh(g, 'box', '#ffe0f0', 0, 6, 0, 16, 12, 12); mesh(g, 'pyr', '#ff5a8a', 0, 15, 0, 12, 6, 9); mesh(g, 'sph', '#a0703a', 0, 18.5, 0, 3); mesh(g, 'sph', '#a0703a', -2.2, 20.6, 0, 1); mesh(g, 'sph', '#a0703a', 2.2, 20.6, 0, 1); }
      const bub = []; for (let k = 0; k < 26; k++) { const m = new T.Mesh(shared.sphere, new T.MeshBasicMaterial({ color: pick(['#bfefff', '#ffd0f0', '#fff6b0']), transparent: true, opacity: 0.35, depthWrite: false })); const a = R() * PI2, r = R0 * ra(0.2, 1.1); m.userData = { x: CX + Math.cos(a) * r, z: CZ + Math.sin(a) * r, o: R() * 30, s: ra(0.8, 2.2) }; m.scale.setScalar(m.userData.s); world.add(m); bub.push(m); }
      anim.push(t => bub.forEach(m => { const u = m.userData, y = (t * 2.2 + u.o) % 36; m.position.set(u.x + Math.sin(t + u.o) * 2, y, u.z); }));
    } else if (W === 'leuchtfeuer') {
      land(d.land, 60);
      free(150, 5, 0, R0 + 120, (x, z) => { tr.nearest(x, z, -1, pr); if (Math.abs(pr.d) < tr.wallD + 58) put('cone', pick(['#8a9a5a', '#7a8a4a', '#a0a86a']), x, 0.9, z, 0.7, 1.8); });
      along(26, 4, 30, (x, z, i) => { const ry = face(i) + Math.PI * (R() < 0.5 ? 0 : 1); put('box', '#ffffff', x, 1.4, z, 2.4, 2.8, 1.8, ry); put('box', pick(['#d0302a', '#2a6ad0', '#2aa060']), x, 2.9, z, 2.5, 0.5, 1.9, ry); });
      along(12, 26, 54, (x, z, i) => { const ry = face(i), w = ra(7, 10); put('box', '#a8443a', x, 3, z, w, 6, w * 0.8, ry); put('prism', '#4a3a3a', x, 6 + w * 0.2, z, w * 0.62, w * 1.02, w * 0.62, ry + Math.PI / 2); });
      { const i = Math.floor(tr.N * 0.1), off = tr.wallD + 34, x = tr.P[i * 2] + tr.Nm[i * 2] * off, z = tr.P[i * 2 + 1] + tr.Nm[i * 2 + 1] * off;
        for (let q = 0; q < 7; q++) put('cyl', q % 2 ? '#ffffff' : '#d0302a', x, q * 6 + 3, z, 5 - q * 0.35, 6); put('cyl', '#2a2a3a', x, 44, z, 3, 3); put('cone', '#d0302a', x, 48, z, 3.6, 4);
        put('sph', '#fff3b0', x, 44, z, 2.2, 2.2, 2.2, 0, true);
        const beam = new T.Mesh(geoC('beam', () => { const g = new T.ConeGeometry(14, 160, 16, 1, true); g.translate(0, -80, 0); g.rotateZ(Math.PI / 2); return g; }), new T.MeshBasicMaterial({ color: 0xfff3b0, transparent: true, opacity: 0.16, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide }));
        beam.position.set(x, 44, z); world.add(beam); anim.push(t => { beam.rotation.y = t * 0.9; }); }
      free(20, 70, R0 + 70, R0 + 200, (x, z) => { for (let q = 0; q < 6; q++) put('cyl', '#6a4a2a', x + q * 3, 1, z, 0.35, 3); });
      sun('#ffb060', 40, 70);
      points(200, 0xffd8a0, 2, 900, 200, 400);
    } else if (W === 'sonnenhof') {
      free(46, 45, R0 * 0.1, R0 + 300, (x, z) => { const w = ra(25, 45), l = ra(25, 45), ry = R() * PI2, c = pick(['#e8c84a', '#d8b03a', '#6aa83a', '#8a5a3a', '#9ad04a']); put('box', c, x, -0.04, z, w, 0.08, l, ry); if (c === '#8a5a3a' || c === '#6aa83a') for (let q = -2; q <= 2; q++) put('box', '#5a8a2a', x + Math.cos(ry) * q * w * 0.18, 0.5, z - Math.sin(ry) * q * w * 0.18, 1.2, 0.8, l * 0.9, ry); });
      along(60, 8, 40, (x, z) => { const h = ra(2.6, 3.6); put('cyl', '#3a8a2a', x, h / 2, z, 0.12, h); put('cyl', '#f4c430', x, h, z, 0.75, 0.25, 0.75, 0, false, Math.PI / 2.4); put('sph', '#6a3a1a', x, h, z + 0.12, 0.35); });
      along(40, 5, 30, (x, z) => put('cyl', '#e8c060', x, 1.2, z, 1.2, 2.2, 1.2, R() * PI2, false, Math.PI / 2));
      along(7, 24, 50, (x, z, i) => { const ry = face(i), w = ra(12, 18); put('box', '#b0302a', x, 5, z, w, 10, w * 0.75, ry); put('prism', '#5a2a2a', x, 10 + w * 0.22, z, w * 0.5, w * 1.05, w * 0.5, ry + Math.PI / 2); put('box', '#ffffff', x, 3.5, z, w * 0.3, 7, w * 0.77, ry); });
      for (let k = 0; k < 2; k++) { const i = Math.floor(tr.N * (0.2 + k * 0.5)), s = k ? 1 : -1, off = tr.wallD + 30, x = tr.P[i * 2] + tr.Nm[i * 2] * s * off, z = tr.P[i * 2 + 1] + tr.Nm[i * 2 + 1] * s * off, g = grp(x, 0, z);
        g.rotation.y = face(i); mesh(g, 'cyl', '#f0e0c0', 0, 9, 0, 4, 18, 4); mesh(g, 'cone', '#8a3a2a', 0, 20, 0, 5, 6); const rot = new T.Group(); rot.position.set(0, 16, 4.5); g.add(rot); for (let q = 0; q < 4; q++) { const b = mesh(rot, 'box', '#f8f0e0', 0, 0, 0, 1.6, 15, 0.3); b.geometry = geoC('blade', () => { const gg = new T.BoxGeometry(1, 1, 1); gg.translate(0, 0.5, 0); return gg; }); b.rotation.z = q * Math.PI / 2; }
        anim.push(t => { rot.rotation.z = t * 0.8; }); }
      free(60, 10, 0, R0 + 260, (x, z) => tree(x, z, ra(8, 14), pick(['#4a9a3a', '#5aaa4a', '#3a8a2a']), null, true));
      along(140, 0.6, 0.6, (x, z) => put('box', '#8a6a4a', x, 0.7, z, 0.3, 1.4, 0.3));
      along(10, 10, 30, (x, z) => { const ry = R() * PI2; put('box', '#ffffff', x, 1.4, z, 1.6, 1.4, 2.6, ry); put('box', '#ffffff', x + Math.sin(ry) * 1.6, 1.9, z + Math.cos(ry) * 1.6, 1, 1, 1.1, ry); put('box', '#2a2a2a', x, 1.6, z, 1.62, 0.6, 0.8, ry); for (const [a, b] of [[-0.5, -0.9], [0.5, -0.9], [-0.5, 0.9], [0.5, 0.9]]) put('box', '#ffffff', x + Math.cos(ry) * a + Math.sin(ry) * b, 0.4, z - Math.sin(ry) * a + Math.cos(ry) * b, 0.3, 0.8, 0.3); });
      sun('#fff2b0', 260, 40); clouds(12);
    } else if (W === 'ricopoly') {
      const fac = h => geoC('fac' + h, () => { const g = new T.BoxGeometry(1, 1, 1), uv = g.attributes.uv; for (let k = 0; k < uv.count; k++) uv.setXY(k, uv.getX(k) * 3, uv.getY(k) * h / 6); return g; });
      const win = canvasTex(64, 64, (g, w, h) => { g.fillStyle = '#1a1c28'; g.fillRect(0, 0, w, h); for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = Math.random() < 0.55 ? (Math.random() < 0.7 ? '#ffe9a8' : '#a8d8ff') : '#2a2e40'; g.fillRect(x * 16 + 3, y * 16 + 3, 10, 9); } }, true);
      const facMat = new T.MeshLambertMaterial({ color: 0xffffff, map: win, emissive: 0xffffff, emissiveMap: win, emissiveIntensity: 0.9 });
      const towers = { 24: [], 48: [], 84: [] };
      along(120, 10, 120, (x, z, i) => { const hk = pick([24, 24, 48, 48, 84]), w = ra(9, 16), h = hk * ra(0.85, 1.15); towers[hk].push({ x, y: h / 2, z, sx: w, sy: h, sz: w * ra(0.7, 1.2), ry: face(i), c: pick(['#ffffff', '#d8e0ff', '#ffe0c8', '#c8ffe8']) }); });
      Object.keys(towers).forEach(hk => inst(fac(+hk), facMat, towers[hk]));
      along(36, 3, 9, (x, z, i) => { const c = pick(P), ry = face(i); if (R() < 0.35) { put('box', '#d02a2a', x, 3, z, 6, 6, 4, ry); } else { put('box', '#2aa04a', x, 1.8, z, 3.4, 3.6, 3.4, ry); put('pyr', '#1a7a3a', x, 4.4, z, 2.6, 1.8, 2.6, ry); } put('box', c, x, 0.2, z, 7, 0.4, 5, ry); });
      along(40, 1.2, 1.6, (x, z) => lamp(x, z, 7, '#ffd890'));
      along(14, 4, 8, (x, z, i) => { const ry = face(i) + Math.PI / 2; put('cyl', '#3a3d4a', x, 4, z, 0.3, 8); put('box', pick(['#ff2d95', '#00e5ff', '#ffd24a', '#7cff6a']), x, 9, z, 7, 3, 0.4, ry, true); });
      { const g = grp(CX, 18, CZ); const dice = mesh(g, 'box', '#ffffff', 0, 0, 0, 14, 14, 14); for (const [a, b, c] of [[0, 0, 7.1], [0, 7.1, 0], [7.1, 0, 0], [-4, 4, 7.1], [4, -4, 7.1]]) mesh(g, 'sph', '#d02a2a', a, b, c, 1.4); anim.push(t => { g.rotation.set(t * 0.3, t * 0.45, 0); g.position.y = 18 + Math.sin(t) * 2; }); void dice; }
      points(500, 0xffffff, 2, 950, 220, 480);
    } else if (W === 'wolken') {
      free(130, 12, 0, R0 + 420, (x, z) => { const s = ra(10, 26), n = 3 + Math.floor(R() * 3); for (let q = 0; q < n; q++) put('sph', pick(['#ffffff', '#f4f8ff', '#eaf2ff']), x + ra(-s, s), ra(-4, 3), z + ra(-s, s) * 0.6, s * ra(0.5, 0.9), s * ra(0.3, 0.5), s * ra(0.5, 0.8)); });
      for (let j = 0; j < tr.N; j += 26) { const h = tr.height(j); if (h < 3) continue; put('sph', '#ffffff', tr.P[j * 2], h - 2.5, tr.P[j * 2 + 1], tr.half + 6, 3.4, tr.half + 4); }
      const plats = [];
      free(36, 14, 0, R0 + 260, (x, z, j) => { const y = ra(4, 40), g = grp(x, y, z), c = pick(['#7cd36a', '#a0703a', '#7ac8ff', '#ff9ad0']); mesh(g, 'box', c, 0, 0, 0, ra(8, 14), 1.4, ra(4, 7)); if (j % 3 === 0) { mesh(g, 'cyl', '#c0c8d8', 0, 1.2, 0, 0.6, 1.4); mesh(g, 'cyl', '#ff4a4a', 0, 2, 0, 1, 0.3); } if (j % 4 === 1) mesh(g, 'cyl', '#3a8aff', 0, 1.1, 0, 2.2, 0.4); plats.push([g, y, j, j % 5 === 0]); });
      anim.push(t => plats.forEach(([g, y, j, mv]) => { g.position.y = y + Math.sin(t * 0.8 + j) * 1.5; if (mv) g.position.x += Math.sin(t * 0.7 + j) * 0.05; }));
      const balloons = []; for (let k = 0; k < 16; k++) { const a = R() * PI2, r = R0 * ra(0.3, 1.2), g = grp(CX + Math.cos(a) * r, 0, CZ + Math.sin(a) * r); mesh(g, 'sph', pick(['#ff4a4a', '#ffd24a', '#4ac8ff', '#7cff6a', '#ff9ad0']), 0, 0, 0, 2, 2.5, 2); mesh(g, 'cyl', '#ffffff', 0, -4, 0, 0.04, 6); balloons.push([g, R() * 60]); }
      anim.push(t => balloons.forEach(([g, o]) => { g.position.y = ((t * 3 + o) % 90) - 5; }));
      for (let k = 0; k < 2; k++) { const a = k * Math.PI + 0.6, r = R0 + 120, x = CX + Math.cos(a) * r, z = CZ + Math.sin(a) * r; ['#ff4a4a', '#ff9a1f', '#ffe14a', '#4ad04a', '#3a8aff', '#8a4aff'].forEach((c, q) => put('arc', c, x, -5, z, 90 - q * 3.4, 90 - q * 3.4, 40, a + Math.PI / 2, true)); }
      sun('#fff8d0', 300, 46);
    } else if (W === 'huepf') {
      free(130, 8, 0, R0 + 320, (x, z) => { const h = ra(5, 10); put('box', '#7a4a2a', x, h * 0.3, z, 1.2, h * 0.6, 1.2); put('box', pick(['#3aa83a', '#4ac84a', '#2a8a2a']), x, h * 0.75, z, h * 0.45, h * 0.45, h * 0.45); });
      along(26, 16, 60, (x, z, i) => { const w = ra(8, 14), h = ra(6, 14), ry = face(i), c = pick(['#ffffff', '#ffd24a', '#ff8a8a', '#8ac8ff']); put('box', c, x, h / 2, z, w, h, w, ry); put('box', pick(['#d03a3a', '#3a5ad0', '#4a4a4a']), x, h + 1, z, w + 1, 2, w + 1, ry); });
      along(30, 3, 10, (x, z, i) => { const ry = face(i), c = pick(['#ff4a4a', '#4a8aff', '#ffd24a', '#ffffff', '#4ad04a']), big = R() < 0.25; if (big) { put('box', '#e0e0e0', x, 2.4, z, 3, 3.8, 8, ry); put('box', c, x + Math.sin(ry) * 4.6, 1.8, z + Math.cos(ry) * 4.6, 3, 2.6, 2.4, ry); } else { put('box', c, x, 1, z, 2.4, 1.2, 4.2, ry); put('box', '#bfe8ff', x, 2, z, 2.1, 1, 2.2, ry); } });
      { const i = Math.floor(tr.N * 0.56), ry = face(i), x = tr.P[i * 2], z = tr.P[i * 2 + 1], g = grp(x, 0, z); g.userData.keep = true; g.rotation.y = ry; mesh(g, 'box', '#3a9ae8', 0, 0.05, 0, 170, 0.3, 34);
        const logs = []; for (let q = 0; q < 10; q++) { const lg = mesh(g, 'box', '#8a5a2a', 0, 0.6, ra(-12, 12), ra(6, 10), 1, 1.6); logs.push([lg, q * 17 - 85, q % 2 ? 1 : -1]); }
        for (let q = 0; q < 16; q++) mesh(g, 'cyl', '#4ac84a', ra(-80, 80) + (q % 2 ? 0 : 0), 0.3, ra(-14, 14), 1.4, 0.2, 1.4);
        anim.push(t => logs.forEach(([lg, o, dir]) => { lg.position.x = ((o + t * 9 * dir) % 170 + 255) % 170 - 85; })); }
      { const a = 1.1, r = R0 + 90, x = CX + Math.cos(a) * r, z = CZ + Math.sin(a) * r, g = grp(x, 0, z); g.rotation.y = -a; mesh(g, 'box', '#5a4a3a', 0, 0.15, 0, 4, 0.3, 1600); const train = new T.Group(); g.add(train); ['#d03a3a', '#ffd24a', '#3a8aff', '#4ad04a'].forEach((c, q) => { mesh(train, 'box', c, 0, 2.4, q * 13, 4, 4, 12); mesh(train, 'box', '#2a2a2a', 0, 0.6, q * 13, 3.6, 1, 10); }); anim.push(t => { train.position.z = ((t * 40) % 1800) - 900; }); }
      clouds(10);
    } else if (W === 'wiese') {
      // Funkturm-Wiese: Sendemasten mit Warnlichtern, Windräder, Heuballen, Schafe, Blumenwiese
      for (let k = 0; k < 5; k++) { const a = k / 5 * PI2 + 0.5, r = R0 + ra(60, 140), x = CX + Math.cos(a) * r, z = CZ + Math.sin(a) * r, h = ra(60, 90); for (let q = 0; q < 6; q++) put('cyl', q % 2 ? '#ffffff' : '#e8412a', x, h * (q + 0.5) / 6, z, 1.6 - q * 0.18, h / 6); put('sph', '#ff3030', x, h + 1, z, 1.2, 1.2, 1.2, 0, true); }
      const rot = []; for (let k = 0; k < 6; k++) { const a = k / 6 * PI2 + 0.1, r = R0 + ra(150, 260), x = CX + Math.cos(a) * r, z = CZ + Math.sin(a) * r; put('cyl', '#f2f2f2', x, 22, z, 1.1, 44); const g = grp(x, 44, z); g.rotation.y = -a + Math.PI / 2; const hub = mesh(g, 'sph', '#ffffff', 0, 0, 1.5, 1.4); [0, 1, 2].forEach(q => { const b = mesh(hub, 'box', '#ffffff', 0, 6, 0, 0.9, 12, 0.3); b.position.set(Math.sin(q * 2.094) * 6, Math.cos(q * 2.094) * 6, 0); b.rotation.z = -q * 2.094; }); rot.push(hub); }
      anim.push(t => rot.forEach((h, k) => { h.rotation.z = t * (0.8 + k * 0.07); }));
      along(40, 10, 50, (x, z, i) => { const ry = face(i) + Math.PI / 2; put('cyl', '#e8c64a', x, 1.3, z, 1.3, 2.6, 1.3, ry, false, Math.PI / 2); });
      free(40, 12, 0, R0 + 120, (x, z) => { put('sph', '#ffffff', x, 1.1, z, 1.4, 1, 1.9); put('sph', '#2a2a2a', x, 1.4, z + 1.5, 0.6); });
      along(90, 4, 60, (x, z) => tree(x, z, ra(7, 12), pick(['#3a9a3a', '#4cae3a', '#2e8a2e']), null, true));
      along(220, 1, 40, (x, z) => put('sph', pick(['#ffd24a', '#ffffff', '#ff6ab8', '#8ab8ff']), x, 0.3, z, 0.35));
      clouds(12);
    } else if (W === 'strand') {
      // Sonnen-Strand: Meer auf der einen Seite, Palmen, Sonnenschirme, Surfbretter, Rettungsturm, Segelboote
      { const sea = new T.Mesh(new T.PlaneGeometry(3000, 3000), new T.MeshLambertMaterial({ color: 0x2aa8e0, transparent: true, opacity: 0.85 })); sea.rotation.x = -Math.PI / 2; sea.position.set(CX, -0.03, CZ + R0 * 0.55 + 1500); world.add(sea); anim.push(t => { sea.position.y = -0.03 + Math.sin(t * 0.8) * 0.02; }); }
      along(70, 4, 30, (x, z) => { const h = ra(9, 14), lean = ra(-0.25, 0.25); put('cyl', '#9a6a3a', x, h / 2, z, 0.35, h, 0.35, 0, false, lean); for (let q = 0; q < 5; q++) put('cone', '#2e9a3a', x + Math.cos(q * 1.26) * 2.4, h, z + Math.sin(q * 1.26) * 2.4, 0.9, 4.5, 0.9, q * 1.26, false, Math.PI / 2.3); });
      along(36, 6, 24, (x, z) => { const c = pick(['#ff4a4a', '#ffd24a', '#3ab0ff', '#ff8ac8']); put('cyl', '#ffffff', x, 1.6, z, 0.12, 3.2); put('cone', c, x, 3.4, z, 2.4, 1); put('box', pick(['#ffffff', '#ffd24a', '#3ab0ff']), x + 2, 0.2, z, 1.2, 0.2, 2.8); });
      along(16, 8, 20, (x, z, i) => put('box', pick(['#ff7a2a', '#2ad0ff', '#ffe14a']), x, 1.6, z, 0.7, 3.4, 0.25, face(i), false, 0.2));
      { const i = Math.floor(tr.N * 0.35), x = tr.P[i * 2] + tr.Nm[i * 2] * (tr.wallD + 18), z = tr.P[i * 2 + 1] + tr.Nm[i * 2 + 1] * (tr.wallD + 18); [[-1.5, -1.5], [1.5, -1.5], [-1.5, 1.5], [1.5, 1.5]].forEach(([a, b]) => put('cyl', '#ffffff', x + a, 3, z + b, 0.2, 6)); put('box', '#e8412a', x, 7, z, 4.4, 2.6, 4.4); put('pyr', '#ffffff', x, 9.3, z, 3.4, 2); }
      for (let k = 0; k < 6; k++) { const x = CX + ra(-R0, R0), z = CZ + R0 * 0.55 + ra(140, 420), g = grp(x, 0, z); mesh(g, 'box', '#ffffff', 0, 0.8, 0, 3, 1.6, 9); mesh(g, 'prism', '#ffffff', 0, 6, 0.5, 0.15, 9, 4).rotation.y = Math.PI / 2; anim.push(t => { g.position.y = Math.sin(t + k) * 0.25; g.rotation.z = Math.sin(t * 0.7 + k) * 0.05; }); }
      sun('#fff2a0', 160, 60); clouds(10);
    } else if (W === 'gruft') {
      // Geistergruft: Grabsteine, kahle Bäume, Gruften, Kürbisse, schwebende Irrlichter, Eisenzäune
      along(140, 3, 50, (x, z, i) => { const ry = face(i) + ra(-0.3, 0.3); if (R() < 0.5) { put('box', '#7a7f90', x, 1.1, z, 1.4, 2.2, 0.4, ry); put('cyl', '#7a7f90', x, 2.2, z, 0.7, 0.4, 0.7, ry, false, Math.PI / 2); } else { put('box', '#6a6f80', x, 1.4, z, 0.3, 2.8, 0.3, ry); put('box', '#6a6f80', x, 2, z, 1.6, 0.3, 0.3, ry); } });
      free(50, 8, 0, R0 + 200, (x, z) => { const h = ra(8, 15); put('cyl', '#2a2030', x, h / 2, z, 0.5, h); for (let q = 0; q < 4; q++) put('cyl', '#2a2030', x + Math.cos(q * 1.6) * 1.6, h * (0.6 + q * 0.08), z + Math.sin(q * 1.6) * 1.6, 0.18, h * 0.35, 0.18, q * 1.6, false, 0.9); });
      along(8, 20, 40, (x, z, i) => { const ry = face(i), g = grp(x, 0, z); g.rotation.y = ry; mesh(g, 'box', '#5a5f70', 0, 4, 0, 10, 8, 8); mesh(g, 'prism', '#3a3f50', 0, 9.5, 0, 4, 10.4, 4).rotation.y = Math.PI / 2; mesh(g, 'box', '#120a20', 0, 3, 4.05, 3, 5, 0.1); mesh(g, 'sph', '#9ab0ff', 0, 7, 4.2, 0.6, 0.6, 0.6, true); });
      along(40, 2, 14, (x, z) => { put('sph', '#ff8a1a', x, 0.8, z, 1, 0.8, 1); put('cyl', '#3a6a2a', x, 1.7, z, 0.12, 0.5); });
      { const wisp = []; for (let k = 0; k < 18; k++) { const m = new T.Mesh(shared.sphere, bas(pick([0x9ab0ff, 0x7affc8, 0xc89aff]), { transparent: true, opacity: 0.8 })); const i = Math.floor(R() * tr.N), s = R() < 0.5 ? 1 : -1; m.userData = { x: tr.P[i * 2] + tr.Nm[i * 2] * s * (tr.wallD + ra(4, 20)), z: tr.P[i * 2 + 1] + tr.Nm[i * 2 + 1] * s * (tr.wallD + ra(4, 20)), o: R() * 9 }; m.scale.setScalar(0.7); m.position.set(m.userData.x, 20, m.userData.z); world.add(m); wisp.push(m); } anim.push(t => wisp.forEach(m => { const u = m.userData; m.position.set(u.x + Math.sin(t * 0.7 + u.o) * 3, 3 + Math.sin(t * 1.3 + u.o) * 1.2, u.z + Math.cos(t * 0.6 + u.o) * 3); })); }
      { const m = new T.Mesh(shared.sphere, bas(0xe8eaff, { fog: false })); m.position.set(CX - 500, 260, CZ - 600); m.scale.setScalar(40); skyGroup.add(m); }
      points(220, 0x9ab0ff, 1.2, R0 + 160, 1, 12, 0.6);
    } else if (W === 'fantasia') {
      // Fantasia-Land: Zuckerland mit Riesenlollis, Pilzhäusern, Märchenschloss und Ballons
      along(40, 6, 40, (x, z, i) => { const h = ra(6, 12), c = pick(['#ff6ac8', '#ffd24a', '#6ad0ff', '#8aff8a']); put('cyl', '#ffffff', x, h / 2, z, 0.25, h); put('cyl', c, x, h + 1.8, z, 2.2, 0.6, 2.2, face(i), false, Math.PI / 2); put('cyl', '#ffffff', x, h + 1.8, z, 1.1, 0.65, 1.1, face(i), false, Math.PI / 2); });
      along(30, 10, 50, (x, z) => { const h = ra(5, 10); put('cyl', '#fff4e0', x, h / 2, z, h * 0.22, h); put('sph', pick(['#ff4a8a', '#a07aff', '#ffa040']), x, h, z, h * 0.6, h * 0.35); put('box', '#8a5a3a', x, 1.2, z + h * 0.22, 1.2, 2.2, 0.2); });
      { const a = 2.2, r = R0 + 120, x = CX + Math.cos(a) * r, z = CZ + Math.sin(a) * r; put('box', '#ffe8f4', x, 14, z, 40, 28, 30); [[-20, -15], [20, -15], [-20, 15], [20, 15]].forEach(([a2, b]) => { put('cyl', '#ffd0ec', x + a2, 22, z + b, 5, 44); put('cone', '#ff6ac8', x + a2, 50, z + b, 7, 12); }); put('cyl', '#ffffff', x, 38, z, 8, 22); put('cone', '#a07aff', x, 56, z, 10, 16); put('sph', '#ffd24a', x, 66, z, 2, 2, 2, 0, true); }
      { const bal = []; for (let k = 0; k < 16; k++) { const m = new T.Mesh(shared.sphere, lam(pick(['#ff4a8a', '#ffd24a', '#4ad0ff', '#8aff6a', '#c08aff']))); m.userData = { x: CX + ra(-R0, R0), z: CZ + ra(-R0, R0), o: R() * 20 }; m.scale.set(3, 3.6, 3); world.add(m); bal.push(m); } anim.push(t => bal.forEach(m => { const u = m.userData; m.position.set(u.x, 30 + ((t * 3 + u.o * 4) % 80), u.z); })); }
      free(60, 20, 0, R0 + 260, (x, z) => { const s = ra(10, 22); put('sph', pick(['#9ae8b0', '#ffd0ec', '#d0c0ff']), x, -s * 0.5, z, s, s * 0.7, s); });
      clouds(14, 0xfff0ff);
    } else if (W === 'neon') {
      // Neon-City: Hochhäuser mit Leuchtfenstern, Leuchtreklamen, Hologramm-Ringe, Straßenlaternen
      free(120, 14, R0 * 0.1, R0 + 300, (x, z) => { const w = ra(14, 28), h = ra(25, 90); put('box', pick(['#141a3a', '#1a1030', '#0e1a2a']), x, h / 2, z, w, h, w); for (let q = 1; q < 5; q++) put('box', pick(['#00e5ff', '#ff2d95', '#7cff6a', '#ffd24a']), x, h * q / 5, z, w + 0.3, 0.5, w + 0.3, 0, true); });
      along(40, 3, 10, (x, z, i) => { const ry = face(i); put('cyl', '#2a2a40', x, 4, z, 0.2, 8); put('box', pick(['#ff2d95', '#00e5ff', '#ffd24a']), x, 8.2, z, 2.6, 0.5, 0.5, ry, true); });
      along(14, 12, 24, (x, z, i) => { const ry = face(i) + Math.PI / 2; put('box', '#0a0a1a', x, 9, z, 10, 6, 0.6, ry); put('box', pick(['#ff2d95', '#00e5ff', '#7cff6a', '#c08aff']), x, 9, z, 9, 5, 0.7, ry, true); put('cyl', '#2a2a40', x, 3, z, 0.4, 6); });
      { const rings = []; for (let k = 0; k < 5; k++) { const i = Math.floor((k + 0.2) * tr.N / 5); const m = new T.Mesh(G.tor, bas(pick([0x00e5ff, 0xff2d95, 0x7cff6a]), { transparent: true, opacity: 0.7 })); m.position.set(tr.P[i * 2], 16 + tr.height(i), tr.P[i * 2 + 1]); m.scale.setScalar(tr.wallD + 3); m.rotation.y = face(i); world.add(m); rings.push(m); } anim.push(t => rings.forEach((m, k) => { m.rotation.z = t * 0.6 + k; })); }
      points(300, 0xff6ad8, 1.6, R0 + 300, 30, 120, 2);
    } else if (W === 'vulkan') {
      // Lavasturm: zentraler Vulkan mit glühendem Krater, Lavaseen, schwarze Felsen, Rauch und Glut
      { const x = CX + R0 * 0.1, z = CZ - R0 - 160; put('cone', '#3a1a12', x, 70, z, 150, 140); put('cyl', '#ff6a1a', x, 140, z, 22, 4, 22, 0, true); const smoke = points(160, 0x6a4a40, 9, 60, 150, 320, 6); smoke.position.set(x - CX, 0, z - CZ); }
      free(30, 16, 0, R0 + 200, (x, z) => { const s = ra(10, 26); put('cyl', '#ff5a10', x, 0.05, z, s, 0.1, s, 0, true); put('cyl', '#2a1410', x, 0.02, z, s + 2, 0.06, s + 2); });
      along(120, 4, 60, (x, z) => { const s = ra(1.5, 6); put('pyr', pick(['#2a1814', '#3a2018', '#1a100e']), x, s * 0.5, z, s, s * ra(1, 2.4), s, R() * 3); });
      along(30, 2, 10, (x, z) => { put('box', '#2a1814', x, 1, z, 1.4, 2, 1.4); put('sph', '#ff7a2a', x, 2.4, z, 0.6, 0.6, 0.6, 0, true); });
      points(320, 0xff7a2a, 1.5, R0 + 160, 0, 30, 3);
    } else if (W === 'eis') {
      // Eiskristall: Eisspitzen, verschneite Tannen, Iglus, gefrorener See, Schneefall
      { const lake = new T.Mesh(new T.CircleGeometry(1, 40), new T.MeshLambertMaterial({ color: 0xb8e8ff, transparent: true, opacity: 0.85 })); lake.rotation.x = -Math.PI / 2; lake.position.set(CX + R0 + 220, 0.03, CZ); lake.scale.setScalar(200); world.add(lake); }
      along(80, 5, 50, (x, z) => { const h = ra(8, 16); put('cyl', '#6a4a3a', x, h * 0.15, z, 0.4, h * 0.3); put('cone', '#2a6a4a', x, h * 0.55, z, h * 0.3, h * 0.6); put('cone', '#ffffff', x, h * 0.85, z, h * 0.18, h * 0.35); });
      free(50, 12, 0, R0 + 260, (x, z) => { for (let q = 0; q < 3; q++) { const h = ra(6, 20); put('cone', pick(['#a8e8ff', '#d8f8ff', '#80d0ff']), x + ra(-4, 4), h / 2, z + ra(-4, 4), ra(1.5, 3), h, ra(1.5, 3), R() * 3, R() < 0.3, ra(-0.2, 0.2)); } });
      along(8, 16, 34, (x, z, i) => { put('sph', '#f4fbff', x, 0, z, 6, 4.5, 6); put('cyl', '#f4fbff', x + Math.sin(face(i)) * 5, 1.4, z + Math.cos(face(i)) * 5, 1.6, 2.8, 1.6, face(i), false, Math.PI / 2); });
      for (let k = 0; k < 6; k++) { const a = k / 6 * PI2, r = R0 + ra(220, 380); put('pyr', '#e8f4ff', CX + Math.cos(a) * r, 60, CZ + Math.sin(a) * r, 90, 120); }
      points(500, 0xffffff, 1.4, R0 + 120, 0, 50, 4);
    } else if (W === 'dschungel') {
      // Dschungel-Express: dichte Riesenbäume, Lianen, Farne, Stufenpyramide, Wasserfall
      free(160, 6, 0, R0 + 300, (x, z) => { const h = ra(14, 28); put('cyl', '#5a3a1a', x, h / 2, z, h * 0.06, h); put('sph', pick(['#1e6a2a', '#2a8a3a', '#14501e']), x, h, z, h * 0.42, h * 0.3); });
      along(120, 2, 30, (x, z) => { for (let q = 0; q < 5; q++) put('cone', pick(['#2aa040', '#3ac050', '#1e8a30']), x, 1, z, 0.5, 2.4, 0.5, q * 1.26, false, 0.9); });
      along(40, 6, 30, (x, z) => { const h = ra(8, 14); put('cyl', '#3a7a2a', x, h / 2 + 2, z, 0.12, h); });
      { const a = 0.9, r = R0 + 90, x = CX + Math.cos(a) * r, z = CZ + Math.sin(a) * r; for (let q = 0; q < 6; q++) put('box', q % 2 ? '#8a8a6a' : '#7a7a5a', x, q * 5 + 2.5, z, 50 - q * 8, 5, 50 - q * 8); put('box', '#5a5a4a', x, 32, z, 8, 6, 8); }
      { const a = 3.6, r = R0 + 140, x = CX + Math.cos(a) * r, z = CZ + Math.sin(a) * r; put('box', '#5a6a5a', x, 25, z, 30, 50, 16); const fall = new T.Mesh(G.box, bas(0x9ae8ff, { transparent: true, opacity: 0.75 })); fall.position.set(x, 22, z + 8.5); fall.scale.set(10, 44, 0.5); world.add(fall); anim.push(t => { fall.material.opacity = 0.65 + Math.sin(t * 6) * 0.1; }); }
      points(150, 0xd8ff8a, 1, R0 + 100, 1, 8, 1);
    } else if (W === 'kosmos') {
      // Sternen-Highway: Planeten mit Ringen, schwebende Asteroiden, Satellitenschüsseln, Sternenmeer
      [[0.4, 120, 60, '#ff8a4a'], [2.3, 160, 90, '#6a8aff'], [4.2, 90, 40, '#c08aff']].forEach(([a, el, s, c], k) => { const x = CX + Math.cos(a) * 900, z = CZ + Math.sin(a) * 900, m = new T.Mesh(shared.sphere, bas(c, { fog: false })); m.position.set(x, el + 100, z); m.scale.setScalar(s); skyGroup.add(m); if (k !== 2) { const ring = new T.Mesh(G.tor, bas(0xffe0a0, { fog: false, transparent: true, opacity: 0.6 })); ring.position.copy(m.position); ring.scale.set(s * 1.8, s * 1.8, s * 2); ring.rotation.x = 1.2; skyGroup.add(ring); } });
      { const ast = []; for (let k = 0; k < 40; k++) { const m = new T.Mesh(G.sph, lam(pick(['#5a5470', '#6a6080', '#4a4460']))); const a = R() * PI2, r = R0 + ra(40, 260); m.userData = { a, r, y: ra(10, 60), s: ra(0.02, 0.06) }; m.scale.setScalar(ra(2, 8)); world.add(m); ast.push(m); } anim.push(t => ast.forEach(m => { const u = m.userData, a = u.a + t * u.s; m.position.set(CX + Math.cos(a) * u.r, u.y + Math.sin(t + u.a) * 2, CZ + Math.sin(a) * u.r); m.rotation.set(t * u.s * 9, t * u.s * 7, 0); })); }
      along(10, 14, 30, (x, z, i) => { put('cyl', '#8a8aa0', x, 3, z, 0.6, 6); put('sph', '#d0d0e0', x, 7, z, 4, 1.2, 4, face(i), false, 0.6); put('cyl', '#ff4a8a', x, 8, z, 0.15, 3); });
      along(60, 2, 12, (x, z) => put('cyl', pick(['#40f4ff', '#bc77ff']), x, 0.1, z, 0.8, 0.2, 0.8, 0, true));
      points(900, 0xffffff, 2.2, 1100, 40, 500);
    } else if (W === 'wueste') {
      // Wüsten-Rallye: Dünen, Kakteen, Tafelberge, Felsbögen, Oase mit Palmen
      free(70, 18, 0, R0 + 360, (x, z) => { const s = ra(18, 50); put('sph', pick(['#e0aa68', '#d89a58', '#e8b878']), x, -s * 0.6, z, s, s * 0.8, s * 0.6, R() * 3); });
      along(60, 4, 50, (x, z) => { const h = ra(3, 7); put('cyl', '#3a8a3a', x, h / 2, z, 0.6, h); if (R() < 0.7) { put('cyl', '#3a8a3a', x + 1, h * 0.6, z, 0.4, h * 0.35); put('cyl', '#3a8a3a', x + 1.4, h * 0.75, z, 0.35, 1.2); } });
      for (let k = 0; k < 7; k++) { const a = k / 7 * PI2 + 0.4, r = R0 + ra(120, 300), x = CX + Math.cos(a) * r, z = CZ + Math.sin(a) * r, h = ra(30, 60), w = ra(40, 80); put('box', '#b0603a', x, h / 2, z, w, h, w * 0.7, a); put('box', '#c87a4a', x, h + 1.5, z, w * 0.9, 3, w * 0.62, a); }
      { const i = Math.floor(tr.N * 0.42), s = 1, x = tr.P[i * 2] + tr.Nm[i * 2] * s * (tr.wallD + 30), z = tr.P[i * 2 + 1] + tr.Nm[i * 2 + 1] * s * (tr.wallD + 30); put('cyl', '#3a9ae8', x, 0.05, z, 14, 0.1, 14); for (let q = 0; q < 6; q++) { const px = x + Math.cos(q) * 16, pz = z + Math.sin(q) * 16, h = ra(9, 13); put('cyl', '#9a6a3a', px, h / 2, pz, 0.35, h); for (let w = 0; w < 5; w++) put('cone', '#2e9a3a', px + Math.cos(w * 1.26) * 2.2, h, pz + Math.sin(w * 1.26) * 2.2, 0.8, 4, 0.8, w * 1.26, false, Math.PI / 2.3); } }
      along(20, 8, 30, (x, z) => put('sph', '#a07a4a', x, 0.9, z, 0.9));
      sun('#fff0b0', 180, 80);
    } else if (W === 'regenbogen') {
      // Regenbogen-Boulevard: riesige Regenbogenbögen über der Strecke, Blumenfelder, Wolken
      { const RB = ['#ff4a4a', '#ff9a2a', '#ffe14a', '#4ad04a', '#3a9aff', '#9a5aff']; for (let k = 0; k < 4; k++) { const i = Math.floor((k + 0.3) * tr.N / 4); RB.forEach((c, q) => put('arc', c, tr.P[i * 2], tr.height(i), tr.P[i * 2 + 1], tr.wallD + 10 + q * 1.4, tr.wallD + 10 + q * 1.4, tr.wallD + 10 + q * 1.4, face(i) + Math.PI / 2, true)); } }
      { const RB = ['#ff4a4a', '#ff9a2a', '#ffe14a', '#4ad04a', '#3a9aff', '#9a5aff'], a = 4, x = CX + Math.cos(a) * (R0 + 300), z = CZ + Math.sin(a) * (R0 + 300); RB.forEach((c, q) => put('arc', c, x, 0, z, 260 - q * 14, 260 - q * 14, 260 - q * 14, -a, true)); }
      free(80, 10, 0, R0 + 260, (x, z) => { const c = pick(['#ff6ab8', '#ffe14a', '#8ad0ff', '#c08aff', '#ffffff']); for (let q = 0; q < 6; q++) put('sph', c, x + ra(-5, 5), 0.6, z + ra(-5, 5), 0.6); });
      along(40, 4, 30, (x, z) => { const h = ra(3, 5); put('cyl', '#4aa03a', x, h / 2, z, 0.12, h); put('sph', pick(['#ff4a8a', '#ffd24a', '#ff9a2a']), x, h, z, 1.2, 0.5); });
      clouds(18, 0xffffff);
    } else if (W === 'herzportal') {
      // Herzportal: schwebende Herzen, Laternen, rosa Kristallbäume, Herztor
      { const hearts = []; for (let k = 0; k < 14; k++) { const g = new T.Group(), c = pick(['#ff4a8a', '#ff6ab8', '#ff2d6a']); mesh(g, 'sph', c, -0.6, 0.4, 0, 1); mesh(g, 'sph', c, 0.6, 0.4, 0, 1); const tip = mesh(g, 'cone', c, 0, -0.9, 0, 1.1, 2.2, 0.9); tip.rotation.z = Math.PI; const i = Math.floor((k + 0.5) * tr.N / 14), s = k % 2 ? 1 : -1; g.position.set(tr.P[i * 2] + tr.Nm[i * 2] * s * (tr.wallD + 10), 12, tr.P[i * 2 + 1] + tr.Nm[i * 2 + 1] * s * (tr.wallD + 10)); g.scale.setScalar(2.2); world.add(g); hearts.push(g); } anim.push(t => hearts.forEach((g, k) => { g.rotation.y = t + k; g.position.y = 12 + Math.sin(t * 1.5 + k) * 1.5; })); }
      along(50, 6, 40, (x, z) => { const h = ra(6, 12); put('cyl', '#8a5aa8', x, h / 2, z, 0.4, h); put('sph', pick(['#ffb3ec', '#d8a0ff', '#ff8ad0']), x, h, z, h * 0.35, h * 0.4, h * 0.35, 0, R() < 0.3); });
      along(30, 1.5, 3, (x, z) => lamp(x, z, 5, '#ffb3ec'));
      free(40, 20, 0, R0 + 260, (x, z) => { for (let q = 0; q < 3; q++) put('cone', pick(['#ffb3ec', '#74dbff']), x + ra(-3, 3), 3, z + ra(-3, 3), 1.2, ra(4, 10), 1.2, 0, true); });
      clouds(10, 0xffe0f4);
    } else if (W === 'kristallsturm') {
      // Kristallsturm-Pass: verschneite Gipfel, leuchtende Kristallhaufen, Wegweiser, Felsen, Schneesturm
      for (let k = 0; k < 9; k++) { const a = k / 9 * PI2 + 0.2, r = R0 + ra(140, 300), x = CX + Math.cos(a) * r, z = CZ + Math.sin(a) * r, h = ra(80, 150); put('pyr', '#5a6e98', x, h / 2, z, h * 0.7, h); put('pyr', '#ffffff', x, h * 0.86, z, h * 0.2, h * 0.28); }
      along(50, 4, 40, (x, z) => { for (let q = 0; q < 4; q++) { const h = ra(3, 9); put('cone', pick(['#80edff', '#bca2ff', '#e4fbff']), x + ra(-2.5, 2.5), h / 2, z + ra(-2.5, 2.5), ra(0.6, 1.4), h, ra(0.6, 1.4), 0, true, ra(-0.3, 0.3)); } });
      along(70, 3, 60, (x, z) => { const s = ra(1.5, 5); put('sph', pick(['#7a8aa0', '#8a9ab0', '#e8f4ff']), x, s * 0.3, z, s, s * 0.6, s); });
      along(12, 2, 4, (x, z, i) => { put('cyl', '#6a4a2a', x, 2, z, 0.2, 4); put('box', '#d0a050', x, 3.6, z, 2.4, 0.6, 0.15, face(i) + 0.4); });
      points(600, 0xeaf6ff, 1.2, R0 + 80, 0, 40, 6);
    } else if (W === 'monsterfreunde') {
      // Monsterfreunde-Safari: Schirmakazien, hohes Gras, Wasserloch, freundliche Riesen-Monster
      along(70, 8, 70, (x, z) => { const h = ra(9, 14); put('cyl', '#7a5a3a', x, h / 2, z, 0.5, h); put('cyl', '#4a8a2a', x, h, z, h * 0.6, 1.6, h * 0.45); });
      along(200, 1, 40, (x, z) => put('cone', pick(['#c8b04a', '#b0a040', '#d8c060']), x, 0.8, z, 0.5, 1.8));
      { const i = Math.floor(tr.N * 0.6), x = tr.P[i * 2] + tr.Nm[i * 2] * (tr.wallD + 34), z = tr.P[i * 2 + 1] + tr.Nm[i * 2 + 1] * (tr.wallD + 34); put('cyl', '#3a9ad8', x, 0.05, z, 22, 0.1, 16); }
      { const mon = []; for (let k = 0; k < 6; k++) { const a = k / 6 * PI2 + 0.3, r = R0 + ra(60, 120), g = grp(CX + Math.cos(a) * r, 0, CZ + Math.sin(a) * r), c = pick(['#ffb05e', '#a1ea8b', '#b890ed', '#6ddddd', '#ff8ab0']); g.rotation.y = -a - Math.PI / 2; mesh(g, 'sph', c, 0, 9, 0, 9, 10, 8); mesh(g, 'sph', '#ffffff', -3, 14, 6.5, 2.2); mesh(g, 'sph', '#ffffff', 3, 14, 6.5, 2.2); mesh(g, 'sph', '#22243d', -3, 14, 8.3, 1); mesh(g, 'sph', '#22243d', 3, 14, 8.3, 1); mesh(g, 'cone', c, -5, 19, 0, 1.5, 5); mesh(g, 'cone', c, 5, 19, 0, 1.5, 5); mon.push(g); } anim.push(t => mon.forEach((g, k) => { g.position.y = Math.abs(Math.sin(t * 1.6 + k)) * 2; })); }
      sun('#ffd080', 120, 70);
    } else if (W === 'ahnenruinen') {
      // Ahnenruinen: Säulenreihen, zerbrochene Bögen, Steinköpfe, Moos, Zikkurat
      along(60, 4, 30, (x, z) => { const h = ra(4, 12); put('cyl', '#d2bc8e', x, h / 2, z, 1.2, h); if (R() < 0.5) put('box', '#c0aa80', x, h + 0.4, z, 3, 0.8, 3); });
      along(10, 10, 26, (x, z, i) => { const ry = face(i); put('box', '#c8b088', x, 5, z, 2, 10, 2, ry); put('box', '#c8b088', x + Math.cos(ry) * 8, 5, z - Math.sin(ry) * 8, 2, 10, 2, ry); put('box', '#b8a078', x + Math.cos(ry) * 4, 10.6, z - Math.sin(ry) * 4, 11, 1.6, 2.2, ry); });
      along(6, 22, 40, (x, z, i) => { const g = grp(x, 0, z); g.rotation.y = face(i) + Math.PI / 2; mesh(g, 'box', '#9a9a80', 0, 6, 0, 8, 12, 7); mesh(g, 'box', '#6a6a58', -2, 8, 3.6, 1.4, 1, 0.2); mesh(g, 'box', '#6a6a58', 2, 8, 3.6, 1.4, 1, 0.2); mesh(g, 'box', '#6a6a58', 0, 4.5, 3.6, 3, 0.8, 0.2); mesh(g, 'sph', '#5a8a4a', 0, 12, 0, 4.4, 1.2, 4); });
      { const a = 2.6, r = R0 + 130, x = CX + Math.cos(a) * r, z = CZ + Math.sin(a) * r; for (let q = 0; q < 5; q++) put('box', '#b0a07a', x, q * 6 + 3, z, 70 - q * 13, 6, 70 - q * 13, 0.3); }
      along(120, 2, 40, (x, z) => put('sph', pick(['#5a8a4a', '#6a9a50', '#4a7a40']), x, 0.3, z, ra(0.8, 2), 0.6));
    } else if (W === 'drachenflug') {
      // Drachenflug-Tal: hohe Felsnadeln, Drachenstatuen, Nester mit Eiern, schwebende Inseln
      free(60, 20, 0, R0 + 320, (x, z) => { const h = ra(30, 80); put('cone', pick(['#8a7a6a', '#7a6a5a', '#9a8a7a']), x, h / 2, z, ra(6, 12), h); put('cone', '#5a9a4a', x, h * 0.98, z, 3, 4); });
      along(4, 14, 24, (x, z, i) => { const g = grp(x, 0, z); g.rotation.y = face(i); mesh(g, 'box', '#6a6a7a', 0, 2, 0, 6, 4, 6); mesh(g, 'sph', '#c84a2a', 0, 8, 0, 3, 4, 5); mesh(g, 'sph', '#c84a2a', 0, 12, 4, 2); mesh(g, 'cone', '#ffd24a', -1, 14, 4, 0.5, 2); mesh(g, 'cone', '#ffd24a', 1, 14, 4, 0.5, 2); mesh(g, 'prism', '#e86a3a', 0, 10, -1, 0.3, 4, 9).rotation.z = 0.5; });
      along(12, 8, 30, (x, z) => { put('cyl', '#7a5a3a', x, 0.6, z, 3, 1.2, 3); for (let q = 0; q < 3; q++) put('sph', pick(['#ffe0a0', '#a0e0ff', '#ffa0c0']), x + ra(-1, 1), 1.6, z + ra(-1, 1), 0.7, 0.9, 0.7); });
      { const isl = []; for (let k = 0; k < 7; k++) { const g = new T.Group(), a = k / 7 * PI2, r = R0 * 0.6 + ra(0, 200); mesh(g, 'cone', '#7a6a5a', 0, -6, 0, 12, 12).rotation.x = Math.PI; mesh(g, 'cyl', '#5aa04a', 0, 0.5, 0, 12, 1, 12); for (let q = 0; q < 3; q++) mesh(g, 'cone', '#2e7a3a', ra(-6, 6), 4, ra(-6, 6), 2, 6); g.position.set(CX + Math.cos(a) * r, ra(50, 90), CZ + Math.sin(a) * r); world.add(g); isl.push(g); } anim.push(t => isl.forEach((g, k) => { g.position.y += Math.sin(t * 0.5 + k) * 0.02; })); }
      clouds(14);
    } else if (W === 'splitterwelten') {
      // Splitterwelten: schwebende Kristallsplitter, zerbrochene Bodenschollen, Glutrisse
      { const sh = []; for (let k = 0; k < 30; k++) { const m = new T.Mesh(G.prism, bas(pick([0xff993d, 0xa971fc, 0x8debff]), { transparent: true, opacity: 0.9 })); const a = R() * PI2, r = R0 * 0.3 + ra(0, R0 + 200); m.userData = { y: ra(14, 70), o: R() * 6 }; m.position.set(CX + Math.cos(a) * r, m.userData.y, CZ + Math.sin(a) * r); m.scale.set(ra(2, 6), ra(6, 18), ra(2, 6)); world.add(m); sh.push(m); } anim.push(t => sh.forEach(m => { m.rotation.y = t * 0.4 + m.userData.o; m.position.y = m.userData.y + Math.sin(t + m.userData.o) * 3; })); }
      free(50, 14, 0, R0 + 260, (x, z) => { const s = ra(10, 26); put('cyl', '#3a2a5a', x, -1, z, s, 3, s * 0.8, R() * 3); put('box', '#ff7a2a', x, 0.6, z, s * 1.2, 0.1, 0.5, R() * 3, true); });
      along(60, 4, 40, (x, z) => { const h = ra(4, 12); put('cone', pick(['#ff993d', '#a971fc']), x, h / 2, z, ra(1, 2), h, ra(1, 2), R() * 3, R() < 0.4, ra(-0.4, 0.4)); });
      points(260, 0xffb070, 1.4, R0 + 200, 2, 60, 3);
    } else if (W === 'farbeninsel') {
      // Farbeninsel: Insel im Meer, Farbkleckse, Riesen-Farbeimer, bunte Häuschen, Palmen
      { const sea = new T.Mesh(new T.PlaneGeometry(3000, 3000), new T.MeshLambertMaterial({ color: 0x3cc9cf })); sea.rotation.x = -Math.PI / 2; sea.position.set(CX, -0.2, CZ); world.add(sea); const isl = new T.Mesh(new T.CircleGeometry(R0 + 70, 48), lam(d.ground)); isl.rotation.x = -Math.PI / 2; isl.position.set(CX, -0.12, CZ); world.add(isl); }
      free(50, 6, 0, R0 + 40, (x, z) => put('cyl', pick(['#ff4a8a', '#ffd24a', '#4ad0ff', '#8aff6a', '#c08aff', '#ff8a2a']), x, 0.02, z, ra(3, 9), 0.05, ra(3, 9), R() * 3));
      along(8, 14, 30, (x, z) => { const c = pick(['#ff4a8a', '#ffd24a', '#4ad0ff', '#8aff6a']); put('cyl', '#e8e8f0', x, 4, z, 4, 8); put('cyl', c, x, 8.2, z, 4.1, 0.6); put('cyl', c, x + 3.5, 3, z, 1.2, 6, 1.2, 0, false, 0.3); });
      along(24, 8, 36, (x, z, i) => { const ry = face(i), c = pick(['#ff9cce', '#70e6c4', '#ffe070', '#9ab0ff']); put('box', c, x, 3, z, 7, 6, 6, ry); put('prism', pick(['#d04a4a', '#4a6ad0']), x, 7.4, z, 4, 7.4, 4, ry + Math.PI / 2); });
      along(50, 4, 40, (x, z) => { const h = ra(8, 12); put('cyl', '#9a6a3a', x, h / 2, z, 0.3, h, 0.3, 0, false, ra(-0.2, 0.2)); for (let q = 0; q < 5; q++) put('cone', '#2eb04a', x + Math.cos(q * 1.26) * 2.2, h, z + Math.sin(q * 1.26) * 2.2, 0.8, 4, 0.8, q * 1.26, false, Math.PI / 2.3); });
      clouds(12);
    }
    // Bodendetails nah an der Strecke (Grasbüschel, Steine, Blumen) – lassen die Fläche lebendig wirken
    if (!['wolken', 'aeru', 'ricopoly', 'neon', 'kosmos', 'splitterwelten'].includes(W)) { const base = new T.Color(d.land || d.ground), dk = base.clone().offsetHSL(0, 0.05, -0.12).getStyle(), lt = base.clone().offsetHSL(0, 0, 0.08).getStyle();
      along(260, 1, 34, (x, z) => { const r = R(); if (r < 0.6) put('cone', R() < 0.5 ? dk : lt, x, 0.45, z, ra(0.4, 0.8), ra(0.8, 1.4)); else if (r < 0.8) put('sph', '#9a9aa0', x, 0.2, z, ra(0.4, 1.1), ra(0.3, 0.6)); else put('sph', pick(['#ffffff', '#ffe14a', '#ff7ab8', '#b07aff']), x, 0.35, z, 0.3); }); }
    Object.keys(lists).forEach(k => { const glow = k.endsWith('*'), geo = G[glow ? k.slice(0, -1) : k]; inst(geo, glow ? instBas() : instLam, lists[k]); });
  }
  // ------------------------------------------------------------------ Karts mit Figuren
  const gc = {}, geo = (key, mk) => gc[key] || (gc[key] = mk());
  const SPH = () => shared.sphere;
  function part(parent, g, m, x, y, z, sx, sy, sz, rx, ry, rz) { const o = new T.Mesh(g, m); o.position.set(x, y, z); if (sx != null) o.scale.set(sx, sy == null ? sx : sy, sz == null ? sx : sz); if (rx || ry || rz) o.rotation.set(rx || 0, ry || 0, rz || 0); parent.add(o); return o; }
  const S_ = (p, m, x, y, z, rx, ry, rz, rot) => part(p, SPH(), m, x, y, z, rx, ry, rz, rot && rot[0], rot && rot[1], rot && rot[2]);
  const B_ = (p, m, x, y, z, w, h, d, rot) => part(p, geo('b', () => new T.BoxGeometry(1, 1, 1)), m, x, y, z, w, h, d, rot && rot[0], rot && rot[1], rot && rot[2]);
  const Y_ = (p, m, x, y, z, r, h, rot, seg) => part(p, geo('y' + (seg || 12), () => new T.CylinderGeometry(1, 1, 1, seg || 12)), m, x, y, z, r, h, r, rot && rot[0], rot && rot[1], rot && rot[2]);
  const C_ = (p, m, x, y, z, r, h, rot, seg) => part(p, geo('c' + (seg || 10), () => new T.ConeGeometry(1, 1, seg || 10)), m, x, y, z, r, h, r, rot && rot[0], rot && rot[1], rot && rot[2]);
  const eyeW = bas(0xffffff), eyeB = bas(0x15151c);
  function eyes(h, sp, y, z, s) { [-1, 1].forEach(sd => { S_(h, eyeW, sd * sp, y, z, s, s * 1.15, s * 0.6); S_(h, eyeB, sd * sp, y - 0.01, z + s * 0.45, s * 0.55, s * 0.65, s * 0.3); }); }
  const mouth = (h, y, z, w) => B_(h, bas(0x6a2a2a), 0, y, z, w || 0.2, 0.035, 0.03);
  // Figuren-Aufbau: h = Kopf (Ursprung Kopfmitte, +z = Blick), t = Oberkörper, g = Kart-Gruppe (für Schwänze/Flügel)
  const CH = {
    mia(h, t, g, C) { const skin = lam(C.skin), hair = lam('#6a3a1a'); S_(h, skin, 0, 0, 0, 0.5); eyes(h, 0.19, 0.0, 0.42, 0.08); mouth(h, -0.2, 0.46, 0.16);
      const helm = part(h, geo('half', () => new T.SphereGeometry(1, 14, 8, 0, PI2, 0, Math.PI * 0.58)), lam(C.acc), 0, 0.03, -0.02, 0.58, 0.58, 0.58); helm.rotation.x = -0.12;
      B_(h, lam('#1a1d2e'), 0, 0.2, 0.0, 1.14, 0.1, 0.5); [-1, 1].forEach(s => Y_(h, bas(0x66e8ff), s * 0.2, 0.22, 0.52, 0.13, 0.06, [Math.PI / 2, 0, 0]));
      [[0, -0.05, -0.58, 0.16], [0, -0.22, -0.7, 0.14], [0, -0.42, -0.75, 0.12]].forEach(p => S_(h, hair, p[0], p[1], p[2], p[3])); },
    fuchs(h, t, g, C) { const o = lam('#ff8a2a'), w = lam('#fff4e8'), dk = lam('#3a2a1a'); S_(h, o, 0, 0, 0, 0.5, 0.46, 0.5); S_(h, w, 0, -0.16, 0.3, 0.32, 0.22, 0.3); C_(h, w, 0, -0.1, 0.55, 0.2, 0.42, [Math.PI / 2, 0, 0]); S_(h, dk, 0, -0.05, 0.76, 0.07); eyes(h, 0.2, 0.1, 0.38, 0.075);
      [-1, 1].forEach(s => { C_(h, o, s * 0.3, 0.55, -0.05, 0.2, 0.55, [0, 0, -s * 0.15], 4); C_(h, dk, s * 0.32, 0.72, -0.05, 0.09, 0.2, [0, 0, -s * 0.15], 4); });
      S_(g, o, 0.55, 1.35, -1.35, 0.3, 0.3, 0.75, [0.5, 0, 0]); S_(g, w, 0.55, 1.62, -1.78, 0.2); },
    baer(h, t, g, C) { const b = lam('#8a5a2a'), l = lam('#d8b078'); S_(h, b, 0, 0, 0, 0.52); [-1, 1].forEach(s => { S_(h, b, s * 0.38, 0.42, -0.02, 0.17); S_(h, l, s * 0.38, 0.42, 0.06, 0.09); }); S_(h, l, 0, -0.14, 0.42, 0.22, 0.17, 0.2); S_(h, lam('#222'), 0, -0.07, 0.6, 0.07); eyes(h, 0.2, 0.1, 0.4, 0.06); S_(g, b, 0, 1.0, -1.72, 0.2); },
    katze(h, t, g, C) { const gr = lam('#9aa3b8'), pk = lam('#ffa0b8'); S_(h, gr, 0, 0, 0, 0.5, 0.46, 0.5); [-1, 1].forEach(s => { C_(h, gr, s * 0.3, 0.5, -0.02, 0.2, 0.46, [0, 0, -s * 0.2], 4); C_(h, pk, s * 0.3, 0.48, 0.04, 0.1, 0.3, [0, 0, -s * 0.2], 4); }); eyes(h, 0.2, 0.08, 0.4, 0.085); S_(h, pk, 0, -0.06, 0.5, 0.05);
      [-1, 1].forEach(s => [-0.04, 0.05].forEach(y => B_(h, lam('#f4f4f4'), s * 0.42, y - 0.08, 0.42, 0.5, 0.015, 0.015, [0, s * 0.2, y * 3])));
      for (let i = 0; i < 6; i++) S_(g, gr, 0.55 + Math.sin(i * 0.5) * 0.15, 1.1 + i * 0.22, -1.4 - i * 0.05, 0.1 + i * 0.005); },
    frosch(h, t, g, C) { const gn = lam('#4cc84a'); S_(h, gn, 0, -0.03, 0, 0.55, 0.42, 0.5); [-1, 1].forEach(s => { S_(h, eyeW, s * 0.27, 0.36, 0.14, 0.2); S_(h, eyeB, s * 0.27, 0.38, 0.32, 0.1); }); B_(h, bas(0x2a5a2a), 0, -0.15, 0.46, 0.62, 0.035, 0.03); S_(h, lam('#e8ffd8'), 0, -0.32, 0.25, 0.3, 0.14, 0.3); S_(g, lam('#3a9a3a'), 0, 0.95, -1.7, 0.22, 0.12, 0.3); },
    drache(h, t, g, C) { const gn = lam('#3da84a'), cr = lam('#fff0c8'), rd = lam('#e8412a'); S_(h, gn, 0, 0, 0, 0.5); S_(h, lam('#6ac86a'), 0, -0.13, 0.42, 0.28, 0.2, 0.28); [-1, 1].forEach(s => { S_(h, eyeW, s * 0.2, 0.12, 0.4, 0.08); S_(h, eyeB, s * 0.2, 0.12, 0.46, 0.04); S_(h, lam('#222'), s * 0.08, -0.08, 0.68, 0.03); C_(h, cr, s * 0.2, 0.55, -0.1, 0.09, 0.45, [-0.5, 0, -s * 0.3], 6); });
      [[0.45, -0.2], [0.3, -0.4], [0.12, -0.55]].forEach(p => C_(h, rd, 0, p[0] + 0.04, p[1], 0.09, 0.22, [-0.5, 0, 0], 4));
      const wm = new T.MeshLambertMaterial({ color: 0xe8412a, side: T.DoubleSide }), wg = geo('wing', () => { const gg = new T.BufferGeometry(); gg.setAttribute('position', new T.Float32BufferAttribute([0, 0, 0, 1.5, 0.9, -0.1, 1.2, 0.1, -0.5, 0, 0, 0, 1.2, 0.1, -0.5, 0.3, -0.5, -0.4], 3)); gg.computeVertexNormals(); return gg; });
      [-1, 1].forEach(s => { const w = part(t, wg, wm, s * 0.4, 0.25, -0.35, 1, 1, 1); w.scale.x = s; w.rotation.z = s * 0.15; }); },
    einhorn(h, t, g, C) { const w = lam('#fdfdff'), pk = lam('#ff9ad0'); S_(h, w, 0, 0, 0, 0.5, 0.48, 0.5); S_(h, w, 0, -0.14, 0.38, 0.24, 0.2, 0.26); C_(h, lam('#ffd24a'), 0, 0.72, 0.2, 0.09, 0.6, [0.45, 0, 0], 6); eyes(h, 0.2, 0.08, 0.4, 0.075); S_(h, pk, -0.3, -0.08, 0.38, 0.07); S_(h, pk, 0.3, -0.08, 0.38, 0.07); [-1, 1].forEach(s => C_(h, w, s * 0.28, 0.5, -0.1, 0.1, 0.28, [0, 0, -s * 0.25], 4));
      ['#ff2d95', '#ffd24a', '#7cff6a', '#00e5ff', '#8b5cf6'].forEach((c, i) => S_(h, lam(c), 0, 0.38 - i * 0.2, -0.45 - i * 0.04, 0.17)); ['#ff2d95', '#ffd24a', '#00e5ff'].forEach((c, i) => S_(g, lam(c), 0.0, 1.0 + i * 0.05, -1.72 - i * 0.12, 0.17 - i * 0.02)); },
    pinguin(h, t, g, C) { const dk = lam('#252a3a'), wh = lam('#f8f8ff'); S_(h, dk, 0, 0, 0, 0.5, 0.5, 0.5); S_(h, wh, 0, -0.04, 0.34, 0.34, 0.32, 0.22); C_(h, lam('#ff9a1f'), 0, -0.08, 0.62, 0.11, 0.3, [Math.PI / 2, 0, 0], 6); eyes(h, 0.15, 0.08, 0.46, 0.065); part(h, geo('half', () => new T.SphereGeometry(1, 14, 8, 0, PI2, 0, Math.PI * 0.55)), lam(C.acc), 0, 0.12, 0, 0.54, 0.54, 0.54); S_(h, lam('#fff'), 0, 0.64, 0, 0.1);
      [-1, 1].forEach(s => S_(t, dk, s * 0.58, -0.1, -0.05, 0.1, 0.36, 0.2, [0, 0, s * 0.3])); },
    roboter(h, t, g, C) { const m = lam('#9aa8c8'); B_(h, m, 0, 0, 0, 0.88, 0.72, 0.8); B_(h, bas(0x66e8ff), 0, 0.06, 0.41, 0.7, 0.24, 0.04); [-1, 1].forEach(s => { Y_(h, lam('#6a7898'), s * 0.46, 0, 0, 0.12, 0.16, [0, 0, Math.PI / 2]); }); Y_(h, lam('#6a7898'), 0, 0.5, -0.05, 0.03, 0.4); S_(h, bas(0xff3a4a), 0, 0.72, -0.05, 0.09); B_(h, lam('#4a5878'), 0, -0.26, 0.38, 0.4, 0.06, 0.04); },
    alien(h, t, g, C) { const p = lam('#9a5cff'); S_(h, p, 0, 0.04, 0, 0.5, 0.58, 0.5); [-1, 1].forEach(s => { S_(h, lam('#111'), s * 0.22, 0.06, 0.4, 0.15, 0.2, 0.08, [0, s * 0.25, s * 0.35]); S_(h, eyeW, s * 0.17, 0.12, 0.46, 0.035); Y_(h, p, s * 0.18, 0.7, 0, 0.025, 0.45, [0, 0, -s * 0.35], 6); S_(h, bas(0x7cff6a), s * 0.3, 0.92, 0, 0.09); }); B_(h, bas(0x3a1a6a), 0, -0.25, 0.4, 0.14, 0.03, 0.03); },
    panda(h, t, g, C) { const w = lam('#fafafa'), bk = lam('#222228'); S_(h, w, 0, 0, 0, 0.52); [-1, 1].forEach(s => { S_(h, bk, s * 0.38, 0.42, -0.02, 0.17); S_(h, bk, s * 0.2, 0.08, 0.41, 0.12, 0.16, 0.06, [0, 0, s * 0.4]); S_(h, eyeW, s * 0.2, 0.1, 0.44, 0.035); }); S_(h, lam('#e8e8ee'), 0, -0.12, 0.44, 0.2, 0.15, 0.16); S_(h, bk, 0, -0.05, 0.56, 0.06); S_(g, bk, 0, 1.0, -1.72, 0.18); },
    hase(h, t, g, C) { const w = lam('#fff0f6'), pk = lam('#ff9ac0'); S_(h, w, 0, 0, 0, 0.5, 0.47, 0.5); [-1, 1].forEach(s => { S_(h, w, s * 0.2, 0.85, -0.05, 0.14, 0.58, 0.09, [0, 0, -s * 0.12]); S_(h, pk, s * 0.2, 0.85, 0.0, 0.07, 0.45, 0.05, [0, 0, -s * 0.12]); }); eyes(h, 0.19, 0.08, 0.4, 0.075); S_(h, pk, 0, -0.05, 0.5, 0.05); B_(h, lam('#fff'), 0, -0.2, 0.46, 0.1, 0.1, 0.03); S_(g, lam('#ffffff'), 0, 0.95, -1.75, 0.24); }
  };
  // ------------------------------------------------------------------ Karts (6 Bauarten) mit Figuren
  const KPAR = {
    allrounder: { seatY: 0.98, seatZ: -0.5, plateZ: -2.05, plateY: 1.05 },
    flitzer: { seatY: 0.9, seatZ: -0.55, plateZ: -2.2, plateY: 1.0 },
    buggy: { seatY: 1.2, seatZ: -0.45, plateZ: -2.45, plateY: 1.0 },
    cruiser: { seatY: 1.08, seatZ: -0.45, plateZ: -2.2, plateY: 1.2 },
    dragster: { seatY: 0.95, seatZ: -0.85, plateZ: -2.75, plateY: 1.15 },
    wolke: { seatY: 1.05, seatZ: -0.4, plateZ: -2.05, plateY: 1.15 },
    monster: { seatY: 2.05, seatZ: -0.45, plateZ: -2.3, plateY: 2.0 },
    retro: { seatY: 0.95, seatZ: -0.7, plateZ: -2.35, plateY: 0.95 },
    gleiter: { seatY: 1.15, seatZ: -0.35, plateZ: -2.0, plateY: 1.2 },
    funkbus: { seatY: 1.15, seatZ: 0.25, plateZ: -2.05, plateY: 1.4 }
  };
  const bananaMesh = () => { const g = new T.Group(), y = lam('#ffe14a', { emissive: 0x5a4a00 }), br = lam('#6a4a1a'); for (let i = 0; i < 7; i++) { const a = -1.0 + i * (2.0 / 6), r = 0.3 - Math.abs(a) * 0.05; S_(g, y, Math.sin(a) * 1.15, (1 - Math.cos(a)) * 1.1 + 0.15, 0, r + 0.12, r + 0.12, r + 0.12); } S_(g, br, Math.sin(-1.08) * 1.15, (1 - Math.cos(1.08)) * 1.1 + 0.15, 0, 0.14); S_(g, br, Math.sin(1.08) * 1.15, (1 - Math.cos(1.08)) * 1.1 + 0.15, 0, 0.14); g.scale.setScalar(1.3); return g; };
  const rockMesh = (sc) => { const m = new T.Mesh(geo('rock', () => new T.IcosahedronGeometry(1, 0)), lam('#8a8f9a')); m.scale.set(0.9 * (sc || 1), 0.8 * (sc || 1), 1.0 * (sc || 1)); return m; };

  // ------------------------------------------------------------------ KayKit-Fahrer (CC0): laden, in Sitzhaltung bringen, zu einem statischen Netz backen
  // Ein Draw-Call je Fahrer, keine Skelett-Animation im Rennen (handyfreundlich). Bis das Modell da ist, bleibt der Sitz leer.
  const KK = { cache: {}, wait: {}, pend: [], mats: {} };
  const loadGL = () => KK.gl || (KK.gl = window.THREE.GLTFLoader ? Promise.resolve() : new Promise((res, rej) => { const sc = document.createElement('script'); sc.src = '../vendor/three-r128-gltfloader.js'; sc.onload = res; sc.onerror = rej; document.head.appendChild(sc); }));
  function kkLoad(id) {
    if (!KK.wait[id]) KK.wait[id] = loadGL().then(() => new Promise((res, rej) => new T.GLTFLoader().load('models/kk/' + id + '.glb', g => { try { KK.cache[id] = kkBake(g.scene); } catch (e) { rej(e); return; } KK.pend = KK.pend.filter(p => { if (p.id !== id) return true; kkAttach(p.slot, id, p.C); return false; }); res(KK.cache[id]); }, undefined, rej)));
    KK.wait[id].catch(() => { delete KK.wait[id]; });
    return KK.wait[id];
  }
  function kkBake(root) {
    root.updateMatrixWorld(true);
    // GLTFLoader entfernt Punkte aus Knotennamen (upperarm.l → upperarml): beide Schreibweisen ablegen
    const bones = {}; root.traverse(o => { if (o.isBone) bones[o.name] = bones[o.name.replace(/\./g, '')] = o; }); const bn_ = n => bones[n] || bones[n.replace(/\./g, '')];
    const wp = (o, v) => o.getWorldPosition(v || new T.Vector3()), q = new T.Quaternion(), pq = new T.Quaternion(), a = new T.Vector3(), b = new T.Vector3();
    // Knochen so drehen, dass er (in Weltkoordinaten) in Richtung dir zeigt
    const aim = (bn, ch, dir) => { const B = bn_(bn), C = bn_(ch); if (!B || !C) return; root.updateMatrixWorld(true); const cur = wp(C, b).sub(wp(B, a)).normalize(); q.setFromUnitVectors(cur, dir.clone().normalize()); B.parent.getWorldQuaternion(pq); B.quaternion.premultiply(pq.clone().invert().multiply(q).multiply(pq)); };
    const hipY = bones.hips ? wp(bones.hips).y : 0.4;
    [1, -1].forEach(s => { const sd = s > 0 ? 'l' : 'r';
      aim('upperleg.' + sd, 'lowerleg.' + sd, new T.Vector3(s * 0.18, 0.12, 1)); aim('lowerleg.' + sd, 'foot.' + sd, new T.Vector3(s * 0.05, -1, 0.35));
      aim('upperarm.' + sd, 'lowerarm.' + sd, new T.Vector3(s * 0.32, -0.55, 1)); aim('lowerarm.' + sd, 'wrist.' + sd, new T.Vector3(-s * 0.32, 0.05, 1)); });
    if (bones.spine) { bones.spine.rotateX(0.12); }
    root.updateMatrixWorld(true);
    const hip = bones.hips ? wp(bones.hips) : new T.Vector3(0, hipY, 0), sc = 0.66 / Math.max(0.05, hipY);
    const pos = [], uv = [], idx = []; let map = null; const hb = { min: [1e9, 1e9, 1e9], max: [-1e9, -1e9, -1e9] };
    const fac = at => { const ar = at.array; return !at.normalized ? 1 : ar instanceof Int16Array ? 1 / 32767 : ar instanceof Uint16Array ? 1 / 65535 : ar instanceof Int8Array ? 1 / 127 : ar instanceof Uint8Array ? 1 / 255 : 1; };
    const v = new T.Vector3(), t = new T.Vector3(), acc = new T.Vector3(), M = new T.Matrix4();
    root.traverse(o => {
      if (!o.isMesh) return; const gm = o.geometry, P = gm.attributes.position, U = gm.attributes.uv, base = pos.length / 3, fp = fac(P), fu = U ? fac(U) : 1;
      if (!map && o.material && o.material.map) map = o.material.map;
      let Wm = null, SI = null, SW = null, fw = 1, HB = null;
      if (o.isSkinnedMesh) { const sk = o.skeleton; Wm = sk.bones.map((bn, i) => new T.Matrix4().multiplyMatrices(o.matrixWorld, o.bindMatrixInverse).multiply(bn.matrixWorld).multiply(sk.boneInverses[i]).multiply(o.bindMatrix)); SI = gm.attributes.skinIndex; SW = gm.attributes.skinWeight; fw = fac(SW); const hi = sk.bones.findIndex(bn => /^head$/i.test(bn.name)); if (hi >= 0) HB = i => { let bw = 0, bb = -1; for (let k = 0; k < 4; k++) { const w = [SW.getX(i), SW.getY(i), SW.getZ(i), SW.getW(i)][k]; if (w > bw) { bw = w; bb = [SI.getX(i), SI.getY(i), SI.getZ(i), SI.getW(i)][k]; } } return bb === hi; }; }
      for (let i = 0; i < P.count; i++) {
        v.set(Math.max(-1, P.getX(i) * fp), Math.max(-1, P.getY(i) * fp), Math.max(-1, P.getZ(i) * fp));
        if (Wm) { acc.set(0, 0, 0); let ws = 0; for (let k = 0; k < 4; k++) { const w = SW.getComponent ? SW.getComponent(i, k) * fw : [SW.getX(i), SW.getY(i), SW.getZ(i), SW.getW(i)][k] * fw; if (w <= 0) continue; const bi = [SI.getX(i), SI.getY(i), SI.getZ(i), SI.getW(i)][k]; t.copy(v).applyMatrix4(Wm[bi]); acc.addScaledVector(t, w); ws += w; } if (ws > 0) v.copy(acc.multiplyScalar(1 / ws)); else v.applyMatrix4(o.matrixWorld); }
        else v.applyMatrix4(M.copy(o.matrixWorld));
        pos.push((v.x - hip.x) * sc, (v.y - hip.y) * sc, (v.z - hip.z) * sc);
        if (HB && HB(i)) { const n = pos.length - 3; for (let k = 0; k < 3; k++) { hb.min[k] = Math.min(hb.min[k], pos[n + k]); hb.max[k] = Math.max(hb.max[k], pos[n + k]); } }
        if (U) uv.push(U.getX(i) * fu, U.getY(i) * fu); else uv.push(0, 0);
      }
      if (gm.index) for (let i = 0; i < gm.index.count; i++) idx.push(base + gm.index.getX(i)); else for (let i = 0; i < P.count; i++) idx.push(base + i);
    });
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); g.computeBoundingSphere();
    if (map) { map.encoding = T.sRGBEncoding; map.anisotropy = 4; map.needsUpdate = true; }
    if (hb.min[0] > hb.max[0]) { hb.min = [-0.35, 0.55, -0.3]; hb.max = [0.35, 1.25, 0.35]; }
    return { geo: g, map, hb };
  }
  // Eigene Kart-Rush-Figuren auf KayKit-Basis: Kleidung je Fahrer umgefärbt (Haut, Grau/Metall bleiben), dazu Erkennungsmerkmale am Kopf
  const hsl = (r, g, b) => { const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; if (mx === mn) return [0, 0, l]; const d = mx - mn, s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); let h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return [h / 6, s, l]; };
  const h2r = (p, q, t) => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 0.5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
  const skinPx = (h, s, l) => (h < 0.13 || h > 0.97) && s > 0.2 && l > 0.42 && l < 0.9;
  function kkTint(c, C) {
    const img = c.map && c.map.image; if (!img || !img.width) return null;
    const w = Math.min(512, img.width), h = Math.min(512, img.height), cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d'); g.drawImage(img, 0, 0, w, h);
    const D = g.getImageData(0, 0, w, h), px = D.data, uv = c.geo.attributes.uv.array, bins = new Float32Array(24);
    for (let i = 0; i < uv.length; i += 6) { const x = Math.min(w - 1, Math.max(0, uv[i] * w | 0)), y = Math.min(h - 1, Math.max(0, uv[i + 1] * h | 0)), k = (y * w + x) * 4, [hh, ss, ll] = hsl(px[k] / 255, px[k + 1] / 255, px[k + 2] / 255); if (ss > 0.22 && !skinPx(hh, ss, ll)) bins[(hh * 24 | 0) % 24] += ss; }
    let dom = 0; for (let b = 1; b < 24; b++) if (bins[b] > bins[dom]) dom = b;
    const ta = hsl(...new T.Color(C.acc).toArray()), tb = hsl(...new T.Color(C.body).toArray()), rot = ta[0] - (dom + 0.5) / 24, all = !!C.tintAll;
    for (let k = 0; k < px.length; k += 4) {
      let [hh, ss, ll] = hsl(px[k] / 255, px[k + 1] / 255, px[k + 2] / 255);
      if (skinPx(hh, ss, ll) && !all) continue;
      if (ss < 0.18) { if (!all || ll < 0.12) continue; hh = tb[0]; ss = Math.max(0.35, tb[1] * 0.8); ll = ll * 0.55 + tb[2] * 0.45; }
      else { hh = (hh + rot + 1) % 1; ss = Math.min(1, ss * 0.6 + ta[1] * 0.45); }
      const q = ll < 0.5 ? ll * (1 + ss) : ll + ss - ll * ss, p2 = 2 * ll - q; px[k] = h2r(p2, q, hh + 1 / 3) * 255; px[k + 1] = h2r(p2, q, hh) * 255; px[k + 2] = h2r(p2, q, hh - 1 / 3) * 255;
    }
    g.putImageData(D, 0, 0); const t = new T.CanvasTexture(cv); t.flipY = c.map.flipY; t.encoding = T.sRGBEncoding; t.anisotropy = 4; return t;
  }
  // Erkennungsmerkmale (eigene Geometrie) relativ zum Kopf der Figur
  function kkAcc(slot, C, hb) {
    const [x0, y0, z0] = hb.min, [x1, y1, z1] = hb.max, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, hw = (x1 - x0) / 2, top = y1, front = z1, g = new T.Group(); g.userData.keep = true; slot.add(g);
    const m = (geo, col, x, y, z, sx, sy, sz, rx, rz, glow) => { const o = new T.Mesh(geo, glow ? bas(col) : lam(col)); o.position.set(x, y, z); o.scale.set(sx, sy == null ? sx : sy, sz == null ? sx : sz); o.rotation.set(rx || 0, 0, rz || 0); g.add(o); return o; };
    const sph = shared.sphere, cone = geo('kc', () => new T.ConeGeometry(1, 1, 10)), cyl = geo('ky', () => new T.CylinderGeometry(1, 1, 1, 10)), tor = geo('kt', () => new T.TorusGeometry(1, 0.14, 8, 24));
    const two = fn => [-1, 1].forEach(s => fn(s)), acc = C.acc, skin = C.skin, body = C.body;
    switch (C.ac) {
      case 'fox': two(s => { m(cone, skin, cx + s * hw * 0.55, top - 0.02, cz - 0.02, 0.13, 0.3, 0.08, 0, -s * 0.25); m(cone, '#fff0e0', cx + s * hw * 0.55, top - 0.04, cz + 0.02, 0.07, 0.2, 0.03, 0, -s * 0.25); }); m(sph, skin, 0, 0.05, -0.42, 0.16, 0.16, 0.42, -0.5); m(sph, '#fff6ea', 0, 0.2, -0.78, 0.11, 0.11, 0.14); break;
      case 'cat': two(s => m(cone, skin, cx + s * hw * 0.6, top - 0.03, cz, 0.11, 0.2, 0.08, 0, -s * 0.3)); m(cyl, skin, 0, 0.2, -0.45, 0.05, 0.6, 0.05, -0.9); break;
      case 'bear': two(s => { m(sph, skin, cx + s * hw * 0.7, top - 0.05, cz, 0.12, 0.12, 0.06); m(sph, body, cx + s * hw * 0.7, top - 0.05, cz + 0.03, 0.065, 0.065, 0.04); }); break;
      case 'panda': two(s => m(sph, '#22232a', cx + s * hw * 0.7, top - 0.05, cz, 0.12, 0.12, 0.07)); break;
      case 'bunny': two(s => { m(sph, skin, cx + s * hw * 0.35, top + 0.22, cz - 0.03, 0.08, 0.3, 0.05, 0, -s * 0.12); m(sph, '#ffb0d0', cx + s * hw * 0.35, top + 0.22, cz, 0.045, 0.22, 0.02, 0, -s * 0.12); }); break;
      case 'frog': two(s => { m(sph, skin, cx + s * hw * 0.5, top + 0.02, cz + 0.08, 0.14); m(sph, '#ffffff', cx + s * hw * 0.5, top + 0.05, cz + 0.18, 0.08); m(sph, '#16161e', cx + s * hw * 0.5, top + 0.05, cz + 0.25, 0.04); }); break;
      case 'dragon': two(s => m(cone, '#ffe9a8', cx + s * hw * 0.45, top + 0.02, cz - 0.05, 0.06, 0.26, 0.06, -0.5, -s * 0.35)); for (let q = 0; q < 3; q++) m(cone, acc, 0, 0.5 - q * 0.18, -0.32 - q * 0.04, 0.06, 0.14, 0.04, -1.2); m(cyl, skin, 0, 0.05, -0.45, 0.08, 0.6, 0.08, -1.1); break;
      case 'unicorn': m(cone, '#ffd24a', cx, top + 0.12, cz + 0.12, 0.06, 0.34, 0.06, 0.45, 0, true); two(s => m(cone, '#fdfdff', cx + s * hw * 0.6, top - 0.02, cz - 0.02, 0.08, 0.16, 0.05, 0, -s * 0.3)); break;
      case 'penguin': m(cone, '#ffb020', cx, (y0 + y1) / 2 - 0.02, front + 0.06, 0.07, 0.16, 0.05, Math.PI / 2); break;
      case 'robot': m(cyl, '#d0d8e8', cx, top + 0.12, cz, 0.02, 0.25); m(sph, acc, cx, top + 0.27, cz, 0.06, 0.06, 0.06, 0, 0, true); two(s => m(cyl, '#d0d8e8', cx + s * hw * 1.02, (y0 + y1) / 2, cz, 0.08, 0.06, 0.08, 0, Math.PI / 2)); break;
      case 'alien': two(s => { m(cyl, skin, cx + s * hw * 0.4, top + 0.12, cz, 0.018, 0.26, 0.018, 0, -s * 0.3); m(sph, acc, cx + s * hw * 0.55, top + 0.26, cz, 0.05, 0.05, 0.05, 0, 0, true); }); break;
      case 'halo': m(tor, '#fff0a0', cx, top + 0.14, cz, hw * 0.8, hw * 0.8, 0.5, Math.PI / 2, 0, true); break;
      case 'crystals': for (let q = 0; q < 5; q++) m(cone, q % 2 ? '#d2f5ff' : acc, cx + (q - 2) * hw * 0.32, top + 0.02, cz - Math.abs(q - 2) * 0.05, 0.06, 0.2 + (2 - Math.abs(q - 2)) * 0.08, 0.06, 0, (q - 2) * 0.25, true); break;
      case 'sprout': m(cyl, '#3a8a2a', cx, top + 0.07, cz, 0.015, 0.14); two(s => m(sph, '#8bdd59', cx + s * 0.07, top + 0.15, cz, 0.08, 0.025, 0.045, 0, -s * 0.4)); m(sph, '#ffb0d0', cx, top + 0.17, cz, 0.035); break;
      case 'stone': for (let q = 0; q < 6; q++) { const a = q / 6 * Math.PI * 2; m(cone, '#a4957e', cx + Math.cos(a) * hw * 0.7, top + 0.04, cz + Math.sin(a) * hw * 0.6, 0.06, 0.14, 0.06); } m(tor, '#d4ad6d', cx, top - 0.02, cz, hw * 0.75, hw * 0.75, 0.6, Math.PI / 2); break;
      case 'flames': for (let q = 0; q < 5; q++) m(cone, q % 2 ? '#ffd24a' : '#ff7a1a', cx + (q - 2) * hw * 0.28, top + 0.08, cz - 0.04, 0.07, 0.24 + (2 - Math.abs(q - 2)) * 0.08, 0.07, -0.3, (q - 2) * 0.2, true); break;
      case 'shards': for (let q = 0; q < 4; q++) m(geo('ko', () => new T.OctahedronGeometry(1, 0)), q % 2 ? acc : '#a971fc', cx + (q - 1.5) * hw * 0.4, top + 0.12 + (q % 2) * 0.05, cz, 0.05, 0.14, 0.05, 0, (q - 1.5) * 0.3, true); break;
      case 'flower': for (let q = 0; q < 5; q++) { const a = q / 5 * Math.PI * 2; m(sph, '#ff93ce', cx + hw * 0.55 + Math.cos(a) * 0.06, top - 0.02 + Math.sin(a) * 0.06, cz + 0.08, 0.05, 0.05, 0.02); } m(sph, '#ffd24a', cx + hw * 0.55, top - 0.02, cz + 0.1, 0.035); break;
      case 'goggles': two(s => { m(tor, '#2a2d3a', cx + s * hw * 0.38, top - 0.06, front - 0.04, 0.09, 0.09, 0.4); m(sph, '#8ae8ff', cx + s * hw * 0.38, top - 0.06, front - 0.02, 0.075, 0.075, 0.02, 0, 0, true); }); break;
    }
  }
  function kkAttach(slot, id, C) {
    const c = KK.cache[id]; if (!c) return; const key = C && C.ac ? id + '|' + C.id : id;
    if (!KK.mats[key]) { const map = C && C.ac ? kkTint(c, C) || c.map : c.map; KK.mats[key] = new T.MeshLambertMaterial({ map, color: map ? 0xffffff : 0xcccccc }); }
    const m = new T.Mesh(c.geo, KK.mats[key]); m.userData.keep = true; slot.add(m); if (C && C.ac) kkAcc(slot, C, c.hb);
  }
  // Zotik: echtes Modell aus dem Zotik-Spiel (zotik-fox.js, wird erst bei Bedarf geladen)
  const ZF = { wait: null, pend: [] };
  function zotikSlot(slot) {
    const put = () => { try { slot.add(ZotikFox.driver()); } catch (e) {} };
    if (window.ZotikFox) return put();
    ZF.pend.push(put); if (!ZF.wait) ZF.wait = new Promise((res, rej) => { const sc = document.createElement('script'); sc.src = 'zotik-fox.js?v=20261115-wt8'; sc.onload = res; sc.onerror = rej; document.head.appendChild(sc); }).then(() => { ZF.pend.splice(0).forEach(f => f()); }, () => { ZF.wait = null; });
    return ZF.wait;
  }
  function kkSlot(slot, id, C) { if (KK.cache[id]) kkAttach(slot, id, C); else { KK.pend.push({ slot, id, C }); kkLoad(id).catch(() => {}); } }
  // Vor dem Rennen: alle benötigten KayKit-Fahrer laden (höchstens ms warten)
  function prepare(chars, ms) { const cs = chars.map(i => CHARS[i % CHARS.length]), ids = [...new Set(cs.map(c => c.kk).filter(Boolean))], jobs = ids.map(id => kkLoad(id).catch(() => {})); if (cs.some(c => c.fox) && !window.ZotikFox) jobs.push(Promise.resolve(zotikSlot(new T.Group())).catch(() => {})); if (!jobs.length) return Promise.resolve(); return Promise.race([Promise.all(jobs), new Promise(r => setTimeout(r, ms || 6000))]); }
  // Kart-Look je Figur: Zierfarbe, Wappen (statt Sender-Logos) und Anbauteile passend zur Figur
  const kTrim = C => { const a = new T.Color(C.acc), b = new T.Color(C.body), ha = {}, hb = {}; a.getHSL(ha); b.getHSL(hb); return Math.abs(ha.l - hb.l) + Math.abs(ha.h - hb.h) * 0.5 > 0.18 ? C.body : (ha.l > 0.6 ? '#1c1f2e' : '#ffffff'); };
  const EM = {};
  const emblemMat = C => EM[C.id] || (EM[C.id] = new T.MeshBasicMaterial({ transparent: true, map: canvasTex(128, 128, (g, w) => { g.beginPath(); g.arc(64, 64, 60, 0, PI2); g.fillStyle = C.acc; g.fill(); g.beginPath(); g.arc(64, 64, 48, 0, PI2); g.fillStyle = kTrim(C); g.fill(); g.lineWidth = 6; g.strokeStyle = '#ffffff'; g.stroke(); g.fillStyle = C.acc; g.font = '900 64px Fredoka, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(C.name[0], 64, 68); }) }));
  const DECO = { fox: 'ears', cat: 'ears', bear: 'round', panda: 'round', bunny: 'long', frog: 'eyes', dragon: 'spikes', unicorn: 'horn', penguin: 'fins', robot: 'antenna', alien: 'antenna', halo: 'star', crystals: 'gems', sprout: 'leaf', stone: 'rocks', flames: 'spikes', shards: 'gems', flower: 'leaf', goggles: 'stripe' };
  const DECO_ID = { rovan: 'shield', lyra: 'star', nia: 'leaf', brakk: 'shield', kira: 'stripe', raven: 'fins', klapper: 'bones', moira: 'gems', zotik: 'ears' };
  function kartDeco(body, C, id) {
    const kind = DECO[C.ac] || DECO_ID[C.id]; if (!kind) return;
    const bb = new T.Box3().setFromObject(body), fz = bb.max.z - 0.35, fy = clamp(bb.min.y + (bb.max.y - bb.min.y) * 0.45, 0.6, 2.2), ty = bb.max.y, rz = bb.min.z + 0.4, hw = Math.min(1.1, (bb.max.x - bb.min.x) / 2);
    const A = lam(C.acc), B = lam(kTrim(C)), Sk = lam(C.skin), glow = bas(new T.Color(C.acc).offsetHSL(0, 0, 0.15)), white = lam('#ffffff'), ink = lam('#1c1f2e');
    const two = f => [-1, 1].forEach(f);
    switch (kind) {
      case 'ears': two(s => { C_(body, Sk, s * 0.42, fy + 0.5, fz - 0.15, 0.24, 0.55, [0, 0, -s * 0.25], 4); C_(body, white, s * 0.42, fy + 0.45, fz - 0.08, 0.12, 0.3, [0, 0, -s * 0.25], 4); }); if (C.id === 'zotik') C_(body, lam('#f08a3a'), 0, fy + 0.6, rz - 0.4, 0.35, 1.3, [-1.9, 0, 0], 8); break;
      case 'round': two(s => S_(body, C.ac === 'panda' ? ink : Sk, s * 0.45, fy + 0.45, fz - 0.15, 0.22, 0.22, 0.12)); break;
      case 'long': two(s => S_(body, Sk, s * 0.28, fy + 0.75, fz - 0.25, 0.13, 0.55, 0.08, [0, 0, -s * 0.2])); break;
      case 'eyes': two(s => { S_(body, white, s * 0.4, fy + 0.35, fz - 0.05, 0.22); S_(body, ink, s * 0.4, fy + 0.37, fz + 0.12, 0.1); }); break;
      case 'spikes': for (let j = 0; j < 4; j++) C_(body, A, 0, ty - 0.1 - j * 0.05, rz + 0.25 + j * 0.45, 0.18, 0.5, [-0.4, 0, 0], 5); two(s => C_(body, A, s * (hw + 0.1), fy + 0.2, rz + 0.6, 0.2, 0.9, [0, 0, -s * 1.2], 4)); break;
      case 'horn': C_(body, lam('#ffe88a'), 0, fy + 0.45, fz + 0.15, 0.13, 0.9, [1.1, 0, 0], 8); break;
      case 'fins': two(s => B_(body, B, s * (hw + 0.2), fy, rz + 0.8, 0.08, 0.5, 0.9, [0, 0, -s * 0.5])); break;
      case 'antenna': two(s => { Y_(body, lam('#d0d8e8'), s * 0.45, ty + 0.25, rz + 0.3, 0.04, 0.9, null, 5); S_(body, glow, s * 0.45, ty + 0.72, rz + 0.3, 0.14); }); break;
      case 'star': { const st = new T.Mesh(geo('oct', () => new T.OctahedronGeometry(1, 0)), glow); st.scale.setScalar(0.3); st.position.set(0, fy + 0.45, fz); body.add(st); break; }
      case 'gems': [-1, 0, 1].forEach(q => { const m = new T.Mesh(geo('oct', () => new T.OctahedronGeometry(1, 0)), glow); m.scale.set(0.16, q ? 0.34 : 0.5, 0.16); m.position.set(q * 0.45, ty + 0.1, rz + 0.35); body.add(m); }); break;
      case 'leaf': two(s => S_(body, lam(C.ac === 'flower' ? '#ffe56f' : '#5ac84a'), s * 0.4, fy + 0.35, fz - 0.1, 0.3, 0.06, 0.18, [0, s * 0.5, s * 0.4])); break;
      case 'rocks': two(s => { const m = new T.Mesh(geo('rock', () => new T.IcosahedronGeometry(1, 0)), lam('#a4957e')); m.scale.setScalar(0.32); m.position.set(s * (hw - 0.1), fy + 0.3, fz - 0.2); body.add(m); }); break;
      case 'stripe': B_(body, B, 0, ty - 0.02, (fz + rz) / 2, 0.32, 0.04, fz - rz); break;
      case 'shield': { const m = part(body, geo('y16', () => new T.CylinderGeometry(1, 1, 1, 16)), B, 0, fy + 0.15, fz + 0.12, 0.42, 0.06, 0.42, Math.PI / 2, 0, 0); void m; S_(body, A, 0, fy + 0.15, fz + 0.17, 0.16, 0.16, 0.05); break; }
      case 'bones': two(s => Y_(body, lam('#e8e8e0'), s * (hw + 0.05), fy + 0.2, (fz + rz) / 2, 0.07, 1.6, [Math.PI / 2, 0, 0], 6)); break;
    }
  }
  function makeKart(k) {
    const C = CHARS[(k.char == null ? k.k : k.char) % CHARS.length], KD = KARTS[(k.kart || 0) % KARTS.length], P = KPAR[KD.id], fn = CH[C.model || C.id], g = new T.Group(), body = new T.Group(); g.add(body);
    const hull = lam(C.acc), dark = lam('#1c1f2e'), white = lam('#f4f6fb'), chrome = lam('#d0d8e8'), slot = lam(kTrim(C)), skinM = lam(C.skin), bodyM = lam(C.body), tire = lam('#16161e'), rim = lam('#d8dff0');
    let wf = [0.5, 0.45, 1.0, 1.38], wr = [0.68, 0.7, 1.08, -1.15];   // [Radius, Breite, x, z]
    const id = KD.id;
    if (id === 'allrounder') {
      S_(body, hull, 0, 0.62, 0.05, 0.98, 0.4, 1.7); S_(body, hull, 0, 0.5, 1.55, 0.6, 0.28, 0.8); S_(body, white, 0, 0.42, 2.12, 0.55, 0.14, 0.2); B_(body, dark, 0, 0.36, 0, 1.5, 0.14, 2.9);
      [-1, 1].forEach(s => { S_(body, white, s * 1.0, 0.56, -0.2, 0.3, 0.28, 0.95); S_(body, slot, s * 0.92, 0.9, -0.4, 0.05, 0.05, 0.55); });
      B_(body, dark, 0, 0.85, -1.5, 1.25, 0.5, 0.6); [-1, 1].forEach(s => Y_(body, chrome, s * 0.36, 0.78, -1.88, 0.12, 0.5, [Math.PI / 2, 0, 0]));
      [-1, 1].forEach(s => B_(body, dark, s * 0.55, 1.15, -1.78, 0.1, 0.55, 0.1)); B_(body, slot, 0, 1.5, -1.9, 2.0, 0.12, 0.55);
    } else if (id === 'flitzer') {
      wf = [0.42, 0.4, 1.1, 1.9]; wr = [0.62, 0.8, 1.12, -1.2];
      S_(body, hull, 0, 0.55, 0, 0.9, 0.32, 2.0); C_(body, hull, 0, 0.5, 2.2, 0.34, 1.9, [Math.PI / 2, 0, 0], 10); B_(body, dark, 0, 0.34, 0, 1.4, 0.12, 3.2);
      B_(body, slot, 0, 0.33, 3.0, 2.4, 0.07, 0.55); [-1, 1].forEach(s => { B_(body, slot, s * 1.2, 0.5, 3.0, 0.06, 0.4, 0.6); B_(body, white, s * 0.62, 0.65, 0.3, 0.12, 0.12, 1.6); S_(body, white, s * 0.85, 0.5, -0.4, 0.26, 0.22, 0.8); });
      B_(body, dark, 0, 0.8, -1.55, 1.0, 0.45, 0.6); [-1, 1].forEach(s => { Y_(body, chrome, s * 0.3, 0.8, -1.95, 0.1, 0.45, [Math.PI / 2, 0, 0]); B_(body, dark, s * 0.5, 1.15, -1.85, 0.1, 0.5, 0.1); }); B_(body, slot, 0, 1.4, -1.95, 2.5, 0.1, 0.6); [-1, 1].forEach(s => B_(body, slot, s * 1.25, 1.35, -1.95, 0.06, 0.3, 0.6));
    } else if (id === 'buggy') {
      wf = [0.68, 0.55, 1.12, 1.3]; wr = [0.82, 0.75, 1.1, -1.05];
      B_(body, dark, 0, 0.62, 0, 1.2, 0.18, 2.6); S_(body, hull, 0, 0.92, 0.25, 0.8, 0.34, 1.3); S_(body, hull, 0, 0.85, 1.5, 0.5, 0.26, 0.55); B_(body, dark, 0, 0.78, -1.4, 1.1, 0.45, 0.7);
      [-1, 1].forEach(s => { B_(body, hull, s * 1.1, 1.1, 1.3, 0.55, 0.1, 1.0); B_(body, hull, s * 1.2, 1.18, -1.05, 0.6, 0.1, 1.2); [0.3, -1.1].forEach(z => Y_(body, chrome, s * 0.65, 1.55, z, 0.055, 1.4, null, 6)); Y_(body, chrome, s * 0.65, 2.22, -0.4, 0.055, 1.5, [Math.PI / 2, 0, 0], 6); });
      Y_(body, chrome, 0, 2.22, 0.3, 0.055, 1.35, [0, 0, Math.PI / 2], 6); Y_(body, chrome, 0, 2.22, -1.1, 0.055, 1.35, [0, 0, Math.PI / 2], 6);
      [-1, 1].forEach(s => Y_(body, chrome, s * 0.38, 1.25, -1.82, 0.1, 0.9, null, 8));
      const spare = Y_(body, tire, 0, 1.18, -1.95, 0.55, 0.4, [Math.PI / 2, 0, 0], 14); Y_(body, rim, 0, 1.18, -2.16, 0.3, 0.06, [Math.PI / 2, 0, 0], 12);
    } else if (id === 'cruiser') {
      wf = [0.58, 0.6, 1.16, 1.4]; wr = [0.74, 0.95, 1.2, -1.1];
      S_(body, hull, 0, 0.7, 0.0, 1.22, 0.5, 1.75); S_(body, hull, 0, 0.58, 1.6, 0.9, 0.38, 0.75); B_(body, dark, 0, 0.38, 0, 1.8, 0.16, 3.0);
      B_(body, chrome, 0, 0.55, 2.2, 2.3, 0.24, 0.3); B_(body, chrome, 0, 0.55, -2.0, 2.2, 0.24, 0.3); [-1, 1].forEach(s => { S_(body, bas(0xfff2a0), s * 0.6, 0.78, 2.1, 0.17); Y_(body, chrome, s * 1.28, 0.75, -0.4, 0.12, 2.0, [Math.PI / 2, 0, 0], 8); B_(body, slot, s * 0.9, 1.25, -1.6, 0.14, 0.7, 0.9); });
      B_(body, dark, 0, 0.95, -1.5, 1.4, 0.5, 0.7); [-1, 1].forEach(s => Y_(body, chrome, s * 0.4, 0.9, -1.9, 0.14, 0.4, [Math.PI / 2, 0, 0]));
    } else if (id === 'dragster') {
      wf = [0.38, 0.25, 0.72, 2.3]; wr = [0.92, 1.05, 1.18, -1.5];
      S_(body, hull, 0, 0.62, 0.3, 0.7, 0.3, 2.4); C_(body, hull, 0, 0.58, 2.7, 0.26, 1.1, [Math.PI / 2, 0, 0], 10); B_(body, dark, 0, 0.4, 0.2, 1.1, 0.12, 3.8);
      B_(body, chrome, 0, 1.05, -1.65, 0.95, 0.5, 0.85); [-1, 1].forEach(s => C_(body, chrome, s * 0.28, 1.5, -1.65, 0.12, 0.5, null, 8)); Y_(body, chrome, 0, 1.45, -1.3, 0.3, 0.4, null, 12);
      [-1, 1].forEach(s => { B_(body, dark, s * 0.9, 1.4, -2.3, 0.1, 0.9, 0.1); B_(body, white, s * 0.9, 0.65, -0.8, 0.1, 0.12, 2.0); }); B_(body, slot, 0, 1.95, -2.4, 3.0, 0.12, 0.7); [-1, 1].forEach(s => B_(body, slot, s * 1.5, 1.7, -2.4, 0.07, 0.6, 0.8));
      Y_(body, dark, 0, 1.0, -2.6, 0.28, 0.5, [Math.PI / 2, 0, 0], 10); B_(body, slot, 0, 0.45, 3.4, 1.7, 0.06, 0.45);
    } else if (id === 'monster') {
      wf = [1.0, 0.85, 1.35, 1.35]; wr = [1.0, 0.85, 1.35, -1.25];
      B_(body, dark, 0, 1.05, 0, 1.6, 0.3, 3.0); [-1, 1].forEach(s => { Y_(body, chrome, s * 0.55, 1.35, 1.3, 0.1, 0.6, null, 6); Y_(body, chrome, s * 0.55, 1.35, -1.2, 0.1, 0.6, null, 6); });
      B_(body, hull, 0, 1.75, 0.05, 2.2, 0.55, 3.3); B_(body, hull, 0, 1.6, 1.55, 2.1, 0.45, 0.6); B_(body, chrome, 0, 1.5, 1.95, 2.2, 0.25, 0.3);
      [-1, 1].forEach(s => { S_(body, bas(0xfff2a0), s * 0.7, 1.75, 1.88, 0.18); B_(body, slot, s * 1.12, 1.95, 0, 0.06, 0.25, 3.0); B_(body, dark, s * 0.6, 2.35, 0.9, 0.12, 0.5, 0.12); });
      B_(body, dark, 0, 2.6, 0.9, 1.4, 0.12, 0.3); [-1, 0, 1].forEach(x => S_(body, bas(0xffe14a), x * 0.45, 2.75, 0.95, 0.12));
    } else if (id === 'retro') {
      wf = [0.5, 0.35, 1.05, 1.55]; wr = [0.62, 0.4, 1.05, -1.25];
      S_(body, hull, 0, 0.7, 0.9, 0.75, 0.45, 1.5); Y_(body, chrome, 0, 0.75, 2.25, 0.42, 0.2, [Math.PI / 2, 0, 0], 16); S_(body, hull, 0, 0.62, -0.9, 0.95, 0.45, 1.3); B_(body, dark, 0, 0.38, 0, 1.3, 0.12, 3.6);
      [-1, 1].forEach(s => { Y_(body, hull, s * 1.05, 0.55, 1.5, 0.35, 0.9, [Math.PI / 2, 0, 0], 10); Y_(body, hull, s * 1.05, 0.62, -1.25, 0.4, 0.9, [Math.PI / 2, 0, 0], 10); B_(body, chrome, s * 0.85, 0.4, 0.15, 0.25, 0.08, 1.6); S_(body, bas(0xfff2a0), s * 0.45, 0.95, 2.05, 0.16); Y_(body, chrome, s * 0.45, 0.95, 1.98, 0.2, 0.08, [Math.PI / 2, 0, 0], 12); });
      Y_(body, chrome, 0, 1.0, 1.6, 0.05, 0.6, [0.4, 0, 0], 6); B_(body, white, 0, 0.98, 0.35, 1.1, 0.04, 0.5, [0.5, 0, 0]);
    } else if (id === 'gleiter') {
      wf = [0.32, 0.25, 0.85, 1.3]; wr = [0.36, 0.25, 0.85, -1.2];
      S_(body, hull, 0, 0.95, 0, 1.25, 0.32, 2.0); S_(body, white, 0, 0.82, 0, 1.6, 0.12, 1.6); S_(body, slot, 0, 0.78, 0, 1.68, 0.06, 1.68); C_(body, hull, 0, 0.95, 2.0, 0.42, 1.2, [Math.PI / 2, 0, 0], 10);
      const ring = part(body, geo('tor', () => new T.TorusGeometry(1, 0.2, 6, 14)), bas(0x66e0ff), 0, 0.45, 0, 1.25, 1.25, 1.25, Math.PI / 2, 0, 0); void ring;
      [-1, 1].forEach(s => { B_(body, hull, s * 1.55, 1.05, -0.6, 1.1, 0.08, 0.7, [0, s * 0.25, s * -0.2]); S_(body, bas(0x66e0ff), s * 2.05, 1.18, -0.75, 0.16); }); B_(body, slot, 0, 1.45, -1.55, 0.08, 0.7, 0.6);
    } else if (id === 'funkbus') {
      wf = [0.58, 0.5, 1.1, 1.45]; wr = [0.6, 0.5, 1.1, -1.35];
      B_(body, hull, 0, 1.0, 0, 2.1, 1.0, 4.0); B_(body, white, 0, 1.55, 0, 2.15, 0.12, 4.05); B_(body, hull, 0, 1.75, -1.2, 2.1, 0.45, 1.6); B_(body, dark, 0, 0.45, 0, 1.9, 0.2, 3.9);
      [-1, 1].forEach(s => { [-1.1, 0, -0.1].forEach(() => {}); for (let q = 0; q < 3; q++) B_(body, lam('#bfe8ff'), s * 1.06, 1.15, 1.1 - q * 1.05, 0.04, 0.45, 0.8); S_(body, bas(0xfff2a0), s * 0.7, 0.95, 2.02, 0.17); });
      B_(body, lam('#bfe8ff'), 0, 1.85, 1.75, 1.7, 0.55, 0.05, [-0.35, 0, 0]); B_(body, slot, 0, 2.05, -1.2, 1.9, 0.18, 1.0); Y_(body, chrome, 0.7, 2.6, -1.6, 0.04, 1.2, null, 6); S_(body, bas(0xff2d95), 0.7, 3.22, -1.6, 0.1);
    } else {   // wolke
      wf = [0.5, 0.42, 1.0, 1.3]; wr = [0.58, 0.5, 1.05, -1.05];
      const cl = lam('#ffffff'); S_(body, cl, 0, 0.78, 0, 1.0, 0.5, 1.5); [[-0.8, 0.5], [0.8, 0.5], [-0.75, -0.7], [0.75, -0.7]].forEach(p => S_(body, cl, p[0], 0.7, p[1], 0.55, 0.45, 0.65)); S_(body, cl, 0, 0.68, 1.4, 0.65, 0.42, 0.7); S_(body, cl, 0, 0.7, -1.3, 0.7, 0.45, 0.6);
      S_(body, hull, 0, 0.36, 0, 1.15, 0.1, 1.9); S_(body, slot, 0, 0.36, 0, 1.2, 0.04, 1.95);
      [-1, 1].forEach(s => { const w = B_(body, slot, s * 1.55, 1.15, -0.4, 0.9, 0.08, 0.5, [0, 0, s * 0.35]); S_(body, bas(0xffe88a), s * 0.5, 1.2, 1.9, 0.12); });
      S_(body, bas(0xffe88a), 0, 1.35, 1.6, 0.16); B_(body, white, 0, 0.8, -1.7, 0.9, 0.5, 0.5);
    }
    // Heckplatte und Seiten mit dem Wappen des Fahrers, dazu figurenpassende Anbauteile
    const em = emblemMat(C); B_(body, white, 0, P.plateY, P.plateZ, 1.05, 1.05, 0.06); const lg = new T.Mesh(new T.PlaneGeometry(0.95, 0.95), em); lg.position.set(0, P.plateY, P.plateZ - 0.04); lg.rotation.y = Math.PI; body.add(lg);
    [-1, 1].forEach(s => { const st = new T.Mesh(new T.PlaneGeometry(0.85, 0.85), em); st.position.set(s * (id === 'cruiser' ? 1.28 : id === 'monster' ? 1.12 : id === 'funkbus' ? 1.07 : id === 'gleiter' ? 1.3 : 1.12), id === 'monster' ? 1.72 : id === 'funkbus' ? 0.95 : id === 'gleiter' ? 0.95 : 0.62, id === 'funkbus' ? -1.6 : 0.2); st.rotation.y = s * Math.PI / 2; body.add(st); if (id === 'allrounder') st.position.x = s * 1.31; });
    kartDeco(body, C, id);
    // Sitz, Lenkrad
    B_(body, dark, 0, P.seatY, P.seatZ, 0.95, 0.4, 0.8); B_(body, dark, 0, P.seatY + 0.4, P.seatZ - 0.42, 0.95, 0.75, 0.22); Y_(body, dark, 0, P.seatY + 0.12, P.seatZ + 0.95, 0.05, 0.7, [-0.9, 0, 0], 6); part(body, geo('tor', () => new T.TorusGeometry(1, 0.2, 6, 14)), slot, 0, P.seatY + 0.4, P.seatZ + 0.68, 0.24, 0.24, 0.24, -0.9, 0, 0);
    // Fahrer
    if (C.kk || C.fox) { const slot = new T.Group(); slot.position.set(0, P.seatY + 0.22, P.seatZ - 0.08); body.add(slot); if (C.fox) zotikSlot(slot); else kkSlot(slot, C.kk, C); }
    const torso = new T.Group(); torso.position.set(0, P.seatY + 0.52, P.seatZ - 0.05); torso.scale.setScalar(1.28); if (!C.kk && !C.fox) body.add(torso); S_(torso, bodyM, 0, 0, 0, 0.5, 0.52, 0.38);
    [-1, 1].forEach(s => { const arm = new T.Group(); arm.position.set(s * 0.46, 0.2, 0.0); arm.rotation.set(-1.15, 0, s * 0.12); torso.add(arm); Y_(arm, bodyM, 0, -0.38, 0, 0.1, 0.78, null, 8); S_(arm, skinM, 0, -0.8, 0, 0.12); });
    const head = new T.Group(); head.position.set(0, 0.88, 0.02); torso.add(head); const own = C.kk || C.fox; if (fn && !own) fn(head, torso, body, C);
    // Eigenständige Cup-Silhouetten – nur originale Geometrie, kein fremdes Figurenasset.
    if (C.model && !own) {
      const accent = lam(C.acc), secondary = lam(C.body);
      const gem = (x,y,z,size,color) => {
        const m = new T.Mesh(new T.OctahedronGeometry(size,0),color || accent);
        m.position.set(x,y,z); head.add(m); return m;
      };
      if (C.id === 'lichtfunke') {
        gem(0,1.2,0.05,0.32); [-1,1].forEach(q => gem(q*0.58,0.7,-0.12,0.21));
        const halo = new T.Mesh(new T.TorusGeometry(0.54,0.075,6,20),accent);halo.position.y=1.05;halo.rotation.x=0.3;head.add(halo);
      } else if (C.id === 'kristall') {
        [-1,0,1].forEach(q=>{const m=gem(q*0.37,0.88,-0.1,0.31);m.scale.y=q===0?1.8:1.2;});
        B_(head,secondary,0,0.25,0.52,0.68,0.25,0.13);
      } else if (C.id === 'knospe') {
        [-1,1].forEach(q=>{const m=new T.Mesh(new T.ConeGeometry(0.27,0.95,7),accent);m.position.set(q*0.37,0.94,-0.05);m.rotation.z=q*0.35;head.add(m);});
        gem(0,1.18,0.1,0.2);
      } else if (C.id === 'ruinen') {
        const helm=new T.Mesh(new T.CylinderGeometry(0.66,0.56,0.4,7),secondary);helm.position.y=0.57;head.add(helm);
        [-1,1].forEach(q=>gem(q*0.57,0.72,0.08,0.18));
      } else if (C.id === 'flammenflug') {
        for(let n=0;n<3;n++){const m=new T.Mesh(new T.ConeGeometry(0.22,0.76,7),accent);m.position.set((n-1)*0.33,1.0-n*0.1,-0.25);m.rotation.z=(n-1)*0.28;head.add(m);}
      } else if (C.id === 'splitter') {
        [-1,1].forEach(q=>{const m=gem(q*0.62,0.78,0,0.3);m.rotation.z=q*0.4;});
        gem(0,1.22,-0.2,0.43);
      } else if (C.id === 'insel') {
        const flower = new T.Group();flower.position.set(0.6,0.65,0.22);head.add(flower);
        for(let n=0;n<5;n++){const m=new T.Mesh(new T.SphereGeometry(0.17,7,5),accent);m.position.set(Math.cos(n*2*Math.PI/5)*0.24,Math.sin(n*2*Math.PI/5)*0.24,0);flower.add(m);}
        const center=new T.Mesh(new T.SphereGeometry(0.17,7,5),lam('#ffe56f'));flower.add(center);
      }
    }
    // Räder
    const wheels = []; const wg_ = geo('wt', () => new T.CylinderGeometry(1, 1, 1, 16).rotateZ(Math.PI / 2));
    [[-1, wf], [1, wf], [-1, wr], [1, wr]].forEach((p, i) => { const q = p[1], front = i < 2, wg = new T.Group(); wg.position.set(p[0] * q[2], q[0], q[3]); const spin = new T.Group(); wg.add(spin);
      part(spin, wg_, tire, 0, 0, 0, q[1], q[0], q[0]); part(spin, wg_, rim, p[0] * 0.03, 0, 0, q[1] * 1.04, q[0] * 0.55, q[0] * 0.55); B_(spin, slot, p[0] * q[1] * 0.55, 0, 0, 0.05, q[0] * 0.9, 0.12); B_(spin, slot, p[0] * q[1] * 0.55, 0, 0, 0.05, 0.12, q[0] * 0.9); g.add(wg); wheels.push({ wg, w: spin, front }); });
    const fz = id === 'dragster' ? -3.3 : -3.0, flame = new T.Mesh(new T.ConeGeometry(0.4, 1.8, 8), bas(0x66ccff, { transparent: true, opacity: 0.85, blending: T.AdditiveBlending })); flame.rotation.x = -Math.PI / 2; flame.position.set(0, 0.8, fz); flame.visible = false; g.add(flame); const core = new T.Mesh(flame.geometry, bas(0xfff2b0, { transparent: true, opacity: 0.95, blending: T.AdditiveBlending, depthWrite: false })); core.scale.set(0.5, 0.6, 0.5); core.position.y = 0.25; flame.add(core); const fl2 = new T.Mesh(flame.geometry, bas(0xff6a1a, { transparent: true, opacity: 0.7, blending: T.AdditiveBlending, depthWrite: false })); fl2.scale.set(1.5, 1.25, 1.5); fl2.position.y = -0.2; flame.add(fl2);
    const shield = new T.Mesh(shared.sphere, bas(0x66e0ff, { transparent: true, opacity: 0.28, blending: T.AdditiveBlending, depthWrite: false })); shield.scale.set(2.6, 2.3, 3.2); shield.position.y = 1.3; shield.visible = false; g.add(shield);
    const sp = new T.Points(new T.BufferGeometry().setAttribute('position', new T.BufferAttribute(new Float32Array(30), 3)), new T.PointsMaterial({ size: 0.75, color: 0xffd24a, map: shared.dot, transparent: true, depthWrite: false, blending: T.AdditiveBlending })); sp.frustumCulled = false; sp.visible = false; g.add(sp);
    const blob = new T.Mesh(new T.CircleGeometry(1.7, 14), bas(0x000000, { transparent: true, opacity: 0.35 })); blob.rotation.x = -Math.PI / 2; blob.position.y = 0.05; g.add(blob);
    const stars = new T.Group(); for (let i = 0; i < 3; i++) { const s = new T.Mesh(shared.sphere, bas(0xffe14a)); s.scale.setScalar(0.2); stars.add(s); } stars.visible = false; g.add(stars);
    const trailB = new T.Group(), trailR = new T.Group(); for (let i = 0; i < 3; i++) { const b = bananaMesh(); b.visible = false; trailB.add(b); const r = rockMesh(0.7); r.visible = false; trailR.add(r); } g.add(trailB); g.add(trailR);
    g.scale.setScalar(1.1); scene.add(g); return { g, body, wheels, flame, shield, sp, stars, trailB, trailR, k, head, pit: 0, lvf: 0 };
  }
  // Nur für Tests/Vorschau: alle Figuren/Karts nebeneinander
  function gallery(mode) { if (world) world.visible = false; const gp = new T.Mesh(new T.PlaneGeometry(400, 400), lam('#8fd870')); gp.rotation.x = -Math.PI / 2; scene.add(gp); CHARS.forEach((c, i) => { const m = makeKart({ k: i, logo: i, char: mode === 'karts' ? 1 : i, kart: mode === 'karts' ? i % 6 : 0 }); m.g.position.set((i % 6 - 2.5) * 6.2, 0, Math.floor(i / 6) * -8); m.g.rotation.y = 0.55; }); }
  function peek(x, y, z, lx, ly, lz, w, h) { const c = mcam(); c.position.set(x, y, z); c.lookAt(lx, ly, lz); c.aspect = w / h; c.updateProjectionMatrix(); sky.position.copy(c.position); if (skyGroup) skyGroup.position.copy(c.position); renderer.setViewport(0, 0, W, H); renderer.setScissor(0, 0, W, H); renderer.render(scene, c); }
  // ------------------------------------------------------------------ Effekte (Partikel, Blitze)
  const FXN = 420, fxPos = new Float32Array(FXN * 3).fill(-100), fxCol = new Float32Array(FXN * 3), fxVel = new Float32Array(FXN * 3), fxLife = new Float32Array(FXN); let fxPts = null, fxHead = 0;
  function initFx() { const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(fxPos, 3)); g.setAttribute('color', new T.BufferAttribute(fxCol, 3)); fxPts = new T.Points(g, new T.PointsMaterial({ size: 1.5, map: shared.dot, vertexColors: true, transparent: true, depthWrite: false })); fxPts.frustumCulled = false; scene.add(fxPts); }
  function burst(x, y, z, hex, n, spd, up) { if (!fxPts) initFx(); const c = new T.Color(hex); for (let i = 0; i < n; i++) { const k = (fxHead++ % FXN) * 3, a = Math.random() * PI2, s = (spd || 6) * (0.4 + Math.random() * 0.8); fxPos[k] = x; fxPos[k + 1] = y; fxPos[k + 2] = z; fxVel[k] = Math.cos(a) * s; fxVel[k + 1] = (up == null ? 4 : up) * (0.4 + Math.random()); fxVel[k + 2] = Math.sin(a) * s; fxCol[k] = c.r; fxCol[k + 1] = c.g; fxCol[k + 2] = c.b; fxLife[k / 3] = 0.5 + Math.random() * 0.5; } fxPts.geometry.attributes.color.needsUpdate = true; fxAny = true; }
  let fxAny = false;
  function stepFx(dt) { if (!fxPts || (!fxAny && dt > 0)) return; let any = false; for (let i = 0; i < FXN; i++) { if (fxLife[i] <= 0) continue; const k = i * 3; fxLife[i] -= dt; if (fxLife[i] <= 0) { fxPos[k + 1] = -100; continue; } any = true; fxPos[k] += fxVel[k] * dt; fxPos[k + 1] += fxVel[k + 1] * dt; fxPos[k + 2] += fxVel[k + 2] * dt; fxVel[k + 1] -= 10 * dt; } fxPts.geometry.attributes.position.needsUpdate = true; fxAny = any; }
  const SKN = 1400, skPos = new Float32Array(SKN * 12), skLast = []; let skid = null, skHead = 0, skLo = 1e9, skHi = -1;
  function initSkid() {
    if (skid) return; const idx = new Uint16Array(SKN * 6); for (let i = 0; i < SKN; i++) { const v = i * 4, o = i * 6; idx[o] = v; idx[o + 1] = v + 2; idx[o + 2] = v + 1; idx[o + 3] = v + 1; idx[o + 4] = v + 2; idx[o + 5] = v + 3; }
    const g = new T.BufferGeometry(), a = new T.BufferAttribute(skPos, 3); a.setUsage(T.DynamicDrawUsage); g.setAttribute('position', a); g.setIndex(new T.BufferAttribute(idx, 1));
    skid = new T.Mesh(g, new T.MeshBasicMaterial({ color: 0x0c0c12, transparent: true, opacity: 0.4, depthWrite: false, side: T.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })); skid.frustumCulled = false; skid.renderOrder = 1; scene.add(skid);
  }
  function skidClear() { skPos.fill(0); skHead = 0; skLast.length = 0; skLo = 1e9; skHi = -1; if (skid) { const a = skid.geometry.attributes.position; a.updateRange.offset = 0; a.updateRange.count = -1; a.needsUpdate = true; } }
  function skidSeg(ax, az, bx, bz) {
    const dx = bx - ax, dz = bz - az, l = Math.hypot(dx, dz) || 1, nx = -dz / l * 0.26, nz = dx / l * 0.26, i = skHead++ % SKN, o = i * 12, y = 0.05;
    skPos[o] = ax - nx; skPos[o + 1] = y; skPos[o + 2] = az - nz; skPos[o + 3] = ax + nx; skPos[o + 4] = y; skPos[o + 5] = az + nz;
    skPos[o + 6] = bx - nx; skPos[o + 7] = y; skPos[o + 8] = bz - nz; skPos[o + 9] = bx + nx; skPos[o + 10] = y; skPos[o + 11] = bz + nz;
    if (o < skLo) skLo = o; if (o + 12 > skHi) skHi = o + 12;
  }
  function skidKart(i, k) {
    const on = (k.drift && k.vf > 9 && !k.rough) || (k.spinT > 0 && k.vf > 6), L = skLast[i] || (skLast[i] = { on: false, lx: 0, lz: 0, rx: 0, rz: 0 });
    if (!on) { L.on = false; return; } const s = Math.sin(k.th), c = Math.cos(k.th), bx = k.x - s * 1.3, bz = k.z - c * 1.3, lx = bx - c * 1.2, lz = bz + s * 1.2, rx = bx + c * 1.2, rz = bz - s * 1.2;
    if (L.on) { const dx = lx - L.lx, dz = lz - L.lz, d2 = dx * dx + dz * dz; if (d2 < 1) return; if (d2 < 16) { skidSeg(L.lx, L.lz, lx, lz); skidSeg(L.rx, L.rz, rx, rz); } }
    L.on = true; L.lx = lx; L.lz = lz; L.rx = rx; L.rz = rz;
  }
  function skidFlush() { if (!skid || skHi < 0) return; const a = skid.geometry.attributes.position; a.updateRange.offset = skLo; a.updateRange.count = skHi - skLo; a.needsUpdate = true; skLo = 1e9; skHi = -1; }
  const bolts = []; function bolt(x, z) { let b = bolts.find(q => q.t <= 0); if (!b) { const g = new T.Group(); for (let i = 0; i < 6; i++) { const s = new T.Mesh(geo('b', () => new T.BoxGeometry(1, 1, 1)), bas(0xffffff, { transparent: true, opacity: 0.95, blending: T.AdditiveBlending, depthWrite: false })); s.scale.set(0.35, 3.4, 0.35); s.position.set((i % 2 ? 1 : -1) * 0.7, 18 - i * 3.2, 0); s.rotation.z = (i % 2 ? 1 : -1) * 0.4; g.add(s); } scene.add(g); b = { g, t: 0 }; bolts.push(b); } b.t = 0.55; b.g.position.set(x, 0, z); b.g.visible = true; }

  // ------------------------------------------------------------------ Rennen: Aufbau und Einzelbild
  let coinM = null; const cM4 = new T.Matrix4(), cQ = new T.Quaternion(), cV = new T.Vector3(), cS = new T.Vector3(), cE = new T.Euler(), cY = new T.Vector3(0, 1, 0);
  let boxes = [], padsM = [], hazM = { mine: [], banana: [] }, rocM = { rocket: [], rock: [] }, boomM = [];
  function setupRace(S, humanIdx) {
    initSkid(); skidClear(); if (sl) sl.visible = false; fxLife.fill(0); fxPos.fill(-100); fxAny = true; kmesh.forEach(m => scene.remove(m.g)); kmesh = S.karts.map(makeKart); ip.length = 0; boxes.forEach(b => scene.remove(b)); boxes = S.boxes.map(b => { const m = new T.Mesh(shared.boxGeo, boxMat); m.position.set(b.x, 1.8 + tr.height(b.f), b.z); scene.add(m); return m; });
    if (coinM) { scene.remove(coinM); coinM = null; } const cn = (S.coins || []).length; if (cn) { const cg = geo('coin', () => { const g = new T.CylinderGeometry(0.75, 0.75, 0.16, 18); g.rotateX(Math.PI / 2); return g; }); coinM = new T.InstancedMesh(cg, new T.MeshLambertMaterial({ color: 0xffc928, emissive: 0x7a4a00 }), cn); coinM.frustumCulled = false; scene.add(coinM); }
    padsM.forEach(p => scene.remove(p)); padsM = S.pads.map(p => { const m = new T.Mesh(new T.PlaneGeometry(8, 12), padMat); m.rotation.order = 'YXZ'; m.rotation.x = -Math.PI / 2; m.rotation.y = p.th + Math.PI; m.position.set(p.x, 0.08 + tr.height(p.f), p.z); scene.add(m); return m; });
    [].concat(hazM.mine, hazM.banana, rocM.rocket, rocM.rock, boomM).forEach(m => scene.remove(m)); hazM = { mine: [], banana: [] }; rocM = { rocket: [], rock: [] }; boomM = [];
    cams.length = 0; humanIdx.forEach(i => { const k = S.karts[i]; cams.push({ k, ki: i, shake: 0, ls: 0, ang: k.th, pos: new T.Vector3(k.x, 4, k.z), cam: new T.PerspectiveCamera(66, 1, 0.5, 1400), fov: 66, kick: 0, sl: 0 }); });
  }
  const poolGet = (arr, mk) => { let m = arr.find(x => !x.visible); if (!m) { m = mk(); arr.push(m); scene.add(m); } m.visible = true; return m; };
  const ip = [];
  function interp(S, a) { S.karts.forEach((k, i) => { const p = ip[i] || (ip[i] = { x: 0, z: 0, th: 0 }); if (k.px == null || a >= 1) { p.x = k.x; p.z = k.z; p.th = k.th; } else { p.x = k.px + (k.x - k.px) * a; p.z = k.pz + (k.z - k.pz) * a; p.th = k.pth + wrap(k.th - k.pth) * a; } }); }
  // Höhe unter Items/Geschossen auf Strecken mit Brücken (Suche merkt sich den letzten Abschnitt je Objekt)
  const hp_ = { i: 0, f: 0, d: 0 };
  const hAt = o => { if (!tr.hilly) return 0; tr.nearest(o.x, o.z, o._hi == null ? -1 : o._hi, hp_); o._hi = hp_.i; return tr.height(hp_.f); };
  function updateKarts(S, dt, time) {
    S.karts.forEach((k, i) => {
      const m = kmesh[i]; if (!m) return; const p = ip[i]; m.g.position.set(p.x, S.tr.height(k.f), p.z); m.g.rotation.y = p.th;
      if (dt > 0) { const ac = (k.vf - m.lvf) / dt; m.lvf = k.vf; m.pit += (clamp(-ac * 0.0035, -0.07, 0.07) - m.pit) * Math.min(1, dt * 6); m.body.rotation.x = m.pit;
        skidKart(i, k); const sn = Math.sin(k.th), cs = Math.cos(k.th);
        if (k.rough && k.vf > 7 && Math.random() < 0.4) burst(k.x - sn * 1.6 + (Math.random() - 0.5) * 2, 0.4, k.z - cs * 1.6, dustCol, 1, 1.4, 1.6);
        else if (k.drift && k.vf > 10 && Math.random() < 0.25) burst(k.x - sn * 1.6 + (Math.random() - 0.5) * 2.4, 0.3, k.z - cs * 1.6, 0xd8dce8, 1, 1, 1.2); }
      const roll = -k.steer * 0.12 * clamp(k.vf / 30, 0, 1) + (k.drift ? k.drift * 0.1 : 0); m.body.rotation.z = roll; m.body.rotation.y = k.drift ? k.drift * 0.35 : 0; m.body.position.y = k.spinT > 0 ? Math.abs(Math.sin(time * 14)) * 0.6 : 0;
      m.wheels.forEach(w => { w.w.rotation.x += k.vf * dt / 0.5; if (w.front) w.wg.rotation.y = -k.steer * 0.45; });
      m.flame.visible = k.boostT > 0; if (m.flame.visible) { const f = 1.2 + Math.random() * 0.25; m.flame.scale.set(f, 0.9 + Math.random() * 1.1, f); }
      m.shield.visible = k.shieldT > 0 && (k.shieldT > 1.5 || ((time * 8) | 0) % 2 === 0);
      const sv = k.drift && k.vf > 10; m.sp.visible = !!sv; if (sv) { const a = m.sp.geometry.attributes.position; for (let j = 0; j < 10; j++) a.setXYZ(j, (j % 2 ? 1 : -1) * 0.9 + (Math.random() - 0.5) * 0.7, 0.2 + Math.random() * 0.8, -1.6 - Math.random() * 1.2); a.needsUpdate = true; m.sp.material.color.setHex([0xffffff, 0x66ccff, 0xff9a1f, 0xff2d95][k.dTier || 0]); m.sp.material.size = k.dTier ? 1.15 + Math.random() * 0.3 : 0.75; if (k.dTier && dt > 0 && Math.random() < 0.6) { const sn = Math.sin(k.th), cs = Math.cos(k.th), sd = Math.random() < 0.5 ? -1 : 1; burst(k.x - sn * 1.9 + cs * sd * 1.1, 0.35, k.z - cs * 1.9 - sn * sd * 1.1, TCOL[k.dTier] || 0xffffff, 1, 3.2, 2.4); } }
      m.stars.visible = k.spinT > 0; if (m.stars.visible) m.stars.children.forEach((s, j) => { const a = time * 7 + j * 2.09; s.position.set(Math.cos(a) * 1.3, 3.9 + Math.sin(time * 9 + j) * 0.2, Math.sin(a) * 1.3); });
      // mitgeführte Items: Bananen hinten, Steine kreisen
      const nB = k.item && k.item.startsWith('banana') ? Math.max(1, k.itemN) : 0, nR = k.item && k.item.startsWith('rock') ? Math.max(1, k.itemN) : 0;
      m.trailB.children.forEach((b, j) => { b.visible = j < nB; b.position.set(0, 0.5 + Math.sin(time * 5 + j) * 0.08, -3.5 - j * 1.1); b.rotation.y = time * 2 + j; }); m.trailR.children.forEach((r, j) => { r.visible = j < nR; const a = time * 4 + j * (PI2 / Math.max(1, nR)); r.position.set(Math.cos(a) * 2.5, 1.5, Math.sin(a) * 2.5 - 0.3); r.rotation.set(time * 3, time * 2, 0); });
      if (k.boostT > 0 && dt > 0) { const sn = Math.sin(k.th), cs = Math.cos(k.th), side = Math.random() < 0.5 ? -0.55 : 0.55; burst(k.x - sn * 2.6 + cs * side, 0.75, k.z - cs * 2.6 - sn * side, BCOL[(Math.random() * 3) | 0], 1, 2.2, 0.8); }
    });
    if (coinM) { S.coins.forEach((c, i) => { const on = c.cd <= 0; cQ.setFromAxisAngle(cY, time * 3 + i * 0.4); cM4.compose(cV.set(c.x, 1.25 + Math.sin(time * 3 + i) * 0.12 + (tr.hilly ? tr.height(c.f) : 0), c.z), cQ, cS.setScalar(on ? 1 : 0)); coinM.setMatrixAt(i, cM4); }); coinM.instanceMatrix.needsUpdate = true; }
    boxes.forEach((m, i) => { m.visible = S.boxes[i].cd <= 0; m.rotation.y = time * 1.8; m.rotation.x = time * 1.1; m.position.y = 1.9 + Math.sin(time * 2.4 + i) * 0.25 + (tr.hilly ? tr.height(S.boxes[i].f) : 0); });
    ['mine', 'banana'].forEach(kd => hazM[kd].forEach(m => { m.visible = false; }));
    S.hazards.forEach(h => { const m = poolGet(hazM[h.kind], () => h.kind === 'banana' ? bananaMesh() : new T.Mesh(mineGeo, lam('#a020f0', { emissive: 0x4a0a6a }))); m.position.set(h.x, (h.kind === 'banana' ? 0.35 : 1.1) + hAt(h), h.z); m.rotation.y = h.kind === 'banana' ? h.x : time * 2; if (h.kind === 'mine') m.scale.setScalar(1 + Math.sin(time * 8) * 0.08); });
    ['rocket', 'rock'].forEach(kd => rocM[kd].forEach(m => { m.visible = false; }));
    S.proj.forEach(r => { const m = poolGet(rocM[r.kind], () => r.kind === 'rock' ? rockMesh(1.15) : new T.Mesh(rocketGeo, bas(0xff4a2a))); m.position.set(r.x, (r.kind === 'rock' ? 1.0 + Math.abs(Math.sin(time * 9)) * 0.5 : 1.2) + hAt(r), r.z); if (r.kind === 'rock') m.rotation.set(time * 8, 0, time * 5); else { m.rotation.set(0, r.th, 0); burst(r.x - Math.sin(r.th) * 1.5, 1.2, r.z - Math.cos(r.th) * 1.5, Math.random() < 0.5 ? 0xffaa55 : 0xcccccc, 1, 1, 0.5); } });
    S.events.forEach(e => {
      if (e.t === 'boom') { const m = poolGet(boomM, () => new T.Mesh(shared.sphere, bas(0xffaa33, { transparent: true, opacity: 0.8, blending: T.AdditiveBlending }))); m.position.set(e.x, 1.3, e.z); m.userData.t = 0; burst(e.x, 1.5, e.z, 0xff9a33, 22, 9, 6); }
      else if (e.t === 'splat') burst(e.x, 0.8, e.z, 0xffe14a, 16, 5, 4); else if (e.t === 'smash') burst(e.x, 1.0, e.z, 0x9aa0b0, 18, 7, 5); else if (e.t === 'rockBounce') burst(e.x, 0.8, e.z, 0xcfc8a8, 5, 3, 2);
      else if (e.t === 'hit') { const k = S.karts[e.k]; burst(k.x, 2.2, k.z, 0xffe14a, 14, 4, 6); } else if (e.t === 'pad') { const k = S.karts[e.k]; burst(k.x, 0.6, k.z, 0xffd24a, 6, 3, 2); } else if (e.t === 'coin') burst(e.x, 1.3, e.z, 0xffd24a, 7, 3, 3);
      else if (e.t === 'flash') (e.ids || []).forEach(id => { const k = S.karts[id]; bolt(k.x, k.z); burst(k.x, 2, k.z, 0xffffff, 18, 8, 8); });
      else if (e.t === 'use' && e.item === 'shield') { const k = S.karts[e.k]; burst(k.x, 1.5, k.z, 0x66e0ff, 14, 5, 3); } else if (e.t === 'use' && (e.item === 'banana' || e.item === 'mine')) { const k = S.karts[e.k]; burst(k.x - Math.sin(k.th) * 3, 0.8, k.z - Math.cos(k.th) * 3, 0xffe14a, 6, 3, 2); } else if (e.t === 'use' && e.item === 'rock') { const k = S.karts[e.k]; burst(k.x + Math.sin(k.th) * 3, 0.8, k.z + Math.cos(k.th) * 3, 0xcfc8a8, 8, 4, 3); }
      else if (e.t === 'fog') (e.ids || []).forEach(id => { const k = S.karts[id]; burst(k.x, 2, k.z, 0xeaf6ff, 22, 5, 3); });
      else if (e.t === 'miniturbo') { const k = S.karts[e.k], sn = Math.sin(k.th), cs = Math.cos(k.th), col = TCOL[e.tier] || TCOL[1]; burst(k.x - sn * 2.2, 0.7, k.z - cs * 2.2, col, 6 + e.tier * 5, 3 + e.tier, 2.5); }
      // Kamera-Rückmeldung nur für die eigene Kamera: Wackeln bei Treffern/Explosionen, kurzer Sichtfeld-Schub beim Turbo
      cams.forEach(c => {
        if ((e.t === 'hit' && e.kind !== 'flash') && e.k === c.ki) c.shake = Math.max(c.shake, 0.55);
        else if (e.t === 'wall' && e.k === c.ki) c.shake = Math.max(c.shake, clamp((e.v || 8) / 40, 0.08, 0.3));
        else if (e.t === 'bump' && (e.k === c.ki || e.o === c.ki)) c.shake = Math.max(c.shake, 0.14);
        else if (e.t === 'boom') { const d = Math.hypot(e.x - c.k.x, e.z - c.k.z); if (d < 30) c.shake = Math.max(c.shake, 0.6 * (1 - d / 30)); }
        else if (e.t === 'miniturbo' && e.k === c.ki) c.kick = 2 + e.tier * 2.5;
        else if ((e.t === 'pad' || (e.t === 'use' && e.item === 'boost')) && e.k === c.ki) c.kick = 6;
      });
    });
    boomM.forEach(m => { if (!m.visible) return; m.userData.t += dt; const u = m.userData.t / 0.5; m.scale.setScalar(1 + u * 5); m.material.opacity = Math.max(0, 0.8 - u); if (u >= 1) m.visible = false; });
    bolts.forEach(b => { if (b.t > 0) { b.t -= dt; b.g.visible = b.t > 0 && ((time * 30) | 0) % 2 === 0; if (b.t <= 0) b.g.visible = false; } });
    skidFlush(); stepFx(dt); anim.forEach(f => f(time)); const bl = ((time * 1.5) | 0) % 2 === 0; blinkers.forEach(o => { o.visible = bl; });
  }
  function updateCam(c, S, dt) {
    const k = c.k, p = ip[c.ki] || k, tgt = p.th + (k.drift ? -k.drift * 0.28 : 0); c.ang += wrap(tgt - c.ang) * Math.min(1, dt * (k.spinT > 0 ? 1.5 : 5.2));
    const af = clamp(1 / Math.sqrt(c.cam.aspect || 1.7), 1, 1.55), dist = (12.4 + clamp(k.vf / 36, 0, 1.4) * 1.8) * af, wx = p.x - Math.sin(c.ang) * dist, wz = p.z - Math.cos(c.ang) * dist, kk = 1 - Math.exp(-dt * 10);
    c.pos.x += (wx - c.pos.x) * kk; c.pos.z += (wz - c.pos.z) * kk; c.pos.y += ((5.0 * (0.9 + 0.1 * af) + S.tr.height(k.f)) - c.pos.y) * kk; c.cam.position.copy(c.pos);
    if (k.spinT > c.ls + 0.05) c.shake = 0.5; c.ls = k.spinT; if (c.shake > 0 && dt > 0) { c.shake = Math.max(0, c.shake - dt * 1.4); c.cam.position.x += (Math.random() - 0.5) * c.shake; c.cam.position.y += (Math.random() - 0.5) * c.shake * 0.6; }
    if (c.kick > 0) { c.fov += c.kick; c.kick = 0; } const tf = 64 + clamp(k.vf / 36, 0, 1.5) * 8 + (k.boostT > 0 ? 9 : 0); c.fov += (tf - c.fov) * Math.min(1, dt * 4); c.cam.fov = c.fov;
    c.sl += ((k.boostT > 0 ? 0.55 : 0) + clamp((k.vf - 26) / 14, 0, 1) * 0.22 - c.sl) * Math.min(1, dt * 5);   // Stärke der Geschwindigkeitslinien
    // Cinematic fly-in on the starting grid, then settle into the chase camera before GO.
    if (S.state === 'grid') {
      const progress = Math.max(0, Math.min(1, (3.2 - S.count) / 2.25));
      const ease = progress * progress * (3 - 2 * progress);
      const theta = c.ang + (1 - ease) * 0.7;
      const startDistance = 35, startHeight = 17;
      c.cam.position.x = p.x - Math.sin(theta) * (startDistance * (1 - ease)) + (c.pos.x - p.x) * ease;
      c.cam.position.z = p.z - Math.cos(theta) * (startDistance * (1 - ease)) + (c.pos.z - p.z) * ease;
      c.cam.position.y = startHeight * (1 - ease) + c.pos.y * ease;
    }
    c.cam.lookAt(p.x + Math.sin(c.ang) * 10, 1.35 + S.tr.height(k.f + 5), p.z + Math.cos(c.ang) * 10);
  }
  function rects(n, w, h) {
    if (n <= 1) return [[0, 0, w, h]]; const hw = (w / 2) | 0, hh = (h / 2) | 0;
    if (n === 2) return w >= h ? [[0, 0, hw, h], [hw, 0, w - hw, h]] : [[0, hh, w, h - hh], [0, 0, w, hh]];
    return [[0, hh, hw, h - hh], [hw, hh, w - hw, h - hh], [0, 0, hw, hh], [hw, 0, w - hw, hh]];
  }
  let prMax = 1, prScale = 1, pEma = 16.7, pDev = 0, pSlow = 0, pFast = 0, pCool = 0, pT = 0, pUpAt = -1e9, pNoUp = false;
  function applyPr(force) { const p = Math.max(0.6, prMax * prScale); if (!force && Math.abs(p - pr) < 0.01) return; pr = p; renderer.setPixelRatio(pr); renderer.setSize(W, H, false); }
  function resize(w, h, n) { W = w; H = h; prMax = Math.min(window.devicePixelRatio || 1, n >= 3 ? 1 : n === 2 ? 1.25 : 1.75); applyPr(true); }
  // Dynamische Auflösung: bleibt die Bildrate länger unter ~48 fps, wird die interne Auflösung gesenkt; läuft es lange flüssig, wieder angehoben.
  // Feste 30-fps-Bremsen (Stromsparmodus) erkennt die geringe Streuung und lässt die Auflösung dann in Ruhe.
  function perf(ms) {
    if (!(ms > 0) || ms > 250) return; const s = ms / 1000; pT += s; pDev += (Math.abs(ms - pEma) - pDev) * 0.06; pEma += (ms - pEma) * 0.06; if ((pCool -= s) > 0) return;
    const capped30 = pEma > 31 && pEma < 36 && pDev < 1.5;
    if (pEma > 21 && !capped30) { pFast = 0; if ((pSlow += s) > 1 && prScale > 0.5) { prScale = Math.max(0.5, prScale - 0.15); applyPr(); pSlow = 0; pCool = 1.5; if (pT - pUpAt < 8) pNoUp = true; } }
    else if (pEma < 17.6) { pSlow = 0; if (!pNoUp && prScale < 1 && (pFast += s) > 5) { prScale = Math.min(1, prScale + 0.1); applyPr(); pFast = 0; pCool = 2; pUpAt = pT; } }
    else pSlow = pFast = 0;
  }
  const perfReset = () => { pEma = 16.7; pDev = 0; pSlow = pFast = 0; pCool = 1.5; };
  // Geschwindigkeitslinien: kurze Streifen im Kameraraum, die am Bildrand vorbeiziehen (eine Geometrie für alle Kameras, Stärke je Kamera)
  const TCOL = [0xffffff, 0x66ccff, 0xff9a1f, 0xff2d95], BCOL = [0x66ccff, 0xffffff, 0xffb347];
  const SLN = 44; let sl = null, slZ = null;
  function speedLines(dt, v) {
    if (!sl) { const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(new Float32Array(SLN * 6), 3)); sl = new T.LineSegments(g, new T.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthTest: false, depthWrite: false })); sl.frustumCulled = false; sl.renderOrder = 9; sl.userData.a = []; slZ = new Float32Array(SLN); for (let i = 0; i < SLN; i++) { sl.userData.a.push([Math.random() * PI2, 1.15 + Math.random() * 0.7]); slZ[i] = -4 - Math.random() * 40; } scene.add(sl); }
    const P = sl.geometry.attributes.position.array, mv = dt * (40 + v * 1.6);
    for (let i = 0; i < SLN; i++) { let z = slZ[i] + mv; if (z > -3) { z -= 40; const a = sl.userData.a[i]; a[0] = Math.random() * PI2; a[1] = 1.15 + Math.random() * 0.7; } slZ[i] = z; const a = sl.userData.a[i], z2 = z - 3.5 - v * 0.08;
      const r1 = a[1] * (-z * 0.62 + 1.6), r2 = a[1] * (-z2 * 0.62 + 1.6), cx = Math.cos(a[0]), cy = Math.sin(a[0]) * 0.62, j = i * 6;
      P[j] = cx * r1; P[j + 1] = cy * r1; P[j + 2] = z; P[j + 3] = cx * r2; P[j + 4] = cy * r2; P[j + 5] = z2; }
    sl.geometry.attributes.position.needsUpdate = true;
  }
  function renderRace(S, dt, time, n, alpha) {
    interp(S, alpha == null ? 1 : alpha); updateKarts(S, dt, time); const rs = rects(Math.max(1, cams.length), W, H);
    const slOn = cams.some(c => c.sl > 0.02); if (slOn) speedLines(dt, Math.max(...cams.map(c => c.k.vf))); else if (sl) sl.visible = false;
    cams.forEach((c, i) => { updateCam(c, S, dt); const r = rs[i]; if (sl && slOn) { sl.visible = c.sl > 0.02; sl.position.copy(c.cam.position); sl.quaternion.copy(c.cam.quaternion); sl.material.opacity = c.sl; } renderer.setViewport(r[0], r[1], r[2], r[3]); renderer.setScissor(r[0], r[1], r[2], r[3]); c.cam.aspect = r[2] / r[3]; c.cam.updateProjectionMatrix(); sky.position.copy(c.cam.position); if (skyGroup) skyGroup.position.copy(c.cam.position); renderer.render(scene, c.cam); });
    return rs;
  }
  // Eine echte separate 3D-Auswahlbühne: verwendet dieselben Figuren- und Kartmodelle wie das Rennen.
  const stage = { node:null, canvas:null, renderer:null, scene:null, camera:null, racer:null, key:'', angle:0, drag:false, px:0, frames:0 };
  function previewKart(node, character, kart, logo) {
    if (!node || !renderer) return;
    if (!stage.renderer) {
      stage.node = node;
      stage.canvas = document.createElement('canvas');
      stage.canvas.setAttribute('aria-label','Drehbare 3D-Vorschau deines Karts und Fahrers');
      stage.canvas.style.cssText = 'width:100%;height:100%;display:block;touch-action:pan-y;cursor:grab';
      stage.renderer = new T.WebGLRenderer({ canvas:stage.canvas, antialias:true, alpha:true, powerPreference:'low-power' });
      stage.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.4));
      stage.renderer.setClearColor(0x000000,0);
      stage.scene = new T.Scene();
      stage.scene.add(new T.HemisphereLight(0xcfe9ff,0x493663,2));
      const sun = new T.DirectionalLight(0xffffff,1.3); sun.position.set(-4,9,8); stage.scene.add(sun);
      const side = new T.DirectionalLight(0xff77c8,0.8); side.position.set(5,4,-5); stage.scene.add(side);
      const floor = new T.Mesh(new T.CylinderGeometry(4.4,4.8,0.42,40),new T.MeshPhongMaterial({color:0x282345,emissive:0x110c28,shininess:90}));
      floor.position.y = -0.22; stage.scene.add(floor);
      stage.camera = new T.PerspectiveCamera(38,1,0.1,100);
      stage.canvas.addEventListener('pointerdown',e=>{stage.drag=true;stage.px=e.clientX;stage.canvas.setPointerCapture(e.pointerId);});
      stage.canvas.addEventListener('pointermove',e=>{if(stage.drag){stage.angle+=(e.clientX-stage.px)*0.012;stage.px=e.clientX;}});
      ['pointerup','pointercancel','lostpointercapture'].forEach(t=>stage.canvas.addEventListener(t,()=>{stage.drag=false;}));
    }
    // Nach Wechsel zwischen Fahrer- und Kart-Reiter muss die aktive Bühne mitwandern.
    stage.node = node;
    if (stage.canvas.parentNode !== node) node.appendChild(stage.canvas);
    const key = character+':'+kart+':'+logo;
    if (key !== stage.key) {
      if (stage.racer) stage.scene.remove(stage.racer);
      const racer = makeKart({k:0,logo,char:character,kart});
      scene.remove(racer.g);
      stage.racer = racer.g; stage.scene.add(racer.g); stage.angle = 0;
      stage.key = key;
    }
  }
  function previewFrame(dt) {
    if (!stage.renderer || !stage.canvas || !stage.node || !stage.node.isConnected) return;
    if (!stage.node.offsetWidth || !stage.node.offsetHeight) return;
    const w=stage.node.clientWidth, h=stage.node.clientHeight;
    const tw=Math.max(2,Math.round(w)), th=Math.max(2,Math.round(h));
    if (stage.canvas.width!==Math.round(tw*stage.renderer.getPixelRatio()) || stage.canvas.height!==Math.round(th*stage.renderer.getPixelRatio())) stage.renderer.setSize(tw,th,false);
    stage.camera.aspect=tw/th; stage.camera.updateProjectionMatrix();
    if (!stage.drag) stage.angle+=Math.min(dt,0.08)*0.45;
    if(stage.racer) { stage.racer.rotation.y=stage.angle + 0.45; stage.racer.position.y = Math.sin(performance.now()*0.0017)*0.065; }
    stage.camera.position.set(9.6,6.0,10.5); stage.camera.lookAt(0,1.65,0);
    stage.renderer.render(stage.scene,stage.camera);
  }
  function warmup() {
    if (!fxPts) initFx(); initSkid(); const g = new T.Group(), m = makeKart({ k: 0, logo: logos.length ? logos[0].idx : 0, char: 0, kart: 0 }); scene.remove(m.g); g.add(m.g); m.flame.visible = m.shield.visible = m.sp.visible = m.stars.visible = true;
    g.add(bananaMesh(), rockMesh(1), new T.Mesh(shared.boxGeo, boxMat), new T.Mesh(new T.PlaneGeometry(8, 12), padMat), new T.Mesh(mineGeo, lam('#a020f0', { emissive: 0x4a0a6a })), new T.Mesh(rocketGeo, bas(0xff4a2a)));
    scene.add(g); try { const c = mcam(); c.aspect = W / H; c.updateProjectionMatrix(); renderer.compile(scene, c); } catch (e) {} scene.remove(g);
  }
  const mcam = () => menuCam.cam || (menuCam.cam = new T.PerspectiveCamera(60, 1, 0.5, 1400));
  function renderMenu(dt, time) { if (sl) sl.visible = false;
    if (!tr) return; previewFrame(dt); menuCam.f = (menuCam.f + dt * 9 / 3) % tr.N; const o = {}; tr.at(menuCam.f, 0, o); const c = mcam(), o2 = {}; tr.at(menuCam.f + 14, 0, o2);
    c.position.set(o.x - o.tx * 20 + o.tz * Math.sin(time * 0.23) * 5, 21 + Math.sin(time * 0.31) * 3, o.z - o.tz * 20 - o.tx * Math.sin(time * 0.23) * 5); c.lookAt(o2.x, 2, o2.z); c.aspect = W / H; c.updateProjectionMatrix(); sky.position.copy(c.position); if (skyGroup) skyGroup.position.copy(c.position);
    kmesh.forEach(m => scene.remove(m.g)); kmesh = []; boxes.forEach(b => scene.remove(b)); boxes = []; if (coinM) { scene.remove(coinM); coinM = null; } anim.forEach(f => f(time));
    renderer.setViewport(0, 0, W, H); renderer.setScissor(0, 0, W, H); renderer.render(scene, c);
  }
  return { prepare, gallery, peek, burst, init, previewKart, warmup, perf, perfReset, setTrack, setupRace, renderRace, renderMenu, resize, rects, KCOL, get cams() { return cams; }, get ready() { return !!renderer; } };
})();
