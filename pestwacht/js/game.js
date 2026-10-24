/* Pestwacht · Spielablauf: neues Spiel, fester Simulationstakt, Regionen, Ereignisse, Aufgaben, Sieg/Niederlage, Offline-Fortschritt. Ohne DOM. */
(function (root) {
  'use strict';
  const PW = root.PW = root.PW || {};
  const G = PW.Game = {};
  const C = () => PW.City, Wd = () => PW.World;

  G.START_RES = {
    karg: { wood: 250, stone: 180, iron: 40, food: 200, water: 160, herb: 20, med: 10, cloth: 20, coin: 150, know: 10 },
    normal: { wood: 420, stone: 300, iron: 80, food: 320, water: 260, herb: 40, med: 20, cloth: 40, coin: 260, know: 30 },
    reich: { wood: 800, stone: 600, iron: 200, food: 600, water: 500, herb: 120, med: 60, cloth: 100, coin: 600, know: 120 }
  };
  G.DISASTER = { selten: 1.7, normal: 1, haeufig: 0.6 };
  G.VICTORY = { gebiet: 'Territoriale Dominanz (45 % der Regionen)', heilung: 'Heilung der Seuche (Heilmittel + alle Seuchennester zerstört)', diplomatie: 'Diplomatischer Zusammenschluss (mit allen Fraktionen verbündet)', wirtschaft: 'Wirtschaftliche Vorherrschaft (20.000 Münzen, 120 Bewohner)', endlos: 'Endlosspiel' };

  G.defaultCfg = function () {
    return { mode: 'free', seed: String(Math.floor(Math.random() * 1e9)), size: 'mittel', bots: 6, biome: 'ausgewogen', start: 'normal', diff: 'normal', disasters: 'normal', victory: 'gebiet',
      playerName: 'Deine Zuflucht', seasons: true, autoSkills: true, autoBattle: true, watchBattles: true, waves: true, offlineCap: PW.BAL.offlineCapDefault };
  };

  G.newGame = function (cfg) {
    cfg = Object.assign(G.defaultCfg(), cfg || {});
    if (cfg.mode === 'campaign') { cfg.seed = PW.Campaign.SEED; cfg.size = 'mittel'; cfg.bots = PW.Campaign.FACTIONS.length; cfg.biome = 'ausgewogen'; cfg.victory = 'endlos'; }
    cfg.bots = PW.clamp(cfg.bots | 0, 2, 8);
    const S = {
      v: PW.SCHEMA, mode: cfg.mode, cfg, seed: cfg.seed, time: 0, rng: PW.hash('spiel:' + cfg.seed), speed: 1,
      res: Object.assign(PW.emptyRes(), G.START_RES[cfg.start] || G.START_RES.normal), spent: {}, stats: {},
      city: { b: [], uid: 0, gate: 0 },
      pop: { h: 18, r: 2, i: 2, q: 0, t: 0, rec: 0, dead: 0, fled: 0, sat: 58, grief: 0, acc: {} },
      research: { done: {}, cur: null }, troops: { spear: 10, bow: 4 }, wounded: {}, recruit: [], heroes: {}, items: [],
      world: null, fog: '', factions: [], rel: {}, marches: [], marchUid: 0, stationed: [], offers: [], reports: [], log: [],
      waves: { n: 0, next: PW.WAVES.first, active: null, warned: false }, events: { next: 300, active: [], pending: null },
      quests: { day: '', list: [], week: '', wlist: [] }, campaign: null, storyFlags: {}, ach: {}, blocs: [],
      created: Date.now(), playedMs: 0, savedAt: 0, victory: null, defeat: null, season: cfg.seasons ? PW.seasonOf(new Date()) : null
    };
    // Welt und Fraktionen
    S.world = Wd().generate({ seed: cfg.seed, size: cfg.size, bots: cfg.bots, biome: cfg.biome });
    S.fog = '0'.repeat(S.world.tiles.length);
    const pc = S.world.caps[0];
    S.world.tiles[pc].own = 'P';
    Wd().neighbors(S.world, pc).forEach(n => { const t = S.world.tiles[n]; if (!t.own && t.site < 0) t.own = 'P'; });
    Wd().reveal(S, pc, 3);
    let ids = cfg.mode === 'campaign' ? PW.Campaign.FACTIONS.slice() : (cfg.factions && cfg.factions.length ? cfg.factions.slice(0, cfg.bots) : null);
    if (!ids) { ids = PW.FACTIONS.map(f => f.id); const r = PW.makeRng('fraktionen:' + cfg.seed); for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; } ids = ids.slice(0, cfg.bots); }
    PW.AI.init(S, ids, G.START_RES[cfg.start] || G.START_RES.normal);
    // Verschollene Helden in Ruinen (Freies Spiel): faire Fundorte statt Glückskauf
    if (cfg.mode !== 'campaign') {
      const lost = PW.HEROES.filter(h => h.unlock === 'kampagne').map(h => h.id), ruins = S.world.sites.filter(s => s.type === 'ruin').sort((a, b) => Wd().dist(S.world, a.tile, pc) - Wd().dist(S.world, b.tile, pc));
      lost.forEach((h, k) => { const s = ruins[k]; if (s) s.hero = h; });
    }
    // Startstadt
    const mk = (t, x, y, lv, rot) => C().create(S, t, x, y, rot || 0, lv || 1, 'ok');
    mk('hq', C().HQ.x, C().HQ.y); S.city.b.push({ id: ++S.city.uid, t: 'mauer', x: 0, y: 0, w: 0, h: 0, rot: 0, lv: 1, hp: PW.BLD.mauer.hp, st: 'ok', rem: 0, pause: false });
    mk('haus', 10, 12); mk('haus', 10, 15); mk('farm', 18, 8); mk('saege', 6, 8); mk('steinbruch', 6, 18); mk('brunnen', 17, 13); mk('turm_pfeil', 12, 24); mk('turm_pfeil', 17, 24);
    if (cfg.mode !== 'campaign') mk('heilstube', 17, 16);
    for (let y = 16; y <= 20; y++) { mk('weg', 13, y); }
    PW.Heroes.unlock(S, 'hildrun'); PW.Heroes.unlock(S, 'veit');
    S.stats = {}; S.log = [];
    G.refresh(S);
    S.city.gate = C().gateMax(S);
    if (cfg.mode === 'campaign') PW.Campaign.start(S);
    else PW.log(S, '🏰 Eine neue Zuflucht entsteht. ' + ids.length + ' Computerfraktionen teilen sich das Land. Siegziel: ' + G.VICTORY[cfg.victory], 'story');
    G.quests(S, new Date());
    return S;
  };

  // abgeleitete Werte neu berechnen (nicht gespeichert)
  G.refresh = function (S) {
    S._mods = PW.playerMods(S);
    C().derive(S);
    PW.Econ.assignWorkers(S);
    C().derive(S);
    const pc = S.world.caps[0], ring = Wd().within(S.world, pc, 2);
    S._regionPlague = ring.reduce((s, i) => s + S.world.tiles[i].pl, 0) / ring.length;
    const gm = C().gateMax(S); if (S.city.gate > gm) S.city.gate = gm;
    S._safety = Math.min(10, S._d.towers.length * 1.2 + (C().lv(S, 'mauer') - 1) * 1.5);
  };

  // Erträge eigener Regionen (Spieler)
  function regions(S, dt) {
    const mins = dt / 60, pc = S.world.caps[0], add = {}; let n = 0;
    S.world.tiles.forEach((t, i) => {
      if (t.own !== 'P' || i === pc) return; n++;
      const bp = PW.BIOMES[t.b].prod; for (const k in bp) add[k] = (add[k] || 0) + bp[k] * 0.5;
      const s = Wd().siteAt(S, i); if (s && PW.SITES[s.type].prod) for (const k in PW.SITES[s.type].prod) add[k] = (add[k] || 0) + PW.SITES[s.type].prod[k] * 0.6;
    });
    for (const k in add) { const got = PW.addRes(S.res, { [k]: add[k] * mins }, S._caps); PW.stat(S, 'prod.' + k, got); }
    const upkeep = Math.max(0, n - 6) * 0.4 * mins;           // weite Gebiete kosten Verwaltung
    S.res.coin = Math.max(0, S.res.coin - upkeep);
    S._regionIncome = add; S._regionUpkeep = Math.max(0, n - 6) * 0.4;
    // Seuche breitet sich langsam aus Nestern aus und klingt sonst ab
    if ((S._plAcc = (S._plAcc || 0) + dt) >= 30) {
      S._plAcc = 0;
      S.world.sites.forEach(s => { if ((s.type === 'lair' || s.type === 'boss' || (s.type === 'key' && s.gar && s.gar.mon)) && !s.cleared) Wd().neighbors(S.world, s.tile).forEach(j => { S.world.tiles[j].pl = Math.min(1, S.world.tiles[j].pl + 0.01); }); });
      S.world.tiles.forEach(t => { const base = PW.BIOMES[t.b].plague; if (t.pl > base) t.pl = Math.max(base, t.pl - 0.004); });
      // Siedlungen füllen sich langsam wieder mit Hilfesuchenden
      S.world.sites.forEach(s => { if (s.type === 'village' && s.patients < 8 && S.time - (s.rescuedAt || 0) > 600) s.patients++; });
    }
  }

  // ---------- Ereignisse ----------
  G.events = function (S, dt) {
    const E = S.events;
    E.active = E.active.filter(e => e.until > S.time);
    if (E.pending && S.time > E.pending.until) G.answerEvent(S, false);
    if (S.time < E.next || S.waves.active || (S.campaign && S.campaign.idx < 2)) return;
    const f = G.DISASTER[S.cfg.disasters] || 1;
    E.next = S.time + (200 + PW.rand(S) * 220) * f;
    let tot = 0; PW.EVENTS.forEach(e => { tot += e.w; });
    let r = PW.rand(S) * tot, ev = PW.EVENTS[0];
    for (const e of PW.EVENTS) { r -= e.w; if (r <= 0) { ev = e; break; } }
    G.fireEvent(S, ev.id);
  };
  G.fireEvent = function (S, id) {
    const ev = PW.EVENT[id], E = S.events;
    if (ev.choice) {
      const offer = { id, until: S.time + 90 };
      if (id === 'fluechtlinge') { offer.n = 5 + PW.randInt(S, 7); offer.sick = Math.ceil(offer.n * 0.3); }
      if (id === 'lieferung') { offer.give = { food: 200, wood: 120 }; offer.cost = { coin: 130 }; }
      if (id === 'haendler') { offer.give = { med: 40 }; offer.cost = { coin: 160 }; }
      E.pending = offer;
      PW.log(S, ev.icon + ' ' + ev.name + ': ' + ev.desc, 'event', { event: 1 });
      return;
    }
    if (ev.dur) E.active.push({ id, until: S.time + ev.dur });
    if (id === 'epidemie') { const n = Math.min(3, S.pop.h); S.pop.h -= n; S.pop.i += n; }
    if (id === 'ueberfall') { S.events.raidAt = S.time + 45; }
    if (id === 'durchbruch') PW.addRes(S.res, { know: 80, med: 20 }, S._caps);
    PW.log(S, ev.icon + ' ' + ev.name + ': ' + ev.desc, 'event');
  };
  G.answerEvent = function (S, yes) {
    const o = S.events.pending; if (!o) return false;
    S.events.pending = null;
    if (!yes) { PW.log(S, 'Angebot abgelehnt: ' + PW.EVENT[o.id].name, 'event'); return true; }
    if (o.id === 'fluechtlinge') {
      const room = Math.max(0, Math.floor(S._d.house - PW.Econ.popTotal(S.pop))), n = Math.min(o.n, room + 2), sick = Math.min(o.sick, n);
      S.pop.h += n - sick; S.pop.i += sick; PW.stat(S, 'arrived', n);
      PW.log(S, '🧳 ' + n + ' Flüchtlinge aufgenommen (' + sick + ' davon krank)', 'gut');
    } else if (o.cost) {
      if (!PW.pay(S.res, o.cost, S.spent)) { PW.log(S, 'Zu wenig Münzen für das Angebot', 'warn'); return false; }
      PW.addRes(S.res, o.give, S._caps); PW.log(S, 'Gekauft: ' + PW.costText(o.give), 'handel');
    }
    return true;
  };

  // ---------- Tägliche/wöchentliche Aufgaben (lokaler Kalender) ----------
  G.dayKey = d => d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
  G.weekKey = d => { const t = new Date(d.getFullYear(), d.getMonth(), d.getDate()); t.setDate(t.getDate() - ((t.getDay() + 6) % 7)); return 'W' + G.dayKey(t); };
  G.quests = function (S, date) {
    const q = S.quests, dk = G.dayKey(date), wk = G.weekKey(date);
    const make = (key, n, tierMul) => {
      const r = PW.makeRng(key + ':' + S.seed), pool = PW.QUESTS.slice(), out = [];
      for (let k = 0; k < n && pool.length; k++) {
        const d = pool.splice(Math.floor(r() * pool.length), 1)[0], tier = Math.min(2, Math.floor(r() * 3));
        out.push({ id: d.id, name: d.name.replace('{n}', d.n[tier] * tierMul), stat: d.stat, n: d.n[tier] * tierMul, base: Math.floor(S.stats[d.stat] || 0), reward: PW.scaleCost(d.reward, tierMul * (1 + tier * 0.5)), claimed: false });
      }
      return out;
    };
    if (q.day !== dk) { q.day = dk; q.list = make('tag' + dk, 3, 1); }
    if (q.week !== wk) { q.week = wk; q.wlist = make('woche' + wk, 2, 3); }
    S.season = S.cfg.seasons ? PW.seasonOf(date) : null;
  };
  G.questProgress = (S, x) => Math.min(x.n, Math.floor((S.stats[x.stat] || 0) - x.base));
  G.claimQuest = function (S, x) {
    if (x.claimed || G.questProgress(S, x) < x.n) return false;
    x.claimed = true; PW.addRes(S.res, x.reward, S._caps); PW.log(S, '🎁 Aufgabe erfüllt: ' + x.name + ' · ' + PW.costText(x.reward), 'gut'); return true;
  };

  // ---------- Sieg und Niederlage ----------
  G.checkEnd = function (S) {
    const pop = PW.Econ.popTotal(S.pop);
    if (pop <= 0 && !S.defeat) { S.defeat = { t: S.time }; PW.log(S, '💀 Die Zuflucht ist verlassen. Du kannst mit wenigen Überlebenden neu beginnen.', 'warn'); }
    if (S.victory || S.mode === 'campaign') return;
    const v = S.cfg.victory, alive = PW.AI.alive(S);
    let won = false;
    if (v === 'gebiet') won = Wd().tilesOf(S, 'P').length >= S.world.tiles.length * 0.45;
    else if (v === 'heilung') won = !!S.research.done.h8 && !S.world.sites.some(s => (s.type === 'lair' || s.type === 'boss') && !s.cleared);
    else if (v === 'diplomatie') won = alive.length >= 1 && alive.every(f => PW.Diplo.rel(S, 'P', f.id).ally || f.vassalOf === 'P');
    else if (v === 'wirtschaft') won = S.res.coin >= 20000 && pop >= 120;
    if (won) { S.victory = { kind: v, t: S.time }; PW.stat(S, 'victories'); PW.log(S, '👑 SIEG: ' + G.VICTORY[v] + '! Du kannst weiterspielen.', 'gut'); }
  };
  G.rebuild = function (S) {
    if (!S.defeat) return false;
    S.defeat = null; S.pop.h += 10; PW.RES.forEach(k => { S.res[k] = Math.max(S.res[k], 100); }); S.pop.sat = 50;
    PW.log(S, '🌱 Zehn Überlebende kehren zurück. Der Wiederaufbau beginnt.', 'story'); return true;
  };

  // ---------- Fester Takt ----------
  G.tick = function (S, dt) {
    S.time += dt;
    G.refresh(S);
    PW.Econ.produce(S, dt);
    regions(S, dt);
    PW.Econ.population(S, dt);
    if (PW.Ward) PW.Ward.tick(S, dt);
    C().progress(S, dt);
    PW.Econ.researchTick(S, dt);
    PW.Econ.recruitTick(S, dt);
    PW.Econ.woundedTick(S, dt);
    Object.keys(S.heroes).forEach(id => { const h = S.heroes[id]; if (h.inj > 0) h.inj = Math.max(0, h.inj - dt); });
    const guild = C().lv(S, 'heldengilde'); if (guild) Object.keys(S.heroes).forEach(id => { if (S.heroes[id].where === 'stadt') PW.Heroes.addXp(S, id, guild * 3 * dt / 60); });
    PW.March.tick(S, dt);
    PW.AI.tick(S, dt);
    if ((S._dAcc = (S._dAcc || 0) + dt) >= 30) { S._dAcc = 0; PW.Diplo.drift(S); PW.Diplo.trackBlocs(S); }
    PW.Waves.tick(S, dt);
    if (S.events.raidAt && S.time >= S.events.raidAt && !S.waves.active) { S.events.raidAt = 0; PW.Waves.start(S, { raid: true }); }
    G.events(S, dt);
    if (PW.Campaign && S.campaign) PW.Campaign.tick(S, dt);
    if ((S._eAcc = (S._eAcc || 0) + dt) >= 5) { S._eAcc = 0; G.checkEnd(S); G.achievements(S); }
  };
  // Echtzeit → feste Schritte. Liefert die Anzahl ausgeführter Schritte.
  G.advance = function (S, realDt, maxSteps) {
    if (S.paused) return 0;
    realDt = PW.clamp(realDt, 0, 0.25);                     // Tab im Hintergrund: keine Riesensprünge
    S._acc = (S._acc || 0) + realDt * (S.speed || 1);
    let n = 0; maxSteps = maxSteps || 40;
    while (S._acc >= PW.TICK && n < maxSteps) { S._acc -= PW.TICK; G.tick(S, PW.TICK); n++; }
    if (n >= maxSteps) S._acc = 0;
    return n;
  };
  // Beschleunigtes Warten: bis zum nächsten fertigen Auftrag (höchstens 10 Spielminuten), alles wird simuliert
  G.skipTime = function (S, maxSec) {
    maxSec = maxSec || 600;
    const targets = [];
    S.city.b.forEach(b => { if (b.st !== 'ok') targets.push(b.rem); });
    if (S.research.cur) targets.push(S.research.cur.rem);
    S.recruit.forEach(r => targets.push(r.rem));
    const until = Math.min(maxSec, targets.length ? Math.min.apply(null, targets) + 0.5 : maxSec);
    let t = 0; while (t < until && !S.waves.active) { G.tick(S, PW.TICK); t += PW.TICK; }
    return t;
  };
  // Offline-Zeit: nur Produktion und laufende Aufträge (keine Angriffe, keine Bot-Kriege)
  G.offline = function (S, seconds) {
    const cap = S.cfg.offlineCap == null ? PW.BAL.offlineCapDefault : S.cfg.offlineCap;
    seconds = PW.clamp(seconds || 0, 0, cap);
    if (seconds < 30) return null;
    const before = Object.assign({}, S.res), step = 5;
    for (let t = 0; t < seconds; t += step) {
      G.refresh(S); PW.Econ.produce(S, step); regions(S, step); C().progress(S, step); PW.Econ.researchTick(S, step); PW.Econ.recruitTick(S, step);
    }
    const gain = {}; PW.RES.forEach(k => { const d = Math.floor(S.res[k] - before[k]); if (d) gain[k] = d; });
    PW.log(S, '🌙 Während deiner Abwesenheit (' + PW.fmtTime(seconds) + '): ' + (Object.keys(gain).length ? Object.keys(gain).map(k => PW.RES_INFO[k].icon + (gain[k] > 0 ? '+' : '') + gain[k]).join(' ') : 'keine Änderung'), 'info');
    return { seconds, gain };
  };

  // ---------- Erfolge ----------
  G.achievements = function (S) {
    S.stats.heroes = Object.keys(S.heroes).length;
    S.stats.maxTiles = Math.max(S.stats.maxTiles || 0, Wd().tilesOf(S, 'P').length);
    let neu = [];
    PW.ACH.forEach(a => { if (!S.ach[a.id] && (S.stats[a.stat] || 0) >= a.n) { S.ach[a.id] = Date.now(); neu.push(a); PW.log(S, a.icon + ' Erfolg: ' + a.title, 'erfolg'); } });
    if (neu.length && S._ui && S._ui.achievement) neu.forEach(a => S._ui.achievement(a));
    return neu;
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = PW;
})(typeof window !== 'undefined' ? window : globalThis);
