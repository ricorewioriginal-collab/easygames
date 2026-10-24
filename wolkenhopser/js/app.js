/* Wolkenhopser – App: Ladebildschirm, Titel, Konsolen-Menü, Spielen, Tagesrekord, Online-Rennen (fire-peer), Hopsis-Shop,
 * Rekorde, Optionen, Pause, Game over. Eingabe: Tastatur, Touch (Hälften oder Neigen), Gamecontroller (Spiel und Menüs).
 * Logik: js/core.js (WH), Zeichnen: js/render.js (WHRender), Ton: js/sound.js (WHSound). */
(function () {
  'use strict';
  const $ = id => document.getElementById(id), P = 'wolkenhopser-';
  const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } } };
  const SET = Object.assign({ sound: true, music: true, vib: true, tilt: false, low: false, skin: 'hopsi', owned: ['hopsi'] }, LS.get(P + 'settings', {}));
  const save = () => LS.set(P + 'settings', SET);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const S = window.WHSound, R = window.WHRender, SK = WH.SKINS;
  S.sfxOn = SET.sound; S.musicOn = SET.music;
  let toastT = 0; function toast(m) { const t = $('toast'); t.textContent = m; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2400); }
  const vib = ms => { if (SET.vib && navigator.vibrate) try { navigator.vibrate(ms); } catch (e) { } };
  const coarse = () => matchMedia('(pointer: coarse)').matches;
  const skin = () => SK.find(s => s.id === SET.skin) || SK[0];
  const coins = () => LS.get(P + 'coins', 0);

  /* ---------- Bildschirme und Menü-Navigation ---------- */
  let cur = 'sLoad';
  function scr(id) { document.querySelectorAll('.scr').forEach(s => s.classList.toggle('on', s.id === id)); cur = id; setTimeout(focusFirst, 0); }
  const overlays = () => Array.from(document.querySelectorAll('.ov')).filter(o => !o.hidden);
  const root = () => overlays().pop() || $(cur);
  const navEls = () => Array.from(root().querySelectorAll('.nav, .skin')).filter(e => !e.disabled && e.offsetParent !== null);
  function focusFirst() { const els = navEls(), el = els.find(e => e.classList.contains('pri')) || els[0]; if (el && !coarse()) try { el.focus({ preventScroll: true }); } catch (e) { } }
  function openOv(id) { $(id).hidden = false; setTimeout(focusFirst, 0); }
  function closeOv(id) { $(id).hidden = true; setTimeout(focusFirst, 0); }
  function moveFocus(dx, dy) {
    const els = navEls(); if (!els.length) return; const a = document.activeElement;
    if (!els.includes(a)) { els[0].focus(); S.sfx('move'); return; }
    const r = a.getBoundingClientRect(), ax = r.left + r.width / 2, ay = r.top + r.height / 2; let best = null, bd = 1e9;
    for (const e of els) { if (e === a) continue; const q = e.getBoundingClientRect(), x = q.left + q.width / 2 - ax, y = q.top + q.height / 2 - ay, along = x * dx + y * dy; if (along <= 4) continue; const d = along + (Math.abs(x * dy) + Math.abs(y * dx)) * 2.2; if (d < bd) { bd = d; best = e; } }
    if (best) { best.focus(); S.sfx('move'); }
  }
  function back() {
    const ov = overlays().pop();
    if (ov) { if (ov.id === 'ovPause') resume(); else if (ov.id === 'ovEnd') $('eMenu').click(); else { const x = ov.querySelector('[data-close]'); if (x) x.click(); else closeOv(ov.id); } S.sfx('back'); return; }
    if (cur === 'sGame') { pause(); return; }
    if (cur === 'sMenu') { scr('sTitle'); S.sfx('back'); }
    else if (cur === 'sLobby') { hostClose(); toMenu(); }
    else if (cur === 'sJoin') { $('jBack').click(); }
  }

  /* ---------- Eingabe ---------- */
  const KEY = {}; let shootQ = 0;
  addEventListener('keydown', e => {
    document.body.classList.add('kbd');
    if (e.target && e.target.tagName === 'INPUT') { if (e.key === 'Escape') e.target.blur(); else if (e.key === 'Enter' && e.target.id === 'jCode') $('bJoin').click(); return; }
    const c = e.code, inGame = cur === 'sGame' && !overlays().length;
    KEY[c] = true;
    if (c === 'Escape' || (c === 'KeyP' && inGame)) { e.preventDefault(); back(); return; }
    if (inGame) { if (!e.repeat && (c === 'Space' || c === 'ArrowUp' || c === 'KeyW')) shootQ++; if (/^Arrow|Space/.test(c)) e.preventDefault(); return; }
    if (cur === 'sTitle' && !overlays().length && !e.repeat) { e.preventDefault(); pressStart(); return; }
    const dir = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[c];
    if (dir) { e.preventDefault(); moveFocus(dir[0], dir[1]); }
  });
  addEventListener('keyup', e => { KEY[e.code] = false; });
  addEventListener('blur', () => { for (const k in KEY) KEY[k] = false; });
  addEventListener('pointerdown', () => document.body.classList.remove('kbd'), true);
  // Controller
  const PADS = []; let padNavT = 0;
  function pollPads(dt) {
    let list = []; try { list = navigator.getGamepads ? Array.from(navigator.getGamepads()) : []; } catch (e) { }
    let x = 0;
    for (let i = 0; i < 4; i++) {
      const g = list[i], st = PADS[i] || (PADS[i] = { b: [], on: false, x: 0 }); if (!g || !g.connected) { st.on = false; continue; } st.on = true;
      const ax = g.axes || [], bt = g.buttons || [], pr = k => !!(bt[k] && (bt[k].pressed || bt[k].value > .5));
      let px = Math.abs(ax[0]) > .2 ? ax[0] : 0; if (pr(14)) px = -1; if (pr(15)) px = 1; st.x = px; x += px;
      const now = []; for (let k = 0; k < 16; k++) now[k] = pr(k); const down = k => now[k] && !st.b[k];
      const menu = cur !== 'sGame' || overlays().length;
      if (menu) {
        document.body.classList.add('kbd');
        let py = Math.abs(ax[1]) > .5 ? Math.sign(ax[1]) : 0; if (pr(12)) py = -1; if (pr(13)) py = 1; const mx = Math.abs(px) > .5 ? Math.sign(px) : 0;
        if ((mx || py) && (!st.nav || padNavT <= 0)) { moveFocus(py ? 0 : mx, py); padNavT = st.nav ? .13 : .32; } st.nav = !!(mx || py);
        if (down(0)) { if (cur === 'sTitle' && !overlays().length) pressStart(); else { const a = document.activeElement; if (a && a !== document.body && a.click) { a.click(); S.sfx('ok'); } else focusFirst(); } }
        if (down(1)) back();
      } else if (down(0) || down(2) || down(5) || down(7)) shootQ++;
      if (down(9)) { if (cur === 'sGame') { if (overlays().some(o => o.id === 'ovPause')) resume(); else if (!overlays().length) pause(); } else if (cur === 'sTitle') pressStart(); }
      st.b = now;
    }
    padNavT -= dt; return x;
  }
  addEventListener('gamepadconnected', () => { toast('🎮 Controller verbunden'); $('pressTxt').textContent = 'Drücke A'; });
  // Touch: Bildschirmhälften halten, oder Neigen
  const TCH = { l: 0, r: 0 }, tilt = { x: 0, on: false };
  function zone(el, k) {
    const set = v => { TCH[k] = v; el.classList.toggle('on', !!v); };
    el.addEventListener('pointerdown', e => { e.preventDefault(); try { el.setPointerCapture(e.pointerId); } catch (x) { } set(TCH[k] + 1); });
    const up = e => { set(Math.max(0, TCH[k] - 1)); }; el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  }
  zone($('tzL'), 'l'); zone($('tzR'), 'r');
  $('tShoot').addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); shootQ++; vib(8); });
  function tiltOn() {
    const go = () => { if (tilt.on) return; tilt.on = true; addEventListener('deviceorientation', e => { const gm = e.gamma || 0, ang = (screen.orientation && screen.orientation.angle) || window.orientation || 0; let v = gm; if (ang === 90) v = e.beta || 0; else if (ang === -90 || ang === 270) v = -(e.beta || 0); tilt.x = Math.max(-1, Math.min(1, v / 22)); }); };
    try { if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function') DeviceOrientationEvent.requestPermission().then(r => { if (r === 'granted') go(); else toast('Neigen nicht erlaubt – tippe links/rechts.'); }).catch(() => { }); else go(); } catch (e) { }
  }
  function readInput(dt) {
    let x = pollPads(dt);
    x += (KEY.ArrowRight || KEY.KeyD ? 1 : 0) - (KEY.ArrowLeft || KEY.KeyA ? 1 : 0);
    if (SET.tilt && tilt.on && coarse()) x += tilt.x; else x += (TCH.r ? 1 : 0) - (TCH.l ? 1 : 0);
    const shoot = shootQ > 0; shootQ = 0;
    return { x: Math.max(-1, Math.min(1, x)), shoot };
  }

  /* ---------- Spiel ---------- */
  const GS = { G: null, mode: 'play', running: false, paused: false, demo: true, zone: 0, best: 0, recShown: false, startT: 0 };
  function demoGame() { GS.G = WH.newGame(7); GS.demo = true; GS.running = true; }
  function start(mode, seed) {
    GS.mode = mode; GS.G = WH.newGame(seed); GS.demo = false; GS.running = true; GS.paused = false; GS.zone = 0; GS.recShown = false; GS.best = LS.get(P + 'highscore', 0); GS.startT = performance.now();
    for (const o of overlays()) o.hidden = true; scr('sGame'); shootQ = 0;
    $('touch').hidden = !coarse(); $('touch').classList.toggle('tilt', SET.tilt); if (SET.tilt && coarse()) tiltOn();
    $('hRace').hidden = mode !== 'race'; $('hZone').textContent = WH.ZONES[0].n; $('hCoins').textContent = '0';
    $('startHint').textContent = coarse() ? (SET.tilt ? 'Handy neigen · 🎯 schießen' : 'Links/rechts halten · 🎯 schießen') : PADS.some(p => p && p.on) ? 'Stick: lenken · A: schießen' : '← → lenken · Leertaste schießen';
    $('startHint').classList.remove('fade'); void $('startHint').offsetWidth; $('startHint').classList.add('fade');
    S.music('play'); if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  }
  let banT = 0; function banner(t, sub) { const b = $('banner'); b.innerHTML = '<b>' + esc(t) + '</b>' + (sub ? '<small>' + esc(sub) + '</small>' : ''); b.hidden = false; b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); clearTimeout(banT); banT = setTimeout(() => { b.hidden = true; }, 1800); }
  function onEvent(e) {
    R.fx(e); if (GS.demo) return;
    if (e.k === 'jump') S.sfx('jump', Math.min(40, GS.G.maxY / 400));
    else if (e.k === 'spring' || e.k === 'tramp') { S.sfx(e.k); vib(15); }
    else if (e.k === 'break') S.sfx('break');
    else if (e.k === 'vanish') S.sfx('vanish');
    else if (e.k === 'coin') { S.sfx('coin'); $('hCoins').textContent = GS.G.coinsGot; }
    else if (e.k === 'shoot') S.sfx('shoot');
    else if (e.k === 'kill') { S.sfx('kill'); vib(20); }
    else if (e.k === 'hurt') S.sfx('hurt');
    else if (e.k === 'item') { S.sfx('item'); vib(20); if (e.type !== 'shield') S.sfx('fly'); banner({ prop: '🧢 Propellermütze!', jet: '🚀 Raketenrucksack!', shield: '🫧 Schutzblase!' }[e.type]); }
    else if (e.k === 'shieldPop') { S.sfx('shieldPop'); vib([30, 30, 30]); }
    else if (e.k === 'die') { S.sfx('die'); vib([80, 40, 160]); }
  }
  // Hauptschleife
  let last = 0;
  function loop(now) {
    requestAnimationFrame(loop);
    const dt = Math.min(.05, last ? (now - last) / 1000 : .016); last = now;
    const inp = readInput(dt); if (document.hidden) return;
    const G = GS.G;
    if (G && GS.running && !GS.paused) {
      let rest = dt; const vh = R.vh;
      while (rest > 1e-4) { const h = Math.min(1 / 120, rest); rest -= h;
        const u = GS.demo ? demoInput(G) : inp; WH.step(G, u, h, vh); inp.shoot = false;
        for (const e of G.ev) onEvent(e); G.ev.length = 0;
        if (G.dead) break; }
      if (GS.demo) { if (G.dead || G.maxY > 9000) demoGame(); }
      else {
        $('hScore').textContent = G.score;
        const z = WH.zoneAt(G.maxY); if (z !== GS.zone) { GS.zone = z; $('hZone').textContent = WH.ZONES[z].n; banner('✨ ' + WH.ZONES[z].n, 'Höhe ' + Math.floor(WH.ZONES[z].y / 10)); S.sfx('zone'); }
        if (!GS.recShown && GS.best > 50 && G.score > GS.best) { GS.recShown = true; banner('⭐ Neuer Rekord!', 'Weiter so!'); S.sfx('rec'); }
        if (GS.mode === 'race') raceTick(dt);
        if (G.dead) { GS.running = false; setTimeout(gameOver, 900); }
      }
    }
    const ghosts = GS.demo || !G ? null : [].concat(GS.best > 30 && !GS.recShown ? [{ y: GS.best * 10, name: '★ Rekord', col: '#ffd23f' }] : [], GS.mode === 'race' ? raceGhosts() : []);
    R.draw(G, skin(), GS.paused ? 0 : dt, ghosts);
  }
  // Demo im Menü: Hopsi steuert sich selbst zur nächsten Plattform
  function demoInput(G) {
    const p = G.p, cx = p.x + WH.PW / 2; let best = null, bd = 1e9;
    for (const q of G.plats) { if (!q.alive || q.type === 'break' || q.y > p.y + 150 || q.y < p.y - 40 && p.vy < 0 && q.y < p.y - 140) continue; const d = Math.abs(q.y - (p.y + 120)); if (q.y > p.y - 5 && d < bd) { bd = d; best = q; } }
    if (!best) return { x: 0 }; const tx = best.x + best.w / 2; let dx = tx - cx; if (Math.abs(dx) > WH.W / 2) dx -= Math.sign(dx) * WH.W;
    return { x: Math.max(-1, Math.min(1, dx / 40)), shoot: G.mons.some(m => m.alive && m.y > p.y && m.y < p.y + 400 && Math.abs(m.x + m.w / 2 - cx) < 30) };
  }
  // Game over
  function gameOver() {
    const G = GS.G, sc = G.score, prev = LS.get(P + 'highscore', 0), rec = sc > prev;
    if (rec) LS.set(P + 'highscore', sc);
    LS.set(P + 'coins', coins() + G.coinsGot);
    const st = LS.get(P + 'stats', { games: 0, height: 0, kills: 0, coins: 0 }); st.games++; st.height = Math.max(st.height, Math.floor(G.maxY / 10)); st.kills += G.kills; st.coins += G.coinsGot; LS.set(P + 'stats', st);
    if (GS.mode === 'daily') { const d = WH.daily(), all = LS.get(P + 'daily', {}); all[d.key] = Math.max(all[d.key] || 0, sc); const ks = Object.keys(all).sort(); while (ks.length > 30) delete all[ks.shift()]; LS.set(P + 'daily', all); }
    $('eTitle').textContent = { fall: 'Abgestürzt!', monster: 'Erwischt!', hole: 'Verschluckt!' }[G.cause] || 'Vorbei!';
    $('eScore').textContent = sc; $('eRec').hidden = !rec;
    const c = (l, v) => '<div><small>' + l + '</small><b>' + v + '</b></div>';
    $('eStats').innerHTML = c('Höhe', Math.floor(G.maxY / 10)) + c('Rekord', Math.max(sc, prev)) + c('Münzen', '+' + G.coinsGot) + c('Monster', G.kills) + (GS.mode === 'daily' ? c('Heute bestes', LS.get(P + 'daily', {})[WH.daily().key]) : c('Gebiet', WH.ZONES[WH.zoneAt(G.maxY)].n));
    $('eAgain').textContent = GS.mode === 'race' ? '⏳ Warten …' : '↻ Nochmal'; $('eAgain').disabled = GS.mode === 'race';
    $('eShare').hidden = GS.mode === 'race'; $('eRace').hidden = GS.mode !== 'race';
    R.hopsi($('endHopsi'), skin());
    S.music('menu'); openOv('ovEnd'); if (rec) S.sfx('rec');
    if (GS.mode === 'race') raceDead();
  }
  $('eAgain').onclick = () => { closeOv('ovEnd'); start(GS.mode, GS.mode === 'daily' ? WH.daily().seed : undefined); };
  $('eMenu').onclick = () => { closeOv('ovEnd'); if (GS.mode === 'race') raceLeave(); toMenu(); };
  $('eShare').onclick = async () => {
    const link = window.EasyGamesDevice ? EasyGamesDevice.gameLink('wolkenhopser/') : 'https://ricorewioriginal-collab.github.io/easygames/wolkenhopser/';
    const text = (GS.mode === 'daily' ? '☁️ Wolkenhopser · Tagesrekord ' + WH.daily().key.split('-').reverse().join('.') + ': ' : '☁️ Wolkenhopser: ') + GS.G.score + ' Punkte, Höhe ' + Math.floor(GS.G.maxY / 10) + ' – schaffst du mehr? ' + link;
    try { if (navigator.share && coarse()) { await navigator.share({ text }); return; } } catch (e) { return; }
    try { await navigator.clipboard.writeText(text); toast('📋 Kopiert – einfach einfügen!'); } catch (e) { toast(text); }
  };
  function pause() { if (!GS.running || GS.paused || GS.demo) return; GS.paused = true; openOv('ovPause'); }
  function resume() { GS.paused = false; $('ovPause').hidden = true; shootQ = 0; if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); }
  $('bPause').onclick = e => { pause(); e.currentTarget.blur(); };
  $('pGo').onclick = resume;
  $('pRestart').onclick = () => { $('ovPause').hidden = true; if (GS.mode === 'race') { resume(); return; } start(GS.mode, GS.mode === 'daily' ? WH.daily().seed : undefined); };
  $('pOpts').onclick = () => { $('ovPause').hidden = true; optsOpen(() => openOv('ovPause')); };
  $('pQuit').onclick = () => { $('ovPause').hidden = true; GS.paused = false; if (GS.mode === 'race') raceLeave(); toMenu(); };
  addEventListener('visibilitychange', () => { if (document.hidden && cur === 'sGame' && GS.mode !== 'race') pause(); });

  /* ---------- Menü ---------- */
  function toMenu() { for (const o of overlays()) o.hidden = true; demoGame(); scr('sMenu'); menuStat(); S.music('menu'); }
  function menuStat() {
    const hs = LS.get(P + 'highscore', 0), today = LS.get(P + 'daily', {})[WH.daily().key];
    $('menuCoins').textContent = coins(); $('menuBest').textContent = hs ? 'Rekord: ' + hs + ' Punkte' : 'Spring so hoch du kannst';
    $('menuDaily').textContent = today ? 'Heute: ' + today + ' Punkte' : 'Gleiche Welt für alle';
    $('menuKeys').textContent = PADS.some(p => p && p.on) ? 'Steuerkreuz: wählen · A: OK · B: zurück' : coarse() ? 'Tippe auf ein Feld' : 'Pfeile: wählen · Enter: OK · Esc: zurück';
  }
  function pressStart() { if (cur !== 'sTitle') return; S.unlock(); S.sfx('ok'); toMenu(); }
  $('bPress').onclick = pressStart;
  $('sTitle').addEventListener('pointerdown', e => { if (e.target.closest('a')) return; e.preventDefault(); pressStart(); });
  $('tiles').onclick = e => { const b = e.target.closest('.tile'); if (!b) return; S.sfx('ok'); const g = b.dataset.go;
    if (g === 'play') start('play'); else if (g === 'daily') start('daily', WH.daily().seed); else if (g === 'online') hostOpen();
    else if (g === 'shop') shopOpen(); else if (g === 'rec') recOpen(); else if (g === 'opts') optsOpen(); else if (g === 'help') openOv('ovHelp'); };
  $('helpX').onclick = () => closeOv('ovHelp');
  function optsOpen(after) {
    $('sSound').checked = SET.sound; $('sMusic').checked = SET.music; $('sVib').checked = SET.vib; $('sTilt').checked = SET.tilt; $('sLow').checked = SET.low; openOv('ovOpts');
    $('optX').onclick = () => { SET.sound = $('sSound').checked; SET.music = $('sMusic').checked; SET.vib = $('sVib').checked; SET.low = $('sLow').checked; const t = $('sTilt').checked; if (t && !SET.tilt) tiltOn(); SET.tilt = t; save(); S.sfxOn = SET.sound; S.musicOn = SET.music; if (SET.music) S.music(cur === 'sGame' ? 'play' : 'menu'); $('touch').classList.toggle('tilt', SET.tilt); closeOv('ovOpts'); if (after) after(); };
  }
  function shopOpen() {
    const c = coins();
    $('shop').innerHTML = SK.map(s => { const own = SET.owned.includes(s.id), on = SET.skin === s.id; return '<button class="skin' + (on ? ' on' : '') + (own ? '' : ' lock') + '" data-s="' + s.id + '"><canvas width="110" height="110"></canvas><b>' + esc(s.n) + '</b><small>' + (on ? '✔ Gewählt' : own ? 'Wählen' : '🪙 ' + s.cost + (c < s.cost ? ' · fehlen ' + (s.cost - c) : '')) + '</small></button>'; }).join('');
    $('shop').querySelectorAll('.skin').forEach(b => R.hopsi(b.querySelector('canvas'), SK.find(s => s.id === b.dataset.s)));
    if ($('ovShop').hidden) openOv('ovShop');
  }
  $('shop').onclick = e => { const b = e.target.closest('.skin'); if (!b) return; const s = SK.find(x => x.id === b.dataset.s);
    if (SET.owned.includes(s.id)) { SET.skin = s.id; save(); S.sfx('ok'); }
    else if (coins() >= s.cost) { LS.set(P + 'coins', coins() - s.cost); SET.owned.push(s.id); SET.skin = s.id; save(); S.sfx('rec'); toast('🎉 ' + s.n + ' freigeschaltet!'); }
    else { S.sfx('back'); toast('Noch ' + (s.cost - coins()) + ' Münzen sammeln!'); return; }
    shopOpen(); menuStat(); const nb = $('shop').querySelector('[data-s="' + s.id + '"]'); if (nb && !coarse()) nb.focus(); };
  $('shopX').onclick = () => { closeOv('ovShop'); menuStat(); };
  function recOpen() {
    const st = LS.get(P + 'stats', { games: 0, height: 0, kills: 0, coins: 0 }), d = LS.get(P + 'daily', {}), c = (l, v) => '<div><small>' + l + '</small><b>' + v + '</b></div>';
    $('recList').innerHTML = c('Rekord', LS.get(P + 'highscore', 0)) + c('Größte Höhe', st.height) + c('Runden', st.games) + c('Monster besiegt', st.kills) + c('Münzen gesammelt', st.coins) + c('Tagesrekord heute', d[WH.daily().key] || '–') + c('Hopsis', SET.owned.length + ' / ' + SK.length);
    openOv('ovRec');
  }
  $('recX').onclick = () => closeOv('ovRec');

  /* ---------- Online-Rennen (PeerJS-kompatibel über ../cloud/fire-peer.js) ---------- */
  function mkNet(cb) {
    const ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789', PRE = 'wolkenhopser-';
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
  const netErr = e => ({ nocode: 'Diesen Raum gibt es nicht (mehr). Stimmt der Code?', timeout: 'Keine Verbindung – bitte nochmal versuchen.', code: 'Bitte den 4-stelligen Code eingeben.' }[e && e.message] || 'Online ist gerade nicht erreichbar. Prüfe das Internet und versuche es nochmal.');
  const COLS = ['#ff5c7a', '#3a86ff', '#ffb703', '#8e5cff', '#06d6a0', '#ff6b35', '#f72585', '#2ec4b6'];
  // Gemeinsamer Renn-Zustand: Liste aller Spieler { id, name, col, y, sc, dead }
  const RC = { net: null, role: '', me: '', list: [], seed: 0, running: false, sendT: 0, name: '' };
  function raceRender(el) {
    const L = RC.list.slice().sort((a, b) => b.sc - a.sc);
    el.innerHTML = L.length ? L.map((p, k) => '<div class="lp' + (p.dead && RC.running ? ' dead' : '') + '" style="--c:' + p.col + '"><i></i><b>' + esc(p.name) + (p.id === RC.me ? ' (du)' : '') + '</b><span>' + (RC.running || p.sc ? p.sc + (p.dead ? ' 💫' : '') : '') + '</span></div>').join('') : '<p class="hint">Noch niemand da – QR-Code scannen!</p>';
  }
  async function hostOpen() {
    scr('sLobby'); RC.role = 'host'; RC.me = 'host'; RC.running = false; RC.name = LS.get(P + 'name', '') || 'Gastgeber'; RC.list = [{ id: 'host', name: RC.name, col: COLS[0], y: 0, sc: 0, dead: false }]; raceRender($('lobPlayers'));
    $('code').textContent = '····'; $('url').textContent = 'Raum wird eröffnet …'; $('qr').textContent = '…';
    if (RC.net) RC.net.close(); RC.net = mkNet({ onMsg: hostMsg, onLeave: peer => { RC.list = RC.list.filter(p => p.id !== peer); raceBroadcast(); raceRender($('lobPlayers')); } });
    try {
      const code = await RC.net.host(); $('code').textContent = code; $('url').textContent = RC.net.link();
      RC.net.loadQR().then(() => { const q = qrcode(0, 'M'); q.addData(RC.net.link()); q.make(); $('qr').innerHTML = q.createSvgTag({ cellSize: 4, margin: 0, scalable: true }); }).catch(() => { $('qr').textContent = code; });
    } catch (e) { $('url').textContent = netErr(e); toast(netErr(e)); }
  }
  function hostClose() { if (RC.net) { RC.net.send({ t: 'bye' }); RC.net.close(); } RC.net = null; RC.role = ''; RC.list = []; }
  function hostMsg(peer, d) {
    if (d.t === 'hi') { let p = RC.list.find(x => x.id === peer); if (!p) { if (RC.list.length >= 8) { RC.net.sendTo(peer, { t: 'msg', m: 'Der Raum ist voll (8 Spieler).' }); return; } let n = String(d.name || '').replace(/[<>]/g, '').trim().slice(0, 12) || 'Gast', base = n, k = 2; while (RC.list.some(x => x.name.toLowerCase() === n.toLowerCase())) n = base.slice(0, 9) + ' ' + k++; p = { id: peer, name: n, col: COLS[RC.list.length % COLS.length], y: 0, sc: 0, dead: RC.running }; RC.list.push(p); S.sfx('ok'); }
      RC.net.sendTo(peer, { t: 'wel', id: peer }); if (RC.running) RC.net.sendTo(peer, { t: 'msg', m: 'Das Rennen läuft gerade – beim nächsten bist du dabei.' }); raceBroadcast(); raceRender($('lobPlayers')); return; }
    if (d.t === 's') { const p = RC.list.find(x => x.id === peer); if (p && RC.running) { p.y = +d.y || 0; p.sc = +d.sc || 0; p.dead = !!d.dead; raceCheckEnd(); } }
  }
  function raceBroadcast() { if (RC.net && RC.role === 'host') RC.net.send({ t: 'all', list: RC.list, running: RC.running }); }
  $('lobBack').onclick = () => { hostClose(); toMenu(); };
  $('lobGo').onclick = () => { RC.seed = (Math.random() * 4294967296) >>> 0; RC.running = true; RC.list.forEach(p => { p.y = 0; p.sc = 0; p.dead = false; }); if (RC.net) RC.net.send({ t: 'go', seed: RC.seed }); raceBroadcast(); start('race', RC.seed); };
  function raceTick(dt) {
    RC.sendT -= dt; if (RC.sendT > 0 && !GS.G.dead) return; RC.sendT = .25;
    const me = { y: GS.G.maxY, sc: GS.G.score, dead: GS.G.dead };
    if (RC.role === 'host') { const p = RC.list.find(x => x.id === 'host'); Object.assign(p, me); raceBroadcast(); raceCheckEnd(); } else if (RC.net) RC.net.send(Object.assign({ t: 's' }, me));
    $('hRace').innerHTML = RC.list.slice().sort((a, b) => b.sc - a.sc).map((p, k) => '<span style="color:' + p.col + '">' + (k + 1) + '. ' + esc(p.name) + '</span>').slice(0, 3).join(' ');
  }
  const raceGhosts = () => RC.list.filter(p => p.id !== RC.me && !p.dead).map(p => ({ y: p.y, name: p.name, col: p.col }));
  function raceDead() { raceTick(1); raceRender($('eRace')); $('eAgain').textContent = RC.role === 'host' ? '⏳ Warte auf die anderen …' : '⏳ Warten …'; }
  function raceCheckEnd() {
    if (RC.role !== 'host' || !RC.running) return;
    if (RC.list.every(p => p.dead)) { RC.running = false; raceBroadcast(); if (RC.net) RC.net.send({ t: 'fin', list: RC.list }); raceFinish(); }
  }
  function raceFinish() {
    const L = RC.list.slice().sort((a, b) => b.sc - a.sc), mePos = L.findIndex(p => p.id === RC.me) + 1;
    raceRender($('eRace')); $('eTitle').textContent = mePos === 1 ? '🏆 Du gewinnst das Rennen!' : 'Platz ' + mePos + ' von ' + L.length;
    if (mePos === 1) S.sfx('rec');
    $('eAgain').disabled = RC.role !== 'host'; $('eAgain').textContent = RC.role === 'host' ? '↻ Neues Rennen' : '⏳ Gastgeber startet …';
    $('eAgain').onclick = () => { if (RC.role !== 'host') return; closeOv('ovEnd'); $('lobGo').click(); };
  }
  function raceLeave() { if (RC.role === 'host') hostClose(); else if (RC.net) { RC.net.close(); RC.net = null; } RC.role = ''; RC.running = false; $('eAgain').onclick = () => { closeOv('ovEnd'); start(GS.mode, GS.mode === 'daily' ? WH.daily().seed : undefined); }; }
  // Gast
  function joinOpen(code) { scr('sJoin'); $('jForm').hidden = false; $('jWait').hidden = true; $('jCode').value = code || ''; $('jName').value = LS.get(P + 'name', ''); }
  $('bJoin').onclick = async () => {
    const name = $('jName').value.trim() || 'Gast', code = $('jCode').value; LS.set(P + 'name', name); $('jMsg').textContent = 'Verbinde …'; $('bJoin').disabled = true;
    try {
      if (RC.net) RC.net.close(); RC.role = 'guest'; RC.list = [];
      RC.net = mkNet({ onMsg: (pe, d) => guestMsg(d), onLeave: () => { toast('📴 Verbindung zum Gastgeber getrennt'); if (cur === 'sJoin') $('jWaitTxt').textContent = 'Verbindung getrennt.'; } });
      await RC.net.join(code); RC.net.send({ t: 'hi', name }); $('jMsg').textContent = ''; $('jForm').hidden = true; $('jWait').hidden = false; S.unlock();
    } catch (e) { $('jMsg').textContent = netErr(e); }
    $('bJoin').disabled = false;
  };
  $('jBack').onclick = () => { if (RC.net) RC.net.close(); RC.net = null; RC.role = ''; history.replaceState(null, '', location.pathname); toMenu(); };
  function guestMsg(d) {
    if (d.t === 'wel') RC.me = d.id;
    else if (d.t === 'all') { RC.list = d.list; if (cur === 'sJoin') raceRender($('jPlayers')); if (!$('ovEnd').hidden && GS.mode === 'race') raceRender($('eRace')); }
    else if (d.t === 'go') { RC.seed = d.seed; RC.running = true; start('race', d.seed); }
    else if (d.t === 'fin') { RC.list = d.list; RC.running = false; if (GS.mode === 'race' && GS.G && GS.G.dead && !$('ovEnd').hidden) raceFinish(); else if (GS.mode === 'race' && GS.G && GS.G.dead) setTimeout(raceFinish, 1200); }
    else if (d.t === 'msg') toast(d.m);
    else if (d.t === 'bye') { toast('Der Gastgeber hat den Raum geschlossen.'); RC.running = false; }
  }

  /* ---------- Laden und Start ---------- */
  if (window.self !== window.top) { $('backLink').hidden = true; $('backLink2').hidden = true; }
  const TIPS = ['Federn werden gespannt …', 'Wolken werden aufgeschüttelt …', 'Monster putzen sich die Zähne …', 'Hopsi macht sich warm …'];
  const bar = p => { $('loadBar').style.width = Math.round(p * 100) + '%'; $('loadTip').textContent = TIPS[Math.min(TIPS.length - 1, Math.floor(p * TIPS.length))]; };
  const wait = ms => new Promise(r => setTimeout(r, ms));
  (async function boot() {
    const t0 = performance.now(); bar(.15);
    R.init($('cv'), { low: SET.low }); R.hopsi($('loadHopsi'), skin()); bar(.5);
    demoGame(); requestAnimationFrame(loop); await wait(80); bar(.85);
    await wait(Math.max(0, 1100 - (performance.now() - t0))); bar(1); await wait(150);
    $('sLoad').classList.add('out'); setTimeout(() => $('sLoad').classList.remove('on', 'out'), 450);
    const q = new URLSearchParams(location.search), jm = /[?#&]join=([A-Za-z0-9]{4})/.exec(location.search + location.hash);
    if (jm) { S.unlock(); joinOpen(jm[1].toUpperCase()); }
    else if (q.has('daily')) start('daily', WH.daily().seed);
    else { $('pressTxt').textContent = PADS.some(p => p && p.on) ? 'Drücke A' : coarse() ? 'Tippen zum Starten' : 'Drücke Enter'; scr('sTitle'); }
  })();
  window.HOP = { state: () => ({ cur, mode: GS.mode, demo: GS.demo, running: GS.running, paused: GS.paused, score: GS.G && GS.G.score, maxY: GS.G && GS.G.maxY, dead: GS.G && GS.G.dead, race: { role: RC.role, list: RC.list, running: RC.running } }), GS };
})();
