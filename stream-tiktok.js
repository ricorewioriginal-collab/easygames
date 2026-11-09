/*!
 * stream-tiktok.js – TikTok LIVE steuert das Spiel im Stream-Overlay (stream.html), ohne dass ein Spiel umgebaut wird.
 *
 *   stream.html?game=<id>&tiktok=1            Overlay mit TikTok-Steuerung (Brücke: ws://127.0.0.1:21213)
 *   stream.html?game=<id>&tiktok=1&setup=1    Einstellungen (im normalen Browser öffnen, gilt sofort auch in OBS)
 *   tiktok=ws://rechner:port                   andere Adresse der Brücke
 *
 * Windows-App: setzt window.EG_TIKTOK_EMBED = { ws, id, title, setup } vor dieser Datei – dann wirkt alles direkt im Spielfenster.
 * Ereignisse kommen von der kleinen Brücke auf dem Stream-PC (tools/tiktok-bridge.mjs): Kommentare, Geschenke, Likes, Follows.
 * Aktionen: pad:<Knopf> (virtueller Controller – wirkt in allen Spielen mit Controller-Steuerung, siehe gamepad.js),
 * key:<Taste> (z. B. key:Space), restart (Spiel neu starten), say:<Text> (Einblendung, {user} = Name).
 * Belegung frei einstellbar, für alle Spiele oder je Spiel; sie liegt in der Brücke (tiktok-config.json), damit
 * Einstellungs-Fenster und OBS dieselbe sehen. Ohne Brücke: Browserspeicher.
 */
(function boot() {
  'use strict';
  var P = new URLSearchParams(location.search), S = window.EG_STREAM, EMB = window.EG_TIKTOK_EMBED;
  if (window.EG_TIKTOK) return;
  if (EMB) {   // im Spielfenster der Windows-App: Einblendungen über dem Spiel, Controller im selben Fenster
    if (!document.body) { document.addEventListener('DOMContentLoaded', boot); return; }
    var st0 = document.createElement('div'); st0.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483000'; document.body.appendChild(st0);
    S = { game: { id: EMB.id, title: EMB.title || EMB.id }, frame: { contentWindow: window }, stage: st0, restart: function () { location.reload(); } };
    P = new URLSearchParams({ tiktok: EMB.ws || '1', setup: EMB.setup ? '1' : '' });
  }
  if (!P.get('tiktok') || !S) return;
  var URLWS = /^wss?:\/\//.test(P.get('tiktok')) ? P.get('tiktok') : 'ws://127.0.0.1:21213', SETUP = P.get('setup') === '1', GID = S.game.id;
  var BTN = { A: 0, B: 1, X: 2, Y: 3, LB: 4, RB: 5, LT: 6, RT: 7, SELECT: 8, START: 9, L3: 10, R3: 11, UP: 12, DOWN: 13, LEFT: 14, RIGHT: 15 };
  var ACTIONS = ['pad:A', 'pad:B', 'pad:X', 'pad:Y', 'pad:LB', 'pad:RB', 'pad:LT', 'pad:RT', 'pad:START', 'pad:SELECT', 'pad:UP', 'pad:DOWN', 'pad:LEFT', 'pad:RIGHT',
    'key:Space', 'key:Enter', 'key:Escape', 'restart', 'say:Danke {user}! ❤️'];
  var DEFAULT = {
    mode: 'chaos', voteSec: 3, legend: 'tr',
    commands: [['links', 'pad:LEFT'], ['rechts', 'pad:RIGHT'], ['hoch', 'pad:UP'], ['runter', 'pad:DOWN'], ['a', 'pad:A'], ['b', 'pad:B'], ['spring', 'pad:A'], ['start', 'pad:START']],
    gifts: [{ gift: 'Rose', icon: '🌹', action: 'pad:A', label: 'A drücken' }, { gift: 'Finger Heart', icon: '🫰', action: 'pad:B', label: 'B drücken' },
      { gift: 'Galaxy', icon: '🌌', action: 'restart', label: 'Neustart!' }],
    likes: { every: 100, action: 'pad:A', label: 'A drücken' },
    follow: 'say:Danke für den Follow, {user}! ❤️',
    games: {}
  };
  var cfg = load(), ws = null, online = false, votes = {}, likeSum = 0;

  function load() { try { return JSON.parse(localStorage.getItem('eg-tiktok') || 'null') || clone(DEFAULT); } catch (e) { return clone(DEFAULT); } }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  // Belegung für dieses Spiel: eigene Einträge des Spiels ersetzen die allgemeinen
  function eff() { var g = (cfg.games || {})[GID] || {}, o = {}; for (var k in cfg) if (k !== 'games') o[k] = g[k] !== undefined ? g[k] : cfg[k]; return o; }

  // ---------- Einblendungen: Geschenke-Legende, Ereignis-Liste, Like-Leiste ----------
  var css = document.createElement('style');
  css.textContent = '.tt{position:absolute;z-index:20;font-family:system-ui,"Segoe UI",sans-serif;color:#fff;pointer-events:none}' +
    '.tt-leg{padding:8px 10px;border-radius:12px;background:rgba(5,7,13,.78);font-size:12px;line-height:1.5;max-width:46%;box-shadow:0 4px 14px rgba(0,0,0,.4)}' +
    '.tt-leg b{display:block;font-size:11px;color:#7ff3ff;letter-spacing:.04em;margin-bottom:2px}.tt-leg .r{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.tt-leg .c{color:#ffd84a;font-weight:700}.tt-tr{top:58px;right:8px}.tt-tl{top:58px;left:8px}.tt-br{bottom:100px;right:8px}.tt-bl{bottom:100px;left:8px}' +
    '.tt-feed{left:8px;right:8px;bottom:96px;display:flex;flex-direction:column;align-items:flex-start;gap:5px}' +
    '.tt-feed div{padding:6px 11px;border-radius:999px;background:linear-gradient(90deg,rgba(236,72,153,.92),rgba(139,92,246,.92));font-size:13px;font-weight:700;box-shadow:0 4px 12px rgba(0,0,0,.35);animation:ttIn .25s ease-out}' +
    '@keyframes ttIn{from{transform:translateX(-20px);opacity:0}to{transform:none;opacity:1}}' +
    '.tt-like{left:8px;right:8px;top:52px;height:8px;border-radius:4px;background:rgba(255,255,255,.18);overflow:hidden}.tt-like i{display:block;height:100%;width:0;background:linear-gradient(90deg,#f472b6,#fb7185);transition:width .3s}' +
    '.tt-vote{left:50%;top:40%;transform:translate(-50%,-50%);padding:10px 16px;border-radius:14px;background:rgba(5,7,13,.82);font-size:15px;font-weight:800;text-align:center}' +
    '.tt-state{right:8px;bottom:8px;font-size:10px;opacity:.6}';
  document.head.appendChild(css);
  function box(cls) { var d = document.createElement('div'); d.className = 'tt ' + cls; S.stage.appendChild(d); return d; }
  var legend = box('tt-leg'), feed = box('tt-feed'), likeBar = box('tt-like'), vote = box('tt-vote'), state = box('tt-state');
  likeBar.innerHTML = '<i></i>'; vote.style.display = 'none';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function drawLegend() {
    var e = eff(), rows = [];
    (e.gifts || []).forEach(function (g) { if (g.gift) rows.push('<div class="r">' + esc(g.icon || '🎁') + ' <span class="c">' + esc(g.gift) + '</span> → ' + esc(g.label || g.action) + '</div>'); });
    if (e.likes && e.likes.every > 0) rows.push('<div class="r">❤️ <span class="c">' + e.likes.every + ' Likes</span> → ' + esc(e.likes.label || e.likes.action) + '</div>');
    var cmds = (e.commands || []).map(function (c) { return c[0]; }).filter(Boolean);
    if (cmds.length) rows.push('<div class="r">💬 Schreib: <span class="c">' + esc(cmds.slice(0, 6).join(' · ')) + '</span></div>');
    legend.innerHTML = '<b>' + (e.mode === 'vote' ? 'TIKTOK STEUERT · ABSTIMMUNG' : 'TIKTOK STEUERT DAS SPIEL') + '</b>' + rows.join('');
    legend.className = 'tt tt-leg tt-' + (e.legend || 'tr'); legend.style.display = e.legend === 'off' || !rows.length ? 'none' : '';
    likeBar.style.display = e.likes && e.likes.every > 0 ? '' : 'none';
  }
  function toast(text) {
    var d = document.createElement('div'); d.textContent = text; feed.appendChild(d);
    while (feed.children.length > 4) feed.firstChild.remove();
    setTimeout(function () { d.remove(); }, 5000);
  }

  // ---------- Aktionen ----------
  function gameWin() { try { return S.frame.contentWindow; } catch (e) { return null; } }
  // Normalisierung mit virtuellem Controller in das Spiel einspielen (falls das Spiel gamepad.js nicht selbst lädt)
  function padApi(cb) {
    var w = gameWin(); if (!w || !w.document) return;
    if (w.EasyGamesPadNormal && w.EasyGamesPadNormal.press) return cb(w.EasyGamesPadNormal);
    if (!w.__egPadLoading) {
      w.__egPadLoading = true; w.EASYGAMES_PAD_NORMAL_ONLY = 1;
      var s = w.document.createElement('script'); s.src = EMB ? '/gamepad.js' : new URL('gamepad.js', location.href).href; (w.document.head || w.document.documentElement).appendChild(s);
    }
    setTimeout(function () { var w2 = gameWin(); if (w2 && w2.EasyGamesPadNormal && w2.EasyGamesPadNormal.press) cb(w2.EasyGamesPadNormal); }, 300);
  }
  function key(code, down) {
    var w = gameWin(); if (!w || !w.document) return;
    var k = code === 'Space' ? ' ' : code.replace(/^Key/, '').replace(/^Digit/, ''), t = w.document.activeElement || w.document.body;
    try { t.dispatchEvent(new w.KeyboardEvent(down ? 'keydown' : 'keyup', { key: k.length === 1 ? k.toLowerCase() : k, code: code, bubbles: true, cancelable: true })); } catch (e) { }
  }
  var queue = Promise.resolve();
  function run(action, user, times) {
    action = String(action || ''); times = Math.max(1, Math.min(20, times || 1));
    var m = /^(\w+):?(.*)$/.exec(action); if (!m) return;
    var kind = m[1], arg = m[2];
    if (kind === 'restart') { try { S.frame.contentWindow.location.reload(); } catch (e) { S.restart(); } return; }
    if (kind === 'say') { toast(arg.replace(/\{user\}/g, user || '')); return; }
    for (var n = 0; n < times; n++) queue = queue.then(function () {
      return new Promise(function (done) {
        if (kind === 'pad' && BTN[arg.toUpperCase()] !== undefined) {
          var i = BTN[arg.toUpperCase()];
          padApi(function (N) { N.press(i, 1); setTimeout(function () { N.press(i, 0); setTimeout(done, 90); }, 160); });
          setTimeout(done, 900);   // falls das Spiel noch lädt: nicht hängen bleiben
        } else if (kind === 'key' && arg) { key(arg, true); setTimeout(function () { key(arg, false); setTimeout(done, 90); }, 160); }
        else done();
      });
    });
  }
  window.EG_TIKTOK = { run: run, config: function () { return cfg; } };

  // ---------- Ereignisse ----------
  function onEvent(ev) {
    var e = eff(), who = ev.user || 'Jemand';
    if (ev.type === 'chat') {
      var word = String(ev.text || '').trim().toLowerCase().split(/\s+/)[0], hit = (e.commands || []).find(function (c) { return c[0] && c[0].toLowerCase() === word; });
      if (!hit) return;
      if (e.mode === 'vote') { votes[hit[0]] = (votes[hit[0]] || 0) + 1; drawVote(); return; }
      toast(who + ': ' + hit[0]); run(hit[1], who);
    } else if (ev.type === 'gift') {
      var name = String(ev.gift || '').toLowerCase(), g = (e.gifts || []).find(function (x) { return x.gift && (x.gift.toLowerCase() === name || String(x.gift) === String(ev.giftId)); });
      if (!g) return;
      toast(who + ': ' + (g.icon || '🎁') + ' ' + g.gift + (ev.count > 1 ? ' ×' + ev.count : '') + ' → ' + (g.label || g.action)); run(g.action, who, ev.count);
    } else if (ev.type === 'like' && e.likes && e.likes.every > 0) {
      likeSum += ev.count || 1;
      while (likeSum >= e.likes.every) { likeSum -= e.likes.every; toast('❤️ ' + e.likes.every + ' Likes → ' + (e.likes.label || e.likes.action)); run(e.likes.action, who); }
      likeBar.firstChild.style.width = Math.round(likeSum / e.likes.every * 100) + '%';
    } else if (ev.type === 'follow' && e.follow) run(e.follow, who);
  }
  function drawVote() {
    var k = Object.keys(votes); if (!k.length) { vote.style.display = 'none'; return; }
    k.sort(function (a, b) { return votes[b] - votes[a]; });
    vote.style.display = ''; vote.innerHTML = '🗳️ ' + k.slice(0, 3).map(function (x) { return esc(x) + ' <span style="color:#ffd84a">' + votes[x] + '</span>'; }).join(' · ');
  }
  setInterval(function () {
    var e = eff(); if (e.mode !== 'vote') return;
    var k = Object.keys(votes); if (!k.length) return;
    k.sort(function (a, b) { return votes[b] - votes[a]; });
    var hit = (e.commands || []).find(function (c) { return c[0] === k[0]; }); votes = {}; drawVote();
    if (hit) { toast('🗳️ Gewonnen: ' + hit[0]); run(hit[1], ''); }
  }, Math.max(1, +(eff().voteSec || 3)) * 1000);

  // ---------- Verbindung zur Brücke ----------
  function send(o) { try { if (ws && ws.readyState === 1) ws.send(JSON.stringify(o)); } catch (e) { } }
  function setState() { state.textContent = online ? '● TikTok verbunden' : '○ Brücke nicht verbunden'; if (SETUP && P2) panelState(); }
  function connect() {
    try { ws = new WebSocket(URLWS); } catch (e) { setTimeout(connect, 5000); return; }
    ws.onopen = function () { online = true; setState(); send({ type: 'getConfig' }); };
    ws.onclose = function () { online = false; setState(); setTimeout(connect, 4000); };
    ws.onerror = function () { };
    ws.onmessage = function (m) {
      var d; try { d = JSON.parse(m.data); } catch (e) { return; }
      if (d.type === 'event' && d.ev) onEvent(d.ev);
      else if (d.type === 'config' && d.config) { cfg = Object.assign(clone(DEFAULT), d.config); try { localStorage.setItem('eg-tiktok', JSON.stringify(cfg)); } catch (e) { } drawLegend(); if (SETUP && P2 && !editing) panelFill(); }
      else if (d.type === 'status') { state.title = d.msg || ''; if (SETUP && P2) panelState(d.msg); }
    };
  }
  drawLegend(); setState(); connect();
  if (!SETUP) return;

  // ---------- Einstellungen (setup=1) ----------
  var editing = false, scope = 'all';
  var pc = document.createElement('style');
  pc.textContent = '#ttSet{position:fixed;inset:0;z-index:100;overflow:auto;background:rgba(5,7,13,.96);color:#eef2fb;font:14px system-ui,"Segoe UI",sans-serif;padding:18px}' +
    '#ttSet h2{margin:0 0 4px}#ttSet h3{margin:18px 0 6px;font-size:15px;color:#7ff3ff}#ttSet .s{color:#9aa7c2;font-size:12.5px}' +
    '#ttSet table{border-collapse:collapse;width:100%;max-width:820px}#ttSet td{padding:3px 4px}#ttSet input,#ttSet select{width:100%;box-sizing:border-box;padding:6px 8px;border-radius:8px;border:1px solid #2a3650;background:#0d121d;color:#fff;font:inherit}' +
    '#ttSet button{padding:7px 12px;border-radius:9px;border:1px solid #2a3650;background:#16203a;color:#fff;font:inherit;cursor:pointer}#ttSet button.p{background:linear-gradient(110deg,#ec4899,#8b5cf6);border:0;font-weight:700}' +
    '#ttSet .row{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:6px 0}#ttSet .row label{display:flex;gap:6px;align-items:center}#ttSet .row input,#ttSet .row select{width:auto}' +
    '#ttSet .ok{color:#34d399}#ttSet .bad{color:#f87171}';
  document.head.appendChild(pc);
  var P2 = document.createElement('div'); P2.id = 'ttSet'; document.body.appendChild(P2);
  var dl = '<datalist id="ttAct">' + ACTIONS.map(function (a) { return '<option value="' + a + '">'; }).join('') + '</datalist>';
  P2.innerHTML = '<h2>🎁 TikTok-Steuerung · ' + esc(S.game.title) + '</h2><div class="s">Kommentare, Geschenke und Likes steuern das Spiel. Gespeichert wird in der Brücke – OBS übernimmt es sofort.</div>' +
    '<div class="row"><span id="ttConn"></span></div>' +
    '<div class="row"><label>Einstellungen für <select id="ttScope"><option value="all">alle Spiele</option><option value="game">nur ' + esc(S.game.title) + '</option></select></label>' +
    '<label>Modus <select id="ttMode"><option value="chaos">Chaos – jeder Befehl sofort</option><option value="vote">Abstimmung</option></select></label>' +
    '<label>alle <input id="ttVote" type="number" min="1" max="30" style="width:60px"> s</label>' +
    '<label>Legende <select id="ttLeg"><option value="tr">oben rechts</option><option value="tl">oben links</option><option value="br">unten rechts</option><option value="bl">unten links</option><option value="off">aus</option></select></label></div>' +
    '<h3>🎁 Geschenke</h3><div class="s">Name wie bei TikTok (z. B. Rose, Galaxy, Lion, Universe). Aktion: pad:A … pad:RIGHT (Controller), key:Space (Taste), restart (Neustart), say:Text.</div><table id="ttGifts"></table><button data-add="g">+ Geschenk</button>' +
    '<h3>💬 Chat-Befehle</h3><table id="ttCmds"></table><button data-add="c">+ Befehl</button>' +
    '<h3>❤️ Likes und Follows</h3><div class="row"><label>alle <input id="ttLikeN" type="number" min="0" style="width:90px"> Likes</label><label>Aktion <input id="ttLikeA" list="ttAct"></label><label>Text <input id="ttLikeL"></label></div>' +
    '<div class="row"><label>Follow <input id="ttFollow" list="ttAct" style="width:340px"></label></div>' +
    '<div class="row" style="margin-top:16px"><button class="p" id="ttSave">Speichern</button><button id="ttReset">Standard</button><button id="ttClose">Vorschau ansehen</button><span id="ttMsg" class="s"></span></div>' + dl;
  var $ = function (s) { return P2.querySelector(s); };
  function giftRow(g) { return '<tr><td style="width:60px"><input data-k="icon" value="' + esc(g.icon || '🎁') + '"></td><td><input data-k="gift" placeholder="Geschenk" value="' + esc(g.gift) + '"></td><td><input data-k="action" list="ttAct" value="' + esc(g.action) + '"></td><td><input data-k="label" placeholder="Text in der Legende" value="' + esc(g.label || '') + '"></td><td style="width:120px"><button data-test>Test</button> <button data-del>✕</button></td></tr>'; }
  function cmdRow(c) { return '<tr><td><input data-k="0" placeholder="Wort im Chat" value="' + esc(c[0]) + '"></td><td><input data-k="1" list="ttAct" value="' + esc(c[1]) + '"></td><td style="width:120px"><button data-test>Test</button> <button data-del>✕</button></td></tr>'; }
  function panelFill() {
    var e = scope === 'game' ? eff() : cfg;
    $('#ttScope').value = scope; $('#ttMode').value = e.mode || 'chaos'; $('#ttVote').value = e.voteSec || 3; $('#ttLeg').value = e.legend || 'tr';
    $('#ttGifts').innerHTML = (e.gifts || []).map(giftRow).join(''); $('#ttCmds').innerHTML = (e.commands || []).map(cmdRow).join('');
    $('#ttLikeN').value = (e.likes && e.likes.every) || 0; $('#ttLikeA').value = (e.likes && e.likes.action) || ''; $('#ttLikeL').value = (e.likes && e.likes.label) || '';
    $('#ttFollow').value = e.follow || '';
  }
  function read() {
    return {
      mode: $('#ttMode').value, voteSec: +$('#ttVote').value || 3, legend: $('#ttLeg').value,
      gifts: [].map.call(P2.querySelectorAll('#ttGifts tr'), function (r) { var o = {}; r.querySelectorAll('[data-k]').forEach(function (i) { o[i.dataset.k] = i.value.trim(); }); return o; }).filter(function (g) { return g.gift && g.action; }),
      commands: [].map.call(P2.querySelectorAll('#ttCmds tr'), function (r) { var i = r.querySelectorAll('[data-k]'); return [i[0].value.trim().toLowerCase(), i[1].value.trim()]; }).filter(function (c) { return c[0] && c[1]; }),
      likes: { every: +$('#ttLikeN').value || 0, action: $('#ttLikeA').value.trim(), label: $('#ttLikeL').value.trim() },
      follow: $('#ttFollow').value.trim()
    };
  }
  function panelState(msg) { var c = $('#ttConn'); if (c) c.innerHTML = online ? '<span class="ok">● Brücke verbunden</span> ' + esc(msg || '') : '<span class="bad">○ Brücke nicht verbunden</span> – auf dem Stream-PC <code>node tools/tiktok-bridge.mjs DEIN_TIKTOK_NAME</code> starten (gespeichert wird dann nur in diesem Browser).'; }
  P2.addEventListener('input', function () { editing = true; });
  P2.addEventListener('click', function (e) {
    var t = e.target;
    if (t.dataset.add) { editing = true; var tb = t.dataset.add === 'g' ? $('#ttGifts') : $('#ttCmds'); tb.insertAdjacentHTML('beforeend', t.dataset.add === 'g' ? giftRow({ gift: '', action: 'pad:A' }) : cmdRow(['', 'pad:A'])); }
    else if (t.hasAttribute('data-del')) { editing = true; t.closest('tr').remove(); }
    else if (t.hasAttribute('data-test')) { var a = t.closest('tr').querySelector('[list="ttAct"]').value; P2.style.display = 'none'; toast('Test: ' + a); run(a, 'Test'); setTimeout(function () { P2.style.display = ''; }, 2500); }
    else if (t.id === 'ttSave') {
      var v = read();
      if (scope === 'game') { cfg.games = cfg.games || {}; cfg.games[GID] = v; } else { var games = cfg.games || {}; cfg = Object.assign(v, { games: games }); }
      editing = false; try { localStorage.setItem('eg-tiktok', JSON.stringify(cfg)); } catch (x) { }
      send({ type: 'setConfig', config: cfg }); drawLegend(); $('#ttMsg').textContent = online ? 'Gespeichert – gilt sofort auch im Stream.' : 'Gespeichert (nur in diesem Browser, Brücke fehlt).';
    }
    else if (t.id === 'ttReset') { editing = true; if (scope === 'game') { if (cfg.games) delete cfg.games[GID]; } else { var gs = cfg.games; cfg = clone(DEFAULT); cfg.games = gs || {}; } panelFill(); }
    else if (t.id === 'ttClose') { P2.style.display = 'none'; toast('Einstellungen: Seite ohne „&setup=1“ in OBS verwenden'); setTimeout(function () { P2.style.display = ''; }, 6000); }
  });
  $('#ttScope').addEventListener('change', function () { scope = this.value; panelFill(); });
  panelFill(); panelState();
})();
