// Spielkern: Rendering, Chunk-Streaming, Physik-Schleife, Bauen/Abbauen, Tag-Nacht, Speicherstand.
import * as THREE from 'three';
import { World, B, CS, H, NAMES, chunkKey } from './world.js';
import { buildMesh } from './mesher.js';
import { drawAtlas } from './textures.js';
import { Player, raycast, EYE } from './physics.js';
import { playBreak, playPlace, playDeny } from './audio.js';

export const DAY_LENGTH = 480; // Sekunden pro Tag
const REACH = 6;
const MAX_STACK = 999;

const VERT = `
attribute vec4 aCol; varying vec2 vUv; varying vec4 vCol; varying float vDist;
void main(){ vUv = uv; vCol = aCol; vec4 mv = modelViewMatrix * vec4(position, 1.0); vDist = length(mv.xyz); gl_Position = projectionMatrix * mv; }`;
const FRAG = `
uniform sampler2D uMap; uniform vec3 uLight; uniform vec3 uFog; uniform vec2 uFogRange; uniform float uCut;
varying vec2 vUv; varying vec4 vCol; varying float vDist;
void main(){
  vec4 t = texture2D(uMap, vUv);
  if (t.a < uCut) discard;
  vec3 c = t.rgb * mix(vCol.rgb * uLight, vec3(1.0), vCol.a);
  float f = smoothstep(uFogRange.x, uFogRange.y, vDist);
  gl_FragColor = vec4(mix(c, uFog, f), t.a);
}`;

const lerp = (a, b, t) => a + (b - a) * t;
const mix3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

export class Game {
  constructor(canvas, coarse) {
    this.coarse = coarse;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: !coarse, powerPreference: 'high-performance' });
    this.maxDpr = coarse ? 1.5 : 2;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(coarse ? 70 : 75, 1, 0.08, 1000);
    this.camera.rotation.order = 'YXZ';
    this.group = new THREE.Group();
    this.scene.add(this.group);

    // Textur-Atlas
    this.atlasCanvas = drawAtlas();
    const tex = new THREE.CanvasTexture(this.atlasCanvas);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestMipmapLinearFilter;
    tex.generateMipmaps = true;
    this.uniforms = {
      uMap: { value: tex }, uLight: { value: new THREE.Vector3(1, 1, 1) }, uFog: { value: new THREE.Vector3(0.5, 0.8, 0.9) },
      uFogRange: { value: new THREE.Vector2(40, 90) }
    };
    const mk = (cut, trans) => new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG, transparent: trans, depthWrite: !trans, side: trans ? THREE.DoubleSide : THREE.FrontSide,
      uniforms: { ...this.uniforms, uCut: { value: cut } }
    });
    this.matO = mk(0.5, false);
    this.matT = mk(0.02, true);

    // Himmel: Sonne, Mond, Sterne (blockig passend zum Stil)
    this.sky = new THREE.Group();
    this.scene.add(this.sky);
    const quad = (size, color) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ color, fog: false }));
      this.sky.add(m); return m;
    };
    this.sun = quad(70, 0xfff2b0);
    this.moon = quad(46, 0xdfe8ff);
    const sp = new Float32Array(240 * 3);
    for (let i = 0; i < 240; i++) {
      const u = Math.random() * 2 - 1, a = Math.random() * Math.PI * 2, r = Math.sqrt(1 - u * u);
      sp[i * 3] = Math.cos(a) * r * 500; sp[i * 3 + 1] = u * 500; sp[i * 3 + 2] = Math.sin(a) * r * 500;
    }
    const sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    this.starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 2, sizeAttenuation: false, transparent: true, opacity: 0, fog: false });
    this.stars = new THREE.Points(sg, this.starMat);
    this.sky.add(this.stars);

    // Zielmarkierung
    const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.004, 1.004, 1.004));
    this.hl = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.75 }));
    this.hl.visible = false;
    this.scene.add(this.hl);

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
      px: p.x, py: p.y, pz: p.z, yaw: this.yaw, pitch: this.pitch, hotbar: this.hotbar, sel: this.sel, inv: this.inv, edits
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
  stop() { this.running = false; cancelAnimationFrame(this.raf); }

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
    this.time = (this.time + dt / DAY_LENGTH) % 1;
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
      this.unsaved = true; playBreak(); this.onChange();
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
    this.unsaved = true; playPlace(); this.onChange();
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
    for (const k of ['opaque', 'trans']) {
      if (c[k]) { this.group.remove(c[k]); c[k].geometry.dispose(); c[k] = null; }
    }
  }

  applyMesh(c) {
    const res = buildMesh(this.world, c);
    if (!res) return false;
    this.setPart(c, 'opaque', res.opaque, this.matO);
    this.setPart(c, 'trans', res.trans, this.matT);
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
    const a = this.time * Math.PI * 2, s = Math.sin(a);
    const day = smooth(-0.12, 0.28, s);
    const night = [0.03, 0.05, 0.13], dayC = [0.53, 0.8, 0.93], dusk = [0.92, 0.48, 0.3];
    let sky = mix3(night, dayC, day);
    const dw = Math.max(0, 1 - Math.abs(s) / 0.3) * 0.55;
    sky = mix3(sky, dusk, dw);
    const light = mix3([0.3, 0.34, 0.56], [1, 1, 1], day);
    const warm = dw * 0.5;
    this.uniforms.uLight.value.set(light[0], light[1] * (1 - warm * 0.15), light[2] * (1 - warm * 0.4));
    // Wasser-Tauchsicht
    const c = this.camera.position;
    const under = this.world.getBlock(Math.floor(c.x), Math.floor(c.y), Math.floor(c.z)) === B.WATER;
    this.underwater = under;
    const far = this.viewDist * CS - 6;
    if (under) {
      const f = mix3([0.05, 0.16, 0.32], [0.14, 0.4, 0.7], day);
      this.uniforms.uFog.value.set(f[0], f[1], f[2]);
      this.uniforms.uFogRange.value.set(0.5, 22);
      this.renderer.setClearColor(new THREE.Color().setRGB(f[0], f[1], f[2], THREE.SRGBColorSpace));
    } else {
      this.uniforms.uFog.value.set(sky[0], sky[1], sky[2]);
      this.uniforms.uFogRange.value.set(far * 0.45, far);
      this.renderer.setClearColor(new THREE.Color().setRGB(sky[0], sky[1], sky[2], THREE.SRGBColorSpace));
    }
    // Sonne/Mond/Sterne um den Spieler
    this.sky.position.copy(this.camera.position);
    const sd = new THREE.Vector3(Math.cos(a), Math.sin(a), 0.25).normalize();
    this.sun.position.copy(sd).multiplyScalar(420); this.sun.lookAt(this.camera.position);
    this.moon.position.copy(sd).multiplyScalar(-420); this.moon.lookAt(this.camera.position);
    this.sun.visible = s > -0.2; this.moon.visible = s < 0.2;
    this.starMat.opacity = Math.max(0, Math.min(1, (0.15 - s) * 3)) * (under ? 0 : 1);
    this.stars.rotation.z = a;
  }

  render() { this.renderer.render(this.scene, this.camera); }

  // Uhrzeit als Text (Tag beginnt 06:00 bei time = 0)
  clockText() {
    const m = Math.floor(((this.time * 24 + 6) % 24) * 60);
    return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
  }
}
