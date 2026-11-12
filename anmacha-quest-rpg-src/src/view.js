// 3D-Darstellung (Three.js): moderne Beleuchtung (PBR, Schatten, Bildbasiertes Licht), Gelände mit weichen Übergängen,
// Wasser/Lava-Shader, Gras im Wind, Partikel, Bloom. Die Spiellogik bleibt feldbasiert in game.js/logic.js.
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

// Farbabstimmung wie im Kino: etwas mehr Kontrast und Sättigung, kühle Schatten, warme Lichter
const GradeShader = {
  uniforms: { tDiffuse: { value: null }, amt: { value: 1 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float amt; varying vec2 vUv;
    void main(){
      vec4 t = texture2D(tDiffuse, vUv); vec3 c = t.rgb;
      float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
      vec3 g = mix(vec3(l), c, 1.14);
      g = (g - 0.5) * 1.07 + 0.5;
      g += mix(vec3(-0.012, 0.004, 0.03), vec3(0.03, 0.012, -0.02), smoothstep(0.15, 0.85, l));
      gl_FragColor = vec4(mix(c, clamp(g, 0.0, 1.0), amt), t.a);
    }`
};
import { THEMES, ENEMIES, CAPSULES } from './data.js';
import * as L from './logic.js';
import * as A from './assets.js';
import { groundTex, blobTex } from './textures.js';
import { makeSky, makeLiquid, addWind, addCutaway, wind, occ, makeParticles } from './shaders.js';
import { Battle } from './battle.js';
import { Fx } from './fx.js';

// Farben der Oberwelt-Regionen (aus main.gd): Boden1, Boden2, Wand, Baum, Akzent
export const OW = {
  ow_town: ['#4aa24f', '#459a4a', '#2a5a6a', '#2a8a3a', '#ffd24a'],
  ow_rap: ['#5a5a86', '#54547e', '#2a2a44', '#4a4a8a', '#ff4a6a'],
  ow_schlager: ['#a6d67e', '#9ecf76', '#a04a80', '#58b04a', '#ff5aa8'],
  ow_xmas: ['#e6f2fa', '#dcecf6', '#4a7a9a', '#2f8a4a', '#ff3a3a'],
  ow_rock: ['#6a4a3a', '#634232', '#2a1a18', '#8a5a2a', '#ff7a1a'],
  ow_static: ['#4a505e', '#444a58', '#202430', '#606878', '#7cff9a']
};
export const LIQ = { town: '#2a6ac8', rap: '#1a1030', schlager: '#ff8fc8', xmas: '#26466a', rock: '#ff5a10', static: '#0a0c12' };
const LIQ_KIND = { town: 'water', rap: 'void', schlager: 'glitter', xmas: 'water', rock: 'lava', static: 'void' };
// Stimmung je Thema: Himmel (oben, Horizont, unten), Sonne, Licht, Nebel, Partikel
export const VIS = {
  town: { out: true, sky: ['#3d7fd6', '#bfe2ff', '#6c8fae'], sun: [0.55, 0.62, 0.35], sunC: '#fff0d8', sunI: 3.0, hemi: ['#cfe6ff', '#5a7a4a', 1.1], env: 0.55, fog: 0.010, part: ['pollen', '#fff6b0'], expo: 1.0 },
  schlager: { out: true, sky: ['#d26ac0', '#ffd0ea', '#c08ab0'], sun: [-0.4, 0.4, 0.5], sunC: '#ffe0f0', sunI: 2.6, hemi: ['#ffe0f4', '#8a5a7a', 1.0], env: 0.6, fog: 0.012, part: ['glitter', '#ff9ad8'], expo: 1.0 },
  xmas: { out: true, sky: ['#7a9cc8', '#e6f0fa', '#b8c8da'], sun: [0.3, 0.32, 0.6], sunC: '#ffe8d0', sunI: 2.2, hemi: ['#e8f2ff', '#8aa0b8', 1.2], env: 0.6, fog: 0.016, part: ['snow', '#ffffff'], expo: 0.95 },
  rap: { out: false, sky: ['#0a0614', '#2a1848', '#0a0614'], sun: [0.4, 0.8, 0.3], sunC: '#9a80ff', sunI: 1.5, hemi: ['#6a4aa8', '#1a1024', 1.0], env: 0.4, fog: 0.035, part: ['dust', '#c8a8ff'], accent: '#ff4a6a', expo: 1.1 },
  rock: { out: false, sky: ['#120604', '#4a1a0c', '#120604'], sun: [0.3, 0.8, 0.4], sunC: '#ffb080', sunI: 1.5, hemi: ['#a05030', '#200a06', 1.0], env: 0.4, fog: 0.032, part: ['ember', '#ff7a2a'], accent: '#ff7a1a', expo: 1.1 },
  static: { out: false, sky: ['#05060c', '#1c2232', '#05060c'], sun: [0.3, 0.8, 0.4], sunC: '#a0ffc0', sunI: 1.4, hemi: ['#506080', '#0c0e14', 1.0], env: 0.4, fog: 0.035, part: ['spark', '#7cff9a'], accent: '#7cff9a', expo: 1.1 }
};
const TREES = {
  xmas: [['grave/pine.glb', 1.5], ['grave/pine.glb', 1.8], ['town/tree-high.glb', 1.0]],
  rock: [['grave/pine-fall.glb', 1.5], ['grave/pine-fall-crooked.glb', 1.5], ['town/tree-crooked.glb', 1.1]],
  rap: [['kkd/pillar.gltf', 0.45], ['kkd/barrel_large.gltf', 0.4], ['kkd/crates_stacked.gltf', 0.42], ['kkd/keg.gltf', 0.4]],
  static: [['kkd/pillar_decorated.gltf', 0.42], ['kkd/pillar.gltf', 0.47], ['kkd/box_stacked.gltf', 0.26]],
  schlager: [['town/tree-high-round.glb', 1.0], ['town/tree.glb', 1.2], ['town/tree-high.glb', 0.9]],
  town: [['town/tree.glb', 1.1], ['town/tree-high.glb', 1.0], ['forest/tree.glb', 1.4], ['town/tree-high-round.glb', 1.0]]
};
// Oberwelt-Regionen vor Gruft und Turm: düstere Wälder statt Kerkermöbel
const TREES_OW = { rap: [['grave/pine.glb', 1.5], ['town/tree-crooked.glb', 1.1], ['grave/pine-fall-crooked.glb', 1.4]], static: [['grave/pine-fall-crooked.glb', 1.4], ['grave/pine.glb', 1.6], ['forest/rocks-high.glb', 0.7]] };
export const treesFor = (key) => (key.startsWith('ow_') && TREES_OW[key.slice(3)]) || TREES[key.replace('ow_', '')] || TREES.town;
// Kerker aus dem KayKit Dungeon Pack (CC0): 4 Einheiten = 1 Feld
const KKD = 0.25;
const DUNGEON_FLOOR = ['rap', 'static'];
const DUNGEON_TINT = { rap: '#ffffff', static: '#c4ccf0', xmas: '#dceeff', rock: '#ffb49a', schlager: '#ffd6e6' };
const DUNGEON_BANNER = { rap: 'banner_patternA_red', static: 'banner_patternB_blue', xmas: 'banner_patternC_white', rock: 'banner_triple_red', schlager: 'banner_patternA_white' };
const HOUSES = ['2Story_Mat', '1Story_GableRoof_Mat', '2Story_Sign_Mat', '1Story_Mat', '2Story_GableRoof_Mat'];
export const STATIC_MODELS = ['town/tree.glb', 'town/tree-high.glb', 'town/tree-high-round.glb', 'town/tree-crooked.glb', 'town/rock-large.glb', 'town/road.glb', 'town/wall-block.glb',
  'town/fountain-round.glb', 'forest/tree.glb', 'forest/rocks-high.glb', 'grave/pine.glb', 'grave/pine-fall.glb', 'grave/pine-fall-crooked.glb', 'grave/crypt.glb',
  'dungeon/wall.glb', 'dungeon/column.glb', 'dungeon/barrel.glb', 'dungeon/rocks.glb', 'kkd/chest.gltf', 'kkd/chest_gold.gltf', 'dungeon/gate.glb', 'dungeon/key.glb',
  ...HOUSES.map(h => `bld_${h}.glb`), 'bld_1Story_Sign_Mat.glb', 'bld_2Story_Slim_Mat.glb'];
export const QUALITY = [
  { dpr: 1, shadow: 0, bloom: false, samples: 0, grass: 0, parts: 120 },
  { dpr: 1.5, shadow: 1024, bloom: true, samples: 0, grass: 7, parts: 260 },
  { dpr: 2, shadow: 2048, bloom: true, samples: 4, grass: 16, parts: 420 }];
const WATER_LEVEL = -0.2;
// Kamerastufen: [Neigung, Abstand] – nah hinter dem Helden bis Übersicht
export const CAM_ZOOM = [[0.2, 3.8], [0.34, 5.8], [0.56, 9.5], [0.9, 15]];
// Figuren auf der Karte kleiner als im Kampf: Häuser, Bäume und Wege wirken dadurch weit und groß
export const FIELD_S = 0.72;
const C = (c) => new THREE.Color(c);
const smooth = (t) => t * t * (3 - 2 * t);
function vhash(x, y) { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); }
function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), u = smooth(x - xi), v = smooth(y - yi);
  const a = vhash(xi, yi), b = vhash(xi + 1, yi), c = vhash(xi, yi + 1), d = vhash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
export const baseTheme = (k) => k.replace('ow_', '');
export function palette(key) { return key.startsWith('ow_') ? OW[key] : THEMES[key]; }

export class View {
  constructor(canvas, game, quality) {
    this.g = game;
    this.canvas = canvas;
    this.qi = quality;
    this.Q = QUALITY[quality];
    this.mode = -1;
    this.t = 0;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', stencil: false });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.pmrem = new THREE.PMREMGenerator(this.renderer);
    this.camera = new THREE.PerspectiveCamera(38, 16 / 9, 0.3, 500);
    this.world = new THREE.Scene();
    this.fx = new Fx(this);
    this.battle = new Battle(this);
    this.envCache = {};
    this.built = '';
    this.building = null;
    this.buildToken = 0;
    this.dyn = new Map();
    this.camTarget = new THREE.Vector3();
    this.camInit = false;
    this.camYaw = 0; this.camYawT = 0; this.camPitch = 0.4; this.camD = 7; this.camZoom = 1; this.camKeys = 0; this.cine = null;
    this.shakeT = 0;
    this.labels = [];
    this.dying = [];
    this.fpsT = 0; this.fpsN = 0; this.lowFor = 0;
    this.setupComposer();
    this.resize();
    addEventListener('resize', () => this.resize());
  }

  // ---------------------------------------------------------------- Renderer, Qualität
  setupComposer() {
    const Q = this.Q;
    this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, Q.dpr));
    this.renderer.shadowMap.enabled = Q.shadow > 0;
    if (this.composer) { this.composer.dispose?.(); this.composer = null; }
    this.gtao?.dispose?.(); this.gtao = null;
    if (Q.bloom) {
      const size = this.renderer.getDrawingBufferSize(new THREE.Vector2());
      const rt = new THREE.WebGLRenderTarget(Math.max(1, size.x), Math.max(1, size.y), { type: THREE.HalfFloatType, samples: Q.samples });
      this.composer = new EffectComposer(this.renderer, rt);
      this.renderPass = new RenderPass(this.world, this.camera);
      this.composer.addPass(this.renderPass);
      this.gtao = null;
      if (this.qi >= 2) {
        // Umgebungsverdeckung: Ecken, Fugen und Kontaktschatten (nur auf starken Geräten)
        this.gtao = new GTAOPass(this.world, this.camera, size.x, size.y);
        this.gtao.updateGtaoMaterial({ radius: 0.5, distanceExponent: 1.5, thickness: 1, scale: 1 });
        this.gtao.blendIntensity = 0.85;
        this.composer.addPass(this.gtao);
      }
      this.bloom = new UnrealBloomPass(new THREE.Vector2(size.x, size.y), 0.45, 0.55, 0.88);
      this.composer.addPass(this.bloom);
      this.composer.addPass(new OutputPass());
      this.composer.addPass(new ShaderPass(GradeShader));
    }
  }
  setQuality(qi) {
    if (qi === this.qi) return;
    this.qi = qi;
    this.Q = QUALITY[qi];
    this.setupComposer();
    this.resize();
    for (const sc of [this.world, this.battle.scene]) {
      const sun = sc.userData.sun;
      if (sun) this.configSun(sun, sc.userData.shadowSize || 14);
    }
    this.built = '';
  }
  resize() {
    const w = innerWidth, h = innerHeight;
    this.renderer.setSize(w, h, false);
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    if (this.composer) { this.composer.setPixelRatio(this.renderer.getPixelRatio()); this.composer.setSize(w, h); }
    this.aspect = w / Math.max(1, h);
    this.camera.aspect = this.aspect;
    // Hochformat: horizontalen Bildausschnitt halten
    const vf = 38, minAspect = 1.5;
    this.camera.fov = this.aspect >= minAspect ? vf : THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(vf) / 2) * minAspect / this.aspect));
    this.camera.updateProjectionMatrix();
    this.W = w; this.H = h;
  }
  configSun(sun, size) {
    sun.castShadow = this.Q.shadow > 0;
    if (this.Q.shadow) {
      sun.shadow.mapSize.set(this.Q.shadow, this.Q.shadow);
      if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; }
    }
    const c = sun.shadow.camera;
    c.left = -size; c.right = size; c.top = size; c.bottom = -size; c.near = 1; c.far = 80;
    c.updateProjectionMatrix();
    sun.shadow.bias = -0.0005;
    sun.shadow.normalBias = 0.03;
    sun.shadow.radius = 4;
  }

  // Himmel, Licht und Umgebungslicht einer Szene je Thema
  setupSky(scene, theme, shadowSize) {
    const v = VIS[theme];
    for (const k of ['sky', 'sun', 'hemi']) if (scene.userData[k]) { scene.remove(scene.userData[k]); if (k === 'sun') scene.remove(scene.userData.sun.target); }
    const sunDir = new THREE.Vector3(...v.sun).normalize();
    const sky = makeSky(v.sky[0], v.sky[1], v.sky[2], sunDir, v.out ? v.sunC : '#000000', 1);
    scene.add(sky);
    scene.userData.sky = sky;
    scene.background = null;
    scene.fog = new THREE.FogExp2(C(v.sky[1]).lerp(C(v.sky[2]), v.out ? 0.15 : 0.5), v.fog);
    if (v.out && this.hdrEnv) this.envCache[theme] = this.hdrEnv;
    if (!this.envCache[theme]) {
      const es = new THREE.Scene();
      es.add(makeSky(v.sky[0], v.sky[1], v.sky[2], sunDir, v.sunC, 3));
      this.envCache[theme] = this.pmrem.fromScene(es, 0.02).texture;
    }
    scene.environment = this.envCache[theme];
    scene.environmentIntensity = v.env;
    const sun = new THREE.DirectionalLight(C(v.sunC), v.sunI);
    sun.userData.dir = sunDir;
    scene.add(sun, sun.target);
    this.configSun(sun, shadowSize);
    scene.userData.sun = sun;
    scene.userData.shadowSize = shadowSize;
    const hemi = new THREE.HemisphereLight(C(v.hemi[0]), C(v.hemi[1]), v.hemi[2]);
    scene.add(hemi);
    scene.userData.hemi = hemi;
    scene.userData.vis = v;
    return { sunDir, v };
  }
  placeSun(scene, at) {
    const sun = scene.userData.sun;
    if (!sun) return;
    sun.target.position.copy(at);
    sun.position.copy(at).addScaledVector(sun.userData.dir, 30);
    // Schattenkarte auf Texelraster einrasten (kein Flimmern beim Laufen)
    if (sun.castShadow) {
      const s = (scene.userData.shadowSize * 2) / this.Q.shadow;
      sun.target.position.x = Math.round(sun.target.position.x / s) * s;
      sun.target.position.z = Math.round(sun.target.position.z / s) * s;
      sun.position.copy(sun.target.position).addScaledVector(sun.userData.dir, 30);
    }
  }

  // Echtes HDR-Umgebungslicht (Poly Haven „Spruit Sunrise“, CC0) für Szenen unter freiem Himmel
  async loadHdr() {
    try {
      const tex = await new RGBELoader().loadAsync('./env/spruit_sunrise_1k.hdr');
      tex.mapping = THREE.EquirectangularReflectionMapping;
      this.hdrEnv = this.pmrem.fromEquirectangular(tex).texture;
      tex.dispose();
      for (const k of ['town', 'schlager', 'xmas']) delete this.envCache[k];
    } catch (e) { console.warn('HDR', e); }
  }

  // ---------------------------------------------------------------- Modus
  setMode(m) {
    if (m === this.mode) return;
    this.mode = m;
    if (m !== 2) this.camInit = false;
  }
  mapChanged() { this.built = ''; }
  partyChanged() { this.playerLead = ''; }
  ready() {
    if (this.built !== this.mapKey()) this.build();
    return this.building || Promise.resolve();
  }

  // ---------------------------------------------------------------- Welt aufbauen
  build() {
    const token = ++this.buildToken;
    const S = this.g.S;
    this.built = this.mapKey();
    this.building = this.buildWorld(token).catch(e => console.error(e)).finally(() => { if (token === this.buildToken) this.building = null; });
    return this.building;
  }
  clearWorld() {
    const sc = this.world;
    for (const c of sc.children.slice()) {
      if (c === sc.userData.sky || c === sc.userData.sun || c === sc.userData.hemi || c === sc.userData.sun?.target) continue;
      sc.remove(c);
      c.traverse?.((o) => {
        if (o.isInstancedMesh || o.userData.ownGeo) o.geometry?.dispose();
        if (o.userData.ownMat) [].concat(o.material).forEach(m => { if (m?.userData.ownTex) { m.map?.dispose(); m.normalMap?.dispose(); } m?.dispose(); });
      });
    }
    this.dyn.clear();
    this.dying = [];
    this.player = null;
    this.playerLead = '';
    this.labels = [];
  }
  async buildWorld(token) {
    const S = this.g.S;
    const map = S.map;
    const theme = baseTheme(map.world ? 'town' : map.theme);
    const need = new Set(['town/road.glb', 'town/wall-block.glb', 'dungeon/wall.glb', 'forest/rocks-high.glb', 'town/rock-large.glb', 'grave/crypt.glb', 'bld_2Story_Slim_Mat.glb', 'bld_2Story_GableRoof_Mat.glb']);
    for (let y = 0; y < S.mh; y++) for (let x = 0; x < S.mw; x++) if (map.rows[y][x] === 'T') for (const t of treesFor(L.themeKeyAt(S, x, y))) need.add(t[0]);
    if (!(map.world || map.town)) for (const f of ['wall', 'wall_cracked', 'floor_tile_large', 'floor_tile_large_rocks', 'floor_tile_big_grate', 'torch_mounted', DUNGEON_BANNER[map.theme] || 'banner_patternA_red', 'candle_triple']) need.add(`kkd/${f}.gltf`);
    if (map.town) { for (const h of HOUSES) need.add(`bld_${h}.glb`); need.add('bld_1Story_Sign_Mat.glb'); need.add('town/fountain-round.glb'); }
    const models = {};
    await Promise.all([...need].map(async p => { models[p] = await A.load(p); }));
    if (token !== this.buildToken) return;
    this.clearWorld();
    const { sunDir, v } = this.setupSky(this.world, theme, this.qi >= 2 ? 22 : 16);
    this.theme = theme;
    this.renderer.toneMappingExposure = v.expo;
    const outdoorMap = map.world || map.town;
    this.terrain = this.buildTerrain(S, outdoorMap);
    this.world.add(this.terrain.mesh);
    // Wasser/Lava/Leere
    if (this.terrain.hasLiquid || outdoorMap) {
      const liqTheme = outdoorMap ? 'town' : map.theme;
      const w = this.terrain.area;
      const mat = makeLiquid(LIQ_KIND[liqTheme], LIQ[liqTheme], this.terrain.depthTex, new THREE.Vector4(w.x, w.y, w.w, w.h), v.sky[0], v.sky[1], sunDir);
      mat.userData.liquid = true;
      const water = new THREE.Mesh(new THREE.PlaneGeometry(w.w, w.h), mat);
      water.rotation.x = -Math.PI / 2;
      water.position.set(w.x + w.w / 2, WATER_LEVEL, w.y + w.h / 2);
      water.userData.ownGeo = water.userData.ownMat = true;
      water.renderOrder = 2;
      this.world.add(water);
      this.liquid = mat;
      if (LIQ_KIND[liqTheme] === 'lava') {
        const glow = new THREE.PointLight(C('#ff6a20'), 0, 0, 2);
        this.lavaLight = glow;
      }
    } else this.liquid = null;
    // statische Modelle als Instanzen
    const groups = new Map();
    const add = (path, m) => { if (!groups.has(path)) groups.set(path, []); groups.get(path).push(m); };
    const mtx = (x, y, z, s, yaw, sy = s) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw), new THREE.Vector3(s, sy, s));
    const bld = new Map();
    for (let ty = 0; ty < S.mh; ty++) for (let tx = 0; tx < S.mw; tx++) {
      const ch = map.rows[ty][tx];
      const h = (tx * 31 + ty * 17) % 7;
      const x = tx + 0.5, z = ty + 0.5, y = this.heightAt(x, z);
      if (ch === 'T') {
        const set = treesFor(L.themeKeyAt(S, tx, ty));
        const pick = set[(tx * 7 + ty * 13) % set.length];
        const sc = pick[1] * (0.9 + 0.04 * h);
        add(pick[0], mtx(x + (vhash(tx, ty) - 0.5) * 0.25, y - 0.02, z + (vhash(ty, tx) - 0.5) * 0.25, sc, h * 0.9));
      } else if (ch === '^') {
        const rp = h % 2 === 0 ? 'forest/rocks-high.glb' : 'town/rock-large.glb';
        add(rp, mtx(x, y + (h % 2 === 0 ? 0.25 : -0.15), z, 1.15, h * 1.1, 1.15 * 1.1));
      } else if (ch === '#') {
        if (outdoorMap) add('town/wall-block.glb', mtx(x, 0, z, 1.0, 0, 1.15));
      } else if (ch === 'p') {
        add('town/road.glb', mtx(x, y + 0.005, z, 1.0, 0));
      } else if ('hHDSM'.includes(ch)) bld.set(tx + ',' + ty, ch);
    }
    if (!outdoorMap) this.buildDungeon(S, add, mtx);
    const tint = !outdoorMap && DUNGEON_TINT[map.theme] !== '#ffffff' ? C(DUNGEON_TINT[map.theme] || '#ffffff') : null;
    for (const [path, list] of groups) this.addInstances(this.world, models[path], list, path.includes('tree') || path.includes('pine'), path.endsWith('road.glb'), path.startsWith('kkd/') ? tint : null, path.startsWith('kkd/') && !path.includes('floor'));
    // Häuser (Hafenau): zusammenhängende Dachreihen
    let bi = 0;
    const done = new Set();
    for (let ty = 0; ty < S.mh; ty++) for (let tx = 0; tx < S.mw; tx++) {
      const k = tx + ',' + ty;
      if (bld.get(k) !== 'h' || done.has(k)) continue;
      let w = 0;
      while (bld.get((tx + w) + ',' + ty) === 'h') { done.add((tx + w) + ',' + ty); w++; }
      let shop = false;
      for (let i = 0; i < w; i++) if (bld.get((tx + i) + ',' + (ty + 1)) === 'S') shop = true;
      const name = shop ? '1Story_Sign_Mat' : HOUSES[bi % HOUSES.length];
      bi++;
      const gl = models[`bld_${name}.glb`];
      const inst = this.brightClone(gl, '#ffe6cc');
      const box = gl.box, sz = box.getSize(new THREE.Vector3());
      const sx = w / Math.max(0.5, sz.x), szz = 2.0 / Math.max(0.5, sz.z), sy = (sx + szz) * 0.5;
      inst.scale.set(sx, sy, szz);
      inst.position.set(-(box.min.x + sz.x / 2) * sx, -box.min.y * sy, -(box.min.z + sz.z / 2) * szz);
      const holder = new THREE.Group();
      holder.add(inst);
      holder.rotation.y = Math.PI;
      holder.position.set(tx + w / 2, 0, ty + 1.0);
      this.world.add(holder);
      // Fenster leuchten warm
      inst.traverse(o => { if (o.isMesh) { o.material = [].concat(o.material).map(m => { if (/glass|window/i.test(m.name)) { const c = m.clone(); c.emissive = C('#ffcf7a'); c.emissiveIntensity = 0.5; return c; } return m; }); if (o.material.length === 1) o.material = o.material[0]; } });
    }
    // Gras, Blumen, Deko
    this.buildGrass(S, theme, outdoorMap);
    // Portale
    map.portals.forEach((p, i) => {
      const open = L.portalOpen(S, p);
      const node = this.makePortal(p.kind || 'exit', open, models);
      node.position.set(p.x + 0.5, this.heightAt(p.x + 0.5, p.y + 0.5), p.y + 0.5);
      this.world.add(node);
      this.dyn.set('p' + i, { n: node, k: 'portal', p, open, kind: p.kind || 'exit', models });
      if (map.world) this.labels.push({ p, node, h: p.kind === 'tower' ? 3.4 : 2.1 });
    });
    // Lichter in Höhlen: Fackel beim Spieler, Akzentlicht beim Boss
    this.playerLight = null;
    if (!v.out) {
      this.playerLight = new THREE.PointLight(C('#ffd2a0'), 9, 9, 1.6);
      this.world.add(this.playerLight);
      if (map.boss && map.boss.id) {
        const bl = new THREE.PointLight(C(v.accent), 14, 10, 1.6);
        bl.position.set(map.boss.x + 0.5, 2.2, map.boss.y + 0.5);
        this.world.add(bl);
      }
      const ex = map.portals[0];
      if (ex) { const el = new THREE.PointLight(C('#5ae0ff'), 6, 6, 1.6); el.position.set(ex.x + 0.5, 1.2, ex.y + 0.5); this.world.add(el); }
    }
    // Partikel um die Kamera
    const part = map.world ? ['pollen', '#fff6b0'] : v.part;
    this.particles = makeParticles(part[0], this.Q.parts, part[1]);
    this.world.add(this.particles);
    this.plates = [];
    for (const [x, y] of (map.puzzle && map.puzzle.plates) || []) {
      const pm = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.46, 0.06, 32), new THREE.MeshStandardMaterial({ color: C('#5a5a66'), roughness: 0.5, metalness: 0.6, emissive: C(v.accent), emissiveIntensity: 0.25 }));
      const rr = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.38, 40), new THREE.MeshBasicMaterial({ color: C(v.accent).multiplyScalar(2), transparent: true, opacity: 0.5, depthWrite: false }));
      rr.rotation.x = -Math.PI / 2; rr.position.y = 0.04;
      pm.add(rr);
      pm.position.set(x + 0.5, this.heightAt(x + 0.5, y + 0.5) + 0.03, y + 0.5);
      pm.receiveShadow = true;
      pm.userData.ownGeo = pm.userData.ownMat = rr.userData.ownGeo = rr.userData.ownMat = true;
      this.world.add(pm);
      this.plates.push({ x, y, m: pm, r: rr, on: 0 });
    }
    this.camInit = false;
    this.syncDyn(0);
  }

  mapKey() { const S = this.g.S; return S.mapId + '|' + this.qi + (S.map && S.map.deep ? '|' + S.map.deep + ':' + S.map.seed : ''); }
  heightAt(x, z) {
    const T = this.terrain;
    if (!T) return 0;
    const R = T.R, fx = Math.min(Math.max(x * R, 0), T.nx - 1.001), fz = Math.min(Math.max(z * R, 0), T.nz - 1.001);
    const i = Math.floor(fx), j = Math.floor(fz), u = fx - i, w = fz - j;
    const H = T.H, n = T.nx;
    const a = H[j * n + i], b = H[j * n + i + 1], c = H[(j + 1) * n + i], d = H[(j + 1) * n + i + 1];
    return a + (b - a) * u + (c - a) * w + (a - b - c + d) * u * w;
  }

  buildTerrain(S, outdoorMap) {
    const map = S.map, mw = S.mw, mh = S.mh, R = 4;
    const tile = (x, y) => map.rows[Math.min(mh - 1, Math.max(0, y))][Math.min(mw - 1, Math.max(0, x))];
    const tkey = (x, y) => L.themeKeyAt(S, Math.min(mw - 1, Math.max(0, x)), Math.min(mh - 1, Math.max(0, y)));
    const TH = new Float32Array(mw * mh), TC = [];
    let hasLiquid = false;
    for (let y = 0; y < mh; y++) for (let x = 0; x < mw; x++) {
      const ch = tile(x, y), key = tkey(x, y), pal = palette(key), bt = baseTheme(key);
      let h = 0.04, col = C(pal[0]).lerp(C(pal[1]), vnoise(x * 0.7, y * 0.7));
      const nearWater = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => tile(x + dx, y + dy) === '~');
      if (ch === '~') { h = -0.55; hasLiquid = true; col = bt === 'rock' ? C('#2a1208') : (bt === 'xmas' ? C('#9ab0c0') : C('#b8a678').multiplyScalar(0.7)); }
      else if (ch === '^') { h = 0.85 + vnoise(x * 1.3, y * 1.3) * 0.6; col = bt === 'xmas' ? C('#f4f8ff') : (bt === 'schlager' ? C('#c89aa8') : C('#7a7066')); }
      else if (ch === '#') { h = 0.06; col = C(pal[2]).multiplyScalar(0.8); }
      else if (ch === 'p') col = C('#a39a8c');
      else if ('hHDSM'.includes(ch)) col = C('#8a8478');
      else if (ch === 'T') col.multiplyScalar(0.82);
      if (nearWater && ch !== '~' && (bt === 'town' || bt === 'schlager')) col.lerp(C('#d8c890'), 0.45);
      TH[y * mw + x] = h;
      TC.push(col);
    }
    const nx = mw * R + 1, nz = mh * R + 1;
    const geo = new THREE.PlaneGeometry(mw, mh, mw * R, mh * R);
    geo.rotateX(-Math.PI / 2);
    geo.translate(mw / 2, 0, mh / 2);
    const pos = geo.attributes.position;
    const cols = new Float32Array(pos.count * 3);
    const H = new Float32Array(nx * nz);
    const tmp = new THREE.Color();
    for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
      const x = i / R, z = j / R;
      const gx = x - 0.5, gz = z - 0.5;
      const x0 = Math.floor(gx), z0 = Math.floor(gz), u = smooth(gx - x0), w = smooth(gz - z0);
      const cl = (a, b) => [Math.min(mw - 1, Math.max(0, a)), Math.min(mh - 1, Math.max(0, b))];
      const idx = (a, b) => { const [p, q] = cl(a, b); return q * mw + p; };
      const i00 = idx(x0, z0), i10 = idx(x0 + 1, z0), i01 = idx(x0, z0 + 1), i11 = idx(x0 + 1, z0 + 1);
      let h = TH[i00] * (1 - u) * (1 - w) + TH[i10] * u * (1 - w) + TH[i01] * (1 - u) * w + TH[i11] * u * w;
      tmp.setRGB(0, 0, 0);
      tmp.r = TC[i00].r * (1 - u) * (1 - w) + TC[i10].r * u * (1 - w) + TC[i01].r * (1 - u) * w + TC[i11].r * u * w;
      tmp.g = TC[i00].g * (1 - u) * (1 - w) + TC[i10].g * u * (1 - w) + TC[i01].g * (1 - u) * w + TC[i11].g * u * w;
      tmp.b = TC[i00].b * (1 - u) * (1 - w) + TC[i10].b * u * (1 - w) + TC[i01].b * (1 - u) * w + TC[i11].b * u * w;
      const nz2 = vnoise(x * 0.9, z * 0.9) - 0.5;
      if (outdoorMap || h > 0.3) h += nz2 * 0.08 + (vnoise(x * 3.1, z * 3.1) - 0.5) * 0.03;
      if (h > 0.5) h += (vnoise(x * 2.2, z * 2.2) - 0.5) * 0.35;
      const shade = 1 + nz2 * 0.16;
      const k = j * nx + i;
      H[k] = h;
      pos.setY(k, h);
      cols[k * 3] = tmp.r * shade; cols[k * 3 + 1] = tmp.g * shade; cols[k * 3 + 2] = tmp.b * shade;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    geo.computeVertexNormals();
    const theme = baseTheme(map.world ? 'town' : map.theme);
    const kind = map.world || map.town ? 'grass' : (theme === 'rap' || theme === 'static' ? 'tile' : (theme === 'rock' ? 'crack' : (theme === 'xmas' ? 'snow' : 'grass')));
    const tex = groundTex(kind);
    const rep = kind === 'tile' ? 0.5 : 0.35;
    const map0 = tex.map.clone(), nm = tex.normal.clone();
    map0.repeat.set(mw * rep, mh * rep); nm.repeat.set(mw * rep, mh * rep);
    map0.needsUpdate = nm.needsUpdate = true;
    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, map: map0, normalMap: nm, normalScale: new THREE.Vector2(0.9, 0.9), roughness: kind === 'tile' ? 0.7 : 0.93, metalness: 0 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.receiveShadow = true;
    mesh.userData.ownGeo = mesh.userData.ownMat = true;
    mat.userData.ownTex = true;
    const group = new THREE.Group();
    group.add(mesh);
    // Umland außerhalb der Karte (Meeresgrund bzw. dunkler Fels)
    const M = 70;
    const ring = new THREE.Mesh(new THREE.PlaneGeometry(mw + 2 * M, mh + 2 * M), new THREE.MeshStandardMaterial({ color: outdoorMap ? C('#1a3a5a') : C(palette(map.theme)[2]).multiplyScalar(0.5), roughness: 1 }));
    ring.rotation.x = -Math.PI / 2;
    // unter dem Flüssigkeitsspiegel, sonst verdeckt der Ring Lava/Wasser in den Dungeons
    ring.position.set(mw / 2, outdoorMap ? -0.9 : -0.7, mh / 2);
    ring.receiveShadow = true;
    ring.userData.ownGeo = ring.userData.ownMat = true;
    group.add(ring);
    if (!outdoorMap) {
      // Höhlenwände ringsum (dunkle Felsen statt Leere)
      const rock = new THREE.Mesh(new THREE.BoxGeometry(mw + 2 * M, 3, mh + 2 * M), new THREE.MeshStandardMaterial({ color: C(palette(map.theme)[2]).multiplyScalar(0.35), roughness: 1, side: THREE.BackSide }));
      rock.position.set(mw / 2, 1.4, mh / 2);
      rock.scale.set(1, 1, 1);
      rock.visible = false;
      group.add(rock);
    }
    // Wassertiefe für Uferschaum und Durchsicht
    const DR = 4;
    const area = { x: -M, y: -M, w: mw + 2 * M, h: mh + 2 * M };
    const dw = area.w * DR, dh = area.h * DR;
    const dd = new Uint8Array(dw * dh * 4);
    const T = { R, nx, nz, H };
    this.terrain = T;
    for (let y = 0; y < dh; y++) for (let x = 0; x < dw; x++) {
      const wx = area.x + (x + 0.5) / DR, wz = area.y + (y + 0.5) / DR;
      let d = 1;
      if (wx >= 0 && wz >= 0 && wx <= mw && wz <= mh) d = Math.min(1, Math.max(0, (WATER_LEVEL - this.heightAt(wx, wz)) / 0.4));
      const k = ((dh - 1 - y) * dw + x) * 4;
      dd[k] = dd[k + 1] = dd[k + 2] = d * 255; dd[k + 3] = 255;
    }
    const depthTex = new THREE.DataTexture(dd, dw, dh, THREE.RGBAFormat);
    depthTex.magFilter = depthTex.minFilter = THREE.LinearFilter;
    depthTex.needsUpdate = true;
    return Object.assign(T, { mesh: group, depthTex, area, hasLiquid });
  }

  // Ein Modell (alle Teilnetze) vielfach zeichnen
  // Kerker: Wände (zwei KayKit-Mauerstücke übereinander, Vorderseite zum Gang), Deckel, Bodenfliesen, Fackeln, Banner
  buildDungeon(S, add, mtx) {
    const map = S.map, theme = map.theme;
    const wall = (x, y) => tile(x, y) === '#';
    const tile = (x, y) => (x < 0 || y < 0 || x >= S.mw || y >= S.mh) ? '#' : map.rows[y][x];
    const caps = [], torches = [];
    let n = 0;
    for (let ty = 0; ty < S.mh; ty++) for (let tx = 0; tx < S.mw; tx++) {
      const cx = tx + 0.5, cz = ty + 0.5, h = vhash(tx * 3 + 1, ty * 5 + 2);
      if (!wall(tx, ty)) {
        if (DUNGEON_FLOOR.includes(theme) && tile(tx, ty) !== '~') {
          const f = h < 0.08 ? 'floor_tile_large_rocks' : (h > 0.97 ? 'floor_tile_big_grate' : 'floor_tile_large');
          add(`kkd/${f}.gltf`, mtx(cx, this.heightAt(cx, cz) - 0.012, cz, KKD, Math.floor(h * 4) * Math.PI / 2));
        }
        continue;
      }
      caps.push([cx, cz]);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        if (wall(tx + dx, ty + dy)) continue;
        const yaw = Math.atan2(dx, dy), hx = cx + dx * 0.375, hz = cz + dy * 0.375, hv = vhash(tx * 7 + dx * 3, ty * 11 + dy * 5);
        add(hv < 0.2 ? 'kkd/wall_cracked.gltf' : 'kkd/wall.gltf', mtx(hx, 0, hz, KKD, yaw));
        add('kkd/wall.gltf', mtx(hx, 1.0, hz, KKD, yaw));
        const fx = cx + dx * 0.5, fz = cz + dy * 0.5;
        if (++n % 7 === 0) { add('kkd/torch_mounted.gltf', mtx(fx, 1.05, fz, KKD * 1.5, yaw)); torches.push([fx + dx * 0.2, fz + dy * 0.2]); }
        else if (n % 11 === 0) add(`kkd/${DUNGEON_BANNER[theme] || 'banner_patternA_red'}.gltf`, mtx(fx - dx * 0.08, 0.15, fz - dy * 0.08, KKD * 1.3, yaw));
        else if (n % 17 === 0 && DUNGEON_FLOOR.includes(theme)) add('kkd/candle_triple.gltf', mtx(fx + dx * 0.15, this.heightAt(fx, fz), fz + dy * 0.15, KKD * 1.4, yaw));
      }
    }
    // Deckel auf den Mauern: dunkler Stein, damit man von oben keine Lücken sieht
    if (caps.length) {
      const cm = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.06, 1), addCutaway(new THREE.MeshStandardMaterial({ color: C(palette(theme)[2]).multiplyScalar(0.55), roughness: 0.9 })), caps.length);
      caps.forEach(([x, z], i) => cm.setMatrixAt(i, new THREE.Matrix4().makeTranslation(x, 2.0, z)));
      cm.userData.ownGeo = cm.userData.ownMat = true;
      cm.receiveShadow = true;
      this.world.add(cm);
    }
    // Fackelflammen leuchten; nur einige echte Lichter (Leistung)
    if (torches.length) {
      const fm = new THREE.InstancedMesh(new THREE.ConeGeometry(0.06, 0.2, 8), addCutaway(new THREE.MeshBasicMaterial({ color: C('#ffb040').multiplyScalar(3), transparent: true, opacity: 0.9, depthWrite: false })), torches.length);
      torches.forEach(([x, z], i) => fm.setMatrixAt(i, new THREE.Matrix4().makeTranslation(x, 1.42, z)));
      fm.userData.ownGeo = fm.userData.ownMat = true;
      this.world.add(fm);
      const step = Math.max(1, Math.ceil(torches.length / (this.qi >= 2 ? 8 : 4)));
      for (let i = 0; i < torches.length; i += step) {
        const pl = new THREE.PointLight(C('#ffb060'), 5, 5, 1.8);
        pl.position.set(torches[i][0], 1.5, torches[i][1]);
        this.world.add(pl);
      }
    }
  }
  addInstances(scene, gltf, list, windy, flat, tint, cut) {
    gltf.scene.updateMatrixWorld(true);
    gltf.scene.traverse((o) => {
      if (!o.isMesh) return;
      let mat = o.material;
      if (tint || cut) { mat = [].concat(mat)[0].clone(); if (tint) mat.color = mat.color.clone().multiply(tint); if (cut) addCutaway(mat); }
      if (windy) mat = addWind([].concat(mat)[0].clone(), 0.05, 2.0, true);
      if (flat) { mat = [].concat(mat)[0].clone(); mat.color = C('#9aa0b0'); mat.roughness = 0.85; }
      const im = new THREE.InstancedMesh(o.geometry, mat, list.length);
      const local = o.matrixWorld;
      list.forEach((m, i) => im.setMatrixAt(i, new THREE.Matrix4().multiplyMatrices(m, local)));
      im.instanceMatrix.needsUpdate = true;
      im.castShadow = !flat;
      im.receiveShadow = true;
      im.computeBoundingSphere();
      if (windy || flat || tint || cut) im.userData.ownMat = true;
      scene.add(im);
    });
  }

  buildGrass(S, theme, outdoorMap) {
    const n = this.Q.grass;
    const map = S.map;
    const grassy = (key) => ['town', 'schlager'].includes(baseTheme(key)) || key === 'ow_rap' || key === 'ow_rock';
    const cells = [], flowers = [];
    for (let y = 0; y < S.mh; y++) for (let x = 0; x < S.mw; x++) {
      const ch = map.rows[y][x], key = L.themeKeyAt(S, x, y);
      if (ch === ',') flowers.push([x, y, key]);
      if (n && (ch === '.' || ch === ',' || ch === 'T') && grassy(key) && (outdoorMap || theme === 'schlager')) cells.push([x, y, key]);
    }
    if (cells.length) {
      // Halm: schmales, leicht gebogenes Band aus 3 Abschnitten
      const g = new THREE.BufferGeometry();
      const P = [], Cc = [], I = [];
      const seg = 3;
      for (let s = 0; s <= seg; s++) {
        const t = s / seg, w = 0.035 * (1 - t * 0.85);
        P.push(-w, t * 0.32, t * t * 0.06, w, t * 0.32, t * t * 0.06);
        const c = 0.45 + 0.55 * t;
        Cc.push(c, c, c, c, c, c);
      }
      for (let s = 0; s < seg; s++) { const a = s * 2; I.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
      g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
      g.setAttribute('color', new THREE.Float32BufferAttribute(Cc, 3));
      g.setIndex(I);
      g.computeVertexNormals();
      const mat = addWind(new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.8 }), 0.07, 0.32);
      const count = cells.length * n;
      const im = new THREE.InstancedMesh(g, mat, count);
      const m = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), sc = new THREE.Vector3(), p = new THREE.Vector3(), col = new THREE.Color();
      let k = 0;
      for (const [x, y, key] of cells) {
        const pal = palette(key);
        const isObj = L.objAt(S, { x, y }) || L.isPortal(S, { x, y });
        for (let i = 0; i < n; i++) {
          const rx = vhash(x * 13 + i, y * 7), rz = vhash(y * 11 + i, x * 5 + i);
          p.set(x + rx, 0, y + rz);
          p.y = this.heightAt(p.x, p.z) - 0.01;
          const s = isObj ? 0.01 : (0.7 + vhash(i, x + y) * 0.9) * FIELD_S;
          sc.set(0.85, s, 0.85);
          q.setFromAxisAngle(up, vhash(x + i, y) * Math.PI * 2);
          m.compose(p, q, sc);
          im.setMatrixAt(k, m);
          col.set(pal[0]).lerp(C(pal[3] || pal[1]), vhash(i * 3, y + x) * 0.6).multiplyScalar(1.05);
          im.setColorAt(k, col);
          k++;
        }
      }
      im.instanceMatrix.needsUpdate = true;
      if (im.instanceColor) im.instanceColor.needsUpdate = true;
      im.receiveShadow = true;
      im.castShadow = false;
      im.userData.ownGeo = im.userData.ownMat = true;
      im.frustumCulled = false;
      this.world.add(im);
    }
    if (flowers.length) {
      // Blumen (draußen) bzw. leuchtende Kristalle/Splitter (Höhlen)
      const g = new THREE.IcosahedronGeometry(0.05, 0);
      const mat = new THREE.MeshStandardMaterial({ roughness: 0.4, emissive: C('#ffffff'), emissiveIntensity: 0.0 });
      mat.onBeforeCompile = (sh) => { sh.fragmentShader = sh.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n totalEmissiveRadiance = vColor * ' + (outdoorMap ? '0.25' : '1.6') + ';'); };
      mat.vertexColors = false;
      const per = 5;
      const im = new THREE.InstancedMesh(g, mat, flowers.length * per);
      const m = new THREE.Matrix4(), col = new THREE.Color();
      let k = 0;
      for (const [x, y, key] of flowers) {
        const pal = palette(key);
        for (let i = 0; i < per; i++) {
          const px = x + 0.15 + vhash(x + i * 3, y) * 0.7, pz = y + 0.15 + vhash(y + i * 5, x) * 0.7;
          const s = outdoorMap ? 0.8 + vhash(i, x) * 0.6 : 0.8 + vhash(i, y) * 1.4;
          m.makeScale(s, outdoorMap ? s : s * 2.2, s).setPosition(px, this.heightAt(px, pz) + 0.05 * s, pz);
          im.setMatrixAt(k, m);
          col.set(i % 2 ? pal[4] : (outdoorMap ? '#ffffff' : pal[4]));
          im.setColorAt(k, col);
          k++;
        }
      }
      im.instanceMatrix.needsUpdate = true;
      im.instanceColor.needsUpdate = true;
      im.userData.ownGeo = im.userData.ownMat = true;
      this.world.add(im);
    }
  }

  makePortal(kind, open, models) {
    const root = new THREE.Group();
    const red = C('#ff8a8a');
    const fit = (gl, width, sy = 1, yaw = Math.PI) => {
      const inst = gl.box && kind !== 'cave' ? this.brightClone(gl, '#ffe6cc') : gl.scene.clone();
      const box = gl.box, sz = box.getSize(new THREE.Vector3());
      const s = width / Math.max(0.3, sz.x);
      inst.scale.set(s, s * sy, s);
      inst.position.set(-(box.min.x + sz.x / 2) * s, -box.min.y * s * sy, -(box.min.z + sz.z / 2) * s);
      if (!open) inst.traverse(o => { if (o.isMesh) o.material = [].concat(o.material).map(m => { const c = m.clone(); c.color = c.color.clone().multiply(red); return c; }).reduce((a, b, i, arr) => arr.length === 1 ? b : arr); });
      const w = new THREE.Group();
      w.add(inst);
      w.rotation.y = yaw;
      root.add(w);
      return w;
    };
    if (kind === 'town') fit(models['bld_2Story_GableRoof_Mat.glb'], 1.9);
    else if (kind === 'cave') {
      fit(models['grave/crypt.glb'], 2.0);
      const glow = new THREE.Mesh(new THREE.CircleGeometry(0.36, 24), new THREE.MeshBasicMaterial({ color: open ? C('#7ae8ff').multiplyScalar(2.2) : C('#ff3030').multiplyScalar(1.6), transparent: true, opacity: 0.85 }));
      glow.position.set(0, 0.45, 0.78);
      glow.userData.ownGeo = glow.userData.ownMat = true;
      root.add(glow);
    } else if (kind === 'tower') {
      fit(models['bld_2Story_Slim_Mat.glb'], 1.4, 1.7);
      const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), new THREE.MeshBasicMaterial({ color: (open ? C('#7cff9a') : C('#ff4040')).multiplyScalar(3) }));
      beacon.position.y = 3.2;
      beacon.userData.ownGeo = beacon.userData.ownMat = true;
      beacon.userData.pulse = true;
      root.add(beacon);
    } else {
      const col = open ? C('#46e6ff') : C('#ff5a5a');
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.06, 12, 40), new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 2.2, roughness: 0.3 }));
      ring.position.y = 0.55;
      ring.userData.spin = 1.5;
      const disk = new THREE.Mesh(new THREE.CircleGeometry(0.36, 32), new THREE.MeshBasicMaterial({ color: col.clone().multiplyScalar(1.4), transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false }));
      disk.position.y = 0.55;
      disk.userData.spin = -2.5;
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.58, 0.08, 32), new THREE.MeshStandardMaterial({ color: C('#3a3f52'), roughness: 0.5, metalness: 0.3 }));
      base.position.y = 0.04;
      base.receiveShadow = true;
      for (const o of [ring, disk, base]) { o.userData.ownGeo = o.userData.ownMat = true; root.add(o); }
      root.userData.face = [ring, disk];
    }
    return root;
  }

  // Gebäude der Godot-Fassung wurden dort aufgehellt (Farbe × 1.7/1.5/1.35) – hier ebenso, einmal pro Modell
  brightClone(gl, warm) {
    if (!gl.bright) {
      gl.bright = gl.scene.clone();
      // Aufhellen im sRGB-Raum (wie Godot), mit leichter Anhebung, damit dunkle Dächer nicht schwarz wirken
      const k = new THREE.Color(), s = new THREE.Color();
      C(warm).getRGB(k, THREE.SRGBColorSpace);
      gl.bright.traverse(o => { if (o.isMesh) o.material = [].concat(o.material).map(m => {
        const c = m.clone();
        c.color.getRGB(s, THREE.SRGBColorSpace);
        const up = (v) => Math.min(1, v * 1.5 + 0.24 * (1 - v));
        s.setRGB(up(s.r) * k.r, up(s.g) * k.g, up(s.b) * k.b);
        c.color.setRGB(s.r, s.g, s.b, THREE.SRGBColorSpace);
        if (m.name === 'RoofBricks') c.color.set('#9c5a46');   // Dächer warm statt fast schwarz (von oben gut lesbar)
        c.roughness = 0.8;
        return c; }).reduce((a, b, i, arr) => arr.length === 1 ? b : arr); });
    }
    return gl.bright.clone();
  }

  // ---------------------------------------------------------------- Figuren
  async actorHero(id, battle = false) {
    const gl = await A.load(A.heroPath(A.HERO_MODEL[id]));
    const a = A.makeActor(gl, 3.0 * A.HERO_SCALE[id] * (battle ? 1 : FIELD_S));
    this.addBlob(a.root, battle ? 1.1 : 0.9 * FIELD_S);
    A.playLoop(a, 'idle');
    await this.attachWeapon(a, id).catch(() => {});
    return a;
  }
  // Waffe nach Ausrüstungsstufe (KayKit Fantasy Weapons, CC0) in die rechte Hand; ersetzt die Modellwaffe
  weaponTier(id) { const l = A.WEAPONS[id]; return l ? Math.min(l.length - 1, Math.floor((this.g.S.gear || 0) * l.length / 11)) : 0; }
  async attachWeapon(a, id) {
    const list = A.WEAPONS[id];
    if (!list) return;
    const [gl, off] = await Promise.all([A.load(`weapons/${list[this.weaponTier(id)]}.gltf`), A.OFFHAND[id] ? A.load(A.OFFHAND[id]) : null]);
    a.weapon = this.holdIn(a, A.WEAPON_HAND[id] || 'handslotr', gl);
    if (off) this.holdIn(a, (A.WEAPON_HAND[id] || 'handslotr') === 'handslotr' ? 'handslotl' : 'handslotr', off);
  }
  // KayKit-Gegenstände sitzen mit ihrem Ursprung genau im Handslot
  holdIn(a, slot, gl) {
    const bone = a.root.getObjectByName(slot);
    if (!bone) return null;
    const w = gl.scene.clone();
    w.traverse(m => { if (m.isMesh) { m.castShadow = true; m.material = m.material.clone(); m.material.metalness = 0.3; m.material.roughness = 0.5; m.userData.ownMat = true; } });
    bone.add(w);
    return w;
  }
  async actorNpc(kind) {
    const n = A.NPC_MODEL[kind];
    const gl = await A.load(A.heroPath(n[0]));
    const a = A.makeActor(gl, 3.0 * n[2] * FIELD_S, n[1]);
    this.addBlob(a.root, 0.9 * FIELD_S);
    A.playLoop(a, 'idle');
    return a;
  }
  async actorMonster(id, mul) {
    const d = ENEMIES[id];
    const gl = await A.load(A.monsterPath(d));
    const a = A.makeActor(gl, d.h * mul, d.tint || '#ffffff');
    A.playLoop(a, 'idle');
    if (A.MONSTER_WEAPON[d.model]) this.holdIn(a, 'handslotr', await A.load(A.MONSTER_WEAPON[d.model]));
    return a;
  }
  addBlob(parent, w) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w * 0.8), new THREE.MeshBasicMaterial({ map: blobTex(), transparent: true, depthWrite: false }));
    m.rotation.x = -Math.PI / 2;
    m.position.y = 0.025;
    m.renderOrder = 1;
    m.userData.ownGeo = m.userData.ownMat = true;
    parent.add(m);
  }
  face(a, dx, dz, dt, speed = 1) {
    if (!dx && !dz) return;
    const target = Math.atan2(dx, dz);
    let d = target - a.pivot.rotation.y;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    a.pivot.rotation.y += d * Math.min(1, dt * 14 * speed);
  }

  // Objekte, Monster und Spieler mit dem Spielzustand abgleichen
  syncDyn(dt) {
    const S = this.g.S;
    const seen = new Set();
    for (const o of S.objs) {
      const uid = 'o' + o.uid;
      seen.add(uid);
      if (!this.dyn.has(uid)) this.makeObj(uid, o);
      const ent = this.dyn.get(uid);
      if (o.t === 'block') {
        const x = o.x + 0.5, z = o.y + 0.5, k = dt > 0 ? Math.min(1, dt * 10) : 1;
        ent.n.position.x += (x - ent.n.position.x) * k;
        ent.n.position.z += (z - ent.n.position.z) * k;
        ent.n.position.y = this.heightAt(ent.n.position.x, ent.n.position.z);
      } else if (o.t === 'torch' && ent.lit !== !!o.lit) this.setTorch(ent, !!o.lit);
    }
    for (const r of S.roamers) {
      const uid = 'r' + r.uid;
      seen.add(uid);
      if (!this.dyn.has(uid)) {
        const ent = { n: new THREE.Group(), k: 'roamer', a: null, r };
        this.world.add(ent.n);
        this.dyn.set(uid, ent);
        this.actorMonster(r.id, 0.62 * FIELD_S).then(a => { if (this.dyn.get(uid) !== ent) return; this.addBlob(a.root, 0.9 * FIELD_S); A.playLoop(a, 'walk'); ent.a = a; ent.n.add(a.root); });
      }
      const ent = this.dyn.get(uid);
      const x = r.pos.x + 0.5, z = r.pos.y + 0.5;
      const dx = x - ent.n.position.x, dz = z - ent.n.position.z;
      ent.n.position.set(x, this.heightAt(x, z), z);
      if (ent.a) {
        if (Math.abs(dx) + Math.abs(dz) > 0.0005 && dt > 0) { this.face(ent.a, dx, dz, dt); A.playLoop(ent.a, 'walk'); }
        else A.playLoop(ent.a, 'idle');
        const st = r.stun > 0;
        if (ent.stun !== st) { ent.stun = st; this.setOpacity(ent.a.root, st ? 0.45 : 1); }
      }
    }
    for (const [uid, ent] of this.dyn) {
      if (ent.k === 'portal') {
        const open = L.portalOpen(S, ent.p);
        if (open !== ent.open) {
          const nn = this.makePortal(ent.kind, open, ent.models);
          nn.position.copy(ent.n.position);
          this.world.remove(ent.n);
          this.world.add(nn);
          for (const l of this.labels) if (l.node === ent.n) l.node = nn;
          ent.n = nn;
          ent.open = open;
        }
        continue;
      }
      if (!seen.has(uid)) {
        this.dyn.delete(uid);
        if (ent.k === 'obj' && ['chest', 'gate', 'rock', 'bramble', 'seal'].includes(ent.o.t)) this.dying.push({ ...ent, life: ['rock', 'bramble', 'seal'].includes(ent.o.t) ? 1.2 : 0, burst: ent.o.t !== 'chest' && ent.o.t !== 'gate' });
        else this.world.remove(ent.n);
      }
    }
    // Spieler
    const lead = S.party[0] ? S.party[0].id : 'andrew';
    const leadKey = lead + '|' + this.weaponTier(lead);
    if (this.playerLead !== leadKey) {
      this.playerLead = leadKey;
      if (this.player) this.world.remove(this.player.root);
      const holder = { root: new THREE.Group(), a: null };
      this.player = holder;
      this.world.add(holder.root);
      this.actorHero(lead).then(a => { if (this.player !== holder) return; holder.a = a; holder.root.add(a.root); a.pivot.rotation.y = Math.atan2(S.face.x, S.face.y); });
    }
    const px = S.ppos.x + 0.5, pz = S.ppos.y + 0.5;
    this.player.root.position.set(px, this.heightAt(px, pz), pz);
    if (this.player.a) {
      const f = S.fdir || S.face;
      this.face(this.player.a, f.x, f.y, dt, 0.8);
      A.playLoop(this.player.a, S.moving ? (S.running ? 'run' : 'walk') : 'idle');
    }
  }
  setOpacity(root, a) {
    root.traverse(o => {
      if (!o.isMesh || o.material.map === blobTex()) return;
      for (const m of [].concat(o.material)) { m.transparent = a < 1; m.opacity = a; m.depthWrite = a >= 1; }
    });
  }
  makeObj(uid, o) {
    const d = o.d;
    const ent = { n: new THREE.Group(), k: 'obj', o, a: null };
    ent.n.position.set(o.x + 0.5, this.heightAt(o.x + 0.5, o.y + 0.5), o.y + 0.5);
    this.world.add(ent.n);
    this.dyn.set(uid, ent);
    const alive = () => this.dyn.get(uid) === ent;
    if (o.t === 'npc') {
      if (d.kind === 'heal') {
        A.load('town/fountain-round.glb').then(gl => {
          if (!alive()) return;
          const f = gl.scene.clone();
          f.scale.setScalar(0.5);
          ent.n.add(f);
          const w = new THREE.Mesh(new THREE.CircleGeometry(0.4, 32), new THREE.MeshStandardMaterial({ color: C('#4ab8ff'), emissive: C('#2a90ff'), emissiveIntensity: 1.4, roughness: 0.1, transparent: true, opacity: 0.85 }));
          w.rotation.x = -Math.PI / 2;
          w.position.y = 0.12;
          w.userData.ownGeo = w.userData.ownMat = true;
          ent.n.add(w);
          const pl = new THREE.PointLight(C('#6ac8ff'), 3, 3.5, 1.6);
          pl.position.y = 0.7;
          ent.n.add(pl);
          ent.fountain = true;
        });
      } else {
        this.actorNpc(d.kind).then(a => { if (!alive()) return; ent.a = a; ent.n.add(a.root); });
      }
    } else if (o.t === 'chest') {
      const gold = d.kind === 'key' || d.kind === 'tool' || d.kind === 'capsule';
      A.load(gold ? 'kkd/chest_gold.gltf' : 'kkd/chest.gltf').then(gl => {
        if (!alive()) return;
        const c = gl.scene.clone();
        c.scale.setScalar(0.42);
        ent.n.add(c);
        ent.lid = c.getObjectByName(gold ? 'chest_gold_lid' : 'chest_lid');
        this.addBlob(ent.n, 1.0);
        if (d.kind === 'key') {
          A.load('dungeon/key.glb').then(kg => {
            if (!alive()) return;
            const k = kg.scene.clone();
            k.scale.setScalar(1.4);
            k.position.y = 0.85;
            k.traverse(m => { if (m.isMesh) { m.material = m.material.clone(); m.material.emissive = C('#ffb020'); m.material.emissiveIntensity = 0.8; } });
            ent.n.add(k);
            ent.spin = k;
          });
        }
      });
    } else if (o.t === 'gate') {
      A.load('dungeon/gate.glb').then(gl => {
        if (!alive()) return;
        const gt = gl.scene.clone();
        gt.scale.set(1.35, 1.6, 1.35);
        gt.rotation.y = Math.PI / 2;
        ent.n.add(gt);
        ent.door = gt.getObjectByName('door');
      });
    } else if (o.t === 'boss') {
      this.actorMonster(d.id, 1.0).then(a => {
        if (!alive()) return;
        ent.a = a;
        ent.n.add(a.root);
        this.addBlob(a.root, 2.4);
        const ring = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.15, 48), new THREE.MeshBasicMaterial({ color: C('#ff3040').multiplyScalar(2.5), transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false }));
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.04;
        ring.userData.ownGeo = ring.userData.ownMat = true;
        ent.n.add(ring);
        ent.ring = ring;
      });
    } else if (o.t === 'block') {
      // Schiebeblock: behauener Stein mit leuchtender Rune
      const pal = palette(this.theme || 'rap');
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.86, 0.86, 2, 2, 2), new THREE.MeshStandardMaterial({ color: C(pal[2]).lerp(C('#8a8478'), 0.6), roughness: 0.85, metalness: 0.05, map: groundTex('tile').map, normalMap: groundTex('tile').normal }));
      m.position.y = 0.43; m.castShadow = m.receiveShadow = true;
      const rune = new THREE.Mesh(new THREE.RingGeometry(0.14, 0.2, 6), new THREE.MeshBasicMaterial({ color: C(VIS[this.theme || 'rap'].accent).multiplyScalar(2.2), transparent: true, opacity: 0.9, side: THREE.DoubleSide }));
      rune.position.y = 0.865; rune.rotation.x = -Math.PI / 2;
      m.userData.ownGeo = m.userData.ownMat = rune.userData.ownGeo = rune.userData.ownMat = true;
      ent.n.add(m, rune);
      this.addBlob(ent.n, 1.0);
    } else if (o.t === 'torch') {
      A.load('dungeon/column.glb').then(gl => {
        if (!alive()) return;
        const c = gl.scene.clone();
        const sz = new THREE.Box3().setFromObject(c).getSize(new THREE.Vector3());
        c.scale.set(0.45 / Math.max(0.01, sz.x), 1.25 / Math.max(0.01, sz.y), 0.45 / Math.max(0.01, sz.z));
        c.traverse(m => { if (m.isMesh) m.castShadow = true; });
        ent.n.add(c);
      });
      const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.14, 0.18, 16), new THREE.MeshStandardMaterial({ color: C('#3a2a1a'), metalness: 0.7, roughness: 0.4 }));
      bowl.position.y = 1.32;
      const fl = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.5, 12), new THREE.MeshBasicMaterial({ color: C('#ffb040').multiplyScalar(3), transparent: true, opacity: 0.9, depthWrite: false }));
      fl.position.y = 1.62;
      bowl.userData.ownGeo = bowl.userData.ownMat = fl.userData.ownGeo = fl.userData.ownMat = true;
      ent.n.add(bowl, fl);
      ent.flame = fl;
      this.setTorch(ent, !!o.lit);
    } else if (o.t === 'rock') {
      A.load('town/rock-large.glb').then(gl => {
        if (!alive()) return;
        const r = gl.scene.clone();
        r.scale.setScalar(0.55);
        r.rotation.y = (o.x * 7 + o.y * 3) % 6;
        r.traverse(m => { if (m.isMesh) { m.castShadow = true; m.material = m.material.clone(); m.material.color.multiplyScalar(0.8); m.material.emissive = C('#ffd27a'); m.material.emissiveIntensity = 0.06; } });
        ent.n.add(r);
      });
      ent.glint = this.makeGlint('#ffe9a0');
      ent.glint.position.y = 0.7;
      ent.n.add(ent.glint);
      this.addBlob(ent.n, 1.1);
    } else if (o.t === 'bramble') {
      // Dornenranken: verschlungene Ranken mit Stacheln
      const g = new THREE.Group();
      const vine = new THREE.MeshStandardMaterial({ color: C('#2e3a1c'), roughness: 0.8 });
      const thorn = new THREE.MeshStandardMaterial({ color: C('#6a2a3a'), roughness: 0.5 });
      for (let i = 0; i < 7; i++) {
        const a = i * 0.9 + o.x;
        const pts = [];
        for (let k = 0; k <= 6; k++) pts.push(new THREE.Vector3(Math.cos(a + k * 0.8) * (0.15 + k * 0.05), 0.05 + k * 0.15, Math.sin(a + k * 0.8) * (0.15 + k * 0.05)));
        const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.035, 5), vine);
        tube.castShadow = true;
        g.add(tube);
        for (let k = 1; k < 6; k++) {
          const t = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.12, 4), thorn);
          t.position.copy(pts[k]); t.lookAt(pts[k].clone().multiplyScalar(2)); t.rotateX(Math.PI / 2);
          g.add(t);
        }
      }
      g.traverse(m => { if (m.isMesh) m.userData.ownGeo = true; });
      g.children[0].userData.ownMat = g.children[1].userData.ownMat = true;
      ent.n.add(g);
      ent.glint = this.makeGlint('#ff9ad0');
      ent.glint.position.y = 0.5;
      ent.n.add(ent.glint);
      this.addBlob(ent.n, 1.0);
    } else if (o.t === 'seal') {
      // Lichtsiegel vor der Bosshalle
      const col = C(VIS[this.theme || 'rap'].accent);
      const wall = new THREE.Mesh(new THREE.PlaneGeometry(0.98, 1.9), new THREE.MeshBasicMaterial({ color: col.clone().multiplyScalar(1.6), transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
      wall.position.y = 0.95; wall.rotation.y = Math.PI / 2;
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.03, 8, 48), new THREE.MeshBasicMaterial({ color: col.clone().multiplyScalar(3) }));
      ring.position.y = 0.95; ring.rotation.y = Math.PI / 2;
      const inner = new THREE.Mesh(new THREE.RingGeometry(0.18, 0.24, 6), new THREE.MeshBasicMaterial({ color: col.clone().multiplyScalar(3), side: THREE.DoubleSide }));
      inner.position.y = 0.95; inner.rotation.y = Math.PI / 2;
      for (const m of [wall, ring, inner]) m.userData.ownGeo = m.userData.ownMat = true;
      const pl = new THREE.PointLight(col, 4, 4, 1.6);
      pl.position.y = 1;
      ent.n.add(wall, ring, inner, pl);
      ent.seal = { wall, ring, inner };
    }
  }
  makeGlint(col) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: blobTex(), color: C(col).multiplyScalar(3), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    s.scale.setScalar(0.18);
    s.userData.ownMat = true;
    return s;
  }
  setTorch(ent, lit) {
    ent.lit = lit;
    if (ent.flame) ent.flame.visible = lit;
    if (lit && !ent.light) {
      ent.light = new THREE.PointLight(C('#ffa040'), 7, 6, 1.6);
      ent.light.position.y = 1.8;
      ent.n.add(ent.light);
    }
  }

  // ---------------------------------------------------------------- pro Bild
  shake(t) { if (this.g.mode === 2) this.battle.shakeT = Math.max(this.battle.shakeT || 0, t); else this.shakeT = Math.max(this.shakeT, t); }
  screenPos(side, i, lift) { const p = this.battle.pos(side, i, lift); return p ? this.project(p) : null; }
  battleBegin(bg, enemies, party, cap) { return this.battle.begin(bg, enemies, party, cap); }
  battleCap(k, t) { this.battle.capsule(k, t); }
  async actorCapsule(c) {
    const f = CAPSULES[c.id].forms[c.form];
    const gl = await A.load(`mon_${f.model}.glb`);
    const a = A.makeActor(gl, f.h, f.tint);
    this.addBlob(a.root, f.h);
    A.playLoop(a, 'idle');
    return a;
  }
  battleEnd() { this.battle.end(); this.renderer.toneMappingExposure = VIS[this.theme || 'town'].expo; }
  battleHero(i, k, t) { this.battle.hero(i, k, t); }
  battleEnemy(i, k, t) { this.battle.enemy(i, k, t); }
  battleEnemyDown(i) { this.battle.enemyDown(i); }
  battleFx(kind, side, i) { this.battle.fxAt(kind, side, i); }
  fxWorld(kind, o) {
    if (o && ['torch', 'smash', 'burn', 'seal'].includes(kind)) {
      const p = new THREE.Vector3(o.x + 0.5, kind === 'torch' ? 1.6 : 0.6, o.y + 0.5);
      if (kind === 'torch') this.fx.burst(p, '#ffb040', 50, 1.6, 0.9, 1.5, 0.1, this.world);
      if (kind === 'smash') { this.fx.burst(p, '#b8a890', 70, 3.0, 1.0, -6, 0.12, this.world); this.fx.burst(p, '#ffe27a', 24, 2.0, 1.2, -1, 0.07, this.world); this.shake(0.25); }
      if (kind === 'burn') { this.fx.burst(p, '#ff6a20', 80, 2.2, 1.1, 2.0, 0.11, this.world); this.fx.burst(p, '#3a2a20', 30, 1.2, 1.6, 0.8, 0.14, this.world); }
      if (kind === 'seal') { p.y = 1; this.fx.burst(p, VIS[this.theme || 'rap'].accent, 140, 4.0, 1.6, -1, 0.12, this.world); this.fx.burst(p, '#ffffff', 50, 2.5, 1.0, 0, 0.08, this.world); this.shake(0.3); }
      return;
    }
    if (kind === 'heal') {
      const o2 = this.g.S.objs.find(x => x.t === 'npc' && x.d.kind === 'heal');
      if (o2) this.fx.burst(new THREE.Vector3(o2.x + 0.5, 0.6, o2.y + 0.5), '#7ad8ff', 60, 2.2, 1.4, -1.5, 0.12, this.world);
      if (this.player) this.fx.burst(this.player.root.position.clone().add(new THREE.Vector3(0, 0.8, 0)), '#8affb0', 40, 1.2, 1.2, -1.2, 0.1, this.world);
    }
  }

  frame(dt) {
    this.t += dt;
    wind.t.value = this.t;
    const g = this.g;
    const mode = g.mode;
    this.setMode(mode);
    if (mode === 2) {
      this.battle.update(dt);
      this.render(this.battle.scene);
      return;
    }
    const S = g.S;
    if (this.built !== this.mapKey()) this.build();
    if (this.terrain && !this.building) {
      this.syncDyn(dt);
      for (const ent of this.dyn.values()) {
        ent.a?.mixer?.update(dt);
        if (ent.spin) { ent.spin.rotation.y += dt * 2; ent.spin.position.y = 1.2 + Math.sin(this.t * 2.5) * 0.08; }
        if (ent.ring) ent.ring.material.opacity = 0.4 + Math.sin(this.t * 4) * 0.2;
        if (ent.flame && ent.lit) { ent.flame.scale.set(1 + Math.sin(this.t * 17) * 0.1, 1 + Math.sin(this.t * 11 + 1) * 0.18, 1); if (ent.light) ent.light.intensity = 6 + Math.sin(this.t * 13) * 1.2; }
        if (ent.glint) { const q = (Math.sin(this.t * 2.2 + ent.o.x) + 1) / 2; ent.glint.material.opacity = q * q; ent.glint.scale.setScalar(0.1 + q * 0.22); }
        if (ent.seal) { ent.seal.ring.rotation.x += dt * 1.2; ent.seal.inner.rotation.x -= dt * 2; ent.seal.wall.material.opacity = 0.28 + Math.sin(this.t * 3) * 0.1; }
        if (ent.k === 'portal') ent.n.traverse(o => { if (o.userData.spin) o.rotation.z += dt * o.userData.spin; if (o.userData.pulse) o.scale.setScalar(1 + Math.sin(this.t * 5) * 0.2); });
        if (ent.k === 'obj' && ent.o.t === 'npc' && ent.a && this.player) {
          const p = this.player.root.position, n = ent.n.position;
          const d = Math.hypot(p.x - n.x, p.z - n.z);
          this.face(ent.a, d < 2.6 ? p.x - n.x : 0, d < 2.6 ? p.z - n.z : 1, dt, 0.4);
        }
        if (ent.k === 'portal' && ent.n.userData.face) {
          // Wirbel zeigt zur Kamera
          for (const f of ent.n.userData.face) { f.lookAt(this.camera.position.x, f.getWorldPosition(new THREE.Vector3()).y, this.camera.position.z); f.rotateZ(this.t * (f.userData.spin || 1)); }
        }
      }
      for (const pt of this.plates || []) {
        const on = S.objs.some(o => o.t === 'block' && o.x === pt.x && o.y === pt.y) ? 1 : 0;
        pt.on += (on - pt.on) * Math.min(1, dt * 6);
        pt.m.material.emissiveIntensity = 0.25 + pt.on * 2.2;
        pt.r.material.opacity = 0.35 + pt.on * 0.6 + Math.sin(this.t * 3) * 0.1 * (1 - pt.on);
      }
      for (const dz of this.dying) {
        dz.life += dt;
        if (dz.lid) dz.lid.rotation.x = -Math.min(1, dz.life * 3) * 1.9;
        if (dz.door) dz.door.position.y = -Math.min(1, dz.life * 1.2) * 0.8;
        if (dz.spin) { dz.spin.position.y = 1.2 + dz.life * 1.5; dz.spin.rotation.y += dt * 8; }
        if (!dz.burst && dz.life > 0.15) { dz.burst = true; this.fx.burst(dz.n.position.clone().add(new THREE.Vector3(0, 0.6, 0)), dz.o.t === 'gate' ? '#ffd27a' : '#ffe27a', 40, 2.0, 1.0, -2, 0.09, this.world); }
        if (dz.life > 1.4) dz.n.scale.setScalar(Math.max(0.001, 1 - (dz.life - 1.4) * 3));
      }
      this.dying = this.dying.filter(dz => { if (dz.life > 1.8) { this.world.remove(dz.n); return false; } return true; });
      this.player?.a?.mixer?.update(dt);
      if (this.liquid) this.liquid.uniforms.t.value = this.t;
      this.updateCamera(dt, mode === 0);
      occ.on.value = mode === 0 || !this.player ? 0 : 1;
      if (this.player) occ.p.value.copy(this.player.root.position).add(new THREE.Vector3(0, 0.9 * FIELD_S, 0));
      if (this.playerLight && this.player) this.playerLight.position.copy(this.player.root.position).add(new THREE.Vector3(0, 1.6, 0.4));
      if (this.particles) { this.particles.material.uniforms.t.value = this.t; this.particles.material.uniforms.center.value.copy(this.camTarget); this.particles.material.uniforms.scale.value = this.H * 0.9; }
    }
    this.fx.update(dt);
    this.render(this.world);
  }
  updateCamera(dt, title) {
    const S = this.g.S;
    const cam = this.camera;
    if (title) {
      // Titel: langsame Kamerafahrt über Hafenau
      const a = this.t * 0.08;
      const c = new THREE.Vector3(S.mw / 2, 0.5, S.mh / 2 + 0.5);
      this.camTarget.copy(c);
      cam.position.set(c.x + Math.sin(a) * 12, 7.5, c.z + Math.cos(a) * 12);
      cam.lookAt(c);
      this.placeSun(this.world, c);
      return;
    }
    // Verfolgerkamera hinter dem Helden: drehbar (Maus ziehen, Wischen, Q/E, rechter Stick), zoombar (Mausrad, Zwei-Finger, Z)
    const pp = S.ppos;
    const cine = this.cine;
    const tgt = cine ? new THREE.Vector3(cine.x, cine.h ?? 0.9, cine.z) : new THREE.Vector3(pp.x + 0.5, this.heightAt(pp.x + 0.5, pp.y + 0.5) + 0.9 * FIELD_S, pp.y + 0.5);
    if (this.camKeys) this.camYawT += this.camKeys * dt * 2.2;
    const yawT = cine && cine.yaw !== undefined ? cine.yaw : this.camYawT;
    let dy = yawT - this.camYaw;
    dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    const k = Math.min(1, dt * (cine ? 2.2 : 8));
    this.camYaw += dy * k;
    const z = CAM_ZOOM[this.camZoom];
    // Im Kerker steiler von oben (vordere Mauern werden ausgeblendet)
    const indoor = !(this.g.S.map.world || this.g.S.map.town);
    const pitch = cine ? (cine.pitch ?? 0.32) : (indoor ? Math.max(z[0], 0.66) : z[0]);
    const wantD = cine ? (cine.dist ?? 6) : z[1];
    // Hindernisse zwischen Held und Kamera: erst steiler von oben schauen, notfalls heranrücken
    const clearAt = (pt, dist) => {
      const cx = Math.sin(this.camYaw) * Math.cos(pt), cz = Math.cos(this.camYaw) * Math.cos(pt), cy = Math.sin(pt);
      for (let s = 0.6; s < dist; s += 0.25) if (tgt.y + cy * s < this.obstacleAt(tgt.x + cx * s, tgt.z + cz * s) + 0.25) return s;
      return 0;
    };
    let usePitch = pitch, d = wantD;
    if (!cine) {
      for (let pt = pitch; pt <= 1.25; pt += 0.08) { usePitch = pt; if (!clearAt(pt, wantD)) break; }
      const hit = clearAt(usePitch, wantD);
      if (hit) d = Math.max(1.6, hit - 0.35);
    }
    this.camPitch += (usePitch - this.camPitch) * Math.min(1, dt * 5);
    const dirX = Math.sin(this.camYaw) * Math.cos(this.camPitch), dirZ = Math.cos(this.camYaw) * Math.cos(this.camPitch), dirY = Math.sin(this.camPitch);
    if (!this.camInit) { this.camTarget.copy(tgt); this.camD = d; this.camInit = true; }
    else { this.camTarget.lerp(tgt, Math.min(1, dt * (cine ? 2.5 : 9))); this.camD += (d - this.camD) * Math.min(1, dt * (d < this.camD ? 14 : 3)); }
    cam.position.set(this.camTarget.x + dirX * this.camD, this.camTarget.y + dirY * this.camD, this.camTarget.z + dirZ * this.camD);
    const gy = this.heightAt(cam.position.x, cam.position.z) + 0.35;
    if (cam.position.y < gy) cam.position.y = gy;
    if (this.shakeT > 0) { this.shakeT -= dt; cam.position.x += (Math.random() - 0.5) * 0.15; cam.position.y += (Math.random() - 0.5) * 0.1; }
    cam.lookAt(this.camTarget.x, this.camTarget.y + 0.25, this.camTarget.z);
    // Schattenbereich vor die Kamera legen (dort, wo man hinschaut)
    this._sunC = (this._sunC || new THREE.Vector3()).set(this.camTarget.x - dirX * 5, 0, this.camTarget.z - dirZ * 5);
    this.placeSun(this.world, this._sunC);
  }
  // Höhe der Hindernisse eines Feldes (für die Kamera)
  obstacleAt(x, z) {
    const S = this.g.S, tx = Math.floor(x), ty = Math.floor(z);
    if (tx < 0 || ty < 0 || tx >= S.mw || ty >= S.mh) return S.map.world || S.map.town ? -1 : 0;
    const ch = S.map.rows[ty][tx];
    const g = this.heightAt(x, z);
    // Kerkermauern werden zwischen Kamera und Held weggerastert: die Kamera muss nicht ausweichen
    if (ch === '#') return S.map.world || S.map.town ? 2.1 : g;
    if ('hHDSM'.includes(ch)) return 3.2;
    if (ch === 'T') return g + 2.8;
    return g;
  }
  // Bildschirmrichtung → Kartenrichtung (nächste Himmelsrichtung zur Kamera)
  camQuad() { return ((Math.round(this.camYaw / (Math.PI / 2)) % 4) + 4) % 4; }
  rotateCam(a) { this.camYawT += a; }
  zoomCam(d) { this.camZoom = Math.max(0, Math.min(CAM_ZOOM.length - 1, this.camZoom + d)); this.onCam?.(); }
  render(scene) {
    if (this.composer) {
      this.renderPass.scene = scene;
      this.renderPass.camera = this.camera;
      if (this.gtao) { this.gtao.scene = scene; this.gtao.camera = this.camera; }
      this.composer.render();
    } else this.renderer.render(scene, this.camera);
  }
  // Bildschirmposition (CSS-Pixel) eines Weltpunkts
  project(v) {
    const p = v.clone().project(this.camera);
    return { x: (p.x * 0.5 + 0.5) * this.W, y: (-p.y * 0.5 + 0.5) * this.H, vis: p.z < 1 && p.z > -1 };
  }
  // Selbstregelung: dauerhaft unter ~40 Bildern/s eine Stufe herunter
  watchFps(dt, locked) {
    if (locked) return;
    this.fpsT += dt; this.fpsN++;
    if (this.fpsT >= 2) {
      const fps = this.fpsN / this.fpsT;
      this.fpsT = 0; this.fpsN = 0;
      this.lowFor = fps < 40 ? this.lowFor + 1 : 0;
      if (this.lowFor >= 2 && this.qi > 0) { this.lowFor = 0; this.setQuality(this.qi - 1); this.onQuality?.(this.qi); }
    }
  }
}
