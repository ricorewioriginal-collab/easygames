/*!
 * telegram.js – easygames als Telegram-Mini-App (Bot bei @BotFather, Menü-Knopf/Haupt-Mini-App = https://ricorewioriginal-collab.github.io/easygames/).
 *
 *   <script src="telegram.js"></script>   (nur index.html, im <head> vor allem anderen)
 *
 * Tut außerhalb von Telegram nichts. In Telegram: lädt telegram-web-app.js, öffnet die Mini-App groß, verhindert, dass ein Wischen
 * nach unten mitten im Spiel die App schließt, färbt Kopf- und Hintergrund wie easygames und zeigt Telegrams Zurück-Knopf, solange
 * ein Spiel offen ist (schließt das Spiel). Startlink mit Spiel: t.me/<bot>?startapp=<spiel-id> bzw. t.me/<bot>/<app>?startapp=<spiel-id>.
 * Für index.html: window.EG_TG = { start: '<spiel-id>' | '', ready: Promise }.
 */
(function (W) {
  'use strict';
  var D = W.document, h = W.location.hash || '';
  var inTg = /[#&]tgWebApp(Data|Version|Platform)=/.test(h);
  try { if (inTg) W.sessionStorage.setItem('eg-tg', '1'); else inTg = W.sessionStorage.getItem('eg-tg') === '1'; } catch (e) { }
  if (!inTg || W.parent !== W) return;
  var p = {}; h.replace(/^#/, '').split('&').forEach(function (kv) { var i = kv.indexOf('='); if (i > 0) { try { p[kv.slice(0, i)] = decodeURIComponent(kv.slice(i + 1)); } catch (e) { } } });
  var start = String(p.tgWebAppStartParam || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 48);
  var ready = new Promise(function (res) {
    var s = D.createElement('script'), done = false, fin = function () { if (!done) { done = true; res(W.Telegram && W.Telegram.WebApp || null); } };
    s.src = 'https://telegram.org/js/telegram-web-app.js'; s.onload = fin; s.onerror = fin; setTimeout(fin, 4000);   // ohne Netz zu telegram.org trotzdem weiter
    D.head.appendChild(s);
  });
  W.EG_TG = { start: start, ready: ready };
  D.documentElement.classList.add('in-telegram');
  ready.then(function (tg) {
    if (!tg) return;
    var v = function (x) { try { return tg.isVersionAtLeast(x); } catch (e) { return false; } }, safe = function (f) { try { f(); } catch (e) { } };
    safe(function () { tg.ready(); });
    safe(function () { tg.expand(); });
    if (v('7.7')) safe(function () { tg.disableVerticalSwipes(); });   // Wischen im Spiel schließt die App nicht
    if (v('6.1')) { safe(function () { tg.setHeaderColor('#080B12'); }); safe(function () { tg.setBackgroundColor('#080B12'); }); }
    if (v('7.10')) safe(function () { tg.setBottomBarColor('#080B12'); });
    // Zurück-Knopf von Telegram = Spiel schließen (index.html zeigt das Spiel in #viewer)
    if (!v('6.1') || !tg.BackButton) return;
    var viewer = D.getElementById('viewer'), sync = function () { var open = viewer && !viewer.classList.contains('hidden'); safe(function () { tg.BackButton[open ? 'show' : 'hide'](); }); };
    tg.BackButton.onClick(function () { if (typeof W.closeGame === 'function') W.closeGame(); else W.history.back(); });
    var watch = function () { viewer = D.getElementById('viewer'); if (!viewer) return; new MutationObserver(sync).observe(viewer, { attributes: true, attributeFilter: ['class'] }); sync(); };
    if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', watch); else watch();
  });
})(window);
