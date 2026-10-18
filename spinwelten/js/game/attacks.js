/* Spinwelten 3D – Sturmangriff (freundschaftlich) auf eine Bot-Insel und Zurückschlagen.
 * Ablauf: 3× Sturmkern -> pending {kind:'attack'} -> Ziel wählen -> Bauwerk wählen -> bestätigen -> attack().
 * Schutzorb des Ziels blockt genau einen Angriff. Treffer: Bauwerk beschädigt, bei erneutem Treffer eine Stufe zurück.
 * Abbrechen ist möglich (pending bleibt erhalten, bis ein Ziel bestätigt wurde). */
(function (SW) {
  'use strict';
  const P = SW.Game.prototype;
  const E = () => SW.ECON;
  // Mögliche Ziele: Rache-Ziele zuerst, dann eine zufällige, aber stabile Auswahl
  P.attackTargets = function () {
    const s = this.s, now = this.now();
    const revenge = s.history.filter(h => h.bot && h.by && !h.revenged && now - h.t < 48 * 3600000).map(h => h.by);
    const ids = SW.BOTS.map(d => d.id);
    const r = SW.rng.seeded('tg:' + (s.pending ? s.pending.id : ''));
    const rest = r.shuffle(ids.filter(i => !revenge.includes(i))).slice(0, 4);
    const uniq = Array.from(new Set(revenge)).slice(0, 2);
    return uniq.concat(rest).map(id => Object.assign(this.botView(id), { revenge: uniq.includes(id) }));
  };
  P.attack = function (botId, b) {
    const s = this.s, p = s.pending;
    if (!p || p.kind !== 'attack') return { error: 'nopending' };
    const bot = s.bots[botId]; if (!bot) return { error: 'target' };
    if (!(b >= 0 && b < 5)) return { error: 'bad' };
    const built = bot.stages.map((x, i) => (x > 0 ? i : -1)).filter(i => i >= 0);
    if (!built.length) b = -1; else if (bot.stages[b] <= 0) return { error: 'empty' };
    const bonus = this.bonus();
    let blocked = false, res = 'miss';
    if (b >= 0 && bot.shields > 0) { bot.shields -= 1; blocked = true; res = 'blocked'; }
    else if (b >= 0) {
      if (!bot.damaged[b]) { bot.damaged[b] = true; res = 'damaged'; }
      else { bot.stages[b] = Math.max(0, bot.stages[b] - 1); res = 'downgraded'; if (bot.stages[b] === 0) bot.damaged[b] = false; }
    }
    const coins = E().clampInt(E().attackReward(s.island, p.m, blocked || res === 'miss', s.ngp) * (1 + bonus.storm));
    this.addCoins(coins, 'attack');
    s.pending = null;
    bot.grudge = Math.min(3, (bot.grudge || 0) + 1);   // Bot erinnert sich und schlägt eher zurück
    const rev = s.history.find(h => h.bot && h.by === botId && !h.revenged);
    if (rev) { rev.revenged = true; this.stat('revenges'); }
    this.stat('attacks'); this.eventAction('attack', 1);
    this.log({ k: 'attack', to: botId, b, res, c: coins });
    const out = { ok: true, target: botId, b, res, blocked, coins, revenge: !!rev };
    this.emit('attack', out);
    return out;
  };
})(globalThis.SW = globalThis.SW || {});
