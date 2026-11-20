// Spielablauf: Park laden, Modi (Karriere, Highscore, Freies Fahren, Duell), Ziele, Kamera, Wertung.
import { Vector3, Color3 } from '@babylonjs/core/Maths/math';
import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera';
import { createScene, addPipeline } from './gfx.js';
import { buildWorld } from './world.js';
import { makeBoard } from './board.js';
import { makeSkater } from './rig.js';
import { Skater } from './skater.js';
import { PARKS, SKATERS, BOARDS } from './parks.js';
import * as A from './audio.js';
import { save, persist } from './save.js';

const RUN_TIME = 120, DUEL_TIME = 60;
const NOINPUT = { x: 0, y: 0, rx: 0, ry: 0, down: () => false, pressed: () => false, released: () => false };

export class Game {
  constructor(engine, input, ui) {
    this.engine = engine; this.input = input; this.ui = ui;
    this.settings = save.settings;
    this.scene = null; this.state = 'boot'; this.parkIdx = 0; this.mode = 'career'; this.orbit = 0;
    this.camDist = { near: 3.4, normal: 4.3, far: 5.4 };
    engine.runRenderLoop(() => this.frame());
    addEventListener('resize', () => engine.resize());
  }

  get skaterDef() { return SKATERS[save.skater] || SKATERS[0]; }
  get park() { return PARKS[this.parkIdx]; }

  // ------------------------------------------------------------ Laden
  async load(parkIdx, opts = {}) {
    const token = (this._tok = (this._tok || 0) + 1);
    this.ui.loading(true, PARKS[parkIdx].name);
    await new Promise(r => setTimeout(r, 30));
    if (this.scene) { A.setGrind(false); A.setRoll(0, false); this.scene.dispose(); this.scene = null; this.skater = null; }
    this.parkIdx = parkIdx;
    const park = PARKS[parkIdx];
    const S = createScene(this.engine, park, this.settings.quality);
    this.scene = S.scene; this.shadow = S.shadow; this.Q = S.Q; this.sun = S.sun;
    const W = buildWorld(this, park);
    this.level = W.level; this.items = W.items;
    // Kamera
    const cam = this.cam = new FreeCamera('cam', new Vector3(0, 4, -8), this.scene);
    cam.minZ = 0.08; cam.maxZ = 1200; cam.fov = 1.05; cam.inputs.clear();
    this.post = addPipeline(this.scene, cam, this.Q, park);
    await this.spawnSkater();
    if (token !== this._tok) return;
    await Promise.race([this.scene.whenReadyAsync(), new Promise(r => setTimeout(r, 6000))]);
    if (this.shadow) { this.shadow.splitFrustum(); }
    this.ui.loading(false);
    this.camState = null;
    return true;
  }
  async spawnSkater() {
    const def = this.skaterDef, bd = BOARDS[save.board] || BOARDS[def.board] || BOARDS[0];
    if (this.skater) { this.skater.holder.dispose(false, true); this.skater = null; }
    const board = makeBoard(this.scene, bd, this.shadow);
    const rig = await makeSkater(this.scene, Object.assign({ id: def.id }, def), this.shadow);
    this.skater = new Skater(this, rig, board, def.stats);
    this.skater.apply(0);
  }

  // ------------------------------------------------------------ Modi
  async showcase(parkIdx = 0) {           // Hintergrund im Menü
    this.state = 'menu'; this.input.enabled = false;
    if (!this.scene || this.parkIdx !== parkIdx) await this.load(parkIdx);
    const sp = this.park.spawn; this.skater.reset(sp);
    this.orbit = 0;
  }
  async start(mode, parkIdx, players) {
    this.mode = mode; A.initAudio();
    await this.load(parkIdx);
    this.run = { t: mode === 'free' ? Infinity : mode === 'duel' ? DUEL_TIME : RUN_TIME, score: 0, best: 0, letters: new Set(), tape: false, gaps: new Set(), done: [], maxGrind: 0, maxManual: 0, ending: 0, bestCombo: 0 };
    if (mode === 'duel') { this.duel = this.duel && this.duel.parkIdx === parkIdx && players == null ? this.duel : { parkIdx, players: players || 2, cur: 0, scores: [] }; }
    for (const it of this.items) { it.got = false; it.node.setEnabled(mode !== 'score' && mode !== 'duel' || it.kind === 'letter'); }
    // Bereits erledigte Karriereziele: Sammelobjekte trotzdem zeigen (für Punkte), Kassette nur wenn noch offen
    this.skater.reset(this.park.spawn); this.skater.special = 0;
    this.state = 'play'; this.input.enabled = true; this.input.clear();
    this.ui.startRun(this);
    A.playMusic(this.settings.track >= 0 ? this.settings.track : this.park.music);
    this.paused = false;
  }
  restart() { this.start(this.mode, this.parkIdx); }
  pause(on) {
    if (this.state !== 'play' && this.state !== 'ending') return;
    this.paused = on; this.ui.pause(on, this);
    if (on) { A.setRoll(0, false); A.setGrind(false); }
    this.input.clear();
  }
  quit() { this.state = 'menu'; this.paused = false; A.stopMusic(); A.setRoll(0, false); A.setGrind(false); this.input.enabled = false; }

  // ------------------------------------------------------------ Schleife
  frame() {
    if (!this.scene) return;
    const dt = Math.min(0.05, this.engine.getDeltaTime() / 1000 || 0.016);
    this.input.poll();
    if (this.state === 'play' || this.state === 'ending') {
      if (this.input.pressed('pause')) this.pause(!this.paused);
      if (this.input.pressed('goals') && !this.paused) this.ui.toggleGoals(this);
      if (!this.paused) this.tick(dt);
    } else if (this.state === 'menu' && this.skater) {
      this.skater.inp = NOINPUT; this.skater.apply(dt);
      this.orbit += dt * 0.18;
      const p = this.skater.pos, a = this.orbit;
      this.cam.position.set(p.x + Math.sin(a) * 4.2, p.y + 1.7, p.z + Math.cos(a) * 4.2);
      this.cam.setTarget(new Vector3(p.x, p.y + 0.95, p.z));
    }
    this.animateItems(dt);
    this.scene.render();
  }

  tick(dt) {
    const sk = this.skater, run = this.run;
    sk.update(dt, this.input);
    // Zeit
    if (run.t !== Infinity && this.state === 'play') {
      const before = Math.ceil(run.t); run.t = Math.max(0, run.t - dt);
      if (Math.ceil(run.t) !== before && run.t <= 10 && run.t > 0) A.sfx('tick');
      if (run.t <= 0) { this.state = 'ending'; run.ending = 0; this.ui.flash('Zeit!'); }
    }
    if (this.state === 'ending') {
      run.ending += dt;
      if ((sk.mode === 'ground' && !sk.combo.active) || sk.mode === 'bail' || run.ending > 7) {
        if (sk.combo.active && sk.mode === 'ground') sk.bank();
        return this.endRun();
      }
    }
    // Grind/Manual-Dauer
    if (sk.grind) { run.maxGrind = Math.max(run.maxGrind, sk.grind.time + (sk.grind.carry || 0)); this.goalCheck('grindTime', run.maxGrind); }
    if (sk.manual) { run.maxManual = Math.max(run.maxManual, sk.manual.t); this.goalCheck('manualTime', run.maxManual); }
    // Sammeln
    for (const it of this.items) {
      if (it.got || !it.node.isEnabled()) continue;
      const hp = sk.holder.position;
      if (Vector3.DistanceSquared(new Vector3(hp.x, hp.y + 0.9, hp.z), it.pos) < 1.35 * 1.35) this.collect(it);
    }
    // Ton
    A.setRoll(sk.speed, sk.mode === 'ground');
    this.updateCamera(dt);
    this.ui.hud(this, dt);
  }

  // ------------------------------------------------------------ Kamera
  updateCamera(dt) {
    const sk = this.skater, cam = this.cam, L = this.level;
    const dist = this.camDist[this.settings.cam] || 4.3;
    const st = this.camState || (this.camState = { yaw: sk.yaw, pos: null, look: null, fov: 1.05, h: 1.9 });
    // Blickrichtung: Fahrtrichtung (horizontal); in der Luft über Vert-Rampen festhalten
    const vh = Math.hypot(sk.vel.x, sk.vel.z);
    let want = st.yaw;
    if (sk.mode === 'air' && sk.air && sk.air.vert) want = st.yaw;
    else if (sk.mode === 'grind') want = Math.atan2(sk.vel.x, sk.vel.z);
    else if (vh > 1.2 && sk.normal.y > 0.55) want = Math.atan2(sk.vel.x, sk.vel.z);
    else if (vh <= 1.2 && sk.mode === 'ground') want = sk.yaw + (sk.fakie ? Math.PI : 0);
    let d = want - st.yaw; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
    const k = sk.mode === 'air' ? 1.6 : sk.mode === 'grind' ? 5 : 4.2;
    st.yaw += d * (1 - Math.exp(-k * dt));
    // Rechter Stick: umschauen
    const look = this.input.rx * 1.6;
    const yaw = st.yaw + look;
    const fx = Math.sin(yaw), fz = Math.cos(yaw);
    const p = sk.holder.position;
    const sp = sk.speed;
    const back = dist + Math.min(1.2, sp * 0.05), up = 1.75 + Math.min(0.6, sp * 0.02) - this.input.ry * 0.8;
    let tx = p.x - fx * back, tz = p.z - fz * back, ty = p.y + up;
    // Kamera nicht in Geometrie: von der Figur nach hinten tasten
    const steps = 12; let lastOk = 0;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps, x = p.x + (tx - p.x) * t, z = p.z + (tz - p.z) * t, y = p.y + 1.2 + (ty - p.y - 1.2) * t;
      if (L.height(x, z) > y - 0.35) break; lastOk = t;
    }
    if (lastOk < 1) { const t = Math.max(0.25, lastOk); tx = p.x + (tx - p.x) * t; tz = p.z + (tz - p.z) * t; ty = Math.max(ty, L.height(tx, tz) + 0.6, p.y + 1.6); }
    ty = Math.max(ty, L.height(tx, tz) + 0.5);
    const target = new Vector3(p.x + fx * 1.6, p.y + 0.95 + (sk.mode === 'air' ? 0.2 : 0), p.z + fz * 1.6);
    if (!st.pos) { st.pos = new Vector3(tx, ty, tz); st.look = target.clone(); }
    const kp = 1 - Math.exp(-(sk.mode === 'air' ? 5 : 9) * dt);
    st.pos.x += (tx - st.pos.x) * kp; st.pos.z += (tz - st.pos.z) * kp; st.pos.y += (ty - st.pos.y) * (1 - Math.exp(-(sk.mode === 'air' ? 3 : 7) * dt));
    // nie unter die Oberfläche
    st.pos.y = Math.max(st.pos.y, L.height(st.pos.x, st.pos.z) + 0.45);
    Vector3.LerpToRef(st.look, target, 1 - Math.exp(-12 * dt), st.look);
    cam.position.copyFrom(st.pos);
    // kleines Wackeln bei Landung
    if (sk.landSquash > 0.3) cam.position.y += (Math.random() - 0.5) * 0.04 * sk.landSquash;
    cam.setTarget(st.look);
    st.fov += ((1.0 + Math.min(0.2, sp * 0.012)) - st.fov) * (1 - Math.exp(-3 * dt));
    cam.fov = st.fov;
  }

  // ------------------------------------------------------------ Ereignisse vom Skater
  onTrick(e, special) { this.ui.trick(e, special); if (special) this.skater.special = 0; }
  onBank(v, list) {
    const run = this.run; if (!run) return;
    run.score += v; run.bestCombo = Math.max(run.bestCombo, v);
    this.ui.bank(v, list);
    if (v >= 1000) A.sfx('bank');
    this.goalCheck('score', run.score); this.goalCheck('combo', v);
    // Drehungen
    for (const e of list) { const m = /^(\d{3,4}) /.exec(e.name); if (m) this.goalCheck('spin', +m[1]); if (e.special) this.goalCheck('special', 1); }
    // Trick über Lücke
    if (this._trickGaps) { for (const tg of this._trickGaps) this.goalCheck('trickgap', tg); this._trickGaps = null; }
  }
  onBail(why, lost) { A.sfx('bail'); this.ui.bail(why, lost); this._trickGaps = null; }
  onRecover() { }
  sfx(n, k) { A.sfx(n, k); }
  grindSound(on, kind) { A.setGrind(on, kind); }
  checkGaps(to, land, air) {
    const park = this.park, sk = this.skater;
    const inR = (x, z, r) => x >= r[0] && x <= r[2] && z >= r[1] && z <= r[3];
    const hit = new Set();
    for (const g of park.gaps) {
      if (hit.has(g.name)) continue;
      if (!inR(to.x, to.z, g.from) || !inR(land.x, land.z, g.to)) continue;
      if (g.minY != null && land.y < g.minY) continue;
      if (g.minAir != null && air.t < g.minAir) continue;
      if (g.outBowl) { const s = this.level.surface(land.x, land.z); if (!(to.el && to.el.t === 'bowl') || (s.el && s.el.t === 'bowl') || land.y < -0.05) continue; }
      if (g.over && air.t < 0.55) continue;
      hit.add(g.name);
      const e = sk.combo.add(g.name, g.pts, 'gap:' + g.name); e.gap = true; this.ui.trick(e, false, true);
      A.sfx('gap');
      this.run && this.run.gaps.add(g.name);
      this.goalCheck('gap', g.name);
      const names = air.tricks.map(t => t.name).join(' ');
      (this._trickGaps || (this._trickGaps = [])).push({ gap: g.name, names });
    }
  }
  collect(it) {
    it.got = true; it.node.setEnabled(false); A.sfx('collect');
    const run = this.run;
    if (it.kind === 'letter') { run.letters.add(it.i); this.ui.letters(run.letters); if (run.letters.size === 5) this.goalCheck('letters', 5); this.ui.flash(it.ch + '!'); }
    else { run.tape = true; this.goalCheck('tape', 1); this.ui.flash('Kassette gefunden!'); }
  }
  animateItems(dt) {
    if (!this.items) return; const t = performance.now() / 1000;
    for (const it of this.items) if (it.node.isEnabled()) { it.node.rotation.y = t * 1.6; it.node.position.y = it.pos.y + Math.sin(t * 2 + it.pos.x) * 0.08; }
  }

  // ------------------------------------------------------------ Ziele
  goalCheck(type, val) {
    if (this.mode !== 'career' || !this.run) return;
    const park = this.park, prog = save.parks[park.id] || (save.parks[park.id] = { goals: [], best: 0 });
    park.goals.forEach((g, i) => {
      if (g.type !== type || prog.goals.includes(i)) return;
      let ok = false;
      switch (type) {
        case 'score': case 'combo': ok = val >= g.n; break;
        case 'grindTime': case 'manualTime': ok = val >= g.n; break;
        case 'spin': ok = val >= g.n; break;
        case 'gap': ok = val === g.gap; break;
        case 'trickgap': ok = val.gap === g.gap && val.names.includes(g.trick); break;
        case 'letters': case 'tape': case 'special': ok = true; break;
      }
      if (ok) { prog.goals.push(i); this.run.done.push(i); persist(); A.sfx('goal'); this.ui.goalDone(g, this); }
    });
  }
  goalsTotal() { let n = 0; for (const p of PARKS) n += (save.parks[p.id] && save.parks[p.id].goals.length) || 0; return n; }
  parkUnlocked(i) { if (i === 0) return true; const prev = PARKS[i - 1]; return ((save.parks[prev.id] && save.parks[prev.id].goals.length) || 0) >= 5; }

  endRun() {
    this.state = 'results'; this.input.enabled = false; A.setRoll(0, false); A.setGrind(false); A.sfx('end');
    const run = this.run, park = this.park;
    const prog = save.parks[park.id] || (save.parks[park.id] = { goals: [], best: 0 });
    const newBest = run.score > (prog.best || 0) && this.mode !== 'free';
    if (newBest) prog.best = run.score;
    save.best = Math.max(save.best || 0, run.score);
    save.runs = (save.runs || 0) + 1;
    persist();
    if (this.mode === 'duel') { this.duel.scores[this.duel.cur] = run.score; this.duel.cur++; }
    this.ui.results(this, { score: run.score, newBest, done: run.done, bestCombo: run.bestCombo });
  }
}
