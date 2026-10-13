// Opponent AI. Levels: 0 = wild (random), 1 = trainer (prefers effective
// moves), 2 = arena/guild (status, buffs, items, switching), 3 = champion /
// league (KO-aware, predicts threats, conserves strong moves).
import { SPECIES } from '../data/species.js';
import { MOVES } from '../data/moves.js';
import { effectiveness } from '../data/types.js';
import { ITEMS } from '../data/items.js';
import { maxHp, statOf } from './monster.js';

function usable(m) { return m.moves.filter(x => x.pp > 0); }

function expectedDamage(user, target, moveId) {
  const mv = MOVES[moveId];
  if (!mv || mv.power <= 0) return 0;
  const st = SPECIES[user.id];
  const stab = (mv.type === st.type || mv.type === st.type2) ? 1.5 : 1;
  const eff = effectiveness(mv.type, SPECIES[target.id]);
  const A = statOf(user, 'atk'), D = statOf(target, 'def');
  return (((2 * user.lv / 5 + 2) * mv.power * A / D) / 50 + 2) * stab * eff * mv.acc;
}

function foesOf(b, side) {
  const o = 1 - side;
  return b.sides[o].active.map((i, slot) => ({ slot, m: i === null ? null : b.sides[o].team[i] })).filter(x => x.m && x.m.hp > 0);
}

export function chooseAction(b, side, slot, rng) {
  const s = b.sides[side];
  const me = s.team[s.active[slot]];
  const level = s.ai ?? 1;
  const foes = foesOf(b, side);
  const moves = usable(me);
  if (!moves.length) return { type: 'move', move: 'verzweiflung', target: foes[0]?.slot };
  if (level <= 0 || !foes.length) {
    const mv = moves[Math.floor(rng.next() * moves.length)];
    return { type: 'move', move: mv.id, target: foes.length ? foes[Math.floor(rng.next() * foes.length)].slot : 0 };
  }
  const hpFrac = me.hp / maxHp(me);

  // Healing items (level 2+), max two per battle
  if (level >= 2 && hpFrac < 0.3 && (s.itemsUsed || 0) < 2) {
    const heal = ['vitaltrank', 'supertrank', 'trank'].find(id => (s.items[id] | 0) > 0);
    if (heal && rng.next() < 0.75) { s.itemsUsed = (s.itemsUsed || 0) + 1; return { type: 'item', item: heal, target: me.uid }; }
  }

  // Switching when badly matched (level 2+)
  if (level >= 2 && b.format === 1) {
    const threat = Math.max(...foes.flatMap(f => f.m.moves.map(x => expectedDamage(f.m, me, x.id))), 0);
    if (threat >= me.hp * 0.9 && hpFrac > 0.35 && (s.switches || 0) < 2) {
      const best = bestSwitch(b, side, foes);
      if (best !== null && rng.next() < (level >= 3 ? 0.7 : 0.4)) { s.switches = (s.switches || 0) + 1; return { type: 'switch', to: best }; }
    }
  }

  // Score moves
  let bestScore = -1, choice = null;
  for (const mv of moves) {
    const data = MOVES[mv.id];
    for (const f of foes) {
      let score;
      if (data.power > 0) {
        const dmg = expectedDamage(me, f.m, mv.id);
        score = dmg;
        if (level >= 3 && dmg >= f.m.hp) score += 400; // secure KO
        if (level >= 3 && data.pp <= 10 && dmg < f.m.hp * 0.4) score *= 0.7; // save strong moves
      } else {
        score = 0;
        const turnsIn = b.vol[me.uid]?.turnsIn || 0;
        if (data.heal && data.target === 'self') score = hpFrac < 0.45 ? 140 : 0;
        else if (data.status && data.target === 'foe') score = f.m.status ? 0 : (level >= 2 ? 70 : 30) * data.acc;
        else if (data.stat && data.target === 'self') score = (b.vol[me.uid]?.[data.stat] || 0) < 2 && turnsIn < 2 && hpFrac > 0.6 ? (level >= 2 ? 65 : 20) : 0;
        else if (data.stat && data.target === 'foe') score = turnsIn < 2 ? 35 : 5;
      }
      score *= 0.85 + rng.next() * (level >= 3 ? 0.2 : 0.4);
      if (score > bestScore) { bestScore = score; choice = { type: 'move', move: mv.id, target: f.slot }; }
    }
  }
  return choice || { type: 'move', move: moves[0].id, target: foes[0].slot };
}

function bestSwitch(b, side, foes) {
  const s = b.sides[side];
  let best = null, bestVal = 0;
  s.team.forEach((m, i) => {
    if (m.hp <= 0 || s.active.includes(i)) return;
    const incoming = Math.max(...foes.flatMap(f => f.m.moves.map(x => expectedDamage(f.m, m, x.id))), 1);
    const outgoing = Math.max(...foes.flatMap(f => m.moves.map(x => expectedDamage(m, f.m, x.id))), 0);
    const val = outgoing / incoming * (m.hp / maxHp(m));
    if (val > bestVal) { bestVal = val; best = i; }
  });
  return bestVal > 1.2 ? best : null;
}

// Pick a replacement after a faint: the healthy monster with the best matchup.
export function chooseReplacement(b, side, rng) {
  const s = b.sides[side];
  const foes = foesOf(b, side);
  let best = null, bestVal = -1;
  s.team.forEach((m, i) => {
    if (m.hp <= 0 || s.active.includes(i)) return;
    let val = rng.next() * 0.1;
    if (s.ai >= 1) val += Math.max(0, ...foes.flatMap(f => m.moves.map(x => expectedDamage(m, f.m, x.id)))) / 100 + m.hp / maxHp(m);
    if (val > bestVal) { bestVal = val; best = i; }
  });
  return best;
}

export { ITEMS };
