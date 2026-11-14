/* Rückweg zu „AnMaCha – Der Podcast“: Wer durch ein Portal am easygames-Portalplatz kommt (?from=anmacha-podcast-tycoon), sieht in diesem Spiel
   für diese Sitzung einen kleinen Knopf „Zurück zum Podcast“ (oben in der Mitte, klappt nach einigen Sekunden zum Mikro zusammen).
   Der Podcast setzt einen dann direkt vor dem passenden Portal ab (?from=<ordner>). Gleiches Gerät, darum lokal – klappt auch offline in der App.
   Eingebunden mit <script src="../anmacha-podcast-tycoon/rueckweg.js" defer></script>; ohne ?from=anmacha-podcast-tycoon passiert nichts. */
(function () {
  var K = 'eg-from-anmacha', on = /[?&]from=anmacha-podcast-tycoon\b/.test(location.search);
  try { if (on) sessionStorage.setItem(K, '1'); else on = sessionStorage.getItem(K) === '1'; } catch (e) { }
  if (!on) return;
  function add() {
    if (document.getElementById('egAmcBack')) return;
    var from = (location.pathname.match(/\/([^\/]+)\/(?:[^\/]*\.html)?$/) || [])[1] || '', a = document.createElement('a'), t = document.createElement('span');
    a.id = 'egAmcBack'; a.href = new URL('../anmacha-podcast-tycoon/' + (from ? '?from=' + encodeURIComponent(from) : ''), location.href).href; a.setAttribute('aria-label', 'Zurück zum Podcast'); a.title = 'Zurück zu AnMaCha – Der Podcast';
    a.textContent = '🎙️'; t.textContent = ' Zurück zum Podcast'; a.appendChild(t);
    a.style.cssText = 'position:fixed;left:50%;top:calc(6px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:2147482000;display:flex;align-items:center;gap:2px;' +
      'padding:6px 12px;border-radius:999px;background:rgba(20,22,31,.92);color:#fff;border:2px solid #ff8a1e;font:800 13px/1.2 system-ui,sans-serif;text-decoration:none;white-space:nowrap;box-shadow:0 4px 14px rgba(0,0,0,.4)';
    function fold(v) { t.style.display = v ? 'none' : ''; a.style.padding = v ? '5px 8px' : '6px 12px'; }
    a.addEventListener('mouseenter', function () { fold(false); }); a.addEventListener('mouseleave', function () { fold(true); });
    a.addEventListener('focus', function () { fold(false); }); a.addEventListener('blur', function () { fold(true); });
    a.addEventListener('click', function () { try { sessionStorage.removeItem(K); } catch (e) { } });
    document.body.appendChild(a); setTimeout(function () { if (document.activeElement !== a) fold(true); }, 8000);
  }
  if (document.body) add(); else addEventListener('DOMContentLoaded', add);
})();
