/* AnMaCha UNDERCOVER 3D – Siegbedingungen je Modus und Rollenfähigkeiten (Prüfung im Spielkern). */
(function (root) {
  'use strict';
  const AMU = root.AMU = root.AMU || {};

  const Rules = {
    /** Prüft Sieg/Niederlage. Liefert true, wenn die Partie damit endet. */
    check(sim) {
      if (sim.phase === 'end') return true;
      if (sim.phase === 'intro') return false;
      const f = sim.mode.flags, P = sim.players;
      if (f.hunt) return AMU.Modes.huntCheck(sim);
      if (sim.ext.trickWin && sim.phase !== 'meeting') { sim.endGame('neutral', 'Der Trickser wurde rausgewählt – genau sein Plan', [sim.ext.trickWin]); return true; }
      const alive = P.filter(p => sim.alive(p));
      const tr = alive.filter(p => p.team === 'traitor').length, others = alive.length - tr;
      if (tr === 0) { sim.endGame('crew', 'Alle Verräter wurden enttarnt'); return true; }
      if (f.chaos) {
        if (sim.ext.quality <= 0) { sim.endGame('traitor', 'Die Sendequalität ist auf null gefallen'); return true; }
        if (sim.ext.timeEnd && sim.t >= sim.ext.timeEnd && sim.phase === 'play') { sim.endGame('crew', 'Die Sendung lief bis zum Sendeschluss'); return true; }
        if (tr >= others) { sim.endGame('traitor', 'Die Verräter sind in der Überzahl'); return true; }
        return false;
      }
      if (tr >= others && sim.phase !== 'meeting') { sim.endGame('traitor', 'Die Verräter haben Gleichstand erreicht'); return true; }
      if (f.tasks && !f.evidence && sim.taskTotal > 0 && sim.taskDone >= sim.taskTotal) { sim.endGame('crew', 'Alle Aufgaben sind erledigt'); return true; }
      if (f.evidence && sim.ext.timeEnd && sim.t >= sim.ext.timeEnd && sim.phase === 'play') { sim.endGame('traitor', 'Sendeschluss – die Verräter blieben unentdeckt'); return true; }
      return false;
    }
  };

  // ---------- Fähigkeiten (Rollen-Chaos, Ermittler) ----------
  const fail = why => ({ ok: false, why });
  const Abilities = {
    use(sim, p, a) {
      const R = AMU.ROLES[p.role];
      if (!sim.alive(p)) return fail('ausgeschieden');
      if (!R || !R.abil) return fail('keine Fähigkeit');
      if ((p.cd.abil || 0) > sim.t) return fail('abklingzeit');
      const fn = Abilities[R.abil]; if (!fn) return fail('keine Fähigkeit');
      const r = fn(sim, p, a, R);
      if (r.ok && !r.noCd) p.cd.abil = sim.t + R.cd * 1000;
      if (r.ok) p.st.abil = (p.st.abil || 0) + 1;
      return r;
    },
    target(sim, p, a, range) {
      const t = sim.byId(a.target);
      if (!t || t === p || !sim.alive(t)) return null;
      if (range && (Math.hypot(t.x - p.x, t.y - p.y) > range || !sim.grid.los(p.x, p.y, t.x, t.y) || t.hidden > sim.t)) return null;
      return t;
    },
    scan(sim, p, a, R) {
      if (sim.mode.flags.evidence) return fail('Im Detektiv-Modus untersuchst du Spuren');
      p.scans = p.scans == null ? R.uses : p.scans;
      if (p.scans <= 0) return fail('keine Prüfungen mehr');
      const t = Abilities.target(sim, p, a, sim.R.ability); if (!t) return fail('ziel');
      p.scans--;
      const res = t.team === 'traitor' ? 'verdächtig' : t.team === 'neutral' ? 'unklar' : 'unauffällig';
      sim.emit('scan', { target: t.id, res, left: p.scans }, p.id);
      return { ok: true, data: { res } };
    },
    shield(sim, p, a, R) {
      const t = Abilities.target(sim, p, a, sim.R.shield); if (!t) return fail('ziel');
      t.shieldUntil = sim.t + R.dur * 1000;
      sim.emit('shielded', { target: t.id }, p.id);
      return { ok: true };
    },
    courier(sim, p, a) {
      if (!p.pkg) {
        const st = sim.map.stations.find(s => (s.t === 'paket' || s.t === 'akkus') && Math.hypot(s.at[0] - p.x, s.at[1] - p.y) <= sim.R.use);
        const any = st || sim.map.stations.find(s => Math.hypot(s.at[0] - p.x, s.at[1] - p.y) <= sim.R.use);
        if (!any) return fail('Paketstation nötig');
        p.busy = { kind: 'pickup', start: sim.t, until: sim.t + 2000, auto: true };
        return { ok: true, noCd: true, data: { pickup: 1 } };
      }
      if (Math.hypot(sim.map.button[0] - p.x, sim.map.button[1] - p.y) > sim.R.button + 0.6) return fail('Bring das Paket zum Notrufpult');
      const pool = sim.players.filter(o => o !== p && sim.alive(o) && o.team === 'crew');
      if (!pool.length) return fail('niemand');
      const t = pool[sim.rng.int(pool.length)];
      p.pkg = false;
      sim.ext.cleared = (sim.ext.cleared || []).concat([t.id]);
      sim.emit('funkspruch', { id: t.id }, 'all');
      return { ok: true };
    },
    shift(sim, p, a, R) {
      const t = Abilities.target(sim, p, a, 0); if (!t) return fail('ziel');
      p.disguise = { as: t.id, until: sim.t + R.dur * 1000 };
      sim.emit('shifted', { as: t.id, dur: R.dur * 1000 }, p.id);
      return { ok: true };
    },
    jam(sim, p, a, R) {
      let n = 0;
      sim.players.forEach(o => {
        if (o === p || !sim.alive(o) || o.team === 'traitor' || o.role === 'tech') return;
        if (Math.hypot(o.x - p.x, o.y - p.y) <= 7) { o.jamUntil = sim.t + R.dur * 1000; if (o.busy && o.busy.kind === 'task') o.busy = null; sim.emit('jammed', { dur: R.dur * 1000 }, o.id); n++; }
      });
      sim.emit('jam_done', { n }, p.id);
      return { ok: true, data: { n } };
    }
  };

  AMU.Rules = Rules; AMU.Abilities = Abilities;
  if (typeof module !== 'undefined' && module.exports) module.exports = { Rules, Abilities };
})(typeof window !== 'undefined' ? window : globalThis);
