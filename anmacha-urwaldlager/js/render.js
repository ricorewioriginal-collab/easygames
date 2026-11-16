/* Urwaldlager – Darstellung: Renderer, Qualität, Kulissen (Dschungel / TV-Studio), Effekte */
(function () {
  'use strict';
  const UL = window.UL, T = THREE;
  const R = UL.R = {};
  const lin = c => new T.Color(c).convertSRGBToLinear();
  R.lin = lin;

  R.init = () => {
    const cv = document.getElementById('gl');
    const q = R.quality();
    const r = R.renderer = new T.WebGLRenderer({ canvas: cv, antialias: q !== 'low', powerPreference: 'high-performance' });
    r.outputEncoding = T.sRGBEncoding;
    r.shadowMap.enabled = q !== 'low';
    r.shadowMap.type = T.PCFSoftShadowMap;
    R.pixel = q === 'low' ? 0.75 : q === 'mid' ? Math.min(1.5, devicePixelRatio) : Math.min(2, devicePixelRatio);
    R.scale = 1;
    R.resize();
    addEventListener('resize', R.resize);
    addEventListener('orientationchange', () => setTimeout(R.resize, 200));
  };
  R.quality = () => {
    const s = UL.settings.quality;
    if (s !== 'auto') return s;
    return UL.mobile ? 'mid' : 'high';
  };
  R.resize = () => {
    const w = innerWidth, h = innerHeight;
    R.renderer.setPixelRatio(R.pixel * R.scale);
    R.renderer.setSize(w, h, false);
    R.aspect = w / h;
    if (R.stage && R.stage.camera) { R.stage.camera.aspect = R.aspect; R.fitFov(R.stage.camera); R.stage.camera.updateProjectionMatrix(); }
    document.documentElement.classList.toggle('portrait', UL.portrait());
    UL.emit('resize');
  };
  // Hochformat: Blickwinkel weiter, damit genug zu sehen ist
  R.fitFov = (cam) => { const base = cam.userData.fov || 55; cam.userData.fov = base; cam.fov = R.aspect < 1 ? Math.min(85, base * (1 + (1 - R.aspect) * 0.75)) : base; };
  R.camera = (fov = 55, near = 0.1, far = 400) => { const c = new T.PerspectiveCamera(fov, R.aspect || 1.6, near, far); c.userData.fov = fov; R.fitFov(c); c.updateProjectionMatrix(); return c; };

  // Bühne wechseln: { scene, camera, update(dt), dispose() }
  R.set = (stage) => {
    if (R.stage && R.stage.dispose) try { R.stage.dispose(); } catch (e) { console.error(e); }
    R.stage = stage;
    if (stage && stage.camera) { stage.camera.aspect = R.aspect; R.fitFov(stage.camera); stage.camera.updateProjectionMatrix(); }
  };
  // Bildrate beobachten und Auflösung anpassen
  let acc = 0, frames = 0;
  R.adapt = (dt) => {
    acc += dt; frames++;
    if (acc < 2.5) return;
    const fps = frames / acc; acc = 0; frames = 0;
    if (UL.settings.quality !== 'auto') return;
    if (fps < 32 && R.scale > 0.6) { R.scale = Math.max(0.6, R.scale - 0.12); R.resize(); }
    else if (fps > 56 && R.scale < 1) { R.scale = Math.min(1, R.scale + 0.08); R.resize(); }
  };
  R.shake = 0;
  R.render = (dt) => {
    const s = R.stage; if (!s || !s.scene || !s.camera) return;
    if (R.shake > 0 && UL.settings.shake) {
      R.shake = Math.max(0, R.shake - dt * 2.5);
      const k = R.shake * 0.12; s.camera.position.x += (Math.random() - 0.5) * k; s.camera.position.y += (Math.random() - 0.5) * k;
    }
    R.renderer.render(s.scene, s.camera);
  };

  // ---------- Grundbausteine ----------
  const matC = new Map();
  R.mat = (c, opts) => {
    const k = c + JSON.stringify(opts || {});
    if (!matC.has(k)) matC.set(k, new T.MeshLambertMaterial(Object.assign({ color: lin(c) }, opts || {})));
    return matC.get(k);
  };
  R.basic = (c, opts) => new T.MeshBasicMaterial(Object.assign({ color: lin(c) }, opts || {}));

  // Stern (Belohnung): flacher, dicker 5-Zack, golden leuchtend
  let starGeo = null;
  R.starGeo = () => {
    if (starGeo) return starGeo;
    const sh = new T.Shape();
    for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + Math.PI / 2, r = i % 2 ? 0.2 : 0.5; const x = Math.cos(a) * r, y = Math.sin(a) * r; i ? sh.lineTo(x, y) : sh.moveTo(x, y); }
    starGeo = new T.ExtrudeGeometry(sh, { depth: 0.14, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 1 });
    starGeo.center();
    return starGeo;
  };
  const starMat = new T.MeshLambertMaterial({ color: lin(0xffd23a), emissive: lin(0x8a5a00) });
  R.star = (size = 1) => { const m = new T.Mesh(R.starGeo(), starMat); m.scale.setScalar(size); m.castShadow = true; return m; };

  // Schrift-Tafel (Canvas → Textur)
  R.textTex = (lines, { w = 512, h = 256, bg = '#0b2b1c', fg = '#fff', font = 'bold 64px system-ui', accent = '#ffcf3a' } = {}) => {
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const c = cv.getContext('2d');
    if (bg) { c.fillStyle = bg; c.fillRect(0, 0, w, h); }
    c.textAlign = 'center'; c.textBaseline = 'middle';
    (Array.isArray(lines) ? lines : [lines]).forEach((l, i, a) => { c.fillStyle = i === 0 ? accent : fg; c.font = i === 0 ? font : font.replace(/\d+px/, m => Math.round(parseInt(m) * 0.6) + 'px'); c.fillText(l, w / 2, h / 2 + (i - (a.length - 1) / 2) * h / (a.length + 0.6)); });
    const t = new T.CanvasTexture(cv); t.encoding = T.sRGBEncoding; t.anisotropy = 4; return t;
  };
  R.sign = (lines, w = 2, h = 1, opts) => new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map: R.textTex(lines, opts), transparent: !!(opts && opts.bg === null) }));

  // Feuer: flackernde Flammen (additiv) + Licht
  R.fire = (size = 1) => {
    const g = new T.Group();
    const mat = new T.ShaderMaterial({
      uniforms: { t: { value: 0 } }, transparent: true, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide,
      vertexShader: 'varying vec2 v; void main(){ v=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader: 'uniform float t; varying vec2 v; void main(){ float x=v.x-.5; float n=sin(v.y*9.0-t*7.0+x*5.0)*.08+sin(v.y*17.0-t*11.0)*.04; float w=(1.0-v.y)*.42+n; float a=smoothstep(w,w*.35,abs(x+n*.6))*smoothstep(1.0,.55,v.y)*smoothstep(0.0,.12,v.y); vec3 c=mix(vec3(1.0,.95,.5),vec3(1.0,.35,.05),v.y); gl_FragColor=vec4(c*a*1.4,a);}'
    });
    for (let i = 0; i < 3; i++) { const p = new T.Mesh(new T.PlaneGeometry(0.9 * size, 1.4 * size), mat); p.position.y = 0.6 * size; p.rotation.y = i / 3 * Math.PI; g.add(p); }
    const light = new T.PointLight(lin(0xff9a3a), 1.6, 12 * size, 1.6); light.position.y = 0.9 * size; g.add(light);
    g.userData.update = (dt, time) => { mat.uniforms.t.value = time; light.intensity = 1.4 + Math.sin(time * 13) * 0.2 + Math.sin(time * 7.3) * 0.15; };
    g.userData.light = light;
    return g;
  };
  // Rinde (Poly Haven bark_brown_02), geteilt von Scheiten und Stämmen
  let barkMat = null;
  R.barkMat = () => barkMat || (barkMat = new T.MeshLambertMaterial({ color: lin(0xc89a70), map: R.tex('bark', 2, 1) }));
  // Holzscheite im Feuer
  R.logs = (n = 5, r = 0.45) => {
    const g = new T.Group(), m = R.barkMat();
    for (let i = 0; i < n; i++) { const l = new T.Mesh(new T.CylinderGeometry(0.07, 0.08, r * 2, 6), m); const a = i / n * Math.PI * 2; l.position.set(Math.cos(a) * r * 0.35, 0.12, Math.sin(a) * r * 0.35); l.rotation.set(0.9, -a, 0, 'YXZ'); l.castShadow = true; g.add(l); }
    return g;
  };

  // Baumstamm (liegend, Achse = x): Rinde und helle Schnittflächen
  const logMats = [];
  R.log = (len = 1.4, r = 0.16) => {
    if (!logMats.length) logMats.push(R.barkMat(), R.mat(0xd9b07a), R.mat(0xd9b07a));
    const m = new T.Mesh(new T.CylinderGeometry(r, r * 1.05, len, 10), logMats); m.rotation.z = Math.PI / 2; m.castShadow = true; m.receiveShadow = true;
    const g = new T.Group(); m.position.y = r; g.add(m); return g;
  };

  // Wasser: bewegte Oberfläche
  R.water = (w, h, color = 0x2aa39a, opacity = 0.85) => {
    const mat = new T.ShaderMaterial({
      uniforms: { t: { value: 0 }, c: { value: lin(color) }, o: { value: opacity } }, transparent: true, depthWrite: false,
      vertexShader: 'uniform float t; varying vec2 v; varying float hh; void main(){ v=uv; vec3 p=position; hh=sin(p.x*1.3+t*1.4)*.5+sin(p.y*1.7+t*1.1)*.5; p.z+=hh*.05; gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}',
      fragmentShader: 'uniform vec3 c; uniform float o; uniform float t; varying vec2 v; varying float hh; void main(){ float s=smoothstep(.55,1.0,sin(v.x*60.0+t*1.5+sin(v.y*40.0+t))*.5+.5)*.18; vec3 col=c*(.85+hh*.12)+vec3(s); gl_FragColor=vec4(col,o);}'
    });
    const m = new T.Mesh(new T.PlaneGeometry(w, h, 24, 24), mat); m.rotation.x = -Math.PI / 2;
    m.userData.update = (dt, time) => { mat.uniforms.t.value = time; };
    return m;
  };

  // Partikel (Konfetti, Spritzer, Schleim, Funken)
  R.particles = (scene, { n = 120, colors = [0xff4060, 0xffd23a, 0x3ad0ff, 0x7cff6a, 0xffffff], size = 0.12, gravity = -6, life = 2.5 } = {}) => {
    const geo = new T.BufferGeometry(), pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
    geo.setAttribute('position', new T.BufferAttribute(pos, 3)); geo.setAttribute('color', new T.BufferAttribute(col, 3));
    const pts = new T.Points(geo, new T.PointsMaterial({ size, vertexColors: true, transparent: true, depthWrite: false, fog: false }));
    pts.frustumCulled = false;
    const vel = new Float32Array(n * 3), age = new Float32Array(n).fill(99);
    scene.add(pts);
    let next = 0;
    const api = {
      obj: pts,
      burst(x, y, z, count = 40, speed = 4, up = 4, cols) {
        const cs = cols || colors;
        for (let k = 0; k < count; k++) {
          const i = next; next = (next + 1) % n; age[i] = 0;
          pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
          const a = Math.random() * Math.PI * 2, s = Math.random() * speed;
          vel[i * 3] = Math.cos(a) * s; vel[i * 3 + 1] = up * (0.5 + Math.random()); vel[i * 3 + 2] = Math.sin(a) * s;
          const c = lin(cs[k % cs.length]); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
        }
        geo.attributes.color.needsUpdate = true;
      },
      update(dt) {
        for (let i = 0; i < n; i++) {
          if (age[i] > life) { pos[i * 3 + 1] = -999; continue; }
          age[i] += dt; vel[i * 3 + 1] += gravity * dt;
          vel[i * 3] *= 0.985; vel[i * 3 + 2] *= 0.985;
          pos[i * 3] += vel[i * 3] * dt; pos[i * 3 + 1] += vel[i * 3 + 1] * dt; pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
        }
        geo.attributes.position.needsUpdate = true;
      }
    };
    return api;
  };

  // ---------- Himmel ----------
  // Poly Haven (CC0): Bodentexturen und Himmels-Panoramen, klein und komprimiert in textures/ (siehe textures/LIZENZ.md)
  const texC = new Map();
  R.tex = (name, rx = 1, ry = rx, srgb = true) => {
    const k = name + rx + ',' + ry;
    if (texC.has(k)) return texC.get(k);
    const t = new T.TextureLoader().load('textures/' + name + '.jpg');
    if (srgb) t.encoding = T.sRGBEncoding;
    if (rx !== 1 || ry !== 1) { t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rx, ry); }
    t.anisotropy = R.quality() === 'low' ? 1 : 4;
    texC.set(k, t); return t;
  };

  // ---------- Himmel ----------
  // pano: Name eines Himmels-Panoramas (obere Hälfte, equirektangulär) – blendet zum Horizont in den Farbverlauf über
  R.sky = (top, mid, bottom, sunDir, pano) => {
    const pt = pano ? R.tex(pano, 1, 1, false) : null;
    if (pt) { pt.minFilter = T.LinearFilter; pt.generateMipmaps = false; pt.wrapS = T.RepeatWrapping; }
    const mat = new T.ShaderMaterial({
      side: T.BackSide, depthWrite: false,
      uniforms: { a: { value: lin(top) }, b: { value: lin(mid) }, c: { value: lin(bottom) }, s: { value: (sunDir || new T.Vector3(0.3, 0.6, -0.7)).clone().normalize() }, m: { value: pt }, k: { value: pt ? 1 : 0 } },
      vertexShader: 'varying vec3 d; void main(){ d=normalize(position); vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.0); gl_Position=p.xyww;}',
      fragmentShader: 'uniform vec3 a,b,c,s; uniform sampler2D m; uniform float k; varying vec3 d; void main(){ float h=d.y; vec3 col=h>0.0?mix(b,a,pow(h,.6)):mix(b,c,min(1.0,-h*4.0)); float sun=max(0.0,dot(d,s)); col+=vec3(1.0,.85,.6)*(pow(sun,400.0)*1.5+pow(sun,8.0)*.18)*(1.0-k); if(k>0.0&&h>0.0){ vec3 t=texture2D(m,vec2(atan(d.z,d.x)*.1591549+.5,asin(min(h,1.0))*.6366198)).rgb; col=mix(col,t,k*smoothstep(0.0,.18,h)); } gl_FragColor=vec4(col,1.0);}'
    });
    const m = new T.Mesh(new T.SphereGeometry(300, 24, 12), mat); m.renderOrder = -10; m.frustumCulled = false;
    m.userData.set = (t, mi, bo) => { mat.uniforms.a.value = lin(t); mat.uniforms.b.value = lin(mi); mat.uniforms.c.value = lin(bo); };
    return m;
  };

  // ---------- Kulisse: Dschungel ----------
  const Env = UL.Env = {};
  // Gelände: in der Mitte flach (Spielfläche), außen hügelig
  Env.noise = (x, z) => Math.sin(x * 0.11 + Math.cos(z * 0.07)) * 0.5 + Math.sin(z * 0.13 + x * 0.05) * 0.5 + Math.sin((x + z) * 0.31) * 0.15;
  Env.groundH = (x, z, flat = 22) => { const d = Math.hypot(x, z); const k = UL.smooth(UL.clamp((d - flat) / 30, 0, 1)); return Env.noise(x, z) * 0.25 + k * (2 + Env.noise(x * 0.5, z * 0.5) * 3 + (d - flat) * 0.12); };

  Env.lights = (scene, { sun = 0xfff0d6, sky = 0xbfe8ff, ground = 0x3a5a2a, sunI = 1.05, hemiI = 0.75, dir = [30, 45, 20], shadowSize = 26, ambient = 0 } = {}) => {
    const hemi = new T.HemisphereLight(lin(sky), lin(ground), hemiI); scene.add(hemi);
    const d = new T.DirectionalLight(lin(sun), sunI); d.position.set(dir[0], dir[1], dir[2]);
    const q = R.quality();
    if (q !== 'low') {
      d.castShadow = true; const sz = q === 'high' ? 2048 : 1024; d.shadow.mapSize.set(sz, sz);
      const c = d.shadow.camera; c.left = c.bottom = -shadowSize; c.right = c.top = shadowSize; c.near = 1; c.far = 160; d.shadow.bias = -0.0006; d.shadow.normalBias = 0.02;
    }
    scene.add(d); scene.add(d.target);
    if (ambient) scene.add(new T.AmbientLight(0xffffff, ambient));
    return { hemi, sun: d, follow(x, z) { d.position.set(x + dir[0], dir[1], z + dir[2]); d.target.position.set(x, 0, z); } };
  };

  // Tageszeit: day | evening | night
  const TOD = {
    day: { top: 0x3f8fe0, mid: 0xbfe6ff, bot: 0x7fb070, fog: 0xa9d6c8, sun: 0xfff0d6, sunI: 1.1, hemi: 0.78, sky: 0xcfeeff, ground: 0x3a5a2a },
    evening: { top: 0x2b3c78, mid: 0xff9a5a, bot: 0x5a4a3a, fog: 0xc98a68, sun: 0xffb070, sunI: 0.8, hemi: 0.55, sky: 0xffc39a, ground: 0x3a2a2a },
    night: { top: 0x050b1e, mid: 0x112a3e, bot: 0x0a140e, fog: 0x0c1c22, sun: 0x8fb0ff, sunI: 0.32, hemi: 0.32, sky: 0x4a6aa8, ground: 0x10180e }
  };
  Env.TOD = TOD;

  // Boden: Poly-Haven-Gras (zweifach skaliert gegen sichtbare Kacheln) und Erde mit Laub auf Lichtungen.
  // Die Fotos liefern nur Struktur (auf ihren Mittelwert normiert), die Grundfarbe bleibt die der Kulisse.
  Env.groundMat = (S) => {
    const m = new T.MeshLambertMaterial({ vertexColors: true, map: R.tex('ground-grass', S / 6) });
    const dirt = R.tex('ground-dirt', S / 5);
    m.onBeforeCompile = sh => {
      sh.uniforms.map2 = { value: dirt };
      sh.vertexShader = 'attribute float dirt; varying float vDirt;\n' + sh.vertexShader.replace('#include <uv_vertex>', '#include <uv_vertex>\n vDirt = dirt;');
      sh.fragmentShader = 'uniform sampler2D map2; varying float vDirt;\n' + sh.fragmentShader.replace('#include <map_fragment>',
        'vec3 g1 = mapTexelToLinear(texture2D(map, vUv)).rgb / vec3(.289,.247,.117);\n' +
        ' vec3 g2 = mapTexelToLinear(texture2D(map, vUv * .23 + .37)).rgb / vec3(.289,.247,.117);\n' +
        ' vec3 dd = mapTexelToLinear(texture2D(map2, vUv * 1.2)).rgb / vec3(.137,.095,.038);\n' +
        ' vec3 gg = mix(vec3(dot(g1 * g2, vec3(.3,.5,.2))), g1 * g2, .35);\n' +
        ' diffuseColor.rgb *= clamp(mix(gg, mix(vec3(dot(dd, vec3(.3,.5,.2))), dd, .6), vDirt), 0.0, 2.2);');
    };
    return m;
  };

  Env.jungle = (scene, { tod = 'day', radius = 24, clear = [], density = 1, water = null, seed = 7, ring = true, y: oy = 0 } = {}) => {
    const P = TOD[tod] || TOD.day;
    const sky = R.sky(P.top, P.mid, P.bot, null, 'sky-' + (TOD[tod] ? tod : 'day')); scene.add(sky);
    scene.fog = new T.Fog(lin(P.fog), 30, 120);
    const L = Env.lights(scene, { sun: P.sun, sunI: P.sunI, hemiI: P.hemi, sky: P.sky, ground: P.ground, shadowSize: radius + 4 });
    // Boden mit Farbflecken (Gras, Erde)
    const N = R.quality() === 'low' ? 48 : 80, S = 220;
    const geo = new T.PlaneGeometry(S, S, N, N); geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position, col = new Float32Array(pos.count * 3), dirt = new Float32Array(pos.count);
    const g1 = lin(0x4f9a3a), g2 = lin(0x6fb648), d1 = lin(0x8a6a44), c = new T.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      pos.setY(i, Env.groundH(x, z, radius));
      const n = Env.noise(x * 1.7, z * 1.7) * 0.5 + 0.5;
      c.copy(g1).lerp(g2, n);
      let w = 0;
      for (const cl of clear) { const dd = Math.hypot(x - cl.x, z - cl.z); if (dd < cl.r) { const k = UL.smooth(UL.clamp((cl.r - dd) / (cl.r * 0.5), 0, 1)) * (cl.k || 0.85); c.lerp(d1, k); w = Math.max(w, k); } }
      dirt[i] = w;
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    geo.setAttribute('color', new T.BufferAttribute(col, 3)); geo.setAttribute('dirt', new T.BufferAttribute(dirt, 1)); geo.computeVertexNormals();
    const ground = new T.Mesh(geo, Env.groundMat(S));
    ground.receiveShadow = true; ground.position.y = oy; scene.add(ground);
    // Pflanzen
    const rng = new UL.RNG(seed);
    const free = (x, z, m = 0) => !clear.some(cl => Math.hypot(x - cl.x, z - cl.z) < cl.r + m) && !(water && Math.hypot(x - water.x, z - water.z) < water.r + 1);
    const put = (name, n, rMin, rMax, hMin, hMax, opts = {}) => {
      const list = [];
      for (let i = 0, tries = 0; i < n * density && tries < n * 20; tries++) {
        const a = rng.next() * Math.PI * 2, r = rMin + (rMax - rMin) * Math.sqrt(rng.next());
        const x = Math.cos(a) * r, z = Math.sin(a) * r;
        if (!free(x, z, opts.margin || 0.5)) continue;
        list.push({ x, z, y: Env.groundH(x, z, radius) - 0.05 + oy, ry: rng.next() * 6.28, s: rng.range(hMin, hMax) / hMax }); i++;
      }
      const g = UL.A.instanced(name, list, hMax, { shadow: !!opts.shadow, receive: false }); scene.add(g); return list;
    };
    if (ring) {
      put('palm2', 26, radius + 2, radius + 26, 7, 11, { shadow: true });
      put('ancient_tree_1', 14, radius + 6, radius + 40, 9, 14);
      put('tree_palm', 30, radius + 1, radius + 30, 6, 9, { shadow: true });
      put('tree_fat', 24, radius + 8, radius + 50, 6, 10);
      put('garden_tree_green', 16, radius + 10, radius + 55, 7, 11);
      put('coconut1', 12, radius - 2, radius + 12, 6, 8, { shadow: true });
    }
    put('bush_large', 34, radius - 6, radius + 14, 1.2, 2.2);
    put('garden_plant_1', 40, 4, radius + 10, 0.8, 1.6);
    put('grass_green_group', 70, 2, radius + 8, 0.4, 0.8);
    put('bush', 30, 6, radius + 6, 0.7, 1.2);
    put('flower_red', 30, 4, radius + 2, 0.3, 0.5);
    put('rock_big_1', 8, radius - 4, radius + 20, 1.5, 3.5);
    put('mushroom_red', 14, 6, radius + 4, 0.25, 0.4);
    // Poly Haven (CC0): echte Tropenpflanzen und Felsen, fürs Handy reduziert (models/ph.glb); auf „niedrig“ weniger
    const ph = { low: 0.4, mid: 0.65, high: 1 }[R.quality()] || 1;
    put('ph_fern', 26 * ph, radius - 5, radius + 8, 0.9, 1.4);
    put('ph_anthurium', 10 * ph, 5, radius + 4, 0.6, 0.9);
    put('ph_calathea', 16 * ph, radius - 4, radius + 8, 0.8, 1.2);
    put('ph_sorrel', 18 * ph, 4, radius + 4, 0.3, 0.5);
    put('ph_shrub', 14 * ph, radius - 2, radius + 12, 1.2, 1.8);
    put('ph_weed', 16 * ph, 6, radius + 6, 0.5, 0.8);
    put('ph_rock', 10 * ph, radius - 3, radius + 16, 0.8, 2.2, { shadow: true });
    // Berge in der Ferne
    const mm = R.mat(0x2f5a3a), mg = new T.Group();
    for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2 + rng.next() * 0.3, r = 120 + rng.next() * 30, h = 25 + rng.next() * 35; const m = new T.Mesh(new T.ConeGeometry(h * 0.9, h, 6), mm); m.position.set(Math.cos(a) * r, h / 2 - 4, Math.sin(a) * r); mg.add(m); }
    scene.add(mg);
    return { sky, lights: L, ground, height: (x, z) => Env.groundH(x, z, radius) + oy, tod: P };
  };

  // ---------- Kulisse: TV-Studio ----------
  Env.studio = (scene, { radius = 16, mood = 'show', seed = 3, audience = true, screenText = ['URWALDLAGER', 'LIVE AUS DEM STUDIO'] } = {}) => {
    scene.background = lin(0x07070d);
    scene.fog = new T.Fog(lin(0x07070d), 30, 90);
    const hemi = new T.HemisphereLight(lin(0x9db8ff), lin(0x221a2a), 0.55); scene.add(hemi);
    const key = new T.DirectionalLight(lin(0xfff2e0), 0.85); key.position.set(8, 20, 14); scene.add(key); scene.add(key.target);
    if (R.quality() !== 'low') { key.castShadow = true; const sz = R.quality() === 'high' ? 2048 : 1024; key.shadow.mapSize.set(sz, sz); const c = key.shadow.camera; c.left = c.bottom = -radius - 4; c.right = c.top = radius + 4; c.far = 80; key.shadow.bias = -0.0006; key.shadow.normalBias = 0.02; }
    const g = new T.Group(); scene.add(g);
    // Boden: dunkel glänzend mit Leuchtringen
    const floor = new T.Mesh(new T.CircleGeometry(60, 48), new T.MeshLambertMaterial({ color: lin(0x4a4658), map: R.tex('studio-floor', 24) })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; g.add(floor);
    const stage = new T.Mesh(new T.CylinderGeometry(radius, radius + 0.4, 0.3, 64), [R.mat(0x2a2833), new T.MeshLambertMaterial({ color: lin(0x8a7a78), map: R.tex('wood', 6) }), R.mat(0x2a2833)]); stage.position.y = -0.15; stage.receiveShadow = true; g.add(stage);
    const ringMat = new T.MeshBasicMaterial({ color: lin(0x37ff8a) });
    const ring = new T.Mesh(new T.TorusGeometry(radius + 0.2, 0.06, 6, 96), ringMat); ring.rotation.x = Math.PI / 2; ring.position.y = 0.02; g.add(ring);
    const ring2 = new T.Mesh(new T.TorusGeometry(radius * 0.55, 0.04, 6, 80), new T.MeshBasicMaterial({ color: lin(0xffb43a) })); ring2.rotation.x = Math.PI / 2; ring2.position.y = 0.02; g.add(ring2);
    // LED-Wand hinten (gebogen) mit Dschungel-Verlauf und Logo
    const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 256; const cx = cv.getContext('2d');
    const led = new T.CanvasTexture(cv); led.encoding = T.sRGBEncoding; led.wrapS = T.RepeatWrapping; led.repeat.x = -1;   // Innenseite: Schrift spiegeln
    const drawLed = (t) => {
      const gr = cx.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#0d3b2a'); gr.addColorStop(0.6, '#1f7a3e'); gr.addColorStop(1, '#0a1f14');
      cx.fillStyle = gr; cx.fillRect(0, 0, 1024, 256);
      cx.fillStyle = 'rgba(0,0,0,.35)';
      for (let i = 0; i < 26; i++) { const x = (i * 97 + t * 30) % 1100 - 40, h = 90 + (i * 37 % 70); cx.beginPath(); cx.moveTo(x, 256); cx.quadraticCurveTo(x + 10, 256 - h, x + 40 * Math.sin(i), 256 - h - 30); cx.lineTo(x + 18, 256); cx.fill(); }
      cx.textAlign = 'center'; cx.font = '900 92px system-ui'; cx.fillStyle = '#ffd23a'; cx.shadowColor = '#000'; cx.shadowBlur = 12; cx.fillText(screenText[0], 512, 110);
      cx.font = '700 36px system-ui'; cx.fillStyle = '#e8fff0'; cx.fillText(screenText[1] || '', 512, 172); cx.shadowBlur = 0;
      for (let y = 0; y < 256; y += 4) { cx.fillStyle = 'rgba(0,0,0,.12)'; cx.fillRect(0, y, 1024, 1); }
      led.needsUpdate = true;
    };
    drawLed(0);
    const wall = new T.Mesh(new T.CylinderGeometry(radius + 10, radius + 10, 9, 48, 1, true, -0.9, 1.8), new T.MeshBasicMaterial({ map: led, side: T.BackSide }));
    wall.position.set(0, 4.5, 4); wall.rotation.y = Math.PI; g.add(wall);
    // Traversen und Scheinwerfer
    const truss = R.mat(0x8a8f99);
    for (const z of [-radius * 0.6, radius * 0.3]) { const b = new T.Mesh(new T.BoxGeometry(radius * 2.4, 0.35, 0.35), truss); b.position.set(0, 10, z); g.add(b); }
    const beams = [];
    const beamMat = c => new T.MeshBasicMaterial({ color: lin(c), transparent: true, opacity: 0.12, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide });
    const cols = [0x5ad1ff, 0xff5aa8, 0xffd23a, 0x7cff6a];
    for (let i = 0; i < 8; i++) {
      const x = (i - 3.5) * radius * 0.3, z = i % 2 ? -radius * 0.6 : radius * 0.3;
      const head = new T.Group(); head.position.set(x, 9.8, z); g.add(head);
      const can = new T.Mesh(new T.CylinderGeometry(0.25, 0.35, 0.6, 8), R.mat(0x222228)); head.add(can);
      if (R.quality() !== 'low') { const cone = new T.Mesh(new T.ConeGeometry(2.2, 10, 16, 1, true), beamMat(cols[i % 4])); cone.position.y = -5; head.add(cone); }
      beams.push(head);
    }
    // Publikum auf Tribünen (einfache Figuren, instanziert)
    let crowd = null;
    if (audience) {
      const n = R.quality() === 'low' ? 120 : 260, body = new T.CylinderGeometry(0.22, 0.28, 0.7, 6), head = new T.SphereGeometry(0.17, 8, 6);
      const ib = new T.InstancedMesh(body, new T.MeshLambertMaterial(), n), ih = new T.InstancedMesh(head, R.mat(0xe0b090), n);
      const m = new T.Matrix4(), c = new T.Color(), rng = new UL.RNG(seed), pal = [0xff4060, 0x3ad0ff, 0xffd23a, 0x7cff6a, 0xffffff, 0x9a6aff, 0xff8a3a];
      const seats = [];
      for (let i = 0; i < n; i++) {
        const row = i % 6, col = Math.floor(i / 6), half = Math.ceil(n / 12), side = col < half ? 1 : -1, f = (col % half) / half;
        const a = side * (0.9 + f * 1.3), r = radius + 4 + row * 1.1;
        const x = Math.sin(a) * r, z = Math.cos(a) * r, y = 0.4 + row * 0.55;
        seats.push([x, y, z]);
        m.makeTranslation(x, y, z); ib.setMatrixAt(i, m); m.makeTranslation(x, y + 0.5, z); ih.setMatrixAt(i, m);
        ib.setColorAt(i, c.copy(lin(rng.pick(pal))));
      }
      g.add(ib, ih);
      // Tribünenstufen
      const stepM = new T.MeshLambertMaterial({ color: lin(0x5a5668), map: R.tex('studio-floor', 8, 1), side: T.DoubleSide }); for (let row = 0; row < 6; row++) for (const t0 of [0.85, -2.25]) { const st = new T.Mesh(new T.CylinderGeometry(radius + 3.6 + row * 1.1, radius + 3.6 + row * 1.1, 0.3 + row * 0.55, 20, 1, true, t0, 1.4), stepM); st.position.y = (0.3 + row * 0.55) / 2 - 0.1; g.add(st); }   // nur die Stufenkanten (offen), sonst füllt der Kreissektor die Bühne
      crowd = { ib, ih, seats, n, m };
    }
    // Fernsehkameras auf Stativen
    for (const [x, z, ry] of [[-radius * 0.7, radius * 0.75, 0.6], [radius * 0.75, radius * 0.7, -0.6]]) {
      const cam = new T.Group(); cam.position.set(x, 0, z); cam.rotation.y = ry + Math.PI;
      const leg = new T.Mesh(new T.CylinderGeometry(0.06, 0.06, 1.5, 6), R.mat(0x333333)); leg.position.y = 0.75; cam.add(leg);
      const box = new T.Mesh(new T.BoxGeometry(0.5, 0.45, 0.9), R.mat(0x1a1a1e)); box.position.y = 1.65; cam.add(box);
      const lens = new T.Mesh(new T.CylinderGeometry(0.14, 0.16, 0.3, 10), R.mat(0x0c0c10)); lens.rotation.x = Math.PI / 2; lens.position.set(0, 1.65, -0.55); cam.add(lens);
      const tally = new T.Mesh(new T.SphereGeometry(0.05, 6, 4), new T.MeshBasicMaterial({ color: 0xff2020 })); tally.position.set(0, 1.92, -0.2); cam.add(tally);
      g.add(cam);
    }
    // Kunstpflanzen in Kübeln am Rand
    const pots = [];
    for (let i = 0; i < 10; i++) { const a = Math.PI * (0.15 + i * 0.075), r = radius - 0.8; pots.push({ x: Math.cos(a + Math.PI) * r, z: -Math.sin(a + Math.PI) * r * 0.9 - 1, ry: i }); }
    const potMat = R.mat(0xc8a070);
    pots.forEach(p => { const pot = new T.Mesh(new T.CylinderGeometry(0.5, 0.38, 0.7, 10), potMat); pot.position.set(p.x, 0.35, p.z); pot.castShadow = true; g.add(pot); p.y = 0.65; });
    scene.add(UL.A.instanced('tree_palm', pots.map(p => ({ x: p.x, y: 0.65, z: p.z, ry: p.ry, s: 1 })), 4.2, { shadow: true }));
    let time = 0, ledT = 0;
    const api = {
      group: g, key, hemi, beams, ring: ringMat, crowd,
      cheer: 0,
      update(dt) {
        time += dt; ledT += dt;
        beams.forEach((b, i) => { b.rotation.z = Math.sin(time * 0.6 + i) * 0.45; b.rotation.x = Math.cos(time * 0.45 + i * 1.7) * 0.3; });
        ringMat.color.setHSL((time * 0.05) % 1, 0.8, 0.45);
        if (ledT > 0.25) { ledT = 0; drawLed(time); }
        if (crowd && (api.cheer > 0 || ((time * 10) | 0) % 3 === 0)) {
          api.cheer = Math.max(0, api.cheer - dt);
          const amp = api.cheer > 0 ? 0.22 : 0.03;
          for (let i = 0; i < crowd.n; i += api.cheer > 0 ? 1 : 3) { const s = crowd.seats[i], j = Math.abs(Math.sin(time * 9 + i)) * amp; crowd.m.makeTranslation(s[0], s[1] + j, s[2]); crowd.ib.setMatrixAt(i, crowd.m); crowd.m.makeTranslation(s[0], s[1] + 0.5 + j, s[2]); crowd.ih.setMatrixAt(i, crowd.m); }
          crowd.ib.instanceMatrix.needsUpdate = true; crowd.ih.instanceMatrix.needsUpdate = true;
        }
      },
      height: () => 0
    };
    return api;
  };

  // Gemeinsame Szene-Hülle: Update-Liste für Effekte
  R.Stage = class {
    constructor() { this.scene = new T.Scene(); this.camera = R.camera(); this.time = 0; this.updaters = []; this.figs = []; }
    add(o) { this.scene.add(o); if (o.userData && o.userData.update) this.updaters.push(o.userData.update); return o; }
    tick(dt) {
      this.time += dt;
      for (const u of this.updaters) u(dt, this.time);
      for (const f of this.figs) f.update(dt);
    }
    dispose() {
      this.scene.traverse(o => { if (o.isMesh && o.geometry && !o.geometry.userData.keep && o.geometry !== starGeo) { /* Geometrien teilen sich Modelle; nur eigene freigeben */ } });
    }
  };
})();
