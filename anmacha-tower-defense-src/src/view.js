// Darstellung: Three.js-Szene im "Cinematic"-Look – Nachtstadt, schwebende Holo-Plattform, Bloom, Schatten, Kamerafahrten.
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { GW, GH, MAPS, TY, ET, BOOST_RANGE } from './config.js';

const OX = (GW - 1) / 2, OZ = (GH - 1) / 2;
export const cx2w = x => x - OX, cz2w = z => z - OZ;
const EL = 1.0;                       // Blickwinkel im Spiel (rad)
const MAXE = 220;

let renderer, scene, camera, composer, bloom, cv;
let root, sun, pmrem;
let rot = false, fit = 20, insetTop = 0, insetBot = 0, viewW = 1, viewH = 1, dpr = 1;
let time = 0;

// ------------------------------------------------------------------ Qualität
const QUALITIES = [null,
  { dpr: 1, shadow: 0, bloom: false, samples: 0 },
  { dpr: 1.5, shadow: 1024, bloom: true, samples: 2 },
  { dpr: 2, shadow: 2048, bloom: true, samples: 4 }];
let quality = 3, autoQ = true, slowFrames = 0, goodFrames = 0;

// ------------------------------------------------------------------ Helfer
const tmpM = new THREE.Matrix4(), tmpQ = new THREE.Quaternion(), tmpV = new THREE.Vector3(), tmpS = new THREE.Vector3(), tmpC = new THREE.Color(), tmpE = new THREE.Euler(), dummy = new THREE.Object3D(), bq = new THREE.Quaternion(), vR = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);
function canvasTex(w, h, draw, srgb = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
function glowTex() {
  return canvasTex(128, 128, (g, w, h) => {
    const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });
}
function mkInst(geo, mat, max, parent) {
  const m = new THREE.InstancedMesh(geo, mat, max);
  m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(max * 3), 3); m.instanceColor.setUsage(THREE.DynamicDrawUsage);
  m.frustumCulled = false; m.count = 0; (parent || root).add(m); return m;
}
// Emissive-Farbe pro Instanz (statt einer festen Farbe je Material)
function tintEmissive(mat) {
  mat.onBeforeCompile = sh => { sh.fragmentShader = sh.fragmentShader.replace('vec3 totalEmissiveRadiance = emissive;', 'vec3 totalEmissiveRadiance = emissive * vColor;'); };
  return mat;
}
const rnd = (a, b) => a + Math.random() * (b - a);

// ------------------------------------------------------------------ Initialisierung
let G = {}, M = {}, TEX = {};
let enemyM = {}, enemyBar, enemyBarBg, enemyGlow, bossRing, projMesh, beamMesh, ringFx, pts, ptsMat;
let floor, tilePad, tilePathM, ribbon, ribbonTex, ribbonMat, trim, underGlow, spawnG, baseG, baseParts = {}, searchlights = [];
let ghost, ghostQuad, ghostRing, ghostFill, selRing, selFill, ghostPed;
let spriteMats = {}, badgeMats = [], logoTex = {};
let pathPts = [], pathLen = [], pathTotal = 0, curTheme = MAPS[0].th;
let staticTex;

export function init(canvas) {
  cv = canvas;
  const p = new URLSearchParams(location.search);
  const coarse = matchMedia('(pointer:coarse)').matches;
  quality = coarse ? 2 : 3;
  if (p.has('q')) { quality = Math.max(1, Math.min(3, +p.get('q') || 2)); autoQ = false; }
  renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.92;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  scene = new THREE.Scene(); scene.background = new THREE.Color('#05070f'); scene.fog = new THREE.Fog('#070a1c', 34, 110);
  camera = new THREE.PerspectiveCamera(40, 1, 0.1, 400);
  root = new THREE.Group(); scene.add(root);

  pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.3;

  buildLights(); buildMaterials(); buildSky(); buildCity(); buildPlatform(); buildFx(); buildEnemies(); buildGhost();
  applyQuality(); resize();
}

function buildLights() {
  scene.add(new THREE.HemisphereLight(0x6f86ff, 0x2a1048, 0.7));
  sun = new THREE.DirectionalLight(0xbdd0ff, 2.0); sun.position.set(-7, 15, 9);
  sun.shadow.camera.left = -11; sun.shadow.camera.right = 11; sun.shadow.camera.top = 9; sun.shadow.camera.bottom = -9; sun.shadow.camera.near = 2; sun.shadow.camera.far = 40;
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.04; sun.shadow.radius = 3;
  scene.add(sun); scene.add(sun.target);
  const rim = new THREE.DirectionalLight(0xff4fb0, 0.8); rim.position.set(9, 6, -10); scene.add(rim);
}

function buildMaterials() {
  G.plinth = new THREE.CylinderGeometry(0.42, 0.47, 0.14, 6);
  G.column = new THREE.CylinderGeometry(0.19, 0.26, 1, 10);
  G.ringFlat = new THREE.TorusGeometry(0.37, 0.022, 8, 48).rotateX(Math.PI / 2);
  G.sph = new THREE.SphereGeometry(0.5, 14, 10);
  G.pip = new THREE.SphereGeometry(0.03, 8, 6);
  G.pad = new RoundedBoxGeometry(0.92, 0.16, 0.92, 2, 0.04);
  G.path = new THREE.BoxGeometry(1, 0.08, 1);
  M.metal = new THREE.MeshStandardMaterial({ color: 0x252d48, roughness: 0.32, metalness: 0.9 });
  M.dark = new THREE.MeshStandardMaterial({ color: 0x0e1322, roughness: 0.5, metalness: 0.8 });
  M.pipOff = new THREE.MeshStandardMaterial({ color: 0x151a2a, roughness: 0.6 });
  M.glow = TY.map(T => new THREE.MeshStandardMaterial({ color: T.col, emissive: T.col, emissiveIntensity: 1.9, roughness: 0.35, toneMapped: true }));
  M.accent = TY.map(T => new THREE.MeshStandardMaterial({ color: new THREE.Color(T.col).multiplyScalar(0.45), roughness: 0.28, metalness: 0.75, emissive: T.col, emissiveIntensity: 0.12 }));
  TEX.glow = glowTex();
  // Abzeichen hinter dem Logo: dunkle Scheibe mit leuchtendem Ring
  TEX.badge = canvasTex(128, 128, (g, w, h) => {
    g.beginPath(); g.arc(64, 64, 58, 0, 6.283); g.fillStyle = 'rgba(8,11,22,.92)'; g.fill();
    g.lineWidth = 8; g.strokeStyle = '#fff'; g.stroke();
  });
  badgeMats = TY.map(T => new THREE.SpriteMaterial({ map: TEX.badge, color: new THREE.Color(T.col).multiplyScalar(1.6), depthWrite: false }));
  staticTex = canvasTex(64, 64, g => { g.fillStyle = '#000'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 700; i++) { const v = Math.random() * 255 | 0; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(Math.random() * 64, Math.random() * 64, 3, 3); } });
  staticTex.wrapS = staticTex.wrapT = THREE.RepeatWrapping;
}

function buildSky() {
  const tex = canvasTex(4, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#02040b'); gr.addColorStop(0.3, '#060b26'); gr.addColorStop(0.45, '#161047'); gr.addColorStop(0.495, '#4a1a68'); gr.addColorStop(0.5, '#6a2278'); gr.addColorStop(0.505, '#1a0f3c'); gr.addColorStop(1, '#05070f');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(180, 24, 16), new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, fog: false, depthWrite: false }));
  sky.renderOrder = -10; scene.add(sky);
  const n = 380, pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 6.283, e = 0.08 + Math.random() * 1.2, r = 170;
    pos[i * 3] = Math.cos(a) * Math.cos(e) * r; pos[i * 3 + 1] = Math.sin(e) * r; pos[i * 3 + 2] = Math.sin(a) * Math.cos(e) * r;
    const b = 0.5 + Math.random() * 1.6; col[i * 3] = b; col[i * 3 + 1] = b; col[i * 3 + 2] = b * 1.1;
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  scene.add(new THREE.Points(g, new THREE.PointsMaterial({ size: 1.6, vertexColors: true, sizeAttenuation: false, fog: false, depthWrite: false, transparent: true, opacity: 0.9 })));
}

// Nachtstadt rund um die Plattform
const GROUND_Y = -3.2;
function buildCity() {
  const win = canvasTex(128, 256, (g, w, h) => {
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 8; x++) if (Math.random() < 0.38) { const v = 120 + Math.random() * 135 | 0; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(x * 16 + 3, y * 16 + 4, 10, 8); }
  });
  win.wrapS = win.wrapT = THREE.RepeatWrapping;
  const tints = [0x35d6ff, 0xff4fb0, 0xffc66a], bodies = [0x0b1226, 0x120c24, 0x0d1420];
  const parts = [[], [], []];
  let seed = 7; const rr = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 120; i++) {
    const a = rr() * 6.283, rad = 11 + Math.pow(rr(), 0.8) * 30, x = Math.cos(a) * rad * 1.35, z = Math.sin(a) * rad;
    if (Math.abs(x) < 10 && Math.abs(z) < 8) continue;
    const w = 1.4 + rr() * 2.6, d = 1.4 + rr() * 2.6, h = 5 + rr() * 12 * (1 + (rad - 11) / 40);
    const geo = new THREE.BoxGeometry(w, h, d), uv = geo.attributes.uv; for (let k = 0; k < uv.count; k++) uv.setXY(k, uv.getX(k) * w / 4, uv.getY(k) * h / 8);
    geo.rotateY(rr() * 3); geo.translate(x, GROUND_Y + h / 2, z); parts[i % 3].push(geo);
  }
  parts.forEach((p, i) => {
    if (!p.length) return;
    const m = new THREE.Mesh(mergeGeometries(p), new THREE.MeshStandardMaterial({ color: bodies[i], roughness: 0.55, metalness: 0.5, emissive: tints[i], emissiveMap: win, emissiveIntensity: 1.1 }));
    scene.add(m);
  });
  // Boden mit feinem Straßenraster
  const gt = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#060912'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(70,120,255,.14)'; g.lineWidth = 2;
    g.strokeRect(0, 0, w, h); g.strokeStyle = 'rgba(70,120,255,.05)'; g.lineWidth = 1; g.beginPath(); g.moveTo(128, 0); g.lineTo(128, 256); g.moveTo(0, 128); g.lineTo(256, 128); g.stroke();
  });
  gt.wrapS = gt.wrapT = THREE.RepeatWrapping; gt.repeat.set(36, 36);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), new THREE.MeshStandardMaterial({ map: gt, roughness: 0.3, metalness: 0.6, color: 0xffffff }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = GROUND_Y; scene.add(ground);
  // Suchscheinwerfer
  const beamTex = canvasTex(8, 128, (g, w, h) => { const gr = g.createLinearGradient(0, h, 0, 0); gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  [0x35d6ff, 0xff4fb0, 0x9a6bff].forEach((c, i) => {
    const geo = new THREE.CylinderGeometry(0.15, 2.6, 34, 16, 1, true); geo.translate(0, 17, 0);
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: beamTex, color: new THREE.Color(c).multiplyScalar(1.3), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
    const a = i * 2.1 + 0.5; m.position.set(Math.cos(a) * 26 * 1.3, GROUND_Y, Math.sin(a) * 26); m.userData.ph = i * 2.1; scene.add(m); searchlights.push(m);
  });
}

function buildPlatform() {
  const slab = new THREE.Mesh(new RoundedBoxGeometry(GW + 1.1, 0.5, GH + 1.1, 3, 0.14), new THREE.MeshStandardMaterial({ color: 0x0f1527, roughness: 0.36, metalness: 0.92 }));
  slab.position.y = -0.35; slab.receiveShadow = true; slab.castShadow = true; root.add(slab);
  M.trim = new THREE.MeshStandardMaterial({ color: 0x00e5ff, emissive: 0x00e5ff, emissiveIntensity: 1.4, roughness: 0.4 });
  trim = new THREE.Group();
  const tb = (w, d, x, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.05, d), M.trim); m.position.set(x, -0.09, z); trim.add(m); };
  tb(GW + 0.7, 0.07, 0, -GH / 2 - 0.27); tb(GW + 0.7, 0.07, 0, GH / 2 + 0.27); tb(0.07, GH + 0.7, -GW / 2 - 0.27, 0); tb(0.07, GH + 0.7, GW / 2 + 0.27, 0);
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.5, 8), M.metal); p.position.set(sx * (GW / 2 + 0.3), 0.12, sz * (GH / 2 + 0.3)); p.castShadow = true; trim.add(p);
    const o = new THREE.Mesh(G.sph, M.trim); o.scale.setScalar(0.16); o.position.set(p.position.x, 0.42, p.position.z); trim.add(o);
  });
  root.add(trim);
  underGlow = new THREE.Mesh(new THREE.PlaneGeometry(GW + 9, GH + 9), new THREE.MeshBasicMaterial({ map: TEX.glow, color: 0x00e5ff, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  underGlow.rotation.x = -Math.PI / 2; underGlow.position.y = -0.9; root.add(underGlow);
  M.pad = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.34, metalness: 0.55 });
  M.pathTile = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55, metalness: 0.4, emissive: 0x00e5ff, emissiveIntensity: 0.1 });
  tilePad = mkInst(G.pad, M.pad, GW * GH); tilePad.receiveShadow = true; tilePad.castShadow = false;
  tilePathM = mkInst(G.path, M.pathTile, GW * GH); tilePathM.receiveShadow = true;
  ribbonTex = canvasTex(64, 64, g => {
    g.clearRect(0, 0, 64, 64); g.lineJoin = 'round'; g.lineCap = 'round';
    g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = 7; g.beginPath(); g.moveTo(22, 14); g.lineTo(40, 32); g.lineTo(22, 50); g.stroke();
  });
  ribbonTex.wrapS = THREE.RepeatWrapping;
  ribbonMat = new THREE.MeshBasicMaterial({ map: ribbonTex, color: 0x00e5ff, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false });
  // Spawn-Portal
  spawnG = new THREE.Group(); root.add(spawnG);
  const pm = new THREE.MeshStandardMaterial({ color: 0xff2d95, emissive: 0xff2d95, emissiveIntensity: 2.6 });
  baseParts.portalRings = [0.5, 0.42, 0.34].map((r, i) => { const m = new THREE.Mesh(new THREE.TorusGeometry(r, 0.04, 8, 40), pm); m.position.z = i * 0.18 - 0.1; spawnG.add(m); return m; });
  baseParts.portalDisc = new THREE.Mesh(new THREE.CircleGeometry(0.46, 32), new THREE.MeshBasicMaterial({ map: TEX.glow, color: 0xff2d95, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  spawnG.add(baseParts.portalDisc);
  spawnG.position.y = 0.58;
  baseParts.portalLight = new THREE.PointLight(0xff2d95, 6, 5, 2); baseParts.portalLight.position.y = 0.3; spawnG.add(baseParts.portalLight);
  baseParts.spawnLabel = null;
  // Basis: Senderturm
  baseG = new THREE.Group(); root.add(baseG);
  const pl = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.66, 0.2, 6), M.metal); pl.position.y = 0.1; pl.castShadow = pl.receiveShadow = true; baseG.add(pl);
  baseParts.mat = new THREE.MeshStandardMaterial({ color: 0x00ffc8, emissive: 0x00ffc8, emissiveIntensity: 2.2, roughness: 0.3 });
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.2, 2.1, 8), M.metal); mast.position.y = 1.2; mast.castShadow = true; baseG.add(mast);
  [0.55, 1.0, 1.45].forEach((y, i) => { const r = new THREE.Mesh(new THREE.TorusGeometry(0.3 - i * 0.07, 0.026, 8, 32).rotateX(Math.PI / 2), baseParts.mat); r.position.y = y; baseG.add(r); });
  const tip = new THREE.Mesh(G.sph, baseParts.mat); tip.scale.setScalar(0.22); tip.position.y = 2.3; baseG.add(tip); baseParts.tip = tip;
  baseParts.waves = [0, 1, 2].map(i => {
    const m = new THREE.Mesh(new THREE.TorusGeometry(1, 0.012, 6, 48).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x00ffc8, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    m.position.y = 2.3; m.userData.ph = i / 3; baseG.add(m); return m;
  });
  const bg = new THREE.CylinderGeometry(0.05, 0.14, 16, 12, 1, true); bg.translate(0, 8 + 2.3, 0);
  baseParts.beam = new THREE.Mesh(bg, new THREE.MeshBasicMaterial({ color: new THREE.Color(0x00ffc8).multiplyScalar(0.8), transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  baseG.add(baseParts.beam);
  baseParts.light = new THREE.PointLight(0x00ffc8, 8, 6, 2); baseParts.light.position.y = 1.2; baseG.add(baseParts.light);
  baseParts.hit = 0;
}

function buildFx() {
  // Partikel (weiche, additive Punkte mit Größe pro Partikel)
  const PN = 900; ptsMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uScale: { value: 600 } },
    vertexShader: 'attribute float aSize; attribute float aA; attribute vec3 color; varying vec3 vC; varying float vA; uniform float uScale; void main(){ vC=color; vA=aA; vec4 mv=modelViewMatrix*vec4(position,1.); gl_PointSize=max(1.,aSize*uScale/(-mv.z)); gl_Position=projectionMatrix*mv; }',
    fragmentShader: 'varying vec3 vC; varying float vA; void main(){ float d=length(gl_PointCoord-.5)*2.; float a=clamp(1.-d,0.,1.); a*=a; gl_FragColor=vec4(vC,a*vA); }'
  });
  const geo = new THREE.BufferGeometry();
  P.n = PN; P.pos = new Float32Array(PN * 3).fill(-99); P.col = new Float32Array(PN * 3); P.vel = new Float32Array(PN * 3); P.life = new Float32Array(PN); P.max = new Float32Array(PN).fill(1); P.size = new Float32Array(PN); P.a = new Float32Array(PN);
  geo.setAttribute('position', new THREE.BufferAttribute(P.pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(P.col, 3)); geo.setAttribute('aSize', new THREE.BufferAttribute(P.size, 1)); geo.setAttribute('aA', new THREE.BufferAttribute(P.a, 1));
  pts = new THREE.Points(geo, ptsMat); pts.frustumCulled = false; root.add(pts);
  // Ambient-Staub über der Plattform
  const n = 90, pos = new Float32Array(n * 3), col = new Float32Array(n * 3), sz = new Float32Array(n), al = new Float32Array(n);
  for (let i = 0; i < n; i++) { pos[i * 3] = rnd(-9, 9); pos[i * 3 + 1] = rnd(0.2, 5); pos[i * 3 + 2] = rnd(-7, 7); col[i * 3] = 0.3; col[i * 3 + 1] = 0.7; col[i * 3 + 2] = 1; sz[i] = rnd(0.04, 0.1); al[i] = rnd(0.3, 0.8); }
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); dg.setAttribute('color', new THREE.BufferAttribute(col, 3)); dg.setAttribute('aSize', new THREE.BufferAttribute(sz, 1)); dg.setAttribute('aA', new THREE.BufferAttribute(al, 1));
  P.dust = new THREE.Points(dg, ptsMat); P.dust.frustumCulled = false; root.add(P.dust);
  // Wellenringe, Geschosse, Strahlen
  const rg = new THREE.RingGeometry(0.9, 1, 48).rotateX(-Math.PI / 2);
  ringFx = mkInst(rg, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }), 48);
  projMesh = mkInst(new THREE.SphereGeometry(0.5, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }), 140);
  beamMesh = mkInst(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }), 300);
}
const P = {}, RINGS = [];

function buildEnemies() {
  const base = (em) => tintEmissive(new THREE.MeshStandardMaterial({ color: 0x1a2036, roughness: 0.36, metalness: 0.75, emissive: 0xffffff, emissiveIntensity: em, flatShading: true }));
  const boxMat = tintEmissive(new THREE.MeshStandardMaterial({ color: 0x141a2e, roughness: 0.4, metalness: 0.7, emissive: 0xffffff, emissiveMap: staticTex, emissiveIntensity: 1.1 }));
  const geos = {
    static: new RoundedBoxGeometry(1, 1, 1, 2, 0.12), zip: new THREE.OctahedronGeometry(0.58), block: new RoundedBoxGeometry(1, 1, 1, 2, 0.14),
    swarm: new THREE.TetrahedronGeometry(0.7), boss: new THREE.IcosahedronGeometry(0.58, 1)
  };
  const mats = { static: boxMat, zip: base(0.9), block: tintEmissive(boxMat.clone()), swarm: base(1.1), boss: base(0.7) };
  mats.block.emissiveMap = staticTex;
  Object.keys(ET).forEach(k => { const m = mkInst(geos[k], mats[k], MAXE); m.castShadow = true; enemyM[k] = m; });
  bossRing = mkInst(new THREE.TorusGeometry(0.9, 0.04, 8, 36), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }), 8);
  enemyGlow = mkInst(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: TEX.glow, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }), MAXE);
  enemyBarBg = mkInst(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0xffffff, depthWrite: false, transparent: true, opacity: 0.8 }), MAXE);
  enemyBar = mkInst(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0xffffff, depthWrite: false, toneMapped: false }), MAXE);
  enemyBarBg.renderOrder = 3; enemyBar.renderOrder = 4;
  Object.values(ET).forEach(e => { e.c = new THREE.Color(e.col); });
}

function buildGhost() {
  ghost = new THREE.Group(); ghost.visible = false; root.add(ghost);
  ghostQuad = new THREE.Mesh(new THREE.PlaneGeometry(0.98, 0.98).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false })); ghostQuad.position.y = 0.07; ghost.add(ghostQuad);
  const rg = new THREE.RingGeometry(0.985, 1, 64).rotateX(-Math.PI / 2), fg = new THREE.CircleGeometry(1, 48).rotateX(-Math.PI / 2);
  ghostRing = new THREE.Mesh(rg, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false })); ghostRing.position.y = 0.08; ghost.add(ghostRing);
  ghostFill = new THREE.Mesh(fg, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.07, blending: THREE.AdditiveBlending, depthWrite: false })); ghostFill.position.y = 0.075; ghost.add(ghostFill);
  ghostPed = new THREE.Mesh(G.column, new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, emissive: 0xffffff, emissiveIntensity: 0.6 })); ghost.add(ghostPed);
  selRing = new THREE.Mesh(rg, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })); selRing.position.y = 0.08; selRing.visible = false; root.add(selRing);
  selFill = new THREE.Mesh(fg, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending, depthWrite: false })); selFill.position.y = 0.075; selFill.visible = false; root.add(selFill);
}

// ------------------------------------------------------------------ Qualität / Größe
function buildComposer() {
  if (composer) { composer.renderTarget1.dispose(); composer.renderTarget2.dispose(); }
  const Q = QUALITIES[quality];
  const rt = new THREE.WebGLRenderTarget(Math.max(2, viewW * dpr), Math.max(2, viewH * dpr), { type: THREE.HalfFloatType, samples: Q.samples });
  composer = new EffectComposer(renderer, rt);
  composer.setPixelRatio(dpr); composer.setSize(viewW, viewH);
  composer.addPass(new RenderPass(scene, camera));
  bloom = null;
  if (Q.bloom) { bloom = new UnrealBloomPass(new THREE.Vector2(viewW, viewH), 0.4, 0.5, 0.9); composer.addPass(bloom); }
  composer.addPass(new OutputPass());
}
function applyQuality() {
  const Q = QUALITIES[quality];
  dpr = Math.min(window.devicePixelRatio || 1, Q.dpr);
  renderer.setPixelRatio(dpr);
  sun.castShadow = Q.shadow > 0;
  if (Q.shadow) { sun.shadow.mapSize.set(Q.shadow, Q.shadow); if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; } }
  viewW = innerWidth; viewH = innerHeight; buildComposer(); updatePointScale();
}
function updatePointScale() { ptsMat.uniforms.uScale.value = viewH * dpr / (2 * Math.tan(camera.fov * Math.PI / 360)); }
export function setInsets(top, bot) { insetTop = top; insetBot = bot; resize(); }
export function resize() {
  const w = viewW = innerWidth, h = viewH = innerHeight;
  renderer.setSize(w, h, false); if (composer) { composer.setPixelRatio(dpr); composer.setSize(w, h); }
  const availH = Math.max(140, h - insetTop - insetBot - 6);
  rot = w / availH < 1.0; root.rotation.y = rot ? -Math.PI / 2 : 0; camera.aspect = w / h;
  const hw = (rot ? GH : GW) / 2 + 0.7, hd = (rot ? GW : GH) / 2, tv = Math.tan(camera.fov * Math.PI / 360);
  fit = Math.max((hd * Math.sin(EL) + 1.5) / tv * (h / availH), hw / (tv * camera.aspect)) * 1.04;
  camera.setViewOffset(w, h, 0, (insetBot - insetTop) / 2, w, h); camera.updateProjectionMatrix(); updatePointScale();
}
export const isRotated = () => rot;

// ------------------------------------------------------------------ Karte
export function setMap(i, cells) {
  const m = MAPS[i], th = curTheme = m.th;
  pathPts = m.pts.map(p => [cx2w(p[0]), cz2w(p[1])]); pathLen = [0]; pathTotal = 0;
  for (let k = 0; k < m.pts.length - 1; k++) { pathTotal += Math.abs(m.pts[k + 1][0] - m.pts[k][0]) + Math.abs(m.pts[k + 1][1] - m.pts[k][1]); pathLen.push(pathTotal); }
  const base = new THREE.Color(th[0]), grid = new THREE.Color(th[1]), pc = new THREE.Color(th[2]), acc = new THREE.Color(th[3]);
  let np = 0, nq = 0;
  for (let z = 0; z < GH; z++) for (let x = 0; x < GW; x++) {
    dummy.position.set(cx2w(x), cells[z][x] ? -0.06 : -0.03, cz2w(z)); dummy.rotation.set(0, 0, 0); dummy.scale.set(1, 1, 1); dummy.updateMatrix();
    if (cells[z][x]) { tilePathM.setMatrixAt(nq, dummy.matrix); tilePathM.setColorAt(nq, tmpC.copy(pc).multiplyScalar(0.5 + ((x + z) % 2) * 0.08)); nq++; }
    else { tilePad.setMatrixAt(np, dummy.matrix); tilePad.setColorAt(np, tmpC.copy(base).lerp(grid, 0.3 + ((x + z) % 2) * 0.1).multiplyScalar(1.0)); np++; }
  }
  tilePad.count = np; tilePathM.count = nq;
  [tilePad, tilePathM].forEach(t => { t.instanceMatrix.needsUpdate = true; t.instanceColor.needsUpdate = true; });
  M.pathTile.emissive.copy(acc); M.pathTile.emissiveIntensity = 0.1;
  M.trim.color.copy(acc); M.trim.emissive.copy(acc);
  underGlow.material.color.copy(acc); ribbonMat.color.copy(acc).multiplyScalar(1.25);
  // Fließband aus Pfeilen entlang des Wegs
  if (ribbon) { root.remove(ribbon); ribbon.geometry.dispose(); }
  const pos = [], uv = [], idx = []; let run = 0;
  for (let k = 0; k < pathPts.length - 1; k++) {
    const a = pathPts[k], b = pathPts[k + 1], dx = Math.sign(b[0] - a[0]), dz = Math.sign(b[1] - a[1]), len = Math.abs(b[0] - a[0]) + Math.abs(b[1] - a[1]), hw = 0.27, nx = -dz, nz = dx, o = pos.length / 3;
    pos.push(a[0] + nx * hw, 0.0, a[1] + nz * hw, a[0] - nx * hw, 0.0, a[1] - nz * hw, b[0] + nx * hw, 0.0, b[1] + nz * hw, b[0] - nx * hw, 0.0, b[1] - nz * hw);
    uv.push(run, 1, run, 0, run + len, 1, run + len, 0); idx.push(o, o + 1, o + 2, o + 1, o + 3, o + 2); run += len;
  }
  const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); rg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); rg.setIndex(idx);
  ribbon = new THREE.Mesh(rg, ribbonMat); ribbon.position.y = -0.005; ribbon.renderOrder = 1; root.add(ribbon);
  const a = pathPts[0], b = pathPts[1], e = pathPts[pathPts.length - 1];
  spawnG.position.set(a[0], 0.58, a[1]); spawnG.rotation.y = Math.atan2(b[0] - a[0], b[1] - a[1]);
  baseG.position.set(e[0], 0, e[1]);
  if (baseParts.spawnLabel) { spawnG.remove(baseParts.spawnLabel); baseParts.spawnLabel.material.map.dispose(); baseParts.spawnLabel.material.dispose(); }
  const lt = canvasTex(256, 64, (g, w, h) => { g.font = '800 30px system-ui,Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#ff7cc4'; g.shadowColor = '#ff2d95'; g.shadowBlur = 12; g.fillText('RAUSCHEN', 128, 34); });
  baseParts.spawnLabel = new THREE.Sprite(new THREE.SpriteMaterial({ map: lt, transparent: true, depthWrite: false, fog: false })); baseParts.spawnLabel.scale.set(1.6, 0.4, 1); baseParts.spawnLabel.position.set(0, 0.85, 0); spawnG.add(baseParts.spawnLabel);
  sun.shadow.needsUpdate = true; attachBaseSprite();
}
function attachBaseSprite() {
  if (baseParts.logo) { baseG.remove(baseParts.logo); baseParts.logo = null; }
  if (!spriteMats[6]) return;
  baseParts.logo = new THREE.Sprite(spriteMats[6]); baseParts.logo.scale.set(0.95, 0.95, 1); baseParts.logo.position.y = 3.15; baseG.add(baseParts.logo);
}

// Logo-Texturen für Türme (aus den geladenen Bildern, sonst Buchstaben-Platzhalter)
export function makeTextures(logos) {
  TY.concat([{ li: 6, col: '#7CFF6A', name: 'A' }]).forEach(T => {
    if (spriteMats[T.li]) return; const l = logos.find(x => x.idx === T.li); let tex;
    if (l) { tex = new THREE.Texture(l.im); tex.needsUpdate = true; tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4; tex.generateMipmaps = true; tex.minFilter = THREE.LinearMipmapLinearFilter; }
    else tex = canvasTex(128, 128, g => { g.fillStyle = '#0b1020'; g.fillRect(0, 0, 128, 128); g.fillStyle = T.col || '#fff'; g.font = '900 70px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText((T.name || '?')[0], 64, 68); });
    spriteMats[T.li] = new THREE.SpriteMaterial({ map: tex, depthWrite: false });
  });
  attachBaseSprite();
}

// ------------------------------------------------------------------ Türme
const mesh = (geo, mat, x = 0, y = 0, z = 0, parent) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; if (parent) parent.add(m); return m; };
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
function cylZ(r1, r2, len) { return new THREE.CylinderGeometry(r1, r2, len, 12).rotateX(Math.PI / 2); }
const HEADS = [
  // 0 Allrounder: Doppellauf
  (head, rec, mt, ac, gl) => {
    mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.16, 12), mt, 0, 0.08, 0, head); mesh(G.sph, gl, 0, 0.3, -0.04, head).scale.setScalar(0.12);
    [-0.09, 0.09].forEach(x => { mesh(box(0.07, 0.07, 0.5), ac, x, 0.2, 0.27, rec); mesh(box(0.05, 0.05, 0.05), gl, x, 0.2, 0.53, rec); });
    return {};
  },
  // 1 Bass-Bombe: dicke Haubitze
  (head, rec, mt, ac, gl) => {
    mesh(new THREE.CylinderGeometry(0.27, 0.31, 0.16, 12), mt, 0, 0.08, 0, head);
    mesh(cylZ(0.15, 0.2, 0.46), ac, 0, 0.23, 0.22, rec); const r = mesh(new THREE.TorusGeometry(0.17, 0.035, 8, 20), gl, 0, 0.23, 0.46, rec);
    mesh(new THREE.TorusGeometry(0.21, 0.02, 6, 16), gl, 0, 0.23, 0.06, rec);
    return {};
  },
  // 2 Frost-Pop: Kristall mit Splittern
  (head, rec, mt, ac, gl) => {
    const cry = mesh(new THREE.OctahedronGeometry(0.2), gl, 0, 0.36, 0, head); cry.scale.set(1, 1.8, 1);
    mesh(new THREE.CylinderGeometry(0.1, 0.22, 0.12, 8), mt, 0, 0.06, 0, head);
    const orb = new THREE.Group(); orb.position.y = 0.34; head.add(orb);
    for (let i = 0; i < 3; i++) { const s = mesh(new THREE.OctahedronGeometry(0.07), gl, Math.cos(i * 2.094) * 0.3, 0, Math.sin(i * 2.094) * 0.3, orb); s.scale.y = 1.7; }
    return { spin: [{ o: orb, s: 1.8 }, { o: cry, s: 0.8 }], noAim: true };
  },
  // 3 Hit-Blitz: Tesla-Spule
  (head, rec, mt, ac, gl) => {
    mesh(new THREE.CylinderGeometry(0.05, 0.1, 0.56, 8), mt, 0, 0.28, 0, head);
    const rings = [0.16, 0.3, 0.44].map((y, i) => mesh(new THREE.TorusGeometry(0.2 - i * 0.04, 0.025, 8, 24).rotateX(Math.PI / 2), gl, 0, y, 0, head));
    const top = mesh(G.sph, gl, 0, 0.62, 0, head); top.scale.setScalar(0.16);
    return { pulse: [top, ...rings], noAim: true };
  },
  // 4 Club-Laser: Prisma + Emitter
  (head, rec, mt, ac, gl) => {
    mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.14, 10), mt, 0, 0.07, 0, head);
    mesh(box(0.16, 0.16, 0.42), ac, 0, 0.22, 0.14, rec); mesh(cylZ(0.07, 0.07, 0.05), gl, 0, 0.22, 0.38, rec);
    const pr = mesh(new THREE.OctahedronGeometry(0.11), gl, 0, 0.5, -0.02, head);
    mesh(box(0.04, 0.2, 0.22), mt, -0.13, 0.28, -0.02, head); mesh(box(0.04, 0.2, 0.22), mt, 0.13, 0.28, -0.02, head);
    return { spin: [{ o: pr, s: 2.6 }] };
  },
  // 5 Rock-Sniper: langer Lauf
  (head, rec, mt, ac, gl) => {
    mesh(box(0.2, 0.18, 0.36), mt, 0, 0.17, -0.02, head);
    mesh(cylZ(0.035, 0.05, 0.98), ac, 0, 0.2, 0.46, rec); mesh(box(0.08, 0.08, 0.26), mt, 0, 0.34, 0.08, rec);
    mesh(box(0.1, 0.1, 0.06), gl, 0, 0.2, 0.96, rec); mesh(cylZ(0.04, 0.04, 0.02), gl, 0, 0.34, 0.22, rec);
    return {};
  },
  // 6 Werbe-Einnahmen: drehender Münzstapel
  (head, rec, mt, ac, gl) => {
    const c = new THREE.Group(); c.position.y = 0.3; head.add(c);
    [0, 0.065, 0.13].forEach((y, i) => mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 24), i === 2 ? gl : ac, 0, y - 0.08, 0, c));
    mesh(new THREE.TorusGeometry(0.28, 0.015, 6, 32).rotateX(Math.PI / 2), gl, 0, 0.0, 0, c);
    return { spin: [{ o: c, s: 1.6 }], bob: c, noAim: true };
  },
  // 7 Verstärker: Pylon mit pulsierenden Ringen
  (head, rec, mt, ac, gl) => {
    mesh(new THREE.ConeGeometry(0.11, 0.78, 8), mt, 0, 0.39, 0, head);
    const rings = [0.2, 0.42].map(y => mesh(new THREE.TorusGeometry(0.2, 0.02, 8, 28).rotateX(Math.PI / 2), gl, 0, y, 0, head));
    const top = mesh(G.sph, gl, 0, 0.82, 0, head); top.scale.setScalar(0.12);
    return { pulse: [top, ...rings], noAim: true };
  }
];

export function addTower(t) {
  const T = TY[t.type], g = new THREE.Group(); g.position.set(cx2w(t.cx), 0, cz2w(t.cz));
  const plinth = mesh(G.plinth, M.metal, 0, 0.07, 0, g); plinth.receiveShadow = true;
  mesh(G.ringFlat, M.glow[t.type], 0, 0.15, 0, g).castShadow = false;
  const ped = mesh(G.column, M.accent[t.type], 0, 0.3, 0, g);
  const head = new THREE.Group(), rec = new THREE.Group(); head.add(rec); g.add(head);
  const info = HEADS[t.type](head, rec, M.metal, M.accent[t.type], M.glow[t.type]);
  const pips = [0, 1, 2].map(i => { const a = 2.2 + i * 0.5, p = mesh(G.pip, M.pipOff, Math.sin(a) * 0.43, 0.17, Math.cos(a) * 0.43, g); p.scale.setScalar(1.6); p.castShadow = false; return p; });
  const badge = new THREE.Sprite(badgeMats[t.type]); badge.scale.set(0.62, 0.62, 1); badge.renderOrder = 6; g.add(badge);
  const logo = new THREE.Sprite(spriteMats[T.li]); logo.scale.set(0.5, 0.5, 1); logo.renderOrder = 7; g.add(logo);
  g.scale.setScalar(1.3); root.add(g);
  t.g = g; t.head = head; t.v = { ped, rec, info, pips, badge, logo, kick: 0, flash: 0, ph: Math.random() * 6 };
  styleTower(t);
}
export function styleTower(t) {
  const v = t.v, h = 0.2 + 0.1 * t.lvl; v.ped.scale.y = h; v.ped.position.y = 0.14 + h / 2;
  t.head.position.y = 0.14 + h; t.head.scale.setScalar(1 + 0.08 * (t.lvl - 1));
  const by = 0.14 + h + 1.0 + 0.05 * t.lvl; v.by = by;
  v.badge.position.y = by; v.logo.position.y = by; const s = 0.5 + 0.06 * t.lvl; v.logo.scale.set(s, s, 1); v.badge.scale.set(s + 0.1, s + 0.1, 1);
  v.pips.forEach((p, i) => { p.material = i < t.lvl ? M.glow[t.type] : M.pipOff; });
}
export function removeTower(t) { root.remove(t.g); }
export function towerFire(t) { t.v.kick = 1; t.v.flash = 1; }
export function muzzle(t, col) {
  const y = t.head.rotation.y, h = t.head.position.y * 1.3;
  burst(t.x + Math.sin(y) * 0.6, h + 0.3, t.z + Math.cos(y) * 0.6, col, 3, 1.4);
}

// ------------------------------------------------------------------ Effekte
export function burst(x, y, z, col, n, sp) {
  tmpC.set(col).multiplyScalar(2.2);
  for (let i = 0; i < n; i++) {
    const j = P.head = ((P.head || 0) + 1) % P.n, k = j * 3, a = Math.random() * 6.283, s = (0.3 + Math.random()) * (sp || 2);
    P.pos[k] = x; P.pos[k + 1] = y; P.pos[k + 2] = z; P.vel[k] = Math.cos(a) * s; P.vel[k + 1] = 0.8 + Math.random() * 2.2; P.vel[k + 2] = Math.sin(a) * s;
    P.col[k] = tmpC.r; P.col[k + 1] = tmpC.g; P.col[k + 2] = tmpC.b; P.max[j] = P.life[j] = 0.45 + Math.random() * 0.4; P.size[j] = 0.1 + Math.random() * 0.12;
  }
}
function spark(x, y, z, col, size, life) {
  const j = P.head = ((P.head || 0) + 1) % P.n, k = j * 3;
  P.pos[k] = x; P.pos[k + 1] = y; P.pos[k + 2] = z; P.vel[k] = P.vel[k + 1] = P.vel[k + 2] = 0; tmpC.set(col).multiplyScalar(1.8);
  P.col[k] = tmpC.r; P.col[k + 1] = tmpC.g; P.col[k + 2] = tmpC.b; P.max[j] = P.life[j] = life; P.size[j] = size;
}
function stepParticles(h) {
  for (let i = 0; i < P.n; i++) {
    if (P.life[i] > 0) {
      const k = i * 3; P.life[i] -= h; P.pos[k] += P.vel[k] * h; P.pos[k + 1] += P.vel[k + 1] * h; P.pos[k + 2] += P.vel[k + 2] * h; P.vel[k + 1] -= 6 * h;
      if (P.life[i] <= 0 || P.pos[k + 1] < -0.1) { P.life[i] = 0; P.pos[k + 1] = -99; P.a[i] = 0; } else P.a[i] = P.life[i] / P.max[i];
    }
  }
  const g = pts.geometry; g.attributes.position.needsUpdate = g.attributes.aA.needsUpdate = g.attributes.color.needsUpdate = g.attributes.aSize.needsUpdate = true;
  // Staub treiben lassen
  const d = P.dust.geometry.attributes.position; for (let i = 0; i < d.count; i++) { let y = d.getY(i) + h * (0.08 + (i % 5) * 0.03); if (y > 5.2) y = 0.2; d.setY(i, y); d.setX(i, d.getX(i) + Math.sin(time * 0.3 + i) * h * 0.1); } d.needsUpdate = true;
}
export function ring(x, z, col, r, dur, y = 0.1) { RINGS.push({ x, z, y, col: new THREE.Color(col).multiplyScalar(2.2), r, t: 0, dur: dur || 0.6 }); if (RINGS.length > 48) RINGS.shift(); }
let popFn = null;
export function setPopHandler(f) { popFn = f; }
export function pop(x, y, z, txt) { if (!popFn) return; const p = screenPos(x, y, z); if (p.vis) popFn(p.x, p.y, txt); }
export function flashBase() { baseParts.hit = 1; }
const cam = { mode: 'menu', az: 0, el: 0.55, dist: 30, introT: 1, from: null, shake: 0 };
export function shake(a) { cam.shake = Math.min(1, Math.max(cam.shake, a)); }
const ease = x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
export function setMode(mode) {
  if (mode === 'play' && cam.mode !== 'play') { cam.from = { az: ((cam.az + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI, el: cam.el, dist: cam.dist }; cam.introT = 0; }
  cam.mode = mode;
}
export const introDone = () => cam.mode !== 'play' || cam.introT >= 1;
export function screenPos(x, y, z) {
  tmpV.set(x, y, z); root.updateMatrixWorld(); camera.updateMatrixWorld(); tmpV.applyMatrix4(root.matrixWorld).project(camera);
  return { x: (tmpV.x + 1) / 2 * innerWidth, y: (1 - tmpV.y) / 2 * innerHeight, vis: tmpV.z < 1 };
}
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
export function pick(cx, cy) {
  ndc.set(cx / innerWidth * 2 - 1, -(cy / innerHeight * 2 - 1)); root.updateMatrixWorld(); camera.updateMatrixWorld();
  ray.setFromCamera(ndc, camera); const hit = ray.ray.intersectPlane(plane, tmpV); if (!hit) return null; root.worldToLocal(tmpV);
  const x = Math.floor(tmpV.x + GW / 2), z = Math.floor(tmpV.z + GH / 2); return x >= 0 && z >= 0 && x < GW && z < GH ? { x, z } : null;
}

// Position auf dem Weg (für Menü-Statisten)
function posAt(d) {
  d = ((d % pathTotal) + pathTotal) % pathTotal; let s = 0; while (s < pathLen.length - 2 && d > pathLen[s + 1]) s++;
  const a = pathPts[s], b = pathPts[s + 1], f = (d - pathLen[s]) / (pathLen[s + 1] - pathLen[s]);
  return { x: a[0] + (b[0] - a[0]) * f, z: a[1] + (b[1] - a[1]) * f, yaw: Math.atan2(b[0] - a[0], b[1] - a[1]) };
}
const DEMO = [['static', 0], ['static', 1.1], ['zip', 2.6], ['block', 4.2], ['swarm', 6.0], ['swarm', 6.4], ['static', 8.1], ['boss', 11]];

// ------------------------------------------------------------------ Rendern
const BARBG = new THREE.Color('#0b0f1a'), ICE = new THREE.Color('#8fe0ff'), WHITE = new THREE.Color('#ffffff');
export function render(dt, rawDt, S) {
  time += dt;
  // Qualität automatisch anpassen (nur abwärts bei dauerhaft niedriger Bildrate)
  if (autoQ && rawDt > 0 && rawDt < 0.25 && document.visibilityState === 'visible') {
    if (rawDt > 1 / 24) { if (++slowFrames > 50 && quality > 1) { quality--; slowFrames = 0; applyQuality(); } } else if (slowFrames > 0) slowFrames -= 0.5;
  }
  // Kamera
  const play = cam.mode === 'play';
  let az, el, dist;
  if (!play) { az = time * 0.09; el = 0.52 + Math.sin(time * 0.17) * 0.05; dist = fit * 1.12; cam.az = az; cam.el = el; cam.dist = dist; }
  else if (cam.introT < 1) {
    cam.introT = Math.min(1, cam.introT + dt / 2.6); const e = ease(cam.introT), f = cam.from;
    az = f.az * (1 - e); el = f.el + (EL - f.el) * e; dist = f.dist + (fit - f.dist) * e; cam.az = az; cam.el = el; cam.dist = dist;
  } else { az = Math.sin(time * 0.21) * 0.018; el = EL + Math.sin(time * 0.17) * 0.008; dist = fit; cam.az = az; cam.el = el; cam.dist = dist; }
  const sh = cam.shake; cam.shake = Math.max(0, cam.shake - dt * 1.8);
  const ce = Math.cos(el);
  camera.position.set(dist * ce * Math.sin(az) + (sh ? (Math.random() - 0.5) * sh * 0.5 : 0), dist * Math.sin(el) + (sh ? (Math.random() - 0.5) * sh * 0.4 : 0), dist * ce * Math.cos(az));
  camera.lookAt(0, play ? 0.1 : 0.4, 0); camera.updateMatrixWorld();

  // Kulisse
  ribbonTex.offset.x = -time * 0.9;
  underGlow.material.opacity = 0.32 + Math.sin(time * 1.3) * 0.05;
  searchlights.forEach((s, i) => { s.rotation.z = Math.sin(time * 0.35 + s.userData.ph) * 0.5; s.rotation.x = Math.cos(time * 0.27 + s.userData.ph) * 0.5; });
  baseParts.portalRings.forEach((r, i) => { r.rotation.z = time * (i % 2 ? -1.6 : 1.6); r.scale.setScalar(1 + Math.sin(time * 3 + i) * 0.05); });
  baseParts.portalDisc.rotation.z = -time; baseParts.portalLight.intensity = 5 + Math.sin(time * 5) * 1.5;
  baseParts.hit = Math.max(0, baseParts.hit - dt * 2.2);
  const hit = baseParts.hit; baseParts.mat.emissive.setRGB(0, 1, 0.78).lerp(tmpC.set('#ff2a3a'), hit); baseParts.mat.emissiveIntensity = 2.2 + hit * 2;
  baseParts.light.color.copy(baseParts.mat.emissive); baseParts.light.intensity = 8 + Math.sin(time * 3) * 2 + hit * 10;
  baseParts.tip.scale.setScalar(0.22 + Math.sin(time * 4) * 0.02);
  baseParts.waves.forEach(w => { const f = (time * 0.35 + w.userData.ph) % 1; w.scale.setScalar(0.3 + f * 2.2); w.material.opacity = (1 - f) * 0.7; w.material.color.setRGB(0, 1, 0.78).lerp(tmpC.set('#ff2a3a'), hit); });
  baseParts.beam.material.opacity = 0.2 + Math.sin(time * 2) * 0.04 + hit * 0.2;
  if (baseParts.logo) baseParts.logo.position.y = 3.15 + Math.sin(time * 2) * 0.05;
  if ((time * 18 | 0) !== render.sf) { render.sf = time * 18 | 0; staticTex.offset.set(Math.random(), Math.random()); }

  // Türme animieren
  for (const t of S.towers) {
    const v = t.v; v.kick = Math.max(0, v.kick - dt * 7); v.flash = Math.max(0, v.flash - dt * 6);
    v.rec.position.z = -v.kick * 0.1;
    const bob = Math.sin(time * 2 + v.ph) * 0.03; v.badge.position.y = v.by + bob; v.logo.position.y = v.by + bob;
    const i = v.info; if (i.spin) i.spin.forEach(s => { s.o.rotation.y += dt * s.s; });
    if (i.bob) i.bob.position.y = 0.3 + Math.sin(time * 2.2 + v.ph) * 0.04;
    if (i.pulse) i.pulse.forEach((p, k) => { const s = 1 + Math.sin(time * 6 + k * 1.3 + v.ph) * 0.06 + v.flash * 0.35; if (k === 0) p.scale.setScalar((p.userData.s0 || (p.userData.s0 = p.scale.x)) * s); else p.scale.set(s, s, s); });
  }

  // Gegner
  const counts = {}; Object.keys(enemyM).forEach(k => counts[k] = 0); let ng = 0, nb = 0, nr = 0;
  tmpQ.copy(root.quaternion).invert(); bq.copy(tmpQ).multiply(camera.quaternion); vR.set(1, 0, 0).applyQuaternion(bq);
  const list = S.state === 'play' || S.state === 'pause' || S.state === 'over' ? S.enemies : null;
  const drawEnemy = (e, E, type, x, z, yaw) => {
    const y = E.sc * 0.55 + 0.12 + Math.sin(time * 5 + e.id) * 0.05, m = enemyM[type], n = counts[type];
    if (n >= MAXE) return;
    const pop = 1 + (e.flash > 0 ? 0.18 : 0), sc = E.sc * 1.05 * pop;
    dummy.position.set(x, y, z); dummy.rotation.set(0, yaw, 0);
    if (type === 'zip') dummy.scale.set(sc * 0.8, sc * 0.8, sc * 1.7); else dummy.scale.set(sc, sc, sc);
    if (type === 'static' || type === 'block') dummy.rotation.set(Math.sin(time * 3 + e.id) * 0.12, yaw + Math.sin(time * 1.7 + e.id) * 0.2, Math.cos(time * 2.5 + e.id) * 0.1);
    if (type === 'swarm') dummy.rotation.set(time * 4 + e.id, yaw + time * 5, 0);
    if (type === 'boss') dummy.rotation.set(Math.sin(time) * 0.2, time * 0.8, 0);
    dummy.updateMatrix(); m.setMatrixAt(n, dummy.matrix);
    tmpC.copy(E.c).multiplyScalar(type === 'static' ? 0.5 : 1.2); if (e.slowT > 0) tmpC.lerp(ICE, 0.65); if (e.flash > 0) tmpC.lerp(WHITE, 0.6).multiplyScalar(1.5);
    m.setColorAt(n, tmpC); counts[type]++;
    // Bodenleuchten
    dummy.position.set(x, 0.05, z); dummy.rotation.set(0, 0, 0); dummy.scale.setScalar(E.sc * 2.0); dummy.updateMatrix(); enemyGlow.setMatrixAt(ng, dummy.matrix);
    enemyGlow.setColorAt(ng, tmpC.copy(E.c).multiplyScalar(0.3)); ng++;
    if (type === 'boss' && nr < 8) { dummy.position.set(x, y, z); dummy.rotation.set(Math.PI / 2 + Math.sin(time * 1.3) * 0.5, time * 1.4, 0); dummy.scale.setScalar(1.4); dummy.updateMatrix(); bossRing.setMatrixAt(nr, dummy.matrix); bossRing.setColorAt(nr, tmpC.copy(E.c).multiplyScalar(2.5)); nr++; }
    if (e.hp !== undefined && e.hp < e.max) {
      const r = Math.max(0, e.hp / e.max), bw = Math.max(0.6, E.sc * 1.3), by = y + E.sc * 0.75 + 0.28; tmpS.set(bw, 0.09, 1);
      tmpV.set(x, by, z); tmpM.compose(tmpV, bq, tmpS); enemyBarBg.setMatrixAt(nb, tmpM); enemyBarBg.setColorAt(nb, BARBG);
      tmpV.set(x, by, z).addScaledVector(vR, -bw * (1 - r) / 2); tmpS.set(Math.max(0.001, bw * r), 0.09, 1); tmpM.compose(tmpV, bq, tmpS); enemyBar.setMatrixAt(nb, tmpM); enemyBar.setColorAt(nb, tmpC.setHSL(r * 0.33, 1, 0.5).multiplyScalar(1.4)); nb++;
    }
  };
  if (list) {
    for (const e of list) {
      if (e.dead) continue; const E = ET[e.type], a = pathPts[e.seg], b = pathPts[e.seg + 1], want = Math.atan2(b[0] - a[0], b[1] - a[1]);
      if (e.yaw === undefined) e.yaw = want; let da = want - e.yaw; while (da > Math.PI) da -= 6.283; while (da < -Math.PI) da += 6.283; e.yaw += da * Math.min(1, dt * 10);
      drawEnemy(e, E, e.type, e.x, e.z, e.yaw);
      if (e.type === 'zip' && Math.random() < 0.6) spark(e.x, 0.3, e.z, E.col, 0.14, 0.3);
      else if (e.type === 'boss' && Math.random() < 0.5) spark(e.x + rnd(-0.3, 0.3), 0.4 + Math.random() * 0.6, e.z + rnd(-0.3, 0.3), E.col, 0.18, 0.5);
    }
  } else {
    DEMO.forEach(([type, off], i) => { const p = posAt(time * ET[type].sp * 0.9 + off * 1.2), e = { id: i, flash: 0, slowT: 0 }; drawEnemy(e, ET[type], type, p.x, p.z, p.yaw); });
  }
  Object.keys(enemyM).forEach(k => { const m = enemyM[k]; m.count = counts[k]; m.instanceMatrix.needsUpdate = true; m.instanceColor.needsUpdate = true; });
  enemyGlow.count = ng; bossRing.count = nr; enemyBar.count = enemyBarBg.count = nb;
  [enemyGlow, bossRing, enemyBar, enemyBarBg].forEach(m => { m.instanceMatrix.needsUpdate = true; m.instanceColor.needsUpdate = true; });

  // Geschosse mit Schweif
  let np = 0;
  for (const p of S.projs) {
    if (np >= 140) break; const vx = p.tx - p.x, vz = p.tz - p.z, l = Math.hypot(vx, vz) || 1;
    dummy.position.set(p.x, p.y, p.z); dummy.rotation.set(0, Math.atan2(vx, vz), 0); dummy.scale.set(p.sc, p.sc, p.sc * (p.sp > 20 ? 4 : 1.8)); dummy.updateMatrix(); projMesh.setMatrixAt(np, dummy.matrix); projMesh.setColorAt(np, tmpC.set(p.col).multiplyScalar(3)); np++;
    if (S.state === 'play') spark(p.x - vx / l * 0.1, p.y, p.z - vz / l * 0.1, p.col, p.sc * 0.9, 0.22);
  }
  projMesh.count = np; projMesh.instanceMatrix.needsUpdate = true; projMesh.instanceColor.needsUpdate = true;
  // Strahlen (Blitz zackig)
  let nbm = 0; const fr = (time * 40) | 0;
  for (const b of S.beams) {
    const k = b.t / 0.14, segs = b.zig ? 4 : 1; let px = b.ax, py = b.ay, pz = b.az;
    for (let s = 1; s <= segs; s++) {
      if (nbm >= 300) break; const f = s / segs, j = b.zig && s < segs ? 0.22 : 0;
      const sx = b.ax + (b.bx - b.ax) * f + (j ? Math.sin((fr + s) * 12.9898 + b.ax * 78.2) * j : 0), sy = b.ay + (b.by - b.ay) * f + (j ? Math.sin((fr + s) * 4.1 + b.bz) * j * 0.5 : 0), sz = b.az + (b.bz - b.az) * f + (j ? Math.sin((fr + s) * 7.3 + b.ax * 3.1) * j : 0);
      const len = Math.hypot(sx - px, sy - py, sz - pz) || 0.01, w = (b.laser ? 0.1 : 0.05) + 0.06 * k;
      dummy.position.set((px + sx) / 2, (py + sy) / 2, (pz + sz) / 2); dummy.lookAt(sx, sy, sz); dummy.scale.set(w, w, len); dummy.updateMatrix();
      beamMesh.setMatrixAt(nbm, dummy.matrix); beamMesh.setColorAt(nbm, tmpC.set(b.col).multiplyScalar(2.2)); nbm++; px = sx; py = sy; pz = sz;
    }
  }
  beamMesh.count = nbm; beamMesh.instanceMatrix.needsUpdate = true; beamMesh.instanceColor.needsUpdate = true;
  // Wellenringe
  let nrf = 0;
  for (let i = RINGS.length - 1; i >= 0; i--) {
    const r = RINGS[i]; r.t += dt; if (r.t >= r.dur) { RINGS.splice(i, 1); continue; }
    const f = r.t / r.dur, e = 1 - Math.pow(1 - f, 3); dummy.position.set(r.x, r.y, r.z); dummy.rotation.set(0, 0, 0); dummy.scale.setScalar(Math.max(0.01, r.r * e)); dummy.updateMatrix();
    ringFx.setMatrixAt(nrf, dummy.matrix); ringFx.setColorAt(nrf, tmpC.copy(r.col).multiplyScalar((1 - f) * (1 - f))); nrf++;
  }
  ringFx.count = nrf; ringFx.instanceMatrix.needsUpdate = true; ringFx.instanceColor.needsUpdate = true;
  stepParticles(dt);

  // Vorschau / Auswahl
  ghost.visible = false; selRing.visible = selFill.visible = false;
  if (S.state === 'play') {
    if (S.buildType >= 0 && S.cursor) {
      const T = TY[S.buildType]; ghost.visible = true; ghost.position.set(cx2w(S.cursor.x), 0, cz2w(S.cursor.z));
      const ok = S.ghostOk, c = ok ? 0x00ff88 : 0xff3355; ghostQuad.material.color.set(c); ghostQuad.material.opacity = 0.35 + Math.sin(time * 6) * 0.1;
      ghostPed.material.color.set(T.col); ghostPed.material.emissive.set(T.col); ghostPed.scale.y = 0.5; ghostPed.position.y = 0.28; ghostPed.position.y += Math.sin(time * 3) * 0.02;
      const r = T.range || 0; ghostRing.visible = ghostFill.visible = r > 0; ghostRing.scale.set(r || 1, 1, r || 1); ghostFill.scale.set(r || 1, 1, r || 1);
      ghostRing.material.color.set(ok ? T.col : 0xff3355).multiplyScalar(1.6); ghostFill.material.color.set(ok ? T.col : 0xff3355);
    }
    if (S.selTower) {
      const t = S.selTower, T = TY[t.type], r = S.selRange || 0.5; selRing.visible = selFill.visible = true; selRing.position.set(t.x, 0.08, t.z); selFill.position.set(t.x, 0.075, t.z);
      selRing.scale.set(r, 1, r); selFill.scale.set(r, 1, r); selRing.material.color.set(T.col).multiplyScalar(1.6); selFill.material.color.set(T.col);
    }
  }
  sun.target.position.set(0, 0, 0);
  composer.render();
}
export function currentQuality() { return quality; }
