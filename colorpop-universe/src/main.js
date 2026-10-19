/* ColorPop Universe – Start und Ablaufsteuerung: Laden mit Fehlerschutz, Navigation, Runden, Ergebnisse, Speichern,
 * Tastatur/Controller, Vollbild, Debug-Anzeige (?debug=1). Spielregeln stecken ausschließlich in src/core und src/modes. */
(function (root) {
  'use strict';
  var CPU = root.CPU, doc = root.document, U = CPU.ui;
  var VERSION = '1.0.0';
  var PUBLIC_BASE = (root.EASYGAMES_PUBLIC_BASE || 'https://ricorewioriginal-collab.github.io/easygames/').replace(/\/?$/, '/');
  var SCR = { menu: 'scrMenu', worlds: 'scrWorlds', world: 'scrWorld', setup: 'scrSetup', collection: 'scrCollection', settings: 'scrSettings', help: 'scrHelp', cloud: 'scrCloud', game: 'scrGame', load: 'scrLoad' };
  var MODE_WORLD = { classic: 1, zen: 5, sprint: 7, time: 6, moves: 4, puzzle: 11, chaos: 12, gravity: 3, daily: 2, weekly: 10, tower: 9, duel: 7, local: 1 };
  var RESUMABLE = { adventure: 1, classic: 1, zen: 1, puzzle: 1, chaos: 1, gravity: 1, tower: 1, weekly: 1, daily: 1 };
  var REASON = { clear: 'Brett leer!', nomoves: 'Keine Züge mehr', moves: 'Keine Züge übrig', time: 'Zeit um!', manual: 'Runde beendet', quit: 'Runde beendet' };
  var params; try { params = new URLSearchParams(root.location.search); } catch (e) { params = new URLSearchParams(''); }
  var DEBUG = params.get('debug') === '1';
  function $(id) { return doc.getElementById(id); }

  var app = root.ColorPop = {
    version: VERSION, $: $, store: null, sess: null, ctx: null, spec: null, rend: null, armed: null, screen: 'load', arg: null, hist: [],
    cursor: -1, hover: null, lock: false, modalOpen: false, weekCache: {}, timer: 0, theme: 0, endPending: false, replaying: false,
    setup: { classic: { size: 'normal', colors: 4, seed: '' }, time: { limit: 120 }, moves: { limit: 25 }, chaos: { colors: 6 }, zen: { colors: 4 }, duel: { bot: 'medium', colors: 4 }, local: { variant: 'turns', colors: 4 } },
    now: function () { return root.performance ? root.performance.now() : Date.now(); }
  };
  app.weekTask = function (wk, k) { var key = wk + '/' + k; return app.weekCache[key] || (app.weekCache[key] = CPU.weeklyTask(wk, k)); };

  // ---------- Hilfen ----------
  var toastT = 0;
  app.toast = function (msg, ms) { var t = $('toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('on'); }, ms || 2600); };
  function vibrate(ms) { if (app.store && app.store.settings.vibrate && root.navigator.vibrate) { try { root.navigator.vibrate(ms); } catch (e) {} } }
  function sfx(n, o) { CPU.audio.sfx(n, o); }
  function storage() { try { var ls = root.localStorage, k = CPU.SAVE_PREFIX + '.test'; ls.setItem(k, '1'); ls.removeItem(k); return ls; } catch (e) { return null; } }
  function today() { var d = new Date(); return { day: CPU.utcDay(d), week: CPU.isoWeek(d) }; }
  function ensureDay() { var t = today(); app.store.ensureDay(t.day, t.week); }

  // ---------- Dialoge ----------
  var modalActs = [], modalCancel = null, modalPaused = false;
  app.modal = function (o) {
    var box = $('modal'); modalActs = o.actions || []; modalCancel = o.cancel || null;
    $('modalTitle').innerHTML = o.title || ''; $('modalBody').innerHTML = o.body || '';
    var a = $('modalActions'); a.className = 'modal-actions' + (modalActs.length === 2 && !o.stack ? ' two' : '');
    a.innerHTML = modalActs.map(function (x, k) { return '<button class="btn ' + (x.cls || '') + '" type="button" data-act="modal" data-arg="' + k + '">' + x.label + '</button>'; }).join('');
    box.hidden = false; app.modalOpen = true;
    if (app.sess && app.screen === 'game' && !app.sess.over && !modalPaused) { app.sess.pause(app.now()); modalPaused = true; }
    var f = a.querySelector('button'); if (f) setTimeout(function () { try { f.focus({ preventScroll: true }); } catch (e) {} }, 30);
  };
  app.closeModal = function () {
    $('modal').hidden = true; app.modalOpen = false; modalActs = []; modalCancel = null;
    if (modalPaused) { modalPaused = false; if (app.sess && !app.sess.over) app.sess.resume(app.now()); }
    if (app.screen === 'game') { try { $('board').focus({ preventScroll: true }); } catch (e) {} }
  };
  function confirmBox(title, text, yes, fn) { app.modal({ title: title, body: '<p>' + text + '</p>', actions: [{ label: yes, cls: 'warn', fn: fn }, { label: 'Abbrechen', cls: 'ghost' }], cancel: function () {} }); }

  // ---------- Darstellung & Einstellungen ----------
  app.applySettings = function () {
    var s = app.store.settings, p = app.store.p, b = doc.body;
    CPU.audio.set(s);
    var reduce = s.motion === 'reduced' || (s.motion === 'auto' && root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches);
    var q = s.quality === 'auto' ? (app.autoQ || ((root.navigator.hardwareConcurrency || 4) <= 2 || (root.navigator.deviceMemory || 4) <= 2 ? 'mid' : 'high')) : s.quality;
    b.classList.toggle('reduce', !!reduce); b.classList.toggle('hc', !!s.contrast); b.classList.toggle('calm', q === 'low');
    ['night', 'sunset', 'aurora', 'deep', 'mono'].forEach(function (k) { b.classList.toggle('bg-' + k, p.cosmetic.bg === k); });
    if (app.rend) app.rend.setOpts({ skin: p.cosmetic.stone, pop: p.cosmetic.pop, hc: !!s.contrast, quality: q, reduce: !!reduce, speed: s.speed || 1, showPoints: s.showPoints !== false });
  };
  var DECO = { candy: ['#ffd1e8', '#fff3b0', '#b8f2ff'], gems: ['#b2f5ea', '#d0bfff', '#fff'], clouds: ['#fff', '#e7f5ff', '#ffe3ec'], bubbles: ['#99e9f2', '#c5f6fa', '#fff'], leaves: ['#d8f5a2', '#ffec99', '#8ce99a'],
    embers: ['#ffa94d', '#ff6b6b', '#ffd43b'], neon: ['#f783ac', '#66d9e8', '#b197fc'], snow: ['#fff', '#d0ebff', '#e5dbff'], cogs: ['#ffd43b', '#ced4da', '#ff922b'], stars: ['#fff', '#ffe066', '#a5d8ff'], dream: ['#eebefa', '#bac8ff', '#fff'], prism: ['#ff6b6b', '#ffe066', '#69db7c', '#4dabf7', '#b197fc'] };
  app.setTheme = function (wid) {
    wid = wid || 1; if (app.theme === wid) return; app.theme = wid;
    var w = CPU.WORLDS[wid - 1], st = doc.documentElement.style;
    st.setProperty('--bg1', w.bg[0]); st.setProperty('--bg2', w.bg[1]); st.setProperty('--bg3', w.bg[2]); st.setProperty('--accent', w.accent); st.setProperty('--boardc', w.board);
    var cols = DECO[w.deco] || DECO.candy, r = CPU.rng(wid * 97), h = '';
    for (var k = 0; k < 12; k++) {
      var s = 14 + r.int(70), sq = w.deco === 'gems' || w.deco === 'cogs' || w.deco === 'prism';
      h += '<i style="left:' + r.int(100) + '%;top:' + r.int(100) + '%;width:' + s + 'px;height:' + s + 'px;background:' + cols[k % cols.length] + ';border-radius:' + (sq ? '22%' : '50%') + ';opacity:' + (0.12 + r.int(30) / 100) + ';--d:' + (14 + r.int(16)) + 's;--dx:' + (r.int(60) - 30) + 'px;--dy:' + (r.int(60) - 30) + 'px"></i>';
    }
    $('bgDeco').innerHTML = h;
    var mc = doc.querySelector('meta[name=theme-color]'); if (mc) mc.setAttribute('content', w.board);
  };

  // ---------- Navigation ----------
  app.go = function (name, arg, noPush) {
    if (!noPush && app.screen !== name && app.screen !== 'load' && app.screen !== 'game') app.hist.push({ name: app.screen, arg: app.arg });
    if (name === 'menu') app.hist = [];
    var el = $(SCR[name]); if (!el) return;
    var old = $(SCR[app.screen]);
    app.screen = name; app.arg = arg;
    var html = null;
    switch (name) {
      case 'menu': ensureDay(); html = U.menu(app); app.setTheme(CPU.LEVELS[Math.min(300, app.store.p.unlocked) - 1].world); CPU.audio.music(app.theme, 'calm'); break;
      case 'worlds': html = U.worlds(app); break;
      case 'world': html = U.world(app, arg); app.setTheme(arg); break;
      case 'setup': html = U.setup(app, arg); app.setTheme(MODE_WORLD[arg] || 1); break;
      case 'collection': ensureDay(); html = U.collection(app, arg); break;
      case 'settings': html = U.settings(app); break;
      case 'help': html = U.help(app); break;
    }
    if (html != null) el.innerHTML = html;
    Object.keys(SCR).forEach(function (k) { var s = $(SCR[k]); if (s) s.hidden = s !== el; });
    if (old && old !== el && app.rend && name !== 'game') { /* Brett ruht, kein Zeichnen im Hintergrund */ }
    if (name === 'collection' && arg === 'skins') U.paintSkins(el);
    if (name === 'help') U.paintPieces(el);
    if (name === 'settings' && arg === 'profile') { var pr = $('profile'); if (pr) pr.scrollIntoView(); }
    // Fokus nur für Tastatur/Controller setzen (sonst störender Leuchtrahmen bei Touch/Maus)
    var f = name === 'game' ? null : el.querySelector('#btnContinue') || el.querySelector('#btnStart') || el.querySelector('.node.current') || el.querySelector('h2');
    if (f && app.kbd) { if (f.tagName === 'H2') f.setAttribute('tabindex', '-1'); try { f.focus({ preventScroll: true }); } catch (e) {} }
  };
  app.refresh = function () { var sc = $(SCR[app.screen]).querySelector('.scroll'), y = sc ? sc.scrollTop : 0; app.go(app.screen, app.arg, true); sc = $(SCR[app.screen]).querySelector('.scroll'); if (sc) sc.scrollTop = y; };
  app.back = function () {
    if (app.modalOpen) { if (modalCancel) { var c = modalCancel; app.closeModal(); c(); } return; }
    if (app.armed) { app.armed = null; U.dock(app); app.toast('Booster abgebrochen'); return; }
    if (app.screen === 'game') { pauseMenu(); return; }
    if (app.screen === 'menu') { if (root.parent !== root && root.EasyGamesKit) root.EasyGamesKit.close(); return; }
    var prev = app.hist.pop(); app.go(prev ? prev.name : 'menu', prev ? prev.arg : null, true);
  };

  // ---------- Runden ----------
  function realize(spec) {
    var o = spec.o || {}, opt = Object.assign({}, o), ctx = { mode: spec.mode };
    if (spec.mode === 'adventure') { opt.level = CPU.LEVELS[o.levelId - 1]; ctx.level = opt.level; }
    if (spec.mode === 'puzzle') { opt.puzzle = CPU.PUZZLES[o.puzzleId - 1]; ctx.puzzle = opt.puzzle; }
    if (spec.mode === 'time' || spec.mode === 'moves') ctx.limit = o.limit;
    if (spec.mode === 'classic') ctx.preset = o.preset;
    if (spec.mode === 'weekly') { ctx.week = o.week; ctx.k = o.k; }
    if (spec.mode === 'tower') ctx.floor = o.floor;
    if (spec.mode === 'duel') ctx.bot = o.bot;
    if (spec.mode === 'daily') ctx.day = o.day;
    return { opt: opt, ctx: ctx };
  }
  function worldOfSpec(spec) { return spec.mode === 'adventure' ? CPU.LEVELS[spec.o.levelId - 1].world : MODE_WORLD[spec.mode] || 1; }
  app.startRound = function (spec, restore) {
    var r = realize(spec), S;
    stopTimer(); app.closeModal(); app.endPending = false; app.replaying = false; app.armed = null; app.hover = null; app.cursor = -1; app.hudCache = app.dockCache = null;
    try {
      S = CPU.modes.create(spec.mode, Object.assign({ now: app.now() }, r.opt));
      if (restore) {
        if (restore.boardNo) { S.boardNo = restore.boardNo; S.game = S.makeGame(restore.boardNo); }
        S.total = restore.total || 0; S.game.load(restore.game);
      }
    } catch (e) { reportError(e); app.store.p.resume = null; app.store.save(); app.toast('Runde konnte nicht gestartet werden.'); return; }
    app.sess = S; app.ctx = r.ctx; app.spec = spec;
    var wid = worldOfSpec(spec); app.setTheme(wid); app.rend.opts.world = wid;
    app.go('game');
    $('hudTitle').textContent = spec.title; $('hudSub').textContent = spec.sub || '';
    app.rend.setGame(S.game); requestAnimationFrame(function () { app.rend.resize(); });
    CPU.audio.music(wid, spec.mode === 'zen' || spec.mode === 'puzzle' ? 'calm' : spec.mode === 'sprint' || spec.mode === 'time' ? 'fast' : 'normal'); CPU.audio.intensity(0);
    updateHud();
    if (S.timeLimit()) startTimer();
    saveResume(true);
    introFor(spec);
    if (S.game.status().over) { S.finish(S.game.status().reason); endRound(); }
  };
  function introFor(spec) {
    var s = app.store.settings, p = app.store.p, msgs = [];
    if (s.tutorials && !p.seen['m-' + spec.mode]) { p.seen['m-' + spec.mode] = 1; msgs.push('<p>' + U.esc(CPU.modeInfo(spec.mode).tut) + '</p>'); }
    if (spec.mode === 'adventure') {
      var L = CPU.LEVELS[spec.o.levelId - 1], w = CPU.WORLDS[L.world - 1];
      if (s.tutorials && !p.seen['w' + L.world]) { p.seen['w' + L.world] = 1; msgs.push('<p><b>' + U.esc(w.name) + ':</b> ' + U.esc(w.intro) + '</p>'); }
      msgs.push('<div class="goals-list">' + L.goals.map(function (g) { return '<div>🎯 ' + U.esc(CPU.goalText(g)) + '</div>'; }).join('') + (L.moves ? '<div>👣 ' + L.moves + ' Züge</div>' : '') + '</div>');
    }
    if (!msgs.length || (spec.mode === 'adventure' && msgs.length === 1 && p.seen['lv' + spec.o.levelId])) return;
    if (spec.mode === 'adventure') p.seen['lv' + spec.o.levelId] = 1;
    app.store.save();
    app.modal({ title: U.esc(spec.title), body: msgs.join(''), actions: [{ label: 'Los!', cls: 'primary' }], cancel: function () {} });
  }
  function startTimer() {
    stopTimer(); var lastSec = -1;
    app.timer = setInterval(function () {
      var S = app.sess; if (!S || S.over || app.modalOpen || doc.hidden) return;
      var now = app.now(), left = S.timeLeft(now);
      if (S.tick(now)) { endRound(); return; }
      var sec = Math.ceil(left); if (sec !== lastSec) { lastSec = sec; updateHud(); if (sec <= 5 && sec > 0) sfx('tick'); CPU.audio.intensity(sec <= 15 ? 1 : 0.4); }
    }, 200);
  }
  function stopTimer() { if (app.timer) { clearInterval(app.timer); app.timer = 0; } }
  function updateHud() { if (!app.sess) return; U.hud(app); U.dock(app); }
  var resumeT = 0;
  function saveResume(now) {
    var S = app.sess, p = app.store.p;
    if (!S || !RESUMABLE[S.mode]) return;
    clearTimeout(resumeT);
    var go = function () { if (app.sess !== S) return; p.resume = S.over ? null : { spec: app.spec, game: S.game.save(), total: S.total, boardNo: S.boardNo, title: app.spec.title, at: Date.now() }; app.store.save(); };
    if (now) go(); else resumeT = setTimeout(go, 400);
  }

  // Tippen / Klicken auf ein Feld
  app.tap = function (i, type) {
    var S = app.sess; if (!S || S.over || app.modalOpen || app.lock || app.replaying || i < 0) return;
    CPU.audio.unlock();
    if (app.armed) { useBooster(app.armed, i); return; }
    var pv = S.game.preview(i);
    if (!pv) { sfx('invalid'); vibrate(12); return; }
    if (app.store.settings.confirmTap && !(app.hover && app.hover.armed && app.hover.set.has(i))) { setHover(i, true); sfx('hover', { n: pv.size }); return; }
    doMove(i);
  };
  function setHover(i, armed) {
    var S = app.sess; if (!S || S.over) return;
    var pv = i >= 0 ? S.game.preview(i) : null;
    if (!pv) { app.hover = null; app.rend.setHover(null); return; }
    app.hover = { set: new Set(pv.cells), at: i, label: pv.size + ' · +' + U.fmt(Math.round(pv.points * (S.mode === 'sprint' && app.now() - S.lastMoveAt <= 2000 ? 1 + Math.min(10, S.combo + 1) * 0.1 : 1))), armed: !!armed };
    app.rend.setHover(app.hover);
  }
  function doMove(i) {
    var S = app.sess, g0 = S.game, grav = g0.gravityNow(), res = S.move(i, app.now());
    if (!res) { if (S.over) endRound(); else sfx('invalid'); return; }
    app.hover = null; app.rend.setHover(null);
    app.rend.apply(res);
    sounds(res); vibrate(res.group.length >= 10 ? 35 : 12);
    CPU.audio.intensity(Math.min(1, res.group.length / 14 + (S.combo || 0) * 0.1));
    if (res.newBoard) {
      app.lock = true; app.toast(S.mode === 'zen' ? 'Neues Brett – weiter geht’s!' : 'Nächstes Brett!');
      setTimeout(function () { app.lock = false; if (app.sess === S && !S.over) { app.rend.setGame(S.game); updateHud(); saveResume(); } }, 420 / (app.store.settings.speed || 1));
    }
    if (res.roundOver) {
      updateHud(); app.lock = true;
      setTimeout(function () {
        app.lock = false;
        app.modal({ title: 'Spieler 2 ist dran', body: '<p>Spieler 1 hat <b>' + U.fmt(S.game.score) + '</b> Punkte. Jetzt spielt Spieler 2 genau dasselbe Brett.</p>', actions: [{ label: 'Spieler 2 startet', cls: 'primary', fn: function () { S.nextRound(); app.rend.setGame(S.game); updateHud(); } }] });
      }, 600);
      return;
    }
    if (!S.over && S.game === g0 && g0.gravityNow() !== grav) { sfx('gravity'); app.toast('Schwerkraft dreht: ' + CPU.GRAV_TEXT[g0.gravityNow()]); }
    var met = g0.goals.length && g0.goalsMet();
    if (met && !app.goalToast && !S.over && S.mode !== 'puzzle') { app.goalToast = true; sfx('win'); app.toast('Ziel erreicht! Spiel weiter für mehr Sterne oder tippe auf „Abschließen“.', 3600); }
    updateHud(); saveResume();
    if (S.over) endRound();
  }
  function sounds(res) {
    var n = res.group.length, S = app.sess;
    sfx('pop', { n: n, combo: S.mode === 'sprint' ? S.combo : 0 });
    var seen = {};
    (res.effects || []).forEach(function (e) { if (seen[e.t]) return; seen[e.t] = 1; sfx(e.t === 'bomb' ? 'bomb' : e.t === 'rocket' ? 'rocket' : e.t === 'chain' ? 'chain' : 'magic'); });
    if (res.iceHits && res.iceHits.length) sfx('ice');
    if ((res.passive && res.passive.length) || (res.rockHits && res.rockHits.length)) sfx('block');
    if (res.collected && res.collected.length) sfx('item');
    if (res.clearBonus) setTimeout(function () { sfx('clear'); }, 150);
    else setTimeout(function () { sfx('fall'); }, 160);
  }
  function useBooster(type, i) {
    var S = app.sess, p = app.store.p;
    if (!(p.boosters[type] > 0)) { app.armed = null; updateHud(); return; }
    var res = S.game.booster(type, i);
    if (!res) { sfx('invalid'); app.toast(type === 'hammer' ? 'Hier kann der Hammer nichts treffen.' : type === 'color' ? 'Diesen Stein kann der Pinsel nicht färben.' : 'Booster hier nicht möglich.'); return; }
    app.store.useBooster(type); app.armed = null;
    app.rend.apply(res); sfx(type === 'mini' ? 'bomb' : type === 'shuffle' || type === 'color' ? 'magic' : 'block'); vibrate(20);
    var st = S.game.status();
    if (st.over) {
      if (S.mode === 'zen') { S.nextBoard(); setTimeout(function () { app.rend.setGame(S.game); updateHud(); }, 420); }
      else { S.finish(st.reason); }
    }
    updateHud(); saveResume();
    if (S.over) endRound();
  }
  app.armBooster = function (type) {
    var S = app.sess; if (!S || S.over || !S.allowBoosters()) return;
    if (!(app.store.p.boosters[type] > 0)) { app.toast('Keine ' + U.BOOSTERS.filter(function (b) { return b.id === type; })[0].name + ' mehr – in der Sammlung gibt es neue für Funken.'); return; }
    if (type === 'shuffle') { useBooster('shuffle', -1); return; }
    app.armed = app.armed === type ? null : type; updateHud();
    if (app.armed) app.toast(type === 'hammer' ? 'Hammer: Tippe auf einen Stein, Block oder Fels.' : type === 'mini' ? 'Mini-Bombe: Tippe auf die Mitte des 3×3-Felds.' : 'Pinsel: Tippe auf einen Stein zum Umfärben.');
  };
  app.hint = function () {
    var S = app.sess; if (!S || S.over || !S.allowHint()) return;
    var i = CPU.bots.hint(S.game); if (i < 0) return;
    S.game.stats.hints++; app.cursor = i; app.rend.setCursor(i, false); setHover(i, true); sfx('hover', { n: 6 });
    clearTimeout(app.hintT); app.hintT = setTimeout(function () { if (app.hover && app.hover.at === i && !app.store.settings.confirmTap) { app.hover = null; app.rend.setHover(null); } }, 1800);
  };
  app.undo = function () { var S = app.sess; if (!S || !S.canUndo()) return; S.game.undo(); app.rend.setGame(S.game); sfx('click'); updateHud(); saveResume(); };
  app.restart = function () { if (app.spec) app.startRound(app.spec); };

  function pauseMenu() {
    var S = app.sess; if (!S || S.over) return;
    var s = app.store.settings, resum = RESUMABLE[S.mode];
    app.modal({ title: 'Pause', body: '<p>' + U.esc(app.spec.title) + ' · ' + U.fmt(S.score()) + ' Punkte</p>' + (resum ? '' : '<p class="muted">Diese Runde wird beim Verlassen nicht gespeichert.</p>'),
      actions: [{ label: 'Weiterspielen', cls: 'primary' },
        { label: 'Neu starten', fn: function () { app.restart(); } },
        { label: (s.musicOn || s.sfxOn ? 'Ton aus' : 'Ton an'), cls: 'ghost', fn: function () { toggleMute(); } },
        { label: 'Runde beenden & werten', cls: 'ghost', fn: function () { S.finish(S.mode === 'zen' ? 'manual' : 'quit'); endRound(); } },
        { label: 'Zum Menü', cls: 'ghost', fn: function () { leaveGame(); } }], stack: true, cancel: function () {} });
  }
  function leaveGame() { var S = app.sess; stopTimer(); if (S && !S.over && RESUMABLE[S.mode]) saveResume(true); else if (app.store.p.resume && S && !RESUMABLE[S.mode]) { /* gespeicherte andere Runde bleibt */ } app.sess = null; app.go(app.spec && app.spec.mode === 'adventure' ? 'world' : 'menu', app.spec && app.spec.mode === 'adventure' ? CPU.LEVELS[app.spec.o.levelId - 1].world : null); }

  // ---------- Rundenende ----------
  function endRound() {
    if (app.endPending) return; app.endPending = true; stopTimer(); app.lock = true; app.goalToast = false;
    var S = app.sess, waited = 0;
    (function wait() { if (app.rend.busy() && waited < 1600) { waited += 100; setTimeout(wait, 100); return; } app.lock = false; showResult(S); })();
  }
  function showResult(S) {
    if (app.sess !== S) return;
    var r = S.result || S.finish('manual');
    var p = app.store.p, ctx = Object.assign({}, app.ctx, { res: r, day: app.ctx.day || today().day });
    ensureDay();
    p.resume = null;
    var out = app.store.recordRound(ctx);
    var good = S.mode === 'local' ? true : S.mode === 'duel' ? r.winner === 0 : r.won !== false;
    var w = CPU.WORLDS[(app.theme || 1) - 1];
    if (good) { app.rend.celebrate(w.celebrate); sfx(r.cleared ? 'clear' : 'win'); } else sfx('lose');
    if (out.newRecord) setTimeout(function () { sfx('record'); }, 500);
    var title, body = '', acts = [], goalMode = S.mode === 'adventure' || S.mode === 'weekly' || S.mode === 'tower' || S.mode === 'puzzle';
    if (goalMode) title = r.won ? (r.cleared ? 'Brett leer – geschafft!' : 'Geschafft!') : 'Nicht geschafft';
    else if (S.mode === 'duel') title = r.winner === 0 ? 'Du gewinnst!' : r.winner === 1 ? 'Der Bot gewinnt' : 'Unentschieden';
    else if (S.mode === 'local') title = r.winner === -1 ? 'Unentschieden' : 'Spieler ' + (r.winner + 1) + ' gewinnt!';
    else title = REASON[r.reason] || 'Runde vorbei';
    if (goalMode && r.won) { body += '<div class="big-stars">' + U.stars(r.stars) + '</div>'; for (var k = 0; k < r.stars; k++) (function (k) { setTimeout(function () { sfx('star', { k: k }); }, 250 + k * 180); })(k); }
    var rows = [['Punkte', U.fmt(r.score)]];
    if (S.mode === 'duel') rows.push(['Bot (' + { easy: 'Einfach', medium: 'Mittel', hard: 'Schwer' }[r.bot.level] + ')', U.fmt(r.bot.score)], ['Übrige Steine (du / Bot)', r.remaining + ' / ' + r.bot.remaining]);
    if (S.mode === 'local') rows = [['Spieler 1', U.fmt(r.scores[0])], ['Spieler 2', U.fmt(r.scores[1])]];
    if (S.mode !== 'local') { rows.push(['Züge', r.moves]); if (r.boards > 1) rows.push(['Bretter', r.boards]); else rows.push(['Übrige Steine', r.remaining]); }
    if (r.cleared && r.boards <= 1) rows.push(['Brett-leer-Bonus', '+1.000']);
    if (S.game.result && S.game.result.moveBonus) rows.push(['Zugbonus', '+' + U.fmt(S.game.result.moveBonus)]);
    if (S.mode === 'daily') rows.push(['Tagesziel', U.fmt(r.goal) + (r.goalMet ? ' ✓' : '')]);
    if (S.mode === 'puzzle') rows.push(['Bestmögliche Züge', app.ctx.puzzle.min]);
    var best = bestFor(S, p); if (best) rows.push(['Dein Bestwert', U.fmt(best)]);
    if (out.funken) rows.push(['Funken', '+' + out.funken]);
    body += '<div class="res-list">' + rows.map(function (x) { return '<span>' + x[0] + '</span><b>' + x[1] + '</b>'; }).join('') + '</div>';
    if (out.newRecord) body += '<p><b>🏆 Neuer Rekord!</b></p>';
    if (out.milestone) body += '<p>🎉 Meilenstein: ' + out.milestone + ' Level geschafft (+5 Funken)</p>';
    out.tasks.forEach(function (t) { body += '<p>✅ Aufgabe erledigt: ' + U.esc(t.text) + ' (+' + t.reward + ')</p>'; });
    if (out.ach.length) body += '<p>🏅 ' + (out.ach.length > 1 ? 'Neue Erfolge: ' : 'Neuer Erfolg: ') + out.ach.map(function (a) { return '<b>' + U.esc(a.title) + '</b>'; }).join(', ') + '</p>';
    if (out.ach.length) setTimeout(function () { sfx('ach'); }, 900);
    if (goalMode && !r.won && S.mode !== 'puzzle') body += '<p class="muted">' + S.game.progress().filter(function (x) { return !x.done; }).map(function (x) { return U.esc(x.text) + ': ' + x.cur + '/' + x.target; }).join('<br>') + '</p>';
    var again = { label: 'Nochmal', fn: function () { app.restart(); } };
    if (S.mode === 'adventure') {
      var id = app.ctx.level.id;
      if (r.won && id < 300) acts.push({ label: 'Nächstes Level', cls: 'primary', fn: function () { startLevel(id + 1); } });
      acts.push(r.won ? again : Object.assign(again, { cls: 'primary' }), { label: 'Weltkarte', cls: 'ghost', fn: function () { app.sess = null; app.go('world', CPU.LEVELS[Math.min(id + (r.won ? 1 : 0), 300) - 1].world); } });
    } else if (S.mode === 'tower') {
      acts.push(r.won ? { label: 'Stockwerk ' + p.tower.floor, cls: 'primary', fn: function () { startTower(); } } : Object.assign(again, { cls: 'primary' }), { label: 'Menü', cls: 'ghost', fn: toMenu });
    } else if (S.mode === 'puzzle') {
      var pid = app.ctx.puzzle.id;
      if (r.won && pid < 30) acts.push({ label: 'Nächstes Rätsel', cls: 'primary', fn: function () { startPuzzle(pid + 1); } });
      acts.push(again, { label: 'Rätselliste', cls: 'ghost', fn: function () { app.sess = null; app.go('setup', 'puzzle'); } });
    } else {
      acts.push(Object.assign(again, { cls: 'primary' }));
      if (S.mode === 'classic') acts.push({ label: 'Neues Brett', fn: function () { app.setup.classic.seed = ''; startMode('classic'); } });
      if (S.mode === 'duel') acts.push({ label: 'Bot-Durchgang ansehen', fn: function () { replayBot(S); } });
      if (S.mode === 'weekly') acts.push({ label: 'Wochenliga', fn: function () { app.sess = null; app.go('setup', 'weekly'); } });
      acts.push({ label: 'Menü', cls: 'ghost', fn: toMenu });
    }
    app.lastResult = { title: title, body: body, acts: acts };
    $('toast').classList.remove('on');
    app.modal({ title: title, body: body, actions: acts, stack: true });
    app.dockCache = null; updateHud();
  }
  function bestFor(S, p) {
    var c = app.ctx, R = p.records;
    switch (S.mode) {
      case 'adventure': return (p.levels[c.level.id] || {}).best; case 'classic': return R.classic[c.preset]; case 'sprint': return R.sprint; case 'time': return R.time[String(c.limit)];
      case 'moves': return R.moves[String(c.limit)]; case 'chaos': return R.chaos; case 'gravity': return R.gravity; case 'zen': return R.zen; case 'daily': return R.daily[c.day];
    }
    return 0;
  }
  function toMenu() { app.sess = null; stopTimer(); app.go('menu'); }
  function replayBot(S) {
    var g = S.makeGame(0), moves = S.result.bot.moves.slice(), last = app.lastResult;
    app.replaying = true; app.rend.setGame(g); $('hudTitle').textContent = 'Bot-Durchgang'; $('hudScore').textContent = '0'; $('hudGoals').innerHTML = '<span class="chip">🤖 Der Bot spielt …</span>'; $('dock').innerHTML = '<button class="btn" type="button" data-act="replayStop">Überspringen</button>'; app.dockCache = null;
    var stop = function () { clearInterval(app.replayT); app.replaying = false; $('hudTitle').textContent = app.spec.title; app.rend.setGame(S.game); app.modal({ title: last.title, body: last.body, actions: last.acts, stack: true }); };
    app.replayStop = stop;
    app.replayT = setInterval(function () {
      if (!app.replaying) { clearInterval(app.replayT); return; }
      if (app.modalOpen) return;
      var i = moves.shift(); if (i == null) { stop(); return; }
      var res = g.move(i); if (res) { app.rend.apply(res); sfx('pop', { n: res.group.length }); $('hudScore').textContent = U.fmt(g.score); }
    }, 420);
  }

  // ---------- Modi starten ----------
  function startLevel(id) {
    var L = CPU.LEVELS[id - 1], w = CPU.WORLDS[L.world - 1];
    app.startRound({ mode: 'adventure', o: { levelId: id }, title: 'Level ' + id + ': ' + L.title, sub: 'Welt ' + L.world + ' · ' + w.name });
  }
  function startPuzzle(id) { app.startRound({ mode: 'puzzle', o: { puzzleId: id }, title: 'Rätsel ' + id, sub: 'Puzzle-Labor · leere das Brett' }); }
  function startTower() { var f = app.store.p.tower.floor; app.startRound({ mode: 'tower', o: { floor: f }, title: 'Stockwerk ' + f, sub: 'Endlos-Turm' }); }
  function randSeed() { return ((Date.now() ^ Math.floor(Math.random() * 0x7fffffff)) >>> 0) % 1000000000; }
  function startMode(mode) {
    var st = app.setup[mode] || {}, name = CPU.modeInfo(mode).name, o = {}, sub = CPU.modeInfo(mode).desc;
    switch (mode) {
      case 'classic': {
        var sz = CPU.CLASSIC_SIZES.filter(function (s) { return s.id === st.size; })[0] || CPU.CLASSIC_SIZES[1], inp = $('inSeed');
        var seed = parseInt((inp ? inp.value : st.seed) || '', 10); if (!(seed >= 0)) seed = randSeed();
        st.seed = String(seed); o = { w: sz.w, h: sz.h, colors: st.colors, seed: seed, preset: sz.id }; sub = sz.name + ' · ' + st.colors + ' Farben · Brett ' + seed; break;
      }
      case 'time': o = { limit: st.limit, seed: randSeed() }; sub = st.limit / 60 + ' Minuten'; break;
      case 'moves': o = { limit: st.limit, seed: randSeed() }; sub = st.limit + ' Züge'; break;
      case 'chaos': o = { colors: st.colors, seed: randSeed() }; sub = st.colors + ' Farben'; break;
      case 'zen': o = { colors: st.colors, seed: randSeed() }; break;
      case 'sprint': case 'gravity': o = { seed: randSeed() }; break;
      case 'daily': { var d = today().day; o = { seed: 'cpu-daily-' + d, w: 10, h: 11, colors: 4, day: d }; sub = 'Brett vom ' + d.split('-').reverse().join('.') + ' (UTC)'; break; }
      case 'duel': o = { bot: st.bot, colors: st.colors, w: 10, h: 10, seed: randSeed() }; sub = 'gegen Bot (' + { easy: 'Einfach', medium: 'Mittel', hard: 'Schwer' }[st.bot] + ')'; break;
      case 'local': o = { variant: st.variant, colors: st.colors, w: 10, h: 10, seed: randSeed() }; sub = st.variant === 'turns' ? 'Zugwechsel' : 'Nacheinander'; break;
      case 'tower': startTower(); return;
      case 'adventure': startLevel(Math.min(300, app.store.p.unlocked)); return;
      default: return;
    }
    app.startRound({ mode: mode, o: o, title: name, sub: sub });
  }
  app.startMode = startMode; app.startLevel = startLevel;

  // ---------- Klick-Aktionen ----------
  function toggleMute() { var s = app.store.settings, on = !(s.musicOn || s.sfxOn); s.musicOn = s.sfxOn = on; app.store.saveSettings(); app.applySettings(); app.toast(on ? 'Ton an' : 'Ton aus'); if (app.screen === 'menu') app.refresh(); }
  function toggleFull() {
    var d = doc, el = d.documentElement;
    try {
      if (d.fullscreenElement || d.webkitFullscreenElement) { (d.exitFullscreen || d.webkitExitFullscreen).call(d); return; }
      var rq = el.requestFullscreen || el.webkitRequestFullscreen;
      if (!rq) { app.toast('Vollbild: Auf iPhone/iPad über „Teilen → Zum Home-Bildschirm“ als App öffnen.', 4200); return; }
      var pr = rq.call(el); if (pr && pr.catch) pr.catch(function () { app.toast('Vollbild wurde vom Browser abgelehnt.'); });
    } catch (e) { app.toast('Vollbild ist hier nicht verfügbar.'); }
  }
  var ACT = {
    nav: function (a) { var parts = String(a).split('#'); app.go(parts[0], parts[1] || null); },
    mode: function (m) { if (m === 'adventure') app.go('worlds'); else app.go('setup', m); },
    continue: function () {
      var p = app.store.p;
      if (p.resume && p.resume.spec) { var rs = p.resume; app.startRound(rs.spec, rs); return; }
      ACT.level(Math.min(300, p.unlocked));
    },
    world: function (id) {
      id = +id; var first = (id - 1) * 25 + 1;
      if (app.store.p.unlocked < first) { app.toast('Schaffe zuerst Level ' + (first - 1) + ', um ' + CPU.WORLDS[id - 1].name + ' zu öffnen.'); sfx('invalid'); return; }
      app.go('world', id);
    },
    level: function (id) {
      id = +id; if (id > app.store.p.unlocked) { app.toast('Noch gesperrt – schaffe zuerst Level ' + app.store.p.unlocked + '.'); sfx('invalid'); return; }
      var m = U.levelIntro(app, id);
      app.modal({ title: m.title, body: m.body, actions: [{ label: U.ic('play') + ' Spielen', cls: 'primary', fn: function () { startLevel(id); } }, { label: 'Abbrechen', cls: 'ghost' }], cancel: function () {} });
    },
    setup: function (a) { var kv = a.split('='), k = kv[0].split('.'), v = kv[1], st = app.setup[k[0]]; st[k[1]] = /^\d+$/.test(v) ? +v : v; app.refresh(); },
    startMode: function (m) { startMode(m); },
    puzzle: function (id) { id = +id; var p = app.store.p, solved = Object.keys(p.puzzles).filter(function (k) { return p.puzzles[k].stars > 0; }).length; if (id > solved + 3) { app.toast('Löse zuerst weitere Rätsel.'); return; } startPuzzle(id); },
    weekly: function (k) { k = +k; var wk = today().week; app.weekTask(wk, k); app.startRound({ mode: 'weekly', o: { week: wk, k: k }, title: 'Wochenliga · Aufgabe ' + (k + 1), sub: 'Woche ' + wk }); },
    ctab: function (t) { app.go('collection', t, true); },
    buy: function (b) { if (app.store.buyBooster(b)) { sfx('item'); app.toast('Gekauft!'); } else app.toast('Nicht genug Funken.'); app.refresh(); },
    skin: function (a) {
      var kv = a.split('.'), item = CPU.SKINS[kv[0]].filter(function (x) { return x.id === kv[1]; })[0], p = app.store.p;
      if (!CPU.skinUnlocked(item, p)) { app.toast('Noch gesperrt: ' + CPU.skinNeedText(item)); return; }
      p.cosmetic[kv[0]] = kv[1]; app.store.save(); app.applySettings(); app.refresh(); sfx('click');
    },
    set: function (a) {
      var kv = a.split('='), k = kv[0], v = kv[1], s = app.store.settings;
      s[k] = (v === '1' || v === '0') && k !== 'speed' ? v === '1' : /^[\d.]+$/.test(v) ? +v : v;
      if (k === 'tutorials') s[k] = v === '1';
      app.store.saveSettings(); app.applySettings(); app.refresh();
    },
    rebind: function (a) { app.rebinding = a; app.toast('Drücke jetzt die neue Taste für „' + CPU.ACTION_NAMES[a] + '“ (Esc bricht ab).', 6000); },
    resetKeys: function () { app.store.settings.keys = Object.assign({}, CPU.DEFAULT_KEYS); app.store.saveSettings(); app.refresh(); app.toast('Standardbelegung wiederhergestellt'); },
    profile: function (id) { app.store.switchTo(id); ensureDay(); app.applySettings(); app.refresh(); app.toast('Profil: ' + app.store.p.name); },
    rename: function () { app.store.rename($('inName').value); app.refresh(); app.toast('Gespeichert'); },
    export: function () {
      try {
        var blob = new Blob([app.store.exportJSON()], { type: 'application/json' }), a = doc.createElement('a');
        a.href = URL.createObjectURL(blob); a.download = 'colorpop-universe-' + app.store.p.name.replace(/[^\wäöüÄÖÜß-]+/g, '_') + '.json'; doc.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000); app.toast('Spielstand exportiert');
      } catch (e) { app.toast('Export nicht möglich.'); }
    },
    import: function () { $('inImport').click(); },
    backup: function () { if (app.store.restoreBackup()) { app.applySettings(); app.refresh(); app.toast('Sicherung wiederhergestellt'); } else app.toast('Keine Sicherung vorhanden.'); },
    tutReset: function () { var p = app.store.p; Object.keys(p.seen).forEach(function (k) { delete p.seen[k]; }); app.store.settings.tutorials = true; app.store.save(); app.toast('Tutorials werden wieder gezeigt'); },
    resetProfile: function () { confirmBox('Profil zurücksetzen?', 'Level, Sterne, Rekorde und Erfolge dieses Profils werden gelöscht. Der alte Stand bleibt als Sicherung erhalten.', 'Zurücksetzen', function () { app.store.resetProfile(); ensureDay(); app.applySettings(); app.refresh(); }); },
    shareSeed: function () {
      var st = app.setup.classic, inp = $('inSeed'), seed = parseInt(inp && inp.value, 10); if (!(seed >= 0)) seed = randSeed(); if (inp) inp.value = seed; st.seed = String(seed);
      var url = PUBLIC_BASE + 'colorpop-universe/?mode=classic&seed=' + seed + '&size=' + st.size + '&colors=' + st.colors, txt = 'ColorPop Universe – schaffst du mehr Punkte auf Brett ' + seed + '?';
      if (root.navigator.share) { root.navigator.share({ title: 'ColorPop Universe', text: txt, url: url }).catch(function () {}); return; }
      if (root.navigator.clipboard) root.navigator.clipboard.writeText(url).then(function () { app.toast('Link kopiert: ' + url, 4000); }, function () { app.toast(url, 6000); }); else app.toast(url, 6000);
    },
    mute: toggleMute, full: toggleFull,
    allGames: function () { if (root.parent !== root && root.EasyGamesKit) root.EasyGamesKit.close(); else root.location.href = '../'; },
    booster: function (b) { app.armBooster(b); }, hint: function () { app.hint(); }, undo: function () { app.undo(); },
    finishRound: function () { var S = app.sess; if (!S || S.over) return; if (S.mode !== 'zen' && !S.game.goalsMet()) return; S.finish('manual'); endRound(); },
    replayStop: function () { if (app.replayStop) app.replayStop(); },
    modal: function (k) { var a = modalActs[+k]; app.closeModal(); if (a && a.fn) a.fn(); }
  };
  doc.addEventListener('click', function (e) {
    CPU.audio.unlock();
    var t = e.target.closest ? e.target.closest('[data-act],[data-back]') : null; if (!t || t.disabled) return;
    if (t.hasAttribute('data-back')) { sfx('click'); app.back(); return; }
    var f = ACT[t.getAttribute('data-act')]; if (!f) return;
    if (t.getAttribute('data-act') !== 'modal') sfx('click');
    try { f(t.getAttribute('data-arg') || '', t); } catch (err) { reportError(err); app.toast('Fehler: ' + (err && err.message || err)); }
  });
  doc.addEventListener('input', function (e) { var r = e.target.getAttribute && e.target.getAttribute('data-range'); if (!r) return; app.store.settings[r] = (+e.target.value || 0) / 100; CPU.audio.set(app.store.settings); });
  doc.addEventListener('change', function (e) {
    if (e.target.getAttribute && e.target.getAttribute('data-range')) { app.store.saveSettings(); sfx('pop', { n: 4 }); return; }
    if (e.target.id === 'inImport' && e.target.files && e.target.files[0]) {
      var fr = new FileReader(); fr.onload = function () { var r = app.store.importJSON(String(fr.result)); app.toast(r.ok ? 'Spielstand importiert' : r.error, 4000); if (r.ok) { ensureDay(); app.applySettings(); app.refresh(); } };
      fr.readAsText(e.target.files[0]); e.target.value = '';
    }
    if (e.target.id === 'inSeed') app.setup.classic.seed = e.target.value.replace(/\D/g, '');
  });

  // ---------- Tastatur ----------
  function moveCursor(dx, dy) {
    var S = app.sess; if (!S) return; var b = S.game.board, i = app.cursor;
    if (i < 0) i = Math.floor(b.h / 2) * b.w + Math.floor(b.w / 2);
    else { var x = i % b.w, y = (i - x) / b.w; x = Math.max(0, Math.min(b.w - 1, x + dx)); y = Math.max(0, Math.min(b.h - 1, y + dy)); i = x + y * b.w; }
    app.cursor = i; app.rend.setCursor(i, true); setHover(i, app.hover && app.hover.armed && app.hover.set.has(i));
  }
  doc.addEventListener('pointerdown', function () { app.kbd = false; }, true);
  doc.addEventListener('keydown', function (e) {
    CPU.audio.unlock(); app.kbd = true;
    if (app.rebinding) {
      e.preventDefault(); var a = app.rebinding; app.rebinding = null;
      if (e.code === 'Escape' || !e.code) { app.toast('Abgebrochen'); return; }
      if (/^(Arrow|Enter|F1[3-8]$)/.test(e.code)) { app.toast('Diese Taste ist fest belegt.'); return; }
      var keys = app.store.settings.keys; Object.keys(keys).forEach(function (k) { if (keys[k] === e.code && k !== a) keys[k] = keys[a]; });
      keys[a] = e.code; app.store.saveSettings(); app.refresh(); app.toast(CPU.ACTION_NAMES[a] + ': ' + CPU.keyLabel(e.code)); return;
    }
    var tag = e.target && e.target.tagName;
    if ((tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') && e.key !== 'Escape') return;
    if (!app.store) return;
    var act = CPU.keyAction(e, app.store.settings.keys); if (!act) return;
    if (act === 'full') { e.preventDefault(); toggleFull(); return; }
    if (act === 'mute') { e.preventDefault(); toggleMute(); return; }
    if (app.modalOpen) { if (act === 'back' || act === 'pause') { e.preventDefault(); app.back(); } return; }
    if (app.screen !== 'game') { if (act === 'back') { e.preventDefault(); app.back(); } return; }
    if (app.replaying) { if (act === 'back' || act === 'confirm') { e.preventDefault(); ACT.replayStop(); } return; }
    var focusBtn = doc.activeElement && doc.activeElement.tagName === 'BUTTON';
    switch (act) {
      case 'up': moveCursor(0, -1); break; case 'down': moveCursor(0, 1); break; case 'left': moveCursor(-1, 0); break; case 'right': moveCursor(1, 0); break;
      case 'confirm': if (focusBtn && e.code !== 'Space') return; if (focusBtn) return; if (app.cursor < 0) moveCursor(0, 0); else app.tap(app.cursor, 'key'); break;
      case 'hint': app.hint(); break; case 'undo': app.undo(); break;
      case 'restart': confirmBox('Neu starten?', 'Die aktuelle Runde wird verworfen.', 'Neu starten', app.restart); break;
      case 'pause': case 'back': app.back(); break;
      case 'booster1': case 'booster2': case 'booster3': case 'booster4': app.armBooster(U.BOOSTERS[+act.slice(7) - 1].id); break;
      case 'boosterPrev': case 'boosterNext': {
        if (!app.sess.allowBoosters()) return;
        var ids = U.BOOSTERS.map(function (b) { return b.id; }), k = ids.indexOf(app.armed), n = act === 'boosterNext' ? (k + 1) % 5 : (k + 4) % 5;
        if (n === 4 || ids[n] === 'shuffle') { app.armed = null; updateHud(); if (n !== 4) app.toast('Mischen: Taste 4 bzw. Knopf unten'); } else app.armBooster(ids[n]); break;
      }
      case 'zoomIn': app.rend.setZoom(app.rend.zoom * 1.2); break; case 'zoomOut': app.rend.setZoom(app.rend.zoom / 1.2); break;
      default: return;
    }
    e.preventDefault();
  });

  // ---------- Laden ----------
  function reportError(e) { try { root.console && root.console.error('[ColorPop]', e); } catch (x) {} app.lastError = String(e && (e.stack || e.message) || e); }
  function setLoad(pct, text) { var b = $('loadBar'); b.setAttribute('aria-valuenow', pct); b.firstElementChild.style.width = pct + '%'; $('loadText').textContent = text; }
  function boot(safe) {
    $('loadError').hidden = true;
    var steps = [
      ['Spielstand laden …', function () {
        var ls = safe ? null : storage(); app.store = new CPU.Store(ls);
        if (!ls) app.noStore = true;
        ensureDay();
      }],
      ['300 Level prüfen …', function () { if (!CPU.LEVELS || CPU.LEVELS.length !== 300 || !CPU.PUZZLES || CPU.PUZZLES.length !== 30) throw new Error('Leveldaten unvollständig'); }],
      ['Grafik vorbereiten …', function () {
        app.rend = new CPU.Renderer($('board'), $('boardWrap'));
        app.rend.onIdle = function () {
          if (app.store.settings.quality === 'auto' && !app.autoQ && app.rend.slow > 40) { app.autoQ = app.rend.opts.quality === 'high' ? 'mid' : 'low'; app.rend.slow = 0; app.applySettings(); }
        };
        app.applySettings();
      }],
      ['Steuerung einrichten …', function () {
        app.input = new CPU.Input($('board'), app.rend, {
          enabled: function () { return !!app.sess && !app.sess.over && !app.modalOpen && !app.lock && !app.replaying && app.screen === 'game'; },
          tap: function (i, type) { app.rend.setCursor(app.cursor, false); app.tap(i, type); },
          hover: function (i) { if (app.store.settings.confirmTap && app.hover && app.hover.armed) return; setHover(i, false); },
          hold: function (i) { if (app.store.settings.holdPreview) setHover(i, false); },
          holdEnd: function () { if (!(app.hover && app.hover.armed)) { app.hover = null; app.rend.setHover(null); } }
        });
        var rs = function () { if (app.screen === 'game' && app.rend) app.rend.resize(); };
        if (root.ResizeObserver) new ResizeObserver(rs).observe($('boardWrap')); else root.addEventListener('resize', rs);
        if (root.EasyGamesKit) root.EasyGamesKit.back(function () { app.back(); });
      }],
      ['Los geht’s!', function () {
        if (DEBUG && params.get('unlock') === '1') { app.store.p.unlocked = 300; app.toast('Debug: alle Level offen'); }
        app.go('menu');
        if (app.noStore) app.toast('Hinweis: Speichern ist in diesem Browser blockiert – der Fortschritt geht beim Schließen verloren.', 5000);
        if (app.store.broken) app.toast('Ein beschädigter Spielstand wurde gesichert und neu begonnen.', 5000);
        var m = params.get('mode');
        if (m === 'classic' && /^\d{1,9}$/.test(params.get('seed') || '')) {
          var st = app.setup.classic; st.seed = params.get('seed');
          if (CPU.CLASSIC_SIZES.some(function (s) { return s.id === params.get('size'); })) st.size = params.get('size');
          var c = +params.get('colors'); if (c >= 3 && c <= 6) st.colors = c;
          startMode('classic');
        } else if (m && CPU.modeInfo(m)) ACT.mode(m);
        if (DEBUG) startDebug();
      }]
    ];
    var k = 0;
    (function next() {
      if (k >= steps.length) return;
      var s = steps[k]; setLoad(Math.round(100 * (k + 1) / steps.length), s[0]);
      try { s[1](); } catch (e) { reportError(e); showLoadError(e); return; }
      k++; setTimeout(next, 0);
    })();
  }
  function showLoadError(e) {
    $('scrLoad').hidden = false; app.screen = 'load';
    $('loadErrorText').textContent = 'Beim Laden ist etwas schiefgegangen: ' + (e && e.message || e) + '. „Offline starten“ lädt ohne gespeicherten Stand.';
    $('loadError').hidden = false;
  }
  $('btnRetry').addEventListener('click', function () { boot(false); });
  $('btnSafe').addEventListener('click', function () { boot(true); });
  root.addEventListener('error', function (e) { reportError(e.error || e.message); if (app.screen === 'load') showLoadError(e.error || e.message); });

  // ---------- System ----------
  doc.addEventListener('visibilitychange', function () {
    CPU.audio.visibility(doc.hidden);
    if (doc.hidden) { if (app.store) app.store.save(); if (app.screen === 'game' && app.sess && !app.sess.over && app.sess.timeLimit() && !app.modalOpen) pauseMenu(); }
  });
  root.addEventListener('pagehide', function () { if (app.store) app.store.save(); });
  root.addEventListener('gamepadconnected', function () { app.toast('🎮 Controller verbunden: Steuerkreuz bewegt, A wählt, B zurück'); });
  root.addEventListener('gamepaddisconnected', function () { app.toast('🎮 Controller getrennt'); if (app.screen === 'game' && app.sess && !app.sess.over && !app.modalOpen) pauseMenu(); });

  function startDebug() {
    var d = $('debug'), lastF = 0, lastT = app.now(); d.hidden = false;
    setInterval(function () {
      var r = app.rend, now = app.now(), fps = Math.round((r.frames - lastF) * 1000 / (now - lastT)); lastF = r.frames; lastT = now;
      var S = app.sess;
      d.textContent = 'ColorPop ' + VERSION + '\nBild: ' + app.screen + '\nFPS (aktiv): ' + fps + '\nQualität: ' + r.opts.quality + '\nTeilchen: ' + r.parts.length +
        (S ? '\nModus: ' + S.mode + '\nSeed: ' + S.seed + '\nZüge: ' + S.game.movesUsed + '\nRest: ' + S.game.remaining() : '') + (app.lastError ? '\nFehler: ' + app.lastError.split('\n')[0] : '');
    }, 500);
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', function () { boot(false); }); else boot(false);
})(window);
