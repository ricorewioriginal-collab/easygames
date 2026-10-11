/* AERU — Die Sterneninseln. Eigene Figuren, Modelle, Welt, Dialoge und Musik.
   Statisches Three.js-Abenteuer ohne Netzwerkzugriffe, Tracking oder Konto.
   Abschnitte: Einstellungen · Renderer/Qualität · Modelle · Spielstand · Audio · Welt · Quest-Anbindung · Spieler ·
   Kampf · Bosse · Kamera · Oberfläche · Eingabe · Hauptschleife · 2D-Rückfall · Testschnittstelle. */
'use strict';
(() => {
const $ = id => document.getElementById(id);
if (!window.THREE || !window.AERU_STORY || !window.AERU_QUESTS) { $('error').hidden = false; $('errorText').textContent = 'Die Spieldateien konnten nicht vollständig geladen werden. Bitte lade die Seite erneut.'; return; }
const T = THREE, TAU = Math.PI * 2, clamp = (v, a, b) => Math.max(a, Math.min(b, v)), dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const levels = window.AERU_LEVELS, story = window.AERU_STORY, Q = window.AERU_QUESTS;
const LEVEL_COUNT = levels.length, TOTAL_GEMS = LEVEL_COUNT * 24, SAVE_KEY = 'aeru-save-v1', TICK = 1 / 60;
const TEST = new URLSearchParams(location.search).has('test');
const store = {get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, v); return true; } catch { return false; } }};

// ───────── Einstellungen ─────────
const SETTINGS_KEY = 'aeru-settings';
const DEFAULTS = {volume: .8, music: true, quality: 'auto', camSens: 1, touchSens: 1, camAssist: true, flightAssist: false, guide: true,
  reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches, textSpeed: 'normal', uiSize: 'normal', perf: false};
const settings = (() => {
  const s = {...DEFAULTS};
  try {
    const raw = JSON.parse(store.get(SETTINGS_KEY));
    if (raw && typeof raw === 'object') for (const k of Object.keys(DEFAULTS)) if (typeof raw[k] === typeof DEFAULTS[k]) s[k] = raw[k];
    else if (store.get('aeru-low') === '1') s.quality = 'sparsam';
  } catch {}
  if (!['auto', 'sparsam', 'ausgewogen', 'hoch'].includes(s.quality)) s.quality = 'auto';
  s.volume = clamp(s.volume, 0, 1); s.camSens = clamp(s.camSens, .3, 2.5); s.touchSens = clamp(s.touchSens, .3, 2.5);
  if (!['normal', 'sofort'].includes(s.textSpeed)) s.textSpeed = 'normal';
  if (!['normal', 'gross'].includes(s.uiSize)) s.uiSize = 'normal';
  return s;
})();
const saveSettings = () => store.set(SETTINGS_KEY, JSON.stringify(settings));

// ───────── Renderer und Qualitätsstufen ─────────
let renderer, canvasMode = false;
try { renderer = new T.WebGLRenderer({canvas: $('world'), antialias: true, alpha: false, powerPreference: 'high-performance'}); }
catch (firstError) {
  try { renderer = new T.WebGLRenderer({canvas: $('world'), antialias: false, alpha: false, powerPreference: 'low-power'}); }
  catch (secondError) {
    // Manche WebViews bieten weder WebGL 2 noch WebGL 1. Dieselbe Spiellogik bleibt in 2D spielbar.
    let canvas = $('world'), ctx = canvas.getContext('2d');
    if (!ctx) { const fresh = canvas.cloneNode(false); canvas.replaceWith(fresh); canvas = fresh; ctx = canvas.getContext('2d'); }
    if (!ctx) { $('error').hidden = false; $('errorText').textContent = 'Diese App sperrt auch die 2D-Zeichenfläche. Bitte öffne Aeru im Browser.'; return; }
    canvasMode = true; $('graphicsNotice').hidden = false;
    let pixelRatio = 1;
    renderer = {shadowMap: {}, info: {render: {calls: 0, triangles: 0}}, setPixelRatio(n) { pixelRatio = Math.min(n, 1.5); }, getPixelRatio: () => pixelRatio,
      setSize(w, h) { canvas.width = Math.max(1, Math.round(w * pixelRatio)); canvas.height = Math.max(1, Math.round(h * pixelRatio)); canvas.style.width = w + 'px'; canvas.style.height = h + 'px'; ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0); },
      render() { drawCanvasFallback(ctx, canvas.width / pixelRatio, canvas.height / pixelRatio); }};
  }
}
const QUALITY = {
  sparsam:    {label: 'Sparsam', pr: .8, cap: 1, shadows: false, shadowSize: 512, particles: .4, clouds: 6, birds: 0},
  ausgewogen: {label: 'Ausgewogen', pr: 1, cap: 1.25, shadows: true, shadowSize: 512, particles: .7, clouds: 10, birds: 4},
  hoch:       {label: 'Hoch', pr: 1, cap: 2, shadows: true, shadowSize: 1024, particles: 1, clouds: 14, birds: 8}
};
const QUALITY_ORDER = ['sparsam', 'ausgewogen', 'hoch'];
let autoLevel = matchMedia('(pointer:coarse)').matches ? 'ausgewogen' : 'hoch', renderScale = 1, preset = QUALITY.ausgewogen;
renderer.setSize(innerWidth, innerHeight);
if (Number(T.REVISION) < 150) renderer.outputEncoding = T.sRGBEncoding; else renderer.outputColorSpace = T.SRGBColorSpace;
renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
renderer.shadowMap.type = T.PCFSoftShadowMap;
const scene = new T.Scene(), camera = new T.PerspectiveCamera(innerHeight > innerWidth ? 58 : 52, innerWidth / innerHeight, .1, 240);
// Physikalische Lichteinheiten ab r155: alte Intensitäten mal π behalten den ursprünglichen Look.
const lightScale = Number(T.REVISION) < 150 ? 1 : Math.PI;
const hemi = new T.HemisphereLight(0xe4f4ff, 0x40533d, .7 * lightScale); scene.add(hemi);
const sun = new T.DirectionalLight(0xffefd5, 1.05 * lightScale); sun.position.set(-22, 45, 28); sun.castShadow = true;
Object.assign(sun.shadow.camera, {left: -45, right: 45, top: 45, bottom: -45, near: 1, far: 110}); sun.shadow.camera.updateProjectionMatrix(); sun.shadow.bias = -.0007; scene.add(sun);
const sky = new T.Mesh(new T.SphereGeometry(180, 24, 16), new T.ShaderMaterial({side: T.BackSide, uniforms: {top: {value: new T.Color('#397f95')}, bottom: {value: new T.Color('#d5d9bf')}, dim: {value: 0}},
  vertexShader: 'varying vec3 v; void main(){v=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader: 'varying vec3 v;uniform vec3 top;uniform vec3 bottom;uniform float dim;void main(){float h=clamp(normalize(v).y*.9+.3,0.,1.);gl_FragColor=vec4(mix(bottom,top,h)*(1.-dim*.55),1.);' + (Number(T.REVISION) >= 150 ? '\n#include <colorspace_fragment>' : '') + '\n}'}));
scene.add(sky);
function applyQuality() {
  const name = settings.quality === 'auto' ? autoLevel : settings.quality;
  preset = QUALITY[name];
  const scale = settings.quality === 'auto' ? renderScale : 1;
  renderer.setPixelRatio(Math.max(.5, Math.min(devicePixelRatio || 1, preset.cap) * preset.pr * scale));
  renderer.setSize(innerWidth, innerHeight);
  const shadows = !canvasMode && preset.shadows;
  if (sun.shadow.mapSize.x !== preset.shadowSize) { sun.shadow.mapSize.set(preset.shadowSize, preset.shadowSize); if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; } }
  if (renderer.shadowMap.enabled !== shadows) { renderer.shadowMap.enabled = shadows; scene.traverse(o => { if (o.isMesh && o.material) o.material.needsUpdate = true; }); }
  clouds.forEach((c, i) => c.visible = i < preset.clouds);
  if (birds) birds.count = preset.birds;
  const label = settings.quality === 'auto' ? `Automatisch (${QUALITY[autoLevel].label}${renderScale < 1 ? ', ' + Math.round(renderScale * 100) + ' %' : ''})` : preset.label;
  setText('qualityValue', label);
}

// ───────── Materialien, Geometrien, Modelle ─────────
let world = new T.Group(); scene.add(world);
const linearColor = c => Number(T.REVISION) < 150 ? new T.Color(c).convertSRGBToLinear() : new T.Color(c);
const mats = new Map();
function mat(c, emissive = false, double = false) {
  const k = c + ':' + emissive + ':' + double;
  if (!mats.has(k)) mats.set(k, new T.MeshStandardMaterial({color: linearColor(c), roughness: .82, flatShading: true, side: double ? T.DoubleSide : T.FrontSide, ...(emissive ? {emissive: linearColor(c), emissiveIntensity: .55} : {})}));
  return mats.get(k);
}
const geos = {ball: new T.IcosahedronGeometry(1, 1), rock: new T.IcosahedronGeometry(1, 0), box: new T.BoxGeometry(1, 1, 1), cone: new T.ConeGeometry(1, 1, 7), cylinder: new T.CylinderGeometry(1, 1, 1, 10), gem: new T.OctahedronGeometry(1), disc: new T.CircleGeometry(1, 24), sphere: new T.SphereGeometry(1, 16, 12)};
const shared = new Set(Object.values(geos));
const ringGeos = new Map();
function ringGeo(r) { const k = r.toFixed(2); if (!ringGeos.has(k)) { const g = new T.TorusGeometry(r, .12, 6, 40); ringGeos.set(k, g); shared.add(g); } return ringGeos.get(k); }
let disposables = [];
const own = x => { disposables.push(x); return x; };
function mesh(shape, c, x = 0, y = 0, z = 0, sx = 1, sy = sx, sz = sx, parent = world, glow = false) {
  const m = new T.Mesh(geos[shape], mat(c, glow)); m.position.set(x, y, z); m.scale.set(sx, sy, sz); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
}
function ring(x, y, z, r, c, parent = world) { const m = new T.Mesh(ringGeo(r), mat(c, true)); m.position.set(x, y, z); parent.add(m); return m; }
const wingGeos = [-1, 1].map(s => { const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute([0, 0, 0, s * 1.8, .5, .3, s * 1.15, 0, 1.05, 0, 0, 0, s * 1.6, .85, -.3, s * 1.8, .5, .3], 3)); g.computeVertexNormals(); shared.add(g); return g; });
function dragon(c = '#46b6ad', accent = '#e8b875', scale = 1) {
  const g = new T.Group();
  mesh('ball', c, 0, .85, 0, .6, .65, .92, g); mesh('ball', '#daebc6', 0, .75, -.42, .44, .43, .47, g); mesh('ball', c, 0, 1.5, -.65, .55, .54, .6, g); mesh('ball', c, 0, 1.28, -1.12, .45, .28, .47, g); mesh('ball', '#bedcc2', 0, 1.12, -1.16, .33, .11, .3, g);
  for (const s of [-1, 1]) { mesh('ball', '#fff6d6', s * .37, 1.61, -1.02, .17, .19, .1, g); mesh('ball', '#172c36', s * .38, 1.62, -1.11, .075, .105, .035, g); mesh('cone', accent, s * .32, 2, -.44, .13, .65, .13, g).rotation.z = s * -.25; mesh('cone', c, s * .57, 1.55, -.37, .23, .6, .13, g).rotation.z = s * -.9; }
  const legs = []; for (const x of [-.4, .4]) for (const z of [-.4, .5]) { legs.push(mesh('ball', c, x, .3, z, .22, .38, .3, g)); mesh('ball', accent, x, .13, z - .15, .2, .12, .23, g); }
  const tail = new T.Group(); tail.position.set(0, .7, .6); mesh('cone', c, 0, -.02, .65, .32, 1.7, .35, tail).rotation.x = Math.PI / 2; mesh('cone', accent, 0, .06, 1.4, .21, .6, .12, tail).rotation.x = 1; g.add(tail);
  for (let i = 0; i < 5; i++) mesh('cone', accent, 0, 1.45 - i * .12, .05 + i * .3, .12, .3, .12, g);
  const wings = [];
  [-1, 1].forEach((s, i) => { const w = new T.Group(); w.position.set(s * .45, 1.1, .1); const wm = new T.Mesh(wingGeos[i], mat(accent, false, true)); wm.castShadow = true; w.add(wm); mesh('cone', c, s * .75, .25, .08, .07, 1.65, .07, w).rotation.z = s * -1.18; g.add(w); wings.push(w); });
  g.scale.setScalar(scale); g.userData = {wings, legs, tail}; return g;
}
const player = dragon(); scene.add(player);
const shadow = new T.Mesh(new T.CircleGeometry(.75, 24), new T.MeshBasicMaterial({color: 0x183940, transparent: true, opacity: .28, depthWrite: false})); shadow.rotation.x = -Math.PI / 2; scene.add(shadow);
// Zielmarkierung: ein dünner Lichtstrahl über dem aktuellen Ziel.
const beam = new T.Mesh(new T.CylinderGeometry(.18, .18, 30, 8, 1, true), new T.MeshBasicMaterial({color: 0xffe39a, transparent: true, opacity: .35, depthWrite: false, toneMapped: false})); beam.visible = false; scene.add(beam); shared.add(beam.geometry);
// Wind- und Effektgeometrie, einmal erzeugt und geteilt.
const windRingGeo = new T.TorusGeometry(.6, .07, 5, 28), windStreakGeo = new T.BoxGeometry(.075, .075, .8);
const windMat = new T.MeshBasicMaterial({color: 0x53eedb, transparent: true, opacity: .85, depthWrite: false, toneMapped: false});
const windEdgeMat = new T.MeshBasicMaterial({color: 0x156a86, transparent: true, opacity: .72, depthWrite: false, toneMapped: false});
const windWhiteMat = new T.MeshBasicMaterial({color: 0xf6ffe5, transparent: true, opacity: .95, depthWrite: false, toneMapped: false});
const warnMat = new T.MeshBasicMaterial({color: 0xff6a4d, transparent: true, opacity: .45, depthWrite: false, side: T.DoubleSide, toneMapped: false});
const waveMat = new T.MeshBasicMaterial({color: 0xf5baa1, toneMapped: false});
const shieldMat = new T.MeshBasicMaterial({color: 0x9fe8ff, transparent: true, opacity: .18, depthWrite: false, toneMapped: false});
const orbMat = new T.MeshBasicMaterial({color: 0xff8a6a, toneMapped: false});
const flightTrail = new T.Group(); scene.add(flightTrail);
const glowStreakMat = new T.MeshBasicMaterial({color: 0xffd36a, transparent: true, opacity: .95, depthWrite: false, toneMapped: false});
for (const sign of [-1, 1]) for (let i = 0; i < 4; i++) { const m = new T.Mesh(windStreakGeo, windWhiteMat); m.position.set(sign * (1.45 + i * .12), 1.1, 1 + i * .55); flightTrail.add(m); }

// ───────── Spielstand ─────────
let save = null, quests = null, loadProblem = null;
function readSave() {
  const raw = store.get(SAVE_KEY);
  if (!raw) return null;
  try { const parsed = JSON.parse(raw), result = Q.migrate(parsed, story); if (!result) loadProblem = 'unlesbar'; else if (parsed.version !== Q.SAVE_VERSION && !store.get('aeru-save-backup')) store.set('aeru-save-backup', raw); return result; }
  catch { loadProblem = 'unlesbar'; return null; }
}
let persistWarned = false;
function persist() {
  if (!save || mode === 'title' && !save.__live) return;
  save.elapsed = elapsed;
  const {__live, ...data} = save;
  if (!store.set(SAVE_KEY, JSON.stringify(data)) && !persistWarned) { persistWarned = true; toast('Speichern ist in diesem Browser gesperrt. Die Reise läuft weiter.'); }
}
const totalGems = () => save.collected.reduce((n, a) => n + a.length, 0);
const upgrade = id => totalGems() >= story.upgrades.find(u => u.id === id).gems;
const maxHp = () => 5 + (upgrade('heart1') ? 1 : 0) + (upgrade('heart2') ? 1 : 0);
const maxStamina = () => upgrade('stamina') ? 125 : 100;
const attackRange = () => upgrade('range') ? 8.5 : 7;
// Sternenglanz (alle 144 Splitter): Flügelkraft verbraucht sich nicht mehr, Aeru zieht eine goldene Spur.
let starGlow = false;
function refreshGlow() { starGlow = upgrade('glow'); for (const m of flightTrail.children) m.material = starGlow ? glowStreakMat : windWhiteMat; }

// ───────── Audio ─────────
// Ein einziger AudioContext, erst nach einer Interaktion. Musik, Effekte und Wind laufen über eigene Lautstärken.
let audio = null, master = null, musicGain = null, sfxGain = null, windGain = null, windFilter = null, noiseBuffer = null, musicTimer = 0, musicStep = 0;
function audioStart() {
  try {
    if (!audio) {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      audio = new AC(); master = audio.createGain(); master.connect(audio.destination);
      musicGain = audio.createGain(); musicGain.connect(master); sfxGain = audio.createGain(); sfxGain.connect(master);
      noiseBuffer = audio.createBuffer(1, audio.sampleRate * 2, audio.sampleRate); const data = noiseBuffer.getChannelData(0); for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const src = audio.createBufferSource(); src.buffer = noiseBuffer; src.loop = true; windFilter = audio.createBiquadFilter(); windFilter.type = 'lowpass'; windFilter.frequency.value = 700; windGain = audio.createGain(); windGain.gain.value = 0;
      src.connect(windFilter); windFilter.connect(windGain); windGain.connect(master); src.start();
      applyVolume();
    }
    if (audio.state === 'suspended' && !document.hidden) audio.resume();
  } catch {}
}
function applyVolume() { if (!audio) return; master.gain.value = settings.volume; musicGain.gain.value = settings.music ? 1 : 0; setText('volumeValue', Math.round(settings.volume * 100) + ' %'); }
function note(freq, duration = .14, vol = .04, type = 'sine', target = sfxGain) {
  if (!audio || document.hidden || audio.state !== 'running') return;
  const t = audio.currentTime, o = audio.createOscillator(), g = audio.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .015); g.gain.exponentialRampToValueAtTime(.001, t + duration);
  o.connect(g); g.connect(target); o.start(t); o.stop(t + duration + .02);
}
function whoosh(duration = .25, vol = .05, freq = 1200) {
  if (!audio || audio.state !== 'running' || document.hidden) return;
  const t = audio.currentTime, s = audio.createBufferSource(), f = audio.createBiquadFilter(), g = audio.createGain();
  s.buffer = noiseBuffer; f.type = 'bandpass'; f.frequency.setValueAtTime(freq, t); f.frequency.exponentialRampToValueAtTime(freq * .4, t + duration);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + duration); s.connect(f); f.connect(g); g.connect(sfxGain); s.start(t, Math.random()); s.stop(t + duration);
}
const chord = (list, d = .5, v = .05) => list.forEach((f, i) => setTimeout(() => note(f, d, v), i * 95));
const sfx = {
  jump: () => note(350, .18, .025), flap: () => { whoosh(.2, .05, 900); note(520, .2, .02); }, land: () => note(110, .15, .05, 'triangle'),
  step: () => note(90 + Math.random() * 20, .05, .01, 'triangle'), gem: id => note(620 + (id % 5) * 90, .25, .045),
  attack: () => { whoosh(.28, .06, 1500); note(170, .2, .03, 'triangle'); }, hit: () => note(300, .1, .04, 'square'), hurt: () => note(110, .3, .08, 'triangle'),
  right: () => chord([523, 659, 784]), wrong: () => chord([330, 277, 220], .35, .05), portal: () => { note(300, .7, .04); setTimeout(() => note(600, .6, .04), 120); setTimeout(() => note(900, .6, .035), 240); },
  story: () => chord([392, 494, 587, 784], .9, .035), checkpoint: () => note(880, .35, .025), boss: () => note(85, .6, .07, 'triangle'), warn: () => note(220, .35, .03, 'sawtooth')
};

// ───────── Weltzustand ─────────
let state, solids = [], gems = [], torches = [], enemies = [], npcs = new Map(), items = [], fallbackTrees = [], particles = [], clouds = [], checkpoints = [], updrafts = [], flightRings = [], gusts = [], waves = [], markers = [], anchors = [];
let portal, core, boss = null, birds = null, pond = null;
let time = 0, last = 0, mode = 'title', pausedFrom = 'play', elapsed = 0, lastSave = 0, accumulator = 0, dirty = false;
let camYaw = 0, camPitch = .43, camDist = innerHeight > innerWidth ? 13 : 10, camManualUntil = 0, near = null, toastUntil = 0;
let attackTime = 0, attackCooldown = 0, invulnerable = 0, attackHeld = false, jumpHeld = false, diveHeld = false, jumpHeldTime = 0, moveX = 0, moveY = 0;
const keys = new Set();
const visualPosition = new T.Vector3(), cameraTarget = new T.Vector3(), cameraGoal = new T.Vector3(), tmpVec = new T.Vector3();

// Effektpools: Partikel, Wellen, Warnkreise und Geschosse werden wiederverwendet statt pro Ereignis neu erzeugt.
const particlePool = Array.from({length: 120}, () => { const m = new T.Mesh(geos.gem, mat('#ffffff', true)); m.visible = false; scene.add(m); return {m, v: new T.Vector3(), life: 0}; });
function spark(x, y, z, c, count = 12) {
  count = Math.max(2, Math.round(count * preset.particles));
  for (const p of particlePool) {
    if (count <= 0) break; if (p.life > 0) continue;
    p.m.material = mat(c, true); p.m.position.set(x, y, z); p.m.scale.setScalar(.07); p.m.visible = true; p.v.set((Math.random() - .5) * 5, Math.random() * 4, (Math.random() - .5) * 5); p.life = .6 + Math.random() * .5; count--;
  }
}
const wavePool = Array.from({length: 6}, () => { const m = new T.Mesh(ringGeo(.5), waveMat); m.rotation.x = -Math.PI / 2; m.visible = false; scene.add(m); return m; });
const markerPool = Array.from({length: 6}, () => { const m = new T.Mesh(geos.disc, warnMat); m.rotation.x = -Math.PI / 2; m.visible = false; scene.add(m); return m; });
const orbPool = Array.from({length: 14}, () => { const m = new T.Mesh(geos.ball, orbMat); m.scale.setScalar(.35); m.visible = false; scene.add(m); return {m, vx: 0, vy: 0, vz: 0, life: 0}; });
function fireOrb(x, y, z, tx, ty, tz, speed = 7) {
  const o = orbPool.find(p => p.life <= 0); if (!o) return;
  const dx = tx - x, dy = ty - y, dz = tz - z, d = Math.hypot(dx, dy, dz) || 1;
  o.m.position.set(x, y, z); o.vx = dx / d * speed; o.vy = dy / d * speed; o.vz = dz / d * speed; o.life = 3.2; o.m.visible = true; whoosh(.3, .04, 600);
}
function clearEffects() { waves.forEach(w => w.m.visible = false); waves = []; markers.forEach(m => m.m.visible = false); markers = []; orbPool.forEach(o => { o.life = 0; o.m.visible = false; }); }

function makeGust(x, y, z, yaw) {
  const g = new T.Group(); g.position.set(x, y + 1.2, z); g.rotation.y = yaw;
  for (let i = 0; i < 4; i++) { const r = new T.Mesh(windRingGeo, i % 2 ? windWhiteMat : windMat); r.userData.offset = i; g.add(r); const border = new T.Mesh(windRingGeo, windEdgeMat); border.scale.setScalar(1.14); r.add(border); }
  for (let i = 0; i < 9; i++) { const m = new T.Mesh(windStreakGeo, i % 2 ? windMat : windWhiteMat); m.userData.angle = i / 9 * TAU; m.userData.offset = i / 9; g.add(m); }
  world.add(g); gusts.push({g, age: 0}); return g;
}
function tickGusts(dt) {
  gusts = gusts.filter(effect => {
    effect.age += dt; if (effect.age > .55) { world.remove(effect.g); return false; }
    const progress = effect.age / .55;
    effect.g.children.forEach(m => { if (m.geometry === windRingGeo) { const p = clamp(progress * 1.4 - m.userData.offset * .09, 0, 1); m.position.z = -1 - p * 6; m.rotation.z = progress * 5; const r = (.4 + p * 1.8) * Math.min(1, (1 - progress) * 5); m.scale.set(r, r, r); } else { const a = m.userData.angle + progress * 7, r = .35 + progress * 1.6; m.position.set(Math.cos(a) * r, Math.sin(a) * r, -1 - (progress + m.userData.offset * .15) * 6); m.scale.z = 1.5; } });
    return true;
  });
}
function makeUpdraft(x, z, y = 0, height = 12, temporary = false) {
  const g = new T.Group(); g.position.set(x, y, z);
  const body = new T.Mesh(own(new T.CylinderGeometry(1.7, 2, height, 16, 1, true)), own(new T.MeshBasicMaterial({color: 0x67f5d4, transparent: true, opacity: .14, depthWrite: false, side: T.DoubleSide, toneMapped: false}))); body.position.y = height / 2; g.add(body);
  for (let j = 0; j < 4; j++) { const r = new T.Mesh(windRingGeo, windMat); r.rotation.x = -Math.PI / 2; r.scale.setScalar(2.5); g.add(r); }
  world.add(g); const d = {x, z, y, height, g, temporary}; updrafts.push(d); return d;
}

// ───────── Inselbau ─────────
function island(x, z, r, y = 0) { const cfg = levels[save.level]; mesh('cylinder', cfg.grass, x, y - .6, z, r, 1.2, r); const base = mesh('cone', cfg.rock, x, y - 5.2, z, r * .99, 9, r * .99); base.rotation.z = Math.PI; solids.push({x, z, r, y, thick: 6}); for (let i = 0; i < 7; i++) { const a = i / 7 * TAU; mesh('rock', cfg.rock, x + Math.cos(a) * r * .7, y - 2.1, z + Math.sin(a) * r * .7, 3, 4, 3); } }
function platform(x, z, w, d, y) { mesh('box', levels[save.level].rock, x, y - .5, z, w, 1, d); mesh('box', levels[save.level].grass, x, y + .015, z, w + .1, .08, d + .1); solids.push({x, z, w, d, y, thick: 1}); }
function floorAt(x, z, limit = Infinity) { let y = -100; for (const s of solids) { if (s.y > limit) continue; if (s.r ? Math.hypot(x - s.x, z - s.z) < s.r - .25 : Math.abs(x - s.x) < s.w / 2 + .2 && Math.abs(z - s.z) < s.d / 2 + .2) y = Math.max(y, s.y); } return y; }
function tree(x, z, s = 1) { const cfg = levels[save.level]; fallbackTrees.push({x, z, s}); mesh('cone', '#7f7b68', x, 2 * s, z, .4 * s, 4 * s, .4 * s); for (let i = 0; i < 3; i++) mesh('ball', cfg.leaf, x + (i - 1) * .75 * s, (4 + i * .45) * s, z + (i % 2) * .4, 2.5 * s, 1.8 * s, 2 * s); }
function arch(x, z) { const c = levels[save.level].accent; for (const s of [-1, 1]) { mesh('box', c, x + s * 2.5, 2.5, z, .8, 5, .9); mesh('box', c, x + s * 2.5, .3, z, 1.3, .6, 1.4); mesh('box', c, x + s * 2.5, 5, z, 1.25, .4, 1.3); } const r = ring(x, 4.8, z, 2.5, c); r.scale.y = .6; mesh('box', c, x, 6.2, z, 5.5, .4, 1); }
const SLOTS = {keeper: {x: -4, z: 13, y: 0}, side: {x: 12, z: 9, y: 0}, helper: {x: -10, z: -12, y: 0}};
function npcModel(kind, c) {
  const g = new T.Group();
  if (kind === 'dragon') g.add(dragon(c, '#ecd49e', .9));
  else {
    mesh('ball', c, 0, .9, 0, .58, .82, .45, g); mesh('ball', '#ecdfba', 0, 1.8, -.02, .42, .44, .38, g);
    for (const s of [-1, 1]) { mesh('ball', '#243844', s * .15, 1.83, -.36, .055, .08, .04, g); mesh('ball', c, s * .58, 1.05, 0, .19, .43, .2, g); mesh('ball', '#665c57', s * .23, .15, -.03, .2, .2, .28, g); }
    if (kind === 'owl') { for (const s of [-1, 1]) { mesh('ball', '#fff0c4', s * .18, 1.84, -.32, .18, .2, .1, g); mesh('ball', '#203842', s * .18, 1.84, -.41, .075, .09, .025, g); } mesh('cone', '#ecb775', 0, 1.65, -.45, .13, .28, .12, g).rotation.x = -Math.PI / 2; }
    else { mesh('cone', c, 0, 2.32, 0, .68, .8, .65, g); mesh('cylinder', c, 0, 1.98, 0, .7, .1, .65, g); }
    mesh('cone', '#f3d69b', .72, 1.1, 0, .065, 2.2, .065, g); mesh('gem', '#b9f4d1', .72, 2.3, 0, .18, .25, .18, g, true);
  }
  return g;
}
// Figuren erscheinen dort, wo die Geschichte sie gerade braucht, und fliegen bei Ortswechseln sichtbar hinüber.
function syncNpcs(instant = false) {
  for (const [id, def] of Object.entries(story.npcs)) {
    if (!def.kind) continue;
    const place = quests.npcPlacement(id, save.level);
    let n = npcs.get(id);
    if (!place) { if (n) n.g.visible = n.marker.visible = false; if (n) n.present = false; continue; }
    const p = place.slot ? SLOTS[place.slot] : place;
    if (!n) {
      const g = npcModel(def.kind, def.color); world.add(g);
      const marker = new T.Mesh(geos.gem, mat('#ffe4a2', true)); marker.scale.set(.2, .32, .2); world.add(marker);
      n = {id, g, marker, x: p.x, y: p.y || 0, z: p.z, tx: p.x, ty: p.y || 0, tz: p.z, name: def.name, present: true}; npcs.set(id, n); instant = true;
    }
    n.present = true; n.g.visible = true; n.tx = p.x; n.ty = p.y || 0; n.tz = p.z;
    if (instant) { n.x = n.tx; n.y = n.ty; n.z = n.tz; }
  }
}
function npcMarker(id) {
  for (const a of activeSteps()) if (a.step.goal.type === 'talk' && a.step.goal.npc === id) return a.quest.kind === 'main' ? '#ffd56b' : '#9decc8';
  if (story.quests.some(q => q.giver === id && quests.status(q.id) === 'available')) return '#9decc8';
  return null;
}
const activeSteps = () => story.quests.filter(q => save.quests[q.id]?.s === 'active').map(q => ({quest: q, step: q.steps[save.quests[q.id].step], record: save.quests[q.id]}));

function buildLevel(index, titleOnly = false) {
  refreshGlow();
  if (world) scene.remove(world);
  for (const d of disposables) d.dispose(); disposables = [];
  world.traverse(o => { if (o.isMesh && !shared.has(o.geometry)) o.geometry.dispose(); if (o.isInstancedMesh) o.dispose?.(); });
  world = new T.Group(); scene.add(world);
  gusts = []; updrafts = []; flightRings = []; solids = []; gems = []; torches = []; enemies = []; npcs = new Map(); items = []; fallbackTrees = []; clouds = []; checkpoints = []; anchors = []; boss = null; birds = null; pond = null;
  clearEffects(); particlePool.forEach(p => { p.life = 0; p.m.visible = false; });
  clearInput(); accumulator = 0; save.level = index;
  const cfg = levels[index];
  sky.material.uniforms.top.value.set(cfg.sky); sky.material.uniforms.bottom.value.set(cfg.fog); sky.material.uniforms.dim.value = 0; scene.fog = new T.Fog(linearColor(cfg.fog), 65, 155);
  sun.color.set(cfg.light.sun); sun.intensity = cfg.light.sunI * lightScale; hemi.intensity = cfg.light.hemi * lightScale;
  island(0, 0, cfg.mainRadius || 27); island(37, 2, 7, 1); island(-36, -5, 6, 2);
  for (let i = 0; i < 4; i++) platform(0, -11 - i * 2.4, 5.5, 3, .75 * (i + 1)); platform(0, -20, 10, 6, 3);
  for (const [x, z, w, d, y] of cfg.extras) platform(x, z, w, d, y);
  makeUpdraft(21, 2, 0, 12); makeUpdraft(37, 2, 1, 12); makeUpdraft(-21, -5, 0, 12); makeUpdraft(-36, -5, 2, 12);
  if (index >= 3) makeUpdraft(0, 5, 0, 13);
  if (index === 4) { platform(-13, -4, 7, 7, 5); platform(12, -7, 7, 7, 7); makeUpdraft(-13, 1, 0, 14); makeUpdraft(12, -1, 0, 16); for (const [x, z] of [[-13, -4], [12, -7]]) for (let j = 0; j < 5; j++) mesh('gem', cfg.accent, x - 3 + j * 1.5, 1.2, z + 4, .65, 2.8, .65).rotation.z = (j - 2) * .15; }
  if (index === 5) { for (const sign of [-1, 1]) { for (let j = 0; j < 4; j++) platform(sign * (8 + j * 3), -2 - j * 2, 4, 4, .6 + j * .6); makeUpdraft(sign * 16, 2, 0, 14); } }
  (cfg.rings || []).forEach(([x, y, z], id) => { const got = save.rings[index].includes(id); const m = ring(x, y, z, 2.5, '#ffe9a8'); m.material = own(new T.MeshBasicMaterial({color: got ? 0x60c4a4 : 0xffd277, toneMapped: false})); m.rotation.y = id === 1 ? Math.PI / 2 : 0; flightRings.push({x, y, z, id, m, got}); });
  for (let i = 0; i < 15; i++) { const z = 19 - i * 2.5; mesh('cylinder', '#d4c9a2', Math.sin(i * .6) * 1.4, .04, z, 1.6, .06, 1.2).rotation.y = i; }
  let seed = 5432 + index * 34; const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  for (let i = 0; i < 38; i++) { const a = rand() * TAU, r = 17 + rand() * 8, x = Math.cos(a) * r, z = Math.sin(a) * r; if (floorAt(x, z) < -.1 || Math.abs(x) < 6 || dist({x, z}, {x: -14, z: -6}) < 4 || dist({x, z}, {x: 14, z: -7}) < 4 || dist({x, z}, {x: 20, z: 12}) < 3.5) continue; tree(x, z, .65 + rand() * .6); }
  for (let i = 0; i < 65; i++) { const a = rand() * TAU, r = rand() * 25, x = Math.cos(a) * r, z = Math.sin(a) * r; mesh('cone', i % 3 ? '#b4ca9d' : cfg.accent, x, .18, z, .08, .36, .08); }
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++) { const x = s * (18 + i % 2 * 3), z = -15 + i * 7; mesh('box', cfg.rock, x, 1, z, 1.2, 2 + rand() * 2, 1.3).rotation.z = s * .12; }
  if (cfg.pond) { pond = new T.Mesh(geos.disc, own(new T.MeshStandardMaterial({color: linearColor('#7fd6e6'), emissive: linearColor('#3a9fb5'), emissiveIntensity: .35, roughness: .2}))); pond.rotation.x = -Math.PI / 2; pond.scale.setScalar(2.6); pond.position.set(cfg.pond[0], .06, cfg.pond[1]); world.add(pond); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; mesh('rock', cfg.rock, cfg.pond[0] + Math.cos(a) * 2.9, .15, cfg.pond[1] + Math.sin(a) * 2.9, .5, .35, .5); } }
  arch(0, -21); portal = ring(0, 5.5, -21, 1.9, '#ffe3a4'); portal.material = own(new T.MeshStandardMaterial({color: linearColor('#ffe3a4'), emissive: linearColor('#f9c76f'), emissiveIntensity: .5}));
  core = mesh('gem', '#ffe1a0', 0, 5.2, -20, .65, 1, .65, world, true); core.visible = save.cores[index];
  const torchPos = cfg.torches || [[-14, -6, 0], [14, -7, 0], [0, -16, 2.25]];
  torchPos.forEach(([x, z, y], id) => { const lit = save.lit[index].includes(id); mesh('cylinder', cfg.accent, x, y + .7, z, .5, 1.4, .5); mesh('cone', cfg.accent, x, y + 1.45, z, .85, .5, .85).rotation.z = Math.PI; const light = mesh('gem', lit ? '#a6ffe0' : '#59647b', x, y + 2, z, .42, .7, .42, world, true); const halo = ring(x, y + 2, z, .8, '#b9ffda'); halo.visible = lit; torches.push({x, y, z, id, light, halo, lit}); });
  const gp = []; for (let i = 0; i < 10; i++) gp.push([Math.sin(i * .7) * 4, 16 - i * 2.7, 0]); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; gp.push([Math.cos(a) * 17, Math.sin(a) * 16, 0]); } gp.push([-12, -6, 0], [12, -7, 0], [0, -18, 3], [37, 0, 1], [39, 3, 1], [-36, -5, 2]);
  if (index === 3) { gp[18] = [34, 2, 1]; gp[19] = [-34, -5, 2]; } if (index === 4) { gp[18] = [-13, -4, 5]; gp[19] = [12, -7, 7]; } if (index === 5) { gp[18] = [-16, -4, 0]; gp[19] = [16, -6, 0]; }
  gp.forEach(([x, z, y], id) => { const m = mesh('gem', id % 3 ? '#b4f9d5' : '#ffe6b0', x, y + 1.1, z, .28, .48, .28, world, true); m.visible = !save.collected[index].includes(id); gems.push({x, y: y + 1.1, z, id, m, got: !m.visible}); });
  for (const it of story.items.filter(it => it.level === index)) { const m = mesh('gem', it.color, it.x, it.y + 1.2, it.z, .42, .62, .42, world, true); const b = new T.Mesh(beam.geometry, own(new T.MeshBasicMaterial({color: linearColor(it.color), transparent: true, opacity: .25, depthWrite: false, toneMapped: false}))); b.scale.set(1.4, .25, 1.4); b.position.set(it.x, it.y + 3.5, it.z); world.add(b); items.push({...it, m, b, y: it.y + 1.2}); }
  cfg.enemies.forEach((kind, i) => { const x = (i % 2 ? 1 : -1) * (7 + (i % 3) * 4), z = 9 - Math.floor(i / 2) * 6; enemies.push(makeEnemy(kind, x, z)); });
  syncNpcs(true);
  // Rastpunkte: Inselstart, oberes Tor, beide Außeninseln, inselspezifische Höhen.
  checkpoints = [{x: 0, y: 0, z: 19, start: true}, {x: 0, y: 3, z: -17.6}, {x: 36, y: 1, z: 3}, {x: -35, y: 2, z: -5}, ...cfg.checkpoints.map(([x, y, z]) => ({x, y, z}))];
  for (const c of checkpoints.slice(1)) { const m = mesh('cylinder', cfg.accent, c.x, c.y + .08, c.z, .55, .16, .55); m.castShadow = false; }
  for (let i = 0; i < 14; i++) { const a = i / 14 * TAU, x = Math.cos(a) * (65 + rand() * 30), z = Math.sin(a) * (65 + rand() * 30), y = -8 + rand() * 18; const c = new T.Group(); for (let j = 0; j < 4; j++) { const m = new T.Mesh(geos.ball, mat(index === 2 ? '#94abc3' : '#e3e5d4')); m.position.set(j * 3, 0, j % 2); m.scale.set(4.6, 1.6, 2.8); c.add(m); } c.position.set(x, y - 7, z); world.add(c); clouds.push(c); if (i % 2 === 0) { const m = mesh('cone', cfg.rock, x, y - 12, z, 6 + rand() * 7, 18, 8); m.rotation.z = Math.PI; mesh('cylinder', cfg.grass, x, y - 3, z, 8, .8, 8); } }
  for (const s of [-1, 1]) { ring(s * 28, 3, s === 1 ? 2 : -5, 1.3, '#ffe6a5').rotation.y = Math.PI / 2; tree(s === 1 ? 39 : -37, s === 1 ? 5 : -7, .7); }
  birds = new T.InstancedMesh(geos.cone, mat('#f6f0de'), 8); birds.castShadow = false; birds.frustumCulled = false; world.add(birds);
  const bossId = Object.keys(BOSSES).find(id => BOSSES[id].level === index);
  if (bossId) boss = makeBoss(bossId);
  batchScenery();
  const cp = save.checkpoint && save.checkpoint.level === index ? save.checkpoint : null;
  const sx = cp ? cp.x : 0, sy = cp ? cp.y : 0, sz = cp ? cp.z : 19;
  state = {x: sx, y: sy, z: sz, vy: 0, vx: 0, vz: 0, flight: false, draftSuppressed: false, stamina: maxStamina(), coyote: .12, jumpBuffer: 0, flapCooldown: 0, yaw: 0, hp: maxHp(), onGround: true, checkpoint: {x: sx, y: sy, z: sz}, distance: 0, dodge: 0, dodgeCooldown: 0, dodgeX: 0, dodgeZ: 0, landing: 0, jumpCut: true, jumpT: 1, stepDist: 0, cpTimer: 0};
  visualPosition.set(sx, sy, sz); cameraTarget.set(sx, sy + 1.2, sz); player.position.set(sx, sy, sz); player.visible = true; camYaw = 0; attackTime = 0; attackCooldown = 0; invulnerable = 0; near = null;
  camera.position.set(sx, sy + 7, sz + 10); applyQuality(); refreshWorld(); updateHUD();
  if (!titleOnly) { toast(cfg.name.replace(/^\d+ · /, '') + ' · ' + cfg.title); retrigger($('fade'), 'on'); }
}
// Unbewegliche Landschaft wird nach Geometrie und Material in InstancedMesh-Gruppen gebündelt (weniger Draw Calls).
function batchScenery() {
  const dynamic = new Set([core, ...gems.map(g => g.m), ...torches.map(t => t.light), ...items.map(i => i.m)]), groups = new Map();
  for (const m of [...world.children]) { if (!m.isMesh || m.isInstancedMesh || dynamic.has(m) || !Object.values(geos).includes(m.geometry)) continue; const key = m.geometry.uuid + ':' + m.material.uuid; if (!groups.has(key)) groups.set(key, []); groups.get(key).push(m); }
  for (const objects of groups.values()) { if (objects.length < 3) continue; const batch = new T.InstancedMesh(objects[0].geometry, objects[0].material, objects.length); batch.castShadow = true; batch.receiveShadow = true; objects.forEach((m, i) => { m.updateMatrix(); batch.setMatrixAt(i, m.matrix); world.remove(m); }); batch.instanceMatrix.needsUpdate = true; world.add(batch); }
}

// ───────── Quest-Anbindung ─────────
const worldApi = {
  level: () => save.level,
  playing: () => mode !== 'title',
  count: (type, level) => type === 'lantern' ? save.lit[level].length : save.rings[level].length,
  hasGem: (level, id) => save.collected[level].includes(id),
  dialog: (id, lines, done) => openDialog(id, lines, done),
  grantCore(level) { save.cores[level] = true; if (level === save.level && core) { core.visible = true; spark(0, 5, -20, '#ffe6a9', 35); } sfx.story(); toast(level === LEVEL_COUNT - 1 ? 'Horizontkern befreit · Alle sechs Leuchtkerne leuchten' : 'Leuchtkern erhalten · Das Sternentor ist offen'); persist(); },
  heal() { state.hp = maxHp(); toast('Lebensenergie aufgefüllt'); },
  questDone(q) { if (q.kind === 'side') { sfx.right(); toast('Nebenauftrag geschafft · ' + q.title); } persist(); },
  ending: () => { endingPending = true; },
  changed: () => { dirty = true; }
};
let endingPending = false;
function newEngine() { quests = Q.create(story, save, worldApi); }
// Nach jeder Fortschrittsänderung: Figuren, Story-Objekte, Laternenzustand, Anzeigen.
function refreshWorld() {
  syncNpcs();
  const wanted = quests.wantedItems(save.level);
  for (const it of items) { const show = wanted.has(it.id); it.m.visible = show; it.b.visible = show; }
  if (boss) boss.refresh();
}

// ───────── Spieler: Bewegung, Sprung, Gleiten, Flug ─────────
const COYOTE = .12, BUFFER = .14, GRAVITY = 23, JUMP = 11;
function jumpPress() {
  if (mode !== 'play') return; audioStart();
  jumpHeldTime = 0;
  if (state.flight) { flap(); return; }
  if (state.onGround || state.coyote > 0) { doJump(); return; }
  // Kurz vor der Landung wird der Druck gepuffert (Sprung bei Bodenkontakt) statt als Flügelschlag gewertet.
  const ground = floorAt(state.x, state.z, state.y + .42);
  if (state.vy < 0 && state.y - ground < .9) state.jumpBuffer = BUFFER;
  else if (state.stamina >= 12 && state.flapCooldown <= 0) { state.flight = true; state.draftSuppressed = false; flap(); }
  else state.jumpBuffer = BUFFER;
}
function doJump() { state.vy = JUMP; state.coyote = 0; state.jumpBuffer = 0; state.onGround = false; state.jumpCut = false; state.jumpT = 0; sfx.jump(); }
function flap() { if (state.stamina < 10 || state.flapCooldown > 0) return; state.vy = Math.max(state.vy, 6.5); state.stamina -= 10; state.flapCooldown = .28; sfx.flap(); }
function flight() {
  if (mode !== 'play') return; audioStart();
  if (state.flight) { state.flight = false; state.draftSuppressed = true; toast('Flügel angelegt · Landen'); return; }
  if (state.stamina < 12) { toast('Flügelkraft lädt am Boden oder im Aufwind auf.'); return; }
  state.flight = true; state.draftSuppressed = false; state.onGround = false; state.vy = Math.max(state.vy, 9); state.stamina -= 8; sfx.flap();
  if (!flight.told) { flight.told = true; toast('Flug · SPRUNG antippen: Flügelschlag · halten: steigen · Umschalt: sinken'); }
}
function dodge() {
  if (mode !== 'play' || state.dodgeCooldown > 0 || !state.onGround) return;
  const f = inputDirection();
  const dx = f.length > .1 ? f.dx : -Math.sin(state.yaw), dz = f.length > .1 ? f.dz : -Math.cos(state.yaw);
  state.dodge = .24; state.dodgeCooldown = .7; state.dodgeX = dx; state.dodgeZ = dz; invulnerable = Math.max(invulnerable, .3); whoosh(.2, .05, 700);
}
function inputDirection() {
  let x = moveX + (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0), z = moveY + (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0) - (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0);
  let length = Math.hypot(x, z); if (length < .12) { x = z = 0; length = 0; } else if (length > 1) { x /= length; z /= length; length = 1; }
  return {x, z, length, dx: x * Math.cos(camYaw) + z * Math.sin(camYaw), dz: -x * Math.sin(camYaw) + z * Math.cos(camYaw)};
}
const approach = (v, target, rate, dt) => v + (target - v) * (1 - Math.exp(-dt * rate));
function movePlayer(dt) {
  const input = inputDirection(), {dx, dz, length} = input;
  const jumpDown = jumpHeld || keys.has('Space'), shiftDown = keys.has('ShiftLeft') || keys.has('ShiftRight') || diveHeld;
  if (jumpDown) jumpHeldTime += dt;
  state.flapCooldown = Math.max(0, state.flapCooldown - dt); state.dodgeCooldown = Math.max(0, state.dodgeCooldown - dt); state.jumpBuffer = Math.max(0, state.jumpBuffer - dt); state.landing = Math.max(0, state.landing - dt);
  state.coyote = state.onGround ? COYOTE : Math.max(0, state.coyote - dt);
  if (state.jumpBuffer > 0 && (state.onGround || state.coyote > 0)) doJump();
  const air = !state.onGround, gliding = air && !state.flight && jumpDown && state.stamina > 0 && state.vy < 0;
  const flySpeed = upgrade('speed') ? 1.12 : 1;
  // Horizontale Bewegung: schnelles Anlaufen und Abbremsen am Boden, Trägheit in der Luft.
  if (state.dodge > 0) { state.dodge -= dt; state.vx = state.dodgeX * 17; state.vz = state.dodgeZ * 17; }
  else {
    let speed, rate;
    if (state.flight) { speed = (shiftDown ? 14 : 11) * flySpeed; rate = length > .05 ? 3.4 : 1.8; }
    else if (gliding) { speed = 9; rate = 4; }
    else if (air) { speed = 8; rate = 6; }
    else { speed = shiftDown ? 10.5 : 7.4; rate = length > .05 ? 16 : 22; }
    state.vx = approach(state.vx, dx * speed * length, rate, dt); state.vz = approach(state.vz, dz * speed * length, rate, dt);
  }
  // Vertikal: ein Zustand pro Situation – Boden, Sprung/Fall, Gleiten, Flug.
  if (state.flight) {
    const assist = settings.flightAssist ? .5 : 1;
    if (shiftDown) state.vy = approach(state.vy, -7.5, 4, dt);
    else if (jumpDown && jumpHeldTime > .22 && state.stamina > 0) { state.vy = approach(state.vy, 4.2, 3, dt); state.stamina = Math.max(0, state.stamina - 16 * assist * dt); }
    else state.vy = approach(state.vy, state.stamina > 0 ? -1.4 : -2.6, 2.5, dt);
  } else if (gliding) { state.vy = Math.max(-2.2, state.vy - 5 * dt); state.stamina = Math.max(0, state.stamina - 10 * dt); }
  else {
    // Variable Sprunghöhe: früh losgelassen = kleiner Hüpfer (mindestens gut eine Stufe hoch).
    state.jumpT += dt;
    if (!jumpDown && state.vy > 0 && !state.jumpCut && state.jumpT > .08) { state.vy *= .55; state.jumpCut = true; }
    state.vy -= GRAVITY * dt;
  }
  state.vy = Math.max(state.vy, -28);
  if (state.onGround && updrafts.every(d => dist(state, d) > 2.4)) state.draftSuppressed = false;
  for (const d of updrafts) if (!state.draftSuppressed && dist(state, d) < 2.15 && state.y > d.y - .2 && state.y < d.y + d.height) { state.vy = Math.max(state.vy, 8); state.flight = true; state.stamina = Math.min(maxStamina(), state.stamina + dt * 70); }
  // Seitliche Kollision nur mit dem tatsächlichen Körper der Plattform – keine unsichtbaren Wände darunter.
  let nx = state.x + state.vx * dt, nz = state.z + state.vz * dt;
  for (const s of solids) {
    if (!(s.y > state.y + .4 && state.y + 1.6 > s.y - s.thick)) continue;
    if (s.r) {
      const d = Math.hypot(nx - s.x, nz - s.z), lim = s.r + .35;
      if (d < lim && d > 0) { const ux = (nx - s.x) / d, uz = (nz - s.z) / d; nx = s.x + ux * lim; nz = s.z + uz * lim; const dot = state.vx * ux + state.vz * uz; if (dot < 0) { state.vx -= dot * ux; state.vz -= dot * uz; } }
    } else {
      const ex = s.w / 2 + .4, ez = s.d / 2 + .4;
      if (Math.abs(nx - s.x) < ex && Math.abs(nz - s.z) < ez) { if (Math.abs(state.x - s.x) >= ex) { nx = state.x; state.vx = 0; } else if (Math.abs(state.z - s.z) >= ez) { nz = state.z; state.vz = 0; } }
    }
  }
  state.x = nx; state.z = nz;
  if (length > .05 || state.dodge > 0) { const target = Math.atan2(-(state.dodge > 0 ? state.dodgeX : dx), -(state.dodge > 0 ? state.dodgeZ : dz)); state.yaw += Math.atan2(Math.sin(target - state.yaw), Math.cos(target - state.yaw)) * (1 - Math.exp(-dt * 13)); state.distance += Math.hypot(state.vx, state.vz) * dt; }
  const oldY = state.y, fallSpeed = state.vy, wasGround = state.onGround;
  state.y += state.vy * dt; const floor = floorAt(state.x, state.z, oldY + .42);
  if (state.y <= floor && state.vy <= 0) {
    state.y = floor; state.vy = 0; state.onGround = true; state.flight = false; state.jumpCut = true;
    state.stamina = Math.min(maxStamina(), state.stamina + dt * 45);
    if (!wasGround) { if (fallSpeed < -9) { state.landing = .2; sfx.land(); spark(state.x, state.y + .2, state.z, '#e9e2c8', 8); } else if (fallSpeed < -4) sfx.step(); }
  } else state.onGround = false;
  if (state.onGround && length > .1) { state.stepDist += Math.hypot(state.vx, state.vz) * dt; if (state.stepDist > 1.7) { state.stepDist = 0; sfx.step(); } }
  if (starGlow) state.stamina = maxStamina();
  if (state.y < -16) respawn('Der Wind fängt dich auf · zurück am letzten Rastpunkt');
  // Rastpunkte: Wer sicher steht, wird hier wieder aufgefangen.
  state.cpTimer -= dt;
  if (state.onGround && state.cpTimer <= 0) {
    state.cpTimer = .25;
    for (const c of checkpoints) if (Math.hypot(state.x - c.x, state.z - c.z) < 3 && Math.abs(state.y - c.y) < 1.2 && (state.checkpoint.x !== c.x || state.checkpoint.z !== c.z)) {
      state.checkpoint = {x: c.x, y: c.y, z: c.z}; save.checkpoint = {level: save.level, x: c.x, y: c.y, z: c.z}; persist();
      if (!c.start) { sfx.checkpoint(); toast('Rastpunkt erreicht'); }
    }
  }
  animatePlayer(dt, input, gliding || state.flight);
}
function animatePlayer(dt, input, gliding) {
  const {x, length} = input;
  player.rotation.y = state.yaw; player.rotation.z = gliding ? clamp(-x * .15, -.18, .18) : Math.sin(state.distance * 2) * Math.min(length, .7) * .03;
  player.rotation.x = approach(player.rotation.x, state.dodge > 0 ? -.35 : gliding ? -.08 : 0, 8, dt);
  const squash = state.landing > 0 ? 1 - state.landing * 1.2 : 1; player.scale.set(1 / Math.sqrt(squash), squash, 1 / Math.sqrt(squash));
  player.visible = invulnerable <= .3 || Math.floor(time * 12) % 2 === 0;
  player.userData.wings.forEach((w, i) => { const flapping = state.vy > 1 && !state.onGround; const target = (i ? 1 : -1) * (gliding || flapping ? -.18 + Math.sin(time * (flapping ? 13 : 4)) * (flapping ? .45 : .08) : .5 + Math.sin(time * 3) * .16); w.rotation.z = approach(w.rotation.z, target, 12, dt); });
  player.userData.tail.rotation.y = Math.sin(time * 5) * .15;
  player.userData.legs.forEach((l, i) => l.rotation.x = state.onGround && length > .1 ? Math.sin(state.distance * 2.4 + i * 2) * .45 : -.15);
  flightTrail.visible = (gliding || starGlow && !state.onGround) && Math.hypot(state.vx, state.vz) > 2; flightTrail.position.set(state.x, state.y, state.z); flightTrail.rotation.y = state.yaw;
}
function respawn(message) {
  const max = maxHp();
  Object.assign(state, state.checkpoint, {vy: 0, vx: 0, vz: 0, flight: false, draftSuppressed: false, stamina: maxStamina(), onGround: true, hp: state.hp > 0 ? state.hp : max, dodge: 0});
  if (state.hp <= 0) state.hp = max;
  invulnerable = 2; clearEffects(); if (boss) boss.onRespawn();
  visualPosition.set(state.x, state.y, state.z); camera.position.set(state.x, state.y + 7, state.z + 10);
  toast(message || 'Zurück auf sicherem Boden · Fortschritt behalten'); updateHUD();
}

// ───────── Kampf und Gegner ─────────
const ENEMY = {
  kaefer:   {hp: 2, notice: 8.5, windup: .75, dash: 10, color: '#43516a', eye: '#f7a18f', label: 'Nebelkäfer'},
  funke:    {hp: 2, notice: 10, windup: .9, color: '#e9b54e', eye: '#fff4c2', label: 'Sturmfunke'},
  schatten: {hp: 2, notice: 9, windup: .65, dash: 11, color: '#2b2744', eye: '#c8a6ff', label: 'Stille-Schatten'}
};
function makeEnemy(kind, x, z) {
  const def = ENEMY[kind], g = new T.Group(), body = new T.Group(); g.add(body);
  if (kind === 'funke') { mesh('gem', def.color, 0, 1.4, 0, .45, .6, .45, body, true); const r = ring(0, 1.4, 0, .5, '#fff1b8', body); r.rotation.x = Math.PI / 2; for (const s of [-1, 1]) mesh('ball', def.eye, s * .16, 1.5, -.35, .08, .08, .05, body, true); }
  else { mesh('rock', def.color, 0, .65, 0, .75, .7, .65, body); for (const s of [-1, 1]) { mesh('gem', def.eye, s * .24, .8, -.55, .12, .1, .08, body, true); mesh('cone', kind === 'schatten' ? '#4a3f6e' : '#70738d', s * .5, 1.3, .05, .18, .8, .18, body); } }
  const warn = mesh('gem', '#ff6a4d', 0, 2.4, 0, .16, .3, .16, g, true); warn.visible = false;
  g.position.set(x, 0, z); world.add(g);
  return {kind, def, g, body, warn, x, z, homeX: x, homeZ: z, hp: def.hp, state: 'patrol', t: 0, cool: 1 + Math.random(), dirX: 0, dirZ: 0, pulse: 0, respawn: 0};
}
function hitEnemy(e, fx, fz) {
  if (e.kind === 'schatten' && e.state !== 'recover' && e.state !== 'dash') {
    // Schatten weichen direkten Angriffen aus und sind erst nach ihrem Sprung verwundbar.
    const side = Math.random() < .5 ? -1 : 1; e.x += -fz * side * 2.4; e.z += fx * side * 2.4; spark(e.x, 1, e.z, '#8e7fc4', 6); whoosh(.15, .03, 500);
    if (!hitEnemy.told) { hitEnemy.told = true; toast('Der Schatten weicht aus · warte, bis er springt'); }
    return;
  }
  e.hp--; e.pulse = .18; e.x += fx * 2; e.z += fz * 2; spark(e.x, 1, e.z, '#e2d4a9'); sfx.hit();
  if (e.state === 'windup') { e.state = 'recover'; e.t = .8; e.warn.visible = false; }
  if (e.hp <= 0) { e.state = 'dead'; e.g.visible = false; e.respawn = 20; note(550, .22, .03); quests.emit({type: 'enemy', level: save.level, kind: e.kind}); }
}
function updateEnemies(dt) {
  for (const e of enemies) {
    if (e.state === 'dead') { e.respawn -= dt; if (e.respawn <= 0 && Math.hypot(state.x - e.homeX, state.z - e.homeZ) > 14) { Object.assign(e, {state: 'patrol', hp: e.def.hp, x: e.homeX, z: e.homeZ, cool: 2}); e.g.visible = true; } continue; }
    const d = dist(state, e), level = Math.abs(state.y) < 2.2, dx = (state.x - e.x) / Math.max(d, .1), dz = (state.z - e.z) / Math.max(d, .1);
    e.t -= dt; e.cool -= dt; e.pulse = Math.max(0, e.pulse - dt);
    if (e.state === 'patrol') {
      if (e.kind === 'funke' && d < e.def.notice && level) { const want = d < 5 ? -1 : d > 8 ? 1 : 0; e.x += dx * want * 2.4 * dt; e.z += dz * want * 2.4 * dt; }
      else { const hx = e.homeX + Math.sin(time * .6 + e.homeX) * 1.7, hz = e.homeZ + Math.cos(time * .6 + e.homeX) * 1.7; e.x = approach(e.x, hx, 1.6, dt); e.z = approach(e.z, hz, 1.6, dt); }
      if (d < e.def.notice && level && e.cool <= 0 && mode === 'play') { e.state = 'windup'; e.t = e.def.windup; e.dirX = dx; e.dirZ = dz; e.warn.visible = true; if (d < 12) sfx.warn(); }
    } else if (e.state === 'windup') {
      if (e.t <= 0) {
        e.warn.visible = false;
        if (e.kind === 'funke') { fireOrb(e.x, 1.4, e.z, state.x, state.y + 1, state.z, 7); e.state = 'recover'; e.t = 1.4; }
        else { e.state = 'dash'; e.t = .45; }
      }
    } else if (e.state === 'dash') {
      e.x += e.dirX * e.def.dash * dt; e.z += e.dirZ * e.def.dash * dt;
      if (d < 1.15 && state.y < 1.6) hurt(e.dirX, e.dirZ);
      if (e.t <= 0) { e.state = 'recover'; e.t = 1.2; }
    } else if (e.state === 'recover' && e.t <= 0) { e.state = 'patrol'; e.cool = 1.4 + Math.random(); }
    // Auf der Insel bleiben.
    const r = Math.hypot(e.x, e.z), maxR = (levels[save.level].mainRadius || 27) - 2; if (r > maxR) { e.x *= maxR / r; e.z *= maxR / r; }
    if (e.state !== 'dash' && d < 1.1 && state.y < 1.6) { state.vx += dx * 4; state.vz += dz * 4; }
    const hover = e.kind === 'funke' ? .4 + Math.sin(time * 3 + e.homeX) * .25 : .1 + Math.sin(time * 4 + e.homeX) * .15;
    e.g.position.set(e.x, hover, e.z); e.g.rotation.y = e.state === 'dash' ? Math.atan2(-e.dirX, -e.dirZ) : Math.atan2(e.x - state.x, e.z - state.z);
    e.body.rotation.z = e.state === 'windup' ? Math.sin(time * 50) * .18 : e.state === 'recover' ? Math.sin(time * 8) * .25 : 0;
    e.body.scale.setScalar(1 + e.pulse * 1.4 + (e.state === 'windup' && e.kind === 'funke' ? (1 - e.t / e.def.windup) * .35 : 0));
  }
  for (const o of orbPool) {
    if (o.life <= 0) continue; o.life -= dt; o.m.position.x += o.vx * dt; o.m.position.y += o.vy * dt; o.m.position.z += o.vz * dt;
    if (o.m.position.distanceTo(tmpVec.set(state.x, state.y + 1, state.z)) < .9) { o.life = 0; hurt(o.vx, o.vz); }
    if (o.life <= 0) o.m.visible = false;
  }
}
function strike() {
  if (mode !== 'play' || attackCooldown > 0) return; audioStart();
  attackCooldown = .45; attackTime = .42; sfx.attack();
  const fx = -Math.sin(state.yaw), fz = -Math.cos(state.yaw), range = attackRange();
  makeGust(state.x, state.y, state.z, state.yaw); spark(state.x + fx, state.y + 1.2, state.z + fz, '#c0ffea', 14);
  const facing = (x, z, r) => { const dx = x - state.x, dz = z - state.z, d = Math.hypot(dx, dz); return d < r && (d < 1.2 || (dx * fx + dz * fz) / d > .6); };
  for (const t of torches) if (!t.lit && Math.abs(state.y - t.y) < 3 && facing(t.x, t.z, range)) { if (!lightLantern(t)) break; }
  for (const e of enemies) if (e.state !== 'dead' && Math.abs(state.y) < 2.7 && facing(e.x, e.z, range)) hitEnemy(e, fx, fz);
  for (const o of orbPool) if (o.life > 0 && facing(o.m.position.x, o.m.position.z, 5) && Math.abs(o.m.position.y - state.y - 1) < 2.5) { o.life = 0; o.m.visible = false; spark(o.m.position.x, o.m.position.y, o.m.position.z, '#ffd9c2', 6); }
  if (boss) boss.strike(facing, range);
  updateHUD();
}
// Laternen: normal, stumm (Rätsel noch nicht dran) oder in fester Reihenfolge. Gibt false zurück, wenn weitere Treffer abbrechen sollen.
function lightLantern(t) {
  const L = save.level, rule = quests.lanternRule(L);
  if (rule.mute) { if (time > (lightLantern.muteUntil || 0)) { lightLantern.muteUntil = time + 3; toast('Die Laterne bleibt stumm. Oru weiß vielleicht, warum.'); } return false; }
  if (rule.order && t.id !== rule.order[save.lit[L].length]) {
    for (const o of torches) setLantern(o, false); save.lit[L] = []; sfx.wrong(); toast('Das Lied bricht ab · Morgen im Osten, Abend im Westen, Nacht oben'); persist(); return false;
  }
  setLantern(t, true); save.lit[L].push(t.id); spark(t.x, t.y + 2, t.z, '#c1ffe7', 22);
  rule.order ? (save.lit[L].length === 3 ? sfx.right() : note(523 + save.lit[L].length * 130, .5, .05)) : sfx.right();
  toast(rule.order ? ['Der Morgen erwacht', 'Der Abend antwortet', 'Die Nacht singt mit'][save.lit[L].length - 1] + ' ✧' : `Windlaterne erwacht ✧ ${save.lit[L].length} / 3`);
  persist(); quests.emit({type: 'lantern', level: L}); return true;
}
function setLantern(t, lit) { t.lit = lit; t.light.material = mat(lit ? '#a6ffe0' : '#59647b', true); t.halo.visible = lit; }
function hurt(kx = 0, kz = 0) {
  if (invulnerable > 0 || mode !== 'play') return;
  state.hp--; invulnerable = 1.3; sfx.hurt(); spark(state.x, state.y + 1, state.z, '#ffb4a2');
  const k = Math.hypot(kx, kz) || 1; state.vx += kx / k * 7; state.vz += kz / k * 7; if (state.onGround) state.vy = 5;
  retrigger($('vignette'), 'hurt');
  if (state.hp <= 0) { state.hp = 0; respawn('Der Wind fängt dich auf. Versuch es noch einmal.'); }
  updateHUD();
}

// ───────── Bosse ─────────
// Erkennbare Phasen, sichtbare Warnungen, faire Ausweichfenster. Tod setzt nur auf den Beginn der aktuellen Phase zurück.
const BOSSES = {
  vesper: {level: 2, hp: 6, name: 'VESPER · DER SAMMLER', intro: 'c3_vesper_intro', center: {x: 0, y: 3, z: -22},
    phases: [{from: 6, waves: 1, open: 2.6, rest: 1.2}, {from: 4, waves: 1, open: 2.3, rest: 2.2, markers: 3, dialog: 'c3_vesper_phase2'}, {from: 2, waves: 2, open: 2.2, rest: 2.0, markers: 2, dialog: 'c3_vesper_phase3'}]},
  stille: {level: 5, hp: 9, name: 'DIE STILLE', intro: 'c6_stille_intro', center: {x: 0, y: 3, z: -22},
    phases: [{from: 9, waves: 1, open: 2.4, rest: 1.4}, {from: 6, anchors: true, dialog: 'c6_stille_phase2'}, {from: 3, waves: 2, open: 3.2, rest: 1.6, markers: 2, dialog: 'c6_stille_phase3'}]}
};
const ANCHORS = [{x: -8, y: 9, z: -16}, {x: 8, y: 9, z: -16}, {x: 0, y: 10, z: -26}];
const inArena = () => Math.abs(state.x) < 5.4 && state.z < -16.7 && state.z > -23.3 && state.y > 2.4;
function makeBoss(id) {
  const def = BOSSES[id], c = def.center, g = new T.Group(); g.position.set(c.x, c.y, c.z); world.add(g);
  let model;
  if (id === 'vesper') { model = dragon('#514e77', '#b6bedb', 2.1); g.add(model); }
  else { model = new T.Group(); const darkMat = own(new T.MeshStandardMaterial({color: 0x1d1830, emissive: 0x2c1f55, emissiveIntensity: .6, transparent: true, opacity: .88, flatShading: true})); for (let i = 0; i < 9; i++) { const m = new T.Mesh(geos.ball, darkMat); const a = i / 9 * TAU; m.position.set(Math.cos(a) * 1.6, 2.4 + Math.sin(i * 1.7) * .8, Math.sin(a) * 1.2); m.scale.setScalar(1.2 + (i % 3) * .35); model.add(m); } const captive = dragon('#6a5f9e', '#c9b8f0', .8); captive.position.set(0, 1.8, 0); model.add(captive); model.userData.wings = []; g.add(model); }
  const shield = new T.Mesh(geos.sphere, shieldMat); shield.scale.setScalar(id === 'vesper' ? 3.4 : 4); shield.position.y = 2.2; g.add(shield);
  const b = {id, def, g, model, shield, hp: Math.max(1, save.boss[id] || def.hp), phase: 0, state: 'idle', t: 0, active: false, hit: 0, introDone: false, phaseStart: def.hp, wavesLeft: 0, waveT: 0, markerLeft: 0, markerT: 0, orbT: 0, rise: 0};
  b.phaseIndex = () => { let p = 0; def.phases.forEach((ph, i) => { if (b.hp <= ph.from) p = i; }); return p; };
  b.done = () => save.flags['boss:' + id] === true;
  b.refresh = () => { g.visible = !b.done(); if (b.done()) { b.active = false; b.state = 'idle'; clearAnchors(); } };
  b.start = () => {
    b.active = true; b.phase = b.phaseIndex(); b.phaseStart = def.phases[b.phase].from; b.hp = Math.min(b.hp, b.phaseStart); b.state = 'rest'; b.t = 1.6;
    state.checkpoint = {x: 0, y: 3, z: -17.6}; save.checkpoint = {level: save.level, x: 0, y: 3, z: -17.6};
    if (def.phases[b.phase].anchors) spawnAnchors();
    if (!b.introDone) { b.introDone = true; openDialog(def.intro, quests.lines(def.intro), () => {}); }
  };
  b.onRespawn = () => { if (!b.active) return; b.hp = b.phaseStart; save.boss[id] = b.hp; b.state = 'rest'; b.t = 2.5; b.hit = 0; if (def.phases[b.phase].anchors) spawnAnchors(); };
  b.strike = (facing, range) => {
    if (b.done()) return;
    const c3 = def.center;
    if (def.phases[b.phase].anchors && b.active) {
      for (const a of anchors) if (!a.broken && Math.abs(state.y - a.y) < 2.6 && Math.hypot(state.x - a.x, state.z - a.z) < range && facing(a.x, a.z, range)) {
        a.broken = true; a.m.visible = false; spark(a.x, a.y, a.z, '#d7c8ff', 26); sfx.hit(); damage(1);
      }
      return;
    }
    if (!facing(c3.x, c3.z, range + 1) || Math.abs(state.y - c3.y) > 3.2) return;
    if (!b.active || b.state !== 'open') { if (time > (b.toldT || 0)) { b.toldT = time + 2.5; toast(b.active ? 'Der Schild ist geschlossen · warte, bis er sich öffnet' : (id === 'vesper' ? 'Vespers Rüstung schluckt den Wind.' : 'Die Stille schluckt den Wind.')); } return; }
    if (b.hit > 0) return;
    b.hit = .5; spark(c3.x, c3.y + 2, c3.z, '#fff0c0', 30); sfx.right(); damage(1);
  };
  function damage(n) {
    b.hp = Math.max(0, b.hp - n); save.boss[id] = b.hp; persist();
    if (b.hp <= 0) { finish(); return; }
    const p = b.phaseIndex();
    if (p !== b.phase) {
      b.phase = p; b.phaseStart = def.phases[p].from; clearEffects(); clearAnchors();
      const ph = def.phases[p]; b.state = 'rest'; b.t = 2;
      if (ph.anchors) spawnAnchors();
      if (ph.dialog) openDialog(ph.dialog, quests.lines(ph.dialog), () => {});
      toast(`Phase ${p + 1} · ${ph.anchors ? 'Zerstöre die Anker über den Aufwinden' : ph.markers ? 'Achte auf die roten Kreise am Boden' : 'Wellen überspringen'}`);
    } else if (b.state === 'open' && !def.phases[p].anchors) { b.state = 'rest'; b.t = def.phases[p].rest; }
  }
  function finish() {
    b.active = false; b.state = 'idle'; save.flags['boss:' + id] = true; save.boss[id] = 0; clearEffects(); clearAnchors(); g.visible = false;
    spark(def.center.x, def.center.y + 2, def.center.z, '#ffe6a9', 40); sfx.story(); persist(); quests.emit({type: 'boss', id, level: save.level});
  }
  function spawnAnchors() {
    clearAnchors();
    for (const a of ANCHORS) { const m = mesh('gem', '#9b7fe6', a.x, a.y, a.z, .7, 1.1, .7, world, true); const d = makeUpdraft(a.x, a.z, 0, a.y + 1, true); anchors.push({...a, m, d, broken: false}); }
  }
  function clearAnchors() { for (const a of anchors) { world.remove(a.m); world.remove(a.d.g); updrafts = updrafts.filter(u => u !== a.d); } anchors = []; }
  b.update = dt => {
    const c3 = def.center;
    model.position.y = approach(model.position.y, b.rise, 3, dt);
    if (b.done()) return;
    if (!b.active) {
      model.rotation.y = Math.atan2(c3.x - state.x, c3.z - state.z); shield.visible = true;
      if (quests.wants('boss', id, save.level) && inArena() && mode === 'play') b.start();
      return;
    }
    if (dist(state, c3) > 16 && !anchors.length) { b.active = false; b.state = 'idle'; clearEffects(); b.rise = 0; return; }
    const ph = def.phases[b.phase];
    b.t -= dt; b.hit = Math.max(0, b.hit - dt);
    model.rotation.y = Math.atan2(c3.x - state.x, c3.z - state.z);
    (model.userData.wings || []).forEach((w, i) => w.rotation.z = (i ? 1 : -1) * (.5 + Math.sin(time * (b.state === 'windup' ? 9 : 3)) * .3));
    shield.visible = b.state !== 'open';
    if (ph.anchors) {
      b.rise = 7; shield.visible = true;
      b.orbT -= dt; if (b.orbT <= 0) { b.orbT = 3.2; b.warnOrb = .8; sfx.warn(); }
      if (b.warnOrb > 0) { b.warnOrb -= dt; model.scale.setScalar(1 + (.8 - b.warnOrb) * .15); if (b.warnOrb <= 0) { model.scale.setScalar(1); fireOrb(c3.x, c3.y + b.rise + 2.4, c3.z, state.x, state.y + 1, state.z, 6); } }
      for (const a of anchors) if (a.m.visible) { a.m.rotation.y = time * 2; a.m.position.y = a.y + Math.sin(time * 2 + a.x) * .2; }
      return;
    }
    b.rise = b.state === 'windup' ? .6 : 0;
    if (b.state === 'rest' && b.t <= 0) { b.state = 'windup'; b.t = .9; sfx.warn(); }
    else if (b.state === 'windup' && b.t <= 0) { b.state = 'waves'; b.wavesLeft = ph.waves; b.waveT = 0; }
    else if (b.state === 'waves') {
      b.waveT -= dt;
      if (b.waveT <= 0 && b.wavesLeft > 0) { const m = wavePool.find(w => !w.visible); if (m) { m.visible = true; m.position.set(c3.x, c3.y + .15, c3.z); m.scale.setScalar(1); waves.push({m, r: .5, hit: false}); } sfx.boss(); b.wavesLeft--; b.waveT = .75; }
      if (b.wavesLeft === 0 && b.waveT <= .4) { b.state = 'open'; b.t = ph.open; note(660, .4, .03); }
    } else if (b.state === 'open' && b.t <= 0) { b.state = 'rest'; b.t = ph.rest; b.markerLeft = ph.markers || 0; b.markerT = .3; }
    if (b.state === 'rest' && b.markerLeft > 0) { b.markerT -= dt; if (b.markerT <= 0) { b.markerLeft--; b.markerT = .55; const m = markerPool.find(k => !k.visible); if (m) { m.visible = true; m.position.set(state.x, state.y + .05, state.z); m.scale.setScalar(1.6); markers.push({m, x: state.x, y: state.y, z: state.z, t: 1.1}); sfx.warn(); } } }
  };
  b.refresh();
  return b;
}
function updateBossEffects(dt) {
  if (boss) boss.update(dt);
  const c3 = boss ? boss.def.center : {x: 0, z: -22};
  for (const w of waves) { w.r += dt * 7; w.m.scale.setScalar(w.r / .5); const d = Math.hypot(state.x - c3.x, state.z - c3.z); if (!w.hit && Math.abs(d - w.r) < .65 && state.y < 4.2 && state.y > 1.8) { w.hit = true; hurt(state.x - c3.x, state.z - c3.z); } }
  waves = waves.filter(w => { if (w.r > 30) { w.m.visible = false; return false; } return true; });
  for (const k of markers) { k.t -= dt; k.m.material.opacity = .25 + Math.sin(time * 18) * .2; if (k.t <= 0) { spark(k.x, k.y + .5, k.z, '#ffb38f', 14); whoosh(.25, .06, 400); if (Math.hypot(state.x - k.x, state.z - k.z) < 1.6 && Math.abs(state.y - k.y) < 2) hurt(state.x - k.x, state.z - k.z); k.m.visible = false; } }
  markers = markers.filter(k => k.t > 0);
}

// ───────── Sammeln, Ringe, Story-Objekte, Interaktion ─────────
function pickups() {
  for (const r of flightRings) if (!r.got && Math.hypot(state.x - r.x, state.z - r.z) < 2.7 && Math.abs(state.y + 1 - r.y) < 2.6) {
    r.got = true; r.m.material.color.setHex(0x60c4a4); save.rings[save.level].push(r.id); state.stamina = maxStamina(); sfx.right(); spark(r.x, r.y, r.z, '#fff2a7', 20);
    toast(`Himmelsring ${save.rings[save.level].length} / 3 · Flügelkraft aufgefüllt`); persist(); quests.emit({type: 'ring', level: save.level});
  }
  for (const g of gems) if (!g.got && Math.hypot(state.x - g.x, state.z - g.z) < 1.2 && Math.abs(state.y + .9 - g.y) < 1.8) {
    const before = totalGems(); g.got = true; g.m.visible = false; save.collected[save.level].push(g.id); sfx.gem(g.id); spark(g.x, g.y, g.z, '#c9ffdd', 7);
    const unlocked = story.upgrades.find(u => before < u.gems && totalGems() >= u.gems);
    if (unlocked) { sfx.story(); toast('Neue Fähigkeit · ' + unlocked.text); state.hp = maxHp(); state.stamina = maxStamina(); refreshGlow(); }
    else if (totalGems() % 6 === 0 && state.hp < maxHp()) { state.hp++; toast('Sechs Splitter · Ein Herz aufgefüllt'); }
    persist(); quests.emit({type: 'gem', level: save.level}); updateHUD();
  }
  for (const it of items) if (it.m.visible && Math.hypot(state.x - it.x, state.z - it.z) < 1.5 && Math.abs(state.y + .9 - it.y) < 2) {
    it.m.visible = false; it.b.visible = false; sfx.story(); spark(it.x, it.y, it.z, it.color, 20); toast('Gefunden · ' + it.label); quests.emit({type: 'item', id: it.id, level: save.level}); persist();
  }
}
const PORTAL = {x: 0, z: -21};
function findNear() {
  let found = null, nd = 3.7;
  for (const n of npcs.values()) { if (!n.present) continue; const d = dist(state, n); if (d < nd && Math.abs(state.y - n.y) < 2) { found = n; nd = d; } }
  if (!found && dist(state, PORTAL) < 3.8 && state.y > 2) found = 'portal';
  return found;
}
function talk() {
  if (mode === 'dialog') { advance(); return; }
  if (mode !== 'play' || !near) return; audioStart();
  if (near === 'portal') {
    if (save.cores[save.level]) { sfx.portal(); travel((save.level + 1) % LEVEL_COUNT); }
    else openDialog('gate_closed', quests.lines('gate_closed'), () => {});
    return;
  }
  const n = near; n.g.rotation.y = Math.atan2(n.x - state.x, n.z - state.z);
  quests.talk(n.id);
}
function travel(index) {
  if (index < 0 || index >= LEVEL_COUNT || !(index === 0 || save.cores[index - 1])) return false;
  persist(); resetDialogs(); $('pauseMenu').hidden = true; save.checkpoint = null; mode = 'play'; clearInput(); buildLevel(index); persist(); quests.refresh(); return true;
}

// ───────── Kamera ─────────
function updateCamera(dt) {
  tmpVec.set(state.x, state.y, state.z); visualPosition.lerp(tmpVec, 1 - Math.exp(-dt * 24)); player.position.copy(visualPosition);
  // Kamerahilfe: Rückkehr hinter Aeru, wenn der Spieler die Kamera eine Weile nicht bewegt hat.
  if (settings.camAssist && time > camManualUntil && mode === 'play') {
    const input = inputDirection(), moving = Math.hypot(state.vx, state.vz) > 2;
    if (moving && (state.flight || Math.abs(input.x) < .35)) { const diff = Math.atan2(Math.sin(state.yaw - camYaw), Math.cos(state.yaw - camYaw)); camYaw += diff * (1 - Math.exp(-dt * (state.flight ? 1.4 : .7))); }
  }
  const lookY = visualPosition.y + 1.4 + (state.flight ? .6 : 0);
  cameraTarget.x = approach(cameraTarget.x, visualPosition.x, 9, dt); cameraTarget.y = approach(cameraTarget.y, lookY, 6, dt); cameraTarget.z = approach(cameraTarget.z, visualPosition.z, 9, dt);
  const distance = camDist + (state.flight ? 2.5 : 0), pitch = camPitch + (state.flight ? .05 : 0);
  cameraGoal.set(cameraTarget.x + Math.sin(camYaw) * distance * Math.cos(pitch * .5), cameraTarget.y + 1.7 + Math.sin(pitch) * distance, cameraTarget.z + Math.cos(camYaw) * distance * Math.cos(pitch * .5));
  // Hindernisse: Die Kamera bleibt über Boden und Plattformen und kriecht nicht in Inseln.
  const ground = floorAt(cameraGoal.x, cameraGoal.z, cameraTarget.y + 2.5);
  if (cameraGoal.y < ground + .9) cameraGoal.y = ground + .9;
  camera.position.lerp(cameraGoal, 1 - Math.exp(-dt * 9));
  if (camera.position.y < ground + .6) camera.position.y = ground + .6;
  camera.lookAt(cameraTarget);
}

// ───────── Oberfläche ─────────
const uiCache = new Map();
function setText(id, v) { if (uiCache.get(id) !== v) { uiCache.set(id, v); const el = $(id); if (el) el.textContent = v; } }
function retrigger(el, cls) { if (settings.reducedMotion && cls !== 'on') return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
function setCount(id, v) { const old = uiCache.get(id); setText(id, v); if (old !== undefined && old !== v) retrigger($(id), 'bump'); }
function toast(text) { $('toast').textContent = text; $('toast').classList.add('show'); toastUntil = time + 3.6; }
function focusFirst(...ids) { const el = ids.map($).find(e => e && !e.hidden && !e.disabled); el?.focus(); }
let currentTarget = null;
function objectiveTarget(o) {
  if (!o) return null;
  if (o.level !== save.level) return save.cores[save.level] ? {x: PORTAL.x, y: 5, z: PORTAL.z, label: 'Sternentor'} : null;
  const g = o.goal, nearest = list => list.sort((a, b) => dist(state, a) - dist(state, b))[0] || null;
  switch (g.type) {
    case 'talk': { const n = npcs.get(g.npc); return n?.present ? {x: n.x, y: n.y + 2, z: n.z, label: n.name} : null; }
    case 'lantern': { const rule = quests.lanternRule(save.level); const open = torches.filter(t => !t.lit && (!rule.order || t.id === rule.order[save.lit[save.level].length])); const t = nearest(open); return t && {x: t.x, y: t.y + 2, z: t.z, label: 'Windlaterne'}; }
    case 'ring': { const r = nearest(flightRings.filter(r => !r.got)); return r && {x: r.x, y: r.y, z: r.z, label: 'Himmelsring'}; }
    case 'enemy': { const e = nearest(enemies.filter(e => e.state !== 'dead' && (!g.kind || e.kind === g.kind))); return e && {x: e.x, y: 1, z: e.z, label: ENEMY[e.kind].label}; }
    case 'item': { const it = nearest(items.filter(i => i.m.visible)); return it && {x: it.x, y: it.y, z: it.z, label: it.label}; }
    case 'gem': { const gm = nearest(gems.filter(x => !x.got && g.ids.includes(x.id))); return gm && {x: gm.x, y: gm.y, z: gm.z, label: 'Splitter'}; }
    case 'boss': return {x: 0, y: 3, z: -18.5, label: 'Oberes Tor'};
    case 'arrive': return save.cores[save.level] ? {x: PORTAL.x, y: 5, z: PORTAL.z, label: 'Sternentor'} : null;
  }
  return null;
}
function updateHUD() {
  if (!save || !state) return;
  setCount('gems', totalGems()); setCount('cores', save.cores.filter(Boolean).length);
  const max = maxHp(); setText('health', '♥'.repeat(clamp(state.hp, 0, max)) + '♡'.repeat(max - clamp(state.hp, 0, max)));
  $('health').setAttribute('aria-label', `Lebensenergie ${state.hp} von ${max}`);
  setText('region', levels[save.level].name);
  const o = quests.mainObjective();
  let label, title, detail, why = '';
  if (o) {
    label = `KAPITEL ${o.quest.chapter + 1} · ${story.chapters[o.quest.chapter].title.toUpperCase()}`;
    title = o.step.text; why = o.quest.why;
    detail = (o.need ? `${o.have} / ${o.need} · ` : '') + (o.level !== save.level ? (save.cores[save.level] ? 'Weiter durch das Sternentor' : 'Reise über die Inselwahl im Pausenmenü') : (o.step.hint || ''));
    if (o.step.goal.type === 'boss' && boss?.active) { title = boss.def.name.split(' · ')[0] + ' · Phase ' + (boss.phase + 1); detail = boss.def.phases[boss.phase].anchors ? 'Flieg in den Aufwinden zu den Ankern und triff sie.' : 'Wellen überspringen · Windstoß bei offenem Schild'; }
  } else if (quests.storyComplete()) {
    label = 'FREIES SPIEL'; title = 'Der Himmel gehört allen';
    detail = `${totalGems()} / ${TOTAL_GEMS} Splitter · Nebenaufträge ${story.quests.filter(q => q.kind === 'side' && quests.status(q.id) === 'done').length} / ${story.quests.filter(q => q.kind === 'side').length}`;
  } else { label = 'REISE'; title = 'Unterwegs'; detail = ''; }
  const side = quests.sideObjectives(save.level)[0];
  setText('questLabel', label); setText('objective', title); setText('detail', detail); setText('why', why);
  setText('sideObjective', side ? '◇ ' + side.quest.title + ': ' + side.step.text + (side.need ? ` (${side.have}/${side.need})` : '') : '');
  currentTarget = settings.guide ? objectiveTarget(o) : null;
  $('compass').hidden = !currentTarget;
  $('bossHud').hidden = !boss?.active;
  if (boss?.active) { $('bossBar').style.width = (boss.hp / boss.def.hp * 100) + '%'; setText('bossName', boss.def.name); const ph = boss.def.phases[boss.phase]; setText('bossHint', ph.anchors ? `ANKER ${anchors.filter(a => !a.broken).length} · in den Aufwinden zerstören` : boss.state === 'open' ? 'SCHILD OFFEN · Windstoß!' : boss.state === 'windup' ? 'ACHTUNG · Welle kommt – springen!' : 'Ausweichen und abwarten'); }
}
function updateCompass() {
  if (!currentTarget) { beam.visible = false; return; }
  const dx = currentTarget.x - state.x, dz = currentTarget.z - state.z, d = Math.hypot(dx, dz), dy = currentTarget.y - state.y;
  // Pfeil relativ zur Blickrichtung der Kamera: oben = geradeaus.
  const rel = Math.atan2(dx, dz) - camYaw - Math.PI;
  $('compassArrow').style.transform = `rotate(${-rel}rad)`;
  setText('compassText', `${currentTarget.label} · ${Math.round(d)} m${dy > 3 ? ' · höher' : dy < -3 ? ' · tiefer' : ''}`);
  beam.visible = d > 4; beam.position.set(currentTarget.x, currentTarget.y + 15, currentTarget.z);
}
function showHUD(on) {
  for (const id of ['hud', 'quest', 'map', 'desktopHelp', 'flightHud']) $(id).hidden = !on;
  const touch = 'ontouchstart' in window || matchMedia('(pointer:coarse)').matches;
  $('touch').hidden = !(on && touch); $('promptKey').textContent = touch ? '☷' : 'R';
  if (!on) { $('compass').hidden = true; $('bossHud').hidden = true; $('prompt').hidden = true; beam.visible = false; }
}
let mapTimer = 0;
function drawMap() {
  const c = $('map').getContext('2d'), s = 1.65; if (!c.translate) return;
  c.clearRect(0, 0, 160, 160); c.save(); c.translate(80, 80);
  c.fillStyle = '#9fc4b333'; c.beginPath(); c.arc(0, 0, (levels[save.level].mainRadius || 27) * s, 0, TAU); c.fill();
  for (const [x, z, r] of [[37, 2, 7], [-36, -5, 6]]) { c.beginPath(); c.arc(x * s, z * s, r * s, 0, TAU); c.fill(); }
  const dot = (x, z, r, color) => { c.fillStyle = color; c.beginPath(); c.arc(x * s, z * s, r, 0, TAU); c.fill(); };
  flightRings.filter(r => !r.got).forEach(r => dot(r.x, r.z, 3, '#ffe188')); gems.filter(g => !g.got).forEach(g => dot(g.x, g.z, 1.6, '#b5f7d1'));
  torches.forEach(t => dot(t.x, t.z, 3, t.lit ? '#c0fadb' : '#eeaa73')); for (const n of npcs.values()) if (n.present) dot(n.x, n.z, 2.6, npcMarker(n.id) || '#fff0b4');
  items.filter(i => i.m.visible).forEach(i => dot(i.x, i.z, 3.4, i.color)); dot(0, -21, 4, save.cores[save.level] ? '#fff0a7' : '#9e9bba');
  if (currentTarget) { c.strokeStyle = '#ffe39a'; c.lineWidth = 2; c.beginPath(); c.arc(currentTarget.x * s, currentTarget.z * s, 6, 0, TAU); c.stroke(); }
  c.translate(state.x * s, state.z * s); c.rotate(-state.yaw); c.fillStyle = '#fff'; c.beginPath(); c.moveTo(0, -6); c.lineTo(-4, 4); c.lineTo(4, 4); c.closePath(); c.fill(); c.restore();
}

// Dialoge: Warteschlange ohne Doppelstarts, Überspringen bei bekannten Gesprächen, Pause-sicher.
let dialogQueue = [], dialogCurrent = null, dialogIndex = 0, typing = null;
function openDialog(id, lines, done) {
  if (dialogCurrent?.id === id || dialogQueue.some(d => d.id === id)) return;
  dialogQueue.push({id, lines, done});
  if (!dialogCurrent) nextDialog();
}
function nextDialog() {
  dialogCurrent = dialogQueue.shift() || null;
  if (!dialogCurrent) return;
  clearInput(); dialogIndex = 0; if (mode === 'play') mode = 'dialog';
  $('dialog').hidden = false; $('prompt').hidden = true; $('skip').hidden = !save.seen[dialogCurrent.id];
  showLine(); if (!TEST) $('next').focus();
}
function showLine() {
  const line = dialogCurrent.lines[dialogIndex];
  setText('speaker', line.name); setText('role', line.role); $('portrait').textContent = line.portrait;
  $('portrait').dataset.who = line.who;
  typing = settings.reducedMotion || settings.textSpeed === 'sofort' ? null : {text: line.text, t: time, n: -1};
  $('speech').textContent = typing ? '' : line.text;
  $('next').textContent = dialogIndex === dialogCurrent.lines.length - 1 ? 'Weiter ▸' : 'Weiter ▾';
}
function advance() {
  if (mode !== 'dialog' || !dialogCurrent) return;
  if (typing) { $('speech').textContent = typing.text; typing = null; return; }
  note(440, .07, .02);
  if (++dialogIndex < dialogCurrent.lines.length) { showLine(); return; }
  closeDialog();
}
function closeDialog() {
  const d = dialogCurrent; dialogCurrent = null; typing = null; if (d && story.dialogs[d.id]) save.seen[d.id] = 1;
  $('dialog').hidden = true; if (mode === 'dialog') mode = 'play';
  d?.done?.();
  if (dialogQueue.length) nextDialog();
  else if (endingPending && mode === 'play') { endingPending = false; showEnding(); }
  updateHUD();
}
function skipDialog() { if (mode !== 'dialog' || !dialogCurrent || !save.seen[dialogCurrent.id]) return; closeDialog(); }
// Abgebrochene Dialoge (Inselwechsel, Titelbild) geben ihre Questschritte frei, damit nichts dauerhaft blockiert.
function resetDialogs() { dialogQueue = []; dialogCurrent = null; typing = null; $('dialog').hidden = true; endingPending = false; quests?.cancel(); }

// Pausenmenü mit Reiter: Reise · Tagebuch · Einstellungen.
function pause(tab = 'travelTab') {
  if (mode !== 'play' && mode !== 'dialog') return;
  pausedFrom = mode; mode = 'pause'; clearInput(); persist();
  $('pauseMenu').hidden = false; $('dialog').hidden = true; showTab(tab);
  for (let i = 0; i < LEVEL_COUNT; i++) { const b = $('travel' + i); b.disabled = !(i === 0 || save.cores[i - 1]); b.textContent = levels[i].name + (save.cores[i] ? ' ✓' : ''); }
  if (!TEST) $('resume').focus();
}
function resume() {
  if (mode !== 'pause') return;
  mode = pausedFrom === 'dialog' && dialogCurrent ? 'dialog' : 'play'; $('pauseMenu').hidden = true; if (mode === 'dialog') $('dialog').hidden = false; last = performance.now();
}
function showTab(id) {
  for (const t of ['travelTab', 'journalTab', 'settingsTab']) { $(t).hidden = t !== id; $(t + 'Button').classList.toggle('sel', t === id); $(t + 'Button').setAttribute('aria-selected', String(t === id)); }
  if (id === 'journalTab') renderJournal();
  if (id === 'settingsTab') renderSettings();
}
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
function renderJournal() {
  const list = quests.journal(), o = quests.mainObjective();
  let html = o ? `<div class="jNow"><small>JETZT</small><strong>${esc(o.step.text)}</strong><span>${esc(o.quest.why)}</span></div>` : '';
  story.chapters.forEach((ch, c) => {
    const qs = list.filter(q => q.chapter === c && q.status !== 'locked');
    const done = quests.chapterDone(c);
    if (!qs.length && !done) { html += `<div class="jChapter locked"><h3>Kapitel ${c + 1} · ???</h3></div>`; return; }
    html += `<div class="jChapter"><h3>Kapitel ${c + 1} · ${esc(ch.title)} ${done ? '<em>✓ abgeschlossen</em>' : ''}</h3>`;
    if (done) html += `<p class="jSummary">${esc(ch.summary)}</p>`;
    for (const q of qs) html += `<div class="jQuest ${q.kind}"><b>${q.kind === 'side' ? '◇ ' : '◆ '}${esc(q.title)}</b> <i>${esc(q.label)}</i><ul>${q.steps.filter((s, i) => s.done || s.current || q.status === 'available' && i === 0).map(s => `<li class="${s.done ? 'done' : 'cur'}">${s.done ? '✓' : '➤'} ${esc(s.text)}</li>`).join('')}</ul></div>`;
    html += '</div>';
  });
  const n = totalGems();
  html += `<div class="jChapter"><h3>Sammlung · ${n} / ${TOTAL_GEMS} Splitter</h3><ul class="jUpgrades">${story.upgrades.map(u => `<li class="${n >= u.gems ? 'done' : ''}">${n >= u.gems ? '✓' : '○'} ${u.gems} · ${esc(u.text)}</li>`).join('')}</ul><p class="jSummary">Laternen ${save.lit.flat().length} / 18 · Himmelsringe ${save.rings.flat().length} / 9</p></div>`;
  $('journalBody').innerHTML = html;
}
const SETTING_ROWS = [
  ['volume', 'Lautstärke', 'range', 0, 1, .1], ['music', 'Musik', 'toggle'], ['quality', 'Grafik', 'cycle', ['auto', 'sparsam', 'ausgewogen', 'hoch']],
  ['camSens', 'Kamera-Empfindlichkeit', 'range', .3, 2.5, .1], ['touchSens', 'Touch-Empfindlichkeit', 'range', .3, 2.5, .1], ['camAssist', 'Kamerahilfe', 'toggle'],
  ['flightAssist', 'Flughilfe (weniger Kraftverbrauch)', 'toggle'], ['guide', 'Zielhinweise und Kompass', 'toggle'], ['textSpeed', 'Text', 'cycle', ['normal', 'sofort']],
  ['reducedMotion', 'Reduzierte Bewegung', 'toggle'], ['uiSize', 'Bediengröße', 'cycle', ['normal', 'gross']], ['perf', 'Leistungsanzeige', 'toggle']];
const VALUE_LABEL = {auto: 'Automatisch', sparsam: 'Sparsam', ausgewogen: 'Ausgewogen', hoch: 'Hoch', normal: 'Normal', sofort: 'Sofort', gross: 'Groß'};
function settingLabel(row) { const [k, , type] = row, v = settings[k]; if (type === 'toggle') return v ? 'an' : 'aus'; if (type === 'range') return Math.round(v * 100) + ' %'; if (k === 'quality') return uiCache.get('qualityValue') || VALUE_LABEL[v]; return VALUE_LABEL[v] || v; }
function renderSettings() {
  $('settingsBody').innerHTML = SETTING_ROWS.map((row, i) => { const [k, label, type, a, b, step] = row; return `<div class="setRow"><label for="set_${k}">${esc(label)}</label>${type === 'range' ? `<input id="set_${k}" type="range" min="${a}" max="${b}" step="${step}" value="${settings[k]}" data-i="${i}">` : `<button id="set_${k}" class="secondary small" data-i="${i}">${esc(settingLabel(row))}</button>`}<output id="out_${k}">${type === 'range' ? esc(settingLabel(row)) : ''}</output></div>`; }).join('')
    + '<div class="setRow"><span>Vollbild</span><button id="fullscreen" class="secondary small">umschalten</button><output></output></div>';
  for (const el of $('settingsBody').querySelectorAll('[data-i]')) {
    const row = SETTING_ROWS[Number(el.dataset.i)], [k, , type, options] = row;
    if (type === 'range') el.addEventListener('input', () => { settings[k] = Number(el.value); $('out_' + k).textContent = settingLabel(row); applySettings(); });
    else el.addEventListener('click', () => { if (type === 'toggle') settings[k] = !settings[k]; else settings[k] = options[(options.indexOf(settings[k]) + 1) % options.length]; applySettings(); el.textContent = settingLabel(row); });
  }
  $('fullscreen').onclick = toggleFullscreen;
}
function applySettings() {
  saveSettings(); applyVolume(); applyQuality();
  document.body.classList.toggle('reduced', settings.reducedMotion); document.body.classList.toggle('uiLarge', settings.uiSize === 'gross');
  $('perf').hidden = !settings.perf; updateHUD();
  const q = $('set_quality'); if (q) q.textContent = settingLabel(SETTING_ROWS[2]);
}
function toggleFullscreen() { try { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.({navigationUI: 'hide'}); } catch {} }
function showEnding() {
  mode = 'ending'; persist();
  $('ending').hidden = false; showHUD(false);
  setText('endingStats', `${totalGems()} / ${TOTAL_GEMS} Himmelssplitter · Nebenaufträge ${story.quests.filter(q => q.kind === 'side' && quests.status(q.id) === 'done').length} / ${story.quests.filter(q => q.kind === 'side').length} · ${Math.max(1, Math.ceil(elapsed / 60))} Minuten`);
  $('credits').classList.toggle('roll', !settings.reducedMotion); retrigger($('credits'), 'roll');
  if (!TEST) focusFirst('explore');
}
function showNotice(notes, done) {
  $('noticeText').innerHTML = notes.map(n => `<p>${esc(n)}</p>`).join('');
  $('notice').hidden = false; mode = 'notice';
  $('noticeOk').onclick = () => { $('notice').hidden = true; mode = 'play'; done(); };
  if (!TEST) $('noticeOk').focus();
}

// ───────── Spielstart ─────────
function start(resume) {
  audioStart(); resetDialogs();
  const previous = store.get(SAVE_KEY);
  if (resume) save = readSave() || Q.freshSave();
  else { if (previous) store.set('aeru-save-previous', previous); save = Q.freshSave(); }
  save.__live = true; elapsed = save.elapsed; newEngine();
  $('menu').hidden = true; $('ending').hidden = true;
  buildLevel(save.level); mode = 'play'; showHUD(true);
  const begin = () => { quests.refresh(); refreshWorld(); updateHUD(); persist(); };
  if (resume && save.migration?.notes?.length) { const notes = save.migration.notes; save.migration.shown = true; persist(); showNotice(['Dein Spielstand stammt aus einer früheren Version von AERU. Nichts wurde gelöscht; eine Sicherung liegt im Browser.', ...notes], begin); }
  else begin();
}
function toTitle() {
  persist(); resetDialogs(); mode = 'title'; save.__live = false;
  for (const id of ['pauseMenu', 'ending', 'notice']) $(id).hidden = true;
  $('menu').hidden = false; $('continue').hidden = !store.get(SAVE_KEY); showHUD(false); if (!TEST) focusFirst('continue', 'start');
}

// ───────── Eingabe ─────────
let stickId = null, cameraPointer = null;
function clearInput() {
  keys.clear(); moveX = moveY = 0; jumpHeld = false; attackHeld = false; diveHeld = false; stickId = null; cameraPointer = null;
  const knob = $('knob'); if (knob) knob.style.transform = '';
  for (const id of ['jump', 'attack', 'fly', 'talk', 'dodge']) $(id)?.classList.remove('held');
}
function menuNav(dir) {
  const root = ['notice', 'pauseMenu', 'ending', 'menu'].map($).find(el => !el.hidden); if (!root) return;
  const items = [...root.querySelectorAll('button,a,input')].filter(b => !b.disabled && b.offsetParent !== null); if (!items.length) return;
  const i = items.indexOf(document.activeElement); items[i < 0 ? 0 : (i + dir + items.length) % items.length].focus(); note(660, .05, .015);
}
addEventListener('keydown', e => {
  const menuOpen = ['title', 'pause', 'ending', 'notice'].includes(mode);
  if (menuOpen && document.activeElement?.type === 'range' && ['ArrowLeft', 'ArrowRight'].includes(e.code)) return;
  if (menuOpen && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyS'].includes(e.code)) { e.preventDefault(); audioStart(); menuNav(['ArrowUp', 'ArrowLeft', 'KeyW'].includes(e.code) ? -1 : 1); return; }
  if (!menuOpen && ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code)) e.preventDefault();
  if (e.repeat) return;
  if (mode === 'play' && document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
  if (e.code === 'Escape' || e.code === 'KeyP') { e.preventDefault(); if (mode === 'pause') resume(); else pause(); return; }
  if (e.code === 'KeyJ' && (mode === 'play' || mode === 'dialog')) { pause('journalTab'); return; }
  if (mode === 'dialog') { if (e.code === 'KeyR' || e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); advance(); } else if (e.code === 'KeyX' || e.code === 'Backspace') skipDialog(); return; }
  if (mode !== 'play') return;
  keys.add(e.code);
  if (e.code === 'Space') jumpPress(); if (e.code === 'KeyF') strike(); if (e.code === 'KeyG') flight(); if (e.code === 'KeyC') camYaw = state.yaw; if (e.code === 'KeyR' || e.code === 'Enter') talk();
  if ((e.code === 'ShiftLeft' || e.code === 'ShiftRight') && !state.flight) dodge();
});
addEventListener('keyup', e => keys.delete(e.code));
addEventListener('blur', () => { clearInput(); pause(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) { clearInput(); pause(); if (audio?.state === 'running') audio.suspend?.(); } else if (audio && mode !== 'title') audio.resume?.(); });
$('world').addEventListener('contextmenu', e => e.preventDefault());
$('world').addEventListener('pointerdown', e => { if (mode !== 'play') return; audioStart(); cameraPointer = {id: e.pointerId, x: e.clientX, y: e.clientY, touch: e.pointerType === 'touch'}; try { $('world').setPointerCapture(e.pointerId); } catch {} });
$('world').addEventListener('pointermove', e => {
  if (cameraPointer?.id !== e.pointerId) return;
  const sens = cameraPointer.touch ? settings.touchSens * 1.2 : settings.camSens;
  camManualUntil = time + 3; camYaw -= (e.clientX - cameraPointer.x) * .007 * sens; camPitch = clamp(camPitch + (e.clientY - cameraPointer.y) * .003 * sens, .08, .85);
  cameraPointer.x = e.clientX; cameraPointer.y = e.clientY;
});
const endCamera = e => { if (cameraPointer?.id === e.pointerId) cameraPointer = null; };
for (const t of ['pointerup', 'pointercancel', 'lostpointercapture']) $('world').addEventListener(t, endCamera);
$('world').addEventListener('wheel', e => { if (mode === 'play') { camDist = clamp(camDist + Math.sign(e.deltaY) * .8, 7, 18); e.preventDefault(); } }, {passive: false});
// Virtueller Stick mit Totzone und weicher Kennlinie.
function stickMove(e) {
  if (e.pointerId !== stickId) return;
  const r = $('stick').getBoundingClientRect(), radius = r.width / 2, x = e.clientX - r.left - radius, y = e.clientY - r.top - radius, d = Math.hypot(x, y), clampD = Math.min(d, radius * .75);
  const norm = d > 0 ? clampD / (radius * .75) : 0, dead = .15, mag = norm < dead ? 0 : Math.pow((norm - dead) / (1 - dead), 1.2);
  moveX = d > 0 ? x / d * mag : 0; moveY = d > 0 ? y / d * mag : 0;
  $('knob').style.transform = `translate(${d > 0 ? x / d * clampD : 0}px,${d > 0 ? y / d * clampD : 0}px)`;
}
$('stick').addEventListener('pointerdown', e => { e.preventDefault(); audioStart(); stickId = e.pointerId; try { $('stick').setPointerCapture(e.pointerId); } catch {} stickMove(e); });
$('stick').addEventListener('pointermove', stickMove);
for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) $('stick').addEventListener(type, e => { if (stickId !== e.pointerId) return; stickId = null; moveX = moveY = 0; $('knob').style.transform = ''; });
const BUTTONS = [['jump', jumpPress, v => jumpHeld = v], ['attack', strike, v => attackHeld = v], ['talk', talk], ['fly', flight], ['dodge', () => { if (state.flight) diveHeld = true; else dodge(); }, v => { if (!v) diveHeld = false; }]];
for (const [id, fn, hold] of BUTTONS) {
  const b = $(id);
  b.addEventListener('pointerdown', e => { e.preventDefault(); try { b.setPointerCapture(e.pointerId); } catch {} b.classList.add('held'); hold?.(true); if (mode === 'dialog' && id !== 'talk') return; fn(); });
  for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) b.addEventListener(event, () => { b.classList.remove('held'); hold?.(false); });
}
$('prompt').addEventListener('pointerdown', e => { e.preventDefault(); talk(); });
$('start').onclick = () => start(false); $('continue').onclick = () => start(true);
$('next').onclick = e => { e.stopPropagation(); advance(); }; $('skip').onclick = e => { e.stopPropagation(); skipDialog(); };
$('dialog').addEventListener('click', advance);
$('pause').onclick = () => pause(); $('journal').onclick = () => pause('journalTab'); $('resume').onclick = resume;
$('rescue').onclick = () => { resume(); if (mode === 'play') respawn('Zurück am letzten Rastpunkt'); };
$('restart').onclick = () => { resume(); if (mode === 'play') { state.checkpoint = {x: 0, y: 0, z: 19}; respawn('Zurück am Inselstart'); } };
$('toTitle').onclick = toTitle;
$('explore').onclick = () => { $('ending').hidden = true; mode = 'play'; showHUD(true); updateHUD(); if (!TEST) $('world').focus?.(); };
$('endTitle').onclick = toTitle;
for (const t of ['travelTab', 'journalTab', 'settingsTab']) $(t + 'Button').onclick = () => showTab(t);
for (let i = 0; i < LEVEL_COUNT; i++) $('travel' + i).onclick = () => travel(i);
function onResize() { camera.aspect = innerWidth / innerHeight; camera.fov = innerHeight > innerWidth ? 58 : 52; camDist = innerHeight > innerWidth ? 13 : 10; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); }
addEventListener('resize', onResize); window.visualViewport?.addEventListener?.('resize', onResize);
addEventListener('pagehide', () => { if (save && mode !== 'title') persist(); });

// ───────── Grafikfehler und Kontextverlust ─────────
let gfxError = '';
function graphicsFailed(reason) {
  console.error('AERU graphics:', reason); gfxError = gfxError || String(reason);
  if (settings.quality !== 'sparsam') { settings.quality = 'sparsam'; applySettings(); toast('Grafik auf sparsam umgestellt'); return; }
  $('error').hidden = false; $('errorText').textContent = 'Dein Gerät konnte die 3D-Welt nicht darstellen. Technischer Hinweis: ' + gfxError.slice(0, 240);
}
if (renderer.debug) renderer.debug.onShaderError = (gl, program, vs, fs) => graphicsFailed('Shader: ' + ((gl.getProgramInfoLog(program) || '') + (gl.getShaderInfoLog(fs) || '') + (gl.getShaderInfoLog(vs) || '')).trim());
$('world').addEventListener('webglcontextlost', e => { e.preventDefault(); persist(); pause(); $('error').hidden = false; $('errorText').textContent = 'Die Grafikkarte hat die 3D-Welt kurz beendet. Dein Fortschritt ist gespeichert. Die Seite lädt neu, sobald die Grafik zurück ist.'; });
$('world').addEventListener('webglcontextrestored', () => location.reload());

// ───────── Hauptschleife ─────────
// Feste 60-Hz-Simulation; Darstellung und Kamera glätten unabhängig von der Bildrate.
function update(dt) {
  elapsed += dt; attackCooldown = Math.max(0, attackCooldown - dt); attackTime = Math.max(0, attackTime - dt); invulnerable = Math.max(0, invulnerable - dt); tickGusts(dt);
  if ((attackHeld || keys.has('KeyF')) && attackCooldown === 0) strike();
  if (keys.has('KeyQ')) { camYaw += dt * 1.7 * settings.camSens; camManualUntil = time + 2; } if (keys.has('KeyE')) { camYaw -= dt * 1.7 * settings.camSens; camManualUntil = time + 2; }
  movePlayer(dt);
  if (mode !== 'play') return;
  pickups(); updateEnemies(dt); updateBossEffects(dt);
  for (const n of npcs.values()) { if (!n.present) continue; const d = Math.hypot(n.tx - n.x, n.ty - n.y, n.tz - n.z); if (d > .05) { const step = Math.min(d, dt * 8); n.x += (n.tx - n.x) / d * step; n.y += (n.ty - n.y) / d * step; n.z += (n.tz - n.z) / d * step; } }
  near = findNear(); $('prompt').hidden = !near || mode !== 'play';
  setText('promptText', near === 'portal' ? (save.cores[save.level] ? 'Durch das Sternentor' : 'Das Sternentor schläft') : near ? 'Sprechen mit ' + near.name : '');
  $('talk').classList.toggle('ready', !!near);
  if (dirty) { dirty = false; refreshWorld(); updateHUD(); persist(); }
  if (time - lastSave > 15) { persist(); lastSave = time; }
}
const birdM = new T.Matrix4(), birdE = new T.Euler(), birdS = new T.Vector3(.18, .5, .18);
let lastPerf = null, hudTimer = 0, perfFrames = 0, perfTime = 0, perfWorst = 0, autoWindow = [], goodWindows = 0;
function measure(dt) {
  perfFrames++; perfTime += dt; perfWorst = Math.max(perfWorst, dt);
  if (perfTime >= .5) {
    const fps = perfFrames / perfTime, ms = perfTime / perfFrames * 1000; lastPerf = {fps, ms, worst: perfWorst * 1000};
    if (settings.perf) { const info = renderer.info?.render || {}; setText('perf', `${fps.toFixed(0)} FPS · ${ms.toFixed(1)} ms (max ${(perfWorst * 1000).toFixed(0)}) · ${info.calls ?? '–'} Draw Calls · ${((info.triangles || 0) / 1000).toFixed(1)}k Dreiecke · Auflösung ×${(renderer.getPixelRatio?.() || 1).toFixed(2)} · ${canvasMode ? '2D' : QUALITY[settings.quality === 'auto' ? autoLevel : settings.quality].label}`); }
    if (settings.quality === 'auto' && (mode === 'play' || mode === 'dialog') && !canvasMode) autoAdjust(ms);
    perfFrames = 0; perfTime = 0; perfWorst = 0;
  }
}
// Automatische Qualität: misst die tatsächliche Bildzeit und passt erst Auflösung, dann Stufe an. Physik bleibt unberührt.
function autoAdjust(ms) {
  autoWindow.push(ms); if (autoWindow.length < 4) return;
  const avg = autoWindow.reduce((a, b) => a + b, 0) / autoWindow.length; autoWindow = [];
  const i = QUALITY_ORDER.indexOf(autoLevel);
  if (avg > 24) { goodWindows = 0; if (renderScale > .7) renderScale = Math.round((renderScale - .15) * 100) / 100; else if (i > 0) { autoLevel = QUALITY_ORDER[i - 1]; renderScale = 1; } else return; applyQuality(); }
  else if (avg < 14.5) { if (++goodWindows >= 3) { goodWindows = 0; if (renderScale < 1) renderScale = Math.min(1, renderScale + .1); else if (i < 2) autoLevel = QUALITY_ORDER[i + 1]; else return; applyQuality(); } }
  else goodWindows = 0;
}
function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min(.1, (now - (last || now)) / 1000); last = now; time += dt;
  if (mode === 'play') { accumulator += dt; while (accumulator >= TICK && mode === 'play') { update(TICK); accumulator -= TICK; } } else accumulator = 0;
  for (const d of updrafts) d.g.children.slice(1).forEach((m, i) => m.position.y = (time * 3 + i * d.height / 4) % d.height);
  for (const r of flightRings) r.m.rotation.z = time * .3;
  for (const g of gems) if (!g.got) { g.m.rotation.y = time * 1.2 + g.id; g.m.position.y = g.y + Math.sin(time * 2 + g.id) * .15; }
  for (const it of items) if (it.m.visible) { it.m.rotation.y = time * 1.6; it.m.position.y = it.y + Math.sin(time * 2.4) * .2; }
  for (const t of torches) { t.light.rotation.y = time; t.halo.rotation.y = time * .6; }
  if (state) for (const n of npcs.values()) {
    if (!n.present) continue;
    n.g.position.set(n.x, n.y + Math.abs(Math.sin(time * 2.2 + n.x)) * .06, n.z);
    const color = npcMarker(n.id); n.marker.visible = !!color; if (color) { n.marker.material = mat(color, true); n.marker.position.set(n.x, n.y + 3.3 + Math.sin(time * 2) * .15, n.z); n.marker.rotation.y = time; }
    if (mode !== 'title' && dist(state, n) < 6) n.g.rotation.y = approach(n.g.rotation.y, Math.atan2(n.x - state.x, n.z - state.z), 6, dt);
  }
  if (portal) { portal.rotation.z = time * .15; portal.material.emissiveIntensity = save.cores[save.level] ? 1.2 : .15; }
  if (core) { core.rotation.y = time; core.position.y = 5.2 + Math.sin(time * 2) * .2; }
  clouds.forEach((c, i) => c.position.x += Math.sin(time * .05 + i) * dt * .2);
  if (pond) pond.material.emissiveIntensity = .3 + Math.sin(time * 1.5) * .08;
  if (birds && birds.count) { for (let i = 0; i < birds.count; i++) { const a = time * (.25 + i * .03) + i * 1.7, r = 14 + (i % 4) * 4; birdM.makeRotationFromEuler(birdE.set(Math.PI / 2, 0, -a)); birdM.scale(birdS); birdM.setPosition(Math.cos(a) * r, 9 + (i % 3) * 2 + Math.sin(time * 2 + i) * .4, Math.sin(a) * r); birds.setMatrixAt(i, birdM); } birds.instanceMatrix.needsUpdate = true; }
  if (mode === 'play' && state) { hudTimer -= dt; if (hudTimer <= 0) { hudTimer = .25; updateHUD(); } }
  for (const p of particlePool) { if (p.life <= 0) continue; p.life -= dt; if (p.life <= 0) { p.m.visible = false; continue; } p.m.position.addScaledVector(p.v, dt); p.v.y -= dt * 4; p.m.scale.multiplyScalar(.985); }
  if (state && audio && windGain) { const speed = Math.hypot(state.vx, state.vy, state.vz), base = mode === 'play' ? (state.onGround ? .012 : .02 + Math.min(.06, speed * .004)) : 0; windGain.gain.value = approach(windGain.gain.value, base, 4, dt); windFilter.frequency.value = levels[save.level].music.wind + speed * 40; }
  if (mode === 'title') { const a = .35 + Math.sin(time * .08) * .2; camera.position.set(15 + Math.sin(a) * 14, 9, 25); camera.lookAt(0, 2, 1); player.position.set(8, 1.5 + Math.sin(time * 2) * .2, 10); player.rotation.set(0, -.6, 0); player.scale.setScalar(1); player.userData.wings.forEach((w, i) => w.rotation.z = (i ? 1 : -1) * (.1 + Math.sin(time * 3) * .2)); beam.visible = false; }
  else if (state) { updateCamera(dt); if (mode === 'play' || mode === 'dialog') updateCompass(); }
  if (mode === 'play' && audio && audio.state === 'running') music(dt);
  if (typing) { const speed = 55, n = Math.floor((time - typing.t) * speed); if (n >= typing.text.length) { $('speech').textContent = typing.text; typing = null; } else if (n !== typing.n) { typing.n = n; $('speech').textContent = typing.text.slice(0, n); } }
  if (time > toastUntil) $('toast').classList.remove('show');
  if ((mode === 'play' || mode === 'dialog') && state) { mapTimer -= dt; if (mapTimer <= 0) { mapTimer = 1 / 15; drawMap(); } const fill = Math.round(state.stamina / maxStamina() * 100) + '%'; if (uiCache.get('flightFill') !== fill) { uiCache.set('flightFill', fill); $('flightFill').style.width = fill; } setText('flightState', state.onGround ? 'FLÜGELKRAFT' : state.flight ? 'IM FLUG' : 'IM SPRUNG'); $('flightHud').classList.toggle('low', state.stamina < 20); $('fly').classList.toggle('active', state.flight); $('fly').setAttribute('aria-pressed', String(state.flight)); }
  try { renderer.render(scene, camera); } catch (e) { graphicsFailed(e.message); }
  measure(dt);
}
function music(dt) {
  musicTimer -= dt; if (musicTimer > 0) return;
  const m = levels[save.level].music, fight = boss?.active;
  musicTimer = m.tempo * (fight ? .7 : 1);
  const pattern = [0, 2, 4, 2, 1, 3, 2, 0, 0, 2, 5, 4, 3, 2, 1, 0], deg = m.scale[pattern[musicStep % pattern.length] % m.scale.length];
  note(m.root * Math.pow(2, deg / 12), fight ? .7 : 1.3, .012, fight ? 'triangle' : 'sine', musicGain);
  if (musicStep % 4 === 0) note(m.root / 2, 2.4, .018, 'triangle', musicGain);
  musicStep++;
}

// ───────── 2D-Rückfall (ohne WebGL) ─────────
function drawCanvasFallback(c, w, h) {
  if (!state || !save) return;
  const cfg = levels[save.level], s = Math.min(w, h) / 42, cx = w / 2, cy = h * .53, cs = Math.cos(camYaw), sn = Math.sin(camYaw);
  const point = (x, z) => { const dx = x - state.x, dz = z - state.z; return [cx + (dx * cs - dz * sn) * s, cy + (dx * sn + dz * cs) * s]; };
  const circle = (x, z, r, fill, stroke, line = 1) => { const [px, py] = point(x, z); if (px + r * s < 0 || px - r * s > w || py + r * s < 0 || py - r * s > h) return; c.beginPath(); c.arc(px, py, Math.max(1, r * s), 0, TAU); c.fillStyle = fill; c.fill(); if (stroke) { c.strokeStyle = stroke; c.lineWidth = line; c.stroke(); } };
  const label = (text, x, y, color = '#f8f6df') => { c.font = 'bold 11px system-ui,sans-serif'; c.textAlign = 'center'; c.lineWidth = 3; c.strokeStyle = '#17313e'; c.strokeText(text, x, y); c.fillStyle = color; c.fillText(text, x, y); };
  const bg = c.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, cfg.sky); bg.addColorStop(1, '#70c3c8'); c.fillStyle = bg; c.fillRect(0, 0, w, h);
  c.strokeStyle = '#ffffff29'; c.lineWidth = 1; for (let y = 18; y < h; y += 42) { c.beginPath(); c.moveTo(0, y + Math.sin(time + y) * 3); c.lineTo(w, y + Math.sin(time + y) * 3); c.stroke(); }
  for (const ground of solids) {
    if (ground.r) { circle(ground.x + .35, ground.z + .6, ground.r + 1.4, '#235e6a'); circle(ground.x, ground.z, ground.r + .45, cfg.rock); circle(ground.x, ground.z, ground.r - .35, cfg.grass, '#e4dfa990', 2); }
    else { const corners = [[ground.x - ground.w / 2, ground.z - ground.d / 2], [ground.x + ground.w / 2, ground.z - ground.d / 2], [ground.x + ground.w / 2, ground.z + ground.d / 2], [ground.x - ground.w / 2, ground.z + ground.d / 2]]; c.beginPath(); corners.forEach(([x, z], i) => { const p = point(x, z); i ? c.lineTo(...p) : c.moveTo(...p); }); c.closePath(); c.fillStyle = ground.y > 1 ? '#dccdac' : cfg.grass; c.fill(); c.strokeStyle = '#f4ecd2'; c.lineWidth = 2; c.stroke(); const [px, py] = point(ground.x, ground.z); if (ground.y > .5) label(ground.y.toFixed(1) + ' m', px, py + 4, '#5a4a2a'); }
  }
  for (let i = 0; i < 15; i++) { const z = 19 - i * 2.5, [x0, y0] = point(Math.sin(i * .6) * 1.4, z); c.save(); c.translate(x0, y0); c.rotate(-camYaw + i * .12); c.fillStyle = '#d7c7a6'; c.fillRect(-s * .9, -s * .38, s * 1.8, s * .76); c.restore(); }
  for (const t of fallbackTrees) { const [x, y] = point(t.x, t.z); if (x < -30 || x > w + 30 || y < -30 || y > h + 30) continue; c.fillStyle = '#2d6c5b'; c.beginPath(); c.arc(x + 3, y + 5, t.s * s * 1.65, 0, TAU); c.fill(); c.fillStyle = cfg.leaf; c.beginPath(); c.arc(x, y, t.s * s * 1.65, 0, TAU); c.fill(); }
  for (const u of updrafts) { circle(u.x, u.z, 2.2, '#66e6d633', '#9cf8e0', 2); const [x, y] = point(u.x, u.z); label('↑', x, y + 5, '#dcfff3'); }
  for (const t of torches) { const [x, y] = point(t.x, t.z); circle(t.x, t.z, .72, t.lit ? '#ffe3a3' : '#59677b', t.lit ? '#fff5c9' : '#bdc6ca', 2); label(t.lit ? '✦' : '◇', x, y + 4, t.lit ? '#ffeaa6' : '#d5dce0'); }
  for (const g of gems) { if (g.got) continue; const [x, y] = point(g.x, g.z); c.save(); c.translate(x, y); c.rotate(Math.PI / 4); c.fillStyle = '#b9ffe2'; c.fillRect(-s * .23, -s * .23, s * .46, s * .46); c.restore(); }
  for (const it of items) { if (!it.m.visible) continue; const [x, y] = point(it.x, it.z); circle(it.x, it.z, .8, it.color, '#fff', 2); label(it.label, x, y - 14); }
  for (const r of flightRings) { if (r.got) continue; const [x, y] = point(r.x, r.z); circle(r.x, r.z, 1.15, '#ffdc8440', '#ffe8a8', 3); label('↟ ' + Math.round(r.y) + 'm', x, y - 15, '#ffeab3'); }
  for (const a of anchors) { if (a.broken) continue; const [x, y] = point(a.x, a.z); circle(a.x, a.z, .9, '#9b7fe6', '#fff', 2); label('ANKER ' + a.y + 'm', x, y - 14); }
  circle(0, -21, 2.1, '#634a6a', '#ffdda0', 3); { const [x, y] = point(0, -21); label('STERNENTOR', x, y - 29); }
  for (const n of npcs.values()) { if (!n.present) continue; const [x, y] = point(n.x, n.z); circle(n.x, n.z, .85, story.npcs[n.id].color, '#fff0c8', 2); const mk = npcMarker(n.id); label(n.name + (mk ? ' !' : ''), x, y - 12, mk || '#ffe4a2'); }
  for (const e of enemies) { if (e.state === 'dead') continue; const [x, y] = point(e.x, e.z); circle(e.x, e.z, .8, ENEMY[e.kind].color, e.state === 'windup' ? '#ff5a3d' : '#edb3a4', e.state === 'windup' ? 4 : 2); label(e.state === 'windup' ? '!' : '✕', x, y + 4, '#ffc4af'); }
  for (const o of orbPool) if (o.life > 0) circle(o.m.position.x, o.m.position.z, .4, '#ff8a6a');
  for (const k of markers) circle(k.x, k.z, 1.6, '#ff6a4d55', '#ff6a4d', 2);
  for (const wv of waves) { const [x, y] = point(boss.def.center.x, boss.def.center.z); c.beginPath(); c.arc(x, y, wv.r * s, 0, TAU); c.lineWidth = 3; c.strokeStyle = '#f5baa1'; c.stroke(); }
  if (boss && boss.g.visible) { circle(boss.def.center.x, boss.def.center.z, 2.2, '#555173', boss.state === 'open' ? '#ffe39a' : '#f9b9a5', 4); const [x, y] = point(boss.def.center.x, boss.def.center.z); label(boss.def.name.split(' · ')[0] + (boss.state === 'open' ? ' · OFFEN' : ''), x, y - 33); }
  for (const gust of gusts) { const [x, y] = point(gust.g.position.x, gust.g.position.z); const radius = Math.max(.4, 3 - gust.age * 2) * s; c.beginPath(); c.arc(x, y, radius, 0, TAU); c.lineWidth = 3; c.strokeStyle = '#a9ffeb'; c.stroke(); }
  if (currentTarget) { const [x, y] = point(currentTarget.x, currentTarget.z); c.strokeStyle = '#ffe39a'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, 14, 0, TAU); c.stroke(); }
  const lift = Math.min(85, Math.max(0, state.y) * s * .55); if (lift) { c.beginPath(); c.ellipse(cx, cy, s * .7, s * .38, 0, 0, TAU); c.fillStyle = '#12485688'; c.fill(); c.strokeStyle = '#ffffff77'; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx, cy - lift); c.stroke(); }
  c.save(); c.translate(cx, cy - lift); c.rotate(state.yaw - camYaw); c.fillStyle = '#d6bd83'; c.beginPath(); c.moveTo(-s * .35, s * .1); c.lineTo(-s * 1.15, s * .48); c.lineTo(-s * .45, -s * .48); c.moveTo(s * .35, s * .1); c.lineTo(s * 1.15, s * .48); c.lineTo(s * .45, -s * .48); c.fill(); c.fillStyle = '#48b9b1'; c.beginPath(); c.ellipse(0, 0, s * .52, s * .72, 0, 0, TAU); c.fill(); c.beginPath(); c.moveTo(0, -s * 1.02); c.lineTo(-s * .36, -s * .35); c.lineTo(s * .36, -s * .35); c.closePath(); c.fill(); c.fillStyle = '#f5e3aa'; c.beginPath(); c.arc(0, -s * .54, s * .24, 0, TAU); c.fill(); c.restore();
  if (state.y > .5) label('HÖHE ' + state.y.toFixed(1) + ' m', cx, cy - lift - s * 1.3);
}

// ───────── Testschnittstelle (nur mit ?test) ─────────
if (TEST) window.aeruTest = {
  snapshot: () => ({mode, camera: {x: camera.position.x, y: camera.position.y, z: camera.position.z}, state: {...state, checkpoint: {...state.checkpoint}}, save: JSON.parse(JSON.stringify(save)), objective: (() => { const o = quests.mainObjective(); return o && {quest: o.quest.id, step: o.index, text: o.step.text, have: o.have, need: o.need}; })(),
    quests: Object.fromEntries(story.quests.map(q => [q.id, quests.status(q.id)])), dialog: dialogCurrent ? {id: dialogCurrent.id, line: dialogIndex, queued: dialogQueue.map(d => d.id)} : null,
    boss: boss ? {id: boss.id, hp: boss.hp, active: boss.active, state: boss.state, phase: boss.phase, visible: boss.g.visible} : null, anchors: anchors.map(a => ({x: a.x, y: a.y, z: a.z, broken: a.broken})),
    near: near === 'portal' ? 'portal' : near?.id, target: currentTarget, npcs: [...npcs.values()].filter(n => n.present).map(n => ({id: n.id, x: n.x, y: n.y, z: n.z, marker: npcMarker(n.id)})),
    items: items.map(i => ({id: i.id, x: i.x, y: i.y, z: i.z, visible: i.m.visible})), enemies: enemies.map(e => ({kind: e.kind, x: e.x, z: e.z, state: e.state, hp: e.hp})),
    waves: waves.map(w => w.r), markers: markers.length, orbs: orbPool.filter(o => o.life > 0).length, gusts: gusts.map(e => ({age: e.age, meshes: e.g.children.length})),
    layout: {gems: gems.map(g => ({x: g.x, y: g.y, z: g.z, id: g.id})), torches: torches.map(t => ({x: t.x, y: t.y, z: t.z, id: t.id, lit: t.lit})), rings: flightRings.map(r => ({x: r.x, y: r.y, z: r.z})), updrafts: updrafts.map(u => ({x: u.x, y: u.y, z: u.z, height: u.height})), solids: solids.map(s => ({...s})), checkpoints}, settings: {...settings}, quality: {auto: autoLevel, scale: renderScale}}),
  teleport: (x, y, z, yaw = 0) => { Object.assign(state, {x, y, z, yaw, vy: 0, vx: 0, vz: 0, flight: false, dodge: 0}); },
  strike, talk, jump: jumpPress, flight, dodge, travel, pause, resume, advance, skipDialog, frame: animate, step: update, level: buildLevel, floorAt,
  finishDialog: () => { let guard = 0; while (mode === 'dialog' && guard++ < 500) { typing = null; advance(); } },
  hold: (what, v) => { if (what === 'jump') jumpHeld = v; if (what === 'attack') attackHeld = v; if (what === 'dive') diveHeld = v; },
  lose: () => { state.hp = 1; invulnerable = 0; hurt(); },
  perf: () => { let objects = 0; scene.traverse(() => objects++); const info = renderer.info?.render || {}; return {...lastPerf, calls: info.calls, triangles: info.triangles, pixelRatio: renderer.getPixelRatio?.(), objects, quality: settings.quality === 'auto' ? autoLevel : settings.quality, renderScale, geometries: renderer.info?.memory?.geometries, textures: renderer.info?.memory?.textures}; },
  autoAdjust, setQuality: q => { settings.quality = q; applySettings(); }, applySettings, settings
};
save = readSave(); $('continue').hidden = !save;
if (loadProblem && !save) { $('saveNote').hidden = false; $('saveNote').textContent = 'Ein vorhandener Spielstand konnte nicht gelesen werden. Er wird vor einem neuen Abenteuer gesichert und nicht gelöscht.'; }
if (canvasMode) { $('graphicsNotice').textContent = 'Vereinfachter 2D-Modus: Dieses Gerät stellt kein WebGL bereit. Geschichte, Steuerung und Spielstand sind identisch.'; }
const titleSave = save; save = save ? JSON.parse(JSON.stringify(save)) : Q.freshSave(); newEngine(); buildLevel(save.level, true); save = titleSave || save;
applySettings(); requestAnimationFrame(animate); if (!TEST) focusFirst('continue', 'start');
})();
