// Spielablauf: Park laden, Modi (Karriere, Highscore, Freies Fahren, Duell), Ziele, Kamera, Wertung.
import { Vector3, Color3, Matrix } from '@babylonjs/core/Maths/math';
import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera';
import { createScene, addPipeline } from './gfx.js';
import { buildWorld } from './world.js';
import { makeBoard } from './board.js';
import { makeSkater } from './rig.js';
import { FX } from './fx.js';
import { Skater } from './skater.js';
import { PARKS, SKATERS, BOARDS, customSkater, RIVALS, COMP_BASE } from './parks.js';
import * as A from './audio.js';
import { save, persist } from './save.js';
import { Editor } from './editor.js';
import { Recorder, Player } from './replay.js';

const RUN_TIME = 120, DUEL_TIME = 60, COMP_TIME = 60, SKATE_TIME = 20;
const STAT_KEYS = ['speed', 'ollie', 'spin', 'balance', 'air'];
const HZ_MIN = 24;
const NOINPUT = { x: 0, y: 0, rx: 0, ry: 0, down: () => false, pressed: () => false, released: () => false };

export class Game {
  constructor(engine, input, ui) {
    this.save = save;
    this.engine = engine; this.input = input; this.ui = ui;
    this.settings = save.settings;
    this.scene = null; this.state = 'boot'; this.parkIdx = 0; this.mode = 'career'; this.orbit = 0;
    this.camDist = { near: 3.4, normal: 4.3, far: 5.4 };
    this.custom = null; this.editor = new Editor(this); this.rec = null; this.player = null;
    engine.runRenderLoop(() => this.frame());
    addEventListener('resize', () => engine.resize());
  }

  get skaterDef() { return save.skater === -1 ? customSkater(save.custom) : (SKATERS[save.skater] || SKATERS[0]); }
  // Stat-Punkte: je erfülltes Ziel 1, je Marke 1, je Medaille 1–3; pro Skater frei verteilbar
  statPoints() { let n = this.goalsTotal(); for (const k in save.coins) n += save.coins[k].length; for (const k in save.medals) n += save.medals[k] || 0; return n; }
  spentFor(id) { const s = save.spent[id] || {}; return STAT_KEYS.reduce((a, k) => a + (s[k] || 0), 0); }
  statsFor(def) { const s = save.spent[def.id] || {}, o = {}; for (const k of STAT_KEYS) o[k] = Math.min(10, def.stats[k] + (s[k] || 0)); return o; }
  addStat(def, k) {
    const cur = this.statsFor(def)[k]; if (cur >= 10 || this.spentFor(def.id) >= this.statPoints()) return false;
    const s = save.spent[def.id] || (save.spent[def.id] = {}); s[k] = (s[k] || 0) + 1; persist(); if (this.skater) this.skater.st[k] = cur + 1; return true;
  }
  resetStats(def) { delete save.spent[def.id]; persist(); if (this.skater) Object.assign(this.skater.st, this.statsFor(def)); }
  get park() { return this.custom || PARKS[this.parkIdx]; }

  // ------------------------------------------------------------ Laden
  async load(parkIdx, def = null) {
    const token = (this._tok = (this._tok || 0) + 1);
    this.ui.loading(true, (def || PARKS[parkIdx]).name);
    await new Promise(r => setTimeout(r, 30));
    if (this.scene) { A.setGrind(false); A.setRoll(0, false); this.scene.dispose(); this.scene = null; this.skater = null; }
    this.parkIdx = parkIdx; this.custom = def; this.rec = null;
    const park = def || PARKS[parkIdx];
    const S = createScene(this.engine, park, this.settings.quality);
    this.scene = S.scene; this.shadow = S.shadow; this.Q = S.Q; this.sun = S.sun;
    const W = buildWorld(this, park);
    this.level = W.level; this.items = W.items;
    // Kamera
    const cam = this.cam = new FreeCamera('cam', new Vector3(0, 4, -8), this.scene);
    cam.minZ = 0.08; cam.maxZ = 1200; cam.fov = 1.05; cam.inputs.clear();
    this.post = addPipeline(this.scene, cam, this.Q, park);
    this.fx = new FX(this.scene, this.Q && this.Q.scale > 1.3);
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
    this.skater = new Skater(this, rig, board, this.statsFor(def));
    this.skater.apply(0);
  }

  // ------------------------------------------------------------ Modi
  async showcase(parkIdx = 0) {           // Hintergrund im Menü
    this.state = 'menu'; this.input.enabled = false; if (this.editor.active || this.editor.testing) this.editor.leave();
    if (!this.scene || this.parkIdx !== parkIdx || this.custom) await this.load(parkIdx);
    const sp = this.park.spawn; this.skater.reset(sp);
    this.orbit = 0;
  }
  async start(mode, parkIdx, players, opts = {}) {
    this.mode = mode; A.initAudio();
    if (!(opts.keep && this.scene)) await this.load(parkIdx, opts.def || null); else this.camState = null;
    this.run = { t: mode === 'free' ? Infinity : mode === 'duel' ? DUEL_TIME : mode === 'comp' ? COMP_TIME : mode === 'skate' ? SKATE_TIME : RUN_TIME, score: 0, best: 0, letters: new Set(), tape: false, gaps: new Set(), done: [], maxGrind: 0, maxManual: 0, maxLip: 0, ending: 0, bestCombo: 0, tricks: new Set(), bails: 0 };
    if (mode === 'duel') { this.duel = this.duel && this.duel.parkIdx === parkIdx && players == null ? this.duel : { parkIdx, players: players || 2, cur: 0, scores: [] }; }
    if (mode === 'comp') { if (!this.comp || this.comp.parkIdx !== parkIdx || players === 'new' || this.comp.run >= 3) this.comp = { parkIdx, run: 0, scores: [], rivals: this.makeRivals(parkIdx) }; }
    if (mode === 'skate') { if (!this.skate || players != null) this.skate = { parkIdx, players: players || 2, letters: Array(players || 2).fill(0), cur: 0, round: [], turn: 0 }; }
    const coinsGot = save.coins[this.park.id] || [];
    for (const it of this.items) {
      it.got = false;
      const show = it.kind === 'letter' ? mode !== 'skate' : it.kind === 'coin' ? (mode === 'career' || mode === 'free') && !coinsGot.includes(it.i) : (mode === 'career' || mode === 'free');
      it.node.setEnabled(show);
    }
    // Bereits erledigte Karriereziele: Sammelobjekte trotzdem zeigen (für Punkte), Kassette nur wenn noch offen
    this.skater.reset(opts.spawn || this.park.spawn); this.skater.special = 0; this.skater.holder.setEnabled(true);
    this.rec = new Recorder(this);
    this.state = 'play'; this.input.enabled = true; this.input.clear();
    this.ui.startRun(this);
    A.playMusic(this.settings.track >= 0 ? this.settings.track : this.park.music);
    this.paused = false;
  }
  restart() { this.start(this.mode, this.parkIdx, this.mode === 'comp' ? 'new' : this.mode === 'skate' && this.skate ? this.skate.players : undefined, this.custom ? { def: this.custom, keep: true } : {}); }
  pause(on) {
    if (this.state !== 'play' && this.state !== 'ending') return;
    this.paused = on; this.ui.pause(on, this);
    if (on) { A.setRoll(0, false); A.setGrind(false); }
    this.input.clear();
  }
  quit() { if (this.editor.active || this.editor.testing) this.editor.leave(); this.state = 'menu'; this.paused = false; A.stopMusic(); A.setRoll(0, false); A.setGrind(false); this.input.enabled = false; }

  // ------------------------------------------------------------ Schleife
  frame() {
    if (!this.scene) return;
    const dt = Math.min(0.05, this.engine.getDeltaTime() / 1000 || 0.016);
    this.input.poll();
    if (this.state === 'play' || this.state === 'ending') {
      if (this.input.pressed('pause')) this.pause(!this.paused);
      if (this.input.pressed('goals') && !this.paused) this.ui.toggleGoals(this);
      if (!this.paused) this.tick(dt);
    } else if (this.state === 'edit') {
      this.editor.frame(dt);
    } else if (this.state === 'replay' && this.player) {
      this.player.frame(dt);
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
    if (this.mode === 'skate' && run.turnDone != null && this.state === 'play') { run.turnDone += dt; if (run.turnDone > 1.2) return this.endRun(); }
    // Grind/Manual-Dauer
    if (sk.grind) { run.maxGrind = Math.max(run.maxGrind, sk.grind.time + (sk.grind.carry || 0)); this.goalCheck('grindTime', run.maxGrind); }
    if (sk.manual) { run.maxManual = Math.max(run.maxManual, sk.manual.t); this.goalCheck('manualTime', run.maxManual); }
    if (sk.grind && sk.grind.lip) { run.maxLip = Math.max(run.maxLip, sk.grind.time); this.goalCheck('lipTime', run.maxLip); }
    // Sammeln
    for (const it of this.items) {
      if (it.got || !it.node.isEnabled()) continue;
      const hp = sk.holder.position;
      if (Vector3.DistanceSquared(new Vector3(hp.x, hp.y + 0.9, hp.z), it.pos) < 1.35 * 1.35) this.collect(it);
    }
    // Ton
    A.setRoll(sk.speed, sk.mode === 'ground');
    if (this.fx) this.fx.update(sk);
    this.updateCamera(dt);
    if (this.rec) this.rec.add(dt);
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
    else if (sk.mode === 'grind' && sk.grind && sk.grind.lip) want = st.yaw;
    else if (sk.mode === 'grind' || sk.mode === 'wall') want = Math.atan2(sk.vel.x, sk.vel.z);
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
    const tall = this.engine.getRenderWidth() < this.engine.getRenderHeight(), back = dist * (tall ? 0.96 : 0.92) + Math.min(1.4, sp * 0.07), up = (tall ? 1.75 : 1.4) + Math.min(0.5, sp * 0.018) + (sk.mode === 'air' ? 0.25 : 0) - this.input.ry * 0.8;
    let tx = p.x - fx * back, tz = p.z - fz * back, ty = p.y + up;
    // Kamera nicht in Geometrie: von der Figur nach hinten tasten
    const steps = 12; let lastOk = 0;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps, x = p.x + (tx - p.x) * t, z = p.z + (tz - p.z) * t, y = p.y + 1.2 + (ty - p.y - 1.2) * t;
      if (L.height(x, z) > y - 0.35) break; lastOk = t;
    }
    if (lastOk < 1) { const t = Math.max(0.25, lastOk); tx = p.x + (tx - p.x) * t; tz = p.z + (tz - p.z) * t; ty = Math.max(ty, L.height(tx, tz) + 0.6, p.y + 1.6); }
    ty = Math.max(ty, L.height(tx, tz) + 0.5);
    const target = new Vector3(p.x + fx * 2.2, p.y + 1.05 + (sk.mode === 'air' ? 0.15 : 0), p.z + fz * 2.2);
    if (!st.pos) { st.pos = new Vector3(tx, ty, tz); st.look = target.clone(); }
    const kp = 1 - Math.exp(-(sk.mode === 'air' ? 5 : 9) * dt);
    st.pos.x += (tx - st.pos.x) * kp; st.pos.z += (tz - st.pos.z) * kp; st.pos.y += (ty - st.pos.y) * (1 - Math.exp(-(sk.mode === 'air' ? 3 : 7) * dt));
    // nie unter die Oberfläche
    st.pos.y = Math.max(st.pos.y, L.height(st.pos.x, st.pos.z) + 0.45);
    Vector3.LerpToRef(st.look, target, 1 - Math.exp(-12 * dt), st.look);
    cam.position.copyFrom(st.pos);
    // Wackeln bei Landung/Sturz, Schwung-Neigung in Kurven, Sichtfeld wächst mit dem Tempo
    st.shake = Math.max(0, (st.shake || 0) - dt * 2.6);
    if (st.shake > 0.01) { const a = st.shake * st.shake * 0.09, t = performance.now() / 1000; cam.position.x += Math.sin(t * 61) * a; cam.position.y += Math.sin(t * 73 + 1) * a; cam.position.z += Math.cos(t * 67) * a; }
    cam.setTarget(st.look);
    const turn = d * k; st.roll = (st.roll || 0) + ((sk.mode === 'ground' ? Math.max(-0.06, Math.min(0.06, -turn * 0.05)) : 0) - (st.roll || 0)) * (1 - Math.exp(-4 * dt));
    cam.rotation.z = st.roll;
    st.punch = Math.max(0, (st.punch || 0) - dt * 1.5);
    const fovT = 0.98 + Math.min(0.3, sp * 0.019) + (sk.special >= 1 ? 0.05 : 0) + st.punch * 0.12;
    st.fov += (fovT - st.fov) * (1 - Math.exp(-3.5 * dt));
    // Hochformat: horizontales Sichtfeld festhalten, sonst sieht man am Handy kaum, wohin man fährt
    const portrait = this.engine.getRenderWidth() < this.engine.getRenderHeight();
    cam.fovMode = portrait ? 1 : 0; cam.fov = portrait ? st.fov * 0.98 : st.fov;
  }

  // Bildschirmposition eines Punkts über dem Skater (für die Balance-Anzeige)
  screenPos(sk, h) {
    const p = sk.holder.position, v = Vector3.Project(new Vector3(p.x, p.y + h, p.z), Matrix.IdentityReadOnly, this.scene.getTransformMatrix(), this.cam.viewport.toGlobal(this.engine.getRenderWidth(), this.engine.getRenderHeight()));
    const k = innerWidth / this.engine.getRenderWidth();
    return v.z > 0 && v.z < 1 ? { x: v.x * k, y: v.y * k } : null;
  }
  shake(v) { if (this.camState) this.camState.shake = Math.max(this.camState.shake || 0, Math.min(1.2, v)); }
  punch(v) { if (this.camState) this.camState.punch = Math.max(this.camState.punch || 0, v); }
  // ------------------------------------------------------------ Ereignisse vom Skater
  onTrick(e, special) { this.ui.trick(e, special); if (this.rec) this.rec.event(e.name, special ? 'spec' : ''); if (special) this.skater.special = 0; }
  onBank(v, list) {
    const run = this.run; if (!run) return;
    if (this.rec && this.state !== 'replay') this.rec.event('+' + Math.round(v).toLocaleString('de-DE'), 'bank');
    if (this.mode === 'skate' && run.turnDone != null) return;
    run.score += v; run.bestCombo = Math.max(run.bestCombo, v);
    this.ui.bank(v, list);
    if (v >= 1000) A.sfx('bank');
    this.goalCheck('score', run.score); this.goalCheck('combo', v);
    // Drehungen
    for (const e of list) { const m = /^(\d{3,4}) /.exec(e.name); if (m) this.goalCheck('spin', +m[1]); if (e.special) this.goalCheck('special', 1); this.goalCheck('trick', e.name); run.tricks.add(e.name.replace(/^\d{3,4} /, '')); }
    if (this.mode === 'skate' && run.turnDone == null) run.turnDone = 0;
    // Trick über Lücke
    if (this._trickGaps) { for (const tg of this._trickGaps) this.goalCheck('trickgap', tg); this._trickGaps = null; }
  }
  onBail(why, lost) { this.shake(1); if (this.fx) this.fx.land(1); if (this.rec) this.rec.event(why, 'fail'); A.sfx('bail'); this.ui.bail(why, lost); this._trickGaps = null; if (this.run) { this.run.bails++; if (this.mode === 'skate' && this.run.turnDone == null) this.run.turnDone = -0.6; } }
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
    else if (it.kind === 'coin') { const c = save.coins[this.park.id] || (save.coins[this.park.id] = []); if (!c.includes(it.i)) c.push(it.i); persist(); this.ui.flash('Stat-Punkt!'); this.ui.feed('+1 Stat-Punkt – im Skater-Menü verteilen', 'goal'); }
    else { run.tape = true; this.goalCheck('tape', 1); this.ui.flash('Kassette gefunden!'); }
  }
  animateItems(dt) {
    if (!this.items) return; const t = performance.now() / 1000;
    for (const it of this.items) if (it.node.isEnabled()) { it.node.rotation.y = t * 1.6; it.node.position.y = it.pos.y + Math.sin(t * 2 + it.pos.x) * 0.08; }
  }

  // ------------------------------------------------------------ Replay
  canReplay() { return !!(this.rec && this.rec.count > HZ_MIN); }
  openReplay(menu) {
    if (!this.canReplay()) return false;
    this.player = new Player(this, this.rec); this.replayFrom = { state: this.state, menu };
    this.state = 'replay'; this.input.clear(); this.ui.replayHud(true, this.player);
    return true;
  }
  closeReplay() {
    const p = this.player; if (!p) return; p.restore(); this.player = null; this.ui.replayHud(false);
    const f = this.replayFrom || { state: 'results', menu: 'mResults' };
    this.state = f.state; this.input.clear(); this.ui.show(f.menu || null, false);
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
        case 'lipTime': ok = val >= g.n; break;
        case 'trick': ok = val.toLowerCase().includes(g.trick.toLowerCase()); break;
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
    const newBest = run.score > (prog.best || 0) && (this.mode === 'career' || this.mode === 'score');
    if (newBest) prog.best = run.score;
    save.best = Math.max(save.best || 0, run.score);
    save.runs = (save.runs || 0) + 1;
    persist();
    if (this.mode === 'duel') { this.duel.scores[this.duel.cur] = run.score; this.duel.cur++; }
    if (this.mode === 'comp') this.judge(run);
    if (this.mode === 'skate') this.skateTurn(run);
    this.ui.results(this, { score: run.score, newBest, done: run.done, bestCombo: run.bestCombo });
  }

  // ------------------------------------------------------------ Wettbewerb: 3 Läufe, Jury, die besten 2 zählen
  makeRivals(pi) {
    const base = COMP_BASE[pi] ?? 80, names = RIVALS.slice().sort(() => Math.random() - 0.5).slice(0, 3);
    return names.map((n, i) => ({ name: n, score: +(base - i * 5 + (Math.random() * 3 - 1.5)).toFixed(1) }));
  }
  judge(run) {
    const c = this.comp, pts = run.score;
    const base = 30 + 18 * Math.log10(1 + pts / 2000) + Math.min(15, run.tricks.size * 0.6) - run.bails * 2.5;
    const j = [0, 1, 2].map(() => Math.max(0, Math.min(99.9, base + (Math.random() * 3 - 1.5))));
    const avg = +(j.reduce((a, b) => a + b, 0) / 3).toFixed(1);
    c.scores.push({ pts, judges: j.map(x => +x.toFixed(1)), avg }); c.run++;
    if (c.run >= 3) {
      const best2 = c.scores.map(s => s.avg).sort((a, b) => b - a).slice(0, 2);
      c.final = +((best2[0] + best2[1]) / 2).toFixed(1);
      const table = [{ name: 'Du', score: c.final, me: true }, ...c.rivals].sort((a, b) => b.score - a.score);
      c.table = table; c.place = table.findIndex(t => t.me) + 1;
      const medal = c.place <= 3 ? 4 - c.place : 0, id = this.park.id;
      c.newMedal = medal > (save.medals[id] || 0);
      if (c.newMedal) { save.medals[id] = medal; persist(); }
    }
  }
  medalsGold() { return Object.values(save.medals).filter(m => m >= 3).length; }

  // ------------------------------------------------------------ S-K-A-T-E: je Runde ein Combo-Versuch, die schwächste Combo bekommt einen Buchstaben
  skateTurn(run) {
    const k = this.skate; k.round[k.cur] = run.turnDone != null && run.turnDone >= 0 ? run.score : 0;
    const alive = k.letters.map((l, i) => l < 5 ? i : -1).filter(i => i >= 0);
    let next = alive.find(i => i > k.cur && k.round[i] == null);
    if (next == null) {
      // Runde vorbei: schwächste Combo (eindeutig) bekommt einen Buchstaben
      const sc = alive.map(i => k.round[i] || 0), min = Math.min(...sc), low = alive.filter(i => (k.round[i] || 0) === min);
      k.last = { scores: alive.map(i => [i, k.round[i] || 0]), loser: low.length === 1 ? low[0] : -1 };
      if (low.length === 1) k.letters[low[0]]++;
      const still = k.letters.map((l, i) => l < 5 ? i : -1).filter(i => i >= 0);
      if (still.length <= 1) { k.winner = still[0]; save.skate.games++; persist(); }
      k.round = []; k.turn++; next = still[0];
    }
    k.cur = next;
  }
}
