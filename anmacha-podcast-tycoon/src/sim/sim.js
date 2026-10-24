/* Simulation: Zeit, Wirtschaft, Team, Studio-Werte, Produktions-Zustandsautomat, Folgen, Sponsoren, Ereignisse,
   Missionen, Minispiel-Belohnungen, Erfolge, Herausforderungen und Endlosmodus. Ohne DOM, deterministisch (Seed im Zustand).
   Alle Regeln und Formeln sind in README.md („Regeln“) dokumentiert. */
(function (root) {
  'use strict';
  const PT = root.PT = root.PT || {}; const D = PT.DATA, B = PT.Build;
  const S = PT.Sim = {};
  const R = () => D.rules;
  const clamp = PT.clamp;
  const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  S.SCHEMA = 1;
  S.STAGES = ['plan', 'research', 'team', 'tech', 'record', 'edit', 'package', 'publish', 'report'];
  S.STAGE_NAMES = { plan: 'Themenauswahl', research: 'Redaktion & Recherche', team: 'Gast & Team', tech: 'Technikcheck', record: 'Aufnahme', edit: 'Mehrspur-Schnitt', package: 'Titel & Cover', publish: 'Veröffentlichung', report: 'Auswertung' };

  // ── Zustand ───────────────────────────────────────────────
  S.create = function (opt) {
    opt = opt || {};
    const mode = opt.mode || 'career', diff = opt.difficulty == null ? 1 : opt.difficulty;
    const st = {
      v: S.SCHEMA, mode, diff, seed: (opt.seed >>> 0) || 20261017, nextId: 1, name: opt.name || 'Studioleitung',
      look: opt.look || { shirt: '#ff8a1e', hair: '#3b2a1e', skin: '#f0c8a8' },
      time: { day: 1, min: 8 * 60 }, money: R().startMoney, fans: R().startFans, rep: R().startRep,
      hosts: { marco: { energy: 90, creativity: 80, mood: 80, xp: 0 }, andrew: { energy: 90, creativity: 85, mood: 85, xp: 0 } },
      hostSkill: { marco: Object.assign({}, D.hosts[0].skills), andrew: Object.assign({}, D.hosts[1].skills) },
      reliab: 70, condition: 80, lots: {}, staff: [], applicants: [], episodes: [], prod: null, topicsUsed: {},
      sponsors: { offers: [], active: null, completed: [], lastOffer: 0 },
      missions: { cur: null, curState: 'offer', prog: {}, start: null, done: [], side: {} },
      story: { chaos: 0, publikum: 0, legende: 0, ending: null, choices: {} },
      unlocks: { guests: false, sponsors: false, hire: false, districts: {} },
      mg: {}, ach: {}, ledger: [], today: S.emptyDay(), stats: { listeners: 0, guests: {}, placed: 0, jobsToday: 0, lastEpisodeDay: 0, episodesToday: 0, repairs: 0, mgWinsTotal: 0, distinctRubrics: {} },
      player: { dist: 'altstudio', x: -75, z: -58, ry: Math.PI }, rel: {}, talkedToday: {}, pending: [], notices: [], flags: {},
      endless: null, challenge: null, ngPlus: !!opt.ngPlus
    };
    D.districts.forEach(d => { st.unlocks.districts[d.id] = !!d.open; });
    const lotDef = D.districts.find(d => d.id === 'altstudio').lot, campDef = D.districts.find(d => d.id === 'campus').lot;
    st.lots.studio = B.applyStartLayout(B.createLot('studio', lotDef.w, lotDef.d, true), D.startLayout);
    st.lots.campus = B.createLot('campus', campDef.w, campDef.d, false);
    if (st.ngPlus) { st.money += 5000; st.rep += 5; }
    if (mode === 'creative') {
      st.money = 9999999; st.fans = 500; st.rep = 50; st.unlocks.guests = st.unlocks.sponsors = st.unlocks.hire = true;
      Object.keys(st.unlocks.districts).forEach(k => { st.unlocks.districts[k] = true; }); st.lots.campus.owned = true; S.baseFloor(st.lots.campus); st.chapter = 6;
    }
    if (mode === 'challenge') {
      const c = D.challenges.find(x => x.id === opt.challenge) || D.challenges[0];
      st.challenge = { id: c.id, endDay: 1 + c.days, done: false, success: false, wins: 0, guests: {} };
      Object.assign(st, { money: c.start.money != null ? c.start.money : st.money, fans: c.start.fans != null ? c.start.fans : st.fans, rep: c.start.rep != null ? c.start.rep : st.rep });
      st.unlocks.guests = st.unlocks.sponsors = st.unlocks.hire = true; st.chapter = 3;
      ['tvstudio', 'festival', 'bahnhof', 'camping'].forEach(k => { st.unlocks.districts[k] = true; });
    }
    if (mode === 'career') { st.chapter = 1; S.refreshMission(st); }
    S.refreshApplicants(st);
    return st;
  };
  S.emptyDay = () => ({ inc: { listen: 0, tail: 0, sponsor: 0, merch: 0, events: 0, jobs: 0, missions: 0 }, exp: { rent: 0, salary: 0, upkeep: 0, repair: 0, build: 0, staff: 0, production: 0, travel: 0 } });
  S.weekday = st => WEEKDAYS[(st.time.day - 1) % 7];
  S.dateText = st => 'Tag ' + st.time.day + ' (' + S.weekday(st) + ') · ' + PT.timeStr(st.time.min);
  S.diffRules = st => R().difficulty[st.diff] || R().difficulty[1];
  S.notice = (st, n) => { st.notices.push(n); if (st.notices.length > 40) st.notices.shift(); };
  S.isCreative = st => st.mode === 'creative';

  // ── Geld ──────────────────────────────────────────────────
  S.spend = function (st, amount, cat) {
    if (S.isCreative(st)) return true;
    st.money -= amount; st.today.exp[cat] = (st.today.exp[cat] || 0) + amount; return true;
  };
  S.earn = function (st, amount, cat) { amount = Math.round(amount); if (!S.isCreative(st)) st.money += amount; st.today.inc[cat] = (st.today.inc[cat] || 0) + amount; return amount; };
  S.canAfford = (st, amount) => amount <= 0 || S.isCreative(st) || st.money >= amount;

  // ── Studio-Werte (aus allen eigenen Grundstücken) ─────────
  S.studio = function (st) {
    const key = Object.keys(st.lots).map(k => st.lots[k].ver + (st.lots[k].owned ? 'o' : '')).join('|');
    if (st._studioKey === key && st._studio) return st._studio;
    const out = { rooms: [], best: {}, count: {}, cats: {}, objs: 0, upkeep: 0, stations: [] };
    Object.keys(st.lots).forEach(k => {
      const lot = st.lots[k]; if (!lot.owned) return;
      const rooms = B.evaluate(lot);
      rooms.forEach(r => { r.lot = k; out.rooms.push(r); if (r.fn && r.valid) { out.count[r.fn] = (out.count[r.fn] || 0) + 1; if (!out.best[r.fn] || r.value > out.best[r.fn].value) out.best[r.fn] = r; } });
      lot.objs.forEach(o => { const d = D.objectById[o.id]; if (!d) return; out.objs++; out.upkeep += d.upkeep; out.cats[d.cat] = (out.cats[d.cat] || 0) + 1; out.stations.push({ lot: k, u: o.u, id: o.id }); });
    });
    Object.defineProperty(st, '_studio', { value: out, enumerable: false, configurable: true, writable: true });
    Object.defineProperty(st, '_studioKey', { value: key, enumerable: false, configurable: true, writable: true });
    return out;
  };
  S.roomValue = (st, fn) => { const r = S.studio(st).best[fn]; return r ? r.value : 0; };
  S.hasRoom = (st, fn) => !!S.studio(st).best[fn];

  // ── Team ──────────────────────────────────────────────────
  S.staffEff = function (st, role) {
    // Summe (Fähigkeit × Stimmung × Arbeitsplatz × Schicht) aller Mitarbeitenden dieser Rolle
    const h = Math.floor(st.time.min / 60);
    return st.staff.filter(s => s.role === role && !s.training).reduce((t, s) => {
      const inShift = s.shift === 'frueh' ? h >= 6 && h < 15 : s.shift === 'spaet' ? h >= 13 && h < 23 : h >= 8 && h < 18;
      const moodF = 0.6 + s.mood / 200, stationF = s.station ? 1 : 0.6;
      return t + s.skill * moodF * stationF * (inShift ? 1 : 0.5);
    }, 0);
  };
  S.refreshApplicants = function (st) {
    const hired = new Set(st.staff.map(s => s.id));
    const list = D.npcs.filter(n => n.hire && !hired.has(n.id)).map(n => ({ id: n.id, name: n.name, role: n.role, skill: n.skill, salary: n.salary, trait: n.trait, npc: true }));
    if ((st.chapter || 1) >= 5 || st.mode !== 'career') {
      const roles = Object.keys(D.roles); const tmp = { seed: PT.hash('app' + st.time.day + st.seed) };
      for (let i = 0; i < 3; i++) {
        const name = PT.pick(tmp, D.applicantNames), role = PT.pick(tmp, roles), skill = PT.randInt(tmp, 3, 8);
        const id = 'a_' + PT.hash(name + st.time.day).toString(36);
        if (!hired.has(id) && !list.find(x => x.name === name) && !st.staff.find(s => s.name === name)) list.push({ id, name, role, skill, salary: 35 + skill * 9, trait: 'Bewerbung', npc: false });
      }
    }
    st.applicants = list;
  };
  S.hire = function (st, appId, shift) {
    if (!st.unlocks.hire && st.mode === 'career') return { ok: false, err: 'Einstellen wird in Mission „Hilfe in der Medienstraße“ freigeschaltet.' };
    const a = st.applicants.find(x => x.id === appId); if (!a) return { ok: false, err: 'Bewerbung nicht gefunden.' };
    const bonus = a.salary * 2; if (!S.canAfford(st, bonus)) return { ok: false, err: 'Nicht genug Geld für die Antrittsprämie (' + PT.money(bonus) + ').' };
    S.spend(st, bonus, 'staff');
    const s = { id: a.id, name: a.name, role: a.role, skill: a.skill, salary: a.salary, mood: 75, shift: shift || 'voll', xp: 0, training: 0, hired: st.time.day, station: null, npc: a.npc };
    st.staff.push(s); st.applicants = st.applicants.filter(x => x.id !== appId);
    S.assignStations(st); st.rel[a.id] = (st.rel[a.id] || 0) + 10;
    S.notice(st, { t: 'good', text: a.name + ' ist jetzt im Team (' + D.roles[a.role].name + ').' });
    S.checkMissions(st); S.checkAch(st);
    return { ok: true };
  };
  S.fire = function (st, id) {
    const s = st.staff.find(x => x.id === id); if (!s) return { ok: false, err: 'Nicht gefunden.' };
    S.spend(st, s.salary * 2, 'staff'); st.staff = st.staff.filter(x => x.id !== id); S.refreshApplicants(st);
    S.notice(st, { t: 'info', text: s.name + ' hat das Team verlassen (Abfindung ' + PT.money(s.salary * 2) + ').' });
    return { ok: true };
  };
  S.setShift = (st, id, shift) => { const s = st.staff.find(x => x.id === id); if (s) s.shift = shift; return { ok: !!s }; };
  S.train = function (st, id) {
    const s = st.staff.find(x => x.id === id); if (!s) return { ok: false, err: 'Nicht gefunden.' };
    if (s.training) return { ok: false, err: s.name + ' ist schon in der Schulung.' };
    if (s.skill >= 10) return { ok: false, err: s.name + ' ist bereits auf Höchststufe.' };
    const cost = R().trainingCost + s.skill * 40; if (!S.canAfford(st, cost)) return { ok: false, err: 'Schulung kostet ' + PT.money(cost) + '.' };
    S.spend(st, cost, 'staff'); s.training = R().trainingDays;
    S.notice(st, { t: 'info', text: s.name + ' ist einen Tag auf Schulung.' }); S.missionEvent(st, { type: 'train' });
    return { ok: true };
  };
  S.assignStations = function (st) {
    const studio = S.studio(st), used = new Set();
    st.staff.forEach(s => { if (s.station && studio.stations.find(x => x.u === s.station)) used.add(s.station); else s.station = null; });
    st.staff.forEach(s => {
      if (s.station) return;
      const want = D.roles[s.role].station; const free = studio.stations.find(x => want.includes(x.id) && !used.has(x.u));
      if (free) { s.station = free.u; s.stationLot = free.lot; used.add(free.u); }
    });
  };

  // ── Zeit und Tagesabschluss ───────────────────────────────
  S.advance = function (st, minutes) {
    const out = [];
    while (minutes > 0) {
      const step = Math.min(minutes, 1440 - st.time.min);
      st.time.min += step; minutes -= step;
      if (st.time.min >= 1440) { st.time.min -= 1440; out.push(S.endDay(st)); }
    }
    return out;
  };
  S.hostSpend = function (st, energy, creativity) {
    ['marco', 'andrew'].forEach(h => { const H = st.hosts[h]; H.energy = clamp(H.energy - energy, 0, 100); H.creativity = clamp(H.creativity - (creativity || 0), 0, 100); });
  };
  S.endDay = function (st) {
    const dr = S.diffRules(st), studio = S.studio(st), day = st.time.day, rep = { day };
    // Ausgaben
    if (!S.isCreative(st)) {
      Object.keys(st.lots).forEach(k => { if (st.lots[k].owned) S.spend(st, Math.round(R().rent[k] * dr.cost), 'rent'); });
      st.staff.forEach(s => S.spend(st, s.salary, 'salary'));
      S.spend(st, Math.round(studio.upkeep * dr.cost), 'upkeep');
    }
    // Nachhören früherer Folgen (Einnahmen nur aus veröffentlichten Folgen)
    st.episodes.forEach(e => {
      const k = day - e.day; if (k < 0 || k >= R().tailDays) return;
      const n = Math.round(e.listeners * R().tailShare[k]); e.total += n; st.stats.listeners += n;
      S.earn(st, n * R().tailRevenue * dr.money, 'tail');
    });
    // Technik und Gebäude
    const tech = S.staffEff(st, 'technik'), repa = S.staffEff(st, 'reparatur');
    st.reliab = clamp(st.reliab - 1.5 + tech * 0.35 + repa * 0.5 + S.roomValue(st, 'werkstatt') * 0.08 + S.roomValue(st, 'lager') * 0.05, 0, 100);
    st.condition = clamp(st.condition - R().conditionDecay + repa * 0.15, 0, 100);
    // Erholung der Hosts
    const kueche = S.roomValue(st, 'kueche'), lounge = S.roomValue(st, 'lounge');
    ['marco', 'andrew'].forEach(h => { const H = st.hosts[h]; H.energy = clamp(H.energy + R().energyNight + kueche * 1.2, 0, 100); H.creativity = clamp(H.creativity + R().creativityNight + lounge * 0.6, 0, 100); H.mood = clamp(H.mood + (kueche ? 3 : -1) + (st.condition < 40 ? -4 : 0), 10, 100); });
    // Team
    st.staff.forEach(s => {
      let dm = (kueche || lounge ? 2 : -1) + (s.station ? 1 : -2) + (s.salary >= s.skill * 10 ? 1 : -2);
      if (st.stats.episodesToday > R().overloadEpisodesPerDay) dm -= 6;
      if (st.money < 0) dm -= 4;
      s.mood = clamp(s.mood + dm, 5, 100);
      if (s.training) { s.training--; if (!s.training) { s.skill = Math.min(10, s.skill + 1); S.notice(st, { t: 'good', text: s.name + ' hat die Schulung abgeschlossen (Stufe ' + s.skill + ').' }); } }
    });
    // Fans verlieren Interesse ohne neue Folgen
    if (st.stats.lastEpisodeDay && day - st.stats.lastEpisodeDay >= R().fanDecayAfterDays) st.fans = Math.max(0, Math.round(st.fans * (1 - R().fanDecay)));
    // Sponsorenangebote
    if ((st.unlocks.sponsors || st.mode !== 'career') && day - st.sponsors.lastOffer >= 3) S.refreshSponsors(st);
    if (day % 7 === 0) S.refreshApplicants(st);
    // Tagesereignis (abhängig von Zuverlässigkeit/Zustand/Schwierigkeit)
    S.rollEvent(st, 'day');
    // Buchhaltung
    const L = st.today; L.day = day; L.money = st.money; L.fans = st.fans; st.ledger.push(L); if (st.ledger.length > 60) st.ledger.shift();
    rep.ledger = L; st.today = S.emptyDay();
    st.time.day++; st.stats.jobsToday = 0; st.stats.episodesToday = 0; st.talkedToday = {};
    if (st.mode === 'career' && st.money < 0) S.notice(st, { t: 'bad', text: 'Das Konto ist im Minus! Nebenjobs in den Bezirken bringen schnell Geld; Ausbauten sind gesperrt, bis wieder Geld da ist.' });
    S.checkChallenge(st); S.checkMissions(st); S.checkAch(st);
    if (st.endless) S.checkEndless(st);
    return rep;
  };
  S.balanceToday = function (st) {
    const L = st.today, inc = Object.values(L.inc).reduce((a, b) => a + b, 0), exp = Object.values(L.exp).reduce((a, b) => a + b, 0);
    const studio = S.studio(st), dr = S.diffRules(st);
    const fixed = Object.keys(st.lots).reduce((t, k) => t + (st.lots[k].owned ? Math.round(R().rent[k] * dr.cost) : 0), 0) + st.staff.reduce((t, s) => t + s.salary, 0) + Math.round(studio.upkeep * dr.cost);
    const tail = st.episodes.reduce((t, e) => { const k = st.time.day - e.day; return t + (k >= 0 && k < R().tailDays ? Math.round(e.listeners * R().tailShare[k]) * R().tailRevenue * dr.money : 0); }, 0);
    return { inc, exp, fixed: S.isCreative(st) ? 0 : fixed, tail: Math.round(tail), expected: Math.round(inc - exp + tail - (S.isCreative(st) ? 0 : fixed)) };
  };

  // ── Bauen (über Befehle mit Rückgängig) ───────────────────
  S.buildCost = function (cmd) {
    if (cmd.t === 'place') return D.objectById[cmd.o.id].cost;
    if (cmd.t === 'wall') return cmd.to === 'none' ? -Math.round((D.buildParts[cmd.from] || { cost: 0 }).cost * 0.5) : D.buildParts[cmd.to].cost - (cmd.from && cmd.from !== 'none' ? Math.round(D.buildParts[cmd.from].cost * 0.5) : 0);
    if (cmd.t === 'floor') return cmd.to ? D.buildParts.floors[cmd.to - 1].cost : -Math.round((D.buildParts.floors[cmd.from - 1] || { cost: 0 }).cost * 0.5);
    return 0;
  };
  S.buildLocked = function (st) {
    if (st.challenge && D.challenges.find(c => c.id === st.challenge.id).rules && D.challenges.find(c => c.id === st.challenge.id).rules.noBuild) return 'In dieser Herausforderung ist Bauen nicht erlaubt.';
    return null;
  };
  /** Führt einen Baubefehl aus (prüft Regeln, bucht Kosten). hist = { undo: [], redo: [] } der Bausitzung. */
  S.build = function (st, lotId, cmd, hist) {
    const lot = st.lots[lotId]; if (!lot) return { ok: false, err: 'Grundstück fehlt.' };
    const lock = S.buildLocked(st); if (lock) return { ok: false, err: lock };
    let chk = { ok: true };
    if (cmd.t === 'place') {
      const d = D.objectById[cmd.o.id]; if (!d) return { ok: false, err: 'Unbekanntes Objekt.' };
      if (st.mode === 'career' && d.unlock > (st.chapter || 1)) return { ok: false, err: 'Wird in Kapitel ' + d.unlock + ' freigeschaltet.' };
      cmd.o.u = cmd.o.u || PT.uid(st, 'o'); chk = B.canPlace(lot, cmd.o);
    } else if (cmd.t === 'remove') {
      const o = lot.objs.find(x => x.u === cmd.u); if (!o) return { ok: false, err: 'Objekt nicht gefunden.' };
      const d = D.objectById[o.id];
      if (d.surface) { const occ = B.occupancy(lot); if (B.cells(o).some(([x, z]) => occ.top[x + ',' + z])) return { ok: false, err: 'Erst die Geräte von der Ablage nehmen.' }; }
      cmd.o = Object.assign({}, o); cmd.cost = -Math.round(d.cost * R().sellRefund);
    } else if (cmd.t === 'move') {
      const o = lot.objs.find(x => x.u === cmd.u); if (!o) return { ok: false, err: 'Objekt nicht gefunden.' };
      const d = D.objectById[o.id];
      if (d.surface) { const occ = B.occupancy(lot); if (B.cells(o).some(([x, z]) => occ.top[x + ',' + z])) return { ok: false, err: 'Erst die Geräte von der Ablage nehmen.' }; }
      cmd.from = { x: o.x, z: o.z, r: o.r }; chk = B.canPlace(lot, { id: o.id, x: cmd.to.x, z: cmd.to.z, r: cmd.to.r }, o.u); cmd.cost = 0;
    } else if (cmd.t === 'wall') {
      cmd.from = lot.walls[cmd.k] || 'none'; if (cmd.from === cmd.to) return { ok: false, err: 'Hier ist das schon.' };
      chk = B.canWall(lot, cmd.k, cmd.to);
    } else if (cmd.t === 'floor') {
      if (!B.inLot(lot, cmd.x, cmd.z)) return { ok: false, err: 'Außerhalb des Grundstücks.' };
      cmd.from = lot.floor[B.idx(lot, cmd.x, cmd.z)]; if (cmd.from === cmd.to) return { ok: false, err: 'Hier liegt schon dieser Boden.' };
      chk = B.canFloor(lot, cmd.x, cmd.z, cmd.to);
    } else if (cmd.t === 'roomfn') {
      const rooms = B.withRoomFn(lot, cmd.x, cmd.z, cmd.fn); if (!rooms) return { ok: false, err: 'Dort ist kein Raum (erst Boden legen).' };
      cmd = { t: 'rooms', to: rooms, from: lot.rooms.map(a => Object.assign({}, a)), cost: 0 };
    }
    if (!chk.ok) return chk;
    if (cmd.cost == null) cmd.cost = S.buildCost(cmd);
    if (cmd.cost > 0 && !S.canAfford(st, cmd.cost)) return { ok: false, err: 'Nicht genug Geld (' + PT.money(cmd.cost) + ').' };
    B.apply(lot, cmd);
    if (cmd.cost > 0) S.spend(st, cmd.cost, 'build'); else if (cmd.cost < 0) S.earn(st, -cmd.cost, 'events');
    if (cmd.t === 'place') st.stats.placed++;
    if (hist) { hist.undo.push({ lot: lotId, cmd }); if (hist.undo.length > 60) hist.undo.shift(); hist.redo.length = 0; }
    S.assignStations(st); S.checkMissions(st); S.checkAch(st);
    return { ok: true, cmd };
  };
  S.undo = function (st, hist, redo) {
    const from = redo ? hist.redo : hist.undo, to = redo ? hist.undo : hist.redo;
    const e = from.pop(); if (!e) return { ok: false, err: redo ? 'Nichts zum Wiederholen.' : 'Nichts zum Rückgängigmachen.' };
    const inv = redo ? e.cmd : B.invert(e.cmd), lot = st.lots[e.lot];
    // Rückgängig darf keine ungültigen Zustände erzeugen (z. B. Objekt auf inzwischen belegtem Platz)
    if (inv.t === 'place') { const c = B.canPlace(lot, inv.o); if (!c.ok) { from.push(e); return c; } }
    if (inv.t === 'move') { const o = lot.objs.find(x => x.u === inv.u); if (!o) { return { ok: false, err: 'Objekt nicht mehr vorhanden.' }; } const c = B.canPlace(lot, { id: o.id, x: inv.to.x, z: inv.to.z, r: inv.to.r }, o.u); if (!c.ok) { from.push(e); return c; } }
    const cost = redo ? e.cmd.cost : -e.cmd.cost;
    if (cost > 0 && !S.canAfford(st, cost)) { from.push(e); return { ok: false, err: 'Nicht genug Geld.' }; }
    B.apply(lot, inv);
    if (cost > 0) S.spend(st, cost, 'build'); else if (cost < 0) S.earn(st, -cost, 'events');
    to.push(e); S.assignStations(st); S.checkMissions(st);
    return { ok: true };
  };
  S.baseFloor = lot => { for (let z = 2; z < lot.d - 2; z++) for (let x = 2; x < lot.w - 2; x++) if (!lot.floor[B.idx(lot, x, z)]) lot.floor[B.idx(lot, x, z)] = 5; lot.ver++; };
  S.lotPrice = lotId => lotId === 'campus' ? 6000 : 0;
  S.buyLot = function (st, lotId) {
    const lot = st.lots[lotId]; if (!lot || lot.owned) return { ok: false, err: 'Nicht verfügbar.' };
    if (st.mode === 'career' && !st.flags['lot:' + lotId]) return { ok: false, err: 'Das Grundstück ist noch nicht freigegeben.' };
    const p = S.lotPrice(lotId); if (!S.canAfford(st, p)) return { ok: false, err: 'Pacht-Kaution: ' + PT.money(p) + '.' };
    S.spend(st, p, 'build'); lot.owned = true; lot.ver++;
    // Grundausstattung: Boden auf der halben Fläche, damit sofort gebaut werden kann
    S.baseFloor(lot);
    S.notice(st, { t: 'good', text: 'Das Campus-Grundstück gehört jetzt euch!' });
    S.missionEvent(st, { type: 'unlock', lot: lotId }); return { ok: true };
  };

  // ── Reparatur (Anti-Softlock: Grundreparatur ist gratis) ──
  S.repairQuote = function (st) {
    const missing = Math.max(0, 100 - st.reliab), w = S.hasRoom(st, 'werkstatt') ? 0.7 : 1, r = Math.max(0.5, 1 - S.staffEff(st, 'reparatur') * 0.04);
    return { free: st.reliab < R().reliabRepairFree, freeTo: R().reliabRepairFree + 10, cost: Math.round(missing * R().repairCostPerPoint * w * r * S.diffRules(st).cost) };
  };
  S.repair = function (st, full) {
    const q = S.repairQuote(st);
    if (!full) { if (!q.free) return { ok: false, err: 'Die Gratis-Grundreparatur gibt es, wenn die Zuverlässigkeit unter ' + R().reliabRepairFree + ' % liegt.' }; st.reliab = q.freeTo; }
    else { if (!S.canAfford(st, q.cost)) return { ok: false, err: 'Reparatur kostet ' + PT.money(q.cost) + '.' }; S.spend(st, q.cost, 'repair'); st.reliab = 100; }
    st.stats.repairs++; S.notice(st, { t: 'good', text: 'Technik repariert (Zuverlässigkeit ' + Math.round(st.reliab) + ' %).' });
    S.missionEvent(st, { type: 'repair' }); return { ok: true };
  };
  S.renovate = function (st) {
    const cost = Math.round((100 - st.condition) * R().conditionCostPerPoint); if (cost <= 0) return { ok: false, err: 'Das Gebäude ist top in Schuss.' };
    if (!S.canAfford(st, cost)) return { ok: false, err: 'Renovierung kostet ' + PT.money(cost) + '.' };
    S.spend(st, cost, 'repair'); st.condition = 100; return { ok: true };
  };

  // ── Themen und Trends ─────────────────────────────────────
  S.trend = function (st, topic, day) {
    day = day || st.time.day; const t = topic.trend;
    let v = 1;
    if (t.kind === 'welle') v = 0.78 + 0.72 * Math.exp(-Math.pow((day - t.peak) / t.width, 2));
    else if (t.kind === 'saison') v = 0.88 + 0.3 * Math.cos(2 * Math.PI * (day - t.peak) / 60);
    const uses = st.topicsUsed[topic.id] || 0;
    return { value: v * Math.pow(0.72, uses), raw: v, uses };
  };
  S.topicsFor = st => D.topics.filter(t => !st.challenge || !D.challenges.find(c => c.id === st.challenge.id).rules || !D.challenges.find(c => c.id === st.challenge.id).rules.onlyRubric || t.rubric === D.challenges.find(c => c.id === st.challenge.id).rules.onlyRubric);
  S.guestAvailable = function (st, g) {
    if (!st.unlocks.guests && st.mode === 'career') return { ok: false, why: 'Gäste ab Ende von Kapitel 1' };
    if (st.rep < g.need.rep) return { ok: false, why: 'Braucht Ruf ' + g.need.rep };
    if (g.need.lounge && !S.hasRoom(st, 'lounge')) return { ok: false, why: 'Braucht eine Gäste-Lounge' };
    return { ok: true };
  };
  S.guestFee = (st, g) => Math.round(g.fee * Math.max(0.6, 1 - S.staffEff(st, 'booking') * 0.03));

  // ── Produktion: endlicher Zustandsautomat ─────────────────
  const need = (st, stage) => { if (!st.prod) return 'Keine Produktion offen.'; if (st.prod.stage !== stage) return 'Falscher Schritt (' + S.STAGE_NAMES[st.prod.stage] + ' ist dran).'; return null; };
  S.canProduce = function (st) {
    if (st.prod) return { ok: false, err: 'Eine Folge ist schon in Arbeit.' };
    if (!S.hasRoom(st, 'aufnahme')) return { ok: false, err: 'Ihr braucht einen gültigen Aufnahmeraum (2 Mikrofone, 2 Sitzplätze, Wände rundum).' };
    const avgE = (st.hosts.marco.energy + st.hosts.andrew.energy) / 2; if (avgE < 15) return { ok: false, err: 'Marco und Andrew sind zu erschöpft. Morgen geht es weiter (Zeit vorspulen) – oder Kaffee!' };
    return { ok: true };
  };
  S.prodStart = function (st) { const c = S.canProduce(st); if (!c.ok) return c; st.prod = { stage: 'plan', id: null, scores: {}, q: {}, log: [], costs: 0, day: st.time.day }; return { ok: true }; };
  S.prodCancel = function (st) { if (!st.prod) return { ok: false }; st.prod = null; S.notice(st, { t: 'info', text: 'Produktion abgebrochen. Bereits bezahlte Kosten bleiben gebucht.' }); return { ok: true }; };
  S.formatById = id => D.formats.find(f => f.id === id) || D.formats[1];
  S.validatePlan = function (st, p) {
    const topic = D.topics.find(t => t.id === p.topic); if (!topic) return 'Bitte ein Thema wählen.';
    if (!S.topicsFor(st).includes(topic)) return 'Dieses Thema ist in der Herausforderung nicht erlaubt.';
    const f = S.formatById(p.format), segs = p.segments || [];
    if (segs.length < f.segments[0] || segs.length > f.segments[1]) return 'Für „' + f.name + '“ braucht ihr ' + f.segments[0] + '–' + f.segments[1] + ' Rubriken-Blöcke.';
    if (segs.some(s => !D.rubrics.find(r => r.id === s))) return 'Unbekannte Rubrik.';
    if (p.guest) { const g = D.guests.find(x => x.id === p.guest); if (!g) return 'Unbekannter Gast.'; const a = S.guestAvailable(st, g); if (!a.ok) return g.name + ': ' + a.why; }
    if (p.video && !S.hasRoom(st, 'tvbuehne')) return 'Für Videofolgen braucht ihr eine TV-Bühne.';
    if (!D.slots.find(s => s.id === p.slot)) return 'Bitte einen Veröffentlichungszeitpunkt wählen.';
    return null;
  };
  S.prodPlan = function (st, p) {
    const e = need(st, 'plan'); if (e) return { ok: false, err: e };
    const err = S.validatePlan(st, p); if (err) return { ok: false, err };
    const f = S.formatById(p.format), broke = st.money < f.cost && st.mode === 'career';
    const cost = broke && f.id === 'kurz' ? 0 : f.cost; // Sparfolge: Kurzfolge geht auch ohne Geld (Anti-Softlock)
    if (!S.canAfford(st, cost)) return { ok: false, err: 'Zu wenig Geld für dieses Format – eine Kurzfolge geht immer.' };
    S.spend(st, cost, 'production'); st.prod.costs += cost;
    st.prod.plan = { topic: p.topic, segments: p.segments.slice(), guest: p.guest || null, format: f.id, slot: p.slot, video: !!p.video, lead: p.lead === 'andrew' ? 'andrew' : p.lead === 'both' ? 'both' : 'marco' };
    const topic = D.topics.find(t => t.id === p.topic), g = p.guest && D.guests.find(x => x.id === p.guest);
    // Planungswert 0..15: Thema passt zu Blöcken, Format, Gast, Moderation
    let plan = 0;
    if (p.segments.includes(topic.rubric)) plan += 5;
    if (new Set(p.segments).size === p.segments.length) plan += 2; else plan -= 1;
    if (g) plan += g.fit.includes(topic.rubric) ? 4 : topic.tags.some(t => g.fit.includes(t)) ? 2 : -1;
    else plan += 1;
    const lead = st.prod.plan.lead === 'both' ? (st.hostSkill.marco[topic.rubric] + st.hostSkill.andrew[topic.rubric]) / 2 : st.hostSkill[st.prod.plan.lead][topic.rubric];
    plan += clamp((lead - 4) * 0.8, 0, 4);
    st.prod.q.plan = clamp(Math.round(plan), 0, 15);
    st.prod.stage = 'research'; return { ok: true };
  };
  S.prodResearch = function (st, depth, mgScore) {
    const e = need(st, 'research'); if (e) return { ok: false, err: e };
    depth = clamp(depth | 0, 0, 2);
    const topic = D.topics.find(t => t.id === st.prod.plan.topic);
    const pts = S.roomValue(st, 'redaktion') * 0.45 + S.staffEff(st, 'redaktion') * 1.3 + depth * 3 + 2 + (mgScore ? mgScore / 18 : 0);
    st.prod.q.research = clamp(Math.round(15 * Math.min(1, pts / (8 + topic.research * 4))), 0, 15);
    st.prod.research = { depth, pts: PT.round(pts, 1), mg: mgScore || 0 };
    S.advance(st, [30, 60, 120][depth]); S.hostSpend(st, [4, 7, 12][depth], [3, 5, 8][depth]);
    if (topic.rubric === 'serious15' && depth === 2) st.story.legende += 0.3;
    st.prod.stage = 'team'; return { ok: true };
  };
  S.prodTeam = function (st, rapportScore) {
    const e = need(st, 'team'); if (e) return { ok: false, err: e };
    const p = st.prod.plan; let guestMood = 0;
    if (p.guest) {
      const g = D.guests.find(x => x.id === p.guest), fee = S.guestFee(st, g);
      if (!S.canAfford(st, fee)) return { ok: false, err: 'Die Gage für ' + g.name + ' (' + PT.money(fee) + ') ist nicht bezahlbar. Ohne Gast weiter?' };
      S.spend(st, fee, 'production'); st.prod.costs += fee;
      guestMood = 55 + S.roomValue(st, 'lounge') * 1.5 + (rapportScore ? (rapportScore - 50) * 0.5 : 0);
      st.prod.guestMood = clamp(Math.round(guestMood), 0, 100);
    }
    st.prod.team = st.staff.filter(s => !s.training).map(s => s.id);
    st.prod.stage = 'tech'; return { ok: true };
  };
  S.prodDropGuest = function (st) { if (st.prod && st.prod.plan) { st.prod.plan.guest = null; return { ok: true }; } return { ok: false }; };
  /** Technikcheck: deterministische Pannenwahrscheinlichkeit aus Zuverlässigkeit, Technik-Team und Schwierigkeit. */
  S.prodTech = function (st) {
    const e = need(st, 'tech'); if (e) return { ok: false, err: e };
    if (st.prod.tech) return { ok: true, tech: st.prod.tech };
    const chance = clamp((100 - st.reliab) / 120 * S.diffRules(st).chaos - S.staffEff(st, 'technik') * 0.02, 0.03, 0.85);
    const roll = PT.rand(st), fault = roll < chance;
    const parts = ['Mikrofonkabel', 'Audiointerface', 'Kopfhörerverstärker', 'Netzteil', 'Mischpult-Kanal'];
    st.prod.tech = { chance: PT.round(chance, 2), fault, part: fault ? PT.pick(st, parts) : null, resolved: !fault, penalty: 0 };
    return { ok: true, tech: st.prod.tech };
  };
  S.prodTechResolve = function (st, how, mgWon) {
    const e = need(st, 'tech'); if (e) return { ok: false, err: e };
    const T = st.prod.tech; if (!T) return { ok: false, err: 'Erst den Technikcheck starten.' };
    if (T.fault && !T.resolved) {
      if (how === 'minigame') { T.penalty = mgWon ? 0 : 4; T.resolved = true; if (mgWon) st.reliab = clamp(st.reliab + 6, 0, 100); }
      else if (how === 'pay') { const c = 120; if (!S.canAfford(st, c)) return { ok: false, err: 'Zu wenig Geld.' }; S.spend(st, c, 'repair'); T.resolved = true; T.penalty = 0; }
      else { T.resolved = true; T.penalty = 7; st.story.chaos += 0.5; }
    }
    st.prod.stage = 'record'; S.prodRollRecordEvent(st); return { ok: true };
  };
  S.prodRollRecordEvent = function (st) { const ev = S.rollEvent(st, 'record'); if (ev) st.prod.event = ev.id; };
  // Dialogmomente in der Aufnahme: je Rubrik drei Weichen, Wirkung auf Qualität und Story
  S.recordBeats = function (st) {
    const p = st.prod.plan, topic = D.topics.find(t => t.id === p.topic), g = p.guest && D.guests.find(x => x.id === p.guest);
    const host = p.lead === 'andrew' ? 'Andrew' : 'Marco';
    const beats = [
      { q: host + ' eröffnet mit „' + topic.title + '“. Wie steigt ihr ein?', o: [
        { t: 'Mit einer persönlichen Anekdote', fx: topic.rubric === 'wenig' || topic.rubric === 'feelgood' ? 3 : 1, story: 'publikum' },
        { t: 'Mit einer überraschenden Zahl', fx: topic.rubric === 'tec' || topic.rubric === 'serious15' ? 3 : 1, story: 'legende' },
        { t: 'Mit einem spontanen Gag', fx: topic.rubric === 'serious15' ? -2 : 2, story: 'chaos' }] },
      { q: g ? g.name + ' sagt: „' + g.line + '“ Wie reagiert ihr?' : 'Mitten im Thema verhaspelt sich ' + host + '. Was jetzt?', o: g ? [
        { t: 'Nachfragen und zuhören', fx: 3, story: 'legende' }, { t: 'Mitlachen und weiterspinnen', fx: g.arche === 'comedian' ? 4 : 1, story: 'publikum' }, { t: 'Zum nächsten Punkt springen', fx: -1, story: 'chaos' }] : [
        { t: 'Kurz lachen, neu ansetzen', fx: 2, story: 'publikum' }, { t: 'Einfach weiterreden', fx: 0, story: 'chaos' }, { t: 'Sauber wiederholen für den Schnitt', fx: 2, story: 'legende' }] },
      { q: 'Zum Schluss: Welche Botschaft nehmt ihr mit?', o: [
        { t: 'Eine klare Zusammenfassung', fx: topic.rubric === 'serious15' ? 4 : 2, story: 'legende' }, { t: 'Ein Aufruf an die Hörer', fx: 2, story: 'publikum' }, { t: 'Ein Cliffhanger für die nächste Folge', fx: topic.rubric === 'tv' ? 4 : 1, story: 'chaos' }] }
    ];
    return beats;
  };
  S.prodRecord = function (st, res) {
    const e = need(st, 'record'); if (e) return { ok: false, err: e };
    if (st.prod.event) return { ok: false, err: 'Zuerst das Ereignis im Studio klären.' };
    res = res || {};
    let score;
    if (res.auto) score = clamp(38 + S.staffEff(st, 'technik') * 2.5 + S.trainBonus(st, 'produktion'), 0, 68);
    else score = clamp(res.score | 0, 0, 100);
    const beats = S.recordBeats(st); let fx = 0;
    (res.choices || [0, 0, 0]).forEach((c, i) => { const o = beats[i] && beats[i].o[c]; if (o) { fx += o.fx; st.story[o.story] += 0.25; } });
    st.prod.q.record = clamp(Math.round(score / 6 + fx * 0.4), 0, 20); st.prod.recordScore = score; st.prod.dialogue = fx;
    const f = S.formatById(st.prod.plan.format);
    S.advance(st, f.minutes + 15); S.hostSpend(st, f.energy, 10);
    // Verschleiß: jede Aufnahme belastet die Technik (Technik-Team bremst ihn)
    st.reliab = clamp(st.reliab - R().reliabWearPerEpisode * 0.5 * S.diffRules(st).chaos * Math.max(0.4, 1 - S.staffEff(st, 'technik') * 0.06), 0, 100);
    ['marco', 'andrew'].forEach(h => { st.hosts[h].xp += 10; });
    st.prod.stage = 'edit'; return { ok: true };
  };
  /** Schnitt: editScore aus dem Mehrspur-Editor (echte Bearbeitungen) oder automatisch durch das Schnitt-Team. */
  S.prodEdit = function (st, res) {
    const e = need(st, 'edit'); if (e) return { ok: false, err: e };
    res = res || {}; let score;
    const cut = S.staffEff(st, 'schnitt');
    if (res.auto) score = cut > 0 ? clamp(42 + cut * 4, 0, 85) : 32;
    else score = clamp(res.score | 0, 0, 100);
    st.prod.editScore = score; st.prod.editDetail = res.detail || (res.auto ? (cut > 0 ? 'Automatisch vom Schnitt-Team geschnitten' : 'Schnell-Schnitt ohne Schnitt-Team') : '');
    st.prod.q.edit = clamp(Math.round(score / 6 + (S.hasRoom(st, 'regie') ? 2 + Math.min(2, S.roomValue(st, 'regie') / 10) : 0)), 0, 20);
    S.advance(st, res.auto ? 60 : 30 + S.formatById(st.prod.plan.format).minutes);
    st.prod.stage = 'package'; return { ok: true };
  };
  S.titleSuggestions = function (st) {
    const p = st.prod.plan, topic = D.topics.find(t => t.id === p.topic), g = p.guest && D.guests.find(x => x.id === p.guest);
    const n = st.episodes.length + 1;
    return ['#' + n + ' ' + topic.title, topic.title + (g ? ' – mit ' + g.name : ''), '#' + n + ' ' + D.rubrics.find(r => r.id === topic.rubric).short + ': ' + topic.title];
  };
  S.prodPackage = function (st, pk) {
    const e = need(st, 'package'); if (e) return { ok: false, err: e };
    pk = pk || {};
    const cover = D.covers.find(c => c.id === pk.cover) || D.covers[0], teaser = D.teasers.find(t => t.id === pk.teaser) || D.teasers[0];
    if (teaser.needCat && !(S.studio(st).cats[teaser.needCat] > 0)) return { ok: false, err: teaser.name + ': braucht eine Kamera im Studio.' };
    if (teaser.needChapter && st.mode === 'career' && (st.chapter || 1) < teaser.needChapter) return { ok: false, err: 'Fan-Aktionen ab Kapitel ' + teaser.needChapter + '.' };
    const cost = cover.cost + teaser.cost; if (!S.canAfford(st, cost)) return { ok: false, err: 'Zu wenig Geld für Cover und Teaser.' };
    S.spend(st, cost, 'production'); st.prod.costs += cost;
    let title = String(pk.title || '').trim().slice(0, 80); if (!title) title = S.titleSuggestions(st)[0];
    st.prod.pack = { title, cover: cover.id, teaser: teaser.id, accent: pk.accent || cover.colors[1], icon: pk.icon || D.rubrics.find(r => r.id === D.topics.find(t => t.id === st.prod.plan.topic).rubric).icon };
    st.prod.stage = 'publish'; S.prodRollPublishEvent(st); return { ok: true };
  };
  S.prodRollPublishEvent = function (st) { const ev = S.rollEvent(st, 'publish'); if (ev) st.prod.event = ev.id; };

  /** Qualitätsteile (0..100 gesamt). Werte sind nachvollziehbar und erscheinen im Bericht. */
  S.qualityParts = function (st) {
    const P = st.prod, p = P.plan, topic = D.topics.find(t => t.id === p.topic);
    const q = Object.assign({ plan: 0, research: 0, edit: 0, record: 0 }, P.q);
    const auf = S.roomValue(st, 'aufnahme'), tvv = S.roomValue(st, 'tvbuehne');
    let tech = 14 * Math.min(1, auf / (30 + topic.tech * 14)) + st.reliab / 100 * 4 + (S.hasRoom(st, 'regie') ? 2 : 0);
    if (p.video) tech = tech * 0.7 + 6 * Math.min(1, (tvv + S.staffEff(st, 'kamera') * 2) / 25);
    tech -= (P.tech && P.tech.penalty) || 0;
    q.tech = clamp(Math.round(tech), 0, 20);
    const H = st.hosts, en = (H.marco.energy + H.andrew.energy) / 200, cr = (H.marco.creativity + H.andrew.creativity) / 200, mo = (H.marco.mood + H.andrew.mood) / 200;
    q.hosts = clamp(Math.round((en * 5 + cr * 5) * (0.7 + mo * 0.3)), 0, 10);
    q.events = Math.round(P.qualityDelta || 0);
    q.total = clamp(q.plan + q.research + q.tech + q.record + q.edit + q.hosts + q.events, 0, 100);
    return q;
  };
  S.prodPublish = function (st) {
    const e = need(st, 'publish'); if (e) return { ok: false, err: e };
    if (st.prod.event) return { ok: false, err: 'Zuerst das Ereignis klären.' };
    const P = st.prod, p = P.plan, topic = D.topics.find(t => t.id === p.topic), rub = D.rubrics.find(r => r.id === topic.rubric);
    const g = p.guest && D.guests.find(x => x.id === p.guest), f = S.formatById(p.format), slot = D.slots.find(s => s.id === p.slot);
    const cover = D.covers.find(c => c.id === P.pack.cover), teaser = D.teasers.find(t => t.id === P.pack.teaser), dr = S.diffRules(st);
    const q = S.qualityParts(st), Q = q.total, tr = S.trend(st, topic);
    // Zeitpunkt: auf den gewählten Slot vorspulen (nächster Termin)
    const target = slot.hour * 60; if (st.time.min < target) S.advance(st, target - st.time.min); else S.advance(st, 1440 - st.time.min + target);
    const wk = S.weekday(st), weekend = wk === 'Sa' || wk === 'So';
    const reach = cover.reach + teaser.reach + S.roomValue(st, 'social') * 0.004 + S.staffEff(st, 'social') * 0.012 + (P.reachDelta || 0) + (teaser.id === 'video' ? S.staffEff(st, 'kamera') * 0.005 : 0) + (PT.Radio ? PT.Radio.promoReach(st) : 0); // Radio-Werbung (src/sim/radio.js)
    const base = 40 + 3 * Math.pow(st.fans, 0.8) + (g ? g.fame * 25 : 0);
    const qf = 0.25 + Math.pow(Q / 100, 1.3) * 1.5;
    const listeners = Math.max(5, Math.round(base * qf * tr.value * rub.pop * D.audiences[topic.aud].mult * slot.mult * (weekend ? 1.08 : 1) * f.reach * dr.listeners * (1 + Math.max(-0.3, reach)) * (0.8 + st.rep / 250) * (p.video ? 1.2 : 1)));
    const revenue = S.earn(st, listeners * R().revenuePerListener * dr.money, 'listen');
    let fansGain = Math.round(listeners * R().fanConversion * (0.4 + Q / 100));
    if (Q < 30) fansGain = -Math.round(st.fans * 0.02);
    st.fans = Math.max(0, st.fans + fansGain);
    let merch = 0;
    if (S.hasRoom(st, 'shop')) merch = S.earn(st, st.fans * R().merchPerFan * (S.roomValue(st, 'shop') / 10) * dr.money, 'merch');
    const repDelta = Math.round((Q - 55) / 12 * (Q >= 55 ? 1 - st.rep / 110 : 1)) + (topic.rubric === 'serious15' && q.research >= 12 && st.rep < 90 ? 1 : 0);
    st.rep = clamp(st.rep + repDelta, 0, 100);
    // Sponsor
    let sponsorPay = 0, sponsorNote = null; const sp = st.sponsors.active;
    if (sp) {
      const def = D.sponsors.find(x => x.id === sp.id), gl = def.goal;
      const ok = Q >= (gl.minQ || 0) && (!gl.rubric || topic.rubric === gl.rubric) && (!gl.video || p.video) && (!gl.tag || topic.tags.includes(gl.tag) || (g && (g.arche === gl.tag || (gl.tag === 'camping' && g.arche === 'camper') || (gl.tag === 'bahn' && g.arche === 'bahnexpertin'))));
      if (ok) { sponsorPay = S.earn(st, def.perEpisode * dr.money, 'sponsor'); sp.done++; sponsorNote = def.name + ': Ziel erfüllt (+' + PT.money(sponsorPay) + ')'; }
      else { sp.missed++; sponsorNote = def.name + ': Ziel verfehlt (' + def.desc + ')'; }
      sp.left--;
      if (sp.left <= 0) S.sponsorEnd(st);
    }
    const id = 'E' + String(st.episodes.length + 1).padStart(3, '0');
    const sat = clamp(Math.round(Q * 0.75 + (P.guestMood != null ? P.guestMood * 0.15 : 10) + (tr.uses ? -5 : 5)), 0, 100);
    const stars = Q >= 85 ? 5 : Q >= 70 ? 4 : Q >= 50 ? 3 : Q >= 30 ? 2 : 1;
    const tier = Q >= 80 ? 'top' : Q >= 60 ? 'good' : Q >= 40 ? 'ok' : 'bad';
    const cm = PT.shuffle(st, D.comments[tier]).slice(0, 3);
    const ep = {
      id, n: st.episodes.length + 1, title: P.pack.title, day: st.time.day, topic: topic.id, rubric: topic.rubric, segments: p.segments.slice(), guest: p.guest, format: f.id, slot: slot.id, video: p.video,
      cover: P.pack.cover, accent: P.pack.accent, icon: P.pack.icon, teaser: teaser.id, cost: P.costs, q: Q, parts: q, recordScore: P.recordScore, editScore: P.editScore, editDetail: P.editDetail,
      listeners, total: listeners, revenue, merch, sponsor: sponsorPay, fans: fansGain, rep: repDelta, sat, stars, comments: cm, status: 'veröffentlicht', trend: PT.round(tr.value, 2)
    };
    st.episodes.push(ep); st.stats.listeners += listeners; st.stats.lastEpisodeDay = st.time.day; st.stats.episodesToday++;
    st.stats.distinctRubrics[topic.rubric] = true; st.topicsUsed[topic.id] = (st.topicsUsed[topic.id] || 0) + 1;
    if (g) { st.stats.guests[g.id] = true; if (st.challenge) st.challenge.guests[g.id] = true; }
    // Hosts lernen in der Rubrik dazu
    ['marco', 'andrew'].forEach(h => { st.hostSkill[h][topic.rubric] = Math.min(10, PT.round(st.hostSkill[h][topic.rubric] + 0.2, 2)); st.hosts[h].xp += 15; });
    if (Q >= 80) st.story.legende += 0.3; if (fansGain > 50) st.story.publikum += 0.2;
    const radio = PT.Radio ? PT.Radio.consumePromo(st) : null; if (radio) ep.radio = radio.pct; // Radiohörer werden Podcast-Fans
    P.report = { ep, q, listeners, revenue, merch, fansGain, repDelta, sponsorNote, reach: PT.round(reach, 2), trend: tr, base: Math.round(base), qf: PT.round(qf, 2), weekend, radio };
    P.stage = 'report';
    S.missionEvent(st, { type: 'publish', ep, topic, guest: g }); if (teaser.id !== 'none') S.missionEvent(st, { type: 'teaser' });
    S.checkAch(st);
    return { ok: true, report: P.report };
  };
  S.prodFinish = function (st) { if (!st.prod || st.prod.stage !== 'report') return { ok: false }; st.prod = null; S.checkMissions(st); return { ok: true }; };

  // ── Sponsoren ─────────────────────────────────────────────
  S.refreshSponsors = function (st) {
    st.sponsors.lastOffer = st.time.day;
    const avail = D.sponsors.filter(s => st.fans >= s.minFans && !(st.sponsors.active && st.sponsors.active.id === s.id));
    const tmp = { seed: PT.hash('sp' + st.time.day + st.seed) };
    st.sponsors.offers = PT.shuffle(tmp, avail).slice(0, 2).map(s => s.id);
  };
  S.sponsorAccept = function (st, id) {
    if (!st.unlocks.sponsors && st.mode === 'career') return { ok: false, err: 'Sponsoren ab Ende von Kapitel 1.' };
    if (st.sponsors.active) return { ok: false, err: 'Es läuft schon ein Vertrag.' };
    if (!st.sponsors.offers.includes(id)) return { ok: false, err: 'Angebot nicht verfügbar.' };
    const d = D.sponsors.find(s => s.id === id);
    st.sponsors.active = { id, left: d.episodes, done: 0, missed: 0, start: st.time.day };
    st.sponsors.offers = st.sponsors.offers.filter(x => x !== id);
    S.notice(st, { t: 'good', text: 'Vertrag mit ' + d.name + ' unterschrieben.' });
    S.missionEvent(st, { type: 'sponsor', state: 'accept' }); return { ok: true };
  };
  S.sponsorEnd = function (st) {
    const sp = st.sponsors.active, d = D.sponsors.find(s => s.id === sp.id), dr = S.diffRules(st);
    const success = sp.done >= Math.ceil(d.episodes * 0.67);
    if (success) { S.earn(st, d.bonus * dr.money, 'sponsor'); st.sponsors.completed.push(d.id); st.rep = clamp(st.rep + 2, 0, 100); S.notice(st, { t: 'good', text: d.name + ': Vertrag erfüllt! Bonus ' + PT.money(d.bonus * dr.money) + '.' }); S.missionEvent(st, { type: 'sponsor', state: 'complete' }); st.ach.sponsor = st.ach.sponsor || st.time.day; }
    else { if (d.malus) S.spend(st, d.malus, 'production'); st.rep = clamp(st.rep - 2, 0, 100); S.notice(st, { t: 'bad', text: d.name + ': Vertrag verfehlt' + (d.malus ? ' (Vertragsstrafe ' + PT.money(d.malus) + ').' : '.') }); }
    st.sponsors.active = null;
  };

  // ── Ereignisse ────────────────────────────────────────────
  S.rollEvent = function (st, when) {
    if (st.pending.length > 3) return null;
    const dr = S.diffRules(st), ch = st.challenge && D.challenges.find(c => c.id === st.challenge.id);
    const mult = dr.chaos * (ch && ch.rules && ch.rules.chaos ? ch.rules.chaos : 1);
    let chance = when === 'day' ? 0.22 : when === 'record' ? 0.12 + (100 - st.reliab) / 400 : 0.08;
    chance = clamp(chance * mult + (100 - st.condition) / 600, 0, 0.8);
    if (st.mode === 'career' && st.time.day < 3) chance *= 0.3; // ruhiger Einstieg
    if (PT.rand(st) >= chance) return null;
    const P = st.prod;
    const pool = D.events.filter(e => e.when === when && (!e.needGuest || (P && P.plan && P.plan.guest)) && (!e.needVideo || (P && P.plan && P.plan.video)) && (!e.needEpisode || st.episodes.length));
    if (!pool.length) return null;
    const ev = PT.pick(st, pool);
    if (when === 'day') st.pending.push(ev.id);
    return ev;
  };
  /** Wendet eine Ereignis-Entscheidung an. mgResult = { won } wenn die Entscheidung ein Minispiel war. */
  S.eventChoose = function (st, evId, idx, mgResult) {
    const ev = D.events.find(e => e.id === evId); if (!ev) return { ok: false };
    const c = ev.choices[idx]; if (!c) return { ok: false };
    const fx = c.mg ? (mgResult && mgResult.won ? c.win : c.lose) : c.effect;
    S.applyEffect(st, fx || {});
    if (st.prod && st.prod.event === evId) st.prod.event = null;
    st.pending = st.pending.filter(x => x !== evId);
    return { ok: true, fx };
  };
  S.applyEffect = function (st, fx) {
    if (fx.money) { if (fx.money < 0) S.spend(st, -fx.money, 'repair'); else S.earn(st, fx.money, 'events'); }
    if (fx.fans) st.fans = Math.max(0, st.fans + fx.fans);
    if (fx.rep) st.rep = clamp(st.rep + fx.rep, 0, 100);
    if (fx.reliab) st.reliab = clamp(st.reliab + fx.reliab, 0, 100);
    if (fx.condition) st.condition = clamp(st.condition + fx.condition, 0, 100);
    if (fx.energy) ['marco', 'andrew'].forEach(h => { st.hosts[h].energy = clamp(st.hosts[h].energy + fx.energy, 0, 100); });
    if (fx.mood) st.staff.forEach(s => { s.mood = clamp(s.mood + fx.mood, 0, 100); });
    if (st.prod) { if (fx.quality) st.prod.qualityDelta = (st.prod.qualityDelta || 0) + fx.quality; if (fx.reach) st.prod.reachDelta = (st.prod.reachDelta || 0) + fx.reach; }
    if (fx.story) Object.keys(fx.story).forEach(k => { st.story[k] += fx.story[k]; });
  };

  // ── Minispiele in der Karriere ────────────────────────────
  S.trainBonus = (st, group) => Math.min(10, Object.keys(st.mg).filter(id => PT.MG && PT.MG.get(id) && PT.MG.get(id).group === group).reduce((t, id) => t + (st.mg[id].wins || 0), 0));
  /** Meldet ein Minispiel-Ergebnis. ctx: { job: jobId } | { mission } | { training: true } | { prod: stage } | { party: n } */
  S.minigameDone = function (st, res, ctx) {
    ctx = ctx || {}; const id = res.id, M = st.mg[id] = st.mg[id] || { plays: 0, wins: 0, best: 0 };
    M.plays++; if (res.won) { M.wins++; st.stats.mgWinsTotal++; if (st.challenge) st.challenge.wins += (PT.MG && PT.MG.get(id) && PT.MG.get(id).group === 'quiz') ? 1 : 0; }
    M.best = Math.max(M.best, res.score | 0);
    const out = { money: 0, fans: 0, rep: 0, text: [] }, dr = S.diffRules(st);
    const def = PT.MG && PT.MG.get(id), group = def ? def.group : 'produktion';
    if (ctx.job) {
      const job = D.jobs.find(j => j.id === ctx.job);
      if (job) {
        st.stats.jobsToday++;
        const cap = st.stats.jobsToday <= R().sideJobCap ? 1 : Math.max(0.15, 1 / (st.stats.jobsToday - R().sideJobCap + 1));
        const pay = Math.round(job.pay * (res.won ? 0.6 + res.score / 250 : 0.25) * cap * dr.money);
        out.money = S.earn(st, pay, 'jobs'); out.text.push('Nebenjob: +' + PT.money(pay) + (cap < 1 ? ' (heute schon viele Jobs – weniger Lohn)' : ''));
        if (job.event && res.won) { const fans = Math.round(20 + res.score / 2); st.fans += fans; out.fans += fans; out.text.push('Publikum begeistert: +' + fans + ' Fans'); S.missionEvent(st, { type: 'event', kind: job.event }); }
        st.rel[job.npc] = clamp((st.rel[job.npc] || 0) + 2, 0, 100);
        S.advance(st, 45);
      }
    } else if (ctx.liveshow) {
      const tickets = Math.round((200 + st.fans * 0.25) * (0.5 + res.score / 100) * dr.money);
      out.money = S.earn(st, tickets, 'events'); const fans = Math.round(st.fans * 0.03 + res.score / 2); st.fans += fans; out.fans = fans;
      out.text.push('Live-Show: Tickets +' + PT.money(tickets) + ', +' + fans + ' Fans'); S.missionEvent(st, { type: 'event', kind: 'liveshow' }); S.advance(st, 120); S.hostSpend(st, 20, 10);
    } else if (!ctx.prod && !ctx.event && !ctx.party) {
      // Training: kleine, gedeckelte Wirkung je Gruppe (pro Tag einmal voll)
      const key = 'train_' + group + '_' + st.time.day;
      if (res.won && !st.flags[key]) {
        st.flags[key] = 1;
        if (group === 'produktion') out.text.push('Training: Aufnahme-Automatik +1');
        if (group === 'tec') { st.reliab = clamp(st.reliab + 4, 0, 100); out.text.push('Training: Zuverlässigkeit +4'); }
        if (group === 'quiz') { st.rep = clamp(st.rep + 1, 0, 100); out.rep = 1; out.text.push('Training: Ruf +1'); }
        if (group === 'roadtrip') { st.fans += 5; out.fans = 5; out.text.push('Training: +5 Fans'); }
        if (group === 'party') { ['marco', 'andrew'].forEach(h => { st.hosts[h].mood = clamp(st.hosts[h].mood + 5, 0, 100); }); out.text.push('Training: Stimmung der Hosts +5'); }
        if (group === 'feelgood') { st.fans += 3; out.fans = 3; ['marco', 'andrew'].forEach(h => { st.hosts[h].creativity = clamp(st.hosts[h].creativity + 5, 0, 100); }); out.text.push('Training: Kreativität +5, +3 Fans'); }
        S.cleanFlags(st);
      } else if (res.won) out.text.push('Heute schon trainiert – morgen gibt es wieder einen Bonus.');
      S.advance(st, 20);
    }
    if (ctx.party) { S.missionEvent(st, { type: 'party', players: ctx.party }); if (ctx.party >= 2) st.ach.party = st.ach.party || st.time.day; }
    S.missionEvent(st, { type: 'minigame', id, group, won: !!res.won, score: res.score | 0 });
    S.checkAch(st);
    return out;
  };
  S.cleanFlags = function (st) { Object.keys(st.flags).forEach(k => { if (k.startsWith('train_') && !k.endsWith('_' + st.time.day)) delete st.flags[k]; }); };
  S.liveshowAvailable = st => S.hasRoom(st, 'tvbuehne') ? { ok: true } : { ok: false, err: 'Für eine Live-Show braucht ihr eine eigene TV-Bühne.' };

  // ── Gespräche ─────────────────────────────────────────────
  S.talk = function (st, npcId) {
    if (!st.talkedToday[npcId]) { st.talkedToday[npcId] = 1; st.rel[npcId] = clamp((st.rel[npcId] || 0) + 2, 0, 100); }
    const res = { mission: null };
    const m = S.currentMission(st);
    if (m && st.missions.curState === 'offer' && m.actor === npcId) { S.acceptMission(st); res.mission = m; }
    else D.sideMissions.forEach(sm => { if (!res.mission && sm.actor === npcId && S.sideAvailable(st, sm) && !st.missions.side[sm.id]) { /* nur anbieten, UI fragt */ res.offerSide = sm; } });
    S.missionEvent(st, { type: 'talk', npc: npcId });
    return res;
  };
  S.visit = function (st, dist) { if (st.player.dist !== dist) { st.player.dist = dist; } S.missionEvent(st, { type: 'visit', dist }); };

  // ── Missionen ─────────────────────────────────────────────
  S.currentMission = st => st.missions.cur ? D.missions.find(m => m.id === st.missions.cur) : null;
  S.refreshMission = function (st) {
    if (st.mode !== 'career') return;
    const next = D.missions.find(m => !st.missions.done.includes(m.id));
    if (!next) { st.missions.cur = null; return; }
    if (st.missions.cur !== next.id) { st.missions.cur = next.id; st.missions.curState = 'offer'; st.missions.prog = {}; st.missions.start = null; }
    st.chapter = Math.max(st.chapter || 1, next.ch);
  };
  S.acceptMission = function (st) {
    const m = S.currentMission(st); if (!m || st.missions.curState !== 'offer') return { ok: false };
    st.missions.curState = 'active'; st.missions.prog = {}; st.missions.start = st.time.day;
    if (m.id === 'm1_07') st.unlocks.hire = true;
    S.notice(st, { t: 'dialogue', lines: m.say, title: m.title, choice: m.choice ? m.id : null, cut: m.cut ? m.loc : null });
    if (m.choice && st.story.choices[m.id] == null) st.pendingChoice = m.id;
    S.missionEvent(st, { type: 'start' });
    return { ok: true, m };
  };
  S.storyChoice = function (st, mid, idx) {
    const m = D.missions.concat(D.sideMissions).find(x => x.id === mid); if (!m || !m.choice) return { ok: false };
    const o = m.choice.options[idx]; if (!o) return { ok: false };
    st.story.choices[mid] = idx; Object.keys(o.story).forEach(k => { st.story[k] += o.story[k]; }); st.pendingChoice = null;
    return { ok: true };
  };
  S.sideAvailable = (st, sm) => st.mode === 'career' && (st.chapter || 1) >= sm.ch && !st.missions.side[sm.id];
  S.acceptSide = function (st, id) {
    const sm = D.sideMissions.find(x => x.id === id); if (!sm || !S.sideAvailable(st, sm)) return { ok: false, err: 'Nicht verfügbar.' };
    st.missions.side[id] = { state: 'active', prog: {}, start: st.time.day };
    S.notice(st, { t: 'dialogue', lines: sm.say, title: sm.title });
    S.checkMissions(st); return { ok: true };
  };
  // Ereigniszähler für aktive Missionen
  function bump(prog, i, n) { prog[i] = (prog[i] || 0) + (n || 1); }
  function evMatches(o, ev, st) {
    switch (o.type) {
      case 'talk': return ev.type === 'talk' && ev.npc === o.npc;
      case 'visit': return ev.type === 'visit' && ev.dist === o.dist;
      case 'publish': {
        if (ev.type !== 'publish') return false; const e = ev.ep, g = ev.guest;
        if (o.rubric && e.rubric !== o.rubric) return false; if (o.minQ && e.q < o.minQ) return false; if (o.video && !e.video) return false;
        if (o.format && e.format !== o.format) return false; if (o.tag && !(ev.topic.tags.includes(o.tag) || (g && ((o.tag === 'camping' && g.arche === 'camper') || (o.tag === 'bahn' && g.arche === 'bahnexpertin'))))) return false;
        if (o.guest === true && !g) return false; if (typeof o.guest === 'string' && (!g || g.id !== o.guest)) return false; if (o.guestArche && (!g || g.arche !== o.guestArche)) return false;
        return true;
      }
      case 'minigame': return ev.type === 'minigame' && (!o.id || ev.id === o.id) && (!o.group || ev.group === o.group) && (!o.win || ev.won) && (!o.minScore || ev.score >= o.minScore);
      case 'repair': return ev.type === 'repair';
      case 'sponsor': return ev.type === 'sponsor' && ev.state === o.state;
      case 'train': return ev.type === 'train';
      case 'teaser': return ev.type === 'teaser';
      case 'event': return ev.type === 'event' && ev.kind === o.kind;
      case 'party': return ev.type === 'party';
      case 'unlock': return ev.type === 'unlock' && ev.lot === o.lot;
      case 'listeners': return ev.type === 'publish' && ev.ep.listeners >= o.n;
      case 'editscore': return ev.type === 'publish' && (ev.ep.editScore || 0) >= o.n;
      default: return false;
    }
  }
  // Zustandsziele (live geprüft)
  S.objectiveState = function (st, o, prog, i) {
    const studio = S.studio(st);
    const cnt = o.count || 1;
    switch (o.type) {
      case 'build': { let n = 0; Object.keys(st.lots).forEach(k => { const lot = st.lots[k]; if (!lot.owned) return; lot.objs.forEach(x => { const d = D.objectById[x.id]; if ((o.obj && x.id === o.obj) || (o.cat && d.cat === o.cat)) n++; }); }); return { have: n, need: cnt }; }
      case 'room': { const n = studio.rooms.filter(r => r.valid && r.fn && (!o.fn || r.fn === o.fn) && (!o.lot || r.lot === o.lot)).length; return { have: n, need: cnt }; }
      case 'fans': return { have: st.fans, need: o.n };
      case 'money': return { have: Math.max(0, Math.round(st.money)), need: o.n };
      case 'rep': return { have: Math.round(st.rep), need: o.n };
      case 'hire': return { have: st.staff.filter(s => !o.role || s.role === o.role).length, need: cnt };
      case 'archive': return { have: st.episodes.length, need: o.n };
      case 'reliab': return { have: Math.round(st.reliab), need: o.n };
      case 'guests': return { have: Object.keys(st.stats.guests).length, need: o.n };
      case 'sponsor': return { have: Math.min(cnt, Math.max(prog[i] || 0, o.state === 'accept' && st.sponsors.active ? 1 : 0)), need: cnt };
      default: return { have: Math.min(prog[i] || 0, cnt), need: cnt };
    }
  };
  S.objectiveLabel = function (o) {
    if (o.label) return o.label;
    if (o.type === 'talk') { const n = D.npcs.find(x => x.id === o.npc) || D.hosts.find(x => x.id === o.npc); return 'Sprich mit ' + (n ? n.name : o.npc); }
    if (o.type === 'visit') { const d = D.districts.find(x => x.id === o.dist); return 'Besuche: ' + (d ? d.name : o.dist); }
    return o.type;
  };
  S.missionEvent = function (st, ev) {
    if (st.mode !== 'career') return;
    const m = S.currentMission(st);
    if (m && st.missions.curState === 'active') m.obj.forEach((o, i) => { if (evMatches(o, ev, st)) bump(st.missions.prog, i); });
    Object.keys(st.missions.side).forEach(id => { const s = st.missions.side[id]; if (s.state !== 'active') return; const sm = D.sideMissions.find(x => x.id === id); sm.obj.forEach((o, i) => { if (evMatches(o, ev, st)) bump(s.prog, i); }); });
    S.checkMissions(st);
  };
  S.missionProgress = function (st, m, prog) { return m.obj.map((o, i) => { const s = S.objectiveState(st, o, prog, i); return { label: S.objectiveLabel(o), have: s.have, need: s.need, done: s.have >= s.need, o }; }); };
  S.checkMissions = function (st) {
    if (st.mode !== 'career' || st._checking) return;
    st._checking = true;
    try {
      let guard = 0;
      while (guard++ < 80) {
        const m = S.currentMission(st);
        if (!m || st.missions.curState !== 'active') break;
        const pr = S.missionProgress(st, m, st.missions.prog);
        if (!pr.every(p => p.done)) break;
        S.completeMission(st, m, false);
      }
      Object.keys(st.missions.side).forEach(id => {
        const s = st.missions.side[id]; if (s.state !== 'active') return; const sm = D.sideMissions.find(x => x.id === id);
        if (S.missionProgress(st, sm, s.prog).every(p => p.done)) { s.state = 'done'; S.completeMission(st, sm, true); }
      });
    } finally { st._checking = false; }
  };
  S.completeMission = function (st, m, side) {
    const r = m.rew || {}, dr = S.diffRules(st);
    if (r.money) S.earn(st, r.money * dr.money, 'missions');
    if (r.fans) st.fans += r.fans; if (r.rep) st.rep = clamp(st.rep + r.rep, 0, 100);
    (r.unlock || []).forEach(u => {
      const [k, v] = u.split(':');
      if (k === 'feature') st.unlocks[v] = true;
      if (k === 'district') { st.unlocks.districts[v] = true; S.notice(st, { t: 'good', text: 'Neuer Bezirk: ' + D.districts.find(d => d.id === v).name + '!' }); }
      if (k === 'lot') st.flags['lot:' + v] = true;
    });
    if (st.unlocks.sponsors && !st.sponsors.offers.length && !st.sponsors.active) S.refreshSponsors(st);
    st.rel[m.actor] = clamp((st.rel[m.actor] || 0) + 10, 0, 100);
    S.notice(st, { t: 'mission', title: (side ? 'Nebenmission' : 'Mission') + ' abgeschlossen: ' + m.title, lines: m.done, rew: r, finale: !!m.finale, ending: !!m.ending });
    if (!side) {
      st.missions.done.push(m.id); st.missions.cur = null; const oldCh = st.chapter;
      if (m.ending) S.finishStory(st);
      S.refreshMission(st);
      if (st.chapter > oldCh) { S.notice(st, { t: 'chapter', ch: st.chapter }); S.refreshApplicants(st); }
      if (m.ch === 3 && m.finale) st.ach.chapter3 = st.ach.chapter3 || st.time.day;
    }
  };
  S.finishStory = function (st) {
    const s = st.story, avgQ = st.episodes.length ? st.episodes.reduce((t, e) => t + e.q, 0) / st.episodes.length : 0;
    const score = { chaos: s.chaos + st.stats.repairs * 0.05, publikum: s.publikum + st.fans / 5000, legende: s.legende + Math.max(0, avgQ - 60) / 20 };
    s.ending = Object.keys(score).sort((a, b) => score[b] - score[a] || (a === 'legende' ? -1 : 1))[0];
    st.ach.finale = st.ach.finale || st.time.day;
    st.endless = { week: 1, startDay: st.time.day, goals: [], done: 0 }; S.newEndlessGoals(st);
    S.notice(st, { t: 'ending', ending: s.ending });
  };
  // ── Endlosmodus: wöchentliche Ziele ───────────────────────
  S.newEndlessGoals = function (st) {
    const E = st.endless, tmp = { seed: PT.hash('end' + E.week + st.seed) };
    const n = st.episodes.length, f = st.fans;
    const pool = [
      { type: 'publish', count: 3, minQ: 70, label: '3 Folgen mit mindestens 70 % diese Woche', rew: 1500 },
      { type: 'fans', n: Math.round(f * 1.15 + 50), label: 'Erreiche ' + PT.fmt(Math.round(f * 1.15 + 50)) + ' Fans', rew: 2000 },
      { type: 'minigame', win: true, count: 4, label: 'Gewinne 4 Minispiele', rew: 1000 },
      { type: 'publish', count: 1, video: true, minQ: 75, label: 'Eine Videofolge mit mindestens 75 %', rew: 1500 },
      { type: 'archive', n: n + 4, label: 'Habe ' + (n + 4) + ' Folgen im Archiv', rew: 1200 },
      { type: 'publish', count: 1, guest: true, minQ: 65, label: 'Eine Folge mit Gast (≥ 65 %)', rew: 1100 }
    ];
    E.goals = PT.shuffle(tmp, pool).slice(0, 3).map(g => Object.assign({ prog: 0, done: false }, g)); E.weekStart = st.time.day;
  };
  S.endlessEvent = function (st, ev) {
    if (!st.endless) return;
    st.endless.goals.forEach(g => { if (!g.done && evMatches(g, ev, st)) g.prog++; });
  };
  S.checkEndless = function (st) {
    const E = st.endless; if (!E) return;
    E.goals.forEach(g => {
      if (g.done) return; const s = S.objectiveState(st, g, { 0: g.prog }, 0);
      if (s.have >= s.need) { g.done = true; E.done++; S.earn(st, g.rew, 'missions'); S.notice(st, { t: 'good', text: 'Wochenziel erreicht: ' + g.label + ' (+' + PT.money(g.rew) + ')' }); }
    });
    if (st.time.day - E.weekStart >= 7) { E.week++; S.newEndlessGoals(st); S.notice(st, { t: 'info', text: 'Neue Wochenziele im Endlosmodus!' }); }
  };
  const _me = S.missionEvent;
  S.missionEvent = function (st, ev) { _me(st, ev); if (st.endless) { S.endlessEvent(st, ev); S.checkEndless(st); } };

  // ── Herausforderungen ─────────────────────────────────────
  S.challengeStatus = function (st) {
    if (!st.challenge) return null;
    const c = D.challenges.find(x => x.id === st.challenge.id), g = c.goal, eps = st.episodes.filter(e => e.day >= 1);
    const avgQ = eps.length ? eps.reduce((t, e) => t + e.q, 0) / eps.length : 0;
    const items = [];
    if (g.fans) items.push({ label: 'Fans', have: st.fans, need: g.fans });
    if (g.money) items.push({ label: 'Kontostand', have: Math.round(st.money), need: g.money });
    if (g.episodes) items.push({ label: 'Folgen' + (g.minQ ? ' (≥ ' + g.minQ + ' %)' : ''), have: eps.filter(e => !g.minQ || e.q >= g.minQ).length, need: g.episodes });
    if (g.avgQ) items.push({ label: 'Ø Qualität', have: Math.round(avgQ), need: g.avgQ });
    if (g.minigameWins) items.push({ label: 'Quiz-Siege', have: st.challenge.wins, need: g.minigameWins });
    if (g.distinctGuests) items.push({ label: 'Verschiedene Gäste', have: Object.keys(st.challenge.guests).length, need: g.distinctGuests });
    return { c, items, daysLeft: Math.max(0, st.challenge.endDay - st.time.day), ok: items.every(i => i.have >= i.need) };
  };
  S.checkChallenge = function (st) {
    const s = S.challengeStatus(st); if (!s || st.challenge.done) return;
    if (s.ok) { st.challenge.done = true; st.challenge.success = true; S.notice(st, { t: 'challenge', success: true, name: s.c.name }); }
    else if (st.time.day >= st.challenge.endDay) { st.challenge.done = true; st.challenge.success = false; S.notice(st, { t: 'challenge', success: false, name: s.c.name }); }
  };

  // ── Erfolge ───────────────────────────────────────────────
  S.checkAch = function (st) {
    const A = st.ach, d = st.time.day, set = id => { if (!A[id]) { A[id] = d; const a = D.achievements.find(x => x.id === id); if (a) S.notice(st, { t: 'ach', id, text: a.icon + ' Erfolg: ' + a.title }); } };
    const n = st.episodes.length;
    if (n >= 1) set('first_ep'); if (n >= 10) set('ten_ep'); if (n >= 50) set('fifty_ep');
    if (st.episodes.some(e => e.q >= 90)) set('q90'); if (st.fans >= 1000) set('fans1k'); if (st.fans >= 10000) set('fans10k');
    if (st.money >= 50000 && !S.isCreative(st)) set('rich'); if (Object.keys(st.stats.distinctRubrics).length >= 6) set('all_rubrics');
    if (st.staff.length >= 5) set('team5'); if (st.stats.placed >= 60) set('builder'); if (Object.keys(st.stats.guests).length >= 10) set('guests10');
    if (PT.MG && PT.MG.list().length && PT.MG.list().every(m => st.mg[m.id] && st.mg[m.id].wins)) set('all_mg');
    ['sponsor', 'party', 'chapter3', 'finale'].forEach(k => { if (A[k] === true) A[k] = d; });
  };

  // ── Selbsttest-Hilfe: Zusammenfassung für Bericht/Tests ───
  S.summary = st => ({ day: st.time.day, money: Math.round(st.money), fans: st.fans, rep: st.rep, episodes: st.episodes.length, chapter: st.chapter, mission: st.missions.cur, staff: st.staff.length, reliab: Math.round(st.reliab) });
  if (typeof module !== 'undefined' && module.exports) module.exports = S;
})(typeof window !== 'undefined' ? window : globalThis);
