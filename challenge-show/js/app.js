/* Die große Challenge-Show – Ablauf: Laden, Titel, Konsolen-Menü, Kandidat (Name/Farbe/Hut), Show-Einstellungen, Show mit
 * Rundenkarte → Countdown → Runde → Auswertung → … → Siegerehrung, Zuschauen nach dem Ausscheiden (Jubel-Emojis, Vorspulen),
 * Online & Handys über ../cloud/fire-peer.js: der Gastgeber rechnet die Show, Handys/Freunde senden nur Eingaben und sehen die Show
 * (im Fernseher-Modus zeigen Handys nur den Controller). Eingaben: Tastatur/Maus, Touch, Gamepad. Speichern: challenge-show-*. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id), P_ = 'challenge-show-', C = CSCore, V = CSView, VO = CSVoice, S = CSSound;
  const LS = { get(k, d) { try { const v = localStorage.getItem(P_ + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(P_ + k, JSON.stringify(v)); } catch (e) { } } };
  const SET = Object.assign({ sound: true, music: true, voice: true, subs: true, vib: true, name: '', col: 0, hat: 1, n: 16, diff: 'normal', len: 'voll' }, LS.get('settings', {}));
  const ST = Object.assign({ shows: 0, wins: 0, best: 0, rounds: 0, pts: 0, bestPlace: 0 }, LS.get('stats', {}));
  const saveSet = () => LS.set('settings', SET);
  const saveSt = () => { LS.set('stats', ST); if (ST.pts > (LS.get('highscore', 0) || 0)) LS.set('highscore', ST.pts); };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const coarse = () => matchMedia('(pointer: coarse)').matches;
  const sfx = n => { if (SET.sound && S.sfx[n]) S.sfx[n](); };
  const vib = ms => { if (SET.vib && navigator.vibrate) try { navigator.vibrate(ms); } catch (e) { } };
  const pick = a => a[Math.floor(Math.random() * a.length)];
  let toastT = 0; function toast(m, ms) { const t = $('toast'); t.textContent = m; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, ms || 2600); }
  VO.on = SET.voice; S.setVol('sfx', SET.sound ? .8 : 0);
  let subT = 0; VO.onSub = text => { if (!SET.subs || cur !== 'sGame') return; const e = $('hSub'); e.textContent = '🎤 ' + text; e.hidden = false; e.classList.remove('pop'); void e.offsetWidth; e.classList.add('pop'); clearTimeout(subT); subT = setTimeout(() => { e.hidden = true; }, 3200); };
  const HATS = ['🧢 Kappe', '🥳 Partyhut', '🎀 Schleife', '🧶 Mütze', '📡 Antenne', '🎩 Zylinder'];
  const ICON = { ampel: '🚦', bruecke: '🌉', seil: '🪢', keks: '🍪', stuhl: '🪑', finale: '👑' };
  const RULE = {
    ampel: 'Lauf bei 🟢 Grün los. Bei 🔴 Rot sofort stehen bleiben – wer sich bewegt, ist raus! Erreiche das Ziel, bevor die Zeit abläuft.',
    bruecke: 'Spring Reihe für Reihe nach links oder rechts. Nur eine Pudding-Platte pro Reihe hält! Grün leuchtende Platten sind schon bekannt.',
    seil: 'Zwei Teams ziehen am Seil. Tippe, wenn der Zeiger im grünen Feld ist – das zieht doppelt so stark! Das Verlierer-Team scheidet aus.',
    keks: 'Fahre die Form auf dem Keks nach – immer der Linie entlang, vom Start-Stern aus. Weichst du ab, bekommt der Keks Risse!',
    stuhl: 'Lauf herum, solange die Musik spielt. Stoppt sie, schnapp dir schnell einen Stuhl – es gibt zu wenige! Mehrere Durchgänge.',
    finale: 'Schubs die anderen mit dem Sprint-Stoß von der Plattform. Die Plattform schrumpft! Wer als Letzter steht, holt die Krone.',
  };
  const CTRL = {
    ampel: ['WASD/Pfeile laufen', 'Joystick links', 'Linker Stick'], bruecke: ['← / → oder A / D', 'Tasten LINKS / RECHTS', 'Steuerkreuz ← → oder LB / RB'],
    seil: ['Leertaste im Takt', 'Taste ZIEH!', 'A im Takt'], keks: ['Maus gedrückt halten und nachfahren', 'Mit dem Finger nachfahren', 'Linker Stick + A halten'],
    stuhl: ['WASD/Pfeile laufen', 'Joystick links', 'Linker Stick'], finale: ['WASD laufen, Leertaste schubsen', 'Joystick + SCHUBS', 'Stick + A schubsen'],
  };
  const DIFFN = { leicht: '🧸 Leicht', normal: '🙂 Normal', schwer: '🔥 Schwer' };

  /* ---------- Bildschirme & Navigation (wie in Brainrot Parkour) ---------- */
  let cur = 'sLoad';
  function scr(id) { document.querySelectorAll('.scr').forEach(s => s.classList.toggle('on', s.id === id)); cur = id; document.body.dataset.scr = id; setTimeout(focusFirst, 0); }
  const overlays = () => Array.from(document.querySelectorAll('.ov')).filter(o => !o.hidden);
  const root = () => overlays().pop() || $(cur);
  const navEls = () => Array.from(root().querySelectorAll('.nav')).filter(e => !e.disabled && e.offsetParent !== null);
  function focusFirst() { if (coarse() || (cur === 'sGame' && !overlays().length)) return; const els = navEls(), el = els.find(e => e.classList.contains('pri') || e.classList.contains('hero') || e.classList.contains('on')) || els[0]; if (el) try { el.focus({ preventScroll: true }); } catch (e) { } }
  function openOv(id) { $(id).hidden = false; setTimeout(focusFirst, 0); }
  function closeOv(id) { $(id).hidden = true; setTimeout(focusFirst, 0); }
  function moveFocus(dx, dy) {
    const els = navEls(); if (!els.length) return; const a = document.activeElement;
    if (!els.includes(a)) { els[0].focus(); sfx('nav'); return; }
    const r = a.getBoundingClientRect(), ax = r.left + r.width / 2, ay = r.top + r.height / 2; let best = null, bd = 1e9;
    for (const e of els) { if (e === a) continue; const q = e.getBoundingClientRect(), x = q.left + q.width / 2 - ax, y = q.top + q.height / 2 - ay, al = x * dx + y * dy; if (al <= 4) continue; const d = al + (Math.abs(x * dy) + Math.abs(y * dx)) * 2.2; if (d < bd) { bd = d; best = e; } }
    if (best) { best.focus(); sfx('nav'); if (best.scrollIntoView) best.scrollIntoView({ block: 'nearest' }); }
  }
  const BACK = { sMenu: () => scr('sTitle'), sCand: () => toMenu(), sSetup: () => toMenu(), sHelp: () => toMenu(), sHall: () => toMenu(), sLobby: () => { netClose(); toMenu(); }, sResult: () => { const b = $('rsBtns').querySelector('.pri'); if (b) b.click(); } };
  function back() { const ov = overlays().pop(); if (ov) { if (ov.id === 'ovPause') return resume(); return closeOv(ov.id); } if (cur === 'sGame') return pause(); sfx('back'); if (BACK[cur]) BACK[cur](); }
  function seg(el, opts, val, cb) { el.innerHTML = opts.map(o => `<button class="sg nav${String(o.v) === String(val) ? ' on' : ''}" data-v="${o.v}">${o.n}</button>`).join(''); el.querySelectorAll('button').forEach(b => b.onclick = () => { el.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); sfx('nav'); cb(isNaN(+b.dataset.v) ? b.dataset.v : +b.dataset.v); }); }

  /* ---------- Menü ---------- */
  function menuStat() { $('menuStat').innerHTML = `<span>👑 ${ST.wins}</span><span>🎬 ${ST.shows}</span><span>⭐ ${ST.pts}</span>`; $('mCand').innerHTML = candHtml({ name: SET.name || 'Du', col: C.COLS[SET.col], hat: SET.hat, num: 1 }); }
  function candHtml(c) { return `<span class="cand" style="--cc:${c.col}"><i>${HATS[c.hat].split(' ')[0]}</i><b>${esc(c.name)}</b></span>`; }
  function toMenu() { endGame(); netClose(); document.querySelectorAll('.ov').forEach(o => { o.hidden = true; }); menuStat(); V.menuStage(); scr('sMenu'); S.music(SET.music, 'show'); }
  document.querySelectorAll('#mList .mi').forEach(b => {
    b.onfocus = b.onmouseenter = () => { $('mInfo').textContent = b.dataset.i; };
    b.onclick = () => { sfx('ok'); const g = b.dataset.go; if (g === 'show') setupScreen(); else if (g === 'online') openOv('ovOnline'); else if (g === 'cand') candScreen(); else if (g === 'hall') hallScreen(); else if (g === 'opts') openOv('ovOpts'); else if (g === 'help') scr('sHelp'); };
  });
  $('mInfo').textContent = $('mList').firstElementChild.dataset.i; $('helpBack').onclick = () => toMenu();

  /* ---------- Einstellungen ---------- */
  const OPT = { oSound: 'sound', oMusic: 'music', oVoice: 'voice', oSubs: 'subs', oVib: 'vib' };
  for (const id in OPT) { const el = $(id); el.checked = !!SET[OPT[id]]; el.onchange = () => { SET[OPT[id]] = el.checked; saveSet(); S.setVol('sfx', SET.sound ? .8 : 0); VO.on = SET.voice; if (id === 'oMusic') S.music(SET.music, 'show'); }; }
  $('optX').onclick = () => closeOv('ovOpts');

  /* ---------- Kandidat ---------- */
  function candScreen() {
    scr('sCand'); $('cName').value = SET.name;
    $('cCols').innerHTML = C.COLS.map((c, i) => `<button class="sw nav${i === SET.col ? ' on' : ''}" data-i="${i}" style="--cc:${c}" aria-label="Farbe ${i + 1}"></button>`).join('');
    $('cCols').querySelectorAll('.sw').forEach(b => b.onclick = () => { SET.col = +b.dataset.i; saveSet(); $('cCols').querySelectorAll('.sw').forEach(x => x.classList.toggle('on', x === b)); sfx('nav'); prev(); });
    seg($('cHats'), HATS.map((n, i) => ({ v: i, n })), SET.hat, v => { SET.hat = v; saveSet(); prev(); }); prev();
    function prev() { $('cPrev').innerHTML = candHtml({ name: $('cName').value.trim() || 'Du', col: C.COLS[SET.col], hat: SET.hat }); }
    $('cName').oninput = prev;
  }
  $('cOk').onclick = () => { SET.name = $('cName').value.trim().slice(0, 12); saveSet(); sfx('ok'); toMenu(); }; $('cBack').onclick = () => toMenu();

  /* ---------- Ruhmeshalle ---------- */
  function hallScreen() { scr('sHall'); $('hallBody').innerHTML = [['👑 Siege', ST.wins], ['🎬 Shows', ST.shows], ['🏅 Beste Platzierung', ST.bestPlace ? ST.bestPlace + '.' : '–'], ['🎯 Überstandene Runden', ST.rounds], ['⭐ Punkte-Rekord', ST.pts]].map(([a, b]) => `<div class="rsl"><span>${a}</span><b>${b}</b></div>`).join(''); }
  $('hallBack').onclick = () => toMenu();

  /* ---------- Show-Einstellungen (Solo) ---------- */
  function setupScreen() {
    scr('sSetup');
    seg($('suN'), [12, 16, 24].map(v => ({ v, n: v + ' Kandidaten' })), SET.n, v => { SET.n = v; saveSet(); });
    seg($('suDiff'), Object.keys(DIFFN).map(v => ({ v, n: DIFFN[v] })), SET.diff, v => { SET.diff = v; saveSet(); });
    seg($('suLen'), [{ v: 'voll', n: '🎬 Alle 6 Runden' }, { v: 'kurz', n: '⚡ Kurze Show (4)' }], SET.len, v => { SET.len = v; saveSet(); });
  }
  $('suBack').onclick = () => toMenu(); $('suGo').onclick = () => { sfx('ok'); startSolo(); };
  function order(len, r) { if (len !== 'kurz') return C.ROUNDS.slice(); const a = C.ROUNDS.slice(0, 5).sort(() => r() - .5).slice(0, 3); return C.ROUNDS.filter(x => a.includes(x)).concat('finale'); }

  /* ---------- Show ---------- */
  let G = null; // { mode: solo|host|guest, S, meId, phase, pt, speed, tv, ... }
  const me = () => (G && G.meId !== null && G.S) ? G.S.cons[G.meId] : null;
  function startSolo(opt) {
    const r = C.rng((Math.random() * 1e9) | 0), S0 = C.newShow([{ name: SET.name || 'Du', col: C.COLS[SET.col], human: true, pid: 'me' }], { n: SET.n, diff: SET.diff, order: (opt && opt.order) || order(SET.len, r) });
    S0.cons[0].hat = SET.hat; if (opt && opt.auto) S0.cons[0].auto = true; beginShow('solo', S0, 0);
  }
  function beginShow(mode, S0, meId, extra) {
    endGame(); V.menuOff(); V.clearBeans(); V.camReset();
    G = Object.assign({ mode, S: S0, meId, phase: 'card', pt: 0, speed: 1, IN: {}, ctl: {}, evSeen: 0, rk: 0, outShown: false, stats: false }, extra || {});
    scr('sGame'); $('hEmo').innerHTML = ''; ST.shows++; saveSt(); A.taps = A.good = A.dash = 0; G.voice = VO.on; if (G.tv) VO.on = false;
    if (mode !== 'guest') { C.nextRound(G.S); newRound(true); }
    S.music(SET.music, 'show'); return G;
  }
  function newRound(first) {
    const g = G, Sx = g.S; V.setArena(Sx.round, Sx); V.camReset(); g.phase = 'card'; g.pt = first ? 6.5 : 5; g.kp = null; g.kt = { prog: 0, crack: 0 }; g.cursor = { x: 0, y: -.6, down: false };
    const k = Sx.order.indexOf(Sx.round) + 1, tot = Sx.order.length;
    $('cdIcon').textContent = ICON[Sx.round]; $('cdNum').textContent = Sx.round === 'finale' ? 'FINALE' : `Runde ${k} von ${tot}`; $('cdName').textContent = C.NAMES[Sx.round]; $('cdRule').textContent = RULE[Sx.round];
    const dev = A.pad ? 2 : (coarse() || A.touch) ? 1 : 0; $('cdCtrl').textContent = '🎮 ' + CTRL[Sx.round][dev]; $('cdAlive').textContent = `🙂 ${C.alive(Sx).length} Kandidaten im Spiel`;
    $('card').hidden = false; $('card').classList.remove('pop'); void $('card').offsetWidth; $('card').classList.add('pop'); sfx('fanfare'); V.hype(.8);
    VO.say((first ? VO.line('hello') + ' ' : '') + VO.line(Sx.round), true); A.taps = A.good = A.dash = 0; A.pick = null; A.pickT = 0;
    buildCtl(); hud();
  }
  function endGame() { if (!G) return; if (G.tv) VO.on = SET.voice; G = null; V.clearBeans(); $('tpad').hidden = true; $('hSub').hidden = true; $('card').hidden = true; $('spect').hidden = true; $('ctl').innerHTML = ''; $('ctl').className = ''; VO.stop(); CSTouch.reset(); document.body.classList.remove('padOnly'); }

  /* ---------- Eingaben ---------- */
  const A = { touch: false, keys: {}, pad: null, taps: 0, good: 0, dash: 0, pickT: 0, pick: null };
  const TS = { x: 0, y: 0, a: 0, cdx: 0, cdy: 0 };
  addEventListener('keydown', e => {
    A.keys[e.code] = true; if (e.code !== 'Tab') document.body.classList.add('kbd');
    if (e.code === 'Escape') { e.preventDefault(); back(); return; }
    if (e.target && e.target.tagName === 'INPUT') { if (e.code === 'Enter' && cur === 'sLobby') $('jGo').click(); return; }
    if (cur === 'sGame' && !overlays().length) { if (['Space', 'Enter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault(); if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); if (!e.repeat) gameKey(e.code); return; }
    if (cur === 'sTitle' && !overlays().length && !e.repeat) { e.preventDefault(); pressStart(); return; }
    const d = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[e.code]; if (d) { e.preventDefault(); moveFocus(d[0], d[1]); }
  });
  addEventListener('keyup', e => { A.keys[e.code] = false; });
  addEventListener('blur', () => { A.keys = {}; });
  addEventListener('pointerdown', e => { document.body.classList.remove('kbd'); if (e.pointerType === 'touch' && !A.touch) { A.touch = true; if (G) buildCtl(); } }, true);
  function gameKey(code) {
    if (!G || G.phase === 'card' && code === 'Enter') { if (G && G.mode !== 'guest' && G.pt > 1.2) G.pt = 1.2; return; }
    if (code === 'Space' || code === 'Enter') action();
    if (code === 'ArrowLeft' || code === 'KeyA') pickSide('L'); if (code === 'ArrowRight' || code === 'KeyD') pickSide('R');
  }
  // eine „Aktion“: Seil = ziehen, Finale = schubsen (Keks = gedrückt halten, siehe keksInput)
  function action() { const g = G; if (!g || g.phase !== 'play') return; const m = me(); if (!m || !m.alive) return;
    if (g.S.round === 'seil') { A.taps++; const ok = inZone(); if (ok) { A.good++; sfx('good'); V.hype(.3); } else sfx('tap'); flashMeter(ok); vib(ok ? 15 : 6); }
    if (g.S.round === 'finale') { A.dash++; sfx('dash'); vib(25); } }
  function pickSide(s) { const g = G; if (!g || g.phase !== 'play' || g.S.round !== 'bruecke') return; const m = me(); if (!m || !m.alive || g.S.R.cur !== m.id || g.S.R.jump) return; A.pick = s; A.pickT = .45; sfx('jump'); }
  const inZone = () => { const b = G.S.R.beat; return b > .4 && b < .62; };
  function readPad() { let gp = null; try { gp = Array.from(navigator.getGamepads ? navigator.getGamepads() : []).find(p => p && p.connected); } catch (e) { } return gp; }
  let padPrevG = {};
  function moveInput() {
    const k = A.keys; let ix = 0, iy = 0;
    if (k.KeyA || k.ArrowLeft) ix -= 1; if (k.KeyD || k.ArrowRight) ix += 1; if (k.KeyW || k.ArrowUp) iy += 1; if (k.KeyS || k.ArrowDown) iy -= 1;
    if (TS.x || TS.y) { ix += TS.x; iy -= TS.y; }
    const gp = readPad(); if (gp) { const ax = gp.axes || [], dz = v => Math.abs(v) > .18 ? v : 0; ix += dz(ax[0] || 0); iy -= dz(ax[1] || 0); }
    const l = Math.hypot(ix, iy); if (l > 1) { ix /= l; iy /= l; }
    const y = V.camYaw, sy = Math.sin(y), cy = Math.cos(y); return { mx: sy * iy - cy * ix, mz: cy * iy + sy * ix, ix, iy };
  }
  function padGame() { const gp = readPad(); if (!gp) { padPrevG = {}; return; } const b = gp.buttons || [], pr = n => !!(b[n] && (b[n].pressed || b[n].value > .5)); const now = { a: pr(0), l: pr(14) || pr(4), r: pr(15) || pr(5), st: pr(9) }, edge = x => now[x] && !padPrevG[x];
    if (edge('a')) { if (G.phase === 'card' && G.mode !== 'guest' && G.pt > 1.2) G.pt = 1.2; else action(); } if (edge('l')) pickSide('L'); if (edge('r')) pickSide('R'); if (edge('st')) pause(); A.padA = now.a; padPrevG = now; }
  let padPrev = {}, padDir = null, padT = 0;
  function menuPad(dt) {
    const gp = readPad(); A.pad = !!gp; if (!gp) return; const b = gp.buttons || [], ax = gp.axes || [], pr = n => !!(b[n] && (b[n].pressed || b[n].value > .5));
    const now = { a: pr(0), b: pr(1), st: pr(9) }, edge = k => now[k] && !padPrev[k];
    if (cur === 'sGame' && !overlays().length) { padPrev = now; return; }
    let x = Math.abs(ax[0] || 0) > .5 ? Math.sign(ax[0]) : 0, z = Math.abs(ax[1] || 0) > .5 ? Math.sign(ax[1]) : 0; if (pr(14)) x = -1; if (pr(15)) x = 1; if (pr(12)) z = -1; if (pr(13)) z = 1;
    if (x || z || Object.values(now).some(Boolean)) document.body.classList.add('kbd');
    const key = x || z ? (Math.abs(x) >= Math.abs(z) ? x + ',0' : '0,' + z) : null;
    if (key && (key !== padDir || padT <= 0)) { const [dx, dy] = key.split(',').map(Number); moveFocus(dx, dy); padT = key !== padDir ? .3 : .12; } padDir = key; padT -= dt;
    if (edge('a')) { if (cur === 'sTitle' && !overlays().length) pressStart(); else { const a = document.activeElement; if (a && a !== document.body && a.click && !a.disabled) a.click(); else focusFirst(); } }
    if (edge('b')) back(); if (edge('st') && cur === 'sTitle') pressStart(); if (edge('st') && !$('ovPause').hidden) resume();
    padPrev = now;
  }
  // Eingabe des eigenen Kandidaten für die laufende Runde
  function myInput(dt) {
    const g = G, m = me(); if (!m || !m.alive || g.phase !== 'play') return {}; const rd = g.S.round, mv = moveInput(), o = {};
    if (rd === 'ampel' || rd === 'stuhl' || rd === 'finale') { o.mx = mv.mx; o.mz = mv.mz; }
    if (rd === 'finale') o.dash = A.dash;
    if (rd === 'seil') { o.taps = A.taps; o.good = A.good; }
    if (rd === 'bruecke') { if (A.pickT > 0) { A.pickT -= dt; o.pick = A.pick; } else A.pick = null; }
    if (rd === 'keks') { keksInput(dt, mv); o.kp = { prog: g.kt.prog, crack: g.kt.crack }; }
    return o;
  }

  /* ---------- Steuerelemente je Runde ---------- */
  function buildCtl() {
    const g = G; if (!g) return; const rd = g.S.round, el = $('ctl'), touch = coarse() || A.touch, m = me(); el.className = 'r-' + rd; el.innerHTML = '';
    const joy = touch && m && m.alive && (rd === 'ampel' || rd === 'stuhl' || rd === 'finale');
    $('tpad').hidden = !joy; $('tpad').classList.toggle('nobtn', rd !== 'finale');
    if (!$('tpad').dataset.ok) { CSTouch.build($('tpad'), TS, [['a', 'SCHUBS', 0, .55, '💥']]); $('tpad').dataset.ok = 1; }
    if (!m || !m.alive) return;
    if (rd === 'bruecke') { el.innerHTML = '<p class="cMsg" id="brMsg"></p><div class="brBtns"><button class="bigBtn" id="brL">◀ LINKS</button><button class="bigBtn" id="brR">RECHTS ▶</button></div>'; $('brL').onpointerdown = e => { e.preventDefault(); pickSide('L'); }; $('brR').onpointerdown = e => { e.preventDefault(); pickSide('R'); }; }
    if (rd === 'seil') { el.innerHTML = '<div class="meter"><i class="zone"></i><b id="mPtr"></b></div><button class="bigBtn pull" id="pull">💪 ZIEH!</button><p class="cMsg" id="tugMsg"></p>'; $('pull').onpointerdown = e => { e.preventDefault(); action(); }; }
    if (rd === 'keks') { el.innerHTML = '<div class="kWrap"><canvas id="kc" width="360" height="360"></canvas><div class="kBar"><i id="kProg"></i></div><p class="cMsg" id="kMsg">Start beim ⭐ – fahre die Linie nach!</p></div>'; keksCanvas(); }
  }
  function flashMeter(ok) { const p = $('mPtr'); if (!p) return; p.classList.remove('hitG', 'hitB'); void p.offsetWidth; p.classList.add(ok ? 'hitG' : 'hitB'); }
  // Keks: Zeichenfeld (Maus/Finger), Gamepad/Tastatur bewegen einen Cursor
  function keksCanvas() {
    const cv = $('kc'); const pt = e => { const r = cv.getBoundingClientRect(); return { x: ((e.clientX - r.left) / r.width * 2 - 1) / .9, y: ((e.clientY - r.top) / r.height * 2 - 1) / .9 }; };
    cv.onpointerdown = e => { e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (x) { } const p = pt(e); Object.assign(G.cursor, p, { down: true, mouse: true }); };
    cv.onpointermove = e => { if (!G || !G.cursor.mouse) return; const p = pt(e); G.cursor.x = p.x; G.cursor.y = p.y; };
    cv.onpointerup = cv.onpointercancel = () => { if (G) { G.cursor.down = false; G.cursor.mouse = false; } };
  }
  function keksInput(dt, mv) {
    const g = G, c = g.cursor, m = me(); if (!m || m.kDone) return;
    if (!c.mouse) { const sp = 1.1; c.x = Math.max(-1, Math.min(1, c.x + mv.ix * sp * dt)); c.y = Math.max(-1, Math.min(1, c.y - mv.iy * sp * dt)); c.down = !!(A.keys.Space || A.keys.Enter || A.padA); }
    const sh = { shape: m.shape, prog: g.kt.prog, crack: g.kt.crack }, p0 = sh.prog; C.traceStep(sh, { tol: g.S.R.tol }, { xy: [c.x, c.y], down: c.down }); g.kt.prog = sh.prog; g.kt.crack = Math.min(1, sh.crack);
    if (sh.prog > p0) { if (Math.random() < .5) sfx('trace'); } if (sh.crack > (g.kLastCr || 0) + .08) { g.kLastCr = sh.crack; sfx('crack'); vib(30); }
  }
  function drawKeks() {
    const cv = $('kc'), g = G, m = me(); if (!cv || !m) return; const x = cv.getContext('2d'), w = cv.width, s = w / 2 * .9, X = v => w / 2 + v * s;
    const pts = C.SHAPES[m.shape].pts, pr = Math.max(g.kt.prog, m.prog || 0), cr = Math.max(g.kt.crack, m.crack || 0);
    x.clearRect(0, 0, w, w); x.fillStyle = '#e8b45a'; x.beginPath(); x.arc(w / 2, w / 2, w / 2 - 4, 0, 7); x.fill(); x.fillStyle = 'rgba(150,80,20,.22)'; for (let i = 0; i < 30; i++) { const a = i * 2.4, r = (i * 37 % 100) / 100 * (w / 2 - 20); x.beginPath(); x.arc(w / 2 + Math.cos(a) * r, w / 2 + Math.sin(a) * r, 3, 0, 7); x.fill(); }
    x.lineCap = x.lineJoin = 'round'; x.strokeStyle = '#8a4a14'; x.lineWidth = Math.max(10, g.S.R.tol * s * 1.2); x.globalAlpha = .45; x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(X(p[0]), X(p[1])) : x.moveTo(X(p[0]), X(p[1]))); x.stroke(); x.globalAlpha = 1;
    x.strokeStyle = '#ffe680'; x.lineWidth = 7; x.beginPath(); for (let i = 0; i <= Math.min(pts.length - 1, Math.floor(pr)); i++) { const p = pts[i]; i ? x.lineTo(X(p[0]), X(p[1])) : x.moveTo(X(p[0]), X(p[1])); } x.stroke();
    const nx = pts[Math.min(pts.length - 1, Math.floor(pr) + 2)]; x.fillStyle = '#ff3aa8'; x.beginPath(); x.arc(X(nx[0]), X(nx[1]), 7 + Math.sin(performance.now() / 120) * 2, 0, 7); x.fill();
    if (pr < 1) { x.font = '28px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('⭐', X(pts[0][0]), X(pts[0][1])); }
    if (cr > 0) { x.strokeStyle = '#5a2a0a'; x.lineWidth = 3; let r = 3; for (let i = 0; i < Math.floor(cr * 14); i++) { r = (r * 16807) % 2147483647; const a = r / 2147483647 * 7, l = 30 + (i % 4) * 22; x.beginPath(); x.moveTo(w / 2 + Math.cos(a) * (w / 2 - 4), w / 2 + Math.sin(a) * (w / 2 - 4)); x.lineTo(w / 2 + Math.cos(a + .2) * (w / 2 - l), w / 2 + Math.sin(a + .3) * (w / 2 - l)); x.stroke(); } }
    const c = g.cursor; x.strokeStyle = c.down ? '#ffffff' : 'rgba(255,255,255,.6)'; x.lineWidth = 3; x.beginPath(); x.arc(X(c.x), X(c.y), c.down ? 9 : 12, 0, 7); x.stroke();
    $('kProg').style.width = Math.min(100, pr / (pts.length - 1) * 100) + '%'; $('kProg').classList.toggle('bad', cr > .5);
    $('kMsg').textContent = m.kDone ? '✅ Geschafft! Warte auf die anderen …' : cr > .6 ? '⚠️ Vorsicht, der Keks bricht gleich!' : pr < 1 ? 'Start beim ⭐ – fahre die Linie nach!' : 'Weiter so – folge dem pinken Punkt!';
  }

  /* ---------- Spielschleife ---------- */
  function step(dt) {
    const g = G; if (!g) return; const Sx = g.S;
    if (g.mode === 'guest') return guestStep(dt);
    g.pt -= dt;
    if (g.phase === 'card') { if (g.pt <= 0) { $('card').hidden = true; g.phase = 'count'; g.pt = 3; g.cn = 4; } }
    else if (g.phase === 'count') { const n = Math.ceil(g.pt); if (n !== g.cn && n > 0) { g.cn = n; big(String(n)); sfx('tick'); } if (g.pt <= 0) { g.phase = 'play'; big('LOS!'); sfx('go'); if (Sx.round === 'stuhl') S.music(SET.music, 'chairs'); } }
    else if (g.phase === 'play') {
      g.IN = g.remote || {}; if (g.meId !== null) g.IN[g.meId] = myInput(dt);
      const end = C.step(Sx, dt, g.IN); events(Sx.ev.splice(0)); if (end) { g.phase = 'end'; g.pt = 4.2; roundEnd(); }
      if (Sx.round === 'ampel' && Sx.R.time < 10 && !g.hurry) { g.hurry = 1; VO.ann('hurry'); }
    }
    else if (g.phase === 'end') { Sx.t += dt; if (g.pt <= 0) { g.hurry = 0; if (C.nextRound(Sx)) { events(Sx.ev.splice(0)); newRound(false); S.music(SET.music, 'show'); } else { events(Sx.ev.splice(0)); g.phase = 'podium'; g.pt = 7; podium(); } } }
    else if (g.phase === 'podium') { if (g.pt <= 0 && !g.resShown) { g.resShown = true; result(); } }
    if (Sx.done && Sx.winner && Math.random() < dt * 6) V.rain(Sx.winner.x, Sx.winner.z, 6);
    if (G === g && g.mode === 'host') netTick(dt);
  }
  function events(list) {
    const g = G; if (!g) return; const mid = g.meId; if (g.mode === 'host' && list.length) (g.evOut = g.evOut || []).push(...list.slice(0, 40));
    for (const e of list) {
      if (e.t === 'out') { const c = g.S.cons[e.id]; sfx('out'); if (e.id === mid) { vib([80, 50, 80]); big('💥 RAUS!', 1600); VO.ann('meOut', true); setTimeout(() => { if (G) buildCtl(); }, 400); } else if (c.human || Math.random() < .25) VO.ann('out'); feed(`💥 ${c.name} (${String(c.num).padStart(3, '0')}) ist raus`); V.hype(.6); }
      else if (e.t === 'safe') { if (e.id === mid) { sfx('safe'); big('✅ SICHER!'); VO.ann('safe', true); vib(40); } }
      else if (e.t === 'green') { sfx('green'); VO.ann('green', true); light('green'); } else if (e.t === 'turn') { sfx('turn'); light('turn'); } else if (e.t === 'red') { sfx('red'); VO.ann('red', true); light('red'); vib(20); }
      else if (e.t === 'tile') { if (e.ok) { sfx('land'); if (Math.random() < .4) VO.ann('tileOk'); } else { sfx('splash'); VO.ann('tileBad', true); } }
      else if (e.t === 'crack') { sfx('crack'); if (e.id === mid || Math.random() < .3) VO.ann('crack'); }
      else if (e.t === 'stop') { S.music(false); sfx('red'); VO.ann('stop', true); big('🪑 STÜHLE!'); } else if (e.t === 'music') { if (g.phase === 'play') { S.music(SET.music, 'chairs'); VO.ann('music'); } }
      else if (e.t === 'sit') { if (e.id === mid) { sfx('sit'); big('🪑 SITZT!'); vib(30); } else if (Math.random() < .4) sfx('sit'); }
      else if (e.t === 'dash') { if (e.id !== mid && Math.random() < .3) sfx('dash'); } else if (e.t === 'bump') { sfx('bump'); if (e.id === mid) vib(50); } else if (e.t === 'fall') sfx('fall');
      else if (e.t === 'tugwin') { sfx('cheer'); V.hype(1); } else if (e.t === 'bye') { if (e.id === mid) toast('🍀 Ungerade Zahl – du hast ein Freilos und bist sicher!', 3500); }
    }
  }
  let lightT = 0; function light(k) { const e = $('light'); e.className = 'l-' + k; e.hidden = false; e.textContent = k === 'green' ? '🟢 GRÜNES LICHT' : k === 'red' ? '🔴 ROTES LICHT' : '🟡 ACHTUNG …'; clearTimeout(lightT); }
  function feed(t) { const f = $('hFeed'), d = document.createElement('div'); d.textContent = t; f.prepend(d); while (f.children.length > 4) f.lastChild.remove(); setTimeout(() => d.remove(), 4500); }
  function roundEnd() {
    const g = G, Sx = g.S, outs = Sx.cons.filter(c => c.outRound === Sx.k), m = me();
    if (m && m.alive) { ST.rounds++; saveSt(); }
    S.music(false); sfx('cheer'); VO.ann('roundEnd'); $('light').hidden = true;
    $('reTitle').textContent = `${ICON[Sx.round]} ${C.NAMES[Sx.round]} – vorbei!`; $('reBody').innerHTML = `<p><b>${outs.length}</b> ausgeschieden · <b>${C.alive(Sx).length}</b> weiter · 💰 Topf: <b>${Sx.pot}</b></p>` + (m ? `<p class="${m.alive ? 'okT' : 'badT'}">${m.alive ? '✅ Du bist weiter!' : '💥 Du bist ausgeschieden.'}</p>` : '');
    $('rEnd').hidden = false; setTimeout(() => { if ($('rEnd')) $('rEnd').hidden = true; }, 3800);
  }
  function podium() { const Sx = G.S, w = Sx.winner; V.setScreen('👑 ' + (w ? w.name : '')); sfx('win'); V.hype(1); const m = me();
    if (w && m && w.id === m.id) VO.ann('youWin', true); else VO.ann('winner', true, w ? w.name : ''); big('👑 ' + (w ? w.name : ''), 3500);
    if (G.mode !== 'guest') { const m2 = me(); if (m2) { const place = m2.alive ? 1 : m2.place; const pts = place === 1 ? Sx.pot : Math.max(0, Sx.cons.length - place) * 20 + (m2.outRound + 1) * 50; G.res = { place, pts }; } } }
  function result() {
    const g = G, Sx = g.S, m = me(), list = Sx.cons.slice().sort((a, b) => (a.place || 99) - (b.place || 99));
    let place = m ? (m.alive ? 1 : m.place) : 0; const pts = g.res ? g.res.pts : (place === 1 ? Sx.pot : Math.max(0, Sx.cons.length - place) * 20);
    if (m) { if (place === 1) ST.wins++; if (!ST.bestPlace || place < ST.bestPlace) ST.bestPlace = place; if (pts > ST.pts) ST.pts = pts; saveSt(); }
    const mode = g.mode; endGame(); V.menuStage();
    $('rsT').textContent = !m ? '👑 Die Show ist vorbei!' : place === 1 ? '👑 Du bist der Champion!' : `🎬 Platz ${place} von ${Sx.cons.length}`;
    $('rsBody').innerHTML = (m ? `<div class="bigNum">⭐ ${pts}</div><p class="hint">Punkte-Rekord: ${ST.pts} · Siege: ${ST.wins}</p>` : '') + '<div class="rank">' + list.slice(0, 8).map((c, i) => `<div class="rsl${m && c.id === m.id ? ' me' : ''}"><span>${i === 0 ? '👑' : i + 1 + '.'} <i class="dot" style="background:${c.col}"></i> ${esc(c.name)} <small>#${String(c.num).padStart(3, '0')}</small></span><b>${c.alive || i === 0 ? 'Sieger' : C.NAMES[Sx.order[c.outRound]] || ''}</b></div>`).join('') + '</div>';
    const btns = mode === 'solo' ? [['rsMenu', '☰ Menü'], ['rsAgain', '↻ Neue Show', true]] : mode === 'host' ? [['rsMenu', '☰ Menü'], ['rsLobby', '↻ Zur Lobby', true]] : [['rsMenu', '☰ Menü'], ['rsWait', '⏳ Auf nächste Show warten', true]];
    $('rsBtns').innerHTML = btns.map(([id, t, pri]) => `<button class="btn nav${pri ? ' pri big' : ''}" id="${id}">${t}</button>`).join(''); scr('sResult');
    $('rsMenu').onclick = () => toMenu(); if ($('rsAgain')) $('rsAgain').onclick = () => startSolo(); if ($('rsLobby')) $('rsLobby').onclick = () => lobbyBack(); if ($('rsWait')) $('rsWait').onclick = () => lobbyBack();
  }
  let bigT = 0; function big(t, ms) { const e = $('big'); e.textContent = t; e.hidden = false; e.classList.remove('pop'); void e.offsetWidth; e.classList.add('pop'); clearTimeout(bigT); bigT = setTimeout(() => { e.hidden = true; }, ms || 1100); }
  const fmtT = t => { t = Math.max(0, Math.ceil(t)); return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0'); };
  function hud() {
    const g = G; if (!g) return; const Sx = g.S, Rr = Sx.R, m = me(); if (!Rr) return;
    const k = Sx.order.indexOf(Sx.round) + 1; $('hRound').textContent = `${ICON[Sx.round]} ${Sx.round === 'finale' ? 'Finale' : k + '/' + Sx.order.length} ${C.NAMES[Sx.round]}`;
    $('hAlive').textContent = `🙂 ${C.alive(Sx).length}/${Sx.cons.length}`; $('hPot').textContent = `💰 ${Sx.pot}`;
    const tl = Sx.round === 'stuhl' ? (Rr.phase === 'music' ? '🎵' : '🪑 ' + fmtT(Rr.grab - Rr.gt)) : Sx.round === 'finale' ? '⏱ ' + fmtT(Rr.time) : '⏳ ' + fmtT(Rr.time); $('hTime').textContent = tl; $('hTime').classList.toggle('warn', Sx.round !== 'finale' && Rr.time !== undefined && Rr.time < 10 && Sx.round !== 'stuhl');
    $('hMe').innerHTML = m ? `<i class="dot" style="background:${m.col}"></i> ${esc(m.name)} #${String(m.num).padStart(3, '0')} ${m.out ? '💥' : m.safe ? '✅' : ''}` : '📺 Zuschauer';
    if (Sx.round !== 'ampel') $('light').hidden = true; else if (g.phase === 'play') light(Rr.light);
    // Runden-Hinweise
    if (Sx.round === 'bruecke' && $('brMsg')) { const my = m && Rr.cur === m.id, q = m ? Rr.queue.indexOf(m.id) : -1; $('brMsg').textContent = !m || !m.alive ? '' : m.safe ? '✅ Du bist drüben!' : my ? (Rr.jump ? '🦘 …' : `👉 Du bist dran! Reihe ${m.row + 2}/${Rr.rows}: links oder rechts?`) : `⏳ Noch ${q + 1} vor dir`; $('ctl').classList.toggle('myTurn', !!(my && !Rr.jump && Rr.known[(m.row | 0) + 1] === undefined)); }
    if (Sx.round === 'seil' && $('mPtr')) { const b = g.mode === 'guest' ? g.beat : Rr.beat; $('mPtr').style.left = (b * 100) + '%'; const team = m ? (Rr.A.includes(m.id) ? 0 : Rr.B.includes(m.id) ? 1 : -1) : -1; const lead = Rr.p < -.05 ? 0 : Rr.p > .05 ? 1 : -1; $('tugMsg').textContent = team < 0 ? '🍀 Freilos – du schaust zu' : lead < 0 ? '⚖️ Gleichstand – zieh!' : lead === team ? '💪 Dein Team führt!' : '😬 Dein Team verliert – schneller!'; }
    if (Sx.round === 'keks') drawKeks();
    const out = m && m.out, spect = out || (m && m.safe && g.phase === 'play' && g.mode === 'solo'); $('spect').hidden = !spect || g.phase === 'podium';
    if (spect) { $('spMsg').textContent = !m ? '📺 Fernseher-Modus' : out ? '💥 Du bist ausgeschieden – feuere die anderen an!' : '✅ Sicher! Warte auf die anderen …'; $('spFast').hidden = g.mode !== 'solo'; $('spSkip').hidden = !(g.mode === 'solo' && out); $('spFast').textContent = g.speed > 1 ? '▶ Normal' : '⏩ Schneller'; }
  }
  $('spFast').onclick = () => { if (G) G.speed = G.speed > 1 ? 1 : 4; hud(); };
  $('spSkip').onclick = () => { if (!G || G.mode !== 'solo') return; VO.stop(); const prev = VO.on; VO.on = false; for (let i = 0; i < 60 * 900 && G && !G.resShown; i++) step(1 / 30); VO.on = prev; };
  document.querySelectorAll('#spEmo button').forEach(b => b.onclick = () => emote(b.textContent, true));
  function emote(e, mine) { const d = document.createElement('span'); d.textContent = e; d.style.left = (10 + Math.random() * 80) + '%'; $('hEmo').appendChild(d); setTimeout(() => d.remove(), 2400); sfx('clap'); V.hype(.5); if (mine && G && G.mode !== 'solo' && NET) netSend({ t: 'emo', e }); }

  /* ---------- Pause ---------- */
  function pause() { if (!G || G.paused) return; G.paused = G.mode === 'solo'; openOv('ovPause'); }
  function resume() { if (!G) return; closeOv('ovPause'); G.paused = false; }
  $('bPause').onclick = () => pause(); $('paGo').onclick = () => resume(); $('paOpt').onclick = () => openOv('ovOpts');
  $('paQuit').onclick = () => { const m = G && G.mode; document.querySelectorAll('.ov').forEach(o => { o.hidden = true; }); if (m === 'host') { endGame(); lobbyBack(); } else toMenu(); };

  /* ---------- Online & Handys (PeerJS-kompatibel über ../cloud/fire-peer.js) ---------- */
  function mkNet(cb) {
    const ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789', PRE = 'challenge-show-';
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
  const netErr = e => ({ nocode: 'Diese Show gibt es nicht (mehr). Stimmt der Code?', timeout: 'Keine Verbindung – bitte nochmal versuchen.', code: 'Bitte den 4-stelligen Code eingeben.' }[e && e.message] || 'Online ist gerade nicht erreichbar. Prüfe das Internet und versuche es nochmal.');
  let NET = null; const L = { players: [], play: true, n: 16, diff: 'normal', len: 'voll' };
  function netClose() { if (NET) NET.close(); NET = null; L.players = []; }
  const netSend = m => { if (NET) NET.send(m); };
  $('onX').onclick = () => closeOv('ovOnline'); $('onHost').onclick = () => { closeOv('ovOnline'); hostLobby(); }; $('onJoin').onclick = () => { closeOv('ovOnline'); joinScreen(''); };
  function lobbyDraw() {
    const html = L.players.filter(p => !p.host || L.play).map(p => `<div class="seat">${candHtml(p)}${p.host ? '<small>🏠</small>' : ''}</div>`).join('') || '<p class="hint">Noch niemand da …</p>';
    $('lobbyList').innerHTML = html; $('joinList').innerHTML = html; const humans = L.players.filter(p => !p.host || L.play).length; $('lbGo').disabled = humans < 1 || (!L.play && L.players.length < 2);
    $('lbCount').textContent = `${humans} Mitspieler · Computer füllen auf ${L.n}`;
  }
  function hostLobby() {
    netClose(); scr('sLobby'); $('lbHost').hidden = false; $('lbJoin').hidden = true; $('code').textContent = '····'; $('url').textContent = ''; $('qr').textContent = '…'; $('lobbyMsg').textContent = 'Die Show wird vorbereitet …';
    L.players = [{ id: 'host', name: SET.name || 'Gastgeber', col: C.COLS[SET.col], hat: SET.hat, host: true }]; L.n = SET.n; L.diff = SET.diff; L.len = SET.len;
    seg($('lbPlay'), [{ v: 1, n: '🙋 Ich spiele mit' }, { v: 0, n: '📺 Nur Fernseher' }], L.play ? 1 : 0, v => { L.play = !!v; lobbyDraw(); });
    seg($('lbN'), [12, 16, 24].map(v => ({ v, n: String(v) })), L.n, v => { L.n = v; lobbyDraw(); }); seg($('lbDiff'), Object.keys(DIFFN).map(v => ({ v, n: DIFFN[v] })), L.diff, v => { L.diff = v; }); seg($('lbLen'), [{ v: 'voll', n: '🎬 6 Runden' }, { v: 'kurz', n: '⚡ 4 Runden' }], L.len, v => { L.len = v; });
    lobbyDraw();
    NET = mkNet({ onMsg: hostMsg, onLeave: id => { const p = L.players.find(x => x.id === id); if (!p) return; L.players = L.players.filter(x => x !== p); if (G && G.remote) { const c = G.S.cons.find(c => c.pid === id); if (c) { c.human = false; c.auto = false; c.skill = 1; } } lobbyDraw(); NET.send({ t: 'lob', players: L.players }); toast('📴 ' + p.name + ' ist weg'); } });
    NET.host().then(async code => { $('code').textContent = code; $('url').textContent = NET.link(); $('lobbyMsg').textContent = 'Freunde & Handys: QR-Code scannen oder Code eingeben – von überall!'; try { await NET.loadQR(); const q = qrcode(0, 'M'); q.addData(NET.link()); q.make(); $('qr').innerHTML = q.createSvgTag({ cellSize: 4, margin: 0, scalable: true }); } catch (e) { $('qr').textContent = code; } }).catch(e => { $('lobbyMsg').textContent = netErr(e); });
  }
  function hostMsg(id, m) {
    if (m.t === 'hi') { if (L.players.length >= 13) return NET.sendTo(id, { t: 'full', msg: 'Die Show ist voll (12 Mitspieler).' }); if (G) return NET.sendTo(id, { t: 'full', msg: 'Die Show läuft schon – bei der nächsten bist du dabei!' }); const old = L.players.find(p => p.id === id); if (!old) L.players.push({ id, name: String(m.name || 'Gast').slice(0, 12), col: C.COLS.includes(m.col) ? m.col : C.COLS[L.players.length % 12], hat: (m.hat | 0) % 6 }); lobbyDraw(); NET.send({ t: 'lob', players: L.players }); toast('🌐 ' + m.name + ' ist dabei!'); sfx('ok'); return; }
    if (m.t === 'in' && G && G.remote) { const c = G.S.cons.find(c => c.pid === id); if (c) G.remote[c.id] = m.i || {}; return; }
    if (m.t === 'emo') { emote(String(m.e).slice(0, 4)); NET.send({ t: 'emo', e: m.e }); }
  }
  $('lbCopy').onclick = () => { if (!NET || !NET.code) return; const u = NET.link(); try { navigator.clipboard.writeText(u).then(() => toast('🔗 Link kopiert')); } catch (e) { toast(u); } };
  $('lbBack').onclick = () => { netClose(); toMenu(); };
  $('lbGo').onclick = () => { if (!NET) return; const r = C.rng((Math.random() * 1e9) | 0), list = L.players.filter(p => !p.host || L.play), S0 = C.newShow(list.map(p => ({ name: p.name, col: p.col, human: true, pid: p.id })), { n: Math.max(L.n, list.length + 1), diff: L.diff, order: order(L.len, r) });
    list.forEach((p, i) => { S0.cons[i].hat = p.hat; }); const meId = L.play ? 0 : null;
    NET.send({ t: 'show', tv: !L.play, cons: S0.cons.map(c => ({ id: c.id, num: c.num, name: c.name, human: c.human, pid: c.pid, col: c.col, hat: c.hat })), order: S0.order });
    beginShow('host', S0, meId, { remote: {}, sendT: 0 }); if (!L.play) { $('spect').hidden = false; }
  };
  function joinScreen(code) { netClose(); scr('sLobby'); $('lbHost').hidden = true; $('lbJoin').hidden = false; $('jName').value = SET.name || ''; $('jCode').value = code || ''; $('jMsg').textContent = 'Gib den Code der Show ein.'; $('joinList').innerHTML = ''; }
  $('jBack').onclick = () => { netClose(); toMenu(); };
  $('jGo').onclick = async () => {
    const code = $('jCode').value.trim(), name = $('jName').value.trim().slice(0, 12) || 'Gast'; SET.name = name; saveSet(); $('jMsg').textContent = 'Verbinde …'; $('jGo').disabled = true; S.ctx();
    NET = mkNet({ onMsg: guestMsg, onLeave: () => { toast('📴 Verbindung zum Gastgeber verloren'); toMenu(); } });
    try { await NET.join(code); NET.send({ t: 'hi', name, col: C.COLS[SET.col], hat: SET.hat }); $('jMsg').textContent = '✅ Verbunden! Warte auf den Start der Show …'; } catch (e) { $('jMsg').textContent = netErr(e); }
    $('jGo').disabled = false;
  };
  // Gast: Spiegel der Show (vom Gastgeber), eigene Eingaben gehen zurück
  function guestMsg(id, m) {
    if (m.t === 'full') { $('jMsg').textContent = m.msg; return; }
    if (m.t === 'lob') { L.players = m.players; lobbyDraw(); return; }
    if (m.t === 'show') { const myPid = NET.peer && NET.peer.id, cons = m.cons.map(c => Object.assign({ x: 0, y: 0, z: 0, yaw: 0, alive: true, out: false, outRound: -1, safe: false, seat: -1 }, c)), mi = cons.findIndex(c => c.pid === myPid);
      beginShow('guest', { cons, order: m.order, k: -1, round: null, R: null, t: 0, pot: 0, done: false, winner: null }, mi >= 0 ? mi : null, { tv: !!m.tv, sendT: 0, beat: 0, lastRound: null });
      document.body.classList.toggle('padOnly', !!m.tv); if (m.tv) V.setScreen(''); return; }
    if (m.t === 'st' && G && G.mode === 'guest') return mirror(m);
    if (m.t === 'emo') emote(String(m.e).slice(0, 4));
    if (m.t === 'lobby') { if (G) endGame(); scr('sLobby'); $('lbHost').hidden = true; $('lbJoin').hidden = false; $('jMsg').textContent = '⏳ Warte auf die nächste Show …'; }
  }
  function packR(Sx) { const R0 = Sx.R; if (!R0) return null; const o = {}; for (const k in R0) if (k !== 'good') o[k] = R0[k]; return o; }
  function netTick(dt) {
    const g = G; g.sendT -= dt; if (g.sendT > 0) return; g.sendT = .1; const Sx = g.S;
    const c = Sx.cons.map(c => [+c.x.toFixed(2), +c.y.toFixed(2), +c.z.toFixed(2), +(c.yaw || 0).toFixed(2), (c.alive ? 1 : 0) | (c.out ? 2 : 0) | (c.safe ? 4 : 0) | (c.falling ? 8 : 0) | (c.kDone ? 16 : 0), +(c.outT || 0).toFixed(2), c.outRound, c.seat === undefined ? -1 : c.seat, +(c.pw || 0).toFixed(2), +(c.prog || 0).toFixed(1), +(c.crack || 0).toFixed(2), c.shape || '', c.place || 0, c.row === undefined ? -1 : c.row]);
    NET.send({ t: 'st', k: Sx.k, round: Sx.round, ph: g.phase, pt: +g.pt.toFixed(2), tt: +Sx.t.toFixed(2), pot: Sx.pot, done: Sx.done, win: Sx.winner ? Sx.winner.id : -1, R: packR(Sx), c, ev: g.evOut || [] }); g.evOut = [];
  }
  function mirror(m) {
    const g = G, Sx = g.S; const newR = m.round !== Sx.round || m.k !== Sx.k;
    Sx.k = m.k; Sx.round = m.round; Sx.R = m.R; Sx.pot = m.pot; Sx.done = m.done; Sx.winner = m.win >= 0 ? Sx.cons[m.win] : null; Sx.t = m.tt; g.beat = m.R && m.R.beat !== undefined ? m.R.beat : 0;
    m.c.forEach((a, i) => { const c = Sx.cons[i]; if (!c) return; c.tx = a[0]; c.ty = a[1]; c.tz = a[2]; c.yaw = a[3]; c.alive = !!(a[4] & 1); c.out = !!(a[4] & 2); c.safe = !!(a[4] & 4); c.falling = !!(a[4] & 8); c.kDone = !!(a[4] & 16); c.outT = a[5]; c.outRound = a[6]; c.seat = a[7]; c.pw = a[8]; c.prog = a[9]; c.crack = a[10]; c.shape = a[11] || c.shape; c.place = a[12]; c.row = a[13]; if (c.x === 0 && c.z === 0 || newR) { c.x = c.tx; c.y = c.ty; c.z = c.tz; } });
    if (newR && m.round) { if (!g.tv) newRound(false); else { g.phase = 'card'; g.kt = { prog: 0, crack: 0 }; g.cursor = { x: 0, y: -.6, down: false }; A.taps = A.good = A.dash = 0; A.pick = null; buildCtl(); } if (g.tv) { $('card').hidden = true; } }
    if (m.ph !== g.phase) { const was = g.phase; g.phase = m.ph; if (m.ph === 'count') { $('card').hidden = true; } if (m.ph === 'play' && was !== 'play') { big('LOS!'); sfx('go'); if (Sx.round === 'stuhl') S.music(SET.music, 'chairs'); } if (m.ph === 'end') roundEnd(); if (m.ph === 'podium') podium(); }
    if (m.ph === 'count') { const n = Math.ceil(m.pt); if (n !== g.cn && n > 0) { g.cn = n; big(String(n)); sfx('tick'); } }
    if (m.ph === 'podium' && m.pt < .3 && !g.resShown) { g.resShown = true; result(); return; }
    events(m.ev || []);
  }
  function guestStep(dt) {
    const g = G, Sx = g.S; if (!Sx.round) return; Sx.t += dt;
    for (const c of Sx.cons) if (c.tx !== undefined) { const k = Math.min(1, dt * 12); c.x += (c.tx - c.x) * k; c.y += (c.ty - c.y) * k; c.z += (c.tz - c.z) * k; }
    if (Sx.R && Sx.R.beat !== undefined) g.beat = (g.beat + dt * 1.6) % 1;
    if (Sx.round === 'seil' && Sx.R) Sx.R.beat = g.beat;   // Takt lokal weiterlaufen lassen (für die eigene Bewertung)
    g.sendT -= dt; if (g.sendT <= 0 && g.meId !== null) { g.sendT = .066; netSend({ t: 'in', i: myInput(.066) }); } else if (g.meId !== null && Sx.round === 'keks') keksInput(dt, moveInput());
  }
  function lobbyBack() { if (NET && NET.role === 'host') { endGame(); NET.send({ t: 'lobby' }); scr('sLobby'); $('lbHost').hidden = false; $('lbJoin').hidden = true; lobbyDraw(); } else if (NET) { endGame(); scr('sLobby'); $('lbHost').hidden = true; $('lbJoin').hidden = false; $('jMsg').textContent = '⏳ Warte auf die nächste Show …'; } else toMenu(); }

  /* ---------- Hauptschleife ---------- */
  let last = performance.now(), slow = 0, fast = 0;
  const LOWFX = /[?&]lowfx/.test(location.search); let fno = 0;
  function frame(now) {
    if (LOWFX && (++fno % 4)) { last = now; requestAnimationFrame(frame); return; }   // Test-/Sparmodus: nur jedes 4. Bild
    const raw = (now - last) / 1000, dt = Math.min(.05, raw); last = now;
    if (G && !G.paused && raw < 1) { if (raw > .04) { slow += raw; fast = 0; } else { fast += raw; if (fast > 3) slow = 0; } if (slow > 2.5 && V.quality() > 0) { V.quality(V.quality() - 1); slow = 0; } }
    try {
      menuPad(dt);
      if (G) { if (cur === 'sGame' && !overlays().length) padGame(); if (!G.paused) { const n = G.speed || 1; for (let i = 0; i < n && G; i++) step(dt); } if (G) { if (!G.tv) V.sync(G.S, dt, G.meId); hud(); if (!G.tv) V.render(dt); } }
      else V.render(dt);
    } catch (e) { console.error(e); }
    requestAnimationFrame(frame);
  }
  addEventListener('resize', () => V.resize(innerWidth, innerHeight));
  addEventListener('gamepadconnected', () => { toast('🎮 Controller verbunden'); $('pressTxt').textContent = 'Drücke A'; });
  function pressStart() { S.ctx(); sfx('fanfare'); toMenu(); VO.ann('hello'); }
  $('bPress').onclick = pressStart; $('sTitle').addEventListener('click', e => { if (e.target.closest('a') || e.target.closest('#bPress')) return; if (cur === 'sTitle') pressStart(); });
  const TIPS = ['Scheinwerfer werden ausgerichtet …', 'Das Publikum nimmt Platz …', 'Pudding-Platten werden gewackelt …', 'Kekse werden gebacken …'];
  const bar = p => { $('loadBar').style.width = Math.round(p * 100) + '%'; $('loadTip').textContent = TIPS[Math.min(TIPS.length - 1, Math.floor(p * TIPS.length))]; };
  (async function boot() {
    const t0 = performance.now(); bar(.15); await new Promise(r => setTimeout(r, 30));
    try { V.init($('cv')); V.resize(innerWidth, innerHeight); if (/[?&]lowfx/.test(location.search)) V.quality(0); bar(.6); await new Promise(r => setTimeout(r, 30)); V.menuStage(); } catch (e) { console.error(e); toast('3D wird von diesem Gerät nicht unterstützt'); }
    bar(.9); requestAnimationFrame(frame);
    await new Promise(r => setTimeout(r, Math.max(0, 900 - (performance.now() - t0)))); bar(1);
    $('sLoad').classList.add('out'); setTimeout(() => { $('sLoad').classList.remove('on', 'out'); }, 460);
    const q = new URLSearchParams(location.search), jc = q.get('join');
    if (jc) { joinScreen(jc.toUpperCase()); return; } if (q.has('tv')) { L.play = false; hostLobby(); return; }
    scr('sTitle');
  })();
  // Test-Hilfe: Spielzeit simulieren (ohne Bildaufbau)
  function sim(sec) { for (let i = 0; i < sec * 30 && G && !G.paused; i++) step(1 / 30); }
  window.CSApp = { sim, refresh: () => newRound(false), get G() { return G; }, SET, ST, A, TS, L, C, startSolo, toMenu, action, pickSide };
})();
