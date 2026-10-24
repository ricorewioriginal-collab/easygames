/* 2048 Deluxe – App: Ladebildschirm, Titel, Konsolen-Menü, Modi (Klassisch 3×3–6×6, Blitz, Tages-2048, Zen), Rückgängig und Hammer,
 * Sieg-/Game-over-Bildschirm, Rekorde (Rangliste über ../cloud/anmacha-cloud.js), Moderator Rico mit Sprechblasen.
 * Eingabe: Wischen (Touch/Maus), Tastatur, Gamecontroller (eigene Abfrage); Menüs mit Steuerkreuz/Pfeilen bedienbar.
 * Logik: js/core.js (D2048), 3D: js/scene.js (D2048Scene), Ton: js/sound.js (D2048Sound). */
(function () {
  'use strict';
  const $ = id => document.getElementById(id), P = 'deluxe-2048-';
  const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }, del(k) { try { localStorage.removeItem(k); } catch (e) { } } };
  const SET = Object.assign({ sound: true, music: true, vib: true, rico: true, low: false, size: 4 }, LS.get(P + 'settings', {}));
  const saveSet = () => LS.set(P + 'settings', SET);
  const S = window.D2048Sound, SC = window.D2048Scene;
  S.sfxOn = SET.sound; S.musicOn = SET.music;
  const fmt = n => Number(n || 0).toLocaleString('de-DE');
  let toastT = 0; function toast(m) { const t = $('toast'); t.textContent = m; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2200); }
  const vib = ms => { if (SET.vib && navigator.vibrate) try { navigator.vibrate(ms); } catch (e) { } };
  const coarse = () => matchMedia('(pointer: coarse)').matches;
  const pickOne = a => a[Math.floor(Math.random() * a.length)];
  let has3d = false;

  /* ---------- Rico: Sprüche ---------- */
  const LINES = {
    hello: ['Hey, ich bin Rico – willkommen in der Show! 💜', 'Auf Sendung! Zeig mal, was du drauf hast 😜', 'Schieb gleiche Zahlen zusammen – ich moderier das! 💜'],
    menu: ['Na, Lust auf eine Runde? 💜', 'Ich hab das Mikro schon an 😜', 'Heute knacken wir die 2048!', 'Probier mal Blitz – drei Minuten Vollgas ⚡'],
    64: ['Nice, 64!', 'Läuft bei dir 😜'], 128: ['128 – jetzt wird’s spannend!', 'Hundertachtundzwanzig! 💜'], 256: ['256! Das ist Radio-Gold 😜', 'Boah, 256!'],
    512: ['512 – Gänsehaut im Studio! 💜', 'Halbe Miete zur 1024!'], 1024: ['1024!!! Ich krieg mich nicht mehr ein 😜', 'Einmal noch verdoppeln, dann bist du on air!'],
    2048: ['2048!!! DU BIST DER HAMMER 💜😜'], huge: ['Was?! Legendär! 😱💜', 'Das hab ich in meiner Show noch nie gesehen!'],
    combo: ['Kombo! 🔥', 'Dreifach-Schlag! 😜', 'Was für ein Zug!'],
    danger: ['Uff, wird eng hier …', 'Ruhig bleiben – Ecken nutzen!', 'Tipp: größte Zahl in die Ecke 😉'],
    undo: ['Zurückspulen – wie im Radio 😜', 'Nochmal, kein Ding!'], hammer: ['Hammerzeit! 🔨', 'Weg damit! 😜'],
    idle: ['Na, überlegst du noch? 😜', 'Ich hör dich denken …', 'Kleiner Tipp: nicht wild rumschieben 😉'],
    over: ['Nicht schlimm – gleich nochmal? 💜', 'Starke Show! Nächste Runde?', 'Das war knapp! Nochmal? 😜'],
    record: ['Neuer Rekord!!! 💜😜', 'REKORD! Das geht raus an alle Hörer! 💜'],
    time: ['Noch 30 Sekunden – Gas geben! ⚡'], timeup: ['Zeit um! Was für ein Sprint ⚡💜'],
    joker: ['Joker verdient! 💜']
  };
  const B = { el: $('bubble'), t: 0, prio: 0, cool: 0 };
  function say(key, prio, dur, text) {
    prio = prio || 1; if (B.t > 0 && prio < B.prio) return; if (prio < 2 && B.cool > 0) return;
    const line = text || pickOne(LINES[key] || [key]); dur = dur || Math.min(4.2, 1.6 + line.length * .045);
    if (has3d) SC.rico.talk(Math.min(2.2, dur * .6));
    if (!SET.rico) return;
    B.el.textContent = line; B.el.hidden = false; B.el.style.animation = 'none'; void B.el.offsetWidth; B.el.style.animation = '';
    B.t = dur; B.prio = prio; B.cool = 2.2; placeBubble();
  }
  function placeBubble() {
    if (B.el.hidden || !has3d) return; const p = SC.bubblePos(), w = B.el.offsetWidth, h = B.el.offsetHeight, hud = cur === 'sGame' ? $('hud').getBoundingClientRect().bottom + 6 : cur === 'sTitle' ? document.querySelector('.titleBox').getBoundingClientRect().bottom + 12 : 8;
    const x = Math.max(w / 2 + 8, Math.min(innerWidth - w / 2 - 8, p.x)), y = Math.max(hud + h, Math.min(innerHeight - 90, p.y));
    B.el.style.left = x + 'px'; B.el.style.top = y + 'px';
  }
  const rico = (st, d) => { if (has3d) SC.rico.set(st, d); };

  /* ---------- Bildschirme und Menü-Navigation ---------- */
  let cur = 'sLoad';
  const BACK = { sMenu: () => scr('sTitle') };
  function scr(id) { document.querySelectorAll('.scr').forEach(s => s.classList.toggle('on', s.id === id)); cur = id; setTimeout(() => { focusFirst(); frame(); }, 0); }
  const overlays = () => Array.from(document.querySelectorAll('.ov')).filter(o => !o.hidden);
  const root = () => overlays().pop() || $(cur);
  const navEls = () => Array.from(root().querySelectorAll('.nav, .chip')).filter(e => !e.disabled && e.offsetParent !== null);
  function focusFirst() { const els = navEls(), r = root(); const el = r.querySelector('.chip.on') || els.find(e => e.classList.contains('pri') || e.classList.contains('hero')) || els[0]; if (el && !coarse() && (cur !== 'sGame' || overlays().length)) try { el.focus({ preventScroll: true }); } catch (e) { } }
  function openOv(id) { $(id).hidden = false; setTimeout(focusFirst, 0); }
  function closeOv(id) { $(id).hidden = true; setTimeout(focusFirst, 0); }
  function moveFocus(dx, dy) {
    const els = navEls(); if (!els.length) return; const a = document.activeElement;
    if (!els.includes(a)) { els[0].focus(); S.sfx('move'); return; }
    const r = a.getBoundingClientRect(), ax = r.left + r.width / 2, ay = r.top + r.height / 2; let best = null, bd = 1e9;
    for (const e of els) { if (e === a) continue; const q = e.getBoundingClientRect(), x = q.left + q.width / 2 - ax, y = q.top + q.height / 2 - ay, along = x * dx + y * dy; if (along <= 4) continue; const side = Math.abs(x * dy) + Math.abs(y * dx), d = along + side * 2.2; if (d < bd) { bd = d; best = e; } }
    if (best) { best.focus(); S.sfx('move'); }
  }
  function back() {
    const ov = overlays().pop();
    if (ov) { S.sfx('back'); if (ov.id === 'ovPause') return resume(); const x = ov.querySelector('[data-close]'); if (x) return x.click(); if (ov.id === 'ovWin') return $('wGo').click(); if (ov.id === 'ovEnd') return $('eMenu').click(); return closeOv(ov.id); }
    if (cur === 'sGame') { if (G.armed) return disarm(); return pause(); }
    if (BACK[cur]) { S.sfx('back'); BACK[cur](); }
  }
  // Freie Fläche für Brett und Rico je nach Bildschirm
  function frame() {
    if (!has3d) return; const W = innerWidth, H = innerHeight;
    if (cur === 'sGame') { const hb = $('hud').getBoundingClientRect().bottom, tt = $('tools').getBoundingClientRect(); SC.setMargins(hb + (W / H < 1.12 ? 54 : 12), H - tt.top + 8, 6, 6); }
    else if (cur === 'sMenu') { const m = document.querySelector('.menuWrap').getBoundingClientRect(); if (W > 760 && W / H > 1) SC.setMargins(20, 20, 10, W - m.left + 10); else SC.setMargins(64, H - m.top + 6, 6, 6); }
    else if (cur === 'sTitle') { const b = document.querySelector('.titleBox').getBoundingClientRect(); SC.setMargins(Math.min(H * .6, b.bottom + 6), 50, 10, 10); }
    else SC.setMargins(20, 20, 10, 10);
    placeBubble();
  }
  addEventListener('resize', () => setTimeout(frame, 30));

  // Ersatz ohne WebGL: einfaches Raster aus HTML
  let FL = null;
  function flat() {
    if (!G.g) return; if (!FL) { FL = document.createElement('div'); FL.className = 'flat'; $('stage').appendChild(FL); }
    const n = G.g.n; FL.style.setProperty('--n', n);
    FL.innerHTML = G.g.cells.map((c, i) => '<i class="' + (c ? 'v' + Math.min(4096, c.v) : '') + (G.armed && i === G.cur ? ' cur' : '') + '">' + (c ? c.v : '') + '</i>').join('');
  }
  function pickFlat(x, y) { if (!FL) return -1; const r = FL.getBoundingClientRect(), n = G.g.n, cx = Math.floor((x - r.left) / r.width * n), cy = Math.floor((y - r.top) / r.height * n); return cx >= 0 && cy >= 0 && cx < n && cy < n ? cy * n + cx : -1; }

  /* ---------- Spielzustand ---------- */
  const MODES = {
    classic: { n: 'Klassisch', undo: 2, hammer: 1, rank: true, save: true },
    blitz: { n: 'Blitz', undo: 1, hammer: 0, rank: true, time: 180 },
    daily: { n: 'Tages-2048', undo: 2, hammer: 1, rank: true },
    zen: { n: 'Zen', inf: true, save: true }
  };
  const G = { mode: 'attract', g: null, undo: 0, hammer: 0, armed: false, cur: -1, time: 0, ended: false, counted: false, seen: {}, idle: 0, demoT: 0, size: 4, daily: null, danger: 0 };
  const M = () => MODES[G.mode] || {};
  const playing = () => cur === 'sGame' && !overlays().length && G.g && !G.ended;
  function demo() { G.mode = 'attract'; G.g = D2048.newGame(4); for (let k = 0; k < 40; k++) D2048.move(G.g, pickOne(['down', 'left', 'down', 'right'])); G.g.over = false; G.g.hist = []; if (has3d) SC.setGame(G.g); }
  function start(mode, size, resume) {
    disarm(); closeAllOv();
    G.mode = mode; G.ended = false; G.counted = false; G.seen = {}; G.idle = 0; G.danger = 0; const m = M();
    if (resume) { const sv = LS.get(P + 'save', null), g = sv && D2048.load(sv.game); if (!g) return toast('Kein Spielstand gefunden'); G.g = g; G.undo = sv.undo; G.hammer = sv.hammer; G.mode = mode = sv.mode; G.size = g.n; }
    else {
      G.size = mode === 'blitz' || mode === 'daily' ? 4 : size || SET.size;
      if (mode === 'daily') { G.daily = D2048.daily(); G.g = D2048.newGame(4, G.daily.seed); } else G.g = D2048.newGame(G.size);
      G.undo = m.undo || 0; G.hammer = m.hammer || 0;
    }
    G.time = (MODES[mode].time || 0); D2048.maxTile(G.g) >= 2048 && (G.g.keep = true);
    for (const c of G.g.cells) if (c) G.seen[c.v] = 1;
    if (has3d) SC.setGame(G.g);
    scr('sGame'); hud(); S.music('game'); S.sfx('ok');
    $('hMode').textContent = MODES[mode].n + (mode === 'classic' || mode === 'zen' ? ' · ' + G.size + '×' + G.size : '');
    $('hTimeBox').hidden = !MODES[mode].time;
    $('hBestL').textContent = mode === 'zen' ? 'Größte' : 'Rekord';
    rico('thumbs', 1.4); setTimeout(() => say(resume ? 'Weiter geht’s – ich hab alles aufgehoben 💜' : 'hello', 2), 350);
    persist();
  }
  function persist() {
    if (!M().save || !G.g) return;
    if (G.g.over) { LS.del(P + 'save'); return; }
    LS.set(P + 'save', { mode: G.mode, game: D2048.save(G.g), undo: G.undo, hammer: G.hammer, t: Date.now() });
  }
  const hs = () => LS.get(P + 'highscore', 0);
  function hud() {
    const g = G.g, m = M(); if (!g) return;
    $('hScore').textContent = fmt(g.score);
    $('hBest').textContent = G.mode === 'zen' ? fmt(D2048.maxTile(g)) : fmt(Math.max(hs(), m.rank ? g.score : 0));
    $('nUndo').textContent = m.inf ? '∞' : G.undo; $('nHammer').textContent = m.inf ? '∞' : G.hammer;
    $('bUndo').disabled = !(m.inf || G.undo > 0) || !g.hist.length; $('bHammer').disabled = !(m.inf || G.hammer > 0);
    $('bHammer').classList.toggle('armed', G.armed);
    if (!has3d) flat();
    if (m.time) { const s = Math.max(0, Math.ceil(G.time)); $('hTime').textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); $('hTimeBox').classList.toggle('low', s <= 30); }
  }
  function gainFx(n) { const e = $('hGain'); e.textContent = '+' + fmt(n); e.classList.remove('go'); void e.offsetWidth; e.classList.add('go'); }

  function doMove(dir) {
    if (!playing()) return;
    if (G.armed) { moveCursor(dir); return; }
    const r = D2048.move(G.g, dir); G.idle = 0;
    if (!r) { if (has3d) SC.bump(); S.sfx('bump'); vib(8); return; }
    if (has3d) { SC.apply(r); SC.tilt(dir); }
    S.sfx('slide'); if (r.spawn) setTimeout(() => S.sfx('spawn'), 130);
    let top = 0; for (const mg of r.merges) top = Math.max(top, mg.v);
    if (top) { S.sfx('merge', top); if (top >= 128) setTimeout(() => S.sfx('big'), 60); vib(top >= 256 ? 25 : 10); gainFx(r.gain); }
    // Joker verdienen
    if (!M().inf) for (const mg of r.merges) {
      if (mg.v === 256 || mg.v === 2048) { if (G.undo < 5) { G.undo++; toast('↶ +1 Rückgängig'); } }
      if ((mg.v === 1024 || mg.v === 2048) && MODES[G.mode].hammer !== 0) { if (G.hammer < 3) { G.hammer++; toast('🔨 +1 Hammer'); } }
    }
    // Rico reagiert
    const first = top && !G.seen[top]; for (const mg of r.merges) G.seen[mg.v] = 1;
    if (top >= 4096 && first) { rico('wow', 2.2); say('huge', 3); }
    else if (top >= 2048 && first) { /* Siegbildschirm übernimmt */ }
    else if (top >= 1024 && first) { rico('wow', 2); say('1024', 3); if (has3d) SC.confetti(30); }
    else if (top >= 512 && first) { rico('cheer', 1.6); say('512', 2); }
    else if (top >= 256 && first) { rico('cheer', 1.3); say('256', 2); }
    else if (top >= 128 && first) { rico('point', 1.2); say('128', 1); }
    else if (top >= 64 && first) { rico('thumbs', 1); say('64', 1); }
    else if (r.merges.length >= 3) { rico('cheer', .9); say('combo', 1); S.sfx('combo'); }
    const free = G.g.cells.filter(c => !c).length;
    if (free <= (G.g.n <= 3 ? 1 : 2) && !r.over) { G.danger++; if (G.danger === 1 || G.danger % 8 === 0) { rico('think', 1.5); say('danger', 1); S.sfx('warn'); } } else G.danger = 0;
    hud(); persist();
    if (r.won && !G.g.keep) setTimeout(win, 380);
    else if (r.over) setTimeout(() => endGame('over'), 650);
  }
  function undo() {
    if (!G.g || G.ended) return; const m = M();
    if (!(m.inf || G.undo > 0)) { toast('Kein Rückgängig mehr – neue gibt’s für jede 256'); return; }
    if (!D2048.undo(G.g)) return; if (!m.inf) G.undo--;
    disarm(); if (has3d) SC.setGame(G.g); S.sfx('undo'); rico('point', .8); say('undo', 1); hud(); persist();
  }
  /* Hammer: Kachel wählen (Tippen oder Steuerkreuz + A/Enter) */
  function arm() {
    if (!playing()) return; const m = M();
    if (G.armed) return disarm();
    if (!(m.inf || G.hammer > 0)) { toast(MODES[G.mode].hammer === 0 ? 'Im Blitz gibt’s keinen Hammer' : 'Kein Hammer mehr – einen gibt’s für jede 1024'); return; }
    G.armed = true; let i = 0, mv = 1e9; G.g.cells.forEach((c, k) => { if (c && c.v < mv) { mv = c.v; i = k; } }); G.cur = i;
    if (has3d) SC.cursor(coarse() ? -1 : i); $('hammerHint').hidden = false; $('hammerHint').firstChild.textContent = coarse() ? '🔨 Tippe die Kachel an, die weg soll · ' : '🔨 Kachel wählen, dann Enter/A · ';
    S.sfx('ok'); hud();
  }
  function disarm() { G.armed = false; if (has3d) SC.cursor(-1); $('hammerHint').hidden = true; hud(); }
  function moveCursor(dir) { const n = G.g.n, d = D2048.DIRS[dir]; let x = G.cur % n + d[0], y = ((G.cur / n) | 0) + d[1]; x = Math.max(0, Math.min(n - 1, x)); y = Math.max(0, Math.min(n - 1, y)); G.cur = y * n + x; if (has3d) SC.cursor(G.cur); else flat(); S.sfx('move'); }
  function smashAt(i) {
    if (!G.armed || i < 0) return; const r = D2048.smash(G.g, i);
    if (!r) { toast(G.g.cells[i] ? 'Die letzte Kachel bleibt!' : 'Da liegt keine Kachel'); return; }
    if (!M().inf) G.hammer--; if (has3d) SC.smash(r); S.sfx('smash'); vib(40); rico('cheer', 1); say('hammer', 1);
    disarm(); persist();
  }
  $('bUndo').onclick = () => undo(); $('bHammer').onclick = () => arm(); $('bHammerX').onclick = e => { e.stopPropagation(); disarm(); };

  function win() {
    G.g.keep = true; persist(); S.sfx('win'); rico('dance', 0); say('2048', 3, 4); if (has3d) SC.confetti(80);
    LS.set(P + 'stats', Object.assign(stats(), { wins: stats().wins + 1 }));
    $('wInfo').textContent = 'Nach ' + fmt(G.g.moves) + ' Zügen mit ' + fmt(G.g.score) + ' Punkten. Weiterspielen geht – wie weit schaffst du es?';
    openOv('ovWin');
  }
  $('wGo').onclick = () => { closeOv('ovWin'); rico('idle'); say('Weiter geht’s – auf zur 4096! 😜', 2); };
  $('wNew').onclick = () => { closeOv('ovWin'); start(G.mode, G.size); };
  $('wMenu').onclick = () => { closeOv('ovWin'); toMenu(); };

  function stats() { return Object.assign({ games: 0, wins: 0, maxTile: 0, merges: 0, blitz: 0, bySize: {}, moves: 0 }, LS.get(P + 'stats', {})); }
  function endGame(reason) {
    if (G.ended) return; G.ended = true; disarm();
    const g = G.g, m = M(), st = stats(), top = D2048.maxTile(g); let rec = false;
    if (!G.counted) { G.counted = true; st.games++; st.moves += g.moves; }
    st.maxTile = Math.max(st.maxTile, top);
    if (m.rank && g.score > hs()) { LS.set(P + 'highscore', g.score); rec = g.score > 0; }
    if (G.mode === 'classic') st.bySize[g.n] = Math.max(st.bySize[g.n] || 0, g.score);
    if (G.mode === 'blitz') st.blitz = Math.max(st.blitz, g.score);
    if (G.mode === 'daily') { const d = LS.get(P + 'daily', {}); if (d.key !== G.daily.key) { d.key = G.daily.key; d.best = 0; d.plays = 0; } d.plays++; d.best = Math.max(d.best, g.score); d.top = Math.max(d.top || 0, top); LS.set(P + 'daily', d); }
    LS.set(P + 'stats', st); if (m.save) LS.del(P + 'save');
    $('eKick').textContent = MODES[G.mode].n + (G.mode === 'daily' ? ' · ' + G.daily.key.split('-').reverse().join('.') : '');
    $('eTitle').textContent = reason === 'time' ? '⏱ Zeit um!' : top >= 2048 ? 'Was für eine Show! 💜' : 'Keine Züge mehr';
    $('eScore').textContent = fmt(g.score); $('eRec').hidden = !rec;
    const c = (k, v) => '<div><small>' + k + '</small><b>' + v + '</b></div>';
    $('eStats').innerHTML = c('Größte Kachel', fmt(top)) + c('Züge', fmt(g.moves)) + c(G.mode === 'zen' ? 'Brett' : 'Rekord', G.mode === 'zen' ? g.n + '×' + g.n : fmt(hs())) + c('Brett', g.n + '×' + g.n);
    $('eUndo').hidden = !(reason === 'over' && (m.inf || G.undo > 0) && g.hist.length);
    $('eShare').hidden = G.mode !== 'daily' && G.mode !== 'blitz';
    S.sfx(rec ? 'win' : 'lose'); S.music('menu');
    if (rec) { rico('dance', 0); say('record', 3); if (has3d) SC.confetti(60); } else { rico('sad', 0); say(reason === 'time' ? 'timeup' : 'over', 3); }
    openOv('ovEnd');
  }
  $('eAgain').onclick = () => { closeOv('ovEnd'); start(G.mode, G.size); };
  $('eUndo').onclick = () => { closeOv('ovEnd'); G.ended = false; S.music('game'); undo(); rico('idle'); };
  $('eMenu').onclick = () => { closeOv('ovEnd'); toMenu(); };
  function shareText() {
    const g = G.g, link = window.EasyGamesDevice ? EasyGamesDevice.gameLink('deluxe-2048/') : 'https://ricorewioriginal-collab.github.io/easygames/deluxe-2048/';
    const what = G.mode === 'daily' ? 'Tages-2048 vom ' + G.daily.key.split('-').reverse().join('.') : 'Blitz (3 Minuten)';
    return '🟪 2048 Deluxe – ' + what + ': ' + fmt(g.score) + ' Punkte, größte Kachel ' + fmt(D2048.maxTile(g)) + ' 💜 Schaffst du mehr? ' + link;
  }
  $('eShare').onclick = async () => { const text = shareText(); try { if (navigator.share && coarse()) { await navigator.share({ text }); return; } } catch (e) { return; } try { await navigator.clipboard.writeText(text); toast('📋 Kopiert – einfach einfügen!'); } catch (e) { toast(text); } };

  function pause() { if (!playing()) return; openOv('ovPause'); S.music('menu'); }
  function resume() { closeOv('ovPause'); S.music('game'); }
  $('bPause').onclick = () => pause(); $('pGo').onclick = () => resume();
  $('pRestart').onclick = () => { closeOv('ovPause'); start(G.mode, G.size); };
  $('pOpts').onclick = () => openOv('ovOpts'); $('pHelp').onclick = () => openOv('ovHelp');
  $('pQuit').onclick = () => { closeOv('ovPause'); persist(); toMenu(); };
  function closeAllOv() { document.querySelectorAll('.ov').forEach(o => { o.hidden = true; }); }

  /* ---------- Menü ---------- */
  function toMenu() {
    disarm(); closeAllOv(); if (G.mode !== 'attract') demo(); rico('idle');
    const sv = LS.get(P + 'save', null), g = sv && D2048.load(sv.game);
    $('tCont').hidden = !g; if (g) $('contInfo').textContent = MODES[sv.mode].n + ' ' + g.n + '×' + g.n + ' · ' + fmt(g.score) + ' Punkte';
    const d = LS.get(P + 'daily', {}), today = D2048.daily().key; $('dailyInfo').textContent = d.key === today && d.plays ? 'Heute: ' + fmt(d.best) + ' Punkte' : 'Gleiches Spiel für alle';
    const st = stats(); $('menuStat').textContent = '🏆 ' + fmt(hs()) + (st.maxTile ? ' · größte Kachel ' + fmt(st.maxTile) : '');
    $('menuKeys').textContent = navigator.getGamepads && Array.from(navigator.getGamepads() || []).some(Boolean) ? '🎮 Steuerkreuz wählen · A bestätigen · B zurück' : '⌨️ Pfeile wählen · Enter bestätigen · Esc zurück';
    scr('sMenu'); S.music('menu');
  }
  let sizePick = SET.size, sizeMode = 'classic';
  function openSize(mode) {
    sizeMode = mode; $('szTitle').textContent = (mode === 'zen' ? '🧘 Zen' : '🎯 Klassisch') + ' – Brettgröße';
    const info = { 3: 'Knifflig: wenig Platz, jeder Zug zählt.', 4: 'Das Original.', 5: 'Mehr Luft – große Zahlen möglich.', 6: 'Riesig: für lange Sessions.' }, st = stats();
    $('szChips').innerHTML = [3, 4, 5, 6].map(n => '<button class="chip' + (n === sizePick ? ' on' : '') + '" data-n="' + n + '">' + n + '×' + n + '<small>' + (mode === 'classic' && st.bySize[n] ? '🏆 ' + fmt(st.bySize[n]) : n === 4 ? 'Original' : '&nbsp;') + '</small></button>').join('');
    const upd = () => { $('szInfo').textContent = info[sizePick]; $('szChips').querySelectorAll('.chip').forEach(c => c.classList.toggle('on', +c.dataset.n === sizePick)); };
    $('szChips').querySelectorAll('.chip').forEach(c => { c.onclick = () => { if (+c.dataset.n === sizePick && document.body.classList.contains('kbd')) return $('szGo').click(); sizePick = +c.dataset.n; S.sfx('move'); upd(); }; });
    upd(); openOv('ovSize');
  }
  $('szGo').onclick = () => { SET.size = sizePick; saveSet(); const sv = LS.get(P + 'save', null); closeOv('ovSize'); if (sv && sv.mode === sizeMode) LS.del(P + 'save'); start(sizeMode, sizePick); };
  $('szBack').onclick = () => closeOv('ovSize');
  document.querySelectorAll('#tiles .tile').forEach(t => t.onclick = () => {
    S.unlock(); S.sfx('ok'); const k = t.dataset.go;
    if (k === 'cont') start(null, 0, true);
    else if (k === 'classic' || k === 'zen') openSize(k);
    else if (k === 'blitz' || k === 'daily') start(k);
    else if (k === 'rec') { showRec(); openOv('ovRec'); }
    else if (k === 'opts') openOv('ovOpts');
    else if (k === 'help') openOv('ovHelp');
  });
  function showRec() {
    const st = stats(), d = LS.get(P + 'daily', {}), today = D2048.daily().key, c = (k, v) => '<div><small>' + k + '</small><b>' + v + '</b></div>';
    $('recList').innerHTML = c('🏆 Rekord', fmt(hs())) + c('Größte Kachel', st.maxTile ? fmt(st.maxTile) : '–') + c('⚡ Blitz', st.blitz ? fmt(st.blitz) : '–') + c('📅 Heute', d.key === today && d.plays ? fmt(d.best) : '–') +
      [3, 4, 5, 6].map(n => c('🎯 ' + n + '×' + n, st.bySize[n] ? fmt(st.bySize[n]) : '–')).join('') + c('2048 geschafft', st.wins + '×') + c('Spiele', fmt(st.games));
  }
  $('recX').onclick = () => closeOv('ovRec'); $('helpX').onclick = () => closeOv('ovHelp');
  // Optionen
  const OPT = { sSound: 'sound', sMusic: 'music', sVib: 'vib', sRico: 'rico', sLow: 'low' };
  for (const id in OPT) { const el = $(id); el.checked = !!SET[OPT[id]]; el.onchange = () => { SET[OPT[id]] = el.checked; saveSet(); S.sfxOn = SET.sound; S.musicOn = SET.music; if (SET.music) S.music(cur === 'sGame' ? 'game' : 'menu'); if (!SET.rico) B.el.hidden = true; if (id === 'sLow') toast('Gilt nach dem Neuladen'); }; }
  $('optX').onclick = () => closeOv('ovOpts');
  function pressStart() { if (cur !== 'sTitle') return; S.unlock(); S.sfx('ok'); toMenu(); setTimeout(() => say('menu', 1), 600); }
  $('bPress').onclick = pressStart;
  $('sTitle').addEventListener('pointerdown', e => { if (e.target.closest('a')) return; e.preventDefault(); pressStart(); });

  /* ---------- Eingabe ---------- */
  const KDIR = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', KeyW: 'up', KeyS: 'down', KeyA: 'left', KeyD: 'right' };
  addEventListener('keydown', e => {
    document.body.classList.add('kbd'); const c = e.code;
    if (c === 'Escape' || (c === 'KeyP' && cur === 'sGame' && !overlays().length)) { e.preventDefault(); back(); return; }
    if (cur === 'sGame' && !overlays().length) {
      if (KDIR[c]) { e.preventDefault(); if (!e.repeat || G.armed) doMove(KDIR[c]); return; }
      if (e.repeat) return;
      if (c === 'KeyU' || c === 'KeyZ' || c === 'Backspace') { e.preventDefault(); undo(); return; }
      if (c === 'KeyH') { arm(); return; }
      if (G.armed && (c === 'Enter' || c === 'Space' || c === 'NumpadEnter')) { e.preventDefault(); smashAt(G.cur); return; }
      return;
    }
    if (cur === 'sTitle' && !overlays().length && !e.repeat) { e.preventDefault(); pressStart(); return; }
    const dir = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[c];
    if (dir) { e.preventDefault(); moveFocus(dir[0], dir[1]); }
  });
  addEventListener('pointerdown', () => document.body.classList.remove('kbd'), true);
  // Wischen (Touch und Maus) – Zug sofort, sobald die Schwelle erreicht ist
  const SW = { id: null, x: 0, y: 0, done: false };
  const sw = $('swipe');
  sw.addEventListener('pointerdown', e => { SW.id = e.pointerId; SW.x = e.clientX; SW.y = e.clientY; SW.done = false; try { sw.setPointerCapture(e.pointerId); } catch (x) { } e.preventDefault(); });
  sw.addEventListener('pointermove', e => {
    if (e.pointerId !== SW.id || SW.done || G.armed) return; const dx = e.clientX - SW.x, dy = e.clientY - SW.y, th = Math.max(22, Math.min(innerWidth, innerHeight) * .045);
    if (Math.hypot(dx, dy) < th) return; SW.done = true; doMove(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
  });
  const swEnd = e => { if (e.pointerId !== SW.id) return; if (!SW.done && G.armed && e.type === 'pointerup') smashAt(has3d ? SC.pick(e.clientX, e.clientY) : pickFlat(e.clientX, e.clientY)); SW.id = null; };
  sw.addEventListener('pointerup', swEnd); sw.addEventListener('pointercancel', swEnd);
  // Gamecontroller
  const PAD = { b: [], dir: null }; let padNavT = 0;
  function pollPads(dt) {
    let list = []; try { list = navigator.getGamepads ? Array.from(navigator.getGamepads()) : []; } catch (e) { }
    const g = list.find(p => p && p.connected); if (!g) return;
    const ax = g.axes || [], bt = g.buttons || [], pr = k => !!(bt[k] && (bt[k].pressed || bt[k].value > .5));
    let x = Math.abs(ax[0]) > .5 ? Math.sign(ax[0]) : 0, z = Math.abs(ax[1]) > .5 ? Math.sign(ax[1]) : 0;
    if (pr(14)) x = -1; if (pr(15)) x = 1; if (pr(12)) z = -1; if (pr(13)) z = 1;
    const now = []; for (let k = 0; k < 17; k++) now[k] = pr(k); const down = k => now[k] && !PAD.b[k];
    const dir = Math.abs(x) >= Math.abs(z) ? (x ? (x > 0 ? 'right' : 'left') : null) : (z > 0 ? 'down' : 'up');
    if (cur === 'sGame' && !overlays().length) {
      if (dir && dir !== PAD.dir) doMove(dir);
      if (down(0) && G.armed) smashAt(G.cur);
      if (down(2)) undo(); if (down(3) || down(5)) arm(); if (down(4)) undo();
      if (down(1)) back(); if (down(9)) pause();
    } else {
      document.body.classList.add('kbd');
      if (dir && (dir !== PAD.dir || padNavT <= 0)) { const d = D2048.DIRS[dir]; moveFocus(d[0], d[1]); padNavT = dir !== PAD.dir ? .35 : .14; }
      if (down(0)) { if (cur === 'sTitle' && !overlays().length) pressStart(); else { const a = document.activeElement; if (a && a !== document.body && a.click) { a.click(); } else focusFirst(); } }
      if (down(1)) back();
      if (down(9)) { if (cur === 'sTitle') pressStart(); else if (overlays().some(o => o.id === 'ovPause')) resume(); }
    }
    PAD.dir = dir; PAD.b = now; padNavT -= dt;
  }
  addEventListener('gamepadconnected', () => { toast('🎮 Controller verbunden'); $('pressTxt').textContent = 'Drücke A'; });

  /* ---------- Schleife ---------- */
  let last = performance.now();
  function loop(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    pollPads(dt);
    if (playing()) {
      G.idle += dt; if (G.idle > 25) { G.idle = -20; rico('think', 1.6); say('idle', 1); }
      if (M().time) { const before = G.time; G.time -= dt; if (before > 30 && G.time <= 30) { say('time', 2); S.sfx('warn'); } if (G.time <= 10 && Math.ceil(G.time) !== Math.ceil(before)) S.sfx('tick'); hud(); if (G.time <= 0) { G.time = 0; hud(); endGame('time'); } }
    } else if (G.mode === 'attract' && (cur === 'sMenu' || cur === 'sTitle') && has3d && G.g) {
      G.demoT -= dt; if (G.demoT <= 0) { G.demoT = .9; const r = D2048.move(G.g, pickOne(['down', 'left', 'down', 'right', 'left'])) || D2048.move(G.g, 'up'); if (r) { SC.apply(r); SC.tilt(r.moves.length ? 'down' : 'up'); } if (!r || G.g.over || G.g.cells.filter(Boolean).length > 13) demo(); }
      if (Math.random() < dt / 14 && cur === 'sMenu' && !overlays().length) say('menu', 1);
    }
    if (B.t > 0) { B.t -= dt; if (B.t <= 0) { B.el.hidden = true; B.prio = 0; } else placeBubble(); } B.cool -= dt;
    if (has3d) SC.update(dt);
    requestAnimationFrame(loop);
  }

  /* ---------- Laden ---------- */
  const TIPS = ['Rico stimmt das Mikro ein …', 'Kacheln werden poliert …', 'Studio-Licht an …', 'On Air in 3 … 2 … 1 …'];
  const bar = p => { $('loadBar').style.width = Math.round(p * 100) + '%'; $('loadTip').textContent = TIPS[Math.min(TIPS.length - 1, Math.floor(p * TIPS.length))]; };
  const wait = ms => new Promise(r => setTimeout(r, ms));
  (async function boot() {
    const t0 = performance.now(); bar(.15); await wait(60);
    try { if (!window.THREE) throw new Error('three'); SC.init($('stage'), { low: SET.low }); has3d = true; } catch (e) { has3d = false; console.warn('3D nicht verfügbar', e); }
    bar(.55); await wait(40); demo(); bar(.85);
    requestAnimationFrame(loop); bar(1);
    await wait(Math.max(0, 1200 - (performance.now() - t0)));
    $('sLoad').classList.add('out'); setTimeout(() => { $('sLoad').classList.remove('on', 'out'); }, 460);
    if (!has3d) toast('3D wird hier nicht unterstützt – gespielt wird trotzdem!');
    if (navigator.getGamepads && Array.from(navigator.getGamepads() || []).some(Boolean)) $('pressTxt').textContent = 'Drücke A';
    const q = new URLSearchParams(location.search);
    if (q.get('mode') && MODES[q.get('mode')]) { S.unlock(); start(q.get('mode'), +q.get('size') || 4); }
    else { scr('sTitle'); setTimeout(() => say('hello', 1), 900); }
  })();
  window.D2048App = { G, start, doMove, undo, arm, smashAt, endGame, toMenu, get cur() { return cur; } };
})();
