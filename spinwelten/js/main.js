/* Spinwelten 3D – Hauptprogramm: Start, Ansichten (Menü, Maschine, Dorf, Atlas, Ziel, Bühne, Minispiel), HUD, Eingabe, Speichern. */
(function (SW) {
  'use strict';
  const L = (de, en) => SW.L(de, en), tx = o => SW.tx(o), F = n => SW.fmt(n);
  const UI = SW.UI, h = UI.h, btn = UI.btn;
  const T = () => globalThis.THREE;
  const A = SW.App = { view: 'boot', mult: 1, auto: false, autoN: 0, spinning: false, prev: 'machine', tut: SW.Tutorial };
  const $ = id => document.getElementById(id);

  // ---------- Start ----------
  function boot() {
    const B = window.SW_BOOT;
    try {
      A.set = SW.Save.loadSettings();
      const lang = A.set.lang || (/^en\b/i.test(navigator.language || '') ? 'en' : 'de'); SW.setLang(lang);
      document.body.classList.toggle('reduced', !!A.set.reducedMotion);
      SW.Input.init(A.set);
      B.step(L('Welt wird erschaffen …', 'Creating world …'));
      A.r = new SW.Renderer($('gl'), A.set.quality);
      A.r.onLost = () => { UI.toast(L('Grafik wird wiederhergestellt …', 'Restoring graphics …')); };
      A.r.onRestore = () => rebuildScenes();
      A.r.onDowngrade = lv => UI.toast(L('Grafik automatisch reduziert: ', 'Graphics reduced automatically: ') + lv);
      let st = SW.Save.load();
      A.g = SW.newGame(st);
      wire();
      A.island = new SW.Island({ quality: A.r.q });
      A.machine = new SW.Machine();
      loadOwn();
      A.r.onFrame = frame;
      buildUI();
      addEventListener('resize', () => { A.r.resize(); layout(); });
      addEventListener('orientationchange', () => setTimeout(() => { A.r.resize(); layout(); }, 200));
      document.addEventListener('visibilitychange', () => { if (document.hidden) A.save(true); else { A.g.tick(); hud(); } });
      addEventListener('pagehide', () => A.save(true));
      setInterval(() => { A.g.tick(); hud(); }, 1000);
      setInterval(() => A.save(), 15000);
      SW.Audio.setVol('sfx', A.set.sfx); SW.Audio.setVol('music', A.set.music);
      const unlock = () => { if (SW.Audio.init()) { SW.Audio.setVol('sfx', A.set.sfx); SW.Audio.setVol('music', A.set.music); SW.Audio.music(A.g.world().music); } };
      addEventListener('pointerdown', unlock, { once: true }); addEventListener('keydown', unlock, { once: true });
      SW.Input.onPad = (on, id) => UI.toast(on ? '🎮 ' + L('Controller verbunden', 'Controller connected') + (id ? ' · ' + String(id).slice(0, 28) : '') : '🎮 ' + L('Controller getrennt', 'Controller disconnected'));
      A.r.start();
      B.finish();
      setTimeout(() => { $('boot').remove(); go('menu'); if (SW.Lobby.fromUrl()) return; }, 250);
    } catch (e) {
      console.error(e);
      B.fail(L('Das Spiel konnte nicht starten: ', 'The game could not start: ') + (e && e.message));
    }
  }
  function rebuildScenes() {
    A.island.dispose(); A.island = new SW.Island({ quality: A.r.q }); A.machine = new SW.Machine(); A.atlas = null; A.stage = null;
    loadOwn(); go(A.view === 'boot' ? 'menu' : A.view);
  }
  function loadOwn(mode) {
    const s = A.g.s, w = A.g.world();
    A.island.q = A.r.q;
    A.island.load(w, s.stages, s.damaged, { mode: mode || 'backdrop' });
    A.island.resize(A.r.w, A.r.h);
    A.ownLoaded = true;
    if (SW.Audio.ready) SW.Audio.music(w.music);
  }
  A.kiviImg = function () {
    if (A._kivi) return A._kivi;
    const c = document.createElement('canvas'); c.width = c.height = 96; const x = c.getContext('2d');
    const g = x.createRadialGradient(40, 36, 6, 48, 50, 40); g.addColorStop(0, '#bff6ff'); g.addColorStop(1, '#2bb6c8');
    x.fillStyle = '#7bd88f'; x.beginPath(); x.ellipse(14, 52, 14, 6, -0.4, 0, 7); x.ellipse(82, 52, 14, 6, 0.4, 0, 7); x.fill();
    x.fillStyle = g; x.beginPath(); x.arc(48, 50, 30, 0, 7); x.fill();
    x.strokeStyle = '#f2d08a'; x.lineWidth = 5; x.beginPath(); x.ellipse(48, 52, 33, 9, 0, 0, 7); x.stroke();
    x.fillStyle = '#ff6b6b'; x.beginPath(); x.moveTo(48, 6); x.lineTo(54, 24); x.lineTo(42, 24); x.fill();
    x.fillStyle = '#fff'; x.beginPath(); x.arc(38, 46, 7, 0, 7); x.arc(58, 46, 7, 0, 7); x.fill();
    x.fillStyle = '#14204a'; x.beginPath(); x.arc(39, 47, 3.5, 0, 7); x.arc(59, 47, 3.5, 0, 7); x.fill();
    return (A._kivi = c.toDataURL());
  };

  // ---------- Spiel-Ereignisse ----------
  function wire() {
    const g = A.g;
    g.on('build', o => { if (A.view === 'village' || A.view === 'machine') A.island.setBuilding(o.b, A.g.s.stages[o.b], A.g.s.damaged[o.b], true); SW.Audio.sfx('build'); });
    g.on('repair', o => { A.island.setBuilding(o.b, A.g.s.stages[o.b], false, true); SW.Audio.sfx('build'); });
    g.on('achievement', a => { UI.toast('🏆 ' + tx(a.name) + ' · +🔷 5', 3200); SW.Audio.sfx('level'); });
    g.on('companion', c => { const d = SW.COMPANIONS.find(x => x.id === c.id); UI.toast('✨ ' + L('Neuer Begleiter: ', 'New companion: ') + tx(d.name), 3600); });
    g.on('complevel', c => { const d = SW.COMPANIONS.find(x => x.id === c.id); UI.toast('⭐ ' + tx(d.name) + ' → ' + L('Stufe ', 'level ') + c.lvl); });
    g.on('eventTier', e => UI.toast('🎯 ' + L('Event-Stufe erreicht: ', 'Event tier reached: ') + UI.rwText(e.rw), 3200));
    g.on('eventNew', () => UI.toast('🎪 ' + L('Neues Event: ', 'New event: ') + tx(SW.Clock.eventAt(g.now()).def.name), 3600));
    g.on('album', a => UI.toast('📖 ' + L('Album komplett! ', 'Album complete! ') + UI.rwText(a.rew), 3600));
    g.on('newday', () => { if (A.view !== 'menu') dailyPrompt(); });
    g.on('botEvents', evs => {
      const mine = evs.filter(e => e && e.by && (e.kind === 'attack' || e.kind === 'raid'));
      mine.slice(0, 3).forEach(e => {
        const bot = SW.BOTS.find(b => b.id === e.by), n = bot ? bot.name + ' 🤖' : '?';
        if (e.kind === 'raid') UI.toast('🧭 ' + n + L(' hat bei dir gegraben: −🪙 ', ' dug on your island: −🪙 ') + F(e.coins), 3600);
        else if (e.blocked) { UI.toast('🛡️ ' + L('Sturm von ', 'Storm from ') + n + L(' abgewehrt!', ' blocked!'), 3600); SW.Audio.sfx('shield'); }
        else { UI.toast('🌪️ ' + n + L(' hat ein Bauwerk getroffen. Repariere es im Dorf!', ' hit a building. Repair it in the village!'), 4000); SW.Audio.sfx('hit'); }
      });
      if (mine.length && A.ownLoaded && (A.view === 'machine' || A.view === 'village')) { const s = g.s; for (let b = 0; b < 5; b++) A.island.setBuilding(b, s.stages[b], s.damaged[b], false); }
      A.after();
    });
  }
  // nach jeder Aktion: speichern (gebündelt), Anzeigen aktualisieren
  A.after = function () { hud(); builds(); A.saveSoon(); dots(); };
  A.saveSoon = function () { clearTimeout(A._st); A._st = setTimeout(() => A.save(), 800); };
  A.save = function (force) { if (!A.g) return; const r = SW.Save.save(A.g.s, force); if (r === false && !A._saveWarn) { A._saveWarn = true; UI.toast(L('Speichern nicht möglich (Speicher voll oder gesperrt). Exportiere deinen Stand!', 'Saving failed (storage full or blocked). Export your progress!'), 5000); } };
  A.loadState = function (st) { A.save(true); try { SW.Save.saveSlot('Auto', A.g.s); } catch (e) { /* */ } A.g = SW.newGame(SW.Save.sanitize ? SW.Save.sanitize(st) : st); wire(); A.save(true); UI.closeSheet(true); UI.closeDialogs(); loadOwn(); go('machine'); };
  A.exportSave = function () {
    const blob = new Blob([SW.Save.exportJSON(A.g.s)], { type: 'application/json' }), a = h('a', { href: URL.createObjectURL(blob), download: 'spinwelten-spielstand.json' });
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };
  A.setSetting = function (k, v) {
    A.set[k] = v; SW.Save.saveSettings(A.set);
    if (k === 'sfx' || k === 'music') { SW.Audio.setVol(k, v); if (k === 'music' && v > 0 && SW.Audio.ready) SW.Audio.music(A.g.world().music); }
    if (k === 'reducedMotion') document.body.classList.toggle('reduced', !!v);
  };
  A.saveControls = function () { A.set.keymap = SW.Input.keys; A.set.padmap = SW.Input.pad; SW.Save.saveSettings(A.set); };
  A.applyQuality = function () { if (A.r.setQuality(A.set.quality)) { rebuildScenes(); } };
  A.fullscreen = function () {
    const d = document, el = d.documentElement;
    try { if (d.fullscreenElement || d.webkitFullscreenElement) (d.exitFullscreen || d.webkitExitFullscreen).call(d); else (el.requestFullscreen || el.webkitRequestFullscreen).call(el); }
    catch (e) { UI.toast(L('Vollbild wird hier nicht unterstützt.', 'Fullscreen is not supported here.')); }
  };
  A.restartTutorial = function () { SW.Tutorial.restart(); go('machine'); };
  A.newGamePlus = function () { if (A.g.newGamePlus()) { A.after(); A.save(true); loadOwn(); go('machine'); UI.toast('✨ NG+' + A.g.s.ngp); } };
  A.openChest = type => SW.Flows.chest(type);
  A.rebuildUI = function () { const v = A.view; buildUI(); go(v); };

  // ---------- Ansichten ----------
  function go(v) {
    const r = A.r, prevView = A.view; A.view = v;
    SW.Flows.closePick();
    if (prevView === 'target' && v !== 'target') { SW.Flows.cleanRaid(); SW.Flows.mode = null; }
    if ((prevView === 'target' || prevView === 'visit') && v !== prevView) loadOwn();
    $('menu').classList.toggle('hidden', v !== 'menu');
    const coach = $('coach'); if (coach) coach.classList.toggle('hidden', v === 'menu' || v === 'atlas');
    const game = v === 'machine' || v === 'village';
    $('hud').classList.toggle('hidden', !(game || v === 'atlas' || v === 'target' || v === 'visit'));
    $('hudSub').classList.toggle('hidden', !game);
    $('dock').classList.toggle('hidden', !(game || v === 'atlas' || v === 'visit'));
    $('spinRow').classList.toggle('hidden', v !== 'machine');
    $('builds').classList.toggle('hidden', v !== 'village');
    $('isleName').classList.toggle('hidden', !(game || v === 'visit'));
    document.querySelectorAll('.tabs .tab').forEach(t => t.classList.toggle('on', t.dataset.tab === v || (v === 'visit' && t.dataset.tab === 'atlas')));
    r.overlay = null;
    if (v === 'menu') { r.main = A.island; A.island.setMode('backdrop'); }
    else if (v === 'machine') { r.main = A.island; A.island.setMode('backdrop'); r.overlay = A.machine; }
    else if (v === 'village' || v === 'visit') { r.main = A.island; A.island.setMode('diorama'); }
    else if (v === 'target') { r.main = A.island; }
    else if (v === 'atlas') { if (!A.atlas) A.atlas = new SW.Atlas(); A.atlas.setState(A.g.s); r.main = A.atlas; }
    r.resize(); layout(); hud(); builds();
    if (v === 'village' || v === 'machine') { A.prev = v; if (SW.Tutorial) SW.Tutorial.after('view:' + v); }
    if (game) setTimeout(() => continuePending(), 300);
    UI.refocus();
  }
  A.go = go;
  A.showTarget = function (v) {
    A.island.load(SW.WORLDS[v.island - 1], v.stages, v.damaged, { mode: 'target' });
    A.island.resize(A.r.w, A.r.h); A.ownLoaded = false;
    const st = A.g.s.bots[v.id];
    go('target');
    if (st && st.shields > 0) setTimeout(() => A.island.fx.shield(new (T().Vector3)(0, 2, 0), A.island.r * 1.15, '#7dffcf'), 400);
    $('isleName').classList.remove('hidden'); $('isleName').innerHTML = ''; $('isleName').appendChild(document.createTextNode(v.name + ' 🤖')); $('isleName').appendChild(h('small', null, tx(SW.WORLDS[v.island - 1].name)));
  };
  A.showStage = function (kind, a, b) {
    if (!A.stage) A.stage = new SW.Characters.Stage();
    if (kind === 'comp') A.stage.show(a, b); else A.stage.showChest(a);
    A.stage.resize(A.r.w, A.r.h); A.r.main = A.stage; A.r.overlay = null; A.stageOn = true;
  };
  A.hideStage = function () { if (!A.stageOn) return; A.stageOn = false; go(A.view === 'menu' ? 'menu' : A.view); };
  A.travel = function (from, to, cb) {
    go('atlas'); A.atlas.setState({ island: from + 1 });
    UI.toast(L('Reise zur nächsten Insel …', 'Travelling to the next island …'));
    A.atlas.travel(from, to, A.set.reducedMotion ? 0.4 : 2.6 / (A.set.speed || 1), () => { A.atlas.setState(A.g.s); loadOwn(); go('village'); if (cb) cb(); });
  };
  function continuePending() {
    const p = A.g.s.pending; if (!p || A.spinning || UI.hasDialog() || UI.sheetOpen() || A.view === 'target') return;
    if (p.kind === 'attack') SW.Flows.attack(); else if (p.kind === 'raid') SW.Flows.raid();
  }
  function dailyPrompt() {
    const g = A.g; if (g.s.daily.bonus || !g.s.tutorial.done || UI.hasDialog()) return;
    UI.dialog({ title: L('Täglicher Bonus', 'Daily bonus'), img: A.kiviImg(), text: L('Schön, dass du da bist! Heute gibt es ', 'Good to see you! Today you get ') + g.prof.dailySpins + L(' Gratis-Spins und Münzen.', ' free spins and coins.'),
      buttons: [{ label: L('Abholen', 'Claim'), cls: 'gold', fn: () => { const r = g.claimDaily(); if (r) { A.after(); UI.reward('+' + r.spins + ' ⚡', '🪙 ' + F(r.coins)); SW.Audio.sfx('win'); } } }] });
  }

  // ---------- Oberfläche ----------
  function buildUI() {
    const ui = $('ui'); ui.innerHTML = '';
    const menu = h('div', { id: 'menu', cls: 'hidden' }, [
      h('div', { cls: 'title' }, [h('h1', null, 'Spinwelten 3D'), h('div', { cls: 'sub' }, L('Das Abenteuer der Wunderinseln', 'The Adventure of the Wonder Isles')), h('div', { cls: 'tag' }, L('Drehen. Entdecken. Bauen. Erobern.', 'Spin. Explore. Build. Conquer.'))]),
      h('div', { cls: 'mgrid' }, [
        btn(A.g.s.stats.spins ? L('▶ Fortsetzen', '▶ Continue') : L('▶ Spielen', '▶ Play'), () => startGame(), 'gold big', { id: 'mPlay' }),
        btn('🗺️ ' + L('Weltkarte', 'World map'), () => go('atlas')),
        btn('🌐 ' + L('Online', 'Online'), () => SW.Lobby.open()),
        btn('🃏 ' + L('Sammlung', 'Collection'), () => SW.Panels.collection()),
        btn('🐾 ' + L('Begleiter', 'Companions'), () => SW.Panels.companions()),
        btn('🏆 ' + L('Erfolge', 'Achievements'), () => SW.Panels.achievements()),
        btn('⚙️ ' + L('Einstellungen', 'Settings'), () => SW.Panels.settings()),
        btn('📘 ' + L('Anleitung', 'How to play'), () => SW.Panels.guide()),
        btn('👤 ' + L('Profil & Google-Spielstand', 'Profile & Google save'), () => SW.Panels.profile()),
        btn('🎮 Easygames', () => { location.href = '../'; }, 'ghost')])]);
    const hudEl = h('div', { id: 'hud', cls: 'hidden' }, [
      h('button', { cls: 'hbtn', id: 'hMenu', 'aria-label': L('Menü', 'Menu'), type: 'button', onclick: () => pauseMenu() }, '☰'),
      h('div', { cls: 'pill', id: 'hudCoins', title: L('Münzen', 'Coins') }, [h('span', { cls: 'ic' }, '🪙'), h('b', { id: 'vCoins' }, '0')]),
      h('div', { cls: 'pill', id: 'hudEnergy', title: L('Energie', 'Energy') }, [h('span', { cls: 'ic' }, '⚡'), h('b', { id: 'vEnergy' }, '0'), h('small', { id: 'vTimer' }, '')]),
      h('button', { cls: 'hbtn', id: 'hQuest', 'aria-label': L('Aufgaben', 'Quests'), type: 'button', onclick: () => SW.Panels.quests() }, ['📜', h('span', { cls: 'dot hidden', id: 'dQuest' })])]);
    const sub = h('div', { id: 'hudSub', cls: 'hidden' }, [
      h('div', { cls: 'pill', title: L('Relikte', 'Relics') }, [h('span', { cls: 'ic' }, '🔷'), h('b', { id: 'vRelics' }, '0')]),
      h('div', { cls: 'pill', title: L('Schutzorbs', 'Shield orbs') }, [h('span', { cls: 'ic' }, '🛡️'), h('b', { id: 'vShields' }, '0')]),
      h('div', { cls: 'pill', title: L('Truhen', 'Chests') }, [h('span', { cls: 'ic' }, '🎁'), h('b', { id: 'vChests' }, '0')]),
      h('div', { cls: 'pill', id: 'hudEvent', title: 'Event' }, [h('span', { cls: 'ic', id: 'vEvIc' }, '🎪'), h('b', { id: 'vEvent' }, '')])]);
    const name = h('div', { id: 'isleName', cls: 'hidden' });
    const tabs = h('div', { cls: 'tabs', role: 'tablist' }, [
      tab('machine', '🎰', L('Maschine', 'Machine')), tab('village', '🏘️', L('Dorf', 'Village')), tab('atlas', '🗺️', L('Atlas', 'Atlas')), tab('more', '✦', L('Mehr', 'More'))]);
    const spin = h('div', { cls: 'spinrow', id: 'spinRow' }, [
      btn(h('span', { id: 'mLab' }, '×1'), () => cycleMult(1), 'round', { id: 'multBtn', 'aria-label': L('Multiplikator', 'Multiplier') }),
      btn([h('span', null, L('DREHEN', 'SPIN')), h('small', { id: 'spinSub' }, '')], () => doSpin(), 'gold', { id: 'spinBtn' }),
      btn([h('span', null, 'AUTO'), h('small', { id: 'autoLab' }, '')], () => toggleAuto(), 'round', { id: 'autoBtn' })]);
    const bl = h('div', { id: 'builds', cls: 'hidden' });
    const dock = h('div', { id: 'dock', cls: 'hidden' }, [spin, bl, tabs]);
    ui.appendChild(menu); ui.appendChild(hudEl); ui.appendChild(sub); ui.appendChild(name); ui.appendChild(dock);
    UI.baseLayer = () => (A.view === 'menu' ? $('menu') : $('ui'));
    setupPointer();
  }
  function tab(id, ic, label) { const b = h('button', { cls: 'tab', type: 'button', 'data-tab': id, role: 'tab' }, [h('b', null, ic), label, h('span', { cls: 'dot hidden', id: 'dt_' + id })]); b.addEventListener('click', () => { SW.Audio.sfx('click'); if (id === 'more') moreMenu(); else go(id); }); return b; }
  function startGame() {
    go('machine');
    const t = A.g.s.tutorial;
    if (t && !t.done) SW.Tutorial.start(); else dailyPrompt();
  }
  function moreMenu() {
    const items = [
      ['🃏', L('Sammlung', 'Collection'), () => SW.Panels.collection()], ['🐾', L('Begleiter', 'Companions'), () => SW.Panels.companions()],
      ['📜', L('Aufgabenbuch', 'Quest book'), () => SW.Panels.quests()], ['🎲', L('Minispiele', 'Minigames'), () => SW.Panels.minigames()],
      ['🏆', L('Erfolge', 'Achievements'), () => SW.Panels.achievements()], ['📰', L('Verlauf & Rangliste', 'History & ranking'), () => SW.Panels.history()],
      ['🌐', L('Online', 'Online'), () => SW.Lobby.open()], ['⚙️', L('Einstellungen', 'Settings'), () => SW.Panels.settings()],
      ['📘', L('Anleitung', 'How to play'), () => SW.Panels.guide()], ['👤', L('Profil', 'Profile'), () => SW.Panels.profile()], ['🏠', L('Hauptmenü', 'Main menu'), () => go('menu')]];
    UI.sheet(L('Mehr', 'More'), [{ id: 'm', label: '', render: body => { const gr = h('div', { cls: 'mgrid', style: 'width:100%' }); items.forEach(([i, t, f]) => gr.appendChild(btn(i + ' ' + t, () => { UI.closeSheet(true); f(); }))); body.appendChild(gr); } }], 'm');
  }
  function pauseMenu() {
    if (A.auto) toggleAuto();
    UI.dialog({ title: L('Pause', 'Paused'), buttons: [{ label: L('Weiterspielen', 'Resume'), cls: 'gold' }, { label: L('Einstellungen', 'Settings'), fn: () => SW.Panels.settings() }, { label: L('Hauptmenü', 'Main menu'), fn: () => go('menu') }] });
  }
  function layout() {
    const m = A.machine; if (!m || !A.r) return;
    const hh = A.r.h || innerHeight, top = $('hudSub') && !$('hudSub').classList.contains('hidden') ? $('hudSub').getBoundingClientRect().bottom + 30 : 70;
    const dk = $('dock') && !$('dock').classList.contains('hidden') ? $('dock').getBoundingClientRect().top : hh;
    const land = innerWidth > innerHeight && innerHeight < 500;
    m.layout = { top: Math.min(0.4, top / hh), bottom: land ? 0.04 : Math.min(0.45, (hh - dk + 8) / hh) };
    m.resize(A.r.w, A.r.h);
  }
  function hud() {
    if (!A.g || !$('vCoins')) return;
    const g = A.g, s = g.s;
    $('vCoins').textContent = F(s.coins);
    $('vEnergy').textContent = s.energy + '/' + g.energyMax();
    const nx = g.nextSpinIn(); $('vTimer').textContent = nx > 0 ? SW.Clock.fmtDur(nx, SW.lang) : '';
    $('vRelics').textContent = F(s.relics); $('vShields').textContent = s.shields + '/' + g.maxShields();
    $('vChests').textContent = Object.values(s.chests).reduce((a, b) => a + b, 0);
    const ev = SW.Clock.eventAt(g.now()); $('vEvIc').textContent = ev.def.icon; $('vEvent').textContent = F(s.ev.pts);
    const ms = g.mults(); if (!ms.includes(A.mult)) A.mult = 1;
    $('mLab').textContent = '×' + A.mult;
    $('spinSub').textContent = A.spinning ? '…' : (s.pending ? (s.pending.kind === 'attack' ? L('Sturm wartet', 'Storm waiting') : L('Expedition wartet', 'Expedition waiting')) : '−' + A.mult + ' ⚡');
    $('autoLab').textContent = A.auto ? (A.set.autoSpinMax ? (A.set.autoSpinMax - A.autoN) + '' : '∞') : '';
    $('autoBtn').classList.toggle('jade', A.auto); $('spinBtn').classList.toggle('auto', A.auto);
    const n = $('isleName');
    if (A.view === 'machine' || A.view === 'village') { const w = g.world(); n.innerHTML = ''; n.appendChild(document.createTextNode(w.n + '. ' + tx(w.name))); n.appendChild(h('small', null, L('Kapitel ', 'Chapter ') + (g.chapter() + 1) + ' · ' + g.stepsDone() + '/25 ' + L('Ausbauten', 'upgrades') + (s.ngp ? ' · NG+' + s.ngp : ''))); }
    if (s.clockWarn) { s.clockWarn = false; UI.toast(L('Die Geräteuhr wurde zurückgestellt – Energie zählt ab jetzt neu.', 'The device clock went backwards – energy counts again from now.'), 4000); }
  }
  function dots() {
    if (!$('dQuest')) return;
    const g = A.g, ready = g.activeQuests().some(a => a.ready) || g.dailyGoals().some(x => !x.done && x.v >= x.g.n) || !g.s.daily.bonus;
    $('dQuest').classList.toggle('hidden', !ready);
    const canBuild = [0, 1, 2, 3, 4].some(b => (g.s.damaged[b] ? g.repairCostOf(b) : g.s.stages[b] < 5 ? g.buildCost(b) : Infinity) <= g.s.coins);
    $('dt_village').classList.toggle('hidden', !canBuild);
  }
  function builds() {
    const el = $('builds'); if (!el || A.view !== 'village') return;
    const g = A.g, s = g.s, w = g.world(); el.innerHTML = '';
    w.buildings.forEach((b, i) => {
      const st = s.stages[i], dmg = s.damaged[i], max = st >= 5 && !dmg, cost = dmg ? g.repairCostOf(i) : max ? 0 : g.buildCost(i);
      const card = h('button', { cls: 'bcard' + (dmg ? ' dmg' : '') + (max ? ' max' : '') + (!max && cost > s.coins ? ' poor' : ''), type: 'button', 'aria-label': tx(b.name) }, [
        h('div', { cls: 'nm' }, tx(b.name)), h('div', { cls: 'st' }, [0, 1, 2, 3, 4].map(k => h('i', { cls: k < st ? 'on' : '' }))),
        h('div', { cls: 'cost' }, dmg ? '🔧 ' + F(cost) : max ? '✓ ' + L('Fertig', 'Done') : '🪙 ' + F(cost))]);
      card.addEventListener('click', () => buildTap(i)); card.addEventListener('focus', () => A.island.focus(i));
      el.appendChild(card);
    });
    if (g.islandComplete() && A.view === 'village' && !A._doneT) A._doneT = setTimeout(() => { A._doneT = 0; if (A.view === 'village' && A.g.islandComplete() && !UI.hasDialog()) SW.Flows.islandDone(); }, 700);
  }
  function buildTap(i) {
    const g = A.g, s = g.s;
    if (A.view !== 'village') { go('village'); return; }
    let r; const wasDmg = s.damaged[i];
    if (wasDmg) r = g.repair(i); else if (s.stages[i] >= 5) { A.island.focus(i); UI.toast(tx(g.world().buildings[i].desc || g.world().buildings[i].name)); return; } else r = g.build(i);
    if (r.error === 'coins') { SW.Audio.sfx('error'); UI.toast(L('Noch 🪙 ', 'Need 🪙 ') + F(r.cost - s.coins) + L(' – dreh an der Runenmaschine!', ' more – spin the Rune Machine!')); return; }
    if (r.error) return;
    A.island.focus(i);
    if (r.bonus) UI.toast('🦫 +🪙 ' + F(r.bonus));
    A.after();
    if (SW.Tutorial) SW.Tutorial.after(wasDmg ? 'repair' : 'build');
  }

  // ---------- Runenmaschine ----------
  function cycleMult(d) { const ms = A.g.mults(); let i = ms.indexOf(A.mult) + d; if (i >= ms.length) i = 0; if (i < 0) i = ms.length - 1; A.mult = ms[i]; hud(); if (ms.length === 1) UI.toast(L('Höhere Multiplikatoren gibt es nach der ersten Insel.', 'Higher multipliers unlock after the first island.')); }
  function toggleAuto() { A.auto = !A.auto; A.autoN = 0; hud(); if (A.auto && !A.spinning) doSpin(); }
  function doSpin() {
    if (A.view !== 'machine') { go('machine'); return; }
    if (A.spinning) { A.machine.finishNow(); return; }
    const g = A.g, res = g.spin(A.mult);
    if (res.error) {
      A.auto = false; hud();
      if (res.error === 'pending') continuePending();
      else if (res.error === 'energy') { SW.Audio.sfx('error'); UI.toast(L('Keine Energie. Nächster Spin in ', 'No energy. Next spin in ') + SW.Clock.fmtDur(g.nextSpinIn(), SW.lang) + (A.mult > 1 ? L(' – oder Multiplikator senken.', ' – or lower the multiplier.') : ''), 3200); if (!g.s.daily.bonus) dailyPrompt(); }
      return;
    }
    A.spinning = true; A.autoN++; hud(); A.saveSoon();
    SW.Audio.sfx('spin');
    const sp = (A.set.speed || 1) * (A.auto ? 1.4 : 1);
    A.machine.spin(res.ids, { speed: sp, skip: !!A.set.skip, onStop: () => SW.Audio.sfx('stop'), onDone: () => afterSpin(res) });
  }
  function afterSpin(res) {
    A.spinning = false;
    const r = res.reward || {}, sym = SW.REELS.SYMBOLS.find(s => s.id === res.sym);
    if (r.coins) { UI.reward('🪙 +' + F(r.coins), res.rule === 'three' ? tx(sym.name) + ' ×3' : ''); SW.Audio.sfx(res.big || res.jackpot ? 'big' : 'coin'); A.machine.win(sym ? sym.col : '#ffd98a', res.big || res.jackpot); }
    else if (res.rule !== 'none') A.machine.win(sym ? sym.col : '#ffd98a', false);
    if (r.spins) UI.toast('⚡ +' + r.spins);
    if (res.extra.shieldAdded) { UI.toast('🛡️ ' + L('Schutzorb erhalten!', 'Shield orb gained!')); SW.Audio.sfx('shield'); }
    if (res.extra.shieldOverflow) UI.toast('🛡️ ' + L('Schilde voll – stattdessen 🪙 ', 'Shields full – instead 🪙 ') + F(res.extra.shieldOverflow));
    if (res.extra.relics) UI.toast('🔷 +' + res.extra.relics);
    if (res.jackpot && A.set.haptics && navigator.vibrate) try { navigator.vibrate([40, 40, 80]); } catch (e) { /* */ }
    A.after();
    if (SW.Tutorial) SW.Tutorial.after('spinDone');
    if (res.pending) { A.auto = false; hud(); UI.toast(res.pending.kind === 'attack' ? '⚡ ' + L('Sturmangriff!', 'Storm attack!') : '🧭 ' + L('Schatzexpedition!', 'Treasure expedition!')); setTimeout(() => continuePending(), A.set.skip ? 200 : 900); return; }
    if (res.extra.chest) {
      A.auto = false; hud();
      const tut = SW.Tutorial.active() && SW.Tutorial.step() && SW.Tutorial.step().id === 'chest';
      UI.dialog({ title: '🎁 ' + tx(SW.CHESTS[res.extra.chest].name), text: res.extra.found ? L('Plumi hat eine Truhe gefunden!', 'Plumi found a chest!') : L('Eine Truhe voller Sammelkarten!', 'A chest full of collectible cards!'), noClose: tut,
        buttons: [{ label: L('Öffnen', 'Open'), cls: 'gold', fn: () => SW.Flows.chest(res.extra.chest) }].concat(tut ? [] : [{ label: L('Später', 'Later') }]) });
      return;
    }
    if (A.auto) {
      const max = A.set.autoSpinMax || 0;
      if ((max && A.autoN >= max) || A.g.canSpin(A.mult)) { A.auto = false; hud(); if (A.g.canSpin(A.mult) === 'energy') UI.toast(L('Auto-Drehen gestoppt: Energie leer.', 'Auto-spin stopped: out of energy.')); return; }
      setTimeout(() => { if (A.auto && A.view === 'machine' && !UI.hasDialog() && !UI.sheetOpen()) doSpin(); else { A.auto = false; hud(); } }, A.set.skip ? 250 : 450);
    }
  }

  // ---------- Atlas ----------
  function atlasTap(i) {
    if (i < 0) return;
    A.atlas.select(i);
    const g = A.g, w = SW.WORLDS[i], cur = g.s.island - 1, done = i < cur || g.s.worldsDone.includes(w.n) || g.s.ngp > 0 && i < cur;
    const status = i === cur ? L('Hier bist du gerade.', 'You are here.') : i < cur ? L('Wiederhergestellt ✓', 'Restored ✓') : L('Noch im Nebel – erreiche zuerst die vorherigen Inseln.', 'Still in the mist – reach the previous islands first.');
    const btns = [];
    if (i === cur) btns.push({ label: L('Zur Insel', 'Go to island'), cls: 'gold', fn: () => go('village') });
    else if (i < cur) btns.push({ label: L('Besuchen', 'Visit'), cls: 'gold', fn: () => visit(w) });
    btns.push({ label: L('Schließen', 'Close') });
    UI.dialog({ title: w.n + '. ' + tx(w.name), text: (i <= cur ? tx(w.sub) + '\n' + tx(w.story) + '\n' : '') + status + (i <= cur ? '\n' + L('Minispiel: ', 'Minigame: ') + tx(w.extra.name) : ''), buttons: btns });
    void done;
  }
  function visit(w) {
    A.g.visit(w.n); A.after();
    A.island.load(w, [5, 5, 5, 5, 5], [false, false, false, false, false], { mode: 'diorama' }); A.island.resize(A.r.w, A.r.h); A.ownLoaded = false;
    go('visit');
    const n = $('isleName'); n.innerHTML = ''; n.appendChild(document.createTextNode(w.n + '. ' + tx(w.name))); n.appendChild(h('small', null, L('Besuch · Atlas = zurück', 'Visit · Atlas = back')));
  }

  // ---------- Minispiele ----------
  A.startMinigame = function (id) {
    const g = A.g, how = g.mgBegin();
    if (!how) { UI.toast(L('Heute keine freien Runden mehr – Tickets gibt es aus Portalrunen.', 'No free rounds left today – tickets come from portal runes.')); return; }
    A.after();
    const def = SW.MINIGAMES.find(m => m.id === id), wrap = h('div', { id: 'mg' }), host = h('div', { id: 'mgHost' });
    let ctl = null, ended = false;
    const close = () => { if (ctl) try { ctl.stop(); } catch (e) { /* */ } unsubs.forEach(u => u()); wrap.remove(); A.mgOn = null; A.r.paused = document.hidden; go(A.prev || 'machine'); };
    wrap.appendChild(h('div', { id: 'mgBar' }, [h('h2', null, def.icon + ' ' + tx(def.name)), btn('✕ ' + L('Beenden', 'Quit'), () => close(), 'small')]));
    wrap.appendChild(host); document.getElementById('ui').appendChild(wrap);
    A.r.paused = true;   // 3D ruht während des Minispiels
    const fns = [], unsubs = [];
    const input = { on: fn => { fns.push(fn); return () => { const k = fns.indexOf(fn); if (k >= 0) fns.splice(k, 1); }; } };
    unsubs.push(SW.Input.onUp(a => fns.forEach(f => f(a, false))));
    A.mgOn = a => { fns.forEach(f => f(a, true)); return true; };
    const diff = Math.min(6, 1 + Math.floor((g.s.island - 1) / 5));
    try {
      ctl = SW.Minigames.start(id, host, { lang: SW.lang, difficulty: diff, seed: g.s.id + ':' + SW.Clock.dayKey(g.now()) + ':' + (g.s.stats.minigames || 0), input, sfx: n => SW.Audio.sfx(n === 'win' ? 'win' : n === 'lose' ? 'error' : 'click'), reducedMotion: !!A.set.reducedMotion,
        onEnd: res => {
          if (ended) return; ended = true;
          const out = g.mgResult(id, res && !res.aborted ? res : null); A.after();
          close();
          if (out.win) { SW.Audio.sfx('win'); UI.dialog({ title: L('Gewonnen!', 'You won!') + ' ' + '★'.repeat(out.stars), text: UI.rwText(out.rw) }); }
          else if (res && !res.aborted) UI.toast(L('Knapp! Versuch es noch einmal.', 'Close! Try again.'));
        } });
    } catch (e) { console.error(e); close(); UI.toast(L('Minispiel konnte nicht starten.', 'Minigame could not start.')); }
  };

  // ---------- Eingabe ----------
  function setupPointer() {
    if (A._ptr) return; A._ptr = true;
    const c = $('gl'), pts = new Map(); let down = null, pinch = 0;
    c.addEventListener('pointerdown', e => { c.setPointerCapture(e.pointerId); pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (pts.size === 1) down = { x: e.clientX, y: e.clientY, t: performance.now(), moved: 0 }; else down = null; pinch = 0; SW.Input.lastKind = 'pointer'; });
    c.addEventListener('pointermove', e => {
      const p = pts.get(e.pointerId); if (!p) return;
      const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
      if (pts.size === 2) { const [a, b] = Array.from(pts.values()), d = Math.hypot(a.x - b.x, a.y - b.y); if (pinch) zoom(pinch / d); pinch = d; return; }
      if (down) down.moved += Math.abs(dx) + Math.abs(dy);
      if (down && down.moved > 6) orbit(dx, dy);
    });
    const up = e => {
      pts.delete(e.pointerId);
      if (down && down.moved < 8 && performance.now() - down.t < 500) tap(e.clientX, e.clientY);
      down = null;
    };
    c.addEventListener('pointerup', up); c.addEventListener('pointercancel', e => { pts.delete(e.pointerId); down = null; });
    c.addEventListener('wheel', e => { e.preventDefault(); zoom(e.deltaY > 0 ? 1.1 : 0.9); }, { passive: false });
  }
  function orbit(dx, dy) {
    if (A.r.main === A.atlas && A.atlas) { A.atlas.orbit(dx, 0); A.atlas.climb(dy * 0.05); }
    else if (A.r.main === A.stage && A.stage) A.stage.rotate(dx);
    else if (A.view !== 'machine' && A.view !== 'menu') A.island.orbit(dx, dy);
  }
  function zoom(f) { if (A.r.main === A.atlas && A.atlas) A.atlas.zoom(f); else if (A.view !== 'machine' && A.view !== 'menu') A.island.zoom(f); }
  function tap(x, y) {
    const ndc = A.r.ndc(x, y);
    if (A.view === 'machine') { if (A.machine.pickLever(ndc)) doSpin(); return; }
    if (A.view === 'target') { SW.Flows.pick(ndc); return; }
    if (A.view === 'village') { const b = A.island.pick(ndc); if (b >= 0) buildTap(b); return; }
    if (A.view === 'atlas' && A.atlas) atlasTap(A.atlas.pick(ndc));
  }
  const VIEWS = ['machine', 'village', 'atlas'];
  const inDock = () => { const e = document.activeElement; return !!(e && e.closest && e.closest('#dock')); };
  SW.Input.on((a, src) => {
    if (A.mgOn) return A.mgOn(a);
    if (a === 'fullscreen') { A.fullscreen(); return true; }
    if (UI.hasDialog() || UI.sheetOpen()) {
      if (a === 'up' || a === 'down' || a === 'left' || a === 'right') return UI.move(a);
      if (a === 'ok' || a === 'interact') return UI.activate();
      if (a === 'back' || a === 'pause') return UI.back();
      if (a === 'tabNext') return UI.tab(1); if (a === 'tabPrev') return UI.tab(-1);
      return true;
    }
    const v = A.view;
    if (v === 'menu' || v === 'boot') { if (['up', 'down', 'left', 'right'].includes(a)) return UI.move(a); if (a === 'ok') { if (!UI.activate()) startGame(); return true; } return true; }
    if (a === 'back' || a === 'pause') { if (v === 'target') { UI.toast(L('Wähle ein Ziel oder verzichte im Auswahlfenster.', 'Pick a target or skip in the selection window.')); return true; } if (v === 'visit') { go('atlas'); return true; } pauseMenu(); return true; }
    if (a === 'map') { go(v === 'atlas' ? A.prev : 'atlas'); return true; }
    if (a === 'inv') { SW.Panels.collection(); return true; }
    if (a === 'quest') { SW.Panels.quests(); return true; }
    if (a === 'tabNext' || a === 'tabPrev' || a === 'persp') { if (v === 'target') return true; const i = VIEWS.indexOf(v === 'visit' ? 'atlas' : v); go(VIEWS[(i + (a === 'tabPrev' ? -1 : 1) + VIEWS.length) % VIEWS.length]); return true; }
    if (v === 'machine') {
      if (a === 'ok' || a === 'interact') { if (document.activeElement && document.activeElement.closest && document.activeElement.closest('#dock') && SW.Input.lastKind === 'key' && document.activeElement !== $('spinBtn') && UI.activate()) return true; doSpin(); return true; }
      if (a === 'action') { toggleAuto(); return true; }
      if (a === 'multUp') { cycleMult(1); return true; } if (a === 'multDown') { cycleMult(-1); return true; }
      if (['up', 'down', 'left', 'right'].includes(a)) return UI.move(a);
      return true;
    }
    if (v === 'village' || v === 'atlas' || v === 'target' || v === 'visit') {
      if (['left', 'right', 'up', 'down'].includes(a)) {
        if (v === 'atlas' && A.atlas && src === 'pad') { const d = a === 'right' || a === 'up' ? 1 : -1; A.atlas.select(A.atlas.selected + d); return true; }
        if (src === 'pad' || inDock()) return UI.move(a);
        return true;
      }
      if (a === 'ok' || a === 'interact') { if (v === 'atlas' && A.atlas && !document.activeElement.closest('#dock')) { atlasTap(A.atlas.selected); return true; } if (!UI.activate()) { if (v === 'village') UI.move('right'); } return true; }
      if (a === 'zoomIn' || a === 'multUp') { zoom(0.85); return true; } if (a === 'zoomOut' || a === 'multDown') { zoom(1.15); return true; }
    }
    return false;
  });
  addEventListener('keydown', e => { if (A.view !== 'village' || UI.hasDialog() || UI.sheetOpen() || A.mgOn) return; const m = /^Digit([1-5])$/.exec(e.code); if (m) buildTap(+m[1] - 1); });
  function frame(dt) {
    const ax = SW.Input.poll(dt), I = SW.Input;
    if (A.mgOn || UI.hasDialog() || UI.sheetOpen()) return;
    let ox = 0, oy = 0;
    if (ax) { ox += ax.x * 9; oy += ax.y * 6; }
    if (A.view !== 'machine' && A.view !== 'menu') {
      if (!inDock()) { if (I.held('left')) ox -= 5; if (I.held('right')) ox += 5; if (A.view === 'atlas') { if (I.held('up') && A.atlas) A.atlas.climb(dt * 12); if (I.held('down') && A.atlas) A.atlas.climb(-dt * 12); } else { if (I.held('up')) oy -= 3; if (I.held('down')) oy += 3; } }
      if (ox || oy) orbit(ox * dt * 60, oy * dt * 60);
      if (I.held('zoomIn')) zoom(1 - dt); if (I.held('zoomOut')) zoom(1 + dt);
    }
  }
  // Fortschritt: alle Skripte sind da
  boot();
})(globalThis.SW = globalThis.SW || {});
