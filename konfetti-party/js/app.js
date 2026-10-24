/* Konfetti-Party – Ablauf: Laden, Titel, Konsolen-Menü, Turnier (5 Arenen mit Pokalen), Schnelle Party, Runden mit
 * Countdown, HUD (Gäste-Chips mit Siegen, Uhr, eigene Extras), Siegerehrung (Game Over), Pause, Einstellungen, Anleitung.
 * Mehrspieler: Fernseher = Arena; Handys (online über ../cloud/fire-peer.js, Links über EasyGamesLink.share), Controller und
 * Tastatur spielen zusammen, freie Plätze übernehmen Computer-Gäste. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id), P = 'konfetti-party-';
  const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } } };
  const D = KP_DATA, { ARENAS, POWERS, GUESTS, BOTS, LEVELS, TOUR } = D, V = window.KPView, S = window.KPSound;
  const SET = Object.assign({ sound: true, music: true, vib: true, name: '', bots: 3, lvl: 1, wins: 2, arena: 0, kb: false, lbBots: 2 }, LS.get(P + 'settings', {}));
  const saveSet = () => LS.set(P + 'settings', SET);
  const ST = Object.assign({ matches: 0, won: 0, rounds: 0, cups: [], tour: 0 }, LS.get(P + 'stats', {}));
  const saveSt = () => { LS.set(P + 'stats', ST); if (ST.won > (LS.get(P + 'highscore', 0) || 0)) LS.set(P + 'highscore', ST.won); };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const coarse = () => matchMedia('(pointer: coarse)').matches;
  const vib = ms => { if (SET.vib && navigator.vibrate) try { navigator.vibrate(ms); } catch (e) { } };
  const sfx = n => { if (SET.sound && S.sfx[n]) S.sfx[n](); };
  const fmt = t => { t = Math.max(0, Math.ceil(t)); return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0'); };
  const powStr = p => `🍬${p.cap} 🎉${p.range}${p.speed ? ' 🛼' + p.speed : ''}${p.kick ? ' 🦶' : ''}${p.shield ? ' 🎈' : ''}${p.remote ? ' 📡' : ''}${p.wirr > 0 ? ' 🌀' : ''}`;
  let toastT = 0; function toast(m, ms) { const t = $('toast'); t.textContent = m; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, ms || 2600); }
  S.setVol('sfx', SET.sound ? .8 : 0);

  /* ---------- Bildschirme & Navigation ---------- */
  let cur = 'sLoad';
  const BACK = { sMenu: () => scr('sTitle'), sTour: () => toMenu(), sParty: () => toMenu(), sHelp: () => toMenu(), sLobby: () => { netClose(); toMenu(); }, sPhone: () => { if (!$('pJoin').hidden) { netClose(); toMenu(); } }, sResult: () => { const b = $('reBtns').querySelector('.pri'); if (b) b.click(); } };
  function scr(id) { document.querySelectorAll('.scr').forEach(s => s.classList.toggle('on', s.id === id)); cur = id; document.body.dataset.scr = id; setTimeout(focusFirst, 0); }
  const overlays = () => Array.from(document.querySelectorAll('.ov')).filter(o => !o.hidden);
  const root = () => overlays().pop() || $(cur);
  const navEls = () => Array.from(root().querySelectorAll('.nav')).filter(e => !e.disabled && e.offsetParent !== null);
  function focusFirst() { const els = navEls(), el = els.find(e => e.classList.contains('pri') || e.classList.contains('hero')) || els[0]; if (el && !coarse() && (cur !== 'sGame' || overlays().length)) try { el.focus({ preventScroll: true }); } catch (e) { } }
  function openOv(id) { $(id).hidden = false; setTimeout(focusFirst, 0); }
  function closeOv(id) { $(id).hidden = true; setTimeout(focusFirst, 0); }
  const closeAllOv = () => document.querySelectorAll('.ov').forEach(o => { o.hidden = true; });
  function moveFocus(dx, dy) {
    const els = navEls(); if (!els.length) return; const a = document.activeElement;
    if (!els.includes(a)) { els[0].focus(); sfx('nav'); return; }
    const r = a.getBoundingClientRect(), ax = r.left + r.width / 2, ay = r.top + r.height / 2; let best = null, bd = 1e9;
    for (const e of els) { if (e === a) continue; const q = e.getBoundingClientRect(), x = q.left + q.width / 2 - ax, y = q.top + q.height / 2 - ay, along = x * dx + y * dy; if (along <= 4) continue; const d = along + (Math.abs(x * dy) + Math.abs(y * dx)) * 2.2; if (d < bd) { bd = d; best = e; } }
    if (best) { best.focus(); sfx('nav'); if (best.onfocus) best.onfocus(); }
  }
  function back() { const ov = overlays().pop(); if (ov) { if (ov.id === 'ovPause') return resume(); return closeOv(ov.id); } if (cur === 'sGame') return pause(); if (BACK[cur]) BACK[cur](); }
  function seg(el, opts, val, cb) {
    el.innerHTML = opts.map(o => `<button class="sg nav${o.v === val ? ' on' : ''}" data-v="${o.v}">${o.n}</button>`).join('');
    el.querySelectorAll('button').forEach(b => b.onclick = () => { el.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); sfx('nav'); cb(+b.dataset.v); });
  }

  /* ---------- Menü ---------- */
  function menuStat() { $('menuStat').innerHTML = `<span>🏆 ${ARENAS.map((a, i) => ST.cups[i] ? '🏆' : '·').join('')}</span><span>🎉 ${ST.won} Partys gewonnen</span>`; }
  function toMenu() { endGameView(); netClose(); closeAllOv(); menuStat(); scr('sMenu'); music(false); }
  document.querySelectorAll('#mList .mi').forEach(b => {
    b.onfocus = b.onmouseenter = () => { $('mInfo').textContent = b.dataset.i; };
    b.onclick = () => { sfx('ok'); const g = b.dataset.go; if (g === 'tour') tourScreen(); else if (g === 'party') partyScreen(); else if (g === 'host') openLobby(); else if (g === 'join') phoneScreen(''); else if (g === 'opts') openOv('ovOpts'); else if (g === 'help') { helpScreen(); scr('sHelp'); } };
  });
  $('mInfo').textContent = $('mList').firstElementChild.dataset.i;
  $('helpBack').onclick = () => toMenu(); $('tourBack').onclick = () => toMenu(); $('pBack').onclick = () => toMenu();
  function helpScreen() { $('powList').innerHTML = Object.keys(POWERS).map(k => `<div class="it"><i>${POWERS[k].icon}</i><b>${esc(POWERS[k].n)}</b><small>${esc(POWERS[k].d)}</small></div>`).join(''); }
  function arenaCards(el, small, sel, locked, onPick, extra) {
    el.innerHTML = ARENAS.map((A, i) => { const lk = locked && locked(i); return `<button class="ar nav${sel === i ? ' on' : ''}" data-i="${i}" ${lk ? 'disabled' : ''} style="--a:${A.theme.pillar};--b:${A.theme.bg}"><span class="no">${i + 1}</span><b>${lk ? '🔒 ' : ''}${esc(A.n)}</b><small>${esc(A.d)}</small>${extra ? extra(i) : ''}</button>`; }).join('');
    el.querySelectorAll('.ar').forEach(b => b.onclick = () => { el.querySelectorAll('.ar').forEach(x => x.classList.toggle('on', x === b)); sfx('ok'); onPick(+b.dataset.i); });
  }
  function tourScreen() {
    arenaCards($('tourGrid'), false, -1, i => i > ST.tour, i => startTour(i), i => `<span class="cup">${ST.cups[i] ? '🏆 gewonnen' : i <= ST.tour ? '🎯 ' + TOUR[i].s.map(s => LEVELS[s].n[0]).join('') : ''}</span>`);
    scr('sTour');
  }
  function partyScreen() {
    arenaCards($('pArena'), true, SET.arena, null, i => { SET.arena = i; saveSet(); });
    seg($('pBots'), [1, 2, 3].map(v => ({ v, n: v })), SET.bots, v => { SET.bots = v; saveSet(); });
    seg($('pLvl'), LEVELS.map((l, i) => ({ v: i, n: l.n })), SET.lvl, v => { SET.lvl = v; saveSet(); });
    seg($('pWins'), [2, 3, 5].map(v => ({ v, n: v })), SET.wins, v => { SET.wins = v; saveSet(); });
    scr('sParty');
  }
  $('pGo').onclick = () => { sfx('ok'); startSolo(SET.arena, Array.from({ length: SET.bots }, () => SET.lvl), SET.wins, null); };
  function startTour(i) { startSolo(TOUR[i].a, TOUR[i].s, 2, i); }
  function startSolo(ai, skills, wins, tour) {
    const players = [{ name: SET.name || 'Du', look: 0 }].concat(skills.map((s, k) => ({ name: BOTS[k], look: k + 1, bot: true, skill: s })));
    startGame({ ai, players, wins, solo: true, tour, seats: [{ kind: 'solo', chef: 0 }] });
  }

  /* ---------- Einstellungen ---------- */
  const OPT = { oSound: 'sound', oMusic: 'music', oVib: 'vib' };
  for (const id in OPT) { const el = $(id); el.checked = !!SET[OPT[id]]; el.onchange = () => { SET[OPT[id]] = el.checked; saveSet(); S.setVol('sfx', SET.sound ? .8 : 0); if (id === 'oMusic') music(!!A.G); }; }
  $('oName').value = SET.name; $('oName').onchange = () => { SET.name = $('oName').value.trim().slice(0, 14); saveSet(); };
  $('optX').onclick = () => closeOv('ovOpts');
  const music = (on, fast) => S.music(on && SET.music, fast);

  /* ---------- Eingaben ---------- */
  const keys = new Set();
  const kbIn = () => { const k = c => keys.has(c); return { mx: (k('KeyD') || k('ArrowRight') ? 1 : 0) - (k('KeyA') || k('ArrowLeft') ? 1 : 0), mz: (k('KeyS') || k('ArrowDown') ? 1 : 0) - (k('KeyW') || k('ArrowUp') ? 1 : 0), act: k('Space') || k('KeyE') || k('Enter'), det: k('KeyF') || k('ShiftLeft') || k('ShiftRight') }; };
  let PADS = [];
  function readPads() {
    let list = []; try { list = navigator.getGamepads ? Array.from(navigator.getGamepads()) : []; } catch (e) { }
    PADS = []; list.forEach(gp => { if (!gp || !gp.connected) return; const ax = gp.axes || [], bt = gp.buttons || [], v = k => bt[k] ? (bt[k].value || (bt[k].pressed ? 1 : 0)) : 0;
      let x = Math.abs(ax[0] || 0) > .3 ? ax[0] : 0, z = Math.abs(ax[1] || 0) > .3 ? ax[1] : 0; if (v(14) > .5) x = -1; if (v(15) > .5) x = 1; if (v(12) > .5) z = -1; if (v(13) > .5) z = 1;
      PADS[gp.index] = { mx: x, mz: z, act: v(0) > .5, det: v(1) > .5 || v(2) > .5, back: v(1) > .5, start: v(9) > .5 }; });
  }
  const TOUCH = { x: 0, y: 0, a: 0, d: 0 };
  const TBTN = [['a', 'KNALL', 0, 1, '🍬'], ['d', 'ZÜNDEN', 1, 0, '📡']];
  KPTouch.build($('tpad'), TOUCH, TBTN);
  const merge = list => { const o = { mx: 0, mz: 0, act: false, det: false }; for (const q of list) { if (!q) continue; o.mx += q.mx; o.mz += q.mz; o.act = o.act || q.act; o.det = o.det || q.det; } o.mx = clamp(o.mx, -1, 1); o.mz = clamp(o.mz, -1, 1); return o; };
  const touchIn = () => ({ mx: TOUCH.x, mz: TOUCH.y, act: !!TOUCH.a, det: !!TOUCH.d });

  /* ---------- Party ---------- */
  const A = { G: null, seats: [], solo: false, acc: 0, paused: false, count: 0, phase: '', phT: 0, speed: 1, hurry: false };
  function startGame(cfg) {
    endGameView(); closeAllOv(); stopDemo();
    A.cfg = cfg; A.solo = !!cfg.solo; A.seats = cfg.seats; A.acc = 0; A.paused = false; A.hurry = false;
    A.G = KP.newMatch(cfg.ai, cfg.players, { wins: cfg.wins || 2, seed: (Math.random() * 1e9) | 0 });
    V.setArena(A.G, $('ovl')); V.resize(innerWidth, innerHeight);
    scr('sGame'); document.body.classList.add('playing');
    $('tpad').hidden = !(coarse() && (A.solo || A.seats.some(s => s.kind === 'kb'))); document.body.classList.toggle('touchp', !$('tpad').hidden);
    countIn(); music(true); chips(true);
  }
  function countIn() { A.phase = 'count'; A.count = 3.3; bigTxt(ARENAS[A.G.ai].n + '\nRunde ' + A.G.round, 'menu', 1300); netAll({ t: 'st', ph: 'game', msg: 'Runde ' + A.G.round + ' – gleich geht es los!' }); }
  function endGameView() { if (!A.G) return; A.G = null; document.body.classList.remove('playing', 'touchp'); $('ovl').innerHTML = ''; $('tpad').hidden = true; KPTouch.reset(); music(false); }
  let bigT = 0; function bigTxt(t, cls, ms) { const e = $('big'); e.textContent = t; e.className = (cls || ''); e.hidden = false; void e.offsetWidth; e.classList.add('pop'); clearTimeout(bigT); if (ms) bigT = setTimeout(() => { e.hidden = true; }, ms); }
  function inputsFor() {
    readPads(); const inp = [];
    A.seats.forEach(s => {
      if (s.chef == null) return;
      if (s.kind === 'solo') inp[s.chef] = merge([kbIn(), touchIn()].concat(PADS));
      else if (s.kind === 'kb') inp[s.chef] = merge([kbIn(), touchIn()]);
      else if (s.kind === 'pad') inp[s.chef] = PADS[s.pad] || {};
      else if (s.kind === 'net') { const n = s.in || {}, pk = s.pkQ > 0 && !s.pkLast, dt = s.dtQ > 0 && !s.dtLast; if (pk) s.pkQ--; if (dt) s.dtQ--; s.pkLast = pk; s.dtLast = dt; inp[s.chef] = { mx: n.x || 0, mz: n.y || 0, act: pk, det: dt }; }
    });
    return inp;
  }
  const mine = i => A.seats.some(s => s.chef === i && (s.kind === 'solo' || s.kind === 'kb' || s.kind === 'pad'));
  function onEvent(e) {
    V.onEvent(e); const G = A.G;
    if (e.e === 'place') sfx('place'); else if (e.e === 'boom') { sfx('boom'); if (mine(e.owner) || A.solo) vib(25); } else if (e.e === 'crate') sfx('crate'); else if (e.e === 'kick') sfx('kick'); else if (e.e === 'drop') sfx('drop');
    else if (e.e === 'power') { sfx(e.k === 'wirr' ? 'wirr' : 'power'); const p = G.players[e.i]; if (!p.bot) bubble(e.i, POWERS[e.k].icon + ' ' + POWERS[e.k].n); netChef(e.i, { t: 'ev', e: 'power', k: e.k }); }
    else if (e.e === 'shield') { sfx('shield'); bubble(e.i, '🎈 Puh!'); }
    else if (e.e === 'out') { sfx('out'); const p = G.players[e.i], by = e.by >= 0 && e.by !== e.i ? G.players[e.by].name : ''; bubble(e.i, e.by === e.i ? 'Ups, selbst erwischt!' : by ? 'Konfettiert von ' + by + '!' : 'Konfettiert!'); if (mine(e.i)) vib([90, 50, 120]); netChef(e.i, { t: 'ev', e: 'out' }); }
  }
  const BUB = []; function bubble(i, txt) { const el = document.createElement('div'); el.className = 'bub'; el.textContent = txt; $('ovl').appendChild(el); BUB.push({ i, el, t: 1.8 }); }
  function bubbles(dt) { for (let k = BUB.length - 1; k >= 0; k--) { const b = BUB[k]; b.t -= dt; if (b.t <= 0 || !A.G) { b.el.remove(); BUB.splice(k, 1); continue; } const p = A.G.players[b.i], [x, y] = V.screenOf(p.x, 1.6, p.z); b.el.style.transform = `translate(${x}px,${y - (1.8 - b.t) * 20}px) translate(-50%,-100%)`; b.el.style.opacity = Math.min(1, b.t * 2); } }
  function gameFrame(dt) {
    const G = A.G;
    if (!A.paused) {
      if (A.phase === 'count') { const c0 = Math.ceil(A.count); A.count -= dt; const c = Math.ceil(A.count); if (c !== c0) { if (c >= 1 && c <= 3) { bigTxt(String(c), '', 800); sfx('tick'); } else if (c <= 0) { bigTxt('LOS!', 'go', 700); sfx('go'); A.phase = 'play'; netAll({ t: 'st', ph: 'game', msg: '' }); } } readPads(); }
      else if (A.phase === 'play') {
        A.acc += dt * A.speed; let n = 0;
        while (A.acc >= 1 / 60 && n++ < Math.max(6, A.speed * 6)) { A.acc -= 1 / 60; KP.step(G, 1 / 60, inputsFor()); for (const e of G.events) onEvent(e); if (G.roundOver) break; }
        if (A.acc > .1) A.acc = 0;
        if (G.t < 30 && !A.hurry) { A.hurry = true; sfx('hurry'); music(true, true); }
        if (G.roundOver) roundEnd();
      } else if (A.phase === 'roundEnd') { A.phT -= dt; if (A.phT <= 0) { if (G.over) return finish(); KP.newRound(G); V.setArena(G, $('ovl')); A.hurry = false; music(true); countIn(); chips(true); } }
      chips(); netPush(dt);
    }
    V.render(dt, { names: !A.solo || true }); bubbles(dt);
  }
  function roundEnd() {
    const G = A.G, w = G.winner >= 0 ? G.players[G.winner] : null; A.phase = 'roundEnd'; A.phT = 3; ST.rounds++;
    if (w) { bigTxt('🎉 ' + w.name + (G.over ? ' gewinnt die Party!' : ' gewinnt die Runde!'), 'win', 2900); sfx(w.bot && A.solo ? 'lose' : 'win'); V.burst(w.x, w.z, 60, 1); } else { bigTxt('Unentschieden – alle konfettiert!', 'menu', 2900); sfx('horn'); }
    netAll({ t: 'st', ph: 'game', msg: w ? w.name + ' gewinnt die Runde' : 'Unentschieden' });
  }
  let chipSig = '';
  function chips(force) {
    const G = A.G; if (!G) return; const sig = G.players.map(p => p.alive + ',' + p.wins).join('|') + G.round;
    if (force || sig !== chipSig) { chipSig = sig; $('chips').innerHTML = G.players.map(p => `<div class="chip${p.alive ? '' : ' out'}" style="--c:${GUESTS[p.look % 4].col}"><b>${esc(p.name)}</b><span>${'★'.repeat(p.wins)}<em>${'☆'.repeat(Math.max(0, G.wins - p.wins))}</em></span></div>`).join(''); }
    $('clock').textContent = G.t > 0 ? fmt(G.t) : '⚠️'; $('clock').classList.toggle('hurry', G.t < 30);
    const me = A.solo ? G.players[0] : null; $('pows').hidden = !me; if (me) { const s = powStr(me); if ($('pows').textContent !== s) $('pows').textContent = s; }
    if (!$('tpad').hidden) { const d = $('tpad').querySelector('.tb-d'); if (d) d.style.visibility = G.players[0] && G.players[0].remote ? '' : 'hidden'; }
  }
  function pause() { if (!A.G || A.paused) return; A.paused = true; openOv('ovPause'); }
  function resume() { if (!A.G) return; closeOv('ovPause'); A.paused = false; }
  $('bPause').onclick = () => pause(); $('paGo').onclick = () => resume();
  $('paRe').onclick = () => { closeAllOv(); startGame(Object.assign({}, A.cfg)); };
  $('paOpt').onclick = () => openOv('ovOpts');
  $('paQuit').onclick = () => { closeAllOv(); const solo = A.solo; endGameView(); if (solo) toMenu(); else lobbyBack(); };

  /* ---------- Siegerehrung (Game Over) ---------- */
  function finish() {
    const G = A.G, cfg = A.cfg, order = G.players.slice().sort((a, b) => b.wins - a.wins), w = G.players[G.winner], meWon = A.solo && G.winner === 0;
    ST.matches++; if (meWon || (!A.solo && w && !w.bot)) ST.won++;
    if (A.solo && cfg.tour != null && meWon) { ST.cups[cfg.tour] = true; ST.tour = Math.max(ST.tour, Math.min(TOUR.length - 1, cfg.tour + 1)); }
    saveSt(); endGameView();
    $('reT').textContent = A.solo ? (meWon ? '🏆 Du hast die Party gewonnen!' : '🎊 Party vorbei!') : '🏆 ' + (w ? w.name : '') + ' gewinnt!';
    $('rePod').innerHTML = [1, 0, 2].map(k => { const p = order[k]; if (!p) return ''; return `<div class="pd p${k + 1}"><i>${k === 0 ? '👑' : '🎉'}</i><b>${esc(p.name)}</b><small>${'★'.repeat(p.wins)}</small><div class="blk" style="--c:${GUESTS[p.look % 4].col}">${k + 1}</div></div>`; }).join('');
    const nextTour = A.solo && cfg.tour != null && meWon && cfg.tour + 1 < TOUR.length;
    $('reSub').textContent = A.solo ? (cfg.tour != null ? (meWon ? (nextTour ? 'Pokal gewonnen! Die nächste Party wartet.' : 'Alle Pokale geholt – du bist der Party-König!') : 'Knapp! Versuch es gleich nochmal.') : (meWon ? 'Konfetti-Profi!' : 'Nächstes Mal knallt es für dich!')) : 'Danke fürs Feiern!';
    const btn = (id, t, pri) => `<button class="btn nav${pri ? ' pri big' : ''}" id="${id}">${t}</button>`;
    $('reBtns').innerHTML = (A.solo ? btn('reMenu', '☰ Menü') : btn('reLobby', '← Zur Lobby')) + btn('reAgain', '↻ Nochmal', !nextTour) + (nextTour ? btn('reNext', 'Nächste Party ▶', true) : '');
    const on = (id, fn) => { const e = $(id); if (e) e.onclick = () => { sfx('ok'); fn(); }; };
    on('reMenu', () => cfg.tour != null ? tourScreen() : toMenu()); on('reLobby', () => lobbyBack());
    on('reAgain', () => A.solo ? startGame(Object.assign({}, cfg)) : lobbyStart()); on('reNext', () => startTour(cfg.tour + 1));
    scr('sResult'); sfx(A.solo && !meWon ? 'lose' : 'win'); netAll({ t: 'st', ph: 'res', msg: (w ? w.name : 'Niemand') + ' gewinnt die Party!' });
  }

  /* ---------- Hauptschleife ---------- */
  let lastT = performance.now(), padNavT = 0, padDir = null, padPrev = [];
  function frame(now) {
    const dt = Math.min(.1, (now - lastT) / 1000); lastT = now;
    try {
      if (A.G && cur === 'sGame') { gameFrame(dt); if (A.paused) menuPad(dt); padPause(); }
      else { menuPad(dt); if (cur === 'sLobby') lobbyPads(); demoFrame(dt); }
      if (cur === 'sPhone') phoneTick(dt);
    } catch (e) { console.error(e); }
    requestAnimationFrame(frame);
  }
  function padPause() { PADS.forEach((p, i) => { if (p && p.start && !(padPrev[i] && padPrev[i].start)) { if (A.paused) resume(); else pause(); } }); padPrev = PADS.map(p => p && { start: p.start }); }
  function menuPad(dt) {
    readPads(); const q = PADS.find(Boolean); if (!q) return; document.body.classList.add('kbd');
    const x = Math.abs(q.mx) > .5 ? Math.sign(q.mx) : 0, z = Math.abs(q.mz) > .5 ? Math.sign(q.mz) : 0, key = x || z ? (Math.abs(x) >= Math.abs(z) ? x + ',0' : '0,' + z) : null;
    if (key && (key !== padDir || padNavT <= 0)) { const [dx, dy] = key.split(',').map(Number); moveFocus(dx, dy); padNavT = key !== padDir ? .35 : .14; }
    padDir = key; padNavT -= dt;
    if (cur !== 'sLobby') {
      if (q.act && !menuPad.a) { if (cur === 'sTitle' && !overlays().length) pressStart(); else { const a = document.activeElement; if (a && a !== document.body && a.click && !a.disabled) a.click(); else focusFirst(); } }
      if (q.back && !menuPad.b) back();
    }
    if (q.start && !menuPad.st && !A.G) { if (cur === 'sTitle') pressStart(); else if (cur === 'sLobby' && !$('lbGo').disabled) $('lbGo').click(); }
    menuPad.a = q.act; menuPad.b = q.back; menuPad.st = q.start;
  }
  addEventListener('keydown', e => {
    keys.add(e.code); document.body.classList.add('kbd');
    if (A.G && cur === 'sGame' && !overlays().length && /^(Arrow|Space)/.test(e.code)) e.preventDefault();
    if (e.code === 'Escape' || (e.code === 'KeyP' && A.G)) { e.preventDefault(); back(); return; }
    if (A.G && cur === 'sGame' && !overlays().length) return;
    if (e.target && e.target.tagName === 'INPUT' && e.target.type !== 'checkbox' && !['ArrowUp', 'ArrowDown', 'Enter'].includes(e.code)) { if (e.code === 'Enter' && cur === 'sPhone') phoneJoin(); return; }
    if (cur === 'sTitle' && !overlays().length && !e.repeat) { e.preventDefault(); pressStart(); return; }
    const d = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[e.code];
    if (d) { e.preventDefault(); moveFocus(d[0], d[1]); }
  });
  addEventListener('keyup', e => keys.delete(e.code));
  addEventListener('blur', () => keys.clear());
  addEventListener('pointerdown', () => document.body.classList.remove('kbd'), true);
  addEventListener('resize', () => V.resize(innerWidth, innerHeight));
  addEventListener('gamepadconnected', () => { toast('🎮 Controller verbunden'); $('pressTxt').textContent = 'Drücke A'; });
  document.addEventListener('visibilitychange', () => { if (document.hidden && A.G && A.solo) pause(); });
  function pressStart() { S.ctx(); sfx('ok'); scr('sMenu'); menuStat(); try { if (window.EasyGamesKit && EasyGamesKit.fullscreenOnInput && coarse()) EasyGamesKit.fullscreenOnInput(); } catch (e) { } }
  $('bPress').onclick = pressStart;
  $('sTitle').addEventListener('click', e => { if (e.target.closest('a') || e.target.closest('#bPress')) return; if (cur === 'sTitle') pressStart(); });

  /* ---------- Menü-Hintergrund: vier Computer-Gäste feiern ---------- */
  let DEMO = null;
  function demoFrame(dt) {
    if (cur === 'sPhone' || document.visibilityState !== 'visible') return;
    if (!DEMO || DEMO.roundOver) { DEMO = KP.newMatch((Math.random() * ARENAS.length) | 0, [0, 1, 2, 3].map(i => ({ name: BOTS[i], bot: true, skill: 1 })), { seed: (Math.random() * 1e6) | 0 }); V.setArena(DEMO, $('ovl')); }
    KP.step(DEMO, 1 / 60, []); for (const e of DEMO.events) V.onEvent(e); V.render(dt, {});
  }
  function stopDemo() { DEMO = null; }

  /* ---------- Online: Verbindung (PeerJS-kompatibel über ../cloud/fire-peer.js) ---------- */
  function mkNet(cb) {
    const ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789', PRE = 'konfetti-';
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
  const netErr = e => ({ nocode: 'Diese Party gibt es nicht (mehr). Stimmt der Code?', timeout: 'Keine Verbindung – bitte nochmal versuchen.', code: 'Bitte den 4-stelligen Code eingeben.' }[e && e.message] || 'Online ist gerade nicht erreichbar. Prüfe das Internet und versuche es nochmal.');
  let NET = null;
  const H = { on: false, seats: [], pushT: 0 };
  function netClose() { if (NET) NET.close(); NET = null; H.on = false; H.seats = []; PH.on = false; }
  const netAll = m => { if (NET && H.on) NET.send(m); };
  const netChef = (i, m) => { const s = H.seats.find(x => x.chef === i && x.kind === 'net'); if (s && NET) NET.sendTo(s.peer, m); };

  /* ---------- Fernseher / Gastgeber ---------- */
  function openLobby() {
    netClose(); H.on = true; H.seats = []; if (SET.kb) H.seats.push({ kind: 'kb', name: SET.name || 'Tastatur' }); scr('sLobby'); lobbyUi();
    $('code').textContent = '····'; $('url').textContent = ''; $('qr').textContent = '…'; $('lobbyMsg').textContent = 'Die Party wird vorbereitet …';
    NET = mkNet({ onMsg: hostMsg, onLeave: hostLeave });
    NET.host().then(async code => {
      $('code').textContent = code; $('url').textContent = NET.link(); $('lobbyMsg').textContent = 'Handy: Kamera auf den QR-Code oder Code eingeben. Controller: A drücken.';
      try { await NET.loadQR(); const q = qrcode(0, 'M'); q.addData(NET.link()); q.make(); $('qr').innerHTML = q.createSvgTag({ cellSize: 4, margin: 0, scalable: true }); } catch (e) { $('qr').textContent = code; }
    }).catch(e => { $('lobbyMsg').textContent = netErr(e) + ' Controller und Tastatur gehen trotzdem.'; });
  }
  $('lbCopy').onclick = () => { if (!NET || !NET.code) return; const u = NET.link(); try { navigator.clipboard.writeText(u).then(() => toast('🔗 Link kopiert')); } catch (e) { toast(u); } };
  $('lbBack').onclick = () => { netClose(); toMenu(); };
  $('lbKb').checked = !!SET.kb; $('lbKb').onchange = () => { SET.kb = $('lbKb').checked; saveSet(); H.seats = H.seats.filter(s => s.kind !== 'kb'); if (SET.kb && humans().length < 4) H.seats.unshift({ kind: 'kb', name: SET.name || 'Tastatur' }); lobbyUi(); };
  const humans = () => H.seats.filter(s => !s.gone);
  function lobbyUi() {
    const n = humans().length; SET.lbBots = clamp(SET.lbBots, 0, Math.max(0, 4 - n));
    seg($('lbBots'), [0, 1, 2, 3].filter(b => b + n <= 4 || b === 0).map(v => ({ v, n: v ? v + ' 🤖' : 'keine' })), SET.lbBots, v => { SET.lbBots = v; saveSet(); lobbyList(); });
    seg($('lbLvl'), LEVELS.map((l, i) => ({ v: i, n: l.n })), SET.lvl, v => { SET.lvl = v; saveSet(); });
    seg($('lbWins'), [2, 3, 5].map(v => ({ v, n: v })), SET.wins, v => { SET.wins = v; saveSet(); });
    arenaCards($('lbArena'), true, SET.arena, null, i => { SET.arena = i; saveSet(); });
    lobbyList();
  }
  function lobbyList() {
    const hs = humans(), icon = s => s.kind === 'net' ? '📱' : s.kind === 'pad' ? '🎮' : '⌨️';
    $('lobbyList').innerHTML = [0, 1, 2, 3].map(i => { const s = hs[i]; if (s) return `<div class="seat on" style="--c:${GUESTS[i].col}"><i>${icon(s)}</i><b>${esc(s.name)}</b><small>Gast ${i + 1}</small></div>`; const bot = i - hs.length < SET.lbBots; return `<div class="seat${bot ? ' bot' : ''}"><i>${bot ? '🤖' : '➕'}</i><b>${bot ? BOTS[i] : 'Frei'}</b><small>${bot ? 'Computer-Gast' : 'Handy oder A'}</small></div>`; }).join('');
    $('lbGo').disabled = !hs.length || hs.length + SET.lbBots < 2; netAll({ t: 'lob', n: hs.length });
  }
  function lobbyPads() {
    PADS.forEach((p, i) => { if (!p) return; const was = lobbyPads.prev[i] || {}, seat = H.seats.find(s => s.kind === 'pad' && s.pad === i);
      if (p.act && !was.act && !seat && humans().length < 4) { H.seats.push({ kind: 'pad', pad: i, name: 'Controller ' + (i + 1) }); sfx('ok'); lobbyUi(); }
      else if (p.back && !was.back) { if (seat) { H.seats = H.seats.filter(s => s !== seat); lobbyUi(); } else if (!humans().some(s => s.kind === 'pad')) back(); }
      lobbyPads.prev[i] = { act: p.act, back: p.back }; });
  }
  lobbyPads.prev = [];
  function lobbyStart() {
    const hs = humans(); if (!hs.length) return; sfx('ok');
    const players = hs.map((s, i) => { s.chef = i; s.pkQ = 0; s.dtQ = 0; return { name: s.name, look: i }; });
    for (let b = 0; b < SET.lbBots && players.length < 4; b++) players.push({ name: BOTS[players.length], look: players.length, bot: true, skill: SET.lvl });
    if (players.length < 2) return toast('Mindestens zwei Gäste – nimm einen Computer dazu!');
    startGame({ ai: SET.arena, players, wins: SET.wins, seats: hs });
  }
  $('lbGo').onclick = () => lobbyStart();
  function lobbyBack() { endGameView(); H.seats = H.seats.filter(s => !s.gone); scr('sLobby'); lobbyUi(); netAll({ t: 'st', ph: 'lobby' }); }
  function hostMsg(id, m) {
    let s = H.seats.find(x => x.peer === id);
    if (m.t === 'hi') {
      const cid = String(m.cid || '').slice(0, 16), back = H.seats.find(x => x.kind === 'net' && x.cid && x.cid === cid);
      if (back) { back.peer = id; back.gone = false; back.in = {}; back.pkQ = back.dtQ = 0; if (A.G && back.chef != null && A.G.players[back.chef]) { A.G.players[back.chef].bot = false; A.G.players[back.chef].B = null; } NET.sendTo(id, { t: 'wel', name: back.name, look: back.chef || 0, ph: A.G ? 'game' : 'lobby' }); lobbyList(); return; }
      if (A.G) return NET.sendTo(id, { t: 'full', msg: 'Die Party läuft schon – danach kannst du einsteigen.' });
      if (humans().length >= 4) return NET.sendTo(id, { t: 'full', msg: 'Alle 4 Plätze sind belegt.' });
      H.seats = H.seats.filter(x => !x.gone); s = { kind: 'net', peer: id, cid, name: String(m.name || 'Gast').slice(0, 14), in: {}, pkQ: 0, dtQ: 0 }; H.seats.push(s);
      NET.sendTo(id, { t: 'wel', name: s.name, look: humans().indexOf(s), ph: 'lobby' }); toast('📱 ' + s.name + ' feiert mit!'); sfx('horn'); lobbyUi(); return;
    }
    if (!s) return;
    if (m.t === 'in') s.in = { x: clamp(+m.x || 0, -1, 1), y: clamp(+m.y || 0, -1, 1) };
    else if (m.t === 'pk') { if (s.pkQ < 3) s.pkQ++; }
    else if (m.t === 'det') { if (s.dtQ < 2) s.dtQ++; }
    else if (m.t === 'go') { const b = cur === 'sLobby' ? $('lbGo') : cur === 'sResult' ? $('reBtns').querySelector('.pri') : null; if (b && !b.disabled) b.click(); }
  }
  function hostLeave(id) { const s = H.seats.find(x => x.peer === id); if (!s) return; s.gone = true; if (A.G && s.chef != null && A.G.players[s.chef]) { A.G.players[s.chef].bot = true; A.G.players[s.chef].skill = 1; toast('📴 ' + s.name + ' ist weg – ein Computer-Gast springt ein'); } else { H.seats = H.seats.filter(x => x !== s); lobbyUi(); } }
  function netPush(dt) {
    if (!H.on || !NET || !A.G) return; H.pushT -= dt; if (H.pushT > 0) return; H.pushT = .3;
    H.seats.forEach(s => { if (s.kind !== 'net' || s.gone || s.chef == null) return; const p = A.G.players[s.chef]; NET.sendTo(s.peer, { t: 'st', ph: 'game', alive: p.alive, wins: p.wins, need: A.G.wins, pow: powStr(p), remote: p.remote, cnt: A.phase === 'count' }); });
  }

  /* ---------- Handy als Controller ---------- */
  const PH = { on: false, st: { x: 0, y: 0, a: 0, d: 0 }, prev: {}, sendT: 0, last: '', cid: '' };
  try { PH.cid = localStorage.getItem(P + 'cid') || ''; } catch (e) { } if (!/^[a-z0-9]{8,16}$/.test(PH.cid)) { PH.cid = Math.random().toString(36).slice(2, 12).padEnd(8, '0'); try { localStorage.setItem(P + 'cid', PH.cid); } catch (e) { } }
  KPTouch.build($('cz'), PH.st, TBTN);
  function phoneScreen(code) { netClose(); stopDemo(); $('pJoin').hidden = false; $('pCtl').hidden = true; $('jName').value = SET.name || ''; $('jCode').value = code || ''; $('jMsg').textContent = 'Den Code zeigt der Fernseher bei „🌐 Online & Handys“.'; scr('sPhone'); }
  async function phoneJoin() {
    const code = ($('jCode').value || '').trim(), name = ($('jName').value || '').trim().slice(0, 14) || 'Gast';
    SET.name = $('jName').value.trim().slice(0, 14); saveSet(); $('jMsg').textContent = 'Verbinde …'; $('jGo').disabled = true; S.ctx();
    NET = mkNet({ onMsg: phoneMsg, onLeave: () => { if (PH.on) { $('cStat').textContent = '📴 Verbindung weg – verbinde neu …'; setTimeout(() => { if (PH.on) phoneJoin(); }, 1500); } } });
    try { await NET.join(code); PH.on = true; NET.send({ t: 'hi', name, cid: PH.cid }); } catch (e) { $('jMsg').textContent = netErr(e); PH.on = false; }
    $('jGo').disabled = false;
  }
  $('jGo').onclick = () => phoneJoin(); $('jBack').onclick = () => { netClose(); toMenu(); };
  function phoneMsg(id, m) {
    if (m.t === 'full') { $('jMsg').textContent = m.msg; PH.on = false; $('pJoin').hidden = false; $('pCtl').hidden = true; return; }
    if (m.t === 'wel') { $('pJoin').hidden = true; $('pCtl').hidden = false; $('pCtl').style.setProperty('--acc', GUESTS[(m.look || 0) % 4].col); $('cName').textContent = '🎉 ' + m.name; phoneSt({ ph: m.ph }); try { if (window.EasyGamesKit && EasyGamesKit.keepAwake) EasyGamesKit.keepAwake(); } catch (e) { } vib(40); return; }
    if (m.t === 'lob') { if (PH.ph !== 'game') $('cStat').textContent = '✅ Dabei! ' + m.n + ' Gäste – warte auf den Start …'; return; }
    if (m.t === 'st') return phoneSt(m);
    if (m.t === 'ev') { if (m.e === 'out') { vib([90, 50, 140]); $('cStat').textContent = '🎊 Konfettiert! Zuschauen bis zur nächsten Runde …'; } else if (m.e === 'power') vib(30); }
  }
  function phoneSt(m) {
    PH.ph = m.ph; $('cGo').hidden = !(m.ph === 'lobby' || m.ph === 'res'); $('cGo').textContent = m.ph === 'lobby' ? '🎉 Party starten' : '▶ Weiter';
    if (m.ph === 'game') { if (m.msg != null) { if (m.msg) $('cStat').textContent = m.msg; } else $('cStat').textContent = (m.cnt ? '⏳ Gleich geht es los! ' : m.alive === false ? '🎊 Konfettiert – zuschauen … ' : '') + (m.wins != null ? '★'.repeat(m.wins) + '☆'.repeat(Math.max(0, m.need - m.wins)) : ''); if (m.pow) $('cPow').textContent = m.pow; const d = $('cz').querySelector('.tb-d'); if (d && m.remote != null) d.style.visibility = m.remote ? '' : 'hidden'; }
    else if (m.ph === 'res') $('cStat').textContent = m.msg || 'Party vorbei!';
    else if (m.ph === 'lobby') $('cStat').textContent = '✅ Dabei! Warte auf den Start …';
  }
  $('cGo').onclick = () => { if (NET) NET.send({ t: 'go' }); sfx('ok'); };
  function phoneTick(dt) {
    if (!PH.on || !NET) return; PH.sendT -= dt; const st = PH.st, pv = PH.prev;
    if (st.a && !pv.a) NET.send({ t: 'pk' }); if (st.d && !pv.d) NET.send({ t: 'det' }); PH.prev = { a: st.a, d: st.d };
    const m = { t: 'in', x: Math.round(st.x * 10) / 10, y: Math.round(st.y * 10) / 10 }, key = m.x + ',' + m.y;
    if (key !== PH.last || PH.sendT <= 0) { PH.last = key; PH.sendT = .25; NET.send(m); }
  }

  /* ---------- Laden ---------- */
  const TIPS = ['Luftballons werden aufgeblasen …', 'Konfetti wird geschnitten …', 'Geschenke werden verpackt …', 'Die Musik wird lauter …'];
  const bar = p => { $('loadBar').style.width = Math.round(p * 100) + '%'; $('loadTip').textContent = TIPS[Math.min(TIPS.length - 1, Math.floor(p * TIPS.length))]; };
  (async function boot() {
    const t0 = performance.now(); bar(.2); await new Promise(r => setTimeout(r, 30));
    try { V.init($('cv')); V.resize(innerWidth, innerHeight); } catch (e) { console.error(e); toast('3D-Grafik wird nicht unterstützt'); }
    bar(.7); await new Promise(r => setTimeout(r, Math.max(0, 900 - (performance.now() - t0)))); bar(1);
    $('sLoad').classList.add('out'); setTimeout(() => { $('sLoad').classList.remove('on', 'out'); }, 460);
    requestAnimationFrame(frame);
    if (navigator.getGamepads && Array.from(navigator.getGamepads() || []).some(Boolean)) $('pressTxt').textContent = 'Drücke A';
    const q = new URLSearchParams(location.search), jc = q.get('join');
    if (jc) { phoneScreen(jc.toUpperCase()); return; }
    const tv = (window.EasyGamesKit && EasyGamesKit.isTv && EasyGamesKit.isTv()) || q.has('tv');
    if (tv) { scr('sMenu'); menuStat(); openLobby(); return; }
    scr('sTitle');
  })();
  window.KPApp = { A, SET, ST, H, PH, startSolo, startTour, lobbyStart, KP };
})();
