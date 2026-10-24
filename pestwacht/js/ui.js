/* Pestwacht · Oberfläche (Grundgerüst): Titel, HUD, Hinweise, Fenster, Einstellungen, Spielstände, Hilfe, Mitwirkende.
 * Die Fachfenster (Bauen, Gesundheit, Militär, Helden, Forschung, Weltkarte, Diplomatie, Aufgaben, Schlacht) stehen in panels.js. */
(function (root) {
  'use strict';
  const PW = root.PW = root.PW || {};
  const U = PW.UI = { S: null, mode: 'city', sel: null, place: null, tile: -1, plan: null, battle: null, slot: 'auto', A: {}, CH: {}, P: {}, open: [], opt: null };
  const doc = root.document, $ = s => doc.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  U.esc = esc; U.$ = $;
  const fmt = v => PW.fmt(v), T = s => PW.fmtTime(s);
  U.fmt = fmt; U.T = T;

  // Kosten als Chips (fehlendes rot)
  U.cost = function (cost, mult, res) {
    mult = mult || 1; res = res || (U.S && U.S.res) || {};
    return Object.keys(cost).filter(k => cost[k] > 0).map(k => { const v = Math.ceil(cost[k] * mult), ok = (res[k] || 0) + 1e-9 >= v; return '<span class="chip' + (ok ? '' : ' bad') + '" title="' + PW.RES_INFO[k].name + '">' + PW.RES_INFO[k].icon + ' ' + fmt(v) + '</span>'; }).join(' ');
  };
  U.bar = (f, cls) => '<div class="bar ' + (cls || '') + '"><i style="width:' + Math.round(PW.clamp(f, 0, 1) * 100) + '%"></i></div>';
  U.btn = (act, label, o) => { o = o || {}; let a = ''; for (const k in (o.d || {})) a += ' data-' + k + '="' + esc(o.d[k]) + '"'; return '<button class="btn ' + (o.cls || '') + '" data-act="' + act + '"' + a + (o.dis ? ' disabled title="' + esc(o.dis) + '"' : o.title ? ' title="' + esc(o.title) + '"' : '') + '>' + label + '</button>'; };
  U.why = w => (w ? '<div class="small bad">⛔ ' + esc(w) + '</div>' : '');
  U.sfx = n => { if (PW.Audio) PW.Audio.play(n); };
  U.res = (k) => PW.RES_INFO[k].icon;

  // ---------- Fenster ----------
  U.modal = function (id, title, render, o) {
    o = o || {};
    U.closeModal(id, true);
    const m = doc.createElement('div'); m.className = 'modal'; m.dataset.id = id;
    m.innerHTML = '<div class="sheet ' + (o.size || '') + '" role="dialog" aria-modal="true" aria-label="' + esc(title) + '"><header><h2>' + title + '</h2>' + (o.noClose ? '' : '<button class="btn small ghost" data-act="close" data-id="' + id + '" aria-label="Schließen">✕</button>') + '</header><div class="body"></div><footer hidden></footer></div>';
    m.addEventListener('pointerdown', e => { if (e.target === m && !o.noClose) U.closeModal(id); });
    $('#modals').appendChild(m);
    const ent = { id, el: m, render, o, tab: o.tab || null };
    U.open.push(ent);
    U.draw(ent);
    if (o.pause && U.S) { ent.wasPaused = U.S.paused; U.S.paused = true; }
    U.sfx('klick');
    setTimeout(() => { const f = m.querySelector('.body .btn:not([disabled]), .body input, header .btn'); if (f && !('ontouchstart' in root)) f.focus({ preventScroll: true }); }, 30);
    return ent;
  };
  U.draw = function (ent) {
    if (!ent || !ent.render) return;
    const body = ent.el.querySelector('.body'), foot = ent.el.querySelector('footer'), st = body.scrollTop;
    const act = doc.activeElement, keep = act && body.contains(act) && (act.tagName === 'INPUT' || act.tagName === 'SELECT') ? act.dataset.key : null;
    const out = ent.render(ent);
    if (typeof out === 'string') { body.innerHTML = out; foot.hidden = true; }
    else { body.innerHTML = out.body; foot.innerHTML = out.foot || ''; foot.hidden = !out.foot; }
    body.scrollTop = st;
    if (keep) { const n = body.querySelector('[data-key="' + keep + '"]'); if (n) n.focus({ preventScroll: true }); }
  };
  U.top = () => U.open[U.open.length - 1] || null;
  U.find = id => U.open.find(e => e.id === id) || null;
  U.closeModal = function (id, silent) {
    for (let k = U.open.length - 1; k >= 0; k--) {
      const e = U.open[k]; if (id && e.id !== id) continue;
      e.el.remove(); U.open.splice(k, 1);
      if (e.o.pause && U.S) U.S.paused = !!e.wasPaused;
      if (e.o.onClose) e.o.onClose();
      if (!id) break;
    }
    if (!silent) { const c = R(); if (c) c.focus({ preventScroll: true }); }
  };
  U.redraw = function () { U.open.forEach(e => { if (e.o.live !== false) U.draw(e); }); };
  const R = () => PW.R.canvas && PW.R.canvas();

  // ---------- Hinweise (Toasts) ----------
  const FEED = { warn: 'warn', gut: 'gut', erfolg: 'erfolg', diplo: 'diplo', story: 'story', kampf: 'warn', event: 'warn' };
  U.toast = function (txt, kind, onClick, life) {
    const f = $('#feed'); if (!f) return;
    const t = doc.createElement('div'); t.className = 'toast ' + (FEED[kind] || ''); t.textContent = txt;
    t.addEventListener('click', () => { t.remove(); if (onClick) onClick(); });
    f.prepend(t); while (f.children.length > 4) f.lastChild.remove();
    setTimeout(() => { t.remove(); }, life || 6500);
  };
  function onLog(e) {
    const k = e.k;
    if (k === 'bau' && /^Fertig|^Verbessert/.test(e.txt)) U.sfx('fertig');
    if (k === 'welt' && !/aufgebrochen|zurück|Kundschafter|Garnison|aufgenommen|behandelt|Karawane|🚩/.test(e.txt)) return;   // Bot-Geschehen nur in der Chronik
    if (k === 'info' && !/Abwesenheit|zurück/.test(e.txt)) return;
    if (k === 'forschung' || k === 'militaer' || k === 'held' || k === 'handel') U.sfx('fertig');
    if (k === 'erfolg') U.sfx('erfolg');
    if (k === 'diplo') U.sfx('brief');
    if (e.wave) U.sfx('glocke');
    const click = e.report ? () => U.P.reports() : e.offer ? () => U.P.diplo() : e.event ? null : e.uid ? () => U.select(e.uid) : null;
    U.toast(e.txt, k, click);
  }

  // ---------- Start eines Spiels ----------
  U.start = function (S) {
    U.S = S; U.sel = null; U.place = null; U.tile = -1; U.battle = null; U.plan = null;
    S._listeners = [onLog];
    S._ui = { watchBattle: (a, bt, d) => U.P.watchBattle(a, bt, d), waveDone: w => U.waveDone(w), achievement: a => { if (PW.Save) PW.Save.writeAch(S); } };
    S.paused = false; S.speed = S.speed || 1;
    U.closeModal(null, true); while (U.open.length) U.closeModal(null, true);
    $('#scrTitle').hidden = true; $('#hud').hidden = false;
    U.setMode('city');
    PW.R.focus(15, 17, 27);
    PW.R.worldInvalidate();
    buildNav(); U.hud(true);
    if (PW.Audio) { PW.Audio.startMusic(); PW.Audio.mood('ruhe'); }
  };
  U.setMode = function (m) {
    U.mode = m; PW.R.setMode(m);
    if (m === 'world' && U.S && !U._wf) { U._wf = 1; PW.R.focusTile(U.S, U.S.world.caps[0], 24); }
    if (m !== 'world') U.tile = -1;
    if (m !== 'city') { U.place = null; }
    U.side(); buildNav(); U.ctx();
  };

  // ---------- Navigation ----------
  const NAV = [
    ['bauen', '🔨', 'Bauen'], ['karte', '🗺️', 'Karte'], ['zuflucht', '📊', 'Zuflucht'], ['lazarett', '🩺', 'Lazarett'], ['militaer', '🛡️', 'Militär'], ['helden', '⭐', 'Helden'],
    ['forschung', '📜', 'Forschung'], ['diplo', '🕊️', 'Diplomatie'], ['aufgaben', '🎯', 'Aufgaben'], ['menu', '☰', 'Menü']
  ];
  function buildNav() {
    const S = U.S; if (!S) return;
    const dot = { diplo: S.offers.length > 0, aufgaben: S.quests.list.concat(S.quests.wlist).some(q => !q.claimed && PW.Game.questProgress(S, q) >= q.n), helden: Object.keys(S.heroes).some(h => S.heroes[h].sp > 0), lazarett: PW.Ward && PW.Ward.todo(S) > 0 };
    $('#nav').innerHTML = NAV.map(([id, ic, l]) => '<button class="btn' + ((id === 'karte' && U.mode === 'world') ? ' on' : '') + '" data-act="nav" data-id="' + id + '" style="position:relative" title="' + l + '"><span>' + (id === 'karte' && U.mode === 'world' ? '🏰' : ic) + '</span>' + (id === 'karte' && U.mode === 'world' ? 'Zuflucht' : l) + (dot[id] ? '<i class="dot"></i>' : '') + '</button>').join('');
  }
  U.buildNav = buildNav;
  U.A.nav = d => {
    const S = U.S; if (!S) return;
    switch (d.id) {
      case 'bauen': if (U.mode !== 'city') U.setMode('city'); U.P.build(); break;
      case 'karte': U.setMode(U.mode === 'world' ? 'city' : 'world'); break;
      case 'zuflucht': U.P.overview(); break;
      case 'lazarett': U.P.ward(); break;
      case 'militaer': U.P.military(); break;
      case 'helden': U.P.heroes(); break;
      case 'forschung': U.P.research(); break;
      case 'diplo': U.P.diplo(); break;
      case 'aufgaben': U.P.quests(); break;
      case 'menu': U.menu(); break;
    }
  };

  // ---------- HUD ----------
  let hudT = 0;
  U.hud = function (force) {
    const S = U.S; if (!S) return;
    const now = performance.now(); if (!force && now - hudT < 220) return; hudT = now;
    const caps = S._caps || {}, rate = S._rate || {};
    $('#resbar').innerHTML = PW.RES.map(k => {
      const v = S.res[k], c = caps[k], r = rate[k] || 0, full = c !== Infinity && c && v >= c - 1, empty = v < 1 && r < 0;
      return '<span class="res' + (full ? ' full' : '') + (empty ? ' empty' : '') + '" data-act="res" data-k="' + k + '" title="' + PW.RES_INFO[k].name + (c !== Infinity && c ? ' (Lager ' + fmt(c) + ')' : '') + '">' + PW.RES_INFO[k].icon + ' ' + fmt(v) + (Math.abs(r) >= 0.5 ? ' <small class="' + (r > 0 ? 'up' : 'dn') + '">' + (r > 0 ? '+' : '') + Math.round(r) + '</small>' : '') + '</span>';
    }).join('');
    const day = PW.dayNo(S), tf = PW.dayTime(S), night = tf > 0.75 || tf < 0.05;
    const sp = S.paused ? 0 : S.speed;
    $('#clock').innerHTML = '<span class="chip" title="Spieltag">' + (night ? '🌙' : '☀️') + ' Tag ' + day + '</span>' +
      [[0, '⏸'], [1, '1×'], [2, '2×'], [3, '3×']].map(([v, l]) => '<button class="btn small' + (sp === v ? ' on' : '') + '" data-act="speed" data-v="' + v + '" aria-label="Tempo ' + l + '">' + l + '</button>').join('') +
      '<button class="btn small" data-act="skip" title="Vorspulen bis zum nächsten fertigen Auftrag (max. 10 min, ohne Angriff)">⏩</button>';
    const p = S.pop, tot = PW.Econ.popTotal(p), d = S._d || {}, sick = p.i + p.q + p.t;
    const w = S.waves, nextW = w.active ? '⚔️ Welle ' + w.active.n + ' läuft' : S.cfg.waves === false ? '' : (S.campaign && S.campaign.noWaves) ? '🕊️ Keine Angriffe' : '⏳ Welle ' + (w.n + 1) + ': ' + T(w.next - S.time);
    $('#poprow').innerHTML = [
      ['zuflucht', '👪 ' + tot + '/' + (d.house || 0), 'Bewohner / Wohnraum'],
      ['gesundheit', (sick ? '🤒 ' + sick : '💚 0') + ' · 🛏 ' + (p.t || 0) + '/' + (d.beds || 0), 'Kranke · belegte/freie Betten'],
      ['lazarett', S.ward && S.ward.list.length ? '🩺 ' + S.ward.list.length + (PW.Ward.todo(S) ? ' ❗' : '') : '', 'Lazarett: Patienten (❗ = du kannst etwas tun)'],
      ['gesundheit', (p.sat >= 60 ? '😊 ' : p.sat >= 35 ? '😐 ' : '😟 ') + Math.round(p.sat), 'Zufriedenheit (Ziel ' + (p.target != null ? p.target : '?') + ')'],
      ['militaer', '🛡 ' + PW.Econ.troopCount(S) + '/' + PW.Econ.troopCap(S), 'Truppen / Grenze'],
      ['militaer', nextW, 'Nächster Angriff']
    ].filter(x => x[1]).map(([a, t, ti]) => '<span class="chip" data-act="nav2" data-id="' + a + '" title="' + ti + '" style="cursor:pointer">' + t + '</span>').join('');
    banner(); mission(); dialog();
    // HUD-Höhen messen (die Rohstoffleiste bricht auf schmalen Geräten um): darunter liegende Leisten rücken nach
    const tb = $('#topbar').offsetHeight, pb = $('#poprow').offsetTop + $('#poprow').offsetHeight;
    if (tb !== U._hT || pb !== U._hP) { U._hT = tb; U._hP = pb; doc.documentElement.style.setProperty('--hudT', tb + 'px'); doc.documentElement.style.setProperty('--hudP', pb + 'px'); }
    if (U.side._t == null || now - U.side._t > 500) U.side();
    if (now - (U._navT || 0) > 1500) { U._navT = now; buildNav(); }
    if (PW.Audio) PW.Audio.mood(w.active ? 'gefahr' : PW.R.night ? 'nacht' : 'ruhe');
  };
  U.A.nav2 = d => { if (d.id === 'lazarett') U.P.ward(); else if (d.id === 'gesundheit') U.P.health(); else if (d.id === 'zuflucht') U.P.overview(); else U.P.military(); };
  U.A.res = () => U.P.overview('wirtschaft');
  U.A.speed = d => { const S = U.S; const v = +d.v; if (v === 0) S.paused = !S.paused; else { S.paused = false; S.speed = v; } U.hud(true); };
  U.A.skip = () => {
    const S = U.S; if (S.waves.active) { U.toast('Nicht während eines Angriffs', 'warn'); return; }
    const t = PW.Game.skipTime(S, 600); U.toast('⏩ ' + T(t) + ' vorgespult', 'info'); U.hud(true); U.redraw();
  };

  // Hinweisleiste: Welle, Ereignis, Angebote, Niederlage/Sieg
  function banner() {
    const S = U.S, out = [], w = S.waves;
    if (w.active) {
      const a = w.active, gm = PW.City.gateMax(S), hq = PW.City.first(S, 'hq'), hqM = hq ? PW.City.maxHp(hq) : 1, left = a.en.length + a.q.length;
      const boss = a.en.find(e => e.boss);
      out.push('<div id="wavehud"><div class="row"><b class="grow">⚔️ ' + (a.raid ? 'Plünderer greifen an' : 'Welle ' + a.n) + (a.boss ? ' · 💀 ' + PW.BOSSES[a.boss].name : '') + '</b><span class="chip">👹 ' + left + '</span><span class="chip">✝ ' + a.kills + '</span>' + U.btn('look', '👁', { cls: 'small', d: { x: 15, z: 26 }, title: 'Zum Tor' }) + '</div>' +
        '<div class="row small"><span style="width:70px">🚪 Tor</span><div class="grow">' + U.bar(gm ? S.city.gate / gm : 0, 'hp') + '</div><span>' + Math.round(S.city.gate) + '</span></div>' +
        '<div class="row small"><span style="width:70px">🏛️ Ratshaus</span><div class="grow">' + U.bar(a.hqHp / hqM, 'hp') + '</div></div>' +
        (boss ? '<div class="row small"><span style="width:70px">💀 Boss</span><div class="grow">' + U.bar(boss.hp / boss.max, 'plague') + '</div></div>' : '') +
        '<div class="skills">' + PW.Heroes.list(S).filter(h => PW.Heroes.available(S, h)).map(h => { const cd = a.hcd[h] || 0, D = PW.HERO[h]; return '<button class="btn" data-act="wskill" data-h="' + h + '" ' + (cd > 0 ? 'disabled' : '') + ' title="' + esc(D.skill.name + ': ' + (PW.Waves.skillInfo[D.skill.id] || '')) + '">' + esc(D.name.split(' ')[0]) + ' · ' + esc(D.skill.name) + (cd > 0 ? ' (' + Math.ceil(cd) + ')' : '') + '<i class="cd" style="width:' + Math.round((1 - cd / D.skill.cd) * 100) + '%"></i></button>'; }).join('') + '</div></div>');
    } else if (w.warned && S.cfg.waves !== false) {
      out.push('<div class="alert"><span class="grow">🔔 Welle ' + (w.n + 1) + ' in ' + T(w.next - S.time) + ((w.n + 1) % PW.WAVES.bossEvery === 0 ? ' – mit Boss!' : '') + '</span>' + U.btn('early', 'Jetzt rufen (+25 % Beute)', { cls: 'small' }) + '</div>');
    }
    const ev = S.events.pending;
    if (ev) {
      const E = PW.EVENT[ev.id];
      const txt = ev.id === 'fluechtlinge' ? ev.n + ' Überlebende (' + ev.sick + ' krank) bitten um Aufnahme.' : PW.costText(ev.give) + ' für ' + PW.costText(ev.cost);
      out.push('<div class="alert gold"><span class="grow">' + E.icon + ' <b>' + E.name + '</b> · ' + txt + ' <span class="muted small">(' + T(ev.until - S.time) + ')</span></span>' + U.btn('event', 'Annehmen', { cls: 'small primary', d: { y: 1 } }) + U.btn('event', 'Ablehnen', { cls: 'small', d: { y: 0 } }) + '</div>');
    }
    if (S.offers.length) out.push('<div class="alert info"><span class="grow">✉️ ' + S.offers.length + ' diplomatische(s) Angebot(e)</span>' + U.btn('nav', 'Ansehen', { cls: 'small', d: { id: 'diplo' } }) + '</div>');
    if (S.defeat) out.push('<div class="alert"><span class="grow">💀 Die Zuflucht ist verlassen.</span>' + U.btn('rebuild', 'Mit Überlebenden neu beginnen', { cls: 'small primary' }) + '</div>');
    if (S.victory && !S._vShown) { S._vShown = 1; U.sfx('sieg'); U.modal('sieg', '👑 Sieg!', () => '<p>' + (S.victory.kind === 'kampagne' ? 'Du hast die Kampagne abgeschlossen.' : esc(PW.Game.VICTORY[S.victory.kind])) + '</p><p class="muted">Du kannst einfach weiterspielen – deine Zuflucht bleibt bestehen.</p>', { size: 'narrow' }); }
    const html = out.join('');
    const b = $('#banner'); if (b._h !== html) { b.innerHTML = html; b._h = html; }
  }
  U.A.wskill = d => { if (PW.Waves.skill(U.S, d.h)) { U.sfx('schwert'); U.hud(true); } };
  U.A.early = () => { if (PW.Waves.callEarly(U.S)) { U.sfx('glocke'); U.setMode('city'); PW.R.focus(15, 25, 30); } };
  U.A.event = d => { PW.Game.answerEvent(U.S, d.y === '1'); U.hud(true); };
  U.A.rebuild = () => { PW.Game.rebuild(U.S); U.hud(true); };
  U.A.look = d => { if (U.mode !== 'city') U.setMode('city'); PW.R.focus(+d.x, +d.z, 24); };

  // Kampagne: Ziele und Dialog
  function mission() {
    const S = U.S, el = $('#mission');
    if (!S.campaign || S.campaign.finished) { el.hidden = true; return; }
    const m = PW.Campaign.mission(S); if (!m) { el.hidden = true; return; }
    const pr = PW.Campaign.progress(S);
    const html = '<b>Kapitel ' + m.ch + ' · ' + esc(m.name) + '</b><div class="muted small">' + esc(m.type) + '</div>' + pr.map(p => '<div class="goal' + (p.done ? ' done' : '') + '">' + (p.done ? '✅' : '◻️') + ' <span>' + esc(p.t) + ' <span class="muted">(' + Math.floor(p.c) + '/' + p.n + ')</span></span></div>').join('');
    if (el._h !== html) { el.innerHTML = html; el._h = html; }
    el.hidden = false;
    el.onclick = () => { const h = pr.find(p => !p.done && p.hint); if (!h) return; const [k, v] = h.hint.split(':'); if (k === 'build') { U.setMode('city'); U.P.build(PW.BLD[v].cat, v); } else if (k === 'panel' && v === 'gesundheit') U.P.health(); };
  }
  function dialog() {
    const S = U.S, el = $('#dialog'), d = S.campaign && S.campaign.dialog;
    if (!d) { el.hidden = true; el._k = null; return; }
    const line = d.lines[d.i], key = d.mission + ':' + d.i; if (el._k === key && !el.hidden) return;
    el._k = key;
    const who = PW.Campaign.CAST[line[0]] || { name: line[0], col: '#888' };
    el.innerHTML = '<div class="portrait" style="background:' + who.col + '">' + esc(who.name.replace(/^(Äbtissin|Hauptmann|Bruder|Gräfin|Meister|Meisterin|Der|Die) /, '').charAt(0)) + '</div><div class="grow"><div class="who">' + esc(who.name) + '</div><div class="txt">' + esc(line[1]) + '</div><div class="more">Tippen zum Fortfahren · ' + (d.i + 1) + '/' + d.lines.length + ' · <a href="#" data-act="dskip" style="color:inherit">Überspringen</a></div></div>';
    el.hidden = false;
    el.onclick = e => { if (e.target.closest('[data-act="dskip"]')) return; PW.Campaign.nextLine(S); U.sfx('klick'); el._k = null; dialog(); };
  }
  U.A.dskip = (d, el, e) => { if (e) e.preventDefault(); PW.Campaign.skipDialog(U.S); $('#dialog').hidden = true; };

  // ---------- Kontextleiste und Seitenfenster ----------
  U.ctx = function () {
    const S = U.S, el = $('#ctx'); if (!S) return;
    let h = '';
    if (U.mode === 'city' && U.place) {
      const p = U.place, ok = p.x != null && PW.City.canPlace(S, p.type, p.x, p.y, p.rot, p.moveUid).ok;
      h = '<span class="chip">' + PW.BLD[p.type].icon + ' ' + esc(PW.BLD[p.type].name) + (p.moveUid ? ' versetzen' : '') + ' – Platz antippen</span>' + U.btn('pok', '✔ ' + (p.moveUid ? 'Hierher' : 'Bauen'), { cls: 'primary', dis: ok ? null : 'Freien Platz wählen' }) + (PW.BLD[p.type].w !== PW.BLD[p.type].h ? U.btn('prot', '↻ Drehen') : '') + U.btn('pcancel', '✕');
    }
    if (el._h !== h) { el.innerHTML = h; el._h = h; doc.body.classList.toggle('hasctx', !!h); }
  };
  U.side = function () {
    const S = U.S, el = $('#side'); U.side._t = performance.now(); if (!S) return;
    let title = '', body = '';
    if (U.mode === 'city' && U.sel && !U.place) { const r = U.P.bldSide && U.P.bldSide(U.sel); if (r) { title = r.title; body = r.body; } else U.sel = null; }
    else if (U.mode === 'world' && U.tile >= 0) { const r = U.P.tileSide && U.P.tileSide(U.tile); if (r) { title = r.title; body = r.body; } }
    if (!title) { el.hidden = true; return; }
    el.hidden = false;
    const k = title + body; if (el._h === k) return; el._h = k;
    const b = el.querySelector('.body'), st = b.scrollTop;
    el.querySelector('h3').innerHTML = title; b.innerHTML = body; b.scrollTop = st;
  };
  U.A['side-close'] = () => { U.sel = null; U.tile = -1; U.side(); };
  U.select = function (uid) { U.setMode('city'); U.sel = uid; const b = PW.City.get(U.S, uid); if (b && b.w) PW.R.focus(b.x + b.w / 2, b.y + b.h / 2 + 4); U.side(); };

  // ---------- Platzieren ----------
  U.startPlace = function (type, moveUid) {
    const S = U.S, b = moveUid ? PW.City.get(S, moveUid) : null;
    U.closeModal(); U.setMode('city'); U.sel = null;
    U.place = { type, rot: b ? b.rot : 0, moveUid: moveUid || null, x: null, y: null };
    // Vorschlag: erster freier Platz nahe der Bildmitte
    const r = PW.R.rigs.city, [w, h] = PW.City.dims(type, U.place.rot);
    let best = null, bd = 1e9;
    for (let x = PW.City.MIN; x <= PW.City.MAX - w + 1; x++) for (let y = PW.City.MIN; y <= PW.City.MAX - h + 1; y++) {
      if (!PW.City.canPlace(S, type, x, y, U.place.rot, moveUid).ok) continue;
      const d = Math.hypot(x + w / 2 - r.tx, y + h / 2 - r.tz); if (d < bd) { bd = d; best = [x, y]; }
    }
    if (best) { U.place.x = best[0]; U.place.y = best[1]; }
    U.ctx(); U.side();
  };
  U.placeAt = function (gx, gz) {
    const p = U.place; if (!p) return;
    const [w, h] = PW.City.dims(p.type, p.rot);
    p.x = PW.clamp(Math.round(gx - w / 2), PW.City.MIN, PW.City.MAX - w + 1); p.y = PW.clamp(Math.round(gz - h / 2), PW.City.MIN, PW.City.MAX - h + 1);
    U.ctx();
  };
  U.A.prot = () => { const p = U.place; if (!p) return; p.rot = p.rot ? 0 : 1; if (p.x != null) U.placeAt(p.x + PW.City.dims(p.type, p.rot)[1] / 2, p.y + PW.City.dims(p.type, p.rot)[0] / 2); U.ctx(); };
  U.A.pcancel = () => { U.place = null; U.ctx(); };
  U.A.pok = () => {
    const S = U.S, p = U.place; if (!p || p.x == null) return;
    const r = p.moveUid ? PW.City.move(S, p.moveUid, p.x, p.y, p.rot) : PW.City.place(S, p.type, p.x, p.y, p.rot);
    if (!r.ok) { U.toast(r.why, 'warn'); U.sfx('fehler'); return; }
    U.sfx('bau');
    const keep = !p.moveUid && PW.BLD[p.type].cat === 'deko' && !PW.City.canBuild(S, p.type);   // Wege/Deko: weiter setzen
    if (keep) { U.place = { type: p.type, rot: p.rot, x: p.x, y: p.y }; }
    else { U.sel = p.moveUid || (r.b && r.b.id); U.place = null; }
    PW.Game.refresh(S); U.ctx(); U.side(); U.hud(true);
  };

  // ---------- Tippen in die 3D-Ansicht ----------
  U.tap = function (cx, cy) {
    const S = U.S; if (!S) return;
    if (U.mode === 'city') {
      const g = PW.R.ground(cx, cy); if (!g) return;
      if (U.place) { U.placeAt(g.x, g.z); return; }
      const b = PW.City.at(S, Math.floor(g.x), Math.floor(g.z));
      if (b) { U.sel = b.t === 'weg' && U.sel === b.id ? null : b.id; U.sfx('klick'); }
      else if (g.x > 12.5 && g.x < 17.5 && g.z > 26.8 && g.z < 29) { const w = PW.City.first(S, 'mauer'); U.sel = w ? w.id : null; }
      else U.sel = null;
      U.side();
    } else if (U.mode === 'world') {
      const t = PW.R.pickTile(cx, cy); U.tile = t; if (t >= 0) U.sfx('klick'); U.plan = null; U.side();
    } else if (U.mode === 'battle' && U.P.battleTap) U.P.battleTap(cx, cy);
  };
  U.hover = function (cx, cy) {
    if (!U.place || U.mode !== 'city' || cx == null) return;
    const g = PW.R.ground(cx, cy); if (g) U.placeAt(g.x, g.z);
  };

  // ---------- Tastatur ----------
  U.key = function (code, e) {
    const k = U.opt.keys, S = U.S;
    if (code === 'Escape') {
      if (U.open.length) { const t = U.top(); if (!t.o.noClose) U.closeModal(t.id); return true; }
      if (U.place) { U.place = null; U.ctx(); return true; }
      if (U.sel || U.tile >= 0) { U.sel = null; U.tile = -1; U.side(); return true; }
      if (S && U.mode === 'world') { U.setMode('city'); return true; }
      if (S && U.mode !== 'battle') { U.menu(); return true; }
      return false;
    }
    if (!S || $('#hud').hidden) return false;
    if (U.open.length) return false;
    if (code === k.pause || code === 'KeyP') { S.paused = !S.paused; U.hud(true); return true; }
    if (code === k.world) { U.A.nav({ id: 'karte' }); return true; }
    if (code === k.build) { U.A.nav({ id: 'bauen' }); return true; }
    if (code === 'KeyR' && U.place) { U.A.prot(); return true; }
    if (code === 'Enter' && U.place) { U.A.pok(); return true; }
    if (code === 'Digit1' || code === 'Digit2' || code === 'Digit3') { S.paused = false; S.speed = +code.slice(-1); U.hud(true); return true; }
    if (code === 'Delete' && U.sel) { U.P.demolishAsk && U.P.demolishAsk(U.sel); return true; }
    if (code === 'KeyU' && U.sel) { U.A.bupg({ uid: U.sel }); return true; }
    if (code === 'KeyH') { U.help(); return true; }
    if (code === 'KeyF' && S.waves.active) { const h = PW.Heroes.list(S).find(x => PW.Heroes.available(S, x) && !(S.waves.active.hcd[x] > 0)); if (h) U.A.wskill({ h }); return true; }
    return false;
  };

  // ---------- Welle vorbei ----------
  U.waveDone = function (w) {
    if (!w) return;
    U.sfx(w.won ? 'sieg' : 'niederlage');
    const lost = Object.keys(w.lost || {}).filter(k => w.lost[k] > 0).map(k => w.lost[k] + ' ' + PW.UNITS[k].name).join(', ');
    U.modal('welle', w.won ? '🏆 Welle ' + w.n + ' abgewehrt' : '🔥 Die Zuflucht wurde überrannt', () => (w.won ? '<p>Beute: ' + U.cost(w.rew, 1, {}) + '</p>' + (w.boss ? '<p>💀 <b>' + esc(PW.BOSSES[w.boss].name) + '</b> wurde besiegt!</p>' : '') : '<p>Verloren: ' + U.cost(w.loss || {}, 1, {}) + '</p><p class="muted">Gebäude sind beschädigt. Repariere Tor und Gebäude, baue mehr Türme und bilde Truppen aus. Deine Zuflucht besteht weiter.</p>') +
      (lost ? '<p class="small">Gefallen: ' + esc(lost) + ' (ein Teil kehrt verwundet zurück)</p>' : '') + '<p class="muted small">Nächste Welle in ' + T(U.S.waves.next - U.S.time) + '.</p>', { size: 'narrow' });
    if (PW.Save) PW.Save.writeBest(U.S);
  };

  // ---------- Titelbildschirm ----------
  U.title = function () {
    U.S = null; $('#hud').hidden = true; $('#scrTitle').hidden = false;
    while (U.open.length) U.closeModal(null, true);
    $('#tTitle').textContent = PW.TITLE; $('#tSub').textContent = PW.SUBTITLE; doc.title = PW.TITLE + ' – ' + PW.SUBTITLE;
    const idx = PW.Save.index(), last = Object.keys(idx).sort((a, b) => (idx[b].saved || 0) - (idx[a].saved || 0))[0];
    $('#titleNav').innerHTML = (last ? U.btn('cont', '▶ Fortsetzen <span class="small muted">· ' + esc(slotName(last)) + ', Tag ' + idx[last].day + '</span>', { cls: 'primary big', d: { slot: last } }) : '') +
      U.btn('newcamp', '📖 Kampagne: Die letzte Zuflucht', { cls: last ? 'big' : 'primary big' }) + U.btn('newfree', '🗺️ Freies Spiel', { cls: 'big' }) + U.btn('slots', '💾 Spielstände') +
      '<div class="row">' + U.btn('settings', '⚙️ Einstellungen', { cls: 'grow' }) + U.btn('help', '❓ Hilfe', { cls: 'grow' }) + '</div>';
    $('#titleFoot').innerHTML = U.btn('credits', 'Mitwirkende', { cls: 'small ghost' }) + U.btn('exit', '← Zur Spieleübersicht', { cls: 'small ghost' });
    PW.R.setMode('city');
    if (PW.Audio) PW.Audio.mood('ruhe');
  };
  const slotName = s => (s === 'auto' ? 'Automatisch' : 'Platz ' + s.slice(-1));
  U.slotName = slotName;
  U.A.cont = d => U.loadSlot(d.slot);
  U.A.newcamp = () => {
    const go = () => { U.slot = 'auto'; U.start(PW.Game.newGame(Object.assign(PW.Game.defaultCfg(), { mode: 'campaign', diff: U.opt.campDiff || 'normal' }))); U.save(true); };
    if (PW.Save.index().auto) U.confirm('Neue Kampagne', 'Der automatische Spielstand wird überschrieben. Sichere ihn vorher unter „Spielstände“ auf einem eigenen Platz, wenn du ihn behalten willst.', 'Neu beginnen', go);
    else go();
  };
  U.A.newfree = () => U.P.setup();
  U.A.slots = () => U.slots();
  U.A.settings = () => U.settings();
  U.A.help = () => U.help();
  U.A.credits = () => U.credits();
  U.A.exit = () => { if (root.parent && root.parent !== root && root.EasyGamesKit) root.EasyGamesKit.close(); else root.location.href = '../'; };
  U.A.close = d => U.closeModal(d.id);

  U.confirm = function (title, text, okLabel, fn, danger) {
    U.modal('confirm', title, () => ({ body: '<p>' + esc(text) + '</p>', foot: U.btn('close', 'Abbrechen', { d: { id: 'confirm' } }) + U.btn('cfok', okLabel, { cls: danger ? 'danger' : 'primary' }) }), { size: 'narrow' });
    U._cf = fn;
  };
  U.A.cfok = () => { const f = U._cf; U._cf = null; U.closeModal('confirm'); if (f) f(); };

  // ---------- Menü ----------
  U.menu = function () {
    U.modal('menu', '☰ Menü', () => '<div class="col">' + U.btn('msave', '💾 Speichern') + U.btn('slots', '📂 Spielstände, Export & Import') + U.btn('log', '📜 Chronik') + U.btn('reports', '⚔️ Kampfberichte') + U.btn('settings', '⚙️ Einstellungen') + U.btn('help', '❓ Hilfe & Steuerung') + U.btn('credits', 'ℹ️ Mitwirkende') + '<hr class="sep">' + U.btn('totitle', '🏠 Hauptmenü (speichert automatisch)') + '</div>' +
      '<p class="muted small" style="margin-top:10px">Speicherplatz: ' + esc(slotName(U.slot)) + ' · Spielzeit ' + T(U.S.time) + '</p>', { size: 'narrow', pause: true, live: false });
  };
  U.A.msave = () => { U.save(); };
  U.A.log = () => U.P.log();
  U.A.reports = () => U.P.reports();
  U.A.totitle = () => { if (U.battle && U.P.endBattle) U.P.endBattle(true); U.save(true); U.title(); };

  // ---------- Speichern / Laden ----------
  U.save = function (silent, slot) {
    const S = U.S; if (!S) return false;
    if (U.battle) return false;   // während einer beobachteten Schlacht nicht (Zwischenstand)
    slot = slot || U.slot;
    S.playedMs = (S.playedMs || 0);
    const n = PW.Save.save(S, slot);
    if (slot !== 'auto' && slot === U.slot) PW.Save.save(S, 'auto');
    if (!silent) U.toast(n ? '💾 Gespeichert (' + slotName(slot) + ', ' + Math.round(n / 1024) + ' KB)' : '⚠️ Speichern fehlgeschlagen (Speicher voll oder gesperrt)', n ? 'gut' : 'warn');
    return !!n;
  };
  U.loadSlot = function (slot) {
    let S = null;
    try { S = PW.Save.load(slot); } catch (e) { U.toast('⚠️ Spielstand beschädigt: ' + e.message, 'warn'); return; }
    if (!S) { U.toast('Kein Spielstand in ' + slotName(slot), 'warn'); return; }
    U.slot = slot; U.startLoaded(S);
  };
  U.startLoaded = function (S) {
    PW.Game.refresh(S);
    const away = S.savedAt ? (Date.now() - S.savedAt) / 1000 : 0;
    U.start(S);
    const r = away > 30 ? PW.Game.offline(S, away) : null;
    if (r) U.modal('offline', '🌙 Willkommen zurück', () => '<p>Du warst ' + T(away) + ' fort. Verrechnet wurden ' + T(r.seconds) + ' (nur Produktion und laufende Aufträge – keine Angriffe).</p><p>' + (Object.keys(r.gain).length ? Object.keys(r.gain).map(k => '<span class="chip">' + PW.RES_INFO[k].icon + ' ' + (r.gain[k] > 0 ? '+' : '') + fmt(r.gain[k]) + '</span>').join(' ') : 'Keine Änderung.') + '</p>', { size: 'narrow' });
  };
  U.slots = function () {
    U.modal('slots', '📂 Spielstände', () => {
      const idx = PW.Save.index();
      return { body: PW.Save.SLOTS.map(s => {
        const m = idx[s];
        return '<div class="card"><h3>' + esc(slotName(s)) + (s === U.slot && U.S ? ' <span class="chip">aktiv</span>' : '') + '</h3>' + (m ? '<div class="small muted">' + (m.mode === 'campaign' ? '📖 Kampagne · Kapitel ' + (m.ch || '?') : '🗺️ Freies Spiel') + ' · Tag ' + m.day + ' · 👪 ' + m.pop + ' · 🏛️ Stufe ' + m.hq + ' · ' + m.tiles + ' Regionen<br>' + esc(m.name || '') + ' · ' + new Date(m.saved).toLocaleString('de-DE') + '</div>' : '<div class="small muted">leer</div>') +
          '<div class="row">' + (m ? U.btn('sload', 'Laden', { cls: 'small primary', d: { s } }) : '') + (U.S && s !== 'auto' ? U.btn('ssave', m ? 'Überschreiben' : 'Hier speichern', { cls: 'small', d: { s } }) : '') + (m ? U.btn('sdel', 'Löschen', { cls: 'small danger', d: { s } }) : '') + '</div></div>';
      }).join('') + '<hr class="sep"><p class="small muted">Export erzeugt eine Datei mit dem aktuellen Spiel, Import lädt eine solche Datei. Mit einer Google-Anmeldung (Startbildschirm) werden die Spielstände zusätzlich in deinem Konto gesichert.</p>',
      foot: (U.S ? U.btn('sexport', '⬇️ Export') : '') + '<label class="btn">⬆️ Import<input type="file" accept=".json,.pestwacht,application/json" data-ch="simport" hidden></label>' };
    }, { pause: true });
  };
  U.A.sload = d => { U.closeModal(); U.loadSlot(d.s); };
  U.A.ssave = d => { U.slot = d.s; U.save(false, d.s); U.redrawId('slots'); };
  U.A.sdel = d => U.confirm('Spielstand löschen', slotName(d.s) + ' wirklich löschen? Das kann nicht rückgängig gemacht werden.', 'Löschen', () => { PW.Save.remove(d.s); U.redrawId('slots'); if (!U.S) U.title(); }, true);
  U.A.sexport = () => {
    const txt = PW.Save.exportText(U.S), blob = new Blob([txt], { type: 'application/json' }), a = doc.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'pestwacht-tag' + PW.dayNo(U.S) + '.json'; doc.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    U.toast('⬇️ Spielstand exportiert', 'gut');
  };
  U.CH.simport = (v, el) => {
    const f = el.files && el.files[0]; if (!f) return;
    if (f.size > 5e6) { U.toast('Datei zu groß', 'warn'); return; }
    const r = new FileReader();
    r.onload = () => { try { const S = PW.Save.importText(String(r.result)); U.closeModal(); U.slot = 'auto'; U.startLoaded(S); U.save(true); U.toast('⬆️ Spielstand importiert', 'gut'); } catch (e) { U.toast('⚠️ Import fehlgeschlagen: ' + e.message, 'warn'); } };
    r.readAsText(f);
  };
  U.redrawId = id => { const e = U.find(id); if (e) U.draw(e); };

  // ---------- Einstellungen ----------
  U.applyOpt = function () {
    const o = U.opt;
    doc.documentElement.style.setProperty('--ui', o.uiScale);
    doc.body.classList.toggle('contrast', !!o.contrast); doc.body.classList.toggle('reducefx', !!o.reduceFx);
    if (PW.Audio) PW.Audio.setVolume(o.music, o.sfx);
    if (PW.R.ok) PW.R.setQuality(o.quality);
    PW.R.low = o.quality === 'niedrig' || o.reduceFx;
  };
  U.settings = function () {
    const tabs = [['allg', 'Allgemein'], ['spiel', 'Spiel'], ['tasten', 'Tasten']];
    U.modal('settings', '⚙️ Einstellungen', ent => {
      const o = U.opt, tab = ent.tab || 'allg', S = U.S;
      const rng = (key, label, min, max, step) => '<label class="f">' + label + ' <span>' + Math.round(o[key] * 100) + ' %</span><input type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + o[key] + '" data-ch="opt" data-k="' + key + '" data-key="' + key + '"></label>';
      const chk = (key, label, on, ch) => '<label class="check"><input type="checkbox" ' + (on ? 'checked' : '') + ' data-ch="' + (ch || 'opt') + '" data-k="' + key + '"> ' + label + '</label>';
      let b = '<div class="tabs">' + tabs.map(([id, l]) => U.btn('stab', l, { cls: tab === id ? 'on' : '', d: { t: id } })).join('') + '</div><div class="col" style="margin-top:8px">';
      if (tab === 'allg') {
        b += rng('music', '🎵 Musik', 0, 1, 0.05) + rng('sfx', '🔊 Klänge', 0, 1, 0.05) + rng('uiScale', '🔠 Schriftgröße', 0.8, 1.4, 0.05) + rng('camSens', '🎥 Kamera-Empfindlichkeit', 0.4, 2, 0.1) +
          '<label class="f">🖥️ Grafikqualität<select data-ch="opt" data-k="quality">' + [['auto', 'Automatisch (passt sich an)'], ['niedrig', 'Niedrig (schwache Geräte)'], ['mittel', 'Mittel'], ['hoch', 'Hoch (mit Schatten)']].map(([v, l]) => '<option value="' + v + '"' + (o.quality === v ? ' selected' : '') + '>' + l + '</option>').join('') + '</select></label>' +
          chk('contrast', 'Hoher Kontrast', o.contrast) + chk('reduceFx', 'Weniger Effekte und Bewegung', o.reduceFx) + chk('invertZoom', 'Mausrad-Zoom umkehren', o.invertZoom) + chk('subtitles', 'Hinweise einblenden', o.subtitles);
        if (o.quality === 'hoch') b += '<p class="small muted">Schatten werden beim nächsten Start aktiv.</p>';
      } else if (tab === 'spiel') {
        if (!S) b += '<p class="muted">Diese Einstellungen gelten für das laufende Spiel. Starte oder lade zuerst ein Spiel.</p>';
        else {
          b += chk('autoSkills', 'Heldenfähigkeiten bei Angriffen automatisch einsetzen', S.cfg.autoSkills !== false, 'cfg') + chk('watchBattles', 'Eigene Schlachten auf der Weltkarte ansehen (sonst sofort auswerten)', S.cfg.watchBattles !== false, 'cfg') + chk('autoBattle', 'In angesehenen Schlachten automatisch kämpfen', S.cfg.autoBattle !== false, 'cfg') + chk('slowWaves', 'Gemächlichere Wellen (Feinde 20 % langsamer)', !!S.cfg.slowWaves, 'cfg') +
            '<label class="f">🌙 Abwesenheit höchstens verrechnen<select data-ch="cfg" data-k="offlineCap">' + [[0, 'Gar nicht'], [1800, '30 Minuten'], [3600, '1 Stunde'], [14400, '4 Stunden'], [43200, '12 Stunden']].map(([v, l]) => '<option value="' + v + '"' + (+S.cfg.offlineCap === v ? ' selected' : '') + '>' + l + '</option>').join('') + '</select></label>' +
            '<label class="f">🏷️ Name deiner Zuflucht<input type="text" maxlength="28" value="' + esc(S.cfg.playerName) + '" data-ch="cfg" data-k="playerName" data-key="pname"></label>' +
            '<p class="small muted">Schwierigkeit: ' + esc(PW.DIFFICULTY[S.cfg.diff].name) + ' · Startwert der Welt: ' + esc(S.seed) + '</p>';
        }
      } else {
        b += '<p class="small muted">Taste antippen, dann die neue Taste drücken. Fest belegt: Esc (Zurück/Menü), Enter (Bestätigen), R (Drehen beim Bauen), U (Verbessern), Entf (Abreißen), F (Heldenfähigkeit), H (Hilfe), 1–3 (Tempo), +/− (Zoom), Pfeiltasten (Kamera).</p>';
        const names = { up: 'Kamera vor', down: 'Kamera zurück', left: 'Kamera links', right: 'Kamera rechts', rotL: 'Drehen links', rotR: 'Drehen rechts', pause: 'Pause', world: 'Weltkarte', build: 'Bauen' };
        b += '<table class="t">' + Object.keys(names).map(k => '<tr><td>' + names[k] + '</td><td class="num">' + U.btn('rebind', U._rebind === k ? '… Taste drücken' : esc(PW.Input.codeName(o.keys[k])), { cls: 'small' + (U._rebind === k ? ' primary' : ''), d: { k } }) + '</td></tr>').join('') + '</table>' + U.btn('keyreset', 'Standardbelegung', { cls: 'small' });
        b += '<p class="small muted">Controller: linker Stick = Kamera, LB/RB = drehen, LT/RT = Zoom, Steuerkreuz = Menüs, A = Bestätigen, B = Zurück, X = Pause, Select = Weltkarte.</p>';
      }
      return { body: b + '</div>', foot: U.btn('optreset', 'Zurücksetzen', { cls: 'small ghost' }) + U.btn('close', 'Fertig', { cls: 'primary', d: { id: 'settings' } }) };
    }, { pause: true, live: false, onClose: () => { U._rebind = null; } });
  };
  U.A.stab = (d) => { const e = U.find('settings'); e.tab = d.t; U.draw(e); };
  U.CH.opt = (v, el) => {
    const k = el.dataset.k, o = U.opt;
    o[k] = el.type === 'checkbox' ? el.checked : el.type === 'range' ? +v : v;
    PW.Save.saveOpt(o); U.applyOpt();
    if (el.type !== 'range') U.redrawId('settings'); else { const s = el.parentNode.querySelector('span'); if (s) s.textContent = Math.round(o[k] * 100) + ' %'; }
    if (k === 'sfx') U.sfx('klick');
  };
  U.CH.cfg = (v, el) => {
    const S = U.S; if (!S) return; const k = el.dataset.k;
    if (el.type === 'checkbox') S.cfg[k] = el.checked; else if (k === 'offlineCap') S.cfg[k] = +v; else S.cfg[k] = String(v).slice(0, 28) || 'Deine Zuflucht';
    if (k === 'playerName') PW.R.worldInvalidate();
  };
  U.A.rebind = d => { U._rebind = d.k; U.redrawId('settings'); };
  U.A.keyreset = () => { U.opt.keys = JSON.parse(JSON.stringify(PW.Save.DEF_OPT.keys)); PW.Input.keys = U.opt.keys; PW.Save.saveOpt(U.opt); U.redrawId('settings'); };
  U.A.optreset = () => { U.opt = JSON.parse(JSON.stringify(PW.Save.DEF_OPT)); PW.Input.keys = U.opt.keys; PW.Save.saveOpt(U.opt); U.applyOpt(); U.redrawId('settings'); };
  function rebindKey(e) {
    if (!U._rebind) return false;
    e.preventDefault(); e.stopPropagation();
    if (e.code !== 'Escape') { U.opt.keys[U._rebind] = e.code; PW.Save.saveOpt(U.opt); }
    U._rebind = null; U.redrawId('settings'); return true;
  }

  // ---------- Hilfe und Mitwirkende ----------
  const HELP = [
    ['Ziel', 'Im Jahr der Graupest bist du Vorsteherin oder Vorsteher der letzten Zuflucht. Halte die Bewohner gesund, satt und zufrieden, wehre Angriffe ab, erkunde das Land und behaupte dich zwischen acht Computerfraktionen, die selbst wirtschaften, Krieg führen und Bündnisse schließen. In der Kampagne führen dich 5 Kapitel durch das Spiel, im freien Spiel wählst du Karte, Gegner und Siegziel.'],
    ['Bauen', 'Tippe auf „Bauen“, wähle ein Gebäude und dann einen freien Platz innerhalb der Mauer (grün = möglich). Bestätige mit ✔. Gebäude, die einen Weg berühren, arbeiten 10 % besser; die Torstraße bleibt frei. Das Ratshaus begrenzt die Stufe aller Gebäude. Tippe ein Gebäude an, um es zu verbessern, zu versetzen, zu reparieren, zu pausieren oder abzureißen (50 % Rückerstattung). Es arbeiten 2 Bautrupps gleichzeitig (Forschung „Baumeisterei“: 3).'],
    ['Bewohner & Arbeit', 'Gesunde Bewohner arbeiten automatisch in den Gebäuden (Medizin und Wasser zuerst). Fehlen Arbeitskräfte, produzieren Gebäude weniger. Wohnhäuser bringen Platz für neue Überlebende; sie kommen nur, wenn die Zufriedenheit hoch genug ist. Nahrung und Wasser werden jede Minute verbraucht.'],
    ['Lazarett & Kräuterbeete', 'Im Lazarett (🩺 in der Leiste) warten einzelne Kranke mit Namen. Untersuche sie, um Krankheit und Mittel zu erfahren, bezahle die Behandlung und entlasse sie geheilt – das bringt Münzen, Wissen und Zufriedenheit. Wartende verlieren Lebenskraft: leichte Fälle gehen krank nach Hause, schwere (🔥🔥🔥) sterben. Gäste mit 🎩 zahlen besonders gut. Ab höheren Heilstufen stellst du Empfang, Pflegerinnen und Träger ein, die das von selbst erledigen. Mit einem Kräutergarten säst und erntest du eigene Beete.'],
    ['Seuche & Heilung', 'Bewohner können sich anstecken (schlechte Hygiene, Enge, Hunger und verseuchte Umgebung erhöhen das Risiko). Infizierte stecken andere an. Quarantänestationen isolieren sie, Heilstuben und das Pestlazarett behandeln sie in Betten – dafür braucht es Personal und Arznei (aus Heilkräutern im Alchemielabor). Genesene sind eine Weile immun. Ohne Behandlung sterben manche; Trauer senkt die Zufriedenheit, die Gedenkstätte mildert sie.'],
    ['Angriffe (Wellen)', 'In festen Abständen greifen Seuchenschwärme die Zuflucht an – jede 5. Welle mit einem Boss. Kundschafter warnen vorher, die roten Pfade zeigen die Laufwege. Türme feuern auf Feinde in Reichweite (Wachturm: vorderster Feind, Balliste: stärkster, Feuerbecken: dichteste Gruppe, Räucherturm: verlangsamt alle). Am Tor kämpfen deine Truppen und Helden; Heldenfähigkeiten wirken per Knopf oder automatisch. Fällt das Tor, dringen Feinde zum Ratshaus vor. Eine verlorene Welle kostet Vorräte und beschädigt Gebäude, beendet aber nicht das Spiel.'],
    ['Weltkarte & Expeditionen', 'Auf der Karte siehst du erkundete Felder, Orte und die Gebiete aller Fraktionen. Tippe ein Feld an und wähle eine Expedition: Erkunden, Sammeln, Kranke retten, Region heilen, Besetzen, Angreifen, Verteidigen oder Handeln. Du stellst Truppen, bis zu 2 Helden und eine Formation zusammen und siehst Weg, Dauer und Stärkevergleich. Kämpfe kannst du ansehen und selbst Ziele und Heldenfähigkeiten wählen oder sofort auswerten lassen. Rückkehrer bringen Beute, Patienten und Verwundete mit.'],
    ['Diplomatie', 'Jede Fraktion hat eine Persönlichkeit (z. B. Eroberer, Händler, Diplomat) und erinnert sich an deine Taten. Unter „Diplomatie“ siehst du Beziehung, Vertrauen und Stärke und kannst Handel, Nichtangriffspakt, Verteidigungspakt, Bündnis, Frieden, Geschenke, Hilfe oder gemeinsame Angriffe vorschlagen. Vor dem Absenden zeigt die Einschätzung, welche Gründe dafür und dagegen sprechen. Für Pakte und Bündnisse brauchst du eine Diplomatiehalle. Fraktionen führen auch untereinander Kriege, schließen Frieden und können zu Vasallen werden.'],
    ['Forschung & Helden', 'Die Akademie erzeugt Wissen; drei Forschungsbäume (Heilkunst, Wirtschaft, Krieg) verbessern deine Zuflucht. Höhere Stufen brauchen eine bessere Akademie. Helden sammeln Erfahrung, steigen auf, lernen Talente, tragen Ausrüstung aus der Schmiede und werden in der Heldengilde aufgewertet. Weitere Helden findest du in Ruinen, in der Kampagne oder in der Gilde.'],
    ['Steuerung', 'Touch: wischen = Kamera schieben, zwei Finger = zoomen und drehen, tippen = auswählen. Maus: ziehen = schieben, rechte Taste = drehen, Rad = zoomen. Tastatur: WASD/Pfeile, Q/E drehen, +/− Zoom, Leertaste Pause, 1–3 Tempo, B Bauen, M Karte, Esc zurück (frei belegbar). Controller: Stick = Kamera, LB/RB drehen, LT/RT Zoom, Steuerkreuz für Menüs.'],
    ['Speichern', 'Das Spiel speichert alle 60 Sekunden und beim Verlassen automatisch. Unter „Spielstände“ gibt es drei eigene Plätze sowie Export und Import als Datei. Kommst du später zurück, wird die Abwesenheit begrenzt verrechnet (nur Produktion, keine Angriffe). Das Spiel läuft auch ohne Internet.'],
    ['Tipps', '• Baue früh einen Kräutergarten, ein Alchemielabor und eine Heilstube. • Halte immer Nahrung und Wasser im Plus – Hunger macht krank. • Türme nahe dem Tor treffen alle Laufwege. • Erkunde zuerst die Umgebung: Ruinen und Siedlungen lohnen sich. • Verärgere nicht alle Nachbarn gleichzeitig; ein Nichtangriffspakt kauft Zeit. • Ein Rammbock hilft gegen Hauptstädte mit Mauern.']
  ];
  U.help = function (topic) {
    U.modal('help', '❓ Hilfe', ent => {
      const t = ent.tab != null ? ent.tab : (topic || 0);
      return '<div class="tabs">' + HELP.map((h, i) => U.btn('htab', h[0], { cls: t == i ? 'on' : '', d: { i } })).join('') + '</div><div style="margin-top:10px;line-height:1.55">' + esc(HELP[t][1]).replace(/ • /g, '<br>• ') + '</div>';
    }, { pause: true, live: false });
  };
  U.A.htab = d => { const e = U.find('help'); e.tab = +d.i; U.draw(e); };
  U.credits = function () {
    U.modal('credits', 'ℹ️ Mitwirkende', () => '<div class="logo" style="margin-bottom:10px"><b style="font-size:34px">' + esc(PW.TITLE) + '</b><small>' + esc(PW.SUBTITLE) + '</small></div>' + PW.CREDITS.map(c => '<p>' + esc(c) + '</p>').join('') + '<p class="small muted">Version 1 · Spielstand-Schema ' + PW.SCHEMA + '</p>', { size: 'narrow', live: false });
  };

  // ---------- Ereignisse verdrahten ----------
  U.init = function () {
    U.opt = PW.Save.loadOpt();
    doc.addEventListener('click', e => {
      const t = e.target.closest('[data-act]'); if (!t || t.disabled) return;
      const f = U.A[t.dataset.act]; if (!f) return;
      if (PW.Audio) PW.Audio.unlock();
      try { f(t.dataset, t, e); } catch (x) { console.error(x); U.toast('⚠️ ' + x.message, 'warn'); }
      if (U.S) { U.hud(true); U.ctx(); U.side._t = 0; U.side(); }
    });
    const ch = e => { const t = e.target.closest('[data-ch]'); if (!t) return; const f = U.CH[t.dataset.ch]; if (f) try { f(t.value, t, e); } catch (x) { console.error(x); } };
    doc.addEventListener('change', ch); doc.addEventListener('input', e => { if (e.target.type === 'range') ch(e); });
    root.addEventListener('keydown', e => { if (rebindKey(e)) return; }, true);
    doc.addEventListener('pointerdown', () => { if (PW.Audio) PW.Audio.unlock(); }, { once: true });
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = PW;
})(typeof window !== 'undefined' ? window : globalThis);
