/* Spinwelten 3D – Begleiter: Freischalten, Aktiv/Helfer, Training, Pflege, Boni. */
(function (SW) {
  'use strict';
  const P = SW.Game.prototype;
  const def = id => (SW.COMPANIONS || []).find(c => c.id === id);
  // Summe der Boni: aktiver Begleiter volle Wirkung, Helfer halbe Wirkung
  P.bonus = function () {
    const s = this.s, b = { relics: 0, crystal: 0, raid: 0, guard: 0, storm: 0, discount: 0, cards: 0, buildbonus: 0, regen: 0, chestfind: 0, event: 0, island: 0, shieldSlots: 0, coins: 0 };
    const addC = (id, f) => {
      const d = def(id), c = s.comps[id]; if (!d || !c) return;
      b[d.effect] += d.per * c.lvl * f;
      if (d.effect === 'guard') b.shieldSlots = 1;
    };
    addC(s.active, 1);
    if (s.helper && s.helper !== s.active) addC(s.helper, 0.5);
    b.discount = Math.min(0.3, b.discount);
    b.chestfind = Math.min(0.1, b.chestfind);
    b.guard = Math.min(0.35, b.guard);
    return b;
  };
  P.maxShields = function () { return 3 + this.bonus().shieldSlots; };
  // Prüft Freischaltungen (nach jedem Zähler-Update)
  P.checkCompanions = function () {
    const s = this.s; let any = false;
    for (const d of SW.COMPANIONS || []) {
      if (s.comps[d.id] || !d.unlock) continue;
      if ((s.stats[d.unlock.stat] || 0) >= d.unlock.n) {
        s.comps[d.id] = { lvl: 1, xp: 0, care: '' };
        any = true; this.stat('companions');
        this.emit('companion', { id: d.id });
      }
    }
    return any;
  };
  P.setActive = function (id) {
    const s = this.s; if (!s.comps[id]) return false;
    if (s.helper === id) s.helper = s.active;
    s.active = id; return true;
  };
  P.setHelper = function (id) {
    const s = this.s; if (id && (!s.comps[id] || id === s.active)) return false;
    s.helper = id || ''; return true;
  };
  P.xpNeed = lvl => 60 + lvl * 60;
  P.trainCost = function (id) {
    const c = this.s.comps[id]; if (!c) return null;
    return { snacks: 1, relics: 4 * c.lvl, coins: this.base() * 4 * c.lvl };
  };
  // Training: 1 Funkelsnack ODER Relikte+Münzen (wählbar), +45 XP
  P.train = function (id, withSnack) {
    const s = this.s, c = s.comps[id]; if (!c) return { error: 'locked' };
    if (c.lvl >= SW.COMP_MAX_LVL) return { error: 'max' };
    const cost = this.trainCost(id);
    if (withSnack) { if (s.snacks < 1) return { error: 'snacks' }; s.snacks -= 1; }
    else {
      if (s.relics < cost.relics) return { error: 'relics' };
      if (s.coins < cost.coins) return { error: 'coins' };
      s.relics -= cost.relics; this.spend(cost.coins);
    }
    const up = this.compXp(id, 45);
    this.stat('trains'); this.eventAction('train', 1);
    return { ok: true, up };
  };
  P.compXp = function (id, n) {
    const c = this.s.comps[id]; if (!c || c.lvl >= SW.COMP_MAX_LVL) return false;
    c.xp += n; let up = false;
    while (c.lvl < SW.COMP_MAX_LVL && c.xp >= this.xpNeed(c.lvl)) { c.xp -= this.xpNeed(c.lvl); c.lvl++; up = true; }
    if (c.lvl >= SW.COMP_MAX_LVL) c.xp = 0;
    if (up) { this.setMax('comp_lvl', c.lvl); this.emit('complevel', { id, lvl: c.lvl }); }
    return up;
  };
  // Pflege: einmal pro Tag je Begleiter
  P.care = function (id) {
    const s = this.s, c = s.comps[id]; if (!c) return { error: 'locked' };
    const dk = SW.Clock.dayKey(this.now());
    if (c.care === dk) return { error: 'done' };
    c.care = dk; const up = this.compXp(id, 15); this.eventAction('care', 1);
    return { ok: true, up };
  };
})(globalThis.SW = globalThis.SW || {});
