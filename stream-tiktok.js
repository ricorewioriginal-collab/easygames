/*!
 * stream-tiktok.js – TikTok LIVE steuert das Spiel im Stream-Overlay (stream.html), ohne dass ein Spiel umgebaut wird.
 *
 *   stream.html?game=<id>&tiktok=1            Overlay mit TikTok-Steuerung (Brücke: ws://127.0.0.1:21213)
 *   stream.html?game=<id>&tiktok=1&setup=1    Einstellungen (im normalen Browser öffnen, gilt sofort auch in OBS)
 *   tiktok=ws://rechner:port                   andere Adresse der Brücke
 *   view=all (Standard) | game (nur Spiel + Streiche) | info (nur Einblendungen, durchsichtig) | legend | feed | top
 *   format=9x16 | 16x9 (stream.html) – für OBS und TikTok LIVE Studio hochkant oder quer
 *
 * Windows-App: setzt window.EG_TIKTOK_EMBED = { ws, id, title, setup } vor dieser Datei – dann wirkt alles direkt im Spielfenster
 * (dieselbe Datei, dieselben Einstellungen und Streiche).
 * Ereignisse kommen von der kleinen Brücke auf dem Stream-PC (tools/tiktok-bridge.mjs): Kommentare, Geschenke, Likes, Follows,
 * Teilen, Abos, Beitritte. Aktionen siehe ACTS (mit + kombinierbar, *n = n-mal); Belegung für alle Spiele oder je Spiel,
 * gespeichert in der Brücke (tiktok-config.json), damit Einstellungen, OBS und App dieselbe sehen. Ohne Brücke: Browserspeicher.
 */
(function boot() {
  'use strict';
  var P = new URLSearchParams(location.search), S = window.EG_STREAM, EMB = window.EG_TIKTOK_EMBED;
  if (window.EG_TIKTOK) return;
  if (EMB) {   // im Spielfenster der Windows-App: Einblendungen über dem Spiel, Controller im selben Fenster
    if (!document.body) { document.addEventListener('DOMContentLoaded', boot); return; }
    var st0 = document.createElement('div'); st0.className = 'full'; st0.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483000'; document.body.appendChild(st0);
    S = { game: { id: EMB.id, title: EMB.title || EMB.id }, frame: { contentWindow: window }, stage: st0, restart: function () { location.reload(); } };
    P = new URLSearchParams({ tiktok: EMB.ws || '1', setup: EMB.setup ? '1' : '' });
  }
  if (!P.get('tiktok') || !S) return;
  var URLWS = /^wss?:\/\//.test(P.get('tiktok')) ? P.get('tiktok') : 'ws://127.0.0.1:21213', SETUP = P.get('setup') === '1', GID = S.game.id;
  // Ansicht: game = Spiel mit Streichen ohne Infos, info/legend/feed/top = nur Einblendungen (zweite Quelle darüber in OBS)
  var VIEW = EMB || SETUP ? 'all' : (/^(game|info|legend|feed|top)$/.test(P.get('view')) ? P.get('view') : 'all'), NOGAME = !!S.noGame;
  var shows = function (n) { return VIEW === 'all' || VIEW === n || (VIEW === 'info' && n !== 'game'); };
  var BTN = { A: 0, B: 1, X: 2, Y: 3, LB: 4, RB: 5, LT: 6, RT: 7, SELECT: 8, START: 9, L3: 10, R3: 11, UP: 12, DOWN: 13, LEFT: 14, RIGHT: 15 };
  // Alle Aktionen mit Bild, Text und Gruppe (Auswahl in den Einstellungen, Legende, Streiche-Liste)
  var ACTS = [
    ['pad:A', '🅰️', 'A drücken', 'pad'], ['pad:B', '🅱️', 'B drücken', 'pad'], ['pad:X', '❎', 'X drücken', 'pad'], ['pad:Y', '🟨', 'Y drücken', 'pad'],
    ['pad:UP', '⬆️', 'hoch', 'pad'], ['pad:DOWN', '⬇️', 'runter', 'pad'], ['pad:LEFT', '⬅️', 'links', 'pad'], ['pad:RIGHT', '➡️', 'rechts', 'pad'],
    ['pad:START', '⏯️', 'Start/Pause', 'pad'], ['pad:SELECT', '🔘', 'Select', 'pad'], ['pad:LB', '◀️', 'LB', 'pad'], ['pad:RB', '▶️', 'RB', 'pad'], ['pad:A*5', '🔁', '5× A', 'pad'],
    ['key:Space', '␣', 'Leertaste', 'pad'], ['key:Enter', '↩️', 'Enter', 'pad'], ['key:Escape', '⎋', 'Escape', 'pad'],
    ['invert:10', '🙃', 'Steuerung des Spielers vertauscht', 'troll'], ['nokeys:5', '🚫', 'Steuerung weg', 'troll'], ['lag:10', '🐌', 'Eingaben verzögert', 'troll'],
    ['drift:8', '🌬️', 'Sturm schiebt die Figur', 'troll'], ['slow:10', '🐢', 'Zeitlupe', 'troll'], ['fast:10', '⚡', 'Turbo', 'troll'], ['bomb:20', '💣', 'Bombe – Chat muss retten', 'troll'],
    ['blind:8', '🔦', 'Licht aus', 'troll'], ['fog:10', '🌫️', 'Nebel', 'troll'], ['drunk:10', '🥴', 'Betrunken', 'troll'], ['popup', '📢', 'Werbe-Popup', 'troll'],
    ['crash', '😵', 'Fake-Absturz', 'troll'], ['scare', '👻', 'Jumpscare', 'troll'], ['chaos:8', '🌀', 'Chaos-Tasten', 'troll'], ['swap:15', '🔀', 'Zuschauer-Steuerung vertauscht', 'troll'],
    ['freeze:5', '❄️', 'Zuschauer-Befehle eingefroren', 'troll'], ['restart', '🔄', 'Neustart', 'troll'], ['reset', '💥', 'Spielstand löschen', 'troll'],
    ['fx:shake', '🌋', 'Erdbeben', 'fx'], ['fx:spin', '🌀', 'Drehung', 'fx'], ['fx:flip:10', '🙂‍↕️', 'Bild auf dem Kopf', 'fx'], ['tilt:10', '📐', 'Schief', 'fx'], ['dance:10', '🕺', 'Tanzendes Bild', 'fx'],
    ['fx:mirror:15', '🪞', 'Gespiegelt', 'fx'], ['ghost:8', '👻', 'Unsichtbar', 'fx'], ['blur:8', '👓', 'Verschwommen', 'fx'], ['fx:invert:10', '🎨', 'Farben umgedreht', 'fx'],
    ['fx:gray:10', '⚫', 'Schwarz-Weiß', 'fx'], ['fx:party:10', '🎉', 'Party-Farben', 'fx'], ['fx:zoom:8', '🔍', 'Zoom', 'fx'], ['fx:small:8', '🐜', 'Winzig', 'fx'], ['fx:black:3', '⬛', 'Schwarzbild', 'fx'],
    ['fx:rain:🌹', '🌹', 'Rosen-Regen', 'fx'], ['fx:rain:💩', '💩', 'Kacki-Regen', 'fx'], ['fx:rain:💸', '💸', 'Geld-Regen (nur Bild)', 'fx'],
    ['say:Danke {user}! ❤️', '💬', 'Danke einblenden', 'text'], ['banner:{user} rettet das Spiel!', '📣', 'Großes Banner', 'text']];
  var GROUPS = { pad: '🎮 Steuern', troll: '😈 Streiche', fx: '✨ Effekte', game: '⭐ Highlights dieses Spiels', text: '💬 Text' };
  var TROLL_STRIP = ACTS.filter(function (a) { return a[3] === 'troll'; });
  // Bekannte TikTok-Geschenke (inoffiziell, Namen können je Land abweichen); die Brücke liefert zusätzlich die aktuelle Liste mit Bildern
  var GIFTS = [['Rose', '🌹', 1], ['TikTok', '🎵', 1], ['GG', '🎮', 1], ['Ice Cream Cone', '🍦', 1], ['Heart Me', '💗', 1], ['Finger Heart', '🫰', 5], ['Friendship Necklace', '📿', 10],
    ['Rosa', '🌸', 10], ['Perfume', '🧴', 20], ['Doughnut', '🍩', 30], ['Hand Hearts', '🫶', 100], ['Confetti', '🎊', 100], ['Paper Crane', '🕊️', 99], ['Little Crown', '👑', 99],
    ['Cap', '🧢', 99], ['Hat and Mustache', '🎩', 99], ['Corgi', '🐕', 299], ['Swan', '🦢', 699], ['Money Gun', '💸', 500], ['Gaming Chair', '🪑', 1200], ['Galaxy', '🌌', 1000],
    ['Fireworks', '🎆', 1088], ['Unicorn Fantasy', '🦄', 5000], ['Lion', '🦁', 29999], ['Universe', '🪐', 34999], ['TikTok Universe', '🌠', 44999]];
  var liveGifts = [];
  var DEFAULT = {
    mode: 'chaos', voteSec: 3, legend: 'tr', cooldown: 0, top: true, bombWord: 'retten', bombNeed: 5,
    commands: [['links', 'pad:LEFT'], ['rechts', 'pad:RIGHT'], ['hoch', 'pad:UP'], ['runter', 'pad:DOWN'], ['a', 'pad:A'], ['b', 'pad:B'], ['spring', 'pad:A'], ['start', 'pad:START']],
    gifts: [{ gift: 'Rose', icon: '🌹', action: 'pad:A+fx:rain:🌹', label: 'A drücken' }, { gift: 'Finger Heart', icon: '🫰', action: 'pad:B', label: 'B drücken' },
      { gift: 'Doughnut', icon: '🍩', action: 'fx:shake+fx:rain:🍩', label: 'Erdbeben' }, { gift: 'Lion', icon: '🦁', action: 'swap:15', label: 'Steuerung vertauscht' },
      { gift: 'Galaxy', icon: '🌌', action: 'banner:{user} startet neu!+restart', label: 'Neustart!' }, { gift: 'Universe', icon: '🪐', action: 'chaos:10+fx:party:10', label: 'Chaos-Modus' }],
    likes: { every: 100, action: 'pad:A', label: 'A drücken' },
    follow: 'say:Danke für den Follow, {user}! ❤️', share: 'say:{user} teilt den LIVE! 🔁', sub: 'banner:⭐ {user} ist jetzt Abonnent!+fx:party:5', join: '',
    games: {}
  };
  var cfg = load(), ws = null, online = false, votes = {}, likeSum = 0, fans = {}, lastCmd = {}, joinT = 0;

  function load() { try { return Object.assign(clone(DEFAULT), JSON.parse(localStorage.getItem('eg-tiktok') || 'null') || {}); } catch (e) { return clone(DEFAULT); } }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  // Belegung für dieses Spiel: eigene Einträge des Spiels ersetzen die allgemeinen
  function eff() { var g = (cfg.games || {})[GID] || {}, o = {}; for (var k in cfg) if (k !== 'games') o[k] = g[k] !== undefined ? g[k] : cfg[k]; return o; }
  function actInfo(a) { return ACTS.find(function (x) { return x[0] === a; }); }
  function giftInfo(name) {
    var n = String(name || '').toLowerCase(), l = liveGifts.find(function (g) { return String(g.name).toLowerCase() === n; }), s = GIFTS.find(function (g) { return g[0].toLowerCase() === n; });
    return { img: l && l.img || '', icon: s ? s[1] : '', diamonds: (l && l.diamonds) || (s && s[2]) || 0 };
  }

  // ---------- Einblendungen: Geschenke-Legende, Ereignis-Liste, Like-Leiste, Top-Fans ----------
  // Positionen hängen am Rahmen von stream.html: p = hochkant mit Titel/QR, l = quer mit Seitenleiste, full = nur Spiel (auch Windows-App)
  var css = document.createElement('style');
  css.textContent = '.tt{position:absolute;z-index:20;font-family:system-ui,"Segoe UI",sans-serif;color:#fff;pointer-events:none}' +
    '.tt-leg,.tt-top{padding:8px 10px;border-radius:12px;background:rgba(5,7,13,.78);font-size:12px;line-height:1.5;max-width:46%;box-shadow:0 4px 14px rgba(0,0,0,.4);backdrop-filter:blur(4px)}' +
    '.tt-leg b,.tt-top b{display:block;font-size:11px;color:#7ff3ff;letter-spacing:.04em;margin-bottom:2px}.tt-leg .r,.tt-top .r{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.tt-leg .c,.tt-top .c{color:#ffd84a;font-weight:700}.tt-leg img{width:16px;height:16px;vertical-align:-3px}' +
    '.tt-tr{top:58px;right:8px}.tt-tl{top:58px;left:8px}.tt-br{bottom:100px;right:8px}.tt-bl{bottom:100px;left:8px}' +
    '.tt-feed{left:8px;right:8px;bottom:96px;display:flex;flex-direction:column;align-items:flex-start;gap:5px}' +
    '.tt-feed div{padding:6px 11px;border-radius:999px;background:linear-gradient(90deg,rgba(236,72,153,.92),rgba(139,92,246,.92));font-size:13px;font-weight:700;box-shadow:0 4px 12px rgba(0,0,0,.35);animation:ttIn .25s ease-out}' +
    '@keyframes ttIn{from{transform:translateX(-20px);opacity:0}to{transform:none;opacity:1}}' +
    '.tt-like{left:8px;right:8px;top:52px;height:8px;border-radius:4px;background:rgba(255,255,255,.18);overflow:hidden}.tt-like i{display:block;height:100%;width:0;background:linear-gradient(90deg,#f472b6,#fb7185);transition:width .3s}' +
    '.tt-vote{left:50%;top:40%;transform:translate(-50%,-50%);padding:10px 16px;border-radius:14px;background:rgba(5,7,13,.82);font-size:15px;font-weight:800;text-align:center}' +
    '.tt-state{right:8px;bottom:8px;font-size:10px;opacity:.6}' +
    '.l .tt-tr,.l .tt-tl,.full .tt-tr,.full .tt-tl{top:16px}.l .tt-br,.l .tt-bl,.full .tt-br,.full .tt-bl{bottom:12px}.l .tt-tr,.l .tt-br{right:258px}' +
    '.l .tt-feed,.full .tt-feed{bottom:12px}.l .tt-feed,.l .tt-like{right:258px}.l .tt-like,.full .tt-like{top:4px}.l .tt-state{right:258px}.l .tt-leg,.l .tt-top{max-width:30%}';
  document.head.appendChild(css);
  function box(cls) { var d = document.createElement('div'); d.className = 'tt ' + cls; S.stage.appendChild(d); return d; }
  var legend = box('tt-leg'), feed = box('tt-feed'), likeBar = box('tt-like'), vote = box('tt-vote'), top = box('tt-top'), state = box('tt-state');
  likeBar.innerHTML = '<i></i>'; vote.style.display = 'none'; top.style.display = 'none';
  if (!shows('feed')) feed.style.display = 'none';
  if (!shows('legend') && !shows('feed') && !shows('top')) state.style.display = 'none';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var OPP = { tr: 'tl', tl: 'tr', br: 'bl', bl: 'br' };
  function drawLegend() {
    var e = eff(), rows = [];
    (e.gifts || []).forEach(function (g) { if (g.gift) { var gi = giftInfo(g.gift); rows.push('<div class="r">' + (gi.img ? '<img src="' + esc(gi.img) + '" alt="">' : esc(g.icon || gi.icon || '🎁')) + ' <span class="c">' + esc(g.gift) + '</span> → ' + esc(g.label || g.action) + '</div>'); } });
    if (e.likes && e.likes.every > 0) rows.push('<div class="r">❤️ <span class="c">' + e.likes.every + ' Likes</span> → ' + esc(e.likes.label || e.likes.action) + '</div>');
    var cmds = (e.commands || []).map(function (c) { return c[0]; }).filter(Boolean);
    if (cmds.length) rows.push('<div class="r">💬 Schreib: <span class="c">' + esc(cmds.slice(0, 6).join(' · ')) + '</span></div>');
    legend.innerHTML = '<b>' + (e.mode === 'vote' ? 'TIKTOK STEUERT · ABSTIMMUNG' : 'TIKTOK STEUERT DAS SPIEL') + '</b>' + rows.join('');
    legend.className = 'tt tt-leg tt-' + (e.legend && e.legend !== 'off' ? e.legend : 'tr'); legend.style.display = e.legend === 'off' || !rows.length || !shows('legend') ? 'none' : '';
    likeBar.style.display = e.likes && e.likes.every > 0 && shows('legend') ? '' : 'none';
    top.className = 'tt tt-top tt-' + (OPP[e.legend] || 'tr'); drawTop();
  }
  function drawTop() {
    var e = eff(), k = Object.keys(fans).sort(function (a, b) { return fans[b] - fans[a]; }).slice(0, 3);
    if (!e.top || !k.length || !shows('top')) { top.style.display = 'none'; return; }
    top.style.display = ''; top.innerHTML = '<b>🏆 TOP-FANS</b>' + k.map(function (u, i) { return '<div class="r">' + ['🥇', '🥈', '🥉'][i] + ' ' + esc(u) + ' <span class="c">' + fans[u] + '💎</span></div>'; }).join('');
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
    var n = 0; (function wait() { var w2 = gameWin(); if (w2 && w2.EasyGamesPadNormal && w2.EasyGamesPadNormal.press) cb(w2.EasyGamesPadNormal); else if (++n < 30) setTimeout(wait, 100); })();   // bis gamepad.js geladen ist (max. 3 s)
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
    '@keyframes ttDrunk{0%,100%{rotate:0deg;translate:0 0}25%{rotate:4deg;translate:12px 4px}50%{rotate:-3deg;translate:-10px -3px}75%{rotate:5deg;translate:6px 6px}}' +
    '@keyframes ttDance{0%,100%{scale:1;rotate:0deg}25%{scale:1.06;rotate:-5deg}50%{scale:.95;rotate:0deg}75%{scale:1.06;rotate:5deg}}' +
    '@keyframes ttBan{0%{transform:translate(-50%,-50%) scale(.3);opacity:0}15%{transform:translate(-50%,-50%) scale(1.08);opacity:1}85%{opacity:1}100%{transform:translate(-50%,-50%) scale(1);opacity:0}}' +
    '@keyframes ttScare{0%{transform:scale(.2);opacity:0}20%{transform:scale(1.3);opacity:1}100%{transform:scale(1);opacity:0}}' +
    '.tt-rain{position:absolute;top:0;font-size:34px;animation:ttRain linear forwards}.tt-ban{position:absolute;left:50%;top:45%;width:88%;max-width:900px;padding:16px 18px;border-radius:18px;text-align:center;' +
    'background:linear-gradient(110deg,rgba(236,72,153,.95),rgba(139,92,246,.95));font-size:24px;font-weight:900;box-shadow:0 10px 40px rgba(0,0,0,.5);animation:ttBan 3.5s ease-out forwards;z-index:40}' +
    '.tt-black{position:absolute;inset:0;background:#000;display:flex;align-items:center;justify-content:center;font-size:40px;z-index:26}' +
    '.tt-crash{position:absolute;inset:0;z-index:27;background:#f3f3f3;color:#111;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;font:600 17px system-ui,"Segoe UI",sans-serif;text-align:center;padding:20px}' +
    '.tt-crash i{width:34px;height:34px;border:4px solid #bbb;border-top-color:#0b74de;border-radius:50%;animation:ttSpin 1s linear infinite}' +
    '.tt-scare{position:absolute;inset:0;z-index:28;display:flex;align-items:center;justify-content:center;font-size:220px;background:rgba(160,0,0,.55);animation:ttScare .9s ease-out forwards}' +
    '.tt-bomb{position:absolute;left:50%;top:18%;transform:translateX(-50%);z-index:35;padding:10px 16px;border-radius:14px;background:rgba(20,0,0,.88);border:2px solid #f87171;font:800 18px system-ui,sans-serif;color:#fff;text-align:center;white-space:nowrap}';
  document.head.appendChild(fxCss);
  function layer(cls, html, ms, cssText) { var d = document.createElement('div'); if (cls) d.className = cls; if (cssText) d.style.cssText = cssText; if (html) d.innerHTML = html; S.stage.appendChild(d); if (ms) setTimeout(d.remove.bind(d), ms); return d; }
  function fx(name, arg) {
    var t = fxTarget(), sec = Math.max(1, Math.min(30, +arg || 0));
    if (!t || !t.style) return;
    if (name === 'shake') { t.style.animation = 'none'; void t.offsetWidth; t.style.animation = 'ttShake .12s linear ' + Math.round((sec || 1.5) / .12); return; }
    if (name === 'spin') { t.style.animation = 'ttSpin 1.2s ease-in-out'; setTimeout(function () { t.style.animation = ''; }, 1300); return; }
    if (name === 'drunk' || name === 'dance') { t.style.animation = name === 'drunk' ? 'ttDrunk 2.6s ease-in-out infinite' : 'ttDance .6s ease-in-out infinite'; setTimeout(function () { t.style.animation = ''; }, (+arg || 10) * 1000); return; }
    if (name === 'rain') { for (var k = 0; k < 26; k++) { var d = layer('tt-rain', '', 5000); d.textContent = arg || '🌹'; d.style.left = Math.random() * 94 + '%'; d.style.animationDuration = (1.6 + Math.random() * 1.8) + 's'; d.style.animationDelay = Math.random() * 1.2 + 's'; } return; }
    if (name === 'black') { layer('tt-black', '🙈', (sec || 3) * 1000); return; }
    var tf = { flip: 'rotate(180deg)', mirror: 'scaleX(-1)', zoom: 'scale(1.6)', small: 'scale(.6)', tilt: 'rotate(14deg) scale(.9)' }[name],
      filt = { invert: 'invert(1) hue-rotate(180deg)', gray: 'grayscale(1)', blur: 'blur(5px)', party: 'hue-rotate(160deg) saturate(2.5)', ghost: 'opacity(.18)' }[name];
    if (tf || filt) {
      if (tf) { t.style.transition = 'transform .5s'; t.style.transform = tf; } else t.style.filter = filt;
      setTimeout(function () { if (tf) t.style.transform = ''; else t.style.filter = ''; }, (sec || 10) * 1000);
    }
  }
  // Zeitlupe / Turbo: Zeit im Spiel langsamer oder schneller (performance.now, Date.now, requestAnimationFrame)
  function timeScale(k, sec) {
    var w = gameWin(); if (!w) return;
    if (!w.__egT) {
      var pn = w.performance.now.bind(w.performance), raf = w.requestAnimationFrame.bind(w), base = pn(), virt = base, scale = 1, off = w.Date.now() - base;
      var now = function () { var r = pn(); virt += (r - base) * scale; base = r; return virt; };
      w.__egT = { set: function (x) { now(); scale = x; } };
      w.performance.now = now; w.Date.now = function () { return Math.round(now() + off); }; w.requestAnimationFrame = function (cb) { return raf(function () { cb(now()); }); };
    }
    w.__egT.set(k); clearTimeout(w.__egTt); w.__egTt = setTimeout(function () { if (w.__egT) w.__egT.set(1); }, sec * 1000);
  }
  // Streiche gegen den Spieler: echte Tasten verzögert (lag), vertauscht (invert) oder gesperrt (nokeys, auch Maus/Touch);
  // Controller über gamepad.js (troll.invert / troll.block)
  var lagUntil = 0, invUntil = 0, blockUntil = 0, INV = { ArrowLeft: ['ArrowRight', 39], ArrowRight: ['ArrowLeft', 37], ArrowUp: ['ArrowDown', 40], ArrowDown: ['ArrowUp', 38], KeyA: ['KeyD', 68], KeyD: ['KeyA', 65], KeyW: ['KeyS', 83], KeyS: ['KeyW', 87] };
  function hookInput() {
    var w = gameWin(); if (!w || w.__egIn) return; w.__egIn = 1;
    ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'click'].forEach(function (type) {
      w.addEventListener(type, function (e) { if (e.isTrusted && Date.now() < blockUntil && !(e.target && e.target.closest && e.target.closest('.tt-pop'))) { e.stopImmediatePropagation(); e.preventDefault(); } }, { capture: true, passive: false });
    });
    ['keydown', 'keyup'].forEach(function (type) {
      w.addEventListener(type, function (e) {
        var now = Date.now(); if (!e.isTrusted) return;
        if (now < blockUntil) { e.stopImmediatePropagation(); e.preventDefault(); return; }
        if (now > lagUntil && now > invUntil) return;
        var code = e.code, key = e.key, kc = e.keyCode, inv = now < invUntil && INV[code];
        if (!inv && now > lagUntil) return;
        e.stopImmediatePropagation(); e.preventDefault();
        if (inv) { code = inv[0]; kc = inv[1]; key = code.indexOf('Arrow') === 0 ? code : code.slice(3).toLowerCase(); }
        var fire = function () { var ev = new w.KeyboardEvent(type, { key: key, code: code, keyCode: kc, which: kc, bubbles: true, cancelable: true }); try { Object.defineProperty(ev, 'keyCode', { get: function () { return kc; } }); Object.defineProperty(ev, 'which', { get: function () { return kc; } }); } catch (x) { } (e.target || w.document.body).dispatchEvent(ev); };
        if (now < lagUntil) setTimeout(fire, 700); else fire();
      }, true);
    });
  }
  function padTroll(k, sec) { var w = gameWin(); padApi(function (N) { if (!N.troll) return; N.troll[k] = true; setTimeout(function () { N.troll[k] = false; }, sec * 1000); }); }
  function popup(user) {
    var d = layer('tt-pop', '📢 WERBUNG<br><span style="font-weight:600;font-size:14px">präsentiert von ' + esc(user || 'deinem Zuschauer') + '</span><br><button style="margin-top:12px;padding:8px 16px;border-radius:10px;border:0;background:#ec4899;color:#fff;font:700 15px system-ui" disabled>Schließen in 5</button>', 0,
      'position:absolute;left:8%;right:8%;top:28%;max-width:520px;margin:auto;padding:18px;border-radius:16px;background:#fff;color:#111;text-align:center;font:800 18px system-ui,sans-serif;box-shadow:0 20px 60px rgba(0,0,0,.6);pointer-events:auto;z-index:30');
    var b = d.querySelector('button'), n = 5;
    var iv = setInterval(function () { n--; if (n > 0) b.textContent = 'Schließen in ' + n; else { clearInterval(iv); b.disabled = false; b.textContent = '✕ Schließen'; b.onclick = function () { d.remove(); }; setTimeout(function () { d.remove(); }, 8000); } }, 1000);
  }
  function blind(sec) { layer('', '', sec * 1000, 'position:absolute;inset:0;background:radial-gradient(circle at 50% 50%,transparent 0,transparent 16%,rgba(0,0,0,.97) 30%);z-index:25'); }
  function fog(sec) { layer('', '', sec * 1000, 'position:absolute;inset:0;z-index:25;background:radial-gradient(circle at 30% 40%,rgba(235,240,245,.92),rgba(220,228,236,.75) 45%,rgba(200,210,220,.9));backdrop-filter:blur(6px)'); }
  function crash() { layer('tt-crash', '<i></i><div>Das Spiel reagiert nicht.</div><small style="font-weight:400;color:#555">Bitte warten … (Ein Zuschauer hat es kaputt gemacht 😈)</small>', 4500); }
  function scare() { layer('tt-scare', '👻', 950); fx('shake', 1); }
  function banner(text) { layer('tt-ban', '', 3600).textContent = text; }
  // Bombe: Countdown, der Chat entschärft mit einem Wort (verschiedene Zuschauer), sonst Neustart
  var bomb = null;
  function startBomb(sec, user) {
    if (bomb) return; var e = eff();
    bomb = { end: Date.now() + sec * 1000, word: String(e.bombWord || 'retten').toLowerCase(), need: Math.max(1, +e.bombNeed || 5), got: {}, el: layer('tt-bomb') };
    banner('💣 ' + (user || 'Jemand') + ' hat eine Bombe gelegt!');
    (function tick() {
      if (!bomb) return; var left = Math.ceil((bomb.end - Date.now()) / 1000), n = Object.keys(bomb.got).length;
      if (n >= bomb.need) { bomb.el.remove(); bomb = null; banner('✅ Bombe entschärft! Danke Chat!'); ttCount('bomb'); return; }
      if (left <= 0) { bomb.el.remove(); bomb = null; banner('💥 BUMM!'); fx('shake', 2); setTimeout(function () { run1('restart'); }, 1200); return; }
      bomb.el.innerHTML = '💣 ' + left + ' s · schreibt <span style="color:#ffd84a">„' + esc(bomb.word) + '“</span> ' + n + '/' + bomb.need;
      setTimeout(tick, 250);
    })();
  }
  // Spielstand löschen: Schlüssel des Spiels (Speicher-Präfixe aus sync/catalog.json); Sicherung zum Wiederherstellen in den Einstellungen
  var catalog = null;
  function prefixes(cb) {
    if (catalog) return cb(catalog);
    fetch(EMB ? '/sync/catalog.json' : new URL('sync/catalog.json', location.href).href).then(function (r) { return r.json(); }).then(function (c) {
      var g = (c.games || []).find(function (x) { return x.id === GID || (x.path || '').replace(/\/$/, '') === GID; });
      catalog = g && g.cloud && g.cloud.prefix ? String(g.cloud.prefix).split(',').map(function (x) { return x.trim(); }).filter(Boolean) : [];
      catalog.cloudGame = g && g.cloud && g.cloud.game || GID;
      cb(catalog);
    }).catch(function () { cb([]); });
  }
  // ---------- Eigener Stream-Spielstand: echte (Cloud-)Spielstände bleiben unberührt ----------
  // Beim Start werden die Schlüssel des Spiels nach eg-real:… gelegt und der Stream-Stand (eg-stream:…) eingesetzt, am Ende zurück.
  // Solange das Lebenszeichen (eg-stream-save:<spiel>) frisch ist, gleicht cloud/anmacha-cloud.js nichts ab; fehlt es > 60 s, legt es selbst zurück.
  var LS = window.localStorage, saveOn = false, beat = 0;
  function moveKeys(from, to, pre) {
    var ks = []; for (var i = 0; i < LS.length; i++) ks.push(LS.key(i));
    ks.forEach(function (k) { var r = from ? (k.indexOf(from) === 0 ? k.slice(from.length) : null) : k; if (r === null || !pre.some(function (p) { return r.indexOf(p) === 0; })) return; if (!from && /^eg-(real|stream):/.test(k)) return; LS.setItem(to + r, LS.getItem(k)); LS.removeItem(k); });
  }
  function streamSave(on, then) {
    if (NOGAME) { if (then) then(false); return; }
    prefixes(function (pre) {
      var flag = 'eg-stream-save:' + pre.cloudGame, active = !!LS.getItem(flag), moved = false;
      if (!pre.length || (on === saveOn && on === active)) { if (then) then(false); return; }
      try {
        if (on) { if (!active) { moveKeys('', 'eg-real:', pre); moveKeys('eg-stream:', '', pre); moved = true; } LS.setItem(flag, JSON.stringify({ t: Date.now() })); clearInterval(beat); beat = setInterval(function () { LS.setItem(flag, JSON.stringify({ t: Date.now() })); }, 10000); }
        else { clearInterval(beat); if (active) { moveKeys('', 'eg-stream:', pre); moveKeys('eg-real:', '', pre); moved = true; } LS.removeItem(flag); }
        saveOn = on;
      } catch (e) { }
      if (then) then(moved);
    });
  }
  addEventListener('pagehide', function () { if (saveOn && !EMB) { var pre = catalog || []; try { clearInterval(beat); moveKeys('', 'eg-stream:', pre); moveKeys('eg-real:', '', pre); LS.removeItem('eg-stream-save:' + pre.cloudGame); } catch (e) { } saveOn = false; } });
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
    if (NOGAME || VIEW !== 'all' && VIEW !== 'game') return;   // Einblendungs-Quelle: nur anzeigen, die Spiel-Quelle führt aus
    String(action || '').split('+').forEach(function (one) { run1(one.trim(), user, times); });
  }
  var BAN = { slow: '🐢 Zeitlupe!', fast: '⚡ Turbo!', lag: '🐌 Verzögerung!', invert: '🙃 Deine Steuerung ist vertauscht!', nokeys: '🚫 Steuerung weg!', blind: '🔦 Licht aus!', fog: '🌫️ Nebel!',
    drunk: '🥴 Betrunken!', dance: '🕺 Tanzen!', tilt: '📐 Schief!', ghost: '👻 Unsichtbar!', blur: '👓 Brille weg!', swap: '🔀 Steuerung vertauscht!', freeze: '❄️ Steuerung eingefroren!', chaos: '🌀 Chaos!' };
  var TROLLS = ACTS.filter(function (x) { return x[3] === 'troll' || x[3] === 'fx'; }).map(function (x) { return /^(\w+)/.exec(x[0])[1]; });
  function run1(action, user, times) {
    times = Math.max(1, Math.min(20, times || 1));
    var rep = /\*(\d+)$/.exec(action); if (rep) { action = action.slice(0, rep.index); times = Math.min(30, times * +rep[1]); }
    var m = /^(\w+):?(.*)$/.exec(action); if (!m) return;
    if (user !== 'Test' && TROLLS.indexOf(m[1]) >= 0) ttCount('trolls');
    var kind = m[1], arg = m[2], txt = arg.replace(/\{user\}/g, user || ''), sec = function (d, max) { return Math.min(max || 30, +arg || d); };
    if (Date.now() < freezeUntil && (kind === 'pad' || kind === 'key')) return;
    if (BAN[kind]) banner(BAN[kind]);
    if (kind === 'restart') { try { S.frame.contentWindow.location.reload(); } catch (e) { S.restart(); } return; }
    if (kind === 'say') { toast(txt); return; }
    if (kind === 'banner') { banner(txt); return; }
    if (kind === 'fx') { var a = arg.split(':'); fx(a[0], a[1]); return; }
    if (kind === 'drunk' || kind === 'dance' || kind === 'tilt' || kind === 'ghost' || kind === 'blur') { fx(kind, sec(10)); return; }
    if (kind === 'reset') { resetSave(user); return; }
    if (kind === 'slow' || kind === 'fast') { timeScale(kind === 'slow' ? 0.4 : 2.2, sec(10)); return; }
    if (kind === 'lag') { hookInput(); lagUntil = Date.now() + sec(10) * 1000; return; }
    if (kind === 'invert') { hookInput(); invUntil = Date.now() + sec(10) * 1000; padTroll('invert', sec(10)); return; }
    if (kind === 'nokeys') { hookInput(); blockUntil = Date.now() + sec(5, 15) * 1000; padTroll('block', sec(5, 15)); return; }
    if (kind === 'popup') { popup(user); return; }
    if (kind === 'blind') { blind(sec(8)); return; }
    if (kind === 'fog') { fog(sec(10)); return; }
    if (kind === 'crash') { crash(); return; }
    if (kind === 'scare') { scare(); return; }
    if (kind === 'bomb') { startBomb(sec(20, 60), user); return; }
    if (kind === 'swap') { swapUntil = Date.now() + sec(15, 60) * 1000; return; }
    if (kind === 'freeze') { freezeUntil = Date.now() + sec(5) * 1000; return; }
    if (kind === 'chaos' || kind === 'drift') {
      var end = Date.now() + sec(8) * 1000, keys = kind === 'chaos' ? ['A', 'B', 'X', 'Y', 'UP', 'DOWN', 'LEFT', 'RIGHT'] : [['LEFT', 'RIGHT', 'UP', 'DOWN'][Math.floor(Math.random() * 4)]];
      if (kind === 'drift') banner('🌬️ Sturm nach ' + { LEFT: 'links', RIGHT: 'rechts', UP: 'oben', DOWN: 'unten' }[keys[0]] + '!');
      (function tick() { if (Date.now() > end) return; run1('pad:' + keys[Math.floor(Math.random() * keys.length)], user); setTimeout(tick, kind === 'chaos' ? 350 : 450); })(); return;
    }
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
  window.EG_TIKTOK = { run: run, config: function () { return cfg; }, restore: restoreSave, gameActions: gameActions, actions: ACTS };

  // ---------- Ereignisse ----------
  // Exklusive TikTok-Erfolge (cloud/anmacha-ach.js, Seite erfolge.html): Zähler je Gerät in anmacha-tiktok – nur echte LIVE-Ereignisse
  // (nicht Demo/Test, nicht in den Einstellungen) und nur in der Quelle, die das Spiel steuert (sonst zählt OBS mit zwei Quellen doppelt)
  var TTK = 'anmacha-tiktok', ttSt = null, ttT = 0;
  function ttCount(k, n) {
    if (SETUP || NOGAME || (VIEW !== 'all' && VIEW !== 'game') || /Demo|Test/i.test(state.title || '')) return;
    try {
      if (!ttSt) { ttSt = JSON.parse(localStorage.getItem(TTK) || '{}') || {}; ttSt.t = ttSt.t || {}; ttSt.tg = ttSt.tg || {}; ttSt.td = ttSt.td || []; }
      ttSt.t[k] = (ttSt.t[k] || 0) + (n || 1);
      var d = new Date(), day = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
      if (ttSt.td.indexOf(day) < 0) ttSt.td.push(day);
      if (!ttSt.tg[GID]) ttSt.tg[GID] = Date.now();
      clearTimeout(ttT); ttT = setTimeout(function () { try { localStorage.setItem(TTK, JSON.stringify(ttSt)); } catch (x) { } }, 1500);   // gebündelt schreiben
    } catch (x) { }
  }
  function onEvent(ev) {
    var e = eff(), who = ev.user || 'Jemand';
    if (ev.type === 'chat') {
      var word = String(ev.text || '').trim().toLowerCase().split(/\s+/)[0].replace(/^[!\/#]/, '');
      if (bomb && word === bomb.word) { bomb.got[who] = 1; return; }
      var hit = (e.commands || []).find(function (c) { return c[0] && c[0].toLowerCase() === word; });
      if (!hit) return;
      var cd = (+e.cooldown || 0) * 1000, now = Date.now(); if (cd && now - (lastCmd[who] || 0) < cd) return; lastCmd[who] = now;
      if (e.mode === 'vote') { votes[hit[0]] = (votes[hit[0]] || 0) + 1; drawVote(); return; }
      toast(who + ': ' + hit[0]); run(hit[1], who); ttCount('cmds');
    } else if (ev.type === 'gift') {
      var name = String(ev.gift || '').toLowerCase(), g = (e.gifts || []).find(function (x) { return x.gift && (x.gift.toLowerCase() === name || String(x.gift) === String(ev.giftId)); });
      var dia = (+ev.diamonds || giftInfo(ev.gift).diamonds || 1) * (ev.count || 1); fans[who] = (fans[who] || 0) + dia; drawTop(); ttCount('diam', dia);
      if (!g) return;
      toast(who + ': ' + (g.icon || '🎁') + ' ' + g.gift + (ev.count > 1 ? ' ×' + ev.count : '') + ' → ' + (g.label || g.action)); run(g.action, who, ev.count); ttCount('gifts', ev.count || 1);
    } else if (ev.type === 'like' && e.likes && e.likes.every > 0) {
      likeSum += ev.count || 1; ttCount('likes', ev.count || 1);
      while (likeSum >= e.likes.every) { likeSum -= e.likes.every; toast('❤️ ' + e.likes.every + ' Likes → ' + (e.likes.label || e.likes.action)); run(e.likes.action, who); }
      likeBar.firstChild.style.width = Math.round(likeSum / e.likes.every * 100) + '%';
    } else if (ev.type === 'join') { if (e.join && Date.now() - joinT > 3000) { joinT = Date.now(); runText(e.join, who); } }
    else if ((ev.type === 'follow' || ev.type === 'share' || ev.type === 'sub') && e[ev.type]) runText(e[ev.type], who);
    if (ev.type === 'follow') ttCount('follows');
  }
  // say: erscheint in der Ereignis-Liste (auch in der Einblendungs-Quelle), alles andere führt die Spiel-Quelle aus
  function runText(a, who) { String(a).split('+').forEach(function (one) { one = one.trim(); if (/^say:/.test(one)) toast(one.slice(4).replace(/\{user\}/g, who)); else run(one, who); }); }
  function drawVote() {
    var k = Object.keys(votes); if (!k.length || !shows('legend')) { vote.style.display = 'none'; return; }
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
      else if (d.type === 'config' && d.config) { cfg = Object.assign(clone(DEFAULT), d.config); try { localStorage.setItem('eg-tiktok', JSON.stringify(cfg)); } catch (e) { } drawLegend(); applySave(); if (SETUP && P2 && !editing) panelFill(); }
      else if (d.type === 'gifts' && Array.isArray(d.list)) { liveGifts = d.list; drawLegend(); if (SETUP && P2) drawGifts(); }
      else if (d.type === 'status') { state.title = d.msg || ''; if (SETUP && P2) panelState(d.msg); }
    };
  }
  // Stream-Spielstand je nach Einstellung, dann Spiel starten (Stream) bzw. neu laden, wenn sich die Einstellung ändert
  function applySave() { var want = !!eff().streamSave; if (want === saveOn) return; streamSave(want, function (moved) { if (started && moved) { try { gameWin().location.reload(); } catch (e) { } } }); }
  var started = false;
  // Stream: Spiel erst nach dem Umstellen starten. Windows-App (eingebettet): Spiel lief schon – nach dem ersten Umstellen einmal neu laden.
  streamSave(!!eff().streamSave, function (moved) { started = true; if (S.start) S.start(); else if (EMB && moved) location.reload(); });
  drawLegend(); setState(); connect();
  if (!SETUP) return;

  // ---------- Einstellungen (setup=1; auch in der Windows-App) ----------
  var editing = false, scope = 'all', PICK = '';
  var pc = document.createElement('style');
  pc.textContent = '#ttSet{position:fixed;inset:0;z-index:100;overflow:auto;background:radial-gradient(1200px 600px at 10% -10%,#2a1036,transparent),#070a12;color:#eef2fb;font:14px system-ui,"Segoe UI",sans-serif;pointer-events:auto}' +
    '#ttSet *{box-sizing:border-box}#ttSet .wrap{max-width:1180px;margin:0 auto;padding:16px 16px 90px}#ttSet h2{margin:0;font-size:20px}#ttSet h3{margin:16px 0 8px;font-size:14px;color:#7ff3ff;letter-spacing:.02em}#ttSet .s{color:#9aa7c2;font-size:12.5px;line-height:1.45}' +
    '#ttSet .hd{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between}#ttSet .pill{display:inline-flex;align-items:center;gap:6px;padding:5px 11px;border-radius:999px;background:#121a2c;border:1px solid #26324d;font-size:12.5px}' +
    '#ttSet .scope{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:12px 0;padding:10px 12px;border-radius:14px;background:#0e1526;border:1px solid #223050}#ttSet .scope select{font-weight:700}' +
    '#ttSet .tabs{display:flex;gap:6px;overflow-x:auto;padding:2px 0 8px;position:sticky;top:0;z-index:2;background:linear-gradient(#070a12 75%,transparent)}#ttSet .tabs button{white-space:nowrap;border-radius:999px}#ttSet .tabs button.on{background:#f8fafc;color:#0b1020;border-color:#f8fafc;font-weight:700}' +
    '#ttSet section{display:none}#ttSet section.on{display:block}#ttSet .card{background:#0e1526;border:1px solid #223050;border-radius:16px;padding:12px 14px;margin-bottom:12px}' +
    '#ttSet .cols{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:12px}@media(max-width:900px){#ttSet .cols{grid-template-columns:1fr}}' +
    '#ttSet input,#ttSet select{width:100%;padding:7px 9px;border-radius:9px;border:1px solid #2a3650;background:#0a0f1a;color:#fff;font:inherit}#ttSet input:focus,#ttSet select:focus{outline:2px solid #8b5cf6;border-color:transparent}' +
    '#ttSet button{padding:7px 12px;border-radius:10px;border:1px solid #2a3650;background:#16203a;color:#fff;font:inherit;cursor:pointer}#ttSet button:hover{border-color:#8b5cf6}#ttSet button.p{background:linear-gradient(110deg,#ec4899,#8b5cf6);border:0;font-weight:700}' +
    '#ttSet .row{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:6px 0}#ttSet .row label{display:flex;gap:6px;align-items:center}#ttSet .row input,#ttSet .row select{width:auto}' +
    '#ttSet table{display:block;width:100%}#ttSet tbody{display:block}#ttSet tr{display:grid;grid-template-columns:58px minmax(0,1fr) minmax(0,1.7fr) minmax(0,1.2fr) auto;gap:6px;align-items:center;padding:7px;margin-bottom:7px;border-radius:12px;background:#111a2e;border:1px solid #233150}' +
    '#ttSet #ttCmds tr{grid-template-columns:minmax(0,1fr) minmax(0,2fr) auto}#ttSet td{display:block;padding:0;min-width:0}#ttSet td.gi{position:relative}#ttSet td.gi img{position:absolute;right:3px;top:3px;width:22px;height:22px;pointer-events:none}' +
    '#ttSet td.ga{display:flex;gap:4px}#ttSet td.ga select{width:42px;flex:none;padding:7px 2px}#ttSet td.gb{display:flex;gap:4px}#ttSet td.gb button{padding:6px 9px}' +
    '@media(max-width:640px){#ttSet tr{grid-template-columns:52px 1fr auto}#ttSet td.ga,#ttSet td.gl{grid-column:1/-1}}' +
    '#ttSet .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:6px;max-height:430px;overflow:auto;padding:2px}' +
    '#ttSet .grid button{display:flex;flex-direction:column;align-items:center;gap:3px;padding:8px 4px;border-radius:12px;font-size:12px;line-height:1.2;text-align:center;position:relative}#ttSet .grid button .e{font-size:26px;height:32px;display:flex;align-items:center}#ttSet .grid button img{width:32px;height:32px}' +
    '#ttSet .grid button small{opacity:.65}#ttSet .grid button.on{border-color:#34d399;background:#0f2a24}#ttSet .grid button.on:after{content:"✓";position:absolute;right:6px;top:4px;color:#34d399;font-weight:800}' +
    '#ttSet .strip{display:flex;flex-wrap:wrap;gap:5px}#ttSet .strip button{padding:5px 9px;font-size:12.5px;border-radius:999px}' +
    '#ttSet .acts{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:8px}#ttSet .act{display:flex;gap:8px;align-items:center;padding:8px 10px;border-radius:12px;background:#111a2e;border:1px solid #233150}' +
    '#ttSet .act .e{font-size:22px}#ttSet .act div{flex:1;min-width:0}#ttSet .act code{font-size:11px;color:#9aa7c2}#ttSet .act button{padding:5px 8px;font-size:12px}' +
    '#ttSet .ft{position:fixed;left:0;right:0;bottom:0;z-index:3;display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:center;padding:10px 16px;background:rgba(7,10,18,.94);border-top:1px solid #223050;backdrop-filter:blur(6px)}' +
    '#ttSet .ok{color:#34d399}#ttSet .bad{color:#f87171}#ttSet code{background:#0a0f1a;padding:1px 5px;border-radius:5px}#ttSet .url{display:flex;gap:6px}#ttSet .url input{font-family:ui-monospace,monospace;font-size:12px}';
  document.head.appendChild(pc);
  var P2 = document.createElement('div'); P2.id = 'ttSet'; document.body.appendChild(P2);
  var TABS = [['g', '🎁 Geschenke'], ['c', '💬 Chat'], ['l', '❤️ Likes & Fans'], ['t', '😈 Streiche & Effekte']].concat(EMB ? [] : [['o', '📺 Overlay & Ansichten']]).concat([['a', '⚙️ Allgemein']]);
  var sel = function (id, opts) { return '<select id="' + id + '">' + opts.map(function (o) { return '<option value="' + o[0] + '">' + o[1] + '</option>'; }).join('') + '</select>'; };
  P2.innerHTML = '<div class="wrap"><div class="hd"><div><h2>🎁 TikTok-Steuerung</h2><div class="s">' + esc(S.game.title) + ' · Kommentare, Geschenke und Likes steuern das Spiel – Speichern gilt sofort im Stream' + (EMB ? ' und in der App' : ' (OBS, TikTok LIVE Studio)') + '.</div></div><span id="ttConn" class="pill"></span></div>' +
    '<div class="scope"><label>Belegung für ' + sel('ttScope', [['all', '🌍 alle Spiele'], ['game', '🎮 nur ' + esc(S.game.title)]]) + '</label><span id="ttOwn" class="s"></span></div>' +
    '<nav class="tabs">' + TABS.map(function (t, i) { return '<button data-tab="' + t[0] + '"' + (i ? '' : ' class="on"') + '>' + t[1] + '</button>'; }).join('') + '</nav>' +
    '<section data-sec="g" class="on"><div class="cols"><div><div class="card"><h3 style="margin-top:0">Deine Geschenke-Belegung</h3><div class="s">Geschenk rechts antippen, dann Aktion wählen (▾) oder unten einen Streich antippen. ▶ testet sofort.</div><table id="ttGifts"></table><button data-add="g">+ Geschenk</button></div>' +
    '<div class="card"><h3 style="margin-top:0">😈 Schnell zuweisen</h3><div class="s">Antippen = letzte Zeile ohne Aktion bekommt den Streich.</div><div id="ttTrolls" class="strip"></div></div></div>' +
    '<div class="card"><h3 style="margin-top:0">🎁 Alle Geschenke</h3><input id="ttGiftQ" placeholder="🔍 Geschenk suchen …"><div class="s" id="ttGiftSrc" style="margin:6px 0"></div><div id="ttGiftList" class="grid"></div></div></div></section>' +
    '<section data-sec="c"><div class="card"><h3 style="margin-top:0">💬 Chat-Befehle</h3><div class="s">Erstes Wort im Kommentar (auch mit ! davor, z. B. „!links“).</div><table id="ttCmds"></table><button data-add="c">+ Befehl</button></div></section>' +
    '<section data-sec="l"><div class="card"><h3 style="margin-top:0">❤️ Like-Ziel</h3><div class="row"><label>alle <input id="ttLikeN" type="number" min="0" style="width:90px"> Likes</label><label>Aktion <input id="ttLikeA" list="ttAct" style="width:220px"></label><label>Text <input id="ttLikeL" style="width:180px"></label></div></div>' +
    '<div class="card"><h3 style="margin-top:0">🤝 Zuschauer-Aktionen</h3><div class="s">{user} = Name. Leer = aus.</div>' +
    [['ttFollow', '➕ Follow'], ['ttShare', '🔁 Teilen'], ['ttSub', '⭐ Abo'], ['ttJoin', '👋 Beitritt (höchstens alle 3 s)']].map(function (r) { return '<div class="row"><label style="width:220px">' + r[1] + '</label><input id="' + r[0] + '" list="ttAct" style="flex:1;min-width:220px"></div>'; }).join('') +
    '<div class="row"><label><input type="checkbox" id="ttTop" style="width:auto"> 🏆 Top-Fans (Diamanten) im Bild</label></div></div></section>' +
    '<section data-sec="t"><div class="card"><div class="s">Alle Streiche und Effekte wirken in jedem Spiel – im Browser-Overlay und in der Windows-App. Zahl = Sekunden. Kombinieren mit + (z. B. <code>bomb:20+fx:party:20</code>), wiederholen mit *5.</div></div><div id="ttActs"></div></section>' +
    (EMB ? '' : '<section data-sec="o"><div class="card"><h3 style="margin-top:0">📺 Overlay-Adresse</h3><div class="s">Als Browserquelle in OBS bzw. „Link“-Quelle in TikTok LIVE Studio einfügen. Format passend zur Ausrichtung des LIVE wählen.</div>' +
      '<div class="row">' + [['ttFmt', 'Format', [['9x16', '📱 9:16 hochkant'], ['16x9', '🖥️ 16:9 quer']]], ['ttView', 'Ansicht', [['all', 'Alles in einer Quelle'], ['game', 'Nur Spiel (mit Streichen)'], ['info', 'Nur Einblendungen'], ['legend', 'Nur Geschenke-Legende'], ['feed', 'Nur Ereignisse'], ['top', 'Nur Top-Fans']]],
        ['ttLay', 'Rahmen', [['frame', 'Titel + QR-Code'], ['badge', 'Spiel + kleiner QR'], ['full', 'nur Spiel, randlos']]]].map(function (s) { return '<label>' + s[1] + ' ' + sel(s[0], s[2]) + '</label>'; }).join('') +
      '<label><input type="checkbox" id="ttClear" style="width:auto"> durchsichtiger Hintergrund</label></div>' +
      '<div class="url"><input id="ttUrl" readonly><button id="ttCopy">📋 Kopieren</button><button id="ttOpen">↗ Öffnen</button></div>' +
      '<h3>Vorlagen</h3><div class="strip">' + [['9x16', 'all', 'frame', 0, '📱 TikTok LIVE Studio hochkant'], ['16x9', 'all', 'frame', 0, '🖥️ TikTok LIVE Studio quer'], ['9x16', 'all', 'full', 0, '📱 OBS hochkant (randlos)'], ['16x9', 'all', 'full', 0, '🖥️ OBS quer (randlos)'],
        ['9x16', 'game', 'full', 0, '🎮 Quelle 1: nur Spiel'], ['9x16', 'info', 'full', 1, '✨ Quelle 2: nur Einblendungen']].map(function (v) { return '<button data-preset="' + v.slice(0, 4).join(',') + '">' + v[4] + '</button>'; }).join('') + '</div>' +
      '<div class="s" style="margin-top:10px"><b>Eine Quelle</b> („Alles“): am einfachsten. <b>Zwei Quellen</b>: „Nur Spiel“ unten (zum Spielen „Interagieren“), „Nur Einblendungen“ durchsichtig darüber – dann kannst du Legende und Ereignisse frei verschieben/skalieren; beide mit gleichem Format und Rahmen. Einzelne Teile (Legende, Ereignisse, Top-Fans) gehen auch als eigene Quellen.</div></div></section>') +
    '<section data-sec="a"><div class="card"><h3 style="margin-top:0">⚙️ Ablauf</h3><div class="row"><label>Modus ' + sel('ttMode', [['chaos', 'Chaos – jeder Befehl sofort'], ['vote', 'Abstimmung']]) + '</label><label>alle <input id="ttVote" type="number" min="1" max="30" style="width:60px"> s</label>' +
    '<label>Pause je Zuschauer <input id="ttCool" type="number" min="0" max="60" style="width:60px"> s</label><label>Legende ' + sel('ttLeg', [['tr', 'oben rechts'], ['tl', 'oben links'], ['br', 'unten rechts'], ['bl', 'unten links'], ['off', 'aus']]) + '</label></div>' +
    '<div class="row"><label>💣 Bombe entschärfen mit <input id="ttBombW" style="width:120px"></label><label>von <input id="ttBombN" type="number" min="1" max="50" style="width:60px"> Zuschauern</label></div></div>' +
    '<div class="card"><h3 style="margin-top:0">💾 Spielstand</h3><div class="row"><label><input type="checkbox" id="ttSave2" style="width:auto"> Eigener Stream-Spielstand – deine echten und Google-Cloud-Spielstände bleiben unberührt</label></div>' +
    '<div class="row"><button id="ttRestore">↩ Gelöschten Spielstand wiederherstellen</button></div></div></section>' +
    '<div class="ft"><button class="p" id="ttSave">💾 Speichern</button><button id="ttReset">Standard</button><button id="ttClose">👁 Vorschau</button><span id="ttMsg" class="s"></span></div><datalist id="ttAct"></datalist></div>';
  var $ = function (s) { return P2.querySelector(s); };
  function buildPick(ga) {
    var all = ACTS.concat(ga.map(function (a) { return ['game:' + a.id, a.icon || '⭐', a.label, 'game']; }));
    return '<option value="">▾</option>' + Object.keys(GROUPS).map(function (gr) { var o = all.filter(function (a) { return a[3] === gr; }); return o.length ? '<optgroup label="' + GROUPS[gr] + '">' + o.map(function (a) { return '<option value="' + esc(a[0]) + '" data-l="' + esc(a[2]) + '">' + esc(a[1] + ' ' + a[2]) + '</option>'; }).join('') + '</optgroup>' : ''; }).join('');
  }
  function giftRow(g) {
    var gi = giftInfo(g.gift);
    return '<tr><td class="gi"><input data-k="icon" value="' + esc(g.icon || gi.icon || '🎁') + '" title="Symbol in der Legende">' + (gi.img ? '<img src="' + esc(gi.img) + '" alt="">' : '') + '</td><td><input data-k="gift" placeholder="Geschenk" value="' + esc(g.gift) + '"></td>' +
      '<td class="ga"><input data-k="action" list="ttAct" placeholder="Aktion" value="' + esc(g.action) + '"><select data-pick title="Aktion wählen">' + PICK + '</select></td><td class="gl"><input data-k="label" placeholder="Text in der Legende" value="' + esc(g.label || '') + '"></td>' +
      '<td class="gb"><button data-test title="Testen">▶</button><button data-del title="Entfernen">✕</button></td></tr>';
  }
  function cmdRow(c) { return '<tr><td><input data-k="0" placeholder="Wort im Chat" value="' + esc(c[0]) + '"></td><td class="ga"><input data-k="1" list="ttAct" value="' + esc(c[1]) + '"><select data-pick title="Aktion wählen">' + PICK + '</select></td><td class="gb"><button data-test title="Testen">▶</button><button data-del title="Entfernen">✕</button></td></tr>'; }
  function panelFill() {
    var e = scope === 'game' ? eff() : cfg, ga = gameActions(); PICK = buildPick(ga);
    $('#ttAct').innerHTML = ACTS.map(function (a) { return a[0]; }).concat(ga.map(function (a) { return 'game:' + a.id; })).map(function (a) { return '<option value="' + esc(a) + '">'; }).join('');
    $('#ttScope').value = scope; $('#ttMode').value = e.mode || 'chaos'; $('#ttVote').value = e.voteSec || 3; $('#ttLeg').value = e.legend || 'tr'; $('#ttCool').value = e.cooldown || 0;
    $('#ttBombW').value = e.bombWord || 'retten'; $('#ttBombN').value = e.bombNeed || 5; $('#ttTop').checked = e.top !== false;
    $('#ttGifts').innerHTML = (e.gifts || []).map(giftRow).join(''); $('#ttCmds').innerHTML = (e.commands || []).map(cmdRow).join('');
    $('#ttLikeN').value = (e.likes && e.likes.every) || 0; $('#ttLikeA').value = (e.likes && e.likes.action) || ''; $('#ttLikeL').value = (e.likes && e.likes.label) || '';
    $('#ttFollow').value = e.follow || ''; $('#ttShare').value = e.share || ''; $('#ttSub').value = e.sub || ''; $('#ttJoin').value = e.join || ''; $('#ttSave2').checked = !!e.streamSave;
    var strip = TROLL_STRIP.concat(ga.map(function (a) { return ['game:' + a.id, a.icon || '⭐', a.label]; }));
    $('#ttTrolls').innerHTML = strip.map(function (t) { return '<button data-troll="' + esc(t[0]) + '" data-label="' + esc(t[2]) + '">' + esc(t[1] + ' ' + t[2]) + '</button>'; }).join('');
    $('#ttActs').innerHTML = ['troll', 'fx', 'game', 'pad', 'text'].map(function (gr) {
      var o = ACTS.concat(ga.map(function (a) { return ['game:' + a.id, a.icon || '⭐', a.label, 'game']; })).filter(function (a) { return a[3] === gr; });
      return o.length ? '<div class="card"><h3 style="margin-top:0">' + GROUPS[gr] + '</h3><div class="acts">' + o.map(function (a) { return '<div class="act"><span class="e">' + esc(a[1]) + '</span><div>' + esc(a[2]) + '<br><code>' + esc(a[0]) + '</code></div><button data-run="' + esc(a[0]) + '" title="Testen">▶</button><button data-assign="' + esc(a[0]) + '" data-label="' + esc(a[2]) + '" title="Einem Geschenk zuweisen">🎁+</button></div>'; }).join('') + '</div></div>' : '';
    }).join('') + (ga.length ? '' : '<div class="s">Dieses Spiel hat keine eigenen Highlights – alle Streiche oben gehen trotzdem.</div>');
    var own = cfg.games && cfg.games[GID]; $('#ttOwn').innerHTML = scope === 'game' ? (own ? '✅ ' + esc(S.game.title) + ' hat eine eigene Belegung · „Standard“ entfernt sie' : 'Noch keine eigene Belegung – zeigt die allgemeine; Speichern legt eine eigene an.') : (own ? 'ℹ️ ' + esc(S.game.title) + ' nutzt eine eigene Belegung' : 'Gilt für alle Spiele ohne eigene Belegung.');
    drawGifts(); urlDraw();
  }
  function read() {
    return {
      mode: $('#ttMode').value, voteSec: +$('#ttVote').value || 3, legend: $('#ttLeg').value, cooldown: +$('#ttCool').value || 0, top: $('#ttTop').checked,
      bombWord: $('#ttBombW').value.trim().toLowerCase() || 'retten', bombNeed: +$('#ttBombN').value || 5,
      gifts: [].map.call(P2.querySelectorAll('#ttGifts tr'), function (r) { var o = {}; r.querySelectorAll('[data-k]').forEach(function (i) { o[i.dataset.k] = i.value.trim(); }); return o; }).filter(function (g) { return g.gift && g.action; }),
      commands: [].map.call(P2.querySelectorAll('#ttCmds tr'), function (r) { var i = r.querySelectorAll('[data-k]'); return [i[0].value.trim().toLowerCase().replace(/^[!\/#]/, ''), i[1].value.trim()]; }).filter(function (c) { return c[0] && c[1]; }),
      likes: { every: +$('#ttLikeN').value || 0, action: $('#ttLikeA').value.trim(), label: $('#ttLikeL').value.trim() },
      follow: $('#ttFollow').value.trim(), share: $('#ttShare').value.trim(), sub: $('#ttSub').value.trim(), join: $('#ttJoin').value.trim(), streamSave: $('#ttSave2').checked
    };
  }
  function panelState(msg) { var c = $('#ttConn'); if (c) c.innerHTML = online ? '<span class="ok">● Brücke verbunden</span> ' + esc(msg || '') : '<span class="bad">○ Brücke nicht verbunden</span> – ' + (EMB ? 'in easygames „🎁 TikTok LIVE“ → Verbinden' : '<code>TikTok-Start.bat</code> bzw. <code>node tools/tiktok-bridge.mjs NAME</code> starten') + ' (bis dahin nur in diesem Browser gespeichert)'; }
  function drawGifts() {
    var box = $('#ttGiftList'); if (!box) return;
    var q = ($('#ttGiftQ').value || '').trim().toLowerCase(), used = {};
    [].forEach.call(P2.querySelectorAll('#ttGifts [data-k="gift"]'), function (i) { if (i.value) used[i.value.trim().toLowerCase()] = 1; });
    var list = (liveGifts.length ? liveGifts.map(function (g) { return [g.name, giftInfo(g.name).icon, g.diamonds, g.img]; }) : GIFTS).filter(function (g) { return g[0] && (!q || String(g[0]).toLowerCase().indexOf(q) >= 0); })
      .sort(function (a, b) { return (a[2] || 0) - (b[2] || 0); });
    $('#ttGiftSrc').textContent = (liveGifts.length ? '✅ Aktuelle Liste von TikTok (' + liveGifts.length + ' Geschenke)' : 'Inoffizielle Liste – mit verbundener Brücke kommen alle aktuellen Geschenke mit Bildern') + ' · ✓ = schon belegt';
    box.innerHTML = list.map(function (g) { return '<button data-gift="' + esc(g[0]) + '" data-icon="' + esc(g[1] || '🎁') + '"' + (used[String(g[0]).toLowerCase()] ? ' class="on"' : '') + '>' + (g[3] ? '<img src="' + esc(g[3]) + '" alt="" loading="lazy">' : '<span class="e">' + esc(g[1] || '🎁') + '</span>') + '<span>' + esc(g[0]) + '</span>' + (g[2] ? '<small>' + g[2] + ' 💎</small>' : '') + '</button>'; }).join('') || '<div class="s">Nichts gefunden.</div>';
  }
  function addGiftRow(gift, icon, action, label) { editing = true; $('#ttGifts').insertAdjacentHTML('beforeend', giftRow({ gift: gift, icon: icon, action: action, label: label })); var r = $('#ttGifts').lastElementChild; r.scrollIntoView({ block: 'nearest' }); (gift ? r.querySelector('[data-k="action"]') : r.querySelector('[data-k="gift"]')).focus(); drawGifts(); }
  function assign(action, label) {
    var rows = [].slice.call(P2.querySelectorAll('#ttGifts tr')).reverse(), empty = rows.find(function (r) { return !r.querySelector('[data-k="action"]').value; }) || rows.find(function (r) { return !r.querySelector('[data-k="gift"]').value; });
    if (empty) { empty.querySelector('[data-k="action"]').value = action; empty.querySelector('[data-k="label"]').value = label; editing = true; } else addGiftRow('', '🎁', action, label);
    $('#ttMsg').textContent = '„' + label + '“ zugewiesen – Speichern nicht vergessen.';
  }
  function tab(k) { [].forEach.call(P2.querySelectorAll('[data-tab]'), function (b) { b.classList.toggle('on', b.dataset.tab === k); }); [].forEach.call(P2.querySelectorAll('[data-sec]'), function (s) { s.classList.toggle('on', s.dataset.sec === k); }); }
  function test(a) { P2.style.display = 'none'; toast('Test: ' + a); run(a, 'Test'); setTimeout(function () { P2.style.display = ''; }, 3000); }
  // Overlay-Adresse (immer über die easygames-Homepage, damit OBS/TikTok LIVE Studio sie auf jedem Rechner öffnen)
  function urlDraw() {
    var u = $('#ttUrl'); if (!u) return;
    var base = window.EasyGamesDevice && EasyGamesDevice.publicBase ? EasyGamesDevice.publicBase() : new URL('.', location.href).href;
    var q = new URLSearchParams({ game: GID, tiktok: '1' }); if ($('#ttFmt').value !== '9x16') q.set('format', $('#ttFmt').value);
    if ($('#ttView').value !== 'all') q.set('view', $('#ttView').value); if ($('#ttLay').value !== 'frame') q.set('layout', $('#ttLay').value); if ($('#ttClear').checked) q.set('bg', 'clear');
    if (/^wss?:\/\//.test(P.get('tiktok') || '') && P.get('tiktok') !== 'ws://127.0.0.1:21213') q.set('tiktok', P.get('tiktok'));
    u.value = new URL('stream.html?' + q.toString(), base).href;
  }
  P2.addEventListener('input', function (e) { editing = true; if (e.target.id === 'ttGiftQ' || e.target.dataset.k === 'gift') drawGifts(); if (/^tt(Fmt|View|Lay|Clear)$/.test(e.target.id)) urlDraw(); });
  P2.addEventListener('change', function (e) {
    var s = e.target; if (/^tt(Fmt|View|Lay|Clear)$/.test(s.id)) urlDraw();
    if (!s.matches('[data-pick]') || !s.value) return;
    var r = s.closest('tr'), inp = r.querySelector('[data-k="action"],[data-k="1"]'), lab = r.querySelector('[data-k="label"]'), o = s.options[s.selectedIndex];
    inp.value = s.value; if (lab && (!lab.value || lab.dataset.auto)) { lab.value = o.dataset.l || ''; lab.dataset.auto = 1; }
    s.selectedIndex = 0; editing = true;
  });
  P2.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('button') : null; if (!t) return;
    if (t.dataset.tab) { tab(t.dataset.tab); return; }
    if (t.dataset.gift) {
      var ex = [].find.call(P2.querySelectorAll('#ttGifts tr'), function (r) { return r.querySelector('[data-k="gift"]').value.trim().toLowerCase() === t.dataset.gift.toLowerCase(); });
      if (ex) { ex.scrollIntoView({ block: 'nearest' }); ex.querySelector('[data-k="action"]').focus(); $('#ttMsg').textContent = t.dataset.gift + ' ist schon belegt – hier ändern.'; return; }
      addGiftRow(t.dataset.gift, t.dataset.icon, '', ''); $('#ttMsg').textContent = 'Jetzt eine Aktion wählen (▾) oder einen Streich antippen.'; return;
    }
    if (t.dataset.troll) { assign(t.dataset.troll, t.dataset.label); return; }
    if (t.dataset.assign) { tab('g'); assign(t.dataset.assign, t.dataset.label); return; }
    if (t.dataset.run) { test(t.dataset.run); return; }
    if (t.dataset.preset) { var v = t.dataset.preset.split(','); $('#ttFmt').value = v[0]; $('#ttView').value = v[1]; $('#ttLay').value = v[2]; $('#ttClear').checked = v[3] === '1'; urlDraw(); return; }
    if (t.dataset.add) { editing = true; var tb = t.dataset.add === 'g' ? $('#ttGifts') : $('#ttCmds'); tb.insertAdjacentHTML('beforeend', t.dataset.add === 'g' ? giftRow({ gift: '', action: 'pad:A' }) : cmdRow(['', 'pad:A'])); }
    else if (t.hasAttribute('data-del')) { editing = true; t.closest('tr').remove(); drawGifts(); }
    else if (t.hasAttribute('data-test')) test(t.closest('tr').querySelector('[list="ttAct"]').value);
    else if (t.id === 'ttSave') {
      var v2 = read();
      if (scope === 'game') { cfg.games = cfg.games || {}; cfg.games[GID] = v2; } else { var games = cfg.games || {}; cfg = Object.assign(v2, { games: games }); }
      editing = false; try { localStorage.setItem('eg-tiktok', JSON.stringify(cfg)); } catch (x) { }
      send({ type: 'setConfig', config: cfg }); drawLegend(); panelFill(); $('#ttMsg').textContent = online ? '✅ Gespeichert – gilt sofort auch im Stream.' : 'Gespeichert (nur in diesem Browser, Brücke fehlt).';
    }
    else if (t.id === 'ttReset') { editing = true; if (scope === 'game') { if (cfg.games) delete cfg.games[GID]; } else { var gs = cfg.games; cfg = clone(DEFAULT); cfg.games = gs || {}; } panelFill(); $('#ttMsg').textContent = 'Standard geladen – Speichern übernimmt ihn.'; }
    else if (t.id === 'ttRestore') { $('#ttMsg').textContent = restoreSave() ? 'Spielstand wiederhergestellt.' : 'Kein gelöschter Spielstand vorhanden.'; }
    else if (t.id === 'ttCopy') { var u = $('#ttUrl'); u.select(); try { navigator.clipboard.writeText(u.value); } catch (x) { document.execCommand('copy'); } $('#ttMsg').textContent = 'Adresse kopiert.'; }
    else if (t.id === 'ttOpen') window.open($('#ttUrl').value, '_blank', 'noopener');
    else if (t.id === 'ttClose') { P2.style.display = 'none'; toast(EMB ? 'Einstellungen schließen: Fenster schließen' : 'Für OBS: Adresse aus „📺 Overlay & Ansichten“ verwenden'); setTimeout(function () { P2.style.display = ''; }, 6000); }
  });
  $('#ttScope').addEventListener('change', function () { scope = this.value; panelFill(); });
  panelFill(); panelState();
  S.frame.addEventListener && S.frame.addEventListener('load', function () { setTimeout(function () { if (!editing) panelFill(); }, 800); });
  setTimeout(function () { if (!editing) panelFill(); }, 2500);
})();
