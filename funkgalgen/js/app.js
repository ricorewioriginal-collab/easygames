/* Funkgalgen – App: Menüs, Modi (Solo-Serie, Tageswort, Duell, Online & Handys), Tastatur, Ton, Radio.
 * Logik: js/core.js (FG), Wörter: js/words.js (FGW) und das Wortfunk-Wörterbuch (../wortfunk/data/*.dawg), 3D: js/scene.js (FGScene).
 * Online: PeerJS-kompatibel über ../cloud/fire-peer.js; Einladung über EasyGamesLink.share (easygames-Homepage). Controller: ../gamepad.js (Steuerkreuz + A). */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const P = 'funkgalgen-';
  const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } } };
  const SET = Object.assign({ sound: true, vib: true, low: false, station: '' }, LS.get(P + 'settings', {}));
  const saveSet = () => LS.set(P + 'settings', SET);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let toastT = 0; function toast(m) { const t = $('toast'); t.textContent = m; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2400); }
  const vib = ms => { if (SET.vib && navigator.vibrate) try { navigator.vibrate(ms); } catch (e) { } };
  const { W, CATS } = window.FGW;
  const COLS = ['#FF4FAE', '#00E5FF', '#FFC94D', '#2EE6A0', '#8B5CF6', '#FF8A1F', '#ff6b6b', '#9be15d'];
  const isTouch = () => matchMedia('(pointer: coarse)').matches;
  function focusEl(el) { if (el && !isTouch()) try { el.focus({ preventScroll: true }); } catch (e) { } }
  // Tasten der Bildschirmtastatur nur mit Controller fokussieren (sonst würde Enter die fokussierte Taste drücken statt „Lösen“)
  const padOn = () => { try { return Array.from(navigator.getGamepads ? navigator.getGamepads() : []).some(p => p && p.connected); } catch (e) { return false; } };
  const focusKey = el => { if (el && window.EasyGamesPad && EasyGamesPad.focus) EasyGamesPad.focus(el); if (padOn()) focusEl(el); else if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); };
  addEventListener('gamepadconnected', () => setTimeout(() => { if ($('sGame').classList.contains('on')) refocus(); }, 50));
  function scr(id) { document.querySelectorAll('.scr').forEach(s => s.classList.toggle('on', s.id === id)); }
  const anyOv = () => Array.from(document.querySelectorAll('.ov')).find(o => !o.hidden);

  /* ---------- Wörterbuch (Wortfunk) ---------- */
  const DICT = { p: {}, main: null, pools: {} };
  const loadDawg = n => DICT.p[n] || (DICT.p[n] = fetch('../wortfunk/data/' + n + '.dawg').then(r => { if (!r.ok) throw new Error('http'); return r.arrayBuffer(); }).then(b => new Uint32Array(b)));
  async function mainDict() { if (!DICT.main) DICT.main = FG.Dict(await loadDawg('woerter')); return DICT.main; }
  async function knownPool(diff) { if (!DICT.pools[diff]) DICT.pools[diff] = FG.dictPool(await loadDawg('bekannt'), diff); return DICT.pools[diff]; }

  /* ---------- Ton ---------- */
  let AC = null;
  function sfx(k) {
    if (!SET.sound) return;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); const t = AC.currentTime;
      const tone = (f, d, vol, type, f2, at) => { const o = AC.createOscillator(), g = AC.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t + (at || 0)); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + (at || 0) + d); g.gain.setValueAtTime(.0001, t + (at || 0)); g.gain.exponentialRampToValueAtTime(vol, t + (at || 0) + .01); g.gain.exponentialRampToValueAtTime(.0001, t + (at || 0) + d); o.connect(g); g.connect(AC.destination); o.start(t + (at || 0)); o.stop(t + (at || 0) + d + .02); };
      const noise = (d, f, vol, f2) => { const n = Math.floor(AC.sampleRate * d), b = AC.createBuffer(1, n, AC.sampleRate), dd = b.getChannelData(0); for (let i = 0; i < n; i++) dd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2); const s = AC.createBufferSource(), fl = AC.createBiquadFilter(), g = AC.createGain(); s.buffer = b; fl.type = 'lowpass'; fl.frequency.setValueAtTime(f, t); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + d); g.gain.value = vol; s.connect(fl); fl.connect(g); g.connect(AC.destination); s.start(t); };
      if (k === 'key') tone(900, .03, .05, 'square');
      else if (k === 'hit') { tone(660, .12, .12, 'triangle'); tone(990, .16, .1, 'triangle', 0, .07); }
      else if (k === 'miss') { tone(160, .2, .2, 'sawtooth', 70); noise(.3, 900, .35, 200); }
      else if (k === 'win') [0, 1, 2, 3, 5].forEach((i, n) => tone(523 * Math.pow(1.122, i * 2), .2, .1, 'triangle', 0, n * .1));
      else if (k === 'lose') { tone(300, .5, .15, 'sawtooth', 80); noise(.7, 1500, .6, 150); }
      else if (k === 'joker') tone(1200, .25, .08, 'sine', 2400);
      else if (k === 'bad') tone(220, .08, .1, 'square');
    } catch (e) { }
  }

  /* ---------- Radio (laut.fm, wie Funk-Minigolf) ---------- */
  const STATIONS = [null, ['RicoReWi Radio', 'ricorewi'], ['YourTime-FM', 'yourtime-fm'], ['Rapradio 24', 'rapradio24'], ['Schlagerpop 24', 'schlagerpop24'], ['Chartradio 24', 'chartradio24'], ['Clubradio 24', 'clubradio24'], ['AnMaCha 24', 'anmacha24'],
    ['RadioFloh!', 'radiofloh'], ['Rockradio 24', 'rockradio24'], ['Christmasradio 24', 'christmasradio24'], ['Kultradio 24', 'kultradio24'], ['Zocker-FM', 'zockerfm'], ['Special-Radio', 'special-radio']];
  const RAD = { el: null, slug: '' };
  function radioSync(announce) {
    const st = STATIONS.find(x => x && x[1] === SET.station) || null;
    for (const b of [$('bRadio'), $('bRadioM'), $('pRadio')]) b.classList.toggle('on', !!st);
    $('bRadioM').textContent = '📻 Radio: ' + (st ? st[0] : 'aus');
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
  $('radioX').onclick = () => { $('ovRadio').hidden = true; if (radioBack) { radioBack.hidden = false; focusEl(radioBack.querySelector('.btn')); } else refocus(); };

  /* ---------- Bildschirmtastatur ---------- */
  const ROWS = ['QWERTZUIOPÜ', 'ASDFGHJKLÖÄ', 'YXCVBNM'];
  function buildKbd(el, onKey, extra) {
    el.innerHTML = ROWS.map((r, i) => '<div class="r">' + Array.from(r).map(c => '<button class="key" data-k="' + c + '">' + c + '</button>').join('') + (i === 2 && extra ? extra.map(x => '<button class="key wide act" data-x="' + x[0] + '">' + x[1] + '</button>').join('') : '') + '</div>').join('');
    el.onclick = e => { const b = e.target.closest('.key'); if (!b || b.disabled) return; if (b.dataset.k) onKey(b.dataset.k); else onKey(null, b.dataset.x); };
  }
  function keyState(el, used) { el.querySelectorAll('.key[data-k]').forEach(b => { const s = used[b.dataset.k] || ''; b.classList.toggle('hit', s === 'hit'); b.classList.toggle('miss', s === 'miss'); b.disabled = !!s; }); }
  function tiles(el, pat, lostWord) { el.innerHTML = pat.map((c, i) => c ? '<i class="open">' + c + '</i>' : lostWord ? '<i class="lost">' + lostWord[i] + '</i>' : '<i></i>').join(''); }
  function livesEl(n, max) { $('lives').innerHTML = Array.from({ length: max }, (_, i) => '<i class="' + (i < n ? '' : 'gone') + '"></i>').join(''); }

  /* ---------- Spielzustand ---------- */
  const G = { mode: 'solo', r: null, score: 0, streak: 0, words: 0, cat: LS.get(P + 'cat', 'alle'), diff: LS.get(P + 'diff', 'mittel'), recent: [], busy: false, duel: null, sceneOn: false };
  const used = r => { const u = {}; for (const c of r.shown) u[c] = 'hit'; for (const c of r.wrong) u[c] = 'miss'; return u; };
  const catName = id => id === 'dict' ? '📖 Wörterbuch' : (CATS.find(c => c.id === id) || {}).n ? CATS.find(c => c.id === id).icon + ' ' + CATS.find(c => c.id === id).n : '';
  function ensureScene() { if (!G.sceneOn) { FGScene.init($('stage'), { low: SET.low }); G.sceneOn = true; } else FGScene.init($('stage')); }
  function beginRound(word, catLabel) {
    G.r = FG.newRound(word); G.busy = false; scr('sGame'); $('sGame').classList.remove('tv'); $('kbd').hidden = false; $('tvHint').hidden = true; $('side').hidden = true; $('feed').innerHTML = '';
    ensureScene(); FGScene.reset(G.r.max); FGScene.pause(false);
    $('cat').textContent = catLabel ? 'Kategorie: ' + catLabel + ' · ' + G.r.word.length + ' Buchstaben' : G.r.word.length + ' Buchstaben';
    const extra = G.mode === 'duel' ? [['solve', '✍️ Lösen']] : [['joker', '💡 Joker'], ['solve', '✍️ Lösen']];
    buildKbd($('kbd'), onKey, extra); render(); hud(); focusKey($('kbd').querySelector('[data-k="E"]'));
  }
  function render() { const r = G.r; tiles($('tiles'), FG.pattern(r), r.done && !r.won ? r.word : null); $('wrongs').textContent = r.wrong.join(' '); keyState($('kbd'), used(r)); livesEl(r.lives, r.max); }
  function hud() {
    const m = { solo: '🎯 Solo-Serie', daily: '📅 Tageswort', duel: '👥 Duell' }[G.mode] || '';
    $('hMode').textContent = m;
    if (G.mode === 'solo') { $('hInfo').textContent = 'Wort ' + (G.words + 1) + (G.streak > 1 ? ' · Serie ' + G.streak : ''); $('hScore').textContent = G.score; }
    else if (G.mode === 'daily') { $('hInfo').textContent = FG.dayKey().split('-').reverse().join('.'); $('hScore').textContent = ''; }
    else if (G.mode === 'duel') { const d = G.duel; $('hInfo').textContent = esc(d.names[d.guesser]) + ' rät · Runde ' + (Math.floor(d.turn / 2) + 1) + '/' + d.rounds; $('hScore').textContent = d.score[0] + ' : ' + d.score[1]; }
  }
  function onKey(ch, x) {
    if (G.busy || !G.r || G.r.done || anyOv()) return;
    if (x === 'joker') { const c = FG.joker(G.r); if (!c) { toast('Nur noch ein Buchstabe – den schaffst du!'); return; } sfx('joker'); FGScene.right(); toast('💡 Joker: ' + c + ' (kostet 25 Punkte)'); render(); if (G.r.done) roundEnd(); return; }
    if (x === 'solve') { openSolve(); return; }
    const res = FG.guess(G.r, ch); sfx('key');
    if (res.res === 'hit') { sfx('hit'); vib(15); FGScene.right(); }
    else if (res.res === 'miss') { sfx('miss'); vib([40, 30, 60]); FGScene.wrong(G.r.lives, G.r.max); }
    else if (res.res === 'dup') { toast(res.ch + ' hattest du schon'); return; }
    render(); if (G.r.done) roundEnd();
    else { const k = $('kbd').querySelector('[data-k="' + ch + '"]'); if (k && document.activeElement === k) { const n = Array.from($('kbd').querySelectorAll('.key[data-k]:not(:disabled)')); const i = n.findIndex(b => b.compareDocumentPosition(k) & Node.DOCUMENT_POSITION_PRECEDING); focusKey(n[i] || n[n.length - 1]); } }
  }
  function openSolve() { $('sIn').value = ''; $('ovSolve').hidden = false; setTimeout(() => $('sIn').focus(), 50); }
  $('sCancel').onclick = () => { $('ovSolve').hidden = true; refocus(); };
  $('sOk').onclick = () => {
    const w = $('sIn').value; if (FG.norm(w).length < 2) { $('sIn').focus(); return; } $('ovSolve').hidden = true;
    const res = FG.solve(G.r, w);
    if (res.res === 'solved') { sfx('hit'); FGScene.right(); }
    else if (res.res === 'wrongword') { sfx('miss'); toast('Leider falsch – 2 Kisten weg!'); FGScene.wrong(G.r.lives + 1, G.r.max); FGScene.wrong(G.r.lives, G.r.max); }
    render(); if (G.r.done) roundEnd(); else refocus();
  };
  $('sIn').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); $('sOk').click(); } else if (e.key === 'Escape') { e.preventDefault(); $('sCancel').click(); } e.stopPropagation(); });
  function refocus() { if ($('sGame').classList.contains('on') && G.r && !G.r.done) focusKey($('kbd').querySelector('.key[data-k]:not(:disabled)')); }

  // Rundenende je Modus
  function roundEnd() {
    const r = G.r; G.busy = true;
    if (r.won) { sfx('win'); FGScene.win(); } else { sfx('lose'); vib([100, 60, 200]); }
    setTimeout(() => {
      if (G.mode === 'solo') soloEnd(r); else if (G.mode === 'daily') dailyEnd(r); else if (G.mode === 'duel') duelEnd(r);
    }, r.won ? 1100 : 1900);
  }
  function showRound(title, word, info, next, nextLabel, share) {
    $('rTitle').textContent = title; $('rWord').textContent = word; $('rInfo').innerHTML = info;
    $('rNext').textContent = nextLabel || 'Weiter ▶'; $('rNext').onclick = () => { $('ovRound').hidden = true; next(); };
    $('rShare').textContent = '📤 Teilen'; $('rShare').hidden = !share; $('rShare').onclick = share || null;
    $('ovRound').hidden = false; focusEl($('rNext'));
  }

  /* ---------- Solo-Serie ---------- */
  function soloSetup() {
    $('cats').innerHTML = [{ id: 'alle', n: 'Alle', icon: '🎲' }].concat(CATS, [{ id: 'dict', n: 'Wörterbuch', icon: '📖' }]).map(c => '<button class="chip' + (c.id === G.cat ? ' on' : '') + '" data-c="' + c.id + '">' + c.icon + ' ' + c.n + '</button>').join('');
    document.querySelectorAll('#diffs .chip').forEach(b => b.classList.toggle('on', b.dataset.d === G.diff));
    scr('sSetup'); focusEl($('setupGo'));
  }
  $('cats').onclick = e => { const b = e.target.closest('.chip'); if (!b) return; G.cat = b.dataset.c; LS.set(P + 'cat', G.cat); $('cats').querySelectorAll('.chip').forEach(x => x.classList.toggle('on', x === b)); };
  $('diffs').onclick = e => { const b = e.target.closest('.chip'); if (!b) return; G.diff = b.dataset.d; LS.set(P + 'diff', G.diff); $('diffs').querySelectorAll('.chip').forEach(x => x.classList.toggle('on', x === b)); };
  $('setupBack').onclick = toMenu;
  $('setupGo').onclick = () => { G.mode = 'solo'; G.score = 0; G.streak = 0; G.words = 0; soloNext(); };
  async function soloNext() {
    let word, label;
    if (G.cat === 'dict') { try { const p = await knownPool(G.diff); word = FG.pick(p, Math.random, G.recent); label = catName('dict'); } catch (e) { toast('Wörterbuch nicht geladen – nehme Kategorien'); } }
    if (!word) { word = FG.pick(FG.pool(W, G.cat, G.diff), Math.random, G.recent); label = catName(FG.catOf(W, word)); }
    G.recent.push(word); if (G.recent.length > 60) G.recent.shift();
    beginRound(word, label);
  }
  function soloEnd(r) {
    if (r.won) {
      G.streak++; G.words++; const pts = FG.points(r, G.streak - 1); G.score += pts;
      const st = LS.get(P + 'stats', {}); st.woerter = (st.woerter || 0) + 1; LS.set(P + 'stats', st);
      showRound('🎉 Gerettet!', r.word, '+' + pts + ' Punkte · noch ' + r.lives + ' von ' + r.max + ' Kisten' + (G.streak > 1 ? ' · Serie ' + G.streak : ''), soloNext, 'Nächstes Wort ▶');
    } else {
      const st = LS.get(P + 'stats', {}); st.serien = (st.serien || 0) + 1; st.besteSerie = Math.max(st.besteSerie || 0, G.words); LS.set(P + 'stats', st);
      const prev = LS.get(P + 'highscore', 0), rec = G.score > prev; if (rec) LS.set(P + 'highscore', G.score);
      showRound('🎂 Platsch – in der Torte!', r.word, 'Serie vorbei: <b>' + G.words + '</b> ' + (G.words === 1 ? 'Wort' : 'Wörter') + ' · <b>' + G.score + '</b> Punkte' + (rec ? '<br>🏆 Neuer Rekord!' : '<br>Rekord: ' + prev), () => { G.score = 0; G.streak = 0; G.words = 0; soloNext(); }, 'Neue Serie ▶');
      $('rShare').hidden = false; $('rShare').textContent = 'Menü'; $('rShare').onclick = () => { $('ovRound').hidden = true; $('rShare').textContent = '📤 Teilen'; toMenu(); };
    }
  }

  /* ---------- Tageswort ---------- */
  function shareLink() { const u = location.href.split('#')[0].split('?')[0]; return window.EasyGamesLink ? EasyGamesLink.share(u) : u; }
  function dailyText(res, key) { const d = key.split('-').reverse().join('.'); return 'Funkgalgen · Tageswort ' + d + '\n' + (res.won ? '✅ geschafft mit ' + res.err + (res.err === 1 ? ' Fehler ' : ' Fehlern ') : '🎂 in der Torte gelandet ') + '📦'.repeat(res.left) + '▫️'.repeat(FG.LIVES - res.left) + '\n' + shareLink(); }
  async function shareDaily(res, key) { const text = dailyText(res, key); try { if (navigator.share && isTouch()) { await navigator.share({ text }); return; } } catch (e) { return; } try { await navigator.clipboard.writeText(text); toast('📋 Ergebnis kopiert – einfach einfügen!'); } catch (e) { toast(text); } }
  function startDaily() {
    G.mode = 'daily'; const key = FG.dayKey(), done = LS.get(P + 'daily', {})[key];
    if (done) { scr('sMenu'); showRound(done.won ? '✅ Heute schon geschafft!' : '🎂 Heute schon gespielt', done.word, 'Morgen gibt es ein neues Tageswort.', () => toMenu(), 'Menü', () => shareDaily(done, key)); return; }
    const word = FG.daily(W, key); beginRound(word, catName(FG.catOf(W, word)));
  }
  function dailyEnd(r) {
    const key = FG.dayKey(), all = LS.get(P + 'daily', {}), res = { won: r.won, err: r.wrong.length + (r.max - r.lives - r.wrong.length), left: r.lives, word: r.word };
    all[key] = res; LS.set(P + 'daily', all);
    const st = LS.get(P + 'stats', {}); st.tage = (st.tage || 0) + 1; if (r.won) st.tageGeschafft = (st.tageGeschafft || 0) + 1; LS.set(P + 'stats', st);
    showRound(r.won ? '🎉 Tageswort geschafft!' : '🎂 Platsch!', r.word, r.won ? 'Mit ' + res.err + (res.err === 1 ? ' Fehler' : ' Fehlern') + '. Teile dein Ergebnis!' : 'Morgen klappt es bestimmt.', toMenu, 'Menü', () => shareDaily(res, key));
  }

  /* ---------- Duell (zwei an einem Gerät) ---------- */
  $('dRounds').onclick = e => { const b = e.target.closest('.chip'); if (!b) return; $('dRounds').querySelectorAll('.chip').forEach(x => x.classList.toggle('on', x === b)); };
  $('duelBack').onclick = toMenu;
  $('duelGo').onclick = () => {
    const names = [$('dA').value.trim() || 'Spieler 1', $('dB').value.trim() || 'Spieler 2'].map(n => n.slice(0, 14)); LS.set(P + 'duel', names);
    G.mode = 'duel'; G.duel = { names, rounds: +$('dRounds').querySelector('.on').dataset.r, turn: 0, score: [0, 0], setter: 0, guesser: 1 }; duelWord();
  };
  function duelWord() {
    const d = G.duel; d.setter = d.turn % 2; d.guesser = 1 - d.setter;
    $('wTitle').textContent = '🤫 ' + d.names[d.setter] + ', dein geheimes Wort'; $('wHint').textContent = d.names[d.guesser] + ' schaut bitte weg! Das Wort muss im Wörterbuch stehen.';
    $('wIn').value = ''; $('wIn').type = 'password'; $('wErr').textContent = ''; scr('sWord'); setTimeout(() => { if (!isTouch()) $('wIn').focus(); }, 50);
  }
  $('wEye').onclick = () => { $('wIn').type = $('wIn').type === 'password' ? 'text' : 'password'; };
  $('wRand').onclick = () => { $('wIn').value = FG.pick(FG.pool(W, 'alle', 'mittel'), Math.random, G.recent); $('wIn').type = 'password'; $('wErr').textContent = '🎲 Zufallswort gewählt – einfach auf Fertig.'; };
  $('wOk').onclick = async () => {
    let dict = null; try { dict = await mainDict(); } catch (e) { }
    const c = FG.checkWord($('wIn').value, dict); if (!c.ok) { $('wErr').textContent = c.err; sfx('bad'); return; }
    G.recent.push(c.w); beginRound(c.w, '');
  };
  $('wIn').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); $('wOk').click(); } e.stopPropagation(); });
  function duelEnd(r) {
    const d = G.duel, pts = r.won ? r.lives : 0; d.score[d.guesser] += pts; d.turn++;
    const last = d.turn >= d.rounds * 2, head = r.won ? '🎉 ' + d.names[d.guesser] + ' hat es!' : '🎂 ' + d.names[d.guesser] + ' landet in der Torte!';
    const info = (r.won ? '+' + pts + ' Punkte (übrige Kisten)' : 'Keine Punkte') + '<br>Stand: ' + esc(d.names[0]) + ' ' + d.score[0] + ' : ' + d.score[1] + ' ' + esc(d.names[1]);
    if (!last) { showRound(head, r.word, info + '<br>Jetzt denkt sich ' + esc(d.names[1 - d.setter]) + ' ein Wort aus.', duelWord); return; }
    const win = d.score[0] === d.score[1] ? 'Unentschieden!' : '🏆 ' + d.names[d.score[0] > d.score[1] ? 0 : 1] + ' gewinnt!';
    const st = LS.get(P + 'stats', {}); st.duelle = (st.duelle || 0) + 1; LS.set(P + 'stats', st);
    showRound(win, r.word, head + '<br>Endstand: ' + esc(d.names[0]) + ' ' + d.score[0] + ' : ' + d.score[1] + ' ' + esc(d.names[1]), () => { G.duel.turn = 0; G.duel.score = [0, 0]; duelWord(); }, 'Revanche ▶');
    $('rShare').hidden = false; $('rShare').textContent = 'Menü'; $('rShare').onclick = () => { $('ovRound').hidden = true; $('rShare').textContent = '📤 Teilen'; toMenu(); };
  }

  /* ---------- Verbindung (PeerJS-kompatibel über ../cloud/fire-peer.js, wie Funkmaler) ---------- */
  function mkNet(cb) {
    const ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789', PRE = 'funkgalgen-';
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
  const netErr = e => ({ nocode: 'Diesen Raum gibt es nicht (mehr). Steht der Code richtig auf dem Fernseher?', timeout: 'Keine Verbindung – bitte nochmal versuchen.', code: 'Bitte den 4-stelligen Code vom Fernseher eingeben.' }[e && e.message] || 'Online ist gerade nicht erreichbar. Prüfe das Internet und versuche es nochmal.');
  let wake = null; function keepAwake() { try { if (navigator.wakeLock && !wake) navigator.wakeLock.request('screen').then(w => { wake = w; w.addEventListener('release', () => { wake = null; }); }).catch(() => { }); } catch (e) { } }

  /* ---------- Online: Fernseher/PC als Gastgeber ---------- */
  const H = { net: null, players: [], phase: 'lobby', setter: -1, order: [], turn: 0, r: null, revealT: 0 };
  const hp = peer => H.players.find(p => p.peer === peer);
  async function hostOpen() {
    G.mode = 'online'; H.players = []; H.phase = 'lobby'; scr('sLobby'); $('code').textContent = '····'; $('url').textContent = 'Raum wird eröffnet …'; $('qr').textContent = '…'; renderLobby();
    if (H.net) H.net.close(); H.net = mkNet({ onMsg: hostMsg, onLeave: hostLeave }); mainDict().catch(() => { });
    try {
      const code = await H.net.host(); $('code').textContent = code; $('url').textContent = H.net.link(); keepAwake();
      H.net.loadQR().then(() => { const q = qrcode(0, 'M'); q.addData(H.net.link()); q.make(); $('qr').innerHTML = q.createSvgTag({ cellSize: 4, margin: 0, scalable: true }); }).catch(() => { $('qr').textContent = code; });
      focusEl($('lobStart'));
    } catch (e) { $('url').textContent = netErr(e); toast(netErr(e)); }
  }
  function renderLobby() {
    const on = H.players.filter(p => p.on);
    $('lobPlayers').innerHTML = H.players.length ? H.players.map(p => '<div class="slot' + (p.on ? '' : ' off') + '"><i style="background:' + p.col + '"></i>' + esc(p.name) + '</div>').join('') : '<p class="hint">Noch niemand da – scannt den QR-Code!</p>';
    $('lobStart').disabled = on.length < 2; $('lobStart').textContent = on.length < 2 ? 'Mindestens 2 Handys …' : '▶ Los geht\'s! (' + on.length + ')';
  }
  function hostMsg(peer, d) {
    let p = hp(peer);
    if (d.t === 'hi') {
      const old = d.cid && H.players.find(x => x.cid === d.cid);
      if (old) { old.peer = peer; old.on = true; p = old; }
      else if (H.phase !== 'lobby') { H.net.sendTo(peer, { t: 'msg', m: 'Das Spiel läuft schon – bei der nächsten Runde bist du dabei.' }); return; }
      else if (H.players.length >= 8) { H.net.sendTo(peer, { t: 'msg', m: 'Der Raum ist voll (8 Spieler).' }); return; }
      else { let n = String(d.name || '').replace(/[<>]/g, '').trim().slice(0, 14) || 'Gast', base = n, k = 2; while (H.players.some(x => x.name.toLowerCase() === n.toLowerCase())) n = base.slice(0, 11) + ' ' + k++; p = { peer, cid: d.cid, name: n, col: COLS[H.players.length % COLS.length], score: 0, on: true }; H.players.push(p); }
      H.net.sendTo(peer, { t: 'wel', name: p.name, col: p.col }); renderLobby(); sideRender(); sendState(p); return;
    }
    if (!p) return;
    if (d.t === 'word' && H.phase === 'set' && H.order[H.turn] === p) {
      const c = FG.checkWord(d.w, DICT.main); if (!c.ok) { H.net.sendTo(peer, { t: 'bad', err: c.err }); return; }
      hostRound(c.w);
    } else if (d.t === 'rand' && H.phase === 'set' && H.order[H.turn] === p) { H.net.sendTo(peer, { t: 'randw', w: FG.pick(FG.pool(W, 'alle', 'mittel'), Math.random) }); }
    else if (d.t === 'g' && H.phase === 'guess' && H.order[H.turn] !== p) {
      const r = H.r, res = FG.guess(r, d.ch);
      if (res.res === 'hit') { const pts = 5 * res.n + (r.won ? 10 : 0); p.score += pts; feed(p, res.ch + ' ✓ +' + pts); sfx('hit'); FGScene.right(); H.net.sendTo(peer, { t: 'v', p: 20 }); }
      else if (res.res === 'miss') { p.score = Math.max(0, p.score - 2); feed(p, res.ch + ' ✗ −2'); sfx('miss'); FGScene.wrong(r.lives, r.max); H.net.sendTo(peer, { t: 'v', p: [40, 30, 60] }); }
      else return;
      hostRender(); if (r.done) hostRoundEnd(r.won ? p : null);
    } else if (d.t === 's' && H.phase === 'guess' && H.order[H.turn] !== p) {
      const r = H.r, res = FG.solve(r, d.w);
      if (res.res === 'solved') { const pts = 20 + 3 * res.hidden; p.score += pts; feed(p, 'löst das Wort! +' + pts); sfx('hit'); }
      else if (res.res === 'wrongword') { p.score = Math.max(0, p.score - 5); feed(p, 'falsch gelöst −5'); sfx('miss'); FGScene.wrong(r.lives + 1, r.max); FGScene.wrong(r.lives, r.max); }
      else return;
      hostRender(); if (r.done) hostRoundEnd(r.won ? p : null);
    }
  }
  function hostLeave(peer) { const p = hp(peer); if (!p) return; p.on = false; if (H.phase === 'lobby') { H.players = H.players.filter(x => x !== p); renderLobby(); } else { feed(p, 'ist weg'); sideRender(); if (H.phase === 'set' && H.order[H.turn] === p) hostNextTurn(true); } }
  function feed(p, t) { const f = $('feed'), s = document.createElement('span'); s.innerHTML = '<b style="color:' + p.col + '">' + esc(p.name) + '</b> ' + esc(t); f.prepend(s); while (f.children.length > 4) f.lastChild.remove(); }
  function sideRender() { const s = H.order[H.turn]; $('side').innerHTML = H.players.slice().sort((a, b) => b.score - a.score).map(p => '<div class="' + (p === s ? 'cur' : '') + '" style="' + (p.on ? '' : 'opacity:.4') + '"><span><i style="display:inline-block;width:10px;height:10px;border-radius:50%;background:' + p.col + ';margin-right:6px"></i>' + esc(p.name) + (p === s ? ' ✍️' : '') + '</span><b>' + p.score + '</b></div>').join(''); }
  $('lobStart').onclick = () => {
    if (H.players.filter(p => p.on).length < 2) return;
    H.order = H.players.filter(p => p.on); H.turn = -1; H.players.forEach(p => { p.score = 0; });
    scr('sGame'); $('sGame').classList.add('tv'); $('kbd').hidden = true; $('tvHint').hidden = false; $('side').hidden = false; $('feed').innerHTML = ''; $('hMode').textContent = '🌐 Online & Handys';
    ensureScene(); keepAwake(); hostNextTurn();
  };
  function hostNextTurn(skip) {
    H.turn++; while (H.turn < H.order.length && !H.order[H.turn].on) H.turn++;
    if (H.turn >= H.order.length) return hostFinal();
    const s = H.order[H.turn]; H.phase = 'set'; H.r = null;
    FGScene.reset(FG.LIVES); $('tiles').innerHTML = ''; $('wrongs').textContent = ''; livesEl(FG.LIVES, FG.LIVES);
    $('cat').textContent = ''; $('hInfo').textContent = 'Runde ' + (H.turn + 1) + '/' + H.order.length; $('hScore').textContent = '';
    $('tvHint').innerHTML = '✍️ <b style="color:' + s.col + '">' + esc(s.name) + '</b> denkt sich ein Wort aus …'; sideRender();
    for (const p of H.players) sendState(p);
  }
  function hostRound(w) {
    H.r = FG.newRound(w); H.phase = 'guess'; const s = H.order[H.turn];
    $('tvHint').innerHTML = '📱 Ratet auf euren Handys! Wort von <b style="color:' + s.col + '">' + esc(s.name) + '</b>'; $('cat').textContent = w.length + ' Buchstaben';
    feed(s, 'hat ein Wort gewählt'); hostRender();
  }
  function hostRender() { const r = H.r; tiles($('tiles'), FG.pattern(r), r.done && !r.won ? r.word : null); $('wrongs').textContent = r.wrong.join(' '); livesEl(r.lives, r.max); sideRender(); for (const p of H.players) sendState(p); }
  function hostRoundEnd(winner) {
    const r = H.r, s = H.order[H.turn]; H.phase = 'reveal';
    if (!winner) { s.score += 25; feed(s, '+25 – ab in die Torte!'); sfx('lose'); } else { FGScene.win(); sfx('win'); }
    $('tvHint').innerHTML = winner ? '🎉 Gelöst: <b>' + r.word + '</b>' : '🎂 In der Torte! Das Wort war <b>' + r.word + '</b>';
    sideRender(); for (const p of H.players) sendState(p);
    setTimeout(() => { if (H.phase === 'reveal') hostNextTurn(); }, 4200);
  }
  function hostFinal() {
    H.phase = 'final'; const r = H.players.slice().sort((a, b) => b.score - a.score);
    for (const p of H.players) sendState(p);
    const st = LS.get(P + 'stats', {}); st.online = (st.online || 0) + 1; LS.set(P + 'stats', st);
    showRound('🏆 ' + r[0].name + ' gewinnt!', '', r.map((p, i) => (i + 1) + '. ' + esc(p.name) + ' – ' + p.score).join('<br>'), () => { H.players.forEach(p => { p.score = 0; }); H.phase = 'lobby'; scr('sLobby'); renderLobby(); for (const p of H.players) sendState(p); }, 'Zur Lobby ▶');
  }
  function sendState(p) {
    if (!H.net || !p.on) return; const r = H.r, s = H.order[H.turn], me = p === s;
    const d = { t: 'st', ph: H.phase, score: p.score, me, setter: s ? s.name : '', pat: r ? FG.pattern(r).map(c => c || '') : [], used: r ? used(r) : {}, lives: r ? r.lives : FG.LIVES };
    if (H.phase === 'reveal' || H.phase === 'final') { d.word = r ? r.word : ''; d.rank = H.players.slice().sort((a, b) => b.score - a.score).indexOf(p) + 1; d.n = H.players.length; }
    H.net.sendTo(p.peer, d);
  }
  $('lobBack').onclick = () => { if (H.net) H.net.close(); H.net = null; toMenu(); };

  /* ---------- Online: Handy ---------- */
  const C = { net: null, cid: LS.get(P + 'cid', '') || Math.random().toString(36).slice(2, 10), code: '', name: '', joined: false, st: null };
  LS.set(P + 'cid', C.cid);
  function joinScreen(code) { scr('sPhone'); $('pJoin').hidden = false; $('pPlay').hidden = true; $('jCode').value = code || ''; $('jName').value = LS.get(P + 'name', ''); G.mode = 'phone'; buildKbd($('pKbd'), (ch, x) => { if (x === 'solve') { $('sIn').value = ''; $('ovSolve').hidden = false; C.solving = true; return; } if (C.net) C.net.send({ t: 'g', ch }); vib(10); sfx('key'); }, [['solve', '✍️ Lösen']]); }
  $('bJoin').onclick = async () => {
    const name = $('jName').value.trim().slice(0, 14); if (!name) { $('jMsg').textContent = 'Bitte gib deinen Namen ein.'; return; }
    LS.set(P + 'name', name); C.name = name; C.code = $('jCode').value; $('jMsg').textContent = 'Verbinde …'; $('bJoin').disabled = true;
    try { if (C.net) C.net.close(); C.net = mkNet({ onMsg: guestMsg, onLeave: guestLost }); await C.net.join(C.code); C.net.send({ t: 'hi', name, cid: C.cid }); keepAwake(); $('jMsg').textContent = ''; }
    catch (e) { $('jMsg').textContent = netErr(e); }
    $('bJoin').disabled = false;
  };
  function guestMsg(_, d) {
    if (d.t === 'wel') { C.joined = true; $('pJoin').hidden = true; $('pPlay').hidden = false; $('pName').innerHTML = '<i style="display:inline-block;width:14px;height:14px;border-radius:50%;background:' + d.col + ';margin-right:6px"></i>' + esc(d.name); vib(30); }
    else if (d.t === 'msg') $('jMsg').textContent = d.m;
    else if (d.t === 'bad') { $('pErr').textContent = d.err; sfx('bad'); }
    else if (d.t === 'randw') { $('pWord').value = d.w; $('pErr').textContent = '🎲 Zufallswort – auf Los tippen.'; }
    else if (d.t === 'v') vib(d.p);
    else if (d.t === 'st') {
      C.st = d; $('pScore').textContent = d.score; const setMode = d.ph === 'set' && d.me, guess = d.ph === 'guess' && !d.me;
      $('pSet').hidden = !setMode; $('pKbd').hidden = !guess; $('pTiles').hidden = !(d.ph === 'guess' || d.ph === 'reveal');
      if (setMode && $('pSet').dataset.open !== '1') { $('pSet').dataset.open = '1'; $('pWord').value = ''; $('pErr').textContent = ''; }
      if (!setMode) $('pSet').dataset.open = '';
      $('pMsg').textContent = { lobby: 'Warte auf den Start …', set: d.me ? '✍️ Du bist dran: denk dir ein Wort aus!' : '⏳ ' + d.setter + ' denkt sich ein Wort aus …', guess: d.me ? '👀 Die anderen raten dein Wort …' : '🔤 Schnell raten – wer zuerst tippt, punktet!', reveal: 'Das Wort war: ' + d.word, final: '🏁 Platz ' + d.rank + ' von ' + d.n + ' – ' + d.score + ' Punkte' }[d.ph] || '';
      tiles($('pTiles'), d.pat.map(c => c || null), null); keyState($('pKbd'), d.used);
    }
  }
  function guestLost() { if (!C.joined) return; $('pMsg').textContent = 'Verbindung weg – verbinde neu …'; setTimeout(async () => { try { await C.net.join(C.code); C.net.send({ t: 'hi', name: C.name, cid: C.cid }); } catch (e) { guestLost(); } }, 2500); }
  $('pEye').onclick = () => { $('pWord').type = $('pWord').type === 'password' ? 'text' : 'password'; };
  $('pRand').onclick = () => { if (C.net) C.net.send({ t: 'rand' }); };
  $('pSend').onclick = () => { const w = FG.norm($('pWord').value); if (w.length < 3) { $('pErr').textContent = 'Mindestens 3 Buchstaben.'; return; } if (C.net) C.net.send({ t: 'word', w }); };
  $('pWord').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); $('pSend').click(); } e.stopPropagation(); });
  // „Lösen“ auf dem Handy nutzt denselben Dialog
  const solveOk = $('sOk').onclick; $('sOk').onclick = () => { if (C.solving) { C.solving = false; $('ovSolve').hidden = true; const w = FG.norm($('sIn').value); if (w.length >= 2 && C.net) C.net.send({ t: 's', w }); return; } solveOk(); };
  const solveNo = $('sCancel').onclick; $('sCancel').onclick = () => { C.solving = false; solveNo(); };

  /* ---------- Menüs, Tastatur, Start ---------- */
  function toMenu() { G.mode = 'menu'; G.r = null; for (const o of ['ovRound', 'ovPause', 'ovSolve']) $(o).hidden = true; if (G.sceneOn) FGScene.pause(true); scr('sMenu'); menuStat(); focusEl($('bSolo')); }
  function menuStat() { const s = LS.get(P + 'stats', {}), hs = LS.get(P + 'highscore', 0), today = LS.get(P + 'daily', {})[FG.dayKey()]; $('menuStat').textContent = (s.woerter ? 'Rekord ' + hs + ' Punkte · ' + s.woerter + ' Wörter gerettet · beste Serie ' + (s.besteSerie || 0) : 'Wie viele Wörter schaffst du am Stück?') + (today ? ' · Tageswort ' + (today.won ? '✅' : '🎂') : ' · 📅 Tageswort wartet!'); }
  $('bSolo').onclick = soloSetup; $('bDaily').onclick = startDaily;
  $('bDuel').onclick = () => { const n = LS.get(P + 'duel', ['', '']); $('dA').value = n[0]; $('dB').value = n[1]; scr('sDuel'); focusEl($('duelGo')); };
  $('bOnline').onclick = hostOpen;
  $('bHelp').onclick = () => { $('ovHelp').hidden = false; focusEl($('helpX')); }; $('helpX').onclick = () => { $('ovHelp').hidden = true; focusEl($('bSolo')); };
  $('bSet').onclick = () => { $('sSound').checked = SET.sound; $('sVib').checked = SET.vib; $('sLow').checked = SET.low; $('ovSet').hidden = false; focusEl($('setX')); };
  $('setX').onclick = () => { SET.sound = $('sSound').checked; SET.vib = $('sVib').checked; SET.low = $('sLow').checked; saveSet(); $('ovSet').hidden = true; focusEl($('bSolo')); };
  $('bRadioM').onclick = () => openRadio(); $('bRadio').onclick = e => { openRadio(); if (e.detail) e.currentTarget.blur(); };
  $('pRadio').onclick = () => { $('ovPause').hidden = true; openRadio($('ovPause')); };
  function pause(on) { $('ovPause').hidden = !on; $('pSound').textContent = SET.sound ? '🔊 Ton an' : '🔇 Ton aus'; if (on) focusEl($('pGo')); else refocus(); }
  $('bPause').onclick = e => { pause(true); if (e.detail) e.currentTarget.blur(); };
  $('pGo').onclick = () => pause(false);
  $('pSound').onclick = () => { SET.sound = !SET.sound; saveSet(); $('pSound').textContent = SET.sound ? '🔊 Ton an' : '🔇 Ton aus'; };
  $('pQuit').onclick = () => { if (H.net && G.mode === 'online') { H.net.close(); H.net = null; } toMenu(); };
  addEventListener('keydown', e => {
    if (e.target && /INPUT/.test(e.target.tagName)) return;
    const ov = anyOv();
    if (e.key === 'Escape') { if (ov) { if (ov.id === 'ovPause') pause(false); else if (ov.id === 'ovSolve') $('sCancel').click(); else if (ov.id === 'ovRadio') $('radioX').click(); else if (ov.id === 'ovHelp' || ov.id === 'ovSet') { ov.hidden = true; focusEl($('bSolo')); } return; }
      if ($('sGame').classList.contains('on')) { e.preventDefault(); pause(true); } else if (['sSetup', 'sDuel', 'sWord', 'sLobby'].some(id => $(id).classList.contains('on'))) toMenu(); return; }
    if (ov || !$('sGame').classList.contains('on') || G.mode === 'online') return;
    if (e.key === 'Enter' && !(document.activeElement && document.activeElement.tagName === 'BUTTON')) { e.preventDefault(); openSolve(); return; }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const ch = FG.norm(e.key); if (ch.length === 1) { e.preventDefault(); onKey(ch); }
  });
  addEventListener('visibilitychange', () => { if (document.hidden) { if (RAD.el) RAD.el.pause(); } else radioSync(); });

  if (window.self !== window.top) $('backLink').hidden = true; menuStat(); radioSync();
  const kick = () => { if (SET.station && RAD.el && RAD.el.paused) radioSync(); }; addEventListener('pointerdown', kick, { once: true }); addEventListener('keydown', kick, { once: true });
  const q = new URLSearchParams(location.search), jm = /[?#&]join=([A-Za-z0-9]{4})/.exec(location.search + location.hash);
  if (jm) joinScreen(jm[1].toUpperCase());
  else if (q.has('tv') || (window.EasyGamesKit && EasyGamesKit.isTv && EasyGamesKit.isTv())) hostOpen();
  else focusEl($('bSolo'));
  window.FUNKGALGEN = { state: () => ({ mode: G.mode, word: G.r && G.r.word, lives: G.r && G.r.lives, done: G.r && G.r.done, won: G.r && G.r.won, score: G.score, streak: G.streak, host: { phase: H.phase, code: H.net && H.net.code, players: H.players.map(p => ({ name: p.name, score: p.score })), word: H.r && H.r.word }, guest: { joined: C.joined, st: C.st } }) }; // für Tests
})();
