// ZEITSPRUNG – das 3D-TV-Studio (Three.js r170): PBR-Licht, Bloom, Spiegelboden, Moving Heads mit Lichtkegeln,
// LED-Wand, Publikum, Konfetti, Kamerafahrten und KayKit-Figuren (CC0). Je Ausgabe eigene Farben und Bühnenbild.
import * as T from './lib/three-studio.js';
import { FIGURES } from './editions.js';

const DPR = Math.min(window.devicePixelRatio || 1, 2);
const MOBILE = matchMedia('(pointer: coarse)').matches || Math.min(screen.width, screen.height) < 700;
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const col = c => new T.Color(c);

function canvasTex(w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace; tex.anisotropy = 4;
  return { c, g: c.getContext('2d'), tex };
}
function roundRect(g, x, y, w, h, r) { g.beginPath(); g.roundRect ? g.roundRect(x, y, w, h, r) : g.rect(x, y, w, h); }

// Additiver Lichtkegel für Moving Heads und Verfolger (volumetrisch wirkend, ohne Nachbearbeitung)
function beamMaterial(color) {
  return new T.ShaderMaterial({
    transparent: true, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide,
    uniforms: { uColor: { value: col(color) }, uOpacity: { value: .32 } },
    vertexShader: 'varying float vY; varying vec3 vN; varying vec3 vV; void main(){ vY=uv.y; vec4 mv=modelViewMatrix*vec4(position,1.); vN=normalize(normalMatrix*normal); vV=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }',
    fragmentShader: 'uniform vec3 uColor; uniform float uOpacity; varying float vY; varying vec3 vN; varying vec3 vV; void main(){ float rim=pow(abs(dot(vN,vV)),1.6); float a=uOpacity*pow(vY,1.7)*rim; gl_FragColor=vec4(uColor*a,a); }'
  });
}

export async function createStudio(canvas, { quality = 'auto', onReady = () => {}, onProgress = () => {} } = {}) {
  const renderer = new T.WebGLRenderer({ canvas, antialias: !MOBILE, powerPreference: 'high-performance', alpha: false });
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = .92;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
  const scene = new T.Scene();
  scene.background = col('#03040a'); scene.fog = new T.FogExp2('#05060f', .018);
  const camera = new T.PerspectiveCamera(42, 1, .1, 200);
  camera.position.set(0, 4.5, 17);
  const pmrem = new T.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new T.RoomEnvironment(), .04).texture;
  scene.environmentIntensity = .35;

  // ---------- Qualitätsstufen ----------
  let tier = quality === 'auto' ? (MOBILE ? 'medium' : 'high') : quality;
  const composer = new T.EffectComposer(renderer);
  composer.addPass(new T.RenderPass(scene, camera));
  const bloom = new T.UnrealBloomPass(new T.Vector2(512, 512), .55, .5, .86);
  composer.addPass(bloom);
  composer.addPass(new T.OutputPass());

  // ---------- Boden: Spiegel + glänzender LED-Boden ----------
  const world = new T.Group(); scene.add(world);
  let mirror = null;
  function buildMirror() {
    if (mirror) { world.remove(mirror); mirror.dispose?.(); mirror = null; }
    if (tier !== 'high') return;
    mirror = new T.Reflector(new T.CircleGeometry(40, 64), { textureWidth: Math.round(innerWidth * DPR * .5), textureHeight: Math.round(innerHeight * DPR * .5), color: 0x8a8fa8 });
    mirror.rotation.x = -Math.PI / 2; mirror.position.y = -.002; world.add(mirror);
  }
  const floorTex = canvasTex(1024, 1024);
  {
    const { g, c } = floorTex; g.fillStyle = '#05060c'; g.fillRect(0, 0, c.width, c.height);
    g.strokeStyle = 'rgba(120,140,255,.10)'; g.lineWidth = 2;
    for (let i = 0; i <= 32; i++) { g.beginPath(); g.moveTo(i * 32, 0); g.lineTo(i * 32, 1024); g.stroke(); g.beginPath(); g.moveTo(0, i * 32); g.lineTo(1024, i * 32); g.stroke(); }
    floorTex.tex.wrapS = floorTex.tex.wrapT = T.RepeatWrapping; floorTex.tex.repeat.set(5, 5);
  }
  const floorMat = new T.MeshStandardMaterial({ color: '#0b0d18', roughness: .32, metalness: .55, map: floorTex.tex, transparent: true, opacity: .86 });
  const floor = new T.Mesh(new T.CircleGeometry(40, 64), floorMat); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; world.add(floor);

  // ---------- Bühne ----------
  const accentMats = [], accent2Mats = [];
  const emissive = (c, i = 2.2) => { const m = new T.MeshStandardMaterial({ color: '#000', emissive: col(c), emissiveIntensity: i, roughness: .4 }); return m; };
  const stage = new T.Group(); world.add(stage);
  const stageTop = new T.Mesh(new T.CylinderGeometry(5.2, 5.5, .42, 96), new T.MeshPhysicalMaterial({ color: '#10121f', roughness: .18, metalness: .4, clearcoat: 1, clearcoatRoughness: .08 }));
  stageTop.position.y = .21; stageTop.receiveShadow = true; stageTop.castShadow = true; stage.add(stageTop);
  const ringMat = emissive('#5ee7ff', 3); accentMats.push(ringMat);
  const ring = new T.Mesh(new T.TorusGeometry(5.38, .045, 8, 160), ringMat); ring.rotation.x = Math.PI / 2; ring.position.y = .3; stage.add(ring);
  const ring2Mat = emissive('#ffcf6e', 2.4); accent2Mats.push(ring2Mat);
  const ring2 = new T.Mesh(new T.TorusGeometry(3.2, .03, 8, 140), ring2Mat); ring2.rotation.x = Math.PI / 2; ring2.position.y = .43; stage.add(ring2);
  // Zeitstrahl-Leuchtband über den Bühnenboden
  const lineTex = canvasTex(1024, 64);
  const timeBand = new T.Mesh(new T.PlaneGeometry(10, .5), new T.MeshBasicMaterial({ map: lineTex.tex, transparent: true, blending: T.AdditiveBlending, depthWrite: false }));
  timeBand.rotation.x = -Math.PI / 2; timeBand.position.set(0, .435, 1.2); stage.add(timeBand);
  // Rundum-Stufen
  const step = new T.Mesh(new T.CylinderGeometry(6.4, 6.7, .16, 96), new T.MeshStandardMaterial({ color: '#0d0f1b', roughness: .5, metalness: .3 })); step.position.y = .08; step.receiveShadow = true; stage.add(step);
  const stepRingMat = emissive('#5ee7ff', 1.4); accentMats.push(stepRingMat);
  const stepRing = new T.Mesh(new T.TorusGeometry(6.55, .025, 6, 160), stepRingMat); stepRing.rotation.x = Math.PI / 2; stepRing.position.y = .16; stage.add(stepRing);

  // Moderatorenpult
  const desk = new T.Group(); desk.position.set(.4, .42, -1.75); stage.add(desk);
  const deskBody = new T.Mesh(new T.RoundedBoxGeometry(2.6, .95, .8, 4, .12), new T.MeshPhysicalMaterial({ color: '#171a2e', roughness: .25, metalness: .6, clearcoat: .8 }));
  deskBody.position.y = .475; deskBody.castShadow = true; deskBody.receiveShadow = true; desk.add(deskBody);
  const deskFront = canvasTex(512, 200);
  const deskScreen = new T.Mesh(new T.PlaneGeometry(2.3, .85), new T.MeshBasicMaterial({ map: deskFront.tex, toneMapped: false })); deskScreen.position.set(0, .48, .406); deskScreen.scale.setScalar(.85); desk.add(deskScreen);
  const deskTopMat = emissive('#ffcf6e', 1.1); accent2Mats.push(deskTopMat);
  const deskTop = new T.Mesh(new T.BoxGeometry(2.7, .05, 1), deskTopMat); deskTop.position.y = .96; desk.add(deskTop);

  // ---------- LED-Wand (gebogen) ----------
  const ledTex = canvasTex(2048, 640);
  const ledGeo = new T.CylinderGeometry(15, 15, 7.2, 96, 1, true, Math.PI - .78, 1.56);
  const ledWall = new T.Mesh(ledGeo, new T.MeshBasicMaterial({ map: ledTex.tex, side: T.BackSide, toneMapped: false }));
  ledWall.position.set(0, 4.1, 6.5); ledWall.scale.x = -1; world.add(ledWall);
  const ledFrameMat = emissive('#5ee7ff', 1.6); accentMats.push(ledFrameMat);
  for (const y of [.48, 7.72]) { const f = new T.Mesh(new T.TorusGeometry(15, .05, 6, 120, 1.56), ledFrameMat); f.rotation.x = Math.PI / 2; f.rotation.z = Math.PI / 2 - .78 + Math.PI; f.position.set(0, y, 6.5); world.add(f); }

  // Seitliche LED-Säulen
  const pillarTex = canvasTex(128, 1024);
  const pillarMat = new T.MeshBasicMaterial({ map: pillarTex.tex, toneMapped: false });
  const pillars = [];
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
    const p = new T.Mesh(new T.BoxGeometry(.7, 6.5, .2), [null, null, null, null, pillarMat, pillarMat].map(m => m || new T.MeshStandardMaterial({ color: '#0b0c16', metalness: .7, roughness: .3 })));
    const a = (.95 + i * .26) * s; p.position.set(Math.sin(a) * 12.5, 3.25, -Math.cos(a) * 12.5 + 5.5); p.lookAt(0, 3.25, 4); world.add(p); pillars.push(p);
  }

  // ---------- Traverse + Moving Heads ----------
  const truss = new T.Group(); truss.position.y = 9.4; world.add(truss);
  const trussMat = new T.MeshStandardMaterial({ color: '#2a2d3a', metalness: .9, roughness: .35 });
  const trussRing = new T.Mesh(new T.TorusGeometry(8.5, .12, 6, 64), trussMat); trussRing.rotation.x = Math.PI / 2; truss.add(trussRing);
  const trussRing2 = new T.Mesh(new T.TorusGeometry(8.5, .12, 6, 64), trussMat); trussRing2.rotation.x = Math.PI / 2; trussRing2.position.y = .5; truss.add(trussRing2);
  const heads = [];
  const beamGeo = new T.CylinderGeometry(.08, 1.9, 1, 32, 1, true); beamGeo.translate(0, -.5, 0);
  const HEADS = 10;
  for (let i = 0; i < HEADS; i++) {
    const a = i / HEADS * Math.PI * 2;
    const g = new T.Group(); g.position.set(Math.cos(a) * 8.5, -.25, Math.sin(a) * 8.5); truss.add(g);
    const body = new T.Mesh(new T.CylinderGeometry(.22, .3, .45, 12), new T.MeshStandardMaterial({ color: '#15161e', metalness: .8, roughness: .4 })); g.add(body);
    const lens = new T.Mesh(new T.CircleGeometry(.2, 16), emissive('#ffffff', 6)); lens.rotation.x = Math.PI / 2; lens.position.y = -.24; g.add(lens);
    const mat = beamMaterial('#5ee7ff');
    const beam = new T.Mesh(beamGeo, mat); beam.scale.set(1, 11, 1); g.add(beam);
    heads.push({ g, beam, mat, lens, phase: i * .7, side: i % 2 });
  }
  // Echte Spotlichter (wenige, mit Schatten) – wandern mit Kamera-Einstellung und Spieler am Zug
  const key = new T.SpotLight('#fff3e0', 420, 30, .42, .55, 1.6); key.position.set(3, 11, 8); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -.0004; scene.add(key); scene.add(key.target);
  const follow = new T.SpotLight('#fff6ea', 300, 26, .2, .5, 1.5); follow.position.set(0, 10, 7); follow.castShadow = true; follow.shadow.mapSize.set(1024, 1024); scene.add(follow); scene.add(follow.target);
  const fillA = new T.PointLight('#5ee7ff', 60, 22, 1.8); fillA.position.set(-8, 4, 2); scene.add(fillA);
  const fillB = new T.PointLight('#ff5fa8', 60, 22, 1.8); fillB.position.set(8, 4, 2); scene.add(fillB);
  const rim = new T.DirectionalLight('#9db4ff', .9); rim.position.set(0, 6, -10); scene.add(rim);
  scene.add(new T.HemisphereLight('#3a4a8a', '#0a0612', .55));

  // ---------- Publikum (instanziert) ----------
  const crowd = new T.Group(); world.add(crowd);
  const personGeo = (() => { const b = new T.CylinderGeometry(.2, .26, .7, 8); b.translate(0, .35, 0); const h = new T.SphereGeometry(.17, 10, 8); h.translate(0, .86, 0); return T.BufferGeometryUtils ? T.BufferGeometryUtils.mergeGeometries([b, h]) : b; })();
  const seatsMat = new T.MeshStandardMaterial({ color: '#1a1d2c', roughness: .7, metalness: .1 });
  const people = [];
  const PEOPLE = MOBILE ? 140 : 300;
  const crowdMesh = new T.InstancedMesh(personGeo, new T.MeshStandardMaterial({ color: '#2a2f48', roughness: .8 }), PEOPLE);
  const glowMesh = new T.InstancedMesh(new T.SphereGeometry(.05, 6, 4), new T.MeshBasicMaterial({ color: '#ffffff', toneMapped: false }), PEOPLE);
  crowd.add(crowdMesh, glowMesh);
  {
    const m = new T.Matrix4(), q = new T.Quaternion(), s = new T.Vector3(1, 1, 1), p = new T.Vector3(); let n = 0;
    for (const side of [-1, 1]) for (let row = 0; row < 5; row++) {
      const tier = new T.Mesh(new T.BoxGeometry(5.5, .45, 1.2), seatsMat);
      const r = 13 + row * 1.25, ang = side * 1.25;
      tier.position.set(Math.sin(ang) * r, .22 + row * .45, -Math.cos(ang) * r + 5.5 - 5); tier.lookAt(0, tier.position.y, -2); world.add(tier);
      for (let k = 0; k < (MOBILE ? 14 : 30) && n < PEOPLE; k++) {
        const t = (k / ((MOBILE ? 14 : 30) - 1) - .5) * 4.6;
        p.set(t, .45, 0).applyQuaternion(tier.quaternion).add(tier.position); p.y = .45 + row * .45;
        q.setFromRotationMatrix(new T.Matrix4().lookAt(p, new T.Vector3(0, p.y, -2), new T.Vector3(0, 1, 0)));
        m.compose(p, q, s); crowdMesh.setMatrixAt(n, m);
        people.push({ p: p.clone(), q: q.clone(), ph: Math.random() * 6.28, glow: Math.random() < .25 });
        n++;
      }
    }
    crowdMesh.count = glowMesh.count = n;
  }

  // ---------- Partikel: Staub in den Lichtkegeln ----------
  const dustGeo = new T.BufferGeometry(); const DUST = MOBILE ? 400 : 1200; const dp = new Float32Array(DUST * 3);
  for (let i = 0; i < DUST; i++) { dp[i * 3] = (Math.random() - .5) * 26; dp[i * 3 + 1] = Math.random() * 9; dp[i * 3 + 2] = (Math.random() - .5) * 20; }
  dustGeo.setAttribute('position', new T.BufferAttribute(dp, 3));
  const dust = new T.Points(dustGeo, new T.PointsMaterial({ size: .035, color: '#c8d4ff', transparent: true, opacity: .45, depthWrite: false, blending: T.AdditiveBlending })); world.add(dust);

  // ---------- Konfetti ----------
  const CONF = MOBILE ? 260 : 700;
  const confetti = new T.InstancedMesh(new T.PlaneGeometry(.09, .14), new T.MeshStandardMaterial({ side: T.DoubleSide, roughness: .4, metalness: .3, emissive: '#222' }), CONF);
  confetti.frustumCulled = false; confetti.count = 0; world.add(confetti);
  const confData = Array.from({ length: CONF }, () => ({ p: new T.Vector3(), v: new T.Vector3(), r: new T.Euler(), w: new T.Vector3(), life: 0 }));
  let confActive = 0;
  function burst(colors, at = new T.Vector3(0, 8, 2), spread = 7) {
    const c = new T.Color();
    confData.forEach((d, i) => {
      d.p.set(at.x + (Math.random() - .5) * spread, at.y + Math.random() * 2, at.z + (Math.random() - .5) * spread * .6);
      d.v.set((Math.random() - .5) * 2.5, Math.random() * 1.5, (Math.random() - .5) * 2.5);
      d.r.set(Math.random() * 6, Math.random() * 6, Math.random() * 6); d.w.set(Math.random() * 6 - 3, Math.random() * 6 - 3, Math.random() * 6 - 3);
      d.life = 4 + Math.random() * 3;
      confetti.setColorAt(i, c.set(colors[i % colors.length]));
    });
    confetti.instanceColor.needsUpdate = true; confetti.count = CONF; confActive = 7;
  }

  // ---------- Bühnenbild je Ausgabe ----------
  const props = new T.Group(); props.position.set(0, .45, 0); stage.add(props);
  const propAnims = [];
  function chrome(c = '#d9dcff') { return new T.MeshPhysicalMaterial({ color: c, metalness: 1, roughness: .12, clearcoat: 1 }); }
  function buildProp(kind, colors) {
    props.clear(); propAnims.length = 0;
    const [a, b, c] = colors.map(col);
    const holo = (color, op = .5) => new T.MeshBasicMaterial({ color, transparent: true, opacity: op, blending: T.AdditiveBlending, depthWrite: false, toneMapped: false });
    for (const side of [-1, 1]) {
    const first = side < 0;
    const g = new T.Group(); g.position.set(side * 4.7, 3.1, -3.4); g.scale.setScalar(.72); props.add(g);
    if (kind === 'globe') {
      const s = new T.Mesh(new T.IcosahedronGeometry(1.3, 3), holo(a, .55)); s.material.wireframe = true; g.add(s);
      const core = new T.Mesh(new T.SphereGeometry(1.05, 32, 24), new T.MeshStandardMaterial({ color: '#0a2b55', emissive: a, emissiveIntensity: .35, roughness: .3, metalness: .4 })); g.add(core);
      for (let i = 0; i < 3; i++) { const r = new T.Mesh(new T.TorusGeometry(1.75 + i * .25, .015, 6, 120), holo(i % 2 ? b : a, .9)); r.rotation.set(Math.PI / 2 + i * .35, i * .6, 0); g.add(r); }
      propAnims.push(t => { g.rotation.y = t * .25; s.rotation.x = t * .1; });
    } else if (kind === 'reel') {
      const reel = new T.Group(); g.add(reel);
      reel.add(new T.Mesh(new T.TorusGeometry(1.35, .14, 16, 64), chrome()));
      reel.add(new T.Mesh(new T.CylinderGeometry(.3, .3, .2, 24).rotateX(Math.PI / 2), chrome('#888')));
      for (let i = 0; i < 6; i++) { const h = new T.Mesh(new T.CircleGeometry(.32, 24), holo(a, .75)); const an = i / 6 * Math.PI * 2; h.position.set(Math.cos(an) * .8, Math.sin(an) * .8, .05); reel.add(h); }
      const strip = new T.Mesh(new T.TorusGeometry(2.1, .06, 6, 80, Math.PI * 1.2), holo(b, .8)); strip.rotation.z = -.3; g.add(strip);
      propAnims.push(t => { reel.rotation.z = -t * .8; strip.rotation.y = Math.sin(t * .5) * .3; });
    } else if (kind === 'vinyl') {
      const disc = new T.Mesh(new T.CylinderGeometry(1.6, 1.6, .06, 96), new T.MeshPhysicalMaterial({ color: '#08080c', roughness: .25, metalness: .3, clearcoat: 1, clearcoatRoughness: .05 }));
      disc.rotation.x = Math.PI / 2 - .35; g.add(disc);
      const label = new T.Mesh(new T.CylinderGeometry(.5, .5, .07, 48), new T.MeshStandardMaterial({ color: a, emissive: a, emissiveIntensity: .6 })); label.rotation.copy(disc.rotation); g.add(label);
      const bars = new T.Group(); bars.position.set(0, 0, -4.6); if (first) props.add(bars); const eq = [];
      for (let i = 0; first && i < 24; i++) { const m = new T.Mesh(new T.BoxGeometry(.2, 1, .2), emissive(i % 2 ? b : a, 2.4)); m.position.set((i - 11.5) * .34, .5, 0); bars.add(m); eq.push(m); }
      propAnims.push(t => { disc.rotation.y = t * 1.6; label.rotation.y = t * 1.6; eq.forEach((m, i) => { const h = .25 + Math.abs(Math.sin(t * 3 + i * .7) * Math.sin(t * 1.3 + i)) * 1.2; m.scale.y = h; m.position.y = h / 2; }); });
    } else if (kind === 'star') {
      const shape = new T.Shape(); for (let i = 0; i < 10; i++) { const r = i % 2 ? .62 : 1.5, an = i / 10 * Math.PI * 2 + Math.PI / 2; const x = Math.cos(an) * r, y = Math.sin(an) * r; i ? shape.lineTo(x, y) : shape.moveTo(x, y); } shape.closePath();
      const star = new T.Mesh(new T.ExtrudeGeometry(shape, { depth: .25, bevelEnabled: true, bevelSize: .05, bevelThickness: .05, bevelSegments: 2 }), new T.MeshPhysicalMaterial({ color: b, metalness: 1, roughness: .18, emissive: b, emissiveIntensity: .25 }));
      star.geometry.center(); g.add(star);
      const bulbs = new T.Group(); g.add(bulbs);
      for (let i = 0; i < 20; i++) { const an = i / 20 * Math.PI * 2; const m = new T.Mesh(new T.SphereGeometry(.06, 8, 6), emissive(i % 2 ? a : '#ffffff', 4)); m.position.set(Math.cos(an) * 2, Math.sin(an) * 2, 0); bulbs.add(m); }
      propAnims.push(t => { star.rotation.y = Math.sin(t * .6) * .6; bulbs.rotation.z = t * .3; bulbs.children.forEach((m, i) => m.material.emissiveIntensity = 1.5 + 3 * ((Math.sin(t * 6 + i) + 1) / 2)); });
    } else if (kind === 'heart') {
      const s = new T.Shape(); s.moveTo(0, -1.2); s.bezierCurveTo(-1.9, .1, -1.1, 1.5, 0, .75); s.bezierCurveTo(1.1, 1.5, 1.9, .1, 0, -1.2);
      const heart = new T.Mesh(new T.ExtrudeGeometry(s, { depth: .3, bevelEnabled: true, bevelSize: .06, bevelThickness: .06, bevelSegments: 3 }), new T.MeshPhysicalMaterial({ color: a, metalness: .3, roughness: .1, transmission: .5, thickness: .6, emissive: a, emissiveIntensity: .5 }));
      heart.geometry.center(); g.add(heart);
      const flags = new T.Group(); g.add(flags); const fc = ['#ff4d6d', '#ffd166', '#4d96ff', '#06d6a0', '#ffffff', '#ef476f', '#118ab2', '#f78c6b'];
      for (let i = 0; i < 16; i++) { const an = i / 16 * Math.PI * 2; const f = new T.Mesh(new T.PlaneGeometry(.42, .28), new T.MeshStandardMaterial({ color: fc[i % fc.length], side: T.DoubleSide, emissive: fc[i % fc.length], emissiveIntensity: .4 })); f.position.set(Math.cos(an) * 2.3, Math.sin(an) * .25, Math.sin(an) * 2.3); f.lookAt(0, 0, 0); flags.add(f); }
      propAnims.push(t => { const k = 1 + Math.sin(t * 2.4) * .04; heart.scale.setScalar(k); heart.rotation.y = Math.sin(t * .7) * .4; flags.rotation.y = t * .35; });
    } else if (kind === 'clouds') {
      const cm = new T.MeshStandardMaterial({ color: '#ffffff', roughness: .9, emissive: '#6a7cff', emissiveIntensity: .12 });
      const clouds = new T.Group(); g.add(clouds);
      for (let k = 0; k < 4; k++) { const cl = new T.Group(); for (let i = 0; i < 5; i++) { const m = new T.Mesh(new T.SphereGeometry(.4 + Math.random() * .25, 16, 12), cm); m.position.set(i * .45 - .9, Math.sin(i) * .15, Math.random() * .2); cl.add(m); } cl.position.set((k - 1.5) * 2.4, (k % 2) * .7, -k * .3); clouds.add(cl); }
      const rainbow = new T.Group(); g.add(rainbow); ['#ff5a5a', '#ffb347', '#fff275', '#7cf29c', '#5ec8ff', '#b388ff'].forEach((cc, i) => { const r = new T.Mesh(new T.TorusGeometry(2.6 - i * .14, .07, 8, 80, Math.PI), emissive(cc, 1.8)); rainbow.add(r); }); rainbow.position.y = -.8;
      const balloons = [];
      for (let i = 0; first && i < 9; i++) { const bm = new T.Mesh(new T.SphereGeometry(.28, 18, 14), new T.MeshPhysicalMaterial({ color: [a, b, c][i % 3], roughness: .15, clearcoat: 1 })); bm.scale.y = 1.2; bm.position.set((Math.random() - .5) * 9, -2 + Math.random() * 3, 1 + Math.random() * 3); props.add(bm); balloons.push({ m: bm, y: bm.position.y, ph: Math.random() * 6 }); }
      propAnims.push(t => { clouds.children.forEach((cl, i) => cl.position.x = (i - 1.5) * 2.4 + Math.sin(t * .4 + i) * .3); balloons.forEach(bb => { bb.m.position.y = bb.y + 3.2 + Math.sin(t + bb.ph) * .35; }); });
    } else {
      // Gesamtmodus: Zeitsprung-Ring mit allen Ausgabenfarben
      const rings = new T.Group(); g.add(rings); const cs = ['#5ee7ff', '#c58bff', '#ff4c93', '#ff5fae', '#68e8ff', '#ff91bf'];
      cs.forEach((cc, i) => { const r = new T.Mesh(new T.TorusGeometry(1.2 + i * .16, .035, 8, 120), emissive(cc, 2.6)); r.rotation.set(i * .5, i * .8, 0); rings.add(r); });
      const core = new T.Mesh(new T.IcosahedronGeometry(.55, 1), new T.MeshPhysicalMaterial({ color: '#ffd36e', metalness: 1, roughness: .15, emissive: '#ff9f2e', emissiveIntensity: .4, flatShading: true })); g.add(core);
      propAnims.push(t => { rings.children.forEach((r, i) => { r.rotation.x += .004 * (i + 1); r.rotation.y += .003 * (6 - i); }); core.rotation.y = t; core.rotation.x = t * .6; });
    }
    }
  }

  // ---------- 3D-Logo über der LED-Wand ----------
  const logo = new T.Group(); logo.position.set(0, 8.6, -7.6); world.add(logo);
  try {
    const font = await new Promise((ok, no) => new T.FontLoader().load('./fonts/helvetiker_bold.typeface.json', ok, undefined, no));
    const geo = new T.TextGeometry('ZEITSPRUNG', { font, size: .9, depth: .28, curveSegments: 6, bevelEnabled: true, bevelThickness: .04, bevelSize: .03, bevelSegments: 3 });
    geo.center();
    const txt = new T.Mesh(geo, [chrome('#fff4d8'), new T.MeshStandardMaterial({ color: '#ffb84a', emissive: '#ff9a2e', emissiveIntensity: .9, metalness: .6, roughness: .3 })]);
    txt.castShadow = true; logo.add(txt);
    const under = new T.Mesh(new T.BoxGeometry(9.4, .06, .06), emissive('#ffcf6e', 3)); under.position.y = -.72; logo.add(under); accent2Mats.push(under.material);
  } catch (_) {}
  onProgress(40);

  // ---------- Figuren (KayKit) ----------
  const loader = new T.GLTFLoader(); loader.setMeshoptDecoder(T.MeshoptDecoder);
  const loadGLB = url => new Promise((ok, no) => loader.load(url, ok, undefined, no));
  let clips = [];
  const templates = new Map();
  async function template(id) {
    if (!templates.has(id)) templates.set(id, loadGLB(`./figuren/${id}.glb`).then(g => {
      g.scene.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; if (/sword|shield|axe|knife|crossbow|throwable|wand|staff|spellbook|mug/i.test(o.name)) o.visible = false; } });
      return g.scene;
    }).catch(() => null));
    return templates.get(id);
  }
  const animReady = loadGLB('./figuren/anim.glb').then(g => { clips = g.animations; }).catch(() => {});
  function makeProp(kind, color) {
    const g = new T.Group(); const c = col(color || '#ffcf6e');
    const m = (geo, mat, x = 0, y = 0, z = 0) => { const o = new T.Mesh(geo, mat); o.position.set(x, y, z); o.castShadow = true; g.add(o); return o; };
    const metal = new T.MeshStandardMaterial({ color: '#c9ccd8', metalness: .9, roughness: .25 });
    if (kind === 'mic') { m(new T.CylinderGeometry(.035, .028, .32, 12), new T.MeshStandardMaterial({ color: '#15151a', metalness: .6, roughness: .3 }), 0, .12); m(new T.SphereGeometry(.075, 16, 12), metal, 0, .32); }
    else if (kind === 'book') { m(new T.BoxGeometry(.3, .05, .22), new T.MeshStandardMaterial({ color: c, roughness: .6 }), 0, .08); m(new T.BoxGeometry(.28, .052, .2), new T.MeshStandardMaterial({ color: '#f5ecd5' }), .01, .08); }
    else if (kind === 'clapper') { m(new T.BoxGeometry(.32, .22, .03), new T.MeshStandardMaterial({ color: '#101014' }), 0, .14); const t = m(new T.BoxGeometry(.33, .05, .035), new T.MeshStandardMaterial({ color: '#f2f2f2' }), 0, .27); t.rotation.z = .25; }
    else if (kind === 'flag') { m(new T.CylinderGeometry(.015, .015, .8, 6), metal, 0, .3); m(new T.PlaneGeometry(.42, .28), new T.MeshStandardMaterial({ color: c, side: T.DoubleSide, emissive: c, emissiveIntensity: .3 }), .22, .55); }
    else if (kind === 'balloon') { m(new T.CylinderGeometry(.004, .004, .9, 4), new T.MeshBasicMaterial({ color: '#fff' }), 0, .45); const bb = m(new T.SphereGeometry(.2, 16, 12), new T.MeshPhysicalMaterial({ color: c, roughness: .15, clearcoat: 1 }), 0, 1.0); bb.scale.y = 1.2; }
    else if (kind === 'star') { m(new T.OctahedronGeometry(.14), new T.MeshStandardMaterial({ color: '#ffd36e', emissive: '#ffb02e', emissiveIntensity: 1.2, metalness: .8, roughness: .2 }), 0, .2); }
    else if (kind === 'popcorn') { m(new T.CylinderGeometry(.11, .08, .22, 12), new T.MeshStandardMaterial({ color: '#e63946' }), 0, .1); for (let i = 0; i < 7; i++) m(new T.SphereGeometry(.045, 8, 6), new T.MeshStandardMaterial({ color: '#fff4c2' }), (Math.random() - .5) * .14, .23 + Math.random() * .05, (Math.random() - .5) * .14); }
    else if (kind === 'trophy') { m(new T.CylinderGeometry(.12, .05, .18, 16), new T.MeshStandardMaterial({ color: '#ffcf4a', metalness: 1, roughness: .2 }), 0, .2); m(new T.CylinderGeometry(.06, .08, .06, 12), new T.MeshStandardMaterial({ color: '#ffcf4a', metalness: 1, roughness: .2 }), 0, .06); }
    return g;
  }
  function headphones(color) {
    const g = new T.Group(); const mat = new T.MeshStandardMaterial({ color: '#16161c', metalness: .5, roughness: .35 }); const accent = new T.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: .8 });
    const band = new T.Mesh(new T.TorusGeometry(.42, .04, 8, 24, Math.PI), mat); g.add(band);
    for (const s of [-1, 1]) { const cup = new T.Mesh(new T.CylinderGeometry(.14, .14, .1, 18), accent); cup.rotation.z = Math.PI / 2; cup.position.set(.42 * s, 0, 0); g.add(cup); }
    return g;
  }
  async function makeFigure(id, color) {
    const tpl = await template(id); await animReady;
    if (!tpl) return null;
    const root = T.cloneSkinned(tpl);
    const box = new T.Box3().setFromObject(root); const h = box.max.y - box.min.y || 2;
    const holder = new T.Group(); root.scale.setScalar(1.55 / h); holder.add(root);
    const mixer = new T.AnimationMixer(root);
    const actions = {}; for (const c of clips) actions[c.name] = mixer.clipAction(c);
    let current = null;
    function play(name, { once = false, fade = .3, then = 'Idle' } = {}) {
      const a = actions[name] || actions.Idle; if (!a) return;
      if (current === a && !once) return;
      a.reset(); a.setLoop(once ? T.LoopOnce : T.LoopRepeat, Infinity); a.clampWhenFinished = once;
      if (current) a.crossFadeFrom(current, fade, false); a.play(); current = a;
      if (once) { const len = a.getClip().duration * 1000; clearTimeout(a._t); a._t = setTimeout(() => { if (current === a) play(then); }, Math.max(300, len - fade * 1000)); }
    }
    const fig = FIGURES.find(f => f.id === id);
    let hand = null, head = null; root.traverse(o => { if (o.isBone && /handslot\.r/i.test(o.name)) hand = o; if (o.isBone && /^head$/i.test(o.name)) head = o; });
    if (fig?.prop === 'headphones' && head) { const hp = headphones(color); hp.position.set(0, .55, 0); hp.scale.setScalar(1.9); head.add(hp); }
    else if (fig && hand) { const p = makeProp(fig.prop, color); p.scale.setScalar(1 / root.scale.x * 1.55 / 1.55); hand.add(p); }
    play('Idle');
    return { root: holder, mixer, play, id };
  }

  // ---------- Spielerpulte ----------
  const podiums = [];
  const PODIUM_POS = [[-6.4, 1.4, .55], [-3.6, 3.1, .25], [3.6, 3.1, -.25], [6.4, 1.4, -.55]];
  function podium(i) {
    const g = new T.Group(); const [x, z, r] = PODIUM_POS[i]; g.position.set(x, 0, z); g.rotation.y = r; world.add(g);
    const base = new T.Mesh(new T.RoundedBoxGeometry(1.5, .85, .8, 4, .12), new T.MeshPhysicalMaterial({ color: '#141626', roughness: .25, metalness: .6, clearcoat: .7 }));
    base.position.set(0, .425, .75); base.castShadow = true; base.receiveShadow = true; g.add(base);
    const scr = canvasTex(512, 384);
    const screenMesh = new T.Mesh(new T.PlaneGeometry(1.3, .98), new T.MeshBasicMaterial({ map: scr.tex, toneMapped: false })); screenMesh.position.set(0, .44, 1.156); screenMesh.scale.setScalar(.74); g.add(screenMesh);
    const topMat = emissive('#ffffff', 1.1); const top = new T.Mesh(new T.BoxGeometry(1.56, .04, .96), topMat); top.position.set(0, .86, .75); g.add(top);
    const disc = new T.Mesh(new T.CylinderGeometry(.75, .8, .34, 48), new T.MeshStandardMaterial({ color: '#10121e', metalness: .5, roughness: .3 })); disc.position.y = .17; disc.receiveShadow = true; g.add(disc);
    const discRingMat = emissive('#ffffff', 2); const discRing = new T.Mesh(new T.TorusGeometry(.78, .02, 6, 64), discRingMat); discRing.rotation.x = Math.PI / 2; discRing.position.y = .34; g.add(discRing);
    const p = { g, scr, topMat, discRingMat, fig: null, figId: '', name: '', score: '', color: '#fff', active: false, visible: false };
    g.visible = false; podiums.push(p); return p;
  }
  for (let i = 0; i < 4; i++) podium(i);
  function drawPodium(p) {
    const { g, c } = p.scr; const W = c.width, H = c.height;
    const grad = g.createLinearGradient(0, 0, 0, H); grad.addColorStop(0, '#0d0f1f'); grad.addColorStop(1, '#05060d');
    g.fillStyle = grad; g.fillRect(0, 0, W, H);
    g.fillStyle = p.color; g.globalAlpha = p.active ? .9 : .35; g.fillRect(0, 0, W, 14); g.fillRect(0, H - 14, W, 14); g.globalAlpha = 1;
    g.textAlign = 'center'; g.fillStyle = '#fff'; g.font = '800 46px ZSDisplay, Arial Black, sans-serif';
    let name = p.name || ''; while (g.measureText(name).width > W - 40 && name.length > 3) name = name.slice(0, -2) + '…';
    g.fillText(name, W / 2, 100);
    g.font = '800 150px ZSDisplay, Arial Black, sans-serif'; g.fillStyle = p.color; g.shadowColor = p.color; g.shadowBlur = 30;
    g.fillText(String(p.score ?? ''), W / 2, 280); g.shadowBlur = 0;
    if (p.active) { g.font = '800 30px ZSText, Arial, sans-serif'; g.fillStyle = '#fff'; g.fillText('● AM ZUG', W / 2, 345); }
    p.scr.tex.needsUpdate = true;
  }

  // ---------- Moderator Vito ----------
  let host = null;
  const hostPromise = makeFigure('knight', '#ffcf6e').then(f => {
    if (!f) return; host = f; f.root.position.set(-1.95, .42, -1.2); f.root.rotation.y = .35; f.root.scale.setScalar(1.3); stage.add(f.root);
    f.root.traverse(o => { if (o.isMesh && /helmet|cape/i.test(o.name)) o.visible = false; });
    const mic = makeProp('mic'); let hand = null; f.root.traverse(o => { if (o.isBone && /handslot\.r/i.test(o.name)) hand = o; }); if (hand) hand.add(mic);
  });

  // ---------- LED-Inhalte ----------
  let edition = { id: 'gesamt', title: 'GESAMTMODUS', colors: ['#ffd36e', '#5ee7ff', '#ff5fa8'], icon: '✨' };
  let banner = { top: 'ZEITSPRUNG', mid: 'DIE SHOW', sub: 'LIVE AUS DEM STUDIO' };
  let ticker = 'ZEITSPRUNG · DIE GROSSE ZEITREISE-SHOW · WISSEN · MOVIE · RADIO · CASTINGSHOW · KINDERSERIEN · EUROVISION · ';
  function drawLed(t) {
    const { g, c } = ledTex; const W = c.width, H = c.height; const [a, b, cc] = edition.colors;
    const bg = g.createLinearGradient(0, 0, W, H); bg.addColorStop(0, '#070818'); bg.addColorStop(.5, '#0d0b26'); bg.addColorStop(1, '#070818');
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    // weiche Lichtflächen
    for (let i = 0; i < 3; i++) { const x = W * (.2 + .3 * i) + Math.sin(t * .4 + i * 2) * 220; const r = g.createRadialGradient(x, H * .5, 0, x, H * .5, 520); r.addColorStop(0, [a, b, cc][i] + '55'); r.addColorStop(1, 'transparent'); g.fillStyle = r; g.fillRect(0, 0, W, H); }
    // diagonale Lichtbalken
    g.save(); g.globalAlpha = .1; g.fillStyle = '#fff';
    for (let i = 0; i < 9; i++) { const x = ((i * 300 + t * 140) % (W + 600)) - 300; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 70, 0); g.lineTo(x - 130, H); g.lineTo(x - 200, H); g.fill(); }
    g.restore();
    // Zeitstrahl-Ticks
    g.fillStyle = b + 'aa'; for (let i = 0; i < 64; i++) { const x = (i * 34 + t * 60) % W; g.fillRect(x, H - 92, 3, i % 4 ? 12 : 26); }
    g.textAlign = 'center';
    g.font = '800 34px ZSText, Arial, sans-serif'; g.fillStyle = a; g.fillText(banner.top, W / 2, 112);
    g.font = '900 150px ZSDisplay, Arial Black, sans-serif'; const tg = g.createLinearGradient(0, 160, 0, 330); tg.addColorStop(0, '#ffffff'); tg.addColorStop(1, b);
    g.fillStyle = tg; g.shadowColor = a; g.shadowBlur = 40; let mid = banner.mid; g.font = `900 ${mid.length > 12 ? 112 : 150}px ZSDisplay, Arial Black, sans-serif`; g.fillText(mid, W / 2, 300); g.shadowBlur = 0;
    g.font = '700 40px ZSText, Arial, sans-serif'; g.fillStyle = '#e6e8ff'; g.fillText(banner.sub, W / 2, 380);
    // Laufschrift
    g.fillStyle = '#000000aa'; g.fillRect(0, H - 70, W, 70); g.fillStyle = cc; g.fillRect(0, H - 70, W, 4);
    g.font = '800 32px ZSText, Arial, sans-serif'; g.textAlign = 'left'; g.fillStyle = '#fff';
    const tw = g.measureText(ticker).width; const off = (t * 120) % tw; for (let x = -off; x < W; x += tw) g.fillText(ticker, x, H - 24);
    ledTex.tex.needsUpdate = true;
  }
  function drawPillars(t) {
    const { g, c } = pillarTex; const [a, b] = edition.colors;
    g.fillStyle = '#05060c'; g.fillRect(0, 0, c.width, c.height);
    for (let i = 0; i < 32; i++) { const y = ((i * 40 - t * 160) % 1280 + 1280) % 1280 - 128; const gr = g.createLinearGradient(0, y, 0, y + 90); gr.addColorStop(0, 'transparent'); gr.addColorStop(.5, i % 2 ? a : b); gr.addColorStop(1, 'transparent'); g.fillStyle = gr; g.fillRect(14, y, 100, 90); }
    pillarTex.tex.needsUpdate = true;
  }
  function drawBand(t) {
    const { g, c } = lineTex; const [a, b] = edition.colors; g.clearRect(0, 0, c.width, c.height);
    const gr = g.createLinearGradient(0, 0, c.width, 0); gr.addColorStop(0, 'transparent'); gr.addColorStop(.5, b); gr.addColorStop(1, 'transparent');
    g.fillStyle = gr; g.globalAlpha = .55; g.fillRect(0, 28, c.width, 8); g.globalAlpha = 1;
    for (let i = 0; i < 26; i++) { const x = (i * 40 + t * 80) % c.width; g.fillStyle = i % 5 ? a + '99' : '#fff'; g.fillRect(x, 18, 4, 28); }
    lineTex.tex.needsUpdate = true;
  }
  function drawDesk() {
    const { g, c } = deskFront; const [a, b] = edition.colors;
    const gr = g.createLinearGradient(0, 0, c.width, 0); gr.addColorStop(0, '#07081a'); gr.addColorStop(.5, '#141235'); gr.addColorStop(1, '#07081a');
    g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height);
    g.textAlign = 'center'; g.font = '900 62px ZSDisplay, Arial Black, sans-serif'; g.fillStyle = b; g.shadowColor = a; g.shadowBlur = 24; g.fillText('ZEITSPRUNG', c.width / 2, 105); g.shadowBlur = 0;
    g.font = '800 30px ZSText, Arial, sans-serif'; g.fillStyle = a; g.fillText(edition.title, c.width / 2, 160);
    deskFront.tex.needsUpdate = true;
  }

  // ---------- Kamera-Regie ----------
  const SHOTS = {
    title: { p: [0, 3.2, 21], t: [0, 3.6, -2], fov: 44, orbit: .06 },
    menu: { p: [-4.5, 3.6, 15.5], t: [1.2, 3.1, -2], fov: 40, orbit: .03 },
    setup: { p: [0, 4.2, 14], t: [0, 1.6, 1], fov: 40, orbit: .02 },
    show: { p: [0, 4.6, 15.5], t: [0, 2.2, -.5], fov: 42, orbit: .015 },
    host: { p: [1.2, 2.9, 6.5], t: [0, 2.2, -2.4], fov: 34, orbit: .01 },
    win: { p: [0, 3, 10], t: [0, 1.6, 2], fov: 36, orbit: .05 },
    poster: { p: [-1.6, 3.4, 6.2], t: [-4.4, 3, -3.4], fov: 40, orbit: 0 }
  };
  let shot = 'title', shotFrom = null, shotT = 1, focusPodium = -1, shake = 0;
  const camPos = new T.Vector3(...SHOTS.title.p), camTarget = new T.Vector3(...SHOTS.title.t);
  const wantPos = new T.Vector3(), wantTarget = new T.Vector3();
  let viewRect = null;
  function resolveShot(t) {
    const s = SHOTS[shot] || SHOTS.show;
    wantPos.set(...s.p); wantTarget.set(...s.t);
    if (focusPodium >= 0 && podiums[focusPodium]?.visible) {
      const pg = podiums[focusPodium].g; const wp = new T.Vector3(); pg.getWorldPosition(wp);
      const dir = new T.Vector3(0, 0, 1).applyQuaternion(pg.quaternion);
      wantTarget.set(wp.x, 1.7, wp.z);
      wantPos.copy(wp).addScaledVector(dir, 6.2).add(new T.Vector3(0, 2.1, 0));
    }
    if (!REDUCED) { const o = s.orbit; wantPos.x += Math.sin(t * .25) * 6 * o * 10; wantPos.y += Math.sin(t * .37) * .25; }
    camera.fov = lerp(camera.fov, s.fov, .04);
  }

  // ---------- Größe & Qualität ----------
  function applyTier() {
    const ratio = tier === 'high' ? DPR : tier === 'medium' ? Math.min(DPR, 1.25) : 1;
    renderer.setPixelRatio(ratio); composer.setPixelRatio(ratio);
    renderer.shadowMap.enabled = tier !== 'low';
    key.castShadow = follow.castShadow = tier !== 'low';
    key.shadow.mapSize.set(tier === 'high' ? 2048 : 1024, tier === 'high' ? 2048 : 1024);
    bloom.enabled = tier !== 'low';
    dust.visible = tier !== 'low';
    heads.forEach((h, i) => { h.beam.visible = tier !== 'low' || i % 2 === 0; });
    floorMat.opacity = tier === 'high' ? .86 : 1; floorMat.transparent = tier === 'high';
    resize(); buildMirror();
  }
  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false); composer.setSize(w, h); camera.aspect = w / h;
    bloom.resolution.set(w * (tier === 'high' ? .5 : .35), h * (tier === 'high' ? .5 : .35));
    if (viewRect) {
      const cx = (viewRect.x + viewRect.w / 2) * w, cy = (viewRect.y + viewRect.h / 2) * h;
      camera.setViewOffset(w, h, w / 2 - cx, h / 2 - cy, w, h);
      camera.zoom = Math.max(.55, Math.min(1, Math.min(viewRect.w * 1.5, viewRect.h * 1.25)));
    } else { camera.clearViewOffset(); camera.zoom = 1; }
    camera.updateProjectionMatrix();
  }
  addEventListener('resize', () => { resize(); if (mirror) buildMirror(); });

  // ---------- Animationsschleife ----------
  const clock = new T.Clock(); let t0 = 0, ledT = 0, frames = 0, fpsT = 0, slow = 0, running = true;
  const tmpM = new T.Matrix4(), tmpQ = new T.Quaternion(), tmpS = new T.Vector3(1, 1, 1), tmpP = new T.Vector3();
  let mood = 0; // 1 = Jubel, -1 = daneben
  function tick() {
    requestAnimationFrame(tick);
    if (!running || document.hidden) return;
    const dt = Math.min(clock.getDelta(), .05); t0 += dt; const t = t0;
    // FPS-Wächter: bei Ruckeln automatisch eine Stufe herunter
    frames++; fpsT += dt; if (fpsT > 3) { const fps = frames / fpsT; frames = 0; fpsT = 0; if (quality === 'auto' && fps < 34 && tier !== 'low') { if (++slow >= 2) { tier = tier === 'high' ? 'medium' : 'low'; slow = 0; applyTier(); } } else slow = 0; }
    resolveShot(t);
    const k = 1 - Math.pow(.0016, dt * (shotT < 1 ? .7 : .45));
    camPos.lerp(wantPos, k); camTarget.lerp(wantTarget, k);
    camera.position.copy(camPos);
    if (shake > 0) { shake = Math.max(0, shake - dt * 1.8); camera.position.x += (Math.random() - .5) * shake * .25; camera.position.y += (Math.random() - .5) * shake * .2; }
    camera.lookAt(camTarget); camera.updateProjectionMatrix();
    // Moving Heads
    const [a, b] = edition.colors;
    heads.forEach((h, i) => {
      const sweep = REDUCED ? 0 : Math.sin(t * (.5 + mood * .3) + h.phase);
      h.g.rotation.z = .55 * sweep; h.g.rotation.x = .35 * Math.cos(t * .4 + h.phase * 1.3) + (h.side ? .15 : -.15);
      h.mat.uniforms.uOpacity.value = (tier === 'low' ? .2 : .28) + (mood > 0 ? .2 * Math.abs(Math.sin(t * 8 + i)) : 0);
    });
    // Verfolger auf Spieler am Zug
    const act = podiums.find(p => p.active && p.visible);
    if (act) { act.g.getWorldPosition(tmpP); follow.target.position.lerp(tmpP.setY(1), .08); follow.intensity = lerp(follow.intensity, 420, .05); }
    else { follow.target.position.lerp(tmpP.set(0, 1.4, -2.2), .05); follow.intensity = lerp(follow.intensity, 160, .05); }
    key.target.position.set(0, 1, 0);
    // Publikum wippt, Leuchtstäbe
    const crowdK = mood > 0 ? 1 : .25;
    people.forEach((pp, i) => {
      const hop = Math.max(0, Math.sin(t * (mood > 0 ? 9 : 2) + pp.ph)) * .12 * crowdK;
      tmpP.copy(pp.p); tmpP.y += hop; tmpM.compose(tmpP, pp.q, tmpS); crowdMesh.setMatrixAt(i, tmpM);
      if (pp.glow) { tmpP.y += 1.25 + Math.sin(t * 3 + pp.ph) * .1; tmpP.x += Math.sin(t * 2 + pp.ph) * .15; tmpM.compose(tmpP, tmpQ, tmpS); } else tmpM.makeScale(0, 0, 0);
      glowMesh.setMatrixAt(i, tmpM);
    });
    crowdMesh.instanceMatrix.needsUpdate = true; glowMesh.instanceMatrix.needsUpdate = true;
    // Konfetti
    if (confActive > 0) {
      confActive -= dt;
      confData.forEach((d, i) => {
        d.v.y -= 2.2 * dt; d.v.multiplyScalar(.985); d.v.x += Math.sin(t * 2 + i) * .02;
        d.p.addScaledVector(d.v, dt); if (d.p.y < .02) { d.p.y = .02; d.v.set(0, 0, 0); }
        d.r.x += d.w.x * dt; d.r.y += d.w.y * dt; tmpQ.setFromEuler(d.r); tmpM.compose(d.p, tmpQ, tmpS); confetti.setMatrixAt(i, tmpM);
      });
      confetti.instanceMatrix.needsUpdate = true; if (confActive <= 0) confetti.count = 0;
    }
    if (mood && (t % 1) < dt) mood *= .7; if (Math.abs(mood) < .05) mood = 0;
    // Staub
    dust.rotation.y = t * .01;
    // Bühne
    ring2.rotation.z = t * .2; propAnims.forEach(f => f(t));
    accentMats.forEach(m => m.emissiveIntensity = 2 + Math.sin(t * 1.6) * .6 + (mood > 0 ? 1.5 : 0));
    // Figuren
    if (host) host.mixer.update(dt);
    podiums.forEach(p => { if (p.fig && p.visible) p.fig.mixer.update(dt); p.topMat.emissiveIntensity = p.active ? 1.4 + Math.sin(t * 5) * .5 : .7; });
    previewFig?.mixer.update(dt);
    // LED (30 Hz)
    ledT += dt; if (ledT > 1 / 30) { ledT = 0; drawLed(t); drawPillars(t); drawBand(t); }
    if (bloom.enabled) composer.render(); else renderer.render(scene, camera);
  }

  // ---------- API ----------
  function setEdition(e) {
    edition = e; const [a, b, c] = e.colors;
    accentMats.forEach(m => m.emissive.set(a)); accent2Mats.forEach(m => m.emissive.set(b));
    fillA.color.set(a); fillB.color.set(c || b); heads.forEach((h, i) => h.mat.uniforms.uColor.value.set(i % 3 === 0 ? b : i % 3 === 1 ? a : '#ffffff'));
    buildProp(e.prop || 'logo', e.colors); drawDesk();
    banner = { top: 'LIVE AUS DEM ZEITSPRUNG-STUDIO', mid: e.title, sub: e.tag || '' };
  }
  async function setPlayers(list) {
    for (let i = 0; i < 4; i++) {
      const p = podiums[i], d = list[i];
      p.visible = !!d; p.g.visible = !!d;
      if (!d) continue;
      Object.assign(p, { name: d.name, score: d.score ?? '', color: d.color });
      p.topMat.emissive.set(d.color); p.discRingMat.emissive.set(d.color);
      if (p.figId !== d.figure) {
        p.figId = d.figure; const want = d.figure;
        if (p.fig) { p.g.remove(p.fig.root); p.fig = null; }
        const f = await makeFigure(d.figure, d.color);
        if (f && p.figId === want) { p.fig = f; f.root.position.set(0, .34, -.2); f.root.scale.setScalar(1.25); p.g.add(f.root); }
      }
      drawPodium(p);
    }
  }
  function setActive(i) { podiums.forEach((p, k) => { const on = k === i; if (p.active !== on) { p.active = on; drawPodium(p); if (on) p.fig?.play('Interact', { once: true }); } }); }
  function setScores(scores) { podiums.forEach((p, k) => { if (scores[k] !== undefined && String(scores[k]) !== String(p.score)) { p.score = scores[k]; drawPodium(p); } }); }
  function react(i, good) {
    const p = podiums[i];
    if (good) { mood = 1; burst(edition.colors.concat(['#ffffff']), p?.visible ? new T.Vector3(p.g.position.x, 7, p.g.position.z) : undefined, 6); p?.fig?.play('Cheer', { once: true }); host?.play('Cheer', { once: true }); }
    else { mood = -1; shake = .6; p?.fig?.play('Hit_A', { once: true }); host?.play('Use_Item', { once: true }); }
  }
  function winner(i) {
    mood = 1; burst(edition.colors.concat(['#ffffff', '#ffd36e']), new T.Vector3(0, 9, 2), 12);
    setTimeout(() => burst(edition.colors.concat(['#ffffff']), new T.Vector3(0, 9, 2), 14), 1600);
    podiums.forEach((p, k) => p.fig?.play(k === i ? 'Cheer' : 'Sit_Chair_Idle', { once: k !== i }));
    focusPodium = i; shot = 'win';
  }
  // Figurenvorschau für das Spieler-Menü (dreht sich auf der Bühne)
  let previewFig = null;
  async function preview(figId, color) {
    if (previewFig?.id === figId) { previewFig.root.visible = !!figId; return; }
    if (previewFig) { stage.remove(previewFig.root); previewFig = null; }
    if (!figId) return;
    const f = await makeFigure(figId, color); if (!f) return;
    previewFig = f; f.root.position.set(0, .45, 1.4); f.root.scale.setScalar(1.35); stage.add(f.root); f.play('Cheer', { once: true });
  }

  setEdition(edition); applyTier();
  await Promise.all([hostPromise, animReady]);
  onProgress(90);
  tick(); onReady();
  return {
    setEdition, setPlayers, setActive, setScores, react, winner, preview,
    setShot(name, podium = -1) { if (shot !== name || focusPodium !== podium) { shot = name; focusPodium = podium; shotT = 0; setTimeout(() => shotT = 1, 1200); } },
    setBanner(b) { banner = { ...banner, ...b }; },
    setTicker(t) { ticker = t + ' · '; },
    setViewRect(r) { viewRect = r; resize(); },
    setQuality(q) { quality = q; tier = q === 'auto' ? (MOBILE ? 'medium' : 'high') : q; applyTier(); },
    quality: () => tier,
    host: () => host,
    pause(on) { running = !on; if (!on) clock.getDelta(); },
    burst: () => burst(edition.colors.concat(['#fff'])),
    renderer
  };
}
