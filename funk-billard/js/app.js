/* Funk-Billard 3D – App: Ladebildschirm, Titel, Konsolen-Menü, Modi (Gegen CPU in 3 Stärken, Zu zweit, 🌐 Online, Training),
 * Zielen, Kraftbalken, Effet, Ball in der Hand, HUD mit Gruppen, Sieg-/Niederlage-Bildschirm, Rekorde (Rangliste über ../cloud/anmacha-cloud.js).
 * Eingabe: Touch/Maus, Tastatur, Gamecontroller. Physik läuft in festen 1/120-s-Schritten (gleich auf beiden Geräten).
 * Online: fire-peer (PeerJS-kompatibel), jeder auf seinem Gerät; der Stoßende sendet den Stoß und danach den Endstand. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id), P = 'funk-billard-';
  const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } } };
  const SET = Object.assign({ sound: true, music: true, guide: true, vib: true, low: false, name: '' }, LS.get(P + 'settings', {}));
  const saveSet = () => LS.set(P + 'settings', SET);
  const S = window.FBSound, SC = window.FBScene;
  S.sfxOn = SET.sound; S.musicOn = SET.music;
  let toastT = 0; function toast(m) { const t = $('toast'); t.textContent = m; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2400); }
  const vib = ms => { if (SET.vib && navigator.vibrate) try { navigator.vibrate(ms); } catch (e) { } };
  const coarse = () => matchMedia('(pointer: coarse)').matches;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let has3d = false;

  /* ---------- Rekorde ---------- */
  const LV = [{ n: 'Leicht', d: 'Der Computer verfehlt öfter', i: '🙂' }, { n: 'Mittel', d: 'Solider Gegner', i: '😎' }, { n: 'Profi', d: 'Trifft fast alles – mit Rückzieher', i: '🔥' }];
  const ST = Object.assign({ wins: [0, 0, 0], losses: [0, 0, 0], streak: 0, best: 0, duo: 0, online: 0, onlineWins: 0, pots: 0, train: 0 }, LS.get(P + 'stats', {}));
  const saveSt = () => LS.set(P + 'stats', ST);
  const points = () => ST.wins[0] + ST.wins[1] * 2 + ST.wins[2] * 3;
  function menuStat() { $('menuStat').textContent = '🏆 ' + points() + ' Punkte · 🔥 Serie ' + ST.streak; $('cpuInfo').textContent = 'Siege: ' + (ST.wins[0] + ST.wins[1] + ST.wins[2]) + ' · beste Serie ' + ST.best; }
  function showRec() {
    const c = (k, v) => '<div><small>' + k + '</small><b>' + v + '</b></div>';
    $('recList').innerHTML = c('🏆 Punkte', points()) + c('🔥 Beste Serie', ST.best) + LV.map((l, i) => c(l.i + ' ' + l.n, ST.wins[i] + ' : ' + ST.losses[i])).join('') + c('🌐 Online-Siege', ST.onlineWins + ' / ' + ST.online) + c('👥 Duelle zu zweit', ST.duo) + c('🎱 Versenkt', ST.pots);
  }

  /* ---------- Bildschirme und Menü-Navigation ---------- */
  let cur = 'sLoad';
  const BACK = { sMenu: () => scr('sTitle'), sOnline: () => { netClose(); toMenu(); } };
  function scr(id) { document.querySelectorAll('.scr').forEach(s => s.classList.toggle('on', s.id === id)); cur = id; if (has3d) SC.shift = id === 'sMenu' || id === 'sOnline'; setTimeout(focusFirst, 0); }
  const overlays = () => Array.from(document.querySelectorAll('.ov')).filter(o => !o.hidden);
  const root = () => overlays().pop() || $(cur);
  const navEls = () => Array.from(root().querySelectorAll('.nav, input.field')).filter(e => !e.disabled && e.offsetParent !== null);
  function focusFirst() { const els = navEls(); const el = els.find(e => e.classList.contains('pri') || e.classList.contains('hero')) || els[0]; if (el && !coarse() && (cur !== 'sGame' || overlays().length)) try { el.focus({ preventScroll: true }); } catch (e) { } }
  function openOv(id) { $(id).hidden = false; setTimeout(focusFirst, 0); }
  function closeOv(id) { $(id).hidden = true; setTimeout(focusFirst, 0); }
  const closeAllOv = () => document.querySelectorAll('.ov').forEach(o => { o.hidden = true; });
  function moveFocus(dx, dy) {
    const els = navEls(); if (!els.length) return; const a = document.activeElement;
    if (!els.includes(a)) { els[0].focus(); S.sfx('move'); return; }
    const r = a.getBoundingClientRect(), ax = r.left + r.width / 2, ay = r.top + r.height / 2; let best = null, bd = 1e9;
    for (const e of els) { if (e === a) continue; const q = e.getBoundingClientRect(), x = q.left + q.width / 2 - ax, y = q.top + q.height / 2 - ay, along = x * dx + y * dy; if (along <= 4) continue; const d = along + (Math.abs(x * dy) + Math.abs(y * dx)) * 2.2; if (d < bd) { bd = d; best = e; } }
    if (best) { best.focus(); S.sfx('move'); }
  }
  function back() {
    if (!$('spinPick').hidden) { $('spinPick').hidden = true; return; }
    const ov = overlays().pop();
    if (ov) { S.sfx('back'); if (ov.id === 'ovPause') return resume(); if (ov.id === 'ovEnd') return $('eMenu').click(); const x = ov.querySelector('[data-close]'); if (x) return x.click(); return closeOv(ov.id); }
    if (cur === 'sGame') return pause();
    if (BACK[cur]) { S.sfx('back'); BACK[cur](); }
  }

  /* ---------- Spielzustand ---------- */
  const A = { mode: 'attract', G: null, lvl: 1, names: ['Du', 'CPU'], ang: 0, power: 0, charging: false, chDir: 1, spin: 0, strike: null, aiT: 0, aiPlan: null, acc: 0, overT: -1, counted: false, me: 0, first: 0, pending: null, pendT: 0, aimSendT: 0, remote: null };
  const G = () => A.G;
  const playing = () => cur === 'sGame' && !overlays().length && A.G && !A.G.over;
  const local = () => { const g = A.G; if (!g || g.over || A.mode === 'attract') return false; if (A.mode === 'cpu') return g.turn === 0; if (A.mode === 'online') return g.turn === A.me; return true; };
  const dir = () => [Math.cos(A.ang), Math.sin(A.ang)];
  const randSeed = () => (Math.random() * 1e9) >>> 0;
  function aimDefault() {
    const g = A.G; if (!g) return; const c = FB.cue(g);
    if (g.breakShot) { A.ang = 0; return; }
    const t = FB.candidates(g, g.turn)[0];
    if (t) { A.ang = Math.atan2(t.dz, t.dx); return; }
    const b = g.balls.filter(x => !x.in && x.n).sort((p, q) => ((p.x - c.x) ** 2 + (p.z - c.z) ** 2) - ((q.x - c.x) ** 2 + (q.z - c.z) ** 2))[0];
    if (b) A.ang = Math.atan2(b.z - c.z, b.x - c.x);
  }
  function newRound(seed, first) {
    A.G = FB.newGame({ seed, free: A.mode === 'training' }); A.G.turn = first || 0;
    A.power = 0; A.charging = false; A.strike = null; A.aiPlan = null; A.aiT = 1.1; A.acc = 0; A.overT = -1; A.counted = false; A.pending = null; A.remote = null; A.spin = 0; spinUi();
    if (has3d) SC.setGame(A.G); aimDefault(); hud();
  }
  function start(mode, opt) {
    opt = opt || {}; closeAllOv(); $('spinPick').hidden = true;
    A.mode = mode; if (opt.lvl !== undefined) A.lvl = opt.lvl;
    const me = SET.name || 'Du';
    A.names = mode === 'cpu' ? [me, 'CPU ' + LV[A.lvl].i] : mode === 'duo' ? ['Spieler 1', 'Spieler 2'] : mode === 'training' ? [me, ''] : opt.names || [me, 'Gast'];
    A.first = opt.first || 0;
    newRound(opt.seed || randSeed(), A.first);
    $('pl1').hidden = mode === 'training';
    scr('sGame'); if (has3d) SC.setView(SC.view === 'top' ? 'top' : 'aim');
    S.music('game'); hud();
    if (mode === 'training') say('🎯 Training: freies Spiel ohne Regeln');
    else say('Anstoß: ' + A.names[A.G.turn] + (mode === 'online' && A.G.turn === A.me ? ' (du)' : ''));
  }
  function again() {
    if (A.mode === 'online') { if (N.role === 'host') netStart(); else { net({ t: 'again' }); toast('Revanche angefragt …'); } return; }
    A.first = A.mode === 'cpu' ? 0 : 1 - A.first; start(A.mode, { first: A.first });
  }
  function toMenu() { closeAllOv(); A.mode = 'attract'; demo(); scr('sMenu'); menuStat(); S.music('menu'); }
  function pause() { if (cur !== 'sGame') return; openOv('ovPause'); }
  function resume() { closeOv('ovPause'); }
  function demo() { A.mode = 'attract'; A.lvl = 1; newRound(randSeed(), 0); A.aiT = 1.5; if (has3d) SC.setView('follow'); }
  let sayT = 0; function say(m) { A.G && (A.G.msg = m); sayT = 3; hud(); }

  /* ---------- HUD ---------- */
  function hud() {
    const g = A.G; if (!g || cur !== 'sGame') return;
    for (const p of [0, 1]) {
      $('pn' + p).textContent = A.names[p] + (A.mode === 'online' && p === A.me ? ' (du)' : '');
      $('pl' + p).classList.toggle('on', !g.over && g.turn === p && A.mode !== 'training');
      const gr = g.groups[p]; let h = '';
      if (gr) { const nums = gr === 'solid' ? [1, 2, 3, 4, 5, 6, 7] : [9, 10, 11, 12, 13, 14, 15]; h = nums.map(n => '<i class="' + (n > 8 ? 'st' : '') + (ball(g, n).in ? ' gone' : '') + '" style="background-color:' + SC_col(n) + '"></i>').join(''); if (nums.every(n => ball(g, n).in)) h += '<i style="background-color:#111"></i>'; }
      $('pg' + p).innerHTML = h;
    }
    let m = g.msg || '';
    if (sayT <= 0 && !g.over && g.phase === 'aim') m = A.mode === 'training' ? '🎯 Training' : A.mode === 'cpu' ? (g.turn === 1 ? 'CPU ist dran …' : 'Du bist dran') : A.mode === 'online' ? (g.turn === A.me ? 'Du bist dran' : A.names[g.turn] + ' ist dran …') : 'Am Zug: ' + A.names[g.turn];
    $('msg').textContent = m;
    const can = local() && g.phase === 'aim' && !A.strike;
    $('handHint').hidden = !(can && (g.inHand || g.breakShot));
    $('handHint').textContent = g.breakShot ? '✋ Anstoß – Weiße hinter der Linie verschieben' : '✋ Ball in der Hand – Weiße ziehen zum Platzieren';
    $('power').style.opacity = can ? 1 : .35; $('fineL').parentNode.style.opacity = can ? 1 : .35;
    $('powFill').style.height = Math.round(A.power * 100) + '%';
  }
  const COLS = ['#ffffff', '#f5c518', '#1f5fd1', '#d8262c', '#5b2c91', '#f07b16', '#1e8f3e', '#7a2a17', '#111111'];
  const ball = (g, n) => g.balls.find(b => b.n === n);
  const SC_col = n => COLS[n > 8 ? n - 8 : n];
  function spinUi() { $('spinDot').style.transform = 'translateY(' + -A.spin * 10 + 'px)'; $('spinBigDot').style.top = (50 - A.spin * 38) + '%'; }

  /* ---------- Stoß ---------- */
  function strike(power, fromNet) {
    const g = A.G; if (!g || g.phase !== 'aim' || g.over || A.strike) return;
    if (!fromNet && !local() && A.mode !== 'attract' && !(A.mode === 'cpu' && g.turn === 1)) return;
    power = Math.max(.05, Math.min(1, power)); A.strike = { t: 0, power }; A.charging = false;
  }
  function fire() {
    const g = A.G, s = A.strike; A.strike = null; A.power = 0; A.shooter = g.turn;
    const [dx, dz] = dir(), c = FB.cue(g);
    if (A.mode === 'online' && local()) net({ t: 'shot', cx: c.x, cz: c.z, a: A.ang, p: s.power, s: A.spin });
    if (FB.shoot(g, dx, dz, s.power, A.spin)) { S.sfx('strike', s.power); vib(15 + s.power * 25); }
    A.spin = 0; spinUi();
    hud();
  }
  // Ereignisse aus der Physik
  function events() {
    const g = A.G; if (!g) return; const ev = g.ev; g.ev = [];
    const quiet = A.mode === 'attract';
    for (const e of ev) {
      if (quiet) continue;
      if (e.k === 'click') S.sfx('click', e.v);
      else if (e.k === 'rail') S.sfx('rail', e.v);
      else if (e.k === 'pot') { S.sfx('pot'); if (!quiet && e.n) { vib(20); if (A.mode !== 'online' || g.turn === A.me) ST.pots++; } }
      if (e.k === 'foul') { S.sfx('foul'); say('⚠️ Foul: ' + e.why + ' – ' + 'Ball in der Hand: ' + A.names[g.turn]); vib(60); }
      else if (e.k === 'again') { S.sfx('good'); say('👍 Treffer – ' + A.names[g.turn] + ' bleibt dran'); }
      else if (e.k === 'switch') say('↔ Wechsel – jetzt: ' + A.names[g.turn]);
      else if (e.k === 'groups') { say('🎱 ' + A.names[e.p] + ' spielt die ' + (e.g === 'solid' ? 'Vollen (1–7)' : 'Halben (9–15)')); S.sfx('good'); }
      else if (e.k === 'msg') say(e.m);
      else if (e.k === 'over') { say(e.m); A.overT = 1.4; }
      if (e.k === 'end' || e.k === 'over') turnDone();
    }
  }
  function turnDone() {
    const g = A.G;
    if (A.mode === 'online') {
      if (A.shooter === A.me) net({ t: 'sync', s: snap(g) });
      else if (A.pending) { load(A.pending); A.pending = null; }
    }
    if (A.mode === 'training' && !g.balls.some(b => b.n && !b.in)) { toast('🎉 Alle versenkt – neu aufgebaut!'); ST.train++; saveSt(); newRound(randSeed(), 0); }
    A.aiT = A.mode === 'attract' ? 1.2 : .9; A.aiPlan = null; A.remote = null;
    aimDefault(); hud();
  }
  function endGame() {
    const g = A.G; if (A.counted) return; A.counted = true; const w = g.winner;
    let kick = '', title = A.names[w] + ' gewinnt!', sub = g.msg, win = false;
    if (A.mode === 'cpu') { win = w === 0; if (win) { ST.wins[A.lvl]++; ST.streak++; ST.best = Math.max(ST.best, ST.streak); } else { ST.losses[A.lvl]++; ST.streak = 0; } kick = 'Gegen CPU · ' + LV[A.lvl].n; title = win ? '🏆 Gewonnen!' : 'Verloren'; }
    else if (A.mode === 'online') { win = w === A.me; ST.online++; if (win) ST.onlineWins++; kick = '🌐 Online'; title = win ? '🏆 Gewonnen!' : 'Verloren'; }
    else { ST.duo++; kick = 'Zu zweit'; win = true; title = '🏆 ' + A.names[w] + ' gewinnt!'; }
    saveSt();
    if (points() > (LS.get(P + 'highscore', 0) || 0)) LS.set(P + 'highscore', points());
    S.sfx(win ? 'win' : 'lose'); vib(win ? [40, 60, 80] : 120);
    const c = (k, v) => '<div><small>' + k + '</small><b>' + v + '</b></div>';
    $('eKick').textContent = kick; $('eTitle').textContent = title; $('eSub').textContent = sub;
    $('eStats').innerHTML = [0, 1].map(p => c(esc(A.names[p]) + ' · Stöße', g.shots[p]) + c(esc(A.names[p]) + ' · versenkt', g.potted[p].length)).join('') + (A.mode === 'cpu' ? c('🏆 Punkte', points()) + c('🔥 Serie', ST.streak) : '');
    $('eAgain').textContent = A.mode === 'online' && N.role !== 'host' ? '↻ Revanche anfragen' : '↻ Revanche';
    openOv('ovEnd');
  }

  /* ---------- Computer ---------- */
  function aiTick(dt) {
    const g = A.G; if (!g || g.phase !== 'aim' || g.over || A.strike) return;
    const isAi = A.mode === 'attract' || (A.mode === 'cpu' && g.turn === 1); if (!isAi) return;
    if (!A.aiPlan) { A.aiT -= dt; if (A.aiT > 0) return; const lvl = A.mode === 'attract' ? 1 : A.lvl, m = FB.ai(g, lvl); A.aiPlan = { to: Math.atan2(m.dz, m.dx), from: A.ang, power: m.power, spin: m.spin, t: 0 }; let d = A.aiPlan.to - A.aiPlan.from; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; A.aiPlan.d = d; return; }
    const p = A.aiPlan; p.t += dt;
    const k = Math.min(1, p.t / .7), e = k * k * (3 - 2 * k); A.ang = p.from + p.d * e;
    if (p.t > .75) { A.spin = p.spin; A.power = Math.min(p.power, (p.t - .75) * 2); if (A.power >= p.power - 1e-6) { A.aiPlan = null; strike(p.power, true); } }
  }

  /* ---------- Schleife ---------- */
  const STEP = 1 / 120;
  let last = performance.now();
  function loop(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    pollPads(dt);
    const g = A.G, paused = cur === 'sGame' && overlays().some(o => o.id === 'ovPause');
    if (g && !paused) {
      if (g.phase === 'aim') {
        keysAim(dt);
        if (A.charging) { A.power += A.chDir * dt / 1.3; if (A.power >= 1) { A.power = 1; A.chDir = -1; } if (A.power <= 0) { A.power = 0; A.chDir = 1; } }
        if (A.strike) { A.strike.t += dt; if (A.strike.t >= .09) fire(); }
        aiTick(dt);
        if (A.mode === 'online' && local()) { A.aimSendT -= dt; if (A.aimSendT <= 0) { A.aimSendT = .1; const c = FB.cue(g); net({ t: 'aim', a: A.ang, p: A.power, cx: c.x, cz: c.z }); } }
      }
      if (g.phase === 'roll') { A.acc += dt; let n = 0; while (A.acc >= STEP && n < 8) { A.acc -= STEP; n++; FB.step(g, STEP); if (g.phase !== 'roll') break; } if (g.phase !== 'roll') A.acc = 0; }
      events();
      if (A.pending && g.phase !== 'roll') { load(A.pending); A.pending = null; }
      if (A.pending && (A.pendT += dt) > 4) { load(A.pending); A.pending = null; }
      if (A.overT > 0 && (A.overT -= dt) <= 0) endGame();
      if (sayT > 0 && (sayT -= dt) <= 0) hud();
      if (cur === 'sGame' && g.phase === 'aim') $('powFill').style.height = Math.round(A.power * 100) + '%';
    }
    if (has3d) {
      const show = g && g.phase === 'aim' && !g.over;
      const st = A.strike ? -A.strike.t / .09 * (.03 + A.strike.power * .32) : 0;
      SC.update(dt, show ? { dir: dir(), power: A.strike ? A.strike.power : A.power, guide: A.mode === 'attract' ? false : SET.guide && (local() || A.mode === 'online'), inHand: local() && (g.inHand || g.breakShot), shotAnim: st } : null);
    }
    requestAnimationFrame(loop);
  }

  /* ---------- Eingabe: Tastatur ---------- */
  const K = {};
  function keysAim(dt) {
    if (!playing() || !local() || A.strike) return; const g = A.G;
    const sp = K.ShiftLeft || K.ShiftRight ? .12 : 1.1;
    if (K.ArrowLeft) A.ang -= sp * dt; if (K.ArrowRight) A.ang += sp * dt;
    if (g.inHand || g.breakShot) { const mx = (K.KeyD ? 1 : 0) - (K.KeyA ? 1 : 0), mz = (K.KeyS ? 1 : 0) - (K.KeyW ? 1 : 0); if (mx || mz) moveCue(mx * .5 * dt, mz * .5 * dt); }
  }
  function moveCue(dx, dz) { const g = A.G, c = FB.cue(g); FB.place(g, c.x + dx, c.z + dz); }
  addEventListener('keydown', e => {
    document.body.classList.add('kbd'); const c = e.code; K[c] = true;
    if (c === 'Escape' || (c === 'KeyP' && cur === 'sGame' && !overlays().length)) { e.preventDefault(); back(); return; }
    if (cur === 'sGame' && !overlays().length) {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(c)) e.preventDefault();
      if (e.repeat) return;
      if (c === 'Space' || c === 'Enter') { if (local() && A.G.phase === 'aim' && !A.strike) { A.charging = true; A.power = 0; A.chDir = 1; } return; }
      if (c === 'ArrowUp') { A.spin = Math.min(1, +(A.spin + .25).toFixed(2)); spinUi(); return; }
      if (c === 'ArrowDown') { A.spin = Math.max(-1, +(A.spin - .25).toFixed(2)); spinUi(); return; }
      if (c === 'KeyV') return toggleView();
      return;
    }
    if (e.target && e.target.tagName === 'INPUT' && !['ArrowUp', 'ArrowDown', 'Enter'].includes(c)) return;
    if (cur === 'sTitle' && !overlays().length && !e.repeat) { e.preventDefault(); pressStart(); return; }
    const d = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[c];
    if (d) { e.preventDefault(); moveFocus(d[0], d[1]); }
  });
  addEventListener('keyup', e => { K[e.code] = false; if ((e.code === 'Space' || e.code === 'Enter') && A.charging) { A.charging = false; if (A.power > .03) strike(A.power); else A.power = 0; } });
  addEventListener('blur', () => { for (const k in K) K[k] = false; A.charging = false; });
  addEventListener('pointerdown', () => document.body.classList.remove('kbd'), true);

  /* ---------- Eingabe: Touch / Maus ---------- */
  const PT = { id: null, x: 0, mode: '', ang: 0 };
  const zone = $('aimZone');
  zone.addEventListener('pointerdown', e => {
    if (!playing() || !local() || A.strike || A.G.phase !== 'aim' || PT.id !== null) return;
    e.preventDefault(); try { zone.setPointerCapture(e.pointerId); } catch (x) { }
    const g = A.G, c = FB.cue(g), p = has3d ? SC.pick(e.clientX, e.clientY) : null;
    PT.id = e.pointerId; PT.x = e.clientX; PT.ang = A.ang;
    if ((g.inHand || g.breakShot) && p && Math.hypot(p.x - c.x, p.z - c.z) < .09) PT.mode = 'place';
    else if (has3d && SC.view === 'top') { PT.mode = 'point'; pointAt(p); }
    else PT.mode = 'turn';
  });
  zone.addEventListener('pointermove', e => {
    if (e.pointerId !== PT.id) return; const g = A.G;
    if (PT.mode === 'place') { const p = SC.pick(e.clientX, e.clientY); if (p) FB.place(g, p.x, p.z); }
    else if (PT.mode === 'point') pointAt(SC.pick(e.clientX, e.clientY));
    else if (PT.mode === 'turn') { const dx = e.clientX - PT.x; A.ang = PT.ang + dx / Math.max(320, innerWidth) * 2.4; }
  });
  const ptEnd = e => { if (e.pointerId === PT.id) { PT.id = null; PT.mode = ''; } };
  zone.addEventListener('pointerup', ptEnd); zone.addEventListener('pointercancel', ptEnd); zone.addEventListener('lostpointercapture', ptEnd);
  function pointAt(p) { if (!p) return; const c = FB.cue(A.G), dx = p.x - c.x, dz = p.z - c.z; if (dx * dx + dz * dz > 1e-4) A.ang = Math.atan2(dz, dx); }
  // Feindrehung (gedrückt halten)
  let fine = 0; for (const [id, s] of [['fineL', -1], ['fineR', 1]]) { const b = $(id); b.addEventListener('pointerdown', e => { e.preventDefault(); fine = s; }); for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) b.addEventListener(ev, () => { fine = 0; }); }
  setInterval(() => { if (fine && playing() && local() && !A.strike) A.ang += fine * .004; }, 16);
  // Kraftbalken: nach unten ziehen, loslassen = Stoß
  const pw = $('power'); let pwId = null;
  const pwSet = e => { const r = pw.getBoundingClientRect(); A.power = Math.max(0, Math.min(1, (e.clientY - r.top - 6) / (r.height - 30))); };
  pw.addEventListener('pointerdown', e => { if (!playing() || !local() || A.strike || A.G.phase !== 'aim') return; e.preventDefault(); pwId = e.pointerId; try { pw.setPointerCapture(e.pointerId); } catch (x) { } pwSet(e); });
  pw.addEventListener('pointermove', e => { if (e.pointerId === pwId) pwSet(e); });
  pw.addEventListener('pointerup', e => { if (e.pointerId !== pwId) return; pwId = null; if (A.power > .04) strike(A.power); else A.power = 0; });
  pw.addEventListener('pointercancel', () => { pwId = null; A.power = 0; });
  // Effet
  $('bSpin').onclick = () => { $('spinPick').hidden = !$('spinPick').hidden; };
  const sb = $('spinBig'); let sbId = null;
  const sbSet = e => { const r = sb.getBoundingClientRect(); A.spin = Math.max(-1, Math.min(1, -((e.clientY - r.top) / r.height - .5) / .38)); if (Math.abs(A.spin) < .12) A.spin = 0; spinUi(); };
  sb.addEventListener('pointerdown', e => { e.preventDefault(); sbId = e.pointerId; try { sb.setPointerCapture(e.pointerId); } catch (x) { } sbSet(e); });
  sb.addEventListener('pointermove', e => { if (e.pointerId === sbId) sbSet(e); });
  sb.addEventListener('pointerup', () => { sbId = null; setTimeout(() => { $('spinPick').hidden = true; }, 250); });
  function toggleView() { if (!has3d) return; SC.setView(SC.view === 'top' ? 'aim' : 'top'); S.sfx('move'); toast(SC.view === 'top' ? '👁 Draufsicht – tippe, wohin du zielen willst' : '👁 Queue-Ansicht'); }
  $('bView').onclick = toggleView; $('bPause').onclick = pause;

  /* ---------- Eingabe: Gamecontroller ---------- */
  const PAD = { b: [], dir: null }; let padNavT = 0;
  function pollPads(dt) {
    let list = []; try { list = navigator.getGamepads ? Array.from(navigator.getGamepads()) : []; } catch (e) { }
    const gp = list.find(p => p && p.connected); if (!gp) return;
    const ax = gp.axes || [], bt = gp.buttons || [], pr = k => !!(bt[k] && (bt[k].pressed || bt[k].value > .5));
    const now = []; for (let k = 0; k < 17; k++) now[k] = pr(k); const down = k => now[k] && !PAD.b[k], up = k => !now[k] && PAD.b[k];
    const dz = v => Math.abs(v) < .18 ? 0 : v;
    if (playing()) {
      document.body.classList.remove('kbd');
      if (local() && A.G.phase === 'aim' && !A.strike) {
        const sx = dz(ax[0] || 0); A.ang += Math.sign(sx) * sx * sx * 1.6 * dt;
        if (now[4]) A.ang -= .12 * dt; if (now[5]) A.ang += .12 * dt;
        const g = A.G; if (g.inHand || g.breakShot) { let mx = dz(ax[2] || 0), mz = dz(ax[3] || 0); if (now[14]) mx = -1; if (now[15]) mx = 1; if (now[12]) mz = -1; if (now[13]) mz = 1; if (mx || mz) moveCue(mx * .5 * dt, mz * .5 * dt); }
        if (down(0)) { A.charging = true; A.power = 0; A.chDir = 1; }
        if (up(0) && A.charging) { A.charging = false; if (A.power > .03) strike(A.power); else A.power = 0; }
        if (down(2)) { A.spin = A.spin === 0 ? .6 : A.spin > 0 ? -.6 : 0; spinUi(); toast(A.spin > 0 ? '🎱 Nachläufer' : A.spin < 0 ? '🎱 Rückzieher' : '🎱 Kein Effet'); }
      }
      if (down(3)) toggleView();
      if (down(9) || down(1)) pause();
    } else {
      let x = Math.abs(ax[0]) > .5 ? Math.sign(ax[0]) : 0, z = Math.abs(ax[1]) > .5 ? Math.sign(ax[1]) : 0;
      if (now[14]) x = -1; if (now[15]) x = 1; if (now[12]) z = -1; if (now[13]) z = 1;
      const d = x || z ? (Math.abs(x) >= Math.abs(z) ? [x, 0] : [0, z]) : null, key = d ? d.join() : null;
      document.body.classList.add('kbd');
      if (d && (key !== PAD.dir || padNavT <= 0)) { moveFocus(d[0], d[1]); padNavT = key !== PAD.dir ? .35 : .14; }
      PAD.dir = key;
      if (down(0)) { if (cur === 'sTitle' && !overlays().length) pressStart(); else { const a = document.activeElement; if (a && a !== document.body && a.click) a.click(); else focusFirst(); } }
      if (down(1)) back();
      if (down(9)) { if (cur === 'sTitle') pressStart(); else if (overlays().some(o => o.id === 'ovPause')) resume(); }
    }
    PAD.b = now; padNavT -= dt;
  }
  addEventListener('gamepadconnected', () => { toast('🎮 Controller verbunden'); $('pressTxt').textContent = 'Drücke A'; });

  /* ---------- Menü ---------- */
  function pressStart() { if (cur !== 'sTitle') return; S.unlock(); S.sfx('ok'); toMenu(); }
  $('bPress').onclick = pressStart;
  $('sTitle').addEventListener('click', e => { if (e.target.closest('a')) return; pressStart(); });
  $('diffBtns').innerHTML = LV.map((l, i) => '<button class="btn nav' + (i === 1 ? ' pri' : '') + '" data-lv="' + i + '">' + l.i + ' ' + l.n + ' <small style="opacity:.75;font-weight:600">· ' + l.d + '</small></button>').join('');
  $('diffBtns').querySelectorAll('[data-lv]').forEach(b => { b.onclick = () => { S.sfx('ok'); start('cpu', { lvl: +b.dataset.lv }); }; });
  $('diffX').onclick = () => closeOv('ovDiff');
  document.querySelectorAll('#tiles [data-go]').forEach(t => {
    t.onclick = () => {
      S.unlock(); S.sfx('ok'); const g = t.dataset.go;
      if (g === 'cpu') openOv('ovDiff');
      else if (g === 'duo') start('duo');
      else if (g === 'training') start('training');
      else if (g === 'online') openOnline();
      else if (g === 'rec') { showRec(); openOv('ovRec'); }
      else if (g === 'opts') openOv('ovOpts');
      else if (g === 'help') openOv('ovHelp');
    };
  });
  $('recX').onclick = () => closeOv('ovRec'); $('helpX').onclick = () => closeOv('ovHelp'); $('optX').onclick = () => closeOv('ovOpts');
  const OPT = { sSound: 'sound', sMusic: 'music', sGuide: 'guide', sVib: 'vib', sLow: 'low' };
  for (const id in OPT) { const el = $(id); el.checked = !!SET[OPT[id]]; el.onchange = () => { SET[OPT[id]] = el.checked; saveSet(); S.sfxOn = SET.sound; S.musicOn = SET.music; if (SET.music) S.music(cur === 'sGame' ? 'game' : 'menu'); if (id === 'sLow') toast('Gilt nach dem nächsten Neustart'); }; }
  $('pGo').onclick = resume;
  $('pRestart').onclick = () => { if (A.mode === 'online') { closeOv('ovPause'); return toast('Online geht das nur über die Revanche'); } start(A.mode, { first: A.first }); };
  $('pOpts').onclick = () => openOv('ovOpts'); $('pHelp').onclick = () => openOv('ovHelp');
  $('pQuit').onclick = () => { if (A.mode === 'online') { net({ t: 'bye' }); netClose(); } toMenu(); };
  $('eAgain').onclick = () => { S.sfx('ok'); closeOv('ovEnd'); again(); };
  $('eMenu').onclick = () => { if (A.mode === 'online') { net({ t: 'bye' }); netClose(); } toMenu(); };
  const KEYS = 'Pfeile + Enter: wählen · Esc: zurück';
  $('menuKeys').textContent = KEYS;

  /* ---------- Online (fire-peer / PeerJS) ---------- */
  const N = { role: '', code: '', peer: null, conn: null }; const libs = {};
  const ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789', PRE = 'funkbill-';
  const loadLib = (src, ok) => libs[src] || (libs[src] = new Promise((res, rej) => { if (ok()) return res(); const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => { delete libs[src]; rej(new Error('lib')); }; document.head.appendChild(s); }));
  const norm = s => Array.from(String(s || '').toUpperCase()).filter(c => ALPHA.includes(c)).join('').slice(0, 4);
  const link = () => { const u = location.href.split('#')[0].split('?')[0] + '?join=' + N.code; return window.EasyGamesLink ? EasyGamesLink.share(u) : u; };
  const netErr = e => ({ nocode: 'Diesen Raum gibt es nicht (mehr). Stimmt der Code?', timeout: 'Keine Verbindung – bitte nochmal versuchen.', code: 'Bitte den 4-stelligen Code eingeben.' }[e && e.message] || 'Online ist gerade nicht erreichbar. Prüfe das Internet und versuche es nochmal.');
  function net(d) { const c = N.conn; if (c && c.open) { try { c.send(d); } catch (e) { } } }
  function netClose() { try { if (N.conn) N.conn.close(); } catch (e) { } try { if (N.peer) N.peer.destroy(); } catch (e) { } N.conn = N.peer = null; N.role = N.code = ''; $('hostBox').hidden = true; }
  function bind(conn, onOpen) {
    conn.on('open', () => { N.conn = conn; if (onOpen) onOpen(); });
    conn.on('data', d => { if (d && typeof d === 'object') onMsg(d); });
    const gone = () => { if (N.conn !== conn) return; N.conn = null; if (A.mode === 'online') { toast('📴 Gegner hat das Spiel verlassen'); netClose(); toMenu(); } };
    conn.on('close', gone); conn.on('error', gone);
  }
  function openOnline() { $('oName').value = SET.name || ''; $('oMsg').textContent = ''; scr('sOnline'); }
  const myName = () => { const n = ($('oName').value || '').trim().slice(0, 12); SET.name = n; saveSet(); return n || 'Spieler'; };
  $('oHost').onclick = async () => {
    myName(); $('oMsg').textContent = 'Raum wird eröffnet …'; netClose();
    try {
      await loadLib('../vendor/peerjs-1.5.4.min.js', () => !!window.Peer);
      for (let k = 0; k < 6 && !N.peer; k++) {
        let code = ''; for (let i = 0; i < 4; i++) code += ALPHA[(Math.random() * ALPHA.length) | 0];
        const ok = await new Promise(res => { const p = new Peer(PRE + code); let done = false;
          p.on('open', () => { done = true; N.peer = p; N.code = code; N.role = 'host'; res(true); });
          p.on('error', e => { if (!done) { done = true; try { p.destroy(); } catch (x) { } res(e && e.type === 'unavailable-id' ? false : 'err'); } }); });
        if (ok === 'err') throw new Error('broker');
      }
      if (!N.peer) throw new Error('code');
      N.peer.on('connection', c => { if (N.conn && N.conn.open) { try { c.close(); } catch (e) { } return; } bind(c); });
      N.peer.on('disconnected', () => { try { N.peer.reconnect(); } catch (e) { } });
      $('code').textContent = N.code; $('url').textContent = link(); $('hostBox').hidden = false; $('oMsg').textContent = ''; $('hostMsg').textContent = 'Warte auf deinen Gegner …';
      try { await loadLib('../vendor/qrcode-generator-1.4.4.js', () => !!window.qrcode); const q = qrcode(0, 'M'); q.addData(link()); q.make(); $('qr').innerHTML = q.createSvgTag({ cellSize: 4, margin: 0, scalable: true }); } catch (e) { $('qr').textContent = N.code; }
    } catch (e) { $('oMsg').textContent = netErr(e); netClose(); }
  };
  async function join(code) {
    code = norm(code); if (code.length !== 4) { $('oMsg').textContent = netErr(new Error('code')); return; }
    myName(); $('oMsg').textContent = 'Verbinde …'; netClose();
    try {
      await loadLib('../vendor/peerjs-1.5.4.min.js', () => !!window.Peer);
      await new Promise((res, rej) => { const p = new Peer(); let done = false; const fail = m => { if (done) return; done = true; try { p.destroy(); } catch (x) { } rej(new Error(m)); }; setTimeout(() => fail('timeout'), 14000);
        p.on('error', e => { if (!done) fail(e && e.type === 'peer-unavailable' ? 'nocode' : 'broker'); });
        p.on('open', () => { N.peer = p; N.role = 'guest'; N.code = code; bind(p.connect(PRE + code, { reliable: true }), () => { if (done) return; done = true; res(); }); }); });
      $('oMsg').textContent = 'Verbunden – gleich geht’s los …'; net({ t: 'hello', name: SET.name || 'Gast' });
    } catch (e) { $('oMsg').textContent = netErr(e); netClose(); }
  }
  $('oJoin').onclick = () => join($('oCode').value);
  $('oCode').addEventListener('keydown', e => { if (e.key === 'Enter') join($('oCode').value); });
  $('oBack').onclick = () => { netClose(); toMenu(); };
  function netStart() { A.first = A.mode === 'online' && A.counted ? 1 - A.first : 0; const seed = randSeed(), names = [SET.name || 'Gastgeber', N.guestName || 'Gast']; A.me = 0; net({ t: 'start', seed, first: A.first, names }); start('online', { seed, first: A.first, names }); }
  const total = g => g.shots[0] + g.shots[1];
  function snap(g) { return { k: total(g), balls: g.balls.map(b => [b.n, b.x, b.z, b.in ? 1 : 0]), turn: g.turn, groups: g.groups, breakShot: g.breakShot, inHand: g.inHand, inHandKitchen: g.inHandKitchen, over: g.over, winner: g.winner, shots: g.shots, potted: g.potted, msg: g.msg }; }
  function load(s) {
    const g = A.G; if (!g) return;
    for (const [n, x, z, i] of s.balls) { const b = ball(g, n); b.x = x; b.z = z; b.in = !!i; b.vx = b.vz = 0; }
    const wasOver = g.over;
    Object.assign(g, { turn: s.turn, groups: s.groups, breakShot: s.breakShot, inHand: s.inHand, inHandKitchen: s.inHandKitchen, over: s.over, winner: s.winner, shots: s.shots, potted: s.potted, msg: s.msg, phase: s.over ? 'over' : 'aim', shot: null });
    if (s.over && !wasOver && A.overT < 0 && !A.counted) A.overT = 1.2;
    aimDefault(); hud();
  }
  function onMsg(d) {
    if (d.t === 'hello' && N.role === 'host') { N.guestName = String(d.name || 'Gast').slice(0, 12); $('hostMsg').textContent = '✅ ' + N.guestName + ' ist da!'; setTimeout(netStart, 500); }
    else if (d.t === 'start' && N.role === 'guest') { A.me = 1; A.first = d.first; start('online', { seed: d.seed, first: d.first, names: d.names }); A.me = 1; hud(); }
    else if (d.t === 'again' && N.role === 'host') { closeAllOv(); netStart(); }
    else if (d.t === 'bye') { if (A.mode === 'online') { toast('📴 Gegner hat das Spiel verlassen'); netClose(); toMenu(); } }
    else if (A.mode !== 'online' || !A.G) return;
    else if (d.t === 'aim' && !local() && A.G.phase === 'aim') { A.ang = d.a; A.power = d.p; const c = FB.cue(A.G); if (Math.abs(c.x - d.cx) + Math.abs(c.z - d.cz) > 1e-6) FB.place(A.G, d.cx, d.cz) || (c.x = d.cx, c.z = d.cz); }
    else if (d.t === 'shot' && !local() && A.G.phase === 'aim') { const c = FB.cue(A.G); c.x = d.cx; c.z = d.cz; c.in = false; A.ang = d.a; A.spin = d.s; A.shooter = A.G.turn; strike(d.p, true); }
    else if (d.t === 'sync') { if (d.s.k !== total(A.G)) return; if (A.G.phase === 'roll' || A.strike) { A.pending = d.s; A.pendT = 0; } else load(d.s); }
  }

  /* ---------- Laden ---------- */
  const TIPS = ['Queues werden gekreidet …', 'Kugeln werden poliert …', 'Funk-Platte aufgelegt …', 'Neonlicht an …'];
  const bar = p => { $('loadBar').style.width = Math.round(p * 100) + '%'; $('loadTip').textContent = TIPS[Math.min(TIPS.length - 1, Math.floor(p * TIPS.length))]; };
  const wait = ms => new Promise(r => setTimeout(r, ms));
  (async function boot() {
    const t0 = performance.now(); bar(.15); await wait(60);
    try { if (!window.THREE) throw new Error('three'); SC.init($('stage'), { low: SET.low }); has3d = true; } catch (e) { has3d = false; console.warn('3D nicht verfügbar', e); }
    bar(.6); await wait(40); demo(); bar(.9);
    requestAnimationFrame(loop); bar(1);
    await wait(Math.max(0, 1100 - (performance.now() - t0)));
    $('sLoad').classList.add('out'); setTimeout(() => { $('sLoad').classList.remove('on', 'out'); }, 460);
    if (!has3d) toast('3D wird auf diesem Gerät nicht unterstützt.');
    if (navigator.getGamepads && Array.from(navigator.getGamepads() || []).some(Boolean)) $('pressTxt').textContent = 'Drücke A';
    const q = new URLSearchParams(location.search), jc = norm(q.get('join'));
    if (jc.length === 4) { toMenu(); openOnline(); $('oCode').value = jc; join(jc); }
    else if (q.get('mode') && ['cpu', 'duo', 'training'].includes(q.get('mode'))) { S.unlock(); start(q.get('mode'), { lvl: Math.max(0, Math.min(2, +q.get('lvl') || 1)) }); }
    else scr('sTitle');
  })();
  window.FBApp = { A, start, strike, toMenu, again, net: N, get cur() { return cur; }, endGame, load, snap, pause };
})();
