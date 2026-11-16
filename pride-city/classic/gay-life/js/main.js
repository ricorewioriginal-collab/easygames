/* GayLife – Start: alle Module sind geladen und haben sich am Ereignisbus angemeldet, jetzt startet der Kern (Stadt oder Menü). */
(function () {
  'use strict';
  GL.boot();
  document.addEventListener('visibilitychange', function () { if (document.hidden) GL.save(); });
})();
