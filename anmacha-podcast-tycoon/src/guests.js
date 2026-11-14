/* AnMaCha – Der Podcast · Studiogäste und die AnMaCha-App (Social Media).
   Gäste: Wen ihr in den Welten trefft, könnt ihr für die Abendfolge buchen (einmal am Tag). Jeder Gast bringt Hörer, passt das Thema, noch mehr.
   App: Follower, Trend des Tages, Story posten, Umfrage, Kommentare beantworten – und ein Feed, der alles mitschreibt, was ihr erlebt. */
(function (root) {
  'use strict';
  const AMC = root.AMC, U = AMC.U, D = AMC.Data, Save = AMC.Save;
  const GU = AMC.Guests = {}, FD = AMC.Feed = {};
  const career = () => AMC.Career ? AMC.Career.state() : { day: 1, abos: 120, today: { got: {} } };
  const abos = () => career().abos || 0;

  // ------------------------------------------------------------------ Gäste
  // [id, Icon, Name, Rolle, Thema (Rubrik), Hörer-Bonus, Kosten 🎟️, Freischalten (Text), Prüfung]
  const met = id => !!((Save.data.guests || {}).met || {})[id];
  const ROSTER = [
    ['gisela', '🚐', 'Gisela', 'Euer Camper – sagt nur „Tröööt“', 'feel', 0.04, 0, 'Immer dabei', () => true],
    ['otto', '📶', 'Funker Otto', 'Kurzwellen-Legende vom Funkturm-Berg', 'tech', 0.08, 20, 'Funkerhütte besuchen', () => met('otto')],
    ['welle', '📻', 'Dr. Ruth Welle', 'Direktorin des Radio-Museums', 'serious', 0.09, 25, 'Radio-Museum besuchen', () => met('welle')],
    ['presse', '🗞️', 'Paul Presse', 'Chefredakteur der Morgenpost', 'serious', 0.1, 30, 'Druckerei besuchen', () => met('presse')],
    ['jana', '📺', 'Jana Kanal', 'Moderatorin der Kanal-9-Morgenshow', 'tv', 0.12, 40, 'Kanal 9 Studios besuchen', () => met('jana')],
    ['headliner', '🎤', 'Festival-Headliner', 'Spielt live auf der Insel', 'musik', 0.13, 45, 'Hauptbühne oder Riesenrad besuchen', () => met('headliner')],
    ['giftkind', '🎵', 'Giftkind', 'Act aus der RicoReWi Music Arena', 'musik', 0.12, 40, 'Music Arena besuchen', () => met('arena')],
    ['kater', '⚓', 'KAPITÄN KATER', 'Act aus der RicoReWi Music Arena', 'feel', 0.12, 40, 'Music Arena besuchen', () => met('arena')],
    ['aeruma', '🌌', 'AERUMA', 'Act aus der RicoReWi Music Arena', 'musik', 0.12, 40, 'Music Arena besuchen', () => met('arena')],
    ['rico', '✳️', 'RicoReWi', 'Musiker, Autor, Builder – Gastgeber seines Universums', 'tech', 0.16, 60, 'Alle sechs Orte im RicoReWi-Universum', () => !!(Save.data.ricoU || {}).done],
    ['prof', '🧑‍🔬', 'Prof. Hall', 'Erklärt Wissenschaft in 3 Minuten', 'serious', 0.14, 70, 'Ab 2.000 Abos', () => abos() >= 2000],
    ['star', '🌟', 'Überraschungs-Promi', 'Kommt nur zu großen Podcasts', 'tv', 0.22, 150, 'Ab 20.000 Abos', () => abos() >= 20000]
  ];
  GU.ROSTER = ROSTER;
  // Ort in einer Welt → Gast lernt man kennen
  const PLACE = { funker: 'otto', museum: 'welle', druck: 'presse', kanal9: 'jana', buehne: 'headliner', riesenrad: 'headliner', arena: 'arena' };
  GU.meet = function (place) {
    const id = PLACE[place]; if (!id) return; const g = Save.data.guests = Save.data.guests || {}; g.met = g.met || {};
    if (g.met[id]) return; g.met[id] = 1; Save.save();
    const names = ROSTER.filter(r => r[0] === id || (id === 'arena' && ['giftkind', 'kater', 'aeruma'].includes(r[0]))).map(r => r[2]).join(', ');
    setTimeout(() => AMC.UI.toast('🎙️ Neuer möglicher Studiogast: ' + names + ' (Menü → Studiogäste)', 4200), 1200);
  };
  const info = r => ({ id: r[0], icon: r[1], name: r[2], role: r[3], rub: r[4], bonus: r[5], cost: r[6], how: r[7], open: r[8](), visits: (((Save.data.guests || {}).n) || {})[r[0]] || 0 });
  GU.list = () => ROSTER.map(info);
  GU.today = () => { const id = career().today.guest; const r = ROSTER.find(x => x[0] === id); return r ? info(r) : null; };
  GU.book = function (id) {
    const r = ROSTER.find(x => x[0] === id); if (!r) return false; const g = info(r), t = career().today;
    if (!g.open || t.guest) return false;
    if (Save.data.fan < g.cost) { AMC.Audio.sfx('miss'); AMC.UI.toast('Zu wenig Fan-Punkte (' + g.cost + ' 🎟️ nötig).'); return false; }
    Save.data.fan -= g.cost; t.guest = id; Save.save(); AMC.Audio.sfx('buy');
    FD.post(g.icon, g.name + ' ist heute Abend zu Gast bei AnMaCha! 🎙️ Wer schaltet ein?', 'gast');
    return true;
  };
  // Anteil an der Folge (Career.episode): Grundbonus, Stammgast, passendes Thema
  GU.part = function () {
    const g = GU.today(); if (!g) return null; const t = career().today, top = D.RUBRIC_IDS.slice().sort((a, b) => (t.got[b] || 0) - (t.got[a] || 0))[0];
    const fit = (t.got[g.rub] || 0) >= 3 && top === g.rub ? 0.06 : 0, regular = Math.min(0.05, g.visits * 0.01);
    return ['🎙️ Gast ' + g.name + (fit ? ' (Thema passt!)' : ''), g.bonus + fit + regular];
  };
  GU.after = function () {
    const g = GU.today(); if (!g) return; const s = Save.data.guests = Save.data.guests || {}; s.n = s.n || {}; s.n[g.id] = (s.n[g.id] || 0) + 1;
    if (g.id === 'rico' && AMC.Social) AMC.Social.add('RicoReWi', 8);
  };
  GU.panel = function () {
    const draw = () => {
      const t = career().today, cur = GU.today();
      return '<p class="hint">' + (cur ? 'Heute zu Gast: ' + cur.icon + ' <b>' + U.esc(cur.name) + '</b> – nehmt am Abend auf!' : 'Ein Gast pro Tag. Passt sein Thema zu euren meisten Themen-Funken, gibt es +6 % extra.') + ' · 🎟️ ' + U.fmt(Save.data.fan) + '</p><div class="st-list" id="guL">' +
        GU.list().map((g, i) => { const off = !g.open || !!t.guest; const sub = !g.open ? '🔒 ' + g.how : g.role + ' · ' + D.RUBRICS[g.rub].icon + ' ' + D.RUBRICS[g.rub].name + ' · +' + Math.round(g.bonus * 100) + ' % Hörer' + (g.cost ? ' · ' + g.cost + ' 🎟️' : ' · gratis') + (g.visits ? ' · ' + g.visits + '× da gewesen' : '');
          return '<button type="button" class="st-item' + (cur && cur.id === g.id ? ' on' : '') + '" data-nav data-g="' + i + '"' + (off ? ' aria-disabled="true"' : '') + '><span class="st-ic">' + (g.open ? g.icon : '🔒') + '</span><span><b>' + U.esc(g.name) + '</b><small>' + U.esc(sub) + '</small></span></button>'; }).join('') + '</div>';
    };
    const s = AMC.UI.open('<div class="panel glass"><header><h2>🎙️ Studiogäste</h2><button class="btn small" data-nav id="guB">' + AMC.glyph('b') + ' Zurück</button></header><div id="guBody">' + draw() + '</div></div>', { back: () => AMC.UI.close(s) });
    s.el.querySelector('#guB').onclick = () => AMC.UI.close(s);
    s.el.querySelector('#guBody').addEventListener('click', e => {
      const b = e.target.closest('[data-g]'); if (!b || b.getAttribute('aria-disabled')) return; const g = GU.list()[+b.dataset.g];
      if (GU.book(g.id)) { AMC.UI.toast(g.icon + ' ' + g.name + ' kommt heute Abend ins Studio! (+' + Math.round(g.bonus * 100) + ' % Hörer)', 3800); AMC.UI.close(s); }
    });
    return s;
  };

  // ------------------------------------------------------------------ AnMaCha-App
  const TRENDS = [['#GiselaHupt', 'feel'], ['#TechTalk', 'tech'], ['#Ohrwurm', 'musik'], ['#Serienabend', 'tv'], ['#Ernsthaft', 'serious'], ['#FestivalFieber', 'musik'], ['#Gadgets', 'tech'], ['#GuteLaune', 'feel']];
  const COMMENTS = ['Bester Podcast der Stadt! 🧡', 'Gisela for President 🚐', 'Hab beim Joggen gelacht 😂', 'Mehr davon!', 'Marco, du Legende', 'Andrew hat recht!', 'Wann kommt die nächste Folge?', 'Grüße aus dem Medienhafen ⚓', 'Hab euch auf der Insel gesehen 🎪', 'Rico-Collab when? ✳️'];
  const db = () => { const f = Save.data.feed = Save.data.feed || {}; f.posts = f.posts || []; f.fol = f.fol || 80; f.done = f.done || {}; return f; };
  FD.trend = (d) => { d = d || career().day; const t = TRENDS[Math.floor(Math.abs(Math.sin(d * 12.9898 + 4.1) * 43758.5)) % TRENDS.length]; return { tag: t[0], rub: t[1] }; };
  FD.followers = () => Math.round(db().fol);
  FD.post = function (icon, txt, kind) {
    const f = db(), likes = Math.round(f.fol * (0.04 + Math.random() * 0.08)) + U.irand(1, 9);
    f.posts.unshift({ d: career().day, i: icon, t: txt, l: likes, c: U.irand(0, 4) + (kind === 'gast' || kind === 'folge' ? 3 : 0), k: kind || '' }); f.posts = f.posts.slice(0, 30);
    f.fol += Math.max(1, Math.round(likes * 0.15)); Save.save();
  };
  // Aktionen in der App, jede einmal am Tag
  const ACT = [
    ['story', '📸', 'Story posten', 'Ein Foto aus der Stadt · +Follower, +2 % Hörer heute'],
    ['poll', '🗳️', 'Umfrage: Welches Thema heute?', 'Die Community wählt · sammelt ihr es (3 Funken), +5 % Hörer'],
    ['reply', '💬', 'Kommentare beantworten', 'Fans fühlen sich gesehen · Freundschaft und Follower'],
    ['trend', '🔥', 'Beim Trend mitmachen', 'Post zum Trend des Tages · passt das Thema der Folge, +5 % Hörer']
  ];
  FD.ACT = ACT;
  FD.act = function (id) {
    const f = db(), dd = career().day, key = dd + ':' + id, t = career().today; if (f.done[key]) return null; f.done[key] = 1;
    Object.keys(f.done).forEach(k => { if (+k.split(':')[0] < dd - 2) delete f.done[k]; });
    let msg = '';
    if (id === 'story') { const p = U.pick(['📸 Sonnenuntergang über dem Medienhafen 🌅', '📸 Gisela frisch gewaschen ✨', '📸 Studio-Selfie mit Kaffee ☕', '📸 Riesenrad bei Nacht 🎡', '📸 Neon im RicoReWi-Universum ✳️']); FD.post('📸', p, 'story'); t.appStory = 1; msg = 'Story ist online!'; }
    if (id === 'poll') { const r = U.pick(D.RUBRIC_IDS); t.appPoll = r; FD.post('🗳️', 'Umfrage: Worüber sollen wir heute reden? Gewonnen hat ' + D.RUBRICS[r].icon + ' ' + D.RUBRICS[r].name + '!', 'poll'); msg = 'Die Community will ' + D.RUBRICS[r].name + ' – sammelt 3 passende Funken!'; }
    if (id === 'reply') { const names = U.shuffle(D.FAN_NAMES).slice(0, 3); if (AMC.Social) names.forEach(n => AMC.Social.add(n, 3)); f.fol += 12 + Math.round(f.fol * 0.01); msg = 'Ihr habt ' + names.join(', ') + ' geantwortet. +3 ❤️ je Fan'; }
    if (id === 'trend') { const tr = FD.trend(); t.appTrend = 1; FD.post('🔥', 'Unser Beitrag zu ' + tr.tag + ' – heute Abend mehr im Podcast!', 'trend'); msg = 'Mitgemacht bei ' + tr.tag + '!'; }
    Save.save(); AMC.Audio.sfx('ok'); return msg;
  };
  // Anteile an der Folge (Career.episode)
  FD.parts = function () {
    const t = career().today, out = [], tr = FD.trend();
    out.push(['📱 Follower', Math.min(0.1, FD.followers() / 40000)]);
    if (t.appStory) out.push(['📸 Story', 0.02]);
    if (t.appPoll && (t.got[t.appPoll] || 0) >= 3) out.push(['🗳️ Umfrage erfüllt', 0.05]);
    if (t.appTrend && (t.got[tr.rub] || 0) >= 3) out.push(['🔥 Trend ' + tr.tag, 0.05]);
    return out;
  };
  FD.episode = function (hoerer, day) {
    const g = GU.today();
    FD.post('🎙️', 'Neue Folge (Tag ' + day + ') ist online' + (g ? ' – mit ' + g.name + ' als Gast' : '') + '! ' + U.fmt(hoerer) + ' Hörer 🎧', 'folge');
    db().fol += Math.round(hoerer * 0.02); Save.save();
  };
  FD.panel = function () {
    const f = db(), dd = career().day, tr = FD.trend(), t = career().today;
    const acts = ACT.map((a, i) => { const used = f.done[dd + ':' + a[0]]; return '<button type="button" class="st-item" data-nav data-a="' + i + '"' + (used ? ' aria-disabled="true"' : '') + '><span class="st-ic">' + a[1] + '</span><span><b>' + a[2] + '</b><small>' + (used ? 'Heute erledigt' + (a[0] === 'poll' && t.appPoll ? ' · Wunsch: ' + D.RUBRICS[t.appPoll].icon + ' ' + (t.got[t.appPoll] || 0) + '/3' : '') : a[3]) + '</small></span></button>'; }).join('');
    const feed = f.posts.length ? f.posts.slice(0, 12).map(p => '<div class="fd-post"><span class="fd-ic">' + p.i + '</span><div><b>@anmacha_podcast</b><small> · Tag ' + p.d + '</small><p>' + U.esc(p.t) + '</p><em>❤️ ' + U.fmt(p.l) + ' · 💬 ' + p.c + (p.c ? ' · „' + U.esc(COMMENTS[(p.l + p.d) % COMMENTS.length]) + '“' : '') + '</em></div></div>').join('') : '<p class="hint">Noch keine Beiträge. Postet eure erste Story!</p>';
    const s = AMC.UI.open('<div class="panel glass fd-app"><header><h2>📱 AnMaCha-App</h2><button class="btn small" data-nav id="fdB">' + AMC.glyph('b') + ' Zurück</button></header>' +
      '<p class="hint">👥 <b>' + U.fmt(FD.followers()) + '</b> Follower · 🔥 Trend heute: <b>' + tr.tag + '</b> (' + D.RUBRICS[tr.rub].icon + ' ' + D.RUBRICS[tr.rub].name + ')' + (GU.today() ? ' · 🎙️ Gast: ' + U.esc(GU.today().name) : '') + '</p>' +
      '<div class="st-list" id="fdL">' + acts + '</div><div class="fd-feed">' + feed + '</div></div>', { back: () => AMC.UI.close(s) });
    s.el.querySelector('#fdB').onclick = () => AMC.UI.close(s);
    s.el.querySelector('#fdL').addEventListener('click', e => { const b = e.target.closest('[data-a]'); if (!b || b.getAttribute('aria-disabled')) return; const m = FD.act(ACT[+b.dataset.a][0]); AMC.UI.close(s); if (m) AMC.UI.toast('📱 ' + m, 3600); });
    return s;
  };
})(typeof window !== 'undefined' ? window : globalThis);
