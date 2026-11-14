/* AnMaCha – Der Podcast · Tagesablauf und Folgen-Wirtschaft.
   Morgen: Ideen sammeln (Zuhause, Gisela) · Tag: Stadt (Themen-Funken, Fans, Besorgungen) · Abend: Aufnahme (Prime-Time) · Nacht: Auswertung.
   Themen, Ideen, Fitness, Studio, Gisela und Musik bestimmen Hörer, neue Abos und Einnahmen (Fan-Punkte) für den Ausbau. */
(function (root) {
  'use strict';
  const AMC = root.AMC, U = AMC.U, D = AMC.Data, Save = AMC.Save;
  const CR = AMC.Career = {};
  const RANKS = [[0, 'Garagen-Podcast', '🏚️'], [500, 'Geheimtipp', '🔎'], [2000, 'Lokal-Hit', '📍'], [8000, 'Stadtgespräch', '🏙️'], [20000, 'Charts-Podcast', '📈'], [50000, 'Podcast-Star', '🌟'], [120000, 'Award-Kandidat', '🏆']];
  const DAY0 = 8 * 60, EVE = 18 * 60, LATE = 23 * 60, SPEED = 1.5; // Spielminuten pro Sekunde
  CR.RANKS = RANKS;
  function st() {
    const c = Save.data.career = Save.data.career || {};
    if (!c.day) Object.assign(c, { day: 1, min: DAY0, abos: 120, eps: 0, best: 0, total: 0, log: [] });
    c.today = c.today || fresh();
    return c;
  }
  const fresh = () => ({ got: {}, talks: 0, errands: 0, ideas0: ideasNow(), dance: 0 });
  function ideasNow() { return AMC.Home ? ['andrew', 'marco'].reduce((a, id) => a + (AMC.Home.needs(id).ideas || []).length, 0) : 0; }
  CR.state = st;
  CR.rank = abos => { let r = RANKS[0]; for (const x of RANKS) if ((abos == null ? st().abos : abos) >= x[0]) r = x; return { min: r[0], name: r[1], icon: r[2], next: (RANKS[RANKS.indexOf(r) + 1] || [])[0] }; };
  CR.phase = () => { const m = st().min; return m < 10 * 60 ? ['morgen', '🌅 Morgen'] : m < EVE ? ['tag', '☀️ Tag'] : m < LATE ? ['abend', '🌆 Abend · Prime-Time'] : ['nacht', '🌙 Nacht']; };
  const clock = m => String(Math.floor(m / 60) % 24).padStart(2, '0') + ':' + String(Math.floor(m % 60)).padStart(2, '0');
  // Tagesplan: vier Ziele, jedes erfüllte bringt +5 % Hörer bei der Aufnahme
  CR.plan = () => {
    const c = st(), t = c.today, fun = D.RUBRIC_IDS.reduce((a, r) => a + (t.got[r] || 0), 0);
    return [
      { id: 'idee', icon: '💡', name: 'Eine Idee sammeln (Zuhause, Gisela)', ok: ideasNow() > 0 },
      { id: 'funken', icon: '✨', name: 'Themen-Funken: ' + Math.min(fun, 10) + '/10', ok: fun >= 10 },
      { id: 'fans', icon: '💬', name: 'Mit Fans reden oder tanzen: ' + Math.min(t.talks + t.dance, 2) + '/2', ok: t.talks + t.dance >= 2 },
      { id: 'tour', icon: '🚐', name: 'Besorgung, Bus oder Senderhaus', ok: t.errands > 0 || !!t.tour }
    ];
  };

  // ------------------------------------------------------------------ Stadt: Uhr und Tagesplan im HUD
  let V = null;
  CR.start = function (S) {
    CR.stop(); if (!S || S.mode !== 'free' || S.net) return;
    st(); V = { S, last: { got: Object.assign({}, S.got), talks: S.talks, errands: S.errands || 0 }, drawT: 0, warned: {} };
    const tl = document.querySelector('#hud .h-tl'); if (!tl) return;
    V.el = U.el('div', 'cr-day glass'); V.el.id = 'crDay'; tl.appendChild(V.el); draw();
    const ph = CR.phase()[0];
    if (ph === 'morgen') setTimeout(() => V && AMC.Play.msg('🌅 Tag ' + st().day + ': Erst Ideen sammeln, dann rein in die Stadt!', 3.2, true), 2800);
  };
  CR.stop = function () { if (V && V.el) V.el.remove(); V = null; Save.save(); };
  CR.mark = k => { const t = st().today; if (k === 'dance') t.dance++; else t[k] = 1; if (AMC.Events) AMC.Events.mark(k === 'dance' ? 'dance' : 'tour'); };
  CR.update = function (dt, S) {
    if (!V || V.S !== S) return;
    const c = st(), t = c.today, L = V.last;
    // Fortschritt des Tages mitzählen
    D.RUBRIC_IDS.forEach(r => { const d = (S.got[r] || 0) - (L.got[r] || 0); if (d > 0) t.got[r] = (t.got[r] || 0) + d; L.got[r] = S.got[r] || 0; });
    if (S.talks > L.talks) { t.talks += S.talks - L.talks; if (AMC.Events) AMC.Events.mark('talk', S.talks - L.talks); L.talks = S.talks; }
    if ((S.errands || 0) > L.errands) { t.errands += S.errands - L.errands; L.errands = S.errands; }
    // Uhr
    const before = c.min; c.min = Math.min(LATE + 30, c.min + dt * SPEED);
    if (before < EVE && c.min >= EVE) { AMC.Play.msg('🌆 18 Uhr: Prime-Time! Ab ins Funkhaus zur Aufnahme (+20 % Hörer).', 4, true); AMC.Audio.sfx('jingle'); }
    if (before < 22 * 60 && c.min >= 22 * 60) AMC.Play.msg('🌙 22 Uhr! Nimm noch heute eine Folge auf, sonst verlierst du Abos.', 4, true);
    if (c.min >= LATE + 30 && !V.warned.late) { V.warned.late = true; CR.skipDay(); }
    V.drawT -= dt; if (V.drawT <= 0) { V.drawT = 0.5; draw(); }
  };
  function draw() {
    if (!V || !V.el) return; const c = st(), ph = CR.phase(), rk = CR.rank();
    V.el.innerHTML = '<div class="cr-top"><b>📅 Tag ' + c.day + '</b>' + (AMC.Events ? '<span title="' + U.esc(AMC.Events.week().name) + '">' + AMC.Events.week().icon + '</span>' : '') + (AMC.Atmos ? '<span title="' + AMC.Atmos.weather().name + '">' + AMC.Atmos.weather().icon + '</span>' : '') + '<span>🕗 ' + clock(c.min) + '</span><span>' + ph[1] + '</span></div>' +
      '<div class="cr-mid"><span title="Abonnenten">👥 ' + U.fmt(Math.round(c.abos)) + ' Abos</span><span>' + rk.icon + ' ' + rk.name + '</span></div>' +
      '<div class="cr-plan">' + CR.plan().map(p => '<i class="' + (p.ok ? 'ok' : '') + '" title="' + U.esc(p.name) + '">' + p.icon + (p.ok ? '✓' : '') + '</i>').join('') + '<em>🎙️ ' + (ph[0] === 'abend' ? 'Jetzt aufnehmen!' : 'Aufnahme am Abend') + '</em></div>';
  }
  // Tag ohne Aufnahme vergeht: Abos sinken etwas, neuer Morgen
  CR.skipDay = function () {
    const c = st(); c.skips = (c.skips || 0) + 1;
    const lost = Math.round(c.abos * 0.03 * Math.min(3, c.skips));   // jeder weitere Tag ohne Folge kostet mehr
    c.abos = Math.max(50, c.abos - lost); c.day++; c.min = DAY0; c.today = fresh(); Save.save();
    AMC.UI.toast('🌙 Der Tag ging ohne Folge zu Ende. −' + lost + ' Abos. Neuer Tag ' + c.day + '!', 4200);
  };
  // Live-Show: heutige Themen-Funken werden zu Karten
  CR.cards = function () {
    const t = st().today, cards = [];
    D.RUBRIC_IDS.forEach(r => { const n = t.got[r] || 0, k = Math.min(3, Math.ceil(n / 3)); for (let i = 0; i < k; i++) cards.push({ rub: r, power: 1 + Math.min(1.4, n * 0.12), label: D.RUBRICS[r].name + ' (heute gesammelt)' }); });
    return cards;
  };

  // ------------------------------------------------------------------ Aufnahme auswerten (Nacht), neuer Tag
  CR.episode = function (r) {
    const c = st(), ph = CR.phase()[0], plan = CR.plan(), done = plan.filter(p => p.ok).length, ev = AMC.Events ? AMC.Events.episode() : { parts: [], lines: [], lost: 0 };
    // Ideen beider Hosts fließen in die Folge
    let ideas = 0; if (AMC.Home) ['andrew', 'marco'].forEach(id => { const n = AMC.Home.needs(id); ideas += (n.ideas || []).length; n.ideas = []; });
    const mood = AMC.Home ? (AMC.Home.mood('andrew') + AMC.Home.mood('marco')) / 2 : 0.7;
    const studio = AMC.StudioEdit ? AMC.StudioEdit.bonus().lis : 0, gis = AMC.Camper ? AMC.Camper.value() : 0, songs = Math.min(10, (Save.data.songs || []).length);
    const parts = [
      ['💡 Ideen', ideas * 0.08], ['📋 Tagesplan', done * 0.05], ['🌆 Prime-Time', ph === 'abend' ? 0.2 : 0], ['🛠️ Studio', studio], ['🚐 Gisela', gis * 0.02], ['🤝 Partner-Läden', AMC.Rooms ? AMC.Rooms.bonus() : 0], ['🎹 Musik', songs * 0.01], ['❤️ Fans', AMC.Social ? AMC.Social.bonus() : 0], ['🌧️ Regenwetter', AMC.Atmos ? AMC.Atmos.bonus() : 0], ['🚐 Roadtrip-Folge', (((c.today || {}).places) || {}).roadtrip ? 0.1 : 0], ['😊 Fitness', (mood - 0.6) * 0.5]
    ].concat(AMC.Guests && AMC.Guests.part() ? [AMC.Guests.part()] : [], AMC.Feed ? AMC.Feed.parts() : [], ev.parts).filter(p => Math.abs(p[1]) >= 0.005);
    const factor = Math.max(0.5, 1 + parts.reduce((a, p) => a + p[1], 0));
    const base = Math.max(0, r.listeners || 0), hoerer = Math.round(base * factor);
    const neu = Math.round(hoerer * 0.05 * (1 + done * 0.1)), fan = Math.round(hoerer / 60 + c.abos / 150);
    const rk0 = CR.rank(c.abos);
    const weg = Math.round(c.abos * ev.lost);
    c.abos = Math.max(50, c.abos + neu - weg); c.eps++; c.skips = 0; if (AMC.Events) AMC.Events.mark('eps'); c.total += hoerer; c.best = Math.max(c.best, hoerer);
    c.log = (c.log || []).concat({ day: c.day, h: hoerer, abos: Math.round(c.abos) }).slice(-14);
    if (AMC.Guests) AMC.Guests.after(); if (AMC.Feed) AMC.Feed.episode(hoerer, c.day);
    const day = c.day; c.day++; c.min = DAY0; c.today = fresh();
    Save.earn(fan); Save.save();
    const rk = CR.rank(c.abos), up = rk.name !== rk0.name;
    return {
      hoerer, neu, fan, up, rank: rk,
      lines: [['📅 Tag ' + day + ' · Auswertung', U.fmt(hoerer) + ' Hörer (×' + factor.toFixed(2) + ')'], ['Einfluss', parts.map(p => p[0] + ' ' + (p[1] >= 0 ? '+' : '') + Math.round(p[1] * 100) + ' %').join(' · ') || '–'],
        ['👥 Neue Abos', '+' + U.fmt(neu) + (weg ? ' −' + U.fmt(weg) + ' durch die Panne' : '') + ' (jetzt ' + U.fmt(Math.round(c.abos)) + ')'], ['💶 Einnahmen (Werbung & Fans)', '+' + U.fmt(fan) + ' 🎟️'], [rk.icon + ' Rang', rk.name + (up ? ' – Aufstieg! 🎉' : rk.next ? ' · nächster ab ' + U.fmt(rk.next) + ' Abos' : '')]].concat(ev.lines)
    };
  };
})(typeof window !== 'undefined' ? window : globalThis);
