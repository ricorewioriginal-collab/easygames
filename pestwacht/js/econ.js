/* Pestwacht · Wirtschaft, Bevölkerung und Seuche, Forschung, Rekrutierung (Spieler). Ohne DOM.
 * Alle Ströme folgen festen Raten (je Minute) mit Bruchteil-Übertrag – keine Glückswürfe bei Heilung oder Ansteckung. */
(function (root) {
  'use strict';
  const PW = root.PW = root.PW || {};
  const E = PW.Econ = {};
  const C = () => PW.City;

  E.popTotal = p => p.h + p.r + p.i + p.q + p.t + p.rec;
  E.workforce = p => p.h + p.r + p.rec;
  // ganzzahliger Strom mit Bruchteil-Übertrag
  function flow(p, key, rate, avail) {
    p.acc[key] = (p.acc[key] || 0) + Math.max(0, rate);
    let n = Math.floor(p.acc[key]);
    if (n > avail) { n = avail; p.acc[key] = 0; } else p.acc[key] -= n;
    return n;
  }
  E.flow = flow;

  const ORDER = ['brunnen', 'farm', 'heilstube', 'lazarett', 'quarantaene', 'kraeuter', 'apotheke', 'saege', 'steinbruch', 'mine', 'akademie', 'markt', 'schmiede', 'stall'];
  E.assignWorkers = function (S) {
    let left = E.workforce(S.pop);
    const bs = S.city.b.filter(b => b.lv > 0 && PW.workersOf(b.t, b.lv) > 0);
    bs.sort((a, b) => (ORDER.indexOf(a.t) + 1 || 99) - (ORDER.indexOf(b.t) + 1 || 99) || a.id - b.id);
    let need = 0;
    bs.forEach(b => {
      const w = PW.workersOf(b.t, b.lv); need += b.pause ? 0 : w;
      if (b.pause || b.down > 0) { b.staff = 0; return; }
      b.staff = Math.min(w, left); left -= b.staff;
    });
    S._work = { free: left, need, total: E.workforce(S.pop) };
  };

  // Produktion und Verbrauch eines Zeitschritts (dt Sekunden)
  E.produce = function (S, dt) {
    const m = S._mods, caps = S._caps, mins = dt / 60, made = {}, used = {};
    const addMade = (k, v) => { made[k] = (made[k] || 0) + v; };
    S.city.b.forEach(b => {
      const d = PW.BLD[b.t]; if (b.lv < 1 || !d.prod || b.pause || b.down > 0) return;
      const w = PW.workersOf(b.t, b.lv), staff = w ? (b.staff || 0) / w : 1;
      if (staff <= 0) return;
      const hpF = Math.max(0.25, b.hp / C().maxHp(b)), road = C().touchesRoad(S, b) ? 1 + PW.BAL.roadBonus : 1;
      let eff = staff * hpF * road * PW.prodMult(b.lv);
      // Eingangswaren begrenzen die Leistung
      if (d.use) for (const k in d.use) { const need = d.use[k] * eff * mins; if (need > 0 && S.res[k] < need) eff *= S.res[k] / need; }
      if (eff <= 0) return;
      if (d.use) for (const k in d.use) { const v = d.use[k] * eff * mins; S.res[k] = Math.max(0, S.res[k] - v); used[k] = (used[k] || 0) + v; }
      for (const k in d.prod) {
        const v = d.prod[k] * eff * mins * (1 + (m['prod.' + k] || 0));
        addMade(k, PW.addRes(S.res, { [k]: v }, caps));
      }
    });
    // Ratshaus: Steuern und etwas Wissen
    const pop = E.popTotal(S.pop), sat = S.pop.sat / 100;
    addMade('coin', PW.addRes(S.res, { coin: PW.BAL.taxPerPop * pop * (0.4 + sat) * mins * (1 + (m['prod.coin'] || 0)) }, caps));
    addMade('know', PW.addRes(S.res, { know: (1 + 0.3 * C().hqLv(S)) * mins * (1 + (m['prod.know'] || 0)) }, caps));
    // Verbrauch: Bewohner essen und trinken, Truppen und Pferde
    const eat = (pop * PW.BAL.eatFood * (1 + (m.eat || 0)) + E.troopCount(S) * PW.BAL.troopUpkeepFood * (1 + (m.upkeep || 0))) * mins;
    const drink = pop * PW.BAL.drinkWater * mins;
    const coinUp = E.troopCount(S) * PW.BAL.troopUpkeepCoin * (1 + (m.upkeep || 0)) * mins;
    let stall = 0; S.city.b.forEach(b => { if (b.t === 'stall' && b.lv > 0) stall += PW.BLD.stall.use.food * b.lv * mins; });
    const short = {};
    [['food', eat + stall], ['water', drink], ['coin', coinUp]].forEach(([k, v]) => {
      if (S.res[k] >= v) { S.res[k] -= v; short[k] = 0; } else { short[k] = v > 0 ? 1 - S.res[k] / v : 0; S.res[k] = 0; }
      used[k] = (used[k] || 0) + v;
    });
    S._short = short;
    // Statistik und Raten (gleitender Mittelwert je Minute)
    for (const k in made) PW.stat(S, 'prod.' + k, made[k]);
    S._rate = S._rate || {};
    PW.RES.forEach(k => { const net = ((made[k] || 0) - (used[k] || 0)) / mins; S._rate[k] = S._rate[k] == null ? net : S._rate[k] * 0.9 + net * 0.1; });
    S._made = made; S._used = used;
  };

  E.troopCount = S => PW.UNIT_IDS.reduce((n, k) => n + (S.troops[k] || 0) + (S.wounded[k] || 0), 0) + E.marchingTroops(S);
  E.marchingTroops = S => S.marches.reduce((n, a) => n + (a.owner === 'P' ? PW.UNIT_IDS.reduce((x, k) => x + (a.units[k] || 0), 0) : 0), 0);

  // Bevölkerung und Seuche
  E.population = function (S, dt) {
    const p = S.pop, d = S._d, m = S._mods, mins = dt / 60, B = PW.BAL;
    const total = E.popTotal(p);
    if (total <= 0) { p.sat = PW.lerp(p.sat, 30, 0.01); return; }
    const short = S._short || {}, crowd = total > d.house ? Math.min(1, (total - d.house) / Math.max(1, d.house)) : 0;
    const hyg = PW.clamp(d.hyg - crowd * 0.25 - (short.water || 0) * 0.3, 0.02, 1);
    S._hyg = hyg;
    const spreadM = Math.max(0.1, 1 + (m.spread || 0));
    const ext = B.infectBase * (1 + 2 * (S._regionPlague || 0)) * spreadM;
    const contagious = p.i;                                    // Isolierte (q) und Behandelte (t) stecken nicht an
    const spread = B.spreadBeta * (contagious / total) * (1 - hyg) * spreadM;
    // gesund → gefährdet (Hunger und Durst erhöhen das Risiko)
    const expose = p.h * (ext + spread) * (1 + (short.food || 0) + (short.water || 0)) * mins;
    let n = flow(p, 'expose', expose, p.h); p.h -= n; p.r += n;
    // gefährdet → infiziert oder zurück zu gesund (Hygiene)
    n = flow(p, 'incub', p.r * 0.3 * (1 - hyg * 0.5) * mins, p.r); p.r -= n; p.i += n; if (n) PW.stat(S, 'infected', n);
    n = flow(p, 'clear', p.r * 0.35 * hyg * mins, p.r); p.r -= n; p.h += n;
    // Quarantäne: Infizierte isolieren, solange Plätze frei sind
    const qFree = Math.max(0, d.quar - p.q); n = Math.min(qFree, p.i); p.i -= n; p.q += n;
    if (p.q > d.quar) { const back = p.q - d.quar; p.q -= back; p.i += back; }
    // Aufnahme in Betten (zuerst aus der Quarantäne)
    let bedsFree = Math.max(0, d.beds - p.t);
    n = Math.min(bedsFree, p.q); p.q -= n; p.t += n; bedsFree -= n;
    n = Math.min(bedsFree, p.i); p.i -= n; p.t += n;
    if (p.t > d.beds) { const back = p.t - d.beds; p.t -= back; p.i += back; }
    // Behandlung: Arznei und Pflegequalität bestimmen die Heilrate
    const medNeed = p.t * B.medPerPatient * mins, hasMed = medNeed <= 0 ? 1 : Math.min(1, S.res.med / medNeed);
    S.res.med = Math.max(0, S.res.med - medNeed * hasMed);
    const cureRate = B.cureBase * d.cure * (1 + (m.cure || 0)) * (0.3 + 0.7 * hasMed);
    S._cureRate = cureRate;
    n = flow(p, 'cure', p.t * cureRate * mins, p.t); p.t -= n; p.rec += n; if (n) { PW.stat(S, 'cured', n); S._curedNow = (S._curedNow || 0) + n; }
    n = flow(p, 'tdie', p.t * B.untreatedDeath * 0.15 * mins, p.t); p.t -= n; p.dead += n; if (n) die(S, n);
    // Unbehandelte: sterben selten, genesen langsam von selbst
    n = flow(p, 'idie', p.i * B.untreatedDeath * mins, p.i); p.i -= n; p.dead += n; if (n) die(S, n);
    n = flow(p, 'qdie', p.q * B.untreatedDeath * 0.6 * mins, p.q); p.q -= n; p.dead += n; if (n) die(S, n);
    n = flow(p, 'irec', p.i * B.untreatedRecover * mins, p.i); p.i -= n; p.rec += n;
    n = flow(p, 'qrec', p.q * B.untreatedRecover * 1.2 * mins, p.q); p.q -= n; p.rec += n;
    // Genesene sind eine Zeit lang immun
    n = flow(p, 'immune', p.rec * (60 / B.immuneTime) * mins, p.rec); p.rec -= n; p.h += n;
    // Hunger: bei leerem Lager sterben wenige Schwache
    if ((short.food || 0) > 0.5) { n = flow(p, 'starve', total * 0.01 * short.food * mins, p.h + p.r); const a = Math.min(n, p.r); p.r -= a; p.h -= n - a; p.dead += n; if (n) die(S, n); }
    // Zufriedenheit
    p.grief = Math.max(0, (p.grief || 0) - mins * 2 * (1 + d.grief));
    const sick = (p.i + p.q + p.t) / total;
    let target = 50 + (short.food ? -25 * short.food : 8) + (short.water ? -25 * short.water : 8) + (crowd > 0 ? -25 * crowd : 4) + (hyg - 0.5) * 24
      + Math.min(14, d.sat) + (m.sat || 0) - sick * 30 - Math.min(25, p.grief * 2 / (1 + d.grief)) + Math.min(8, d.light * 0.4) + (S.waves.active ? -6 : 0) + (S._safety || 0);
    target = PW.clamp(target, 0, 100);
    p.sat = PW.clamp(p.sat + (target - p.sat) * Math.min(1, 0.4 * mins), 0, 100);
    p.target = Math.round(target);
    // Flucht und Zuwanderung
    if (p.sat < B.fleeBelow) { n = flow(p, 'flee', p.h * B.fleeRate * (B.fleeBelow - p.sat) / B.fleeBelow * mins, p.h); p.h -= n; p.fled += n; if (n) PW.log(S, n + ' Bewohner haben die Zuflucht verlassen (Zufriedenheit ' + Math.round(p.sat) + ')', 'warn'); }
    const room = Math.floor(d.house - total);
    if (p.sat > B.arriveAbove && room > 0 && !S.waves.active) {
      n = flow(p, 'arrive', B.arriveRate * (p.sat - B.arriveAbove) / 45 * (1 + 0.15 * C().lv(S, 'markt')) * mins * 2, room);
      if (n) { const sickN = flow(p, 'arrSick', n * 0.15, n);p.h += n - sickN; p.r += sickN; PW.stat(S, 'arrived', n); }
    }
    S.stats.maxPop = Math.max(S.stats.maxPop || 0, E.popTotal(p));
  };
  function die(S, n) { S.pop.grief = (S.pop.grief || 0) + n; PW.stat(S, 'deaths', n); }

  // ---------- Forschung ----------
  E.techTierOk = function (S, t) { const a = C().lv(S, 'akademie'); return t.tier === 1 || (t.tier === 2 && a >= 1) || (t.tier === 3 && a >= 3) || (t.tier === 4 && a >= 5); };
  E.researchWhy = function (S, id) {
    const t = PW.TECH[id]; if (!t) return 'Unbekannt';
    if (S.research.done[id]) return 'Bereits erforscht';
    if (S.research.cur) return 'Es läuft bereits eine Forschung';
    if ((t.req || []).some(r => !S.research.done[r])) return 'Erst: ' + t.req.filter(r => !S.research.done[r]).map(r => PW.TECH[r].name).join(', ');
    if (!E.techTierOk(S, t)) return 'Forschungsakademie Stufe ' + ({ 2: 1, 3: 3, 4: 5 })[t.tier] + ' nötig';
    if (!PW.canPay(S.res, t.cost)) return 'Zu wenig Rohstoffe';
    return null;
  };
  E.researchTime = function (S, id) { const a = C().lv(S, 'akademie'); return Math.round(PW.TECH[id].time / ((1 + 0.15 * Math.max(0, a - 1)) * (1 + ((S._mods || {})['research.speed'] || 0)))); };
  E.startResearch = function (S, id) {
    const why = E.researchWhy(S, id); if (why) return { ok: false, why };
    PW.pay(S.res, PW.TECH[id].cost, S.spent);
    S.research.cur = { id, rem: E.researchTime(S, id), tot: E.researchTime(S, id) };
    return { ok: true };
  };
  E.cancelResearch = function (S) { const c = S.research.cur; if (!c) return false; PW.addRes(S.res, PW.TECH[c.id].cost, null); S.research.cur = null; return true; };
  E.researchTick = function (S, dt) {
    const c = S.research.cur; if (!c) return;
    c.rem -= dt; if (c.rem > 0) return;
    S.research.done[c.id] = 1; S.research.cur = null; PW.stat(S, 'researched');
    if (c.id === 'h8') PW.stat(S, 'cure');
    PW.log(S, '📜 Erforscht: ' + PW.TECH[c.id].name, 'forschung');
  };

  // ---------- Rekrutierung ----------
  E.unitBld = type => PW.UNITS[type].req.bld;
  E.troopCap = S => (S._d ? S._d.troopCap : 20);
  E.recruitWhy = function (S, type, n) {
    const u = PW.UNITS[type]; if (!u) return 'Unbekannt';
    const lv = C().lv(S, u.req.bld);
    if (lv < (u.req.lv || 1)) return PW.BLD[u.req.bld].name + (u.req.lv > 1 ? ' Stufe ' + u.req.lv : '') + ' nötig';
    if (u.req.tech && !S.research.done[u.req.tech]) return 'Forschung „' + PW.TECH[u.req.tech].name + '“ nötig';
    if (n < 1) return 'Anzahl wählen';
    if (S.recruit.some(r => r.bld === u.req.bld)) return PW.BLD[u.req.bld].name + ' bildet gerade aus';
    const inQueue = S.recruit.reduce((x, r) => x + r.n, 0);
    if (E.troopCount(S) + inQueue + n > E.troopCap(S)) return 'Truppengrenze ' + E.troopCap(S) + ' (Kaserne, Schießplatz, Stall erhöhen sie)';
    if (S.pop.h < n) return 'Nicht genug gesunde Bewohner (' + S.pop.h + ')';
    if (!PW.canPay(S.res, u.cost, n)) return 'Zu wenig Rohstoffe';
    return null;
  };
  E.recruitTime = function (S, type, n) { const u = PW.UNITS[type], lv = C().lv(S, u.req.bld); return Math.max(2, Math.round(u.time * n / (1 + 0.12 * (lv - 1)) / (1 + ((S._mods || {})['recruit.speed'] || 0)))); };
  E.recruit = function (S, type, n) {
    const why = E.recruitWhy(S, type, n); if (why) return { ok: false, why };
    const u = PW.UNITS[type];
    PW.pay(S.res, u.cost, S.spent, n);
    S.pop.h -= n;                                 // Soldaten kommen aus der Bevölkerung
    const t = E.recruitTime(S, type, n);
    S.recruit.push({ type, n, rem: t, tot: t, bld: u.req.bld });
    return { ok: true };
  };
  E.recruitTick = function (S, dt) {
    for (let k = S.recruit.length - 1; k >= 0; k--) {
      const r = S.recruit[k]; r.rem -= dt; if (r.rem > 0) continue;
      S.troops[r.type] = (S.troops[r.type] || 0) + r.n; PW.stat(S, 'recruited', r.n);
      PW.log(S, '🛡️ Ausgebildet: ' + r.n + ' ' + PW.UNITS[r.type].name, 'militaer');
      S.recruit.splice(k, 1);
    }
  };
  E.dismiss = function (S, type, n) { n = Math.min(n, S.troops[type] || 0); if (n <= 0) return 0; S.troops[type] -= n; S.pop.h += n; return n; };
  // Verwundete genesen (Lazarett beschleunigt)
  E.woundedTick = function (S, dt) {
    const laz = C().lv(S, 'lazarett'), rate = (PW.BAL.woundedHeal + 0.04 * laz) * dt / 60;
    PW.UNIT_IDS.forEach(k => {
      const w = S.wounded[k] || 0; if (!w) return;
      const n = flow(S.pop, 'w_' + k, w * rate + (w < 3 ? rate : 0), w);
      if (n) { S.wounded[k] -= n; S.troops[k] = (S.troops[k] || 0) + n; }
    });
  };

  // ---------- Markt: Waren gegen Münzen tauschen ----------
  E.PRICE = { wood: 0.5, stone: 0.6, iron: 1.6, food: 0.45, water: 0.3, herb: 1.0, med: 3.2, cloth: 1.4, know: 2.5 };
  E.marketRate = function (S, k, buy) { const lv = C().lv(S, 'markt'); const base = E.PRICE[k] || 1; const spread = 0.35 - 0.025 * lv; return buy ? base * (1 + spread) : base * (1 - spread); };
  E.trade = function (S, k, amount, buy) {
    if (!C().lv(S, 'markt')) return { ok: false, why: 'Marktplatz nötig' };
    if (k === 'coin' || amount <= 0) return { ok: false, why: 'Ungültig' };
    const price = Math.ceil(E.marketRate(S, k, buy) * amount);
    if (buy) {
      if (k === 'know') return { ok: false, why: 'Wissen kann man nicht kaufen' };
      if (S.res.coin < price) return { ok: false, why: 'Zu wenig Münzen' };
      if (S.res[k] + amount > S._caps[k]) return { ok: false, why: 'Lager voll' };
      S.res.coin -= price; S.res[k] += amount;
    } else {
      if (S.res[k] < amount) return { ok: false, why: 'Zu wenig ' + PW.RES_INFO[k].name };
      S.res[k] -= amount; S.res.coin += Math.floor(E.marketRate(S, k, false) * amount);
    }
    return { ok: true, price };
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = PW;
})(typeof window !== 'undefined' ? window : globalThis);
