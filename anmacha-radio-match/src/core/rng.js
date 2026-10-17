/* Royal Radio Match 3D – seedbarer Zufallsgenerator (mulberry32). Zustand ist eine Zahl, damit Spielstände reproduzierbar sind. */
(function (root) {
  'use strict';
  function Rng(seed) { this.s = (seed >>> 0) || 1; }
  Rng.prototype.next = function () {
    var t = (this.s = (this.s + 0x6D2B79F5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  Rng.prototype.int = function (n) { return Math.floor(this.next() * n); };
  Rng.prototype.pick = function (a) { return a[this.int(a.length)]; };
  Rng.prototype.shuffle = function (a) {
    for (var i = a.length - 1; i > 0; i--) { var j = this.int(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  };
  var RRM = root.RRM || (root.RRM = {});
  RRM.Rng = Rng;
  if (typeof module !== 'undefined' && module.exports) module.exports = Rng;
})(typeof window !== 'undefined' ? window : globalThis);
