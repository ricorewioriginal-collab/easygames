/* Brainrot Parkour – Ablauf: Laden, Titel, Konsolen-Menü mit Figur auf dem Podest, Figurenwahl, Welt/Schwierigkeit, Spielmodi
 * (Obby, Rennen, Pavimento Lava, Torre Infinita, Chi lo dice?, Online-Rennen über ../cloud/fire-peer.js), Ergebnis, Pause.
 * Eingaben: Tastatur/Maus, Touch (Joystick + SPRUNG + Kamera-Wischen), Gamepad. Speichern: localStorage brainrot-parkour-*. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id), P_ = 'brainrot-parkour-', C = BRCore, V = BRView, VO = BRVoice, S = BRSound, CH = BRChars;
  const LS = { get(k, d) { try { const v = localStorage.getItem(P_ + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(P_ + k, JSON.stringify(v)); } catch (e) { } } };
  const SET = Object.assign({ sound: true, music: true, voice: true, subs: true, auto: true, vib: true, name: '', char: 'pinguino', diff: 'normale', world: 0 }, LS.get('settings', {}));
  const ST = Object.assign({ coins: 0, best: {}, stars: {}, unlocked: 1, wins: 0, tower: 0, lava: 0, quiz: 0, games: 0 }, LS.get('stats', {}));
  const saveSet = () => LS.set('settings', SET);
  const saveSt = () => { LS.set('stats', ST); const hs = ST.coins + ST.tower * 2 + ST.wins * 50; if (hs > (LS.get('highscore', 0) || 0)) LS.set('highscore', hs); };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const coarse = () => matchMedia('(pointer: coarse)').matches;
  const sfx = n => { if (SET.sound && S.sfx[n]) S.sfx[n](); };
  const vib = ms => { if (SET.vib && navigator.vibrate) try { navigator.vibrate(ms); } catch (e) { } };
  const fmt = t => { t = Math.max(0, t); const m = Math.floor(t / 60), s = t - m * 60; return m + ':' + (s < 10 ? '0' : '') + s.toFixed(1); };
  const pick = a => a[Math.floor(Math.random() * a.length)];
  let toastT = 0; function toast(m, ms) { const t = $('toast'); t.textContent = m; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, ms || 2600); }
  VO.on = SET.voice; S.setVol('sfx', SET.sound ? .8 : 0);
  let subT = 0; VO.onSub = text => { if (!SET.subs || cur !== 'sGame') return; const e = $('hSub'); e.textContent = '🗯️ ' + text; e.hidden = false; e.classList.remove('pop'); void e.offsetWidth; e.classList.add('pop'); clearTimeout(subT); subT = setTimeout(() => { e.hidden = true; }, 2800); };
  const charOf = id => CH.byId(id);
  const DIFFN = { bambini: '🧸 Bambini', normale: '🙂 Normale', esperto: '🔥 Esperto' };
  const DIFFH = { bambini: 'Für Kinder: Doppelsprung, mehr Checkpoints, kürzere Lücken, Drehbalken schubsen nur.', normale: 'Der echte Obby-Spaß – ein Fehler bringt dich zum Checkpoint.', esperto: 'Lange Lücken, schnelle Balken, schmale Wege, wenige Checkpoints.' };

  /* ---------- Bildschirme & Navigation ---------- */
  let cur = 'sLoad';
  function scr(id) { document.querySelectorAll('.scr').forEach(s => s.classList.toggle('on', s.id === id)); cur = id; document.body.dataset.scr = id; setTimeout(focusFirst, 0); }
  const overlays = () => Array.from(document.querySelectorAll('.ov')).filter(o => !o.hidden);
  const root = () => overlays().pop() || $(cur);
  const navEls = () => Array.from(root().querySelectorAll('.nav')).filter(e => !e.disabled && e.offsetParent !== null);
  function focusFirst() { if (coarse()) return; const els = navEls(), el = els.find(e => e.classList.contains('pri') || e.classList.contains('hero') || e.classList.contains('on')) || els[0]; if (el) try { el.focus({ preventScroll: true }); } catch (e) { } }
  function openOv(id) { $(id).hidden = false; setTimeout(focusFirst, 0); }
  function closeOv(id) { $(id).hidden = true; setTimeout(focusFirst, 0); }
  function moveFocus(dx, dy) {
    const els = navEls(); if (!els.length) return; const a = document.activeElement;
    if (!els.includes(a)) { els[0].focus(); sfx('nav'); return; }
    const r = a.getBoundingClientRect(), ax = r.left + r.width / 2, ay = r.top + r.height / 2; let best = null, bd = 1e9;
    for (const e of els) { if (e === a) continue; const q = e.getBoundingClientRect(), x = q.left + q.width / 2 - ax, y = q.top + q.height / 2 - ay, al = x * dx + y * dy; if (al <= 4) continue; const d = al + (Math.abs(x * dy) + Math.abs(y * dx)) * 2.2; if (d < bd) { bd = d; best = e; } }
    if (best) { best.focus(); sfx('nav'); if (best.scrollIntoView) best.scrollIntoView({ block: 'nearest' }); }
  }
  const BACK = { sMenu: () => { scr('sTitle'); }, sChars: () => toMenu(), sWorld: () => toMenu(), sHelp: () => toMenu(), sQuiz: () => quizEnd(true), sLobby: () => { netClose(); toMenu(); }, sResult: () => { const b = $('rsBtns').querySelector('.pri'); if (b) b.click(); } };
  function back() { const ov = overlays().pop(); if (ov) { if (ov.id === 'ovPause') return resume(); return closeOv(ov.id); } if (cur === 'sGame') return pause(); sfx('back'); if (BACK[cur]) BACK[cur](); }
  function seg(el, opts, val, cb) { el.innerHTML = opts.map(o => `<button class="sg nav${o.v === val ? ' on' : ''}" data-v="${o.v}">${o.n}</button>`).join(''); el.querySelectorAll('button').forEach(b => b.onclick = () => { el.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); sfx('nav'); cb(isNaN(+b.dataset.v) ? b.dataset.v : +b.dataset.v); }); }

  /* ---------- Menü ---------- */
  function menuStat() { $('menuStat').innerHTML = `<span>🪙 ${ST.coins}</span><span>🏆 ${ST.wins}</span><span>🗼 ${ST.tower} m</span>`; const c = charOf(SET.char); $('mChar').innerHTML = `<b style="color:${c.color}">${esc(c.name)}</b><small>„${esc(c.say[0])}“</small>`; }
  function toMenu() { endGame(); netClose(); document.querySelectorAll('.ov').forEach(o => { o.hidden = true; }); menuStat(); V.menuStage(SET.char); scr('sMenu'); S.music(SET.music, 1); }
  document.querySelectorAll('#mList .mi').forEach(b => {
    b.onfocus = b.onmouseenter = () => { $('mInfo').textContent = b.dataset.i; };
    b.onclick = () => { sfx('ok'); const g = b.dataset.go; if (g === 'obby' || g === 'race') worldScreen(g); else if (g === 'lava') startLava(); else if (g === 'tower') startTower(); else if (g === 'quiz') quizStart(); else if (g === 'online') openOv('ovOnline'); else if (g === 'chars') charScreen(); else if (g === 'opts') openOv('ovOpts'); else if (g === 'help') scr('sHelp'); };
  });
  $('mInfo').textContent = $('mList').firstElementChild.dataset.i; $('helpBack').onclick = () => toMenu();

  /* ---------- Einstellungen ---------- */
  const OPT = { oSound: 'sound', oMusic: 'music', oVoice: 'voice', oSubs: 'subs', oAuto: 'auto', oVib: 'vib' };
  for (const id in OPT) { const el = $(id); el.checked = !!SET[OPT[id]]; el.onchange = () => { SET[OPT[id]] = el.checked; saveSet(); S.setVol('sfx', SET.sound ? .8 : 0); VO.on = SET.voice; if (id === 'oMusic') S.music(SET.music); }; }
  $('oName').value = SET.name; $('oName').onchange = () => { SET.name = $('oName').value.trim().slice(0, 14); saveSet(); };
  $('optX').onclick = () => closeOv('ovOpts');

  /* ---------- Figurenwahl ---------- */
  let chSel = SET.char;
  function charScreen() {
    chSel = SET.char; scr('sChars');
    $('charGrid').innerHTML = CH.LIST.map(c => `<button class="ccard nav${c.id === chSel ? ' on' : ''}" data-c="${c.id}" style="--cc:${c.color}"><img alt="" data-src="${c.id}"><b>${esc(c.name)}</b></button>`).join('');
    const imgs = Array.from($('charGrid').querySelectorAll('img')); let k = 0; const next = () => { if (cur !== 'sChars' || k >= imgs.length) return; imgs[k].src = V.thumb(imgs[k].dataset.src); k++; requestAnimationFrame(next); }; requestAnimationFrame(next);
    $('charGrid').querySelectorAll('.ccard').forEach(b => { b.onclick = () => { chSel = b.dataset.c; $('charGrid').querySelectorAll('.ccard').forEach(x => x.classList.toggle('on', x === b)); V.menuStage(chSel); VO.char(charOf(chSel), true); sfx('nav'); }; b.onfocus = () => { if (!coarse()) { chSel = b.dataset.c; $('charGrid').querySelectorAll('.ccard').forEach(x => x.classList.toggle('on', x === b)); V.menuStage(chSel); } }; });
  }
  $('chBack').onclick = () => toMenu(); $('chSay').onclick = () => VO.char(charOf(chSel), true);
  $('chOk').onclick = () => { SET.char = chSel; saveSet(); sfx('ok'); VO.char(charOf(chSel), true); toMenu(); };

  /* ---------- Welt & Schwierigkeit ---------- */
  let wdMode = 'obby';
  function worldScreen(mode) {
    wdMode = mode; $('wdT').textContent = mode === 'race' ? '🏁 Brainrot-Rennen' : '🏃 Obby'; scr('sWorld');
    const draw = () => { $('worlds').innerHTML = C.WORLDS.map((w, i) => { const lock = mode === 'obby' && i >= ST.unlocked, b = ST.best[i + SET.diff], st = ST.stars[i + SET.diff] || 0; return `<button class="wcard nav w${i}${SET.world === i ? ' on' : ''}" data-w="${i}" ${lock ? 'disabled' : ''}><i>${w.icon}</i><b>${esc(w.name)}</b><small>${lock ? '🔒 Erst die Welt davor schaffen' : mode === 'obby' ? (b ? '⏱ ' + fmt(b) + ' · ' + '⭐'.repeat(st) + '☆'.repeat(3 - st) : '10 Abschnitte') : '4 Abschnitte · 3 Gegner'}</small></button>`; }).join('');
      $('worlds').querySelectorAll('.wcard').forEach(b => b.onclick = () => { SET.world = +b.dataset.w; saveSet(); sfx('nav'); draw(); }); };
    if (mode === 'obby' && SET.world >= ST.unlocked) SET.world = 0;
    draw(); seg($('diffSeg'), Object.keys(DIFFN).map(v => ({ v, n: DIFFN[v] })), SET.diff, v => { SET.diff = v; saveSet(); $('diffHint').textContent = DIFFH[v]; draw(); }); $('diffHint').textContent = DIFFH[SET.diff];
  }
  $('wdBack').onclick = () => toMenu(); $('wdGo').onclick = () => { sfx('ok'); if (wdMode === 'race') startRace(SET.world, SET.diff); else startObby(SET.world, SET.diff); };

  /* ---------- Spiel ---------- */
  let G = null;
  const THEME = ['cucina', 'spiaggia', 'galassia'];
  const BOT_NAMES = ['Lexi', 'Toni', 'Mira', 'Gigi', 'Pepe', 'Lola'];
  function baseGame(mode, Wd, diff, theme) {
    endGame(); V.menuOff(); V.camReset(); V.buildWorld(Wd, theme); V.clearActors();
    const me = C.newPlayer(Wd); const a = V.addActor(SET.char, SET.name || 'Du', '#ffd23a');
    G = { mode, W: Wd, D: C.DIFF[diff] || C.DIFF.normale, diff, me, actor: a, bots: [], ghosts: new Map(), t: 0, count: 3.2, yaw: me.yaw, pitch: .36, dist: 7.5, camIdle: 9, paused: false, over: false, rng: C.rng((Math.random() * 1e9) | 0) };
    G.yaw = 0; scr('sGame'); $('hRank').innerHTML = ''; $('tpad').hidden = !(coarse() || A.touch); if (!$('tpad').dataset.ok) { BRTouch.build($('tpad'), TS, [['a', 'SPRUNG', 0, .55, '⤒'], ['w', 'KAMERA', 0, -.55, '🎥']]); $('tpad').dataset.ok = 1; }
    S.music(SET.music, mode === 'race' || mode === 'lava' ? 1.15 : 1); ST.games++; saveSt(); hud(); return G;
  }
  function addBot(i, skill) { const ids = CH.LIST.map(c => c.id).filter(id => id !== SET.char && !G.bots.some(b => b.ch === id)); const ch = pick(ids), P = C.newPlayer(G.W), cp = G.W.cps[0]; P.x = cp.x + (i - 1) * 1.6; P.z = cp.z - 1.5; P.y = cp.y + .05; const a = V.addActor(ch, BOT_NAMES[i % BOT_NAMES.length], '#8ad0ff'); G.bots.push({ P, a, ch, skill, name: BOT_NAMES[i % BOT_NAMES.length], r: C.rng(i * 99 + 7) }); }
  function startObby(world, diff) { const Wd = C.obby(world, diff, { seed: 1 }); baseGame('obby', Wd, diff, THEME[world]); G.world = world; }
  function startRace(world, diff, net) {
    const seed = net ? net.seed : (Math.random() * 1e6) | 0, Wd = C.obby(world, diff, { seed, stages: 4 }); baseGame(net ? 'online' : 'race', Wd, diff, THEME[world]); G.world = world;
    if (!net) for (let i = 0; i < 3; i++) addBot(i, diff === 'bambini' ? 0 : diff === 'normale' ? 1 : 2);
    const cp = Wd.cps[0]; G.me.x = cp.x + (net ? (net.slot || 0) * 1.3 - 2 : 2.4); G.me.z = cp.z - 1.5; G.net = net || null;
  }
  function startLava() {
    const Wd = C.lavaFloor(10, 3); Wd.tileTime = SET.diff === 'bambini' ? 1.5 : SET.diff === 'esperto' ? .9 : 1.15; baseGame('lava', Wd, SET.diff, 'cucina'); for (let i = 0; i < 3; i++) addBot(i, 1);
    const pos = [[-3.3, -3.3], [3.3, 3.3], [-3.3, 3.3], [3.3, -3.3]]; [G.me].concat(G.bots.map(b => b.P)).forEach((P, i) => { P.x = pos[i][0]; P.z = pos[i][1]; P.y = .05; });
    G.dist = 11; G.pitch = .7; G.alive = 4; G.out = []; G.rate = 1.1;
  }
  function startTower() { const Wd = C.tower((Math.random() * 1e6) | 0, SET.diff); baseGame('tower', Wd, SET.diff, 'galassia'); G.sauce = -6; G.top = 0; G.dist = 8.5; G.pitch = .5; }
  function endGame() { if (!G) return; G = null; V.clearActors(); $('tpad').hidden = true; $('hSub').hidden = true; VO.stop(); BRTouch.reset(); }

  /* ---------- Eingaben ---------- */
  const A = { touch: false, keys: {}, drag: null, pad: null };
  const TS = { x: 0, y: 0, a: 0, w: 0, cdx: 0, cdy: 0 };
  addEventListener('keydown', e => {
    A.keys[e.code] = true; if (e.code !== 'Tab') document.body.classList.add('kbd');
    if (e.code === 'Escape') { e.preventDefault(); back(); return; }
    if (e.target && e.target.tagName === 'INPUT') { if (e.code === 'Enter' && cur === 'sLobby') $('jGo').click(); return; }
    if (cur === 'sGame' && !overlays().length) { if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault(); return; }
    if (cur === 'sTitle' && !overlays().length && !e.repeat) { e.preventDefault(); pressStart(); return; }
    if (cur === 'sQuiz' && /^Digit[1-4]$/.test(e.code)) { const b = $('qOpts').querySelectorAll('.qo')[+e.code.slice(5) - 1]; if (b) b.click(); return; }
    const d = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[e.code]; if (d) { e.preventDefault(); moveFocus(d[0], d[1]); }
  });
  addEventListener('keyup', e => { A.keys[e.code] = false; });
  addEventListener('blur', () => { A.keys = {}; });
  addEventListener('pointerdown', e => { document.body.classList.remove('kbd'); if (e.pointerType === 'touch' && !A.touch) { A.touch = true; if (G) $('tpad').hidden = false; } }, true);
  const cv = $('cv');
  cv.addEventListener('pointerdown', e => { if (cur !== 'sGame' || e.pointerType === 'touch') return; A.drag = { x: e.clientX, y: e.clientY }; try { cv.setPointerCapture(e.pointerId); } catch (x) { } });
  cv.addEventListener('pointermove', e => { if (!A.drag || !G) return; G.yaw -= (e.clientX - A.drag.x) * .006; G.pitch = Math.max(.05, Math.min(1.2, G.pitch + (e.clientY - A.drag.y) * .004)); A.drag = { x: e.clientX, y: e.clientY }; G.camIdle = 0; });
  cv.addEventListener('pointerup', () => { A.drag = null; }); cv.addEventListener('wheel', e => { if (G) G.dist = Math.max(4, Math.min(14, G.dist + e.deltaY * .01)); }, { passive: true });
  function readPad() { let gp = null; try { gp = Array.from(navigator.getGamepads ? navigator.getGamepads() : []).find(p => p && p.connected); } catch (e) { } return gp; }
  function gameInput(dt) {
    const k = A.keys; let ix = 0, iy = 0, jump = false;
    if (k.KeyA || k.ArrowLeft) ix -= 1; if (k.KeyD || k.ArrowRight) ix += 1; if (k.KeyW || k.ArrowUp) iy += 1; if (k.KeyS || k.ArrowDown) iy -= 1; if (k.Space || k.KeyK) jump = true;
    if (k.KeyQ) { G.yaw += dt * 2.4; G.camIdle = 0; } if (k.KeyE) { G.yaw -= dt * 2.4; G.camIdle = 0; }
    if (TS.x || TS.y) { ix += TS.x; iy -= TS.y; } if (TS.a) jump = true; if (TS.cdx || TS.cdy) { G.yaw -= TS.cdx * .008; G.pitch = Math.max(.05, Math.min(1.2, G.pitch + TS.cdy * .005)); TS.cdx = TS.cdy = 0; G.camIdle = 0; }
    if (TS.w && !A.wPrev) { G.yaw = G.me.yaw; G.camIdle = 0; } A.wPrev = TS.w;
    const gp = readPad(); if (gp) { const ax = gp.axes || [], b = gp.buttons || [], pr = n => !!(b[n] && (b[n].pressed || b[n].value > .5)); const dz = v => Math.abs(v) > .18 ? v : 0; ix += dz(ax[0] || 0); iy -= dz(ax[1] || 0); if (pr(14)) ix -= 1; if (pr(15)) ix += 1; if (pr(12)) iy += 1; if (pr(13)) iy -= 1; if (pr(0)) jump = true; const rx = dz(ax[2] || 0), ry = dz(ax[3] || 0); if (rx || ry) { G.yaw -= rx * dt * 2.6; G.pitch = Math.max(.05, Math.min(1.2, G.pitch + ry * dt * 1.5)); G.camIdle = 0; } if (pr(4)) { G.yaw += dt * 2.4; G.camIdle = 0; } if (pr(5)) { G.yaw -= dt * 2.4; G.camIdle = 0; } }
    const l = Math.hypot(ix, iy); if (l > 1) { ix /= l; iy /= l; }
    const sy = Math.sin(G.yaw), cy = Math.cos(G.yaw); return { mx: sy * iy - cy * ix, mz: cy * iy + sy * ix, jump, l: Math.min(1, l), iy };
  }
  let padPrev = {}, padDir = null, padT = 0;
  function menuPad(dt) {
    const gp = readPad(); if (!gp) return; const b = gp.buttons || [], ax = gp.axes || [], pr = n => !!(b[n] && (b[n].pressed || b[n].value > .5));
    const now = { a: pr(0), b: pr(1), st: pr(9) }, edge = k => now[k] && !padPrev[k];
    if (cur === 'sGame' && !overlays().length) { if (edge('st')) pause(); padPrev = now; return; }
    let x = Math.abs(ax[0] || 0) > .5 ? Math.sign(ax[0]) : 0, z = Math.abs(ax[1] || 0) > .5 ? Math.sign(ax[1]) : 0; if (pr(14)) x = -1; if (pr(15)) x = 1; if (pr(12)) z = -1; if (pr(13)) z = 1;
    if (x || z || Object.values(now).some(Boolean)) document.body.classList.add('kbd');
    const key = x || z ? (Math.abs(x) >= Math.abs(z) ? x + ',0' : '0,' + z) : null;
    if (key && (key !== padDir || padT <= 0)) { const [dx, dy] = key.split(',').map(Number); moveFocus(dx, dy); padT = key !== padDir ? .3 : .12; } padDir = key; padT -= dt;
    if (edge('a')) { if (cur === 'sTitle' && !overlays().length) pressStart(); else { const a = document.activeElement; if (a && a !== document.body && a.click && !a.disabled) a.click(); else focusFirst(); } }
    if (edge('b')) back(); if (edge('st') && cur === 'sTitle') pressStart(); if (edge('st') && overlays().length && $('ovPause').hidden === false) resume();
    padPrev = now;
  }

  /* ---------- Spielschleife ---------- */
  function step(dt) {
    const g = G, me = g.me;
    if (g.count > 0) { const c0 = Math.ceil(g.count); g.count -= dt; const c1 = Math.ceil(g.count); if (c0 !== c1) { if (c1 > 0) { big(String(c1)); sfx('tick'); } else { big(g.mode === 'lava' ? '🔥 LAUF!' : '🍝 VIA!'); sfx('go'); VO.ann(g.mode === 'lava' ? 'lava' : g.mode === 'tower' ? 'tower' : 'start', true); } } }
    const inp = g.count > 0 || g.over ? { mx: 0, mz: 0, jump: false, l: 0 } : gameInput(dt);
    C.worldStep(g.W, dt);
    if (!me.done && !me.out) C.step(g.W, me, inp, dt, g.D);
    if (g.count <= 0 && !g.over && !me.done) g.t += dt;
    events(me, true);
    // Computer-Figuren
    for (const b of g.bots) { if (b.P.done || b.P.out) continue; const bi = g.count > 0 ? { mx: 0, mz: 0, jump: false } : g.mode === 'lava' ? C.lavaBot(g.W, b.P, b.r) : C.botInput(g.W, b.P, b.skill, b.r); C.step(g.W, b.P, bi, dt, g.D); if (b.P.events.includes('goal')) b.time = g.t; }
    // Modus-Regeln
    if (g.mode === 'obby') obbyRules(); else if (g.mode === 'race' || g.mode === 'online') raceRules(); else if (g.mode === 'lava') lavaRules(dt); else if (g.mode === 'tower') towerRules(dt);
    // Kamera: dreht sich langsam hinter die Figur, wenn man nichts tut
    g.camIdle += dt; if (SET.auto && g.camIdle > 1.2 && inp.l > .3 && Math.abs(inp.iy) > .4 && !me.dead) { let d = me.yaw - g.yaw; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; if (inp.iy > 0) g.yaw += d * Math.min(1, dt * 1.2); }
    if (me.events.includes('respawn')) { g.yaw = me.yaw; }
    const foc = me.out ? (g.bots.map(b => b.P).find(P => !P.out) || me) : me; V.follow(foc.x, foc.y, foc.z, g.yaw, g.pitch, g.dist, dt);
    V.syncWorld(g.W, dt, me); V.syncActor(g.actor, me, dt); for (const b of g.bots) V.syncActor(b.a, b.P, dt);
    for (const [, gh] of g.ghosts) { gh.P.x += (gh.tx - gh.P.x) * Math.min(1, dt * 10); gh.P.y += (gh.ty - gh.P.y) * Math.min(1, dt * 10); gh.P.z += (gh.tz - gh.P.z) * Math.min(1, dt * 10); V.syncActor(gh.a, gh.P, dt); }
    const ch = V.npcNear(me.x, me.z); if (ch) VO.char(ch);
    hud();
    if (g.net) netTick(dt);
  }
  function events(P, mine) {
    if (!mine) return; for (const e of P.events) {
      if (e === 'jump') sfx('jump'); else if (e === 'jump2') sfx('jump2'); else if (e === 'land') sfx('land'); else if (e === 'bounce') { sfx('bounce'); vib(20); V.burst(P.x, P.y, P.z, 20, '#ffd23a', 4, 6); }
      else if (e === 'coin') { sfx('coin'); ST.coins++; V.burst(P.x, P.y + 1, P.z, 10, '#ffd23a', 3, 4); if (Math.random() < .12) VO.ann('coin'); }
      else if (e === 'check') { sfx('check'); vib(40); big('🚩 CHECKPOINT!'); VO.ann('check'); V.burst(P.x, P.y + 1, P.z, 50, null, 7, 9); }
      else if (e === 'die') { sfx('die'); vib([60, 40, 60]); VO.ann('die'); V.burst(P.x, P.y + .8, P.z, 40, G.W.mode === 'tower' || THEME[G.world] === 'cucina' ? '#e8331a' : null, 6, 7); }
      else if (e === 'knock') { sfx('knock'); vib(30); }
      else if (e === 'tile') sfx('tile');
      else if (e === 'goal') { sfx('goal'); V.burst(P.x, P.y + 1, P.z, 120, null, 10, 12); }
    }
  }
  function obbyRules() { const g = G, me = g.me; if (me.done && !g.over) { g.over = true; VO.ann('goal', true); setTimeout(() => obbyResult(), 1600); } }
  // Fortschritt = nächster Wegpunkt der Route (für Platzierung und Balken)
  function progress(P) { const R = G.W.route; if (P.wi !== undefined && P !== G.me) return P.done ? R.length + 10 : P.wi; let b = P.pi || 0; for (let i = Math.max(0, b - 3); i < Math.min(R.length, b + 6); i++) if (Math.hypot(R[i].x - P.x, R[i].z - P.z) < Math.hypot(R[b].x - P.x, R[b].z - P.z)) b = i; P.pi = b; return P.done ? R.length + 10 : b; }
  function raceRules() {
    const g = G, me = g.me; if (me.done && !g.meTime) { g.meTime = g.t; if (g.net) netSend({ t: 'fin', time: g.t }); }
    const list = [{ n: SET.name || 'Du', p: progress(me), t: g.meTime, me: true, c: SET.char }].concat(g.bots.map(b => ({ n: b.name, p: progress(b.P), t: b.time, c: b.ch }))).concat(Array.from(g.ghosts.values()).map(gh => ({ n: gh.name, p: gh.done ? 1e6 - gh.time : gh.pi || 0, t: gh.time, c: gh.ch })));
    list.sort((a, b) => (a.t && b.t) ? a.t - b.t : a.t ? -1 : b.t ? 1 : b.p - a.p); g.rank = list;
    $('hRank').innerHTML = list.map((x, i) => `<div class="${x.me ? 'me' : ''}"><b>${i + 1}.</b> ${esc(x.n)}${x.t ? ' ✔' : ''}</div>`).join('');
    const allBotsDone = g.bots.every(b => b.P.done) && Array.from(g.ghosts.values()).every(gh => gh.done || gh.left);
    if (!g.over && (me.done && (allBotsDone || g.t - g.meTime > (g.net ? 30 : 12)))) { g.over = true; const pl = list.findIndex(x => x.me) + 1; if (pl === 1) { ST.wins++; VO.ann('win', true); } else VO.ann('lose', true); saveSt(); setTimeout(() => raceResult(list), 1500); }
  }
  function lavaRules(dt) {
    const g = G; if (g.count > 0 || g.over) return; g.surv = (g.surv || 0) + dt; g.rate = Math.max(.25, 1.1 - g.surv * .012);
    const t = C.lavaTick(g.W, dt, g.rng, g.rate); if (t) sfx('crack');
    const all = [{ P: g.me, n: SET.name || 'Du', me: true }].concat(g.bots.map(b => ({ P: b.P, n: b.name }))); for (const x of all) { if (!x.P.out && x.P.deaths > 0) { x.P.out = true; x.P.hidden = true; x.P.dead = 99; g.out.push({ n: x.n, t: g.surv, me: x.me }); if (x.me) { big('💥 RAUS!'); VO.ann('die', true); } } }
    const alive = all.filter(x => !x.P.out); $('hRank').innerHTML = all.map(x => `<div class="${x.me ? 'me' : ''}${x.P.out ? ' out' : ''}">${x.P.out ? '💀' : '🙂'} ${esc(x.n)}</div>`).join('');
    if (alive.length <= 1 || (g.me.out && alive.length && g.surv > 200)) { g.over = true; const win = alive[0]; if (win) g.out.push({ n: win.n, t: g.surv, me: win.me }); const mine = g.out.find(o => o.me); if (mine && mine.t > ST.lava) ST.lava = Math.round(mine.t); if (win && win.me) { ST.wins++; VO.ann('win', true); } else VO.ann('lose', true); saveSt(); setTimeout(() => lavaResult(), 1500); }
    if (g.me.out) g.meDead = (g.meDead || 0) + dt;
  }
  function towerRules(dt) {
    const g = G, me = g.me; if (g.count > 0 || g.over) return; g.top = Math.max(g.top, me.y); g.W.extend(g.top + 40); V.appendObjs(g.W);
    const sp = (SET.diff === 'bambini' ? .35 : SET.diff === 'esperto' ? .75 : .5) + g.t * .006; g.sauce += sp * dt; if (g.sauce < g.top - 14) g.sauce = g.top - 14; V.sauce(g.sauce, me.x, me.z);
    if (me.y < g.sauce - .3 && !me.dead) { me.events.push('die'); events(me, true); g.over = true; const h = Math.round(g.top); if (h > ST.tower) ST.tower = h; saveSt(); setTimeout(() => towerResult(h), 1300); }
    if (me.dead > 0 && !g.over) { g.over = true; const h = Math.round(g.top); if (h > ST.tower) ST.tower = h; saveSt(); setTimeout(() => towerResult(h), 1300); }
  }
  function hud() {
    const g = G; if (!g) return; const me = g.me;
    if (g.mode === 'obby' || g.mode === 'race' || g.mode === 'online') { const tot = g.W.cps.length - 1 + 1; $('hStage').textContent = `🚩 ${me.done ? tot : me.cp + 1}/${tot}`; $('hProgBar').style.width = Math.min(100, progress(me) / Math.max(1, g.W.route.length - 1) * 100) + '%'; }
    else if (g.mode === 'lava') { $('hStage').textContent = '🔥 Pavimento Lava'; $('hProgBar').style.width = '0%'; }
    else if (g.mode === 'tower') { $('hStage').textContent = `🗼 ${Math.max(0, Math.round(g.top))} m`; $('hProgBar').style.width = Math.min(100, g.top / Math.max(20, ST.tower) * 100) + '%'; }
    $('hTime').textContent = '⏱ ' + fmt(g.mode === 'lava' ? (g.surv || 0) : g.t); $('hCoins').textContent = '🪙 ' + me.coins; $('hDeaths').textContent = '💀 ' + me.deaths; $('hDeaths').hidden = g.mode === 'lava' || g.mode === 'tower'; $('hCoins').hidden = g.mode === 'lava';
  }
  let bigT = 0; function big(t, ms) { const e = $('big'); e.textContent = t; e.hidden = false; e.classList.remove('pop'); void e.offsetWidth; e.classList.add('pop'); clearTimeout(bigT); bigT = setTimeout(() => { e.hidden = true; }, ms || 1100); }

  /* ---------- Ergebnisse (Game Over / Ziel) ---------- */
  function result(title, html, btns) { $('rsT').textContent = title; $('rsBody').innerHTML = html; $('rsBtns').innerHTML = btns.map(([id, t, pri]) => `<button class="btn nav${pri ? ' pri big' : ''}" id="${id}">${t}</button>`).join(''); scr('sResult'); }
  function obbyResult() {
    const g = G; if (!g) return; const me = g.me, w = g.world, key = w + g.diff, coinsAll = g.W.coins, st = 1 + (me.deaths <= 3 ? 1 : 0) + (me.coins >= coinsAll * .6 ? 1 : 0), nb = !ST.best[key] || g.t < ST.best[key];
    if (nb) ST.best[key] = Math.round(g.t * 10) / 10; ST.stars[key] = Math.max(ST.stars[key] || 0, st); if (w + 2 > ST.unlocked) ST.unlocked = Math.min(3, w + 2); saveSt();
    const next = w < 2; endGame(); V.menuStage(SET.char);
    result('🏆 Geschafft!', `<div class="stars">${'⭐'.repeat(st)}${'☆'.repeat(3 - st)}</div><div class="rsl"><span>⏱ Zeit</span><b>${fmt(g.t)}${nb ? ' · 🆕 Bestzeit!' : ''}</b></div><div class="rsl"><span>🪙 Münzen</span><b>${me.coins} / ${coinsAll}</b></div><div class="rsl"><span>💀 Stürze</span><b>${me.deaths}</b></div><p class="hint">${next ? '🔓 ' + esc(C.WORLDS[w + 1].name) + ' ist freigeschaltet!' : 'Alle Welten geschafft – Campionissimo!'}</p>`,
      [['rsMenu', '☰ Menü'], ['rsAgain', '↻ Nochmal'], next ? ['rsNext', '▶ Nächste Welt', true] : ['rsRace', '🏁 Rennen', true]]);
    $('rsMenu').onclick = () => toMenu(); $('rsAgain').onclick = () => startObby(w, g.diff);
    if ($('rsNext')) $('rsNext').onclick = () => { SET.world = w + 1; saveSet(); startObby(w + 1, g.diff); }; if ($('rsRace')) $('rsRace').onclick = () => startRace(w, g.diff);
  }
  function raceResult(list) {
    const g = G; if (!g) return; const net = g.net, w = g.world, d = g.diff; endGame(); V.menuStage(SET.char);
    const pl = list.findIndex(x => x.me) + 1;
    result(pl === 1 ? '🏆 Erster Platz!' : `🏁 Platz ${pl}`, '<div class="podium">' + list.slice(0, 4).map((x, i) => `<div class="pd p${i + 1}${x.me ? ' me' : ''}"><img src="${V.thumb(x.c)}" alt=""><b>${esc(x.n)}</b><small>${x.t ? fmt(x.t) : '–'}</small><div class="blk">${i + 1}</div></div>`).join('') + '</div>',
      net ? [['rsMenu', '☰ Menü'], ['rsLobby', '↻ Zur Lobby', true]] : [['rsMenu', '☰ Menü'], ['rsAgain', '↻ Neues Rennen', true]]);
    $('rsMenu').onclick = () => toMenu(); if ($('rsAgain')) $('rsAgain').onclick = () => startRace(w, d); if ($('rsLobby')) $('rsLobby').onclick = () => lobbyBack();
  }
  function lavaResult() {
    const g = G; if (!g) return; const order = g.out.slice().reverse(); endGame(); V.menuStage(SET.char); const mine = order.findIndex(o => o.me) + 1;
    result(mine === 1 ? '🏆 Du bleibst stehen!' : `🔥 Platz ${mine}`, order.map((o, i) => `<div class="rsl${o.me ? ' me' : ''}"><span>${i + 1}. ${esc(o.n)}</span><b>${fmt(o.t)}</b></div>`).join('') + `<p class="hint">Rekord: ${fmt(ST.lava)}</p>`, [['rsMenu', '☰ Menü'], ['rsAgain', '↻ Nochmal', true]]);
    $('rsMenu').onclick = () => toMenu(); $('rsAgain').onclick = () => startLava();
  }
  function towerResult(h) { endGame(); V.menuStage(SET.char); result(h >= ST.tower ? '🏆 Neuer Rekord!' : '🗼 Torre Infinita', `<div class="bigNum">${h} m</div><p class="hint">Rekord: ${ST.tower} m</p>`, [['rsMenu', '☰ Menü'], ['rsAgain', '↻ Nochmal', true]]); $('rsMenu').onclick = () => toMenu(); $('rsAgain').onclick = () => startTower(); }

  /* ---------- Pause ---------- */
  function pause() { if (!G || G.paused) return; G.paused = true; openOv('ovPause'); $('paCp').hidden = !(G.mode === 'obby' || G.mode === 'race'); }
  function resume() { if (!G) return; closeOv('ovPause'); G.paused = !!G.net && false; G.paused = false; }
  $('bPause').onclick = () => pause(); $('paGo').onclick = () => resume(); $('paOpt').onclick = () => openOv('ovOpts');
  $('paCp').onclick = () => { if (G) { C.respawn(G.W, G.me); G.yaw = G.me.yaw; } resume(); };
  $('paQuit').onclick = () => { const net = G && G.net; document.querySelectorAll('.ov').forEach(o => { o.hidden = true; }); if (net) { endGame(); lobbyBack(); } else toMenu(); };

  /* ---------- Chi lo dice? (Ratespiel) ---------- */
  let Q = null;
  function quizStart() { endGame(); V.menuStage(SET.char); Q = { n: 0, score: 0, streak: 0 }; scr('sQuiz'); quizNext(); }
  function quizNext() {
    if (!Q) return; if (Q.n >= 10) return quizEnd(); Q.n++; const ids = CH.LIST.map(c => c.id), right = pick(ids), opts = [right]; while (opts.length < 4) { const x = pick(ids); if (!opts.includes(x)) opts.push(x); } opts.sort(() => Math.random() - .5);
    const c = charOf(right); Q.cur = { right, line: pick(c.say), opts, done: false, shown: false };
    $('qNum').textContent = `Frage ${Q.n}/10`; $('qScore').textContent = `⭐ ${Q.score}`; $('qText').textContent = '🔊 Hör gut zu …'; $('qText').classList.remove('shown');
    $('qOpts').innerHTML = opts.map((id, i) => `<button class="qo nav" data-c="${id}"><img src="${V.thumb(id)}" alt=""><b>${i + 1}. ${esc(charOf(id).name)}</b></button>`).join('');
    $('qOpts').querySelectorAll('.qo').forEach(b => b.onclick = () => quizAnswer(b));
    setTimeout(() => { if (Q && Q.cur) VO.say(Q.cur.line, c.pitch, 1, true); if (!VO.available || !SET.voice) quizShow(); }, 350); focusFirst();
  }
  function quizShow() { if (!Q || !Q.cur) return; $('qText').textContent = '„' + Q.cur.line + '“'; $('qText').classList.add('shown'); Q.cur.shown = true; }
  function quizAnswer(b) {
    const q = Q && Q.cur; if (!q || q.done) return; q.done = true; const ok = b.dataset.c === q.right; quizShow();
    $('qOpts').querySelectorAll('.qo').forEach(x => { x.classList.toggle('right', x.dataset.c === q.right); if (x === b && !ok) x.classList.add('wrong'); x.disabled = true; });
    if (ok) { Q.streak++; Q.score += 10 + (q.shown ? 0 : 5) + Math.min(5, Q.streak - 1) * 2; sfx('right'); VO.ann('right', true); } else { Q.streak = 0; sfx('wrong'); VO.ann('wrong', true); }
    $('qScore').textContent = `⭐ ${Q.score}`; setTimeout(quizNext, 1900);
  }
  function quizEnd(abort) { if (!Q) return toMenu(); const s = Q.score; Q = null; VO.stop(); if (abort) return toMenu(); if (s > ST.quiz) ST.quiz = s; saveSt(); result(s >= 120 ? '🏆 Brainrot-Experte!' : '🎤 Chi lo dice?', `<div class="bigNum">⭐ ${s}</div><p class="hint">Rekord: ${ST.quiz}</p>`, [['rsMenu', '☰ Menü'], ['rsAgain', '↻ Nochmal', true]]); $('rsMenu').onclick = () => toMenu(); $('rsAgain').onclick = () => quizStart(); }
  $('qBack').onclick = () => quizEnd(true); $('qReplay').onclick = () => { if (Q && Q.cur) VO.say(Q.cur.line, charOf(Q.cur.right).pitch, 1, true); }; $('qShow').onclick = () => quizShow();

  /* ---------- Online (PeerJS-kompatibel über ../cloud/fire-peer.js) ---------- */
  function mkNet(cb) {
    const ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789', PRE = 'brainrot-';
    const N = { role: '', code: '', peer: null, conns: new Map() }; const libs = {};
    const load = (src, ok) => libs[src] || (libs[src] = new Promise((res, rej) => { if (ok()) return res(); const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => { delete libs[src]; rej(new Error('lib')); }; document.head.appendChild(s); }));
    N.loadPeer = () => load('../vendor/peerjs-1.5.4.min.js', () => !!window.Peer); N.loadQR = () => load('../vendor/qrcode-generator-1.4.4.js', () => !!window.qrcode);
    N.norm = s => Array.from(String(s || '').toUpperCase()).filter(c => ALPHA.includes(c)).join('').slice(0, 4);
    N.link = () => { const u = location.href.split('#')[0].split('?')[0] + '?join=' + N.code; return window.EasyGamesLink ? EasyGamesLink.share(u) : u; };
    const mkCode = () => { let c = ''; for (let i = 0; i < 4; i++) c += ALPHA[(Math.random() * ALPHA.length) | 0]; return c; };
    function reg(conn, onOpen) { conn.on('open', () => { N.conns.set(conn.peer, conn); if (onOpen) onOpen(); }); conn.on('data', d => { if (d && typeof d === 'object') cb.onMsg(conn.peer, d); }); const gone = () => { if (N.conns.get(conn.peer) !== conn) return; N.conns.delete(conn.peer); cb.onLeave(conn.peer); }; conn.on('close', gone); conn.on('error', gone); }
    N.host = async function () { N.close(); await N.loadPeer(); for (let k = 0; k < 6 && !N.peer; k++) { const code = mkCode(); const ok = await new Promise(res => { const p = new Peer(PRE + code); let done = false; p.on('open', () => { done = true; N.peer = p; N.code = code; N.role = 'host'; res(true); }); p.on('error', e => { if (!done) { done = true; try { p.destroy(); } catch (x) { } res(e && e.type === 'unavailable-id' ? false : 'err'); } }); }); if (ok === 'err') throw new Error('broker'); } if (!N.peer) throw new Error('code'); N.peer.on('connection', c => reg(c)); N.peer.on('disconnected', () => { try { N.peer.reconnect(); } catch (e) { } }); return N.code; };
    N.join = async function (code) { code = N.norm(code); if (code.length !== 4) throw new Error('code'); N.close(); await N.loadPeer(); await new Promise((res, rej) => { const p = new Peer(); let done = false; const fail = m => { if (done) return; done = true; try { p.destroy(); } catch (x) { } rej(new Error(m)); }; setTimeout(() => fail('timeout'), 14000); p.on('error', e => { if (!done) fail(e && e.type === 'peer-unavailable' ? 'nocode' : 'broker'); }); p.on('open', () => { N.peer = p; N.role = 'guest'; N.code = code; reg(p.connect(PRE + code, { reliable: true }), () => { if (done) return; done = true; res(); }); }); }); };
    N.sendTo = (id, d) => { const c = N.conns.get(id); if (c && c.open) { try { c.send(d); } catch (e) { } } };
    N.send = d => { for (const [, c] of N.conns) if (c.open) { try { c.send(d); } catch (e) { } } };
    N.close = () => { for (const [, c] of N.conns) { try { c.close(); } catch (e) { } } N.conns.clear(); if (N.peer) { try { N.peer.destroy(); } catch (e) { } } N.peer = null; N.role = ''; N.code = ''; };
    return N;
  }
  const netErr = e => ({ nocode: 'Dieses Rennen gibt es nicht (mehr). Stimmt der Code?', timeout: 'Keine Verbindung – bitte nochmal versuchen.', code: 'Bitte den 4-stelligen Code eingeben.' }[e && e.message] || 'Online ist gerade nicht erreichbar. Prüfe das Internet und versuche es nochmal.');
  let NET = null; const L = { players: [], world: 0, diff: 'normale', cid: '' };
  try { L.cid = localStorage.getItem(P_ + 'cid') || ''; } catch (e) { } if (!/^[a-z0-9]{8,16}$/.test(L.cid)) { L.cid = Math.random().toString(36).slice(2, 12).padEnd(8, '0'); try { localStorage.setItem(P_ + 'cid', L.cid); } catch (e) { } }
  function netClose() { if (NET) NET.close(); NET = null; L.players = []; }
  const netSend = m => { if (!NET) return; if (NET.role === 'host') NET.send(m); else NET.send(m); };
  $('onX').onclick = () => closeOv('ovOnline'); $('onHost').onclick = () => { closeOv('ovOnline'); hostLobby(); }; $('onJoin').onclick = () => { closeOv('ovOnline'); joinScreen(''); };
  function lobbyDraw() {
    const list = L.players; const html = list.map(p => `<div class="seat"><img src="${V.thumb(p.ch)}" alt=""><b>${esc(p.name)}</b>${p.host ? '<small>🏠</small>' : ''}</div>`).join('');
    $('lobbyList').innerHTML = html; $('joinList').innerHTML = html; $('lbGo').disabled = list.length < 2;
  }
  function hostLobby() {
    netClose(); scr('sLobby'); $('lbHost').hidden = false; $('lbJoin').hidden = true; $('code').textContent = '····'; $('url').textContent = ''; $('qr').textContent = '…'; $('lobbyMsg').textContent = 'Das Rennen wird vorbereitet …';
    L.players = [{ id: 'host', name: SET.name || 'Gastgeber', ch: SET.char, host: true }]; lobbyDraw();
    seg($('lbWorld'), C.WORLDS.map((w, i) => ({ v: i, n: w.icon + ' ' + w.name })), L.world, v => { L.world = v; }); seg($('lbDiff'), Object.keys(DIFFN).map(v => ({ v, n: DIFFN[v] })), L.diff, v => { L.diff = v; });
    NET = mkNet({ onMsg: hostMsg, onLeave: id => { const p = L.players.find(x => x.id === id); if (!p) return; if (G && G.ghosts.has(id)) { const gh = G.ghosts.get(id); gh.left = true; V.removeActor(gh.a); G.ghosts.delete(id); } L.players = L.players.filter(x => x !== p); lobbyDraw(); NET.send({ t: 'lob', players: L.players }); toast('📴 ' + p.name + ' ist weg'); } });
    NET.host().then(async code => { $('code').textContent = code; $('url').textContent = NET.link(); $('lobbyMsg').textContent = 'Freunde: Kamera auf den QR-Code oder den Code eingeben.'; try { await NET.loadQR(); const q = qrcode(0, 'M'); q.addData(NET.link()); q.make(); $('qr').innerHTML = q.createSvgTag({ cellSize: 4, margin: 0, scalable: true }); } catch (e) { $('qr').textContent = code; } }).catch(e => { $('lobbyMsg').textContent = netErr(e); });
  }
  function hostMsg(id, m) {
    if (m.t === 'hi') { if (G) return NET.sendTo(id, { t: 'full', msg: 'Das Rennen läuft schon – gleich geht es weiter.' }); if (L.players.length >= 8) return NET.sendTo(id, { t: 'full', msg: 'Das Rennen ist voll (8 Spieler).' }); L.players.push({ id, name: String(m.name || 'Gast').slice(0, 14), ch: CH.byId(m.ch).id }); lobbyDraw(); NET.send({ t: 'lob', players: L.players }); toast('🌐 ' + m.name + ' ist dabei!'); sfx('ok'); return; }
    if (m.t === 'pos' || m.t === 'fin') { ghostMsg(id, m); NET.send(Object.assign({}, m, { id })); }
  }
  $('lbCopy').onclick = () => { if (!NET || !NET.code) return; const u = NET.link(); try { navigator.clipboard.writeText(u).then(() => toast('🔗 Link kopiert')); } catch (e) { toast(u); } };
  $('lbBack').onclick = () => { netClose(); toMenu(); };
  $('lbGo').onclick = () => { if (!NET || L.players.length < 2) return; const seed = (Math.random() * 1e6) | 0; L.players.forEach((p, i) => { p.slot = i; }); NET.send({ t: 'start', world: L.world, diff: L.diff, seed, players: L.players }); netStart({ world: L.world, diff: L.diff, seed, players: L.players }, 'host'); };
  function joinScreen(code) { netClose(); scr('sLobby'); $('lbHost').hidden = true; $('lbJoin').hidden = false; $('jName').value = SET.name || ''; $('jCode').value = code || ''; $('jMsg').textContent = 'Gib den Code deines Freundes ein.'; $('joinList').innerHTML = ''; }
  $('jBack').onclick = () => { netClose(); toMenu(); };
  $('jGo').onclick = async () => {
    const code = $('jCode').value.trim(), name = $('jName').value.trim().slice(0, 14) || 'Gast'; SET.name = name; saveSet(); $('jMsg').textContent = 'Verbinde …'; $('jGo').disabled = true; S.ctx();
    NET = mkNet({ onMsg: guestMsg, onLeave: () => { toast('📴 Verbindung zum Gastgeber verloren'); if (G) { endGame(); } toMenu(); } });
    try { await NET.join(code); NET.send({ t: 'hi', name, ch: SET.char, cid: L.cid }); $('jMsg').textContent = '✅ Verbunden! Warte auf den Start …'; } catch (e) { $('jMsg').textContent = netErr(e); }
    $('jGo').disabled = false;
  };
  function guestMsg(id, m) {
    if (m.t === 'full') { $('jMsg').textContent = m.msg; return; }
    if (m.t === 'lob') { L.players = m.players; lobbyDraw(); return; }
    if (m.t === 'start') { netStart(m, 'guest'); return; }
    if ((m.t === 'pos' || m.t === 'fin') && m.id) { if (m.id === NET.myId) return; ghostMsg(m.id, m); }
    if (m.t === 'lobby') { if (G) endGame(); scr('sLobby'); }
  }
  function netStart(m, role) {
    const myId = role === 'host' ? 'host' : (NET.peer && NET.peer.id); NET.myId = myId; const me = m.players.find(p => p.id === myId) || {};
    startRace(m.world, m.diff, { seed: m.seed, slot: me.slot || 0 });
    for (const p of m.players) { if (p.id === myId) continue; const a = V.addActor(p.ch, p.name, '#8affc8', true), P = C.newPlayer(G.W); G.ghosts.set(p.id, { a, P, name: p.name, ch: p.ch, tx: P.x, ty: P.y, tz: P.z, done: false }); }
    G.sendT = 0;
  }
  function ghostMsg(id, m) {
    if (!G || !G.ghosts) return; const gh = G.ghosts.get(id); if (!gh) return;
    if (m.t === 'pos') { gh.tx = m.x; gh.ty = m.y; gh.tz = m.z; gh.P.yaw = m.yaw; gh.P.vx = m.vx; gh.P.vz = m.vz; gh.P.ground = m.g ? {} : null; gh.P.air = m.g ? 0 : 1; gh.P.dead = m.d ? 1 : 0; gh.pi = m.pi; gh.P.groundY = m.gy; }
    if (m.t === 'fin') { gh.done = true; gh.time = m.time; toast('🏁 ' + gh.name + ' ist im Ziel!'); }
  }
  function netTick(dt) { G.sendT -= dt; if (G.sendT > 0) return; G.sendT = .08; const P = G.me; const m = { t: 'pos', x: +P.x.toFixed(2), y: +P.y.toFixed(2), z: +P.z.toFixed(2), yaw: +P.yaw.toFixed(2), vx: +P.vx.toFixed(1), vz: +P.vz.toFixed(1), g: P.ground ? 1 : 0, d: P.dead > 0 ? 1 : 0, pi: progress(P), gy: +(P.groundY || 0).toFixed(2) }; if (NET.role === 'host') NET.send(Object.assign(m, { id: 'host' })); else NET.send(m); }
  function lobbyBack() { if (NET && NET.role === 'host') { NET.send({ t: 'lobby' }); scr('sLobby'); $('lbHost').hidden = false; $('lbJoin').hidden = true; lobbyDraw(); } else if (NET) { scr('sLobby'); $('lbHost').hidden = true; $('lbJoin').hidden = false; $('jMsg').textContent = 'Warte auf das nächste Rennen …'; } else toMenu(); }

  /* ---------- Hauptschleife ---------- */
  let last = performance.now(), titleT = 0, slow = 0, fast = 0;
  function frame(now) {
    const raw = (now - last) / 1000, dt = Math.min(.05, raw); last = now;
    // automatische Qualität: dauerhaft unter ~25 Bildern/s → einfacher rendern
    if (G && !G.paused && raw < 1) { if (raw > .04) { slow += raw; fast = 0; } else { fast += raw; if (fast > 3) slow = 0; } if (slow > 2.5 && V.quality() > 0) { V.quality(V.quality() - 1); slow = 0; } }
    try {
      menuPad(dt);
      if (G && !G.paused) { const n = dt > .025 ? 2 : 1; for (let i = 0; i < n; i++) step(dt / n); V.render(dt); }
      else if (G) V.render(0);
      else { V.menuFrame(dt, cur === 'sChars' ? .9 : .5, cur === 'sMenu' && innerWidth > 800 ? -1.6 : 0); V.render(dt); }
      if (cur === 'sTitle') { titleT += dt; if (titleT > 6) { titleT = 0; const c = pick(CH.LIST); V.menuStage(c.id); } }
    } catch (e) { console.error(e); }
    requestAnimationFrame(frame);
  }
  addEventListener('resize', () => V.resize(innerWidth, innerHeight));
  addEventListener('gamepadconnected', () => { toast('🎮 Controller verbunden'); $('pressTxt').textContent = 'Drücke A'; });
  function pressStart() { S.ctx(); sfx('ok'); toMenu(); VO.char(charOf(SET.char)); }
  $('bPress').onclick = pressStart; $('sTitle').addEventListener('click', e => { if (e.target.closest('a') || e.target.closest('#bPress')) return; if (cur === 'sTitle') pressStart(); });
  const TIPS = ['Spaghetti werden gekocht …', 'Pinguine putzen ihre Gabeln …', 'Toast wird getoastet …', 'Brainrot wird geladen …'];
  const bar = p => { $('loadBar').style.width = Math.round(p * 100) + '%'; $('loadTip').textContent = TIPS[Math.min(TIPS.length - 1, Math.floor(p * TIPS.length))]; };
  (async function boot() {
    const t0 = performance.now(); bar(.15); await new Promise(r => setTimeout(r, 30));
    try { V.init($('cv')); V.resize(innerWidth, innerHeight); if (/[?&]lowfx/.test(location.search)) V.quality(0); bar(.5); await new Promise(r => setTimeout(r, 30)); V.menuStage(SET.char); } catch (e) { console.error(e); toast('3D wird von diesem Gerät nicht unterstützt'); }
    bar(.85); requestAnimationFrame(frame);
    await new Promise(r => setTimeout(r, Math.max(0, 900 - (performance.now() - t0)))); bar(1);
    $('sLoad').classList.add('out'); setTimeout(() => { $('sLoad').classList.remove('on', 'out'); }, 460);
    const q = new URLSearchParams(location.search), jc = q.get('join');
    if (jc) { joinScreen(jc.toUpperCase()); return; }
    scr('sTitle');
  })();
  // Test-Hilfe: Spielzeit simulieren (ohne Bildaufbau)
  function sim(sec) { for (let i = 0; i < sec * 60 && G && !G.paused; i++) step(1 / 60); }
  window.BRApp = { sim, get G() { return G; }, SET, ST, A, TS, startObby, startRace, startLava, startTower, quizStart, toMenu, get Q() { return Q; }, L, C };
})();
