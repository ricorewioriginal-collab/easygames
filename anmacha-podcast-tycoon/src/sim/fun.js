/* Spaß-Schicht ohne DOM: Studio-Stufe mit XP, Tagesziele, Sende-Serie, Moderations-Boni, Studio-Momente und
   Sprüche von Marco und Andrew. Zustand in st.fun (sichere Vorgaben für alte Spielstände).
   Hängt sich ohne Änderungen am Kern an PT.Sim (missionEvent, build, completeMission, eventChoose, endDay, prodPlan, hire, repair).
   Ausgaben für die Oberfläche landen in st.fun.q: { t: 'say', who, text } | { t: 'level', lvl, title, rew } | { t: 'goal', g } | { t: 'allgoals', rew }.
   Zufall nur über PT.hash (eigener Zähler) – der Spiel-Seed bleibt unberührt. */
(function (root) {
  'use strict';
  const PT = root.PT = root.PT || {}; const D = PT.DATA, S = PT.Sim;
  const F = PT.Fun = {};
  const clamp = PT.clamp;
  F.Q_MAX = 12;

  // ── Zustand ───────────────────────────────────────────────
  F.ensure = function (st) {
    if (!st) return null;
    const f = st.fun && typeof st.fun === 'object' ? st.fun : (st.fun = {});
    if (!Number.isFinite(f.lvl) || f.lvl < 1) f.lvl = 1;
    if (!Number.isFinite(f.xp) || f.xp < 0) f.xp = 0;
    if (!Number.isFinite(f.n)) f.n = 0;
    if (!Number.isFinite(f.streak)) f.streak = 0;
    if (!Number.isFinite(f.best)) f.best = 0;
    if (!Number.isFinite(f.lastEp)) f.lastEp = 0;
    if (!Number.isFinite(f.moments)) f.moments = 0;
    if (!Array.isArray(f.q)) f.q = [];
    if (!Array.isArray(f.goals)) f.goals = [];
    if (!f.seen || typeof f.seen !== 'object') f.seen = {};
    if (!f.cool || typeof f.cool !== 'object') f.cool = {};
    if (!Number.isFinite(f.goalDay)) f.goalDay = 0;
    return f;
  };
  F.active = st => !!st && st.mode === 'career';
  F.need = lvl => 80 + 60 * (lvl - 1) + 15 * (lvl - 1) * (lvl - 1);
  F.title = lvl => D.funTitles[Math.min(D.funTitles.length - 1, lvl - 1)] + (lvl > D.funTitles.length ? ' ' + (lvl - D.funTitles.length + 1) : '');
  F.rnd = function (st, salt) { const f = F.ensure(st); f.n = (f.n + 1) % 1e9; return (PT.hash(st.seed + ':fun:' + f.n + ':' + (salt || '')) % 100000) / 100000; };
  F.pickArr = (st, arr, salt) => arr[Math.floor(F.rnd(st, salt) * arr.length)];
  F.push = function (st, item) { const f = F.ensure(st); f.q.push(item); while (f.q.length > F.Q_MAX) f.q.shift(); };
  const fill = (s, v) => String(s).replace(/\{(\w+)\}/g, (m, k) => v && v[k] != null ? v[k] : m);
  /** Zerlegt „M:…|A:…“ in [[wer, text], …]. */
  F.parse = function (s, vars) {
    return String(s).split('|').map(p => { const m = /^([MA]):\s*(.*)$/.exec(p.trim()); return m ? [m[1] === 'M' ? 'marco' : 'andrew', fill(m[2], vars)] : ['marco', fill(p.trim(), vars)]; }).filter(l => l[1]);
  };
  /** Spruch aus D.banter[key] in die Warteschlange (mit Abklingzeit je Schlüssel in Spielminuten). */
  F.say = function (st, key, vars, cool) {
    const f = F.ensure(st), list = D.banter[key]; if (!list || !list.length) return null;
    const now = st.time.day * 1440 + st.time.min;
    if (cool && f.cool[key] && now - f.cool[key] < cool) return null;
    f.cool[key] = now;
    const lines = F.parse(F.pickArr(st, list, key), Object.assign({ name: st.name }, vars || {}));
    lines.forEach(l => F.push(st, { t: 'say', who: l[0], text: l[1], key }));
    return lines;
  };
  F.sayText = function (st, s, vars) { const lines = F.parse(s, vars); lines.forEach(l => F.push(st, { t: 'say', who: l[0], text: l[1] })); return lines; };
  F.take = function (st) { const f = F.ensure(st); return f.q.splice(0, f.q.length); };

  // ── Studio-Stufe ──────────────────────────────────────────
  F.addXp = function (st, n) {
    if (!F.active(st) || !(n > 0)) return 0;
    const f = F.ensure(st); f.xp += Math.round(n); let ups = 0;
    while (f.xp >= F.need(f.lvl) && ups < 5) {
      f.xp -= F.need(f.lvl); f.lvl++; ups++;
      const rew = { money: Math.min(600, 60 * f.lvl), fans: Math.min(20, 2 * f.lvl) };
      S.earn(st, rew.money * S.diffRules(st).money, 'missions'); st.fans += rew.fans;
      F.push(st, { t: 'level', lvl: f.lvl, title: F.title(f.lvl), rew });
      F.say(st, 'level', { lvl: f.lvl, title: F.title(f.lvl) });
    }
    return ups;
  };
  F.progress = st => { const f = F.ensure(st); return { lvl: f.lvl, xp: f.xp, need: F.need(f.lvl), title: F.title(f.lvl) }; };

  // ── Tagesziele ────────────────────────────────────────────
  function goalOk(st, g) {
    if (g.cond === 'episode') return st.episodes.length > 0;
    if (g.cond === 'guests') return !!st.unlocks.guests;
    if (g.cond === 'moments') return st.missions.done.length >= 2; // Studio-Momente kommen erst nach dem Einstieg
    if (g.cond === 'district') return Object.keys(st.unlocks.districts).some(k => k !== 'altstudio' && st.unlocks.districts[k]);
    return true;
  }
  F.goals = function (st) {
    const f = F.ensure(st);
    if (!F.active(st)) return [];
    if (f.goalDay !== st.time.day || !f.goals.length) {
      f.goalDay = st.time.day; f.allDone = false;
      const tmp = { seed: PT.hash('goals' + st.seed + ':' + st.time.day) };
      const pool = D.funGoals.filter(g => goalOk(st, g));
      const pubs = PT.shuffle(tmp, pool.filter(g => g.pub)), rest = PT.shuffle(tmp, pool.filter(g => !g.pub));
      const pick = [pubs[0]].concat(rest.slice(0, 2)).filter(Boolean);
      const last = st.episodes[st.episodes.length - 1], mult = Math.min(1.8, 1 + 0.1 * (f.lvl - 1));
      f.goals = pick.map(g => {
        const o = { id: g.id, icon: g.icon, need: g.need, have: 0, done: false, rew: { money: Math.round((g.rew.money || 0) * mult), fans: g.rew.fans || 0, xp: g.rew.xp || 0 } };
        const v = {};
        if (g.minQ) { o.minQ = Math.min(85, 40 + Math.round(st.episodes.reduce((t, e) => t + e.q, 0) / Math.max(1, st.episodes.length) * 0.3) + f.lvl); v.q = o.minQ; }
        if (g.lead) { o.lead = PT.hash(st.seed + 'lead' + st.time.day) % 2 ? 'andrew' : 'marco'; v.host = o.lead === 'andrew' ? 'Andrew' : 'Marco'; }
        if (g.listeners) { o.n = Math.max(60, Math.round((last ? last.listeners : 50) * 1.15 / 10) * 10); v.n = PT.fmt(o.n); }
        o.label = fill(g.label, v);
        return o;
      });
    }
    return f.goals;
  };
  /** Passt ein Spiel-Ereignis zu einem Tagesziel? */
  F.goalMatch = function (st, o, ev) {
    const g = D.funGoals.find(x => x.id === o.id); if (!g || g.ev !== ev.type) return false;
    if (ev.type === 'publish') {
      const e = ev.ep; if (!e) return false;
      if (o.minQ && e.q < o.minQ) return false;
      if (o.lead && ev.lead !== o.lead && ev.lead !== 'both') return false;
      if (o.n && e.listeners < o.n) return false;
      if (g.guest && !e.guest) return false;
      return true;
    }
    if (ev.type === 'minigame') return !g.win || !!ev.won;
    if (ev.type === 'build') return ev.cmd && ev.cmd.t === 'place';
    if (ev.type === 'talk') return !!ev.first;
    if (ev.type === 'visit') return ev.dist && ev.dist !== 'altstudio';
    return true;
  };
  function goalEvent(st, ev) {
    if (!F.active(st)) return;
    const f = F.ensure(st), goals = F.goals(st); let newly = 0;
    goals.forEach(o => {
      if (o.done || !F.goalMatch(st, o, ev)) return;
      o.have = Math.min(o.need, o.have + 1);
      if (o.have >= o.need) {
        o.done = true; newly++;
        if (o.rew.money) S.earn(st, o.rew.money * S.diffRules(st).money, 'missions');
        if (o.rew.fans) st.fans += o.rew.fans;
        F.push(st, { t: 'goal', g: { id: o.id, icon: o.icon, label: o.label, rew: o.rew } });
        F.addXp(st, o.rew.xp);
      }
    });
    if (newly && !f.allDone && goals.length && goals.every(o => o.done)) {
      f.allDone = true; const rew = { money: Math.round(200 * Math.min(1.8, 1 + 0.1 * (f.lvl - 1))), fans: 10, xp: 50 };
      S.earn(st, rew.money * S.diffRules(st).money, 'missions'); st.fans += rew.fans;
      F.push(st, { t: 'allgoals', rew }); F.say(st, 'allGoals'); F.addXp(st, rew.xp);
    } else if (newly) F.say(st, 'goal', null, 30);
  }

  // ── Moderation ────────────────────────────────────────────
  F.lead = id => D.funLeads[id] || D.funLeads.marco;
  F.leadQuality = function (lead, rubric) { const L = F.lead(lead); return (L.qRub && L.qRub[rubric]) || L.q || 0; };
  F.onPlan = function (st) {
    const P = st.prod; if (!P || !P.plan || P.funLead) return;
    const lead = P.plan.lead, L = F.lead(lead), topic = D.topics.find(t => t.id === P.plan.topic);
    const q = F.leadQuality(lead, topic && topic.rubric);
    P.funLead = { lead, q }; if (q) P.qualityDelta = (P.qualityDelta || 0) + q;
    ['marco', 'andrew'].forEach(h => { const H = st.hosts[h]; if (L.mood) H.mood = clamp(H.mood + L.mood, 0, 100); if (L.energy) H.energy = clamp(H.energy - L.energy, 0, 100); });
    F.say(st, lead === 'andrew' ? 'leadAndrew' : lead === 'both' ? 'leadBoth' : 'leadMarco', null, 240);
  };

  // ── Veröffentlichung: Serie, Andrew-Bonus, Reaktion ───────
  F.onPublish = function (st, ev) {
    const f = F.ensure(st), e = ev.ep, P = st.prod, lead = P && P.plan ? P.plan.lead : 'marco', lines = [];
    let bonusFans = 0;
    if (lead === 'andrew' && e.fans > 0) { bonusFans = Math.max(1, Math.round(e.fans * F.lead('andrew').fans)); st.fans += bonusFans; e.fans += bonusFans; lines.push('💛 Andrew moderiert: +' + bonusFans + ' Fans extra'); }
    if (P && P.funLead && P.funLead.q) lines.push(F.lead(lead).icon + ' Moderation ' + (lead === 'both' ? 'Marco & Andrew' : lead === 'andrew' ? 'Andrew' : 'Marco') + ': +' + P.funLead.q + ' Qualität');
    if (f.lastEp !== st.time.day) {
      f.streak = f.lastEp === st.time.day - 1 ? f.streak + 1 : 1; f.lastEp = st.time.day; f.best = Math.max(f.best, f.streak);
      if (f.streak >= 2 && F.active(st)) { const sf = Math.min(20, 2 * f.streak); st.fans += sf; e.fans += sf; lines.push('🔥 Sende-Serie ' + f.streak + ' Tage: +' + sf + ' Fans'); F.addXp(st, Math.min(50, 10 * f.streak)); F.say(st, 'streak', { n: f.streak }); }
    }
    if (P && P.report) { P.report.fun = lines; P.report.fansGain = e.fans; }
    F.addXp(st, 10 + Math.round(e.q / 4) + e.stars * 3);
    goalEvent(st, { type: 'publish', ep: e, lead });
    F.say(st, e.stars >= 4 ? 'pubTop' : e.stars >= 3 ? 'pubOk' : 'pubBad', { n: PT.fmt(e.listeners) });
  };

  // ── Tagesstreak-Anzeige (0, wenn gestern keine Folge kam) ─
  F.streakNow = st => { const f = F.ensure(st); return f.lastEp >= st.time.day - 1 ? f.streak : 0; };

  // ── Hosts ─────────────────────────────────────────────────
  F.moodIcon = m => m >= 75 ? '😄' : m >= 50 ? '🙂' : m >= 30 ? '😐' : '😩';
  F.hostState = function (st) {
    const o = {}; ['marco', 'andrew'].forEach(h => { const H = st.hosts[h]; o[h] = { energy: Math.round(H.energy), mood: Math.round(H.mood), creativity: Math.round(H.creativity), icon: H.energy < 25 ? '😴' : F.moodIcon(H.mood) }; });
    return o;
  };
  /** Situationsabhängiger Tipp von Marco oder Andrew: [wer, text]. */
  F.tip = function (st) {
    const H = st.hosts, studio = S.studio(st), m = S.currentMission(st), goals = F.goals(st).filter(g => !g.done);
    if (st.money < 0) return ['marco', 'Das Konto ist im Minus. Nebenjobs in den Bezirken bringen schnell Geld!'];
    if (st.prod) return ['andrew', 'Unsere Folge wartet noch! Ab ans Pult und weiterproduzieren.'];
    if ((H.marco.energy + H.andrew.energy) / 2 < 30) return ['andrew', 'Wir sind ziemlich platt. Eine Kaffeeküche hilft – oder Feierabend (🌙).'];
    if (st.reliab < 40) return ['marco', 'Die Technik ächzt. Repariere sie im Geld-Menü oder bau eine Werkstatt.'];
    if (m && st.missions.curState === 'active' && st.episodes.length === 0 && m.obj.some(o => o.type === 'publish')) return ['andrew', 'Zeit für unsere erste Folge! Tipp auf 🎙️ Folge – mit „⚡ Express“ geht’s ganz schnell.'];
    if (goals.length && F.rnd(st, 'tipg') < 0.5) return ['andrew', 'Tagesziel: ' + goals[0].label + '. Dafür gibt’s ' + PT.money(goals[0].rew.money) + '!'];
    if (!studio.best.redaktion && st.episodes.length >= 2) return ['marco', 'Mit einer Redaktion (Schreibtisch + Stuhl) wird die Recherche viel besser.'];
    if (!studio.best.kueche && st.episodes.length >= 3) return ['andrew', 'Eine Kaffeeküche! Dann sind wir morgens viel schneller wieder fit.'];
    if (m) return ['marco', 'Unsere Mission: ' + m.title + '. Schau oben links, was als Nächstes dran ist.'];
    return ['andrew', 'Probier mal ein anderes Thema mit 🔥-Trend – das bringt mehr Hörer.'];
  };

  // ── Studio-Momente ────────────────────────────────────────
  F.momentPool = st => D.studioEvents.filter(e => !e.needEpisode || st.episodes.length);
  /** Würfelt einen Studio-Moment und legt ihn in st.pending (Anzeige über die normale Ereignis-Abfrage). */
  F.rollMoment = function (st) {
    if (!F.active(st) || st.pending.length || st.pendingChoice || (st.prod && st.prod.event)) return null;
    const f = F.ensure(st), day = st.time.day;
    const pool = F.momentPool(st).filter(e => !(f.seen[e.id] && day - f.seen[e.id] < 4));
    const list = pool.length ? pool : F.momentPool(st); if (!list.length) return null;
    const ev = F.pickArr(st, list, 'moment');
    f.seen[ev.id] = day; st.pending.push(ev.id);
    return ev;
  };
  F.onEventChoice = function (st, evId, idx, mgResult) {
    const ev = D.events.find(e => e.id === evId); if (!ev) return;
    const c = ev.choices[idx]; if (!c) return;
    if (ev.when === 'studio') {
      const f = F.ensure(st); f.moments++;
      const fx = c.mg ? (mgResult && mgResult.won ? c.win : c.lose) : c.effect;
      if (fx && fx.hmood) ['marco', 'andrew'].forEach(h => { st.hosts[h].mood = clamp(st.hosts[h].mood + fx.hmood, 10, 100); });
      if (fx && fx.creat) ['marco', 'andrew'].forEach(h => { st.hosts[h].creativity = clamp(st.hosts[h].creativity + fx.creat, 0, 100); });
      if (c.say) F.sayText(st, c.say);
      F.addXp(st, 12);
    } else F.addXp(st, 8);
    goalEvent(st, { type: 'event', id: evId });
  };

  // ── Zentrale Ereignisannahme ──────────────────────────────
  F.on = function (st, ev) {
    if (!st || !ev) return;
    F.ensure(st);
    switch (ev.type) {
      case 'publish': F.onPublish(st, ev); return;
      case 'minigame': if (ev.won) F.addXp(st, 10); else F.addXp(st, 3); goalEvent(st, ev); F.say(st, ev.won ? 'mgWin' : 'mgLose', null, 90); return;
      case 'talk': goalEvent(st, ev); return;
      case 'visit': goalEvent(st, ev); return;
      case 'repair': F.addXp(st, 8); F.say(st, 'repair', null, 120); return;
      case 'build': {
        const f = st.fun, place = ev.cmd && ev.cmd.t === 'place';
        if (place) { f.bxp = f.bxpDay === st.time.day ? (f.bxp || 0) : 0; f.bxpDay = st.time.day; if (f.bxp < 20) { f.bxp += 3; F.addXp(st, 3); } }
        goalEvent(st, ev);
        if (place) { const d = D.objectById[ev.cmd.o.id]; F.say(st, d && d.cost >= 500 ? 'buildBig' : 'build', null, 40); }
        return;
      }
      case 'mission': F.addXp(st, ev.side ? 15 : 25); F.say(st, 'mission', null, 30); return;
      case 'hire': F.addXp(st, 15); F.say(st, 'hire', null, 60); return;
      case 'day': if (F.active(st)) { F.goals(st); F.say(st, 'morning'); if (st.money < 0) F.say(st, 'broke', null, 1440); } return;
      default:
    }
  };

  // ── Anbindung an die Simulation (Hüllen, keine Kernänderung) ──
  if (D.studioEvents && D.events && !D.events.some(e => e.when === 'studio')) D.studioEvents.forEach(e => D.events.push(e));
  if (S && !S._funHooked) {
    S._funHooked = true;
    const wrap = (name, after) => { const orig = S[name]; if (typeof orig !== 'function') return; S[name] = function () { const r = orig.apply(this, arguments); try { after.apply(null, [r].concat(Array.prototype.slice.call(arguments))); } catch (e) { if (root.console) console.error('[PT.Fun]', name, e); } return r; }; };
    wrap('missionEvent', (r, st, ev) => {
      if (!ev) return;
      if (ev.type === 'talk') { const f = F.ensure(st); f.talked = f.talkDay === st.time.day ? (f.talked || {}) : {}; f.talkDay = st.time.day; const first = !f.talked[ev.npc]; f.talked[ev.npc] = 1; F.on(st, { type: 'talk', npc: ev.npc, first }); return; }
      if (['publish', 'minigame', 'visit', 'repair'].includes(ev.type)) F.on(st, ev);
    });
    wrap('build', (r, st, lotId, cmd) => { if (r && r.ok) F.on(st, { type: 'build', cmd: r.cmd || cmd }); });
    wrap('completeMission', (r, st, m, side) => { if (m) F.on(st, { type: 'mission', m, side: !!side }); });
    wrap('eventChoose', (r, st, evId, idx, mg) => { if (r && r.ok) F.onEventChoice(st, evId, idx, mg); });
    wrap('endDay', (r, st) => F.on(st, { type: 'day' }));
    wrap('prodPlan', (r, st) => { if (r && r.ok) F.onPlan(st); });
    wrap('hire', (r, st) => { if (r && r.ok) F.on(st, { type: 'hire' }); });
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = F;
})(typeof window !== 'undefined' ? window : globalThis);
