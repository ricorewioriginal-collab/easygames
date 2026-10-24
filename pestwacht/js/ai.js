/* Pestwacht · Computerfraktionen: eigene Wirtschaft (gleiche Kosten wie der Spieler), Forschung, Rekrutierung,
 * Utility-KI für Strategie (Ausbau, Expansion, Krieg, Frieden), operative Märsche, Diplomatie und Bündnisse. Ohne DOM.
 * Bots erzeugen nichts aus dem Nichts: alles wird bezahlt (ledger.spent) oder produziert (ledger.made). */
(function (root) {
  'use strict';
  const PW = root.PW = root.PW || {};
  const A = PW.AI = {};
  const Wd = () => PW.World, M = () => PW.March;

  A.mods = function (f) { const m = {}; Object.keys(f.tech.done).forEach(id => { if (PW.TECH[id]) PW.addMods(m, PW.TECH[id].mods); }); return m; };
  A.get = (S, id) => S.factions.find(f => f.id === id) || null;
  A.alive = S => S.factions.filter(f => f.alive);
  A.cap = f => 1500 + 600 * (f.bld.hq || 1);
  A.housing = f => 12 * (f.bld.hq || 1) + 6 * (f.bld.haus || 0);
  A.troopCap = f => 30 + 40 * (f.bld.kaserne || 0);
  A.troopsN = f => PW.UNIT_IDS.reduce((n, k) => n + (f.troops[k] || 0), 0);
  A.power = f => PW.Battle.power(f.troops, null, f.hero && !f.hero.away && !(f.hero.inj > 0) ? [f.hero] : [], A.mods(f));
  A.totalPower = function (S, f) { let p = A.power(f); S.marches.forEach(a => { if (a.owner === f.id) p += PW.Battle.power(a.units, null, null, A.mods(f)); }); return p; };
  A.tiles = (S, f) => Wd().tilesOf(S, f.id);

  // ---------- Start ----------
  A.init = function (S, ids, startRes) {
    S.factions = ids.map((id, k) => {
      const d = PW.FAC[id], cap = S.world.caps[k + 1];
      const f = { id, name: d.name, arch: d.arch, col: d.col, alive: true, cap, res: Object.assign({}, startRes), bld: { hq: 1, haus: 3, farm: 2, brunnen: 2, saege: 2, steinbruch: 1, kraeuter: 1, heilstube: 1, kaserne: 1, mauer: 1, mine: 0, apotheke: 0, akademie: 0, markt: 0 },
        pop: 24, sick: 0.04, troops: { spear: 14, bow: 8 }, wounded: {}, queue: [], rq: [], tech: { done: {}, cur: null },
        hero: Object.assign({ id: 'bot_' + id, lv: 1, xp: 0, away: false, inj: 0, cls: 'taktiker', skill: d.arch === 'verteidiger' ? 'schildwall' : d.arch === 'forscher' ? 'segen' : 'flanke', cd: 20 }, d.hero),
        goal: 'Aufbau', weary: 0, vassalOf: null, mem: [], next: S.time + 10 + k * 3, ledger: { spent: {}, made: {} }, st: { won: 0, lost: 0, tiles: 0 }, formation: d.arch === 'eroberer' ? 'angriff' : d.arch === 'verteidiger' ? 'verteidigung' : 'ausgewogen', _rate: {} };
      S.world.tiles[cap].own = id;
      const s = Wd().siteAt(S, cap); if (s) s.owner = id;
      Wd().neighbors(S.world, cap).forEach(n => { const t = S.world.tiles[n]; if (!t.own && t.site < 0) { t.own = id; t.gar = { units: { spear: 3 } }; } });
      return f;
    });
    // Startbeziehungen nach Persönlichkeiten
    const all = ['P'].concat(ids);
    for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
      const a = all[i], b = all[j], ra = a === 'P' ? null : PW.FAC[a].arch, rb = PW.FAC[b].arch;
      let rel = Math.round((PW.rand(S) - 0.5) * 30);
      [ra, rb].forEach(r => { if (r === 'eroberer') rel -= 12; if (r === 'diplomat') rel += 12; if (r === 'haendler') rel += 6; if (r === 'opportunist') rel -= 4; });
      if (ra && ra === rb) rel += 6;
      S.rel[PW.Diplo.key(a, b)] = { rel: PW.clamp(rel, -60, 60), trust: 40, war: false, nap: 0, trade: false, def: false, ally: false, truce: 0 };
    }
  };

  // ---------- Wirtschaft (jeder Zeitschritt, entfernte Fraktionen gröber) ----------
  function techMods(f) { return f._mods || (f._mods = A.mods(f)); }
  A.econ = function (S, f, dt) {
    if (!f.alive) return;
    const mins = dt / 60, m = techMods(f), cap = A.cap(f), made = {}, used = {};
    let need = 0; Object.keys(PW.BOT_BLD).forEach(k => { need += (PW.BLD[k] ? PW.BLD[k].workers || 0 : 0) * (f.bld[k] || 0); });
    const work = f.pop * (1 - f.sick) * 0.85, staff = need > 0 ? Math.min(1, work / need) : 1;
    const add = (k, v) => { if (v <= 0) return; const before = f.res[k] || 0; f.res[k] = PW.UNCAPPED[k] ? before + v : Math.max(before, Math.min(cap, before + v)); made[k] = (made[k] || 0) + (f.res[k] - before); };
    Object.keys(PW.BOT_BLD).forEach(k => {
      const d = PW.BOT_BLD[k], n = f.bld[k] || 0; if (!n || !d.prod) return;
      let eff = n * staff;
      if (d.use) for (const u in d.use) { const nd = d.use[u] * eff * mins; if (nd > 0 && (f.res[u] || 0) < nd) eff *= (f.res[u] || 0) / nd; }
      if (d.use) for (const u in d.use) { const v = d.use[u] * eff * mins; f.res[u] = Math.max(0, (f.res[u] || 0) - v); used[u] = (used[u] || 0) + v; }
      for (const r in d.prod) add(r, d.prod[r] * eff * mins * (1 + (m['prod.' + r] || 0)));
    });
    add('coin', PW.BAL.taxPerPop * f.pop * 0.9 * mins); add('know', (1 + 0.3 * f.bld.hq) * mins);
    // eigene Regionen liefern Erträge
    A.tiles(S, f).forEach(i => {
      if (i === f.cap) return;
      const t = S.world.tiles[i], s = Wd().siteAt(S, i), bp = PW.BIOMES[t.b].prod;
      for (const r in bp) add(r, bp[r] * 0.5 * mins);
      if (s && PW.SITES[s.type].prod) for (const r in PW.SITES[s.type].prod) add(r, PW.SITES[s.type].prod[r] * 0.6 * mins);
    });
    // Verbrauch
    const troops = A.troopsN(f) + S.marches.reduce((n, a) => n + (a.owner === f.id ? M().unitsN(a.units) : 0), 0);
    const cons = { food: (f.pop * PW.BAL.eatFood + troops * PW.BAL.troopUpkeepFood) * mins, water: f.pop * PW.BAL.drinkWater * mins, coin: troops * PW.BAL.troopUpkeepCoin * mins };
    f.short = 0;
    for (const k in cons) { const v = cons[k]; if ((f.res[k] || 0) >= v) f.res[k] -= v; else { f.short = Math.max(f.short, 1 - (f.res[k] || 0) / Math.max(1e-9, v)); f.res[k] = 0; } used[k] = (used[k] || 0) + v; }
    // Bevölkerung und Seuche (vereinfacht, gleiche Grundregeln)
    const pl = S.world.tiles[f.cap].pl, healing = 0.012 * (f.bld.heilstube || 0) + ((f.res.med || 0) > 1 ? 0.03 : 0) + (f.tech.done.h8 ? 0.05 : 0);
    if ((f.res.med || 0) > 0) f.res.med = Math.max(0, f.res.med - f.pop * f.sick * 0.2 * mins);
    f.sick = PW.clamp(f.sick + ((0.02 + pl * 0.05) * (1 - (f.tech.done.h2 ? 0.2 : 0)) - healing * f.sick * 8 - 0.01) * mins, 0.01, 0.6);
    const deaths = f.pop * f.sick * 0.012 * mins + (f.short > 0.5 ? f.pop * 0.01 * mins : 0);
    f.pop = Math.max(0, f.pop - deaths);
    if (!f.short && f.pop < A.housing(f)) f.pop = Math.min(A.housing(f), f.pop + (1.2 + 0.4 * (f.bld.hq || 1)) * mins * (1 + (f.bld.markt || 0) * 0.15));
    // Vasall zahlt Tribut
    if (f.vassalOf) {
      const to = f.vassalOf === 'P' ? null : A.get(S, f.vassalOf), tr = { coin: (made.coin || 0) * 0.15, food: (made.food || 0) * 0.15 };
      for (const k in tr) { const n = Math.min(f.res[k] || 0, tr[k]); f.res[k] -= n; f.ledger.spent[k] = (f.ledger.spent[k] || 0) + n; if (to) { to.res[k] = (to.res[k] || 0) + n; to.ledger.made[k] = (to.ledger.made[k] || 0) + n; } else PW.addRes(S.res, { [k]: n }, S._caps); }
    }
    for (const k in made) f.ledger.made[k] = (f.ledger.made[k] || 0) + made[k];
    if (!f._rate) f._rate = {};
    PW.RES.forEach(k => { const net = ((made[k] || 0) - (used[k] || 0)) / mins; f._rate[k] = f._rate[k] == null ? net : f._rate[k] * 0.8 + net * 0.2; });
    // Aufträge
    for (let k = f.queue.length - 1; k >= 0; k--) { const q = f.queue[k]; q.rem -= dt; if (q.rem <= 0) { f.bld[q.t] = (f.bld[q.t] || 0) + 1; f.queue.splice(k, 1); } }
    for (let k = f.rq.length - 1; k >= 0; k--) { const q = f.rq[k]; q.rem -= dt; if (q.rem <= 0) { f.troops[q.t] = (f.troops[q.t] || 0) + q.n; f.rq.splice(k, 1); } }
    if (f.tech.cur) { f.tech.cur.rem -= dt; if (f.tech.cur.rem <= 0) { f.tech.done[f.tech.cur.id] = 1; f.tech.cur = null; f._mods = null; } }
    const heal = (0.05 + 0.02 * (f.bld.heilstube || 0)) * mins;
    PW.UNIT_IDS.forEach(k => { const w = f.wounded[k] || 0; if (w > 0) { const n = Math.min(w, Math.max(w < 2 ? w : 0, w * heal)); f.wounded[k] = w - n; f.troops[k] = (f.troops[k] || 0) + n; } });
    PW.UNIT_IDS.forEach(k => { if (f.troops[k] && f.troops[k] % 1) { /* ganze Einheiten in Kämpfen */ } });
    if (f.hero.inj > 0) f.hero.inj -= dt;
    while (f.hero.xp >= PW.xpFor(f.hero.lv) && f.hero.lv < 30) { f.hero.xp -= PW.xpFor(f.hero.lv); f.hero.lv++; f.hero.atk = Math.round(f.hero.atk * 1.05); f.hero.def = Math.round(f.hero.def * 1.04); f.hero.hp = Math.round(f.hero.hp * 1.05); }
  };

  // ---------- Strategische KI (Utility-Bewertung) ----------
  function payBot(f, cost, mult) { return PW.pay(f.res, cost, f.ledger.spent, mult); }
  A.buildCost = (f, t) => PW.costOf(t, t === 'hq' ? (f.bld.hq || 1) + 1 : 1 + Math.floor((f.bld[t] || 0) / 2));
  function threatsTo(S, f) { return S.marches.filter(a => a.owner !== f.id && (a.mission === 'attack' || a.mission === 'occupy') && S.world.tiles[a.target].own === f.id && a.state === 'go'); }
  A.threats = threatsTo;
  function noise(S, f) { const d = PW.DIFFICULTY[S.cfg.diff] || PW.DIFFICULTY.normal; return 1 + (PW.rand(S) - 0.5) * 2 * d.noise; }

  function chooseBuild(S, f) {
    if (f.queue.length >= 2) return null;
    const w = PW.ARCHETYPES[f.arch].w, r = f._rate, hq = f.bld.hq || 1, threat = threatsTo(S, f).length > 0 || PW.Diplo.warsOf(S, f.id).length > 0;
    const o = [];
    const push = (t, u) => { if (t !== 'hq' && (f.bld[t] || 0) >= 2 * hq + 2) return; if (f.queue.some(q => q.t === t)) return; o.push({ t, u: u * noise(S, f) }); };
    push('farm', ((r.food || 0) < f.pop * 0.12 ? 2.6 : 0.5) * w.econ);
    push('brunnen', ((r.water || 0) < f.pop * 0.12 ? 2.4 : 0.3) * w.econ);
    push('saege', ((f.res.wood || 0) < 400 ? 1.4 : 0.5) * w.econ);
    push('steinbruch', ((f.res.stone || 0) < 300 ? 1.2 : 0.45) * w.econ);
    if (hq >= 2) push('mine', ((f.res.iron || 0) < 150 ? 1.3 : 0.45) * (w.mil + w.econ) / 2);
    push('kraeuter', (f.sick > 0.06 ? 1.4 : 0.4) * w.research);
    if (hq >= 2) push('apotheke', (f.sick > 0.06 && (f.res.herb || 0) > 50 ? 1.3 : 0.3) * w.research);
    push('heilstube', (f.sick > 0.08 ? 1.5 : 0.3));
    push('haus', (f.pop > A.housing(f) * 0.85 ? 1.7 : 0.3) * w.econ);
    if (hq >= 2) push('akademie', 0.9 * w.research);
    if (hq >= 2) push('markt', 0.8 * w.trade);
    push('kaserne', (A.troopsN(f) > A.troopCap(f) * 0.75 ? 1.5 : 0.3) * w.mil);
    push('mauer', (threat ? 2.2 : 0.5) * w.def * ((f.bld.mauer || 0) < hq + 1 ? 1 : 0.3));
    let steps = 0; Object.keys(f.bld).forEach(k => { if (k !== 'hq') steps += f.bld[k]; });
    if (hq < 10) push('hq', steps > hq * 7 ? 2.4 : 0.4);
    o.sort((a, b) => b.u - a.u);
    for (let k = 0; k < Math.min(2, o.length); k++) {
      const c = A.buildCost(f, o[k].t);
      if (PW.canPay(f.res, c)) { if (k === 1 && o[1].u < o[0].u * 0.6) break; return o[k].t; }
    }
    return null;                                      // spart auf das Wichtigste
  }
  function doBuild(S, f, t) {
    const c = A.buildCost(f, t); if (!payBot(f, c)) return false;
    const lv = t === 'hq' ? (f.bld.hq || 1) + 1 : 1 + Math.floor((f.bld[t] || 0) / 2);
    f.queue.push({ t, rem: PW.timeOf(t, lv) });
    return true;
  }
  function chooseResearch(S, f) {
    if (f.tech.cur) return;
    const a = f.bld.akademie || 0, pref = { forscher: 'heil', eroberer: 'krieg', expansionist: 'krieg', haendler: 'wirt', diplomat: 'wirt', verteidiger: 'krieg', ueberleben: 'heil', opportunist: 'wirt' }[f.arch];
    const opts = PW.TECHS.filter(t => !f.tech.done[t.id] && (t.req || []).every(r => f.tech.done[r]) && (t.tier === 1 || (t.tier === 2 && a >= 1) || (t.tier === 3 && a >= 3) || (t.tier === 4 && a >= 5)));
    opts.sort((x, y) => (y.tree === pref) - (x.tree === pref) || x.tier - y.tier);
    const t = opts.find(x => PW.canPay(f.res, x.cost)); if (!t) return;
    payBot(f, t.cost); f.tech.cur = { id: t.id, rem: t.time / (1 + 0.15 * Math.max(0, a - 1)) };
  }
  A.unitOk = function (f, k) {
    const u = PW.UNITS[k];
    if (u.req.tech && !f.tech.done[u.req.tech]) return false;
    if (k === 'rider' || k === 'ram') return (f.bld.kaserne || 0) >= 2;
    return true;
  };
  function recruit(S, f, urgent) {
    if (f.rq.length >= 2) return;
    const w = PW.ARCHETYPES[f.arch].w, wars = PW.Diplo.warsOf(S, f.id).length, hq = f.bld.hq || 1;
    const desired = (24 + 14 * hq) * w.mil * (wars ? 1.5 : 1) * (urgent ? 1.4 : 1);
    const have = A.troopsN(f) + f.rq.reduce((n, q) => n + q.n, 0);
    if (have >= desired) return;
    const mix = [['spear', 0.45], ['bow', 0.35], ['rider', 0.12], ['medic', 0.05], ['ram', wars ? 0.05 : 0], ['hunter', 0.06]].filter(([k]) => A.unitOk(f, k));
    const free = Math.max(0, A.troopCap(f) - have), tot = mix.reduce((s, x) => s + x[1], 0);
    mix.forEach(([k, share]) => {
      let n = Math.floor(Math.min(desired - have, free) * share / tot); if (n < 1) return;
      n = Math.min(n, Math.floor(Math.max(0, f.pop - 12) * 0.3));
      const u = PW.UNITS[k]; for (const r in u.cost) n = Math.min(n, Math.floor((f.res[r] || 0) / u.cost[r]));
      if (n < 1 || f.rq.length >= 2) return;
      payBot(f, u.cost, n); f.pop -= n;
      f.rq.push({ t: k, n, rem: u.time * n / (1 + 0.12 * Math.max(0, (f.bld.kaserne || 1) - 1)) });
    });
  }
  // Truppenauswahl für eine Stärke
  function pickArmy(f, needPower, reserveShare) {
    const avail = {}; PW.UNIT_IDS.forEach(k => { avail[k] = Math.floor((f.troops[k] || 0) * (1 - reserveShare)); });
    const full = PW.Battle.power(avail, null, null, A.mods(f)); if (full <= 0) return null;
    const share = Math.min(1, needPower / full); if (share >= 1 && full < needPower) return null;
    const out = {}; PW.UNIT_IDS.forEach(k => { const n = Math.ceil(avail[k] * share); if (n > 0) out[k] = n; });
    if (out.medic === undefined && avail.medic) out.medic = Math.min(avail.medic, 2);
    return out;
  }
  A.pickArmy = pickArmy;
  function estDefense(S, f, tile) {
    const d = M().defenders(S, tile); if (!d) return 0;
    const ins = (PW.DIFFICULTY[S.cfg.diff] || PW.DIFFICULTY.normal).insight;
    let p = PW.Battle.power(d.units, d.mon, d.heroes, d.mods || {}) + (d.boss ? 900 : 0);
    if (d.siege) p += d.siege.wall * 0.6 + d.siege.towers * 20;
    return p * (ins + (1 - ins) * (PW.rand(S) * 1.2));       // schlechtere Einsicht = ungenauere Schätzung
  }
  function launch(S, f, tile, mission, units, info) {
    const a = M().create(S, { owner: f.id, units, target: tile, mission, bhero: !f.hero.away && !(f.hero.inj > 0) && mission !== 'trade' ? 1 : null, formation: f.formation, info });
    if (!a) return null;
    PW.UNIT_IDS.forEach(k => { f.troops[k] = (f.troops[k] || 0) - (units[k] || 0); });
    if (a.bhero) f.hero.away = true;
    return a;
  }
  function value(S, i) {
    const t = S.world.tiles[i], s = Wd().siteAt(S, i); let v = 0;
    const bp = PW.BIOMES[t.b].prod; for (const k in bp) v += bp[k] * 0.4;
    if (s) v += { res_wood: 3, res_stone: 3, res_iron: 4, res_herb: 3, res_food: 3, ruin: 2, village: 1.5, trade: 3.5, lair: 2.5, boss: 3, key: 2, capital: 10 }[s.type] || 0;
    return v;
  }
  A.value = value;
  function expansion(S, f, budget) {
    const w = PW.ARCHETYPES[f.arch].w, own = A.tiles(S, f);
    if (own.length >= 8 + 3 * (f.bld.hq || 1)) return null;
    if (S.marches.some(a => a.owner === f.id && (a.mission === 'occupy' || a.mission === 'attack'))) return null;
    const cand = new Set(); own.forEach(i => Wd().neighbors(S.world, i).forEach(n => { const t = S.world.tiles[n]; if (!t.own && !(Wd().siteAt(S, n) && Wd().siteAt(S, n).type === 'capital')) cand.add(n); }));
    let best = null;
    cand.forEach(i => {
      const need = Math.max(80, estDefense(S, f, i) * 1.6), units = pickArmy(f, need, 0.4);
      if (!units) return;
      const u = w.expand * value(S, i) * noise(S, f) / (1 + Wd().dist(S.world, f.cap, i) * 0.3);
      if (!best || u > best.u) best = { i, units, u };
    });
    if (best && best.u > 0.8) return launch(S, f, best.i, 'occupy', best.units);
    return null;
  }
  function warfare(S, f) {
    const w = PW.ARCHETYPES[f.arch].w, diff = PW.DIFFICULTY[S.cfg.diff] || PW.DIFFICULTY.normal;
    if (S.marches.filter(a => a.owner === f.id && a.mission === 'attack').length >= 1 + (f.bld.hq >= 5 ? 1 : 0)) return null;
    let best = null;
    PW.Diplo.warsOf(S, f.id).forEach(enemy => {
      const tiles = enemy === 'P' ? Wd().tilesOf(S, 'P') : A.tiles(S, A.get(S, enemy) || { id: '-' });
      tiles.forEach(i => {
        if (Wd().dist(S.world, f.cap, i) > 9) return;
        const isCap = i === M().capOf(S, enemy), need = Math.max(100, estDefense(S, f, i) * (1.25 + (1.4 - w.risk) * 0.4));
        const units = pickArmy(f, need, isCap ? 0.15 : 0.3); if (!units) return;
        let u = w.aggr * (value(S, i) + (isCap ? 6 : 0)) * noise(S, f) / (1 + Wd().dist(S.world, f.cap, i) * 0.25);
        if (enemy === 'P') u *= diff.aggrPlayer;
        if (!best || u > best.u) best = { i, units, u, enemy };
      });
    });
    if (best && best.u > 0.9) { const a = launch(S, f, best.i, 'attack', best.units); if (a && best.enemy === 'P') PW.log(S, '🚨 ' + f.name + ' marschiert auf ' + Wd().regionName(S, best.i) + ' (Ankunft in ' + PW.fmtTime(M().eta(S, a)) + ')', 'warn', { tile: best.i }); return a; }
    return null;
  }
  function defend(S, f) {
    const th = threatsTo(S, f);
    th.forEach(a => {
      if (a.target === f.cap) { recruit(S, f, true); PW.Diplo.callAllies(S, f.id, a); return; }
      const t = S.world.tiles[a.target], tg = t.gar ? PW.Battle.power(t.gar.units) : 0, ap = PW.Battle.power(a.units);
      if (tg < ap && !S.marches.some(m => m.owner === f.id && m.mission === 'defend' && m.target === a.target)) {
        const units = pickArmy(f, ap * 1.2 - tg, 0.4); if (units) launch(S, f, a.target, 'defend', units);
      }
    });
  }
  function aidAllies(S, f) {
    if (threatsTo(S, f).length) return;
    PW.Diplo.alliesOf(S, f.id).forEach(o => {
      const tcap = M().capOf(S, o); if (tcap == null) return;
      const incoming = S.marches.filter(a => a.target === tcap && a.mission === 'attack' && a.state === 'go' && PW.Diplo.atWar(S, a.owner, o));
      if (!incoming.length || S.marches.some(a => a.owner === f.id && a.mission === 'aid')) return;
      const r = PW.Diplo.rel(S, f.id, o), dist = Wd().dist(S.world, f.cap, tcap);
      if (r.trust < 45 || dist > 12) return;
      const units = pickArmy(f, A.power(f) * 0.3, 0.5); if (!units) return;
      const a = launch(S, f, tcap, 'aid', units, { ally: o });
      if (a && o === 'P') PW.log(S, '🤝 ' + f.name + ' schickt Truppen zur Verteidigung deiner Zuflucht', 'diplo');
    });
  }
  function trade(S, f) {
    const w = PW.ARCHETYPES[f.arch].w; if (w.trade < 1 || PW.rand(S) > 0.35) return;
    if (S.marches.some(a => a.owner === f.id && a.mission === 'trade')) return;
    const partners = S.factions.filter(o => o.alive && o.id !== f.id && PW.Diplo.rel(S, f.id, o.id).trade && !PW.Diplo.atWar(S, f.id, o.id));
    if (!partners.length) return;
    const o = PW.pick(S, partners), k = ['wood', 'stone', 'food', 'herb'].sort((a, b) => (f.res[b] || 0) - (f.res[a] || 0))[0], n = Math.floor((f.res[k] || 0) * 0.25);
    if (n < 60) return;
    f.res[k] -= n; f.ledger.spent[k] = (f.ledger.spent[k] || 0) + n;
    const a = M().create(S, { owner: f.id, units: {}, target: o.cap, mission: 'trade', cargo: { [k]: n } });
    if (!a) { f.res[k] += n; f.ledger.spent[k] -= n; }
  }
  function bankruptcy(S, f) {
    if ((f.res.food || 0) > 5 || (f._rate.food || 0) >= 0) { f.broke = 0; return; }
    f.broke = (f.broke || 0) + 1;
    PW.UNIT_IDS.forEach(k => { const n = Math.floor((f.troops[k] || 0) * 0.15); f.troops[k] -= n; f.pop += n; });
    PW.Diplo.alliesOf(S, f.id).forEach(o => {
      if (o === 'P') return; const g = A.get(S, o);
      if (g && (g.res.food || 0) > 400 && PW.Diplo.rel(S, f.id, o).trust > 40) { g.res.food -= 150; f.res.food += 150; g.ledger.spent.food = (g.ledger.spent.food || 0) + 150; f.ledger.made.food = (f.ledger.made.food || 0) + 150; PW.log(S, '🍞 ' + g.name + ' hilft ' + f.name + ' mit Nahrung', 'welt'); }
    });
    if (f.broke >= 6 && !f.vassalOf && f.pop < 10) {
      const strong = A.alive(S).filter(o => o.id !== f.id && !PW.Diplo.atWar(S, f.id, o.id)).sort((a, b) => A.power(b) - A.power(a))[0];
      if (strong) PW.Conquest.vassalize(S, f, strong.id, 'Hungersnot');
    }
    if (f.broke === 2) PW.log(S, '⚠️ ' + f.name + ' leidet Hunger und entlässt Truppen', 'welt');
  }

  A.think = function (S, f) {
    if (!f.alive) return;
    const diff = PW.DIFFICULTY[S.cfg.diff] || PW.DIFFICULTY.normal, far = Wd().dist(S.world, f.cap, S.world.caps[0]) > 9 && !PW.Diplo.atWar(S, f.id, 'P');
    f.next = S.time + diff.think * (far ? 1.6 : 1) * (0.8 + PW.rand(S) * 0.4);
    f._mods = null;
    bankruptcy(S, f);
    const t = chooseBuild(S, f); if (t) doBuild(S, f, t);
    chooseResearch(S, f);
    const th = threatsTo(S, f).length;
    recruit(S, f, th > 0);
    defend(S, f);
    aidAllies(S, f);
    if (!th) { if (!warfare(S, f)) expansion(S, f); }
    trade(S, f);
    PW.Diplo.think(S, f);
    f.goal = th ? 'Verteidigung' : PW.Diplo.warsOf(S, f.id).length ? 'Krieg' : f.queue.length ? 'Ausbau' : 'Wachstum';
    f.st.tiles = A.tiles(S, f).length;
  };

  A.tick = function (S, dt) {
    S._botAcc = (S._botAcc || 0) + dt;
    if (S._botAcc >= 5) { const d = S._botAcc; S._botAcc = 0; S.factions.forEach(f => A.econ(S, f, d)); }
    S.factions.forEach(f => { if (f.alive && S.time >= f.next) A.think(S, f); });
    // stationierte Hilfstruppen kehren zurück
    for (let k = S.stationed.length - 1; k >= 0; k--) {
      const st = S.stationed[k]; if (S.time < st.until) continue;
      S.stationed.splice(k, 1);
      const f = A.get(S, st.owner);
      if (f && f.alive && M().unitsN(st.units) > 0) { const a = M().create(S, { owner: st.owner, units: st.units, target: f.cap, mission: 'home', from: st.tile }); if (a) a.state = 'go'; }
    }
  };

  // ---------- Ankunft von Hilfe und Handel ----------
  A.aidArrive = function (S, a) {
    const ally = a.info && a.info.ally;
    if (ally && PW.Diplo.rel(S, a.owner, ally).ally) {
      S.stationed.push({ owner: a.owner, tile: a.target, units: a.units, until: S.time + 300 });
      if (ally === 'P') PW.log(S, '🤝 Truppen von ' + M().ownerName(S, a.owner) + ' verstärken deine Zuflucht (5 Minuten)', 'diplo');
      PW.Diplo.event(S, a.owner, ally, 'hilfe');
      M().disband(S, a); if (a.bhero) { const f = A.get(S, a.owner); if (f) f.hero.away = false; }
      return;
    }
    M().goHome(S, a);
  };
  A.tradePrice = function (S, buyer, k) {
    const base = PW.Econ.PRICE[k] || 1;
    if (!buyer) return base * 1.1;
    const stock = buyer.res[k] || 0;
    return base * PW.clamp(1.9 - stock / 900, 0.6, 2.2);
  };
  A.tradeArrive = function (S, a) {
    const s = Wd().siteAt(S, a.target), buyer = s && s.type === 'capital' ? A.get(S, s.owner) : null;
    let coins = 0;
    for (const k in (a.cargo || {})) {
      let p = A.tradePrice(S, buyer, k) * (a.cargo[k] || 0);
      if (a.owner === 'P') p *= (1 + ((S._mods || {}).trade || 0)) * (1 + 0.05 * PW.City.lv(S, 'handel'));
      p = Math.floor(p);
      if (buyer) { p = Math.min(p, Math.floor(buyer.res.coin || 0)); buyer.res.coin -= p; buyer.res[k] = (buyer.res[k] || 0) + a.cargo[k]; buyer.ledger.made[k] = (buyer.ledger.made[k] || 0) + a.cargo[k]; buyer.ledger.spent.coin = (buyer.ledger.spent.coin || 0) + p; }
      coins += p;
    }
    a.gain = { coin: coins }; a.cargo = null;
    if (a.owner === 'P') { PW.stat(S, 'trades'); PW.log(S, '🐪 Karawane verkauft in ' + Wd().regionName(S, a.target) + ' für ' + coins + ' Münzen', 'handel'); }
    if (buyer) PW.Diplo.event(S, a.owner, buyer.id, 'handel');
    M().goHome(S, a);
  };
  A.afterCapture = function (S, a) {
    // Bot-Märsche nach Eroberung: Besatzung bleibt (in capture geregelt), Rest kehrt heim
    if (S.marches.indexOf(a) >= 0) M().goHome(S, a);
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = PW;
})(typeof window !== 'undefined' ? window : globalThis);
