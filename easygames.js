/*!
 * easygames.js – Spiele per JavaScript einbinden
 *
 * 1) Script einbinden (einmal pro Seite):
 *      <script src="https://DEINE-SEITE/easygames.js"></script>
 *
 * 2) Variante A – nur HTML (Attribute als "Variablen"):
 *      <div data-easygames="zotik"></div>
 *      <div data-easygames="all" data-ratio="4/3"></div>
 *    Optional: data-width, data-max-width, data-ratio, data-height, data-radius, data-title,
 *    data-fullscreen="false" (blendet den Vollbild-Knopf aus), data-tv-link="false" (blendet den TV-Link bei Mehrspieler-Spielen aus)
 *
 * 3) Variante B – per JavaScript:
 *      const gameId = 'anmacha-snake';
 *      EasyGames.embed('#mein-container', { game: gameId, ratio: '16/10' });
 *      EasyGames.library('#alle-spiele');
 *      EasyGames.fullscreen(iframeElement);   // Vollbild (öffnet als Fallback einen neuen Tab, z. B. iPhone)
 *
 * Weitere Funktionen:
 *      EasyGames.ready(() => console.log(EasyGames.list()));   // alle Spiele (id, title, desc, url …)
 *      EasyGames.get('zotik'); EasyGames.url('zotik');
 *      EasyGames.tvUrl('anmacha-kart');                       // Link für den TV (nur Mehrspieler-Spiele, sonst null)
 *      EasyGames.device();                                    // Geräteerkennung (siehe device.js): { type, role, os, input, … }
 *      EasyGames.guide('zotik', cb);                          // Anleitung + Steuerung (lädt guides.js bei Bedarf)
 */
(function () {
  'use strict';
  var cs = document.currentScript;
  var base = new URL('.', (cs && cs.src) || location.href).href;
  var games = window.EASYGAMES_GAMES || null, guides = window.EASYGAMES_GUIDES || null;
  var waiting = [], EG = window.EasyGames = window.EasyGames || {};

  function load(file, done) {
    var el = document.createElement('script');
    el.src = base + file; el.async = true; el.onload = done;
    el.onerror = function () { console.error('EasyGames: ' + file + ' konnte nicht geladen werden'); };
    document.head.appendChild(el);
  }
  function el(t) { return typeof t === 'string' ? document.querySelector(t) : t; }
  function find(id) { for (var i = 0; i < games.length; i++) if (games[i].id === id) return games[i]; return null; }
  function abs(p) { return new URL(p, base).href; }

  function frame(src, title, o) {
    var f = document.createElement('iframe');
    f.src = src; f.title = title; f.loading = 'lazy';
    f.allow = 'fullscreen; autoplay'; f.setAttribute('allowfullscreen', '');
    var st = f.style;
    st.width = o.width || '100%'; st.maxWidth = o.maxWidth || '960px'; st.border = '0';
    st.borderRadius = o.radius || '12px'; st.display = 'block';
    if (o.height) st.height = o.height; else st.aspectRatio = o.ratio || '16/10';
    if (o.className) f.className = o.className;
    return f;
  }

  function fullscreen(f) {
    var r = f.requestFullscreen || f.webkitRequestFullscreen;
    function tab() { window.open(f.src, '_blank'); }
    if (!r) return tab();
    try { var p = r.call(f); if (p && p.catch) p.catch(tab); } catch (e) { tab(); }
  }
  // iframe + Vollbild-Knopf (Spiele sind für Vollbild gedacht)
  function wrap(f, o) {
    if (o.fullscreen === false || o.fullscreen === 'false') return f;
    var w = document.createElement('div'), b = document.createElement('button');
    w.style.cssText = 'position:relative;width:' + (o.width || '100%') + ';max-width:' + (o.maxWidth || '960px');
    f.style.width = '100%'; f.style.maxWidth = 'none';
    b.type = 'button'; b.textContent = '\u26F6 Vollbild'; b.setAttribute('aria-label', 'Vollbild');
    b.style.cssText = 'position:absolute;right:8px;bottom:8px;min-height:40px;padding:0 14px;border:1px solid rgba(255,255,255,.35);border-radius:999px;background:rgba(8,11,18,.7);color:#fff;font:700 13px system-ui,sans-serif;cursor:pointer;opacity:.85';
    b.onclick = function () { fullscreen(f); };
    w.appendChild(f); w.appendChild(b);
    return w;
  }
  EG.fullscreen = fullscreen;
  // Zeile unter Mehrspieler-Spielen: Link für den TV (anzeigen/kopieren)
  function tvRow(g, o) {
    if (o.tvLink === false || o.tvLink === 'false' || !multi(g)) return null;
    var u = tvUrl(g), r = document.createElement('div'), a = document.createElement('a'), b = document.createElement('button');
    r.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:8px;font:14px system-ui,sans-serif';
    r.appendChild(document.createTextNode('\uD83D\uDCFA Am TV spielen: '));
    a.href = u; a.target = '_blank'; a.rel = 'noopener'; a.textContent = u; a.style.cssText = 'word-break:break-all';
    b.type = 'button'; b.textContent = 'Link kopieren'; b.style.cssText = 'min-height:36px;padding:0 12px;border-radius:999px;border:1px solid currentColor;background:none;color:inherit;font:inherit;cursor:pointer';
    b.onclick = function () {
      function ok() { var t = b.textContent; b.textContent = 'Kopiert \u2713'; setTimeout(function () { b.textContent = t; }, 1500); }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(u).then(ok, function () { window.prompt('Link für den TV:', u); });
      else window.prompt('Link für den TV:', u);
    };
    r.appendChild(a); r.appendChild(b);
    return r;
  }
  EG.ready = function (cb) { if (games) cb(); else waiting.push(cb); };
  function modesOf(g) { var m = {}, a = (window.EASYGAMES_MODES || {})[g.id] || {}, b = g.modes || {}, k; for (k in a) m[k] = a[k]; for (k in b) m[k] = b[k]; return m; }
  function multi(g) { var m = modesOf(g); return !!(m.pad || m.online || m.multi); }
  // Der richtige Link für TV-Gaming: öffentliche Spielseite (+ ?tv, wo das Spiel es kennt) – auch wenn diese Seite in einer App oder auf localhost läuft
  function tvUrl(g) { var D = window.EasyGamesDevice; return D ? D.tvUrl(g.path, modesOf(g).tvParam, base) : abs(g.path); }
  function info(g) { return { id: g.id, title: g.title, desc: g.desc, icon: g.icon, url: abs(g.path), card: g.img ? abs(g.img) : null, multiplayer: multi(g), modes: modesOf(g), tvUrl: multi(g) ? tvUrl(g) : null }; }
  EG.list = function () { return (games || []).map(info); };
  EG.get = function (id) { var g = games && find(id); return g ? info(g) : null; };
  EG.tvUrl = function (id) { var g = games && find(id); return g && multi(g) ? tvUrl(g) : null; };
  EG.url = function (id) { var g = games && find(id); return g ? abs(g.path) : null; };
  EG.baseUrl = base;
  EG.device = function () { return window.EasyGamesDevice ? window.EasyGamesDevice.get() : null; };
  if (!window.EasyGamesDevice) load('device.js', function () {});
  EG.guide = function (id, cb) {
    function go() { cb(guides && guides[id] || null); }
    if (guides) go(); else load('guides.js', function () { guides = window.EASYGAMES_GUIDES; go(); });
  };

  // EasyGames.embed(ziel, { game, width, maxWidth, ratio, height, radius, title, className })
  EG.embed = function (target, o) {
    o = o || {};
    var t = el(target);
    if (!t) { console.error('EasyGames: Ziel nicht gefunden:', target); return null; }
    var f;
    EG.ready(function () {
      var g = find(o.game);
      if (!g) { console.error('EasyGames: unbekanntes Spiel "' + o.game + '"'); return; }
      f = frame(abs(g.path), o.title || g.title, o);
      var node = wrap(f, o), row = tvRow(g, o);
      if (row) { var box = document.createElement('div'); box.style.cssText = 'width:' + (o.width || '100%') + ';max-width:' + (o.maxWidth || '960px'); node.style.width = '100%'; node.style.maxWidth = 'none'; box.appendChild(node); box.appendChild(row); node = box; }
      t.appendChild(node);
    });
    return t;
  };
  // EasyGames.library(ziel, { … }) – komplette Spielübersicht
  EG.library = function (target, o) {
    o = o || {};
    var t = el(target);
    if (!t) { console.error('EasyGames: Ziel nicht gefunden:', target); return null; }
    t.appendChild(frame(base + 'index.html?embed=1', o.title || 'easygames – Spielebibliothek', o));
    return t;
  };

  function scan() {
    var nodes = document.querySelectorAll('[data-easygames]');
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i]; if (n.getAttribute('data-easygames-done')) continue;
      n.setAttribute('data-easygames-done', '1');
      var d = n.dataset, o = { width: d.width, maxWidth: d.maxWidth, ratio: d.ratio, height: d.height, radius: d.radius, title: d.title, fullscreen: d.fullscreen, tvLink: d.tvLink };
      if (d.easygames === 'all') EG.library(n, o); else { o.game = d.easygames; EG.embed(n, o); }
    }
  }
  EG.scan = scan;

  function start() {
    var q = waiting; waiting = [];
    q.forEach(function (cb) { cb(); });
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan); else scan();
  }
  function withModes() { if (window.EASYGAMES_MODES) start(); else load('modes.js', start); }   // Mehrspieler-Angaben für die TV-Links
  if (games) withModes(); else load('games.js', function () { games = window.EASYGAMES_GAMES; withModes(); });
})();
