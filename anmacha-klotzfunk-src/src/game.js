// Spielkern: Rendering, Chunk-Streaming, Physik-Schleife, Bauen/Abbauen, Tag-Nacht, Speicherstand.
import * as THREE from 'three';
import { World, B, CS, H, NAMES, LOGO0, SPECIAL0, SPECIAL_COUNT, isLogo, normGen } from './world.js';
import { BLOCKS } from './blocks.js';
import { BIOME_NAMES } from './worldgen.js';
import { encodeEdits, decodeEdits, SAVE_VERSION } from './storage.js';
import { QUALITY } from './settings.js';
import { MAX_STACK } from './crafting.js';
import { buildMesh, cubeData } from './mesher.js';
import { drawAtlas, createLogoAtlas, cloudCanvas, drawItems, ITEM_TILE, ITEM_GRID } from './textures.js';
import { ITEMS, ITEM_LIST, I, isItem, nameOf, toolOf, foodOf, plantOf, mineTime, canHarvest, toolFits, known, armorOf, armorFactor } from './items.js';
import { BUILD_MODES, MAX_CELLS, shapeCells, bounds, copyRegion, pasteCells } from './build.js';
import { villageIn, regionOf } from './structures.js';
import { Farm, isCrop, cropDrops } from './farm.js';
import { Vitals, fallDamage } from './survival.js';
import { Mobs, rollDrops } from './mobs.js';
import { MobView } from './mobview.js';
import { Player, raycast, EYE } from './physics.js';
import { playBreak, playPlace, playDeny, setRadio } from './audio.js';
import { campaignOf, questProgress } from './quests.js';
import { solve, ON_ID, OFF_ID } from './signal.js';
import { nearestVillage } from './structures.js';

export const DAY_LENGTH = 480; // Sekunden pro Tag
const REACH = 6;

// Block-Shader: Beleuchtung pro Vertex aus Flächenrichtung, Sonne/Mond, Himmelslicht und Ambient Occlusion
const VERT = `
attribute vec4 aCol; varying vec2 vUv; varying vec3 vLight; varying float vDist; varying float vRb;
uniform vec3 uAmb; uniform vec3 uSunCol; uniform vec3 uSunDir;
void main(){
  float f = aCol.a;
  vec3 n = f < 0.5 ? vec3(1.,0.,0.) : f < 1.5 ? vec3(-1.,0.,0.) : f < 2.5 ? vec3(0.,0.,1.) : f < 3.5 ? vec3(0.,0.,-1.) : f < 4.5 ? vec3(0.,1.,0.) : vec3(0.,-1.,0.);
  float sky = aCol.g;
  vec3 amb = uAmb * (0.62 + 0.38 * (n.y * 0.5 + 0.5)) * (0.5 + 0.5 * sky);
  vec3 dir = uSunCol * max(dot(n, uSunDir), 0.0) * sky;
  vLight = max((amb + dir) * aCol.r, vec3(min(aCol.b, 1.0)));
  vRb = aCol.b > 1.5 ? 1.0 : 0.0;
  vUv = uv;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vDist = length(mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;
const FRAG = `
uniform sampler2D uMap; uniform vec3 uFog; uniform vec2 uFogRange; uniform float uCut; uniform float uTime;
varying vec2 vUv; varying vec3 vLight; varying float vDist; varying float vRb;
void main(){
  vec4 t = texture2D(uMap, vUv);
  if (t.a < uCut) discard;
  vec3 c = t.rgb * vLight;
  if (vRb > 0.5) { // Regenbogen-Block: wandernde Farben
    float hue = fract((vUv.x + vUv.y) * 14.0 + uTime * 0.25 + t.r * 0.35);
    vec3 rb = clamp(abs(fract(hue + vec3(0.0, 0.6667, 0.3333)) * 6.0 - 3.0) - 1.0, 0.0, 1.0);
    c = rb * (0.55 + 0.6 * t.r);
  }
  gl_FragColor = vec4(mix(c, uFog, smoothstep(uFogRange.x, uFogRange.y, vDist)), t.a);
}`;
const DOME_VERT = `varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }`;
const DOME_FRAG = `
uniform vec3 uHor; uniform vec3 uZen; uniform vec3 uSunN; uniform vec3 uGlow; varying vec3 vDir;
void main(){
  float h = clamp(vDir.y, 0.0, 1.0);
  vec3 c = mix(uHor, uZen, pow(h, 0.5));
  c += uGlow * pow(max(dot(normalize(vDir), uSunN), 0.0), 6.0);
  gl_FragColor = vec4(c, 1.0);
}`;
const CLOUD_VERT = `
uniform vec2 uOff; varying vec2 vUv; varying float vD;
void main(){ vec4 wp = modelMatrix * vec4(position, 1.0); vUv = (wp.xz + uOff) / 520.0; vD = length(position.xy) / 1200.0; gl_Position = projectionMatrix * viewMatrix * wp; }`;
const CLOUD_FRAG = `
uniform sampler2D uTex; uniform vec3 uCol; varying vec2 vUv; varying float vD;
void main(){ float a = texture2D(uTex, vUv).a * (1.0 - smoothstep(0.45, 0.95, vD)) * 0.9; gl_FragColor = vec4(uCol, a); }`;

const lerp = (a, b, t) => a + (b - a) * t;
const mix3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

export class Game {
  constructor(canvas, coarse, quality = 'auto') {
    this.coarse = coarse;
    const dpr = window.devicePixelRatio || 1;
    // Kantenglättung kostet auf schwachen Geräten viel – bei Eco und sehr dichten Handydisplays aus
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: quality !== 'eco' && !(coarse && dpr >= 2.5), powerPreference: 'high-performance' });
    this.maxDpr = coarse ? 1.75 : 2; this.dprScale = 1; this.budget = coarse ? 4 : 6; this.maxView = coarse ? 4 : 7;
    this.autoQ = false; this.cloudsOn = true; this.perf = { acc: 0, n: 0, good: 0 }; this.fps = 0; this.placeDelay = true;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(coarse ? 70 : 75, 1, 0.08, 1500);
    this.camera.rotation.order = 'YXZ';
    this.scene.add(this.camera);
    this.group = new THREE.Group();
    this.scene.add(this.group);

    // Texturen: weich gefiltert (Mipmaps + anisotrop) statt harter Pixel
    const aniso = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
    const mkTex = cv => {
      const t = new THREE.CanvasTexture(cv);
      t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.anisotropy = aniso; t.generateMipmaps = true;
      return t;
    };
    this.atlasCanvas = drawAtlas();
    this.atlasTex = new THREE.DataTexture(this.atlasCanvas.raw, this.atlasCanvas.width, this.atlasCanvas.height, THREE.RGBAFormat);
    this.atlasTex.magFilter = THREE.LinearFilter; this.atlasTex.minFilter = THREE.LinearMipmapLinearFilter;
    this.atlasTex.anisotropy = aniso; this.atlasTex.generateMipmaps = true; this.atlasTex.needsUpdate = true;
    this.logoCanvas = createLogoAtlas(() => { this.logoTex.needsUpdate = true; if (!this.running && this.world) this.render(); }, () => this.onLogos());
    this.logoTex = mkTex(this.logoCanvas);
    this.onLogos = () => {};

    this.uni = {
      uAmb: { value: new THREE.Vector3(0.44, 0.5, 0.62) }, uSunCol: { value: new THREE.Vector3(0.6, 0.57, 0.5) },
      uSunDir: { value: new THREE.Vector3(0, 1, 0.25).normalize() }, uFog: { value: new THREE.Vector3(0.68, 0.84, 0.95) },
      uFogRange: { value: new THREE.Vector2(40, 90) }, uTime: { value: 0 }
    };
    const mk = (map, cut, trans, uni) => new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG, transparent: trans, depthWrite: !trans, side: trans ? THREE.DoubleSide : THREE.FrontSide,
      uniforms: { ...uni, uMap: { value: map }, uCut: { value: cut } }
    });
    this.matO = mk(this.atlasTex, 0.5, false, this.uni);
    this.matT = mk(this.atlasTex, 0.02, true, this.uni);
    this.matL = mk(this.logoTex, 0.5, false, this.uni);

    // Himmelskuppel mit Farbverlauf, Sonnenschein-Glühen, Sonne/Mond (blockig), Sterne, Wolken
    this.sky = new THREE.Group();
    this.scene.add(this.sky);
    this.domeU = { uHor: { value: new THREE.Vector3() }, uZen: { value: new THREE.Vector3() }, uSunN: { value: new THREE.Vector3(1, 0, 0) }, uGlow: { value: new THREE.Vector3() } };
    const dome = new THREE.Mesh(new THREE.SphereGeometry(700, 20, 12), new THREE.ShaderMaterial({
      vertexShader: DOME_VERT, fragmentShader: DOME_FRAG, uniforms: this.domeU, side: THREE.BackSide, depthWrite: false, depthTest: false
    }));
    dome.renderOrder = -20; dome.frustumCulled = false;
    this.sky.add(dome);
    const quad = (size, color) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ color, fog: false, depthWrite: false }));
      m.renderOrder = -10; this.sky.add(m); return m;
    };
    this.sun = quad(80, 0xfff2b0);
    this.moon = quad(52, 0xdfe8ff);
    const sp = new Float32Array(300 * 3);
    for (let i = 0; i < 300; i++) {
      const u = Math.random() * 2 - 1, a = Math.random() * Math.PI * 2, r = Math.sqrt(1 - u * u);
      sp[i * 3] = Math.cos(a) * r * 600; sp[i * 3 + 1] = u * 600; sp[i * 3 + 2] = Math.sin(a) * r * 600;
    }
    const sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    this.starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 2, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false });
    this.stars = new THREE.Points(sg, this.starMat);
    this.stars.renderOrder = -15;
    this.sky.add(this.stars);

    const ct = new THREE.CanvasTexture(cloudCanvas());
    ct.wrapS = ct.wrapT = THREE.RepeatWrapping; ct.minFilter = THREE.LinearMipmapLinearFilter; ct.magFilter = THREE.LinearFilter;
    this.cloudU = { uTex: { value: ct }, uCol: { value: new THREE.Vector3(1, 1, 1) }, uOff: { value: new THREE.Vector2() } };
    this.clouds = new THREE.Mesh(new THREE.PlaneGeometry(2400, 2400), new THREE.ShaderMaterial({
      vertexShader: CLOUD_VERT, fragmentShader: CLOUD_FRAG, uniforms: this.cloudU, transparent: true, depthWrite: false, side: THREE.DoubleSide
    }));
    this.clouds.rotation.x = -Math.PI / 2; this.clouds.frustumCulled = false;
    this.chunkSphereR = Math.hypot(CS / 2, H / 2, CS / 2) + 1;
    this.scene.add(this.clouds);

    // Zielmarkierung
    const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.004, 1.004, 1.004));
    this.hl = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.75 }));
    this.hl.visible = false;
    this.scene.add(this.hl);
    // Platzierungsvorschau: wo der nächste Block bzw. die Form landet
    this.ghost = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, depthTest: false }));
    this.ghost.visible = false; this.ghost.renderOrder = 40;
    this.scene.add(this.ghost);
    this.buildMode = 0; this.anchor = null; this.clip = null; this.batch = null; this.preview = true;
    // Störimpuls der Drohnen
    this.beam = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineBasicMaterial({ color: 0xff2a6a }));
    this.beam.frustumCulled = false; this.beam.visible = false; this.beamT = 0; this.scene.add(this.beam);

    // Block in der Hand
    const handUni = {
      uAmb: { value: new THREE.Vector3(0.62, 0.64, 0.7) }, uSunCol: { value: new THREE.Vector3(0.5, 0.46, 0.38) },
      uSunDir: { value: new THREE.Vector3(0.35, 0.8, 0.5).normalize() }, uFog: { value: new THREE.Vector3() }, uFogRange: { value: new THREE.Vector2(1e5, 2e5) }, uTime: this.uni.uTime
    };
    const hm = map => { const m = mk(map, 0.5, false, handUni); m.depthTest = false; return m; };
    this.handMatO = hm(this.atlasTex); this.handMatL = hm(this.logoTex);
    this.hand = new THREE.Mesh(new THREE.BufferGeometry(), this.handMatO);
    this.hand.frustumCulled = false; this.hand.renderOrder = 50; this.hand.visible = false;
    this.camera.add(this.hand);
    // Gegenstand in der Hand: flaches Symbol aus dem Item-Atlas
    this.itemCanvas = drawItems(ITEM_LIST.map(id => ITEMS[id]));
    const it = new THREE.CanvasTexture(this.itemCanvas);
    it.magFilter = THREE.NearestFilter; it.minFilter = THREE.NearestFilter; it.generateMipmaps = false;
    this.itemHand = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: it, transparent: true, alphaTest: 0.5, depthTest: false, side: THREE.DoubleSide }));
    this.itemHand.frustumCulled = false; this.itemHand.renderOrder = 50; this.itemHand.visible = false;
    this.camera.add(this.itemHand);
    this.mobView = new MobView(this.scene); this.mobs = null; this.light = 1;
    this.handType = -1; this.swing = 0; this.bob = 0;

    this.parts = []; this.partCount = 0;

    // Seilhaken-Seil
    this.rope = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineBasicMaterial({ color: 0xffe08a }));
    this.rope.frustumCulled = false; this.rope.visible = false; this.scene.add(this.rope);
    this.hookT = 0; this.hookTarget = new THREE.Vector3(); this.wp = null; this.timeFrozen = false; this.radioT = 0;

    this.player = new Player();
    this.input = { f: 0, r: 0, jump: false, down: false, sprint: false };
    this.breakHeld = false; this.placeHeld = false; this.actCool = 0;
    this.world = null; this.running = false; this.raf = 0; this.last = 0;
    this.viewDist = coarse ? 4 : 7;
    this.offsets = [];
    this.setViewDist(this.viewDist);
    this.onChange = () => {};   // UI-Hinweis (Hotbar/Inventar geändert)
    this.onToast = () => {};
    this.story = null; this.onQuest = () => {}; this.onQuestDone = () => {};
    // Überleben: Rückmeldungen an die Oberfläche
    this.vitals = null; this.dead = false; this.mine = null; this.deathLoss = 'keep'; this.enemies = true;
    this.farm = new Farm(); this.age = 0; this.history = []; this.redoList = [];
    this.onVitals = () => {}; this.onHurt = () => {}; this.onDeath = () => {}; this.onMine = () => {}; this.onStation = () => {};
    this.onTrade = () => {}; this.onBuildMode = () => {};
    this.armor = { kopf: 0, brust: 0 }; this.armWear = { kopf: 0, brust: 0 };
    this.resize();
  }

  // ---------- Einstellungen ----------
  // Grafikstufe (siehe settings.js); auto = Stufe als Obergrenze, Pixeldichte und Sichtweite passen sich der Bildrate an
  setQuality(name, auto) {
    const q = QUALITY[name] || QUALITY.standard;
    this.qName = name; this.autoQ = !!auto;
    this.maxDpr = q.dpr; this.dprScale = 1; this.budget = q.budget; this.cloudsOn = q.clouds; this.maxView = q.view;
    this.perf.acc = this.perf.n = this.perf.good = 0;
    if (this.menuMode) this.savedView = q.view; else this.setViewDist(q.view);
    this.resize();
  }

  // Bildrate messen (alle 2 s) und bei „Automatisch“ nachregeln
  measure(ms) {
    const pf = this.perf;
    if (ms > 250) return; // Pausen/Tab-Wechsel nicht mitzählen
    pf.acc += ms; pf.n++;
    if (pf.acc < 2000) return;
    const avg = pf.acc / pf.n; pf.acc = pf.n = 0;
    this.fps = Math.round(1000 / avg);
    if (!this.autoQ || this.menuMode) return;
    if (avg > 26) { // unter ~38 Bilder/s: erst Auflösung, dann Sichtweite senken
      pf.good = 0;
      if (this.dprScale > 0.6) { this.dprScale = Math.max(0.6, this.dprScale - 0.15); this.resize(); }
      else if (this.viewDist > 3) this.setViewDist(this.viewDist - 1);
    } else if (avg < 18 && ++pf.good >= 3) { // stabil über ~55 Bilder/s: langsam wieder hoch
      pf.good = 0;
      if (this.dprScale < 1) { this.dprScale = Math.min(1, this.dprScale + 0.1); this.resize(); }
      else if (this.viewDist < this.maxView) this.setViewDist(this.viewDist + 1);
    }
  }

  setViewDist(r) {
    this.viewDist = r;
    const dataR = r + 2, list = [];
    for (let dz = -dataR - 1; dz <= dataR + 1; dz++) for (let dx = -dataR - 1; dx <= dataR + 1; dx++) {
      const d = Math.hypot(dx, dz);
      if (d <= dataR) list.push([dx, dz, d]);
    }
    list.sort((a, b) => a[2] - b[2]);
    this.offsets = list;
    this.scanDirty = true;
  }

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.maxDpr) * this.dprScale);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    if (!this.running && this.world) this.render();
  }

  // ---------- Welt starten / laden ----------
  start(save) {
    this.stop();
    this.clearWorld();
    this.leaveMenu();
    // Generator: alte Spielstände (ohne Angabe) behalten exakt ihre Originalwelt
    this.gen = normGen(save.gen);
    this.world = new World(save.seed, decodeEdits(save.edits), this.gen);
    this.name = save.name; this.seed = save.seed; this.mode = save.mode;
    this.time = save.time ?? 0.08;
    this.hotbar = (Array.isArray(save.hotbar) && save.hotbar.length === 9) ? save.hotbar.map(t => (Number.isInteger(t) && known(t) ? t : 0)) : [1, 2, 3, 4, 5, 6, 7, 8, 9];
    this.sel = save.sel ?? 0;
    this.inv = save.inv ? { ...save.inv } : { [B.DIRT]: 20, [B.PLANKS]: 10, [B.GLASS]: 4 };
    // neue Story-Welten (Generator 3) spielen „Das große Rauschen“, alte die 15 Aufträge
    this.story = save.mode === 'story' ? (save.story ? { ...save.story } : { i: 0, p: 0, max: 0, done: false, c: this.gen === 3 ? 'rauschen' : undefined }) : null;
    if (this.story && !this.story.c) delete this.story.c;
    this.sigStats = { receivers: 0, machines: 0, reach: 0, senders: 0 }; this.sigRetry = false;
    if (!save.inv && save.mode === 'survival') {
      for (let i = 0; i < 16; i++) this.inv[LOGO0 + i] = 4;
      for (let i = 0; i < SPECIAL_COUNT; i++) this.inv[SPECIAL0 + i] = 8;
    }
    this.wp = save.wp || null; this.hookT = 0; this.rope.visible = false; this.timeFrozen = false;
    this.handType = -1;
    // Überleben (nur im Überlebensmodus): Gesundheit/Hunger, Werkzeug-Abnutzung, Grab mit verlorenen Sachen
    // Story ab Generator 3 („Das große Rauschen“) spielt mit den Überlebensregeln; alte Story-Welten bleiben wie gehabt
    this.survival = save.mode === 'survival' || (save.mode === 'story' && this.gen === 3);
    this.vitals = this.survival ? new Vitals(save.vit || {}) : null;
    this.dead = false; this.mine = null; this.player.impact = 0;
    this.dur = {};
    if (save.dur && typeof save.dur === 'object') for (const [k, v] of Object.entries(save.dur)) if (toolOf(Number(k)) && Number.isFinite(v)) this.dur[k] = v;
    this.armor = { kopf: 0, brust: 0 }; this.armWear = { kopf: 0, brust: 0 };
    if (Array.isArray(save.arm)) ['kopf', 'brust'].forEach((sl, i) => {
      const a = armorOf(save.arm[i]);
      if (a && a.slot === sl) { this.armor[sl] = save.arm[i]; this.armWear[sl] = Math.max(0, Math.min(a.dur - 1, save.arm[i + 2] | 0)); }
    });
    this.buildMode = 0; this.anchor = null; this.clip = null; this.batch = null;
    const g = save.grave;
    this.grave = g && [g.x, g.y, g.z].every(Number.isFinite) && g.inv && typeof g.inv === 'object' ? g : null;
    // Tiere: in Überleben und Kreativ (Story bleibt unverändert)
    this.mobs = new Mobs(this.world, save.seed, save.mobs, save.mode !== 'story' || this.gen === 3);
    if (this.gen === 3) this.mobs.findVillages = (px, pz) => { // Dörfer der Region und der Nachbarregionen
      const out = [], rx = regionOf(px), rz = regionOf(pz);
      for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) { const v = villageIn(this.seed, rx + dx, rz + dz); if (v) out.push(v); }
      return out;
    };
    this.mobs.onAdd = m => this.mobView.add(m); this.mobs.onRemove = m => this.mobView.remove(m);
    this.mobs.onAttack = m => this.mobHits(m);
    this.mobs.onPoof = m => this.spawnBreak(m.x - 0.5, m.y + 0.5, m.z - 0.5, B.BASALT);
    // Landwirtschaft: gespielte Zeit (Sekunden) als Uhr für das Wachstum
    this.age = Number.isFinite(save.age) && save.age >= 0 ? save.age : 0;
    this.farm = new Farm(save.farm); this.farmT = 0;
    this.history = []; this.redoList = []; // Rückgängig/Wiederholen (Kreativ)
    this.spawn = this.world.findSpawn(save.mode !== 'story');
    this.spawnY = this.spawn.y;
    const p = this.player;
    if (save.px !== undefined) { p.x = save.px; p.y = save.py; p.z = save.pz; this.yaw = save.yaw || 0; this.pitch = save.pitch || 0; }
    else { p.x = this.spawn.x; p.y = this.spawn.y; p.z = this.spawn.z; this.yaw = 0; this.pitch = -0.1; }
    p.vx = p.vy = p.vz = 0; p.flying = false; p.onGround = false;
    this.target = null; this.unsaved = false;
    // Umgebung sofort bereitstellen, damit nichts unter dem Spieler fehlt
    this.loadAround(2, 1);
    this.scanDirty = true;
    this.lastPC = null;
    this.applyCamera();
    this.updateSky();
    this.resume();
  }

  // ---------- Menü-Kulisse: kreisende Kamera über einer kleinen Schaubühne ----------
  startMenu() {
    this.stop();
    this.clearWorld();
    this.menuMode = true;
    this.savedView = this.savedView ?? this.viewDist;
    this.setViewDist(Math.min(this.viewDist, 4));
    this.world = new World(20241, new Map(), 1); // Menü-Kulisse: offene Originalwelt (freie Sicht auf die Bühne)
    this.mode = 'creative'; this.time = 0.06; this.menuT = 0; this.hotbar = new Array(9).fill(0); this.sel = 0; this.inv = {};
    const sp = this.world.findSpawn(), p = this.player, w = this.world;
    p.x = sp.x; p.z = sp.z; p.y = sp.y; p.flying = false; p.vx = p.vy = p.vz = 0; p.hook = false;
    this.loadAround(3, 2);
    // Bühne: ebene Fläche mit Logo-Podest, Neon-Säulen, Regenbogen-Spitzen und Radio
    const cx = Math.floor(sp.x), cz = Math.floor(sp.z), gy = Math.floor(sp.y) - 1;
    for (let x = cx - 5; x <= cx + 5; x++) for (let z = cz - 5; z <= cz + 5; z++) {
      for (let y = gy + 1; y <= gy + 9; y++) w.setBlock(x, y, z, B.AIR);
      w.setBlock(x, gy, z, (x + z) & 1 ? B.MARBLE : B.STONE);
    }
    for (let i = 0; i < 16; i++) w.setBlock(cx - 2 + (i % 4), gy + 1, cz - 2 + (i >> 2), LOGO0 + i);
    const neon = [B.NEON_R, B.NEON_B, B.NEON_G, B.NEON_P];
    [[-3, -3], [3, -3], [3, 3], [-3, 3]].forEach(([dx, dz], k) => {
      for (let y = 1; y <= 4; y++) w.setBlock(cx + dx, gy + y, cz + dz, neon[k]);
      w.setBlock(cx + dx, gy + 5, cz + dz, B.RAINBOW);
    });
    w.setBlock(cx, gy + 2, cz, B.RADIO);
    for (let y = 3; y <= 5; y++) w.setBlock(cx, gy + y, cz, B.FEDER);
    w.setBlock(cx, gy + 6, cz, B.RAINBOW);
    this.menuC = { x: cx + 0.5, y: gy + 3, z: cz + 0.5 };
    this.flushDirty();
    this.hand.visible = false; this.hl.visible = false; this.rope.visible = false;
    this.scanDirty = true; this.lastPC = null;
    this.menuStep(0);
    this.resume();
  }

  leaveMenu() {
    if (!this.menuMode) return;
    this.menuMode = false;
    if (this.savedView != null) { this.setViewDist(this.savedView); this.savedView = null; }
  }

  menuStep(dt) {
    this.menuT += dt;
    this.time = (this.time + dt / 150) % 1;
    const c = this.menuC, a = this.menuT * 0.07, r = 15 + Math.sin(this.menuT * 0.05) * 2.5, h = 4.5 + Math.sin(this.menuT * 0.11) * 1.5;
    this.camera.position.set(c.x + Math.cos(a) * r, c.y + h, c.z + Math.sin(a) * r);
    this.camera.lookAt(c.x, c.y - 3.2, c.z); // Bühne rückt im Bild nach oben, hinter den Titel
    this.stream();
    this.flushDirty();
    this.uni.uTime.value = performance.now() / 1000;
    this.updateSky();
    this.cloudU.uOff.value.x += dt * 2.5;
  }

  clearWorld() {
    for (const c of this.group.children.slice()) { c.geometry.dispose(); this.group.remove(c); }
    if (this.mobs) { this.mobs.clear(); this.mobs = null; }
    this.mobView.clear();
    this.vitals = null; this.dead = false;
    this.world = null;
  }

  // synchron: Daten bis Radius rd, Meshes bis Radius rm (Chunks)
  loadAround(rd, rm) {
    const pcx = Math.floor(this.player.x / CS), pcz = Math.floor(this.player.z / CS);
    for (let dz = -rd; dz <= rd; dz++) for (let dx = -rd; dx <= rd; dx++) this.world.ensure(pcx + dx, pcz + dz);
    for (let dz = -rm; dz <= rm; dz++) for (let dx = -rm; dx <= rm; dx++) this.applyMesh(this.world.getChunk(pcx + dx, pcz + dz));
  }

  serialize() {
    const p = this.player, edits = encodeEdits(this.world.edits);
    return {
      v: SAVE_VERSION, gen: this.gen, name: this.name, seed: this.seed, mode: this.mode, time: this.time, savedAt: Date.now(),
      px: p.x, py: p.y, pz: p.z, yaw: this.yaw, pitch: this.pitch, hotbar: this.hotbar, sel: this.sel, inv: this.inv, wp: this.wp, story: this.story, edits,
      vit: this.vitals ? this.vitals.toJSON() : undefined, dur: this.dur, grave: this.grave || undefined, mobs: this.mobs ? this.mobs.serialize() : undefined,
      age: Math.round(this.age), farm: this.farm.plants.size ? this.farm.serialize() : undefined,
      arm: this.armor.kopf || this.armor.brust ? [this.armor.kopf, this.armor.brust, this.armWear.kopf, this.armWear.brust] : undefined
    };
  }

  respawn() {
    const p = this.player;
    this.world.ensure(Math.floor(this.spawn.x / CS), Math.floor(this.spawn.z / CS));
    p.x = this.spawn.x; p.y = this.spawn.y; p.z = this.spawn.z; p.vx = p.vy = p.vz = 0; p.flying = false; p.impact = 0;
    this.hookT = 0; this.rope.visible = false;
    this.loadAround(1, 0);
    this.scanDirty = true;
    this.applyCamera();
    if (!this.running) this.render();
  }

  // ---------- Schleife ----------
  resume() {
    if (this.running) return;
    this.running = true; this.last = performance.now();
    this.raf = requestAnimationFrame(t => this.frame(t));
  }
  stop() { this.running = false; cancelAnimationFrame(this.raf); setRadio(0, 0); }

  frame(now) {
    if (!this.running) return;
    this.raf = requestAnimationFrame(t => this.frame(t));
    if (this.menuMode && now - this.last < 32) return; // Menü-Kulisse: ca. 30 Bilder/s genügen
    this.measure(now - this.last);
    const dt = Math.max(0, Math.min(0.05, (now - this.last) / 1000)); // rAF-Zeitstempel kann knapp vor resume() liegen
    this.last = now;
    if (this.menuMode) this.menuStep(dt); else this.step(dt);
    this.render();
  }

  step(dt) {
    const w = this.world, p = this.player;
    if (!this.timeFrozen) this.time = (this.time + dt / DAY_LENGTH) % 1;
    this.uni.uTime.value = performance.now() / 1000;
    if (!this.dead) {
      this.updateHook(dt);
      p.update(w, dt, this.input, this.yaw);
      if (p.bounces) { this.questEvent('bounce', 0, p.bounces); p.bounces = 0; }
      if (this.story && p.gliding) this.glideAcc = (this.glideAcc || 0) + dt;
      if (this.vitals && !p.waiting) this.updateVitals(dt);
    }
    this.applyCamera();
    this.stream();
    const night = this.time > 0.52 && this.time < 0.98; // Sonne unter dem Horizont
    if (this.mobs) {
      this.mobs.update(dt, p.x, p.z, { py: p.y, night, time: this.time, hostiles: this.survival && this.enemies && !this.dead });
      this.mobView.update(p.x, p.z, this.light, this.viewDist * CS, this.uni.uTime.value);
    }
    if (!this.dead) this.age += dt;
    this.farmT -= dt;
    if (this.farmT <= 0) { this.farmT = 2; if (this.farm.update(this.world, this.age)) this.unsaved = true; }
    // Zielblock und Aktionen
    const c = this.camera, dir = this.lookDir || (this.lookDir = new THREE.Vector3());
    dir.set(0, 0, -1).applyEuler(c.rotation);
    this.target = this.dead ? null : raycast(w, c.position.x, c.position.y, c.position.z, dir.x, dir.y, dir.z, REACH);
    if (this.target) { this.hl.position.set(this.target.x + 0.5, this.target.y + 0.5, this.target.z + 0.5); this.hl.visible = true; }
    else this.hl.visible = false;
    this.updateGhost();
    if (this.beamT > 0 && (this.beamT -= dt) <= 0) this.beam.visible = false;
    this.actCool -= dt;
    if (this.placeHeld && !this.prevPlace) this.placeFirst = true; // neuer Tastendruck
    this.prevPlace = this.placeHeld;
    if (this.breakHeld && !this.dead) this.useBreak(dt, dir);
    else {
      this.setMine(null);
      if (this.actCool <= 0 && this.placeHeld && !this.dead && this.placeBlock()) {
        // erst nach kurzem Halten wiederholen: verhindert versehentliche Doppel-Blöcke (vor allem am Handy)
        this.actCool = this.placeFirst && this.placeDelay ? 0.45 : 0.25; this.placeFirst = false;
      }
    }
    this.flushDirty();
    this.updateSky();
    this.cloudU.uOff.value.x += dt * 2.5;
    this.radioT -= dt;
    if (this.world.sigDirty || (this.sigRetry && this.radioT <= 0)) this.updateSignals();
    if (this.radioT <= 0) { this.radioT = 0.3; this.updateRadio(); this.questTick(); this.checkGrave(); }
    this.updateHand(dt);
    if (this.partCount) this.updateParticles(dt);
  }

  // ---------- Überleben ----------
  updateVitals(dt) {
    const v = this.vitals, p = this.player, before = [Math.ceil(v.hp), Math.ceil(v.food), Math.ceil(v.air)];
    let dmg = 0;
    if (p.impact) { const f = fallDamage(p.impact); p.impact = 0; if (f && !p.inWater) { v.hurt(f, 'Sturz'); dmg += f; } }
    const onMagma = p.onGround && this.world.getBlock(Math.floor(p.x), Math.floor(p.y - 0.05), Math.floor(p.z)) === B.MAGMA;
    dmg += v.tick(dt, { moving: Math.hypot(p.vx, p.vz) > 0.5, sprint: this.input.sprint, eyeWater: p.eyeWater, onMagma });
    if (dmg > 0) { this.onHurt(dmg, v.cause); this.unsaved = true; }
    if (v.dead) { this.die(v.cause); return; }
    if (before[0] !== Math.ceil(v.hp) || before[1] !== Math.ceil(v.food) || before[2] !== Math.ceil(v.air)) this.onVitals();
  }

  die(cause) {
    const p = this.player;
    this.dead = true; this.breakHeld = this.placeHeld = false; this.hookT = 0; this.rope.visible = false; this.setMine(null);
    p.vx = p.vy = p.vz = 0;
    const at = { x: Math.round(p.x), y: Math.round(p.y), z: Math.round(p.z) };
    let grave = false;
    if (this.deathLoss === 'grave') { // Vorrat bleibt am Todesort liegen und lässt sich dort abholen
      const inv = {};
      for (const [t, n] of Object.entries(this.inv)) if (n > 0) inv[t] = n;
      if (Object.keys(inv).length) {
        if (this.grave) for (const [t, n] of Object.entries(this.grave.inv)) inv[t] = Math.min(MAX_STACK, (inv[t] || 0) + n);
        this.grave = { ...at, inv }; this.inv = {}; grave = true;
      }
    }
    this.wp = at; // Rückweg-Markierung
    this.unsaved = true;
    this.onDeath(cause, grave);
  }

  revive() {
    if (!this.dead) return;
    this.vitals = new Vitals(); this.dead = false; this.player.impact = 0;
    this.respawn();
    this.onVitals(); this.onChange();
  }

  checkGrave() {
    const g = this.grave, p = this.player;
    if (!g || this.dead || Math.hypot(g.x - p.x, g.y - p.y, g.z - p.z) > 2.5) return;
    for (const [t, n] of Object.entries(g.inv)) if (known(Number(t))) this.inv[t] = Math.min(MAX_STACK, (this.inv[t] || 0) + n);
    if (this.wp && this.wp.x === g.x && this.wp.z === g.z) this.wp = null;
    this.grave = null; this.unsaved = true; playPlace();
    this.onToast('Deine Sachen sind wieder da'); this.onChange();
  }

  // gehaltener Gegenstand, nur wenn auch im Vorrat (Kreativ: immer)
  held() {
    const t = this.hotbar[this.sel];
    return t && (this.mode === 'creative' || this.inv[t] > 0) ? t : 0;
  }

  setMine(m) {
    const had = !!this.mine;
    this.mine = m;
    if (had || m) this.onMine(m ? Math.min(1, m.t / m.need) : 0);
  }

  // Abbauen / Angreifen (gehaltene Taste)
  useBreak(dt, dir) {
    if (this.actCool > 0) return;
    const c = this.camera.position, t = this.target;
    const mh = this.mobs ? this.mobs.raycast(c.x, c.y, c.z, dir.x, dir.y, dir.z, REACH) : null;
    if (mh && (!t || mh.t < t.t)) { this.attack(mh.mob); this.actCool = 0.45; this.setMine(null); return; }
    if (!this.survival) { this.setMine(null); if (this.breakBlock()) this.actCool = 0.22; return; }
    if (!t || t.y === 0) { this.setMine(null); return; }
    const held = this.held();
    if (!canHarvest(t.type, held)) {
      playDeny(); this.onToast(`${NAMES[t.type]} braucht eine ${BLOCKS[t.type].tier > 1 ? 'Stein- oder bessere ' : ''}Spitzhacke`);
      this.actCool = 0.8; this.setMine(null); return;
    }
    let m = this.mine;
    if (!m || m.x !== t.x || m.y !== t.y || m.z !== t.z || m.held !== held) m = { x: t.x, y: t.y, z: t.z, held, t: 0, need: mineTime(t.type, held), sw: 0 };
    m.t += dt; m.sw -= dt;
    if (m.sw <= 0) { m.sw = 0.25; this.swing = 1; }
    if (m.t >= m.need) { this.setMine(null); if (this.breakBlock()) this.actCool = 0.1; return; }
    this.setMine(m);
  }

  attack(mob) {
    if (mob.npc) { this.onToast(`${mob.name}: „He, nicht hauen! Lass uns lieber tauschen.“`); this.actCool = 0.8; return; }
    const held = this.held(), tool = toolOf(held), p = this.player;
    const dmg = this.mode === 'creative' ? 99 : !tool ? 1 : tool.kind === 'schwert' ? tool.dmg : tool.kind === 'axt' ? 3 : 2;
    this.swing = 1; playBreak();
    if (tool && tool.kind === 'schwert') this.wear(held);
    if (!mob.hit(dmg, p.x, p.z)) return;
    this.spawnBreak(mob.x - 0.5, mob.y, mob.z - 0.5, B.WOOL);
    this.mobs.remove(mob, false);
    this.unsaved = true;
    this.questEvent('kill', mob.type);
    if (this.mode === 'creative') return;
    const got = rollDrops(mob.type).map(([id, n]) => { this.inv[id] = Math.min(MAX_STACK, (this.inv[id] || 0) + n); return `+${n} ${nameOf(id)}`; });
    if (got.length) this.onToast(got.join(' · '));
    this.onChange();
  }

  // Gegner trifft den Spieler (Treffer nur mit freier Sicht, siehe mobs.js)
  mobHits(m) {
    const v = this.vitals, p = this.player;
    if (!v || this.dead) return;
    const d = Math.hypot(p.x - m.x, p.z - m.z) || 1;
    if (m.T.range) { // Störimpuls als kurzer Strahl, ohne Rückstoß
      const pos = this.beam.geometry.attributes.position;
      pos.setXYZ(0, m.x, m.y + 0.3, m.z); pos.setXYZ(1, p.x, p.y + 1.2, p.z); pos.needsUpdate = true;
      this.beam.visible = true; this.beamT = 0.15;
    } else { p.vx += (p.x - m.x) / d * 6; p.vz += (p.z - m.z) / d * 6; p.vy = Math.max(p.vy, 5); p.onGround = false; }
    const dmg = m.T.dmg * armorFactor(this.armorPoints());
    this.wearArmor();
    v.hurt(dmg, m.T.name); playDeny();
    this.onHurt(dmg, m.T.name); this.onVitals(); this.unsaved = true;
    if (v.dead) this.die(m.T.name);
  }

  // ---------- Rückgängig / Wiederholen (nur Kreativ, sonst ließen sich Blöcke vermehren) ----------
  // Ein Eintrag = Liste von Änderungen [x, y, z, vorher, nachher]; Formen und Einfügen sind ein Schritt
  record(x, y, z, from, to) {
    if (this.mode !== 'creative') return;
    if (this.batch) { this.batch.push([x, y, z, from, to]); return; }
    this.history.push([[x, y, z, from, to]]);
    if (this.history.length > 100) this.history.shift();
    this.redoList.length = 0;
  }
  beginBatch() { this.batch = []; }
  endBatch() {
    const b = this.batch; this.batch = null;
    if (b && b.length) { this.history.push(b); if (this.history.length > 100) this.history.shift(); this.redoList.length = 0; }
  }
  undo(redo = false) {
    if (this.mode !== 'creative') { this.onToast('Rückgängig gibt es im Kreativmodus'); return false; }
    const src = redo ? this.redoList : this.history, dst = redo ? this.history : this.redoList;
    const e = src.pop();
    if (!e) { this.onToast(redo ? 'Nichts zum Wiederholen' : 'Nichts zum Rückgängigmachen'); return false; }
    const list = redo ? e : e.slice().reverse();
    for (const [x, y, z, from, to] of list) { this.world.ensure(x >> 4, z >> 4); this.world.setBlock(x, y, z, redo ? to : from); }
    dst.push(e); this.unsaved = true; playPlace();
    if (!this.running) { this.flushDirty(); this.render(); }
    return true;
  }

  // Hacke: Gras/Erde zu Ackerboden (nur mit freiem Raum darüber)
  hoe(held) {
    const t = this.target;
    if (!t || ![B.GRASS, B.DIRT, B.FLOWERS, B.MYCEL].includes(t.type) || this.world.getBlock(t.x, t.y + 1, t.z) !== B.AIR) return false;
    if (!this.world.setBlock(t.x, t.y, t.z, B.FARMLAND)) return false;
    this.record(t.x, t.y, t.z, t.type, B.FARMLAND);
    this.wear(held); this.swing = 1; playPlace(); this.unsaved = true; this.onChange();
    return true;
  }

  // Samen auf Ackerboden setzen
  sow(type) {
    const t = this.target;
    if (!t || t.type !== B.FARMLAND || this.world.getBlock(t.x, t.y + 1, t.z) !== B.AIR) { this.onToast('Samen brauchen Ackerboden (Hacke auf Gras oder Erde)'); this.actCool = 0.6; return false; }
    if (this.mode !== 'creative' && !(this.inv[type] > 0)) { playDeny(); this.onToast(`Keine ${nameOf(type)} im Vorrat`); this.actCool = 0.4; return false; }
    if (!this.farm.plant(t.x, t.y + 1, t.z, this.age)) { this.onToast('Zu viele Pflanzen in dieser Welt'); return false; }
    this.world.setBlock(t.x, t.y + 1, t.z, plantOf(type));
    this.record(t.x, t.y + 1, t.z, B.AIR, plantOf(type));
    if (this.mode !== 'creative') this.inv[type]--;
    this.swing = 1; playPlace(); this.unsaved = true; this.onChange();
    return true;
  }

  eat(type) {
    if (!this.vitals) { this.onToast('Essen braucht man nur im Überlebensmodus'); this.actCool = 0.6; return false; }
    if (!(this.inv[type] > 0)) { playDeny(); this.onToast(`Kein ${nameOf(type)} im Vorrat`); this.actCool = 0.4; return false; }
    if (!this.vitals.eat(foodOf(type))) { this.onToast('Du bist satt'); this.actCool = 0.6; return false; }
    this.inv[type]--; this.swing = 1; playPlace(); this.unsaved = true;
    this.onChange(); this.onVitals();
    return true;
  }

  // Werkzeug nutzt sich ab; Haltbarkeit gilt für das oberste Werkzeug des Stapels
  wear(held) {
    const tool = toolOf(held);
    if (!tool || this.mode === 'creative') return;
    const used = (this.dur[held] || 0) + 1;
    if (used < tool.dur) { this.dur[held] = used; return; }
    delete this.dur[held];
    this.inv[held] = Math.max(0, (this.inv[held] || 0) - 1);
    playDeny(); this.onToast(`${nameOf(held)} ist zerbrochen`);
  }

  // Stationen (Werkbank, Ofen) in Reichweite des Spielers
  stationsNear(r = 4) {
    const out = new Set(), p = this.player, w = this.world;
    if (!w) return out;
    const x0 = Math.floor(p.x), y0 = Math.floor(p.y), z0 = Math.floor(p.z);
    for (let y = y0 - 2; y <= y0 + 3; y++) for (let z = z0 - r; z <= z0 + r; z++) for (let x = x0 - r; x <= x0 + r; x++) {
      const b = BLOCKS[w.getBlock(x, y, z)];
      if (b && b.station) out.add(b.station);
    }
    return out;
  }

  // ---------- Funknetz: nur bei Änderungen neu berechnen, Maschinen umschalten ----------
  updateSignals() {
    const w = this.world, p = this.player, r = solve(w.sig);
    this.sigStats = r; this.sigRetry = false;
    for (const [k, n] of w.sig) {
      const t = n[3], base = OFF_ID[t] ?? t;
      if (!ON_ID[base]) continue;
      const want = r.on.has(k) ? ON_ID[base] : base;
      if (want === t) continue;
      // ein Tor schließt nicht, solange der Spieler darin steht
      if (want === B.GATE && p.x + 0.3 > n[0] && p.x - 0.3 < n[0] + 1 && p.z + 0.3 > n[2] && p.z - 0.3 < n[2] + 1 && p.y + 1.8 > n[1] && p.y < n[1] + 1) { this.sigRetry = true; continue; }
      w.setBlock(n[0], n[1], n[2], want);
    }
    w.sigDirty = false; // eigene Umschaltungen ändern das Ergebnis nicht
    if (r.capped) this.onToast('Signalnetz zu groß: nicht alles wird berechnet');
  }

  // ---------- Seilhaken, Wegpunkt, Radio ----------
  fireHook() {
    if (!this.running) return;
    const c = this.camera, d = new THREE.Vector3(0, 0, -1).applyEuler(c.rotation);
    const r = raycast(this.world, c.position.x, c.position.y, c.position.z, d.x, d.y, d.z, 40);
    if (!r) { playDeny(); this.onToast('Seilhaken: kein Ziel in Reichweite'); return; }
    this.hookTarget.set(r.x + 0.5 + r.nx * 0.9, r.y + 0.5 + r.ny * 0.9, r.z + 0.5 + r.nz * 0.9);
    this.hookT = 1.6; playPlace();
    this.questEvent('hook', 0);
  }

  updateHook(dt) {
    const p = this.player;
    p.hook = false;
    if (this.hookT <= 0) { this.rope.visible = false; return; }
    this.hookT -= dt;
    const t = this.hookTarget, dx = t.x - p.x, dy = t.y - (p.y + EYE), dz = t.z - p.z, dist = Math.hypot(dx, dy, dz);
    if (dist < 2 || this.hookT <= 0) {
      this.hookT = 0; this.rope.visible = false;
      p.vx *= 0.6; p.vz *= 0.6; p.vy = Math.max(p.vy * 0.6, 3);
      return;
    }
    const k = 24 / dist;
    p.vx = dx * k; p.vy = dy * k; p.vz = dz * k; p.hook = true;
    const pos = this.rope.geometry.attributes.position;
    pos.setXYZ(0, p.x + 0.3, p.y + EYE - 0.35, p.z); pos.setXYZ(1, t.x, t.y, t.z); pos.needsUpdate = true;
    this.rope.visible = true;
  }

  toggleWaypoint() {
    const p = this.player;
    if (this.wp && Math.hypot(this.wp.x - p.x, this.wp.z - p.z) < 4) { this.wp = null; this.onToast('Wegpunkt entfernt'); }
    else { this.wp = { x: Math.round(p.x), y: Math.round(p.y), z: Math.round(p.z) }; this.onToast('Wegpunkt gesetzt'); }
    this.unsaved = true;
  }

  // Musik des nächsten Radio-Blocks, leiser mit Abstand
  updateRadio() {
    const p = this.player;
    let best = 1e9, seed = 0;
    for (const r of this.world.radios.values()) {
      const d = Math.hypot(r[0] + 0.5 - p.x, r[1] + 0.5 - (p.y + 1), r[2] + 0.5 - p.z);
      if (d < best) { best = d; seed = (r[0] * 7 + r[2] * 13 + r[1]) >>> 0; }
    }
    this.radioDist = best;
    setRadio(best < 24 ? Math.pow(1 - best / 24, 1.5) : 0, seed);
  }

  // ---------- Story: feste Aufträge ----------
  questTick() {
    const s = this.story;
    if (!s || s.done) return;
    const q = campaignOf(s)[s.i];
    if (q.k === 'height') s.max = Math.max(s.max, this.player.y - this.spawnY);
    if (q.k === 'glide' && this.glideAcc) { s.p += this.glideAcc; }
    if (q.k === 'depth' && this.player.y < q.y) s.p = 1;
    if (q.k === 'visit' && this.world.villageAt(this.player.x, this.player.z)) s.p = 1;
    this.glideAcc = 0;
    this.questCheck();
  }

  questEvent(kind, type, n = 1) {
    const s = this.story;
    if (!s || s.done) return;
    const q = campaignOf(s)[s.i];
    if (q.k === 'have') { this.questCheck(); return; }
    if (q.k !== kind || (q.a && !q.a.includes(type))) return;
    s.p += n;
    this.questCheck();
  }

  questCheck() {
    const s = this.story, list = campaignOf(s);
    for (let guard = 0; s && !s.done && guard < list.length; guard++) {
      const q = list[s.i], [cur, n] = questProgress(this, q);
      if (cur < n) break;
      for (const [t, c] of Object.entries(q.r || {})) this.inv[t] = Math.min(MAX_STACK, (this.inv[t] || 0) + c);
      s.i++; s.p = 0; s.max = 0;
      if (s.i >= list.length) s.done = true;
      else if (list[s.i].k === 'visit') { // Wegpunkt zum nächsten Dorf
        const v = nearestVillage(this.seed, this.player.x, this.player.z);
        if (v) this.wp = { x: v.x, y: v.y + 1, z: v.z };
      }
      this.unsaved = true; playPlace();
      this.onQuestDone(q, s.done);
      this.onChange();
    }
    this.onQuest();
  }

  // ---------- Hand-Block und Bruchstücke ----------
  updateHand(dt) {
    const t = this.hotbar[this.sel];
    if (t !== this.handType) {
      this.handType = t;
      this.hand.visible = t > 0 && !isItem(t);
      this.itemHand.visible = isItem(t) && !!ITEMS[t];
      if (this.itemHand.visible) { // UV auf das Symbol im Item-Atlas setzen
        const k = ITEMS[t].icon, rows = this.itemCanvas.height / ITEM_TILE, u0 = (k % ITEM_GRID) / ITEM_GRID, u1 = u0 + 1 / ITEM_GRID;
        const v1 = 1 - Math.floor(k / ITEM_GRID) / rows, v0 = v1 - 1 / rows, uv = this.itemHand.geometry.attributes.uv;
        uv.setXY(0, u0, v1); uv.setXY(1, u1, v1); uv.setXY(2, u0, v0); uv.setXY(3, u1, v0); uv.needsUpdate = true;
      }
      if (this.hand.visible) {
        const d = cubeData(t), g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.BufferAttribute(d.pos, 3)); g.setAttribute('uv', new THREE.BufferAttribute(d.uv, 2));
        g.setAttribute('aCol', new THREE.BufferAttribute(d.col, 4)); g.setIndex(new THREE.BufferAttribute(d.idx, 1));
        this.hand.geometry.dispose(); this.hand.geometry = g;
        this.hand.material = isLogo(t) ? this.handMatL : this.handMatO;
      }
    }
    const p = this.player, moving = Math.hypot(p.vx, p.vz) > 0.5 && p.onGround;
    if (moving) this.bob += dt * 9;
    this.swing = Math.max(0, this.swing - dt * 4.5);
    const sw = Math.sin(this.swing * Math.PI);
    this.hand.scale.setScalar(0.12);
    this.hand.position.set(0.34 - sw * 0.06, -0.27 + Math.sin(this.bob) * 0.008 - sw * 0.06, -0.55 - sw * 0.04);
    this.hand.rotation.set(0.25 - sw * 0.7, -0.62, 0.06);
    if (this.itemHand.visible) {
      this.itemHand.scale.setScalar(0.3);
      this.itemHand.position.set(0.36 - sw * 0.05, -0.24 + Math.sin(this.bob) * 0.008 - sw * 0.05, -0.55);
      this.itemHand.rotation.set(-sw * 0.9, -0.35, 0.2 + sw * 0.4);
    }
  }

  spawnBreak(x, y, z, type) {
    const color = BLOCKS[type] ? BLOCKS[type].color : 0xdddddd;
    for (let i = 0; i < 10; i++) {
      this.partIdx = ((this.partIdx || 0) + 1) % 24;
      let m = this.parts[this.partIdx];
      if (!m) {
        m = new THREE.Mesh(this.partGeo || (this.partGeo = new THREE.BoxGeometry(1, 1, 1)), new THREE.MeshBasicMaterial({ color }));
        m.userData = { life: 0 };
        this.scene.add(m); this.parts[this.partIdx] = m;
      }
      if (!m.userData.life) this.partCount++;
      m.material.color.setHex(color);
      m.position.set(x + 0.2 + Math.random() * 0.6, y + 0.2 + Math.random() * 0.6, z + 0.2 + Math.random() * 0.6);
      m.userData = { life: 0.55 + Math.random() * 0.3, v: new THREE.Vector3((Math.random() - 0.5) * 3, Math.random() * 3 + 1, (Math.random() - 0.5) * 3) };
      m.scale.setScalar(0.1 + Math.random() * 0.08); m.visible = true;
    }
  }

  updateParticles(dt) {
    for (const m of this.parts) {
      if (!m || !m.userData.life) continue;
      const u = m.userData;
      u.life -= dt; u.v.y -= 14 * dt;
      m.position.addScaledVector(u.v, dt);
      if (u.life <= 0) { u.life = 0; m.visible = false; this.partCount--; }
    }
  }

  applyCamera() {
    const p = this.player, c = this.camera;
    c.position.set(p.x, p.y + EYE, p.z);
    c.rotation.set(this.pitch, this.yaw, 0);
  }

  // ---------- Bauen / Abbauen ----------
  breakBlock() {
    const t = this.target;
    if (!t || t.y === 0) return false;
    if (this.world.setBlock(t.x, t.y, t.z, B.AIR)) {
      this.record(t.x, t.y, t.z, t.type, B.AIR);
      const give = (id, n) => { this.inv[id] = Math.min(MAX_STACK, (this.inv[id] || 0) + n); };
      if (isCrop(t.type)) { // Ernte statt Block
        this.farm.remove(t.x, t.y, t.z);
        if (this.mode !== 'creative') { const got = cropDrops(t.type); got.forEach(([id, n]) => give(id, n)); this.onToast(got.map(([id, n]) => `+${n} ${nameOf(id)}`).join(' · ')); }
      } else if (this.mode !== 'creative') give(BLOCKS[t.type].drop || (t.type === B.FARMLAND ? B.DIRT : t.type), 1);
      // Gras gibt manchmal Samen
      if (this.mode !== 'creative' && (t.type === B.GRASS || t.type === B.FLOWERS) && Math.random() < 0.12) { give(I.SEEDS, 1); this.onToast('+1 Weizensamen'); }
      if (this.survival) {
        const held = this.held();
        if (toolFits(t.type, held)) this.wear(held);
        if ((t.type === B.LEAVES || t.type === B.JLEAVES) && Math.random() < 0.08) { this.inv[I.APPLE] = Math.min(MAX_STACK, (this.inv[I.APPLE] || 0) + 1); this.onToast('+1 Apfel'); }
      }
      this.unsaved = true; this.swing = 1; this.spawnBreak(t.x, t.y, t.z, t.type); playBreak(); this.onChange();
      this.questEvent('break', t.type);
      return true;
    }
    return false;
  }

  placeBlock() {
    const t = this.target, type = this.hotbar[this.sel];
    // Dorfbewohner ansprechen (wenn er vor dem Zielblock steht)
    const c = this.camera.position, d = this.lookDir, mh = this.mobs && d ? this.mobs.raycast(c.x, c.y, c.z, d.x, d.y, d.z, REACH) : null;
    if (mh && mh.mob.npc && (!t || mh.t < t.t)) { this.onTrade(mh.mob); this.questEvent('talk', 0); this.actCool = 0.5; return false; }
    // Schalter umlegen
    if (t && (t.type === B.SWITCH || t.type === B.SWITCH_ON)) {
      if (!this.placeFirst) return false;
      const to = t.type === B.SWITCH ? B.SWITCH_ON : B.SWITCH;
      if (this.world.setBlock(t.x, t.y, t.z, to)) { this.record(t.x, t.y, t.z, t.type, to); this.swing = 1; playPlace(); this.unsaved = true; this.onToast(to === B.SWITCH_ON ? 'Schalter an' : 'Schalter aus'); }
      return true;
    }
    // Werkbank/Ofen benutzen statt daneben zu bauen (Kreativ: keine Rezepte, dort wird gebaut)
    if (t && this.mode !== 'creative' && BLOCKS[t.type] && BLOCKS[t.type].station) { this.onStation(BLOCKS[t.type].station); this.actCool = 0.5; return false; }
    if (type && armorOf(type)) return this.equip(type);
    if (type && isItem(type)) {
      const held = this.held(), tool = toolOf(held);
      if (tool && tool.kind === 'hacke') return this.hoe(held);
      if (plantOf(type)) return this.sow(type);
      return foodOf(type) ? this.eat(type) : false;
    }
    const mode = BUILD_MODES[this.buildMode];
    if (mode.key !== 'einzeln') return this.buildClick(mode, t, type);
    if (!t || !type) return false;
    if (this.mode !== 'creative' && !(this.inv[type] > 0)) { playDeny(); this.onToast(`Kein ${NAMES[type]} im Vorrat`); this.actCool = 0.4; return false; }
    const x = t.x + t.nx, y = t.y + t.ny, z = t.z + t.nz;
    if (y < 0 || y >= H) return false;
    const cur = this.world.getBlock(x, y, z);
    if (cur !== B.AIR && cur !== B.WATER) return false;
    // nicht in den eigenen Körper bauen
    const p = this.player, hw = 0.3;
    if (p.x + hw > x && p.x - hw < x + 1 && p.z + hw > z && p.z - hw < z + 1 && p.y + 1.8 > y && p.y < y + 1) return false;
    if (!this.world.setBlock(x, y, z, type)) return false;
    this.record(x, y, z, cur, type);
    if (this.mode !== 'creative') this.inv[type]--;
    this.unsaved = true; this.swing = 1; playPlace(); this.onChange();
    this.questEvent('place', type);
    return true;
  }

  selectSlot(i) { this.sel = ((i % 9) + 9) % 9; this.onChange(); }

  // ---------- Bau-Werkzeuge: Formen, Kopieren/Einfügen, Vorschau ----------
  cycleBuild(dir = 1) {
    const list = BUILD_MODES.map((m, i) => i).filter(i => !BUILD_MODES[i].creative || this.mode === 'creative');
    const k = Math.max(0, list.indexOf(this.buildMode));
    this.buildMode = list[(k + dir + list.length) % list.length];
    this.anchor = null;
    this.onBuildMode(BUILD_MODES[this.buildMode]);
  }

  buildClick(mode, t, type) {
    if (!this.placeFirst) return false; // Formen nur einmal je Tastendruck
    if (mode.creative && this.mode !== 'creative') { this.onToast(`${mode.name} gibt es im Kreativmodus`); return true; }
    if (mode.key === 'einfuegen') {
      if (!this.clip) { this.onToast('Erst mit „Kopieren“ zwei Ecken wählen'); return true; }
      if (!t) return false;
      return this.applyCells(pasteCells(this.clip, [t.x + t.nx, t.y + t.ny, t.z + t.nz]), 'Eingefügt', true);
    }
    if (!t) return false;
    const cell = mode.key === 'kopieren' ? [t.x, t.y, t.z] : [t.x + t.nx, t.y + t.ny, t.z + t.nz];
    if (!this.anchor) { this.anchor = cell; this.onToast(`${mode.name}: erste Ecke gesetzt, jetzt die zweite wählen`); playPlace(); return true; }
    const a = this.anchor; this.anchor = null;
    if (mode.key === 'kopieren') {
      const clip = copyRegion(this.world, a, cell);
      if (!clip) { playDeny(); this.onToast('Zu groß zum Kopieren (höchstens 32 768 Blöcke)'); return true; }
      this.clip = clip; playPlace();
      this.onToast(`${clip.n} Blöcke kopiert (${clip.sx}×${clip.sy}×${clip.sz}), jetzt „Einfügen“ wählen`);
      return true;
    }
    if (!type || isItem(type)) { this.onToast('Wähle einen Block in der Hotbar'); return true; }
    const max = this.mode === 'creative' ? MAX_CELLS.creative : MAX_CELLS.survival;
    const cells = shapeCells(mode.key, a, cell, max);
    if (!cells) { playDeny(); this.onToast(`Zu groß: höchstens ${max} Blöcke auf einmal`); return true; }
    return this.applyCells(cells.map(c => [c[0], c[1], c[2], type]), mode.name, false);
  }

  // Liste [x, y, z, typ] setzen (Formen nur in freie Zellen, Einfügen überschreibt); ein Rückgängig-Schritt
  applyCells(list, label, overwrite) {
    const creative = this.mode === 'creative', p = this.player, hw = 0.3;
    let n = 0, short = false;
    this.beginBatch();
    for (const [x, y, z, type] of list) {
      if (y <= 0 || y >= H) continue;
      if (!creative && !(this.inv[type] > 0)) { short = true; continue; }
      const cur = this.world.getBlock(x, y, z);
      if (cur === type || (!(overwrite && creative) && cur !== B.AIR && cur !== B.WATER)) continue;
      if (BLOCKS[type].solid && p.x + hw > x && p.x - hw < x + 1 && p.z + hw > z && p.z - hw < z + 1 && p.y + 1.8 > y && p.y < y + 1) continue;
      if (!this.world.setBlock(x, y, z, type)) continue;
      this.record(x, y, z, cur, type);
      if (!creative) this.inv[type]--;
      n++;
      this.questEvent('place', type);
    }
    this.endBatch();
    if (n) { this.unsaved = true; this.swing = 1; playPlace(); this.onChange(); }
    this.onToast(n ? `${label}: ${n} Blöcke${short ? ' (Vorrat reichte nicht)' : ''}` : short ? 'Nicht genug im Vorrat' : 'Nichts zu setzen');
    return true;
  }

  updateGhost() {
    const g = this.ghost, t = this.target, mode = BUILD_MODES[this.buildMode], type = this.hotbar[this.sel];
    let box = null;
    if (t && !this.dead && (this.preview || mode.key !== 'einzeln')) {
      const place = [t.x + t.nx, t.y + t.ny, t.z + t.nz];
      if (mode.key === 'einfuegen') { if (this.clip) box = [...place, place[0] + this.clip.sx - 1, place[1] + this.clip.sy - 1, place[2] + this.clip.sz - 1]; }
      else if (mode.key === 'kopieren') { const c = [t.x, t.y, t.z]; box = this.anchor ? bounds(this.anchor, c) : [...c, ...c]; }
      else if (type && !isItem(type) && !(this.mode !== 'creative' && BLOCKS[t.type] && BLOCKS[t.type].station)) box = this.anchor ? bounds(this.anchor, place) : [...place, ...place];
    }
    if (!box) { g.visible = false; return; }
    g.position.set((box[0] + box[3] + 1) / 2, (box[1] + box[4] + 1) / 2, (box[2] + box[5] + 1) / 2);
    g.scale.set(box[3] - box[0] + 1, box[4] - box[1] + 1, box[5] - box[2] + 1);
    g.visible = true;
  }

  // ---------- Rüstung ----------
  equip(type) {
    const a = armorOf(type), creative = this.mode === 'creative';
    if (!creative && !(this.inv[type] > 0)) { playDeny(); this.onToast(`Kein ${nameOf(type)} im Vorrat`); this.actCool = 0.4; return false; }
    const old = this.armor[a.slot];
    if (old === type) { this.onToast(`${nameOf(type)} trägst du schon`); this.actCool = 0.6; return false; }
    if (!creative) { this.inv[type]--; if (old) this.inv[old] = Math.min(MAX_STACK, (this.inv[old] || 0) + 1); }
    this.armor[a.slot] = type; this.armWear[a.slot] = 0;
    this.swing = 1; playPlace(); this.unsaved = true;
    this.onToast(`${nameOf(type)} angelegt · Schutz ${this.armorPoints() * 5} %`); this.onChange(); this.onVitals();
    return true;
  }
  armorPoints() { let n = 0; for (const sl of ['kopf', 'brust']) { const a = armorOf(this.armor[sl]); if (a) n += a.pts; } return n; }
  wearArmor() {
    if (this.mode === 'creative') return;
    for (const sl of ['kopf', 'brust']) {
      const id = this.armor[sl], a = armorOf(id);
      if (!a) continue;
      if (++this.armWear[sl] >= a.dur) { this.armor[sl] = 0; this.armWear[sl] = 0; this.onToast(`${nameOf(id)} ist zerbrochen`); }
    }
  }

  // ---------- Chunk-Streaming ----------
  stream() {
    const pcx = Math.floor(this.player.x / CS), pcz = Math.floor(this.player.z / CS);
    const moved = !this.lastPC || this.lastPC[0] !== pcx || this.lastPC[1] !== pcz;
    if (moved) {
      this.lastPC = [pcx, pcz];
      this.scanDirty = true;
      const lim = this.viewDist + 3.5;
      for (const [k, c] of this.world.chunks) {
        if (Math.hypot(c.cx - pcx, c.cz - pcz) > lim) this.dropMesh(c), this.world.chunks.delete(k);
      }
    }
    if (!this.scanDirty) return;
    // Zeitbudget je Bild statt fester Anzahl: nahe Chunks und Chunks in Blickrichtung zuerst
    const t0 = performance.now(), R = this.viewDist + 0.5, fx = -Math.sin(this.yaw), fz = -Math.cos(this.yaw);
    let worked = false, ops = 0;
    outer: for (let pass = 0; pass < 2; pass++) {
      for (const [dx, dz, d] of this.offsets) {
        const front = d < 2.5 || dx * fx + dz * fz > -0.3 * d;
        if ((pass === 0) !== front) continue;
        let c = this.world.getChunk(pcx + dx, pcz + dz);
        const needMesh = d <= R && (!c || !c.meshed);
        if (c && !needMesh) continue;
        if (ops > 0 && performance.now() - t0 > this.budget) { worked = true; break outer; }
        if (!c) { c = this.world.ensure(pcx + dx, pcz + dz); ops++; worked = true; }
        if (needMesh && this.applyMesh(c)) { ops++; worked = true; }
      }
    }
    if (!worked) this.scanDirty = false;
  }

  flushDirty() {
    const w = this.world;
    if (!w.dirty.size) return;
    for (const c of w.dirty) if (c.meshed && w.chunks.get(c.key) === c) this.applyMesh(c);
    w.dirty.clear();
  }

  dropMesh(c) {
    for (const k of ['opaque', 'trans', 'logo']) {
      if (c[k]) { this.group.remove(c[k]); c[k].geometry.dispose(); c[k] = null; }
    }
  }

  applyMesh(c) {
    const res = buildMesh(this.world, c);
    if (!res) return false;
    this.setPart(c, 'opaque', res.opaque, this.matO);
    this.setPart(c, 'trans', res.trans, this.matT);
    this.setPart(c, 'logo', res.logo, this.matL);
    c.meshed = true;
    return true;
  }

  setPart(c, name, d, mat) {
    let m = c[name];
    if (!d) { if (m) { this.group.remove(m); m.geometry.dispose(); c[name] = null; } return; }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(d.pos, 3));
    g.setAttribute('uv', new THREE.BufferAttribute(d.uv, 2));
    g.setAttribute('aCol', new THREE.BufferAttribute(d.col, 4));
    g.setIndex(new THREE.BufferAttribute(d.idx, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(CS / 2, H / 2, CS / 2), this.chunkSphereR);
    if (m) { m.geometry.dispose(); m.geometry = g; return; }
    m = new THREE.Mesh(g, mat);
    m.position.set(c.cx * CS, 0, c.cz * CS);
    m.matrixAutoUpdate = false; m.updateMatrix();
    this.group.add(m);
    c[name] = m;
  }

  // ---------- Tag und Nacht ----------
  updateSky() {
    const a = this.time * Math.PI * 2, s = Math.sin(a), co = Math.cos(a);
    const day = smooth(-0.12, 0.28, s), dw = Math.max(0, 1 - Math.abs(s) / 0.3);
    let hor = mix3([0.04, 0.06, 0.14], [0.68, 0.84, 0.95], day);
    hor = mix3(hor, [0.97, 0.56, 0.36], dw * 0.55);
    let zen = mix3([0.012, 0.02, 0.07], [0.24, 0.5, 0.88], day);
    zen = mix3(zen, [0.34, 0.3, 0.52], dw * 0.4);

    // Licht: Sonne am Tag, schwaches Mondlicht in der Nacht
    const sunUp = s >= 0, I = sunUp ? smooth(-0.02, 0.3, s) : smooth(-0.02, 0.3, -s) * 0.3;
    const dir = this.uni.uSunDir.value;
    if (sunUp) dir.set(co, s, 0.25); else dir.set(-co, -s, 0.25);
    dir.normalize();
    const sc = sunUp ? mix3([1.0, 0.6, 0.36], [1.0, 0.96, 0.86], smooth(0, 0.4, s)).map(v => v * 0.62 * I) : [0.42 * I, 0.52 * I, 0.85 * I];
    this.uni.uSunCol.value.set(sc[0], sc[1], sc[2]);
    const amb = mix3([0.17, 0.21, 0.36], [0.44, 0.5, 0.62], day);
    this.light = 0.38 + 0.62 * day;
    this.uni.uAmb.value.set(amb[0] + dw * 0.12, amb[1] + dw * 0.06, amb[2] + dw * 0.02);

    // Tauchsicht
    const c = this.camera.position;
    const under = this.world.getBlock(Math.floor(c.x), Math.floor(c.y), Math.floor(c.z)) === B.WATER;
    this.underwater = under;
    const far = this.viewDist * CS - 6;
    if (under) {
      const f = mix3([0.04, 0.12, 0.26], [0.12, 0.38, 0.66], day);
      this.uni.uFog.value.set(f[0], f[1], f[2]);
      this.uni.uFogRange.value.set(0.5, 24);
      this.domeU.uHor.value.set(f[0], f[1], f[2]); this.domeU.uZen.value.set(f[0], f[1], f[2]);
      this.domeU.uGlow.value.set(0, 0, 0);
    } else {
      this.uni.uFog.value.set(hor[0], hor[1], hor[2]);
      this.uni.uFogRange.value.set(far * 0.4, far);
      this.domeU.uHor.value.set(hor[0], hor[1], hor[2]); this.domeU.uZen.value.set(zen[0], zen[1], zen[2]);
      const g = 0.9 * dw + 0.1 * day;
      this.domeU.uGlow.value.set(0.95 * g, 0.62 * g, 0.4 * g);
    }
    this.domeU.uSunN.value.set(co, s, 0.25).normalize();

    // Sonne/Mond/Sterne/Wolken um den Spieler
    this.sky.position.copy(c);
    const sd = this.domeU.uSunN.value;
    this.sun.position.copy(sd).multiplyScalar(500); this.sun.lookAt(c);
    this.moon.position.copy(sd).multiplyScalar(-500); this.moon.lookAt(c);
    this.sun.visible = s > -0.25 && !under; this.moon.visible = s < 0.25 && !under;
    this.starMat.opacity = Math.max(0, Math.min(1, (0.12 - s) * 3)) * (under ? 0 : 1);
    this.stars.rotation.z = a;
    this.clouds.position.set(c.x, 105, c.z);
    this.clouds.visible = !under && this.cloudsOn;
    const cl = mix3([0.2, 0.23, 0.36], [1, 1, 1], day);
    this.cloudU.uCol.value.set(cl[0] + dw * 0.0, cl[1] - dw * 0.18, cl[2] - dw * 0.3);
  }

  render() { this.renderer.render(this.scene, this.camera); }

  biomeName() {
    const b = this.world ? this.world.biomeAt(this.player.x, this.player.z) : -1;
    return b >= 0 ? BIOME_NAMES[b] : '';
  }

  // Uhrzeit als Text (Tag beginnt 06:00 bei time = 0)
  clockText() {
    const m = Math.floor(((this.time * 24 + 6) % 24) * 60);
    return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
  }
}
