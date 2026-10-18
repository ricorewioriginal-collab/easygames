/* Spinwelten 3D – Zufall.
 * Zwei Quellen mit gleicher Schnittstelle (next() liefert [0,1)):
 *  - SW.rng.secure(): echte Zufallszahlen aus crypto.getRandomValues (normales Spiel, Gastgeber im Online-Raum)
 *  - SW.rng.seeded(seed): reproduzierbar (sfc32 + xmur3) für Tests, Bots und Simulationen
 * Alle Ergebnisse werden VOR der Animation festgelegt; die Animation zeigt nur, was schon feststeht. */
(function (SW) {
  'use strict';
  function xmur3(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
    return function () { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return (h ^= h >>> 16) >>> 0; };
  }
  function sfc32(a, b, c, d) {
    return function () {
      a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
      let t = (a + b) | 0; a = b ^ (b >>> 9); b = (c + (c << 3)) | 0; c = (c << 21) | (c >>> 11); d = (d + 1) | 0; t = (t + d) | 0; c = (c + t) | 0;
      return (t >>> 0) / 4294967296;
    };
  }
  function wrap(next) {
    const r = { next };
    r.int = n => Math.floor(next() * n);                       // 0 … n-1
    r.range = (a, b) => a + Math.floor(next() * (b - a + 1)); // a … b
    r.chance = p => next() < p;
    r.pick = arr => arr[Math.floor(next() * arr.length)];
    r.weighted = (items, w) => {                               // w(item) = Gewicht
      let sum = 0; for (const it of items) sum += w(it);
      let x = next() * sum;
      for (const it of items) { x -= w(it); if (x < 0) return it; }
      return items[items.length - 1];
    };
    r.shuffle = arr => { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; };
    return r;
  }
  function seeded(seed) {
    const s = xmur3(String(seed));
    return wrap(sfc32(s(), s(), s(), s()));
  }
  function secure() {
    const c = (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.getRandomValues) ? globalThis.crypto : null;
    if (!c) return seeded(Date.now() + ':' + Math.random());
    const buf = new Uint32Array(64); let i = 64;
    return wrap(function () { if (i >= 64) { c.getRandomValues(buf); i = 0; } return buf[i++] / 4294967296; });
  }
  // Kurzer Zufalls-Bezeichner (Aktions-IDs, Raum-Sitzungen)
  function uid(n) {
    const A = 'abcdefghijkmnopqrstuvwxyz23456789', r = secure(); let s = '';
    for (let i = 0; i < (n || 12); i++) s += A[r.int(A.length)];
    return s;
  }
  SW.rng = { seeded, secure, uid, hash: s => xmur3(String(s))() };
})(globalThis.SW = globalThis.SW || {});
