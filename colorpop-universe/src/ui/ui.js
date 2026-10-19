/* ColorPop Universe – Oberfläche. Baut Menüs, Weltkarte, Einstellungen, Sammlung, Hilfe, HUD und Dialoge aus dem Spielstand.
 * Klicks laufen über data-act (ein einziger Listener in main.js), Texte von Nutzern werden immer maskiert. */
(function (root) {
  'use strict';
  var CPU = root.CPU || (root.CPU = {});
  var U = CPU.ui = {};
  var TILE = { adventure: ['#ff6fb5', '#ff9f43'], classic: ['#4c6ef5', '#15aabf'], zen: ['#2f9e44', '#94d82d'], sprint: ['#f59f00', '#f03e3e'], time: ['#7048e8', '#e64980'],
    moves: ['#1c7ed6', '#22b8cf'], puzzle: ['#ae3ec9', '#5f3dc4'], chaos: ['#f76707', '#d6336c'], gravity: ['#0ca678', '#3b5bdb'], daily: ['#f59f00', '#fd7e14'],
    weekly: ['#d6336c', '#7950f2'], tower: ['#5c5f66', '#845ef7'], duel: ['#1098ad', '#5c7cfa'], local: ['#e8590c', '#f783ac'] };
  var BOOSTERS = [{ id: 'hammer', icon: 'hammer', name: 'Hammer', desc: 'Entfernt einen einzelnen Stein, Block oder Fels.' }, { id: 'mini', icon: 'bomb', name: 'Mini-Bombe', desc: 'Sprengt ein 3×3-Feld.' },
    { id: 'color', icon: 'paint', name: 'Farbpinsel', desc: 'Färbt einen Stein in die nächste Farbe um.' }, { id: 'shuffle', icon: 'shuffle', name: 'Mischen', desc: 'Verteilt die Farben neu (mit mindestens einem Zug).' }];
  U.BOOSTERS = BOOSTERS;
  var MECH = { marks: 'Zielmarker', conveyor: 'Förderband', gravity: 'Andere Schwerkraft' };
  var GRAV = ['↓ unten', '← links', '↑ oben', '→ rechts'];

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function ic(n) { return '<svg aria-hidden="true"><use href="#i-' + n + '"/></svg>'; }
  function fmt(n) { return (Math.round(n) || 0).toLocaleString('de-DE'); }
  function stars(n, max) { var s = ''; for (var i = 0; i < (max || 3); i++) s += '<svg class="' + (i < n ? 'on' : '') + '" aria-hidden="true"><use href="#i-star"/></svg>'; return s; }
  function head(title, extra) { return '<header class="head"><button class="btn round" data-back type="button" aria-label="Zurück">' + ic('back') + '</button><h2>' + title + '</h2>' + (extra || '') + '</header>'; }
  function pbar(cur, n) { return '<span class="pbar"><i style="width:' + Math.round(100 * Math.min(1, n ? cur / n : 0)) + '%"></i></span>'; }
  function opt(act, val, label, on) { return '<button class="opt" type="button" data-act="' + act + '" data-arg="' + esc(val) + '" aria-pressed="' + (on ? 'true' : 'false') + '">' + label + '</button>'; }
  function toggle(key, label, on) { return '<div class="field"><span class="lbl">' + label + '</span><div class="opts">' + opt('set', key + '=1', 'An', on) + opt('set', key + '=0', 'Aus', !on) + '</div></div>'; }
  U.esc = esc; U.ic = ic; U.fmt = fmt; U.stars = stars; U.head = head; U.pbar = pbar;

  function funkenChip(p) { return '<span class="funken" title="Funken: Belohnung für neue Sterne, Aufgaben und Erfolge">' + ic('funke') + '<b>' + fmt(p.funken) + '</b></span>'; }
  function mechText(list) {
    return list.map(function (k) { var pi = CPU.PIECE_INFO.filter(function (x) { return x.kind === k; })[0]; return pi ? pi.name : MECH[k] || k; }).filter(Boolean);
  }
  U.mechText = mechText;

  // ---------- Hauptmenü ----------
  U.menu = function (app) {
    var p = app.store.p, s = app.store.settings, t = app.store.tasks(), next = Math.min(300, p.unlocked), L = CPU.LEVELS[next - 1];
    var cont = p.resume ? 'Weiterspielen: ' + esc(p.resume.title) : 'Abenteuer: Level ' + next;
    var contSub = p.resume ? 'Deine letzte Runde wartet genau dort, wo du aufgehört hast.' : 'Welt ' + L.world + ' · ' + esc(CPU.WORLDS[L.world - 1].name) + ' · „' + esc(L.title) + '“';
    var h = '<div class="menu">';
    h += '<div class="menu-top"><button class="profile-chip" type="button" data-act="nav" data-arg="settings#profile" aria-label="Profil wechseln"><span class="av">' + esc((p.name || 'S').charAt(0).toUpperCase()) + '</span><b>' + esc(p.name) + '</b></button>';
    h += '<div class="row">' + funkenChip(p) +
      '<button class="btn round" type="button" data-act="nav" data-arg="collection" aria-label="Sammlung: Aufgaben, Erfolge, Designs, Statistik">' + ic('trophy') + '</button>' +
      '<button class="btn round" type="button" data-act="nav" data-arg="settings" aria-label="Einstellungen">' + ic('gear') + '</button>' +
      '<button class="btn round" type="button" data-act="nav" data-arg="help" aria-label="Hilfe und Regeln">' + ic('help') + '</button>' +
      '<button class="btn round" type="button" data-act="mute" aria-label="Ton an/aus">' + ic(s.musicOn || s.sfxOn ? 'sound' : 'mute') + '</button>' +
      '<button class="btn round" type="button" data-act="full" aria-label="Vollbild">' + ic('full') + '</button>' +
      '<button class="btn round" type="button" data-act="allGames" aria-label="Alle Spiele">' + ic('home') + '</button></div></div>';
    h += '<div class="menu-hero"><div><h1 class="logo"><span>Color</span><span>Pop</span><small>Universe</small></h1><p class="slogan">Antippen. Abräumen. Universen entdecken.</p></div>';
    h += '<div class="continue"><button class="btn primary big" type="button" data-act="continue" id="btnContinue">' + ic('play') + ' ' + cont + '</button><small>' + contSub + '</small></div></div>';
    h += '<div class="tiles" role="list">';
    CPU.MODES.forEach(function (m) {
      var c = TILE[m.id];
      h += '<button class="tile" role="listitem" type="button" data-act="mode" data-arg="' + m.id + '" style="--t1:' + c[0] + ';--t2:' + c[1] + '"><span class="ic">' + ic(m.icon) + '</span><b>' + m.name + '</b><span>' + m.desc + '</span><em>' + tileInfo(app, m.id) + '</em></button>';
    });
    h += '</div>';
    h += '<div class="card" style="margin:0;max-width:none"><h3>Heutige Aufgaben</h3><div class="tasks-mini">' + taskRows(t.day) + '</div><div class="row" style="margin-top:10px"><button class="btn small ghost" type="button" data-act="nav" data-arg="collection">Alle Aufgaben, Erfolge &amp; Designs</button><button class="btn small ghost" type="button" data-act="nav" data-arg="cloud">' + ic('cloud') + ' Mit Google speichern</button></div></div>';
    h += '</div>';
    return '<div class="scroll">' + h + '</div>';
  };
  function tileInfo(app, id) {
    var p = app.store.p, r = p.records;
    switch (id) {
      case 'adventure': return '★ ' + CPU.profileStars(p) + ' / 900';
      case 'classic': return r.classicMax ? 'Rekord ' + fmt(r.classicMax) : 'Originalregeln';
      case 'zen': return (p.stats.zenBoards || 0) + ' Bretter';
      case 'sprint': return r.sprint ? 'Rekord ' + fmt(r.sprint) : '60 Sekunden';
      case 'time': return r.time['120'] || r.time['180'] || r.time['300'] ? 'Rekord ' + fmt(Math.max(r.time['120'] || 0, r.time['180'] || 0, r.time['300'] || 0)) : '2 · 3 · 5 Min.';
      case 'moves': return '15 · 25 · 40 Züge';
      case 'puzzle': return Object.keys(p.puzzles).filter(function (k) { return p.puzzles[k].stars > 0; }).length + ' / 30 gelöst';
      case 'chaos': return r.chaos ? 'Rekord ' + fmt(r.chaos) : '6–7 Farben';
      case 'gravity': return r.gravity ? 'Rekord ' + fmt(r.gravity) : 'Drehende Schwerkraft';
      case 'daily': var d = r.daily[CPU.utcDay(new Date())]; return d ? 'Heute ' + fmt(d) : 'Serie ' + (p.dailyStreak || 0);
      case 'weekly': var wk = CPU.isoWeek(new Date()); return (p.weekly.week === wk ? Object.keys(p.weekly.tasks).length : 0) + ' / 7 diese Woche';
      case 'tower': return 'Stockwerk ' + p.tower.floor;
      case 'duel': return (p.stats.duelWins || 0) + ' Siege';
      case 'local': return '1 Gerät, 2 Spieler';
    }
    return '';
  }
  function taskRows(list) {
    if (!list.length) return '<p class="muted">Keine Aufgaben.</p>';
    return list.map(function (t) { return '<div class="task' + (t.done ? ' done' : '') + '"><span class="task-text">' + (t.done ? '✓ ' : '') + esc(t.text) + '</span>' + pbar(t.cur, t.n) + '<small>' + fmt(t.cur) + '/' + fmt(t.n) + ' · +' + t.reward + ic('funke').replace('<svg', '<svg style="width:14px;height:14px;vertical-align:-2px"') + '</small></div>'; }).join('');
  }

  // ---------- Welten ----------
  U.worlds = function (app) {
    var p = app.store.p, h = head('Weltkarte', funkenChip(p)) + '<div class="scroll"><div class="wrap"><p class="muted" style="text-align:center">★ ' + CPU.profileStars(p) + ' von 900 Sternen · ' + CPU.profileWon(p) + ' von 300 Leveln geschafft</p><div class="worlds">';
    CPU.WORLDS.forEach(function (w) {
      var first = (w.id - 1) * 25 + 1, open = p.unlocked >= first, st = 0, done = 0;
      for (var i = first; i < first + 25; i++) { var L = p.levels[i]; if (L && L.stars) { st += L.stars; done++; } }
      h += '<button class="wtile' + (open ? '' : ' locked') + '" type="button" data-act="world" data-arg="' + w.id + '" style="--w1:' + w.bg[0] + ';--w2:' + w.bg[1] + ';--w3:' + w.bg[2] + '"' + (open ? '' : ' aria-label="' + esc(w.name) + ' – gesperrt"') + '>' +
        (open ? '' : '<span class="lock">' + ic('lock') + '</span>') + '<span class="num">Welt ' + w.id + '</span><b>' + esc(w.name) + '</b><span>' + esc(w.tag) + '</span>' +
        '<span class="prog">' + pbar(done, 25) + '★ ' + st + '/75</span></button>';
    });
    return h + '</div></div></div>';
  };
  U.world = function (app, wid) {
    var p = app.store.p, w = CPU.WORLDS[wid - 1], first = (wid - 1) * 25 + 1;
    var h = head('Welt ' + wid + ': ' + esc(w.name)) + '<div class="scroll"><div class="world-head"><p><b>' + esc(w.tag) + '</b></p><p>' + esc(w.intro) + '</p></div><div class="map">';
    for (var i = first; i < first + 25; i++) {
      var L = CPU.LEVELS[i - 1], rec = p.levels[i], lock = i > p.unlocked, cls = 'node' + (lock ? ' locked' : '') + (i === p.unlocked ? ' current' : '') + (i % 25 === 0 ? ' finale' : '') + (L.challenge ? ' challenge' : '');
      h += '<button class="' + cls + '" type="button" data-act="level" data-arg="' + i + '" aria-label="Level ' + i + (lock ? ', gesperrt' : rec && rec.stars ? ', ' + rec.stars + ' Sterne' : '') + '">' +
        (lock ? ic('lock').replace('<svg', '<svg style="width:22px;height:22px"') : '<span>' + i + '</span><span class="st">' + stars(rec ? rec.stars : 0) + '</span>') + (i === p.unlocked && !lock ? '<span class="new">Neu</span>' : '') + '</button>';
    }
    return h + '</div></div>';
  };
  // Level-Vorschau (Dialog)
  U.levelIntro = function (app, id) {
    var L = CPU.LEVELS[id - 1], rec = app.store.p.levels[id] || { stars: 0, best: 0 }, w = CPU.WORLDS[L.world - 1];
    var mech = mechText(CPU.levels.mechanics(L));
    var b = '<p>Welt ' + L.world + ' · ' + esc(w.name) + (L.challenge ? ' · <b>Herausforderung</b>' : '') + (id % 25 === 0 ? ' · <b>Finale</b>' : '') + '</p>';
    b += '<div class="goals-list">' + L.goals.map(function (g) { return '<div>🎯 ' + esc(CPU.goalText(g)) + '</div>'; }).join('') + (L.moves ? '<div>👣 ' + L.moves + ' Züge' + (L.moveBonus ? ' · +100 je übrigem Zug' : '') + '</div>' : '') + '</div>';
    b += '<p class="muted">★ Ziel erreicht · ★★ ab ' + fmt(L.stars[0]) + ' · ★★★ ab ' + fmt(L.stars[1]) + ' Punkten</p>';
    if (mech.length) b += '<p class="muted">Im Level: ' + esc(mech.join(', ')) + '</p>';
    if (rec.stars) b += '<div class="big-stars" style="transform:scale(.6);margin:-6px 0">' + stars(rec.stars) + '</div><p class="muted">Bestwert ' + fmt(rec.best) + '</p>';
    return { title: 'Level ' + id + ': ' + esc(L.title), body: b };
  };

  // ---------- Modus einrichten ----------
  U.setup = function (app, mode) {
    var m = CPU.modeInfo(mode), p = app.store.p, st = app.setup[mode] || {}, h = head(m.name) + '<div class="scroll"><div class="card"><p>' + esc(m.tut) + '</p>';
    var start = '<div class="row center" style="margin-top:14px"><button class="btn primary big" type="button" data-act="startMode" data-arg="' + mode + '" id="btnStart">' + ic('play') + ' Los geht’s</button></div>';
    var rec = function (v) { return v ? '<p class="muted">Dein Rekord: <b>' + fmt(v) + '</b></p>' : ''; };
    switch (mode) {
      case 'classic':
        h += '<div class="field"><span class="lbl">Brettgröße</span><div class="opts">' + CPU.CLASSIC_SIZES.map(function (s) { return opt('setup', 'classic.size=' + s.id, s.name + ' ' + s.w + '×' + s.h, st.size === s.id); }).join('') + '</div></div>';
        h += '<div class="field"><span class="lbl">Farben</span><div class="opts">' + [3, 4, 5, 6].map(function (c) { return opt('setup', 'classic.colors=' + c, String(c), st.colors === c); }).join('') + '</div></div>';
        h += '<div class="field"><span class="lbl">Brett-Nummer (gleiche Nummer = gleiches Brett)</span><div class="row"><input type="text" inputmode="numeric" maxlength="9" id="inSeed" value="' + esc(st.seed || '') + '" placeholder="zufällig" aria-label="Brett-Nummer" style="max-width:180px"><button class="btn small ghost" type="button" data-act="shareSeed">Herausforderung teilen</button></div></div>';
        h += rec(p.records.classic[st.size]) + start; break;
      case 'time': h += '<div class="field"><span class="lbl">Dauer</span><div class="opts">' + [120, 180, 300].map(function (s) { return opt('setup', 'time.limit=' + s, s / 60 + ' Minuten', st.limit === s); }).join('') + '</div></div>' + rec(p.records.time[String(st.limit)]) + start; break;
      case 'moves': h += '<div class="field"><span class="lbl">Züge</span><div class="opts">' + [15, 25, 40].map(function (s) { return opt('setup', 'moves.limit=' + s, s + ' Züge', st.limit === s); }).join('') + '</div></div>' + rec(p.records.moves[String(st.limit)]) + start; break;
      case 'chaos': h += '<div class="field"><span class="lbl">Farben</span><div class="opts">' + opt('setup', 'chaos.colors=6', '6 Farben', st.colors === 6) + opt('setup', 'chaos.colors=7', '7 Farben', st.colors === 7) + '</div></div>' + rec(p.records.chaos) + start; break;
      case 'sprint': h += rec(p.records.sprint) + start; break;
      case 'gravity': h += rec(p.records.gravity) + start; break;
      case 'zen':
        h += '<div class="field"><span class="lbl">Farben</span><div class="opts">' + [3, 4, 5].map(function (c) { return opt('setup', 'zen.colors=' + c, String(c), st.colors === c); }).join('') + '</div></div>' + rec(p.records.zen) + start; break;
      case 'daily': {
        var day = CPU.utcDay(new Date()), best = p.records.daily[day];
        h += '<p>Heute (UTC): <b>' + day + '</b> · Serie: <b>' + (p.dailyStreak || 0) + ' Tage</b></p>' + (best ? '<p>Dein Bestwert heute: <b>' + fmt(best) + '</b></p>' : '<p class="muted">Heute noch nicht gespielt.</p>') + start; break;
      }
      case 'duel':
        h += '<div class="field"><span class="lbl">Bot-Stärke</span><div class="opts">' + [['easy', 'Einfach'], ['medium', 'Mittel'], ['hard', 'Schwer']].map(function (b) { return opt('setup', 'duel.bot=' + b[0], b[1], st.bot === b[0]); }).join('') + '</div></div>';
        h += '<div class="field"><span class="lbl">Farben</span><div class="opts">' + [3, 4, 5].map(function (c) { return opt('setup', 'duel.colors=' + c, String(c), st.colors === c); }).join('') + '</div></div>';
        h += '<p class="muted">Online-Duell: nicht enthalten – das KI-Duell und „Lokal zu zweit“ laufen komplett auf diesem Gerät.</p>' + start; break;
      case 'local':
        h += '<div class="field"><span class="lbl">Variante</span><div class="opts">' + opt('setup', 'local.variant=turns', 'Zugwechsel', st.variant === 'turns') + opt('setup', 'local.variant=relay', 'Nacheinander', st.variant === 'relay') + '</div></div>';
        h += '<div class="field"><span class="lbl">Farben</span><div class="opts">' + [3, 4, 5].map(function (c) { return opt('setup', 'local.colors=' + c, String(c), st.colors === c); }).join('') + '</div></div>' + start; break;
      case 'tower':
        h += '<p>Aktuelles Stockwerk: <b>' + p.tower.floor + '</b> · Höchstes geschafftes: <b>' + (p.tower.best || 0) + '</b></p>' + start.replace('Los geht’s', 'Stockwerk ' + p.tower.floor + ' starten'); break;
      case 'puzzle': {
        var solved = Object.keys(p.puzzles).filter(function (k) { return p.puzzles[k].stars > 0; }).length;
        h += '<p class="muted">' + solved + ' von 30 gelöst. Neue Rätsel öffnen sich, sobald du die vorherigen löst.</p></div><div class="card"><div class="puzzles">';
        CPU.PUZZLES.forEach(function (z) {
          var r = p.puzzles[z.id], lock = z.id > solved + 3;
          h += '<button class="node' + (lock ? ' locked' : '') + '" type="button" data-act="puzzle" data-arg="' + z.id + '" style="--accent:#ae3ec9" aria-label="Rätsel ' + z.id + (lock ? ', gesperrt' : '') + '">' + (lock ? ic('lock').replace('<svg', '<svg style="width:20px;height:20px"') : '<span>' + z.id + '</span><span class="st">' + stars(r ? r.stars : 0) + '</span>') + '</button>';
        });
        h += '</div>'; break;
      }
      case 'weekly': {
        var wk = CPU.isoWeek(new Date()), mine = p.weekly.week === wk ? p.weekly.tasks : {}, total = 0;
        Object.keys(mine).forEach(function (k) { total += mine[k]; });
        h += '<p>Woche <b>' + wk + '</b> · gelöst: <b>' + Object.keys(mine).length + '/7</b> · Wochenwertung: <b>' + fmt(total) + '</b></p></div><div class="card"><div class="tasks-mini">';
        for (var k = 0; k < 7; k++) {
          var wt = app.weekTask(wk, k);
          h += '<div class="task' + (mine[k] ? ' done' : '') + '"><span class="task-text"><b>Aufgabe ' + (k + 1) + ':</b> ' + esc(wt.def.goals.map(CPU.goalText).join(', ')) + (mine[k] ? ' · Bestwert ' + fmt(mine[k]) : '') + '</span><button class="btn small' + (mine[k] ? ' ghost' : ' primary') + '" type="button" data-act="weekly" data-arg="' + k + '">' + (mine[k] ? 'Nochmal' : 'Spielen') + '</button></div>';
        }
        h += '</div>'; break;
      }
    }
    return h + '</div></div>';
  };

  // ---------- Sammlung ----------
  U.collection = function (app, tab) {
    tab = tab || 'tasks';
    var p = app.store.p, tabs = [['tasks', 'Aufgaben & Booster'], ['ach', 'Erfolge'], ['skins', 'Designs'], ['stats', 'Statistik']];
    var h = head('Sammlung', funkenChip(p)) + '<div class="tabs" role="tablist">' + tabs.map(function (t) { return '<button class="tab" role="tab" type="button" data-act="ctab" data-arg="' + t[0] + '" aria-selected="' + (t[0] === tab) + '">' + t[1] + '</button>'; }).join('') + '</div><div class="scroll">';
    if (tab === 'tasks') {
      var t = app.store.tasks();
      h += '<div class="card"><h3>Heute</h3><div class="tasks-mini">' + taskRows(t.day) + '</div></div><div class="card"><h3>Diese Woche</h3><div class="tasks-mini">' + taskRows(t.week) + '</div></div>';
      h += '<div class="card"><h3>Booster</h3><p>Booster kosten Funken – Funken gibt es nur durchs Spielen (neue Sterne, Aufgaben, Erfolge, Meilensteine). Kein Echtgeld, keine Werbung. Booster gibt es im Abenteuer, im Endlos-Turm und im Zen-Modus.</p><div class="grid2">';
      BOOSTERS.forEach(function (b) { var price = CPU.BOOSTER_PRICE[b.id]; h += '<div class="ach on"><span class="ic">' + ic(b.icon) + '</span><div style="flex:1"><b>' + b.name + ' · ' + (p.boosters[b.id] || 0) + '×</b><small>' + b.desc + '</small></div><button class="btn small" type="button" data-act="buy" data-arg="' + b.id + '"' + (p.funken < price ? ' disabled' : '') + '>' + price + ' ' + ic('funke') + '</button></div>'; });
      h += '</div></div>';
    } else if (tab === 'ach') {
      var n = Object.keys(p.ach).length;
      h += '<div class="card" style="max-width:1100px"><p>' + n + ' von ' + CPU.ACHIEVEMENTS.length + ' Erfolgen</p><div class="grid2">' + CPU.ACHIEVEMENTS.map(function (a) { var on = !!p.ach[a.id]; return '<div class="ach' + (on ? ' on' : '') + '"><span class="ic">' + ic(on ? a.icon : 'lock') + '</span><div><b>' + esc(a.title) + '</b><small>' + esc(a.desc) + (on ? ' · ' + new Date(p.ach[a.id]).toLocaleDateString('de-DE') : '') + '</small></div></div>'; }).join('') + '</div></div>';
    } else if (tab === 'skins') {
      [['stone', 'Steinoberflächen'], ['pop', 'Knall-Effekte'], ['bg', 'Hintergründe']].forEach(function (g) {
        h += '<div class="card" style="max-width:1100px"><h3>' + g[1] + '</h3><div class="skins">';
        CPU.SKINS[g[0]].forEach(function (it) {
          var un = CPU.skinUnlocked(it, p), on = p.cosmetic[g[0]] === it.id;
          h += '<button class="skin' + (on ? ' on' : '') + (un ? '' : ' lk') + '" type="button" data-act="skin" data-arg="' + g[0] + '.' + it.id + '" aria-pressed="' + on + '"' + (un ? '' : ' aria-disabled="true"') + '>' + (g[0] === 'stone' ? '<canvas width="184" height="92" data-skin="' + it.id + '"></canvas>' : '<span class="ic" style="font-size:28px">' + (g[0] === 'pop' ? '✨' : '🌌') + '</span>') + '<b>' + esc(it.name) + '</b><small>' + (on ? 'Aktiv' : un ? 'Freigeschaltet' : '🔒 ' + CPU.skinNeedText(it)) + '</small></button>';
        });
        h += '</div></div>';
      });
    } else {
      var s = p.stats, rows = [['Runden', s.rounds], ['Entfernte Steine', s.removed], ['Gruppen', s.groups], ['Größte Gruppe', s.maxGroup], ['Leere Bretter', s.clears], ['Sterne', CPU.profileStars(p)], ['Level geschafft', CPU.profileWon(p)],
        ['Sammelobjekte', s.items], ['Eisschichten', s.ice], ['Blöcke', s.blocks], ['Spezialsteine', s.specials], ['Booster benutzt', s.boosters], ['Daily-Runden', s.daily], ['Daily-Serie', p.dailyStreak], ['Duell-Siege', s.duelWins],
        ['Turm (bestes Stockwerk)', p.tower.best], ['Rekord Sprint 60', p.records.sprint], ['Rekord Klassiker', p.records.classicMax], ['Rekord Farbchaos', p.records.chaos], ['Rekord Gravitation+', p.records.gravity], ['Zen-Bretter', s.zenBoards]];
      h += '<div class="card" style="max-width:1100px"><div class="stats">' + rows.map(function (r) { return '<div class="stat"><b>' + fmt(r[1] || 0) + '</b><small>' + r[0] + '</small></div>'; }).join('') + '</div></div>';
    }
    return h + '</div>';
  };
  // Vorschau-Steine für die Design-Auswahl zeichnen
  U.paintSkins = function (scope) {
    var list = scope.querySelectorAll('canvas[data-skin]');
    for (var k = 0; k < list.length; k++) {
      var cv = list[k], ctx = cv.getContext('2d'), sz = 44;
      for (var c = 0; c < 4; c++) { var spr = CPU.sprites.get(CPU.cell.mk(c, 0, 0, 0), sz * 2, { skin: cv.getAttribute('data-skin'), hc: false, world: 1, noOffscreen: true }); ctx.drawImage(spr, c * 46, c % 2 ? 46 : 2, sz, sz); }
    }
  };

  // ---------- Einstellungen ----------
  U.settings = function (app) {
    var s = app.store.settings, p = app.store.p, h = head('Einstellungen') + '<div class="scroll">';
    h += '<div class="card"><h3>Ton</h3>' + toggle('musicOn', 'Musik', s.musicOn) + '<div class="field"><label for="rgMusic">Musik-Lautstärke</label><input type="range" id="rgMusic" min="0" max="100" value="' + Math.round(s.music * 100) + '" data-range="music"></div>' +
      toggle('sfxOn', 'Effekte', s.sfxOn) + '<div class="field"><label for="rgSfx">Effekt-Lautstärke</label><input type="range" id="rgSfx" min="0" max="100" value="' + Math.round(s.sfx * 100) + '" data-range="sfx"></div>' + (CPU.audio.available() ? '' : '<p class="muted">Dieser Browser unterstützt keinen WebAudio-Ton.</p>') + '</div>';
    h += '<div class="card"><h3>Grafik &amp; Barrierefreiheit</h3><div class="field"><span class="lbl">Qualität</span><div class="opts">' + [['auto', 'Automatisch'], ['high', 'Hoch'], ['mid', 'Mittel'], ['low', 'Akku sparen']].map(function (q) { return opt('set', 'quality=' + q[0], q[1], s.quality === q[0]); }).join('') + '</div></div>';
    h += '<div class="field"><span class="lbl">Bewegung</span><div class="opts">' + [['auto', 'Wie System'], ['full', 'Voll'], ['reduced', 'Reduziert']].map(function (q) { return opt('set', 'motion=' + q[0], q[1], s.motion === q[0]); }).join('') + '</div></div>';
    h += '<div class="field"><span class="lbl">Animationstempo</span><div class="opts">' + [[0.75, 'Ruhig'], [1, 'Normal'], [1.5, 'Schnell']].map(function (q) { return opt('set', 'speed=' + q[0], q[1], s.speed === q[0]); }).join('') + '</div></div>';
    h += toggle('contrast', 'Hoher Kontrast (kräftigere Farben, klare Ränder)', s.contrast) + toggle('showPoints', 'Punkte-Vorschau und schwebende Punkte', s.showPoints) + '<p class="muted">Jede Farbe hat eine eigene Form und ein eigenes Symbol – die Steine sind auch ohne Farbsehen unterscheidbar.</p></div>';
    h += '<div class="card"><h3>Steuerung</h3>' + toggle('confirmTap', 'Bestätigungs-Tipp (1. Tipp zeigt die Gruppe, 2. Tipp entfernt sie)', s.confirmTap) + toggle('holdPreview', 'Gedrückt halten zeigt die Gruppe ohne Zug', s.holdPreview) + toggle('vibrate', 'Vibration (falls vom Gerät unterstützt)', s.vibrate);
    h += '<div class="field"><span class="lbl">Tastenbelegung (Pfeile, Enter und Esc funktionieren immer)</span><div class="keys">' + Object.keys(CPU.ACTION_NAMES).map(function (a) { return '<div class="key"><span>' + CPU.ACTION_NAMES[a] + '</span><button class="btn small ghost" type="button" data-act="rebind" data-arg="' + a + '" aria-label="' + CPU.ACTION_NAMES[a] + ' neu belegen"><kbd>' + esc(CPU.keyLabel(s.keys[a])) + '</kbd></button></div>'; }).join('') + '</div><div class="row"><button class="btn small ghost" type="button" data-act="resetKeys">Standardbelegung</button></div></div>';
    h += '<p class="muted"><b>Controller:</b> Steuerkreuz/Stick bewegt den Cursor, A wählt, B zurück, X Hinweis, Y Rückgängig, LB/RB Booster wählen, Start Pause, Select Ton. In Menüs springt das Steuerkreuz zwischen den Knöpfen. Zoom: Mausrad, zwei Finger oder + / −.</p></div>';
    h += '<div class="card" id="profile"><h3>Profile</h3><div class="grid2">' + app.store.profiles().map(function (pr) { return '<div class="ach' + (pr.active ? ' on' : '') + '"><span class="ic">' + esc((pr.name || '+').charAt(0).toUpperCase()) + '</span><div style="flex:1"><b>' + (pr.exists ? esc(pr.name) : 'Freier Platz') + '</b><small>' + (pr.active ? 'Aktiv' : pr.exists ? 'Gespeichert' : 'Neues Profil anlegen') + '</small></div>' + (pr.active ? '' : '<button class="btn small" type="button" data-act="profile" data-arg="' + pr.id + '">' + (pr.exists ? 'Wechseln' : 'Anlegen') + '</button>') + '</div>'; }).join('') + '</div>';
    h += '<div class="field"><label for="inName">Name des aktiven Profils</label><div class="row"><input type="text" id="inName" maxlength="20" value="' + esc(p.name) + '"><button class="btn small" type="button" data-act="rename">Speichern</button></div></div></div>';
    h += '<div class="card"><h3>Spielstand</h3><p>Wird automatisch auf diesem Gerät gespeichert. Export/Import als Datei, z. B. zum Umziehen auf ein anderes Gerät.</p><div class="row"><button class="btn small" type="button" data-act="export">Exportieren</button><button class="btn small" type="button" data-act="import">Importieren</button><button class="btn small ghost" type="button" data-act="backup">Sicherung wiederherstellen</button><button class="btn small ghost" type="button" data-act="nav" data-arg="cloud">' + ic('cloud') + ' Mit Google speichern</button></div><input type="file" id="inImport" accept=".json,application/json" hidden>';
    h += '<div class="row" style="margin-top:10px"><button class="btn small ghost" type="button" data-act="tutReset">Tutorials wieder zeigen</button><button class="btn small warn" type="button" data-act="resetProfile">Profil zurücksetzen</button></div><p class="muted">Version ' + esc(app.version) + ' · Level-Generator v' + CPU.GEN_VERSION + ' · ' + CPU.LEVELS.length + ' geprüfte Level</p></div>';
    return h + '</div>';
  };

  // ---------- Hilfe ----------
  U.help = function () {
    var h = head('Hilfe') + '<div class="scroll">';
    h += '<div class="card"><h3>So wird gespielt</h3><p>Tippe auf eine Gruppe aus <b>mindestens 2</b> gleichfarbigen Steinen, die sich waagerecht oder senkrecht berühren (nicht diagonal). Die Gruppe knallt weg. Steine darüber fallen nach unten, danach rücken leere Spalten nach links zusammen. Die Runde endet, wenn das Brett leer ist oder keine Gruppe mehr übrig ist.</p>' +
      '<p><b>Punkte:</b> (Steine − 2)² × 10. Eine 2er-Gruppe bringt 0, eine 5er-Gruppe 90, eine 10er-Gruppe 640 Punkte. Ein komplett leeres Brett gibt <b>+1.000</b>. In Leveln mit Zuglimit und Zugbonus gibt es +100 je übrigem Zug. Große Gruppen lohnen sich also enorm!</p>' +
      '<p><b>Tipp:</b> Sammle Farben, bevor du sie abräumst. Räume zuerst Farben ab, die große Gruppen anderer Farben trennen.</p></div>';
    h += '<div class="card"><h3>Steuerung</h3><p><b>Touch/Maus:</b> Tippen = Gruppe entfernen. Gedrückt halten = Gruppe und Punkte ansehen, ohne zu ziehen. Mit der Maus zeigt schon das Darüberfahren die Gruppe. Zwei Finger oder Mausrad = Zoom.</p><p><b>Tastatur:</b> Pfeile oder W A S D bewegen den Cursor, Enter/Leertaste wählt, H Hinweis, U Rückgängig, R Neustart, P/Esc Pause, F Vollbild, M Ton, 1–4 Booster. Belegung in den Einstellungen änderbar.</p><p><b>Controller:</b> wie in den Einstellungen beschrieben.</p></div>';
    h += '<div class="card"><h3>Modi</h3>' + CPU.MODES.map(function (m) { return '<p><b>' + m.name + ':</b> ' + esc(m.tut) + '</p>'; }).join('') + '<p class="muted">Ein Online-Duell gibt es nicht; alle Modi laufen offline auf diesem Gerät.</p></div>';
    h += '<div class="card"><h3>Steine &amp; Hindernisse</h3><div class="pieces">' + CPU.PIECE_INFO.map(function (pi, k) { return '<div class="piece"><canvas width="92" height="92" data-piece="' + pi.kind + '" data-k="' + k + '"></canvas><div><b>' + esc(pi.name) + '</b><br><span class="muted">' + esc(pi.text) + '</span></div></div>'; }).join('') + '</div></div>';
    h += '<div class="card"><h3>Booster</h3>' + BOOSTERS.map(function (b) { return '<p><b>' + b.name + ':</b> ' + b.desc + ' Preis: ' + CPU.BOOSTER_PRICE[b.id] + ' Funken.</p>'; }).join('') + '</div>';
    return h + '</div>';
  };
  U.paintPieces = function (scope) {
    var C = CPU.cell, K = CPU.K, list = scope.querySelectorAll('canvas[data-piece]');
    var map = { normal: [0, K.NORMAL], bomb: [5, K.BOMB], rocket: [2, K.ROCKET], prism: [-1, K.PRISM], rainbow: [3, K.RAINBOW], chain: [4, K.CHAIN], anchor: [1, K.ANCHOR], neon: [0, K.NEON], wind: [2, K.WIND], wood: [-1, K.WOOD], rock: [-1, K.ROCK], item: [-1, K.ITEM], void: [-1, K.VOID], portal: [-1, K.PORTAL], ice: [2, K.NORMAL] };
    for (var k = 0; k < list.length; k++) {
      var cv = list[k], kind = cv.getAttribute('data-piece'), m = map[kind], ctx = cv.getContext('2d'); if (!m) continue;
      var arg = kind === 'rock' ? 2 : kind === 'rocket' ? 0 : 0;
      var v = C.mk(m[0], m[1], 0, arg), opt = { skin: 'jelly', hc: false, world: 1, noOffscreen: true };
      if (kind === 'void') { ctx.fillStyle = 'rgba(255,255,255,.08)'; CPU.rrect(6, 6, 80, 80, 18, ctx); ctx.fill(); continue; }
      ctx.drawImage(CPU.sprites.get(v, 92, opt), 0, 0, 92, 92);
      if (kind === 'ice') ctx.drawImage(CPU.sprites.ice(1, 92, false), 0, 0, 92, 92);
    }
  };

  // ---------- HUD ----------
  U.hud = function (app) {
    var S = app.sess, g = S.game, ctx = app.ctx, $ = app.$;
    $('hudScore').textContent = fmt(S.score());
    var chips = '';
    g.progress().forEach(function (pr) {
      var t = pr.goal.t, label = t === 'score' ? fmt(pr.cur) + ' / ' + fmt(pr.target) : t === 'clear' ? (g.remaining()) + ' übrig' : t === 'leave' ? g.remaining() + ' / max. ' + pr.goal.n : pr.cur + ' / ' + pr.target;
      var sw = t === 'color' ? '<span class="sw" style="background:' + CPU.COLORS[pr.goal.c] + '"></span>' : '';
      chips += '<span class="chip' + (pr.done ? ' done' : '') + '" title="' + esc(pr.text) + '">' + sw + (pr.done ? '✓ ' : '🎯 ') + esc(shortGoal(pr.goal)) + ' ' + label + '</span>';
    });
    if (g.moveLimit) { var ml = g.movesLeft(); chips += '<span class="chip' + (ml <= 3 ? ' warn' : '') + '">👣 ' + ml + ' Züge</span>'; }
    if (S.mode === 'moves') { var left = (S.opt.limit || 25) - (S.movesSoFar || 0) - g.movesUsed; chips += '<span class="chip' + (left <= 3 ? ' warn' : '') + '">👣 ' + Math.max(0, left) + ' Züge</span>'; }
    if (S.timeLimit()) { var tl = Math.ceil(S.timeLeft(app.now())); chips += '<span class="chip' + (tl <= 10 ? ' warn' : '') + '" id="chipTime">⏱ ' + Math.floor(tl / 60) + ':' + String(tl % 60).padStart(2, '0') + '</span>'; }
    if (S.mode === 'sprint' && S.combo > 0 && app.now() - S.lastMoveAt <= 2000) chips += '<span class="chip done">Combo ×' + S.comboMult().toFixed(1).replace('.', ',') + '</span>';
    var gn = g.gravityNext(); if (gn || g.gravityNow()) chips += '<span class="chip" title="Schwerkraft">Schwerkraft ' + GRAV[g.gravityNow()] + (gn ? ' · in ' + gn.in + ': ' + GRAV[gn.dir].split(' ')[0] : '') + '</span>';
    if (S.mode === 'local') chips += '<span class="players">' + [0, 1].map(function (k) { var on = S.opt.variant === 'turns' ? S.player === k : S.round === k; return '<span class="chip' + (on ? ' on' : '') + '">Spieler ' + (k + 1) + ': ' + fmt(S.opt.variant === 'turns' ? S.scores[k] : k === 0 ? (S.round === 0 ? g.score : S.scores[0]) : (S.round === 1 ? g.score : 0)) + '</span>'; }).join('') + '</span>';
    if (S.mode === 'daily' && S.dailyGoal) chips += '<span class="chip' + (S.score() >= S.dailyGoal ? ' done' : '') + '">🎯 ' + fmt(S.dailyGoal) + '</span>';
    if (S.mode === 'zen' || S.mode === 'sprint' || S.mode === 'time' || S.mode === 'moves') chips += '<span class="chip">Brett ' + (S.boardNo + 1) + '</span>';
    if (g.def.stars && g.goals.length && S.mode !== 'puzzle') { var won = g.goalsMet(), n = g.starsFor(g.score, won); chips += '<span class="chip stars" aria-label="' + n + ' Sterne">' + stars(n) + '</span>'; }
    if (S.mode === 'puzzle') chips += '<span class="chip">Bestwert ' + ctx.puzzle.min + ' Züge · jetzt ' + g.movesUsed + '</span>';
    if (app.hudCache !== chips) { $('hudGoals').innerHTML = chips; app.hudCache = chips; }
  };
  function shortGoal(g) { return { clear: 'Leer', leave: 'Rest', score: 'Punkte', color: CPU.COLOR_SHORT[g.c] || 'Farbe', items: ['Sterne', 'Muscheln', 'Schlüssel', 'Edelsteine'][g.v || 0], ice: 'Eis', blocks: 'Blöcke', marks: 'Marker', groups: g.size + 'er' }[g.t] || ''; }

  U.dock = function (app) {
    var S = app.sess, g = S.game, p = app.store.p, h = '';
    if (S.allowBoosters()) BOOSTERS.forEach(function (b, k) {
      var n = p.boosters[b.id] || 0;
      h += '<button class="btn' + (app.armed === b.id ? ' armed' : '') + '" type="button" data-act="booster" data-arg="' + b.id + '" aria-label="' + b.name + ' (' + n + '), Taste ' + (k + 1) + '" aria-pressed="' + (app.armed === b.id) + '"' + (n ? '' : ' disabled') + '>' + ic(b.icon) + '<span class="lbl">' + n + '</span></button>';
    });
    if (S.allowHint()) h += '<button class="btn" type="button" data-act="hint" aria-label="Hinweis (H)">' + ic('hint') + '<span class="lbl">Tipp</span></button>';
    if (g.def.allowUndo) h += '<button class="btn" type="button" data-act="undo" aria-label="Rückgängig (U)"' + (S.canUndo() ? '' : ' disabled') + '>' + ic('undo') + '<span class="lbl">Zurück</span></button>';
    if (g.goals.length && S.mode !== 'puzzle') h += '<button class="btn go" type="button" data-act="finishRound" id="btnFinish"' + (g.goalsMet() && !g.over ? '' : ' disabled') + '>' + ic('flag') + '<span class="lbl">Abschließen</span></button>';
    if (S.mode === 'zen') h += '<button class="btn go" type="button" data-act="finishRound">' + ic('flag') + '<span class="lbl">Beenden</span></button>';
    if (app.dockCache !== h) { app.$('dock').innerHTML = h; app.dockCache = h; }
  };
  CPU.GRAV_TEXT = GRAV;
})(typeof window !== 'undefined' ? window : globalThis);
