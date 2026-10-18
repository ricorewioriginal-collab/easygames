/* Spinwelten 3D – Lader: lädt alle Spieldateien in fester Reihenfolge mit echtem Fortschritt (Anzahl geladener Dateien).
 * Hängt etwas länger als 25 s oder schlägt eine Datei fehl, erscheinen „Erneut versuchen“, „Grafik reduzieren“ und „Zurück“. */
(function () {
  'use strict';
  var FILES = ['../vendor/three-r128.min.js',
    'js/core/rng.js', 'js/data/reels.js', 'js/core/economy.js', 'js/data/worlds.js', 'js/data/cards.js', 'js/data/quests.js', 'js/data/achievements.js',
    'js/data/story.js', 'js/data/companions.js', 'js/data/bots.js', 'js/data/events.js', 'js/core/save.js', 'js/core/clock.js',
    'js/game/core.js', 'js/game/companions.js', 'js/game/spin.js', 'js/game/village.js', 'js/game/bots.js', 'js/game/attacks.js', 'js/game/raid.js',
    'js/game/collectibles.js', 'js/game/campaigns.js', 'js/game/minigames.js',
    'js/i18n.js', 'js/audio.js', 'js/input.js',
    'js/render/models.js', 'js/render/vfx.js', 'js/render/details.js', 'js/render/symbols.js', 'js/render/world.js', 'js/render/machine.js',
    'js/render/atlas.js', 'js/render/characters.js', 'js/render/renderer.js',
    'js/net/protocol.js', 'js/net/online-api.js', 'js/net/lobby.js',
    'js/ui/ui.js', 'js/ui/panels.js', 'js/ui/flows.js', 'js/ui/tutorial.js', 'js/main.js'];
  var bar = document.getElementById('bootBar'), msg = document.getElementById('bootMsg'), box = document.getElementById('bootErr'), etx = document.getElementById('bootErrTx');
  var en = /^en\b/i.test(navigator.language || '');
  try { var st = JSON.parse(localStorage.getItem('spinweltenSettings') || 'null'); if (st && st.lang) en = st.lang === 'en'; } catch (e) { /* ohne Speicher */ }
  var L = function (de, e) { return en ? e : de; };
  if (en) { document.documentElement.lang = 'en'; document.getElementById('bootRetry').textContent = 'Try again'; document.getElementById('bootLow').textContent = 'Reduce graphics'; document.getElementById('bootBack').textContent = 'Back'; document.querySelector('#boot .sub').textContent = 'The Adventure of the Wonder Isles'; document.querySelector('#boot .tag').textContent = 'Spin. Explore. Build. Conquer.'; }
  var done = 0, failed = false, timer = 0;
  function progress(extra) {
    var p = Math.round((done / (FILES.length + 1)) * 100 + (extra || 0));
    bar.style.width = Math.min(100, p) + '%';
    msg.textContent = L('Lädt … ', 'Loading … ') + Math.min(100, p) + ' %';
  }
  function fail(why) {
    if (failed) return; failed = true; clearTimeout(timer);
    box.classList.remove('hidden'); etx.textContent = why; msg.textContent = '';
  }
  window.SW_BOOT = {
    step: function (txt) { msg.textContent = txt; },
    finish: function () { clearTimeout(timer); done = FILES.length + 1; progress(); },
    fail: fail,
    L: L
  };
  document.getElementById('bootRetry').onclick = function () { location.reload(); };
  document.getElementById('bootLow').onclick = function () {
    try { var s = JSON.parse(localStorage.getItem('spinweltenSettings') || '{}') || {}; s.quality = 'low'; localStorage.setItem('spinweltenSettings', JSON.stringify(s)); } catch (e) { /* egal */ }
    location.reload();
  };
  document.getElementById('bootBack').onclick = function () { if (history.length > 1) history.back(); else location.href = '../'; };
  // WebGL vorab prüfen
  try {
    var c = document.createElement('canvas');
    if (!(c.getContext('webgl') || c.getContext('experimental-webgl'))) { fail(L('Dein Gerät oder Browser unterstützt kein WebGL (3D). Bitte einen aktuellen Browser verwenden oder die Hardwarebeschleunigung einschalten.', 'Your device or browser does not support WebGL (3D). Please use a current browser or enable hardware acceleration.')); return; }
  } catch (e) { /* weiter versuchen */ }
  timer = setTimeout(function () { fail(L('Das Laden dauert ungewöhnlich lange. Prüfe die Verbindung und versuche es erneut.', 'Loading is taking unusually long. Check your connection and try again.')); }, 25000);
  progress();
  FILES.forEach(function (f) {
    var s = document.createElement('script'); s.src = f; s.async = false;
    s.onload = function () { done++; if (!failed) progress(); };
    s.onerror = function () { fail(L('Eine Spieldatei konnte nicht geladen werden: ', 'A game file could not be loaded: ') + f); };
    document.head.appendChild(s);
  });
})();
