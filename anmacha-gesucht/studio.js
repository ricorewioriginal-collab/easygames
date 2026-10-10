/* 3D-Rate-Studio „Gesucht & Gefunden“: Bühne mit Vorhang & Geheimnis-Karte, LED-Wand, Werbeträger mit Sender-Logos, Scheinwerfer, Publikum, Avatare. */
const Studio = (() => {
  const T = THREE;
  let renderer, scene, camera, W = 1, H = 1, availTop = 0, availBot = 0, portrait = false, t = 0;
  const logoTex = {}; let logoList = [];
  const matCache = {};
  const mat = (c, o) => { const k = c + (o ? JSON.stringify(o) : ''); return matCache[k] || (matCache[k] = new T.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.65, metalness: 0.05, flatShading: true }, o || {}))); };
  const basic = c => new T.MeshBasicMaterial({ color: c });
  const SKINS = ['#f2c9a0', '#e0a878', '#c68a5c', '#8d5a3b', '#f6d8bd', '#a9744f'], HAIRS = ['#2b1b10', '#4a2e1a', '#c9a14a', '#111111', '#7a3b1e', '#8a8a8a'], SHIRTS = ['#f4f6fb', '#1b2038', '#e8e8ee', '#2a2f4a'], PANTS = ['#1a1e33', '#262b45', '#2f3550'];
  const rnd = a => a[Math.floor(Math.random() * a.length)];
  const SLOT = ['#00E5FF', '#FF2D95', '#FFD24A', '#7CFF6A'];
  const mood = { name: 'idle', want: new T.Color(0x3a7bff), a: new T.Color(0x3a7bff), b: new T.Color(0xff2d95) };
  const PAL = { idle: [0x3a7bff, 0xff2d95], tension: [0x1c3cff, 0x6a1cff], good: [0x00ff88, 0xffd24a], bad: [0xff2a3a, 0xff6a3a], win: null, menu: [0x00e5ff, 0xff2d95] };
  let spots = [], floorRing, ledCv, ledTex, ledCtx, ledT = 0, ledMsg = null, ledMsgT = 0, followSpot, aud = null, audN = 0, audBody, audHead, audBase = [];
  let podiums = [], avatars = [], host = null, cast = [], activeI = -1, flash = 0;
  let stageX = 1.7, mys = null, curOpen = 0, curWant = 0, conf = null, camPos = new T.Vector3(0, 2.4, 11), camLook = new T.Vector3(0, 1.5, 0), wantPos = new T.Vector3(), wantLook = new T.Vector3(), shotName = 'players', shotI = 0;
  const HOSTX = -3.7;

  function texFromImg(im) { const x = new T.Texture(im); x.encoding = T.sRGBEncoding; x.anisotropy = 4; x.needsUpdate = true; return x; }
  function fallbackTex(txt, col) { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); g.fillStyle = '#0b1020'; g.fillRect(0, 0, 128, 128); g.fillStyle = col || '#fff'; g.font = '900 64px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 64, 68); const x = new T.CanvasTexture(c); x.encoding = T.sRGBEncoding; return x; }
  const texFor = i => logoTex[i] || (logoTex[i] = fallbackTex(String(i + 1), '#00e5ff'));

  function init(canvas, logos) {
    renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75)); renderer.outputEncoding = T.sRGBEncoding; renderer.setClearColor(0x05060f, 1);
    scene = new T.Scene(); scene.fog = new T.Fog(0x05060f, 16, 46);
    camera = new T.PerspectiveCamera(42, 1, 0.1, 80);
    logoList = logos || []; logoList.forEach(l => logoTex[l.idx] = texFromImg(l.im));
    scene.add(new T.AmbientLight(0xffffff, 0.62));
    const key = new T.DirectionalLight(0xffffff, 0.75); key.position.set(2, 8, 9); scene.add(key);
    const pl = new T.PointLight(0xff2d95, 0.9, 16); pl.position.set(-6, 3, 3); scene.add(pl); const pr = new T.PointLight(0x00e5ff, 0.9, 16); pr.position.set(6, 3, 3); scene.add(pr);
    buildStage(); buildTruss(); buildTotems(); buildAudience(); buildConfetti(); buildMystery();
    host = makeAvatar({ host: true, logo: 6, skin: '#e8b88a', hair: '#2b1b10', shirt: '#14182e', pants: '#10142a' }); host.g.position.set(HOSTX, 0, 0.4); host.g.rotation.y = 0.35; scene.add(host.g);
    const desk = new T.Mesh(new T.BoxGeometry(1.2, 0.95, 0.7), mat('#161b36')); desk.position.set(HOSTX, 0.475, 0.95); desk.rotation.y = 0.35; scene.add(desk);
    const dl = new T.Mesh(new T.PlaneGeometry(0.8, 0.8), new T.MeshBasicMaterial({ map: texFor(0) })); dl.position.set(HOSTX + 0.12, 0.5, 1.31); dl.rotation.y = 0.35; scene.add(dl);
    return { w: 0 };
  }

  function buildStage() {
    const floor = new T.Mesh(new T.CircleGeometry(9, 56), new T.MeshStandardMaterial({ color: 0x0a1030, roughness: 0.28, metalness: 0.55 })); floor.rotation.x = -Math.PI / 2; scene.add(floor);
    const under = new T.Mesh(new T.PlaneGeometry(120, 120), basic(0x03040a)); under.rotation.x = -Math.PI / 2; under.position.y = -0.05; scene.add(under);
    floorRing = new T.Mesh(new T.RingGeometry(6.0, 6.18, 72), new T.MeshBasicMaterial({ color: 0x00e5ff, side: T.DoubleSide })); floorRing.rotation.x = -Math.PI / 2; floorRing.position.y = 0.01; scene.add(floorRing);
    const r2 = new T.Mesh(new T.RingGeometry(3.2, 3.26, 64), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.18, side: T.DoubleSide })); r2.rotation.x = -Math.PI / 2; r2.position.y = 0.012; scene.add(r2);
    // LED-Wand
    ledCv = document.createElement('canvas'); ledCv.width = 1024; ledCv.height = 400; ledCtx = ledCv.getContext('2d'); ledTex = new T.CanvasTexture(ledCv); ledTex.encoding = T.sRGBEncoding;
    const wall = new T.Mesh(new T.PlaneGeometry(17, 6.6), new T.MeshBasicMaterial({ map: ledTex })); wall.position.set(0, 3.7, -6.5); scene.add(wall);
    const frame = new T.Mesh(new T.BoxGeometry(17.5, 7.1, 0.2), new T.MeshBasicMaterial({ color: 0x1a2a6a })); frame.position.set(0, 3.7, -6.65); scene.add(frame);
    [-1, 1].forEach(s => { const sw = new T.Mesh(new T.PlaneGeometry(4.2, 5.2), new T.MeshBasicMaterial({ map: ledTex })); sw.position.set(s * 10.2, 3.2, -4.6); sw.rotation.y = -s * 0.55; scene.add(sw); });
    drawLed(0);
  }
  function buildTruss() {
    const m = mat('#1a1d2e', { metalness: 0.7, roughness: 0.4 });
    [[18, 0.2, 0.2, 0, 7.4, -5], [18, 0.2, 0.2, 0, 7.4, 4], [0.2, 0.2, 9, -9, 7.4, -0.5], [0.2, 0.2, 9, 9, 7.4, -0.5]].forEach(b => { const x = new T.Mesh(new T.BoxGeometry(b[0], b[1], b[2]), m); x.position.set(b[3], b[4], b[5]); scene.add(x); });
    const coneGeo = new T.CylinderGeometry(0.06, 1.1, 7, 12, 1, true); coneGeo.translate(0, -3.5, 0);
    for (let i = 0; i < 10; i++) {
      const g = new T.Group(); const x = -8 + i * (16 / 9), z = i % 2 ? -5 : 4;
      g.position.set(x, 7.3, z);
      const head = new T.Mesh(new T.BoxGeometry(0.3, 0.3, 0.4), mat('#222')); g.add(head);
      const cone = new T.Mesh(coneGeo, new T.MeshBasicMaterial({ color: 0x3a7bff, transparent: true, opacity: 0.1, depthWrite: false, side: T.DoubleSide, blending: T.AdditiveBlending })); g.add(cone);
      scene.add(g); spots.push({ g, cone, i, x, z });
    }
    followSpot = new T.Mesh(coneGeo, new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.16, depthWrite: false, side: T.DoubleSide, blending: T.AdditiveBlending })); followSpot.position.set(0, 7.3, 2); followSpot.visible = false; scene.add(followSpot);
  }
  function buildTotems() {
    const body = mat('#101530'), edge = new T.MeshBasicMaterial({ color: 0x3a7bff });
    const n = 13;
    for (let k = 0; k < n; k++) {
      const left = k < 7, j = left ? k : k - 7, cnt = left ? 7 : 6;
      const x = (left ? -1 : 1) * (8.2 + j * 0.42), z = 3.6 - j * (8.2 / (cnt - 1)), g = new T.Group();
      const slab = new T.Mesh(new T.BoxGeometry(1.5, 2.3, 0.14), body); slab.position.y = 1.4; g.add(slab);
      const rim = new T.Mesh(new T.BoxGeometry(1.58, 2.38, 0.06), edge); rim.position.set(0, 1.4, -0.07); g.add(rim);
      const logo = new T.Mesh(new T.PlaneGeometry(1.34, 1.34), new T.MeshBasicMaterial({ map: texFor(k) })); logo.position.set(0, 1.72, 0.08); g.add(logo);
      const strip = new T.Mesh(new T.PlaneGeometry(1.34, 0.18), new T.MeshBasicMaterial({ color: new T.Color().setHSL(k / n, 0.9, 0.55) })); strip.position.set(0, 0.62, 0.08); g.add(strip);
      const foot = new T.Mesh(new T.BoxGeometry(0.9, 0.12, 0.5), body); foot.position.y = 0.06; g.add(foot);
      g.position.set(x, 0, z); g.rotation.y = left ? 1.05 : -1.05; scene.add(g);
    }
  }
  function buildAudience() {
    const rows = 3, per = 9, cnt = rows * per * 2; audN = cnt;
    audBody = new T.InstancedMesh(new T.BoxGeometry(0.5, 0.66, 0.38), new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8, flatShading: true }), cnt);
    audHead = new T.InstancedMesh(new T.SphereGeometry(0.17, 8, 6), new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8, flatShading: true }), cnt);
    audBody.instanceColor = new T.InstancedBufferAttribute(new Float32Array(cnt * 3), 3); audHead.instanceColor = new T.InstancedBufferAttribute(new Float32Array(cnt * 3), 3);
    const c = new T.Color(); let n = 0;
    for (let side = -1; side <= 1; side += 2) for (let r = 0; r < rows; r++) for (let p = 0; p < per; p++) {
      const x = side * (7.2 + r * 0.9 + (p % 2) * 0.15), z = 8.6 - p * 0.95 + r * 0.25, y = r * 0.55;
      audBase.push({ x, y, z, ph: Math.random() * 6, ry: side > 0 ? -0.9 : 0.9 });
      c.set(rnd(['#3a4a8a', '#8a3a6a', '#2f6a6a', '#6a5a2f', '#555a78', '#7a3a3a', '#3a3a5a'])); audBody.setColorAt(n, c); c.set(rnd(SKINS)); audHead.setColorAt(n, c); n++;
    }
    audBody.frustumCulled = audHead.frustumCulled = false; scene.add(audBody); scene.add(audHead); updateAudience(0, 0.02);
  }
  const dm = new T.Matrix4(), dq = new T.Quaternion(), dv = new T.Vector3(), ds = new T.Vector3(1, 1, 1), de = new T.Euler();
  function updateAudience(time, amp) {
    for (let i = 0; i < audN; i++) {
      const b = audBase[i], by = b.y + Math.max(0, Math.sin(time * (amp > 0.06 ? 7 : 1.4) + b.ph)) * amp;
      dq.setFromEuler(de.set(0, b.ry, 0)); dv.set(b.x, by + 0.4, b.z); dm.compose(dv, dq, ds); audBody.setMatrixAt(i, dm);
      dv.set(b.x, by + 0.98, b.z); dm.compose(dv, dq, ds); audHead.setMatrixAt(i, dm);
    }
    audBody.instanceMatrix.needsUpdate = audHead.instanceMatrix.needsUpdate = true; audBody.instanceColor.needsUpdate = audHead.instanceColor.needsUpdate = true;
  }
  const CN = 360, cPos = new Float32Array(CN * 3).fill(-50), cCol = new Float32Array(CN * 3), cVel = new Float32Array(CN * 3);
  function buildConfetti() {
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(cPos, 3)); g.setAttribute('color', new T.BufferAttribute(cCol, 3));
    conf = new T.Points(g, new T.PointsMaterial({ size: 0.16, vertexColors: true, transparent: true, depthWrite: false })); conf.frustumCulled = false; scene.add(conf);
  }
  let cHead = 0;
  function confetti(n) {
    const c = new T.Color();
    for (let i = 0; i < n; i++) {
      const k = (cHead++ % CN) * 3; cPos[k] = (Math.random() - 0.5) * 12; cPos[k + 1] = 6.5 + Math.random() * 1.5; cPos[k + 2] = (Math.random() - 0.5) * 8 + 1;
      cVel[k] = (Math.random() - 0.5) * 1.5; cVel[k + 1] = -1.2 - Math.random() * 1.5; cVel[k + 2] = (Math.random() - 0.5) * 1.5;
      c.setHSL(Math.random(), 0.95, 0.6); cCol[k] = c.r; cCol[k + 1] = c.g; cCol[k + 2] = c.b;
    }
    conf.geometry.attributes.color.needsUpdate = true;
  }
  function stepConfetti(dt) {
    let any = false;
    for (let i = 0; i < CN; i++) {
      const k = i * 3; if (cPos[k + 1] < -40) continue; any = true;
      cPos[k] += (cVel[k] + Math.sin(t * 4 + i) * 0.6) * dt; cPos[k + 1] += cVel[k + 1] * dt; cPos[k + 2] += cVel[k + 2] * dt; if (cPos[k + 1] < 0.02) cPos[k + 1] = -50;
    }
    if (any) conf.geometry.attributes.position.needsUpdate = true;
  }


  // ------------------------------------------------------------------ Geheimnis-Karte hinter dem Vorhang
  function buildMystery() {
    const g = new T.Group(); g.position.set(stageX, 0, -2.7);
    const ped = new T.Mesh(new T.CylinderGeometry(1.5, 1.7, 0.4, 28), mat('#141a3a', { metalness: 0.5 })); ped.position.y = 0.2; g.add(ped);
    const ring = new T.Mesh(new T.TorusGeometry(1.52, 0.04, 6, 40), new T.MeshBasicMaterial({ color: 0xffd24a })); ring.rotation.x = Math.PI / 2; ring.position.y = 0.41; g.add(ring);
    const c = document.createElement('canvas'); c.width = 256; c.height = 320; const x = new T.CanvasTexture(c); x.encoding = T.sRGBEncoding;
    const card = new T.Mesh(new T.PlaneGeometry(2.0, 2.5), new T.MeshBasicMaterial({ map: x })); card.position.y = 1.85; g.add(card);
    const frm = new T.Mesh(new T.PlaneGeometry(2.14, 2.64), new T.MeshBasicMaterial({ color: 0xffd24a })); frm.position.set(0, 1.85, -0.01); g.add(frm);
    const mk = s => { const m = new T.Mesh(new T.BoxGeometry(1.2, 3.7, 0.14), new T.MeshStandardMaterial({ color: 0x9a0f33, roughness: 0.85, flatShading: true })); m.position.set(s * 0.62, 2.1, 0.55); g.add(m); return m; };
    const L = mk(-1), R = mk(1);
    const val = new T.Mesh(new T.BoxGeometry(3.4, 0.5, 0.22), new T.MeshStandardMaterial({ color: 0x7a0a28, roughness: 0.8 })); val.position.set(0, 4.05, 0.55); g.add(val);
    const gold = new T.Mesh(new T.BoxGeometry(3.5, 0.07, 0.24), new T.MeshBasicMaterial({ color: 0xffd24a })); gold.position.set(0, 3.8, 0.55); g.add(gold);
    scene.add(g); mys = { g, c, x, L, R }; mysteryDraw('', null);
  }
  function mysteryDraw(icon, name) {
    const g = mys.c.getContext('2d'), w = 256, h = 320; g.clearRect(0, 0, w, h);
    const gr = g.createLinearGradient(0, 0, 0, h); if (name == null) { gr.addColorStop(0, '#1a1050'); gr.addColorStop(1, '#05061a'); } else { gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#bcd4ff'); }
    g.fillStyle = gr; g.fillRect(0, 0, w, h); g.textAlign = 'center'; g.textBaseline = 'middle';
    if (name == null) {
      g.font = '900 190px Arial'; g.fillStyle = '#ffd24a'; g.shadowColor = '#ff9a1f'; g.shadowBlur = 30; g.fillText('?', w / 2, 150); g.shadowBlur = 0;
      g.font = '900 28px Arial'; g.fillStyle = '#00E5FF'; g.fillText(icon ? icon + '  GESUCHT' : 'GESUCHT', w / 2, 285);
    } else {
      g.font = '120px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",Arial'; g.fillStyle = '#000'; g.fillText(icon || '★', w / 2, 100);
      let fs = 46; g.font = `900 ${fs}px Arial`; while (g.measureText(name).width > w - 24 && fs > 16) { fs -= 2; g.font = `900 ${fs}px Arial`; }
      g.fillStyle = '#10143a'; g.fillText(name, w / 2, 235); g.fillStyle = '#e0197d'; g.fillRect(30, 276, w - 60, 8);
    }
    mys.x.needsUpdate = true;
  }
  const mystery = (icon, name) => mysteryDraw(icon, name);
  const curtain = open => { curWant = open ? 1 : 0; };

  // ------------------------------------------------------------------ Avatare
  function makeAvatar(o) {
    const g = new T.Group(), skin = mat(o.skin || rnd(SKINS)), shirtC = o.shirt || rnd(SHIRTS), shirt = mat(shirtC), pants = mat(o.pants || rnd(PANTS)), hair = mat(o.hair || rnd(HAIRS));
    const box = (w, h, d, m, x, y, z) => { const b = new T.Mesh(new T.BoxGeometry(w, h, d), m); b.position.set(x, y, z); g.add(b); return b; };
    box(0.17, 0.82, 0.2, pants, -0.11, 0.41, 0); box(0.17, 0.82, 0.2, pants, 0.11, 0.41, 0);
    box(0.19, 0.08, 0.3, mat('#111'), -0.11, 0.04, 0.05); box(0.19, 0.08, 0.3, mat('#111'), 0.11, 0.04, 0.05);
    const body = new T.Group(); body.position.y = 0; g.add(body);
    const torso = new T.Mesh(new T.BoxGeometry(0.52, 0.64, 0.28), shirt); torso.position.y = 1.12; body.add(torso);
    if (o.host) { const jacket = new T.Mesh(new T.BoxGeometry(0.55, 0.66, 0.3), mat('#161a34')); jacket.position.y = 1.12; body.add(jacket); const tie = new T.Mesh(new T.BoxGeometry(0.1, 0.1, 0.02), mat('#ff2d95')); tie.position.set(0, 1.38, 0.16); body.add(tie); }
    const lw = o.host ? 0.17 : 0.36, lp = new T.Mesh(new T.PlaneGeometry(lw, lw), new T.MeshBasicMaterial({ map: texFor(o.logo == null ? 0 : o.logo) })); lp.position.set(o.host ? 0.14 : 0, o.host ? 1.22 : 1.14, 0.161); body.add(lp);
    const neck = new T.Mesh(new T.CylinderGeometry(0.06, 0.07, 0.1, 8), skin); neck.position.y = 1.47; body.add(neck);
    const head = new T.Group(); head.position.y = 1.64; body.add(head);
    const skull = new T.Mesh(new T.SphereGeometry(0.19, 12, 10), skin); head.add(skull);
    const cap = new T.Mesh(new T.SphereGeometry(0.2, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), hair); cap.position.set(0, 0.015, -0.01); cap.rotation.x = -0.25; head.add(cap);
    if (Math.random() < 0.4 && !o.host) { const back = new T.Mesh(new T.BoxGeometry(0.36, 0.3, 0.12), hair); back.position.set(0, -0.08, -0.14); head.add(back); }
    [-0.07, 0.07].forEach(x => { const e = new T.Mesh(new T.SphereGeometry(0.02, 6, 5), basic(0x111111)); e.position.set(x, 0.025, 0.178); head.add(e); });
    const mouth = new T.Mesh(new T.BoxGeometry(0.07, 0.018, 0.02), basic(0x7a2a2a)); mouth.position.set(0, -0.07, 0.185); head.add(mouth);
    const mkArm = x => { const a = new T.Group(); a.position.set(x, 1.38, 0); const u = new T.Mesh(new T.BoxGeometry(0.11, 0.56, 0.11), o.host ? mat('#161a34') : shirt); u.position.y = -0.28; a.add(u); const h = new T.Mesh(new T.SphereGeometry(0.06, 8, 6), skin); h.position.y = -0.6; a.add(h); body.add(a); return a; };
    const armL = mkArm(0.34), armR = mkArm(-0.34);
    if (o.host) { const mic = new T.Mesh(new T.CylinderGeometry(0.025, 0.03, 0.18, 8), mat('#333')); mic.position.y = -0.62; mic.rotation.x = 0.3; armR.add(mic); const ball = new T.Mesh(new T.SphereGeometry(0.045, 8, 6), mat('#999')); ball.position.set(0, -0.72, 0.03); armR.add(ball); }
    const a = { g, body, head, mouth, armL, armR, pose: 'idle', ph: Math.random() * 6, s: { lx: 0, lz: 0.1, rx: 0, rz: -0.1, hx: 0, hz: 0, by: 0 }, talk: 0 };
    return a;
  }
  function upAvatar(a, dt) {
    const T0 = { lx: 0, lz: 0.1, rx: 0, rz: -0.1, hx: 0, hz: 0, by: 0 }, p = a.pose, ph = a.ph;
    switch (p) {
      case 'idle': T0.lx = Math.sin(t * 1.3 + ph) * 0.06; T0.rx = Math.sin(t * 1.1 + ph) * 0.06; T0.hz = Math.sin(t * 0.8 + ph) * 0.04; T0.by = Math.sin(t * 1.5 + ph) * 0.008; break;
      case 'think': T0.rx = -2.05; T0.rz = -0.15; T0.hx = 0.12; T0.hz = 0.1 + Math.sin(t * 1.2) * 0.03; T0.lz = 0.12; break;
      case 'lock': T0.lx = -1.2; T0.rx = -1.2; T0.lz = 0.45; T0.rz = -0.45; T0.hx = 0.1; break;
      case 'cheer': T0.lz = 2.7 + Math.sin(t * 9) * 0.3; T0.rz = -2.7 - Math.sin(t * 9 + 1) * 0.3; T0.by = Math.abs(Math.sin(t * 6 + ph)) * 0.2; T0.hx = -0.15; break;
      case 'sad': T0.hx = 0.5; T0.lz = 0.04; T0.rz = -0.04; T0.lx = 0.1; T0.rx = 0.1; T0.by = -0.05; break;
      case 'talk': T0.rx = -0.85 + Math.sin(t * 3.1) * 0.3; T0.rz = -0.45; T0.lx = Math.sin(t * 2.3) * 0.25; T0.lz = 0.3 + Math.sin(t * 1.7) * 0.15; T0.hz = Math.sin(t * 1.3) * 0.06; break;
      case 'wave': T0.lz = 2.4 + Math.sin(t * 8) * 0.35; T0.lx = 0; break;
    }
    const k = 1 - Math.exp(-dt * 9), s = a.s;
    for (const key in T0) s[key] += (T0[key] - s[key]) * k;
    a.armL.rotation.set(s.lx, 0, s.lz); a.armR.rotation.set(s.rx, 0, s.rz); a.head.rotation.set(s.hx, 0, s.hz); a.body.position.y = s.by;
    const m = a.talk > 0 ? 0.6 + Math.abs(Math.sin(t * 14 + ph)) * 1.8 : 1; a.mouth.scale.set(1, m, 1); if (a.talk > 0) a.talk -= dt;
  }

  // ------------------------------------------------------------------ Besetzung / Podeste
  const podTex = i => { const c = document.createElement('canvas'); c.width = 256; c.height = 128; const x = new T.CanvasTexture(c); x.encoding = T.sRGBEncoding; return { c, x }; };
  function drawPod(p, l1, l2, active) {
    const g = p.c.getContext('2d'), col = SLOT[p.slot % 4]; g.fillStyle = active ? '#14224a' : '#0a1030'; g.fillRect(0, 0, 256, 128);
    g.fillStyle = col; g.fillRect(0, 0, 256, 8); g.fillRect(0, 120, 256, 8);
    g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '800 36px Arial'; let s = l1 || ''; if (s.length > 12) s = s.slice(0, 11) + '…'; g.fillText(s, 128, 50);
    g.fillStyle = col; g.font = '900 34px Arial'; g.fillText(l2 || '', 128, 94); p.x.needsUpdate = true;
  }
  function setCast(ents) {
    podiums.forEach(p => scene.remove(p.g)); avatars.forEach(a => scene.remove(a.g)); podiums = []; avatars = []; cast = ents.slice(0, 4);
    const n = cast.length, sp = 2.5, cx = 1.7; stageX = cx; if (mys) mys.g.position.x = cx;
    cast.forEach((e, i) => {
      const x = cx + (i - (n - 1) / 2) * sp, av = makeAvatar({ logo: e.logo, host: !!e.host, shirt: e.host ? '#14182e' : undefined }); av.g.position.set(x, 0, 0.1); scene.add(av.g); av.x = x; avatars.push(av);
      const g = new T.Group(); const pb = new T.Mesh(new T.BoxGeometry(1.15, 0.92, 0.8), mat('#121838')); pb.position.y = 0.46; g.add(pb);
      const glow = new T.Mesh(new T.BoxGeometry(1.2, 0.05, 0.84), new T.MeshBasicMaterial({ color: new T.Color(SLOT[i % 4]) })); glow.position.y = 0.93; g.add(glow);
      const pt = podTex(i); const scr = new T.Mesh(new T.PlaneGeometry(1.0, 0.5), new T.MeshBasicMaterial({ map: pt.x })); scr.position.set(0, 0.5, 0.405); g.add(scr);
      g.position.set(x, 0, 0.75); scene.add(g); const p = { g, c: pt.c, x: pt.x, slot: i, glow }; podiums.push(p); drawPod(p, e.name, '', false);
    });
    activeI = -1;
  }
  function podium(i, l1, l2, active) { if (podiums[i]) drawPod(podiums[i], l1, l2, active); }
  function setActive(i) {
    activeI = i; avatars.forEach((a, k) => { if (a.pose === 'think' && k !== i) a.pose = 'idle'; });
    if (i >= 0 && avatars[i]) { followSpot.visible = true; followSpot.position.set(avatars[i].x, 7.3, 2.2); followSpot.lookAt(avatars[i].x, 1.2, 0.1); followSpot.rotateX(Math.PI / 2); followSpot.material.color.set(SLOT[i % 4]); } else followSpot.visible = false;
  }
  const pose = (i, p) => { if (avatars[i]) avatars[i].pose = p; };
  const hostPose = (p, talkSec) => { host.pose = p; if (talkSec) host.talk = talkSec; };
  const hostTalk = s => { host.talk = Math.max(host.talk, s); if (host.pose === 'idle') host.pose = 'talk'; };
  function allPose(p, except) { avatars.forEach((a, k) => { if (k !== except) a.pose = p; }); }

  // ------------------------------------------------------------------ Stimmung / Kamera
  function setMood(m) {
    mood.name = m; const pal = PAL[m]; if (pal) { mood.a.setHex(pal[0]); mood.b.setHex(pal[1]); }
    if (m === 'good') { flash = 1; confetti(70); } if (m === 'win') { confetti(300); }
  }
  function ledMessage(text, col, sec) { ledMsg = { text, col: col || '#fff' }; ledMsgT = sec || 2.5; }
  function drawLed(time) {
    const g = ledCtx, w = 1024, h = 400; const hue = mood.name === 'good' ? 140 : mood.name === 'bad' ? 355 : mood.name === 'win' ? (time * 90) % 360 : mood.name === 'tension' ? 245 : 215;
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, `hsl(${hue},80%,14%)`); gr.addColorStop(1, `hsl(${(hue + 60) % 360},80%,22%)`); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 9; i++) { const x = ((i * 130 + time * 70) % (w + 260)) - 130; g.fillStyle = `hsla(${(hue + i * 25) % 360},90%,60%,.10)`; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 90, 0); g.lineTo(x + 20, h); g.lineTo(x - 70, h); g.fill(); }
    g.textAlign = 'center'; g.textBaseline = 'middle';
    if (ledMsg && ledMsgT > 0) { g.font = '900 120px Arial'; g.lineWidth = 10; g.strokeStyle = '#000'; g.strokeText(ledMsg.text, w / 2, 170); g.fillStyle = ledMsg.col; g.fillText(ledMsg.text, w / 2, 170); }
    else { g.font = '900 54px Arial'; g.fillStyle = '#ffd24a'; g.fillText('AnMaCha', w / 2, 70); g.font = 'italic 900 84px Arial'; g.lineWidth = 8; g.strokeStyle = '#05061a'; g.strokeText('GESUCHT & GEFUNDEN', w / 2, 170); const tg = g.createLinearGradient(0, 100, 0, 220); tg.addColorStop(0, '#fff'); tg.addColorStop(1, '#ff9a8a'); g.fillStyle = tg; g.fillText('GESUCHT & GEFUNDEN', w / 2, 170); g.font = '900 44px Arial'; g.fillStyle = '#00E5FF'; g.fillText('DAS RATESTUDIO', w / 2, 250); }
    if (logoList.length) { const sz = 92, gap = 20, tot = (sz + gap) * logoList.length; let off = (time * 45) % tot; g.save(); g.globalAlpha = 0.95; for (let k = 0; k < logoList.length * 2; k++) { const x = k * (sz + gap) - off; if (x < -sz || x > w) continue; const l = logoList[k % logoList.length]; g.drawImage(l.im, x, 290, sz, sz); } g.restore(); }
    ledTex.needsUpdate = true;
  }
  function shot(name, i) { shotName = name; shotI = i || 0; }
  function computeShot() {
    const tv = Math.tan(camera.fov * Math.PI / 360), asp = camera.aspect, availH = Math.max(120, H - availTop - availBot), fitV = H / availH;
    const need = (spanX, spanY) => Math.max(spanX / (2 * tv * asp), spanY * fitV / (2 * tv));
    let cx = 0, ly = 1.45, d = 8, y = 1.9;
    if (shotName === 'host') { cx = HOSTX + 0.2; d = need(3.0, 2.6); y = 1.7; }
    else if (shotName === 'active' && avatars[shotI]) { cx = avatars[shotI].x * 0.8 + 0.3; d = need(5.6, 3.9); y = 2.1; ly = 1.7; }
    else if (shotName === 'mystery') { cx = stageX; d = need(4.6, 4.6); y = 2.4; ly = 2.0; }
    else if (shotName === 'all') { cx = -1; d = need(15, 7) + 2; y = 3.4; ly = 2.4; }
    else { const xs = avatars.map(a => a.x); const lo = xs.length ? Math.min(...xs) - 1.3 : -2, hi = xs.length ? Math.max(...xs) + 1.3 : 2; cx = (lo + hi) / 2; d = need(Math.max(6, hi - lo + 1.5), 3.9); y = 2.1; ly = 1.7; }
    const sway = Math.sin(t * 0.25) * 0.35;
    wantPos.set(cx + sway, y, d); wantLook.set(cx, ly, 0);
  }
  function resize(w, h, top, bot) {
    W = w; H = h; availTop = top || 0; availBot = bot || 0; renderer.setSize(w, h, false); camera.aspect = w / h; portrait = w < h;
    camera.setViewOffset(w, h, 0, (availBot - availTop) / 2, w, h); camera.updateProjectionMatrix();
  }
  function frame(dt) {
    t += dt; dt = Math.min(dt, 0.1);
    // Stimmung: Farben der Scheinwerfer
    const pal = PAL[mood.name]; if (mood.name === 'win') { mood.a.setHSL((t * 0.4) % 1, 0.9, 0.55); mood.b.setHSL((t * 0.4 + 0.5) % 1, 0.9, 0.55); }
    spots.forEach(s => {
      const sw = mood.name === 'tension' ? 0.15 : mood.name === 'idle' || mood.name === 'menu' ? 0.45 : 0.6, sp = mood.name === 'tension' ? 0.4 : 1;
      s.g.rotation.x = Math.sin(t * 0.7 * sp + s.i) * sw + (s.z > 0 ? -0.2 : 0.2) + (-0.0); s.g.rotation.z = Math.cos(t * 0.5 * sp + s.i * 1.3) * sw - s.x * 0.04;
      s.cone.material.color.copy(s.i % 2 ? mood.a : mood.b); s.cone.material.opacity = mood.name === 'tension' ? 0.06 : mood.name === 'good' || mood.name === 'win' ? 0.16 : 0.1;
    });
    floorRing.material.color.copy(mood.a);
    flash = Math.max(0, flash - dt * 1.5);
    ledT += dt; if (ledMsgT > 0) ledMsgT -= dt; if (ledT > 0.1) { ledT = 0; drawLed(t); }
    curOpen += (curWant - curOpen) * (1 - Math.exp(-dt * 2.4)); mys.L.position.x = -0.62 - curOpen * 1.45; mys.R.position.x = 0.62 + curOpen * 1.45; mys.L.scale.x = mys.R.scale.x = 1 - curOpen * 0.55;
    avatars.forEach(a => upAvatar(a, dt)); upAvatar(host, dt);
    if (((t * 15) | 0) !== (((t - dt) * 15) | 0)) updateAudience(t, mood.name === 'good' || mood.name === 'win' ? 0.2 : mood.name === 'tension' ? 0.005 : 0.03);
    stepConfetti(dt);
    computeShot(); const k = 1 - Math.exp(-dt * 2.6); camPos.lerp(wantPos, k); camLook.lerp(wantLook, k * 1.2);
    camera.position.copy(camPos); camera.lookAt(camLook);
    renderer.render(scene, camera);
  }
  return { mystery, curtain, init, setCast, podium, setActive, pose, hostPose, hostTalk, allPose, setMood, shot, resize, frame, confetti, ledMessage, texFor, get count() { return avatars.length; }, get ready() { return !!renderer; }, get avatars() { return avatars; }, get camera() { return camera; } };
})();
