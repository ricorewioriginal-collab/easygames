/* AnMaCha UNDERCOVER 3D – Hauptmenü, Solo-Einrichtung, Spielmodi-Übersicht, Online-Menü, öffentliche Räume und Lobby.
   Ruft die Spielsteuerung über AMU.App auf (startSolo, hostOnline, joinOnline, leaveOnline …). */
(function (root) {
  'use strict';
  const AMU = root.AMU = root.AMU || {};
  const esc = s => AMU.U.esc(s);
  const UI = () => AMU.UI;
  const DIFF = [[0, 'Leicht'], [1, 'Mittel'], [2, 'Schwer']];
  const sec = v => v + ' s';
  const min = v => Math.round(v / 60) + ' min';

  function modeName(m) { const lang = AMU.App && AMU.App.lang && AMU.App.lang(); return lang === 'en' && m.en ? m.en : m.n; }
  function mapName(m) { const lang = AMU.App && AMU.App.lang && AMU.App.lang(); return lang === 'en' && m.en ? m.en : m.n; }

  // ---------------- Regel-Formular (Solo und Online-Lobby) ----------------
  /** HTML für alle Regeln des aktuellen Modus. editable=false zeigt nur Werte (Gäste in der Lobby). */
  function rulesForm(s, editable, opt) {
    opt = opt || {};
    const m = AMU.modeById(s.mode), f = m.flags, ro = !editable;
    const row = (label, ctl) => '<div class="ui-field"><label>' + label + '</label>' + ctl + '</div>';
    const seg = (k, items) => ro ? '<b>' + esc((items.find(i => String(i[0]) === String(s[k])) || [0, s[k]])[1]) + '</b>' : UI().seg(k, items, s[k]);
    const step = (k, lo, hi, st, fmt) => ro ? '<b>' + esc((fmt || (x => x))(s[k])) + '</b>' : UI().stepper(k, s[k], lo, hi, st, fmt);
    let h = '';
    h += '<div class="ui-card"><h3 class="ui-h2">🎭 Modus</h3><div class="ui-grid">' + AMU.MODES.map(x =>
      '<button class="ui-btn ui-tile' + (x.id === s.mode ? ' on' : '') + '" data-a="set" data-v="mode:' + x.id + '"' + (ro ? ' disabled' : '') + '><b>' + x.icon + ' ' + esc(modeName(x)) + '</b><small>' + esc(x.tag) + ' · ' + x.min + '–' + x.max + '</small></button>').join('') + '</div>' +
      '<p class="ui-muted ui-small">' + esc(m.desc) + '<br><b>Sieg:</b> ' + esc(m.win) + '</p></div>';
    if (!f.word) {
      h += '<div class="ui-card"><h3 class="ui-h2">🗺 Karte</h3><div class="ui-grid">' + AMU.MAPS.map(x =>
        '<button class="ui-btn ui-tile' + (x.id === s.map ? ' on' : '') + '" data-a="set" data-v="map:' + x.id + '"' + (ro ? ' disabled' : '') + '><b>' + esc(mapName(x)) + '</b><small>' + esc(x.desc || '') + '</small></button>').join('') + '</div></div>';
    }
    h += '<div class="ui-card"><h3 class="ui-h2">⚙ Regeln</h3>';
    if (!ro && !opt.online) h += row('Voreinstellung', UI().seg('preset', Object.keys(AMU.PRESETS).map(k => [k, AMU.PRESETS[k].n]), opt.preset || 'eigen'));
    h += row(opt.online ? 'Plätze (Rest füllen Bots)' : 'Teilnehmer (du + Bots)', step('players', m.min, m.max, 1));
    h += row('Bot-Schwierigkeit', seg('diff', DIFF));
    if (f.kills || f.chaos) h += row('Verräter', step('traitors', 1, 3, 1));
    if (f.hunt) { h += row('Jäger', step('hunters', 1, 2, 1)); h += row('Rundenzeit', step('huntTime', 120, 600, 30, min)); }
    if (f.meetings) { h += row('Diskussion', step('discuss', 10, 180, 5, sec)); h += row('Abstimmung', step('vote', 10, 120, 5, sec)); h += row('Notrufe pro Person', step('buttonUses', 0, 3, 1)); }
    if (f.tasks) h += row('Aufgaben pro Person', step('tasks', 2, 8, 1));
    if (f.kills) h += row('Abklingzeit Ausknipsen', step('killCd', 10, 60, 5, sec));
    if (!f.word) h += row('Spieltempo', seg('speed', [[0.85, 'Gemütlich'], [1, 'Normal'], [1.15, 'Flott'], [1.3, 'Turbo']]));
    if (f.evidence) h += row('Zeitlimit', step('timeLimit', 180, 900, 30, min));
    if (f.chaos) h += row('Sendezeit', step('chaosTime', 180, 600, 30, min));
    if (f.sab && !f.chaos) h += row('Sendeausfall entscheidet', seg('critWin', [[true, 'Ja'], [false, 'Nein']]));
    if (f.word) {
      h += row('Hinweisrunden', step('wordRounds', 1, 3, 1));
      h += row('Zeit pro Hinweis', step('clueTime', 10, 90, 5, sec));
      h += row('Diskussion', step('discuss', 10, 180, 5, sec)); h += row('Abstimmung', step('vote', 10, 120, 5, sec));
      h += row('Variante', seg('wordVariant', [['kategorie', 'Imposter kennt nur die Kategorie'], ['alternativ', 'Imposter bekommt ein ähnliches Wort']]));
      h += row('Hinweise', seg('clueMode', [['beide', 'Tippen oder Karten'], ['karten', 'Nur Karten'], ['frei', 'Nur tippen']]));
      h += row('Imposter (ab 9 Personen)', step('impostors', 1, 2, 1));
      h += row('Rateversuche des Imposters', step('guessTries', 1, 3, 1));
      h += row('Wörter', seg('wordDiff', [[0, 'Alle'], [1, 'Leicht'], [2, 'Mittel'], [3, 'Schwer']]));
      const cats = AMU.WORDS_DE ? Object.keys(AMU.WORDS_DE.CATS) : [];
      const on = s.wordCats === 'alle' ? cats : s.wordCats;
      h += row('Kategorien', '<div class="ui-seg">' + cats.map(c => { const C = AMU.WORDS_DE.CATS[c]; return '<button class="ui-segb' + (on.includes(c) ? ' on' : '') + '" data-a="cat" data-v="' + c + '"' + (ro ? ' disabled' : '') + '>' + C.icon + ' ' + esc(C.n) + '</button>'; }).join('') + '</div>');
    }
    if (f.roles) {
      h += row('Sonderrollen (höchstens)', step('roleLimit', 1, 8, 1));
      h += row('Erlaubte Sonderrollen', '<div class="ui-seg">' + AMU.ROLE_CHAOS.map(r => { const R = AMU.ROLES[r]; return '<button class="ui-segb' + (s.roleList.includes(r) ? ' on' : '') + '" data-a="role" data-v="' + r + '"' + (ro ? ' disabled' : '') + '>' + (R.icon || '') + ' ' + esc(R.n) + '</button>'; }).join('') + '</div>');
    }
    if (opt.online) h += row('Bots übernehmen bei Verbindungsabbruch', seg('botTakeover', [[true, 'Ja'], [false, 'Nein']]));
    if (!opt.online && !ro) {
      const roles = wishRoles(s);
      if (roles.length > 1) h += row('Meine Rolle', UI().seg('wish', roles, opt.wish || ''));
    }
    h += '</div>';
    return h;
  }
  function wishRoles(s) {
    const m = AMU.modeById(s.mode), f = m.flags, out = [['', '🎲 Zufall']];
    if (f.word) return out.concat([['knower', 'Wissend'], ['impostor', 'Imposter']]);
    if (f.hunt) return out.concat([['runner', 'Flüchtend'], ['hunter', 'Jäger']]);
    out.push(['crew', 'Crew'], ['traitor', 'Verräter']);
    if (f.evidence) out.push(['detective', 'Ermittler']);
    if (f.roles) s.roleList.forEach(r => out.push([r, AMU.ROLES[r].n]));
    return out;
  }
  /** Formular-Klick auf Einstellungen anwenden. Gibt neue Einstellungen zurück (oder null). */
  function applyRule(s, a, v, extra) {
    const o = Object.assign({}, s);
    if (a === 'set' || a === 'seg') {
      const i = v.indexOf(':'), k = v.slice(0, i); let val = v.slice(i + 1);
      if (k === 'preset') { const P = AMU.PRESETS[val]; if (extra) extra.preset = val; return AMU.cleanSettings(Object.assign(o, P.s), null); }
      if (k === 'wish') { if (extra) extra.wish = val; return o; }
      if (val === 'true') val = true; else if (val === 'false') val = false; else if (val !== '' && !isNaN(+val) && k !== 'mode' && k !== 'map' && k !== 'wordVariant' && k !== 'clueMode') val = +val;
      o[k] = val;
      if (k === 'mode') { const m = AMU.modeById(val); o.players = Math.max(m.min, Math.min(m.max, o.players)); if (extra) extra.wish = ''; }
    } else if (a === 'step') {
      const i = v.lastIndexOf(':'), k = v.slice(0, i), d = +v.slice(i + 1);
      o[k] = Math.round(((+o[k] || 0) + d) * 100) / 100;
    } else if (a === 'cat') {
      const cats = Object.keys(AMU.WORDS_DE.CATS); let on = o.wordCats === 'alle' ? cats.slice() : o.wordCats.slice();
      on = on.includes(v) ? on.filter(c => c !== v) : on.concat(v);
      if (!on.length) return null;
      o.wordCats = on.length === cats.length ? 'alle' : on;
    } else if (a === 'role') {
      let l = o.roleList.includes(v) ? o.roleList.filter(r => r !== v) : o.roleList.concat(v);
      if (!l.length) return null; o.roleList = l;
    } else return null;
    if (extra && a !== 'set') extra.preset = 'eigen';
    return AMU.cleanSettings(o, null);
  }
  const RULE_ACTIONS = ['set', 'seg', 'step', 'cat', 'role'];

  // ---------------- Hauptmenü ----------------
  function main() {
    const A = AMU.App, prof = AMU.Save.profile();
    const online = '🌐';
    UI().screen(
      '<div class="ui-wrap amu-main">' +
      '<header class="amu-title"><div class="amu-logo" aria-hidden="true">📻</div><div><h1 class="ui-h1"><span>AnMaCha</span> UNDERCOVER 3D</h1><p class="ui-muted">Wem kannst du trauen?</p></div></header>' +
      '<div class="amu-hello ui-card"><span>' + UI().badge({ n: prof.name || 'Namenlos', look: prof.look, sym: '' }) + '</span><button class="ui-btn ui-sm" data-a="editor">👤 Charakter gestalten</button></div>' +
      '<nav class="amu-menu">' +
      '<button class="ui-btn ui-big ui-pri" data-a="solo" autofocus>▶ Solo gegen Computer</button>' +
      '<button class="ui-btn ui-big" data-a="host">' + online + ' Online: Raum erstellen</button>' +
      '<button class="ui-btn ui-big" data-a="public">🔎 Öffentlichen Raum finden</button>' +
      '<button class="ui-btn ui-big" data-a="join">🔗 Mit Code/Link beitreten</button>' +
      '<button class="ui-btn" data-a="modes">🎭 Spielmodi</button>' +
      '<button class="ui-btn" data-a="ach">🏅 Erfolge & Statistik</button>' +
      '<button class="ui-btn" data-a="settings">⚙ Einstellungen</button>' +
      '<button class="ui-btn" data-a="help">📖 Spielanleitung / Regeln</button>' +
      '<a class="ui-btn" href="../konto.html">👤 Easygames-Konto / Google-Spielstand</a>' +
      '<a class="ui-btn" href="../index.html">← Zurück zu Easygames</a>' +
      '</nav>' +
      '<p class="ui-muted ui-small amu-foot">🌐 Online: Mitspieler treten per Link, Code oder QR-Code von überall bei – jeder mit eigenem Gerät und geheimer Rolle. Solo läuft komplett offline gegen Bots.' +
      (A.webgl() ? '' : '<br>⚠ Dein Gerät kann kein 3D (WebGL). Das Wortspiel funktioniert trotzdem; die Missionsmodi brauchen 3D.') + '</p>' +
      '</div>', { key: 'main', on: a => {
        if (a === 'solo') soloSetup();
        else if (a === 'host') hostSetup();
        else if (a === 'join') joinScreen();
        else if (a === 'public') publicList();
        else if (a === 'modes') modes();
        else if (a === 'ach') AMU.Ach ? AMU.Ach.screen(main) : UI().toast('Erfolge nicht geladen.', 'bad');
        else if (a === 'settings') A.openSettings(main);
        else if (a === 'help') AMU.Help ? AMU.Help.open() : UI().toast('Anleitung nicht geladen.', 'bad');
        else if (a === 'editor') A.openEditor(main);
      } });
    A.setMenuMode(true);
  }

  // ---------------- Solo ----------------
  function soloSetup() {
    const A = AMU.App, extra = { preset: 'eigen', wish: '' };
    let s = AMU.cleanSettings(A.lastSettings(), null);
    const render = () => {
      const needs3d = !AMU.modeById(s.mode).flags.word && !A.webgl();
      UI().screen('<div class="ui-wrap"><div class="ui-row"><button class="ui-btn ui-sm" data-a="back">← Zurück</button><h2 class="ui-h1" style="font-size:24px">▶ Solo gegen Computer</h2></div>' +
        rulesForm(s, true, { preset: extra.preset, wish: extra.wish }) +
        (needs3d ? '<p class="ui-tag bad">Dieser Modus braucht 3D (WebGL) – auf diesem Gerät nicht verfügbar. Probier das Wortspiel!</p>' : '') +
        '<div class="ui-row end amu-sticky"><button class="ui-btn ui-big ui-pri" data-a="start"' + (needs3d ? ' disabled' : '') + '>▶ Runde starten</button></div></div>',
      { key: 'solo', focus: false, on: (a, v) => {
        if (a === 'back') return main();
        if (a === 'start') { A.saveLastSettings(s); A.startSolo(s, extra.wish || null); return; }
        if (RULE_ACTIONS.includes(a)) { const n = applyRule(s, a, v, extra); if (n) { s = n; keepScroll(render); } }
      } });
    };
    render();
    const f = document.querySelector('.ui-screen .ui-pri'); if (f) f.focus({ preventScroll: true });
  }
  function keepScroll(fn) {
    const sc = document.querySelector('.ui-screen'), y = sc ? sc.scrollTop : 0;
    const act = document.activeElement, key = act && act.dataset ? act.dataset.a + '|' + act.dataset.v : null;
    fn();
    const sc2 = document.querySelector('.ui-screen'); if (sc2) sc2.scrollTop = y;
    if (key) { const b = Array.from(document.querySelectorAll('.ui-screen [data-a]')).find(x => x.dataset.a + '|' + x.dataset.v === key); if (b) try { b.focus({ preventScroll: true }); } catch (e) { /* alt */ } }
  }

  // ---------------- Spielmodi ----------------
  function modes() {
    UI().screen('<div class="ui-wrap"><div class="ui-row"><button class="ui-btn ui-sm" data-a="back" autofocus>← Zurück</button><h2 class="ui-h1" style="font-size:24px">🎭 Spielmodi</h2></div>' +
      AMU.MODES.map(m => '<div class="ui-card"><h3 class="ui-h2">' + m.icon + ' ' + esc(modeName(m)) + ' <span class="ui-tag">' + m.min + '–' + m.max + ' Personen</span></h3><p>' + esc(m.desc) + '</p><p class="ui-muted ui-small"><b>Sieg:</b> ' + esc(m.win) + '</p>' +
        '<div class="ui-row"><button class="ui-btn ui-sm ui-pri" data-a="play" data-v="' + m.id + '">▶ Solo spielen</button><button class="ui-btn ui-sm" data-a="rules" data-v="' + m.id + '">📖 Regeln</button></div></div>').join('') + '</div>',
    { key: 'modes', on: (a, v) => {
      if (a === 'back') main();
      else if (a === 'rules') AMU.Help && AMU.Help.open(v);
      else if (a === 'play') { const s = AMU.cleanSettings(Object.assign(AMU.App.lastSettings(), { mode: v }), null); AMU.App.saveLastSettings(s); soloSetup(); }
    } });
  }

  // ---------------- Online: erstellen / beitreten / öffentlich ----------------
  function hostSetup() {
    const A = AMU.App;
    let s = AMU.cleanSettings(Object.assign(A.lastSettings(), {}), null);
    const render = () => UI().screen('<div class="ui-wrap"><div class="ui-row"><button class="ui-btn ui-sm" data-a="back">← Zurück</button><h2 class="ui-h1" style="font-size:24px">🌐 Online: Raum erstellen</h2></div>' +
      '<p class="ui-card">Du bist Gastgeber und spielst selbst mit. Mitspieler treten per Link, Code oder QR-Code von überall bei – jeder mit seinem eigenen Gerät. Leere Plätze füllen Bots. Regeln kannst du in der Lobby noch ändern.</p>' +
      '<div class="ui-card"><div class="ui-field"><label for="amu-room">Raumname (für öffentliche Räume)</label><input id="amu-room" type="text" maxlength="24" value="' + esc((AMU.Save.profile().name || 'Funkraum') + 's Raum') + '"></div>' +
      '<div class="ui-field"><label>Modus</label>' + UI().seg('mode', AMU.MODES.map(m => [m.id, m.icon + ' ' + modeName(m)]), s.mode) + '</div></div>' +
      '<div class="ui-row end"><button class="ui-btn ui-big ui-pri" data-a="create">🌐 Raum erstellen</button></div></div>',
    { key: 'hostSetup', on: (a, v) => {
      if (a === 'back') return main();
      if (a === 'seg') { const n = applyRule(s, 'seg', v); if (n) { s = n; keepScroll(render); } return; }
      if (a === 'create') { const inp = document.getElementById('amu-room'); A.saveLastSettings(s); A.hostOnline(s, AMU.U.cleanName(inp && inp.value, 24) || 'Funkraum'); }
    } });
    render();
  }
  function joinScreen(code, err) {
    UI().screen('<div class="ui-wrap"><div class="ui-row"><button class="ui-btn ui-sm" data-a="back">← Zurück</button><h2 class="ui-h1" style="font-size:24px">🔗 Mit Code/Link beitreten</h2></div>' +
      '<div class="ui-card"><p>Gib den 5-stelligen Code ein, den der Gastgeber dir zeigt – oder öffne einfach seinen Einladungslink.</p>' +
      (err ? '<p class="ui-tag bad">' + esc(err) + '</p>' : '') +
      '<div class="ui-field"><label for="amu-code">Raumcode</label><input id="amu-code" type="text" maxlength="5" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="z. B. K7QX2" value="' + esc(code || '') + '" autofocus></div>' +
      '<div class="ui-row end"><button class="ui-btn ui-big ui-pri" data-a="go">Beitreten</button></div></div></div>',
    { key: 'join', on: a => {
      if (a === 'back') return main();
      if (a === 'go') { const c = AMU.Net.normCode(document.getElementById('amu-code').value); if (!AMU.Net.validCode(c)) return joinScreen(c, 'Der Code hat 5 Zeichen (Buchstaben und Ziffern, ohne I, L, O, 0, 1).'); AMU.App.joinOnline(c); }
    } });
    const i = document.getElementById('amu-code');
    if (i) i.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); const b = document.querySelector('[data-a="go"]'); b && b.click(); } });
  }
  function publicList() {
    const PR = AMU.PublicRooms;
    const head = '<div class="ui-wrap"><div class="ui-row"><button class="ui-btn ui-sm" data-a="back">← Zurück</button><h2 class="ui-h1" style="font-size:24px">🔎 Öffentliche Räume</h2></div>';
    const show = (body) => UI().screen(head + body + '</div>', { key: 'public', on: (a, v) => {
      if (a === 'back') main(); else if (a === 'reload') publicList(); else if (a === 'join') AMU.App.joinOnline(v); else if (a === 'code') joinScreen(); else if (a === 'host') hostSetup();
    } });
    show('<div class="ui-card"><p>Suche offene Räume …</p></div>');
    if (!PR) { show('<div class="ui-card"><p>Öffentliche Räume sind in diesem Build nicht verfügbar.</p></div>'); return; }
    PR.list().then(r => {
      if (UI().screenKey() !== 'public') return;
      if (r.state === 'locked') {
        show('<div class="ui-card"><h3 class="ui-h2">🔒 Freischaltung erforderlich</h3><p>Die öffentliche Raumliste ist fertig gebaut, aber der Betreiber muss die Firestore-Regeln dafür noch veröffentlichen (Block „AnMaCha UNDERCOVER“ in <code>cloud/firestore.rules</code>). Bis dahin: privat spielen per Link, Code oder QR.</p>' +
          '<div class="ui-row"><button class="ui-btn ui-pri" data-a="code">🔗 Mit Code beitreten</button><button class="ui-btn" data-a="host">🌐 Raum erstellen</button></div></div>');
      } else if (r.state === 'off') {
        show('<div class="ui-card"><p>Keine Verbindung zum Online-Dienst (offline oder blockiert). Versuche es später erneut oder spiele mit Code/Link.</p><div class="ui-row"><button class="ui-btn ui-pri" data-a="reload">🔄 Nochmal</button><button class="ui-btn" data-a="code">🔗 Mit Code beitreten</button></div></div>');
      } else if (!r.rooms.length) {
        show('<div class="ui-card"><p>Gerade ist kein öffentlicher Raum offen.</p><div class="ui-row"><button class="ui-btn ui-pri" data-a="host">🌐 Selbst einen Raum erstellen</button><button class="ui-btn" data-a="reload">🔄 Aktualisieren</button></div></div>');
      } else {
        show('<ul class="ui-list">' + r.rooms.map(x => { const m = AMU.modeById(x.m); return '<li><span><b>' + esc(x.n) + '</b><br><small class="ui-muted">' + m.icon + ' ' + esc(modeName(m)) + ' · ' + x.c + '/' + x.x + ' · Code ' + esc(x.code) + '</small></span><button class="ui-btn ui-sm ui-pri" data-a="join" data-v="' + esc(x.code) + '">Beitreten</button></li>'; }).join('') + '</ul>' +
          '<div class="ui-row"><button class="ui-btn" data-a="reload">🔄 Aktualisieren</button></div>');
      }
    });
  }

  // ---------------- Lobby (online) ----------------
  /** st = { role: 'host'|'guest', lobby: lobbyState, meId, code, url, qr, public: {state, on}, err } */
  function lobby(st, on) {
    const L = st.lobby || { players: [], settings: AMU.cleanSettings({}, null) }, s = L.settings, host = st.role === 'host';
    const me = L.players.find(p => p.id === st.meId) || {};
    const m = AMU.modeById(s.mode);
    const humans = L.players.filter(p => !p.bot).length;
    const okStart = host && L.players.length >= m.min && !(m.flags.word ? false : !AMU.App.webgl());
    const pub = st.public || { state: 'unknown', on: false };
    let pubCtl;
    if (!host) pubCtl = '';
    else if (pub.state === 'locked') pubCtl = '<p class="ui-small ui-muted">🔒 Öffentlich listen: Freischaltung erforderlich (Firestore-Regeln noch nicht veröffentlicht). Privat per Link/Code/QR geht immer.</p>';
    else if (pub.state === 'off') pubCtl = '<p class="ui-small ui-muted">Öffentliche Liste gerade nicht erreichbar.</p>';
    else pubCtl = '<div class="ui-field"><label>Raum in „Öffentlichen Räumen“ anzeigen</label>' + UI().seg('public', [[false, 'Privat'], [true, 'Öffentlich']], !!pub.on) + '</div>';
    const players = '<ul class="ui-list">' + L.players.map(p =>
      '<li><span>' + UI().badge({ n: p.n, look: p.look, sym: '' }) + ' ' +
      (p.host ? '<span class="ui-tag or">Gastgeber</span>' : '') + (p.bot ? '<span class="ui-tag">🤖 Bot · ' + DIFF[p.diff || 0][1] + '</span>' : '') +
      (!p.bot && !p.host ? (p.conn ? (p.ready ? '<span class="ui-tag ok">✔ bereit</span>' : '<span class="ui-tag">wartet</span>') : '<span class="ui-tag bad">getrennt</span>') : '') +
      (p.id === st.meId ? ' <span class="ui-tag ok">du</span>' : '') + '</span>' +
      (host && !p.host && !p.bot ? '<button class="ui-btn ui-sm ui-bad" data-a="kick" data-v="' + esc(p.id) + '" aria-label="' + esc(p.n) + ' entfernen">✕</button>' : '') + '</li>').join('') + '</ul>';
    const share = st.code ? '<div class="ui-card amu-share"><div><p class="ui-muted ui-small">Raumcode</p><div class="amu-code">' + esc(st.code) + '</div>' +
      '<p class="ui-small ui-muted">Mitspieler treten per Link, Code oder QR-Code von überall bei.</p>' +
      '<div class="ui-row"><button class="ui-btn ui-sm" data-a="copy">📋 Link kopieren</button>' + (navigator.share ? '<button class="ui-btn ui-sm" data-a="share">📤 Teilen</button>' : '') + '</div>' + pubCtl + '</div>' +
      (st.qr ? '<div class="amu-qr" aria-label="QR-Code zum Beitreten">' + st.qr + '</div>' : '') + '</div>' : '';
    UI().screen('<div class="ui-wrap"><div class="ui-row"><button class="ui-btn ui-sm" data-a="leave">← Raum verlassen</button><h2 class="ui-h1" style="font-size:24px">🌐 Lobby</h2></div>' +
      (st.err ? '<p class="ui-tag bad">' + esc(st.err) + '</p>' : '') + share +
      '<div class="ui-card"><h3 class="ui-h2">👥 Teilnehmer ' + L.players.length + '/' + s.players + ' <small class="ui-muted">(' + humans + ' Menschen)</small></h3>' + players +
      (host ? '' : '<div class="ui-row"><button class="ui-btn ' + (me.ready ? '' : 'ui-pri') + '" data-a="ready">' + (me.ready ? '✋ Doch nicht bereit' : '✔ Bereit') + '</button><button class="ui-btn" data-a="editor">👤 Charakter</button></div>') + '</div>' +
      rulesForm(s, host, { online: true }) +
      (host ? '<div class="ui-row end amu-sticky"><span class="ui-muted ui-small">' + (L.players.some(p => !p.bot && !p.host && !p.ready) ? 'Noch nicht alle bereit – du kannst trotzdem starten.' : '') + '</span><button class="ui-btn ui-big ui-pri" data-a="start"' + (okStart ? '' : ' disabled') + '>▶ Runde starten</button></div>'
        : '<p class="ui-muted">Der Gastgeber startet die Runde.</p>') + '</div>',
    { key: 'lobby', focus: false, on: (a, v) => {
      if (RULE_ACTIONS.includes(a) && host) {
        if (a === 'seg' && v.indexOf('public:') === 0) { on('public', v.slice(7) === 'true'); return; }
        const n = applyRule(s, a, v); if (n) on('settings', n); return;
      }
      on(a, v);
    } });
  }

  AMU.Menus = { main, soloSetup, modes, hostSetup, joinScreen, publicList, lobby, rulesForm, applyRule, keepScroll, modeName, mapName };
})(typeof window !== 'undefined' ? window : globalThis);
