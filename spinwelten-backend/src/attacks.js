/* Angriff (Sturm): Schild des Ziels blockt genau einmal; sonst unbeschädigtes Bauwerk → beschädigt, beschädigtes → Stufe −1 */
'use strict';
const { fail, isInt } = require('./util');

module.exports = function attacks(ctx) {
  const { E } = ctx;
  function attack({ t, me, input, now }) {
    if (!me.pending || me.pending.kind !== 'attack') fail(409, 'no_pending');
    if (!isInt(input.b, 0, 4)) fail(400, 'bad_building');
    const tg = ctx.pvp.resolveTarget(t, me, input, 'attack', now);
    const b = input.b;
    if (tg.stages[b] <= 0) fail(400, 'no_building');
    const mult = me.pending.mult, revenge = !!me.pending.target;
    let result;
    if (tg.shields > 0) { tg.shields -= 1; result = 'blocked'; }
    else if (!tg.damaged[b]) { tg.damaged[b] = true; result = 'damaged'; }
    else { tg.stages[b] = Math.max(0, tg.stages[b] - 1); if (tg.stages[b] === 0) tg.damaged[b] = false; result = 'destroyed'; }
    const coins = ctx.econ.addCoins(me, E.attackReward(me.island, mult, result === 'blocked', 0));
    me.pending = null;
    me.stats.attacks += 1; tg.stats.attacked += 1;
    ctx.pvp.record(t, me, tg, { kind: 'attack', b, result, coins, revenge }, { kind: 'attack', b, result, revenge }, now);
    return { result, b, coins, revenge, target: ctx.pvp.publicTarget(tg) };
  }
  return { attack };
};
