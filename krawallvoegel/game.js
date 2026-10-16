/* Krawallvögel 3D – Hauptprogramm: Darstellung, Kamera, Steuerung (Touch/Maus/Tastatur/Controller), Menüs, Spielstand. */
(function () {
'use strict';
const THREE = window.THREE, K = window.KVLevels, KS = window.KVSim, A = window.KVAudio, MD = window.KVModels;
const $ = id => document.getElementById(id);
const SAVE_KEY = 'easygames.krawallvoegel.v1';
const fmt = n => Math.round(n).toLocaleString('de-DE');
const POWERS = [
  { id:'scope', icon:'🎯', name:'Zielfernrohr', info:'Zeigt in diesem Level die komplette Flugbahn.' },
  { id:'sling', icon:'🏹', name:'Superschleuder', info:'30 % mehr Wurfkraft für dieses Level.' },
  { id:'seed', icon:'🌱', name:'Krawallsamen', info:'Der nächste Vogel wird riesig und schwer.' },
  { id:'quake', icon:'🌋', name:'Erdbeben', info:'Lässt alle Bauwerke kräftig wackeln.' },
  { id:'eagle', icon:'🦅', name:'Mega-Adler', info:'Der Adler fegt einmal quer durchs Level.' }
];
const ABILITY = { none:'Kampfschrei', split:'Teilen', boost:'Turbo', bomb:'Explodieren', egg:'Ei-Bombe', boomerang:'Bumerang', inflate:'Aufblasen' };
const TIPS = [
  'Glas splittert unter dem Blitz-Trio, Zisch durchbohrt Holz, Bumm sprengt Stein.',
  'Unbenutzte Vögel bringen am Ende je 10.000 Punkte.',
  'Sender-Kisten in den Leveln geben 3.000 Bonuspunkte.',
  'In jeder Welt versteckt sich eine goldene Sender-Kiste für die Senderwand.',
  'TNT-Kisten lösen Kettenreaktionen aus.',
  'Triff die Stützen, nicht das Dach – dann stürzt alles ein.',
  'Kurvi fliegt auf Tippen zurück und erwischt Schweine von hinten.',
  'Mit dem Mega-Adler fegst du ein ganzes Level leer.',
  'Am PC: Pfeiltasten zielen, Leertaste schießt und löst die Fähigkeit aus.',
  'Controller: linker Stick zielt, Ⓐ schießt, Ⓨ/Ⓧ wählt und nutzt Power-ups.'
];
const MAT_COLOR = { wood:0xb87a3e, stone:0x9ea3ab, glass:0xbfeeff, tnt:0xd8301c, logo:0xb87a3e, gold:0xffd040, pig:0x7fcf3c };

// ---------- Spielstand ----------
function defaults() {
  return { v:1, lv:{}, gold:{}, power:{ scope:3, sling:3, seed:3, quake:2, eagle:1 },
    set:{ sound:true, music:true, aim:1, gfx:'auto', full:true, vibrate:true }, last:0, seen:{}, stats:{ pigs:0, shots:0, crates:0 }, logoHits:{} };
}
function loadSave() {
  const d = defaults();
  try {
    const raw = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    if (!raw || typeof raw !== 'object') return d;
    const lv = {};
    if (raw.lv && typeof raw.lv === 'object') Object.keys(raw.lv).forEach(k => {
      const id = Number(k), v = raw.lv[k];
      if (id >= 0 && id < K.LEVEL_COUNT && Array.isArray(v)) lv[id] = [Math.max(0, Math.min(3, v[0] | 0)), Math.max(0, Number(v[1]) || 0)];
    });
    const n = (x, def, max) => Math.max(0, Math.min(max || 99, Math.floor(Number(x)))) || (x === 0 ? 0 : def);
    const power = {}; POWERS.forEach(p => { power[p.id] = raw.power && raw.power[p.id] !== undefined ? n(raw.power[p.id], 0) : d.power[p.id]; });
    const s = Object.assign({}, d.set, raw.set || {});
    return { v:1, lv, gold:raw.gold && typeof raw.gold === 'object' ? raw.gold : {}, power,
      set:{ sound:s.sound !== false, music:s.music !== false, aim:[0, 1, 2].includes(s.aim) ? s.aim : 1, gfx:['auto', 'low', 'mid', 'high'].includes(s.gfx) ? s.gfx : 'auto', full:s.full !== false, vibrate:s.vibrate !== false },
      last:Math.max(0, Math.min(K.LEVEL_COUNT - 1, raw.last | 0)), seen:raw.seen && typeof raw.seen === 'object' ? raw.seen : {},
      stats:Object.assign({ pigs:0, shots:0, crates:0 }, raw.stats || {}), logoHits:raw.logoHits && typeof raw.logoHits === 'object' ? raw.logoHits : {} };
  } catch (_) { return d; }
}
let save = loadSave();
function store() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { console.warn('Krawallvögel: Speichern nicht möglich', e); } }
const levelDone = id => !!(save.lv[id] && save.lv[id][0] > 0);
const unlocked = id => id === 0 || levelDone(id - 1);
const totalStars = () => Object.keys(save.lv).reduce((s, k) => s + save.lv[k][0], 0);
const worldStars = w => { let s = 0; for (let i = 0; i < K.LEVELS_PER_WORLD; i++) s += (save.lv[w * K.LEVELS_PER_WORLD + i] || [0])[0]; return s; };
const goldCount = () => Object.keys(save.gold).filter(k => save.gold[k]).length;
function logoUnlocked(logo) {
  if (K.WORLDS.some((W, w) => W.logo === logo && save.gold[w])) return true;
  const s = K.STAR_LOGOS.find(x => x.logo === logo);
  return !!(s && totalStars() >= s.stars);
}
function maxUnlocked() { let m = 0; for (let i = 0; i < K.LEVEL_COUNT; i++) if (unlocked(i)) m = i; return m; }

// ---------- Renderer ----------
let renderer, scene, camera, hemi, sun, levelRoot, debris, smoke, trailDots, aimDots, flash, sling;
let quality = 'mid', isTouch = matchMedia('(pointer:coarse)').matches;
const logoTex = [], logoUrl = [], portraits = {};
function qualityLevel() { return save.set.gfx !== 'auto' ? save.set.gfx : (isTouch || Math.min(innerWidth, innerHeight) < 600 ? 'mid' : 'high'); }
function applyQuality() {
  quality = qualityLevel();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality === 'high' ? 1.5 : quality === 'mid' ? 1.25 : 1));
  const sh = quality === 'high';
  if (renderer.shadowMap.enabled !== sh) {
    renderer.shadowMap.enabled = sh;
    scene && scene.traverse(o => { if (o.material) [].concat(o.material).forEach(m => { m.needsUpdate = true; }); });
  }
  resize();
}
function initRenderer() {
  renderer = new THREE.WebGLRenderer({ antialias:qualityLevel() !== 'low', powerPreference:'high-performance' });
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  $('stage').appendChild(renderer.domElement);
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(36, 1, 0.5, 420);
  hemi = new THREE.HemisphereLight(0xffffff, 0x6a5a4a, 0.82); scene.add(hemi);
  sun = new THREE.DirectionalLight(0xffffff, 0.72); sun.position.set(-20, 40, 30);
  sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); sun.shadow.bias = -0.0008;
  scene.add(sun); scene.add(sun.target);
  levelRoot = new THREE.Group(); scene.add(levelRoot);
  applyQuality();
}
function initEffects() {
  debris = MD.Particles(scene, 260, MD.G.box, MD.M.debris);
  smoke = MD.Particles(scene, 90, MD.G.sphereLo, MD.M.smoke);
  trailDots = new THREE.InstancedMesh(MD.G.sphereLo, MD.M.trail, 140); trailDots.count = 0; trailDots.frustumCulled = false; scene.add(trailDots);
  aimDots = new THREE.InstancedMesh(MD.G.sphereLo, MD.M.aim, 34); aimDots.count = 0; aimDots.frustumCulled = false; scene.add(aimDots);
  flash = new THREE.Mesh(MD.G.sphere, MD.M.flash); flash.visible = false; scene.add(flash);
  sling = MD.makeSling(); scene.add(sling);
}
function resize() {
  if (!renderer) return;
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
  checkRotate();
}

// ---------- Senderlogos ----------
function fallbackLogo(i) {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  g.fillStyle = '#2a1a5e'; g.fillRect(0, 0, 128, 128); g.fillStyle = '#ffd84a'; g.font = 'bold 54px sans-serif'; g.textAlign = 'center'; g.fillText('♪', 64, 82);
  g.font = 'bold 14px sans-serif'; g.fillStyle = '#fff'; g.fillText(K.STATIONS[i - 1] || '', 64, 116);
  return c;
}
function loadLogos(progress) {
  return new Promise(resolve => {
    let done = 0; const total = K.STATIONS.length;
    const finish = () => { done++; progress(done / total); if (done === total) resolve(); };
    for (let i = 1; i <= total; i++) {
      const img = new Image(), path = '../anmacha-memory/logos/' + String(i).padStart(2, '0') + '.png';
      let settled = false;
      const use = src => {
        if (settled) return; settled = true;
        const t = new THREE.Texture(src); t.needsUpdate = true; t.anisotropy = 2; logoTex[i] = t;
        logoUrl[i] = src instanceof HTMLCanvasElement ? src.toDataURL() : path;
        const strip = $('loadLogos'), el = document.createElement('img'); el.src = logoUrl[i]; el.alt = ''; strip.appendChild(el);
        requestAnimationFrame(() => el.classList.add('on'));
        finish();
      };
      img.onload = () => use(img); img.onerror = () => use(fallbackLogo(i));
      setTimeout(() => use(fallbackLogo(i)), 8000);
      img.src = path;
    }
  });
}
const getLogoTex = i => logoTex[i] || logoTex[1];

// ---------- Level-Szene ----------
let sim = null, levelId = 0, level = null, views = new Map(), waiting = [], waitingKey = '', slingBird = null, slingBirdType = '', eagleView = null;
let demo = true, acc = 0, levelTime = 0, displayScore = 0, resultTimer = 0, trail = [], trailT = 0, shake = 0, shakeUntil = 0;
function disposeLevel() {
  levelRoot.traverse(o => { if (o.userData && o.userData.dispose) o.userData.dispose.dispose(); });
  (levelRoot.userData.mats || []).forEach(m => { if (m.map && m.map !== null && !logoTex.includes(m.map)) m.map.dispose(); m.dispose(); });
  levelRoot.clear(); levelRoot.userData = {};
  if (scene.background && scene.background.dispose) scene.background.dispose();
  views.clear(); waiting = []; waitingKey = ''; slingBird = null; slingBirdType = ''; eagleView = null;
  debris.clear(); smoke.clear(); trailDots.count = 0; aimDots.count = 0; trail = []; flash.visible = false;
}
function buildLevel(id, isDemo) {
  disposeLevel();
  levelId = id; level = K.getLevel(id); demo = !!isDemo;
  sim = KS.createSim(level);
  const env = MD.buildScenery(level, levelRoot, getLogoTex, quality);
  scene.background = env.sky; scene.fog = new THREE.Fog(env.fog, 90, 260);
  hemi.color.set(K.WORLDS[level.world].sky[1]);
  const lightW = level.width + 30;
  sun.position.set(level.width * 0.3 - 18, 40, 30); sun.target.position.set(level.width * 0.45, 0, 0);
  Object.assign(sun.shadow.camera, { left:-lightW / 2 - 10, right:lightW / 2 + 10, top:30, bottom:-12, near:1, far:120 }); sun.shadow.camera.updateProjectionMatrix();
  handleEvents();   // erzeugt die Ansichten für alle Blöcke/Schweine
  acc = 0; levelTime = 0; displayScore = 0;
  fitCamera(true);
}
function viewFor(ent) {
  let obj;
  if (ent.kind === 'block') obj = MD.makeBlock(ent, getLogoTex);
  else if (ent.kind === 'pig') obj = MD.makePig(ent.k);
  else if (ent.kind === 'bird') { obj = MD.makeBird(ent.type); obj.scale.setScalar(ent.r); }
  else if (ent.kind === 'egg') obj = MD.makeEgg();
  else if (ent.kind === 'eagle') { obj = MD.makeEagle(); eagleView = obj; }
  else return;
  if (quality === 'high') obj.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = ent.kind === 'block'; } });
  levelRoot.add(obj);
  views.set(ent.id, { obj, ent, init:false });
}
function removeView(ent) { const v = views.get(ent.id); if (v) { levelRoot.remove(v.obj); views.delete(ent.id); } if (ent.kind === 'eagle') eagleView = null; }
function updateViews(t) {
  views.forEach(v => {
    const e = v.ent, b = e.body;
    if (!b) return;
    if (!v.init || b.isAwake() || e.kind === 'eagle') {
      const p = b.getPosition(); v.obj.position.set(p.x, p.y, 0); v.obj.rotation.z = e.kind === 'eagle' ? 0 : b.getAngle(); v.init = true;
    }
    if (e.kind === 'pig') MD.setPigStage(e, v.obj, t);
    else if (e.kind === 'bird') {
      const s = e.r; if (Math.abs(v.obj.scale.x - s) > 0.01) v.obj.scale.setScalar(v.obj.scale.x + (s - v.obj.scale.x) * 0.35);
      if (!e.hit) { const vel = b.getLinearVelocity(); v.obj.rotation.z = Math.atan2(vel.y, vel.x) * 0.6; }
    } else if (e.kind === 'eagle') { const w = v.obj.userData.wings, a = Math.sin(t * 14) * 0.6; w[0].rotation.x = a; w[1].rotation.x = -a; }
  });
  // Vogel auf der Schleuder und wartende Vögel
  const onSling = sim && sim.state === 'ready' && sim.queue.length ? sim.queue[0] : null;
  const typeKey = onSling ? onSling + (sim.seed ? '+' : '') : '';
  if (typeKey !== slingBirdType) {
    if (slingBird) levelRoot.remove(slingBird);
    slingBird = onSling ? MD.makeBird(onSling) : null; slingBirdType = typeKey;
    if (slingBird) { if (sim.seed) slingBird.scale.multiplyScalar(1.6); levelRoot.add(slingBird); }
  }
  let bx = K.SLING.x, by = K.SLING.y, br = 0.3;
  if (slingBird) {
    if (aim.active) { const s = sim.shot(aim.dx, aim.dy); bx = s.px; by = s.py; }
    slingBird.position.set(bx, by, 0); slingBird.rotation.z = aim.active ? Math.atan2(-aim.dy, -aim.dx) * 0.5 : Math.sin(t * 2) * 0.05;
    br = slingBird.scale.x;
  }
  MD.updateSling(sling, bx, by, br);
  const rest = sim ? sim.queue.slice(onSling ? 1 : 0) : [], key = rest.join(',');
  if (key !== waitingKey) {
    waiting.forEach(o => levelRoot.remove(o)); waitingKey = key;
    waiting = rest.map((type, i) => { const o = MD.makeBird(type); o.position.set(-1.7 - i * 1.25, K.BIRDS[type].r, 0.4); levelRoot.add(o); return o; });
  }
  waiting.forEach((o, i) => { const r = o.scale.x, hop = Math.max(0, Math.sin(t * 2.4 + i * 1.3)); o.position.y = r + (hop > 0.93 ? (hop - 0.93) * 6 : 0); });
}

// ---------- Kamera ----------
const cam = { x:0, y:5, w:40, tx:0, ty:5, tw:40, manual:false, hold:0, demoT:0 };
const DEG = Math.PI / 180;
function viewH(w) { return w / camera.aspect; }
function overview() {
  let top = 6, right = 20;
  if (level) level.blocks.concat(level.pigs).forEach(b => { top = Math.max(top, b.y + 2); right = Math.max(right, b.x + (b.w || 1)); });
  const x0 = -6.5, x1 = right + 3;
  let w = Math.max(x1 - x0, (top + 2) * camera.aspect, 24);
  return { w, x0 };
}
function aimView() {
  const o = overview(), minPx = isTouch ? 15 : 13, maxW = innerWidth / minPx;
  if (o.w <= maxW) return { x:o.x0 + o.w / 2, w:o.w };
  const w = Math.max(26, maxW); return { x:-6.5 + w / 2, w };
}
function fitCamera(instant) {
  const a = aimView();
  cam.tx = a.x; cam.tw = a.w; cam.ty = viewH(a.w) / 2 - 1.2;
  if (instant) { const o = overview(); cam.x = o.x0 + o.w / 2; cam.w = o.w; cam.y = viewH(o.w) / 2 - 1.2; }
}
function clampCam() {
  const o = overview();
  cam.tw = Math.max(12, Math.min(o.w * 1.3, cam.tw));
  const h = viewH(cam.tw), minY = h / 2 - 1.5;
  cam.ty = Math.max(minY, Math.min(minY + 22, cam.ty));
  cam.tx = Math.max(-14, Math.min((level ? level.width : 40) + 10, cam.tx));
}
function updateCamera(dt, t) {
  if (demo) {
    cam.demoT += dt; const o = overview(), span = Math.max(0, (level.width + 4) - (-6.5) - 30);
    cam.tw = Math.min(o.w, 34); cam.tx = -6.5 + cam.tw / 2 + span * (0.5 - 0.5 * Math.cos(cam.demoT * 0.08)); cam.ty = viewH(cam.tw) / 2 - 1.2;
  } else if (!cam.manual && sim) {
    const fly = sim.flyingBird();
    if (levelTime < cam.hold) { const o = overview(); cam.tx = o.x0 + o.w / 2; cam.tw = o.w; cam.ty = viewH(o.w) / 2 - 1.2; }
    else if (fly && sim.state === 'flying') {
      const p = fly.body.getPosition(), a = aimView(), w = Math.min(a.w, Math.max(28, a.w * 0.8)), h = viewH(w);
      cam.tw = w; cam.tx = Math.max(-6.5 + w / 2, Math.min(level.width + 6 - w / 2, p.x + w * 0.12));
      cam.ty = Math.max(h / 2 - 1.2, p.y - h / 2 + 3);
    } else if (sim.state === 'ready' || sim.state === 'lastwait' || sim.state === 'winwait') {
      if (sim.state === 'ready') fitCamera(false);
    }
  }
  clampCam();
  const k = 1 - Math.exp(-dt * (cam.manual ? 12 : 3.2));
  cam.x += (cam.tx - cam.x) * k; cam.y += (cam.ty - cam.y) * k; cam.w += (cam.tw - cam.w) * k;
  const dist = (cam.w / 2) / (Math.tan(camera.fov / 2 * DEG) * camera.aspect);
  let sx = 0, sy = 0;
  if (t < shakeUntil) { sx = (Math.random() - 0.5) * shake; sy = (Math.random() - 0.5) * shake; }
  camera.position.set(cam.x + sx, cam.y + dist * 0.07 + sy, dist);
  camera.lookAt(cam.x + sx, cam.y + sy, 0);
}
const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), ndc = new THREE.Vector2(), hit = new THREE.Vector3();
function screenToWorld(cx, cy) {
  ndc.set(cx / innerWidth * 2 - 1, -(cy / innerHeight) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  return ray.ray.intersectPlane(plane, hit) ? { x:hit.x, y:hit.y } : { x:0, y:0 };
}
const projV = new THREE.Vector3();
function worldToScreen(x, y, z) { projV.set(x, y, z || 0).project(camera); return { x:(projV.x + 1) / 2 * innerWidth, y:(1 - projV.y) / 2 * innerHeight }; }
function addShake(amount, dur) { shake = Math.max(t0() < shakeUntil ? shake : 0, amount); shakeUntil = Math.max(shakeUntil, t0() + dur); }
const t0 = () => performance.now() / 1000;

// ---------- Effekte & Ereignisse ----------
function burst(x, y, hex, n, speed, size) {
  const cnt = quality === 'low' ? Math.ceil(n / 2) : n;
  for (let i = 0; i < cnt; i++) {
    const a = Math.random() * Math.PI * 2, s = speed * (0.4 + Math.random());
    debris.emit(x, y, (Math.random() - 0.5) * 0.8, Math.cos(a) * s, Math.sin(a) * s + 2, (Math.random() - 0.5) * 3, size * (0.5 + Math.random()), hex, 1.2 + Math.random() * 0.8, 14);
  }
}
function puff(x, y, hex, n, size) {
  for (let i = 0; i < n; i++) smoke.emit(x + (Math.random() - 0.5), y + (Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5) * 2, 0.6 + Math.random() * 1.2, 0, size * (0.6 + Math.random() * 0.6), hex, 0.9 + Math.random() * 0.6, 0, 1.4);
}
const panOf = x => { const s = worldToScreen(x, 0); return Math.max(-0.9, Math.min(0.9, s.x / innerWidth * 2 - 1)); };
function rumble(strength) {
  if (!save.set.vibrate) return;
  if (lastInput === 'pad') {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const p of pads) if (p && p.vibrationActuator && p.vibrationActuator.playEffect) p.vibrationActuator.playEffect('dual-rumble', { duration:180 + strength * 200, strongMagnitude:Math.min(1, strength), weakMagnitude:0.5 }).catch(() => {});
  } else if (isTouch && navigator.vibrate) { try { navigator.vibrate(Math.round(30 + strength * 60)); } catch (_) {} }
}
function handleEvents() {
  if (!sim) return;
  const now = t0();
  for (const e of sim.events) {
    switch (e.type) {
      case 'spawn': viewFor(e.ent); break;
      case 'remove': removeView(e.ent); break;
      case 'hit': {
        const v = views.get(e.ent.id);
        if (v && e.ent.kind === 'block') MD.setBlockStage(e.ent, v.obj);
        if (demo) break;
        A.play(e.m === 'pig' ? 'pig' : e.m, panOf(e.x), e.power, 45);
        if (e.m !== 'pig' && e.power > 0.15) burst(e.x, e.y, MAT_COLOR[e.m] || 0xffffff, 3, 3, 0.18);
        break;
      }
      case 'destroy':
        burst(e.x, e.y, MAT_COLOR[e.m] || 0xffffff, e.m === 'glass' ? 16 : 12, 5, e.m === 'stone' ? 0.3 : 0.24);
        if (e.score) popup(e.x, e.y, fmt(e.score), e.m === 'logo' || e.m === 'gold' ? 'logo' : '');
        A.play(e.m === 'tnt' || e.m === 'logo' ? 'wood' : e.m === 'gold' ? 'glass' : e.m, panOf(e.x), 1, 30);
        break;
      case 'pig':
        puff(e.x, e.y, 0xffffff, 8, 0.55); burst(e.x, e.y, 0x7fcf3c, 6, 4, 0.15);
        popup(e.x, e.y + 0.6, fmt(e.score), 'pig'); A.play('pigpop', panOf(e.x)); save.stats.pigs++;
        break;
      case 'boom':
        flash.position.set(e.x, e.y, 0.5); flash.scale.setScalar(0.5); flash.visible = true; flash.userData = { t:now, r:e.r };
        puff(e.x, e.y, 0x777777, 14, 1.1); burst(e.x, e.y, 0xffa030, 10, 7, 0.2);
        A.play('boom', panOf(e.x)); addShake(0.5, 0.4); rumble(0.9);
        break;
      case 'logo':
        save.stats.crates++; save.logoHits[e.logo] = (save.logoHits[e.logo] || 0) + 1;
        toast('Sender-Kiste: <b>' + K.STATIONS[e.logo - 1] + '</b> · +3.000', logoUrl[e.logo]); A.play('jingle', panOf(e.x));
        break;
      case 'gold': {
        const w = level.world, first = !save.gold[w];
        save.gold[w] = 1;
        if (first) { save.power.eagle++; const p = POWERS[Math.floor(Math.random() * 4)].id; save.power[p]++; }
        store(); renderPowers();
        toast('Goldene Sender-Kiste! <b>' + K.STATIONS[e.logo - 1] + '</b> hängt jetzt an der Senderwand' + (first ? ' · +2 Power-ups' : ''), logoUrl[e.logo], 4200);
        A.play('goldJingle', panOf(e.x)); burst(e.x, e.y, 0xffd040, 18, 6, 0.2);
        break;
      }
      case 'launch':
        trail = []; trailT = 0; cam.manual = false; aim.active = false;
        A.play('launch', panOf(0)); A.play('squawk', panOf(0), e.ent.type); save.stats.shots++;
        break;
      case 'ability': {
        const x = e.x, y = e.y;
        if (e.ability === 'boost') { A.play('boost', panOf(x)); puff(x, y, 0xfff3b0, 5, 0.4); }
        else if (e.ability === 'split') { A.play('ability', panOf(x)); puff(x, y, 0xd8eefc, 4, 0.35); }
        else if (e.ability === 'egg') { A.play('ability', panOf(x)); burst(x, y, 0xffffff, 6, 3, 0.12); }
        else if (e.ability === 'boomerang') { A.play('ability', panOf(x)); }
        else if (e.ability === 'inflate') { A.play('inflate', panOf(x)); }
        else if (e.ability === 'none') A.play('squawk', panOf(x), e.ent.type);
        break;
      }
      case 'gone':
        if (e.ent.kind === 'bird') { burst(e.x, e.y, K.BIRDS[e.ent.type].color, 7, 3, 0.16); puff(e.x, e.y, 0xffffff, 3, 0.4); }
        break;
      case 'cleared': if (!demo) { A.play('clear'); bannerShow('Alle Schweine erledigt!', ''); } break;
      case 'won': if (!demo) finishWin(e.bonus); break;
      case 'lost': if (!demo) finishLose(); break;
      case 'power':
        if (e.kind === 'quake') { A.play('quake'); addShake(0.35, 2.6); rumble(0.6); }
        else if (e.kind === 'eagle') { A.play('eagle'); addShake(0.25, 1.4); }
        else A.play('ability');
        renderPowers();
        break;
    }
  }
  sim.events.length = 0;
}

// ---------- Trefferanzeigen ----------
const popLayer = $('popups');
function popup(x, y, text, cls) {
  if (popLayer.childElementCount > 24) popLayer.firstChild.remove();
  const s = worldToScreen(x, y), d = document.createElement('div');
  d.className = 'pop ' + (cls || ''); d.textContent = text; d.style.left = s.x + 'px'; d.style.top = s.y + 'px';
  popLayer.appendChild(d); setTimeout(() => d.remove(), 1150);
}
let toastTimer = 0;
function toast(html, img, ms) {
  const el = $('toast'); el.innerHTML = (img ? '<img alt="" src="' + img + '">' : '') + '<span>' + html + '</span>'; el.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.hidden = true; }, ms || 2600);
}
let bannerTimer = 0;
function bannerShow(big, small) {
  const el = $('banner'); el.hidden = true; void el.offsetWidth;
  el.innerHTML = '<b>' + big + '</b>' + (small ? '<small>' + small + '</small>' : ''); el.hidden = false;
  clearTimeout(bannerTimer); bannerTimer = setTimeout(() => { el.hidden = true; }, 2200);
}

// ---------- Zielen ----------
const aim = { active:false, src:'', dx:-1.6, dy:-0.9, grabX:0, grabY:0, kbAng:35, kbPow:0.85 };
const aimPts = [], m4 = new THREE.Matrix4();
function updateAimDots() {
  aimDots.count = 0;
  if (!sim || !aim.active || !sim.canShoot()) return;
  const len = sim.scope ? 32 : [0, 9, 22][save.set.aim];
  if (!len) return;
  const s = sim.shot(aim.dx, aim.dy), step = sim.scope ? 0.11 : 0.07;
  KS.trajectory(s.px, s.py, s.vx, s.vy, len + 1, step, aimPts);
  for (let i = 1; i <= len; i++) {
    const p = aimPts[i]; if (p[1] < -0.5) break;
    const sc = 0.17 * (1 - i / (len + 8)) + 0.05;
    m4.makeScale(sc, sc, sc).setPosition(p[0], p[1], 0.2); aimDots.setMatrixAt(aimDots.count++, m4);
  }
  aimDots.instanceMatrix.needsUpdate = true;
}
function updateTrail(dt) {
  const b = sim && sim.state === 'flying' ? sim.active[0] : null;
  if (b && !b.dead && !b.hit) {
    trailT += dt;
    if (trailT > 0.045 && trail.length < 140) { trailT = 0; const p = b.body.getPosition(); trail.push([p.x, p.y]); }
  }
  trailDots.count = trail.length;
  for (let i = 0; i < trail.length; i++) { const sc = i % 3 === 0 ? 0.13 : 0.08; m4.makeScale(sc, sc, sc).setPosition(trail[i][0], trail[i][1], -0.1); trailDots.setMatrixAt(i, m4); }
  if (trail.length) trailDots.instanceMatrix.needsUpdate = true;
}
function setAimFromAngle() {
  const a = aim.kbAng * DEG, p = aim.kbPow * K.SLING.maxPull;
  aim.dx = -Math.cos(a) * p; aim.dy = -Math.sin(a) * p;
}
function fire() {
  if (!sim || !aim.active) return false;
  const ok = sim.launch(aim.dx, aim.dy);
  if (!ok) { aim.active = false; return false; }
  handleEvents(); renderPowers(); return true;
}
function doAbility() { if (sim && sim.ability()) { handleEvents(); return true; } return false; }

// ---------- Level-Ablauf ----------
let mode = 'loading', paused = false, pendingIntros = [];
function startLevel(id) {
  id = Math.max(0, Math.min(K.LEVEL_COUNT - 1, id));
  closeOverlays();
  save.last = id; store();
  buildLevel(id, false);
  mode = 'play'; paused = false; cam.manual = false; cam.hold = 1.6; aim.active = false;
  showScreen(null); $('hud').hidden = false;
  const W = K.WORLDS[level.world];
  $('hudLevel').textContent = level.name; $('hudWorld').textContent = W.name;
  $('hudBest').textContent = fmt((save.lv[id] || [0, 0])[1]);
  bannerShow('Level ' + level.name, W.name + (level.boss ? ' · Boss: König Grunz' : ''));
  A.setMusic(W.music);
  renderPowers(); updateHud(true);
  pendingIntros = [];
  if (level.index === 0 && !save.seen['w' + level.world]) pendingIntros.push({ img:logoUrl[W.logo], eyebrow:'WELT ' + (level.world + 1) + ' · ' + K.STATIONS[W.logo - 1], title:W.name, text:W.text, key:'w' + level.world });
  if (level.intro && !save.seen[level.intro]) {
    const B = K.BIRDS[level.intro];
    pendingIntros.push({ img:portraits['bird_' + level.intro], eyebrow:'NEUER VOGEL', title:B.name, text:B.info + (B.ability !== 'none' ? ' Fähigkeit: ' + (isTouch ? 'im Flug tippen' : 'Leertaste / Klick / Ⓐ im Flug') + '.' : ''), key:level.intro });
  }
  if (level.gold && !save.gold[level.world]) setTimeout(() => { if (mode === 'play' && levelId === id) toast('Hier versteckt sich die goldene Sender-Kiste! 📻', logoUrl[W.logo], 3200); }, 2400);
  if (pendingIntros.length) setTimeout(nextIntro, 700);
}
function nextIntro() {
  if (mode !== 'play') return;
  const it = pendingIntros.shift(); if (!it) return;
  $('introImg').src = it.img || ''; $('introEyebrow').textContent = it.eyebrow; $('introTitle').textContent = it.title; $('introText').textContent = it.text;
  save.seen[it.key] = 1; store();
  openOverlay('intro');
}
function finishWin(bonus) {
  const id = levelId, stars = sim.stars(), score = sim.score;
  // Bonus-Vögel nacheinander zählen
  waiting.concat(slingBird ? [slingBird] : []).slice(0, bonus).forEach((o, i) => setTimeout(() => { popup(o.position.x, o.position.y + 1, '10.000', 'big'); A.play('star', 0, 0); }, 250 + i * 280));
  const prev = save.lv[id] || [0, 0], firstClear = prev[0] === 0, first3 = stars === 3 && prev[0] < 3, record = score > prev[1];
  const before = totalStars();
  save.lv[id] = [Math.max(prev[0], stars), Math.max(prev[1], score)];
  const rewards = [];
  if (first3) { const p = POWERS[Math.floor(Math.random() * POWERS.length)]; save.power[p.id]++; rewards.push(p.icon + ' ' + p.name); }
  if (firstClear && level.boss) { save.power.eagle++; rewards.push('🦅 Mega-Adler'); }
  const after = totalStars(), newLogos = K.STAR_LOGOS.filter(s => before < s.stars && after >= s.stars);
  store();
  clearTimeout(resultTimer);
  resultTimer = setTimeout(() => {
    $('resultLevel').textContent = 'LEVEL ' + level.name + ' · ' + K.WORLDS[level.world].name;
    $('resultTitle').textContent = level.boss ? 'Burg gestürmt!' : 'Level geschafft!';
    const info = [];
    if (record) info.push('🏆 Neuer Rekord!');
    if (rewards.length) info.push('Belohnung: ' + rewards.join(', '));
    newLogos.forEach(s => info.push('📻 Neues Senderlogo: ' + K.STATIONS[s.logo - 1]));
    $('resultInfo').textContent = info.join(' · ') || 'Nächste Schwelle: ' + (stars < 3 ? fmt(level.stars[stars]) + ' Punkte für ' + (stars + 1) + ' ★' : 'Perfekt – alle Sterne!');
    const next = id + 1 < K.LEVEL_COUNT;
    $('resultButtons').innerHTML = '<button class="btn" data-act="levels" aria-label="Levelauswahl">▦</button><button class="btn" data-act="restart" aria-label="Nochmal">↻</button>' +
      (next ? '<button class="btn primary" data-act="next">▶ Weiter</button>' : '<button class="btn primary" data-act="worlds">🏆 Welten</button>');
    animateResult(score, stars, true);
    A.play('win');
  }, 900 + bonus * 280);
}
function finishLose() {
  clearTimeout(resultTimer);
  resultTimer = setTimeout(() => {
    $('resultLevel').textContent = 'LEVEL ' + level.name + ' · ' + K.WORLDS[level.world].name;
    $('resultTitle').textContent = 'Die Schweine lachen …';
    $('resultInfo').textContent = sim.pigsLeft + (sim.pigsLeft === 1 ? ' Schwein hat' : ' Schweine haben') + ' überlebt. Tipp: ' + TIPS[Math.floor(Math.random() * TIPS.length)];
    $('resultButtons').innerHTML = '<button class="btn" data-act="levels" aria-label="Levelauswahl">▦</button><button class="btn primary" data-act="restart">↻ Nochmal</button>';
    animateResult(sim.score, 0, false);
    A.play('lose');
  }, 700);
}
function animateResult(score, stars, won) {
  const st = $('resultStars').children; [...st].forEach(s => s.classList.remove('on'));
  $('resultStars').style.display = won ? '' : 'none';
  openOverlay('result');
  const el = $('resultScore'), t = performance.now();
  (function count() { const k = Math.min(1, (performance.now() - t) / 900); el.textContent = fmt(score * k); if (k < 1 && !$('result').hidden) requestAnimationFrame(count); })();
  for (let i = 0; i < stars; i++) setTimeout(() => { if (!$('result').hidden) { st[i].classList.add('on'); A.play('star', 0, i); } }, 450 + i * 380);
}

// ---------- HUD ----------
function renderPowers() {
  const box = $('powers'); if (!box) return;
  if (!box.childElementCount) {
    POWERS.forEach((p, i) => {
      const b = document.createElement('button'); b.className = 'pw-btn'; b.dataset.pw = p.id; b.title = p.name + ': ' + p.info;
      b.setAttribute('aria-label', p.name); b.innerHTML = p.icon + '<em></em>';
      b.addEventListener('click', ev => { ev.stopPropagation(); usePower(p.id); });
      b.addEventListener('pointerdown', ev => ev.stopPropagation());
      box.appendChild(b);
    });
  }
  [...box.children].forEach((b, i) => {
    const id = b.dataset.pw, n = save.power[id] || 0;
    b.querySelector('em').textContent = n;
    const on = sim && ((id === 'scope' && sim.scope) || (id === 'sling' && sim.vmax > K.SLING.vmax) || (id === 'seed' && sim.seed));
    b.classList.toggle('on', !!on); b.disabled = !n && !on;
    b.classList.toggle('sel', lastInput === 'pad' && selPower === i);
  });
}
let selPower = 0;
function usePower(id) {
  if (!sim || mode !== 'play' || paused || (save.power[id] || 0) <= 0) return;
  if (sim.usePower(id)) {
    save.power[id]--; store(); handleEvents(); renderPowers();
    const P = POWERS.find(p => p.id === id); toast(P.icon + ' <b>' + P.name + '</b> – ' + P.info);
  }
}
let lastHint = '';
function updateHud(force) {
  if (!sim) return;
  displayScore += (sim.score - displayScore) * 0.2; if (Math.abs(sim.score - displayScore) < 5) displayScore = sim.score;
  $('hudScore').textContent = fmt(displayScore);
  const s = sim.score >= level.stars[2] ? 3 : sim.score >= level.stars[1] ? 2 : sim.score >= level.stars[0] ? 1 : 0;
  const stars = '★'.repeat(s) + '☆'.repeat(3 - s);
  if (force || $('hudStars').textContent !== stars) $('hudStars').textContent = stars;
  let h = '';
  if (sim.state === 'ready' && sim.queue.length && !aim.active) h = lastInput === 'pad' ? 'Linker Stick: zielen · Ⓐ schießen' : lastInput === 'key' ? '←/→ Winkel · ↑/↓ Kraft · Leertaste: Schuss' : 'Vogel nach hinten ziehen und loslassen';
  else if (aim.active && sim.canShoot()) h = lastInput === 'pad' ? 'Ⓐ schießen · Ⓑ abbrechen' : lastInput === 'key' ? 'Leertaste: Schuss · Esc: Pause' : 'Loslassen zum Schießen';
  else if (sim.canAbility()) { const ab = K.BIRDS[sim.flyingBird().type].ability; h = (lastInput === 'pad' ? 'Ⓐ: ' : lastInput === 'key' ? 'Leertaste: ' : 'Tippen: ') + ABILITY[ab]; }
  if (h !== lastHint) { $('hint').textContent = h; lastHint = h; }
}

// ---------- Bildschirme & Fokus-Navigation ----------
const SCREENS = ['loading', 'title', 'menu', 'worlds', 'levels', 'gallery', 'birds', 'settings', 'cloud'];
const OVERLAYS = ['confirm', 'intro', 'result', 'pause'];
let current = 'loading', focused = null, selWorld = 0;
function showScreen(id) {
  SCREENS.forEach(s => { $(s).hidden = s !== id; });
  current = id;
  if (id) { $('hud').hidden = true; if (mode === 'play') { mode = 'menu'; } }
  if (id && id !== 'loading' && id !== 'title') {
    if (!demo || !level) enterDemo();
    renderScreen(id);
    focusFirst();
  }
  renderHints();
}
function enterDemo() { buildLevel(save.last || 0, true); cam.demoT = 0; A.setMusic({ root:60, tempo:100, scale:'major' }); $('hud').hidden = true; }
function openOverlay(id) { $(id).hidden = false; if (id === 'pause' || id === 'intro' || id === 'result' || id === 'confirm') paused = true; aim.active = false; focusFirst(); renderHints(); }
function closeOverlay(id) { $(id).hidden = true; paused = OVERLAYS.some(o => !$(o).hidden); focusFirst(); renderHints(); }
function closeOverlays() { OVERLAYS.forEach(o => { $(o).hidden = true; }); paused = false; }
function activeLayer() { const o = OVERLAYS.find(x => !$(x).hidden); return o ? $(o) : current ? $(current) : null; }
function navItems() {
  const root = activeLayer(); if (!root) return [];
  return [...root.querySelectorAll('button:not([disabled]),a.btn')].filter(el => el.offsetParent !== null);
}
function setFocus(el) {
  if (focused) focused.classList.remove('focus');
  focused = el || null;
  if (!el) return;
  el.classList.add('focus');
  try { el.focus({ preventScroll:true }); } catch (_) { el.focus(); }
  el.scrollIntoView({ block:'nearest', inline:'center', behavior:'smooth' });
  if (el.classList.contains('tile')) updateHero(el.dataset.act, el.dataset.eyebrow);
}
function focusFirst() {
  const items = navItems(); if (!items.length) { setFocus(null); return; }
  const pref = items.find(el => el.classList.contains('primary') || el.dataset.pref === '1') || (current === 'menu' ? items.find(el => el.dataset.act === 'continue') : null);
  setFocus(pref || items[0]);
}
function moveFocus(dx, dy) {
  const items = navItems(); if (!items.length) return;
  if (!focused || !items.includes(focused)) { setFocus(items[0]); return; }
  const r = focused.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  let best = null, bestScore = Infinity;
  items.forEach(el => {
    if (el === focused) return;
    const q = el.getBoundingClientRect(), x = q.left + q.width / 2, y = q.top + q.height / 2, ddx = x - cx, ddy = y - cy;
    const along = dx ? ddx * dx : ddy * dy, across = dx ? Math.abs(ddy) : Math.abs(ddx);
    if (along <= 4) return;
    const sc = along + across * 2.2;
    if (sc < bestScore) { bestScore = sc; best = el; }
  });
  if (best) { setFocus(best); A.play('ui', 0, 0, 40); }
}
function goBack() {
  if (!$('confirm').hidden) { closeOverlay('confirm'); return; }
  if (!$('intro').hidden) { act('closeIntro'); return; }
  if (!$('result').hidden) { act('levels'); return; }
  if (!$('pause').hidden) { act('resume'); return; }
  if (mode === 'play') { act('pause'); return; }
  const el = current && $(current);
  if (el && el.dataset.back) { A.play('back'); showScreen(el.dataset.back); }
}
function renderHints() {
  const pad = lastInput === 'pad', key = lastInput === 'key';
  const a = pad ? '<b class="a">A</b>' : key ? '<b>Enter</b>' : '<b>👆</b>', b = pad ? '<b class="b">B</b>' : key ? '<b>Esc</b>' : '';
  const html = '<span>' + a + 'Auswählen</span>' + (b ? '<span>' + b + 'Zurück</span>' : '') + (pad || key ? '<span>' + (pad ? '<b>✚</b>' : '<b>↑↓←→</b>') + 'Navigieren</span>' : '');
  document.querySelectorAll('.hints').forEach(h => { h.innerHTML = html; });
  if (current === 'title') $('pressText').textContent = pad ? 'Drücke Ⓐ oder Start' : isTouch && !key ? 'Tippe zum Starten' : 'Drücke eine beliebige Taste';
}

function updateHero(actName, eyebrow) {
  const last = save.last, L = K.getLevel(last), W = K.WORLDS[L.world];
  const t = { continue:[levelDone(last) && last + 1 < K.LEVEL_COUNT && unlocked(last + 1) ? 'Level ' + K.getLevel(last + 1).name : 'Level ' + L.name, W.name + ' – präsentiert von ' + K.STATIONS[W.logo - 1] + '. Schnapp dir die Schleuder und mach die Schweinchen platt!'],
    worlds:['10 Senderwelten', '150 Level vom Sonnenstrand bis zur Königsburg. Jede Welt wird von einem Sender präsentiert und endet mit einem Boss-Level.'],
    gallery:['Senderwand', goldCount() + ' von 10 goldenen Sender-Kisten gefunden. ' + countLogos() + ' von 16 Senderlogos freigeschaltet.'],
    birds:['Vogelkunde', 'Alle Vögel mit Fähigkeiten, alle Schweine und die Power-ups im Überblick.'],
    settings:['Einstellungen', 'Ton, Musik, Zielhilfe, Grafikqualität, Vollbild und Vibration.'],
    cloud:['Google Cloud', 'Spielstand mit Google sichern und auf allen Geräten weiterspielen.'],
    home:['easygames', 'Zurück zur Spielesammlung.'] }[actName] || ['', ''];
  $('heroEyebrow').textContent = eyebrow || ''; $('heroTitle').textContent = t[0]; $('heroText').textContent = t[1];
}
const countLogos = () => { let n = 0; for (let i = 1; i <= 16; i++) if (logoUnlocked(i)) n++; return n; };
function renderScreen(id) {
  if (id === 'menu') {
    const ts = totalStars();
    $('statStars').textContent = ts; $('statGold').textContent = goldCount();
    $('profileLine').textContent = ts + ' ★ · ' + fmt(save.stats.pigs) + ' Schweine erledigt';
    $('menuAvatar').style.backgroundImage = 'url(' + (logoUrl[1] || '') + ')';
    tickClock();
  } else if (id === 'worlds') renderWorlds();
  else if (id === 'levels') renderLevels();
  else if (id === 'gallery') renderGallery();
  else if (id === 'birds') renderDex();
  else if (id === 'settings') renderSettings();
}
function renderWorlds() {
  $('worldsStars').textContent = totalStars();
  const list = $('worldList'); list.innerHTML = '';
  K.WORLDS.forEach((W, w) => {
    const open = unlocked(w * K.LEVELS_PER_WORLD), b = document.createElement('button');
    const c1 = '#' + new THREE.Color(W.sky[0]).getHexString(), c2 = '#' + new THREE.Color(W.hill).getHexString();
    b.className = 'world' + (open ? '' : ' locked'); b.style.background = 'linear-gradient(160deg,' + c1 + ',' + c2 + ')';
    b.dataset.act = 'world'; b.dataset.w = w; if (w === selWorld) b.dataset.pref = '1';
    b.innerHTML = '<img alt="" src="' + (logoUrl[W.logo] || '') + '"><small>WELT ' + (w + 1) + ' · ' + K.STATIONS[W.logo - 1] + '</small><h3>' + W.name + '</h3>' +
      '<div class="prog">★ ' + worldStars(w) + '/45 ' + (save.gold[w] ? ' · 📻✓' : '') + '</div>';
    list.appendChild(b);
  });
}
function renderLevels() {
  const W = K.WORLDS[selWorld];
  $('levelsEyebrow').textContent = 'WELT ' + (selWorld + 1) + ' · ' + K.STATIONS[W.logo - 1]; $('levelsTitle').textContent = W.name; $('levelsLogo').src = logoUrl[W.logo] || '';
  const grid = $('levelGrid'); grid.innerHTML = ''; let pref = null;
  for (let i = 0; i < K.LEVELS_PER_WORLD; i++) {
    const id = selWorld * K.LEVELS_PER_WORLD + i, L = K.getLevel(id), open = unlocked(id), r = save.lv[id] || [0, 0], b = document.createElement('button');
    b.className = 'lvl' + (L.boss ? ' boss' : '') + (open ? '' : ' locked'); b.dataset.act = 'level'; b.dataset.id = id; b.disabled = !open;
    b.innerHTML = '<b>' + (L.boss ? '👑' : (i + 1)) + '</b><span class="st">' + '★'.repeat(r[0]) + '<i>' + '★'.repeat(3 - r[0]) + '</i></span>' + (r[1] ? '<small>' + fmt(r[1]) + '</small>' : '') +
      (L.gold ? '<span class="gold">' + (save.gold[selWorld] ? '📻' : '❔') + '</span>' : '');
    if (open && (id === save.last || (!pref && !levelDone(id)))) pref = b;
    grid.appendChild(b);
  }
  if (pref) pref.dataset.pref = '1';
}
function renderGallery() {
  const wall = $('logoWall'); wall.innerHTML = ''; let n = 0;
  for (let i = 1; i <= 16; i++) {
    const open = logoUnlocked(i); if (open) n++;
    const wi = K.WORLDS.findIndex(W => W.logo === i), st = K.STAR_LOGOS.find(s => s.logo === i);
    const how = wi >= 0 ? 'Goldene Kiste in Welt ' + (wi + 1) : st ? st.stars + ' Sterne' : '';
    const d = document.createElement('div'); d.className = 'logo-card' + (open ? '' : ' locked');
    d.innerHTML = '<img alt="" src="' + (logoUrl[i] || '') + '"><b>' + (open ? K.STATIONS[i - 1] : '???') + '</b><small>' + (open ? (save.logoHits[i] ? save.logoHits[i] + '× als Kiste getroffen' : 'freigeschaltet') : how) + '</small>';
    wall.appendChild(d);
  }
  $('galleryCount').textContent = n;
}
function renderDex() {
  const dex = $('dex'), have = K.birdsUnlocked(Math.floor(maxUnlocked() / K.LEVELS_PER_WORLD), maxUnlocked() % K.LEVELS_PER_WORLD);
  let h = '<h3>Vögel</h3>';
  K.BIRD_ORDER.forEach(b => {
    const B = K.BIRDS[b], ok = have.includes(b);
    h += '<div class="dex-card' + (ok ? '' : ' locked') + '"><img alt="" src="' + (portraits['bird_' + b] || '') + '"><div><b>' + (ok ? B.name : '???') + '</b><p>' + (ok ? B.info : 'Wird später im Abenteuer freigeschaltet.') + '</p></div></div>';
  });
  h += '<h3>Schweine</h3>';
  Object.keys(K.PIGS).forEach(k => { const P = K.PIGS[k]; h += '<div class="dex-card"><img alt="" src="' + (portraits['pig_' + k] || '') + '"><div><b>' + P.name + '</b><p>' + P.info + '</p></div></div>'; });
  h += '<h3>Power-ups</h3>';
  POWERS.forEach(p => { h += '<div class="dex-card"><span class="pw">' + p.icon + '</span><div><b>' + p.name + ' · ' + (save.power[p.id] || 0) + '×</b><p>' + p.info + '</p></div></div>'; });
  h += '<h3>Material</h3>';
  [['glass', '🧊'], ['wood', '🪵'], ['stone', '🪨'], ['tnt', '🧨'], ['logo', '📻']].forEach(([m, ic]) => {
    const M = K.MATERIALS[m]; h += '<div class="dex-card"><span class="pw">' + ic + '</span><div><b>' + M.name + '</b><p>' + fmt(M.score) + ' Punkte beim Zerstören' + (m === 'tnt' ? ', explodiert' : '') + '.</p></div></div>';
  });
  dex.innerHTML = h;
}
const SETTINGS = [
  { key:'sound', label:'Soundeffekte', vals:[true, false], names:['An', 'Aus'] },
  { key:'music', label:'Musik', vals:[true, false], names:['An', 'Aus'] },
  { key:'aim', label:'Zielhilfe', sub:'Gepunktete Flugbahn beim Zielen', vals:[1, 2, 0], names:['Kurz', 'Lang', 'Aus'] },
  { key:'gfx', label:'Grafik', sub:'Sparsam schont Akku und ältere Geräte', vals:['auto', 'low', 'mid', 'high'], names:['Automatisch', 'Sparsam', 'Ausgewogen', 'Hoch (Schatten)'] },
  { key:'full', label:'Vollbild beim Start', vals:[true, false], names:['An', 'Aus'] },
  { key:'vibrate', label:'Vibration / Rumble', vals:[true, false], names:['An', 'Aus'] }
];
function renderSettings() {
  const list = $('settingsList'), keep = focused && focused.dataset.key; list.innerHTML = '';
  SETTINGS.forEach(s => {
    const b = document.createElement('button'), i = Math.max(0, s.vals.indexOf(save.set[s.key]));
    b.className = 'set'; b.dataset.act = 'setting'; b.dataset.key = s.key;
    b.innerHTML = '<span>' + s.label + (s.sub ? '<small>' + s.sub + '</small>' : '') + '</span><em>◀ ' + s.names[i] + ' ▶</em>';
    list.appendChild(b);
  });
  list.insertAdjacentHTML('beforeend', '<button class="set" data-act="fullscreen" data-key="fs"><span>Vollbild jetzt umschalten</span><em>⛶</em></button><button class="set danger" data-act="reset" data-key="reset"><span>Spielstand zurücksetzen<small>Löscht Sterne, Rekorde und Sammlung auf diesem Gerät</small></span><em>✕</em></button>');
  if (keep) { const el = list.querySelector('[data-key="' + keep + '"]'); if (el) setFocus(el); }
}
function changeSetting(key, dir) {
  const s = SETTINGS.find(x => x.key === key); if (!s) return;
  const i = Math.max(0, s.vals.indexOf(save.set[key])), n = s.vals.length;
  save.set[key] = s.vals[(i + (dir || 1) + n) % n]; store();
  if (key === 'sound' || key === 'music') A.setEnabled(save.set.sound, save.set.music);
  if (key === 'gfx') applyQuality();
  A.play('ui'); renderSettings();
}
let confirmFn = null;
function askConfirm(title, text, fn) { $('confirmTitle').textContent = title; $('confirmText').textContent = text; confirmFn = fn; openOverlay('confirm'); }
function tickClock() { const d = new Date(); $('clock').textContent = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }

function toggleFullscreen(force) {
  const d = document, el = d.documentElement;
  const isFs = d.fullscreenElement || d.webkitFullscreenElement;
  if (isFs && force !== true) { (d.exitFullscreen || d.webkitExitFullscreen || (() => {})).call(d); return; }
  if (isFs) return;
  const req = el.requestFullscreen || el.webkitRequestFullscreen;
  if (!req) return;
  try {
    const p = req.call(el, { navigationUI:'hide' });
    if (p && p.then) p.then(() => { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {}); }).catch(() => {});
  } catch (_) {}
}
function goHome() { try { window.open('../', '_top'); } catch (_) { location.href = '../'; } }

function act(name, el) {
  switch (name) {
    case 'continue': {
      A.play('ui');
      const last = save.last, next = levelDone(last) && last + 1 < K.LEVEL_COUNT && unlocked(last + 1) ? last + 1 : last;
      startLevel(next); break;
    }
    case 'worlds': A.play('ui'); closeOverlays(); selWorld = level ? level.world : 0; showScreen('worlds'); break;
    case 'gallery': case 'birds': case 'settings': case 'cloud': A.play('ui'); showScreen(name); break;
    case 'home': goHome(); break;
    case 'back': goBack(); break;
    case 'world': {
      const w = Number(el.dataset.w);
      if (!unlocked(w * K.LEVELS_PER_WORLD)) { A.play('back'); toast('🔒 Schließe zuerst Welt ' + w + ' ab.'); return; }
      A.play('ui'); selWorld = w; showScreen('levels'); break;
    }
    case 'level': A.play('ui'); startLevel(Number(el.dataset.id)); break;
    case 'setting': changeSetting(el.dataset.key, 1); break;
    case 'fullscreen': toggleFullscreen(); break;
    case 'reset': askConfirm('Spielstand löschen?', 'Alle Sterne, Rekorde, Senderlogos und Power-ups auf diesem Gerät werden zurückgesetzt.', () => { const set = save.set; save = defaults(); save.set = set; store(); showScreen('menu'); }); break;
    case 'confirmYes': { const fn = confirmFn; confirmFn = null; closeOverlay('confirm'); if (fn) fn(); break; }
    case 'confirmNo': closeOverlay('confirm'); break;
    case 'pause':
      if (mode !== 'play' || OVERLAYS.some(o => !$(o).hidden)) return;
      $('pauseInfo').textContent = 'Level ' + level.name + ' · ' + K.WORLDS[level.world].name + ' · ' + fmt(sim.score) + ' Punkte';
      updatePauseToggles(); openOverlay('pause'); break;
    case 'resume': closeOverlay('pause'); break;
    case 'restart': A.play('ui'); startLevel(levelId); break;
    case 'next': A.play('ui'); startLevel(levelId + 1); break;
    case 'levels': A.play('ui'); closeOverlays(); selWorld = level ? level.world : 0; showScreen('levels'); break;
    case 'mainmenu': A.play('back'); closeOverlays(); showScreen('menu'); break;
    case 'toggleSound': save.set.sound = !save.set.sound; store(); A.setEnabled(save.set.sound, save.set.music); updatePauseToggles(); break;
    case 'toggleMusic': save.set.music = !save.set.music; store(); A.setEnabled(save.set.sound, save.set.music); updatePauseToggles(); break;
    case 'overview': {
      if (mode !== 'play') return;
      const o = overview(), isOver = cam.manual && Math.abs(cam.tw - o.w) < 0.5;
      cam.manual = !isOver; if (cam.manual) { cam.tx = o.x0 + o.w / 2; cam.tw = o.w; cam.ty = viewH(o.w) / 2 - 1.2; }
      break;
    }
    case 'closeIntro': closeOverlay('intro'); if (pendingIntros.length) setTimeout(nextIntro, 250); break;
  }
}
function updatePauseToggles() { $('pauseSound').textContent = '♪ Ton ' + (save.set.sound ? 'an' : 'aus'); $('pauseMusic').textContent = '♫ Musik ' + (save.set.music ? 'an' : 'aus'); }

// ---------- Eingabe ----------
let lastInput = isTouch ? 'touch' : 'mouse';
function setInput(kind) { if (lastInput !== kind) { lastInput = kind; renderHints(); renderPowers(); } }
let started = false;
function anyStart() {
  A.init(); A.setEnabled(save.set.sound, save.set.music);
  if (current === 'title' && !started) {
    started = true;
    if (save.set.full) toggleFullscreen(true);
    A.play('ui'); showScreen('menu');
  }
}
document.addEventListener('click', ev => {
  const el = ev.target.closest('[data-act]'); if (!el || el.disabled) return;
  A.init(); act(el.dataset.act, el);
});
document.addEventListener('pointerover', ev => {
  if (ev.pointerType !== 'mouse') return;
  const el = ev.target.closest('button,a.btn'); if (el && navItems().includes(el) && el !== focused) setFocus(el);
});
document.addEventListener('contextmenu', ev => { if (mode === 'play') ev.preventDefault(); });

// Zeiger auf der Spielfläche: zielen, schwenken, zoomen, Fähigkeit
const pointers = new Map(); let pinch = null, panning = null;
function stageDown(ev) {
  setInput(ev.pointerType === 'touch' ? 'touch' : 'mouse');
  if (current === 'title') { anyStart(); return; }
  A.init();
  if (mode !== 'play' || paused) return;
  ev.preventDefault();
  try { renderer.domElement.setPointerCapture(ev.pointerId); } catch (_) {}
  pointers.set(ev.pointerId, { x:ev.clientX, y:ev.clientY });
  if (pointers.size === 2) {
    aim.active = aim.src === 'pointer' ? false : aim.active; panning = null;
    const [a, b] = [...pointers.values()]; pinch = { d:Math.hypot(a.x - b.x, a.y - b.y), w:cam.tw }; return;
  }
  if (sim.state === 'flying' && sim.canAbility()) { doAbility(); return; }
  if (sim.canShoot()) {
    const s = aim.active ? sim.shot(aim.dx, aim.dy) : { px:K.SLING.x, py:K.SLING.y };
    const bp = worldToScreen(s.px, s.py), r = worldToScreen(s.px + 1, s.py).x - bp.x;
    if (Math.hypot(ev.clientX - bp.x, ev.clientY - bp.y) < Math.max(70, r * 2.4)) {
      const w = screenToWorld(ev.clientX, ev.clientY);
      aim.active = true; aim.src = 'pointer'; aim.grabX = w.x - s.px; aim.grabY = w.y - s.py;
      aim.dx = s.px - K.SLING.x; aim.dy = s.py - K.SLING.y;
      A.play('stretch', panOf(0)); return;
    }
  }
  const w = screenToWorld(ev.clientX, ev.clientY); panning = { x:w.x, y:w.y, id:ev.pointerId };
}
function stageMove(ev) {
  if (!pointers.has(ev.pointerId)) return;
  pointers.set(ev.pointerId, { x:ev.clientX, y:ev.clientY });
  if (pinch && pointers.size >= 2) {
    const [a, b] = [...pointers.values()], d = Math.hypot(a.x - b.x, a.y - b.y);
    cam.manual = true; cam.tw = pinch.w * pinch.d / Math.max(20, d); return;
  }
  if (aim.active && aim.src === 'pointer') {
    const w = screenToWorld(ev.clientX, ev.clientY), px = w.x - aim.grabX, py = w.y - aim.grabY;
    let dx = px - K.SLING.x, dy = py - K.SLING.y; const l = Math.hypot(dx, dy), max = K.SLING.maxPull;
    if (l > max) { dx *= max / l; dy *= max / l; }
    aim.dx = dx; aim.dy = dy; return;
  }
  if (panning && panning.id === ev.pointerId) {
    const w = screenToWorld(ev.clientX, ev.clientY);
    cam.manual = true; cam.tx += panning.x - w.x; cam.ty += panning.y - w.y;
    cam.x += panning.x - w.x; cam.y += panning.y - w.y;
  }
}
function stageUp(ev) {
  if (!pointers.has(ev.pointerId)) return;
  pointers.delete(ev.pointerId);
  if (pinch && pointers.size < 2) { pinch = null; panning = null; return; }
  if (aim.active && aim.src === 'pointer') {
    const s = sim.shot(aim.dx, aim.dy);
    if (s.power < 0.15 || ev.type === 'pointercancel') aim.active = false; else fire();
  }
  if (panning && panning.id === ev.pointerId) panning = null;
}
function stageWheel(ev) {
  if (mode !== 'play' || paused) return;
  ev.preventDefault(); cam.manual = true; cam.tw *= Math.pow(1.0015, ev.deltaY);
}

// Tastatur
const keys = new Set();
document.addEventListener('keydown', ev => {
  setInput('key');
  if (current === 'title') { anyStart(); ev.preventDefault(); return; }
  A.init();
  const c = ev.code;
  if (mode === 'play' && !OVERLAYS.some(o => !$(o).hidden)) {
    keys.add(c);
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(c)) ev.preventDefault();
    if (ev.repeat) return;
    if (c === 'Space' || c === 'Enter' || c === 'NumpadEnter') {
      if (sim.state === 'flying') doAbility();
      else if (sim.canShoot()) { if (aim.active) fire(); else { aim.active = true; aim.src = 'key'; setAimFromAngle(); A.play('stretch'); } }
    } else if (c === 'Escape' || c === 'KeyP') act('pause');
    else if (c === 'KeyR') act('restart');
    else if (c === 'KeyF') toggleFullscreen();
    else if (c === 'KeyM') act('toggleMusic');
    else if (c === 'KeyV') act('overview');
    else if (/^Digit[1-5]$/.test(c)) usePower(POWERS[Number(c.slice(5)) - 1].id);
    return;
  }
  const map = { ArrowLeft:[-1, 0], ArrowRight:[1, 0], ArrowUp:[0, -1], ArrowDown:[0, 1], KeyA:[-1, 0], KeyD:[1, 0], KeyW:[0, -1], KeyS:[0, 1] };
  if (map[c]) {
    ev.preventDefault();
    if (focused && focused.dataset.act === 'setting' && map[c][0]) { changeSetting(focused.dataset.key, map[c][0]); return; }
    moveFocus(map[c][0], map[c][1]); return;
  }
  if (c === 'Enter' || c === 'Space' || c === 'NumpadEnter') { ev.preventDefault(); if (focused) focused.click(); return; }
  if (c === 'Escape' || c === 'Backspace') { ev.preventDefault(); goBack(); }
});
document.addEventListener('keyup', ev => keys.delete(ev.code));
function keyboardAim(dt) {
  if (mode !== 'play' || paused || !sim) return;
  let da = 0, dp = 0;
  if (keys.has('ArrowLeft')) da += 1; if (keys.has('ArrowRight')) da -= 1;
  if (keys.has('ArrowUp')) dp += 1; if (keys.has('ArrowDown')) dp -= 1;
  if ((da || dp) && sim.canShoot()) {
    if (!aim.active || aim.src !== 'key') { aim.kbAng = Math.atan2(-aim.dy, -aim.dx) / DEG || 35; aim.kbPow = Math.min(1, Math.hypot(aim.dx, aim.dy) / K.SLING.maxPull) || 0.85; }
    aim.active = true; aim.src = 'key';
    aim.kbAng = Math.max(-40, Math.min(85, aim.kbAng + da * 40 * dt)); aim.kbPow = Math.max(0.2, Math.min(1, aim.kbPow + dp * 0.6 * dt));
    setAimFromAngle();
  }
  const pan = (keys.has('KeyD') ? 1 : 0) - (keys.has('KeyA') ? 1 : 0), zoom = (keys.has('KeyQ') || keys.has('Minus') ? 1 : 0) - (keys.has('KeyE') || keys.has('Equal') ? 1 : 0);
  if (pan || zoom) { cam.manual = true; cam.tx += pan * cam.w * 0.8 * dt; cam.tw *= Math.pow(1.8, zoom * dt); }
}

// Controller
const padPrev = {}; let navRepeat = 0, navDir = '';
function pollGamepad(dt) {
  if (!navigator.getGamepads) return;
  const pads = navigator.getGamepads(); let pad = null;
  for (const p of pads) if (p && p.connected) { pad = p; break; }
  if (!pad) return;
  const btn = i => !!(pad.buttons[i] && (pad.buttons[i].pressed || pad.buttons[i].value > 0.5));
  const pressed = i => { const now = btn(i), was = padPrev[i]; padPrev[i] = now; return now && !was; };
  const ax = i => { const v = pad.axes[i] || 0; return Math.abs(v) < 0.18 ? 0 : v; };
  const any = pad.buttons.some(b => b && b.pressed) || pad.axes.some(a => Math.abs(a) > 0.5);
  if (any) setInput('pad');
  const A_ = pressed(0), B_ = pressed(1), X_ = pressed(2), Y_ = pressed(3), START = pressed(9), SELECT = pressed(8);
  const up = btn(12) || ax(1) < -0.5, down = btn(13) || ax(1) > 0.5, left = btn(14) || ax(0) < -0.5, right = btn(15) || ax(0) > 0.5;
  if (current === 'title') { if (A_ || START || B_) { A.init(); anyStart(); } return; }
  const overlayOpen = OVERLAYS.some(o => !$(o).hidden);
  if (mode !== 'play' || overlayOpen) {
    const dir = up ? 'u' : down ? 'd' : left ? 'l' : right ? 'r' : '';
    if (dir) {
      navRepeat -= dt;
      if (dir !== navDir || navRepeat <= 0) {
        navRepeat = dir === navDir ? 0.13 : 0.38; navDir = dir;
        const dx = dir === 'l' ? -1 : dir === 'r' ? 1 : 0, dy = dir === 'u' ? -1 : dir === 'd' ? 1 : 0;
        if (focused && focused.dataset.act === 'setting' && dx) changeSetting(focused.dataset.key, dx); else moveFocus(dx, dy);
      }
    } else { navDir = ''; navRepeat = 0; }
    if (A_) { A.init(); if (focused) focused.click(); }
    if (B_) goBack();
    if (START && mode === 'play' && !$('pause').hidden) act('resume');
    return;
  }
  // Im Spiel
  if (START) { act('pause'); return; }
  if (SELECT) { act('restart'); return; }
  const lx = ax(0), ly = ax(1), mag = Math.min(1, Math.hypot(lx, ly));
  if (sim.canShoot() && mag > 0.25) {
    aim.active = true; aim.src = 'pad';
    const f = (mag - 0.25) / 0.75; aim.dx = lx / mag * K.SLING.maxPull * Math.max(0.15, f); aim.dy = -ly / mag * K.SLING.maxPull * Math.max(0.15, f);
  }
  if (A_) {
    if (sim.state === 'flying') doAbility();
    else if (sim.canShoot()) { if (aim.active) fire(); else { aim.active = true; aim.src = 'pad'; setAimFromAngle(); } }
  }
  if (B_ && aim.active) aim.active = false;
  if (Y_) { selPower = (selPower + 1) % POWERS.length; renderPowers(); toast(POWERS[selPower].icon + ' ' + POWERS[selPower].name + ' · ' + (save.power[POWERS[selPower].id] || 0) + '× (Ⓧ einsetzen)'); }
  if (X_) usePower(POWERS[selPower].id);
  const rx = ax(2), ry = ax(3), zoom = (btn(4) || btn(6) ? 1 : 0) - (btn(5) || btn(7) ? 1 : 0);
  if (rx || ry || zoom) { cam.manual = true; cam.tx += rx * cam.w * 0.9 * dt; cam.ty -= ry * cam.w * 0.5 * dt; cam.tw *= Math.pow(1.8, zoom * dt); }
}

// ---------- Hauptschleife ----------
let lastFrame = performance.now(), frameNo = 0, clockT = 0;
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - lastFrame) / 1000); lastFrame = now;
  if (document.hidden || !renderer) return;
  pollGamepad(dt);
  const t = now / 1000;
  if (mode === 'play' && !paused && sim) {
    acc += dt; let n = 0;
    while (acc >= KS.DT && n < 4) { sim.step(); handleEvents(); acc -= KS.DT; n++; levelTime += KS.DT; }
    if (n === 4) acc = 0;
    keyboardAim(dt);
    if (sim.state !== 'ready' && aim.active) aim.active = false;
    updateHud(false);
  }
  if (mode !== 'play' && (frameNo++ & 1)) return;   // Menüs: halbe Bildrate spart Akku
  const fdt = mode !== 'play' ? dt * 2 : dt;
  if (sim) updateViews(t);
  updateCamera(fdt, t);
  updateAimDots(); updateTrail(fdt);
  debris.update(fdt); smoke.update(fdt);
  if (flash.visible) {
    const k = (t0() - flash.userData.t) / 0.35;
    if (k >= 1) flash.visible = false; else { flash.scale.setScalar(flash.userData.r * (0.3 + 0.9 * k)); flash.material.opacity = 0.85 * (1 - k); }
  }
  if (current === 'menu' && (clockT += fdt) > 10) { clockT = 0; tickClock(); }
  renderer.render(scene, camera);
}

// ---------- Hochformat-Hinweis & Sichtbarkeit ----------
let rotateDismissed = false;
function checkRotate() { $('rotate').hidden = rotateDismissed || !(mode === 'play' && isTouch && innerHeight > innerWidth * 1.15); }
$('rotate').addEventListener('click', () => { rotateDismissed = true; checkRotate(); });
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { A.suspend(true); if (mode === 'play' && !OVERLAYS.some(o => !$(o).hidden)) act('pause'); store(); }
  else A.suspend(false);
});
window.addEventListener('pagehide', store);
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', () => setTimeout(resize, 200));
window.addEventListener('gamepadconnected', () => { setInput('pad'); toast('🎮 Controller verbunden'); });

// ---------- Start ----------
function webgl() { try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl'))); } catch (_) { return false; } }
function loader(v, text) { $('loadBar').style.width = Math.round(v * 100) + '%'; $('loadPct').textContent = Math.round(v * 100) + ' %'; if (text) $('loadText').textContent = text; }
const wait = ms => new Promise(r => setTimeout(r, ms));
async function boot() {
  let tip = 0; $('loadTip').textContent = TIPS[0];
  const tipTimer = setInterval(() => { const el = $('loadTip'); el.style.opacity = 0; setTimeout(() => { tip = (tip + 1) % TIPS.length; el.textContent = TIPS[tip]; el.style.opacity = 1; }, 380); }, 3000);
  if (!THREE || !window.planck || !K || !KS || !MD || !webgl()) {
    clearInterval(tipTimer); $('fatal').hidden = false;
    if (webgl()) $('fatalText').textContent = 'Spieldateien konnten nicht geladen werden. Bitte Seite neu laden.';
    return;
  }
  try {
    loader(0.04, 'Starte 3D-Grafik …'); await wait(30);
    initRenderer(); MD.init(); initEffects();
    loader(0.18, 'Schnitze Holz, poliere Glas, behaue Stein …'); await wait(30);
    renderer.domElement.addEventListener('pointerdown', stageDown);
    renderer.domElement.addEventListener('pointermove', stageMove);
    renderer.domElement.addEventListener('pointerup', stageUp);
    renderer.domElement.addEventListener('pointercancel', stageUp);
    renderer.domElement.addEventListener('wheel', stageWheel, { passive:false });
    await loadLogos(f => loader(0.2 + f * 0.45, 'Lade Senderlogos (' + Math.round(f * 16) + '/16) …'));
    loader(0.68, 'Trainiere die Vögel …'); await wait(20);
    K.BIRD_ORDER.forEach(b => { portraits['bird_' + b] = MD.portrait(renderer, MD.makeBird(b)); });
    loader(0.78, 'Wecke die Schweine …'); await wait(20);
    Object.keys(K.PIGS).forEach(k => { portraits['pig_' + k] = MD.portrait(renderer, MD.makePig(k)); });
    loader(0.88, 'Baue die erste Welt …'); await wait(20);
    enterDemo();
    loader(1, 'Fertig!');
    requestAnimationFrame(frame);
    await wait(350);
  } catch (e) {
    console.error(e); clearInterval(tipTimer);
    $('fatal').hidden = false; $('fatalText').textContent = 'Fehler beim Start: ' + (e && e.message ? e.message : e);
    return;
  }
  clearInterval(tipTimer);
  A.setEnabled(save.set.sound, save.set.music);
  $('titleVersion').textContent = '150 Level · ' + totalStars() + ' ★';
  showScreen('title'); mode = 'title';
  document.getElementById('title').addEventListener('pointerdown', ev => { setInput(ev.pointerType === 'touch' ? 'touch' : 'mouse'); anyStart(); });
  // Debug-/Testzugang (z. B. für automatische Browser-Tests)
  window.KV = { _ws:worldToScreen, _info:() => renderer.info, get sim() { return sim; }, get mode() { return mode; }, get screen() { return current; }, startLevel, act, save:() => save };
}
boot();
})();
