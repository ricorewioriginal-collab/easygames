// Winzflitzer 3D – Spielablauf: Rennen, Kamera, HUD, Modi (Meisterschaft, Kopf-an-Kopf, Mehrspieler, Einzelrennen, Zeitfahren), Menüs
'use strict';
(function () {
  var WF = window.WF, $ = function (id) { return document.getElementById(id); };
  var TOUCH = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;

  // ---------------- Speicherstand
  var SAVE = WF.store.get('save', null) || {};
  SAVE.best = SAVE.best || {}; SAVE.stats = SAVE.stats || { races: 0, wins: 0, champs: 0, duels: 0 };
  var SET = Object.assign({ sfx: true, music: true, q: TOUCH ? 1 : 2, zoom: 1, touch: 'dir', pad: 'classic', diff: 1 }, WF.store.get('set', {}));
  function save() { WF.store.set('save', SAVE); }
  function saveSet() { WF.store.set('set', SET); }
  WF.Audio.sfx = SET.sfx; WF.Audio.music = SET.music;
  var DIFF = [0.88, 0.95, 1.02], DIFFN = ['Leicht', 'Normal', 'Schwer'];

  // ---------------- Grafik
  var renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: SET.q >= 2, powerPreference: 'high-performance' }); }
  catch (e) { document.body.innerHTML = '<p style="padding:30px;font:18px system-ui;color:#fff">WebGL wird nicht unterstützt – bitte einen aktuellen Browser verwenden.</p>'; return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, [1, 1.5, 2][SET.q]));
  $('view').appendChild(renderer.domElement);
  var camera = new THREE.PerspectiveCamera(40, 1, 1, 700);
  function resize() { var w = innerWidth, h = innerHeight; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  addEventListener('resize', resize); resize();

  // ---------------- Rennen
  var race = null, paused = false;
  var hemi = null;

  function disposeScene(sc) {
    sc.traverse(function (o) {
      if (o.geometry) o.geometry.dispose();
      if (o.material) { var ms = Array.isArray(o.material) ? o.material : [o.material]; ms.forEach(function (m) { if (m._keep) return; if (m.map && m.map._own) m.map.dispose(); m.dispose(); }); }
    });
  }
  WF.vcMat()._keep = true;

  var trackCache = {};
  function getTrack(id) { return trackCache[id] || (trackCache[id] = new WF.Track(WF.trackById(id))); }

  // Richtzeit: ein schneller Computer-Fahrer fährt die Strecke ohne Grafik ab
  var parCache = {};
  function parTime(id, laps) {
    var k = id + laps; if (parCache[k]) return parCache[k];
    var T = getTrack(id), sim = new WF.Sim(T, { laps: laps }), c = sim.add(new WF.Car(sim, { id: 'par', skill: 1, style: 'sauber' }));
    c.lane = 0; c.place(T.gridSlot(0)); sim.started = true;
    for (var i = 0; i < 60 * 240 && !c.done; i++) sim.step(1 / 60);
    return (parCache[k] = c.done ? c.time : T.length * laps / 10);
  }

  function Race(cfg) {
    this.cfg = cfg; this.kind = cfg.kind;
    var T = this.T = getTrack(cfg.track);
    var scene = this.scene = new THREE.Scene();
    var th = T.theme;
    scene.add(new THREE.HemisphereLight(0xffffff, new THREE.Color(th.groundCol).multiplyScalar(0.6), 0.75));
    var sun = new THREE.DirectionalLight(0xffffff, 0.75); sun.position.set(30, 80, 40); scene.add(sun);
    this.world = WF.buildWorld(scene, T);
    this.fx = new WF.FX(scene, [60, 140, 220][SET.q]);
    var sim = this.sim = new WF.Sim(T, { laps: cfg.laps || T.def.laps });
    this.cars = []; this.humans = [];
    var self = this, slot = 0, mul = cfg.skillMul || 1;
    (cfg.players || []).forEach(function (p, k) {
      var c = sim.add(new WF.Car(sim, { id: 'p' + k, name: p.drv.name, color: p.drv.col, human: true, pi: k, skill: 1, driver: p.drv }));
      c.dev = p.dev; self.humans.push(c);
    });
    (cfg.cpus || []).forEach(function (d, k) { sim.add(new WF.Car(sim, { id: 'c' + k, name: d.name, color: d.col, skill: Math.min(1.04, d.skill * mul), style: d.style, driver: d })); });
    // Startaufstellung: Menschen hinten (wie im Original: man muss sich nach vorn kämpfen), im Duell gemischt
    var order = sim.cars.slice();
    if (this.kind === 'race') order.sort(function (a, b) { return (a.human ? 1 : 0) - (b.human ? 1 : 0) || a.skill - b.skill; });
    order.forEach(function (c) { c.place(T.gridSlot(slot++)); });
    sim.cars.forEach(function (c) {
      var m = WF.makeVehicle(c.type, c.color); scene.add(m); scene.add(m.shadow); c.mesh = m;
      if (c.human && (self.humans.length > 1 || self.kind === 'duel' || self.kind === 'race')) { var mk = marker(c.color, self.humans.length > 1 ? c.pi : -1); scene.add(mk); c.marker = mk; }
      self.cars.push(c);
    });
    // Geist (Zeitfahren)
    this.rec = []; this.recT = 0;
    if (cfg.ghost && cfg.ghost.length) { var g = WF.makeVehicle(T.theme.veh, '#ffffff'); var gm = new THREE.MeshLambertMaterial({ vertexColors: true, transparent: true, opacity: 0.35, depthWrite: false }); g.traverse(function (o) { if (o.isMesh && o !== g.shadow) o.material = gm; }); scene.add(g); this.ghostMesh = g; this.ghost = cfg.ghost; }
    // Kamera
    var lead = this.humans[0] || sim.cars[0];
    this.cam = { x: lead.x, z: lead.z, y: lead.y, lx: 0, lz: 0 };
    this.phase = 'count'; this.cd = cfg.quickStart ? 1.6 : 3.4; this.cdShown = -1; this.t = 0; this.post = 0;
    this.points = cfg.points ? JSON.parse(JSON.stringify(cfg.points)) : null; this.roundT = 0;
    this.miniBg = drawMiniBg(T);
    this.lastFire = {};
    if (this.kind !== 'attract') {
      WF.Audio.engines(this.humans.map(function () { return T.theme.veh; }));
      WF.Audio.song(T.theme.music);
    }
    this.vtmp = new THREE.Vector3(); this.gtmp = {};
    this.lapShown = 0;
  }

  function marker(col, pi) {
    var b = new WF.Builder(); b.add(WF.G.cone(4), col, 0, 0, 0, Math.PI, 0, 0, 0.55, 0.6, 0.55); b.add(WF.G.cone(4), '#ffffff', 0, 0.05, 0, Math.PI, 0, 0, 0.32, 0.4, 0.32);
    var m = b.mesh(); m.userData.pi = pi; return m;
  }

  Race.prototype.dispose = function () { disposeScene(this.scene); WF.Audio.engines([]); };

  Race.prototype.readInput = function (c) {
    var o = c.inp, dev = c.dev;
    if (dev === 'any') {
      var best = { thr: 0, steer: 0, fire: false, dir: null, brake: false }, tmp = {};
      var devs = ['kb', 'touch']; var P = WF.Input.pads(); for (var i = 0; i < P.length; i++) if (P[i]) devs.push('pad' + i);
      devs.forEach(function (d) {
        if (d === 'touch' && !TOUCH) return;
        WF.Input.read(d, tmp, { padMode: SET.pad, autoGas: false });
        if (Math.abs(tmp.thr) > Math.abs(best.thr)) best.thr = tmp.thr;
        if (Math.abs(tmp.steer) > Math.abs(best.steer)) best.steer = tmp.steer;
        if (tmp.fire) best.fire = true; if (tmp.dir && !best.dir) { best.dir = tmp.dir; best.brake = tmp.brake; }
      });
      o.thr = best.thr; o.steer = best.steer; o.fire = best.fire; o.dir = best.dir; o.brake = best.brake;
    } else WF.Input.read(dev, o, { padMode: SET.pad });
    if (o.fire && !this.lastFire[c.id]) this.sim.fire(c);
    this.lastFire[c.id] = o.fire;
  };

  Race.prototype.update = function (dt) {
    var sim = this.sim, self = this;
    this.t += dt;
    if (this.phase === 'count') {
      this.cd -= dt;
      var n = Math.ceil(this.cd);
      if (n !== this.cdShown && this.kind !== 'attract') {
        this.cdShown = n;
        if (n >= 1 && n <= 3) { msg(String(n), '', 0.8); WF.Audio.play('beep'); }
      }
      if (this.cd <= 0) {
        this.phase = 'run'; sim.started = true;
        if (this.kind !== 'attract') { msg('LOS!', '', 0.8); WF.Audio.play('go'); }
      }
    }
    for (var i = 0; i < this.humans.length; i++) { var h = this.humans[i]; if (h.human) this.readInput(h); }
    if (this.phase === 'roundEnd') { this.post -= dt; if (this.post <= 0) this.nextRound(); }
    var steps = Math.ceil(dt / (1 / 60)), hstep = dt / steps;
    for (var s = 0; s < steps; s++) sim.step(hstep);
    this.handleEvents();
    if (this.phase === 'run' || this.phase === 'post') this.rules(dt);
    this.recordGhost(dt);
  };

  Race.prototype.recordGhost = function (dt) {
    if (this.kind !== 'time' || !this.humans[0]) return;
    var c = this.humans[0]; if (c.lap < 1 || c.done) return;
    var want = Math.floor((this.sim.t - c.lapStart) / 0.05);
    while (this.rec.length <= want && this.rec.length < 4000) this.rec.push([+c.x.toFixed(2), +c.y.toFixed(2), +c.z.toFixed(2), +c.a.toFixed(2)]);
  };

  Race.prototype.handleEvents = function () {
    var ev = this.sim.events, fx = this.fx, self = this, th = this.T.def.theme;
    var dust = { breakfast: '#e8d5b0', desk: '#e6e6e6', bath: '#ffffff', garden: '#9ccf8f', sandbox: '#e3c98a', pool: '#d6f5e3', workbench: '#ead7ae', kids: '#d6d0ff' }[th];
    for (var i = 0; i < ev.length; i++) {
      var e = ev[i], c = e.a, hum = c && c.human, att = this.kind === 'attract', near = c && c.x != null && Math.hypot(c.x - this.cam.x, c.z - this.cam.z) < 30;
      switch (e.t) {
        case 'wall': if (!att && near) WF.Audio.play('wall', Math.min(1, e.b / 14)); fx.burst(c.x, c.y + 0.4, c.z, 4, 3, 0.25, 0.35, '#ffe08a', 6); break;
        case 'bump': if (!att && near) WF.Audio.play('bump', Math.min(1, e.b / 12)); fx.burst((c.x + e.a.x) / 2, c.y + 0.5, c.z, 5, 3, 0.3, 0.4, '#ffffff', 4); break;
        case 'fall': if (!att && hum) { WF.Audio.play('fall'); msg('', 'Abgestürzt!', 1.2); } break;
        case 'lost': if (!att && hum) sub('Zurück auf die Strecke!', 1.2); break;
        case 'land': if (!att && near) WF.Audio.play('land', e.b); fx.burst(c.x, c.y + 0.1, c.z, 6, 4, 0.4, 0.5, dust, 3); break;
        case 'boost': if (!att && hum) WF.Audio.play('boost'); break;
        case 'shot': if (!att && near) WF.Audio.play('shot'); fx.burst(c.x + Math.sin(c.a), c.y + 0.6, c.z + Math.cos(c.a), 4, 4, 0.3, 0.25, '#ffd23f', 0); break;
        case 'boom': if (!att) WF.Audio.play('boom'); fx.burst(c.x, c.y, c.z, 12, 6, 0.5, 0.5, '#ff8c1a', 4); fx.burst(c.x, c.y, c.z, 6, 3, 0.7, 0.8, '#555555', -2); break;
        case 'hit': if (!att && c.human) sub('Getroffen!', 1); break;
        case 'pot': if (!att) WF.Audio.play('clack', 1); break;
        case 'clack': if (!att && near) WF.Audio.play('clack', Math.min(1, e.b / 10)); break;
        case 'lap':
          if (hum && !att) {
            var last = c.lap + 1 === this.sim.laps;
            if (this.kind === 'time' || this.kind === 'bonus') sub('Runde: ' + WF.fmtTime(e.b) + (e.b <= c.best ? '  ⭐' : ''), 1.6);
            if (last && this.kind !== 'duel') { msg('', 'Letzte Runde!', 1.4); }
            WF.Audio.play('lap');
            if (this.kind === 'time') this.lapDone(c, e.b);
          }
          break;
        case 'finish':
          if (hum && !att) {
            var place = this.sim.finishOrder.indexOf(c) + 1;
            if (this.kind === 'race') msg(place + '.', place === 1 ? 'Sieg! 🏆' : 'Ziel!', 2);
            else msg('Ziel!', WF.fmtTime(c.time), 2);
            WF.Audio.play(place <= 2 || this.kind !== 'race' ? 'finish' : 'lose');
            c.human = false; // Autopilot fährt weiter
          }
          break;
      }
    }
    ev.length = 0;
  };

  Race.prototype.lapDone = function (c, t) {
    if (!this.bestGhostT || t < this.bestGhostT) { this.bestGhostT = t; this.bestRec = this.rec; }
    this.rec = [];
  };

  // Spielregeln je Art
  Race.prototype.rules = function (dt) {
    var sim = this.sim, self = this;
    if (this.kind === 'attract') {
      if (sim.finishOrder.length || this.t > 70) this.cfg.onEnd && this.cfg.onEnd();
      return;
    }
    if (this.kind === 'race' || this.kind === 'time' || this.kind === 'bonus') {
      var allDone = this.humans.every(function (h) { return h.done; });
      if (allDone && this.phase === 'run') { this.phase = 'post'; this.post = 2.6; }
      if (this.phase === 'post') { this.post -= dt; if (this.post <= 0) { this.phase = 'done'; this.finish(); } }
      return;
    }
    if (this.kind === 'duel' && this.phase === 'run') {
      this.roundT += dt;
      var alive = sim.cars.filter(function (c) { return c.alive; });
      var lead = this.leader();
      // wer aus dem Bild fällt, ist raus
      alive.forEach(function (c) {
        if (c === lead) return;
        var v = self.vtmp.set(c.x, c.y, c.z).project(camera);
        if (Math.abs(v.x) > 1.04 || Math.abs(v.y) > 1.04 || (c.fallT > 0 && c.y < c.sim.T.theme.ground.h - 6)) {
          c.alive = false; c.mesh.visible = false; c.mesh.shadow.visible = false; if (c.marker) c.marker.visible = false;
          if (self.cars.length > 2) sub(c.name + ' ist raus!', 1.1);
          WF.Audio.play('out');
        }
      });
      alive = sim.cars.filter(function (c) { return c.alive; });
      if (alive.length <= 1 || this.roundT > 40) this.roundWon(alive.length === 1 ? alive[0] : lead);
    }
  };

  Race.prototype.leader = function () {
    var best = null;
    this.sim.cars.forEach(function (c) { if (c.alive && c.fallT <= 0 && (!best || c.prog > best.prog)) best = c; });
    return best || this.sim.cars.filter(function (c) { return c.alive; })[0] || this.sim.cars[0];
  };

  Race.prototype.roundWon = function (w) {
    var P = this.points, idx = this.sim.cars.indexOf(w), n = this.sim.cars.length;
    if (n === 2) { P.lights[idx] = Math.min(8, P.lights[idx] + 1); P.lights[1 - idx] = Math.max(0, P.lights[1 - idx] - 1); }
    else P.score[idx]++;
    WF.Audio.play('point');
    msg('', w.name + ' holt den Punkt!', 1.6);
    this.phase = 'roundEnd'; this.post = 1.8; this.roundWinner = w;
    var won = n === 2 ? P.lights[idx] >= 8 : P.score[idx] >= P.goal;
    if (won) { this.matchWinner = w; this.post = 2.4; msg('🏆', w.name + ' gewinnt!', 2.4); WF.Audio.play('finish'); }
  };

  Race.prototype.nextRound = function () {
    if (this.matchWinner) { this.phase = 'done'; this.finish(); return; }
    var T = this.T, w = this.roundWinner, i0 = T.safeIndex(w.idx), self = this;
    var cars = this.sim.cars.slice().sort(function (a, b) { return a === w ? -1 : b === w ? 1 : (b.prog || 0) - (a.prog || 0); });
    cars.forEach(function (c, k) {
      var back = Math.round((Math.floor(k / 2) * 3.2) / T.ds), i = (i0 - back + T.N) % T.N, side = (k % 2 ? 1 : -1) * T.w * 0.42;
      c.place({ x: T.x[i] + T.tz[i] * side, z: T.z[i] - T.tx[i] * side, h: T.h[i], a: T.heading(i), i: i });
      c.alive = true; c.mesh.visible = true; c.mesh.shadow.visible = true; if (c.marker) c.marker.visible = true;
      c.stun = 0; c.ghost = 0; c.boost = 0; c.prog = (w.prog || 0) - k; c.lap = w.lap; c.half = w.half;
    });
    this.sim.started = false; this.phase = 'count'; this.cd = 1.6; this.cdShown = -1; this.roundT = 0;
    this.cam.x = w.x; this.cam.z = w.z;
  };

  Race.prototype.finish = function () {
    var sim = this.sim, res = { kind: this.kind, track: this.cfg.track };
    if (this.kind === 'duel') { res.winner = this.matchWinner; res.cars = sim.cars; res.points = this.points; }
    else {
      var fin = sim.finishOrder.slice(), rest = sim.order().filter(function (c) { return fin.indexOf(c) < 0; });
      res.order = fin.concat(rest);
      res.humans = this.humans;
      if (this.kind === 'time' || this.kind === 'bonus') { var h = this.humans[0]; res.time = h.time; res.best = h.best; res.laps = h.lapTimes; res.ghost = this.bestRec; res.ghostT = this.bestGhostT; }
    }
    this.cfg.onEnd(res);
  };

  // ---------- Darstellung
  Race.prototype.render = function (dt) {
    var T = this.T, cam = this.cam, sim = this.sim, g = this.gtmp, fx = this.fx, t = this.t, self = this;
    var th = T.def.theme, fly = T.theme.veh === 'heli', boat = T.theme.water;
    sim.cars.forEach(function (c) {
      var m = c.mesh; if (c.alive === false) { m.visible = false; return; }
      m.visible = !(c.ghost > 0 && Math.floor(t * 12) % 2);
      var bob = 0;
      if (fly) bob = 1.5 + Math.sin(t * 3 + c.x) * 0.12;
      if (boat) bob = Math.sin(t * 3.2 + c.x * 0.7) * 0.06 - 0.12;
      m.position.set(c.x, c.y + bob, c.z); m.rotation.y = c.a;
      var sp = c.speed, pitch = c.grounded ? WF.clamp(-c.vy / Math.max(4, sp) * 0.9, -0.5, 0.5) : WF.clamp(-c.vy * 0.05, -0.6, 0.6);
      if (boat) pitch -= Math.min(0.18, sp * 0.012);
      if (fly) pitch = WF.clamp(sp * 0.02, 0, 0.3) * (c.inp.thr < 0 ? -1 : 1);
      m.body.rotation.x = WF.lerp(m.body.rotation.x, pitch, 0.25);
      m.body.rotation.z = WF.lerp(m.body.rotation.z, WF.clamp(c.inp.steer * sp * 0.012 * (fly ? 3 : 1), -0.35, 0.35), 0.2);
      if (m.rotor) { m.rotor.rotation.y += dt * 40; m.tail.rotation.x += dt * 50; }
      if (m.turret) m.turret.position.z = -0.05 - Math.max(0, c.cool - 0.9) * 0.6;
      // Schatten
      if (c.fallT > 0) m.shadow.visible = false;
      else { T.ground(c.x, c.z, c.y + 0.2, 0.5, g, 0); m.shadow.visible = g.h > -1e9; m.shadow.position.set(c.x, g.h + 0.06, c.z); m.shadow.rotation.z = c.a; var sc = fly ? 0.8 : 1; m.shadow.scale.set(sc, sc, 1); }
      if (c.marker) { c.marker.position.set(c.x, c.y + (fly ? 3.6 : 2.4) + Math.sin(t * 5) * 0.15, c.z); c.marker.visible = c.fallT <= 0; }
      // Partikel
      if (c.boost > 0 && Math.random() < 0.7) fx.spawn(c.x - Math.sin(c.a) * 0.8, c.y + 0.35 + bob, c.z - Math.cos(c.a) * 0.8, -c.vx * 0.1, 0.5, -c.vz * 0.1, 0.32, 0.3, Math.random() < 0.5 ? '#ffd23f' : '#ff7a1a', 0);
      if (c.grounded && c.fallT <= 0 && !fly && (c.slip > 3.5 || (boat && sp > 6) || (th === 'sandbox' && sp > 7)) && Math.random() < (boat ? 0.5 : 0.35))
        fx.spawn(c.x - Math.sin(c.a) * 0.6, c.y + 0.15, c.z - Math.cos(c.a) * 0.6, (Math.random() - 0.5) * 2, 1 + Math.random(), (Math.random() - 0.5) * 2, boat ? 0.35 : 0.28, 0.45, boat ? '#ffffff' : ({ breakfast: '#eadbc0', desk: '#dddddd', garden: '#9ccf8f', sandbox: '#e3c98a', pool: '#c9f0d8', workbench: '#ead7ae', kids: '#cfc8ff' }[th]), 4);
      if (fly && sp > 2 && Math.random() < 0.15) fx.spawn(c.x, c.y + 0.1, c.z, (Math.random() - 0.5) * 3, 0.3, (Math.random() - 0.5) * 3, 0.25, 0.4, '#b7e3a8', 0);
      if (c.stun > 0 && Math.random() < 0.5) fx.spawn(c.x, c.y + 0.8, c.z, 0, 1.5, 0, 0.3, 0.6, '#666666', -1);
    });
    // Billardkugeln
    if (sim.movers.length) {
      if (!this.moverMeshes) {
        this.moverMeshes = sim.movers.map(function (mv) {
          var b = new WF.Builder(); b.add(WF.G.sph(16), mv.col, 0, 0, 0, 0, 0, 0, mv.r * 2);
          b.add(WF.G.sph(10), '#ffffff', 0, 0, mv.r * 0.75, 0, 0, 0, mv.r * 0.8, mv.r * 0.8, mv.r * 0.55);
          var me = b.mesh(); self.scene.add(me); return me;
        });
      }
      sim.movers.forEach(function (mv, k) { var me = self.moverMeshes[k]; me.position.set(mv.x, mv.y + mv.r, mv.z); me.rotation.x = mv.spin; me.rotation.y = Math.atan2(mv.vx, mv.vz); me.visible = mv.y > -4; });
    }
    // Geschosse
    if (!this.shellMesh) { var sb = new WF.Builder(); sb.add(WF.G.sph(8), '#ffb703', 0, 0, 0, 0, 0, 0, 0.35, 0.35, 0.6); this.shellMeshes = []; this.shellGeo = sb.geometry(); this.shellMesh = true; }
    while (this.shellMeshes.length < sim.shells.length) { var sm = new THREE.Mesh(this.shellGeo, WF.vcMat()); this.scene.add(sm); this.shellMeshes.push(sm); }
    this.shellMeshes.forEach(function (sm, k) { var s = sim.shells[k]; sm.visible = !!s; if (s) { sm.position.set(s.x, s.y, s.z); sm.rotation.y = Math.atan2(s.vx, s.vz); } });
    // Geist
    if (this.ghostMesh) {
      var h = this.humans[0], gi = Math.floor((sim.t - (h.lapStart || 0)) / 0.05), G = this.ghost;
      if (h.lap >= 1 && gi < G.length) { var p = G[gi]; this.ghostMesh.visible = true; this.ghostMesh.position.set(p[0], p[1], p[2]); this.ghostMesh.rotation.y = p[3]; this.ghostMesh.shadow.visible = false; } else this.ghostMesh.visible = false;
    }
    fx.update(dt);
    this.world.anim.forEach(function (f) { f(t); });
    // Kamera
    var tgt = this.kind === 'duel' || this.kind === 'attract' || !this.humans.length ? this.leader() : this.humans[0];
    if (!tgt) tgt = sim.cars[0];
    var k = 1 - Math.exp(-dt * (this.kind === 'duel' ? 3.2 : 5));
    var look = this.kind === 'duel' ? 0.55 : 0.42;
    cam.lx = WF.lerp(cam.lx, tgt.vx * look, 1 - Math.exp(-dt * 2)); cam.lz = WF.lerp(cam.lz, tgt.vz * look, 1 - Math.exp(-dt * 2));
    if (tgt.fallT > 0) { cam.lx *= 0.9; cam.lz *= 0.9; }
    cam.x = WF.lerp(cam.x, tgt.x + cam.lx, k); cam.z = WF.lerp(cam.z, tgt.z + cam.lz, k); cam.y = WF.lerp(cam.y, Math.max(0, tgt.fallT > 0 ? cam.y : tgt.y), k);
    var asp = camera.aspect, wv = WF.clamp(34 * Math.sqrt(asp / 1.6), 17, 40) * [0.82, 1, 1.25][SET.zoom] * (this.kind === 'attract' ? 1.15 : 1);
    var dist = wv / (2 * Math.tan(20 * Math.PI / 180) * asp), tilt = 62 * Math.PI / 180;
    camera.position.set(cam.x, cam.y + dist * Math.sin(tilt), cam.z + dist * Math.cos(tilt));
    camera.lookAt(cam.x, cam.y, cam.z);
    renderer.render(this.scene, camera);
    if (this.kind !== 'attract') this.hud();
  };

  Race.prototype.hud = function () {
    var sim = this.sim, h = this.humans[0];
    if (!this.hudInit) {
      this.hudInit = true;
      $('hLights').innerHTML = ''; $('hPos').innerHTML = ''; $('hLap').textContent = ''; $('hTime').textContent = '';
    }
    if (this.kind === 'race' && h) {
      var ord = sim.order(), p = ord.indexOf(h) + 1;
      var ph = p + '.<small>/' + ord.length + '</small>';
      if (ph !== this._ph) { $('hPos').innerHTML = ph; this._ph = ph; }
    }
    if (h && this.kind !== 'duel') {
      var lt = 'Runde ' + Math.max(1, Math.min(sim.laps, h.lap)) + '/' + sim.laps;
      if (lt !== this._lt) { $('hLap').textContent = lt; this._lt = lt; }
      var tt = WF.fmtTime(h.done ? h.time : sim.t);
      if (this.kind === 'bonus') tt += ' / ' + WF.fmtTime(this.cfg.target);
      if (tt !== this._tt) { $('hTime').textContent = tt; this._tt = tt; }
    }
    if (this.kind === 'duel') {
      var P = this.points, key = JSON.stringify(P);
      if (key !== this._pk) {
        this._pk = key; var html = '', cars = sim.cars;
        if (cars.length === 2) { for (var i = 0; i < 8; i++) html += '<i style="background:' + (i < P.lights[0] ? cars[0].color : cars[1].color) + '"></i>'; }
        else cars.forEach(function (c, k) { var pp = ''; for (var j = 0; j < P.goal; j++) pp += '<i style="background:' + (j < P.score[k] ? c.color : 'transparent') + '"></i>'; html += '<span class="pp">' + esc(c.name) + ' ' + pp + '</span>'; });
        $('hLights').innerHTML = html;
      }
    }
    this.drawMini();
  };

  function drawMiniBg(T) {
    var c = document.createElement('canvas'); c.width = 180; c.height = 120;
    var g = c.getContext('2d'), gr = T.theme.ground, s = Math.min(170 / gr.w, 110 / gr.d), ox = 90 - gr.x * s, oz = 60 - gr.z * s;
    g.fillStyle = 'rgba(10,10,30,0.45)'; roundRect(g, 90 - gr.w * s / 2 - 4, 60 - gr.d * s / 2 - 4, gr.w * s + 8, gr.d * s + 8, 10); g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = Math.max(3, T.w * s * 1.4); g.lineJoin = 'round'; g.beginPath();
    for (var i = 0; i < T.N; i += 2) { var x = ox + T.x[i] * s, y = oz + T.z[i] * s; i ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.closePath(); g.stroke();
    g.fillStyle = '#ff2d95'; g.beginPath(); g.arc(ox + T.x[0] * s, oz + T.z[0] * s, 3, 0, 7); g.fill();
    return { c: c, s: s, ox: ox, oz: oz };
  }
  function roundRect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  var miniCtx = $('mini').getContext('2d');
  Race.prototype.drawMini = function () {
    var m = this.miniBg, g = miniCtx; g.clearRect(0, 0, 180, 120); g.drawImage(m.c, 0, 0);
    var self = this;
    this.sim.cars.forEach(function (c) {
      if (c.alive === false) return;
      g.fillStyle = c.color; g.strokeStyle = c.human || self.humans.indexOf(c) >= 0 ? '#fff' : 'rgba(0,0,0,0.6)'; g.lineWidth = 2;
      g.beginPath(); g.arc(m.ox + c.x * m.s, m.oz + c.z * m.s, self.humans.indexOf(c) >= 0 ? 5 : 3.6, 0, 7); g.fill(); g.stroke();
    });
  };

  // ---------------- HUD-Meldungen
  var msgT = 0, subT = 0;
  function msg(big, small, dur) {
    var m = $('hMsg'), s = $('hSub');
    if (big) { m.textContent = big; m.classList.remove('show'); void m.offsetWidth; m.classList.add('show'); msgT = dur; }
    if (small) { s.textContent = small; s.classList.add('show'); subT = dur; }
  }
  function sub(t, d) { msg('', t, d); }
  function tickMsg(dt) {
    if (msgT > 0) { msgT -= dt; if (msgT <= 0) $('hMsg').classList.remove('show'); }
    if (subT > 0) { subT -= dt; if (subT <= 0) $('hSub').classList.remove('show'); }
  }
  function toast(t, ms) { var e = $('toast'); e.textContent = t; e.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(function () { e.hidden = true; }, ms || 2400); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // ---------------- Hauptschleife
  var last = performance.now(), attractSkip = false, timeScale = 1;
  function frame(now) {
    requestAnimationFrame(frame);
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (document.hidden || !race) return;
    if (race.kind === 'attract') { attractSkip = !attractSkip; if (attractSkip && SET.q < 2) return; dt *= SET.q < 2 ? 2 : 1; dt = Math.min(dt, 0.05); }
    pollMenuInput();
    if (paused) return;
    race.update(dt * timeScale);
    race.render(dt);
    tickMsg(dt);
    if (race && race.humans) race.humans.forEach(function (h, i) { WF.Audio.engine(i, Math.min(1, h.speed / h.V.top), race.phase === 'run' || race.phase === 'count' || race.phase === 'post', h.boost > 0); });
  }
  requestAnimationFrame(frame);

  function startRace(cfg) {
    if (race) race.dispose();
    paused = false; $('ovPause').hidden = true;
    race = new Race(cfg);
    var play = cfg.kind !== 'attract';
    $('hud').hidden = !play;
    WF.Input.capture = play;
    if (play) {
      hideScreens();
      var gun = race.T.theme.veh === 'tank';
      var touchHuman = race.humans.some(function (h) { return h.dev === 'touch' || (h.dev === 'any' && TOUCH); });
      WF.Input.touchOn(touchHuman, SET.touch === 'keys' ? 'keys' : 'dir', gun);
      $('mini').style.display = race.kind === 'duel' && race.cars.length > 2 ? 'none' : '';
      $('hPos').style.display = race.kind === 'race' ? '' : 'none';
      $('hTime').style.display = race.kind === 'duel' ? 'none' : '';
      $('hLap').style.display = race.kind === 'duel' ? 'none' : '';
      $('hMsg').classList.remove('show'); $('hSub').classList.remove('show');
      if (TOUCH) try { var d = document.documentElement; if (!document.fullscreenElement && d.requestFullscreen) d.requestFullscreen().catch(function () {}); } catch (e) {}
    } else WF.Input.touchOn(false);
  }

  function attract() {
    var ids = WF.TRACKS.map(function (t) { return t.id; }), id = ids[(Math.random() * ids.length) | 0];
    var ds = WF.DRIVERS.slice().sort(function () { return Math.random() - 0.5; }).slice(0, 4);
    startRace({ kind: 'attract', track: id, cpus: ds, laps: 2, onEnd: function () { attract(); } });
    WF.Audio.song(8);
  }

  // ---------------- Menüs
  var stack = [], current = 'sTitle';
  function hideScreens() { document.querySelectorAll('.scr').forEach(function (s) { s.classList.remove('on'); }); current = null; }
  function show(id, noPush) {
    if (!noPush && current && current !== id) stack.push(current);
    hideScreens(); $(id).classList.add('on'); current = id;
    $('hud').hidden = true; WF.Input.touchOn(false); WF.Input.capture = false;
    if (!race || race.kind !== 'attract') attract();
    focusFirst();
  }
  function back() {
    WF.Audio.play('click');
    var id = stack.pop() || 'sTitle'; show(id, true);
  }
  function home() { stack = []; show('sTitle', true); titleStat(); }
  document.addEventListener('click', function (e) {
    WF.Audio.init();
    var b = e.target.closest('[data-back]'); if (b) { back(); return; }
    var g = e.target.closest('[data-go]'); if (g) { WF.Audio.play('click'); go(g.getAttribute('data-go')); }
  });
  addEventListener('pointerdown', function () { WF.Audio.init(); }, { once: false, passive: true });
  addEventListener('keydown', function () { WF.Audio.init(); });

  function go(k) {
    if (k === 'settings') { buildSettings(); show('sSettings'); }
    else if (k === 'help') show('sHelp');
    else if (k === 'champ') champStart();
    else if (k === 'h2h') h2hStart();
    else if (k === 'multi') lobby();
    else if (k === 'single') pickDriver('🏁 Einzelrennen – Fahrer wählen', true, function (d) { pickTrack('Strecke wählen', function (id) { singleRace(d, id); }); });
    else if (k === 'time') pickTrack('⏱️ Zeitfahren – Strecke wählen', function (id) { timeTrial(id); });
  }

  function titleStat() {
    var st = SAVE.stats, n = Object.keys(SAVE.best).length;
    $('titleStat').textContent = st.races ? (st.races + ' Rennen · ' + st.wins + ' Siege' + (st.champs ? ' · 🏆 ' + st.champs + '× Meister' : '') + (n ? ' · ' + n + ' Bestzeiten' : '')) : '';
  }

  // ----- Fahrer wählen
  function avatar(d, cls) { return '<div class="av ' + (cls || '') + '" style="background:' + d.col + '">' + d.name[0] + '</div>'; }
  function pickDriver(title, withDiff, cb) {
    $('drvTitle').textContent = title;
    var sel = SAVE.drv || 'lotte', grid = $('drvGrid');
    grid.innerHTML = WF.DRIVERS.map(function (d) { return '<div class="card-it' + (d.id === sel ? ' sel' : '') + '" data-d="' + d.id + '">' + avatar(d) + '<b>' + esc(d.name) + '</b><small>' + esc(d.bio) + '</small></div>'; }).join('');
    grid.onclick = function (e) { var c = e.target.closest('[data-d]'); if (!c) return; sel = c.getAttribute('data-d'); grid.querySelectorAll('.card-it').forEach(function (x) { x.classList.toggle('sel', x === c); }); WF.Audio.play('click'); };
    grid.ondblclick = function () { $('drvOk').click(); };
    var opts = $('drvOpts');
    opts.innerHTML = withDiff ? '<div class="opt"><span>Gegner</span><div class="chips" id="dDiff">' + DIFFN.map(function (n, i) { return '<button class="chip' + (SET.diff === i ? ' on' : '') + '" data-v="' + i + '">' + n + '</button>'; }).join('') + '</div></div>' : '';
    if (withDiff) chips($('dDiff'), function (v) { SET.diff = +v; saveSet(); });
    $('drvOk').onclick = function () { SAVE.drv = sel; save(); WF.Audio.play('click'); cb(WF.DRIVERS.filter(function (d) { return d.id === sel; })[0]); };
    show('sDriver');
  }
  function chips(el, cb) { el.onclick = function (e) { var b = e.target.closest('.chip'); if (!b) return; el.querySelectorAll('.chip').forEach(function (x) { x.classList.toggle('on', x === b); }); WF.Audio.play('click'); cb(b.getAttribute('data-v')); }; }

  // ----- Strecke wählen
  function preview(id, w, h) {
    var T = getTrack(id), c = document.createElement('canvas'); c.width = w; c.height = h;
    var g = c.getContext('2d'), gr = T.theme.ground, s = Math.min((w - 10) / gr.w, (h - 10) / gr.d);
    g.fillStyle = T.theme.groundCol; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = T.w * 2 * s + 2; g.lineJoin = 'round'; trace(g, T, w, h, s); g.stroke();
    g.strokeStyle = '#fff'; g.lineWidth = T.w * 2 * s - 1; trace(g, T, w, h, s); g.stroke();
    g.fillStyle = '#ff2d95'; g.beginPath(); g.arc(w / 2 + (T.x[0] - gr.x) * s, h / 2 + (T.z[0] - gr.z) * s, 4, 0, 7); g.fill();
    return c;
  }
  function trace(g, T, w, h, s) { var gr = T.theme.ground; g.beginPath(); for (var i = 0; i < T.N; i += 3) { var x = w / 2 + (T.x[i] - gr.x) * s, y = h / 2 + (T.z[i] - gr.z) * s; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.closePath(); }
  function pickTrack(title, cb) {
    $('trkTitle').textContent = title;
    var grid = $('trkGrid'); grid.innerHTML = '';
    Object.keys(WF.THEMES).forEach(function (k) {
      var th = WF.THEMES[k], v = WF.VEHICLES[th.veh];
      var h4 = document.createElement('h4'); h4.textContent = th.icon + ' ' + th.name + ' – ' + v.icon + ' ' + v.name; grid.appendChild(h4);
      var row = document.createElement('div'); row.className = 'trow'; grid.appendChild(row);
      WF.TRACKS.filter(function (t) { return t.theme === k; }).forEach(function (t) {
        var d = document.createElement('div'); d.className = 'tcard'; d.tabIndex = 0;
        d.appendChild(preview(t.id, 160, 96));
        var b = SAVE.best[t.id];
        d.insertAdjacentHTML('beforeend', '<b>' + esc(t.name) + '</b><small>' + (b && b.lap ? '⏱ ' + WF.fmtTime(b.lap) : '&nbsp;') + '</small>');
        d.onclick = function () { WF.Audio.play('click'); cb(t.id); };
        row.appendChild(d);
      });
    });
    show('sTrack');
  }

  // ----- Einzelrennen
  function singleRace(d, id) {
    var opp = WF.DRIVERS.filter(function (x) { return x.id !== d.id; }).sort(function () { return Math.random() - 0.5; }).slice(0, 3);
    startRace({ kind: 'race', track: id, players: [{ dev: 'any', drv: d }], cpus: opp, skillMul: DIFF[SET.diff], onEnd: function (r) {
      recordRace(r);
      results(r, 'Einzelrennen', [['↻ Nochmal', function () { singleRace(d, id); }], ['🗺️ Strecke', function () { pickTrack('Strecke wählen', function (n) { singleRace(d, n); }); }], ['🏠 Menü', home]]);
    } });
  }
  function recordRace(r) {
    var h = r.humans && r.humans[0]; if (!h) return;
    SAVE.stats.races++; if (r.order[0] === h) SAVE.stats.wins++;
    var b = SAVE.best[r.track] || (SAVE.best[r.track] = {});
    if (h.best && (!b.lap || h.best < b.lap)) b.lap = +h.best.toFixed(3);
    if (h.done && (!b.race || h.time < b.race)) b.race = +h.time.toFixed(3);
    save();
  }

  // ----- Ergebnis
  function results(r, title, btns) {
    $('resTitle').textContent = title;
    var rows = '';
    if (r.kind === 'duel') {
      var P = r.points; $('resSub').textContent = r.winner ? r.winner.name + ' gewinnt das Duell!' : '';
      r.cars.slice().sort(function (a, b) { var ia = r.cars.indexOf(a), ib = r.cars.indexOf(b); return P.lights ? P.lights[ib] - P.lights[ia] : P.score[ib] - P.score[ia]; }).forEach(function (c, k) {
        var i = r.cars.indexOf(c); rows += '<tr class="' + (c.dev ? 'me' : '') + '"><td>' + (k + 1) + '.</td><td><span class="dot" style="background:' + c.color + '"></span>' + esc(c.name) + (c.dev ? ' 🎮' : '') + '</td><td class="r">' + (P.lights ? P.lights[i] + ' Lichter' : P.score[i] + ' Punkte') + '</td></tr>';
      });
    } else {
      var hs = r.humans || [];
      $('resSub').textContent = WF.trackById(r.track).name + (r.kind === 'time' || r.kind === 'bonus' ? ' · Gesamt ' + WF.fmtTime(r.time) + ' · Beste Runde ' + WF.fmtTime(r.best) : '');
      r.order.forEach(function (c, k) {
        rows += '<tr class="' + (hs.indexOf(c) >= 0 ? 'me' : '') + '"><td>' + (k + 1) + '.</td><td><span class="dot" style="background:' + c.color + '"></span>' + esc(c.name || 'Du') + '</td><td class="r">' + (c.done ? WF.fmtTime(c.time) : '—') + (c.best ? ' · ⚡' + WF.fmtTime(c.best) : '') + '</td></tr>';
      });
      if (r.kind === 'time' || r.kind === 'bonus') r.laps.forEach(function (t, k) { rows += '<tr><td></td><td>Runde ' + (k + 1) + '</td><td class="r">' + WF.fmtTime(t) + (t === r.best ? ' ⭐' : '') + '</td></tr>'; });
    }
    $('resTable').innerHTML = rows;
    var bb = $('resBtns'); bb.innerHTML = '';
    btns.forEach(function (b, k) { var e = document.createElement('button'); e.className = 'btn' + (k === 0 ? ' pri' : ''); e.textContent = b[0]; e.onclick = function () { WF.Audio.play('click'); b[1](); }; bb.appendChild(e); });
    stack = []; show('sResult', true);
  }

  // ----- Zeitfahren
  function timeTrial(id) {
    var d = WF.DRIVERS.filter(function (x) { return x.id === (SAVE.drv || 'lotte'); })[0] || WF.DRIVERS[0];
    var ghost = null; try { ghost = JSON.parse(localStorage.getItem('wfghost-' + id) || 'null'); } catch (e) {}
    startRace({ kind: 'time', track: id, players: [{ dev: 'any', drv: d }], cpus: [], ghost: ghost && ghost.p, onEnd: function (r) {
      var b = SAVE.best[id] || (SAVE.best[id] = {}), rec = '';
      if (r.best && (!b.lap || r.best < b.lap)) { b.lap = +r.best.toFixed(3); rec = '🌟 Neue Rundenbestzeit! '; }
      if (!b.race || r.time < b.race) { b.race = +r.time.toFixed(3); rec += '🏁 Neue Gesamtbestzeit!'; }
      if (r.ghost && r.ghostT && (!ghost || r.ghostT < ghost.t)) try { localStorage.setItem('wfghost-' + id, JSON.stringify({ t: r.ghostT, p: r.ghost })); } catch (e) {}
      SAVE.stats.races++; save();
      results(r, '⏱️ Zeitfahren', [['↻ Nochmal', function () { timeTrial(id); }], ['🗺️ Strecke', function () { pickTrack('⏱️ Zeitfahren – Strecke wählen', timeTrial); }], ['🏠 Menü', home]]);
      if (rec) toast(rec, 3200);
    } });
  }

  // ----- Meisterschaft
  function champStart() {
    var c = SAVE.champ;
    if (c && !c.over) {
      champLadder();
      return;
    }
    pickDriver('🏆 Meisterschaft – Fahrer wählen', true, function (d) {
      SAVE.champ = { drv: d.id, race: 0, lives: 3, out: [], bonus: false, diff: SET.diff }; save(); champLadder();
    });
  }
  function drvById(id) { return WF.DRIVERS.filter(function (d) { return d.id === id; })[0]; }
  function champOpponents(c) {
    var pool = WF.DRIVERS.filter(function (d) { return d.id !== c.drv && c.out.indexOf(d.id) < 0; });
    if (pool.length < 3) { c.out = []; c.revenge = true; pool = WF.DRIVERS.filter(function (d) { return d.id !== c.drv; }); }
    pool.sort(function (a, b) { return a.skill - b.skill; });
    var start = Math.min(pool.length - 3, Math.floor(c.race / 23 * (pool.length - 3) + 0.5));
    return pool.slice(start, start + 3);
  }
  function champLadder() {
    var c = SAVE.champ, me = drvById(c.drv), id = WF.CHAMP[c.race], tdef = WF.trackById(id), th = WF.THEMES[tdef.theme], v = WF.VEHICLES[th.veh];
    var opp = c.opp && c.oppRace === c.race ? c.opp.map(drvById) : champOpponents(c);
    c.opp = opp.map(function (d) { return d.id; }); c.oppRace = c.race; save();
    $('ladTitle').textContent = c.bonus ? '⭐ Bonusrunde' : '🏆 Meisterschaft · Rennen ' + (c.race + 1) + '/24';
    $('ladLives').textContent = '❤️'.repeat(c.lives) + '🤍'.repeat(Math.max(0, 3 - c.lives));
    var nx = $('ladNext'); nx.innerHTML = '';
    nx.appendChild(preview(id, 200, 120));
    nx.insertAdjacentHTML('beforeend', '<div class="nt"><b>' + th.icon + ' ' + esc(tdef.name) + '</b><span>' + esc(th.name) + ' · ' + v.icon + ' ' + esc(v.name) + '</span><span>' +
      (c.bonus ? 'Schaffe 2 Runden in ' + WF.fmtTime(champBonusTarget(id)) + ' – dann gibt es ein Extraleben!' : 'Platz 1 oder 2 kommt weiter. ' + (c.lives === 1 ? '<b>Letztes Leben!</b>' : '')) + '</span></div>');
    $('ladRoster').innerHTML = c.bonus ? '' : WF.DRIVERS.filter(function (d) { return d.id !== c.drv; }).map(function (d) {
      var out = c.out.indexOf(d.id) >= 0, vs = c.opp.indexOf(d.id) >= 0;
      return '<div class="card-it' + (out ? ' out' : '') + (vs ? ' vs' : '') + '">' + (out ? '<span class="badge">❌</span>' : vs ? '<span class="badge">⚔️</span>' : '') + avatar(d) + '<b>' + esc(d.name) + '</b></div>';
    }).join('');
    $('ladGo').onclick = function () { WF.Audio.play('click'); c.bonus ? champBonus() : champRace(); };
    $('ladQuit').onclick = function () { WF.Audio.play('click'); home(); };
    stack = []; show('sLadder', true);
    if (c.revenge) { toast('Revanche! Alle ausgeschiedenen Fahrer sind zurück.', 3000); c.revenge = false; save(); }
  }
  function champMul(c) { return DIFF[c.diff == null ? 1 : c.diff] * (0.94 + 0.08 * c.race / 23); }
  function champBonusTarget(id) { return parTime(id, 2) * 1.07; }
  function champRace() {
    var c = SAVE.champ, me = drvById(c.drv), id = WF.CHAMP[c.race];
    startRace({ kind: 'race', champ: true, track: id, players: [{ dev: 'any', drv: me }], cpus: c.opp.map(drvById), skillMul: champMul(c), onEnd: function (r) {
      recordRace(r);
      var h = r.humans[0], place = r.order.indexOf(h) + 1, cpus = r.order.filter(function (x) { return x !== h; }), lastCpu = cpus[cpus.length - 1];
      var note = '';
      if (lastCpu && lastCpu.driver) { c.out.push(lastCpu.driver.id); note = lastCpu.name + ' scheidet aus! '; }
      var btn;
      if (place <= 2) {
        c.race++; c.opp = null;
        if (c.race >= 24) { c.over = true; SAVE.stats.champs++; save(); results(r, '🏆 MEISTER! 🏆', [['🏠 Menü', home]]); toast('Du bist Winzflitzer-Meister! Alle 24 Strecken geschafft!', 5000); return; }
        if (c.race % 3 === 0) c.bonus = true;
        note = (place === 1 ? 'Sieg! ' : 'Qualifiziert! ') + note;
        btn = [['Weiter →', champLadder], ['🏠 Menü', home]];
      } else {
        c.lives--;
        if (c.lives <= 0) { c.over = true; save(); results(r, '💔 Meisterschaft vorbei', [['↻ Neue Meisterschaft', function () { SAVE.champ = null; champStart(); }], ['🏠 Menü', home]]); toast('Keine Leben mehr – du kamst bis Rennen ' + (c.race + 1) + '.', 4000); return; }
        note = 'Nicht qualifiziert – ein Leben weniger. ' + note; c.opp = null;
        btn = [['Nochmal versuchen →', champLadder], ['🏠 Menü', home]];
      }
      save();
      results(r, 'Rennen ' + (c.race + (place <= 2 ? 0 : 1)) + ': ' + place + '. Platz', btn);
      toast(note, 3500);
    } });
  }
  function champBonus() {
    var c = SAVE.champ, me = drvById(c.drv), id = WF.CHAMP[c.race], target = champBonusTarget(id);
    startRace({ kind: 'bonus', track: id, laps: 2, players: [{ dev: 'any', drv: me }], cpus: [], target: target, onEnd: function (r) {
      c.bonus = false; var ok = r.time <= target;
      if (ok) c.lives = Math.min(5, c.lives + 1);
      save();
      results(r, ok ? '⭐ Extraleben gewonnen!' : 'Bonusrunde verpasst', [['Weiter →', champLadder], ['🏠 Menü', home]]);
    } });
  }

  // ----- Kopf-an-Kopf (Turnier gegen alle der Reihe nach)
  function h2hStart() {
    var s = SAVE.h2h;
    if (s && !s.over) { h2hLadder(); return; }
    pickDriver('⚔️ Kopf-an-Kopf – Fahrer wählen', true, function (d) { SAVE.h2h = { drv: d.id, stage: 0, lives: 3, diff: SET.diff }; save(); h2hLadder(); });
  }
  function h2hOrder(s) { return WF.DRIVERS.filter(function (d) { return d.id !== s.drv; }).sort(function (a, b) { return a.skill - b.skill; }); }
  function h2hTrack(stage) { return WF.CHAMP[(stage * 2 + 1) % 24]; }
  function h2hLadder() {
    var s = SAVE.h2h, ord = h2hOrder(s), opp = ord[s.stage], id = h2hTrack(s.stage), tdef = WF.trackById(id), th = WF.THEMES[tdef.theme], v = WF.VEHICLES[th.veh];
    $('ladTitle').textContent = '⚔️ Kopf-an-Kopf · Duell ' + (s.stage + 1) + '/11';
    $('ladLives').textContent = '❤️'.repeat(s.lives) + '🤍'.repeat(Math.max(0, 3 - s.lives));
    var nx = $('ladNext'); nx.innerHTML = ''; nx.appendChild(preview(id, 200, 120));
    nx.insertAdjacentHTML('beforeend', '<div class="nt"><b>Gegen ' + esc(opp.name) + '</b><span>' + th.icon + ' ' + esc(tdef.name) + ' · ' + v.icon + ' ' + esc(v.name) + '</span><span>Fahr ' + esc(opp.name) + ' aus dem Bild! Wer alle 8 Lichter hat, gewinnt.</span></div>');
    $('ladRoster').innerHTML = ord.map(function (d, k) { return '<div class="card-it' + (k < s.stage ? ' out' : '') + (k === s.stage ? ' vs' : '') + '">' + (k < s.stage ? '<span class="badge">✔️</span>' : k === s.stage ? '<span class="badge">⚔️</span>' : '') + avatar(d) + '<b>' + esc(d.name) + '</b></div>'; }).join('');
    $('ladGo').onclick = function () { WF.Audio.play('click'); h2hDuel(); };
    $('ladQuit').onclick = function () { WF.Audio.play('click'); home(); };
    stack = []; show('sLadder', true);
  }
  function h2hDuel() {
    var s = SAVE.h2h, me = drvById(s.drv), opp = h2hOrder(s)[s.stage], id = h2hTrack(s.stage);
    startRace({ kind: 'duel', track: id, players: [{ dev: 'any', drv: me }], cpus: [opp], skillMul: DIFF[s.diff == null ? 1 : s.diff] * (0.96 + 0.06 * s.stage / 10), points: { lights: [4, 4] }, laps: 99, onEnd: function (r) {
      var won = r.winner && r.winner.human !== undefined && r.winner.dev;
      SAVE.stats.duels++;
      if (won) {
        s.stage++;
        if (s.stage >= 11) { s.over = true; SAVE.stats.champs++; save(); results(r, '🏆 Duell-Champion!', [['🏠 Menü', home]]); toast('Alle 11 Gegner besiegt – du bist Duell-Champion!', 5000); return; }
        save(); results(r, '⚔️ Gewonnen!', [['Nächstes Duell →', h2hLadder], ['🏠 Menü', home]]);
      } else {
        s.lives--;
        if (s.lives <= 0) { s.over = true; save(); results(r, '💔 Turnier vorbei', [['↻ Neues Turnier', function () { SAVE.h2h = null; h2hStart(); }], ['🏠 Menü', home]]); return; }
        save(); results(r, 'Verloren – ein Leben weniger', [['Nochmal →', h2hLadder], ['🏠 Menü', home]]);
      }
    } });
  }

  // ----- Mehrspieler-Lobby
  var lob = { slots: [], goal: 5, cpu: 0 };
  var DEVNAME = { kbA: '⌨️ Pfeiltasten', kbB: '⌨️ W A S D', touch: '👆 Touch', pad0: '🎮 Controller 1', pad1: '🎮 Controller 2', pad2: '🎮 Controller 3', pad3: '🎮 Controller 4' };
  function lobby() {
    lob.slots = lob.slots.filter(function (s) { return s.dev.indexOf('pad') !== 0 || WF.Input.pads()[+s.dev.slice(3)]; });
    drawLobby();
    $('lobGoal').innerHTML = [3, 5, 8].map(function (n) { return '<button class="chip' + (lob.goal === n ? ' on' : '') + '" data-v="' + n + '">' + n + ' Punkte</button>'; }).join('');
    chips($('lobGoal'), function (v) { lob.goal = +v; });
    $('lobCpu').innerHTML = [0, 1, 2, 3].map(function (n) { return '<button class="chip' + (lob.cpu === n ? ' on' : '') + '" data-v="' + n + '">' + (n ? '+' + n : 'keine') + '</button>'; }).join('');
    chips($('lobCpu'), function (v) { lob.cpu = +v; });
    $('lobGo').onclick = function () {
      if (lob.slots.length + lob.cpu < 2) { toast('Mindestens 2 Fahrer – tritt mit einem zweiten Gerät bei oder füge Computer hinzu.'); return; }
      WF.Audio.play('click');
      pickTrack('👥 Strecke wählen', function (id) { multiRace(id); });
    };
    show('sLobby');
  }
  function lobbyJoin(dev) {
    if (lob.slots.some(function (s) { return s.dev === dev; })) return;
    if (lob.slots.length >= 4) return;
    var used = lob.slots.map(function (s) { return s.drv.id; }), d = WF.DRIVERS.filter(function (x) { return used.indexOf(x.id) < 0; })[0];
    lob.slots.push({ dev: dev, drv: d }); WF.Audio.play('point'); drawLobby();
  }
  function drawLobby() {
    var el = $('lobSlots'), html = '';
    for (var i = 0; i < 4; i++) {
      var s = lob.slots[i];
      html += s ? '<div class="slot on" data-i="' + i + '"><div class="av" style="background:' + s.drv.col + '">' + (i + 1) + '</div><b>' + esc(s.drv.name) + '</b><small>' + DEVNAME[s.dev] + '</small><button class="chip" data-x="' + i + '">✕ Raus</button></div>'
        : '<div class="slot" data-join="1"><b>Spieler ' + (i + 1) + '</b><small>' + (TOUCH && !lob.slots.some(function (q) { return q.dev === 'touch'; }) ? 'Hier tippen oder Gas geben' : 'Gas geben zum Beitreten') + '</small></div>';
    }
    el.innerHTML = html;
    el.onclick = function (e) {
      var x = e.target.closest('[data-x]'); if (x) { lob.slots.splice(+x.getAttribute('data-x'), 1); drawLobby(); return; }
      var on = e.target.closest('.slot.on'); if (on) { var s = lob.slots[+on.getAttribute('data-i')], used = lob.slots.map(function (q) { return q.drv.id; }), k = WF.DRIVERS.indexOf(s.drv);
        for (var n = 1; n <= 12; n++) { var d = WF.DRIVERS[(k + n) % 12]; if (used.indexOf(d.id) < 0) { s.drv = d; break; } } WF.Audio.play('click'); drawLobby(); return; }
      if (e.target.closest('[data-join]')) lobbyJoin(TOUCH ? 'touch' : (lob.slots.some(function (q) { return q.dev === 'kbA'; }) ? 'kbB' : 'kbA'));
    };
  }
  function multiRace(id) {
    var used = lob.slots.map(function (s) { return s.drv.id; });
    var cpus = WF.DRIVERS.filter(function (d) { return used.indexOf(d.id) < 0; }).sort(function () { return Math.random() - 0.5; }).slice(0, Math.min(lob.cpu, 4 - lob.slots.length));
    var n = lob.slots.length + cpus.length;
    startRace({ kind: 'duel', track: id, players: lob.slots.map(function (s) { return { dev: s.dev, drv: s.drv }; }), cpus: cpus, skillMul: DIFF[SET.diff], laps: 99,
      points: n === 2 ? { lights: [4, 4] } : { score: new Array(n).fill(0), goal: lob.goal }, onEnd: function (r) {
        SAVE.stats.duels++; save();
        results(r, '🏆 ' + (r.winner ? r.winner.name : '') + ' gewinnt!', [['↻ Nochmal', function () { multiRace(id); }], ['🗺️ Strecke', function () { pickTrack('👥 Strecke wählen', multiRace); }], ['👥 Lobby', lobby], ['🏠 Menü', home]]);
      } });
  }

  // ----- Einstellungen
  function buildSettings() {
    var L = [
      ['Ton', 'sfx', [[true, 'An'], [false, 'Aus']]],
      ['Musik', 'music', [[true, 'An'], [false, 'Aus']]],
      ['Grafik', 'q', [[0, 'Sparsam'], [1, 'Normal'], [2, 'Schön']]],
      ['Kamera', 'zoom', [[0, 'Nah'], [1, 'Normal'], [2, 'Weit']]],
      ['Touch-Steuerung', 'touch', [['dir', 'Stick-Richtung'], ['keys', 'Tasten']]],
      ['Controller-Lenkung', 'pad', [['classic', 'Klassisch'], ['dir', 'Stick-Richtung']]],
      ['Gegner', 'diff', [[0, 'Leicht'], [1, 'Normal'], [2, 'Schwer']]]
    ];
    var el = $('setList');
    el.innerHTML = L.map(function (r) { return '<div class="opt"><span>' + r[0] + '</span><div class="chips" data-k="' + r[1] + '">' + r[2].map(function (o) { return '<button class="chip' + (SET[r[1]] === o[0] ? ' on' : '') + '" data-v=\'' + JSON.stringify(o[0]) + '\'>' + o[1] + '</button>'; }).join('') + '</div></div>'; }).join('') +
      '<p class="hint">Grafik „Sparsam“ schont Akku und ältere Handys. Änderungen an der Grafik wirken nach dem Neuladen.</p>';
    el.querySelectorAll('.chips').forEach(function (c) {
      chips(c, function (v) {
        var k = c.getAttribute('data-k'); SET[k] = JSON.parse(v); saveSet();
        if (k === 'sfx' || k === 'music') { WF.Audio.sfx = SET.sfx; WF.Audio.music = SET.music; WF.Audio.apply(); }
        if (k === 'q') renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, [1, 1.5, 2][SET.q]));
      });
    });
  }

  // ----- Pause
  function pause(on) {
    if (!race || race.kind === 'attract') return;
    paused = on; $('ovPause').hidden = !on; WF.Audio.suspend(on);
    $('pSound').textContent = '🔊 Ton: ' + (SET.sfx ? 'an' : 'aus'); $('pMusic').textContent = '🎵 Musik: ' + (SET.music ? 'an' : 'aus');
    if (on) focusFirst(); else last = performance.now();
  }
  $('bPause').onclick = function () { pause(true); };
  $('pCont').onclick = function () { pause(false); };
  $('pRestart').onclick = function () { var cfg = race.cfg; pause(false); startRace(cfg); };
  $('pQuit').onclick = function () {
    var k = race.kind; pause(false); WF.Audio.suspend(false);
    if (race.cfg.champ && SAVE.champ && !SAVE.champ.over) {
      // Aufgeben in der Meisterschaft kostet ein Leben
      SAVE.champ.lives--; if (SAVE.champ.lives <= 0) SAVE.champ.over = true; SAVE.champ.opp = null; save();
    }
    home();
  };
  $('pSound').onclick = function () { SET.sfx = !SET.sfx; saveSet(); WF.Audio.sfx = SET.sfx; WF.Audio.apply(); this.textContent = '🔊 Ton: ' + (SET.sfx ? 'an' : 'aus'); };
  $('pMusic').onclick = function () { SET.music = !SET.music; saveSet(); WF.Audio.music = SET.music; WF.Audio.apply(); this.textContent = '🎵 Musik: ' + (SET.music ? 'an' : 'aus'); };
  document.addEventListener('visibilitychange', function () { if (document.hidden && race && race.kind !== 'attract' && !paused) pause(true); });

  // ----- Tastatur/Controller in Menüs (Fokus springt zwischen Knöpfen)
  var focusEl = null;
  function focusables() {
    var root = !$('ovPause').hidden ? $('ovPause') : current ? $(current) : null; if (!root) return [];
    return Array.prototype.filter.call(root.querySelectorAll('.btn, .chip, .card-it[data-d], .tcard, .slot, a.back'), function (e) { return e.offsetParent !== null; });
  }
  function setFocus(e) { if (focusEl) focusEl.classList.remove('focus'); focusEl = e; if (e) { e.classList.add('focus'); try { e.scrollIntoView({ block: 'nearest' }); } catch (er) {} } }
  function focusFirst() { setFocus(null); }
  function move(dx, dy) {
    var list = focusables(); if (!list.length) return;
    if (!focusEl || list.indexOf(focusEl) < 0) { setFocus(list.filter(function (e) { return e.classList.contains('pri'); })[0] || list[0]); return; }
    var r = focusEl.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, best = null, bd = 1e9;
    list.forEach(function (e) {
      if (e === focusEl) return; var q = e.getBoundingClientRect(), x = q.left + q.width / 2 - cx, y = q.top + q.height / 2 - cy;
      var along = x * dx + y * dy; if (along <= 4) return;
      var d = along + Math.abs(x * dy + y * dx) * 2.2; if (d < bd) { bd = d; best = e; }
    });
    if (best) { setFocus(best); WF.Audio.play('click'); }
  }
  function activate() { if (focusEl && focusables().indexOf(focusEl) >= 0) focusEl.click(); else move(0, 1); }
  function menuBack() { if (!$('ovPause').hidden) { pause(false); return; } if (current && current !== 'sTitle') { var b = $(current).querySelector('[data-back]'); if (b) back(); else if (current === 'sLadder' || current === 'sResult') home(); } }

  function pollMenuInput() {
    var keys = WF.Input.takePressed(), pads = WF.Input.padEdges(), inRace = race && race.kind !== 'attract' && !paused && !current;
    keys.forEach(function (k) {
      if (inRace) { if (k === 'Escape' || k === 'KeyP') pause(true); return; }
      if (current === 'sLobby') {
        if (k === 'ArrowUp') { lobbyJoin('kbA'); return; } if (k === 'KeyW') { lobbyJoin('kbB'); return; }
        if (k === 'ArrowDown' || k === 'ArrowLeft' || k === 'ArrowRight' || k === 'KeyA' || k === 'KeyS' || k === 'KeyD') return;
      }
      if (k === 'ArrowUp') move(0, -1); else if (k === 'ArrowDown') move(0, 1); else if (k === 'ArrowLeft') move(-1, 0); else if (k === 'ArrowRight') move(1, 0);
      else if (k === 'Enter' || k === 'Space' || k === 'NumpadEnter') activate();
      else if (k === 'Escape' || k === 'Backspace') menuBack();
    });
    pads.forEach(function (p) {
      WF.Audio.init();
      if (inRace) { if (p.b === 9) pause(true); return; }
      if (current === 'sLobby' && p.b === 0 && !lob.slots.some(function (s) { return s.dev === 'pad' + p.i; })) { lobbyJoin('pad' + p.i); return; }
      if (p.b === 12) move(0, -1); else if (p.b === 13) move(0, 1); else if (p.b === 14) move(-1, 0); else if (p.b === 15) move(1, 0);
      else if (p.b === 0 || p.b === 9) activate(); else if (p.b === 1) menuBack();
    });
  }

  // ----- Start
  if (window.self !== window.top) { try { $('backLink').target = '_top'; } catch (e) {} }
  titleStat();
  attract();
  show('sTitle', true);
  // für automatische Tests: WF.game.timeScale = 4 lässt die Zeit schneller laufen
  WF.game = { startRace: startRace, get race() { return race; }, home: home, SET: SET, SAVE: SAVE, parTime: parTime, pause: pause,
    get timeScale() { return timeScale; }, set timeScale(v) { timeScale = v; } };
})();
