/*!
 * egstat.js – anonyme Spielstatistik für easygames (Auswertung im AnMaCha Control Center: admin.html → easygames).
 *
 *   <script src="../egstat.js" defer></script>   (in jedem Spiel, neben gamepad.js)
 *
 * Meldet beim Verlassen des Spiels (bzw. wenn es in den Hintergrund geht) einmal: Spiel-Ordner, sichtbar gespielte Sekunden,
 * Plattform (web, android, windows, tv) und ob mit Controller gespielt wurde – per navigator.sendBeacon an
 * https://control.ricorewi-radio.de/cron.php?action=eg_stat (andere Adresse: window.EASYGAMES_STATS_URL vor dem Skript).
 * Keine Kennung, kein Cookie, nichts wird auf dem Gerät gespeichert. Aus: „Do Not Track“ im Browser, window.EASYGAMES_NO_STATS = true
 * oder ?nostats in der Adresse. Kürzer als 3 Sekunden wird nicht gemeldet.
 */
(function (W) {
  'use strict';
  var D = W.document, N = W.navigator;
  if (!D || W.__egStat || !N || typeof N.sendBeacon !== 'function') return;
  W.__egStat = 1;
  if (W.EASYGAMES_NO_STATS || /[?&]nostats\b/.test(W.location.search) || N.doNotTrack === '1' || W.doNotTrack === '1') return;
  var me = D.currentScript, base = me && me.src ? new URL('.', me.src).href : '', here = W.location.href.split(/[?#]/)[0];
  var game = (base && here.indexOf(base) === 0 ? here.slice(base.length) : W.location.pathname.replace(/^\/+/, '')).split('/')[0].toLowerCase();
  if (!/^[a-z0-9][a-z0-9-]{1,47}$/.test(game)) return;
  var h = W.location.hostname, ua = N.userAgent || '';
  var plat = /androidplatform\.net$/.test(h) ? 'android' : h === 'appassets.local' ? 'windows' : (/[?&](tv|eg_tv)=/.test(W.location.search) || /SMART-TV|SmartTV|Tizen|Web0S|AFT|BRAVIA|GoogleTV|Android TV/i.test(ua)) ? 'tv' : 'web';
  var URL_ = W.EASYGAMES_STATS_URL || 'https://control.ricorewi-radio.de/cron.php?action=eg_stat';
  var pad = 0, ms = 0, since = D.visibilityState === 'hidden' ? 0 : Date.now(), sent = false;
  W.addEventListener('easygames:pad', function (e) { if (e.detail && e.detail.on) pad = 1; });
  W.addEventListener('gamepadconnected', function () { pad = 1; });
  function stop() { if (since) { ms += Date.now() - since; since = 0; } }
  function send() {
    stop();
    var s = Math.round(ms / 1000);
    if (sent || s < 3) return;
    sent = true;
    try { N.sendBeacon(URL_, JSON.stringify({ g: game, s: s, p: plat, c: pad })); } catch (e) { }
  }
  // Hintergrund (Handy: oft das letzte sichere Ereignis) oder Seite verlassen: melden. Kommt man zurück, beginnt eine neue Sitzung.
  D.addEventListener('visibilitychange', function () {
    if (D.visibilityState === 'hidden') send();
    else if (!since) { if (sent) { sent = false; ms = 0; pad = 0; } since = Date.now(); }
  });
  W.addEventListener('pagehide', send);
})(window);
