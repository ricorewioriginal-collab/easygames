/* Küchen-Chaos – Ablauf: Laden, Titel, Konsolen-Menü, Küchenwahl mit Sternen, Schicht mit HUD (Bestellzettel, Münzen, Uhr),
 * Feierabend-Bildschirm (Game Over mit Sternen), Pause, Einstellungen, Anleitung.
 * Mehrspieler: Fernseher = Küche; Handys (online über ../cloud/fire-peer.js, Links über EasyGamesLink.share), Controller
 * und Tastatur kochen zusammen, freie Plätze übernehmen Computer-Köche. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id), P = 'kuechen-chaos-';
  const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } } };
  const D = KC_DATA, { RECIPES, LEVELS, ING, CHEFS } = D, V = window.KCView, S = window.KCSound;
  const SET = Object.assign({ sound: true, music: true, helper: true, vib: true, name: '', bots: 1, kb: false, lv: 0 }, LS.get(P + 'settings', {}));
  const saveSet = () => LS.set(P + 'settings', SET);
  const ST = Object.assign({ best: {}, stars: {}, games: 0, served: 0 }, LS.get(P + 'stats', {}));
  const saveSt = () => { LS.set(P + 'stats', ST); const sum = LEVELS.reduce((a, l) => a + (ST.best[l.id] || 0), 0); if (sum > (LS.get(P + 'highscore', 0) || 0)) LS.set(P + 'highscore', sum); };
  const unlocked = li => li === 0 || (ST.stars[LEVELS[li - 1].id] || 0) >= 1;
  const totalStars = () => LEVELS.reduce((a, l) => a + (ST.stars[l.id] || 0), 0);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const coarse = () => matchMedia('(pointer: coarse)').matches;
  const vib = ms => { if (SET.vib && navigator.vibrate) try { navigator.vibrate(ms); } catch (e) { } };
  const sfx = n => { if (SET.sound && S.sfx[n]) S.sfx[n](); };
  const fmt = t => { t = Math.max(0, Math.ceil(t)); return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0'); };
  const partIcon = p => p === 'bun' ? '🍞' : p.startsWith('soup:') ? '🍲' : ING[p.split(':')[0]].icon;
  const heldIcon = h => !h ? '✋' : h.t === 'ing' ? ING[h.ing].icon : h.t === 'plate' ? '🍽️' : h.t === 'pot' ? '🍲' : h.t === 'pan' ? '🍳' : h.t === 'ext' ? '🧯' : h.t === 'dirty' ? '🧽' : '✋';
  let toastT = 0; function toast(m, ms) { const t = $('toast'); t.textContent = m; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, ms || 2600); }
  S.setVol('sfx', SET.sound ? .8 : 0);

  /* ---------- Bildschirme & Navigation ---------- */
  let cur = 'sLoad';
  const BACK = { sMenu: () => scr('sTitle'), sLevels: () => toMenu(), sHelp: () => toMenu(), sLobby: () => { netClose(); toMenu(); }, sPhone: () => { if (!$('pJoin').hidden) { netClose(); toMenu(); } }, sResult: () => { const b = $('reBtns').querySelector('.pri'); if (b) b.click(); } };
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
  function menuStat() { $('menuStat').innerHTML = `<span>⭐ ${totalStars()}/${LEVELS.length * 3}</span><span>🍽️ ${ST.served} serviert</span><span>🪙 ${LEVELS.reduce((a, l) => a + (ST.best[l.id] || 0), 0)}</span>`; }
  function toMenu() { endGameView(); netClose(); closeAllOv(); menuStat(); scr('sMenu'); music(false); }
  document.querySelectorAll('#mList .mi').forEach(b => {
    b.onfocus = b.onmouseenter = () => { $('mInfo').textContent = b.dataset.i; };
    b.onclick = () => { sfx('ok'); const g = b.dataset.go; if (g === 'solo') levelsScreen(); else if (g === 'host') openLobby(); else if (g === 'join') phoneScreen(''); else if (g === 'opts') openOv('ovOpts'); else if (g === 'help') { helpScreen(); scr('sHelp'); } };
  });
  $('mInfo').textContent = $('mList').firstElementChild.dataset.i;
  $('helpBack').onclick = () => toMenu(); $('lvBack').onclick = () => toMenu(); $('lvTut').onclick = () => { sfx('ok'); startTutorial(); };
  function helpScreen() { $('recipeList').innerHTML = Object.keys(RECIPES).map(k => { const r = RECIPES[k]; return `<div class="rc"><i>${r.icon}</i><b>${esc(r.n)}</b><small>${r.parts.map(p => partIcon(p) + (p.endsWith(':c') ? ' geschnitten' : p.endsWith(':k') ? ' gebraten' : p.startsWith('soup:') ? ' 3× ' + ING[p.slice(5)].icon + ' im Topf' : '')).join(' + ')}</small></div>`; }).join(''); }
  const menuIcons = L => L.menu.map(r => RECIPES[r].icon).join('');
  function levelCards(el, small, onPick) {
    el.innerHTML = LEVELS.map((L, i) => { const u = small || unlocked(i), st = ST.stars[L.id] || 0, th = D.THEMES[L.theme]; return `<button class="lv nav${SET.lv === i && small ? ' on' : ''}" data-i="${i}" ${u ? '' : 'disabled'} style="--a:${th.counter};--b:${th.sky}"><span class="no">${i + 1}</span><b>${u ? esc(L.n) : '🔒 ' + esc(L.n)}</b><small>${esc(L.d)}</small><span class="mn">${menuIcons(L)}</span><span class="st">${'★'.repeat(st)}<em>${'★'.repeat(3 - st)}</em></span>${ST.best[L.id] ? `<span class="bs">🪙 ${ST.best[L.id]}</span>` : ''}</button>`; }).join('');
    el.querySelectorAll('.lv').forEach(b => { b.onfocus = () => { if (!small) $('lvInfo').textContent = LEVELS[+b.dataset.i].d; }; b.onclick = () => { sfx('ok'); onPick(+b.dataset.i, b); }; });
  }
  function levelsScreen() { levelCards($('lvGrid'), false, li => li === 0 && !ST.tut ? startTutorial() : startSolo(li)); $('lvInfo').textContent = unlocked(1) ? 'Wähle eine Küche.' : 'Hol in einer Küche mindestens einen Stern, um die nächste freizuschalten.'; scr('sLevels'); }

  /* ---------- Einstellungen ---------- */
  const OPT = { oSound: 'sound', oMusic: 'music', oHelper: 'helper', oVib: 'vib' };
  for (const id in OPT) { const el = $(id); el.checked = !!SET[OPT[id]]; el.onchange = () => { SET[OPT[id]] = el.checked; saveSet(); S.setVol('sfx', SET.sound ? .8 : 0); if (id === 'oMusic') music(!!A.G); if (id === 'oHelper' && A.G && A.solo) soloHelper(); }; }
  $('oName').value = SET.name; $('oName').onchange = () => { SET.name = $('oName').value.trim().slice(0, 14); saveSet(); };
  $('optX').onclick = () => closeOv('ovOpts');
  const music = on => S.music(on && SET.music);

  /* ---------- Eingaben ---------- */
  const keys = new Set();
  const kbIn = () => { const k = c => keys.has(c); return { mx: (k('KeyD') || k('ArrowRight') ? 1 : 0) - (k('KeyA') || k('ArrowLeft') ? 1 : 0), mz: (k('KeyS') || k('ArrowDown') ? 1 : 0) - (k('KeyW') || k('ArrowUp') ? 1 : 0), pick: k('Space') || k('KeyE') || k('Enter'), use: k('KeyF') || k('ControlLeft') || k('ControlRight') || k('KeyJ'), dash: k('ShiftLeft') || k('ShiftRight'), sw: k('Tab') || k('KeyQ') }; };
  let PADS = [];
  function readPads() {
    let list = []; try { list = navigator.getGamepads ? Array.from(navigator.getGamepads()) : []; } catch (e) { }
    PADS = []; list.forEach(gp => { if (!gp || !gp.connected) return; const ax = gp.axes || [], bt = gp.buttons || [], v = k => bt[k] ? (bt[k].value || (bt[k].pressed ? 1 : 0)) : 0;
      let x = Math.abs(ax[0] || 0) > .2 ? ax[0] : 0, z = Math.abs(ax[1] || 0) > .2 ? ax[1] : 0; if (v(14) > .5) x = -1; if (v(15) > .5) x = 1; if (v(12) > .5) z = -1; if (v(13) > .5) z = 1;
      if (x || z || v(0) > .5 || v(2) > .5) A.dev = 'pad';
      PADS[gp.index] = { mx: x, mz: z, pick: v(0) > .5, use: v(2) > .5 || v(7) > .5, dash: v(1) > .5 || v(6) > .5, sw: v(3) > .5, start: v(9) > .5, back: v(8) > .5 }; });
  }
  const TOUCH = { x: 0, y: 0, a: 0, u: 0, d: 0, w: 0 };
  KCTouch.build($('tpad'), TOUCH, [['a', 'NEHMEN', 0, 1, '✋'], ['u', 'BENUTZEN', -1, 0, '🔪'], ['d', 'SPRINT', 1, 0, '💨'], ['w', 'WECHSELN', 0, -1, '⇄']]);
  const merge = list => { const o = { mx: 0, mz: 0, pick: false, use: false, dash: false, sw: false }; for (const q of list) { if (!q) continue; o.mx += q.mx; o.mz += q.mz; o.pick = o.pick || q.pick; o.use = o.use || q.use; o.dash = o.dash || q.dash; o.sw = o.sw || q.sw; } o.mx = clamp(o.mx, -1, 1); o.mz = clamp(o.mz, -1, 1); return o; };
  const touchIn = () => ({ mx: TOUCH.x, mz: TOUCH.y, pick: !!TOUCH.a, use: !!TOUCH.u, dash: !!TOUCH.d, sw: !!TOUCH.w });

  /* ---------- Schicht ---------- */
  const A = { dev: coarse() ? 'touch' : 'kb', G: null, seats: [], solo: false, ctrl: 0, swPrev: false, acc: 0, paused: false, count: 0, endT: 0, speed: 1, li: 0, oids: '', bubbles: [] };
  function startSolo(li) {
    SET.lv = li; saveSet();
    startGame({ li, solo: true, chefs: [{ name: SET.name || 'Du', look: 0 }, { name: SET.helper ? 'Kochomat' : 'Koch 2', look: 1, bot: SET.helper }], seats: [{ kind: 'solo' }] });
  }
  function startTutorial() { startGame({ li: 0, solo: true, tutorial: true, chefs: [{ name: SET.name || 'Du', look: 0 }], seats: [{ kind: 'solo' }] }); }
  function soloHelper() { const G = A.G; G.chefs.forEach((c, i) => { const want = i !== A.ctrl && SET.helper; if (c.bot !== want) { c.bot = want; c.B = null; for (const k in G.claims) if (G.claims[k] === i) delete G.claims[k]; } }); }
  function startGame(cfg) {
    endGameView(); closeAllOv();
    A.cfg = cfg; A.li = cfg.li; A.solo = !!cfg.solo; A.seats = cfg.seats; A.ctrl = 0; A.acc = 0; A.paused = false; A.endT = 0; A.oids = ''; A.bubbles = [];
    A.G = KC.newGame(cfg.li, cfg.chefs, { seed: (Math.random() * 1e9) | 0, tutorial: cfg.tutorial }); A.tutDone = 0; V.setHint(-1);
    V.setLevel(A.G, $('ovl')); V.resize(innerWidth, innerHeight);
    scr('sGame'); document.body.classList.add('playing');
    $('tpad').hidden = !(coarse() && (A.solo || A.seats.some(s => s.kind === 'kb')));
    document.body.classList.toggle('touchp', !$('tpad').hidden);
    $('tpad').querySelector('.tb-w').style.visibility = A.solo ? '' : 'hidden';
    $('lvName').textContent = cfg.tutorial ? '🎓 Übungsküche' : LEVELS[cfg.li].n; $('tut').hidden = !cfg.tutorial; document.body.classList.toggle('tutor', !!cfg.tutorial); $('hintL').hidden = !A.solo || !!cfg.tutorial;
    if (cfg.tutorial) { A.count = 0; $('big').hidden = true; } else { A.count = 4.2; bigTxt('Heute auf der Karte:\n' + LEVELS[cfg.li].menu.map(r => RECIPES[r].icon + ' ' + RECIPES[r].n).join(' · '), 'menu'); }
    music(true); netAll({ t: 'st', ph: 'game', score: 0, time: A.G.t, lv: LEVELS[cfg.li].n });
    hud(0);
  }
  function endGameView() { if (!A.G) return; A.G = null; V.setHint(-1); $('tut').hidden = true; $('hintL').hidden = true; document.body.classList.remove('playing', 'touchp'); $('ovl').innerHTML = ''; $('tpad').hidden = true; KCTouch.reset(); S.sizzleOn(0); music(false); }
  let bigT = 0; function bigTxt(t, cls, ms) { const e = $('big'); e.textContent = t; e.className = 'big ' + (cls || ''); e.hidden = false; void e.offsetWidth; e.classList.add('pop'); clearTimeout(bigT); if (ms) bigT = setTimeout(() => { e.hidden = true; }, ms); }
  function inputsFor(G) {
    readPads(); const inp = [];
    if (A.solo) {
      const q = merge([kbIn(), touchIn()].concat(PADS)); inp[A.ctrl] = q;
      if (q.sw && !A.swPrev && G.chefs.length > 1) { A.ctrl = (A.ctrl + 1) % G.chefs.length; soloHelper(); sfx('pick'); vib(15); } A.swPrev = q.sw;
      return inp;
    }
    A.seats.forEach(s => {
      if (s.chef == null) return;
      if (s.kind === 'kb') inp[s.chef] = merge([kbIn(), touchIn()]);
      else if (s.kind === 'pad') inp[s.chef] = PADS[s.pad] || {};
      else if (s.kind === 'net') { const n = s.in || {}, pk = s.pkQ > 0 && !s.pkLast, da = s.daQ > 0 && !s.daLast; if (pk) s.pkQ--; if (da) s.daQ--; s.pkLast = pk; s.daLast = da; inp[s.chef] = { mx: n.x || 0, mz: n.y || 0, use: !!n.u, pick: pk, dash: da }; }
    });
    return inp;
  }
  const EV_SFX = { pick: 'pick', put: 'put', combine: 'combine', nope: 'nope', chop: 'chop', chopped: 'chopped', serve: 'serve', wrong: 'wrong', expire: 'expire', order: 'order', fire: 'fire', out: 'out', done: 'done', warn: 'warn', trash: 'trash', wash: 'wash', washed: 'washed', dash: 'dash', plateback: 'plateback' };
  function onEvent(G, e) {
    if (EV_SFX[e.e]) sfx(EV_SFX[e.e]);
    if (e.e === 'serve') { gToast('+' + e.pts + ' 🪙' + (e.tip >= 6 ? ' Super!' : ''), 'good'); vib(30); netChef(e.i, { t: 'ev', e: 'serve' }); }
    else if (e.e === 'expire') gToast('Bestellung verpasst! −10', 'bad');
    else if (e.e === 'wrong') gToast('Das hat niemand bestellt!', 'bad');
    else if (e.e === 'fire') { gToast('🔥 FEUER! Feuerlöscher holen!', 'bad'); vib([80, 50, 80]); netAll({ t: 'ev', e: 'fire' }); }
    else if (e.e === 'chop' && e.i === A.ctrl && A.solo) vib(8);
  }
  let gtT = 0; function gToast(t, cls) { const e = $('toastG'); e.textContent = t; e.className = 'toastG ' + cls; void e.offsetWidth; e.classList.add('pop'); clearTimeout(gtT); gtT = setTimeout(() => { e.className = 'toastG'; }, 1600); }
  function gameFrame(dt) {
    const G = A.G;
    if (!A.paused) {
      if (A.count > 0) { const c0 = Math.ceil(A.count); A.count -= dt; const c = Math.ceil(A.count); if (c !== c0) { if (c >= 1 && c <= 3) { bigTxt(String(c), '', 900); sfx('tick'); } else if (c <= 0) { bigTxt('LOS!', 'go', 800); sfx('go'); } } readPads(); }
      else if (!G.over) {
        A.acc += dt * A.speed; let n = 0;
        while (A.acc >= 1 / 60 && n++ < Math.max(6, A.speed * 6)) { A.acc -= 1 / 60; KC.step(G, 1 / 60, inputsFor(G)); for (const e of G.events) onEvent(G, e); if (G.over) break; }
        if (A.acc > .1) A.acc = 0;
        let cooking = 0; for (const ti of G.idx.stove || []) { const c = G.tiles[ti].it; if (c && !c.burnt && c.parts.length && (c.t === 'pan' || c.parts.length === 3)) cooking++; } S.sizzleOn(SET.sound ? cooking : 0);
      } else { A.endT += dt; if (A.endT > 1.6) return finish(); }
      hud(dt); netPush(dt); if (A.cfg.tutorial) tutFrame(dt); else if (A.solo) hintLine();
    }
    V.render(dt, { names: !A.solo || G.chefs.length > 1, noMark: false });
    bubbles(dt);
  }
  function hud(dt) {
    const G = A.G; $('score').textContent = G.score; $('clock').textContent = fmt(G.t); $('clock').classList.toggle('hurry', G.t < 30);
    $('combo').textContent = G.combo > 1 ? '🔥 Serie ×' + G.combo : '';
    const ids = G.orders.map(o => o.id).join();
    if (ids !== A.oids) { A.oids = ids; $('orders').innerHTML = G.orders.map(o => { const r = RECIPES[o.r]; return `<div class="tk" data-id="${o.id}"><div class="tkT"><i>${r.icon}</i><b>${esc(r.n)}</b></div><div class="tkP">${r.parts.map(p => `<span>${partIcon(p)}${p.startsWith('soup:') ? '<small>×3</small>' : ''}</span>`).join('')}</div><div class="tkB"><i></i></div></div>`; }).join(''); }
    const tks = $('orders').children; G.orders.forEach((o, k) => { const e = tks[k]; if (!e) return; const p = o.t / o.max, b = e.lastChild.firstChild; b.style.width = Math.round(p * 100) + '%'; b.style.background = p > .5 ? '#3ad06a' : p > .25 ? '#ffb020' : '#ff3a3a'; e.classList.toggle('late', p < .25); });
    if (!$('tpad').hidden && A.solo) { const ch = G.chefs[A.ctrl]; const ic = heldIcon(ch.held); if (A.tIc !== ic) { A.tIc = ic; $('tpad').querySelector('.tb-a i').textContent = ch.held ? '⬇' : '✋'; } }
  }
  /* ---------- Übungsküche & Tipps ---------- */
  const LBL = () => A.dev === 'pad' ? { N: 'A', U: 'X' } : A.dev === 'kb' ? { N: 'Leertaste', U: 'F' } : { N: 'NEHMEN', U: 'BENUTZEN' };
  const tileOf = (G, f) => { let best = -1, bd = 1e9; const me = G.chefs[A.ctrl]; G.tiles.forEach((t, i) => { if (!f(t)) return; const d = Math.hypot(t.c + .5 - me.x, t.r + .5 - me.z); if (d < bd) { bd = d; best = i; } }); return best; };
  const isLet = (it, st) => it && it.t === 'ing' && it.ing === 'lettuce' && (!st || it.st === st);
  function tutFrame(dt) {
    const G = A.G, me = G.chefs[A.ctrl], h = me.held, { N, U } = LBL(), k = s => '<kbd>' + s + '</kbd>';
    let tgt = -1, txt = '', sub = '';
    if (G.served) { A.tutDone += dt; txt = '🎉 Geschafft – das war schon die ganze Kunst!'; sub = 'Gleich geht die echte Schicht los. Dein Kollege, der Computer-Koch, hilft dir dabei.'; if (A.tutDone > 3.2) { ST.tut = true; saveSt(); startSolo(0); return; } }
    else if (h && h.t === 'plate' && h.parts.includes('lettuce:c')) { tgt = tileOf(G, t => t.kind === 'serve'); txt = '6️⃣ Bring den Teller zur gelben Ausgabe und drück ' + k(N); sub = 'Dort holen die Gäste ihr Essen ab.'; }
    else if (isLet(h, 'c')) { tgt = tileOf(G, t => t.kind === 'plates'); txt = '5️⃣ Geh zum 🍽️ Tellerstapel und drück ' + k(N); sub = 'Der Salat landet dabei auf einem Teller.'; }
    else if (isLet(h, 'raw')) { tgt = tileOf(G, t => t.kind === 'board' && !t.it); txt = '2️⃣ Leg den Salat aufs Schneidebrett: hinlaufen und ' + k(N); sub = 'Die Bretter sind die hellen Holzflächen.'; }
    else if (h && h.t !== 'ing') { tgt = tileOf(G, t => t.kind === 'counter' && !t.it); txt = 'Stell das erst ab: an eine freie Theke laufen und ' + k(N); }
    else if (h) { tgt = tileOf(G, t => t.kind === 'trash'); txt = 'Das brauchen wir nicht – ab in den Mülleimer mit ' + k(N); }
    else { const bc = tileOf(G, t => t.kind === 'board' && isLet(t.it, 'c')), br = tileOf(G, t => t.kind === 'board' && isLet(t.it, 'raw')), lying = tileOf(G, t => t.kind !== 'board' && isLet(t.it));
      if (bc >= 0) { tgt = bc; txt = '4️⃣ Fertig geschnitten! Nimm den Salat mit ' + k(N); }
      else if (br >= 0) { tgt = br; txt = '3️⃣ Halte ' + k(U) + ' gedrückt, bis der Salat geschnitten ist'; sub = 'Der grüne Balken zeigt, wie weit du bist.'; }
      else if (lying >= 0) { tgt = lying; txt = 'Nimm den Salat wieder auf: hinlaufen und ' + k(N); }
      else { tgt = tileOf(G, t => t.kind === 'crate' && t.ing === 'lettuce'); txt = '1️⃣ Lauf zur 🥬 Salat-Kiste (gelber Pfeil) und drück ' + k(N); sub = A.dev === 'touch' ? 'Laufen: links den Joystick ziehen.' : A.dev === 'pad' ? 'Laufen: linker Stick.' : 'Laufen: WASD oder Pfeiltasten.'; } }
    V.setHint(tgt); const html = txt + '|' + sub; if (A.tutHtml !== html) { A.tutHtml = html; $('tutT').innerHTML = txt; $('tutS').textContent = sub; }
  }
  const NAME = it => !it ? '' : it.t === 'ing' ? ING[it.ing].icon + ' ' + ING[it.ing].n + (it.st === 'c' ? ' (geschnitten)' : it.st === 'x' ? ' (verbrannt)' : '') : it.t === 'plate' ? '🍽️ Teller' : it.t === 'pot' ? '🍲 Topf' : it.t === 'pan' ? '🍳 Pfanne' : it.t === 'ext' ? '🧯 Feuerlöscher' : it.t === 'dirty' ? 'dreckige Teller' : '';
  function hintLine() {
    const G = A.G, me = G.chefs[A.ctrl], h = me.held, t = me.tgt >= 0 ? G.tiles[me.tgt] : null, { N, U } = LBL(), k = s => '<kbd>' + s + '</kbd>'; let x;
    if (h && h.t === 'ext') x = G.tiles.some(q => q.fire > 0) ? k(U) + ' halten: Feuer löschen' : k(N) + ' an einer Theke: Feuerlöscher abstellen';
    else if (!t) x = h ? 'Du trägst ' + NAME(h) + (h.t === 'ing' && h.st === 'raw' && ING[h.ing].chop ? ' – ab aufs Schneidebrett!' : ' – lauf zu einer Station') : 'Lauf zu einer Kiste und nimm eine Zutat';
    else if (t.fire > 0) x = '🔥 Es brennt! Hol den 🧯 Feuerlöscher';
    else if (t.kind === 'crate') x = h ? 'Hände voll – erst ablegen' : k(N) + ': ' + ING[t.ing].icon + ' ' + ING[t.ing].n + ' nehmen';
    else if (t.kind === 'board' && !h && t.it && t.it.t === 'ing' && t.it.st === 'raw' && ING[t.it.ing].chop) x = k(U) + ' halten: schneiden';
    else if (t.kind === 'sink') x = h && h.t === 'dirty' ? k(N) + ': Teller in die Spüle' : t.n ? k(U) + ' halten: Teller spülen' : 'Spüle – hier werden dreckige Teller gewaschen';
    else if (t.kind === 'ret') x = t.n ? k(N) + ': dreckige Teller nehmen (ab in die Spüle)' : 'Hier kommen benutzte Teller zurück';
    else if (t.kind === 'serve') x = h && h.t === 'plate' && h.parts.length ? k(N) + ': servieren' : 'Ausgabe – fertige Teller hierher';
    else if (t.kind === 'plates') x = !h ? (t.n ? k(N) + ': Teller nehmen' : 'Keine Teller mehr – spülen!') : h.t === 'ing' ? k(N) + ': auf einen Teller legen' : k(N) + ': Teller zurücklegen';
    else if (t.kind === 'trash') x = h ? k(N) + ': wegwerfen' : 'Mülleimer';
    else if (t.kind === 'stove') { const c = t.it; x = !c ? (h && (h.t === 'pot' || h.t === 'pan') ? k(N) + ': auf den Herd stellen' : 'Leerer Herd') : h && h.t === 'ing' ? k(N) + ': hinein in ' + NAME(c) : h && h.t === 'plate' ? k(N) + ': anrichten' : c.burnt ? k(N) + ': nehmen und in den Müll' : KC.contentKey(c) ? 'Fertig! Teller holen und hier anrichten' : c.parts.length ? (c.t === 'pot' && c.parts.length < 3 ? 'Topf: noch ' + (3 - c.parts.length) + ' geschnittene Zutat(en) rein' : 'Kocht …') : c.t === 'pot' ? 'Topf: 3 gleiche geschnittene Zutaten für Suppe' : 'Pfanne: geschnittenes Fleisch oder Fisch'; }
    else x = !h ? (t.it ? k(N) + ': ' + NAME(t.it) + ' nehmen' : 'Freie Theke') : !t.it ? k(N) + ': abstellen' : k(N) + ': zusammenlegen';
    if (A.hintX !== x) { A.hintX = x; $('hintL').innerHTML = x; }
  }
  function bubbles(dt) {
    A.bubbles = A.bubbles.filter(b => { b.t -= dt; if (b.t <= 0) { b.el.remove(); return false; } const ch = A.G && A.G.chefs[b.i]; if (ch) { const [x, y] = V.screenOf(ch.x, 1.9, ch.z); b.el.style.transform = `translate(${x}px,${y}px) translate(-50%,-100%)`; } return true; });
  }
  function shout(i, txt) { const el = document.createElement('div'); el.className = 'shout'; el.textContent = txt; $('ovl').appendChild(el); A.bubbles.push({ i, el, t: 2.2 }); sfx('order'); }
  function pause() { if (!A.G || A.paused || A.G.over) return; A.paused = true; S.sizzleOn(0); openOv('ovPause'); }
  function resume() { if (!A.G) return; closeOv('ovPause'); A.paused = false; }
  $('bPause').onclick = () => pause(); $('paGo').onclick = () => resume();
  $('paRe').onclick = () => { closeAllOv(); restart(); };
  $('paOpt').onclick = () => openOv('ovOpts');
  $('paQuit').onclick = () => { closeAllOv(); if (A.G) { A.G.t = 0.01; A.paused = false; } };
  function restart() { const c = A.cfg; if (c.tutorial) return startTutorial(); if (A.solo) startSolo(c.li); else startGame(Object.assign({}, c, { chefs: c.chefs.map(x => Object.assign({}, x)) })); }

  /* ---------- Feierabend (Game Over) ---------- */
  function finish() {
    if (A.cfg.tutorial) { endGameView(); return levelsScreen(); }
    const G = A.G, L = LEVELS[A.li], stars = KC.stars(G), old = ST.best[L.id] || 0, rec = G.score > old;
    ST.games++; ST.served += G.served; if (rec) ST.best[L.id] = G.score; if (stars > (ST.stars[L.id] || 0)) ST.stars[L.id] = stars; saveSt();
    const solo = A.solo; endGameView(); A.last = { li: A.li, solo };
    $('reT').textContent = stars === 3 ? '👨‍🍳 Sterneküche!' : stars ? 'Feierabend!' : 'Küche geschlossen …';
    const st = $('reStars').children; for (let i = 0; i < 3; i++) { st[i].className = ''; if (i < stars) setTimeout(() => { st[i].className = 'on'; sfx('star'); }, 500 + i * 450); }
    $('reScore').textContent = G.score + ' 🪙'; $('reBest').textContent = rec ? '🎉 Neuer Rekord!' : 'Rekord: ' + old + ' 🪙';
    const f = [1, 1, 1.2, 1.4][Math.min(3, G.chefs.length - 1)];
    $('reTab').innerHTML = `<div><span>🍽️ Serviert</span><b>${G.served}</b></div><div><span>💸 Trinkgeld & Serien</span><b>${G.tips}</b></div><div><span>⌛ Verpasst</span><b>${G.failed}</b></div><div><span>⭐ Sterne ab</span><b>${L.stars.map(x => Math.round(x * f)).join(' / ')}</b></div>`;
    const nextOk = A.li + 1 < LEVELS.length && (unlocked(A.li + 1) || !solo);
    const btn = (id, t, pri) => `<button class="btn nav${pri ? ' pri big' : ''}" id="${id}">${t}</button>`;
    $('reBtns').innerHTML = (solo ? btn('reMenu', '☰ Küchen') : btn('reLobby', '← Zur Lobby')) + btn('reAgain', '↻ Nochmal', !nextOk) + (nextOk ? btn('reNext', 'Nächste Küche ▶', true) : '');
    const on = (id, fn) => { const e = $(id); if (e) e.onclick = () => { sfx('ok'); fn(); }; };
    on('reMenu', () => levelsScreen()); on('reLobby', () => lobbyBack());
    on('reAgain', () => solo ? startSolo(A.li) : lobbyStart(A.li)); on('reNext', () => solo ? startSolo(A.li + 1) : lobbyStart(A.li + 1));
    scr('sResult'); sfx(stars ? 'win' : 'expire'); netAll({ t: 'st', ph: 'res', score: G.score, stars });
  }

  /* ---------- Hauptschleife ---------- */
  let lastT = performance.now(), padNavT = 0, padDir = null, padPrev = [];
  function frame(now) {
    const dt = Math.min(.1, (now - lastT) / 1000); lastT = now;
    try {
      if (A.G && cur === 'sGame') { gameFrame(dt); if (A.paused) menuPad(dt); padPause(); }
      else { menuPad(dt); if (cur === 'sLobby') lobbyPads(); }
      if (cur === 'sPhone') phoneTick(dt);
    } catch (e) { console.error(e); }
    requestAnimationFrame(frame);
  }
  function padPause() { PADS.forEach((p, i) => { if (p && p.start && !(padPrev[i] && padPrev[i].start)) { if (A.paused) resume(); else pause(); } }); padPrev = PADS.map(p => p && { start: p.start, pick: p.pick, dash: p.dash }); }
  function menuPad(dt) {
    readPads(); const q = PADS.find(Boolean); if (!q) return; document.body.classList.add('kbd');
    const x = Math.abs(q.mx) > .5 ? Math.sign(q.mx) : 0, z = Math.abs(q.mz) > .5 ? Math.sign(q.mz) : 0, key = x || z ? (Math.abs(x) >= Math.abs(z) ? x + ',0' : '0,' + z) : null;
    if (key && (key !== padDir || padNavT <= 0)) { const [dx, dy] = key.split(',').map(Number); moveFocus(dx, dy); padNavT = key !== padDir ? .35 : .14; }
    padDir = key; padNavT -= dt;
    if (cur !== 'sLobby') {
      if (q.pick && !menuPad.a) { if (cur === 'sTitle' && !overlays().length) pressStart(); else { const a = document.activeElement; if (a && a !== document.body && a.click && !a.disabled) a.click(); else focusFirst(); } }
      if (q.dash && !menuPad.b) back();
    }
    if (q.start && !menuPad.st && !A.G) { if (cur === 'sTitle') pressStart(); else if (cur === 'sLobby' && !$('lbGo').disabled) $('lbGo').click(); }
    menuPad.a = q.pick; menuPad.b = q.dash; menuPad.st = q.start;
  }
  addEventListener('keydown', e => {
    keys.add(e.code); document.body.classList.add('kbd'); A.dev = 'kb';
    if (A.G && cur === 'sGame' && !overlays().length && /^(Arrow|Space|Tab)/.test(e.code)) e.preventDefault();
    if (e.code === 'Escape' || (e.code === 'KeyP' && A.G)) { e.preventDefault(); back(); return; }
    if (A.G && cur === 'sGame' && !overlays().length) return;
    if (e.target && e.target.tagName === 'INPUT' && e.target.type !== 'checkbox' && !['ArrowUp', 'ArrowDown', 'Enter'].includes(e.code)) { if (e.code === 'Enter' && cur === 'sPhone') phoneJoin(); return; }
    if (cur === 'sTitle' && !overlays().length && !e.repeat) { e.preventDefault(); pressStart(); return; }
    const d = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[e.code];
    if (d) { e.preventDefault(); moveFocus(d[0], d[1]); }
  });
  addEventListener('keyup', e => keys.delete(e.code));
  addEventListener('blur', () => keys.clear());
  addEventListener('pointerdown', e => { document.body.classList.remove('kbd'); if (e.pointerType === 'touch' || e.pointerType === 'pen') A.dev = 'touch'; }, true);
  addEventListener('resize', () => V.resize(innerWidth, innerHeight));
  addEventListener('gamepadconnected', () => { toast('🎮 Controller verbunden'); $('pressTxt').textContent = 'Drücke A'; });
  document.addEventListener('visibilitychange', () => { if (document.hidden && A.G && A.solo) pause(); });
  function pressStart() { S.ctx(); sfx('ok'); scr('sMenu'); menuStat(); try { if (window.EasyGamesKit && EasyGamesKit.fullscreenOnInput && coarse()) EasyGamesKit.fullscreenOnInput(); } catch (e) { } }
  $('bPress').onclick = pressStart;
  $('sTitle').addEventListener('click', e => { if (e.target.closest('a') || e.target.closest('#bPress')) return; if (cur === 'sTitle') pressStart(); });

  /* ---------- Online: Verbindung (PeerJS-kompatibel über ../cloud/fire-peer.js) ---------- */
  function mkNet(cb) {
    const ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789', PRE = 'kchaos-';
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
  const netErr = e => ({ nocode: 'Diese Küche gibt es nicht (mehr). Stimmt der Code?', timeout: 'Keine Verbindung – bitte nochmal versuchen.', code: 'Bitte den 4-stelligen Code eingeben.' }[e && e.message] || 'Online ist gerade nicht erreichbar. Prüfe das Internet und versuche es nochmal.');
  let NET = null;
  const H = { on: false, seats: [], pushT: 0 };   // seats: { kind:'kb'|'pad'|'net', name, look, pad, peer, cid, in, pkQ, daQ, gone, chef }
  function netClose() { if (NET) NET.close(); NET = null; H.on = false; H.seats = []; PH.on = false; }
  const netAll = m => { if (NET && H.on) NET.send(m); };
  const netChef = (i, m) => { const s = H.seats.find(x => x.chef === i && x.kind === 'net'); if (s && NET) NET.sendTo(s.peer, m); };

  /* ---------- Fernseher / Gastgeber ---------- */
  function openLobby() {
    netClose(); H.on = true; H.seats = []; if (SET.kb) H.seats.push({ kind: 'kb', name: SET.name || 'Tastatur' }); scr('sLobby'); lobbyUi();
    $('code').textContent = '····'; $('url').textContent = ''; $('qr').textContent = '…'; $('lobbyMsg').textContent = 'Küche wird aufgeschlossen …';
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
    const n = humans().length; SET.bots = clamp(SET.bots, 0, Math.max(0, 4 - n));
    seg($('lbBots'), [0, 1, 2, 3].filter(b => b + n <= 4 || b === 0).map(v => ({ v, n: v ? v + ' 🤖' : 'keine' })), SET.bots, v => { SET.bots = v; saveSet(); lobbyList(); });
    levelCards($('lbLevels'), true, (li, b) => { SET.lv = li; saveSet(); $('lbLevels').querySelectorAll('.lv').forEach(x => x.classList.toggle('on', x === b)); });
    lobbyList();
  }
  function lobbyList() {
    const hs = humans(), icon = s => s.kind === 'net' ? '📱' : s.kind === 'pad' ? '🎮' : '⌨️';
    $('lobbyList').innerHTML = [0, 1, 2, 3].map(i => { const s = hs[i]; if (s) return `<div class="seat on" style="--c:${CHEFS[i].col}"><i>${icon(s)}</i><b>${esc(s.name)}</b><small>Koch ${i + 1}</small></div>`; const bot = i - hs.length < SET.bots; return `<div class="seat${bot ? ' bot' : ''}"><i>${bot ? '🤖' : '➕'}</i><b>${bot ? 'Computer' : 'Frei'}</b><small>${bot ? 'Computer-Koch' : 'Handy oder A'}</small></div>`; }).join('');
    $('lbGo').disabled = !hs.length; netAll({ t: 'lob', n: hs.length });
  }
  function lobbyPads() {
    PADS.forEach((p, i) => { if (!p) return; const was = lobbyPads.prev[i] || {}, seat = H.seats.find(s => s.kind === 'pad' && s.pad === i);
      if (p.pick && !was.pick && !seat && humans().length < 4) { H.seats.push({ kind: 'pad', pad: i, name: 'Controller ' + (i + 1) }); sfx('ok'); lobbyUi(); }
      else if (p.dash && !was.dash) { if (seat) { H.seats = H.seats.filter(s => s !== seat); sfx('nope'); lobbyUi(); } else if (!humans().some(s => s.kind === 'pad')) back(); }
      lobbyPads.prev[i] = { pick: p.pick, dash: p.dash }; });
  }
  lobbyPads.prev = [];
  function lobbyStart(li) {
    const hs = humans(); if (!hs.length) return; SET.lv = li; saveSet(); sfx('ok');
    const chefs = hs.map((s, i) => { s.chef = i; s.pkQ = 0; s.daQ = 0; return { name: s.name, look: i }; });
    for (let b = 0; b < SET.bots && chefs.length < 4; b++) chefs.push({ name: ['Kochomat', 'Brutzelbot', 'Robo-Koch'][b], look: chefs.length, bot: true });
    startGame({ li, chefs, seats: hs });
  }
  $('lbGo').onclick = () => lobbyStart(SET.lv);
  function lobbyBack() { endGameView(); H.seats = H.seats.filter(s => !s.gone); scr('sLobby'); lobbyUi(); netAll({ t: 'st', ph: 'lobby' }); }
  function hostMsg(id, m) {
    let s = H.seats.find(x => x.peer === id);
    if (m.t === 'hi') {
      const cid = String(m.cid || '').slice(0, 16), back = H.seats.find(x => x.kind === 'net' && x.cid && x.cid === cid);
      if (back) { back.peer = id; back.gone = false; back.in = {}; back.pkQ = back.daQ = 0; if (A.G && back.chef != null && A.G.chefs[back.chef]) { A.G.chefs[back.chef].bot = false; A.G.chefs[back.chef].B = null; } NET.sendTo(id, { t: 'wel', name: back.name, look: back.chef || 0, ph: A.G ? 'game' : 'lobby' }); lobbyList(); return; }
      if (A.G) return NET.sendTo(id, { t: 'full', msg: 'Die Schicht läuft schon – nach Feierabend kannst du einsteigen.' });
      if (humans().length >= 4) return NET.sendTo(id, { t: 'full', msg: 'Alle 4 Kochplätze sind belegt.' });
      H.seats = H.seats.filter(x => !x.gone); s = { kind: 'net', peer: id, cid, name: String(m.name || 'Koch').slice(0, 14), in: {}, pkQ: 0, daQ: 0 }; H.seats.push(s);
      NET.sendTo(id, { t: 'wel', name: s.name, look: humans().indexOf(s), ph: 'lobby' }); toast('📱 ' + s.name + ' kocht mit!'); sfx('order'); lobbyUi(); return;
    }
    if (!s) return;
    if (m.t === 'in') s.in = { x: clamp(+m.x || 0, -1, 1), y: clamp(+m.y || 0, -1, 1), u: !!m.u };
    else if (m.t === 'pk') { if (s.pkQ < 3) s.pkQ++; }
    else if (m.t === 'da') { if (s.daQ < 2) s.daQ++; }
    else if (m.t === 'sh' && A.G && s.chef != null) shout(s.chef, ['Hilfe!', 'Teller!', 'Es brennt!', 'Schneller!', 'Ich mach das!', 'Lecker!'][(Math.random() * 6) | 0]);
    else if (m.t === 'go') { const b = cur === 'sLobby' ? $('lbGo') : cur === 'sResult' ? $('reBtns').querySelector('.pri') : null; if (b && !b.disabled) b.click(); }
  }
  function hostLeave(id) { const s = H.seats.find(x => x.peer === id); if (!s) return; s.gone = true; if (A.G && s.chef != null && A.G.chefs[s.chef]) { A.G.chefs[s.chef].bot = true; toast('📴 ' + s.name + ' ist weg – ein Computer-Koch springt ein'); } else { H.seats = H.seats.filter(x => x !== s); lobbyUi(); } }
  function netPush(dt) {
    if (!H.on || !NET || !A.G) return; H.pushT -= dt; if (H.pushT > 0) return; H.pushT = .3;
    H.seats.forEach(s => { if (s.kind !== 'net' || s.gone || s.chef == null) return; const ch = A.G.chefs[s.chef]; NET.sendTo(s.peer, { t: 'st', ph: 'game', score: A.G.score, time: Math.ceil(A.G.t), held: heldIcon(ch && ch.held), cnt: A.count > 0 }); });
  }

  /* ---------- Handy als Controller ---------- */
  const PH = { on: false, st: { x: 0, y: 0, a: 0, u: 0, d: 0, w: 0 }, prev: {}, sendT: 0, last: '', cid: '' };
  try { PH.cid = localStorage.getItem(P + 'cid') || ''; } catch (e) { } if (!/^[a-z0-9]{8,16}$/.test(PH.cid)) { PH.cid = Math.random().toString(36).slice(2, 12).padEnd(8, '0'); try { localStorage.setItem(P + 'cid', PH.cid); } catch (e) { } }
  KCTouch.build($('cz'), PH.st, [['a', 'NEHMEN', 0, 1, '✋'], ['u', 'BENUTZEN', -1, 0, '🔪'], ['d', 'SPRINT', 1, 0, '💨'], ['w', 'RUFEN', 0, -1, '📣']]);
  function phoneScreen(code) { netClose(); $('pJoin').hidden = false; $('pCtl').hidden = true; $('jName').value = SET.name || ''; $('jCode').value = code || ''; $('jMsg').textContent = 'Den Code zeigt der Fernseher bei „🌐 Online & Handys“.'; scr('sPhone'); }
  async function phoneJoin() {
    const code = ($('jCode').value || '').trim(), name = ($('jName').value || '').trim().slice(0, 14) || 'Koch';
    SET.name = $('jName').value.trim().slice(0, 14); saveSet(); $('jMsg').textContent = 'Verbinde …'; $('jGo').disabled = true; S.ctx();
    NET = mkNet({ onMsg: phoneMsg, onLeave: () => { if (PH.on) { $('cStat').textContent = '📴 Verbindung weg – verbinde neu …'; setTimeout(() => { if (PH.on) phoneJoin(); }, 1500); } } });
    try { await NET.join(code); PH.on = true; NET.send({ t: 'hi', name, cid: PH.cid }); } catch (e) { $('jMsg').textContent = netErr(e); PH.on = false; }
    $('jGo').disabled = false;
  }
  $('jGo').onclick = () => phoneJoin(); $('jBack').onclick = () => { netClose(); toMenu(); };
  function phoneMsg(id, m) {
    if (m.t === 'full') { $('jMsg').textContent = m.msg; PH.on = false; $('pJoin').hidden = false; $('pCtl').hidden = true; return; }
    if (m.t === 'wel') { $('pJoin').hidden = true; $('pCtl').hidden = false; $('pCtl').style.setProperty('--acc', CHEFS[(m.look || 0) % 4].col); $('cName').textContent = '👨‍🍳 ' + m.name; phoneSt({ ph: m.ph }); try { if (window.EasyGamesKit && EasyGamesKit.keepAwake) EasyGamesKit.keepAwake(); } catch (e) { } vib(40); return; }
    if (m.t === 'lob') { if (PH.ph !== 'game') $('cStat').textContent = '✅ Dabei! ' + m.n + ' Köche – warte auf den Start …'; return; }
    if (m.t === 'st') return phoneSt(m);
    if (m.t === 'ev') { if (m.e === 'serve') vib(40); else if (m.e === 'fire') vib([90, 60, 90]); }
  }
  function phoneSt(m) {
    PH.ph = m.ph; $('cGo').hidden = !(m.ph === 'lobby' || m.ph === 'res'); $('cGo').textContent = m.ph === 'lobby' ? '🍳 Schicht starten' : '▶ Weiter';
    if (m.ph === 'game') { $('cStat').textContent = (m.cnt ? '⏳ Gleich geht es los! ' : '') + '🪙 ' + (m.score || 0) + (m.time != null ? ' · ⏱ ' + fmt(m.time) : ''); if (m.held) $('cHeld').textContent = m.held; }
    else if (m.ph === 'res') $('cStat').textContent = 'Feierabend! 🪙 ' + m.score + ' · ' + '★'.repeat(m.stars || 0) + '☆'.repeat(3 - (m.stars || 0));
    else if (m.ph === 'lobby') $('cStat').textContent = '✅ Dabei! Warte auf den Start …';
  }
  $('cGo').onclick = () => { if (NET) NET.send({ t: 'go' }); sfx('ok'); };
  function phoneTick(dt) {
    if (!PH.on || !NET) return; PH.sendT -= dt; const st = PH.st, pv = PH.prev;
    if (st.a && !pv.a) NET.send({ t: 'pk' }); if (st.d && !pv.d) NET.send({ t: 'da' }); if (st.w && !pv.w) NET.send({ t: 'sh' });
    PH.prev = { a: st.a, d: st.d, w: st.w };
    const m = { t: 'in', x: Math.round(st.x * 20) / 20, y: Math.round(st.y * 20) / 20, u: st.u ? 1 : 0 }, key = m.x + ',' + m.y + ',' + m.u;
    if (key !== PH.last || PH.sendT <= 0) { PH.last = key; PH.sendT = .25; NET.send(m); }
  }

  /* ---------- Laden ---------- */
  const TIPS = ['Herd wird angeheizt …', 'Messer werden geschliffen …', 'Kochmützen werden gestärkt …', 'Gleich geht der Ansturm los …'];
  const bar = p => { $('loadBar').style.width = Math.round(p * 100) + '%'; $('loadTip').textContent = TIPS[Math.min(TIPS.length - 1, Math.floor(p * TIPS.length))]; };
  (async function boot() {
    const t0 = performance.now(); bar(.2); await new Promise(r => setTimeout(r, 30));
    try { V.init($('cv')); V.resize(innerWidth, innerHeight); const demo = KC.newGame(0, [{ name: 'Rico', bot: true }, { name: 'Mia', look: 1, bot: true }], { seed: 9 }); A.demo = demo; V.setLevel(demo, $('ovl')); } catch (e) { console.error(e); toast('3D-Grafik wird nicht unterstützt'); }
    bar(.7); await new Promise(r => setTimeout(r, Math.max(0, 900 - (performance.now() - t0)))); bar(1);
    $('sLoad').classList.add('out'); setTimeout(() => { $('sLoad').classList.remove('on', 'out'); }, 460);
    requestAnimationFrame(frame); requestAnimationFrame(demoFrame);
    if (navigator.getGamepads && Array.from(navigator.getGamepads() || []).some(Boolean)) $('pressTxt').textContent = 'Drücke A';
    const q = new URLSearchParams(location.search), jc = q.get('join');
    if (jc) { phoneScreen(jc.toUpperCase()); return; }
    const tv = (window.EasyGamesKit && EasyGamesKit.isTv && EasyGamesKit.isTv()) || q.has('tv');
    if (tv) { scr('sMenu'); menuStat(); openLobby(); return; }
    scr('sTitle');
  })();
  // Menü-Hintergrund: zwei Computer-Köche kochen in der Imbiss-Ecke
  let dLast = performance.now();
  function demoFrame(now) {
    const dt = Math.min(.1, (now - dLast) / 1000); dLast = now;
    if (!A.G && A.wasGame && A.demo) V.setLevel(A.demo, $('ovl'));
    if (!A.G && A.demo && cur !== 'sPhone' && document.visibilityState === 'visible') { if (A.demo.over || A.demo.t < 5) { A.demo = KC.newGame(0, [{ name: 'Rico', bot: true }, { name: 'Mia', look: 1, bot: true }], { seed: (Math.random() * 1e6) | 0 }); V.setLevel(A.demo, $('ovl')); } KC.step(A.demo, 1 / 60, []); V.render(dt, { noMark: true }); }
    A.wasGame = !!A.G; requestAnimationFrame(demoFrame);
  }
  window.KCApp = { A, SET, ST, H, PH, startSolo, lobbyStart, KC };
})();
