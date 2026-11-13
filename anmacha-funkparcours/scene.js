/* Titanparcours – 3D-Studio (Three.js r128) im Stil einer großen TV-Hindernis-Show (eigenes Design, keine fremden Logos oder Namen):
   dunkle Halle, Wasserbecken mit Unterwasserlicht, schwarze Traversen mit Moving-Heads, gepolsterte Hindernisse mit orangen Kanten,
   steile Tribüne mit Publikum, LED-Wand, Startturm und Buzzer-Turm mit Flammen und Zeit-Anzeige.
   Echtes Licht: sRGB-Ausgabe, filmische Tonwerte, Spiegelungen aus einer Studio-HDRI (Poly Haven, CC0), PBR-Texturen (Poly Haven, CC0).
   Flüssig: Läufer und bewegte Teile werden zwischen zwei Physikschritten weich überblendet. Qualität passt sich langsamen Geräten an. */
import { movePos, swingBall, ropeAt, rungY, fmtTime, PH, PH_DUCK, LOG_HW, LOG_HH, LADDER_HOP, DT } from './engine.js';
import { charLook } from './chars.js';
const T = window.THREE;
/** Farben (sRGB): Stahl, Polster, Akzente */
export const PAL = { steel: 0x15171c, steel2: 0x2b2f38, pad: 0xff6a1a, amber: 0xffb11f, blue: 0x2a7bff, cyan: 0x45d4ff, red: 0xff2b2b, white: 0xf4f7ff, gold: 0xffc93a, mat: 0x23262e };
const FONT = '"Titan Display","Barlow Condensed","Arial Narrow",Arial,sans-serif';
const cache = {}, C = (k, f) => cache[k] || (cache[k] = f());
const lin = c => new T.Color(c).convertSRGBToLinear();
const std = (c, o) => { const m = new T.MeshStandardMaterial(Object.assign({ roughness: 0.5, metalness: 0.15 }, o || {})); m.color = lin(c); if (o && o.emissive != null) m.emissive = lin(o.emissive); return m; };
const glow = (c, o) => { const m = new T.MeshBasicMaterial(Object.assign({ toneMapped: false }, o || {})); m.color = lin(c); return m; };
let ANISO = 4;
const cvs = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = ANISO; return t; };
/** LED-Schild: schwarzes Panel, orange Kante, weiße Schrift (hohe Auflösung, damit nichts pixelig wirkt) */
const sign = (txt, w = 1024, h = 192, fg = '#ffffff', edge = '#ff6a1a') => cvs(w, h, (g, W, H) => {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#16181f'); gr.addColorStop(1, '#07080c'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.strokeStyle = edge; g.lineWidth = H * 0.06; g.strokeRect(g.lineWidth / 2, g.lineWidth / 2, W - g.lineWidth, H - g.lineWidth);
  g.fillStyle = edge; g.beginPath(); g.moveTo(0, H); g.lineTo(H * 0.5, H); g.lineTo(H * 0.25, H * 0.55); g.lineTo(0, H * 0.55); g.fill();
  g.fillStyle = fg; g.shadowColor = edge; g.shadowBlur = H * 0.08; let fs = H * 0.62; g.font = `italic 800 ${fs}px ${FONT}`; while (g.measureText(txt.toUpperCase()).width > W * 0.86 && fs > 20) { fs -= 4; g.font = `italic 800 ${fs}px ${FONT}`; }
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt.toUpperCase(), W / 2, H / 2 + H * 0.04);
});
const puff = () => C('puff', () => cvs(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); }));
const DUMMY = new T.Object3D(), BD = new T.Object3D(), COLTMP = new T.Color(), V0 = new T.Vector3(), UP = new T.Vector3(0, 1, 0);
const CROWD_W = 96;
/** abgerundeter Quader (für Polster): Breite w (x), Höhe h (y), Tiefe d (z), Radius r */
function roundBox(w, h, d, r) {
  return C(`rb${w.toFixed(2)}|${h}|${d}|${r}`, () => {
    r = Math.min(r, w / 2 - 0.001, h / 2 - 0.001); const s = new T.Shape(), x = -w / 2 + r, y = -h / 2 + r, W = w - 2 * r, H = h - 2 * r;
    s.moveTo(x, -h / 2); s.lineTo(x + W, -h / 2); s.absarc(x + W, y, r, -Math.PI / 2, 0); s.lineTo(w / 2, y + H); s.absarc(x + W, y + H, r, 0, Math.PI / 2); s.lineTo(x, h / 2); s.absarc(x, y + H, r, Math.PI / 2, Math.PI); s.lineTo(-w / 2, y); s.absarc(x, y, r, Math.PI, Math.PI * 1.5);
    const g = new T.ExtrudeGeometry(s, { depth: d - 2 * r, bevelEnabled: true, bevelThickness: r, bevelSize: 0, bevelSegments: 3, curveSegments: 4 }); g.translate(0, 0, -(d - 2 * r) / 2);
    // UVs für Texturen: x/z in Metern (Kachelung wie im echten Material)
    const p = g.attributes.position, uv = g.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) * 0.5, p.getZ(i) * 0.5 + p.getY(i) * 0.5); return g;
  });
}
// Toon-Figuren (Tiere, Wesen) kommen aus EASYCLASH – Modell-Skript erst laden, wenn eine gewählt wird
let toonP = null;
const toonReady = () => toonP || (toonP = new Promise((res, rej) => { if (window.ECModel) return res(); const s = document.createElement('script'); s.src = '../easyclash/js/model.js'; s.onload = res; s.onerror = () => { toonP = null; rej(new Error('Figur nicht ladbar')); }; document.head.appendChild(s); }).then(() => { if (!toonP.setup) { window.ECModel.setup({ low: matchMedia('(pointer:coarse)').matches }); toonP.setup = 1; } return window.ECModel; }));

/** Sammelt Stahlträger als Instanzen eines Prismas: viele Traversen = ein einziger Zeichenaufruf */
class Beams {
  constructor() { this.m = []; }
  add(ax, ay, az, bx, by, bz, t) { V0.set(bx - ax, by - ay, bz - az); const len = V0.length(); if (len < 1e-4) return; V0.multiplyScalar(1 / len); BD.position.set((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2); BD.quaternion.setFromUnitVectors(UP, V0); BD.scale.set(t, len, t); BD.updateMatrix(); this.m.push(BD.matrix.clone()); }
  /** Gittermast (achsparallel) von a nach b: vier Gurte und Zickzack-Streben auf zwei Seiten */
  truss(a, b, w = 0.55, step = 0.75) {
    const ax = [0, 1, 2].find(i => Math.abs(a[i] - b[i]) > 1e-6), [p, q] = [0, 1, 2].filter(i => i !== ax), h = w / 2, len = Math.abs(b[ax] - a[ax]);
    const cor = [[-h, -h], [h, -h], [h, h], [-h, h]].map(([u, v]) => { const A = a.slice(), B = b.slice(); A[p] += u; A[q] += v; B[p] += u; B[q] += v; return [A, B]; });
    cor.forEach(([A, B]) => this.add(A[0], A[1], A[2], B[0], B[1], B[2], 0.07));
    const n = Math.max(1, Math.round(len / step)), at = (c, t) => { const [A, B] = cor[c]; return [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]; };
    for (const f of [0, 2]) for (let i = 0; i < n; i++) { const c0 = i % 2 ? f : f + 1, c1 = i % 2 ? f + 1 : f, P = at(c0, i / n), Q = at(c1, (i + 1) / n); this.add(P[0], P[1], P[2], Q[0], Q[1], Q[2], 0.035); }
  }
  mesh(mat) { const im = new T.InstancedMesh(C('ubox', () => new T.CylinderGeometry(0.5, 0.5, 1, 6, 1, true)), mat, this.m.length); this.m.forEach((m, i) => im.setMatrixAt(i, m)); im.instanceMatrix.needsUpdate = true; im.frustumCulled = false; return im; }
}

export class Arena {
  constructor(cv, logos) {
    this.cv = cv; this.logos = logos; const coarse = matchMedia('(pointer:coarse)').matches; this.coarse = coarse;
    this.r = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.pr = Math.min(devicePixelRatio || 1, coarse ? 1.75 : 2); this.r.setPixelRatio(this.pr);
    this.r.outputEncoding = T.sRGBEncoding; this.r.toneMapping = T.ACESFilmicToneMapping; this.r.toneMappingExposure = 1.15; this.r.physicallyCorrectLights = false;
    this.r.shadowMap.enabled = true; this.r.shadowMap.type = coarse ? T.PCFShadowMap : T.PCFSoftShadowMap; ANISO = Math.min(8, this.r.capabilities.getMaxAnisotropy());
    this.s = new T.Scene(); this.s.fog = new T.Fog(lin(0x05060c), 24, 90);
    this.s.background = cvs(8, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#010103'); gr.addColorStop(0.55, '#050814'); gr.addColorStop(1, '#0b1630'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
    this.cam = new T.PerspectiveCamera(42, 1, 0.1, 220); this.cx = 3; this.cy = 2.4; this.cvx = 0; this.cvy = 0; this.shake = 0; this.baseFov = 42; this.dist = 12.5;
    this.loadTextures();
    this.hemi = new T.HemisphereLight(lin(0x9bb8ff), lin(0x0a0d18), 0.55); this.s.add(this.hemi);
    const sun = new T.DirectionalLight(lin(0xfff1e0), 1.35); sun.position.set(9, 15, 12); sun.target.position.set(3, 0, 0); this.s.add(sun, sun.target); this.sun = sun;
    sun.castShadow = true; sun.shadow.mapSize.set(coarse ? 1024 : 2048, coarse ? 1024 : 2048); const sc = sun.shadow.camera; sc.left = -14; sc.right = 14; sc.top = 11; sc.bottom = -7; sc.near = 4; sc.far = 50; sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.025; sun.shadow.radius = 3;
    const rim = new T.DirectionalLight(lin(0x4a8cff), 0.8); rim.position.set(-6, 8, -10); this.s.add(rim); this.rim = rim;
    this.under = new T.PointLight(lin(0x2a9bff), 1.1, 14, 1.6); this.under.position.set(0, -0.3, 0); this.s.add(this.under);   // Licht aus dem Wasser
    this.boom = new T.PointLight(lin(0xff8a2a), 0, 26); this.boom.position.set(0, 6, 3); this.s.add(this.boom);
    this.attract = null; this.root = new T.Group(); this.s.add(this.root); this.dyn = []; this.heads = []; this.pots = []; this.time = 0; this.energy = 0.3; this.ghost = null; this.prevG = true; this.lastVy = 0; this.dustT = 0; this.clockT = 0;
    this.pool = []; this.live = []; this.initPool(); this.buildWater(); this.buildSet();
    this.kit = window.EasyFiguren ? window.EasyFiguren.create({ THREE: T, base: '../figuren/', srgb: true }) : null;
    this.runner = this.makeRunner(PAL.pad, 6, 0); this.s.add(this.runner.g); this.fpsT = 0; this.fpsN = 0; this.slow = 0; this.resize();
  }
  /** Poly-Haven-Texturen (CC0) + Studio-HDRI für Spiegelungen; ohne Netz bleibt alles einfarbig, das Spiel läuft weiter */
  loadTextures() {
    const L = new T.TextureLoader(), tex = (f, srgb, rep) => { const t = L.load('assets/tex/' + f); t.wrapS = t.wrapT = T.RepeatWrapping; t.anisotropy = ANISO; if (srgb) t.encoding = T.sRGBEncoding; if (rep) t.repeat.set(rep, rep); return t; };
    this.tx = { rubber: tex('rubber_d.jpg', 1), rubberN: tex('rubber_n.jpg'), metal: tex('metal_d.jpg', 1), metalN: tex('metal_n.jpg'), wood: tex('wood_d.jpg', 1), woodN: tex('wood_n.jpg') };
    L.load('assets/tex/env_studio.jpg', t => { t.encoding = T.sRGBEncoding; const pm = new T.PMREMGenerator(this.r); this.s.environment = pm.fromEquirectangular(t).texture; t.dispose(); pm.dispose(); });
  }
  /** Material-Bibliothek (einmal je Sorte) */
  M(k) {
    const x = this.tx;
    return C('M' + k, () => ({
      top: () => std(0x30343e, { map: x.rubber, normalMap: x.rubberN, normalScale: new T.Vector2(0.6, 0.6), roughness: 0.82, metalness: 0.05, envMapIntensity: 0.4 }),
      pad: () => std(PAL.pad, { roughness: 0.55, metalness: 0.0, envMapIntensity: 0.6, normalMap: x.rubberN, normalScale: new T.Vector2(0.15, 0.15) }),
      padBlue: () => std(PAL.blue, { roughness: 0.55, metalness: 0.0, envMapIntensity: 0.6 }),
      padRed: () => std(0xd8202a, { roughness: 0.5, metalness: 0.0, envMapIntensity: 0.6 }),
      steel: () => std(PAL.steel, { roughness: 0.38, metalness: 0.85, normalMap: x.metalN, envMapIntensity: 1.0 }),
      plate: () => std(0x9fb2c8, { map: x.metal, normalMap: x.metalN, roughness: 0.45, metalness: 0.7, envMapIntensity: 1.0 }),
      chrome: () => std(0xdfe5ef, { roughness: 0.16, metalness: 1.0, envMapIntensity: 1.4 }),
      grip: () => std(0x111216, { roughness: 0.9, metalness: 0.0 }),
      wood: () => std(0xffffff, { map: x.wood, normalMap: x.woodN, roughness: 0.6, metalness: 0.0, envMapIntensity: 0.5 }),
      woodDark: () => std(0x5a6a88, { map: x.wood, normalMap: x.woodN, roughness: 0.55, metalness: 0.05, envMapIntensity: 0.6 }),
      rope: () => std(0xcdb48a, { roughness: 0.95, map: C('ropeTex', () => { const t = cvs(64, 256, (g, w, h) => { g.fillStyle = '#cdb48a'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(80,60,30,.55)'; g.lineWidth = 6; for (let y = -w; y < h + w; y += 18) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + w * 0.7); g.stroke(); } }); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(1, 6); return t; }) }),
      sack: () => std(0xb3141f, { roughness: 0.42, metalness: 0.05, envMapIntensity: 0.9 }),
      white: () => std(0xeef2f8, { roughness: 0.45, metalness: 0.05 }),
      dark: () => std(0x0b0c10, { roughness: 0.6, metalness: 0.3 })
    }[k])());
  }
  resize() { const w = this.cv.clientWidth || innerWidth, h = this.cv.clientHeight || innerHeight, port = w / h < 1; this.r.setPixelRatio(this.pr); this.r.setSize(w, h, false); this.cam.aspect = w / h; this.baseFov = port ? 58 : 44; this.dist = port ? 11.5 : 9.5; this.cam.fov = this.baseFov; this.cam.updateProjectionMatrix(); }
  // ---------------------------------------------------------------- Partikel (Pool aus Sprites)
  initPool() { for (let i = 0; i < 240; i++) { const sp = new T.Sprite(new T.SpriteMaterial({ map: puff(), transparent: true, depthWrite: false, toneMapped: false })); sp.visible = false; this.s.add(sp); this.pool.push(sp); } }
  emit(x, y, z, vx, vy, vz, o) {
    const sp = this.pool.pop(); if (!sp) return; sp.visible = true; sp.position.set(x, y, z); sp.material.color.copy(lin(o.c || 0xffffff)); sp.material.opacity = o.a == null ? 0.8 : o.a; sp.material.blending = o.add ? T.AdditiveBlending : T.NormalBlending; sp.material.rotation = Math.random() * 6; sp.scale.setScalar(o.s || 0.3);
    this.live.push({ sp, vx, vy, vz, life: o.life || 0.6, max: o.life || 0.6, g: o.g == null ? 0 : o.g, grow: o.grow || 0, a: o.a == null ? 0.8 : o.a, spin: o.spin || 0 });
  }
  dust(x, y, n, spread) { for (let i = 0; i < n; i++) this.emit(x + (Math.random() - 0.5) * 0.3, y + 0.08, (Math.random() - 0.3) * 1.2, (Math.random() - 0.5) * spread, 0.4 + Math.random() * 0.8, 0, { c: 0xc9d2e6, s: 0.22 + Math.random() * 0.2, life: 0.45 + Math.random() * 0.25, grow: 0.9, a: 0.35 }); }
  splash(x) {
    this.shake = Math.max(this.shake, 0.35);
    for (let i = 0; i < 56; i++) { const a = Math.random() * Math.PI, sp = 2 + Math.random() * 5; this.emit(x + (Math.random() - 0.5) * 0.5, 0.05, (Math.random() - 0.5) * 1.4, Math.cos(a) * sp * 0.5 * (Math.random() < 0.5 ? -1 : 1), 4 + Math.random() * 7, (Math.random() - 0.5) * 3, { c: 0xe6f6ff, s: 0.16 + Math.random() * 0.16, life: 1.1, g: 16, a: 0.95 }); }
    for (let i = 0; i < 10; i++) this.emit(x + (Math.random() - 0.5) * 1.2, 0.1, (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5, 1 + Math.random(), 0, { c: 0xbfe9ff, s: 0.6, life: 0.9, grow: 1.6, a: 0.5 });
  }
  /** Flammensäulen der Feuertöpfe in der Nähe von x */
  fire(x) {
    let n = 0; for (const p of this.pots) if (Math.abs(p.x - x) < 9) { n++; for (let i = 0; i < 22; i++) this.emit(p.x + (Math.random() - 0.5) * 0.25, p.y + 0.2, p.z + (Math.random() - 0.5) * 0.25, (Math.random() - 0.5) * 0.6, 6 + Math.random() * 5, (Math.random() - 0.5) * 0.6, { c: [0xff7a1a, 0xffb02a, 0xff4a10][i % 3], s: 0.55 + Math.random() * 0.35, life: 0.55 + Math.random() * 0.3, g: 4, grow: 1.4, a: 0.95, add: true }); }
    if (n) { this.boom.position.set(x, 6, 3); this.boom.intensity = 3; }
  }
  confetti(x, y) { for (let i = 0; i < 70; i++) this.emit(x + (Math.random() - 0.5) * 2, y + 2 + Math.random(), (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 6, 3 + Math.random() * 6, (Math.random() - 0.5) * 3, { c: [PAL.gold, PAL.pad, 0xffffff, PAL.cyan][i % 4], s: 0.2, life: 1.8 + Math.random() * 0.6, g: 9, a: 1, spin: 1 }); this.energy = 1; this.shake = Math.max(this.shake, 0.12); this.fire(x); }
  cheer(v) { this.energy = Math.max(this.energy, v); }
  // ---------------------------------------------------------------- Wasserbecken (Shader: Wellen, Lichtspiegelungen, Unterwasserlampen, Kaustik)
  buildWater() {
    this.wu = { t: { value: 0 }, cx: { value: 0 } };
    const m = new T.ShaderMaterial({ uniforms: this.wu,
      vertexShader: 'varying vec3 vP; void main(){ vec4 w = modelMatrix*vec4(position,1.0); vP = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }',
      fragmentShader: `varying vec3 vP; uniform float t; uniform float cx;
        float h(vec2 p){ return sin(p.x*1.3 + t*1.1 + sin(p.y*0.9 + t*0.7)*1.6)*0.5 + sin(p.x*0.7 - t*0.8 + p.y*1.7)*0.35 + sin(p.x*2.9 + p.y*2.1 + t*1.9)*0.15; }
        void main(){
          vec2 p = vP.xz; float e = 0.08; vec3 n = normalize(vec3(h(p - vec2(e,0.0)) - h(p + vec2(e,0.0)), 2.2, h(p - vec2(0.0,e)) - h(p + vec2(0.0,e))));
          float depth = clamp((-vP.z + 4.5) / 9.5, 0.0, 1.0);
          vec3 col = mix(vec3(0.0,0.2,0.48), vec3(0.0,0.04,0.16), depth);
          float lx = mod(vP.x + 3.0, 6.0) - 3.0;
          col += vec3(0.15,0.65,1.0) * (exp(-(lx*lx + (vP.z+4.1)*(vP.z+4.1)) * 0.3) * 0.75 + exp(-(lx*lx + (vP.z-3.9)*(vP.z-3.9)) * 0.4) * 0.45);
          vec2 q = p * 1.3 + n.xz * 2.5; float c = abs(sin(q.x + t*0.9 + sin(q.y*0.8 + t*0.5)) * sin(q.y*1.3 - t*0.7 + sin(q.x*0.6))); col += vec3(0.2,0.55,1.0) * pow(1.0 - c, 14.0) * 0.18;
          vec3 V = normalize(vec3(cx, 6.0, 12.0) - vP); float fr = pow(1.0 - max(dot(n, V), 0.0), 3.0);
          vec3 L1 = normalize(vec3(0.35, 1.0, 0.55)); float spec = pow(max(dot(reflect(-L1, n), V), 0.0), 90.0);
          float stripe = smoothstep(0.92, 1.0, sin(vP.x * 0.55 + n.x * 6.0)) * fr;
          col = mix(col, vec3(0.08,0.12,0.25), fr * 0.6) + vec3(1.0,0.75,0.45) * stripe * 0.5 + vec3(1.0) * spec * 0.9;
          float fog = smoothstep(36.0, 100.0, distance(vP.xz, vec2(cx, 14.0)));
          gl_FragColor = vec4(mix(col, vec3(0.01,0.012,0.03), fog), 1.0);
        }` });
    this.water = new T.Mesh(new T.PlaneGeometry(150, 9.6, 1, 1), m); this.water.rotation.x = -Math.PI / 2; this.water.position.set(60, -0.05, -0.3); this.s.add(this.water);
    const L = 480, X = 100, floorM = std(0x07080c, { roughness: 0.35, metalness: 0.4, envMapIntensity: 0.6 }), rimM = std(0x1a1d24, { roughness: 0.4, metalness: 0.6 });
    const front = new T.Mesh(new T.PlaneGeometry(L, 30), floorM); front.rotation.x = -Math.PI / 2; front.position.set(X, 0.33, 19.6); front.receiveShadow = true; this.s.add(front);
    const back = new T.Mesh(new T.PlaneGeometry(L, 3.2), floorM); back.rotation.x = -Math.PI / 2; back.position.set(X, 0.33, -6.8); this.s.add(back);
    [[4.65, PAL.cyan], [-5.25, PAL.blue]].forEach(([z, c]) => { const rm = new T.Mesh(new T.BoxGeometry(L, 0.75, 0.3), rimM); rm.position.set(X, -0.05, z); this.s.add(rm); const ln = new T.Mesh(new T.BoxGeometry(L, 0.05, 0.05), glow(c)); ln.position.set(X, 0.34, z + (z > 0 ? -0.16 : 0.16)); this.s.add(ln); });
    const deep = new T.Mesh(new T.PlaneGeometry(L, 60), std(0x020309, { roughness: 1 })); deep.rotation.x = -Math.PI / 2; deep.position.set(X, -2.2, 0); this.s.add(deep);
  }
  // ---------------------------------------------------------------- Halle: Tribüne, Publikum, Bande, LED-Wand, Licht-Rig
  buildSet() {
    const L = 480, X = 100;
    // Steile Tribüne (dunkel, Stufenkanten leuchten schwach)
    const tierM = std(0x0d0f16, { roughness: 0.9 }); this.tiers = [];
    for (let i = 0; i < 6; i++) { const y = 0.33 + i * 1.05, z = -8.6 - i * 1.5; this.tiers.push({ y: y + 0.52, z }); const t = new T.Mesh(new T.BoxGeometry(L, 1.05, 1.5), tierM); t.position.set(X, y, z); this.s.add(t); if (i % 2 === 0) { const e = new T.Mesh(new T.BoxGeometry(L, 0.035, 0.035), glow([PAL.blue, PAL.pad, PAL.blue][i / 2], { transparent: true, opacity: 0.6 })); e.position.set(X, y + 0.53, z + 0.76); this.s.add(e); } }
    // LED-Bande vor der Tribüne mit Lauftext
    const ad = cvs(2048, 96, (g, w, h) => { g.fillStyle = '#05060a'; g.fillRect(0, 0, w, h); g.font = `italic 800 60px ${FONT}`; g.textBaseline = 'middle'; const parts = [['TITANPARCOURS', '#ff6a1a'], ['//', '#45d4ff'], ['PRÄSENTIERT VOM RICOREWI RADIOPORTAL', '#ffffff'], ['//', '#ffc93a']]; let x = 24; for (let r = 0; r < 2; r++) for (const [s, c] of parts) { g.fillStyle = c; g.fillText(s, x, h / 2 + 3); x += g.measureText(s).width + 40; } });
    ad.wrapS = T.RepeatWrapping; ad.repeat.set(L / 40, 1); this.ad = ad;
    const board = new T.Mesh(new T.BoxGeometry(L, 1.0, 0.25), this.M('dark')); board.position.set(X, 0.83, -7.4); this.s.add(board);
    const face = new T.Mesh(new T.PlaneGeometry(L, 0.8), glow(0xffffff, { map: ad, fog: false })); face.position.set(X, 0.83, -7.26); this.s.add(face);
    // Publikum: wandert mit der Kamera mit (immer volle Ränge, gleiche Kosten); im Halbdunkel, nur Blitzlichter und Bühnenlicht
    const n = 240; this.cdata = []; const bodyG = new T.CylinderGeometry(0.27, 0.3, 0.85, 8), headG = new T.SphereGeometry(0.2, 10, 8), armG = new T.CylinderGeometry(0.065, 0.06, 0.58, 6); armG.translate(0, -0.29, 0);
    const cm = () => new T.MeshLambertMaterial({ color: 0xffffff });
    this.bodies = new T.InstancedMesh(bodyG, cm(), n); this.cheads = new T.InstancedMesh(headG, cm(), n); this.arms = new T.InstancedMesh(armG, cm(), n * 2);
    const skin = [0xffd9b0, 0xe8b88a, 0xc68a5e, 0x8d5a3b, 0xf3c9a0], shirts = [0x2a7bff, 0xff6a1a, 0xffc93a, 0xe8ecf4, 0x20232b, 0x3fd0ff, 0xd8202a, 0x1a1a24];
    for (let i = 0; i < n; i++) { const tr = this.tiers[i % 6]; this.cdata.push({ bx: ((i / 6) | 0) * (CROWD_W / (n / 6)) + Math.random() * 0.9, y: tr.y, z: tr.z + (Math.random() - 0.5) * 0.3, ph: Math.random() * 6, sp: 0.8 + Math.random() * 0.6 });
      COLTMP.setHex(shirts[(Math.random() * shirts.length) | 0]).offsetHSL(0, 0, (Math.random() - 0.5) * 0.12).multiplyScalar(0.32).convertSRGBToLinear(); this.bodies.setColorAt(i, COLTMP); this.arms.setColorAt(i * 2, COLTMP); this.arms.setColorAt(i * 2 + 1, COLTMP);
      COLTMP.setHex(skin[(Math.random() * skin.length) | 0]).multiplyScalar(0.38).convertSRGBToLinear(); this.cheads.setColorAt(i, COLTMP); }
    [this.bodies, this.cheads, this.arms].forEach(m => { m.frustumCulled = false; this.s.add(m); });
    // LED-Wand über der Tribüne: wandernde Lichtbalken + Senderlogos in Rahmen
    const led = cvs(1024, 256, (g, w, h) => { g.fillStyle = '#030408'; g.fillRect(0, 0, w, h); for (let i = 0; i < 32; i++) { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, ['#ff6a1a', '#2a7bff', '#ffc93a', '#45d4ff'][i % 4]); gr.addColorStop(1, 'rgba(3,4,8,0)'); g.fillStyle = gr; g.globalAlpha = 0.55; g.fillRect(i * 32 + 6, h * (0.2 + 0.5 * Math.abs(Math.sin(i * 1.7))) * 0.7, 20, h); } g.globalAlpha = 0.12; g.fillStyle = '#000'; for (let y = 0; y < h; y += 4) g.fillRect(0, y, w, 2); g.globalAlpha = 1; });
    led.wrapS = led.wrapT = T.RepeatWrapping; led.repeat.set(L / 24, 1); this.led = led; const wall = new T.Mesh(new T.PlaneGeometry(L, 12), glow(0xffffff, { map: led, color: 0xbfbfbf })); wall.position.set(X, 14, -18.5); this.s.add(wall);
    const bm = new T.PlaneGeometry(4.2, 4.2), fr = new T.BoxGeometry(4.7, 4.7, 0.2); const loader = new T.TextureLoader();
    for (let i = 0; i < 34; i++) { const x = -24 + i * 11.5, f = new T.Mesh(fr, this.M('steel')); f.position.set(x, 12.6, -17.6); this.s.add(f); const m = new T.Mesh(bm, glow(0xffffff)); m.position.set(x, 12.6, -17.45); this.s.add(m); loader.load(this.logos[i % this.logos.length], t => { t.encoding = T.sRGBEncoding; t.anisotropy = ANISO; m.material.map = t; m.material.needsUpdate = true; }); }
    // Licht-Rig über dem Becken (schwarze Traversen, Scheinwerfer, Lichtkegel, Blitzlichter): 150 m Stück, das in 15-m-Schritten mit der Kamera wandert
    const rig = new T.Group(); this.rig = rig; this.s.add(rig);
    const bs = new Beams(); [-5.6, 4.4].forEach(z => bs.truss([-75, 10.5, z], [75, 10.5, z])); rig.add(bs.mesh(this.M('steel')));
    const pars = new T.InstancedMesh(new T.CylinderGeometry(0.18, 0.24, 0.36, 10), glow(0xffffff), 40); let k = 0;
    for (let x = -75; x < 75; x += 7.5) for (const z of [-5.6, 4.4]) { DUMMY.position.set(x, 10.05, z); DUMMY.rotation.set(0, 0, 0); DUMMY.scale.set(1, 1, 1); DUMMY.updateMatrix(); pars.setMatrixAt(k, DUMMY.matrix); pars.setColorAt(k, lin([PAL.amber, 0xffffff, PAL.blue, 0xffffff][k % 4])); k++; }
    pars.frustumCulled = false; rig.add(pars);
    this.cones = []; const cg = new T.ConeGeometry(1.7, 12, 18, 1, true); cg.translate(0, -6, 0);
    for (let i = 0; i < 10; i++) { const col = [PAL.cyan, 0xffffff, PAL.amber, PAL.blue][i % 4], x = -75 + i * 15, cone = new T.Mesh(cg, glow(col, { transparent: true, opacity: 0.05, side: T.DoubleSide, depthWrite: false, blending: T.AdditiveBlending })); cone.position.set(x, 10.1, -5.6); rig.add(cone); this.cones.push({ cone, x }); }
    const N = 80, pos = new Float32Array(N * 3); for (let i = 0; i < N; i++) { pos[i * 3] = -75 + Math.random() * 150; pos[i * 3 + 1] = 1.6 + Math.random() * 6; pos[i * 3 + 2] = -8.6 - Math.random() * 7.5; }
    const pg = new T.BufferGeometry(); pg.setAttribute('position', new T.BufferAttribute(pos, 3)); this.flash = new T.Points(pg, new T.PointsMaterial({ map: puff(), color: 0xffffff, size: 0.8, transparent: true, opacity: 0.7, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false })); this.flash.frustumCulled = false; rig.add(this.flash);
  }
  // ---------------------------------------------------------------- Läufer: realistische easygames-Figur (../figuren) oder Toon-Figur aus EASYCLASH
  makeRunner(color, logo, ci = 0, ghost = false) {
    const g = new T.Group(), body = new T.Group(); g.add(body);
    const r = { g, body, ci, color, logo, ghost, fig: null, toon: null, F: { state: 'idle' }, face: 1, prevX: 0, prevY: 0, st: '', alive: true };
    const L = charLook(ci, color, this.kit && this.kit.fromRoster), done = () => { if (!r.alive) return false; return true; };
    if (L.look && this.kit) {
      r.ready = this.kit.make(L.look).then(f => {
        if (!done()) { f.dispose(); return; } r.fig = f; body.add(f.root);
        if (ghost) f.ghost(0.38, 0x2a8aa8); else { f.root.traverse(o => { o.castShadow = !!o.isMesh; }); this.addDecal(r); }
      }).catch(e => console.warn('Figur', e));
    } else if (L.toon) {
      r.ready = toonReady().then(M => {
        if (!done()) return; const m = M.build(L.toon); m.scale.setScalar(1.12); r.toon = m; body.add(m);
        m.traverse(o => { if (!o.isMesh) return; o.castShadow = !ghost; const ms = [].concat(o.material); ms.forEach(mt => { if (mt.color && !mt.userData.lin) { mt.color.convertSRGBToLinear(); if (mt.emissive) mt.emissive.convertSRGBToLinear(); mt.userData.lin = true; } }); if (ghost) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.38; o.material.depthWrite = false; } });
      }).catch(e => console.warn('Figur', e));
    }
    return r;
  }
  // Senderlogo auf der Brust (am Brustknochen, folgt der Bewegung)
  addDecal(r) {
    const f = r.fig, sp = f && f.bones.spine_03; if (!sp) return;
    const m = new T.Mesh(C('decal', () => new T.PlaneGeometry(0.15, 0.15)), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
    f.root.updateMatrixWorld(true); const p = new T.Vector3(); sp.getWorldPosition(p); f.root.worldToLocal(p); m.position.set(p.x, p.y + 0.02, p.z + (f.look.body === 'w' ? 0.165 : 0.155)); m.rotation.x = -0.08; f.root.add(m); f.root.updateMatrixWorld(true); sp.attach(m);
    r.decal = m; this.setLogo(r, r.logo);
  }
  disposeRunner(r) { r.alive = false; this.s.remove(r.g); if (r.decal) { if (r.decal.material.map) r.decal.material.map.dispose(); r.decal.material.dispose(); } if (r.fig) r.fig.dispose(); if (r.toon) r.toon.traverse(o => { if (o.isMesh && r.ghost) o.material.dispose(); }); }
  setLogo(r, i) { r.logo = i; if (!r.decal) return; new T.TextureLoader().load(this.logos[i % this.logos.length], t => { if (!r.alive || !r.decal) { t.dispose(); return; } t.encoding = T.sRGBEncoding; if (r.decal.material.map) r.decal.material.map.dispose(); r.decal.material.map = t; r.decal.material.needsUpdate = true; }); }
  setLook(color, logo, ci) {
    if (ci != null && ci !== this.runner.ci) { const x = this.runner.prevX; this.disposeRunner(this.runner); this.runner = this.makeRunner(color, logo, ci); this.runner.prevX = x; this.s.add(this.runner.g); return this.runner.ready; }
    const r = this.runner; r.color = color; if (r.fig) { const L = charLook(r.ci, color, this.kit.fromRoster).look; if (L) r.fig.recolor({ top: L.top, hat: L.hat }); } this.setLogo(r, logo); return r.ready;
  }
  // ---------------------------------------------------------------- Parcours
  /** gepolsterte Plattform: dunkle Gummimatte oben, orange Polsterkante, Stahlrahmen; Oberkante genau bei y = 0 der Gruppe */
  padBlock(w, look, edge) {
    const g = new T.Group(), top = new T.Mesh(roundBox(w, 0.3, 3.6, 0.08), this.M('top')); top.position.y = -0.15; top.receiveShadow = top.castShadow = true; g.add(top);
    const skirt = new T.Mesh(roundBox(w + 0.06, 0.2, 3.7, 0.08), this.M(edge || 'pad')); skirt.position.y = -0.38; skirt.castShadow = true; g.add(skirt);
    const frame = new T.Mesh(C('frameG' + w.toFixed(2), () => new T.BoxGeometry(w - 0.3, 0.16, 3.2)), this.M('steel')); frame.position.y = -0.56; g.add(frame);
    return g;
  }
  setCourse(c) {
    this.course = c; const keep = new Set(Object.values(cache)); while (this.root.children.length) { const ch = this.root.children[0]; this.root.remove(ch); ch.traverse(o => { if (o.geometry && !keep.has(o.geometry)) o.geometry.dispose(); const ms = o.material ? [].concat(o.material) : []; ms.forEach(m => { if (!keep.has(m) && !m.userData.shared) { if (m.map && !Object.values(this.tx).includes(m.map) && m.map !== cache.puff) m.map.dispose(); m.dispose(); } }); }); }
    this.dyn = []; this.heads = []; this.pots = []; this.buzzer = null; this.clock = null; this.ladders = [];
    const bs = new Beams(), post = C('postG', () => new T.CylinderGeometry(0.16, 0.22, 1, 12));
    const addPost = (grp, h, x = 0, z = 0) => { const p = new T.Mesh(post, this.M('steel')); p.scale.y = h; p.position.set(x, -0.64 - h / 2, z); grp.add(p); };
    c.o.forEach((o, i) => {
      if (o.k === 'plat' || o.k === 'move' || o.k === 'sink') {
        const w = o.w, step = o.look === 'stepL' || o.look === 'stepR', edge = o.k === 'move' ? 'padBlue' : o.k === 'sink' ? 'padRed' : 'pad', g = this.padBlock(w, o.look, edge);
        if (step) g.children.forEach(m => { m.rotation.x = o.look === 'stepL' ? 0.32 : -0.32; });   // Stufensprung: quer geneigte Stufen (die Laufspur in der Mitte bleibt auf gleicher Höhe)
        if (o.k === 'sink') for (let k = -1; k <= 1; k++) { const cr = new T.Mesh(C('crackG', () => new T.BoxGeometry(0.04, 0.012, 3.2)), glow(0xff4a10)); cr.position.set(k * w * 0.27, 0.006, 0); cr.rotation.y = k * 0.12; g.add(cr); }
        if (o.k === 'move') { [-1, 1].forEach(sd => { const st = new T.Mesh(C('railG' + w.toFixed(2), () => new T.BoxGeometry(w, 0.05, 0.08)), glow(PAL.amber)); st.position.set(0, 0.01, sd * 1.82); g.add(st); }); }
        if (o.k === 'plat') addPost(g, Math.max(0.3, o.y + 1.4)), this.ripple(o.x + w / 2);
        g.position.set(o.x + w / 2, o.y, 0); this.root.add(g); this.dyn.push({ o, m: g, i });
      } else if (o.k === 'swing') {
        const grp = new T.Group(); bs.add(o.px, o.py, -2.4, o.px, o.py, 2.4, 0.3); bs.add(o.px, o.py, -2.4, o.px, 10.5, -5.6, 0.12);
        const chain = new T.Mesh(C('chainG', () => new T.CylinderGeometry(0.03, 0.03, 1, 6)), this.M('chrome')); chain.scale.y = o.len - 0.55; chain.position.y = -(o.len - 0.55) / 2; grp.add(chain);
        const h = o.h || 1.1, sack = new T.Mesh(C('sackG', () => new T.CylinderGeometry(0.4, 0.42, 1.1, 24, 1)), this.M('sack')); sack.scale.y = h / 1.1; sack.position.y = -o.len; sack.castShadow = true; grp.add(sack);
        [-0.32, 0.32].forEach(f => { const band = new T.Mesh(C('sackB', () => new T.CylinderGeometry(0.43, 0.43, 0.09, 24, 1, true)), this.M('white')); band.position.y = -o.len + f * h; grp.add(band); });
        const capT = new T.Mesh(C('sackC', () => new T.SphereGeometry(0.4, 24, 8, 0, Math.PI * 2, 0, Math.PI / 2)), this.M('sack')); capT.position.y = -o.len + h / 2; capT.scale.y = 0.35; grp.add(capT);
        grp.position.set(o.px, o.py, 0); this.root.add(grp); this.dyn.push({ o, m: grp, i });
      } else if (o.k === 'log') {
        // Pendelbalken: gepolsterter Balken an zwei Ketten, bleibt beim Schwingen waagerecht
        bs.truss([o.px, o.py, -2.3], [o.px, o.py, 2.3], 0.4); bs.add(o.px, o.py, -2.3, o.px, 10.5, -5.6, 0.12);
        const grp = new T.Group(), beam = new T.Group(); grp.add(beam);
        [-1.5, 1.5].forEach(z => { const ch = new T.Mesh(C('chainG', () => new T.CylinderGeometry(0.03, 0.03, 1, 6)), this.M('chrome')); ch.scale.y = o.len - LOG_HH; ch.position.set(0, -(o.len - LOG_HH) / 2, z); grp.add(ch); });
        const log = new T.Mesh(roundBox(LOG_HW * 2, LOG_HH * 2, 3.4, 0.2), this.M('pad')); log.castShadow = true; beam.add(log);
        [-1.1, 0, 1.1].forEach(z => { const b = new T.Mesh(C('logBand', () => roundBox(LOG_HW * 2 + 0.03, LOG_HH * 2 + 0.03, 0.14, 0.2)), this.M('dark')); b.position.z = z; beam.add(b); });
        beam.position.y = -o.len; grp.position.set(o.px, o.py, 0); this.root.add(grp); this.dyn.push({ o, m: grp, beam, i });
      } else if (o.k === 'gate') {
        // Rutschtunnel: gepolstertes Tor, unten weich, nur geduckt passierbar
        const g = new T.Group(), hgt = o.h - o.gap, blk = new T.Mesh(roundBox(o.w, hgt, 3.6, 0.18), this.M('padBlue')); blk.position.y = o.gap + hgt / 2; blk.castShadow = true; g.add(blk);
        const lip = new T.Mesh(roundBox(o.w + 0.08, 0.3, 3.7, 0.14), this.M('pad')); lip.position.y = o.gap + 0.15; g.add(lip);
        const sg = new T.Mesh(C('tunnelSignG', () => new T.PlaneGeometry(o.w * 0.9, o.w * 0.17)), new T.MeshBasicMaterial({ map: C('tunnelSign', () => sign('Ducken!', 1024, 192, '#ffffff', '#45d4ff')), toneMapped: false })); sg.position.set(0, o.gap + hgt * 0.62, 1.82); g.add(sg);
        [-1.9, 1.9].forEach(z => { const p = new T.Mesh(C('gatePost', () => new T.BoxGeometry(0.22, 1, 0.22)), this.M('steel')); p.scale.y = o.gap; p.position.set(0, o.gap / 2, z); g.add(p); });
        g.position.set(o.x + o.w / 2, o.y, 0); this.root.add(g);
      } else if (o.k === 'roll') {
        // Drehwalze: liegende Walze mit Streifen (dreht sich mit der Oberflächen-Geschwindigkeit), Achslager an beiden Enden
        const g = new T.Group(), drum = new T.Mesh(C('rollG' + o.r, () => new T.CylinderGeometry(o.r, o.r, 3.6, 40, 1)), C('rollM', () => std(0xffffff, { map: cvs(512, 64, (x, w, h) => { for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#ff6a1a' : '#16181d'; x.fillRect(i * w / 8, 0, w / 8, h); } }), roughness: 0.45, metalness: 0.1, envMapIntensity: 0.8 })));
        drum.rotation.x = Math.PI / 2; drum.castShadow = true; drum.receiveShadow = true; g.add(drum);
        [-1, 1].forEach(sd => { const cap = new T.Mesh(C('rollCap' + o.r, () => new T.CylinderGeometry(o.r * 0.35, o.r * 0.35, 0.12, 20)), this.M('chrome')); cap.position.set(0, sd * 1.83, 0); drum.add(cap);
          const pst = new T.Mesh(post, this.M('steel')); pst.scale.y = o.y - o.r + 1.5; pst.position.set(0, -(o.y - o.r + 1.5) / 2, sd * 1.95); g.add(pst); });
        g.position.set(o.x + o.w / 2, o.y - o.r, 0); this.root.add(g); this.dyn.push({ o, m: drum, i });
      } else if (o.k === 'tramp') {
        // Trampolin: schwarzes Sprungtuch im gepolsterten Rahmen mit Federn
        const g = new T.Group(), frame = new T.Mesh(roundBox(o.w, 0.3, 3.2, 0.1), this.M('pad')); frame.position.y = -0.2; g.add(frame);
        const mat = new T.Mesh(new T.BoxGeometry(o.w - 0.4, 0.04, 2.8), C('trampM', () => std(0x060608, { roughness: 0.95 }))); mat.position.y = -0.02; mat.receiveShadow = true; g.add(mat); this.dyn.push({ o, m: mat, i });
        const p = new T.Mesh(post, this.M('steel')); p.scale.y = o.y + 1.2; p.position.y = -0.35 - (o.y + 1.2) / 2; g.add(p);
        g.position.set(o.x + o.w / 2, o.y, 0); this.root.add(g);
      } else if (o.k === 'rope') {
        // Seil bzw. Ring am Querträger
        bs.add(o.px - 0.2, o.py, -2.4, o.px - 0.2, o.py, 2.4, 0.3); bs.add(o.px, o.py, -2.4, o.px, 10.5, -5.6, 0.12);
        const grp = new T.Group();
        if (o.ring) {
          const strap = new T.Mesh(C('strapG', () => new T.BoxGeometry(0.05, 1, 0.03)), this.M('dark')); strap.scale.y = o.len - 0.12; strap.position.y = -(o.len - 0.12) / 2; grp.add(strap);
          const ring = new T.Mesh(C('ringG', () => new T.TorusGeometry(0.14, 0.032, 10, 28)), this.M('chrome')); ring.position.y = -o.len + 0.02; grp.add(ring);
          const tape = new T.Mesh(C('ringT', () => new T.TorusGeometry(0.14, 0.036, 8, 12, 1.2)), this.M('pad')); tape.position.y = -o.len + 0.02; tape.rotation.z = -Math.PI / 2 - 0.6; grp.add(tape);
        } else {
          const rope = new T.Mesh(C('ropeG', () => new T.CylinderGeometry(0.045, 0.05, 1, 10)), this.M('rope')); rope.scale.y = o.len; rope.position.y = -o.len / 2; grp.add(rope);
          for (let k = 0; k < 3; k++) { const kn = new T.Mesh(C('knotG', () => new T.SphereGeometry(0.085, 12, 10)), this.M('rope')); kn.position.y = -o.len + 0.1 + k * 0.55; grp.add(kn); }
        }
        grp.position.set(o.px, o.py, 0); this.root.add(grp); this.dyn.push({ o, m: grp, i });
      } else if (o.k === 'bars' && o.ledge) {
        // Klippenhänger: Griffleiste aus Holz an einer Stahlwand
        const len = o.x2 - o.x1, g = new T.Group(), board = new T.Mesh(roundBox(len, 0.12, 0.34, 0.03), this.M('wood')); board.position.set(0, 0.0, 0.08); board.castShadow = true; g.add(board);
        const back = new T.Mesh(C('ledgeBack' + len.toFixed(2), () => new T.BoxGeometry(len + 0.3, 2.4, 0.12)), this.M('plate')); back.position.set(0, 0.6, -0.22); back.receiveShadow = true; g.add(back);
        const edge = new T.Mesh(C('ledgeEdge' + len.toFixed(2), () => new T.BoxGeometry(len, 0.03, 0.03)), glow(PAL.amber)); edge.position.set(0, 0.07, 0.26); g.add(edge);
        g.position.set((o.x1 + o.x2) / 2, o.y - 0.05, 0); this.root.add(g); bs.truss([(o.x1 + o.x2) / 2, -0.2, -0.6], [(o.x1 + o.x2) / 2, o.y + 1.8, -0.6], 0.4);
      } else if (o.k === 'bars') {
        const len = o.x2 - o.x1, bar = new T.Mesh(new T.CylinderGeometry(0.06, 0.06, len, 16), this.M('chrome')); bar.rotation.z = Math.PI / 2; bar.position.set((o.x1 + o.x2) / 2, o.y, 0); bar.castShadow = true; this.root.add(bar);
        for (let k = 0; k <= len; k += 1.5) { const rg = new T.Mesh(C('gripG', () => new T.CylinderGeometry(0.068, 0.068, 0.3, 14)), this.M('grip')); rg.rotation.z = Math.PI / 2; rg.position.set(o.x1 + k, o.y, 0); this.root.add(rg); }
        [o.x1, o.x2].forEach(x => bs.truss([x, -0.2, -2.2], [x, o.y + 3.6, -2.2], 0.4)); bs.truss([o.x1 - 0.2, o.y + 3.6, -2.2], [o.x2 + 0.2, o.y + 3.6, -2.2], 0.4); for (let x = o.x1; x <= o.x2 + 0.01; x += 1.5) bs.add(x, o.y, 0, x, o.y + 3.4, -2.2, 0.035);
      } else if (o.k === 'ladder') {
        // Lachsleiter: zwei Holzholme mit Sprossen-Kerben, Stange wandert mit dem Läufer nach oben
        const g = new T.Group(), top = rungY(o, o.n - 1) + 0.5, base = 0.0;
        [-0.9, 0.9].forEach(z => { const rail = new T.Mesh(C('ladRail' + top.toFixed(2), () => new T.BoxGeometry(0.34, top - base, 0.16)), this.M('wood')); rail.position.set(0, (top + base) / 2, z); rail.castShadow = true; g.add(rail);
          for (let k = 0; k < o.n; k++) { const hook = new T.Mesh(C('ladHook', () => new T.BoxGeometry(0.36, 0.06, 0.2)), this.M('steel')); hook.position.set(0.02, rungY(o, k) - 0.06, z); g.add(hook); } });
        const bar = new T.Mesh(C('ladBar', () => new T.CylinderGeometry(0.045, 0.045, 2.1, 14)), this.M('chrome')); bar.rotation.x = Math.PI / 2; bar.position.set(0, rungY(o, 0), 0); g.add(bar);
        const sg = new T.Mesh(C('ladSignG', () => new T.PlaneGeometry(1.6, 0.3)), new T.MeshBasicMaterial({ map: C('ladSign', () => sign('Im Takt!', 1024, 192, '#ffffff', '#ffc93a')), toneMapped: false })); sg.position.set(0, top + 0.35, 0.9); g.add(sg);
        g.position.set(o.x, 0, -0.0); this.root.add(g); this.ladders.push({ o, bar, i, y: rungY(o, 0) });
      } else if (o.k === 'wall') this.buildWall(o, bs);
      else if (o.k === 'finish') this.buildFinish(o, bs);
    });
    // Startturm und Hindernis-Portale mit LED-Schildern
    const s0 = c.o[0]; this.gantry(bs, 0.6, 'Start'); [-1.8, 1.8].forEach(z => this.pot(0.35, s0.y, z));
    let last = 0.6; for (const s of c.secs || []) { if (s.x - last < 7) continue; last = s.x; this.gantry(bs, s.x, s.n); }
    // Beckenende
    const capM = C('capM', () => std(0x07080c, { roughness: 0.4, metalness: 0.4 }));
    [[-12 - 40, 80], [c.length + 14 + 40, 80]].forEach(([x, w]) => { const cp = new T.Mesh(new T.BoxGeometry(w, 0.76, 9.9), capM); cp.position.set(x, -0.05, -0.3); this.root.add(cp); });
    this.root.add(bs.mesh(this.M('steel')));
  }
  /** Lichtring auf dem Wasser unter einer Plattform */
  ripple(x) { const rg = new T.Mesh(C('ripG', () => new T.RingGeometry(0.42, 0.62, 32)), glow(0xbfe6ff, { transparent: true, opacity: 0.35, side: T.DoubleSide, depthWrite: false })); rg.rotation.x = -Math.PI / 2; rg.position.set(x, 0.02, 0); this.root.add(rg); this.heads.push({ ring: rg, ph: x }); }
  gantry(bs, x, name) {
    bs.truss([x, 0.3, -5.6], [x, 10.5, -5.6]); bs.truss([x, 10.5, -5.6], [x, 10.5, 4.4]);
    const tex = sign(name), sg = new T.Mesh(C('gantrySignG', () => new T.PlaneGeometry(5.4, 1.01)), new T.MeshBasicMaterial({ map: tex, fog: false, toneMapped: false })); sg.position.set(x, 6.5, -1.2); this.root.add(sg);
    [-2.4, 2.4].forEach(dx => bs.add(x + dx, 7.0, -1.2, x + dx, 10.2, -1.2, 0.03));
    [-2.6].forEach(z => { const lamp = new T.Mesh(C('headG', () => new T.CylinderGeometry(0.22, 0.3, 0.45, 14)), this.M('dark')); lamp.position.set(x, 10.0, z); this.root.add(lamp);
      const col = z < 0 ? PAL.amber : 0xffffff, cone = new T.Mesh(C('beamG', () => { const g = new T.ConeGeometry(1.3, 10, 18, 1, true); g.translate(0, -5, 0); return g; }), glow(col, { transparent: true, opacity: 0.045, side: T.DoubleSide, depthWrite: false, blending: T.AdditiveBlending })); cone.position.set(x, 9.8, z); cone.visible = !this.lowFx; this.root.add(cone); this.heads.push({ cone, ph: x * 0.37 + z }); });
  }
  pot(x, y, z) {   // Flammenwerfer: Stahlsockel mit glühendem Düsenring
    const p = new T.Mesh(C('potG', () => new T.CylinderGeometry(0.13, 0.19, 0.5, 16)), this.M('steel')); p.position.set(x, y + 0.25, z); this.root.add(p);
    const r = new T.Mesh(C('potR', () => new T.TorusGeometry(0.12, 0.03, 8, 20)), glow(PAL.pad)); r.rotation.x = Math.PI / 2; r.position.set(x, y + 0.51, z); this.root.add(r); this.pots.push({ x, y: y + 0.5, z });
  }
  buildFinish(o, bs) {
    const ped = new T.Mesh(new T.CylinderGeometry(0.16, 0.22, 1.15, 16), this.M('steel')); ped.position.set(o.x + 0.9, o.y + 0.58, -0.6); this.root.add(ped);
    const b = new T.Mesh(new T.SphereGeometry(0.42, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2), std(0xff2020, { emissive: 0x7a0000, roughness: 0.25, envMapIntensity: 1.2 })); b.position.set(o.x + 0.9, o.y + 1.15, -0.6); b.scale.y = 0.55; b.castShadow = true; this.root.add(b); this.buzzer = b;
    const halo = new T.Sprite(new T.SpriteMaterial({ map: puff(), color: lin(0xff4040), transparent: true, opacity: 0.8, blending: T.AdditiveBlending, depthWrite: false, toneMapped: false })); halo.scale.setScalar(2.4); halo.position.set(o.x + 0.9, o.y + 1.4, -0.4); this.root.add(halo);
    bs.truss([o.x + 2.2, o.y, -1.8], [o.x + 2.2, o.y + 6.2, -1.8], 0.45); bs.truss([o.x - 2.4, o.y + 6.2, -1.8], [o.x + 2.6, o.y + 6.2, -1.8], 0.45);
    const zs = new T.Mesh(new T.PlaneGeometry(3.4, 0.64), new T.MeshBasicMaterial({ map: sign('Ziel', 1024, 192, '#ffc93a', '#ff2b2b'), fog: false, toneMapped: false })); zs.position.set(o.x, o.y + 6.95, -1.5); this.root.add(zs);
    this.clockTex = cvs(512, 160, () => {}); this.clockCtx = this.clockTex.image.getContext('2d'); this.drawClock(0);
    const ck = new T.Mesh(new T.PlaneGeometry(3.4, 1.06), new T.MeshBasicMaterial({ map: this.clockTex, fog: false, toneMapped: false })); ck.position.set(o.x, o.y + 5.4, -1.5); this.root.add(ck); this.clock = ck;
    [-1.4, 2.0].forEach(dx => [-1.8, 1.8].forEach(z => this.pot(o.x + dx, o.y, z)));
  }
  drawClock(t) { const g = this.clockCtx, W = 512, H = 160; g.fillStyle = '#05060a'; g.fillRect(0, 0, W, H); g.strokeStyle = '#ff6a1a'; g.lineWidth = 8; g.strokeRect(4, 4, W - 8, H - 8); g.fillStyle = '#ffc93a'; g.font = `italic 800 112px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(fmtTime(t), W / 2, H / 2 + 6); this.clockTex.needsUpdate = true; }
  buildWall(o, bs) {
    const N = 32, W = 4, pts = []; for (let k = 0; k <= N; k++) { const u = k / N; pts.push([o.x - 2.6 * Math.pow(1 - u, 2), o.y + o.h * u]); }
    const sh = new T.Shape(); sh.moveTo(o.x - 2.6, -1.8); pts.forEach(p => sh.lineTo(p[0] - 0.02, p[1] - 0.02)); sh.lineTo(o.x + o.w, o.y + o.h); sh.lineTo(o.x + o.w, -1.8); sh.lineTo(o.x - 2.6, -1.8);
    const body = new T.Mesh(new T.ExtrudeGeometry(sh, { depth: W, bevelEnabled: false }), this.M('steel')); body.position.z = -W / 2; body.castShadow = true; this.root.add(body);
    // Lauffläche: gebogene Holzplatte (Sperrholz-Textur), dunkel lasiert, mit orangen Fugen
    const surf = new T.BufferGeometry(), P = [], U = [], I = [];
    for (let k = 0; k <= N; k++) { const [x, y] = pts[k]; P.push(x - 0.015, y, -W / 2 + 0.05, x - 0.015, y, W / 2 - 0.05); const v = k / N * o.h; U.push(0, v * 0.5, W * 0.5, v * 0.5); if (k) { const a = (k - 1) * 2; I.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); } }
    surf.setAttribute('position', new T.Float32BufferAttribute(P, 3)); surf.setAttribute('uv', new T.Float32BufferAttribute(U, 2)); surf.setIndex(I); surf.computeVertexNormals();
    const face = new T.Mesh(surf, this.M('woodDark')); face.receiveShadow = true; this.root.add(face);
    for (let k = 4; k < N; k += 5) { const p = pts[k]; const h = new T.Mesh(C('wallSeam', () => new T.BoxGeometry(0.04, 0.035, W - 0.1)), glow(PAL.pad)); h.position.set(p[0] - 0.02, p[1], 0); this.root.add(h); }
    const sideTex = C('wallSide', () => cvs(512, 512, (g, w, h) => { g.fillStyle = '#0c0d12'; g.fillRect(0, 0, w, h); g.save(); g.translate(w / 2, h / 2); g.rotate(-Math.PI / 2); g.font = `italic 800 120px ${FONT}`; g.fillStyle = '#ff6a1a'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('TITAN', 0, -60); g.fillStyle = '#ffffff'; g.fillText('WAND', 0, 70); g.restore(); }));
    const side = new T.Mesh(new T.ShapeGeometry(sh), new T.MeshStandardMaterial({ map: sideTex, roughness: 0.5, metalness: 0.3 })); side.position.z = W / 2 + 0.01; this.root.add(side);
    const uvs = side.geometry.attributes.uv, ps = side.geometry.attributes.position; for (let i = 0; i < ps.count; i++) uvs.setXY(i, (ps.getX(i) - (o.x - 2.6)) / (2.6 + o.w), (ps.getY(i) + 1.8) / (o.y + o.h + 1.8));
    const edge = new T.Mesh(new T.BoxGeometry(o.w + 0.1, 0.1, W + 0.1), glow(PAL.amber)); edge.position.set(o.x + o.w / 2, o.y + o.h + 0.03, 0); this.root.add(edge);
    bs.truss([o.x + 3.8, -0.2, -2.2], [o.x + 3.8, o.y + o.h, -2.2], 0.45);
  }
  // ---------------------------------------------------------------- Bild
  setGhost(frames) {
    this.ghostFrames = frames;
    if (frames && !this.ghost) { this.ghost = this.makeRunner(0x9fe8ff, 0, this.runner.ci, true); this.s.add(this.ghost.g); }
    if (this.ghost) this.ghost.g.visible = !!frames;
  }
  /** Läufer an Position x/y stellen und passende Bewegung abspielen. sim = laufende Simulation (sonst nur Position, z. B. Geist) */
  pose(r, x, y, sim, dt) {
    const g = r.g, t = this.time; g.position.set(x, y, 0); dt = Math.max(1e-3, dt || 1 / 60);
    const vx = sim ? sim.vx : (x - r.prevX) / dt, vy = sim ? sim.vy : (y - r.prevY) / dt; r.prevX = x; r.prevY = y;
    const face = sim ? sim.face : Math.abs(vx) > 0.2 ? Math.sign(vx) : r.face; r.face = face;
    let st = 'run';
    if (sim) { if (sim.dead) st = 'fall'; else if (sim.finished) st = 'win'; else if (sim.ladder) st = 'ladder'; else if (sim.hang) st = sim.c.o[sim.hang.bar].ledge ? 'ledge' : 'hang'; else if (sim.rope) st = 'hang'; else if (sim.wall) st = 'wall'; else if (!sim.onGround) st = 'air'; else if (sim.duck) st = sim.slide ? 'slide' : 'duck'; else if (Math.abs(vx) < 0.3) st = 'idle'; }
    else st = Math.abs(vy) > 1.2 ? 'air' : Math.abs(vx) < 0.3 ? 'idle' : 'run';
    if (sim && sim.stun > 0 && st !== 'fall') st = 'stun';
    const yaw = st === 'win' ? 0.25 : st === 'ladder' || st === 'ledge' ? 0 : face > 0 ? 1.2 : -1.2; r.yaw = r.yaw == null ? yaw : r.yaw + (yaw - r.yaw) * Math.min(1, dt * 14);   // weich umdrehen
    r.body.rotation.set(0, r.yaw, 0);
    const spd = Math.abs(vx), f = r.fig;
    if (f) {
      let clip = 'idle', sp = 1, once = false, reach = 0, oy = 0;
      if (st === 'run') { if (spd > 3.4) { clip = 'sprint'; sp = Math.min(1.45, Math.max(0.75, spd / 5.2)); } else { clip = 'jog'; sp = Math.min(1.3, Math.max(0.6, spd / 2.8)); } }
      else if (st === 'wall') { clip = sim.wall.p > 0.72 ? 'climb' : 'sprint'; sp = clip === 'climb' ? 1.3 : 1.5; once = clip === 'climb'; }
      else if (st === 'air') clip = sim && sim.vy < -2 ? 'ninja' : 'jump';
      else if (st === 'slide') { clip = 'slide'; sp = 1; }
      else if (st === 'duck') { clip = 'crouch'; sp = 0.6 + spd * 0.4; oy = Math.abs(Math.sin(t * 9)) * 0.03 * Math.min(1, spd); }
      else if (st === 'hang' || st === 'ledge' || st === 'ladder') { clip = 'jump'; reach = 1; sp = 0.4; oy = PH - 2.18 * (f.root.scale.y || 1) + (st === 'hang' ? Math.sin(t * 3.6) * 0.03 : 0) + (st === 'ledge' ? -0.06 : 0); }
      else if (st === 'win') clip = 'dance';
      else if (st === 'fall') { clip = y < (this.course ? this.course.o[0].y : 1) - 0.6 ? 'swim' : 'knock'; once = clip === 'knock'; }
      else if (st === 'stun') { clip = 'knock'; once = true; }
      if (st !== r.st || clip !== r.clip) { f.play(clip, { once, fade: st === 'air' || r.st === 'air' ? 0.12 : 0.18 }); r.clip = clip; }
      f.speed(sp); f.reach(reach); g.position.y += oy; f.update(dt);
    } else if (r.toon) {
      const M = window.ECModel, F = r.F; F.state = { run: 'walk', wall: 'dash', air: 'air', hang: 'finale', ledge: 'finale', ladder: 'finale', win: 'win', fall: 'thrown', stun: 'hit', duck: 'block', slide: 'block' }[st] || 'idle';
      r.tt = (r.tt || 0) + dt * (st === 'run' ? Math.max(0.6, spd / 3.2) : 1); M.apply(r.toon, F, dt, r.tt);
      if (st === 'hang' || st === 'ledge' || st === 'ladder') g.position.y += PH - 2.05;
      r.toon.scale.y = 1.12 * (st === 'duck' || st === 'slide' ? PH_DUCK / PH + 0.08 : 1);
    }
    // Am Seil: Figur um die Hände drehen (gleicher Winkel wie das Seil)
    const a = sim && sim.rope ? sim.rope.a || 0 : 0; g.rotation.z = a;
    if (a) { const hy = y + PH, v = g.position.y - hy; g.position.x = x - v * Math.sin(a); g.position.y = hy + v * Math.cos(a); }
    r.st = st; return st;
  }
  adapt(dt) {   // Qualität senken, wenn das Gerät nicht hinterherkommt
    this.fpsT += dt; this.fpsN++; if (this.fpsT < 1.5) return; const fps = this.fpsN / this.fpsT; this.fpsT = 0; this.fpsN = 0;
    if (fps < 26 && dt < 0.2) { this.slow++; if (this.slow >= 2) { this.slow = 0; if (this.pr > 1) { this.pr = Math.max(1, this.pr - 0.25); this.resize(); } else if (this.sun.castShadow) { this.sun.castShadow = false; this.r.shadowMap.enabled = false; this.s.traverse(o => { if (o.material) [].concat(o.material).forEach(m => { m.needsUpdate = true; }); }); } else if (!this.lowFx) { this.lowFx = true; this.flash.visible = false; this.cones.forEach(c => { c.cone.visible = false; }); this.heads.forEach(h => { if (h.cone) h.cone.visible = false; }); } } } else this.slow = 0;
  }
  /** sim: laufende Simulation (oder null), ghostPos: [x,y] oder null, alpha: Anteil 0…1 zwischen letztem und nächstem Physikschritt (weiche Bewegung) */
  frame(sim, dt, ghostPos, idleX, alpha = 1) {
    this.time += dt; const k = sim && !sim.dead && !sim.finished ? Math.max(0, Math.min(1, alpha)) : 1, t = sim ? sim.t - (1 - k) * DT : this.time; this.wu.t.value = this.time;
    for (const d of this.dyn) {
      const o = d.o;
      if (o.k === 'move') { const p = movePos(o, t); d.m.position.set(p.x + o.w / 2, p.y, 0); }
      else if (o.k === 'sink') { const s = sim && sim.sinks[d.i]; d.m.position.y = o.y + (s ? s.y : 0); d.m.visible = !(s && s.gone); d.m.position.x = o.x + o.w / 2 + (s && s.touch >= 0 && !s.gone && sim.t - s.touch < o.delay ? Math.sin(this.time * 70) * 0.03 : 0); }
      else if (o.k === 'swing') d.m.rotation.z = swingBall(o, t).a;
      else if (o.k === 'log') { const a = swingBall(o, t).a; d.m.rotation.z = a; d.beam.rotation.z = -a; }
      else if (o.k === 'rope') d.m.rotation.z = ropeAt(o, t).a;
      else if (o.k === 'roll') d.m.rotation.y = t * -o.v / o.r;
      else if (o.k === 'tramp') { const on = sim && sim.ground && sim.ground.i === d.i; d.m.position.y = -0.02 - (on ? 0.12 : 0); }
    }
    // Lachsleiter: die Stange sitzt auf der aktuellen Sprosse (beim Sprossenwechsel weich nach oben)
    for (const L of this.ladders || []) { const on = sim && sim.ladder && sim.ladder.i === L.i, target = rungY(L.o, on ? sim.ladder.k : sim && sim.x > L.o.x + 0.5 ? L.o.n - 1 : 0); L.y += (target - L.y) * Math.min(1, dt * 18); L.bar.position.y = L.y; }
    for (const h of this.heads) if (h.ring) { const u = (this.time * 0.5 + h.ph * 0.13) % 1; h.ring.scale.setScalar(1 + u * 0.9); h.ring.material.opacity = 0.35 * (1 - u); }
    // Läufer (zwischen zwei Physikschritten überblendet) + Staub/Landung
    const ix = sim ? sim.px + (sim.x - sim.px) * k : idleX != null ? idleX : 2, iy = sim ? sim.py + (sim.y - sim.py) * k : 0, x = ix;
    if (sim) {
      this.pose(this.runner, ix, iy, sim, dt);
      if (sim.ladder) this.runner.g.position.y = this.ladders.find(L => L.i === sim.ladder.i).y - PH + (this.runner.g.position.y - iy);
      if (!sim.onGround) this.lastVy = sim.vy;
      if (sim.onGround && !this.prevG && this.lastVy < -5 && !sim.dead) { this.dust(sim.x, sim.y, 8, 3); this.shake = Math.max(this.shake, Math.min(0.12, -this.lastVy * 0.01)); }
      this.prevG = sim.onGround; this.dustT -= dt; if (sim.onGround && Math.abs(sim.vx) > (sim.slide ? 1 : 3) && !sim.dead && !sim.finished && this.dustT <= 0) { this.dustT = sim.slide ? 0.05 : 0.13; this.dust(sim.x - sim.face * 0.2, sim.y, 1, 1); }
    } else { this.pose(this.runner, x, this.course ? this.course.o[0].y : 1, null, dt); this.prevG = true; }
    if (this.ghost && this.ghost.g.visible && ghostPos) this.pose(this.ghost, ghostPos[0], ghostPos[1], null, dt);
    if (this.clock && (this.clockT -= dt) <= 0) { this.clockT = 0.1; this.drawClock(sim ? sim.t : 0); }
    // Kamera: weich gefedert (kritisch gedämpft), leichte Vorausschau, Tempo-Zoom, sanftes Wackeln
    const vx = sim ? sim.vx || 0 : 0, halfW = Math.tan(this.cam.fov * Math.PI / 360) * this.dist * this.cam.aspect, lead = Math.min(3.0, halfW * 0.38);
    const tx = (this.attract != null ? this.attract : x) + lead + vx * Math.min(0.15, halfW * 0.02), ty = (sim ? Math.max(iy, 1) : 1.4) + 1.0;
    const spring = (p, v, target, w) => { const f = 1 + 2 * dt * w + 1.48 * w * w * dt * dt, dtw = dt * w * w * (target - p); const nv = (v + dtw) / f; return [p + nv * dt, nv]; };
    [this.cx, this.cvx] = spring(this.cx, this.cvx, tx, 5.5); [this.cy, this.cvy] = spring(this.cy, this.cvy, ty, 4.2);
    this.shake = Math.max(0, this.shake - dt * 1.4); const sk = this.shake, sx = Math.sin(this.time * 37) * sk * 0.5, sy = Math.sin(this.time * 29 + 1.3) * sk * 0.5;
    this.cam.position.set(this.cx - 1.4 + sx, this.cy + 2.9 + sy, this.dist); this.cam.lookAt(this.cx, this.cy - 0.1, 0); const fov = this.baseFov + Math.min(5, Math.abs(vx) * 0.6); if (Math.abs(fov - this.cam.fov) > 0.05) { this.cam.fov += (fov - this.cam.fov) * Math.min(1, dt * 3); this.cam.updateProjectionMatrix(); }
    this.sun.position.set(this.cx + 8, 15, 11); this.sun.target.position.set(this.cx, 0, 0); this.rim.position.set(this.cx - 6, 8, -10); this.rim.target.position.set(this.cx, 0, 0); this.rim.target.updateMatrixWorld(); this.under.position.set(this.cx + 1, -0.3, 0.5);
    this.wu.cx.value = this.cx; this.water.position.x = this.cx + 20; if (this.led) this.led.offset.x += dt * 0.05; if (this.ad) this.ad.offset.x += dt * 0.03;
    if (this.buzzer) this.buzzer.material.emissiveIntensity = 0.8 + Math.sin(this.time * 6) * 0.4;
    if (this.boom.intensity > 0) this.boom.intensity = Math.max(0, this.boom.intensity - dt * 4);
    // Scheinwerfer + Blitzlichter
    this.rig.position.x = Math.round(this.cx / 15) * 15; this.cones.forEach(c => { const ph = (c.x + this.rig.position.x) * 0.06; c.cone.rotation.z = Math.sin(this.time * 0.8 + ph) * 0.35; c.cone.rotation.x = 0.35 + Math.cos(this.time * 0.6 + ph) * 0.15; });
    this.heads.forEach(h => { if (h.cone) { h.cone.rotation.z = Math.sin(this.time * 0.9 + h.ph) * 0.45; h.cone.rotation.x = Math.cos(this.time * 0.7 + h.ph) * 0.25; } });
    this.flash.material.opacity = 0.45 + 0.3 * Math.sin(this.time * 17) * Math.sin(this.time * 5.3);
    // Publikum (läuft mit der Kamera mit)
    const e = this.energy; this.energy = Math.max(0.25, this.energy - dt * 0.15); const bm = DUMMY, x0 = this.cx - CROWD_W / 2;
    bm.scale.set(1, 1, 1);
    for (let i = 0; i < this.cdata.length; i++) {
      const c = this.cdata[i], cx = x0 + ((((c.bx - x0) % CROWD_W) + CROWD_W) % CROWD_W);
      const b = Math.abs(Math.sin(this.time * (2 + e * 4) * c.sp + c.ph)) * (0.08 + e * 0.4);
      bm.rotation.set(0, 0, 0); bm.position.set(cx, c.y + 0.42 + b, c.z); bm.updateMatrix(); this.bodies.setMatrixAt(i, bm.matrix); bm.position.set(cx, c.y + 1.06 + b, c.z); bm.updateMatrix(); this.cheads.setMatrixAt(i, bm.matrix);
      const up = 0.1 + Math.max(0, e - 0.3) * 3.6 + Math.sin(this.time * 6 * c.sp + c.ph) * 0.3 * e;   // Arme: runter → hoch bei Begeisterung
      for (let q = 0; q < 2; q++) { const sd = q ? 1 : -1; bm.rotation.set(0, 0, sd * Math.min(2.9, up)); bm.position.set(cx + sd * 0.32, c.y + 0.76 + b, c.z); bm.updateMatrix(); this.arms.setMatrixAt(i * 2 + q, bm.matrix); }
    }
    this.bodies.instanceMatrix.needsUpdate = this.cheads.instanceMatrix.needsUpdate = this.arms.instanceMatrix.needsUpdate = true;
    // Partikel
    for (let i = this.live.length - 1; i >= 0; i--) { const p = this.live[i]; p.life -= dt; p.vy -= p.g * dt; const s = p.sp; s.position.x += p.vx * dt; s.position.y += p.vy * dt; s.position.z += p.vz * dt; if (p.grow) s.scale.addScalar(p.grow * dt); if (p.spin) s.material.rotation += 9 * dt; s.material.opacity = p.a * Math.max(0, p.life / p.max); if (p.life <= 0 || (p.g > 5 && s.position.y < -0.1 && p.vy < 0)) { s.visible = false; this.pool.push(s); this.live.splice(i, 1); } }
    this.r.render(this.s, this.cam); this.adapt(dt);
  }
}
