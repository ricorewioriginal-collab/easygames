// Kampfbühne: Gegner vorn, Helden von hinten, Kulisse je Gebiet, Animationen, Ausfallschritte und Treffereffekte.
import * as THREE from 'three';
import { ENEMIES } from './data.js';
import * as A from './assets.js';
import { groundTex } from './textures.js';
import { addWind, makeParticles } from './shaders.js';
import { VIS, treesFor, palette, baseTheme } from './view.js';

const C = (c) => new THREE.Color(c);
// Effekt je Technik (Fertigkeiten und Spezialtechniken)
const SKILL_FX = { wucht: 'heavyslash', rund: 'sweep', funke: 'lightning', welle: 'wave', heilton: 'heal', chor: 'healall', doppel: 'arrows2', streu: 'arrows', schild: 'shieldbash', bollwerk: 'dome',
  ip_andrew: 'starfall', ip_marco: 'supernova', ip_teresa: 'hymn', ip_rico: 'volley', ip_andy: 'quake' };
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

  async begin(bg, enemies, party, cap) {
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
      cap ? v.actorCapsule(cap) : Promise.resolve(null),
      Promise.all([...set.map(s => A.load(s[0])), A.load(outdoor ? 'forest/rocks-high.glb' : 'town/rock-large.glb')])
    ];
    const [ens, hes, capA] = await Promise.all(loads);
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
    // Kapselgeist rechts neben der Gruppe
    this.cap = capA;
    if (capA) {
      capA.root.position.set(((hn - 1) / 2) * 1.9 + 1.7, 0, -0.5);
      capA.base = capA.root.position.clone();
      capA.pivot.rotation.y = Math.PI;
      sc.add(capA.root);
    }
    this.t = 0;
    this.camT = 0;
    this.shakeT = 0;
    this.hitStop = 0;
    this.camP = null;
    this.shotQ = null;
    this.shotIntro();
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
    this.cap = null;
  }
  end() { this.token++; this.clear(); }

  // Kamera: ruhige Totale, dazu kurze Einstellungen je Aktion (über die Schulter, Nahaufnahme, Gegnersicht, Siegerpose)
  placeCam(dt) {
    const cam = this.v.camera;
    this.camT += dt;
    let p = new THREE.Vector3(Math.sin(this.camT * 0.25) * 0.5, 5.0, 9.4), l = new THREE.Vector3(0, 0.9, -0.9);
    const sh = this.shotQ;
    if (sh) {
      sh.t += dt;
      const k = Math.min(1, sh.t / sh.dur), e = k * k * (3 - 2 * k);
      p = sh.p0.clone().lerp(sh.p1, e); l = sh.l0.clone().lerp(sh.l1, e);
      if (sh.t >= sh.dur + (sh.hold ?? 0.35)) this.shotQ = null;
    }
    if (!this.camP || dt === 0) { this.camP = p.clone(); this.camL = l.clone(); }
    const f = Math.min(1, dt * (sh ? (sh.snap ?? 7) : 3.2));
    this.camP.lerp(p, f); this.camL.lerp(l, f);
    cam.position.copy(this.camP);
    if (this.shakeT > 0) { this.shakeT -= dt; cam.position.x += (Math.random() - 0.5) * 0.22; cam.position.y += (Math.random() - 0.5) * 0.15; }
    cam.lookAt(this.camL);
  }
  // Einstellung: Kamera fährt von p0 nach p1 und blickt von l0 nach l1
  shot(p0, l0, p1 = p0, l1 = l0, dur = 0.8, hold = 0.35, snap) { this.shotQ = { p0, l0, p1, l1, dur, hold, snap, t: 0 }; }
  shotOver(a, tgt) {
    if (!a) return;
    const h = a.base, e = tgt ? tgt.base : new THREE.Vector3(0, 0, -3.4);
    const side = h.x >= 0 ? 1 : -1;
    const look = h.clone().lerp(e, 0.6).setY(1.0);
    this.shot(h.clone().add(new THREE.Vector3(side * 2.4, 1.8, 3.4)), look, h.clone().add(new THREE.Vector3(side * 1.5, 1.5, 2.6)), look, 0.9, 0.3);
  }
  shotFace(a, after) {
    if (!a) return;
    const h = a.base;
    const p0 = h.clone().add(new THREE.Vector3(1.6, 1.3, -2.8)), p1 = h.clone().add(new THREE.Vector3(-0.8, 1.2, -2.4));
    this.shot(p0, h.clone().setY(a.h * 0.7), p1, h.clone().setY(a.h * 0.75), after ?? 0.8, 0.2);
  }
  shotEnemy(a, tgt) {
    if (!a) return;
    const e = a.base, h = tgt ? tgt.base : new THREE.Vector3(0, 0, 0);
    const look = h.clone().lerp(e, 0.35).setY(0.9);
    this.shot(e.clone().add(new THREE.Vector3(-1.8, 2.6 + a.h * 0.4, -4.2)), look, e.clone().add(new THREE.Vector3(-1.2, 2.2 + a.h * 0.3, -3.2)), look, 0.9, 0.25);
  }
  shotIntro() {
    this.shot(new THREE.Vector3(-7, 1.6, -0.5), new THREE.Vector3(0, 1.2, -3.4), new THREE.Vector3(3.5, 2.6, 4.5), new THREE.Vector3(0, 1.0, -2.6), 1.6, 0.1, 9);
  }
  shotVictory() {
    this.shot(new THREE.Vector3(-3.5, 1.4, -4.2), new THREE.Vector3(0, 1.0, 0), new THREE.Vector3(3.2, 1.6, -4.0), new THREE.Vector3(0, 1.1, 0), 3.2, 0.6, 6);
  }
  // Ausfallschritt: Figur bewegt sich kurz in Richtung dir
  lunge(a, dir, dist, dur) { a.lunge = { t: 0, dur, dir: dir.clone().setY(0).normalize(), dist }; }
  hero(i, k, target) {
    if (i === -1 && k === 'victory') {
      for (const a of this.heroes) if (a.state !== 'once' || a.dead !== true) { if (!a.dead) a.hop = { t: 0 }; }
      this.shotVictory();
      return;
    }
    const a = this.heroes[i];
    if (!a) return;
    const tgt = target >= 0 ? this.enemies[target] : null;
    switch (k) {
      case 'attack': {
        A.playOnce(a, ATTACK);
        this.shotOver(a, tgt);
        const melee = a.id === 'andrew' || a.id === 'andy';
        if (tgt) this.lunge(a, tgt.base.clone().sub(a.base), melee ? 2.2 : 0.5, 0.6);
        if (a.id === 'rico' && tgt) this.bolt(a, tgt, '#ffd27a', 0.22);
        break;
      }
      case 'cast':
        A.playOnce(a, ['spell1', 'staff_attack', 'attack', 'punch']);
        this.shotFace(a);
        this.v.fx.ring(a.root.position.clone().add(new THREE.Vector3(0, 0.05, 0)), a.id === 'teresa' ? '#9affc0' : '#c8a0ff', 0.3, 1.4, 0.7, this.scene);
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
  capsule(k, target) {
    const a = this.cap;
    if (!a) return;
    const tgt = target >= 0 ? this.enemies[target] : null;
    if (k === 'attack' || k === 'cast') {
      A.playOnce(a, ['bite_front', 'attack', 'dragon_attack', 'skeleton_attack', 'slime_attack', 'punch']);
      this.lunge(a, tgt ? tgt.base.clone().sub(a.base) : new THREE.Vector3(0, 0, -1), k === 'attack' ? 1.8 : 0.4, 0.55);
      if (k === 'cast') this.v.fx.burst(a.root.position.clone().add(new THREE.Vector3(0, a.h * 0.6, 0)), '#ffd27a', 26, 1.5, 0.7, 1.5, 0.12, this.scene);
      if (k === 'cast' && tgt) this.bolt(a, tgt, '#ffb070', 0.25);
    } else if (k === 'hurt') {
      A.playOnce(a, ['hitrecieve', 'hit']);
      this.lunge(a, new THREE.Vector3(0, 0, 1), 0.3, 0.25);
    } else if (k === 'death') { A.playOnce(a, 'death', ''); a.dead = true; }
  }
  enemy(i, k, target) {
    const a = this.enemies[i];
    if (!a) return;
    if (k === 'attack') {
      A.playOnce(a, ['bite_front', 'attack', 'dragon_attack', 'skeleton_attack', 'slime_attack']);
      const h = target === -2 ? this.cap : (target >= 0 ? this.heroes[target] : null);
      this.shotEnemy(a, h);
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
    const mid = a.root.position.clone().add(new THREE.Vector3(0, a.h * 0.5, 0));
    if (a.h > 2.2) {
      // Boss: Kette aus Explosionen, Lichtsäule, Stillstand
      const fx = this.v.fx, sc = this.scene;
      this.shot(a.base.clone().add(new THREE.Vector3(2.5, 2.0, 5.0)), mid, a.base.clone().add(new THREE.Vector3(-2.0, 1.6, 4.0)), mid, 2.0, 0.6);
      for (let k = 0; k < 6; k++) fx.later(0.15 + k * 0.22, () => { const p = mid.clone().add(new THREE.Vector3((Math.random() - 0.5) * a.h * 0.6, (Math.random() - 0.3) * a.h * 0.5, 0.3)); fx.burst(p, ['#ffd24a', '#ffffff', '#ff7a5a'][k % 3], 40, 3.5, 0.7, -2, 0.13, sc); fx.flash(p, '#ffc070', 40, 0.3, sc); this.shakeT = 0.25; }, sc);
      fx.later(1.5, () => { fx.pillar(a.base.clone(), '#fff2c0', 1.2, 14, 1.4, sc); fx.ring(a.base.clone().setY(0.05), '#ffe8a0', 0.5, 9, 1.1, sc); this.v.flashScreen?.('#fff4d0', 0.8); this.hitStop = 0.25; }, sc);
    } else this.v.fx.ring(a.base.clone().setY(0.05), '#c8d0ff', 0.2, 2.2, 0.5, this.scene);
  }
  // Technik-Effekte: je Fertigkeit eine eigene, gut sichtbare Inszenierung (tg = Indizes der Ziele, -1 = Gruppe)
  skill(i, id, tg) {
    const fx = this.v.fx, sc = this.scene, a = this.heroes[i];
    if (!a) return;
    const V = (x, y, z) => new THREE.Vector3(x, y, z);
    const ens = (tg && tg.length ? tg.map(t => this.enemies[t]) : this.enemies.filter(e => e && !e.down)).filter(Boolean);
    const mid = (e) => e.root.position.clone().add(V(0, e.h * 0.55, 0));
    const feet = (e) => e.base.clone().setY(0.06);
    const hand = a.root.position.clone().add(V(0, 1.1, -0.3));
    const center = this.enemies.length ? this.enemies.reduce((c, e) => c.add(e.base), V(0, 0, 0)).multiplyScalar(1 / this.enemies.length) : V(0, 0, -3.4);
    switch (SKILL_FX[id] || 'hit') {
      case 'heavyslash':
        for (const e of ens) { fx.later(0.25, () => { fx.slash(mid(e), '#ffd27a', 2.2 + e.h * 0.3, sc); fx.ring(feet(e), '#ffb040', 0.3, 2.8, 0.45, sc); this.hitStop = 0.12; this.v.flashScreen?.('#ffe0a0', 0.25); }, sc); }
        break;
      case 'sweep':
        fx.later(0.2, () => { fx.ring(center.clone().setY(0.6), '#ffe0a0', 0.5, 6.5, 0.45, sc); for (const e of ens) fx.slash(mid(e), '#ffffff', 1.8, sc); }, sc);
        break;
      case 'lightning':
        this.shot(V(-5.5, 3.0, 4.0), center.clone().setY(1.6), V(-4.5, 2.4, 3.2), center.clone().setY(1.2), 0.7, 0.4);
        for (const e of ens) fx.later(0.3, () => { fx.lightning(mid(e), '#a8d8ff', sc); fx.burst(mid(e), '#cfe8ff', 30, 4, 0.5, -3, 0.1, sc); this.v.flashScreen?.('#d8ecff', 0.35); this.shakeT = 0.2; }, sc);
        break;
      case 'wave':
        fx.later(0.25, () => {
          fx.ring(a.base.clone().setY(0.08), '#b48aff', 0.4, 9, 0.9, sc);
          fx.ring(a.base.clone().setY(0.6), '#e0c8ff', 0.4, 8, 0.8, sc, true);
          for (const e of ens) fx.later(0.35, () => { fx.pillar(feet(e), '#b48aff', 0.7, 3.5, 0.7, sc); fx.burst(mid(e), '#d8b8ff', 36, 3, 0.7, 0.5, 0.12, sc); }, sc);
        }, sc);
        break;
      case 'heal': case 'healall': case 'hymn': {
        const who = SKILL_FX[id] === 'heal' ? [this.heroes[tg && tg[0] >= 0 ? tg[0] : i]] : this.heroes;
        if (SKILL_FX[id] === 'hymn') { this.shot(V(0, 4.5, 6.5), V(0, 0.5, 0), V(0, 3.2, 5.0), V(0, 1.0, 0), 1.4, 0.4); fx.ring(V(0, 0.06, 0.2), '#fff2a0', 0.5, 6, 1.2, sc); this.v.flashScreen?.('#fff8d8', 0.5); }
        for (const h of who.filter(Boolean)) fx.later(0.2, () => { fx.pillar(h.base.clone(), '#9affc0', 0.55, 6, 1.2, sc); fx.burst(h.base.clone().setY(0.3), '#c8ffd8', 30, 1.0, 1.4, 2.5, 0.09, sc); }, sc);
        break;
      }
      case 'arrows': case 'arrows2': case 'volley': {
        const n = SKILL_FX[id] === 'volley' ? 10 : (SKILL_FX[id] === 'arrows' ? 6 : 2);
        if (SKILL_FX[id] === 'volley') this.shot(V(5.2, 2.2, 4.8), center.clone().setY(1.4), V(4.4, 1.8, 3.9), center.clone().setY(1.2), 1.2, 0.4);
        for (let k = 0; k < n; k++) {
          const e = ens[k % ens.length];
          if (!e) break;
          fx.later(0.15 + k * 0.08, () => fx.shot(hand.clone(), mid(e).add(V((Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.4, 0)), '#ffd27a', 0.28, sc, 0.4 + Math.random() * 0.5, () => fx.burst(mid(e), '#ffe8a0', 10, 2.4, 0.3, -4, 0.07, sc)), sc);
        }
        break;
      }
      case 'shieldbash':
        for (const e of ens) fx.later(0.25, () => { fx.ring(mid(e), '#8ad0ff', 0.2, 2.2, 0.4, sc, false); fx.flash(mid(e), '#8ad0ff', 30, 0.3, sc); this.shakeT = 0.2; }, sc);
        break;
      case 'dome':
        fx.bubble(V(0, 0.4, 0.3), '#6ac8ff', 3.4, 1.4, sc);
        fx.ring(V(0, 0.06, 0.3), '#8ad8ff', 0.5, 4, 0.9, sc);
        break;
      case 'starfall':
        this.shot(V(-5.0, 1.2, 4.6), center.clone().setY(3.5), V(-4.0, 1.6, 3.8), center.clone().setY(1.2), 1.3, 0.5);
        for (const e of ens) for (let k = 0; k < 5; k++) fx.later(0.2 + k * 0.12, () => {
          const to = mid(e).add(V((Math.random() - 0.5) * 0.8, 0, (Math.random() - 0.5) * 0.4));
          fx.shot(to.clone().add(V(2 + Math.random(), 8, -2)), to, '#ffe8a0', 0.3, sc, 0, () => { fx.burst(to, '#ffd24a', 24, 3.5, 0.6, -3, 0.12, sc); fx.flash(to, '#ffd070', 35, 0.25, sc); this.shakeT = 0.2; });
        }, sc);
        fx.later(1.0, () => { this.hitStop = 0.18; this.v.flashScreen?.('#fff0c0', 0.6); }, sc);
        break;
      case 'supernova':
        this.shot(V(0, 2.0, 6.5), center.clone().setY(1.5), V(0, 3.5, 8.5), center.clone().setY(1.0), 1.6, 0.4);
        fx.orb(center.clone().setY(1.6), '#c8a0ff', 0.2, 1.2, 0.6, sc);
        fx.later(0.55, () => { fx.orb(center.clone().setY(1.6), '#e8c8ff', 0.6, 4.6, 0.9, sc); fx.ring(center.clone().setY(0.08), '#c890ff', 0.5, 12, 1.0, sc); fx.burst(center.clone().setY(1.6), '#e8d0ff', 90, 7, 1.0, 0, 0.14, sc); this.v.flashScreen?.('#f0e0ff', 0.4); this.shakeT = 0.5; this.hitStop = 0.2; }, sc);
        break;
      case 'quake':
        this.shot(V(-6.2, 1.2, 4.8), center.clone().setY(1.0), V(-5.2, 1.4, 4.0), center.clone().setY(0.8), 1.0, 0.4);
        fx.later(0.35, () => {
          fx.ring(a.base.clone().setY(0.06), '#ffb070', 0.5, 12, 0.9, sc);
          for (const e of ens) { fx.burst(feet(e).setY(0.3), '#b89070', 50, 4.5, 1.0, -9, 0.14, sc); fx.pillar(feet(e), '#ff9a50', 0.9, 3, 0.6, sc); }
          this.shakeT = 0.6; this.hitStop = 0.15; this.v.flashScreen?.('#ffd0a0', 0.4);
        }, sc);
        break;
    }
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
    const a = side === 'enemy' ? this.enemies[i] : side === 'capsule' ? this.cap : this.heroes[i];
    if (!a) return null;
    return a.root.position.clone().add(new THREE.Vector3(0, lift ?? a.h, 0));
  }
  fxAt(kind, side, i) {
    const fx = this.v.fx, sc = this.scene;
    if (kind === 'victory') {
      for (const a of this.heroes) fx.burst(a.root.position.clone().add(new THREE.Vector3(0, 1.8, 0)), ['#ffd24a', '#ff5ad0', '#46e6ff', '#7cff9a'][Math.floor(Math.random() * 4)], 30, 2.6, 1.3, -3, 0.1, sc);
      return;
    }
    const a = side === 'enemy' ? this.enemies[i] : side === 'capsule' ? this.cap : this.heroes[i];
    if (!a) return;
    const mid = a.root.position.clone().add(new THREE.Vector3(0, a.h * 0.55, 0));
    const feet = a.root.position.clone().add(new THREE.Vector3(0, 0.05, 0));
    switch (kind) {
      case 'slash':
        fx.slash(mid, '#ffffff', 1.4 + a.h * 0.3, sc);
        fx.burst(mid, '#ffe8a0', 18, 3.2, 0.45, -4, 0.09, sc);
        break;
      case 'bigslash':
        this.hitStop = 0.12;
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
        this.hitStop = 0.1;
        fx.burst(mid, '#ff4a3a', 28, 3.4, 0.5, -4, 0.11, sc);
        this.shakeT = 0.3;
        break;
      case 'spec':
        fx.pillar(feet, '#ff3050', 1.4, 9, 1.0, sc);
        this.v.flashScreen?.('#ff6070', 0.4);
        fx.ring(feet, '#ff4a6a', 0.5, 11, 0.8, sc);
        fx.flash(mid, '#ff3050', 60, 0.6, sc);
        this.shakeT = 0.45;
        break;
      case 'special':
        this.shotFace(a, 1.0);
        fx.pillar(feet, '#ffd24a', 0.75, 5, 1.0, sc, 0.3);
        fx.burst(feet.clone().add(new THREE.Vector3(0, 0.2, 0)), '#ffe8a0', 50, 1.2, 1.2, 3.5, 0.1, sc);
        this.v.flashScreen?.('#ffe8a0', 0.35);
        fx.ring(feet, '#ffd24a', 0.2, 1.6, 0.6, sc);
        fx.burst(feet.clone().add(new THREE.Vector3(0, 0.4, 0)), '#ffd24a', 40, 1.6, 0.9, 2.5, 0.12, sc);
        fx.flash(mid, '#ffc040', 30, 0.6, sc);
        break;
    }
  }
  update(dt) {
    this.t += dt;
    const rdt = dt;
    if (this.hitStop > 0) { this.hitStop -= dt; dt *= 0.08; }
    const all = [...this.enemies, ...this.heroes, ...(this.cap ? [this.cap] : [])];
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
    this.placeCam(rdt);
    this.v.fx.update(dt);
  }
}

function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function mulberry(a) { return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
