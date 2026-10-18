/* AnMaCha UNDERCOVER 3D – Sabotagen und Reparaturen (Teil des Spielkerns, ohne DOM).
   Arten: lights (Stromausfall), comms (Funkstille), crit (Sendeausfall, zwei Stationen, Countdown), doors (Türen eines Raums),
   im Sabotage-Chaos zusätzlich mixer (Mischpult) und tower (Sendeturm, zwei Stationen). Reparaturen sind echte Minispiele;
   Doppelreparaturen müssen innerhalb eines Zeitfensters an beiden Stationen gelingen. */
(function (root) {
  'use strict';
  const AMU = root.AMU = root.AMU || {};
  const TYPES = {
    lights: { n: 'Stromausfall', icon: '💡', task: 'sicherung', pts: m => [m.repairs.lights] },
    comms: { n: 'Funkstille', icon: '📻', task: 'frequenz', pts: m => [m.repairs.comms] },
    crit: { n: 'Sendeausfall', icon: '🚨', task: 'notfunk', pts: m => m.repairs.crit, crit: true, window: 12000 },
    mixer: { n: 'Mischpult zerstört', icon: '🎛️', task: 'kanaele', pts: m => [m.repairs.mixer], chaos: true },
    tower: { n: 'Sendeturm defekt', icon: '🗼', task: 'antenne', pts: m => m.repairs.tower, chaos: true, window: 15000 },
    doors: { n: 'Türen verriegelt', icon: '🚪', pts: () => [] }
  };
  let nextId = 1;
  const S = {
    TYPES,
    allowed(sim) {
      const l = ['lights', 'comms', 'doors'];
      if (sim.mode.flags.chaos) l.push('mixer', 'tower', 'crit');
      else if (sim.settings.critWin) l.push('crit');
      return l;
    },
    /** Sabotage starten (src 'traitor' prüft Regeln, 'env' = Umgebungsstörung im Chaos-Modus). */
    start(sim, type, src, extra) {
      const T = TYPES[type]; if (!T) return null;
      if (type === 'doors') {
        const r = extra && extra.room;
        const ds = sim.grid.doors.filter(d => d.room === r && d.gate == null);
        if (!ds.length || (sim.sab.doorsUntil[r] || 0) > sim.t) return null;
        const until = sim.t + 9000;
        sim.sab.doorsUntil[r] = until + 12000;   // danach Sperrfrist für denselben Raum
        ds.forEach(d => { sim.grid.closed[d.id] = 1; S.unstick(sim, d); });
        const s = { id: nextId++, type, room: r, until, src, doors: ds.map(d => d.id) };
        sim.sab.list.push(s); sim.emit('sab', { sab: type, room: r, src }, 'all'); return s;
      }
      if (sim.sab.list.some(s => s.type === type)) return null;
      const s = { id: nextId++, type, src, start: sim.t, crit: !!T.crit, pts: T.pts(sim.map).map(p => ({ x: p[0], y: p[1], done: 0 })), window: T.window || 0 };
      if (T.crit) s.until = sim.t + (sim.mode.flags.chaos ? 50000 : 45000);
      sim.sab.list.push(s); sim.stats.sabs++;
      sim.emit('sab', { sab: type, src }, 'all');
      return s;
    },
    trigger(sim, p, a) {
      const type = a.type;
      if (!S.allowed(sim).includes(type)) return { ok: false, why: 'nicht erlaubt' };
      if (sim.sab.cd > sim.t) return { ok: false, why: 'abklingzeit' };
      const active = sim.sab.list.filter(s => s.type !== 'doors' && s.src === 'traitor');
      const maxActive = sim.mode.flags.chaos ? 2 : 1;
      if (type !== 'doors' && active.length >= maxActive) return { ok: false, why: 'schon aktiv' };
      if (type === 'crit' && sim.sab.list.some(s => s.crit)) return { ok: false, why: 'schon aktiv' };
      if (type === 'crit' && sim.mode.flags.chaos && sim.ext.phaseN < 2) return { ok: false, why: 'noch nicht möglich' };
      const room = type === 'doors' ? (AMU.U.isInt(a.room) && a.room >= 0 && a.room < sim.map.rooms.length ? a.room : -1) : null;
      if (type === 'doors' && room < 0) return { ok: false, why: 'raum' };
      const s = S.start(sim, type, 'traitor', { room });
      if (!s) return { ok: false, why: 'nicht möglich' };
      sim.sab.cd = sim.t + (type === 'doors' ? 14000 : (sim.mode.flags.chaos ? 22000 : 30000));
      p.st.sabs++;
      AMU.Evidence && AMU.Evidence.onSab && AMU.Evidence.onSab(sim, p, s);
      return { ok: true };
    },
    unstick(sim, d) {
      sim.players.forEach(p => {
        if (!p.alive || p.ghost) return;
        if (sim.grid.hitCircle(p.x, p.y, 0.32)) {
          // auf die nächste freie Zelle außerhalb der Tür schieben
          let best = null, bd = 1e9;
          for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
            const x = Math.floor(p.x) + dx + 0.5, y = Math.floor(p.y) + dy + 0.5;
            if (!sim.grid.hitCircle(x, y, 0.32)) { const dd = dx * dx + dy * dy; if (dd < bd) { bd = dd; best = [x, y]; } }
          }
          if (best) { p.x = best[0]; p.y = best[1]; }
        }
      });
    },
    repairAt(sim, p) {
      if (!p.alive || p.ghost || p.team === 'hunter') return null;
      for (const s of sim.sab.list) {
        if (!s.pts) continue;
        for (let i = 0; i < s.pts.length; i++) {
          const pt = s.pts[i];
          if (pt.done && (!s.window || sim.t - pt.done < S.window(sim, s, pt))) continue;
          if (Math.hypot(p.x - pt.x, p.y - pt.y) <= sim.R.use && sim.grid.los(p.x, p.y, pt.x, pt.y)) return { s, i };
        }
      }
      return null;
    },
    window(sim, s, pt) { return pt.tech ? s.window * 2 : s.window; },
    startRepair(sim, p, rep) {
      const T = TYPES[rep.s.type];
      if (p.team === 'traitor' && !sim.mode.flags.chaos) {   // Verräter tun nur so (kein Fortschritt)
        p.busy = { kind: 'fake', start: sim.t, until: sim.t + 3000 }; return { ok: true, data: { fake: -1, until: 3000 } };
      }
      if (p.team === 'traitor') return { ok: false, why: 'nicht möglich' };
      const tech = p.role === 'tech';
      const seed = (sim.seed + rep.s.id * 97 + rep.i * 13 + sim.t) >>> 0;
      p.busy = { kind: 'repair', sab: rep.s.id, pt: rep.i, t: T.task, seed, diff: tech ? 0 : sim.settings.diff, start: sim.t, until: sim.t + 180000 };
      return { ok: true, data: { task: { repair: rep.s.type, t: T.task, seed, diff: p.busy.diff } } };
    },
    finishRepair(sim, p, b) {
      const s = sim.sab.list.find(x => x.id === b.sab);
      if (!s) return { ok: true, data: { late: true } };
      const pt = s.pts[b.pt]; pt.done = sim.t; pt.tech = p.role === 'tech'; pt.by = p.id;
      p.st.repairs++;
      if (s.pts.every(q => q.done && (!s.window || sim.t - q.done <= S.window(sim, s, q)))) S.fix(sim, s, p);
      else sim.emit('repair_part', { sab: s.type, i: b.pt }, 'all');
      return { ok: true };
    },
    fix(sim, s, by) {
      sim.sab.list = sim.sab.list.filter(x => x !== s);
      sim.emit('fixed', { sab: s.type, by: by ? by.id : null }, 'all');
      AMU.Modes.onFix && AMU.Modes.onFix(sim, s, by);
    },
    tick(sim) {
      for (const s of sim.sab.list.slice()) {
        if (s.type === 'doors' && s.until <= sim.t) {
          s.doors.forEach(id => { sim.grid.closed[id] = 0; });
          sim.sab.list = sim.sab.list.filter(x => x !== s); sim.emit('fixed', { sab: 'doors', room: s.room }, 'all');
        } else if (s.crit && s.until <= sim.t) {
          sim.sab.list = sim.sab.list.filter(x => x !== s);
          if (sim.mode.flags.chaos || sim.settings.critWin) sim.endGame('traitor', 'Sendeausfall nicht behoben');
        } else if (s.window && s.pts) {
          s.pts.forEach(pt => { if (pt.done && sim.t - pt.done > S.window(sim, s, pt) && !s.pts.every(q => q.done)) { pt.done = 0; sim.emit('repair_lost', { sab: s.type }, 'all'); } });
        }
      }
    },
    clearOnMeeting(sim) {
      sim.sab.list.filter(s => s.crit || s.type === 'doors').forEach(s => { if (s.doors) s.doors.forEach(id => { sim.grid.closed[id] = 0; }); });
      sim.sab.list = sim.sab.list.filter(s => !s.crit && s.type !== 'doors');
    },
    publicState(sim, me) {
      return {
        list: sim.sab.list.map(s => ({ type: s.type, room: s.room, left: s.until ? Math.max(0, s.until - sim.t) : 0, pts: s.pts ? s.pts.map(p => ({ x: p.x, y: p.y, done: p.done && (!s.window || sim.t - p.done <= S.window(sim, s, p)) ? 1 : 0 })) : null })),
        cd: me.team === 'traitor' ? Math.max(0, sim.sab.cd - sim.t) : undefined
      };
    }
  };
  AMU.Sabotage = S;
  if (typeof module !== 'undefined' && module.exports) module.exports = S;
})(typeof window !== 'undefined' ? window : globalThis);
