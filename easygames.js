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
 *      EasyGames.portal('#spiele');           // komplettes Spieleportal (Karussell, Sammlungen, Reihen, Favoriten, Suche) – immer aktuell
 *      EasyGames.fullscreen(iframeElement);   // Vollbild (öffnet als Fallback einen neuen Tab, z. B. iPhone)
 *
 * 4) Vollbild – ganze Seite oder Overlay (Spiel oder ganzer Katalog):
 *      <div data-easygames="zotik" data-mode="page"></div>        // füllt die ganze Seite (eigene Spiele-Seite)
 *      <div data-easygames="all"   data-mode="page"></div>        // ganzer Katalog vollflächig
 *      <button data-easygames="zotik" data-mode="overlay">Spielen</button>   // Klick öffnet das Spiel vollflächig (Overlay)
 *      EasyGames.open('zotik');  EasyGames.open('all', { close: false });   // per JavaScript; EasyGames.close() schließt
 *    Eigener Teilen-Link je Spiel: data-share="auto" (bzw. { share: 'auto' }) = diese Seite + #games/<id>, oder eine Vorlage wie
 *    data-share="https://meine-seite.de/spiele/{id}". „Spiel teilen“ im Spiel und in der Bibliothek nutzt dann diese Adresse;
 *    #games/<id> beim Aufruf der Seite öffnet das Spiel direkt. Einladungs- und TV-Links bleiben auf der easygames-Homepage.
 *    Overlay: ✕-Knopf, Zurück-Taste, Esc (wenn der Fokus nicht im Spiel liegt) und das Schließen aus dem Spiel (easygames:close) beenden es; Browser-Vollbild wird angefordert.
 *
 * Ranglisten (alle Spiele, Freigabe/Spitzname inklusive; Spiel optional vorwählen):
 *      <div data-easygames="ranglisten" data-game="anmacha-snake"></div>                     // eingebettet (iframe)
 *      <button data-easygames="ranglisten" data-mode="overlay">🏆 Ranglisten</button>        // Klick öffnet sie vollflächig
 *      EasyGames.open('ranglisten', { game: 'anmacha-snake' });  EasyGames.leaderboard('#ziel', { game: '…' });
 *    Oder direkt per iframe: https://…/easygames/ranglisten.html?embed=1[&game=<spiel-id>]
 *
 * Erfolge (spielübergreifend, mit Google-Sicherung):
 *      <button data-easygames="erfolge" data-mode="overlay">🏅 Erfolge</button>   |   EasyGames.open('erfolge')   |   EasyGames.achievements('#ziel')
 *    Oder direkt per iframe: https://…/easygames/erfolge.html?embed=1
 *  - Benutzerkonto (einmal mit Google anmelden, gilt in allen Spielen):
 *      <div data-easygames="konto"></div>  |  <button data-easygames="konto" data-mode="overlay">👤 Konto</button>  |  EasyGames.open('konto')  |  EasyGames.account('#ziel')
 *    Oder direkt per iframe: https://…/easygames/konto.html?embed=1
 *  - Chat für angemeldete Spieler (gefiltert; data-room = Raum: lobby | mitspieler | tipps | g-<spiel-id>):
 *      <div data-easygames="chat" data-room="lobby"></div>  |  <button data-easygames="chat" data-mode="overlay">💬 Chat</button>  |  EasyGames.open('chat', { room })  |  EasyGames.chat('#ziel', { room })
 *    Oder direkt per iframe: https://…/easygames/chat.html?embed=1[&room=<raum>]
 *  - Tagesherausforderung und Profil/Freunde: <div data-easygames="heute"></div>  |  <button data-easygames="profil" data-mode="overlay">🙂 Profil</button>  |  EasyGames.open('heute')  |  EasyGames.page('profil', '#ziel')
 *  - Fehler melden (angemeldete Spieler; data-game = Spiel-ID vorwählen):
 *      <button data-easygames="bug" data-mode="overlay" data-game="anmacha-snake">🐞 Fehler melden</button>  |  EasyGames.open('bug', { game })  |  EasyGames.bug('#ziel', { game })
 *    Oder direkt per iframe: https://…/easygames/bug.html?embed=1[&game=<cloud-id>]
 *
 * Weitere Funktionen:
 *      EasyGames.ready(() => console.log(EasyGames.list()));   // alle Spiele (id, title, desc, url …)
 *      EasyGames.get('zotik'); EasyGames.url('zotik');
 *      EasyGames.tvUrl('anmacha-kart');                       // Link für den TV (nur Mehrspieler-Spiele, sonst null)
 *      EasyGames.device();                                    // Geräteerkennung (siehe device.js): { type, role, os, input, … }
 *      EasyGames.allow;                                       // Freigaben für eigene iframes: f.allow = EasyGames.allow
 *      EasyGames.guide('zotik', cb);                          // Anleitung + Steuerung (lädt guides.js bei Bedarf)
 */
(function () {
  'use strict';
  // Sprachausgabe für eingebettete Spiele: Chrome spricht in fremden iframes oft nicht – das Spiel (cloud/anmacha-cloud.js)
  // schickt seine Ansagen per 'eg-tts' hierher, diese Seite spricht sie. Nur für easygames-Spiele (GitHub Pages oder eigene Adresse).
  (function egTtsHost() {
    var s = window.speechSynthesis;
    if (!s || window.__egTtsHost || !window.SpeechSynthesisUtterance) return;
    window.__egTtsHost = 1;
    var live = {}, lastCancel = 0, wait = [], timer = 0;
    window.addEventListener('message', function (e) {
      var d = e.data;
      if (!d || d.type !== 'eg-tts' || !e.source || (e.origin !== 'https://ricorewioriginal-collab.github.io' && e.origin !== location.origin)) return;
      var src = e.source, origin = e.origin, reply = function (m) { m.type = 'eg-tts'; try { src.postMessage(m, origin); } catch (x) { } };
      if (d.op === 'hello') return reply({ op: 'host' });
      if (d.op === 'cancel') { live = {}; wait = []; clearTimeout(timer); timer = 0; lastCancel = Date.now(); try { s.cancel(); } catch (x) { } return; }
      if (d.op !== 'speak' || !d.id) return;
      var u = new SpeechSynthesisUtterance(String(d.text || '').slice(0, 1500)), id = String(d.id).slice(0, 20);
      u.lang = String(d.lang || '').slice(0, 20); u.rate = +d.rate || 1; u.pitch = +d.pitch || 1; u.volume = d.volume == null ? 1 : +d.volume;
      try { var v = d.voice && s.getVoices().filter(function (x) { return x.name === d.voice; })[0]; if (v) { u.voice = v; u.lang = v.lang; } } catch (x) { }
      live[id] = u;
      u.onstart = function () { reply({ op: 'ev', id: id, kind: 'start' }); };
      u.onend = function () { delete live[id]; reply({ op: 'ev', id: id, kind: 'end' }); };
      u.onerror = function (ev) { delete live[id]; reply({ op: 'ev', id: id, kind: 'error', error: ev && ev.error || '' }); };
      // Chrome für Android verschluckt eine Ansage direkt nach cancel(): kurz warten, Reihenfolge bleibt
      var go = function () { try { if (s.paused) s.resume(); s.speak(u); } catch (x) { } }, ms = 260 - (Date.now() - lastCancel);
      if (ms > 0 || wait.length) { wait.push(go); if (!timer) timer = setTimeout(function () { timer = 0; var l = wait; wait = []; l.forEach(function (f) { f(); }); }, Math.max(0, ms)); } else go();
    });
  })();
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
  // Eigener Teilen-Link je Spiel (share-Option bzw. data-share): Vorlage mit {id}, true/"auto" = diese Seite + #games/<id>.
  // Das Spiel bekommt die Adresse als ?eg_share und nutzt sie für „Spiel teilen“; #games/<id> beim Aufruf dieser Seite öffnet das Spiel.
  function shareTpl(o) {
    var t = o && o.share; if (t == null || t === false || t === 'false' || t === '') return null;
    if (t === true || t === 'true' || t === 'auto') t = location.href.split('#')[0] + '#games/{id}';
    if (typeof t !== 'string') return null; watchDeep(t); return t;
  }
  var deepOn = false;
  function watchDeep(t) {
    if (deepOn || t.indexOf(location.href.split('#')[0] + '#games/{id}') !== 0) return; deepOn = true;
    function go() {   // Spiel öffnen – außer es ist auf der Seite schon eingebettet (kein zweites Exemplar)
      var m = /^#games\/([\w-]+)/.exec(location.hash); if (!m) return;
      EG.ready(function () { setTimeout(function () { var g = find(m[1]); if (!g || current) return; var u = new URL(g.path, base).href, fr = document.querySelectorAll('iframe');
        for (var i = 0; i < fr.length; i++) if ((fr[i].src || '').indexOf(u) === 0) return; EG.open(m[1], { share: t }); }, 0); });
    }
    window.addEventListener('hashchange', go); go();
  }
  function gameUrl(g, o) {
    var u = new URL(g.path, base), t = shareTpl(o); u.searchParams.set('eg_build', window.EASYGAMES_BUILD || 'current');
    if (t && !/^https?:/.test(g.path)) u.searchParams.set('eg_share', t.replace(/\{id\}/g, encodeURIComponent(g.id)));
    return u.href;
  }

  // Freigaben für eingebettete Spiele (Permissions Policy): ohne sie fehlen in fremden Seiten Controller, Neigung, Mikrofon,
  // Kamera (QR), Kopieren, Teilen und Wach-Halten. Gleiche Liste in index.html, hub/anmacha-hub.js, einbinden.html (tools/check-games.js prüft das).
  var FRAME_ALLOW = 'fullscreen; autoplay; gamepad; accelerometer; gyroscope; microphone; camera; clipboard-write; web-share; screen-wake-lock';
  function frame(src, title, o) {
    var f = document.createElement('iframe');
    f.src = src; f.title = title; f.loading = 'lazy';
    f.allow = FRAME_ALLOW; f.setAttribute('allowfullscreen', '');
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

  // ---- Vollbild: ganze Seite (mode "page") und Overlay (mode "overlay" bzw. EasyGames.open) ----
  function fullFrame(src, title) {
    var f = document.createElement('iframe');
    f.src = src; f.title = title; f.allow = FRAME_ALLOW; f.setAttribute('allowfullscreen', '');
    f.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:0;margin:0;padding:0;background:#000;display:block';
    return f;
  }
  var LAYER_CSS = 'position:fixed;top:0;left:0;right:0;bottom:0;margin:0;padding:0;z-index:2147483000;background:#000';
  function pageLayer(t, src, title) {
    t.style.cssText += ';' + LAYER_CSS;
    t.appendChild(fullFrame(src, title));
    document.documentElement.style.overflow = 'hidden';
    if (document.body) document.body.style.overflow = 'hidden';
  }
  // Bibliothek-Adresse; layout "apps" = App-Kachel-Ansicht (nur Symbole mit Namen)
  function libUrl(o) { var t = shareTpl(o); return base + 'index.html?embed=1' + (o && o.layout === 'apps' ? '&view=apps' : '') + (o && o.layout === 'portal' ? '&portal=1' : '') + (t ? '&eg_share=' + encodeURIComponent(t) : ''); }
  // Zentrale Ranglisten-Seite (alle Spiele); game = Spiel-ID aus games.js zum Vorwählen
  function boardUrl(o) { return base + 'ranglisten.html?embed=1' + (o && o.game ? '&game=' + encodeURIComponent(o.game) : ''); }
  // Erfolge-Seite (spielübergreifend)
  function achUrl() { return base + 'erfolge.html?embed=1'; }
  // Benutzerkonto (Anmeldung für alle Spiele)
  function accUrl() { return base + 'konto.html?embed=1'; }
  // Chat (room: lobby | mitspieler | tipps | g-<spiel-id>)
  // Fehler melden (game = Cloud-ID des Spiels, z. B. snake)
  function bugUrl(o) { return base + 'bug.html?embed=1' + (o && o.game && /^[\w-]{1,40}$/.test(o.game) ? '&game=' + o.game : ''); }
  // Weitere Seiten: Tagesherausforderung („heute“) und Profil/Freunde („profil“)
  var EXTRA = { heute: ['heute.html', 'easygames – Heute'], profil: ['profil.html', 'easygames – Profil & Freunde'] };
  function extraUrl(name) { return base + EXTRA[name][0] + '?embed=1'; }
  function chatUrl(o) { return base + 'chat.html?embed=1' + (o && o.room && /^[a-z0-9-]{1,40}$/.test(o.room) ? '&room=' + o.room : ''); }
  var current = null;
  EG.close = function () { if (current) current(false); };
  // EasyGames.open('zotik' | 'all', { close:false, fullscreen:false, title, onClose })
  EG.open = function (game, o) {
    o = o || {};
    EG.ready(function () {
      var board = game === 'ranglisten', ach = game === 'erfolge', acc = game === 'konto', chat = game === 'chat', bug = game === 'bug', ex = !!EXTRA[game], g = game && game !== 'all' && !board && !ach && !acc && !chat && !bug && !ex ? find(game) : null;
      if (game && game !== 'all' && !board && !ach && !acc && !chat && !bug && !ex && !g) { console.error('EasyGames: unbekanntes Spiel "' + game + '"'); return; }
      var reuse = !!current && !!(history.state && history.state.egOverlay), opener = current && current.opener || document.activeElement;   // Verlaufseintrag und Fokus-Ziel des alten Overlays weiterverwenden
      if (current) current(true);   // ersetzt ein offenes Overlay (ohne Verlaufsschritt zurück, sonst würde das neue sofort schließen)
      var title = o.title || (g ? g.title : board ? 'easygames – Ranglisten' : ach ? 'easygames – Erfolge' : acc ? 'easygames – Konto' : chat ? 'easygames – Chat' : bug ? 'easygames – Fehler melden' : ex ? EXTRA[game][1] : 'easygames – Spielebibliothek'), box = document.createElement('div'), f = fullFrame(g ? gameUrl(g, o) : board ? boardUrl(o) : ach ? achUrl() : acc ? accUrl() : chat ? chatUrl(o) : bug ? bugUrl(o) : ex ? extraUrl(game) : libUrl(o), title);
      box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', title);
      box.style.cssText = LAYER_CSS;
      box.appendChild(f);
      var hidden = [], htmlOv = document.documentElement.style.overflow, bodyOv = document.body.style.overflow, pushed = false, closed = false;
      function done(fromPop) {
        if (closed) return; closed = true; current = null;
        window.removeEventListener('keydown', onKey, true); window.removeEventListener('popstate', onPop); window.removeEventListener('message', onMsg);
        try { if (document.fullscreenElement === box && document.exitFullscreen) document.exitFullscreen(); } catch (e) {}
        if (box.parentNode) box.parentNode.removeChild(box);
        document.documentElement.style.overflow = htmlOv; document.body.style.overflow = bodyOv;
        hidden.forEach(function (h) { if (h[1] === null) h[0].removeAttribute('aria-hidden'); else h[0].setAttribute('aria-hidden', h[1]); try { h[0].inert = h[2]; } catch (e) {} });   // Seite dahinter wieder zugänglich
        if (!fromPop && pushed && history.state && history.state.egOverlay) history.back();
        try { if (opener && opener !== document.body && opener.focus && document.contains(opener)) opener.focus(); } catch (e) {}   // Fokus zurück an den Auslöser
        if (typeof o.onClose === 'function') o.onClose();
      }
      function onKey(e) {
        if (e.key === 'Tab') { e.preventDefault(); try { f.focus(); } catch (x) {} return; }   // Tabulator bleibt im Overlay (Spiel)
        var back = e.key === 'GoBack' || e.key === 'BrowserBack' || e.key === 'XF86Back' || e.keyCode === 10009 || e.keyCode === 461 || e.keyCode === 4;   // Zurück-Tasten von TV/WebView
        if (back || (e.key === 'Escape' && !document.fullscreenElement)) { if (back) e.preventDefault(); done(false); }
      }
      function onPop() { done(true); }
      function onMsg(e) { if (e.source === f.contentWindow && e.data && e.data.type === 'easygames:close') done(false); }
      if (o.close !== false && o.close !== 'false') {
        var b = document.createElement('button');
        b.type = 'button'; b.textContent = '\u2715'; b.setAttribute('aria-label', 'Schlie\u00DFen');
        b.style.cssText = 'position:absolute;top:calc(8px + env(safe-area-inset-top,0px));right:calc(8px + env(safe-area-inset-right,0px));width:44px;height:44px;border:1px solid rgba(255,255,255,.35);border-radius:50%;background:rgba(8,11,18,.72);color:#fff;font:700 18px system-ui,sans-serif;cursor:pointer;z-index:2';
        b.onclick = function () { done(false); };
        box.appendChild(b);
      }
      Array.prototype.forEach.call(document.body.children, function (n) {   // Seite dahinter für Screenreader/Tastatur sperren, solange das Overlay offen ist
        if (n !== box && n.nodeType === 1 && !/^(SCRIPT|STYLE|LINK|NOSCRIPT)$/.test(n.tagName)) { hidden.push([n, n.getAttribute('aria-hidden'), !!n.inert]); n.setAttribute('aria-hidden', 'true'); try { n.inert = true; } catch (e) {} }
      });
      document.body.appendChild(box);
      document.documentElement.style.overflow = 'hidden'; document.body.style.overflow = 'hidden';
      if (reuse) pushed = true; else try { history.pushState({ egOverlay: 1 }, ''); pushed = true; } catch (e) {}
      window.addEventListener('keydown', onKey, true); window.addEventListener('popstate', onPop); window.addEventListener('message', onMsg);
      if (o.fullscreen !== false && o.fullscreen !== 'false') { var r = box.requestFullscreen || box.webkitRequestFullscreen; try { var p = r && r.call(box); if (p && p.catch) p.catch(function () {}); } catch (e) {} }
      current = function (fromPop) { done(!!fromPop); };
      current.opener = opener;
      if (typeof f.focus === 'function') setTimeout(function () { try { f.focus(); } catch (e) {} }, 50);
    });
  };
  // Klick auf das Element öffnet das Overlay (data-mode="overlay")
  function bindOpen(t, game, o) {
    if (!t.textContent.trim()) t.textContent = game === 'all' ? 'Alle Spiele' : 'Spielen';
    t.style.cursor = 'pointer'; t.setAttribute('role', 'button'); if (!t.hasAttribute('tabindex')) t.tabIndex = 0;
    t.addEventListener('click', function (e) { e.preventDefault(); EG.open(game, o); });
    t.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); EG.open(game, o); } });
  }
  function modesOf(g) { var m = {}, a = (window.EASYGAMES_MODES || {})[g.id] || {}, b = g.modes || {}, k; for (k in a) m[k] = a[k]; for (k in b) m[k] = b[k]; return m; }
  function multi(g) { var m = modesOf(g); return !!(m.pad || m.online || m.multi); }
  // Der richtige Link für TV-Gaming: öffentliche Spielseite (+ ?tv, wo das Spiel es kennt) – auch wenn diese Seite in einer App oder auf localhost läuft
  function tvUrl(g) { var D = window.EasyGamesDevice; return D ? D.tvUrl(g.path, modesOf(g).tvParam) : abs(g.path); }
  function info(g) { return { id: g.id, title: g.title, desc: g.desc, icon: g.icon, url: gameUrl(g), card: g.img ? abs(g.img) : null, bg: g.bg || null, glow: g.glow || null, multiplayer: multi(g), modes: modesOf(g), tvUrl: multi(g) ? tvUrl(g) : null }; }
  EG.list = function () { return (games || []).map(info); };
  EG.get = function (id) { var g = games && find(id); return g ? info(g) : null; };
  EG.tvUrl = function (id) { var g = games && find(id); return g && multi(g) ? tvUrl(g) : null; };
  EG.url = function (id) { var g = games && find(id); return g ? gameUrl(g) : null; };
  EG.baseUrl = base;
  EG.allow = FRAME_ALLOW;   // für eigene iframes: <iframe allow="…">
  EG.device = function () { return window.EasyGamesDevice ? window.EasyGamesDevice.get() : null; };
  if (!window.EasyGamesDevice) load('device.js', function () {});
  EG.guide = function (id, cb) {
    function go() { cb(guides && guides[id] || null); }
    if (guides) go(); else load('guides.js', function () { guides = window.EASYGAMES_GUIDES; go(); });
  };

  // App-Kachel für ein einzelnes Spiel (layout "tile"): Symbol mit Namen, Klick öffnet es im Vollbild (oder mode "page" lädt es direkt)
  function appTile(t, o) {
    var g = find(o.game);
    if (!g) { console.error('EasyGames: unbekanntes Spiel "' + o.game + '"'); return; }
    var b = document.createElement('button'), ic = document.createElement('span'), nm = document.createElement('span');
    b.type = 'button'; b.setAttribute('aria-label', g.title + ' spielen');
    b.style.cssText = 'display:inline-flex;flex-direction:column;align-items:center;gap:8px;width:' + (o.width || '96px') + ';padding:0;border:0;background:none;color:inherit;font:700 13px/1.25 system-ui,sans-serif;cursor:pointer;text-align:center';
    ic.style.cssText = 'display:flex;align-items:center;justify-content:center;width:84px;height:84px;border-radius:22%;overflow:hidden;font-size:40px;box-shadow:0 6px 16px rgba(0,0,0,.35),0 0 0 1px rgba(255,255,255,.14);background:' + (g.bg || '#222');
    if (g.img) { var im = document.createElement('img'); im.src = abs(g.img); im.alt = ''; im.loading = 'lazy'; im.style.cssText = 'width:100%;height:100%;object-fit:cover'; ic.appendChild(im); } else ic.textContent = g.icon || '\uD83C\uDFAE';
    nm.textContent = o.title || g.title;
    b.appendChild(ic); b.appendChild(nm);
    b.addEventListener('click', function () { if (o.mode === 'page') { t.removeChild(b); pageLayer(t, gameUrl(g, o), g.title); } else EG.open(o.game, o); });
    t.appendChild(b);
  }
  // EasyGames.embed(ziel, { game, width, maxWidth, ratio, height, radius, title, className })
  EG.embed = function (target, o) {
    o = o || {};
    var t = el(target);
    if (!t) { console.error('EasyGames: Ziel nicht gefunden:', target); return null; }
    if (o.layout === 'tile') { EG.ready(function () { appTile(t, o); }); return t; }
    if (o.mode === 'overlay') { bindOpen(t, o.game, o); return t; }
    var f;
    EG.ready(function () {
      var g = find(o.game);
      if (!g) { console.error('EasyGames: unbekanntes Spiel "' + o.game + '"'); return; }
      if (o.mode === 'page') { pageLayer(t, gameUrl(g, o), o.title || g.title); return; }
      f = frame(gameUrl(g, o), o.title || g.title, o);
      var node = wrap(f, o), row = tvRow(g, o);
      if (row) { var box = document.createElement('div'); box.style.cssText = 'width:' + (o.width || '100%') + ';max-width:' + (o.maxWidth || '960px'); node.style.width = '100%'; node.style.maxWidth = 'none'; box.appendChild(node); box.appendChild(row); node = box; }
      t.appendChild(node);
    });
    return t;
  };
  // EasyGames.portal(ziel, { height, maxWidth, … }) – das komplette Spieleportal von easygames (Karussell, Sammlungen, Reihen, Favoriten, Suche) als eingebettete Seite;
  // gleiche Aufmachung wie auf easygames, immer auf dem neuesten Stand. Standard: volle Breite, 80 % der Fensterhöhe (mindestens 560 px).
  EG.portal = function (target, o) {
    o = o || {};
    var p = {}, k; for (k in o) p[k] = o[k];
    p.layout = 'portal'; p.maxWidth = p.maxWidth || 'none'; p.height = p.height || 'max(560px, 80vh)'; p.radius = p.radius || '16px';
    return EG.library(target, p);
  };

  // EasyGames.library(ziel, { … }) – komplette Spielübersicht
  EG.library = function (target, o) {
    o = o || {};
    var t = el(target);
    if (!t) { console.error('EasyGames: Ziel nicht gefunden:', target); return null; }
    if (o.mode === 'overlay') { bindOpen(t, 'all', o); return t; }
    if (o.mode === 'page') { pageLayer(t, libUrl(o), o.title || 'easygames – Spielebibliothek'); return t; }
    t.appendChild(frame(libUrl(o), o.title || 'easygames – Spielebibliothek', o));
    return t;
  };

  // EasyGames.leaderboard(ziel, { game, mode: 'page'|'overlay', … }) – Ranglisten aller Spiele (game = Spiel-ID vorwählen)
  EG.leaderboard = function (target, o) {
    o = o || {};
    var t = el(target);
    if (!t) { console.error('EasyGames: Ziel nicht gefunden:', target); return null; }
    if (o.mode === 'overlay') { bindOpen(t, 'ranglisten', o); return t; }
    if (o.mode === 'page') { pageLayer(t, boardUrl(o), o.title || 'easygames – Ranglisten'); return t; }
    t.appendChild(frame(boardUrl(o), o.title || 'easygames – Ranglisten', o));
    return t;
  };

  // EasyGames.achievements(ziel, { mode: 'page'|'overlay', … }) – spielübergreifende Erfolge
  EG.achievements = function (target, o) {
    o = o || {};
    var t = el(target);
    if (!t) { console.error('EasyGames: Ziel nicht gefunden:', target); return null; }
    if (o.mode === 'overlay') { bindOpen(t, 'erfolge', o); return t; }
    if (o.mode === 'page') { pageLayer(t, achUrl(), o.title || 'easygames – Erfolge'); return t; }
    t.appendChild(frame(achUrl(), o.title || 'easygames – Erfolge', o));
    return t;
  };

  // EasyGames.account(ziel, { mode: 'page'|'overlay', … }) – Benutzerkonto: einmal anmelden, in allen Spielen angemeldet
  EG.account = function (target, o) {
    o = o || {};
    var t = el(target);
    if (!t) { console.error('EasyGames: Ziel nicht gefunden:', target); return null; }
    if (o.mode === 'overlay') { bindOpen(t, 'konto', o); return t; }
    if (o.mode === 'page') { pageLayer(t, accUrl(), o.title || 'easygames – Konto'); return t; }
    t.appendChild(frame(accUrl(), o.title || 'easygames – Konto', o));
    return t;
  };

  // EasyGames.chat(ziel, { room, mode: 'page'|'overlay', … }) – Chat für angemeldete Spieler
  EG.chat = function (target, o) {
    o = o || {};
    var t = el(target);
    if (!t) { console.error('EasyGames: Ziel nicht gefunden:', target); return null; }
    if (o.mode === 'overlay') { bindOpen(t, 'chat', o); return t; }
    if (o.mode === 'page') { pageLayer(t, chatUrl(o), o.title || 'easygames – Chat'); return t; }
    t.appendChild(frame(chatUrl(o), o.title || 'easygames – Chat', o));
    return t;
  };

  // EasyGames.bug(ziel, { game, mode: 'page'|'overlay', … }) – Fehler melden (angemeldete Spieler)
  EG.bug = function (target, o) {
    o = o || {};
    var t = el(target);
    if (!t) { console.error('EasyGames: Ziel nicht gefunden:', target); return null; }
    if (o.mode === 'overlay') { bindOpen(t, 'bug', o); return t; }
    if (o.mode === 'page') { pageLayer(t, bugUrl(o), o.title || 'easygames – Fehler melden'); return t; }
    t.appendChild(frame(bugUrl(o), o.title || 'easygames – Fehler melden', o));
    return t;
  };

  // EasyGames.page('heute' | 'profil', ziel, { mode: 'page'|'overlay', … })
  EG.page = function (name, target, o) {
    o = o || {}; if (!EXTRA[name]) { console.error('EasyGames: unbekannte Seite "' + name + '"'); return null; }
    var t = el(target); if (!t) { console.error('EasyGames: Ziel nicht gefunden:', target); return null; }
    if (o.mode === 'overlay') { bindOpen(t, name, o); return t; }
    if (o.mode === 'page') { pageLayer(t, extraUrl(name), o.title || EXTRA[name][1]); return t; }
    t.appendChild(frame(extraUrl(name), o.title || EXTRA[name][1], o)); return t;
  };

  function scan() {
    var nodes = document.querySelectorAll('[data-easygames]');
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i]; if (n.getAttribute('data-easygames-done')) continue;
      n.setAttribute('data-easygames-done', '1');
      var d = n.dataset, o = { width: d.width, maxWidth: d.maxWidth, ratio: d.ratio, height: d.height, radius: d.radius, title: d.title, fullscreen: d.fullscreen, tvLink: d.tvLink, mode: d.mode, close: d.close, layout: d.layout, share: d.share };
      if (d.easygames === 'all') EG.library(n, o); else if (d.easygames === 'portal') EG.portal(n, o); else if (d.easygames === 'ranglisten') { o.game = d.game; EG.leaderboard(n, o); } else if (d.easygames === 'erfolge') EG.achievements(n, o); else if (d.easygames === 'konto') EG.account(n, o); else if (d.easygames === 'chat') { o.room = d.room; EG.chat(n, o); } else if (d.easygames === 'bug') { o.game = d.game; EG.bug(n, o); } else if (EXTRA[d.easygames]) EG.page(d.easygames, n, o); else { o.game = d.easygames; EG.embed(n, o); }
    }
  }
  EG.scan = scan;

  // Ein Login für alle eingebetteten Spiele dieser Seite: Meldet sich ein Spiel/eine Seite an (Fenster von ricorewi-radio.de), merkt sich die einbettende Seite das Konto
  // und gibt es an alle easygames-iframes weiter; neue iframes bekommen es beim Start. So genügt eine Anmeldung je Seite, auch wenn der Browser Speicher in iframes trennt.
  (function () {
    var K = 'anmacha-embed-account';
    var HOME = new URL(base).origin;
    // nur iframes von easygames selbst (nie fremde Werbe-/Video-iframes der Seite)
    function frames() { return [].slice.call(document.querySelectorAll('iframe')).filter(function (f) { try { return new URL(f.src, location.href).origin === HOME; } catch (e) { return false; } }); }
    function send(f, d) { try { f.contentWindow.postMessage(d, new URL(f.src, location.href).origin); } catch (e) { } }
    function get() {   // Konto der einbettenden Seite: eigener Login-Knopf (anmacha-account.js im Kopf der Seite) hat Vorrang, sonst das gemerkte Konto
      var A = window.AnMaChaAccount, t = A && A.token && A.token(), u = t && A.user && A.user();
      if (t && u) return { token: t, user: { name: u.name, picture: u.picture || '' } };
      try { var v = JSON.parse(localStorage.getItem(K) || 'null'); return v && v.token && v.user ? v : null; } catch (e) { return null; }
    }
    function all() { var v = get(); frames().forEach(function (f) { send(f, v ? { type: 'anmacha-account', token: v.token, user: v.user } : { type: 'anmacha-account', token: '', user: null }); }); }
    window.addEventListener('anmacha-account-changed', all);   // Login/Logout im Kopf der einbettenden Seite → alle Spiele
    window.addEventListener('message', function (e) {
      var d = e.data; if (!d || typeof d !== 'object' || (d.type !== 'anmacha-account' && d.type !== 'anmacha-account-hello')) return;
      var from = frames().filter(function (f) { return f.contentWindow === e.source; })[0]; if (!from) return;
      if (d.type === 'anmacha-account-hello') { var v = get(); if (v) send(from, { type: 'anmacha-account', token: v.token, user: v.user }); return; }
      var ok = typeof d.token === 'string' && d.token && d.token.length < 2000 && d.user && typeof d.user.name === 'string';
      if (window.AnMaChaAccount && window.AnMaChaAccount.adopt) { if (ok) window.AnMaChaAccount.adopt(d.token, d.user); else if (window.AnMaChaAccount.token()) window.AnMaChaAccount.logout(); }
      try { if (ok) localStorage.setItem(K, JSON.stringify({ token: d.token, user: { name: d.user.name.slice(0, 80), picture: String(d.user.picture || '').slice(0, 300) } })); else localStorage.removeItem(K); } catch (x) { }
      frames().forEach(function (f) { if (f !== from) send(f, ok ? { type: 'anmacha-account', token: d.token, user: d.user } : { type: 'anmacha-account', token: '', user: null }); });
    });
  })();

  function start() {
    var q = waiting; waiting = [];
    q.forEach(function (cb) { cb(); });
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan); else scan();
  }
  function withModes() { if (window.EASYGAMES_MODES) start(); else load('modes.js', start); }   // Mehrspieler-Angaben für die TV-Links
  if (games) withModes(); else load('games.js', function () { games = window.EASYGAMES_GAMES; withModes(); });
})();
