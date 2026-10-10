/* 3D-Funkhaus-Studio für „AnMaCha Koffer DEALER“: Flightcases mit Sender-Logos, Dealer-Kanzel „ON AIR“, Scheinwerfer, Publikum, Avatare. */
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
  const mood = { name: 'idle', a: new T.Color(0x3a7bff), b: new T.Color(0xff2d95) };
  const PAL = { idle: [0x3a7bff, 0xff2d95], tension: [0x00c8a0, 0x6a1cff], good: [0x00ff88, 0xffd24a], bad: [0xff2a3a, 0xff6a3a], win: null, menu: [0x00e5ff, 0xff2d95], offer: [0xffb21f, 0x00ffc8] };
  let spots = [], floorRing, ledCv, ledTex, ledCtx, ledT = 0, ledMsg = null, ledMsgT = 0, followSpot, audN = 0, audBody, audHead, audBase = [];
  let podiums = [], avatars = [], host = null, dealer = null, cast = [], flash = 0, onAirMat, onAirTex, onAirOn = 0;
  let conf = null, camPos = new T.Vector3(0, 4.6, 12), camLook = new T.Vector3(0, 1.4, 0), wantPos = new T.Vector3(), wantLook = new T.Vector3(), shotName = 'wide', shotI = 0;
  const HOSTX = -6.2, DEALERZ = -4.4;
  let koffer = [], kGroup = null, pickables = [], hoverK = -1;

  const texFromImg = im => { const x = new T.Texture(im); x.encoding = T.sRGBEncoding; x.anisotropy = 4; x.needsUpdate = true; return x; };
  function fallbackTex(txt, col) { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); g.fillStyle = '#0b1020'; g.fillRect(0, 0, 128, 128); g.fillStyle = col || '#fff'; g.font = '900 64px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 64, 68); const x = new T.CanvasTexture(c); x.encoding = T.sRGBEncoding; return x; }
  const texFor = i => logoTex[i] || (logoTex[i] = fallbackTex(String(i + 1), '#00e5ff'));
  const canvasTex = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = new T.CanvasTexture(c); x.encoding = T.sRGBEncoding; return { c, x, g: c.getContext('2d') }; };

  function init(canvas, logos) {
    renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75)); renderer.outputEncoding = T.sRGBEncoding; renderer.setClearColor(0x05060f, 1);
    scene = new T.Scene(); scene.fog = new T.Fog(0x05060f, 18, 50);
    camera = new T.PerspectiveCamera(42, 1, 0.1, 90);
    logoList = logos || []; logoList.forEach(l => logoTex[l.idx] = texFromImg(l.im));
    scene.add(new T.AmbientLight(0xffffff, 0.66));
    const key = new T.DirectionalLight(0xffffff, 0.8); key.position.set(2, 9, 9); scene.add(key);
    const pl = new T.PointLight(0xff2d95, 0.9, 16); pl.position.set(-6, 3, 3); scene.add(pl); const pr = new T.PointLight(0x00e5ff, 0.9, 16); pr.position.set(6, 3, 3); scene.add(pr);
    buildStage(); buildTruss(); buildTotems(); buildAudience(); buildConfetti(); buildBooth();
    host = makeAvatar({ host: true, logo: 6, skin: '#e8b88a', hair: '#2b1b10', shirt: '#14182e', pants: '#10142a' }); host.g.position.set(HOSTX, 0, 1.4); host.g.rotation.y = 0.45; scene.add(host.g);
    return {};
  }

  function buildStage() {
    const floor = new T.Mesh(new T.CircleGeometry(10, 56), new T.MeshStandardMaterial({ color: 0x0a1230, roughness: 0.28, metalness: 0.55 })); floor.rotation.x = -Math.PI / 2; scene.add(floor);
    const under = new T.Mesh(new T.PlaneGeometry(120, 120), basic(0x03040a)); under.rotation.x = -Math.PI / 2; under.position.y = -0.05; scene.add(under);
    floorRing = new T.Mesh(new T.RingGeometry(6.4, 6.58, 72), new T.MeshBasicMaterial({ color: 0x00e5ff, side: T.DoubleSide })); floorRing.rotation.x = -Math.PI / 2; floorRing.position.y = 0.01; scene.add(floorRing);
    const r2 = new T.Mesh(new T.RingGeometry(3.8, 3.86, 64), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.16, side: T.DoubleSide })); r2.rotation.x = -Math.PI / 2; r2.position.y = 0.012; scene.add(r2);
    // Podest für die Koffer (leuchtende Bühne)
    const riser = new T.Mesh(new T.BoxGeometry(12.4, 0.12, 4.6), mat('#0c1234', { metalness: 0.6, roughness: 0.35 })); riser.position.set(0, 0.06, -1.5); scene.add(riser);
    const edge = new T.Mesh(new T.BoxGeometry(12.5, 0.05, 0.08), new T.MeshBasicMaterial({ color: 0x00ffc8 })); edge.position.set(0, 0.13, 0.82); scene.add(edge);
    ledCv = document.createElement('canvas'); ledCv.width = 1024; ledCv.height = 400; ledCtx = ledCv.getContext('2d'); ledTex = new T.CanvasTexture(ledCv); ledTex.encoding = T.sRGBEncoding;
    const wall = new T.Mesh(new T.PlaneGeometry(18, 7), new T.MeshBasicMaterial({ map: ledTex })); wall.position.set(0, 4, -7.2); scene.add(wall);
    const frame = new T.Mesh(new T.BoxGeometry(18.5, 7.5, 0.2), new T.MeshBasicMaterial({ color: 0x143a4a })); frame.position.set(0, 4, -7.35); scene.add(frame);
    [-1, 1].forEach(s => { const sw = new T.Mesh(new T.PlaneGeometry(4.2, 5.2), new T.MeshBasicMaterial({ map: ledTex })); sw.position.set(s * 10.6, 3.2, -4.6); sw.rotation.y = -s * 0.55; scene.add(sw); });
    drawLed(0);
  }
  function buildBooth() {   // Dealer-Kanzel mit „ON AIR“
    const g = new T.Group(), base = new T.Mesh(new T.BoxGeometry(3.2, 1.7, 1.5), mat('#0d1b2e', { metalness: 0.5, roughness: 0.4 })); base.position.y = 0.85; g.add(base);
    const rim = new T.Mesh(new T.BoxGeometry(3.3, 0.06, 1.6), new T.MeshBasicMaterial({ color: 0x00ffc8 })); rim.position.y = 1.72; g.add(rim);
    const neon = new T.Mesh(new T.BoxGeometry(3.0, 0.06, 0.04), new T.MeshBasicMaterial({ color: 0xff2d95 })); neon.position.set(0, 0.5, 0.77); g.add(neon);
    const desk = new T.Mesh(new T.BoxGeometry(2.0, 0.5, 0.55), mat('#111a2c')); desk.position.set(0, 1.97, 0.45); g.add(desk);
    const deskTop = new T.Mesh(new T.BoxGeometry(2.1, 0.05, 0.62), new T.MeshBasicMaterial({ color: 0x00e5ff })); deskTop.position.set(0, 2.24, 0.45); g.add(deskTop);
    const mic = new T.Mesh(new T.CylinderGeometry(0.04, 0.05, 0.4, 8), mat('#222')); mic.position.set(0.6, 2.46, 0.5); g.add(mic); const mh = new T.Mesh(new T.SphereGeometry(0.09, 10, 8), mat('#888')); mh.position.set(0.6, 2.7, 0.5); g.add(mh);
    const hs = new T.Mesh(new T.BoxGeometry(0.5, 0.1, 0.14), mat('#c0392b')); hs.position.set(-0.5, 2.3, 0.55); g.add(hs);
    onAirTex = canvasTex(256, 96); const og = onAirTex.g; og.fillStyle = '#300'; og.fillRect(0, 0, 256, 96); onAirTex.x.needsUpdate = true;
    const sign = new T.Mesh(new T.PlaneGeometry(1.6, 0.6), new T.MeshBasicMaterial({ map: onAirTex.x })); sign.position.set(0, 5.5, 0.9); g.add(sign);
    const post1 = new T.Mesh(new T.BoxGeometry(0.06, 1.6, 0.06), mat('#222')); post1.position.set(-0.6, 4.8, 0.8); g.add(post1); const post2 = post1.clone(); post2.position.x = 0.6; g.add(post2);
    g.position.set(0, 0, DEALERZ); scene.add(g);
    dealer = makeAvatar({ dealer: true, logo: 0, skin: '#d9a679', hair: '#111111', shirt: '#0b2a1c', pants: '#0b1a14' }); dealer.g.position.set(0, 1.72, DEALERZ + 0.1); scene.add(dealer.g);
    drawOnAir(0);
  }
  function drawOnAir(on) {
    const g = onAirTex.g; g.fillStyle = on ? '#e01030' : '#3a0610'; g.fillRect(0, 0, 256, 96); g.strokeStyle = on ? '#fff' : '#661022'; g.lineWidth = 6; g.strokeRect(6, 6, 244, 84);
    g.fillStyle = on ? '#fff' : '#7a2030'; g.font = '900 54px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ON AIR', 128, 52); onAirTex.x.needsUpdate = true;
  }
  function buildTruss() {
    const m = mat('#1a1d2e', { metalness: 0.7, roughness: 0.4 });
    [[20, 0.2, 0.2, 0, 7.6, -5], [20, 0.2, 0.2, 0, 7.6, 4], [0.2, 0.2, 9, -10, 7.6, -0.5], [0.2, 0.2, 9, 10, 7.6, -0.5]].forEach(b => { const x = new T.Mesh(new T.BoxGeometry(b[0], b[1], b[2]), m); x.position.set(b[3], b[4], b[5]); scene.add(x); });
    const coneGeo = new T.CylinderGeometry(0.06, 1.1, 7.2, 12, 1, true); coneGeo.translate(0, -3.6, 0);
    for (let i = 0; i < 10; i++) {
      const g = new T.Group(); const x = -8.6 + i * (17.2 / 9), z = i % 2 ? -5 : 4; g.position.set(x, 7.5, z);
      g.add(new T.Mesh(new T.BoxGeometry(0.3, 0.3, 0.4), mat('#222')));
      const cone = new T.Mesh(coneGeo, new T.MeshBasicMaterial({ color: 0x3a7bff, transparent: true, opacity: 0.1, depthWrite: false, side: T.DoubleSide, blending: T.AdditiveBlending })); g.add(cone);
      scene.add(g); spots.push({ g, cone, i, x, z });
    }
    followSpot = new T.Mesh(coneGeo, new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.16, depthWrite: false, side: T.DoubleSide, blending: T.AdditiveBlending })); followSpot.visible = false; scene.add(followSpot);
  }
  function buildTotems() {
    const body = mat('#101530'), edge = new T.MeshBasicMaterial({ color: 0x00ffc8 });
    for (let k = 0; k < 13; k++) {
      const left = k < 7, j = left ? k : k - 7, cnt = left ? 7 : 6, x = (left ? -1 : 1) * (9.0 + j * 0.42), z = 3.6 - j * (8.2 / (cnt - 1)), g = new T.Group();
      const slab = new T.Mesh(new T.BoxGeometry(1.5, 2.3, 0.14), body); slab.position.y = 1.4; g.add(slab);
      const rim = new T.Mesh(new T.BoxGeometry(1.58, 2.38, 0.06), edge); rim.position.set(0, 1.4, -0.07); g.add(rim);
      const logo = new T.Mesh(new T.PlaneGeometry(1.34, 1.34), new T.MeshBasicMaterial({ map: texFor(k) })); logo.position.set(0, 1.72, 0.08); g.add(logo);
      const strip = new T.Mesh(new T.PlaneGeometry(1.34, 0.18), new T.MeshBasicMaterial({ color: new T.Color().setHSL(k / 13, 0.9, 0.55) })); strip.position.set(0, 0.62, 0.08); g.add(strip);
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
      const x = side * (7.6 + r * 0.9 + (p % 2) * 0.15), z = 8.6 - p * 0.95 + r * 0.25, y = r * 0.55;
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
  const CN = 420, cPos = new Float32Array(CN * 3).fill(-50), cCol = new Float32Array(CN * 3), cVel = new Float32Array(CN * 3);
  function buildConfetti() {
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(cPos, 3)); g.setAttribute('color', new T.BufferAttribute(cCol, 3));
    conf = new T.Points(g, new T.PointsMaterial({ size: 0.17, vertexColors: true, transparent: true, depthWrite: false })); conf.frustumCulled = false; scene.add(conf);
  }
  let cHead = 0;
  function confetti(n, gold) {
    const c = new T.Color();
    for (let i = 0; i < n; i++) {
      const k = (cHead++ % CN) * 3; cPos[k] = (Math.random() - 0.5) * 13; cPos[k + 1] = 6.8 + Math.random() * 1.5; cPos[k + 2] = (Math.random() - 0.5) * 8;
      cVel[k] = (Math.random() - 0.5) * 1.5; cVel[k + 1] = -1.2 - Math.random() * 1.5; cVel[k + 2] = (Math.random() - 0.5) * 1.5;
      if (gold) c.setHSL(0.11 + Math.random() * 0.05, 1, 0.55 + Math.random() * 0.2); else c.setHSL(Math.random(), 0.95, 0.6); cCol[k] = c.r; cCol[k + 1] = c.g; cCol[k + 2] = c.b;
    }
    conf.geometry.attributes.color.needsUpdate = true;
  }
  function stepConfetti(dt) {
    let any = false;
    for (let i = 0; i < CN; i++) { const k = i * 3; if (cPos[k + 1] < -40) continue; any = true; cPos[k] += (cVel[k] + Math.sin(t * 4 + i) * 0.6) * dt; cPos[k + 1] += cVel[k + 1] * dt; cPos[k + 2] += cVel[k + 2] * dt; if (cPos[k + 1] < 0.02) cPos[k + 1] = -50; }
    if (any) conf.geometry.attributes.position.needsUpdate = true;
  }

  // ------------------------------------------------------------------ Avatare
  function makeAvatar(o) {
    const g = new T.Group(), skin = mat(o.skin || rnd(SKINS)), shirtC = o.shirt || rnd(SHIRTS), shirt = mat(shirtC), pants = mat(o.pants || rnd(PANTS)), hair = mat(o.hair || rnd(HAIRS));
    const box = (w, h, d, m, x, y, z) => { const b = new T.Mesh(new T.BoxGeometry(w, h, d), m); b.position.set(x, y, z); g.add(b); return b; };
    box(0.17, 0.82, 0.2, pants, -0.11, 0.41, 0); box(0.17, 0.82, 0.2, pants, 0.11, 0.41, 0);
    box(0.19, 0.08, 0.3, mat('#111'), -0.11, 0.04, 0.05); box(0.19, 0.08, 0.3, mat('#111'), 0.11, 0.04, 0.05);
    const body = new T.Group(); g.add(body);
    const torso = new T.Mesh(new T.BoxGeometry(0.52, 0.64, 0.28), shirt); torso.position.y = 1.12; body.add(torso);
    if (o.host || o.dealer) { const jacket = new T.Mesh(new T.BoxGeometry(0.55, 0.66, 0.3), mat(o.dealer ? '#0b2a1c' : '#161a34')); jacket.position.y = 1.12; body.add(jacket); const tie = new T.Mesh(new T.BoxGeometry(0.1, 0.1, 0.02), mat(o.dealer ? '#00ffc8' : '#ff2d95')); tie.position.set(0, 1.38, 0.16); body.add(tie); }
    const lw = o.host || o.dealer ? 0.17 : 0.36, lp = new T.Mesh(new T.PlaneGeometry(lw, lw), new T.MeshBasicMaterial({ map: texFor(o.logo == null ? 0 : o.logo) })); lp.position.set(o.host || o.dealer ? 0.14 : 0, o.host || o.dealer ? 1.22 : 1.14, 0.161); body.add(lp);
    const neck = new T.Mesh(new T.CylinderGeometry(0.06, 0.07, 0.1, 8), skin); neck.position.y = 1.47; body.add(neck);
    const head = new T.Group(); head.position.y = 1.64; body.add(head);
    head.add(new T.Mesh(new T.SphereGeometry(0.19, 12, 10), skin));
    if (o.dealer) {
      const crown = new T.Mesh(new T.CylinderGeometry(0.15, 0.17, 0.16, 12), mat('#101820')); crown.position.set(0, 0.2, 0); head.add(crown);
      const brim = new T.Mesh(new T.CylinderGeometry(0.28, 0.28, 0.025, 16), mat('#101820')); brim.position.set(0, 0.13, 0); head.add(brim);
      const band = new T.Mesh(new T.CylinderGeometry(0.172, 0.172, 0.04, 12), new T.MeshBasicMaterial({ color: 0x00ffc8 })); band.position.set(0, 0.15, 0); head.add(band);
      const glasses = new T.Mesh(new T.BoxGeometry(0.34, 0.07, 0.04), basic(0x000000)); glasses.position.set(0, 0.03, 0.18); head.add(glasses);
      [-0.08, 0.08].forEach(x => { const gl = new T.Mesh(new T.BoxGeometry(0.1, 0.05, 0.02), new T.MeshBasicMaterial({ color: 0x00ffc8 })); gl.position.set(x, 0.03, 0.205); head.add(gl); });
    } else {
      const cap = new T.Mesh(new T.SphereGeometry(0.2, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), hair); cap.position.set(0, 0.015, -0.01); cap.rotation.x = -0.25; head.add(cap);
      if (Math.random() < 0.4 && !o.host) { const back = new T.Mesh(new T.BoxGeometry(0.36, 0.3, 0.12), hair); back.position.set(0, -0.08, -0.14); head.add(back); }
      [-0.07, 0.07].forEach(x => { const e = new T.Mesh(new T.SphereGeometry(0.02, 6, 5), basic(0x111111)); e.position.set(x, 0.025, 0.178); head.add(e); });
    }
    const mouth = new T.Mesh(new T.BoxGeometry(0.07, 0.018, 0.02), basic(0x7a2a2a)); mouth.position.set(0, -0.07, 0.185); head.add(mouth);
    const mkArm = x => { const a = new T.Group(); a.position.set(x, 1.38, 0); const u = new T.Mesh(new T.BoxGeometry(0.11, 0.56, 0.11), o.host || o.dealer ? mat(o.dealer ? '#0b2a1c' : '#161a34') : shirt); u.position.y = -0.28; a.add(u); const h = new T.Mesh(new T.SphereGeometry(0.06, 8, 6), skin); h.position.y = -0.6; a.add(h); body.add(a); return a; };
    const armL = mkArm(0.34), armR = mkArm(-0.34);
    if (o.host) { const mic = new T.Mesh(new T.CylinderGeometry(0.025, 0.03, 0.18, 8), mat('#333')); mic.position.y = -0.62; mic.rotation.x = 0.3; armR.add(mic); const ball = new T.Mesh(new T.SphereGeometry(0.045, 8, 6), mat('#999')); ball.position.set(0, -0.72, 0.03); armR.add(ball); }
    return { g, body, head, mouth, armL, armR, pose: 'idle', ph: Math.random() * 6, s: { lx: 0, lz: 0.1, rx: 0, rz: -0.1, hx: 0, hz: 0, by: 0 }, talk: 0 };
  }
  function upAvatar(a, dt) {
    const T0 = { lx: 0, lz: 0.1, rx: 0, rz: -0.1, hx: 0, hz: 0, by: 0 }, p = a.pose, ph = a.ph;
    switch (p) {
      case 'idle': T0.lx = Math.sin(t * 1.3 + ph) * 0.06; T0.rx = Math.sin(t * 1.1 + ph) * 0.06; T0.hz = Math.sin(t * 0.8 + ph) * 0.04; T0.by = Math.sin(t * 1.5 + ph) * 0.008; break;
      case 'think': T0.rx = -2.05; T0.rz = -0.15; T0.hx = 0.12; T0.hz = 0.1 + Math.sin(t * 1.2) * 0.03; T0.lz = 0.12; break;
      case 'phone': T0.rx = -2.4; T0.rz = -0.35; T0.hz = 0.1; T0.lx = -0.5; break;
      case 'lock': T0.lx = -1.2; T0.rx = -1.2; T0.lz = 0.45; T0.rz = -0.45; T0.hx = 0.1; break;
      case 'cheer': T0.lz = 2.7 + Math.sin(t * 9) * 0.3; T0.rz = -2.7 - Math.sin(t * 9 + 1) * 0.3; T0.by = Math.abs(Math.sin(t * 6 + ph)) * 0.2; T0.hx = -0.15; break;
      case 'sad': T0.hx = 0.5; T0.lz = 0.04; T0.rz = -0.04; T0.lx = 0.1; T0.rx = 0.1; T0.by = -0.05; break;
      case 'talk': T0.rx = -0.85 + Math.sin(t * 3.1) * 0.3; T0.rz = -0.45; T0.lx = Math.sin(t * 2.3) * 0.25; T0.lz = 0.3 + Math.sin(t * 1.7) * 0.15; T0.hz = Math.sin(t * 1.3) * 0.06; break;
      case 'wave': T0.lz = 2.4 + Math.sin(t * 8) * 0.35; T0.lx = 0; break;
      case 'shrug': T0.lz = 0.9; T0.rz = -0.9; T0.lx = -0.5; T0.rx = -0.5; T0.hz = 0.1; break;
    }
    const k = 1 - Math.exp(-dt * 9), s = a.s;
    for (const key in T0) s[key] += (T0[key] - s[key]) * k;
    a.armL.rotation.set(s.lx, 0, s.lz); a.armR.rotation.set(s.rx, 0, s.rz); a.head.rotation.set(s.hx, 0, s.hz); a.body.position.y = s.by;
    const m = a.talk > 0 ? 0.6 + Math.abs(Math.sin(t * 14 + ph)) * 1.8 : 1; a.mouth.scale.set(1, m, 1); if (a.talk > 0) a.talk -= dt;
  }

  // ------------------------------------------------------------------ Spieler / Podeste
  function drawPod(p, l1, l2, active) {
    const g = p.c.getContext('2d'), col = SLOT[p.slot % 4]; g.fillStyle = active ? '#14224a' : '#0a1030'; g.fillRect(0, 0, 256, 128);
    g.fillStyle = col; g.fillRect(0, 0, 256, 8); g.fillRect(0, 120, 256, 8);
    g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '800 36px Arial'; let s = l1 || ''; if (s.length > 12) s = s.slice(0, 11) + '…'; g.fillText(s, 128, 50);
    g.fillStyle = col; g.font = '900 34px Arial'; g.fillText(l2 || '', 128, 94); p.x.needsUpdate = true;
  }
  const PODZ = 2.5;
  function podX(i, n) { return (i - (n - 1) / 2) * 2.1; }
  function setCast(ents) {
    podiums.forEach(p => scene.remove(p.g)); avatars.forEach(a => scene.remove(a.g)); podiums = []; avatars = []; cast = ents.slice(0, 4);
    const n = cast.length;
    cast.forEach((e, i) => {
      const x = podX(i, n), av = makeAvatar({ logo: e.logo }); av.g.position.set(x, 0, PODZ - 0.55); scene.add(av.g); av.x = x; avatars.push(av);
      const g = new T.Group(), pb = new T.Mesh(new T.BoxGeometry(1.15, 0.92, 0.8), mat('#121838')); pb.position.y = 0.46; g.add(pb);
      const glow = new T.Mesh(new T.BoxGeometry(1.2, 0.05, 0.84), new T.MeshBasicMaterial({ color: new T.Color(SLOT[i % 4]) })); glow.position.y = 0.93; g.add(glow);
      const pt = canvasTex(256, 128); const scr = new T.Mesh(new T.PlaneGeometry(1.0, 0.5), new T.MeshBasicMaterial({ map: pt.x })); scr.position.set(0, 0.5, 0.405); g.add(scr);
      g.position.set(x, 0, PODZ); scene.add(g); const p = { g, c: pt.c, x: pt.x, slot: i }; podiums.push(p); drawPod(p, e.name, '', false);
    });
    layoutKoffer(); followSpot.visible = false;
  }
  const podium = (i, l1, l2, active) => { if (podiums[i]) drawPod(podiums[i], l1, l2, active); };
  function setActive(i) {
    if (i >= 0 && avatars[i]) { followSpot.visible = true; followSpot.position.set(avatars[i].x, 7.5, PODZ + 1); followSpot.lookAt(avatars[i].x, 1.2, PODZ - 0.4); followSpot.rotateX(Math.PI / 2); followSpot.material.color.set(SLOT[i % 4]); } else followSpot.visible = false;
  }
  const pose = (i, p) => { if (avatars[i]) avatars[i].pose = p; };
  const hostPose = (p, s) => { host.pose = p; if (s) host.talk = s; };
  const hostTalk = s => { host.talk = Math.max(host.talk, s); if (host.pose === 'idle') host.pose = 'talk'; };
  const dealerPose = (p, s) => { dealer.pose = p; if (s) dealer.talk = s; };
  const dealerTalk = s => { dealer.talk = Math.max(dealer.talk, s); if (dealer.pose === 'idle') dealer.pose = 'talk'; };
  const allPose = (p, except) => avatars.forEach((a, k) => { if (k !== except) a.pose = p; });
  function onAir(v) { onAirOn = v ? 1 : 0; drawOnAir(v ? 1 : 0); }

  // ------------------------------------------------------------------ Koffer (Flightcases)
  const tierCol = v => v >= 500000 ? '#ff2d95' : v >= 100000 ? '#ff9a1f' : v >= 10000 ? '#ffd24a' : v >= 1000 ? '#7CFF6A' : v >= 100 ? '#00ffc8' : '#00e5ff';
  function buildKoffer(n) {
    if (kGroup) scene.remove(kGroup); kGroup = new T.Group(); scene.add(kGroup); koffer = []; pickables = [];
    const bodyM = mat('#1c2030', { metalness: 0.45, roughness: 0.45 }), metal = mat('#9aa6bd', { metalness: 0.9, roughness: 0.25 }), gold = new T.MeshBasicMaterial({ color: 0xffd24a });
    const baseGeo = new T.BoxGeometry(0.98, 0.44, 0.52), lidGeo = new T.BoxGeometry(0.98, 0.2, 0.52), cornerGeo = new T.BoxGeometry(0.1, 0.1, 0.1);
    for (let i = 0; i < n; i++) {
      const g = new T.Group(), hue = i / n;
      const base = new T.Mesh(baseGeo, bodyM); base.position.y = 0.22; base.userData.k = i; g.add(base); pickables.push(base);
      const lid = new T.Group(); lid.position.set(0, 0.44, -0.26); g.add(lid);
      const lidM = new T.Mesh(lidGeo, bodyM); lidM.position.set(0, 0.1, 0.26); lidM.userData.k = i; lid.add(lidM); pickables.push(lidM);
      [[-0.45, 0, 0.22], [0.45, 0, 0.22], [-0.45, 0, -0.22], [0.45, 0, -0.22]].forEach(c => { const m1 = new T.Mesh(cornerGeo, metal); m1.position.set(c[0], 0.03 + c[1], 0.26 + c[2]); lid.add(m1); const m2 = new T.Mesh(cornerGeo, metal); m2.position.set(c[0], 0.03, c[2]); g.add(m2); });
      const handle = new T.Mesh(new T.TorusGeometry(0.14, 0.022, 6, 12, Math.PI), metal); handle.position.set(0, 0.2, 0.26); handle.rotation.x = Math.PI / 2; handle.rotation.z = 0; lid.add(handle);
      [-0.28, 0.28].forEach(x => { const lt = new T.Mesh(new T.BoxGeometry(0.1, 0.1, 0.03), gold); lt.position.set(x, 0.03, 0.535); lid.add(lt); });
      const logo = new T.Mesh(new T.PlaneGeometry(0.34, 0.34), new T.MeshBasicMaterial({ map: texFor(i) })); logo.position.set(0, 0.22, 0.262); g.add(logo);
      const numT = canvasTex(256, 128); const ng = numT.g; ng.fillStyle = '#0a0f26'; ng.fillRect(0, 0, 256, 128); ng.fillStyle = '#ffd24a'; ng.font = '900 96px Arial'; ng.textAlign = 'center'; ng.textBaseline = 'middle'; ng.fillText(String(i + 1), 128, 70); numT.x.needsUpdate = true;
      const num = new T.Mesh(new T.PlaneGeometry(0.5, 0.25), new T.MeshBasicMaterial({ map: numT.x })); num.rotation.x = -Math.PI / 2; num.position.set(0, 0.205, 0.2); lid.add(num);
      const strip = new T.Mesh(new T.BoxGeometry(0.99, 0.04, 0.53), new T.MeshBasicMaterial({ color: new T.Color().setHSL(hue, 0.9, 0.55) })); strip.position.y = 0.02; g.add(strip);
      const inner = canvasTex(256, 128); const ip = new T.Mesh(new T.PlaneGeometry(0.86, 0.42), new T.MeshBasicMaterial({ map: inner.x })); ip.rotation.x = -Math.PI / 2; ip.position.y = 0.443; g.add(ip); inner.g.fillStyle = '#050810'; inner.g.fillRect(0, 0, 256, 128); inner.x.needsUpdate = true;
      const hol = canvasTex(512, 160); const hs = new T.Sprite(new T.SpriteMaterial({ map: hol.x, transparent: true, depthTest: false, opacity: 0 })); hs.scale.set(2.5, 0.78, 1); hs.position.set(0, 1.5, 0.2); hs.renderOrder = 8; g.add(hs);
      const k = { g, lid, strip, inner, hol, hs, home: new T.Vector3(), homeS: 1, pos: new T.Vector3(), s: 1, lidA: 0, lidT: 0, state: 'closed', open: false, holT: 0, pulse: 0, value: 0, ring: null, rotY: 0 };
      kGroup.add(g); koffer.push(k);
    }
    layoutKoffer(); koffer.forEach(k => { k.pos.copy(k.home); k.g.position.copy(k.pos); });
  }
  function layoutKoffer() {
    const rows = portrait ? [5, 4, 4] : [7, 6], zs = portrait ? [-3.2, -1.85, -0.5] : [-2.5, -0.95], sp = portrait ? 1.42 : 1.6; let idx = 0;
    rows.forEach((cnt, r) => { for (let c = 0; c < cnt && idx < koffer.length; c++, idx++) { const k = koffer[idx]; if (k.state === 'mine') continue; k.home.set((c - (cnt - 1) / 2) * sp, 0.12, zs[r]); } });
    koffer.forEach((k, i) => { if (k.state === 'mine' && k.owner >= 0 && avatars[k.owner]) k.home.set(avatars[k.owner].x + 0.55, 0.92, PODZ + 0.05); });
  }
  function kofferState(i, st, owner) { const k = koffer[i]; if (!k) return; k.state = st; k.owner = owner == null ? -1 : owner; layoutKoffer(); k.homeS = st === 'mine' ? 0.62 : 1; k.rotY = st === 'mine' ? -0.35 : 0; }
  function valTex(k, v, big) {
    const g = (big ? k.hol : k.inner).g, c = tierCol(v), txt = v.toLocaleString('de-DE') + ' €', w = big ? 512 : 256, h = big ? 160 : 128;
    g.clearRect(0, 0, w, h); if (!big) { g.fillStyle = '#050810'; g.fillRect(0, 0, w, h); g.fillStyle = c; g.globalAlpha = 0.18; g.fillRect(0, 0, w, h); g.globalAlpha = 1; }
    g.textAlign = 'center'; g.textBaseline = 'middle'; const fs = big ? (txt.length > 9 ? 84 : 104) : (txt.length > 9 ? 44 : 54); g.font = '900 ' + fs + 'px Arial';
    if (big) { g.lineWidth = 14; g.strokeStyle = '#000'; g.strokeText(txt, w / 2, h / 2); } g.shadowColor = c; g.shadowBlur = big ? 26 : 12; g.fillStyle = c; g.fillText(txt, w / 2, h / 2 + 2); g.shadowBlur = 0; (big ? k.hol : k.inner).x.needsUpdate = true;
  }
  function openKoffer(i, value) {
    const k = koffer[i]; if (!k) return; k.open = true; k.value = value; k.lidT = 1.95; k.holT = 3.4; valTex(k, value, false); valTex(k, value, true); k.state = k.state === 'mine' ? 'mine' : 'open'; k.strip.material.color.set(tierCol(value));
  }
  function closeKoffer(i) { const k = koffer[i]; if (k) { k.open = false; k.lidT = 0; k.holT = 0; } }
  function pulseKoffer(set) { koffer.forEach((k, i) => k.pulse = set && set.includes(i) ? 1 : 0); }
  function updateKoffer(dt) {
    koffer.forEach((k, i) => {
      k.pos.lerp(k.home, 1 - Math.exp(-dt * 5)); k.s += (k.homeS - k.s) * (1 - Math.exp(-dt * 6)); k.g.position.copy(k.pos); k.g.scale.setScalar(k.s * (hoverK === i && k.pulse ? 1.08 : 1)); k.g.rotation.y += (k.rotY - k.g.rotation.y) * (1 - Math.exp(-dt * 6));
      k.lidA += (k.lidT - k.lidA) * (1 - Math.exp(-dt * 7)); k.lid.rotation.x = -k.lidA;
      if (k.holT > 0) { k.holT -= dt; const a = Math.min(1, k.holT * 2, (3.4 - k.holT) * 4); k.hs.material.opacity = Math.max(0, a); k.hs.position.y = 1.45 + (3.4 - k.holT) * 0.12; } else k.hs.material.opacity = 0;
      const base = k.pulse ? 0.55 + 0.45 * Math.sin(t * 5 + i) : (k.open ? 0.9 : 0.35); if (!k.open) k.strip.material.color.setHSL(i / koffer.length, 0.9, 0.35 + base * 0.25);
    });
  }
  function pick(cx, cy) {
    if (!koffer.length) return -1; const rc = new T.Raycaster(), nd = new T.Vector2(cx / W * 2 - 1, -(cy / H * 2 - 1)); rc.setFromCamera(nd, camera); const hit = rc.intersectObjects(pickables, false)[0]; return hit ? hit.object.userData.k : -1;
  }
  function hover(cx, cy) { hoverK = cx == null ? -1 : pick(cx, cy); return hoverK; }

  // ------------------------------------------------------------------ Stimmung / Kamera
  function setMood(m) { mood.name = m; const pal = PAL[m]; if (pal) { mood.a.setHex(pal[0]); mood.b.setHex(pal[1]); } if (m === 'good') { flash = 1; confetti(50); } if (m === 'win') confetti(320, true); }
  function ledMessage(text, col, sec) { ledMsg = { text, col: col || '#fff' }; ledMsgT = sec || 2.5; }
  function drawLed(time) {
    const g = ledCtx, w = 1024, h = 400; const hue = mood.name === 'good' ? 140 : mood.name === 'bad' ? 355 : mood.name === 'win' ? (time * 90) % 360 : mood.name === 'offer' ? 40 : mood.name === 'tension' ? 170 : 200;
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, `hsl(${hue},80%,13%)`); gr.addColorStop(1, `hsl(${(hue + 60) % 360},80%,21%)`); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 9; i++) { const x = ((i * 130 + time * 70) % (w + 260)) - 130; g.fillStyle = `hsla(${(hue + i * 25) % 360},90%,60%,.10)`; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 90, 0); g.lineTo(x + 20, h); g.lineTo(x - 70, h); g.fill(); }
    // Frequenzskala als Wanddekor
    g.strokeStyle = 'rgba(255,255,255,.22)'; g.lineWidth = 2; for (let i = 0; i < 60; i++) { const x = 20 + i * 16.7; g.beginPath(); g.moveTo(x, h - 80); g.lineTo(x, h - (i % 5 === 0 ? 108 : 94)); g.stroke(); }
    g.textAlign = 'center'; g.textBaseline = 'middle';
    if (ledMsg && ledMsgT > 0) { g.font = '900 112px Arial'; g.lineWidth = 10; g.strokeStyle = '#000'; g.strokeText(ledMsg.text, w / 2, 170); g.fillStyle = ledMsg.col; g.fillText(ledMsg.text, w / 2, 170); }
    else { g.font = '900 54px Arial'; g.fillStyle = '#ffd24a'; g.fillText('AnMaCha', w / 2, 70); g.font = 'italic 900 112px Arial'; g.lineWidth = 8; g.strokeStyle = '#05061a'; g.strokeText('KOFFER DEALER', w / 2, 170); const tg = g.createLinearGradient(0, 100, 0, 220); tg.addColorStop(0, '#fff'); tg.addColorStop(1, '#00ffc8'); g.fillStyle = tg; g.fillText('KOFFER DEALER', w / 2, 170); g.font = '900 46px Arial'; g.fillStyle = '#FF2D95'; g.fillText('DEAL ODER FUNKSTILLE?', w / 2, 250); }
    if (logoList.length) { const sz = 78, gap = 18, tot = (sz + gap) * logoList.length; let off = (time * 45) % tot; g.save(); g.globalAlpha = 0.95; for (let k = 0; k < logoList.length * 2; k++) { const x = k * (sz + gap) - off; if (x < -sz || x > w) continue; g.drawImage(logoList[k % logoList.length].im, x, 290, sz, sz); } g.restore(); }
    ledTex.needsUpdate = true;
  }
  const shot = (name, i) => { shotName = name; shotI = i || 0; };
  function computeShot() {
    const tv = Math.tan(camera.fov * Math.PI / 360), asp = camera.aspect, availH = Math.max(120, H - availTop - availBot), fitV = H / availH;
    const need = (sx, sy) => Math.max(sx / (2 * tv * asp), sy * fitV / (2 * tv));
    let cx = 0, y = 4.6, d = 12, lx = 0, ly = 1.4, lz = -0.5;
    if (shotName === 'dealer') { cx = 0; lx = 0; ly = 2.9; lz = DEALERZ; d = need(5.2, 3.8) + 4.4; y = 3.4; }
    else if (shotName === 'koffer' && koffer[shotI]) { const k = koffer[shotI]; cx = k.home.x * 0.8; lx = k.home.x; ly = 0.9; lz = k.home.z; d = need(3.8, 2.3) + k.home.z; y = 2.6; }
    else if (shotName === 'player' && avatars[shotI]) { const a = avatars[shotI]; cx = a.x * 0.8; lx = a.x; ly = 1.3; lz = PODZ; d = need(4.2, 3.4) + PODZ; y = 2.4; }
    else if (shotName === 'host') { cx = HOSTX * 0.7; lx = HOSTX; ly = 1.4; lz = 1.4; d = need(4.0, 3.0) + 1.4; y = 2.2; }
    else if (shotName === 'all') { cx = 0; ly = 2.2; lz = -1; d = need(portrait ? 12 : 20, 8.5) + 1; y = 5.2; }
    else { cx = 0; ly = 1.2; lz = -0.8; d = need(portrait ? 8.2 : 13.6, portrait ? 6.6 : 5.6) + 0.5; y = portrait ? 5.4 : 4.7; }
    const sway = Math.sin(t * 0.25) * 0.3;
    wantPos.set(cx + sway, y, d); wantLook.set(lx, ly, lz);
  }
  function resize(w, h, top, bot) {
    W = w; H = h; availTop = top || 0; availBot = bot || 0; renderer.setSize(w, h, false); camera.aspect = w / h; const was = portrait; portrait = w < h * 0.95;
    camera.setViewOffset(w, h, 0, (availBot - availTop) / 2, w, h); camera.updateProjectionMatrix(); if (was !== portrait) layoutKoffer();
  }
  function frame(dt) {
    t += dt; dt = Math.min(dt, 0.1);
    spots.forEach(s => {
      const sw = mood.name === 'tension' ? 0.15 : mood.name === 'idle' || mood.name === 'menu' ? 0.45 : 0.6, sp = mood.name === 'tension' ? 0.4 : 1;
      s.g.rotation.x = Math.sin(t * 0.7 * sp + s.i) * sw + (s.z > 0 ? -0.2 : 0.2); s.g.rotation.z = Math.cos(t * 0.5 * sp + s.i * 1.3) * sw - s.x * 0.04;
      if (mood.name === 'win') { mood.a.setHSL((t * 0.4) % 1, 0.9, 0.55); mood.b.setHSL((t * 0.4 + 0.5) % 1, 0.9, 0.55); }
      s.cone.material.color.copy(s.i % 2 ? mood.a : mood.b); s.cone.material.opacity = mood.name === 'tension' ? 0.06 : mood.name === 'good' || mood.name === 'win' || mood.name === 'offer' ? 0.16 : 0.1;
    });
    floorRing.material.color.copy(mood.a); flash = Math.max(0, flash - dt * 1.5);
    ledT += dt; if (ledMsgT > 0) ledMsgT -= dt; if (ledT > 0.1) { ledT = 0; drawLed(t); }
    avatars.forEach(a => upAvatar(a, dt)); upAvatar(host, dt); upAvatar(dealer, dt); updateKoffer(dt);
    if (((t * 15) | 0) !== (((t - dt) * 15) | 0)) updateAudience(t, mood.name === 'good' || mood.name === 'win' ? 0.2 : mood.name === 'tension' ? 0.005 : 0.03);
    stepConfetti(dt);
    computeShot(); const k = 1 - Math.exp(-dt * 2.8); camPos.lerp(wantPos, k); camLook.lerp(wantLook, k * 1.2); camera.position.copy(camPos); camera.lookAt(camLook);
    renderer.render(scene, camera);
  }
  return { init, setCast, podium, setActive, pose, hostPose, hostTalk, dealerPose, dealerTalk, allPose, onAir, buildKoffer, kofferState, openKoffer, closeKoffer, pulseKoffer, pick, hover, setMood, shot, resize, frame, confetti, ledMessage, tierCol, texFor, get ready() { return !!renderer; }, get avatars() { return avatars; }, get koffer() { return koffer; }, get portrait() { return portrait; } };
})();
