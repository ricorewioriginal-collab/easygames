/* Wortgitter – Logik (ohne DOM; Browser und Node). Nutzt WF (Wörterbuch, Zufall) aus ../wortfunk/js/logic.js.
 * Buchstaben als Zahlen 1..29 (A–Z, Ä, Ö, Ü) wie in Wortfunk. */
(function (root) {
  'use strict';
  const WF = root.WF || (typeof require === 'function' ? require('../../wortfunk/js/logic.js') : null);
  // Stufen: Größe, Mindestlänge, Zeit (s), Ziel für die Zahl der Wörter im Gitter
  const LEVELS = {
    leicht: { n: 4, min: 3, time: 180, want: 45, label: '4×4', name: 'Leicht' },
    mittel: { n: 5, min: 4, time: 210, want: 110, label: '5×5', name: 'Mittel' },
    schwer: { n: 6, min: 4, time: 240, want: 220, label: '6×6', name: 'Schwer' }
  };
  // Häufigkeit der Buchstaben im Gitter (ohne Q, X, Y – sie machen Gitter fast unspielbar)
  const W = { A: 7, B: 2, C: 2, D: 4, E: 13, F: 2, G: 3, H: 4, I: 7, J: .4, K: 2, L: 4, M: 3, N: 8, O: 3, P: 1, R: 7, S: 7, T: 6, U: 4, V: 1, W: 2, Z: 1.2, Ä: .7, Ö: .5, Ü: .7 };
  const BAG = []; for (const c in W) BAG.push([WF.AL.indexOf(c) + 1, W[c]]);
  const TOTAL = BAG.reduce((s, x) => s + x[1], 0);
  const VOW = new Set([1, 5, 9, 15, 21, 27, 28, 29]);
  function drawLetter(rnd) { let r = rnd() * TOTAL; for (const [c, w] of BAG) { r -= w; if (r <= 0) return c; } return 5; }

  function neighbors(n) {
    const nb = [];
    for (let i = 0; i < n * n; i++) {
      const r = (i / n) | 0, c = i % n, a = [];
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        if (!dr && !dc) continue; const rr = r + dr, cc = c + dc;
        if (rr >= 0 && rr < n && cc >= 0 && cc < n) a.push(rr * n + cc);
      }
      nb.push(a);
    }
    return nb;
  }
  const NB = {}; const nbOf = n => NB[n] || (NB[n] = neighbors(n));

  // alle Wörter im Gitter (Tiefensuche entlang des Wortgraphen)
  function solve(grid, n, min, dict) {
    const E = dict.E, nb = nbOf(n), used = new Uint8Array(n * n), found = new Map(), path = [];
    function dfs(i, node, codes) {
      const e = dict.find(node, grid[i]); if (e < 0) return;
      used[i] = 1; codes.push(grid[i]); path.push(i);
      const v = E[e];
      if ((v & 32) && codes.length >= min) { const w = WF.dec(codes); if (!found.has(w)) found.set(w, path.slice()); }
      const child = v >>> 7;
      if (child) for (const j of nb[i]) if (!used[j]) dfs(j, child, codes);
      used[i] = 0; codes.pop(); path.pop();
    }
    for (let i = 0; i < n * n; i++) dfs(i, dict.root, []);
    return found; // Wort -> ein möglicher Weg
  }

  function make(level, seed, dict) {
    const L = LEVELS[level] || LEVELS.leicht, n = L.n, rnd = WF.rng(seed >>> 0);
    let best = null;
    for (let t = 0; t < 24; t++) {
      const g = [];
      for (let i = 0; i < n * n; i++) g.push(drawLetter(rnd));
      // Vokalanteil 35–50 % erzwingen
      const vow = g.filter(c => VOW.has(c)).length, lo = Math.ceil(n * n * .35), hi = Math.floor(n * n * .5);
      if (vow < lo || vow > hi) continue;
      const words = solve(g, n, L.min, dict);
      if (!best || words.size > best.words.size) best = { grid: g, words };
      if (words.size >= L.want) break;
    }
    if (!best) { const g = []; for (let i = 0; i < n * n; i++) g.push(drawLetter(rnd)); best = { grid: g, words: solve(g, n, L.min, dict) }; }
    return { level, n, min: L.min, time: L.time, seed: seed >>> 0, grid: best.grid, words: best.words };
  }

  // Punkte nach Länge
  function points(len) { return len <= 3 ? 1 : len === 4 ? 2 : len === 5 ? 3 : len === 6 ? 5 : len === 7 ? 8 : 12 + (len - 8) * 4; }

  // Weg prüfen: Felder benachbart, keines doppelt
  function validPath(path, n) {
    const nb = nbOf(n), seen = new Set();
    for (let k = 0; k < path.length; k++) {
      const i = path[k]; if (!(i >= 0 && i < n * n) || seen.has(i)) return false; seen.add(i);
      if (k && !nb[path[k - 1]].includes(i)) return false;
    }
    return path.length > 0;
  }
  // einen Weg zu einem getippten Wort finden (Tastatur); bevorzugt einen, der mit `prefer` beginnt
  function findPath(grid, n, codes, prefer) {
    const nb = nbOf(n), used = new Uint8Array(n * n);
    function go(i, k, p) {
      if (grid[i] !== codes[k]) return null;
      used[i] = 1; p.push(i);
      if (k === codes.length - 1) return p.slice();
      for (const j of nb[i]) if (!used[j]) { const r = go(j, k + 1, p); if (r) { used[i] = 0; p.pop(); return r; } }
      used[i] = 0; p.pop(); return null;
    }
    if (!codes.length) return [];
    if (prefer && prefer.length) {
      // Fortsetzung des aktuellen Wegs probieren
      let ok = prefer.length <= codes.length;
      for (let k = 0; ok && k < prefer.length; k++) ok = grid[prefer[k]] === codes[k];
      if (ok) {
        if (prefer.length === codes.length) return prefer.slice();
        prefer.forEach(i => { used[i] = 1; });
        const last = prefer[prefer.length - 1];
        for (const j of nb[last]) if (!used[j]) {
          const r = go(j, prefer.length, prefer.slice());
          if (r) return r;
        }
        used.fill(0);
      }
    }
    for (let i = 0; i < n * n; i++) { const r = go(i, 0, []); if (r) return r; }
    return null;
  }

  // Wort prüfen: res = 'ok' | 'kurz' | 'doppelt' | 'unbekannt' | 'weg'
  function check(game, path, foundSet, dict) {
    if (!validPath(path, game.n)) return { res: 'weg' };
    const codes = path.map(i => game.grid[i]), w = WF.dec(codes);
    if (codes.length < game.min) return { res: 'kurz', w };
    if (foundSet && foundSet.has(w)) return { res: 'doppelt', w };
    if (!dict.has(codes)) return { res: 'unbekannt', w };
    return { res: 'ok', w, pts: points(codes.length) };
  }

  // Mehrspieler: Wörter, die mehrere gefunden haben, zählen nicht (wie beim Klassiker)
  function scoreRound(lists, unique) {
    const cnt = new Map();
    for (const l of lists) for (const w of new Set(l)) cnt.set(w, (cnt.get(w) || 0) + 1);
    return lists.map(l => {
      let s = 0; const own = [];
      for (const w of new Set(l)) { const solo = cnt.get(w) === 1; if (!unique || solo) s += points(Array.from(w).length); own.push([w, unique ? solo : true]); }
      return { score: s, words: own };
    });
  }
  const daySeed = d => { d = d || new Date(); return (d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()) >>> 0; };

  const WG = { LEVELS, make, solve, points, validPath, findPath, check, scoreRound, daySeed, nbOf };
  if (typeof module !== 'undefined' && module.exports) module.exports = WG;
  root.WG = WG;
})(typeof self !== 'undefined' ? self : this);
