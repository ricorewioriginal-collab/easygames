/* AnMaCha – Der Podcast – 3D-Welt: Renderer, echte 3D-Modelle (Quaternius-Gebäude + Menschen, Kenney-Bäume, CC0),
   Himmel je Tageszeit, Stadt mit Funkhaus und Sendemast, Partikel, Kamera. Spiellogik der Stadt steht in play.js. */
(function (root) {
  'use strict';
  const AMC = root.AMC = root.AMC || {};
  const U = AMC.U;
  const W = AMC.World = { ready: false, hosts: {}, quality: 2 };
  let T;

  // ------------------------------------------------------------------ Texturen aus Canvas
  function canvasTex(w, h, draw, repeat) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h);
    const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = W.renderer ? Math.min(8, W.renderer.capabilities.getMaxAnisotropy()) : 1;
    if (repeat) { t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
    return t;
  }
  function speckle(g, w, h, base, var_, n) { g.fillStyle = base; g.fillRect(0, 0, w, h); for (let i = 0; i < n; i++) { const v = (Math.random() - 0.5) * var_; g.fillStyle = 'rgba(' + (v > 0 ? '255,255,255,' + v : '0,0,0,' + -v) + ')'; g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2); } }
  /** AnMaCha-Logo (oranger Play-Kreis + Schriftzug) als Textur. */
  W.logoTex = function (opts) {
    const o = Object.assign({ w: 1024, h: 320, bg: '#111218', glow: false, sub: '' }, opts);
    return canvasTex(o.w, o.h, (g, w, h) => {
      if (o.bg) { g.fillStyle = o.bg; roundRect(g, 0, 0, w, h, h * 0.18); g.fill(); }
      const r = h * 0.32, cx = h * 0.5, cy = h * (o.sub ? 0.44 : 0.5);
      g.fillStyle = '#ff8a1e'; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#fff'; g.beginPath(); g.moveTo(cx - r * 0.32, cy - r * 0.48); g.lineTo(cx + r * 0.52, cy); g.lineTo(cx - r * 0.32, cy + r * 0.48); g.closePath(); g.fill();
      g.font = '700 ' + Math.round(h * 0.42) + 'px Fredoka, "Segoe UI", system-ui, sans-serif'; g.textBaseline = 'middle';
      g.fillStyle = '#ffffff'; g.fillText('AnMa', h * 0.95, cy + h * 0.02); const mw = g.measureText('AnMa').width;
      g.fillStyle = '#ff8a1e'; g.fillText('Cha', h * 0.95 + mw, cy + h * 0.02);
      if (o.sub) { g.font = '600 ' + Math.round(h * 0.13) + 'px Fredoka, system-ui, sans-serif'; g.fillStyle = '#ffd7ae'; g.fillText(o.sub, h * 0.97, h * 0.82); }
    });
  };
  function roundRect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  W.roundRect = roundRect;
  W.textTex = function (lines, o) {
    o = Object.assign({ w: 512, h: 256, bg: '#14161f', fg: '#fff', accent: '#ff8a1e', size: 64 }, o);
    return canvasTex(o.w, o.h, (g, w, h) => {
      g.fillStyle = o.bg; roundRect(g, 0, 0, w, h, 18); g.fill(); g.strokeStyle = o.accent; g.lineWidth = 8; roundRect(g, 6, 6, w - 12, h - 12, 14); g.stroke();
      g.textAlign = 'center'; g.textBaseline = 'middle';
      lines.forEach((l, i) => { g.fillStyle = i === 0 ? o.fg : o.accent; g.font = '700 ' + (i === 0 ? o.size : Math.round(o.size * 0.55)) + 'px Fredoka, system-ui, sans-serif'; g.fillText(l, w / 2, h / 2 + (i - (lines.length - 1) / 2) * o.size * 0.95); });
    });
  };
  W.glowTex = null;

  // ------------------------------------------------------------------ Start: Renderer + Modelle laden
  W.init = async function (canvas, progress) {
    T = root.THREE;
    const touch = U.isTouch(), q = AMC.Save.data.settings.quality;
    W.quality = q === 'low' ? 0 : q === 'mid' ? 1 : q === 'high' ? 2 : (touch ? 1 : 2);
    const R = W.renderer = new T.WebGLRenderer({ canvas, antialias: W.quality > 0, powerPreference: 'high-performance', alpha: false });
    R.outputEncoding = T.sRGBEncoding; R.toneMapping = T.ACESFilmicToneMapping; R.toneMappingExposure = 1.08;
    R.shadowMap.enabled = W.quality > 0; R.shadowMap.type = W.quality > 1 ? T.PCFSoftShadowMap : T.PCFShadowMap;
    W.camera = new T.PerspectiveCamera(60, 1, 0.1, 900);
    W.resize(); root.addEventListener('resize', W.resize);
    W.glowTex = canvasTex(64, 64, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
    W.glowTex.encoding = T.LinearEncoding;

    // Modelle (alle CC0): Quaternius-Gebäude, Kenney-Bäume/Brunnen/Felsen, easygames-Figuren
    const files = ['bld_2Story_Mat', 'bld_1Story_Sign_Mat', 'bld_2Story_GableRoof_Mat', 'bld_2Story_Slim_Mat', 'tree', 'tree-high-round', 'fountain-round', 'rock-large'];
    let done = 0; const total = files.length + 4, tick = l => { done++; progress && progress(done / total, l); };
    const loader = new T.GLTFLoader();
    W.models = {};
    await Promise.all(files.map(f => new Promise(res => loader.load('models/' + f + '.glb', g => { W.models[f] = bake(g.scene); tick('3D-Modelle'); res(); }, null, () => { tick('3D-Modelle'); res(); }))));
    // CC0-Modelle (Kenney via @netforge/asset-library-files): Hochhäuser, Autos, Schiffe, Natur
    await Promise.all(W.CC0.map(f => new Promise(res => loader.load('models/cc0/' + f + '.glb', g => { W.models[f] = bake(g.scene); res(); }, null, () => res())))); tick('Stadt & Welten');
    W.kit = root.EasyFiguren ? root.EasyFiguren.create({ THREE: T, base: '../figuren/', srgb: true }) : null;
    if (W.kit) {
      await W.kit.load().catch(() => {}); tick('Menschen & Bewegungen');
      for (const id of ['andrew', 'marco', 'rico']) { W.hosts[id] = await makeHost(id); if (id !== 'rico') tick(AMC.Data.HOSTS[id].name); }
    } else { tick(); tick(); tick(); }
    // Katze (Quaternius „Ultimate Monsters“, CC0) – mit eigenen Bewegungen für Kapitel 10
    await new Promise(res => loader.load('models/cat.glb', g => { W.cat = g; res(); }, null, () => res()));
    W.particles = new Particles();
    W.ready = true;
  };
  /** Figur neu bauen (Outfit gewechselt); bleibt an derselben Stelle der Szene */
  W.rebuildHost = async function (id) {
    if (!W.kit) return;
    const old = W.hosts[id], parent = old && old.root.parent, pos = old && old.root.position.clone(), rot = old ? old.root.rotation.y : 0;
    const f = await makeHost(id);
    if (old) { if (parent) parent.remove(old.root); old.dispose && old.dispose(); }
    W.hosts[id] = f;
    if (parent) { parent.add(f.root); f.root.position.copy(pos); f.root.rotation.y = rot; f.play('idle'); }
    return f;
  };
  W.resize = function () {
    if (!W.renderer) return;
    const w = root.innerWidth, h = root.innerHeight, dpr = Math.min(root.devicePixelRatio || 1, [1, 1.5, 2][W.quality]);
    W.renderer.setPixelRatio(dpr); W.renderer.setSize(w, h, false);
    W.camera.aspect = w / h; W.camera.fov = w / h < 0.8 ? 72 : 60; W.camera.updateProjectionMatrix();
  };

  // GLB → Teile (Geometrie in Modellraum gebacken, je Material) für Instanzen; Maße normiert
  function bake(scene) {
    scene.updateMatrixWorld(true);
    const parts = [], box = new T.Box3();
    scene.traverse(o => { if (o.isMesh) { const g = o.geometry.clone(); g.applyMatrix4(o.matrixWorld); parts.push({ g, m: o.material }); g.computeBoundingBox(); box.union(g.boundingBox); } });
    const size = box.getSize(new T.Vector3());
    return { parts, box, size };
  }
  W.CC0 = ['skyscraper_a', 'skyscraper_b', 'skyscraper_c', 'building_a', 'building_b', 'building_c', 'building_d', 'building_e', 'sedan', 'taxi', 'van', 'police_car', 'delivery_van', 'cargo_ship', 'satellite_dish', 'tree_palm', 'tent', 'bush', 'campfire', 'crate', 'barrels'];
  /** Einzelnes Modell als Gruppe (geteilte Geometrie), Boden-Mitte im Ursprung; s = Zielgröße (Breite/Länge oder mit byHeight Höhe). */
  W.prop = function (name, s, opts) {
    const M = W.models[name]; if (!M) return null; opts = opts || {};
    const k = s ? s / (opts.byHeight ? M.size.y : Math.max(M.size.x, M.size.z)) : 1, g = new T.Group(), inner = new T.Group();
    inner.scale.setScalar(k); inner.position.set(-(M.box.min.x + M.box.max.x) / 2 * k, -M.box.min.y * k, -(M.box.min.z + M.box.max.z) / 2 * k);
    M.parts.forEach(pt => { const m = new T.Mesh(pt.g, pt.m); m.castShadow = opts.shadow !== false; m.receiveShadow = true; inner.add(m); });
    g.add(inner); g.userData.size = M.size.clone().multiplyScalar(k); return g;
  };
  /** Instanzen eines Modells setzen: list = [{x,z,rot,s, y}] (s = Zielbreite in m). Liefert Maße je Eintrag. */
  W.instances = function (group, name, list, opts) {
    const M = W.models[name]; if (!M || !list.length) return [];
    opts = opts || {};
    const mats = [], dims = [], m4 = new T.Matrix4(), q = new T.Quaternion(), up = new T.Vector3(0, 1, 0);
    list.forEach(p => {
      const s = (p.s || 1) / (opts.byHeight ? M.size.y : Math.max(M.size.x, M.size.z));
      q.setFromAxisAngle(up, p.rot || 0);
      const off = new T.Vector3(-(M.box.min.x + M.box.max.x) / 2 * s, -M.box.min.y * s + (p.y || 0), -(M.box.min.z + M.box.max.z) / 2 * s).applyQuaternion(q);
      m4.compose(new T.Vector3(p.x + off.x, off.y, p.z + off.z), q, new T.Vector3(s, s, s));
      mats.push(m4.clone());
      const c = Math.abs(Math.cos(p.rot || 0)), sn = Math.abs(Math.sin(p.rot || 0));
      dims.push({ w: (M.size.x * c + M.size.z * sn) * s, d: (M.size.x * sn + M.size.z * c) * s, h: M.size.y * s + (p.y || 0) });
    });
    M.parts.forEach(pt => {
      const im = new T.InstancedMesh(pt.g, pt.m, mats.length);
      mats.forEach((m, i) => im.setMatrixAt(i, m)); im.instanceMatrix.needsUpdate = true;
      im.castShadow = opts.shadow !== false; im.receiveShadow = true; group.add(im);
    });
    return dims;
  };

  // ------------------------------------------------------------------ Andrew & Marco (echte animierte 3D-Menschen) mit Polo-Logo
  async function makeHost(id) {
    const H = AMC.Data.HOSTS[id], D = AMC.Data, oid = (AMC.Save.data.outfit || {})[id] || 'std';
    const of = D.OUTFITS ? D.OUTFITS.find(o => o.id === oid) : null;
    const fig = await AMC.People.make(W.kit, Object.assign({}, H.look, of ? of.look : {}));
    fig.root.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = false; } });
    fig.hostId = id;
    return fig;
  }
  W.makeFan = async function (seed, over) {
    if (!W.kit) return null;
    const r = U.seeded(seed * 977 + 13), pick = a => a[Math.floor(r() * a.length)];
    const w = r() < 0.5;
    const look = {
      body: w ? 'w' : 'm', skin: pick(['#f6d3b8', '#e8b88a', '#c68e62', '#8d5a3b', '#f1c9a5', '#5e3b26']),
      hair: { style: w ? pick(['long', 'bob', 'bun', 'pony', 'curly']) : pick(['short', 'buzz', 'curly', 'spike', 'bald']), color: pick(['#2a1a10', '#6b4528', '#d9b26a', '#a33b1f', '#111', '#8a8a8a']) },
      top: pick(['#ff8a1e', '#2f6bff', '#e64a7a', '#22b07d', '#f4f4f4', '#8a4dff', '#ffd23f', '#1d1d24']), topStyle: pick(['tee', 'long', 'tank']),
      bottom: pick(['#2c3554', '#3a4f78', '#1d1d24', '#6b5a45', '#7d2b3a']), bottomStyle: pick(['pants', 'pants', 'shorts']), shoes: pick(['#f4f4f8', '#1b1b1b', '#c0392b']),
      beard: !w && r() < 0.35 ? pick(['#2a1a10', '#6b4528']) : undefined, hat: r() < 0.2 ? { type: 'cap', color: pick(['#ff8a1e', '#1d1d24', '#2f6bff']) } : undefined
    };
    if (over) { if (over.top) look.top = over.top; if (over.hat) look.hat = over.hat; }
    look.build = w ? 0.9 : 0.95 + r() * 0.12; look.belly = w ? 0 : r() * 0.8; look.eyes = pick(['#4b6b8a', '#5a3a22', '#3d5a3a', '#6a4a2a']);
    const f = await AMC.People.make(W.kit, look); f.root.traverse(o => { if (o.isMesh) o.castShadow = W.quality > 1; }); return f;
  };

  /** Porträt-Bild einer Figur (für Dialoge). */
  W.portrait = function (fig) {
    try {
      const R = W.renderer, sc = new T.Scene(), cam = new T.PerspectiveCamera(28, 1, 0.05, 20), rt = new T.WebGLRenderTarget(192, 192, { encoding: T.sRGBEncoding });
      const parent = fig.root.parent, p0 = fig.root.position.clone(), r0 = fig.root.rotation.y;
      sc.add(new T.HemisphereLight(0xfff3e6, 0x403040, 1.3)); const d = new T.DirectionalLight(0xffffff, 1.6); d.position.set(1, 2, 3); sc.add(d);
      const rim = new T.DirectionalLight(0xff9a40, 1.4); rim.position.set(-2, 1, -2); sc.add(rim);
      fig.root.position.set(0, 0, 0); fig.root.rotation.y = 0.25; sc.add(fig.root); fig.update(0.01); fig.root.updateMatrixWorld(true);
      const head = new T.Vector3(); (fig.bones.Head || fig.bones.head || fig.root).getWorldPosition(head);
      cam.position.set(0.18, head.y + 0.04, 1.05); cam.lookAt(0, head.y - 0.03, 0);
      R.setRenderTarget(rt); R.setClearColor(0x000000, 0); R.clear(); R.render(sc, cam);
      const px = new Uint8Array(192 * 192 * 4); R.readRenderTargetPixels(rt, 0, 0, 192, 192, px); R.setRenderTarget(null);
      const c = document.createElement('canvas'); c.width = c.height = 192; const g = c.getContext('2d'), img = g.createImageData(192, 192);
      for (let y = 0; y < 192; y++) img.data.set(px.subarray((191 - y) * 192 * 4, (192 - y) * 192 * 4), y * 192 * 4);
      g.putImageData(img, 0, 0); rt.dispose();
      sc.remove(fig.root); fig.root.position.copy(p0); fig.root.rotation.y = r0; if (parent) parent.add(fig.root);
      return c.toDataURL();
    } catch (e) { return ''; }
  };

  // ------------------------------------------------------------------ Himmel je Stimmung
  const SKIES = {
    day: { top: 0x2f7cf0, hor: 0xbfe0ff, bot: 0x9fc6e8, sun: 0xfff1d6, sunI: 2.7, hemi: [0xdcefff, 0x4d6b3a, 0.95], fog: 0xbfe0ff, fogD: [70, 260], exp: 1.05, sunPos: [60, 90, 40], stars: 0 },
    sunset: { top: 0x27306e, hor: 0xff9358, bot: 0x7a4a6a, sun: 0xffa060, sunI: 2.3, hemi: [0xffc6a0, 0x3a2a40, 0.8], fog: 0xd98366, fogD: [60, 240], exp: 1.0, sunPos: [-90, 26, -40], stars: 0.15 },
    night: { top: 0x040714, hor: 0x1c2a5c, bot: 0x0a0f22, sun: 0x9fb8ff, sunI: 0.9, hemi: [0x5068b0, 0x10101a, 0.55], fog: 0x121a3a, fogD: [40, 200], exp: 1.15, sunPos: [-40, 70, 30], stars: 1, lamps: true },
    xmas: { top: 0x0b1530, hor: 0x5a6fa8, bot: 0x2a3456, sun: 0xcfe0ff, sunI: 1.2, hemi: [0x9fb4e8, 0x303850, 0.75], fog: 0x6a7cab, fogD: [30, 170], exp: 1.12, sunPos: [-40, 60, 30], stars: 0.5, lamps: true, snow: true },
    party: { top: 0x12052a, hor: 0x6a1e7a, bot: 0x1a0a2a, sun: 0xd0a0ff, sunI: 0.8, hemi: [0x8a5ad0, 0x200a20, 0.65], fog: 0x2a0f40, fogD: [40, 190], exp: 1.2, sunPos: [40, 70, -30], stars: 0.8, lamps: true, neon: true },
    festival: { top: 0x1b2258, hor: 0xff7a4a, bot: 0x4a2a4a, sun: 0xffb070, sunI: 2.0, hemi: [0xffc0a0, 0x302040, 0.8], fog: 0xc9705a, fogD: [60, 240], exp: 1.05, sunPos: [-80, 30, 60], stars: 0.3, lamps: true },
    studio: { top: 0x0c0d14, hor: 0x161824, bot: 0x0c0d14, sun: 0xffe0c0, sunI: 1.4, hemi: [0xffe6d0, 0x201a30, 0.6], fog: 0x0c0d14, fogD: [30, 90], exp: 1.1, sunPos: [3, 8, 6], stars: 0 }
  };
  W.SKIES = SKIES;
  W.makeSky = function (scene, name) {
    const S = SKIES[name] || SKIES.day;
    const g = new T.SphereGeometry(600, 32, 16);
    const m = new T.ShaderMaterial({
      side: T.BackSide, depthWrite: false, fog: false,
      uniforms: { top: { value: new T.Color(S.top) }, hor: { value: new T.Color(S.hor) }, bot: { value: new T.Color(S.bot) }, sunDir: { value: new T.Vector3(...S.sunPos).normalize() }, sunC: { value: new T.Color(S.sun) }, stars: { value: S.stars || 0 } },
      vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'uniform vec3 top,hor,bot,sunC,sunDir; uniform float stars; varying vec3 vP;' +
        'float h(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,45.164)))*43758.5453); }' +
        'void main(){ float y=vP.y; vec3 c = y>0.0 ? mix(hor, top, pow(clamp(y,0.0,1.0),0.55)) : mix(hor, bot, clamp(-y*4.0,0.0,1.0));' +
        ' float s = max(dot(vP, sunDir),0.0); c += sunC*pow(s,350.0)*1.4 + sunC*pow(s,8.0)*0.18;' +
        ' if(stars>0.0 && y>0.05){ vec3 q=floor(vP*320.0); float st=step(0.9975,h(q)); c += vec3(st)*stars*smoothstep(0.05,0.4,y); }' +
        ' gl_FragColor = vec4(c,1.0); }'
    });
    const mesh = new T.Mesh(g, m); mesh.renderOrder = -10; mesh.frustumCulled = false; scene.add(mesh);
    scene.fog = new T.Fog(S.fog, S.fogD[0], S.fogD[1]);
    scene.background = new T.Color(S.fog);
    const hemi = new T.HemisphereLight(S.hemi[0], S.hemi[1], S.hemi[2]); scene.add(hemi);
    const sun = new T.DirectionalLight(S.sun, S.sunI); sun.position.set(...S.sunPos); sun.castShadow = W.quality > 0;
    const sz = W.quality > 1 ? 2048 : 1024; sun.shadow.mapSize.set(sz, sz);
    const c = sun.shadow.camera; c.left = -34; c.right = 34; c.top = 34; c.bottom = -34; c.near = 1; c.far = 260; sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.03;
    scene.add(sun); scene.add(sun.target);
    return { sky: mesh, sun, hemi, S };
  };

  // ------------------------------------------------------------------ Partikel (Funken, Explosionen, Konfetti)
  class Particles {
    constructor() {
      this.n = 260; this.list = []; this.scene = null;
      const g = new T.BufferGeometry(); this.pos = new Float32Array(this.n * 3); this.col = new Float32Array(this.n * 3); this.size = new Float32Array(this.n);
      g.setAttribute('position', new T.BufferAttribute(this.pos, 3)); g.setAttribute('color', new T.BufferAttribute(this.col, 3)); g.setAttribute('size', new T.BufferAttribute(this.size, 1));
      const m = new T.ShaderMaterial({
        transparent: true, depthWrite: false, blending: T.AdditiveBlending, uniforms: { map: { value: W.glowTex }, scale: { value: 420 } },
        vertexShader: 'attribute float size; attribute vec3 color; varying vec3 vC; uniform float scale; void main(){ vC=color; vec4 mv = modelViewMatrix*vec4(position,1.0); gl_PointSize = size*scale/ -mv.z; gl_Position = projectionMatrix*mv; }',
        fragmentShader: 'uniform sampler2D map; varying vec3 vC; void main(){ vec4 t = texture2D(map, gl_PointCoord); gl_FragColor = vec4(vC*t.a*1.6, t.a); }'
      });
      this.points = new T.Points(g, m); this.points.frustumCulled = false;
      for (let i = 0; i < this.n; i++) this.list.push({ life: 0, x: 0, y: -999, z: 0, vx: 0, vy: 0, vz: 0, r: 1, g: 1, b: 1, s: 0.3, grav: 0, max: 1 });
      this.i = 0;
    }
    attach(scene) { if (this.points.parent) this.points.parent.remove(this.points); scene.add(this.points); }
    burst(x, y, z, color, n, o) {
      o = o || {}; const c = new T.Color(color);
      for (let k = 0; k < n; k++) {
        const p = this.list[this.i = (this.i + 1) % this.n], sp = o.speed || 5, a = Math.random() * Math.PI * 2, e = (Math.random() - 0.2) * Math.PI * 0.6;
        Object.assign(p, { x, y, z, vx: Math.cos(a) * Math.cos(e) * sp * (0.4 + Math.random()), vy: Math.sin(e) * sp * (0.6 + Math.random()) + (o.up || 2), vz: Math.sin(a) * Math.cos(e) * sp * (0.4 + Math.random()), r: c.r, g: c.g, b: c.b, s: (o.size || 0.35) * (0.6 + Math.random() * 0.8), grav: o.grav == null ? 9 : o.grav, life: (o.life || 0.8) * (0.6 + Math.random() * 0.6) });
        p.max = p.life;
      }
    }
    update(dt) {
      for (let i = 0; i < this.n; i++) {
        const p = this.list[i];
        if (p.life > 0) { p.life -= dt; p.vy -= p.grav * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.vx *= 0.98; p.vz *= 0.98; }
        const k = p.life > 0 ? p.life / p.max : 0;
        this.pos[i * 3] = p.x; this.pos[i * 3 + 1] = k > 0 ? p.y : -999; this.pos[i * 3 + 2] = p.z;
        this.col[i * 3] = p.r * k; this.col[i * 3 + 1] = p.g * k; this.col[i * 3 + 2] = p.b * k; this.size[i] = p.s * (0.4 + k * 0.6);
      }
      const g = this.points.geometry; g.attributes.position.needsUpdate = true; g.attributes.color.needsUpdate = true; g.attributes.size.needsUpdate = true;
    }
  }

  // ------------------------------------------------------------------ Bausteine für Requisiten
  const matCache = new Map();
  /** Farbe aus sRGB-Hex in den linearen Arbeitsraum (Renderer gibt sRGB aus). */
  W.lin = c => new T.Color(c).convertSRGBToLinear();
  W.mat = function (color, o) {
    o = o || {}; const k = color + '|' + JSON.stringify(o);
    if (matCache.has(k)) return matCache.get(k);
    const m = new T.MeshStandardMaterial({ color: W.lin(color), roughness: o.r == null ? 0.7 : o.r, metalness: o.m || 0, emissive: W.lin(o.e || 0x000000), emissiveIntensity: o.ei == null ? 1 : o.ei, transparent: !!o.t, opacity: o.t || 1, map: o.map || null, side: o.side || T.FrontSide });
    matCache.set(k, m); return m;
  };
  W.box = (w, h, d, mat, x, y, z, parent, shadow) => { const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat); m.position.set(x || 0, y || 0, z || 0); m.castShadow = shadow !== false; m.receiveShadow = true; if (parent) parent.add(m); return m; };
  W.cyl = (rt, rb, h, mat, x, y, z, parent, seg) => { const m = new T.Mesh(new T.CylinderGeometry(rt, rb, h, seg || 16), mat); m.position.set(x || 0, y || 0, z || 0); m.castShadow = true; m.receiveShadow = true; if (parent) parent.add(m); return m; };
  W.glow = (color, size, parent, x, y, z) => { const s = new T.Sprite(new T.SpriteMaterial({ map: W.glowTex, color, blending: T.AdditiveBlending, depthWrite: false, transparent: true })); s.scale.set(size, size, 1); s.position.set(x || 0, y || 0, z || 0); if (parent) parent.add(s); return s; };

  /** Studio-Mikrofon mit Arm und Pop-Schutz. */
  W.mic = function (parent, x, y, z, rot) {
    const g = new T.Group(), dark = W.mat(0x1a1b22, { r: 0.35, m: 0.6 }), mesh = W.mat(0x2c2e38, { r: 0.4, m: 0.8 });
    W.cyl(0.05, 0.05, 0.04, dark, 0, 0, 0, g);
    const arm1 = W.cyl(0.012, 0.012, 0.42, dark, 0, 0.2, 0, g); arm1.rotation.z = 0.25;
    const arm2 = W.cyl(0.012, 0.012, 0.42, dark, -0.12, 0.42, 0.14, g); arm2.rotation.x = 1.1;
    const body = W.cyl(0.045, 0.04, 0.2, mesh, -0.12, 0.52, 0.34, g); body.rotation.x = 1.35;
    W.cyl(0.048, 0.048, 0.02, W.mat(0xff8a1e, { r: 0.4, e: 0x401800 }), -0.12, 0.535, 0.29, g).rotation.x = 1.35;
    const pop = new T.Mesh(new T.CircleGeometry(0.08, 24), W.mat(0x111111, { t: 0.55, side: T.DoubleSide })); pop.position.set(-0.12, 0.56, 0.47); g.add(pop);
    g.position.set(x, y, z); g.rotation.y = rot || 0; parent.add(g); return g;
  };
  /** Großes AnMaCha-Schild (leuchtend). */
  W.sign = function (parent, tex, w, h, x, y, z, rot, glow) {
    const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false }));
    m.position.set(x, y, z); m.rotation.y = rot || 0; parent.add(m);
    if (glow) { const b = new T.Mesh(new T.PlaneGeometry(w * 1.04, h * 1.08), W.mat(0x0b0b10, { r: 0.4 })); b.position.copy(m.position); b.rotation.y = m.rotation.y; b.translateZ(-0.03); parent.add(b); }
    return m;
  };
  W.canvasTex = canvasTex; W.speckle = speckle;

  // ------------------------------------------------------------------ Kamera (Verfolgerkamera mit Kollision)
  W.cam = { yaw: Math.PI, pitch: 0.38, dist: 7.5, tx: 0, ty: 0, tz: 0, shake: 0 };
  W.updateCamera = function (dt, target, solid) {
    const C = W.cam, I = AMC.Input;
    C.yaw -= I.look.x; C.pitch = U.clamp(C.pitch + I.look.y, -0.15, 1.25);
    if (I.zoom) { C.dist = U.clamp(C.dist + I.zoom * 0.8, 3.5, 13); I.zoom = 0; }
    C.tx = U.damp(C.tx, target.x, 12, dt); C.ty = U.damp(C.ty, target.y + 1.6, 9, dt); C.tz = U.damp(C.tz, target.z, 12, dt);
    let d = C.dist;
    const dx = Math.sin(C.yaw) * Math.cos(C.pitch), dy = Math.sin(C.pitch), dz = Math.cos(C.yaw) * Math.cos(C.pitch);
    if (solid) for (let s = 0.6; s < d; s += 0.35) { if (solid(C.tx + dx * s, C.ty + dy * s, C.tz + dz * s)) { d = Math.max(1.4, s - 0.4); break; } }
    C.cur = C.cur == null ? d : (d < C.cur ? d : U.damp(C.cur, d, 4, dt));
    const sh = C.shake > 0 && AMC.Save.data.settings.shake ? C.shake : 0; C.shake = Math.max(0, C.shake - dt * 2.5);
    const cam = W.camera;
    cam.position.set(C.tx + dx * C.cur + (Math.random() - 0.5) * sh, Math.max(0.4, C.ty + dy * C.cur) + (Math.random() - 0.5) * sh, C.tz + dz * C.cur);
    cam.lookAt(C.tx, C.ty, C.tz);
  };
})(typeof window !== 'undefined' ? window : globalThis);
