/* EASYCLASH – App: Laden, Titel, Konsolen-Menü, Kämpferwahl mit Vorschaubildern, Arena-Wahl, VS-Bildschirm, Kampf mit HUD,
 * Arcade (8 Gegner, Punkte für die Rangliste), Versus zu zweit (Tastatur links/rechts, zwei Controller), Gegen CPU, Training, Rekorde.
 * Eingabe: Tastatur, Gamecontroller (eigene Abfrage, bis zu 2), Touch-Stick und Knöpfe. Logik: js/core.js (EC), Figuren: js/roster.js,
 * Modelle: js/model.js, 3D: js/scene.js, Ton: js/sound.js. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id), P = 'easyclash-';
  const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } } };
  const SET = Object.assign({ sound: true, music: true, vib: true, touch: false, low: matchMedia('(pointer: coarse)').matches, diff: 1, rounds: 2, stage: 0 }, LS.get(P + 'settings', {}));
  const saveSet = () => LS.set(P + 'settings', SET);
  const S = window.ECSound, SC = window.ECScene, RO = window.EC_ROSTER, ST = SC.STAGES;
  S.sfxOn = SET.sound; S.musicOn = SET.music;
  const fmt = n => Number(n || 0).toLocaleString('de-DE');
  let toastT = 0; function toast(m) { const t = $('toast'); t.textContent = m; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2200); }
  const vib = ms => { if (SET.vib && navigator.vibrate) try { navigator.vibrate(ms); } catch (e) { } };
  const coarse = () => matchMedia('(pointer: coarse)').matches;
  const byId = id => RO.find(c => c.id === id) || RO[0];
  let has3d = false, POR = {};
  const por = id => POR[id] || '';

  /* ---------- Bildschirme / Navigation ---------- */
  let cur = 'sLoad';
  const BACK = { sMenu: () => scr('sTitle'), sSelect: () => selBack(), sStage: () => G.mode === 'online' ? hostLobby() : openSelect(G.mode), sLobby: () => { hostClose(); toMenu(); } };
  function scr(id) { document.querySelectorAll('.scr').forEach(s => s.classList.toggle('on', s.id === id)); cur = id; setTimeout(focusFirst, 0); }
  const overlays = () => Array.from(document.querySelectorAll('.ov')).filter(o => !o.hidden && o.id !== 'ovVs');
  const root = () => overlays().pop() || $(cur);
  const navEls = () => Array.from(root().querySelectorAll('.nav, .chip, .stcard')).filter(e => !e.disabled && e.offsetParent !== null);
  function focusFirst() { if (coarse() || cur === 'sGame' && !overlays().length || cur === 'sSelect' && !overlays().length) return; const els = navEls(), el = root().querySelector('.chip.on, .stcard.on') && cur === 'sStage' && !overlays().length ? $('stGo') : els.find(e => e.classList.contains('pri') || e.classList.contains('hero')) || els[0]; if (el) try { el.focus({ preventScroll: true }); } catch (e) { } }
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

  /* ---------- Zustand ---------- */
  const G = { mode: 'arcade', pick: [null, null], picking: 0, cursor: [0, 1], human: [true, false], M: null, W: null, acc: 0, ladder: null, score: 0, paused: false, lastHp: [200, 200], comboT: [0, 0], train: false, stage: SET.stage, roundT: 0 };
  const stats = () => Object.assign({ fights: 0, won: 0, titles: 0, bestCombo: 0, perfect: 0, used: {} }, LS.get(P + 'stats', {}));
  const hs = () => LS.get(P + 'highscore', 0);

  /* ---------- Menü ---------- */
  function toMenu() { closeAllOv(); G.W = null; if (has3d) { SC.setWorld(null); SC.setSelect([byId(LS.get(P + 'last', RO[0].id)), null]); } $('menuStat').textContent = '🏆 ' + fmt(hs()) + ' · ' + RO.length + ' Kämpfer'; $('rosterInfo').textContent = RO.length + ' Helden aus ' + new Set(RO.map(c => c.game)).size + ' Spielen'; $('menuKeys').textContent = padCount() ? '🎮 Steuerkreuz wählen · A bestätigen · B zurück' : '⌨️ Pfeile wählen · Enter bestätigen · Esc zurück'; scr('sMenu'); S.music('menu'); }
  document.querySelectorAll('#tiles .tile').forEach(t => t.onclick = () => {
    S.unlock(); S.sfx('ok'); const k = t.dataset.go;
    if (['arcade', 'versus', 'cpu', 'training'].includes(k)) openSelect(k);
    else if (k === 'online') hostOpen();
    else if (k === 'roster') { showRoster(); openOv('ovRoster'); }
    else if (k === 'rec') { showRec(); openOv('ovRec'); }
    else if (k === 'opts') openOv('ovOpts'); else if (k === 'help') openOv('ovHelp');
  });
  function showRoster() { $('roster').innerHTML = RO.map(c => '<div><img src="' + por(c.id) + '" alt=""><span><b>' + esc(c.n) + '</b><small>' + esc(c.gameN) + ' · ' + EC.SPECIAL[c.sp].n + '</small></span></div>').join(''); }
  function showRec() { const st = stats(), fav = Object.entries(st.used).sort((a, b) => b[1] - a[1])[0], c = (k, v) => '<div><small>' + k + '</small><b>' + v + '</b></div>'; $('recList').innerHTML = c('🏆 Arcade-Highscore', fmt(hs())) + c('👑 Titel', st.titles) + c('⚔️ Kämpfe gewonnen', st.won + ' / ' + st.fights) + c('💥 Beste Kombo', st.bestCombo + ' Schaden') + c('✨ Perfekt', st.perfect) + c('❤️ Lieblingskämpfer', fav ? byId(fav[0]).n : '–'); }
  $('recX').onclick = () => closeOv('ovRec'); $('rosX').onclick = () => closeOv('ovRoster'); $('helpX').onclick = () => closeOv('ovHelp'); $('optX').onclick = () => closeOv('ovOpts');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const OPT = { sSound: 'sound', sMusic: 'music', sVib: 'vib', sTouch: 'touch', sLow: 'low' };
  for (const id in OPT) { const el = $(id); el.checked = !!SET[OPT[id]]; el.onchange = () => { SET[OPT[id]] = el.checked; saveSet(); S.sfxOn = SET.sound; S.musicOn = SET.music; if (SET.music) S.music(cur === 'sGame' ? 'game' : 'menu'); if (id === 'sLow') toast('Gilt nach dem Neuladen'); touchUi(); }; }

  /* ---------- Kämpferwahl ---------- */
  function openSelect(mode) {
    G.mode = mode; G.picking = 0; G.pick = [null, null]; G.human = [true, mode === 'versus'];
    const last = RO.findIndex(c => c.id === LS.get(P + 'last', RO[0].id)); G.cursor = [Math.max(0, last), (Math.max(0, last) + 1) % RO.length];
    $('selGrid').innerHTML = RO.map((c, i) => '<button class="scard" data-i="' + i + '"><img src="' + por(c.id) + '" alt=""><span>' + esc(c.n) + '</span></button>').join('');
    $('selGrid').querySelectorAll('.scard').forEach(b => { b.onclick = () => { const i = +b.dataset.i; if (G.cursor[G.picking] === i) confirmPick(); else { G.cursor[G.picking] = i; S.sfx('select'); selRefresh(); } }; });
    scr('sSelect'); selRefresh(); S.music('menu');
  }
  function selRefresh() {
    const p = G.picking, c1 = RO[G.pick[0] != null ? G.pick[0] : G.cursor[0]], c2 = p >= 1 ? RO[G.pick[1] != null ? G.pick[1] : G.cursor[1]] : null;
    $('selTitle').textContent = G.mode === 'arcade' ? 'Arcade – wähle deinen Kämpfer' : p === 0 ? 'Wähle deinen Kämpfer' : G.human[1] ? 'Spieler 2 wählt' : 'Wähle den Gegner';
    $('selTag').textContent = p === 0 ? 'Spieler 1' : G.human[1] ? 'Spieler 2' : 'CPU'; $('selTag').classList.toggle('p2', p === 1);
    $('selN1').textContent = c1.n; $('selG1').textContent = c1.gameN; $('selN2').textContent = c2 ? c2.n : '?'; $('selG2').textContent = c2 ? c2.gameN : '';
    const sc = RO[G.cursor[p]]; $('selSp').textContent = '✨ ' + EC.SPECIAL[sc.sp].n + ' · ' + (sc.d || '');
    $('selGrid').querySelectorAll('.scard').forEach((b, i) => { b.classList.toggle('c1', p === 0 ? i === G.cursor[0] : i === G.pick[0]); b.classList.toggle('c2', p === 1 && i === G.cursor[1]); });
    const cb = $('selGrid').children[G.cursor[p]]; if (cb) cb.scrollIntoView({ block: 'nearest' });
    $('selGo').disabled = false; $('selGo').textContent = (G.mode === 'arcade' || p === 1) ? 'Weiter ▶' : 'Auswählen ▶';
    if (has3d) SC.setSelect([c1, c2]);
  }
  function confirmPick() {
    const p = G.picking; G.pick[p] = G.cursor[p]; S.sfx('ok'); vib(15);
    if (G.mode === 'arcade') { G.pick[1] = null; return startArcade(); }
    if (p === 0) { G.picking = 1; if (G.cursor[1] === G.pick[0]) G.cursor[1] = (G.pick[0] + 1) % RO.length; selRefresh(); return; }
    openStage();
  }
  function selBack() { if (G.picking === 1) { G.picking = 0; G.pick[0] = null; selRefresh(); } else toMenu(); }
  function selMove(dx, dy) {
    const grid = $('selGrid'), cols = Math.max(1, Math.round(grid.clientWidth / (grid.children[0] ? grid.children[0].offsetWidth + 6 : 80))), p = G.picking;
    let i = G.cursor[p] + dx + dy * cols; i = (i + RO.length) % RO.length; G.cursor[p] = i; S.sfx('select'); selRefresh();
  }
  $('selGo').onclick = () => confirmPick(); $('selBack').onclick = () => { S.sfx('back'); selBack(); };
  $('selRand').onclick = () => { G.cursor[G.picking] = Math.floor(Math.random() * RO.length); selRefresh(); setTimeout(confirmPick, 250); };

  /* ---------- Arena-Wahl ---------- */
  function openStage() {
    $('stageGrid').innerHTML = ST.map((s, i) => '<button class="stcard' + (i === G.stage ? ' on' : '') + '" data-i="' + i + '"><b>' + esc(s.n) + '</b><small>aus ' + esc(s.from) + '</small></button>').join('') + '<button class="stcard' + (G.stage === -1 ? ' on' : '') + '" data-i="-1"><b>🎲 Zufall</b><small>Überrasch mich</small></button>';
    $('stageGrid').querySelectorAll('.stcard').forEach(b => b.onclick = () => { G.stage = +b.dataset.i; SET.stage = G.stage; saveSet(); $('stageGrid').querySelectorAll('.stcard').forEach(x => x.classList.toggle('on', x === b)); S.sfx('select'); if (has3d && G.stage >= 0) SC.setStage(G.stage); });
    $('diffRow').hidden = G.human[1] || G.mode === 'training';
    $('diffChips').innerHTML = ['Leicht', 'Mittel', 'Schwer'].map((n, i) => '<button class="chip' + (i === SET.diff ? ' on' : '') + '" data-v="' + i + '">' + n + '</button>').join('');
    $('roundChips').innerHTML = [1, 2, 3].map(n => '<button class="chip' + (n === SET.rounds ? ' on' : '') + '" data-v="' + n + '">' + (n === 1 ? '1 Sieg' : n + ' Siege') + '</button>').join('');
    $('diffChips').querySelectorAll('.chip').forEach(b => b.onclick = () => { SET.diff = +b.dataset.v; saveSet(); $('diffChips').querySelectorAll('.chip').forEach(x => x.classList.toggle('on', x === b)); S.sfx('select'); });
    $('roundChips').querySelectorAll('.chip').forEach(b => b.onclick = () => { SET.rounds = +b.dataset.v; saveSet(); $('roundChips').querySelectorAll('.chip').forEach(x => x.classList.toggle('on', x === b)); S.sfx('select'); });
    if (G.mode === 'training') return startFight(RO[G.pick[0]], RO[G.pick[1]], Math.max(0, G.stage));
    scr('sStage'); if (has3d && G.stage >= 0) SC.setStage(G.stage);
  }
  $('stBack').onclick = () => { S.sfx('back'); if (G.mode === 'online') hostLobby(); else openSelect(G.mode); };
  $('stGo').onclick = () => startFight(RO[G.pick[0]], RO[G.pick[1]], G.stage < 0 ? Math.floor(Math.random() * ST.length) : G.stage);

  /* ---------- Arcade ---------- */
  function startArcade() {
    const me = RO[G.pick[0]], pool = RO.filter(c => c !== me).sort(() => Math.random() - .5);
    G.ladder = { list: pool.slice(0, 8), at: 0, me, score: 0, conts: 0 }; G.score = 0; nextArcade();
  }
  function nextArcade() {
    const L = G.ladder, opp = L.list[L.at], boss = L.at === 7;
    const ch = boss ? Object.assign({}, opp, { n: opp.n + ' (Champion)', stats: Object.assign({}, opp.stats, { power: (opp.stats && opp.stats.power || 1) * 1.15 }) }) : opp;
    G.diffNow = Math.min(2, Math.floor(L.at / 3) + (SET.diff >= 2 ? 1 : 0)); G.pick[1] = RO.indexOf(opp);
    startFight(L.me, ch, (L.at + Math.floor(Math.random() * 3)) % ST.length, 'Kampf ' + (L.at + 1) + ' / 8' + (boss ? ' · Finale' : ''));
  }

  /* ---------- Kampf ---------- */
  function startFight(a, b, stage, info) {
    closeAllOv(); G.cur = [a, b]; G.stageNow = stage; G.train = G.mode === 'training';
    G.M = EC.newMatch({ chars: [a, b], target: G.train ? 99 : G.mode === 'arcade' ? 2 : SET.rounds, time: G.train ? 999 : 60, seed: (Math.random() * 1e9) >>> 0 });
    LS.set(P + 'last', a.id); const st = stats(); st.used[a.id] = (st.used[a.id] || 0) + 1; LS.set(P + 'stats', st);
    if (has3d) { SC.setStage(stage); SC.setFighters([a, b]); }
    $('hP1').src = por(a.id); $('hP2').src = por(b.id); $('hN1').textContent = a.n; $('hN2').textContent = b.n;
    $('vsP1').src = por(a.id); $('vsP2').src = por(b.id); $('vsN1').textContent = a.n; $('vsN2').textContent = b.n; $('vsG1').textContent = a.gameN; $('vsG2').textContent = b.gameN;
    $('vsInfo').textContent = (info || '') + (info ? ' · ' : '') + ST[stage].n;
    scr('sGame'); touchUi(); $('trainInfo').hidden = !G.train;
    if (G.train) { newRound(); S.music('game'); return; }
    $('ovVs').hidden = false; S.sfx('fight'); S.music('game');
    setTimeout(() => { $('ovVs').hidden = true; newRound(); }, 1900);
  }
  function newRound() { G.W = EC.newRound(G.M); G.acc = 0; G.lastHp = [EC.HP, EC.HP]; if (has3d) SC.setWorld(G.W); hudWins(); hud(); G.roundT = 0; }
  const playing = () => cur === 'sGame' && !overlays().length && G.W && $('ovVs').hidden;
  function hudWins() { const M = G.M; for (let i = 0; i < 2; i++) $('hW' + (i + 1)).textContent = G.train ? '' : '●'.repeat(M.wins[i]) + '○'.repeat(Math.max(0, M.target - M.wins[i])); }
  function hud() {
    const W = G.W; if (!W) return;
    W.f.forEach((F, i) => { const pc = Math.max(0, F.hp) / EC.HP * 100, h = $('hH' + (i + 1)); h.style.width = pc + '%'; h.classList.toggle('low', pc <= 25); $('hL' + (i + 1)).style.width = pc + '%'; $('hR' + (i + 1)).classList.toggle('on', F.rage && !F.finale); });
    $('hTime').textContent = G.train ? '∞' : Math.ceil(W.time); $('hTime').classList.toggle('low', W.time <= 10 && !G.train);
    $('tFin').hidden = !(W.f[0].rage && !W.f[0].finale);
  }
  function announce(txt, gold) { const a = $('announce'); a.textContent = txt; a.classList.toggle('gold', !!gold); a.classList.remove('go'); void a.offsetWidth; a.classList.add('go'); }
  function comboFx(i, n, dmg) { const c = $('hC' + (i + 1)); c.innerHTML = n + ' Treffer<small>' + dmg + ' Schaden</small>'; c.classList.add('on'); clearTimeout(G.comboT[i]); G.comboT[i] = setTimeout(() => c.classList.remove('on'), 1300); if (G.train) $('trainInfo').textContent = 'Letzte Kombo: ' + n + ' Treffer · ' + dmg + ' Schaden'; if (i === 0 && G.human[0] && !G.train || i === 0 && G.train) { const st = stats(); if (dmg > st.bestCombo) { st.bestCombo = dmg; LS.set(P + 'stats', st); } } }
  function flash() { const f = $('flash'); f.classList.add('on'); setTimeout(() => f.classList.remove('on'), 60); }
  function events() {
    const W = G.W;
    for (const e of W.ev) {
      if (has3d) SC.onEvent(e);
      if (e.k === 'round') { announce(G.train ? 'Training' : W.M.round === 1 ? 'Runde 1' : (W.M.wins[0] === W.M.target - 1 && W.M.wins[1] === W.M.target - 1) ? 'Letzte Runde' : 'Runde ' + W.M.round); S.sfx('round'); }
      else if (e.k === 'fight') { announce('Kampf!', true); S.sfx('fight'); }
      else if (e.k === 'swing') S.sfx('swing');
      else if (e.k === 'hit') { if (e.block) S.sfx('block'); else { S.sfx(e.big ? 'big' : 'hit', e.dmg); vib(e.big ? 35 : 12); if (e.super) flash(); } }
      else if (e.k === 'counter') { S.sfx('counter'); const c = $('hC' + (e.i + 1)); c.innerHTML = 'Konter!'; c.classList.add('on'); clearTimeout(G.comboT[e.i]); G.comboT[e.i] = setTimeout(() => c.classList.remove('on'), 800); }
      else if (e.k === 'combo') comboFx(e.i, e.n, e.dmg);
      else if (e.k === 'throw') { S.sfx('throw'); vib(40); }
      else if (e.k === 'break') { S.sfx('block'); toast('Wurf befreit!'); }
      else if (e.k === 'proj') S.sfx('proj'); else if (e.k === 'side') S.sfx('side'); else if (e.k === 'land') S.sfx('land');
      else if (e.k === 'rage') { S.sfx('rage'); if (W.f[e.i] && (e.i === 0 || G.human[1])) toast('🔥 Wut! Jetzt das Finale: ' + (coarse() ? '🔥-Knopf' : 'O bzw. RT')); }
      else if (e.k === 'finale') { S.sfx('finale'); flash(); announce('Finale!', true); }
      else if (e.k === 'wall') S.sfx('big');
      else if (e.k === 'ko') { S.sfx('ko'); announce(e.perfect ? 'Perfekt!' : 'K.O.!', e.perfect); vib(80); if (e.perfect && W.winner === 0) { const st = stats(); st.perfect++; LS.set(P + 'stats', st); } }
      else if (e.k === 'time') { announce('Zeit!'); S.sfx('ko'); }
      else if (e.k === 'roundEnd') { hudWins(); setTimeout(() => roundOver(e), 900); }
    }
  }
  function roundOver(e) {
    if (!G.W || G.W.phase !== 'end') return;
    if (!e.over) { const w = e.winner; if (w >= 0) announce(G.cur[w].n.replace(/\s*\(.*\)$/, '') + ' siegt', true); setTimeout(() => { if (cur === 'sGame' && G.W && G.W.phase === 'end') newRound(); }, 1200); return; }
    matchOver();
  }
  function matchOver() {
    const M = G.M, win = M.winner, st = stats(), me = win === 0; st.fights++; if (me) st.won++;
    let next = false, title = '', sub = '', kick = '';
    const c = (k, v) => '<div><small>' + k + '</small><b>' + v + '</b></div>';
    if (G.mode === 'arcade') {
      const L = G.ladder; kick = 'Arcade · Kampf ' + (L.at + 1) + ' / 8';
      if (me) { const W = G.W, pts = 1000 + W.f[0].hp * 10 + Math.ceil(W.time) * 20 + (M.wins[1] === 0 ? 1500 : 0); L.score += pts; L.at++; sub = '+' + fmt(pts) + ' Punkte'; if (L.at >= 8) { st.titles++; title = '👑 ' + L.me.n + ' ist Champion!'; S.sfx('win'); } else { title = L.me.n + ' gewinnt!'; next = true; S.sfx('win'); } }
      else { title = 'Verloren …'; sub = 'Weiter mit „Revanche“ (Punkte halbiert)'; S.sfx('lose'); }
      if (!me || L.at >= 8) { if (L.score > hs()) { LS.set(P + 'highscore', L.score); sub += ' · ⭐ Neuer Highscore!'; } }
      $('eStats').innerHTML = c('Punkte', fmt(L.score)) + c('Highscore', fmt(hs())) + c('Gegner', L.at + ' / 8 besiegt') + c('Leben übrig', me ? G.W.f[0].hp : 0);
    } else {
      kick = G.mode === 'versus' ? 'Versus' : G.mode === 'online' ? 'Online & Handys' : 'Gegen CPU'; netEnd(win);
      title = win < 0 ? 'Unentschieden!' : G.cur[win].n + ' gewinnt!'; sub = (G.mode === 'versus' || G.mode === 'online' ? 'Spieler ' + (win + 1) : win === 0 ? 'Du' : 'CPU') + ' · ' + M.wins[0] + ' : ' + M.wins[1];
      S.sfx(win === 0 || G.mode === 'versus' || G.mode === 'online' ? 'win' : 'lose');
      $('eStats').innerHTML = c('Runden', M.wins[0] + ' : ' + M.wins[1]) + c('Kämpfe gewonnen', st.won + ' / ' + st.fights);
    }
    LS.set(P + 'stats', st);
    $('eKick').textContent = kick; $('eTitle').textContent = title; $('eSub').textContent = sub; $('ePor').src = por(G.cur[Math.max(0, win)].id);
    $('eNext').hidden = !next; $('eAgain').textContent = G.mode === 'arcade' && !me ? '↻ Revanche' : G.mode === 'arcade' ? '↻ Neues Arcade' : '↻ Revanche';
    S.music('menu'); openOv('ovEnd');
  }
  $('eNext').onclick = () => { closeOv('ovEnd'); nextArcade(); };
  $('eAgain').onclick = () => { closeOv('ovEnd'); if (G.mode === 'arcade') { const L = G.ladder; if (L.at >= 8) return startArcade(); L.score = Math.floor(L.score / 2); nextArcade(); } else startFight(G.cur[0], G.cur[1], G.stageNow); };
  $('eSel').onclick = () => { closeOv('ovEnd'); if (G.mode === 'online') hostLobby(); else openSelect(G.mode); };
  $('eMenu').onclick = () => { closeOv('ovEnd'); if (G.mode === 'online') hostClose(); toMenu(); };
  function pause() { if (!playing()) return; openOv('ovPause'); S.music('menu'); }
  function resume() { closeOv('ovPause'); S.music('game'); }
  $('bPause').onclick = () => pause(); $('pGo').onclick = () => resume();
  $('pRestart').onclick = () => { closeOv('ovPause'); if (G.mode === 'arcade') nextArcade(); else startFight(G.cur[0], G.cur[1], G.stageNow); };
  $('pMoves').onclick = () => { showMoves(); openOv('ovMoves'); }; $('movX').onclick = () => closeOv('ovMoves');
  function showMoves() {
    const me = G.cur ? G.cur[0] : RO[0], sp = EC.SPECIAL[me.sp], hl = { high: 'hoch', mid: 'mittel', low: 'tief', throw: 'Wurf' };
    const rows = Object.entries(EC.BASE).filter(([k]) => k !== 'air').map(([k, m]) => '<div><b>' + esc(m.n) + '</b><small>' + hl[m.h] + (m.launch ? ' · hebt aus' : m.kd ? ' · wirft um' : m.wall ? ' · Wand' : '') + '</small></div>');
    rows.splice(0, 0, '<div><b>1+2 · ' + esc(sp.n) + '</b><small>Spezial von ' + esc(me.n) + '</small></div>');
    $('moveList').innerHTML = rows.join('');
  }
  $('pSel').onclick = () => { closeOv('ovPause'); if (G.mode === 'online') hostLobby(); else openSelect(G.mode); }; $('pHelp').onclick = () => openOv('ovHelp'); $('pOpts').onclick = () => openOv('ovOpts');
  $('pQuit').onclick = () => { closeOv('ovPause'); if (G.mode === 'online') hostClose(); toMenu(); };
  function pressStart() { if (cur !== 'sTitle') return; S.unlock(); S.sfx('ok'); toMenu(); }
  $('bPress').onclick = pressStart; $('sTitle').addEventListener('pointerdown', e => { if (e.target.closest('a')) return; e.preventDefault(); pressStart(); });

  /* ---------- Eingabe ---------- */
  const KEY = {}, EDGE = { kb1: {}, kb2: {}, touch: {}, pad0: {}, pad1: {} };
  // 1 = linke Faust, 2 = rechte Faust, 3 = linkes Bein, 4 = rechtes Bein (wie bei den großen 3D-Prüglern)
  const KB = {
    kb1: { l: ['KeyA'], r: ['KeyD'], u: ['KeyW'], d: ['KeyS'], b1: ['KeyU'], b2: ['KeyI'], b3: ['KeyJ'], b4: ['KeyK'], g: ['KeyO'], s: ['KeyL'], f: ['Space'], block: ['KeyH'] },
    kb2: { l: ['ArrowLeft'], r: ['ArrowRight'], u: ['ArrowUp'], d: ['ArrowDown'], b1: ['Numpad7', 'Comma'], b2: ['Numpad8', 'Period'], b3: ['Numpad4', 'KeyM'], b4: ['Numpad5', 'KeyN'], g: ['Numpad9'], s: ['Numpad6', 'Slash'], f: ['Numpad0', 'Enter'], block: ['NumpadDecimal', 'ShiftRight'] }
  };
  const BTN = ['b1', 'b2', 'b3', 'b4', 's', 'g', 'f'];
  addEventListener('keydown', e => {
    document.body.classList.add('kbd'); const c = e.code;
    if (c === 'Escape' || (c === 'KeyP' && cur === 'sGame' && !overlays().length)) { e.preventDefault(); back(); return; }
    if (!e.repeat) for (const d of ['kb1', 'kb2']) for (const b of BTN) if (KB[d][b].includes(c)) EDGE[d][b] = true;
    KEY[c] = true;
    if (cur === 'sGame' && !overlays().length) { if (c.startsWith('Arrow') || c === 'Space' || c === 'Enter' || c.startsWith('Numpad')) e.preventDefault(); return; }
    if (cur === 'sTitle' && !overlays().length && !e.repeat) { e.preventDefault(); pressStart(); return; }
    if (cur === 'sSelect' && !overlays().length) {
      const d = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], KeyW: [0, -1], KeyS: [0, 1], KeyA: [-1, 0], KeyD: [1, 0] }[c];
      if (d) { e.preventDefault(); selMove(d[0], d[1]); return; } if (c === 'Enter' || c === 'Space' || c === 'KeyU') { e.preventDefault(); confirmPick(); return; } if (c === 'KeyR') { $('selRand').click(); return; } return;
    }
    const dir = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[c];
    if (dir) { e.preventDefault(); moveFocus(dir[0], dir[1]); }
  });
  addEventListener('keyup', e => { KEY[e.code] = false; });
  addEventListener('blur', () => { for (const k in KEY) KEY[k] = false; });
  addEventListener('pointerdown', () => document.body.classList.remove('kbd'), true);
  const kd = l => l.some(c => KEY[c]);
  function readKb(d) { const m = KB[d]; return { x: (kd(m.r) ? 1 : 0) - (kd(m.l) ? 1 : 0), y: (kd(m.d) ? 1 : 0) - (kd(m.u) ? 1 : 0), block: kd(m.block) }; }
  // Controller
  const PADS = [{ b: [] }, { b: [] }]; let padNavT = 0;
  const padCount = () => { try { return Array.from(navigator.getGamepads ? navigator.getGamepads() : []).filter(Boolean).length; } catch (e) { return 0; } };
  function pollPads(dt) {
    let list = []; try { list = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(p => p && p.connected) : []; } catch (e) { }
    for (let i = 0; i < 2; i++) {
      const g = list[i], st = PADS[i]; st.on = !!g; if (!g) continue;
      const ax = g.axes || [], bt = g.buttons || [], pr = k => !!(bt[k] && (bt[k].pressed || bt[k].value > .5));
      const dz = v => Math.abs(v) > .22 ? Math.max(-1, Math.min(1, (v - Math.sign(v) * .22) / .7)) : 0;
      let x = dz(ax[0] || 0), y = dz(ax[1] || 0);
      if (pr(14)) x = -1; if (pr(15)) x = 1; if (pr(12)) y = -1; if (pr(13)) y = 1; st.x = x; st.y = y; st.block = pr(6);
      x = Math.abs(x) > .5 ? Math.sign(x) : 0; y = Math.abs(y) > .5 ? Math.sign(y) : 0;
      const now = []; for (let k = 0; k < 17; k++) now[k] = pr(k); const down = k => now[k] && !st.b[k], E = EDGE['pad' + i];
      if (down(2)) E.b1 = true; if (down(3)) E.b2 = true; if (down(0)) E.b3 = true; if (down(1)) E.b4 = true; if (down(4)) E.g = true; if (down(5)) E.s = true; if (down(7)) E.f = true;
      const inGame = cur === 'sGame' && !overlays().length;
      if (!inGame) {
        document.body.classList.add('kbd');
        const dir = x || y ? [x, y] : null, key = dir ? dir.join() : '';
        if (dir && (key !== st.nav || padNavT <= 0)) { if (cur === 'sSelect' && !overlays().length) { if (i === G.picking || !G.human[1]) selMove(dir[0], dir[1]); } else moveFocus(dir[0], dir[1]); padNavT = key !== st.nav ? .3 : .12; } st.nav = key;
        if (down(0)) { if (cur === 'sTitle' && !overlays().length) pressStart(); else if (cur === 'sSelect' && !overlays().length) confirmPick(); else { const a = document.activeElement; if (a && a !== document.body && a.click) a.click(); else focusFirst(); } }
        if (down(1)) back(); if (down(9)) { if (cur === 'sTitle') pressStart(); else if (overlays().some(o => o.id === 'ovPause')) resume(); }
        for (const b of BTN) E[b] = false;
      } else if (down(9)) pause();
      st.b = now;
    }
    padNavT -= dt;
  }
  addEventListener('gamepadconnected', () => { toast('🎮 Controller ' + padCount() + ' verbunden'); $('pressTxt').textContent = 'Drücke A'; touchUi(); });
  // Touch
  const TS = { x: 0, y: 0, id: null, ox: 0, oy: 0, block: false };
  (function () {
    const zone = $('tZone'), knob = $('tStick'), R = 46;
    zone.addEventListener('pointerdown', e => { TS.id = e.pointerId; try { zone.setPointerCapture(e.pointerId); } catch (x) { } const r = zone.getBoundingClientRect(); TS.ox = e.clientX; TS.oy = e.clientY; knob.style.left = (e.clientX - r.left) + 'px'; knob.style.top = (e.clientY - r.top) + 'px'; knob.style.bottom = 'auto'; knob.style.margin = '-60px 0 0 -60px'; knob.classList.add('on'); e.preventDefault(); });
    zone.addEventListener('pointermove', e => { if (e.pointerId !== TS.id) return; let dx = e.clientX - TS.ox, dy = e.clientY - TS.oy; const l = Math.hypot(dx, dy); if (l > R) { dx *= R / l; dy *= R / l; } TS.x = Math.abs(dx) > R * .15 ? dx / R : 0; TS.y = Math.abs(dy) > R * .15 ? dy / R : 0; knob.firstElementChild.style.transform = 'translate(' + dx + 'px,' + dy + 'px)'; });
    const end = e => { if (e.pointerId !== TS.id) return; TS.id = null; TS.x = TS.y = 0; knob.firstElementChild.style.transform = ''; knob.classList.remove('on'); };
    zone.addEventListener('pointerup', end); zone.addEventListener('pointercancel', end); zone.addEventListener('lostpointercapture', end);
    document.querySelectorAll('.tb').forEach(b => { const k = b.dataset.b;
      b.addEventListener('pointerdown', e => { e.preventDefault(); if (k === 'block') TS.block = true; else EDGE.touch[k] = true; b.classList.add('hit'); vib(8); });
      const up = () => { if (k === 'block') TS.block = false; b.classList.remove('hit'); }; b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('pointerleave', up); });
  })();
  function touchUi() { $('touch').hidden = !(SET.touch || coarse()) || cur !== 'sGame'; }
  // Eingaben je Spieler sammeln (Kanten werden verbraucht)
  function gather(i) {
    let x = 0, y = 0, block = false; const b = {};
    if (G.mode === 'online' && H.slots[i] && H.slots[i].peer) { const n = NETIN[H.slots[i].peer] || {}, o = { fx: i === 0 ? n.x || 0 : -(n.x || 0), sy: n.y || 0, block: !!n.bl }; for (const k of BTN) { const c = n.c ? n.c[k] || 0 : 0, l = n.l ? n.l[k] || 0 : 0; if (c > l) o[k] = true; } n.l = Object.assign({}, n.c || {}); return o; }
    const devs = G.mode === 'online' ? ['kb1', 'kb2', 'pad0', 'pad1', 'touch'] : G.human[1] ? (i === 0 ? ['kb1', 'pad0', 'touch'] : ['kb2', 'pad1']) : ['kb1', 'kb2', 'pad0', 'pad1', 'touch'];
    for (const d of devs) {
      let v = null;
      if (d === 'kb1' || d === 'kb2') v = readKb(d); else if (d === 'touch') v = TS; else { const p = PADS[+d.slice(3)]; if (p && p.on) v = p; }
      if (v) { if (Math.abs(v.x || 0) > Math.abs(x)) x = v.x; if (Math.abs(v.y || 0) > Math.abs(y)) y = v.y; if (v.block) block = true; }
      const E = EDGE[d]; for (const k of BTN) if (E[k]) { b[k] = true; E[k] = false; }
    }
    return { fx: i === 0 ? x : -x, sy: y, block, b1: b.b1, b2: b.b2, b3: b.b3, b4: b.b4, s: b.s, g: b.g, f: b.f };
  }
  const clearEdges = () => { for (const d in EDGE) for (const k of BTN) EDGE[d][k] = false; };

  /* ---------- Online: Verbindung (PeerJS-kompatibel über ../cloud/fire-peer.js) ---------- */
  const NETIN = {};
  function mkNet(cb) {
    const ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789', PRE = 'ecclash-';
    const N = { role: '', code: '', peer: null, conns: new Map() }; const libs = {};
    const load = (src, ok) => libs[src] || (libs[src] = new Promise((res, rej) => { if (ok()) return res(); const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => { delete libs[src]; rej(new Error('lib')); }; document.head.appendChild(s); }));
    N.loadPeer = () => load('../vendor/peerjs-1.5.4.min.js', () => !!window.Peer);
    N.loadQR = () => load('../vendor/qrcode-generator-1.4.4.js', () => !!window.qrcode);
    N.norm = s => Array.from(String(s || '').toUpperCase()).filter(c => ALPHA.includes(c)).join('').slice(0, 4);
    N.link = () => { const u = location.href.split('#')[0].split('?')[0] + '?join=' + N.code; return window.EasyGamesLink ? EasyGamesLink.share(u) : u; };
    const mkCode = () => { let c = ''; for (let i = 0; i < 4; i++) c += ALPHA[(Math.random() * ALPHA.length) | 0]; return c; };
    function reg(conn, onOpen) {
      conn.on('open', () => { N.conns.set(conn.peer, conn); if (onOpen) onOpen(); });
      conn.on('data', d => { if (d && typeof d === 'object') cb.onMsg(conn.peer, d); });
      const gone = () => { if (N.conns.get(conn.peer) !== conn) return; N.conns.delete(conn.peer); cb.onLeave(conn.peer); };
      conn.on('close', gone); conn.on('error', gone);
    }
    N.host = async function () {
      N.close(); await N.loadPeer();
      for (let k = 0; k < 6 && !N.peer; k++) {
        const code = mkCode();
        const ok = await new Promise(res => { const p = new Peer(PRE + code); let done = false;
          p.on('open', () => { done = true; N.peer = p; N.code = code; N.role = 'host'; res(true); });
          p.on('error', e => { if (!done) { done = true; try { p.destroy(); } catch (x) { } res(e && e.type === 'unavailable-id' ? false : 'err'); } }); });
        if (ok === 'err') throw new Error('broker');
      }
      if (!N.peer) throw new Error('code');
      N.peer.on('connection', c => reg(c)); N.peer.on('disconnected', () => { try { N.peer.reconnect(); } catch (e) { } });
      return N.code;
    };
    N.join = async function (code) {
      code = N.norm(code); if (code.length !== 4) throw new Error('code'); N.close(); await N.loadPeer();
      await new Promise((res, rej) => { const p = new Peer(); let done = false; const fail = m => { if (done) return; done = true; try { p.destroy(); } catch (x) { } rej(new Error(m)); }; setTimeout(() => fail('timeout'), 14000);
        p.on('error', e => { if (!done) fail(e && e.type === 'peer-unavailable' ? 'nocode' : 'broker'); });
        p.on('open', () => { N.peer = p; N.role = 'guest'; N.code = code; reg(p.connect(PRE + code, { reliable: true }), () => { if (done) return; done = true; res(); }); }); });
    };
    N.sendTo = (id, d) => { const c = N.conns.get(id); if (c && c.open) { try { c.send(d); } catch (e) { } } };
    N.send = d => { for (const [, c] of N.conns) if (c.open) { try { c.send(d); } catch (e) { } } };
    N.close = () => { for (const [, c] of N.conns) { try { c.close(); } catch (e) { } } N.conns.clear(); if (N.peer) { try { N.peer.destroy(); } catch (e) { } } N.peer = null; N.role = ''; N.code = ''; };
    return N;
  }
  const netErr = e => ({ nocode: 'Diesen Raum gibt es nicht (mehr). Stimmt der Code auf dem großen Bildschirm?', timeout: 'Keine Verbindung – bitte nochmal versuchen.', code: 'Bitte den 4-stelligen Code eingeben.' }[e && e.message] || 'Online ist gerade nicht erreichbar. Prüfe das Internet und versuche es nochmal.');
  let wake = null; function keepAwake() { try { if (navigator.wakeLock && !wake) navigator.wakeLock.request('screen').then(w => { wake = w; w.addEventListener('release', () => { wake = null; }); }).catch(() => { }); } catch (e) { } }

  /* ---------- Online: großer Bildschirm als Gastgeber (2 Plätze) ---------- */
  const H = { net: null, slots: [null, null], me: false };
  async function hostOpen() {
    H.slots = [null, null]; H.me = false; G.mode = 'online'; scr('sLobby'); lobbyRender(); $('code').textContent = '····'; $('url').textContent = 'Raum wird eröffnet …'; $('qr').textContent = '…'; S.music('menu');
    if (H.net) H.net.close(); H.net = mkNet({ onMsg: hostMsg, onLeave: peer => { H.slots.forEach(sl => { if (sl && sl.peer === peer) sl.on = false; }); lobbyRender(); } });
    try {
      const code = await H.net.host(); $('code').textContent = code; $('url').textContent = H.net.link(); keepAwake();
      H.net.loadQR().then(() => { const q = qrcode(0, 'M'); q.addData(H.net.link()); q.make(); $('qr').innerHTML = q.createSvgTag({ cellSize: 4, margin: 0, scalable: true }); }).catch(() => { $('qr').textContent = code; });
    } catch (e) { $('url').textContent = netErr(e); toast(netErr(e)); }
  }
  function hostClose() { if (H.net) { H.net.send({ t: 'bye' }); H.net.close(); } H.net = null; H.slots = [null, null]; }
  function hostLobby() { closeAllOv(); G.W = null; G.mode = 'online'; if (has3d) { SC.setWorld(null); } scr('sLobby'); lobbyRender(); S.music('menu'); H.slots.forEach(sl => slotSend(sl)); }
  function slotSend(sl) { if (!sl || !sl.peer || !H.net) return; const c = byId(sl.fid); H.net.sendTo(sl.peer, { t: 'wel', slot: H.slots.indexOf(sl), name: sl.name, fn: c.n, fg: c.gameN }); }
  function lobbyRender() {
    $('lobSlots').innerHTML = [0, 1].map(i => { const sl = H.slots[i]; if (!sl) return '<div class="slot' + (i ? ' s2' : '') + ' off"><img alt=""><span><b>Spieler ' + (i + 1) + '</b><small>wartet …</small></span></div>';
      const c = byId(sl.fid); return '<div class="slot' + (i ? ' s2' : '') + (sl.on === false ? ' off' : '') + '"><img src="' + por(c.id) + '" alt=""><span><b>' + esc(sl.name) + '</b><small>' + esc(c.n) + (sl.peer ? ' · 📱' : ' · hier') + (sl.on === false ? ' · getrennt' : '') + '</small></span></div>'; }).join('');
    const n = H.slots.filter(sl => sl && sl.on !== false).length;
    $('lobGo').disabled = n < 2; $('lobGo').textContent = n < 2 ? 'Warte auf 2 Spieler …' : '▶ Weiter';
    $('lobMe').textContent = '🎮 Hier spielen: ' + (H.me ? 'an' : 'aus');
    if (has3d && cur === 'sLobby') SC.setSelect([H.slots[0] ? byId(H.slots[0].fid) : null, H.slots[1] ? byId(H.slots[1].fid) : null]);
  }
  $('lobMe').onclick = () => { if (H.me) { const i = H.slots.findIndex(sl => sl && !sl.peer); if (i >= 0) H.slots[i] = null; H.me = false; } else { const i = H.slots.findIndex(sl => !sl); if (i < 0) return toast('Beide Plätze sind belegt.'); H.slots[i] = { name: 'Hier', fid: RO[0].id, on: true }; H.me = true; } lobbyRender(); };
  $('lobBack').onclick = () => { hostClose(); toMenu(); };
  $('lobGo').onclick = () => { if ($('lobGo').disabled) return; G.mode = 'online'; G.human = [true, true]; G.pick = H.slots.map(sl => RO.indexOf(byId(sl.fid))); H.slots.forEach(sl => { if (sl.peer && H.net) H.net.sendTo(sl.peer, { t: 'msg', m: 'Arena wird gewählt …' }); }); openStage(); };
  function hostMsg(peer, d) {
    let sl = H.slots.find(x => x && x.peer === peer);
    if (d.t === 'hi') {
      const old = d.cid && H.slots.find(x => x && x.cid === d.cid);
      if (old) { old.peer = peer; old.on = true; sl = old; }
      if (!sl) { const i = H.slots.findIndex(x => !x || x.on === false && x.peer); if (i < 0) { H.net.sendTo(peer, { t: 'msg', m: 'Beide Plätze sind schon belegt.' }); return; }
        const name = String(d.name || '').replace(/[<>]/g, '').trim().slice(0, 12) || 'Gast'; sl = H.slots[i] = { peer, cid: d.cid, name, fid: RO[(i * 5) % RO.length].id, on: true }; S.sfx('ok'); }
      NETIN[peer] = { x: 0, y: 0, bl: false, c: {}, l: {} }; slotSend(sl); lobbyRender(); return;
    }
    if (!sl) return;
    if (d.t === 'pick' && cur === 'sLobby') { let k = RO.findIndex(c => c.id === sl.fid); k = (k + (d.d > 0 ? 1 : -1) + RO.length) % RO.length; sl.fid = RO[k].id; slotSend(sl); lobbyRender(); }
    else if (d.t === 'in') { const n = NETIN[peer] || (NETIN[peer] = { c: {}, l: {} }); n.x = Math.max(-1, Math.min(1, +d.x || 0)); n.y = Math.max(-1, Math.min(1, +d.y || 0)); n.bl = !!d.bl; if (d.c && typeof d.c === 'object') for (const k of BTN) if (+d.c[k] > (n.c[k] || 0)) n.c[k] = +d.c[k]; }
  }
  function netEnd(win) { if (G.mode !== 'online' || !H.net) return; H.slots.forEach((sl, i) => { if (sl && sl.peer) H.net.sendTo(sl.peer, { t: 'msg', m: win === i ? '👑 Gewonnen!' : win < 0 ? 'Unentschieden!' : 'Verloren – Revanche?' }); }); }
  let netT = 0;
  function netTick(dt) { if (G.mode !== 'online' || !H.net || !G.W) return; netT -= dt; if (netT > 0) return; netT = .6; H.slots.forEach((sl, i) => { if (sl && sl.peer) { const F = G.W.f[i]; H.net.sendTo(sl.peer, { t: 'st', hp: Math.max(0, F.hp), rage: F.rage && !F.finale, round: G.M.round, wins: G.M.wins[i], target: G.M.target }); } }); }

  /* ---------- Handy als Controller ---------- */
  const C = { net: null, cid: LS.get(P + 'cid', '') || Math.random().toString(36).slice(2, 10), c: { b1: 0, b2: 0, b3: 0, b4: 0, s: 0, g: 0, f: 0 }, bl: false, lx: 9, ly: 9, lt: 0 };
  LS.set(P + 'cid', C.cid);
  function phoneOpen(code) { G.mode = 'phone'; scr('sPhone'); $('pJoin').hidden = false; $('pPad').hidden = true; $('jCode').value = code || ''; $('jName').value = LS.get(P + 'name', ''); }
  $('bJoin').onclick = async () => {
    const name = $('jName').value.trim() || 'Gast', code = $('jCode').value; LS.set(P + 'name', name); $('jMsg').textContent = 'Verbinde …'; $('bJoin').disabled = true;
    try {
      if (C.net) C.net.close();
      C.net = mkNet({ onMsg: (pe, d) => phoneMsg(d), onLeave: () => { $('pMsg').textContent = '📴 Verbindung getrennt – Seite neu laden zum erneuten Beitreten.'; } });
      await C.net.join(code); C.net.send({ t: 'hi', name, cid: C.cid }); $('jMsg').textContent = ''; $('pJoin').hidden = true; $('pPad').hidden = false; keepAwake(); S.unlock();
      try { if (document.documentElement.requestFullscreen && coarse()) document.documentElement.requestFullscreen().catch(() => { }); } catch (e) { }
    } catch (e) { $('jMsg').textContent = netErr(e); }
    $('bJoin').disabled = false;
  };
  $('jCode').addEventListener('keydown', e => { if (e.key === 'Enter') $('bJoin').click(); });
  function phoneMsg(d) {
    if (d.t === 'wel') { $('pName').textContent = d.name; $('pSlot').textContent = 'Spieler ' + (d.slot + 1); $('pSlot').classList.toggle('p2', d.slot === 1); $('pFighter').textContent = d.fn; $('pGame').textContent = d.fg; $('pPick').hidden = false; $('pMsg').textContent = 'Wähle deinen Kämpfer mit ◀ ▶'; }
    else if (d.t === 'st') { $('pPick').hidden = true; $('pMsg').textContent = 'Runde ' + d.round + ' · ' + '●'.repeat(d.wins) + '○'.repeat(Math.max(0, d.target - d.wins)) + ' · ❤️ ' + d.hp + (d.rage ? ' · 🔥 Finale bereit!' : ''); }
    else if (d.t === 'vib') vib(d.p);
    else if (d.t === 'msg') { $('pMsg').textContent = d.m; if (/Gewonnen|Verloren|Unentschieden/.test(d.m)) $('pPick').hidden = false; }
    else if (d.t === 'bye') $('pMsg').textContent = 'Der Gastgeber hat den Raum geschlossen.';
  }
  const PS = { x: 0, y: 0, id: null, ox: 0, oy: 0 };
  function phoneSend(force) { if (!C.net) return; const now = performance.now(); if (!force && PS.x === C.lx && PS.y === C.ly) return; if (!force && now - C.lt < 40) { clearTimeout(C.tm); C.tm = setTimeout(() => phoneSend(), 45); return; } C.lx = PS.x; C.ly = PS.y; C.lt = now; C.net.send({ t: 'in', x: PS.x, y: PS.y, bl: C.bl, c: C.c }); }
  (function () {
    const zone = $('pZone'), knob = $('pStick'), R = 50;
    zone.addEventListener('pointerdown', e => { PS.id = e.pointerId; try { zone.setPointerCapture(e.pointerId); } catch (x) { } PS.ox = e.clientX; PS.oy = e.clientY; knob.classList.add('on'); e.preventDefault(); });
    zone.addEventListener('pointermove', e => { if (e.pointerId !== PS.id) return; let dx = e.clientX - PS.ox, dy = e.clientY - PS.oy; const l = Math.hypot(dx, dy); if (l > R) { dx *= R / l; dy *= R / l; } PS.x = Math.abs(dx) > R * .15 ? Math.round(dx / R * 10) / 10 : 0; PS.y = Math.abs(dy) > R * .15 ? Math.round(dy / R * 10) / 10 : 0; knob.firstElementChild.style.transform = 'translate(' + dx + 'px,' + dy + 'px)'; phoneSend(); });
    const end = e => { if (e.pointerId !== PS.id) return; PS.id = null; PS.x = PS.y = 0; knob.firstElementChild.style.transform = ''; knob.classList.remove('on'); phoneSend(true); };
    zone.addEventListener('pointerup', end); zone.addEventListener('pointercancel', end); zone.addEventListener('lostpointercapture', end);
    document.querySelectorAll('.pBtns .tb').forEach(b => { const k = b.dataset.b;
      b.addEventListener('pointerdown', e => { e.preventDefault(); if (k === 'block') C.bl = true; else C.c[k]++; b.classList.add('hit'); vib(12); phoneSend(true); });
      const up = () => { if (k === 'block') { C.bl = false; phoneSend(true); } b.classList.remove('hit'); }; b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('pointerleave', up); });
  })();
  setInterval(() => { if (C.net && cur === 'sPhone') phoneSend(true); }, 1000);
  $('pPrev').onclick = () => { if (C.net) C.net.send({ t: 'pick', d: -1 }); }; $('pNext').onclick = () => { if (C.net) C.net.send({ t: 'pick', d: 1 }); };

  /* ---------- Schleife ---------- */
  let last = performance.now();
  function loop(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    pollPads(dt);
    let slowK = 1;
    if (playing() && G.W) {
      const W = G.W; slowK = W.slow > 0 ? .35 : 1;
      G.acc += dt * slowK;
      let n = 0;
      while (G.acc >= EC.DT && n < 4) {
        G.acc -= EC.DT; n++;
        const inp = [gather(0), G.human[1] ? gather(1) : G.train || W.ai_off ? {} : EC.ai(W, 1, G.mode === 'arcade' ? G.diffNow : SET.diff)];
        EC.step(W, inp); events();
        if (G.train) for (const F of W.f) { if (F.hp < EC.HP && (F.state === 'idle' || F.state === 'crouch' || F.state === 'walk') && F.combo === 0) F.hp = Math.min(EC.HP, F.hp + 4); if (F.hp < 30) F.hp = 30; }
        if (!G.W) break;
      }
      W.alpha = W.stop > 0 ? 1 : Math.min(1, G.acc / EC.DT); hud(); netTick(dt);
    } else clearEdges();
    if (has3d) SC.update(dt, slowK);
    requestAnimationFrame(loop);
  }

  /* ---------- Laden ---------- */
  const TIPS = ['Kämpfer wärmen sich auf …', 'Arenen werden gefegt …', 'Fäuste werden bandagiert …', 'Gleich geht’s los!'];
  const bar = p => { $('loadBar').style.width = Math.round(p * 100) + '%'; $('loadTip').textContent = TIPS[Math.min(TIPS.length - 1, Math.floor(p * TIPS.length))]; };
  const wait = ms => new Promise(r => setTimeout(r, ms));
  (async function boot() {
    const t0 = performance.now(); bar(.1); await wait(50);
    const jm = /[?#&]join=([A-Za-z0-9]{4})/.exec(location.search + location.hash);
    if (jm) { bar(1); await wait(250); $('sLoad').classList.remove('on'); requestAnimationFrame(loop); phoneOpen(jm[1].toUpperCase()); return; }
    try { if (!window.THREE) throw new Error('three'); SC.init($('stage'), { low: SET.low }); has3d = true; } catch (e) { has3d = false; console.warn('3D nicht verfügbar', e); }
    bar(.3);
    if (has3d) await new Promise(res => SC.portraits(RO, 160, out => { POR = out; res(); }));
    bar(.9); if (has3d) SC.setSelect([byId(LS.get(P + 'last', RO[0].id)), null]);
    requestAnimationFrame(loop); bar(1);
    await wait(Math.max(0, 1100 - (performance.now() - t0)));
    $('sLoad').classList.add('out'); setTimeout(() => { $('sLoad').classList.remove('on', 'out'); }, 460);
    if (!has3d) toast('Dieses Spiel braucht 3D-Grafik (WebGL).');
    if (padCount()) $('pressTxt').textContent = 'Drücke A';
    const q = new URLSearchParams(location.search);
    if (q.get('fight')) { S.unlock(); const [a, b] = q.get('fight').split(','); G.mode = q.get('mode') || 'cpu'; G.human = [true, G.mode === 'versus']; G.pick = [RO.indexOf(byId(a)), RO.indexOf(byId(b))]; startFight(byId(a), byId(b), +(q.get('stage') || 0)); }
    else if (q.has('tv') || (window.EasyGamesKit && EasyGamesKit.isTv && EasyGamesKit.isTv())) { S.unlock(); hostOpen(); }
    else scr('sTitle');
  })();
  window.ECApp = { G, H, hostOpen, startFight, openSelect, toMenu, get cur() { return cur; }, por: () => POR };
})();
