// Kampfbühne: Gegner vorn, Helden von hinten, Kulisse je Gebiet, Animationen, Ausfallschritte und Treffereffekte.
import * as THREE from 'three';
import { ENEMIES } from './data.js';
import * as A from './assets.js';
import { groundTex } from './textures.js';
import { addWind, makeParticles } from './shaders.js';
import { VIS, treesFor, palette, baseTheme } from './view.js';

const C = (c) => new THREE.Color(c);
const ATTACK = ['sword_attack', 'staff_attack', 'bow_attack_shoot', 'dagger_attack', 'attack', 'punch'];

// Gibt GPU-Speicher frei, den die Kampfszene selbst angelegt hat (geteilte Modelle aus dem Cache bleiben erhalten)
function disposeOwned(root) {
  root.traverse((o) => {
    if (o.userData.ownGeo) o.geometry?.dispose();
    if (o.userData.ownMat) for (const m of [].concat(o.material)) {
      if (!m) continue;
      if (m.userData.ownTex) { m.map?.dispose(); m.normalMap?.dispose(); }
      m.dispose();
    }
  });
}

export class Battle {
  constructor(view) {
    this.v = view;
    this.scene = new THREE.Scene();
    this.enemies = [];
    this.heroes = [];
    this.t = 0;
    this.token = 0;
    // feste Lichter (keine Shader-Neuübersetzung im Kampf)
    this.pool = [];
    for (let i = 0; i < 3; i++) { const l = new THREE.PointLight(0xffffff, 0, 9, 1.6); this.pool.push(l); }
    this.scene.userData.flashPool = this.pool;
    this.accent = [new THREE.PointLight(0xffffff, 0, 14, 1.4), new THREE.PointLight(0xffffff, 0, 14, 1.4)];
    this.rim = new THREE.DirectionalLight(0xffffff, 0);
  }

  async begin(bg, enemies, party) {
    const token = ++this.token;
    const v = this.v, sc = this.scene, Q = v.Q;
    const key = baseTheme(bg);
    const outdoor = bg.startsWith('ow_') || ['town', 'schlager', 'xmas'].includes(key);
    const skyTheme = outdoor ? (VIS[key].out ? key : 'town') : key;
    // Modelle laden (parallel), danach Bühne aufbauen
    const set = treesFor(bg);
    const loads = [
      Promise.all(enemies.map(e => v.actorMonster(e.id, e.boss ? 1.15 : 2.0))),
      Promise.all(party.map(h => v.actorHero(h.id, true))),
      Promise.all([...set.map(s => A.load(s[0])), A.load(outdoor ? 'forest/rocks-high.glb' : 'town/rock-large.glb')])
    ];
    const [ens, hes] = await Promise.all(loads);
    const models = {};
    for (const s of set) models[s[0]] = await A.load(s[0]);
    const rockP = outdoor ? 'forest/rocks-high.glb' : 'town/rock-large.glb';
    models[rockP] = await A.load(rockP);
    if (token !== this.token) return;
    this.clear();
    const { v: vis } = v.setupSky(sc, skyTheme, 9);
    v.renderer.toneMappingExposure = vis.expo;
    const pal = palette(bg);
    // Boden: große Scheibe mit Detailtextur, zum Rand dunkler
    const gtex = groundTex(outdoor ? (key === 'xmas' ? 'snow' : 'grass') : (key === 'rap' || key === 'static' ? 'tile' : 'crack'));
    const map = gtex.map.clone(), nm = gtex.normal.clone();
    map.repeat.set(14, 14); nm.repeat.set(14, 14); map.needsUpdate = nm.needsUpdate = true;
    const geo = new THREE.CircleGeometry(45, 64, 0, Math.PI * 2);
    geo.rotateX(-Math.PI / 2);
    const cols = [], p = geo.attributes.position, base = C(pal[0]).lerp(C(pal[1]), 0.5).multiplyScalar(0.92);
    for (let i = 0; i < p.count; i++) { const r = Math.hypot(p.getX(i), p.getZ(i)); const k = Math.max(0.55, 1 - r / 60); cols.push(base.r * k, base.g * k, base.b * k); }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    const ground = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, map, normalMap: nm, roughness: 0.92 }));
    ground.receiveShadow = true;
    ground.userData.ownGeo = ground.userData.ownMat = true;
    ground.material.userData.ownTex = true;
    sc.add(ground);
    // Kulisse
    const rng = mulberry(hashStr(bg));
    const groups = new Map();
    const add = (path, m) => { if (!groups.has(path)) groups.set(path, []); groups.get(path).push(m); };
    const mk = (x, z, s, yaw, sy = s) => new THREE.Matrix4().compose(new THREE.Vector3(x, 0, z), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw), new THREE.Vector3(s, sy, s));
    for (let i = 0; i < 30; i++) {
      const a = -Math.PI * (0.05 + rng() * 0.9), r = 10 + rng() * 10;
      const pick = set[Math.floor(rng() * set.length)];
      const s = pick[1] * (1 + rng() * 0.6);
      add(pick[0], mk(Math.cos(a) * r * 1.3, Math.sin(a) * r - 1, s, rng() * 6.28));
    }
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI * (0.1 + rng() * 0.8);
      add(rockP, mk(Math.cos(a) * 24, Math.sin(a) * 18 - 2, 5.5, rng() * 6.28, 6.5));
    }
    for (const [path, list] of groups) v.addInstances(sc, models[path], list, path.includes('tree') || path.includes('pine'), false);
    if (outdoor && Q.grass) this.grass(sc, pal, Q.grass * 260);
    // Licht: Gegenlicht und farbige Akzente in Höhlen
    this.rim.color.set(outdoor ? '#ffe8d0' : vis.accent || '#ffffff');
    this.rim.intensity = outdoor ? 0.8 : 1.6;
    this.rim.position.set(0, 4, -10);
    sc.add(this.rim);
    for (const [i, l] of this.accent.entries()) {
      l.color.set(outdoor ? '#ffffff' : (vis.accent || '#ffffff'));
      l.intensity = outdoor ? 0 : 22;
      l.position.set(i ? 6 : -6, 3.5, -3.5);
      sc.add(l);
    }
    for (const l of this.pool) { l.intensity = 0; l.userData.busy = false; sc.add(l); }
    this.parts = makeParticles(vis.part[0], Math.round(Q.parts * 0.7), vis.part[1], new THREE.Vector3(24, 8, 16));
    this.parts.material.uniforms.center.value.set(0, 0, -2);
    this.parts.userData.ownGeo = this.parts.userData.ownMat = true;
    sc.add(this.parts);
    // Figuren
    const n = enemies.length;
    this.enemies = ens.map((a, i) => {
      const x = (i - (n - 1) / 2) * (n > 1 ? 3.7 : 0);
      a.root.position.set(x, 0, -3.4);
      a.base = a.root.position.clone();
      v.addBlob(a.root, enemies[i].boss ? 3.0 : 1.9);
      a.mats = [];
      a.root.traverse(o => { if (o.isMesh && o.material.emissive) a.mats.push(o.material); });
      sc.add(a.root);
      return a;
    });
    const hn = party.length;
    this.heroes = hes.map((a, i) => {
      a.root.position.set((i - (hn - 1) / 2) * 1.9, 0, 0.1 + Math.abs(i - (hn - 1) / 2) * 0.25);
      a.base = a.root.position.clone();
      a.pivot.rotation.y = Math.PI;
      a.id = party[i].id;
      sc.add(a.root);
      if (party[i].hp <= 0) { A.playOnce(a, 'death', ''); a.mixer?.update(5); }
      return a;
    });
    this.t = 0;
    this.camT = 0;
    this.shakeT = 0;
    this.placeCam(0);
    v.placeSun(sc, new THREE.Vector3(0, 0, -1.5));
    // erste Bilder ohne Ruckler: Shader vorab übersetzen
    v.renderer.compile(sc, v.camera);
  }
  grass(sc, pal, count) {
    const g = new THREE.PlaneGeometry(0.06, 0.34, 1, 3);
    g.translate(0, 0.17, 0);
    const mat = addWind(new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide, roughness: 0.85 }), 0.07, 0.34);
    const im = new THREE.InstancedMesh(g, mat, count);
    im.userData.ownGeo = im.userData.ownMat = true;
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), col = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2, r = 2.5 + Math.sqrt(Math.random()) * 15;
      p.set(Math.cos(a) * r * 1.3, 0, Math.sin(a) * r - 2);
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.random() * 6.28);
      s.set(1, 0.6 + Math.random() * 1.1, 1);
      m.compose(p, q, s);
      im.setMatrixAt(i, m);
      col.set(pal[0]).lerp(C(pal[3] || pal[1]), Math.random() * 0.6).multiplyScalar(0.85 + Math.random() * 0.3);
      im.setColorAt(i, col);
    }
    im.receiveShadow = true;
    im.frustumCulled = false;
    sc.add(im);
  }
  clear() {
    const sc = this.scene;
    this.v.fx.clear(sc);
    for (const c of sc.children.slice()) {
      if (c === sc.userData.sky || c === sc.userData.sun || c === sc.userData.hemi || c === sc.userData.sun?.target) continue;
      sc.remove(c);
      disposeOwned(c);
    }
    this.enemies = [];
    this.heroes = [];
  }
  end() { this.token++; this.clear(); }

  placeCam(dt) {
    const cam = this.v.camera;
    this.camT += dt;
    cam.position.set(Math.sin(this.camT * 0.25) * 0.5, 5.0, 9.4);
    if (this.shakeT > 0) { this.shakeT -= dt; cam.position.x += (Math.random() - 0.5) * 0.22; cam.position.y += (Math.random() - 0.5) * 0.15; }
    cam.lookAt(0, 0.9, -0.9);
  }
  // Ausfallschritt: Figur bewegt sich kurz in Richtung dir
  lunge(a, dir, dist, dur) { a.lunge = { t: 0, dur, dir: dir.clone().setY(0).normalize(), dist }; }
  hero(i, k, target) {
    if (i === -1 && k === 'victory') {
      for (const a of this.heroes) if (a.state !== 'once' || a.dead !== true) { if (!a.dead) a.hop = { t: 0 }; }
      return;
    }
    const a = this.heroes[i];
    if (!a) return;
    const tgt = target >= 0 ? this.enemies[target] : null;
    switch (k) {
      case 'attack': {
        A.playOnce(a, ATTACK);
        const melee = a.id === 'andrew' || a.id === 'andy';
        if (tgt) this.lunge(a, tgt.base.clone().sub(a.base), melee ? 2.2 : 0.5, 0.6);
        if (a.id === 'rico' && tgt) this.bolt(a, tgt, '#ffd27a', 0.22);
        break;
      }
      case 'cast':
        A.playOnce(a, ['spell1', 'staff_attack', 'attack', 'punch']);
        this.v.fx.burst(a.root.position.clone().add(new THREE.Vector3(0, 1.0, 0)), a.id === 'teresa' ? '#9affc0' : '#c8a0ff', 24, 1.4, 0.7, 1.5, 0.12, this.scene);
        if (tgt) this.bolt(a, tgt, '#c890ff', 0.3);
        break;
      case 'hurt':
        A.playOnce(a, 'recievehit');
        this.lunge(a, new THREE.Vector3(0, 0, 1), 0.35, 0.3);
        break;
      case 'death': a.dead = true; A.playOnce(a, 'death', ''); break;
      case 'idle': a.dead = false; a.state = ''; A.playLoop(a, 'idle'); break;
      case 'guard': A.playOnce(a, ['idle_weapon', 'idle_attacking', 'idle']); break;
    }
  }
  enemy(i, k, target) {
    const a = this.enemies[i];
    if (!a) return;
    if (k === 'attack') {
      A.playOnce(a, ['bite_front', 'attack', 'dragon_attack', 'skeleton_attack', 'slime_attack']);
      const h = target >= 0 ? this.heroes[target] : null;
      this.lunge(a, h ? h.base.clone().sub(a.base) : new THREE.Vector3(0, 0, 1), 1.4, 0.55);
    } else if (k === 'hurt') {
      A.playOnce(a, ['hitrecieve', 'hit']);
      a.flash = 0.22;
      this.lunge(a, new THREE.Vector3(0, 0, -1), 0.3, 0.25);
    }
  }
  enemyDown(i) {
    const a = this.enemies[i];
    if (!a) return;
    if (!A.playOnce(a, 'death', '')) a.noDeathAnim = true;
    a.down = 0.0001;
  }
  // Leuchtendes Geschoss vom Helden zum Gegner
  bolt(from, to, color, delay) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8), new THREE.MeshBasicMaterial({ color: C(color).multiplyScalar(4) }));
    const p0 = from.root.position.clone().add(new THREE.Vector3(0, 1.0, -0.3));
    const p1 = to.root.position.clone().add(new THREE.Vector3(0, to.h * 0.5, 0));
    m.position.copy(p0);
    m.visible = false;
    this.v.fx.add(m, this.scene, 0.28 + delay, (k) => {
      const t = Math.max(0, (k * (0.28 + delay) - delay) / 0.28);
      m.visible = t > 0;
      m.position.lerpVectors(p0, p1, t);
      m.position.y += Math.sin(t * Math.PI) * 0.6;
    });
  }
  pos(side, i, lift) {
    const a = side === 'enemy' ? this.enemies[i] : this.heroes[i];
    if (!a) return null;
    return a.root.position.clone().add(new THREE.Vector3(0, lift ?? a.h, 0));
  }
  fxAt(kind, side, i) {
    const fx = this.v.fx, sc = this.scene;
    if (kind === 'victory') {
      for (const a of this.heroes) fx.burst(a.root.position.clone().add(new THREE.Vector3(0, 1.8, 0)), ['#ffd24a', '#ff5ad0', '#46e6ff', '#7cff9a'][Math.floor(Math.random() * 4)], 30, 2.6, 1.3, -3, 0.1, sc);
      return;
    }
    const a = side === 'enemy' ? this.enemies[i] : this.heroes[i];
    if (!a) return;
    const mid = a.root.position.clone().add(new THREE.Vector3(0, a.h * 0.55, 0));
    const feet = a.root.position.clone().add(new THREE.Vector3(0, 0.05, 0));
    switch (kind) {
      case 'slash':
        fx.slash(mid, '#ffffff', 1.4 + a.h * 0.3, sc);
        fx.burst(mid, '#ffe8a0', 18, 3.2, 0.45, -4, 0.09, sc);
        break;
      case 'bigslash':
        fx.slash(mid, '#ffc840', 2.4 + a.h * 0.3, sc);
        fx.ring(feet, '#ffb020', 0.3, 3.5, 0.5, sc);
        fx.burst(mid, '#ffd24a', 40, 4.5, 0.7, -4, 0.12, sc);
        fx.flash(mid, '#ffb040', 40, 0.4, sc);
        this.shakeT = 0.25;
        break;
      case 'magic':
        fx.burst(mid, '#b48aff', 46, 3.4, 0.7, 0.5, 0.14, sc);
        fx.ring(mid, '#c8a0ff', 0.2, 2.2, 0.45, sc, false);
        fx.flash(mid, '#9a6aff', 30, 0.45, sc);
        break;
      case 'heal':
        fx.burst(feet.clone().add(new THREE.Vector3(0, 0.3, 0)), '#7cffb0', 30, 1.2, 1.1, 2.0, 0.11, sc);
        fx.ring(feet, '#7cffb0', 0.2, 1.1, 0.7, sc);
        break;
      case 'guard': fx.bubble(mid, '#6ac8ff', 0.95, 0.8, sc); break;
      case 'hit': fx.burst(mid, '#ff6a5a', 14, 2.4, 0.4, -4, 0.08, sc); break;
      case 'heavy':
        fx.burst(mid, '#ff4a3a', 28, 3.4, 0.5, -4, 0.11, sc);
        this.shakeT = 0.3;
        break;
      case 'spec':
        fx.ring(feet, '#ff4a6a', 0.5, 11, 0.8, sc);
        fx.flash(mid, '#ff3050', 60, 0.6, sc);
        this.shakeT = 0.45;
        break;
      case 'special':
        fx.ring(feet, '#ffd24a', 0.2, 1.6, 0.6, sc);
        fx.burst(feet.clone().add(new THREE.Vector3(0, 0.4, 0)), '#ffd24a', 40, 1.6, 0.9, 2.5, 0.12, sc);
        fx.flash(mid, '#ffc040', 30, 0.6, sc);
        break;
    }
  }
  update(dt) {
    this.t += dt;
    const all = [...this.enemies, ...this.heroes];
    for (const a of all) {
      a.mixer?.update(dt);
      const off = new THREE.Vector3();
      if (a.lunge) {
        const L = a.lunge;
        L.t += dt;
        const k = Math.min(1, L.t / L.dur);
        off.addScaledVector(L.dir, Math.sin(k * Math.PI) * L.dist);
        if (k >= 1) a.lunge = null;
      }
      if (a.hop) { a.hop.t += dt; off.y += Math.max(0, Math.sin(a.hop.t * 9)) * 0.35 * Math.max(0, 1 - a.hop.t / 1.4); if (a.hop.t > 1.4) a.hop = null; }
      a.root.position.copy(a.base).add(off);
      if (a.flash !== undefined && a.mats) {
        a.flash = Math.max(0, a.flash - dt);
        const f = a.flash / 0.22;
        for (const m of a.mats) { m.emissive.setRGB(f, f, f); m.emissiveIntensity = 1.5; }
      }
      if (a.down) {
        a.down += dt;
        if (a.down > 0.9 || a.noDeathAnim) {
          const k = Math.min(1, (a.down - (a.noDeathAnim ? 0 : 0.9)) / 0.35);
          a.root.scale.setScalar(Math.max(0.001, 1 - k));
          if (!a.poof && k > 0.1) { a.poof = true; this.v.fx.burst(a.root.position.clone().add(new THREE.Vector3(0, a.h * 0.4, 0)), '#c8d0ff', 36, 2.2, 0.8, 0.8, 0.11, this.scene); }
          if (k >= 1) a.root.visible = false;
        }
      }
    }
    if (this.parts) { this.parts.material.uniforms.t.value = this.t; this.parts.material.uniforms.scale.value = this.v.H * 0.9; }
    this.placeCam(dt);
    this.v.fx.update(dt);
  }
}

function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function mulberry(a) { return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
