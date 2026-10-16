// Monster instances: creation, stats, experience, learning, evolution.
// Pure logic – no DOM, no Three.js – so it runs in Node tests and the browser.
import { SPECIES, learnset, movesAtLevel } from '../data/species.js';
import { MOVES } from '../data/moves.js';

export const MAX_LEVEL = 70;
export const TEAM_SIZE = 6;

let uidCounter = 0;
export function newUid(rng) {
  uidCounter = (uidCounter + 1) % 1e6;
  const r = rng ? Math.floor(rng.next() * 1e9) : Math.floor(Math.random() * 1e9);
  return 't' + Date.now().toString(36) + uidCounter.toString(36) + r.toString(36);
}

export function species(m) { return SPECIES[m.id]; }

// Classic-style stat curve with a small per-instance potential (0..15).
export function statOf(m, stat) {
  const s = SPECIES[m.id];
  const base = s[stat === 'hp' ? 'hp' : stat];
  const iv = (m.iv && m.iv[stat]) || 0;
  if (stat === 'hp') return Math.floor((2 * base + iv) * m.lv / 100) + m.lv + 10;
  return Math.floor((2 * base + iv) * m.lv / 100) + 5;
}
export const maxHp = (m) => statOf(m, 'hp');

// Experience needed to go from level n to n+1.
export function xpToNext(lv) { return Math.floor(0.8 * (3 * lv * lv + 3 * lv + 1)) + 10; }

export function baseExp(id) {
  const s = SPECIES[id];
  const total = s.hp + s.atk + s.def + s.speed;
  return Math.round(total / 4.2) + (s.ancient ? 60 : 0);
}

// EP for defeating `foe`; trainer battles grant 50% more. With `level` (the
// receiving Taschi's level) the reward scales like the classic games: weaker
// Taschis catch up faster, overlevelled ones gain less. Close friends (high
// friendship) learn 20% faster.
export function xpReward(foe, { trainer = false, level = null, friendship = 0 } = {}) {
  let xp = baseExp(foe.id) * foe.lv / 5 * (trainer ? 1.5 : 1);
  if (level) xp *= Math.pow((2 * foe.lv + 10) / (foe.lv + level + 10), 2.5);
  if (friendship >= 150) xp *= 1.2;
  return Math.max(1, Math.floor(xp));
}

export function maxPP(moveId) { return MOVES[moveId]?.pp ?? 20; }

export function makeMonster(id, lv, rng, extra = {}) {
  if (!SPECIES[id]) throw new Error('Unknown species ' + id);
  lv = Math.max(1, Math.min(MAX_LEVEL, Math.round(lv)));
  const roll = () => rng ? rng.int(0, 15) : Math.floor(Math.random() * 16);
  const m = {
    uid: newUid(rng), id, lv, xp: 0, hp: 1,
    iv: { hp: roll(), atk: roll(), def: roll(), speed: roll() },
    moves: movesAtLevel(id, lv).map(mid => ({ id: mid, pp: maxPP(mid) })),
    status: null, friendship: 70, ...extra
  };
  m.hp = maxHp(m);
  return m;
}

export function healMonster(m) {
  m.hp = maxHp(m);
  m.status = null;
  for (const mv of m.moves) mv.pp = maxPP(mv.id);
  return m;
}

export function isFainted(m) { return m.hp <= 0; }
export function firstHealthy(team) { return team.find(m => m.hp > 0) || null; }

// Adds EP; returns events: levelup, learn, learnFull, evolve (pending).
export function gainXp(m, amount, ctx = {}) {
  const events = [];
  if (m.lv >= MAX_LEVEL) return events;
  m.xp += amount;
  while (m.lv < MAX_LEVEL && m.xp >= xpToNext(m.lv)) {
    m.xp -= xpToNext(m.lv);
    const oldMax = maxHp(m), before = { atk: statOf(m, 'atk'), def: statOf(m, 'def'), speed: statOf(m, 'speed') };
    m.lv++;
    m.friendship = Math.min(255, (m.friendship ?? 70) + 2);
    if (m.hp > 0) m.hp = Math.min(maxHp(m), m.hp + (maxHp(m) - oldMax));
    const gains = { hp: maxHp(m) - oldMax, atk: statOf(m, 'atk') - before.atk, def: statOf(m, 'def') - before.def, speed: statOf(m, 'speed') - before.speed };
    events.push({ type: 'levelup', uid: m.uid, level: m.lv, gains });
    for (const [lv, moveId] of learnset(m.id)) {
      if (lv !== m.lv || m.moves.some(x => x.id === moveId)) continue;
      if (m.moves.length < 4) { m.moves.push({ id: moveId, pp: maxPP(moveId) }); events.push({ type: 'learn', uid: m.uid, move: moveId }); }
      else events.push({ type: 'learnFull', uid: m.uid, move: moveId });
    }
  }
  if (m.lv >= MAX_LEVEL) m.xp = 0;
  const evo = evolutionTarget(m, ctx);
  if (evo) events.push({ type: 'evolve', uid: m.uid, to: evo });
  return events;
}

// Determines whether the monster may evolve now (level or night rule).
export function evolutionTarget(m, { night = false, item = null } = {}) {
  const evo = SPECIES[m.id]?.evo;
  if (!evo) return null;
  if (evo.item) return item === evo.item ? evo.to : null;
  if (evo.level && m.lv < evo.level) return null;
  if (evo.night && !night) return null;
  return evo.level ? evo.to : null;
}

// Evolves `m` into `to`. The new form may bring moves its old form never had
// (e.g. a second type): the newest of them is learned right away if a slot is
// free, otherwise returned in `offers` so the UI can ask which move to forget.
export function evolve(m, to) {
  const before = maxHp(m), from = m.id;
  m.id = to;
  m.hp = Math.max(1, Math.min(maxHp(m), m.hp + (maxHp(m) - before)));
  m.friendship = Math.min(255, (m.friendship ?? 70) + 10);
  const oldSet = new Set(learnset(from).map(([, id]) => id));
  const fresh = learnset(to).filter(([lv, id]) => lv <= m.lv && !oldSet.has(id) && !m.moves.some(x => x.id === id)).map(([, id]) => id);
  const learned = [], offers = [];
  const newest = fresh.filter(id => MOVES[id].power > 0).pop() || fresh.pop();
  if (newest) {
    if (m.moves.length < 4) { m.moves.push({ id: newest, pp: maxPP(newest) }); learned.push(newest); }
    else offers.push(newest);
  }
  return { m, learned, offers };
}

export function replaceMove(m, slot, moveId) {
  if (slot < 0 || slot >= m.moves.length) return false;
  m.moves[slot] = { id: moveId, pp: maxPP(moveId) };
  return true;
}

// --------------------------------------------------------------- move tutor
// Forget a move (a Taschi always keeps at least one).
export function forgetMove(m, slot) {
  if (m.moves.length <= 1 || slot < 0 || slot >= m.moves.length) return false;
  m.moves.splice(slot, 1);
  return true;
}

// Moves this Taschi (or an earlier stage of its line) could have learned by
// now but does not currently know – offered by the move reminder.
export function relearnableMoves(m) {
  const out = [];
  for (const id of evolutionChain(m.id)) {
    for (const [lv, mv] of learnset(id)) if (lv <= m.lv && !m.moves.some(x => x.id === mv) && !out.includes(mv)) out.push(mv);
    if (id === m.id) break;
  }
  return out;
}

// Teach `moveId`; `slot` replaces a known move when four are known.
export function teachMove(m, moveId, slot = null) {
  if (!MOVES[moveId] || m.moves.some(x => x.id === moveId)) return false;
  if (m.moves.length < 4) { m.moves.push({ id: moveId, pp: maxPP(moveId) }); return true; }
  return slot !== null && replaceMove(m, slot, moveId);
}

// One level up (EP candy): grants exactly the EP to the next level.
export function levelUp(m, ctx = {}) {
  if (m.lv >= MAX_LEVEL) return [];
  return gainXp(m, Math.max(1, xpToNext(m.lv) - m.xp), ctx);
}

export function evolutionChain(id) {
  // walk back to base, then forward
  let base = id, guard = 0;
  const prev = () => Object.keys(SPECIES).find(k => SPECIES[k].evo?.to === base);
  while (prev() && guard++ < 5) base = prev();
  const chain = [base];
  guard = 0;
  while (SPECIES[chain[chain.length - 1]].evo && guard++ < 5) chain.push(SPECIES[chain[chain.length - 1]].evo.to);
  return chain;
}

export function describeEvolution(id) {
  const evo = SPECIES[id]?.evo;
  if (!evo) return null;
  if (evo.item) return 'mit Item: ' + evo.item;
  if (evo.night) return 'ab Lv ' + evo.level + ' bei Nacht';
  return 'ab Lv ' + evo.level;
}
