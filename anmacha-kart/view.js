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
  function setTrack(track) {
    if (world) { scene.remove(world); world.traverse(o => { if (o.geometry && !o.userData.keep) o.geometry.dispose(); }); }
    tr = track; const d = tr.def; world = new T.Group(); scene.add(world);
    scene.background = new T.Color(d.sky[0]); scene.fog = new T.Fog(d.fog, d.bright ? 220 : 120, d.bright ? 760 : 520); hemi.intensity = d.bright ? 0.62 : 0.75; sun.intensity = d.bright ? 0.62 : 0.8;
    const cA = new T.Color(d.sky[0]), cB = new T.Color(d.sky[1]), cC = new T.Color(d.sky[2]), pa = sky.geometry.attributes.position, ca = sky.geometry.attributes.color, c = new T.Color();
    for (let i = 0; i < pa.count; i++) { const y = pa.getY(i) / 900; if (y > 0.25) c.copy(cB).lerp(cA, clamp((y - 0.25) / 0.6, 0, 1)); else c.copy(cC).lerp(cB, clamp((y + 0.1) / 0.35, 0, 1)); ca.setXYZ(i, c.r, c.g, c.b); } ca.needsUpdate = true;
    const ground = new T.Mesh(new T.PlaneGeometry(3000, 3000), lam(d.ground)); ground.rotation.x = -Math.PI / 2; ground.position.y = -0.1; world.add(ground);
    const road = canvasTex(128, 256, (g, w, h) => { g.fillStyle = d.road; g.fillRect(0, 0, w, h); for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(255,255,255,${Math.random() * 0.04})`; g.fillRect(Math.random() * w, Math.random() * h, 3, 3); } g.fillStyle = '#e8ecff'; g.fillRect(5, 0, 5, h); g.fillRect(w - 10, 0, 5, h); g.fillStyle = '#ffd24a'; for (let k = 0; k < 2; k++) g.fillRect(w / 2 - 3, k * 128 + 10, 6, 70); }, true);
    world.add(strip(-tr.half, tr.half, 0.02, 24, new T.MeshLambertMaterial({ map: road })));
    const curb = canvasTex(32, 64, (g, w, h) => { g.fillStyle = '#e8412a'; g.fillRect(0, 0, w, h / 2); g.fillStyle = '#fff'; g.fillRect(0, h / 2, w, h / 2); }, true);
    [-1, 1].forEach(s => { world.add(strip(s > 0 ? tr.half : -tr.half - 1.3, s > 0 ? tr.half + 1.3 : -tr.half, 0.04, 6, new T.MeshLambertMaterial({ map: curb }))); world.add(strip(s > 0 ? tr.half + 1.3 : -tr.wallD, s > 0 ? tr.wallD : -tr.half - 1.3, 0.01, 10, lam(new T.Color(d.ground).offsetHSL(0, 0, 0.06).getStyle()))); });
    const wtex = canvasTex(128, 32, (g, w, h) => { g.fillStyle = d.wall[1]; g.fillRect(0, 0, w, h); g.fillStyle = d.wall[0]; for (let x = -h; x < w; x += 32) { g.beginPath(); g.moveTo(x, h); g.lineTo(x + 16, h); g.lineTo(x + 16 + h / 2, h / 2); g.lineTo(x + 16, 0); g.lineTo(x, 0); g.lineTo(x + h / 2, h / 2); g.fill(); } g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(0, h - 4, w, 4); }, true);
    [-1, 1].forEach(s => { const m = strip(s * tr.wallD, 0, 0, 16, new T.MeshBasicMaterial({ map: wtex, side: T.DoubleSide }), true, 1.5); world.add(m); });
    // Start/Ziel
    const f0 = 0, p0 = { x: tr.P[0], z: tr.P[1] }, th0 = Math.atan2(tr.T[0], tr.T[1]);
    const chk = canvasTex(256, 32, (g, w, h) => { for (let x = 0; x < 16; x++) for (let y = 0; y < 2; y++) { g.fillStyle = (x + y) % 2 ? '#fff' : '#111'; g.fillRect(x * 16, y * 16, 16, 16); } });
    const line = new T.Mesh(new T.PlaneGeometry(tr.W, 3), new T.MeshBasicMaterial({ map: chk })); line.rotation.x = -Math.PI / 2; line.rotation.z = -th0 + Math.PI / 2 * 0; line.position.set(p0.x, 0.06, p0.z); line.rotation.set(-Math.PI / 2, 0, 0); line.rotation.order = 'YXZ'; line.rotation.y = th0 + Math.PI; world.add(line);
    const gantry = new T.Group(); gantry.position.set(p0.x, 0, p0.z); gantry.rotation.y = th0;
    [-1, 1].forEach(s => { const p = new T.Mesh(new T.BoxGeometry(1, 9, 1), lam('#1a1d33')); p.position.set(s * (tr.wallD - 0.5), 4.5, 0); gantry.add(p); });
    const beam = new T.Mesh(new T.BoxGeometry(tr.wallD * 2, 2.6, 0.8), lam('#10143a')); beam.position.y = 9; gantry.add(beam);
    const bn = new T.Mesh(new T.PlaneGeometry(tr.wallD * 2 - 1, 2.2), new T.MeshBasicMaterial({ map: canvasTex(512, 64, (g, w, h) => { g.fillStyle = '#10143a'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffd24a'; g.font = '900 40px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('AnMaCha KART RUSH · START / ZIEL', w / 2, h / 2 + 2); }) })); bn.position.set(0, 9, 0.45); gantry.add(bn); const bn2 = bn.clone(); bn2.rotation.y = Math.PI; bn2.position.z = -0.45; gantry.add(bn2); world.add(gantry);
    // Boost-Felder, Item-Boxen
    // wird in setupRace() aus der Simulation erzeugt
    // Reklametafeln mit Sender-Logos
    const nb = 16; for (let k = 0; k < nb; k++) { const i = Math.floor(tr.N * (k + 0.3) / nb), s = k % 2 ? 1 : -1, nx = tr.Nm[i * 2], nz = tr.Nm[i * 2 + 1], lid = logos.length ? logos[k % logos.length].idx : 0, g = new T.Group(); g.position.set(tr.P[i * 2] + nx * s * (tr.wallD + 5), 0, tr.P[i * 2 + 1] + nz * s * (tr.wallD + 5)); g.rotation.y = Math.atan2(-nx * s, -nz * s);
      [-2.6, 2.6].forEach(x => { const p = new T.Mesh(new T.BoxGeometry(0.5, 7, 0.5), lam('#1a1d33')); p.position.set(x, 3.5, 0); g.add(p); }); const bd = new T.Mesh(new T.BoxGeometry(6.4, 4.2, 0.4), lam('#0a0f2a')); bd.position.y = 6; g.add(bd); const lg = new T.Mesh(new T.PlaneGeometry(4, 4), logoMat(lid)); lg.position.set(0, 6, 0.22); g.add(lg); world.add(g); }
    // Kulissen
    const o = { i: 0, f: 0, d: 0 }, m4 = new T.Matrix4(), q = new T.Quaternion(), v3 = new T.Vector3(), sc = new T.Vector3(), cc = new T.Color();
    const free = (x, z, m) => { tr.nearest(x, z, -1, o); return Math.abs(o.d) > tr.wallD + m; };
    if (d.bright) {
      const cnt = 260, trunk = new T.InstancedMesh(new T.CylinderGeometry(0.5, 0.7, 1, 6), new T.MeshLambertMaterial({ color: 0x8a5a2a, flatShading: true }), cnt), crown = new T.InstancedMesh(new T.ConeGeometry(1, 1, 7), new T.MeshLambertMaterial({ color: 0xffffff, flatShading: true }), cnt);
      crown.instanceColor = new T.InstancedBufferAttribute(new Float32Array(cnt * 3), 3); let n = 0, tries = 0;
      while (n < cnt && tries++ < 6000) { const x = (Math.random() - 0.5) * 1000, z = (Math.random() - 0.5) * 900; if (!free(x, z, 10)) continue; const h = 6 + Math.random() * 9; q.identity(); m4.compose(v3.set(x, h * 0.2, z), q, sc.set(1.2, h * 0.4, 1.2)); trunk.setMatrixAt(n, m4); m4.compose(v3.set(x, h * 0.4 + h * 0.5, z), q, sc.set(h * 0.28, h * 0.95, h * 0.28)); crown.setMatrixAt(n, m4); cc.set(d.props[n % d.props.length]).offsetHSL(0, 0, (Math.random() - 0.5) * 0.1); crown.setColorAt(n, cc); n++; }
      trunk.count = crown.count = n; trunk.frustumCulled = crown.frustumCulled = false; world.add(trunk); world.add(crown);
      for (let k = 0; k < 9; k++) { let x, z, t = 0; do { const a = k / 9 * PI2 + Math.random() * 0.5, r = 520 + Math.random() * 200; x = Math.cos(a) * r; z = Math.sin(a) * r; } while (!free(x, z, 60) && t++ < 20); const hs = new T.Mesh(shared.sphere, lam(d.id === 'kueste' ? '#6ab04a' : '#3da84a')); hs.scale.set(160 + Math.random() * 120, 70 + Math.random() * 60, 160 + Math.random() * 100); hs.position.set(x, -10, z); world.add(hs); }
      const stripe = canvasTex(32, 128, (g, w, h) => { for (let y = 0; y < 8; y++) { g.fillStyle = y % 2 ? '#fff' : '#e8412a'; g.fillRect(0, y * 16, w, 16); } }, true);
      for (let k = 0; k < 7; k++) { const i = Math.floor(tr.N * (k + 0.4) / 7), s = k % 2 ? 1 : -1, x = tr.P[i * 2] + tr.Nm[i * 2] * s * (tr.wallD + 46), z = tr.P[i * 2 + 1] + tr.Nm[i * 2 + 1] * s * (tr.wallD + 46); const tw = new T.Mesh(new T.CylinderGeometry(4, 5.5, 70, 14), new T.MeshLambertMaterial({ map: stripe })); tw.position.set(x, 35, z); world.add(tw); const top = new T.Mesh(new T.CylinderGeometry(6, 4, 4, 14), lam('#ffd24a')); top.position.set(x, 72, z); world.add(top); }
      for (let k = 0; k < 14; k++) { const cl = new T.Group(); for (let j = 0; j < 4; j++) { const b = new T.Mesh(shared.sphere, bas(0xffffff, { fog: false })); b.scale.set(26 + Math.random() * 16, 14 + Math.random() * 8, 18); b.position.set(j * 26 - 40, Math.random() * 6, Math.random() * 10); cl.add(b); } const a = Math.random() * PI2, r = 450 + Math.random() * 300; cl.position.set(Math.cos(a) * r, 190 + Math.random() * 90, Math.sin(a) * r); cl.rotation.y = a; world.add(cl); }
    } else {
      const cnt = 170, im = new T.InstancedMesh(new T.BoxGeometry(1, 1, 1), new T.MeshLambertMaterial({ color: 0xffffff, flatShading: true }), cnt); im.instanceColor = new T.InstancedBufferAttribute(new Float32Array(cnt * 3), 3); let n = 0, tries = 0;
      while (n < cnt && tries++ < 4000) { const x = (Math.random() - 0.5) * 900, z = (Math.random() - 0.5) * 800; if (!free(x, z, 22)) continue; const w = 12 + Math.random() * 22, h = 10 + Math.random() * 55; q.setFromEuler(new T.Euler(0, Math.random() * 3, 0)); m4.compose(v3.set(x, h / 2, z), q, sc.set(w, h, w)); im.setMatrixAt(n, m4); cc.set(d.props[n % d.props.length]).offsetHSL(0, 0, (Math.random() - 0.5) * 0.12); im.setColorAt(n, cc); n++; }
      im.count = n; im.frustumCulled = false; world.add(im);
      for (let k = 0; k < 6; k++) { const i = Math.floor(tr.N * (k + 0.5) / 6), s = k % 2 ? 1 : -1, x = tr.P[i * 2] + tr.Nm[i * 2] * s * (tr.wallD + 40), z = tr.P[i * 2 + 1] + tr.Nm[i * 2 + 1] * s * (tr.wallD + 40); const t = new T.Mesh(new T.CylinderGeometry(0.6, 2.2, 90, 6), lam('#aab4d8')); t.position.set(x, 45, z); world.add(t); const ball = new T.Mesh(shared.sphere, bas(0xff2a3a)); ball.scale.setScalar(2.2); ball.position.set(x, 92, z); ball.userData.blink = true; world.add(ball); }
    }
  }

  // ------------------------------------------------------------------ Karts & Items
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
  function makeKart(k) {
    const C = CHARS[(k.char == null ? k.k : k.char) % CHARS.length], fn = CH[C.id], g = new T.Group(), body = new T.Group(); g.add(body);
    const hull = lam(C.acc), dark = lam('#1c1f2e'), white = lam('#f4f6fb'), chrome = lam('#c8d0e0'), slot = lam(KCOL[k.k % 8]), skinM = lam(C.skin), bodyM = lam(C.body);
    // Chassis
    S_(body, hull, 0, 0.62, 0.05, 0.98, 0.4, 1.7); S_(body, hull, 0, 0.5, 1.55, 0.6, 0.28, 0.8); S_(body, white, 0, 0.42, 2.12, 0.55, 0.14, 0.2); B_(body, dark, 0, 0.36, 0, 1.5, 0.14, 2.9);
    [-1, 1].forEach(s => { S_(body, white, s * 1.0, 0.56, -0.2, 0.3, 0.28, 0.95); S_(body, slot, s * 0.92, 0.9, -0.4, 0.05, 0.05, 0.55); const st = new T.Mesh(new T.PlaneGeometry(0.85, 0.85), logoMat(k.logo)); st.position.set(s * 1.31, 0.58, -0.2); st.rotation.y = s * Math.PI / 2; body.add(st); });
    B_(body, dark, 0, 0.85, -1.5, 1.25, 0.5, 0.6); [-1, 1].forEach(s => Y_(body, chrome, s * 0.36, 0.78, -1.88, 0.12, 0.5, [Math.PI / 2, 0, 0]));
    // Heckflügel mit Logo-Tafel
    [-1, 1].forEach(s => B_(body, dark, s * 0.55, 1.15, -1.78, 0.1, 0.55, 0.1)); B_(body, slot, 0, 1.5, -1.9, 2.0, 0.12, 0.55); const plate = B_(body, white, 0, 1.0, -2.05, 1.05, 1.05, 0.06); plate.position.y = 1.05; const lg = new T.Mesh(new T.PlaneGeometry(0.95, 0.95), logoMat(k.logo)); lg.position.set(0, 1.05, -2.09); lg.rotation.y = Math.PI; body.add(lg);
    // Sitz, Lenkrad
    B_(body, dark, 0, 0.98, -0.5, 0.95, 0.4, 0.8); B_(body, dark, 0, 1.38, -0.92, 0.95, 0.75, 0.22); Y_(body, dark, 0, 1.1, 0.45, 0.05, 0.7, [-0.9, 0, 0], 6); part(body, geo('tor', () => new T.TorusGeometry(1, 0.2, 6, 14)), slot, 0, 1.38, 0.18, 0.24, 0.24, 0.24, -0.9, 0, 0);
    // Fahrer
    const torso = new T.Group(); torso.position.set(0, 1.5, -0.55); torso.scale.setScalar(1.28); body.add(torso); S_(torso, bodyM, 0, 0, 0, 0.5, 0.52, 0.38);
    [-1, 1].forEach(s => { const arm = new T.Group(); arm.position.set(s * 0.46, 0.2, 0.0); arm.rotation.set(-1.15, 0, s * 0.12); torso.add(arm); Y_(arm, bodyM, 0, -0.38, 0, 0.1, 0.78, null, 8); S_(arm, skinM, 0, -0.8, 0, 0.12); });
    const head = new T.Group(); head.position.set(0, 0.88, 0.02); torso.add(head); fn(head, torso, body, C);
    // Räder
    const wheels = []; const tire = lam('#16161e'), rim = lam('#d8dff0');
    [[-1, 1.38, 0.5, 0.45], [1, 1.38, 0.5, 0.45], [-1, -1.15, 0.68, 0.7], [1, -1.15, 0.68, 0.7]].forEach((p, i) => { const wg = new T.Group(); wg.position.set(p[0] * (i < 2 ? 1.0 : 1.08), p[2], p[1]); const r = p[2], w = p[3];
      const spin = new T.Group(); wg.add(spin); part(spin, geo('wt', () => new T.CylinderGeometry(1, 1, 1, 16).rotateZ(Math.PI / 2)), tire, 0, 0, 0, w, r, r); part(spin, geo('wt', () => new T.CylinderGeometry(1, 1, 1, 16).rotateZ(Math.PI / 2)), rim, p[0] * 0.03, 0, 0, w * 1.04, r * 0.55, r * 0.55); B_(spin, slot, p[0] * w * 0.55, 0, 0, 0.05, r * 0.9, 0.12); B_(spin, slot, p[0] * w * 0.55, 0, 0, 0.05, 0.12, r * 0.9); g.add(wg); wheels.push({ wg, w: spin, front: i < 2 }); });
    const flame = new T.Mesh(new T.ConeGeometry(0.4, 1.8, 8), bas(0x66ccff, { transparent: true, opacity: 0.85, blending: T.AdditiveBlending })); flame.rotation.x = -Math.PI / 2; flame.position.set(0, 0.8, -3.0); flame.visible = false; g.add(flame);
    const shield = new T.Mesh(shared.sphere, bas(0x66e0ff, { transparent: true, opacity: 0.28, blending: T.AdditiveBlending, depthWrite: false })); shield.scale.set(2.6, 2.3, 3.2); shield.position.y = 1.3; shield.visible = false; g.add(shield);
    const sp = new T.Points(new T.BufferGeometry().setAttribute('position', new T.BufferAttribute(new Float32Array(30), 3)), new T.PointsMaterial({ size: 0.5, color: 0xffd24a, transparent: true, depthWrite: false })); sp.frustumCulled = false; sp.visible = false; g.add(sp);
    const blob = new T.Mesh(new T.CircleGeometry(1.7, 14), bas(0x000000, { transparent: true, opacity: 0.35 })); blob.rotation.x = -Math.PI / 2; blob.position.y = 0.05; g.add(blob);
    g.scale.setScalar(1.1); scene.add(g); return { g, body, wheels, flame, shield, sp, k, head };
  }
  // Nur für Tests/Vorschau: alle Figuren nebeneinander
  function gallery() { const S0 = { k: 0 }; CHARS.forEach((c, i) => { const m = makeKart({ k: i, logo: i, char: i }); m.g.position.set((i % 6 - 2.5) * 4.6, 0, Math.floor(i / 6) * -6); m.g.rotation.y = 0.6; }); }
  function peek(x, y, z, lx, ly, lz, w, h) { const c = mcam(); c.position.set(x, y, z); c.lookAt(lx, ly, lz); c.aspect = w / h; c.updateProjectionMatrix(); sky.position.copy(c.position); renderer.setViewport(0, 0, W, H); renderer.setScissor(0, 0, W, H); renderer.render(scene, c); }
  let boxes = [], padsM = [], hazM = [], rocM = [], booms = [];
  function setupRace(S, humanIdx) {
    kmesh.forEach(m => scene.remove(m.g)); kmesh = S.karts.map(makeKart); boxes.forEach(b => scene.remove(b)); boxes = S.boxes.map(b => { const m = new T.Mesh(shared.boxGeo, boxMat); m.position.set(b.x, 1.8, b.z); scene.add(m); return m; });
    padsM.forEach(p => scene.remove(p)); padsM = S.pads.map(p => { const m = new T.Mesh(new T.PlaneGeometry(8, 12), padMat); m.rotation.order = 'YXZ'; m.rotation.x = -Math.PI / 2; m.rotation.y = p.th + Math.PI; m.position.set(p.x, 0.08, p.z); scene.add(m); return m; });
    hazM.forEach(m => scene.remove(m)); rocM.forEach(m => scene.remove(m)); booms.forEach(m => scene.remove(m)); hazM = []; rocM = []; booms = [];
    cams.length = 0; humanIdx.forEach(i => { const k = S.karts[i]; cams.push({ k, ang: k.th, pos: new T.Vector3(k.x, 4, k.z), cam: new T.PerspectiveCamera(66, 1, 0.5, 1400), fov: 66 }); });
  }
  const poolGet = (arr, mk) => { let m = arr.find(x => !x.visible); if (!m) { m = mk(); arr.push(m); scene.add(m); } m.visible = true; return m; };
  function updateKarts(S, dt, time) {
    S.karts.forEach((k, i) => {
      const m = kmesh[i]; if (!m) return; const spin = k.spinT > 0 ? (1.3 - k.spinT) * 0 : 0; m.g.position.set(k.x, 0, k.z); m.g.rotation.y = k.th;
      const roll = -k.steer * 0.12 * clamp(k.vf / 30, 0, 1) + (k.drift ? k.drift * 0.1 : 0); m.body.rotation.z = roll; m.body.rotation.y = k.drift ? k.drift * 0.35 : 0; m.body.position.y = k.spinT > 0 ? Math.abs(Math.sin(time * 14)) * 0.6 : 0;
      m.wheels.forEach(w => { w.w.rotation.x += k.vf * dt / 0.5; if (w.front) w.wg.rotation.y = -k.steer * 0.45; });
      m.flame.visible = k.boostT > 0; if (m.flame.visible) { m.flame.scale.set(1, 0.8 + Math.random() * 0.8, 1); m.flame.material.color.setHex(k.dTier || k.boostT > 0 ? 0x66ccff : 0xffaa33); }
      m.shield.visible = k.shieldT > 0 && (k.shieldT > 1.5 || ((time * 8) | 0) % 2 === 0);
      const sv = k.drift && k.vf > 10; m.sp.visible = !!sv; if (sv) { const a = m.sp.geometry.attributes.position; for (let j = 0; j < 10; j++) a.setXYZ(j, (j % 2 ? 1 : -1) * 0.9 + (Math.random() - 0.5) * 0.7, 0.2 + Math.random() * 0.8, -1.6 - Math.random() * 1.2); a.needsUpdate = true; m.sp.material.color.setHex([0xffffff, 0x66ccff, 0xff9a1f, 0xff2d95][k.dTier || 0]); m.sp.rotation.y = 0; }
    });
    boxes.forEach((m, i) => { m.visible = S.boxes[i].cd <= 0; m.rotation.y = time * 1.8; m.rotation.x = time * 1.1; m.position.y = 1.9 + Math.sin(time * 2.4 + i) * 0.25; });
    // Hindernisse und Raketen aus Pools
    hazM.forEach(m => m.visible = false); S.hazards.forEach(h => { const m = poolGet(hazM, () => { const g = new T.Mesh(mineGeo, lam('#a020f0', { emissive: 0x4a0a6a })); return g; }); m.position.set(h.x, 1.1, h.z); m.rotation.y = time * 2; m.scale.setScalar(1 + Math.sin(time * 8) * 0.08); });
    rocM.forEach(m => m.visible = false); S.rockets.forEach(r => { const m = poolGet(rocM, () => new T.Mesh(rocketGeo, bas(0xff4a2a))); m.position.set(r.x, 1.2, r.z); m.rotation.set(0, r.th, 0); });
    S.events.forEach(e => { if (e.t === 'boom') { const m = poolGet(booms, () => new T.Mesh(shared.sphere, bas(0xffaa33, { transparent: true, opacity: 0.8, blending: T.AdditiveBlending }))); m.position.set(e.x, 1.3, e.z); m.userData.t = 0; } });
    booms.forEach(m => { if (!m.visible) return; m.userData.t += dt; const u = m.userData.t / 0.5; m.scale.setScalar(1 + u * 5); m.material.opacity = Math.max(0, 0.8 - u); if (u >= 1) m.visible = false; });
    world && world.children.forEach(o => { if (o.userData && o.userData.blink) o.visible = ((time * 1.5) | 0) % 2 === 0; });
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
    cams.forEach((c, i) => { updateCam(c, S, dt); const r = rs[i]; renderer.setViewport(r[0], r[1], r[2], r[3]); renderer.setScissor(r[0], r[1], r[2], r[3]); c.cam.aspect = r[2] / r[3]; c.cam.updateProjectionMatrix(); sky.position.copy(c.cam.position); renderer.render(scene, c.cam); });
    return rs;
  }
  // Menü/Lobby: Kamera fliegt langsam über die Strecke
  const mcam = () => menuCam.cam || (menuCam.cam = new T.PerspectiveCamera(60, 1, 0.5, 1400));
  function renderMenu(dt, time) {
    if (!tr) return; menuCam.f = (menuCam.f + dt * 9 / 3) % tr.N; const o = {}; tr.at(menuCam.f, 0, o); const c = mcam(), o2 = {}; tr.at(menuCam.f + 14, 0, o2);
    c.position.set(o.x - o.tx * 20, 22, o.z - o.tz * 20); c.lookAt(o2.x, 2, o2.z); c.aspect = W / H; c.updateProjectionMatrix(); sky.position.copy(c.position);
    kmesh.forEach(m => scene.remove(m.g)); kmesh = []; boxes.forEach(b => scene.remove(b)); boxes = [];
    renderer.setViewport(0, 0, W, H); renderer.setScissor(0, 0, W, H); renderer.render(scene, c);
  }
  return { gallery, peek, init, setTrack, setupRace, renderRace, renderMenu, resize, rects, KCOL, get cams() { return cams; }, get ready() { return !!renderer; } };
})();
