/* AnMaCha UNDERCOVER 3D – autoritativer Spielkern für die fünf Missionsmodi (alles außer dem Wortspiel).
   Läuft im Solo-Spiel lokal und online nur beim Gastgeber. Menschen und Bots benutzen dieselbe Schnittstelle:
     setInput(pid, mx, my)  Bewegungsabsicht (-1..1), act(pid, {a, …}) → { ok, why, data }
   Jede Aktion wird hier geprüft (Abstände, Sichtlinie, Abklingzeiten, Phase, Rolle). viewFor(pid) liefert die
   geschwärzte Sicht einer Person (nur Sichtbares, nur die eigene Rolle) – dieselbe Sicht nutzt die Oberfläche im Solo-Spiel
   und die Netzwerkübertragung. Ohne DOM, deterministisch per Seed, Node-testbar.
   Modusspezifisches: core/modes.js, Siegprüfung: core/rules.js, Abstimmung: core/meeting.js, Spuren: core/evidence.js. */
(function (root) {
  'use strict';
  const AMU = root.AMU = root.AMU || {};
  const STEP = 50;
  const R = { use: 1.5, kill: 1.6, report: 2.6, button: 1.9, vent: 1.1, ability: 3.0, shield: 2.6, tag: 1.25, rescue: 1.7, hide: 1.2, clue: 1.4 };
  const VISION = { crew: 6.5, traitor: 8, neutral: 6.5, hunter: 8, runner: 6 };
  const BASE_SPEED = 3.3;

  function create(opt) {
    const settings = AMU.cleanSettings(opt.settings || {}, null);
    if (opt.mode) settings.mode = opt.mode;
    const mode = AMU.modeById(settings.mode), map = AMU.mapById(opt.map || settings.map);
    settings.map = map.id;
    const grid = AMU.Grid.compile(map);
    const rng = AMU.RNG(opt.seed == null ? 1 : opt.seed);
    const sim = {
      STEP, R, settings, mode, map, grid, rng, seed: rng.seed, t: 0, acc: 0, tick: 0,
      phase: 'intro', phaseEnd: 6000, wish: opt.wish || null, players: [], bodies: [], log: [], brains: {}, filter: opt.filter || null,
      sab: { list: [], cd: 0, doorsUntil: {} }, meeting: null, publicDead: new Set(), result: null, eventSeq: 0,
      taskTotal: 0, taskDone: 0, hist: {}, feat: { dark: false, gates: {}, liftCd: {} }, ext: {}, stats: { meetings: 0, kills: 0, ejects: 0, sabs: 0 },
      emit, act, setInput, step, viewFor, drain, canSee, visionOf, isTraitor, alive, byId, roomOf, near, publicPlayer, endGame, setConnected, takeover, release,
      startMeeting, placeAtTable, stationPos, distTo, killCdMs
    };

    // ---------- Spieler ----------
    const C = AMU.COSMETICS;
    (opt.players || []).forEach((q, i) => {
      const look = C ? C.validLook(q.look || C.randomLook(rng.fork('look' + i))) : (q.look || {});
      sim.players.push({
        id: q.id, seat: i, name: q.name || ('Spieler ' + (i + 1)), bot: !!q.bot, diff: q.diff == null ? settings.diff : q.diff, look,
        sym: C ? C.symbols[i % C.symbols.length] : String(i + 1), role: 'crew', team: 'crew', alive: true, ghost: false,
        x: 0, y: 0, dir: 0, mx: 0, my: 0, moving: false, busy: null, tasks: [], cd: {}, uses: settings.buttonUses, connected: true,
        hidden: 0, shieldUntil: 0, disguise: null, jamUntil: 0, caught: 0, caughtN: 0, escaped: false, out: [], pkg: false,
        st: { tasks: 0, kills: 0, reports: 0, meetingsCalled: 0, votesRight: 0, votesWrong: 0, repairs: 0, sabs: 0, survived: true, beacons: 0, rescues: 0, clues: 0, ejectedTraitors: 0 },
        lastSeq: 0
      });
    });

    // ---------- Rollen ----------
    AMU.Modes.setupRoles(sim);
    sim.players.forEach(p => { p.team = AMU.ROLES[p.role].team; });
    // Aufgaben: jede Person bekommt eigene Stationen (Verräter/Neutrale nur zum Täuschen)
    if (mode.flags.tasks) {
      sim.players.forEach(p => {
        const r = rng.fork('tasks' + p.seat);
        const picks = r.shuffle(map.stations.map((s, i) => i)).slice(0, Math.min(settings.tasks, map.stations.length));
        p.tasks = picks.map(sid => ({ sid, t: map.stations[sid].t, done: false, seed: r.int(1e9) }));
        if (p.team === 'crew') sim.taskTotal += p.tasks.length;
      });
    }
    placeAtTable();
    AMU.Modes.setup(sim);
    sim.players.forEach(p => { sim.hist[p.id] = []; });
    if (AMU.Brain) sim.players.forEach(p => { if (p.bot) sim.brains[p.id] = AMU.Brain.create(sim, p); });
    sim.players.forEach(p => emit('role', { role: p.role, team: p.team, mates: p.team === 'traitor' ? sim.players.filter(o => o.team === 'traitor' && o !== p).map(o => o.id) : [] }, p.id));
    emit('phase', { phase: 'intro' }, 'all');
    return sim;

    // ===================== Hilfen =====================
    // Rollen-Chaos: Sonderrollen der Verräter (Gestaltwandler, Störsender) sind stark → etwas längere Abklingzeit
    function killCdMs() { return settings.killCd * 1000 * (mode.id === 'rollen' ? 1.2 : 1); }
    function byId(id) { return sim.players.find(p => p.id === id) || null; }
    function alive(p) { return p && p.alive && !p.escaped && !(p.caughtN >= 3); }
    function isTraitor(p) { return p && p.team === 'traitor'; }
    function roomOf(p) { return grid.roomAt(p.x, p.y); }
    function distTo(p, x, y) { return Math.hypot(p.x - x, p.y - y); }
    function near(p, x, y, r) { return distTo(p, x, y) <= r && grid.los(p.x, p.y, x, y); }
    function stationPos(sid) { return map.stations[sid].at; }
    function emit(type, data, to) {
      const ev = Object.assign({ type, t: sim.t, n: ++sim.eventSeq }, data || {});
      if (to === 'all') sim.players.forEach(p => p.out.push(ev));
      else if (Array.isArray(to)) to.forEach(id => { const p = byId(id); if (p) p.out.push(ev); });
      else if (to != null) { const p = byId(to); if (p) p.out.push(ev); }
      sim.log.push(ev); if (sim.log.length > 600) sim.log.splice(0, 200);
      sim.players.forEach(p => { if (p.out.length > 200) p.out.splice(0, p.out.length - 200); });
      if (sim.onEvent) try { sim.onEvent(ev, to); } catch (e) { /* Oberfläche */ }
      return ev;
    }
    function drain(pid) { const p = byId(pid); if (!p) return []; const o = p.out; p.out = []; return o; }
    function placeAtTable() {
      const bx = map.button[0], by = map.button[1], n = sim.players.length;
      sim.players.forEach((p, i) => {
        const a = (i / n) * Math.PI * 2;
        let x = bx + Math.cos(a) * 2.2, y = by + Math.sin(a) * 2.2;
        if (grid.blocked(x, y) || grid.hitCircle(x, y, 0.32)) { const f = grid.nearestFloor(x, y); x = f[0]; y = f[1]; }
        p.x = x; p.y = y; p.dir = Math.atan2(bx - x, by - y); p.mx = p.my = 0; p.busy = null; p.hidden = 0;
      });
    }
    function visionOf(p) {
      if (!p.alive || p.ghost) return 999;
      let r = VISION[p.team] || 6.5;
      const lights = sim.sab.list.some(s => s.type === 'lights');
      if (lights && (p.team === 'crew' || p.team === 'neutral' || p.team === 'runner')) r = 2.6;
      if (sim.feat.dark) r = Math.max(2.6, r * 0.55);
      return r;
    }
    function canSee(v, o) {
      if (v === o) return true;
      if (sim.phase === 'meeting' || sim.phase === 'end') return true;
      if (o.escaped) return false;
      if (o.ghost) return v.ghost;
      if (v.ghost) return !o.hidden || v.ghost;
      if (o.hidden && o.hidden > sim.t) return false;
      const ext = sim.ext.reveal && sim.ext.reveal[v.id];
      if (ext && ext.until > sim.t && ext.ids.includes(o.id)) return true;
      const r = visionOf(v);
      return distTo(v, o.x, o.y) <= r && grid.los(v.x, v.y, o.x, o.y);
    }
    /** Öffentliche Darstellung einer Person (Gestaltwandler erscheinen als ihr Vorbild). */
    function publicPlayer(o) {
      const d = o.disguise && o.disguise.until > sim.t ? byId(o.disguise.as) : null;
      const src = d || o;
      return { id: src.id, n: src.name, look: src.look, sym: src.sym, x: +o.x.toFixed(2), y: +o.y.toFixed(2), dir: +o.dir.toFixed(2), mv: o.moving ? 1 : 0, alive: o.alive ? 1 : 0, ghost: o.ghost ? 1 : 0, busy: o.busy ? 1 : 0, bot: src.bot ? 1 : 0, caught: o.caught ? 1 : 0 };
    }

    // ===================== Eingaben =====================
    function setInput(pid, mx, my) {
      const p = byId(pid); if (!p) return;
      mx = +mx || 0; my = +my || 0; const l = Math.hypot(mx, my); if (l > 1) { mx /= l; my /= l; }
      p.mx = isFinite(mx) ? mx : 0; p.my = isFinite(my) ? my : 0;
    }
    function setConnected(pid, on) { const p = byId(pid); if (!p) return; p.connected = !!on; if (!on) { p.mx = p.my = 0; } emit('conn', { id: pid, on: !!on }, 'all'); }
    function takeover(pid) {
      const p = byId(pid); if (!p || p.bot) return false;
      p.botTakeover = true; if (AMU.Brain && !sim.brains[pid]) sim.brains[pid] = AMU.Brain.create(sim, p);
      emit('notice', { key: 'takeover', id: pid }, 'all'); return true;
    }
    /** Mensch übernimmt wieder (nach Wiederverbindung) */
    function release(pid) {
      const p = byId(pid); if (!p || p.bot || !p.botTakeover) return false;
      p.botTakeover = false; delete sim.brains[pid]; p.mx = p.my = 0;
      if (p.busy && p.busy.botUntil) p.busy = null;
      emit('notice', { key: 'back', id: pid }, 'all'); return true;
    }

    // ===================== Aktionen =====================
    function fail(why) { return { ok: false, why }; }
    function act(pid, a) {
      const p = byId(pid);
      if (!p || !a || typeof a.a !== 'string') return fail('format');
      if (sim.phase === 'end') return fail('ende');
      if (sim.phase === 'meeting') return AMU.Meeting.act(sim, p, a);
      if (sim.phase !== 'play') return fail('phase');
      const h = AMU.Modes.action(sim, p, a);
      if (h) return h;
      switch (a.a) {
        case 'use': return doUse(p, a);
        case 'task_done': return doTaskDone(p, a);
        case 'cancel': if (p.busy) { const b = p.busy; p.busy = null; emit('busy_end', { kind: b.kind, ok: false }, p.id); } return { ok: true };
        case 'report': return doReport(p, a);
        case 'button': return doButton(p);
        case 'kill': return doKill(p, a);
        case 'vent': return doVent(p);
        case 'sab': return doSab(p, a);
        case 'ability': return AMU.Abilities.use(sim, p, a);
        case 'quick': return fail('nur im Meeting');
        default: return fail('unbekannt');
      }
    }
    function myTaskAt(p, maxd) {
      let best = null, bd = maxd;
      p.tasks.forEach(tk => { if (tk.done) return; const s = stationPos(tk.sid), d = distTo(p, s[0], s[1]); if (d <= bd && grid.los(p.x, p.y, s[0], s[1])) { bd = d; best = tk; } });
      return best;
    }
    /** Interaktion: Aufgabe starten, Täuschen (Verräter), Reparatur, Kamera, Aufzug; modusspezifisches über Modes.use */
    function doUse(p, a) {
      if (p.busy) return fail('beschäftigt');
      if (!alive(p) && !p.ghost) return fail('aus');
      const m = AMU.Modes.use(sim, p, a); if (m) return m;
      // Reparatur hat Vorrang
      const rep = AMU.Sabotage.repairAt(sim, p);
      if (rep) return AMU.Sabotage.startRepair(sim, p, rep);
      // Aufzug
      const lift = (map.features || []).find(f => f.type === 'lift' && (distTo(p, f.a[0], f.a[1]) <= R.use || distTo(p, f.b[0], f.b[1]) <= R.use));
      if (lift && (a.what === 'lift' || !myTaskAt(p, R.use))) {
        const k = map.features.indexOf(lift);
        if ((sim.feat.liftCd[k] || 0) > sim.t) return fail('Aufzug fährt noch');
        const atA = distTo(p, lift.a[0], lift.a[1]) <= R.use, to = atA ? lift.b : lift.a;
        sim.feat.liftCd[k] = sim.t + 4000; p.x = to[0]; p.y = to[1] + 0.8; if (grid.hitCircle(p.x, p.y, 0.32)) { p.x = to[0]; p.y = to[1]; }
        emit('lift', { id: p.id, k }, 'all'); return { ok: true, data: { lift: k } };
      }
      // Kamerapult
      const cams = (map.features || []).find(f => f.type === 'cams' && distTo(p, f.at[0], f.at[1]) <= R.use);
      if (cams && a.what === 'cams') return { ok: true, data: { cams: camsView() } };
      const tk = myTaskAt(p, R.use);
      if (!tk) { if (cams) return { ok: true, data: { cams: camsView() } }; return fail('keine Aufgabe hier'); }
      if (p.jamUntil > sim.t && p.role !== 'tech') return fail('gestört');
      if (sim.phase !== 'play') return fail('phase');
      if (p.team !== 'crew') {   // Täuschen: sieht aus wie eine echte Aufgabe, bringt aber nichts
        p.busy = { kind: 'fake', sid: tk.sid, start: sim.t, until: sim.t + 2500 + (AMU.U.hash(p.id + tk.sid) % 4000) };
        AMU.Evidence && AMU.Evidence.stationUse(sim, p, tk.sid);
        return { ok: true, data: { fake: tk.sid, until: p.busy.until - sim.t } };
      }
      const diff = p.bot ? 1 : (sim.settings.diff);
      p.busy = { kind: 'task', sid: tk.sid, t: tk.t, seed: tk.seed, diff, start: sim.t, until: sim.t + 180000 };
      AMU.Evidence && AMU.Evidence.stationUse(sim, p, tk.sid);
      return { ok: true, data: { task: { sid: tk.sid, t: tk.t, seed: tk.seed, diff } } };
    }
    /** Abschluss einer Minispiel-Aufgabe: der Kern spielt die Eingaben nach und prüft die Lösung. Bots: acts = 'bot'. */
    function doTaskDone(p, a) {
      const b = p.busy;
      if (!b || (b.kind !== 'task' && b.kind !== 'repair')) return fail('keine Aufgabe offen');
      if (!verifyMinigame(p, b, a)) return fail('ungültig');
      p.busy = null;
      if (b.kind === 'repair') return AMU.Sabotage.finishRepair(sim, p, b);
      const tk = p.tasks.find(x => x.sid === b.sid && !x.done); if (!tk) return fail('schon erledigt');
      completeTask(p, tk);
      return { ok: true };
    }
    function verifyMinigame(p, b, a) {
      const botCtl = p.bot || p.botTakeover;
      if (sim.t - b.start < (botCtl ? 0 : 1200)) return false;
      if (botCtl) return a.acts === 'bot' && sim.t >= (b.botUntil || 0);
      if (!AMU.Tasks || !Array.isArray(a.acts) || a.acts.length > 600) return false;
      try {
        const st = AMU.Tasks.create(b.t, b.seed, b.diff);
        for (const x of a.acts) AMU.Tasks.act(b.t, st, x);
        return !!AMU.Tasks.done(b.t, st);
      } catch (e) { return false; }
    }
    function completeTask(p, tk) {
      tk.done = true; p.st.tasks++;
      if (p.team === 'crew') sim.taskDone++;
      emit('task', { sid: tk.sid }, p.id);
      emit('taskbar', { done: sim.taskDone, total: sim.taskTotal }, 'all');
      AMU.Modes.onTask && AMU.Modes.onTask(sim, p, tk);
      AMU.Rules.check(sim);
    }
    sim.completeTask = completeTask;
    function doReport(p, a) {
      if (!alive(p) || !sim.mode.flags.meetings) return fail('nicht möglich');
      const b = sim.bodies.find(x => !x.reported && distTo(p, x.x, x.y) <= R.report && grid.los(p.x, p.y, x.x, x.y) && (!a.body || x.id === a.body));
      if (!b) return fail('keine Person in der Nähe');
      p.st.reports++;
      startMeeting(p, b); return { ok: true };
    }
    function doButton(p) {
      if (!alive(p) || !sim.mode.flags.meetings) return fail('nicht möglich');
      if (distTo(p, map.button[0], map.button[1]) > R.button) return fail('zu weit weg');
      if (p.uses <= 0) return fail('keine Notrufe mehr');
      if (sim.sab.list.some(s => s.crit)) return fail('Notruf gesperrt während Sendeausfall');
      if (sim.t < (sim.btnReady || 0)) return fail('Notrufpult lädt noch');
      p.uses--; p.st.meetingsCalled++;
      startMeeting(p, null); return { ok: true };
    }
    function doKill(p, a) {
      if (!sim.mode.flags.kills || !isTraitor(p) || !alive(p)) return fail('nicht erlaubt');
      if ((p.cd.kill || 0) > sim.t) return fail('abklingzeit');
      const v = byId(a.target);
      if (!v || !alive(v) || isTraitor(v) || v === p) return fail('ziel');
      if (v.hidden > sim.t) return fail('ziel');
      if (distTo(p, v.x, v.y) > R.kill || !grid.los(p.x, p.y, v.x, v.y)) return fail('zu weit');
      if (v.shieldUntil > sim.t) {
        v.shieldUntil = 0; p.cd.kill = sim.t + killCdMs() / 2;
        emit('shield_hit', { by: p.id, target: v.id }, [v.id, p.id].concat(sim.players.filter(g => g.role === 'guard').map(g => g.id)));
        sim.players.forEach(w => { if (w !== p && w !== v && alive(w) && canSee(w, p)) emit('saw', { kind: 'attack', who: publicPlayer(p).id, target: v.id, room: roomOf(v) }, w.id); });
        return { ok: true, data: { blocked: true } };
      }
      v.alive = false; v.ghost = true; v.busy = null; v.st.survived = false; v.killedAt = sim.t; v.killedBy = p.id;
      p.cd.kill = sim.t + killCdMs(); p.st.kills++; sim.stats.kills++;
      const body = { id: v.id, x: v.x, y: v.y, t: sim.t, room: roomOf(v), reported: false, by: p.id };
      sim.bodies.push(body);
      const shown = publicPlayer(p);
      const wit = sim.players.filter(w => w !== p && w !== v && alive(w) && !w.ghost && distTo(w, v.x, v.y) <= visionOf(w) && grid.los(w.x, w.y, v.x, v.y) && distTo(w, p.x, p.y) <= visionOf(w) + 0.5);
      emit('down', { id: v.id, x: body.x, y: body.y }, [v.id, p.id].concat(wit.map(w => w.id)));
      wit.forEach(w => emit('saw', { kind: 'kill', who: shown.id, target: v.id, room: body.room }, w.id));
      emit('you_out', { by: 'traitor' }, v.id);
      AMU.Evidence && AMU.Evidence.onKill(sim, p, v, body);
      AMU.Rules.check(sim);
      return { ok: true };
    }
    function doVent(p) {
      if (!sim.mode.flags.vents || !isTraitor(p) || !alive(p)) return fail('nicht erlaubt');
      if ((p.cd.vent || 0) > sim.t) return fail('abklingzeit');
      let best = null;
      (map.vents || []).forEach((v, i) => {
        if (distTo(p, v[0], v[1]) <= R.vent) best = { i, to: [v[2], v[3]], from: [v[0], v[1]] };
        else if (distTo(p, v[2], v[3]) <= R.vent) best = { i, to: [v[0], v[1]], from: [v[2], v[3]] };
      });
      if (!best) return fail('kein Geheimgang');
      const wit = sim.players.filter(w => w !== p && alive(w) && !isTraitor(w) && canSee(w, p));
      wit.forEach(w => emit('saw', { kind: 'vent', who: publicPlayer(p).id, room: roomOf(p) }, w.id));
      p.x = best.to[0]; p.y = best.to[1]; p.hidden = sim.t + 900; p.cd.vent = sim.t + 6000; p.busy = null;
      emit('vent', { i: best.i }, p.id);
      return { ok: true };
    }
    function doSab(p, a) {
      if (!sim.mode.flags.sab || !isTraitor(p) || !alive(p)) return fail('nicht erlaubt');
      return AMU.Sabotage.trigger(sim, p, a);
    }

    // ===================== Meeting =====================
    function startMeeting(by, body) {
      sim.bodies.forEach(b => { b.reported = true; });
      sim.players.forEach(p => { if (!p.alive) sim.publicDead.add(p.id); p.busy = null; p.mx = p.my = 0; p.disguise = null; p.hidden = 0; });
      AMU.Sabotage.clearOnMeeting(sim);
      sim.stats.meetings++;
      AMU.Meeting.start(sim, by, body);
    }

    // ===================== Zeitschritt =====================
    function step(dtMs) {
      sim.acc += Math.min(dtMs, 250);
      let n = 0;
      while (sim.acc >= STEP && n++ < 10) { sim.acc -= STEP; fixed(); }
    }
    function fixed() {
      if (sim.phase === 'end') return;
      sim.t += STEP; sim.tick++;
      const dt = STEP / 1000;
      if (sim.phase === 'intro') { if (sim.t >= sim.phaseEnd) { sim.phase = 'play'; sim.playStart = sim.t; AMU.Modes.onPlay(sim); emit('phase', { phase: 'play' }, 'all'); } return; }
      if (sim.phase === 'meeting') { AMU.Meeting.tick(sim); runBrains(dt); return; }
      // Merkmale: Dunkelphasen, Tore
      (map.features || []).forEach((f, fi) => {
        if (f.type === 'dark') { const s = ((sim.t - (sim.playStart || 0)) / 1000) % f.period; const on = s > f.period - f.dur; if (on !== sim.feat.dark) { sim.feat.dark = on; emit('dark', { on }, 'all'); } }
        if (f.type === 'gate') {
          const s = ((sim.t - (sim.playStart || 0)) / 1000 + fi * 3) % f.period, open = s < f.open;
          const d = grid.doors.find(x => x.gate === fi);
          if (d && sim.feat.gates[fi] !== open) {
            if (!open && sim.players.some(p => p.alive && d.cells.includes(grid.cellOf(p.x, p.y)))) { /* niemanden einklemmen: warten */ }
            else { sim.feat.gates[fi] = open; grid.closed[d.id] = open ? 0 : 1; emit('gate', { fi, open }, 'all'); }
          }
        }
      });
      AMU.Sabotage.tick(sim);
      runBrains(dt);
      // Bewegung
      sim.players.forEach(p => {
        if (p.escaped || p.caught) { p.moving = false; return; }
        if (p.busy) { p.moving = false; if (p.busy.until <= sim.t && p.busy.kind === 'fake') { p.busy = null; emit('busy_end', { kind: 'fake', ok: true }, p.id); } else if (p.busy && p.busy.until <= sim.t && p.busy.auto) AMU.Modes.finishBusy(sim, p); return; }
        if (p.hidden > sim.t && sim.mode.flags.hunt && p.hideSpot != null) { p.moving = false; return; }
        if (AMU.Modes.frozen(sim, p)) { p.moving = false; return; }
        const l = Math.hypot(p.mx, p.my);
        if (l < 0.05) { p.moving = false; return; }
        const mul = grid.zone[grid.cellOf(p.x, p.y)] || 1;
        const sp = BASE_SPEED * sim.settings.speed * (p.ghost ? 1.25 : 1) * AMU.Modes.speedMul(sim, p) * (p.ghost ? 1 : mul);
        const dx = p.mx * sp * dt, dy = p.my * sp * dt;
        if (p.ghost) {   // Geister schweben durch Wände, bleiben aber auf der Karte
          p.x = AMU.U.clamp(p.x + dx, 0.5, grid.W - 0.5); p.y = AMU.U.clamp(p.y + dy, 0.5, grid.H - 0.5);
        } else {
          const r = grid.move(p.x, p.y, dx, dy, 0.32); p.x = r[0]; p.y = r[1];
        }
        p.dir = Math.atan2(p.mx, p.my); p.moving = true;
      });
      // Verlauf (1 Hz) für Spuren/Alibis
      if (sim.tick % 20 === 0) sim.players.forEach(p => { const h = sim.hist[p.id]; h.push([sim.t, p.alive ? roomOf(p) : -2, +p.x.toFixed(1), +p.y.toFixed(1)]); if (h.length > 240) h.shift(); });
      AMU.Modes.tick(sim, dt);
      if (sim.tick % 20 === 0) AMU.Rules.check(sim);
    }
    function runBrains(dt) {
      for (const id in sim.brains) {
        const p = byId(id); if (!p || (!p.bot && !p.botTakeover)) continue;
        try { sim.brains[id].tick(dt); } catch (e) { if (!sim.brainErr) { sim.brainErr = e; if (root.console) console.warn('Bot-Fehler', e); } }
      }
    }
    function endGame(winner, reason, winners) {
      if (sim.phase === 'end') return;
      sim.phase = 'end'; sim.meeting = null;
      sim.result = {
        winner, reason, winners: winners || sim.players.filter(p => p.team === winner).map(p => p.id), dur: sim.t - (sim.playStart || 0),
        players: sim.players.map(p => ({ id: p.id, n: p.name, role: p.role, team: p.team, alive: p.alive, bot: p.bot, look: p.look, sym: p.sym, st: p.st, escaped: p.escaped })),
        stats: Object.assign({}, sim.stats, { taskDone: sim.taskDone, taskTotal: sim.taskTotal })
      };
      emit('end', { result: sim.result }, 'all');
      if (sim.onEnd) try { sim.onEnd(sim.result); } catch (e) { /* */ }
    }

    // ===================== Sicht je Person =====================
    function camsView() {
      return map.rooms.map((rm, i) => ({ room: i, n: rm.n, ids: sim.players.filter(o => o.alive && !o.ghost && roomOf(o) === i && !(o.hidden > sim.t)).map(o => publicPlayer(o).id) }));
    }
    function viewFor(pid) {
      const me = byId(pid); if (!me) return null;
      const v = {
        t: sim.t, mode: sim.mode.id, map: map.id, phase: sim.phase, left: sim.phase === 'intro' ? sim.phaseEnd - sim.t : 0,
        me: {
          id: me.id, role: me.role, team: me.team, alive: me.alive ? 1 : 0, ghost: me.ghost ? 1 : 0, x: me.x, y: me.y, dir: me.dir, uses: me.uses,
          tasks: me.tasks.map(t => ({ sid: t.sid, t: t.t, done: t.done ? 1 : 0 })), busy: me.busy ? { kind: me.busy.kind, left: Math.max(0, me.busy.until - sim.t), sid: me.busy.sid, t: me.busy.t || null, seed: me.busy.seed == null ? null : me.busy.seed, diff: me.busy.diff == null ? null : me.busy.diff } : null,
          cd: {}, vision: visionOf(me), jam: me.jamUntil > sim.t ? 1 : 0, shield: me.shieldUntil > sim.t ? 1 : 0, pkg: me.pkg ? 1 : 0,
          disguise: me.disguise && me.disguise.until > sim.t ? me.disguise.as : null, hidden: me.hidden > sim.t ? 1 : 0, caught: me.caught ? 1 : 0, escaped: me.escaped ? 1 : 0, out: me.caughtN >= 3 ? 1 : 0
        },
        mates: me.team === 'traitor' ? sim.players.filter(o => o.team === 'traitor' && o !== me).map(o => o.id) : (me.team === 'hunter' ? [] : []),
        roster: sim.players.map(o => ({ id: o.id, n: o.name, look: o.look, sym: o.sym, bot: o.bot ? 1 : 0, dead: sim.publicDead.has(o.id) || (me.ghost && !o.alive) || o.id === me.id && !me.alive ? 1 : 0, conn: o.connected || o.bot ? 1 : 0,
          team: (sim.mode.flags.hunt && o.team === 'hunter') || (me.team === 'traitor' && o.team === 'traitor') || o === me ? o.team : undefined })),
        players: [], bodies: [],
        sab: AMU.Sabotage.publicState(sim, me),
        doors: Array.from(grid.closed).map((c, i) => c ? i : -1).filter(i => i >= 0),
        feat: { dark: sim.feat.dark ? 1 : 0 },
        bar: sim.mode.flags.tasks && sim.mode.id !== 'detektiv' ? { done: sim.taskDone, total: sim.taskTotal } : null,
        meeting: AMU.Meeting.publicState(sim, me),
        ext: null, result: sim.phase === 'end' ? sim.result : null
      };
      Object.keys(me.cd).forEach(k => { v.me.cd[k] = Math.max(0, me.cd[k] - sim.t); });
      sim.players.forEach(o => { if (o !== me && canSee(me, o)) v.players.push(publicPlayer(o)); });
      v.players.sort((a, b) => a.id < b.id ? -1 : 1);
      sim.bodies.forEach(b => { if (!b.reported && (me.ghost || (distTo(me, b.x, b.y) <= visionOf(me) && grid.los(me.x, me.y, b.x, b.y)))) v.bodies.push({ id: b.id, x: b.x, y: b.y }); });
      if (sim.mode.flags.timer && sim.ext.timeEnd) v.timer = Math.max(0, sim.ext.timeEnd - sim.t);
      v.ext = AMU.Modes.view(sim, me) || null;
      return v;
    }
  }

  AMU.Sim = { create, STEP, R, VISION, BASE_SPEED };
  if (typeof module !== 'undefined' && module.exports) module.exports = AMU.Sim;
})(typeof window !== 'undefined' ? window : globalThis);
