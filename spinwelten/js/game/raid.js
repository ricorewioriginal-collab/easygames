/* Spinwelten 3D – Schatzexpedition. Sechs Fundstellen, drei Grabungen.
 * Die Anordnung wird beim Start mit dem Zufall gezogen und im Spielstand gespeichert (Neuladen würfelt nichts neu).
 * Beute = Fundwert × Basis × Multiplikator, gedeckelt auf 20 % des Vorrats des Ziels; das Ziel verliert genau diesen Betrag. */
(function (SW) {
  'use strict';
  const P = SW.Game.prototype;
  const E = () => SW.ECON;
  P.raidTargets = function () {
    const s = this.s, r = SW.rng.seeded('rt:' + (s.pending ? s.pending.id : ''));
    const rich = SW.BOTS.map(d => this.botView(d.id)).filter(v => v.coins > 0).sort((a, b) => b.coins - a.coins);
    // die reichsten zwei plus zwei zufällige (so ist nicht immer derselbe dran)
    const pick = rich.slice(0, 2).concat(r.shuffle(rich.slice(2)).slice(0, 2));
    return pick;
  };
  P.raidStart = function (botId) {
    const s = this.s, p = s.pending;
    if (!p || p.kind !== 'raid') return { error: 'nopending' };
    if (p.target && p.target !== botId) return { error: 'started' };
    const bot = s.bots[botId]; if (!bot) return { error: 'target' };
    if (!p.layout) {
      p.target = botId; p.picks = []; p.got = 0; p.rel = 0;
      p.layout = this.rng.shuffle(E().RAID_SPOTS.map((x, i) => i));
      p.cap = E().raidLootCap(bot.coins, s.island, p.m, s.ngp);
    }
    const b = this.bonus(), lvl = (s.comps.mira && (s.active === 'mira' || s.helper === 'mira')) ? s.comps.mira.lvl : 0;
    const hint = lvl >= 3 ? p.layout.findIndex(k => E().RAID_SPOTS[k].kind === 'big') : -1;
    return { ok: true, target: botId, picks: p.picks.slice(), hint, bonus: b.raid };
  };
  P.raidDig = function (i) {
    const s = this.s, p = s.pending;
    if (!p || p.kind !== 'raid' || !p.layout) return { error: 'nopending' };
    if (!(i >= 0 && i < 6) || p.picks.includes(i)) return { error: 'bad' };
    if (p.picks.length >= 3) return { error: 'done' };
    const bot = s.bots[p.target], spot = E().RAID_SPOTS[p.layout[i]];
    p.picks.push(i);
    let coins = E().clampInt(spot.coins * this.base() * p.m * (1 + this.bonus().raid));
    coins = Math.min(coins, Math.max(0, p.cap - p.got), bot.coins);
    bot.coins = E().clampInt(bot.coins - coins);
    p.got += coins;
    if (coins) this.addCoins(coins, 'raid');
    let rel = 0; if (spot.relics) { rel = this.addRelics(spot.relics); p.rel += rel; }
    const out = { ok: true, i, kind: spot.kind, coins, relics: rel, left: 3 - p.picks.length };
    if (p.picks.length >= 3) {
      out.done = true; out.total = p.got; out.layout = p.layout.map(k => E().RAID_SPOTS[k].kind);
      // seltene Bonuskiste: wer beide großen Funde trifft, bekommt eine Holztruhe
      const bigs = p.picks.filter(k => E().RAID_SPOTS[p.layout[k]].kind === 'big').length;
      if (bigs >= 2) { s.chests.holz += 1; out.chest = 'holz'; }
      this.stat('raids'); this.eventAction('raid', 1);
      this.log({ k: 'raid', to: p.target, c: p.got });
      s.pending = null;
      this.emit('raid', out);
    }
    return out;
  };
  // Offene Aktion verfallen lassen (nur wenn der Spieler das ausdrücklich will) – es gibt einen kleinen Trost
  P.skipPending = function () {
    const s = this.s, p = s.pending; if (!p) return null;
    if (p.kind === 'raid' && p.picks && p.picks.length) return { error: 'started' };
    const c = this.addCoins(this.base() * 8 * p.m, 'skip');
    s.pending = null; return { ok: true, coins: c };
  };
})(globalThis.SW = globalThis.SW || {});
