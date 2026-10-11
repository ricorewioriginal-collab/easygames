/* Urwaldlager – Start & Spielschleife: Titel (3D-Kamerafahrt), Staffel im begehbaren Camp, Prüfungs-Arena,
   Autosave, Pause. Entwickler-Direktstart einer Prüfung: ?trial=ID[&bot=1&lv=0..2&short=1&max=3] */
(function () {
  'use strict';
  const E = UE, I = UIn, T = UTrials, W = UWorld, C = UCamp, S = USeason, UI = UUI, EV = UEvents, Snd = USnd;
  const q = new URLSearchParams(location.search), loadMsg = document.getElementById('loadMsg');
  const ok = E.init(document.getElementById('gl'), q.get('q') || (UI.set.quality !== 'auto' ? UI.set.quality : undefined));
  I.detect(); I.attach(document.getElementById('gl')); I.mount(document.getElementById('ui')); T.init(); UI.init(); S.init(UI); EV.init(UI); S.migrate();
  const hideLoading = () => { document.getElementById('loading').hidden = true; };
  if (!ok) { hideLoading(); UI.webglError(); return; }
  if (q.get('bot')) T.bot = true;
  const api = window.__ul = { E, I, T, W, C, S, UI, EV };

  // ---------- Entwickler: einzelne Prüfung direkt starten ----------
  const devTrial = q.get('trial');
  if (devTrial) {
    hideLoading(); E.setMode({ render(r) { r.setClearColor(0x06130c); r.clear(); } });
    const run = () => T.start(devTrial, { level: +(q.get('lv') || 1), max: +(q.get('max') || 6), short: q.get('short') === '1', who: { name: 'Testperson', skin: '#e8b98f', hair: '#3b2a1c', hs: 'short', top: '#2a9d8f' } }, res => {
      api.last = res; const m = document.getElementById('menu'); m.hidden = false;
      m.innerHTML = `<div class="card cen"><h2>${res.stars} / ${res.max} ★</h2><p class="h">${res.reason}</p><button class="btn go" id="again">Nochmal</button></div>`;
      m.querySelector('#again').onclick = () => { m.hidden = true; run(); };
    });
    I.onPause = () => { T.onKeyPause(); }; run(); return;
  }

  // ---------- Welt aufbauen ----------
  UI.loading(35, 'Dschungel wird gepflanzt …');
  setTimeout(boot, 60);
  function boot() {
    try { W.build(12); } catch (err) { console.error(err); loadMsg.textContent = 'Fehler beim Aufbau: ' + err.message; return; }
    UI.loading(80, 'Lagerfeuer wird entzündet …');
    setTimeout(boot2, 30);
  }
  function boot2() {
    try { W.setTime(17.6, 'sun', 10); W.cine(20, 7.5, 3, 0, 1.2, 1, 2); W.updateCamera(1); E.renderer.compile(W.scene, W.camera); } catch (err) { console.error(err); }
    W.onThunder = () => Snd.thunder();
    E.hooks.push(k => { if (k === 'hidden' && G() && !G().over) S.save(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden && G() && !G().over && inGame) S.save(); });
    window.addEventListener('pagehide', () => { if (G() && !G().over && inGame) S.save(); });
    I.onPause = why => { if (T.onKeyPause()) return; if (inGame && !UI.menuOpen() && !UI.blocking()) UI.pause(); else if (inGame && UI.menuOpen() && why !== 'lock') resume(); };
        E.setMode(titleMode); UI.loading(100, 'Bereit');
    if (q.get('skipintro')) { UI.dismissLoading(); toTitle(); } else UI.loadReady(() => toTitle());
  }
  const G = () => S.G;

  // ---------- Titel ----------
  let inGame = false, orbit = 0;
  const titleMode = {
    update(dt) { UI.gamepad(dt); orbit += dt * .04; W.setTime(17.6, 'sun', dt); W.cine(Math.cos(orbit) * 20, 7.5, Math.sin(orbit) * 20 + 3, 0, 1.2, 1, 2); W.updateCamera(dt); W.update(dt); Snd.env(0, 0, .3); },
    render: r => W.render(r), get scene() { return W.scene; }, get camera() { return W.camera; }
  };
  function toTitle(discard) {
    if (inGame && G() && !G().over && !discard) S.save();
    inGame = false; UI.setInGame(false); UI.closeAll(); EV.reset(); UI.hudHidden(true); W.clearLabels(); W.hostPose = null; I.setLayout(null); I.setLock(false);
    if (C.npcs) C.npcs.forEach(n => { n.fig.group.visible = false; }); if (W.player.fig) W.player.fig.group.visible = false;
    E.paused = false; E.setMode(titleMode); UI.title();
  }

  // ---------- Staffel ----------
  UI.hooks = {
    newGame(o) { S.clearSave(); const g = S.create(o); startGame(g, true); },
    continueGame() { const g = S.load(); if (!g) { UI.toast('Kein Spielstand gefunden.', 'bad'); return UI.title(); } startGame(g, false); },
    toTitle, resume: () => resume(), onPause: () => { E.paused = true; I.setLock(false); },
    arenaTrial
  };
  function startGame(g, fresh) {
    UI.dismissLoading(); UI.hideMenu(); UI.closeAll(); EV.reset(); W.endCine(); W.hostPose = null;
    W.spawnPlayer(g.you.look); C.init(g, S, UI);
    const p = W.player; p.x = g.player.x; p.z = g.player.z; p.yaw = g.player.yaw; p.state = 'free'; p.carry = null; p.seat = null; p.hammock = false;
    if (Array.isArray(g.branches)) W.branches.forEach((b, i) => { b.have = g.branches[i] !== 0; b.t = 0; b.claim = null; }); else W.branches.forEach(b => { b.have = true; });
    if (Array.isArray(g.fruitN)) W.fruit.forEach((f, i) => { f.n = g.fruitN[i] == null ? 3 : g.fruitN[i]; }); else W.fruit.forEach(f => { f.n = 3; });
    W.seats.forEach(s => { s.used = null; });
    W.updateProps(g.camp); W.setFire(g.camp.fuel); W.setTime(S.hour(), S.weatherNow(), 10); W.snapCam(true);
    if (g.today.mission) EV.missionSetup();
    if (S.isNight() && !fresh) { p.state = 'free'; }
    inGame = true; UI.setInGame(true); E.paused = false; UI.buildHud(); UI.hudHidden(false); UI.tut(); layoutKey = null;
    E.setMode(gameMode); Snd.ambience(true);
    if (fresh) { g.tut.on = UI.set.tips; UI.tut(); UI.intro(g, () => { g.intro = false; S.save(); }); }
    else { UI.toast(`💾 Willkommen zurück – Tag ${g.day}, ${S.alive().length} im Camp.`, 'good'); }
  }
  function resume() { UI.hideMenu(); E.paused = false; layoutKey = null; }

  // ---------- Spielschleife ----------
  let layoutKey = null, socialT = 8, gossipT = 2, saveT = 60, stepT = 0;
  const CAMP_LAYOUT = { joy: true, look: true, buttons: [{ id: 'act', label: '', big: true, hidden: true, cls: 'wide' }, { id: 'alt', label: '🍌 Essen', hidden: true }] };
  const gameMode = {
    update(dt) {
      const g = G(); if (!g) return;
      const blocked = UI.blocking() || C.playerCooking, pl = W.player;
      // Touch-Layout passend zum Zustand
      const want = !UI.hudIsOff() && !UI.blocking() && !g.over ? 'camp' : null;
      if (want !== layoutKey) { layoutKey = want; I.setLayout(want ? CAMP_LAYOUT : null); if (want) UI.carry(pl.carry); }
      if (!g.over) { S.update(dt); C.update(dt); }
      if (!blocked && !g.over) {
        C.updatePlayer(dt);
        if (I.pressed('pause')) UI.pause();
        if (I.pressed('map')) UI.drumPanel();
      }
      const free = !blocked && pl.state === 'free' && !g.over;
      W.updatePlayer(dt, free);
      if (free && pl.speed > 4) { stepT -= dt; if (stepT <= 0) { stepT = .32; Snd.step(); } }
      // Kontext-Aktion
      const nb = free ? W.nearest() : null; UI.prompt(nb);
      if (free && nb && I.pressed('act')) { Snd.click(); nb.o.act(); }
      if (!blocked) I.setLock(pl.state !== 'locked' && !UI.hudIsOff());
      // Welt
      W.setTime(S.hour(), S.weatherNow(), dt); W.update(dt); W.updateCamera(dt);
      W.labelsBegin(); if (!UI.hudIsOff()) C.labels(); W.labelsEnd();
      const goal = g.over ? null : S.goal(); UI.hud(dt, goal); UI.marker(goal);
      if (!UI.hudIsOff()) W.drawMinimap(dt, C.npcs.filter(n => !n.away), goal);
      const fd = Math.hypot(pl.x, pl.z); Snd.env(W.nightK, Math.min(1, W.rainK), g.camp.fuel > .02 ? Math.max(0, 1 - fd / 9) : 0);
      // Soziales & Speichern
      if (!g.over && !UI.blocking()) {
        gossipT -= dt; if (gossipT <= 0) { gossipT = 2; C.gossipTick(); }
        socialT -= dt * S.rate() / 2; if (socialT <= 0) { socialT = 22 + Math.random() * 20; C.socialTick(); }
        saveT -= dt; if (saveT <= 0) { saveT = 60; S.save(); }
      }
      if (!blocked && I.touch && pl.state === 'free' && g.day === 1 && S.hour() < 9) document.getElementById('tjoyHint').classList.add('on'); else document.getElementById('tjoyHint').classList.remove('on');
      if (pl.state === 'free' && Math.hypot(pl.x - (g.player.x || 0), pl.z - (g.player.z || 0)) > 6 && g.tut.on && !g.tut.done.includes('move')) UI.tut('move');
    },
    render: r => W.render(r), get scene() { return W.scene; }, get camera() { return W.camera; }
  };

  // ---------- Prüfungs-Arena ----------
  function arenaTrial(id, lv) {
    UI.hideMenu(); const who = Object.assign({ name: (UI.set.last && UI.set.last.name) || 'Du' }, (UI.set.last && UI.set.last.look) || { skin: '#e8b98f', hair: '#3b2a1c', hs: 'short', top: '#2a9d8f' });
    const done = res => {
      const b = S.best(); b.trials = b.trials || {}; const prev = b.trials[id]; const isBest = res.reason !== 'abort' && (prev == null || res.stars > prev);
      if (isBest) { b.trials[id] = res.stars; S.setBest(b); } UI.arenaResult(id, res, isBest);
    };
    const opts = { level: lv, who, cancelable: true, onCancel: () => UI.arena() };
    if (id === 'finale') T.sequence(S.FINAL_PARTS, Object.assign({ seqLabel: 'FINALE · TEIL' }, opts), done);
    else T.start(id, Object.assign({ max: 6 }, opts), done);
  }

  // ---------- Testhilfen (nur für automatisierte Tests) ----------
  api.newGame = o => UI.hooks.newGame(Object.assign({ name: 'Testi', type: 0, look: { skin: '#e8b98f', hair: '#3b2a1c', hs: 'short', top: '#2a9d8f' }, len: 'kurz', diff: 1, mode: 'taeglich', speed: 'normal', castIds: [], seed: 4242 }, o || {}));
  api.state = () => { const g = G(); return g ? { day: g.day, days: g.days, clock: Math.round(g.clock), alive: S.alive().map(c => c.id), over: g.over, today: { trial: g.today.trialId, nominees: g.today.nominees, trialDone: g.today.trialDone, cer: g.today.ceremonyCalled, cerDone: g.today.ceremonyDone }, player: { x: +W.player.x.toFixed(1), z: +W.player.z.toFixed(1), state: W.player.state }, camp: g.camp, modal: UI.modalOpen(), trial: T.state(), fps: Math.round(E.fps), calls: E.renderer.info.render.calls } : null; };
  api.clickModal = (i) => { const m = document.getElementById('modal'); const b = m && !m.hidden ? m.querySelectorAll('[data-m]')[i || 0] : null; if (b) { b.click(); return true; } const d = document.querySelector('#dlg [data-d]'); if (d) { d.click(); return true; } return false; };
  api.tp = (x, z) => { W.player.x = x; W.player.z = z; W.snapCam(); };
})();
