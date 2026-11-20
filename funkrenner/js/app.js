/* Funkrenner – Oberfläche und Spielablauf: Menüs, Level, Endlos, Beat-Modus, Steuerung (Touch, Tastatur, Controller), Speicherstand. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id), FRB = window.FRBeat, HEROES = window.FRHero.HEROES, WORLDS = FR.WORLDS;
  const q = new URLSearchParams(location.search);
  const coarse = () => matchMedia('(pointer:coarse)').matches;
  const ls = { get: (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { } } };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ---------- Speicherstand ---------- */
  const KEY = 'funkrenner-save';
  const SAVE = Object.assign({ stars: {}, coins: 0, hero: 'knight', ups: { magnet: 0, dbl: 0, turbo: 0, shield: 0 }, endless: {}, beatProg: 0, beatBest: [], liedBest: {}, liedLvl: 'normal', sound: 1, quality: 'auto', mig: 0, runs: 0 }, (() => { try { return JSON.parse(ls.get(KEY, '{}')) || {}; } catch (e) { return {}; } })());
  SAVE.ups = Object.assign({ magnet: 0, dbl: 0, turbo: 0, shield: 0 }, SAVE.ups);
  if (!SAVE.mig) {                                          // einmalig: Stände der beiden Vorgänger (Radio Surfer / Beat Surfer) übernehmen
    SAVE.mig = 1;
    try {
      const p = +ls.get('anmachaBeatProgress', 0) || 0; if (p > SAVE.beatProg) SAVE.beatProg = Math.min(FRB.TRACKS, p);
      const b = JSON.parse(ls.get('anmachaBeatBest', '[]')); if (Array.isArray(b)) b.forEach((v, i) => { if (v > (SAVE.beatBest[i] || 0)) SAVE.beatBest[i] = v; });
      const lb = JSON.parse(ls.get('anmachaBeatLiedBest', '{}')); Object.keys(lb || {}).forEach(k => { if (lb[k] > (SAVE.liedBest[k] || 0)) SAVE.liedBest[k] = lb[k]; });
    } catch (e) { }
  }
  const save = () => ls.set(KEY, JSON.stringify(SAVE));
  const starsOf = (w, i) => (SAVE.stars[w] && SAVE.stars[w][i]) || 0;
  const unlocked = (w, i) => i === 0 || starsOf(w, i - 1) > 0 || !!q.get('all');
  const totalStars = () => Object.keys(SAVE.stars).reduce((a, w) => a + SAVE.stars[w].reduce((x, y) => x + (y || 0), 0), 0);

  /* ---------- Ton ---------- */
  FRB.setMuted(!SAVE.sound);
  const sfx = n => FRB.sfx(n);
  let audioOn = false;
  function wakeAudio() { if (audioOn) return; audioOn = true; FRB.audioInit(); startMenuMusic(); }
  const WORLD_TRACK = { jungle: 6, studio: 1, fantasy: 12 };
  function startMenuMusic() { if (S.mode === 'menu') FRB.bgStart(WORLD_TRACK[S.world] != null ? WORLD_TRACK[S.world] : 1, .22); }

  /* ---------- Zustand ---------- */
  const S = { mode: 'menu', phase: 'menu', cur: 'sLoad', world: 'jungle', lvl: 0, G: null, paused: false, acc: 0, cT: 0, endT: 0, bMode: 'campaign', bTrack: 0, bLied: null, runInfo: null, beatSong: null, lieder: null, lCat: 'alle', lQ: '', ready: false };
  let V = null;
  const low = SAVE.quality === 'low' || q.has('low') || (SAVE.quality === 'auto' && coarse() && (navigator.hardwareConcurrency || 8) <= 4);

  /* ---------- Bildschirme ---------- */
  const BACKABLE = ['sWorlds', 'sHeroes', 'sBeat', 'sShop', 'sOpts', 'sHelp'];
  const hasOv = () => [...document.querySelectorAll('.ov')].filter(o => !o.hidden);
  function scr(id) {
    document.querySelectorAll('.scr').forEach(s => s.classList.toggle('on', s.id === id)); S.cur = id;
    if (id === 'sMenu') refreshMenu(); if (id === 'sWorlds') renderWorlds(); if (id === 'sHeroes') renderHero(); if (id === 'sBeat') renderBeat(); if (id === 'sShop') renderShop(); if (id === 'sOpts') renderOpts();
    if (V && S.mode === 'menu') V.menuShift = id === 'sMenu' ? 1.7 : id === 'sHeroes' ? -1.5 : 0;
    setTimeout(focusFirst, 30);
  }
  function toMenu() {
    cleanupPlay(); S.mode = 'menu'; S.phase = 'menu'; S.paused = false; closeOvs();
    $('hud').hidden = $('bhud').hidden = true; $('count').hidden = true;
    if (V) { V.setMode('menu'); V.menuSpin = 0; }
    prepareMenuScene(); scr('sMenu'); startMenuMusic();
  }
  async function prepareMenuScene() { if (!V) return; try { await V.setWorld(S.world, FR.VARIANT[S.lvl] || 0); await V.setHero(SAVE.hero); V.setMode('menu'); } catch (e) { console.warn(e); } }
  function cleanupPlay() { S.G = null; FRB.stop(); S.beatSong = null; }
  function closeOvs() { document.querySelectorAll('.ov').forEach(o => { o.hidden = true; }); }
  function toast(t) { const e = $('toast'); e.textContent = t; e.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => { e.hidden = true; }, 1800); }

  /* ---------- Fokus (Tastatur, TV, Controller) ---------- */
  function navEls() {
    const ov = hasOv().pop(), root = ov || document.querySelector('.scr.on'); if (!root) return [];
    return [...root.querySelectorAll('.nav')].filter(e => e.offsetParent !== null && !e.disabled);
  }
  function focusFirst() {
    if (!document.body.classList.contains('kbd') || S.phase === 'play' || S.phase === 'count') return;
    const els = navEls(), r = hasOv().pop() || document.querySelector('.scr.on'); if (!r) return;
    const el = r.querySelector('[data-focus]') || els.find(e => e.classList.contains('pri') || e.classList.contains('hero')) || els[0]; if (el) try { el.focus({ preventScroll: true }); } catch (e) { }
  }
  function moveFocus(dx, dy) {
    const els = navEls(); if (!els.length) return; const a = document.activeElement; if (!els.includes(a)) { document.body.classList.add('kbd'); focusFirst(); return; }
    const r = a.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2; let best = null, bs = 1e9;
    for (const e of els) { if (e === a) continue; const b = e.getBoundingClientRect(), vx = b.left + b.width / 2 - cx, vy = b.top + b.height / 2 - cy, along = vx * dx + vy * dy, perp = Math.abs(vx * dy - vy * dx); if (along <= 2) continue; const sc = along + perp * 2.2; if (sc < bs) { bs = sc; best = e; } }
    if (best) { best.focus({ preventScroll: true }); best.scrollIntoView && best.scrollIntoView({ block: 'nearest' }); sfx('ui'); }
  }
  function back() {
    const ov = hasOv().pop();
    if (ov) { if (ov.id === 'ovPause') resume(); else if (ov.id === 'ovConfirm') ov.hidden = true; else if (ov.id === 'ovRes') toMenu(); sfx('back'); return; }
    if (S.phase === 'play' || S.phase === 'count') { pause(); return; }
    if (BACKABLE.includes(S.cur)) { sfx('back'); toMenu(); }
  }

  /* ---------- Hauptmenü ---------- */
  function refreshMenu() {
    const h = HEROES.find(x => x.id === SAVE.hero) || HEROES[0];
    $('chStars').textContent = '⭐ ' + totalStars(); $('chCoins').textContent = '🪙 ' + SAVE.coins;
    $('heroIcon').textContent = h.icon; $('heroInfo').textContent = h.name + ' · ' + h.short;
    $('playInfo').textContent = totalStars() + ' von 45 Sternen';
    const be = Object.values(SAVE.endless).reduce((a, b) => Math.max(a, b), 0); $('endInfo').textContent = be ? 'Rekord ' + be : 'Wie weit kommst du?';
  }
  $('tiles').addEventListener('click', e => {
    const b = e.target.closest('[data-go]'); if (!b) return; wakeAudio(); sfx('ui');
    const g = b.dataset.go;
    if (g === 'worlds') scr('sWorlds'); else if (g === 'endless') startEndless(S.world); else if (g === 'beat') scr('sBeat'); else if (g === 'heroes') scr('sHeroes');
    else if (g === 'shop') scr('sShop'); else if (g === 'opts') scr('sOpts'); else if (g === 'help') scr('sHelp');
  });
  document.querySelectorAll('[data-back]').forEach(b => b.addEventListener('click', () => { sfx('back'); toMenu(); }));

  /* ---------- Welten und Level ---------- */
  function renderWorlds() {
    $('wTabs').innerHTML = WORLDS.map(w => `<button class="nav ${w.id === S.world ? 'on' : ''}" data-w="${w.id}">${w.icon || ''} ${w.name}</button>`).join('');
    const w = WORLDS.find(x => x.id === S.world);
    $('wDesc').textContent = w.desc || '';
    $('lvRow').innerHTML = [0, 1, 2, 3, 4].map(i => { const ok = unlocked(S.world, i), st = starsOf(S.world, i); return `<button class="nav lv ${i === S.lvl ? 'on' : ''} ${ok ? '' : 'lock'}" data-i="${i}"><b>${ok ? i + 1 : '🔒'}</b><small>${st ? '★'.repeat(st) + '☆'.repeat(3 - st) : ok ? '☆☆☆' : ''}</small></button>`; }).join('');
    const d = FR.levelDef(S.world, S.lvl); $('lvInfo').textContent = unlocked(S.world, S.lvl) ? `${d.name} · ${d.len} m` : 'Schließe das vorige Level ab.';
    $('wGo').disabled = !unlocked(S.world, S.lvl);
    $('wTitle').textContent = w.name;
  }
  $('wTabs').addEventListener('click', e => { const b = e.target.closest('[data-w]'); if (!b) return; sfx('ui'); S.world = b.dataset.w; S.lvl = Math.min(S.lvl, 4); while (S.lvl > 0 && !unlocked(S.world, S.lvl)) S.lvl--; renderWorlds(); previewWorld(); const n = document.querySelector('#wTabs .on'); n && document.body.classList.contains('kbd') && n.focus(); });
  $('lvRow').addEventListener('click', e => { const b = e.target.closest('[data-i]'); if (!b) return; const i = +b.dataset.i; if (!unlocked(S.world, i)) { sfx('hit'); toast('Erst das vorige Level schaffen'); return; } sfx('ui'); S.lvl = i; renderWorlds(); previewWorld(); const n = document.querySelector(`#lvRow [data-i="${i}"]`); n && document.body.classList.contains('kbd') && n.focus(); });
  $('wGo').addEventListener('click', () => { wakeAudio(); startLevel(S.world, S.lvl); });
  $('wEndless').addEventListener('click', () => { wakeAudio(); startEndless(S.world); });
  let pvT = 0;
  function previewWorld() { clearTimeout(pvT); pvT = setTimeout(() => { if (S.mode === 'menu' && V) V.setWorld(S.world, FR.VARIANT[S.lvl] || 0).then(() => { V.setMode('menu'); }).catch(() => { }); }, 120); }

  /* ---------- Held wählen ---------- */
  let hIdx = 0;
  function renderHero() {
    if (S.cur === 'sHeroes' && !renderHero.init) { renderHero.init = 1; }
    const h = HEROES[hIdx], cur = h.id === SAVE.hero;
    $('hName').textContent = h.icon + ' ' + h.name; $('hPerk').textContent = h.perk;
    $('hStats').innerHTML = `<span class="chip">${h.short}</span>`;
    $('hPick').textContent = cur ? '✔ Gewählt' : '✔ Diesen Helden nehmen'; $('hPick').disabled = false;
  }
  function stepHero(d) { hIdx = (hIdx + d + HEROES.length) % HEROES.length; sfx('ui'); renderHero(); if (V) V.setHero(HEROES[hIdx].id).catch(() => { }); }
  $('hPrev').addEventListener('click', () => stepHero(-1)); $('hNext').addEventListener('click', () => stepHero(1));
  $('hPick').addEventListener('click', () => { SAVE.hero = HEROES[hIdx].id; save(); sfx('power'); toast(HEROES[hIdx].name + ' ist dabei!'); renderHero(); if (V) V.heroId === SAVE.hero || V.setHero(SAVE.hero); });
  const heroEnter = scr;
  const _scr = scr; // Held bei Eintritt auf den gewählten stellen, beim Verlassen zurück auf den gespeicherten
  function syncHeroIdx() { hIdx = Math.max(0, HEROES.findIndex(h => h.id === SAVE.hero)); }

  /* ---------- Upgrades ---------- */
  const SHOP = [
    { k: 'magnet', icon: '🧲', n: 'Magnet', d: 'hält länger', max: 5, cost: [100, 200, 350, 550, 800] },
    { k: 'dbl', icon: '✖️2', n: 'Doppelpunkte', d: 'hält länger', max: 5, cost: [100, 200, 350, 550, 800] },
    { k: 'turbo', icon: '🚀', n: 'Turbo', d: 'hält länger', max: 5, cost: [150, 250, 400, 600, 900] },
    { k: 'shield', icon: '🛡️', n: 'Start-Schild', d: 'jedes Level mit Schild', max: 1, cost: [500] }
  ];
  function renderShop() {
    $('shopCoins').textContent = '🪙 ' + SAVE.coins;
    $('shopList').innerHTML = SHOP.map(u => { const lv = SAVE.ups[u.k] || 0, maxed = lv >= u.max, c = u.cost[lv]; return `<div class="up"><i>${u.icon}</i><div><b>${u.n}</b><small>${u.d}</small><span class="pips">${'●'.repeat(lv)}${'○'.repeat(u.max - lv)}</span></div><button class="btn nav ${maxed ? '' : 'pri'}" data-k="${u.k}" ${maxed ? 'disabled' : ''}>${maxed ? 'Max' : '🪙 ' + c}</button></div>`; }).join('');
  }
  $('shopList').addEventListener('click', e => {
    const b = e.target.closest('[data-k]'); if (!b) return; const u = SHOP.find(x => x.k === b.dataset.k), lv = SAVE.ups[u.k] || 0, c = u.cost[lv];
    if (lv >= u.max) return; if (SAVE.coins < c) { sfx('hit'); toast('Zu wenig Münzen'); return; }
    SAVE.coins -= c; SAVE.ups[u.k] = lv + 1; save(); sfx('power'); renderShop();
    const n = document.querySelector(`#shopList [data-k="${u.k}"]`); n && document.body.classList.contains('kbd') && !n.disabled && n.focus();
  });

  /* ---------- Optionen ---------- */
  function renderOpts() {
    document.querySelectorAll('#oSound button').forEach(b => b.classList.toggle('on', +b.dataset.v === (SAVE.sound ? 1 : 0)));
    document.querySelectorAll('#oQual button').forEach(b => b.classList.toggle('on', b.dataset.v === SAVE.quality));
    const o = FRB.getOffset(); $('oOffV').textContent = (o > 0 ? '+' : '') + o + ' ms'; $('oNote').textContent = 'Grafik-Änderungen gelten ab dem nächsten Start.';
    $('pSound').textContent = SAVE.sound ? '🔊 Ton an' : '🔇 Ton aus';
  }
  $('oSound').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; wakeAudio(); SAVE.sound = +b.dataset.v; FRB.setMuted(!SAVE.sound); save(); renderOpts(); sfx('ui'); });
  $('oQual').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; SAVE.quality = b.dataset.v; save(); renderOpts(); });
  $('oOffM').addEventListener('click', () => { FRB.setOffset(FRB.getOffset() - 10); renderOpts(); }); $('oOffP').addEventListener('click', () => { FRB.setOffset(FRB.getOffset() + 10); renderOpts(); });
  $('oReset').addEventListener('click', () => { $('ovConfirm').hidden = false; setTimeout(focusFirst, 0); });
  $('cNo').addEventListener('click', () => { $('ovConfirm').hidden = true; setTimeout(focusFirst, 0); });
  $('cYes').addEventListener('click', () => { try { localStorage.removeItem(KEY); } catch (e) { } SAVE.mig = 1; location.reload(); });

  /* ---------- Laufen: Start, Ablauf, Ende ---------- */
  function heroStats() { const h = HEROES.find(x => x.id === SAVE.hero) || HEROES[0]; return h.stats || {}; }
  async function begin(def, info) {
    wakeAudio(); closeOvs(); cleanupPlay(); S.mode = 'run'; S.phase = 'load'; S.runInfo = info; S.paused = false;
    ['sMenu', 'sWorlds', 'sHeroes', 'sBeat', 'sShop', 'sOpts', 'sHelp'].forEach(i => $(i).classList.remove('on')); S.cur = '';
    $('bhud').hidden = true; $('hud').hidden = false;
    try { await V.setWorld(def.world, def.variant); await V.setHero(SAVE.hero); } catch (e) { console.warn(e); }
    SAVE.runs++; const G = FR.create({ level: def, hero: heroStats(), up: SAVE.ups, runSeed: def.endless ? 0 : SAVE.runs }); S.G = G; S.acc = 0; S.endT = 0; hudSig.length = 0;
    V.runStart(G); V.runSync(G, 0);
    FRB.bgStart(WORLD_TRACK[def.world] != null ? WORLD_TRACK[def.world] : 1, .3);
    S.phase = 'count'; S.cT = 3.4; lastCount = 4;
  }
  function startLevel(w, i) { S.world = w; S.lvl = i; const d = FR.levelDef(w, i); begin(d, { kind: 'level', w, i }); }
  function startEndless(w) { S.world = w; const d = FR.endlessDef(w); begin(d, { kind: 'endless', w }); }
  let lastCount = 4;
  const hudSig = [];
  function setT(id, v) { const e = $(id); if (e._v !== v) { e._v = v; e.textContent = v; } }
  function hud() {
    const G = S.G; if (!G) return;
    const hs = Math.max(0, G.lives) + '/' + G.maxLives + (G.shield ? 's' : '');
    if (hudSig[0] !== hs) { hudSig[0] = hs; $('hHearts').innerHTML = Array.from({ length: G.maxLives }, (_, i) => `<span class="${i < G.lives ? '' : 'off'}">❤️</span>`).join('') + (G.shield ? '<span>🛡️</span>' : ''); }
    setT('hScore', String(Math.floor(G.score))); setT('hCoins', '🪙 ' + G.coins);
    setT('hDist', G.endless ? Math.floor(G.dist) + ' m' : Math.floor(G.dist) + ' / ' + G.L.len + ' m');
    $('hProg').style.width = (G.endless ? (G.dist % 400) / 4 : clamp(FR.progress(G) * 100, 0, 100)).toFixed(1) + '%';
    const ps = [G.magnet > 0 ? '🧲 ' + Math.ceil(G.magnet) : '', G.dbl > 0 ? '✖️2 ' + Math.ceil(G.dbl) : '', G.turbo > 0 ? '🚀 ' + Math.ceil(G.turbo) : ''].filter(Boolean).join('|');
    if (hudSig[1] !== ps) { hudSig[1] = ps; $('hPw').innerHTML = ps ? ps.split('|').map(t => `<span>${t}</span>`).join('') : ''; } else if (ps) { $('hPw').innerHTML = ps.split('|').map(t => `<span>${t}</span>`).join(''); }
  }
  function onEv(e) {
    V.fx(e);
    if (e.t === 'coin') sfx('coin'); else if (e.t === 'jump') sfx('jump'); else if (e.t === 'slide') sfx('slide'); else if (e.t === 'land') sfx('land'); else if (e.t === 'lane') sfx('lane');
    else if (e.t === 'hit') { sfx('hit'); const f = $('flash'); f.classList.add('on'); setTimeout(() => f.classList.remove('on'), 120); navigator.vibrate && navigator.vibrate(60); }
    else if (e.t === 'shieldBreak') sfx('shield'); else if (e.t === 'power') sfx(e.k === 'heart' ? 'heart' : e.k === 'turbo' ? 'turbo' : 'power');
    else if (e.t === 'dead') sfx('lose'); else if (e.t === 'win') sfx('win');
  }
  function runTick(dt) {
    const G = S.G;
    if (S.phase === 'count') {
      S.cT -= dt; const n = Math.ceil(S.cT - .4), c = $('count');
      if (n !== lastCount) { lastCount = n; c.hidden = false; c.innerHTML = '<b>' + (n > 0 ? n : 'LOS!') + '</b>'; sfx(n > 0 ? 'count' : 'go'); }
      if (S.cT <= 0) { S.phase = 'play'; c.hidden = true; }
      V.runSync(G, 0); return;
    }
    if (S.phase === 'play' || S.phase === 'end') {
      S.acc += dt; let n = 0;
      while (S.acc >= 1 / 60 && n++ < 6) { FR.step(G, 1 / 60); S.acc -= 1 / 60; for (const e of G.ev) onEv(e); G.ev.length = 0; }
      if (n >= 6) S.acc = 0;
      V.runSync(G, dt);
      if (G.over && S.phase === 'play') { S.phase = 'end'; S.endT = G.won ? 1.8 : 1.5; }
      if (S.phase === 'end') { S.endT -= dt; if (S.endT <= 0) { S.phase = 'done'; runResult(); } }
    } else if (S.phase === 'done') V.runSync(G, dt);
  }
  function runResult() {
    const G = S.G, r = FR.result(G), info = S.runInfo; $('hud').hidden = true;
    let stars = r.stars, newBest = false, title, text = '', next = null;
    SAVE.coins += r.coins;
    if (info.kind === 'level') {
      if (r.won) { SAVE.stars[info.w] = SAVE.stars[info.w] || [0, 0, 0, 0, 0]; if (stars > (SAVE.stars[info.w][info.i] || 0)) SAVE.stars[info.w][info.i] = stars; }
      title = r.won ? (stars === 3 ? 'PERFEKT! 🏆' : 'Geschafft!') : 'Gescheitert …';
      text = r.won ? `${FR.levelDef(info.w, info.i).name}` : 'Weiche mit Spurwechsel, Sprung und Rutschen aus – versuch’s nochmal.';
      if (r.won && info.i < 4) next = { label: '▶ Nächstes Level', fn: () => startLevel(info.w, info.i + 1) };
      else if (r.won) { const wi = WORLDS.findIndex(w => w.id === info.w); if (wi < WORLDS.length - 1) next = { label: '▶ Nächste Welt', fn: () => startLevel(WORLDS[wi + 1].id, 0) }; text += ' · Welt komplett!'; }
    } else {
      const b = SAVE.endless[info.w] || 0; newBest = r.score > b; if (newBest) SAVE.endless[info.w] = r.score; stars = -1;
      title = 'Das war’s!'; text = newBest ? '🏆 Neuer Rekord!' : 'Rekord: ' + b;
    }
    save(); S.lastResult = r;
    showRes({ title, stars, grid: [[r.score, 'Punkte'], [r.coins, 'Münzen'], [r.dist + ' m', 'Strecke']], text, next, again: () => (info.kind === 'level' ? startLevel(info.w, info.i) : startEndless(info.w)) });
  }
  let resNext = null, resAgain = null;
  function showRes(o) {
    $('rTitle').textContent = o.title;
    $('rStars').innerHTML = o.stars >= 0 ? [0, 1, 2].map(i => `<span class="${i < o.stars ? '' : 'off'}">★</span>`).join('') : '';
    $('rGrid').innerHTML = o.grid.map(g => `<div><b>${g[0]}</b><small>${g[1]}</small></div>`).join(''); $('rText').textContent = o.text || '';
    resNext = o.next ? o.next.fn : null; resAgain = o.again; $('rNext').hidden = !o.next; if (o.next) $('rNext').textContent = o.next.label;
    $('ovRes').hidden = false; document.body.classList.add('kbd-ok'); setTimeout(() => { const f = document.querySelector('#ovRes .pri, #ovRes .nav'); if (document.body.classList.contains('kbd') && f) f.focus(); }, 40);
  }
  $('rNext').addEventListener('click', () => { if (resNext) { $('ovRes').hidden = true; resNext(); } });
  $('rAgain').addEventListener('click', () => { $('ovRes').hidden = true; resAgain && resAgain(); });
  $('rMenu').addEventListener('click', () => toMenu());

  /* ---------- Pause ---------- */
  function pause() {
    if (S.phase === 'play' || S.phase === 'count') { S.paused = true; S.prePhase = S.phase; S.phase = 'paused'; showPause(); }
    else if (S.mode === 'beat' && S.phase === 'bplay') { FRB.pause(); S.phase = 'bpaused'; showPause(); }
  }
  function showPause() { renderOpts(); $('ovPause').hidden = false; setTimeout(focusFirst, 0); }
  function resume() {
    $('ovPause').hidden = true;
    if (S.phase === 'paused') { S.phase = S.prePhase || 'play'; S.paused = false; } else if (S.phase === 'bpaused') { FRB.resume(); S.phase = 'bplay'; }
  }
  $('pResume').addEventListener('click', resume);
  $('pRestart').addEventListener('click', () => { $('ovPause').hidden = true; restart(); });
  $('pMenu').addEventListener('click', toMenu);
  $('pSound').addEventListener('click', () => { SAVE.sound = SAVE.sound ? 0 : 1; FRB.setMuted(!SAVE.sound); save(); renderOpts(); });
  $('bPause').addEventListener('click', pause); $('bbPause').addEventListener('click', pause);
  function restart() { const i = S.runInfo; if (!i) return toMenu(); if (i.kind === 'level') startLevel(i.w, i.i); else if (i.kind === 'endless') startEndless(i.w); else if (i.kind === 'beat') startBeat(i.song, i.station, i.opt); }
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  addEventListener('blur', () => { if (S.phase === 'play') pause(); });

  /* ---------- Beat-Modus ---------- */
  const LVL_LABEL = { leicht: 'Leicht', normal: 'Normal', profi: 'Profi' };
  const liedKey = s => s.id + ':' + SAVE.liedLvl;
  function renderBeat() {
    document.querySelectorAll('#bModes button').forEach(b => b.classList.toggle('on', b.dataset.m === S.bMode));
    const lied = S.bMode === 'lieder'; $('stGrid').hidden = lied; $('lieder').hidden = !lied;
    if (!lied) {
      const camp = S.bMode === 'campaign', order = camp ? FRB.ORDER : FRB.STATIONS.map((_, i) => i);
      if (camp && FRB.rankOf(S.bTrack) > SAVE.beatProg) S.bTrack = FRB.ORDER[Math.min(SAVE.beatProg, FRB.TRACKS - 1)];
      $('stGrid').innerHTML = order.map(i => { const st = FRB.STATIONS[i], lock = camp && FRB.rankOf(i) > SAVE.beatProg, best = SAVE.beatBest[i]; return `<button class="nav st ${i === S.bTrack ? 'on' : ''} ${lock ? 'lock' : ''}" data-i="${i}"><img src="logos/${String(i + 1).padStart(2, '0')}.webp" alt="" loading="lazy"><span>${lock ? '🔒 ' : ''}${st.n}</span><small>${st.g}</small>${best ? `<span class="sc">★ ${best}</span>` : ''}</button>`; }).join('');
      const st = FRB.STATIONS[S.bTrack]; $('bInfo').textContent = st ? `${st.n} · ${st.g} · ${st.bpm} BPM` : '';
      $('bGo').disabled = false;
    } else { loadLieder(); renderLieder(); }
  }
  $('bModes').addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (!b) return; sfx('ui'); S.bMode = b.dataset.m; renderBeat(); });
  $('stGrid').addEventListener('click', e => { const b = e.target.closest('[data-i]'); if (!b) return; const i = +b.dataset.i; if (S.bMode === 'campaign' && FRB.rankOf(i) > SAVE.beatProg) { sfx('hit'); toast('Erst die Sender davor schaffen'); return; } sfx('ui'); if (i === S.bTrack && e.detail > 1) { $('bGo').click(); return; } S.bTrack = i; renderBeat(); const n = document.querySelector(`#stGrid [data-i="${i}"]`); n && document.body.classList.contains('kbd') && n.focus(); });
  $('bGo').addEventListener('click', () => { wakeAudio(); if (S.bMode === 'lieder') { if (S.bLied) startLied(S.bLied); else toast('Erst ein Lied wählen'); } else startBeat(FRB.buildSong(S.bTrack), S.bTrack, { camp: S.bMode === 'campaign' }); });
  function liedFiltered() { const k = S.lQ.trim().toLowerCase(); return (S.lieder || []).filter(s => (S.lCat === 'alle' || s.cat === S.lCat) && (!k || (s.title + ' ' + s.artist).toLowerCase().includes(k))); }
  function renderLieder() {
    if (!S.lieder) { $('lList').innerHTML = '<p class="hint">Lieder werden geladen …</p>'; return; }
    const cats = Object.assign({ alle: 'Alle' }, KLSongLib.CATS);
    $('lCats').innerHTML = Object.keys(cats).filter(k => k === 'alle' || S.lieder.some(s => s.cat === k)).map(k => `<button class="nav ${S.lCat === k ? 'on' : ''}" data-c="${k}">${cats[k]}</button>`).join('');
    const l = liedFiltered(), note = d => '♪'.repeat(clamp(d || 2, 1, 4)), esc = t => String(t).replace(/[<&>]/g, '');
    $('lList').innerHTML = l.length ? l.map((s, i) => `<button class="nav ${s === S.bLied ? 'on' : ''}" data-i="${i}"><b>${esc(s.title)}</b><small>${esc(s.artist)} · ${Math.floor((s.dur || 0) / 60)}:${String((s.dur || 0) % 60).padStart(2, '0')} · ${note(s.diff)}${SAVE.liedBest[liedKey(s)] ? ' · Best ' + SAVE.liedBest[liedKey(s)] : ''}</small></button>`).join('') : '<p class="hint">Nichts gefunden.</p>';
    document.querySelectorAll('#lLvl button').forEach(b => b.classList.toggle('on', b.dataset.l === SAVE.liedLvl));
    $('lLic').textContent = S.bLied ? '© ' + S.bLied.lic : 'Lied antippen, nochmal antippen oder „Los“ zum Starten.'; $('bInfo').textContent = '';
    S._lfilter = l; $('bGo').disabled = !S.bLied;
  }
  $('lCats').addEventListener('click', e => { const b = e.target.closest('[data-c]'); if (!b) return; S.lCat = b.dataset.c; renderLieder(); });
  $('lList').addEventListener('click', e => { const b = e.target.closest('[data-i]'); if (!b) return; const s = S._lfilter[+b.dataset.i]; wakeAudio(); if (s === S.bLied) { startLied(s); return; } S.bLied = s; sfx('ui'); renderLieder(); const n = document.querySelector(`#lList [data-i="${b.dataset.i}"]`); n && document.body.classList.contains('kbd') && n.focus(); });
  $('lLvl').addEventListener('click', e => { const b = e.target.closest('[data-l]'); if (!b) return; SAVE.liedLvl = b.dataset.l; save(); renderLieder(); });
  $('lSearch').addEventListener('input', e => { S.lQ = e.target.value; renderLieder(); });
  $('lSearch').addEventListener('keydown', e => e.stopPropagation());
  function loadLieder() { if (S.lieder || !window.KLSongLib || loadLieder.busy) return; loadLieder.busy = 1; KLSongLib.list().then(l => { S.lieder = l; if (!S.bLied) S.bLied = l[0]; loadLieder.busy = 0; if (S.cur === 'sBeat' && S.bMode === 'lieder') renderLieder(); }).catch(() => { loadLieder.busy = 0; $('lList').innerHTML = '<p class="hint">Lieder konnten nicht geladen werden (offline?).</p>'; }); }
  async function startLied(s) {
    if (!s) return; $('bInfo').textContent = '🎹 ' + s.title + ' wird geladen …';
    try { const c = await KLSongLib.chart(s); startBeat(FRB.liedSong(c, s, SAVE.liedLvl), FRB.LIED_STATION[s.cat] != null ? FRB.LIED_STATION[s.cat] : 1, { lied: s }); }
    catch (e) { $('bInfo').textContent = '📡 Lied konnte nicht geladen werden – bitte später nochmal.'; }
  }
  const BW = ['studio', 'jungle', 'fantasy'];
  async function startBeat(song, station, opt) {
    wakeAudio(); closeOvs(); cleanupPlay(); S.mode = 'beat'; S.phase = 'load'; S.runInfo = { kind: 'beat', song: null, station, opt: opt || {} }; S.paused = false;
    ['sMenu', 'sWorlds', 'sHeroes', 'sBeat', 'sShop', 'sOpts', 'sHelp'].forEach(i => $(i).classList.remove('on')); S.cur = '';
    $('hud').hidden = true; $('bhud').hidden = false; FRB.bgStop();
    const wi = station % 3; try { await V.setWorld(BW[wi], [0, 1, 2][(station >> 1) % 3]); await V.setHero(SAVE.hero); } catch (e) { console.warn(e); }
    // Lied neu bauen, damit Noten frisch sind (Neustart)
    const o = opt || {}; let sg = song; if (S.runInfo) S.runInfo.song = song;
    if (o.rebuild) sg = o.rebuild();
    S.beatSong = sg; S.runInfo.rebuild = o.rebuild || (o.lied ? null : () => FRB.buildSong(station));
    V.beatStart(sg); resetBeatHud(sg, station, o);
    S.phase = 'bplay';
    FRB.begin(sg, { judge: onJudge, press: (lane, hit) => V.beatPress(lane), end: onBeatEnd });
  }
  function resetBeatHud(sg, station, o) {
    const st = FRB.STATIONS[station]; $('bName').textContent = sg.lied ? `🎹 ${sg.lied.title} · © ${sg.lied.lic}` : `${st.n} · ${st.g}`;
    $('bCombo').style.visibility = 'hidden'; $('bJudge').textContent = ''; setT('bScore', '0'); setT('bAcc', '100 %'); $('bHp').style.width = '70%'; $('bProg').style.width = '0%';
    const best = sg.lied ? SAVE.liedBest[liedKey(sg.lied)] : SAVE.beatBest[station]; $('bBest').textContent = best ? 'Best ' + best : '';
  }
  const JT = [['VERPASST', '#ff4d6a'], ['GUT', '#ffd84a'], ['PERFEKT', '#00ffd0']];
  function onJudge(qv, lane) {
    V.beatHit(qv, lane); const j = $('bJudge'); j.textContent = JT[qv][0]; j.style.color = JT[qv][1]; j.style.textShadow = '0 0 16px ' + JT[qv][1]; j.classList.remove('show'); void j.offsetWidth; j.classList.add('show');
    if (qv === 0) { const f = $('flash'); f.classList.add('on'); setTimeout(() => f.classList.remove('on'), 100); }
  }
  function beatHud(t) {
    const R = FRB.R, sg = FRB.song; if (!sg) return;
    setT('bScore', String(Math.floor(R.score))); $('bHp').style.width = clamp(R.health, 0, 100) + '%'; setT('bAcc', Math.round(FRB.accuracy() * 100) + ' %');
    $('bProg').style.width = clamp((t - sg.countIn) / Math.max(1, sg.end - sg.countIn) * 100, 0, 100) + '%';
    const c = $('bCombo'); if (R.combo >= 3) { c.style.visibility = 'visible'; setT('bComboN', R.combo + ' ×'); setT('bComboM', 'Multiplikator ×' + FRB.mult()); } else c.style.visibility = 'hidden';
  }
  function onBeatEnd(r) {
    const info = S.runInfo, o = info.opt || {}, st = info.station; V.beatEnd(r.cleared); S.phase = 'bdone'; $('bhud').hidden = true;
    let nb = false, next = null, text = '';
    if (r.song.lied) {
      const k = liedKey(r.song.lied); nb = r.cleared && r.score > (SAVE.liedBest[k] || 0); if (nb) SAVE.liedBest[k] = r.score;
      text = `🎹 ${r.song.lied.title} · ${r.song.lied.artist}${nb ? ' · 🏆 Neuer Bestwert!' : ''}${r.bonus ? ' · +' + r.bonus + ' Sternbonus' : ''} · © ${r.song.lied.lic}`;
      if (r.cleared) { const l = liedFiltered(), i = l.indexOf(r.song.lied), n = l[(i + 1) % l.length]; if (n && n !== r.song.lied) next = { label: '▶ Nächstes Lied', fn: () => { S.bLied = n; startLied(n); } }; }
    } else {
      const rank = FRB.rankOf(st), stn = FRB.STATIONS[st]; nb = r.cleared && r.score > (SAVE.beatBest[st] || 0); if (nb) SAVE.beatBest[st] = r.score;
      if (r.cleared && o.camp) SAVE.beatProg = Math.max(SAVE.beatProg, rank + 1);
      const last = o.camp && rank >= FRB.TRACKS - 1;
      text = r.cleared ? `${stn.n} · ${stn.g}${nb ? ' · 🏆 Neuer Bestwert!' : ''}${r.bonus ? ' · +' + r.bonus + ' Sternbonus' : ''}${last ? ' · KAMPAGNE KOMPLETT!' : ''}` : 'Versuch es nochmal – achte auf den Takt!';
      if (r.cleared && !last) { const n = o.camp ? FRB.ORDER[Math.min(FRB.TRACKS - 1, rank + 1)] : (st + 1) % FRB.TRACKS; next = { label: '▶ Nächster Sender', fn: () => { S.bTrack = n; startBeat(FRB.buildSong(n), n, { camp: o.camp }); } }; }
    }
    const coins = r.cleared ? r.stars * 40 : 0; SAVE.coins += coins; save();
    setTimeout(() => { if (S.mode !== 'beat' || S.phase !== 'bdone') return; showRes({ title: r.cleared ? (r.stars === 3 ? 'PERFEKT! 🏆' : 'Geschafft!') : 'Die Welle ist weg …', stars: r.cleared ? r.stars : 0, grid: [[r.score, 'Punkte'], [Math.round(r.acc * 100) + ' %', 'Genauigkeit'], [r.maxCombo, 'Combo']], text: text + (coins ? ' · +' + coins + ' 🪙' : ''), next, again: () => { if (r.song.lied) startLied(r.song.lied); else startBeat(FRB.buildSong(st), st, o); } }); }, r.cleared ? 1400 : 900);
  }

  /* ---------- Eingabe: Tastatur ---------- */
  const BKEY = { KeyD: 0, KeyF: 1, KeyJ: 2, KeyK: 3, ArrowLeft: 0, ArrowDown: 1, ArrowUp: 2, ArrowRight: 3 };
  const KMOVE = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], KeyW: [0, -1], KeyS: [0, 1], KeyA: [-1, 0], KeyD: [1, 0] };
  function runAct(a) { const G = S.G; if (!G || S.phase !== 'play') return; if (a === 'l') FR.moveLane(G, -1); else if (a === 'r') FR.moveLane(G, 1); else if (a === 'u') FR.jump(G); else if (a === 'd') FR.slide(G); }
  addEventListener('keydown', e => {
    wakeAudio(); const c = e.code; document.body.classList.add('kbd');
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(c)) { if (!(e.target && e.target.tagName === 'INPUT')) e.preventDefault(); }
    if (c === 'Escape' || (c === 'KeyP' && S.mode !== 'menu')) { e.preventDefault(); back(); return; }
    if (c === 'KeyM') { SAVE.sound = SAVE.sound ? 0 : 1; FRB.setMuted(!SAVE.sound); save(); return; }
    if (e.target && e.target.tagName === 'INPUT') return;
    if (S.mode === 'run' && !hasOv().length) { if (e.repeat) return; if (c === 'ArrowLeft' || c === 'KeyA') runAct('l'); else if (c === 'ArrowRight' || c === 'KeyD') runAct('r'); else if (c === 'ArrowUp' || c === 'KeyW' || c === 'Space') runAct('u'); else if (c === 'ArrowDown' || c === 'KeyS') runAct('d'); return; }
    if (S.mode === 'beat' && S.phase === 'bplay' && !hasOv().length) { if (e.repeat) return; if (c in BKEY) { onPad(BKEY[c]); } return; }
    if (S.mode === 'beat' && S.phase === 'bpaused' || S.phase === 'paused') { if (c === 'Enter' || c === 'Space') { } }
    const d = KMOVE[c];
    if (d && c !== 'KeyD') {
      const ae = document.activeElement; if (S.cur === 'sHeroes' && !hasOv().length && ae && ae.closest('.heroRow') && d[1] === 0) { e.preventDefault(); stepHero(d[0]); return; }
      e.preventDefault(); moveFocus(d[0], d[1]);
    } else if (c === 'KeyD') { moveFocus(1, 0); }
  });
  function onPad(lane) { if (S.phase !== 'bplay') return; FRB.press(lane); }
  document.querySelectorAll('#pads button').forEach(el => {
    el.addEventListener('pointerdown', e => { e.preventDefault(); wakeAudio(); try { el.setPointerCapture(e.pointerId); } catch (x) { } el.classList.add('down'); onPad(+el.dataset.l); });
    const up = () => el.classList.remove('down'); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); el.addEventListener('lostpointercapture', up);
    el.addEventListener('contextmenu', e => e.preventDefault());
  });
  addEventListener('contextmenu', e => e.preventDefault());
  addEventListener('pointerdown', () => { document.body.classList.remove('kbd'); wakeAudio(); }, true);

  /* ---------- Eingabe: Wischen ---------- */
  /* Ruhiger: Schwelle wächst mit der Bildschirmgröße, Richtung muss klar überwiegen, eine Aktion pro Wisch;
     ein zweiter Schritt im selben Wisch erst nach deutlich weiterem Weg und kurzer Pause. Tippen = Springen nur bei kurzem, ruhigem Tipp. */
  const SW = { id: null, x: 0, y: 0, x0: 0, y0: 0, t0: 0, tA: 0, n: 0 };
  const swTh = () => Math.max(34, Math.min(70, Math.min(innerWidth, innerHeight) * .085));
  addEventListener('pointerdown', e => { if (S.mode !== 'run' || e.target.closest('button,.ov') || (SW.id != null && SW.id !== e.pointerId)) return; SW.id = e.pointerId; SW.x = SW.x0 = e.clientX; SW.y = SW.y0 = e.clientY; SW.t0 = performance.now(); SW.tA = 0; SW.n = 0; });
  addEventListener('pointermove', e => {
    if (e.pointerId !== SW.id || S.mode !== 'run') return;
    const dx = e.clientX - SW.x, dy = e.clientY - SW.y, ax = Math.abs(dx), ay = Math.abs(dy), m = Math.max(ax, ay), now = performance.now();
    const need = swTh() * (SW.n ? 1.6 : 1); if (m < need || (SW.n && now - SW.tA < 160)) return;
    if (Math.max(ax, ay) < Math.min(ax, ay) * 1.35) { SW.x = e.clientX; SW.y = e.clientY; return; }   // schräg: nichts auslösen
    if (ax > ay) runAct(dx < 0 ? 'l' : 'r'); else runAct(dy < 0 ? 'u' : 'd');
    SW.n++; SW.tA = now; SW.x = e.clientX; SW.y = e.clientY;
  });
  const swEnd = e => { if (e.pointerId !== SW.id) return; if (e.type === 'pointerup' && !SW.n && S.mode === 'run' && S.phase === 'play' && Math.hypot(e.clientX - SW.x0, e.clientY - SW.y0) < 12 && performance.now() - SW.t0 < 260) runAct('u'); SW.id = null; };
  addEventListener('pointerup', swEnd); addEventListener('pointercancel', swEnd);

  /* ---------- Eingabe: Controller ---------- */
  const PAD = { b: [], dir: null }; let padNavT = 0;
  function anyPad() { try { return navigator.getGamepads && Array.from(navigator.getGamepads() || []).some(Boolean); } catch (e) { return false; } }
  function pollPads(dt) {
    let list = []; try { list = navigator.getGamepads ? Array.from(navigator.getGamepads()) : []; } catch (e) { }
    const g = list.find(p => p && p.connected); if (!g) return;
    const ax = g.axes || [], bt = g.buttons || [], pr = k => !!(bt[k] && (bt[k].pressed || bt[k].value > .5)), now = []; for (let k = 0; k < 17; k++) now[k] = pr(k); const down = k => now[k] && !PAD.b[k];
    let sx = ax[0] || 0, sy = ax[1] || 0; if (Math.hypot(sx, sy) < .45) sx = sy = 0; if (pr(14)) sx = -1; if (pr(15)) sx = 1; if (pr(12)) sy = -1; if (pr(13)) sy = 1;
    const x = Math.abs(sx) > .5 ? Math.sign(sx) : 0, z = Math.abs(sy) > .5 ? Math.sign(sy) : 0, dir = Math.abs(x) >= Math.abs(z) ? (x ? (x > 0 ? 'right' : 'left') : null) : (z > 0 ? 'down' : 'up');
    if (S.mode === 'run' && !hasOv().length) {
      if (dir && dir !== PAD.dir) runAct({ left: 'l', right: 'r', up: 'u', down: 'd' }[dir]);
      if (down(0)) runAct('u'); if (down(1) || down(2)) runAct('d'); if (down(9)) pause();
    } else if (S.mode === 'beat' && S.phase === 'bplay' && !hasOv().length) {
      if (down(14) || down(2) || down(4)) onPad(0); if (down(13) || down(0)) onPad(1); if (down(12) || down(3)) onPad(2); if (down(15) || down(1) || down(5)) onPad(3); if (down(9)) pause();
    } else {
      document.body.classList.add('kbd');
      if (dir && (dir !== PAD.dir || padNavT <= 0)) { const dd = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[dir], ae = document.activeElement; if (S.cur === 'sHeroes' && !hasOv().length && ae && ae.closest('.heroRow') && dd[1] === 0) stepHero(dd[0]); else moveFocus(dd[0], dd[1]); padNavT = dir !== PAD.dir ? .35 : .15; }
      if (down(0)) { const a = document.activeElement; if (a && a !== document.body && a.click && navEls().includes(a)) a.click(); else focusFirst(); }
      if (down(1)) back(); if (down(9)) { if (hasOv().some(o => o.id === 'ovPause')) resume(); }
    }
    PAD.dir = dir; PAD.b = now; padNavT -= dt;
  }
  addEventListener('gamepadconnected', () => { toast('🎮 Controller verbunden'); document.body.classList.add('kbd'); });

  /* ---------- Hauptschleife ---------- */
  let last = performance.now();
  function loop(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now; pollPads(dt);
    if (V) {
      if (S.mode === 'run' && S.G && S.phase !== 'load') { if (S.phase !== 'paused') { runTick(dt); } hud(); FRB.bgTick(); }
      else if (S.mode === 'beat' && S.beatSong && S.phase !== 'load') {
        let t = FRB.songTime(); if (S.phase === 'bplay') t = FRB.tick();
        if (S.phase !== 'bpaused') V.beatSync(dt, t, { over: FRB.R.ended }); beatHud(t);
      } else if (S.mode === 'menu') FRB.bgTick();
      V.frame(S.phase === 'paused' || S.phase === 'bpaused' ? 0 : dt);
    }
    requestAnimationFrame(loop);
  }

  /* ---------- Start ---------- */
  const TIPS = ['Strecke wird aufgebaut …', 'Scheinwerfer werden justiert …', 'Boxen werden aufgedreht …', 'Helden machen sich bereit …', 'Gleich geht’s los!'];
  const bar = p => { $('loadBar').style.width = Math.round(p * 100) + '%'; $('loadTip').textContent = TIPS[Math.min(TIPS.length - 1, Math.floor(p * TIPS.length))]; };
  const origScr = scr;
  async function boot() {
    const t0 = performance.now(); bar(.05);
    try { if (!window.THREE) throw new Error('three'); V = FRView.create({ canvas: $('cv'), base: '', low }); }
    catch (e) { $('loadTip').textContent = 'Funkrenner braucht 3D-Grafik (WebGL). Bitte einen aktuellen Browser verwenden.'; console.warn(e); return; }
    window.FRV = V; if (coarse()) document.body.classList.add('coarse');
    const play = q.get('play'); if (q.get('hero')) SAVE.hero = q.get('hero');
    syncHeroIdx();
    try { await V.setWorld(S.world, 0, p => bar(.1 + p * .7)); bar(.85); await V.setHero(SAVE.hero); } catch (e) { console.warn(e); }
    V.setMode('menu'); V.menuShift = 1.7; bar(1); requestAnimationFrame(loop);
    await new Promise(r => setTimeout(r, Math.max(0, 900 - (performance.now() - t0))));
    $('sLoad').classList.add('out'); setTimeout(() => $('sLoad').classList.remove('on', 'out'), 520);
    S.ready = true; if (anyPad()) document.body.classList.add('kbd');
    if (play) { const [w, i] = play.split(':'); if (w === 'endless') startEndless(q.get('w') || 'jungle'); else if (w === 'beat') { const n = +(i || 0); startBeat(FRB.buildSong(n), n, {}); } else startLevel(w, +(i || 0)); }
    else scr('sMenu');
  }
  syncHeroIdx();
  // Held beim Öffnen des Held-Fensters anzeigen
  const oldRenderHero = renderHero; document.getElementById('tiles').addEventListener('click', e => { if (e.target.closest('[data-go="heroes"]')) { syncHeroIdx(); renderHero(); } }, true);
  window.FRApp = { S, SAVE, startLevel, startEndless, startBeat, toMenu, pause, resume, get V() { return V; }, get G() { return S.G; }, step: n => { for (let i = 0; i < n; i++) { if (S.G && S.phase === 'play') { FR.bot(S.G); FR.step(S.G, 1 / 60); for (const e of S.G.ev) onEv(e); S.G.ev.length = 0; } } } };
  boot();
})();
