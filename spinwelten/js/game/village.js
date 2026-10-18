/* Spinwelten 3D – Bauen, Ausbau, Schaden, Reparatur, Inselabschluss, Neues Spiel+.
 * Jede Insel: 5 Bauwerke × 5 Stufen = 25 Ausbauschritte. Beschädigte Bauwerke müssen repariert werden,
 * bevor sie weiter ausgebaut werden; die Insel gilt erst als fertig, wenn alles auf Stufe 5 und heil ist. */
(function (SW) {
  'use strict';
  const P = SW.Game.prototype;
  const E = () => SW.ECON;
  P.buildCost = function (b, useMat) {
    const s = this.s, st = s.stages[b];
    if (st >= 5) return null;
    const disc = this.bonus().discount + (useMat ? Math.min(3, s.material) * 0.1 : 0);
    return E().buildCost(s.island, b, st, s.profile, s.ngp, disc);
  };
  P.repairCostOf = function (b) { const s = this.s; return E().repairCost(s.island, b, Math.max(1, s.stages[b]), s.profile, s.ngp); };
  P.stepsDone = function () { return this.s.stages.reduce((a, x) => a + x, 0); };
  P.islandComplete = function () { const s = this.s; return !s.ended && s.stages.every(x => x >= 5) && s.damaged.every(x => !x); };
  P.build = function (b, useMat) {
    const s = this.s;
    if (!(b >= 0 && b < 5)) return { error: 'bad' };
    if (s.stages[b] >= 5) return { error: 'max' };
    if (s.damaged[b]) return { error: 'damaged' };
    const cost = this.buildCost(b, useMat);
    if (!this.spend(cost)) return { error: 'coins', cost };
    if (useMat) s.material -= Math.min(3, s.material);
    s.stages[b] += 1;
    const out = { ok: true, b, stage: s.stages[b], cost };
    if (s.stages[b] === 5) {
      const bb = this.bonus().buildbonus;
      if (bb > 0) out.bonus = this.addCoins(cost * bb * 4, 'ferdi');
    }
    this.stat('builds'); this.eventAction('build', 1);
    this.log({ k: 'build', b, st: s.stages[b], c: cost });
    out.complete = this.islandComplete();
    this.emit('build', out);
    return out;
  };
  P.repair = function (b) {
    const s = this.s;
    if (!s.damaged[b]) return { error: 'ok' };
    const cost = this.repairCostOf(b);
    if (!this.spend(cost)) return { error: 'coins', cost };
    s.damaged[b] = false;
    this.stat('repairs'); this.eventAction('repair', 1);
    const out = { ok: true, b, cost, complete: this.islandComplete() };
    this.emit('repair', out);
    return out;
  };
  // Schaden durch einen Sturm (vom Bot oder in Tests): erst "beschädigt", bei erneutem Treffer eine Stufe zurück
  P.damageOwn = function (b) {
    const s = this.s;
    if (s.stages[b] <= 0) return null;
    if (!s.damaged[b]) { s.damaged[b] = true; return 'damaged'; }
    s.stages[b] = Math.max(0, s.stages[b] - 1);
    if (s.stages[b] === 0) s.damaged[b] = false;
    return 'downgraded';
  };
  // Inselabschluss: Belohnung, nächste Insel. Liefert die Belohnung.
  P.completeIsland = function () {
    const s = this.s;
    if (!this.islandComplete()) return { error: 'notdone' };
    const w = s.island, b = this.base(), soli = this.bonus().island;
    const rew = { spins: 20 + w, coins: E().clampInt(b * 60 * (1 + soli)), chest: w % 5 === 0 ? 'gold' : 'silber', relics: 10 + w };
    s.energy += rew.spins;
    this.addCoins(rew.coins, 'island');
    s.chests[rew.chest] = (s.chests[rew.chest] || 0) + 1;
    this.addRelics(rew.relics);
    if (!s.worldsDone.includes(w)) s.worldsDone.push(w);
    s.islandsDone += 1;
    this.stat('islands'); this.eventAction('island', 1);
    this.log({ k: 'island', w });
    const last = w >= 30;
    if (last) { s.ended = true; rew.ending = true; }
    else {
      s.island = w + 1; s.stages = [0, 0, 0, 0, 0]; s.damaged = [false, false, false, false, false];
      if (!s.visited.includes(s.island)) s.visited.push(s.island);
    }
    rew.next = s.island;
    this.emit('island', rew);
    return rew;
  };
  // Neues Spiel+: wieder bei Insel 1, Kosten und Belohnungen ×8; Karten, Begleiter, Erfolge bleiben
  P.newGamePlus = function () {
    const s = this.s; if (!s.ended) return false;
    s.ngp += 1; s.island = 1; s.stages = [0, 0, 0, 0, 0]; s.damaged = [false, false, false, false, false];
    s.worldsDone = []; s.ended = false; s.pending = null;
    this.stat('ngplus');
    this.emit('ngplus', s.ngp);
    return true;
  };
})(globalThis.SW = globalThis.SW || {});
