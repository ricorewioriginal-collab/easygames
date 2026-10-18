/* Spinwelten 3D – Runenmaschine: ein Spin wird vollständig ausgewertet und gebucht, BEVOR die Animation startet.
 * Doppelte Auslösung ist ausgeschlossen: Während eine Aktion (Angriff/Raub) offen ist, gibt es keinen neuen Spin;
 * die UI sperrt zusätzlich bis zum Ende der Animation. Im Tutorial sind einzelne Ergebnisse vorbereitet (im Verlauf markiert). */
(function (SW) {
  'use strict';
  const P = SW.Game.prototype;
  const E = () => SW.ECON;
  P.mults = function () {
    return E().multsFor(this.s.islandsDone);
  };
  P.canSpin = function (m) {
    const s = this.s;
    if (s.pending) return 'pending';
    if (!this.mults().includes(m)) return 'mult';
    if (s.energy < m) return 'energy';
    return '';
  };
  function scripted(o) {
    const [type, sym] = o.split(':');
    if (type === 'three') return { outcome: o, ids: [sym, sym, sym] };
    if (type === 'two') { const odd = sym === 'sun' ? 'gear' : 'sun'; return { outcome: o, ids: [sym, odd, sym] }; }
    return { outcome: 'mixed', ids: ['sun', 'gear', 'portal'] };
  }
  P.spin = function (m) {
    m = m || 1;
    const s = this.s, why = this.canSpin(m);
    if (why) return { error: why };
    const wasFull = s.energy >= this.energyMax();
    s.energy -= m;
    if (wasFull && s.energy < this.energyMax()) s.energyT = this.now();
    const q = s.tutorial && s.tutorial.queue;
    const isScript = !!(q && q.length);
    const roll = isScript ? scripted(q.shift()) : E().roll(this.rng);
    const ev = E().evaluate(roll.ids);
    const bonus = this.bonus();
    const r = E().spinReward(ev, s.island, m, s.ngp, bonus);
    const out = { ids: roll.ids, outcome: roll.outcome, rule: ev.rule, sym: ev.sym, m, reward: r, extra: {}, scripted: isScript };
    // Buchen
    if (r.coins) this.addCoins(r.coins, 'spin');
    if (r.xp) s.xp += r.xp;
    if (r.material) s.material = Math.min(99, s.material + r.material);
    if (r.spins) s.energy += r.spins;
    if (r.shield) {
      if (s.shields < this.maxShields()) { s.shields += 1; out.extra.shieldAdded = true; }
      else { const c = this.addCoins(this.base() * 10 * m, 'shieldOverflow'); out.extra.shieldOverflow = c; }
    }
    // Kivi & Co.: Bonusrelikte (Erwartungswert, aber als ganze Relikte mit Zufallsrest)
    let rel = r.relics;
    if (bonus.relics > 0) { const x = bonus.relics * 1.2 * m; rel += Math.floor(x) + (this.rng.next() < x % 1 ? 1 : 0); }
    if (rel) out.extra.relics = this.addRelics(rel);
    if (r.event) { const pts = this.eventAction('portal', r.event); out.extra.event = pts; }
    if (ev.rule !== 'none' && ev.sym) this.eventAction('sym_' + ev.sym, ev.rule === 'three' ? 3 : 1);
    if (r.ticket) s.tickets = Math.min(20, s.tickets + r.ticket);
    if (r.chest) { s.chests[r.chest] = (s.chests[r.chest] || 0) + 1; out.extra.chest = r.chest; }
    if (bonus.chestfind > 0 && !r.chest && this.rng.next() < bonus.chestfind) { s.chests.holz += 1; out.extra.chest = 'holz'; out.extra.found = true; }
    if (r.action) {
      s.pending = { kind: r.action, m, id: SW.rng.uid(10), t: this.now() };
      out.pending = s.pending;
    }
    this.stat('spins');
    this.setMax('max_mult', m);
    if (r.coins >= this.base() * m * 20) { this.stat('bigwins'); out.big = true; }
    if (r.jackpot) { this.stat('jackpots'); out.jackpot = true; }
    this.log({ k: 'spin', ids: roll.ids, m, c: r.coins, a: r.action || '', sc: isScript ? 1 : 0 });
    this.emit('spin', out);
    return out;
  };
})(globalThis.SW = globalThis.SW || {});
