/* Spinwelten 3D – Spielkern: Zustand + Ereignisse + gemeinsame Hilfen. Die Spielregeln liegen in den Nachbardateien
 * (spin.js, village.js, combat.js, bots.js, collectibles.js, companions.js, campaigns.js) und erweitern Game.prototype.
 * Alles hier ist ohne DOM lauffähig (Node-Tests, Simulationen). Münzen ändern sich NUR über addCoins/spend (atomar, nie negativ). */
(function (SW) {
  'use strict';
  const E = () => SW.ECON;
  class Game {
    constructor(state, opts) {
      opts = opts || {};
      this.s = state || SW.Save.fresh({ now: opts.now ? opts.now() : Date.now() });
      this.rng = opts.rng || SW.rng.secure();
      this.now = opts.now || (() => Date.now());
      this.ls = {};
      this.silent = !!opts.silent;
      this.ensureBots();
    }
    on(ev, fn) { (this.ls[ev] = this.ls[ev] || []).push(fn); return () => { this.ls[ev] = this.ls[ev].filter(f => f !== fn); }; }
    emit(ev, data) { const l = this.ls[ev]; if (l) for (const f of l.slice()) { try { f(data); } catch (e) { if (globalThis.console) console.error(e); } } }
    // Aktuelle Welt-Daten
    world(n) { const W = SW.WORLDS || []; return W[(n || this.s.island) - 1] || null; }
    get prof() { return E().PROFILES[this.s.profile] || E().PROFILES.classic; }
    base(w) { return E().base(w || this.s.island, this.s.ngp); }
    chapter(n) { return Math.floor(((n || this.s.island) - 1) / 5); }
    // Münzen
    addCoins(n, why) {
      n = E().clampInt(n); if (!n) return 0;
      this.s.coins = E().add(this.s.coins, n);
      this.stat('coins_earned', n);
      this.emit('coins', { n, why });
      return n;
    }
    spend(n) {
      n = E().clampInt(n);
      const r = E().sub(this.s.coins, n);
      if (r === null) return false;
      this.s.coins = r; this.emit('coins', { n: -n }); return true;
    }
    addRelics(n) { n = Math.max(0, Math.round(n || 0)); if (!n) return 0; this.s.relics = Math.min(9e9, this.s.relics + n); this.eventAction('relic', n); return n; }
    // Zähler (Erfolge, Aufgaben, Tagesziele)
    stat(k, n) {
      if (n === undefined) n = 1;
      const st = this.s.stats; st[k] = E().clampInt((st[k] || 0) + n);
      const d = this.s.daily.prog; d[k] = (d[k] || 0) + n;
      const w = this.s.weekly.prog; w[k] = (w[k] || 0) + n;
      if (this.afterStat) this.afterStat(k);
    }
    setMax(k, v) { const st = this.s.stats; if ((st[k] || 0) < v) { st[k] = v; if (this.afterStat) this.afterStat(k); } }
    log(entry) { entry.t = this.now(); this.s.log.unshift(entry); if (this.s.log.length > 100) this.s.log.length = 100; }
    hist(entry) { entry.t = this.now(); entry.id = SW.rng.uid(8); this.s.history.unshift(entry); if (this.s.history.length > 50) this.s.history.length = 50; this.emit('history', entry); }
    // Zeitabhängiges: Energie, Tageswechsel, Event, Bots
    tick() {
      const now = this.now(), s = this.s, pr = this.prof;
      const regenMs = pr.regenSec * 1000 / (1 + this.bonus().regen);
      const got = SW.Clock.regen(s, now, regenMs, this.energyMax());
      if (got) this.emit('energy', got);
      this.dailyCheck(now);
      this.eventCheck(now);
      if (this.botTick) this.botTick(now);
      s.lastSeen = now;
    }
    energyMax() { return this.prof.energyMax; }
    nextSpinIn() { const regenMs = this.prof.regenSec * 1000 / (1 + this.bonus().regen); return SW.Clock.nextIn(this.s, this.now(), regenMs, this.energyMax()); }
    dailyCheck(now) {
      const s = this.s, dk = SW.Clock.dayKey(now), wk = SW.Clock.weekKey(now);
      if (s.daily.day !== dk) {
        s.daily = { day: dk, bonus: false, prog: {}, claimed: {}, mg: 0 };
        this.stat('days');
        this.emit('newday', dk);
      }
      if (s.weekly.wk !== wk) s.weekly = { wk, prog: {}, claimed: {} };
    }
    // Täglicher Gratis-Bonus (einmal pro Kalendertag; zurückgestellte Uhr bringt nichts, weil der Tag gespeichert ist)
    claimDaily() {
      const s = this.s;
      if (s.daily.bonus) return null;
      if (s.lastDailyT && this.now() < s.lastDailyT) return null;
      s.daily.bonus = true; s.lastDailyT = this.now();
      const n = this.prof.dailySpins;
      s.energy += n;
      const coins = this.addCoins(this.base() * 15, 'daily');
      this.emit('toast', { k: 'dailyGot', n });
      return { spins: n, coins };
    }
  }
  SW.Game = Game;
  SW.newGame = (state, opts) => new Game(state, opts);
})(globalThis.SW = globalThis.SW || {});
