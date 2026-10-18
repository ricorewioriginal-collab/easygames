/* Konto, Energie, Spin, Bauen, Reparieren. Server-Konten nutzen IMMER Profil 'classic' und ngp 0 –
 * unabhängig von Offline-Spielständen (es werden nie Werte aus dem Browser übernommen). */
'use strict';
const { fail, isInt, dayKey, weekKey, cleanName, HOUR, MIN } = require('./util');

const SHIELD_MAX = 3, PENDING_MS = 10 * MIN, HISTORY_MAX = 50, ISLANDS = 30, ENERGY_CAP = 100000, CARD_CAP = 999;
const ISLAND_BONUS = { coins: 25, energy: 10 };   // Basis-Vielfache der abgeschlossenen Insel bzw. Energie

module.exports = function economy(ctx) {
  const { E, SW } = ctx;
  const P = E.PROFILES.classic;
  const clamp = E.clampInt;
  const base = w => E.base(w, 0);
  const sum = a => a.reduce((x, y) => x + y, 0);

  function newAccount(uid, name, now) {
    return {
      uid, name, created: now,
      coins: clamp(5 * base(1)), lifetimeCoins: 0,
      energy: P.energyMax, energyAt: now,
      shields: 0, island: 1, islandsDone: 0, stages: [0, 0, 0, 0, 0], damaged: [false, false, false, false, false],
      pending: null, history: [], cards: {},
      xp: 0, material: 0, relics: 0, eventPts: 0, tickets: 0,
      stats: { spins: 0, builds: 0, repairs: 0, attacks: 0, raids: 0, attacked: 0, raided: 0, islands: 0, giftsSent: 0, giftsGot: 0, trades: 0 },
      team: null, week: { k: weekKey(now), n: 0 }, gifts: { d: dayKey(now), to: [] }, hits: []
    };
  }

  function displayName(tokenName, uid) {
    const n = cleanName(tokenName);
    return n || 'Hüter-' + ctx.pid(uid).slice(0, 4).toUpperCase();
  }

  function addCoins(acc, n) {
    n = clamp(n);
    const add = Math.min(n, E.MAX_COINS - acc.coins);
    acc.coins += add; acc.lifetimeCoins = clamp(acc.lifetimeCoins + add);
    return add;
  }
  function spendCoins(acc, n) {
    n = clamp(n);
    if (acc.coins < n) fail(402, 'not_enough_coins');
    acc.coins -= n;
  }
  const addNum = (acc, k, n) => { acc[k] = clamp((acc[k] || 0) + (n || 0)); };
  function addEnergy(acc, n) { acc.energy = Math.min(ENERGY_CAP, clamp(acc.energy + n)); }
  const actionCoins = (kind, mult, island) => clamp(base(island) * mult * (kind === 'raid' ? E.RAID.avg : E.ATTACK.avg));

  // Zeitabhängige Werte nachführen (nur Server-Uhr): Energie, verfallene Aktion, Wochen-/Tageszähler
  function normalize(acc, now) {
    const step = P.regenSec * 1000;
    if (acc.energyAt > now) acc.energyAt = now;
    if (acc.energy >= P.energyMax) acc.energyAt = now;
    else {
      const g = Math.floor((now - acc.energyAt) / step);
      if (g > 0) {
        acc.energy = Math.min(P.energyMax, acc.energy + g);
        acc.energyAt = acc.energy >= P.energyMax ? now : acc.energyAt + g * step;
      }
    }
    if (acc.pending && acc.pending.exp <= now) {
      // Verfallene Aktion geht nicht verloren: wird in Münzen umgerechnet (Rache-Aktionen verfallen ersatzlos)
      if (!acc.pending.target) addCoins(acc, actionCoins(acc.pending.kind, acc.pending.mult, acc.island));
      acc.pending = null;
    }
    const wk = weekKey(now);
    if (!acc.week || acc.week.k !== wk) acc.week = { k: wk, n: 0 };
    const d = dayKey(now);
    if (!acc.gifts || acc.gifts.d !== d) acc.gifts = { d, to: [] };
    if (acc.hits.length) acc.hits = acc.hits.filter(h => now - h.t < HOUR);
    return acc;
  }

  function pushHistory(acc, entry) {
    acc.history.unshift(entry);
    if (acc.history.length > HISTORY_MAX) acc.history.length = HISTORY_MAX;
  }

  function view(acc, now) {
    const step = P.regenSec * 1000;
    const costs = acc.stages.map((s, b) => (acc.islandsDone >= ISLANDS || s >= 5) ? null : E.buildCost(acc.island, b, s, 'classic', 0));
    const rep = acc.stages.map((s, b) => acc.damaged[b] ? E.repairCost(acc.island, b, s, 'classic', 0) : null);
    let pending = null;
    if (acc.pending) {
      pending = { kind: acc.pending.kind, mult: acc.pending.mult, expiresAt: acc.pending.exp };
      if (acc.pending.target) {
        const t = ctx.store.data.accounts[acc.pending.target];
        pending.revenge = { target: t ? ctx.pid(t.uid) : null, name: t ? t.name : null };
      }
    }
    return {
      pid: ctx.pid(acc.uid), name: acc.name, created: acc.created,
      coins: acc.coins, lifetimeCoins: acc.lifetimeCoins,
      energy: acc.energy, energyMax: P.energyMax, regenSec: P.regenSec,
      nextEnergyInSec: acc.energy >= P.energyMax ? 0 : Math.max(0, Math.ceil((acc.energyAt + step - now) / 1000)),
      island: acc.island, islandsDone: acc.islandsDone, islandsMax: ISLANDS,
      stages: acc.stages.slice(), damaged: acc.damaged.slice(), buildCosts: costs, repairCosts: rep,
      shields: acc.shields, shieldsMax: SHIELD_MAX, mults: E.multsFor(acc.islandsDone),
      pending, cards: Object.assign({}, acc.cards),
      xp: acc.xp, material: acc.material, relics: acc.relics, eventPts: acc.eventPts, tickets: acc.tickets,
      stats: Object.assign({}, acc.stats), historyCount: acc.history.length, team: acc.team,
      protected: ctx.pvp ? ctx.pvp.isProtected(acc, now) : false
    };
  }

  function drawCards(acc, n, rng) {
    const got = [];
    for (let i = 0; i < n; i++) {
      const w = 1 + rng.int(Math.max(1, Math.min(ISLANDS, acc.island))), c = 1 + rng.int(8);
      const id = 'w' + String(w).padStart(2, '0') + 'c' + c;
      acc.cards[id] = Math.min(CARD_CAP, (acc.cards[id] || 0) + 1);
      got.push(id);
    }
    return got;
  }

  function checkIsland(acc) {
    if (acc.islandsDone >= ISLANDS) return null;
    if (!acc.stages.every(s => s >= 5) || acc.damaged.some(Boolean)) return null;
    const done = acc.island;
    const coins = addCoins(acc, ISLAND_BONUS.coins * base(done));
    addEnergy(acc, ISLAND_BONUS.energy);
    acc.islandsDone += 1; acc.stats.islands += 1;
    if (acc.islandsDone < ISLANDS) {
      acc.island = acc.islandsDone + 1;
      acc.stages = [0, 0, 0, 0, 0]; acc.damaged = [false, false, false, false, false];
    }
    return { island: done, bonusCoins: coins, bonusEnergy: ISLAND_BONUS.energy, next: acc.islandsDone < ISLANDS ? acc.island : null };
  }

  // ---- Endpunkte ----
  function init({ t, user, now }) {
    let me = t.get('accounts', user.uid);
    const created = !me;
    if (!me) {
      me = t.put('accounts', user.uid, newAccount(user.uid, displayName(user.name, user.uid), now));
      t.after(() => ctx.indexAccount(user.uid));
    } else {
      normalize(me, now);
      me.name = displayName(user.name, user.uid);
    }
    return { created };
  }

  function spin({ me, input, now }) {
    const mult = input.mult;
    if (!Number.isInteger(mult)) fail(400, 'bad_mult');
    if (!E.multsFor(me.islandsDone).includes(mult)) fail(400, 'mult_locked');
    if (me.energy < mult) fail(409, 'not_enough_energy');
    me.energy -= mult;
    const rng = SW.rng.secure();
    const roll = E.roll(rng), ev = E.evaluate(roll.ids), rw = E.spinReward(ev, me.island, mult, 0, {});
    const res = { ids: Array.from(roll.ids), outcome: roll.outcome, rule: ev.rule, sym: ev.sym, mult, reward: JSON.parse(JSON.stringify(rw)) };
    res.coins = addCoins(me, rw.coins);
    addNum(me, 'xp', rw.xp); addNum(me, 'material', rw.material); addNum(me, 'relics', rw.relics);
    addNum(me, 'eventPts', rw.event); addNum(me, 'tickets', rw.ticket);
    if (rw.spins) addEnergy(me, rw.spins);
    if (rw.shield) {
      if (me.shields < SHIELD_MAX) { me.shields += 1; res.shieldAdded = true; }
      else res.shieldOverflowCoins = addCoins(me, 10 * base(me.island) * mult);
    }
    if (rw.chest) res.cards = drawCards(me, 2, rng);
    if (rw.action === 'attack' || rw.action === 'raid') {
      if (!me.pending) { me.pending = { kind: rw.action, mult, exp: now + PENDING_MS }; res.pending = rw.action; }
      else res.actionCoins = addCoins(me, actionCoins(rw.action, mult, me.island));
    }
    me.stats.spins += 1;
    return res;
  }

  function build({ me, input }) {
    const b = input.b;
    if (!isInt(b, 0, 4)) fail(400, 'bad_building');
    if (me.islandsDone >= ISLANDS) fail(409, 'all_islands_done');
    const s = me.stages[b];
    if (s >= 5) fail(409, 'max_stage');
    if (me.damaged[b]) fail(409, 'damaged');
    const cost = E.buildCost(me.island, b, s, 'classic', 0);
    spendCoins(me, cost);
    me.stages[b] = s + 1;
    me.stats.builds += 1; me.week.n += 1;
    const res = { b, stage: s + 1, cost };
    const isl = checkIsland(me);
    if (isl) res.islandDone = isl;
    return res;
  }

  function repair({ me, input }) {
    const b = input.b;
    if (!isInt(b, 0, 4)) fail(400, 'bad_building');
    if (!me.damaged[b]) fail(409, 'not_damaged');
    const cost = E.repairCost(me.island, b, me.stages[b], 'classic', 0);
    spendCoins(me, cost);
    me.damaged[b] = false; me.stats.repairs += 1;
    const res = { b, cost };
    const isl = checkIsland(me);
    if (isl) res.islandDone = isl;
    return res;
  }

  // Nur im Testmodus registriert: Werte direkt setzen (Münzen auffüllen usw.)
  function testPatch({ me, input }) {
    const n = (k, hi) => { if (input[k] !== undefined) { if (!isInt(input[k], 0, hi)) fail(400, 'bad_' + k); me[k] = input[k]; } };
    n('coins', E.MAX_COINS); n('energy', ENERGY_CAP); n('shields', SHIELD_MAX); n('island', ISLANDS); n('islandsDone', ISLANDS);
    if (input.createdAgoMs !== undefined) { if (!isInt(input.createdAgoMs, 0, 1e12)) fail(400, 'bad_created'); me.created = Math.max(0, ctx.now() - input.createdAgoMs); }
    if (input.stages !== undefined) { if (!Array.isArray(input.stages) || input.stages.length !== 5 || !input.stages.every(s => isInt(s, 0, 5))) fail(400, 'bad_stages'); me.stages = input.stages.slice(); }
    if (input.damaged !== undefined) { if (!Array.isArray(input.damaged) || input.damaged.length !== 5) fail(400, 'bad_damaged'); me.damaged = input.damaged.map(Boolean); }
    if (input.cards !== undefined) { me.cards = {}; for (const [k, v] of Object.entries(input.cards || {})) if (/^w(0[1-9]|[12][0-9]|30)c[1-8]$/.test(k) && isInt(v, 1, CARD_CAP)) me.cards[k] = v; }
    if (input.pending !== undefined) {
      if (input.pending === null) me.pending = null;
      else if (['attack', 'raid'].includes(input.pending.kind) && isInt(input.pending.mult, 1, 50)) me.pending = { kind: input.pending.kind, mult: input.pending.mult, exp: ctx.now() + PENDING_MS };
      else fail(400, 'bad_pending');
    }
    return { patched: true };
  }

  return { newAccount, normalize, view, addCoins, spendCoins, pushHistory, drawCards, checkIsland, displayName, actionCoins,
    init, spin, build, repair, testPatch, SHIELD_MAX, PENDING_MS, ISLANDS, sum };
};
