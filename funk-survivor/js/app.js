/* Funk-Survivor – App: Ladebildschirm, Titel, Menü, Setup (Held/Bühne/Modus), Studio-Ausbau, Runde mit HUD, Level-Auswahl, Pause, Ende, Rekorde.
 * Eingabe: Touch-Stick, Tastatur, Gamecontroller (eigene Abfrage); Menüs mit Pfeilen/Steuerkreuz bedienbar.
 * Logik: js/core.js (FS), 3D: js/scene.js (FSScene), Ton: js/sound.js (FSSound). */
(function () {
  'use strict';
  const $ = id => document.getElementById(id), P = 'funksurvivor-';
  const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } } };
  const SET = Object.assign({ sound: true, music: true, vib: true, num: true, touchUI: false, low: false, hero: 'rico', map: 'halle', mode: 'run', diff: 'normal' }, LS.get(P + 'settings', {}));
  const saveSet = () => LS.set(P + 'settings', SET);
  const FS = window.FS, SC = window.FSScene, S = window.FSSound, HEROES = FS.HEROES, MAPS = FS.MAPS, DIFFS = FS.DIFFS;
  S.sfxOn = SET.sound; S.musicOn = SET.music;
  const fmt = n => Number(n || 0).toLocaleString('de-DE');
  const mmss = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  let toastT = 0; function toast(m) { const t = $('toast'); t.textContent = m; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2400); }
  const vib = ms => { if (SET.vib && navigator.vibrate) try { navigator.vibrate(ms); } catch (e) { } };
  const coarse = () => matchMedia('(pointer: coarse)').matches;
  let has3d = false;
  const coins = () => LS.get(P + 'coins', 0), addCoins = n => LS.set(P + 'coins', Math.max(0, coins() + n));
  const owned = () => LS.get(P + 'owned', ['rico']), ownedMaps = () => LS.get(P + 'maps', ['halle']), meta = () => LS.get(P + 'meta', {});
  const hs = () => LS.get(P + 'highscore', 0);
  const stats = () => Object.assign({ games: 0, kills: 0, bosses: 0, time: 0, wins: 0, coins: 0, deaths: 0 }, LS.get(P + 'stats', {}));
  const recs = () => Object.assign({ run: { score: 0, time: 0 }, endless: { score: 0, time: 0 }, daily: { key: '', score: 0 } }, LS.get(P + 'rec', {}));
  const MODES = [{ id: 'run', n: 'Sendeschluss', d: 'Überlebe 10 Minuten und besiege den Großen Störsender. Danach geht’s mit der Zugabe weiter.' }, { id: 'endless', n: 'Endlos', d: 'Kein Ziel, kein Ende: Die Bosse kehren immer stärker zurück. Wie lange hältst du durch?' }, { id: 'daily', n: 'Tagesrunde', d: 'Heute für alle gleich: gleiche Gegner, gleiche Angebote. Beste Punktzahl des Tages zählt.' }];

  /* ---------- Bildschirme und Menü-Navigation ---------- */
  let cur = 'sLoad';
  const BACK = { sMenu: () => scr('sTitle'), sSetup: () => toMenu(), sShop: () => toMenu() };
  const MENU3D = { sTitle: [1.1, 5.8, 0], sMenu: [1.0, 5.6, 1.9], sShop: [0.9, 6.4, 0], sSetup: [.55, 6.2, 1.9] };
  function scr(id) {
    document.querySelectorAll('.scr').forEach(s => s.classList.toggle('on', s.id === id)); cur = id;
    if (has3d) { if (id === 'sGame') SC.setMode('game'); else { SC.setMode('menu'); const m = MENU3D[id] || [1, 5.6, 0]; SC.menuLook = m[0]; SC.menuDist = m[1]; SC.menuShift = m[2]; } }
    setTimeout(focusFirst, 0);
  }
  const overlays = () => Array.from(document.querySelectorAll('.ov')).filter(o => !o.hidden);
  const root = () => overlays().pop() || $(cur);
  const navEls = () => Array.from(root().querySelectorAll('.nav, .pick')).filter(e => !e.disabled && e.offsetParent !== null);
  function focusFirst() {
    if (coarse() || (cur === 'sGame' && !overlays().length)) return; const els = navEls(), r = root();
    const el = r.querySelector('[data-focus]') || els.find(e => e.classList.contains('pri') || e.classList.contains('hero')) || els[0]; if (el) try { el.focus({ preventScroll: true }); } catch (e) { }
  }
  function moveFocus(dx, dy) {
    const els = navEls(); if (!els.length) return; let a = document.activeElement; if (!els.includes(a)) { focusFirst(); return; }
    const r = a.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2; let best = null, bs = 1e9;
    for (const e of els) { if (e === a) continue; const q = e.getBoundingClientRect(), vx = q.left + q.width / 2 - cx, vy = q.top + q.height / 2 - cy, along = vx * dx + vy * dy, perp = Math.abs(vx * dy - vy * dx); if (along <= 2) continue; const sc = along + perp * 2.2; if (sc < bs) { bs = sc; best = e; } }
    if (best) { best.focus({ preventScroll: true }); S.sfx('move'); }
  }
  function openOv(id) { $(id).hidden = false; setTimeout(focusFirst, 0); }
  function closeOv(id) { $(id).hidden = true; setTimeout(focusFirst, 0); }
  function closeAllOv() { document.querySelectorAll('.ov').forEach(o => { o.hidden = true; }); }
  function back() {
    const ov = overlays().pop();
    if (ov) { if (ov.id === 'ovPause') resume(); else if (ov.id === 'ovLevel' || ov.id === 'ovEnd' || ov.id === 'ovWin') return; else closeOv(ov.id); S.sfx('back'); return; }
    if (cur === 'sGame') { pause(); return; }
    if (BACK[cur]) { S.sfx('back'); BACK[cur](); }
  }

  /* ---------- Spielzustand ---------- */
  const G = { W: null, running: false, paused: false, opt: null, gemChain: 0, gemT: 0, lastHud: {}, sig: '' };
  const IN = { mx: 0, mz: 0, dash: false };
  const keys = new Set(), TOUCH = { id: null, ox: 0, oy: 0, x: 0, z: 0 }, PADI = { x: 0, z: 0 };

  function start(again) {
    const hero = HEROES.find(h => h.id === SET.hero) || HEROES[0];
    if (!owned().includes(hero.id)) { toast('Schalte ' + hero.n + ' zuerst frei'); return; }
    if (!ownedMaps().includes(SET.map)) SET.map = 'halle';
    S.unlock(); closeAllOv();
    const daily = SET.mode === 'daily', seed = daily ? FS.dailySeed() : (Math.random() * 2147483647) | 0;
    const W = G.W = FS.create({ seed, hero: hero.id, map: SET.map, diff: SET.diff, mode: daily ? 'run' : SET.mode, meta: meta() });
    W.daily = daily; if (SET.mode === 'endless') W.endless = true;
    G.running = true; G.paused = false; G.sig = ''; G.lastHud = {}; G.gemChain = 0; G.shownBoss = false;
    G.opt = { hero: hero.id, map: SET.map, mode: SET.mode, diff: SET.diff };
    $('bossBar').hidden = true; $('bossArrow').hidden = true; $('banner').hidden = true;
    if (has3d) { SC.setMap(W.map); SC.loadHero(hero).then(() => { SC.useHero(hero); SC.heroAnim('idle'); }); SC.curRec && (SC.curRec.clip = ''); }
    scr('sGame'); S.music('game'); S.intensity(0); S.sfx('ok');
    banner(daily ? '📅 Tagesrunde' : SET.mode === 'endless' ? '♾️ Endlos' : '🎤 Sendeschluss', 'good');
    if (!LS.get(P + 'hint', false)) { LS.set(P + 'hint', true); const hb = $('hintBox'); hb.innerHTML = coarse() ? '👆 Finger links ziehen = laufen · 💨 = ausweichen<br>Geschossen wird automatisch' : '⌨️ WASD / Pfeile = laufen · Leertaste = ausweichen<br>Geschossen wird automatisch'; hb.hidden = false; setTimeout(() => { hb.hidden = true; }, 7000); }
  }
  function pause() { if (!G.running || G.paused || G.W.state !== 'play' || G.W.choice) return; G.paused = true; const W = G.W; $('pInfo').textContent = 'Zeit ' + mmss(W.t) + ' · Level ' + W.lv + ' · ' + fmt(W.kills) + ' besiegt'; openOv('ovPause'); S.duck(true); }
  function resume() { if (!G.paused) return; G.paused = false; closeOv('ovPause'); S.duck(false); }
  $('bPause').onclick = pause; $('pGo').onclick = resume;
  $('pOpts').onclick = () => openOv('ovOpts'); $('pHelp').onclick = () => openOv('ovHelp');
  $('pQuit').onclick = () => { closeOv('ovPause'); G.paused = false; S.duck(false); FS.abort(G.W); handleEvents(); };

  /* ---------- Hinweise im Spiel ---------- */
  function banner(txt, cls) { const b = $('banner'), n = b.cloneNode(false); n.id = 'banner'; n.className = 'banner ' + (cls || ''); n.innerHTML = txt; n.hidden = false; b.replaceWith(n); }

  /* ---------- Ereignisse aus dem Spielkern ---------- */
  function handleEvents() {
    const W = G.W; if (!W) return;
    for (const e of FS.drain(W)) {
      if (has3d) SC.fx(e, W);
      switch (e.k) {
        case 'hit': S.sfx('hit'); break;
        case 'kill': S.sfx('kill'); if (e.boss) S.sfx('bigboom'); else if (e.elite) S.sfx('boom'); break;
        case 'gem': G.gemChain = performance.now() - G.gemT < 450 ? G.gemChain + 1 : 0; G.gemT = performance.now(); S.sfx('gem', G.gemChain); break;
        case 'shoot': S.sfx(e.w === 'rakete' ? 'rakete' : 'shoot'); break;
        case 'nova': S.sfx('nova'); break; case 'bolt': S.sfx('bolt'); break; case 'lob': S.sfx('lob'); break;
        case 'boom': S.sfx(e.big ? 'bigboom' : 'boom'); break; case 'disc': S.sfx('disc'); break; case 'eshoot': S.sfx('eshoot'); break;
        case 'hurt': S.sfx('hurt'); vib(60); break; case 'warn': S.sfx('warn'); break; case 'roar': S.sfx('roar'); break; case 'quake': S.sfx('quake'); vib(120); break;
        case 'dash': S.sfx('dash'); break; case 'heal': S.sfx('heal'); break; case 'coin': S.sfx('coin'); break; case 'magnet': S.sfx('magnet'); break;
        case 'chest': S.sfx('chest'); break; case 'revive': S.sfx('revive'); banner('🔋 Notstrom!', 'good'); break;
        case 'levelup': S.sfx('levelup'); openLevel(); break;
        case 'picked': S.sfx('pick'); break;
        case 'boss': S.sfx('boss'); banner('⚠ ' + e.n + ' erscheint!'); S.intensity(1); break;
        case 'bossdown': banner('✔ ' + e.n + ' besiegt!', 'good'); S.intensity(.6); break;
        case 'horde': banner('Horde im Anmarsch!'); S.sfx('warn'); break;
        case 'elite': banner('Elite-Gegner!'); break;
        case 'encore': banner('🎤 ZUGABE!', 'good'); break;
        case 'win': S.sfx('win'); closeAllOv(); openOv('ovWin'); break;
        case 'over': endRun(); break;
      }
    }
  }

  /* ---------- Level-Aufstieg ---------- */
  function openLevel() {
    const W = G.W; if (!W || !W.choice) return;
    $('lvKick').textContent = 'Level ' + W.lv + (W.pending > 1 ? ' · noch ' + (W.pending - 1) + ' weitere' : '');
    const box = $('picks'); box.innerHTML = '';
    W.choice.forEach((c, i) => {
      const b = document.createElement('button'); b.className = 'pick nav ' + (c.kind === 'weapon' ? 'weapon' : c.kind === 'passive' ? 'passive' : '') + (c.lv === 1 ? ' new' : '');
      b.innerHTML = '<span class="key">' + (i + 1) + '</span><span class="ic">' + c.icon + '</span><span class="lv">' + (c.kind === 'weapon' ? 'Waffe' : c.kind === 'passive' ? 'Verstärkung' : 'Bonus') + (c.lv ? ' · ' + (c.lv === 1 ? 'NEU' : 'Stufe ' + c.lv) : '') + '</span><b>' + c.n + '</b><p>' + c.t + '</p>';
      b.onclick = () => pickChoice(i); box.appendChild(b);
    });
    $('lvRr').textContent = W.rerolls; $('lvReroll').disabled = W.rerolls <= 0; openOv('ovLevel'); S.duck(true);
  }
  function pickChoice(i) {
    const W = G.W; if (!W || !W.choice) return; FS.choose(W, i); handleEvents();
    if (W.choice) openLevel(); else { closeOv('ovLevel'); S.duck(false); G.sig = ''; }
  }
  $('lvReroll').onclick = () => { if (FS.reroll(G.W)) { S.sfx('ok'); openLevel(); } else S.sfx('bump'); };

  /* ---------- Ende der Runde ---------- */
  function endRun() {
    const W = G.W; if (!W || !G.running) return; G.running = false; closeAllOv(); S.stopMusic(); S.duck(false);
    const sm = FS.summary(W), st = stats(), rc = recs(), mode = G.opt.mode; let newRec = false;
    if (sm.score > hs()) { LS.set(P + 'highscore', sm.score); newRec = true; }
    if (mode === 'daily') { const k = FS.dailyKey(); if (rc.daily.key !== k) rc.daily = { key: k, score: 0 }; if (sm.score > rc.daily.score) { rc.daily.score = sm.score; } }
    else { const r = rc[mode]; if (sm.score > r.score) r.score = sm.score; if (sm.time > r.time) r.time = sm.time; }
    LS.set(P + 'rec', rc); LS.set(P + 'highscore', Math.max(hs(), sm.score));
    st.games++; st.kills += sm.kills; st.bosses += sm.bosses; st.time += sm.time; st.coins += sm.reward; if (sm.won) st.wins++; else st.deaths++; LS.set(P + 'stats', st);
    addCoins(sm.reward);
    S.sfx(sm.won ? 'win' : 'lose');
    $('eKick').textContent = (MODES.find(m => m.id === mode) || {}).n + ' · ' + (DIFFS.find(d => d.id === G.opt.diff) || {}).n;
    $('eTitle').textContent = sm.won ? 'Sendeschluss geschafft!' : 'Überrannt!'; $('eTitle').classList.toggle('win', sm.won);
    $('eRec').hidden = !newRec; $('eScore').textContent = fmt(sm.score);
    const c = (k, v) => '<div><small>' + k + '</small><b>' + v + '</b></div>';
    $('eStats').innerHTML = c('⏱️ Zeit', mmss(sm.time)) + c('💀 Besiegt', fmt(sm.kills)) + c('⭐ Level', sm.level) + c('👹 Bosse', sm.bosses) + c('🪙 Belohnung', '+' + fmt(sm.reward)) + c('💨 Ausweichen', sm.dashes);
    const next = HEROES.filter(h => !owned().includes(h.id)).sort((a, b) => a.price - b.price)[0], un = $('eUnlock');
    if (next && coins() >= next.price) { un.textContent = '🎉 Du kannst jetzt ' + next.n + ' freischalten!'; un.hidden = false; } else if (next) { un.textContent = 'Noch 🪙 ' + fmt(next.price - coins()) + ' bis ' + next.n; un.hidden = false; } else un.hidden = true;
    setTimeout(() => { if (!G.running) openOv('ovEnd'); }, sm.won ? 200 : 1400);
  }
  $('eAgain').onclick = () => { closeOv('ovEnd'); start(true); };
  $('eMenu').onclick = () => { closeOv('ovEnd'); toMenu(); };
  $('eShop').onclick = () => { closeOv('ovEnd'); openShop(); };
  $('eShare').onclick = () => {
    const W = G.W, sm = FS.summary(W), link = window.EasyGamesDevice ? EasyGamesDevice.gameLink('funk-survivor/') : 'https://ricorewioriginal-collab.github.io/easygames/funk-survivor/';
    const text = '⚡ Funkflut Survivor – ' + fmt(sm.score) + ' Punkte, ' + mmss(sm.time) + ' überlebt, ' + fmt(sm.kills) + ' Störwesen besiegt! Schaffst du mehr? ' + link;
    if (navigator.share) navigator.share({ text }).catch(() => { }); else if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => toast('Text kopiert'), () => toast(text)); else toast(text);
  };
  $('wContinue').onclick = () => { closeOv('ovWin'); FS.continueRun(G.W); handleEvents(); S.duck(false); };
  $('wEnd').onclick = () => { closeOv('ovWin'); FS.abort(G.W); handleEvents(); };

  /* ---------- Menü ---------- */
  function toMenu() {
    closeAllOv(); G.running = false; G.W = null;
    $('menuBest').textContent = '🏆 ' + fmt(hs()); $('menuCoins').textContent = '🪙 ' + fmt(coins());
    const h = HEROES.find(x => x.id === SET.hero) || HEROES[0]; $('playInfo').textContent = h.n + ' · ' + (MAPS.find(m => m.id === SET.map) || MAPS[0]).n + ' · ' + MODES.find(m => m.id === SET.mode).n;
    const m = meta(), tot = Object.values(m).reduce((a, b) => a + b, 0), max = FS.META.reduce((a, b) => a + b.max, 0); $('shopInfo').textContent = tot + ' von ' + max + ' Stufen';
    $('menuKeys').textContent = anyPad() ? '🎮 Steuerkreuz wählen · A bestätigen · B zurück' : coarse() ? '' : '⌨️ Pfeile wählen · Enter bestätigen · Esc zurück';
    scr('sMenu'); S.music('menu'); showHeroModel();
  }
  function showHeroModel() { if (!has3d) return; const h = HEROES.find(x => x.id === SET.hero) || HEROES[0]; SC.setMap(MAPS.find(m => m.id === SET.map) || MAPS[0]); SC.loadHero(h).then(() => { if (!G.running) { SC.useHero(h); SC.heroAnim('idle'); } }); }
  document.querySelectorAll('#tiles .tile').forEach(t => t.onclick = () => {
    S.unlock(); const k = t.dataset.go; S.sfx('ok');
    if (k === 'play') openSetup(); else if (k === 'shop') openShop(); else if (k === 'rec') { showRec(); openOv('ovRec'); } else if (k === 'opts') openOv('ovOpts'); else if (k === 'help') openOv('ovHelp');
  });
  function showRec() {
    const st = stats(), rc = recs(), c = (k, v) => '<div><small>' + k + '</small><b>' + v + '</b></div>', dk = FS.dailyKey();
    $('recList').innerHTML = c('🏆 Bestwert', fmt(hs())) + c('🎤 Sendeschluss', fmt(rc.run.score) + ' · ' + mmss(rc.run.time)) + c('♾️ Endlos', fmt(rc.endless.score) + ' · ' + mmss(rc.endless.time)) + c('📅 Heute', rc.daily.key === dk ? fmt(rc.daily.score) : '–') +
      c('Runden', fmt(st.games)) + c('Siege', fmt(st.wins)) + c('💀 Besiegt', fmt(st.kills)) + c('👹 Bosse', fmt(st.bosses)) + c('⏱️ Spielzeit', Math.floor(st.time / 60) + ' Min.') + c('🪙 Verdient', fmt(st.coins));
  }
  $('recX').onclick = () => closeOv('ovRec'); $('helpX').onclick = () => closeOv('ovHelp'); $('optX').onclick = () => closeOv('ovOpts');
  const OPT = { sSound: 'sound', sMusic: 'music', sVib: 'vib', sNum: 'num', sAim: 'touchUI', sLow: 'low' };
  for (const id in OPT) {
    const el = $(id); el.checked = !!SET[OPT[id]];
    el.onchange = () => { SET[OPT[id]] = el.checked; saveSet(); S.sfxOn = SET.sound; S.musicOn = SET.music; if (id === 'sMusic') { if (SET.music) S.music(cur === 'sGame' ? 'game' : 'menu'); else S.stopMusic(); } if (id === 'sLow') toast('Gilt nach dem Neuladen'); if (id === 'sAim') document.body.classList.toggle('touch', SET.touchUI || touchSeen); };
  }

  /* ---------- Setup: Held, Bühne, Modus, Schwierigkeit ---------- */
  let hi = 0;
  function openSetup() { hi = Math.max(0, HEROES.findIndex(h => h.id === SET.hero)); scr('sSetup'); renderSetup(); }
  function seg(el, items, sel, fn, lockFn, label) {
    el.innerHTML = ''; items.forEach(it => { const b = document.createElement('button'); b.className = 'nav' + (it.id === sel ? ' sel' : '') + (lockFn && lockFn(it) ? ' lock' : ''); b.textContent = label(it); b.onclick = () => fn(it); el.appendChild(b); });
  }
  function renderSetup() {
    const h = HEROES[hi], own = owned().includes(h.id), sel = SET.hero === h.id, c = coins();
    $('suCoins').textContent = '🪙 ' + fmt(c); $('hName').textContent = h.n; $('hDesc').textContent = h.d; $('hIdx').textContent = (hi + 1) + ' / ' + HEROES.length;
    const w = FS.WEAPONS[h.w]; $('hStats').innerHTML = '<span>' + w.icon + ' ' + w.n + '</span><span>❤️ ' + Math.round(h.hp * 100) + ' %</span><span>👟 ' + Math.round(h.spd * 100) + ' %</span><span>💥 ' + Math.round(h.dmg * 100) + ' %</span>';
    const a = $('hAct'); a.classList.toggle('owned', own); a.classList.toggle('locked', !own && c < h.price);
    a.textContent = sel && own ? '✔ Ausgewählt' : own ? 'Auswählen' : c >= h.price ? 'Freischalten · 🪙 ' + fmt(h.price) : '🔒 🪙 ' + fmt(h.price);
    if (has3d) SC.loadHero(h).then(() => { if (HEROES[hi] === h && cur === 'sSetup') { SC.useHero(h); SC.heroAnim('idle'); } });
    const om = ownedMaps();
    seg($('segMap'), MAPS, SET.map, m => { if (om.includes(m.id)) { SET.map = m.id; saveSet(); S.sfx('ok'); if (has3d) SC.setMap(m); } else if (coins() >= m.price) { addCoins(-m.price); LS.set(P + 'maps', om.concat(m.id)); SET.map = m.id; saveSet(); S.sfx('buy'); toast('🎉 ' + m.n + ' freigeschaltet!'); if (has3d) SC.setMap(m); } else { S.sfx('bump'); toast('Noch 🪙 ' + fmt(m.price - coins()) + ' für ' + m.n); } renderSetup(); }, m => !om.includes(m.id), m => (om.includes(m.id) ? '' : '🔒 ') + m.n + (om.includes(m.id) ? '' : ' · 🪙 ' + fmt(m.price)));
    seg($('segMode'), MODES, SET.mode, m => { SET.mode = m.id; saveSet(); S.sfx('ok'); renderSetup(); }, null, m => m.n);
    seg($('segDiff'), DIFFS, SET.diff, d => { SET.diff = d.id; saveSet(); S.sfx('ok'); renderSetup(); }, null, d => d.n);
    $('modeInfo').textContent = MODES.find(m => m.id === SET.mode).d;
    $('suGo').disabled = !own;
  }
  $('hPrev').onclick = () => { hi = (hi + HEROES.length - 1) % HEROES.length; S.sfx('move'); renderSetup(); };
  $('hNext').onclick = () => { hi = (hi + 1) % HEROES.length; S.sfx('move'); renderSetup(); };
  $('hAct').onclick = () => {
    const h = HEROES[hi], own = owned();
    if (own.includes(h.id)) { SET.hero = h.id; saveSet(); S.sfx('ok'); toast(h.n + ' ist bereit!'); }
    else if (coins() >= h.price) { addCoins(-h.price); LS.set(P + 'owned', own.concat(h.id)); SET.hero = h.id; saveSet(); S.sfx('buy'); vib(30); toast('🎉 ' + h.n + ' freigeschaltet!'); }
    else { S.sfx('bump'); toast('Noch 🪙 ' + fmt(h.price - coins()) + ' – spiele Runden und sammle Münzen!'); }
    renderSetup();
  };
  $('suBack').onclick = () => { S.sfx('back'); toMenu(); }; $('suGo').onclick = () => start();

  /* ---------- Studio-Ausbau ---------- */
  function openShop() { scr('sShop'); renderShop(); }
  function renderShop() {
    const m = meta(), c = coins(); $('shCoins').textContent = '🪙 ' + fmt(c); const g = $('shGrid'); g.innerHTML = '';
    FS.META.forEach(u => {
      const lv = m[u.id] || 0, full = lv >= u.max, cost = full ? 0 : FS.metaCost(u, lv), div = document.createElement('div'); div.className = 'up';
      div.innerHTML = '<div class="t"><i>' + u.icon + '</i>' + u.n + '</div><p>' + u.d + '</p><div class="pips">' + Array.from({ length: u.max }, (_, i) => '<b class="' + (i < lv ? 'on' : '') + '"></b>').join('') + '</div>';
      const b = document.createElement('button'); b.className = 'btn nav' + (full ? '' : c >= cost ? ' pri' : ''); b.textContent = full ? '✔ Maximal' : '🪙 ' + fmt(cost) + ' · Stufe ' + (lv + 1); b.disabled = full;
      b.onclick = () => { if (coins() < cost) { S.sfx('bump'); toast('Noch 🪙 ' + fmt(cost - coins()) + ' nötig'); return; } addCoins(-cost); m[u.id] = lv + 1; LS.set(P + 'meta', m); S.sfx('buy'); vib(25); renderShop(); const nb = $('shGrid').querySelectorAll('.btn')[FS.META.indexOf(u)]; if (nb && !nb.disabled) nb.focus(); };
      div.appendChild(b); g.appendChild(div);
    });
  }
  $('shBack').onclick = () => { S.sfx('back'); toMenu(); };

  /* ---------- Eingabe ---------- */
  let touchSeen = false;
  const KMOVE = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], KeyW: [0, -1], KeyS: [0, 1], KeyA: [-1, 0], KeyD: [1, 0] };
  addEventListener('keydown', e => {
    document.body.classList.add('kbd'); const c = e.code;
    if (c === 'Escape' || (c === 'KeyP' && cur === 'sGame' && !overlays().length)) { e.preventDefault(); back(); return; }
    const inGame = cur === 'sGame' && !overlays().length;
    if (inGame) { if (KMOVE[c]) { e.preventDefault(); keys.add(c); } if (c === 'Space' || c === 'ShiftLeft' || c === 'ShiftRight') { e.preventDefault(); if (!e.repeat) IN.dash = true; } return; }
    if (!$('ovLevel').hidden && /^(Digit|Numpad)[1-4]$/.test(c)) { e.preventDefault(); pickChoice(+c.slice(-1) - 1); return; }
    if (cur === 'sTitle' && !overlays().length && !e.repeat && (c === 'Enter' || c === 'Space')) { e.preventDefault(); pressStart(); return; }
    const d = KMOVE[c];
    if (d) { const ae = document.activeElement; if (cur === 'sSetup' && !overlays().length && ae && ae.closest('.heroRow') && d[1] === 0) { e.preventDefault(); $(d[0] < 0 ? 'hPrev' : 'hNext').click(); return; } e.preventDefault(); moveFocus(d[0], d[1]); }
  });
  addEventListener('keyup', e => { keys.delete(e.code); });
  addEventListener('blur', () => { keys.clear(); if (G.running && cur === 'sGame' && !G.paused && !overlays().length) pause(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && G.running && cur === 'sGame' && !G.paused && !overlays().length) pause(); });
  addEventListener('pointerdown', () => document.body.classList.remove('kbd'), true);

  // Touch- und Mausstick: irgendwo im Spiel Finger auflegen und ziehen
  const sb = $('stickBase'), sk = $('stickKnob'), dashBtn = $('dashBtn');
  addEventListener('pointerdown', e => {
    if (e.pointerType === 'touch' && !touchSeen) { touchSeen = true; document.body.classList.add('touch'); }
    if (cur !== 'sGame' || overlays().length || TOUCH.id !== null || e.target.closest('button, a, .ov')) return;
    TOUCH.id = e.pointerId; TOUCH.ox = e.clientX; TOUCH.oy = e.clientY; TOUCH.x = TOUCH.z = 0; sb.style.display = 'block'; sb.style.left = e.clientX + 'px'; sb.style.top = e.clientY + 'px'; sk.style.transform = 'translate(0,0)';
  });
  addEventListener('pointermove', e => {
    if (e.pointerId !== TOUCH.id) return; let dx = e.clientX - TOUCH.ox, dy = e.clientY - TOUCH.oy; const R = 60, l = Math.hypot(dx, dy);
    if (l > R) { TOUCH.ox += dx / l * (l - R); TOUCH.oy += dy / l * (l - R); sb.style.left = TOUCH.ox + 'px'; sb.style.top = TOUCH.oy + 'px'; dx = e.clientX - TOUCH.ox; dy = e.clientY - TOUCH.oy; }
    TOUCH.x = Math.abs(dx) < 6 ? 0 : dx / R; TOUCH.z = Math.abs(dy) < 6 ? 0 : dy / R; sk.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
  });
  const tEnd = e => { if (e.pointerId !== TOUCH.id) return; TOUCH.id = null; TOUCH.x = TOUCH.z = 0; sb.style.display = 'none'; };
  addEventListener('pointerup', tEnd); addEventListener('pointercancel', tEnd);
  dashBtn.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); IN.dash = true; });

  // Gamecontroller
  const PAD = { b: [], dir: null }; let padNavT = 0;
  function anyPad() { try { return navigator.getGamepads && Array.from(navigator.getGamepads() || []).some(Boolean); } catch (e) { return false; } }
  function pollPads(dt) {
    PADI.x = PADI.z = 0; let list = []; try { list = navigator.getGamepads ? Array.from(navigator.getGamepads()) : []; } catch (e) { }
    const g = list.find(p => p && p.connected); if (!g) return;
    const ax = g.axes || [], bt = g.buttons || [], pr = k => !!(bt[k] && (bt[k].pressed || bt[k].value > .5)), now = []; for (let k = 0; k < 17; k++) now[k] = pr(k); const down = k => now[k] && !PAD.b[k];
    let sx = ax[0] || 0, sy = ax[1] || 0; const m = Math.hypot(sx, sy); if (m < .18) { sx = sy = 0; } else { const k = (m - .18) / .82 / m; sx *= k; sy *= k; }
    if (pr(14)) sx = -1; if (pr(15)) sx = 1; if (pr(12)) sy = -1; if (pr(13)) sy = 1;
    const x = Math.abs(sx) > .5 ? Math.sign(sx) : 0, z = Math.abs(sy) > .5 ? Math.sign(sy) : 0, dir = Math.abs(x) >= Math.abs(z) ? (x ? (x > 0 ? 'right' : 'left') : null) : (z > 0 ? 'down' : 'up');
    if (cur === 'sGame' && !overlays().length) {
      PADI.x = sx; PADI.z = sy; if (down(0) || down(1) || down(2) || down(3) || down(5) || down(7)) IN.dash = true; if (down(9)) pause();
      document.body.classList.remove('kbd');
    } else {
      document.body.classList.add('kbd');
      if (dir && (dir !== PAD.dir || padNavT <= 0)) { const dd = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[dir], ae = document.activeElement; if (cur === 'sSetup' && !overlays().length && ae && ae.closest('.heroRow') && dd[1] === 0) $(dd[0] < 0 ? 'hPrev' : 'hNext').click(); else moveFocus(dd[0], dd[1]); padNavT = dir !== PAD.dir ? .35 : .15; }
      if (down(0)) { if (cur === 'sTitle' && !overlays().length) pressStart(); else { const a = document.activeElement; if (a && a !== document.body && a.click) a.click(); else focusFirst(); } }
      if (down(1)) back(); if (down(9)) { if (cur === 'sTitle') pressStart(); else if (overlays().some(o => o.id === 'ovPause')) resume(); }
    }
    PAD.dir = dir; PAD.b = now; padNavT -= dt;
  }
  addEventListener('gamepadconnected', () => { toast('🎮 Controller verbunden'); $('pressTxt').textContent = 'A drücken'; });

  function readInput() {
    let kx = 0, kz = 0; keys.forEach(c => { const d = KMOVE[c]; if (d) { kx += d[0]; kz += d[1]; } });
    const cand = [[kx, kz], [TOUCH.x, TOUCH.z], [PADI.x, PADI.z]]; let bx = 0, bz = 0, bm = 0;
    for (const [x, z] of cand) { const m = Math.hypot(x, z); if (m > bm) { bm = m; bx = x; bz = z; } }
    IN.mx = bx; IN.mz = bz; return IN;
  }

  /* ---------- HUD ---------- */
  function setT(id, v) { if (G.lastHud[id] !== v) { G.lastHud[id] = v; $(id).textContent = v; } }
  function setW(id, v) { v = v.toFixed(1) + '%'; if (G.lastHud[id] !== v) { G.lastHud[id] = v; $(id).style.width = v; } }
  function hud() {
    const W = G.W, p = W.P; setW('hHp', Math.max(0, p.hp / p.maxHp * 100)); setT('hHpT', Math.ceil(Math.max(0, p.hp)) + ' / ' + p.maxHp); $('hHp').parentNode.classList.toggle('low', p.hp < p.maxHp * .3);
    setW('hXp', W.xp / W.need * 100); setT('hLv', 'Lv ' + W.lv); setT('hTime', mmss(W.t)); setT('hKills', '💀 ' + fmt(W.kills)); setT('hCoins', '🪙 ' + fmt(W.coins));
    const goal = W.won || W.endless ? (W.endless ? 'Endlos' : 'Zugabe') : W.bossIdx >= 3 ? 'Besiege den Großen Störsender!' : 'Ziel: ' + mmss(FS.RUN_LEN); setT('hGoal', goal);
    const sig = W.weapons.map(w => w.id + w.lv).join() + '|' + Object.keys(W.passives).map(k => k + W.passives[k]).join();
    if (sig !== G.sig) { G.sig = sig; $('hW').innerHTML = W.weapons.map(w => '<span title="' + FS.WEAPONS[w.id].n + '">' + FS.WEAPONS[w.id].icon + '<small>' + w.lv + '</small></span>').join('') + Object.keys(W.passives).map(k => '<span class="pa" title="' + FS.PASSIVES[k].n + '">' + FS.PASSIVES[k].icon + '<small>' + W.passives[k] + '</small></span>').join(''); }
    const bb = $('bossBar'); if (W.boss) { bb.hidden = false; setT('bossName', FS.EN[W.boss.type].n); setW('bossHp', Math.max(0, W.boss.hp / W.boss.maxHp * 100)); } else if (!bb.hidden) bb.hidden = true;
    const ring = $('dashRing'), cd = p.dashCd / 2.4; const off = (289 * cd).toFixed(0); if (G.lastHud.dr !== off) { G.lastHud.dr = off; ring.style.strokeDashoffset = off; dashBtn.classList.toggle('cd', cd > 0); }
    // Pfeil zum Boss, wenn er außerhalb des Bildes ist
    const ar = $('bossArrow');
    if (W.boss && has3d) {
      const q = SC.project(W.boss.x, 1, W.boss.z), w = SC.w, h = SC.h, m = 40, inside = q[0] > m && q[0] < w - m && q[1] > m + 70 && q[1] < h - m && q[2] < 1;
      if (inside) ar.hidden = true; else { ar.hidden = false; let dx = q[0] - w / 2, dy = q[1] - h / 2; if (q[2] > 1) { dx = -dx; dy = -dy; } const k = Math.min((w / 2 - m) / Math.abs(dx || 1e-3), (h / 2 - m - 40) / Math.abs(dy || 1e-3)); ar.style.transform = 'translate(' + (w / 2 + dx * k - 14) + 'px,' + (h / 2 + dy * k - 18) + 'px) rotate(' + Math.atan2(dy, dx) + 'rad)'; }
    } else ar.hidden = true;
    S.intensity(Math.min(1, W.t / 420 * .75 + (W.boss ? .25 : 0)));
  }

  /* ---------- Titel ---------- */
  function pressStart() { if (cur !== 'sTitle') return; S.unlock(); S.sfx('ok'); toMenu(); }
  $('bPress').onclick = pressStart; $('sTitle').addEventListener('pointerdown', e => { if (e.target.closest('a,button')) return; pressStart(); });

  /* ---------- Schleife ---------- */
  let last = performance.now();
  function loop(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now; pollPads(dt);
    const W = G.W;
    if (W && G.running && cur === 'sGame') {
      if (!G.paused && W.state === 'play') { FS.step(W, dt, readInput()); IN.dash = false; handleEvents(); if (G.running) hud(); }
      else { IN.dash = false; if (W.ev.length) handleEvents(); }
      if (has3d) { SC.update(dt, W); SC.sync(W, G.paused ? 0 : dt); }
    } else if (W && cur === 'sGame' && has3d) { SC.update(dt, W); SC.sync(W, dt); if (W.ev.length) handleEvents(); }
    else if (has3d) SC.update(dt, null);
    if (has3d) SC.render();
    requestAnimationFrame(loop);
  }

  /* ---------- Laden ---------- */
  const TIPS = ['Bühne wird aufgebaut …', 'Scheinwerfer werden justiert …', 'Boxen werden aufgedreht …', 'Helden machen sich bereit …', 'Gleich geht’s los!'];
  const bar = p => { $('loadBar').style.width = Math.round(p * 100) + '%'; $('loadTip').textContent = TIPS[Math.min(TIPS.length - 1, Math.floor(p * TIPS.length))]; };
  const wait = ms => new Promise(r => setTimeout(r, ms));
  (async function boot() {
    const t0 = performance.now(); bar(.1); await wait(40);
    const q = new URLSearchParams(location.search);
    if (!owned().includes(SET.hero)) SET.hero = 'rico'; if (!MODES.some(m => m.id === SET.mode)) SET.mode = 'run';
    if (coarse() || SET.touchUI) { document.body.classList.add('touch'); }
    try { if (!window.THREE) throw new Error('three'); SC.init($('stage'), { low: SET.low }); has3d = true; } catch (e) { has3d = false; console.warn('3D nicht verfügbar', e); $('stage').innerHTML = '<div style="margin:auto;padding:30px;text-align:center">Funkflut Survivor braucht 3D-Grafik (WebGL). Bitte einen aktuellen Browser verwenden.</div>'; }
    bar(.45); await wait(30);
    const h = HEROES.find(x => x.id === SET.hero) || HEROES[0];
    if (has3d) { try { await Promise.race([SC.loadHero(h), wait(6000)]); SC.useHero(h); SC.heroAnim('idle'); SC.setMap(MAPS.find(m => m.id === SET.map) || MAPS[0]); SC.setMode('menu'); SC.menuLook = 1.1; SC.menuDist = 5.8; } catch (e) { console.warn(e); } }
    bar(.85); requestAnimationFrame(loop); bar(1);
    await wait(Math.max(0, 1100 - (performance.now() - t0)));
    $('sLoad').classList.add('out'); setTimeout(() => { $('sLoad').classList.remove('on', 'out'); }, 520);
    if (anyPad()) $('pressTxt').textContent = 'A drücken'; else if (coarse()) $('pressTxt').textContent = 'Tippen zum Start';
    if (q.get('play')) { if (q.get('hero')) SET.hero = q.get('hero'); if (q.get('map')) SET.map = q.get('map'); if (q.get('mode')) SET.mode = q.get('mode'); if (q.get('diff')) SET.diff = q.get('diff'); if (q.get('all')) { LS.set(P + 'owned', HEROES.map(x => x.id)); LS.set(P + 'maps', MAPS.map(x => x.id)); } S.unlock(); start(); } else scr('sTitle');
  })();
  window.FSApp = { G, SET, start, toMenu, scr, pause, resume, get cur() { return cur; }, pickChoice, openLevel };
})();
