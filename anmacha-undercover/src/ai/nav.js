/* AnMaCha UNDERCOVER 3D – Bot-Navigation: A*-Pfad über das Kartenraster (core/grid.js), Wegfolgen über die normale
   Bewegungseingabe (Bots bewegen sich mit denselben Kollisionen wie Menschen), Aufzüge/Geheimgänge als Sprungstellen,
   Stecken-Erkennung und Neuplanung bei geschlossenen Türen. Geister schweben direkt zum Ziel. */
(function (root) {
  'use strict';
  const AMU = root.AMU = root.AMU || {};

  function Nav(sim, p) {
    this.sim = sim; this.p = p; this.path = null; this.goal = null; this.stuckT = 0; this.lastD = 1e9; this.replanAt = 0; this.fails = 0;
  }
  Nav.prototype = {
    /** Ziel setzen; liefert false, wenn unerreichbar (z. B. Türen zu). */
    go(x, y, opt) {
      opt = opt || {};
      const s = this.sim, p = this.p;
      if (this.goal && Math.abs(this.goal[0] - x) < 0.3 && Math.abs(this.goal[1] - y) < 0.3 && this.path && s.t < this.replanAt) return true;
      this.goal = [x, y]; this.opt = opt; this.replanAt = s.t + 4000;
      if (p.ghost) { this.path = [[x, y]]; return true; }
      this.path = s.grid.path(p.x, p.y, x, y, { vents: !!opt.vents && p.team === 'traitor' && s.mode.flags.vents });
      this.stuckT = 0; this.lastD = 1e9;
      if (!this.path) { this.fails++; return false; }
      this.fails = 0; return true;
    },
    stop() { this.path = null; this.goal = null; this.sim.setInput(this.p.id, 0, 0); },
    dist() { return this.goal ? Math.hypot(this.goal[0] - this.p.x, this.goal[1] - this.p.y) : 0; },
    arrived(r) { return !!this.goal && this.dist() <= (r || 0.45); },
    /** Einen Schritt dem Pfad folgen. Liefert 'move' | 'arrived' | 'blocked' | 'idle'. */
    follow(slow) {
      const s = this.sim, p = this.p;
      if (!this.path || !this.goal) { s.setInput(p.id, 0, 0); return 'idle'; }
      if (s.t >= this.replanAt && !p.ghost) { const g = this.goal; this.goal = null; if (!this.go(g[0], g[1], this.opt)) { s.setInput(p.id, 0, 0); return 'blocked'; } }
      let wp = this.path[0];
      while (wp && Math.hypot(wp[0] - p.x, wp[1] - p.y) < 0.35 && !wp[2]) { this.path.shift(); wp = this.path[0]; }
      if (!wp) { s.setInput(p.id, 0, 0); return this.arrived(0.6) ? 'arrived' : 'idle'; }
      if (wp[2] === 'jump') {
        // Sprungstelle: vorher stehen wir am Eingang (Geheimgang oder Aufzug)
        const r = p.team === 'traitor' ? s.act(p.id, { a: 'vent' }) : { ok: false };
        if (!r.ok) s.act(p.id, { a: 'use', what: 'lift' });
        this.path.shift();
        if (Math.hypot(wp[0] - p.x, wp[1] - p.y) > 1.5) { const g = this.goal; this.goal = null; this.go(g[0], g[1], this.opt); }
        return 'move';
      }
      const dx = wp[0] - p.x, dy = wp[1] - p.y, d = Math.hypot(dx, dy);
      const sp = slow ? 0.55 : 1;
      s.setInput(p.id, dx / d * sp, dy / d * sp);
      // Stecken? (kein Fortschritt zum Wegpunkt)
      if (d < this.lastD - 0.05) { this.lastD = d; this.stuckT = 0; } else { this.stuckT += s.STEP; }
      if (this.stuckT > 1500) {
        this.stuckT = 0; this.lastD = 1e9;
        const g = this.goal; this.goal = null;
        if (!this.go(g[0], g[1], this.opt)) return 'blocked';
      }
      if (this.path.length === 1 && d < 0.4) return 'arrived';
      return 'move';
    }
  };
  AMU.Nav = Nav;
  if (typeof module !== 'undefined' && module.exports) module.exports = Nav;
})(typeof window !== 'undefined' ? window : globalThis);
