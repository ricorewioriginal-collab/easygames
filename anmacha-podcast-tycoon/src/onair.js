/* AnMaCha – Der Podcast: Sender-Partnerschaft in den Senderhäusern.
   Jedes Senderhaus hat ein On-Air-Pult und ein Auftragsbrett. Alles hängt zusammen:
   - Gastmoderation am Pult: eine Sendeuhr mit 5 Slots (Anmoderation, Song, Hörer am Telefon, Jingle/Werbung, Abmoderation).
     Je Slot einen Befehl wählen (Kommandomenü wie bei Kingdom Hearts, gleich für Touch, Maus, Tastatur und Controller) und
     im richtigen Moment reinreden (Ramp-Timing). Ideen aus der Stadt (💡) sind Joker. Ergebnis: Einschaltquote, Sender-Ruf,
     Tickets und Cross-Promo, die eure nächste Podcast-Folge mehr Hörer bringt (Career.episode).
   - Sender-Auftrag (jeden Tag neu je Sender): Fan-Wünsche, Party-Level, Senderspiel, Moderation, Themen-Funken oder eine Idee
     aus der Stadt mitbringen.
   - Sender-Ruf (★ bis ★★★★★): schaltet Vorteile frei (Fans geben mehr Vibe, Sender-Jingle am Pult, Podcast-Jingle im Sender,
     doppelte Auftrags-Tickets, Partnersender +3 % Hörer in jeder Folge). Story-Auftrag „Die Sender-Allianz“ (missions.js). */
(function (root) {
  'use strict';
  const AMC = root.AMC = root.AMC || {};
  const U = AMC.U, I = AMC.Input, W = AMC.World, D = AMC.Data, Save = AMC.Save;
  const OA = AMC.OnAir = {};
  let T;

  // ------------------------------------------------------------------ Ruf und Daten
  const REP = [0, 4, 10, 18, 30, 45];
  const REP_N = ['Neu im Haus', 'Bekannt', 'Gastmoderator', 'Stammgast am Mikro', 'Sendergesicht', 'Partnersender'];
  const PERK = ['Erster Besuch', 'Fans geben 50 % mehr Vibe', 'Spezialbefehl am Pult: Sender-Jingle', 'Euer Podcast-Jingle läuft im Sender: +1 % Hörer je Folge', 'Doppelte Tickets für Sender-Aufträge', 'Partnersender: +3 % Hörer in jeder Folge'];
  OA.REP = REP; OA.REP_N = REP_N; OA.PERK = PERK;
  const db = () => { const d = Save.data.onair = Save.data.onair || {}; d.xp = d.xp || {}; d.job = d.job || {}; d.best = d.best || {}; d.promo = d.promo || 0; d.shows = d.shows || 0; d.good = d.good || 0; return d; };
  const day = () => (AMC.Career ? AMC.Career.state().day : 0);
  const stars = n => '★'.repeat(n) + '☆'.repeat(5 - n);
  const starsH = n => '<b class="oa-st">' + '★'.repeat(n) + '<i>' + '★'.repeat(5 - n) + '</i></b>';
  OA.xp = slug => db().xp[slug] || 0;
  OA.level = slug => { const x = OA.xp(slug); let l = 0; REP.forEach((r, i) => { if (x >= r) l = i; }); return l; };
  OA.count = lv => D.STATIONS.filter(s => OA.level(s.slug) >= lv).length;
  OA.bonus = () => D.STATIONS.reduce((a, s) => { const l = OA.level(s.slug); return a + (l >= 5 ? 0.03 : l >= 3 ? 0.01 : 0); }, 0);
  OA.promo = () => Math.min(0.25, db().promo);
  OA.after = () => { db().promo = 0; };   // Cross-Promo gilt für genau eine Folge
  OA.shows = () => db().good;
  OA.gain = function (R, n, why) {
    const slug = R.slug, l0 = OA.level(slug); db().xp[slug] = OA.xp(slug) + n; const l1 = OA.level(slug); Save.save();
    if (l1 > l0) {
      setTimeout(() => AMC.UI.toast('⭐ ' + R.st.name + ': Ruf „' + REP_N[l1] + '“ – ' + PERK[l1], 4200), 600);
      AMC.Audio.sfx('star'); if (AMC.Feed) AMC.Feed.post('📻', R.st.name + ': Andrew & Marco sind jetzt „' + REP_N[l1] + '“!', l1 >= 5 ? 'story' : '');
      if (R.oa) drawHud(R);
      for (let i = 0; i < 3; i++) setTimeout(() => R.oa && W.particles.burst(U.rand(-2, 2), 2.6, U.rand(-1, 1), [0xffd23f, 0xff3da8, 0x3dd6ff][i], 40, { speed: 5 }), i * 200);
    }
    if (AMC.Missions && AMC.Missions.onair) AMC.Missions.onair();
    return l1 > l0;
  };

  // ------------------------------------------------------------------ Sender-Aufträge (jeden Tag einer je Sender)
  const JOBS = [
    { id: 'wish', icon: '✍️', n: 3, txt: () => 'Erfüllt 3 Fan-Wünsche hier im Haus', rep: 4, fan: 60 },
    { id: 'party', icon: '🎉', n: 1, txt: () => 'Bringt den Vibe auf 100 (Party-Level)', rep: 4, fan: 70 },
    { id: 'game', icon: '🎮', n: 1, txt: R => 'Schafft im Senderspiel „' + R.cfg.game.name + '“ mindestens 60 %', rep: 4, fan: 70 },
    { id: 'show', icon: '🎙️', n: 1, txt: () => 'Moderiert eine Sendung mit mindestens ★★★', rep: 5, fan: 80 },
    { id: 'funken', icon: '✨', n: 3, txt: (R, j) => 'Bringt 3 Themen-Funken „' + D.RUBRICS[j.rub].name + '“ aus der Stadt mit (heute gesammelt)', rep: 5, fan: 80, deliver: true },
    { id: 'idea', icon: '💡', n: 1, txt: () => 'Bringt eine Show-Idee aus der Stadt mit (💡, wird abgegeben)', rep: 6, fan: 90, deliver: true }
  ];
  OA.JOBS = JOBS;
  function job(R) {
    const d = db(), today = day(); let j = d.job[R.slug];
    if (!j || j.d !== today) {
      const h = Math.abs(Math.sin((today + 1) * 91.7 + R.slug.length * 13.3 + R.slug.charCodeAt(0)) * 43758.5);
      const t = JOBS[Math.floor(h) % JOBS.length];
      j = d.job[R.slug] = { d: today, id: t.id, p: 0, done: false, rub: D.RUBRIC_IDS[Math.floor(h * 7) % D.RUBRIC_IDS.length] }; Save.save();
    }
    return j;
  }
  const jobDef = j => JOBS.find(x => x.id === j.id) || JOBS[0];
  function canDeliver(R, j) {
    if (j.id === 'funken') { const c = AMC.Career ? AMC.Career.state().today : null; return !!c && (c.got[j.rub] || 0) >= 3; }
    if (j.id === 'idea') return (R.oa.K.needs(R.who).ideas || []).length > 0;
    return false;
  }
  function finishJob(R, j) {
    const t = jobDef(j); j.done = true; j.p = t.n;
    const fan = Save.earn(t.fan * (OA.level(R.slug) >= 4 ? 2 : 1));
    R.oa.K.say('✅ Sender-Auftrag geschafft: ' + t.txt(R, j) + ' · +' + fan + ' 🎟️ · Ruf +' + t.rep, 5200);
    AMC.Audio.sfx('applause'); W.particles.burst(R.oa.board.x, 2.2, R.oa.board.z + 0.4, 0x6cff8a, 40, { speed: 4 });
    OA.gain(R, t.rep, 'job'); drawHud(R); Save.save();
  }
  /** Ereignis im Haus: wish | party | game (q) | show (q) */
  OA.event = function (R, kind, q) {
    if (!R || !R.oa) return;
    if (kind === 'wish') OA.gain(R, OA.level(R.slug) >= 1 ? 1 : 0.5);
    if (kind === 'party') OA.gain(R, 2);
    if (kind === 'game' && q >= 0.6) OA.gain(R, 1);
    const j = job(R); if (j.done || j.id !== kind) return;
    if ((kind === 'game' || kind === 'show') && !(q >= 0.6)) return;
    j.p++; Save.save();
    if (j.p >= jobDef(j).n) finishJob(R, j); else { drawHud(R); AMC.UI.toast(jobDef(j).icon + ' Sender-Auftrag ' + j.p + '/' + jobDef(j).n, 1800); }
  };

  // ------------------------------------------------------------------ Aufbau im Haus
  /** Pult und Auftragsbrett an einer freien Stelle der Rückwand; api = Helfer aus sender.js (feed, bubble, bumpVibe, setWish) */
  OA.setup = function (R, K, api) {
    T = root.THREE;
    const cfg = R.cfg, hw = cfg.w / 2, hd = cfg.d / 2, z = -hd + 1.55;   // Pult mit Abstand zur Wand: moderiert wird von hinten, Blick zu den Fans
    const wide = /logoBig|screens|map|board|bigscreen|tapes|glitter|stage|djbooth|bar|podium|fireplace|desk/;
    const props = R.B.props.map(p => ({ x: p.x, z: p.z, r: wide.test(p.k) ? 2.4 : 1.1 }));
    let best = null, bs = -1;
    for (let x = -hw + 1.6; x <= hw - 1.6; x += 0.25) {
      const free = q => props.reduce((m, p) => Math.min(m, Math.hypot(p.x - q, p.z - z) - p.r), 9);
      const f = Math.min(free(x), Math.max(free(x + 2.3), free(x - 2.3)) + 0.6) - Math.abs(x - (-hw + 3)) * 0.02;
      if (f > bs) { bs = f; best = x; }
    }
    const bx = best, side = (bx + 2.3 < hw - 1 && props.reduce((m, p) => Math.min(m, Math.hypot(p.x - bx - 2.3, p.z - z) - p.r), 9) > props.reduce((m, p) => Math.min(m, Math.hypot(p.x - bx + 2.3, p.z - z) - p.r), 9)) || bx - 2.3 < -hw + 1 ? 1 : -1;
    R.oa = { K, api, desk: { x: bx, z }, board: { x: bx + side * 2.3, z: -hd + 0.25 }, show: null };
    R.oa.deskG = desk(R, bx, z); R.oa.boardG = board(R, R.oa.board.x, -hd + 0.06);
    R.B.props.push({ k: 'onair', x: bx, z, m: R.oa.deskG });
    const top = document.querySelector('#homeUi .hm-top');
    if (top) top.insertAdjacentHTML('beforeend', '<div class="oa-hud" id="oaHud"></div>');
    job(R); drawHud(R);
  };
  OA.solids = R => R.oa ? [{ x: R.oa.desk.x, z: R.oa.desk.z, r: 0.95 }] : [];
  OA.spots = function (R) {
    if (!R.oa || R.oa.show) return [];
    const j = job(R), t = jobDef(j), ok = !j.done && t.deliver && canDeliver(R, j);
    return [
      { x: R.oa.desk.x, z: R.oa.desk.z + 1.15, r: 1.4, label: '🎙️ On-Air-Pult: Gastmoderation' + (db().best[R.slug] ? ' · Rekord ' + stars(db().best[R.slug]) : ''), run: () => OA.start(R) },
      { x: R.oa.board.x, z: R.oa.board.z + 1.0, r: 1.3, label: ok ? '📦 Abgeben: ' + t.txt(R, j) : '📋 Sender-Auftrag & Ruf', run: () => (ok ? deliver(R, j) : panel(R)) }
    ];
  };
  function deliver(R, j) {
    if (j.id === 'idea') { const n = R.oa.K.needs(R.who); const idea = n.ideas.shift(); R.oa.K.drawNeeds(); R.oa.api.feed('📻 ' + R.st.name, 'Idee übernommen: „' + idea + '“'); }
    finishJob(R, j);
  }
  function desk(R, x, z) {
    const g = new T.Group(); g.position.set(x, 0, z); R.g.add(g);
    const col = new T.Color(R.st.color).getHex(), M = (c, o) => W.mat(c, o || { r: 0.55 });
    W.box(2.0, 0.82, 0.8, M(0x23252e), 0, 0.41, 0, g, false);
    W.box(2.06, 0.06, 0.86, M(col, { e: col, ei: 0.8 }), 0, 0.85, 0, g, false);
    W.box(1.1, 0.08, 0.5, M(0x111216), 0, 0.92, 0.05, g, false);   // Mischpult
    for (let i = 0; i < 8; i++) W.box(0.05, 0.04, 0.18, M(i % 3 ? 0xd8dbe3 : col, { e: i % 3 ? 0 : col, ei: 0.8 }), -0.42 + i * 0.12, 0.98, 0.05 + (i % 2) * 0.06, g, false);
    [-0.78, 0.78].forEach(o => { W.box(0.36, 0.5, 0.34, M(0x16171c), o, 1.13, 0.1, g, false); W.cyl(0.11, 0.11, 0.03, M(0x3a3d48), o, 1.2, 0.28, g, 14).rotation.x = Math.PI / 2; });
    W.box(0.56, 0.3, 0.04, M(0x0e0f14), -0.25, 1.05, 0.2, g, false); W.box(0.5, 0.25, 0.02, M(0x1a2b4a, { e: col, ei: 0.45 }), -0.25, 1.05, 0.175, g, false);
    // Front zu den Fans: Leuchtleiste in Senderfarbe
    W.box(1.9, 0.5, 0.02, M(col, { e: col, ei: 0.35 }), 0, 0.5, 0.41, g, false);
    const arm = W.cyl(0.02, 0.02, 0.7, M(0x2a2c33, { m: 0.4, r: 0.4 }), 0.45, 1.25, -0.2, g, 6); arm.rotation.z = 0.5;
    const mic = new T.Mesh(new T.CylinderGeometry(0.07, 0.06, 0.24, 14), M(0xb8bdc8, { m: 0.3, r: 0.35 })); mic.position.set(0.28, 1.5, -0.36); mic.rotation.x = -0.5; g.add(mic);
    // „ON AIR“-Leuchte an der Wand – rot, solange gesendet wird
    const tx = W.textTex(['ON AIR'], { w: 256, h: 80, size: 50, bg: '#2a0808', fg: '#ff4040', accent: '#ff4040' });
    const sign = new T.Mesh(new T.PlaneGeometry(1.3, 0.4), new T.MeshBasicMaterial({ map: tx, toneMapped: false, transparent: true, opacity: 0.45 })); sign.position.set(0, 2.55, -1.45); g.add(sign);
    g.userData.sign = sign; return g;
  }
  function board(R, x, z) {
    const g = new T.Group(); g.position.set(x, 0, z); R.g.add(g);
    W.box(1.5, 1.1, 0.06, W.mat(0x6b4a30, { r: 0.8 }), 0, 1.75, 0, g, false);
    W.box(1.36, 0.96, 0.02, W.mat(0xc9a77a, { r: 0.9 }), 0, 1.75, 0.035, g, false);
    const tx = W.textTex(['📋 AUFTRÄGE', R.st.name], { w: 256, h: 128, size: 30, bg: '#14161f', accent: R.st.color });
    const m = new T.Mesh(new T.PlaneGeometry(1.0, 0.5), new T.MeshBasicMaterial({ map: tx, toneMapped: false })); m.position.set(0, 1.92, 0.05); m.rotation.z = -0.03; g.add(m);
    [[-0.45, 1.5, 0xfff3a0], [0.42, 1.48, 0xa0e8ff]].forEach(([px, py, c]) => { const n = W.box(0.32, 0.26, 0.01, W.mat(c), px, py, 0.05, g, false); n.rotation.z = px * 0.2; });
    return g;
  }
  function drawHud(R) {
    const el = U.$('oaHud'); if (!el || !R.oa) return;
    const l = OA.level(R.slug), j = job(R), t = jobDef(j);
    el.innerHTML = '<span class="oa-rep" title="' + U.esc(PERK[l]) + '">' + starsH(l) + ' <small>' + U.esc(REP_N[l]) + '</small></span>' +
      '<span class="oa-job' + (j.done ? ' ok' : '') + '">' + (j.done ? '✅ ' : t.icon + ' ') + U.esc(t.txt(R, j)) + (t.n > 1 && !j.done ? ' (' + j.p + '/' + t.n + ')' : '') + '</span>';
    if (R.oa.K && AMC.Home.layout) AMC.Home.layout();
  }
  function panel(R) {
    const l = OA.level(R.slug), x = OA.xp(R.slug), j = job(R), t = jobDef(j);
    const rows = REP_N.map((n, i) => '<div class="st-item' + (i === l ? ' on' : '') + '"><span class="st-ic">' + (i <= l ? '⭐' : '🔒') + '</span><span><b>' + stars(i) + ' ' + n + '</b><small>' + PERK[i] + ' · ab ' + REP[i] + ' Ruf</small></span></div>').join('');
    const all = D.STATIONS.map(s => U.esc(s.name) + ' ' + '★'.repeat(OA.level(s.slug))).join(' · ');
    const s = AMC.UI.open('<div class="panel glass"><header><h2>📻 ' + U.esc(R.st.name) + ': Auftrag & Ruf</h2><button class="btn small" data-nav id="oaB">' + AMC.glyph('b') + ' Zurück</button></header>' +
      '<div class="st-item on"><span class="st-ic">' + (j.done ? '✅' : t.icon) + '</span><span><b>Heutiger Auftrag' + (j.done ? ' – erledigt' : t.n > 1 ? ' (' + j.p + '/' + t.n + ')' : '') + '</b><small>' + U.esc(t.txt(R, j)) + ' · Belohnung: Ruf +' + t.rep + ', ' + t.fan * (l >= 4 ? 2 : 1) + ' 🎟️. Morgen gibt es einen neuen.</small></span></div>' +
      '<p class="hint">Ruf ' + Math.floor(x) + (l < 5 ? ' / ' + REP[l + 1] + ' bis „' + REP_N[l + 1] + '“' : ' · Partnersender!') + '. Ruf gibt es für Gastmoderationen am Pult, Aufträge, Fan-Wünsche, Party-Level und das Senderspiel. Cross-Promo für eure nächste Folge: +' + Math.round(OA.promo() * 100) + ' % Hörer.</p>' +
      '<div class="st-list">' + rows + '</div><p class="hint">Alle Sender: ' + all + '</p></div>', { back: () => AMC.UI.close(s) });
    s.el.querySelector('#oaB').onclick = () => AMC.UI.close(s);
  }

  // ------------------------------------------------------------------ Gastmoderation (Sendeuhr)
  const SLOTS = [
    { id: 'intro', icon: '👋', name: 'Anmoderation', sit: R => 'Die Rotlicht-Lampe geht an. ' + R.st.name + ' ist live – wie begrüßt ihr die Hörer?',
      opts: R => [['🎯', 'Im Stil des Senders: „' + R.st.desc.split(/[.–]/)[0].trim() + '“', 0.9], ['🕗', 'Uhrzeit, Wetter, gute Laune', 0.65], ['🎲', D.HOSTS[R.who].name + 's Spontan-Witz', -1]] },
    { id: 'song', icon: '🎵', name: 'Song ansagen', sit: R => { const M = AMC.Media, L = M && M.kind === 'radio' && M.slug === R.slug && M.active() ? M.label() : null; return 'Gleich läuft ' + (L && L.main ? '„' + L.main + '“' : 'der nächste Hit') + '. Das Intro hat 12 Sekunden – redet bis kurz vor den Gesang!'; },
      opts: () => [['🔥', 'Titel und Künstler mit Hype ansagen', 0.9], ['📚', 'Kurzer Fakt zum Song', 0.7], ['🎲', 'Mitsingen. Laut.', -1]] },
    { id: 'call', icon: '📞', name: 'Hörer am Telefon', sit: R => U.pick(D.FAN_NAMES) + ' ruft an und will unbedingt live ins Radio.',
      opts: () => [['🎶', 'Musikwunsch erfüllen', 0.9], ['💬', 'Grüße durchgeben lassen', 0.65], ['🎲', 'Spontan-Quiz mit Gewinn', -1]] },
    { id: 'ad', icon: '📢', name: 'Jingle & Werbung', sit: () => 'Werbepause! Wie füllt ihr die 20 Sekunden?',
      opts: R => (OA.level(R.slug) >= 2 ? [['🎺', 'Sender-Jingle fahren (Gastmoderator)', 1.0]] : []).concat([['🎙️', 'AnMaCha – Der Podcast bewerben', 0.75, 'promo'], ['🎲', 'Live-Werbung improvisieren', -1]]) },
    { id: 'outro', icon: '🌙', name: 'Abmoderation', sit: R => 'Die Sendung ist fast vorbei. Letzte Worte an die ' + R.st.name + '-Hörer?',
      opts: R => [['❤️', 'Fans grüßen: „Musik, die mich anmacht!“', 0.9], ['📅', 'Ausblick auf die nächste Sendung', 0.7], ['🎲', D.HOSTS[R.other].name + ' das letzte Wort geben', -1]] }
  ];
  OA.start = function (R) {
    if (!R.oa || R.oa.show || R.game) return;
    const me = W.hosts[R.who];
    R.dancing = false; R.w.x = R.oa.desk.x; R.w.z = R.oa.desk.z - 0.78;   // hinter das Pult, Gesicht zu Fans und Kamera
    if (me) { me.root.position.set(R.w.x, 0, R.w.z); me.root.rotation.y = 0; me.play('idle', { fade: 0.2 }); }
    AMC.UI.showTouch(false);
    const el = U.el('div', 'oa-show glass'); el.id = 'oaShow'; U.$('homeUi').appendChild(el);
    el.addEventListener('click', e => { const b = e.target.closest('[data-o]'); if (b) { S.sel = +b.dataset.o; choose(R); } else if (e.target.closest('[data-now]')) hitNow(R); });
    const lv = OA.level(R.slug), abos = AMC.Career ? AMC.Career.state().abos : 120;
    const S = R.oa.show = { i: -1, sel: 0, phase: 'pick', score: 0, sum: 0, live: Math.round(600 + lv * 450 + abos * 0.4), needle: 0, dir: 1, zone: 0.5, t: 0, el, promo: 0, idea: false };
    R.oa.deskG.userData.sign.material.opacity = 1;
    AMC.Audio.sfx('combo'); R.oa.api.feed('📻 ' + R.st.name, 'ON AIR: ' + D.HOSTS[R.who].name + ' moderiert jetzt live!');
    next(R);
  };
  function opts(R, slot) {
    const list = slot.opts(R).slice(), n = R.oa.K.needs(R.who);
    if ((n.ideas || []).length && !R.oa.show.idea) list.push(['💡', 'Idee einbauen: „' + n.ideas[0] + '“', 1.15, 'idea']);
    return list;
  }
  function next(R) {
    const S = R.oa.show; S.i++;
    if (S.i >= SLOTS.length) return finish(R);
    const slot = SLOTS[S.i]; S.phase = 'pick'; S.sel = 0; S.slot = slot; S.list = opts(R, slot); S.sit = slot.sit(R);
    draw(R);
  }
  function draw(R) {
    const S = R.oa.show, slot = S.slot, el = S.el, q = S.i ? S.sum / S.i : 0;
    const clock = SLOTS.map((s, i) => '<i class="' + (i < S.i ? 'ok' : i === S.i ? 'on' : '') + '" title="' + s.name + '">' + s.icon + '</i>').join('');
    let body;
    if (S.phase === 'pick') body = '<p class="oa-sit">' + U.esc(S.sit) + '</p><ul class="oa-cmd">' + S.list.map((o, i) => '<li><button type="button" data-o="' + i + '" class="' + (i === S.sel ? 'on' : '') + '"><span>' + o[0] + '</span>' + U.esc(o[1]) + (o[2] < 0 ? ' <small>Risiko</small>' : o[3] === 'promo' ? ' <small>Cross-Promo</small>' : o[3] === 'idea' ? ' <small>Joker</small>' : '') + '</button></li>').join('') + '</ul><p class="oa-help">' + (I.device === 'touch' ? 'Befehl antippen' : AMC.glyph('dpad') + ' wählen · ' + AMC.glyph('a') + ' ansagen · ' + AMC.glyph('b') + ' abbrechen') + '</p>';
    else body = '<p class="oa-sit">🎚️ Reinreden, wenn die Nadel im grünen Feld ist – genau vor dem Gesang!</p><div class="oa-ramp"><b style="left:' + ((S.zone - 0.09) * 100) + '%;width:18%"></b><i id="oaNeedle"></i></div><button type="button" class="btn primary oa-now" data-now>🎙️ Jetzt reden!' + (I.device === 'touch' ? '' : ' ' + AMC.glyph('a')) + '</button>';
    el.innerHTML = '<header><b>🔴 ON AIR · ' + U.esc(R.st.name) + '</b><span class="oa-clock">' + clock + '</span></header><div class="oa-meta"><span>' + slot.icon + ' ' + slot.name + ' · ' + (S.i + 1) + '/5</span><span>📈 Quote <em>' + Math.round(q * 100) + ' %</em></span><span>🎧 <em id="oaLive">' + U.fmt(S.live) + '</em> live</span></div>' + body;
  }
  function choose(R) {
    const S = R.oa.show; if (!S || S.phase !== 'pick') return;
    const o = S.list[S.sel]; if (!o) return;
    S.pick = o; S.phase = 'ramp'; S.needle = 0; S.dir = 1; S.zone = U.rand(0.35, 0.85); S.speed = 0.75 + S.i * 0.14;
    AMC.Audio.sfx('ui'); draw(R);
  }
  function hitNow(R) {
    const S = R.oa.show; if (!S || S.phase !== 'ramp') return;
    const d = Math.abs(S.needle - S.zone), tq = d <= 0.09 ? 1 : Math.max(0, 1 - (d - 0.09) / 0.35);
    let v = S.pick[2]; const risky = v < 0; if (risky) v = Math.random() < 0.5 + tq * 0.25 ? 1.2 : 0.3;
    const sc = Math.min(1.2, v * (0.5 + 0.5 * tq)); S.sum += Math.min(1, sc); S.phase = 'wait';
    if (S.pick[3] === 'promo') S.promo += 0.03;
    if (S.pick[3] === 'idea') { const n = R.oa.K.needs(R.who); n.ideas.shift(); R.oa.K.drawNeeds(); S.idea = true; S.promo += 0.04; }
    S.live = Math.round(S.live * (0.92 + sc * 0.22));
    react(R, sc, tq, risky);
    setTimeout(() => { if (R.oa && R.oa.show === S) next(R); }, 1500);
  }
  function react(R, sc, tq, risky) {
    const me = W.hosts[R.who], mate = W.hosts[R.other], S = R.oa.show, api = R.oa.api;
    const good = sc >= 0.8, ok = sc >= 0.5;
    const line = good ? U.pick(['🔥 Die Leitungen glühen!', '📈 Quote schießt hoch!', '🎉 Perfekt auf den Punkt!', '💯 Das war Radio!']) : ok ? U.pick(['👍 Solide gesendet.', '🙂 Läuft.', '🎧 Die Hörer bleiben dran.']) : U.pick(['😬 Funkstille …', '🙈 Das ging daneben.', '📉 Ein paar schalten um …']);
    S.el.querySelector('.oa-sit').textContent = line + (tq >= 1 ? ' Timing perfekt!' : tq > 0.5 ? ' Gutes Timing.' : ' Timing daneben.') + (risky ? (sc >= 0.8 ? ' Das Risiko hat sich gelohnt!' : ' Das Risiko ging schief.') : '');
    const l = S.el.querySelector('#oaLive'); if (l) l.textContent = U.fmt(S.live);
    const btn = S.el.querySelector('.oa-now'); if (btn) btn.disabled = true;
    if (me) { me.play(good ? 'arms' : ok ? 'yes' : 'idle', { restart: true, fade: 0.1 }); }
    if (mate) { mate.play(ok ? 'yes' : 'arms', { restart: true, fade: 0.15 }); R.mateT = 1.4; }
    AMC.Audio.sfx(good ? 'cheer' : ok ? 'ok' : 'miss');
    if (ok) { W.particles.burst(R.oa.desk.x, 1.8, R.oa.desk.z + 0.6, new T.Color(R.st.color).getHex(), good ? 36 : 16, { speed: good ? 4 : 2.5 }); api.bumpVibe(R, good ? 8 : 4); }
    R.fans.forEach(f => { if (good) { f.danceT = 2.2; } });
    if (R.fans.length) { const f = U.pick(R.fans), t = good ? U.pick(['Beste Sendung ever!', 'Ich ruf gleich an!', 'LAUTER!', U.pick(R.cfg.lines)]) : ok ? U.pick(['Ganz nett!', 'Weiter so!', 'Hab ich gehört 👂']) : U.pick(['Hä?', 'Hust.', 'Nächster Song bitte!']); api.bubble(R, f, t); api.feed(f.name, t); }
  }
  function finish(R) {
    const S = R.oa.show, q = S.sum / SLOTS.length, st = Math.max(1, Math.min(5, Math.round(q * 5 + 0.2))), d = db();
    const rep = 1 + st, fan = Save.earn(30 + st * 25), promo = Math.min(0.08, S.promo + (st >= 3 ? 0.02 + (st - 3) * 0.015 : 0));
    d.shows++; if (st >= 3) d.good++; d.promo = Math.min(0.25, d.promo + promo); if (st > (d.best[R.slug] || 0)) d.best[R.slug] = st; Save.save();
    const n = R.oa.K.needs(R.who); n.fun = Math.min(100, n.fun + 8); n.energy = Math.max(0, n.energy - 8);
    if (st >= 4 && (n.ideas || []).length < 3) n.ideas.push(R.st.name + ': Hörer-Anruf live');
    R.oa.K.drawNeeds();
    S.phase = 'done';
    S.el.innerHTML = '<header><b>⏹️ Sendung vorbei · ' + U.esc(R.st.name) + '</b></header><p class="oa-res">' + starsH(st) + '</p><p class="oa-sit">📈 Quote ' + Math.round(q * 100) + ' % · 🎧 ' + U.fmt(S.live) + ' Hörer zum Schluss<br>⭐ Sender-Ruf +' + rep + ' · +' + fan + ' 🎟️' + (promo > 0 ? ' · 📣 Cross-Promo: +' + Math.round(promo * 100) + ' % Hörer bei eurer nächsten Folge' : '') + (st >= 4 ? ' · 💡 neue Show-Idee' : '') + '</p><button type="button" class="btn primary" data-end>Weiter' + (I.device === 'touch' ? '' : ' ' + AMC.glyph('a')) + '</button>';
    S.el.querySelector('[data-end]').onclick = () => OA.stop(R);
    AMC.Audio.sfx(st >= 3 ? 'applause' : 'miss');
    if (st >= 4) { if (AMC.Feed) AMC.Feed.post('🎙️', D.HOSTS[R.who].name + ' moderiert bei ' + R.st.name + ' – ' + stars(st) + '!', ''); for (let i = 0; i < 4; i++) setTimeout(() => R.oa && W.particles.burst(U.rand(-3, 3), 3, U.rand(-2, 2), [0xffd23f, 0xff3da8, 0x3dd6ff, 0x6cff8a][i], 40, { speed: 6 }), i * 220); }
    OA.gain(R, rep, 'show'); OA.event(R, 'show', q);
    S.endT = 8;
  }
  OA.stop = function (R) {
    if (!R.oa || !R.oa.show) return;
    const S = R.oa.show; R.oa.show = null; if (S.el) S.el.remove();
    R.oa.deskG.userData.sign.material.opacity = 0.45; AMC.UI.showTouch(true); drawHud(R);
    R.w.x = R.oa.desk.x; R.w.z = R.oa.desk.z + 1.15; R.w.cp = null; R.w.ct = null;   // wieder vor das Pult
    const me = W.hosts[R.who]; if (me) { me.root.position.set(R.w.x, 0, R.w.z); me.root.rotation.y = Math.PI; me.play('idle', { fade: 0.2 }); }
  };
  /** Schleife: true = Sendung läuft (Laufen gesperrt) */
  OA.tick = function (R, dt) {
    const S = R.oa && R.oa.show; if (!S) return false;
    const me = W.hosts[R.who]; if (me) me.update(dt);
    const cam = W.camera, k = 1 - Math.exp(-dt * 3), dx = R.oa.desk.x, dz = R.oa.desk.z;
    S.cp = S.cp || cam.position.clone(); S.ct = S.ct || new T.Vector3(dx, 1.2, dz);
    S.cp.lerp(new T.Vector3(dx * 0.7, 3.3, dz + 4.6), k); S.ct.lerp(new T.Vector3(dx, 1.3, dz), k); cam.position.copy(S.cp); cam.lookAt(S.ct);
    const ok = I.hit('ok') || I.hit('jump') || I.hit('act');
    if (S.phase === 'pick') {
      if (I.hit('up') || I.hit('k1')) { S.sel = (S.sel + S.list.length - 1) % S.list.length; AMC.Audio.sfx('ui'); draw(R); }
      else if (I.hit('down') || I.hit('k4')) { S.sel = (S.sel + 1) % S.list.length; AMC.Audio.sfx('ui'); draw(R); }
      else if (ok) choose(R);
      else if (I.hit('back')) { OA.stop(R); R.oa.K.say('🔇 Sendung abgebrochen. Der Sender spielt Musik.', 2400); }
    } else if (S.phase === 'ramp') {
      S.needle += S.dir * dt * S.speed; if (S.needle > 1) { S.needle = 1; S.dir = -1; } if (S.needle < 0) { S.needle = 0; S.dir = 1; }
      const n = S.el.querySelector('#oaNeedle'); if (n) n.style.left = (S.needle * 100) + '%';
      if (ok) hitNow(R);
    } else if (S.phase === 'done') { S.endT -= dt; if (ok || I.hit('back') || S.endT <= 0) OA.stop(R); }
    return true;
  };
})(typeof window !== 'undefined' ? window : globalThis);
