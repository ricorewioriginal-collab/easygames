/* Funkmaler – Regeln ohne DOM (Browser und Node): Raten prüfen, Hinweise, Punkte, Wortwahl, Reihenfolge */
(function (root) {
  'use strict';
  const W = (root.FM_WORDS || (typeof require === 'function' ? require('./words.js') : null)).WORDS;
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const norm = s => String(s || '').toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9]/g, '');
  const show = e => String(e).split('|')[0].trim();
  const alts = e => String(e).split('|').map(x => x.trim()).filter(Boolean);
  function lev(a, b) {
    if (a === b) return 0; if (!a.length) return b.length; if (!b.length) return a.length;
    let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) { const cur = [i]; for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = cur; }
    return prev[b.length];
  }
  // 'ok' | 'knapp' | 'nein'
  function check(guess, entry) {
    const g = norm(guess); if (!g) return 'nein';
    const parts = String(guess).toLowerCase().split(/[\s,.;!?]+/).map(norm).filter(Boolean);
    let close = false;
    for (const a of alts(entry)) {
      const w = norm(a);
      if (g === w || parts.includes(w)) return 'ok';
      const tol = w.length >= 8 ? 2 : w.length >= 5 ? 1 : 0;
      if (tol && (lev(g, w) <= tol || parts.some(p => lev(p, w) <= tol))) close = true;
      if (w.length >= 5 && (g.startsWith(w) || w.startsWith(g) && g.length >= w.length - 2)) close = true;
    }
    return close ? 'knapp' : 'nein';
  }
  // Hinweis: Buchstaben als _ , aufgedeckte Stellen sichtbar, Leer- und Bindestriche bleiben
  function hint(entry, shown) {
    const w = show(entry), set = new Set(shown || []);
    return Array.from(w).map((c, i) => /[\s-]/.test(c) ? (c === ' ' ? '  ' : '-') : set.has(i) ? c.toUpperCase() : '_').join(' ').replace(/ {3,}/g, '   ');
  }
  function hintPlan(entry, seed) { // Reihenfolge der aufzudeckenden Stellen
    const w = show(entry), idx = Array.from(w).map((c, i) => /[\s-]/.test(c) ? -1 : i).filter(i => i >= 0), r = rng(seed);
    for (let i = idx.length - 1; i > 0; i--) { const j = (r() * (i + 1)) | 0; [idx[i], idx[j]] = [idx[j], idx[i]]; }
    const n = idx.length >= 4 ? Math.min(3, Math.floor(idx.length / 3)) : 0;
    return idx.slice(0, n);
  }
  // Punkte: schneller = mehr; Reihenfolge-Bonus; Maler bekommt je richtigem Rater etwas
  function guessPoints(left, total, order) { return Math.round(40 + 60 * Math.max(0, Math.min(1, left / total))) + ([20, 10, 5][order] || 0); }
  function drawerPoints(correct, guessers) { return correct * 15 + (guessers > 0 && correct === guessers ? 10 : 0); }
  function pool(level) { return level === 'gemischt' ? W.leicht.concat(W.mittel, W.schwer) : (W[level] || W.leicht); }
  function pickWords(level, n, used, rnd) {
    const seen = new Set((used || []).map(norm)), all = Array.from(new Set(pool(level))).filter(e => !seen.has(norm(show(e))));
    const src = all.length >= n ? all : Array.from(new Set(pool(level)));
    const out = [];
    while (out.length < n && out.length < src.length) { const e = src[(rnd() * src.length) | 0]; if (!out.includes(e)) out.push(e); }
    return out;
  }
  function order(ids, rounds) { const out = []; for (let r = 0; r < rounds; r++) out.push(...ids); return out; }
  const clean = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, n);

  const FM = { rng, norm, show, alts, lev, check, hint, hintPlan, guessPoints, drawerPoints, pickWords, pool, order, clean, WORDS: W };
  if (typeof module !== 'undefined' && module.exports) module.exports = FM;
  root.FM = FM;
})(typeof self !== 'undefined' ? self : this);
