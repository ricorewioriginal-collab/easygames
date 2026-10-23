/* FABELKICK 3D – Spiellogik: Ball-Physik, Regeln, KI, Steuerung, Elfmeterschießen */
'use strict';
(function () {
  const T = THREE, P = FK.P, A = () => FK.Audio, IN = () => FK.Input;
  const L2 = P.L / 2, W2 = P.W / 2, R = P.BALL_R, GRAV = 11.3;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) * 1.15;
  const lerpAng = (a, b, k) => { let d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return a + d * k; };

  // 4-3-3: [ax (0 = eigenes Tor, 1 = gegnerisches Tor), az (-1..1), Rolle]
  const FORM = [
    [0.02, 0, 'GK'], [0.2, -0.66, 'DF'], [0.17, -0.22, 'DF'], [0.17, 0.22, 'DF'], [0.2, 0.66, 'DF'],
    [0.36, -0.42, 'MF'], [0.32, 0, 'MF'], [0.36, 0.42, 'MF'], [0.47, -0.6, 'FW'], [0.49, 0.06, 'FW'], [0.47, 0.6, 'FW']
  ];
  const PLAY = { GK: 0.03, DF: 0.24, MF: 0.44, FW: 0.62 };
  const SHIFT = { GK: 0, DF: 0.36, MF: 0.5, FW: 0.42 };
  const HUMAN_COL = ['#22d3ee', '#ff8a1f', '#a3e635', '#f472b6'];

  class Match {
    constructor(world, o) {
      this.w = world; this.o = o; this.on = o.on || {};
      this.mode = o.mode || 'match'; // match | training | penalties
      this.diff = FK.DIFFS[o.diff != null ? o.diff : 1];
      this.halfLen = this.mode === 'training' ? Infinity : (o.half || 3) * 60;
      this.clock = 0; this.half = 1; this.time = 0; this.phase = 'init'; this.paused = false;
      this.scorers = []; this.events = []; this.timers = new Set(); this.disposed = false;
      this.teams = [this.makeTeam(o.home, 0, 1), this.makeTeam(o.away, 1, -1)];
      this.players = this.teams[0].players.concat(this.teams[1].players);
      const b = world.makeBall();
      this.ball = { mesh: b.mesh, blob: b.blob, pos: new T.Vector3(0, R, 0), vel: new T.Vector3(), owner: null, lastTouch: 0, lastPlayer: null, curve: 0, special: null, shotId: 0, passTo: null, passFrom: null, prevX: 0, inNet: false };
      // Menschen: { dev, team }
      this.humans = (o.humans || []).map((h, i) => ({ dev: h.dev, team: h.team, color: HUMAN_COL[i % 4], player: null, charge: -1, queue: null, idle: 0, marker: world.marker(HUMAN_COL[i % 4]) }));
      this.humans.forEach(h => { this.teams[h.team].human = true; });
      this.cam = { pos: new T.Vector3(0, 30, 50), look: new T.Vector3(), fov: 38 };
      this.tmp = new T.Vector3(); this.tmp2 = new T.Vector3();
      world.setCrowdColors(o.home.kit.shirt, o.away.kit.shirt);
      this.poss = [0, 0];
      if (this.mode === 'penalties') this.startShootout(true);
      else this.kickoff(0, true);
    }

    makeTeam(def, idx, dir) {
      const gkCol = /^#(3|2|1|0)/.test(def.kit.shirt) || def.id === 'affen' ? '#ff4fa3' : '#36e27b';
      const t = { def, idx, dir, players: [], score: 0, pens: 0, power: 20, boostT: 0, slowT: 0, freezeT: 0, stoneT: 0, wallT: 0, nextShot: null, nextShotT: 0, human: false,
        st: { shots: 0, onT: 0, passes: 0, passOk: 0, tackles: 0, fouls: 0 } };
      const n = (this.mode === 'training' && idx === 1) ? 1 : 11;
      for (let i = 0; i < n; i++) {
        const f = FORM[i], role = f[2], gk = role === 'GK';
        const v = k => clamp(def.stats[k] + rnd(-4, 4) + ((role === 'FW' && k === 'schuss') || (role === 'DF' && k === 'abwehr') || (role === 'MF' && k === 'pass') ? 4 : 0), 40, 99);
        const stats = { tempo: v('tempo'), schuss: v('schuss'), pass: v('pass'), abwehr: v('abwehr'), tw: def.stats.tw };
        const p = { team: t, ti: idx, idx: i, role, gk, home: [f[0], f[1]], name: def.names[i], num: gk ? 1 : i + 1, stats,
          pos: new T.Vector3(), vel: new T.Vector3(), face: 0, state: 'run', st: 0, kick: 0, kickCd: 0, stamina: 1, sprint: false, human: null,
          target: new T.Vector3(), hasTarget: false, think: Math.random() * 0.3, expect: null, dive: 0, throwT: 0, holdT: 0, saveCheck: -1, react: 0, frozenAim: false,
          char: this.w.makeChar(def, { gk, gkColor: gkCol }) };
        p.char.setShadows(this.w.quality === 'hoch');
        t.players.push(p);
      }
      return t;
    }

    // Zeitgeber, die nach dem Beenden des Spiels nicht mehr feuern
    later(fn, ms) { const id = setTimeout(() => { this.timers.delete(id); if (!this.disposed) fn(); }, ms); this.timers.add(id); }
    dispose() {
      this.disposed = true; this.timers.forEach(clearTimeout); this.timers.clear();
      this.players.forEach(p => p.char.dispose());
      const bm = this.ball.mesh, sc = this.w.scene;
      sc.remove(bm); sc.remove(this.ball.blob);
      bm.geometry.dispose(); if (bm.material.map) bm.material.map.dispose(); bm.material.dispose();
      // Marker: Geometrien sind geteilt, nur die eigenen Materialien freigeben
      this.humans.forEach(h => { sc.remove(h.marker); h.marker.children.forEach(c => c.material.dispose()); });
      if (this.aimMark) { sc.remove(this.aimMark); this.aimMark.geometry.dispose(); this.aimMark.material.dispose(); }
    }

    // ---------- Hilfen ----------
    toX(t, ax) { return t.dir * (ax - 0.5) * P.L; }
    toAx(t, x) { return x * t.dir / P.L + 0.5; }
    oppGoalX(t) { return t.dir * L2; }
    ownGoalX(t) { return -t.dir * L2; }
    opp(t) { return this.teams[1 - t.idx]; }
    keeper(t) { return t.players[0]; }
    dist(a, b) { return Math.hypot(a.x - b.x, a.z - b.z); }
    faceVec(p) { return { x: Math.sin(p.face), z: Math.cos(p.face) }; }
    speedOf(p) {
      const t = p.team, o = this.opp(t);
      let s = 5.2 * (0.82 + p.stats.tempo / 100 * 0.3);
      if (p.sprint && p.stamina > 0.04) s *= 1 + 0.4 * Math.min(1, p.stamina * 2);
      if (t.boostT > 0) s *= 1.35;
      if (t.slowT > 0) s *= 0.6;
      if (t.freezeT > 0) s *= 0.22;
      if (this.ball.owner === p) s *= 0.9;
      return s;
    }
    aiSkill(t) { return t.human && this.humans.length ? Math.max(this.diff.ai, 0.9) : this.diff.ai; }
    banner(text, sub, kind) { if (this.on.banner) this.on.banner(text, sub || '', kind || ''); }
    inBox(t, x, z) { const gx = this.ownGoalX(t); return Math.abs(x - gx) < P.BOX_D && Math.abs(z) < P.BOX_W / 2; }
    minuteText() {
      if (this.mode === 'training') return 'TRAINING';
      if (this.mode === 'penalties' || this.phase === 'shootout' || this.phase === 'shootend') return '11 m';
      const m = Math.min(45, this.clock / this.halfLen * 45), tot = m + (this.half === 2 ? 45 : 0);
      const mm = Math.floor(tot), ss = Math.floor((tot - mm) * 60);
      return String(mm).padStart(2, '0') + ':' + String(ss).padStart(2, '0');
    }

    // Wo kann p den rollenden Ball am frühesten erreichen?
    intercept(p) {
      const b = this.ball, k = 0.62, s = 7.2;
      let x = b.pos.x, z = b.pos.z;
      // Flugzeit bis zur Landung (in der Luft fast keine Bremsung)
      const h = b.pos.y - R, vy = b.vel.y, air = h > 0.3 || vy > 1.5 ? (vy + Math.sqrt(Math.max(0, vy * vy + 2 * GRAV * h))) / GRAV : 0;
      for (let t = 0.1; t <= 3.01; t += 0.1) {
        const f = t <= air ? t : air + (1 - Math.exp(-k * (t - air))) / k;
        x = b.pos.x + b.vel.x * f; z = b.pos.z + b.vel.z * f;
        if (Math.hypot(x - p.pos.x, z - p.pos.z) <= s * t + 0.4) break;
      }
      return { x: clamp(x, -L2 - 1, L2 + 1), z: clamp(z, -W2 - 1, W2 + 1) };
    }

    // ---------- Aufstellung ----------
    place(p, x, z, face) { p.pos.set(x, 0, z); p.vel.set(0, 0, 0); p.face = face != null ? face : (p.team.dir > 0 ? Math.PI / 2 : -Math.PI / 2); p.state = p.gk ? 'keeper' : 'run'; p.st = 0; p.hasTarget = false; p.expect = null; p.kickCd = 0; p.dive = 0; }
    kickoff(ti, first) {
      this.ball.owner = null; this.ball.vel.set(0, 0, 0); this.ball.pos.set(0, R, 0); this.ball.special = null; this.ball.inNet = false;
      this.teams.forEach(t => t.players.forEach(p => {
        let ax = p.home[0], az = p.home[1];
        if (t.idx !== ti && ax > 0.4) ax = 0.36;
        this.place(p, this.toX(t, ax), az * W2);
      }));
      const t = this.teams[ti];
      if (t.players.length > 9) { const k = t.players[9], s = t.players[6]; this.place(k, -t.dir * 0.4, 0); this.place(s, this.toX(t, 0.46), 4); }
      else { const k = t.players[0]; this.place(k, -t.dir * 0.4, 0); }
      this.setPiece = { type: 'kickoff', team: ti, taker: t.players.length > 9 ? t.players[9] : t.players[0], t: 0 };
      this.ball.owner = this.setPiece.taker; this.ball.lastTouch = ti;
      this.phase = 'setpiece';
      this.autoHumans(ti);
      if (first) this.banner('ANSTOSS', this.teams[0].def.name + ' – ' + this.teams[1].def.name, 'kick');
      A().whistle(1);
    }
    autoHumans(ti) {
      // jedem Menschen eine Figur geben
      this.humans.forEach(h => {
        if (h.player && h.player.team.idx === h.team && !h.player.gk) return;
        const own = this.teams[h.team].players.filter(p => !p.gk && !p.human);
        if (!own.length) return;
        own.sort((a, b) => this.dist(a.pos, this.ball.pos) - this.dist(b.pos, this.ball.pos));
        this.give(h, own[0]);
      });
      if (this.setPiece && this.setPiece.taker && this.setPiece.taker.team.human && !this.setPiece.taker.gk) {
        const tk = this.setPiece.taker, h = this.humans.find(x => x.team === tk.ti); if (h && !tk.human) this.give(h, tk);
      }
    }
    give(h, p) {
      if (!p || p.gk || p.human === h) return;
      const o = p.human, prev = h.player;
      if (o) { o.player = null; p.human = null; }
      if (prev) prev.human = null;
      h.player = p; p.human = h; h.charge = -1; h.idle = 0;
      // Koop: wer seine Figur abgibt, bekommt die alte Figur des anderen (oder die nächste freie)
      if (o) {
        const q = prev && prev.ti === o.team && !prev.gk ? prev : this.teams[o.team].players.filter(x => !x.gk && !x.human).sort((a, c) => this.dist(a.pos, p.pos) - this.dist(c.pos, p.pos))[0];
        if (q) { o.player = q; q.human = o; o.charge = -1; o.idle = 0; }
      }
    }

    // ---------- Hauptschritt ----------
    update(dt) {
      if (this.paused || this.phase === 'end') { this.visuals(dt, this.paused); return; }
      dt = Math.min(dt, 0.05);
      const steps = dt > 0.02 ? 2 : 1, h = dt / steps;
      for (let i = 0; i < steps; i++) this.step(h);
      this.visuals(dt, false);
    }
    step(dt) {
      this.time += dt;
      const ph = this.phase;
      if (ph === 'shootout') { this.stepShootout(dt); return; }
      if (ph === 'play' || ph === 'setpiece' || ph === 'dead') {
        if (this.halfLen !== Infinity) this.clock += dt;
        if (this.clock >= this.halfLen && (ph === 'play' || ph === 'setpiece') && !(this.setPiece && this.setPiece.type === 'penalty')) { this.endHalf(); return; }
      }
      this.teams.forEach(t => {
        ['boostT', 'slowT', 'freezeT', 'stoneT', 'wallT', 'nextShotT'].forEach(k => { if (t[k] > 0) t[k] = Math.max(0, t[k] - dt); });
        if (t.nextShot && t.nextShotT <= 0) t.nextShot = null;
        if (ph === 'play') t.power = Math.min(100, t.power + dt * 2.2);
      });
      if (ph === 'dead') { this.deadT -= dt; if (this.deadT <= 0) this.arrange(); }
      if (ph === 'goal') { this.goalT -= dt; if (this.goalT <= 0) { if (this.mode === 'training') this.kickoff(0); else this.kickoff(this.goalTeam === 0 ? 1 : 0); } }
      if (ph === 'half') { this.halfT -= dt; if (this.halfT <= 0) this.secondHalf(); }
      if (ph === 'play' || ph === 'setpiece') { this.humanStep(dt); this.aiStep(dt); }
      else if (ph === 'goal' || ph === 'dead' || ph === 'half') this.idleStep(dt);
      this.moveStep(dt);
      this.ballStep(dt);
      if (ph === 'play') { this.possessionStep(dt); this.keeperSaves(dt); }
      if (this.ball.owner) this.poss[this.ball.owner.ti] += dt;
    }

    // ---------- Menschliche Spieler ----------
    humanStep(dt) {
      const I = IN();
      for (const h of this.humans) {
        const p = h.player; if (!p) continue;
        const d = I.get(h.dev), b = this.ball, own = b.owner === p;
        const mx = d.mx, mz = d.my, moving = Math.hypot(mx, mz) > 0.15;
        const sp = this.setPiece && this.phase === 'setpiece' ? this.setPiece : null;
        const isTaker = sp && sp.taker === p;
        const defending = b.owner && b.owner.ti !== p.ti;
        h.idle = moving ? 0 : h.idle + dt;
        p.sprint = I.down(h.dev, 'rt') && moving;
        if (I.pressed(h.dev, 'rb')) this.activateSpecial(p.team);
        // Bewegung
        if (p.expect) { p.expect.t -= dt; if (p.expect.t <= 0 || b.owner) p.expect = null; }
        if (isTaker) {
          p.hasTarget = false; p.vel.set(0, 0, 0); p.wantX = p.wantZ = 0;
          if (moving) p.face = Math.atan2(mx, mz);
        } else if (p.state === 'run') {
          if (defending && (I.down(h.dev, 'x') || (I.down(h.dev, 'a') && !moving))) { // Pressing: zum Gegner laufen
            const o = b.owner, gx = this.ownGoalX(p.team);
            this.tmp.set(o.pos.x + (gx - o.pos.x) * 0.04, 0, o.pos.z - o.pos.z * 0.04);
            p.target.copy(this.tmp); p.hasTarget = true; p.sprint = I.down(h.dev, 'rt') || I.down(h.dev, 'x');
          } else if (!b.owner && I.down(h.dev, 'a') && !moving && this.phase === 'play') {
            p.target.set(b.pos.x + b.vel.x * 0.25, 0, b.pos.z + b.vel.z * 0.25); p.hasTarget = true;
          } else if (!moving && p.expect && !b.owner) {
            const ic = this.intercept(p); p.target.set(ic.x, 0, ic.z); p.hasTarget = true;
          } else {
            p.hasTarget = false; p.wantX = mx; p.wantZ = mz;
          }
        }
        // Wechseln
        if ((I.pressed(h.dev, 'lb') && !own) || (defending && I.pressed(h.dev, 'y'))) this.switchPlayer(h);
        else if (defending && h.idle > 1.2 && this.dist(p.pos, b.pos) > 22) { this.switchPlayer(h); }
        // Aktionen
        const dirx = moving ? mx : Math.sin(p.face), dirz = moving ? mz : Math.cos(p.face);
        if (own) {
          if (I.pressed(h.dev, 'a')) this.passDir(p, dirx, dirz, 'ground');
          else if (I.pressed(h.dev, 'y')) this.passDir(p, dirx, dirz, 'through');
          else if (I.pressed(h.dev, 'x')) this.passDir(p, dirx, dirz, 'lob');
          if (I.down(h.dev, 'b')) { if (h.charge < 0) h.charge = 0; h.charge += dt; if (h.charge > 1.1) { this.shootHuman(p, h, moving ? mz : null); } }
          else if (h.charge >= 0) this.shootHuman(p, h, moving ? mz : null);
        } else {
          if (h.charge >= 0 && !I.down(h.dev, 'b')) { h.queue = { k: 'shot', ttl: 0.45, pw: Math.min(1, h.charge / 0.9) }; h.charge = -1; }
          if (defending) {
            h.charge = -1;
            if (I.pressed(h.dev, 'a')) this.standTackle(p);
            if (I.pressed(h.dev, 'b')) this.slide(p);
          } else if (!b.owner) {
            if (I.pressed(h.dev, 'a')) h.queue = { k: 'ground', ttl: 0.45 };
            if (I.pressed(h.dev, 'y')) h.queue = { k: 'through', ttl: 0.45 };
            if (I.pressed(h.dev, 'x')) h.queue = { k: 'lob', ttl: 0.45 };
            if (I.down(h.dev, 'b')) { if (h.charge < 0) h.charge = 0; h.charge += dt; }
          }
        }
        if (h.queue) { h.queue.ttl -= dt; if (h.queue.ttl <= 0) h.queue = null; }
      }
    }
    shootHuman(p, h, mz) {
      const pw = Math.min(1, Math.max(0.15, h.charge / 0.9)); h.charge = -1;
      this.shoot(p, pw, mz != null ? clamp(mz, -1, 1) : null);
    }
    switchPlayer(h) {
      const t = this.teams[h.team], b = this.ball;
      let best = null, bd = 1e9;
      t.players.forEach(q => {
        if (q.gk || q === h.player || (q.human && q.human !== h)) return;
        const d = Math.hypot(q.pos.x - (b.pos.x + b.vel.x * 0.4), q.pos.z - (b.pos.z + b.vel.z * 0.4));
        if (d < bd) { bd = d; best = q; }
      });
      if (best) { this.give(h, best); h.idle = 0; }
    }

    // ---------- KI ----------
    aiStep(dt) {
      const b = this.ball, sp = this.phase === 'setpiece' ? this.setPiece : null;
      if (sp) { sp.t += dt; this.setPieceAI(sp); }
      if (this.phase === 'play' && b.owner) for (const t of this.teams) {
        const id = t.def.special.id;
        if (t.human || t.power < 100 || (id !== 'roar' && id !== 'freeze' && id !== 'wall')) continue;
        if (b.owner.ti !== t.idx && Math.abs(b.owner.pos.x - this.ownGoalX(t)) < 35) this.activateSpecial(t);
      }
      // Pressing-Reihenfolge je Team einmal pro Schritt
      const ranks = this.teams.map(t => {
        const arr = t.players.filter(p => !p.gk && p.state === 'run');
        const bx = b.pos.x + b.vel.x * 0.35, bz = b.pos.z + b.vel.z * 0.35;
        arr.sort((p, q) => Math.hypot(p.pos.x - bx, p.pos.z - bz) - Math.hypot(q.pos.x - bx, q.pos.z - bz));
        return arr;
      });
      for (const p of this.players) {
        if (p.human) continue;
        if (sp && p.wall > 0) continue;
        if (p.state !== 'run' && p.state !== 'keeper' && p.state !== 'hold') continue;
        p.sprint = false;
        if (sp && sp.taker === p) { p.hasTarget = false; p.vel.set(0, 0, 0); continue; }
        if (p.gk) { this.keeperAI(p, dt); continue; }
        p.think -= dt;
        if (b.owner === p) { if (this.phase === 'play') this.ownerAI(p, dt); continue; }
        if (p.think > 0 && p.hasTarget) continue;
        p.think = this.diff.react * (p.team.human ? 0.6 : 1) + rnd(0.05, 0.15);
        this.fieldAI(p, ranks[p.ti]);
      }
    }
    formationTarget(p, attacking) {
      const t = p.team, b = this.ball, bax = this.toAx(t, b.pos.x);
      let ax = PLAY[p.role] + (bax - 0.5) * SHIFT[p.role] + (attacking ? 0.1 : -0.06);
      if (p.role === 'DF') ax = clamp(ax, 0.07, 0.62);
      if (p.role === 'MF') ax = clamp(ax, 0.15, 0.8);
      if (p.role === 'FW') ax = clamp(attacking ? Math.max(ax, bax + 0.06) : ax, 0.36, 0.88);
      let az = p.home[1] * (attacking ? 1.0 : 0.82) + (b.pos.z / W2) * 0.22;
      az = clamp(az, -0.92, 0.92);
      return { x: this.toX(t, ax), z: az * W2 };
    }
    fieldAI(p, rank) {
      const b = this.ball, t = p.team, own = b.owner;
      if (p.expect) {
        p.expect.t -= 0.2;
        if (p.expect.t <= 0 || own) p.expect = null;
        else {
          if (!b.owner && b.vel.lengthSq() > 4) { const ic = this.intercept(p); p.target.set(ic.x, 0, ic.z); p.think = 0.1; }
          else p.target.set(p.expect.x, 0, p.expect.z);
          p.hasTarget = true; p.sprint = true; return;
        }
      }
      if (own && own.ti === t.idx) { // Angriff: freilaufen
        const f = this.formationTarget(p, true);
        const d = this.dist(p.pos, own.pos);
        if (d < 7) { f.x += (p.pos.x - own.pos.x) * 0.6; f.z += (p.pos.z - own.pos.z) * 0.6; }
        // Raum suchen: weg vom nächsten Gegner
        let nd = 99, nx = 0, nz = 0;
        for (const q of this.opp(t).players) { const dd = this.dist(p.pos, q.pos); if (dd < nd) { nd = dd; nx = q.pos.x; nz = q.pos.z; } }
        if (nd < 4) { f.z += (p.pos.z - nz) * 0.8; }
        p.target.set(clamp(f.x, -L2 + 1, L2 - 1), 0, clamp(f.z, -W2 + 1, W2 - 1)); p.hasTarget = true;
        p.sprint = this.dist(p.pos, p.target) > 8;
        return;
      }
      if (own && own.ti !== t.idx && this.phase === 'setpiece') { // Abstand halten
        const f = this.formationTarget(p, false), d = Math.hypot(f.x - own.pos.x, f.z - own.pos.z);
        if (d < 9.5) { f.x = own.pos.x + (f.x - own.pos.x) / (d || 1) * 9.5; f.z = own.pos.z + (f.z - own.pos.z) / (d || 1) * 9.5; }
        p.target.set(f.x, 0, f.z); p.hasTarget = true; return;
      }
      if (own && own.ti !== t.idx) { // Verteidigung
        const i = rank.indexOf(p), gx = this.ownGoalX(t);
        if (i === 0 || (i === 1 && this.dist(p.pos, own.pos) < 6)) {
          const gd = Math.hypot(gx - own.pos.x, own.pos.z) || 1;
          const off = i === 0 ? 0.9 : 3.2;
          p.target.set(own.pos.x + (gx - own.pos.x) / gd * off + own.vel.x * 0.25, 0, own.pos.z - own.pos.z / gd * off + own.vel.z * 0.25);
          p.hasTarget = true; p.sprint = this.dist(p.pos, own.pos) > 3.5;
          const dd = this.dist(p.pos, own.pos), pr = this.diff.press * (t.human ? 0.9 : 1);
          if (dd < 1.7 && Math.random() < 0.32 * pr) this.standTackle(p);
          else if (dd > 1.6 && dd < 3.0 && Math.random() < 0.05 * pr) { // Grätsche, wenn der Gegner nicht frontal kommt
            this.tmp.set(own.pos.x - p.pos.x, 0, own.pos.z - p.pos.z).normalize();
            p.face = Math.atan2(this.tmp.x, this.tmp.z); this.slide(p);
          }
          return;
        }
        if (i === 1) {
          const gd = Math.hypot(gx - own.pos.x, own.pos.z) || 1;
          p.target.set(own.pos.x + (gx - own.pos.x) / gd * 8, 0, own.pos.z - own.pos.z / gd * 8); p.hasTarget = true; p.sprint = true; return;
        }
        const f = this.formationTarget(p, false); p.target.set(f.x, 0, f.z); p.hasTarget = true; p.sprint = false; return;
      }
      // freier Ball
      if (rank[0] === p || (rank[1] === p && this.dist(p.pos, b.pos) < 10)) {
        const d = this.dist(p.pos, b.pos), ic = this.intercept(p);
        p.target.set(ic.x, 0, ic.z); p.hasTarget = true; p.sprint = d > 4; p.think = 0.1; return;
      }
      const f = this.formationTarget(p, b.lastTouch === t.idx); p.target.set(f.x, 0, f.z); p.hasTarget = true; p.sprint = false;
    }
    passOptions(p) {
      const t = p.team, o = this.opp(t), out = [];
      for (const q of t.players) {
        if (q === p || q.state !== 'run') continue;
        const d = this.dist(p.pos, q.pos); if (d < 5 || d > 40) continue;
        let open = 10, lane = 4;
        for (const e of o.players) {
          open = Math.min(open, this.dist(e.pos, q.pos));
          // Abstand zur Passlinie
          const ex = e.pos.x - p.pos.x, ez = e.pos.z - p.pos.z, lx = q.pos.x - p.pos.x, lz = q.pos.z - p.pos.z;
          const k = clamp((ex * lx + ez * lz) / (d * d), 0, 1), px = lx * k - ex, pz = lz * k - ez;
          lane = Math.min(lane, Math.hypot(px, pz));
        }
        const prog = this.toAx(t, q.pos.x) - this.toAx(t, p.pos.x);
        let s = prog * 2.4 + open / 10 + lane / 4 * 1.3 - d * 0.012 + (q.gk ? -1.5 : 0);
        if (lane < 1.2) s -= 1.6;
        out.push({ q, s, d, open });
      }
      out.sort((a, b) => b.s - a.s);
      return out;
    }
    ownerAI(p, dt) {
      if (p.think > 0) { this.dribble(p); return; }
      const t = p.team, o = this.opp(t), sk = this.aiSkill(t);
      p.think = rnd(0.16, 0.3) + (1 - sk) * 0.25;
      const gx = this.oppGoalX(t), dg = Math.hypot(gx - p.pos.x, p.pos.z), ax = this.toAx(t, p.pos.x);
      let press = 99;
      for (const e of o.players) { const dd = this.dist(e.pos, p.pos); if (dd < press) press = dd; }
      // Spezialkraft vor dem Schuss
      if (t.power >= 100 && !t.human) {
        const id = t.def.special.id;
        if ((id === 'thunder' || id === 'fire' || id === 'magic') && dg < 28) this.activateSpecial(t);
        else if ((id === 'sprint' || id === 'stone') && ax > 0.45) this.activateSpecial(t);
      }
      const angleOk = Math.abs(p.pos.z) < 16;
      let sp = 0;
      if (dg < 12) sp = 0.75; else if (dg < 19 && angleOk) sp = 0.4; else if (dg < 27 && angleOk && p.stats.schuss > 80) sp = 0.08;
      if (t.nextShot && dg < 30) sp = Math.max(sp, 0.6);
      if (Math.random() < sp) { this.shoot(p, clamp(0.45 + dg / 45 + rnd(-0.1, 0.1), 0.35, 0.95), null); return; }
      // Flanke
      if (ax > 0.8 && Math.abs(p.pos.z) > W2 * 0.45 && Math.random() < 0.45) {
        const tg = t.players.filter(q => !q.gk && q !== p && this.toAx(t, q.pos.x) > 0.74 && Math.abs(q.pos.z) < 14);
        if (tg.length) { this.passTo(p, tg[Math.floor(Math.random() * tg.length)], 'lob'); return; }
      }
      const opts = this.passOptions(p), best = opts[0];
      const held = this.time - (p.gotT || 0);
      const pp = press < 2.6 ? 0.55 : held < 0.8 ? 0 : press < 5 ? 0.2 : 0.07;
      if (best && Math.random() < pp && best.s > (press < 2.8 ? -0.6 : 0.25)) {
        const ahead = this.toAx(t, best.q.pos.x) - ax;
        const type = ahead > 0.08 && best.open > 4 && Math.random() < 0.45 ? 'through' : best.d > 28 ? 'lob' : 'ground';
        this.passTo(p, best.q, type); return;
      }
      if (ax < 0.22 && press < 2.2) { // befreien
        this.passDir(p, t.dir, -p.pos.z * 0.02, 'lob'); return;
      }
      this.dribble(p);
    }
    dribble(p) {
      const t = p.team, o = this.opp(t), gx = this.oppGoalX(t);
      let dx = gx - p.pos.x, dz = (0 - p.pos.z) * (Math.abs(gx - p.pos.x) < 30 ? 0.9 : 0.25);
      let l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
      let ax = 0, az = 0;
      for (const e of o.players) {
        const ex = e.pos.x - p.pos.x, ez = e.pos.z - p.pos.z, d = Math.hypot(ex, ez);
        if (d > 7 || d < 0.01) continue;
        const front = (ex * dx + ez * dz) / d; if (front < -0.2) continue;
        const side = (ex * -dz + ez * dx) > 0 ? -1 : 1; // nach links oder rechts ausweichen
        const w = (7 - d) / 7 * (front + 0.5);
        ax += -dz * side * w * 1.4; az += dx * side * w * 1.4;
        ax -= ex / d * w * 0.4; az -= ez / d * w * 0.4;
      }
      if (Math.abs(p.pos.z) > W2 - 4) az += -Math.sign(p.pos.z) * 0.8;
      dx += ax; dz += az; l = Math.hypot(dx, dz) || 1;
      p.hasTarget = true; p.target.set(p.pos.x + dx / l * 5, 0, p.pos.z + dz / l * 5);
      let near = 99; for (const e of o.players) near = Math.min(near, this.dist(e.pos, p.pos));
      p.sprint = near > 3 && p.stamina > 0.3;
    }
    keeperAI(p, dt) {
      const t = p.team, b = this.ball, gx = this.ownGoalX(t);
      if (p.state === 'hold') {
        p.holdT += dt; p.vel.set(0, 0, 0);
        if (p.throwT > 0) { p.throwT -= dt; return; }
        if (p.holdT > (t.human ? 1.1 : rnd(1.2, 1.8))) {
          const opts = this.passOptions(p).filter(x => !x.q.gk);
          const pick = opts.find(x => x.s > -0.2 && x.d < 32) || opts[0];
          p.state = 'keeper';
          if (pick) this.passTo(p, pick.q, pick.d > 24 ? 'lob' : 'ground');
          else this.passDir(p, t.dir, rnd(-0.4, 0.4), 'lob');
        }
        return;
      }
      if (p.state === 'dive') return;
      // Position: auf der Linie zwischen Ball und Tormitte
      const bx = b.pos.x, bz = b.pos.z, dgb = Math.hypot(bx - gx, bz) || 1;
      let off = clamp(dgb * 0.1, 0.6, 4.5);
      // Herauslaufen bei freiem Ball im Strafraum
      if (!b.owner && this.inBox(t, bx, bz) && b.vel.length() < 9 && Math.abs(bx - gx) < 14) {
        let closest = true; for (const q of this.opp(t).players) if (this.dist(q.pos, b.pos) < this.dist(p.pos, b.pos) - 1) { closest = false; break; }
        if (closest) { p.target.set(bx, 0, bz); p.hasTarget = true; p.sprint = true; return; }
      }
      if (b.owner && b.owner.ti !== t.idx && dgb < 9) off = Math.min(dgb - 1.2, 3.5);
      let tx = gx + (bx - gx) / dgb * off, tz = bz / dgb * off * 1.0;
      tz = clamp(tz + (bz * 0.08), -P.GW / 2 + 0.3, P.GW / 2 - 0.3);
      if (p.save) { tz = clamp(p.save.z, -P.GW / 2 - 0.5, P.GW / 2 + 0.5); tx = gx + t.dir * 0.6; }
      p.target.set(tx, 0, tz); p.hasTarget = true; p.sprint = !!p.save;
      p.state = 'keeper';
    }
    // Torwart-Paraden
    keeperSaves(dt) {
      const b = this.ball;
      if (b.owner) { this.teams.forEach(t => { const k = t.players[0]; if (k && k.state !== 'dive') k.save = null; }); return; }
      for (const t of this.teams) {
        const k = this.keeper(t); if (!k || !k.gk) continue;
        const gx = this.ownGoalX(t), towards = -t.dir;
        if (b.vel.x * towards < 3 || Math.abs(b.pos.x - gx) > 38) { if (k.save && k.state !== 'dive') k.save = null; continue; }
        const tt = (gx - b.pos.x) / b.vel.x; if (tt <= 0 || tt > 2.5) continue;
        let pz = b.pos.z + b.vel.z * tt + 0.5 * b.curve * tt * tt, py = b.pos.y + b.vel.y * tt - 0.5 * GRAV * tt * tt;
        if (py < 0) py = Math.min(1, -py * 0.4) + R;
        if (Math.abs(pz) > P.GW / 2 + 1.2 || py > P.GH + 1) { k.save = null; continue; }
        if (!k.save || k.save.id !== b.shotId) { k.save = { id: b.shotId, z: pz, y: py, t: tt, react: this.diff.react * (t.human ? 0.7 : 1) * (1.2 - k.stats.tw / 100) + 0.05 }; }
        k.save.z = pz; k.save.y = py;
        k.save.react -= dt;
        // Hechtsprung, wenn der Ball nicht erreichbar ist
        const lat = pz - k.pos.z;
        if (k.state !== 'dive' && k.save.react <= 0 && Math.abs(lat) > 1.0 && tt < 0.75) {
          k.state = 'dive'; k.st = 0;
          k.dive = Math.sign(-lat * Math.sin(k.face)) || 1; // lokale x-Achse der Figur: (cos f, 0, -sin f)
          k.vel.set(0, 0, Math.sign(lat) * Math.min(7.5, Math.abs(lat) / Math.max(tt, 0.25)));
        }
        // Reichweite prüfen
        const reachBase = (0.85 + k.stats.tw / 100 * 0.55) * (t.human ? 1 : this.diff.gk + 0.15) * (t.wallT > 0 ? 1.8 : 1);
        let reach = reachBase * (b.special === 'thunder' ? 0.55 : b.special === 'magic' ? 0.5 : 1);
        const cx = k.pos.x, cy = k.state === 'dive' ? 0.75 : 1.05, cz = k.pos.z;
        const d = Math.hypot(b.pos.x - cx, (b.pos.y - cy) * 0.8, b.pos.z - cz);
        if (d < reach + R && k.saveCheck !== b.shotId) {
          k.saveCheck = b.shotId;
          const spd = b.vel.length();
          let chance = clamp(1.08 - spd * 0.012 + (k.stats.tw - 75) * 0.006, 0.35, 0.97) * (t.wallT > 0 ? 1.2 : 1);
          if (b.special === 'thunder') chance *= 0.5; if (b.special === 'magic') chance *= 0.4;
          if (Math.random() > chance) continue; // durchgerutscht
          const canCatch = spd < 19 + k.stats.tw * 0.08 && b.special !== 'fire' && Math.random() < 0.75;
          b.special = null; this.w.particles.burst(b.pos.x, b.pos.y, b.pos.z, '#ffffff', 14, 4, 0.5, 0.4, 3);
          A().save(); A().crowdBurst(0.35, 1.2); this.banner('PARADE!', k.name, 'save');
          if (canCatch) { this.take(k); }
          else {
            b.vel.set(t.dir * rnd(4, 9), rnd(2, 5), (Math.sign(b.pos.z - cz) || 1) * rnd(3, 8)); b.curve = 0;
            b.lastTouch = t.idx; b.lastPlayer = k; k.kickCd = 0.5;
          }
          k.save = null;
        }
      }
    }
    idleStep() {
      for (const p of this.players) {
        if (p.state === 'celebrate' || p.state === 'sad') { p.hasTarget = true; continue; }
        if (p.gk && p.state !== 'keeper') { p.state = 'keeper'; }
        if (p.state === 'run' || p.state === 'keeper') { p.hasTarget = false; p.wantX = 0; p.wantZ = 0; }
      }
    }

    // ---------- Bewegung ----------
    moveStep(dt) {
      const ps = this.players;
      for (const p of ps) {
        p.st += dt; if (p.kickCd > 0) p.kickCd -= dt; if (p.kick > 0) p.kick = Math.max(0, p.kick - dt / 0.32);
        if (p.state === 'slide') {
          const k = Math.exp(-2.6 * dt); p.vel.multiplyScalar(k);
          p.pos.addScaledVector(p.vel, dt); this.slideHit(p);
          if (p.st > 0.7) { p.state = 'run'; p.st = 0; p.kickCd = 0.35; }
          continue;
        }
        if (p.state === 'stun') { p.vel.multiplyScalar(Math.exp(-6 * dt)); p.pos.addScaledVector(p.vel, dt); if (p.st > (p.stunT || 1)) { p.state = 'run'; p.st = 0; } continue; }
        if (p.state === 'dive') {
          p.vel.multiplyScalar(Math.exp(-2.2 * dt)); p.pos.addScaledVector(p.vel, dt);
          if (p.st > 1.0) { p.state = 'keeper'; p.st = 0; p.dive = 0; p.save = null; }
          continue;
        }
        if (p.state === 'hold') { p.vel.set(0, 0, 0); continue; }
        if (p.state === 'celebrate' || p.state === 'sad') {
          if (p.hasTarget) { this.steerTo(p, p.target, 5.5, dt); } else p.vel.multiplyScalar(0.9);
          p.pos.addScaledVector(p.vel, dt); continue;
        }
        const maxS = this.speedOf(p);
        let dvx = 0, dvz = 0;
        if (p.hasTarget) {
          const ex = p.target.x - p.pos.x, ez = p.target.z - p.pos.z, d = Math.hypot(ex, ez);
          if (d > 0.15) { const s = Math.min(maxS, d * 2.2); dvx = ex / d * s; dvz = ez / d * s; }
        } else if (p.human) { dvx = (p.wantX || 0) * maxS; dvz = (p.wantZ || 0) * maxS; }
        const acc = 22 * dt, ax = dvx - p.vel.x, az = dvz - p.vel.z, al = Math.hypot(ax, az);
        if (al > acc) { p.vel.x += ax / al * acc; p.vel.z += az / al * acc; } else { p.vel.x = dvx; p.vel.z = dvz; }
        p.pos.addScaledVector(p.vel, dt);
        const sp = Math.hypot(p.vel.x, p.vel.z);
        if (p.sprint && sp > 3) p.stamina = Math.max(0, p.stamina - dt * 0.1); else p.stamina = Math.min(1, p.stamina + dt * (sp < 2 ? 0.08 : 0.04));
        // Blickrichtung
        if (sp > 0.6) p.face = lerpAng(p.face, Math.atan2(p.vel.x, p.vel.z), Math.min(1, dt * 12));
        else if (p.gk || !p.human) { const b = this.ball; p.face = lerpAng(p.face, Math.atan2(b.pos.x - p.pos.x, b.pos.z - p.pos.z), Math.min(1, dt * 5)); }
        p.pos.x = clamp(p.pos.x, -L2 - 4, L2 + 4); p.pos.z = clamp(p.pos.z, -W2 - 4, W2 + 4);
      }
      // gegenseitig wegschieben
      for (let i = 0; i < ps.length; i++) {
        const a = ps[i];
        for (let j = i + 1; j < ps.length; j++) {
          const c = ps[j], dx = c.pos.x - a.pos.x, dz = c.pos.z - a.pos.z, d2 = dx * dx + dz * dz;
          if (d2 > 0.64 || d2 < 1e-6) continue;
          const d = Math.sqrt(d2), push = (0.8 - d) * 0.5, nx = dx / d, nz = dz / d;
          a.pos.x -= nx * push; a.pos.z -= nz * push; c.pos.x += nx * push; c.pos.z += nz * push;
        }
      }
    }
    steerTo(p, tgt, s, dt) {
      const ex = tgt.x - p.pos.x, ez = tgt.z - p.pos.z, d = Math.hypot(ex, ez);
      const v = d > 0.3 ? Math.min(s, d * 2) : 0; p.vel.set(d ? ex / d * v : 0, 0, d ? ez / d * v : 0);
      if (v > 0.5) p.face = lerpAng(p.face, Math.atan2(ex, ez), Math.min(1, dt * 8));
    }

    // ---------- Ball ----------
    ballStep(dt) {
      const b = this.ball, o = b.owner;
      b.prevX = b.pos.x; b.prevZ = b.pos.z;
      if (o) {
        if (o.state === 'hold') {
          b.pos.set(o.pos.x + Math.sin(o.face) * 0.35, 1.05 * o.char.scale, o.pos.z + Math.cos(o.face) * 0.35); b.vel.set(0, 0, 0);
        } else {
          const sp = Math.hypot(o.vel.x, o.vel.z), off = 0.5 + Math.min(0.5, sp * 0.06) + Math.sin(this.time * 9) * 0.06 * Math.min(1, sp / 4);
          const tx = o.pos.x + Math.sin(o.face) * off, tz = o.pos.z + Math.cos(o.face) * off, k = Math.min(1, dt * 18);
          b.pos.x += (tx - b.pos.x) * k; b.pos.z += (tz - b.pos.z) * k; b.pos.y = R;
          b.vel.set(o.vel.x, 0, o.vel.z);
        }
        this.roll(dt, Math.hypot(o.vel.x, o.vel.z));
        // Auch beim Dribbeln: Aus, Ecke, Abstoß oder Tor prüfen
        if (o.state !== 'hold' && this.phase === 'play') { this.rules(b); if (this.phase !== 'play') { b.owner = null; b.vel.set(0, 0, 0); } }
        return;
      }
      b.vel.y -= GRAV * dt;
      if (b.curve) { b.vel.z += b.curve * dt; b.curve *= Math.exp(-0.6 * dt); }
      const drag = Math.exp(-0.06 * dt); b.vel.x *= drag; b.vel.z *= drag;
      b.pos.addScaledVector(b.vel, dt);
      if (b.pos.y < R) {
        b.pos.y = R;
        if (b.vel.y < -1.6) { b.vel.y = -b.vel.y * 0.52; b.vel.x *= 0.88; b.vel.z *= 0.88; }
        else b.vel.y = 0;
        if (b.pos.y <= R + 0.001) { const f = Math.exp(-0.62 * dt); b.vel.x *= f; b.vel.z *= f; if (Math.hypot(b.vel.x, b.vel.z) < 0.08) { b.vel.x = b.vel.z = 0; } }
      }
      this.goalFrame(b);
      if (b.special && b.vel.lengthSq() > 30) {
        const c = b.special === 'fire' ? '#ff6a00' : b.special === 'thunder' ? '#ffe14a' : '#7dffb2';
        for (let i = 0; i < 2; i++) this.w.particles.emit(b.pos.x, b.pos.y, b.pos.z, rnd(-1, 1), rnd(-0.5, 1), rnd(-1, 1), c, 0.45, 0.7, 0);
      }
      this.roll(dt, Math.hypot(b.vel.x, b.vel.z));
      this.rules(b);
    }
    roll(dt, sp) {
      const b = this.ball; if (sp < 0.05) return;
      this.tmp.set(b.vel.z, 0, -b.vel.x).normalize();
      b.mesh.rotateOnWorldAxis(this.tmp, sp * dt / R);
    }
    goalFrame(b) {
      const gw = P.GW / 2, gh = P.GH;
      for (const s of [-1, 1]) {
        const gx = s * L2;
        if (Math.abs(b.pos.x - gx) > 2.6) continue;
        // Pfosten
        for (const pz of [-gw, gw]) {
          const dx = b.pos.x - gx, dz = b.pos.z - pz, d = Math.hypot(dx, dz);
          if (d < R + 0.07 && b.pos.y < gh + R) {
            const nx = dx / d, nz = dz / d, vn = b.vel.x * nx + b.vel.z * nz;
            if (vn < 0) { b.vel.x -= 1.65 * vn * nx; b.vel.z -= 1.65 * vn * nz; if (-vn > 4) { A().post(); A().crowdBurst(0.5, 1.2); this.banner('PFOSTEN!', '', 'post'); } }
            b.pos.x = gx + nx * (R + 0.08); b.pos.z = pz + nz * (R + 0.08);
          }
        }
        // Latte
        if (Math.abs(b.pos.z) < gw) {
          const dx = b.pos.x - gx, dy = b.pos.y - gh, d = Math.hypot(dx, dy);
          if (d < R + 0.07) {
            const nx = dx / d, ny = dy / d, vn = b.vel.x * nx + b.vel.y * ny;
            if (vn < 0) { b.vel.x -= 1.6 * vn * nx; b.vel.y -= 1.6 * vn * ny; if (-vn > 4) { A().post(); A().crowdBurst(0.5, 1.2); this.banner('LATTE!', '', 'post'); } }
            b.pos.x = gx + nx * (R + 0.08); b.pos.y = gh + ny * (R + 0.08);
          }
        }
        // Netz
        if (b.inNet && Math.sign(b.pos.x) === s) {
          const back = gx + s * 2.0;
          if (Math.abs(b.pos.x) > Math.abs(back) - R) { b.pos.x = back - s * R; b.vel.x *= -0.15; b.vel.z *= 0.5; this.netKick(s); }
          if (Math.abs(b.pos.z) > gw - R) { b.pos.z = Math.sign(b.pos.z) * (gw - R); b.vel.z *= -0.2; }
          if (b.pos.y > gh - R) { b.pos.y = gh - R; b.vel.y *= -0.2; }
        }
      }
    }
    netKick(s) { const n = this.w.nets && this.w.nets[s]; if (n) { n.position.x = n.userData.baseX + s * 0.35; } }
    rules(b) {
      if (this.phase !== 'play') return;
      const gw = P.GW / 2;
      for (const s of [-1, 1]) {
        const gx = s * L2;
        if ((b.prevX - gx) * s < 0 && (b.pos.x - gx) * s >= 0) { // Linie überquert
          if (Math.abs(b.pos.z) < gw - R * 0.5 && b.pos.y < P.GH - R * 0.5) { b.inNet = true; this.goal(s > 0 ? (this.teams[0].dir > 0 ? 0 : 1) : (this.teams[0].dir < 0 ? 0 : 1)); return; }
        }
      }
      if (Math.abs(b.pos.x) > L2 + R) {
        const s = Math.sign(b.pos.x), defT = this.teams.find(t => this.ownGoalX(t) * s > 0);
        if (b.lastTouch === defT.idx) this.dead('corner', 1 - defT.idx, s * L2, Math.sign(b.pos.z || 1) * W2);
        else this.dead('goalkick', defT.idx, s * (L2 - P.SIX_D), Math.sign(b.pos.z || 1) * 4);
        return;
      }
      if (Math.abs(b.pos.z) > W2 + R) this.dead('throw', 1 - b.lastTouch, clamp(b.pos.x, -L2 + 1, L2 - 1), Math.sign(b.pos.z) * W2);
    }

    // ---------- Ballbesitz und Zweikämpfe ----------
    possessionStep(dt) {
      const b = this.ball;
      if (b.owner) return;
      let best = null, bd = 9;
      for (const p of this.players) {
        if (p.kickCd > 0 || p.state === 'stun' || p.state === 'slide' || p.state === 'hold') continue;
        const d = Math.hypot(p.pos.x - b.pos.x, p.pos.z - b.pos.z);
        const gkBox = p.gk && this.inBox(p.team, b.pos.x, b.pos.z);
        const rad = gkBox ? 1.15 : p.expect ? 1.0 : 0.85, hmax = gkBox ? 2.4 : 2.0;
        if (d < rad && b.pos.y < hmax && d < bd) { bd = d; best = p; }
      }
      if (!best) return;
      const sp = b.vel.length();
      // Kopfball aufs Tor
      if (!best.gk && b.pos.y > 1.3 && Math.hypot(this.oppGoalX(best.team) - best.pos.x, best.pos.z) < 17 && (best.human ? (best.human.queue && best.human.queue.k === 'shot') || IN().down(best.human.dev, 'b') : Math.random() < 0.7)) { this.header(best); return; }
      if (!best.gk && sp > 24 && Math.random() < 0.5) { // zu hart: prallt ab
        b.vel.multiplyScalar(-0.25); b.vel.y = Math.abs(b.vel.y) + 2; best.kickCd = 0.25; b.lastTouch = best.ti; b.lastPlayer = best; return;
      }
      if (best.gk && b.special === 'fire' && b.lastTouch !== best.ti && sp > 12) { // Feuerball lässt sich nicht fangen: nur abwehren
        b.special = null; b.vel.set(best.team.dir * rnd(4, 9), rnd(2, 5), (Math.sign(b.pos.z - best.pos.z) || 1) * rnd(3, 8)); b.curve = 0;
        b.lastTouch = best.ti; b.lastPlayer = best; best.kickCd = 0.5; A().save(); return;
      }
      if (best.gk && b.pos.y > 1.2 && b.lastTouch !== best.ti) A().save();
      this.take(best);
    }
    take(p) {
      const b = this.ball, prev = b.lastTouch, from = b.passFrom;
      b.owner = p; b.curve = 0; b.special = null; b.passFrom = null; b.passTo = null; p.gotT = this.time;
      if (from && from.ti === p.ti && from !== p) p.team.st.passOk++;
      if (from && from.ti !== p.ti) p.team.power = Math.min(100, p.team.power + 4);
      b.lastTouch = p.ti; b.lastPlayer = p;
      p.expect = null; p.hasTarget = false;
      this.players.forEach(q => { if (q.ti === p.ti) q.expect = null; });
      if (p.gk) { p.state = 'hold'; p.holdT = 0; p.vel.set(0, 0, 0); }
      // Mensch übernimmt den Ballführer
      if (p.team.human && !p.gk && !p.human) {
        let hh = null, hd = 1e9;
        this.humans.forEach(h => { if (h.team === p.ti) { const d = h.player ? this.dist(h.player.pos, p.pos) : 0; if (d < hd) { hd = d; hh = h; } } });
        if (hh) this.give(hh, p);
      }
      if (p.human && p.human.queue) {
        const q = p.human.queue; p.human.queue = null;
        const d = IN().get(p.human.dev), mv = Math.hypot(d.mx, d.my) > 0.15;
        const dx = mv ? d.mx : Math.sin(p.face), dz = mv ? d.my : Math.cos(p.face);
        if (q.k === 'shot') this.shoot(p, q.pw, mv ? clamp(d.my, -1, 1) : null);
        else this.passDir(p, dx, dz, q.k);
      }
      void prev;
    }
    standTackle(p) {
      const b = this.ball, o = b.owner;
      if (p.kickCd > 0 || p.state !== 'run' || this.phase !== 'play') return;
      p.kick = 1; p.kickCd = 0.45;
      if (!o || o.ti === p.ti || o.gk || o.state === 'hold') return;
      const d = this.dist(p.pos, o.pos); if (d > 1.9) return;
      let ch = 0.42 + (p.stats.abwehr - (o.stats.tempo + o.stats.pass) / 2) / 120 + (p.human ? 0.1 : (this.aiSkill(p.team) - 0.85) * 0.5);
      if (o.team.stoneT > 0) ch = 0;
      p.team.st.tackles++;
      if (Math.random() < ch) {
        b.owner = null; b.vel.set((p.pos.x - o.pos.x) * 2 + rnd(-1, 1), 0.5, (p.pos.z - o.pos.z) * 2 + rnd(-1, 1));
        b.lastTouch = p.ti; b.lastPlayer = p; o.kickCd = 0.55; A().tackle(); p.team.power = Math.min(100, p.team.power + 8);
        if (o.human) IN().rumble(o.human.dev, 0.4, 120);
      } else { p.kickCd = 0.7; }
    }
    slide(p) {
      if (p.state !== 'run' || p.kickCd > 0 || this.phase !== 'play') return;
      p.state = 'slide'; p.st = 0; p.slideDone = false;
      const s = 9.5 + p.stats.tempo / 100 * 1.5; p.vel.set(Math.sin(p.face) * s, 0, Math.cos(p.face) * s);
      this.w.particles.burst(p.pos.x, 0.1, p.pos.z, '#c9b38a', 6, 2, 0.5, 0.5, 2);
    }
    slideHit(p) {
      if (p.slideDone || p.st > 0.5 || this.phase !== 'play') return;
      const b = this.ball, fx = Math.sin(p.face), fz = Math.cos(p.face);
      const foot = { x: p.pos.x + fx * 0.7, z: p.pos.z + fz * 0.7 };
      const o = b.owner;
      const db = Math.hypot(b.pos.x - foot.x, b.pos.z - foot.z);
      if (db < 0.95 && b.pos.y < 0.8 && (!o || o.ti !== p.ti)) {
        if (o && o.team.stoneT > 0) { p.slideDone = true; p.state = 'stun'; p.st = 0; p.stunT = 0.8; A().tackle(); return; }
        p.slideDone = true;
        if (o) {
          // von hinten? -> Foul möglich
          const behind = Math.sin(o.face) * fx + Math.cos(o.face) * fz > 0.55;
          if (behind && Math.random() < 0.55) { this.foul(p, o); return; }
          o.state = 'stun'; o.st = 0; o.stunT = 0.8; o.kickCd = 0.6;
          if (o.human) IN().rumble(o.human.dev, 0.6, 180);
        }
        b.owner = null; b.vel.set(fx * 7 + rnd(-2, 2), 1, fz * 7 + rnd(-2, 2)); b.lastTouch = p.ti; b.lastPlayer = p;
        A().tackle(); p.team.power = Math.min(100, p.team.power + 8); p.team.st.tackles++;
        return;
      }
      if (o && o.ti !== p.ti && Math.hypot(o.pos.x - foot.x, o.pos.z - foot.z) < 0.85) { p.slideDone = true; this.foul(p, o); }
    }
    foul(p, o) {
      o.state = 'stun'; o.st = 0; o.stunT = 1.1; A().tackle(); A().whistle(1);
      p.team.st.fouls++;
      const card = Math.random() < 0.3;
      if (this.inBox(p.team, o.pos.x, o.pos.z)) this.dead('penalty', o.ti, this.ownGoalX(p.team) + p.team.dir * P.SPOT, 0, card ? 'Gelbe Karte: ' + p.name : 'Foul von ' + p.name);
      else this.dead('free', o.ti, o.pos.x, o.pos.z, card ? 'Gelbe Karte: ' + p.name : 'Foul von ' + p.name);
    }

    // ---------- Pässe und Schüsse ----------
    kickBall(p, vx, vy, vz, kind, power) {
      const b = this.ball;
      b.owner = null; b.vel.set(vx, vy, vz); b.lastTouch = p.ti; b.lastPlayer = p; b.curve = 0; b.inNet = false;
      p.kickCd = 0.32; p.kick = 1; if (p.state === 'hold') { p.state = 'keeper'; p.throwT = 0; }
      b.pos.y = Math.max(b.pos.y, R + 0.02);
      A().kick(power != null ? power : 0.5);
      if (this.phase === 'setpiece') { this.phase = 'play'; this.setPiece = null; this.players.forEach(q => { q.wall = 0; }); }
      if (kind === 'shot') { b.shotId++; p.team.st.shots++; }
      if (p.human) IN().rumble(p.human.dev, kind === 'shot' ? 0.5 : 0.2, kind === 'shot' ? 120 : 50);
    }
    header(p) {
      const t = p.team, b = this.ball, gx = this.oppGoalX(t), k = this.opp(t).players[0];
      const az = (k && k.pos.z > 0 ? -1 : 1) * rnd(0.5, 3.4), ay = rnd(0.3, 2.2);
      const dx = gx - b.pos.x, dz = az - b.pos.z, d = Math.hypot(dx, dz) || 1, spd = rnd(12, 16) * (0.85 + p.stats.schuss / 400), tt = d / spd;
      if (p.human) p.human.queue = null;
      this.kickBall(p, dx / d * spd, (ay - b.pos.y) / tt + 0.5 * GRAV * tt, dz / d * spd, 'shot', 0.6);
      p.kick = 0; this.banner('KOPFBALL!', p.name, 'info');
    }
    passDir(p, dx, dz, type) {
      const t = p.team; let l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
      let best = null, bs = -1e9;
      for (const q of t.players) {
        if (q === p) continue;
        const ex = q.pos.x - p.pos.x, ez = q.pos.z - p.pos.z, d = Math.hypot(ex, ez); if (d < 2.5) continue;
        const cos = (ex * dx + ez * dz) / d; if (cos < 0.3) continue;
        let open = 10; for (const e of this.opp(t).players) open = Math.min(open, this.dist(e.pos, q.pos));
        const s = cos * 3 - d / 30 + open / 20 - (q.gk ? 2 : 0);
        if (s > bs) { bs = s; best = q; }
      }
      if (!best) { // niemand in Blickrichtung: nächsten freien Mitspieler nehmen
        for (const q of t.players) {
          if (q === p || q.gk) continue;
          const ex = q.pos.x - p.pos.x, ez = q.pos.z - p.pos.z, d = Math.hypot(ex, ez); if (d < 2.5 || d > 35) continue;
          const s = (ex * dx + ez * dz) / d * 1.5 - d / 25;
          if (s > bs) { bs = s; best = q; }
        }
      }
      if (best) this.passTo(p, best, type);
      else { // in den Raum
        const sp = type === 'lob' ? 18 : 14;
        if (type === 'lob') this.kickBall(p, dx * sp, 8, dz * sp, 'pass', 0.6); else this.kickBall(p, dx * sp, 0.6, dz * sp, 'pass', 0.4);
        p.team.st.passes++; this.ball.passFrom = p;
      }
    }
    passTo(p, q, type) {
      const t = p.team, acc = p.human ? 0.92 : this.diff.acc;
      const err = (1.12 - p.stats.pass / 100) * (1.15 - acc) * 0.5;
      let tx = q.pos.x, tz = q.pos.z;
      let d = Math.hypot(tx - p.pos.x, tz - p.pos.z);
      const lead = type === 'lob' ? 1.0 : d / 17;
      tx += q.vel.x * lead * 0.8; tz += q.vel.z * lead * 0.8;
      if (type === 'through') {
        tx += t.dir * 7; tz += (0 - tz) * 0.15;
        tx = clamp(tx, -L2 + 2, L2 - 2);
      }
      tz = clamp(tz, -W2 + 1, W2 - 1);
      d = Math.hypot(tx - p.pos.x, tz - p.pos.z) || 1;
      let ang = Math.atan2(tz - p.pos.z, tx - p.pos.x) + gauss() * err;
      const cx = Math.cos(ang), cz = Math.sin(ang);
      if (type === 'lob') {
        const T2 = clamp(d / 17, 0.85, 1.9), vh = d / T2 * 0.97;
        this.kickBall(p, cx * vh, GRAV * T2 / 2, cz * vh, 'pass', 0.6);
      } else {
        const v = clamp(6 + d * 0.52, 9.5, 23) * (type === 'through' ? 1.05 : 1);
        this.kickBall(p, cx * v, 0.4, cz * v, 'pass', 0.35);
      }
      t.st.passes++; this.ball.passFrom = p; this.ball.passTo = q;
      q.expect = { x: tx, z: tz, t: 2.4 };
      if (p.human && q !== p && !q.gk) { const h = p.human; this.give(h, q); }
      else if (t.human && p.gk && !q.gk) { const h = this.humans.find(x => x.team === t.idx); if (h) this.give(h, q); }
    }
    shoot(p, power, aim) {
      const t = p.team, b = this.ball, gx = this.oppGoalX(t), gw = P.GW / 2 - 0.4;
      const k = this.opp(t).players[0];
      let az;
      if (aim != null) az = clamp(aim, -1, 1) * gw;
      else { const kz = k ? k.pos.z : 0; az = (kz > 0 ? -1 : 1) * gw * rnd(0.45, 0.95); }
      let ay = 0.3 + power * 1.75;
      const special = t.nextShot; t.nextShot = null;
      const dist = Math.hypot(gx - b.pos.x, az - b.pos.z);
      const acc = p.human ? 1 : this.diff.acc;
      let err = (1.18 - p.stats.schuss / 100) * (0.55 + power * 0.8) * (0.45 + dist / 28) * (1.25 - acc * 0.35);
      if (special === 'thunder') err *= 0.25; if (special === 'magic') err = 0;
      az += gauss() * err * 1.3; ay += gauss() * err * 0.6;
      if (power > 0.92) ay += (power - 0.92) * 14 * Math.random();
      ay = Math.max(R, ay);
      let spd = (15 + power * 17) * (0.84 + p.stats.schuss / 100 * 0.26);
      if (special === 'thunder') spd *= 1.45; if (special === 'fire') spd *= 1.25;
      const dx = gx - b.pos.x, dz = az - b.pos.z, dh = Math.hypot(dx, dz) || 1, tt = dh / spd;
      let curve = 0, zAim = az;
      if (special === 'magic') { curve = -Math.sign(az - (k ? k.pos.z : 0)) * 16; }
      else curve = gauss() * 2.5;
      zAim = az - 0.5 * curve * tt * tt; // so zielen, dass die Kurve ins Ziel trägt
      const ex = gx - b.pos.x, ez = zAim - b.pos.z, eh = Math.hypot(ex, ez) || 1;
      const vy = (ay - b.pos.y) / tt + 0.5 * GRAV * tt;
      this.kickBall(p, ex / eh * spd, vy, ez / eh * spd, 'shot', power);
      b.curve = curve; b.special = special;
      if (Math.abs(az) < P.GW / 2 && ay < P.GH) t.st.onT++;
      t.power = Math.min(100, t.power + 5);
      if (special) { this.w.particles.burst(b.pos.x, b.pos.y + 0.3, b.pos.z, special === 'fire' ? '#ff5a00' : special === 'thunder' ? '#ffe14a' : '#7dffb2', 30, 6, 0.6, 0.8, 0); }
      A().crowd(0.13);
    }

    // ---------- Fabel-Kräfte ----------
    activateSpecial(t) {
      if (t.power < 100 || this.phase !== 'play' && this.phase !== 'setpiece') return false;
      t.power = 0;
      const o = this.opp(t), id = t.def.special.id;
      if (id === 'sprint') t.boostT = 6;
      else if (id === 'roar') o.slowT = 4;
      else if (id === 'freeze') o.freezeT = 2.5;
      else if (id === 'stone') t.stoneT = 8;
      else if (id === 'wall') t.wallT = 12;
      else { t.nextShot = id; t.nextShotT = 15; }
      A().special(); this.w.cheer = 0.6;
      this.banner(t.def.special.name.toUpperCase(), t.def.name, 'special');
      const c = t.def.kit.shirt;
      t.players.forEach(p => this.w.particles.burst(p.pos.x, 1, p.pos.z, c, 6, 3, 0.8, 0.6, 1));
      this.humans.forEach(h => { if (h.team === t.idx) IN().rumble(h.dev, 0.7, 250); });
      return true;
    }

    // ---------- Standardsituationen ----------
    dead(type, ti, x, z, sub) {
      this.phase = 'dead'; this.deadT = type === 'penalty' ? 1.6 : 1.1;
      this.pending = { type, team: ti, x, z };
      const names = { corner: 'ECKSTOSS', goalkick: 'ABSTOSS', throw: 'EINWURF', free: 'FREISTOSS', penalty: 'ELFMETER!' };
      if (type !== 'throw' && type !== 'goalkick') A().whistle(1);
      this.banner(names[type], sub || this.teams[ti].def.name, type === 'penalty' ? 'pen' : 'info');
      if (type === 'corner' || type === 'penalty') A().crowdBurst(0.3, 1.5);
      this.players.forEach(p => { p.expect = null; });
    }
    arrange() {
      const pd = this.pending, b = this.ball;
      if (this.mode === 'training' && pd.team === 1 && pd.type !== 'goalkick') { pd.type = 'goalkick'; pd.x = this.ownGoalX(this.teams[1]) + this.teams[1].dir * P.SIX_D; pd.z = 4; }
      const t = this.teams[pd.team], o = this.opp(t);
      if (this.on.fade) this.on.fade();
      b.owner = null; b.vel.set(0, 0, 0); b.curve = 0; b.special = null; b.inNet = false;
      let bx = pd.x, bz = pd.z;
      if (pd.type === 'corner') { bx = clamp(bx, -L2 + 0.3, L2 - 0.3); bz = clamp(bz, -W2 + 0.3, W2 - 0.3); }
      if (pd.type === 'throw') { bz = Math.sign(bz) * (W2 - 0.3); }
      b.pos.set(bx, R, bz);
      let taker;
      if (pd.type === 'goalkick') taker = t.players[0];
      else if (pd.type === 'penalty') taker = t.players.slice(1).sort((a, c) => c.stats.schuss - a.stats.schuss)[0] || t.players[0];
      else { const cand = t.players.filter(p => !p.gk && p.state !== 'stun'); cand.sort((a, c) => this.dist(a.pos, b.pos) - this.dist(c.pos, b.pos)); taker = cand[0] || t.players[0]; }
      // Grundaufstellung
      this.teams.forEach(tt => tt.players.forEach(p => {
        if (p.state === 'stun') { p.state = 'run'; }
        if (p.gk) { this.place(p, this.ownGoalX(tt) + tt.dir * 0.8, 0); return; }
        const f = this.formationTarget(p, tt === t);
        if (this.dist(p.pos, f) > 12 || pd.type !== 'throw') { p.pos.set(f.x + rnd(-2, 2), 0, f.z + rnd(-2, 2)); p.vel.set(0, 0, 0); }
        p.state = 'run'; p.hasTarget = false; p.expect = null;
      }));
      const gxA = this.oppGoalX(t);
      if (pd.type === 'corner') {
        const att = t.players.filter(p => !p.gk && p !== taker).sort((a, c) => (c.role === 'FW') - (a.role === 'FW') || (c.role === 'MF') - (a.role === 'MF'));
        att.slice(0, 6).forEach((p, i) => { p.pos.set(gxA - t.dir * rnd(5, 14), 0, rnd(-9, 9)); });
        o.players.filter(p => !p.gk).slice(0, 7).forEach(p => { p.pos.set(gxA - t.dir * rnd(3, 13), 0, rnd(-10, 10)); });
      }
      if (pd.type === 'penalty') {
        const gx = this.oppGoalX(t);
        this.players.forEach(p => { if (p.gk || p === taker) return; p.pos.set(gx - t.dir * rnd(19, 24), 0, rnd(-15, 15)); });
        const k = o.players[0]; this.place(k, gx - t.dir * 0.3, 0, t.dir > 0 ? -Math.PI / 2 : Math.PI / 2);
      }
      if (pd.type === 'free') { // Mauer
        const gx = this.oppGoalX(t), d = Math.hypot(gx - bx, bz);
        if (d < 32) {
          const ux = (gx - bx) / d, uz = (0 - bz) / d;
          o.players.filter(p => !p.gk).slice(0, 3).forEach((p, i) => { p.pos.set(bx + ux * 9.15 + -uz * (i - 1) * 0.75, 0, bz + uz * 9.15 + ux * (i - 1) * 0.75); p.face = Math.atan2(-ux, -uz); p.wall = 1.2; });
        }
      }
      // Gegner auf Abstand
      o.players.forEach(p => {
        if (p.gk) return;
        const d = this.dist(p.pos, b.pos), min = pd.type === 'throw' ? 3 : 9.2;
        if (d < min) { const dx = (p.pos.x - b.pos.x) / (d || 1), dz = (p.pos.z - b.pos.z) / (d || 1); p.pos.x = b.pos.x + dx * min; p.pos.z = b.pos.z + dz * min; }
      });
      // Schütze hinter den Ball
      let aimX = gxA - bx, aimZ = -bz;
      if (pd.type === 'throw' || pd.type === 'goalkick') { aimX = t.dir * 10; aimZ = -Math.sign(bz) * 6; }
      const al = Math.hypot(aimX, aimZ) || 1;
      this.place(taker, bx - aimX / al * 0.55, bz - aimZ / al * 0.55, Math.atan2(aimX, aimZ));
      this.setPiece = { type: pd.type, team: pd.team, taker, t: 0 };
      b.owner = taker; b.lastTouch = pd.team;
      this.phase = 'setpiece';
      this.autoHumans(pd.team);
      this.players.forEach(p => { if (p.wall) { p.hasTarget = true; p.target.copy(p.pos); } });
    }
    setPieceAI(sp) {
      const p = sp.taker, t = p.team;
      const human = p.human;
      if (human) { if (sp.t > 9) this.passDir(p, Math.sin(p.face), Math.cos(p.face), 'ground'); return; }
      if (sp.t < (sp.type === 'kickoff' ? 0.9 : sp.type === 'penalty' ? 1.6 : 1.3)) return;
      const gx = this.oppGoalX(t);
      if (sp.type === 'kickoff') { const q = t.players[6] && t.players[6] !== p ? t.players[6] : t.players[0]; this.passTo(p, q, 'ground'); return; }
      if (sp.type === 'penalty') { this.shoot(p, rnd(0.55, 0.8), rnd(-1, 1) > 0 ? rnd(0.5, 1) : rnd(-1, -0.5)); return; }
      if (sp.type === 'corner') {
        const tg = t.players.filter(q => q !== p && !q.gk && Math.abs(q.pos.x - gx) < 16);
        if (tg.length) this.passTo(p, tg[Math.floor(Math.random() * tg.length)], 'lob'); else this.passDir(p, -Math.sign(p.pos.x) || 1, -Math.sign(p.pos.z), 'lob');
        return;
      }
      if (sp.type === 'free') {
        const d = Math.hypot(gx - this.ball.pos.x, this.ball.pos.z);
        if (d < 28 && Math.abs(this.ball.pos.z) < 18) { this.shoot(p, rnd(0.55, 0.8), null); return; }
      }
      const opts = this.passOptions(p);
      if (opts.length) this.passTo(p, opts[0].q, sp.type === 'goalkick' && opts[0].d > 22 ? 'lob' : (opts[0].d > 30 ? 'lob' : 'ground'));
      else this.passDir(p, t.dir, 0, 'lob');
      this.players.forEach(q => { q.wall = 0; });
    }

    // ---------- Tore, Halbzeit, Ende ----------
    goal(ti) {
      const t = this.teams[ti], b = this.ball, lp = b.lastPlayer;
      t.score++; this.phase = 'goal'; this.goalT = 4.2; this.goalTeam = ti;
      const own = lp && lp.ti !== ti;
      const scorer = own ? lp : (lp || t.players[9] || t.players[0]);
      const min = this.minuteText().split(':')[0];
      this.scorers.push({ team: ti, name: scorer.name, min: this.mode === 'training' ? '' : (+min + 1) + '.', own });
      this.goalScorer = scorer;
      A().goal(); A().whistle(1); this.w.cheer = 1.4;
      this.banner('TOR!', own ? 'Eigentor – ' + scorer.name : scorer.name + ' trifft für ' + t.def.name, 'goal');
      const c = t.def.kit.shirt, c2 = t.def.kit.trim;
      for (let i = 0; i < 4; i++) this.w.particles.burst(b.pos.x, 2, b.pos.z + rnd(-3, 3), i % 2 ? c : c2, 30, 9, 1.8, 0.7, 6);
      this.players.forEach(p => {
        if (p.ti === ti && !p.gk) { p.state = 'celebrate'; p.st = 0; p.hasTarget = true; p.target.set(scorer.pos.x + rnd(-2, 2), 0, scorer.pos.z + rnd(-2, 2)); }
        else if (!p.gk) { p.state = 'sad'; p.st = 0; p.hasTarget = false; p.vel.set(0, 0, 0); }
      });
      if (!own) { scorer.hasTarget = true; scorer.target.set(clamp(scorer.pos.x - t.dir * 6, -L2 + 2, L2 - 2), 0, clamp(scorer.pos.z * 1.4, -W2 + 2, W2 - 2)); }
      this.humans.forEach(h => IN().rumble(h.dev, h.team === ti ? 0.9 : 0.3, 400));
      if (this.on.goal) this.on.goal(ti);
    }
    endHalf() {
      if (this.half === 1) {
        this.half = 2; this.phase = 'half'; this.halfT = 3.2; this.clock = 0;
        A().whistle(2, true); this.banner('HALBZEIT', this.teams[0].score + ' : ' + this.teams[1].score, 'info');
      } else {
        A().whistle(3, true);
        const draw = this.teams[0].score === this.teams[1].score;
        if (draw && this.o.decide) { this.banner('ELFMETERSCHIESSEN', 'Unentschieden – die Entscheidung fällt vom Punkt', 'pen'); this.phase = 'half'; this.halfT = 3; this.toShootout = true; return; }
        this.finish();
      }
    }
    secondHalf() {
      if (this.toShootout) { this.toShootout = false; this.startShootout(false); return; }
      this.teams.forEach(t => { t.dir = -t.dir; });
      if (this.on.fade) this.on.fade();
      this.kickoff(1);
      this.banner('2. HALBZEIT', '', 'kick');
    }
    finish() {
      this.phase = 'end';
      const s = [this.teams[0].score, this.teams[1].score];
      let winner = s[0] > s[1] ? 0 : s[1] > s[0] ? 1 : -1;
      if (this.pens) winner = this.pens[0] > this.pens[1] ? 0 : 1;
      const tot = this.poss[0] + this.poss[1] || 1;
      const res = { score: s, pens: this.pens || null, winner, scorers: this.scorers, mode: this.mode,
        stats: this.teams.map((t, i) => ({ poss: Math.round(this.poss[i] / tot * 100), shots: t.st.shots, onT: t.st.onT, passes: t.st.passes, passOk: t.st.passOk, tackles: t.st.tackles, fouls: t.st.fouls })) };
      this.players.forEach(p => { if (!p.gk) { p.state = winner === -1 ? 'run' : (p.ti === winner ? 'celebrate' : 'sad'); p.hasTarget = false; p.vel.set(0, 0, 0); } });
      this.w.cheer = 1;
      if (this.on.end) this.later(() => this.on.end(res), 1800);
    }

    // ---------- Elfmeterschießen ----------
    startShootout(direct) {
      this.phase = 'shootout'; this.pens = [0, 0];
      this.so = { kicks: [[], []], turn: 0, n: 0, step: 'setup', t: 0, order: this.teams.map(t => t.players.slice().sort((a, b) => (b.gk ? -1 : 0) - (a.gk ? -1 : 0) || b.stats.schuss - a.stats.schuss)) };
      if (!this.aimMark) {
        this.aimMark = new T.Mesh(new T.RingGeometry(0.22, 0.34, 32), new T.MeshBasicMaterial({ color: FK.col('#ffcc33'), transparent: true, opacity: 0.95, depthTest: false, side: T.DoubleSide }));
        this.aimMark.rotation.y = -Math.PI / 2; this.aimMark.renderOrder = 5; this.w.scene.add(this.aimMark);
      }
      this.aimMark.visible = false;
      if (direct) this.banner('ELFMETERSCHIESSEN', this.teams[0].def.name + ' – ' + this.teams[1].def.name, 'pen');
      this.soSetup();
    }
    soSetup() {
      const so = this.so, st = this.teams[so.turn], kt = this.opp(st), b = this.ball;
      const list = so.order[so.turn], shooter = list[Math.floor(so.n / 2) % list.length];
      const keeper = kt.players[0];
      so.shooter = shooter; so.keeper = keeper; so.step = 'aim'; so.t = 0; so.aimZ = 0; so.aimY = 1; so.charge = -1; so.kdir = 0; so.kup = 0; so.result = null;
      if (this.on.fade) this.on.fade();
      // alle anderen an den Mittelkreis
      this.players.forEach(p => {
        if (p === shooter || p === keeper) return;
        const i = p.idx + p.ti * 11; this.place(p, -2 - (p.ti ? 3 : 0), (i % 11 - 5) * 1.6, Math.PI / 2); p.state = p.gk ? 'keeper' : 'run';
      });
      b.owner = null; b.vel.set(0, 0, 0); b.pos.set(L2 - P.SPOT, R, 0); b.special = null; b.curve = 0; b.inNet = false;
      this.place(shooter, L2 - P.SPOT - 1.6, -0.4, Math.PI / 2);
      this.place(keeper, L2 - 0.3, 0, -Math.PI / 2); keeper.state = 'keeper';
      this.players.forEach(p => { p.human = null; });
      so.hShoot = this.humans.find(h => h.team === shooter.ti) || null;
      so.hKeep = this.humans.find(h => h.team === keeper.ti) || null;
      this.humans.forEach(h => { h.player = null; });
      if (so.hShoot) { this.aimMark.visible = true; }
      A().whistle(1);
    }
    stepShootout(dt) {
      const so = this.so, b = this.ball, I = IN();
      so.t += dt;
      this.moveStep(dt);
      if (so.step === 'aim') {
        const sh = so.shooter;
        sh.vel.set(0, 0, 0); sh.state = 'run';
        if (so.hKeep) { const d = I.get(so.hKeep.dev); if (Math.abs(d.mx) > 0.35) so.kdir = Math.sign(d.mx); else if (Math.abs(d.mx) < 0.15 && I.down(so.hKeep.dev, 'a')) so.kdir = 0; if (d.my < -0.4) so.kup = 1; else if (d.my > 0.4) so.kup = 0; }
        if (so.hShoot) {
          const d = I.get(so.hShoot.dev);
          so.aimZ = clamp(so.aimZ + d.mx * dt * 4.5, -P.GW / 2 - 0.6, P.GW / 2 + 0.6);
          so.aimY = clamp(so.aimY - d.my * dt * 3, 0.25, P.GH + 0.6);
          this.aimMark.position.set(L2 + 0.05, so.aimY, so.aimZ);
          if (I.down(so.hShoot.dev, 'b') || I.down(so.hShoot.dev, 'a')) { if (so.charge < 0) so.charge = 0; so.charge += dt; }
          else if (so.charge >= 0) this.soKick(Math.min(1, so.charge / 0.9));
          if (so.charge > 1.2 || so.t > 12) this.soKick(Math.min(1, Math.max(so.charge, 0.6) / 0.9));
        } else if (so.t > 1.8) {
          this.soKick(rnd(0.5, 0.82), rnd(-1, 1) > 0 ? rnd(1.2, P.GW / 2 - 0.25) : -rnd(1.2, P.GW / 2 - 0.25), rnd(0.3, 2.1));
        }
      } else if (so.step === 'flight') {
        const k = so.keeper;
        // Ball erreicht die Torlinie
        if (!so.done && b.pos.x > L2 - 0.7) {
          so.done = true;
          if (so.saved) {
            b.vel.set(-rnd(5, 9), rnd(2, 4), rnd(-6, 6)); b.curve = 0; A().save(); this.soResult(false, 'GEHALTEN!');
          }
        }
        this.ballStep(dt);
        if (!so.result) {
          const gx = L2;
          if (b.prevX < gx && b.pos.x >= gx) {
            if (Math.abs(b.pos.z) < P.GW / 2 - R * 0.5 && b.pos.y < P.GH - R * 0.5 && !so.saved) { b.inNet = true; this.soResult(true, 'TOR!'); }
            else this.soResult(false, 'VERSCHOSSEN!');
          } else if (so.t > 3.5) this.soResult(false, 'VERSCHOSSEN!');
        }
        void k;
      } else if (so.step === 'result') {
        this.ballStep(dt);
        if (so.t > 2.2) this.soNext();
      }
    }
    soKick(power, z, y) {
      const so = this.so, sh = so.shooter, k = so.keeper, b = this.ball;
      if (so.step !== 'aim') return;
      let tz = z != null ? z : so.aimZ, ty = y != null ? y : so.aimY;
      const human = !!so.hShoot;
      const err = (1.15 - sh.stats.schuss / 100) * (0.35 + power * 0.9) * (human ? 0.9 : 1.2 - this.diff.acc * 0.4);
      tz += gauss() * err * 0.9; ty += gauss() * err * 0.5 + (power > 0.9 ? (power - 0.9) * 10 * Math.random() : 0);
      ty = Math.max(R, ty);
      const spd = 17 + power * 12;
      const dx = L2 + 0.4 - b.pos.x, tt = dx / spd;
      this.aimMark.visible = false;
      sh.kick = 1; A().kick(power);
      b.vel.set(spd, (ty - b.pos.y) / tt + 0.5 * GRAV * tt, (tz - b.pos.z) / tt); b.lastTouch = sh.ti; b.lastPlayer = sh;
      // Torwart entscheidet sich
      let kz;
      if (so.hKeep) kz = so.kdir * 2.4;
      else {
        const guess = Math.random() < 0.28 + (k.stats.tw / 100) * 0.25 * this.diff.gk;
        kz = guess ? Math.sign(tz) * (Math.abs(tz) < 1 ? 0 : 2.4) : [-2.4, 0, 2.4][Math.floor(Math.random() * 3)];
      }
      const inGoal = Math.abs(tz) < P.GW / 2 - 0.12 && ty < P.GH - 0.1;
      const corner = Math.abs(tz) > P.GW / 2 - 0.7 && ty > 1.5;
      const reach = kz === 0 ? 1.0 : 1.55;
      so.saved = inGoal && Math.abs(tz - kz) < reach && ty < (kz === 0 ? 2.3 : 2.1) && (!corner || Math.random() < 0.3) && Math.random() < 0.9;
      if (kz !== 0) { k.state = 'dive'; k.st = 0; k.dive = Math.sign(-kz * Math.sin(k.face)) || 1; k.vel.set(0, 0, Math.sign(kz) * 5.5); }
      so.step = 'flight'; so.t = 0; so.done = false;
    }
    soResult(scored, text) {
      const so = this.so;
      if (so.result) return;
      so.result = text; so.step = 'result'; so.t = 0;
      so.kicks[so.turn].push(scored); if (scored) this.pens[so.turn]++;
      if (scored) { A().goal(); this.w.cheer = 1; this.w.particles.burst(L2, 1.5, 0, this.teams[so.turn].def.kit.shirt, 30, 7, 1.4, 0.6, 5); }
      else A().miss();
      this.banner(text, so.shooter.name, scored ? 'goal' : 'save');
    }
    soNext() {
      const so = this.so; so.n++;
      const a = so.kicks[0], b = so.kicks[1], sa = this.pens[0], sb = this.pens[1];
      let done = false;
      if (so.n <= 10) {
        const ra = 5 - a.length, rb = 5 - b.length;
        if (sa + ra < sb || sb + rb < sa) done = true;
        if (so.n === 10 && sa !== sb) done = true;
      } else if (so.n % 2 === 0 && sa !== sb) done = true;
      if (done) { this.aimMark.visible = false; this.phase = 'shootend'; this.banner(this.teams[sa > sb ? 0 : 1].def.name.toUpperCase(), 'gewinnt das Elfmeterschießen ' + sa + ':' + sb, 'goal'); this.later(() => this.finish(), 1200); return; }
      so.turn = 1 - so.turn; this.soSetup();
    }

    // ---------- Darstellung ----------
    visuals(dt, frozen) {
      const b = this.ball;
      for (const p of this.players) {
        const sp = Math.hypot(p.vel.x, p.vel.z);
        const tsize = p.gk && p.team.wallT > 0 ? 1.35 : 1;
        const g = p.char.group; const s = p.char.scale * (p.gk ? 1.04 : 1) * tsize; if (Math.abs(g.scale.x - s) > 0.001) g.scale.setScalar(g.scale.x + (s - g.scale.x) * Math.min(1, dt * 6));
        p.char.pose({ x: p.pos.x, z: p.pos.z, face: p.face, speed: frozen ? 0 : sp, state: p.state === 'run' ? (p.gk ? 'keeper' : 'run') : p.state, t: p.st, dive: p.dive, kick: p.kick, throwT: p.throwT }, frozen ? 0 : dt);
        if (!frozen && p.team.freezeT > 0 && Math.random() < 0.2) this.w.particles.emit(p.pos.x, 1 + Math.random(), p.pos.z, 0, 0.6, 0, '#9fe8ff', 0.6, 0.35, 0);
        if (!frozen && p.team.boostT > 0 && sp > 3 && Math.random() < 0.3) this.w.particles.emit(p.pos.x, 0.3, p.pos.z, 0, 0.5, 0, '#ffe14a', 0.4, 0.4, 0);
        if (!frozen && p.team.stoneT > 0 && Math.random() < 0.12) this.w.particles.emit(p.pos.x, 1.2, p.pos.z, 0, 0.4, 0, '#b8b0a0', 0.5, 0.45, 0);
        if (!frozen && p.team.slowT > 0 && Math.random() < 0.12) this.w.particles.emit(p.pos.x, 2.1, p.pos.z, 0, 0.3, 0, '#c084fc', 0.5, 0.35, 0);
      }
      b.mesh.position.copy(b.pos); b.blob.position.set(b.pos.x, 0.025, b.pos.z);
      const hs = 0.32 * (1 + b.pos.y * 0.15); b.blob.scale.setScalar(hs); b.blob.material.opacity = 1 / (1 + b.pos.y * 0.5);
      // Netze beruhigen
      if (this.w.nets) for (const s of [-1, 1]) { const n = this.w.nets[s]; if (n) n.position.x += (n.userData.baseX - n.position.x) * Math.min(1, dt * 4); }
      // Markierungen
      for (const h of this.humans) {
        const p = h.player, m = h.marker;
        m.visible = !!p && this.phase !== 'shootout' && this.phase !== 'end';
        if (p) { m.position.set(p.pos.x, 0, p.pos.z); m.userData.arrow.position.y = 2.5 * p.char.scale + 0.25 + Math.sin(this.time * 6) * 0.08; }
      }
      this.camera(dt);
    }
    camera(dt) {
      const c = this.cam, b = this.ball, cam = this.w.camera, mode = FK.settings.cam;
      const portrait = cam.aspect < 1;
      let pos = this.tmp, look = this.tmp2, fov = 38;
      if (this.phase === 'shootout' || this.phase === 'shootend') {
        pos.set(L2 - P.SPOT - 9, 3.6, 0); look.set(L2, 1.1, 0); fov = portrait ? 62 : 42;
      } else if ((this.phase === 'goal' || this.phase === 'end') && this.goalScorer && this.phase === 'goal') {
        const s = this.goalScorer, a = this.time * 0.35;
        pos.set(s.pos.x + Math.sin(a) * 11, 4.5, s.pos.z + Math.cos(a) * 11); look.set(s.pos.x, 1.2, s.pos.z); fov = 40;
      } else {
        const m = mode === 'nah' ? { h: 13, d: 23, f: 42 } : mode === 'weit' ? { h: 32, d: 52, f: 36 } : { h: 21, d: 36, f: 38 };
        const k = portrait ? 1.5 : 1;
        const fx = b.owner ? b.owner.pos.x + b.owner.vel.x * 0.4 : b.pos.x + b.vel.x * 0.25;
        const lx = clamp(fx, -L2 + 14, L2 - 14), lz = clamp(b.pos.z, -W2, W2) * 0.5;
        pos.set(lx * 0.9, m.h * k, lz + m.d * k); look.set(lx, 0, lz - 3); fov = m.f + (portrait ? 14 : 0);
      }
      const k = this.camSnap ? 1 : 1 - Math.exp(-3.2 * dt); this.camSnap = false;
      c.pos.lerp(pos, k); c.look.lerp(look, k); c.fov += (fov - c.fov) * k;
      cam.position.copy(c.pos); cam.lookAt(c.look);
      if (Math.abs(cam.fov - c.fov) > 0.05) { cam.fov = c.fov; cam.updateProjectionMatrix(); }
    }
  }
  FK.Match = Match;
})();
