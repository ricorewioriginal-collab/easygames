/* easygames – Spielanleitungen (Handbuch, Ratgeber, Lösungsbuch) laden und anzeigen.
 * Daten: guides/<spiel-id>.json (Format: guides/README.md). Genutzt von index.html, anleitung.html und easygames.js.
 *   EasyGamesBook.load('zotik').then(book => …)            // null, wenn es (noch) keine gibt
 *   EasyGamesBook.render(el, book, 'loesung', { h: 'h4' })   // Teil anzeigen: handbuch | ratgeber | loesung | faq
 *   EasyGamesBook.PARTS                                      // [[schlüssel, Titel, Symbol], …]
 * Alles wird als Text eingefügt (kein HTML aus den Daten). */
(function () {
  'use strict';
  var me = document.currentScript, base = me && me.src ? me.src.replace(/[^/]*(\?.*)?$/, '') : '', cache = {};
  var PARTS = [['handbuch', 'Spielanleitung', '📘'], ['ratgeber', 'Ratgeber', '💡'], ['loesung', 'Lösungsbuch', '🗝️'], ['faq', 'Häufige Fragen', '❓']];
  function load(id, from) {
    if (!/^[\w-]+$/.test(id || '')) return Promise.resolve(null);
    var u = (from || base) + 'guides/' + id + '.json';
    if (!cache[u]) cache[u] = fetch(u).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }).then(function (b) { if (!b) delete cache[u]; return b; });
    return cache[u];
  }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function section(s, h) {
    var box = el('section', 'egb-sec'); box.appendChild(el(h, 'egb-h', s.t));
    (s.p || []).forEach(function (t) { box.appendChild(el('p', '', t)); });
    if (s.list && s.list.length) { var ul = el('ul'); s.list.forEach(function (t) { ul.appendChild(el('li', '', t)); }); box.appendChild(ul); }
    if (s.steps && s.steps.length) { var ol = el('ol'); s.steps.forEach(function (t) { ol.appendChild(el('li', '', t)); }); box.appendChild(ol); }
    return box;
  }
  // Teil eines Buchs in el anhängen; Rückgabe: Anzahl Abschnitte
  function render(target, book, part, o) {
    o = o || {}; var h = o.h || 'h4', n = 0; if (!book) return 0;
    if (part === 'faq') { (book.faq || []).forEach(function (q) { var d = el('details', 'egb-faq'); d.appendChild(el('summary', '', q.q)); d.appendChild(el('p', '', q.a)); target.appendChild(d); n++; }); return n; }
    (book[part] || []).forEach(function (s) { if (s && s.t) { target.appendChild(section(s, h)); n++; } });
    return n;
  }
  window.EasyGamesBook = { load: load, render: render, PARTS: PARTS, base: base };
})();
