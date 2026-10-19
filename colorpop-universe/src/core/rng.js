/* ColorPop Universe – deterministischer Zufall (gleicher Startwert = gleiches Brett auf jedem Gerät). */
(function (root) {
  'use strict';
  var CPU = root.CPU || (root.CPU = {});
  // FNV-1a (32 Bit) für Texte wie "daily-2026-10-18"
  CPU.hash = function (s) {
    s = String(s); var h = 0x811c9dc5;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
    return h >>> 0;
  };
  // mulberry32: schnell, 32 Bit Zustand, auf allen JS-Engines identisch
  CPU.rng = function (seed) {
    var a = (seed >>> 0) || 0x9e3779b9;
    var f = function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    f.int = function (n) { return Math.floor(f() * n); };
    f.pick = function (arr) { return arr[Math.floor(f() * arr.length)]; };
    f.state = function () { return a >>> 0; };
    return f;
  };
  CPU.utcDay = function (d) { d = d || new Date(); return d.toISOString().slice(0, 10); };
  // ISO-Kalenderwoche (UTC) als "2026-W42"
  CPU.isoWeek = function (d) {
    d = d ? new Date(d.getTime()) : new Date();
    var t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    var day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day);
    var y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
    var wk = Math.ceil(((t - y0) / 864e5 + 1) / 7);
    return t.getUTCFullYear() + '-W' + (wk < 10 ? '0' : '') + wk;
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = CPU;
})(typeof window !== 'undefined' ? window : globalThis);
