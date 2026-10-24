/* Frequenz-Minen 3D – App: Ladebildschirm, Menü, Spiel, Game over, Rekorde, Ton, Radio, Steuerung (Maus, Touch, Tastatur, Controller).
 * Logik: js/core.js (FM), 3D: js/scene.js (FMScene). Controller: ../gamepad.js (Steuerkreuz = Pfeile, A = Enter, X = F, Y = H, LB/RB = −/+). */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const P = 'frequenzminen-';
  const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } } };
  const SET = Object.assign({ sound: true, vib: true, low: false, chord: true, station: '', diff: 'mittel' }, LS.get(P + 'settings', {}));
  const saveSet = () => LS.set(P + 'settings', SET);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let toastT = 0; function toast(m) { const t = $('toast'); t.textContent = m; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2400); }
  const vib = ms => { if (SET.vib && navigator.vibrate) try { navigator.vibrate(ms); } catch (e) { } };
  const isTouch = () => matchMedia('(pointer: coarse)').matches;
  function focusEl(el) { if (el && !isTouch()) try { el.focus({ preventScroll: true }); if (window.EasyGamesPad && EasyGamesPad.focus) EasyGamesPad.focus(el); } catch (e) { } }
  function scr(id) { document.querySelectorAll('.scr').forEach(s => { if (s.id !== 'sLoad') s.classList.toggle('on', s.id === id); }); }
  const anyOv = () => Array.from(document.querySelectorAll('.ov')).find(o => !o.hidden);

  /* ---------- Ton ---------- */
  let AC = null;
  function sfx(k, n) {
    if (!SET.sound) return;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); const t = AC.currentTime;
      const tone = (f, d, vol, type, f2, at) => { const o = AC.createOscillator(), g = AC.createGain(); at = at || 0; o.type = type || 'sine'; o.frequency.setValueAtTime(f, t + at); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + at + d); g.gain.setValueAtTime(.0001, t + at); g.gain.exponentialRampToValueAtTime(vol, t + at + .01); g.gain.exponentialRampToValueAtTime(.0001, t + at + d); o.connect(g); g.connect(AC.destination); o.start(t + at); o.stop(t + at + d + .02); };
      const noise = (d, f, vol, f2) => { const len = Math.floor(AC.sampleRate * d), b = AC.createBuffer(1, len, AC.sampleRate), dd = b.getChannelData(0); for (let i = 0; i < len; i++) dd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2); const s = AC.createBufferSource(), fl = AC.createBiquadFilter(), g = AC.createGain(); s.buffer = b; fl.type = 'lowpass'; fl.frequency.setValueAtTime(f, t); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + d); g.gain.value = vol; s.connect(fl); fl.connect(g); g.connect(AC.destination); s.start(t); };
      if (k === 'open') { if (n > 6) { noise(.35, 2400, .12, 500); tone(500, .25, .06, 'triangle', 1100); } else tone(720 + Math.random() * 120, .06, .07, 'triangle'); }
      else if (k === 'flag') tone(980, .09, .08, 'square', 1400);
      else if (k === 'unflag') tone(700, .08, .06, 'square', 420);
      else if (k === 'hint') { tone(1200, .25, .08, 'sine', 2400); tone(1800, .2, .05, 'sine', 0, .1); }
      else if (k === 'boom') { tone(140, .7, .25, 'sawtooth', 40); noise(1.1, 1800, .7, 120); }
      else if (k === 'win') [0, 2, 4, 7, 9, 12].forEach((i, j) => tone(523 * Math.pow(2, i / 12), .22, .1, 'triangle', 0, j * .09));
      else if (k === 'move') tone(600, .025, .03, 'square');
      else if (k === 'bad') tone(220, .08, .08, 'square');
    } catch (e) { }
  }

  /* ---------- Radio (laut.fm, wie Funk-Minigolf und Funkgalgen) ---------- */
  const STATIONS = [null, ['RicoReWi Radio', 'ricorewi'], ['YourTime-FM', 'yourtime-fm'], ['Rapradio 24', 'rapradio24'], ['Schlagerpop 24', 'schlagerpop24'], ['Chartradio 24', 'chartradio24'], ['Clubradio 24', 'clubradio24'], ['AnMaCha 24', 'anmacha24'],
    ['RadioFloh!', 'radiofloh'], ['Rockradio 24', 'rockradio24'], ['Christmasradio 24', 'christmasradio24'], ['Kultradio 24', 'kultradio24'], ['Zocker-FM', 'zockerfm'], ['Special-Radio', 'special-radio']];
  const RAD = { el: null, slug: '' };
  function radioSync(announce) {
    const st = STATIONS.find(x => x && x[1] === SET.station) || null;
    for (const b of [$('bRadio'), $('bRadioM'), $('pRadio')]) b.classList.toggle('on', !!st);
    $('bRadioM').textContent = '📻 ' + (st ? st[0] : 'Radio: aus');
    if (!st || document.hidden) { if (RAD.el && !RAD.el.paused) RAD.el.pause(); return; }
    if (!RAD.el) { RAD.el = new Audio(); RAD.el.preload = 'none'; RAD.el.volume = .5; RAD.el.addEventListener('error', () => { if (SET.station) toast('📻 Sender gerade nicht erreichbar'); }); }
    const changed = RAD.slug !== st[1]; if (changed) { RAD.slug = st[1]; RAD.el.src = 'https://stream.laut.fm/' + st[1]; }
    if (RAD.el.paused || changed) { const pr = RAD.el.play(); if (pr && pr.catch) pr.catch(() => { }); }
    if (announce) { toast('📻 ' + st[0] + ' live'); try { fetch('https://api.laut.fm/station/' + st[1] + '/current_song').then(r => r.ok ? r.json() : null).then(j => { if (j && j.title && RAD.slug === st[1] && SET.station) toast('📻 ' + st[0] + ': ' + (j.artist && j.artist.name ? j.artist.name + ' – ' : '') + j.title); }).catch(() => { }); } catch (e) { } }
  }
  let radioBack = null;
  function openRadio(back) {
    radioBack = back || null;
    const it = (v, img, label) => '<button class="rItem' + (SET.station === v ? ' on' : '') + '" data-v="' + v + '">' + img + '<span>' + label + '</span></button>';
    $('radioList').innerHTML = it('', '<i>🔇</i>', 'Aus') + STATIONS.map((x, k) => x ? it(x[1], '<img src="../anmacha-memory/logos/' + String(k).padStart(2, '0') + '.png" alt="" loading="lazy">', esc(x[0])) : '').join('');
    $('ovRadio').hidden = false; focusEl($('radioList').querySelector('.on') || $('radioX'));
  }
  $('radioList').onclick = e => { const b = e.target.closest('.rItem'); if (!b) return; SET.station = b.dataset.v; saveSet(); $('radioList').querySelectorAll('.rItem').forEach(x => x.classList.toggle('on', x === b)); radioSync(true); if (!SET.station) toast('📻 Radio aus'); };
  $('radioX').onclick = () => { $('ovRadio').hidden = true; if (radioBack) { radioBack.hidden = false; focusEl(radioBack.querySelector('.btn')); } else if (!inGame()) focusEl($('bPlay')); else resume(); };

  /* ---------- Spielzustand ---------- */
  const G = { mode: 'menu', diff: SET.diff, b: null, t0: 0, acc: 0, run: false, flagMode: false, cur: -1, kb: false, daily: null, over: false, timer: 0 };
  const inGame = () => $('sGame').classList.contains('on');
  const secs = () => (G.acc + (G.run ? (performance.now() - G.t0) / 1000 : 0));
  function hud() {
    const b = G.b; if (!b) return;
    $('hMines').textContent = b.m - b.flags; $('hTime').textContent = FM.fmt(secs()); $('hHints').textContent = b.hints;
    $('bHint').disabled = b.hints <= 0 || b.done;
  }
  function startTimer() { if (G.run) return; G.run = true; G.t0 = performance.now(); clearInterval(G.timer); G.timer = setInterval(hud, 250); }
  function stopTimer() { if (G.run) { G.acc += (performance.now() - G.t0) / 1000; G.run = false; } clearInterval(G.timer); }
  function insets() { const h = $('hud').getBoundingClientRect(), tl = $('tools').getBoundingClientRect(); FMScene.insets(h.bottom + 8, innerHeight - tl.top + 8); }

  function start(diff) {
    const daily = diff === 'daily'; G.diff = diff; G.mode = daily ? 'daily' : 'solo';
    let d = FM.DIFF[diff];
    if (daily) { G.daily = FM.daily(); G.b = G.daily.board; }
    else { let w = d.w, h = d.h; if (h > w && innerWidth > innerHeight * 1.15) [w, h] = [h, w]; G.b = FM.newBoard(w, h, d.m); }
    G.acc = 0; G.run = false; G.over = false; G.cur = -1; G.kb = false; setFlagMode(false);
    for (const o of document.querySelectorAll('.ov')) o.hidden = true;
    scr('sGame'); FMScene.setDemo(false); FMScene.pause(false); FMScene.setBoard(G.b); insets();
    $('hMode').textContent = daily ? '📅 Tagesrätsel' : '🎯 ' + d.n; $('hInfo').textContent = daily ? G.daily.key.split('-').reverse().join('.') : G.b.w + '×' + G.b.h + ' · ' + G.b.m + ' Störsender';
    $('ctrlHint').textContent = isTouch() ? 'Tippen = aufdecken · lange drücken = 🚩 Peiler' : 'Links aufdecken · Rechts 🚩 Peiler · Pfeile + Leertaste geht auch';
    $('ctrlHint').hidden = false;
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    if (daily) { const s = FM.dailyStart(G.b); setTimeout(() => act(s, 'open'), 450); }
    hud(); LS.set(P + 'last', diff);
  }
  function setFlagMode(on) { G.flagMode = !!on; $('bFlag').setAttribute('aria-pressed', G.flagMode ? 'true' : 'false'); }

  // Eine Aktion auf Feld i: 'open' (aufdecken bzw. Zahl antippen) oder 'flag'
  function act(i, kind) {
    const b = G.b; if (!b || b.done || i < 0 || anyOv()) return;
    $('ctrlHint').hidden = true;
    if (kind === 'flag') {
      if (b.st[i] === 1) { if (SET.chord) act(i, 'open'); return; }
      FM.flag(b, i); FMScene.setFlag(i, b.st[i] === 2); sfx(b.st[i] === 2 ? 'flag' : 'unflag'); vib(b.st[i] === 2 ? 25 : 10); hud(); return;
    }
    if (b.st[i] === 2) { sfx('bad'); toast('🚩 Erst den Peiler entfernen'); return; }
    let r;
    if (b.st[i] === 1) { if (!SET.chord) return; r = FM.chord(b, i); if (r.res === 'noop') { if (b.num[i]) { sfx('bad'); } return; } }
    else r = FM.reveal(b, i);
    startTimer();
    if (r.res === 'boom') {
      const boomAt = b.boom; FMScene.open(r.opened.filter(x => x !== boomAt), i); FMScene.open([boomAt], boomAt); FMScene.boom(boomAt); sfx('boom'); vib([120, 60, 220]); end(false); return;
    }
    FMScene.open(r.opened, i); sfx('open', r.opened.length); if (r.opened.length > 6) vib(18);
    if (r.res === 'win') { FMScene.win(); sfx('win'); vib([30, 40, 30, 40, 80]); end(true); }
    hud();
  }
  function useHint() {
    const b = G.b; if (!b || b.done || anyOv()) return;
    if (!b.placed) { toast('💡 Erst eine Platte aufdecken'); return; }
    const i = FM.hint(b); if (i < 0) { sfx('bad'); return; }
    FMScene.setFlag(i, false); G.acc += FM.HINT_SEC; sfx('hint'); toast('💡 Peilung: sichere Platte gefunden (+' + FM.HINT_SEC + ' s)');
    setCur(i, true); act(i, 'open'); hud();
  }

  /* ---------- Game over ---------- */
  function end(won) {
    stopTimer(); G.over = true; hud();
    const b = G.b, sec = Math.round(secs()), pts = FM.points(b, G.diff, sec), d = FM.DIFF[G.diff];
    // Rekorde
    const st = LS.get(P + 'stats', { played: 0, won: 0, streak: 0, best: 0 });
    st.played++; if (won) { st.won++; st.streak++; st.best = Math.max(st.best, st.streak); } else st.streak = 0; LS.set(P + 'stats', st);
    const hs = LS.get(P + 'highscore', 0), rec = pts > hs; if (rec) LS.set(P + 'highscore', pts);
    const times = LS.get(P + 'best', {}); let timeRec = false;
    if (won && G.mode === 'solo') { const k = G.diff; if (times[k] == null || sec < times[k]) { times[k] = sec; timeRec = true; LS.set(P + 'best', times); } }
    if (G.mode === 'daily') { const all = LS.get(P + 'daily', {}); if (!all[G.daily.key]) { all[G.daily.key] = { won, sec, pts, hints: b.hintsUsed }; const ks = Object.keys(all).sort(); while (ks.length > 30) delete all[ks.shift()]; LS.set(P + 'daily', all); } }
    const flagsOk = Array.from(b.st).reduce((s, v, i) => s + (v === 2 && b.mine[i] ? 1 : 0), 0);
    setTimeout(() => {
      const ov = $('ovEnd'); ov.classList.toggle('won', won); ov.classList.toggle('lost', !won);
      $('eIcon').textContent = won ? '🏆' : '💥';
      $('eTitle').textContent = won ? 'Frequenz frei!' : 'Störsender erwischt!';
      $('eSub').textContent = won ? (G.mode === 'daily' ? 'Tagesrätsel gelöst – teile dein Ergebnis!' : 'Alle ' + b.m + ' Störsender umgangen – sauber gepeilt!') : 'Rauschen auf allen Kanälen … ' + Math.round(b.opened / (b.w * b.h - b.m) * 100) + ' % der Frequenz waren schon frei.';
      $('eRec').hidden = !won || !(rec || timeRec); $('eRec').textContent = timeRec && !rec ? '⭐ Neue Bestzeit!' : '⭐ Neuer Rekord!';
      const cell = (l, v, full) => '<div' + (full ? ' class="full"' : '') + '><small>' + l + '</small><b>' + v + '</b></div>';
      $('eStats').innerHTML = cell('Punkte', pts) + cell('Zeit', FM.fmt(sec)) + cell('Freie Platten', b.opened + ' / ' + (b.w * b.h - b.m)) + cell('Richtige Peiler', flagsOk + ' / ' + b.m) +
        cell('Peilungen', b.hintsUsed + ' / ' + FM.HINTS) + cell(G.mode === 'solo' ? 'Bestzeit ' + d.n : 'Rekord', G.mode === 'solo' ? (times[G.diff] != null ? FM.fmt(times[G.diff]) : '–') : Math.max(hs, pts)) +
        cell('Siege · Serie', st.won + ' · ' + st.streak + ' (beste ' + st.best + ')', true);
      $('eAgain').textContent = G.mode === 'daily' ? '🎯 Freies Spiel' : '↻ Nochmal';
      $('eShare').textContent = G.mode === 'daily' ? '📤 Ergebnis teilen' : '📤 Teilen';
      ov.hidden = false; focusEl($('eAgain'));
    }, won ? 1500 : 1900);
  }
  function shareText() {
    const b = G.b, link = window.EasyGamesDevice ? EasyGamesDevice.gameLink('frequenzminen/') : 'https://ricorewioriginal-collab.github.io/easygames/frequenzminen/';
    if (G.mode === 'daily') { const r = LS.get(P + 'daily', {})[G.daily.key] || { won: b.won, sec: Math.round(secs()), hints: b.hintsUsed }; return '📡 Frequenz-Minen 3D · Tagesrätsel ' + G.daily.key.split('-').reverse().join('.') + '\n' + (r.won ? '✅ gelöst in ' + FM.fmt(r.sec) + (r.hints ? ' (💡' + r.hints + ')' : ' ohne Peilung') : '💥 Störsender erwischt') + '\nSchaffst du es schneller? ' + link; }
    return '📡 Frequenz-Minen 3D – finde die Störsender! ' + (b.won ? 'Ich hab ' + FM.DIFF[G.diff].n + ' in ' + FM.fmt(secs()) + ' geschafft. ' : '') + link;
  }
  $('eShare').onclick = async () => { const text = shareText(); try { if (navigator.share && isTouch()) { await navigator.share({ text }); return; } } catch (e) { return; } try { await navigator.clipboard.writeText(text); toast('📋 Kopiert – einfach einfügen!'); } catch (e) { toast(text); } };
  $('eAgain').onclick = () => start(G.mode === 'daily' ? SET.diff : G.diff);
  $('eMenu').onclick = toMenu;
  // Feld ansehen: Game-over-Fenster kurz ausblenden, Tippen/Taste holt es zurück
  $('eView').onclick = () => { $('ovEnd').hidden = true; toast('👆 Tippen oder Taste drücken – zurück zur Auswertung'); };
  const backToEnd = () => { if (G.over && inGame() && !anyOv()) { $('ovEnd').hidden = false; focusEl($('eAgain')); return true; } return false; };

  /* ---------- Eingabe auf dem Spielfeld ---------- */
  const stage = $('stage'), ptr = new Map(); let press = null, pinch = 0, lpT = 0;
  const playing = () => inGame() && G.b && !G.b.done && !anyOv();
  stage.addEventListener('contextmenu', e => e.preventDefault());
  stage.addEventListener('pointerdown', e => {
    if (backToEnd()) return;
    if (!playing()) return; ptr.set(e.pointerId, { x: e.clientX, y: e.clientY }); try { stage.setPointerCapture(e.pointerId); } catch (_) { }
    if (ptr.size === 2) { clearTimeout(lpT); press = null; const [a, c] = [...ptr.values()]; pinch = Math.hypot(a.x - c.x, a.y - c.y); return; }
    press = { x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY, moved: false, done: false, btn: e.button, touch: e.pointerType !== 'mouse' };
    if (press.touch) { const p = press; lpT = setTimeout(() => { if (press === p && !p.moved) { p.done = true; const i = FMScene.pick(p.x, p.y); act(i, G.flagMode ? 'open' : 'flag'); } }, 420); }
  });
  stage.addEventListener('pointermove', e => {
    if (!playing()) return;
    if (e.pointerType === 'mouse' && !ptr.size) { G.kb = false; FMScene.setCursor(-1); FMScene.setHover(FMScene.pick(e.clientX, e.clientY)); FMScene.parallax((e.clientX / innerWidth - .5) * 2, (e.clientY / innerHeight - .5) * 2); return; }
    if (!ptr.has(e.pointerId)) return; ptr.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptr.size === 2) { const [a, c] = [...ptr.values()], d = Math.hypot(a.x - c.x, a.y - c.y); if (pinch) FMScene.setZoom(FMScene.zoom * d / pinch); pinch = d; return; }
    if (!press) return;
    if (!press.moved && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 12) { press.moved = true; clearTimeout(lpT); }
    if (press.moved && FMScene.zoom > 1) { const k = G.b.w / FMScene.zoom / stage.clientWidth * 1.1; FMScene.panBy(-(e.clientX - press.lx) * k, -(e.clientY - press.ly) * k); }
    press.lx = e.clientX; press.ly = e.clientY;
  });
  const up = e => {
    ptr.delete(e.pointerId); clearTimeout(lpT); if (ptr.size < 2) pinch = 0;
    const p = press; press = null; if (!p || p.done || p.moved || !playing()) return;
    const i = FMScene.pick(e.clientX, e.clientY); if (i < 0) return;
    G.kb = false; FMScene.setCursor(-1);
    if (p.btn === 2) act(i, 'flag'); else if (p.btn === 0 || p.touch) act(i, G.flagMode ? 'flag' : 'open');
  };
  stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', e => { ptr.delete(e.pointerId); press = null; clearTimeout(lpT); });
  stage.addEventListener('wheel', e => { if (!inGame()) return; e.preventDefault(); FMScene.setZoom(FMScene.zoom * (e.deltaY < 0 ? 1.12 : 1 / 1.12)); }, { passive: false });

  // Tastatur / Controller: Rahmen bewegen
  function setCur(i, show) { G.cur = i; if (show) { G.kb = true; FMScene.setCursor(i); FMScene.focusCell(i); } }
  function moveCur(dx, dy) {
    const b = G.b; if (G.cur < 0) G.cur = ((b.h / 2) | 0) * b.w + ((b.w / 2) | 0);
    else if (G.kb) { const x = Math.max(0, Math.min(b.w - 1, G.cur % b.w + dx)), y = Math.max(0, Math.min(b.h - 1, ((G.cur / b.w) | 0) + dy)); G.cur = y * b.w + x; }
    setCur(G.cur, true); sfx('move'); $('ctrlHint').hidden = true;
  }
  const DIRK = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0] };
  addEventListener('keydown', e => {
    const ov = anyOv(), k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (k === 'Escape' || (k === 'p' && inGame())) {
      if (ov) { if (ov.id === 'ovPause') resume(); else if (ov.id === 'ovRadio') $('radioX').click(); else if (ov.id === 'ovEnd') toMenu(); else if (ov.id === 'ovHelp') $('helpX').click(); else if (ov.id === 'ovSet') $('setX').click(); else if (ov.id === 'ovRec') $('recX').click(); e.preventDefault(); return; }
      if (inGame()) { e.preventDefault(); pauseGame(); } return;
    }
    if (!ov && backToEnd()) { e.preventDefault(); return; }
    if (ov || !inGame() || !G.b || G.b.done || e.ctrlKey || e.metaKey || e.altKey) return;
    if (DIRK[k]) { e.preventDefault(); moveCur(DIRK[k][0], DIRK[k][1]); return; }
    if (k === 'Enter' || k === ' ') { e.preventDefault(); if (G.cur < 0 || !G.kb) moveCur(0, 0); else act(G.cur, G.flagMode ? 'flag' : 'open'); return; }
    if (k === 'f' || k === 'e') { e.preventDefault(); if (G.cur < 0 || !G.kb) moveCur(0, 0); else act(G.cur, 'flag'); return; }
    if (k === 'h') { e.preventDefault(); useHint(); return; }
    if (k === '+' || k === '=') { e.preventDefault(); FMScene.setZoom(FMScene.zoom * 1.25); if (G.cur >= 0) FMScene.focusCell(G.cur); return; }
    if (k === '-') { e.preventDefault(); FMScene.setZoom(FMScene.zoom / 1.25); return; }
    if (k === 't') { e.preventDefault(); setFlagMode(!G.flagMode); }
  });

  /* ---------- Knöpfe ---------- */
  $('bFlag').onclick = e => { setFlagMode(!G.flagMode); toast(G.flagMode ? '🚩 Tippen setzt jetzt Peiler' : '⛏ Tippen deckt jetzt auf'); if (e.detail) e.currentTarget.blur(); };
  $('bHint').onclick = e => { useHint(); if (e.detail) e.currentTarget.blur(); };
  $('bZoomIn').onclick = () => FMScene.setZoom(FMScene.zoom * 1.3); $('bZoomOut').onclick = () => FMScene.setZoom(FMScene.zoom / 1.3);
  function pauseGame() { if (!G.b || G.over) return; stopTimer(); FMScene.pause(true); $('ovPause').hidden = false; focusEl($('pGo')); }
  function resume() { $('ovPause').hidden = true; if (G.b && !G.b.done && G.b.placed) startTimer(); FMScene.pause(false); if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); }
  $('bPause').onclick = e => { pauseGame(); if (e.detail) e.currentTarget.blur(); };
  $('bRadio').onclick = e => { pauseGame(); $('ovPause').hidden = true; openRadio($('ovPause')); if (e.detail) e.currentTarget.blur(); };
  $('pGo').onclick = resume; $('pNew').onclick = () => start(G.diff);
  $('pRadio').onclick = () => { $('ovPause').hidden = true; openRadio($('ovPause')); };
  $('pHelp').onclick = () => { $('ovPause').hidden = true; $('ovHelp').hidden = false; helpBack = $('ovPause'); focusEl($('helpX')); };
  $('pQuit').onclick = toMenu;

  /* ---------- Menü ---------- */
  let helpBack = null;
  function demo() {
    const b = FM.newBoard(11, 11, 16, 7); FM.reveal(b, 60); FMScene.setBoard(b);
    FMScene.open(Array.from(b.st).map((s, i) => s === 1 ? i : -1).filter(i => i >= 0), 60);
    let n = 0; for (let i = 0; i < b.w * b.h && n < 4; i++) if (b.mine[i] && FM.nb(b, i).some(j => b.st[j] === 1)) { FM.flag(b, i); FMScene.setFlag(i, true); n++; }
  }
  function toMenu() {
    stopTimer(); G.mode = 'menu'; G.b = null; for (const o of document.querySelectorAll('.ov')) o.hidden = true;
    scr('sMenu'); FMScene.insets(20, 20); demo(); FMScene.setDemo(true); FMScene.pause(false); menuStat(); focusEl($('bPlay'));
  }
  function menuStat() {
    const st = LS.get(P + 'stats', null), hs = LS.get(P + 'highscore', 0), today = LS.get(P + 'daily', {})[FM.dayKey()];
    $('menuStat').textContent = st && st.played ? 'Rekord ' + hs + ' Punkte · ' + st.won + ' von ' + st.played + ' Runden gewonnen' : 'Der erste Klick ist immer sicher – viel Glück!';
    $('dailyTag').textContent = today ? (today.won ? '✅ ' + FM.fmt(today.sec) : '💥 versucht') : 'neu';
    document.querySelectorAll('#diffs .chip').forEach(c => c.classList.toggle('on', c.dataset.d === SET.diff));
  }
  $('diffs').onclick = e => { const c = e.target.closest('.chip'); if (!c) return; SET.diff = c.dataset.d; saveSet(); menuStat(); };
  $('bPlay').onclick = () => start(SET.diff); $('bDaily').onclick = () => start('daily');
  $('bHelp').onclick = () => { helpBack = null; $('ovHelp').hidden = false; focusEl($('helpX')); };
  $('helpX').onclick = () => { $('ovHelp').hidden = true; if (helpBack) { helpBack.hidden = false; focusEl($('pGo')); helpBack = null; } else focusEl($('bPlay')); };
  $('bRec').onclick = () => {
    const st = LS.get(P + 'stats', { played: 0, won: 0, streak: 0, best: 0 }), t = LS.get(P + 'best', {}), cell = (l, v) => '<div><small>' + l + '</small><b>' + v + '</b></div>';
    $('recList').innerHTML = cell('Highscore', LS.get(P + 'highscore', 0)) + cell('Siege', st.won + ' / ' + st.played) + ['leicht', 'mittel', 'schwer'].map(k => cell('Bestzeit ' + FM.DIFF[k].n, t[k] != null ? FM.fmt(t[k]) : '–')).join('') + cell('Beste Serie', st.best);
    const dl = LS.get(P + 'daily', {}), wins = Object.values(dl).filter(x => x.won).length; $('recInfo').textContent = 'Tagesrätsel: ' + wins + ' von ' + Object.keys(dl).length + ' gelöst (letzte 30 Tage). Highscore und Rangliste werden mit deinem Konto gespeichert.';
    $('ovRec').hidden = false; focusEl($('recX'));
  };
  $('recX').onclick = () => { $('ovRec').hidden = true; focusEl($('bRec')); };
  $('bSet').onclick = () => { $('sSound').checked = SET.sound; $('sVib').checked = SET.vib; $('sLow').checked = SET.low; $('sChord').checked = SET.chord; $('ovSet').hidden = false; focusEl($('setX')); };
  $('setX').onclick = () => { SET.sound = $('sSound').checked; SET.vib = $('sVib').checked; SET.low = $('sLow').checked; SET.chord = $('sChord').checked; saveSet(); $('ovSet').hidden = true; focusEl($('bSet')); };
  $('bRadioM').onclick = () => openRadio();

  addEventListener('resize', () => { if (inGame()) insets(); });
  addEventListener('visibilitychange', () => { if (document.hidden) { if (RAD.el) RAD.el.pause(); if (inGame() && G.b && !G.b.done && G.run) pauseGame(); } else radioSync(); });
  const kick = () => { if (SET.station && RAD.el && RAD.el.paused) radioSync(); else if (SET.station && !RAD.el) radioSync(); }; addEventListener('pointerdown', kick, { once: true }); addEventListener('keydown', kick, { once: true });
  if (window.self !== window.top) $('backLink').hidden = true;

  /* ---------- Ladebildschirm ---------- */
  const TIPS = ['Funkplatten werden kalibriert …', 'Störsender werden versteckt …', 'Radarschüssel dreht sich ein …', 'Peiler werden poliert …'];
  const bar = p => { $('loadBar').style.width = Math.round(p * 100) + '%'; $('loadTxt').textContent = TIPS[Math.min(TIPS.length - 1, Math.floor(p * TIPS.length))]; };
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const img = src => new Promise(r => { const i = new Image(); i.onload = i.onerror = r; i.src = src; });
  (async function boot() {
    const t0 = performance.now(); bar(.1);
    if (!window.THREE) { $('loadTxt').textContent = '3D konnte nicht geladen werden – bitte Seite neu laden.'; return; }
    await wait(60); bar(.3);
    try { FMScene.init($('stage'), { low: SET.low }); } catch (e) { $('loadTxt').textContent = '3D-Grafik wird auf diesem Gerät nicht unterstützt.'; return; }
    bar(.55); await Promise.all([img('../anmacha-memory/logos/01.png'), img('../anmacha-memory/logos/07.png')]); bar(.75);
    toMenu(); await wait(120); bar(1);
    await wait(Math.max(0, 900 - (performance.now() - t0)));
    $('sLoad').classList.add('out'); setTimeout(() => { $('sLoad').classList.remove('on'); focusEl($('bPlay')); }, 460);
    radioSync();
    const q = new URLSearchParams(location.search); if (q.has('daily')) start('daily');
  })();
  window.FREQUENZMINEN = { state: () => ({ mode: G.mode, diff: G.diff, done: G.b && G.b.done, won: G.b && G.b.won, opened: G.b && G.b.opened, flags: G.b && G.b.flags, w: G.b && G.b.w, h: G.b && G.b.h, cur: G.cur, sec: secs() }), board: () => G.b, act };
})();
