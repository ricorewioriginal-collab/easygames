/* Hüpfstraße – App: Ladebildschirm, Titel, Konsolen-Menü, Endlos und Tagesstrecke, Figuren-Laden (Münzen), Pause, Game over, Rekorde.
 * Eingabe: Tippen/Wischen, Tastatur, Gamecontroller (eigene Abfrage); Menüs mit Steuerkreuz/Pfeilen bedienbar.
 * Logik: js/core.js (HS), 3D: js/scene.js (HSScene), Ton: js/sound.js (HSSound). */
(function () {
  'use strict';
  const $ = id => document.getElementById(id), P = 'huepfstrasse-';
  const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } } };
  const SET = Object.assign({ sound: true, music: true, vib: true, low: false, fig: 'rico' }, LS.get(P + 'settings', {}));
  const saveSet = () => LS.set(P + 'settings', SET);
  const S = window.HSSound, SC = window.HSScene, FIG = HS.FIGURES;
  S.sfxOn = SET.sound; S.musicOn = SET.music;
  const fmt = n => Number(n || 0).toLocaleString('de-DE');
  let toastT = 0; function toast(m) { const t = $('toast'); t.textContent = m; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2200); }
  const vib = ms => { if (SET.vib && navigator.vibrate) try { navigator.vibrate(ms); } catch (e) { } };
  const coarse = () => matchMedia('(pointer: coarse)').matches;
  let has3d = false;
  const coins = () => LS.get(P + 'coins', 0), owned = () => LS.get(P + 'owned', ['rico']);
  const hs = () => LS.get(P + 'highscore', 0);
  const stats = () => Object.assign({ games: 0, hops: 0, coins: 0, deaths: {} }, LS.get(P + 'stats', {}));

  /* ---------- Bildschirme und Menü-Navigation ---------- */
  let cur = 'sLoad';
  const BACK = { sMenu: () => scr('sTitle'), sChars: () => closeChars() };
  function scr(id) { document.querySelectorAll('.scr').forEach(s => s.classList.toggle('on', s.id === id)); cur = id; if (has3d) SC.setView(id === 'sChars' ? 'show' : 'world'); setTimeout(focusFirst, 0); }
  const overlays = () => Array.from(document.querySelectorAll('.ov')).filter(o => !o.hidden);
  const root = () => overlays().pop() || $(cur);
  const navEls = () => Array.from(root().querySelectorAll('.nav')).filter(e => !e.disabled && e.offsetParent !== null);
  function focusFirst() { if (coarse() || (cur === 'sGame' && !overlays().length)) return; const els = navEls(), el = root().querySelector('[data-focus]') || els.find(e => e.classList.contains('pri') || e.classList.contains('hero')) || els[0]; if (el) try { el.focus({ preventScroll: true }); } catch (e) { } }
  function openOv(id) { $(id).hidden = false; setTimeout(focusFirst, 0); }
  function closeOv(id) { $(id).hidden = true; setTimeout(focusFirst, 0); }
  function closeAllOv() { document.querySelectorAll('.ov').forEach(o => { o.hidden = true; }); }
  function moveFocus(dx, dy) {
    const els = navEls(); if (!els.length) return; const a = document.activeElement;
    if (!els.includes(a)) { els[0].focus(); S.sfx('move'); return; }
    const r = a.getBoundingClientRect(), ax = r.left + r.width / 2, ay = r.top + r.height / 2; let best = null, bd = 1e9;
    for (const e of els) { if (e === a) continue; const q = e.getBoundingClientRect(), x = q.left + q.width / 2 - ax, y = q.top + q.height / 2 - ay, along = x * dx + y * dy; if (along <= 4) continue; const side = Math.abs(x * dy) + Math.abs(y * dx), d = along + side * 2.2; if (d < bd) { bd = d; best = e; } }
    if (best) { best.focus(); S.sfx('move'); }
  }
  function back() {
    const ov = overlays().pop();
    if (ov) { S.sfx('back'); if (ov.id === 'ovPause') return resume(); const x = ov.querySelector('[data-close]'); if (x) return x.click(); if (ov.id === 'ovEnd') return $('eMenu').click(); return closeOv(ov.id); }
    if (cur === 'sGame') return pause();
    if (BACK[cur]) { S.sfx('back'); BACK[cur](); }
  }

  /* ---------- Spiel ---------- */
  const G = { mode: 'attract', W: null, daily: null, demoT: 0, lastBiome: '', started: false };
  const playing = () => cur === 'sGame' && !overlays().length && G.W && !G.W.over && G.mode !== 'attract';
  function attract() { G.mode = 'attract'; G.W = HS.newWorld((Math.random() * 1e9) >>> 0); G.W.scroll = false; if (has3d) SC.setWorld(G.W, SET.fig); }
  function start(mode) {
    closeAllOv(); G.mode = mode; G.started = false;
    if (mode === 'daily') { G.daily = HS.daily(); G.W = HS.newWorld(G.daily.seed); } else G.W = HS.newWorld((Math.random() * 1e9) >>> 0);
    G.lastBiome = HS.biomeOf(0).id; if (has3d) SC.setWorld(G.W, SET.fig);
    $('startHint').hidden = false; $('startHint').textContent = coarse() ? '👆 Tippen = vorwärts · wischen = zur Seite' : '⌨️ Pfeile / WASD · Leertaste = vorwärts';
    hud(); scr('sGame'); S.music('game'); S.sfx('ok');
  }
  function hud() { const W = G.W; $('hScore').textContent = W.score; $('hCoins').textContent = '🪙 ' + fmt(coins() + W.coins); $('hBest').textContent = 'Rekord ' + fmt(Math.max(hs(), W.score)); }
  function hop(dir) {
    if (!playing()) return;
    if (!G.started) { G.started = true; $('startHint').hidden = true; }
    HS.hop(G.W, dir);
  }
  function events() {
    const W = G.W;
    for (const e of W.ev) {
      if (has3d) SC.onEvent(e);
      if (G.mode === 'attract') continue;
      if (e.k === 'hop') S.sfx('hop');
      else if (e.k === 'bump') { S.sfx('bump'); vib(6); }
      else if (e.k === 'coin') { S.sfx('coin'); vib(10); hud(); }
      else if (e.k === 'log') S.sfx('log'); else if (e.k === 'pad') S.sfx('pad');
      else if (e.k === 'warn') S.sfx('warn'); else if (e.k === 'train') S.sfx('train');
      else if (e.k === 'score') { hud(); if (e.s % 25 === 0) S.sfx('step10'); const b = HS.biomeOf(e.s); if (b.id !== G.lastBiome) { G.lastBiome = b.id; const el = $('biome'); el.textContent = b.n; el.hidden = false; el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; setTimeout(() => { el.hidden = true; }, 2400); } }
      else if (e.k === 'die') { S.sfx(e.how === 'water' || e.how === 'drift' ? 'splash' : e.how === 'drone' ? 'drone' : 'crash'); vib(e.how === 'car' || e.how === 'train' ? 80 : 40); }
      else if (e.k === 'over') endGame();
    }
    W.ev.length = 0;
  }
  const DEATH = { car: 'Überfahren! 🚗', train: 'Vom Zug erwischt! 🚆', water: 'Platsch! 🌊', drift: 'Abgetrieben! 🪵', drone: 'Die Drohne hat dich! 🛸' };
  function endGame() {
    const W = G.W, st = stats(); let rec = false;
    st.games++; st.coins += W.coins; st.deaths[W.P.dead.how] = (st.deaths[W.P.dead.how] || 0) + 1; LS.set(P + 'stats', st);
    LS.set(P + 'coins', coins() + W.coins);
    if (W.score > hs()) { LS.set(P + 'highscore', W.score); rec = W.score > 0; }
    if (G.mode === 'daily') { const d = LS.get(P + 'daily', {}); if (d.key !== G.daily.key) { d.key = G.daily.key; d.best = 0; d.plays = 0; } d.plays++; d.best = Math.max(d.best, W.score); LS.set(P + 'daily', d); }
    $('eKick').textContent = G.mode === 'daily' ? 'Tagesstrecke · ' + G.daily.key.split('-').reverse().join('.') : 'Endlos';
    $('eTitle').textContent = DEATH[W.P.dead.how] || 'Erwischt!'; $('eScore').textContent = fmt(W.score); $('eRec').hidden = !rec;
    const c = (k, v) => '<div><small>' + k + '</small><b>' + v + '</b></div>';
    $('eStats').innerHTML = c('Rekord', fmt(hs())) + c('Münzen', '+' + fmt(W.coins) + ' (🪙 ' + fmt(coins()) + ')') + c('Gebiet', HS.biomeOf(W.score).n) + c(G.mode === 'daily' ? 'Heute bester' : 'Spiele', G.mode === 'daily' ? fmt(LS.get(P + 'daily', {}).best) : fmt(st.games));
    const own = owned(), next = FIG.filter(f => !own.includes(f.id)).sort((a, b) => a.price - b.price)[0];
    $('eUnlock').hidden = !next; if (next) $('eUnlock').textContent = coins() >= next.price ? '🎁 Du kannst dir jetzt „' + next.n + '“ holen!' : 'Noch 🪙 ' + fmt(next.price - coins()) + ' bis „' + next.n + '“';
    S.sfx(rec ? 'record' : 'lose'); S.music('menu');
    setTimeout(() => openOv('ovEnd'), 150);
  }
  $('eAgain').onclick = () => start(G.mode === 'daily' ? 'daily' : 'play');
  $('eMenu').onclick = () => { closeOv('ovEnd'); toMenu(); };
  $('eChars').onclick = () => { closeOv('ovEnd'); openChars(); };
  $('eShare').onclick = async () => {
    const link = window.EasyGamesDevice ? EasyGamesDevice.gameLink('huepfstrasse/') : 'https://ricorewioriginal-collab.github.io/easygames/huepfstrasse/';
    const text = '🐾 Hüpfstraße – ' + (G.mode === 'daily' ? 'Tagesstrecke vom ' + G.daily.key.split('-').reverse().join('.') : 'Endlos') + ': ' + G.W.score + ' Reihen geschafft! Schaffst du mehr? ' + link;
    try { if (navigator.share && coarse()) { await navigator.share({ text }); return; } } catch (e) { return; }
    try { await navigator.clipboard.writeText(text); toast('📋 Kopiert – einfach einfügen!'); } catch (e) { toast(text); }
  };
  function pause() { if (!playing()) return; openOv('ovPause'); S.music('menu'); }
  function resume() { closeOv('ovPause'); S.music('game'); }
  $('bPause').onclick = () => pause(); $('pGo').onclick = () => resume();
  $('pRestart').onclick = () => start(G.mode); $('pOpts').onclick = () => openOv('ovOpts'); $('pHelp').onclick = () => openOv('ovHelp');
  $('pQuit').onclick = () => { closeOv('ovPause'); toMenu(); };

  /* ---------- Menü ---------- */
  function toMenu() {
    closeAllOv(); if (G.mode !== 'attract') attract();
    $('menuBest').textContent = '🏆 ' + fmt(hs()); $('menuCoins').textContent = '🪙 ' + fmt(coins());
    const d = LS.get(P + 'daily', {}); $('dailyInfo').textContent = d.key === HS.daily().key && d.plays ? 'Heute: ' + d.best + ' Reihen' : 'Gleiche Strecke für alle';
    $('charInfo').textContent = owned().length + ' / ' + FIG.length + ' · ' + (FIG.find(f => f.id === SET.fig) || FIG[0]).n;
    $('menuKeys').textContent = navigator.getGamepads && Array.from(navigator.getGamepads() || []).some(Boolean) ? '🎮 Steuerkreuz wählen · A bestätigen · B zurück' : '⌨️ Pfeile wählen · Enter bestätigen · Esc zurück';
    scr('sMenu'); S.music('menu');
  }
  document.querySelectorAll('#tiles .tile').forEach(t => t.onclick = () => {
    S.unlock(); const k = t.dataset.go;
    if (k === 'play' || k === 'daily') start(k);
    else if (k === 'chars') { S.sfx('ok'); openChars(); }
    else if (k === 'rec') { S.sfx('ok'); showRec(); openOv('ovRec'); }
    else if (k === 'opts') { S.sfx('ok'); openOv('ovOpts'); }
    else if (k === 'help') { S.sfx('ok'); openOv('ovHelp'); }
  });
  function showRec() {
    const st = stats(), d = LS.get(P + 'daily', {}), c = (k, v) => '<div><small>' + k + '</small><b>' + v + '</b></div>', dd = st.deaths;
    $('recList').innerHTML = c('🏆 Rekord', fmt(hs()) + ' Reihen') + c('📅 Heute', d.key === HS.daily().key && d.plays ? d.best : '–') + c('🪙 Gesammelt', fmt(st.coins)) + c('Spiele', fmt(st.games)) +
      c('🚗 Überfahren', dd.car || 0) + c('🌊 Platsch', (dd.water || 0) + (dd.drift || 0)) + c('🚆 Zug', dd.train || 0) + c('🛸 Drohne', dd.drone || 0) + c('Figuren', owned().length + ' / ' + FIG.length);
  }
  $('recX').onclick = () => closeOv('ovRec'); $('helpX').onclick = () => closeOv('ovHelp'); $('optX').onclick = () => closeOv('ovOpts');
  const OPT = { sSound: 'sound', sMusic: 'music', sVib: 'vib', sLow: 'low' };
  for (const id in OPT) { const el = $(id); el.checked = !!SET[OPT[id]]; el.onchange = () => { SET[OPT[id]] = el.checked; saveSet(); S.sfxOn = SET.sound; S.musicOn = SET.music; if (SET.music) S.music(cur === 'sGame' ? 'game' : 'menu'); if (id === 'sLow') toast('Gilt nach dem Neuladen'); }; }

  /* ---------- Figuren-Laden ---------- */
  let ci = 0;
  function openChars() { ci = Math.max(0, FIG.findIndex(f => f.id === SET.fig)); scr('sChars'); showChar(); }
  function closeChars() { toMenu(); }
  function showChar() {
    const f = FIG[ci], own = owned().includes(f.id), sel = SET.fig === f.id, c = coins();
    if (has3d) SC.showcase(f.id);
    $('cName').textContent = f.n; $('cDesc').textContent = f.d; $('cIdx').textContent = (ci + 1) + ' / ' + FIG.length; $('cCoins').textContent = '🪙 ' + fmt(c);
    const a = $('cAct'); a.classList.toggle('owned', own); a.classList.toggle('locked', !own && c < f.price);
    a.textContent = sel ? '✔ Ausgewählt' : own ? 'Auswählen' : c >= f.price ? 'Freischalten · 🪙 ' + f.price : '🔒 🪙 ' + f.price;
  }
  $('cPrev').onclick = () => { ci = (ci + FIG.length - 1) % FIG.length; S.sfx('move'); showChar(); };
  $('cNext').onclick = () => { ci = (ci + 1) % FIG.length; S.sfx('move'); showChar(); };
  $('cBack').onclick = () => { S.sfx('back'); closeChars(); };
  $('cAct').onclick = () => {
    const f = FIG[ci], own = owned();
    if (own.includes(f.id)) { SET.fig = f.id; saveSet(); S.sfx('ok'); toast(f.n + ' hüpft jetzt für dich!'); }
    else if (coins() >= f.price) { LS.set(P + 'coins', coins() - f.price); LS.set(P + 'owned', own.concat(f.id)); SET.fig = f.id; saveSet(); S.sfx('buy'); vib(30); toast('🎉 ' + f.n + ' freigeschaltet!'); }
    else { S.sfx('bump'); toast('Noch 🪙 ' + fmt(f.price - coins()) + ' – sammle Münzen beim Hüpfen!'); }
    showChar();
  };
  function pressStart() { if (cur !== 'sTitle') return; S.unlock(); S.sfx('ok'); toMenu(); }
  $('bPress').onclick = pressStart;
  $('sTitle').addEventListener('pointerdown', e => { if (e.target.closest('a')) return; e.preventDefault(); pressStart(); });

  /* ---------- Eingabe ---------- */
  const KDIR = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', KeyW: 'up', KeyS: 'down', KeyA: 'left', KeyD: 'right', Space: 'up' };
  addEventListener('keydown', e => {
    document.body.classList.add('kbd'); const c = e.code;
    if (c === 'Escape' || (c === 'KeyP' && cur === 'sGame' && !overlays().length)) { e.preventDefault(); back(); return; }
    if (cur === 'sGame' && !overlays().length) { if (KDIR[c]) { e.preventDefault(); if (!e.repeat) hop(KDIR[c]); } return; }
    if (cur === 'sTitle' && !overlays().length && !e.repeat) { e.preventDefault(); pressStart(); return; }
    if (cur === 'sChars' && !overlays().length && (c === 'ArrowLeft' || c === 'ArrowRight') && document.activeElement && document.activeElement.closest('.shopRow')) { e.preventDefault(); $(c === 'ArrowLeft' ? 'cPrev' : 'cNext').click(); return; }
    const dir = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[c];
    if (dir) { e.preventDefault(); moveFocus(dir[0], dir[1]); }
  });
  addEventListener('pointerdown', () => document.body.classList.remove('kbd'), true);
  // Tippen = vorwärts, Wischen = Richtung (Entscheidung sofort, wenn eine Achse klar überwiegt; sonst beim Loslassen)
  const SW = { id: null, x: 0, y: 0, done: false }, sw = $('swipe');
  const swDir = (dx, dy) => Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
  sw.addEventListener('pointerdown', e => { if (SW.id !== null && SW.id !== e.pointerId) { SW.id = null; } SW.id = e.pointerId; SW.x = e.clientX; SW.y = e.clientY; SW.done = false; try { sw.setPointerCapture(e.pointerId); } catch (x) { } e.preventDefault(); });
  sw.addEventListener('pointermove', e => {
    if (e.pointerId !== SW.id || SW.done) return; const dx = e.clientX - SW.x, dy = e.clientY - SW.y, ax = Math.abs(dx), ay = Math.abs(dy), th = Math.max(24, Math.min(innerWidth, innerHeight) * .05);
    if (Math.max(ax, ay) < th || Math.max(ax, ay) < Math.min(ax, ay) * 1.3) return; SW.done = true; hop(swDir(dx, dy));
  });
  const swEnd = e => { if (e.pointerId !== SW.id) return; SW.id = null; if (e.type !== 'pointerup' || SW.done) return; const dx = e.clientX - SW.x, dy = e.clientY - SW.y; hop(Math.hypot(dx, dy) < 16 ? 'up' : swDir(dx, dy)); };
  sw.addEventListener('pointerup', swEnd); sw.addEventListener('pointercancel', swEnd);
  // Gamecontroller
  const PAD = { b: [], dir: null, lock: false }; let padNavT = 0;
  function pollPads(dt) {
    let list = []; try { list = navigator.getGamepads ? Array.from(navigator.getGamepads()) : []; } catch (e) { }
    const g = list.find(p => p && p.connected); if (!g) return;
    const ax = g.axes || [], bt = g.buttons || [], pr = k => !!(bt[k] && (bt[k].pressed || bt[k].value > .5));
    const now = []; for (let k = 0; k < 17; k++) now[k] = pr(k); const down = k => now[k] && !PAD.b[k];
    const sx = ax[0] || 0, sy = ax[1] || 0, mag = Math.max(Math.abs(sx), Math.abs(sy));
    let x = Math.abs(sx) > .5 ? Math.sign(sx) : 0, z = Math.abs(sy) > .5 ? Math.sign(sy) : 0; if (pr(14)) x = -1; if (pr(15)) x = 1; if (pr(12)) z = -1; if (pr(13)) z = 1;
    const dir = Math.abs(x) >= Math.abs(z) ? (x ? (x > 0 ? 'right' : 'left') : null) : (z > 0 ? 'down' : 'up');
    if (cur === 'sGame' && !overlays().length) {
      if (mag < .3) PAD.lock = false;
      const dp = [12, 13, 14, 15].find(k => down(k));
      if (dp !== undefined) hop({ 12: 'up', 13: 'down', 14: 'left', 15: 'right' }[dp]);
      else if (mag > .6 && !PAD.lock) { PAD.lock = true; hop(Math.abs(sx) > Math.abs(sy) ? (sx > 0 ? 'right' : 'left') : (sy > 0 ? 'down' : 'up')); }
      if (down(0)) hop('up'); if (down(1) || down(9)) pause();
    } else {
      document.body.classList.add('kbd');
      if (dir && (dir !== PAD.dir || padNavT <= 0)) { if (cur === 'sChars' && (dir === 'left' || dir === 'right') && !overlays().length) $(dir === 'left' ? 'cPrev' : 'cNext').click(); else { const d = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[dir]; moveFocus(d[0], d[1]); } padNavT = dir !== PAD.dir ? .35 : .14; }
      if (down(0)) { if (cur === 'sTitle' && !overlays().length) pressStart(); else { const a = document.activeElement; if (a && a !== document.body && a.click) a.click(); else focusFirst(); } }
      if (down(1)) back();
      if (down(9)) { if (cur === 'sTitle') pressStart(); else if (overlays().some(o => o.id === 'ovPause')) resume(); }
    }
    PAD.dir = dir; PAD.b = now; padNavT -= dt;
  }
  addEventListener('gamepadconnected', () => { toast('🎮 Controller verbunden'); $('pressTxt').textContent = 'Drücke A'; });

  /* ---------- Vorführung im Menü: kleiner Bot hüpft vorsichtig ---------- */
  function demoBot(dt) {
    const W = G.W; if (!W) return; G.demoT -= dt;
    if (W.P.dead) { if (W.P.dead.t > 1.2) attract(); return; }
    if (W.P.hop || G.demoT > 0) return; G.demoT = .35;
    const ok = (x, z) => { const R = HS.row(W, z); if (Math.abs(x) > 4) return false; if (R.type === 'grass') return !R.trees.has(Math.round(x)); if (R.type === 'road') return R.items.every(i => Math.abs(HS.ringDist(i.x + R.dir * R.speed * .3, x)) > i.len / 2 + 1.2); if (R.type === 'rail') return !R.train.active && R.train.wait > 1.8; if (R.pads) return R.pads.has(Math.round(x)); return R.items.some(i => Math.abs(HS.ringDist(i.x + R.dir * R.speed * .13, x)) < i.len / 2 - .3); };
    const p = W.P; if (ok(HS.row(W, p.z + 1).type === 'river' && !HS.row(W, p.z + 1).pads ? p.x : Math.round(p.x), p.z + 1)) { HS.hop(W, 'up'); return; }
    for (const d of [-1, 1]) if (HS.row(W, p.z).type !== 'river' && ok(p.x + d, p.z) && ok(p.x + d, p.z + 1)) { HS.hop(W, d < 0 ? 'left' : 'right'); return; }
    if (W.P.z > 30 && Math.random() < .02) attract();
  }

  /* ---------- Schleife ---------- */
  let last = performance.now();
  function loop(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    pollPads(dt);
    if (G.W) {
      if (G.mode === 'attract') { if (cur === 'sMenu' || cur === 'sTitle') { demoBot(dt); HS.step(G.W, dt); events(); } }
      else if (playing() || (cur === 'sGame' && !overlays().length && G.W.P.dead && !G.W.over)) { HS.step(G.W, dt); events(); }
    }
    if (has3d) SC.update(dt);
    requestAnimationFrame(loop);
  }

  /* ---------- Laden ---------- */
  const TIPS = ['Straßen werden gepflastert …', 'Baumstämme schwimmen los …', 'Züge werden geputzt …', 'Gleich geht’s los!'];
  const bar = p => { $('loadBar').style.width = Math.round(p * 100) + '%'; $('loadTip').textContent = TIPS[Math.min(TIPS.length - 1, Math.floor(p * TIPS.length))]; };
  const wait = ms => new Promise(r => setTimeout(r, ms));
  (async function boot() {
    const t0 = performance.now(); bar(.15); await wait(60);
    if (!owned().includes(SET.fig)) SET.fig = 'rico';
    try { if (!window.THREE) throw new Error('three'); SC.init($('stage'), { low: SET.low }); has3d = true; } catch (e) { has3d = false; console.warn('3D nicht verfügbar', e); $('stage').innerHTML = '<div class="flat">Hüpfstraße braucht 3D-Grafik (WebGL). Bitte einen aktuellen Browser verwenden.</div>'; }
    bar(.55); await wait(40); attract(); bar(.85);
    requestAnimationFrame(loop); bar(1);
    await wait(Math.max(0, 1200 - (performance.now() - t0)));
    $('sLoad').classList.add('out'); setTimeout(() => { $('sLoad').classList.remove('on', 'out'); }, 460);
    if (navigator.getGamepads && Array.from(navigator.getGamepads() || []).some(Boolean)) $('pressTxt').textContent = 'Drücke A';
    const q = new URLSearchParams(location.search);
    if (q.get('mode') === 'play' || q.get('mode') === 'daily') { S.unlock(); start(q.get('mode')); } else scr('sTitle');
  })();
  window.HSApp = { G, start, hop, toMenu, openChars, get cur() { return cur; } };
})();
