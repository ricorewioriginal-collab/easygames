/* AnMaCha UNDERCOVER 3D – Bot-Entscheidungen (Utility-/Zustandsmaschine mit gestaffelter Reaktionszeit).
   Bots handeln ausschließlich über sim.setInput/sim.act – dieselben geprüften Aktionen wie Menschen (keine Wände, keine
   Abklingzeit-Tricks). Wissen nur aus ai/memories.js (Wahrnehmung) und eigenen Ereignissen.
   Schwierigkeit 0/1/2 wirkt auf Wahrnehmung, Reaktion, Fehlerquote, Erinnerung, Kooperation und Bluffqualität. */
(function (root) {
  'use strict';
  const AMU = root.AMU = root.AMU || {};
  const PERS = {
    analytisch: { talk: 0.8, noise: 0.6, thr: 0.1, follow: 0.2, risk: 0.4 },
    misstrauisch: { talk: 0.9, noise: 0.9, thr: -0.25, follow: 0.3, risk: 0.5 },
    chaotisch: { talk: 1, noise: 1.6, thr: 0, follow: 0.5, risk: 0.8 },
    ruhig: { talk: 0.45, noise: 0.8, thr: 0.25, follow: 0.4, risk: 0.3 },
    hilfsbereit: { talk: 0.7, noise: 0.8, thr: 0.15, follow: 0.4, risk: 0.35, helper: 1 },
    opportunistisch: { talk: 0.75, noise: 1, thr: 0, follow: 0.8, risk: 0.6 }
  };
  const REACT = [1200, 650, 320], NOISE = [0.9, 0.45, 0.18], TASK_MS = [9500, 8000, 7000];

  function Brain(sim, p) {
    this.sim = sim; this.p = p; this.rng = sim.rng.fork('brain' + p.seat);
    this.persName = Object.keys(PERS)[this.rng.int(6)]; this.pers = PERS[this.persName];
    this.nav = new AMU.Nav(sim, p); this.mem = new AMU.Memory(sim, p); this.disc = new AMU.Discussion(this);
    this.thinkT = this.rng.int(800); this.percT = 0; this.goalKind = null; this.target = null; this.lastKill = -1e9; this.wait = 0;
    this.said = {}; this.answered = {}; this.voteAt = 0; this.sayAt = 0; this.meetN = -1; this.pendingClueText = [];
    this.claimRep = {}; this.claimedSab = null; this.fleeUntil = 0; this.wander = null; this.seenBodies = {};
  }
  Brain.prototype = {
    name(id) { const o = this.sim.byId(id); return o ? o.name : '?'; },
    react() { return REACT[this.p.diff] || 650; },
    // ================= Takt =================
    tick(dt) {
      const s = this.sim, p = this.p, ms = dt * 1000;
      this.percT += ms;
      if (this.percT >= 250) { this.mem.perceive(this.percT); this.percT = 0; this.events(); }
      if (s.phase === 'meeting') { s.setInput(p.id, 0, 0); return this.meetingTick(); }
      if (s.phase !== 'play') return;
      if (p.escaped || (p.caught && s.mode.flags.hunt)) { s.setInput(p.id, 0, 0); return; }
      if (p.busy) {
        s.setInput(p.id, 0, 0);
        if ((p.busy.kind === 'task' || p.busy.kind === 'repair') && p.busy.botUntil && s.t >= p.busy.botUntil) {
          const r = s.act(p.id, { a: 'task_done', acts: 'bot' });
          if (!r.ok) s.act(p.id, { a: 'cancel' });
        } else if (p.busy && (p.busy.kind === 'task' || p.busy.kind === 'repair') && !p.busy.botUntil) p.busy.botUntil = s.t + this.taskMs();
        // Panik: Crew bricht ab, wenn ein bekannter Verdächtiger direkt daneben steht (nur mittel/schwer)
        if (p.busy && p.team === 'crew' && p.diff >= 1 && s.tick % 10 === 0) this.panicCheck();
        // Flüchtende brechen die Funkbake ab, wenn ein Jäger auftaucht
        if (p.busy && p.team === 'runner' && s.tick % 4 === 0 && s.t >= s.ext.freeze && s.players.some(h => h.team === 'hunter' && ((s.canSee(p, h) && Math.hypot(h.x - p.x, h.y - p.y) < [4, 6, 7.5][p.diff]) || Math.hypot(h.x - p.x, h.y - p.y) < [3.5, 4.5, 5][p.diff]))) { s.act(p.id, { a: 'cancel' }); this.thinkT = 0; }
        return;
      }
      this.opportunist();
      this.thinkT -= ms;
      if (this.thinkT <= 0) { this.thinkT = 350 + this.rng.int(300) + this.react() * 0.4; this.decide(); }
      const st = this.nav.follow(this.slow);
      if (st === 'arrived') this.onArrive();
      else if (st === 'blocked') { this.goalKind = null; this.thinkT = 0; }
    },
    taskMs() { const b = TASK_MS[this.p.diff] || 5600; return b * (this.p.role === 'tech' && this.p.busy && this.p.busy.kind === 'repair' ? 0.5 : 1) * this.rng.range(0.8, 1.25); },
    panicCheck() {
      const s = this.sim, p = this.p;
      s.players.forEach(o => { if (o !== p && s.alive(o) && (this.mem.sus[s.publicPlayer(o).id] || 0) > 4 && Math.hypot(o.x - p.x, o.y - p.y) < 2.2 && s.canSee(p, o)) s.act(p.id, { a: 'cancel' }); });
    },
    // ================= Ereignisse =================
    events() {
      const s = this.sim, p = this.p, mem = this.mem;
      if (!p.bot && !p.botTakeover) return;
      const evs = p.bot ? s.drain(p.id) : [];
      evs.forEach(e => {
        switch (e.type) {
          case 'saw':
            mem.fact({ kind: e.kind, who: e.who, target: e.target, room: e.room });
            mem.addSus(e.who, e.kind === 'kill' ? 12 : e.kind === 'vent' ? 8 : 9);
            if (e.kind === 'kill' && p.team === 'crew') { this.alarm = { who: e.who, t: s.t }; this.thinkT = this.react(); }
            break;
          case 'scan': mem.fact({ kind: 'scan', who: e.target, res: e.res }); mem.addSus(e.target, e.res === 'verdächtig' ? 7 : e.res === 'unauffällig' ? -4 : 0.5); break;
          case 'funkspruch': mem.fact({ kind: 'cleared', who: e.id }); mem.sus[e.id] = -10; break;
          case 'clue': this.onClue(e.clue); break;
          case 'chat': this.onChat(e.e); break;
          case 'meeting': {
            const b = s.bodies.find(x => x.id === e.body);
            if (b) mem.onBody(b, s.t);
            break;
          }
          case 'shield_hit': if (e.by && p.id !== e.by) mem.addSus(e.by, 9); break;
          case 'noise': if (p.team === 'hunter') { this.noise = { x: e.x, y: e.y, t: s.t }; } break;
          case 'pulse_warn': this.pulseWarn = s.t; break;
          case 'pulse': this.pulseIds = e.ids; this.pulseT = s.t; break;
        }
      });
    },
    onClue(c) {
      this.mem.fact({ kind: 'clue', clue: c });
      if (AMU.Evidence) {
        const names = {}; this.sim.players.forEach(o => { names[o.id] = o.name; });
        const rooms = this.sim.map.rooms.map(r => r.n);
        const txt = AMU.Evidence.text(c, names, rooms);
        const fits = this.sim.players.filter(o => this.sim.alive(o) && o !== this.p && AMU.Evidence.fits(this.sim, c, o.id) === true).map(o => o.id);
        this.pendingPresent = (this.pendingPresent || []).concat([c.id]);
        const l = fits.map(id => this.name(id)).join(', ');
        this.pendingClueText.push({ txt: this.disc.line('clue', { c: txt.replace(/^\S+\s/, '') }, true), claim: { kind: 'none' } });
        if (fits.length && fits.length <= 4 && !c.mark) this.pendingClueText.push({ txt: this.disc.line(fits.length ? 'clue_fit' : 'clue_none', { l }), claim: { kind: fits.length === 1 ? 'accuse' : 'none', p: fits.length === 1 ? fits[0] : undefined } });
      }
    },
    onChat(e) {
      const s = this.sim, p = this.p, mem = this.mem;
      if (!e || e.pid === p.id) return;
      const by = s.byId(e.pid); if (!by) return;
      const w = AMU.U.clamp(1 + (mem.trust[e.pid] || 0) * 0.3 - Math.max(0, mem.sus[e.pid] || 0) * 0.08, 0.2, 2) * (0.6 + this.pers.follow * 0.6);
      const tgt = e.p || (e.c && e.c.p);
      const kind = e.claim;
      if (e.clue && AMU.Evidence) { this.presented = (this.presented || []).concat([e.clue]); return; }
      if (!tgt && kind !== 'alibi') return;
      if (tgt === p.id) {   // Ich weiß, was ich getan habe
        if (p.team !== 'traitor' && (kind === 'accuse' || kind === 'saw_kill' || kind === 'saw_vent')) mem.addSus(e.pid, kind === 'accuse' ? 0.7 : 3);
        if (kind === 'vouch' && p.team !== 'traitor') mem.addTrust(e.pid, 0.3);
        return;
      }
      if (p.team === 'traitor') return;   // Verräter wissen ohnehin, wer was ist
      const tObj = s.byId(tgt);
      if (kind === 'saw_kill') mem.addSus(tgt, 2.6 * w);
      else if (kind === 'saw_vent') mem.addSus(tgt, 1.9 * w);
      else if (kind === 'accuse') mem.addSus(tgt, 0.4 * w);
      else if (kind === 'vouch') { mem.addSus(tgt, -0.5 * w); if (tObj && (mem.sus[tgt] || 0) > 5) mem.addSus(e.pid, 1.5); }   // bürgt für jemanden, den ich ausknipsen sah
      // Vorwurf gegen jemanden, dem ich sicher vertraue (gemeinsam gesehen beim Vorfall) → Ankläger wird verdächtig
      if ((kind === 'saw_kill' || kind === 'accuse') && (mem.trust[tgt] || 0) > 1.2) mem.addSus(e.pid, 0.8);
    },
    caughtLying(pid, room) {
      const s = this.sim, mem = this.mem;
      const t0 = s.t - 25000;
      const iWas = mem.trail.filter(x => x.t >= t0 || mem.trail.indexOf(x) === mem.trail.length - 1).some(x => x.room === room);
      if (!iWas) return false;
      const seenThere = mem.log.some(e => e.id === pid && e.room === room && e.t >= t0 - 15000);
      const seenElse = mem.log.some(e => e.id === pid && e.room !== room && e.room >= 0 && e.t >= t0);
      return !seenThere && seenElse;
    },
    // ================= Meeting =================
    meetingTick() {
      const s = this.sim, m = s.meeting, p = this.p;
      if (!m) return;
      if (this.meetN !== m.n) { this.meetN = m.n; this.said = {}; this.sayAt = s.t + 1500 + this.rng.int(3500) / this.pers.talk; this.voteAt = 0; this.presentedNow = 0; }
      if (m.phase === 'result') return;
      const alive = s.alive(p);
      // Spuren vorlegen
      if (alive && p.role === 'detective' && this.pendingPresent && this.pendingPresent.length && s.t >= this.sayAt) {
        const id = this.pendingPresent.shift(); const r = s.act(p.id, { a: 'present', clue: id }); this.sayAt = s.t + 1800; if (r.ok) return;
      }
      if (alive && s.t >= this.sayAt && m.phase !== 'result') {
        const line = this.disc.next();
        this.sayAt = s.t + (2500 + this.rng.int(5000)) / this.pers.talk;
        if (line) s.act(p.id, { a: 'chat', txt: line.txt, claim: line.claim });
      }
      if (m.phase === 'vote' && alive && m.votes[p.id] == null) {
        if (!this.voteAt) this.voteAt = s.t + 1500 + this.rng.int(Math.min(12000, s.settings.vote * 500));
        if (s.t >= this.voteAt || m.until - s.t < 2500) { const v = this.chooseVote(); s.act(p.id, { a: 'vote', target: v }); }
      }
    },
    scores() {
      const s = this.sim, mem = this.mem, p = this.p, out = {};
      const clues = []; mem.facts.forEach(f => { if (f.kind === 'clue') clues.push(f.clue); }); (this.presented || []).forEach(c => clues.push(c));
      s.players.forEach(o => {
        if (o === p || !s.alive(o)) return;
        let v = mem.sus[o.id] || 0;
        clues.forEach(c => { const f = AMU.Evidence.fits(s, c, o.id); const wgt = c.mark ? 0.25 : 1; if (f === true) v += (Array.isArray(c.v) ? 0.45 : 0.6) * wgt; else if (f === false) v -= (Array.isArray(c.v) ? 0.15 : 0.55) * wgt; });
        if ((s.ext.cleared || []).includes(o.id)) v -= 10;
        v += this.rng.range(-1, 1) * NOISE[p.diff] * this.pers.noise;
        out[o.id] = v;
      });
      return out;
    },
    topSuspect(min) {
      const sc = this.scores(); let best = null, bv = min;
      Object.keys(sc).forEach(id => { if (sc[id] > bv) { bv = sc[id]; best = id; } });
      return best;
    },
    nearBody() {
      const m = this.sim.meeting; if (!m) return null;
      const b = { room: m.bodyRoom }; const seen = this.mem.seenIn(b.room, this.sim.t - 25000, this.sim.t);
      seen.delete(m.body); seen.delete(this.p.id);
      const arr = Array.from(seen); return arr.length ? arr[this.rng.int(arr.length)] : null;
    },
    /** Verräter: wen beschuldigen? Bevorzugt Personen, die schon im Gespräch sind und kein Teamkollege. */
    scapegoat() {
      const s = this.sim, p = this.p, m = s.meeting;
      const pool = s.players.filter(o => o !== p && s.alive(o) && o.team !== 'traitor');
      if (!pool.length) return null;
      const talked = {}; (m ? m.chat : []).forEach(e => { const t = e.p || (e.c && e.c.p); if (t && (e.claim === 'accuse' || e.claim === 'saw_kill')) talked[t] = (talked[t] || 0) + 1; });
      const near = this.nearBody();
      return this.rng.weighted(pool, o => 1 + (talked[o.id] || 0) * (1 + p.diff) + (o.id === near ? 2 : 0) + (this.sim.mode.flags.evidence && this.framed === o.id ? 3 : 0)).id;
    },
    lieRoom() {
      const s = this.sim, m = s.meeting, p = this.p;
      // Gute Lüge: ein Raum mit eigener Täusch-Aufgabe, nicht der Fundort
      const cand = p.tasks.map(t => s.grid.roomAt(s.map.stations[t.sid].at[0], s.map.stations[t.sid].at[1])).filter(r => r >= 0 && (!m || r !== m.bodyRoom));
      if (cand.length && p.diff > 0) return cand[this.rng.int(cand.length)];
      return this.rng.int(s.map.rooms.length);
    },
    chooseVote() {
      const s = this.sim, p = this.p, m = s.meeting;
      const alive = s.players.filter(o => s.alive(o) && o !== p);
      if (p.role === 'trickster') return this.rng.chance(0.5) ? 'skip' : this.rng.pick(alive).id;
      if (p.team === 'traitor') {
        // dem Gesprächsfluss folgen, aber nie den eigenen Teamkollegen
        const talk = {}; m.chat.forEach(e => { const t = e.p || (e.c && e.c.p); if (t && /accuse|saw_kill|saw_vent/.test(e.claim || '')) talk[t] = (talk[t] || 0) + 1; });
        const cand = alive.filter(o => o.team !== 'traitor');
        let best = null, bv = p.diff >= 1 ? 0.5 : -1;
        cand.forEach(o => { const v = (talk[o.id] || 0) + this.rng.range(0, p.diff >= 1 ? 0.6 : 1.5); if (v > bv) { bv = v; best = o.id; } });
        if (!best || (p.diff === 2 && bv < 1.2 && this.rng.chance(0.6))) return 'skip';
        return best;
      }
      const sc = this.scores();
      let best = 'skip', bv = 1.1 + this.pers.thr - (p.diff === 0 ? 0.3 : 0);
      Object.keys(sc).forEach(id => { if (sc[id] > bv) { bv = sc[id]; best = id; } });
      return best;
    },
    // ================= Entscheidungen im Spiel =================
    opportunist() {
      const s = this.sim, p = this.p;
      if (!s.alive(p)) return;
      // Leiche melden (Crew immer, Verräter manchmal zur Tarnung)
      const body = s.bodies.find(b => !b.reported && Math.hypot(b.x - p.x, b.y - p.y) <= s.R.report && s.grid.los(p.x, p.y, b.x, b.y));
      if (body && s.mode.flags.meetings) {
        const k = 'b' + body.id;
        if (!this.seenBodies[k]) this.seenBodies[k] = s.t + this.react() + (p.team === 'traitor' ? 2500 : 0);
        const mine = body.by === p.id;
        const wants = p.team !== 'traitor' || (mine ? (p.diff === 2 && this.rng.chance(0.02)) : this.rng.chance(0.04));
        if (wants && s.t >= this.seenBodies[k]) { if (p.role === 'detective' && AMU.Evidence.spotNear(s, p) && s.mode.flags.evidence) return; s.act(p.id, { a: 'report' }); return; }
      }
      if (p.team === 'traitor' && s.mode.flags.kills) this.tryKill();
      if (p.team === 'hunter') this.tryTag();
      // Flüchtende: Jäger in Sicht → nach der Reaktionszeit sofort neu entscheiden (nicht erst beim nächsten Denktakt)
      if (p.team === 'runner' && this.goalKind !== 'flee' && this.goalKind !== 'hide' && s.tick % 3 === 0 &&
          s.players.some(h => h.team === 'hunter' && ((s.canSee(p, h) && Math.hypot(h.x - p.x, h.y - p.y) < [5, 7, 8][p.diff]) || Math.hypot(h.x - p.x, h.y - p.y) < [3.5, 4.5, 5][p.diff]))) this.thinkT = Math.min(this.thinkT, this.react() * 0.6);
    },
    witnesses(v) {
      const s = this.sim, p = this.p;
      return s.players.filter(w => w !== p && w !== v && s.alive(w) && w.team !== 'traitor' && !w.ghost && (s.canSee(w, p) || s.canSee(w, v) || Math.hypot(w.x - p.x, w.y - p.y) < 4.5));
    },
    tryKill() {
      const s = this.sim, p = this.p;
      if ((p.cd.kill || 0) > s.t) return;
      const near = s.players.filter(v => v !== p && s.alive(v) && v.team !== 'traitor' && !(v.hidden > s.t) && Math.hypot(v.x - p.x, v.y - p.y) <= s.R.kill && s.grid.los(p.x, p.y, v.x, v.y));
      if (!near.length) return;
      const v = near[0], wit = this.witnesses(v).length;
      const ok = wit === 0 ? (p.diff === 0 || this.rng.chance(0.55 + 0.2 * p.diff)) : (p.diff === 0 && this.rng.chance(0.06 * this.pers.risk));
      if (!ok) return;
      if (s.t - (this.lastTry || 0) < 400) return; this.lastTry = s.t;
      const r = s.act(p.id, { a: 'kill', target: v.id });
      if (r.ok && !(r.data && r.data.blocked)) { this.lastKill = s.t; this.fleeUntil = s.t + 6000; this.goalKind = null; this.thinkT = 0; this.killRoom = s.roomOf(p); }
    },
    goTo(x, y, kind, opt) { this.goalKind = kind; this.goalPt = [x, y]; this.slow = false; if (!this.nav.go(x, y, opt)) { this.goalKind = null; return false; } return true; },
    decide() {
      const s = this.sim, p = this.p, f = s.mode.flags;
      if (f.hunt) return p.team === 'hunter' ? this.decideHunter() : this.decideRunner();
      if (!s.alive(p)) return this.decideGhost();
      if (p.team === 'traitor') return this.decideTraitor();
      return this.decideCrew();
    },
    nearestTask(list) {
      const s = this.sim, p = this.p; let best = null, bd = 1e9;
      (list || p.tasks).forEach(t => { if (t.done) return; const a = s.map.stations[t.sid].at, d = Math.hypot(a[0] - p.x, a[1] - p.y); if (d < bd) { bd = d; best = t; } });
      return best;
    },
    decideGhost() {
      const s = this.sim, p = this.p;
      if (p.team !== 'crew' || !s.mode.flags.tasks) { if (!this.nav.goal || this.nav.arrived(1)) { const rm = this.rng.pick(s.map.rooms); this.goTo(rm.r[0] + rm.r[2] / 2, rm.r[1] + rm.r[3] / 2, 'wander'); } return; }
      const t = this.nearestTask(); if (!t) return;
      const a = s.map.stations[t.sid].at; this.goTo(a[0], a[1] + 0.2, 'task'); this.taskSid = t.sid;
    },
    sabTarget() {
      const s = this.sim, p = this.p;
      // Kritische Sabotage zuerst, dann übrige; Zuweisung: die nächsten freien Crew-Bots übernehmen die Punkte
      const list = s.sab.list.filter(x => x.pts);
      if (!list.length) return null;
      list.sort((a, b) => (b.crit ? 1 : 0) - (a.crit ? 1 : 0));
      const claims = s.ext.repClaims = s.ext.repClaims || {};
      for (const sb of list) {
        const T = AMU.Sabotage.TYPES[sb.type];
        const helper = this.pers.helper || p.role === 'tech' || sb.crit || s.mode.flags.chaos || sb.type === 'lights';
        if (!helper) continue;
        for (let i = 0; i < sb.pts.length; i++) {
          const pt = sb.pts[i];
          if (pt.done && (!sb.window || s.t - pt.done < AMU.Sabotage.window(s, sb, pt))) continue;
          const key = sb.id + ':' + i, c = claims[key];
          const myD = Math.hypot(pt.x - p.x, pt.y - p.y);
          if (c && c.id !== p.id && c.until > s.t) { const o = s.byId(c.id); if (o && s.alive(o) && Math.hypot(pt.x - o.x, pt.y - o.y) < myD + 2) continue; }
          // Nur die nächstgelegenen Crew-Mitglieder laufen los (Kooperation, abhängig von Schwierigkeit)
          const closer = s.players.filter(o => o !== p && s.alive(o) && o.team === 'crew' && !o.busy && Math.hypot(pt.x - o.x, pt.y - o.y) < myD).length;
          if (closer > (sb.crit ? 1 : 0) + (p.diff === 0 ? 2 : 0) && !s.mode.flags.chaos) continue;
          if (s.mode.flags.chaos && closer > 1 + (p.diff === 0 ? 1 : 0)) continue;
          claims[key] = { id: p.id, until: s.t + 9000 };
          return { sb, i, pt, T };
        }
      }
      return null;
    },
    decideCrew() {
      const s = this.sim, p = this.p, mem = this.mem;
      // Alarm: gesehenen Vorfall melden (Notrufpult), wenn keine Leiche gemeldet werden kann
      if (this.alarm && s.t - this.alarm.t < 25000 && s.mode.flags.meetings && p.uses > 0) {
        const b = s.map.button; this.goTo(b[0], b[1], 'button'); return;
      }
      // Gefahr meiden: hoch verdächtige Person in der Nähe → Abstand (mittel/schwer)
      if (p.diff >= 1) {
        const danger = s.players.find(o => o !== p && s.alive(o) && (mem.sus[s.publicPlayer(o).id] || 0) > 5 && Math.hypot(o.x - p.x, o.y - p.y) < 4 && s.canSee(p, o));
        if (danger) { const b = s.map.button; this.goTo(b[0], b[1], p.uses > 0 ? 'button' : 'flee'); return; }
      }
      // Leiche in Sichtweite → hingehen und melden
      if (s.mode.flags.meetings) {
        const vr = s.visionOf(p) * [0.7, 0.9, 1][p.diff];
        const body = s.bodies.find(b => !b.reported && Math.hypot(b.x - p.x, b.y - p.y) <= vr && s.grid.los(p.x, p.y, b.x, b.y));
        if (body) { this.goTo(body.x, body.y, 'body'); return; }
      }
      const rep = this.sabTarget();
      if (rep) { this.goTo(rep.pt.x, rep.pt.y, 'repair'); return; }
      // Ermittler: Spuren untersuchen
      if (p.role === 'detective' && s.mode.flags.evidence) {
        const spot = (s.ext.spots || []).filter(x => !x.found[p.id]).sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))[0];
        if (spot && Math.hypot(spot.x - p.x, spot.y - p.y) < 22) { this.goTo(spot.x, spot.y, 'clue'); return; }
      }
      // Rollen
      if (s.mode.flags.roles && (p.cd.abil || 0) <= s.t) {
        if (p.role === 'courier') {
          if (!p.pkg) { const st = s.map.stations.find(x => x.t === 'paket') || s.map.stations.find(x => x.t === 'akkus') || s.map.stations[0]; this.goTo(st.at[0], st.at[1] + 0.3, 'pickup'); return; }
          const b = s.map.button; this.goTo(b[0], b[1], 'deliver'); return;
        }
        if (p.role === 'guard') {
          const t = s.players.filter(o => o !== p && s.alive(o) && Math.hypot(o.x - p.x, o.y - p.y) <= s.R.shield && s.grid.los(p.x, p.y, o.x, o.y) && (mem.sus[o.id] || 0) < 1).sort((a, b) => (mem.trust[b.id] || 0) - (mem.trust[a.id] || 0))[0];
          if (t && this.rng.chance(0.5)) s.act(p.id, { a: 'ability', target: t.id });
        }
        if (p.role === 'detective' && (p.scans == null || p.scans > 0)) {
          const scanned = new Set(mem.facts.filter(f => f.kind === 'scan').map(f => f.who));
          const t = s.players.filter(o => o !== p && s.alive(o) && !scanned.has(o.id) && Math.hypot(o.x - p.x, o.y - p.y) <= s.R.ability && s.grid.los(p.x, p.y, o.x, o.y)).sort((a, b) => (mem.sus[b.id] || 0) - (mem.sus[a.id] || 0))[0];
          if (t) s.act(p.id, { a: 'ability', target: t.id });
        }
      }
      if (this.goalKind && this.nav.goal && this.goalKind !== 'wander' && this.goalKind !== 'repair' && this.goalKind !== 'button' && this.goalKind !== 'body') return;   // laufendes Ziel behalten
      const t = this.nearestTask();
      if (t && s.mode.flags.tasks) { const a = s.map.stations[t.sid].at; this.taskSid = t.sid; this.goTo(a[0], a[1], 'task'); return; }
      this.doWander();
    },
    doWander() {
      const s = this.sim, p = this.p;
      if (this.goalKind === 'wander' && this.nav.goal && !this.nav.arrived(1)) return;
      // Schwer: in Gesellschaft bleiben (Alibi); sonst zufälliger Raum
      if (p.diff === 2 && p.team === 'crew' && this.rng.chance(0.6)) {
        const buddy = s.players.filter(o => o !== p && s.alive(o) && (this.mem.trust[o.id] || 0) >= 0).sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))[0];
        if (buddy) { this.goTo(buddy.x, buddy.y, 'wander'); return; }
      }
      const rm = this.rng.pick(s.map.rooms), x = rm.r[0] + 1 + this.rng.int(Math.max(1, rm.r[2] - 2)) + 0.5, y = rm.r[1] + 1 + this.rng.int(Math.max(1, rm.r[3] - 2)) + 0.5;
      if (!this.goTo(x, y, 'wander')) this.goalKind = null;
    },
    decideTraitor() {
      const s = this.sim, p = this.p, f = s.mode.flags;
      // Nach dem Ausknipsen: weg vom Fundort, Geheimgang nutzen (schwer)
      if (s.t < this.fleeUntil) {
        if (this.goalKind !== 'flee') {
          const st = s.map.stations.slice().sort((a, b) => Math.hypot(b.at[0] - p.x, b.at[1] - p.y) - Math.hypot(a.at[0] - p.x, a.at[1] - p.y))[this.rng.int(3)];
          this.goTo(st.at[0], st.at[1] + 0.3, 'flee', { vents: p.diff >= 1 });
        }
        return;
      }
      // Detektiv: frische Spuren manipulieren, wenn niemand zusieht
      if (f.evidence && p.tamper > 0 && (s.ext.spots || []).length) {
        const sp = s.ext.spots.filter(x => !x.tampered && s.t - x.t < 90000 && Math.hypot(x.x - p.x, x.y - p.y) < 10)[0];
        if (sp && this.witnessesAround(sp.x, sp.y) === 0 && this.rng.chance(0.25 + 0.2 * p.diff)) {
          if (Math.hypot(sp.x - p.x, sp.y - p.y) <= s.R.clue) { const r = s.act(p.id, { a: 'tamper' }); if (r.ok) return; }
          this.goTo(sp.x, sp.y, 'tamper'); return;
        }
      }
      // Sabotage
      if (f.sab && s.sab.cd <= s.t && this.rng.chance(f.chaos ? 0.6 : 0.3)) {
        const types = AMU.Sabotage.allowed(s).filter(t => !s.sab.list.some(x => x.type === t));
        let pick = null;
        const crewAlive = s.players.filter(o => s.alive(o) && o.team !== 'traitor').length;
        if (types.includes('crit') && crewAlive >= 4 && this.rng.chance(f.chaos ? 0.25 : 0.3)) pick = 'crit';
        else if (f.chaos) pick = this.rng.pick(types.filter(t => t !== 'crit' && t !== 'doors')) || 'doors';
        else pick = this.rng.pick(types.filter(t => t !== 'crit')) || null;
        if (pick) {
          const a = { a: 'sab', type: pick };
          if (pick === 'doors') { const tg = this.target && s.byId(this.target); a.room = tg ? Math.max(0, s.roomOf(tg)) : this.rng.int(s.map.rooms.length); }
          s.act(p.id, a);
        }
      }
      // Rollen-Fähigkeiten
      if (f.roles && (p.cd.abil || 0) <= s.t) {
        if (p.role === 'shifter' && (p.cd.kill || 0) - s.t < 4000) {
          const t = s.players.filter(o => o !== p && s.alive(o) && o.team !== 'traitor').sort((a, b) => Math.hypot(b.x - p.x, b.y - p.y) - Math.hypot(a.x - p.x, a.y - p.y))[0];
          if (t) s.act(p.id, { a: 'ability', target: t.id });
        }
        if (p.role === 'jammer') {
          const n = s.players.filter(o => o !== p && s.alive(o) && o.team !== 'traitor' && Math.hypot(o.x - p.x, o.y - p.y) <= 7).length;
          if (n >= 2 || (f.tasks && s.taskTotal && s.taskDone / s.taskTotal > 0.6 && n >= 1)) s.act(p.id, { a: 'ability' });
        }
      }
      // Jagen, wenn Abklingzeit bald bereit: isoliertes Ziel suchen
      if (f.kills && (p.cd.kill || 0) - s.t < 3000) {
        const cand = s.players.filter(v => v !== p && s.alive(v) && v.team !== 'traitor');
        let best = null, bv = -1e9;
        cand.forEach(v => {
          const others = s.players.filter(o => o !== v && o !== p && s.alive(o) && o.team !== 'traitor' && Math.hypot(o.x - v.x, o.y - v.y) < 7).length;
          const d = Math.hypot(v.x - p.x, v.y - p.y);
          const known = s.canSee(p, v) || (this.mem.seen[v.id] && s.t - this.mem.seen[v.id].t < 15000);
          if (!known && p.diff > 0) return;
          const sc = -others * (2 + p.diff) - d * 0.15 + (v.busy && s.canSee(p, v) ? 3 : 0) + this.rng.range(0, 1);   // wer an einer Station arbeitet, steht still
          if (sc > bv) { bv = sc; best = v; }
        });
        if (best && bv > -9 - (p.diff === 0 ? 4 : 0)) { this.target = best.id; const ls = this.mem.seen[best.id]; const tx = s.canSee(p, best) ? best.x : ls ? ls.x : best.x, ty = s.canSee(p, best) ? best.y : ls ? ls.y : best.y; this.goTo(tx, ty, 'hunt', { vents: p.diff === 2 }); return; }
      }
      // Sonst: Aufgabe vortäuschen
      if (this.goalKind === 'fake' && this.nav.goal) return;
      const t = this.rng.pick(p.tasks);
      if (t && f.tasks) { const a = s.map.stations[t.sid].at; this.taskSid = t.sid; this.goTo(a[0], a[1], 'fake'); return; }
      this.doWander();
    },
    witnessesAround(x, y) { const s = this.sim; return s.players.filter(w => w !== this.p && s.alive(w) && w.team !== 'traitor' && Math.hypot(w.x - x, w.y - y) < s.visionOf(w) && s.grid.los(w.x, w.y, x, y)).length; },
    onArrive() {
      const s = this.sim, p = this.p, k = this.goalKind;
      if (k === 'task' || k === 'fake') { const r = s.act(p.id, { a: 'use' }); if (r.ok && p.busy && p.busy.kind !== 'fake') p.busy.botUntil = s.t + this.taskMs(); this.goalKind = null; this.nav.stop(); this.thinkT = Math.min(this.thinkT, 200); if (!r.ok) this.markTaskUnreachable(); }
      else if (k === 'repair') { const r = s.act(p.id, { a: 'use' }); if (r.ok && p.busy) p.busy.botUntil = s.t + this.taskMs(); this.goalKind = null; this.nav.stop(); }
      else if (k === 'button') { const r = s.act(p.id, { a: 'button' }); this.alarm = null; this.goalKind = null; this.nav.stop(); if (!r.ok) this.thinkT = 0; }
      else if (k === 'clue') { s.act(p.id, { a: 'use' }); this.goalKind = null; this.nav.stop(); }
      else if (k === 'tamper') { s.act(p.id, { a: 'tamper' }); this.goalKind = null; this.nav.stop(); }
      else if (k === 'pickup' || k === 'deliver') { s.act(p.id, { a: 'ability' }); this.goalKind = null; this.nav.stop(); }
      else if (k === 'beacon' || k === 'rescue') { s.act(p.id, { a: k === 'rescue' ? 'rescue' : 'use' }); this.goalKind = null; this.nav.stop(); }
      else if (k === 'hide') { s.act(p.id, { a: 'hide' }); this.goalKind = null; this.nav.stop(); }
      else if (k === 'search') { s.act(p.id, { a: 'search' }); this.goalKind = null; this.nav.stop(); this.searched = (this.searched || []).concat([this.searchIdx]); }
      else { this.goalKind = null; this.nav.stop(); }
    },
    markTaskUnreachable() { this.thinkT = 300; },
    // ================= Verstecken & Jagen =================
    tryTag() {
      const s = this.sim, p = this.p;
      if ((p.cd.tag || 0) > s.t || s.t < s.ext.freeze) return;
      const v = s.players.find(o => o.team === 'runner' && !o.caught && !o.escaped && !(o.hidden > s.t) && !(o.shieldUntil > s.t) && Math.hypot(o.x - s.map.cage[0], o.y - s.map.cage[1]) >= 4.5 && Math.hypot(o.x - p.x, o.y - p.y) <= s.R.tag && s.grid.los(p.x, p.y, o.x, o.y));
      if (v && s.t - (this.lastTry || 0) > this.react() * 0.5) { this.lastTry = s.t; s.act(p.id, { a: 'tag', target: v.id }); }
    },
    decideHunter() {
      const s = this.sim, p = this.p;
      if (s.t < s.ext.freeze) return;
      const vis = s.players.filter(o => o.team === 'runner' && !o.caught && !o.escaped && s.canSee(p, o) && Math.hypot(o.x - p.x, o.y - p.y) <= s.visionOf(p) * [0.75, 0.9, 1][p.diff]);
      if (vis.length) {
        const v = vis.sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))[0];
        this.chase = { x: v.x, y: v.y, t: s.t, id: v.id };
        const d = Math.hypot(v.x - p.x, v.y - p.y);
        if (d < 4.5 && (p.cd.sprint || 0) <= s.t && this.rng.chance(0.5 + 0.2 * p.diff)) s.act(p.id, { a: 'sprint' });
        this.nav.goal = null; this.goTo(v.x, v.y, 'chase'); this.thinkT = 150; return;
      }
      if (this.pulseIds && s.t - this.pulseT < 3500) {
        const t = this.pulseIds.map(id => s.byId(id)).filter(o => o && !o.caught && !o.escaped).sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))[0];
        if (t) { this.chase = { x: t.x, y: t.y, t: s.t, id: t.id }; this.goTo(t.x, t.y, 'chase'); return; }
      }
      if ((p.cd.pulse || 0) <= s.t && this.rng.chance(0.3 + 0.25 * p.diff)) { s.act(p.id, { a: 'pulse' }); return; }
      if (this.chase && s.t - this.chase.t < 9000) {
        if (!this.nav.arrived(1)) { this.goTo(this.chase.x, this.chase.y, 'chase'); return; }
        // Verstecke in der Nähe durchsuchen
        const hi = s.map.hides.map((h, i) => ({ h, i })).filter(o => Math.hypot(o.h.at[0] - p.x, o.h.at[1] - p.y) < 7 && !(this.searched || []).includes(o.i)).sort((a, b) => Math.hypot(a.h.at[0] - p.x, a.h.at[1] - p.y) - Math.hypot(b.h.at[0] - p.x, b.h.at[1] - p.y))[0];
        if (hi) { this.searchIdx = hi.i; this.goTo(hi.h.at[0], hi.h.at[1], 'search'); return; }
        this.chase = null;
      }
      if (this.noise && s.t - this.noise.t < 6000) { this.goTo(this.noise.x, this.noise.y, 'chase'); this.noise = null; return; }
      // Patrouille: Funkbaken und Ausgänge bewachen (offene Ausgänge besonders)
      if (this.goalKind === 'patrol' && this.nav.goal && !this.nav.arrived(1)) return;
      this.searched = [];
      const pts = s.ext.exits || s.ext.exitsAt ? s.map.exits : s.ext.beacons.filter(b => !b.on).map(b => b.at).concat([this.rng.pick(s.map.rooms).r].map(r => [r[0] + r[2] / 2, r[1] + r[3] / 2]));
      const pt = this.rng.pick(pts.length ? pts : [s.map.button]);
      this.goTo(pt[0], pt[1], 'patrol');
    },
    decideRunner() {
      const s = this.sim, p = this.p;
      if (p.caught) return;
      const hunters = s.players.filter(o => o.team === 'hunter');
      const hear = [3.5, 4.5, 5][p.diff];   // Schritte hören (die Oberfläche zeigt Menschen dieselbe Warnung, siehe Modes.view → danger)
      const seenH = hunters.filter(h => (s.canSee(p, h) && Math.hypot(h.x - p.x, h.y - p.y) < 8) || Math.hypot(h.x - p.x, h.y - p.y) < hear);
      // Versteckt: still halten, solange Jäger nah ist
      if (p.hideSpot != null) { if (!seenH.length && p.hidden - s.t < 4000) s.act(p.id, { a: 'unhide' }); return; }
      if (this.pulseWarn && s.t - this.pulseWarn < 1500) {
        const hi = s.map.hides.find((h, i) => Math.hypot(h.at[0] - p.x, h.at[1] - p.y) <= s.R.hide && !s.players.some(o => o.hideSpot === i));
        if (hi) { s.act(p.id, { a: 'hide' }); return; }
      }
      if (s.t < s.ext.freeze) seenH.length = 0;   // eingefrorene Jäger sind noch harmlos
      if (seenH.length) this.lastH = { x: seenH[0].x, y: seenH[0].y, t: s.t };
      // Nach einer Sichtung noch kurz weiter fliehen statt sofort umzukehren
      if (!seenH.length && this.goalKind === 'flee' && this.lastH && s.t - this.lastH.t < 2500 + 800 * p.diff && this.nav.goal && !this.nav.arrived(1.2)) return;
      if (seenH.length) {
        const h = seenH[0], dh = Math.hypot(h.x - p.x, h.y - p.y);
        if (dh < 3 && (p.cd.sprint || 0) <= s.t && p.stamina > 0.5) s.act(p.id, { a: 'sprint' });
        // Fluchtziel: Punkt, der weit vom Jäger und nicht zu weit von mir ist
        const cand = s.map.stations.map(x => x.at).concat(s.map.hides.map(x => x.at), s.ext.exits ? s.map.exits : []);
        // Fluchtpunkte bewerten: weg vom Jäger (Richtung), nicht zu weit; die besten drei per Pfad prüfen (Weg führt nicht am Jäger vorbei)
        const ax = p.x - h.x, ay = p.y - h.y, al = Math.hypot(ax, ay) || 1;
        const scored = cand.map(c => {
          const dx = c[0] - p.x, dy = c[1] - p.y, dl = Math.hypot(dx, dy) || 1;
          const dir = (dx * ax + dy * ay) / (dl * al);
          return { c, v: Math.hypot(c[0] - h.x, c[1] - h.y) * 1.0 - dl * 0.35 + dir * 6 + this.rng.range(0, 1.5) * (3 - p.diff) };
        }).filter(o => Math.hypot(o.c[0] - p.x, o.c[1] - p.y) > 3).sort((a, b) => b.v - a.v);
        let best = null;
        for (const o of scored.slice(0, 3 - (p.diff === 0 ? 2 : 0))) {
          const path = s.grid.path(p.x, p.y, o.c[0], o.c[1]);
          if (!path) continue;
          const safe = path.slice(0, 8).every(w => Math.hypot(w[0] - h.x, w[1] - h.y) >= Math.min(dh, 3) * 0.9);
          if (safe) { best = o.c; break; }
        }
        if (!best && scored.length) best = scored[0].c;
        // Versteck in der Nähe und Jäger schaut nicht? → verstecken (mittel/schwer)
        const hide = s.map.hides.map((x, i) => ({ x, i })).find(o => Math.hypot(o.x.at[0] - p.x, o.x.at[1] - p.y) < 2.5 && !s.players.some(q => q.hideSpot === o.i));
        if (hide && p.diff >= 1 && dh > 3.5 && !s.grid.los(h.x, h.y, hide.x.at[0], hide.x.at[1])) { this.goTo(hide.x.at[0], hide.x.at[1], 'hide'); return; }
        if (best) { this.goTo(best[0], best[1], 'flee'); this.thinkT = 400; return; }
      }
      if (s.ext.exits || s.ext.exitsAt) { const ex = s.map.exits.slice().sort((a, b) => Math.hypot(a[0] - p.x, a[1] - p.y) - Math.hypot(b[0] - p.x, b[1] - p.y))[0]; this.goTo(ex[0], ex[1], 'exit'); return; }
      // Befreien, wenn jemand gefangen ist und kein Jäger in der Nähe des Käfigs
      const caught = s.players.filter(o => o.caught && o.caughtN < 3);
      if (caught.length && (p.cd.rescue || 0) <= s.t) {
        const c = s.map.cage, hNear = hunters.some(h => Math.hypot(h.x - c[0], h.y - c[1]) < 6 && s.canSee(p, h));
        const hRecent = this.lastH && s.t - this.lastH.t < 8000 && Math.hypot(this.lastH.x - c[0], this.lastH.y - c[1]) < 10;
        if (!hNear && !(hRecent && p.diff >= 1) && (this.pers.helper || p.diff >= 1 || this.rng.chance(0.5))) { this.goTo(c[0], c[1], 'rescue'); return; }
      }
      if (this.goalKind === 'beacon' && this.nav.goal) return;
      // Funkbake: nächste freie, die nicht schon ein anderer Bot ansteuert
      const claims = s.ext.bClaims = s.ext.bClaims || {};
      const risky = b => p.diff >= 1 && this.lastH && s.t - this.lastH.t < 10000 && Math.hypot(this.lastH.x - b.at[0], this.lastH.y - b.at[1]) < 8;
      const free = s.ext.beacons.filter(b => !b.on && !risky(b) && (!claims[b.sid] || claims[b.sid].id === p.id || claims[b.sid].until < s.t));
      const b = free.sort((a, c) => Math.hypot(a.at[0] - p.x, a.at[1] - p.y) - Math.hypot(c.at[0] - p.x, c.at[1] - p.y))[0] || s.ext.beacons.find(x => !x.on);
      if (b) { claims[b.sid] = { id: p.id, until: s.t + 20000 }; this.goTo(b.at[0], b.at[1], 'beacon'); return; }
      this.doWander();
    }
  };
  AMU.Brain = { create: (sim, p) => new Brain(sim, p), PERS, Brain };
  if (typeof module !== 'undefined' && module.exports) module.exports = AMU.Brain;
})(typeof window !== 'undefined' ? window : globalThis);
