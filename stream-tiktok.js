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
    'pad:A*5', 'key:Space', 'key:Enter', 'key:Escape', 'restart', 'reset', 'say:Danke {user}! ❤️', 'banner:{user} rettet das Spiel!',
    'fx:shake', 'fx:spin', 'fx:flip:10', 'fx:mirror:15', 'fx:invert:10', 'fx:gray:10', 'fx:party:10', 'fx:zoom:8', 'fx:black:3', 'fx:rain:🌹',
    'swap:15', 'freeze:5', 'chaos:8', 'restart+fx:shake'];
  var DEFAULT = {
    mode: 'chaos', voteSec: 3, legend: 'tr',
    commands: [['links', 'pad:LEFT'], ['rechts', 'pad:RIGHT'], ['hoch', 'pad:UP'], ['runter', 'pad:DOWN'], ['a', 'pad:A'], ['b', 'pad:B'], ['spring', 'pad:A'], ['start', 'pad:START']],
    gifts: [{ gift: 'Rose', icon: '🌹', action: 'pad:A+fx:rain:🌹', label: 'A drücken' }, { gift: 'Finger Heart', icon: '🫰', action: 'pad:B', label: 'B drücken' },
      { gift: 'Doughnut', icon: '🍩', action: 'fx:shake+fx:rain:🍩', label: 'Erdbeben' }, { gift: 'Lion', icon: '🦁', action: 'swap:15', label: 'Steuerung vertauscht' },
      { gift: 'Galaxy', icon: '🌌', action: 'banner:{user} startet neu!+restart', label: 'Neustart!' }, { gift: 'Universe', icon: '🪐', action: 'chaos:10+fx:party:10', label: 'Chaos-Modus' }],
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
  var queue = Promise.resolve(), swapUntil = 0, freezeUntil = 0;
  var SWAP = { LEFT: 'RIGHT', RIGHT: 'LEFT', UP: 'DOWN', DOWN: 'UP' };
  function press(i, done) {
    padApi(function (N) { N.press(i, 1); setTimeout(function () { N.press(i, 0); setTimeout(done, 90); }, 160); });
    setTimeout(done, 900);   // falls das Spiel noch lädt: nicht hängen bleiben
  }
  // Effekte auf das Spiel (Stream: iframe, Windows-App: ganze Seite) und Einblendungen
  function fxTarget() { return EMB ? document.documentElement : S.frame; }
  var fxCss = document.createElement('style');
  fxCss.textContent = '@keyframes ttShake{0%,100%{translate:0 0}20%{translate:-14px 6px}40%{translate:12px -8px}60%{translate:-10px -6px}80%{translate:10px 8px}}' +
    '@keyframes ttSpin{to{rotate:360deg}}@keyframes ttRain{from{transform:translateY(-60px) rotate(0)}to{transform:translateY(110vh) rotate(540deg)}}' +
    '@keyframes ttBan{0%{transform:translate(-50%,-50%) scale(.3);opacity:0}15%{transform:translate(-50%,-50%) scale(1.08);opacity:1}85%{opacity:1}100%{transform:translate(-50%,-50%) scale(1);opacity:0}}' +
    '.tt-rain{position:absolute;top:0;font-size:34px;animation:ttRain linear forwards}.tt-ban{position:absolute;left:50%;top:45%;width:88%;padding:16px 18px;border-radius:18px;text-align:center;' +
    'background:linear-gradient(110deg,rgba(236,72,153,.95),rgba(139,92,246,.95));font-size:24px;font-weight:900;box-shadow:0 10px 40px rgba(0,0,0,.5);animation:ttBan 3.5s ease-out forwards}' +
    '.tt-black{position:absolute;inset:0;background:#000;display:flex;align-items:center;justify-content:center;font-size:40px}';
  document.head.appendChild(fxCss);
  function fx(name, arg) {
    var t = fxTarget(), sec = Math.max(1, Math.min(30, +arg || 0));
    if (name === 'shake') { t.style.animation = 'none'; void t.offsetWidth; t.style.animation = 'ttShake .12s linear ' + Math.round((sec || 1.5) / .12); return; }
    if (name === 'spin') { t.style.animation = 'ttSpin 1.2s ease-in-out'; setTimeout(function () { t.style.animation = ''; }, 1300); return; }
    if (name === 'rain') { for (var k = 0; k < 26; k++) { var d = document.createElement('div'); d.className = 'tt-rain'; d.textContent = arg || '🌹'; d.style.left = Math.random() * 94 + '%'; d.style.animationDuration = (1.6 + Math.random() * 1.8) + 's'; d.style.animationDelay = Math.random() * 1.2 + 's'; S.stage.appendChild(d); setTimeout(d.remove.bind(d), 5000); } return; }
    if (name === 'black') { var b = document.createElement('div'); b.className = 'tt-black'; b.textContent = '🙈'; S.stage.appendChild(b); setTimeout(b.remove.bind(b), (sec || 3) * 1000); return; }
    var css = { flip: 'rotate(180deg)', mirror: 'scaleX(-1)', zoom: 'scale(1.6)', small: 'scale(.6)' }[name], filt = { invert: 'invert(1) hue-rotate(180deg)', gray: 'grayscale(1)', blur: 'blur(4px)', party: 'hue-rotate(160deg) saturate(2.5)' }[name];
    if (css || filt) {
      if (css) { t.style.transition = 'transform .5s'; t.style.transform = css; } else t.style.filter = filt;
      setTimeout(function () { if (css) t.style.transform = ''; else t.style.filter = ''; }, (sec || 10) * 1000);
    }
  }
  function banner(text) { var d = document.createElement('div'); d.className = 'tt-ban'; d.textContent = text; S.stage.appendChild(d); setTimeout(d.remove.bind(d), 3600); }
  // Spielstand löschen: Schlüssel des Spiels (Speicher-Präfixe aus sync/catalog.json); Sicherung zum Wiederherstellen in den Einstellungen
  var catalog = null;
  function prefixes(cb) {
    if (catalog) return cb(catalog);
    fetch(EMB ? '/sync/catalog.json' : new URL('sync/catalog.json', location.href).href).then(function (r) { return r.json(); }).then(function (c) {
      var g = (c.games || []).find(function (x) { return x.id === GID || (x.path || '').replace(/\/$/, '') === GID; });
      catalog = g && g.cloud && g.cloud.prefix ? String(g.cloud.prefix).split(',').map(function (x) { return x.trim(); }).filter(Boolean) : [];
      cb(catalog);
    }).catch(function () { cb([]); });
  }
  function resetSave(user) {
    prefixes(function (pre) {
      var w = gameWin(); if (!w || !pre.length) { toast('Spielstand löschen geht bei diesem Spiel nicht'); return; }
      var ls = w.localStorage, bak = {}, n = 0;
      for (var k = ls.length - 1; k >= 0; k--) { var key = ls.key(k); if (pre.some(function (p) { return key.indexOf(p) === 0; })) { bak[key] = ls.getItem(key); n++; } }
      try { localStorage.setItem('eg-tiktok-backup:' + GID, JSON.stringify({ t: Date.now(), keys: bak })); } catch (e) { }
      Object.keys(bak).forEach(function (key) { ls.removeItem(key); });
      banner('💥 ' + (user || 'Jemand') + ' hat den Spielstand gelöscht!');
      setTimeout(function () { try { w.location.reload(); } catch (e) { S.restart(); } }, 1500);
    });
  }
  function restoreSave() {
    var b = null; try { b = JSON.parse(localStorage.getItem('eg-tiktok-backup:' + GID) || 'null'); } catch (e) { }
    var w = gameWin(); if (!b || !w) return false;
    Object.keys(b.keys).forEach(function (k) { w.localStorage.setItem(k, b.keys[k]); });
    try { w.location.reload(); } catch (e) { S.restart(); }
    return true;
  }
  function gameActions() { var w = gameWin(); try { return (w && w.EasyGamesStream && w.EasyGamesStream.actions) || []; } catch (e) { return []; } }
  // Aktionen: mehrere mit „+“ verbinden, Wiederholung mit „*n“ (z. B. pad:A*5)
  function run(action, user, times) {
    String(action || '').split('+').forEach(function (one) { run1(one.trim(), user, times); });
  }
  function run1(action, user, times) {
    times = Math.max(1, Math.min(20, times || 1));
    var rep = /\*(\d+)$/.exec(action); if (rep) { action = action.slice(0, rep.index); times = Math.min(30, times * +rep[1]); }
    var m = /^(\w+):?(.*)$/.exec(action); if (!m) return;
    var kind = m[1], arg = m[2], txt = arg.replace(/\{user\}/g, user || '');
    if (Date.now() < freezeUntil && (kind === 'pad' || kind === 'key')) return;
    if (kind === 'restart') { try { S.frame.contentWindow.location.reload(); } catch (e) { S.restart(); } return; }
    if (kind === 'say') { toast(txt); return; }
    if (kind === 'banner') { banner(txt); return; }
    if (kind === 'fx') { var a = arg.split(':'); fx(a[0], a[1]); return; }
    if (kind === 'reset') { resetSave(user); return; }
    if (kind === 'swap') { swapUntil = Date.now() + Math.min(60, +arg || 15) * 1000; banner('🔀 Steuerung vertauscht!'); return; }
    if (kind === 'freeze') { freezeUntil = Date.now() + Math.min(30, +arg || 5) * 1000; banner('❄️ Steuerung eingefroren!'); return; }
    if (kind === 'chaos') { var end = Date.now() + Math.min(30, +arg || 8) * 1000, keys = Object.keys(BTN).slice(0, 4).concat(['UP', 'DOWN', 'LEFT', 'RIGHT']); banner('🌀 Chaos!'); (function tick() { if (Date.now() > end) return; run1('pad:' + keys[Math.floor(Math.random() * keys.length)], user); setTimeout(tick, 350); })(); return; }
    if (kind === 'game') {
      var ga = gameActions().find(function (x) { return x.id === arg; });
      if (!ga) { toast('Dieses Spiel kennt „' + arg + '“ nicht'); return; }
      for (var g = 0; g < Math.min(times, 5); g++) { try { ga.run(user); } catch (e) { } }
      return;
    }
    for (var n = 0; n < times; n++) queue = queue.then(function () {
      return new Promise(function (done) {
        var b = arg.toUpperCase(); if (Date.now() < swapUntil && SWAP[b]) b = SWAP[b];
        if (kind === 'pad' && BTN[b] !== undefined) press(BTN[b], done);
        else if (kind === 'key' && arg) { key(arg, true); setTimeout(function () { key(arg, false); setTimeout(done, 90); }, 160); }
        else done();
      });
    });
  }
  window.EG_TIKTOK = { run: run, config: function () { return cfg; }, restore: restoreSave, gameActions: gameActions };

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
    '<h3>🎁 Geschenke</h3><div class="s">Name wie bei TikTok (z. B. Rose, Galaxy, Lion, Universe). Aktionen (mit + kombinierbar, *5 = fünfmal): pad:A … pad:RIGHT (Controller), key:Space (Taste), restart (Neustart), reset (Spielstand löschen!), fx:shake / spin / flip / mirror / invert / gray / party / zoom / black / rain:🌹 (Effekte, :Sekunden), swap:15 (Steuerung vertauscht), freeze:5, chaos:8, banner:Text, say:Text, game:… (Highlights des Spiels, siehe unten).</div><table id="ttGifts"></table><button data-add="g">+ Geschenk</button>' +
    '<h3>💬 Chat-Befehle</h3><table id="ttCmds"></table><button data-add="c">+ Befehl</button>' +
    '<h3>❤️ Likes und Follows</h3><div class="row"><label>alle <input id="ttLikeN" type="number" min="0" style="width:90px"> Likes</label><label>Aktion <input id="ttLikeA" list="ttAct"></label><label>Text <input id="ttLikeL"></label></div>' +
    '<div class="row"><label>Follow <input id="ttFollow" list="ttAct" style="width:340px"></label></div>' +
    '<h3>⭐ Highlights dieses Spiels</h3><div class="s" id="ttGame">wird geladen …</div>' +
    '<div class="row"><button id="ttRestore">↩ Gelöschten Spielstand wiederherstellen</button></div>' +
    '<div class="row" style="margin-top:16px"><button class="p" id="ttSave">Speichern</button><button id="ttReset">Standard</button><button id="ttClose">Vorschau ansehen</button><span id="ttMsg" class="s"></span></div>' + dl;
  var $ = function (s) { return P2.querySelector(s); };
  function giftRow(g) { return '<tr><td style="width:60px"><input data-k="icon" value="' + esc(g.icon || '🎁') + '"></td><td><input data-k="gift" placeholder="Geschenk" value="' + esc(g.gift) + '"></td><td><input data-k="action" list="ttAct" value="' + esc(g.action) + '"></td><td><input data-k="label" placeholder="Text in der Legende" value="' + esc(g.label || '') + '"></td><td style="width:120px"><button data-test>Test</button> <button data-del>✕</button></td></tr>'; }
  function cmdRow(c) { return '<tr><td><input data-k="0" placeholder="Wort im Chat" value="' + esc(c[0]) + '"></td><td><input data-k="1" list="ttAct" value="' + esc(c[1]) + '"></td><td style="width:120px"><button data-test>Test</button> <button data-del>✕</button></td></tr>'; }
  function panelFill() {
    var e = scope === 'game' ? eff() : cfg, ga = gameActions();
    var dlE = P2.querySelector('#ttAct'); if (dlE) dlE.innerHTML = ACTIONS.concat(ga.map(function (a) { return 'game:' + a.id; })).map(function (a) { return '<option value="' + esc(a) + '">'; }).join('');
    var gi = P2.querySelector('#ttGame'); if (gi) gi.innerHTML = ga.length ? ga.map(function (a) { return esc(a.icon || '⭐') + ' <code>game:' + esc(a.id) + '</code> – ' + esc(a.label); }).join('<br>') : 'Dieses Spiel hat keine eigenen Highlights – Effekte, Neustart und „reset“ (Spielstand löschen) gehen trotzdem.';
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
    else if (t.id === 'ttRestore') { $('#ttMsg').textContent = restoreSave() ? 'Spielstand wiederhergestellt.' : 'Kein gelöschter Spielstand vorhanden.'; }
    else if (t.id === 'ttClose') { P2.style.display = 'none'; toast('Einstellungen: Seite ohne „&setup=1“ in OBS verwenden'); setTimeout(function () { P2.style.display = ''; }, 6000); }
  });
  $('#ttScope').addEventListener('change', function () { scope = this.value; panelFill(); });
  panelFill(); panelState();
  S.frame.addEventListener && S.frame.addEventListener('load', function () { setTimeout(function () { if (!editing) panelFill(); }, 800); });
  setTimeout(function () { if (!editing) panelFill(); }, 2500);
})();
