/* AnMaCha UNDERCOVER 3D – modusspezifische Spielschleifen: Rollenvergabe, Start, Zeittakt, eigene Aktionen und Sicht.
   jagd: klassisch | detektiv: Spuren & Fälle | chaos: Sendequalität, Eskalation, Teamaufträge | jagen: Jäger vs. Flüchtende |
   rollen: Sonderrollen. (Das Wortspiel hat einen eigenen Kern: core/word-game.js.) */
(function (root) {
  'use strict';
  const AMU = root.AMU = root.AMU || {};
  const fail = why => ({ ok: false, why });

  const Modes = {
    // ---------------- Rollen ----------------
    setupRoles(sim) {
      const P = sim.players, s = sim.settings, r = sim.rng.fork('roles'), id = sim.mode.id, n = P.length;
      const order = r.shuffle(P.map((p, i) => i));
      const set = (k, role) => { P[order[k]].role = role; };
      let k = 0;
      if (id === 'jagen') { for (let i = 0; i < Math.min(s.hunters, n - 1); i++) set(k++, 'hunter'); for (; k < n; k++) set(k, 'runner'); }
      else {
        let traitors = s.traitors;
        if (id === 'detektiv') { sim.caseIdx = sim.rng.fork('case').int(AMU.CASES.length); traitors = AMU.CASES[sim.caseIdx].twist === 'two' ? 2 : 1; }   // ein Täter, außer im Fall „Zwei Täter“
        traitors = Math.max(1, Math.min(traitors, Math.floor((n - 1) / 2)));
        const tIdx = []; for (let i = 0; i < traitors; i++) { tIdx.push(k); set(k++, 'traitor'); }
        if (id === 'detektiv') { const d = n >= 9 ? 2 : 1; for (let i = 0; i < d && k < n; i++) set(k++, 'detective'); }
        if (id === 'rollen') {
          const list = r.shuffle(s.roleList.slice()).slice(0, s.roleLimit);
          const evil = list.filter(x => AMU.ROLES[x].team === 'traitor');
          evil.slice(0, tIdx.length).forEach((x, i) => set(tIdx[i], x));
          list.filter(x => AMU.ROLES[x].team !== 'traitor').forEach(x => { if (k < n - 1) set(k++, x); });
        }
        for (; k < n; k++) set(k, 'crew');
      }
      // Wunschrolle des Solo-Spielers (Ausprobieren)
      const w = sim.wish;
      if (w && w.pid && w.role) {
        const me = P.find(p => p.id === w.pid), other = P.find(p => p.role === w.role && p !== me);
        if (me && other) { const t = me.role; me.role = other.role; other.role = t; }
        else if (me && AMU.ROLES[w.role] && Modes.roleFits(sim, w.role)) {
          // Rolle existiert in der Partie noch nicht: tauschen gegen eine Person derselben Partei
          const T = AMU.ROLES[w.role].team, same = P.find(p => p !== me && AMU.ROLES[p.role].team === T);
          if (same && AMU.ROLES[me.role].team !== T) { const t = me.role; me.role = same.role; same.role = t; }
          me.role = w.role;
        }
      }
    },
    roleFits(sim, role) {
      const id = sim.mode.id, T = AMU.ROLES[role] && AMU.ROLES[role].team;
      if (id === 'jagen') return role === 'hunter' || role === 'runner';
      if (role === 'hunter' || role === 'runner') return false;
      if (id === 'rollen') return true;
      if (id === 'detektiv') return role === 'crew' || role === 'traitor' || role === 'detective';
      return role === 'crew' || role === 'traitor' || (T === 'crew' && false);
    },
    // ---------------- Aufbau ----------------
    setup(sim) {
      const id = sim.mode.id;
      if (id === 'detektiv') AMU.Evidence.init(sim);
      if (id === 'chaos') {
        Object.assign(sim.ext, { quality: 100, phaseN: 1, nextFault: 0, orders: Modes.makeOrders(sim), hold: 0 });
      }
      if (id === 'jagen') {
        const st = sim.map.stations, picks = [];
        // Funkbaken möglichst weit verteilt (Fernster-Punkt-Auswahl)
        const r = sim.rng.fork('beacons'); picks.push(r.int(st.length));
        while (picks.length < Math.min(5, st.length)) {
          let best = -1, bd = -1;
          st.forEach((s, i) => { if (picks.includes(i)) return; const d = Math.min.apply(null, picks.map(j => Math.hypot(st[j].at[0] - s.at[0], st[j].at[1] - s.at[1]))); if (d > bd) { bd = d; best = i; } });
          picks.push(best);
        }
        const runners = sim.players.filter(p => p.team === 'runner').length;
        Object.assign(sim.ext, { beacons: picks.map(i => ({ sid: i, at: st[i].at, on: 0 })), need: runners <= 3 ? 3 : runners <= 5 ? 4 : 5, exits: false, escaped: 0, reveal: {}, pending: [] });
        sim.players.forEach(p => { p.stamina = 1; });
        // Startpositionen: Jäger in der Mitte (Notrufpult), Flüchtende verteilt
        const rr = sim.rng.fork('spawn'), rooms = sim.map.rooms.map((rm, i) => i);
        sim.players.forEach(p => {
          if (p.team === 'hunter') return;
          // Startpunkt mit Abstand zu den Jägern (bis zu 12 Versuche, sonst der weiteste)
          const b = sim.map.button; let best = null, bd = -1;
          for (let i = 0; i < 12 && bd < 14; i++) {
            const rm = sim.map.rooms[rooms[rr.int(rooms.length)]];
            const x = rm.r[0] + 1.5 + rr.int(Math.max(1, rm.r[2] - 3)), y = rm.r[1] + 1.5 + rr.int(Math.max(1, rm.r[3] - 3));
            const f = sim.grid.nearestFloor(x, y), d = Math.hypot(f[0] - b[0], f[1] - b[1]);
            if (d > bd) { bd = d; best = f; }
          }
          p.x = best[0]; p.y = best[1];
        });
      }
    },
    onPlay(sim) {
      const id = sim.mode.id, s = sim.settings;
      sim.players.forEach(p => { if (p.team === 'traitor') p.cd.kill = sim.t + sim.killCdMs() * 0.6 + 4000; });
      sim.sab.cd = sim.t + 12000; sim.btnReady = sim.t + 12000;
      if (id === 'detektiv') {
        const tw = sim.ext.case.twist;
        sim.ext.timeEnd = sim.t + s.timeLimit * 1000 * (tw === 'fast' ? 0.7 : 1);
        if (tw === 'blackout') AMU.Sabotage.start(sim, 'lights', 'env');
        if (tw === 'incident') Modes.incident(sim);
      }
      if (id === 'chaos') { sim.ext.timeEnd = sim.t + s.chaosTime * 1000; sim.ext.nextFault = sim.t + 15000; sim.ext.start = sim.t; }
      if (id === 'jagen') { sim.ext.timeEnd = sim.t + s.huntTime * 1000; sim.ext.freeze = sim.t + 10000; }
    },
    incident(sim) {
      const r = sim.rng.fork('incident');
      const crew = sim.players.filter(p => p.team === 'crew' && p.role !== 'detective');
      const tr = sim.players.find(p => p.team === 'traitor');
      if (crew.length < 3 || !tr) return;
      const v = crew.slice().sort((a, b) => (b.bot ? 1 : 0) - (a.bot ? 1 : 0))[0];
      const st = sim.map.stations[r.int(sim.map.stations.length)];
      v.x = st.at[0]; v.y = st.at[1] + 0.6; if (sim.grid.hitCircle(v.x, v.y, 0.3)) v.y = st.at[1];
      const bx = tr.x, by = tr.y; tr.x = v.x + 0.6; tr.y = v.y;
      // Verlauf so, dass der Täter am Tatort war
      sim.hist[tr.id].push([sim.t, sim.grid.roomAt(v.x, v.y), tr.x, tr.y]);
      v.alive = false; v.ghost = true; v.st.survived = false;
      const body = { id: v.id, x: v.x, y: v.y, t: sim.t, room: sim.grid.roomAt(v.x, v.y), reported: false, by: tr.id };
      sim.bodies.push(body); AMU.Evidence.onKill(sim, tr, v, body);
      tr.x = bx; tr.y = by;
      sim.emit('you_out', { by: 'incident' }, v.id);
      sim.emit('notice', { key: 'incident', room: body.room }, 'all');
    },
    makeOrders(sim) {
      const r = sim.rng.fork('orders');
      const pool = [
        { id: 'repairs', n: 'Behebt 4 Störungen', goal: 4 },
        { id: 'tasks', n: 'Erledigt 8 Aufgaben', goal: Math.max(3, Math.min(8, sim.taskTotal)) },
        { id: 'hold', n: 'Haltet die Qualität 45 s über 70 %', goal: 45 },
        { id: 'double', n: 'Schafft 2 Doppelreparaturen', goal: 2 },
        { id: 'fast', n: 'Behebt eine Störung in unter 20 s', goal: 1 }
      ];
      return r.shuffle(pool).slice(0, 3).map(o => Object.assign({ prog: 0, done: 0 }, o));
    },
    orderProgress(sim, id, n) {
      (sim.ext.orders || []).forEach(o => {
        if (o.id !== id || o.done) return;
        o.prog = Math.min(o.goal, o.prog + n);
        if (o.prog >= o.goal) { o.done = 1; sim.ext.quality = Math.min(100, sim.ext.quality + 15); sim.emit('order', { n: o.n }, 'all'); }
      });
    },
    // ---------------- Takt ----------------
    tick(sim, dt) {
      const id = sim.mode.id;
      if (id === 'chaos') Modes.chaosTick(sim, dt);
      if (id === 'jagen') Modes.huntTick(sim, dt);
      if (sim.ext.timeEnd && sim.t >= sim.ext.timeEnd) AMU.Rules.check(sim);
    },
    chaosTick(sim, dt) {
      const e = sim.ext, s = sim.settings, len = s.chaosTime * 1000, el = sim.t - e.start;
      const ph = el < len / 3 ? 1 : el < len * 2 / 3 ? 2 : 3;
      if (ph !== e.phaseN) { e.phaseN = ph; sim.emit('escalate', { phase: ph }, 'all'); }
      const DR = { lights: 0.35, comms: 0.45, mixer: 0.6, tower: 0.8, crit: 0.5 };
      let drain = 0; sim.sab.list.forEach(x => { drain += DR[x.type] || 0; });
      drain *= (0.75 + 0.25 * s.diff) * (0.8 + 0.2 * ph);
      // ohne Störung erholt sich die Sendung langsam
      e.quality = drain ? Math.max(0, e.quality - drain * 0.85 * dt) : Math.min(100, e.quality + 0.3 * dt);
      // Teamauftrag "hold"
      if (e.quality > 70) { e.hold += dt; if (e.hold >= 1) { e.hold -= 1; Modes.orderProgress(sim, 'hold', 1); } } else e.hold = 0;
      // Umgebungsstörungen (Eskalation)
      if (sim.t >= e.nextFault) {
        const base = [42, 30, 20][ph - 1] * [1.25, 1, 0.8][s.diff];
        e.nextFault = sim.t + base * 1000 * sim.rng.range(0.8, 1.2);
        const env = sim.sab.list.filter(x => x.src === 'env' && x.type !== 'doors').length;
        if (env < ph) {
          const opts = ['lights', 'comms', 'mixer', 'tower'].filter(t => !sim.sab.list.some(x => x.type === t));
          if (opts.length && sim.rng.chance(0.75)) AMU.Sabotage.start(sim, sim.rng.pick(opts), 'env');
          else AMU.Sabotage.start(sim, 'doors', 'env', { room: sim.rng.int(sim.map.rooms.length) });
        }
      }
      if (e.quality <= 0) AMU.Rules.check(sim);
    },
    onTask(sim) { if (sim.mode.flags.chaos) { sim.ext.quality = Math.min(100, sim.ext.quality + 2); Modes.orderProgress(sim, 'tasks', 1); } },
    onFix(sim, s) {
      if (!sim.mode.flags.chaos) return;
      sim.ext.quality = Math.min(100, sim.ext.quality + 4);
      Modes.orderProgress(sim, 'repairs', 1);
      if (s.pts && s.pts.length > 1) Modes.orderProgress(sim, 'double', 1);
      if (s.start && sim.t - s.start < 20000) Modes.orderProgress(sim, 'fast', 1);
    },
    onMeeting() {},
    onEject(sim, ej) { if (ej && ej.team === 'neutral' && ej.role === 'trickster') sim.ext.trickWin = ej.id; },
    // ---------------- Verstecken & Jagen ----------------
    huntTick(sim) {
      const e = sim.ext, P = sim.players;
      e.pending = e.pending.filter(q => { if (q.at <= sim.t) { q.fn(); return false; } return true; });
      P.forEach(p => {
        if (p.team !== 'runner' || p.escaped || p.caught) return;
        if (p.hideSpot != null && p.hidden <= sim.t) Modes.unhide(sim, p);
        if (e.exits && sim.map.exits.some(x => Math.hypot(x[0] - p.x, x[1] - p.y) < 1.1)) {
          p.escaped = true; p.hidden = 0; e.escaped++; p.st.escaped = 1;
          sim.emit('escaped', { id: p.id }, 'all');
        }
        // Geräusche: Sprint verrät die Richtung
        if (p.sprintUntil > sim.t && p.moving && sim.tick % 10 === 0) Modes.noise(sim, p, 1.8);
        else if (p.moving && sim.tick % 20 === 0) P.forEach(h => { if (h.team === 'hunter' && Math.hypot(h.x - p.x, h.y - p.y) < 4.5 && !sim.grid.los(h.x, h.y, p.x, p.y)) sim.emit('noise', { x: p.x + sim.rng.range(-1, 1), y: p.y + sim.rng.range(-1, 1), lvl: 1 }, h.id); });
        p.stamina = Math.min(1, (p.stamina || 0) + 0.004);
      });
      AMU.Rules.check(sim);
    },
    noise(sim, p, fuzz) {
      sim.players.forEach(h => { if (h.team === 'hunter') sim.emit('noise', { x: p.x + sim.rng.range(-fuzz, fuzz), y: p.y + sim.rng.range(-fuzz, fuzz), lvl: 2 }, h.id); });
    },
    huntCheck(sim) {
      const e = sim.ext, runners = sim.players.filter(p => p.team === 'runner');
      const needed = Math.ceil(runners.length / 2);
      const possible = runners.filter(p => p.escaped || p.caughtN < 3).length;
      if (e.escaped >= needed) { sim.endGame('runner', 'Genug Flüchtende sind entkommen'); return true; }
      if (possible < needed) { sim.endGame('hunter', 'Zu viele Flüchtende wurden gefangen'); return true; }
      if (runners.every(p => p.escaped || p.caught)) {
        if (e.escaped >= needed) sim.endGame('runner', 'Genug Flüchtende sind entkommen'); else sim.endGame('hunter', 'Alle übrigen Flüchtenden sind gefangen');
        return true;
      }
      if (e.timeEnd && sim.t >= e.timeEnd) { sim.endGame('hunter', 'Die Zeit ist abgelaufen'); return true; }
      return false;
    },
    hide(sim, p) {
      if ((p.cd.hide || 0) > sim.t) return fail('abklingzeit');
      const i = sim.map.hides.findIndex((h, k) => Math.hypot(h.at[0] - p.x, h.at[1] - p.y) <= sim.R.hide && !sim.players.some(o => o.hideSpot === k));
      if (i < 0) return fail('kein Versteck');
      const h = sim.map.hides[i];
      p.hideSpot = i; p.hidden = sim.t + 15000; p.x = h.at[0]; p.y = h.at[1];
      sim.emit('hidden', { i }, p.id); return { ok: true };
    },
    unhide(sim, p) { if (p.hideSpot == null) return; p.hideSpot = null; p.hidden = 0; p.cd.hide = sim.t + 10000; sim.emit('unhidden', {}, p.id); },
    capture(sim, h, v) {
      Modes.unhide(sim, v);
      v.caughtN++; v.caught = true; v.busy = null; v.shieldUntil = 0;
      const c = sim.map.cage; v.x = c[0] + sim.rng.range(-0.8, 0.8); v.y = c[1] + sim.rng.range(-0.6, 0.6);
      const f = sim.grid.nearestFloor(v.x, v.y); v.x = f[0]; v.y = f[1];
      h.st.kills++; sim.emit('caught', { id: v.id, by: h.id, out: v.caughtN >= 3 ? 1 : 0 }, 'all');
      AMU.Rules.check(sim);
    },
    // ---------------- Aktionen ----------------
    action(sim, p, a) {
      const id = sim.mode.id;
      if (id === 'jagen') {
        if (p.caught || p.escaped) return fail('gefangen');
        switch (a.a) {
          case 'tag': {
            if (p.team !== 'hunter' || sim.t < sim.ext.freeze) return fail('nicht erlaubt');
            if ((p.cd.tag || 0) > sim.t) return fail('abklingzeit');
            const v = sim.byId(a.target);
            if (!v || v.team !== 'runner' || v.caught || v.escaped || v.hidden > sim.t || v.shieldUntil > sim.t) return fail('ziel');
            if (Math.hypot(v.x - p.x, v.y - p.y) > sim.R.tag || !sim.grid.los(p.x, p.y, v.x, v.y)) return fail('zu weit');
            if (Math.hypot(v.x - sim.map.cage[0], v.y - sim.map.cage[1]) < 4.5) return fail('Schutzzone am Käfig');
            p.cd.tag = sim.t + 5000; Modes.capture(sim, p, v); return { ok: true };
          }
          case 'search': {
            if (p.team !== 'hunter') return fail('nicht erlaubt');
            if ((p.cd.search || 0) > sim.t) return fail('abklingzeit');
            const i = sim.map.hides.findIndex(h => Math.hypot(h.at[0] - p.x, h.at[1] - p.y) <= sim.R.hide + 0.4);
            if (i < 0) return fail('kein Versteck');
            p.cd.search = sim.t + 2500;
            const v = sim.players.find(o => o.hideSpot === i);
            if (v) { Modes.capture(sim, p, v); return { ok: true, data: { found: 1 } }; }
            sim.emit('search_empty', {}, p.id); return { ok: true, data: { found: 0 } };
          }
          case 'pulse': {
            if (p.team !== 'hunter' || sim.t < sim.ext.freeze) return fail('nicht erlaubt');
            if ((p.cd.pulse || 0) > sim.t) return fail('abklingzeit');
            p.cd.pulse = sim.t + 45000;
            sim.players.forEach(o => { if (o.team === 'runner' && !o.escaped) sim.emit('pulse_warn', { by: p.id }, o.id); });
            sim.ext.pending.push({ at: sim.t + 1500, fn: () => { sim.ext.reveal[p.id] = { until: sim.t + 3000, ids: sim.players.filter(o => o.team === 'runner' && !o.escaped && !(o.hideSpot != null)).map(o => o.id) }; sim.emit('pulse', { ids: sim.ext.reveal[p.id].ids }, p.id); } });
            return { ok: true };
          }
          case 'sprint': {
            if ((p.cd.sprint || 0) > sim.t) return fail('abklingzeit');
            if (p.team === 'runner' && p.stamina < 0.5) return fail('erschöpft');
            const hunter = p.team === 'hunter';
            p.sprintUntil = sim.t + (hunter ? 2500 : 2000); p.cd.sprint = sim.t + (hunter ? 14000 : 10000);
            if (!hunter) { p.stamina -= 0.5; Modes.noise(sim, p, 1.5); }
            return { ok: true };
          }
          case 'hide': if (p.team !== 'runner') return fail('nicht erlaubt'); return Modes.hide(sim, p);
          case 'unhide': Modes.unhide(sim, p); return { ok: true };
          case 'rescue': return Modes.rescue(sim, p);
          case 'kill': case 'report': case 'button': case 'vent': case 'sab': return fail('nicht in diesem Modus');
        }
        return null;
      }
      if (id === 'detektiv' && a.a === 'tamper') return AMU.Evidence.tamper(sim, p);
      return null;
    },
    rescue(sim, p) {
      if (p.team !== 'runner' || p.caught) return fail('nicht erlaubt');
      if ((p.cd.rescue || 0) > sim.t) return fail('abklingzeit');
      const c = sim.map.cage;
      if (Math.hypot(c[0] - p.x, c[1] - p.y) > sim.R.rescue + 1) return fail('zu weit');
      const freed = sim.players.filter(o => o.caught && o.caughtN < 3);
      if (!freed.length) return fail('niemand gefangen');
      freed.forEach(o => { o.caught = false; o.shieldUntil = sim.t + 4000; });
      p.cd.rescue = sim.t + 15000; p.st.rescues++;
      sim.emit('rescued', { by: p.id, ids: freed.map(o => o.id) }, 'all');
      return { ok: true };
    },
    use(sim, p, a) {
      const id = sim.mode.id;
      if (id === 'jagen') {
        if (p.caught || p.escaped) return fail('gefangen');
        if (p.team === 'runner') {
          if (p.hideSpot != null) { Modes.unhide(sim, p); return { ok: true }; }
          const b = sim.ext.beacons.find(x => !x.on && Math.hypot(x.at[0] - p.x, x.at[1] - p.y) <= sim.R.use);
          if (b) { p.busy = { kind: 'beacon', sid: b.sid, start: sim.t, until: sim.t + 12000, auto: true }; return { ok: true, data: { beacon: b.sid, until: 12000 } }; }
          const c = sim.map.cage;
          if (Math.hypot(c[0] - p.x, c[1] - p.y) <= sim.R.rescue + 1 && sim.players.some(o => o.caught && o.caughtN < 3)) return Modes.rescue(sim, p);
          const h = Modes.hide(sim, p); if (h.ok) return h;
          return fail('nichts zu tun');
        }
        if (p.team === 'hunter') return Modes.action(sim, p, { a: 'search' });
      }
      if (id === 'detektiv') {
        if (p.role === 'detective' && sim.alive(p)) { const r = AMU.Evidence.investigate(sim, p); if (r) return r; }
        if (p.team === 'traitor' && a.what === 'tamper') return AMU.Evidence.tamper(sim, p);
      }
      if (p.role === 'courier' && sim.alive(p) && a.what === 'courier') return AMU.Abilities.use(sim, p, { a: 'ability' });
      return null;
    },
    finishBusy(sim, p) {
      const b = p.busy; p.busy = null;
      if (b.kind === 'beacon') {
        const x = sim.ext.beacons.find(q => q.sid === b.sid);
        if (x && !x.on) {
          x.on = 1; p.st.beacons++; Modes.noise(sim, p, 2.5);
          const n = sim.ext.beacons.filter(q => q.on).length;
          sim.emit('beacon', { sid: b.sid, n, need: sim.ext.need }, 'all');
          if (n >= sim.ext.need && !sim.ext.exits && !sim.ext.exitsAt) {
            // Ausgänge öffnen nach 15 s – Jäger werden gewarnt und können sie noch bewachen
            sim.ext.exitsAt = sim.t + 15000; sim.emit('exits_soon', { in: 15000 }, 'all');
            sim.ext.pending.push({ at: sim.ext.exitsAt, fn: () => { sim.ext.exits = true; sim.emit('exits', {}, 'all'); } });
          }
        }
      } else if (b.kind === 'investigate') AMU.Evidence.finishInvestigate(sim, p, b);
      else if (b.kind === 'pickup') { p.pkg = true; sim.emit('pkg', {}, p.id); }
      sim.emit('busy_end', { kind: b.kind, ok: true }, p.id);
    },
    frozen(sim, p) { return sim.mode.id === 'jagen' && ((p.team === 'hunter' && sim.t < sim.ext.freeze) || p.caught || p.escaped); },
    speedMul(sim, p) {
      if (sim.mode.id !== 'jagen') return 1;
      let m = p.team === 'runner' ? 1.1 : 1;
      if (p.sprintUntil > sim.t) m *= p.team === 'hunter' ? 1.45 : 1.5;
      return m;
    },
    // ---------------- Sicht ----------------
    view(sim, me) {
      const id = sim.mode.id;
      if (id === 'chaos') return { quality: Math.round(sim.ext.quality), phaseN: sim.ext.phaseN, orders: sim.ext.orders.map(o => ({ n: o.n, prog: o.prog, goal: o.goal, done: o.done })) };
      if (id === 'jagen') {
        const runners = sim.players.filter(p => p.team === 'runner');
        const rv = sim.ext.reveal[me.id];
        return {
          beacons: sim.ext.beacons.map(b => ({ sid: b.sid, x: b.at[0], y: b.at[1], on: b.on })), need: sim.ext.need, exits: sim.ext.exits ? 1 : 0, exitsIn: !sim.ext.exits && sim.ext.exitsAt ? Math.max(0, sim.ext.exitsAt - sim.t) : 0,
          exitPts: sim.map.exits, cage: sim.map.cage, escaped: sim.ext.escaped, needed: Math.ceil(runners.length / 2),
          caught: runners.filter(p => p.caught).map(p => p.id), freeze: Math.max(0, sim.ext.freeze - sim.t),
          hunters: sim.players.filter(p => p.team === 'hunter').map(p => p.id),
          danger: me.team === 'runner' && sim.players.some(h => h.team === 'hunter' && Math.hypot(h.x - me.x, h.y - me.y) < 5) ? 1 : 0, stamina: me.stamina != null ? +me.stamina.toFixed(2) : 1,
          pulse: rv && rv.until > sim.t ? 1 : 0, hides: sim.map.hides.map(h => h.at)
        };
      }
      if (id === 'detektiv') return AMU.Evidence.view(sim, me);
      if (id === 'rollen') {
        const v = { cleared: sim.ext.cleared || [] };
        if (me.role === 'tracker' && sim.alive(me)) {
          v.trails = [];
          sim.players.forEach(o => { if (o === me || !o.alive) return; const h = sim.hist[o.id] || []; h.slice(-10).forEach(q => { if (Math.hypot(q[2] - me.x, q[3] - me.y) < 8) v.trails.push([+q[2], +q[3], o.sym, Math.round((sim.t - q[0]) / 1000)]); }); });
        }
        return v;
      }
      return null;
    }
  };
  AMU.Modes = Modes;
  if (typeof module !== 'undefined' && module.exports) module.exports = Modes;
})(typeof window !== 'undefined' ? window : globalThis);
