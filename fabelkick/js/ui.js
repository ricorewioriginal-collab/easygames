/* FABELKICK 3D – Menüs, HUD, Pokal und Hauptschleife */
'use strict';
(function () {
  const $ = s => document.querySelector(s), $$ = s => Array.from(document.querySelectorAll(s));
  const A = FK.Audio, IN = FK.Input, S = FK.settings;
  let world = null, match = null, screen = 'boot', base = 'boot', focusEl = null, last = performance.now(), matchCfg = null;
  const showcase = {};
  const sel = { mode: 'quick', home: 'affen', away: 'orks', devs: {} };
  const crestBg = t => `conic-gradient(${t.kit.shirt} 0 50%, ${t.kit.trim} 50% 75%, ${t.kit.shorts} 75%)`;
  const crest = (t, cls) => `<span class="${cls || 'crest'}" style="background:${crestBg(t)}">${cls ? '' : t.icon}</span>`;
  const stars = r => { const n = Math.max(1, Math.min(5, (r - 58) / 6.5)); let s = ''; for (let i = 1; i <= 5; i++) s += n >= i - 0.25 ? '★' : '☆'; return s; };

  // ---------- Bildschirme ----------
  const OVERLAYS = ['pause', 'result'];
  function show(id, keepFocus) {
    const ov = OVERLAYS.includes(id);
    $$('.screen').forEach(s => { const on = s.id === id || (ov && s.id === base); s.classList.toggle('on', on); });
    if (!ov) base = id;
    screen = id; document.body.dataset.screen = id;
    if (!keepFocus) setFocus(navEls()[0] || null);
    hints();
  }
  function navEls() { return $$('#' + screen + ' .nav').filter(e => e.offsetParent !== null && !e.classList.contains('hidden')); }
  function setFocus(el) {
    if (focusEl) focusEl.classList.remove('focus');
    focusEl = el;
    if (el) { el.classList.add('focus'); if (el.scrollIntoView) el.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
  }
  function moveFocus(dir) {
    const els = navEls(); if (!els.length) return;
    if (!focusEl || !els.includes(focusEl)) { setFocus(els[0]); return; }
    const r = focusEl.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    let best = null, bs = 1e9;
    els.forEach(e => {
      if (e === focusEl) return;
      const q = e.getBoundingClientRect(), x = q.left + q.width / 2, y = q.top + q.height / 2, dx = x - cx, dy = y - cy;
      let main, side;
      if (dir === 'left') { if (q.right > r.left + 4 && dx > -4) return; main = -dx; side = Math.abs(dy); }
      else if (dir === 'right') { if (q.left < r.right - 4 && dx < 4) return; main = dx; side = Math.abs(dy); }
      else if (dir === 'up') { if (q.bottom > r.top + 4 && dy > -4) return; main = -dy; side = Math.abs(dx); }
      else { if (q.top < r.bottom - 4 && dy < 4) return; main = dy; side = Math.abs(dx); }
      const sc = main + side * 2.2;
      if (sc < bs) { bs = sc; best = e; }
    });
    if (best) { setFocus(best); A.move(); }
  }
  function hints() {
    const t = IN.lastType;
    const html = t === 'pad' ? '<span><i class="k a">A</i>Auswählen</span><span><i class="k b">B</i>Zurück</span><span><i class="k">✛</i>Wechseln</span>'
      : t === 'kb' ? '<span><i class="k">Enter</i>Auswählen</span><span><i class="k">Esc</i>Zurück</span><span><i class="k">← →</i>Ändern</span>' : '';
    $$('[data-hints]').forEach(h => { h.innerHTML = html; });
  }
  IN.onType = () => hints();

  function handleMenu() {
    let m;
    while ((m = IN.menu())) {
      if (screen === 'press') { goMenu(); continue; }
      if (m === 'ok') { if (focusEl) { A.ui(); activate(focusEl); } }
      else if (m === 'back') back();
      else if (m === 'start') { if (screen === 'pause') resume(); else if (screen !== 'menu') back(); }
      else if (focusEl && focusEl.dataset.lr && (m === 'left' || m === 'right')) { changeLR(focusEl.dataset.lr, m === 'left' ? -1 : 1); }
      else moveFocus(m);
    }
  }
  function activate(el) {
    if (el.dataset.act) act(el.dataset.act, el);
    else if (el.dataset.lr) changeLR(el.dataset.lr, 1);
  }
  document.addEventListener('click', e => {
    A.unlock();
    if (screen === 'press') { goMenu(); return; }
    const st = e.target.closest('[data-step]');
    if (st) { const lr = st.closest('[data-lr]'); if (lr) { setFocus(lr); changeLR(lr.dataset.lr, +st.dataset.step); A.ui(); } e.stopPropagation(); return; }
    const el = e.target.closest('.nav'); if (!el) return;
    setFocus(el); A.ui(); activate(el);
  });
  document.addEventListener('mousemove', e => { const el = e.target.closest && e.target.closest('.nav'); if (el && el !== focusEl && navEls().includes(el)) setFocus(el); }, { passive: true });

  function back() {
    A.back();
    if (screen === 'pause') { resume(); return; }
    if (screen === 'controls' && match) { show('pause'); return; }
    if (['select', 'cup', 'teams', 'settings', 'controls'].includes(screen)) { goMenu(); return; }
  }

  // ---------- Aktionen ----------
  function act(a) {
    switch (a) {
      case 'start': goMenu(); break;
      case 'quick': openSelect('quick'); break;
      case 'pens': openSelect('pens'); break;
      case 'training': openSelect('training'); break;
      case 'cup': if (FK.save.cup && !FK.save.cup.over) openCup(); else openSelect('cup'); break;
      case 'teams': renderTeams(); show('teams'); break;
      case 'settings': renderSettings(); show('settings'); break;
      case 'controls': show('controls'); break;
      case 'pauseControls': show('controls'); break;
      case 'fullscreen': toggleFs(); break;
      case 'back': back(); break;
      case 'go': go(); break;
      case 'cupPlay': cupPlay(); break;
      case 'cupQuit': FK.save.cup = null; FK.persist(); goMenu(); break;
      case 'resume': resume(); break;
      case 'restart': if (matchCfg) startMatch(matchCfg); break;
      case 'quit': endMatch(); goMenu(); break;
      case 'again': if (matchCfg) startMatch(matchCfg); break;
      case 'menu': endMatch(); goMenu(); break;
      case 'toCup': endMatch(); openCup(); break;
      case 'cupNew': FK.save.cup = null; FK.persist(); openSelect('cup'); break;
    }
  }
  function toggleFs() {
    const d = document, el = d.documentElement;
    try {
      if (d.fullscreenElement || d.webkitFullscreenElement) (d.exitFullscreen || d.webkitExitFullscreen).call(d);
      else (el.requestFullscreen || el.webkitRequestFullscreen).call(el);
    } catch (e) { /* nicht möglich */ }
  }
  function goMenu() {
    A.unlock(); A.music(true); A.crowd(0.03);
    renderProfile();
    if (world.arena.id !== S.arena) world.setArena(FK.arenaById(S.arena));
    show('menu');
    setFocus($('.tile.hero'));
    showcaseMode('lineup');
  }

  // ---------- Einstellungen und Auswahl ----------
  const SETS = [
    { k: 'half', label: 'Halbzeit', vals: [2, 3, 4, 6], fmt: v => v + ' Minuten' },
    { k: 'diff', label: 'Schwierigkeit', vals: [0, 1, 2, 3], fmt: v => FK.DIFFS[v].name },
    { k: 'cam', label: 'Kamera', vals: ['tv', 'nah', 'weit'], fmt: v => ({ tv: 'TV', nah: 'Nah', weit: 'Weit' })[v] },
    { k: 'gfx', label: 'Grafik', vals: ['auto', 'hoch', 'mittel', 'niedrig'], fmt: v => ({ auto: 'Automatisch', hoch: 'Hoch', mittel: 'Mittel', niedrig: 'Niedrig (Akku)' })[v] },
    { k: 'sound', label: 'Ton', vals: [true, false], fmt: v => v ? 'An' : 'Aus' },
    { k: 'music', label: 'Menümusik', vals: [true, false], fmt: v => v ? 'An' : 'Aus' },
    { k: 'vibe', label: 'Vibration', vals: [true, false], fmt: v => v ? 'An' : 'Aus' },
    { k: 'radar', label: 'Radar', vals: [true, false], fmt: v => v ? 'An' : 'Aus' }
  ];
  const optRow = (key, label, val) => `<div class="opt nav lr" data-lr="${key}"><span class="lbl">${label.toUpperCase()}</span><button data-step="-1" aria-label="zurück">‹</button><span class="val">${val}</span><button data-step="1" aria-label="weiter">›</button></div>`;
  function renderSettings() {
    $('#setList').innerHTML = SETS.map(s => optRow('set:' + s.k, s.label, s.fmt(S[s.k]))).join('');
  }
  function cycleSet(k, d) {
    const s = SETS.find(x => x.k === k); let i = s.vals.indexOf(S[k]); if (i < 0) i = 0;
    S[k] = s.vals[(i + d + s.vals.length) % s.vals.length]; FK.persist();
    if (k === 'gfx') { world.setQuality(S.gfx); if (match) match.players.forEach(p => p.char.setShadows(world.quality === 'hoch')); }
    if (k === 'sound') { A.apply(); A.crowd(match ? 0.06 : 0.03); }
    if (k === 'music') A.music(!match);
  }
  function changeLR(key, d) {
    A.move();
    if (key.startsWith('set:')) { cycleSet(key.slice(4), d); refreshLR(key); return; }
    if (key === 'cam') { cycleSet('cam', d); $('#camBtn').textContent = 'Kamera: ' + SETS[2].fmt(S.cam); return; }
    if (key === 'home' || key === 'away') {
      const ids = FK.TEAMS.map(t => t.id); let i = ids.indexOf(sel[key]);
      do { i = (i + d + ids.length) % ids.length; } while (ids[i] === sel[key === 'home' ? 'away' : 'home'] && sel.mode !== 'training');
      sel[key] = ids[i]; renderCards(); updateShowcase(); return;
    }
    if (key === 'arena') { const i = FK.ARENAS.findIndex(a => a.id === S.arena); S.arena = FK.ARENAS[(i + d + FK.ARENAS.length) % FK.ARENAS.length].id; FK.persist(); world.setArena(FK.arenaById(S.arena)); }
    if (key === 'diff' || key === 'half') cycleSet(key, d);
    if (key.startsWith('dev:')) {
      const id = key.slice(4), vals = sel.mode === 'cup' || sel.mode === 'training' ? [-1, 0] : [0, -1, 1];
      let i = vals.indexOf(sel.devs[id]); if (i < 0) i = 0; sel.devs[id] = vals[(i + d + vals.length) % vals.length];
    }
    renderOpts(); setFocus($('#selOpts [data-lr="' + key + '"]'));
  }
  function refreshLR(key) {
    const el = $(`[data-lr="${key}"] .val`); if (!el) return;
    const s = SETS.find(x => 'set:' + x.k === key); if (s) el.textContent = s.fmt(S[s.k]);
  }

  function openSelect(mode) {
    sel.mode = mode;
    if (sel.home === sel.away) sel.away = FK.TEAMS.find(t => t.id !== sel.home).id;
    const devs = IN.devices();
    const prim = IN.lastType === 'pad' && devs.length > 1 ? devs[1].id : 'kb';
    devs.forEach(d => { if (!(d.id in sel.devs)) sel.devs[d.id] = d.id === prim ? 0 : -1; });
    if (!devs.some(d => sel.devs[d.id] >= 0)) sel.devs[prim] = 0;
    if (mode === 'cup' || mode === 'training') devs.forEach(d => { if (sel.devs[d.id] === 1) sel.devs[d.id] = -1; });
    $('#selTitle').textContent = { quick: 'ANSTOSS', cup: 'FABEL-POKAL – DEIN TEAM', pens: 'ELFMETERSCHIESSEN', training: 'TRAINING' }[mode];
    $('#goBtn').textContent = { quick: 'ANPFIFF', cup: 'POKAL STARTEN', pens: 'ZUM PUNKT', training: 'TRAINING STARTEN' }[mode];
    renderCards(); renderOpts();
    show('select');
    setFocus($('#goBtn'));
    showcaseMode('duo'); updateShowcase();
  }
  function teamCard(t, side, arrows) {
    const s = t.stats, bar = (n, v) => `<span>${n}</span><span class="bar"><i style="width:${v}%"></i></span><b>${v}</b>`;
    return `${arrows ? '<button class="arrow l" data-step="-1" aria-label="vorheriges Team">‹</button><button class="arrow r" data-step="1" aria-label="nächstes Team">›</button>' : ''}
      <div class="tc-top">${crest(t)}<div><div class="tc-side">${side}</div><div class="tc-name">${t.name}</div><div class="stars">${stars(FK.rating(t))} <small style="color:#a7b0cc">${FK.rating(t)}</small></div></div></div>
      <div class="bars">${bar('Tempo', s.tempo)}${bar('Schuss', s.schuss)}${bar('Pass', s.pass)}${bar('Abwehr', s.abwehr)}${bar('Torwart', s.tw)}</div>
      <div class="sp"><b>★ ${t.special.name}:</b> ${t.special.desc}</div>`;
  }
  function renderCards() {
    const solo = sel.mode === 'cup' || sel.mode === 'training';
    $('#cardHome').innerHTML = teamCard(FK.teamById(sel.home), sel.mode === 'cup' ? 'DEIN TEAM' : 'HEIM', true);
    $('#cardAway').innerHTML = teamCard(FK.teamById(sel.away), 'GAST', true);
    $('#cardAway').classList.toggle('hidden', solo);
    document.querySelector('.vs').style.visibility = solo ? 'hidden' : '';
  }
  function renderOpts() {
    const m = sel.mode, rows = [];
    if (m !== 'pens') rows.push(optRow('arena', 'Arena', FK.arenaById(S.arena).name));
    if (m !== 'training') rows.push(optRow('diff', 'Schwierigkeit', FK.DIFFS[S.diff].name));
    if (m === 'quick' || m === 'cup') rows.push(optRow('half', 'Halbzeit', S.half + ' Minuten'));
    IN.devices().forEach(d => {
      const v = sel.devs[d.id] == null ? -1 : sel.devs[d.id];
      rows.push(optRow('dev:' + d.id, d.icon + ' ' + d.name, v === 0 ? '◀ HEIM' : v === 1 ? 'GAST ▶' : '– zuschauen –'));
    });
    $('#selOpts').innerHTML = rows.join('');
  }
  function humansFromSel() {
    return IN.devices().filter(d => sel.devs[d.id] === 0 || sel.devs[d.id] === 1).map(d => ({ dev: d.id, team: sel.devs[d.id] }));
  }
  function go() {
    const m = sel.mode;
    if (m === 'cup') { newCup(sel.home); openCup(); return; }
    const home = FK.teamById(sel.home), away = FK.teamById(m === 'training' ? (sel.home === 'orks' ? 'zwerge' : 'orks') : sel.away);
    startMatch({ mode: m === 'pens' ? 'penalties' : m === 'training' ? 'training' : 'match', home, away, humans: humansFromSel(), decide: false });
  }

  // ---------- Teams-Übersicht ----------
  function renderTeams() {
    $('#teamGrid').innerHTML = FK.TEAMS.map(t => `<div class="team-card nav">${teamCard(t, t.motto, false)}</div>`).join('');
  }
  function renderProfile() {
    const s = FK.save;
    $('#profileChips').innerHTML = `<span class="chip">Spiele <b>${s.games}</b></span><span class="chip">S/U/N <b>${s.wins}/${s.draws}/${s.losses}</b></span><span class="chip">Tore <b>${s.goals}</b></span><span class="chip">🏆 <b>${s.cups}</b></span>`;
    const c = s.cup;
    $('#cupInfo').textContent = c && !c.over ? 'Weiter mit ' + FK.teamById(c.team).name + ' – ' + ['Viertelfinale', 'Halbfinale', 'Finale'][c.r] : '8 Teams, K.-o.-Runden';
  }

  // ---------- Schaufenster-Figuren im Menü ----------
  let scMode = 'lineup', scT = 0;
  function showcaseMode(m) { scMode = m; Object.values(showcase).forEach(c => { c.group.visible = m !== 'off'; c.blob.visible = m !== 'off'; }); if (m === 'duo') updateShowcase(); }
  function updateShowcase() {
    if (scMode !== 'duo') return;
    Object.entries(showcase).forEach(([id, c]) => { const v = id === sel.home || (id === sel.away && sel.mode !== 'cup' && sel.mode !== 'training'); c.group.visible = v; c.blob.visible = v; });
  }
  function menuScene(dt) {
    scT += dt;
    const cam = world.camera;
    if (scMode === 'lineup') {
      FK.TEAMS.forEach((t, i) => { const c = showcase[t.id]; c.pose({ x: (i - 3.5) * 1.55 + 1.5, z: -Math.abs(i - 3.5) * 0.3, face: 0.25 * Math.sin(scT * 0.5 + i), speed: 0, state: i % 3 === 0 && (Math.floor(scT / 3) + i) % 4 === 0 ? 'celebrate' : 'run', t: 0, kick: 0 }, dt); });
      const a = Math.sin(scT * 0.12) * 0.35;
      cam.position.set(Math.sin(a) * 14 + 1.5, 1.7, Math.cos(a) * 14); cam.lookAt(1.5, -0.6, 0);
    } else if (scMode === 'duo') {
      const h = showcase[sel.home], w = showcase[sel.away];
      if (h) h.pose({ x: -1.5, z: 0, face: 0.35, speed: 0, state: 'run', t: 0, kick: 0 }, dt);
      if (w && w.group.visible) w.pose({ x: 1.5, z: 0, face: -0.35, speed: 0, state: 'run', t: 0, kick: 0 }, dt);
      cam.position.set(Math.sin(scT * 0.2) * 0.8, 2.2, 7.5); cam.lookAt(0, 1.6, 0);
    }
    if (cam.fov !== 40) { cam.fov = 40; cam.updateProjectionMatrix(); }
  }

  // ---------- Spiel ----------
  function startMatch(cfg) {
    endMatch();
    matchCfg = cfg;
    showcaseMode('off');
    world.setArena(FK.arenaById(cfg.arena || S.arena));
    A.music(false); A.crowd(0.06);
    match = new FK.Match(world, { mode: cfg.mode, home: cfg.home, away: cfg.away, humans: cfg.humans, diff: S.diff, half: S.half, decide: cfg.decide,
      on: { banner, fade, end: onEnd } });
    match.camSnap = true;
    $('#crest0').style.background = crestBg(cfg.home); $('#crest1').style.background = crestBg(cfg.away);
    $('#sbName0').textContent = cfg.home.short; $('#sbName1').textContent = cfg.away.short;
    hudCache = {};
    show('hud');
    fade();
  }
  function endMatch() {
    if (match) { match.dispose(); match = null; }
    $('#banner').classList.remove('on');
  }
  function resume() { if (!match) return; match.paused = false; show('hud', true); IN.clearMenu(); }
  function pause() {
    if (!match || match.phase === 'end') return;
    match.paused = true;
    $('#pauseScore').textContent = `${match.teams[0].def.name} ${match.teams[0].score} : ${match.teams[1].score} ${match.teams[1].def.name} · ${match.minuteText()}`;
    $('#camBtn').textContent = 'Kamera: ' + SETS[2].fmt(S.cam);
    show('pause'); A.back();
  }
  $('#fsBtn').addEventListener('click', e => { e.stopPropagation(); toggleFs(); });
  $('#pauseBtn').addEventListener('click', e => { e.stopPropagation(); pause(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && match && screen === 'hud') pause(); });

  let bannerT = 0;
  function banner(text, sub, kind) {
    const b = $('#banner'); b.className = 'banner ' + kind; b.querySelector('b').textContent = text; b.querySelector('span').textContent = sub;
    b.querySelector('span').style.display = sub ? '' : 'none';
    void b.offsetWidth; b.classList.add('on');
    bannerT = kind === 'goal' ? 3.2 : kind === 'special' ? 1.8 : 1.6;
  }
  function fade() { const f = $('#fade'); f.classList.add('on'); requestAnimationFrame(() => requestAnimationFrame(() => f.classList.remove('on'))); if (match) match.camSnap = true; }

  function myTeam(cfg) {
    const t = new Set(cfg.humans.map(h => h.team));
    return t.size === 1 ? [...t][0] : -1;
  }
  function onEnd(res) {
    if (!match) return;
    const cfg = matchCfg, my = myTeam(cfg), s = FK.save;
    if (cfg.mode !== 'training') {
      s.games++;
      if (my >= 0) {
        s.goals += res.score[my];
        if (res.winner === my) s.wins++; else if (res.winner === -1) s.draws++; else s.losses++;
        s.best = Math.max(s.best, res.score[my] - res.score[1 - my]);
      }
    }
    if (cfg.cup) cupResult(res);
    FK.persist();
    renderResult(res, my);
    show('result');
  }
  function renderResult(res, my) {
    const cfg = matchCfg, t0 = cfg.home, t1 = cfg.away;
    const head = $('#resHead');
    let txt = 'ABPFIFF', cls = '';
    if (my >= 0) { if (res.winner === my) { txt = 'SIEG!'; cls = 'win'; } else if (res.winner === -1) txt = 'UNENTSCHIEDEN'; else { txt = 'NIEDERLAGE'; cls = 'lose'; } }
    if (cfg.cup && FK.save.cup && FK.save.cup.champion === FK.save.cup.team && FK.save.cup.over) { txt = '🏆 POKALSIEGER!'; cls = 'win'; }
    head.textContent = txt; head.className = 'res-head ' + cls;
    $('#resScore').innerHTML = `<div class="tn">${crest(t0)}${t0.name}</div><div><div class="big">${res.score[0]} : ${res.score[1]}</div>${res.pens ? `<span class="pn">${res.mode === 'penalties' ? 'Elfmeter' : 'i. E.'} ${res.pens[0]} : ${res.pens[1]}</span>` : ''}</div><div class="tn">${crest(t1)}${t1.name}</div>`;
    const sc = [0, 1].map(i => res.scorers.filter(x => x.team === i).map(x => `⚽ ${x.name} ${x.min}${x.own ? ' (ET)' : ''}`));
    let rows = ''; for (let i = 0; i < Math.max(sc[0].length, sc[1].length); i++) rows += `<div>${sc[0][i] || ''}</div><div>${sc[1][i] || ''}</div>`;
    $('#resScorers').innerHTML = rows;
    if (res.mode === 'penalties') $('#resStats').innerHTML = '';
    else {
      const a = res.stats[0], b = res.stats[1];
      const st = (name, x, y, fmt) => { const s = (x + y) || 1; return `<div class="st"><span>${fmt ? fmt(x) : x}</span><div class="two"><i style="width:${x / s * 100}%;background:${t0.kit.shirt}"></i><i style="width:${y / s * 100}%;background:${t1.kit.shirt}"></i><em>${name}</em></div><span>${fmt ? fmt(y) : y}</span></div>`; };
      $('#resStats').innerHTML = st('BALLBESITZ', a.poss, b.poss, v => v + '%') + st('SCHÜSSE', a.shots, b.shots) + st('AUFS TOR', a.onT, b.onT) + st('PÄSSE', a.passes, b.passes) + st('ANGEKOMMEN', a.passOk, b.passOk) + st('ZWEIKÄMPFE', a.tackles, b.tackles);
    }
    const acts = cfg.cup ? '<button class="mbtn nav" data-act="toCup">Weiter zum Pokal</button><button class="mbtn nav" data-act="menu">Hauptmenü</button>'
      : '<button class="mbtn nav" data-act="again">Revanche</button><button class="mbtn nav" data-act="menu">Hauptmenü</button>';
    $('#resActions').innerHTML = acts;
  }

  // ---------- Pokal ----------
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function newCup(team) {
    const ids = shuffle(FK.TEAMS.map(t => t.id));
    FK.save.cup = { team, r: 0, over: false, champion: null, rounds: [[[ids[0], ids[1]], [ids[2], ids[3]], [ids[4], ids[5]], [ids[6], ids[7]]], [], []], res: [[], [], []] };
    FK.persist();
  }
  function poisson(l) { let L = Math.exp(-l), k = 0, p = 1; do { k++; p *= Math.random(); } while (p > L); return k - 1; }
  function simGame(a, b) {
    const ra = FK.rating(FK.teamById(a)), rb = FK.rating(FK.teamById(b));
    const x = poisson(Math.max(0.3, 1.35 + (ra - rb) / 22)), y = poisson(Math.max(0.3, 1.35 + (rb - ra) / 22));
    let pens = null; if (x === y) { const pa = 3 + Math.floor(Math.random() * 3); pens = Math.random() < 0.5 + (ra - rb) / 60 ? [pa, pa - 1] : [pa - 1, pa]; }
    return [x, y, pens];
  }
  const winnerOf = (pair, r) => (r[0] > r[1] || (r[0] === r[1] && r[2] && r[2][0] > r[2][1])) ? pair[0] : pair[1];
  function cupAdvance(c) {
    // alle offenen Spiele der aktuellen Runde (außer dem eigenen, wenn noch dabei) simulieren
    for (;;) {
      const round = c.rounds[c.r];
      round.forEach((pair, i) => { if (!c.res[c.r][i]) c.res[c.r][i] = simGame(pair[0], pair[1]); });
      const winners = round.map((p, i) => winnerOf(p, c.res[c.r][i]));
      if (c.r === 2) { c.champion = winners[0]; c.over = true; if (c.champion === c.team) FK.save.cups++; return; }
      c.rounds[c.r + 1] = []; for (let i = 0; i < winners.length; i += 2) c.rounds[c.r + 1].push([winners[i], winners[i + 1]]);
      c.r++;
      if (!c.alive) continue; // ausgeschieden: bis zum Ende simulieren
      return;
    }
  }
  function cupResult(res) {
    const c = FK.save.cup; if (!c) return;
    const i = c.rounds[c.r].findIndex(p => p.includes(c.team));
    const pair = c.rounds[c.r][i];
    c.res[c.r][i] = [res.score[0], res.score[1], res.pens];
    if (pair[0] !== matchCfg.home.id) c.res[c.r][i] = [res.score[1], res.score[0], res.pens ? [res.pens[1], res.pens[0]] : null];
    c.alive = winnerOf(pair, c.res[c.r][i]) === c.team;
    cupAdvance(c);
  }
  function openCup() {
    const c = FK.save.cup; if (!c) { openSelect('cup'); return; }
    if (c.alive === undefined) c.alive = true;
    const names = ['VIERTELFINALE', 'HALBFINALE', 'FINALE'];
    let html = '';
    for (let r = 0; r < 3; r++) {
      html += `<div class="round"><h4>${names[r]}</h4>`;
      const round = c.rounds[r] || [];
      const cnt = [4, 2, 1][r];
      for (let i = 0; i < cnt; i++) {
        const p = round[i], res = c.res[r][i];
        if (!p) { html += '<div class="mt"><div class="l">–</div><div class="l">–</div></div>'; continue; }
        const w = res ? winnerOf(p, res) : null;
        const line = (id, k) => `<div class="${w ? (w === id ? 'w' : 'l') : ''} ${id === c.team ? 'you' : ''}"><span>${FK.teamById(id).icon} ${FK.teamById(id).name}</span><span>${res ? res[k] + (res[2] ? ' (' + res[2][k] + ')' : '') : ''}</span></div>`;
        html += `<div class="mt ${p.includes(c.team) ? 'me' : ''}">${line(p[0], 0)}${line(p[1], 1)}</div>`;
      }
      html += '</div>';
    }
    html += `<div class="round"><h4>POKALSIEGER</h4><div class="champion">🏆<b>${c.champion ? FK.teamById(c.champion).name : '?'}</b></div></div>`;
    $('#bracket').innerHTML = html;
    const play = $('#cupPlay');
    if (c.over || !c.alive) { play.textContent = c.champion === c.team ? 'NEUER POKAL' : 'NEUER VERSUCH'; play.dataset.act = 'cupNew'; }
    else { const p = c.rounds[c.r].find(x => x.includes(c.team)); play.textContent = `${['VIERTELFINALE', 'HALBFINALE', 'FINALE'][c.r]}: ${FK.teamById(p[0]).short} – ${FK.teamById(p[1]).short}`; play.dataset.act = 'cupPlay'; }
    $('#cupQuit').style.display = c.over || !c.alive ? 'none' : '';
    FK.persist();
    show('cup'); setFocus(play);
  }
  function cupPlay() {
    const c = FK.save.cup;
    if (!c || c.over || !c.alive) { FK.save.cup = null; FK.persist(); openSelect('cup'); return; }
    const p = c.rounds[c.r].find(x => x.includes(c.team));
    const devs = humansFromSel().filter(h => h.team === 0);
    const humans = (devs.length ? devs : [{ dev: IN.lastType === 'pad' && IN.devices()[1] ? IN.devices()[1].id : 'kb', team: 0 }]).map(h => ({ dev: h.dev, team: p[0] === c.team ? 0 : 1 }));
    startMatch({ mode: 'match', home: FK.teamById(p[0]), away: FK.teamById(p[1]), humans, decide: true, cup: true });
  }

  // ---------- HUD ----------
  let hudCache = {}, radarT = 0;
  const setT = (id, v) => { if (hudCache[id] !== v) { hudCache[id] = v; const e = document.getElementById(id); if (e) e.textContent = v; } };
  function hud(dt) {
    const m = match;
    setT('sbS0', String(m.teams[0].score)); setT('sbS1', String(m.teams[1].score));
    setT('sbClock', m.minuteText());
    setT('sbHalf', m.mode === 'training' ? 'FREI' : m.phase === 'shootout' || m.mode === 'penalties' ? 'i. E.' : m.half + '. HZ');
    m.teams.forEach((t, i) => {
      const el = document.getElementById('pw' + i), full = t.power >= 100;
      const w = Math.round(t.power);
      if (hudCache['pw' + i] !== w) { hudCache['pw' + i] = w; el.querySelector('i').style.width = w + '%'; el.classList.toggle('full', full); el.querySelector('span').textContent = full ? '★ ' + t.def.special.name : t.def.special.name; }
      el.style.display = m.mode === 'penalties' || (m.mode === 'training' && i === 1) ? 'none' : '';
    });
    // Elfmeter-Anzeige
    const pr = $('#pensRow');
    if (m.so) {
      pr.classList.add('on');
      const key = JSON.stringify(m.so.kicks);
      if (hudCache.pens !== key) {
        hudCache.pens = key;
        pr.innerHTML = m.so.kicks.map((k, i) => { let d = ''; const n = Math.max(5, k.length); for (let j = 0; j < n; j++) d += `<i class="${k[j] === true ? 'g' : k[j] === false ? 'm' : ''}"></i>`; return `<div><span style="width:34px">${m.teams[i].def.short}</span>${d}</div>`; }).join('');
      }
    } else pr.classList.remove('on');
    // Spielerkarten
    const cards = m.humans.filter(h => h.player).map(h => `<div class="pc" style="--hc:${h.color}"><span class="num">${h.player.num}</span><div><div class="nm">${h.player.name}</div><div class="stam"><i style="width:${Math.round(h.player.stamina * 100)}%"></i></div></div></div>`).join('');
    if (hudCache.cards !== cards) { hudCache.cards = cards; $('#playerCards').innerHTML = cards; }
    // Schusskraft
    let ch = -1;
    m.humans.forEach(h => { if (h.charge >= 0) ch = Math.max(ch, h.charge); });
    if (m.so && m.so.charge >= 0 && m.so.step === 'aim') ch = m.so.charge;
    const sb = $('#shotBar'); sb.classList.toggle('on', ch >= 0); if (ch >= 0) sb.firstElementChild.style.width = Math.min(100, ch / 0.9 * 100) + '%';
    // Hinweise
    let hint = '';
    if (m.so && m.so.step === 'aim') {
      const pad = IN.lastType === 'pad', tch = IN.lastType === 'touch';
      if (m.so.hShoot) hint = tch ? 'Stick zielt · SCHUSS halten und loslassen' : pad ? 'Stick zielt · B halten und loslassen' : 'Pfeile zielen · J halten und loslassen';
      else if (m.so.hKeep) hint = 'Du hältst! Stick nach links/rechts = Sprung in die Ecke';
    } else if (m.phase === 'setpiece' && m.setPiece && m.setPiece.taker.human) {
      hint = IN.lastType === 'pad' ? 'A Pass · X Flanke · B Schuss' : IN.lastType === 'touch' ? 'PASS, FLANKE oder SCHUSS' : 'K Pass · I Flanke · J Schuss';
    }
    const he = $('#hint'); if (hudCache.hint !== hint) { hudCache.hint = hint; he.textContent = hint; he.classList.toggle('on', !!hint); }
    // Touch-Tasten je nach Lage
    const kbH = m.humans.find(h => h.dev === 'kb');
    if (kbH && IN.lastType === 'touch') {
      const p = kbH.player, def = p && m.ball.owner && m.ball.owner.ti !== p.ti;
      const lab = def ? ['GRÄTSCHE', 'TACKLING', 'WECHSEL', 'DRUCK'] : ['SCHUSS', 'PASS', 'STEIL', 'FLANKE'];
      setT('tbB', lab[0]); setT('tbA', lab[1]); setT('tbY', lab[2]); setT('tbX', lab[3]);
      const ready = m.teams[kbH.team].power >= 100;
      if (hudCache.star !== ready) { hudCache.star = ready; $('#tbRB').classList.toggle('ready', ready); }
    }
    // Banner
    if (bannerT > 0) { bannerT -= dt; if (bannerT <= 0) $('#banner').classList.remove('on'); }
    // Radar
    const rc = $('#radar'); rc.style.display = S.radar && !m.so ? '' : 'none';
    radarT -= dt;
    if (S.radar && !m.so && radarT <= 0) { radarT = 0.07; drawRadar(rc, m); }
  }
  function drawRadar(c, m) {
    const g = c.getContext('2d'), w = c.width, h = c.height, P = FK.P;
    g.clearRect(0, 0, w, h);
    g.fillStyle = 'rgba(8,30,18,.72)'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 1;
    const sx = (w - 8) / P.L, sz = (h - 8) / P.W, X = x => 4 + (x + P.L / 2) * sx, Z = z => 4 + (z + P.W / 2) * sz;
    g.strokeRect(4, 4, w - 8, h - 8); g.beginPath(); g.moveTo(w / 2, 4); g.lineTo(w / 2, h - 4); g.stroke();
    g.beginPath(); g.arc(w / 2, h / 2, 9.15 * sx, 0, Math.PI * 2); g.stroke();
    g.strokeRect(4, Z(-P.BOX_W / 2), P.BOX_D * sx, P.BOX_W * sz); g.strokeRect(w - 4 - P.BOX_D * sx, Z(-P.BOX_W / 2), P.BOX_D * sx, P.BOX_W * sz);
    m.players.forEach(p => {
      g.fillStyle = p.team.def.kit.shirt; g.beginPath(); g.arc(X(p.pos.x), Z(p.pos.z), p.human ? 4 : 3, 0, Math.PI * 2); g.fill();
      if (p.human) { g.strokeStyle = p.human.color; g.lineWidth = 2; g.stroke(); }
    });
    g.fillStyle = '#fff'; g.beginPath(); g.arc(X(m.ball.pos.x), Z(m.ball.pos.z), 2.5, 0, Math.PI * 2); g.fill();
  }

  // ---------- Hauptschleife ----------
  function frame(now) {
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000)); last = now;
    IN.poll();
    if (match && screen === 'hud') {
      let p = false;
      IN.devices().forEach(d => { if (IN.pressed(d.id, 'start')) p = true; });
      IN.clearMenu();
      if (p) pause();
      else { match.update(dt); hud(dt); }
    } else {
      handleMenu();
      if (match) match.update(dt); else menuScene(dt);
    }
    world.update(dt);
    world.render();
    requestAnimationFrame(frame);
  }

  // ---------- Laden ----------
  const wait = () => new Promise(r => requestAnimationFrame(() => setTimeout(r, 0)));
  async function boot() {
    let tip = Math.floor(Math.random() * FK.TIPS.length);
    const setTip = () => { $('#bootTip').textContent = FK.TIPS[tip++ % FK.TIPS.length]; };
    setTip(); const tipTimer = setInterval(setTip, 3500);
    const prog = (p, t) => { $('#loadBar').style.width = p + '%'; if (t) $('#loadText').textContent = t; };
    const t0 = performance.now();
    await wait();
    try {
      prog(8, 'Grafik wird gestartet …'); await wait();
      world = new FK.World($('#gl'));
      world.setQuality(S.gfx);
      prog(30, 'Stadion wird aufgebaut …'); await wait();
      world.setArena(FK.arenaById(S.arena));
      prog(45, 'Die Fabel-Teams laufen ein …'); await wait();
      const ts = FK.TEAMS;
      for (let i = 0; i < ts.length; i++) { showcase[ts[i].id] = world.makeChar(ts[i]); showcase[ts[i].id].setShadows(world.quality === 'hoch'); prog(45 + (i + 1) * 5, 'Die Fabel-Teams laufen ein: ' + ts[i].name); await wait(); }
      prog(88, 'Rasen wird gemäht …'); await wait();
      menuScene(0.016); world.renderer.compile(world.scene, world.camera); world.render();
      prog(100, 'Bereit!');
    } catch (e) {
      clearInterval(tipTimer);
      prog(100, '3D-Grafik wird auf diesem Gerät leider nicht unterstützt.');
      console.error(e); return;
    }
    const rest = 1400 - (performance.now() - t0); if (rest > 0) await new Promise(r => setTimeout(r, rest));
    clearInterval(tipTimer);
    IN.bindTouch($('#hud'));
    show('press');
    FK.onAnyInput = () => { if (screen === 'press') { IN.clearMenu(); goMenu(); } };
    requestAnimationFrame(t => { last = t; frame(t); });
  }
  FK.UI = { get match() { return match; }, get screen() { return screen; }, act, startMatch, sel, get world() { return world; } };
  boot();
})();
