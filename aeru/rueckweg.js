/* Rückweg zu AERU: Wer durch ein Portal in AERU kommt (?from=aeru), sieht in Bunte Insel und Zotik für diese Sitzung
   einen kleinen Knopf „Zurück zu AERU“ (oben in der Mitte, klappt nach einigen Sekunden zum Drachensymbol zusammen).
   Eingebunden mit <script src="../aeru/rueckweg.js" defer></script>; ohne ?from=aeru passiert nichts. */
(function () {
  var K = 'eg-from-aeru', on = /[?&]from=aeru\b/.test(location.search);
  try { if (on) sessionStorage.setItem(K, '1'); else on = sessionStorage.getItem(K) === '1'; } catch (e) { }
  if (!on) return;
  function add() {
    if (document.getElementById('egAeruBack')) return;
    var from = /zotik/.test(location.pathname) ? 'zotik' : 'bunteinsel', a = document.createElement('a'), t = document.createElement('span');
    a.id = 'egAeruBack'; a.href = new URL('../aeru/?from=' + from, location.href).href; a.setAttribute('aria-label', 'Zurück zu AERU'); a.title = 'Zurück zu AERU';
    a.textContent = '🐉'; t.textContent = ' Zurück zu AERU'; a.appendChild(t);
    a.style.cssText = 'position:fixed;left:50%;top:calc(6px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:2147482000;display:flex;align-items:center;gap:2px;' +
      'padding:6px 12px;border-radius:999px;background:rgba(11,41,45,.9);color:#fff3d3;border:1px solid #f4cc81;font:800 13px/1.2 system-ui,sans-serif;text-decoration:none;white-space:nowrap;box-shadow:0 4px 14px rgba(0,0,0,.4)';
    function fold(v) { t.style.display = v ? 'none' : ''; a.style.padding = v ? '5px 8px' : '6px 12px'; }
    a.addEventListener('mouseenter', function () { fold(false); }); a.addEventListener('mouseleave', function () { fold(true); });
    a.addEventListener('focus', function () { fold(false); }); a.addEventListener('blur', function () { fold(true); });
    a.addEventListener('click', function () { try { sessionStorage.removeItem(K); } catch (e) { } });
    document.body.appendChild(a); setTimeout(function () { if (document.activeElement !== a) fold(true); }, 8000);
  }
  if (document.body) add(); else addEventListener('DOMContentLoaded', add);
})();
