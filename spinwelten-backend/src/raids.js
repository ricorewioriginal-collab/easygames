/* Raub (Kompass): 6 Fundstellen, Anordnung wird erst NACH dem Abschicken serverseitig gemischt.
 * Beute = Summe der 3 gewählten Felder × Basis(Insel des Angreifers) × Multiplikator, gedeckelt durch raidLootCap.
 * Opfer verliert genau den Betrag, den der Angreifer erhält – in einer Transaktion. */
'use strict';
const { fail, isInt } = require('./util');

module.exports = function raids(ctx) {
  const { E, SW } = ctx;
  function raid({ t, me, input, now }) {
    if (!me.pending || me.pending.kind !== 'raid') fail(409, 'no_pending');
    const picks = input.picks;
    if (!Array.isArray(picks) || picks.length !== 3 || !picks.every(i => isInt(i, 0, 5)) || new Set(picks).size !== 3) fail(400, 'bad_picks');
    const tg = ctx.pvp.resolveTarget(t, me, input, 'raid', now);
    const mult = me.pending.mult, b = E.base(me.island, 0);
    const spots = SW.rng.secure().shuffle(E.RAID_SPOTS.map(s => Object.assign({}, s)));
    const raw = E.clampInt(picks.reduce((a, i) => a + spots[i].coins, 0) * b * mult);
    const cap = E.raidLootCap(tg.coins, me.island, mult, 0);
    const loot = Math.max(0, Math.min(raw, cap, tg.coins, E.MAX_COINS - me.coins));
    tg.coins -= loot;
    me.coins += loot; me.lifetimeCoins = E.clampInt(me.lifetimeCoins + loot);
    const relics = E.clampInt(picks.reduce((a, i) => a + (spots[i].relics || 0), 0) * mult);
    if (relics) me.relics = E.clampInt(me.relics + relics);
    me.pending = null;
    me.stats.raids += 1; tg.stats.raided += 1;
    ctx.pvp.record(t, me, tg, { kind: 'raid', coins: loot, capped: loot < raw }, { kind: 'raid', coins: loot }, now);
    return {
      loot, raw, capped: loot < raw, relics, picks: picks.slice(),
      spots: spots.map((s, i) => ({ i, kind: s.kind, coins: E.clampInt(s.coins * b * mult), relics: (s.relics || 0) * mult, picked: picks.includes(i) })),
      target: ctx.pvp.publicTarget(tg)
    };
  }
  return { raid };
};
