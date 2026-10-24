/* Sendemast-Sumo – App: Ladebildschirm, Titel, Konsolen-Menü, Kämpferwahl, Turnier, Schnelles Spiel, Lokal (bis 4 an einem Gerät),
 * Online & Handys (Fernseher/PC zeigt die Arena, Handys sind Controller über ../cloud/fire-peer.js), Pause, Ergebnis, Rekorde.
 * Eingabe: Tastatur (zwei Belegungen), bis zu 4 Gamecontroller (eigene Abfrage), Touch-Stick; Menüs mit Steuerkreuz/Pfeilen bedienbar.
 * Logik: js/core.js (SM), 3D: js/scene.js (SMScene), Ton: js/sound.js (SMSound). */
(function () {
  'use strict';
  const $ = id => document.getElementById(id), P = 'sendemast-sumo-';
  const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } } };
  const SET = Object.assign({ sound: true, music: true, vib: true, tags: true, low: false, fid: 'toni', arena: 0, rnd: false, cpu: 3, diff: 1, wins: 2 }, LS.get(P + 'settings', {}));
  const save = () => LS.set(P + 'settings', SET);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const S = window.SMSound, F = SM.FIGHTERS, A = SM.ARENAS;
  S.sfxOn = SET.sound; S.musicOn = SET.music;
  let toastT = 0; function toast(m) { const t = $('toast'); t.textContent = m; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2400); }
  const vib = ms => { if (SET.vib && navigator.vibrate) try { navigator.vibrate(ms); } catch (e) { } };
  const coarse = () => matchMedia('(pointer: coarse)').matches;
  const embCache = {}; const emb = fid => embCache[fid] || (embCache[fid] = window.SMEmblem(SM.fighter(fid), 96));
  const sfx = (k, p) => { if (G.mode !== 'attract') S.sfx(k, p); };

  /* ---------- Bildschirme und Menü-Navigation (Pfeile/Steuerkreuz, Enter/A, Esc/B) ---------- */
  let cur = 'sLoad';
  const BACK = { sMenu: () => scr('sTitle'), sFighter: () => G.fBack(), sJoin: () => toMenu(), sOpts: () => G.oBack(), sLobby: () => { hostClose(); toMenu(); } };
  function scr(id) { document.querySelectorAll('.scr').forEach(s => s.classList.toggle('on', s.id === id)); cur = id; setTimeout(focusFirst, 0); }
  const overlays = () => Array.from(document.querySelectorAll('.ov')).filter(o => !o.hidden);
  const root = () => overlays().pop() || $(cur);
  const navEls = () => Array.from(root().querySelectorAll('.nav, .chip, .fcard')).filter(e => !e.disabled && e.offsetParent !== null);
  function focusFirst() { const r = root(), els = navEls(); const el = r.querySelector('[data-focus]:not([disabled])') || els.find(e => e.classList.contains('pri')) || els[0]; if (el && !coarse()) try { el.focus({ preventScroll: true }); } catch (e) { } }
  function openOv(id) { $(id).hidden = false; setTimeout(focusFirst, 0); }
  function closeOv(id) { $(id).hidden = true; setTimeout(focusFirst, 0); }
  function moveFocus(dx, dy) {
    const els = navEls(); if (!els.length) return; let a = document.activeElement;
    if (!els.includes(a)) { els[0].focus(); sfx('move'); return; }
    const r = a.getBoundingClientRect(), ax = r.left + r.width / 2, ay = r.top + r.height / 2; let best = null, bd = 1e9;
    for (const e of els) { if (e === a) continue; const q = e.getBoundingClientRect(), x = q.left + q.width / 2 - ax, y = q.top + q.height / 2 - ay, along = x * dx + y * dy; if (along <= 4) continue; const side = Math.abs(x * dy) + Math.abs(y * dx), d = along + side * 2.2; if (d < bd) { bd = d; best = e; } }
    if (best) { best.focus({ preventScroll: false }); sfx('move'); }
  }
  function back() {
    const ov = overlays().pop();
    if (ov) { const x = ov.querySelector('[data-close]'); if (ov.id === 'ovPause') resume(); else if (x) x.click(); else if (ov.id !== 'ovEnd' && ov.id !== 'ovRound' && ov.id !== 'ovStage') closeOv(ov.id); else if (ov.id === 'ovStage') { closeOv('ovStage'); toMenu(); } sfx('back'); return; }
    if (cur === 'sGame') { pause(); return; }
    if (BACK[cur]) { sfx('back'); BACK[cur](); }
  }

  /* ---------- Eingabe: Tastatur, Controller, Touch, Handys ---------- */
  const KEY = {}, EDGE = {}; const ED = () => ({ dash: 0, slam: 0 });
  const KB = { kb1: { u: ['KeyW'], d: ['KeyS'], l: ['KeyA'], r: ['KeyD'], dash: ['Space', 'KeyF'], slam: ['ShiftLeft', 'KeyG'] },
    kb2: { u: ['ArrowUp'], d: ['ArrowDown'], l: ['ArrowLeft'], r: ['ArrowRight'], dash: ['Enter', 'NumpadEnter', 'KeyL'], slam: ['KeyK', 'ShiftRight', 'Numpad0'] } };
  const edge = dev => EDGE[dev] || (EDGE[dev] = ED());
  const kdown = (k, list) => list.some(c => k[c]);
  addEventListener('keydown', e => {
    document.body.classList.add('kbd');
    if (e.target && e.target.tagName === 'INPUT') { if (e.key === 'Escape') e.target.blur(); return; }
    const c = e.code, inGame = cur === 'sGame' && !overlays().length;
    if (!e.repeat) for (const d of ['kb1', 'kb2']) { if (KB[d].dash.includes(c)) { edge(d).dash++; edge('any').dash++; } if (KB[d].slam.includes(c)) { edge(d).slam++; edge('any').slam++; } }
    KEY[c] = true;
    if (cur === 'sJoin' && !overlays().length) { if (joinKey(c, e)) { e.preventDefault(); return; } }
    if (c === 'Escape' || (c === 'KeyP' && inGame)) { e.preventDefault(); back(); return; }
    if (inGame) { if (c.startsWith('Arrow') || c === 'Space' || c === 'Enter') e.preventDefault(); return; }
    if (cur === 'sTitle' && !overlays().length && !e.repeat) { e.preventDefault(); pressStart(); return; }
    const dir = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[c];
    if (dir) { e.preventDefault(); moveFocus(dir[0], dir[1]); }
  });
  addEventListener('keyup', e => { KEY[e.code] = false; });
  addEventListener('blur', () => { for (const k in KEY) KEY[k] = false; });
  addEventListener('pointerdown', () => document.body.classList.remove('kbd'), true);
  function kbMove(d) { const m = KB[d]; return { x: (kdown(KEY, m.r) ? 1 : 0) - (kdown(KEY, m.l) ? 1 : 0), z: (kdown(KEY, m.d) ? 1 : 0) - (kdown(KEY, m.u) ? 1 : 0) }; }
  // Controller: eigene Abfrage für bis zu 4 Pads (Spiel) und Menü-Navigation
  const PADS = []; let padNavT = 0;
  function pollPads(dt) {
    let list = []; try { list = navigator.getGamepads ? Array.from(navigator.getGamepads()) : []; } catch (e) { }
    for (let i = 0; i < 4; i++) {
      const g = list[i], st = PADS[i] || (PADS[i] = { b: [], x: 0, z: 0, on: false });
      if (!g || !g.connected) { st.on = false; continue; }
      st.on = true; const ax = g.axes || [], bt = g.buttons || [], pr = k => !!(bt[k] && (bt[k].pressed || bt[k].value > .5));
      let x = Math.abs(ax[0]) > .22 ? ax[0] : 0, z = Math.abs(ax[1]) > .22 ? ax[1] : 0;
      if (pr(14)) x = -1; if (pr(15)) x = 1; if (pr(12)) z = -1; if (pr(13)) z = 1; st.x = x; st.z = z;
      const now = []; for (let k = 0; k < 16; k++) now[k] = pr(k);
      const down = k => now[k] && !st.b[k], dev = 'pad' + i;
      if (down(0)) { edge(dev).dash++; edge('any').dash++; } if (down(1) || down(2)) { edge(dev).slam++; edge('any').slam++; }
      const menu = cur !== 'sGame' || overlays().length;
      if (menu && cur !== 'sJoin') {
        document.body.classList.add('kbd');
        const mx = Math.abs(x) > .5 ? Math.sign(x) : 0, mz = Math.abs(z) > .5 ? Math.sign(z) : 0;
        if ((mx || mz) && (!st.nav || padNavT <= 0)) { moveFocus(mz ? 0 : mx, mz); padNavT = st.nav ? .13 : .32; } st.nav = !!(mx || mz);
        if (down(0)) { if (cur === 'sTitle' && !overlays().length) pressStart(); else { const a = document.activeElement; if (a && a !== document.body && a.click) { a.click(); sfx('ok'); } else focusFirst(); } }
        if (down(1)) back();
      } else if (cur === 'sJoin') joinPad(i, down, x);
      if (down(9) && cur === 'sGame') { if (overlays().some(o => o.id === 'ovPause')) resume(); else if (!overlays().length) pause(); }
      else if (down(9) && cur === 'sTitle') pressStart();
      st.b = now;
    }
    padNavT -= dt;
  }
  addEventListener('gamepadconnected', () => { toast('🎮 Controller verbunden'); $('pressTxt').textContent = 'Drücke A'; });
  // Touch-Stick (dynamisch: wo der Daumen hinfasst) und Knöpfe
  const TS = { x: 0, z: 0, id: null, ox: 0, oy: 0 };
  function stick(zone, knob, st, onMove) {
    const R = 52;
    zone.addEventListener('pointerdown', e => { if (e.target.closest && e.target.closest('button')) return; st.id = e.pointerId;   // neuer Finger übernimmt immer (kein Hängenbleiben) try { zone.setPointerCapture(e.pointerId); } catch (x) { } const r = zone.getBoundingClientRect(); st.ox = e.clientX; st.oy = e.clientY; knob.style.left = (e.clientX - r.left) + 'px'; knob.style.top = (e.clientY - r.top) + 'px'; knob.classList.add('on'); e.preventDefault(); });
    zone.addEventListener('pointermove', e => { if (e.pointerId !== st.id) return; let dx = e.clientX - st.ox, dy = e.clientY - st.oy; const l = Math.hypot(dx, dy); if (l > R) { dx *= R / l; dy *= R / l; } st.x = dx / R; st.z = dy / R; knob.firstElementChild.style.transform = 'translate(' + dx + 'px,' + dy + 'px)'; if (onMove) onMove(); });
    const end = e => { if (e.pointerId !== st.id) return; st.id = null; st.x = st.z = 0; knob.firstElementChild.style.transform = ''; knob.classList.remove('on'); if (onMove) onMove(); };
    zone.addEventListener('pointerup', end); zone.addEventListener('pointercancel', end); zone.addEventListener('lostpointercapture', end);
  }
  stick($('tZone'), $('tStick'), TS);
  const tBtn = (el, k) => el.addEventListener('pointerdown', e => { e.preventDefault(); edge('touch')[k]++; edge('any')[k]++; vib(12); el.classList.add('hit'); setTimeout(() => el.classList.remove('hit'), 120); });
  tBtn($('tDash'), 'dash'); tBtn($('tSlam'), 'slam');
  // Eingabe eines Geräts lesen (Kanten werden dabei verbraucht)
  const NETIN = {};
  function read(dev) {
    let x = 0, z = 0;
    const add = m => { x += m.x; z += m.z; };
    if (dev === 'kb1' || dev === 'any') add(kbMove('kb1'));
    if (dev === 'kb2' || dev === 'any') add(kbMove('kb2'));
    if (dev === 'touch' || dev === 'any') add(TS);
    for (let i = 0; i < 4; i++) if ((dev === 'pad' + i || dev === 'any') && PADS[i] && PADS[i].on) add(PADS[i]);
    let dash = false, slam = false;
    if (dev && dev.startsWith('net:')) { const n = NETIN[dev.slice(4)]; if (n) { x = n.x; z = n.z; dash = n.d > n.cd; slam = n.s > n.cs; n.cd = n.d; n.cs = n.s; } }
    else { const e = edge(dev); dash = e.dash > 0; slam = e.slam > 0; e.dash = e.slam = 0; }
    const l = Math.hypot(x, z); if (l > 1) { x /= l; z /= l; }
    return { x, z, dash, slam };
  }
  const clearEdges = () => { for (const k in EDGE) EDGE[k].dash = EDGE[k].slam = 0; };

  /* ---------- Spielzustand ---------- */
  const G = { mode: 'attract', M: null, W: null, cfg: null, devs: [], running: false, paused: false, endShown: false, fBack: () => toMenu(), oBack: () => toMenu(), tour: null, roundT: 0 };
  function attract() {
    G.mode = 'attract'; const ids = F.map(f => f.id).sort(() => Math.random() - .5).slice(0, 4);
    G.M = SM.newMatch({ arena: Math.floor(Math.random() * A.length), randomArena: true, target: 99, players: ids.map(fid => ({ fid, kind: 'cpu', diff: 1 })) });
    newRound(true);
  }
  function newRound(quiet) {
    G.W = SM.newRound(G.M); G.endShown = false; G.paused = false; G.running = true;
    SMScene.setArena(G.W.A); SMScene.setup(G.W, quiet ? null : G.M.players.map(p => p.name), quiet ? null : G.M.players.map(p => p.kind === 'human')); SMScene.tags = SET.tags;
    if (!quiet) { hudInit(); $('hRound').textContent = 'Runde ' + G.M.round; $('hInfo').textContent = G.W.A.n; banner(G.W.A.n, G.W.A.d, 2600); clearEdges(); }
  }
  function startMatch(cfg) {
    G.cfg = cfg; G.mode = cfg.mode; G.devs = cfg.players.map(p => p.dev || null);
    const used = new Set(), names = cfg.players.map(p => p.name || SM.fighter(p.fid).n.split(' ')[0]);
    G.M = SM.newMatch({ arena: cfg.arena, randomArena: cfg.randomArena, target: cfg.target, players: cfg.players.map((p, i) => ({ fid: p.fid, kind: p.kind, diff: p.diff, name: names[i], dev: p.dev })) });
    G.M.stage = G.tour ? G.tour.stage : 0;
    scr('sGame'); for (const o of overlays()) o.hidden = true;
    const touch = coarse() && cfg.players.some(p => p.dev === 'any' || p.dev === 'touch'); $('touch').hidden = !touch;
    newRound(false); S.music('fight'); used.clear();
  }
  // HUD: Chips mit Emblem, Name, Siegpunkten
  function hudInit() {
    $('hChips').innerHTML = G.M.players.map((p, i) => '<div class="hc" id="hc' + i + '" style="--c:' + SM.fighter(p.fid).col + '"><img src="' + emb(p.fid) + '" alt=""><span><b>' + esc(p.name) + '</b><i>' + '●'.repeat(p.wins) + '<u>' + '○'.repeat(Math.max(0, G.M.target - p.wins)) + '</u></i></span></div>').join('');
  }
  let banT = 0; function banner(t, sub, ms) { const b = $('banner'); b.innerHTML = '<b>' + esc(t) + '</b>' + (sub ? '<small>' + esc(sub) + '</small>' : ''); b.hidden = false; b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); clearTimeout(banT); banT = setTimeout(() => { b.hidden = true; }, ms || 1600); }
  function pop(i, txt, col) { const f = G.W.f[i]; if (!f) return; const p = SMScene.screenPos(f), d = document.createElement('div'); d.className = 'popTxt'; d.textContent = txt; d.style.left = (p.x * 100) + '%'; d.style.top = (p.y * 100) + '%'; if (col) d.style.color = col; $('pops').appendChild(d); setTimeout(() => d.remove(), 1100); }
  const humanDev = i => G.M && G.M.players[i] && G.M.players[i].kind === 'human' ? G.M.players[i].dev : null;
  function feel(i, ms) { const d = humanDev(i); if (!d) return; if (d.startsWith('net:')) { if (H.net) H.net.sendTo(d.slice(4), { t: 'vib', p: ms }); } else vib(ms); }
  function onEvent(e) {
    SMScene.fx(e); if (G.mode === 'attract') return;
    const nm = i => G.M.players[i] ? G.M.players[i].name : '';
    switch (e.k) {
      case 'beep': $('count').hidden = false; $('count').textContent = e.n; $('count').className = 'count pop'; sfx('beep'); break;
      case 'go': $('count').textContent = 'SUMO!'; $('count').className = 'count pop go'; sfx('go'); setTimeout(() => { $('count').hidden = true; }, 700); break;
      case 'dash': sfx('dash'); break;
      case 'clash': if (e.p > 2.5) { sfx('clash', e.p); feel(e.i, 25); feel(e.j, 40); } break;
      case 'jump': sfx('jump'); break;
      case 'slam': sfx('slam'); break;
      case 'slamHit': feel(e.j, 60); break;
      case 'zap': feel(e.j, [60, 40, 60]); break;
      case 'fall': sfx('fall'); setTimeout(() => sfx('out'), 0); pop(e.i, 'RAUS!', '#ff2d55'); if (e.by >= 0) setTimeout(() => pop(e.by, '+1 KO', SM.fighter(G.W.f[e.by].fid).col), 200); { const c = $('hc' + e.i); if (c) c.classList.add('out'); } feel(e.i, [80, 50, 160]); if (H.net) netTo(e.i, { t: 'out' }); break;
      case 'pu': sfx('pu'); pop(e.i, SM.PU[e.type].ic + ' ' + SM.PU[e.type].n + '!', '#ffe066'); feel(e.i, 30); break;
      case 'ringWarn': sfx('warn'); banner('⚠ Der Rand bröckelt!', 'Weg vom blinkenden Ring', 1500); break;
      case 'ring': sfx('ring'); break;
      case 'sudden': banner('⏳ Sudden Death', 'Die Plattform schrumpft weiter!', 2000); sfx('warn'); break;
      case 'windWarn': { const a = Math.atan2(e.z, e.x) * 180 / Math.PI; banner('🌬️ Böe kommt!', 'Gegen den Pfeil halten', 1300); $('banner').querySelector('small').insertAdjacentHTML('afterend', '<i class="arrow" style="transform:rotate(' + a + 'deg)">➜</i>'); sfx('warn'); break; }
      case 'wind': sfx('wind'); break;
      case 'strikeWarn': sfx('warn'); break;
      case 'strike': sfx('zap'); break;
      case 'roundEnd': break;
    }
  }

  /* ---------- Hauptschleife ---------- */
  let last = 0, acc = 0;
  function loop(now) {
    requestAnimationFrame(loop);
    const dt = Math.min(.1, last ? (now - last) / 1000 : .016); last = now;
    pollPads(dt);
    if (document.hidden) return;
    const W = G.W;
    if (W && G.running && !G.paused) {
      acc += dt; let first = true;
      while (acc >= 1 / 60) {
        acc -= 1 / 60;
        const inp = G.M.players.map((p, i) => p.kind === 'cpu' || G.mode === 'attract' ? SM.ai(W, i, p.diff) : (first ? read(p.dev) : Object.assign(read(p.dev), { dash: false, slam: false })));
        first = false; SM.step(W, inp, 1 / 60);
        for (const e of W.ev) onEvent(e); W.ev.length = 0;
      }
      if (W.phase === 'end' && !G.endShown && W.endT > 1.3) { G.endShown = true; roundOver(); }
    }
    if (W && G.mode !== 'attract' && G.running && !G.paused) { const t = Math.max(0, Math.floor(W.fightT)); $('hInfo').textContent = W.A.n + (W.phase === 'fight' ? ' · ' + Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') : ''); }
    SMScene.frame(W, G.paused ? 0 : dt, { orbit: G.mode === 'attract' });
    if (H.net && W && G.mode === 'online') netTick(dt);
  }

  /* ---------- Runden- und Match-Ende ---------- */
  function roundOver() {
    const M = G.M, W = G.W;
    if (G.mode === 'attract') { if (M.round > 50) attract(); else newRound(true); return; }
    hudInit(); for (const i of W.order.slice(0, -1)) { const c = $('hc' + i); if (c && W.winner !== i) c.classList.add('out'); }
    if (H.net) M.players.forEach((p, i) => netTo(i, { t: 'round', win: W.winner === i, wins: p.wins }));
    if (M.done) { matchOver(); return; }
    const w = W.winner >= 0 ? M.players[W.winner] : null;
    $('rIcon').innerHTML = w ? '<img src="' + emb(w.fid) + '" alt="">' : '🤝';
    $('rTitle').textContent = w ? w.name + ' gewinnt Runde ' + M.round + '!' : 'Unentschieden – alle runter!';
    $('rWins').innerHTML = M.players.map(p => '<span style="--c:' + SM.fighter(p.fid).col + '"><img src="' + emb(p.fid) + '" alt="">' + '●'.repeat(p.wins) + '</span>').join('');
    $('rInfo').textContent = 'Erster mit ' + M.target + ' ' + (M.target > 1 ? 'Siegen' : 'Sieg') + ' gewinnt.';
    sfx(w && M.players[W.winner].kind === 'human' ? 'win' : 'cheer'); $('ovRound').hidden = false;
    setTimeout(() => { if (G.M !== M || G.paused) return; $('ovRound').hidden = true; newRound(false); }, 2600);
  }
  function rank(M) { return M.players.map((p, i) => Object.assign({ i }, p)).sort((a, b) => (b.i === M.winner) - (a.i === M.winner) || b.wins - a.wins || b.ko - a.ko || a.falls - b.falls); }
  function matchOver() {
    const M = G.M, R = rank(M), win = M.players[M.winner], humanWon = win.kind === 'human';
    const st = LS.get(P + 'stats', { matches: 0, won: 0, ko: 0, tourBest: 0, tourStage: 0, champ: 0 });
    const hum = M.players.filter(p => p.kind === 'human'); st.matches++; if (humanWon) st.won++; st.ko += hum.reduce((s, p) => s + p.ko, 0);
    let title = humanWon ? '🏆 ' + win.name + ' gewinnt!' : '😵 ' + win.name + ' gewinnt!', sub = '', rec = false;
    $('eNext').hidden = true; $('eAgain').hidden = false;
    if (G.mode === 'tour') {
      const T = G.tour, pts = SM.tourPoints(M, 0); T.pts += pts;
      if (humanWon) { T.stage++; st.tourStage = Math.max(st.tourStage, T.stage); }
      const over = !humanWon || T.stage >= 5;
      if (over) { if (T.stage >= 5) { st.champ++; title = '👑 Turnier-Champion!'; sub = 'Alle 5 Masten erobert – ' + T.pts + ' Punkte!'; } else { title = '💫 Turnier vorbei'; sub = 'Mast ' + (T.stage + 1) + ' von 5 · ' + T.pts + ' Punkte'; }
        if (T.pts > LS.get(P + 'highscore', 0)) { LS.set(P + 'highscore', T.pts); rec = true; } st.tourBest = Math.max(st.tourBest, T.pts); $('eAgain').textContent = '↻ Neues Turnier'; }
      else { title = '🏆 Mast ' + T.stage + ' erobert!'; sub = '+' + pts + ' Punkte · gesamt ' + T.pts + ' · weiter zu Mast ' + (T.stage + 1) + ' von 5'; $('eNext').hidden = false; $('eAgain').hidden = true; }
    } else { sub = 'Erster mit ' + M.target + ' Siegen · ' + M.round + ' Runden'; $('eAgain').textContent = '↻ Revanche'; }
    LS.set(P + 'stats', st);
    $('eTitle').textContent = title; $('eSub').textContent = sub; $('eRec').hidden = !rec;
    $('ePodium').innerHTML = R.slice(0, 3).map((p, k) => '<div class="pod p' + (k + 1) + '" style="--c:' + SM.fighter(p.fid).col + '"><img src="' + emb(p.fid) + '" alt=""><b>' + esc(p.name) + '</b><span>' + (k + 1) + '</span></div>').join('');
    $('eStats').innerHTML = '<table><tr><th></th><th>Siege</th><th>KOs</th><th>Schubser</th><th>Stampfer</th><th>Stürze</th></tr>' + R.map(p => '<tr><td style="color:' + SM.fighter(p.fid).col + '">' + esc(p.name) + (p.kind === 'cpu' ? ' <small>🤖</small>' : '') + '</td><td>' + p.wins + '</td><td>' + p.ko + '</td><td>' + p.pushes + '</td><td>' + p.slams + '</td><td>' + p.falls + '</td></tr>').join('') + '</table>';
    sfx(humanWon ? 'win' : 'lose'); setTimeout(() => sfx('cheer'), 300);
    if (H.net) R.forEach((p, k) => netTo(p.i, { t: 'end', place: k + 1, win: p.i === M.winner }));
    G.running = false; S.music('menu'); openOv('ovEnd');
  }
  $('eNext').onclick = () => { closeOv('ovEnd'); stageIntro(); };
  $('eAgain').onclick = () => { closeOv('ovEnd'); if (G.mode === 'tour') tourStart(G.tour.fid); else startMatch(G.cfg); };
  $('eMenu').onclick = () => { closeOv('ovEnd'); if (G.mode === 'online' && H.net) { hostLobby(); } else toMenu(); };

  /* ---------- Pause ---------- */
  function pause() { if (!G.running || G.paused || G.mode === 'attract' || (G.W && G.W.phase === 'end')) return; G.paused = true; openOv('ovPause'); S.music('menu'); }
  function resume() { G.paused = false; $('ovPause').hidden = true; clearEdges(); S.music('fight'); if (document.activeElement) document.activeElement.blur(); }
  $('bPause').onclick = e => { pause(); e.currentTarget.blur(); };
  $('pGo').onclick = resume;
  $('pRestart').onclick = () => { $('ovPause').hidden = true; G.paused = false; G.M.round--; newRound(false); S.music('fight'); };
  $('pOpts').onclick = () => { $('ovPause').hidden = true; optsOpen(() => openOv('ovPause')); };
  $('pHelp').onclick = () => { $('ovPause').hidden = true; helpBack = () => openOv('ovPause'); openOv('ovHelp'); };
  $('pQuit').onclick = () => { $('ovPause').hidden = true; G.paused = false; if (G.mode === 'online' && H.net) hostLobby(); else toMenu(); };
  addEventListener('visibilitychange', () => { if (document.hidden && cur === 'sGame' && G.mode !== 'online') pause(); });

  /* ---------- Menü ---------- */
  function toMenu() {
    for (const o of overlays()) o.hidden = true; $('touch').hidden = true; $('banner').hidden = true; $('count').hidden = true;
    if (G.mode !== 'attract') attract(); scr('sMenu'); menuStat(); S.music('menu');
  }
  function menuStat() {
    const st = LS.get(P + 'stats', null), hs = LS.get(P + 'highscore', 0);
    $('menuStat').innerHTML = st && st.matches ? '🏆 Highscore <b>' + hs + '</b> · Siege <b>' + st.won + '</b>/' + st.matches + ' · KOs <b>' + st.ko + '</b>' : 'Neu hier? Starte mit dem <b>Turnier</b>!';
    $('menuKeys').textContent = PADS.some(p => p && p.on) ? 'Steuerkreuz: wählen · A: OK · B: zurück' : coarse() ? 'Tippe auf ein Feld' : 'Pfeile: wählen · Enter: OK · Esc: zurück';
  }
  function pressStart() { if (cur !== 'sTitle') return; S.unlock(); sfx('ok'); S.music('menu'); toMenu(); }
  $('bPress').onclick = pressStart;
  $('sTitle').addEventListener('pointerdown', e => { if (e.target.closest('a')) return; e.preventDefault(); pressStart(); });
  $('tiles').onclick = e => { const b = e.target.closest('.tile'); if (!b) return; sfx('ok'); const g = b.dataset.go;
    if (g === 'tour') pickFighter('Turnier: Wähle deinen Kämpfer', fid => tourStart(fid));
    else if (g === 'quick') pickFighter('Schnelles Spiel: Wähle deinen Kämpfer', fid => optsScreen('quick', [{ fid, kind: 'human', dev: 'any', name: 'Du' }], () => scr('sFighter')));
    else if (g === 'local') joinOpen();
    else if (g === 'online') hostOpen();
    else if (g === 'roster') rosterOpen();
    else if (g === 'rec') recOpen();
    else if (g === 'opts') optsOpen();
    else if (g === 'help') { helpBack = null; openOv('ovHelp'); } };
  let helpBack = null; $('helpX').onclick = () => { closeOv('ovHelp'); if (helpBack) { const b = helpBack; helpBack = null; b(); } };
  $('helpX').dataset.close = '1';
  function optsOpen(after) {
    $('sSound').checked = SET.sound; $('sMusic').checked = SET.music; $('sVib').checked = SET.vib; $('sTags').checked = SET.tags; $('sLow').checked = SET.low; openOv('ovOpts');
    $('optX').onclick = () => { SET.sound = $('sSound').checked; SET.music = $('sMusic').checked; SET.vib = $('sVib').checked; SET.tags = $('sTags').checked; SET.low = $('sLow').checked; save(); S.sfxOn = SET.sound; S.musicOn = SET.music; if (SET.music) S.music(cur === 'sGame' && !G.paused ? 'fight' : 'menu'); SMScene.tags = SET.tags; closeOv('ovOpts'); if (after) after(); };
  }
  $('optX').dataset.close = '1';
  function rosterOpen() {
    $('roster').innerHTML = F.map(f => '<div class="rcard" style="--c:' + f.col + '"><img src="' + emb(f.id) + '" alt=""><b>' + esc(f.n) + '</b><small>' + esc(f.st) + '</small>' + statBars(f) + '</div>').join('');
    openOv('ovRoster');
  }
  $('rosX').onclick = () => closeOv('ovRoster'); $('rosX').dataset.close = '1';
  const statBars = f => '<div class="bars"><span>Tempo<i style="--v:' + Math.round((f.spd - .8) / .4 * 100) + '%"></i></span><span>Gewicht<i style="--v:' + Math.round((f.mass - .75) / .65 * 100) + '%"></i></span><span>Schubs<i style="--v:' + Math.round((f.dash - .9) / .25 * 100) + '%"></i></span></div>';
  function recOpen() {
    const st = LS.get(P + 'stats', { matches: 0, won: 0, ko: 0, tourBest: 0, tourStage: 0, champ: 0 }), c = (l, v) => '<div><small>' + l + '</small><b>' + v + '</b></div>';
    $('recList').innerHTML = c('Turnier-Highscore', LS.get(P + 'highscore', 0)) + c('Weitester Mast', st.tourStage ? Math.min(5, st.tourStage) + ' / 5' : '–') + c('Turniersiege', st.champ || 0) + c('Matches gewonnen', st.won + ' / ' + st.matches) + c('KOs gesamt', st.ko) + c('Kämpfer', F.length);
    openOv('ovRec');
  }
  $('recX').onclick = () => closeOv('ovRec'); $('recX').dataset.close = '1';

  /* ---------- Kämpferwahl ---------- */
  let pickCb = null, pickSel = SET.fid;
  function pickFighter(title, cb) {
    pickCb = cb; $('fTitle').textContent = title; pickSel = SET.fid;
    $('fGrid').innerHTML = F.map(f => '<button class="fcard" data-f="' + f.id + '" style="--c:' + f.col + '"><img src="' + emb(f.id) + '" alt=""><b>' + esc(f.n.split(' ')[0]) + '</b></button>').join('');
    pickShow(pickSel); scr('sFighter'); setTimeout(() => { const b = $('fGrid').querySelector('[data-f="' + pickSel + '"]'); if (b && !coarse()) b.focus(); }, 0);
    G.fBack = () => toMenu();
  }
  function pickShow(fid) {
    pickSel = fid; const f = SM.fighter(fid);
    $('fGrid').querySelectorAll('.fcard').forEach(b => b.classList.toggle('sel', b.dataset.f === fid));
    $('fInfo').innerHTML = '<img src="' + emb(fid) + '" alt=""><h3 style="color:' + f.col + '">' + esc(f.n) + '</h3><p class="st">für „' + esc(f.st) + '“</p>' + statBars(f);
  }
  $('fGrid').addEventListener('focusin', e => { const b = e.target.closest('.fcard'); if (b) pickShow(b.dataset.f); });
  $('fGrid').onclick = e => { const b = e.target.closest('.fcard'); if (!b) return; if (pickSel === b.dataset.f && !coarse()) $('fGo').click(); else { pickShow(b.dataset.f); sfx('move'); } };
  $('fGo').onclick = () => { SET.fid = pickSel; save(); sfx('ok'); if (pickCb) pickCb(pickSel); };
  $('fBack').onclick = () => G.fBack();

  /* ---------- Match-Optionen ---------- */
  let optHumans = [], optMode = 'quick';
  function chips(el, items, val, on) {
    const fv = el.contains(document.activeElement) ? document.activeElement.dataset.v : null;
    el.innerHTML = items.map(([v, l]) => '<button class="chip' + (String(v) === String(val) ? ' on' : '') + '" data-v="' + v + '">' + l + '</button>').join('');
    if (fv != null) { const b = el.querySelector('[data-v="' + fv + '"]'); if (b) b.focus({ preventScroll: true }); }
    el.onclick = e => { const b = e.target.closest('.chip'); if (!b) return; sfx('move'); on(b.dataset.v); };
  }
  function optsScreen(mode, humans, backFn) {
    optMode = mode; optHumans = humans; G.oBack = backFn || (() => toMenu());
    $('oTitle').textContent = mode === 'online' ? '🌐 Kampf einstellen' : mode === 'local' ? '🎮 Kampf einstellen' : '⚡ Kampf einstellen';
    optsRender(); scr('sOpts');
  }
  function optsRender() {
    const n = optHumans.length, minC = n < 2 ? 1 : 0, maxC = 8 - n; SET.cpu = Math.max(minC, Math.min(maxC, SET.cpu));
    chips($('oArena'), A.map((a, i) => [i, a.n]).concat([['rnd', '🎲 Zufall']]), SET.rnd ? 'rnd' : SET.arena, v => { if (v === 'rnd') SET.rnd = true; else { SET.rnd = false; SET.arena = +v; } optsRender(); });
    $('oArenaInfo').textContent = SET.rnd ? 'Jede Runde ein anderer Mast.' : A[SET.arena].d;
    chips($('oCpu'), Array.from({ length: maxC - minC + 1 }, (_, k) => [k + minC, String(k + minC)]), SET.cpu, v => { SET.cpu = +v; optsRender(); });
    chips($('oDiff'), SM.DIFF.map((d, i) => [i, d.n]), SET.diff, v => { SET.diff = +v; optsRender(); });
    $('oDiffRow').hidden = SET.cpu === 0;
    chips($('oWins'), [[1, '1'], [2, '2'], [3, '3'], [5, '5']], SET.wins, v => { SET.wins = +v; optsRender(); });
    save();
  }
  $('oBack').onclick = () => G.oBack();
  $('oGo').onclick = () => {
    const taken = new Set(optHumans.map(h => h.fid)), pool = F.map(f => f.id).filter(id => !taken.has(id)).sort(() => Math.random() - .5);
    const cpus = Array.from({ length: SET.cpu }, (_, k) => { const fid = pool[k % pool.length]; return { fid, kind: 'cpu', diff: SET.diff, name: SM.fighter(fid).n.split(' ')[0] }; });
    G.tour = null; startMatch({ mode: optMode, arena: SET.rnd ? Math.floor(Math.random() * A.length) : SET.arena, randomArena: SET.rnd, target: SET.wins, players: optHumans.concat(cpus) });
  };

  /* ---------- Turnier ---------- */
  function tourStart(fid) { G.tour = { stage: 0, pts: 0, fid }; stageIntro(); }
  function stageIntro() {
    const T = G.tour, cfg = SM.tourStage(T.stage, T.fid), ar = A[cfg.arena];
    cfg.players[0].name = 'Du'; cfg.players[0].dev = 'any'; cfg.players.slice(1).forEach(p => { p.name = SM.fighter(p.fid).n.split(' ')[0]; });
    $('sgKick').textContent = 'Mast ' + (T.stage + 1) + ' von 5' + (T.pts ? ' · ' + T.pts + ' Punkte' : '');
    $('sgTitle').textContent = ar.n; $('sgInfo').textContent = ar.d + ' Zwei Siege bringen dich weiter.';
    $('sgVs').innerHTML = '<div class="vsMe"><img src="' + emb(T.fid) + '" alt=""><b>Du</b></div><i>VS</i>' + cfg.players.slice(1).map(p => '<div><img src="' + emb(p.fid) + '" alt=""><b>' + esc(SM.fighter(p.fid).n) + '</b><small>' + SM.DIFF[p.diff].n + '</small></div>').join('');
    if (cur !== 'sMenu') { attract(); scr('sMenu'); }
    G.stageCfg = cfg; openOv('ovStage');
  }
  $('sgGo').onclick = () => { closeOv('ovStage'); const c = G.stageCfg; startMatch({ mode: 'tour', arena: c.arena, target: c.target, players: c.players }); };

  /* ---------- Lokal: bis zu 4 Spieler anmelden ---------- */
  const J = { slots: [] };
  function joinOpen() { J.slots = []; joinRender(); scr('sJoin'); }
  function joinFree(start, dir) { const taken = new Set(J.slots.map(s => s.fid)); let k = F.findIndex(f => f.id === start); for (let n = 0; n < F.length; n++) { k = (k + dir + F.length) % F.length; if (!taken.has(F[k].id)) return F[k].id; } return start; }
  function joinAct(dev, act, dir) {
    let s = J.slots.find(x => x.dev === dev);
    if (act === 'dash') { if (!s) { if (J.slots.length >= 4) return; const fid = joinFree(F[(J.slots.length * 2) % F.length].id, 0) || F[0].id; J.slots.push({ dev, fid: J.slots.some(x => x.fid === fid) ? joinFree(fid, 1) : fid, ready: false }); sfx('ok'); } else if (!s.ready) { s.ready = true; sfx('ok'); } }
    else if (act === 'slam' && s) { if (s.ready) s.ready = false; else J.slots.splice(J.slots.indexOf(s), 1); sfx('back'); }
    else if (act === 'move' && s && !s.ready) { s.fid = joinFree(s.fid, dir); sfx('move'); }
    joinRender();
  }
  const DEVN = { kb1: '⌨️ Tastatur links (WASD)', kb2: '⌨️ Tastatur rechts (Pfeile)', pad0: '🎮 Controller 1', pad1: '🎮 Controller 2', pad2: '🎮 Controller 3', pad3: '🎮 Controller 4' };
  function joinRender() {
    $('jSlots').innerHTML = [0, 1, 2, 3].map(k => { const s = J.slots[k]; if (!s) return '<div class="jslot empty"><b>P' + (k + 1) + '</b><span>Schubs-Taste drücken</span></div>'; const f = SM.fighter(s.fid);
      return '<div class="jslot' + (s.ready ? ' ready' : '') + '" style="--c:' + f.col + '"><b>P' + (k + 1) + '</b><img src="' + emb(s.fid) + '" alt=""><strong>' + esc(f.n) + '</strong><small>' + DEVN[s.dev] + '</small><span>' + (s.ready ? '✔ Bereit' : '◀ ▶ wählen · Schubs = bereit') + '</span></div>'; }).join('');
    const ok = J.slots.length && J.slots.every(s => s.ready); $('jGo').disabled = !ok;
    clearTimeout(J.t); if (ok) J.t = setTimeout(() => { if (cur === 'sJoin' && J.slots.every(s => s.ready)) $('jGo').click(); }, 1400);
  }
  function joinKey(c) {
    for (const d of ['kb1', 'kb2']) { const m = KB[d]; if (m.dash.includes(c)) { joinAct(d, 'dash'); return true; } if (m.slam.includes(c)) { joinAct(d, 'slam'); return true; } if (m.l.includes(c)) { joinAct(d, 'move', -1); return true; } if (m.r.includes(c)) { joinAct(d, 'move', 1); return true; } }
    return false;
  }
  function joinPad(i, down, x) { const d = 'pad' + i, st = PADS[i]; if (down(0)) joinAct(d, 'dash'); if (down(1) || down(2)) { if (!J.slots.some(s => s.dev === d)) back(); else joinAct(d, 'slam'); } const mx = Math.abs(x) > .5 ? Math.sign(x) : 0; if (mx && !st.jn) joinAct(d, 'move', mx); st.jn = !!mx; }
  $('jBack').onclick = () => toMenu();
  $('jGo').onclick = () => { clearTimeout(J.t); if (!J.slots.length) return; optsScreen('local', J.slots.map((s, k) => ({ fid: s.fid, kind: 'human', dev: s.dev, name: 'P' + (k + 1) + ' ' + SM.fighter(s.fid).n.split(' ')[0] })), () => { J.slots.forEach(s => { s.ready = false; }); joinRender(); scr('sJoin'); }); };

  /* ---------- Online: Verbindung (PeerJS-kompatibel über ../cloud/fire-peer.js) ---------- */
  function mkNet(cb) {
    const ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789', PRE = 'smsumo-';
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

  /* ---------- Online: großer Bildschirm als Gastgeber ---------- */
  const H = { net: null, players: [], me: false };
  async function hostOpen() {
    H.players = []; H.me = false; scr('sLobby'); lobbyRender(); $('code').textContent = '····'; $('url').textContent = 'Raum wird eröffnet …'; $('qr').textContent = '…';
    if (H.net) H.net.close(); H.net = mkNet({ onMsg: hostMsg, onLeave: peer => { const p = H.players.find(x => x.peer === peer); if (p) { p.on = false; lobbyRender(); } } });
    try {
      const code = await H.net.host(); $('code').textContent = code; $('url').textContent = H.net.link(); keepAwake();
      H.net.loadQR().then(() => { const q = qrcode(0, 'M'); q.addData(H.net.link()); q.make(); $('qr').innerHTML = q.createSvgTag({ cellSize: 4, margin: 0, scalable: true }); }).catch(() => { $('qr').textContent = code; });
    } catch (e) { $('url').textContent = netErr(e); toast(netErr(e)); }
  }
  function hostClose() { if (H.net) { H.net.send({ t: 'bye' }); H.net.close(); } H.net = null; H.players = []; }
  function hostLobby() { G.running = false; attract(); scr('sLobby'); lobbyRender(); S.music('menu'); if (H.net) H.net.send({ t: 'lobby' }); H.players.forEach(p => lobbySend(p)); }
  const freeFid = (except) => { const taken = new Set(H.players.filter(p => p !== except).map(p => p.fid).concat(H.me ? [H.meFid] : [])); return (F.find(f => !taken.has(f.id)) || F[0]).id; };
  function lobbySend(p) { if (H.net && p.on) H.net.sendTo(p.peer, { t: 'wel', name: p.name, fid: p.fid }); }
  function lobbyRender() {
    const on = H.players.filter(p => p.on), n = on.length + (H.me ? 1 : 0);
    $('lobPlayers').innerHTML = (H.me ? '<div class="lp" style="--c:' + SM.fighter(H.meFid).col + '"><img src="' + emb(H.meFid) + '" alt=""><b>Du (hier)</b><small>' + esc(SM.fighter(H.meFid).n) + '</small></div>' : '') +
      (H.players.length ? H.players.map(p => '<div class="lp' + (p.on ? '' : ' off') + '" style="--c:' + SM.fighter(p.fid).col + '"><img src="' + emb(p.fid) + '" alt=""><b>' + esc(p.name) + '</b><small>' + esc(SM.fighter(p.fid).n) + (p.on ? '' : ' · getrennt') + '</small></div>').join('') : '<p class="hint">Noch kein Handy da – scannt den QR-Code!</p>');
    $('lobGo').disabled = n < 1; $('lobGo').textContent = n < 1 ? 'Warte auf Spieler …' : '▶ Weiter (' + n + ' Spieler)';
    $('lobMe').textContent = '🎮 Hier mitspielen: ' + (H.me ? 'an' : 'aus');
  }
  $('lobMe').onclick = () => { H.me = !H.me; if (H.me) H.meFid = freeFid(null); lobbyRender(); };
  $('lobBack').onclick = () => { hostClose(); toMenu(); };
  $('lobGo').onclick = () => {
    const hum = (H.me ? [{ fid: H.meFid, kind: 'human', dev: 'any', name: 'TV' }] : []).concat(H.players.filter(p => p.on).map(p => ({ fid: p.fid, kind: 'human', dev: 'net:' + p.peer, name: p.name })));
    if (!hum.length) return; optsScreen('online', hum, () => hostLobby());
  };
  function hostMsg(peer, d) {
    let p = H.players.find(x => x.peer === peer);
    if (d.t === 'hi') {
      const old = d.cid && H.players.find(x => x.cid === d.cid);
      if (old) { old.peer = peer; old.on = true; p = old; }
      else if (G.running && G.mode === 'online') { H.net.sendTo(peer, { t: 'msg', m: 'Der Kampf läuft gerade – nach dem Match bist du dabei.' }); }
      if (!p && H.players.length + (H.me ? 1 : 0) >= 8) { H.net.sendTo(peer, { t: 'msg', m: 'Der Raum ist voll (8 Spieler).' }); return; }
      if (!p) { let n = String(d.name || '').replace(/[<>]/g, '').trim().slice(0, 12) || 'Gast', base = n, k = 2; while (H.players.some(x => x.name.toLowerCase() === n.toLowerCase())) n = base.slice(0, 9) + ' ' + k++; p = { peer, cid: d.cid, name: n, fid: '', on: true }; p.fid = freeFid(p); H.players.push(p); sfx('ok'); }
      NETIN[peer] = { x: 0, z: 0, d: 0, s: 0, cd: 0, cs: 0 }; lobbySend(p); lobbyRender(); return;
    }
    if (!p) return;
    if (d.t === 'pick' && !(G.running && G.mode === 'online')) { const taken = new Set(H.players.filter(x => x !== p).map(x => x.fid).concat(H.me ? [H.meFid] : [])); let k = F.findIndex(f => f.id === p.fid); for (let n = 0; n < F.length; n++) { k = (k + (d.d > 0 ? 1 : -1) + F.length) % F.length; if (!taken.has(F[k].id)) break; } p.fid = F[k].id; lobbySend(p); lobbyRender(); }
    else if (d.t === 'in') { const n = NETIN[peer] || (NETIN[peer] = { x: 0, z: 0, d: 0, s: 0, cd: 0, cs: 0 }); n.x = Math.max(-1, Math.min(1, +d.x || 0)); n.z = Math.max(-1, Math.min(1, +d.z || 0)); if (d.d > n.d) n.d = d.d; if (d.s > n.s) n.s = d.s; }
  }
  function netTo(i, msg) { const dv = humanDev(i); if (H.net && dv && dv.startsWith('net:')) H.net.sendTo(dv.slice(4), msg); }
  let netT = 0; function netTick(dt) { netT -= dt; if (netT > 0) return; netT = .5; G.M.players.forEach((p, i) => { const f = G.W.f[i]; netTo(i, { t: 'st', alive: f.alive && !f.falling, wins: p.wins, target: G.M.target, round: G.M.round }); }); }

  /* ---------- Handy als Controller ---------- */
  const C = { net: null, cid: LS.get(P + 'cid', '') || Math.random().toString(36).slice(2, 10), d: 0, s: 0, lx: 9, lz: 9, lt: 0, fid: 'toni' };
  LS.set(P + 'cid', C.cid);
  function phoneOpen(code) { G.mode = 'phone'; scr('sPhone'); $('pJoin').hidden = false; $('pPad').hidden = true; $('jCode').value = code || ''; $('jName').value = LS.get(P + 'name', ''); if (!coarse()) setTimeout(() => ($('jName').value ? $('bJoin') : $('jName')).focus(), 50); }
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
    if (d.t === 'wel') { C.fid = d.fid; const f = SM.fighter(d.fid); $('pEmb').src = emb(d.fid); $('pName').textContent = d.name; $('pFighter').textContent = f.n; $('pPad').style.setProperty('--c', f.col); $('pPick').hidden = false; $('pMsg').textContent = 'Wähle deinen Kämpfer – gleich geht\'s los!'; }
    else if (d.t === 'lobby') { $('pPick').hidden = false; $('pMsg').textContent = 'Zurück in der Lobby – Kämpfer wählen.'; }
    else if (d.t === 'st') { $('pPick').hidden = true; $('pWins').textContent = '●'.repeat(d.wins) + '○'.repeat(Math.max(0, d.target - d.wins)); $('pMsg').textContent = d.alive ? 'Runde ' + d.round + ' – schubs sie runter!' : '💫 Du bist runtergefallen – warte auf die nächste Runde.'; $('pPad').classList.toggle('dead', !d.alive); }
    else if (d.t === 'out') { vib([80, 50, 160]); $('pMsg').textContent = '💫 Runtergefallen!'; }
    else if (d.t === 'round') { $('pMsg').textContent = d.win ? '🏆 Runde gewonnen!' : 'Runde vorbei.'; $('pPad').classList.remove('dead'); }
    else if (d.t === 'end') { $('pMsg').textContent = d.win ? '👑 Du hast das Match gewonnen!' : 'Match vorbei – Platz ' + d.place + '.'; }
    else if (d.t === 'vib') vib(d.p);
    else if (d.t === 'msg') $('pMsg').textContent = d.m;
    else if (d.t === 'bye') $('pMsg').textContent = 'Der Gastgeber hat den Raum geschlossen.';
  }
  const PS = { x: 0, z: 0, id: null };
  function phoneSend(force) { if (!C.net) return; const now = performance.now(), x = Math.round(PS.x * 20) / 20, z = Math.round(PS.z * 20) / 20; if (!force && x === C.lx && z === C.lz) return; if (!force && now - C.lt < 45) { clearTimeout(C.tm); C.tm = setTimeout(() => phoneSend(), 50); return; } C.lx = x; C.lz = z; C.lt = now; C.net.send({ t: 'in', x, z, d: C.d, s: C.s }); }
  stick($('pStick').parentElement, $('pStick'), PS, () => phoneSend());
  const pBtn = (el, k) => el.addEventListener('pointerdown', e => { e.preventDefault(); C[k]++; vib(15); el.classList.add('hit'); setTimeout(() => el.classList.remove('hit'), 120); phoneSend(true); });
  pBtn($('pDash'), 'd'); pBtn($('pSlam'), 's');
  setInterval(() => { if (C.net && cur === 'sPhone') phoneSend(true); }, 1000);   // Lebenszeichen, falls etwas verloren ging
  $('pPrev').onclick = () => { if (C.net) C.net.send({ t: 'pick', d: -1 }); }; $('pNext').onclick = () => { if (C.net) C.net.send({ t: 'pick', d: 1 }); };

  /* ---------- Ladebildschirm und Start ---------- */
  if (window.self !== window.top) { $('backLink').hidden = true; $('backLink2').hidden = true; }
  const TIPS = ['Plattform wird auf den Mast gehievt …', 'Sumo-Ringer machen sich warm …', 'Wolken werden aufgeschüttelt …', 'Mawashi wird festgezurrt …'];
  const bar = p => { $('loadBar').style.width = Math.round(p * 100) + '%'; $('loadTip').textContent = TIPS[Math.min(TIPS.length - 1, Math.floor(p * TIPS.length))]; };
  const wait = ms => new Promise(r => setTimeout(r, ms));
  (async function boot() {
    const t0 = performance.now(); bar(.1);
    const q = new URLSearchParams(location.search), jm = /[?#&]join=([A-Za-z0-9]{4})/.exec(location.search + location.hash);
    if (jm) { bar(1); await wait(300); $('sLoad').classList.remove('on'); phoneOpen(jm[1].toUpperCase()); return; }   // Handy als Controller: ohne 3D, spart Akku
    if (!window.THREE) { $('loadTip').textContent = '3D konnte nicht geladen werden – bitte Seite neu laden.'; return; }
    await wait(50); bar(.3);
    try { SMScene.init($('stage'), { low: SET.low }); } catch (e) { $('loadTip').textContent = '3D-Grafik wird auf diesem Gerät nicht unterstützt.'; return; }
    bar(.55); F.forEach(f => emb(f.id)); await wait(30); bar(.75);
    attract(); for (let k = 0; k < 3; k++) SMScene.frame(G.W, 1 / 60, { orbit: true });
    requestAnimationFrame(loop); bar(1);
    await wait(Math.max(0, 1300 - (performance.now() - t0)));
    $('sLoad').classList.add('out'); setTimeout(() => $('sLoad').classList.remove('on', 'out'), 500);
    if (q.has('tv') || (window.EasyGamesKit && EasyGamesKit.isTv && EasyGamesKit.isTv())) { S.unlock(); hostOpen(); }
    else { $('pressTxt').textContent = PADS.some(p => p && p.on) ? 'Drücke A' : coarse() ? 'Tippen zum Starten' : 'Drücke Enter'; scr('sTitle'); }
  })();
  window.SUMO = { state: () => ({ cur, mode: G.mode, round: G.M && G.M.round, phase: G.W && G.W.phase, running: G.running, paused: G.paused, wins: G.M && G.M.players.map(p => p.wins), done: G.M && G.M.done, tour: G.tour }), G, key: (code, down) => { const ev = new KeyboardEvent(down === false ? 'keyup' : 'keydown', { code, bubbles: true }); dispatchEvent(ev); } };
})();
