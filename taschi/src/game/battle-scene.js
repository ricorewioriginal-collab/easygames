// Battle presentation: themed 3D stage, trainers, creature models, camera
// work, effects, HUD and menus. Game rules live in logic/battle.js; this file
// only feeds choices in and animates the returned events.
import { THREE } from '../engine/three.js';
import { SPECIES } from '../data/species.js';
import { MOVES, STATUS } from '../data/moves.js';
import { TYPES, effectiveness } from '../data/types.js';
import { ITEMS } from '../data/items.js';
import { REGIONS } from '../data/regions.js';
import { createBattle, runTurn, replace, playerOptions, activeMon, targetsFor, catchChance } from '../logic/battle.js';
import { maxHp, xpToNext, evolve, replaceMove } from '../logic/monster.js';
import { createCreature, displayScale } from '../engine/creatures.js';
import { createCharacter, lookForRole } from '../engine/characters.js';
import { vegetationGeometry, rockGeometry, MATERIALS } from '../engine/vegetation.js';
import { ballModel } from '../engine/buildings.js';
import { particleTexture } from '../engine/textures.js';
import { glowMaterial } from '../engine/materials.js';
import { disposeTree } from '../engine/renderer.js';
import { paletteFor } from '../world/region-map.js';
import { h, typeBadge, hpBar, FocusNav } from '../ui/ui.js';
import { BIOMES } from '../logic/layout.js';
import { createRng } from '../core/rng.js';

const wait = (ms) => new Promise(r => setTimeout(r, ms));
const FX_COLORS = { normal: 0xffffff, feuer: 0xff7a2a, wasser: 0x4aa8ff, pflanze: 0x5ad06a, elektro: 0xffe040, gestein: 0xb89a6a, flug: 0xd8f0ff, geist: 0xa070ff, eis: 0xa8f0ff, erde: 0xc08a4a };
const SLOT_POS = { 0: [[-2.7, 0, 2.4]], 1: [[2.7, 0, -2.4]] };
const SLOT_POS2 = { 0: [[-3.8, 0, 1.6], [-1.2, 0, 3.4]], 1: [[1.4, 0, -3.4], [3.9, 0, -1.4]] };

export class BattleScene {
  constructor(game) {
    this.game = game;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(46, innerWidth / innerHeight, 0.1, 400);
    this.root = null; this.models = new Map(); this.trainers = []; this.fx = []; this.active = false;
    this.camTarget = { pos: new THREE.Vector3(-7, 3.4, 9), look: new THREE.Vector3(0.8, 1, -0.6), speed: 2.5 };
    this.lookCur = new THREE.Vector3(0.8, 1, -0.6);
  }
  get ui() { return this.game.ui; }
  get audio() { return this.game.audio; }

  // ------------------------------------------------------------------ stage
  buildStage(region, indoor) {
    if (this.root) { this.scene.remove(this.root); disposeTree(this.root); }
    const root = new THREE.Group(); this.root = root; this.scene.add(root);
    const r = Math.min(16, region ?? 0);
    const pal = paletteFor(r);
    const biome = r === 16 ? 'summit' : REGIONS[r].biome;
    const night = this.game.sky?.night ?? 0;
    const skyTop = new THREE.Color(indoor ? 0x2a2f3a : pal.sky[0]).lerp(new THREE.Color(0x0d1636), indoor ? 0 : night * 0.85);
    const skyBot = new THREE.Color(indoor ? 0x4a4f5a : pal.sky[1]).lerp(new THREE.Color(0x2a3566), indoor ? 0 : night * 0.8);
    const sky = new THREE.Mesh(new THREE.SphereGeometry(180, 24, 12), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, uniforms: { a: { value: skyTop }, b: { value: skyBot } }, vertexShader: 'varying float y; void main(){ y = normalize(position).y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }', fragmentShader: 'uniform vec3 a; uniform vec3 b; varying float y; void main(){ gl_FragColor = vec4(mix(b, a, clamp(y*1.6+0.2,0.0,1.0)), 1.0); }' }));
    root.add(sky);
    this.scene.fog = new THREE.Fog(skyBot, 30, 120);
    const day = 1 - night * (indoor ? 0 : 0.6);
    root.add(new THREE.HemisphereLight(0xf2f8ff, new THREE.Color(pal.grass).multiplyScalar(0.6), 0.55 * day + 0.2));
    const sun = new THREE.DirectionalLight(night > 0.6 && !indoor ? 0xa8b8ff : 0xfff2d8, 0.6 * day + 0.15); sun.position.set(-8, 16, 10); sun.castShadow = this.game.quality.shadows > 0;
    if (sun.castShadow) { sun.shadow.mapSize.set(1024, 1024); const c = sun.shadow.camera; c.left = -12; c.right = 12; c.top = 12; c.bottom = -12; c.far = 50; sun.shadow.bias = -0.001; }
    root.add(sun);
    // ground
    const groundCol = indoor ? new THREE.Color(pal.wall).lerp(new THREE.Color(0xd8d0c0), 0.5) : new THREE.Color(pal.grass);
    const ground = new THREE.Mesh(new THREE.CircleGeometry(90, 48), new THREE.MeshLambertMaterial({ color: groundCol }));
    ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; root.add(ground);
    const field = new THREE.Mesh(new THREE.CircleGeometry(8.5, 48), new THREE.MeshLambertMaterial({ color: indoor ? new THREE.Color(pal.trim).lerp(new THREE.Color(0xffffff), 0.55) : new THREE.Color(pal.dirt).lerp(new THREE.Color(pal.grass), 0.3) }));
    field.rotation.x = -Math.PI / 2; field.position.y = 0.01; field.receiveShadow = true; root.add(field);
    for (const [x, z] of [[-2.6, 2.4], [2.6, -2.4]]) {
      const ring = new THREE.Mesh(new THREE.RingGeometry(1.9, 2.15, 40), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 }));
      ring.rotation.x = -Math.PI / 2; ring.position.set(x, 0.02, z); root.add(ring);
    }
    const line = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 16), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4 }));
    line.rotation.x = -Math.PI / 2; line.rotation.z = Math.atan2(4.8, 5.2) + Math.PI / 2; line.position.y = 0.02; root.add(line);
    // scenery ring
    const rng = createRng('stage:' + r + indoor);
    if (indoor) {
      for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; const col = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 9, 12), new THREE.MeshLambertMaterial({ color: 0xf3eee2 })); col.position.set(Math.cos(a) * 15, 4.5, Math.sin(a) * 15); root.add(col); }
      const banner = new THREE.Mesh(new THREE.CylinderGeometry(15.5, 15.5, 4, 32, 1, true), new THREE.MeshLambertMaterial({ color: new THREE.Color(TYPES[REGIONS[Math.min(15, r)].types[0]].color), side: THREE.BackSide }));
      banner.position.y = 2; root.add(banner);
    } else {
      const cfg = BIOMES[biome] || BIOMES.valley;
      const types = Object.keys(cfg.trees || { oak: 1 });
      const geos = {};
      const leafPal = { ...pal, leaf: new THREE.Color(pal.grass).multiplyScalar(0.78).getHex() };
      for (let i = 0; i < 26; i++) {
        const t = types.length ? types[i % types.length] : null;
        const a = rng.next() * Math.PI * 2, d = 14 + rng.next() * 16;
        if (a > 0.5 && a < 1.4) continue; // keep camera side open
        if (t && t !== 'giant') {
          geos[t] ||= vegetationGeometry(t, leafPal).high;
          const m = new THREE.Mesh(geos[t], t === 'crystal' ? MATERIALS.rock() : MATERIALS.foliage());
          m.position.set(Math.cos(a) * d, 0, Math.sin(a) * d); m.scale.setScalar(0.9 + rng.next() * 0.7); m.rotation.y = rng.next() * 6; root.add(m);
        }
      }
      const rg = rockGeometry(biome === 'snow' ? 'snow' : 'round', pal.rock).high;
      for (let i = 0; i < 10; i++) { const a = rng.next() * Math.PI * 2, d = 10 + rng.next() * 6; if (a > 0.4 && a < 1.5) continue; const m = new THREE.Mesh(rg, MATERIALS.rock()); m.position.set(Math.cos(a) * d, 0, Math.sin(a) * d); m.scale.setScalar(0.7 + rng.next()); root.add(m); }
      if (cfg.water === 'sea' || cfg.water === 'bay' || cfg.water === 'seaLow') { const sea = new THREE.Mesh(new THREE.CircleGeometry(80, 32, Math.PI * 0.95, Math.PI * 0.7), new THREE.MeshPhongMaterial({ color: pal.water, shininess: 80 })); sea.rotation.x = -Math.PI / 2; sea.position.set(0, 0.03, -8); root.add(sea); }
    }
  }

  // ------------------------------------------------------------------ models
  modelFor(m) { return this.models.get(m.uid); }
  slotPos(side, slot) { return (this.b.format === 2 ? SLOT_POS2 : SLOT_POS)[side][slot] || SLOT_POS[side][0]; }
  spawnModel(m, side, slot, appear = true) {
    const old = this.models.get(m.uid); if (old) { this.root.remove(old.c.root); old.c.dispose(); }
    const c = createCreature(m.id, { outline: this.game.quality.outlines });
    const s = displayScale(m.id, 'battle');
    c.root.scale.setScalar(appear ? 0.01 : s);
    const [x, y, z] = this.slotPos(side, slot);
    c.root.position.set(x, y, z);
    c.root.rotation.y = side === 0 ? Math.atan2(5.2, -4.8) : Math.atan2(-5.2, 4.8);
    this.root.add(c.root);
    const entry = { c, side, slot, scale: s, uid: m.uid, base: new THREE.Vector3(x, y, z) };
    this.models.set(m.uid, entry);
    if (appear) this.tweenScale(entry, 0.01, s, 350, true);
    return entry;
  }
  removeModel(uid) { const e = this.models.get(uid); if (!e) return; this.root.remove(e.c.root); e.c.dispose(); this.models.delete(uid); }
  tweenScale(e, a, b, ms, flash = false) {
    return new Promise(res => {
      const t0 = performance.now();
      if (flash) { const fl = this.burst(e.c.root.position.clone().setY(1), 0xffffff, 18, 1.6); void fl; }
      const step = () => { const u = Math.min(1, (performance.now() - t0) / ms); const k = a + (b - a) * (1 - Math.pow(1 - u, 3)); e.c.root.scale.setScalar(Math.max(0.001, k)); if (u < 1) requestAnimationFrame(step); else res(); };
      step();
    });
  }
  spawnTrainer(look, side, name) {
    const ch = createCharacter(look, { outline: this.game.quality.outlines });
    const pos = side === 0 ? [-5.6, 0, 5.4] : [5.4, 0, -5.6];
    ch.root.position.set(...pos); ch.root.rotation.y = side === 0 ? Math.atan2(5.2, -4.8) : Math.atan2(-5.2, 4.8);
    this.root.add(ch.root); this.trainers.push({ ch, side, name });
    return ch;
  }

  // ------------------------------------------------------------------ effects
  burst(pos, color, n = 24, spread = 1.2, kind = 'soft', life = 0.7, up = 1) {
    const geo = new THREE.BufferGeometry(), p = new Float32Array(n * 3), v = [];
    for (let i = 0; i < n; i++) { p[i * 3] = pos.x; p[i * 3 + 1] = pos.y; p[i * 3 + 2] = pos.z; v.push(new THREE.Vector3((Math.random() - 0.5) * spread, Math.random() * spread * up, (Math.random() - 0.5) * spread).multiplyScalar(3)); }
    geo.setAttribute('position', new THREE.BufferAttribute(p, 3));
    const mat = new THREE.PointsMaterial({ color, size: 0.45, map: particleTexture(kind), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const pts = new THREE.Points(geo, mat); this.root.add(pts);
    const fx = { pts, v, life, t: 0, gravity: kind === 'drop' ? -6 : -2 };
    this.fx.push(fx);
    return fx;
  }
  projectile(from, to, color, ms = 420, kind = 'soft', size = 0.5) {
    return new Promise(res => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(size, 12, 10), glowMaterial(color, 0.9));
      m.position.copy(from); this.root.add(m);
      const t0 = performance.now();
      const step = () => {
        const u = Math.min(1, (performance.now() - t0) / ms);
        m.position.lerpVectors(from, to, u); m.position.y += Math.sin(u * Math.PI) * 0.8;
        if (Math.random() < 0.6) this.burst(m.position.clone(), color, 3, 0.3, kind, 0.4);
        if (u < 1) requestAnimationFrame(step); else { this.root.remove(m); m.geometry.dispose(); m.material.dispose(); res(); }
      };
      step();
    });
  }
  async moveFx(e, attacker, target) {
    const mv = MOVES[e.move], col = FX_COLORS[mv.type] || 0xffffff;
    const a = attacker.c.root.position.clone().setY(1.1), t = target ? target.c.root.position.clone().setY(1.1) : a.clone();
    const fx = mv.fx;
    const special = mv.power >= 90 || mv.pp <= 5;
    if (special) { this.focusOn(attacker, 0.9); this.burst(a, col, 40, 1.5, 'star', 0.9); await wait(380); }
    if (mv.power === 0 || target === attacker) {
      if (fx === 'heal' || mv.heal) this.burst(a, 0x7aff9a, 30, 1.2, 'star', 1, 1.5);
      else if (fx === 'buff') { this.burst(a, col, 26, 0.8, 'soft', 0.9, 2); attacker.c.play('special', 0.6); }
      else { await this.projectile(a, t, col, 380, 'soft', 0.3); this.burst(t, col, 20, 1, 'soft', 0.7); }
      await wait(250); return;
    }
    attacker.c.play(special ? 'special' : 'attack', 0.55);
    this.audio.sfx('throw');
    switch (fx) {
      case 'flame': case 'water': case 'leaf': case 'spark': case 'ice': case 'shadow': case 'beam':
        await wait(180);
        await this.projectile(a, t, col, special ? 520 : 400, fx === 'leaf' ? 'petal' : fx === 'water' ? 'drop' : fx === 'spark' || fx === 'ice' ? 'star' : 'soft', special ? 0.7 : 0.4);
        this.burst(t, col, special ? 60 : 30, 1.4, fx === 'leaf' ? 'petal' : 'soft', 0.8);
        break;
      case 'rock': case 'quake':
        await wait(260);
        if (fx === 'quake') { this.cameraShake(0.5); this.burst(t.clone().setY(0.2), col, 50, 2, 'soft', 0.8, 0.6); }
        else { await this.projectile(t.clone().add(new THREE.Vector3(0, 5, 0)), t, col, 300, 'soft', 0.5); this.burst(t, col, 30, 1.4, 'soft', 0.7); }
        break;
      case 'wind':
        await wait(200);
        for (let i = 0; i < 3; i++) { this.burst(t.clone().add(new THREE.Vector3((Math.random() - 0.5), Math.random(), 0)), col, 14, 1.5, 'soft', 0.6); await wait(70); }
        break;
      default:
        await wait(230);
        this.burst(t, 0xffffff, 18, 1.1, 'star', 0.5);
    }
  }
  cameraShake(s) { this.shake = s; }
  focusOn(entry, dist = 1) {
    const p = entry.c.root.position;
    const dir = entry.side === 0 ? new THREE.Vector3(2.2, 1.4, -2.6) : new THREE.Vector3(-3, 1.6, 3.4);
    this.camTarget = { pos: p.clone().add(dir.multiplyScalar(1.4 * dist)).setY(p.y + 2), look: p.clone().setY(1), speed: 4 };
  }
  defaultCam() { this.camTarget = { pos: new THREE.Vector3(-9.6, 4.4, 11.8), look: new THREE.Vector3(0.9, 0.9, -1.1), speed: 2.5 }; }

  // ------------------------------------------------------------------ HUD
  buildHUD() {
    this.hudEl?.remove();
    this.hudEl = h('div#battle.layer');
    this.ui.root.append(this.hudEl);
    this.huds = new Map();
    this.renderHUD();
  }
  renderHUD() {
    const b = this.b;
    for (const [uid, el] of this.huds) { if (![0, 1].some(s => b.sides[s].active.some(i => i !== null && b.sides[s].team[i]?.uid === uid))) { el.remove(); this.huds.delete(uid); } }
    for (const s of [0, 1]) b.sides[s].active.forEach((i, slot) => {
      if (i === null) return;
      const m = b.sides[s].team[i];
      let el = this.huds.get(m.uid);
      if (!el) { el = h('div.bhud' + (s === 1 ? '.foe' : '.me') + (slot ? '.second' : '')); this.hudEl.append(el); this.huds.set(m.uid, el); }
      el.className = 'bhud' + (s === 1 ? ' foe' : ' me') + (slot ? ' second' : '');
      this.fillHud(el, m, s);
    });
  }
  fillHud(el, m, side, shownHp = m.hp, shownXp = null) {
    const sp = SPECIES[m.id], max = maxHp(m);
    const caught = side === 1 && this.b.kind === 'wild' && this.game.save.dex[m.id] === 2;
    el.replaceChildren(...[
      h('div.top', {}, h('span.nm', {}, (caught ? '◉ ' : '') + (m.nick || sp.name)), m.status ? h('span.status', { style: { background: STATUS[m.status].color } }, STATUS[m.status].short) : null, h('span.lv', {}, 'Lv ' + m.lv)),
      h('div', {}, typeBadge(sp.type), sp.type2 ? typeBadge(sp.type2) : null),
      hpBar(shownHp, max),
      side === 0 ? h('div.hpnum', {}, Math.max(0, Math.round(shownHp)) + ' / ' + max + ' KP') : null,
      side === 0 ? h('div.bar.xp', { style: { height: '5px' } }, h('i', { style: { width: Math.min(100, (shownXp ?? m.xp) / xpToNext(m.lv) * 100) + '%' } })) : null
    ].filter(Boolean));
  }
  tweenHp(m, from, to) {
    const el = this.huds.get(m.uid); if (!el) return Promise.resolve();
    const side = this.b.sides[0].team.includes(m) ? 0 : 1;
    return new Promise(res => {
      const t0 = performance.now(), ms = Math.min(900, 250 + Math.abs(from - to) * 12);
      const step = () => { const u = Math.min(1, (performance.now() - t0) / ms); this.fillHud(el, m, side, from + (to - from) * u); if (u < 1) requestAnimationFrame(step); else res(); };
      step();
    });
  }
  async log(text, { hold = 900 } = {}) {
    if (!text) return;
    if (!this.logEl) return;
    this.logEl.textContent = '';
    for (let i = 0; i <= text.length; i += 2) { this.logEl.textContent = text.slice(0, i); await wait(12); if (this.skip) { this.skip = false; break; } }
    this.logEl.textContent = text;
    const t0 = performance.now();
    while (performance.now() - t0 < hold) { await wait(40); if (this.skip) { this.skip = false; break; } }
  }
  menuArea(content) {
    if (!this.menuEl) { this.menuEl = h('div.bmenu'); this.logEl = h('div.blog'); this.actEl = h('div.bacts'); this.menuEl.append(this.logEl, this.actEl); this.hudEl.append(this.menuEl); }
    this.actEl.replaceChildren(...(content || []));
  }

  // ------------------------------------------------------------------ main entry
  async run(opts) {
    const g = this.game, save = g.save;
    this.active = true; this.models.clear(); this.trainers = []; this.fx = [];
    this.menuEl = null; this.logEl = null;
    const indoor = !!opts.indoor;
    this.buildStage(opts.region, indoor);
    const b = createBattle({ rng: g.rng, kind: opts.kind, format: opts.format, canRun: opts.canRun, canCatch: opts.canCatch, night: g.isNight(), dark: indoor,
      player: { team: save.team, bag: save.bag, name: save.player.name }, foe: { team: opts.foeTeam, ai: opts.ai ?? 0, trainer: opts.kind !== 'wild', name: opts.trainerName || '', items: { ...(opts.items || {}) } } });
    this.b = b; this.opts = opts;
    for (const m of opts.foeTeam) save.dex[m.id] ||= 1;
    // trainers on stage
    this.playerCh = this.spawnTrainer(save.player.look, 0, save.player.name);
    if (opts.kind !== 'wild') { this.foeCh = this.spawnTrainer(opts.trainerLook || lookForRole('trainer', opts.trainerName), 1, opts.trainerName); if (b.format === 2 && opts.pair) { const c2 = this.spawnTrainer(opts.trainerLook2 || opts.trainerLook, 1); c2.root.position.x += 1.4; c2.root.position.z += 1.2; } }
    else this.foeCh = null;
    this.buildHUD();
    this.menuArea([]);
    this.defaultCam();
    // intro camera: start close on the foe side
    const foeFirst = b.sides[1].active.map(i => b.sides[1].team[i]);
    if (opts.kind === 'wild') foeFirst.forEach((m, slot) => { const e = this.spawnModel(m, 1, slot, false); e.c.play('appear', 0.4); });
    this.camera.position.set(6, 2.2, 1.5); this.lookCur.set(2.7, 1, -2.4); this.camera.lookAt(this.lookCur);
    this.camTarget = { pos: new THREE.Vector3(4.5, 2.4, 3.5), look: new THREE.Vector3(2.7, 1, -2.4), speed: 1.2 };
    this.hudEl.querySelectorAll('.bhud').forEach(e => e.style.visibility = 'hidden');
    const screen = { el: h('div'), onInput: (input) => { if (input.pressed('confirm') || input.pressed('back')) this.skip = true; input.nav(); return true; } };
    this.ui.push(screen); this.waitScreen = screen;
    if (opts.kind === 'wild') { await this.log('Ein wildes ' + SPECIES[foeFirst[0].id].name + ' erscheint!' + (foeFirst[1] ? ' Und ' + SPECIES[foeFirst[1].id].name + '!' : ''), { hold: 1100 }); this.audio.sfx('cry', { pitch: 300 + (SPECIES[foeFirst[0].id].speed * 3) }); }
    else {
      this.foeCh.play('wave', 1.2);
      await this.log((opts.trainerTitle ? opts.trainerTitle + ' ' : '') + opts.trainerName + ' fordert dich heraus!', { hold: 1200 });
      foeFirst.forEach((m, slot) => this.spawnModel(m, 1, slot, true));
      this.audio.sfx('ballOpen');
      await this.log(opts.trainerName + ' schickt ' + foeFirst.map(m => SPECIES[m.id].name).join(' und ') + ' in den Kampf!', { hold: 900 });
    }
    // player send-out
    this.camTarget = { pos: new THREE.Vector3(-8, 2.6, 6.5), look: new THREE.Vector3(-2.7, 1, 2.4), speed: 2 };
    this.playerCh.play('throw', 0.8);
    await wait(380); this.audio.sfx('throw');
    const mine = b.sides[0].active.map(i => b.sides[0].team[i]);
    mine.forEach((m, slot) => this.spawnModel(m, 0, slot, true));
    this.audio.sfx('ballOpen');
    await this.log('Los, ' + mine.map(m => m.nick || SPECIES[m.id].name).join(' und ') + '!', { hold: 700 });
    this.hudEl.querySelectorAll('.bhud').forEach(e => e.style.visibility = '');
    this.defaultCam();
    this.ui.pop(screen); this.waitScreen = null;

    // turn loop
    let guard = 0;
    while (!b.result && guard++ < 500) {
      if (b.phase === 'replace') {
        for (const slot of [...b.needReplace]) {
          const idx = await this.chooseSwitch(true);
          const r = replace(b, slot, idx);
          await this.playEvents(r.ev);
        }
        continue;
      }
      const choices = [];
      const actives = b.sides[0].active.map((i, slot) => ({ slot, m: i === null ? null : b.sides[0].team[i] })).filter(x => x.m && x.m.hp > 0);
      for (let k = 0; k < actives.length; k++) {
        const c = await this.chooseAction(actives[k].slot, k > 0);
        if (c === 'back') { choices.pop(); k -= 2; if (k < -1) k = -1; continue; }
        choices.push(c);
        if (c.type === 'run' || (c.type === 'item' && ITEMS[c.item].category === 'ball')) break;
      }
      this.menuArea([]);
      const ev = runTurn(b, choices);
      const waitS = { el: h('div'), onInput: (input) => { if (input.pressed('confirm') || input.pressed('back')) this.skip = true; input.nav(); return true; } };
      this.ui.push(waitS);
      await this.playEvents(ev);
      this.ui.pop(waitS);
    }
    const result = { outcome: b.result?.outcome || 'run', caught: b.result?.caught, ball: b.result?.ball, battle: b };
    await this.finish(result);
    return result;
  }

  // ------------------------------------------------------------------ menus
  chooseAction(slot, canBack) {
    const b = this.b;
    return new Promise(resolve => {
      const m = activeMon(b, 0, slot), opt = playerOptions(b, slot);
      const name = m.nick || SPECIES[m.id].name;
      this.logEl.textContent = 'Was soll ' + name + ' tun?';
      const screen = { el: h('div'), nav: null };
      const done = (v) => { this.ui.pop(screen); resolve(v); };
      const main = () => {
        this.menuArea([
          h('button.bact.fight.focusable', { onclick: () => moves(), 'data-autofocus': '' }, 'Kampf', h('small', {}, opt.struggle ? 'Keine AP mehr' : 'Attacke wählen')),
          h('button.bact.bag.focusable', { onclick: () => bag() }, 'Tasche', h('small', {}, 'Items & Bälle')),
          h('button.bact.team.focusable', { onclick: () => team() }, 'Taschis', h('small', {}, 'Wechseln')),
          h('button.bact.run.focusable' + (opt.canRun ? '' : '.disabled'), { onclick: () => opt.canRun ? done({ slot, type: 'run' }) : this.ui.toast('Aus diesem Kampf kannst du nicht fliehen!') }, 'Flucht', h('small', {}, opt.canRun ? 'Entkommen' : 'Nicht möglich'))
        ]);
        screen.nav.current = null; screen.nav.ensure();
        screen.onBack = canBack ? () => done('back') : null;
      };
      const moves = () => {
        if (opt.struggle) { done({ slot, type: 'move', move: 'verzweiflung', target: targetsFor(b, 0)[0] }); return; }
        const foe = targetsFor(b, 0).map(s => activeMon(b, 1, s))[0];
        this.menuArea([...opt.moves.map(mv => {
          const t = TYPES[mv.move.type];
          const eff = foe && mv.move.power > 0 ? effectiveness(mv.move.type, SPECIES[foe.id]) : 1;
          const effTxt = mv.move.power === 0 ? 'Status' : eff > 1 ? 'Sehr effektiv' : eff === 0 ? 'Wirkungslos' : eff < 1 ? 'Kaum effektiv' : 'Stärke ' + mv.move.power;
          return h('button.bact.move.focusable' + (mv.disabled ? '.disabled' : ''), { style: { background: `linear-gradient(160deg, ${t.color}, ${shadeCss(t.color)})` }, onclick: () => { if (mv.disabled) { this.audio.sfx('error'); return; } pickTarget(mv.id); } },
            t.icon + ' ' + mv.move.name, h('small', {}, effTxt + ' · AP ' + mv.pp + '/' + mv.max));
        }), h('button.bact.backbtn.focusable', { onclick: main }, '↩ Zurück')]);
        screen.nav.current = null; screen.nav.ensure(); screen.onBack = main;
      };
      const pickTarget = (moveId) => {
        const mv = MOVES[moveId], targets = targetsFor(b, 0);
        if (b.format === 1 || mv.target === 'self' || targets.length < 2) { done({ slot, type: 'move', move: moveId, target: targets[0] }); return; }
        this.menuArea([...targets.map(t => { const fm = activeMon(b, 1, t); return h('button.bact.fight.focusable', { onclick: () => done({ slot, type: 'move', move: moveId, target: t }) }, 'Ziel: ' + SPECIES[fm.id].name, h('small', {}, (t === 0 ? 'links' : 'rechts'))); }), h('button.bact.backbtn.focusable', { onclick: moves }, '↩ Zurück')]);
        screen.nav.current = null; screen.nav.ensure(); screen.onBack = moves;
      };
      const bag = () => {
        const items = opt.items.filter(id => opt.canCatch || ITEMS[id].category !== 'ball');
        if (!items.length) { this.ui.toast('Keine einsetzbaren Gegenstände.'); return; }
        this.menuArea([...items.map(id => h('button.bact.bag.focusable', { onclick: () => useItem(id) }, ITEMS[id].name + ' ×' + this.game.save.bag[id], h('small', {}, ITEMS[id].category === 'ball' ? 'Fangchance ' + catchHint(this, id) : ITEMS[id].desc))), h('button.bact.backbtn.focusable', { onclick: main }, '↩ Zurück')]);
        screen.nav.current = null; screen.nav.ensure(); screen.onBack = main;
      };
      const useItem = (id) => {
        const it = ITEMS[id];
        if (it.category === 'ball') { done({ slot, type: 'item', item: id }); return; }
        if (it.category === 'battle') { done({ slot, type: 'item', item: id, target: m.uid }); return; }
        // choose which team member
        this.menuArea([...b.sides[0].team.map(t => h('button.bact.team.focusable', { onclick: () => done({ slot, type: 'item', item: id, target: t.uid }) }, (t.nick || SPECIES[t.id].name), h('small', {}, t.hp + '/' + maxHp(t) + ' KP' + (t.status ? ' · ' + STATUS[t.status].name : '')))), h('button.bact.backbtn.focusable', { onclick: bag }, '↩ Zurück')]);
        screen.nav.current = null; screen.nav.ensure(); screen.onBack = bag;
      };
      const team = () => {
        if (!opt.switchTargets.length) { this.ui.toast('Keine weiteren kampffähigen Taschis.'); return; }
        this.menuArea([...opt.switchTargets.map(x => h('button.bact.team.focusable', { onclick: () => done({ slot, type: 'switch', to: x.i }) }, (x.m.nick || SPECIES[x.m.id].name) + ' Lv' + x.m.lv, h('small', {}, x.m.hp + '/' + maxHp(x.m) + ' KP'))), h('button.bact.backbtn.focusable', { onclick: main }, '↩ Zurück')]);
        screen.nav.current = null; screen.nav.ensure(); screen.onBack = main;
      };
      screen.el = this.actEl; // focus inside the action grid
      screen.nav = new FocusNav(this.actEl);
      screen.el = h('div'); // placeholder element appended by push
      this.ui.push(screen);
      main();
    });
  }
  chooseSwitch(forced) {
    const b = this.b;
    return new Promise(resolve => {
      const side = b.sides[0];
      const list = side.team.map((m, i) => ({ m, i })).filter(x => x.m.hp > 0 && !side.active.includes(x.i));
      this.logEl.textContent = 'Welches Taschi soll kämpfen?';
      const screen = { el: h('div'), nav: new FocusNav(this.actEl) };
      this.menuArea(list.map(x => h('button.bact.team.focusable', { onclick: () => { this.ui.pop(screen); resolve(x.i); } }, (x.m.nick || SPECIES[x.m.id].name) + ' Lv' + x.m.lv, h('small', {}, x.m.hp + '/' + maxHp(x.m) + ' KP'))));
      this.ui.push(screen);
      void forced;
    });
  }

  // ------------------------------------------------------------------ events
  async playEvents(events) {
    const b = this.b;
    for (const e of events) {
      const ent = e.uid ? this.models.get(e.uid) : null;
      switch (e.t) {
        case 'move': {
          const att = ent, tgt = e.targetUid ? this.models.get(e.targetUid) : null;
          await this.log(e.text, { hold: 250 });
          if (att) await this.moveFx(e, att, tgt);
          break;
        }
        case 'damage': {
          const m = this.findMon(e.uid);
          if (ent && !e.dot) { ent.c.play('hit', 0.45); ent.c.hitFlash(); }
          if (ent && e.dot) this.burst(ent.c.root.position.clone().setY(1), e.dot === 'gift' ? 0xa060ff : 0xff7a2a, 16, 0.8, 'soft', 0.7, 1.4);
          if (!e.dot) this.audio.sfx('hit', { type: this.lastMoveType || 'normal', eff: e.eff });
          if (e.eff > 1 || e.crit) this.cameraShake(e.eff > 1 ? 0.35 : 0.2);
          if (m) await this.tweenHp(m, e.hp + e.amount, e.hp);
          if (e.text) await this.log(e.text, { hold: 700 });
          break;
        }
        case 'heal': { const m = this.findMon(e.uid); if (ent) this.burst(ent.c.root.position.clone().setY(1), 0x7aff9a, 26, 1, 'star', 0.9, 1.6); this.audio.sfx('heal'); if (m) await this.tweenHp(m, Math.max(0, e.hp - 40), e.hp); await this.log(e.text, { hold: 700 }); break; }
        case 'faint': {
          if (ent) { ent.c.play('faint', 0.8); this.audio.sfx('faint'); await wait(700); this.tweenScale(ent, ent.scale, 0.01, 300); }
          await this.log(e.text, { hold: 900 });
          if (ent) this.removeModel(e.uid);
          this.renderHUD();
          break;
        }
        case 'switchOut': { await this.log(e.text, { hold: 500 }); if (ent) { await this.tweenScale(ent, ent.scale, 0.01, 280); this.removeModel(e.uid); } this.renderHUD(); break; }
        case 'switchIn': {
          const m = this.findMon(e.uid);
          if (e.side === 0) { this.playerCh?.play('throw', 0.8); await wait(380); this.audio.sfx('throw'); }
          this.spawnModel(m, e.side, e.slot, true); this.audio.sfx('ballOpen');
          this.renderHUD();
          await this.log(e.text, { hold: 700 });
          break;
        }
        case 'ball': await this.throwBall(e); break;
        case 'caught': this.audio.sfx('catch'); this.playerCh?.play('cheer', 1.4); await this.log(e.text, { hold: 1500 }); break;
        case 'escape': await this.log(e.text, { hold: 900 }); break;
        case 'status': { const m = this.findMon(e.uid); if (ent) this.burst(ent.c.root.position.clone().setY(1.2), STATUS_COL[e.status], 30, 1, 'soft', 0.9); this.renderHUD(); void m; await this.log(e.text, { hold: 800 }); break; }
        case 'stat': { if (ent) this.burst(ent.c.root.position.clone().setY(e.stages > 0 ? 0.3 : 2.2), e.stages > 0 ? 0xff9a4a : 0x6aa8ff, 26, 0.6, 'soft', 0.9, e.stages > 0 ? 2.4 : -1); this.audio.sfx(e.stages > 0 ? 'levelup' : 'back'); await this.log(e.text, { hold: 700 }); break; }
        case 'xp': {
          const m = this.findMon(e.uid);
          if (m && this.huds.get(m.uid)) this.fillHud(this.huds.get(m.uid), m, 0);
          await this.log(e.text, { hold: 600 });
          break;
        }
        case 'levelup': { this.audio.sfx('levelup'); if (ent) this.burst(ent.c.root.position.clone().setY(0.5), 0xffe080, 40, 0.8, 'star', 1, 2.5); this.renderHUD(); await this.log(e.text, { hold: 1000 }); break; }
        case 'learn': case 'learnFull': await this.log(e.text, { hold: 900 }); break;
        case 'statusBlock': case 'cure': case 'miss': case 'immune': case 'item': case 'text': case 'run': {
          if (e.t === 'item') this.audio.sfx('item');
          if (e.t === 'run') this.audio.sfx(e.ok ? 'run' : 'error');
          if (e.t === 'miss' && ent) ent.c.play('happy', 0.5);
          await this.log(e.text, { hold: 800 });
          if (e.t === 'cure') this.renderHUD();
          break;
        }
        case 'end': {
          if (e.outcome === 'win') { this.audio.play('victory', { restart: true }); this.playerCh?.play('cheer', 2.2); this.foeCh?.hold('defeat'); this.camTarget = { pos: new THREE.Vector3(-8.5, 2.2, 8), look: new THREE.Vector3(-5.5, 1.2, 5.4), speed: 2 }; }
          if (e.outcome === 'lose') { this.playerCh?.hold('defeat'); }
          if (e.text) await this.log(e.text, { hold: 1300 });
          break;
        }
        case 'needReplace': break;
      }
      if (e.t === 'move') this.lastMoveType = e.mtype;
    }
    this.defaultCam();
  }
  findMon(uid) { for (const s of this.b.sides) { const m = s.team.find(x => x.uid === uid); if (m) return m; } return null; }
  async throwBall(e) {
    const foe = this.models.get(e.uid);
    this.playerCh?.play('throw', 0.8);
    await wait(380);
    this.audio.sfx('throw');
    const ball = ballModel(ITEMS[e.item]?.color ?? 0xe9523f, 0.22);
    this.root.add(ball);
    const from = new THREE.Vector3(-5, 1.8, 5), to = foe.c.root.position.clone().setY(1.2);
    await new Promise(res => { const t0 = performance.now(); const step = () => { const u = Math.min(1, (performance.now() - t0) / 600); ball.position.lerpVectors(from, to, u); ball.position.y += Math.sin(u * Math.PI) * 2.2; ball.rotation.x += 0.4; if (u < 1) requestAnimationFrame(step); else res(); }; step(); });
    this.audio.sfx('ballOpen');
    this.burst(to, 0xffffff, 30, 1, 'star', 0.6);
    await this.tweenScale(foe, foe.scale, 0.01, 260);
    // drop to ground
    await new Promise(res => { const t0 = performance.now(), y0 = ball.position.y; const step = () => { const u = Math.min(1, (performance.now() - t0) / 350); ball.position.y = y0 + (0.22 - y0) * u * u; if (u < 1) requestAnimationFrame(step); else res(); }; step(); });
    this.focusOn(foe, 0.7);
    for (let i = 0; i < e.shakes; i++) {
      await wait(450); this.audio.sfx('shake');
      await new Promise(res => { const t0 = performance.now(); const step = () => { const u = Math.min(1, (performance.now() - t0) / 380); ball.rotation.z = Math.sin(u * Math.PI * 2) * 0.5; if (u < 1) requestAnimationFrame(step); else res(); }; step(); });
    }
    await wait(400);
    if (e.caught) { this.burst(ball.position.clone(), 0xffe080, 40, 0.8, 'star', 1.2, 2); this.removeModel(e.uid); this.renderHUD(); await wait(300); }
    else { this.root.remove(ball); this.audio.sfx('ballOpen'); this.burst(ball.position.clone(), 0xffffff, 24, 1, 'star', 0.6); foe.c.root.scale.setScalar(foe.scale); foe.c.play('happy', 0.6); }
    await this.log(e.text, { hold: 500 });
    if (e.caught) this.root.remove(ball);
    this.defaultCam();
  }

  // ------------------------------------------------------------------ end
  async finish(result) {
    const b = this.b, save = this.game.save;
    const waitS = { el: h('div'), onInput: (input) => { if (input.pressed('confirm') || input.pressed('back')) this.skip = true; input.nav(); return true; } };
    this.ui.push(waitS);
    if (result.outcome === 'win' && this.opts.reward) { await this.log('Du erhältst ★' + this.opts.reward + ' Sternmünzen.', { hold: 1100 }); }
    if (result.outcome === 'win' && this.opts.defeatText) { this.foeCh?.setTalking(true); await this.log('„' + this.opts.defeatText + '“', { hold: 2200 }); this.foeCh?.setTalking(false); }
    this.ui.pop(waitS);
    // learn requests
    for (const req of b.learnRequests) {
      const m = save.team.find(x => x.uid === req.uid); if (!m) continue;
      await this.game.offerMove(m, req.move);
    }
    // evolutions (visible sequence)
    if (result.outcome !== 'lose') for (const evo of b.pendingEvolutions) {
      const m = save.team.find(x => x.uid === evo.uid); if (!m) continue;
      await this.evolutionSequence(m, evo.to);
    }
    this.cleanup();
  }
  async evolutionSequence(m, to) {
    const from = m.id;
    for (const [uid] of this.models) this.removeModel(uid);
    for (const t of this.trainers) t.ch.root.visible = false;
    this.hudEl.querySelectorAll('.bhud').forEach(e => e.remove());
    this.menuEl?.remove(); this.menuEl = null;
    const ent = this.spawnModel(m, 0, 0, false);
    ent.c.root.position.set(0, 0, 0); ent.c.root.rotation.y = 0.4;
    this.camTarget = { pos: new THREE.Vector3(0, 2, 6.5), look: new THREE.Vector3(0, 1.2, 0), speed: 3 };
    this.audio.stopMusic();
    const ok = await this.ui.ask([{ who: '', text: 'Nanu? ' + (m.nick || SPECIES[from].name) + ' entwickelt sich!' }], ['Entwicklung zulassen', 'Abbrechen'], { cancelIndex: 1 });
    if (ok !== 0) { await this.ui.say([{ text: (m.nick || SPECIES[from].name) + ' hat sich nicht entwickelt.' }]); return; }
    this.audio.sfx('evolve');
    for (let i = 0; i < 14; i++) {
      ent.c.setTint(1, 1, 1);
      ent.c.root.scale.setScalar(ent.scale * (1 + Math.sin(i * 0.9) * 0.15));
      this.burst(new THREE.Vector3(0, 1, 0), 0xffffff, 10, 1.2, 'star', 0.8);
      await wait(Math.max(60, 180 - i * 8));
    }
    await this.game.ui.fade(true, true);
    const { learned, offers } = evolve(m, to);
    this.game.save.dex[to] = 2;
    this.removeModel(m.uid);
    const ne = this.spawnModel(m, 0, 0, false);
    ne.c.root.position.set(0, 0, 0); ne.c.root.rotation.y = 0.4; ne.c.setTint(0.6, 0.6, 0.6);
    await this.game.ui.fade(false, true);
    for (let i = 0; i < 10; i++) { ne.c.setTint(0.6 - i * 0.06, 0.6 - i * 0.06, 0.6 - i * 0.06); await wait(60); }
    ne.c.setTint(0, 0, 0);
    this.audio.sfx('catch'); ne.c.play('happy', 1.2);
    this.burst(new THREE.Vector3(0, 1.2, 0), 0xffe080, 60, 1.6, 'star', 1.4, 2);
    await this.ui.say([{ text: 'Glückwunsch! Dein ' + SPECIES[from].name + ' hat sich zu ' + SPECIES[to].name + ' entwickelt!' }]);
    for (const id of learned) await this.ui.say([{ text: (m.nick || SPECIES[to].name) + ' hat ' + MOVES[id].name + ' gelernt!' }]);
    for (const id of offers) await this.game.offerMove(m, id);
  }
  cleanup() {
    this.active = false;
    this.hudEl?.remove(); this.hudEl = null; this.menuEl = null; this.logEl = null;
    for (const [uid] of this.models) this.removeModel(uid);
    for (const f of this.fx) { this.root.remove(f.pts); f.pts.geometry.dispose(); f.pts.material.dispose(); }
    this.fx = [];
    if (this.root) { this.scene.remove(this.root); disposeTree(this.root); this.root = null; }
    this.trainers = [];
  }
  update(dt) {
    if (!this.active) return;
    for (const [, e] of this.models) e.c.update(dt);
    for (const t of this.trainers) t.ch.update(dt);
    for (let i = this.fx.length - 1; i >= 0; i--) {
      const f = this.fx[i]; f.t += dt;
      const pos = f.pts.geometry.attributes.position;
      for (let k = 0; k < f.v.length; k++) { f.v[k].y += f.gravity * dt; pos.setXYZ(k, pos.getX(k) + f.v[k].x * dt, pos.getY(k) + f.v[k].y * dt, pos.getZ(k) + f.v[k].z * dt); }
      pos.needsUpdate = true;
      f.pts.material.opacity = Math.max(0, 1 - f.t / f.life);
      if (f.t >= f.life) { this.root?.remove(f.pts); f.pts.geometry.dispose(); f.pts.material.dispose(); this.fx.splice(i, 1); }
    }
    const k = Math.min(1, dt * this.camTarget.speed);
    this.camera.position.lerp(this.camTarget.pos, k);
    this.lookCur.lerp(this.camTarget.look, k);
    // gentle idle sway
    const t = performance.now() / 1000;
    this.camera.position.x += Math.sin(t * 0.4) * 0.004;
    this.camera.lookAt(this.lookCur);
    if (this.shake > 0) { this.shake -= dt; this.camera.position.x += (Math.random() - 0.5) * this.shake; this.camera.position.y += (Math.random() - 0.5) * this.shake * 0.6; }
  }
}

const STATUS_COL = { brand: 0xff7a2a, gift: 0xa060ff, schlaf: 0x9ab0c8, paralyse: 0xffe040, frost: 0xa8f0ff };
function shadeCss(hex) { const c = new THREE.Color(hex); c.multiplyScalar(0.72); return '#' + c.getHexString(); }
function catchHint(scene, ball) {
  const foe = scene.b.sides[1].team.find(m => m.hp > 0);
  if (!foe) return '';
  const r = catchChance(scene.b, foe, ball);
  return r >= 1 ? 'sicher' : r > 0.55 ? 'sehr hoch' : r > 0.3 ? 'hoch' : r > 0.15 ? 'mittel' : 'gering';
}
