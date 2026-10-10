'use strict';
/* 3D-Ansicht: Strecke, Karts, Items, Kameras und Splitscreen (Three.js r128). */
const View = (() => {
  const T = THREE, PI2 = Math.PI * 2;
  let hemi, sun, renderer, scene, tr = null, world = null, sky, karts = [], kmesh = [], logoTex = {}, logos = [], W = 1, H = 1, pr = 1;
  const cams = [], menuCam = { f: 0 };
  const wrap = a => { while (a > Math.PI) a -= PI2; while (a < -Math.PI) a += PI2; return a; };
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const KCOL = ['#00e5ff', '#ff2d95', '#ffd24a', '#7cff6a', '#8b5cf6', '#ff9a1f', '#e84118', '#ffffff'];
  const mats = {}, lam = (c, o) => { const k = c + (o ? JSON.stringify(o) : ''); return mats[k] || (mats[k] = new T.MeshLambertMaterial(Object.assign({ color: c, flatShading: true }, o || {}))); };
  const bas = (c, o) => new T.MeshBasicMaterial(Object.assign({ color: c }, o || {}));
  const canvasTex = (w, h, draw, rep) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const x = new T.CanvasTexture(c); x.encoding = T.sRGBEncoding; x.anisotropy = 4; if (rep) { x.wrapS = x.wrapT = T.RepeatWrapping; } return x; };
  const logoMat = i => { const t = logoTex[i]; return t ? new T.MeshBasicMaterial({ map: t, transparent: true }) : bas(0x223355); };

  function init(canvas, lg) {
    renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' }); renderer.outputEncoding = T.sRGBEncoding; renderer.setScissorTest(true); renderer.autoClear = true;
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
  }

  // ------------------------------------------------------------------ Strecke bauen
  let skyGroup = null; const anim = [];
  function strip(a, b, y, vs, mat, wall, h) {
    const N = tr.N, pos = [], uv = [], idx = [];
    for (let i = 0; i <= N; i++) {
      const j = i % N, nx = tr.Nm[j * 2], nz = tr.Nm[j * 2 + 1], px = tr.P[j * 2], pz = tr.P[j * 2 + 1], v = i * 3 / vs;
      if (wall) { pos.push(px + nx * a, 0, pz + nz * a, px + nx * a, h, pz + nz * a); uv.push(0, v, 1, v); } else { pos.push(px + nx * a, y, pz + nz * a, px + nx * b, y, pz + nz * b); uv.push(0, v, 1, v); }
      if (i < N) { const k = i * 2; idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); }
    }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    const m = new T.Mesh(g, mat); m.frustumCulled = false; return m;
  }
  const instLam = new T.MeshLambertMaterial({ color: 0xffffff, flatShading: true }), instBas = () => new T.MeshBasicMaterial({ color: 0xffffff });
  function inst(geo, mat, list) {
    if (!list.length) return null; const m = new T.InstancedMesh(geo, mat, list.length); m.instanceColor = new T.InstancedBufferAttribute(new Float32Array(list.length * 3), 3);
    const m4 = new T.Matrix4(), q = new T.Quaternion(), e = new T.Euler(), v = new T.Vector3(), s = new T.Vector3(), c = new T.Color();
    list.forEach((o, i) => { q.setFromEuler(e.set(o.rx || 0, o.ry || 0, o.rz || 0)); const sx = o.sx == null ? 1 : o.sx; m4.compose(v.set(o.x, o.y, o.z), q, s.set(sx, o.sy == null ? sx : o.sy, o.sz == null ? sx : o.sz)); m.setMatrixAt(i, m4); c.set(o.c || '#ffffff'); m.setColorAt(i, c); });
    m.frustumCulled = false; world.add(m); return m;
  }
  const G_ = {}, geoC = (k, f) => G_[k] || (G_[k] = f());
  const rr = (a, b) => a + Math.random() * (b - a), pk = a => a[Math.floor(Math.random() * a.length)];
  let CX = 0, CZ = 0, R0 = 300; const pr_ = { i: 0, f: 0, d: 0 };
  function freeSpot(margin, minR, maxR) { for (let t = 0; t < 80; t++) { const a = Math.random() * PI2, r = rr(minR == null ? 0 : minR, maxR == null ? R0 + 160 : maxR), x = CX + Math.cos(a) * r, z = CZ + Math.sin(a) * r; tr.nearest(x, z, -1, pr_); if (Math.abs(pr_.d) > tr.wallD + margin) return { x, z }; } return null; }
  function spots(n, margin, minR, maxR) { const out = []; for (let i = 0; i < n; i++) { const p = freeSpot(margin, minR, maxR); if (p) out.push(p); } return out; }
  const sideSpots = (every, off) => { const out = []; for (let i = 0; i < tr.N; i += every) [-1, 1].forEach(s => { out.push({ x: tr.P[i * 2] + tr.Nm[i * 2] * s * (tr.wallD + off), z: tr.P[i * 2 + 1] + tr.Nm[i * 2 + 1] * s * (tr.wallD + off), i, s }); }); return out; };
  function clouds(n, tint, y0, y1) { for (let k = 0; k < n; k++) { const cl = new T.Group(); for (let j = 0; j < 4; j++) { const b = new T.Mesh(shared.sphere, bas(tint || 0xffffff, { fog: false })); b.scale.set(rr(26, 42), rr(12, 20), 18); b.position.set(j * 26 - 40, Math.random() * 6, Math.random() * 10); cl.add(b); } const a = Math.random() * PI2, r = rr(450, 750); cl.position.set(CX + Math.cos(a) * r, rr(y0 || 190, y1 || 280), CZ + Math.sin(a) * r); cl.rotation.y = a; world.add(cl); } }
  const stripeTex = () => canvasTex(32, 128, (g, w, h) => { for (let y = 0; y < 8; y++) { g.fillStyle = y % 2 ? '#fff' : '#e8412a'; g.fillRect(0, y * 16, w, 16); } }, true);
  function stripedTowers(n, off) { const stripe = stripeTex(); for (let k = 0; k < n; k++) { const i = Math.floor(tr.N * (k + 0.4) / n), s = k % 2 ? 1 : -1, x = tr.P[i * 2] + tr.Nm[i * 2] * s * (tr.wallD + off), z = tr.P[i * 2 + 1] + tr.Nm[i * 2 + 1] * s * (tr.wallD + off); const tw = new T.Mesh(new T.CylinderGeometry(4, 5.5, 70, 14), new T.MeshLambertMaterial({ map: stripe })); tw.position.set(x, 35, z); world.add(tw); const top = new T.Mesh(new T.CylinderGeometry(6, 4, 4, 14), lam('#ffd24a')); top.position.set(x, 72, z); world.add(top); } }
  const wallTex = (th, d) => canvasTex(128, 32, (g, w, h) => {
    if (th === 'gruft') { g.fillStyle = d.wall[1]; g.fillRect(0, 0, w, h); g.strokeStyle = '#2a2f3a'; g.lineWidth = 2; for (let r = 0; r < 2; r++) for (let x = (r ? 0 : 16); x < w + 32; x += 32) g.strokeRect(x - 32, r * 16, 32, 16); for (let i = 0; i < 30; i++) { g.fillStyle = 'rgba(80,140,70,.35)'; g.fillRect(Math.random() * w, Math.random() * h, 8, 4); } return; }
    if (th === 'fantasia') { g.fillStyle = d.wall[1]; g.fillRect(0, 0, w, h); g.fillStyle = d.wall[0]; for (let x = -h; x < w; x += 24) { g.beginPath(); g.moveTo(x, h); g.lineTo(x + 12, h); g.lineTo(x + 12 + h, 0); g.lineTo(x + h, 0); g.fill(); } return; }
    g.fillStyle = d.wall[1]; g.fillRect(0, 0, w, h); g.fillStyle = d.wall[0]; for (let x = -h; x < w; x += 32) { g.beginPath(); g.moveTo(x, h); g.lineTo(x + 16, h); g.lineTo(x + 16 + h / 2, h / 2); g.lineTo(x + 16, 0); g.lineTo(x, 0); g.lineTo(x + h / 2, h / 2); g.fill(); } g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(0, h - 4, w, 4); }, true);

  function setTrack(track) {
    if (world) { scene.remove(world); world.traverse(o => { if (o.geometry && !o.userData.keep && !Object.values(G_).includes(o.geometry)) o.geometry.dispose(); }); }
    if (skyGroup) scene.remove(skyGroup); anim.length = 0; tr = track; const d = tr.def, th = d.theme || 'wiese'; world = new T.Group(); scene.add(world); skyGroup = new T.Group(); scene.add(skyGroup);
    let sx = 0, sz = 0; for (let i = 0; i < tr.N; i++) { sx += tr.P[i * 2]; sz += tr.P[i * 2 + 1]; } CX = sx / tr.N; CZ = sz / tr.N; R0 = 0; for (let i = 0; i < tr.N; i++) R0 = Math.max(R0, Math.hypot(tr.P[i * 2] - CX, tr.P[i * 2 + 1] - CZ));
    scene.background = new T.Color(d.sky[0]); scene.fog = new T.Fog(d.fog, d.fogR[0], d.fogR[1]); const L = d.light; hemi.intensity = L[0]; sun.intensity = L[1]; sun.color.set(L[2]); hemi.groundColor.set(L[3]); hemi.color.set(th === 'gruft' ? '#8aa0ff' : th === 'fantasia' ? '#fff0ff' : '#cfd8ff');
    const cA = new T.Color(d.sky[0]), cB = new T.Color(d.sky[1]), cC = new T.Color(d.sky[2]), pa = sky.geometry.attributes.position, ca = sky.geometry.attributes.color, c = new T.Color();
    for (let i = 0; i < pa.count; i++) { const y = pa.getY(i) / 900; if (y > 0.25) c.copy(cB).lerp(cA, clamp((y - 0.25) / 0.6, 0, 1)); else c.copy(cC).lerp(cB, clamp((y + 0.1) / 0.35, 0, 1)); ca.setXYZ(i, c.r, c.g, c.b); } ca.needsUpdate = true;
    const ground = new T.Mesh(new T.PlaneGeometry(3000, 3000), lam(d.ground)); ground.rotation.x = -Math.PI / 2; ground.position.y = -0.1; world.add(ground);
    const road = canvasTex(128, 256, (g, w, h) => { g.fillStyle = d.road; g.fillRect(0, 0, w, h); for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(255,255,255,${Math.random() * 0.04})`; g.fillRect(Math.random() * w, Math.random() * h, 3, 3); } if (th === 'fantasia') for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(Math.random() * w, Math.random() * h, 3, 3); } g.fillStyle = th === 'gruft' ? '#9aa0b8' : '#e8ecff'; g.fillRect(5, 0, 5, h); g.fillRect(w - 10, 0, 5, h); g.fillStyle = th === 'fantasia' ? '#ffd0ff' : '#ffd24a'; for (let k = 0; k < 2; k++) g.fillRect(w / 2 - 3, k * 128 + 10, 6, 70); }, true);
    world.add(strip(-tr.half, tr.half, 0.02, 24, new T.MeshLambertMaterial({ map: road })));
    const curbC = th === 'gruft' ? ['#8a8fa0', '#4a4f60'] : th === 'fantasia' ? ['#ff6ac8', '#ffffff'] : th === 'strand' ? ['#1a9ae0', '#ffffff'] : ['#e8412a', '#ffffff'];
    const curb = canvasTex(32, 64, (g, w, h) => { g.fillStyle = curbC[0]; g.fillRect(0, 0, w, h / 2); g.fillStyle = curbC[1]; g.fillRect(0, h / 2, w, h / 2); }, true);
    const rough = new T.Color(d.ground).offsetHSL(0, 0, 0.05).getStyle();
    [-1, 1].forEach(s => { world.add(strip(s > 0 ? tr.half : -tr.half - 1.3, s > 0 ? tr.half + 1.3 : -tr.half, 0.04, 6, new T.MeshLambertMaterial({ map: curb }))); world.add(strip(s > 0 ? tr.half + 1.3 : -tr.wallD, s > 0 ? tr.wallD : -tr.half - 1.3, 0.01, 10, lam(rough))); });
    const wtex = wallTex(th, d); [-1, 1].forEach(s => { world.add(strip(s * tr.wallD, 0, 0, 16, new T.MeshBasicMaterial({ map: wtex, side: T.DoubleSide }), true, th === 'gruft' ? 2.2 : 1.5)); });
    // Start/Ziel
    const p0 = { x: tr.P[0], z: tr.P[1] }, th0 = Math.atan2(tr.T[0], tr.T[1]);
    const chk = canvasTex(256, 32, (g, w, h) => { for (let x = 0; x < 16; x++) for (let y = 0; y < 2; y++) { g.fillStyle = (x + y) % 2 ? '#fff' : '#111'; g.fillRect(x * 16, y * 16, 16, 16); } });
    const line = new T.Mesh(new T.PlaneGeometry(tr.W, 3), new T.MeshBasicMaterial({ map: chk })); line.position.set(p0.x, 0.06, p0.z); line.rotation.order = 'YXZ'; line.rotation.x = -Math.PI / 2; line.rotation.y = th0 + Math.PI; world.add(line);
    const gantry = new T.Group(); gantry.position.set(p0.x, 0, p0.z); gantry.rotation.y = th0;
    [-1, 1].forEach(s => { const p = new T.Mesh(new T.BoxGeometry(1, 9, 1), lam('#1a1d33')); p.position.set(s * (tr.wallD - 0.5), 4.5, 0); gantry.add(p); });
    const beam = new T.Mesh(new T.BoxGeometry(tr.wallD * 2, 2.6, 0.8), lam('#10143a')); beam.position.y = 9; gantry.add(beam);
    const bn = new T.Mesh(new T.PlaneGeometry(tr.wallD * 2 - 1, 2.2), new T.MeshBasicMaterial({ map: canvasTex(512, 64, (g, w, h) => { g.fillStyle = '#10143a'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffd24a'; g.font = '900 40px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('AnMaCha KART RUSH · START / ZIEL', w / 2, h / 2 + 2); }) })); bn.position.set(0, 9, 0.45); gantry.add(bn); const bn2 = bn.clone(); bn2.rotation.y = Math.PI; bn2.position.z = -0.45; gantry.add(bn2); world.add(gantry);
    // Reklametafeln mit Sender-Logos
    const nb = 16; for (let k = 0; k < nb; k++) { const i = Math.floor(tr.N * (k + 0.3) / nb), s = k % 2 ? 1 : -1, nx = tr.Nm[i * 2], nz = tr.Nm[i * 2 + 1], lid = logos.length ? logos[k % logos.length].idx : 0, g = new T.Group(); g.position.set(tr.P[i * 2] + nx * s * (tr.wallD + 5), 0, tr.P[i * 2 + 1] + nz * s * (tr.wallD + 5)); g.rotation.y = Math.atan2(-nx * s, -nz * s);
      [-2.6, 2.6].forEach(x => { const p = new T.Mesh(new T.BoxGeometry(0.5, 7, 0.5), lam('#1a1d33')); p.position.set(x, 3.5, 0); g.add(p); }); const bd = new T.Mesh(new T.BoxGeometry(6.4, 4.2, 0.4), lam('#0a0f2a')); bd.position.y = 6; g.add(bd); const lg = new T.Mesh(new T.PlaneGeometry(4, 4), logoMat(lid)); lg.position.set(0, 6, 0.22); g.add(lg); world.add(g); }
    (SC[th] || SC.wiese)(d);
  }

  // ------------------------------------------------------------------ Kulissen je Welt
  const SC = {
    wiese(d) {
      const tl = spots(240, 10, 0, R0 + 380); const h = tl.map(() => rr(6, 15));
      inst(geoC('trunk', () => new T.CylinderGeometry(0.5, 0.7, 1, 6)), instLam, tl.map((p, i) => ({ x: p.x, y: h[i] * 0.2, z: p.z, sx: 1.2, sy: h[i] * 0.4, sz: 1.2, c: '#8a5a2a' })));
      inst(geoC('cone7', () => new T.ConeGeometry(1, 1, 7)), instLam, tl.map((p, i) => ({ x: p.x, y: h[i] * 0.9, z: p.z, sx: h[i] * 0.28, sy: h[i] * 0.95, sz: h[i] * 0.28, c: pk(d.props) })));
      for (let k = 0; k < 9; k++) { const a = k / 9 * PI2 + Math.random() * 0.5, r = R0 + 280 + Math.random() * 160; const hs = new T.Mesh(shared.sphere, lam('#3da84a')); hs.scale.set(rr(160, 280), rr(70, 130), rr(160, 260)); hs.position.set(CX + Math.cos(a) * r, -10, CZ + Math.sin(a) * r); world.add(hs); }
      stripedTowers(7, 46); clouds(14);
    },
    strand(d) {
      let inner = R0 + 80; const sea = new T.Mesh(new T.RingGeometry(inner, 2200, 56), lam('#25a8e8', { emissive: 0x0a3a6a })); sea.rotation.x = -Math.PI / 2; sea.position.set(CX, -0.06, CZ); world.add(sea);
      const foam = new T.Mesh(new T.RingGeometry(inner - 4, inner + 1, 56), bas(0xffffff, { transparent: true, opacity: 0.55 })); foam.rotation.x = -Math.PI / 2; foam.position.set(CX, -0.04, CZ); world.add(foam);
      const pal = spots(70, 9, 0, inner - 10), lv = []; const tl = [], tr2 = [];
      pal.forEach(p => { const h = rr(8, 12), lean = rr(-0.18, 0.18), ry = Math.random() * PI2; tl.push({ x: p.x, y: h / 2, z: p.z, sx: 1, sy: h, sz: 1, rz: lean, ry, c: '#a67a44' }); for (let j = 0; j < 5; j++) { const a = ry + j * PI2 / 5; lv.push({ x: p.x + Math.cos(a) * 2.3 - lean * h * 0.5, y: h + 0.2, z: p.z - Math.sin(a) * 2.3, sx: 5.2, sy: 0.22, sz: 1.5, ry: a, rz: -0.45, c: pk(['#2faa4a', '#3fc85a', '#26923a']) }); } });
      inst(geoC('trunk', () => new T.CylinderGeometry(0.5, 0.7, 1, 6)), instLam, tl); inst(geoC('b', () => new T.BoxGeometry(1, 1, 1)), instLam, lv);
      const hut = spots(14, 22, 0, inner - 30), cols = ['#ff7a4a', '#ffd24a', '#4ac8ff', '#ff6ac8', '#7cff9a'];
      inst(geoC('b', () => new T.BoxGeometry(1, 1, 1)), instLam, hut.map(p => ({ x: p.x, y: 1.6, z: p.z, sx: 5, sy: 3.2, sz: 5, c: pk(cols) }))); inst(geoC('cone4', () => new T.ConeGeometry(1, 1, 4)), instLam, hut.map(p => ({ x: p.x, y: 4.6, z: p.z, sx: 4.4, sy: 2.6, sz: 4.4, ry: Math.PI / 4, c: '#c8412a' })));
      const um = spots(34, 12, 0, inner - 20); inst(geoC('cyl6', () => new T.CylinderGeometry(1, 1, 1, 6)), instLam, um.map(p => ({ x: p.x, y: 1.6, z: p.z, sx: 0.1, sy: 3.2, sz: 0.1, c: '#eeeeee' }))); inst(geoC('cone10', () => new T.ConeGeometry(1, 1, 10)), instLam, um.map(p => ({ x: p.x, y: 3.5, z: p.z, sx: 2.4, sy: 0.9, sz: 2.4, c: pk(cols) }))); inst(geoC('b', () => new T.BoxGeometry(1, 1, 1)), instLam, um.map(p => ({ x: p.x + 2, y: 0.05, z: p.z + 1, sx: 1.2, sy: 0.08, sz: 2.2, ry: Math.random(), c: pk(cols) })));
      const sb = []; for (let k = 0; k < 12; k++) { const a = Math.random() * PI2, r = inner + rr(40, 360); sb.push({ x: CX + Math.cos(a) * r, z: CZ + Math.sin(a) * r, a: Math.random() * PI2 }); }
      sb.forEach(b => { const g = new T.Group(); const hull = new T.Mesh(geoC('b', () => new T.BoxGeometry(1, 1, 1)), lam('#f4f4f4')); hull.scale.set(2, 1.2, 6); hull.position.y = 0.4; g.add(hull); const sail = new T.Mesh(geoC('cone3', () => new T.ConeGeometry(1, 1, 3)), lam(pk(cols))); sail.scale.set(2.2, 7, 0.4); sail.position.y = 4.5; g.add(sail); g.position.set(b.x, 0, b.z); g.rotation.y = b.a; world.add(g); anim.push(t => { g.position.y = Math.sin(t * 1.1 + b.a) * 0.35; g.rotation.z = Math.sin(t * 0.9 + b.a) * 0.05; }); });
      stripedTowers(3, 60); clouds(12);
      const sunM = new T.Mesh(shared.sphere, bas(0xfff1a0, { fog: false })); sunM.scale.setScalar(55); sunM.position.set(-300, 330, -760); skyGroup.add(sunM); const halo = new T.Mesh(shared.sphere, bas(0xffe08a, { fog: false, transparent: true, opacity: 0.25 })); halo.scale.setScalar(95); halo.position.copy(sunM.position); skyGroup.add(halo);
    },
    gruft(d) {
      const ts = spots(170, 6, 0, R0 + 200), gv = ['#6a7080', '#586070', '#7a8090', '#4a5060'];
      inst(geoC('b', () => new T.BoxGeometry(1, 1, 1)), instLam, ts.map(p => { const h = rr(1.4, 2.6); p.h = h; p.t = rr(-0.15, 0.15); p.c = pk(gv); p.ry = Math.random() * PI2; return { x: p.x, y: h / 2, z: p.z, sx: 1.4, sy: h, sz: 0.5, rz: p.t, ry: p.ry, c: p.c }; }));
      inst(geoC('cylx', () => new T.CylinderGeometry(1, 1, 1, 10).rotateX(Math.PI / 2)), instLam, ts.map(p => ({ x: p.x, y: p.h, z: p.z, sx: 0.7, sy: 0.7, sz: 0.5, rz: p.t, ry: p.ry, c: p.c })));
      const cr = spots(45, 8, 0, R0 + 180); inst(geoC('b', () => new T.BoxGeometry(1, 1, 1)), instLam, cr.map(p => ({ x: p.x, y: 1.5, z: p.z, sx: 0.28, sy: 3, sz: 0.28, rz: rr(-0.12, 0.12), c: '#7a8090' })).concat(cr.map(p => ({ x: p.x, y: 2.2, z: p.z, sx: 1.4, sy: 0.28, sz: 0.28, c: '#7a8090' }))));
      const dt = spots(55, 8, 0, R0 + 220), tb = [], br = [];
      dt.forEach(p => { const h = rr(7, 12); tb.push({ x: p.x, y: h / 2, z: p.z, sx: 0.8, sy: h, sz: 0.8, c: '#2a2030' }); for (let j = 0; j < 3; j++) { const a = Math.random() * PI2; br.push({ x: p.x + Math.cos(a) * 1.5, y: h * (0.7 + j * 0.1), z: p.z + Math.sin(a) * 1.5, sx: 0.28, sy: rr(3, 5), sz: 0.28, rz: Math.cos(a) * 0.9, rx: Math.sin(a) * 0.9, c: '#2a2030' }); } });
      const cyl = geoC('cyl6', () => new T.CylinderGeometry(1, 1, 1, 6)); inst(cyl, instLam, tb.concat(br));
      const cp = spots(9, 26, 0, R0 + 120); inst(geoC('b', () => new T.BoxGeometry(1, 1, 1)), instLam, cp.map(p => ({ x: p.x, y: 2.6, z: p.z, sx: 8, sy: 5.2, sz: 7, c: '#5a6070' })).concat(cp.map(p => ({ x: p.x, y: 1.6, z: p.z + 3.6, sx: 1.9, sy: 3.2, sz: 0.3, c: '#0a0a12' })))); inst(geoC('cone4', () => new T.ConeGeometry(1, 1, 4)), instLam, cp.map(p => ({ x: p.x, y: 7, z: p.z, sx: 6.4, sy: 3.4, sz: 5.6, ry: Math.PI / 4, c: '#3a4050' })));
      const ls = sideSpots(16, 2.4); inst(cyl, instLam, ls.map(p => ({ x: p.x, y: 2.1, z: p.z, sx: 0.14, sy: 4.2, sz: 0.14, c: '#1a1a24' })));
      inst(shared.sphere, instBas(), ls.map(p => ({ x: p.x, y: 4.4, z: p.z, sx: 0.55, c: '#8cffb0' }))); const halo = inst(shared.sphere, new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.18, blending: T.AdditiveBlending, depthWrite: false }), ls.map(p => ({ x: p.x, y: 4.4, z: p.z, sx: 1.6, c: '#5cff9a' })));
      spots(12, 14, 0, R0 + 100).forEach((p, i) => { const g = new T.Group(), gm = new T.MeshBasicMaterial({ color: 0xdfffee, transparent: true, opacity: 0.5, depthWrite: false }); const body = new T.Mesh(geoC('cone12', () => new T.ConeGeometry(1, 1, 12)), gm); body.scale.set(1.0, 2.6, 1.0); body.rotation.x = Math.PI; body.position.y = 0; g.add(body); const hd = new T.Mesh(shared.sphere, gm); hd.scale.setScalar(0.75); hd.position.y = 1.5; g.add(hd); [-1, 1].forEach(s => { const e = new T.Mesh(shared.sphere, bas(0x111111)); e.scale.set(0.12, 0.2, 0.1); e.position.set(s * 0.25, 1.6, 0.62); g.add(e); }); g.position.set(p.x, 3, p.z); world.add(g); const ph = Math.random() * 6; anim.push(t => { g.position.y = 3 + Math.sin(t * 1.2 + ph) * 0.8; g.rotation.y = Math.sin(t * 0.5 + ph) * 1.2; g.position.x = p.x + Math.sin(t * 0.4 + ph) * 3; }); });
      for (let k = 0; k < 18; k++) { const g = new T.Group(), bm = new T.MeshBasicMaterial({ color: 0x15101f, side: T.DoubleSide }); const body = new T.Mesh(shared.sphere, bm); body.scale.set(0.3, 0.22, 0.5); g.add(body); const wgm = geoC('wing', () => { const gg = new T.BufferGeometry(); gg.setAttribute('position', new T.Float32BufferAttribute([0, 0, 0.3, 1.5, 0.2, 0, 0, 0, -0.3], 3)); return gg; }); const wl = new T.Mesh(wgm, bm), wr = new T.Mesh(wgm, bm); wr.scale.x = -1; g.add(wl, wr); const cxp = CX + rr(-R0, R0), czp = CZ + rr(-R0, R0), rad = rr(10, 40), sp = rr(0.4, 0.9), ph = Math.random() * 6, hy = rr(10, 24); world.add(g); anim.push(t => { const a = t * sp + ph; g.position.set(cxp + Math.cos(a) * rad, hy + Math.sin(t * 2 + ph), czp + Math.sin(a) * rad); g.rotation.y = -a; wl.rotation.z = Math.sin(t * 14 + ph) * 0.9; wr.rotation.z = -Math.sin(t * 14 + ph) * 0.9; }); }
      for (let k = 0; k < 7; k++) { const m = new T.Mesh(new T.PlaneGeometry(130, 130), new T.MeshBasicMaterial({ color: 0x9affc8, transparent: true, opacity: 0.09, depthWrite: false, side: T.DoubleSide })); m.rotation.x = -Math.PI / 2; const a = Math.random() * PI2, r = Math.random() * R0; m.position.set(CX + Math.cos(a) * r, 0.8 + k * 0.15, CZ + Math.sin(a) * r); world.add(m); anim.push(t => { m.position.x += Math.sin(t * 0.2 + k) * 0.03; m.rotation.z = t * 0.03 * (k % 2 ? 1 : -1); }); }
      const moon = new T.Mesh(shared.sphere, bas(0xf4efd0, { fog: false })); moon.scale.setScalar(70); moon.position.set(-340, 400, -700); skyGroup.add(moon); const mh = new T.Mesh(shared.sphere, bas(0xcfd8ff, { fog: false, transparent: true, opacity: 0.16 })); mh.scale.setScalar(130); mh.position.copy(moon.position); skyGroup.add(mh);
      const st = new Float32Array(900); for (let i = 0; i < 300; i++) { const a = Math.random() * PI2, e = Math.random() * 1.2 + 0.05, r = 850; st[i * 3] = Math.cos(a) * Math.cos(e) * r; st[i * 3 + 1] = Math.sin(e) * r; st[i * 3 + 2] = Math.sin(a) * Math.cos(e) * r; } const sg = new T.BufferGeometry(); sg.setAttribute('position', new T.BufferAttribute(st, 3)); skyGroup.add(new T.Points(sg, new T.PointsMaterial({ size: 3, color: 0xffffff, fog: false, sizeAttenuation: false })));
    },
    fantasia(d) {
      const ms = spots(85, 9, 0, R0 + 260), cap = geoC('cap', () => new T.SphereGeometry(1, 12, 8, 0, PI2, 0, Math.PI / 2));
      ms.forEach(p => { p.h = rr(4, 12); p.R = p.h * rr(0.55, 0.8); p.c = pk(d.props); });
      inst(geoC('cyl8', () => new T.CylinderGeometry(1, 1.1, 1, 8)), instLam, ms.map(p => ({ x: p.x, y: p.h / 2, z: p.z, sx: p.R * 0.3, sy: p.h, sz: p.R * 0.3, c: '#fff4e0' })));
      inst(cap, instLam, ms.map(p => ({ x: p.x, y: p.h, z: p.z, sx: p.R, sy: p.R * 0.8, sz: p.R, c: p.c })));
      const dots = []; ms.forEach(p => { for (let j = 0; j < 4; j++) { const a = Math.random() * PI2, pol = rr(0.25, 1.0); dots.push({ x: p.x + Math.cos(a) * Math.sin(pol) * p.R * 0.98, y: p.h + Math.cos(pol) * p.R * 0.8 * 0.98, z: p.z + Math.sin(a) * Math.sin(pol) * p.R * 0.98, sx: p.R * 0.17, c: '#ffffff' }); } }); inst(shared.sphere, instLam, dots);
      [0.1, 0.34, 0.6, 0.85].forEach(fr => { const i = Math.floor(tr.N * fr), g = new T.Group(); g.position.set(tr.P[i * 2], 0, tr.P[i * 2 + 1]); g.rotation.y = Math.atan2(tr.T[i * 2], tr.T[i * 2 + 1]); ['#ff2d2d', '#ff9a1f', '#ffe14a', '#4cd84a', '#2ac8ff', '#4a5cff', '#a85cff'].forEach((c, k) => { const t2 = new T.Mesh(new T.TorusGeometry(tr.half + 6 - k * 1.1, 0.6, 6, 28, Math.PI), bas(c)); g.add(t2); }); world.add(g); });
      spots(9, 10, R0 * 0.2, R0 + 250).forEach((p, i) => { const g = new T.Group(), rad = rr(12, 20); const top = new T.Mesh(geoC('cyl14', () => new T.CylinderGeometry(1, 1, 1, 14)), lam('#7cff9a')); top.scale.set(rad, 3, rad); g.add(top); const bot = new T.Mesh(geoC('cone14', () => new T.ConeGeometry(1, 1, 14)), lam('#a8744a')); bot.scale.set(rad, 14, rad); bot.rotation.x = Math.PI; bot.position.y = -8.5; g.add(bot); const tree = new T.Mesh(geoC('cone7', () => new T.ConeGeometry(1, 1, 7)), lam(pk(d.props))); tree.scale.set(4, 9, 4); tree.position.set(rr(-5, 5), 7, rr(-5, 5)); g.add(tree); g.position.set(p.x, rr(45, 100), p.z); world.add(g); const y0 = g.position.y, ph = Math.random() * 6; anim.push(t => { g.position.y = y0 + Math.sin(t * 0.6 + ph) * 3; g.rotation.y = t * 0.05 + ph; }); });
      const cs = spots(50, 8, 0, R0 + 200); inst(geoC('cone4', () => new T.ConeGeometry(1, 1, 4)), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.78 }), cs.map(p => { const h = rr(8, 20); return { x: p.x, y: h / 2, z: p.z, sx: rr(2, 4), sy: h, sz: rr(2, 4), ry: Math.random(), c: pk(['#6aeaff', '#ff8ae0', '#c0a0ff', '#8affc0']) }; }));
      const lp = sideSpots(14, 3.6); const swirl = canvasTex(64, 64, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.strokeStyle = '#ff6ac8'; g.lineWidth = 7; g.beginPath(); for (let a = 0; a < 18; a += 0.15) { const r = a * 1.6; g.lineTo(32 + Math.cos(a) * r, 32 + Math.sin(a) * r); } g.stroke(); });
      inst(geoC('cyl6', () => new T.CylinderGeometry(1, 1, 1, 6)), instLam, lp.map(p => ({ x: p.x, y: 2.6, z: p.z, sx: 0.16, sy: 5.2, sz: 0.16, c: '#ffffff' }))); const disc = inst(geoC('cyl20', () => new T.CylinderGeometry(1, 1, 1, 20)), new T.MeshLambertMaterial({ map: swirl }), lp.map((p, i) => ({ x: p.x, y: 6.4, z: p.z, sx: 2, sy: 0.3, sz: 2, rx: Math.PI / 2, ry: Math.atan2(tr.T[p.i * 2], tr.T[p.i * 2 + 1]), c: pk(['#ffffff', '#ffd0f0', '#d0f0ff', '#fff0b0']) })));
      const cg = new T.Group(), cx = CX + R0 + 330, cz = CZ - 200; const hill = new T.Mesh(shared.sphere, lam('#6ae88a')); hill.scale.set(150, 60, 150); hill.position.set(0, -20, 0); cg.add(hill); const keep = new T.Mesh(geoC('b', () => new T.BoxGeometry(1, 1, 1)), lam('#fff0f8')); keep.scale.set(36, 44, 36); keep.position.y = 62; cg.add(keep); const kr = new T.Mesh(geoC('cone4', () => new T.ConeGeometry(1, 1, 4)), lam('#ff6ac8')); kr.scale.set(30, 30, 30); kr.position.y = 99; kr.rotation.y = Math.PI / 4; cg.add(kr);
      [[-24, -24], [24, -24], [-24, 24], [24, 24]].forEach((c, i) => { const t3 = new T.Mesh(geoC('cyl14', () => new T.CylinderGeometry(1, 1, 1, 14)), lam('#ffffff')); t3.scale.set(7, 56, 7); t3.position.set(c[0], 58, c[1]); cg.add(t3); const r3 = new T.Mesh(geoC('cone14', () => new T.ConeGeometry(1, 1, 14)), lam(['#6ac8ff', '#ffd24a', '#a86aff', '#7cff9a'][i])); r3.scale.set(9, 18, 9); r3.position.set(c[0], 95, c[1]); cg.add(r3); }); cg.position.set(cx, 0, cz); world.add(cg);
      clouds(14, 0xffe8f8, 150, 240); const st = new Float32Array(600); for (let i = 0; i < 200; i++) { const a = Math.random() * PI2, e = Math.random() * 1.1 + 0.2, r = 850; st[i * 3] = Math.cos(a) * Math.cos(e) * r; st[i * 3 + 1] = Math.sin(e) * r; st[i * 3 + 2] = Math.sin(a) * Math.cos(e) * r; } const sg = new T.BufferGeometry(); sg.setAttribute('position', new T.BufferAttribute(st, 3)); skyGroup.add(new T.Points(sg, new T.PointsMaterial({ size: 4, color: 0xffffff, fog: false, sizeAttenuation: false, transparent: true, opacity: 0.8 })));
    },
    neon(d) {
      const cnt = 170, im = inst(geoC('b', () => new T.BoxGeometry(1, 1, 1)), instLam, spots(cnt, 22, 0, R0 + 260).map((p, n) => { const w = rr(12, 34), h = rr(10, 65); return { x: p.x, y: h / 2, z: p.z, sx: w, sy: h, sz: w, ry: Math.random() * 3, c: new T.Color(d.props[n % d.props.length]).offsetHSL(0, 0, rr(-0.06, 0.06)).getStyle() }; }));
      spots(60, 22, 0, R0 + 260).forEach(p => { });
      const gl = spots(70, 24, 0, R0 + 260); inst(geoC('b', () => new T.BoxGeometry(1, 1, 1)), instBas(), gl.map(p => ({ x: p.x, y: rr(3, 40), z: p.z, sx: rr(2, 8), sy: 0.6, sz: 0.4, ry: Math.random() * 3, c: pk(['#ff2d95', '#00e5ff', '#7cff6a', '#ffd24a']) })));
      for (let k = 0; k < 6; k++) { const i = Math.floor(tr.N * (k + 0.5) / 6), s = k % 2 ? 1 : -1, x = tr.P[i * 2] + tr.Nm[i * 2] * s * (tr.wallD + 40), z = tr.P[i * 2 + 1] + tr.Nm[i * 2 + 1] * s * (tr.wallD + 40); const t = new T.Mesh(new T.CylinderGeometry(0.6, 2.2, 90, 6), lam('#aab4d8')); t.position.set(x, 45, z); world.add(t); const ball = new T.Mesh(shared.sphere, bas(0xff2a3a)); ball.scale.setScalar(2.2); ball.position.set(x, 92, z); ball.userData.blink = true; world.add(ball); }
      const st = new Float32Array(600); for (let i = 0; i < 200; i++) { const a = Math.random() * PI2, e = Math.random() * 1.1 + 0.2, r = 850; st[i * 3] = Math.cos(a) * Math.cos(e) * r; st[i * 3 + 1] = Math.sin(e) * r; st[i * 3 + 2] = Math.sin(a) * Math.cos(e) * r; } const sg = new T.BufferGeometry(); sg.setAttribute('position', new T.BufferAttribute(st, 3)); skyGroup.add(new T.Points(sg, new T.PointsMaterial({ size: 2.5, color: 0xffffff, fog: false, sizeAttenuation: false })));
    }
  };
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
      const wm = new T.MeshLambertMaterial({ color: 0xe8412a, side: T.DoubleSide, flatShading: true }), wg = geo('wing', () => { const gg = new T.BufferGeometry(); gg.setAttribute('position', new T.Float32BufferAttribute([0, 0, 0, 1.5, 0.9, -0.1, 1.2, 0.1, -0.5, 0, 0, 0, 1.2, 0.1, -0.5, 0.3, -0.5, -0.4], 3)); gg.computeVertexNormals(); return gg; });
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
    wolke: { seatY: 1.05, seatZ: -0.4, plateZ: -2.05, plateY: 1.15 }
  };
  const bananaMesh = () => { const g = new T.Group(), y = lam('#ffe14a', { emissive: 0x5a4a00 }), br = lam('#6a4a1a'); for (let i = 0; i < 7; i++) { const a = -1.0 + i * (2.0 / 6), r = 0.3 - Math.abs(a) * 0.05; S_(g, y, Math.sin(a) * 1.15, (1 - Math.cos(a)) * 1.1 + 0.15, 0, r + 0.12, r + 0.12, r + 0.12); } S_(g, br, Math.sin(-1.08) * 1.15, (1 - Math.cos(1.08)) * 1.1 + 0.15, 0, 0.14); S_(g, br, Math.sin(1.08) * 1.15, (1 - Math.cos(1.08)) * 1.1 + 0.15, 0, 0.14); g.scale.setScalar(1.3); return g; };
  const rockMesh = (sc) => { const m = new T.Mesh(geo('rock', () => new T.IcosahedronGeometry(1, 0)), lam('#8a8f9a')); m.scale.set(0.9 * (sc || 1), 0.8 * (sc || 1), 1.0 * (sc || 1)); return m; };
  function makeKart(k) {
    const C = CHARS[(k.char == null ? k.k : k.char) % CHARS.length], KD = KARTS[(k.kart || 0) % KARTS.length], P = KPAR[KD.id], fn = CH[C.id], g = new T.Group(), body = new T.Group(); g.add(body);
    const hull = lam(C.acc), dark = lam('#1c1f2e'), white = lam('#f4f6fb'), chrome = lam('#d0d8e8'), slot = lam(KCOL[k.k % 8]), skinM = lam(C.skin), bodyM = lam(C.body), tire = lam('#16161e'), rim = lam('#d8dff0');
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
    } else {   // wolke
      wf = [0.5, 0.42, 1.0, 1.3]; wr = [0.58, 0.5, 1.05, -1.05];
      const cl = lam('#ffffff'); S_(body, cl, 0, 0.78, 0, 1.0, 0.5, 1.5); [[-0.8, 0.5], [0.8, 0.5], [-0.75, -0.7], [0.75, -0.7]].forEach(p => S_(body, cl, p[0], 0.7, p[1], 0.55, 0.45, 0.65)); S_(body, cl, 0, 0.68, 1.4, 0.65, 0.42, 0.7); S_(body, cl, 0, 0.7, -1.3, 0.7, 0.45, 0.6);
      S_(body, hull, 0, 0.36, 0, 1.15, 0.1, 1.9); S_(body, slot, 0, 0.36, 0, 1.2, 0.04, 1.95);
      [-1, 1].forEach(s => { const w = B_(body, slot, s * 1.55, 1.15, -0.4, 0.9, 0.08, 0.5, [0, 0, s * 0.35]); S_(body, bas(0xffe88a), s * 0.5, 1.2, 1.9, 0.12); });
      S_(body, bas(0xffe88a), 0, 1.35, 1.6, 0.16); B_(body, white, 0, 0.8, -1.7, 0.9, 0.5, 0.5);
    }
    // Heckplatte mit Logo (Sender-Logo bleibt auf jedem Kart sichtbar)
    const plate = B_(body, white, 0, P.plateY, P.plateZ, 1.05, 1.05, 0.06); const lg = new T.Mesh(new T.PlaneGeometry(0.95, 0.95), logoMat(k.logo)); lg.position.set(0, P.plateY, P.plateZ - 0.04); lg.rotation.y = Math.PI; body.add(lg);
    [-1, 1].forEach(s => { const st = new T.Mesh(new T.PlaneGeometry(0.85, 0.85), logoMat(k.logo)); st.position.set(s * (id === 'cruiser' ? 1.28 : id === 'wolke' ? 1.12 : 1.12), 0.62, 0.2); st.rotation.y = s * Math.PI / 2; body.add(st); if (id === 'allrounder') st.position.x = s * 1.31; });
    // Sitz, Lenkrad
    B_(body, dark, 0, P.seatY, P.seatZ, 0.95, 0.4, 0.8); B_(body, dark, 0, P.seatY + 0.4, P.seatZ - 0.42, 0.95, 0.75, 0.22); Y_(body, dark, 0, P.seatY + 0.12, P.seatZ + 0.95, 0.05, 0.7, [-0.9, 0, 0], 6); part(body, geo('tor', () => new T.TorusGeometry(1, 0.2, 6, 14)), slot, 0, P.seatY + 0.4, P.seatZ + 0.68, 0.24, 0.24, 0.24, -0.9, 0, 0);
    // Fahrer
    const torso = new T.Group(); torso.position.set(0, P.seatY + 0.52, P.seatZ - 0.05); torso.scale.setScalar(1.28); body.add(torso); S_(torso, bodyM, 0, 0, 0, 0.5, 0.52, 0.38);
    [-1, 1].forEach(s => { const arm = new T.Group(); arm.position.set(s * 0.46, 0.2, 0.0); arm.rotation.set(-1.15, 0, s * 0.12); torso.add(arm); Y_(arm, bodyM, 0, -0.38, 0, 0.1, 0.78, null, 8); S_(arm, skinM, 0, -0.8, 0, 0.12); });
    const head = new T.Group(); head.position.set(0, 0.88, 0.02); torso.add(head); fn(head, torso, body, C);
    // Räder
    const wheels = []; const wg_ = geo('wt', () => new T.CylinderGeometry(1, 1, 1, 16).rotateZ(Math.PI / 2));
    [[-1, wf], [1, wf], [-1, wr], [1, wr]].forEach((p, i) => { const q = p[1], front = i < 2, wg = new T.Group(); wg.position.set(p[0] * q[2], q[0], q[3]); const spin = new T.Group(); wg.add(spin);
      part(spin, wg_, tire, 0, 0, 0, q[1], q[0], q[0]); part(spin, wg_, rim, p[0] * 0.03, 0, 0, q[1] * 1.04, q[0] * 0.55, q[0] * 0.55); B_(spin, slot, p[0] * q[1] * 0.55, 0, 0, 0.05, q[0] * 0.9, 0.12); B_(spin, slot, p[0] * q[1] * 0.55, 0, 0, 0.05, 0.12, q[0] * 0.9); g.add(wg); wheels.push({ wg, w: spin, front }); });
    const fz = id === 'dragster' ? -3.3 : -3.0, flame = new T.Mesh(new T.ConeGeometry(0.4, 1.8, 8), bas(0x66ccff, { transparent: true, opacity: 0.85, blending: T.AdditiveBlending })); flame.rotation.x = -Math.PI / 2; flame.position.set(0, 0.8, fz); flame.visible = false; g.add(flame);
    const shield = new T.Mesh(shared.sphere, bas(0x66e0ff, { transparent: true, opacity: 0.28, blending: T.AdditiveBlending, depthWrite: false })); shield.scale.set(2.6, 2.3, 3.2); shield.position.y = 1.3; shield.visible = false; g.add(shield);
    const sp = new T.Points(new T.BufferGeometry().setAttribute('position', new T.BufferAttribute(new Float32Array(30), 3)), new T.PointsMaterial({ size: 0.5, color: 0xffd24a, transparent: true, depthWrite: false })); sp.frustumCulled = false; sp.visible = false; g.add(sp);
    const blob = new T.Mesh(new T.CircleGeometry(1.7, 14), bas(0x000000, { transparent: true, opacity: 0.35 })); blob.rotation.x = -Math.PI / 2; blob.position.y = 0.05; g.add(blob);
    const stars = new T.Group(); for (let i = 0; i < 3; i++) { const s = new T.Mesh(shared.sphere, bas(0xffe14a)); s.scale.setScalar(0.2); stars.add(s); } stars.visible = false; g.add(stars);
    const trailB = new T.Group(), trailR = new T.Group(); for (let i = 0; i < 3; i++) { const b = bananaMesh(); b.visible = false; trailB.add(b); const r = rockMesh(0.7); r.visible = false; trailR.add(r); } g.add(trailB); g.add(trailR);
    g.scale.setScalar(1.1); scene.add(g); return { g, body, wheels, flame, shield, sp, stars, trailB, trailR, k, head };
  }
  // Nur für Tests/Vorschau: alle Figuren/Karts nebeneinander
  function gallery(mode) { if (world) world.visible = false; const gp = new T.Mesh(new T.PlaneGeometry(400, 400), lam('#8fd870')); gp.rotation.x = -Math.PI / 2; scene.add(gp); CHARS.forEach((c, i) => { const m = makeKart({ k: i, logo: i, char: mode === 'karts' ? 1 : i, kart: mode === 'karts' ? i % 6 : 0 }); m.g.position.set((i % 6 - 2.5) * 6.2, 0, Math.floor(i / 6) * -8); m.g.rotation.y = 0.55; }); }
  function peek(x, y, z, lx, ly, lz, w, h) { const c = mcam(); c.position.set(x, y, z); c.lookAt(lx, ly, lz); c.aspect = w / h; c.updateProjectionMatrix(); sky.position.copy(c.position); if (skyGroup) skyGroup.position.copy(c.position); renderer.setViewport(0, 0, W, H); renderer.setScissor(0, 0, W, H); renderer.render(scene, c); }
  // ------------------------------------------------------------------ Effekte (Partikel, Blitze)
  const FXN = 260, fxPos = new Float32Array(FXN * 3).fill(-100), fxCol = new Float32Array(FXN * 3), fxVel = new Float32Array(FXN * 3), fxLife = new Float32Array(FXN); let fxPts = null, fxHead = 0;
  function initFx() { const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(fxPos, 3)); g.setAttribute('color', new T.BufferAttribute(fxCol, 3)); fxPts = new T.Points(g, new T.PointsMaterial({ size: 1.3, vertexColors: true, transparent: true, depthWrite: false })); fxPts.frustumCulled = false; scene.add(fxPts); }
  function burst(x, y, z, hex, n, spd, up) { if (!fxPts) initFx(); const c = new T.Color(hex); for (let i = 0; i < n; i++) { const k = (fxHead++ % FXN) * 3, a = Math.random() * PI2, s = (spd || 6) * (0.4 + Math.random() * 0.8); fxPos[k] = x; fxPos[k + 1] = y; fxPos[k + 2] = z; fxVel[k] = Math.cos(a) * s; fxVel[k + 1] = (up == null ? 4 : up) * (0.4 + Math.random()); fxVel[k + 2] = Math.sin(a) * s; fxCol[k] = c.r; fxCol[k + 1] = c.g; fxCol[k + 2] = c.b; fxLife[k / 3] = 0.5 + Math.random() * 0.5; } fxPts.geometry.attributes.color.needsUpdate = true; }
  function stepFx(dt) { if (!fxPts) return; let any = false; for (let i = 0; i < FXN; i++) { if (fxLife[i] <= 0) continue; const k = i * 3; fxLife[i] -= dt; if (fxLife[i] <= 0) { fxPos[k + 1] = -100; continue; } any = true; fxPos[k] += fxVel[k] * dt; fxPos[k + 1] += fxVel[k + 1] * dt; fxPos[k + 2] += fxVel[k + 2] * dt; fxVel[k + 1] -= 10 * dt; } fxPts.geometry.attributes.position.needsUpdate = true; }
  const bolts = []; function bolt(x, z) { let b = bolts.find(q => q.t <= 0); if (!b) { const g = new T.Group(); for (let i = 0; i < 6; i++) { const s = new T.Mesh(geo('b', () => new T.BoxGeometry(1, 1, 1)), bas(0xffffff, { transparent: true, opacity: 0.95, blending: T.AdditiveBlending, depthWrite: false })); s.scale.set(0.35, 3.4, 0.35); s.position.set((i % 2 ? 1 : -1) * 0.7, 18 - i * 3.2, 0); s.rotation.z = (i % 2 ? 1 : -1) * 0.4; g.add(s); } scene.add(g); b = { g, t: 0 }; bolts.push(b); } b.t = 0.55; b.g.position.set(x, 0, z); b.g.visible = true; }

  // ------------------------------------------------------------------ Rennen: Aufbau und Einzelbild
  let boxes = [], padsM = [], hazM = { mine: [], banana: [] }, rocM = { rocket: [], rock: [] }, boomM = [];
  function setupRace(S, humanIdx) {
    kmesh.forEach(m => scene.remove(m.g)); kmesh = S.karts.map(makeKart); boxes.forEach(b => scene.remove(b)); boxes = S.boxes.map(b => { const m = new T.Mesh(shared.boxGeo, boxMat); m.position.set(b.x, 1.8, b.z); scene.add(m); return m; });
    padsM.forEach(p => scene.remove(p)); padsM = S.pads.map(p => { const m = new T.Mesh(new T.PlaneGeometry(8, 12), padMat); m.rotation.order = 'YXZ'; m.rotation.x = -Math.PI / 2; m.rotation.y = p.th + Math.PI; m.position.set(p.x, 0.08, p.z); scene.add(m); return m; });
    [].concat(hazM.mine, hazM.banana, rocM.rocket, rocM.rock, boomM).forEach(m => scene.remove(m)); hazM = { mine: [], banana: [] }; rocM = { rocket: [], rock: [] }; boomM = [];
    cams.length = 0; humanIdx.forEach(i => { const k = S.karts[i]; cams.push({ k, ang: k.th, pos: new T.Vector3(k.x, 4, k.z), cam: new T.PerspectiveCamera(66, 1, 0.5, 1400), fov: 66 }); });
  }
  const poolGet = (arr, mk) => { let m = arr.find(x => !x.visible); if (!m) { m = mk(); arr.push(m); scene.add(m); } m.visible = true; return m; };
  function updateKarts(S, dt, time) {
    S.karts.forEach((k, i) => {
      const m = kmesh[i]; if (!m) return; m.g.position.set(k.x, 0, k.z); m.g.rotation.y = k.th;
      const roll = -k.steer * 0.12 * clamp(k.vf / 30, 0, 1) + (k.drift ? k.drift * 0.1 : 0); m.body.rotation.z = roll; m.body.rotation.y = k.drift ? k.drift * 0.35 : 0; m.body.position.y = k.spinT > 0 ? Math.abs(Math.sin(time * 14)) * 0.6 : 0;
      m.wheels.forEach(w => { w.w.rotation.x += k.vf * dt / 0.5; if (w.front) w.wg.rotation.y = -k.steer * 0.45; });
      m.flame.visible = k.boostT > 0; if (m.flame.visible) { m.flame.scale.set(1, 0.8 + Math.random() * 0.8, 1); }
      m.shield.visible = k.shieldT > 0 && (k.shieldT > 1.5 || ((time * 8) | 0) % 2 === 0);
      const sv = k.drift && k.vf > 10; m.sp.visible = !!sv; if (sv) { const a = m.sp.geometry.attributes.position; for (let j = 0; j < 10; j++) a.setXYZ(j, (j % 2 ? 1 : -1) * 0.9 + (Math.random() - 0.5) * 0.7, 0.2 + Math.random() * 0.8, -1.6 - Math.random() * 1.2); a.needsUpdate = true; m.sp.material.color.setHex([0xffffff, 0x66ccff, 0xff9a1f, 0xff2d95][k.dTier || 0]); }
      m.stars.visible = k.spinT > 0; if (m.stars.visible) m.stars.children.forEach((s, j) => { const a = time * 7 + j * 2.09; s.position.set(Math.cos(a) * 1.3, 3.9 + Math.sin(time * 9 + j) * 0.2, Math.sin(a) * 1.3); });
      // mitgeführte Items: Bananen hinten, Steine kreisen
      const nB = k.item && k.item.startsWith('banana') ? Math.max(1, k.itemN) : 0, nR = k.item && k.item.startsWith('rock') ? Math.max(1, k.itemN) : 0;
      m.trailB.children.forEach((b, j) => { b.visible = j < nB; b.position.set(0, 0.5 + Math.sin(time * 5 + j) * 0.08, -3.5 - j * 1.1); b.rotation.y = time * 2 + j; }); m.trailR.children.forEach((r, j) => { r.visible = j < nR; const a = time * 4 + j * (PI2 / Math.max(1, nR)); r.position.set(Math.cos(a) * 2.5, 1.5, Math.sin(a) * 2.5 - 0.3); r.rotation.set(time * 3, time * 2, 0); });
      if (k.boostT > 0 && Math.random() < 0.5) burst(k.x - Math.sin(k.th) * 3, 0.8, k.z - Math.cos(k.th) * 3, 0x66ccff, 1, 2, 1);
    });
    boxes.forEach((m, i) => { m.visible = S.boxes[i].cd <= 0; m.rotation.y = time * 1.8; m.rotation.x = time * 1.1; m.position.y = 1.9 + Math.sin(time * 2.4 + i) * 0.25; });
    ['mine', 'banana'].forEach(kd => hazM[kd].forEach(m => { m.visible = false; }));
    S.hazards.forEach(h => { const m = poolGet(hazM[h.kind], () => h.kind === 'banana' ? bananaMesh() : new T.Mesh(mineGeo, lam('#a020f0', { emissive: 0x4a0a6a }))); m.position.set(h.x, h.kind === 'banana' ? 0.35 : 1.1, h.z); m.rotation.y = h.kind === 'banana' ? h.x : time * 2; if (h.kind === 'mine') m.scale.setScalar(1 + Math.sin(time * 8) * 0.08); });
    ['rocket', 'rock'].forEach(kd => rocM[kd].forEach(m => { m.visible = false; }));
    S.proj.forEach(r => { const m = poolGet(rocM[r.kind], () => r.kind === 'rock' ? rockMesh(1.15) : new T.Mesh(rocketGeo, bas(0xff4a2a))); m.position.set(r.x, r.kind === 'rock' ? 1.0 + Math.abs(Math.sin(time * 9)) * 0.5 : 1.2, r.z); if (r.kind === 'rock') m.rotation.set(time * 8, 0, time * 5); else { m.rotation.set(0, r.th, 0); burst(r.x - Math.sin(r.th) * 1.5, 1.2, r.z - Math.cos(r.th) * 1.5, Math.random() < 0.5 ? 0xffaa55 : 0xcccccc, 1, 1, 0.5); } });
    S.events.forEach(e => {
      if (e.t === 'boom') { const m = poolGet(boomM, () => new T.Mesh(shared.sphere, bas(0xffaa33, { transparent: true, opacity: 0.8, blending: T.AdditiveBlending }))); m.position.set(e.x, 1.3, e.z); m.userData.t = 0; burst(e.x, 1.5, e.z, 0xff9a33, 22, 9, 6); }
      else if (e.t === 'splat') burst(e.x, 0.8, e.z, 0xffe14a, 16, 5, 4); else if (e.t === 'smash') burst(e.x, 1.0, e.z, 0x9aa0b0, 18, 7, 5); else if (e.t === 'rockBounce') burst(e.x, 0.8, e.z, 0xcfc8a8, 5, 3, 2);
      else if (e.t === 'hit') { const k = S.karts[e.k]; burst(k.x, 2.2, k.z, 0xffe14a, 14, 4, 6); } else if (e.t === 'pad') { const k = S.karts[e.k]; burst(k.x, 0.6, k.z, 0xffd24a, 6, 3, 2); }
      else if (e.t === 'flash') (e.ids || []).forEach(id => { const k = S.karts[id]; bolt(k.x, k.z); burst(k.x, 2, k.z, 0xffffff, 18, 8, 8); });
      else if (e.t === 'use' && e.item === 'shield') { const k = S.karts[e.k]; burst(k.x, 1.5, k.z, 0x66e0ff, 14, 5, 3); } else if (e.t === 'use' && (e.item === 'banana' || e.item === 'mine')) { const k = S.karts[e.k]; burst(k.x - Math.sin(k.th) * 3, 0.8, k.z - Math.cos(k.th) * 3, 0xffe14a, 6, 3, 2); } else if (e.t === 'use' && e.item === 'rock') { const k = S.karts[e.k]; burst(k.x + Math.sin(k.th) * 3, 0.8, k.z + Math.cos(k.th) * 3, 0xcfc8a8, 8, 4, 3); }
      else if (e.t === 'fog') (e.ids || []).forEach(id => { const k = S.karts[id]; burst(k.x, 2, k.z, 0xeaf6ff, 22, 5, 3); });
    });
    boomM.forEach(m => { if (!m.visible) return; m.userData.t += dt; const u = m.userData.t / 0.5; m.scale.setScalar(1 + u * 5); m.material.opacity = Math.max(0, 0.8 - u); if (u >= 1) m.visible = false; });
    bolts.forEach(b => { if (b.t > 0) { b.t -= dt; b.g.visible = b.t > 0 && ((time * 30) | 0) % 2 === 0; if (b.t <= 0) b.g.visible = false; } });
    stepFx(dt); anim.forEach(f => f(time)); world && world.children.forEach(o => { if (o.userData && o.userData.blink) o.visible = ((time * 1.5) | 0) % 2 === 0; });
  }
  function updateCam(c, S, dt) {
    const k = c.k, tgt = k.th + (k.drift ? -k.drift * 0.28 : 0); c.ang += wrap(tgt - c.ang) * Math.min(1, dt * (k.spinT > 0 ? 1.5 : 5.2));
    const af = clamp(1 / Math.sqrt(c.cam.aspect || 1.7), 1, 1.75), dist = (7.4 + clamp(k.vf / 36, 0, 1.4) * 0.9) * af, wx = k.x - Math.sin(c.ang) * dist, wz = k.z - Math.cos(c.ang) * dist, kk = 1 - Math.exp(-dt * 10);
    c.pos.x += (wx - c.pos.x) * kk; c.pos.z += (wz - c.pos.z) * kk; c.pos.y = 3.1 * (0.85 + 0.15 * af); c.cam.position.copy(c.pos);
    const tf = 64 + clamp(k.vf / 36, 0, 1.5) * 8 + (k.boostT > 0 ? 9 : 0); c.fov += (tf - c.fov) * Math.min(1, dt * 4); c.cam.fov = c.fov;
    c.cam.lookAt(k.x + Math.sin(c.ang) * 5, 1.6, k.z + Math.cos(c.ang) * 5);
  }
  function rects(n, w, h) {
    if (n <= 1) return [[0, 0, w, h]]; const hw = (w / 2) | 0, hh = (h / 2) | 0;
    if (n === 2) return w >= h ? [[0, 0, hw, h], [hw, 0, w - hw, h]] : [[0, hh, w, h - hh], [0, 0, w, hh]];
    return [[0, hh, hw, h - hh], [hw, hh, w - hw, h - hh], [0, 0, hw, hh], [hw, 0, w - hw, hh]];
  }
  function resize(w, h, n) { W = w; H = h; pr = Math.min(window.devicePixelRatio || 1, n >= 3 ? 1 : n === 2 ? 1.25 : 1.75); renderer.setPixelRatio(pr); renderer.setSize(w, h, false); }
  function renderRace(S, dt, time, n) {
    updateKarts(S, dt, time); const rs = rects(Math.max(1, cams.length), W, H);
    cams.forEach((c, i) => { updateCam(c, S, dt); const r = rs[i]; renderer.setViewport(r[0], r[1], r[2], r[3]); renderer.setScissor(r[0], r[1], r[2], r[3]); c.cam.aspect = r[2] / r[3]; c.cam.updateProjectionMatrix(); sky.position.copy(c.cam.position); if (skyGroup) skyGroup.position.copy(c.cam.position); renderer.render(scene, c.cam); });
    return rs;
  }
  const mcam = () => menuCam.cam || (menuCam.cam = new T.PerspectiveCamera(60, 1, 0.5, 1400));
  function renderMenu(dt, time) {
    if (!tr) return; menuCam.f = (menuCam.f + dt * 9 / 3) % tr.N; const o = {}; tr.at(menuCam.f, 0, o); const c = mcam(), o2 = {}; tr.at(menuCam.f + 14, 0, o2);
    c.position.set(o.x - o.tx * 20, 22, o.z - o.tz * 20); c.lookAt(o2.x, 2, o2.z); c.aspect = W / H; c.updateProjectionMatrix(); sky.position.copy(c.position); if (skyGroup) skyGroup.position.copy(c.position);
    kmesh.forEach(m => scene.remove(m.g)); kmesh = []; boxes.forEach(b => scene.remove(b)); boxes = []; anim.forEach(f => f(time));
    renderer.setViewport(0, 0, W, H); renderer.setScissor(0, 0, W, H); renderer.render(scene, c);
  }
  return { gallery, peek, burst, init, setTrack, setupRace, renderRace, renderMenu, resize, rects, KCOL, get cams() { return cams; }, get ready() { return !!renderer; } };
})();
