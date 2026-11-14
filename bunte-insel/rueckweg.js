/* Rückweg zur Bunten Insel: Wer durch ein Portal der Bunten Insel kommt (?from=bunteinsel), sieht in diesem Spiel für diese Sitzung
   einen kleinen Knopf „Zurück zur Bunten Insel“ (oben in der Mitte, klappt nach einigen Sekunden zum Inselsymbol zusammen).
   Die Insel setzt einen dann direkt vor dem Portal ab (?from=<ordner>). Gleiches Gerät, darum lokal – klappt auch offline in der App.
   Eingebunden mit <script src="../bunte-insel/rueckweg.js" defer></script>; ohne ?from=bunteinsel passiert nichts. */
(function () {
  var K = 'eg-from-bunteinsel', on = /[?&]from=bunteinsel\b/.test(location.search);
  try { if (on) sessionStorage.setItem(K, '1'); else on = sessionStorage.getItem(K) === '1'; } catch (e) { }
  if (!on) return;
  function add() {
    if (document.getElementById('egBuntBack')) return;
    var from = (location.pathname.match(/\/([^\/]+)\/(?:[^\/]*\.html)?$/) || [])[1] || '', a = document.createElement('a'), t = document.createElement('span');
    a.id = 'egBuntBack'; a.href = new URL('../bunte-insel/' + (from ? '?from=' + encodeURIComponent(from) : ''), location.href).href; a.setAttribute('aria-label', 'Zurück zur Bunten Insel'); a.title = 'Zurück zur Bunten Insel';
    a.textContent = '🏝️'; t.textContent = ' Zurück zur Bunten Insel'; a.appendChild(t);
    a.style.cssText = 'position:fixed;left:50%;top:calc(6px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:2147482000;display:flex;align-items:center;gap:2px;' +
      'padding:6px 12px;border-radius:999px;background:rgba(40,20,90,.9);color:#fff;border:2px solid #ffd23f;font:800 13px/1.2 system-ui,sans-serif;text-decoration:none;white-space:nowrap;box-shadow:0 4px 14px rgba(0,0,0,.4)';
    function fold(v) { t.style.display = v ? 'none' : ''; a.style.padding = v ? '5px 8px' : '6px 12px'; }
    a.addEventListener('mouseenter', function () { fold(false); }); a.addEventListener('mouseleave', function () { fold(true); });
    a.addEventListener('focus', function () { fold(false); }); a.addEventListener('blur', function () { fold(true); });
    a.addEventListener('click', function () { try { sessionStorage.removeItem(K); } catch (e) { } });
    document.body.appendChild(a); setTimeout(function () { if (document.activeElement !== a) fold(true); }, 8000);
  }
  if (document.body) add(); else addEventListener('DOMContentLoaded', add);
})();
