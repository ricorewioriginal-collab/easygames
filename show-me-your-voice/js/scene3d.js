// SHOW ME YOUR VOICE – 3D-Studio (three.js). Liegt hinter der Oberfläche, ersetzt das Hintergrundbild
// und zeichnet beim Auftritt die Notenbahn als 3D-Highway auf dem Bühnenboden. Spiellogik bleibt in stage.js.
// Fällt der 3D-Teil aus (altes Gerät, kein WebGL), bleibt einfach das Hintergrundbild stehen.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SU from 'three/addons/utils/SkeletonUtils.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const q = new URLSearchParams(location.search);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = matchMedia('(pointer: coarse)').matches || Math.min(screen.width, screen.height) < 700;
const cv = document.createElement('canvas'); cv.id = 'c3d'; cv.setAttribute('aria-hidden', 'true');
let r;
try { r = new THREE.WebGLRenderer({ canvas: cv, antialias: !mobile, powerPreference: 'high-performance', preserveDrawingBuffer: q.has('cap') }); }
catch (e) { throw new Error('3D nicht verfügbar'); }
document.getElementById('bg').after(cv); document.body.classList.add('has3d');
r.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.25 : 1.75));
r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 0.9;
r.shadowMap.enabled = !mobile; r.shadowMap.type = THREE.PCFSoftShadowMap;

const s = new THREE.Scene(); s.background = new THREE.Color(0x05030c); s.fog = new THREE.FogExp2(0x0a0618, 0.03);
s.environment = new THREE.PMREMGenerator(r).fromScene(new RoomEnvironment(), 0.04).texture; s.environmentIntensity = 0.35;
const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
const FLOOR = 0.42;

// ---------- Studio ----------
const metal = new THREE.MeshStandardMaterial({ color: 0x8a8a96, metalness: 1, roughness: 0.35 });
const stage = new THREE.Mesh(new THREE.CylinderGeometry(5.05, 5.3, 0.42, 96), new THREE.MeshPhysicalMaterial({ color: 0x0c0b14, metalness: 0.5, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08 }));
stage.position.y = 0.21; stage.receiveShadow = true; s.add(stage);
const ring = new THREE.Mesh(new THREE.TorusGeometry(5.12, 0.045, 12, 160), new THREE.MeshBasicMaterial({ color: 0xff2aa0, toneMapped: false })); ring.rotation.x = Math.PI / 2; ring.position.y = FLOOR; s.add(ring);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), new THREE.MeshStandardMaterial({ color: 0x06050a, roughness: 0.5, metalness: 0.3 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; s.add(floor);
// Treppe zur Bühne
for (let i = 0; i < 3; i++) { const st = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.14, 0.45), stage.material); st.position.set(0, 0.07 + i * 0.14 - 0.14 * 2 + 0.28, 5.55 - i * 0.4 + 0.4); s.add(st); }

// LED-Wand mit animiertem Bild
const led = document.createElement('canvas'); led.width = 1024; led.height = 448; const lg = led.getContext('2d');
const ledTex = new THREE.CanvasTexture(led); ledTex.colorSpace = THREE.SRGBColorSpace;
const wall = new THREE.Mesh(new THREE.PlaneGeometry(16, 7), new THREE.MeshBasicMaterial({ map: ledTex, toneMapped: false, color: 0x8c8c8c })); wall.position.set(0, 4.3, -6); s.add(wall);
const wallFrame = new THREE.Mesh(new THREE.BoxGeometry(16.5, 7.5, 0.3), metal); wallFrame.position.set(0, 4.3, -6.2); s.add(wallFrame);
const side = [-11.5, 11.5].map(x => { const m = new THREE.Mesh(new THREE.PlaneGeometry(5, 7), new THREE.MeshBasicMaterial({ map: ledTex, toneMapped: false, color: 0x555555 })); m.position.set(x, 4.3, -4.6); m.rotation.y = -Math.sign(x) * 0.5; s.add(m); return m; });
let ledText = 'SHOW ME YOUR VOICE', ledHue = 320;
function drawLed(t, e) {
  const w = led.width, h = led.height;
  const g = lg.createLinearGradient(0, 0, w, h); g.addColorStop(0, `hsl(${ledHue - 60},80%,${14 + e * 10}%)`); g.addColorStop(0.5, `hsl(${ledHue},90%,${30 + e * 14}%)`); g.addColorStop(1, `hsl(${ledHue + 40},95%,${24 + e * 10}%)`);
  lg.fillStyle = g; lg.fillRect(0, 0, w, h);
  lg.lineWidth = 3; for (let i = 0; i < 22; i++) { const rr = ((i * 26 + t * 60) % 600); lg.strokeStyle = `rgba(255,255,255,${0.12 * (1 - rr / 600)})`; lg.beginPath(); lg.arc(w / 2, h / 2, rr, 0, 7); lg.stroke(); }
  lg.fillStyle = '#fff'; lg.textAlign = 'center'; lg.textBaseline = 'middle'; lg.shadowColor = '#ff6ad0'; lg.shadowBlur = 30;
  const words = ledText.split(' '); const half = Math.ceil(words.length / 2);
  const l1 = words.length > 2 ? words.slice(0, half).join(' ') : ledText, l2 = words.length > 2 ? words.slice(half).join(' ') : '';
  lg.font = '900 96px Impact, "Arial Black", sans-serif';
  if (l2) { lg.fillText(l1, w / 2, h / 2 - 56, w - 60); lg.fillText(l2, w / 2, h / 2 + 56, w - 60); } else lg.fillText(l1, w / 2, h / 2, w - 60);
  lg.shadowBlur = 0; lg.fillStyle = 'rgba(0,0,0,.4)'; for (let y = 0; y < h; y += 4) lg.fillRect(0, y, w, 1.5); for (let x = 0; x < w; x += 4) lg.fillRect(x, 0, 1.5, h);
  ledTex.needsUpdate = true;
}

// Traversen + Moving Heads mit Lichtkegeln
for (const x of [-9, 9]) { const t = new THREE.Mesh(new THREE.BoxGeometry(0.35, 10, 0.35), metal); t.position.set(x, 5, -3); s.add(t); }
[[-3, 9.6], [3, 8.2]].forEach(([z, y]) => { const t = new THREE.Mesh(new THREE.BoxGeometry(18.4, 0.35, 0.35), metal); t.position.set(0, y, z); s.add(t); });
const beams = [];
function head(x, y, z, c, i, main) {
  const L = new THREE.SpotLight(c, i, 30, 0.3, 0.5, 1.2); L.position.set(x, y - 0.5, z); s.add(L, L.target);
  if (main && r.shadowMap.enabled) { L.castShadow = true; L.shadow.mapSize.set(1024, 1024); }
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 0.5, 20), new THREE.MeshStandardMaterial({ color: 0x1a1a1f, metalness: 0.8, roughness: 0.4 })); body.position.set(x, y - 0.3, z); s.add(body);
  const cone = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 40, 1, true), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.045, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
  s.add(cone); beams.push({ L, cone, x, y: y - 0.5, z, c: new THREE.Color(c), base: i, ph: Math.random() * 6, main });
}
head(0, 8.2, 3, 0xfff1e0, 110, true); head(-6, 9.6, -3, 0xff2aa0, 170); head(6, 9.6, -3, 0x7a3cff, 170); head(-3, 9.6, -3, 0x2ad4ff, 90); head(3, 9.6, -3, 0xffa040, 90);
function aim(b, tx, tz) {
  b.L.target.position.set(tx, FLOOR, tz);
  const d = new THREE.Vector3(tx - b.x, FLOOR - b.y, tz - b.z), len = d.length();
  b.cone.scale.set(Math.tan(0.3) * len, len, Math.tan(0.3) * len); b.cone.position.set(b.x, b.y, b.z).addScaledVector(d, 0.5);
  b.cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), d.normalize());
}
s.add(new THREE.HemisphereLight(0x553377, 0x050208, 0.55));
const rim = new THREE.DirectionalLight(0xff4fb0, 1.4); rim.position.set(0, 4, -5); s.add(rim);

// Jurypult mit drei Buzzern
const desk = new THREE.Group(); s.add(desk); desk.position.set(0, 0, 7.2);
desk.add(new THREE.Mesh(new THREE.BoxGeometry(7.4, 1, 1.1), new THREE.MeshPhysicalMaterial({ color: 0x0a0910, metalness: 0.3, roughness: 0.5, clearcoat: 0.6 }))); desk.children[0].position.y = 0.5;
const deskLed = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.07, 0.02), new THREE.MeshBasicMaterial({ color: 0xffc24a, toneMapped: false })); deskLed.position.set(0, 0.9, -0.56); desk.add(deskLed);
const buzz = [-2.3, 0, 2.3].map(x => { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.08, 28), new THREE.MeshBasicMaterial({ color: 0x551018, toneMapped: false })); b.position.set(x + 0.55, 1.04, 0); desk.add(b); return b; });

// Publikum: Silhouetten mit Handylichtern (instanziert, schont das Handy)
const AUD = mobile ? 70 : 160, audM = new THREE.MeshStandardMaterial({ color: 0x050409, roughness: 1 });
const bodyI = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.22, 0.85, 3, 8), audM, AUD), headI = new THREE.InstancedMesh(new THREE.SphereGeometry(0.15, 10, 8), audM, AUD);
const phones = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.07, 0.12), new THREE.MeshBasicMaterial({ color: 0xdde8ff, toneMapped: false }), AUD);
const audP = []; const m4 = new THREE.Matrix4();
for (let i = 0; i < AUD; i++) { const row = Math.floor(Math.random() * 6), sd = Math.random() < 0.5 ? -1 : 1; audP.push({ x: sd * (7 + row * 1.1 + Math.random() * 0.6), z: -3 + Math.random() * 10, h: 1.45 + row * 0.35 + Math.random() * 0.3, ph: Math.random() * 6, ph2: Math.random() < 0.35 }); }   // Tribünen links und rechts, nie vor der Kamera
s.add(bodyI, headI, phones);
function placeAud(t, e) {
  audP.forEach((a, i) => {
    const j = Math.max(0, Math.sin(t * 7 + a.ph)) * 0.18 * e;
    m4.makeTranslation(a.x, a.h / 2 + j, a.z); bodyI.setMatrixAt(i, m4);
    m4.makeTranslation(a.x, a.h + 0.08 + j, a.z); headI.setMatrixAt(i, m4);
    if (a.ph2) m4.makeTranslation(a.x + 0.2 + Math.sin(t * 2 + a.ph) * 0.15 * e, a.h + 0.4 + j, a.z - 0.25); else m4.makeScale(0, 0, 0);
    phones.setMatrixAt(i, m4);
  });
  bodyI.instanceMatrix.needsUpdate = headI.instanceMatrix.needsUpdate = phones.instanceMatrix.needsUpdate = true;
}

// Konfetti / Funken
const NP = mobile ? 500 : 1400, pp = new Float32Array(NP * 3), pv = new Float32Array(NP * 3);
for (let i = 0; i < NP; i++) { pp[i * 3] = (Math.random() - 0.5) * 22; pp[i * 3 + 1] = Math.random() * 11; pp[i * 3 + 2] = (Math.random() - 0.5) * 16; }
const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pp, 3));
const dust = new THREE.Points(pg, new THREE.PointsMaterial({ color: 0xffd9f0, size: 0.035, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false })); s.add(dust);
const CN = 600, cp = new Float32Array(CN * 3), cc = new Float32Array(CN * 3), cvel = new Float32Array(CN * 3);
const cgeo = new THREE.BufferGeometry(); cgeo.setAttribute('position', new THREE.BufferAttribute(cp, 3)); cgeo.setAttribute('color', new THREE.BufferAttribute(cc, 3));
const confetti = new THREE.Points(cgeo, new THREE.PointsMaterial({ size: 0.12, vertexColors: true, transparent: true, depthWrite: false, toneMapped: false })); s.add(confetti);
for (let i = 0; i < CN; i++) cp[i * 3 + 1] = -50;
let confN = 0;
function boom(n, x, y, z, spread, cols) {
  for (let k = 0; k < n; k++) { const i = (confN++) % CN, c = new THREE.Color(cols[k % cols.length]);
    cp[i * 3] = x; cp[i * 3 + 1] = y; cp[i * 3 + 2] = z; cvel[i * 3] = (Math.random() - 0.5) * spread; cvel[i * 3 + 1] = Math.random() * spread * 0.9; cvel[i * 3 + 2] = (Math.random() - 0.5) * spread;
    cc[i * 3] = c.r; cc[i * 3 + 1] = c.g; cc[i * 3 + 2] = c.b; }
}

// ---------- Figuren: KayKit-Charaktere (CC0, Kay Lousberg), aus Kopf/Körper/Armen/Beinen der vier Klassen gemischt ----------
const KK = {}, KCLS = ['knight', 'mage', 'rogue', 'barbarian', 'rogue_hooded'];
let kmoves = {}, singer = null, mix = null, sAct = {}, judges = [], kkReady = false;
const loader = new GLTFLoader();
const PART = { head: /_(Head|Head_Hooded)$/, body: /_Body$/, arms: /_Arm(Left|Right)$/, legs: /_Leg(Left|Right)$/, hat: /_(Hat|Helmet)$/, cape: /_Cape$/ };
const SKINT = [0xffffff, 0xf6e2d2, 0xe0b896, 0xb98563, 0x8e6047, 0xfff0e6];
const SKIN = [0xffe0c8, 0xf1c27d, 0xc68642, 0x8d5524, 0xffd5b8];
const OUTFIT = [0xff2aa0, 0x3a86ff, 0xffc93c, 0x22c55e, 0x8a5cf6, 0xffffff, 0x222233, 0xff6b3d, 0x2ad4ff, 0xe11d48];
function rngOf(seed) { let x = (seed >>> 0) || 1; return () => ((x = (x * 1664525 + 1013904223) >>> 0) / 4294967296); }
// Figur aus einer Beschreibung bauen: { head, body, arms, legs, hat, cape, c1, c2 } (Klassen-Namen, Farben)
function makeChar(sp) {
  const base = SU.clone(KK[sp.body].scene), bones = {}; base.traverse(o => { if (o.isBone) bones[o.name] = o; });
  const drop = [];
  base.traverse(o => { if (!o.isSkinnedMesh && !o.isMesh) return;
    const n = o.name; if (PART.head.test(n) || PART.arms.test(n) || PART.legs.test(n) || PART.hat.test(n) || PART.cape.test(n)) drop.push(o); });
  drop.forEach(o => o.parent.remove(o));
  const take = (cls, re) => { const src = KK[cls].scene; src.traverse(o => { if (!o.isMesh || !re.test(o.name)) return;
    if (!o.isSkinnedMesh) { const at = bones[o.parent && o.parent.name]; if (at) { const m = o.clone(); at.add(m); } return; }   // Hut/Helm/Umhang hängen fest an einem Knochen
    const m = o.clone(); m.bind(new THREE.Skeleton(o.skeleton.bones.map(b => bones[b.name] || b), o.skeleton.boneInverses), o.bindMatrix);
    const host = bones.root ? bones.root.parent : base; host.add(m); }); };
  take(sp.head, PART.head); take(sp.arms, PART.arms); take(sp.legs, PART.legs);
  if (sp.hat) take(sp.hat, PART.hat); if (sp.cape) take(sp.cape, PART.cape);
  base.traverse(o => { if (!o.isMesh) return; o.castShadow = true; o.frustumCulled = false; o.material = o.material.clone();
    const n = o.name; if (PART.body.test(n) || PART.cape.test(n)) o.material.color.set(sp.c1).lerp(new THREE.Color(0xffffff), 0.12);
    else if (PART.head.test(n) && sp.skin != null) o.material.color.set(SKINT[sp.skin % SKINT.length]);
    else if (PART.legs.test(n)) o.material.color.set(sp.c2).lerp(new THREE.Color(0xffffff), 0.2);
    else if (PART.arms.test(n)) o.material.color.set(sp.c1).lerp(new THREE.Color(0xffffff), 0.35); });
  const g = new THREE.Group(); g.add(base); const bb = new THREE.Box3().setFromObject(base); base.scale.setScalar(1.75 / Math.max(0.5, bb.max.y - bb.min.y));
  const m = new THREE.AnimationMixer(base);
  return { f: g, m, base, play(name, fade) { const c = kmoves[name]; if (!c) return; const a = m.clipAction(c); if (this.cur === a) return; a.reset().play(); if (this.cur && fade !== 0) a.crossFadeFrom(this.cur, fade || 0.3, false); this.cur = a; } };
}
function specOf(seed) { const R = rngOf(seed), pick = a => a[Math.floor(R() * a.length)], cls = KCLS.slice(0, 4);
  return { head: pick(KCLS), body: pick(cls), arms: pick(cls), legs: pick(cls), hat: R() < 0.35 ? pick(['knight', 'mage', 'barbarian']) : null, cape: R() < 0.25 ? pick(cls) : null, c1: pick(OUTFIT), c2: pick(OUTFIT) }; }
// Feste Figuren der Show (Jury, Coach, Moderator) und Ableitung aus dem alten 2D-Look für Gäste und Kandidaten
const NAMED = {
  marc: { head: 'knight', body: 'knight', arms: 'knight', legs: 'rogue', c1: 0x222233, c2: 0x222233 },
  lena: { head: 'rogue', body: 'mage', arms: 'rogue', legs: 'rogue', c1: 0xff2aa0, c2: 0x8a5cf6 },
  david: { head: 'barbarian', body: 'rogue', arms: 'barbarian', legs: 'knight', c1: 0x3a86ff, c2: 0x222233, skin: 3 },
  sophie: { head: 'rogue_hooded', body: 'mage', arms: 'mage', legs: 'rogue', c1: 0xffc93c, c2: 0xffffff },
  rico: { head: 'knight', body: 'barbarian', arms: 'barbarian', legs: 'rogue', c1: 0xff6b3d, c2: 0x222233, cape: 'knight' }
};
const FEM = /^(lena|sophie|nina|jule|greta|mira|nova|elif|clara|yuki)$/;
const BODY_OF = { sakko: 'knight', glitzer: 'mage', lederjacke: 'rogue', hoodie: 'barbarian', tshirt: 'barbarian' };
function specFor(id, lk) {
  if (NAMED[id]) return NAMED[id];
  const R = rngOf([...String(id)].reduce((a, c) => a * 31 + c.charCodeAt(0), 7)), pick = a => a[Math.floor(R() * a.length)], cls = KCLS.slice(0, 4);
  lk = lk || {}; const body = BODY_OF[lk.outfit] || pick(cls);
  const HAIR = { lang: 'rogue', dutt: 'rogue', locken: 'rogue_hooded', kurz: 'knight', buzz: 'barbarian', undercut: 'mage', stachelig: 'knight' };
  const ok = v => v && v !== 'auto' && v !== 'none' ? v : null, A = window.SMYVAvatar;
  if (/^p/.test(id) && (ok(lk.kkHead) || ok(lk.kkBody) || ok(lk.kkArms) || ok(lk.kkLegs) || lk.kkHat || lk.kkCape || lk.kkC2 != null)) {
    const sp = { head: ok(lk.kkHead) || HAIR[lk.hair] || 'knight', body: ok(lk.kkBody) || body, arms: ok(lk.kkArms) || body, legs: ok(lk.kkLegs) || body, hat: ok(lk.kkHat), cape: ok(lk.kkCape),
      c1: col2d(lk.outfitColor) ?? OUTFIT[0], c2: A && Number.isFinite(lk.kkC2) ? parseInt(A.OPT.kkC2[lk.kkC2 % A.OPT.kkC2.length].slice(1), 16) : 0x222233, skin: lk.skin || 0 };
    return sp;
  }
  return { head: (FEM.test(id) ? pick(['rogue', 'rogue_hooded']) : /^p/.test(id) && HAIR[lk.hair] ? HAIR[lk.hair] : pick(['knight', 'barbarian', 'mage'])), body, arms: R() < 0.6 ? body : pick(cls), legs: pick(cls),
    hat: lk.acc === 'hut' ? 'mage' : null, cape: R() < 0.2 ? pick(cls) : null, c1: col2d(lk.outfitColor) ?? OUTFIT[(lk.outfitColor || 0) % OUTFIT.length], c2: pick(OUTFIT), skin: lk.skin || 0 };
}
function col2d(i) { const A = window.SMYVAvatar, L = A && A.OPT.outfitColor; if (!L || !Number.isFinite(i)) return null; return parseInt(L[i % L.length].slice(1), 16); }
function lookOfId(id) { const D = window.SMYV_DATA || {}; const all = [].concat(D.CANDIDATES || [], D.JURY || [], D.HOST || [], D.COACH || []); const c = all.find(x => x.id === id); return c && c.look; }
let pSpec = null;
function playerSpec() { return pSpec || Object.assign(specOf(look.seed), look.tint ? { c1: look.tint } : {});
}
// Porträt einer Figur als Bild (Jury-Kacheln, Kandidaten, Avatar-Vorschau)
let pr = null;
function portrait(sp, w, h, anim) {
  if (!kkReady) return null; w = w || 240; h = h || 320;
  if (!pr) { const c = document.createElement('canvas'); pr = { r: new THREE.WebGLRenderer({ canvas: c, antialias: true, preserveDrawingBuffer: true, alpha: false }), s: new THREE.Scene(), cam: new THREE.PerspectiveCamera(24, 0.75, 0.1, 50) };
    pr.r.toneMapping = THREE.ACESFilmicToneMapping; pr.r.outputColorSpace = THREE.SRGBColorSpace;
    pr.s.environment = new THREE.PMREMGenerator(pr.r).fromScene(new RoomEnvironment(), 0.04).texture; pr.s.environmentIntensity = 0.5;
    pr.s.background = cvTex(256, 340, (g, W, H) => { const gr = g.createRadialGradient(W / 2, H * 0.38, 10, W / 2, H * 0.5, H * 0.8); gr.addColorStop(0, '#5a1650'); gr.addColorStop(0.55, '#1c0a2c'); gr.addColorStop(1, '#07040d'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      for (let i = 0; i < 26; i++) { g.fillStyle = `rgba(255,${150 + Math.random() * 100},${90 + Math.random() * 120},${0.06 + Math.random() * 0.12})`; g.beginPath(); g.arc(Math.random() * W, Math.random() * H, 4 + Math.random() * 18, 0, 7); g.fill(); } });
    const key = new THREE.DirectionalLight(0xfff1e6, 2.6); key.position.set(1.5, 3, 4); pr.s.add(key);
    const rimA = new THREE.DirectionalLight(0xff2aa0, 3.2); rimA.position.set(-3, 2, -2); pr.s.add(rimA);
    const rimB = new THREE.DirectionalLight(0xffc93c, 2.2); rimB.position.set(3, 1.5, -2); pr.s.add(rimB); pr.s.add(new THREE.AmbientLight(0x6a5080, 0.6)); }
  pr.r.setSize(w, h, false); pr.cam.aspect = w / h; pr.cam.updateProjectionMatrix();
  const c = makeChar(sp); c.play(anim || 'Idle', 0); c.m.update(0.4); pr.s.add(c.f); c.f.rotation.y = -0.32; c.f.updateMatrixWorld(true);
  pr.cam.position.set(0.3, 1.3, 4.6); pr.cam.lookAt(0, 1.05, 0);
  pr.r.render(pr.s, pr.cam); const url = pr.r.domElement.toDataURL('image/jpeg', 0.88); pr.s.remove(c.f); return url;
}
const look = { tint: null, seed: 7 };
function addMic() {
  const mic = new THREE.Group(); const mm = new THREE.MeshStandardMaterial({ color: 0x222228, metalness: 1, roughness: 0.25 });
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.45, 12), mm); pole.position.y = 0.72; mic.add(pole);
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.03, 28), mm); mic.add(foot);
  const capM = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 12), new THREE.MeshStandardMaterial({ color: 0x999999, metalness: 1, roughness: 0.5 })); capM.position.y = 1.47; mic.add(capM);
  mic.position.set(0.55, FLOOR, 0.6); s.add(mic);
}
function buildStageFigures() {
  if (singer) { s.remove(singer.f); }
  singer = makeChar(playerSpec()); singer.f.position.set(0, FLOOR, 0); s.add(singer.f); singer.play('Idle', 0); mix = singer.m;
  if (!judges.length) {   // Jury sitzt am Pult und schaut zur Bühne
    const chairM = new THREE.MeshPhysicalMaterial({ color: 0x1a1a24, roughness: 0.3, clearcoat: 1 });
    judges = [-2.3, 0, 2.3].map((x, i) => { const j = makeChar(NAMED[['marc', 'lena', 'david'][i]]); j.f.position.set(x, 0, 7.75); j.f.rotation.y = Math.PI; s.add(j.f); j.play('Sit_Chair_Idle', 0); j.m.setTime(i * 0.6);
      const ch = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.12, 0.7), chairM); ch.position.set(x, 0.45, 7.8); s.add(ch); const bk = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.1), chairM); bk.position.set(x, 0.95, 8.15); s.add(bk);
      return { j: j.f, jm: j.m, c: j }; });
  }
}
Promise.all(KCLS.map(c => loader.loadAsync('assets3d/kk-' + c + '.glb').then(g => { KK[c] = g; })).concat(fetch('assets3d/kk-moves.json').then(r2 => r2.json()).then(list => { list.forEach(j => { kmoves[j.name] = THREE.AnimationClip.parse(j); }); })))
  .then(() => { kkReady = true; addMic(); buildStageFigures(); buildFigures(); }).catch(e => console.warn('3D-Figuren', e));
function setTint(hex) { look.tint = hex; if (kkReady) buildStageFigures(); }

// ---------- Notenbahn (3D-Highway) ----------
const HW = new THREE.Group(); s.add(HW); HW.visible = false;
const LANE_COL = [0x3a86ff, 0x22c55e, 0xf4b400, 0xff4d8d];
const laneMeshes = [], ringsM = [], noteMeshes = [];
const noteGeo = new THREE.SphereGeometry(1, 24, 16); noteGeo.scale(1, 0.55, 1);
for (let i = 0; i < 4; i++) {
  const lm = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: LANE_COL[i], transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  lm.rotation.x = -Math.PI / 2; HW.add(lm); laneMeshes.push(lm);
  const rg = new THREE.Mesh(new THREE.TorusGeometry(1, 0.12, 10, 40), new THREE.MeshBasicMaterial({ color: LANE_COL[i], toneMapped: false })); rg.rotation.x = -Math.PI / 2; HW.add(rg); ringsM.push(rg);
}
const hitBar = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.03), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, toneMapped: false })); hitBar.rotation.x = -Math.PI / 2; HW.add(hitBar);
const noteMat = LANE_COL.map(c => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 1.6, metalness: 0.3, roughness: 0.2 }));
const missMat = new THREE.MeshStandardMaterial({ color: 0x333344, transparent: true, opacity: 0.4 });
function noteMesh(k) { while (noteMeshes.length <= k) { const m = new THREE.Mesh(noteGeo, noteMat[0]); HW.add(m); noteMeshes.push(m); } return noteMeshes[k]; }
const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -FLOOR - 0.02), tmpV = new THREE.Vector3();
function screenToFloor(px, py, W, H) { ray.setFromCamera(new THREE.Vector2(px / W * 2 - 1, -(py / H) * 2 + 1), cam); return ray.ray.intersectPlane(plane, tmpV) ? tmpV.clone() : null; }

const VX = 80, ZX = -80;   // Villa und Zitterraum liegen neben dem Studio
// ---------- Kamera-Einstellungen je Bildschirm ----------
const SHOTS = {
  stage: { p: [0, 3.9, 14.5], t: [0, 1.5, 0], fov: 30, hue: 320, orbit: 0.35 },
  title: { p: [0, 3.4, 13.5], t: [0, 2.1, -1], fov: 34, hue: 300, orbit: 0.6 },
  menu: { p: [-4.5, 3.8, 13], t: [0.5, 1.5, 0], fov: 32, hue: 280, orbit: 0.4 },
  backstage: { p: [VX + 7, 6.5, 10], t: [VX, 0.8, 0], fov: 46, hue: 30, orbit: 0.2, dim: 0.75 },
  zitter: { p: [ZX, 1.9, 7.5], t: [ZX, 1.35, 0], fov: 34, hue: 230, orbit: 0.25, dim: 1 },
  chairs: { p: [0.4, 2.1, 3.2], t: [0, 1.25, 7.8], fov: 40, hue: 200, orbit: 0.2 },
  arena: { p: [0, 4.8, 16], t: [0, 2.4, 0], fov: 34, hue: 45, orbit: 0.5 },
  win: { p: [0, 1.6, 6], t: [0, 1.6, 0], fov: 36, hue: 48, orbit: 0.9 },
  out: { p: [3, 1.5, 7], t: [0, 1.4, 0], fov: 34, hue: 230, orbit: 0.15, dim: 0.35 },
  play: { p: [0, 3.6, 12.5], t: [0, 1.0, 0], fov: 38, hue: 320, orbit: 0 },
  playP: { p: [0, 5.2, 13.5], t: [0, 0.6, 1.5], fov: 52, hue: 320, orbit: 0 }
};
let shot = SHOTS.title, shotName = 'title', blend = 1;
const camP = new THREE.Vector3(...shot.p), camT = new THREE.Vector3(...shot.t); let camFov = shot.fov, dim = 1;
function setShot(name) { const n = SHOTS[name] ? name : 'stage'; if (n === shotName) return; shotName = n; shot = SHOTS[n]; blend = 0; if (n === 'win') boom(240, 0, 9, 0, 6, [0xffd23f, 0xff4d8d, 0x3a86ff, 0xffffff]); }

// ---------- Nachbearbeitung ----------
let comp = null;
if (!mobile && !reduced && !q.has('nobloom')) { comp = new EffectComposer(r); comp.addPass(new RenderPass(s, cam)); comp.addPass(new UnrealBloomPass(new THREE.Vector2(256, 256), 0.5, 0.5, 0.82)); comp.addPass(new OutputPass()); }
function resize() { const w = innerWidth, h = innerHeight; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); if (comp) comp.setSize(w, h); }
addEventListener('resize', resize); resize();

// ---------- Auftritt ----------
let st = null, seen = new WeakSet(), flash = [0, 0, 0, 0];
const API = window.SMYV3D = {
  mode(name) { setShot(name); },
  text(t) { if (t) ledText = String(t).toUpperCase().slice(0, 40); },
  tint(hex) { setTint(hex); },
  bind(stage) { st = stage; seen = new WeakSet(); setShot(innerHeight > innerWidth ? 'playP' : 'play'); },
  unbind() { st = null; HW.visible = false; },
  jury(i, on) { if (buzz[i]) buzz[i].material.color.set(on ? 0xff1a30 : 0x551018); },
  cheer(n) { boom(n || 160, 0, 8.5, 0, 5, [0xffd23f, 0xff4d8d, 0x3a86ff, 0x22c55e, 0xffffff]); },
  ready: true,
  portrait(id, lk, w, h) { return portrait(typeof id === 'object' ? id : specFor(id, lk), w, h); },
  spec: specFor, isReady() { return kkReady; },
  player(lk) { pSpec = lk ? Object.assign({}, lk.kkSpec || specFor('p' + (lk.seed || ''), lk)) : null; if (!kkReady) return; buildStageFigures(); if (player) { const pos = player.position.clone(), ry = player.rotation.y; V.remove(player); const p = makeChar(playerSpec()); p.f.position.copy(pos); p.f.rotation.y = ry; V.add(p.f); player = p.f; pMix = p.m; p.play('Idle', 0); pAct = p; } },
  dbg() { return { cam: cam.position.toArray().map(v => +v.toFixed(2)), walk: walkSt.on, x: walkSt.x, z: walkSt.z, player: !!player, moves: Object.keys(kmoves).length }; }
};
window.dispatchEvent(new Event('smyv3d'));

function drawHighway() {
  const p = st && st.part; const on = !!(p && p.type === 'rhythm' && st.cv && !st.done);
  HW.visible = on; desk.visible = !on; judges.forEach(x => { x.j.visible = !on; }); if (!on) return;
  const W = innerWidth, H = innerHeight, rc = st.cv.getBoundingClientRect(), g = st.laneGeo();
  const yHit = rc.top + g.hitY, xs = [0, 1, 2, 3].map(i => rc.left + g.x0 + (i + 0.5) * g.lw);
  const pts = xs.map(x => screenToFloor(x, yHit, W, H)); if (pts.some(v => !v)) { HW.visible = false; return; }
  const hitZ = pts[0].z, lw = Math.abs(pts[1].x - pts[0].x), L = 26, far = hitZ - L, t = st.now - (st.offset || 0), trav = st.travel || 2;
  pts.forEach((v, i) => {
    const lm = laneMeshes[i]; lm.scale.set(lw * 0.9, L + 0.6, 1); lm.position.set(v.x, FLOOR + 0.01, hitZ - L / 2 + 0.3); lm.material.opacity = (st.held && st.held[i] ? 0.32 : 0.14) + flash[i] * 0.3;
    const rg = ringsM[i]; const rs = lw * 0.36 * (1 + flash[i] * 0.35); rg.scale.set(rs, rs, rs); rg.position.set(v.x, FLOOR + 0.03, hitZ);
  });
  hitBar.scale.set(lw * 4.2, 1, 1); hitBar.position.set((pts[0].x + pts[3].x) / 2, FLOOR + 0.02, hitZ);
  let k = 0;
  for (const n of st.notes) {
    const dt = n.t - t; if (dt > trav) break;
    if (n.st && n.st !== 4) { if (!seen.has(n)) { seen.add(n); flash[n.lane] = 1; boom(n.st === 1 ? 16 : 8, pts[n.lane].x, FLOOR + 0.2, hitZ, 2.2, [LANE_COL[n.lane], 0xffffff]); } continue; }
    if (dt < -0.12) continue;
    const m = noteMesh(k++), z = hitZ - dt / trav * L, rs = lw * 0.3;
    m.visible = true; m.material = n.st === 4 ? missMat : noteMat[n.lane]; m.scale.set(rs, rs, rs); m.position.set(pts[n.lane].x, FLOOR + rs * 0.6, Math.min(z, hitZ + 0.5));
  }
  for (; k < noteMeshes.length; k++) noteMeshes[k].visible = false;
}


// ---------- Kandidaten-Villa (begehbar) und Zitterraum ----------
function cvTex(w, h, draw, rep) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); } t.anisotropy = 4; return t; }
const wood = cvTex(512, 512, (g, w, h) => { for (let i = 0; i < 8; i++) { const y = i * h / 8; g.fillStyle = `hsl(28,${35 + (i % 3) * 6}%,${26 + (i * 7 % 9)}%)`; g.fillRect(0, y, w, h / 8 - 2); for (let k = 0; k < 40; k++) { g.strokeStyle = 'rgba(0,0,0,.08)'; g.beginPath(); const yy = y + Math.random() * h / 8; g.moveTo(0, yy); g.bezierCurveTo(w / 3, yy + 4, w * 2 / 3, yy - 4, w, yy); g.stroke(); } g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect((i * 173) % w, y, 2, h / 8); } }, [6, 5]);
const city = cvTex(1024, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0b0a2a'); gr.addColorStop(0.6, '#3a1250'); gr.addColorStop(1, '#ff6a3d'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 70; i++) { const bw = 20 + Math.random() * 50, bh = 80 + Math.random() * 260, x = Math.random() * w; g.fillStyle = '#07061a'; g.fillRect(x, h - bh, bw, bh); for (let k = 0; k < bh / 9; k++) for (let j = 0; j < bw / 8; j++) if (Math.random() < 0.3) { g.fillStyle = `rgba(255,${200 + Math.random() * 55},${120 + Math.random() * 80},.85)`; g.fillRect(x + 2 + j * 8, h - bh + 4 + k * 9, 4, 5); } } });
const neon = (txt, col) => cvTex(512, 128, (g, w, h) => { g.fillStyle = 'rgba(0,0,0,0)'; g.clearRect(0, 0, w, h); g.font = '900 78px Impact, "Arial Black", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = col; g.shadowBlur = 28; g.fillStyle = '#fff'; g.fillText(txt, w / 2, h / 2); g.fillText(txt, w / 2, h / 2); });
const V = new THREE.Group(); V.position.x = VX; s.add(V);
const VW = 18, VD = 13;
const vFloor = new THREE.Mesh(new THREE.PlaneGeometry(VW, VD), new THREE.MeshStandardMaterial({ map: wood, roughness: 0.45, metalness: 0.05 })); vFloor.rotation.x = -Math.PI / 2; vFloor.receiveShadow = true; V.add(vFloor);
const wallM = new THREE.MeshStandardMaterial({ color: 0x8f86a8, roughness: 0.9 });
const addBox = (w, h, d, x, y, z, m, par) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.castShadow = b.receiveShadow = true; (par || V).add(b); return b; };
addBox(VW, 4, 0.2, 0, 2, -VD / 2, wallM); addBox(0.2, 4, VD, -VW / 2, 2, 0, wallM); addBox(0.2, 4, VD, VW / 2, 2, 0, wallM);
const win = new THREE.Mesh(new THREE.PlaneGeometry(7, 2.6), new THREE.MeshBasicMaterial({ map: city, toneMapped: false, color: 0xbbbbbb })); win.position.set(VW / 2 - 0.12, 2.1, -1); win.rotation.y = -Math.PI / 2; V.add(win);
for (let i = -1; i <= 1; i++) addBox(0.08, 2.7, 0.08, VW / 2 - 0.15, 2.1, -1 + i * 3.5 / 1.5, metal);
const rug = new THREE.Mesh(new THREE.CircleGeometry(2.6, 64), new THREE.MeshStandardMaterial({ color: 0x5a2a8a, roughness: 1 })); rug.rotation.x = -Math.PI / 2; rug.position.set(4.5, 0.01, 0.5); V.add(rug);
// Sofa-Ecke mit Ringlicht (Community)
const sofaM = new THREE.MeshPhysicalMaterial({ color: 0xff3d8a, roughness: 0.7, sheen: 1, sheenColor: new THREE.Color(0xffaad0) });
addBox(3.6, 0.5, 1.1, 4.5, 0.25, -1.7, sofaM); addBox(3.6, 0.9, 0.3, 4.5, 0.7, -2.2, sofaM); addBox(0.3, 0.75, 1.1, 2.75, 0.5, -1.7, sofaM); addBox(0.3, 0.75, 1.1, 6.25, 0.5, -1.7, sofaM);
addBox(1.4, 0.4, 0.8, 4.5, 0.2, 0.4, new THREE.MeshPhysicalMaterial({ color: 0x111111, roughness: 0.1, clearcoat: 1 }));
const ringL = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.04, 12, 48), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false })); ringL.position.set(7.2, 1.7, -0.6); ringL.rotation.y = -0.8; V.add(ringL);
addBox(0.03, 1.6, 0.03, 7.2, 0.8, -0.6, metal);
// Proberaum-Ecke (Training): Mikro, Lautsprecher, Spiegelwand
addBox(0.05, 2.6, 4, -VW / 2 + 0.15, 1.6, -3.5, new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0.05 }));
addBox(0.7, 1.2, 0.6, -6.6, 0.6, -5.6, new THREE.MeshStandardMaterial({ color: 0x18181c, roughness: 0.6 })); addBox(0.7, 1.2, 0.6, -4.2, 0.6, -5.6, new THREE.MeshStandardMaterial({ color: 0x18181c, roughness: 0.6 }));
addBox(0.02, 1.5, 0.02, -5.4, 0.75, -3.6, metal); addBox(0.3, 0.02, 0.3, -5.4, 0.01, -3.6, metal);
// Schminktisch mit Lichterspiegel (Profil)
addBox(2, 0.08, 0.7, 6.6, 0.85, 4.9, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })); addBox(1.6, 1.2, 0.05, 6.6, 1.8, 5.3, new THREE.MeshStandardMaterial({ color: 0xcfd8ff, metalness: 1, roughness: 0.05 }));
for (let i = 0; i < 8; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), new THREE.MeshBasicMaterial({ color: 0xfff1c0, toneMapped: false })); const a = i / 8 * Math.PI * 2; b.position.set(6.6 + Math.cos(a) * 0.9, 1.8 + Math.sin(a) * 0.68, 5.25); V.add(b); }
// Küchentresen + Pflanzen
addBox(3.2, 1, 0.9, -5, 0.5, 4.6, new THREE.MeshPhysicalMaterial({ color: 0x222230, roughness: 0.2, clearcoat: 1 }));
addBox(3.3, 0.06, 1, -5, 1.02, 4.6, new THREE.MeshStandardMaterial({ color: 0xf2efe8, roughness: 0.15 }));
const leafM = new THREE.MeshStandardMaterial({ color: 0x2f8a4a, roughness: 0.7 });
[[-8.2, -0.6], [8.2, 3.4], [-1.6, -5.8], [1.6, -5.8]].forEach(([x, z]) => { addBox(0.5, 0.6, 0.5, x, 0.3, z, new THREE.MeshStandardMaterial({ color: 0xd8cfc0, roughness: 0.8 })); for (let k = 0; k < 7; k++) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 10), leafM); l.scale.set(1, 1.6, 0.4); l.position.set(x + Math.sin(k * 2) * 0.22, 0.95 + k * 0.08, z + Math.cos(k * 2) * 0.22); l.rotation.set(Math.sin(k) * 0.6, k, Math.cos(k) * 0.6); l.castShadow = true; V.add(l); } });
// Bühnentür mit Neonschild und Ausgang
addBox(1.8, 2.6, 0.12, 0, 1.3, -VD / 2 + 0.12, new THREE.MeshStandardMaterial({ color: 0x1b1030, roughness: 0.4, metalness: 0.4 }));
const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.6), new THREE.MeshBasicMaterial({ map: neon('ZUR BÜHNE', '#ff2aa0'), transparent: true, toneMapped: false })); sign.position.set(0, 3.0, -VD / 2 + 0.2); V.add(sign);
const exitS = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.4), new THREE.MeshBasicMaterial({ map: neon('MENÜ', '#3aff8a'), transparent: true, toneMapped: false })); exitS.position.set(-VW / 2 + 0.2, 2.9, 2); exitS.rotation.y = Math.PI / 2; V.add(exitS);
addBox(0.12, 2.4, 1.4, -VW / 2 + 0.12, 1.2, 2, new THREE.MeshStandardMaterial({ color: 0x0f2a1a, roughness: 0.5 }));
// Licht
V.add(new THREE.HemisphereLight(0xfff0e0, 0x302040, 0.7));
[[-4, -2], [4, -1], [0, 3.5]].forEach(([x, z], i) => { const L = new THREE.PointLight(i === 1 ? 0xffb0d8 : 0xffe2b8, 30, 16, 1.4); L.position.set(x, 3.6, z); V.add(L);
  const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.06, 28), new THREE.MeshBasicMaterial({ color: 0xfff4e0, toneMapped: false })); lamp.position.set(x, 3.95, z); V.add(lamp); });
const doorL = new THREE.SpotLight(0xff2aa0, 30, 8, 0.6, 0.6); doorL.position.set(0, 3.8, -4); doorL.target.position.set(0, 0, -VD / 2); V.add(doorL, doorL.target);

// Zitterraum: dunkler Raum, drei Plätze im Spot, Uhr läuft
const Z = new THREE.Group(); Z.position.x = ZX; s.add(Z);
const zFloor = new THREE.Mesh(new THREE.CircleGeometry(9, 64), new THREE.MeshPhysicalMaterial({ color: 0x0a0a14, roughness: 0.25, metalness: 0.5, clearcoat: 1 })); zFloor.rotation.x = -Math.PI / 2; zFloor.receiveShadow = true; Z.add(zFloor);
const zWall = new THREE.Mesh(new THREE.CylinderGeometry(9, 9, 6, 64, 1, true, Math.PI * 0.75, Math.PI * 1.5), new THREE.MeshStandardMaterial({ color: 0x14102a, roughness: 0.8, side: THREE.BackSide })); zWall.position.y = 3; Z.add(zWall);
const benchM = new THREE.MeshPhysicalMaterial({ color: 0x2a2a3a, metalness: 0.6, roughness: 0.3, clearcoat: 1 });
addBox(5.4, 0.45, 0.8, 0, 0.22, -0.6, benchM, Z);
const zLogo = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.4), new THREE.MeshBasicMaterial({ map: neon('ZITTERBANK', '#ffd23f'), transparent: true, toneMapped: false })); zLogo.position.set(0, 3.6, -3); Z.add(zLogo);
const zSpots = [-1.8, 0, 1.8].map(x => { const L = new THREE.SpotLight(0xffffff, 60, 12, 0.28, 0.5, 1.4); L.position.set(x, 6, 1.5); L.target.position.set(x, 0, -0.2); if (r.shadowMap.enabled && x === 0) L.castShadow = true; Z.add(L, L.target);
  const c = new THREE.Mesh(new THREE.ConeGeometry(Math.tan(0.28) * 6.4, 6.4, 32, 1, true), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.05, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); c.position.set(x, 3, 0.65); c.rotation.x = -0.3; Z.add(c); return { L, c }; });
Z.add(new THREE.HemisphereLight(0x4040a0, 0x050510, 0.25));

// Figuren in Villa und Zitterraum (aus dem Sänger-Modell, mit echten Bewegungen)
let player = null, pMix = null, pAct = {}, npcs = [], zitFig = [];
const moves = kmoves;
const walkSt = { on: false, spots: [], onUse: null, x: 0, z: 2.5, rot: Math.PI, target: null, keys: {}, near: null, labels: null };
const SPOTS = { stage: [0, -5.2, '🎤 Zur Bühne'], train: [-5.4, -3, '🏋️ Proberaum'], comm: [4.5, -0.6, '📱 Community-Ecke'], cands: [-2.6, 1.6, '👥 Kandidaten'], prof: [6.6, 4.1, '👤 Schminktisch'],
  coach: [-7.2, -0.8, '🎓 Vocal-Coach'], host: [2.4, -3.6, '🎙️ Rico'], menu: [-8.1, 2, '🏠 Menü'] };
function figure(seed, anim, x, z, ry, par) { const c = makeChar(typeof seed === 'string' ? specFor(seed, lookOfId(seed)) : specOf(seed)); c.f.position.set(x, 0, z); c.f.rotation.y = ry || 0; (par || V).add(c.f); c.play(anim, 0); c.m.setTime(Math.random() * 2); return c; }
function buildFigures() {
  if (!kkReady || player) return;
  const p = makeChar(playerSpec()); p.f.position.set(0, 0, 2.5); V.add(p.f); player = p.f; pMix = p.m; p.play('Idle', 0); pAct = p;
  npcs.push(figure('mira', 'Idle', -2.9, 1.1, 0.6), figure('jaxx', 'Cheer', -2.0, 1.9, -0.9), figure('lio', 'Interact', -3.4, 2.2, 1.2));
  npcs.push(figure('nova', 'Sit_Chair_Idle', 4.0, -1.85, 0), figure('tamo', 'Sit_Chair_Idle', 5.2, -1.85, 0));   // auf dem Sofa
  npcs.push(figure('elif', 'Spellcast_Raise', -5.4, -3.6, 0.2));   // Proberaum
  npcs.push(figure('sophie', 'Interact', -7.2, -0.3, 1.4));   // Coach
  npcs.push(figure('rico', 'Idle', 2.4, -4.2, 0));          // Rico
  zitFig = [-1.8, 0, 1.8].map((x, i) => figure(['clara', 'benno', 'ruben'][i], i === 1 ? 'Sit_Chair_Idle' : 'Sit_Chair_Idle', x, -0.45, 0, Z));
}
function walkLabels() {
  const box = document.getElementById('walkSpots'); if (!box) return null;
  box.innerHTML = walkSt.spots.map(k => `<button type="button" class="wSpot" data-w="${k}">${SPOTS[k][2]}</button>`).join('');
  box.onclick = e => { const b = e.target.closest('[data-w]'); if (!b) return; walkSt.target = b.dataset.w; };
  return [...box.querySelectorAll('[data-w]')];
}
function useSpot(k) { walkSt.target = null; if (walkSt.onUse) walkSt.onUse(k); }
addEventListener('keydown', e => { if (!walkSt.on) return; walkSt.keys[e.code] = true; if (/^(Enter|Space|KeyF|NumpadEnter)$/.test(e.code) && walkSt.near && !e.repeat) { e.preventDefault(); useSpot(walkSt.near); } });
addEventListener('keyup', e => { walkSt.keys[e.code] = false; });
function stepWalk(dt) {
  if (!walkSt.on || !player) return;
  let ix = 0, iz = 0; const K = walkSt.keys;
  if (K.ArrowLeft || K.KeyA) ix -= 1; if (K.ArrowRight || K.KeyD) ix += 1; if (K.ArrowUp || K.KeyW) iz -= 1; if (K.ArrowDown || K.KeyS) iz += 1;
  const gp = navigator.getGamepads ? [...navigator.getGamepads()].find(g => g && g.axes && g.axes.length >= 2) : null;
  if (gp && Math.hypot(gp.axes[0], gp.axes[1]) > 0.25) { ix += gp.axes[0]; iz += gp.axes[1]; }
  if (walkSt.joy) { ix += walkSt.joy.x; iz += walkSt.joy.y; }
  if (ix || iz) walkSt.target = null;
  if (walkSt.target) { const sp = SPOTS[walkSt.target], dx = sp[0] - walkSt.x, dz = sp[1] - walkSt.z, d = Math.hypot(dx, dz); if (d < 0.5) useSpot(walkSt.target); else { ix = dx / d; iz = dz / d; } }
  const mag = Math.min(1, Math.hypot(ix, iz)), spd = 3.4 * mag;
  if (mag > 0.05) { walkSt.x = Math.max(-VW / 2 + 0.6, Math.min(VW / 2 - 0.6, walkSt.x + ix / Math.hypot(ix, iz) * spd * dt)); walkSt.z = Math.max(-VD / 2 + 0.7, Math.min(VD / 2 - 0.5, walkSt.z + iz / Math.hypot(ix, iz) * spd * dt));
    const want = Math.atan2(ix, iz); let d = want - walkSt.rot; d = Math.atan2(Math.sin(d), Math.cos(d)); walkSt.rot += d * Math.min(1, dt * 10); }
  player.position.set(walkSt.x, 0, walkSt.z); player.rotation.y = walkSt.rot;
  const moving = mag > 0.05; pAct.play(moving ? (mag > 0.8 ? 'Running_A' : 'Walking_A') : 'Idle', 0.2);
  // nächster Punkt
  let near = null, nd = 1.6; for (const k of walkSt.spots) { const sp = SPOTS[k], d = Math.hypot(sp[0] - walkSt.x, sp[1] - walkSt.z); if (d < nd) { nd = d; near = k; } }
  walkSt.near = near;
  // Beschriftungen über den Orten
  if (walkSt.labels) walkSt.labels.forEach(b => { const sp = SPOTS[b.dataset.w]; tmpV.set(VX + sp[0], 2.3, sp[1]).project(cam); const vis = tmpV.z < 1;
    b.style.transform = `translate(-50%,-50%) translate(${(tmpV.x * 0.5 + 0.5) * innerWidth}px,${(-tmpV.y * 0.5 + 0.5) * innerHeight}px)`; b.style.opacity = vis ? 1 : 0; b.classList.toggle('near', b.dataset.w === near); });
  // Kamera folgt
  const tp = new THREE.Vector3(VX + walkSt.x * 0.8, 5.2, walkSt.z + 7.5); camP.lerp(tp, Math.min(1, dt * 3)); camT.lerp(new THREE.Vector3(VX + walkSt.x, 1.1, walkSt.z - 1), Math.min(1, dt * 4));
}
Object.assign(API, {
  walk(spots, onUse) { walkSt.on = true; walkSt.spots = spots.filter(k => SPOTS[k]); walkSt.onUse = onUse; walkSt.keys = {}; walkSt.target = null; setShot('backstage'); walkSt.labels = walkLabels(); buildFigures(); camP.set(VX + walkSt.x * 0.8, 5.2, walkSt.z + 7.5); camT.set(VX + walkSt.x, 1.1, walkSt.z - 1); document.body.classList.add('walking'); },
  walkEnd() { const hud = document.getElementById('walkHud'), jy = document.getElementById('walkJoy'); if (hud) hud.hidden = true; if (jy) jy.hidden = true; walkSt.on = false; walkSt.keys = {}; walkSt.target = null; document.body.classList.remove('walking'); const box = document.getElementById('walkSpots'); if (box) box.innerHTML = ''; walkSt.labels = null; },
  joy(x, y) { walkSt.joy = x == null ? null : { x, y }; },
  zitter(names) { setShot('zitter'); }
});

// ---------- Schleife ----------
const clock = new THREE.Clock(); let slowT = 0, quality = 2, tAcc = 0, lastE = 0.4, raf = 0;
function frame() {
  raf = requestAnimationFrame(frame);
  if (document.hidden) return;
  const rawDt = clock.getDelta(), dt = Math.min(0.05, rawDt); tAcc += dt;
  slowT = rawDt > 0.045 ? slowT + rawDt : Math.max(0, slowT - rawDt * 0.5);   // langsames Gerät: Qualität automatisch senken
  if (slowT > 2.5 && quality > 0) { quality--; slowT = 0; if (quality === 1) { comp = null; r.shadowMap.enabled = false; } else { r.setPixelRatio(0.7); s.fog.density = 0.03; } } const t = reduced ? 1 : tAcc;
  const e = st ? (st.energy != null ? st.energy : 0.5) : 0.45; lastE += (e - lastE) * 0.05;
  const beat = st && st.part && st.part.bpm ? 1 - ((st.now * st.part.bpm / 60) % 1) : 0.5 + 0.5 * Math.sin(t * 2);
  // Kamera
  blend = Math.min(1, blend + dt * 0.9); const k = reduced ? 1 : 1 - Math.pow(1 - blend, 3);
  const orb = shot.orbit * Math.sin(t * 0.15);
  const tp = new THREE.Vector3(...shot.p); tp.x += orb * 3; tp.y += Math.sin(t * 0.3) * 0.1 * shot.orbit;
  if (!walkSt.on) camP.lerp(tp, reduced ? 1 : 0.02 + k * 0.06); if (!walkSt.on) camT.lerp(new THREE.Vector3(...shot.t), reduced ? 1 : 0.04 + k * 0.06); camFov += (shot.fov - camFov) * 0.06;
  cam.position.copy(camP); cam.lookAt(camT); if (Math.abs(cam.fov - camFov) > 0.01) { cam.fov = camFov; cam.updateProjectionMatrix(); }
  dim += ((shot.dim || 1) - dim) * 0.05; s.fog.density += ((walkSt.on || shotName === 'backstage' ? 0.006 : shotName === 'zitter' ? 0.02 : 0.03) - s.fog.density) * 0.1; r.toneMappingExposure = 0.55 + 0.4 * dim;
  ledHue += ((shot.hue) - ledHue) * 0.03;
  // Licht
  beams.forEach((b, i) => {
    const sw = b.main ? 0 : Math.sin(t * 0.7 + b.ph) * (1.6 + lastE * 1.6);
    aim(b, b.main ? 0 : sw, b.main ? 0.2 : Math.cos(t * 0.5 + b.ph) * 1.2);
    b.L.intensity = b.base * dim * (b.main ? 1 : 0.6 + 0.6 * lastE + 0.3 * beat * lastE);
    b.cone.material.opacity = (0.025 + 0.04 * lastE) * dim * (b.main ? 1.2 : 1);
  });
  ring.material.color.setHSL(((ledHue % 360) + 360) % 360 / 360, 0.9, 0.45 + 0.2 * beat * lastE);
  if (Math.floor(t * 20) !== Math.floor((t - dt) * 20)) drawLed(t, lastE);
  if (singer) { singer.play(st && lastE > 0.62 && beat > 0.5 ? 'Cheer' : 'Idle', 0.4); singer.m.update(reduced ? 0 : dt); }
  judges.forEach(j => j.jm.update(dt));
  placeAud(t, st ? lastE : 0.25);
  if (pMix) pMix.update(dt); npcs.concat(zitFig).forEach(n => n.m.update(dt)); stepWalk(dt);
  if (shotName === 'zitter') zitFig.forEach((n, i) => { zSpots[i].L.intensity = 40 + 30 * Math.max(0, Math.sin(t * 3 + i * 2.1)); });
  dust.rotation.y = t * 0.02;
  // Konfetti
  for (let i = 0; i < CN; i++) { if (cp[i * 3 + 1] < -5) continue; cvel[i * 3 + 1] -= 4.5 * dt; cvel[i * 3] *= 0.99; cvel[i * 3 + 2] *= 0.99; cp[i * 3] += cvel[i * 3] * dt; cp[i * 3 + 1] += Math.max(-2.2, cvel[i * 3 + 1]) * dt; cp[i * 3 + 2] += cvel[i * 3 + 2] * dt; if (cp[i * 3 + 1] < 0) cp[i * 3 + 1] = -50; }
  cgeo.attributes.position.needsUpdate = true;
  for (let i = 0; i < 4; i++) flash[i] = Math.max(0, flash[i] - dt * 4);
  if (st) { if (st.combo && st.combo > 0 && st.combo % 25 === 0 && st._c3 !== st.combo) { st._c3 = st.combo; API.cheer(120); } }
  drawHighway();
  if (comp) comp.render(); else r.render(s, cam);
}
drawLed(0, 0.4); frame();
