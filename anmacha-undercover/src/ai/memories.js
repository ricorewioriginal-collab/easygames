/* AnMaCha UNDERCOVER 3D – Bot-Gedächtnis: nur was der Bot tatsächlich wahrnehmen konnte (Sicht = sim.canSee mit
   Sichtweite/Sichtlinie, eigene Ereignisse), Verdacht und Vertrauen je Person, gehörte Meeting-Aussagen.
   Schwierigkeit: Wahrnehmungsreichweite, Vergessen, Verwechslungen. */
(function (root) {
  'use strict';
  const AMU = root.AMU = root.AMU || {};
  const KEEP = [45000, 90000, 180000], RANGE = [0.7, 0.9, 1], MIX = [0.08, 0.03, 0];

  function Memory(sim, p) {
    this.sim = sim; this.p = p; this.diff = p.diff;
    this.seen = {};          // shownId → { t, x, y, room }
    this.log = [];           // [{ t, id, room, x, y }] (gedrosselt)
    this.facts = [];         // [{ t, kind: kill|vent|attack|found|scan|cleared|clue, who, room, target, res }]
    this.trail = [];         // eigene Räume [{ t, room }]
    this.sus = {}; this.trust = {};
    this.claims = [];        // gehörte Aussagen
    this.together = {};      // id → ms gemeinsam im selben Raum (für Alibis)
    this.lastLog = {};
    this.rng = sim.rng.fork('mem' + p.seat);
  }
  Memory.prototype = {
    keep() { return KEEP[this.diff] || KEEP[1]; },
    /** Wahrnehmung (alle ~250 ms) */
    perceive(dtMs) {
      const s = this.sim, me = this.p, myRoom = s.roomOf(me);
      if (!this.trail.length || this.trail[this.trail.length - 1].room !== myRoom) { this.trail.push({ t: s.t, room: myRoom }); if (this.trail.length > 40) this.trail.shift(); }
      const range = s.visionOf(me) * (RANGE[this.diff] || 1);
      s.players.forEach(o => {
        if (o === me || !s.alive(o)) return;
        if (!s.canSee(me, o) || Math.hypot(o.x - me.x, o.y - me.y) > range) return;
        // Spurenleser erkennen die echte Person auch hinter einer Verkleidung
        let id = me.role === 'tracker' ? o.id : s.publicPlayer(o).id;
        if (MIX[this.diff] && this.rng.chance(MIX[this.diff] * 0.1)) { const others = s.players.filter(q => q !== me && q !== o); if (others.length) id = this.rng.pick(others).id; }
        const room = s.roomOf(o);
        this.seen[id] = { t: s.t, x: o.x, y: o.y, room };
        if (!this.lastLog[id] || s.t - this.lastLog[id] > 2000) { this.lastLog[id] = s.t; this.log.push({ t: s.t, id, room, x: +o.x.toFixed(1), y: +o.y.toFixed(1), busy: !!o.busy }); }
        if (room === myRoom && room >= 0) this.together[id] = (this.together[id] || 0) + dtMs;
      });
      const old = s.t - this.keep();
      while (this.log.length && this.log[0].t < old) this.log.shift();
      if (this.log.length > 500) this.log.splice(0, 100);
    },
    fact(f) { f.t = f.t || this.sim.t; this.facts.push(f); if (this.facts.length > 80) this.facts.shift(); },
    addSus(id, v) { if (id === this.p.id) return; this.sus[id] = (this.sus[id] || 0) + v; },
    addTrust(id, v) { this.trust[id] = AMU.U.clamp((this.trust[id] || 0) + v, -3, 3); },
    /** Wer war in Raum r im Zeitfenster? (eigene Beobachtungen) */
    seenIn(room, t0, t1) { const out = new Set(); this.log.forEach(e => { if (e.room === room && e.t >= t0 && e.t <= t1) out.add(e.id); }); return out; },
    /** Wo war id zuletzt vor Zeitpunkt t (laut eigener Beobachtung)? */
    whereAt(id, t, tol) { let best = null; this.log.forEach(e => { if (e.id === id && Math.abs(e.t - t) <= (tol || 8000) && (!best || Math.abs(e.t - t) < Math.abs(best.t - t))) best = e; }); return best; },
    myRoomAt(t) { let r = this.trail.length ? this.trail[0].room : -1; this.trail.forEach(e => { if (e.t <= t) r = e.room; }); return r; },
    /** Leiche gefunden/gemeldet: wer war kurz davor in der Nähe? → Verdacht; wer war bei mir weit weg? → Alibi */
    onBody(body, t) {
      const s = this.sim, room = body.room, t0 = t - 30000;
      this.log.forEach(e => {
        if (e.t < t0 || e.t > t || e.id === body.id) return;
        const d = Math.hypot(e.x - body.x, e.y - body.y);
        if (e.room === room || d < 5) this.addSus(e.id, 0.6 * (1 - (t - e.t) / 30000) + 0.2);
      });
      // Alibi: jemand war die ganze Zeit mit mir in einem anderen Raum
      s.players.forEach(o => {
        if (o === this.p) return;
        const seenTimes = this.log.filter(e => e.id === o.id && e.t >= t0 && e.t <= t && e.room !== room && Math.hypot(e.x - body.x, e.y - body.y) > 10);
        if (seenTimes.length >= 6) { this.addSus(o.id, -1.2); this.addTrust(o.id, 0.4); o.id && this.fact({ kind: 'alibi', who: o.id, room: seenTimes[seenTimes.length - 1].room }); }
      });
    },
    /** Zeit mit Person verbracht (für glaubwürdige "war bei mir"-Aussagen) */
    withMe(id) { return this.together[id] || 0; },
    resetTogether() { this.together = {}; }
  };
  AMU.Memory = Memory;
  if (typeof module !== 'undefined' && module.exports) module.exports = Memory;
})(typeof window !== 'undefined' ? window : globalThis);
