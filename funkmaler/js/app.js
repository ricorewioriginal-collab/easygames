/* Funkmaler – Bildschirm (Gastgeber), Handys (Mitspieler) und „Ein Gerät“.
 * Verbindung wie in allen easygames-Mehrspielerspielen: ../cloud/fire-peer.js stellt eine PeerJS-kompatible Klasse bereit
 * (Vermittlung über Firebase, gespielt wird direkt Gerät zu Gerät). Einladung: ?join=CODE über EasyGamesLink.share (easygames-Homepage).
 * Handy → Bildschirm: hi{cid,name} ping pick{i} ln{id,c,s,p} undo clr guess{g}
 * Bildschirm → Handy: you{pid} st{s} opts{w} word{w} ln undo clr board{ops} res{r,pts} full bye */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
  };
  const P = 'funkmaler-';
  const SET = Object.assign({ sound: true }, LS.get(P + 'settings', {}));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let toastT = 0;
  function toast(m) { const t = $('toast'); t.textContent = m; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2600); }
  const AV = ['#00E5FF', '#FF2D95', '#FFC94D', '#2EE6A0', '#B28BFF', '#FF8A1F', '#7FE8FF', '#FF7AC8'];
  const PEN = ['#111111', '#ffffff', '#8a8a8a', '#e8213f', '#ff8a1f', '#ffd600', '#2ecc40', '#0a7a2f', '#4fc3ff', '#1f4ed8', '#8b2fc9', '#ff6fb5', '#8a5a2b', '#f2c9a0'];
  const SIZES = [5, 12, 26];
  const av = (p) => '<span class="av" style="background:' + AV[p.col % AV.length] + '">' + esc((p.name || '?').charAt(0).toUpperCase()) + '</span>';
  const scr = id => document.querySelectorAll('.scr').forEach(s => s.classList.toggle('on', s.id === id));
  const ovs = () => Array.from(document.querySelectorAll('.ov')).find(o => !o.hidden);
  const html = (el, h) => { if (el._h !== h) { el.innerHTML = h; el._h = h; return true; } return false; }; // nur neu zeichnen, wenn sich etwas ändert

  /* ---------- Ton ---------- */
  let AC = null;
  function sfx(k) {
    if (!SET.sound) return;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume();
      const seq = { join: [[660, .08], [880, .12]], ok: [[523, .08], [659, .08], [784, .16]], close: [[600, .1]], tick: [[1200, .03]], reveal: [[392, .12], [523, .2]], end: [[523, .1], [659, .1], [784, .1], [1047, .3]], turn: [[880, .07], [1175, .1]] }[k] || [];
      let t = AC.currentTime;
      for (const [f, d] of seq) { const o = AC.createOscillator(), g = AC.createGain(); o.type = 'triangle'; o.frequency.value = f; g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.12, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + d + .02); t += d * .9; }
    } catch (e) { }
  }
  let wake = null;
  function keepAwake() { try { if (navigator.wakeLock && !wake) navigator.wakeLock.request('screen').then(w => { wake = w; w.addEventListener('release', () => { wake = null; }); }).catch(() => { }); } catch (e) { } }
  document.addEventListener('visibilitychange', () => { if (!document.hidden && (H.net || G.net)) keepAwake(); });

  /* ---------- Malfläche (800×600 logisch) ---------- */
  function Board(canvas) {
    const g = canvas.getContext('2d'); let ops = [];
    g.lineCap = 'round'; g.lineJoin = 'round';
    function bg() { g.fillStyle = '#fff'; g.fillRect(0, 0, 800, 600); }
    function seg(op, from) {
      const p = op.p; if (p.length < 2) return;
      g.strokeStyle = PEN[op.c] || '#111'; g.lineWidth = op.s; g.fillStyle = g.strokeStyle;
      if (p.length === 2) { g.beginPath(); g.arc(p[0], p[1], op.s / 2, 0, 6.28); g.fill(); return; }
      g.beginPath(); const s = Math.max(0, from - 2); g.moveTo(p[s], p[s + 1]);
      for (let i = s + 2; i < p.length; i += 2) g.lineTo(p[i], p[i + 1]);
      g.stroke();
    }
    function redraw() { bg(); for (const op of ops) seg(op, 0); }
    bg();
    return {
      ops: () => ops,
      set(list) { ops = (list || []).map(o => ({ id: o.id, c: o.c | 0, s: Math.min(40, Math.max(1, o.s | 0)), p: (o.p || []).map(v => Math.round(+v || 0)) })); redraw(); },
      line(m) { // neuer Strich oder Fortsetzung
        const pts = (m.p || []).map(v => Math.max(-20, Math.min(820, Math.round(+v || 0)))); if (!pts.length) return;
        let op = ops.find(o => o.id === m.id);
        if (!op) { op = { id: m.id, c: m.c | 0, s: Math.min(40, Math.max(1, m.s | 0)), p: [] }; ops.push(op); }
        const from = op.p.length; op.p.push(...pts); seg(op, from);
      },
      undo() { ops.pop(); redraw(); }, clear() { ops = []; redraw(); }, redraw,
      png() { return canvas.toDataURL('image/png'); }
    };
  }
  function thumb(ops) { const c = document.createElement('canvas'); c.width = 800; c.height = 600; const b = Board(c); b.set(ops); return c; }
  // Malen mit Finger/Maus; meldet Striche gebündelt (alle 40 ms)
  function Pen(canvas, board, send) {
    const st = { c: 0, s: 1, on: false };
    let cur = null, buf = [], timer = 0, n = 0;
    const pos = e => { const r = canvas.getBoundingClientRect(); return [Math.round((e.clientX - r.left) / r.width * 800), Math.round((e.clientY - r.top) / r.height * 600)]; };
    const flush = () => { timer = 0; if (!cur || !buf.length) return; send({ t: 'ln', id: cur.id, c: cur.c, s: cur.s, p: buf }); buf = []; };
    canvas.addEventListener('pointerdown', e => {
      if (!st.on) return; e.preventDefault(); try { canvas.setPointerCapture(e.pointerId); } catch (x) { }
      cur = { id: Date.now().toString(36) + (n++), c: st.c, s: SIZES[st.s] * (st.c === 1 ? 1.6 : 1) | 0 };
      const p = pos(e); board.line({ id: cur.id, c: cur.c, s: cur.s, p }); buf = p.slice(); flush();
    });
    canvas.addEventListener('pointermove', e => {
      if (!cur || !st.on) return;
      const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      for (const q of evs.length ? evs : [e]) { const p = pos(q); board.line({ id: cur.id, p }); buf.push(p[0], p[1]); }
      if (!timer) timer = setTimeout(flush, 40);
    });
    const up = () => { if (cur) { flush(); cur = null; } };
    canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
    return st;
  }
  function tools(box, st, onUndo, onClear) {
    let armed = 0;
    function render() {
      box.innerHTML = PEN.map((c, i) => i === 1 ? '' : '<button class="col' + (st.c === i ? ' on' : '') + '" data-c="' + i + '" style="background:' + c + '" aria-label="Farbe"></button>').join('') +
        '<span class="sep"></span>' + SIZES.map((s, i) => '<button class="sz' + (st.s === i && st.c !== 1 ? ' on' : '') + '" data-s="' + i + '">' + ['•', '●', '⬤'][i] + '</button>').join('') +
        '<button class="tl' + (st.c === 1 ? ' on' : '') + '" data-t="er">🧽 Radierer</button><button class="tl" data-t="un">↶</button><button class="tl" data-t="cl">' + (armed ? 'Sicher?' : '🗑') + '</button>';
    }
    box.onclick = e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.c) { st.c = +b.dataset.c; st.last = st.c; }
      else if (b.dataset.s) { st.s = +b.dataset.s; if (st.c === 1) st.c = st.last || 0; }
      else if (b.dataset.t === 'er') st.c = st.c === 1 ? (st.last || 0) : 1;
      else if (b.dataset.t === 'un') onUndo();
      else if (b.dataset.t === 'cl') { if (Date.now() - armed < 2500) { armed = 0; onClear(); } else { armed = Date.now(); setTimeout(() => { armed = 0; render(); }, 2500); } }
      render();
    };
    render();
  }

  /* ---------- Verbindung (PeerJS-kompatibel über ../cloud/fire-peer.js) ---------- */
  function mkNet(cb) {
    const ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789', PRE = 'funkmaler-', MAX = 12;
    const N = { role: '', code: '', peer: null, conns: new Map(), busy: false }; const libs = {};
    const load = (src, ok) => libs[src] || (libs[src] = new Promise((res, rej) => { if (ok()) return res(); const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => { delete libs[src]; rej(new Error('lib')); }; document.head.appendChild(s); }));
    N.loadPeer = () => load('../vendor/peerjs-1.5.4.min.js', () => !!window.Peer);
    N.loadQR = () => load('../vendor/qrcode-generator-1.4.4.js', () => !!window.qrcode);
    N.norm = s => Array.from(String(s || '').toUpperCase()).filter(c => ALPHA.includes(c)).join('').slice(0, 4);
    N.link = () => { const u = location.href.split('#')[0].split('?')[0] + '?join=' + N.code; return window.EasyGamesLink ? EasyGamesLink.share(u) : u; };
    const mkCode = () => { let c = ''; for (let i = 0; i < 4; i++) c += ALPHA[(Math.random() * ALPHA.length) | 0]; return c; };
    function reg(conn, onOpen) {
      conn.on('open', () => {
        if (N.role === 'host' && N.conns.size >= MAX) { try { conn.send({ t: 'full' }); } catch (e) { } setTimeout(() => conn.close(), 300); return; }
        N.conns.set(conn.peer, conn); if (onOpen) onOpen();
      });
      conn.on('data', d => { if (d && typeof d === 'object') cb.onMsg(conn.peer, d); });
      const gone = () => { if (N.conns.get(conn.peer) !== conn) return; N.conns.delete(conn.peer); cb.onLeave(conn.peer); };
      conn.on('close', gone); conn.on('error', gone);
    }
    N.host = async function () {
      N.close(); await N.loadPeer();
      for (let k = 0; k < 6 && !N.peer; k++) {
        const code = mkCode();
        const ok = await new Promise(res => {
          const p = new Peer(PRE + code); let done = false;
          p.on('open', () => { done = true; N.peer = p; N.code = code; N.role = 'host'; res(true); });
          p.on('error', e => { if (!done) { done = true; try { p.destroy(); } catch (x) { } res(e && e.type === 'unavailable-id' ? false : 'err'); } else if (cb.onStatus) cb.onStatus(e); });
        });
        if (ok === 'err') throw new Error('broker');
      }
      if (!N.peer) throw new Error('code');
      N.peer.on('connection', c => reg(c));
      N.peer.on('disconnected', () => { try { N.peer.reconnect(); } catch (e) { } });
      return N.code;
    };
    N.join = async function (code) {
      code = N.norm(code); if (code.length !== 4) throw new Error('code'); N.close();
      await N.loadPeer();
      await new Promise((res, rej) => {
        const p = new Peer(); let done = false; const fail = m => { if (done) return; done = true; try { p.destroy(); } catch (x) { } rej(new Error(m)); }; setTimeout(() => fail('timeout'), 14000);
        p.on('error', e => { if (!done) fail(e && e.type === 'peer-unavailable' ? 'nocode' : 'broker'); });
        p.on('open', () => { N.peer = p; N.role = 'guest'; N.code = code; reg(p.connect(PRE + code, { reliable: true }), () => { if (done) return; done = true; res(); }); });
      });
    };
    N.sendTo = (id, d) => { const c = N.conns.get(id); if (c && c.open) { try { c.send(d); } catch (e) { } } };
    N.send = d => { for (const [, c] of N.conns) if (c.open) { try { c.send(d); } catch (e) { } } };
    N.close = () => { for (const [, c] of N.conns) { try { c.close(); } catch (e) { } } N.conns.clear(); if (N.peer) { try { N.peer.destroy(); } catch (e) { } } N.peer = null; N.role = ''; N.code = ''; };
    return N;
  }
  const netErr = e => ({ nocode: 'Diesen Raum gibt es nicht (mehr). Steht der Code richtig auf dem Fernseher?', timeout: 'Keine Verbindung – bitte nochmal versuchen.', code: 'Bitte den 4-stelligen Code vom Fernseher eingeben.' }[e && e.message] || 'Online ist gerade nicht erreichbar. Prüfe das Internet und versuche es nochmal.');

  /* =================================================================
   * Bildschirm (Gastgeber)
   * ================================================================= */
  const H = { net: null, players: [], phase: 'lobby', round: 0, rounds: 2, time: 80, level: 'mittel', turns: [], turnIdx: 0, drawer: null, word: null, opts: [], left: 0, total: 0,
    plan: [], shown: [], guessed: new Map(), feed: [], gallery: [], used: [], last: 0, board: null, offT: 0, nextPid: 1 };
  async function hostOpen() {
    scr('hLobby'); $('code').textContent = '····'; $('url').textContent = 'Raum wird eröffnet …'; $('qr').textContent = '…';
    if (H.net) H.net.close();
    H.net = mkNet({ onMsg: hostMsg, onLeave: hostLeave });
    H.board = H.board || Board($('hBoard'));
    try {
      const code = await H.net.host();
      $('code').textContent = code; $('url').textContent = H.net.link();
      H.net.loadQR().then(() => { const q = qrcode(0, 'M'); q.addData(H.net.link()); q.make(); $('qr').innerHTML = q.createSvgTag({ cellSize: 4, margin: 0, scalable: true }); }).catch(() => { $('qr').textContent = code; });
      H.phase = 'lobby'; renderLobby(); keepAwake(); focusEl($('bStart'));
    } catch (e) { $('url').textContent = netErr(e); toast(netErr(e)); }
  }
  const online = () => H.players.filter(p => p.on);
  const byPid = pid => H.players.find(p => p.pid === pid);
  function renderLobby() {
    const n = H.players.length;
    $('pCount').textContent = online().length + '/8';
    html($('lobPlayers'), n ? H.players.map(p => '<div class="pl' + (p.on ? '' : ' off') + '">' + av(p) + esc(p.name) + (p.on ? '' : ' (weg)') + '</div>').join('') : '<p class="hint">Noch niemand da – scannt den QR-Code!</p>');
    const ok = online().length >= 2;
    $('bStart').disabled = !ok; $('lobInfo').textContent = ok ? online().length + ' Spieler bereit – los geht\'s!' : 'Mindestens 2 Handys nötig' + (n === 1 ? ' – noch einer!' : '.');
  }
  function uniqueName(n) { n = FM.clean(n, 14) || 'Gast'; let x = n, k = 2; while (H.players.some(p => p.on && p.name.toLowerCase() === x.toLowerCase())) x = n.slice(0, 11) + ' ' + k++; return x; }
  function hostMsg(peer, d) {
    let p = H.players.find(x => x.peer === peer);
    if (d.t === 'hi') {
      const cid = FM.clean(d.cid, 40);
      p = H.players.find(x => cid && x.cid === cid);
      if (p) { p.peer = peer; p.on = true; p.seen = Date.now(); addFeed('sys', p.name + ' ist wieder da'); }
      else {
        if (online().length >= 8) { H.net.sendTo(peer, { t: 'full' }); return; }
        p = { pid: H.nextPid++, cid, name: uniqueName(d.name), col: H.players.length, score: 0, on: true, peer, seen: Date.now() };
        H.players.push(p); addFeed('sys', p.name + ' ist dabei'); sfx('join');
      }
      H.net.sendTo(peer, { t: 'you', pid: p.pid });
      H.net.sendTo(peer, { t: 'board', ops: H.board.ops() });
      if (p.pid === H.drawer) { if (H.phase === 'choose') H.net.sendTo(peer, { t: 'opts', w: H.opts.map(FM.show) }); if (H.phase === 'draw') H.net.sendTo(peer, { t: 'word', w: FM.show(H.word) }); }
      if (H.phase === 'lobby') renderLobby();
      broadcast(); return;
    }
    if (!p) return;
    p.seen = Date.now(); if (!p.on) { p.on = true; broadcast(); }
    if (d.t === 'ping') return;
    if (d.t === 'guess') { guess(p, FM.clean(d.g, 40)); return; }
    if (p.pid !== H.drawer) return;
    if (d.t === 'pick' && H.phase === 'choose') { pick(d.i | 0); return; }
    if (H.phase !== 'draw') return;
    if (d.t === 'ln' && Array.isArray(d.p) && d.p.length <= 2000) { const m = { t: 'ln', id: FM.clean(d.id, 24), c: d.c | 0, s: d.s | 0, p: d.p }; H.board.line(m); forward(m, p); }
    else if (d.t === 'undo') { H.board.undo(); forward({ t: 'undo' }, p); }
    else if (d.t === 'clr') { H.board.clear(); forward({ t: 'clr' }, p); }
  }
  function forward(m, from) { for (const q of H.players) if (q.on && q.peer && q !== from) H.net.sendTo(q.peer, m); }
  function hostLeave(peer) {
    const p = H.players.find(x => x.peer === peer); if (!p) return;
    p.on = false; p.peer = null;
    if (H.phase === 'lobby') { H.players = H.players.filter(x => x !== p || x.score > 0); H.players.forEach((x, i) => { x.col = i; }); renderLobby(); }
    else addFeed('sys', p.name + ' ist offline');
    broadcast();
  }
  setInterval(() => { // Handys, die sich nicht mehr melden, als offline zeigen
    if (!H.net) return; const now = Date.now(); let ch = false;
    for (const p of H.players) if (p.on && now - p.seen > 16000) { p.on = false; ch = true; addFeed('sys', p.name + ' antwortet nicht'); }
    if (ch) { if (H.phase === 'lobby') renderLobby(); broadcast(); }
  }, 3000);
  function addFeed(k, txt) { H.feed.push({ k, txt }); if (H.feed.length > 30) H.feed.shift(); }

  // Ablauf
  function hostStart() {
    if (online().length < 2) return;
    H.rounds = +$('setRounds').value; H.time = +$('setTime').value; H.level = $('setLevel').value;
    H.players = H.players.filter(p => p.on); H.players.forEach((p, i) => { p.score = 0; p.col = i; });
    H.round = 1; H.used = []; H.gallery = []; H.feed = []; buildTurns(); H.turnIdx = 0;
    scr('hGame'); addFeed('sys', 'Los geht\'s! Wer malt, sieht das Wort auf dem Handy – alle anderen raten auf ihrem Handy.');
    nextTurn();
  }
  function buildTurns() { H.turns = online().map(p => p.pid); }
  function nextTurn() {
    if (H.turnIdx >= H.turns.length) { H.round++; if (H.round > H.rounds) { final(); return; } buildTurns(); H.turnIdx = 0; }
    if (!H.turns.length) { final(); return; }
    const pid = H.turns[H.turnIdx++], p = byPid(pid);
    if (!p || !p.on) { nextTurn(); return; }
    H.drawer = pid; H.phase = 'choose'; H.opts = FM.pickWords(H.level, 3, H.used, Math.random); H.left = 15; H.total = 15; H.last = Date.now();
    H.board.clear(); H.guessed = new Map(); H.word = null;
    H.net.sendTo(p.peer, { t: 'opts', w: H.opts.map(FM.show) });
    forward({ t: 'clr' }, null);
    sfx('turn'); broadcast();
  }
  function pick(i) {
    if (H.phase !== 'choose') return;
    H.word = H.opts[Math.max(0, Math.min(2, i))]; H.used.push(FM.show(H.word));
    H.phase = 'draw'; H.total = H.left = H.time; H.last = Date.now(); H.plan = FM.hintPlan(H.word, Date.now()); H.shown = [];
    const d = byPid(H.drawer); if (d && d.peer) H.net.sendTo(d.peer, { t: 'word', w: FM.show(H.word) });
    addFeed('sys', '🎨 ' + (d ? d.name : '?') + ' malt jetzt'); broadcast();
  }
  function guess(p, text) {
    if (!text || H.phase !== 'draw' || p.pid === H.drawer || H.guessed.has(p.pid)) return;
    const r = FM.check(text, H.word);
    if (r === 'ok') {
      const pts = FM.guessPoints(H.left, H.total, H.guessed.size); p.score += pts; H.guessed.set(p.pid, pts);
      addFeed('ok', '✓ ' + p.name + ' hat es erraten!'); H.net.sendTo(p.peer, { t: 'res', r: 'ok', pts, w: FM.show(H.word) }); sfx('ok');
      const need = online().filter(q => q.pid !== H.drawer).length;
      if (H.guessed.size >= need) setTimeout(() => { if (H.phase === 'draw') reveal(); }, 900);
    } else if (r === 'knapp') { addFeed('close', p.name + ' ist knapp dran!'); H.net.sendTo(p.peer, { t: 'res', r: 'knapp' }); sfx('close'); }
    else { addFeed('', p.name + ': ' + text); H.net.sendTo(p.peer, { t: 'res', r: 'nein' }); }
    broadcast();
  }
  function reveal(reason) {
    if (H.phase !== 'draw' && H.phase !== 'choose') return;
    const d = byPid(H.drawer), guessers = H.players.filter(q => q.pid !== H.drawer && (q.on || H.guessed.has(q.pid))).length;
    let dp = 0; if (H.word && d) { dp = FM.drawerPoints(H.guessed.size, guessers); d.score += dp; }
    H.reveal = { word: H.word ? FM.show(H.word) : '–', gains: [...H.guessed].map(([pid, pts]) => [byPid(pid).name, pts]).concat(dp ? [[d.name + ' 🎨', dp]] : []), reason: reason || '' };
    if (H.word && H.board.ops().length) H.gallery.push({ word: FM.show(H.word), by: d ? d.name : '', ops: JSON.parse(JSON.stringify(H.board.ops())) });
    H.phase = 'reveal'; H.left = H.total = 7; H.last = Date.now(); sfx('reveal'); broadcast();
  }
  function final() {
    H.phase = 'final'; H.left = 0; sfx('end');
    const rank = H.players.slice().sort((a, b) => b.score - a.score);
    H.final = rank.map(p => [p.name, p.score, p.col]);
    const st = LS.get(P + 'stats', { games: 0, wins: 0 }); st.games++; LS.set(P + 'stats', st);
    broadcast();
  }
  function tick() {
    if (!H.net || H.phase === 'lobby' || H.phase === 'final') return;
    const now = Date.now(), dt = (now - H.last) / 1000; H.last = now; H.left = Math.max(0, H.left - dt);
    if (H.phase === 'choose') { const d = byPid(H.drawer); if (!d || !d.on) { H.offT += dt; if (H.offT > 8) { H.offT = 0; addFeed('sys', (d ? d.name : 'Maler') + ' ist weg – nächste Runde'); H.reveal = { word: '–', gains: [], reason: (d ? d.name : 'Der Maler') + ' ist offline.' }; H.phase = 'reveal'; H.left = H.total = 3; broadcast(); } } else H.offT = 0; if (H.left <= 0 && H.phase === 'choose') pick((Math.random() * 3) | 0); }
    else if (H.phase === 'draw') {
      const el = 1 - H.left / H.total, need = [.4, .6, .8];
      H.plan.forEach((ix, k) => { if (el >= need[k] && !H.shown.includes(ix)) { H.shown.push(ix); broadcast(); } });
      const d = byPid(H.drawer); if (!d || !d.on) { H.offT += dt; if (H.offT > 12) { H.offT = 0; reveal('Der Maler ist offline.'); return; } } else H.offT = 0;
      if (H.left <= 10 && Math.ceil(H.left) !== Math.ceil(H.left + dt)) sfx('tick');
      if (H.left <= 0) { reveal(); return; }
    } else if (H.phase === 'reveal' && H.left <= 0) { nextTurn(); return; }
    if (Math.floor(H.left + dt) !== Math.floor(H.left)) broadcast();
    renderTimer();
  }
  setInterval(tick, 250);
  function pub(pid) {
    const d = byPid(H.drawer);
    return {
      phase: H.phase, round: H.round, rounds: H.rounds, drawer: H.drawer, drawerName: d ? d.name : '', left: Math.ceil(H.left), total: H.total,
      hint: H.word ? FM.hint(H.word, H.shown) : '', len: H.word ? Array.from(FM.show(H.word).replace(/[\s-]/g, '')).length : 0,
      players: H.players.map(p => ({ pid: p.pid, name: p.name, col: p.col, score: p.score, on: p.on, ok: H.guessed.has(p.pid), dr: p.pid === H.drawer })),
      feed: H.feed.slice(-8), reveal: H.phase === 'reveal' ? H.reveal : null, final: H.phase === 'final' ? H.final : null, me: pid, myOk: H.guessed.has(pid), code: H.net ? H.net.code : ''
    };
  }
  function broadcast() { if (!H.net) return; for (const p of H.players) if (p.on && p.peer) H.net.sendTo(p.peer, { t: 'st', s: pub(p.pid) }); renderHost(); }
  function renderTimer() {
    const ring = $('hRing'), f = H.total ? H.left / H.total : 0; ring.style.strokeDashoffset = 106.8 * (1 - f);
    $('hTime').textContent = H.phase === 'draw' || H.phase === 'choose' ? Math.ceil(H.left) : ''; $('hTimer').classList.toggle('low', H.phase === 'draw' && H.left <= 10);
    $('hTimer').style.visibility = H.phase === 'draw' || H.phase === 'choose' || H.phase === 'reveal' ? '' : 'hidden';
  }
  function renderHost() {
    if (H.phase === 'lobby') { renderLobby(); return; }
    const s = pub(0), d = byPid(H.drawer);
    html($('hRound'), H.phase === 'final' ? '🏆 Endstand' : 'Runde ' + Math.min(H.round, H.rounds) + '/' + H.rounds + ' · ' + (d ? av(d) + ' ' + esc(d.name) + (H.phase === 'choose' ? ' wählt ein Wort' : ' malt') : ''));
    $('hHint').textContent = H.phase === 'draw' ? s.hint + '  (' + s.len + ')' : '';
    html($('hPlayers'), H.players.slice().sort((a, b) => b.score - a.score).map(p => '<div class="pl' + (p.on ? '' : ' off') + (H.guessed.has(p.pid) ? ' ok' : '') + (p.pid === H.drawer && H.phase !== 'final' ? ' dr' : '') + '">' + av(p) + esc(p.name) + (p.pid === H.drawer && H.phase !== 'final' ? ' 🎨' : H.guessed.has(p.pid) ? ' ✓' : '') + (p.on ? '' : ' 📴') + '<span class="pts">' + p.score + '</span></div>').join(''));
    html($('hFeed'), H.feed.slice(-12).map(f => '<li class="' + (f.k === 'ok' ? 'ok' : f.k === 'close' ? 'close' : f.k === 'sys' ? 'sys' : '') + '">' + esc(f.txt) + '</li>').join(''));
    html($('lateJoin'), H.net ? 'Mitspielen: Code <b>' + esc(H.net.code) + '</b> · ' + esc(H.net.link().replace(/^https?:\/\//, '')) : '');
    const b = $('hBanner');
    if (H.phase === 'choose') { b.hidden = false; html(b, '<div><h2>' + (d ? esc(d.name) : '') + ' ist dran!</h2><p>' + (d ? esc(d.name) : '') + ' sucht sich auf dem Handy ein Wort aus …</p><p class="hint">Alle anderen: gleich mitraten – auf eurem Handy tippen.</p></div>'); }
    else if (H.phase === 'reveal') { b.hidden = false; html(b, '<div><p>Das Wort war</p><div class="word">' + esc(H.reveal.word) + '</div>' + (H.reveal.reason ? '<p>' + esc(H.reveal.reason) + '</p>' : '') + '<div class="gains">' + (H.reveal.gains.length ? H.reveal.gains.map(g => '<span>' + esc(g[0]) + ' +' + g[1] + '</span>').join('') : '<span style="background:rgba(255,84,112,.2);border-color:#FF5470">Niemand hat es erraten</span>') + '</div></div>'); }
    else if (H.phase === 'final') {
      const r = H.final || [];
      b.hidden = false; if (b._fin === H.final) return renderTimer(); b._fin = H.final; b._h = null;
      b.innerHTML = '<div><h2>🏆 ' + (r[0] ? esc(r[0][0]) + ' gewinnt!' : 'Ende') + '</h2><div class="podium">' + r.slice(0, 3).map((x, i) => '<div class="' + (i === 0 ? 'first' : '') + '">' + ['🥇', '🥈', '🥉'][i] + ' ' + esc(x[0]) + '<br>' + x[1] + '</div>').join('') + '</div>' +
        (r.length > 3 ? '<p>' + r.slice(3).map((x, i) => (i + 4) + '. ' + esc(x[0]) + ' ' + x[1]).join(' · ') + '</p>' : '') + '<div class="gallery" id="gal"></div><div class="rowBtns" style="max-width:520px;margin:2vmin auto 0"><button class="btn" id="bFinLobby">↩ Zur Lobby</button><button class="btn pri" id="bFinAgain">Nochmal ▶</button></div></div>';
      const gal = $('gal'); H.gallery.forEach(g => { const f = document.createElement('figure'); f.appendChild(thumb(g.ops)); const c = document.createElement('figcaption'); c.textContent = g.word + ' · ' + g.by; f.appendChild(c); f.onclick = () => { const a = document.createElement('a'); a.href = f.firstChild.toDataURL('image/png'); a.download = 'funkmaler-' + FM.norm(g.word) + '.png'; a.click(); }; gal.appendChild(f); });
      $('bFinAgain').onclick = () => { scr('hGame'); hostStart(); }; $('bFinLobby').onclick = toLobby; focusEl($('bFinAgain'));
    } else b.hidden = true;
    $('bSkip').textContent = H.phase === 'reveal' ? '⏭ Weiter' : H.phase === 'draw' ? '⏭ Auflösen' : H.phase === 'choose' ? '⏭ Wort zufällig' : '⏭';
    $('bSkip').disabled = H.phase === 'final';
    renderTimer();
  }
  function toLobby() { H.phase = 'lobby'; H.drawer = null; H.word = null; H.board.clear(); H.players = H.players.filter(p => p.on); H.players.forEach((p, i) => { p.score = 0; p.col = i; }); scr('hLobby'); broadcast(); renderLobby(); focusEl($('bStart')); }
  $('bHost').onclick = hostOpen;
  $('bStart').onclick = hostStart;
  $('bLobBack').onclick = () => { if (H.net) { H.net.send({ t: 'bye' }); H.net.close(); H.net = null; } H.players = []; scr('sStart'); };
  $('bCopy').onclick = () => { const l = H.net && H.net.link(); if (!l) return; (navigator.clipboard ? navigator.clipboard.writeText(l) : Promise.reject()).then(() => toast('Link kopiert')).catch(() => toast(l)); };
  $('bSkip').onclick = () => { if (H.phase === 'choose') pick((Math.random() * 3) | 0); else if (H.phase === 'draw') reveal(); else if (H.phase === 'reveal') nextTurn(); };
  $('bHostMenu').onclick = () => { $('hmSound').textContent = SET.sound ? '🔊 Ton an' : '🔇 Ton aus'; $('ovHostMenu').hidden = false; focusEl($('hmGo')); };
  $('hmGo').onclick = () => { $('ovHostMenu').hidden = true; };
  $('hmLobby').onclick = () => { $('ovHostMenu').hidden = true; toLobby(); };
  $('hmSound').onclick = () => { SET.sound = !SET.sound; LS.set(P + 'settings', SET); $('hmSound').textContent = SET.sound ? '🔊 Ton an' : '🔇 Ton aus'; };
  $('hmQuit').onclick = () => { $('ovHostMenu').hidden = true; if (H.net) { H.net.send({ t: 'bye' }); H.net.close(); H.net = null; } H.players = []; H.phase = 'lobby'; scr('sStart'); };
  addEventListener('pagehide', () => { if (H.net) H.net.send({ t: 'bye' }); });

  /* =================================================================
   * Handy (Mitspieler)
   * ================================================================= */
  const G = { net: null, code: '', name: '', pid: 0, s: null, board: null, pen: null, word: '', opts: [], mine: [], tries: 0, retryT: 0, ping: 0, joined: false, leftAt: 0, lastPhaseKey: '' };
  const cid = (() => { let c = LS.get(P + 'cid', ''); if (!c) { c = Math.random().toString(36).slice(2) + Date.now().toString(36); LS.set(P + 'cid', c); } return c; })();
  function joinScreen(code) {
    scr('gJoin'); $('gName').value = LS.get(P + 'name', '') || ''; $('gCode').value = code || ''; $('gJoinInfo').textContent = code ? 'Raum ' + code + ' gefunden – nur noch deinen Namen eingeben.' : '';
    setTimeout(() => { if (!('ontouchstart' in window)) (code ? $('gName') : $('gCode')).focus(); }, 50);
  }
  $('bJoinScr').onclick = () => joinScreen('');
  $('bJoinBack').onclick = () => scr('sStart');
  $('gCode').addEventListener('input', e => { e.target.value = mkNet({}).norm(e.target.value); });
  $('gName').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); $('bJoin').click(); } });
  $('gCode').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); $('bJoin').click(); } });
  $('bJoin').onclick = async () => {
    const name = FM.clean($('gName').value, 14), code = mkNet({}).norm($('gCode').value);
    if (!name) { $('gJoinInfo').textContent = 'Bitte gib deinen Namen ein.'; $('gName').focus(); return; }
    if (code.length !== 4) { $('gJoinInfo').textContent = 'Der Code hat 4 Zeichen – er steht groß auf dem Fernseher.'; $('gCode').focus(); return; }
    LS.set(P + 'name', name); G.name = name; G.code = code;
    $('bJoin').disabled = true; $('gJoinInfo').textContent = 'Verbinde …';
    try { await connect(); } catch (e) { $('gJoinInfo').textContent = netErr(e); }
    $('bJoin').disabled = false;
  };
  async function connect() {
    if (G.net) G.net.close();
    G.net = mkNet({ onMsg: guestMsg, onLeave: guestLeave });
    await G.net.join(G.code);
    G.net.send({ t: 'hi', cid, name: G.name });
    G.tries = 0; $('gConn').hidden = true;
    clearInterval(G.ping); G.ping = setInterval(() => { if (G.net) G.net.send({ t: 'ping' }); }, 4000);
    keepAwake();
  }
  function guestLeave() {
    if (!G.joined) return;
    $('gConn').hidden = false; $('gConn').textContent = 'Verbindung weg – verbinde neu …';
    clearTimeout(G.retryT);
    const again = () => {
      if (!G.joined) return;
      if (++G.tries > 30) { $('gConn').textContent = 'Keine Verbindung zum Fernseher. Läuft das Spiel dort noch?'; G.joined = false; setTimeout(() => joinScreen(G.code), 2500); return; }
      connect().catch(() => { G.retryT = setTimeout(again, 2500); });
    };
    G.retryT = setTimeout(again, 800);
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden && G.joined && (!G.net || !G.net.conns.size)) guestLeave(); });
  function guestMsg(peer, d) {
    if (d.t === 'you') { G.pid = d.pid; G.joined = true; scr('gPlay'); $('gConn').hidden = true; if (!G.board) { G.board = Board($('gBoard')); G.pen = Pen($('gBoard'), G.board, m => { if (G.net) G.net.send(m); }); } return; }
    if (d.t === 'full') { $('gJoinInfo').textContent = 'Der Raum ist voll (8 Spieler).'; G.joined = false; return; }
    if (d.t === 'bye') { G.joined = false; clearInterval(G.ping); toast('Das Spiel auf dem Fernseher wurde beendet.'); if (G.net) G.net.close(); G.net = null; scr('sStart'); return; }
    if (!G.board) return;
    if (d.t === 'board') { G.board.set(d.ops); return; }
    if (d.t === 'ln') { G.board.line(d); return; }
    if (d.t === 'undo') { G.board.undo(); return; }
    if (d.t === 'clr') { G.board.clear(); return; }
    if (d.t === 'opts') { G.opts = (d.w || []).slice(0, 3).map(w => FM.clean(w, 40)); renderGuest(); return; }
    if (d.t === 'word') { G.word = FM.clean(d.w, 40); renderGuest(); return; }
    if (d.t === 'res') {
      if (d.r === 'ok') { G.mine.push({ k: 'ok', t: '✓ Richtig: ' + FM.clean(d.w, 40) + ' (+' + (d.pts | 0) + ')' }); sfx('ok'); if (navigator.vibrate) try { navigator.vibrate([60, 40, 60]); } catch (e) { } }
      else if (d.r === 'knapp') { const g = G.mine.pop(); G.mine.push({ k: 'close', t: (g ? g.t.replace(/^✗ /, '') : '') + ' – knapp daneben!' }); sfx('close'); }
      renderGuest(); return;
    }
    if (d.t === 'st') {
      const s = d.s, key = s.phase + ':' + s.drawer + ':' + s.round;
      if (key !== G.lastPhaseKey) { // neue Phase
        G.lastPhaseKey = key;
        if (s.phase === 'choose' || s.phase === 'lobby') { G.word = ''; G.mine = []; if (s.drawer !== G.pid) G.opts = []; }
        if (s.phase === 'choose' && s.drawer === G.pid) sfx('turn');
        if (s.phase === 'draw' && s.drawer !== G.pid) setTimeout(() => { const i = $('gGuessIn'); if (i && !('ontouchstart' in window)) i.focus(); }, 50);
      }
      G.s = s; G.leftAt = Date.now(); renderGuest();
    }
  }
  function renderGuest() {
    const s = G.s; if (!s) return;
    const me = s.players.find(p => p.pid === G.pid) || { name: G.name, col: 0, score: 0 };
    const draw = s.phase === 'draw', iDraw = s.drawer === G.pid && (s.phase === 'choose' || draw);
    html($('gMe'), av(me) + esc(me.name) + ' · ' + me.score);
    $('gStat').textContent = s.phase === 'lobby' ? 'Raum ' + s.code : s.phase === 'final' ? 'Endstand' : 'Runde ' + Math.min(s.round, s.rounds) + '/' + s.rounds;
    let msg = '';
    if (s.phase === 'lobby') msg = '<h2>Du bist drin, ' + esc(me.name) + '! 🎉</h2><p>Schau auf den Fernseher. Sobald alle da sind, wird dort „Spiel starten“ gedrückt.</p><p class="hint">' + s.players.filter(p => p.on).length + ' Spieler: ' + s.players.filter(p => p.on).map(p => esc(p.name)).join(', ') + '</p>';
    else if (s.phase === 'choose') msg = iDraw ? '<h2>🎨 Du malst!</h2><p>Such dir ein Wort aus – die anderen sehen es nicht.</p>' : '<h2>' + esc(s.drawerName) + ' malt gleich</h2><p>… und sucht sich gerade ein Wort aus. Mach dich bereit zum Raten!</p>';
    else if (draw && iDraw) msg = '';
    else if (draw && s.myOk) msg = '<h2>✓ Richtig!</h2><p>Warte, bis die anderen es auch haben.</p>';
    else if (draw) msg = '<p><b>' + esc(s.drawerName) + '</b> malt – was ist es? Tipp deine Vermutung unten ein.</p>';
    else if (s.phase === 'reveal') { const r = s.reveal || { word: '', gains: [] }, mine = r.gains.find(g => g[0] === me.name || g[0] === me.name + ' 🎨'); msg = '<p>Das Wort war</p><div class="gWord">' + esc(r.word) + '</div><p>' + (mine ? 'Du bekommst +' + mine[1] + ' Punkte 🎉' : 'Diesmal keine Punkte – nächste Runde!') + '</p>'; }
    else if (s.phase === 'final') { const r = s.final || [], pos = r.findIndex(x => x[0] === me.name); msg = '<h2>' + (pos === 0 ? '🏆 Du hast gewonnen!' : 'Platz ' + (pos + 1)) + '</h2>' + r.map((x, i) => '<p>' + (i + 1) + '. ' + esc(x[0]) + ' – ' + x[1] + '</p>').join('') + '<p class="hint">Danke fürs Spielen! Auf dem Fernseher kann gleich nochmal gestartet werden.</p>'; }
    html($('gMsg'), msg);
    html($('gOpts'), s.phase === 'choose' && iDraw ? G.opts.map((w, i) => '<button class="btn pri" data-i="' + i + '">' + esc(w) + '</button>').join('') : '');
    html($('gWord'), draw && iDraw && G.word ? '<small>Male:</small>' + esc(G.word) + '<small>Keine Buchstaben oder Zahlen malen!</small>' : '');
    $('gHint').textContent = draw && !iDraw ? s.hint : '';
    const showBoard = draw || (s.phase === 'reveal');
    $('gBoardWrap').hidden = !showBoard;
    if (G.pen) G.pen.on = draw && iDraw;
    if (draw && iDraw) { if (!$('gTools').childNodes.length) tools($('gTools'), G.pen, () => { G.board.undo(); G.net.send({ t: 'undo' }); }, () => { G.board.clear(); G.net.send({ t: 'clr' }); }); }
    else $('gTools').innerHTML = '';
    $('gGuess').hidden = !(draw && !iDraw && !s.myOk);
    html($('gMine'), draw && !iDraw ? G.mine.map(m => '<li class="' + m.k + '">' + esc(m.t) + '</li>').join('') : '');
    guestTime();
  }
  function guestTime() { const s = G.s; if (!s) return; const left = Math.max(0, s.left - Math.floor((Date.now() - G.leftAt) / 1000)); const show = s.phase === 'draw' || s.phase === 'choose'; $('gTime').textContent = show ? left : ''; $('gTime').classList.toggle('low', s.phase === 'draw' && left <= 10); }
  setInterval(() => { if (G.s) guestTime(); if (L.phase === 'draw') localTick(); }, 250);
  $('gOpts').onclick = e => { const b = e.target.closest('button'); if (b && G.net) { G.net.send({ t: 'pick', i: +b.dataset.i }); G.opts = []; $('gOpts').innerHTML = '<p class="hint">Gewählt – los geht\'s!</p>'; } };
  $('gGuess').onsubmit = e => {
    e.preventDefault(); const v = FM.clean($('gGuessIn').value, 40); if (!v || !G.net) return;
    G.net.send({ t: 'guess', g: v }); G.mine.push({ k: '', t: '✗ ' + v }); if (G.mine.length > 8) G.mine.shift(); $('gGuessIn').value = ''; renderGuest();
    $('gGuessIn').focus();
  };

  /* =================================================================
   * Ein Gerät
   * ================================================================= */
  const L = { players: [], rounds: 2, time: 80, level: 'mittel', round: 1, turns: [], idx: 0, drawer: -1, word: null, opts: [], left: 0, total: 0, phase: '', board: null, pen: null, used: [], gallery: [], hide: false, last: 0 };
  function lSetupRender() { $('lNames').innerHTML = L.players.map((p, i) => '<div class="nm"><input data-i="' + i + '" maxlength="14" value="' + esc(p.name) + '" aria-label="Name"><button class="rm" data-i="' + i + '" aria-label="Entfernen">✕</button></div>').join(''); }
  $('bLocal').onclick = () => { L.players = (LS.get(P + 'local', null) || ['Spieler 1', 'Spieler 2', 'Spieler 3']).map(n => ({ name: n, score: 0 })); lSetupRender(); scr('lSetup'); };
  $('lNames').addEventListener('input', e => { const i = +e.target.dataset.i; if (L.players[i]) L.players[i].name = e.target.value; });
  $('lNames').addEventListener('click', e => { const b = e.target.closest('.rm'); if (b && L.players.length > 2) { L.players.splice(+b.dataset.i, 1); lSetupRender(); } });
  $('bLAdd').onclick = () => { if (L.players.length < 8) { L.players.push({ name: 'Spieler ' + (L.players.length + 1), score: 0 }); lSetupRender(); } };
  $('bLBack').onclick = () => scr('sStart');
  $('bLStart').onclick = () => {
    L.players.forEach((p, i) => { p.name = FM.clean(p.name, 14) || 'Spieler ' + (i + 1); p.score = 0; p.col = i; });
    LS.set(P + 'local', L.players.map(p => p.name));
    L.rounds = +$('lRounds').value; L.time = +$('lTime').value; L.level = $('lLevel').value; L.round = 1; L.idx = 0; L.used = []; L.gallery = [];
    if (!L.board) { L.board = Board($('lBoard')); L.pen = Pen($('lBoard'), L.board, () => { }); }
    scr('lPlay'); lHand();
  };
  function lHand() {
    if (L.idx >= L.players.length) { L.idx = 0; L.round++; }
    if (L.round > L.rounds) { lFinal(); return; }
    L.drawer = L.idx++; L.phase = 'hand'; L.board.clear(); L.pen.on = false; const d = L.players[L.drawer];
    lRender('<h2>' + av(d) + ' ' + esc(d.name) + ' malt!</h2><p>Gib das Gerät an <b>' + esc(d.name) + '</b>. Alle anderen schauen kurz weg.</p>', '<button class="btn big pri" id="lShow">Ich bin ' + esc(d.name) + ' – Wörter zeigen</button>');
    $('lShow').onclick = () => { L.opts = FM.pickWords(L.level, 3, L.used, Math.random); L.phase = 'choose'; lRender('<h2>Wähle ein Wort</h2><p class="hint">Danach Gerät so halten, dass alle die Zeichnung sehen.</p>', L.opts.map((w, i) => '<button class="btn pri" data-i="' + i + '">' + esc(FM.show(w)) + '</button>').join('')); };
    sfx('turn');
  }
  $('lOpts').addEventListener('click', e => {
    const b = e.target.closest('button[data-i]'); if (!b || L.phase !== 'choose') return;
    L.word = L.opts[+b.dataset.i]; L.used.push(FM.show(L.word)); L.phase = 'draw'; L.total = L.left = L.time; L.last = Date.now(); L.hide = false; L.pen.on = true;
    lRender('', ''); tools($('lTools'), L.pen, () => L.board.undo(), () => L.board.clear());
    $('lGot').innerHTML = '<button class="btn pri" id="lOk">✓ Erraten!</button><button class="btn" id="lHide">🙈 Wort verbergen</button><button class="btn" id="lGive">Aufgeben</button>';
    $('lOk').onclick = lPick; $('lGive').onclick = () => lReveal(-1); $('lHide').onclick = () => { L.hide = !L.hide; lWord(); };
    lWord();
  });
  function lWord() { const d = L.players[L.drawer]; $('lWord').innerHTML = L.phase === 'draw' ? (L.hide ? '<small>Wort verborgen</small>' + esc(FM.hint(L.word, [])) : '<small>' + esc(d.name) + ' malt:</small>' + esc(FM.show(L.word))) : ''; $('lHide').textContent = L.hide ? '👁 Wort zeigen' : '🙈 Wort verbergen'; }
  function localTick() {
    const now = Date.now(); L.left = Math.max(0, L.left - (now - L.last) / 1000); L.last = now;
    $('lTimeT').textContent = Math.ceil(L.left); $('lTimeT').classList.toggle('low', L.left <= 10);
    if (L.left <= 0) lReveal(-1);
  }
  function lPick() {
    $('pickList').innerHTML = L.players.map((p, i) => i === L.drawer ? '' : '<button class="btn" data-i="' + i + '">' + av(p) + ' ' + esc(p.name) + '</button>').join('') + '<button class="btn" data-i="-1">Niemand</button>';
    $('ovPick').hidden = false;
  }
  $('pickList').onclick = e => { const b = e.target.closest('button'); if (!b) return; $('ovPick').hidden = true; lReveal(+b.dataset.i); };
  $('pickX').onclick = () => { $('ovPick').hidden = true; };
  function lReveal(g) {
    if (L.phase !== 'draw') return;
    L.phase = 'reveal'; L.pen.on = false; $('lTools').innerHTML = ''; $('lGot').innerHTML = ''; $('lTimeT').textContent = '';
    const d = L.players[L.drawer]; let txt = 'Niemand hat es erraten.';
    if (g >= 0) { const pts = FM.guessPoints(L.left, L.total, 0), dp = FM.drawerPoints(1, 1); L.players[g].score += pts; d.score += dp; txt = esc(L.players[g].name) + ' +' + pts + ' · ' + esc(d.name) + ' +' + dp; sfx('ok'); } else sfx('reveal');
    if (L.board.ops().length) L.gallery.push({ word: FM.show(L.word), by: d.name, ops: JSON.parse(JSON.stringify(L.board.ops())) });
    lRender('<p>Das Wort war</p><div class="gWord">' + esc(FM.show(L.word)) + '</div><p>' + txt + '</p><p class="hint">' + L.players.slice().sort((a, b) => b.score - a.score).map(p => esc(p.name) + ' ' + p.score).join(' · ') + '</p>', '<button class="btn big pri" id="lNext">Weiter ▶</button>');
    $('lWord').innerHTML = ''; $('lNext').onclick = lHand;
  }
  function lFinal() {
    L.phase = 'final'; sfx('end'); const r = L.players.slice().sort((a, b) => b.score - a.score);
    lRender('<h2>🏆 ' + esc(r[0].name) + ' gewinnt!</h2>' + r.map((p, i) => '<p>' + (i + 1) + '. ' + esc(p.name) + ' – ' + p.score + '</p>').join('') + '<div class="gallery" id="lGal"></div>', '<button class="btn big pri" id="lAgain">Nochmal ▶</button><button class="btn" id="lMenu">Menü</button>');
    L.gallery.forEach(g => { const f = document.createElement('figure'); f.appendChild(thumb(g.ops)); const c = document.createElement('figcaption'); c.textContent = g.word + ' · ' + g.by; f.appendChild(c); $('lGal').appendChild(f); });
    $('lAgain').onclick = () => $('bLStart').click(); $('lMenu').onclick = () => scr('sStart'); L.board.clear();
  }
  function lRender(msg, opts) {
    const d = L.players[L.drawer] || { name: '', col: 0 };
    $('lWho').innerHTML = L.phase === 'final' ? '🏆 Endstand' : av(d) + esc(d.name);
    $('lStat').textContent = L.phase === 'final' ? '' : 'Runde ' + Math.min(L.round, L.rounds) + '/' + L.rounds;
    $('lMsg').innerHTML = msg; $('lOpts').innerHTML = opts; if (L.phase !== 'draw') { $('lWord').innerHTML = ''; $('lTools').innerHTML = ''; $('lGot').innerHTML = ''; }
    $('lBoard').parentNode.hidden = !(L.phase === 'draw' || L.phase === 'reveal');
  }

  /* ---------- Allgemein ---------- */
  function focusEl(el) { if (el && !('ontouchstart' in window)) try { el.focus({ preventScroll: true }); } catch (e) { } }
  $('bHow').onclick = () => { $('ovHow').hidden = false; focusEl($('howX')); }; $('howX').onclick = () => { $('ovHow').hidden = true; };
  addEventListener('keydown', e => { if (e.key === 'Escape') { const o = ovs(); if (o) { e.preventDefault(); o.hidden = true; } } });
  if (window.self !== window.top) $('backLink').hidden = true;
  // Einstieg: ?join=CODE (bzw. #join=) → Handy; ?tv oder Fernseher → Bildschirm
  const q = new URLSearchParams(location.search), jm = /[?#&]join=([A-Za-z0-9]{4})/.exec(location.search + location.hash);
  if (jm) { joinScreen(jm[1].toUpperCase()); if (LS.get(P + 'name', '')) setTimeout(() => $('bJoin').click(), 100); }
  else if (q.has('tv') || (window.EasyGamesKit && EasyGamesKit.isTv && EasyGamesKit.isTv())) hostOpen();
  else focusEl($('bHost'));
  window.FUNKMALER = { host: () => ({ phase: H.phase, players: H.players.map(p => ({ name: p.name, score: p.score, on: p.on })), word: H.word ? FM.show(H.word) : '', code: H.net && H.net.code, ops: H.board ? H.board.ops().length : 0 }), guest: () => ({ joined: G.joined, pid: G.pid, s: G.s, word: G.word, opts: G.opts }) }; // für Tests
})();
