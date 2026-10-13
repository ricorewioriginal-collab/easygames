// Turn-based battle engine (single and double battles). Pure logic.
// The presentation layer feeds player choices in and animates the returned
// event list; the engine never touches the DOM or Three.js.
import { SPECIES } from '../data/species.js';
import { MOVES, STATUS } from '../data/moves.js';
import { effectiveness } from '../data/types.js';
import { ITEMS } from '../data/items.js';
import { statOf, maxHp, maxPP, xpReward, gainXp } from './monster.js';
import { applyItem, count, remove, ballRate } from './items.js';
import { chooseAction, chooseReplacement } from './ai.js';

const STAGE = (s) => s >= 0 ? (2 + s) / 2 : 2 / (2 - s);
const nameOf = (m) => SPECIES[m.id].name;

export function createBattle(o) {
  const rng = o.rng;
  const format = o.format === 'double' ? 2 : 1;
  const mkSide = (src, isPlayer) => {
    const active = [];
    for (const [i, m] of src.team.entries()) {
      if (active.length >= format) break;
      if (m.hp > 0) active.push(i);
    }
    return { isPlayer, name: src.name || '', title: src.title || '', team: src.team, active, ai: src.ai ?? 1, items: src.items || {}, trainer: !!src.trainer };
  };
  const b = {
    rng, kind: o.kind || 'wild', format, turnNo: 0, phase: 'choose', result: null,
    canRun: o.canRun ?? (o.kind === 'wild'), canCatch: o.canCatch ?? (o.kind === 'wild'),
    sides: [mkSide(o.player, true), mkSide(o.foe, false)],
    bag: o.player.bag || {}, vol: {}, participants: {}, runAttempts: 0,
    pendingEvolutions: [], learnRequests: [], night: !!o.night, expShare: o.expShare ?? true,
    needReplace: [], fainted: new Set()
  };
  for (const side of b.sides) for (const i of side.active) initVol(b, side.team[i]);
  markParticipants(b);
  return b;
}

function initVol(b, m) { b.vol[m.uid] = { atk: 0, def: 0, speed: 0, turnsIn: 0 }; }
function markParticipants(b) {
  for (const fi of b.sides[1].active) {
    const foe = fi === null ? null : b.sides[1].team[fi];
    if (!foe) continue;
    const set = b.participants[foe.uid] ||= new Set();
    for (const pi of b.sides[0].active) { const m = pi === null ? null : b.sides[0].team[pi]; if (m && m.hp > 0) set.add(m.uid); }
  }
}

export function activeMon(b, side, slot) {
  const i = b.sides[side].active[slot];
  return i === undefined || i === null ? null : b.sides[side].team[i];
}
export function activeList(b, side) {
  return b.sides[side].active.map((i, slot) => ({ slot, m: i === null ? null : b.sides[side].team[i] })).filter(x => x.m && x.m.hp > 0);
}

function speedOf(b, m) {
  let s = statOf(m, 'speed') * STAGE(b.vol[m.uid]?.speed || 0);
  if (m.status === 'paralyse') s *= 0.5;
  return s;
}

export function playerOptions(b, slot) {
  const m = activeMon(b, 0, slot);
  if (!m) return null;
  const moves = m.moves.map(mv => ({ id: mv.id, pp: mv.pp, max: maxPP(mv.id), disabled: mv.pp <= 0, move: MOVES[mv.id] }));
  const side = b.sides[0];
  const switchTargets = side.team.map((t, i) => ({ i, m: t })).filter(x => x.m.hp > 0 && !side.active.includes(x.i));
  return {
    moves, struggle: moves.every(x => x.disabled), switchTargets,
    canRun: b.canRun, canCatch: b.canCatch && b.format === 1,
    items: Object.keys(b.bag).filter(id => count(b.bag, id) > 0 && ['heal', 'status', 'battle', 'ball'].includes(ITEMS[id]?.category))
  };
}

// Valid foe targets for a player slot.
export function targetsFor(b, side) {
  const other = 1 - side;
  return activeList(b, other).map(x => x.slot);
}

// ---------------------------------------------------------------------------
// Turn resolution
// ---------------------------------------------------------------------------
export function runTurn(b, playerChoices) {
  if (b.phase !== 'choose') throw new Error('Battle not awaiting choices: ' + b.phase);
  const ev = [];
  b.turnNo++;
  const actions = [];
  for (const { slot, m } of activeList(b, 0)) {
    const c = playerChoices.find(x => x.slot === slot) || { type: 'move', move: m.moves.find(x => x.pp > 0)?.id };
    actions.push({ side: 0, slot, uid: m.uid, ...c });
  }
  for (const { slot, m } of activeList(b, 1)) {
    const c = chooseAction(b, 1, slot, b.rng);
    actions.push({ side: 1, slot, uid: m.uid, ...c });
  }
  const prio = (a) => a.type === 'run' ? 7 : a.type === 'switch' ? 6 : a.type === 'item' ? 5 : (MOVES[a.move]?.priority || 0);
  for (const a of actions) {
    a.p = prio(a);
    const m = findByUid(b, a.uid);
    a.speed = m ? speedOf(b, m) : 0;
    a.tie = b.rng.next();
  }
  actions.sort((x, y) => y.p - x.p || y.speed - x.speed || x.tie - y.tie);

  for (const a of actions) {
    if (b.result) break;
    const user = findByUid(b, a.uid);
    if (!user || user.hp <= 0) continue;
    if (!b.sides[a.side].active.some(i => b.sides[a.side].team[i] === user)) continue;
    if (a.type === 'run') doRun(b, a, ev);
    else if (a.type === 'switch') doSwitch(b, a.side, a.slot, a.to, ev);
    else if (a.type === 'item') doItem(b, a, ev);
    else doMove(b, a, user, ev);
    checkFaints(b, ev);
  }
  if (!b.result) endOfTurn(b, ev);
  if (!b.result) afterTurnReplacements(b, ev);
  for (const side of b.sides) for (const i of side.active) if (i !== null && side.team[i]) { const v = b.vol[side.team[i].uid]; if (v) v.turnsIn++; }
  return ev;
}

function findByUid(b, uid) {
  for (const s of b.sides) { const m = s.team.find(x => x.uid === uid); if (m) return m; }
  return null;
}
function locate(b, m) {
  for (let s = 0; s < 2; s++) {
    const idx = b.sides[s].team.indexOf(m);
    const slot = b.sides[s].active.indexOf(idx);
    if (idx >= 0 && slot >= 0) return { side: s, slot };
  }
  return null;
}

function doRun(b, a, ev) {
  if (!b.canRun) { ev.push({ t: 'text', text: 'Aus diesem Kampf kannst du nicht fliehen!' }); return; }
  b.runAttempts++;
  const me = activeMon(b, 0, a.slot), foe = activeList(b, 1)[0]?.m;
  const ratio = foe ? speedOf(b, me) / Math.max(1, speedOf(b, foe)) : 2;
  const p = Math.min(1, Math.max(0.35, 0.45 + 0.35 * (ratio - 1) + 0.15 * (b.runAttempts - 1)));
  if (b.rng.next() < p) {
    ev.push({ t: 'run', ok: true, text: 'Du bist entkommen!' });
    b.result = { outcome: 'run' }; b.phase = 'end';
    ev.push({ t: 'end', outcome: 'run' });
  } else ev.push({ t: 'run', ok: false, text: 'Flucht misslungen!' });
}

export function doSwitch(b, side, slot, to, ev) {
  const s = b.sides[side];
  const out = activeMon(b, side, slot);
  const inc = s.team[to];
  if (!inc || inc.hp <= 0 || s.active.includes(to)) return false;
  if (out && out.hp > 0) ev.push({ t: 'switchOut', side, slot, uid: out.uid, text: side === 0 ? nameOf(out) + ', komm zurück!' : (s.name ? s.name + ' ruft ' + nameOf(out) + ' zurück.' : nameOf(out) + ' zieht sich zurück.') });
  s.active[slot] = to;
  initVol(b, inc);
  ev.push({ t: 'switchIn', side, slot, uid: inc.uid, text: side === 0 ? 'Los, ' + nameOf(inc) + '!' : (s.name ? s.name + ' schickt ' + nameOf(inc) + ' in den Kampf!' : 'Ein wildes ' + nameOf(inc) + ' erscheint!') });
  markParticipants(b);
  return true;
}

function doItem(b, a, ev) {
  const side = b.sides[a.side];
  const bag = a.side === 0 ? b.bag : side.items;
  const it = ITEMS[a.item];
  if (!it || count(bag, a.item) <= 0) { ev.push({ t: 'text', text: 'Der Gegenstand ist nicht mehr da.' }); return; }
  if (it.category === 'ball') return doCatch(b, a, ev);
  const target = a.target ? findByUid(b, a.target) : activeMon(b, a.side, a.slot);
  if (!target) return;
  if (it.category === 'battle') {
    remove(bag, a.item);
    ev.push({ t: 'item', side: a.side, item: a.item, text: (a.side === 0 ? 'Du setzt ' : side.name + ' setzt ') + it.name + ' ein.' });
    statChange(b, target, it.stat, it.stages, ev);
    return;
  }
  const res = applyItem(a.item, target, { inBattle: true });
  if (res.ok) {
    remove(bag, a.item);
    ev.push({ t: 'item', side: a.side, item: a.item, text: (a.side === 0 ? 'Du setzt ' : side.name + ' setzt ') + it.name + ' ein.' });
    ev.push({ t: 'heal', uid: target.uid, hp: target.hp, max: maxHp(target), text: res.text });
  } else ev.push({ t: 'text', text: res.text });
}

export function catchChance(b, foe, ball) {
  const s = SPECIES[foe.id];
  const hpFactor = 1 + 1.7 * (1 - foe.hp / maxHp(foe));
  const statusBonus = foe.status === 'schlaf' || foe.status === 'frost' ? 1.6 : foe.status ? 1.25 : 1;
  const levelPenalty = foe.lv > 40 ? 0.85 : 1;
  return Math.min(0.97, s.catch * ballRate(ball) * hpFactor * statusBonus * levelPenalty * 0.62);
}

function doCatch(b, a, ev) {
  const foeEntry = activeList(b, 1)[0];
  if (!b.canCatch || !foeEntry) { ev.push({ t: 'text', text: 'Taschis von Trainern kann man nicht fangen!' }); return; }
  remove(b.bag, a.item);
  const foe = foeEntry.m;
  const p = catchChance(b, foe, a.item);
  const perShake = Math.pow(p, 1 / 4);
  let shakes = 0;
  while (shakes < 4 && b.rng.next() < perShake) shakes++;
  const caught = shakes >= 4;
  ev.push({ t: 'ball', item: a.item, uid: foe.uid, shakes: Math.min(3, shakes), caught, text: 'Du wirfst einen ' + ITEMS[a.item].name + '!' });
  if (caught) {
    ev.push({ t: 'caught', uid: foe.uid, text: 'Geschafft! ' + nameOf(foe) + ' wurde gefangen!' });
    foe.status = foe.status || null;
    b.result = { outcome: 'caught', caught: foe, ball: a.item };
    b.phase = 'end';
    awardXpFor(b, foe, ev, 0.7);
    ev.push({ t: 'end', outcome: 'caught' });
  } else {
    const msgs = ['Oh nein! Es hat sich befreit!', 'Fast! Es ist wieder draußen!', 'Argh! Beinahe gefangen!', 'Mist! So knapp!'];
    ev.push({ t: 'escape', uid: foe.uid, text: msgs[Math.min(3, shakes)] });
  }
}

function canAct(b, user, ev) {
  if (user.status === 'schlaf') {
    user.statusTurns = (user.statusTurns || 2) - 1;
    if (user.statusTurns <= 0) { user.status = null; ev.push({ t: 'cure', uid: user.uid, text: nameOf(user) + ' ist aufgewacht!' }); return true; }
    ev.push({ t: 'statusBlock', uid: user.uid, status: 'schlaf', text: nameOf(user) + ' schläft tief und fest.' });
    return false;
  }
  if (user.status === 'frost') {
    if (b.rng.next() < 0.25) { user.status = null; ev.push({ t: 'cure', uid: user.uid, text: nameOf(user) + ' ist aufgetaut!' }); return true; }
    ev.push({ t: 'statusBlock', uid: user.uid, status: 'frost', text: nameOf(user) + ' ist eingefroren!' });
    return false;
  }
  if (user.status === 'paralyse' && b.rng.next() < 0.25) {
    ev.push({ t: 'statusBlock', uid: user.uid, status: 'paralyse', text: nameOf(user) + ' ist paralysiert und kann sich nicht bewegen!' });
    return false;
  }
  return true;
}

function pickTarget(b, a, move) {
  if (move.power === 0 && move.target === 'self') return findByUid(b, a.uid);
  const foes = activeList(b, 1 - a.side);
  if (!foes.length) return null;
  const want = foes.find(x => x.slot === a.target);
  return (want || foes[Math.floor(b.rng.next() * foes.length)]).m;
}

export function calcDamage(b, user, target, move, crit, roll = 1) {
  const st = SPECIES[user.id];
  const vu = b.vol[user.uid] || {}, vt = b.vol[target.uid] || {};
  let atkStage = vu.atk || 0, defStage = vt.def || 0;
  if (crit) { atkStage = Math.max(0, atkStage); defStage = Math.min(0, defStage); }
  const A = statOf(user, 'atk') * STAGE(atkStage);
  const D = statOf(target, 'def') * STAGE(defStage);
  let dmg = ((2 * user.lv / 5 + 2) * move.power * A / D) / 50 + 2;
  if (move.type === st.type || move.type === st.type2) dmg *= 1.5;
  const eff = effectiveness(move.type, SPECIES[target.id]);
  dmg *= eff;
  if (crit) dmg *= 1.5;
  if (user.status === 'brand') dmg *= 0.5;
  dmg *= roll;
  return { dmg: eff === 0 ? 0 : Math.max(1, Math.floor(dmg)), eff };
}

function doMove(b, a, user, ev) {
  let moveId = a.move;
  let slotMove = user.moves.find(x => x.id === moveId);
  if (!slotMove || slotMove.pp <= 0) {
    slotMove = user.moves.find(x => x.pp > 0);
    moveId = slotMove ? slotMove.id : 'verzweiflung';
  }
  const move = MOVES[moveId];
  if (!canAct(b, user, ev)) return;
  if (slotMove && moveId !== 'verzweiflung') slotMove.pp = Math.max(0, slotMove.pp - 1);
  const target = pickTarget(b, a, move);
  const userLoc = locate(b, user);
  const tLoc = target ? locate(b, target) : null;
  ev.push({ t: 'move', side: a.side, slot: userLoc?.slot ?? a.slot, uid: user.uid, move: moveId, fx: move.fx, mtype: move.type, targetUid: target?.uid, targetSide: tLoc?.side, targetSlot: tLoc?.slot,
    text: nameOf(user) + ' setzt ' + move.name + ' ein!' });
  if (!target) { ev.push({ t: 'text', text: 'Aber es gibt kein Ziel …' }); return; }
  const selfTarget = target === user;
  if (!selfTarget && b.rng.next() > move.acc) { ev.push({ t: 'miss', uid: target.uid, text: 'Die Attacke verfehlt ' + nameOf(target) + '!' }); return; }

  if (move.power > 0 && !selfTarget) {
    const crit = b.rng.next() < (1 / 16 + (move.crit || 0));
    const roll = 0.85 + b.rng.next() * 0.15;
    const { dmg, eff } = calcDamage(b, user, target, move, crit, roll);
    if (eff === 0) { ev.push({ t: 'immune', uid: target.uid, text: 'Das hat keine Wirkung auf ' + nameOf(target) + '…' }); return; }
    const dealt = Math.min(target.hp, dmg);
    target.hp -= dealt;
    ev.push({ t: 'damage', uid: target.uid, side: tLoc?.side, slot: tLoc?.slot, amount: dealt, hp: target.hp, max: maxHp(target), eff, crit,
      text: (crit ? 'Volltreffer! ' : '') + (eff > 1 ? 'Das ist sehr effektiv!' : eff < 1 ? 'Das ist nicht sehr effektiv …' : '') });
    if (move.drain && dealt > 0 && user.hp > 0) {
      const h = Math.max(1, Math.floor(dealt * move.drain));
      user.hp = Math.min(maxHp(user), user.hp + h);
      ev.push({ t: 'heal', uid: user.uid, hp: user.hp, max: maxHp(user), text: nameOf(user) + ' saugt Energie ab.' });
    }
    if (move.recoil && dealt > 0) {
      const r = Math.max(1, Math.floor(dealt * move.recoil));
      user.hp = Math.max(0, user.hp - r);
      ev.push({ t: 'damage', uid: user.uid, side: userLoc?.side, slot: userLoc?.slot, amount: r, hp: user.hp, max: maxHp(user), eff: 1, recoil: true, text: nameOf(user) + ' wird vom Rückstoß getroffen.' });
    }
    if (move.heal && user.hp > 0) {
      const h = Math.floor(maxHp(user) * move.heal);
      user.hp = Math.min(maxHp(user), user.hp + h);
      ev.push({ t: 'heal', uid: user.uid, hp: user.hp, max: maxHp(user), text: nameOf(user) + ' regeneriert sich.' });
    }
    if (target.hp > 0 && move.status && b.rng.next() < (move.chance ?? 0)) inflict(b, target, move.status, ev);
    if (move.stat && move.target === 'self' && user.hp > 0) statChange(b, user, move.stat, move.stages, ev);
    if (move.stat && move.target === 'foe' && target.hp > 0) statChange(b, target, move.stat, move.stages, ev);
    return;
  }
  // status / support moves
  if (move.heal && move.target === 'self') {
    if (user.hp >= maxHp(user)) { ev.push({ t: 'text', text: 'Aber die KP sind bereits voll!' }); return; }
    user.hp = Math.min(maxHp(user), user.hp + Math.floor(maxHp(user) * move.heal));
    ev.push({ t: 'heal', uid: user.uid, hp: user.hp, max: maxHp(user), text: nameOf(user) + ' fühlt sich besser.' });
    return;
  }
  if (move.status) {
    const t = move.target === 'foe' ? target : user;
    if (t.status) { ev.push({ t: 'text', text: 'Aber es hat keine Wirkung …' }); return; }
    inflict(b, t, move.status, ev);
    return;
  }
  if (move.stat) statChange(b, move.target === 'self' ? user : target, move.stat, move.stages, ev);
}

const STATUS_IMMUNE = { brand: ['feuer'], frost: ['eis'], paralyse: ['elektro'], gift: ['geist'] };
function inflict(b, m, status, ev) {
  if (m.status || m.hp <= 0) return;
  const s = SPECIES[m.id];
  if ((STATUS_IMMUNE[status] || []).some(t => t === s.type || t === s.type2)) return;
  m.status = status;
  if (status === 'schlaf') m.statusTurns = 1 + Math.floor(b.rng.next() * 3);
  const verbs = { brand: 'erleidet Verbrennungen', gift: 'wurde vergiftet', schlaf: 'ist eingeschlafen', paralyse: 'ist paralysiert', frost: 'wurde eingefroren' };
  ev.push({ t: 'status', uid: m.uid, status, text: nameOf(m) + ' ' + verbs[status] + '!' });
}

const STAT_NAMES = { atk: 'Angriff', def: 'Verteidigung', speed: 'Initiative' };
function statChange(b, m, stat, stages, ev) {
  const v = b.vol[m.uid] ||= { atk: 0, def: 0, speed: 0, turnsIn: 0 };
  const before = v[stat] || 0;
  v[stat] = Math.max(-6, Math.min(6, before + stages));
  const diff = v[stat] - before;
  if (!diff) { ev.push({ t: 'text', text: STAT_NAMES[stat] + ' von ' + nameOf(m) + ' kann sich nicht weiter verändern.' }); return; }
  ev.push({ t: 'stat', uid: m.uid, stat, stages: diff, text: STAT_NAMES[stat] + ' von ' + nameOf(m) + (diff > 0 ? (diff > 1 ? ' steigt stark!' : ' steigt!') : (diff < -1 ? ' sinkt stark!' : ' sinkt!')) });
}

function endOfTurn(b, ev) {
  for (let s = 0; s < 2; s++) {
    for (const { m } of activeList(b, s)) {
      if (m.status === 'brand' || m.status === 'gift') {
        const d = Math.max(1, Math.floor(maxHp(m) / (m.status === 'gift' ? 8 : 16)));
        m.hp = Math.max(0, m.hp - d);
        const loc = locate(b, m);
        ev.push({ t: 'damage', uid: m.uid, side: loc?.side, slot: loc?.slot, amount: d, hp: m.hp, max: maxHp(m), eff: 1, dot: m.status, text: nameOf(m) + (m.status === 'gift' ? ' leidet unter dem Gift.' : ' leidet unter der Verbrennung.') });
      }
    }
    checkFaints(b, ev);
    if (b.result) return;
  }
}

function checkFaints(b, ev) {
  for (let s = 0; s < 2; s++) {
    const side = b.sides[s];
    side.active.forEach((i, slot) => {
      if (i === null) return;
      const m = side.team[i];
      if (m && m.hp <= 0 && !b.fainted.has(m.uid)) {
        b.fainted.add(m.uid);
        m.status = null;
        ev.push({ t: 'faint', side: s, slot, uid: m.uid, text: (s === 1 && !side.trainer ? 'Das wilde ' : '') + nameOf(m) + ' ist erschöpft!' });
        if (s === 1) awardXpFor(b, m, ev, 1);
      }
    });
  }
  const alive = (s) => b.sides[s].team.some(m => m.hp > 0);
  if (!alive(1)) {
    b.result = { outcome: 'win' }; b.phase = 'end';
    ev.push({ t: 'end', outcome: 'win', text: b.sides[1].trainer ? 'Du hast ' + b.sides[1].name + ' besiegt!' : '' });
  } else if (!alive(0)) {
    b.result = { outcome: 'lose' }; b.phase = 'end';
    ev.push({ t: 'end', outcome: 'lose', text: 'Du hast keine kampffähigen Taschis mehr …' });
  }
  for (const side of b.sides) for (const m of side.team) if (m.hp > 0) b.fainted.delete(m.uid);
}

function awardXpFor(b, foe, ev, factor) {
  const base = Math.floor(xpReward(foe, { trainer: b.sides[1].trainer }) * factor);
  const part = b.participants[foe.uid] || new Set();
  for (const m of b.sides[0].team) {
    if (m.hp <= 0) continue;
    const share = part.has(m.uid) ? 1 : (b.expShare ? 0.5 : 0);
    if (!share) continue;
    const amount = Math.max(1, Math.floor(base * share));
    ev.push({ t: 'xp', uid: m.uid, amount, text: nameOf(m) + ' erhält ' + amount + ' EP.' });
    for (const e of gainXp(m, amount, { night: b.night })) {
      if (e.type === 'levelup') ev.push({ t: 'levelup', uid: m.uid, level: e.level, hp: m.hp, max: maxHp(m), text: nameOf(m) + ' erreicht Level ' + e.level + '!' });
      if (e.type === 'learn') ev.push({ t: 'learn', uid: m.uid, move: e.move, text: nameOf(m) + ' lernt ' + MOVES[e.move].name + '!' });
      if (e.type === 'learnFull') { b.learnRequests.push({ uid: m.uid, move: e.move }); ev.push({ t: 'learnFull', uid: m.uid, move: e.move, text: nameOf(m) + ' möchte ' + MOVES[e.move].name + ' lernen.' }); }
      if (e.type === 'evolve' && !b.pendingEvolutions.some(x => x.uid === m.uid)) b.pendingEvolutions.push({ uid: m.uid, to: e.to });
    }
  }
}

function afterTurnReplacements(b, ev) {
  // foe replaces fainted actives immediately
  const foe = b.sides[1];
  foe.active.forEach((i, slot) => {
    if (i === null || foe.team[i].hp > 0) return;
    const r = chooseReplacement(b, 1, b.rng);
    if (r !== null && r !== undefined) doSwitch(b, 1, slot, r, ev);
    else foe.active[slot] = null;
  });
  const me = b.sides[0];
  b.needReplace = [];
  me.active.forEach((i, slot) => {
    if (i === null || me.team[i].hp > 0) return;
    const free = me.team.some((m, idx) => m.hp > 0 && !me.active.includes(idx));
    if (free) b.needReplace.push(slot); else me.active[slot] = null;
  });
  if (b.needReplace.length) { b.phase = 'replace'; ev.push({ t: 'needReplace', slots: b.needReplace.slice() }); }
}

// Player picks a replacement for a fainted active monster.
export function replace(b, slot, teamIndex) {
  if (b.phase !== 'replace') throw new Error('No replacement pending');
  const ev = [];
  if (!doSwitch(b, 0, slot, teamIndex, ev)) return { ok: false, ev };
  b.needReplace = b.needReplace.filter(s => s !== slot);
  if (!b.needReplace.length) b.phase = 'choose';
  return { ok: true, ev };
}

export function battleSummary(b) {
  return {
    outcome: b.result?.outcome || null,
    caught: b.result?.caught || null,
    evolutions: b.pendingEvolutions.slice(),
    learnRequests: b.learnRequests.slice()
  };
}

export { STATUS };
