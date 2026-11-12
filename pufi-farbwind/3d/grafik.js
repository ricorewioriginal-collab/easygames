/* Pufi 3D – Grafik: Renderer, Themen, prozedurale Texturen, Modelle (alle eigenen Figuren), Himmel, Wasser, Gras, Partikel. */
(function (root) {
  'use strict';
  const T = root.THREE;
  const G = {};
  // Farben aus CSS-Schreibweise sind sRGB: für korrekte Beleuchtung in linearen Raum umrechnen (sonst wirkt alles blass)
  if (!T.Color.prototype.__lin) { const ss = T.Color.prototype.setStyle; T.Color.prototype.setStyle = function (st) { ss.call(this, st); return this.convertSRGBToLinear(); }; T.Color.prototype.__lin = 1; }
  const TAU = Math.PI * 2;
  // ---------- Themen ----------
  G.THEMES = {
    wiese: { skyTop: '#4fa3ff', skyMid: '#a9dcff', skyBot: '#fff1d6', sun: '#fff1cf', sunI: 1.25, hemiS: '#cfe8ff', hemiG: '#6a8a4a', hemiI: 0.75, fog: '#bfe3ff', fogN: 55, fogF: 230,
      fluid: 'wasser', fluidY: -2, deep: '#1e7fb0', shallow: '#4fd0d8', grass: '#79c95a', grass2: '#a8e070', cliff: '#b58a5e', cliff2: '#8a6244', music: 'wiese', sunDir: [0.5, 0.8, 0.35], grassOn: 1 },
    abend: { skyTop: '#5b5bd6', skyMid: '#ff9fb0', skyBot: '#ffd59a', sun: '#ffd2a8', sunI: 1.15, hemiS: '#ffc7d6', hemiG: '#5a5a7a', hemiI: 0.75, fog: '#f2b0c0', fogN: 50, fogF: 220,
      fluid: 'wasser', fluidY: -2, deep: '#3a3f9a', shallow: '#e58fb5', grass: '#6fc06a', grass2: '#c2e07a', cliff: '#a8786a', cliff2: '#7a5258', music: 'abend', sunDir: [-0.6, 0.45, -0.3], grassOn: 1 },
    klippe: { skyTop: '#3f8ee8', skyMid: '#ffd79a', skyBot: '#ffe9c2', sun: '#ffe2a0', sunI: 1.3, hemiS: '#ffe5b8', hemiG: '#8a6a3a', hemiI: 0.7, fog: '#ffdcae', fogN: 55, fogF: 230,
      fluid: 'wasser', fluidY: -2, deep: '#1d6f9a', shallow: '#59c9c4', grass: '#a6c84f', grass2: '#e0d06a', cliff: '#e0a64a', cliff2: '#b0702e', music: 'klippe', sunDir: [0.7, 0.6, 0.2], grassOn: 1 },
    wolken: { skyTop: '#8a7cff', skyMid: '#ffc6ea', skyBot: '#ffeefa', sun: '#fff0ff', sunI: 1.15, hemiS: '#ffe0f7', hemiG: '#b09ad8', hemiI: 0.9, fog: '#f6d6f2', fogN: 45, fogF: 200,
      fluid: 'wolken', fluidY: -3, deep: '#f3d9ff', shallow: '#ffffff', grass: '#f6f0ff', grass2: '#ffd9f4', cliff: '#d9c8f2', cliff2: '#b3a0de', music: 'wolken', sunDir: [0.4, 0.7, 0.5], grassOn: 0 },
    glut: { skyTop: '#2a1440', skyMid: '#a8344a', skyBot: '#ff9a4a', sun: '#ffb070', sunI: 1.0, hemiS: '#ff9a7a', hemiG: '#3a1a1a', hemiI: 0.65, fog: '#7a2f3a', fogN: 35, fogF: 170,
      fluid: 'lava', fluidY: -1, deep: '#c92a00', shallow: '#ffb020', grass: '#5a4a52', grass2: '#7a5a5a', cliff: '#5a3e44', cliff2: '#3a2630', music: 'glut', sunDir: [0.3, 0.7, -0.4], grassOn: 0 },
    burg: { skyTop: '#120c30', skyMid: '#4a2a7a', skyBot: '#9a6ad0', sun: '#c9b0ff', sunI: 0.95, hemiS: '#9a8ad8', hemiG: '#2a1a3a', hemiI: 0.75, fog: '#3a2560', fogN: 35, fogF: 170,
      fluid: 'nebel', fluidY: -6, deep: '#2a1a4a', shallow: '#7a5ab0', grass: '#6a7aa0', grass2: '#8a9ac0', cliff: '#6a6080', cliff2: '#40385a', music: 'burg', sunDir: [-0.4, 0.75, 0.3], grassOn: 0 },
    eis: { skyTop: '#3a7ad8', skyMid: '#bfe4ff', skyBot: '#f2fbff', sun: '#f4fbff', sunI: 1.3, hemiS: '#e0f2ff', hemiG: '#7a9ab8', hemiI: 0.85, fog: '#d8ecff', fogN: 50, fogF: 210,
      fluid: 'wasser', fluidY: -2, deep: '#1a5a9a', shallow: '#9fe6ff', grass: '#f4fbff', grass2: '#d8f0ff', cliff: '#9ab8d8', cliff2: '#5a7aa8', music: 'eis', sunDir: [0.45, 0.6, 0.45], grassOn: 0 },
    dschungel: { skyTop: '#2f8fd0', skyMid: '#a8f0c0', skyBot: '#fff8c8', sun: '#fff4c0', sunI: 1.2, hemiS: '#d8ffd0', hemiG: '#3a6a3a', hemiI: 0.8, fog: '#b8e8c0', fogN: 40, fogF: 190,
      fluid: 'wasser', fluidY: -2, deep: '#0f6a5a', shallow: '#4fd0a0', grass: '#4fb048', grass2: '#8ad85a', cliff: '#8a6a4a', cliff2: '#5a4430', music: 'dschungel', sunDir: [0.3, 0.85, 0.3], grassOn: 1 },
    kristall: { skyTop: '#1a1650', skyMid: '#3a6ac0', skyBot: '#8ae0ff', sun: '#c8f4ff', sunI: 1.0, hemiS: '#a0d8ff', hemiG: '#3a2a6a', hemiI: 0.85, fog: '#3a4a9a', fogN: 35, fogF: 175,
      fluid: 'nebel', fluidY: -6, deep: '#1a2a6a', shallow: '#5ac8ff', grass: '#8ab0e8', grass2: '#c0a8ff', cliff: '#6a6ab8', cliff2: '#3a3a80', music: 'kristall', sunDir: [-0.3, 0.8, 0.4], grassOn: 0 },
    nacht: { skyTop: '#0a0a2a', skyMid: '#2a2a6a', skyBot: '#6a4a9a', sun: '#b8c8ff', sunI: 0.9, hemiS: '#8a9ae0', hemiG: '#2a2040', hemiI: 0.8, fog: '#2a2a5a', fogN: 40, fogF: 185,
      fluid: 'wasser', fluidY: -2, deep: '#0a1a4a', shallow: '#4a6ad8', grass: '#4a8a7a', grass2: '#7ac0a0', cliff: '#5a5a8a', cliff2: '#2a2a50', music: 'nacht', sunDir: [0.5, 0.7, -0.3], grassOn: 1 }
  };
  // ---------- Renderer ----------
  G.init = function (canvas, quality) {
    const hi = quality !== 'niedrig';
    const r = new T.WebGLRenderer({ canvas, antialias: hi, powerPreference: 'high-performance', alpha: false });
    r.outputEncoding = T.sRGBEncoding; r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = 1.08;
    r.shadowMap.enabled = quality !== 'niedrig'; r.shadowMap.type = T.PCFSoftShadowMap;
    G.renderer = r; G.quality = quality;
    G.scene = new T.Scene();
    G.camera = new T.PerspectiveCamera(55, 16 / 9, 0.1, 600);
    G.hemi = new T.HemisphereLight(0xffffff, 0x444444, 0.7); G.scene.add(G.hemi);
    G.sun = new T.DirectionalLight(0xffffff, 1.2); G.sun.castShadow = r.shadowMap.enabled;
    const sm = quality === 'hoch' ? 2048 : 1024; G.sun.shadow.mapSize.set(sm, sm);
    const sc = G.sun.shadow.camera; sc.left = -22; sc.right = 22; sc.top = 22; sc.bottom = -22; sc.near = 1; sc.far = 120; G.sun.shadow.bias = -0.0006; G.sun.shadow.normalBias = 0.03;
    G.scene.add(G.sun); G.scene.add(G.sun.target);
    G.fill = new T.DirectionalLight(0xbfd8ff, 0.25); G.fill.position.set(-1, 0.5, -1); G.scene.add(G.fill);
    G.scene.fog = new T.Fog(0xffffff, 50, 220);
    G.makeTextures();
    G.sky = makeSky(); G.scene.add(G.sky);
    G.fluid = makeFluid(); G.scene.add(G.fluid);
    G.particles = new Particles(700); G.scene.add(G.particles.points);
    G.puffs = new Particles(300, true); G.scene.add(G.puffs.points);
    return r;
  };
  G.setTheme = function (name) {
    const th = G.THEMES[name] || G.THEMES.wiese; G.theme = th; G.themeName = name;
    const c = s => new T.Color(s);
    G.hemi.color = c(th.hemiS); G.hemi.groundColor = c(th.hemiG); G.hemi.intensity = th.hemiI;
    G.sun.color = c(th.sun); G.sun.intensity = th.sunI;
    G.scene.fog.color = c(th.fog); G.scene.fog.near = th.fogN; G.scene.fog.far = th.fogF;
    G.renderer.setClearColor(c(th.fog));
    const su = G.sky.material.uniforms; su.top.value = lin(th.skyTop); su.mid.value = lin(th.skyMid); su.bot.value = lin(th.skyBot); su.sunDir.value.set(...th.sunDir).normalize(); su.sunCol.value = lin(th.sun);
    const fu = G.fluid.material.uniforms; fu.deep.value = lin(th.deep); fu.shallow.value = lin(th.shallow); fu.skyc.value = lin(th.skyMid);
    fu.mode.value = th.fluid === 'lava' ? 1 : th.fluid === 'wolken' ? 2 : th.fluid === 'nebel' ? 3 : 0; G.fluid.position.y = th.fluidY;
    G.mats.grassTop.color = c(th.grass); G.mats.cliff.color = c(th.cliff); G.mats.cliffDark.color = c(th.cliff2);
    G.mats.blade.color = c(th.grass2);
  };
  function lin(s) { return new T.Color(s); }
  G.resize = function (w, h, pr) {
    G.renderer.setPixelRatio(pr); G.renderer.setSize(w, h, false); G.camera.aspect = w / h; G.camera.updateProjectionMatrix();
    G.particles.mat.uniforms.scale.value = h * pr * 0.5; G.puffs.mat.uniforms.scale.value = h * pr * 0.5;
  };
  // ---------- Texturen ----------
  function canvasTex(size, draw, repeat = true) {
    const cv = document.createElement('canvas'); cv.width = cv.height = size; const x = cv.getContext('2d'); draw(x, size);
    const t = new T.CanvasTexture(cv); t.encoding = T.sRGBEncoding; if (repeat) t.wrapS = t.wrapT = T.RepeatWrapping; t.anisotropy = 4; return t;
  }
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  G.makeTextures = function () {
    const M = G.mats = {};
    const grass = canvasTex(256, (x, s) => {
      x.fillStyle = '#d8d8d8'; x.fillRect(0, 0, s, s);
      for (let i = 0; i < 2600; i++) { const v = 170 + rnd() * 85 | 0; x.fillStyle = `rgb(${v},${v},${v})`; const px = rnd() * s, py = rnd() * s; x.fillRect(px, py, 2 + rnd() * 3, 1 + rnd() * 5); }
      for (let i = 0; i < 26; i++) { x.fillStyle = ['#fff6a8', '#ffd0ea', '#ffffff', '#c9e6ff'][i % 4]; const px = rnd() * s, py = rnd() * s; x.beginPath(); x.arc(px, py, 2.2, 0, TAU); x.fill(); }
    });
    const cliff = canvasTex(256, (x, s) => {
      for (let y = 0; y < s; y += 4) { const v = 200 + Math.sin(y * 0.11) * 25 + rnd() * 25 | 0; x.fillStyle = `rgb(${v},${v},${v})`; x.fillRect(0, y, s, 4); }
      for (let i = 0; i < 160; i++) { const v = 150 + rnd() * 60 | 0; x.fillStyle = `rgba(${v},${v},${v},.8)`; x.beginPath(); x.ellipse(rnd() * s, rnd() * s, 4 + rnd() * 12, 3 + rnd() * 6, 0, 0, TAU); x.fill(); }
      for (let i = 0; i < 40; i++) { x.strokeStyle = 'rgba(120,120,120,.5)'; x.lineWidth = 1.5; x.beginPath(); const px = rnd() * s, py = rnd() * s; x.moveTo(px, py); x.lineTo(px + rnd() * 30 - 15, py + rnd() * 20); x.stroke(); }
    });
    const wood = canvasTex(256, (x, s) => {
      for (let i = 0; i < 4; i++) { const v = 210 + rnd() * 30 | 0; x.fillStyle = `rgb(${v},${v * 0.92 | 0},${v * 0.85 | 0})`; x.fillRect(0, i * 64, s, 62); x.fillStyle = 'rgba(80,50,30,.5)'; x.fillRect(0, i * 64 + 62, s, 2); }
      for (let i = 0; i < 90; i++) { x.strokeStyle = 'rgba(140,100,70,.35)'; x.lineWidth = 1; x.beginPath(); const y = rnd() * s; x.moveTo(0, y); x.bezierCurveTo(s * 0.3, y + rnd() * 6, s * 0.6, y - rnd() * 6, s, y); x.stroke(); }
      for (let i = 0; i < 8; i++) { x.fillStyle = 'rgba(90,60,40,.6)'; x.beginPath(); x.arc(rnd() * s, (i % 4) * 64 + 10, 3, 0, TAU); x.arc(rnd() * s, (i % 4) * 64 + 52, 3, 0, TAU); x.fill(); }
    });
    const stone = canvasTex(256, (x, s) => {
      x.fillStyle = '#bbb'; x.fillRect(0, 0, s, s);
      for (let r = 0; r < 8; r++) for (let c = 0; c < 4; c++) { const v = 175 + rnd() * 60 | 0; x.fillStyle = `rgb(${v},${v},${v})`; const off = r % 2 ? 32 : 0; x.beginPath(); if (x.roundRect) x.roundRect(c * 64 + off + 2, r * 32 + 2, 60, 28, 6); else x.rect(c * 64 + off + 2, r * 32 + 2, 60, 28); x.fill(); }
    });
    const soft = canvasTex(64, (x, s) => { const g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.5, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, s, s); }, false);
    const shadow = canvasTex(64, (x, s) => { const g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2); g.addColorStop(0, 'rgba(0,0,0,.55)'); g.addColorStop(0.6, 'rgba(0,0,0,.3)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, s, s); }, false);
    const cloud = canvasTex(128, (x, s) => { for (let i = 0; i < 14; i++) { const px = s * (0.2 + rnd() * 0.6), py = s * (0.35 + rnd() * 0.35), r = s * (0.12 + rnd() * 0.16); const g = x.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.beginPath(); x.arc(px, py, r, 0, TAU); x.fill(); } }, false);
    const qmark = canvasTex(128, (x, s) => { x.clearRect(0, 0, s, s); x.font = '900 96px Trebuchet MS, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineWidth = 10; x.strokeStyle = '#7a4aa0'; x.strokeText('?', s / 2, s / 2 + 4); x.fillStyle = '#ffe27a'; x.fillText('?', s / 2, s / 2 + 4); }, false);
    const eggIcon = canvasTex(128, (x, s) => { x.fillStyle = '#fff6e8'; x.fillRect(0, 0, s, s); x.fillStyle = '#ff9cc7'; x.beginPath(); x.ellipse(s / 2, s / 2 + 4, 26, 34, 0, 0, TAU); x.fill(); x.fillStyle = '#7fe0a0'; [[50, 50], [76, 66], [58, 84]].forEach(([a, b]) => { x.beginPath(); x.arc(a, b, 7, 0, TAU); x.fill(); }); x.strokeStyle = '#d0a070'; x.lineWidth = 8; x.strokeRect(4, 4, s - 8, s - 8); }, false);
    const spots = canvasTex(128, (x, s) => { x.fillStyle = '#fffaf0'; x.fillRect(0, 0, s, s); for (let i = 0; i < 9; i++) { x.fillStyle = '#ffffff'; x.fillStyle = 'rgba(255,255,255,1)'; x.fillStyle = '#e0e0e0'; x.beginPath(); x.arc(rnd() * s, rnd() * s, 8 + rnd() * 6, 0, TAU); x.fill(); } });
    G.tex = { grass, cliff, wood, stone, soft, shadow, cloud, qmark, eggIcon, spots };
    const std = (o) => new T.MeshStandardMaterial(Object.assign({ roughness: 0.85, metalness: 0 }, o));
    M.grassTop = std({ map: grass, bumpMap: grass, bumpScale: 0.04, roughness: 0.95 });
    M.cliff = std({ map: cliff, bumpMap: cliff, bumpScale: 0.08, vertexColors: true });
    M.cliffDark = std({ map: cliff, roughness: 0.95 });
    M.holz = std({ map: wood, bumpMap: wood, bumpScale: 0.05, color: '#e3a86a', roughness: 0.7 });
    M.stein = std({ map: stone, bumpMap: stone, bumpScale: 0.06, color: '#c9c3d6', roughness: 0.8 });
    M.honig = std({ map: stone, color: '#ffc04a', roughness: 0.45, emissive: '#5a2a00', emissiveIntensity: 0.2 });
    M.broeckel = std({ map: stone, color: '#ffb84a', roughness: 0.5, emissive: '#4a2000', emissiveIntensity: 0.25 });
    M.wolke = std({ color: '#ffffff', roughness: 1, emissive: '#ffe6f6', emissiveIntensity: 0.25 });
    M.lift = std({ map: stone, color: '#9fd0ff', roughness: 0.4, metalness: 0.2, emissive: '#2050a0', emissiveIntensity: 0.15 });
    M.eis = std({ map: stone, color: '#cfeeff', roughness: 0.12, metalness: 0.1, emissive: '#3a7ab0', emissiveIntensity: 0.15 });
    M.kristall = std({ color: '#b89aff', roughness: 0.15, metalness: 0.2, emissive: '#5a3ab0', emissiveIntensity: 0.35 });
    M.moos = std({ map: wood, color: '#7ac060', roughness: 0.9 });
    M.pilzhut = std({ map: G.tex.spots || stone, color: '#ff8a6a', roughness: 0.6 });
    M.farb = new T.MeshStandardMaterial({ color: '#ff7ac0', roughness: 0.3, emissive: '#ff3aa0', emissiveIntensity: 0.35, transparent: true, opacity: 0.35 });
    M.blade = new T.MeshStandardMaterial({ color: '#a8e070', roughness: 0.9, side: T.DoubleSide, vertexColors: true });
    M.blade.onBeforeCompile = sh => {
      sh.uniforms.uTime = G.timeU; sh.vertexShader = 'uniform float uTime;\n' + sh.vertexShader.replace('#include <begin_vertex>',
        '#include <begin_vertex>\nfloat hh = position.y / 0.55; vec4 wp0 = instanceMatrix * vec4(0.,0.,0.,1.);\ntransformed.x += sin(uTime*2.1 + wp0.x*0.45 + wp0.z*0.3) * 0.13 * hh * hh;\ntransformed.z += cos(uTime*1.7 + wp0.x*0.3 - wp0.z*0.2) * 0.09 * hh * hh;');
    };
    G.timeU = { value: 0 };
    M.shadow = new T.MeshBasicMaterial({ map: shadow, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
    // Retro-Kacheln (Jestan, „Retro Platformer Tilesets“) – pixelig, ohne Glättung
    M.retro = []; for (let i = 0; i < 20; i++) M.retro.push(std({ color: '#ffffff', roughness: 0.75 }));
    const img = new Image(); img.onload = () => {
      for (let i = 0; i < 20; i++) {
        const cv = document.createElement('canvas'); cv.width = cv.height = 48; const x = cv.getContext('2d'); x.drawImage(img, (i % 8) * 48, Math.floor(i / 8) * 48, 48, 48, 0, 0, 48, 48);
        const t = new T.CanvasTexture(cv); t.magFilter = T.NearestFilter; t.minFilter = T.NearestFilter; t.generateMipmaps = false; t.wrapS = t.wrapT = T.RepeatWrapping; t.encoding = T.sRGBEncoding;
        M.retro[i].map = t; M.retro[i].needsUpdate = true;
      }
      G.retroReady = true;
    };
    img.src = 'assets/retro-bloecke.png';
  };
  // ---------- Rim-Licht (weicher Rand wie bei modernen Konsolenspielen) ----------
  G.rim = function (mat, color = '#ffffff', power = 2.6, strength = 0.55) {
    mat.onBeforeCompile = sh => {
      sh.fragmentShader = sh.fragmentShader.replace('#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>\n{ float rimF = 1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0); totalEmissiveRadiance += vec3(${new T.Color(color).toArray().map(v => v.toFixed(3)).join(',')}) * pow(rimF, ${power.toFixed(2)}) * ${strength.toFixed(2)}; }`);
    };
    mat.customProgramCacheKey = () => 'rim' + color + power + strength;
    return mat;
  };
  const toon = (color, o = {}) => { const { rimC, rimS, ...m } = o; return G.rim(new T.MeshStandardMaterial(Object.assign({ color, roughness: 0.55, metalness: 0 }, m)), rimC || '#ffffff', 2.6, rimS !== undefined ? rimS : 0.45); };
  G.toon = toon;
  // ---------- Geometrie-Helfer ----------
  G.roundBox = function (w, h, d, rr = 0.18) {
    const bv = Math.min(rr, h * 0.3, w * 0.25, d * 0.25), sw = w / 2 - bv, sd = d / 2 - bv, cr = Math.min(0.2, sw * 0.5, sd * 0.5);
    const s = new T.Shape(); s.moveTo(-sw + cr, -sd); s.lineTo(sw - cr, -sd); s.quadraticCurveTo(sw, -sd, sw, -sd + cr); s.lineTo(sw, sd - cr); s.quadraticCurveTo(sw, sd, sw - cr, sd); s.lineTo(-sw + cr, sd); s.quadraticCurveTo(-sw, sd, -sw, sd - cr); s.lineTo(-sw, -sd + cr); s.quadraticCurveTo(-sw, -sd, -sw + cr, -sd);
    const g = new T.ExtrudeGeometry(s, { depth: Math.max(0.01, h - 2 * bv), bevelEnabled: true, bevelThickness: bv, bevelSize: bv, bevelSegments: 3, curveSegments: 4 });
    g.rotateX(-Math.PI / 2); g.translate(0, -(h - bv), 0);
    // Texturen in Weltgröße (1 Kachel ≈ 2 m)
    const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 2, uv.getY(i) / 2);
    return g;
  };
  G.boxUV = function (w, h, d, tile = 1.5) {
    const g = new T.BoxGeometry(w, h, d), uv = g.attributes.uv;
    const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
    for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * dims[f][0] / tile, uv.getY(i) * dims[f][1] / tile); }
    g.translate(0, -h / 2, 0); return g;
  };
  // Schwebende Insel: Graskappe + gedrehter Felskörper mit Farbverlauf
  G.island = function (r, h, theme) {
    const grp = new T.Group();
    const pts = [], n = 14;
    pts.push(new T.Vector2(0.001, 0));
    pts.push(new T.Vector2(r - 0.35, 0)); pts.push(new T.Vector2(r - 0.08, -0.08)); pts.push(new T.Vector2(r, -0.35));
    for (let i = 1; i <= n; i++) { const f = i / n, y = -0.35 - f * (h - 0.35); const w = r * (1.02 - 0.15 * f) * (1 - Math.pow(f, 2.2) * 0.92) + Math.sin(f * 9) * 0.12 * r / 8; pts.push(new T.Vector2(Math.max(0.15, w), y)); }
    const lg = new T.LatheGeometry(pts, Math.max(24, Math.min(64, r * 5 | 0)));
    const cols = [], pos = lg.attributes.position, uv = lg.attributes.uv, th = G.THEMES[theme] || G.THEMES.wiese;
    const top = new T.Color(th.grass), mid = new T.Color('#ffffff'), bot = new T.Color(th.cliff2).multiplyScalar(1.4);
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i); let c;
      if (y > -0.45) c = top.clone().multiplyScalar(1.6); else { const f = Math.min(1, -y / h); c = mid.clone().lerp(bot, f); }
      cols.push(c.r, c.g, c.b); uv.setXY(i, uv.getX(i) * r * TAU / 6, uv.getY(i) * h / 3);
    }
    lg.setAttribute('color', new T.Float32BufferAttribute(cols, 3));
    const body = new T.Mesh(lg, G.mats.cliff); body.castShadow = false; body.receiveShadow = true; grp.add(body);
    const cap = new T.CircleGeometry(r - 0.3, Math.max(24, Math.min(64, r * 5 | 0))); cap.rotateX(-Math.PI / 2);
    const cu = cap.attributes.uv, cp = cap.attributes.position; for (let i = 0; i < cu.count; i++) cu.setXY(i, cp.getX(i) / 4, cp.getZ(i) / 4);
    const capM = new T.Mesh(cap, G.mats.grassTop); capM.position.y = 0.005; capM.receiveShadow = true; grp.add(capM);
    return grp;
  };
  G.grassField = function (spots, count) {
    if (!count) return null;
    const bg = new T.PlaneGeometry(0.09, 0.55, 1, 3); bg.translate(0, 0.275, 0);
    const pos = bg.attributes.position, cols = []; for (let i = 0; i < pos.count; i++) { const f = pos.getY(i) / 0.55; cols.push(0.35 + 0.65 * f, 0.45 + 0.55 * f, 0.3 + 0.7 * f); const x = pos.getX(i); pos.setX(i, x * (1 - f * 0.85)); }
    bg.setAttribute('color', new T.Float32BufferAttribute(cols, 3));
    const im = new T.InstancedMesh(bg, G.mats.blade, count); const m4 = new T.Matrix4(), q = new T.Quaternion(), s = new T.Vector3(), p = new T.Vector3(), e = new T.Euler();
    let k = 0; const tot = spots.reduce((a, o) => a + o.r * o.r, 0) || 1;
    spots.forEach(o => {
      const n = Math.round(count * o.r * o.r / tot);
      for (let i = 0; i < n && k < count; i++) {
        const a = rnd() * TAU, rr = Math.sqrt(rnd()) * (o.r - 0.5); p.set(o.x + Math.cos(a) * rr, o.y, o.z + Math.sin(a) * rr);
        e.set((rnd() - 0.5) * 0.3, rnd() * TAU, (rnd() - 0.5) * 0.3); q.setFromEuler(e); const sc = 0.6 + rnd() * 0.9; s.set(1, sc, 1);
        m4.compose(p, q, s); im.setMatrixAt(k, m4); k++;
      }
    });
    im.count = k; im.instanceMatrix.needsUpdate = true; im.frustumCulled = false; return im;
  };
  // ---------- Himmel ----------
  function makeSky() {
    const m = new T.ShaderMaterial({
      side: T.BackSide, depthWrite: false, fog: false,
      uniforms: { top: { value: new T.Color() }, mid: { value: new T.Color() }, bot: { value: new T.Color() }, sunDir: { value: new T.Vector3(0, 1, 0) }, sunCol: { value: new T.Color() } },
      vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position,1.); gl_Position = p.xyww; }',
      fragmentShader: `uniform vec3 top,mid,bot,sunCol; uniform vec3 sunDir; varying vec3 vD;
        void main(){ float y = vD.y; vec3 c = y > 0.0 ? mix(mid, top, pow(clamp(y,0.,1.),0.6)) : mix(mid, bot, clamp(-y*3.0,0.,1.));
          float s = max(dot(normalize(vD), normalize(sunDir)),0.0); c += sunCol * (pow(s, 600.0)*2.5 + pow(s, 12.0)*0.35);
          gl_FragColor = vec4(c,1.0);
          #include <tonemapping_fragment>
          #include <encodings_fragment>
        }`
    });
    const s = new T.Mesh(new T.SphereGeometry(450, 32, 16), m); s.frustumCulled = false; s.renderOrder = -10; return s;
  }
  // ---------- Wasser / Lava / Wolkenmeer ----------
  function makeFluid() {
    const m = new T.ShaderMaterial({
      fog: true, transparent: false,
      uniforms: T.UniformsUtils.merge([T.UniformsLib.fog, { time: { value: 0 }, deep: { value: new T.Color() }, shallow: { value: new T.Color() }, skyc: { value: new T.Color() }, mode: { value: 0 } }]),
      vertexShader: `varying vec3 vW; uniform float time; uniform float mode;
        #include <fog_pars_vertex>
        void main(){ vec3 p = position; vec4 w = modelMatrix * vec4(p,1.0);
          w.y += (mode > 1.5 ? 0.6 : 0.18) * sin(w.x*0.18 + time*0.9) * cos(w.z*0.15 - time*0.7);
          vW = w.xyz; vec4 mvPosition = viewMatrix * w; gl_Position = projectionMatrix * mvPosition;
          #include <fog_vertex>
        }`,
      fragmentShader: `varying vec3 vW; uniform float time; uniform vec3 deep, shallow, skyc; uniform float mode;
        #include <fog_pars_fragment>
        void main(){
          float n = sin(vW.x*0.35+time*1.1)*sin(vW.z*0.31-time*0.9) + 0.5*sin((vW.x+vW.z)*0.9+time*2.0) + 0.25*sin(vW.x*1.7-vW.z*1.3+time*2.7);
          vec3 V = normalize(cameraPosition - vW); float fres = pow(1.0 - clamp(V.y,0.0,1.0), 3.0);
          vec3 c;
          if (mode > 0.5 && mode < 1.5) { float f = 0.5 + 0.5*sin(vW.x*0.25 + n*1.4 + time*0.6); c = mix(deep, shallow, f*f) * (1.3 + 0.4*n); c += vec3(1.0,0.7,0.2) * smoothstep(1.2,1.7,n) * 0.8; }
          else if (mode > 1.5) { float f = 0.5 + 0.25*n; c = mix(deep, shallow, f); c = mix(c, skyc, fres*0.5); }
          else { c = mix(shallow, deep, clamp(0.55 + 0.22*n, 0.0, 1.0)); c = mix(c, skyc, fres*0.55);
            float sp = smoothstep(0.93, 1.0, sin(vW.x*2.1+time*3.0)*sin(vW.z*1.7-time*2.4)); c += sp*0.5; }
          gl_FragColor = vec4(c, 1.0);
          #include <tonemapping_fragment>
          #include <encodings_fragment>
          #include <fog_fragment>
        }`
    });
    const g = new T.PlaneGeometry(900, 900, 90, 90); g.rotateX(-Math.PI / 2);
    const w = new T.Mesh(g, m); w.receiveShadow = false; return w;
  }
  // Wolken im Hintergrund
  G.cloudLayer = function (n, y0, spread) {
    const grp = new T.Group(); const mat = new T.SpriteMaterial({ map: G.tex.cloud, transparent: true, depthWrite: false, fog: true, opacity: 0.9 });
    for (let i = 0; i < n; i++) { const s = new T.Sprite(mat); const a = rnd() * TAU, r = 90 + rnd() * spread; s.position.set(Math.cos(a) * r, y0 + rnd() * 40, Math.sin(a) * r - 40); const sc = 30 + rnd() * 50; s.scale.set(sc, sc * 0.5, 1); s.userData.v = 0.5 + rnd(); grp.add(s); }
    return grp;
  };
  // ---------- Partikel ----------
  function Particles(n, normal) {
    const g = new T.BufferGeometry(); this.n = n; this.pos = new Float32Array(n * 3); this.col = new Float32Array(n * 4); this.size = new Float32Array(n);
    this.vel = new Float32Array(n * 3); this.life = new Float32Array(n); this.max = new Float32Array(n); this.grav = new Float32Array(n); this.s0 = new Float32Array(n); this.a0 = new Float32Array(n); this.i = 0;
    g.setAttribute('position', new T.BufferAttribute(this.pos, 3)); g.setAttribute('col', new T.BufferAttribute(this.col, 4)); g.setAttribute('size', new T.BufferAttribute(this.size, 1));
    this.mat = new T.ShaderMaterial({
      transparent: true, depthWrite: false, blending: normal ? T.NormalBlending : T.AdditiveBlending, uniforms: { scale: { value: 400 } },
      vertexShader: 'attribute vec4 col; attribute float size; varying vec4 vC; uniform float scale; void main(){ vC = col; vec4 mv = modelViewMatrix * vec4(position,1.); gl_PointSize = size * scale / max(0.1,-mv.z); gl_Position = projectionMatrix * mv; }',
      fragmentShader: 'varying vec4 vC; void main(){ vec2 c = gl_PointCoord - 0.5; float d = length(c); float a = smoothstep(0.5, 0.0, d); if (a < 0.01) discard; gl_FragColor = vec4(vC.rgb, vC.a * a);\n#include <encodings_fragment>\n}'
    });
    this.points = new T.Points(g, this.mat); this.points.frustumCulled = false; this.geo = g;
  }
  Particles.prototype.emit = function (x, y, z, vx, vy, vz, life, size, r, g, b, a = 1, grav = 0) {
    const i = this.i; this.i = (this.i + 1) % this.n;
    this.pos[i * 3] = x; this.pos[i * 3 + 1] = y; this.pos[i * 3 + 2] = z; this.vel[i * 3] = vx; this.vel[i * 3 + 1] = vy; this.vel[i * 3 + 2] = vz;
    this.life[i] = life; this.max[i] = life; this.s0[i] = size; this.size[i] = size; this.col[i * 4] = r; this.col[i * 4 + 1] = g; this.col[i * 4 + 2] = b; this.col[i * 4 + 3] = a; this.a0[i] = a; this.grav[i] = grav;
  };
  Particles.prototype.update = function (dt) {
    for (let i = 0; i < this.n; i++) {
      if (this.life[i] <= 0) { if (this.size[i]) this.size[i] = 0; continue; }
      this.life[i] -= dt; const f = Math.max(0, this.life[i] / this.max[i]);
      this.vel[i * 3 + 1] -= this.grav[i] * dt;
      this.pos[i * 3] += this.vel[i * 3] * dt; this.pos[i * 3 + 1] += this.vel[i * 3 + 1] * dt; this.pos[i * 3 + 2] += this.vel[i * 3 + 2] * dt;
      this.size[i] = this.s0[i] * (0.3 + 0.7 * f); this.col[i * 4 + 3] = this.a0[i] * Math.min(1, f * 2.5);
    }
    this.geo.attributes.position.needsUpdate = true; this.geo.attributes.col.needsUpdate = true; this.geo.attributes.size.needsUpdate = true;
  };
  G.burst = function (x, y, z, n, color, speed = 4, size = 0.5, life = 0.7, grav = 6) {
    const c = new T.Color(color);
    for (let i = 0; i < n; i++) { const a = rnd() * TAU, u = rnd() * 2 - 1, s = speed * (0.4 + rnd() * 0.6), q = Math.sqrt(1 - u * u); G.particles.emit(x, y, z, Math.cos(a) * q * s, Math.abs(u) * s + speed * 0.3, Math.sin(a) * q * s, life * (0.6 + rnd() * 0.6), size * (0.6 + rnd() * 0.8), c.r, c.g, c.b, 1, grav); }
  };
  G.rainbow = function (x, y, z, n, speed = 5) { for (let i = 0; i < n; i++) { const c = new T.Color().setHSL(i / n, 0.9, 0.65); const a = i / n * TAU; G.particles.emit(x, y, z, Math.cos(a) * speed, 2 + rnd() * 3, Math.sin(a) * speed, 0.9, 0.7, c.r, c.g, c.b, 1, 5); } };
  G.dust = function (x, y, z, n, color = '#e8dcc8', speed = 2) { const c = new T.Color(color); for (let i = 0; i < n; i++) { const a = rnd() * TAU; G.puffs.emit(x + Math.cos(a) * 0.3, y + 0.1, z + Math.sin(a) * 0.3, Math.cos(a) * speed * (0.5 + rnd()), 0.6 + rnd(), Math.sin(a) * speed * (0.5 + rnd()), 0.5 + rnd() * 0.3, 0.7 + rnd() * 0.5, c.r, c.g, c.b, 0.55, -1); } };
  G.ringWave = function (x, y, z, r, color = '#ffffff', n = 28) { const c = new T.Color(color); for (let i = 0; i < n; i++) { const a = i / n * TAU; G.puffs.emit(x + Math.cos(a) * 0.4, y + 0.15, z + Math.sin(a) * 0.4, Math.cos(a) * r, 0.3, Math.sin(a) * r, 0.5, 0.9, c.r, c.g, c.b, 0.6, 0); } };

  // ---------- Figuren ----------
  const sph = (r, ws = 28, hs = 20) => new T.SphereGeometry(r, ws, hs);
  function mesh(g, m, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1, shadow = true) { const o = new T.Mesh(g, m); o.position.set(x, y, z); o.scale.set(sx, sy, sz); o.castShadow = shadow; return o; }
  function eye(r, pupil = '#2b2140', white = '#ffffff') {
    const g = new T.Group();
    g.add(mesh(sph(r, 20, 14), toon(white, { roughness: 0.25, rimS: 0.2 }), 0, 0, 0, 1, 1.15, 0.7, false));
    g.add(mesh(sph(r * 0.58, 16, 12), toon(pupil, { roughness: 0.2, rimS: 0.1 }), 0, -r * 0.05, r * 0.42, 1, 1.15, 0.6, false));
    g.add(mesh(sph(r * 0.2, 10, 8), new T.MeshBasicMaterial({ color: '#ffffff' }), r * 0.18, r * 0.3, r * 0.68, 1, 1, 1, false));
    return g;
  }
  G.eye = eye;
  // Pufi: rosafarbener Wolkendrache mit Blattkamm (eigene Figur), Tamo als Wolkentapir auf dem Rücken
  G.makePufi = function () {
    const root = new T.Group(), body = new T.Group(); root.add(body);
    const pink = toon('#f58fb4', { rimC: '#ffe0ef', rimS: 0.55 }), cream = toon('#fff0d8', { rimS: 0.3 }), blue = toon('#6f8fd0', { roughness: 0.4 }), leaf = toon('#9ed46e', { rimC: '#eaffc8' });
    const torso = mesh(sph(0.48), pink, 0, 0.62, 0, 1, 0.95, 0.92); body.add(torso);
    body.add(mesh(sph(0.36), cream, 0, 0.58, 0.2, 0.95, 0.95, 0.75));
    const head = new T.Group(); head.position.set(0, 1.18, 0.08); body.add(head);
    head.add(mesh(sph(0.42), pink, 0, 0, 0, 1, 0.95, 0.95));
    head.add(mesh(sph(0.3), pink, 0, -0.06, 0.34, 1.1, 0.85, 1));   // Schnauze
    head.add(mesh(sph(0.2), toon('#ffb3c9'), 0, -0.04, 0.58, 1.1, 0.8, 0.6));   // Nase
    const cheekL = mesh(sph(0.1, 12, 8), new T.MeshStandardMaterial({ color: '#ff7aa8', roughness: 0.6, transparent: true, opacity: 0.75 }), -0.3, -0.12, 0.3, 1, 0.6, 0.5, false), cheekR = cheekL.clone(); cheekR.position.x = 0.3; head.add(cheekL, cheekR);
    const eL = eye(0.12), eR = eye(0.12); eL.position.set(-0.17, 0.12, 0.33); eR.position.set(0.17, 0.12, 0.33); eL.rotation.y = -0.25; eR.rotation.y = 0.25; head.add(eL, eR);
    const crest = new T.Group(); crest.position.set(0, 0.36, -0.06); head.add(crest);
    [[-0.12, 0.05, -0.4], [0.1, 0.12, 0.35], [0, 0.0, -0.05]].forEach(([x, z, rz], i) => crest.add(mesh(sph(0.16, 14, 10), leaf, x, 0.1 + i * 0.03, z - 0.1, 0.55, 1.4, 0.35).rotateZ(rz)));
    const mouth = mesh(sph(0.1, 12, 8), toon('#8a2d50'), 0, -0.2, 0.52, 1.3, 0.55, 0.5, false); mouth.visible = false; head.add(mouth);
    const armL = mesh(sph(0.13, 12, 10), pink, -0.44, 0.72, 0.12, 0.8, 1.3, 0.8), armR = armL.clone(); armR.position.x = 0.44; body.add(armL, armR);
    const footL = mesh(sph(0.2, 16, 12), blue, -0.22, 0.12, 0.08, 1, 0.65, 1.35), footR = footL.clone(); footR.position.x = 0.22; root.add(footL, footR);
    const tail = mesh(new T.ConeGeometry(0.16, 0.55, 14), pink, 0, 0.42, -0.5); tail.rotation.x = -1.9; body.add(tail);
    // Tamo
    const tamo = G.makeTamo(); tamo.scale.setScalar(0.62); tamo.position.set(0, 1.05, -0.38); body.add(tamo);
    const tongue = mesh(new T.CylinderGeometry(0.06, 0.06, 1, 10), toon('#ff5f8f', { roughness: 0.3 }), 0, 0, 0, 1, 1, 1, false); tongue.rotation.x = Math.PI / 2; tongue.visible = false;
    const tip = mesh(sph(0.13, 14, 10), toon('#ff5f8f', { roughness: 0.3 }), 0, 0, 0, 1, 1, 1, false); tip.visible = false; root.add(tongue, tip);
    root.userData = { body, head, torso, eL, eR, armL, armR, footL, footR, tail, crest, mouth, cheekL, cheekR, tamo, tongue, tip };
    return root;
  };
  G.makeTamo = function () {
    const g = new T.Group(); const teal = toon('#7fd3c8', { rimC: '#e8fffb' }), light = toon('#c6f0df');
    g.add(mesh(sph(0.45), teal, 0, 0.4, 0, 1.15, 0.9, 1)); g.add(mesh(sph(0.3), light, 0, 0.33, 0.15, 1, 0.8, 0.8));
    g.add(mesh(sph(0.3), teal, 0, 0.75, 0.32, 1, 0.95, 0.95));
    g.add(mesh(new T.CylinderGeometry(0.08, 0.12, 0.3, 12), teal, 0, 0.66, 0.66).rotateX(1.2));
    const e1 = eye(0.08), e2 = eye(0.08); e1.position.set(-0.13, 0.84, 0.55); e2.position.set(0.13, 0.84, 0.55); g.add(e1, e2);
    g.add(mesh(sph(0.1, 12, 8), teal, -0.22, 1.02, 0.25, 0.6, 1.4, 0.5)); g.add(mesh(sph(0.1, 12, 8), teal, 0.22, 1.02, 0.25, 0.6, 1.4, 0.5));
    return g;
  };
  // Muffel: flauschiger Nebelball mit einem Auge
  const MUFF = ['#b58ae6', '#8ac0ff', '#ff9ab8', '#9fe08a'];
  G.makeMuffel = function (i = 0) {
    const g = new T.Group(); const col = toon(MUFF[i % 4], { rimC: '#ffffff', rimS: 0.7 });
    const b = mesh(new T.IcosahedronGeometry(0.5, 2), col, 0, 0.55, 0); g.add(b);
    for (let k = 0; k < 9; k++) { const a = k / 9 * TAU; g.add(mesh(sph(0.16, 10, 8), col, Math.cos(a) * 0.42, 0.55 + Math.sin(a * 2) * 0.15, Math.sin(a) * 0.42, 1, 1, 1)); }
    const e = eye(0.2); e.position.set(0, 0.65, 0.38); g.add(e);
    g.add(mesh(new T.ConeGeometry(0.08, 0.25, 8), toon('#fff3c8'), -0.2, 1.05, 0).rotateZ(0.4)); g.add(mesh(new T.ConeGeometry(0.08, 0.25, 8), toon('#fff3c8'), 0.2, 1.05, 0).rotateZ(-0.4));
    const f1 = mesh(sph(0.13, 10, 8), toon('#5a4a7a'), -0.2, 0.1, 0.1, 1, 0.6, 1.4), f2 = f1.clone(); f2.position.x = 0.2; g.add(f1, f2);
    g.userData = { body: b, f1, f2 }; return g;
  };
  G.makeFlatter = function () {
    const g = new T.Group(); const c = toon('#ffd36a'), w = toon('#ffb3e6', { transparent: true, opacity: 0.85, side: T.DoubleSide, rimS: 0.6 });
    g.add(mesh(sph(0.32), c, 0, 0, 0, 1, 0.9, 1.3));
    const e1 = eye(0.11), e2 = eye(0.11); e1.position.set(-0.13, 0.1, 0.3); e2.position.set(0.13, 0.1, 0.3); g.add(e1, e2);
    const wg = new T.CircleGeometry(0.5, 20); const wl = new T.Mesh(wg, w), wr = new T.Mesh(wg, w); wl.position.set(-0.45, 0.15, 0); wr.position.set(0.45, 0.15, 0); wl.rotation.y = wr.rotation.y = Math.PI / 2; g.add(wl, wr);
    g.add(mesh(new T.CylinderGeometry(0.02, 0.02, 0.35, 6), c, -0.1, 0.42, 0.15).rotateZ(0.3)); g.add(mesh(new T.CylinderGeometry(0.02, 0.02, 0.35, 6), c, 0.1, 0.42, 0.15).rotateZ(-0.3));
    g.userData = { wl, wr }; return g;
  };
  G.makeIgel = function () {
    const g = new T.Group(); const c = toon('#a03a5a', { rimC: '#ffb0c8' }), sp = toon('#fff0d0', { roughness: 0.3 });
    const core = mesh(new T.IcosahedronGeometry(0.55, 2), c, 0, 0.6, 0); g.add(core);
    const ico = new T.IcosahedronGeometry(0.55, 1), p = ico.attributes.position, seen = {};
    for (let i = 0; i < p.count; i++) { const v = new T.Vector3(p.getX(i), p.getY(i), p.getZ(i)), k = v.toArray().map(a => a.toFixed(2)).join(); if (seen[k]) continue; seen[k] = 1; const s = mesh(new T.ConeGeometry(0.1, 0.35, 8), sp, 0, 0, 0); s.position.copy(v.clone().multiplyScalar(1.05)); s.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), v.clone().normalize()); core.add(s); s.position.sub(new T.Vector3(0, 0, 0)); }
    const e1 = eye(0.12, '#2b2140', '#fff'), e2 = eye(0.12); e1.position.set(-0.17, 0.12, 0.47); e2.position.set(0.17, 0.12, 0.47); core.add(e1, e2);
    g.userData = { core }; return g;
  };
  G.makeSchnapp = function () {
    const g = new T.Group(); const stem = toon('#4fae6a'), head = toon('#ff6aa8', { rimC: '#ffe0f0' }), inner = toon('#7a1a40');
    g.add(mesh(new T.CylinderGeometry(0.1, 0.14, 1.2, 10), stem, 0, 0.6, 0));
    g.add(mesh(sph(0.3, 12, 8), stem, -0.3, 0.3, 0, 1.4, 0.3, 0.8)); g.add(mesh(sph(0.3, 12, 8), stem, 0.3, 0.5, 0, 1.4, 0.3, 0.8));
    const h = new T.Group(); h.position.y = 1.35; g.add(h);
    const top = mesh(sph(0.45, 20, 12, 0), head, 0, 0.05, 0, 1, 0.55, 1), bot = mesh(sph(0.45, 20, 12), head, 0, -0.05, 0, 1, 0.45, 1); h.add(top, bot);
    h.add(mesh(sph(0.36, 14, 10), inner, 0, 0, 0.05, 1, 0.3, 0.9));
    for (let i = 0; i < 6; i++) { const a = (i / 5 - 0.5) * 2.4; h.add(mesh(new T.ConeGeometry(0.05, 0.14, 6), toon('#ffffff'), Math.sin(a) * 0.32, -0.03, Math.cos(a) * 0.32).rotateX(Math.PI)); }
    for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; h.add(mesh(sph(0.12, 10, 8), toon('#fff3a0'), Math.cos(a) * 0.42, 0.18, Math.sin(a) * 0.42, 1, 0.6, 1)); }
    g.userData = { h, top, bot }; return g;
  };
  G.makeBoss = function (col = '#8a7ab8') {
    const g = new T.Group(); const c = toon(col, { rimC: '#e0d0ff', rimS: 0.6 }), dark = toon(new T.Color(col).multiplyScalar(0.55).getStyle());
    const body = new T.Group(); g.add(body);
    for (let i = 0; i < 14; i++) { const a = i / 14 * TAU; body.add(mesh(sph(1.0, 16, 12), c, Math.cos(a) * 1.6, 2.4 + Math.sin(a * 3) * 0.3, Math.sin(a) * 1.4, 1, 0.85, 1)); }
    body.add(mesh(sph(2.0, 32, 24), c, 0, 2.6, 0, 1, 0.9, 0.95));
    const core = mesh(sph(0.7, 24, 16), new T.MeshStandardMaterial({ color: '#ffe36a', emissive: '#ffb020', emissiveIntensity: 1.2, roughness: 0.2 }), 0, 2.1, 1.55, 1, 1, 0.6); body.add(core);
    const e1 = eye(0.38, '#3a0a3a', '#fff6d0'), e2 = eye(0.38, '#3a0a3a', '#fff6d0'); e1.position.set(-0.7, 3.4, 1.55); e2.position.set(0.7, 3.4, 1.55); body.add(e1, e2);
    const brow = toon('#3a2a5a'); body.add(mesh(new T.BoxGeometry(0.7, 0.14, 0.2), brow, -0.7, 3.9, 1.7).rotateZ(-0.35)); body.add(mesh(new T.BoxGeometry(0.7, 0.14, 0.2), brow, 0.7, 3.9, 1.7).rotateZ(0.35));
    for (let i = 0; i < 5; i++) { const a = (i / 4 - 0.5) * 1.6; body.add(mesh(new T.ConeGeometry(0.22, 0.8, 10), toon('#ffd36a', { metalness: 0.5, roughness: 0.3 }), Math.sin(a) * 1.2, 4.6 + Math.cos(a) * 0.1, Math.cos(a) * 0.2)); }
    const armL = mesh(sph(0.6, 16, 12), dark, -2.3, 2.0, 0.5, 0.8, 1.2, 0.8), armR = armL.clone(); armR.position.x = 2.3; body.add(armL, armR);
    g.userData = { body, core, armL, armR, e1, e2 }; return g;
  };
  // ---------- Gegenstände ----------
  G.coinGeo = new T.CylinderGeometry(0.42, 0.42, 0.1, 28); G.coinGeo.rotateX(Math.PI / 2);
  G.makeCoin = function (red) {
    const m = new T.MeshStandardMaterial({ color: red ? '#ff4f6f' : '#ffcf3a', metalness: 0.75, roughness: 0.25, emissive: red ? '#801028' : '#7a4a00', emissiveIntensity: 0.45 });
    const g = new T.Group(), c = mesh(G.coinGeo, m); g.add(c);
    const t = mesh(new T.TorusGeometry(0.3, 0.04, 8, 24), m, 0, 0, 0); g.add(t);
    if (red) g.add(mesh(sph(0.12, 12, 8), new T.MeshStandardMaterial({ color: '#fff', emissive: '#ff8aa0', emissiveIntensity: 0.6 }), 0, 0, 0.07, 1, 1, 0.4, false));
    return g;
  };
  G.makeFlower = function () {
    const g = new T.Group(), petals = new T.Group(); g.add(petals);
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU, c = new T.Color().setHSL(i / 6, 0.85, 0.66); petals.add(mesh(sph(0.26, 16, 10), toon('#' + c.getHexString(), { rimS: 0.5 }), Math.cos(a) * 0.36, Math.sin(a) * 0.36, 0, 1.15, 0.8, 0.45)); petals.children[i].rotation.z = a; }
    petals.add(mesh(sph(0.25, 20, 14), toon('#ffe57a', { emissive: '#7a5a00', emissiveIntensity: 0.4 }), 0, 0, 0.08, 1, 1, 0.7));
    const e1 = eye(0.06), e2 = eye(0.06); e1.position.set(-0.08, 0.05, 0.25); e2.position.set(0.08, 0.05, 0.25); petals.add(e1, e2);
    g.add(mesh(new T.CylinderGeometry(0.04, 0.05, 0.6, 6), toon('#5ab05a'), 0, -0.55, -0.05));
    g.userData = { petals }; return g;
  };
  const starShape = (() => { const s = new T.Shape(); for (let i = 0; i <= 10; i++) { const a = i / 10 * TAU + Math.PI / 2, r = i % 2 ? 0.17 : 0.4; i ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, Math.sin(a) * r); } return s; })();
  G.starGeo = new T.ExtrudeGeometry(starShape, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 2 }); G.starGeo.center();
  G.makeStar = function () { return mesh(G.starGeo, new T.MeshStandardMaterial({ color: '#fff07a', emissive: '#ffb000', emissiveIntensity: 0.7, metalness: 0.4, roughness: 0.3 })); };
  G.eggColors = ['#ff9cc7', '#8fdcff', '#a8e070', '#ffd77a', '#c9a0ff', '#ff9f80'];
  G.eggGeo = sph(0.28, 20, 14);
  G.makeEgg = function (i = 0) {
    const g = new T.Group(); const shell = mesh(G.eggGeo, toon('#fffaf0', { rimS: 0.35 }), 0, 0, 0, 1, 1.25, 1); g.add(shell);
    const sm = toon(G.eggColors[i % G.eggColors.length]); [[0.2, 0.1, 0.15], [-0.18, -0.05, 0.16], [0.02, 0.2, -0.22], [-0.05, -0.2, -0.2], [0.24, -0.12, -0.05]].forEach(([x, y, z]) => g.add(mesh(sph(0.075, 10, 8), sm, x, y, z, 1, 1, 0.5, false)));
    return g;
  };
  G.makeRing = function () {
    const g = new T.Group(); const m = new T.MeshStandardMaterial({ color: '#ffffff', emissive: '#ff8ac8', emissiveIntensity: 0.6, metalness: 0.3, roughness: 0.25 });
    const t = mesh(new T.TorusGeometry(1.3, 0.16, 16, 48), m); g.add(t);
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, c = new T.Color().setHSL(i / 12, 0.9, 0.65); g.add(mesh(sph(0.13, 10, 8), new T.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.6 }), Math.cos(a) * 1.3, Math.sin(a) * 1.3, 0, 1, 1, 1, false)); }
    g.userData = { m }; return g;
  };
  G.makeGoal = function () {
    const g = new T.Group(); const post = toon('#ffffff', { rimS: 0.4 }), petal = [];
    const arch = mesh(new T.TorusGeometry(2.0, 0.28, 18, 48, Math.PI), toon('#ff9cc7', { rimC: '#fff', emissive: '#501030', emissiveIntensity: 0.3 }), 0, 0, 0); arch.position.y = 1.2; g.add(arch);
    g.add(mesh(new T.CylinderGeometry(0.3, 0.38, 1.2, 16), post, -2, 0.6, 0)); g.add(mesh(new T.CylinderGeometry(0.3, 0.38, 1.2, 16), post, 2, 0.6, 0));
    for (let i = 0; i < 9; i++) { const a = i / 8 * Math.PI, c = new T.Color().setHSL(i / 9, 0.85, 0.65); const f = mesh(sph(0.3, 14, 10), toon('#' + c.getHexString()), Math.cos(a) * 2, 1.2 + Math.sin(a) * 2, 0.15, 1, 1, 0.6); g.add(f); petal.push(f); }
    const swirl = new T.Mesh(new T.CircleGeometry(1.75, 40, 0, Math.PI), new T.MeshBasicMaterial({ color: '#fff3fb', transparent: true, opacity: 0.35, side: T.DoubleSide, depthWrite: false })); swirl.position.y = 1.2; g.add(swirl);
    const base = new T.Mesh(new T.PlaneGeometry(3.5, 1.2), new T.MeshBasicMaterial({ color: '#fff3fb', transparent: true, opacity: 0.35, side: T.DoubleSide, depthWrite: false })); base.position.y = 0.6; g.add(base);
    g.userData = { petal, swirl }; return g;
  };
  G.makeTree = function (s = 1, theme) {
    const g = new T.Group(); const th = G.THEMES[theme] || G.THEMES.wiese;
    const trunk = mesh(new T.CylinderGeometry(0.22 * s, 0.35 * s, 2.2 * s, 10), toon('#9a6a4a', { rimS: 0.2 }), 0, 1.1 * s, 0); g.add(trunk);
    const lc = theme === 'abend' ? '#ff9fc0' : theme === 'klippe' ? '#ffcf5a' : theme === 'dschungel' ? '#3fae4a' : theme === 'nacht' ? '#5ab0c0' : '#7fd06a';
    const leaf = toon(lc, { rimC: '#fffbe0', rimS: 0.55, roughness: 0.75 });
    [[0, 2.8, 0, 1.3], [0.8, 2.4, 0.2, 0.9], [-0.7, 2.5, -0.3, 0.95], [0.1, 3.5, -0.2, 0.9]].forEach(([x, y, z, r]) => g.add(mesh(new T.IcosahedronGeometry(r * s, 2), leaf, x * s, y * s, z * s)));
    void th; return g;
  };
  G.makeBush = function (s = 1, theme) {
    const g = new T.Group(), c = toon(theme === 'klippe' ? '#c9c050' : '#6fc65a', { rimC: '#f0ffd0', rimS: 0.5 });
    [[0, 0.4, 0, 0.6], [0.55, 0.32, 0.1, 0.45], [-0.5, 0.3, 0, 0.45]].forEach(([x, y, z, r]) => g.add(mesh(new T.IcosahedronGeometry(r * s, 2), c, x * s, y * s, z * s)));
    for (let i = 0; i < 4; i++) g.add(mesh(sph(0.09 * s, 8, 6), toon(['#fff', '#ffd0ea', '#fff3a0'][i % 3]), (rnd() - 0.5) * s, 0.65 * s, (rnd() - 0.5) * 0.6 * s, 1, 1, 1, false));
    return g;
  };
  G.makeRock = function (s = 1, theme) { const th = G.THEMES[theme] || G.THEMES.wiese; const g = new T.Group(); const m = toon(th.cliff, { roughness: 0.9, rimS: 0.25 }); g.add(mesh(new T.DodecahedronGeometry(0.8 * s, 1), m, 0, 0.5 * s, 0, 1.2, 0.8, 1)); g.add(mesh(new T.DodecahedronGeometry(0.45 * s, 1), m, 0.8 * s, 0.25 * s, 0.3 * s)); return g; };
  G.makePilz = function () {
    const g = new T.Group(); g.add(mesh(new T.CylinderGeometry(0.35, 0.45, 0.7, 16), toon('#fff3e0'), 0, 0.35, 0));
    const cap = mesh(sph(0.95, 28, 16), toon('#ff6a8a', { rimC: '#fff' }), 0, 0.7, 0, 1, 0.5, 1); g.add(cap);
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; g.add(mesh(sph(0.16, 12, 8), toon('#ffffff'), Math.cos(a) * 0.6, 0.98, Math.sin(a) * 0.6, 1, 0.5, 1, false)); }
    g.userData = { cap }; return g;
  };
  G.makeEiblock = function () {
    const m = new T.MeshStandardMaterial({ map: G.tex.eggIcon, roughness: 0.5, emissive: '#402010', emissiveIntensity: 0.15 });
    const b = mesh(G.roundBox(1.1, 1.1, 1.1, 0.12), m); b.position.y = 0.55; const g = new T.Group(); g.add(b);
    // Kantenbeschriftung über eigene Box mit Texturkoordinaten 0..1
    const bx = new T.Mesh(new T.BoxGeometry(1.0, 1.0, 1.0), m); bx.castShadow = true; g.remove(b); g.add(bx); g.userData = { box: bx }; return g;
  };
  G.makeWolke = function () {
    const g = new T.Group(); const c = toon('#ffffff', { rimC: '#ffd6f2', rimS: 0.6, emissive: '#ffffff', emissiveIntensity: 0.15, roughness: 1 });
    [[0, 0, 0, 0.75], [0.7, -0.1, 0, 0.55], [-0.7, -0.1, 0, 0.55], [0.3, 0.35, 0, 0.5], [-0.3, 0.3, 0.1, 0.5]].forEach(([x, y, z, r]) => g.add(mesh(sph(r, 18, 12), c, x, y, z)));
    const q = new T.Sprite(new T.SpriteMaterial({ map: G.tex.qmark, depthTest: true })); q.scale.set(0.9, 0.9, 1); q.position.set(0, 0.1, 0.8); g.add(q);
    g.userData = { q }; return g;
  };
  G.makeSchalter = function () {
    const g = new T.Group(); g.add(mesh(new T.CylinderGeometry(0.9, 1.0, 0.25, 24), toon('#5a4a88'), 0, 0.12, 0));
    const top = mesh(new T.CylinderGeometry(0.7, 0.75, 0.35, 24), new T.MeshStandardMaterial({ color: '#ff7ac0', emissive: '#ff3aa0', emissiveIntensity: 0.5, roughness: 0.3 }), 0, 0.42, 0); g.add(top);
    g.userData = { top }; return g;
  };
  G.makeBubble = function () {
    const g = new T.Group();
    const b = new T.Mesh(sph(0.85, 28, 20), new T.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.05, metalness: 0, transparent: true, opacity: 0.32, clearcoat: 1, emissive: '#80c0ff', emissiveIntensity: 0.15 }));
    g.add(b); const t = G.makeTamo(); t.scale.setScalar(0.75); t.position.y = -0.45; g.add(t); g.userData = { tamo: t, b }; return g;
  };
  G.makeTrail = function (n) {
    const m = new T.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.85 });
    const im = new T.InstancedMesh(sph(0.09, 8, 6), m, n); im.frustumCulled = false; im.count = 0; return im;
  };
  G.makeShadow = function () { const s = new T.Mesh(new T.PlaneGeometry(1.4, 1.4), G.mats.shadow); s.rotation.x = -Math.PI / 2; s.renderOrder = 2; return s; };
  G.makeWindColumn = function (r, h) {
    const g = new T.Group();
    const m = new T.ShaderMaterial({
      transparent: true, depthWrite: false, side: T.DoubleSide, blending: T.AdditiveBlending, uniforms: { time: G.timeU },
      vertexShader: 'varying vec2 vU; void main(){ vU = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
      fragmentShader: `varying vec2 vU; uniform float time;
        vec3 hsl(float h){ return clamp(abs(mod(h*6.0+vec3(0.,4.,2.),6.)-3.)-1.,0.,1.); }
        void main(){ float s = fract(vU.y*3.0 - time*0.9 + vU.x*2.0); float a = smoothstep(0.0,0.2,s)*smoothstep(0.6,0.2,s); a *= smoothstep(0.0,0.15,vU.y)*smoothstep(1.0,0.75,vU.y);
          gl_FragColor = vec4(mix(vec3(1.), hsl(vU.y*0.8+time*0.1), 0.6), a*0.45);
          #include <encodings_fragment>
        }`
    });
    const c = new T.Mesh(new T.CylinderGeometry(r, r * 0.8, h, 28, 1, true), m); c.position.y = h / 2; g.add(c);
    const c2 = new T.Mesh(new T.CylinderGeometry(r * 0.6, r * 0.5, h, 20, 1, true), m); c2.position.y = h / 2; c2.rotation.y = 1; g.add(c2);
    return g;
  };
  G.makePortal = function () {   // Pixeltor am Beginn einer Retro-Zone
    const g = new T.Group(); const m = G.mats.retro[13] || G.mats.stein;
    const l = new T.Mesh(G.boxUV(0.8, 4, 0.8, 1), m), r = l.clone(), t = new T.Mesh(G.boxUV(4.4, 0.8, 0.8, 1), m);
    l.position.set(-1.8, 4, 0); r.position.set(1.8, 4, 0); t.position.set(0, 4.8, 0); [l, r, t].forEach(o => { o.castShadow = true; g.add(o); });
    const s = new T.Mesh(new T.PlaneGeometry(2.8, 3.9), new T.MeshBasicMaterial({ color: '#9fe8ff', transparent: true, opacity: 0.25, side: T.DoubleSide, depthWrite: false })); s.position.y = 2; g.add(s);
    return g;
  };

  // ---------- Neue Gegner (eigene Figuren) ----------
  G.makeHupfer = function () {   // Hupfer: Frosch-Blob, springt auf Pufi zu
    const g = new T.Group(), body = new T.Group(); g.add(body); const c = toon('#5ad0b0', { rimC: '#e0fff4', rimS: 0.6 }), belly = toon('#fff4c8');
    body.add(mesh(sph(0.5, 22, 16), c, 0, 0.5, 0, 1.1, 0.85, 1)); body.add(mesh(sph(0.34, 16, 12), belly, 0, 0.42, 0.24, 1, 0.8, 0.7));
    const e1 = eye(0.17), e2 = eye(0.17); e1.position.set(-0.22, 0.95, 0.12); e2.position.set(0.22, 0.95, 0.12); body.add(e1, e2);
    const legL = mesh(sph(0.2, 12, 8), c, -0.42, 0.18, -0.05, 1, 0.6, 1.5), legR = legL.clone(); legR.position.x = 0.42; body.add(legL, legR);
    body.add(mesh(new T.TorusGeometry(0.12, 0.03, 6, 12, Math.PI), toon('#3a2a4a'), 0, 0.62, 0.48).rotateZ(Math.PI));
    g.userData = { body, legL, legR }; return g;
  };
  G.makeSpucker = function () {   // Kernspucker: Topfpflanze, die Kerne schießt
    const g = new T.Group(); g.add(mesh(new T.CylinderGeometry(0.55, 0.42, 0.6, 18), toon('#c96a3a'), 0, 0.3, 0)); g.add(mesh(new T.TorusGeometry(0.55, 0.08, 8, 20), toon('#e08a50'), 0, 0.6, 0).rotateX(Math.PI / 2));
    const head = new T.Group(); head.position.y = 1.15; g.add(head); const c = toon('#8a5ad8', { rimC: '#f0e0ff', rimS: 0.6 });
    head.add(mesh(sph(0.48, 22, 16), c)); const mouth = mesh(new T.CylinderGeometry(0.2, 0.26, 0.45, 16), c, 0, -0.05, 0.45); mouth.rotation.x = Math.PI / 2; head.add(mouth);
    head.add(mesh(new T.CylinderGeometry(0.13, 0.13, 0.05, 14), toon('#2a1040'), 0, -0.05, 0.68).rotateX(Math.PI / 2));
    const e1 = eye(0.13), e2 = eye(0.13); e1.position.set(-0.2, 0.25, 0.33); e2.position.set(0.2, 0.25, 0.33); head.add(e1, e2);
    for (let i = 0; i < 3; i++) head.add(mesh(sph(0.22, 10, 8), toon('#6fd06a'), Math.cos(i * 2.1) * 0.3, 0.45, Math.sin(i * 2.1) * 0.3 - 0.1, 1.3, 0.35, 0.7));
    g.userData = { head }; return g;
  };
  G.makeKern = function () { return mesh(sph(0.2, 12, 8), toon('#ffd36a', { emissive: '#a05a00', emissiveIntensity: 0.4 })); };
  G.makeWirbel = function () {   // Wirbelkreisel: Kreisel, der umherflitzt
    const g = new T.Group(), spin = new T.Group(); g.add(spin); const c = toon('#ff8a3a', { rimC: '#fff0c0', rimS: 0.6 }), st = toon('#ffe27a');
    spin.add(mesh(new T.ConeGeometry(0.6, 0.8, 20), c, 0, 0.45, 0).rotateX(Math.PI)); spin.add(mesh(new T.CylinderGeometry(0.7, 0.7, 0.18, 24), st, 0, 0.9, 0)); spin.add(mesh(sph(0.42, 18, 12), c, 0, 1.1, 0, 1, 0.7, 1));
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; spin.add(mesh(sph(0.1, 8, 6), toon('#ffffff'), Math.cos(a) * 0.68, 0.9, Math.sin(a) * 0.68)); }
    const face = new T.Group(); face.position.y = 1.15; g.add(face); const e1 = eye(0.12), e2 = eye(0.12); e1.position.set(-0.15, 0.05, 0.33); e2.position.set(0.15, 0.05, 0.33); face.add(e1, e2);
    g.userData = { spin, face }; return g;
  };
  G.makeNebli = function () {   // Nebli: kleiner Nebelgeist, schwebt hinterher
    const g = new T.Group(), body = new T.Group(); g.add(body); const c = toon('#e8e0ff', { transparent: true, opacity: 0.88, rimC: '#a8c8ff', rimS: 0.9, emissive: '#6a6aa0', emissiveIntensity: 0.25 });
    body.add(mesh(sph(0.5, 22, 16), c, 0, 0.6, 0)); for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; body.add(mesh(sph(0.2, 10, 8), c, Math.cos(a) * 0.3, 0.12, Math.sin(a) * 0.3)); }
    const e1 = eye(0.12, '#3a1a6a'), e2 = eye(0.12, '#3a1a6a'); e1.position.set(-0.17, 0.72, 0.4); e2.position.set(0.17, 0.72, 0.4); body.add(e1, e2);
    body.add(mesh(sph(0.07, 8, 6), toon('#ff8ab0'), -0.32, 0.55, 0.38, 1.3, 0.7, 0.5, false)); body.add(mesh(sph(0.07, 8, 6), toon('#ff8ab0'), 0.32, 0.55, 0.38, 1.3, 0.7, 0.5, false));
    g.userData = { body }; return g;
  };
  G.makeRutscher = function () {   // Rutscher: Schneeball-Wesen mit Brille, saust hin und her
    const g = new T.Group(), body = new T.Group(); g.add(body); const c = toon('#ffffff', { rimC: '#bfe4ff', rimS: 0.7 }), sc = toon('#ff5a7a');
    body.add(mesh(sph(0.55, 22, 16), c, 0, 0.55, 0)); body.add(mesh(new T.TorusGeometry(0.42, 0.09, 8, 20), sc, 0, 0.78, 0).rotateX(Math.PI / 2));
    body.add(mesh(new T.BoxGeometry(0.62, 0.2, 0.12), toon('#3a7ad8', { roughness: 0.2, metalness: 0.4 }), 0, 0.82, 0.48));
    const e1 = eye(0.08), e2 = eye(0.08); e1.position.set(-0.15, 0.83, 0.55); e2.position.set(0.15, 0.83, 0.55); body.add(e1, e2);
    body.add(mesh(new T.ConeGeometry(0.06, 0.25, 8), toon('#ff9a3a'), 0, 0.62, 0.58).rotateX(Math.PI / 2));
    g.userData = { body }; return g;
  };
  // ---------- Hilfen ----------
  const heartShape = (() => { const s = new T.Shape(); s.moveTo(0, -0.35); s.bezierCurveTo(-0.5, 0, -0.42, 0.42, 0, 0.2); s.bezierCurveTo(0.42, 0.42, 0.5, 0, 0, -0.35); return s; })();
  const heartGeo = new T.ExtrudeGeometry(heartShape, { depth: 0.14, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 3 }); heartGeo.center();
  const glow = (c, e, i = 0.7) => new T.MeshStandardMaterial({ color: c, emissive: e, emissiveIntensity: i, roughness: 0.25, metalness: 0.2 });
  G.makeHerz = function () { const g = new T.Group(); g.add(mesh(heartGeo, glow('#ff4f7f', '#ff1a5a', 0.6), 0, 0, 0, 1.4, 1.4, 1.4)); return g; };
  G.makeFeder = function () {
    const g = new T.Group(), m = glow('#8fe8ff', '#20a0d0', 0.6); g.add(mesh(sph(0.3, 16, 10), m, 0, 0.1, 0, 0.55, 1.4, 0.12));
    g.add(mesh(new T.CylinderGeometry(0.02, 0.03, 0.9, 6), toon('#ffffff'), 0, 0, 0.02)); g.rotation.z = 0.4; return g;
  };
  G.makeMagnet = function () {
    const g = new T.Group(); g.add(mesh(new T.TorusGeometry(0.3, 0.1, 10, 20, Math.PI), glow('#ff4a4a', '#a01010', 0.4), 0, 0.05, 0).rotateZ(Math.PI));
    g.add(mesh(new T.CylinderGeometry(0.1, 0.1, 0.22, 10), glow('#e8e8f0', '#6a6a8a', 0.3), -0.3, 0.12, 0)); g.add(mesh(new T.CylinderGeometry(0.1, 0.1, 0.22, 10), glow('#e8e8f0', '#6a6a8a', 0.3), 0.3, 0.12, 0)); return g;
  };
  G.makeRegenbogen = function () { const g = new T.Group(), m = glow('#ffffff', '#ff60c0', 1.0); g.add(mesh(G.starGeo, m, 0, 0, 0, 1.6, 1.6, 1.6)); g.userData = { m }; return g; };
  const tafelTex = canvasTex(128, (x, s) => { x.fillStyle = '#f2d2a0'; x.fillRect(0, 0, s, s); x.fillStyle = '#c99a5a'; for (let i = 0; i < 4; i++) x.fillRect(0, i * 32 + 30, s, 2); x.font = '900 84px Trebuchet MS, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#5a3a8a'; x.fillText('!', s / 2, s / 2 + 4); });
  G.makeTafel = function () {
    const g = new T.Group(); g.add(mesh(new T.CylinderGeometry(0.08, 0.1, 1.2, 8), toon('#8a5a3a'), 0, 0.6, 0));
    const b = mesh(new T.BoxGeometry(1.1, 0.8, 0.12), new T.MeshStandardMaterial({ map: tafelTex, roughness: 0.8 }), 0, 1.35, 0); g.add(b); g.userData = { b }; return g;
  };
  // ---------- Neue Deko je Welt ----------
  G.makeTanne = function (s = 1) {
    const g = new T.Group(), c = toon('#3a8a6a', { rimC: '#e0fff0', rimS: 0.4 }), snow = toon('#ffffff', { rimS: 0.3 });
    g.add(mesh(new T.CylinderGeometry(0.18 * s, 0.26 * s, 1 * s, 8), toon('#7a5a3a'), 0, 0.5 * s, 0));
    [[1.1, 1.5, 1.0], [0.85, 1.3, 1.8], [0.6, 1.1, 2.5]].forEach(([r, h, y]) => { g.add(mesh(new T.ConeGeometry(r * s, h * s, 12), c, 0, y * s, 0)); g.add(mesh(new T.ConeGeometry(r * 0.55 * s, h * 0.35 * s, 12), snow, 0, (y + h * 0.36) * s, 0)); });
    return g;
  };
  G.makePalme = function (s = 1) {
    const g = new T.Group(), tr = toon('#a07a4a'), lf = toon('#4fc05a', { rimC: '#eaffc8', rimS: 0.5, side: T.DoubleSide });
    for (let i = 0; i < 6; i++) g.add(mesh(new T.CylinderGeometry(0.2 * s, 0.24 * s, 0.6 * s, 8), tr, i * 0.07 * s, (0.3 + i * 0.55) * s, 0).rotateZ(-0.05 * i));
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU, l = mesh(sph(0.9 * s, 12, 8), lf, Math.cos(a) * 0.8 * s + 0.4 * s, 3.3 * s, Math.sin(a) * 0.8 * s, 1.2, 0.12, 0.45); l.rotation.y = -a; l.rotation.z = -0.35; g.add(l); }
    g.add(mesh(sph(0.16 * s, 10, 8), toon('#7a4a2a'), 0.45 * s, 3.1 * s, 0.15 * s)); return g;
  };
  G.makeKristall = function (s = 1, col = '#9a8aff') {
    const g = new T.Group(), m = new T.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.45, roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.9 });
    [[0, 1.0, 0, 0.5, 2.2, 0], [0.5, 0.6, 0.2, 0.32, 1.4, 0.4], [-0.45, 0.55, -0.1, 0.3, 1.2, -0.45], [0.1, 0.4, 0.5, 0.22, 0.9, 0.2]].forEach(([x, y, z, r, h, rz]) => { const o = mesh(new T.OctahedronGeometry(r * s, 0), m, x * s, y * s, z * s, 1, h, 1); o.rotation.z = rz; g.add(o); });
    return g;
  };
  G.makeRiesenpilz = function (s = 1, col = '#ff7a5a') {
    const g = new T.Group(); g.add(mesh(new T.CylinderGeometry(0.3 * s, 0.45 * s, 2.2 * s, 12), toon('#fff3e0'), 0, 1.1 * s, 0));
    g.add(mesh(sph(1.5 * s, 28, 14), toon(col, { rimC: '#ffffff', rimS: 0.5 }), 0, 2.3 * s, 0, 1, 0.45, 1));
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, r = (i % 2 ? 0.6 : 1.05) * s; g.add(mesh(sph(0.2 * s, 10, 8), toon('#ffffff'), Math.cos(a) * r, 2.75 * s - (i % 2 ? 0 : 0.18 * s), Math.sin(a) * r, 1, 0.4, 1, false)); }
    return g;
  };
  G.makeLaterne = function (s = 1) {
    const g = new T.Group(); g.add(mesh(new T.CylinderGeometry(0.06 * s, 0.09 * s, 2.2 * s, 8), toon('#3a3050', { metalness: 0.5 }), 0, 1.1 * s, 0));
    g.add(mesh(sph(0.3 * s, 16, 12), new T.MeshStandardMaterial({ color: '#fff0b0', emissive: '#ffc040', emissiveIntensity: 1.4 }), 0, 2.4 * s, 0)); g.add(mesh(new T.ConeGeometry(0.36 * s, 0.3 * s, 10), toon('#3a3050'), 0, 2.75 * s, 0)); return g;
  };
  G.makeBlumen = function (s = 1) {
    const g = new T.Group();
    for (let i = 0; i < 7; i++) { const a = i * 2.4, r = (0.2 + (i % 3) * 0.3) * s, c = new T.Color().setHSL((i * 0.17) % 1, 0.8, 0.7);
      g.add(mesh(new T.CylinderGeometry(0.02, 0.02, 0.4 * s, 4), toon('#5ab05a'), Math.cos(a) * r, 0.2 * s, Math.sin(a) * r, 1, 1, 1, false));
      g.add(mesh(sph(0.11 * s, 10, 8), toon('#' + c.getHexString(), { rimS: 0.4 }), Math.cos(a) * r, 0.42 * s, Math.sin(a) * r, 1, 0.6, 1, false)); }
    return g;
  };
  G.makeSchneemann = function (s = 1) {
    const g = new T.Group(), w = toon('#ffffff', { rimC: '#bfe4ff', rimS: 0.5 });
    g.add(mesh(sph(0.6 * s, 20, 14), w, 0, 0.55 * s, 0)); g.add(mesh(sph(0.42 * s, 18, 12), w, 0, 1.35 * s, 0)); g.add(mesh(sph(0.3 * s, 16, 12), w, 0, 1.95 * s, 0));
    g.add(mesh(new T.ConeGeometry(0.06 * s, 0.3 * s, 8), toon('#ff9a3a'), 0, 1.95 * s, 0.38 * s).rotateX(Math.PI / 2)); g.add(mesh(new T.CylinderGeometry(0.22 * s, 0.25 * s, 0.3 * s, 12), toon('#3a3050'), 0, 2.32 * s, 0));
    const e1 = eye(0.06 * s, '#222'), e2 = eye(0.06 * s, '#222'); e1.position.set(-0.1 * s, 2.05 * s, 0.25 * s); e2.position.set(0.1 * s, 2.05 * s, 0.25 * s); g.add(e1, e2); return g;
  };
  G.makeSaeule = function (s = 1, theme) { const th = G.THEMES[theme] || G.THEMES.burg, m = toon(th.cliff, { roughness: 0.8 }); const g = new T.Group(); g.add(mesh(new T.CylinderGeometry(0.4 * s, 0.45 * s, 3 * s, 12), m, 0, 1.5 * s, 0)); g.add(mesh(new T.BoxGeometry(1.1 * s, 0.3 * s, 1.1 * s), m, 0, 3.1 * s, 0)); g.add(mesh(new T.BoxGeometry(1.1 * s, 0.3 * s, 1.1 * s), m, 0, 0.15 * s, 0)); return g; };
  root.PufiGrafik = G;
})(window);
