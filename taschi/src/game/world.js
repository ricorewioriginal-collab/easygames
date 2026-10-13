// World runtime: loads region maps and interiors, runs the player controller,
// third-person camera, NPCs with routines, roaming wild Taschis, trainers'
// line of sight, interaction detection, puzzles and encounter zones.
import { THREE } from '../engine/three.js';
import { REGIONS } from '../data/regions.js';
import { SPECIES } from '../data/species.js';
import { TRAINERS } from '../data/trainers.js';
import { buildLayout } from '../logic/layout.js';
import { FREE } from '../logic/walkgrid.js';
import { buildRegionMap, paletteFor } from '../world/region-map.js';
import { buildInterior } from '../world/interiors.js';
import { PuzzleView } from '../world/puzzle-view.js';
import { createCharacter, lookForRole } from '../engine/characters.js';
import { createCreature, displayScale } from '../engine/creatures.js';
import { disposeTree } from '../engine/renderer.js';
import { regionPool, levelRange } from '../logic/encounters.js';
import { createRng } from '../core/rng.js';
import { makeMonster } from '../logic/monster.js';
import { globalUniforms } from '../engine/materials.js';

const TMP = new THREE.Vector3();
const angDiff = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));

export class World {
  constructor(game) {
    this.game = game;
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0xcfeaf2, 60, 160);
    this.camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, 0.1, 900);
    this.cam = { yaw: Math.PI, pitch: 0.48, dist: 9, target: new THREE.Vector3(), shake: 0 };
    this.current = null; // { type: 'region'|'interior', ... }
    this.npcs = []; this.wild = []; this.puzzles = [];
    this.player = null; this.follower = null;
    this.vel = new THREE.Vector3(); this.stepAcc = 0; this.encounterCooldown = 3;
    this.mapCache = new Map(); // layouts only (cheap to keep)
    this.near = null; this.paused = false;
  }
  get save() { return this.game.save; }

  // ------------------------------------------------------------------ player
  buildPlayer() {
    if (this.player) { this.scene.remove(this.player.root); disposeTree(this.player.root); }
    this.player = createCharacter(this.save.player.look, { outline: this.game.quality.outlines });
    this.scene.add(this.player.root);
    this.refreshFollower();
  }
  refreshFollower() {
    const lead = this.save.team.find(m => m.hp > 0) || this.save.team[0];
    if (this.follower?.id === lead?.id) return;
    if (this.follower) { this.scene.remove(this.follower.c.root); this.follower.c.dispose(); this.follower = null; }
    if (!lead) return;
    const c = createCreature(lead.id, { outline: this.game.quality.outlines });
    c.root.scale.setScalar(displayScale(lead.id, 'world'));
    const p = this.player.root.position;
    c.root.position.set(p.x - 1.2, p.y, p.z + 1.2);
    this.scene.add(c.root);
    this.follower = { id: lead.id, c };
  }

  // ------------------------------------------------------------------ loading
  async loadRegion(r, spawnKey = 'start', onProgress = () => {}) {
    this.unload();
    const L = this.mapCache.get(r) || buildLayout(r);
    this.mapCache.set(r, L);
    const map = await buildRegionMap(L, { quality: this.game.quality, onProgress, save: this.save });
    this.scene.add(map.root);
    this.current = { type: 'region', region: r, map, layout: L, height: map.height };
    this.applyAtmosphere(paletteFor(r), r === 16 ? false : ['meadow-night', 'bay-night'].includes(L.biome));
    // puzzle area of the region
    if (L.puzzle) this.addPuzzle({ x: L.puzzle.x, z: L.puzzle.z, kind: L.puzzle.kind, key: 'region:' + r }, map.height(L.puzzle.x, L.puzzle.z), Math.floor(r / 4), map.palette);
    // NPCs
    if (r < 16) this.spawnRegionNPCs(r, L);
    else this.spawnSummitNPCs();
    this.spawnWild(r, L);
    const sp = (typeof spawnKey === 'object' ? spawnKey : L.spawn[spawnKey]) || L.spawn.start;
    this.placePlayer(sp.x, sp.z, sp.ry ?? 0);
    this.save.location = { map: 'region:' + r, x: sp.x, z: sp.z, ry: sp.ry ?? 0 };
    this.save.visited[r] = true;
    this.updateGates();
    onProgress(1, 'Bereit');
    return this.current;
  }
  async loadInterior(kind, region, opts = {}) {
    this.unload();
    const I = buildInterior(kind, region, this.save);
    this.scene.add(I.group);
    this.current = { type: 'interior', kind, region, interior: I, height: () => 0, returnTo: opts.returnTo };
    const l1 = new THREE.HemisphereLight(0xffffff, 0x8a7a6a, I.dark ? 0.35 : 0.75);
    const l2 = new THREE.PointLight(I.light, I.dark ? 0.6 : 0.8, 60); l2.position.set(0, I.h - 0.6, 0);
    const l3 = new THREE.DirectionalLight(0xffffff, I.dark ? 0.15 : 0.35); l3.position.set(4, 10, 6);
    I.group.add(l1, l2, l3);
    this.game.sky.dome.visible = false; this.game.sky.stars.visible = false; this.game.sky.clouds.visible = false;
    this.game.sky.hemi.visible = false; this.game.sky.sun.visible = false; this.game.sky.setWeather(null);
    this.scene.fog = I.dark ? new THREE.Fog(0x0a0e18, 8, 34) : null;
    this.scene.background = new THREE.Color(I.dark ? 0x0a0e18 : 0x2a2f3a);
    if (I.puzzleArea) this.addPuzzle(I.puzzleArea, 0, Math.floor(region / 4), paletteFor(region));
    for (const n of I.npcs) { if (n.hidden) continue; this.addNPC({ ...n, name: n.name || TRAINERS[n.trainer]?.name, role: n.role, x: n.x, z: n.z, ry: n.ry, interior: true }); }
    this.placePlayer(I.spawn.x, I.spawn.z, I.spawn.ry);
    this.cam.yaw = Math.PI; this.cam.dist = Math.min(this.cam.dist, kind === 'arena' || kind === 'league' || kind === 'cave' ? 9 : 7);
    return this.current;
  }
  unload() {
    for (const n of this.npcs) this.scene.remove(n.ch.root);
    for (const w of this.wild) { this.scene.remove(w.c.root); w.c.dispose(); }
    for (const p of this.puzzles) { this.scene.remove(p.group); disposeTree(p.group); }
    this.npcs = []; this.wild = []; this.puzzles = [];
    if (this.current) {
      const root = this.current.type === 'region' ? this.current.map.root : this.current.interior.group;
      this.scene.remove(root);
      disposeTree(root);
      this.current.map?.field?.dispose();
    }
    this.current = null; this.near = null;
    this.game.sky.dome.visible = true; this.game.sky.stars.visible = true; this.game.sky.clouds.visible = true; this.game.sky.hemi.visible = true; this.game.sky.sun.visible = true;
    this.scene.background = null;
  }
  applyAtmosphere(pal, fixedNight) {
    const q = this.game.quality;
    this.scene.fog = new THREE.Fog(pal.fog, q.drawDistance * 0.45, q.drawDistance * 1.15);
    this.camera.far = q.drawDistance * 2.5; this.camera.updateProjectionMatrix();
    this.game.sky.setPalette(pal, fixedNight);
    const r = this.current.region;
    const weathers = r === 16 ? ['stars', 'clear'] : REGIONS[r].weather;
    this.setWeather(weathers[Math.floor(Math.random() * weathers.length)]);
  }
  setWeather(w) { this.weather = w; this.game.sky.setWeather(w); }
  placePlayer(x, z, ry) {
    const p = this.player.root;
    p.position.set(x, this.current.height(x, z), z); p.rotation.y = ry;
    this.cam.yaw = ry + Math.PI; this.cam.target.copy(p.position);
    if (this.follower) this.follower.c.root.position.set(x - Math.sin(ry) * 1.4, p.position.y, z - Math.cos(ry) * 1.4);
    this.snapCamera();
  }

  addPuzzle(area, y, difficulty, palette) {
    const solved = !!this.save.puzzles[area.key];
    const pv = new PuzzleView(area, y, { seed: area.key, difficulty, solved, palette });
    pv.key = area.key;
    this.scene.add(pv.group);
    this.puzzles.push(pv);
  }

  // ------------------------------------------------------------------ NPCs
  addNPC(def) {
    const look = def.look || lookForRole(def.role === 'leader' || def.role === 'champion' ? def.role : def.role, def.name || def.id);
    const ch = createCharacter(look, { outline: this.game.quality.outlines });
    const y = this.current.height(def.x, def.z);
    ch.root.position.set(def.x, y, def.z); ch.root.rotation.y = def.ry ?? Math.random() * 6;
    this.scene.add(ch.root);
    const n = { ...def, ch, home: new THREE.Vector3(def.x, y, def.z), target: null, wait: Math.random() * 3, ry: ch.root.rotation.y };
    this.npcs.push(n);
    return n;
  }
  spawnRegionNPCs(r, L) {
    const region = REGIONS[r];
    for (const n of L.npcs) this.addNPC({ ...n, id: 'npc' + n.idx, talk: 'resident', data: region.npcs[n.idx] });
    // quest givers not among the residents
    const names = new Set(region.npcs.map(n => n.name));
    let extra = 0;
    for (const q of region.quests || []) {
      if (names.has(q.giver) || /Professor/.test(q.giver)) continue;
      names.add(q.giver);
      const a = 2.2 + extra++ * 0.9;
      this.addNPC({ id: 'giver:' + q.id, role: 'reisender', name: q.giver, x: L.plaza.x + Math.cos(a) * (L.plaza.r + 3), z: L.plaza.z + Math.sin(a) * (L.plaza.r + 3), talk: 'giver', quest: q.id });
    }
    if (r === 0) {
      if (!this.save.flags.firstQuest) this.addNPC({ id: 'ulme', role: 'professor', name: 'Professor Ulme', x: L.ulme.x, z: L.ulme.z, ry: Math.PI / 2 * L.mirror * -1, talk: 'ulme', look: { body: 'elder', skin: 1, hair: 'short', hairColor: 7, top: 'labcoat', topColor: 0xf2f4f2, accent: 0x5d7f99, bottomColor: 0x5a4a3a, glasses: true, beard: 0xe8e4dc } });
    }
    // route trainers
    for (const t of L.trainers) {
      const tr = TRAINERS[t.id]; if (!tr) continue;
      this.addNPC({ id: t.id, role: 'trainer', name: tr.cls + ' ' + tr.name, x: t.x, z: t.z, ry: t.ry, trainer: t.id, sight: tr.sight || 7, look: tr.format === 'double' ? lookForRole('kind', tr.name) : lookForRole('trainer', tr.name) });
    }
    if (L.pavilion) this.addNPC({ id: 'champ', role: 'champion', name: region.champion.name, x: L.pavilion.x, z: L.pavilion.z - 1.5, ry: 0, trainer: 'champ_' + r, champion: true, look: lookForRole('champion', region.champion.name) });
    if (L.guild && this.save.guild[region.guild] !== 'done') {
      const list = this.game.guildBattlesAt(region.guild).filter(t => t.where !== 'station');
      list.forEach((t, i) => this.addNPC({ id: t.id, role: 'grunt', name: t.name, x: L.guild.x + (i - (list.length - 1) / 2) * 2.2, z: L.guild.z + 3, ry: 0, guild: true, trainer: t.id, look: lookForRole(t.look, t.name) }));
    }
  }
  spawnSummitNPCs() {
    if (!this.save.flags.summitDone) {
      const list = this.game.guildBattlesAt(7);
      list.forEach((t, i) => this.addNPC({ id: t.id, role: 'grunt', name: t.name, x: (i - 1) * 2.4, z: -6, ry: 0, guild: true, trainer: t.id, look: lookForRole(t.look, t.name) }));
    } else {
      this.addNPC({ id: 'brixSummit', role: 'brix', name: 'Brix', x: 5, z: 4, ry: -0.6, talk: 'brix', look: lookForRole('brix', 'Brix') });
      this.addNPC({ id: 'vargaSummit', role: 'varga', name: 'Varga', x: -5, z: -6, ry: 0.4, talk: 'varga', look: lookForRole('varga', 'Varga') });
    }
  }
  // roaming wild Taschis with behaviour (visible encounters)
  spawnWild(r, L) {
    const rng = createRng('wild:' + r + ':' + Date.now());
    const pool = regionPool(r, 'grass');
    if (!pool.length || !L.grass.length) return;
    const n = Math.max(3, Math.round(5 * this.game.quality.vegetation));
    for (let i = 0; i < n; i++) {
      const g = L.grass[i % L.grass.length];
      const total = pool.reduce((a, [, w]) => a + w, 0);
      let v = rng.next() * total, id = pool[0][0];
      for (const [sid, w] of pool) { v -= w; if (v <= 0) { id = sid; break; } }
      const c = createCreature(id, { outline: false });
      c.root.scale.setScalar(displayScale(id, 'world'));
      const x = g.x + (rng.next() - 0.5) * g.w, z = g.z + (rng.next() - 0.5) * g.d;
      c.root.position.set(x, this.current.height(x, z), z);
      this.scene.add(c.root);
      this.wild.push({ id, c, home: { x: g.x, z: g.z, r: Math.max(g.w, g.d) * 0.7 }, target: null, wait: rng.next() * 3, behavior: SPECIES[id].behavior, state: 'idle', cooldown: 0 });
    }
  }

  // ------------------------------------------------------------------ movement & collision
  blocked(x, z, ignore = null) {
    const c = this.current;
    if (!c) return true;
    if (c.type === 'region') { if (c.map.grid.at(x, z) !== FREE) return true; }
    else if (c.interior.grid.at(x, z)) return true;
    for (const p of this.puzzles) if (p.blocked(x, z)) return true;
    for (const n of this.npcs) if (n !== ignore && Math.hypot(n.ch.root.position.x - x, n.ch.root.position.z - z) < 0.65) return true;
    if (c.type === 'region') for (const d of c.map.dynamic) if (d.kind === 'gateBarrier' && d.mesh.visible) { const p = d.mesh.position; if (Math.abs(x - p.x) < 4 && Math.abs(z - p.z) < 1) return true; }
    if (c.type === 'region' && this.obstacleBlocks(x, z)) return true;
    return false;
  }
  obstacleBlocks(x, z) {
    const L = this.current.layout;
    if (!L.obstacle || this.save.found['obstacle:' + this.current.region]) return false;
    // the obstacle seals the path to the hidden reward
    return Math.hypot(x - L.obstacle.x, z - L.obstacle.z) < 2.2;
  }
  movePlayer(dt, input) {
    const p = this.player.root;
    const m = input.move;
    const mag = Math.min(1, Math.hypot(m.x, m.y));
    const running = input.held('run') !== !!this.game.settings.get('autoRun');
    const maxSpeed = (running ? 7.2 : 4.0) * this.game.settings.get('walkSpeed');
    let speed = 0;
    if (mag > 0.05) {
      const yaw = this.cam.yaw;
      const fx = -Math.sin(yaw), fz = -Math.cos(yaw), rx = Math.cos(yaw), rz = -Math.sin(yaw);
      // stick up = away from camera
      const dx = rx * m.x - fx * m.y, dz = rz * m.x - fz * m.y;
      const len = Math.hypot(dx, dz) || 1;
      const targetYaw = Math.atan2(dx / len, dz / len);
      p.rotation.y += angDiff(targetYaw, p.rotation.y) * Math.min(1, dt * 12);
      speed = maxSpeed * mag;
      const step = speed * dt;
      let nx = p.position.x + dx / len * step, nz = p.position.z + dz / len * step;
      // slide along obstacles
      const r = 0.38;
      const ok = (x, z) => !this.blocked(x + Math.sign(dx) * r * 0.6, z) && !this.blocked(x, z + Math.sign(dz) * r * 0.6) && !this.blocked(x, z);
      if (ok(nx, nz)) { p.position.x = nx; p.position.z = nz; }
      else if (ok(nx, p.position.z)) p.position.x = nx;
      else if (ok(p.position.x, nz)) p.position.z = nz;
      else speed = 0;
      if (speed > 0) { this.stepAcc += step; if (this.game.settings.get('camAuto') && Math.abs(m.y) > 0.3 && m.y < 0) this.cam.yaw += angDiff(p.rotation.y + Math.PI, this.cam.yaw) * dt * 0.8; }
    }
    const gy = this.current.height(p.position.x, p.position.z);
    p.position.y += (gy - p.position.y) * Math.min(1, dt * 18);
    this.player.setLocomotion(speed);
    return speed;
  }
  snapCamera() { this.updateCamera(1, { x: 0, y: 0, zoom: 0 }, true); }
  updateCamera(dt, look, snap = false) {
    const c = this.cam, p = this.player.root.position;
    const s = this.game.settings;
    c.yaw -= look.x; c.pitch = Math.max(0.12, Math.min(1.15, c.pitch + look.y * (s.get('invertY') ? -1 : 1)));
    const base = (this.current?.type === 'interior' ? 7 : 9.5) * s.get('camDistance');
    c.dist = Math.max(4, Math.min(16, (c.dist || base) + look.zoom * 2));
    if (look.zoom === 0 && this.current?.type === 'interior') c.dist += (Math.min(c.dist, base) - c.dist) * dt;
    c.target.lerp(TMP.set(p.x, p.y + 1.3, p.z), snap ? 1 : Math.min(1, dt * 8));
    const d = c.dist;
    const cx = c.target.x + Math.sin(c.yaw) * Math.cos(c.pitch) * d, cz = c.target.z + Math.cos(c.yaw) * Math.cos(c.pitch) * d;
    let cy = c.target.y + Math.sin(c.pitch) * d;
    if (this.current?.type === 'region') cy = Math.max(cy, this.current.height(cx, cz) + 1.2);
    if (this.current?.type === 'interior') cy = Math.min(cy, (this.current.interior.h || 5) - 0.4);
    this.camera.position.set(cx, cy, cz);
    if (c.shake > 0) { c.shake -= dt; this.camera.position.x += (Math.random() - 0.5) * c.shake; this.camera.position.y += (Math.random() - 0.5) * c.shake; }
    this.camera.lookAt(c.target);
  }

  // ------------------------------------------------------------------ interactions
  interactables() {
    const c = this.current; if (!c) return [];
    const list = c.type === 'region' ? c.map.interact.slice() : c.interior.interact.slice();
    if (c.type === 'interior') list.push({ id: 'exit', kind: 'exit', x: c.interior.exit.x, z: c.interior.exit.z, r: 1.8, label: 'Ausgang', prompt: 'Hinausgehen' });
    for (const p of this.puzzles) { list.push(...p.interact.filter(e => !e.hidden)); list.push(...p.dynamicInteract()); }
    for (const n of this.npcs) list.push({ id: 'npc:' + n.id, kind: 'npc', npc: n, x: n.ch.root.position.x, z: n.ch.root.position.z, r: 1.9, label: n.name, prompt: n.trainer && !this.save.trainers[n.trainer] ? 'Herausfordern' : 'Sprechen' });
    return list.filter(e => !this.isConsumed(e));
  }
  isConsumed(e) {
    if (e.kind === 'item') return !!(this.save.found[e.item.id] || (e.item.flag && this.save.flags[e.item.flag]));
    if (e.kind === 'gatedItem') return !!this.save.found[e.reward.id];
    if (e.kind === 'obstacle') return !!this.save.found['obstacle:' + this.current.region];
    return false;
  }
  findNear() {
    const p = this.player.root.position, ry = this.player.root.rotation.y;
    let best = null, bestScore = Infinity;
    for (const e of this.interactables()) {
      const dx = e.x - p.x, dz = e.z - p.z, d = Math.hypot(dx, dz);
      if (d > e.r + 0.6) continue;
      const facing = d < 0.8 ? 0 : Math.abs(angDiff(Math.atan2(dx, dz), ry));
      if (facing > 2.0 && d > 1.2) continue;
      const score = d + facing * 0.8;
      if (score < bestScore) { bestScore = score; best = e; }
    }
    return best;
  }

  // ------------------------------------------------------------------ per-frame
  update(dt, input, active) {
    if (!this.current || !this.player) return;
    const t = globalUniforms.uTime.value;
    let speed = 0;
    if (active) speed = this.movePlayer(dt, input);
    else this.player.setLocomotion(0);
    this.player.update(dt);
    // follower
    if (this.follower) {
      const f = this.follower.c, fp = f.root.position, pp = this.player.root.position;
      const dx = pp.x - fp.x, dz = pp.z - fp.z, d = Math.hypot(dx, dz);
      let fs = 0;
      if (d > 1.7) { const k = Math.min(1, (d - 1.5) * dt * 4); fp.x += dx * k; fp.z += dz * k; fs = (d - 1.5) * 4; }
      fp.y += (this.current.height(fp.x, fp.z) - fp.y) * Math.min(1, dt * 10);
      if (d > 0.3) f.root.rotation.y += angDiff(Math.atan2(dx, dz), f.root.rotation.y) * Math.min(1, dt * 6);
      f.setMoving(fs); f.update(dt);
    }
    this.updateNPCs(dt);
    this.updateWild(dt, active);
    for (const pz of this.puzzles) pz.update(dt);
    if (this.current.type === 'region') this.current.map.update(t, dt, this.camera, this.player.root.position);
    else for (const a of this.current.interior.animators) a(t);
    const look = input.takeCamera();
    if (!active) { look.x = 0; look.y = 0; look.zoom = 0; }
    this.updateCamera(dt, look);
    if (active) {
      this.near = this.findNear();
      // step plates
      const pp = this.player.root.position;
      for (const pz of this.puzzles) { const r = pz.step(pp.x, pp.z); if (r) this.game.onPuzzleResult(pz, r); }
      if (speed > 0) this.checkEncounters(dt);
      this.checkTrainerSight();
      this.checkAutoTriggers();
    } else this.near = null;
    return speed;
  }
  updateNPCs(dt) {
    const minutes = this.save.worldTime;
    const pp = this.player.root.position;
    for (const n of this.npcs) {
      const r = n.ch.root;
      if (n.facePlayer) { r.rotation.y += angDiff(Math.atan2(pp.x - r.position.x, pp.z - r.position.z), r.rotation.y) * Math.min(1, dt * 8); n.ch.setLocomotion(0); n.ch.update(dt); continue; }
      if (n.walkTo) {
        const dx = n.walkTo.x - r.position.x, dz = n.walkTo.z - r.position.z, d = Math.hypot(dx, dz);
        if (d < 0.3) { const cb = n.walkTo.done; n.walkTo = null; n.ch.setLocomotion(0); cb && cb(); }
        else { const sp = n.walkTo.speed || 3; r.position.x += dx / d * sp * dt; r.position.z += dz / d * sp * dt; r.rotation.y += angDiff(Math.atan2(dx, dz), r.rotation.y) * Math.min(1, dt * 10); n.ch.setLocomotion(sp); }
        r.position.y = this.current.height(r.position.x, r.position.z);
        n.ch.update(dt); continue;
      }
      // daily routine for residents
      if (n.schedule) {
        const slot = n.schedule.find(s => s.from < s.to ? minutes >= s.from && minutes < s.to : minutes >= s.from || minutes < s.to);
        if (slot && (!n.target || n.target.slot !== slot)) n.target = { x: slot.at.x + (Math.random() - 0.5) * 2, z: slot.at.z + (Math.random() - 0.5) * 2, slot };
      } else if (!n.trainer && !n.interior && !n.target && (n.wait -= dt) < 0) {
        n.target = { x: n.home.x + (Math.random() - 0.5) * 4, z: n.home.z + (Math.random() - 0.5) * 4 };
      }
      let moving = 0;
      if (n.target) {
        const dx = n.target.x - r.position.x, dz = n.target.z - r.position.z, d = Math.hypot(dx, dz);
        if (d > 0.4) {
          const nx = r.position.x + dx / d * 1.6 * dt, nz = r.position.z + dz / d * 1.6 * dt;
          if (!this.blocked(nx, nz, n) && Math.hypot(nx - pp.x, nz - pp.z) > 1) { r.position.x = nx; r.position.z = nz; moving = 1.6; r.rotation.y += angDiff(Math.atan2(dx, dz), r.rotation.y) * Math.min(1, dt * 6); }
          else n.target = n.schedule ? n.target : null, n.wait = 2;
        } else if (!n.schedule) { n.target = null; n.wait = 2 + Math.random() * 5; }
        r.position.y = this.current.height(r.position.x, r.position.z);
      }
      n.ch.setLocomotion(moving);
      n.ch.update(dt);
    }
  }
  updateWild(dt, active) {
    const pp = this.player.root.position;
    for (const w of this.wild) {
      const r = w.c.root;
      const dx = pp.x - r.position.x, dz = pp.z - r.position.z, d = Math.hypot(dx, dz);
      let sp = 0;
      w.cooldown -= dt;
      if (active && d < 7 && w.cooldown < 0) {
        if (w.behavior === 'shy') { w.state = 'flee'; }
        else if (w.behavior === 'aggressive') w.state = 'charge';
        else if (w.behavior === 'curious' || w.behavior === 'playful') w.state = 'watch';
        else w.state = 'idle';
      } else if (d > 10 && w.state !== 'idle') w.state = 'idle';
      let mx = 0, mz = 0;
      if (w.state === 'flee') { mx = -dx / d; mz = -dz / d; sp = 4.5; }
      else if (w.state === 'charge') { mx = dx / d; mz = dz / d; sp = 3.2; if (d < 1.2 && active) { w.cooldown = 8; this.game.encounterFromWild(w); return; } }
      else if (w.state === 'watch') { r.rotation.y += angDiff(Math.atan2(dx, dz), r.rotation.y) * Math.min(1, dt * 5); if (w.behavior === 'playful' && Math.random() < dt * 0.5) w.c.play('happy', 0.8); }
      else {
        if (!w.target && (w.wait -= dt) < 0) w.target = { x: w.home.x + (Math.random() - 0.5) * w.home.r * 2, z: w.home.z + (Math.random() - 0.5) * w.home.r * 2 };
        if (w.target) { const tx = w.target.x - r.position.x, tz = w.target.z - r.position.z, td = Math.hypot(tx, tz); if (td < 0.5) { w.target = null; w.wait = 2 + Math.random() * 4; } else { mx = tx / td; mz = tz / td; sp = 1.3; } }
        if (w.behavior === 'sleepy' && !w.target && !w.c.action) w.c.play('sleep', 3);
      }
      if (sp) {
        const nx = r.position.x + mx * sp * dt, nz = r.position.z + mz * sp * dt;
        if (!this.blocked(nx, nz) && Math.hypot(nx - w.home.x, nz - w.home.z) < w.home.r * 2.2) { r.position.x = nx; r.position.z = nz; r.rotation.y += angDiff(Math.atan2(mx, mz), r.rotation.y) * Math.min(1, dt * 8); }
        else { w.target = null; if (w.state === 'flee') sp = 0; }
      }
      r.position.y += (this.current.height(r.position.x, r.position.z) - r.position.y) * Math.min(1, dt * 10);
      w.c.setMoving(sp); w.c.update(dt);
      r.visible = d < this.game.quality.drawDistance * 0.6;
    }
  }
  removeWild(w) { const i = this.wild.indexOf(w); if (i >= 0) { this.wild.splice(i, 1); this.scene.remove(w.c.root); w.c.dispose(); } }
  inGrass() {
    const c = this.current, p = this.player.root.position;
    if (c.type === 'interior') return c.interior.encounters ? { habitat: c.interior.encounters.habitat, rate: c.interior.encounters.rate } : null;
    for (const g of c.layout.grass) if (Math.abs(p.x - g.x) < g.w / 2 && Math.abs(p.z - g.z) < g.d / 2) return { habitat: g.habitat, rate: 0.11 };
    return null;
  }
  checkEncounters() {
    if (this.stepAcc < 1.4) return;
    this.stepAcc = 0;
    this.encounterCooldown--;
    const g = this.inGrass();
    if (!g || this.encounterCooldown > 0 || !this.save.flags.firstQuest) return;
    if (Math.random() < g.rate) { this.encounterCooldown = 4; this.game.randomEncounter(g.habitat); }
  }
  checkTrainerSight() {
    const pp = this.player.root.position;
    for (const n of this.npcs) {
      if (!n.trainer || n.champion || n.leader || n.league !== undefined || this.save.trainers[n.trainer] || n.walkTo || n.spotted || n.guild) continue;
      if (!TRAINERS[n.trainer] || TRAINERS[n.trainer].kind === 'gymTrainer') continue;
      const r = n.ch.root, dx = pp.x - r.position.x, dz = pp.z - r.position.z, d = Math.hypot(dx, dz);
      if (d > (n.sight || 7)) continue;
      if (Math.abs(angDiff(Math.atan2(dx, dz), r.rotation.y)) > 0.55) continue;
      n.spotted = true;
      this.game.trainerSpotted(n);
      return;
    }
  }
  checkAutoTriggers() {
    // story trigger: Ulme calls the player in Sonnenhain
    if (this.current.type === 'region' && this.current.region === 0 && !this.save.flags.metUlme && !this.game.busy) {
      const ulme = this.npcs.find(n => n.id === 'ulme');
      if (ulme && ulme.ch.root.position.distanceTo(this.player.root.position) < 3.2) this.game.talkToNPC(ulme);
    }
  }
  updateGates() {
    if (this.current?.type !== 'region') return;
    for (const d of this.current.map.dynamic) {
      if (d.kind !== 'gateBarrier') continue;
      d.mesh.visible = d.gate === 'north' ? !this.game.northOpen() : false;
    }
  }
}
