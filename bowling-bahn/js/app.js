/* Bowling-Bahn 3D – App: Ladebildschirm, Titel, Konsolen-Menü, Einzelspiel (Rangliste), Gegen CPU (3 Stärken), Party (2–4 Spieler, auch CPU),
 * Bowler-Auswahl aus allen EASYCLASH-Helden, Anzeigetafel mit echter Zählweise, Strike/Spare-Jubel, Ergebnis-Bildschirm, Rekorde.
 * Eingabe: Wischen (Touch/Maus), Tastatur, Gamecontroller. Physik: js/core.js (BW) in festen 1/120-s-Schritten. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id), P = 'bowling-bahn-';
  const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } } };
  const ROSTER = window.EC_ROSTER || [];
  const SET = Object.assign({ sound: true, music: true, guide: true, long: false, vib: true, low: false, fig: 'rico', party: null }, LS.get(P + 'settings', {}));
  const saveSet = () => LS.set(P + 'settings', SET);
  const S = window.BWSound, SC = window.BWScene;
  S.sfxOn = SET.sound; S.musicOn = SET.music;
  let toastT = 0; function toast(m) { const t = $('toast'); t.textContent = m; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2400); }
  const vib = ms => { if (SET.vib && navigator.vibrate) try { navigator.vibrate(ms); } catch (e) { } };
  const coarse = () => matchMedia('(pointer: coarse)').matches;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fig = id => ROSTER.find(c => c.id === id) || ROSTER[0];
  const rndFig = not => { const l = ROSTER.filter(c => !not || !not.includes(c.id)); return l[Math.floor(Math.random() * l.length)] || ROSTER[0]; };
  let has3d = false;
  const LV = [{ n: 'Leicht', i: '🙂', d: 'Trifft öfter daneben' }, { n: 'Mittel', i: '😎', d: 'Solider Kegler' }, { n: 'Profi', i: '🔥', d: 'Wirft Strike um Strike' }];

  /* ---------- Rekorde ---------- */
  const ST = Object.assign({ games: 0, best: 0, sum: 0, strikes: 0, spares: 0, gutters: 0, cpuWins: [0, 0, 0], perfect: 0, bestStreak: 0 }, LS.get(P + 'stats', {}));
  const saveSt = () => LS.set(P + 'stats', ST);
  function menuStat() { $('menuStat').textContent = '🏆 Rekord ' + (LS.get(P + 'highscore', 0) || 0) + ' · ❌ Strikes ' + ST.strikes; $('soloInfo').textContent = ST.games ? 'Schnitt ' + Math.round(ST.sum / ST.games) + ' · Rekord ' + ST.best : '10 Frames – knack deinen Rekord'; $('figInfo').textContent = fig(SET.fig) ? fig(SET.fig).n : 'Wähle deinen Helden'; }
  function showRec() {
    const c = (k, v) => '<div><small>' + k + '</small><b>' + v + '</b></div>';
    $('recList').innerHTML = c('🏆 Bestes Spiel', LS.get(P + 'highscore', 0) || 0) + c('Ø Schnitt', ST.games ? Math.round(ST.sum / ST.games) : '–') + c('🎳 Spiele', ST.games) + c('❌ Strikes', ST.strikes) + c('／ Spares', ST.spares) + c('🔥 Strikes am Stück', ST.bestStreak) + LV.map((l, i) => c(l.i + ' CPU ' + l.n + ' besiegt', ST.cpuWins[i])).join('') + c('💯 Perfekte Spiele', ST.perfect);
  }

  /* ---------- Bildschirme und Menü-Navigation ---------- */
  let cur = 'sLoad';
  const BACK = { sMenu: () => scr('sTitle'), sFig: () => toMenu(), sSetup: () => toMenu() };
  function scr(id) { document.querySelectorAll('.scr').forEach(s => s.classList.toggle('on', s.id === id)); cur = id; if (has3d) SC.mode = id === 'sGame' ? 'game' : id === 'sFig' ? 'select' : 'menu'; setTimeout(focusFirst, 0); }
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
    const ov = overlays().pop();
    if (ov) { S.sfx('back'); if (ov.id === 'ovPause') return resume(); if (ov.id === 'ovEnd') return $('eMenu').click(); const x = ov.querySelector('[data-close]'); if (x) return x.click(); return closeOv(ov.id); }
    if (cur === 'sGame') return pause();
    if (BACK[cur]) { S.sfx('back'); BACK[cur](); }
  }

  /* ---------- Spielzustand ---------- */
  // phase: aim → walk → swing → roll → show → (aim | over)
  const A = { mode: 'attract', G: null, L: null, phase: 'aim', t: 0, aim: { x: 0, angle: 0, spin: 0 }, power: 0, charging: false, chDir: 1, acc: 0, cpu: null, before: 0, standBefore: 10, mood: '', streak: [], counted: false, pend: null, speed: 1 };
  const curP = () => A.G && A.G.players[A.G.cur];
  const isCpu = () => !!(curP() && curP().cpu != null) || A.mode === 'attract';
  const canAim = () => cur === 'sGame' && !overlays().length && A.phase === 'aim' && !isCpu() && A.G && !A.G.over;
  const downN = L => L.pins.filter(p => p.down || p.gone).length;
  function start(mode, players) {
    closeAllOv(); A.mode = mode; A.G = BW.newGame(players); A.L = BW.newLane(); A.counted = false; A.streak = players.map(() => 0);
    if (has3d) SC.setLane(A.L);
    scr('sGame'); S.music('game'); turnStart(); board();
  }
  function players(mode, lvl) {
    const me = { name: 'Du', fig: SET.fig };
    if (mode === 'solo') return [me];
    if (mode === 'cpu') return [me, { name: 'CPU ' + LV[lvl].i, fig: rndFig([SET.fig]).id, cpu: lvl }];
    return party.map((s, i) => ({ name: s.name || 'Spieler ' + (i + 1), fig: s.fig, cpu: s.cpu }));
  }
  let lastStart = null;
  function go(mode, lvl) { lastStart = { mode, lvl }; start(mode, players(mode, lvl)); }
  function turnStart() {
    const p = curP(); A.phase = 'aim'; A.t = 0; A.power = 0; A.charging = false; A.mood = ''; A.cpu = null; A.pend = null;
    A.aim = Object.assign({ x: 0, angle: 0, spin: 0 }, p && p.aim || {});
    if (has3d) { SC.setBowler(fig(p.fig)); SC.setBallColor(A.G.cur); }
    A.before = downN(A.L); A.standBefore = BW.standing(A.L);
    const fr = Math.min(10, p.frame + 1);
    say((A.G.players.length > 1 ? p.name + ' · ' : '') + 'Frame ' + fr + (p.ball ? ' · Wurf ' + (p.ball + 1) : ''));
    spinShow(); board();
    $('swipeHint').hidden = isCpu();
  }
  let sayT = 0; function say(m, d) { $('msg').textContent = m; sayT = d || 0; }
  function bigText(t, cls) { const b = $('bigTxt'); b.textContent = t; b.hidden = false; b.style.animation = 'none'; void b.offsetWidth; b.style.animation = ''; clearTimeout(bigText.t); bigText.t = setTimeout(() => { b.hidden = true; }, 1500); void cls; }
  function spinShow() { const s = A.aim.spin; $('spinShow').textContent = 'Effet ' + (Math.abs(s) < .05 ? 'gerade' : (s > 0 ? '↶ ' : '↷ ') + Math.round(Math.abs(s) * 100) + ' %'); }
  // Anzeigetafel
  function board() {
    if (!A.G) return; const many = A.G.players.length;
    $('board').innerHTML = A.G.players.map((p, i) => {
      const fr = BW.frames(p.rolls), on = i === A.G.cur && !A.G.over;
      if (many > 1 && !on && innerWidth < 600 && many > 2) return '<div class="brow"><span class="nm">' + esc(p.name) + '</span>' + fr.map(() => '<span class="fr"></span>').join('') + '<span class="tot">' + BW.running(p.rolls) + '</span></div>';
      return '<div class="brow' + (on ? ' on' : '') + '"><span class="nm">' + esc(p.name) + '</span>' + fr.map((f, k) => '<span class="fr' + (on && k === Math.min(9, p.frame) ? ' cur' : '') + '"><small>' + (f.marks || []).join(' ') + '</small><b>' + (f.score === null ? '' : f.score) + '</b></span>').join('') + '<span class="tot">' + BW.running(p.rolls) + '</span></div>';
    }).join('');
  }

  /* ---------- Wurf ---------- */
  const speedOf = p => 5.6 + Math.max(0, Math.min(1, p)) * 4.4;
  function commit(o) {
    if (A.phase !== 'aim' || !A.G || A.G.over) return;
    A.pend = { x: o.x, angle: o.angle, spin: o.spin, speed: o.speed };
    const p = curP(); if (p.cpu == null) p.aim = { x: o.x, angle: o.angle, spin: o.spin };
    A.phase = 'walk'; A.t = 0; A.charging = false; $('swipeHint').hidden = true;
  }
  function release() { BW.throwBall(A.L, A.pend); A.phase = 'roll'; A.t = 0; A.acc = 0; S.sfx('release'); vib(20); }
  function resolve() {
    const L = A.L; BW.settle(L); const n = downN(L) - A.before, p = curP(), i = A.G.cur, full = A.standBefore === 10;
    const strike = full && n === 10, spare = !full && n === A.standBefore && n > 0, gutter = L.ball && L.ball.gutter && n === 0;
    const human = p.cpu == null && A.mode !== 'attract';
    if (strike) { bigText('STRIKE!'); S.sfx('strike'); vib([40, 50, 80]); A.mood = 'win'; A.streak[i]++; if (human) { ST.strikes++; ST.bestStreak = Math.max(ST.bestStreak, A.streak[i]); } }
    else { A.streak[i] = 0; if (spare) { bigText('SPARE!'); S.sfx('spare'); vib(40); A.mood = 'win'; if (human) ST.spares++; } else if (gutter) { bigText('Rinne'); S.sfx('gutter'); A.mood = 'sad'; if (human) ST.gutters++; } else if (n === 0) { say('Daneben!'); S.sfx('miss'); A.mood = 'sad'; } else { say(n + (n === 1 ? ' Kegel' : ' Kegel') + (BW.standing(L) ? ' – noch ' + BW.standing(L) + ' stehen' : '')); if (n >= 7) A.mood = 'win'; } }
    if (A.mode === 'attract') { A.phase = 'show'; A.t = 0; A.res = { reset: true }; return; }
    A.res = BW.addRoll(A.G, n); A.phase = 'show'; A.t = 0; board(); saveSt();
  }
  function afterShow() {
    if (A.mode === 'attract') { BW.rack(A.L, false); A.phase = 'aim'; A.t = 0; A.cpu = null; A.mood = ''; A.before = 0; A.standBefore = 10; if (has3d && cur !== 'sFig' && cur !== 'sSetup') { SC.setBowler(rndFig()); SC.setBallColor(Math.floor(Math.random() * 6)); } return; }
    const r = A.res; if (r.reset) BW.rack(A.L, false); else BW.rack(A.L, true);
    if (r.over) return endGame();
    turnStart();
  }
  function endGame() {
    A.phase = 'over'; if (A.counted) return; A.counted = true;
    const ps = A.G.players.map((p, i) => ({ p, i, s: BW.total(p.rolls) })).sort((a, b) => b.s - a.s);
    let title = '', sub = '', kick = A.mode === 'solo' ? 'Einzelspiel' : A.mode === 'cpu' ? 'Gegen CPU · ' + LV[lastStart.lvl].n : 'Party';
    const hs = LS.get(P + 'highscore', 0) || 0;
    const humans = A.G.players.filter(p => p.cpu == null);
    humans.forEach(p => { const s = BW.total(p.rolls); ST.games++; ST.sum += s; ST.best = Math.max(ST.best, s); if (s === 300) ST.perfect++; });
    const me = A.G.players[0], my = BW.total(me.rolls);
    if (A.mode === 'solo' || A.mode === 'cpu') { if (my > hs) { LS.set(P + 'highscore', my); sub = '⭐ Neuer Rekord!'; } }
    if (A.mode === 'solo') title = my + ' Punkte';
    else if (A.mode === 'cpu') { const cpuS = BW.total(A.G.players[1].rolls); title = my > cpuS ? '🏆 Gewonnen!' : my === cpuS ? 'Unentschieden!' : 'Verloren'; if (my > cpuS) ST.cpuWins[lastStart.lvl]++; }
    else title = '🏆 ' + ps[0].p.name + ' gewinnt!';
    saveSt(); S.sfx(A.mode !== 'cpu' || title.includes('Gewonnen') ? 'win' : 'lose'); A.mood = 'win';
    $('eKick').textContent = kick; $('eTitle').textContent = title; $('eSub').textContent = sub || (A.mode === 'solo' ? 'Schnitt bisher: ' + Math.round(ST.sum / Math.max(1, ST.games)) : '');
    $('eRank').innerHTML = ps.map((x, k) => '<div><span>' + (k === 0 ? '🥇' : k === 1 ? '🥈' : k === 2 ? '🥉' : '4.') + ' ' + esc(x.p.name) + ' · <small>' + esc(fig(x.p.fig).n) + '</small></span><b>' + x.s + '</b></div>').join('');
    setTimeout(() => openOv('ovEnd'), 900);
  }

  /* ---------- Computer ---------- */
  function cpuTick(dt) {
    if (A.phase !== 'aim' || !isCpu() || overlays().length || (A.mode === 'attract' && (cur === 'sFig' || cur === 'sSetup'))) return;
    A.t += dt;
    if (!A.cpu) { if (A.t < .7) return; const lvl = A.mode === 'attract' ? 2 : curP().cpu; const o = BW.ai(A.L, lvl); A.cpu = { o, from: Object.assign({}, A.aim), t: 0 }; return; }
    const c = A.cpu; c.t += dt; const k = Math.min(1, c.t / .8), e = k * k * (3 - 2 * k);
    A.aim.x = c.from.x + (c.o.x - c.from.x) * e; A.aim.angle = c.from.angle + (c.o.angle - c.from.angle) * e; A.aim.spin = c.o.spin; A.power = Math.min(1, Math.max(0, c.t - .9) * 2);
    if (c.t > 1.4) commit(c.o);
  }

  /* ---------- Schleife ---------- */
  const STEP = 1 / 120;
  let last = performance.now();
  function loop(now) {
    const dt = Math.min(.05, (now - last) / 1000) * A.speed; last = now;
    pollPads(dt);
    const paused = cur === 'sGame' && overlays().some(o => o.id === 'ovPause');
    if (A.L && !paused) {
      if (A.phase === 'aim') { keysAim(dt); cpuTick(dt); if (A.charging) { A.power += A.chDir * dt / 1.1; if (A.power >= 1) { A.power = 1; A.chDir = -1; } if (A.power <= 0) { A.power = 0; A.chDir = 1; } } }
      else if (A.phase === 'walk') { A.t += dt; if (A.t >= .9) { A.phase = 'swing'; A.t = 0; } }
      else if (A.phase === 'swing') { A.t += dt; if (A.t >= .42) release(); }
      else if (A.phase === 'roll') {
        A.acc += dt; let n = 0; while (A.acc >= STEP && n < 30) { A.acc -= STEP; n++; BW.step(A.L, STEP); }
        A.t += dt; const b = A.L.ball; S.roll(b && !b.pit ? Math.sqrt(b.vx * b.vx + b.vz * b.vz) : 0);
        for (const e of A.L.ev) { if (e.k === 'hit') { if (A.mode !== 'attract' || cur === 'sMenu') S.sfx('hit', e.v); } else if (e.k === 'gutter' && A.mode !== 'attract') S.sfx('gutter'); }
        A.L.ev = [];
        if (BW.done(A.L)) { S.roll(0); resolve(); }
      } else if (A.phase === 'show') { A.t += dt; if (A.t > (A.mode === 'attract' ? 1.2 : 1.7)) afterShow(); }
      if (sayT > 0 && (sayT -= dt) <= 0) $('msg').textContent = '';
      if (cur === 'sGame') $('powFill').style.height = Math.round(A.power * 100) + '%';
    }
    if (has3d) {
      const bowl = { x: A.phase === 'aim' ? A.aim.x : A.pend ? A.pend.x : A.aim.x, phase: A.phase === 'walk' ? 'walk' : A.phase === 'swing' ? 'swing' : A.phase === 'roll' || A.phase === 'show' ? 'after' : 'idle', t: A.phase === 'walk' ? A.t / .9 : A.phase === 'swing' ? A.t / .42 : A.t };
      SC.update(dt, A.L ? { aim: A.phase === 'aim' || A.phase === 'walk' || A.phase === 'swing' ? { x: A.aim.x, angle: A.aim.angle, spin: A.aim.spin, speed: speedOf(A.power || .6) } : null, guide: SET.guide && A.phase === 'aim' && !isCpu() && cur === 'sGame', longGuide: SET.long, bowl, holding: A.phase === 'aim' || A.phase === 'walk' || A.phase === 'swing', mood: A.phase === 'show' || A.phase === 'over' ? A.mood : '' } : null);
    }
    requestAnimationFrame(loop);
  }

  /* ---------- Eingabe: Tastatur ---------- */
  const K = {};
  const clampAim = () => { A.aim.x = Math.max(-BW.HW + BW.BALL_R, Math.min(BW.HW - BW.BALL_R, A.aim.x)); A.aim.angle = Math.max(-.08, Math.min(.08, A.aim.angle)); A.aim.spin = Math.max(-1, Math.min(1, A.aim.spin)); };
  function keysAim(dt) {
    if (!canAim()) return;
    if (K.ArrowLeft) A.aim.x -= .6 * dt; if (K.ArrowRight) A.aim.x += .6 * dt;
    if (K.KeyA) A.aim.angle -= .05 * dt; if (K.KeyD) A.aim.angle += .05 * dt;
    clampAim();
  }
  function setSpin(v) { A.aim.spin = Math.max(-1, Math.min(1, Math.round(v * 4) / 4)); spinShow(); S.sfx('move'); }
  function startCharge() { if (!canAim()) return; A.charging = true; A.power = 0; A.chDir = 1; }
  function endCharge() { if (!A.charging) return; A.charging = false; if (A.power > .04) commit({ x: A.aim.x, angle: A.aim.angle, spin: A.aim.spin, speed: speedOf(A.power) }); else A.power = 0; }
  addEventListener('keydown', e => {
    document.body.classList.add('kbd'); const c = e.code; K[c] = true;
    if (c === 'Escape' || (c === 'KeyP' && cur === 'sGame' && !overlays().length)) { e.preventDefault(); back(); return; }
    if (cur === 'sGame' && !overlays().length) {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(c)) e.preventDefault();
      if (e.repeat) return;
      if (c === 'Space' || c === 'Enter') return startCharge();
      if (c === 'ArrowUp' && canAim()) return setSpin(A.aim.spin + .25);
      if (c === 'ArrowDown' && canAim()) return setSpin(A.aim.spin - .25);
      return;
    }
    if (e.target && e.target.tagName === 'INPUT' && !['ArrowUp', 'ArrowDown', 'Enter'].includes(c)) return;
    if (cur === 'sTitle' && !overlays().length && !e.repeat) { e.preventDefault(); pressStart(); return; }
    if (cur === 'sFig' && !overlays().length && (c === 'ArrowLeft' || c === 'ArrowRight') && document.activeElement && !document.activeElement.closest('.rowBtns')) { e.preventDefault(); figStep(c === 'ArrowLeft' ? -1 : 1); return; }
    const d = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[c];
    if (d) { e.preventDefault(); moveFocus(d[0], d[1]); }
  });
  addEventListener('keyup', e => { K[e.code] = false; if (e.code === 'Space' || e.code === 'Enter') endCharge(); });
  addEventListener('blur', () => { for (const k in K) K[k] = false; A.charging = false; });
  addEventListener('pointerdown', () => document.body.classList.remove('kbd'), true);

  /* ---------- Eingabe: Wischen ---------- */
  // Seitlich ziehen = Startpunkt; nach oben wischen = Wurf (Richtung → Ziel, Tempo → Kraft, Bogen am Ende → Effet)
  const SW = { id: null, pts: [], mode: '' };
  const zone = $('aimZone');
  zone.addEventListener('pointerdown', e => { if (!canAim() || SW.id !== null) return; e.preventDefault(); try { zone.setPointerCapture(e.pointerId); } catch (x) { } SW.id = e.pointerId; SW.pts = [[e.clientX, e.clientY, performance.now()]]; SW.mode = ''; SW.x0 = A.aim.x; });
  zone.addEventListener('pointermove', e => {
    if (e.pointerId !== SW.id) return; const p0 = SW.pts[0]; SW.pts.push([e.clientX, e.clientY, performance.now()]); if (SW.pts.length > 80) SW.pts.splice(1, 1);
    const dx = e.clientX - p0[0], dy = e.clientY - p0[1];
    if (!SW.mode && Math.hypot(dx, dy) > 14) SW.mode = -dy > Math.abs(dx) * .9 ? 'throw' : 'move';
    if (SW.mode === 'move') { A.aim.x = SW.x0 + dx / Math.min(innerWidth, 700) * 1.1; clampAim(); }
  });
  function swipeEnd(e) {
    if (e.pointerId !== SW.id) return; SW.id = null; if (e.type !== 'pointerup' || SW.mode !== 'throw' || !canAim()) return;
    const pts = SW.pts, a = pts[0], z = pts[pts.length - 1], dy = a[1] - z[1], len = Math.hypot(z[0] - a[0], dy), dur = Math.max(30, z[2] - a[2]);
    if (dy < 40) return;
    const ang = (p, q) => Math.atan2(q[0] - p[0], p[1] - q[1]);
    const mid = pts[Math.floor(pts.length * .5)], late = pts[Math.floor(pts.length * .75)] || mid;
    const a1 = ang(a, mid), a2 = ang(late, z), whole = ang(a, z);
    const v = len / dur, power = Math.max(.15, Math.min(1, (v - .25) / 1.6));
    let spin = A.aim.spin; if (pts.length > 6 && len > 80) { const cv = a2 - a1; if (Math.abs(cv) > .12) spin = Math.max(-1, Math.min(1, -cv * 1.4)); }
    commit({ x: A.aim.x, angle: Math.max(-.08, Math.min(.08, whole * .16)), spin, speed: speedOf(power) });
    A.power = power;
  }
  zone.addEventListener('pointerup', swipeEnd); zone.addEventListener('pointercancel', swipeEnd); zone.addEventListener('lostpointercapture', e => { if (e.pointerId === SW.id) SW.id = null; });
  // Kraftbalken halten
  const pw = $('power'); let pwId = null;
  pw.addEventListener('pointerdown', e => { if (!canAim()) return; e.preventDefault(); pwId = e.pointerId; try { pw.setPointerCapture(e.pointerId); } catch (x) { } startCharge(); });
  const pwUp = e => { if (e.pointerId !== pwId) return; pwId = null; endCharge(); };
  pw.addEventListener('pointerup', pwUp); pw.addEventListener('pointercancel', e => { if (e.pointerId === pwId) { pwId = null; A.charging = false; A.power = 0; } });
  $('bSpinL').onclick = () => { if (canAim()) setSpin(A.aim.spin + .25); };
  $('bSpinR').onclick = () => { if (canAim()) setSpin(A.aim.spin - .25); };
  $('bPause').onclick = () => pause();

  /* ---------- Eingabe: Gamecontroller ---------- */
  const PAD = { b: [], dir: null }; let padNavT = 0;
  function pollPads(dt) {
    let list = []; try { list = navigator.getGamepads ? Array.from(navigator.getGamepads()) : []; } catch (e) { }
    const gp = list.find(p => p && p.connected); if (!gp) return;
    const ax = gp.axes || [], bt = gp.buttons || [], pr = k => !!(bt[k] && (bt[k].pressed || bt[k].value > .5));
    const now = []; for (let k = 0; k < 17; k++) now[k] = pr(k); const down = k => now[k] && !PAD.b[k], up = k => !now[k] && PAD.b[k];
    const dz = v => Math.abs(v) < .18 ? 0 : v;
    if (cur === 'sGame' && !overlays().length) {
      document.body.classList.remove('kbd');
      if (canAim()) {
        let mx = dz(ax[0] || 0); if (now[14]) mx = -1; if (now[15]) mx = 1; A.aim.x += mx * .5 * dt;
        let ra = dz(ax[2] || 0); if (now[4]) ra = -1; if (now[5]) ra = 1; A.aim.angle += ra * .05 * dt; clampAim();
        if (down(2)) setSpin(A.aim.spin + .25); if (down(3)) setSpin(A.aim.spin - .25);
        if (down(0)) startCharge();
      }
      if (up(0)) endCharge();
      if (down(9) || down(1)) pause();
    } else {
      let x = Math.abs(ax[0]) > .5 ? Math.sign(ax[0]) : 0, z = Math.abs(ax[1]) > .5 ? Math.sign(ax[1]) : 0;
      if (now[14]) x = -1; if (now[15]) x = 1; if (now[12]) z = -1; if (now[13]) z = 1;
      const d = x || z ? (Math.abs(x) >= Math.abs(z) ? [x, 0] : [0, z]) : null, key = d ? d.join() : null;
      document.body.classList.add('kbd');
      if (d && (key !== PAD.dir || padNavT <= 0)) { if (cur === 'sFig' && d[0] && !overlays().length) figStep(d[0]); else moveFocus(d[0], d[1]); padNavT = key !== PAD.dir ? .35 : .14; }
      PAD.dir = key;
      if (down(0)) { if (cur === 'sTitle' && !overlays().length) pressStart(); else { const a = document.activeElement; if (a && a !== document.body && a.click) a.click(); else focusFirst(); } }
      if (down(1)) back();
      if (down(9)) { if (cur === 'sTitle') pressStart(); else if (overlays().some(o => o.id === 'ovPause')) resume(); }
    }
    PAD.b = now; padNavT -= dt;
  }
  addEventListener('gamepadconnected', () => { toast('🎮 Controller verbunden'); $('pressTxt').textContent = 'Drücke A'; });

  /* ---------- Menü ---------- */
  function toMenu() { closeAllOv(); attract(); scr('sMenu'); menuStat(); S.music('menu'); }
  function pause() { if (cur === 'sGame') openOv('ovPause'); }
  function resume() { closeOv('ovPause'); }
  function attract() { A.mode = 'attract'; A.G = BW.newGame([{ name: 'Demo', fig: rndFig().id, cpu: 2 }]); A.L = BW.newLane(); A.phase = 'aim'; A.t = 0; A.cpu = null; A.before = 0; A.standBefore = 10; A.mood = ''; if (has3d) { SC.setLane(A.L); SC.setBowler(fig(A.G.players[0].fig)); } }
  function pressStart() { if (cur !== 'sTitle') return; S.unlock(); S.sfx('ok'); toMenu(); }
  $('bPress').onclick = pressStart;
  $('sTitle').addEventListener('click', e => { if (e.target.closest('a')) return; pressStart(); });
  $('diffBtns').innerHTML = LV.map((l, i) => '<button class="btn nav' + (i === 1 ? ' pri' : '') + '" data-lv="' + i + '">' + l.i + ' ' + l.n + ' <small style="opacity:.75;font-weight:600">· ' + l.d + '</small></button>').join('');
  $('diffBtns').querySelectorAll('[data-lv]').forEach(b => { b.onclick = () => { S.sfx('ok'); go('cpu', +b.dataset.lv); }; });
  $('diffX').onclick = () => closeOv('ovDiff');
  document.querySelectorAll('#tiles [data-go]').forEach(t => {
    t.onclick = () => {
      S.unlock(); S.sfx('ok'); const g = t.dataset.go;
      if (g === 'solo') go('solo');
      else if (g === 'cpu') openOv('ovDiff');
      else if (g === 'party') openSetup();
      else if (g === 'fig') openFig();
      else if (g === 'rec') { showRec(); openOv('ovRec'); }
      else if (g === 'opts') openOv('ovOpts');
      else if (g === 'help') openOv('ovHelp');
    };
  });
  $('recX').onclick = () => closeOv('ovRec'); $('helpX').onclick = () => closeOv('ovHelp'); $('optX').onclick = () => closeOv('ovOpts');
  const OPT = { sSound: 'sound', sMusic: 'music', sGuide: 'guide', sLong: 'long', sVib: 'vib', sLow: 'low' };
  for (const id in OPT) { const el = $(id); el.checked = !!SET[OPT[id]]; el.onchange = () => { SET[OPT[id]] = el.checked; saveSet(); S.sfxOn = SET.sound; S.musicOn = SET.music; if (SET.music) S.music(cur === 'sGame' ? 'game' : 'menu'); if (id === 'sLow') toast('Gilt nach dem nächsten Neustart'); }; }
  $('pGo').onclick = resume; $('pOpts').onclick = () => openOv('ovOpts'); $('pHelp').onclick = () => openOv('ovHelp');
  $('pRestart').onclick = () => { if (lastStart) go(lastStart.mode, lastStart.lvl); };
  $('pQuit').onclick = () => toMenu();
  $('eAgain').onclick = () => { S.sfx('ok'); if (lastStart) go(lastStart.mode, lastStart.lvl); };
  $('eMenu').onclick = () => toMenu();

  /* ---------- Bowler wählen ---------- */
  let figI = 0;
  function openFig() { figI = Math.max(0, ROSTER.findIndex(c => c.id === SET.fig)); scr('sFig'); figShow(); }
  function figShow() { const c = ROSTER[figI]; if (!c) return; $('figName').textContent = c.n; $('figGame').textContent = 'aus ' + c.gameN; $('figDesc').textContent = c.d || ''; $('figCount').textContent = (figI + 1) + ' / ' + ROSTER.length; if (has3d) SC.setBowler(c); }
  function figStep(d) { figI = (figI + d + ROSTER.length) % ROSTER.length; S.sfx('move'); figShow(); }
  $('figPrev').onclick = () => figStep(-1); $('figNext').onclick = () => figStep(1);
  $('figRnd').onclick = () => { figI = Math.floor(Math.random() * ROSTER.length); S.sfx('move'); figShow(); };
  $('figOk').onclick = () => { SET.fig = ROSTER[figI].id; saveSet(); S.sfx('ok'); toast('🎳 ' + ROSTER[figI].n + ' ist dein Bowler'); toMenu(); };

  /* ---------- Party einrichten ---------- */
  let party = SET.party && SET.party.length >= 2 ? SET.party : [{ name: 'Spieler 1', fig: SET.fig, cpu: null }, { name: 'Spieler 2', fig: rndFig([SET.fig]).id, cpu: null }];
  const KIND = [null, 0, 1, 2], kindTxt = k => k == null ? '🙂 Mensch' : '🤖 CPU ' + LV[k].n;
  function openSetup() { scr('sSetup'); slots(); }
  function slots() {
    $('slots').innerHTML = party.map((s, i) => '<div class="slot"><input class="field" data-i="' + i + '" maxlength="12" value="' + esc(s.name) + '" aria-label="Name"><button class="btn nav kind" data-k="' + i + '">' + kindTxt(s.cpu) + '</button><div class="sRow"><button class="btn nav" data-f="' + i + '" data-d="-1">◀</button><span class="figN">' + esc(fig(s.fig).n) + '</span><button class="btn nav" data-f="' + i + '" data-d="1">▶</button><button class="btn nav" data-r="' + i + '">🎲</button></div></div>').join('');
    $('slots').querySelectorAll('input').forEach(n => { n.oninput = () => { party[+n.dataset.i].name = n.value.slice(0, 12); }; });
    $('slots').querySelectorAll('[data-k]').forEach(b => { b.onclick = () => { const s = party[+b.dataset.k]; s.cpu = KIND[(KIND.indexOf(s.cpu) + 1) % KIND.length]; S.sfx('move'); b.textContent = kindTxt(s.cpu); }; });
    $('slots').querySelectorAll('[data-f]').forEach(b => { b.onclick = () => { const s = party[+b.dataset.f], k = ROSTER.findIndex(c => c.id === s.fig); s.fig = ROSTER[(k + +b.dataset.d + ROSTER.length) % ROSTER.length].id; S.sfx('move'); b.parentNode.querySelector('.figN').textContent = fig(s.fig).n; if (has3d) SC.setBowler(fig(s.fig)); }; });
    $('slots').querySelectorAll('[data-r]').forEach(b => { b.onclick = () => { const s = party[+b.dataset.r]; s.fig = rndFig(party.map(x => x.fig)).id; S.sfx('move'); b.parentNode.querySelector('.figN').textContent = fig(s.fig).n; if (has3d) SC.setBowler(fig(s.fig)); }; });
    $('slAdd').disabled = party.length >= 4; $('slDel').disabled = party.length <= 2;
  }
  $('slAdd').onclick = () => { if (party.length < 4) { party.push({ name: 'Spieler ' + (party.length + 1), fig: rndFig(party.map(x => x.fig)).id, cpu: null }); slots(); } };
  $('slDel').onclick = () => { if (party.length > 2) { party.pop(); slots(); } };
  $('setBack').onclick = () => toMenu();
  $('setGo').onclick = () => { SET.party = party; saveSet(); S.sfx('ok'); go('party'); };

  /* ---------- Laden ---------- */
  const TIPS = ['Bahn wird geölt …', 'Kegel werden aufgestellt …', 'Disko-Kugel dreht sich …', 'Schuhe geschnürt …'];
  const bar = p => { $('loadBar').style.width = Math.round(p * 100) + '%'; $('loadTip').textContent = TIPS[Math.min(TIPS.length - 1, Math.floor(p * TIPS.length))]; };
  const wait = ms => new Promise(r => setTimeout(r, ms));
  (async function boot() {
    const t0 = performance.now(); bar(.15); await wait(60);
    try { if (!window.THREE || !window.ECModel) throw new Error('three'); SC.init($('stage'), { low: SET.low }); has3d = true; } catch (e) { has3d = false; console.warn('3D nicht verfügbar', e); }
    bar(.6); await wait(40); attract(); bar(.9);
    requestAnimationFrame(loop); bar(1);
    await wait(Math.max(0, 1100 - (performance.now() - t0)));
    $('sLoad').classList.add('out'); setTimeout(() => { $('sLoad').classList.remove('on', 'out'); }, 460);
    if (!has3d) toast('3D wird auf diesem Gerät nicht unterstützt.');
    if (navigator.getGamepads && Array.from(navigator.getGamepads() || []).some(Boolean)) $('pressTxt').textContent = 'Drücke A';
    const q = new URLSearchParams(location.search);
    if (q.get('mode') === 'solo') { S.unlock(); go('solo'); }
    else if (q.get('mode') === 'cpu') { S.unlock(); go('cpu', Math.max(0, Math.min(2, +q.get('lvl') || 1))); }
    else scr('sTitle');
  })();
  window.BWApp = { A, go, commit, toMenu, endGame, get cur() { return cur; }, board, openFig };
})();
