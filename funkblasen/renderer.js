/* FUNKBLASEN – Darstellung mit Three.js (r128 aus ../vendor): echte 3D-Kugeln (instanziert), Licht, Spiegelungen,
 * Partikel und eine Kulisse je Welt. Die Spiellogik bleibt in engine.js: hier wird nur gezeichnet, was der Zustand sagt.
 * Feldkoordinaten (x nach rechts, y nach unten) -> Welt (x, -y, z). Orthografische, feste Kamera. */
(function (root) {
  'use strict';
  const E = root.FBEngine, L = root.FBLevels;
  let THREE = null;

  const HEX = L.COLOR_HEX;
  const SPECIAL_COLOR = { s: '#8b8f9c', k: '#bfefff', x: '#ffcf33', b: '#2a2d3a', q: '#e8ecf5' };
  const SHOT_COLOR = { bomb: '#2a2d3a', rainbow: '#ffffff', bolt: '#ffe14a' };
  const ICON_KEYS = ['sym0', 'sym1', 'sym2', 'sym3', 'sym4', 'sym5', 'bolt', 'chain', 'star', 'bomb', 'switch', 'shift', 'rainbow', 'crack', 'crystal'];

  function canvasTex(size, draw) {
    const c = document.createElement('canvas'); c.width = c.height = size;
    const g = c.getContext('2d'); draw(g, size);
    const t = new THREE.CanvasTexture(c); t.anisotropy = 1; return t;
  }
  function star(g, cx, cy, ro, ri, n) {
    g.beginPath(); for (let i = 0; i < n * 2; i++) { const r = i % 2 ? ri : ro, a = -Math.PI / 2 + i * Math.PI / n; g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } g.closePath();
  }
  // Symbole für Farben (Hilfe bei eingeschränktem Farbsehen) und Sonderblasen
  function iconTexture(key) {
    return canvasTex(128, (g, s) => {
      const m = s / 2; g.lineJoin = 'round'; g.lineCap = 'round';
      const fillStroke = (fill, w) => { g.lineWidth = w || 10; g.strokeStyle = 'rgba(0,0,0,.55)'; g.stroke(); g.fillStyle = fill || 'rgba(255,255,255,.92)'; g.fill(); };
      g.translate(m, m);
      switch (key) {
        case 'sym0': g.beginPath(); g.arc(0, 0, 20, 0, Math.PI * 2); fillStroke(); break;                        // Kreis
        case 'sym1': g.beginPath(); g.moveTo(0, -26); g.lineTo(24, 18); g.lineTo(-24, 18); g.closePath(); fillStroke(); break; // Dreieck
        case 'sym2': g.beginPath(); g.rect(-19, -19, 38, 38); fillStroke(); break;                                // Quadrat
        case 'sym3': g.beginPath(); g.moveTo(0, -27); g.lineTo(22, 0); g.lineTo(0, 27); g.lineTo(-22, 0); g.closePath(); fillStroke(); break; // Raute
        case 'sym4': star(g, 0, 0, 27, 12, 5); fillStroke(); break;                                               // Stern
        case 'sym5': g.beginPath(); g.moveTo(-8, -26); g.lineTo(8, -26); g.lineTo(8, -8); g.lineTo(26, -8); g.lineTo(26, 8); g.lineTo(8, 8); g.lineTo(8, 26); g.lineTo(-8, 26); g.lineTo(-8, 8); g.lineTo(-26, 8); g.lineTo(-26, -8); g.lineTo(-8, -8); g.closePath(); fillStroke(); break;
        case 'bolt': g.beginPath(); g.moveTo(8, -40); g.lineTo(-20, 6); g.lineTo(0, 6); g.lineTo(-8, 40); g.lineTo(22, -8); g.lineTo(2, -8); g.closePath(); fillStroke('#fff36b', 8); break;
        case 'chain': g.lineWidth = 12; g.strokeStyle = 'rgba(0,0,0,.5)'; g.beginPath(); g.ellipse(-12, 0, 18, 11, 0, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.ellipse(12, 0, 18, 11, 0, 0, Math.PI * 2); g.stroke();
          g.lineWidth = 6; g.strokeStyle = '#fff'; g.beginPath(); g.ellipse(-12, 0, 18, 11, 0, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.ellipse(12, 0, 18, 11, 0, 0, Math.PI * 2); g.stroke(); break;
        case 'star': star(g, 0, 0, 40, 17, 5); fillStroke('#fff7c2', 8); break;
        case 'bomb': g.beginPath(); g.arc(0, 6, 26, 0, Math.PI * 2); fillStroke('#3b3f52', 6); g.strokeStyle = '#ffb84d'; g.lineWidth = 6; g.beginPath(); g.moveTo(12, -16); g.quadraticCurveTo(22, -34, 34, -30); g.stroke();
          g.fillStyle = '#ffec7a'; g.beginPath(); g.arc(35, -31, 7, 0, Math.PI * 2); g.fill(); g.fillStyle = 'rgba(255,255,255,.6)'; g.beginPath(); g.arc(-9, -4, 7, 0, Math.PI * 2); g.fill(); break;
        case 'switch': g.beginPath(); g.rect(-24, -12, 48, 24); fillStroke('#7a88a8', 6); g.beginPath(); g.arc(10, 0, 13, 0, Math.PI * 2); fillStroke('#7dffb0', 5); break;
        case 'shift': g.lineWidth = 8; g.strokeStyle = '#fff'; g.beginPath(); g.arc(0, 0, 24, 0.3, Math.PI * 1.5); g.stroke(); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(0, -36); g.lineTo(14, -24); g.lineTo(0, -12); g.closePath(); g.fill(); break;
        case 'rainbow': ['#ff3b52', '#ffd21f', '#2fd46a', '#2f7bff', '#b45cff'].forEach((c, i) => { g.strokeStyle = c; g.lineWidth = 7; g.beginPath(); g.arc(0, 14, 36 - i * 7, Math.PI, 0); g.stroke(); }); break;
        case 'crack': g.strokeStyle = 'rgba(20,20,30,.85)'; g.lineWidth = 5; g.beginPath(); g.moveTo(-30, -20); g.lineTo(-8, -4); g.lineTo(-14, 14); g.lineTo(6, 30); g.moveTo(-8, -4); g.lineTo(18, -10); g.lineTo(30, 8); g.stroke(); break;
        case 'crystal': g.beginPath(); g.moveTo(0, -36); g.lineTo(22, -6); g.lineTo(0, 36); g.lineTo(-22, -6); g.closePath(); fillStroke('rgba(160,240,255,.95)', 5); break;
      }
    });
  }

  function Renderer(container) {
    this.container = container; this.insets = { top: 0, bottom: 0, left: 0, right: 0 };
    this.session = null; this.mode = 'menu'; this.world = 0; this.fxList = []; this.time = 0; this.shake = 0;
    this.patterns = true; this.reduced = false; this.quality = 'auto'; this.aim = { visible: false, sim: null, color: 0, special: null };
    this.preview = true; this.lineMode = 'lang'; this.frameAvg = 16; this.slowTime = 0; this.pr = 1; this.menuBubbles = [];
    this.danger = 0; this.lost = false; this.onLost = null;
  }
  Renderer.prototype.init = function () {
    THREE = root.THREE;
    if (!THREE || !THREE.WebGLRenderer) throw new Error('Die 3D-Bibliothek (three.js) konnte nicht geladen werden.');
    const test = document.createElement('canvas');
    if (!(test.getContext('webgl2') || test.getContext('webgl') || test.getContext('experimental-webgl'))) throw new Error('Dein Browser oder Gerät unterstützt kein WebGL (3D-Grafik).');
    const r = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.gl = r; r.setClearColor(0x0b0820, 1);
    this.pr = Math.min(root.devicePixelRatio || 1, 2); r.setPixelRatio(this.pr);
    this.container.appendChild(r.domElement);
    r.domElement.setAttribute('aria-hidden', 'true');
    r.domElement.addEventListener('webglcontextlost', e => { e.preventDefault(); this.lost = true; if (this.onLost) this.onLost(); }, false);
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 400); this.camera.position.set(0, 0, 120);
    this.scene.add(new THREE.HemisphereLight(0xdfe9ff, 0x2a1f3d, 0.75));
    const sun = new THREE.DirectionalLight(0xffffff, 0.95); sun.position.set(-10, 16, 30); this.scene.add(sun);
    this.accentLight = new THREE.PointLight(0xffa860, 0.6, 60); this.accentLight.position.set(E.LAUNCH.x, -E.LAUNCH.y + 4, 12); this.scene.add(this.accentLight);
    this.flash = new THREE.AmbientLight(0xffffff, 0); this.scene.add(this.flash);
  };
  Renderer.prototype.buildAssets = function () {
    const T = THREE;
    // kleine Umgebungs-Spiegelung (einmalig) für glänzende Glaskugeln
    const pm = new T.PMREMGenerator(this.gl), envScene = new T.Scene();
    const sky = new T.Mesh(new T.SphereGeometry(50, 16, 8), new T.MeshBasicMaterial({ side: T.BackSide, vertexColors: true }));
    const cols = []; const pos = sky.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) { const y = pos.getY(i) / 50; const c = new T.Color().setHSL(0.6, 0.4, 0.25 + Math.max(0, y) * 0.6); cols.push(c.r, c.g, c.b); }
    sky.geometry.setAttribute('color', new T.Float32BufferAttribute(cols, 3)); envScene.add(sky);
    const lamp = new T.Mesh(new T.PlaneGeometry(30, 12), new T.MeshBasicMaterial({ color: 0xffffff })); lamp.position.set(-15, 25, 20); lamp.lookAt(0, 0, 0); envScene.add(lamp);
    const lamp2 = lamp.clone(); lamp2.position.set(25, 5, 25); lamp2.lookAt(0, 0, 0); envScene.add(lamp2);
    this.env = pm.fromScene(envScene, 0.02).texture; pm.dispose(); sky.geometry.dispose(); sky.material.dispose(); lamp.geometry.dispose();

    const seg = this.pr > 1.5 ? 28 : 22;
    this.geo = {
      ball: new T.SphereGeometry(E.R * 0.97, seg, Math.round(seg * 0.75)), shell: new T.SphereGeometry(E.R * 1.02, 20, 14),
      stone: new T.DodecahedronGeometry(E.R * 0.95, 0), oct: new T.OctahedronGeometry(E.R * 0.55, 0), ring: new T.TorusGeometry(0.86, 0.08, 6, 28),
      icon: new T.PlaneGeometry(1.15, 1.15), dot: new T.SphereGeometry(0.17, 8, 6), box: new T.BoxGeometry(1, 1, 1), plane: new T.PlaneGeometry(1, 1)
    };
    this.mat = {
      ball: new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.12, metalness: 0.05, envMap: this.env, envMapIntensity: 1 }),
      ice: new T.MeshStandardMaterial({ color: 0xcff6ff, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.55, envMap: this.env, depthWrite: false }),
      glass: new T.MeshStandardMaterial({ color: 0xe8fbff, roughness: 0.02, metalness: 0.0, transparent: true, opacity: 0.32, envMap: this.env, depthWrite: false }),
      crystal: new T.MeshStandardMaterial({ color: 0x8ff3ff, emissive: 0x2bb6d9, emissiveIntensity: 0.8, roughness: 0.15, metalness: 0.3, flatShading: true, envMap: this.env }),
      stone: new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, metalness: 0.05, flatShading: true }),
      ring: new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.6, envMap: this.env }),
      dot: new T.MeshBasicMaterial({ color: 0xffffff })
    };
    const inst = (geo, mat, cap) => { const m = new T.InstancedMesh(geo, mat, cap); m.instanceMatrix.setUsage(T.DynamicDrawUsage); m.setColorAt(0, new T.Color(1, 1, 1)); m.count = 0; m.frustumCulled = false; this.scene.add(m); return m; };
    this.I = {
      ball: inst(this.geo.ball, this.mat.ball, 460), ice: inst(this.geo.shell, this.mat.ice, 200), glass: inst(this.geo.shell, this.mat.glass, 80),
      crystal: inst(this.geo.oct, this.mat.crystal, 80), stone: inst(this.geo.stone, this.mat.stone, 120), ring: inst(this.geo.ring, this.mat.ring, 200),
      dot: inst(this.geo.dot, this.mat.dot, 160)
    };
    this.icons = {};
    for (const k of ICON_KEYS) this.icons[k] = inst(this.geo.icon, new T.MeshBasicMaterial({ map: iconTexture(k), transparent: true, depthWrite: false }), 240);
    this.icons.crack.material.opacity = 0.9;
    // Partikel
    const PC = 1400; this.P = { cap: PC, n: 0, x: new Float32Array(PC), y: new Float32Array(PC), z: new Float32Array(PC), vx: new Float32Array(PC), vy: new Float32Array(PC), life: new Float32Array(PC), max: new Float32Array(PC), r: new Float32Array(PC), g: new Float32Array(PC), b: new Float32Array(PC), grav: new Float32Array(PC) };
    const pg = new T.BufferGeometry(); this.pPos = new Float32Array(PC * 3); this.pCol = new Float32Array(PC * 3);
    pg.setAttribute('position', new T.BufferAttribute(this.pPos, 3).setUsage(T.DynamicDrawUsage)); pg.setAttribute('color', new T.BufferAttribute(this.pCol, 3).setUsage(T.DynamicDrawUsage));
    const dotTex = canvasTex(64, (g, s) => { const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.4, 'rgba(255,255,255,.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, s, s); });
    this.points = new T.Points(pg, new T.PointsMaterial({ size: 8, map: dotTex, vertexColors: true, transparent: true, depthWrite: false, blending: T.AdditiveBlending, sizeAttenuation: false }));
    this.points.frustumCulled = false; this.points.position.z = 3; pg.setDrawRange(0, 0); this.scene.add(this.points);
    this.buildField();
    this.tmpM = new T.Matrix4(); this.tmpQ = new T.Quaternion(); this.tmpV = new T.Vector3(); this.tmpS = new T.Vector3(); this.tmpC = new T.Color(); this.tmpE = new T.Euler(); this.white = new T.Color(1, 1, 1);
    this.colors = HEX.map(h => new T.Color(h)); this.special = {}; for (const k in SPECIAL_COLOR) this.special[k] = new T.Color(SPECIAL_COLOR[k]);
    this.shotCol = {}; for (const k in SHOT_COLOR) this.shotCol[k] = new T.Color(SHOT_COLOR[k]);
  };
  Renderer.prototype.buildField = function () {
    const T = THREE, W = E.W, H = E.FIELD_H, g = new T.Group(); this.field = g; this.scene.add(g);
    // dunkle Spielfläche für gute Lesbarkeit
    const panel = new T.Mesh(this.geo.plane, new T.MeshBasicMaterial({ color: 0x050414, transparent: true, opacity: 0.42, depthWrite: false }));
    panel.scale.set(W + 0.6, H + 1.2, 1); panel.position.set(W / 2, -H / 2 + 0.6, -3); g.add(panel); this.panel = panel;
    const wallMat = new T.MeshStandardMaterial({ color: 0x2a2f55, emissive: 0xffa860, emissiveIntensity: 0.35, roughness: 0.4, metalness: 0.4 });
    this.wallMat = wallMat;
    for (const x of [-0.3, W + 0.3]) { const w = new T.Mesh(this.geo.box, wallMat); w.scale.set(0.45, H + 1.2, 1.2); w.position.set(x, -H / 2 + 0.6, 0); g.add(w); }
    const ceilMat = new T.MeshStandardMaterial({ color: 0x3a3570, emissive: 0x221a44, roughness: 0.5, metalness: 0.5 });
    this.ceilMesh = new T.Mesh(this.geo.box, ceilMat); g.add(this.ceilMesh); this.ceilMat = ceilMat;
    // Gefahrenlinie (gestrichelt)
    const dm = new T.MeshBasicMaterial({ color: 0xff3b52, transparent: true, opacity: 0.75 }); this.dangerMat = dm;
    this.dangerGroup = new T.Group();
    for (let i = 0; i < 14; i++) { const d = new T.Mesh(this.geo.box, dm); d.scale.set(0.9, 0.12, 0.1); d.position.set(0.8 + i * (W - 1.6) / 13, -E.DANGER_Y, -1); this.dangerGroup.add(d); }
    g.add(this.dangerGroup);
    // Kanone
    const lg = new T.Group(); lg.position.set(E.LAUNCH.x, -E.LAUNCH.y, -0.6); this.launcher = lg; g.add(lg);
    this.cannonMat = new T.MeshStandardMaterial({ color: 0xff8a3d, roughness: 0.35, metalness: 0.5, envMap: this.env });
    this.cannonDark = new T.MeshStandardMaterial({ color: 0x2b2440, roughness: 0.5, metalness: 0.6, envMap: this.env });
    const base = new T.Mesh(new T.CylinderGeometry(1.9, 2.3, 1.2, 28), this.cannonDark); base.rotation.x = Math.PI / 2; base.position.set(0, -1.1, -0.8); lg.add(base);
    const dial = new T.Mesh(new T.TorusGeometry(1.55, 0.14, 8, 32), this.cannonMat); dial.position.z = -0.2; lg.add(dial); this.dial = dial;
    const pivot = new T.Group(); lg.add(pivot); this.barrel = pivot;
    const tube = new T.Mesh(new T.CylinderGeometry(0.7, 0.95, 2.6, 20, 1, true), this.cannonMat); tube.position.y = 1.2; tube.position.z = -0.5; pivot.add(tube);
    const tip = new T.Mesh(new T.TorusGeometry(0.72, 0.12, 8, 20), this.cannonDark); tip.rotation.x = Math.PI / 2; tip.position.set(0, 2.5, -0.5); pivot.add(tip);
    const ant = new T.Mesh(new T.CylinderGeometry(0.05, 0.05, 1.6, 6), this.cannonDark); ant.position.set(1.4, 0.9, -0.4); ant.rotation.z = -0.4; lg.add(ant);
    const antTip = new T.Mesh(new T.SphereGeometry(0.16, 10, 8), new T.MeshBasicMaterial({ color: 0xff5050 })); antTip.position.set(1.72, 1.62, -0.4); lg.add(antTip); this.antTip = antTip;
    // Funki: kleiner leuchtender Funkgeist mit Kopfhörern
    const f = new T.Group(); f.position.set(E.LAUNCH.x + 5, -E.LAUNCH.y + 0.1, 0); this.funki = f; g.add(f);
    const body = new T.Mesh(new T.SphereGeometry(1.05, 24, 18), new T.MeshStandardMaterial({ color: 0xbff7ff, emissive: 0x58d8ff, emissiveIntensity: 0.55, roughness: 0.25, envMap: this.env }));
    body.scale.set(1, 1.08, 0.9); f.add(body); this.funkiBody = body;
    const tail = new T.Mesh(new T.ConeGeometry(0.7, 1.1, 14), body.material); tail.position.set(0.25, -1.05, 0); tail.rotation.z = 0.5; f.add(tail);
    const eyeM = new T.MeshBasicMaterial({ color: 0x1b1530 });
    for (const x of [-0.36, 0.36]) { const e = new T.Mesh(new T.SphereGeometry(0.15, 10, 8), eyeM); e.position.set(x, 0.12, 0.88); e.scale.set(1, 1.35, 0.6); f.add(e); }
    const smile = new T.Mesh(new T.TorusGeometry(0.22, 0.05, 6, 14, Math.PI), eyeM); smile.rotation.z = Math.PI; smile.position.set(0, -0.2, 0.9); f.add(smile);
    this.phonesMat = new T.MeshStandardMaterial({ color: 0xff8a3d, roughness: 0.35, metalness: 0.3 });
    const band = new T.Mesh(new T.TorusGeometry(1.08, 0.1, 8, 24, Math.PI), this.phonesMat); band.position.y = 0.05; f.add(band);
    for (const x of [-1.05, 1.05]) { const cup = new T.Mesh(new T.CylinderGeometry(0.34, 0.34, 0.3, 16), this.phonesMat); cup.rotation.z = Math.PI / 2; cup.position.set(x, 0.05, 0.1); f.add(cup); }
    // Vorschau: Ring an der Landestelle
    this.ghost = new T.Mesh(this.geo.ring, new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 })); this.ghost.visible = false; g.add(this.ghost);
    // Effekte: Druckwelle und Blitzbalken
    this.waves = []; this.bars = [];
    for (let i = 0; i < 6; i++) { const w = new T.Mesh(new T.TorusGeometry(1, 0.12, 6, 40), new T.MeshBasicMaterial({ color: 0xffd28a, transparent: true, opacity: 0, depthWrite: false })); w.visible = false; g.add(w); this.waves.push(w); }
    for (let i = 0; i < 4; i++) { const b = new T.Mesh(this.geo.plane, new T.MeshBasicMaterial({ color: 0xfff6a0, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending })); b.visible = false; b.scale.set(W, 1.4, 1); g.add(b); this.bars.push(b); }
    // Hintergrund
    const bgMat = new T.ShaderMaterial({ depthWrite: false, uniforms: { a: { value: new T.Color('#0b0820') }, b: { value: new T.Color('#3a2a70') }, t: { value: 0 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'uniform vec3 a; uniform vec3 b; uniform float t; varying vec2 vUv; void main(){ float k = smoothstep(0.0,1.0,vUv.y); vec3 c = mix(b, a, k); float v = 1.0 - 0.35*length(vUv-vec2(0.5,0.55)); gl_FragColor = vec4(c*v,1.0); }' });
    this.bg = new T.Mesh(this.geo.plane, bgMat); this.bg.position.z = -150; this.bg.renderOrder = -10; this.scene.add(this.bg);
    this.decor = new T.Group(); this.decor.position.z = -60; this.scene.add(this.decor);
  };

  // ---------- Kulissen je Welt (wenige einfache Formen, geteilte Geometrien) ----------
  Renderer.prototype.setWorld = function (id) {
    if (this.world === id && this.decor.children.length) return;
    this.world = id; const w = L.WORLDS[(id || 1) - 1], T = THREE;
    this.bg.material.uniforms.a.value.set(w.sky[0]); this.bg.material.uniforms.b.value.set(w.sky[1]);
    this.wallMat.emissive.set(w.accent); this.accentLight.color.set(w.accent);
    this.dangerMat.color.set(id === 9 || id === 2 ? '#ff5a3d' : '#ff3b52');
    // alte Kulisse freigeben
    this.decor.traverse(o => { if (o.isMesh || o.isPoints) { if (o.userData.own) { o.geometry.dispose(); o.material.dispose(); } } });
    this.decor.clear(); this.anims = [];
    const D = this.decor, cx = E.W / 2, cy = -E.FIELD_H / 2, rnd = mulberry(id * 977);
    const mat = (c, em, extra) => Object.assign(new T.MeshStandardMaterial({ color: c, emissive: em || 0x000000, roughness: 0.6, metalness: 0.1, flatShading: true }), extra || {});
    const add = (geo, m, x, y, z, sx, sy, sz) => { const o = new T.Mesh(geo, m); o.position.set(x, y, z || 0); if (sx) o.scale.set(sx, sy || sx, sz || sx); o.userData.own = true; D.add(o); return o; };
    const sph = () => new T.SphereGeometry(1, 14, 10), box = () => new T.BoxGeometry(1, 1, 1);
    const sides = n => Array.from({ length: n }, (_, i) => { const s = i % 2 ? 1 : -1; return cx + s * (E.W / 2 + 4 + rnd() * 30); });
    const sway = (o, amp, sp) => { const y0 = o.position.y, x0 = o.position.x, ph = rnd() * 6; this.anims.push(t => { o.position.y = y0 + Math.sin(t * sp + ph) * amp; o.position.x = x0 + Math.cos(t * sp * 0.7 + ph) * amp * 0.5; }); };
    if (w.decor === 'garden') {
      add(sph(), mat(0x6fd36a), cx - 30, cy - 34, -10, 40, 16, 8); add(sph(), mat(0x56bf58), cx + 32, cy - 36, -12, 42, 18, 8);
      const sun = add(sph(), new T.MeshBasicMaterial({ color: 0xfff1a0 }), cx + 26, cy + 20, -20, 5); sway(sun, 0.6, 0.3);
      for (const x of sides(16)) { const st = add(box(), mat(0x3f9a45), x, cy - 16 + rnd() * 8, 0, 0.3, 4, 0.3); const fl = add(sph(), mat([0xff6b8a, 0xffd21f, 0xffffff, 0xb45cff][Math.floor(rnd() * 4)], 0x221111), x, st.position.y + 2.2, 0.5, 0.9); sway(fl, 0.15, 1.2); }
      for (let i = 0; i < 5; i++) { const c = add(sph(), mat(0xffffff, 0x333333), cx - 40 + rnd() * 80, cy + 16 + rnd() * 10, -15, 4 + rnd() * 3, 1.6, 2); sway(c, 1.2, 0.15); }
    } else if (w.decor === 'neon') {
      const cols = [0xff3df2, 0x3df2ff, 0xffe14a, 0x7a5cff];
      for (const x of sides(22)) { const h = 8 + rnd() * 26; const b = add(box(), mat(0x140a2e, cols[Math.floor(rnd() * 4)], { emissiveIntensity: 0.25 }), x, cy - 20 + h / 2, -5 - rnd() * 20, 3 + rnd() * 4, h, 3); this.anims.push(t => { b.material.emissiveIntensity = 0.18 + 0.12 * Math.sin(t * 2 + x); }); }
      for (let i = 0; i < 4; i++) { const r = add(new T.TorusGeometry(4 + i * 2, 0.15, 6, 40), new T.MeshBasicMaterial({ color: cols[i] }), cx, cy + 10, -30 - i * 5); this.anims.push(t => { r.rotation.y = t * 0.3 + i; }); }
    } else if (w.decor === 'clouds') {
      for (let i = 0; i < 24; i++) { const x = cx - 50 + rnd() * 100, y = cy - 20 + rnd() * 45, s = 2 + rnd() * 4; const c = add(sph(), mat(0xffffff, 0x8899bb, { emissiveIntensity: 0.25 }), x, y, -10 - rnd() * 30, s * 1.6, s, s); sway(c, 1, 0.1 + rnd() * 0.15); }
      for (const x of sides(6)) add(new T.CylinderGeometry(3, 2.4, 0.8, 14), mat(0xd7c8ff), x, cy - 8 + rnd() * 20, -8);
    } else if (w.decor === 'crystal') {
      for (const x of sides(18)) { const h = 3 + rnd() * 9, c = add(new T.ConeGeometry(1 + rnd() * 1.6, h, 5), mat([0x6ef0ff, 0xb45cff, 0x5a8cff][Math.floor(rnd() * 3)], 0x2266aa, { emissiveIntensity: 0.6 }), x, cy - 18 + h / 2, -5 - rnd() * 15); this.anims.push(t => { c.material.emissiveIntensity = 0.4 + 0.3 * Math.sin(t * 1.5 + x); }); }
      for (let i = 0; i < 10; i++) { const c = add(new T.ConeGeometry(1, 4 + rnd() * 6, 5), mat(0x3a4a8a, 0x112244), cx - 45 + rnd() * 90, cy + 24, -20); c.rotation.z = Math.PI; }
    } else if (w.decor === 'sea') {
      add(sph(), mat(0xe8d6a0), cx, cy - 46, -20, 90, 20, 10);
      for (const x of sides(18)) { const k = add(new T.CylinderGeometry(0.25, 0.4, 10 + rnd() * 10, 6), mat(0x1f9a6a, 0x0a3322), x, cy - 14, -6 - rnd() * 10); const ph = rnd() * 6; this.anims.push(t => { k.rotation.z = Math.sin(t * 0.8 + ph) * 0.15; }); }
      for (let i = 0; i < 26; i++) { const b = add(sph(), new T.MeshBasicMaterial({ color: 0xbff7ff, transparent: true, opacity: 0.35 }), cx - 45 + rnd() * 90, cy - 30 + rnd() * 60, -12, 0.3 + rnd() * 0.6); const sp = 2 + rnd() * 3, y0 = b.position.y; this.anims.push(t => { b.position.y = cy - 30 + ((y0 - cy + 30 + t * sp) % 60); }); }
    } else if (w.decor === 'forest') {
      for (const x of sides(18)) { const h = 8 + rnd() * 10; add(new T.CylinderGeometry(0.5, 0.7, h * 0.4, 6), mat(0x5a3a22), x, cy - 18 + h * 0.2, -6 - rnd() * 6); add(new T.ConeGeometry(2.6, h * 0.8, 7), mat(0x1f5a32, 0x0a2210), x, cy - 18 + h * 0.65, -6); }
      for (let i = 0; i < 26; i++) { const l = add(sph(), new T.MeshBasicMaterial({ color: [0xc6ff6a, 0xffe08a, 0x9de8ff][i % 3] }), cx - 45 + rnd() * 90, cy - 14 + rnd() * 34, -4, 0.22); sway(l, 1.4, 0.4 + rnd() * 0.6); }
    } else if (w.decor === 'space') {
      const n = 500, pos = new Float32Array(n * 3); for (let i = 0; i < n; i++) { pos[i * 3] = cx - 80 + rnd() * 160; pos[i * 3 + 1] = cy - 60 + rnd() * 120; pos[i * 3 + 2] = -30; }
      const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(pos, 3));
      const stars = new T.Points(geo, new T.PointsMaterial({ color: 0xffffff, size: 2, sizeAttenuation: false })); stars.userData.own = true; D.add(stars);
      const pl = add(sph(), mat(0x6a5cff, 0x221a66), cx + 30, cy + 18, -40, 10); this.anims.push(t => { pl.rotation.y = t * 0.1; });
      const ring = add(new T.TorusGeometry(15, 0.6, 6, 50), mat(0x9db7ff, 0x334477), cx + 30, cy + 18, -40); ring.rotation.x = 1.2;
      const st = add(new T.TorusGeometry(8, 1, 8, 30), mat(0xb0b8d0, 0x222244), cx - 30, cy - 10, -25); this.anims.push(t => { st.rotation.z = t * 0.15; });
    } else if (w.decor === 'temple') {
      for (const x of sides(10)) add(new T.CylinderGeometry(1.2, 1.4, 26, 12), mat(0xfff3e0, 0x332211, { emissiveIntensity: 0.2 }), x, cy, -10 - rnd() * 10);
      const rc = ['#ff3b52', '#ff9a3d', '#ffd21f', '#2fd46a', '#2f7bff', '#b45cff'];
      rc.forEach((c, i) => add(new T.TorusGeometry(40 - i * 1.6, 0.8, 6, 60, Math.PI), new T.MeshBasicMaterial({ color: c }), cx, cy - 28, -45));
    } else if (w.decor === 'storm') {
      for (let i = 0; i < 18; i++) { const c = add(sph(), mat(0x2a3048, 0x0a0c18), cx - 50 + rnd() * 100, cy + 18 + rnd() * 18, -15 - rnd() * 20, 6 + rnd() * 5, 3, 3); sway(c, 1.5, 0.12); }
      this.anims.push(t => { const k = (t % 7.3); this.flash.intensity = this.reduced ? 0 : (k < 0.08 || (k > 0.18 && k < 0.24) ? 0.5 : 0); });
    } else if (w.decor === 'tower') {
      const tm = mat(0xffa860, 0x552200, { emissiveIntensity: 0.3 });
      for (const s of [-1, 1]) for (let i = 0; i < 12; i++) { const b = add(box(), tm, cx + s * (E.W / 2 + 10 - i * 0.4), cy - 20 + i * 4, -15, 0.4, 4.3, 0.4); b.rotation.z = s * 0.06; }
      for (let i = 0; i < 4; i++) { const r = add(new T.TorusGeometry(3, 0.2, 6, 30), new T.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0.6 }), cx, cy + 30, -35); const ph = i * 0.25; this.anims.push(t => { const k = ((t * 0.25 + ph) % 1); r.scale.setScalar(1 + k * 10); r.material.opacity = 0.6 * (1 - k); }); }
      for (let i = 0; i < 14; i++) add(box(), mat(0x24183a, 0xffd23a, { emissiveIntensity: 0.15 }), cx - 50 + i * 7.5, cy - 24, -20, 5, 6 + rnd() * 14, 4);
    }
    if (id !== 9) this.flash.intensity = 0;
  };
  function mulberry(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  Renderer.prototype.setCosmetics = function (c) {
    const cannon = L.CANNONS.find(x => x.id === c.cannon) || L.CANNONS[0], fin = L.FINISHES.find(x => x.id === c.finish) || L.FINISHES[0], ph = L.HEADPHONES.find(x => x.id === c.phones) || L.HEADPHONES[0];
    this.cannonMat.color.set(cannon.color); this.dial.material = this.cannonMat; this.phonesMat.color.set(ph.color);
    const m = this.mat.ball; m.roughness = fin.rough; m.metalness = fin.metal; m.envMapIntensity = fin.env;
    m.emissive.set(fin.id === 'galaxie' ? '#1a1033' : '#000000'); m.needsUpdate = true;
  };
  Renderer.prototype.setInsets = function (i) { this.insets = i; this.resize(); };
  Renderer.prototype.resize = function () {
    if (!this.gl) return;
    const w = Math.max(1, this.container.clientWidth), h = Math.max(1, this.container.clientHeight);
    this.gl.setSize(w, h, false); this.gl.domElement.style.width = w + 'px'; this.gl.domElement.style.height = h + 'px';
    const i = this.insets, aw = Math.max(50, w - i.left - i.right), ah = Math.max(50, h - i.top - i.bottom);
    const fw = E.W + 1.4, fh = E.FIELD_H + 1.6, s = Math.min(aw / fw, ah / fh);
    this.scale = s; this.vw = w; this.vh = h;
    this.ox = i.left + (aw - E.W * s) / 2; this.oy = i.top + (ah - fh * s) / 2 + 1.0 * s;   // Feld (0,0) auf dem Bildschirm
    const c = this.camera; c.left = -this.ox / s; c.right = (w - this.ox) / s; c.top = this.oy / s; c.bottom = (this.oy - h) / s; c.updateProjectionMatrix();
    this.bg.scale.set((w / s) * 1.2, (h / s) * 1.2, 1); this.bg.position.x = (c.left + c.right) / 2; this.bg.position.y = (c.top + c.bottom) / 2;
    this.decor.position.x = 0;
    this.points.material.size = Math.max(3, 0.5 * s);
  };
  Renderer.prototype.clientToField = function (cx, cy) { const r = this.gl.domElement.getBoundingClientRect(); return { x: (cx - r.left - this.ox) / this.scale, y: (cy - r.top - this.oy) / this.scale }; };
  Renderer.prototype.fieldToClient = function (x, y) { const r = this.gl.domElement.getBoundingClientRect(); return { x: r.left + this.ox + x * this.scale, y: r.top + this.oy + y * this.scale }; };

  // ---------- Effekte ----------
  Renderer.prototype.burst = function (x, y, col, n, speed, grav) {
    const P = this.P; n = this.reduced ? Math.ceil(n / 3) : n;
    for (let i = 0; i < n; i++) {
      if (P.n >= P.cap) return;
      const k = P.n++, a = Math.random() * Math.PI * 2, s = (0.4 + Math.random()) * (speed || 8);
      P.x[k] = x; P.y[k] = -y; P.z[k] = 0; P.vx[k] = Math.cos(a) * s; P.vy[k] = Math.sin(a) * s; P.max[k] = P.life[k] = 0.35 + Math.random() * 0.45;
      P.r[k] = col.r; P.g[k] = col.g; P.b[k] = col.b; P.grav[k] = grav == null ? -18 : grav;
    }
  };
  Renderer.prototype.cellColor = function (cell) { return cell.c >= 0 ? this.colors[cell.c] : (this.special[cell.k] || this.special.s); };
  Renderer.prototype.onLand = function (data, st) {
    const ev = data.ev;
    for (const p of ev.popped) { const x = E.cellX(st, p.r, p.c), y = E.cellY(st, p.r); this.burst(x, y, this.cellColor(p.cell), 12, 9); this.fxList.push({ type: 'pop', x, y, cell: p.cell, t: 0, life: 0.16 }); }
    for (const p of ev.dropped) { const x = E.cellX(st, p.r, p.c), y = E.cellY(st, p.r); this.fxList.push({ type: 'drop', x, y, vx: (Math.random() - 0.5) * 6, vy: -4 - Math.random() * 4, cell: p.cell, t: 0, life: 2.2, rot: Math.random() * 6 }); }
    for (const t of ev.thawed) this.burst(E.cellX(st, t.r, t.c), E.cellY(st, t.r), this.special.k, 8, 6);
    for (const t of ev.cracked) this.burst(E.cellX(st, t.r, t.c), E.cellY(st, t.r), this.special.s, 6, 5);
    for (const b of ev.booms) { this.wave(E.cellX(st, b.r, b.c), E.cellY(st, b.r), b.rad); this.shake = Math.max(this.shake, b.rad === 2 ? 0.6 : 0.35); }
    for (const r of ev.bolts) this.bar(E.cellY(st, r));
    if (ev.points >= 400) this.shake = Math.max(this.shake, 0.25);
    this.funkiJump = ev.combo >= 3 || ev.dropped.length >= 6 ? 1 : this.funkiJump || 0;
  };
  Renderer.prototype.wave = function (x, y, rad) { const w = this.waves.find(o => !o.visible) || this.waves[0]; w.visible = true; w.position.set(x, -y, 1.5); w.userData = { t: 0, rad }; };
  Renderer.prototype.bar = function (y) { const b = this.bars.find(o => !o.visible) || this.bars[0]; b.visible = true; b.position.set(E.W / 2, -y, 1.6); b.userData = { t: 0 }; };
  Renderer.prototype.celebrate = function () { for (let i = 0; i < 6; i++) this.burst(2 + Math.random() * (E.W - 4), 3 + Math.random() * 10, this.colors[i], 20, 12, -8); this.funkiJump = 1; };
  Renderer.prototype.clearFx = function () { this.fxList.length = 0; this.P.n = 0; this.waves.forEach(w => { w.visible = false; }); this.bars.forEach(b => { b.visible = false; }); this.shake = 0; };

  // ---------- Zeichnen ----------
  Renderer.prototype.beginFrame = function () { for (const k in this.I) this.I[k].count = 0; for (const k in this.icons) this.icons[k].count = 0; };
  Renderer.prototype.put = function (mesh, x, y, z, s, col, rz, sx) {
    if (mesh.count >= mesh.instanceMatrix.count) return;
    this.tmpV.set(x, y, z); this.tmpS.set(s * (sx || 1), s, s); this.tmpE.set(0, 0, rz || 0); this.tmpQ.setFromEuler(this.tmpE);
    this.tmpM.compose(this.tmpV, this.tmpQ, this.tmpS); mesh.setMatrixAt(mesh.count, this.tmpM);
    if (col) mesh.setColorAt(mesh.count, col);
    mesh.count++;
  };
  // Eine Kugel (Zelle, fliegend, in der Kanone) zeichnen
  Renderer.prototype.drawBubble = function (x, y, z, s, cell, shot, t) {
    const X = x, Y = -y, k = cell ? cell.k : 'n';
    if (shot) {   // Sonderkugel aus der Kanone
      this.put(this.I.ball, X, Y, z, s, this.shotCol[shot]);
      this.put(this.icons[shot === 'bomb' ? 'bomb' : shot === 'bolt' ? 'bolt' : 'rainbow'], X, Y, z + 1.05 * s, s, null, shot === 'rainbow' ? 0 : Math.sin(t * 3) * 0.2);
      return;
    }
    if (k === 's') { this.tmpC.copy(this.special.s); if (cell.cr) this.tmpC.multiplyScalar(0.75); this.put(this.I.stone, X, Y, z, s, this.tmpC, 0.3); if (cell.cr) this.put(this.icons.crack, X, Y, z + 1.0 * s, s); return; }
    if (k === 'k') { this.put(this.I.glass, X, Y, z, s); this.put(this.I.crystal, X, Y, z, s * 1.05, null, t * 1.2); return; }
    const col = cell.c >= 0 ? this.colors[cell.c] : this.special[k];
    this.put(this.I.ball, X, Y, z, s, col);
    if (k === 'i') this.put(this.I.ice, X, Y, z, s);
    const iz = z + 1.02 * s;
    if (k === 'x') this.put(this.icons.star, X, Y, iz, s, null, Math.sin(t * 2) * 0.25);
    else if (k === 'b') this.put(this.icons.bomb, X, Y, iz, s);
    else if (k === 'q') this.put(this.icons.switch, X, Y, iz, s);
    else {
      if (this.patterns && cell.c >= 0 && k !== 'i') this.put(this.icons['sym' + cell.c], X, Y, iz, s * 0.62);
      else if (this.patterns && k === 'i') this.put(this.icons['sym' + cell.c], X, Y, iz + 0.05, s * 0.5);
      if (k === 'l') this.put(this.icons.bolt, X + 0.35 * s, Y - 0.3 * s, iz + 0.02, s * 0.62);
      if (k === 'h') { this.put(this.I.ring, X, Y, z + 0.2, s, this.colors[cell.c], 0.6); this.put(this.icons.chain, X, Y + 0.45 * s, iz + 0.02, s * 0.55); }
      if (k === 'w') { this.put(this.I.ring, X, Y, z + 0.25, s * 1.03, this.colors[cell.c], t * 2); this.put(this.icons.shift, X, Y, iz + 0.03, s * 0.8, null, -t * 2); }
    }
  };
  Renderer.prototype.render = function (dt) {
    if (!this.gl || this.lost) return;
    this.time += dt; const t = this.time, S = this.session, inGame = this.mode === 'game' && S, reduced = this.reduced;
    this.beginFrame();
    this.field.visible = true;
    const showField = !!inGame;
    this.launcher.visible = this.funki.visible = this.dangerGroup.visible = this.ceilMesh.visible = showField;
    this.panel.visible = showField;
    if (inGame) {
      const st = S.st;
      // Decke
      const cy = st.ceil * E.ROW_H; this.ceilMesh.scale.set(E.W + 1, cy + 1.2, 1.4); this.ceilMesh.position.set(E.W / 2, -(cy - 1.2) / 2 - 1.2 + 0.0, -0.4);
      this.ceilMesh.position.y = 1.2 - (cy + 1.2) / 2;
      // Gitter
      for (let r = 0; r < E.ROWS; r++) {
        const row = st.grid[r], y = E.cellY(st, r);
        for (let c = 0; c < row.length; c++) {
          const cell = row[c]; if (!cell) continue;
          const z = reduced ? 0 : Math.sin(t * 1.3 + r * 0.7 + c * 1.1) * 0.12;
          this.drawBubble(E.cellX(st, r, c), y, z, 1, cell, null, t + r + c);
        }
      }
      // Gefahr
      const mr = E.maxRow(st), near = mr >= E.DANGER - 2;
      this.dangerMat.opacity = near ? 0.55 + 0.45 * Math.abs(Math.sin(t * 6)) : 0.45;
      this.danger = near ? 1 : 0;
      // Kanone und Kugeln
      const ang = S.angle; this.barrel.rotation.z = ang - Math.PI / 2; this.dial.rotation.z = -ang;
      this.antTip.material.color.setHSL(0, 1, 0.5 + 0.2 * Math.sin(t * 5));
      if (S.phase === 'flying') { const p = S.flightPos(); this.drawBubble(p.x, p.y, 0.6, 1, S.flight.bubble.s ? null : { k: 'n', c: S.flight.bubble.c }, S.flight.bubble.s, t); }
      const cur = st.cur, nx = st.next;
      if (cur && S.phase !== 'win' && S.phase !== 'lose') this.drawBubble(E.LAUNCH.x, E.LAUNCH.y, 0.7, S.phase === 'flying' ? 0.75 : 1, cur.s ? null : { k: 'n', c: cur.c }, cur.s, t);
      if (nx) this.drawBubble(E.LAUNCH.x - 4.6, E.LAUNCH.y + 0.5, 0.4, 0.72, nx.s ? null : { k: 'n', c: nx.c }, nx.s, t);
      // Ziellinie
      const aim = this.aim;
      if (aim.visible && aim.sim && (S.phase === 'ready' || S.phase === 'aiming')) {
        const p = aim.sim.path; let maxLen = aim.sim.len - 0.6;
        if (this.lineMode === 'kurz') { let firstB = -1, acc = 0; for (let i = 1; i < p.length; i++) { acc += Math.hypot(p[i].x - p[i - 1].x, p[i].y - p[i - 1].y); if (p[i].b) { firstB = acc; break; } } maxLen = Math.min(maxLen, firstB > 0 ? firstB + 4 : 11); }
        const col = cur && cur.c >= 0 ? this.colors[cur.c] : this.shotCol[(cur && cur.s) || 'rainbow'];
        let d = reduced ? 0.6 : 0.6 + ((t * 3) % 1.1), seg = 1, acc = 0;
        while (d < maxLen && this.I.dot.count < 150) {
          while (seg < p.length - 1 && acc + Math.hypot(p[seg].x - p[seg - 1].x, p[seg].y - p[seg - 1].y) < d) { acc += Math.hypot(p[seg].x - p[seg - 1].x, p[seg].y - p[seg - 1].y); seg++; }
          const a = p[seg - 1], b = p[seg], L2 = Math.hypot(b.x - a.x, b.y - a.y) || 1, k = Math.min(1, (d - acc) / L2);
          const fade = 1 - (d / Math.max(maxLen, 1)) * 0.55; this.tmpC.copy(col).lerp(this.white, 0.35); this.tmpC.multiplyScalar(fade);
          this.put(this.I.dot, a.x + (b.x - a.x) * k, -(a.y + (b.y - a.y) * k), 1.2, 1, this.tmpC);
          d += 1.1;
        }
        if (this.preview && aim.sim.cell && this.lineMode !== 'kurz') { this.ghost.visible = true; this.ghost.position.set(E.cellX(st, aim.sim.cell.r, aim.sim.cell.c), -E.cellY(st, aim.sim.cell.r), 1.3); this.ghost.material.color.copy(col); this.ghost.rotation.z = t; }
        else this.ghost.visible = false;
      } else this.ghost.visible = false;
      // Funki
      this.funkiJump = Math.max(0, (this.funkiJump || 0) - dt * 1.6);
      const jump = Math.sin(Math.min(1, 1 - this.funkiJump) * Math.PI) * (this.funkiJump > 0 ? 1.2 : 0);
      this.funki.position.y = -E.LAUNCH.y + 0.1 + (reduced ? 0 : Math.sin(t * 2) * 0.18) + jump;
      this.funki.rotation.z = reduced ? 0 : Math.sin(t * 1.4) * 0.08;
      const lookX = Math.cos(ang) * 0.25; this.funki.rotation.y = -lookX;
    } else {
      // Menü: schwebende Kugeln
      if (!this.menuBubbles.length) for (let i = 0; i < 26; i++) this.menuBubbles.push({ x: Math.random() * 60 - 19, y: Math.random() * 40 - 6, c: i % 6, s: 0.6 + Math.random() * 1.2, sp: 0.6 + Math.random() * 1.2, ph: Math.random() * 6 });
      for (const b of this.menuBubbles) {
        const y = reduced ? b.y : ((b.y - t * b.sp + 60) % 46) - 8, x = b.x + (reduced ? 0 : Math.sin(t * 0.5 + b.ph) * 1.2);
        this.drawBubble(x, -y + E.FIELD_H - 8, -2, b.s, { k: 'n', c: b.c }, null, t);
      }
      this.ghost.visible = false;
    }
    // fallende/platzende Kugeln
    for (let i = this.fxList.length - 1; i >= 0; i--) {
      const f = this.fxList[i]; f.t += dt;
      if (f.t >= f.life) { this.fxList.splice(i, 1); continue; }
      if (f.type === 'pop') { const s = 1 + f.t / f.life * 0.45; this.drawBubble(f.x, f.y, 0.4, s * (1 - Math.pow(f.t / f.life, 3)), f.cell, null, t); }
      else {
        f.vy += 55 * dt; f.x += f.vx * dt; f.y += f.vy * dt;
        if (f.x < E.R || f.x > E.W - E.R) f.vx = -f.vx;
        if (f.y > E.FIELD_H + 1) { this.burst(f.x, E.FIELD_H, this.cellColor(f.cell), 5, 4); this.fxList.splice(i, 1); continue; }
        this.drawBubble(f.x, f.y, 0.3, 0.95, f.cell, null, t + f.rot);
      }
    }
    for (const k in this.I) { const m = this.I[k]; m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; }
    for (const k in this.icons) this.icons[k].instanceMatrix.needsUpdate = true;
    // Druckwellen, Blitze
    for (const w of this.waves) if (w.visible) { const u = w.userData; u.t += dt; const k = u.t / 0.45; if (k >= 1) { w.visible = false; continue; } w.scale.setScalar(0.5 + k * (u.rad * 2.6 + 1)); w.material.opacity = 0.9 * (1 - k); }
    for (const b of this.bars) if (b.visible) { const u = b.userData; u.t += dt; const k = u.t / 0.35; if (k >= 1) { b.visible = false; continue; } b.material.opacity = 0.9 * (1 - k); b.scale.y = 1.4 + k * 1.5; }
    // Partikel
    const P = this.P;
    for (let i = 0; i < P.n; i++) {
      P.life[i] -= dt;
      if (P.life[i] <= 0) { const j = --P.n; for (const a of ['x', 'y', 'z', 'vx', 'vy', 'life', 'max', 'r', 'g', 'b', 'grav']) P[a][i] = P[a][j]; i--; continue; }
      P.vy[i] += P.grav[i] * dt; P.x[i] += P.vx[i] * dt; P.y[i] += P.vy[i] * dt; P.vx[i] *= 0.985;
      const f = P.life[i] / P.max[i];
      this.pPos[i * 3] = P.x[i]; this.pPos[i * 3 + 1] = P.y[i]; this.pPos[i * 3 + 2] = 0;
      this.pCol[i * 3] = P.r[i] * f; this.pCol[i * 3 + 1] = P.g[i] * f; this.pCol[i * 3 + 2] = P.b[i] * f;
    }
    const pg = this.points.geometry; pg.setDrawRange(0, P.n); pg.attributes.position.needsUpdate = true; pg.attributes.color.needsUpdate = true;
    if (!reduced && this.anims) for (const a of this.anims) a(t);
    // Kamera-Wackeln
    this.shake = Math.max(0, this.shake - dt * 2.5);
    const sh = reduced ? 0 : this.shake;
    this.camera.position.x = sh ? (Math.random() - 0.5) * sh : 0; this.camera.position.y = sh ? (Math.random() - 0.5) * sh : 0;
    this.gl.render(this.scene, this.camera);
    this.autoQuality(dt);
  };
  Renderer.prototype.autoQuality = function (dt) {
    if (this.quality !== 'auto') return;
    this.frameAvg = this.frameAvg * 0.95 + dt * 1000 * 0.05;
    if (this.frameAvg > 24 && this.pr > 1) { this.slowTime += dt; if (this.slowTime > 2.5) { this.setPixelRatio(Math.max(1, this.pr - 0.5)); this.slowTime = 0; } }
    else this.slowTime = 0;
  };
  Renderer.prototype.setPixelRatio = function (p) { this.pr = p; this.gl.setPixelRatio(p); this.resize(); };
  Renderer.prototype.setQuality = function (q) {
    this.quality = q; const dpr = root.devicePixelRatio || 1;
    this.setPixelRatio(q === 'niedrig' ? 1 : Math.min(dpr, 2));
  };
  root.FBRenderer = Renderer;
})(typeof self !== 'undefined' ? self : this);
