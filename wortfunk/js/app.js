/* Wortfunk – Oberfläche, Eingabe (Touch, Maus, Tastatur, Gamecontroller über ../gamepad.js) und Online-Spiel */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const N = WF.N, CENTER = WF.CENTER;
  const COLORS = ['#00E5FF', '#FF2D95', '#FFC94D', '#2EE6A0'];
  const BOTS = ['Rita Radio', 'DJ Bit', 'Funky Fred', 'Lexi Loop'];
  const LEVELS = { leicht: 'Computer · leicht', mittel: 'Computer · mittel', schwer: 'Computer · schwer' };
  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { } }
  };
  const SET = Object.assign({ sound: true, preview: true, hints: true }, LS.get('wortfunk-settings', {}));
  const saveSet = () => LS.set('wortfunk-settings', SET);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- Wörterbuch und Hintergrund-Rechner ---------- */
  let dict = null, worker = null, wReady = false, wid = 0;
  const wq = new Map();
  function ai(d) {
    d.seed = (Math.random() * 4294967296) >>> 0;
    if (worker && wReady) return new Promise(res => { const id = ++wid; d.id = id; wq.set(id, { res, d }); worker.postMessage(d); });
    return new Promise(res => setTimeout(() => res(WF.pick(d, dict, common)), 30));
  }
  function startWorker(buf, cbuf) {
    try {
      worker = new Worker('worker.js');
      worker.onmessage = e => { const d = e.data; if (d.ready) { wReady = true; return; } const r = wq.get(d.id); if (r) { wq.delete(d.id); r.res(d.move); } };
      worker.onerror = () => { wReady = false; worker = null; for (const [, r] of wq) r.res(WF.pick(r.d, dict, common)); wq.clear(); };
      worker.postMessage({ init: buf, common: cbuf }, cbuf ? [buf, cbuf] : [buf]);
    } catch (e) { worker = null; }
  }
  let common = null;
  const get = u => fetch(u).then(r => { if (!r.ok) throw new Error('http'); return r.arrayBuffer(); });
  Promise.all([get('data/woerter.dawg'), get('data/bekannt.dawg').catch(() => null)]).then(([buf, cbuf]) => {
    dict = WF.Dict(new Uint32Array(buf.slice(0)));
    if (cbuf) common = WF.Dict(new Uint32Array(cbuf.slice(0)));
    startWorker(buf, cbuf);
    $('loadInfo').hidden = true;
    onReady();
  }).catch(() => { $('loadInfo').textContent = 'Das Wörterbuch konnte nicht geladen werden. Bitte prüfe die Verbindung und lade die Seite neu.'; });

  /* ---------- Ton (im Browser erzeugt) ---------- */
  let AC = null;
  function sfx(kind) {
    if (!SET.sound) return;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      if (AC.state === 'suspended') AC.resume();
      const seq = { tap: [[660, .04]], place: [[520, .05], [780, .05]], ok: [[523, .08], [659, .08], [784, .14]], bad: [[200, .12], [150, .16]], turn: [[880, .06]],
        bingo: [[523, .08], [659, .08], [784, .08], [1047, .25]], win: [[392, .1], [523, .1], [659, .1], [784, .3]] }[kind] || [];
      let t = AC.currentTime;
      for (const [f, d] of seq) {
        const o = AC.createOscillator(), g = AC.createGain();
        o.type = kind === 'bad' ? 'square' : 'triangle'; o.frequency.value = f;
        g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.12, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + d);
        o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + d + .02); t += d * .9;
      }
    } catch (e) { }
  }

  /* ---------- Zustand ---------- */
  const A = {
    mode: '', G: null, seats: [], V: null, me: -1, pend: [], rk: [], rkSeat: -2, rkBy: {}, sel: -1, cur: CENTER, dir: 1,
    zoom: false, kbd: false, busy: false, hints: {}, handFor: -1, gameId: 0, net: null, guestName: '', lastSetup: null
  };
  const scr = id => { document.querySelectorAll('.scr').forEach(s => s.classList.toggle('on', s.id === id)); if (id === 'sGame') fit(); };
  const curScr = () => (document.querySelector('.scr.on') || {}).id;
  const openOv = id => { $(id).hidden = false; setTimeout(() => focusFirst($(id)), 30); };
  const closeOv = id => { $(id).hidden = true; };
  const ovOpen = () => Array.from(document.querySelectorAll('.ov')).find(o => !o.hidden);
  let toastT = 0;
  function toast(msg, cls) { const t = $('toast'); t.textContent = msg; t.className = 'toast' + (cls ? ' ' + cls : ''); t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2600); }

  /* ---------- Brett aufbauen ---------- */
  const LABEL = { B2: '2×B', B3: '3×B', W2: '2×W', W3: '3×W', ST: '★' };
  const cells = [];
  (function buildBoard() {
    const b = $('board'), f = document.createDocumentFragment();
    for (let i = 0; i < WF.SIZE; i++) {
      const c = document.createElement('div'); const bo = WF.BONUS[i];
      c.className = 'cell' + (bo ? ' ' + bo : ''); c.dataset.i = i; f.appendChild(c); cells.push(c);
    }
    b.appendChild(f);
  })();
  function tileHtml(t, cls) {
    const L = WF.letter(t), j = WF.isJoker(t) || t === 0;
    const txt = t === 0 ? '✦' : WF.ch(L), v = j ? '' : WF.VAL[L];
    return '<div class="tile' + (j ? ' joker' : '') + (cls ? ' ' + cls : '') + '">' + txt + '<i>' + v + '</i></div>';
  }
  function fit() {
    const w = $('boardWrap'); if (!w.clientWidth) return;
    const W = w.clientWidth - 8, H = w.clientHeight - 8;
    let c = Math.floor((Math.min(W, H) - 12 - 28) / 15);
    c = Math.max(15, Math.min(c, 64));
    const small = c < 30;
    if (A.zoom) c = Math.max(c, 44);
    document.documentElement.style.setProperty('--cell', c + 'px');
    w.classList.toggle('zoom', A.zoom);
    $('aZoom').hidden = !small && !A.zoom;
    $('actions').classList.toggle('nozoom', $('aZoom').hidden || innerWidth > innerHeight * 1.2);
    if (A.zoom) scrollToCell(A.pend.length ? A.pend[A.pend.length - 1].i : A.cur);
  }
  addEventListener('resize', () => { if (curScr() === 'sGame') fit(); });
  function scrollToCell(i) { if (!A.zoom) return; const c = cells[i]; if (c && c.scrollIntoView) c.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' }); }

  /* ---------- Wer ist an diesem Gerät dran? ---------- */
  const humanLocal = s => s && (s.kind === 'human' || s.kind === 'host');
  function botLevel(s) { return s.kind === 'bot' ? s.level : (s.kind === 'guest' && !s.online ? 'mittel' : null); }
  function viewSeat() {
    if (!A.V) return -1;
    if (A.mode === 'guest') return A.V.me;
    const hs = A.seats.map((s, k) => humanLocal(s) ? k : -1).filter(k => k >= 0);
    if (humanLocal(A.seats[A.V.turn])) return A.V.turn;
    return hs.length === 1 ? hs[0] : -1;
  }
  function canAct() {
    return !!(A.V && dict && !A.V.over && A.me >= 0 && A.V.turn === A.me && !A.busy && A.handFor !== A.me &&
      (A.mode === 'guest' || humanLocal(A.seats[A.me])));
  }
  const myRack = () => (A.mode === 'guest' ? A.V.rack : (A.me >= 0 ? A.G.racks[A.me] : null)) || [];

  // Bank-Reihenfolge bleibt beim Ordnen und Mischen erhalten, neue Steine kommen hinten dazu
  function syncRack() {
    const rack = myRack();
    if (A.rkSeat !== A.me) { A.rkBy[A.rkSeat] = A.rk; A.rk = (A.rkBy[A.me] || []).slice(); A.rkSeat = A.me; }
    const pool = rack.slice(), out = [];
    for (const t of A.rk) { const k = pool.indexOf(t); if (k >= 0) { out.push(t); pool.splice(k, 1); } }
    A.rk = out.concat(pool); A.rkBy[A.me] = A.rk;
  }
  const usedSlot = k => A.pend.some(p => p.k === k);
  const pendAt = i => A.pend.find(p => p.i === i);
  function refreshView() {
    if (A.mode !== 'guest' && A.G) A.V = WF.publicView(A.G, -1);
    A.me = viewSeat();
    A.pend = []; A.sel = -1;
    syncRack();
    render();
  }

  /* ---------- Darstellung ---------- */
  function render() {
    const V = A.V; if (!V) return;
    const last = new Set(V.last && V.last.k === 'play' ? V.last.cells : []);
    const pm = new Map(A.pend.map(p => [p.i, p]));
    let pcls = '';
    if (A.pend.length && SET.preview) { const ev = WF.evaluate(V.board, A.pend.map(p => ({ i: p.i, t: p.t })), dict); pcls = ev.ok ? 'ok' : 'bad'; showPreview(ev); }
    else $('preview').hidden = true;
    for (let i = 0; i < WF.SIZE; i++) {
      const c = cells[i], p = pm.get(i), t = p ? p.t : V.board[i];
      const html = t ? tileHtml(t, p ? 'pend ' + pcls : (last.has(i) ? 'last' : '')) : '<span class="lb">' + (LABEL[WF.BONUS[i]] || '') + '</span>';
      if (c._h !== html) { c.innerHTML = html; c._h = html; }
      const cur = A.kbd && i === A.cur && canAct();
      c.classList.toggle('cur', cur); c.classList.toggle('dirH', cur && A.dir === 1); c.classList.toggle('dirV', cur && A.dir === N);
    }
    renderScores(); renderRack(); renderActions(); renderLog();
  }
  function showPreview(ev) {
    const p = $('preview');
    if (ev.ok) p.textContent = '✓ ' + ev.words.map(w => w.w).join(' · ') + ' = ' + ev.score + ' Punkte' + (ev.bingo ? ' (inkl. +50!)' : '');
    else p.textContent = '✗ ' + ev.err;
    p.className = 'preview ' + (ev.ok ? 'ok' : 'bad'); p.hidden = false;
  }
  function renderScores() {
    const V = A.V;
    $('scores').innerHTML = V.names.map((n, k) => {
      const s = A.seats[k] || {}, off = s.kind === 'guest' && s.online === false;
      const ic = s.kind === 'bot' ? '🤖 ' : (s.kind === 'guest' ? '📱 ' : '');
      return '<div class="sc' + (k === V.turn && !V.over ? ' turn' : '') + '" style="--c:' + COLORS[k] + '"><div class="n">' + ic + esc(n) + (off ? ' <span class="off">offline</span>' : '') + '</div><div class="p">' + V.scores[k] + '</div></div>';
    }).join('');
    $('bagN').textContent = V.bag;
    const t = V.turn, s = A.seats[t] || {};
    let info = '';
    if (V.over) info = 'Partie beendet';
    else if (t === A.me) info = A.busy ? 'Zug wird geprüft …' : '<b>Du bist dran</b>' + (A.seats.filter(humanLocal).length > 1 && A.mode === 'local' ? ' · ' + esc(V.names[t]) : '');
    else if (botLevel(s)) info = '🤖 <b>' + esc(V.names[t]) + '</b> überlegt …';
    else info = (s.kind === 'guest' ? '📱 ' : '') + '<b>' + esc(V.names[t]) + '</b> ist dran';
    $('turnInfo').innerHTML = info;
  }
  function renderRack() {
    const r = $('rack');
    if (A.me < 0) { r.innerHTML = '<div class="hint" style="margin:auto">' + (A.mode === 'host' ? '📺 TV-Tisch – gespielt wird auf den Handys' : '') + '</div>'; return; }
    const hide = A.handFor === A.me;
    r.innerHTML = A.rk.map((t, k) => {
      const used = usedSlot(k);
      return '<div class="rk' + (used ? ' empty' : '') + (k === A.sel && !used ? ' sel' : '') + (hide ? ' hide' : '') + '" data-k="' + k + '">' + (used ? '' : tileHtml(t)) + '</div>';
    }).join('');
  }
  function renderActions() {
    const act = canAct(), show = A.me >= 0;
    $('actions').hidden = !show;
    $('aPlay').disabled = !act || !A.pend.length;
    $('aRecall').disabled = !A.pend.length;
    $('aHint').hidden = !SET.hints;
    $('actions').classList.toggle('nohint', !SET.hints);
    $('aHint').disabled = !act || (A.hints[A.me] || 0) >= 3;
    $('aHint').title = 'Tipp (' + (3 - (A.hints[A.me] || 0)) + ' übrig)';
    $('aSwap').disabled = !act || !A.V.canSwap;
    $('aPass').disabled = !act;
    $('aShuffle').disabled = !show;
  }
  function renderLog() {
    const V = A.V, items = [];
    for (const e of V.log) {
      const n = e.p >= 0 ? esc(V.names[e.p]) : '';
      if (e.k === 'play') items.push('<li><b>' + n + '</b> ' + e.words.map(w => esc(w[0])).join(', ') + (e.bingo ? ' 🎉' : '') + '<span class="pts">+' + e.score + '</span></li>');
      else if (e.k === 'swap') items.push('<li><b>' + n + '</b> tauscht ' + e.n + ' Steine</li>');
      else if (e.k === 'pass') items.push('<li><b>' + n + '</b> passt</li>');
      else if (e.k === 'end') items.push('<li>Partie beendet</li>');
    }
    const l = $('log'); l.innerHTML = items.reverse().join('');
  }

  /* ---------- Steine legen ---------- */
  function addPend(i, t, k) {
    if (A.V.board[i] || pendAt(i) || usedSlot(k)) return false;
    A.pend.push({ i, t, k }); sfx('place');
    if (i === A.cur) A.cur = nextFree(i);
    // nächsten freien Stein vorwählen (praktisch mit Controller)
    A.sel = -1; for (let q = 1; q <= A.rk.length; q++) { const j = (k + q) % A.rk.length; if (!usedSlot(j)) { A.sel = j; break; } }
    render(); scrollToCell(i);
    return true;
  }
  function nextFree(i) {
    let x = i, r = (i / N) | 0, c = i % N;
    do { if (A.dir === 1) { c++; if (c >= N) return i; } else { r++; if (r >= N) return i; } x = r * N + c; } while (A.V.board[x] || pendAt(x));
    return x;
  }
  let jokerCb = null;
  function placeSlot(k, i) {
    if (!canAct() || k < 0 || usedSlot(k) || A.V.board[i] || pendAt(i)) return;
    const t = A.rk[k];
    if (t === 0) { jokerCb = L => addPend(i, L | 32, k); openOv('ovJoker'); return; }
    addPend(i, t, k);
  }
  function recall(i) { const n = A.pend.length; A.pend = A.pend.filter(p => p.i !== i); if (A.pend.length !== n) { sfx('tap'); render(); } }
  function recallAll() { if (!A.pend.length) return false; A.pend = []; render(); sfx('tap'); return true; }
  function undoLast() { const p = A.pend.pop(); if (!p) return; A.cur = p.i; sfx('tap'); render(); }
  function typeLetter(L) {
    if (!canAct()) return;
    let i = A.cur;
    while (A.V.board[i] || pendAt(i)) { const n = nextFree(i); if (n === i) { toast('Kein freies Feld mehr in dieser Richtung', 'bad'); return; } i = n; }
    let k = A.rk.findIndex((t, j) => t === L && !usedSlot(j));
    let t = L;
    if (k < 0) { k = A.rk.findIndex((x, j) => x === 0 && !usedSlot(j)); t = L | 32; }
    if (k < 0) { toast('Den Buchstaben ' + WF.ch(L) + ' hast du nicht', 'bad'); sfx('bad'); return; }
    A.cur = i; addPend(i, t, k);
  }
  function shuffleRack() {
    if (A.me < 0) return;
    const free = A.rk.map((t, k) => k).filter(k => !usedSlot(k)), vals = free.map(k => A.rk[k]);
    WF.shuffle(vals, Math.random); free.forEach((k, j) => { A.rk[k] = vals[j]; });
    A.sel = -1; sfx('tap'); renderRack();
  }
  function moveSlot(from, to) { // Bank ordnen; offene Steine auf dem Brett behalten ihren Stein
    if (from === to) return;
    const idx = A.rk.map((_, k) => k); const [m] = idx.splice(from, 1); idx.splice(to, 0, m);
    A.rk = idx.map(k => A.rk[k]); A.rkBy[A.me] = A.rk;
    for (const p of A.pend) p.k = idx.indexOf(p.k);
    if (A.sel >= 0) A.sel = idx.indexOf(A.sel);
    render();
  }

  /* ---------- Züge ---------- */
  function submit() {
    if (!canAct() || !A.pend.length) return;
    const tiles = A.pend.map(p => ({ i: p.i, t: p.t }));
    const ev = WF.evaluate(A.V.board, tiles, dict);
    if (!ev.ok) { toast(ev.err, 'bad'); sfx('bad'); return; }
    if (A.mode === 'guest') { A.busy = true; render(); A.net.send({ t: 'play', tiles }); guestWait(); return; }
    doPlay(A.me, tiles);
  }
  let guestT = 0;
  function guestWait() { clearTimeout(guestT); guestT = setTimeout(() => { if (A.busy) { A.busy = false; render(); toast('Keine Antwort vom Raum – versuch es nochmal', 'bad'); } }, 6000); }
  function doPlay(p, tiles) {
    const r = WF.play(A.G, p, tiles, dict);
    if (!r.ok) return r;
    afterMove(p, '“' + r.words.map(w => w.w).join(', ') + '” +' + r.score + (r.bingo ? ' 🎉 alle 7!' : ''), r.bingo ? 'bingo' : 'ok');
    return r;
  }
  function doSwap(p, letters) { const r = WF.exchange(A.G, p, letters); if (r.ok) afterMove(p, 'tauscht ' + letters.length + ' Steine', 'turn'); return r; }
  function doPass(p) { const r = WF.pass(A.G, p); if (r.ok) afterMove(p, 'passt', 'turn'); return r; }
  function afterMove(p, txt, snd) {
    const humanHere = humanLocal(A.seats[p]) && A.mode === 'local' && A.seats.filter(humanLocal).length === 1;
    toast((humanHere ? '' : A.G.names[p] + ' ') + txt, 'ok');
    sfx(snd);
    if (A.mode === 'local') saveGame();
    if (A.mode === 'host') broadcast();
    refreshView();
    nextTurn();
  }
  function nextTurn() {
    const G = A.G; if (!G) return;
    if (G.over) { LS.del('wortfunk-save'); setTimeout(showEnd, 700); return; }
    const s = A.seats[G.turn], lvl = botLevel(s);
    if (lvl) { botMove(lvl); return; }
    if (A.mode === 'local' && humanLocal(s) && A.seats.filter(humanLocal).length > 1) { handover(G.turn); return; }
    if (G.turn === A.me) sfx('turn');
  }
  function botMove(level) {
    const id = A.gameId, G = A.G, p = G.turn, t0 = Date.now();
    ai({ board: G.board.slice(), rack: G.racks[p].slice(), level }).then(m => {
      setTimeout(() => {
        if (id !== A.gameId || A.G !== G || G.over || G.turn !== p) return;
        if (m && doPlay(p, m.tiles).ok) return;
        if (G.bag.length >= WF.RACK) doSwap(p, WF.swapPick(G.racks[p])); else doPass(p);
      }, Math.max(0, 900 - (Date.now() - t0)));
    });
  }
  function handover(p) {
    A.handFor = p; refreshView();
    $('handTitle').textContent = A.G.names[p] + ' ist dran';
    const l = A.G.last;
    $('handLast').textContent = l ? (A.G.names[l.p] + (l.k === 'play' ? ' hat ' + l.words.map(w => w[0]).join(', ') + ' für ' + l.score + ' Punkte gelegt.' : l.k === 'swap' ? ' hat getauscht.' : ' hat gepasst.')) : 'Reiche das Gerät weiter.';
    openOv('ovHand');
  }
  $('bHandGo').onclick = () => { closeOv('ovHand'); A.handFor = -1; refreshView(); sfx('turn'); };

  /* ---------- Spielende ---------- */
  function showEnd() {
    const V = A.V; if (!V || !V.over) return;
    const ord = V.names.map((n, k) => k).sort((a, b) => V.scores[b] - V.scores[a]);
    const win = V.winners || [ord[0]];
    $('endTitle').textContent = win.length > 1 ? 'Unentschieden!' : (win[0] === A.me ? '🏆 Du gewinnst!' : '🏆 ' + V.names[win[0]] + ' gewinnt!');
    $('endRank').innerHTML = ord.map(k => '<li class="' + (win.includes(k) ? 'win' : '') + '"><span>' + esc(V.names[k]) + '</span><span><b>' + V.scores[k] + '</b>' +
      (V.end && V.end.adj[k] ? ' <small>(' + (V.end.adj[k] > 0 ? '+' : '') + V.end.adj[k] + ' Rest)</small>' : '') + '</span></li>').join('');
    let best = null;
    for (const e of V.log) if (e.k === 'play') for (const w of e.words) if (!best || w[1] > best[1]) best = [w[0], w[1], e.p];
    $('endInfo').textContent = best ? 'Bestes Wort: ' + best[0] + ' (' + best[1] + ' Punkte, ' + V.names[best[2]] + ')' : '';
    $('bEndAgain').hidden = A.mode === 'guest';
    openOv('ovEnd'); sfx(win.includes(A.me) ? 'win' : 'ok');
    saveStats(win, best);
  }
  let statsDone = -1;
  function saveStats(win, best) {
    if (statsDone === A.gameId) return; statsDone = A.gameId;
    const mine = A.mode === 'guest' ? [A.V.me] : A.seats.map((s, k) => humanLocal(s) ? k : -1).filter(k => k >= 0);
    if (!mine.length || mine[0] < 0) return;
    const st = LS.get('wortfunk-stats', { best: 0, wins: 0, games: 0, word: '', wordScore: 0 });
    st.games++;
    st.best = Math.max(st.best || 0, ...mine.map(k => A.V.scores[k]));
    if (mine.length === 1 && win.length === 1 && win[0] === mine[0]) st.wins++;
    for (const e of A.V.log) if (e.k === 'play' && mine.includes(e.p)) for (const w of e.words) if (w[1] > (st.wordScore || 0)) { st.word = w[0]; st.wordScore = w[1]; }
    LS.set('wortfunk-stats', st); menuStat();
  }
  function menuStat() {
    const st = LS.get('wortfunk-stats', null);
    $('menuStat').textContent = st && st.games ? 'Bestwert ' + st.best + ' · ' + st.wins + ' Siege in ' + st.games + ' Partien' + (st.word ? ' · Bestes Wort ' + st.word + ' (' + st.wordScore + ')' : '') : '';
  }
  $('bEndMenu').onclick = () => { closeOv('ovEnd'); quit(); };
  $('bEndAgain').onclick = () => {
    closeOv('ovEnd');
    if (A.mode === 'local') startLocal(A.lastSetup);
    else if (A.mode === 'host') hostStart();
  };

  /* ---------- Lokales Spiel ---------- */
  function defaultSetup() { return LS.get('wortfunk-setup', [{ name: 'Du', kind: 'human' }, { name: BOTS[0], kind: 'bot', level: 'mittel' }]); }
  let setup = [];
  function renderSetup() {
    $('seatList').innerHTML = setup.map((s, k) => '<div class="seat"><div class="dot" style="background:' + COLORS[k] + '">' + (k + 1) + '</div>' +
      '<input data-k="' + k + '" class="sName" maxlength="14" value="' + esc(s.name) + '" aria-label="Name">' +
      '<select data-k="' + k + '" class="sKind" aria-label="Art"><option value="human"' + (s.kind === 'human' ? ' selected' : '') + '>Mensch</option>' +
      Object.keys(LEVELS).map(l => '<option value="' + l + '"' + (s.kind === 'bot' && s.level === l ? ' selected' : '') + '>' + LEVELS[l] + '</option>').join('') + '</select>' +
      (setup.length > 2 ? '<button class="rm" data-k="' + k + '" aria-label="Entfernen">✕</button>' : '<span></span>') + '</div>').join('');
    $('bAddSeat').disabled = setup.length >= 4;
  }
  $('seatList').addEventListener('input', e => { const k = +e.target.dataset.k; if (e.target.classList.contains('sName')) setup[k].name = e.target.value; });
  $('seatList').addEventListener('change', e => {
    const k = +e.target.dataset.k; if (!e.target.classList.contains('sKind')) return;
    const v = e.target.value, s = setup[k], wasBot = s.kind === 'bot';
    if (v === 'human') { s.kind = 'human'; delete s.level; if (wasBot) s.name = 'Spieler ' + (k + 1); }
    else { s.kind = 'bot'; s.level = v; if (!wasBot) s.name = BOTS[k % BOTS.length]; }
    renderSetup();
  });
  $('seatList').addEventListener('click', e => { const b = e.target.closest('.rm'); if (b) { setup.splice(+b.dataset.k, 1); renderSetup(); } });
  $('bAddSeat').onclick = () => { if (setup.length < 4) { setup.push({ name: BOTS[setup.length % BOTS.length], kind: 'bot', level: 'mittel' }); renderSetup(); } };
  $('bNew').onclick = () => { setup = JSON.parse(JSON.stringify(defaultSetup())); renderSetup(); scr('sSetup'); focusFirst($('sSetup')); };
  $('bSetupBack').onclick = () => { scr('sMenu'); focusFirst($('sMenu')); };
  $('bStart').onclick = () => {
    setup.forEach((s, k) => { s.name = (s.name || '').trim().slice(0, 14) || (s.kind === 'bot' ? BOTS[k] : 'Spieler ' + (k + 1)); });
    LS.set('wortfunk-setup', setup);
    startLocal(setup);
  };
  function startLocal(su) {
    A.lastSetup = JSON.parse(JSON.stringify(su));
    A.mode = 'local'; A.gameId++; A.seats = su.map(s => ({ name: s.name, kind: s.kind, level: s.level }));
    A.G = WF.newGame(A.seats.map(s => s.name)); A.hints = {}; A.rkBy = {}; A.rk = []; A.rkSeat = -2; A.handFor = -1; A.busy = false;
    scr('sGame'); refreshView(); saveGame(); nextTurn();
  }
  function saveGame() { if (A.mode === 'local' && A.G && !A.G.over) LS.set('wortfunk-save', { G: A.G, seats: A.seats, hints: A.hints, setup: A.lastSetup }); }
  $('bResume').onclick = () => {
    const s = LS.get('wortfunk-save', null); if (!s || !s.G) return;
    A.mode = 'local'; A.gameId++; A.G = s.G; A.seats = s.seats; A.hints = s.hints || {}; A.lastSetup = s.setup || s.seats; A.rkBy = {}; A.rk = []; A.rkSeat = -2; A.handFor = -1; A.busy = false;
    scr('sGame'); refreshView(); nextTurn();
  };
  function quit() {
    A.gameId++; ['ovMenu', 'ovEnd', 'ovHand', 'ovSwap', 'ovJoker'].forEach(closeOv);
    if (A.net) { A.net.close(); A.net = null; }
    A.mode = ''; A.G = null; A.V = null; A.handFor = -1; A.busy = false;
    menuUpdate(); scr('sMenu'); focusFirst($('sMenu'));
  }

  /* ---------- Tauschen, Tipp, Passen ---------- */
  let swapSel = new Set();
  function openSwap() {
    if (!canAct() || !A.V.canSwap) { if (A.V && !A.V.canSwap) toast('Im Beutel sind weniger als 7 Steine – tauschen geht nicht mehr', 'bad'); return; }
    recallAll(); swapSel = new Set();
    $('swapRack').innerHTML = A.rk.map((t, k) => '<button data-k="' + k + '" aria-label="Stein ' + (t ? WF.ch(t) : 'Joker') + '">' + tileHtml(t) + '</button>').join('');
    openOv('ovSwap');
  }
  $('swapRack').onclick = e => { const b = e.target.closest('button'); if (!b) return; const k = +b.dataset.k; if (swapSel.has(k)) swapSel.delete(k); else swapSel.add(k); b.classList.toggle('on', swapSel.has(k)); sfx('tap'); };
  $('bSwapX').onclick = () => closeOv('ovSwap');
  $('bSwapGo').onclick = () => {
    if (!swapSel.size) { toast('Wähle mindestens einen Stein', 'bad'); return; }
    const letters = Array.from(swapSel).map(k => A.rk[k]); closeOv('ovSwap');
    if (A.mode === 'guest') { A.busy = true; render(); A.net.send({ t: 'swap', letters }); guestWait(); return; }
    const r = doSwap(A.me, letters); if (!r.ok) toast(r.err, 'bad');
  };
  let passArm = 0;
  function doPassBtn() {
    if (!canAct()) return;
    if (Date.now() - passArm > 3000) { passArm = Date.now(); $('aPass').textContent = 'Sicher?'; setTimeout(() => { $('aPass').textContent = 'Passen'; }, 3000); return; }
    passArm = 0; $('aPass').textContent = 'Passen'; recallAll();
    if (A.mode === 'guest') { A.busy = true; render(); A.net.send({ t: 'pass' }); guestWait(); return; }
    doPass(A.me);
  }
  function hint() {
    if (!canAct() || !SET.hints || (A.hints[A.me] || 0) >= 3) return;
    const me = A.me, id = A.gameId, moves = A.V.moves;
    A.busy = true; render();
    ai({ board: A.V.board.slice(), rack: myRack().slice(), hint: true }).then(m => {
      A.busy = false;
      if (id !== A.gameId || A.me !== me || A.V.moves !== moves) { render(); return; }
      if (!m) { toast('Kein Wort gefunden – tausche lieber ein paar Steine', 'bad'); render(); return; }
      A.hints[me] = (A.hints[me] || 0) + 1; A.pend = [];
      for (const x of m.tiles) { const want = WF.isJoker(x.t) ? 0 : x.t; const k = A.rk.findIndex((t, j) => t === want && !usedSlot(j)); if (k >= 0) A.pend.push({ i: x.i, t: x.t, k }); }
      saveGame(); toast('💡 Tipp: ' + m.score + ' Punkte möglich', 'ok'); render(); scrollToCell(m.tiles[0].i);
    });
  }

  /* ---------- Knöpfe im Spiel ---------- */
  const tapBtn = (id, fn) => { $(id).addEventListener('click', e => { fn(); if (e.detail) e.currentTarget.blur(); }); };
  tapBtn('aPlay', submit); tapBtn('aRecall', recallAll); tapBtn('aShuffle', shuffleRack); tapBtn('aHint', hint); tapBtn('aSwap', openSwap); tapBtn('aPass', doPassBtn);
  tapBtn('aZoom', () => { A.zoom = !A.zoom; fit(); });
  tapBtn('bMenu', () => { $('mSound').textContent = SET.sound ? '🔊 Ton an' : '🔇 Ton aus'; $('mQuit').textContent = A.mode === 'local' ? '⏹ Zum Menü (Partie bleibt gespeichert)' : '⏹ Partie verlassen'; openOv('ovMenu'); });
  $('mGo').onclick = () => closeOv('ovMenu');
  $('mHelp').onclick = () => { closeOv('ovMenu'); openOv('ovHelp'); };
  $('mSound').onclick = () => { SET.sound = !SET.sound; saveSet(); $('mSound').textContent = SET.sound ? '🔊 Ton an' : '🔇 Ton aus'; };
  $('mQuit').onclick = () => quit();
  $('bHelp').onclick = () => openOv('ovHelp');
  $('bHelpX').onclick = () => closeOv('ovHelp');
  $('bSet').onclick = () => { $('setSound').checked = SET.sound; $('setPreview').checked = SET.preview; $('setHints').checked = SET.hints; openOv('ovSet'); };
  $('bSetX').onclick = () => { SET.sound = $('setSound').checked; SET.preview = $('setPreview').checked; SET.hints = $('setHints').checked; saveSet(); closeOv('ovSet'); };
  $('jokerGrid').innerHTML = WF.AL.split('').map((c, k) => '<button data-l="' + (k + 1) + '">' + c + '</button>').join('');
  $('jokerGrid').onclick = e => { const b = e.target.closest('button'); if (!b) return; closeOv('ovJoker'); const cb = jokerCb; jokerCb = null; if (cb) cb(+b.dataset.l); };
  $('bJokerX').onclick = () => { jokerCb = null; closeOv('ovJoker'); };

  /* ---------- Zeiger: tippen und ziehen ---------- */
  let drag = null;
  document.addEventListener('pointerdown', e => {
    if (curScr() !== 'sGame' || ovOpen() || e.button > 0) return;
    const rk = e.target.closest('.rk'), cell = e.target.closest('.cell');
    if (rk && rk.dataset.k !== undefined && !rk.classList.contains('empty') && A.handFor !== A.me) drag = { src: 'rack', k: +rk.dataset.k, x: e.clientX, y: e.clientY, moved: false };
    else if (cell) { const i = +cell.dataset.i, p = pendAt(i); drag = { src: p ? 'pend' : 'cell', i, k: p ? p.k : -1, x: e.clientX, y: e.clientY, moved: false }; }
    else return;
    A.kbd = false;
  });
  addEventListener('pointermove', e => {
    if (!drag) return;
    if (!drag.moved) {
      if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 8 || drag.src === 'cell') return;
      drag.moved = true;
      const t = drag.src === 'rack' ? A.rk[drag.k] : pendAt(drag.i).t;
      const g = $('ghost'); g.innerHTML = '<div style="--cell:52px;width:52px;height:52px;position:relative">' + tileHtml(drag.src === 'rack' ? t : t) + '</div>'; g.hidden = false;
      if (drag.src === 'pend') { A.pend = A.pend.filter(p => p.i !== drag.i); drag.pt = t; render(); }
    }
    const g = $('ghost'); g.style.left = e.clientX + 'px'; g.style.top = e.clientY + 'px';
    const over = document.elementFromPoint(e.clientX, e.clientY), c = over && over.closest('.cell');
    cells.forEach(x => x.classList.remove('drop')); if (c && !A.V.board[+c.dataset.i] && !pendAt(+c.dataset.i)) c.classList.add('drop');
  }, { passive: true });
  addEventListener('pointerup', e => {
    const d = drag; drag = null; if (!d) return;
    $('ghost').hidden = true; cells.forEach(x => x.classList.remove('drop'));
    const over = document.elementFromPoint(e.clientX, e.clientY);
    const c = over && over.closest('.cell'), rk = over && over.closest('.rk'), inRack = over && over.closest('#rack');
    if (!d.moved) { // tippen
      if (d.src === 'rack') { A.sel = A.sel === d.k ? -1 : d.k; sfx('tap'); renderRack(); return; }
      if (d.src === 'pend') { recall(d.i); return; }
      if (!A.V || A.V.board[d.i]) return;
      if (A.sel >= 0 && !usedSlot(A.sel)) { A.cur = d.i; placeSlot(A.sel, d.i); return; }
      if (A.cur === d.i) A.dir = A.dir === 1 ? N : 1; A.cur = d.i; A.kbd = true; render(); return;
    }
    if (d.src === 'rack') {
      if (c) { const i = +c.dataset.i; A.cur = i; placeSlot(d.k, i); }
      else if (rk && rk.dataset.k !== undefined) moveSlot(d.k, +rk.dataset.k);
      else if (inRack) moveSlot(d.k, A.rk.length - 1);
      return;
    }
    if (d.src === 'pend') {
      if (c && canAct() && !A.V.board[+c.dataset.i] && !pendAt(+c.dataset.i)) { A.pend.push({ i: +c.dataset.i, t: d.pt, k: d.k }); sfx('place'); }
      else sfx('tap');
      render();
    }
  });
  addEventListener('pointercancel', () => { if (drag && drag.src === 'pend' && drag.moved) render(); drag = null; $('ghost').hidden = true; });

  /* ---------- Tastatur und Gamecontroller ---------- */
  const KEYL = (() => { const m = {}; WF.AL.split('').forEach((c, k) => { m[c] = k + 1; }); return m; })();
  function focusables(layer) { return Array.from(layer.querySelectorAll('button,input,select,a[href]')).filter(el => !el.disabled && el.offsetParent !== null); }
  function focusFirst(layer) { if (!layer) return; const f = focusables(layer); const p = f.find(el => el.classList.contains('pri')) || f[0]; if (p && !('ontouchstart' in window && !A.kbd)) try { p.focus({ preventScroll: true }); } catch (e) { } }
  function moveFocus(layer, dx, dy) {
    const f = focusables(layer); if (!f.length) return false;
    const a = document.activeElement;
    if (!f.includes(a)) { f[0].focus(); return true; }
    const r0 = a.getBoundingClientRect(), x0 = r0.left + r0.width / 2, y0 = r0.top + r0.height / 2;
    let best = null, bd = 1e9;
    for (const el of f) {
      if (el === a) continue; const r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, ddx = x - x0, ddy = y - y0;
      if (dx && Math.sign(ddx) !== dx) continue; if (dy && Math.sign(ddy) !== dy) continue;
      if (dx && Math.abs(ddx) < 4) continue; if (dy && Math.abs(ddy) < 4) continue;
      const d = dx ? Math.abs(ddx) + Math.abs(ddy) * 2.5 : Math.abs(ddy) + Math.abs(ddx) * 2.5;
      if (d < bd) { bd = d; best = el; }
    }
    if (best) best.focus();
    return true;
  }
  const ARROWS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
  addEventListener('keydown', e => {
    const tg = e.target, typing = tg && /^(INPUT|SELECT|TEXTAREA)$/.test(tg.tagName);
    const ov = ovOpen();
    if (ov) {
      if (ov.id === 'ovJoker' && e.key && e.key.length === 1 && KEYL[e.key.toUpperCase()]) { e.preventDefault(); closeOv('ovJoker'); const cb = jokerCb; jokerCb = null; if (cb) cb(KEYL[e.key.toUpperCase()]); return; }
      if (ARROWS[e.key] && !typing) { e.preventDefault(); moveFocus(ov, ARROWS[e.key][0], ARROWS[e.key][1]); return; }
      if (e.key === 'Escape' || e.key === 'Backspace' && !typing) {
        e.preventDefault();
        if (ov.id === 'ovHand') return;
        if (ov.id === 'ovJoker') jokerCb = null;
        if (ov.id === 'ovSet') { $('bSetX').click(); return; }
        if (ov.id === 'ovEnd') return;
        closeOv(ov.id); return;
      }
      if ((e.key === 'Enter' || e.key === ' ') && !ov.contains(document.activeElement)) { const b = ov.querySelector('.btn.pri') || ov.querySelector('button'); if (b) { e.preventDefault(); b.click(); } }
      return;
    }
    if (curScr() !== 'sGame') {
      if (typing) return;
      if (ARROWS[e.key]) { e.preventDefault(); moveFocus(document.querySelector('.scr.on'), ARROWS[e.key][0], ARROWS[e.key][1]); }
      else if (e.key === 'Escape' || e.key === 'Backspace') { const b = Array.from(document.querySelectorAll('.scr.on [id$="Back"]')).find(x => x.offsetParent); if (b) { e.preventDefault(); b.click(); } }
      return;
    }
    if (typing) return;
    const k = e.key;
    if (ARROWS[k]) {
      e.preventDefault(); A.kbd = true;
      let r = (A.cur / N) | 0, c = A.cur % N; const [dx, dy] = ARROWS[k];
      c = Math.max(0, Math.min(N - 1, c + dx)); r = Math.max(0, Math.min(N - 1, r + dy));
      A.cur = r * N + c; render(); scrollToCell(A.cur); return;
    }
    if (k === 'Tab') { e.preventDefault(); A.kbd = true; A.dir = A.dir === 1 ? N : 1; render(); return; }
    if (k === 'Escape') { e.preventDefault(); $('bMenu').click(); return; }
    if (A.handFor >= 0 && A.handFor === A.me) return;
    if (k === 'Enter') { if (tg && tg.tagName === 'BUTTON' && document.activeElement === tg && e.isTrusted) return; e.preventDefault(); submit(); return; }
    if (k === ' ') {
      if (tg && tg.tagName === 'BUTTON' && e.isTrusted) return;
      e.preventDefault(); A.kbd = true;
      if (pendAt(A.cur)) { recall(A.cur); return; }
      if (A.sel < 0 || usedSlot(A.sel)) { A.sel = A.rk.findIndex((_, j) => !usedSlot(j)); renderRack(); render(); return; }
      placeSlot(A.sel, A.cur); return;
    }
    if (k === 'Backspace') { e.preventDefault(); undoLast(); return; }
    if (k === 'Delete') { e.preventDefault(); recallAll(); return; }
    if (k === '-' || k === '+' || k === '=') {
      e.preventDefault(); const n = A.rk.length; if (!n) return; const st = k === '-' ? -1 : 1;
      let j = A.sel; for (let q = 0; q < n; q++) { j = ((j < 0 ? (st > 0 ? -1 : 0) : j) + st + n) % n; if (!usedSlot(j)) break; }
      A.sel = usedSlot(j) ? -1 : j; A.kbd = true; sfx('tap'); render(); return;
    }
    if (/^[1-7]$/.test(k)) { const j = +k - 1; if (j < A.rk.length && !usedSlot(j)) { A.sel = j; sfx('tap'); renderRack(); } e.preventDefault(); return; }
    if (k === '8') { e.preventDefault(); openSwap(); return; }
    if (k === '9') { e.preventDefault(); shuffleRack(); return; }
    if (k === '0') { e.preventDefault(); hint(); return; }
    if (k && k.length === 1 && KEYL[k.toUpperCase()] && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); A.kbd = true; typeLetter(KEYL[k.toUpperCase()]); }
  });

  /* ---------- Online (PeerJS-kompatibel, Vermittlung über ../cloud/fire-peer.js) ---------- */
  function mkNet(cb) {
    const ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789', PRE = 'wortfunk-', MAX = 4;
    const Nt = { role: '', code: '', peer: null, conns: new Map(), busy: false }; const libs = {};
    const load = (src, ok) => libs[src] || (libs[src] = new Promise((res, rej) => { if (ok()) return res(); const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => { delete libs[src]; rej(new Error('lib')); }; document.head.appendChild(s); }));
    Nt.loadPeer = () => load('../vendor/peerjs-1.5.4.min.js', () => !!window.Peer);
    Nt.loadQR = () => load('../vendor/qrcode-generator-1.4.4.js', () => !!window.qrcode);
    Nt.norm = s => Array.from(String(s || '').toUpperCase()).filter(c => ALPHA.includes(c)).join('').slice(0, 4);
    Nt.link = () => { const u = location.href.split('#')[0].split('?')[0] + '#join=' + Nt.code; return window.EasyGamesLink ? EasyGamesLink.share(u) : u; };
    const mkCode = () => { let c = ''; for (let i = 0; i < 4; i++) c += ALPHA[(Math.random() * ALPHA.length) | 0]; return c; };
    function reg(conn, onOpen) {
      conn.on('open', () => {
        if (Nt.role === 'host' && Nt.conns.size >= MAX) { try { conn.send({ t: 'full' }); } catch (e) { } setTimeout(() => conn.close(), 300); return; }
        Nt.conns.set(conn.peer, conn); if (onOpen) onOpen();
      });
      conn.on('data', d => { if (d && typeof d === 'object') cb.onMsg(conn.peer, d); });
      const gone = () => { if (Nt.conns.get(conn.peer) !== conn) return; Nt.conns.delete(conn.peer); cb.onLeave(conn.peer); };
      conn.on('close', gone); conn.on('error', gone);
    }
    Nt.host = async function () {
      if (Nt.busy) return; Nt.busy = true; Nt.close();
      try {
        await Nt.loadPeer();
        for (let k = 0; k < 6 && !Nt.peer; k++) {
          const code = mkCode();
          const ok = await new Promise(res => {
            const p = new Peer(PRE + code); let done = false;
            p.on('open', () => { done = true; Nt.peer = p; Nt.code = code; Nt.role = 'host'; res(true); });
            p.on('error', e => { if (!done) { done = true; try { p.destroy(); } catch (x) { } res(e && e.type === 'unavailable-id' ? false : 'err'); } else toast('Verbindung wackelt …'); });
          });
          if (ok === 'err') throw new Error('broker');
        }
        if (!Nt.peer) throw new Error('code');
        Nt.peer.on('connection', c => reg(c));
        Nt.peer.on('disconnected', () => { try { Nt.peer.reconnect(); } catch (e) { } });
        Nt.busy = false; return Nt.code;
      } catch (e) { Nt.busy = false; Nt.close(); throw e; }
    };
    Nt.join = async function (code) {
      if (Nt.busy) return; code = Nt.norm(code); if (code.length !== 4) throw new Error('code'); Nt.busy = true; Nt.close();
      try {
        await Nt.loadPeer();
        await new Promise((res, rej) => {
          const p = new Peer(); let done = false; const fail = m => { if (done) return; done = true; try { p.destroy(); } catch (x) { } rej(new Error(m)); }; setTimeout(() => fail('timeout'), 14000);
          p.on('error', e => { if (!done) fail(e && e.type === 'peer-unavailable' ? 'nocode' : 'broker'); else toast('Verbindung wackelt …'); });
          p.on('open', () => { Nt.peer = p; Nt.role = 'guest'; Nt.code = code; reg(p.connect(PRE + code, { reliable: true }), () => { if (done) return; done = true; res(); }); });
        });
        Nt.busy = false;
      } catch (e) { Nt.busy = false; Nt.close(); throw e; }
    };
    Nt.sendTo = (id, d) => { const c = Nt.conns.get(id); if (c && c.open) { try { c.send(d); } catch (e) { } } };
    Nt.send = d => { for (const [, c] of Nt.conns) if (c.open) { try { c.send(d); } catch (e) { } } };
    Nt.close = function () {
      for (const [, c] of Nt.conns) { try { c.close(); } catch (e) { } } Nt.conns.clear();
      if (Nt.peer) { try { Nt.peer.destroy(); } catch (e) { } } Nt.peer = null; Nt.role = ''; Nt.code = '';
    };
    return Nt;
  }
  const netErr = e => ({ nocode: 'Diesen Raum gibt es nicht (mehr). Code prüfen?', timeout: 'Keine Verbindung – bitte nochmal versuchen.', code: 'Bitte den 4-stelligen Code eingeben.' }[e && e.message] || 'Online ist gerade nicht erreichbar.');
  function myName() { return ($('onName').value || '').trim().slice(0, 14) || 'Spieler'; }
  function onlineScreen() {
    $('onName').value = LS.get('wortfunk-name', '') || '';
    $('onChoose').hidden = false; $('onLobby').hidden = true; $('onGuest').hidden = true; $('onBack').hidden = false;
    scr('sOnline'); focusFirst($('sOnline'));
  }
  $('bOnline').onclick = onlineScreen;
  $('bOnBack').onclick = () => { scr('sMenu'); focusFirst($('sMenu')); };
  $('joinCode').addEventListener('input', e => { e.target.value = (A.net || mkNet({})).norm(e.target.value); });

  // Gastgeber
  let lobby = [];   // [{ name, kind: 'host'|'guest'|'bot', id, level, online }]
  async function hostOpen(tv) {
    LS.set('wortfunk-name', myName());
    if (A.net) A.net.close();
    A.net = mkNet({ onMsg: hostMsg, onLeave: hostLeave });
    $('bHost').disabled = true;
    try {
      const code = await A.net.host();
      A.mode = 'lobby'; lobby = []; $('hostPlays').checked = !tv;
      $('onChoose').hidden = true; $('onLobby').hidden = false; $('onBack').hidden = true;
      $('lobCode').textContent = code; $('lobLink').textContent = A.net.link();
      A.net.loadQR().then(() => { const q = qrcode(0, 'M'); q.addData(A.net.link()); q.make(); $('lobQr').innerHTML = '<img alt="QR-Code zum Beitreten" src="' + q.createDataURL(5, 0) + '">'; }).catch(() => { $('lobQr').textContent = code; });
      renderLobby(); keepAwake(); focusFirst($('onLobby'));
    } catch (e) { toast(netErr(e), 'bad'); if (A.net) A.net.close(); A.net = null; }
    $('bHost').disabled = false;
  }
  $('bHost').onclick = () => hostOpen(false);
  function lobbySeats() {
    const s = [];
    if ($('hostPlays').checked) s.push({ name: myName(), kind: 'host' });
    return s.concat(lobby);
  }
  function renderLobby() {
    const s = lobbySeats();
    $('lobSeats').innerHTML = s.map((p, k) => '<div class="pl"><span class="dot" style="width:12px;height:12px;border-radius:50%;background:' + COLORS[k] + '"></span>' +
      (p.kind === 'bot' ? '🤖 ' : p.kind === 'guest' ? '📱 ' : '📺 ') + esc(p.name) + (p.kind === 'bot' ? ' <small class="hint">(' + p.level + ')</small>' : '') +
      (p.kind === 'bot' ? '<button class="btn small rm" data-k="' + (k - (s.length - lobby.length)) + '">✕</button>' : '') + '</div>').join('') || '<p class="hint">Noch niemand da – scanne den QR-Code mit dem Handy.</p>';
    $('bAddBot').disabled = s.length >= 4;
    $('bLobStart').disabled = s.length < 2;
    $('lobInfo').textContent = s.length < 2 ? 'Mindestens 2 Spieler nötig (Handys oder Computer).' : s.length + ' von 4 Plätzen belegt.';
    if (A.net) A.net.send({ t: 'lobby', names: s.map(p => p.name), code: A.net.code });
  }
  $('hostPlays').onchange = () => { if (lobbySeats().length > 4) { $('hostPlays').checked = false; toast('Alle 4 Plätze sind belegt', 'bad'); } renderLobby(); };
  $('lobSeats').onclick = e => { const b = e.target.closest('.rm'); if (!b) return; const k = +b.dataset.k; if (lobby[k] && lobby[k].kind === 'bot') { lobby.splice(k, 1); renderLobby(); } };
  $('bAddBot').onclick = () => { if (lobbySeats().length >= 4) return; const n = lobby.filter(p => p.kind === 'bot').length; lobby.push({ name: BOTS[n % BOTS.length], kind: 'bot', level: ['mittel', 'leicht', 'schwer'][n % 3] }); renderLobby(); };
  $('bCopy').onclick = () => { const l = A.net && A.net.link(); if (!l) return; (navigator.clipboard ? navigator.clipboard.writeText(l) : Promise.reject()).then(() => toast('Link kopiert', 'ok')).catch(() => toast(l)); };
  $('bLobBack').onclick = () => { if (A.net) { A.net.send({ t: 'bye' }); A.net.close(); } A.net = null; A.mode = ''; onlineScreen(); };
  $('bLobStart').onclick = hostStart;
  function uniqueName(n) { n = String(n || 'Gast').trim().slice(0, 14) || 'Gast'; const all = lobbySeats().map(p => p.name.toLowerCase()); let x = n, k = 2; while (all.includes(x.toLowerCase())) x = n.slice(0, 12) + ' ' + k++; return x; }
  function hostStart() {
    const s = lobbySeats(); if (s.length < 2) return;
    A.mode = 'host'; A.gameId++; A.seats = s.map(p => Object.assign({}, p, { online: p.kind === 'guest' ? !!(A.net && A.net.conns.has(p.id)) : undefined }));
    A.G = WF.newGame(A.seats.map(p => p.name)); A.hints = {}; A.rkBy = {}; A.rk = []; A.rkSeat = -2; A.handFor = -1; A.busy = false;
    scr('sGame'); refreshView(); broadcast(); nextTurn();
  }
  const seatsPublic = () => A.seats.map(s => ({ name: s.name, kind: s.kind === 'host' ? 'host' : s.kind, online: s.online !== false }));
  function broadcast() {
    if (!A.net || !A.G) return;
    A.seats.forEach((s, k) => { if (s.kind === 'guest' && s.online && s.id) A.net.sendTo(s.id, { t: 'state', v: WF.publicView(A.G, k), seats: seatsPublic() }); });
  }
  function hostMsg(id, d) {
    if (d.t === 'hello') {
      if (A.mode === 'lobby') {
        if (lobbySeats().length >= 4) { A.net.sendTo(id, { t: 'full' }); return; }
        lobby.push({ name: uniqueName(d.name), kind: 'guest', id }); sfx('turn'); renderLobby(); return;
      }
      if (A.mode === 'host' && A.G) {
        const nm = String(d.name || '').toLowerCase();
        let k = A.seats.findIndex(s => s.kind === 'guest' && !s.online && s.name.toLowerCase() === nm);
        if (k < 0) k = A.seats.findIndex(s => s.kind === 'guest' && !s.online);
        if (k < 0) { A.net.sendTo(id, { t: 'busy' }); return; }
        A.seats[k].id = id; A.seats[k].online = true; toast(A.seats[k].name + ' ist wieder da', 'ok');
        broadcast(); render(); return;
      }
      return;
    }
    const k = A.seats.findIndex(s => s.id === id && s.kind === 'guest');
    if (k < 0 || !A.G || A.mode !== 'host') return;
    let r = { ok: false, err: 'Unbekannter Zug' };
    if (A.G.turn !== k) r = { ok: false, err: 'Du bist nicht dran.' };
    else if (d.t === 'play' && Array.isArray(d.tiles)) r = doPlay(k, d.tiles.map(x => ({ i: x.i | 0, t: x.t | 0 })));
    else if (d.t === 'swap' && Array.isArray(d.letters)) r = doSwap(k, d.letters.map(x => x | 0));
    else if (d.t === 'pass') r = doPass(k);
    if (!r.ok) { A.net.sendTo(id, { t: 'err', m: r.err }); A.net.sendTo(id, { t: 'state', v: WF.publicView(A.G, k), seats: seatsPublic() }); }
  }
  function hostLeave(id) {
    if (A.mode === 'lobby') { const k = lobby.findIndex(p => p.id === id); if (k >= 0) { lobby.splice(k, 1); renderLobby(); } return; }
    if (A.mode !== 'host' || !A.G) return;
    const k = A.seats.findIndex(s => s.id === id);
    if (k < 0) return;
    A.seats[k].online = false; A.seats[k].id = null;
    toast(A.seats[k].name + ' ist offline – der Computer spielt für sie/ihn weiter', 'bad');
    render();
    if (A.G.turn === k && !A.G.over) nextTurn();
  }

  // Mitspieler
  async function guestJoin(code) {
    const name = myName(); LS.set('wortfunk-name', name); A.guestName = name;
    if (A.net) A.net.close();
    A.net = mkNet({ onMsg: guestMsg, onLeave: guestLeave });
    $('bJoin').disabled = true;
    try {
      await A.net.join(code);
      A.mode = 'guestLobby';
      A.net.send({ t: 'hello', name });
      $('onChoose').hidden = true; $('onGuest').hidden = false; $('onBack').hidden = true;
      $('guestCode').textContent = A.net.code; $('guestInfo').textContent = 'Verbunden – warte auf den Start …'; $('guestSeats').innerHTML = '';
      scr('sOnline'); keepAwake(); focusFirst($('onGuest'));
    } catch (e) { toast(netErr(e), 'bad'); if (A.net) A.net.close(); A.net = null; }
    $('bJoin').disabled = false;
  }
  $('bJoin').onclick = () => guestJoin($('joinCode').value);
  $('bGuestBack').onclick = () => { if (A.net) A.net.close(); A.net = null; A.mode = ''; onlineScreen(); };
  function guestMsg(id, d) {
    if (d.t === 'lobby') { $('guestSeats').innerHTML = d.names.map((n, k) => '<div class="pl"><span style="width:12px;height:12px;border-radius:50%;background:' + COLORS[k] + '"></span>' + esc(n) + '</div>').join(''); return; }
    if (d.t === 'full') { toast('Der Raum ist voll (4 Spieler).', 'bad'); return; }
    if (d.t === 'busy') { toast('Die Partie läuft schon – alle Plätze sind besetzt.', 'bad'); return; }
    if (d.t === 'bye') { toast('Der Raum wurde geschlossen.', 'bad'); quit(); return; }
    if (d.t === 'err') { A.busy = false; clearTimeout(guestT); toast(d.m || 'Ungültiger Zug', 'bad'); sfx('bad'); return; }
    if (d.t === 'state' && d.v) {
      const first = A.mode !== 'guest', prev = A.V;
      A.mode = 'guest'; A.busy = false; clearTimeout(guestT);
      A.seats = d.seats || []; A.V = d.v;
      if (first) { A.gameId++; A.rkBy = {}; A.rk = []; A.rkSeat = -2; A.hints = {}; scr('sGame'); closeOv('ovEnd'); }
      const changed = !prev || prev.moves !== d.v.moves || first || prev.over !== d.v.over;
      if (changed) { A.me = d.v.me; A.pend = []; A.sel = -1; syncRack(); }
      render();
      if (changed && !first && d.v.last && d.v.last.p !== d.v.me) {
        const l = d.v.last, n = d.v.names[l.p];
        toast(l.k === 'play' ? n + ': ' + l.words.map(w => w[0]).join(', ') + ' +' + l.score : n + (l.k === 'swap' ? ' tauscht' : ' passt'), 'ok');
      }
      if (changed && d.v.turn === d.v.me && !d.v.over) sfx('turn');
      if (d.v.over && (!prev || !prev.over)) setTimeout(showEnd, 600);
      else if (!d.v.over && prev && prev.over) closeOv('ovEnd');
    }
  }
  function guestLeave() {
    if (A.mode === 'guest' || A.mode === 'guestLobby') { toast('Verbindung zum Raum verloren.', 'bad'); const c = A.net && A.net.code; quit(); onlineScreen(); if (c) $('joinCode').value = c; }
  }
  let wake = null;
  function keepAwake() { try { if (navigator.wakeLock && !wake) navigator.wakeLock.request('screen').then(w => { wake = w; w.addEventListener('release', () => { wake = null; }); }).catch(() => { }); } catch (e) { } }

  /* ---------- Start ---------- */
  function menuUpdate() { const s = LS.get('wortfunk-save', null); $('bResume').hidden = !(s && s.G && !s.G.over); menuStat(); }
  if (window.self !== window.top) $('backLink').hidden = true;
  menuUpdate();
  ['bNew', 'bOnline', 'bResume'].forEach(id => { $(id).disabled = true; });
  function onReady() {
    ['bNew', 'bOnline', 'bResume'].forEach(id => { $(id).disabled = false; });
    focusFirst($('sMenu'));
    const q = location.search + location.hash, m = /[?#&]join=([A-Za-z0-9]{4})/.exec(q);
    if (m) {
      onlineScreen(); $('joinCode').value = m[1].toUpperCase();
      if (!$('onName').value) $('onName').value = 'Spieler ' + (10 + ((Math.random() * 90) | 0));
      guestJoin(m[1]); return;
    }
    if (/[?&]tv(=1)?(&|$)/.test(location.search)) { onlineScreen(); hostOpen(true); }
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden && (A.mode === 'host' || A.mode === 'lobby')) { wake = null; keepAwake(); } });
  addEventListener('pagehide', () => { if (A.net && (A.mode === 'host' || A.mode === 'lobby')) A.net.send({ t: 'bye' }); });
})();
