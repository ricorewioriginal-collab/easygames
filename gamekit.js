/*!
 * gamekit.js – kleine Hilfen für neue easygames-Spiele (keine Abhängigkeiten; nutzt device.js, wenn vorhanden)
 *
 *   <script src="../device.js"></script>
 *   <script src="../gamekit.js"></script>
 *   EasyGamesKit.start({
 *     controller: code => …,   // per QR-Code/?join=CODE eingeladen: dieses Gerät ist Controller/Pad
 *     host: info => …,         // großer Bildschirm (TV oder ?tv): Spiel anzeigen + QR-Code für Handys
 *     solo: () => …            // normal spielen (Handy, Tablet, Computer)
 *   });
 *
 * Weitere Hilfen: tvUrl() (Link für den TV), mode(), device(), joinCode(), joinUrl(raum), onDevice(cb), fullscreenOnInput(),
 * keepAwake(), back(handler), close(), menu(), next(), prev()
 */
(function (root) {
  'use strict';
  var K = root.EasyGamesKit = {
    version: 1,
    device: function () { return root.EasyGamesDevice ? root.EasyGamesDevice.get() : null; },
    params: function () { try { return new URLSearchParams(root.location.search); } catch (e) { return new URLSearchParams(''); } },
    // Der richtige Link für TV-Gaming dieses Spiels (öffentliche Adresse; auch wenn das Spiel gerade in einer App läuft).
    // param: Parameter, der am TV die Lobby öffnet (Standard '?tv'; null/'' = keiner). folder: Ordnername des Spiels (Standard: aus der Adresse)
    tvUrl: function (param, folder) {
      var D = root.EasyGamesDevice, p = param === undefined ? 'tv' : param;
      var f = folder || root.location.pathname.replace(/[^/]*$/, '').split('/').filter(Boolean).pop() || '';
      var url = D ? D.tvUrl(f ? f + '/' : '', p) : root.location.href.split('#')[0].split('?')[0] + (p ? '?' + String(p).replace(/^\?/, '') : '');
      return url;
    },
    // Gleiche Regel wie in den bestehenden Spielen: ?join=CODE, bis zu 6 Zeichen A–Z/0–9
    joinCode: function () { return (K.params().get('join') || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6); },
    isTv: function () { var d = K.device(); return K.params().has('tv') || !!(d && d.type === 'tv'); },
    // 'controller' (per ?join eingeladen) | 'host' (TV/großer Bildschirm) | 'solo'
    mode: function () { return K.joinCode() ? 'controller' : K.isTv() ? 'host' : 'solo'; },
    start: function (h) {
      var m = K.mode(), info = { mode: m, device: K.device(), join: K.joinCode(), tv: K.isTv() };
      if (m === 'controller' && h.controller) h.controller(info.join, info);
      else if (m === 'host' && h.host) h.host(info);
      else if (h.solo) h.solo(info);
      if (h.any) h.any(m, info);
      return m;
    },
    // Adresse, die Handys per QR-Code öffnen (die Spielseite selbst, so funktioniert sie auch außerhalb der Übersicht)
    joinUrl: function (room, extra) { return root.location.href.split('#')[0].split('?')[0] + '?join=' + encodeURIComponent(room) + (extra || ''); },
    // Gerät jetzt und bei Änderungen (device.js oder Nachricht der Übersicht)
    onDevice: function (cb) {
      var d = K.device(); if (d) cb(d);
      var off = root.EasyGamesDevice ? root.EasyGamesDevice.on(cb) : function () {};
      function msg(e) { if (e.data && e.data.type === 'easygames:device') cb(e.data.device); }
      root.addEventListener('message', msg);
      K.post('easygames:getDevice');
      return function () { off(); root.removeEventListener('message', msg); };
    },
    // Browser erlauben Vollbild nur nach einer Eingabe: beim ersten Tipp/Taste/OK starten
    fullscreenOnInput: function (el) {
      el = el || root.document.documentElement;
      function go() {
        root.removeEventListener('pointerdown', go, true); root.removeEventListener('keydown', go, true);
        var d = root.document, r = el.requestFullscreen || el.webkitRequestFullscreen;
        if (!d.fullscreenElement && !d.webkitFullscreenElement && r) { try { var p = r.call(el); if (p && p.catch) p.catch(function () {}); } catch (e) {} }
      }
      root.addEventListener('pointerdown', go, true); root.addEventListener('keydown', go, true);
    },
    // Bildschirm anlassen (Controller-Handy, TV)
    keepAwake: function () {
      var lock = null;
      function get() { try { if (root.navigator.wakeLock && root.document.visibilityState === 'visible') root.navigator.wakeLock.request('screen').then(function (l) { lock = l; }, function () {}); } catch (e) {} }
      root.document.addEventListener('visibilitychange', get); get();
      return function () { root.document.removeEventListener('visibilitychange', get); try { if (lock) lock.release(); } catch (e) {} };
    },
    // Eigene Zurück-Taste (TV/Handy): übernimmt die Taste, die Übersicht schließt das Spiel dann nicht mehr von selbst
    back: function (handler) {
      root.__egBack = true;
      root.addEventListener('keydown', function (e) {
        if (e.key === 'GoBack' || e.key === 'BrowserBack' || e.key === 'XF86Back' || [10009, 461, 4].indexOf(e.keyCode) >= 0) { e.preventDefault(); handler(e); }
      }, true);
    },
    // Nachrichten an die Übersicht (wirkungslos, wenn das Spiel allein läuft)
    post: function (type) { try { if (root.parent && root.parent !== root) root.parent.postMessage({ type: type }, '*'); } catch (e) {} },
    close: function () { K.post('easygames:close'); },
    menu: function () { K.post('easygames:menu'); },
    next: function () { K.post('easygames:next'); },
    prev: function () { K.post('easygames:prev'); }
  };
})(window);
