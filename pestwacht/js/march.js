/* Pestwacht · Märsche auf der Weltkarte (Spieler und Computerfraktionen nach denselben Regeln):
 * Erkunden, Sammeln, Retten, Handeln, Besetzen, Angreifen, Verteidigen, Hilfe. Bewegung per Wegfindung, Kämpfe über PW.Battle. Ohne DOM. */
(function (root) {
  'use strict';
  const PW = root.PW = root.PW || {};
  const M = PW.March = {};
  const Wd = () => PW.World;

  M.MISSIONS = {
    scout: { name: 'Erkunden', icon: '🔭' }, gather: { name: 'Sammeln', icon: '🧺' }, rescue: { name: 'Kranke retten', icon: '🩹' },
    heal: { name: 'Region heilen', icon: '🌿' }, trade: { name: 'Handelskarawane', icon: '🐪' }, occupy: { name: 'Besetzen', icon: '🚩' },
    attack: { name: 'Angreifen', icon: '⚔️' }, defend: { name: 'Verteidigen', icon: '🛡️' }, aid: { name: 'Bündnishilfe', icon: '🤝' }, home: { name: 'Rückkehr', icon: '🏠' }
  };
  M.ownerName = (S, o) => (o === 'P' ? (S.cfg.playerName || 'Deine Zuflucht') : o === 'mon' ? 'Seuchenwesen' : o === 'bandit' ? 'Plünderer' : (PW.FAC[o] ? PW.FAC[o].name : o));
  M.capOf = (S, o) => (o === 'P' ? S.world.caps[0] : (S.factions.find(f => f.id === o) || {}).cap);
  M.unitsN = u => PW.UNIT_IDS.reduce((n, k) => n + (u[k] || 0), 0);
  M.maxMarches = S => 1 + PW.City.lv(S, 'kommando') + (PW.City.lv(S, 'handel') ? 0 : 0);

  M.speedOf = function (S, owner, units, heroes, mission) {
    let s = 1;
    const n = M.unitsN(units), cav = units.rider || 0;
    if (n > 0 && cav === n) s *= 1.5; else if (cav > n / 2) s *= 1.2;
    if (units.ram) s *= 0.75;
    if (owner === 'P') {
      const m = S._mods || {}; s *= 1 + (m['march.speed'] || 0);
      if (mission === 'trade') s *= 1.1 + (m['caravan.speed'] || 0);
      if (mission === 'scout') s *= 1 + 0.15 * PW.City.lv(S, 'kundschafter');
      (heroes || []).forEach(h => { if (h === 'jorin') s *= 1.2; });
    } else {
      const f = S.factions.find(x => x.id === owner); if (f && f.tech.done.w8) s *= 1.2;
    }
    return s;
  };
  M.eta = function (S, a) {
    let t = 0;
    const path = a.state === 'back' ? a.back : a.path;
    for (let k = a.seg + 1; k < path.length; k++) t += Wd().cost(S.world, path[k]) * PW.BAL.marchCost / a.spd;
    return Math.max(0, t - a.prog * (path[a.seg + 1] != null ? Wd().cost(S.world, path[a.seg + 1]) * PW.BAL.marchCost / a.spd : 0));
  };

  // Neuer Marsch. o: { owner, units, heroes, target, mission, cargo, formation, from }
  M.create = function (S, o) {
    const from = o.from != null ? o.from : M.capOf(S, o.owner);
    const path = Wd().path(S.world, from, o.target); if (!path) return null;
    const a = { id: ++S.marchUid, owner: o.owner, units: Object.assign({}, o.units || {}), heroes: (o.heroes || []).slice(), bhero: o.bhero || null, path, seg: 0, prog: 0,
      mission: o.mission, target: o.target, from, cargo: o.cargo || null, gain: null, state: 'go', work: 0, formation: o.formation || 'ausgewogen', ally: o.ally || null, since: S.time, info: o.info || null };
    a.spd = M.speedOf(S, a.owner, a.units, a.heroes, a.mission);
    S.marches.push(a);
    return a;
  };

  // Spieler: Marsch starten (prüft Truppen, Helden, Grenzen)
  M.playerWhy = function (S, o) {
    if (S.marches.filter(a => a.owner === 'P' && a.mission !== 'trade').length >= M.maxMarches(S) && o.mission !== 'trade') return 'Höchstens ' + M.maxMarches(S) + ' Expedition(en) gleichzeitig (Kommandoposten erhöht)';
    const n = M.unitsN(o.units || {});
    if (o.mission === 'trade') {
      const tr = S.marches.filter(a => a.owner === 'P' && a.mission === 'trade').length, lv = PW.City.lv(S, 'handel');
      if (!lv) return 'Handelsstation nötig'; if (tr >= lv) return 'Höchstens ' + lv + ' Karawane(n) unterwegs';
      if (!o.cargo || !Object.keys(o.cargo).some(k => o.cargo[k] > 0)) return 'Waren auswählen';
      if (!PW.canPay(S.res, o.cargo)) return 'Nicht genug Waren';
    } else if (n < 1 && !(o.heroes || []).length) return 'Truppen oder Helden zuweisen';
    for (const k in (o.units || {})) if ((o.units[k] || 0) > (S.troops[k] || 0)) return 'Nicht genug ' + PW.UNITS[k].name;
    if ((o.heroes || []).length > 2) return 'Höchstens 2 Helden je Expedition';
    for (const h of (o.heroes || [])) if (!PW.Heroes.available(S, h)) return PW.HERO[h].name + ' ist nicht verfügbar';
    if (o.target === M.capOf(S, 'P')) return 'Ziel ist die eigene Zuflucht';
    const t = S.world.tiles[o.target], s = Wd().siteAt(S, o.target);
    if (o.mission === 'attack') { if (!t.own || t.own === 'P') return 'Kein feindliches Gebiet'; if (!PW.Diplo.atWar(S, 'P', t.own)) return 'Erst den Krieg erklären'; }
    if (o.mission === 'occupy' && t.own && t.own !== 'P') return 'Gehört ' + M.ownerName(S, t.own) + ' – angreifen statt besetzen';
    if (o.mission === 'rescue' && !(s && s.type === 'village' && s.patients > 0)) return 'Hier gibt es niemanden zu retten';
    if (o.mission === 'trade' && !(s && (s.type === 'trade' || (s.type === 'capital' && s.owner && s.owner !== 'P')))) return 'Ziel: Handelsplatz oder Hauptstadt einer Fraktion';
    if (o.mission === 'trade' && s.type === 'capital' && PW.Diplo.atWar(S, 'P', s.owner)) return 'Kein Handel im Krieg';
    if (o.mission === 'gather' && !(s && s.type.indexOf('res_') === 0 && (!s.gar || s.cleared) && (!t.own || t.own === 'P'))) return 'Nur auf freien oder eigenen Rohstofffeldern';
    if (o.mission === 'defend' && t.own !== 'P') return 'Nur eigene Regionen verteidigen';
    if (o.mission === 'heal' && !(t.pl > 0.1)) return 'Diese Region ist kaum verseucht';
    if (o.mission === 'heal' && S.res.med < 20) return '20 Arznei nötig';
    return null;
  };
  M.send = function (S, o) {
    const why = M.playerWhy(S, o); if (why) return { ok: false, why };
    if (o.mission === 'trade') PW.pay(S.res, o.cargo);
    if (o.mission === 'heal') { S.res.med -= 20; o.cargo = { med: 20 }; }
    for (const k in (o.units || {})) S.troops[k] -= o.units[k] || 0;
    const a = M.create(S, Object.assign({ owner: 'P' }, o));
    if (!a) { for (const k in (o.units || {})) S.troops[k] += o.units[k] || 0; if (o.cargo) PW.addRes(S.res, o.cargo, null); return { ok: false, why: 'Kein Weg dorthin' }; }
    (o.heroes || []).forEach(h => { S.heroes[h].where = a.id; });
    PW.log(S, M.MISSIONS[o.mission].icon + ' Expedition aufgebrochen: ' + M.MISSIONS[o.mission].name + ' → ' + Wd().regionName(S, o.target), 'welt');
    return { ok: true, a };
  };
  M.recall = function (S, id) {
    const a = S.marches.find(x => x.id === id); if (!a || a.owner !== 'P' || a.state === 'back') return false;
    goHome(S, a); return true;
  };

  function curTile(a) { const p = a.state === 'back' ? a.back : a.path; return p[Math.min(a.seg, p.length - 1)]; }
  M.curTile = curTile;
  function goHome(S, a) {
    const here = curTile(a), home = M.capOf(S, a.owner);
    if (home == null) { disband(S, a); return; }
    a.back = Wd().path(S.world, here, home) || [here]; a.seg = 0; a.prog = 0; a.state = 'back'; a.work = 0;
  }
  M.goHome = goHome;
  function disband(S, a) { const k = S.marches.indexOf(a); if (k >= 0) S.marches.splice(k, 1); if (a.owner === 'P') a.heroes.forEach(h => { if (S.heroes[h]) S.heroes[h].where = 'stadt'; }); }
  M.disband = disband;

  // Truppen, Helden und Fracht zurück in die Heimat
  function arriveHome(S, a) {
    if (a.owner === 'P') {
      PW.UNIT_IDS.forEach(k => { S.troops[k] = (S.troops[k] || 0) + (a.units[k] || 0); });
      a.heroes.forEach(h => { if (S.heroes[h]) S.heroes[h].where = 'stadt'; });
      const parts = [];
      if (a.gain) { PW.addRes(S.res, a.gain, S._caps); parts.push(PW.costText(a.gain)); }
      if (a.patients) {
        S.pop.i += a.patients.sick; S.pop.h += a.patients.well; PW.stat(S, 'rescued', a.patients.sick + a.patients.well);
        parts.push(a.patients.sick + ' Kranke, ' + a.patients.well + ' Gesunde aufgenommen');
      }
      if (a.wounded) PW.UNIT_IDS.forEach(k => { S.wounded[k] = (S.wounded[k] || 0) + (a.wounded[k] || 0); });
      if (a.mission !== 'trade') PW.stat(S, 'expeditions');
      PW.log(S, '🏠 Expedition zurück' + (parts.length ? ': ' + parts.join(' · ') : ''), 'welt');
    } else {
      const f = S.factions.find(x => x.id === a.owner);
      if (f && f.alive) {
        PW.UNIT_IDS.forEach(k => { f.troops[k] = (f.troops[k] || 0) + (a.units[k] || 0); f.wounded[k] = (f.wounded[k] || 0) + ((a.wounded || {})[k] || 0); });
        if (a.gain) for (const k in a.gain) { f.res[k] = (f.res[k] || 0) + a.gain[k]; f.ledger.made[k] = (f.ledger.made[k] || 0) + a.gain[k]; }
        if (a.bhero) f.hero.away = false;
      }
    }
    disband(S, a);
  }

  M.tick = function (S, dt) {
    for (let k = S.marches.length - 1; k >= 0; k--) {
      const a = S.marches[k]; if (!a) continue;
      if (a.work > 0) { a.work -= dt; if (a.work <= 0) finishWork(S, a); continue; }
      const path = a.state === 'back' ? a.back : a.path;
      if (a.seg >= path.length - 1) { arrive(S, a); continue; }
      const next = path[a.seg + 1], segT = Wd().cost(S.world, next) * PW.BAL.marchCost / a.spd;
      a.prog += dt / segT;
      while (a.prog >= 1 && a.seg < path.length - 1) {
        a.prog -= 1; a.seg++;
        const here = path[a.seg];
        if (a.owner === 'P') Wd().reveal(S, here, 1 + (S._d ? S._d.scout > 0 ? 1 : 0 : 0) + (a.heroes.indexOf('jorin') >= 0 ? 1 : 0));
        if (a.mission === 'trade' && a.state === 'go') ambushCheck(S, a, here);
        if (a.seg >= path.length - 1) a.prog = 0;
      }
    }
    intercept(S);
  };

  function ambushCheck(S, a, tile) {
    const near = Wd().neighbors(S.world, tile).concat([tile]).some(i => { const s = Wd().siteAt(S, i); return s && (s.type === 'lair' || s.type === 'boss') && !s.cleared; });
    const hostile = S.world.tiles[tile].own && S.world.tiles[tile].own !== a.owner && PW.Diplo.atWar(S, a.owner, S.world.tiles[tile].own);
    if (!near && !hostile) return;
    if (PW.rand(S) < (hostile ? 0.25 : 0.12)) {
      const lost = {}; for (const k in a.cargo) { lost[k] = Math.floor(a.cargo[k] * 0.4); a.cargo[k] -= lost[k]; }
      if (a.owner === 'P') PW.log(S, '⚠️ Karawane überfallen bei ' + Wd().regionName(S, tile) + ': verloren ' + PW.costText(lost), 'warn');
    }
  }

  // Feindliche Märsche, die sich auf demselben Feld treffen, kämpfen
  function intercept(S) {
    const ms = S.marches;
    for (let i = 0; i < ms.length; i++) for (let j = i + 1; j < ms.length; j++) {
      const a = ms[i], b = ms[j];
      if (!a || !b || a.owner === b.owner || a.mission === 'trade' || b.mission === 'trade') continue;
      if (curTile(a) !== curTile(b) || !PW.Diplo.atWar(S, a.owner, b.owner)) continue;
      if (M.unitsN(a.units) + M.unitsN(b.units) === 0) continue;
      fieldBattle(S, a, b);
    }
  }
  function marchSide(S, a) {
    if (a.owner === 'P') return { owner: 'P', name: M.ownerName(S, 'P'), units: a.units, heroes: a.heroes.map(h => PW.Heroes.stats(S, h)).filter(Boolean), mods: S._mods, formation: a.formation, auto: true };
    const f = S.factions.find(x => x.id === a.owner);
    return { owner: a.owner, name: f.name, units: a.units, heroes: a.bhero ? [f.hero] : [], mods: PW.AI.mods(f), formation: f.formation || 'ausgewogen' };
  }
  function fieldBattle(S, a, b) {
    const bt = PW.Battle.make({ seed: S.time + ':' + a.id + ':' + b.id, terrain: S.world.tiles[curTile(a)].b, att: marchSide(S, a), def: marchSide(S, b), kind: 'feld' });
    const r = PW.Battle.run(bt);
    applyMarchSide(S, a, r.sides[0], r.win === 0, r);
    applyMarchSide(S, b, r.sides[1], r.win === 1, r);
    report(S, { kind: 'Feldschlacht', tile: curTile(a), att: a.owner, def: b.owner, r });
    PW.Diplo.event(S, a.owner, b.owner, 'kampf');
  }
  function woundShare(S, owner) {
    if (owner === 'P') { const m = S._mods || {}; return 0.25 + (m.wounded || 0) + 0.03 * PW.City.lv(S, 'lazarett'); }
    const f = S.factions.find(x => x.id === owner); return 0.2 + (f && f.bld.heilstube ? 0.02 * f.bld.heilstube : 0);
  }
  function applyMarchSide(S, a, side, won, r) {
    PW.UNIT_IDS.forEach(k => { if (a.units[k]) a.units[k] = side.alive[k] || 0; });
    const ws = woundShare(S, a.owner); a.wounded = a.wounded || {};
    PW.UNIT_IDS.forEach(k => { const w = Math.floor(((side.lost[k] || 0) + (side.wounded[k] || 0)) * ws); a.wounded[k] = (a.wounded[k] || 0) + w; });
    if (a.owner === 'P') {
      side.heroes.forEach(h => { PW.Heroes.addXp(S, h.id, side.xp / Math.max(1, side.heroes.length)); if (!h.alive) { S.heroes[h.id].inj = 180; } });
      if (won) PW.stat(S, 'battlesWon'); else PW.stat(S, 'battlesLost');
    } else if (a.bhero) { const f = S.factions.find(x => x.id === a.owner); if (f) f.hero.xp = (f.hero.xp || 0) + side.xp; }
    const heroAlive = a.owner === 'P' ? side.heroes.some(h => h.alive) : false;
    if (M.unitsN(a.units) === 0 && !heroAlive) {
      if (a.owner === 'P') a.heroes.forEach(h => { if (S.heroes[h]) S.heroes[h].inj = 180; });   // Helden schleppen sich verwundet heim
      if (a.bhero) { const f = S.factions.find(x => x.id === a.owner); if (f) { f.hero.away = false; f.hero.inj = 180; } }
      disband(S, a);
    } else if (!won) goHome(S, a);
  }
  function report(S, o) {
    const r = o.r, entry = { t: Math.floor(S.time), kind: o.kind, tile: o.tile, att: o.att, def: o.def, win: r.win === 0 ? o.att : o.def, dur: r.t,
      lost: [summ(r.sides[0]), summ(r.sides[1])], extra: o.extra || '' };
    S.reports.unshift(entry); if (S.reports.length > 40) S.reports.length = 40;
    const mine = o.att === 'P' || o.def === 'P';
    const txt = '⚔️ ' + o.kind + ' bei ' + Wd().regionName(S, o.tile) + ': ' + M.ownerName(S, o.att) + ' gegen ' + M.ownerName(S, o.def) + ' – Sieg für ' + M.ownerName(S, entry.win) + (o.extra ? ' · ' + o.extra : '');
    PW.log(S, txt, mine ? 'kampf' : 'welt', { report: 1 });
    return entry;
  }
  M.report = report;
  function summ(side) { let n = 0; for (const k in side.lost) n += side.lost[k] + (side.wounded[k] || 0); for (const k in side.mon) n += 0; return n + (side.lostN && !Object.keys(side.lost).length ? side.lostN : 0); }

  // Verteidiger eines Feldes zusammenstellen
  M.defenders = function (S, tile) {
    const t = S.world.tiles[tile], s = Wd().siteAt(S, tile), own = t.own;
    if (own === 'P') {
      if (tile === S.world.caps[0]) {
        const units = Object.assign({}, S.troops); M.stationedAt(S, tile).forEach(st => { for (const k in st.units) units[k] = (units[k] || 0) + st.units[k]; });
        return { owner: 'P', name: M.ownerName(S, 'P'), units, heroes: PW.Heroes.list(S).filter(h => PW.Heroes.available(S, h)).slice(0, 3).map(h => PW.Heroes.stats(S, h)), mods: S._mods,
          capital: true, siege: { wall: S.city.gate, towers: PW.Waves ? PW.Waves.towerDps(S) : 0 } };
      }
      return { owner: 'P', name: M.ownerName(S, 'P'), units: Object.assign({}, (t.gar && t.gar.units) || {}), heroes: [], mods: S._mods };
    }
    if (own) {
      const f = S.factions.find(x => x.id === own);
      if (tile === f.cap) { const units = Object.assign({}, f.troops); M.stationedAt(S, tile).forEach(st => { for (const k in st.units) units[k] = (units[k] || 0) + st.units[k]; });
        return { owner: own, name: f.name, units, heroes: f.hero.away ? [] : [f.hero], mods: PW.AI.mods(f), capital: true,
        siege: { wall: Math.round(600 * (1 + 0.6 * (f.bld.mauer || 0))), towers: 12 * (f.bld.mauer || 0) } }; }
      return { owner: own, name: f.name, units: Object.assign({}, (t.gar && t.gar.units) || {}), heroes: [], mods: PW.AI.mods(f) };
    }
    if (s && s.gar && !s.cleared) {
      if (s.gar.mon) return { owner: 'mon', name: 'Seuchenwesen', mon: Object.assign({}, s.gar.mon), boss: s.gar.boss || null };
      return { owner: 'bandit', name: s.gar.boss ? PW.BOSSES[s.gar.boss].name : 'Plünderer', units: Object.assign({}, s.gar.units), boss: s.gar.boss || null };
    }
    return null;
  };
  function hasDefenders(d) { return d && (M.unitsN(d.units || {}) > 0 || (d.mon && Object.keys(d.mon).some(k => d.mon[k] > 0)) || d.boss || (d.heroes && d.heroes.length) || (d.siege && d.siege.wall > 0 && d.capital)); }

  M.stationedAt = (S, tile) => S.stationed.filter(st => st.tile === tile);
  // Verluste anteilig auf eigene und stationierte Truppen verteilen
  function scaleLosses(S, tile, troops, wounded, side, ws) {
    const sts = M.stationedAt(S, tile);
    PW.UNIT_IDS.forEach(k => {
      const own = troops[k] || 0, guest = sts.reduce((n, st) => n + (st.units[k] || 0), 0), tot = own + guest; if (!tot) return;
      const ratio = (side.alive[k] || 0) / tot, ownLeft = Math.round(own * ratio);
      wounded[k] = (wounded[k] || 0) + Math.floor((own - ownLeft) * ws); troops[k] = ownLeft;
      sts.forEach(st => { if (st.units[k]) st.units[k] = Math.round(st.units[k] * ratio); });
    });
  }
  // Kampf um ein Feld (Angreifer = Marsch)
  M.assault = function (S, a, watch) {
    const tile = a.target, d = M.defenders(S, tile);
    if (!hasDefenders(d)) return { won: true, r: null };
    const att = marchSide(S, a);
    if (a.owner === 'P' && watch) att.auto = S.cfg.autoBattle !== false;
    const bt = PW.Battle.make({ seed: S.time + ':' + a.id + ':' + tile, terrain: S.world.tiles[tile].b, att, def: Object.assign({ auto: true }, d), siege: d.capital ? d.siege : null, kind: d.capital ? 'belagerung' : 'feld' });
    return { bt, d };
  };
  M.resolveAssault = function (S, a, bt, d) {
    const r = PW.Battle.result(bt), tile = a.target, won = r.win === 0;
    applyMarchSide(S, a, r.sides[0], won, r);
    const ds = r.sides[1], ws = woundShare(S, d.owner);
    // Verluste der Verteidiger übernehmen
    if (d.owner === 'P') {
      if (d.capital) {
        scaleLosses(S, tile, S.troops, S.wounded, ds, ws);
        S.city.gate = Math.max(0, r.wall);
        ds.heroes.forEach(h => { PW.Heroes.addXp(S, h.id, ds.xp / 3); if (!h.alive) S.heroes[h.id].inj = 180; });
      } else { const t = S.world.tiles[tile]; if (t.gar) PW.UNIT_IDS.forEach(k => { if (t.gar.units[k]) t.gar.units[k] = ds.alive[k] || 0; }); }
    } else if (d.owner === 'mon' || d.owner === 'bandit') {
      const s = Wd().siteAt(S, tile);
      if (s && s.gar) { if (s.gar.mon) Object.keys(s.gar.mon).forEach(k => { s.gar.mon[k] = ds.mon[k] || 0; }); else PW.UNIT_IDS.forEach(k => { if (s.gar.units[k]) s.gar.units[k] = ds.alive[k] || 0; }); if (s.gar.boss && ds.bossAlive === false) s.gar.boss = null; }
    } else {
      const f = S.factions.find(x => x.id === d.owner), t = S.world.tiles[tile];
      if (d.capital) { scaleLosses(S, tile, f.troops, f.wounded, ds, ws); if (ds.heroes[0] && !ds.heroes[0].alive) f.hero.inj = 180; }
      else if (t.gar) PW.UNIT_IDS.forEach(k => { if (t.gar.units[k]) t.gar.units[k] = ds.alive[k] || 0; });
    }
    let extra = '';
    if (won) extra = PW.Conquest.capture(S, a, tile, d) || '';
    else if (d.capital && d.owner === 'P') extra = 'Die Zuflucht hat standgehalten';
    if (d.owner !== 'mon' && d.owner !== 'bandit') PW.Diplo.event(S, a.owner, d.owner, 'angriff');
    const rep = report(S, { kind: d.capital ? 'Belagerung' : d.owner === 'mon' ? 'Kampf gegen Seuchenwesen' : 'Gefecht', tile, att: a.owner, def: d.owner, r, extra });
    if (S.marches.indexOf(a) >= 0 && a.state !== 'back') { if (won && (a.mission === 'occupy' || a.mission === 'attack') && a.owner !== 'P') PW.AI.afterCapture(S, a); else if (S.marches.indexOf(a) >= 0) goHome(S, a); }
    return { won, r, rep };
  };

  function arrive(S, a) {
    if (a.state === 'back') { arriveHome(S, a); return; }
    const tile = a.target, s = Wd().siteAt(S, tile), t = S.world.tiles[tile];
    // Ziel inzwischen eigenes Gebiet eines Verbündeten/Neutral? Missionen prüfen
    switch (a.mission) {
      case 'scout': if (a.owner === 'P') { Wd().reveal(S, tile, 2 + Math.floor(PW.City.lv(S, 'kundschafter') / 2)); PW.log(S, '🔭 Kundschafter melden: ' + Wd().regionName(S, tile) + ' erkundet', 'welt'); } goHome(S, a); return;
      case 'defend':
        if (t.own === a.owner) { t.gar = t.gar || { units: {} }; PW.UNIT_IDS.forEach(k => { t.gar.units[k] = (t.gar.units[k] || 0) + (a.units[k] || 0); a.units[k] = 0; }); if (a.owner === 'P') PW.log(S, '🛡️ Garnison verstärkt: ' + Wd().regionName(S, tile), 'welt'); }
        goHome(S, a); return;
      case 'aid': PW.AI.aidArrive(S, a); return;
      case 'trade': PW.AI.tradeArrive(S, a); return;
      case 'heal': t.pl = Math.max(0, t.pl - 0.25); Wd().neighbors(S.world, tile).forEach(n => { S.world.tiles[n].pl = Math.max(0, S.world.tiles[n].pl - 0.08); });
        if (a.owner === 'P') { PW.stat(S, 'healedRegions'); PW.log(S, '🌿 Region behandelt: Seuche in ' + Wd().regionName(S, tile) + ' gesenkt', 'welt'); } a.cargo = null; goHome(S, a); return;
      case 'gather':
        if (s && s.type.indexOf('res_') === 0) { a.work = 60; a.state = 'work'; return; }
        goHome(S, a); return;
      case 'rescue':
        if (s && s.type === 'village' && s.patients > 0) {
          const cap = Math.max(4, M.unitsN(a.units) + a.heroes.length * 4), n = Math.min(cap, s.patients);
          const sick = Math.ceil(n * 0.6); a.patients = { sick, well: n - sick }; s.patients -= n; s.rescuedAt = S.time;
          if (a.owner === 'P') PW.log(S, '🩹 ' + n + ' Überlebende aus ' + Wd().regionName(S, tile) + ' aufgenommen – auf dem Heimweg', 'welt');
        }
        goHome(S, a); return;
      case 'occupy': case 'attack': {
        if (t.own === a.owner) { goHome(S, a); return; }
        if (t.own && t.own !== a.owner && !PW.Diplo.atWar(S, a.owner, t.own)) { goHome(S, a); return; }
        const as = M.assault(S, a, a.owner === 'P' && S.cfg.watchBattles);
        if (as.won && !as.bt) { const extra = PW.Conquest.capture(S, a, tile, null); if (a.owner === 'P' && extra) PW.log(S, '🚩 ' + extra, 'welt'); if (S.marches.indexOf(a) >= 0) { if (a.owner !== 'P') PW.AI.afterCapture(S, a); else goHome(S, a); } return; }
        if (a.owner === 'P' && S.cfg.watchBattles && S._ui && S._ui.watchBattle) { a.work = 1e9; a.state = 'kampf'; S._ui.watchBattle(a, as.bt, as.d); return; }
        PW.Battle.run(as.bt);
        M.resolveAssault(S, a, as.bt, as.d);
        return;
      }
      default: goHome(S, a);
    }
  }
  M.arrive = arrive;
  function finishWork(S, a) {
    const s = Wd().siteAt(S, a.target);
    if (a.mission === 'gather' && s) {
      const prod = PW.SITES[s.type].prod || {}, cap = 40 + M.unitsN(a.units) * 6 + a.heroes.length * 30, g = {};
      for (const k in prod) g[k] = Math.round(Math.min(cap, prod[k] * 6 * (1 + 0.2 * a.heroes.length)));
      a.gain = g;
    }
    a.state = 'go'; goHome(S, a);
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = PW;
})(typeof window !== 'undefined' ? window : globalThis);
