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
  function makeKart(k) {
    const g = new T.Group(), col = KCOL[k.k % 8];
    const box = (w, h, d, m, x, y, z) => { const b = new T.Mesh(new T.BoxGeometry(w, h, d), m); b.position.set(x, y, z); g.add(b); return b; };
    const body = new T.Group(); g.add(body);
    const add = (w, h, d, m, x, y, z) => { const b = new T.Mesh(new T.BoxGeometry(w, h, d), m); b.position.set(x, y, z); body.add(b); return b; };
    add(1.7, 0.45, 3.0, lam(col), 0, 0.55, 0); add(1.2, 0.35, 1.3, lam(col), 0, 0.5, 1.9); add(2.0, 0.18, 0.7, lam('#1a1d33'), 0, 0.4, 2.35); add(1.5, 0.3, 0.4, lam('#222640'), 0, 1.15, -1.55);
    add(0.7, 0.8, 0.5, lam('#f4f6fb'), 0, 1.15, -0.2); const head = new T.Mesh(new T.SphereGeometry(0.36, 10, 8), lam('#e8b88a')); head.position.set(0, 1.85, -0.2); body.add(head); const helm = new T.Mesh(new T.SphereGeometry(0.4, 10, 8, 0, PI2, 0, Math.PI * 0.55), lam(col)); helm.position.set(0, 1.9, -0.2); body.add(helm);
    const sign = new T.Mesh(new T.PlaneGeometry(1.1, 1.1), logoMat(k.logo)); sign.position.set(0, 0.95, -1.56); sign.rotation.y = Math.PI; body.add(sign);
    [-1, 1].forEach(s => { const sd = new T.Mesh(new T.PlaneGeometry(0.9, 0.9), logoMat(k.logo)); sd.position.set(s * 0.88, 0.62, 0.2); sd.rotation.y = s * Math.PI / 2; body.add(sd); });
    const wheels = []; [[-1, 1.15], [1, 1.15], [-1, -1.1], [1, -1.1]].forEach((p, i) => { const w = new T.Mesh(shared.wheelGeo, lam('#15151c')); const wg = new T.Group(); wg.position.set(p[0] * 1.0, 0.5, p[1]); wg.add(w); g.add(wg); wheels.push({ wg, w, front: i < 2 }); });
    const flame = new T.Mesh(new T.ConeGeometry(0.4, 1.8, 8), bas(0x66ccff, { transparent: true, opacity: 0.85, blending: T.AdditiveBlending })); flame.rotation.x = -Math.PI / 2; flame.position.set(0, 0.6, -2.6); flame.visible = false; g.add(flame);
    const shield = new T.Mesh(shared.sphere, bas(0x66e0ff, { transparent: true, opacity: 0.28, blending: T.AdditiveBlending, depthWrite: false })); shield.scale.set(2.5, 2, 3); shield.position.y = 1.1; shield.visible = false; g.add(shield);
    const sp = new T.Points(new T.BufferGeometry().setAttribute('position', new T.BufferAttribute(new Float32Array(30), 3)), new T.PointsMaterial({ size: 0.45, color: 0xffd24a, transparent: true, depthWrite: false })); sp.frustumCulled = false; sp.visible = false; g.add(sp);
    const blob = new T.Mesh(new T.CircleGeometry(1.5, 14), bas(0x000000, { transparent: true, opacity: 0.35 })); blob.rotation.x = -Math.PI / 2; blob.position.y = 0.05; g.add(blob);
    scene.add(g); return { g, body, wheels, flame, shield, sp, k };
  }
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
    const dist = 6.3 + clamp(k.vf / 36, 0, 1.4) * 0.8, wx = k.x - Math.sin(c.ang) * dist, wz = k.z - Math.cos(c.ang) * dist, kk = 1 - Math.exp(-dt * 10);
    c.pos.x += (wx - c.pos.x) * kk; c.pos.z += (wz - c.pos.z) * kk; c.pos.y = 2.9; c.cam.position.copy(c.pos);
    const tf = 64 + clamp(k.vf / 36, 0, 1.5) * 8 + (k.boostT > 0 ? 9 : 0); c.fov += (tf - c.fov) * Math.min(1, dt * 4); c.cam.fov = c.fov;
    c.cam.lookAt(k.x + Math.sin(c.ang) * 5, 1.4, k.z + Math.cos(c.ang) * 5);
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
  return { init, setTrack, setupRace, renderRace, renderMenu, resize, rects, KCOL, get cams() { return cams; }, get ready() { return !!renderer; } };
})();
