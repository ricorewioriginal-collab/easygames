/* FUNKBLASEN – Start, Spielschleife und Verbindung von Regeln, Grafik, Ton, Eingabe, Menüs und Spielstand. */
(function (root) {
  'use strict';
  const E = root.FBEngine, L = root.FBLevels, $ = id => document.getElementById(id);
  let embedded = false; try { embedded = root.top !== root.self; } catch (e) { embedded = true; }

  const app = {
    save: null, ui: null, renderer: null, input: null, session: null, def: null, mapWorld: 1, embedded,
    inGameSettings: false, running: false, aimVisible: false, aimDirty: true, applied: false, sinceSave: 0
  };
  root.FUNKBLASEN = app;   // für Tests und Fehlersuche

  // ---------- Laden (echte Schritte, Fehler mit "Erneut versuchen") ----------
  function setLoad(p, txt) { const b = $('loadBar'); b.firstElementChild.style.width = Math.round(p * 100) + '%'; b.setAttribute('aria-valuenow', Math.round(p * 100)); $('loadText').textContent = txt; }
  const tick = () => new Promise(r => setTimeout(r, 16));
  async function boot() {
    $('loadError').hidden = true;
    try {
      setLoad(0.05, 'Spielstand lesen …'); await tick();
      app.save = root.FBSave.create();
      applyRewards();
      setLoad(0.2, 'Grafik starten …'); await tick();
      if (!E || !L || !root.FBRenderer) throw new Error('Spieldateien fehlen – bitte Verbindung prüfen.');
      if (!app.renderer) { app.renderer = new root.FBRenderer($('stage')); app.renderer.init(); app.renderer.onLost = onContextLost; }
      setLoad(0.4, 'Kugeln formen …'); await tick();
      if (!app.renderer.geo) app.renderer.buildAssets();
      setLoad(0.6, '150 Level vorbereiten …'); await tick();
      for (let n = 1; n <= L.COUNT; n++) { L.level(n); if (n % 30 === 0) { setLoad(0.6 + n / L.COUNT * 0.25, 'Welten laden … ' + n + '/150'); await tick(); } }
      setLoad(0.9, 'Ton vorbereiten …'); await tick();
      applyOpts();
      if (!app.input) app.input = root.FBInput.create(inputHooks());
      if (!app.ui) app.ui = root.FBUI.create(app);
      app.ui.hint('mouse');
      setLoad(1, 'Fertig!'); await tick();
      setBackdrop(L.WORLDS[Math.floor((app.save.data.last.level - 1) / 15)].id);
      layout();
      if (!app.running) { app.running = true; last = performance.now(); requestAnimationFrame(loop); }
      app.ui.show('scrMenu');
      if (app.save.broken) app.ui.toast('Der alte Spielstand war beschädigt und wurde gesichert. Es geht mit einem neuen Stand weiter.', 5000);
    } catch (err) {
      console.error(err);
      $('loadErrorText').textContent = (err && err.message) || 'Unbekannter Fehler beim Start.';
      $('loadError').hidden = false; setLoad(0, 'Start fehlgeschlagen');
    }
  }
  $('btnRetry').addEventListener('click', () => { if (app.renderer && !app.renderer.gl) app.renderer = null; boot(); });
  const watchdog = setTimeout(() => { if (!app.running && $('loadError').hidden) { $('loadErrorText').textContent = 'Der Start dauert ungewöhnlich lange.'; $('loadError').hidden = false; } }, 20000);
  void watchdog;
  root.addEventListener('error', e => { if (!app.running && $('loadError')) { $('loadErrorText').textContent = 'Fehler beim Laden: ' + (e.message || 'Datei fehlt'); $('loadError').hidden = false; } });

  function onContextLost() {
    app.ui.modal({ title: 'Grafik pausiert', html: '<p>Das Gerät hat die 3D-Grafik angehalten (z. B. wegen Speichermangel). Dein Fortschritt ist gespeichert.</p>', actions: [{ label: 'Neu laden', primary: true, focus: true, fn: () => location.reload() }] });
  }

  // ---------- Optionen, Kosmetik ----------
  function reducedMotion() { const m = app.save.data.opts.motion; return m === 'an' || (m === 'auto' && root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches); }
  function applyOpts() {
    const o = app.save.data.opts, r = app.renderer;
    root.FBAudio.set({ music: o.music, sfx: o.sfx, muted: o.muted });
    if (r) { r.patterns = o.patterns; r.preview = o.preview; r.lineMode = o.line; r.reduced = reducedMotion(); if (r.quality !== o.quality) r.setQuality(o.quality); r.setCosmetics(app.save.data.cos); }
    document.body.classList.toggle('reduced', reducedMotion());
  }
  app.setOpt = function (k, v) { app.save.data.opts[k] = v; applyOpts(); app.persist(); };
  app.persist = () => { app.save.persist(); };
  app.sfx = (n, a, b) => root.FBAudio.play(n, a, b);
  app.unlockAudio = () => { root.FBAudio.unlock(); };
  app.equip = (slot, id) => { if (app.save.equip(slot, id)) { app.renderer.setCosmetics(app.save.data.cos); app.persist(); app.sfx('click'); } };
  app.buy = (slot, id, cost) => {
    if (app.save.buy(id, cost)) { app.save.equip(slot, id); app.renderer.setCosmetics(app.save.data.cos); app.sfx('coin'); app.ui.toast('🎨 Neues Design freigeschaltet!'); afterAch(); app.persist(); }
    else app.ui.toast('Dafür reichen die Münzen noch nicht.');
  };
  function applyRewards() { for (let w = 1; w <= 10; w++) if (app.save.data.stars[w * 15]) app.save.grant('k' + w); }
  app.resetAll = function () { if (app.session) { app.applied = true; endSession(); app.inGameSettings = false; root.FBAudio.music(null); } app.save.reset(); applyOpts(); app.ui.toast('Spielstand gelöscht.'); app.ui.show('scrMenu'); };
  function setBackdrop(w) { app.renderer.setWorld(w); }
  app.setBackdrop = setBackdrop;
  app.fullscreen = function () {
    const d = document, el = d.documentElement;
    try {
      if (d.fullscreenElement || d.webkitFullscreenElement) { (d.exitFullscreen || d.webkitExitFullscreen).call(d); return; }
      const req = el.requestFullscreen || el.webkitRequestFullscreen;
      if (!req) throw new Error('nein');
      const p = req.call(el); if (p && p.catch) p.catch(() => app.ui.toast('Vollbild ist hier nicht erlaubt – das Spiel läuft auch so vollständig.'));
    } catch (e) { app.ui.toast('Vollbild ist hier nicht möglich – das Spiel läuft auch so vollständig.'); }
  };
  app.homeBack = function () { if (embedded && root.EasyGamesKit) root.EasyGamesKit.close(); };
  $('btnFull').addEventListener('click', () => app.fullscreen());
  $('btnHome').addEventListener('click', () => { if (root.EasyGamesKit) root.EasyGamesKit.close(); });
  if (root.EasyGamesKit && root.EasyGamesKit.back) root.EasyGamesKit.back(() => { if (app.session && playing()) pauseGame(); else if (app.ui) app.ui.back(); });

  // ---------- Layout ----------
  function layout() {
    if (!app.renderer) return;
    const hud = !$('hud').hidden, land = root.matchMedia('(orientation: landscape) and (max-height: 600px)').matches;
    let ins = { top: 0, bottom: 0, left: 0, right: 0 };
    if (hud) {
      const t = $('hudTop').getBoundingClientRect(), b = $('hudBottom').getBoundingClientRect();
      ins = land ? { top: 6, bottom: 6, left: t.width + 4, right: b.width + 4 } : { top: t.height + 2, bottom: b.height + 2, left: 4, right: 4 };
    }
    app.renderer.setInsets(ins);
  }
  root.addEventListener('resize', () => { layout(); app.aimDirty = true; });
  root.addEventListener('orientationchange', () => setTimeout(layout, 200));

  // ---------- Spielschleife ----------
  let last = 0;
  function loop(now) {
    requestAnimationFrame(loop);
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000)); last = now;
    if (app.input) app.input.update(dt);
    const S = app.session;
    if (S && S.phase !== 'paused') S.update(dt);
    if (S && app.aimDirty && S.canAct()) { app.renderer.aim.sim = E.simulate(S.st, S.angle); app.aimDirty = false; }
    if (app.renderer) { app.renderer.aim.visible = app.aimVisible && !!S; app.renderer.render(dt); }
    root.FBAudio.update();
  }

  // ---------- Eingabe ----------
  function playing() { return !!app.session && !$('hud').hidden && !app.ui.modalOpen && !app.inGameSettings && app.session.phase !== 'paused'; }
  function inputHooks() {
    return {
      canvas: app.renderer.gl.domElement, renderer: app.renderer, game: () => app.session, playing,
      aim: (ang, vis) => { const S = app.session; if (!S) return; app.unlockAudio(); if (ang != null && S.aim(ang)) app.aimDirty = true; app.aimVisible = !!vis; },
      fire: () => { const S = app.session; if (S && S.fire()) { app.aimDirty = true; } },
      swap: () => { if (app.session && app.session.swap()) { app.sfx('swap'); app.aimDirty = true; app.ui.hud(app.session, app.def); } },
      joker: () => useJoker(), pause: () => pauseGame(), back: () => app.ui.back(), mute: () => { app.setOpt('muted', !app.save.data.opts.muted); app.ui.toast(app.save.data.opts.muted ? '🔇 Ton aus' : '🔊 Ton an'); },
      fullscreen: () => app.fullscreen(), nav: d => app.ui.nav(d), activate: () => app.ui.activate(), hint: d => app.ui.hint(d)
    };
  }
  $('btnPause').addEventListener('click', () => pauseGame());
  $('btnSwap').addEventListener('click', () => { if (app.session && app.session.swap()) { app.sfx('swap'); app.aimDirty = true; app.ui.hud(app.session, app.def); } });
  $('btnJoker').addEventListener('click', () => useJoker());
  $('btnHudSettings').addEventListener('click', () => { if (pauseGame(true)) openGameSettings(); });
  $('coachSkip').addEventListener('click', () => hideCoach(true));
  function useJoker() {
    const S = app.session; if (!S || app.save.data.coins < 60) { if (S) app.ui.toast('Der Joker kostet 60 🪙.'); return; }
    if (S.joker()) { app.save.data.coins -= 60; app.save.addStat('jokers', 1); app.persist(); app.sfx('rainbow'); app.aimDirty = true; app.ui.hud(S, app.def); app.ui.toast('🌈 Regenbogen-Joker eingesetzt (−60 🪙)'); }
  }

  // ---------- Level starten ----------
  app.dailyDef = date => L.daily(date);
  app.levelIntro = function (n) {
    const def = L.level(n), st = E.createState(def), w = L.WORLDS[def.world - 1], d = app.save.data;
    setBackdrop(w.id);
    const goal = def.goal.type === 'rescue' ? '💎 Rette alle ' + def.goal.n + ' Kristalle.' : def.goal.type === 'score' ? '⭐ Erreiche ' + app.ui.fmt(def.goal.n) + ' Punkte – oder räume das Feld leer.' : '🫧 Räume alle Farbblasen ab.';
    const ss = E.starShots(st), extra = [];
    if (def.wind) extra.push('🌬 Wind-Level: Die Kugel wird nach ' + (def.wind > 0 ? 'rechts' : 'links') + ' verweht.');
    if (def.ceilEvery) extra.push('⬇ Die Decke sinkt alle ' + def.ceilEvery + ' Schüsse eine Reihe.');
    if (def.specials && def.specials.length) extra.push('🎁 Sonderkugeln: ' + def.specials.map(s => ({ bomb: '💣 Bombe', rainbow: '🌈 Regenbogen', bolt: '⚡ Blitz' }[s.k] + ' (Schuss ' + s.at + ')')).join(', '));
    const tip = def.tip && (d.opts.tutorials || !d.tut['l' + n]) ? '<p class="tip">💬 ' + app.ui.esc(def.tip) + '</p>' : '';
    app.ui.modal({
      title: 'Level ' + w.id + '-' + def.index + (def.index === 15 ? ' · Welt-Finale' : ''),
      html: '<p>' + goal + '</p><div class="facts"><div><small>Schüsse</small><b>' + def.shots + '</b></div><div><small>Bestwert</small><b>' + (d.best[n] ? app.ui.fmt(d.best[n]) + ' ' + app.ui.starsTxt(d.stars[n] || 0) : '–') + '</b></div></div>' +
        '<p class="muted">★★★ mit mindestens ' + ss[1] + ' übrigen Schüssen, ★★ ab ' + ss[0] + '.</p>' + extra.map(x => '<p>' + x + '</p>').join('') + tip,
      actions: [{ label: '▶ Los geht\'s', primary: true, focus: true, fn: () => { d.tut['l' + n] = 1; app.start(def); } }, { label: 'Zurück', fn: () => { app.mapWorld = w.id; app.ui.show('scrMap'); } }],
      back: () => { app.ui.closeModal(); app.mapWorld = w.id; app.ui.show('scrMap'); }
    });
  };
  $('btnPlay').addEventListener('click', () => { app.sfx('click'); const n = app.save.hasProgress() ? app.save.data.last.level : 1; app.mapWorld = Math.floor((n - 1) / 15) + 1; app.levelIntro(n); });
  $('btnDaily').addEventListener('click', () => { app.sfx('click'); app.ui.show('scrDaily'); });
  $('btnEndless').addEventListener('click', () => { app.sfx('click'); app.ui.show('scrEndless'); });
  $('btnFree').addEventListener('click', () => { app.sfx('click'); app.start(L.free((Math.random() * 1e9) >>> 0)); });
  app.startEndless = () => { app.save.data.endless.run = null; app.start(L.endless((Math.random() * 1e9) >>> 0)); };
  app.resumeEndless = () => {
    const run = app.save.data.endless.run;
    try { if (!root.FBSave.validRun(run && run.st)) throw new Error('Runde ungültig'); const def = Object.assign(L.endless(1), { state: E.clone(run.st) }); app.start(def); }
    catch (e) { if (app.session) { app.applied = true; endSession(); } app.save.data.endless.run = null; app.persist(); app.ui.toast('Die gespeicherte Runde ließ sich nicht laden – starte eine neue.'); app.ui.show('scrEndless'); }
  };
  app.showAllTips = function () {
    const tips = []; for (let n = 1; n <= 150; n++) { const d = L.level(n); if (d.tip) tips.push('<p><b>' + d.world + '-' + d.index + ':</b> ' + app.ui.esc(d.tip) + '</p>'); }
    app.ui.modal({ title: 'Funkis Tipps', html: tips.join(''), actions: [{ label: 'Schließen', primary: true, focus: true }], back: () => app.ui.closeModal() });
  };

  app.start = function (def) {
    app.unlockAudio();
    if (app.session) endSession();
    app.def = def;
    const S = new E.Session(def, { resolveTime: reducedMotion() ? 0.2 : 0.38 });
    if (def.state) { S.st.jokerUsed = !!S.st.jokerUsed; }
    app.session = S; app.applied = false; app.sinceSave = 0; app.settled = def.mode === 'endless' ? E.clone(S.st) : null;
    app.renderer.session = S; app.renderer.mode = 'game'; app.renderer.clearFx();
    setBackdrop(def.world || 1);
    root.FBAudio.music(L.WORLDS[(def.world || 1) - 1].music);
    S.on(onSession);
    app.ui.closeModal(); app.ui.hideScreens(); $('hud').hidden = false; app.inGameSettings = false;
    app.aimVisible = false; app.aimDirty = true;
    if (def.mode === 'level') { app.save.data.last.level = def.id; app.persist(); }
    layout(); app.ui.hud(S, def);
    if (def.mode === 'level' && def.id <= 2 && !app.save.data.tut.coach) showCoach();
  };
  // Endlos-Runde sichern: nur ruhende Zustände (nie eine Kugel mitten im Flug, die sonst beim Fortsetzen verschwände)
  function settled(S) { const ph = S.phase === 'paused' ? S.prev : S.phase; return ph === 'ready' || ph === 'aiming'; }
  function remember(S) { if (app.def && app.def.mode === 'endless' && settled(S)) app.settled = E.clone(S.st); }
  function saveRun() { if (app.settled) app.save.data.endless.run = { st: E.clone(app.settled), ts: Date.now() }; }
  function endSession() {
    const S = app.session; if (!S) return;
    if (app.def.mode === 'endless' && !app.applied && S.phase !== 'lose') saveRun();
    app.persist();
    S.listeners.length = 0; app.session = null; app.renderer.session = null; app.renderer.mode = 'menu'; app.renderer.clearFx();
    $('hud').hidden = true; hideCoach(false);
  }
  function toMenu(scr) { endSession(); root.FBAudio.music(null); layout(); app.ui.show(scr || 'scrMenu'); }
  function retry() { const def = app.def; app.start(def.mode === 'level' ? L.level(def.id) : def.mode === 'daily' ? L.daily(def.date) : def.mode === 'endless' ? (app.save.data.endless.run = null, L.endless((Math.random() * 1e9) >>> 0)) : L.free((Math.random() * 1e9) >>> 0)); }

  // ---------- Tutorial-Hinweis ----------
  function showCoach() { $('coachText').textContent = 'Zielen: Finger ziehen oder Maus bewegen. Schießen: loslassen oder klicken. Drei gleiche Farben platzen!'; $('coach').hidden = false; }
  function hideCoach(skip) { if ($('coach').hidden) return; $('coach').hidden = true; if (skip !== false) { app.save.data.tut.coach = 1; app.persist(); } }

  // ---------- Pause ----------
  function pauseGame(silent) {
    const S = app.session; if (!S || S.phase === 'win' || S.phase === 'lose') return false;
    if (S.phase !== 'paused' && !S.pause()) return false;
    if (silent) return true;
    showPause(); return true;
  }
  function showPause() {
    const S = app.session, o = app.save.data.opts;
    app.ui.modal({
      title: 'Pause', html: '<p class="muted">' + (app.def.mode === 'level' ? 'Level ' + app.def.world + '-' + app.def.index : app.def.mode === 'daily' ? 'Tagesaufgabe' : app.def.mode === 'endless' ? 'Endlos · ' + app.ui.fmt(S.st.score) + ' Punkte' : 'Freies Spiel') + '</p>',
      actions: [
        { label: '▶ Weiterspielen', primary: true, focus: true, fn: () => resumeGame() },
        { label: '↻ Neu starten', fn: () => { app.ui.closeModal(); retry(); } },
        { label: o.muted ? '🔊 Ton an' : '🔇 Ton aus', keep: true, fn: () => { app.setOpt('muted', !app.save.data.opts.muted); showPause(); } },
        { label: '⚙️ Einstellungen', fn: () => openGameSettings() },
        { label: '🎮 Steuerung', fn: () => app.ui.modal({ title: 'Steuerung', funki: false, html: '<p><b>Touch:</b> ziehen = zielen, loslassen = schießen, unter die Kanone ziehen = abbrechen, kleine Kugel antippen = tauschen.</p><p><b>Maus:</b> zielen und klicken.</p><p><b>Tastatur:</b> ←/→ oder A/D zielen (Umschalt = fein), Leertaste/Enter schießen, T tauschen, J Joker, P/Esc Pause, M Ton, F Vollbild.</p><p><b>Controller:</b> Stick/Steuerkreuz zielen, Ⓐ schießen, Ⓧ tauschen, Ⓨ Joker, Start Pause.</p>', actions: [{ label: 'Zurück', primary: true, focus: true, fn: () => showPause() }], back: () => showPause() }) },
        app.def.mode === 'level' ? { label: '🗺️ Weltkarte', fn: () => { app.mapWorld = app.def.world; toMenu('scrMap'); } } : null,
        { label: '🏠 Hauptmenü', fn: () => toMenu('scrMenu') }
      ].filter(Boolean),
      back: () => resumeGame()
    });
  }
  function resumeGame() { app.ui.closeModal(); if (app.session) app.session.resume(); app.aimDirty = true; }
  function openGameSettings() { app.ui.closeModal(); app.inGameSettings = true; app.ui.show('scrSettings'); }
  app.closeGameSettings = function () { app.inGameSettings = false; app.ui.hideScreens(); applyOpts(); showPause(); };
  app.onScreen = function (id) { if (id === 'scrMenu' || id === 'scrWorlds') root.FBAudio.music(null); };
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { if (app.session && app.session.phase !== 'paused' && app.session.phase !== 'win' && app.session.phase !== 'lose') pauseGame(); if (app.input) app.input.cancel(); app.persist && app.save && app.persist(); root.FBAudio.suspend(); }
    else root.FBAudio.resume();
  });
  root.addEventListener('pagehide', () => { if (app.save) { if (app.session && app.def.mode === 'endless' && !app.applied && app.session.phase !== 'lose') saveRun(); app.persist(); } });

  // ---------- Ereignisse der Spielrunde ----------
  function onSession(type, data, S) {
    const st = S.st, sv = app.save;
    if (type === 'ready' || type === 'swap' || type === 'joker') remember(S);
    if (type === 'fire') {
      app.sfx('shoot'); hideCoach(true); sv.addStat('shots', 1);
      if (data.bubble.s === 'rainbow') sv.addStat('rainbows', 1);
      if (data.sim.bounces) setTimeout(() => app.sfx('bounce'), 120);
      app.ui.hud(S, app.def);
    } else if (type === 'land') {
      const ev = data.ev, res = data.result;
      app.renderer.onLand(data, st);
      if (ev.popped.length) app.sfx('pop', ev.popped.length, ev.combo); else app.sfx('land');
      if (ev.dropped.length) app.sfx('drop', ev.dropped.length);
      if (ev.booms.length) app.sfx('boom'); if (ev.bolts.length) app.sfx('bolt'); if (ev.thawed.length || ev.iceBroken) app.sfx('ice'); if (ev.cracked.length) app.sfx('crack');
      if (ev.special === 'rainbow') app.sfx('rainbow'); if (ev.chainFired) app.sfx('chain'); if (ev.starsHit) app.sfx('star'); if (ev.rescued) app.sfx('crystal');
      if (res.ceilDropped) { app.sfx('ceil'); app.renderer.shake = 0.5; app.ui.toast('⬇ Die Decke ist gesunken!'); }
      if (res.pushed) app.sfx('push');
      // Punkte über dem Feld
      if (ev.points > 0) { const p = app.renderer.fieldToClient(E.cellX(st, Math.min(ev.r, E.ROWS - 1), ev.c), E.cellY(st, ev.r)); app.ui.floater(p.x, p.y, '+' + app.ui.fmt(ev.points), ev.points >= 300 ? '#ffd21f' : '#fff'); }
      if (ev.combo >= 2) app.ui.combo('Combo ×' + Math.min(ev.combo, 5) + (ev.combo >= 4 ? '!' : ''));
      else if (ev.dropped.length >= 8) app.ui.combo('Blasenregen!');
      else if (ev.popped.length && ev.bounces >= 2) app.ui.combo('Doppelbande!');
      // Statistik für Erfolge
      sv.addStat('pops', ev.popped.length); sv.addStat('drops', ev.dropped.length); sv.maxStat('bestDrop', ev.dropped.length); sv.maxStat('bestCombo', ev.combo);
      if (ev.popped.length && ev.bounces) sv.addStat('banks', 1); if (ev.popped.length && ev.bounces >= 2) sv.addStat('bigBank', 1);
      sv.addStat('bombs', ev.booms.length); sv.addStat('bolts', ev.bolts.length); sv.addStat('ice', ev.thawed.length + ev.iceBroken); sv.addStat('crystals', ev.rescued); sv.addStat('stars', ev.starsHit);
      if (ev.chainFired) sv.addStat('chains', 1); if (ev.switchFired) sv.addStat('switches', 1);
      afterAch();
      if (app.def.mode === 'endless' && ++app.sinceSave >= 5) { app.sinceSave = 0; sv.data.endless.run = { st: E.clone(st), ts: Date.now() }; app.persist(); }
      app.ui.hud(S, app.def);
    } else if (type === 'ready') { app.aimDirty = true; app.ui.hud(S, app.def); if (E.maxRow(st) >= E.DANGER - 1) app.sfx('danger'); }
    else if (type === 'win') onWin(S);
    else if (type === 'lose') onLose(S, data);
  }
  function afterAch() {
    const fresh = app.save.checkAch();
    for (const a of fresh) { app.ui.toast('🏅 Erfolg: ' + a.name + ' (+25 🪙)', 3200); app.sfx('coin'); }
    if (fresh.length) app.persist();
    return fresh;
  }
  function onWin(S) {
    if (app.applied) return; app.applied = true;   // Belohnung genau einmal je Sieg
    const st = S.st, def = app.def, sv = app.save, stars = E.stars(st);
    app.sfx('win'); app.renderer.celebrate();
    if (st.shotsTotal > 0 && st.shotsLeft * 2 >= st.shotsTotal) sv.addStat('perfect', 1);
    let html = '', actions = [], title = 'Geschafft!';
    if (def.mode === 'level') {
      const r = sv.recordWin(def.id, st.score, stars);
      let reward = '';
      if (def.index === 15) { const c = L.CANNONS.find(x => x.world === def.world); if (!sv.owns(c.id)) { sv.grant(c.id); reward = '<p>🎁 Belohnung: <b>' + c.name + '</b> (in der Sammlung)</p>'; } }
      const fresh = afterAch();
      html = '<div class="big-stars">' + [0, 1, 2].map(i => '<span class="' + (i < stars ? 'on' : '') + '" style="animation-delay:' + (0.15 + i * 0.25) + 's">★</span>').join('') + '</div>' +
        '<div class="facts"><div><small>Punkte</small><b>' + app.ui.fmt(st.score) + '</b></div><div><small>Bestwert</small><b>' + app.ui.fmt(sv.data.best[def.id] || st.score) + (r.newBest ? ' 🆕' : '') + '</b></div>' +
        '<div><small>Schüsse übrig</small><b>' + st.shotsLeft + '</b></div><div><small>Münzen</small><b>+' + r.coins + ' 🪙</b></div></div>' + reward +
        (fresh.length ? '<p>🏅 ' + fresh.map(a => app.ui.esc(a.name)).join(', ') + '</p>' : '') +
        (def.id === 150 ? '<p class="tip">💬 Du hast den Großen Radioturm erobert! Alle Funkblasen tanzen für dich. Danke fürs Spielen!</p>' : def.index === 15 ? '<p class="tip">💬 Welt ' + def.world + ' geschafft! Auf zur nächsten Welt: ' + app.ui.esc((L.WORLDS[def.world] || L.WORLDS[9]).name) + '.</p>' : '');
      for (let i = 0; i < stars; i++) setTimeout(() => app.sfx('star3', i), 250 + i * 250);
      if (def.id < 150) actions.push({ label: '▶ Nächstes Level', primary: true, focus: true, fn: () => { app.mapWorld = Math.floor(def.id / 15) + 1; endSession(); app.levelIntro(def.id + 1); } });
      actions.push({ label: '↻ Wiederholen', primary: def.id === 150, fn: () => retry() }, { label: '🗺️ Weltkarte', fn: () => { app.mapWorld = def.world; toMenu('scrMap'); } });
    } else if (def.mode === 'daily') {
      const r = sv.recordDaily(def.date, st.score, true); sv.data.stats.wins++; afterAch();
      title = 'Tagesaufgabe geschafft!';
      html = '<div class="facts"><div><small>Punkte</small><b>' + app.ui.fmt(st.score) + '</b></div><div><small>Bestleistung heute</small><b>' + app.ui.fmt(sv.data.daily[def.date].best) + (r.newBest ? ' 🆕' : '') + '</b></div></div>' + (r.coins ? '<p>+' + r.coins + ' 🪙 für den ersten Sieg heute</p>' : '<p class="muted">Die Tagesmünzen hast du heute schon bekommen.</p>');
      actions.push({ label: '↻ Nochmal', primary: true, focus: true, fn: () => retry() }, { label: '🏠 Hauptmenü', fn: () => toMenu('scrMenu') });
    } else {
      title = 'Feld geräumt!'; html = '<p>' + app.ui.fmt(st.score) + ' Punkte im freien Spiel.</p>';
      actions.push({ label: '▶ Neues Feld', primary: true, focus: true, fn: () => retry() }, { label: '🏠 Hauptmenü', fn: () => toMenu('scrMenu') });
    }
    app.persist();
    setTimeout(() => { if (app.session === S) app.ui.modal({ title, html, actions, back: () => {} }); }, reducedMotion() ? 200 : 900);
  }
  function onLose(S, res) {
    if (app.applied) return; app.applied = true;
    const st = S.st, def = app.def, sv = app.save;
    app.sfx('lose'); sv.addStat('losses', 1);
    let title = 'Knapp daneben!', html = '', actions = [];
    const reason = res.reason === 'danger' ? '🔴 Die Blasen haben die rote Gefahrenlinie erreicht.' : '🎯 Keine Schüsse mehr übrig.';
    if (def.mode === 'endless') {
      const r = sv.recordEndless(st.score, st.wave); afterAch(); title = 'Runde vorbei';
      html = '<p>' + reason + '</p><div class="facts"><div><small>Punkte</small><b>' + app.ui.fmt(st.score) + (r.newBest ? ' 🆕' : '') + '</b></div><div><small>Rekord</small><b>' + app.ui.fmt(sv.data.endless.best) + '</b></div><div><small>Neue Reihen</small><b>' + st.wave + '</b></div><div><small>Münzen</small><b>+' + r.coins + ' 🪙</b></div></div>';
      actions.push({ label: '↻ Neue Runde', primary: true, focus: true, fn: () => retry() }, { label: '🏠 Hauptmenü', fn: () => toMenu('scrMenu') });
    } else {
      if (def.mode === 'daily') sv.recordDaily(def.date, st.score, false);
      const g = E.goalProgress(st), left = st.goal.type === 'rescue' ? 'Noch ' + (g.max - g.cur) + ' Kristalle fehlen.' : st.goal.type === 'score' ? 'Noch ' + app.ui.fmt(g.max - g.cur) + ' Punkte fehlen.' : 'Noch ' + g.cur + ' Farbblasen übrig.';
      const tips = res.reason === 'danger' ? 'Tipp: Räume zuerst die untersten Blasen ab und nutze Bandenschüsse.' : 'Tipp: Ziele auf Stellen, an denen große Gruppen herunterfallen, und tausche die Kugel, wenn sie nicht passt.';
      html = '<p>' + reason + '</p><p>' + left + '</p><p class="tip">💬 ' + tips + '</p>';
      actions.push({ label: '↻ Erneut versuchen', primary: true, focus: true, fn: () => retry() });
      if (def.mode === 'level') actions.push({ label: '🗺️ Weltkarte', fn: () => { app.mapWorld = def.world; toMenu('scrMap'); } });
      actions.push({ label: '🏠 Hauptmenü', fn: () => toMenu('scrMenu') });
    }
    app.persist();
    setTimeout(() => { if (app.session === S) app.ui.modal({ title, html, actions, back: () => {} }); }, reducedMotion() ? 200 : 700);
  }

  boot();
})(typeof self !== 'undefined' ? self : this);
