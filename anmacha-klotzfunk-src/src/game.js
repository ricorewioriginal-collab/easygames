// Spielkern: Rendering, Chunk-Streaming, Physik-Schleife, Bauen/Abbauen, Tag-Nacht, Speicherstand.
import * as THREE from 'three';
import { World, B, CS, H, NAMES, LOGO0, SPECIAL0, SPECIAL_COUNT, isLogo } from './world.js';
import { buildMesh, cubeData } from './mesher.js';
import { drawAtlas, createLogoAtlas, cloudCanvas } from './textures.js';
import { Player, raycast, EYE } from './physics.js';
import { playBreak, playPlace, playDeny, setRadio } from './audio.js';

export const DAY_LENGTH = 480; // Sekunden pro Tag
const REACH = 6;
const MAX_STACK = 999;

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

// mittlere Blockfarben für Bruchstücke
const BLOCK_COLOR = { 1: 0x58a03c, 2: 0x86603f, 3: 0x7c7c80, 4: 0xdbcb8e, 5: 0x68502e, 6: 0x3a8030, 7: 0xac8652, 8: 0xcfe8f0, 9: 0xffd87a,
  27: 0xff6aa0, 28: 0xffd628, 29: 0x50c8ee, 30: 0x3a3e4a, 31: 0xdd66ff, 32: 0xff2846, 33: 0x288cff, 34: 0x32ff78, 35: 0xbe46ff, 36: 0x9a4a38, 37: 0xe6e6ee };

const lerp = (a, b, t) => a + (b - a) * t;
const mix3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

export class Game {
  constructor(canvas, coarse) {
    this.coarse = coarse;
    const dpr = window.devicePixelRatio || 1;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: !(coarse && dpr >= 2.5), powerPreference: 'high-performance' });
    this.maxDpr = coarse ? 1.75 : 2;
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
    this.scene.add(this.clouds);

    // Zielmarkierung
    const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.004, 1.004, 1.004));
    this.hl = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.75 }));
    this.hl.visible = false;
    this.scene.add(this.hl);

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
    this.resize();
  }

  // ---------- Einstellungen ----------
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
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.maxDpr));
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    if (!this.running && this.world) this.render();
  }

  // ---------- Welt starten / laden ----------
  start(save) {
    this.stop();
    this.clearWorld();
    const edits = new Map();
    if (save.edits) for (const k of Object.keys(save.edits)) {
      const arr = save.edits[k], m = new Map();
      for (let i = 0; i + 1 < arr.length; i += 2) m.set(arr[i], arr[i + 1]);
      edits.set(Number(k), m);
    }
    this.world = new World(save.seed, edits);
    this.name = save.name; this.seed = save.seed; this.mode = save.mode;
    this.time = save.time ?? 0.08;
    this.hotbar = (save.hotbar && save.hotbar.length === 9) ? save.hotbar.slice() : [1, 2, 3, 4, 5, 6, 7, 8, 9];
    this.sel = save.sel ?? 0;
    this.inv = save.inv ? { ...save.inv } : { [B.DIRT]: 20, [B.PLANKS]: 10, [B.GLASS]: 4 };
    if (!save.inv) {
      for (let i = 0; i < 16; i++) this.inv[LOGO0 + i] = 4;
      for (let i = 0; i < SPECIAL_COUNT; i++) this.inv[SPECIAL0 + i] = 8;
    }
    this.wp = save.wp || null; this.hookT = 0; this.rope.visible = false; this.timeFrozen = false;
    this.handType = -1;
    this.spawn = this.world.findSpawn();
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

  clearWorld() {
    for (const c of this.group.children.slice()) { c.geometry.dispose(); this.group.remove(c); }
    this.world = null;
  }

  // synchron: Daten bis Radius rd, Meshes bis Radius rm (Chunks)
  loadAround(rd, rm) {
    const pcx = Math.floor(this.player.x / CS), pcz = Math.floor(this.player.z / CS);
    for (let dz = -rd; dz <= rd; dz++) for (let dx = -rd; dx <= rd; dx++) this.world.ensure(pcx + dx, pcz + dz);
    for (let dz = -rm; dz <= rm; dz++) for (let dx = -rm; dx <= rm; dx++) this.applyMesh(this.world.getChunk(pcx + dx, pcz + dz));
  }

  serialize() {
    const edits = {};
    for (const [k, m] of this.world.edits) { const a = []; for (const [i, t] of m) a.push(i, t); edits[k] = a; }
    const p = this.player;
    return {
      v: 1, name: this.name, seed: this.seed, mode: this.mode, time: this.time, savedAt: Date.now(),
      px: p.x, py: p.y, pz: p.z, yaw: this.yaw, pitch: this.pitch, hotbar: this.hotbar, sel: this.sel, inv: this.inv, wp: this.wp, edits
    };
  }

  respawn() {
    const p = this.player;
    this.world.ensure(Math.floor(this.spawn.x / CS), Math.floor(this.spawn.z / CS));
    p.x = this.spawn.x; p.y = this.spawn.y; p.z = this.spawn.z; p.vx = p.vy = p.vz = 0; p.flying = false;
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
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.step(dt);
    this.render();
  }

  step(dt) {
    const w = this.world, p = this.player;
    if (!this.timeFrozen) this.time = (this.time + dt / DAY_LENGTH) % 1;
    this.uni.uTime.value = performance.now() / 1000;
    this.updateHook(dt);
    p.update(w, dt, this.input, this.yaw);
    this.applyCamera();
    this.stream();
    // Zielblock und Aktionen
    const c = this.camera, dir = new THREE.Vector3(0, 0, -1).applyEuler(c.rotation);
    this.target = raycast(w, c.position.x, c.position.y, c.position.z, dir.x, dir.y, dir.z, REACH);
    if (this.target) { this.hl.position.set(this.target.x + 0.5, this.target.y + 0.5, this.target.z + 0.5); this.hl.visible = true; }
    else this.hl.visible = false;
    this.actCool -= dt;
    if (this.actCool <= 0) {
      if (this.breakHeld && this.breakBlock()) this.actCool = 0.22;
      else if (this.placeHeld && this.placeBlock()) this.actCool = 0.25;
    }
    this.flushDirty();
    this.updateSky();
    this.cloudU.uOff.value.x += dt * 2.5;
    this.radioT -= dt;
    if (this.radioT <= 0) { this.radioT = 0.3; this.updateRadio(); }
    this.updateHand(dt);
    if (this.partCount) this.updateParticles(dt);
  }

  // ---------- Seilhaken, Wegpunkt, Radio ----------
  fireHook() {
    if (!this.running) return;
    const c = this.camera, d = new THREE.Vector3(0, 0, -1).applyEuler(c.rotation);
    const r = raycast(this.world, c.position.x, c.position.y, c.position.z, d.x, d.y, d.z, 40);
    if (!r) { playDeny(); this.onToast('Seilhaken: kein Ziel in Reichweite'); return; }
    this.hookTarget.set(r.x + 0.5 + r.nx * 0.9, r.y + 0.5 + r.ny * 0.9, r.z + 0.5 + r.nz * 0.9);
    this.hookT = 1.6; playPlace();
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

  // ---------- Hand-Block und Bruchstücke ----------
  updateHand(dt) {
    const t = this.hotbar[this.sel];
    if (t !== this.handType) {
      this.handType = t;
      this.hand.visible = t > 0;
      if (t > 0) {
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
  }

  spawnBreak(x, y, z, type) {
    const color = BLOCK_COLOR[type] ?? 0xdddddd;
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
      if (this.mode !== 'creative') this.inv[t.type] = Math.min(MAX_STACK, (this.inv[t.type] || 0) + 1);
      this.unsaved = true; this.swing = 1; this.spawnBreak(t.x, t.y, t.z, t.type); playBreak(); this.onChange();
      return true;
    }
    return false;
  }

  placeBlock() {
    const t = this.target, type = this.hotbar[this.sel];
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
    if (this.mode !== 'creative') this.inv[type]--;
    this.unsaved = true; this.swing = 1; playPlace(); this.onChange();
    return true;
  }

  selectSlot(i) { this.sel = ((i % 9) + 9) % 9; this.onChange(); }

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
    let gen = this.coarse ? 2 : 3, mesh = this.coarse ? 1 : 2, worked = false;
    const R = this.viewDist + 0.5;
    for (const [dx, dz, d] of this.offsets) {
      let c = this.world.getChunk(pcx + dx, pcz + dz);
      if (!c) {
        if (gen <= 0) { worked = true; continue; }
        c = this.world.ensure(pcx + dx, pcz + dz); gen--; worked = true;
      }
      if (d <= R && !c.meshed) {
        if (mesh <= 0) { worked = true; continue; }
        if (this.applyMesh(c)) { mesh--; worked = true; }
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
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(8, H / 2, 8), 36);
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
    this.clouds.visible = !under;
    const cl = mix3([0.2, 0.23, 0.36], [1, 1, 1], day);
    this.cloudU.uCol.value.set(cl[0] + dw * 0.0, cl[1] - dw * 0.18, cl[2] - dw * 0.3);
  }

  render() { this.renderer.render(this.scene, this.camera); }

  // Uhrzeit als Text (Tag beginnt 06:00 bei time = 0)
  clockText() {
    const m = Math.floor(((this.time * 24 + 6) % 24) * 60);
    return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
  }
}
