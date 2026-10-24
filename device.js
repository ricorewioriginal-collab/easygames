/*!
 * device.js – Geräteerkennung für easygames (keine Abhängigkeiten)
 *
 *   <script src="https://DEINE-SEITE/device.js"></script>
 *   const d = EasyGamesDevice.get();   // { type: 'tv'|'phone'|'tablet'|'desktop', role, os, input, … }
 *   EasyGamesDevice.is('tv');
 *   const off = EasyGamesDevice.on(d => …);   // bei Drehen, Größenänderung, Gamepad
 *   EasyGamesDevice.set('tv');                // manuell überschreiben (null = automatisch)
 *
 * TV-Link für Mehrspieler: EasyGamesDevice.tvUrl('spiel-ordner/', tvParam) – nutzt eine öffentliche Adresse, auch wenn die Seite
 * in einer App/auf localhost läuft (mit window.EASYGAMES_PUBLIC_BASE = 'https://deine-seite/' anpassbar).
 *
 * Zum Testen/Erzwingen: ?device=tv|phone|tablet|desktop an die URL hängen.
 * Setzt außerdem Klassen am <html>: eg-tv / eg-phone / eg-tablet / eg-desktop, eg-portrait / eg-landscape,
 * eg-gamepad, eg-app und das Attribut data-eg-device.
 */
(function (root) {
  'use strict';
  var nav = root.navigator || {}, UA = nav.userAgent || '', doc = root.document;
  var TV_RE = /SmartTV|Smart-TV|Tizen|Web0S|WebOS|NetCast|HbbTV|AFTS|AFTM|AFTB|AFTT|AFTN|Android TV|GoogleTV|AppleTV|BRAVIA|CrKey|Viera|Roku|VIDAA|PhilipsTV|Hisense|Fire TV|FireTV/i;
  var TYPES = ['tv', 'phone', 'tablet', 'desktop'];
  var forced = null, listeners = [], last = '', cur = null;

  function mq(q) { try { return !!root.matchMedia && root.matchMedia(q).matches; } catch (e) { return false; } }
  function param(n) { try { return new URLSearchParams(root.location.search).get(n); } catch (e) { return null; } }

  function override() {
    var d = param('device'); if (d && TYPES.indexOf(d) >= 0) return d;
    var t = param('tv'); if (t === '1') return 'tv';          // Kurzform wie bei der Übersicht
    return forced;
  }
  function osOf() {
    if (/Tizen/i.test(UA)) return 'tizen';
    if (/Web0S|WebOS|NetCast/i.test(UA)) return 'webos';
    if (/Android/i.test(UA)) return TV_RE.test(UA) ? 'androidtv' : 'android';
    if (/iPhone|iPod/i.test(UA)) return 'ios';
    if (/iPad/i.test(UA) || (/Macintosh/i.test(UA) && (nav.maxTouchPoints || 0) > 1)) return 'ipados';
    if (/CrOS/i.test(UA)) return 'chromeos';
    if (/Windows/i.test(UA)) return 'windows';
    if (/Mac OS X|Macintosh/i.test(UA)) return 'macos';
    if (/Linux/i.test(UA)) return 'linux';
    return 'other';
  }
  function pads() { try { var a = nav.getGamepads ? nav.getGamepads() : []; var n = 0; for (var i = 0; i < a.length; i++) if (a[i]) n++; return n; } catch (e) { return 0; } }

  function detect() {
    var touch = (nav.maxTouchPoints || 0) > 0 || 'ontouchstart' in root;
    var coarse = mq('(pointer:coarse)'), fine = mq('(pointer:fine)'), hover = mq('(hover:hover)');
    var sw = (root.screen && root.screen.width) || root.innerWidth || 0, sh = (root.screen && root.screen.height) || root.innerHeight || 0;
    var iw = root.innerWidth || sw, ih = root.innerHeight || sh;
    var shortSide = Math.min(sw || iw, sh || ih), os = osOf();
    var type = override();
    var how = type ? 'override' : 'auto', noTv = param('tv') === '0';   // ?tv=0 schaltet die TV-Erkennung ab
    if (!type) {
      if (!noTv && TV_RE.test(UA)) type = 'tv';
      else if (touch && (coarse || !fine)) type = shortSide && shortSide < 600 ? 'phone' : 'tablet';
      else if (!noTv && !touch && !hover && !fine && Math.max(sw, iw) >= 1200) type = 'tv';   // Browser ohne Maus/Touch am großen Bildschirm
      else type = 'desktop';
    }
    var wv = /; wv\)|\bwv\b/i.test(UA) || (/(iPhone|iPod|iPad)/i.test(UA) && !/Safari/i.test(UA));
    var standalone = !!nav.standalone || mq('(display-mode: standalone)');
    var gp = pads();
    var input = [];
    if (touch) input.push('touch');
    if (type === 'tv') input.push('remote'); else if (fine || hover) input.push('mouse');
    if (type === 'desktop') input.push('keyboard');
    if (gp) input.push('gamepad');
    var join = (param('join') || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    // Vorschlag für Mehrspieler: großer Bildschirm = Gastgeber, Handy = Controller, sonst beides
    var role = type === 'tv' ? 'host' : type === 'phone' ? 'controller' : 'both';
    return {
      type: type, how: how, role: role, os: os, input: input,
      touch: touch, coarse: coarse, hover: hover, gamepad: gp > 0,
      width: iw, height: ih, screen: { width: sw, height: sh }, dpr: root.devicePixelRatio || 1,
      orientation: iw >= ih ? 'landscape' : 'portrait',
      app: wv || standalone, webview: wv, standalone: standalone,
      fullscreen: !!(doc && (doc.fullscreenEnabled || doc.webkitFullscreenEnabled)),
      join: join, joined: !!join
    };
  }

  function apply(d) {
    var el = doc && doc.documentElement; if (!el) return;
    var keep = []; for (var i = 0; i < el.classList.length; i++) if (el.classList[i].indexOf('eg-') !== 0) keep.push(el.classList[i]);
    keep.push('eg-' + d.type, 'eg-' + d.orientation); if (d.gamepad) keep.push('eg-gamepad'); if (d.app) keep.push('eg-app');
    el.className = keep.join(' '); el.setAttribute('data-eg-device', d.type);
  }
  function refresh() {
    var d = detect(), key = JSON.stringify(d);
    if (key === last) return;
    last = key; cur = d; apply(d);
    for (var i = 0; i < listeners.length; i++) { try { listeners[i](d); } catch (e) { if (root.console) console.error(e); } }
  }

  // Öffentliche Adresse für TV-Links: Ein TV (oder ein anderes Handy) kann keine Adressen einer App oder von localhost öffnen.
  var PUBLIC_DEFAULT = 'https://ricorewioriginal-collab.github.io/easygames/';
  // Basisadresse der Spiele für Links, die auf anderen Geräten geöffnet werden (Mehrspieler-Regel, siehe CLAUDE.md):
  // 1) window.EASYGAMES_PUBLIC_BASE (oder EasyGamesConfig.publicBase), 2) sonst immer die easygames-Homepage –
  // nie die lokale App-Adresse oder ein Spiegel, damit Einladungen auf jeder Plattform gleich funktionieren.
  function publicBase() {
    var cfg = root.EASYGAMES_PUBLIC_BASE || (root.EasyGamesConfig && root.EasyGamesConfig.publicBase);
    return cfg ? (/\/$/.test(cfg) ? cfg : cfg + '/') : PUBLIC_DEFAULT;
  }
  // Der richtige Link für TV-Gaming: direkte Spielseite (+ Parameter wie ?tv, falls das Spiel einen kennt)
  function tvUrl(path, tvParam) {
    var u = new URL(path, publicBase()).href;
    return tvParam ? u + '?' + (typeof tvParam === 'string' ? tvParam.replace(/^\?/, '') : 'tv') : u;
  }

  var W = root;
  // Eingebettet mit ?eg_share=<Adresse> (z. B. https://www.ricorewi-radio.de/#games/<id>): Teilen-Links für DIESES Spiel zeigen auf die
  // einbindende Seite. Gilt nur im iframe und nur, wenn die Adresse zur einbindenden Seite passt; Einladungs- und TV-Links (mit ?… oder #…)
  // bleiben auf der easygames-Homepage. Gleicher Baustein in device.js und cloud/fire-peer.js.
  if (!W.EasyGamesEmbedShare) W.EasyGamesEmbedShare = (function () {
    var dir = function (p) { var m = /\/([^\/]+)\/(?:index\.html)?$/.exec(p || ''); return m ? m[1] : ''; };
    var own = dir(W.location && W.location.pathname), K = 'eg-embed-share:' + own, v = null, m = null;
    try {
      m = /[?&]eg_share=([^&#]*)/.exec(W.location.search);
      v = m ? decodeURIComponent(m[1]) : W.sessionStorage.getItem(K);
      if (v) {
        var u = new URL(v), ref = W.document.referrer ? new URL(W.document.referrer).origin : '';
        v = W.parent !== W && /^https?:$/.test(u.protocol) && (!ref || ref === u.origin || ref === W.location.origin || (u.origin === W.location.origin && /\/share\/[\w-]+\.html$/.test(u.pathname))) ? u.href : null;
      }
    } catch (e) { v = null; }
    if (v && m) try { W.sessionStorage.setItem(K, v); } catch (e) { }
    function link(u) {
      if (!v || !own) return u;
      try { var x = new URL(u, W.location.href), q = new URLSearchParams(x.search); q.delete('eg_build'); q.delete('eg_share'); return dir(x.pathname) === own && !q.toString() && !x.hash ? v : u; } catch (e) { return u; }
    }
    return { url: function () { return v; }, link: link };
  })();
  // Teilen-Link für ein Spiel: öffentliche Adresse, eingebettet die Adresse der einbindenden Seite (siehe oben)
  function gameLink(path) { var u = new URL(path, publicBase()).href; return W.EasyGamesEmbedShare ? W.EasyGamesEmbedShare.link(u) : u; }

  var API = root.EasyGamesDevice = {
    version: 1,
    get: function () { if (!cur) refresh(); return cur; },
    is: function (t) { return API.get().type === t; },
    on: function (cb) { listeners.push(cb); return function () { var i = listeners.indexOf(cb); if (i >= 0) listeners.splice(i, 1); }; },
    set: function (t) { forced = TYPES.indexOf(t) >= 0 ? t : null; last = ''; refresh(); },
    joinCode: function () { return API.get().join; },
    publicBase: publicBase,
    tvUrl: tvUrl,
    gameLink: gameLink
  };
  refresh();
  if (root.addEventListener) {
    root.addEventListener('resize', refresh); root.addEventListener('orientationchange', refresh);
    root.addEventListener('gamepadconnected', refresh); root.addEventListener('gamepaddisconnected', refresh);
  }
})(typeof window !== 'undefined' ? window : this);
