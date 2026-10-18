/* AnMaCha UNDERCOVER 3D – deterministischer Zufall und kleine Helfer (ohne DOM, auch in Node nutzbar).
   AMU.RNG(seed) → { seed, next(), int(n), range(a,b), chance(p), pick(arr), shuffle(arr), fork(tag) } */
(function (root) {
  'use strict';
  const AMU = root.AMU = root.AMU || {};

  function hash(str) {   // FNV-1a, 32 bit
    let h = 2166136261 >>> 0; str = String(str);
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h >>> 0;
  }
  function RNG(seed) {
    let s = (typeof seed === 'number' ? seed : hash(seed)) >>> 0;
    if (!s) s = 0x9e3779b9;
    const r = {
      get seed() { return s; },
      next() {   // mulberry32
        s = (s + 0x6D2B79F5) >>> 0; let t = s;
        t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      },
      int(n) { return Math.floor(r.next() * n); },
      range(a, b) { return a + r.next() * (b - a); },
      chance(p) { return r.next() < p; },
      pick(a) { return a.length ? a[Math.floor(r.next() * a.length)] : undefined; },
      shuffle(a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(r.next() * (i + 1)); const t = b[i]; b[i] = b[j]; b[j] = t; } return b; },
      weighted(items, w) { let sum = 0; for (const it of items) sum += Math.max(0, w(it)); let x = r.next() * sum; for (const it of items) { x -= Math.max(0, w(it)); if (x <= 0) return it; } return items[items.length - 1]; },
      fork(tag) { return RNG(hash(s + ':' + tag)); }
    };
    return r;
  }

  const U = {
    clamp: (v, a, b) => v < a ? a : v > b ? b : v,
    lerp: (a, b, t) => a + (b - a) * t,
    dist: (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by),
    esc: s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),
    isObj: x => !!x && typeof x === 'object' && !Array.isArray(x),
    isStr: (x, max) => typeof x === 'string' && x.length <= (max || 200),
    isInt: x => typeof x === 'number' && Number.isInteger(x),
    isNum: x => typeof x === 'number' && isFinite(x),
    cleanName(s, max) {
      s = String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, max || 16).trim();
      return s;
    },
    /** Text für Vergleiche: klein, ohne Akzente, ä→ae usw. */
    norm(s) {
      return String(s || '').toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
    },
    fmtTime(ms) { ms = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(ms / 60) + ':' + String(ms % 60).padStart(2, '0'); },
    hash
  };
  AMU.RNG = RNG; AMU.U = U;
  if (typeof module !== 'undefined' && module.exports) module.exports = AMU;
})(typeof window !== 'undefined' ? window : globalThis);
