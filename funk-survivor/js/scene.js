/* Funk-Survivor – 3D-Szene: physikalisch basierte Materialien (PBR), Umgebungsreflexionen, weiche Schatten, HDR-Rendering mit Leuchteffekt (Bloom),
 * Filmfarben, realistische Helden aus ../figuren, glatte Gegner, Partikel. Fällt ohne HDR/WebGL2 auf direktes Rendern mit Tone-Mapping zurück. */
(function (root) {
  'use strict';
  const T = root.THREE, M = root.FSModels, FS = root.FS, TAU = Math.PI * 2, ARENA = FS.ARENA;
  const TINT = { rausch: [.1, .75, 1], knack: [1, .75, .1], brumm: [1, .3, .18], schrei: [.75, .25, 1], splitt: [.2, 1, .45], blitz: [.35, .55, 1.5], boss1: [1, .28, .12], boss2: [1, .2, .75], boss3: [.2, .8, 1.2] };
  const CAP = { rausch: 430, knack: 430, brumm: 150, schrei: 170, splitt: 170, blitz: 170, boss1: 2, boss2: 2, boss3: 2 };
  const ease = k => { const c = 1.70158, t = k - 1; return 1 + (c + 1) * t * t * t + c * t * t; };
  const lerpAng = (a, b, k) => { let d = b - a; while (d > Math.PI) d -= TAU; while (d < -Math.PI) d += TAU; return a + d * k; };

  const S = {
    ready: false, mode: 'menu', shakeA: 0, hurtA: 0, flashA: 0, time: 0, low: false, fig: null, figs: {}, heroId: null, camLook: new T.Vector3(), camPos: new T.Vector3(), cinema: 0
  };

  /* ---------- Material mit Leuchtteilen (aGlow) ---------- */
  function glowMat(low) {
    const m = low ? new T.MeshStandardMaterial({ vertexColors: true, roughness: .38, metalness: .5, envMapIntensity: 1.1 })
      : new T.MeshPhysicalMaterial({ vertexColors: true, roughness: .26, metalness: .55, clearcoat: 1, clearcoatRoughness: .1, envMapIntensity: 1.3 });
    m.onBeforeCompile = sh => {
      sh.uniforms.uTime = S.uTime;
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float aGlow;\nvarying float vGlow;\nvarying vec3 vTint;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvGlow = aGlow;\n#ifdef USE_INSTANCING_COLOR\nvTint = instanceColor;\n#else\nvTint = vec3(1.0);\n#endif');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vGlow;\nvarying vec3 vTint;\nuniform float uTime;')
        .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\nfloat g1 = step(0.5, vGlow) * (1.0 - step(1.5, vGlow)); float g2 = step(1.5, vGlow);\ntotalEmissiveRadiance += g1 * vTint * (1.7 + 0.5 * sin(uTime * 5.0 + vGlow * 9.0)) + g2 * vec3(3.4, 3.0, 2.4);');
    };
    return m;
  }

  /* ---------- Vollbild-Durchgänge ---------- */
  const VERT = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
  const BRIGHT = 'uniform sampler2D tIn; uniform float uTh; varying vec2 vUv; void main(){ vec3 c = texture2D(tIn, vUv).rgb; float br = max(c.r, max(c.g, c.b)); float k = 0.5; float s = clamp(br - uTh + k, 0.0, 2.0 * k); s = s * s / (4.0 * k + 1e-4); float w = max(s, br - uTh) / max(br, 1e-4); gl_FragColor = vec4(c * w, 1.0); }';
  const BLUR = 'uniform sampler2D tIn; uniform vec2 uDir; varying vec2 vUv; void main(){ vec3 c = texture2D(tIn, vUv).rgb * 0.227027; vec2 o1 = uDir * 1.3846153846, o2 = uDir * 3.2307692308; c += (texture2D(tIn, vUv + o1).rgb + texture2D(tIn, vUv - o1).rgb) * 0.3162162162; c += (texture2D(tIn, vUv + o2).rgb + texture2D(tIn, vUv - o2).rgb) * 0.0702702703; gl_FragColor = vec4(c, 1.0); }';
  const COMP = [
    'uniform sampler2D tScene, tB0, tB1, tB2, tB3; uniform float uBloom, uExp, uVig, uHurt, uTime, uChroma, uGrain, uFlash; varying vec2 vUv;',
    'vec3 aces(vec3 x){ const float a = 2.51, b = 0.03, c = 2.43, d = 0.59, e = 0.14; return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0); }',
    'vec3 toSrgb(vec3 c){ return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }',
    'void main(){ vec2 uv = vUv; vec2 dir = uv - 0.5; float dist = length(dir); vec2 off = dir * dist * uChroma;',
    ' vec3 c = vec3(texture2D(tScene, uv + off).r, texture2D(tScene, uv).g, texture2D(tScene, uv - off).b);',
    ' vec3 bl = texture2D(tB0, uv).rgb * 0.45 + texture2D(tB1, uv).rgb * 0.65 + texture2D(tB2, uv).rgb * 0.85 + texture2D(tB3, uv).rgb * 1.05;',
    ' c += bl * uBloom; c += uFlash * vec3(1.0, 0.9, 0.7); c *= uExp; c = aces(c);',
    ' c *= mix(1.0, smoothstep(1.0, 0.18, dist * 1.35), uVig);',
    ' c = mix(c, c * vec3(1.0, 0.3, 0.3) + vec3(0.42, 0.0, 0.0) * smoothstep(0.15, 0.8, dist), uHurt);',
    ' float l = dot(c, vec3(0.2126, 0.7152, 0.0722)); c = mix(vec3(l), c, 1.14); c = c * c * (3.0 - 2.0 * c) * 0.35 + c * 0.65;',
    ' c = toSrgb(c); float n = fract(sin(dot(uv * vec2(1920.0, 1080.0) + uTime, vec2(12.9898, 78.233))) * 43758.5453); c += (n - 0.5) * uGrain;',
    ' gl_FragColor = vec4(c, 1.0); }'].join('\n');

  /* ---------- Start ---------- */
  S.init = function (container, opt) {
    opt = opt || {}; S.low = !!opt.low; S.container = container;
    const mobile = matchMedia('(pointer: coarse)').matches; S.mobile = mobile;
    const canvas = document.createElement('canvas'); container.appendChild(canvas);
    const R = S.renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    S.gl2 = R.capabilities.isWebGL2; S.dpr = Math.min(window.devicePixelRatio || 1, S.low ? 1 : mobile ? 1.5 : 2);
    R.setPixelRatio(S.dpr); R.shadowMap.enabled = !S.low; R.shadowMap.type = T.PCFSoftShadowMap;
    S.post = !S.low && S.gl2 && !/nopost/.test(location.search);
    R.outputEncoding = S.post ? T.LinearEncoding : T.sRGBEncoding; R.toneMapping = S.post ? T.NoToneMapping : T.ACESFilmicToneMapping; R.toneMappingExposure = 1.05;
    S.uTime = { value: 0 };
    const sc = S.scene = new T.Scene(); S.cam = new T.PerspectiveCamera(44, 1, .5, 400);
    S.anis = Math.min(8, R.capabilities.getMaxAnisotropy());
    S.matGlow = glowMat(S.low);
    buildEnvironment(); buildLights(); buildFloor(); buildArena(); buildBeams(); buildDecor(); buildDust();
    buildMeshes(); buildParticles(); buildPools();
    S.dmgLayer = document.getElementById('dmgLayer'); S.dmgPool = []; S.dmgI = 0;
    if (S.dmgLayer) for (let i = 0; i < 36; i++) { const d = document.createElement('div'); d.className = 'dmg'; d.hidden = true; S.dmgLayer.appendChild(d); S.dmgPool.push({ el: d, t: 0, x: 0, y: 0, z: 0 }); }
    S.kit = root.EasyFiguren ? root.EasyFiguren.create({ THREE: T, base: '../figuren/', srgb: true }) : null;
    S.setMap(FS.MAPS[0]); S.resize(); window.addEventListener('resize', S.resize);
    S.ready = true;
  };

  function buildEnvironment() {
    // Studio-Umgebung für Reflexionen: Verlaufshimmel mit hellen Softboxen
    const R = S.renderer, env = new T.Scene(), sg = new T.SphereGeometry(50, 48, 32), sp = sg.attributes.position, sc2 = new Float32Array(sp.count * 3);
    for (let i = 0; i < sp.count; i++) { const h = sp.getY(i) / 50 * .5 + .5, band = Math.pow(Math.max(0, 1 - Math.abs(h - .5) * 6), 3) * .4, k = Math.pow(h, 1.4); sc2[i * 3] = .02 + (.16 - .02) * k + band * .5; sc2[i * 3 + 1] = .03 + (.22 - .03) * k + band * .3; sc2[i * 3 + 2] = .07 + (.42 - .07) * k + band * .6; }
    sg.setAttribute('color', new T.BufferAttribute(sc2, 3)); const sky = new T.Mesh(sg, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide, depthWrite: false }));
    env.add(sky);
    const box = (w, h, x, y, z, c) => { const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: new T.Color(c[0], c[1], c[2]), side: T.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m); };
    box(30, 10, 0, 28, -20, [5, 5, 5.5]); box(10, 24, -34, 12, 8, [2.2, 3.2, 6]); box(10, 24, 34, 12, 10, [6, 2.4, 3.6]); box(40, 6, 0, 8, 38, [1.4, 1.4, 1.8]);
    const pm = new T.PMREMGenerator(R); S.envTex = pm.fromScene(env, 0).texture; S.scene.environment = S.envTex;
  }
  function buildLights() {
    const sc = S.scene;
    S.hemi = new T.HemisphereLight(0xaac4ff, 0x1a1020, .35); sc.add(S.hemi);
    const k = S.key = new T.DirectionalLight(0xffffff, 2.2); k.castShadow = !S.low;
    const sz = S.mobile ? 1024 : 2048; k.shadow.mapSize.set(sz, sz); const c = k.shadow.camera; c.left = -26; c.right = 26; c.top = 26; c.bottom = -26; c.near = 5; c.far = 90; k.shadow.bias = -.0004; k.shadow.normalBias = .05; k.shadow.radius = 3;
    sc.add(k); sc.add(k.target);
    S.rim = new T.DirectionalLight(0x4fd0ff, 1.5); S.rim.position.set(-18, 14, -22); sc.add(S.rim);
    S.glow = new T.PointLight(0x4fd0ff, 7, 12, 2); S.glow.position.set(0, 2.4, 0); sc.add(S.glow);
  }
  function buildFloor() {
    const tex = M.floorTextures(S.low ? 512 : S.mobile ? 768 : 1024, S.anis), rep = 340 / 16;
    for (const k of ['map', 'rough', 'normal', 'emis']) tex[k].repeat.set(rep, rep);
    S.floorMat = new T.MeshStandardMaterial({ map: tex.map, roughnessMap: tex.rough, roughness: 1, metalness: .45, normalMap: tex.normal, normalScale: new T.Vector2(1.1, 1.1), emissiveMap: tex.emis, emissive: new T.Color(0x2bd9ff), emissiveIntensity: 1.1, envMapIntensity: .8 });
    const f = S.floor = new T.Mesh(new T.CircleGeometry(170, 96), S.floorMat); f.rotation.x = -Math.PI / 2; f.receiveShadow = true; S.scene.add(f);
    // Bühnenzeichen in der Mitte
    const c = document.createElement('canvas'); c.width = c.height = 1024; const g = c.getContext('2d'); g.translate(512, 512); g.strokeStyle = '#fff'; g.fillStyle = '#fff';
    for (const [r, w, a] of [[470, 6, .9], [440, 2, .5], [330, 3, .5], [210, 4, .5]]) { g.globalAlpha = a; g.lineWidth = w; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.stroke(); }
    g.globalAlpha = .55; g.lineWidth = 3; for (let i = 0; i < 48; i++) { const a = i / 48 * TAU; g.beginPath(); g.moveTo(Math.cos(a) * 440, Math.sin(a) * 440); g.lineTo(Math.cos(a) * (i % 4 ? 455 : 475), Math.sin(a) * (i % 4 ? 455 : 475)); g.stroke(); }
    g.globalAlpha = .6; g.font = '800 120px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('FUNKFLUT', 0, -20); g.font = '700 54px system-ui'; g.globalAlpha = .45; g.fillText('S U R V I V O R', 0, 70);
    const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = S.anis; S.emblemMat = new T.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, blending: T.AdditiveBlending, color: new T.Color(.5, 1.4, 2.2), opacity: .55 });
    const e = new T.Mesh(new T.PlaneGeometry(26, 26), S.emblemMat); e.rotation.x = -Math.PI / 2; e.position.y = .02; S.scene.add(e);
  }
  function buildArena() {
    const sc = S.scene, wallMat = new T.MeshStandardMaterial({ color: 0x20263a, roughness: .35, metalness: .85, envMapIntensity: 1.2 });
    const prof = [[0, 0], [0, 1.25], [.1, 1.4], [.28, 1.46], [.45, 1.38], [.52, 1.2], [.52, 0]].map(p => new T.Vector2(ARENA + .7 + p[0], p[1]));
    const wall = new T.Mesh(new T.LatheGeometry(prof, 160), wallMat); wall.receiveShadow = true; wall.castShadow = false; sc.add(wall);
    S.neonMat = new T.MeshBasicMaterial({ color: new T.Color(.3, 1.6, 2.4), toneMapped: false });
    const ring = new T.Mesh(new T.TorusGeometry(ARENA + .72, .09, 14, 220), S.neonMat); ring.rotation.x = Math.PI / 2; ring.position.y = .85; sc.add(ring);
    const ring2 = new T.Mesh(new T.TorusGeometry(ARENA + .2, .05, 10, 220), S.neonMat); ring2.rotation.x = Math.PI / 2; ring2.position.y = .04; sc.add(ring2);
    // Pfosten mit Lichtkappen
    const post = new T.InstancedMesh(M.rbox(.9, 3.2, .9, .22, 6), new T.MeshStandardMaterial({ color: 0x2c3350, roughness: .3, metalness: .9, envMapIntensity: 1.3 }), 40), cap = new T.InstancedMesh(new T.SphereGeometry(.42, 28, 18), S.neonMat, 40), d = new T.Object3D();
    for (let i = 0; i < 40; i++) { const a = i / 40 * TAU; d.position.set(Math.cos(a) * (ARENA + 1.2), 1.6, Math.sin(a) * (ARENA + 1.2)); d.rotation.y = -a; d.updateMatrix(); post.setMatrixAt(i, d.matrix); d.position.y = 3.4; d.updateMatrix(); cap.setMatrixAt(i, d.matrix); }
    post.castShadow = !S.low; sc.add(post); sc.add(cap);
  }
  function buildBeams() {
    const mat = new T.ShaderMaterial({ transparent: true, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide, uniforms: { uC: { value: new T.Color(.4, .9, 1.5) }, uT: S.uTime },
      vertexShader: 'varying vec2 vUv; varying vec3 vN; void main(){ vUv = uv; vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'uniform vec3 uC; uniform float uT; varying vec2 vUv; varying vec3 vN; void main(){ float a = pow(1.0 - vUv.y, 1.6) * 0.16 * (0.75 + 0.25 * sin(uT * 2.0 + vUv.x * 12.0)); a *= pow(abs(vN.z), 0.6); gl_FragColor = vec4(uC * a, a); }' });
    S.beamMat = mat; S.beams = new T.Group(); const geo = new T.CylinderGeometry(.5, 6.5, 70, 40, 1, true); geo.translate(0, -35, 0); geo.rotateX(0);
    for (let i = 0; i < 10; i++) { const a = i / 10 * TAU, m = new T.Mesh(geo, mat); m.position.set(Math.cos(a) * 84, 52, Math.sin(a) * 84); m.userData.a = a; m.userData.ph = i * .7; m.renderOrder = 4; S.beams.add(m); }
    S.scene.add(S.beams);
  }
  function buildDecor() {
    // Lautsprechertürme und Lichtgerüste rund um die Arena
    const b = new M.Builder(), wood = [.08, .09, .12];
    b.add(M.rbox(5, 4, 3.4, .35, 8), { p: [0, 2, 0], c: wood }); b.add(M.rbox(4.6, 3.6, 3, .3, 8), { p: [0, 5.8, 0], c: wood }); b.add(M.rbox(4.2, 3.2, 2.8, .28, 8), { p: [0, 9.2, 0], c: wood });
    for (const [y, r] of [[2.3, 1.2], [5.9, 1.1], [9.2, 1]]) for (const x of [-1.15, 1.15]) { b.add(M.torus(r * .95, .09, 48, 12), { p: [x, y, 1.62], r: [Math.PI / 2, 0, 0], c: .4 }); b.add(M.lathe(v => [r * .9 * (1 - v * .9), -v * .5 + .1], 48, 12), { p: [x, y, 1.65], r: [Math.PI / 2, 0, 0], c: [.03, .03, .035] }); b.add(M.blob(.3, .3, .3, { ws: 24, hs: 14 }), { p: [x, y, 1.45], c: .15 }); }
    b.add(M.torus(.5, .05, 40, 10), { p: [0, 10.9, 1.2], r: [Math.PI / 2, 0, 0], c: 1, g: 1 });
    const geo = b.build(), mat = glowMat(S.low); mat.roughness = .45; mat.metalness = .3; if (mat.clearcoat != null) mat.clearcoat = .3;
    const N = 14, im = new T.InstancedMesh(geo, mat, N), d = new T.Object3D(), col = new T.Color(); im.frustumCulled = false;
    for (let i = 0; i < N; i++) { const a = i / N * TAU + .1, r = 76 + (i % 3) * 7; d.position.set(Math.cos(a) * r, 0, Math.sin(a) * r); d.rotation.y = -a - Math.PI / 2; d.scale.setScalar(1 + (i % 2) * .25); d.updateMatrix(); im.setMatrixAt(i, d.matrix); im.setColorAt(i, col.setRGB(.5, 1.6, 2.4)); }
    im.castShadow = false; S.decor = im; S.scene.add(im);
  }
  function buildDust() {
    const n = S.low ? 80 : 260, p = new Float32Array(n * 3); for (let i = 0; i < n; i++) { p[i * 3] = (Math.random() - .5) * 70; p[i * 3 + 1] = Math.random() * 14 + .5; p[i * 3 + 2] = (Math.random() - .5) * 70; }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(p, 3));
    S.dust = new T.Points(g, new T.PointsMaterial({ map: M.glowTexture(.1), size: .5, transparent: true, opacity: .5, depthWrite: false, blending: T.AdditiveBlending, color: new T.Color(.8, 1.1, 1.6), sizeAttenuation: true })); S.dust.frustumCulled = false; S.scene.add(S.dust);
  }

  /* ---------- Instanzen ---------- */
  function inst(geo, mat, n, shadow) { const m = new T.InstancedMesh(geo, mat, n); m.instanceColor = new T.InstancedBufferAttribute(new Float32Array(n * 3).fill(1), 3); m.frustumCulled = false; m.count = 0; m.castShadow = !!shadow && !S.low; S.scene.add(m); return m; }
  function buildMeshes() {
    S.en = {}; for (const k in M.CREATURES) S.en[k] = inst(M.creature(k, S.mobile || S.low), S.matGlow, CAP[k], !S.mobile || /boss/.test(k));
    S.eliteRing = inst(M.torus(1, .06, 64, 10), new T.MeshBasicMaterial({ toneMapped: false }), 80, false);
    const gm = new M.Builder().add(M.gemGeo(), { c: .3, g: 1 }).build(); S.gems = inst(gm, S.matGlow, 560, false);
    S.coins = inst(M.coinGeo(), new T.MeshStandardMaterial({ color: 0xffc83d, metalness: 1, roughness: .22, emissive: 0x6a4300, envMapIntensity: 1.6 }), 80, false);
    const bolt = M.blob(.1, .1, .55, { ws: 16, hs: 10 });
    S.bolts = inst(bolt, new T.MeshBasicMaterial({ toneMapped: false }), 160, false);
    S.ebul = inst(M.blob(.3, .3, .3, { ws: 20, hs: 12 }), new T.MeshBasicMaterial({ toneMapped: false }), 400, false);
    S.ehalo = inst(new T.SphereGeometry(.4, 16, 10), new T.MeshBasicMaterial({ transparent: true, opacity: .16, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false }), 400, false);
    S.msl = inst(M.blob(.14, .14, .5, { ws: 20, hs: 12 }), new T.MeshStandardMaterial({ color: 0xdfe6f5, metalness: .9, roughness: .25, emissive: 0x331100 }), 30, true);
    const vin = M.vinylTexture(); S.disc = inst(new T.CylinderGeometry(.5, .5, .05, 72, 1), new T.MeshStandardMaterial({ map: vin, roughness: .38, metalness: .55, envMapIntensity: 1.5 }), 12, true);
    S.discGlow = inst(M.torus(.5, .03, 64, 8), new T.MeshBasicMaterial({ toneMapped: false }), 12, false);
    // Einzelstücke
    const mk = (geo, mat, n) => { const a = []; for (let i = 0; i < n; i++) { const m = new T.Mesh(geo, mat); m.visible = false; m.castShadow = !S.low; S.scene.add(m); a.push(m); } return a; };
    S.pkMesh = {
      heart: mk(M.heartGeo(), new T.MeshPhysicalMaterial({ color: 0xff2a5a, roughness: .18, metalness: .1, clearcoat: 1, emissive: 0x500010, envMapIntensity: 1.5 }), 8),
      chest: mk(M.chestGeo(), S.matGlow, 4), bomb: mk(M.bombGeo(), S.matGlow, 6), magnet: mk(M.magnetGeo(), new T.MeshPhysicalMaterial({ vertexColors: true, roughness: .22, metalness: .9, clearcoat: 1, envMapIntensity: 1.5 }), 6)
    };
    for (const k of ['chest', 'bomb']) S.pkMesh[k].forEach(m => { m.userData.tint = new T.Color(k === 'chest' ? 1.4 : 2.0, k === 'chest' ? 1.0 : .4, k === 'chest' ? .2 : .2); });
    // Schatten für Gegenstände
    S.fxGem = 0;
  }
  function buildParticles() {
    const n = S.low ? 500 : 1600; S.pn = n;
    S.pm = inst(new T.SphereGeometry(.5, 8, 6), new T.MeshBasicMaterial({ toneMapped: false }), n, false); S.pm.count = n; S.pm.frustumCulled = false;
    S.pd = { x: new Float32Array(n), y: new Float32Array(n), z: new Float32Array(n), vx: new Float32Array(n), vy: new Float32Array(n), vz: new Float32Array(n), life: new Float32Array(n), max: new Float32Array(n), size: new Float32Array(n), g: new Float32Array(n), r: new Float32Array(n), gr: new Float32Array(n), b: new Float32Array(n) };
    S.pi = 0; const d = new T.Object3D(); d.scale.setScalar(0); d.updateMatrix(); for (let i = 0; i < n; i++) S.pm.setMatrixAt(i, d.matrix);
  }
  S.emit = function (n, x, y, z, speed, up, life, size, c, grav, spread) {
    const p = S.pd, N = S.pn; for (let i = 0; i < n; i++) {
      const k = S.pi; S.pi = (S.pi + 1) % N; const a = Math.random() * TAU, e = (Math.random() - .3) * (spread == null ? 1 : spread), sp = speed * (.3 + Math.random() * .8);
      p.x[k] = x; p.y[k] = y; p.z[k] = z; p.vx[k] = Math.cos(a) * sp * Math.cos(e); p.vz[k] = Math.sin(a) * sp * Math.cos(e); p.vy[k] = Math.sin(e) * sp * .6 + up * (.4 + Math.random() * .8);
      p.life[k] = p.max[k] = life * (.5 + Math.random() * .7); p.size[k] = size * (.5 + Math.random() * .8); p.g[k] = grav; p.r[k] = c[0]; p.gr[k] = c[1]; p.b[k] = c[2];
    }
  };
  function updateParticles(dt) {
    const p = S.pd, N = S.pn, d = S.pDummy || (S.pDummy = new T.Object3D()), col = S.pCol || (S.pCol = new T.Color()), m = S.pm; let any = false;
    for (let i = 0; i < N; i++) {
      if (p.life[i] <= 0) { if (p.size[i] !== 0) { p.size[i] = 0; d.position.set(0, -50, 0); d.scale.setScalar(0); d.updateMatrix(); m.setMatrixAt(i, d.matrix); any = true; } continue; }
      p.life[i] -= dt; p.vy[i] -= p.g[i] * dt; p.vx[i] *= 1 - dt * 1.4; p.vz[i] *= 1 - dt * 1.4; p.x[i] += p.vx[i] * dt; p.y[i] += p.vy[i] * dt; p.z[i] += p.vz[i] * dt;
      if (p.y[i] < .05) { p.y[i] = .05; p.vy[i] *= -.35; }
      const k = Math.max(0, p.life[i] / p.max[i]); d.position.set(p.x[i], p.y[i], p.z[i]); d.scale.setScalar(p.size[i] * (.2 + .8 * k)); d.updateMatrix(); m.setMatrixAt(i, d.matrix);
      m.instanceColor.setXYZ(i, p.r[i] * k + .1, p.gr[i] * k + .1, p.b[i] * k + .1); any = true;
    }
    if (any) { m.instanceMatrix.needsUpdate = true; m.instanceColor.needsUpdate = true; }
  }

  /* ---------- Effekt-Pools (Wellen, Explosionen, Blitze, Warnflächen) ---------- */
  function buildPools() {
    const ringTex = M.ringTexture(), mkRing = () => new T.Mesh(new T.PlaneGeometry(2, 2), new T.MeshBasicMaterial({ map: ringTex, transparent: true, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false, color: new T.Color(1, 1, 1) }));
    S.ringsFx = []; for (let i = 0; i < 10; i++) { const m = mkRing(); m.rotation.x = -Math.PI / 2; m.visible = false; m.renderOrder = 3; S.scene.add(m); S.ringsFx.push({ m, t: 0, d: 0, r0: 1, r1: 1, on: false }); }
    S.ballsFx = []; for (let i = 0; i < 6; i++) { const m = new T.Mesh(new T.SphereGeometry(1, 32, 20), new T.MeshBasicMaterial({ transparent: true, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false, color: new T.Color(3, 1.4, .4), opacity: .8 })); m.visible = false; S.scene.add(m); S.ballsFx.push({ m, t: 0, d: .45, r: 1, on: false }); }
    S.flashLights = []; for (let i = 0; i < 3; i++) { const l = new T.PointLight(0xffa040, 0, 18, 2); S.scene.add(l); S.flashLights.push({ l, t: 0 }); }
    S.boltsFx = []; for (let i = 0; i < 6; i++) { const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(new Float32Array(3 * 40), 3)); const l = []; for (let k = 0; k < 3; k++) { const ln = new T.Line(geo, new T.LineBasicMaterial({ color: new T.Color(2.4, 3, 5), transparent: true, blending: T.AdditiveBlending, toneMapped: false })); ln.visible = false; ln.frustumCulled = false; ln.position.set(k === 1 ? .04 : k === 2 ? -.04 : 0, k === 1 ? .03 : 0, 0); S.scene.add(ln); l.push(ln); } S.boltsFx.push({ geo, lines: l, t: 0, n: 0 }); }
    const st = M.stripeTexture(); st.repeat.set(1, 6);
    S.tele = []; for (let i = 0; i < 4; i++) { const m = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ map: st, transparent: true, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false, color: new T.Color(2, 1, 1) })); m.rotation.x = -Math.PI / 2; m.visible = false; S.scene.add(m); S.tele.push({ m, t: 0, d: 1 }); }
    // Boden-Glanz unter der Spielfigur
    S.footGlow = new T.Mesh(new T.PlaneGeometry(4.2, 4.2), new T.MeshBasicMaterial({ map: M.glowTexture(.15), transparent: true, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false, color: new T.Color(.15, .5, 1.0), opacity: .4 })); S.footGlow.rotation.x = -Math.PI / 2; S.footGlow.position.y = .03; S.scene.add(S.footGlow);
  }
  function ringFx(x, z, r0, r1, d, c) { const f = S.ringsFx.find(r => !r.on) || S.ringsFx[0]; f.on = true; f.t = 0; f.d = d; f.r0 = r0; f.r1 = r1; f.m.position.set(x, .06, z); f.m.material.color.setRGB(c[0], c[1], c[2]); f.m.visible = true; }
  function ballFx(x, y, z, r, d, c) { const f = S.ballsFx.find(r => !r.on) || S.ballsFx[0]; f.on = true; f.t = 0; f.d = d; f.r = r; f.m.position.set(x, y, z); f.m.material.color.setRGB(c[0], c[1], c[2]); f.m.visible = true; }
  function lightFx(x, y, z, inten, col) { const f = S.flashLights.find(r => r.t <= 0) || S.flashLights[0]; f.t = .28; f.l.position.set(x, y, z); f.l.color.setRGB(col[0], col[1], col[2]); f.l.intensity = inten; f.i0 = inten; }
  function updateFx(dt) {
    for (const f of S.ringsFx) if (f.on) { f.t += dt; const k = f.t / f.d; if (k >= 1) { f.on = false; f.m.visible = false; continue; } const r = f.r0 + (f.r1 - f.r0) * (1 - Math.pow(1 - k, 2.2)); f.m.scale.set(r, r, 1); f.m.material.opacity = 1 - k; }
    for (const f of S.ballsFx) if (f.on) { f.t += dt; const k = f.t / f.d; if (k >= 1) { f.on = false; f.m.visible = false; continue; } const r = f.r * (.3 + .7 * (1 - Math.pow(1 - k, 3))); f.m.scale.setScalar(r); f.m.material.opacity = .85 * (1 - k) * (1 - k); }
    for (const f of S.flashLights) if (f.t > 0) { f.t -= dt; f.l.intensity = Math.max(0, f.t / .28) * f.i0; }
    for (const f of S.boltsFx) if (f.t > 0) { f.t -= dt; const on = f.t > 0; f.lines.forEach(l => { l.visible = on; l.material.opacity = Math.max(0, f.t / .2); }); }
    for (const f of S.tele) if (f.t > 0) { f.t -= dt; f.m.visible = f.t > 0; f.m.material.opacity = .6 + .4 * Math.sin(f.t * 30); }
  }

  /* ---------- Helden ---------- */
  S.loadHero = function (h) {
    if (S.figs[h.id]) return S.figs[h.id].p;
    const rec = S.figs[h.id] = { fig: null, p: null, face: 0 };
    if (!S.kit) { rec.p = Promise.resolve(null); return rec.p; }
    rec.p = S.kit.make(h.look).then(f => {
      rec.fig = f; f.root.visible = false; f.root.traverse(o => { if (o.isMesh) { o.castShadow = !S.low; o.frustumCulled = false; } });
      const gun = new T.Group(), body = new T.Mesh(M.rbox(.09, .12, .34, .03, 4), new T.MeshStandardMaterial({ color: 0x222836, metalness: .9, roughness: .25, envMapIntensity: 1.5 })), barrel = new T.Mesh(new T.CylinderGeometry(.018, .022, .26, 20), new T.MeshStandardMaterial({ color: 0x9aa4bb, metalness: 1, roughness: .2 })), core = new T.Mesh(new T.SphereGeometry(.03, 16, 12), new T.MeshBasicMaterial({ color: new T.Color(.4, 2, 3), toneMapped: false }));
      barrel.rotation.x = Math.PI / 2; barrel.position.set(0, .02, .26); core.position.set(0, .07, .08); gun.add(body, barrel, core); gun.position.set(0, .02, .08); gun.rotation.set(0, 0, 0);
      const hand = f.bones && (f.bones.hand_r || f.bones.Hand_R); if (hand) { hand.add(gun); gun.scale.setScalar(1 / (f.root.scale.y * (f.scene.scale.y || 1))); } rec.gun = gun;
      S.scene.add(f.root); return f;
    }).catch(e => { console.warn('Figur', e); return null; });
    return rec.p;
  };
  S.useHero = function (h) { S.heroId = h.id; for (const k in S.figs) if (S.figs[k].fig) S.figs[k].fig.root.visible = (k === h.id); S.curRec = S.figs[h.id]; };
  S.heroAnim = function (name, o) { const r = S.curRec; if (r && r.fig) r.fig.play(name, o); };

  /* ---------- Karte ---------- */
  S.setMap = function (map) {
    S.map = map; const sc = S.scene, a = new T.Color(map.accent), b = new T.Color(map.accent2);
    sc.background = new T.Color(map.sky); sc.fog = new T.FogExp2(map.fog, .0105);
    S.floorMat.color.set(map.floor).lerp(new T.Color(0xffffff), .35); S.floorMat.emissive.copy(a); S.floorMat.emissive.multiplyScalar(1);
    S.neonMat.color.copy(a).multiplyScalar(2.4); S.emblemMat.color.copy(a).multiplyScalar(1.6);
    S.hemi.color.set(map.light); S.hemi.groundColor.set(map.sky); S.key.color.set(map.light); S.rim.color.copy(b); S.glow.color.copy(a);
    S.beamMat.uniforms.uC.value.copy(a).multiplyScalar(1.5); S.beams.children.forEach((m, i) => { /* Farbe wechselt */ });
    const col = new T.Color(); if (S.decor) for (let i = 0; i < 14; i++) S.decor.setColorAt(i, col.copy(i % 2 ? a : b).multiplyScalar(1.8)); if (S.decor && S.decor.instanceColor) S.decor.instanceColor.needsUpdate = true;
    S.dust.material.color.copy(a).multiplyScalar(1.1);
  };

  /* ---------- Größe und Bild-Puffer ---------- */
  S.resize = function () {
    const w = S.container.clientWidth || innerWidth, h = S.container.clientHeight || innerHeight; S.w = w; S.h = h;
    S.renderer.setSize(w, h, false); S.renderer.domElement.style.width = '100%'; S.renderer.domElement.style.height = '100%';
    S.cam.aspect = w / h; S.cam.fov = w / h < .8 ? 52 : 44; S.cam.updateProjectionMatrix(); S.aspect = w / h;
    if (S.post) makePost(Math.floor(w * S.dpr), Math.floor(h * S.dpr));
  };
  function makePost(w, h) {
    const R = S.renderer, ext = R.extensions.has('EXT_color_buffer_float') || R.extensions.has('EXT_color_buffer_half_float');
    const type = ext ? T.HalfFloatType : T.UnsignedByteType, opt = { type, format: T.RGBAFormat, minFilter: T.LinearFilter, magFilter: T.LinearFilter, depthBuffer: true, stencilBuffer: false };
    if (S.rtScene) { S.rtScene.dispose(); S.chain.forEach(c => { c.a.dispose(); c.b.dispose(); }); }
    S.rtScene = T.WebGLMultisampleRenderTarget ? new T.WebGLMultisampleRenderTarget(w, h, opt) : new T.WebGLRenderTarget(w, h, opt);
    if (S.rtScene.samples !== undefined) S.rtScene.samples = S.mobile ? 2 : 4;
    S.hdr = ext; S.chain = []; let cw = w, ch = h;
    const o2 = { type, format: T.RGBAFormat, minFilter: T.LinearFilter, magFilter: T.LinearFilter, depthBuffer: false };
    for (let i = 0; i < 4; i++) { cw = Math.max(2, cw >> 1); ch = Math.max(2, ch >> 1); S.chain.push({ a: new T.WebGLRenderTarget(cw, ch, o2), b: new T.WebGLRenderTarget(cw, ch, o2), w: cw, h: ch }); }
    if (!S.quad) {
      S.ocam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1); S.qscene = new T.Scene(); S.quad = new T.Mesh(new T.PlaneGeometry(2, 2), null); S.quad.frustumCulled = false; S.qscene.add(S.quad);
      S.mBright = new T.ShaderMaterial({ uniforms: { tIn: { value: null }, uTh: { value: 1 } }, vertexShader: VERT, fragmentShader: BRIGHT, depthTest: false, depthWrite: false });
      S.mBlur = new T.ShaderMaterial({ uniforms: { tIn: { value: null }, uDir: { value: new T.Vector2() } }, vertexShader: VERT, fragmentShader: BLUR, depthTest: false, depthWrite: false });
      S.mComp = new T.ShaderMaterial({ uniforms: { tScene: { value: null }, tB0: { value: null }, tB1: { value: null }, tB2: { value: null }, tB3: { value: null }, uBloom: { value: .42 }, uExp: { value: 1.08 }, uVig: { value: .55 }, uHurt: { value: 0 }, uTime: { value: 0 }, uChroma: { value: .0015 }, uGrain: { value: .018 }, uFlash: { value: 0 } }, vertexShader: VERT, fragmentShader: COMP, depthTest: false, depthWrite: false });
    }
  }
  function pass(mat, target) { S.quad.material = mat; S.renderer.setRenderTarget(target); S.renderer.render(S.qscene, S.ocam); }
  S.render = function () {
    const R = S.renderer;
    if (!S.post) { R.render(S.scene, S.cam); return; }
    R.setRenderTarget(S.rtScene); R.clear(); R.render(S.scene, S.cam);
    S.mBright.uniforms.tIn.value = S.rtScene.texture; S.mBright.uniforms.uTh.value = S.hdr ? 1.25 : .8; pass(S.mBright, S.chain[0].a);
    let src = S.chain[0].a.texture;
    for (let i = 0; i < 4; i++) {
      const c = S.chain[i];
      S.mBlur.uniforms.tIn.value = src; S.mBlur.uniforms.uDir.value.set(1 / c.w, 0); pass(S.mBlur, c.b);
      S.mBlur.uniforms.tIn.value = c.b.texture; S.mBlur.uniforms.uDir.value.set(0, 1 / c.h); pass(S.mBlur, c.a);
      src = c.a.texture;
    }
    const u = S.mComp.uniforms; u.tScene.value = S.rtScene.texture; u.tB0.value = S.chain[0].a.texture; u.tB1.value = S.chain[1].a.texture; u.tB2.value = S.chain[2].a.texture; u.tB3.value = S.chain[3].a.texture;
    u.uTime.value = S.time % 100; u.uHurt.value = S.hurtA; u.uFlash.value = S.flashA; u.uChroma.value = .0012 + S.hurtA * .01 + S.dashA * .006;
    pass(S.mComp, null);
  };

  /* ---------- Ereignisse → Effekte ---------- */
  const shake = a => { S.shakeA = Math.min(1.6, Math.max(S.shakeA, a)); };
  S.shake = shake;
  S.fx = function (e, W) {
    const P = W && W.P, acc = S.map ? new T.Color(S.map.accent) : new T.Color(0x2bd9ff);
    switch (e.k) {
      case 'hit': S.emit(3, e.x, 1, e.z, 6, 3, .35, .1, [3, 2, .8], 14); dmgNum(e); break;
      case 'kill': { const t = TINT[e.type] || [1, 1, 1], n = e.boss ? 90 : e.elite ? 30 : 10; S.emit(n, e.x, .8, e.z, e.boss ? 14 : 6, 4, .6, e.boss ? .3 : .13, [t[0] * 2.4, t[1] * 2.4, t[2] * 2.4], 12);
        if (e.boss) { ballFx(e.x, 2, e.z, 9, .9, [3, 1.8, .8]); ringFx(e.x, e.z, 1, 16, .8, [3, 1.6, .6]); shake(1.2); lightFx(e.x, 4, e.z, 80, [1, .7, .3]); } else if (e.elite) { ringFx(e.x, e.z, .5, 4, .4, [t[0] * 2, t[1] * 2, t[2] * 2]); shake(.25); } break; }
      case 'gem': if (P) S.emit(1, P.x, 1, P.z, 3, 4, .3, .08, [.5, 2, 3], 6); break;
      case 'coin': if (P) S.emit(5, P.x, 1.2, P.z, 4, 5, .45, .1, [3, 2.2, .4], 9); break;
      case 'heal': if (P) { S.emit(24, P.x, .5, P.z, 3, 7, 1, .13, [.5, 3, .9], -2); ringFx(P.x, P.z, .6, 3, .6, [.4, 2.4, .8]); } break;
      case 'magnet': if (P) ringFx(P.x, P.z, 1, 26, .8, [2, .4, .4]); break;
      case 'dash': S.emit(18, e.x, .3, e.z, 5, 1.5, .5, .2, [1, 1.6, 2.4], 3); ringFx(e.x, e.z, .4, 2.6, .35, [.6, 1.6, 2.4]); S.dashA = 1; break;
      case 'nova': if (P) { ringFx(P.x, P.z, .6, e.r, e.r / 15 + .15, [1.2, 2, 3]); S.emit(26, P.x, .5, P.z, 7, 2, .5, .11, [1, 2, 3], 5); shake(.18); } break;
      case 'boom': { ballFx(e.x, .9, e.z, e.r * .8, e.big ? .55 : .35, [3, 1.5, .5]); ringFx(e.x, e.z, .5, e.r * 1.15, .45, [3, 1.8, .6]); S.emit(e.big ? 40 : 18, e.x, .6, e.z, e.big ? 9 : 6, 6, .7, .15, [3, 1.8, .6], 12); lightFx(e.x, 3, e.z, e.big ? 60 : 30, [1, .65, .3]); shake(e.big ? .5 : .22); break; }
      case 'bolt': { const f = S.boltsFx.find(b => b.t <= 0) || S.boltsFx[0], pts = e.pts, arr = f.geo.attributes.position.array; let n = 0; const segs = Math.min(10, pts.length - 1);
        for (let i = 0; i < segs && n < 36; i++) { const a = pts[i], b = pts[i + 1], m = 3; for (let k = 0; k < m && n < 38; k++) { const t = k / m, j = k ? .5 : 0; arr[n * 3] = a[0] + (b[0] - a[0]) * t + (Math.random() - .5) * j; arr[n * 3 + 1] = a[1] + (b[1] - a[1]) * t + (Math.random() - .5) * j + (k ? 0 : 0); arr[n * 3 + 2] = a[2] + (b[2] - a[2]) * t + (Math.random() - .5) * j; n++; } }
        const l = pts[Math.min(segs, pts.length - 1)]; arr[n * 3] = l[0]; arr[n * 3 + 1] = l[1]; arr[n * 3 + 2] = l[2]; n++; f.geo.setDrawRange(0, n); f.geo.attributes.position.needsUpdate = true; f.t = .2; f.lines.forEach(x => { x.visible = true; });
        for (let i = 1; i < pts.length; i++) S.emit(3, pts[i][0], 1, pts[i][2], 4, 2, .3, .09, [2, 2.6, 4], 8); lightFx(pts[pts.length - 1][0], 2, pts[pts.length - 1][2], 18, [.5, .7, 1]); break; }
      case 'shoot': if (P) { S.emit(3, P.x + P.fx * .9, 1.3, P.z + P.fz * .9, 3, 1, .15, .12, [3, 2.4, 1], 0); } break;
      case 'hurt': shake(.55); S.hurtA = 1; if (P) S.emit(14, P.x, 1.2, P.z, 5, 3, .5, .14, [3, .5, .4], 9); break;
      case 'warn': { const f = S.tele.find(t => t.t <= 0) || S.tele[0]; f.t = .9; f.m.visible = true; const len = 26; f.m.scale.set(5, len, 1); f.m.position.set(e.x + Math.cos(e.a) * len / 2, .08, e.z + Math.sin(e.a) * len / 2);
        const th = Math.atan2(-Math.cos(e.a), -Math.sin(e.a)); f.m.quaternion.setFromAxisAngle(new T.Vector3(0, 1, 0), th).multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(1, 0, 0), -Math.PI / 2)); break; }
      case 'quake': shake(.9); ringFx(W.boss ? W.boss.x : 0, W.boss ? W.boss.z : 0, 1, 14, .6, [2.5, 1, .6]); break;
      case 'roar': shake(.6); break;
      case 'boss': shake(.8); break;
      case 'levelup': if (P) { ringFx(P.x, P.z, .5, 7, .7, [3, 2.4, .8]); S.emit(40, P.x, .4, P.z, 6, 8, 1.1, .14, [3, 2.4, .8], 3); } break;
      case 'chest': if (P) { S.emit(50, P.x, 1, P.z, 7, 9, 1.2, .16, [3, 2.2, .6], 5); ringFx(P.x, P.z, .5, 9, .8, [3, 2.2, .6]); } break;
      case 'revive': if (P) { ringFx(P.x, P.z, 1, 22, .8, [.6, 2.4, 3]); ballFx(P.x, 1.2, P.z, 14, .7, [.6, 2, 3]); shake(1); } break;
      case 'win': S.flashA = .6; break;
    }
  };
  function dmgNum(e) {
    if (!S.dmgPool || !S.dmgPool.length || S.low) return;
    const d = S.dmgPool[S.dmgI]; S.dmgI = (S.dmgI + 1) % S.dmgPool.length; d.t = .7; d.x = e.x + (Math.random() - .5) * .7; d.z = e.z + (Math.random() - .5) * .5; d.y = 1.8; d.el.textContent = e.d; d.el.className = 'dmg' + (e.c ? ' crit' : '') + (e.big ? ' big' : ''); d.el.hidden = false;
  }
  const _v = new T.Vector3();
  S.project = function (x, y, z) { _v.set(x, y, z).project(S.cam); return [(_v.x * .5 + .5) * S.w, (-_v.y * .5 + .5) * S.h, _v.z]; };
  function updateDmg(dt) {
    if (!S.dmgPool) return; for (const d of S.dmgPool) { if (d.t <= 0) continue; d.t -= dt; if (d.t <= 0) { d.el.hidden = true; continue; } d.y += dt * 2.2; const p = S.project(d.x, d.y, d.z); d.el.style.transform = `translate(${p[0].toFixed(0)}px,${p[1].toFixed(0)}px) translate(-50%,-50%) scale(${(0.7 + Math.min(.3, d.t * 1.5)).toFixed(2)})`; d.el.style.opacity = Math.min(1, d.t * 3); }
  }

  /* ---------- Welt zeichnen ---------- */
  const _d = new T.Object3D(), _c = new T.Color(), _w = new T.Color(2.6, 2.6, 2.6);
  S.sync = function (W, dt) {
    const t = W.t, P = W.P, counts = S.cnt || (S.cnt = {});
    for (const k in S.en) counts[k] = 0; let ne = 0;
    for (let i = 0; i < W.en.length; i++) {
      const e = W.en[i], m = S.en[e.type], k = counts[e.type]++; if (k >= CAP[e.type]) continue;
      const def = FS.EN[e.type], base = e.r / def.r, sp = e.spawn > 0 ? Math.max(0, 1 - e.spawn / (e.boss ? 1.2 : .45)) : 1, sz = base * (e.spawn > 0 ? Math.max(.01, ease(sp)) : 1);
      const bob = Math.sin(t * (e.boss ? 3 : 9) + e.wob), sq = 1 + bob * (e.boss ? .02 : .055);
      _d.position.set(e.x, e.spawn > 0 ? -(1 - sp) * .8 : Math.max(0, bob) * (e.type === 'knack' ? .12 : .05), e.z);
      _d.rotation.set(e.type === 'blitz' && e.st === 2 ? .35 : 0, e.face, e.type === 'splitt' ? bob * .05 : 0);
      _d.scale.set(sz / Math.sqrt(sq), sz * sq, sz / Math.sqrt(sq)); _d.updateMatrix(); m.setMatrixAt(k, _d.matrix);
      const tn = TINT[e.type]; let fl = e.flash > 0;
      if (fl) _c.copy(_w); else { _c.setRGB(tn[0], tn[1], tn[2]); if (e.type === 'blitz' && e.st === 1) _c.setRGB(3, .6 + Math.sin(t * 40) * .5, .5); if (e.elite) _c.multiplyScalar(1.5); else if (e.boss && e.hp < e.maxHp * .5) _c.multiplyScalar(1.3 + .3 * Math.sin(t * 6)); }
      m.instanceColor.setXYZ(k, _c.r, _c.g, _c.b);
      if ((e.elite || e.boss) && ne < 80) { _d.position.set(e.x, .05, e.z); _d.rotation.set(Math.PI / 2, 0, 0); _d.scale.setScalar(e.r * (1.3 + .06 * Math.sin(t * 5))); _d.updateMatrix(); S.eliteRing.setMatrixAt(ne, _d.matrix); S.eliteRing.instanceColor.setXYZ(ne, e.boss ? 3 : 2.6, e.boss ? .5 : 2, e.boss ? .4 : .3); ne++; }
    }
    for (const k in S.en) { const m = S.en[k]; m.count = Math.min(counts[k], CAP[k]); m.instanceMatrix.needsUpdate = true; m.instanceColor.needsUpdate = true; }
    S.eliteRing.count = ne; S.eliteRing.instanceMatrix.needsUpdate = true; S.eliteRing.instanceColor.needsUpdate = true; S.eliteRing.material.color.setRGB(1, 1, 1);
    // Kristalle
    const gt = [[.2, .7, 2.6], [.3, 2.4, .6], [1.6, .5, 2.6], [3, .5, .4]]; let gi = 0;
    for (let i = 0; i < W.gems.length && gi < 560; i++, gi++) { const g = W.gems[i], tier = g.v >= 100 ? 3 : g.v >= 25 ? 2 : g.v >= 5 ? 1 : 0, s = 0.8 + tier * .35 + (tier > 2 ? .4 : 0);
      _d.position.set(g.x, .55 + Math.sin(t * 3 + g.ph) * .12, g.z); _d.rotation.set(0, t * 2 + g.ph, 0); _d.scale.setScalar(s); _d.updateMatrix(); S.gems.setMatrixAt(gi, _d.matrix); const c = gt[tier]; S.gems.instanceColor.setXYZ(gi, c[0], c[1], c[2]); }
    S.gems.count = gi; S.gems.instanceMatrix.needsUpdate = true; S.gems.instanceColor.needsUpdate = true;
    // Münzen und Gegenstände
    let ci = 0; const used = { heart: 0, chest: 0, bomb: 0, magnet: 0 };
    for (const p of W.pk) {
      if (p.k === 'coin') { if (ci >= 80) continue; _d.position.set(p.x, .6 + Math.sin(t * 4 + p.ph) * .1, p.z); _d.rotation.set(Math.PI / 2 * 0, t * 4 + p.ph, 0); _d.rotation.x = .3; _d.scale.setScalar(1.15); _d.updateMatrix(); S.coins.setMatrixAt(ci++, _d.matrix); continue; }
      const arr = S.pkMesh[p.k]; const m = arr && arr[used[p.k]++]; if (!m) continue; m.visible = true; const k = p.k === 'chest' ? 1.2 : 1;
      m.position.set(p.x, (p.k === 'heart' ? .95 : .15) + Math.sin(t * 3 + p.ph) * .1, p.z); m.rotation.set(0, t * 1.6 + p.ph, 0); m.scale.setScalar(k * (p.life < 3 && Math.sin(t * 20) > 0 ? .0 : 1));
    }
    S.coins.count = ci; S.coins.instanceMatrix.needsUpdate = true;
    for (const k in S.pkMesh) for (let i = used[k]; i < S.pkMesh[k].length; i++) S.pkMesh[k][i].visible = false;
    // Geschosse
    let bi = 0; for (const b of W.pb) { if (bi >= 160) break; _d.position.set(b.x, 1.2, b.z); _d.rotation.set(0, Math.atan2(b.vx, b.vz), 0); _d.scale.setScalar(1); _d.updateMatrix(); S.bolts.setMatrixAt(bi, _d.matrix); S.bolts.instanceColor.setXYZ(bi, 1.0, 3.4, 4.2); bi++; } S.bolts.count = bi; S.bolts.instanceMatrix.needsUpdate = true; S.bolts.instanceColor.needsUpdate = true;
    let ei = 0; for (const b of W.eb) { if (ei >= 400) break; const pu = 1 + Math.sin(t * 14 + ei) * .12; _d.position.set(b.x, 1, b.z); _d.rotation.set(0, 0, 0); _d.scale.setScalar(pu); _d.updateMatrix(); S.ebul.setMatrixAt(ei, _d.matrix); S.ebul.instanceColor.setXYZ(ei, 2.6, .8, .4); S.ehalo.setMatrixAt(ei, _d.matrix); S.ehalo.instanceColor.setXYZ(ei, 2, .35, .15); ei++; }
    S.ebul.count = ei; S.ehalo.count = ei; for (const m of [S.ebul, S.ehalo]) { m.instanceMatrix.needsUpdate = true; m.instanceColor.needsUpdate = true; }
    let mi = 0; for (const m of W.ms) { if (mi >= 30) break; _d.position.set(m.x, 1.1, m.z); _d.rotation.set(0, Math.atan2(m.vx, m.vz), 0); _d.scale.setScalar(1); _d.updateMatrix(); S.msl.setMatrixAt(mi++, _d.matrix); if (Math.random() < .8) S.emit(1, m.x - m.vx * .03, 1.1, m.z - m.vz * .03, 1, .2, .35, .16, [3, 1.5, .4], 0, .3); } S.msl.count = mi; S.msl.instanceMatrix.needsUpdate = true;
    // Bomben im Flug (einzelne Kugeln)
    const bm = S.bombFly || (S.bombFly = (() => { const a = []; for (let i = 0; i < 6; i++) { const mm = new T.Mesh(M.bombGeo(), S.matGlow); mm.visible = false; mm.scale.setScalar(.8); const col = new T.Color(1.6, .6, .3); mm.userData.c = col; S.scene.add(mm); a.push(mm); } return a; })());
    let bj = 0; for (const b of W.bombs) { if (bj >= 6) break; const u = b.t / b.dur, m = bm[bj++]; m.visible = true; m.position.set(b.x0 + (b.x1 - b.x0) * u, 0.4 + Math.sin(u * Math.PI) * 5, b.z0 + (b.z1 - b.z0) * u); m.rotation.y = t * 6; m.rotation.x = t * 3; ringFxLand(b, u); }
    for (; bj < 6; bj++) bm[bj].visible = false;
    // Platten
    let oi = 0; for (const o of W.orbit) { if (oi >= 12) break; _d.position.set(o.x, 1, o.z); _d.rotation.set(0, -o.a * 3, 0); _d.scale.setScalar(o.s * 2.1); _d.updateMatrix(); S.disc.setMatrixAt(oi, _d.matrix); _d.rotation.set(0, 0, 0); S.discGlow.setMatrixAt(oi, _d.matrix); S.discGlow.instanceColor.setXYZ(oi, 1.2, 2.2, 3.4); oi++; }
    S.disc.count = oi; S.discGlow.count = oi; S.disc.instanceMatrix.needsUpdate = true; S.discGlow.instanceMatrix.needsUpdate = true; S.discGlow.instanceColor.needsUpdate = true;
    // Spielfigur
    const rec = S.curRec; S.footGlow.position.set(P.x, .03, P.z); S.footGlow.material.opacity = .3 + .1 * Math.sin(t * 3);
    if (rec && rec.fig) {
      const f = rec.fig, sp = P.moving; f.root.visible = true; f.root.position.set(P.x, 0, P.z); f.root.scale.setScalar(1.3); rec.face = lerpAng(rec.face, Math.atan2(P.fx, P.fz), Math.min(1, dt * 14)); f.root.rotation.y = rec.face;
      let clip = 'idle', spd = 1, once = false;
      if (W.state === 'dead') { clip = 'down'; once = true; } else if (W.state === 'won') clip = 'dance'; else if (P.dash > 0) { clip = 'roll'; spd = 1.9; once = true; } else if (sp > .6) { clip = sp > 7.2 ? 'sprint' : 'jog'; spd = Math.max(.7, Math.min(1.5, sp / (clip === 'sprint' ? 7.5 : 5.2))); }
      if (clip !== rec.clip) { f.play(clip, { once, fade: clip === 'roll' ? .06 : .18, restart: clip === 'roll' }); rec.clip = clip; } f.speed(spd); f.update(dt);
      if (P.shootT > 0 && W.state === 'play' && P.dash <= 0) f.aimArm('r', new T.Vector3(P.fx, .18, P.fz).normalize(), Math.min(1, P.shootT * 8));
      f.root.visible = !(P.hurtT > 0 && Math.floor(t * 20) % 2 === 0 && W.state === 'play');
    }
    S.glow.position.set(P.x, 2.6, P.z);
  };
  function ringFxLand(b, u) { if (u > .6 && !b.warn) { b.warn = true; ringFx(b.x1, b.z1, b.rad * .3, b.rad, .3, [1.5, .5, .3]); } }

  /* ---------- Bild für Bild ---------- */
  const OFF = new T.Vector3(0, 16, 9.8);
  S.setMode = function (m) { S.mode = m; S.cinema = 0; };
  S.update = function (dt, W) {
    S.time += dt; S.uTime.value = S.time; S.hurtA = Math.max(0, S.hurtA - dt * 2.4); S.flashA = Math.max(0, S.flashA - dt * 1.6); S.dashA = Math.max(0, (S.dashA || 0) - dt * 4);
    const P = W ? W.P : { x: 0, z: 0, vx: 0, vz: 0 }, cam = S.cam, asp = S.aspect || 1, k = Math.min(1, dt * 5);
    if (S.mode === 'menu') {
      S.cinema += dt * .18; const a = Math.PI + Math.sin(S.cinema) * .6, r = S.menuDist || 5.6;
      const tx = Math.sin(a) * r, tz = Math.cos(a) * r; S.camPos.set(tx, 1.7 + Math.sin(S.cinema * .7) * .15, tz); S.camLook.set(0, S.menuLook == null ? 1.1 : S.menuLook, 0);
      const sh = (S.aspect > 1.25 ? (S.menuShift || 0) : 0); if (sh) { const fw = new T.Vector3().subVectors(S.camLook, S.camPos).normalize(), rt = new T.Vector3().crossVectors(fw, new T.Vector3(0, 1, 0)).normalize(); S.camPos.addScaledVector(rt, sh); S.camLook.addScaledVector(rt, sh); }
      cam.position.lerp(S.camPos, Math.min(1, dt * 3)); cam.lookAt(S.camLook);
      if (S.curRec && S.curRec.fig) { const f = S.curRec.fig; f.root.visible = true; f.root.position.set(0, 0, 0); S.curRec.face = lerpAng(S.curRec.face || 0, Math.atan2(cam.position.x, cam.position.z) + .25, Math.min(1, dt * 4)); f.root.rotation.y = S.curRec.face; f.root.scale.setScalar(1.12); f.update(dt); }
      S.footGlow.position.set(0, .03, 0); for (const k in S.pkMesh) S.pkMesh[k].forEach(m => { m.visible = false; }); if (S.bombFly) S.bombFly.forEach(m => { m.visible = false; }); S.glow.position.set(1.5, 2.4, 2); for (const key in S.en) S.en[key].count = 0; S.gems.count = 0; S.coins.count = 0; S.bolts.count = 0; S.ebul.count = 0; S.ehalo.count = 0; S.msl.count = 0; S.disc.count = 0; S.discGlow.count = 0; S.eliteRing.count = 0;
    } else {
      const lead = .22, tx = P.x + (P.vx || 0) * lead, tz = P.z + (P.vz || 0) * lead, zoom = asp < .8 ? 1.35 : asp < 1.2 ? 1.15 : 1;
      S.camPos.set(tx + OFF.x * 0, 0, tz); const cx = tx * .96, cz = tz * .96;
      const want = new T.Vector3(cx + OFF.x * 0, OFF.y * zoom, cz + OFF.z * zoom); cam.position.lerp(want, k); S.camLook.lerp(new T.Vector3(cx, .8, cz - 1.5), k);
      if (S.shakeA > 0) { S.shakeA = Math.max(0, S.shakeA - dt * 2.4); cam.position.x += (Math.random() - .5) * S.shakeA * .6; cam.position.y += (Math.random() - .5) * S.shakeA * .4; cam.position.z += (Math.random() - .5) * S.shakeA * .6; }
      if (S.snap) { cam.position.copy(want); S.camLook.set(cx, .8, cz - 1.5); S.snap = false; }
      if (S.dbg) { cam.position.fromArray(S.dbg.pos); S.camLook.fromArray(S.dbg.look); }
      cam.lookAt(S.camLook);
    }
    const tp = P.x, tz2 = P.z;
    S.key.position.set(tp + 16, 34, tz2 + 12); S.key.target.position.set(tp, 0, tz2); S.key.target.updateMatrixWorld();
    // Staub und Lichtkegel
    const dp = S.dust.geometry.attributes.position.array; for (let i = 0; i < dp.length; i += 3) { dp[i + 1] += dt * .25; if (dp[i + 1] > 15) dp[i + 1] = .4; dp[i] += Math.sin(S.time * .3 + i) * dt * .15; }
    S.dust.geometry.attributes.position.needsUpdate = true; S.dust.position.set(Math.round(tp / 35) * 35, 0, Math.round(tz2 / 35) * 35);
    S.beams.children.forEach((m, i) => { const a = m.userData.a + S.time * .05 * (i % 2 ? 1 : -1); m.position.set(Math.cos(a) * 84, 52, Math.sin(a) * 84); m.lookAt(Math.sin(S.time * .4 + m.userData.ph) * 24, 0, Math.cos(S.time * .33 + m.userData.ph) * 24); m.rotateX(-Math.PI / 2); });
    const beat = Math.pow(Math.max(0, Math.sin(S.time * Math.PI * 2 * (128 / 60))), 6); S.floorMat.emissiveIntensity = .9 + beat * .9; S.emblemMat.opacity = .45 + beat * .25;
    updateParticles(dt); updateFx(dt); updateDmg(dt);
  };

  root.FSScene = S;
})(typeof window !== 'undefined' ? window : globalThis);
