/* Urwaldlager – Staffel: Spielstand, Uhr & Tagesablauf, simuliertes Publikum (transparent), Prüfungen, Essen,
   Schlafen, Abendrunden mit Ausscheidung, Finale, Speichern/Laden/Migration */
(function (root) {
  'use strict';
  const E = root.UE, W = root.UWorld, D = root.JD, C = root.UCamp, T = root.UTrials, clamp = E.clamp;
  const SAVE = 'ul_save', BEST = 'ul_best', VERSION = 2;
  const S = { G: null, frozen: false };
  let G = null, UI = null, Snd = null;
  const nm = c => C.nm(c), pick = a => a[Math.floor(Math.random() * a.length)];
  const fmt = (s, o) => s.replace(/\{(\w)\}/g, (m, k) => o[k] != null ? o[k] : m);
  const TRIAL_IDS = ['bruecke', 'tunnel', 'dunkel', 'hoehe', 'tauchen', 'parcours', 'schatz', 'labyrinth', 'dinner', 'liane', 'totem', 'staffel'];
  const FINAL_PARTS = [{ id: 'hoehe', max: 3 }, { id: 'labyrinth', max: 3 }, { id: 'dinner', max: 3 }];
  S.TRIAL_IDS = TRIAL_IDS; S.FINAL_PARTS = FINAL_PARTS;
  const tdef = id => T.defs[id] || { id, name: 'Prüfung', e: '⭐', stat: 'mut', kind: 'Mut' };
  const RATE = { langsam: 1.25, normal: 2, schnell: 3 };
  S.init = (ui) => { UI = ui; Snd = root.USnd; };

  // ---------- Neue Staffel ----------
  S.create = function (o) {
    const L = D.SEASONS[o.len] || D.SEASONS.normal, n = L.n, rnd = E.rand(o.seed || (Date.now() & 0xffffff));
    const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; };
    let pool = o.castIds && o.castIds.length ? D.CAST.filter(c => o.castIds.includes(c.id)) : [];
    if (pool.length < n - 1) pool = pool.concat(shuffle(D.CAST.filter(c => !pool.includes(c))).slice(0, n - 1 - pool.length));
    pool = pool.slice(0, n - 1);
    const build = { rocco: 1.18, kalle: 1.1, egon: .96, mandy: .92, tina: .94, sunny: .95, nele: .94, lilo: .95, gisela: .98 };
    const height = { rocco: 1.04, kalle: 1.05, mandy: .95, gisela: .93, egon: 1.02, tina: .97, nele: .96 };
    const mk = (c, i) => ({ id: c.id, name: c.name, short: c.short, job: c.job, age: c.age, mut: c.mut, ekel: c.ekel, kopf: c.kopf, trait: c.trait,
      look: { skin: c.skin, hair: c.hair, hs: c.hs, top: c.top, acc: c.acc || [], pants: D.PANTS[i % D.PANTS.length], build: build[c.id] || 1, h: height[c.id] || 1 },
      out: false, outDay: 0, stars: 0, trials: 0, lastTrial: -9, aud: { S: 50 + (c.trait === 'kumpel' ? 4 : c.trait === 'diva' ? -4 : 0), P: 50, E: 50 + (c.trait === 'clown' || c.trait === 'diva' ? 6 : 0) }, needs: { hunger: 80, energy: 85, mood: 65 }, work: 0, workDay: 0, ally: false });
    const t = D.TYPES[o.type || 0];
    const you = Object.assign(mk({ id: 'you', name: o.name, short: o.name, job: t.name, age: 30, mut: t.mut, ekel: t.ekel, kopf: t.kopf, trait: 'you', skin: o.look.skin, hair: o.look.hair, hs: o.look.hs, top: o.look.top, acc: [] }, 5), {});
    you.look.pants = '#3a3a4a'; you.aud.S = t.sym; you.aud.E = 50;
    const cast = [you].concat(pool.map(mk));
    S.dayTurning = false; S.entering = false;
    G = S.G = {
      v: VERSION, seed: o.seed || 1, settings: { len: o.len, diff: o.diff == null ? 1 : o.diff, mode: o.mode || 'taeglich', speed: o.speed || 'normal', type: o.type || 0 },
      n, days: n - 1, day: 1, clock: 8 * 60, cast, you: null, rel: {}, friends: [], rivals: [], gossip: [], usedMoments: [], usedCampfire: [], usedEvents: [], log: [], audLog: {}, outOrder: [],
      camp: { wood: 4, water: 4, fuel: .7, meal: { ready: false, q: 0, eaten: [] }, wet: false, luxury: 0 },
      trialOrder: shuffle(TRIAL_IDS.filter(id => T.defs[id])), results: [], decisions: [], today: null, tut: { on: true, done: [] }, player: { x: 0, z: 22, yaw: Math.PI }, over: false, intro: true, weatherSeed: Math.floor(rnd() * 1e6)
    };
    // Startbeziehungen nach Verträglichkeit
    cast.forEach(a => cast.forEach(b => { if (a.id < b.id) G.rel[C.key(a.id, b.id)] = Math.round((a.id === 'you' || b.id === 'you') ? 0 : D.aff(a.trait, b.trait) * 18 + (rnd() - .5) * 16); }));
    linkYou(); newToday(); return G;
  };
  function linkYou() { G.you = G.cast.find(c => c.id === 'you'); Object.defineProperty(G, 'you', { value: G.cast.find(c => c.id === 'you'), enumerable: false, configurable: true, writable: true }); }
  S.alive = () => G.cast.filter(c => !c.out);
  S.hour = () => G.clock / 60;
  S.isNight = () => { const h = S.hour(); return h >= 22.5 || h < 6; };
  S.isElimDay = d => { d = d || G.day; return d >= 2 && d <= G.days - 1; };
  S.isFinal = () => G.day >= G.days;
  S.favor = id => { const a = S.cast(id).aud; return a.S * .45 + a.P * .25 + a.E * .3; };
  S.cast = id => G.cast.find(c => c.id === id);
  S.log = txt => { G.log.push({ d: G.day, t: Math.round(G.clock), txt }); if (G.log.length > 160) G.log.shift(); };

  // ---------- Simuliertes Publikum (transparent, keine echten Stimmen) ----------
  S.aud = function (id, d, why, silent) {
    const c = S.cast(id); if (!c || c.out) return; const a = c.aud; const tot = {};
    ['S', 'P', 'E'].forEach(k => { if (d[k]) { const v = clamp(a[k] + d[k], 0, 100); tot[k] = v - a[k]; a[k] = v; } });
    if (!Object.keys(tot).length) return; const L = G.audLog[id] = G.audLog[id] || []; L.push({ d: G.day, why, ...tot }); if (L.length > 30) L.shift();
    if (id === 'you' && !silent && UI) UI.audPing(tot, why);
  };
  function nightDrift() { G.cast.forEach(c => { if (c.out) return; ['S', 'P', 'E'].forEach(k => { c.aud[k] += (50 - c.aud[k]) * .08; }); }); }
  // Wer soll heute zur Prüfung? (Unterhaltungswert, Neugier, Lust auf Leiden der Beliebten)
  S.trialWish = function () {
    const r = E.rand(G.seed * 31 + G.day * 977);
    return S.alive().map(c => { const since = Math.min(4, G.day - c.lastTrial - 1), w = c.aud.E * .45 + (100 - c.aud.S) * .15 + c.aud.S * .1 + since * 7 + r() * 8; return { c, w }; }).sort((a, b) => b.w - a.w);
  };
  function percents(vals) { const t = vals.reduce((a, b) => a + b, 0) || 1, p = vals.map(v => Math.floor(v / t * 100)); let rest = 100 - p.reduce((a, b) => a + b, 0); const ord = vals.map((v, i) => i).sort((a, b) => vals[b] - vals[a]); for (let k = 0; rest > 0; k++, rest--) p[ord[k % ord.length]]++; return p; }
  S.percents = percents;
  S.elimRanking = function () { // höchster Wert = muss gehen
    const r = E.rand(G.seed * 13 + G.day * 101);
    const list = S.alive().map(c => { const f = S.favor(c.id) + (r() - .5) * 4; return { c, f, w: Math.pow(Math.max(4, 100 - f), 2.2) }; });
    const p = percents(list.map(x => x.w)); list.forEach((x, i) => { x.p = p[i]; }); return list.sort((a, b) => b.w - a.w);
  };

  // ---------- Tagesbeginn ----------
  function weatherFor(day) { const r = E.rand(G.weatherSeed + day * 71)(); return r < .45 ? 'sun' : r < .7 ? 'cloud' : r < .88 ? 'rainpm' : 'stormnight'; }
  function newToday() {
    const day = G.day, n = S.alive().length; const rnd = E.rand(G.seed + day * 4243);
    const evs = []; if (day >= 2 && day < G.days) { const deck = ['affe', 'streit', 'schlange', 'regen', 'heimweh'].filter(e => !G.usedEvents.includes(e)); const pool = deck.length ? deck : ['affe', 'streit', 'schlange', 'regen', 'heimweh']; const k = rnd() < .55 ? 2 : 1; for (let i = 0; i < k && pool.length; i++) { const id = pool.splice(Math.floor(rnd() * pool.length), 1)[0]; evs.push({ id, at: (i ? 15 : 12.5) * 60 + rnd() * 90, done: false }); } }
    G.today = { nominees: [], trialId: S.isFinalDay(day) ? 'finale' : (ids => ids.length ? ids[(day - 1) % ids.length] : 'bruecke')(G.trialOrder.filter(id => T.defs[id])), trialDone: false, npcTrialDone: false, npcTrialGone: false, npcResult: null, announced: false, events: evs, mission: null,
      breakfast: false, dinnerDone: false, drinks: [], ceremonyCalled: false, ceremonyDone: false, ceremonyRunning: false, campfireDone: false, diaryDone: false, talked: {}, args: 0, moments: 0, weather: weatherFor(day), volunteer: false, stars: 0, maxStars: 0, night: rnd() < .35 && day >= 2 && day < G.days - 1 ? 'dieb' : null };
    if (day >= 2 && day < G.days && rnd() < .45) G.today.missionPlan = rnd() < .5 ? 'invite' : 'post';
    G.cast.forEach(c => { c.workDay = 0; c.seenHelp = 0; c.reform = false; });
    G.camp.meal = { ready: false, q: 0, eaten: [] }; G.camp.wet = false; G.camp.luxury = Math.max(0, (G.camp.luxury || 0) - 1);
  }
  S.isFinalDay = d => (d || G.day) >= G.days;
  S.weatherNow = () => { const w = G.today.weather, h = S.hour(); if (G.today.forceRain) return 'rain'; if (w === 'cloud') return 'cloud'; if (w === 'rainpm') return h >= 14 && h < 17.5 ? 'rain' : h >= 13 && h < 18 ? 'cloud' : 'sun'; if (w === 'stormnight') return h >= 22 || h < 2 ? 'storm' : h >= 19 ? 'cloud' : 'sun'; return 'sun'; };

  // Morgendliche Ansage der Buschtrommel
  function announce() {
    G.today.announced = true; const t = G.today, wish = S.trialWish();
    if (S.isFinalDay()) { t.nominees = S.alive().map(c => c.id); UI.announce({ title: '🏆 Finaltag!', html: `<p>${pick(D.HOST.final)}</p><p>Heute um <b>10 Uhr</b> treten alle drei Finalisten in der <b>großen Urwald-Krone</b> an: drei Prüfungen hintereinander (${FINAL_PARTS.map(p => T.defs[p.id] ? T.defs[p.id].e + ' ' + T.defs[p.id].name : p.id).join(' · ')}).</p><p>Am Abend entscheidet das simulierte Publikum über den Sieg.</p>` }); S.log('Finaltag beginnt.'); return; }
    if (G.settings.mode === 'taeglich' || t.volunteer) { const partner = wish.find(x => x.c.id !== 'you' && x.c.lastTrial !== G.day - 1) || wish.find(x => x.c.id !== 'you'); t.nominees = ['you'].concat(partner ? [partner.c.id] : []); }
    else t.nominees = [wish[0].c.id];
    const def = tdef(t.trialId), names = t.nominees.map(id => id === 'you' ? '<b>dich</b>' : '<b>' + nm(S.cast(id)) + '</b>').join(' und ');
    const top = wish.slice(0, 4).map(x => `<div class="facts"><span>${x.c.id === 'you' ? 'Du' : nm(x.c)}</span><div class="bar g"><i style="width:${Math.round(clamp(x.w, 0, 100))}%"></i></div><small>${Math.round(x.w)}</small></div>`).join('');
    UI.announce({ title: `🥁 Tag ${G.day}: Die Buschtrommel`, html: `<p>${fmt(pick(D.HOST.morning), { d: G.day })}</p><p>Heute geht es für ${names} zur Prüfung <b>${def.e} ${def.name}</b> – um 10 Uhr am Prüfungstor (Süden).</p>${G.settings.mode === 'taeglich' && !t.volunteer ? '<p class="h">Spielmodus „Täglich antreten“: Du bist jeden Tag dabei, das simulierte Publikum wählt deine Begleitung.</p>' : ''}<div class="sim">Simuliertes Publikum – keine echten Zuschauerstimmen. Prüfungswunsch = Unterhaltungswert, Neugier (Tage seit letzter Prüfung) und etwas Zufall:</div>${top}${t.missionPlan ? '<p>📜 Außerdem liegt eine <b>geheime Botschaft</b> für dich in der Trommel – schau sie dir an!</p>' : ''}` });
    if (t.missionPlan) startMission(t.missionPlan);
    S.log('Prüfung heute: ' + def.name + ' – ' + t.nominees.map(id => id === 'you' ? 'du' : nm(S.cast(id))).join(' & '));
    t.nominees.forEach(id => { if (id !== 'you') C.say(id, 'trial'); });
  }
  S.announce = announce;
  function startMission(kind) {
    const t = G.today; const others = S.alive().filter(c => c.id !== 'you').length;
    if (kind === 'invite') t.mission = { kind, need: Math.min(3, others), ids: [], done: false, text: `Lade mindestens ${Math.min(3, others)} Mitcamper zum Lagerfeuer ein (im Gespräch) und setz dich heute Abend mit ihnen ans Feuer.` };
    else { const spots = W.branches.slice().sort(() => Math.random() - .5).slice(0, 3).map(b => ({ x: b.x + 1.6, z: b.z - 1.2, got: false })); t.mission = { kind, spots, done: false, until: 17 * 60, text: 'Finde bis 17 Uhr drei versteckte Lianenpost-Umschläge im Dschungel rund ums Camp (Minikarte: gelbe Punkte).' }; }
    if (root.UEvents) root.UEvents.missionSetup && root.UEvents.missionSetup();
  }
  S.missionDone = function () { const m = G.today.mission; if (!m || m.done) return; m.done = true; G.camp.luxury = 2; S.aud('you', { E: 4, S: 2 }, 'erfüllt den Geheimauftrag'); C.alive().forEach(c => { c.needs.mood = Math.min(100, c.needs.mood + 15); }); UI.announce({ title: '🍫 Geheimauftrag erfüllt!', html: '<p>Die Buschtrommel belohnt das Camp mit <b>Schokoriegeln für alle</b>. Die Stimmung steigt – und das simulierte Publikum feiert dich.</p>' }); S.log('Geheimauftrag erfüllt – Schokolade fürs Camp!'); Snd.fan(); };

  // ---------- Uhr ----------
  S.advance = min => { G.clock += min; };
  S.trialReady = () => { const t = G.today; return t.nominees.includes('you') && !t.trialDone && S.hour() >= 9.25 && S.hour() < 21; };
  S.isAwayForTrial = id => { const t = G.today; return t && t.nominees.includes(id) && t.npcTrialGone && !t.npcTrialDone; };
  S.canSleep = () => { const h = S.hour(), t = G.today; return (h >= 21.5 || h < 5) && !(t.ceremonyCalled && !t.ceremonyDone) && (t.trialDone || !t.nominees.includes('you')); };
  S.rate = () => RATE[G.settings.speed] || 2;
  S.update = function (dt) {
    const t = G.today; if (G.over) return; let h = S.hour();
    // eingefrorene Uhr an Pflichtterminen
    let frozen = false;
    if (t.nominees.includes('you') && !t.trialDone && G.clock >= 600) { frozen = true; G.clock = 600; }
    if (t.ceremonyCalled && !t.ceremonyDone && G.clock >= 1260) { frozen = true; G.clock = 1260; }
    if (G.intro) frozen = true;
    S.frozen = frozen; const gm = frozen || UI.modalOpen() ? 0 : dt * S.rate();
    G.clock += gm; h = S.hour();
    if (gm > 0) C.needsTick(gm);
    if (!t.announced && h >= 7.5 && !G.intro) announce();
    if (!t.breakfast && h >= 9) S.breakfast(null);
    // Trinkwasser
    [12, 16].forEach(dh => { if (h >= dh && !t.drinks.includes(dh)) { t.drinks.push(dh); const need = S.alive().length > 7 ? 2 : 1; if (G.camp.water >= need) { G.camp.water -= need; W.updateProps(G.camp); } else { G.camp.water = 0; W.updateProps(G.camp); S.alive().forEach(c => { c.needs.energy = Math.max(0, c.needs.energy - 10); c.needs.mood -= 6; }); UI.toast('💧 Kein Trinkwasser im Fass! Alle sind durstig (−10 Energie).', 'bad'); S.log('Das Wasserfass war leer – Durst im Camp.'); } } });
    // NPC-Prüfung
    if (t.nominees.some(id => id !== 'you') && !t.npcTrialDone && t.npcTrialGone && h >= 12.5) npcTrialResult();
    if (t.nominees.some(id => id !== 'you') && !t.npcTrialGone && h >= 10.5) { t.npcTrialGone = true; t.nominees.forEach(id => { const n = C.byId[id]; if (n) { n.away = true; n.fig.group.visible = false; n.act = null; } }); }
    // Abendessen
    if (!t.dinnerDone && h >= 19.25 && !G.camp.meal.ready) { t.dinnerDone = true; S.alive().forEach(c => { c.needs.hunger = Math.min(100, c.needs.hunger + 12); c.needs.mood -= 6; }); UI.toast('🥶 Niemand hat gekocht – es gibt nur kalten Reis (+12).', 'bad'); S.log('Kein Abendessen gekocht – kalter Reis.'); }
    if (G.camp.meal.ready && h >= 21.75) { G.camp.meal.ready = false; }
    // Ereignisse
    if (root.UEvents) root.UEvents.tick(dt, gm);
    // Abendrunde
    if (!t.ceremonyCalled && h >= 20.75 && (S.isElimDay() || S.isFinalDay()) && (t.trialDone || !t.nominees.includes('you'))) { t.ceremonyCalled = true; UI.announce({ title: '🎤 Abendrunde', html: `<p>${pick(D.HOST.call)}</p><p>Geh zum <b>Moderationsfelsen</b> im Westen des Camps.</p>`, short: true }); Snd.drum(); C.npcs.forEach(n => { if (n.act && n.act.type !== 'sleep') n.act = null; }); }
    if (!S.isElimDay() && !S.isFinalDay() && !t.noElimMsg && h >= 21) { t.noElimMsg = true; UI.toast('🥁 ' + pick(D.HOST.noElim)); }
    if (h >= 25.5 && W.player.state !== 'sleep') { UI.toast('😵 Du schläfst vor Erschöpfung im Stehen ein …', 'bad'); G.you.needs.energy = Math.min(G.you.needs.energy, 30); S.goSleep(true); }
  };

  // ---------- Essen ----------
  S.breakfast = function (cookId) { const t = G.today; if (t.breakfast) return; t.breakfast = true; const ok = G.camp.water > 0; if (ok) { G.camp.water--; W.updateProps(G.camp); } S.alive().forEach(c => { c.needs.hunger = Math.min(100, c.needs.hunger + (ok ? 24 : 12)); }); if (cookId && cookId !== 'you') { C.say(cookId, 'cook'); S.aud(cookId, { S: 1 }, 'macht Frühstück', true); } UI.toast(ok ? '🍚 Frühstück: Reis für alle (+24 Sattheit)' : '🍚 Trockener Reis ohne Wasser (+12)'); };
  S.cookMeal = function (cookId, q) {
    const cp = G.camp; if (cp.meal.ready || G.today.dinnerDone) return; cp.water = Math.max(0, cp.water - 2); cp.fuel = Math.max(.05, cp.fuel - .08); W.updateProps(cp);
    const sf = G.today.maxStars ? G.today.stars / G.today.maxStars : (G.today.trialDone || G.today.npcTrialDone ? 0 : .3), qual = clamp((.25 + q * .35 + sf * .4) * (G.today.noSpice ? .8 : 1), 0, 1);
    cp.meal = { ready: true, q: qual, eaten: [], restore: Math.round(22 + qual * 50), cook: cookId }; G.today.dinnerDone = true;
    S.log(`${cookId === 'you' ? 'Du kochst' : nm(S.cast(cookId)) + ' kocht'} das Abendessen (${Math.round(qual * 100)} %).`);
    if (cookId !== 'you') { S.aud(cookId, { S: 2 }, 'kocht fürs Camp', true); UI.toast(`🍲 ${nm(S.cast(cookId))} hat gekocht – Essen am Feuer!`); }
  };
  S.eat = function (id) {
    const cp = G.camp, c = S.cast(id); if (!cp.meal.ready || cp.meal.eaten.includes(id) || !c) return; cp.meal.eaten.push(id); c.needs.hunger = Math.min(100, c.needs.hunger + cp.meal.restore); c.needs.mood = Math.min(100, c.needs.mood + cp.meal.q * 12);
    if (id === 'you') { UI.toast(`🍲 Abendessen: +${cp.meal.restore} Sattheit${G.today.stars ? ` (dank ${G.today.stars} Prüfungssternen)` : ''}`, 'good'); Snd.swallow(); if (cp.meal.cook && cp.meal.cook !== 'you') C.addRel(cp.meal.cook, 'you', 1, true); }
  };

  // ---------- Prüfungen ----------
  S.enterTrial = function () {
    if (!S.trialReady() || S.entering) return; const t = G.today, y = G.you, final = t.trialId === 'finale'; S.entering = true;
    C.standUp(); if (W.player.carry) C.carry(null); UI.hudHidden(true);
    const handi = clamp((60 - y.needs.energy) / 100 * .7 + (35 - y.needs.hunger) / 100 * .4, 0, .5);
    const opts = { level: G.settings.diff, handi, who: Object.assign({ name: y.name }, y.look) };
    const done = res => { S.entering = false; UI.hudHidden(false); trialResult(res, final); };
    UI.fade(() => {
      if (final) T.sequence(FINAL_PARTS, Object.assign({ seqLabel: 'FINALE · TEIL' }, opts), done);
      else T.start(t.trialId, Object.assign({ max: 6 }, opts), done);
    });
  };
  function simStars(c, def, max) { const r = E.rand(G.seed * 7 + G.day * 131 + c.id.length * 17 + c.id.charCodeAt(0)); const stat = c[def && def.stat || 'mut'] || 50; const f = clamp(.18 + stat / 100 * .58 + (c.needs.mood - 50) / 400 + (c.needs.energy - 50) / 500 - G.settings.diff * .06 + (r() - .5) * .36, 0, 1); return Math.round(f * max); }
  S.simStars = simStars;
  function trialResult(res, final) {
    const t = G.today, y = G.you; t.trialDone = true; Snd.ambience && Snd.ambience(true);
    const stars = res.stars, max = res.max, fr = max ? stars / max : 0; y.stars += stars; y.trials++; y.lastTrial = G.day;
    const dP = Math.round((fr - .45) * 34), dS = res.aborted || res.reason === 'abort' ? -4 : Math.round((fr - .3) * 8), dE = res.reason === 'abort' ? 4 : fr >= .8 ? 3 : 1;
    S.aud('you', { P: dP, S: dS, E: dE }, final ? 'Leistung im Finale' : `Prüfung „${tdef(res.id || t.trialId) ? tdef(res.id || t.trialId).name : 'Finale'}“: ${stars}/${max} ★`, true);
    t.stars += stars; t.maxStars += max;
    G.results.push({ d: G.day, id: final ? 'finale' : t.trialId, who: 'you', stars, max, reason: res.reason || (res.aborted ? 'abort' : 'done') });
    y.needs.energy = Math.max(0, y.needs.energy - 12); y.needs.mood = clamp(y.needs.mood + (fr - .4) * 30, 0, 100);
    if (final) { t.finalRes = { you: { stars, max, parts: res.parts } }; S.alive().forEach(c => { if (c.id === 'you') return; let s = 0, m = 0; FINAL_PARTS.forEach(p => { s += simStars(c, T.defs[p.id], p.max); m += p.max; }); t.finalRes[c.id] = { stars: s, max: m }; S.aud(c.id, { P: Math.round((s / m - .45) * 30) }, 'Leistung im Finale', true); }); }
    // Begleitung (Duo) – simuliert
    let partner = null; if (!final) { const pid = t.nominees.find(id => id !== 'you'); if (pid) { partner = npcTrial(pid); } }
    // Rückkehr ins Camp
    W.player.x = W.SP.gate.x + 1; W.player.z = W.SP.gate.z - 3; W.player.yaw = Math.PI; W.snapCam(true); if (G.clock < 12 * 60) G.clock = 12 * 60;
    const q = fr >= .67 ? 'good' : fr >= .34 ? 'ok' : 'bad';
    S.log(`${final ? 'Finale' : tdef(t.trialId).name}: du holst ${stars}/${max} Sterne.`);
    UI.trialResult({ final, res, q, line: pick(D.HOST[q]), partner, finalRes: t.finalRes, chips: [['Leistung', dP], ['Sympathie', dS], ['Unterhaltung', dE]] }, () => { S.save(); C.npcs.forEach(n => { if (n.act && n.act.phase === 'do' && ['sit', 'idle', 'wander'].includes(n.act.type) && Math.random() < .5) C.say(n.id, stars >= max * .67 ? 'cheer' : 'eat'); }); });
  }
  function npcTrial(id) {
    const c = S.cast(id), t = G.today, def = tdef(t.trialId), s = simStars(c, def, 6), fr = s / 6;
    c.stars += s; c.trials++; c.lastTrial = G.day; t.stars += s; t.maxStars += 6; t.npcTrialDone = true; t.npcResult = { id, stars: s };
    S.aud(id, { P: Math.round((fr - .45) * 30), S: Math.round((fr - .3) * 6), E: 2 }, `Prüfung: ${s}/6 ★`, true);
    G.results.push({ d: G.day, id: t.trialId, who: id, stars: s, max: 6, sim: true });
    const n = C.byId[id]; if (n) { n.away = false; n.fig.group.visible = true; n.x = W.SP.gate.x - 1; n.z = W.SP.gate.z - 3; n.act = null; C.say(id, s >= 4 ? 'cheer' : 'sad'); }
    return { c, stars: s };
  }
  function npcTrialResult() { const t = G.today; const id = t.nominees.find(x => x !== 'you'); if (!id) { t.npcTrialDone = true; return; } const r = npcTrial(id); UI.announce({ title: `🥁 Prüfungsergebnis`, html: `<p><b>${nm(r.c)}</b> kommt von „${tdef(t.trialId).name}“ zurück: <b>${r.stars} von 6 Sternen</b>. ${pick(D.HOST[r.stars >= 4 ? 'good' : r.stars >= 2 ? 'ok' : 'bad'])}</p><div class="sim">Simuliertes Ergebnis aus ${nm(r.c)}s Werten (${tdef(t.trialId).stat === 'ekel' ? 'Ekel' : tdef(t.trialId).stat === 'kopf' ? 'Kopf' : 'Mut'} ${r.c[tdef(t.trialId).stat]}), Stimmung und Energie – nur du spielst selbst.</div>`, short: true }); S.log(`${nm(r.c)} holt ${r.stars}/6 Sterne.`); S.save(); }

  // ---------- Abendrunde / Ausscheidung ----------
  S.stageSpot = id => { const ids = S.alive().map(c => c.id), i = Math.max(0, ids.indexOf(id)), n = ids.length, a = -1.2 + (i / Math.max(1, n - 1)) * 2.4, sx = W.SP.stage.x, sz = W.SP.stage.z; return { x: sx + Math.cos(a) * 3.4 + 1.2, z: sz + Math.sin(a) * 3.4 + .8, yaw: Math.atan2(-(Math.cos(a) * 3.4 + 1.2), -(Math.sin(a) * 3.4 + .8)) - 0.3 }; };
  S.ceremony = function () {
    const t = G.today; if (!t.ceremonyCalled || t.ceremonyDone || t.ceremonyRunning) return; t.ceremonyRunning = true; C.standUp(); if (W.player.carry) C.carry(null);
    const sp = S.stageSpot('you'); W.player.x = sp.x; W.player.z = sp.z; W.player.yaw = sp.yaw; W.player.state = 'locked';
    C.npcs.forEach(n => { if (n.away) return; const s = S.stageSpot(n.id); n.x = s.x; n.z = s.z; n.yaw = s.yaw; n.act = { type: 'stage', phase: 'do', t: 0, dur: 9999, pose: 'idle', yaw: s.yaw, tx: s.x, tz: s.z }; });
    const sx = W.SP.stage.x, sz = W.SP.stage.z; W.cine(sx + 7, 3.2, sz + 6, sx, 1.4, sz, 1.2); W.hostPose = ['talk', 'talk']; Snd.drum(); UI.hudHidden(true);
    if (S.isFinalDay()) return finalCeremony();
    const list = S.elimRanking(), out = list[0].c;
    const rows = list.slice().reverse().map(x => `<div class="vrow" data-id="${x.c.id}">${UI.av(x.c, 'n')}<div><b>${x.c.id === 'you' ? 'Du' : nm(x.c)}</b><div class="bar r"><i data-w="${x.p}"></i></div></div><div class="p">${x.p}%</div></div>`).join('');
    const facts = list.map(x => `<span>${x.c.id === 'you' ? 'Du' : nm(x.c)}</span><small>Sympathie ${Math.round(x.c.aud.S)} · Leistung ${Math.round(x.c.aud.P)} · Unterhaltung ${Math.round(x.c.aud.E)}</small><b>${Math.round(S.favor(x.c.id))}</b>`).join('');
    UI.card({ title: '🎤 Die Entscheidung des Tages', html: `<div class="host">${UI.hostAv(0)}<div class="bubble"><small class="h">Kiki Klack</small><br>Das simulierte Publikum hat abgestimmt. Wer muss heute das Urwaldlager verlassen?</div></div><div class="sim">Simulierte Abstimmung – keine echten Zuschauer. Gewertet wird die Publikumsgunst: 45 % Sympathie, 25 % Leistung, 30 % Unterhaltung (Details unten). Je niedriger die Gunst, desto mehr „Anrufe“ zum Rauswurf.</div>${rows}<details><summary class="h">Wie kommt das zustande?</summary><div class="facts">${facts}</div></details>`, buttons: [{ id: 'go', label: 'Das Ergebnis … ▶', cls: 'red big' }], bars: true }, () => {
      Snd.drum(); setTimeout(() => Snd.drum(), 450);
      const safe = list.slice(2).map(x => x.c), last2 = list.slice(0, 2).map(x => x.c);
      UI.card({ title: '✅ In Sicherheit', html: `<p>${safe.map(c => fmt(pick(D.HOST.safe), { N: '<b>' + (c.id === 'you' ? 'Du' : nm(c)) + '</b>' })).join('<br>')}</p><p>Übrig sind noch <b>${last2.map(c => c.id === 'you' ? 'du' : nm(c)).join('</b> und <b>')}</b> …</p>`, buttons: [{ id: 'go', label: 'Wer muss gehen? ▶', cls: 'red big' }] }, () => {
        out.out = true; out.outDay = G.day; G.outOrder.push(out.id); t.ceremonyDone = true; t.ceremonyRunning = false; S.log(`${out.id === 'you' ? 'Du musst' : nm(out) + ' muss'} das Camp verlassen.`);
        if (out.id === 'you') { Snd.lose(); return playerOut(); }
        Snd.reveal(); const n = C.byId[out.id]; if (n) { n.act = { type: 'leave', phase: 'do', t: 0, dur: 9999, pose: 'sad' }; C.say(out.id, null, pick(['Macht’s gut, ihr Lieben!', 'Ich werd euch vermissen!', 'Endlich wieder ein echtes Bett!'])); }
        S.alive().forEach(c => { if (c.id !== 'you') C.addRel(c.id, out.id, 0, true); });
        UI.card({ title: `👋 ${nm(out)} verlässt das Camp`, html: `<div class="cen" style="width:120px;margin:6px auto">${UI.av(out, 'sad')}</div><p class="cen">${fmt(pick(D.HOST.out), { N: '<b>' + out.name + '</b>' })}</p><p class="cen h">${out.job}${out.stars ? ` · ${out.stars} Sterne geholt` : ''}</p>`, buttons: [{ id: 'go', label: 'Zurück ins Camp ▶', cls: 'go big' }] }, () => endCeremony(out));
      });
    });
  };
  function endCeremony(out) {
    const n = out && C.byId[out.id]; if (n) { n.away = true; n.fig.group.visible = false; n.act = null; }
    W.endCine(); W.hostPose = null; W.player.state = 'free'; UI.hudHidden(false); C.npcs.forEach(m => { if (m.act && m.act.type === 'stage') m.act = null; }); G.clock = Math.max(G.clock, 21.25 * 60); W.snapCam(); S.save();
    if (G.friends) G.friends = G.friends.filter(k => !out || !k.split('|').includes(out.id));
  }
  function finalCeremony() {
    const t = G.today, fr = t.finalRes || {}, list = S.alive().map(c => { const r = fr[c.id] || { stars: 0, max: 9 }, f = S.favor(c.id) * .75 + (r.stars / r.max) * 100 * .25; return { c, f, r }; }).sort((a, b) => b.f - a.f);
    const p = percents(list.map(x => Math.pow(Math.max(1, x.f), 2.4))); list.forEach((x, i) => { x.p = p[i]; });
    const rows = list.slice().reverse().map(x => `<div class="vrow">${UI.av(x.c, 'n')}<div><b>${x.c.id === 'you' ? 'Du' : nm(x.c)}</b> <small class="h">Finale ${x.r.stars}/${x.r.max} ★</small><div class="bar"><i data-w="${x.p}"></i></div></div><div class="p">${x.p}%</div></div>`).join('');
    UI.card({ title: '🏆 Das große Finale', html: `<div class="host">${UI.hostAv(1)}<div class="bubble"><small class="h">Boris Busch</small><br>Die Leitungen glühen – zumindest simuliert! Wer trägt die Lianenkrone?</div></div><div class="sim">Simuliertes Finalvotum: 75 % Publikumsgunst über die ganze Staffel + 25 % Leistung in der Finalprüfung. Keine echten Stimmen.</div>${rows}`, buttons: [{ id: 'go', label: 'Und der Sieger ist … ▶', cls: 'gold big' }], bars: true }, () => {
      const order = list.map(x => x.c); G.finalOrder = order.map(c => c.id); G.today.ceremonyDone = true;
      const win = order[0]; win.id === 'you' ? Snd.fan() : Snd.reveal(); const n = C.byId[win.id]; if (n) n.act = { type: 'win', phase: 'do', t: 0, dur: 9999, pose: 'cheer' }; if (win.id === 'you') W.player.state = 'cheer';
      S.log(`${win.id === 'you' ? 'Du bist' : nm(win) + ' ist'} Urwald-Champion!`);
      setTimeout(() => S.finish(order), 600);
    });
  }
  function playerOut() {
    W.player.state = 'sad'; const place = S.alive().length + 1;
    UI.card({ title: '😢 Du musst das Camp verlassen', html: `<div class="cen" style="width:120px;margin:6px auto">${UI.av(G.you, 'sad')}</div><p class="cen">Das simulierte Publikum hat entschieden – du landest auf <b>Platz ${place}</b> von ${G.n}.</p><p class="cen h">Die restliche Staffel läuft ohne dich weiter. Im Rückblick siehst du, wie es ausgeht (vereinfachte Simulation, deutlich gekennzeichnet).</p>`, buttons: [{ id: 'go', label: 'Zum Staffel-Rückblick ▶', cls: 'go big' }] }, () => { W.endCine(); simulateRest(); });
  }
  function simulateRest() {
    const lines = []; let d = G.day; const r = E.rand(G.seed * 3 + d);
    while (S.alive().length > 3 && d < G.days - 1) { d++; S.alive().forEach(c => { ['S', 'P', 'E'].forEach(k => { c.aud[k] = clamp(c.aud[k] + (50 - c.aud[k]) * .08 + (r() - .5) * 10, 0, 100); }); }); const l = S.alive().map(c => ({ c, f: S.favor(c.id) + (r() - .5) * 6 })).sort((a, b) => a.f - b.f); const o = l[0].c; o.out = true; o.outDay = d; G.outOrder.push(o.id); lines.push(`Tag ${d}: ${nm(o)} verlässt das Camp.`); }
    const fin = S.alive().map(c => { const s = FINAL_PARTS.reduce((a, p) => a + simStars(c, T.defs[p.id], p.max), 0); return { c, f: S.favor(c.id) * .75 + s / 9 * 25, s }; }).sort((a, b) => b.f - a.f);
    lines.push(`Finale: ${fin.map(x => nm(x.c) + ' (' + x.s + '/9 ★)').join(', ')}.`);
    UI.card({ title: '📺 Staffel-Rückblick (simuliert)', html: `<div class="sim">Diese Tage wurden ohne dich vereinfacht simuliert.</div><p>${lines.join('<br>')}</p>`, buttons: [{ id: 'go', label: 'Endergebnis ▶', cls: 'gold big' }] }, () => S.finish(fin.map(x => x.c)));
  }
  S.finish = function (order) {
    G.over = true; const place = {}; order.forEach((c, i) => { place[c.id] = i + 1; }); G.outOrder.slice().reverse().forEach((id, i) => { if (!place[id]) place[id] = order.length + i + 1; });
    const my = place.you, b = S.best(); b.plays = (b.plays || 0) + 1; b.wins = (b.wins || 0) + (my === 1 ? 1 : 0); b.best = Math.min(b.best || 99, my); b.stars = (b.stars || 0) + G.you.stars; S.setBest(b);
    try { localStorage.removeItem(SAVE); } catch (e) { }
    UI.endScreen({ order, place, my, G });
  };

  // ---------- Schlafen & neuer Tag ----------
  S.goSleep = function (forced) {
    if (W.player.state === 'sleep' || S.dayTurning) return; S.dayTurning = true;
    const b = C.bedOf('you'); C.standUp(); if (W.player.carry) C.carry(null); W.player.x = b.x; W.player.z = b.z; W.player.yaw = b.yaw; W.player.state = 'sleep'; W.snapCam();
    if (!forced && G.today.night === 'dieb' && root.UEvents && !G.today.nightDone) { G.today.nightDone = true; return root.UEvents.nightThief(); }
    S.nextDay();
  };
  S.nextDay = function () {
    UI.fade(() => {
      const hrs = G.clock >= 22 * 60 ? (24 * 60 - G.clock + 6.5 * 60) / 60 : 7;
      G.cast.forEach(c => { if (c.out) return; c.needs.energy = clamp(c.needs.energy + hrs * 10 * (G.camp.wet ? .7 : 1) * (G.camp.fuel > 0 ? 1 : .85), 0, 100); c.needs.hunger = clamp(c.needs.hunger - hrs * 2.5, 0, 100); });
      if (G.camp.fuel <= 0) UI.toast('🥶 Das Feuer war nachts aus – alle haben schlecht geschlafen.', 'bad');
      G.camp.fuel = Math.max(0, G.camp.fuel - .35); nightDrift(); G.day++; G.clock = 6.5 * 60; if (root.UEvents) root.UEvents.reset(); newToday(); W.player.state = 'free'; const b = C.bedOf('you'); W.player.x = b.x + Math.sin(b.yaw) * 1.4; W.player.z = b.z + Math.cos(b.yaw) * 1.4; W.player.yaw = b.yaw; W.snapCam(true);
      C.placeForTime(); W.updateProps(G.camp); W.branches.forEach(x => { x.have = true; }); W.fruit.forEach(f => { f.n = 3; }); W.updateProps(G.camp);
      S.dayTurning = false; S.log(`Tag ${G.day} beginnt.`); S.save(); UI.dayCard();
    });
  };

  // ---------- Speichern / Laden / Migration ----------
  S.best = () => { try { return JSON.parse(localStorage.getItem(BEST)) || {}; } catch (e) { return {}; } };
  S.setBest = v => { try { localStorage.setItem(BEST, JSON.stringify(v)); } catch (e) { } };
  S.save = function () { if (!G || G.over) return false; G.player = { x: +W.player.x.toFixed(2), z: +W.player.z.toFixed(2), yaw: +W.player.yaw.toFixed(2) }; G.branches = W.branches.map(b => b.have ? 1 : 0); G.fruitN = W.fruit.map(f => f.n); G.savedAt = Date.now(); try { localStorage.setItem(SAVE, JSON.stringify(G)); return true; } catch (e) { return false; } };
  S.hasSave = () => { try { const s = JSON.parse(localStorage.getItem(SAVE)); return !!(s && s.v === VERSION && !s.over); } catch (e) { return false; } };
  S.saveInfo = () => { try { const s = JSON.parse(localStorage.getItem(SAVE)); return s && s.v === VERSION ? { day: s.day, days: s.days, name: (s.cast.find(c => c.id === 'you') || {}).name, look: (s.cast.find(c => c.id === 'you') || {}).look, stars: (s.cast.find(c => c.id === 'you') || {}).stars || 0, alive: s.cast.filter(c => !c.out).length, at: s.savedAt } : null; } catch (e) { return null; } };
  S.load = function () {
    let s = null; try { s = JSON.parse(localStorage.getItem(SAVE)); } catch (e) { s = null; } if (!s || s.v !== VERSION) return null;
    G = S.G = s; S.dayTurning = false; S.entering = false; linkYou(); G.today.ceremonyRunning = false; if (G.today.ceremonyCalled && !G.today.ceremonyDone && G.clock > 1260) G.clock = 1260;
    // fehlende Felder älterer v2-Stände ergänzen
    ['friends', 'rivals', 'gossip', 'usedMoments', 'usedCampfire', 'usedEvents', 'log', 'outOrder', 'results', 'decisions'].forEach(k => { if (!Array.isArray(G[k])) G[k] = []; }); G.audLog = G.audLog || {}; G.tut = G.tut || { on: false, done: [] }; G.intro = false; if (G.today.trialId !== 'finale' && !T.defs[G.today.trialId]) G.today.trialId = TRIAL_IDS.find(id => T.defs[id]);
    return G;
  };
  S.clearSave = () => { try { localStorage.removeItem(SAVE); } catch (e) { } };
  // Alte Version (1.x) hatte nur Statistiken in ul_best – sie bleiben erhalten und werden im Titel angezeigt.
  S.migrate = function () { try { const b = S.best(); if (b && b.plays && !b.v) { b.v = 2; S.setBest(b); } } catch (e) { } };
  S.goal = function () {
    const t = G.today, h = S.hour();
    if (t.ceremonyCalled && !t.ceremonyDone) return { x: W.SP.stage.x, z: W.SP.stage.z, txt: '🎤 Zur Abendrunde am Moderationsfelsen (Westen)' };
    if (t.nominees.includes('you') && !t.trialDone && h >= 9.25) return { x: W.SP.gate.x, z: W.SP.gate.z, txt: `⭐ Prüfung: Geh zum Prüfungstor (Süden)!` };
    if (root.UEvents && root.UEvents.goal) { const g = root.UEvents.goal(); if (g) return g; }
    if (G.camp.meal.ready && !G.camp.meal.eaten.includes('you')) return { x: 0, z: 0, txt: '🍲 Essen ist fertig – hol dir am Feuer eine Portion!' };
    if (S.canSleep()) return { x: C.bedOf('you').x, z: C.bedOf('you').z, txt: '😴 Zeit zum Schlafen – geh zu deinem Bett.' };
    return null;
  };
  root.USeason = S;
})(window);
