/* Royal Radio Match 3D – Oberfläche: Titel, Hauptmenü, Levelkarte, Vorschau, HUD, Booster, Pause, Ergebnis, Shop,
 * Tagesbonus, Funkhaus, Bonuslevel, Duell (lokal / gegen KI), Einstellungen, Hilfe, Tutorials und Zwischenszenen.
 * Zurück-Taste (Android/Browser) über die History: jede Ebene ist ein History-Eintrag. */
(function (root) {
  'use strict';
  var RRM = root.RRM, D = document, LS = root.localStorage;
  var $ = function (id) { return D.getElementById(id); };
  var A = RRM.Audio, TX = RRM.Texts;
  var S, stage, board, tower, G = null;
  var ui, hudEl, barEl;

  // ---------- Hilfen ----------
  function save() { RRM.Save.store(LS, S); }
  function el(html) { var d = D.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; }
  function fmt(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function worldOf(n) { return Math.min(9, Math.floor((n - 1) / 20)); }
  function starsFree() { var spent = 0; S.tower.forEach(function (f) { spent += RRM.TOWER[f].cost; }); return RRM.Save.totalStars(S) - spent; }
  function bIcon(b, cls) { var src = iconFor('boost', b.id); return src ? '<img class="' + (cls || 'bi') + '" alt="" src="' + src + '">' : '<span class="' + (cls || 'bi') + '">' + b.icon + '</span>'; }
  function boosterDef(id) { for (var i = 0; i < RRM.BOOSTERS.length; i++) if (RRM.BOOSTERS[i].id === id) return RRM.BOOSTERS[i]; return null; }
  function today() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function toast(t) {
    var e = el('<div class="toast">' + t + '</div>'); D.body.appendChild(e);
    setTimeout(function () { e.classList.add('out'); }, 1600); setTimeout(function () { e.remove(); }, 2100);
  }
  function click() { A.play('click'); }

  // ---------- Ebenen + Zurück-Taste ----------
  var layers = [], hist = true, skip = false, after = null;
  function openLayer(l) {
    layers.push(l);
    if (hist) { try { history.pushState({ rrm: layers.length }, ''); } catch (e) { hist = false; } }
  }
  // Schließt Ebenen bis auf n übrig (n = Anzahl, die bleiben), dann cb
  function closeTo(n, cb) {
    var k = layers.length - n;
    if (k <= 0) { if (cb) cb(); return; }
    if (!hist) { while (layers.length > n) { var l = layers.pop(); l.close && l.close(); } if (cb) cb(); return; }
    skip = true; after = cb || null;
    history.go(-k);
  }
  function closeTop(cb) { closeTo(layers.length - 1, cb); }
  root.addEventListener('popstate', function (e) {
    var d = (e.state && e.state.rrm) || 0;
    if (!skip && layers.length === d + 1 && layers[d].guard) {   // z. B. im Spiel: Zurück öffnet die Pause statt das Level zu beenden
      try { history.pushState({ rrm: layers.length }, ''); } catch (er) {}
      layers[d].guard(); return;
    }
    skip = false;
    while (layers.length > d) { var l = layers.pop(); l.close && l.close(); }
    var cb = after; after = null; if (cb) cb();
  });
  function topName() { return layers.length ? layers[layers.length - 1].name : 'menu'; }

  // Modales Fenster als Ebene
  function modal(html, opt) {
    opt = opt || {};
    var m = el('<div class="modal' + (opt.cls ? ' ' + opt.cls : '') + '"><div class="sheet">' + html + '</div></div>');
    ui.appendChild(m);
    requestAnimationFrame(function () { m.classList.add('in'); });
    openLayer({ name: opt.name || 'modal', el: m, guard: opt.guard, close: function () { m.remove(); if (opt.onClose) opt.onClose(); } });
    m.addEventListener('click', function (e) {
      var b = e.target.closest('[data-a]');
      if (b && opt.on) { click(); opt.on(b.getAttribute('data-a'), b, m); }
      else if (e.target === m && opt.dismiss !== false) { click(); closeTop(); }
    });
    var f = m.querySelector('button'); if (f) setTimeout(function () { try { f.focus({ preventScroll: true }); } catch (er) {} }, 60);
    return m;
  }

  // ---------- Kopfzeile (Münzen/Sterne) ----------
  function pills() { return '<div class="pills"><span class="pill coin">🪙 <b>' + fmt(S.coins) + '</b></span><span class="pill star">⭐ <b>' + RRM.Save.totalStars(S) + '</b></span></div>'; }

  // ---------- Symbole (3D-Modelle als Bild) ----------
  function iconFor(type, a) {
    var MD = RRM.Models, mat = function () { return board.pmat; };
    try {
      switch (type) {
        case 'piece': return stage.icon('p' + a, function () { return MD.piece(a); }, mat, true);
        case 'crate': return stage.icon('crate', function () { return MD.crate(2); }, mat);
        case 'moss': return stage.icon('moss', function () { return MD.moss(); }, mat);
        case 'dusty': return stage.icon('dusty', function () { return MD.dusty(2); }, mat);
        case 'cable': return stage.icon('cable', function () { return MD.cable(2); }, mat);
        case 'switch': return stage.icon('switch', function () { return MD.switchBox(true); }, mat);
        case 'generator': return stage.icon('gen', function () { return MD.generator(0, 2, 4); }, mat);
        case 'amp': return stage.icon('amp', function () { return MD.amp(1); }, mat);
        case 'antenna': return stage.icon('antenna', function () { return MD.antenna(2); }, mat);
        case 'shield': return stage.icon('shield', function () { return MD.shield(3, 2); }, mat);
        case 'jammer': return stage.icon('jammer', function () { return MD.jammer(); }, mat);
        case 'rolling': return stage.icon('rolling', function () { return MD.rolling(); }, mat);
        case 'parcel': return stage.icon('parcel', function () { return MD.parcel(); }, mat);
        case 'cassette': return stage.icon('cassette', function () { return MD.cassette(); }, mat);
        case 'orb': return stage.icon('orb', function () { return MD.orb(); }, function () { return board.mat.glow; });
        case 'boost': return stage.icon('b' + a, function () { return MD.boostIcon(a); }, function () { return a === 'preBomb' || a === 'preOrb' ? board.mat.glow : board.pmat; }, true);
        case 'ice': return stage.icon('ice', function () { var g = new THREE.Group(); g.add(new THREE.Mesh(MD.piece(1), board.pmat)); g.add(new THREE.Mesh(MD.shared().ice, board.mat.ice2)); return g; });
      }
    } catch (e) { /* Symbol ist nur Zierde */ }
    return '';
  }
  var EMO = { noise: '📶', score: '⭐', combo: '🔥', specials: '✨' };
  function goalInfo(g) {
    var B = RRM.BLOCKERS;
    switch (g.type) {
      case 'collect': return { img: iconFor('piece', g.k), label: RRM.PIECES[g.k].plural };
      case 'clear': return { img: g.what === 'noise' ? '' : iconFor(g.what), emo: EMO[g.what], label: (B[g.what] || {}).plural || g.what };
      case 'deliver': return { img: iconFor(g.what), label: B[g.what].plural };
      case 'score': return { emo: EMO.score, label: 'Punkte' };
      case 'specials': return { img: iconFor('orb'), label: 'Spezialteile' };
      case 'combo': return { emo: EMO.combo, label: 'Combo' };
    }
    return { label: '?' };
  }
  function goalChip(g, eng) {
    var info = goalInfo(g), left = eng ? eng.goalLeft(g) : (g.type === 'clear' ? (g.n || '') : g.n);
    if (g.type === 'combo') left = eng ? (eng.goalLeft(g) > 0 ? g.n + 'er' : 0) : g.n + 'er';
    var done = eng && eng.goalLeft(g) <= 0;
    return '<div class="goal' + (done ? ' done' : '') + '" title="' + info.label + '">' + (info.img ? '<img alt="" src="' + info.img + '">' : '<span class="emo">' + (info.emo || '•') + '</span>') +
      '<b>' + (done ? '✓' : (g.type === 'score' ? fmt(left) : left)) + '</b></div>';
  }
  function goalText(g) {
    var info = goalInfo(g);
    switch (g.type) {
      case 'collect': return g.n + ' ' + info.label + ' sammeln';
      case 'clear': return 'Alle ' + info.label + ' räumen';
      case 'deliver': return g.n + ' ' + info.label + ' nach unten bringen';
      case 'score': return fmt(g.n) + ' Punkte erreichen';
      case 'specials': return g.n + ' Spezialteile bauen';
      case 'combo': return 'Eine ' + g.n + 'er-Combo schaffen';
    }
    return '';
  }

  // ---------- Titel ----------
  function showTitle() {
    var t = el('<div class="screen title" id="title"><div class="logo"><span>ROYAL RADIO</span><b>MATCH 3D</b></div><p class="slogan">Triff den Beat. Räume die Frequenzen frei!</p>' +
      '<div class="chars">' + TX.RAY + TX.MIRA + '</div><button class="btn gold big" id="tStart">▶ Antippen zum Starten</button><p class="small">Ton startet erst nach dem Antippen.</p></div>');
    ui.appendChild(t);
    $('tStart').onclick = function () {
      A.unlock(); A.set('sfx', S.set.sfx); A.set('music', S.set.music); click();
      t.remove(); showMenu();
    };
  }

  // ---------- Hauptmenü ----------
  function showMenu() {
    stage.show(tower); tower.reduced = S.set.reduced; tower.setFocus(-1); tower.build(S.tower);
    A.music(worldOf(Math.min(S.unlocked, 200)));
    var old = $('menu'); if (old) old.remove();
    var n = Math.min(S.unlocked, RRM.MAX_LEVEL), dailyReady = S.daily !== today();
    // Aufbau wie bei Royal Match: Kopfband, Gebäude in der Mitte, Seitenknöpfe, großer Level-Knopf, Leiste unten
    var m = el('<div class="screen menu" id="menu">' +
      '<div class="topbar"><div class="face">' + TX.RAY + '</div>' + pills() + '<button class="rbtn" data-a="settings" aria-label="Optionen">⚙️</button></div>' +
      '<div class="logo sm"><span>ROYAL RADIO</span><b>MATCH 3D</b></div>' +
      '<div class="side l"><button class="sbtn' + (dailyReady ? ' glow' : '') + '" data-a="daily"><i>🎁</i><small>Tagesbonus</small>' + (dailyReady ? '<em class="dot"></em>' : '') + '</button></div>' +
      '<div class="side r"><button class="sbtn" data-a="help"><i>❓</i><small>Hilfe</small></button></div>' +
      '<button class="btn gold big play" data-a="play">Level ' + n + '</button>' +
      '<nav class="nav"><button data-a="shop"><i>🛒</i><small>Shop</small></button><button data-a="duel"><i>⚔️</i><small>Duell</small></button>' +
      '<button class="home" data-a="map"><i>🗺️</i><small>Karte</small></button><button data-a="tower"><i>🏰</i><small>Funkhaus</small></button>' +
      '<button data-a="bonus"><i>🎧</i><small>Bonus</small></button></nav></div>');
    ui.appendChild(m);
    m.addEventListener('click', function (e) {
      var b = e.target.closest('[data-a]'); if (!b) return; click();
      var a = b.getAttribute('data-a');
      if (a === 'play') preview(n);
      else if (a === 'map') showMap();
      else if (a === 'tower') showTower();
      else if (a === 'bonus') showBonus();
      else if (a === 'duel') showDuelMenu();
      else if (a === 'shop') showShop();
      else if (a === 'daily') showDaily();
      else if (a === 'help') showHelp();
      else if (a === 'settings') showSettings();
    });
  }
  function refreshMenu() { if ($('menu')) showMenu(); }

  // ---------- Levelkarte ----------
  function showMap() {
    stage.show(null);
    var cur = Math.min(S.unlocked, RRM.MAX_LEVEL), html = '<div class="screen map" id="map"><div class="mapbar"><button class="btn icon" data-a="back" aria-label="Zurück">←</button><h2>Levelkarte</h2>' + pills() + '</div><div class="mapscroll" id="mapscroll">';
    for (var w = 0; w < 10; w++) {
      var W = RRM.WORLDS[w], sky = '#' + W.sky.toString(16).padStart(6, '0'), acc = '#' + W.accent.toString(16).padStart(6, '0');
      var open = S.unlocked > w * 20;
      html += '<section class="world' + (open ? '' : ' locked') + '" style="--sky:' + sky + ';--acc:' + acc + '"><header><small>Welt ' + (w + 1) + '</small><b>' + W.name + '</b>' + (open ? '' : '<i>🔒</i>') + '</header><div class="path">';
      for (var j = 1; j <= 20; j++) {
        var n = w * 20 + j, L = RRM.LEVELS[n - 1], st = S.stars[n] || 0, lock = n > S.unlocked;
        var off = Math.round(Math.sin(n * 0.9) * 32);
        html += '<button class="node' + (lock ? ' lock' : '') + (n === cur ? ' cur' : '') + (L.tag === 'special' ? ' special' : '') + (L.tag === 'final' ? ' final' : '') + (L.diff === 'hard' ? ' hard' : '') +
          '" style="--off:' + off + 'px" data-n="' + n + '" aria-label="Level ' + n + (lock ? ' gesperrt' : '') + '">' +
          '<span>' + (lock ? '🔒' : n) + '</span>' + (L.tag === 'final' ? '<em>👑</em>' : L.tag === 'special' ? '<em>🎙️</em>' : '') +
          '<i class="st">' + (lock ? '' : '★★★'.slice(0, st) + '<u>' + '★★★'.slice(st) + '</u>') + '</i></button>';
      }
      html += '</div></section>';
    }
    html += '</div></div>';
    var m = el(html); ui.appendChild(m);
    var mm = $('menu'); if (mm) mm.style.display = 'none';
    openLayer({ name: 'map', el: m, close: function () { m.remove(); if ($('menu')) { $('menu').style.display = ''; stage.show(tower); } } });
    m.addEventListener('click', function (e) {
      var b = e.target.closest('[data-a]'); if (b) { click(); closeTop(); return; }
      var nd = e.target.closest('.node'); if (!nd) return;
      click();
      var n = +nd.getAttribute('data-n');
      if (n > S.unlocked) { toast('Erst Level ' + S.unlocked + ' schaffen!'); return; }
      preview(n);
    });
    var c = m.querySelector('.node.cur');
    if (c) setTimeout(function () { c.scrollIntoView({ block: 'center' }); }, 30);
  }

  // ---------- Level-Vorschau ----------
  function preview(n) {
    var L = RRM.LEVELS[n - 1]; if (!L) return;
    var pre = {}, diff = L.diff === 'boss' ? '<span class="tag boss">👑 Welt-Finale</span>' : L.diff === 'hard' ? '<span class="tag hard">🔥 Schwer</span>' : L.tag === 'special' ? '<span class="tag special">🎙️ Spezial</span>' : '';
    function preHtml() {
      return RRM.BOOSTERS.filter(function (b) { return b.pre && !b.hidden; }).map(function (b) {
        var lock = S.unlocked < b.unlock && n < b.unlock, cnt = S.inv[b.id] || 0;
        return '<button class="pre' + (pre[b.id] ? ' on' : '') + (lock ? ' lock' : '') + '" data-a="pre" data-id="' + b.id + '" aria-pressed="' + !!pre[b.id] + '" aria-label="' + b.name + '" title="' + b.name + ': ' + b.desc + '">' +
          bIcon(b) + (lock ? '<i class="lk">🔒</i><b class="lv">' + b.unlock + '</b>' : pre[b.id] ? '<b class="ok">✓</b>' : cnt > 0 ? '<b class="cnt">' + cnt + '</b>' : '<b class="price">🪙' + b.price + '</b>') + '</button>';
      }).join('');
    }
    var m = modal('<button class="xbtn corner" data-a="close" aria-label="Zurück">✕</button><h2>Level ' + n + '</h2>' + diff + '<p class="wname">' + RRM.WORLDS[worldOf(n)].name + '</p>' +
      '<div class="panel"><h3>Ziele</h3><div class="goals big">' + L.goals.map(function (g) { return goalChip(g, null); }).join('') + '</div>' +
      '<ul class="glist">' + L.goals.map(function (g) { return '<li>' + goalText(g) + '</li>'; }).join('') + '</ul>' +
      '<p class="moves">' + L.moves + ' Züge' + (S.stars[n] ? ' · Bestwert ' + '★★★'.slice(0, S.stars[n]) : '') + '</p></div>' +
      '<div class="panel"><h3>Booster wählen</h3><div class="pres" id="pres">' + preHtml() + '</div></div>' +
      '<button class="btn gold big wide" data-a="go">Spielen</button>', {
      name: 'preview',
      on: function (a, b) {
        if (a === 'close') closeTop();
        else if (a === 'pre') {
          var id = b.getAttribute('data-id'), bd = boosterDef(id);
          if (S.unlocked < bd.unlock && n < bd.unlock) { toast(bd.name + ' gibt es ab Level ' + bd.unlock); return; }
          if (!pre[id] && !(S.inv[id] > 0)) {
            if (S.coins < bd.price) { toast('Nicht genug Münzen'); return; }
            S.coins -= bd.price; S.inv[id] = (S.inv[id] || 0) + 1; save(); A.play('coin'); toast(bd.name + ' gekauft');
          }
          pre[id] = !pre[id];
          $('pres').innerHTML = preHtml();
        } else if (a === 'go') {
          var list = [];
          Object.keys(pre).forEach(function (id) { if (pre[id] && S.inv[id] > 0) { S.inv[id]--; list.push(id); } });
          save();
          closeTop(function () { startLevel(L, 'level', list); });
        }
      }
    });
    void m;
  }

  // ---------- Spiel ----------
  function preSpecials(ids) {
    var out = [];
    ids.forEach(function (id) { if (id === 'preRocket') out.push('rocket'); if (id === 'preBomb') out.push('bomb'); if (id === 'preOrb') out.push('orb'); if (id === 'preSuper') out.push('rocket', 'bomb'); });
    return out;
  }
  function startLevel(def, mode, preIds, duel) {
    var w = mode === 'duel' ? (duel.world || 0) : RRM.WORLDS.findIndex(function (x) { return x.id === def.world; });
    if (w < 0) w = 0;
    // Zwischenszene beim ersten Betreten einer Welt
    if (mode === 'level' && (def.id - 1) % 20 === 0 && S.seen.indexOf('w' + w + 'a') < 0) {
      S.seen.push('w' + w + 'a'); save();
      return cutscene([RRM.WORLDS[w].story[0]], w, function () { startLevel(def, mode, preIds, duel); });
    }
    var eng;
    try { eng = new RRM.Engine(def, { pre: preSpecials(preIds || []) }); } catch (e) { toast('Level konnte nicht geladen werden'); return; }
    G = { def: def, mode: mode, eng: eng, world: w, pre: preIds || [], sel: -1, cur: -1, pending: null, target: -1, lock: false, continues: 0, idle: 0, duel: duel || null, time: def.time || 0 };
    ['menu', 'map'].forEach(function (id) { var e = $(id); if (e) e.style.display = 'none'; });
    stage.show(board);
    board.setOptions(S.set);
    board.load(eng, w);
    D.body.style.setProperty('--sky', '#' + RRM.WORLDS[w].sky.toString(16).padStart(6, '0'));
    D.body.classList.add('ingame');
    buildHud();
    A.music(w);
    openLayer({ name: 'game', guard: function () { if (!G || G.eng.status === 'play') openPause(); }, close: leaveGame });
    if (mode === 'level' && def.tut && !S.tut[def.tut] && TX.TUT[def.tut]) { S.tut[def.tut] = 1; save(); showTut(def.tut); }
    else if (duel) duelTurnBanner();
    if (G.time) startTimer();
    hintLoop();
  }
  function leaveGame() {
    if (!G) return;
    stopTimer();
    G = null;
    D.body.classList.remove('ingame');
    if (hudEl) { hudEl.remove(); barEl.remove(); hudEl = barEl = null; }
    var bn = $('banner'); if (bn) bn.remove();
    var mp = $('map');
    if (mp) { mp.style.display = ''; stage.show(null); refreshMapNodes(); }
    else if ($('menu')) { $('menu').style.display = ''; showMenu(); }
    else showMenu();
  }
  function refreshMapNodes() {
    var nodes = D.querySelectorAll('#map .node');
    for (var i = 0; i < nodes.length; i++) {
      var nd = nodes[i], n = +nd.getAttribute('data-n'), st = S.stars[n] || 0, lock = n > S.unlocked;
      nd.classList.toggle('lock', lock); nd.classList.toggle('cur', n === Math.min(S.unlocked, 200));
      nd.querySelector('span').textContent = lock ? '🔒' : n;
      nd.querySelector('.st').innerHTML = lock ? '' : '★★★'.slice(0, st) + '<u>' + '★★★'.slice(st) + '</u>';
    }
    D.querySelectorAll('#map .world').forEach(function (s, w) { s.classList.toggle('locked', S.unlocked <= w * 20); });
    var p = D.querySelector('#map .pills'); if (p) p.outerHTML = pills();
  }

  function buildHud() {
    if (hudEl) { hudEl.remove(); barEl.remove(); }
    var duel = G.duel;
    hudEl = el('<div id="hud"><div class="hband"><div class="face">' + TX.RAY + '</div>' +
      (duel ? '<div class="duelbox"><div class="pl" id="p0"><small>' + duel.names[0] + '</small><b>0</b></div><div class="vs">VS</div><div class="pl" id="p1"><small>' + duel.names[1] + '</small><b>0</b></div></div>'
        : '<div class="goalbox"><small class="tab" id="lvl"></small><div class="goals" id="goals"></div></div>') +
      '<div class="movebox"><small class="tab" id="mvl">' + (G.time ? 'Zeit' : 'Züge') + '</small><b id="mv"></b><small id="sc"></small></div></div></div>');
    barEl = el('<div id="bar"></div>');
    ui.appendChild(hudEl); ui.appendChild(barEl);
    barEl.onclick = function (e) {
      if (e.target.closest('#bPause')) { click(); if (topName() === 'game') openPause(); return; }
      var b = e.target.closest('.boost'); if (b) { click(); boosterTap(b.getAttribute('data-id')); }
    };
    renderBar();
    updateHud();
    requestAnimationFrame(measure);
  }
  function measure() {
    if (!hudEl) return;
    var t = hudEl.getBoundingClientRect().bottom + 8, b = root.innerHeight - barEl.getBoundingClientRect().top + 8;
    board.setInsets(t, b);
  }
  root.addEventListener('resize', function () { setTimeout(measure, 50); });

  function renderBar() {
    if (!barEl) return;
    var pause = '<button class="rbtn" id="bPause" aria-label="Pause">❚❚</button>';
    if (G.duel) { barEl.innerHTML = '<div class="duelinfo" id="duelinfo"></div>' + pause; return; }
    barEl.innerHTML = '<div class="boosts">' + RRM.BOOSTERS.filter(function (b) { return !b.pre && !b.hidden; }).map(function (b) {
      var lock = S.unlocked < b.unlock, cnt = S.inv[b.id] || 0;
      return '<button class="boost' + (lock ? ' lock' : '') + (G.pending === b.id ? ' on' : '') + '" data-id="' + b.id + '" aria-label="' + b.name + (lock ? ' (ab Level ' + b.unlock + ')' : '') + '" title="' + b.name + ': ' + b.desc + '">' +
        bIcon(b) + (lock ? '<i class="lk">🔒</i><b class="lv">' + b.unlock + '</b>' : cnt > 0 ? '<b class="cnt">' + cnt + '</b>' : '<b class="plus">+</b>') + '</button>';
    }).join('') + '</div>' + pause;
  }
  function updateHud() {
    if (!G || !hudEl) return;
    var e = G.eng;
    if (G.duel) {
      $('p0').querySelector('b').textContent = fmt(G.duel.score[0]); $('p1').querySelector('b').textContent = fmt(G.duel.score[1]);
      $('p0').classList.toggle('turn', G.duel.turn === 0); $('p1').classList.toggle('turn', G.duel.turn === 1);
      $('mv').textContent = Math.ceil(e.moves / 2); $('sc').textContent = 'je Spieler';
      var di = $('duelinfo'); if (di) di.textContent = e.moves > 0 ? turnText(G.duel.names[G.duel.turn]) : 'Fertig!';
      return;
    }
    $('lvl').textContent = G.mode === 'bonus' ? 'Bonus ' + G.def.id : 'Level ' + G.def.id;
    $('goals').innerHTML = e.goals.map(function (g) { return goalChip(g, e); }).join('');
    $('mv').textContent = G.time ? Math.ceil(G.time) : e.moves;
    $('mv').classList.toggle('low', G.time ? G.time <= 10 : e.moves <= 3);
    $('sc').textContent = fmt(e.score);
  }

  // Ereignisse der Engine abspielen
  function take() { var ev = G.eng.ev.slice(); G.eng.ev.length = 0; return ev; }
  function playEvents(done) {
    G.lock = true;
    var evs = take();
    board.play(evs, function () { if (!G) return; G.lock = false; updateHud(); if (done) done(); });
  }
  function canAct() { return G && G.eng.status === 'play' && !G.lock && !board.busy() && topName() === 'game' && !(G.duel && G.duel.ai === G.duel.turn); }

  function doSwap(a, b) {
    if (!canAct()) return;
    board.stopHint(); G.idle = 0;
    G.sel = -1; board.select(-1);
    var r = G.eng.swap(a, b);
    if (!r.ok && r.reason !== 'nomatch') { A.play('bad'); take(); return; }
    playEvents(r.ok ? afterMove : null);
  }
  function afterMove() {
    if (!G) return;
    if (G.duel) return duelAfter();
    renderBar();
    checkEnd();
  }
  function checkEnd() {
    var e = G.eng;
    if (e.status === 'won') { G.lock = true; setTimeout(win, 350); }
    else if (e.status === 'lost') { G.lock = true; setTimeout(lose, 350); }
  }

  // Eingabe: Tippen, Wischen, Tastatur
  var down = null;
  function bindInput() {
    var cv = $('gl');
    cv.addEventListener('pointerdown', function (e) {
      if (!G || topName() !== 'game') return;
      A.unlock();
      var i = board.pick(e.clientX, e.clientY);
      if (i < 0) return;
      if (G.pending) { targetTap(i); return; }
      if (!canAct()) return;
      down = { i: i, x: e.clientX, y: e.clientY, id: e.pointerId, moved: false };
      try { cv.setPointerCapture(e.pointerId); } catch (er) {}
      G.idle = 0; board.stopHint();
      if (G.sel >= 0 && G.sel !== i && G.eng.adjacent(G.sel, i)) { var s = G.sel; down = null; doSwap(s, i); return; }
      if (G.eng.movable(i)) { G.sel = i; board.select(i); }
      else { G.sel = -1; board.select(-1); }
    });
    cv.addEventListener('pointermove', function (e) {
      if (!down || down.moved || !G) return;
      var dx = e.clientX - down.x, dy = e.clientY - down.y, th = Math.max(14, Math.min(root.innerWidth, root.innerHeight) / 40);
      if (Math.abs(dx) < th && Math.abs(dy) < th) return;
      down.moved = true;
      var W = G.eng.W, i = down.i, x = i % W, j = -1;
      if (Math.abs(dx) > Math.abs(dy)) j = dx > 0 ? (x < W - 1 ? i + 1 : -1) : (x > 0 ? i - 1 : -1);
      else j = dy > 0 ? i + W : i - W;
      if (j >= 0 && j < G.eng.cells.length && G.eng.cells[j]) doSwap(i, j);
      down = null;
    });
    var up = function () { down = null; };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    D.addEventListener('keydown', onKey);
    D.addEventListener('visibilitychange', function () {
      if (D.hidden) { A.pause(); if (G && topName() === 'game' && G.eng.status === 'play' && !G.duel) openPause(); }
      else A.resume();
    });
  }
  function onKey(e) {
    if (e.key === 'Escape' || e.key === 'Backspace') {
      if (layers.length) { e.preventDefault(); var top = layers[layers.length - 1]; if (top.guard) top.guard(); else closeTop(); }
      return;
    }
    if (!G || topName() !== 'game') return;
    var W = G.eng.W, H = G.eng.H, c = G.cur >= 0 ? G.cur : Math.floor(H / 2) * W + Math.floor(W / 2);
    var mv = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -W, ArrowDown: W }[e.key];
    if (mv !== undefined) {
      e.preventDefault();
      var x = c % W, n = c + mv;
      if ((mv === -1 && x === 0) || (mv === 1 && x === W - 1) || n < 0 || n >= W * H) return;
      if (G.sel >= 0 && !G.pending && G.eng.adjacent(G.sel, n) && G.sel === c) { doSwap(c, n); G.cur = n; board.setTarget(n); return; }
      G.cur = n; board.setTarget(n); return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (G.cur < 0) { G.cur = c; board.setTarget(c); return; }
      if (G.pending) { targetTap(G.cur); return; }
      if (!canAct()) return;
      if (G.sel >= 0 && G.sel !== G.cur && G.eng.adjacent(G.sel, G.cur)) doSwap(G.sel, G.cur);
      else if (G.eng.movable(G.cur)) { G.sel = G.cur === G.sel ? -1 : G.cur; board.select(G.sel); }
    }
  }

  // ---------- Booster ----------
  function boosterTap(id) {
    if (!G || G.eng.status !== 'play' || G.lock) return;
    var b = boosterDef(id);
    if (S.unlocked < b.unlock) { toast(b.name + ' gibt es ab Level ' + b.unlock); return; }
    if (G.pending === id) { cancelPending(); return; }
    if (!(S.inv[id] > 0)) {
      modal('<h2>' + b.name + '</h2>' + bIcon(b, 'bimg') + '<p>' + b.desc + '</p><p>Du hast keinen mehr. Für <b>🪙 ' + b.price + '</b> kaufen?</p><p class="small">Dein Guthaben: 🪙 ' + fmt(S.coins) + '</p>' +
        '<div class="row"><button class="btn" data-a="no">Nein</button><button class="btn gold" data-a="buy"' + (S.coins < b.price ? ' disabled' : '') + '>Kaufen</button></div>', {
        on: function (a) {
          if (a === 'no') closeTop();
          if (a === 'buy' && S.coins >= b.price) { S.coins -= b.price; S.inv[id] = (S.inv[id] || 0) + 1; save(); A.play('coin'); closeTop(function () { renderBar(); boosterTap(id); }); }
        }
      });
      return;
    }
    if (id === 'boost' && G.eng.amped) { toast('Verstärker ist schon aktiv'); return; }
    if (b.cell) {
      G.pending = id; G.target = -1; G.sel = -1; board.select(-1); board.setTarget(-1);
      renderBar(); banner(b);
      return;
    }
    if (board.busy()) return;
    if (G.pending) cancelPending();
    useBooster(id, null);
  }
  function targetTap(i) {
    if (G.lock || board.busy()) return;
    var id = G.pending, b = boosterDef(id);
    cancelPending();
    if (!useBooster(id, i) && G && G.eng.status === 'play') { G.pending = id; renderBar(); banner(b); }   // falsches Feld: Booster bleibt gewählt
  }
  function cancelPending() { if (!G) return; G.pending = null; G.target = -1; board.setTarget(G.cur); var bn = $('banner'); if (bn) bn.remove(); renderBar(); }
  // Hinweisband oben (wie bei Royal Match): Name, Wirkung, Abbrechen
  function banner(b) {
    var bn = $('banner'); if (bn) bn.remove();
    bn = el('<div id="banner" role="status">' + bIcon(b) + '<div><b>' + b.name + '</b><small>' + b.desc + ' Tippe auf ein Feld.</small></div><button class="xbtn" data-a="x" aria-label="Abbrechen">✕</button></div>');
    ui.appendChild(bn);
    bn.onclick = function (e) { if (e.target.closest('[data-a=x]')) { click(); cancelPending(); } };
  }
  function useBooster(id, target) {
    if (!G) return;
    var r = G.eng.useBooster(id, target);
    if (!r.ok) { toast(r.reason === 'target' ? 'Dieses Feld geht nicht' : 'Gerade nicht möglich'); take(); return false; }
    S.inv[id]--; save();
    A.play('booster');
    board.stopHint(); G.idle = 0;
    renderBar();
    playEvents(function () { renderBar(); checkEnd(); });
    return true;
  }

  // ---------- Hinweis ----------
  var hintTimer = 0;
  function hintLoop() {
    clearInterval(hintTimer);
    hintTimer = setInterval(function () {
      if (!G) { clearInterval(hintTimer); return; }
      if (!canAct()) { G.idle = 0; return; }
      if (++G.idle === 7) { var m = G.eng.bestMove(); if (m) board.hint(m); }
    }, 1000);
  }

  // ---------- Zeitlimit (Bonuslevel) ----------
  var timer = 0;
  function startTimer() {
    stopTimer();
    var last = performance.now();
    timer = setInterval(function () {
      var now = performance.now(), dt = (now - last) / 1000; last = now;
      if (!G || !G.def.time) return stopTimer();
      if (topName() !== 'game' || G.eng.status !== 'play' || D.hidden) return;
      G.time = Math.max(0, G.time - dt);
      $('mv').textContent = Math.ceil(G.time); $('mv').classList.toggle('low', G.time <= 10);
      if (G.time <= 0 && !G.lock && !board.busy()) { G.eng.status = 'lost'; G.timeout = true; G.lock = true; setTimeout(lose, 200); }
    }, 250);
  }
  function stopTimer() { clearInterval(timer); timer = 0; }

  // ---------- Punkte-Popups ----------
  var hooks = {
    onWave: function (ev) {
      if (!ev.removed.length || !G) return;
      var sx = 0, sy = 0;
      ev.removed.forEach(function (r) { var p = board.screen(r.i, 0.8); sx += p.x; sy += p.y; });
      sx /= ev.removed.length; sy /= ev.removed.length;
      var e = el('<div class="pop">+' + ev.gain + '</div>'); e.style.left = sx + 'px'; e.style.top = sy + 'px'; ui.appendChild(e);
      setTimeout(function () { e.remove(); }, 900);
      if (ev.combo === 3 || ev.combo === 5 || ev.combo === 7) say(['', '', '', 'Super!', '', 'Mega!', '', 'Royal!'][ev.combo]);
    }
  };
  function say(t) {
    var e = el('<div class="say">' + t + '</div>'); ui.appendChild(e);
    setTimeout(function () { e.remove(); }, 1200);
  }

  // ---------- Pause ----------
  function openPause() {
    if (!G || topName() !== 'game') return;
    modal('<h2>Pause</h2><p class="small">' + (G.duel ? 'Duell' : G.mode === 'bonus' ? 'Bonuslevel ' + G.def.id : 'Level ' + G.def.id) + '</p>' +
      (G.duel ? '' : '<div class="goals big">' + G.eng.goals.map(function (g) { return goalChip(g, G.eng); }).join('') + '</div>') +
      '<div class="col"><button class="btn gold big" data-a="go">▶ Weiter</button><button class="btn" data-a="restart">↻ Neu starten</button>' +
      '<button class="btn" data-a="settings">⚙️ Optionen</button><button class="btn" data-a="help">❓ Hilfe</button><button class="btn" data-a="quit">🚪 Level verlassen</button></div>', {
      name: 'pause', dismiss: true,
      on: function (a) {
        if (a === 'go') closeTop();
        else if (a === 'settings') showSettings();
        else if (a === 'help') showHelp();
        else if (a === 'restart') confirmBox('Level neu starten? Der Versuch zählt als verloren.', function () { restart(); });
        else if (a === 'quit') confirmBox('Level wirklich verlassen?', function () { quitGame(); });
      }
    });
  }
  function confirmBox(text, yes) {
    modal('<p>' + text + '</p><div class="row"><button class="btn" data-a="no">Nein</button><button class="btn gold" data-a="yes">Ja</button></div>', {
      on: function (a) { if (a === 'no') closeTop(); else closeTop(yes); }
    });
  }
  function gameIndex() { for (var i = layers.length - 1; i >= 0; i--) if (layers[i].name === 'game') return i; return -1; }
  function quitGame(cb) { var gi = gameIndex(); if (gi < 0) { if (cb) cb(); return; } closeTo(gi, cb); }
  function restart() {
    if (!G) return;
    var def = G.def, mode = G.mode, duel = G.duel;
    quitGame(function () {
      if (mode === 'duel') startDuel(duel.ai >= 0, duel.level);
      else if (mode === 'bonus') startLevel(def, 'bonus', []);
      else preview(def.id);
    });
  }

  // ---------- Ergebnis ----------
  function coinReward(def, stars, first) {
    var c = 15 + stars * 10;
    if (def.tag === 'special') c += 20;
    if (def.tag === 'final') c += 60;
    if (first) c += 25;
    return c;
  }
  function win() {
    if (!G) return;
    var e = G.eng, def = G.def, bonusMode = G.mode === 'bonus';
    var stars = e.stars(), extra = e.endBonus();
    if (bonusMode && def.time) stars = G.time / def.time >= 0.4 ? 3 : G.time / def.time >= 0.2 ? 2 : 1;
    var score = e.score + extra, first, coins;
    if (bonusMode) {
      var bn = +String(def.id).slice(1); first = !S.bonus[bn];
      S.bonus[bn] = Math.max(S.bonus[bn] || 0, stars);
      coins = 30 + stars * 15;
    } else {
      first = !S.stars[def.id];
      S.stars[def.id] = Math.max(S.stars[def.id] || 0, stars);
      S.best[def.id] = Math.max(S.best[def.id] || 0, score);
      if (def.id >= S.unlocked && def.id < RRM.MAX_LEVEL) S.unlocked = def.id + 1;
      if (def.id === RRM.MAX_LEVEL) S.unlocked = RRM.MAX_LEVEL;
      S.cur = Math.min(S.unlocked, RRM.MAX_LEVEL);
      coins = coinReward(def, stars, first);
    }
    S.coins += coins;
    save();
    A.play('win');
    var lines = ['Sauber gemischt!', 'Das Signal ist glasklar!', 'Was für ein Hit!', 'On Air – und alle hören zu!'];
    var m = modal('<div class="result win"><h2>' + (bonusMode ? 'Bonus geschafft!' : 'Level ' + def.id + ' geschafft!') + '</h2><div class="stars" id="rs"><i>★</i><i>★</i><i>★</i></div>' +
      '<p class="score">' + fmt(score) + ' Punkte' + (extra ? ' <small>(+' + fmt(extra) + ' Zugbonus)</small>' : '') + '</p><p class="coins">🪙 +' + coins + '</p>' +
      '<div class="speech">' + TX.MIRA + '<span>' + lines[((typeof def.id === 'number' ? def.id : 0) + stars) % lines.length] + '</span></div>' +
      '<div class="row"><button class="btn" data-a="map">' + (bonusMode ? 'Bonus-Studio' : 'Karte') + '</button>' + (bonusMode || def.id >= RRM.MAX_LEVEL ? '' : '<button class="btn gold big" data-a="next">▶ Weiter</button>') + '</div></div>', {
      name: 'result', dismiss: false,
      guard: function () { /* Zurück schließt das Ergebnis nicht versehentlich */ },
      on: function (a) {
        if (a === 'map') quitGame(function () { if (bonusMode) showBonus(); else if (!$('map')) showMap(); afterWorld(def); });
        if (a === 'next') quitGame(function () { afterWorld(def, function () { preview(def.id + 1); }); });
      }
    });
    var st = m.querySelectorAll('#rs i');
    for (var i = 0; i < stars; i++) (function (k) { setTimeout(function () { st[k].classList.add('on'); A.play('star', k); }, 300 + k * 320); })(i);
  }
  // Nach einem Welt-Finale: Abschluss-Szene (einmalig)
  function afterWorld(def, cb) {
    if (typeof def.id !== 'number' || def.id % 20 !== 0) { if (cb) cb(); return; }
    var w = def.id / 20 - 1, key = 'w' + w + 'b';
    if (S.seen.indexOf(key) >= 0) { if (cb) cb(); return; }
    S.seen.push(key); save();
    var lines = [RRM.WORLDS[w].story[1], 'RAY: „Im Funkhaus wartet ein neuer Abschnitt auf dich – bau ihn mit deinen Sternen aus!“'];
    if (def.id === RRM.MAX_LEVEL) lines.push('RAY: „Der Störsender ist aus. Royal Radio sendet wieder überall – dank dir!“');
    cutscene(lines, w, cb);
  }
  function lose() {
    if (!G) return;
    var e = G.eng, cost = 600 * (G.continues + 1), can = !e.stuck && !G.timeout && !G.duel && G.continues < 2;
    A.play('lose');
    var why = G.timeout ? 'Die Zeit ist abgelaufen.' : e.stuck ? 'Das Brett ist blockiert.' : 'Keine Züge mehr.';
    modal('<div class="result lose"><h2>Fast geschafft!</h2><p>' + why + '</p><div class="goals big">' + e.goals.map(function (g) { return goalChip(g, e); }).join('') + '</div>' +
      '<div class="speech">' + TX.RAY + '<span>Nicht aufgeben – ein paar Züge mehr und das Signal steht!</span></div>' +
      (can ? '<button class="btn gold big" data-a="more"' + (S.coins < cost ? ' disabled' : '') + '>+5 Züge für 🪙 ' + fmt(cost) + '</button>' + (S.coins < cost ? '<p class="small">Münzen gibt es fürs Spielen und im Tagesbonus.</p>' : '') : '') +
      '<div class="row"><button class="btn" data-a="map">' + (G.mode === 'bonus' ? 'Bonus-Studio' : 'Karte') + '</button><button class="btn" data-a="retry">↻ Nochmal</button></div></div>', {
      name: 'result', dismiss: false, guard: function () {},
      on: function (a) {
        if (a === 'more' && S.coins >= cost && G) {
          S.coins -= cost; save(); A.play('coin');
          G.continues++;
          closeTop(function () { if (!G) return; G.eng.addMoves(5); toast('+5 Züge!'); playEvents(function () { renderBar(); checkEnd(); }); });
        }
        if (a === 'map') { var bm = G.mode === 'bonus'; quitGame(function () { if (bm) showBonus(); else if (!$('map')) showMap(); }); }
        if (a === 'retry') restart();
      }
    });
  }

  // ---------- Tutorial & Zwischenszenen ----------
  function showTut(key) {
    var steps = TX.TUT[key], i = 0;
    var m = modal('<div class="tut"><div class="speech">' + TX.RAY + '<span id="tutt"></span></div><div class="dots" id="tutd"></div><div class="row"><button class="btn" data-a="skip">Überspringen</button><button class="btn gold" data-a="next" id="tutn">Weiter</button></div></div>', {
      name: 'tut', cls: 'low',
      on: function (a) {
        if (a === 'skip' || i >= steps.length - 1) { closeTop(); return; }
        i++; render();
      }
    });
    function render() {
      m.querySelector('#tutt').textContent = steps[i];
      m.querySelector('#tutd').innerHTML = steps.map(function (s, k) { return '<i class="' + (k === i ? 'on' : '') + '"></i>'; }).join('');
      m.querySelector('#tutn').textContent = i >= steps.length - 1 ? 'Los geht’s!' : 'Weiter';
    }
    render();
  }
  function cutscene(lines, w, cb) {
    var i = 0, fired = false;
    function go() { if (fired) return; fired = true; if (cb) setTimeout(cb, 0); }   // auch bei Zurück-Taste geht es weiter
    var m = modal('<div class="cut"><p class="wname">Welt ' + (w + 1) + ' · ' + RRM.WORLDS[w].name + '</p><div class="stagec"><div class="who" id="cw"></div><div class="bubble" id="cb"></div></div><div class="row"><button class="btn" data-a="skip">Überspringen</button><button class="btn gold" data-a="next" id="cn">Weiter</button></div></div>', {
      name: 'cut', cls: 'cutscene', dismiss: false, onClose: go,
      on: function (a) { if (a === 'skip' || i >= lines.length - 1) { closeTop(); return; } i++; render(); }
    });
    function render() {
      var l = lines[i], mira = /^MIRA/.test(l);
      m.querySelector('#cw').innerHTML = mira ? TX.MIRA : TX.RAY;
      m.querySelector('#cw').className = 'who ' + (mira ? 'right' : 'left');
      m.querySelector('#cb').textContent = l.replace(/^(RAY|MIRA MIX):\s*/, '');
      m.querySelector('#cn').textContent = i >= lines.length - 1 ? 'Los!' : 'Weiter';
    }
    render();
  }

  // ---------- Funkhaus ----------
  function showTower() {
    stage.show(tower); tower.build(S.tower);
    var mm = $('menu'); if (mm) mm.style.display = 'none';
    var p = el('<div class="screen towerui" id="towerui"><div class="mapbar"><button class="btn icon" data-a="back" aria-label="Zurück">←</button><h2>Funkhaus</h2>' + pills() + '</div><div class="tpanel" id="tpanel"></div></div>');
    ui.appendChild(p);
    function render() {
      var free = starsFree();
      p.querySelector('#tpanel').innerHTML = '<p class="small">Freie Sterne: <b>⭐ ' + free + '</b> · Baue Etage für Etage aus.</p>' + RRM.TOWER.map(function (t, f) {
        var has = S.tower.indexOf(f) >= 0, next = f === S.tower.length, reach = S.unlocked > f * 20;
        return '<div class="trow' + (has ? ' has' : '') + '"><span class="tn">' + (f + 1) + '</span><div><b>' + t.name + '</b><small>' + RRM.WORLDS[f].name + '</small></div>' +
          (has ? '<span class="ok">✓ gebaut</span>' : next && reach ? '<button class="btn gold sm" data-a="build" data-f="' + f + '"' + (free < t.cost ? ' disabled' : '') + '>⭐ ' + t.cost + '</button>' : '<span class="lk">🔒 ' + (reach ? 'erst Etage ' + f : 'Welt ' + (f + 1)) + '</span>') + '</div>';
      }).join('');
      p.querySelector('.pills').outerHTML = pills();
    }
    render();
    openLayer({ name: 'tower', el: p, close: function () { p.remove(); tower.setFocus(-1); if ($('menu')) { $('menu').style.display = ''; showMenu(); } } });
    p.addEventListener('click', function (e) {
      var b = e.target.closest('[data-a]'); if (!b) return; click();
      if (b.getAttribute('data-a') === 'back') { closeTop(); return; }
      var f = +b.getAttribute('data-f'), t = RRM.TOWER[f];
      if (starsFree() < t.cost || f !== S.tower.length) return;
      S.tower.push(f); save(); A.play('win');
      tower.build(S.tower); tower.setFocus(f);
      setTimeout(function () { tower.setFocus(-1); }, 2600);
      render();
      toast('🏗️ ' + t.name + ' ausgebaut!');
    });
  }

  // ---------- Bonus-Studio ----------
  function showBonus() {
    var html = '<h2>🎧 Bonus-Studio</h2><p class="small">Zehn Extra-Level. Alle 20 Level wird ein neues frei.</p><div class="blist">' + RRM.BONUS.map(function (b, k) {
      var need = k * 20 + 10, open = S.unlocked > need, st = S.bonus[k + 1] || 0;
      return '<button class="bnode' + (open ? '' : ' lock') + '" data-a="b" data-k="' + k + '"><b>' + b.id + '</b><small>' + (open ? (b.time ? '⏱ ' + b.time + ' s' : '🎵 ' + b.moves + ' Züge') : '🔒 ab Level ' + (need + 1)) + '</small><i>' + (open ? '★★★'.slice(0, st) + '<u>' + '★★★'.slice(st) + '</u>' : '') + '</i></button>';
    }).join('') + '</div><button class="btn" data-a="close">Schließen</button>';
    modal(html, {
      name: 'bonus',
      on: function (a, b) {
        if (a === 'close') { closeTop(); return; }
        var k = +b.getAttribute('data-k'), need = k * 20 + 10;
        if (S.unlocked <= need) { toast('Erst Level ' + (need + 1) + ' erreichen'); return; }
        var def = RRM.BONUS[k];
        closeTop(function () { startLevel(def, 'bonus', []); });
      }
    });
  }

  // ---------- Duell ----------
  function showDuelMenu() {
    modal('<h2>⚔️ Duell</h2><p>Abwechselnd auf demselben Brett: Wer nach je 10 Zügen mehr Punkte hat, gewinnt.</p>' +
      '<div class="col"><button class="btn gold" data-a="local">👥 2 Spieler (ein Gerät)</button><button class="btn" data-a="ai1">🤖 Gegen KI (leicht)</button><button class="btn" data-a="ai2">🤖 Gegen KI (stark)</button></div>' +
      '<p class="small">Bilanz: ' + S.duel.w + ' Siege · ' + S.duel.l + ' Niederlagen · ' + S.duel.d + ' Unentschieden. Ein Online-Duell über zwei Geräte gibt es (noch) nicht.</p><button class="btn" data-a="close">Schließen</button>', {
      name: 'duelmenu',
      on: function (a) {
        if (a === 'close') { closeTop(); return; }
        closeTop(function () { startDuel(a !== 'local', a === 'ai2' ? 2 : 1); });
      }
    });
  }
  function startDuel(ai, level) {
    var seed = (Date.now() % 100000) + 7, w = seed % 10;
    var def = { id: 'Duell', w: 8, h: 8, kinds: [0, 1, 2, 3, 4, 5], moves: 20, seed: seed, goals: [], mode: 'duel' };
    var duel = { names: ai ? ['Du', 'KI'] : ['Spieler 1', 'Spieler 2'], score: [0, 0], turn: 0, ai: ai ? 1 : -1, level: level || 1, world: w };
    startLevel(def, 'duel', [], duel);
  }
  function turnText(n) { return n === 'Du' ? 'Du bist dran' : n + ' ist dran'; }
  function duelTurnBanner() { if (G && G.duel) { say(turnText(G.duel.names[G.duel.turn])); updateHud(); } }
  function duelAfter() {
    var d = G.duel;
    d.score[d.turn] += G.eng.lastGain || 0;
    if (G.eng.moves <= 0 || G.eng.status !== 'play') { updateHud(); G.lock = true; setTimeout(duelEnd, 400); return; }
    d.turn ^= 1; updateHud(); duelTurnBanner();
    if (d.ai === d.turn) setTimeout(aiMove, 750);
  }
  function aiMove() {
    if (!G || !G.duel || G.eng.status !== 'play') return;
    if (topName() !== 'game') { setTimeout(aiMove, 500); return; }
    var r = G.eng.rankMoves(true);
    if (!r.length) return;
    var pick = G.duel.level >= 2 ? r[0] : r[Math.min(r.length - 1, Math.floor(Math.random() * Math.min(4, r.length)))];
    board.hint(pick.m);
    setTimeout(function () {
      if (!G) return;
      board.stopHint();
      G.lock = true;
      G.eng.swap(pick.m[0], pick.m[1]);
      playEvents(afterMove);
    }, 450);
  }
  function duelEnd() {
    var d = G.duel, s0 = d.score[0], s1 = d.score[1], t;
    if (s0 === s1) { t = 'Unentschieden!'; S.duel.d++; }
    else if (s0 > s1) { t = d.names[0] + ' gewinnt!'; if (d.ai >= 0) S.duel.w++; }
    else { t = d.names[1] + ' gewinnt!'; if (d.ai >= 0) S.duel.l++; }
    if (d.ai >= 0 && s0 > s1) S.coins += 30;
    save(); A.play(s0 >= s1 || d.ai < 0 ? 'win' : 'lose');
    modal('<div class="result"><h2>' + t + '</h2><p class="score">' + d.names[0] + ': ' + fmt(s0) + '<br>' + d.names[1] + ': ' + fmt(s1) + '</p>' + (d.ai >= 0 && s0 > s1 ? '<p class="coins">🪙 +30</p>' : '') +
      '<div class="row"><button class="btn" data-a="menu">Menü</button><button class="btn gold" data-a="again">↻ Revanche</button></div></div>', {
      name: 'result', dismiss: false, guard: function () {},
      on: function (a) { if (a === 'menu') quitGame(); else restart(); }
    });
  }

  // ---------- Shop & Tagesbonus ----------
  function showShop() {
    function body() {
      return '<h2>🛒 Shop</h2>' + pills() + '<p class="small">Münzen verdienst du nur im Spiel (und im Tagesbonus). Kein Echtgeld.</p><div class="shop">' + RRM.BOOSTERS.filter(function (b) { return !b.hidden; }).map(function (b) {
        var lock = S.unlocked < b.unlock;
        return '<div class="item' + (lock ? ' lock' : '') + '">' + bIcon(b, 'ic') + '<div><b>' + b.name + ' <small>×' + (S.inv[b.id] || 0) + '</small></b><small>' + b.desc + '</small></div>' +
          (lock ? '<span class="lk">🔒 L' + b.unlock + '</span>' : '<button class="btn gold sm" data-a="buy" data-id="' + b.id + '"' + (S.coins < b.price ? ' disabled' : '') + '>🪙 ' + b.price + '</button>') + '</div>';
      }).join('') + '</div><button class="btn" data-a="close">Schließen</button>';
    }
    var m = modal(body(), {
      name: 'shop', cls: 'tall',
      on: function (a, b) {
        if (a === 'close') { closeTop(); refreshMenu(); return; }
        var bd = boosterDef(b.getAttribute('data-id'));
        if (S.coins < bd.price) return;
        S.coins -= bd.price; S.inv[bd.id] = (S.inv[bd.id] || 0) + 1; save(); A.play('coin');
        var y = m.querySelector('.sheet').scrollTop; m.querySelector('.sheet').innerHTML = body(); m.querySelector('.sheet').scrollTop = y;
      }
    });
  }
  var DAILY = [{ coins: 100 }, { inv: 'hammer' }, { coins: 150 }, { inv: 'shuffle' }, { coins: 200 }, { inv: 'bass' }, { coins: 300, inv: 'preOrb' }];
  function dailyLabel(r) { return (r.coins ? '🪙 ' + r.coins : '') + (r.coins && r.inv ? ' + ' : '') + (r.inv ? boosterDef(r.inv).icon : ''); }
  function showDaily() {
    var ready = S.daily !== today(), streak = S.dstreak || 0;
    var y = new Date(); y.setDate(y.getDate() - 1);
    var yk = y.getFullYear() + '-' + (y.getMonth() + 1) + '-' + y.getDate();
    if (ready && S.daily !== yk) streak = 0;   // Serie gerissen
    var idx = streak % 7;
    modal('<h2>🎁 Tagesbonus</h2><p class="small">Jeden Tag eine Belohnung – sieben Tage in Folge werden immer besser.</p><div class="days">' + DAILY.map(function (r, k) {
      return '<div class="day' + (k < idx ? ' got' : '') + (k === idx && ready ? ' now' : '') + '"><small>Tag ' + (k + 1) + '</small><b>' + dailyLabel(r) + '</b></div>';
    }).join('') + '</div>' + (ready ? '<button class="btn gold big" data-a="claim">Abholen</button>' : '<p>Heute schon abgeholt. Bis morgen!</p>') + '<button class="btn" data-a="close">Schließen</button>', {
      name: 'daily',
      on: function (a) {
        if (a === 'claim' && S.daily !== today()) {
          var r = DAILY[idx];
          if (r.coins) S.coins += r.coins;
          if (r.inv) S.inv[r.inv] = (S.inv[r.inv] || 0) + 1;
          S.daily = today(); S.dstreak = streak + 1; save(); A.play('coin');
          toast('Abgeholt: ' + dailyLabel(r));
        }
        closeTop(refreshMenu);
      }
    });
  }

  // ---------- Einstellungen ----------
  function showSettings() {
    function tg(k, label) { return '<label class="tg"><span>' + label + '</span><input type="checkbox" data-k="' + k + '"' + (S.set[k] ? ' checked' : '') + '><i></i></label>'; }
    var q = S.set.quality;
    var m = modal('<h2>⚙️ Optionen</h2>' + tg('music', '🎵 Musik') + tg('sfx', '🔊 Effekte') + tg('reduced', '🌀 Weniger Bewegung') + tg('cb', '👁️ Farbenblind-Modus (Symbole)') +
      '<div class="seg" role="group" aria-label="Grafik"><span>🖥️ Grafik</span>' + ['auto', 'low', 'mid', 'high'].map(function (k) { return '<button class="' + (q === k ? 'on' : '') + '" data-a="q" data-q="' + k + '">' + { auto: 'Auto', low: 'Niedrig', mid: 'Mittel', high: 'Hoch' }[k] + '</button>'; }).join('') + '</div>' +
      '<p class="small">Spielstand: lokal auf diesem Gerät. Ältere Radio-Match-Stände wurden übernommen.</p><div id="cloudslot"></div><button class="btn" data-a="close">Fertig</button>', {
      name: 'settings',
      onClose: function () { var cb = $('cloudbox'), h = $('cloudhold'); if (cb && h) h.appendChild(cb); },
      on: function (a, b) {
        if (a === 'close') { closeTop(); return; }
        if (a === 'q') { S.set.quality = b.getAttribute('data-q'); save(); stage.setQuality(S.set.quality); m.querySelectorAll('.seg button').forEach(function (x) { x.classList.toggle('on', x === b); }); }
      }
    });
    var cb = $('cloudbox'); if (cb && cb.childNodes.length) m.querySelector('#cloudslot').appendChild(cb);
    m.addEventListener('change', function (e) {
      var k = e.target.getAttribute('data-k'); if (!k) return;
      S.set[k] = e.target.checked; save(); applySettings();
    });
  }
  function applySettings() {
    A.set('sfx', S.set.sfx); A.set('music', S.set.music);
    D.body.classList.toggle('reduced', !!S.set.reduced);
    if (board) board.setOptions(S.set);
    if (tower) tower.reduced = !!S.set.reduced;
    if (stage) stage.kick();
  }

  // ---------- Hilfe ----------
  function showHelp() {
    var B = RRM.BLOCKERS, sp = RRM.SPECIALS;
    modal('<h2>❓ So spielst du</h2>' +
      '<h3>Grundregeln</h3><p>Tausche zwei benachbarte Bauteile (tippen oder wischen). Drei oder mehr gleiche in einer Reihe oder Spalte verschwinden. Erfülle die Ziele oben, bevor die Züge ausgehen. Je mehr Züge übrig bleiben, desto mehr Sterne.</p>' +
      '<h3>Spezialteile</h3><ul>' + ['rh', 'bomb', 'drone', 'orb', 'remix'].map(function (k) { return '<li><b>' + sp[k].name + '</b> – ' + sp[k].desc + '</li>'; }).join('') + '</ul>' +
      '<h3>Kombos (zwei Spezialteile tauschen)</h3><ul>' + TX.COMBOS.map(function (c) { return '<li><b>' + c[0] + '</b>: ' + c[1] + '</li>'; }).join('') + '</ul>' +
      '<h3>Hindernisse</h3><ul>' + Object.keys(B).map(function (k) { return '<li><b>' + B[k].name + '</b> – ' + B[k].desc + '</li>'; }).join('') + '</ul>' +
      '<h3>Booster</h3><ul>' + RRM.BOOSTERS.filter(function (b) { return !b.hidden; }).map(function (b) { return '<li>' + b.icon + ' <b>' + b.name + '</b> – ' + b.desc + (b.pre ? ' (vor dem Level)' : '') + '</li>'; }).join('') + '</ul>' +
      '<h3>Steuerung</h3><p>Maus/Touch: tippen oder wischen. Tastatur: Pfeiltasten bewegen den Rahmen, Enter wählt und tauscht, Esc pausiert. Controller werden unterstützt.</p>' +
      '<button class="btn" data-a="close">Schließen</button>', { name: 'help', cls: 'tall', on: function () { closeTop(); } });
  }

  // ---------- WebGL-Fehler ----------
  function showGlError(msg) {
    ui.innerHTML = '<div class="screen title"><div class="logo"><span>ROYAL RADIO</span><b>MATCH 3D</b></div><div class="sheet err"><h2>3D-Grafik nicht verfügbar</h2><p>' + msg + '</p>' +
      '<p class="small">Tipps: Browser aktualisieren, Hardware-Beschleunigung in den Browser-Einstellungen aktivieren oder ein anderes Gerät probieren.</p><button class="btn gold" onclick="location.reload()">Erneut versuchen</button></div></div>';
  }

  // ---------- Start ----------
  function boot() {
    ui = $('ui');
    S = RRM.Save.load(LS);   // Migration geschieht beim Laden (idempotent); gespeichert wird erst bei der ersten Änderung,
                             // damit ein frischer Stand nicht mit neuem Zeitstempel einen Cloud-Stand überschreibt
    stage = new RRM.Stage($('gl'), {
      onLost: function () { var e = el('<div class="lost" id="lost">3D-Grafik wird neu gestartet …</div>'); ui.appendChild(e); },
      onRestored: function () { var e = $('lost'); if (e) e.remove(); if (G) board.sync(); }
    });
    var err = stage.init(S.set.quality);
    if (err) { showGlError(err); return; }
    board = new RRM.Board(stage, hooks);
    tower = new RRM.Tower(stage);
    applySettings();
    bindInput();
    showTitle();
    root.RRMApp = { state: function () { return S; }, game: function () { return G; }, layers: function () { return layers.map(function (l) { return l.name; }); }, board: board, stage: stage, startLevel: function (n) { startLevel(RRM.LEVELS[n - 1], 'level', []); } };
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', boot); else boot();
})(typeof window !== 'undefined' ? window : globalThis);
