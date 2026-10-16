// Item effects and inventory bookkeeping. Every item listed in data/items.js
// has an effect implemented here (balls and battle boosts are resolved by the
// battle engine, which calls back into this module for healing items).
import { ITEMS, sellPrice, shopStock } from '../data/items.js';
import { SPECIES } from '../data/species.js';
import { maxHp, maxPP, evolutionTarget, evolve, levelUp, MAX_LEVEL } from './monster.js';

export function count(bag, id) { return Math.max(0, bag[id] | 0); }
export function add(bag, id, n = 1) {
  if (!ITEMS[id]) throw new Error('Unknown item ' + id);
  bag[id] = Math.min(999, count(bag, id) + n);
  return bag[id];
}
export function remove(bag, id, n = 1) {
  if (count(bag, id) < n) return false;
  bag[id] = count(bag, id) - n;
  if (bag[id] <= 0) delete bag[id];
  return true;
}

// Which items can be used on a monster from the field/bag menu.
export function usableOutside(id) {
  const it = ITEMS[id];
  return !!it && ['heal', 'status', 'evo', 'growth'].includes(it.category) && id !== 'sternsplitter';
}
export function usableInBattle(id) {
  const it = ITEMS[id];
  return !!it && ['heal', 'status', 'battle', 'ball'].includes(it.category);
}

// Applies a healing/status/pp/evolution item. Does NOT consume it; caller
// removes from bag when result.ok. Returns { ok, text, evolveTo? }.
export function applyItem(id, m, { inBattle = false } = {}) {
  const it = ITEMS[id], name = SPECIES[m.id].name;
  if (!it) return { ok: false, text: 'Unbekannter Gegenstand.' };
  if (it.revive) {
    if (m.hp > 0) return { ok: false, text: name + ' ist nicht erschöpft.' };
    m.hp = Math.max(1, Math.floor(maxHp(m) * it.revive));
    m.status = null;
    return { ok: true, text: name + ' ist wieder bei Kräften!' };
  }
  if (it.category === 'heal' && it.heal) {
    if (m.hp <= 0) return { ok: false, text: name + ' ist erschöpft und braucht ein Belebungskraut.' };
    if (m.hp >= maxHp(m)) return { ok: false, text: name + ' hat bereits volle KP.' };
    const before = m.hp;
    m.hp = Math.min(maxHp(m), m.hp + it.heal);
    return { ok: true, text: name + ' erhält ' + (m.hp - before) + ' KP.', healed: m.hp - before };
  }
  if (it.category === 'heal' && it.pp) {
    if (m.moves.every(mv => mv.pp >= maxPP(mv.id))) return { ok: false, text: 'Alle Attacken sind bereits voll.' };
    for (const mv of m.moves) mv.pp = Math.min(maxPP(mv.id), mv.pp + it.pp);
    return { ok: true, text: 'Die AP von ' + name + ' wurden aufgefüllt.' };
  }
  if (it.category === 'status') {
    if (!m.status) return { ok: false, text: name + ' hat keine Statusveränderung.' };
    if (m.hp <= 0) return { ok: false, text: name + ' ist erschöpft.' };
    m.status = null; m.statusTurns = 0;
    return { ok: true, text: name + ' ist wieder gesund.' };
  }
  if (it.category === 'evo') {
    if (inBattle) return { ok: false, text: 'Das geht im Kampf nicht.' };
    const to = evolutionTarget(m, { item: id });
    if (!to) return { ok: false, text: 'Bei ' + name + ' zeigt das keine Wirkung.' };
    return { ok: true, text: name + ' reagiert auf ' + it.name + '!', evolveTo: to };
  }
  if (it.category === 'growth') {
    if (inBattle) return { ok: false, text: 'Das geht im Kampf nicht.' };
    if (m.lv >= MAX_LEVEL) return { ok: false, text: name + ' hat bereits das Höchstlevel erreicht.' };
    return { ok: true, text: name + ' nascht das ' + it.name + '.', growth: true };
  }
  if (it.category === 'battle') {
    if (!inBattle) return { ok: false, text: 'Kann nur im Kampf eingesetzt werden.' };
    return { ok: true, text: '', boost: { stat: it.stat, stages: it.stages } };
  }
  return { ok: false, text: 'Das kann hier nicht benutzt werden.' };
}

// Field use: applies, consumes and performs evolution. Returns result.
export function useFromBag(bag, id, m) {
  if (count(bag, id) <= 0) return { ok: false, text: 'Nicht mehr vorrätig.' };
  if (!usableOutside(id)) return { ok: false, text: 'Kann hier nicht eingesetzt werden.' };
  const res = applyItem(id, m);
  if (res.ok) {
    remove(bag, id);
    if (res.growth) res.events = levelUp(m);
    if (res.evolveTo) { const from = m.id; const { offers } = evolve(m, res.evolveTo); res.evolved = { from, to: res.evolveTo, offers }; }
  }
  return res;
}

export function buy(state, id, qty = 1) {
  const it = ITEMS[id];
  if (!it || !it.price || it.sellOnly) return { ok: false, text: 'Nicht im Sortiment.' };
  if (!shopStock(state.badges).includes(id)) return { ok: false, text: 'Erst mit mehr Orden erhältlich.' };
  qty = Math.max(1, Math.min(99, qty | 0));
  const cost = it.price * qty;
  if (state.coins < cost) return { ok: false, text: 'Nicht genug Sternmünzen.' };
  state.coins -= cost;
  add(state.bag, id, qty);
  let bonus = 0;
  if (id === 'taschiball' && qty >= 10) { bonus = Math.floor(qty / 10); add(state.bag, 'taschiball', bonus); }
  return { ok: true, cost, bonus, text: qty + '× ' + it.name + ' gekauft' + (bonus ? ' (+' + bonus + ' Bonus)' : '') + '.' };
}

export function sell(state, id, qty = 1) {
  const price = sellPrice(id);
  if (!price) return { ok: false, text: 'Das kann nicht verkauft werden.' };
  qty = Math.max(1, qty | 0);
  if (count(state.bag, id) < qty) return { ok: false, text: 'Nicht genug davon.' };
  remove(state.bag, id, qty);
  state.coins = Math.min(9999999, state.coins + price * qty);
  return { ok: true, gain: price * qty, text: qty + '× ' + ITEMS[id].name + ' für ★' + price * qty + ' verkauft.' };
}

// Catch multiplier of a ball. ctx: { foe, turn, night, dark, ownLevel }.
// Special balls only shine in their situation, so the choice of ball matters.
export function ballRate(id, ctx = {}) {
  const it = ITEMS[id];
  if (!it || it.category !== 'ball') return 0;
  let r = it.rate;
  const foe = ctx.foe ? SPECIES[ctx.foe.id] : null;
  if (it.bonusTypes && foe && (it.bonusTypes.includes(foe.type) || it.bonusTypes.includes(foe.type2))) r *= it.bonus;
  if (it.firstTurn) r = (ctx.turn || 1) <= 1 ? it.firstTurn : 0.5;
  if (it.dark && (ctx.night || ctx.dark)) r *= it.dark;
  if (it.timer) r = Math.min(4, 1 + Math.max(0, (ctx.turn || 1) - 1) * 0.3);
  if (it.levelBased && ctx.foe && ctx.ownLevel) r = ctx.ownLevel >= ctx.foe.lv * 2 ? 4 : ctx.ownLevel > ctx.foe.lv ? 2 : 1;
  return r;
}
