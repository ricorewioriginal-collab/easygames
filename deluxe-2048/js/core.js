/* 2048 Deluxe – Spiellogik ohne DOM (auch in Node testbar).
 * Raster n×n, Kacheln mit IDs (für Animationen), Schieben in 4 Richtungen mit Verschmelzen (jede Kachel nur einmal pro Zug),
 * neue Kachel (90 % 2, 10 % 4) mit Zufallsgenerator (für die Tagesaufgabe festgelegt), Rückgängig, Sieg bei 2048, Spielende. */
(function (root) {
  'use strict';
  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function dayKey(d) { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

  // Neues Spiel; rs = Zustand des Zufallsgenerators (Zahl), damit Speichern/Rückgängig die gleiche Folge behalten
  function newGame(n, seed, target) {
    n = n || 4; const G = { n, cells: Array(n * n).fill(null), score: 0, moves: 0, best: 0, rs: seed == null ? (Math.random() * 4294967296) >>> 0 : seed >>> 0, nextId: 1, won: false, keep: false, over: false, target: target || 2048, hist: [] };
    spawn(G); spawn(G); return G;
  }
  function rand(G) { const r = mulberry(G.rs)(); G.rs = (G.rs + 0x6D2B79F5) >>> 0; return r; }
  function spawn(G) {
    const free = []; G.cells.forEach((c, i) => { if (!c) free.push(i); }); if (!free.length) return null;
    const i = free[Math.floor(rand(G) * free.length)], v = rand(G) < .9 ? 2 : 4, t = { id: G.nextId++, v };
    G.cells[i] = t; return { id: t.id, i, v };
  }
  const snap = G => JSON.stringify({ cells: G.cells, score: G.score, moves: G.moves, rs: G.rs, nextId: G.nextId, won: G.won, keep: G.keep });
  // Ein Zug. Liefert null, wenn sich nichts bewegt; sonst { moves: [{id, from, to}], merges: [{id, into, to, v}], spawn, gain }
  function move(G, dir) {
    if (G.over) return null;
    const n = G.n, [dx, dy] = DIRS[dir], before = snap(G), res = { moves: [], merges: [], gain: 0 }, cells = G.cells.slice(), out = Array(n * n).fill(null);
    for (let line = 0; line < n; line++) {
      // Zellen der Linie in Schieberichtung (vorderste zuerst)
      const idx = []; for (let k = 0; k < n; k++) { const p = dx ? (dx > 0 ? n - 1 - k : k) : line, q = dy ? (dy > 0 ? n - 1 - k : k) : line; idx.push(dx ? line * n + p : q * n + line); }
      let w = 0, lastMerged = false;
      for (const i of idx) {
        const t = cells[i]; if (!t) continue;
        const prev = w > 0 ? out[idx[w - 1]] : null;
        if (prev && prev.v === t.v && !lastMerged) {
          const nv = t.v * 2, nt = { id: G.nextId++, v: nv }; out[idx[w - 1]] = nt; lastMerged = true; res.gain += nv;
          res.merges.push({ a: prev.id, b: t.id, id: nt.id, to: idx[w - 1], v: nv }); res.moves.push({ id: t.id, from: i, to: idx[w - 1] });
        } else { out[idx[w]] = t; if (idx[w] !== i) res.moves.push({ id: t.id, from: i, to: idx[w] }); w++; lastMerged = false; }
      }
    }
    if (!res.moves.length) return null;
    G.hist.push(before); if (G.hist.length > 30) G.hist.shift();
    G.cells = out; G.score += res.gain; G.moves++;
    res.spawn = spawn(G);
    const top = Math.max(...G.cells.map(c => c ? c.v : 0)); G.best = Math.max(G.best, top);
    if (!G.won && top >= G.target) { G.won = true; res.won = true; }
    if (!canMove(G)) { G.over = true; res.over = true; }
    return res;
  }
  function canMove(G) {
    const n = G.n, c = G.cells;
    for (let i = 0; i < n * n; i++) { if (!c[i]) return true; const x = i % n, y = (i / n) | 0; if (x < n - 1 && c[i + 1] && c[i + 1].v === c[i].v) return true; if (y < n - 1 && c[i + n] && c[i + n].v === c[i].v) return true; }
    return false;
  }
  function undo(G) { const s = G.hist.pop(); if (!s) return false; const o = JSON.parse(s); Object.assign(G, o); G.over = false; return true; }
  // Hammer: eine Kachel entfernen (zählt als Zug, kann rückgängig gemacht werden; die letzte Kachel bleibt)
  function smash(G, i) {
    const t = G.cells[i]; if (!t || G.cells.filter(Boolean).length < 2) return null;
    G.hist.push(snap(G)); if (G.hist.length > 30) G.hist.shift();
    G.cells[i] = null; G.moves++; G.over = false; return { id: t.id, i, v: t.v };
  }
  /* Antippen-Modus: zwei gleiche Zahlen, die in einer Reihe oder Spalte freie Sicht haben (nur leere Felder dazwischen),
   * verschmelzen auf dem zweiten Feld. Danach kommt eine neue Kachel; gibt es keine Paare mehr, kommen so lange neue dazu,
   * bis wieder eins da ist oder das Brett voll ist (dann ist Schluss). */
  function linked(G, a, b) {
    const n = G.n, c = G.cells; if (a === b || !c[a] || !c[b] || c[a].v !== c[b].v) return false;
    const ax = a % n, ay = (a / n) | 0, bx = b % n, by = (b / n) | 0;
    if (ax !== bx && ay !== by) return false;
    const st = ax === bx ? n : 1, lo = Math.min(a, b), hi = Math.max(a, b);
    for (let k = lo + st; k < hi; k += st) if (c[k]) return false;
    return true;
  }
  function partners(G, a) { const r = []; for (let b = 0; b < G.cells.length; b++) if (linked(G, a, b)) r.push(b); return r; }
  function hasPair(G) { for (let a = 0; a < G.cells.length; a++) if (G.cells[a] && partners(G, a).length) return true; return false; }
  function refill(G) { const out = []; while (!hasPair(G)) { const s = spawn(G); if (!s) break; out.push(s); } G.over = !hasPair(G); return out; }
  function tapMerge(G, a, b) {
    if (G.over || !linked(G, a, b)) return null;
    G.hist.push(snap(G)); if (G.hist.length > 30) G.hist.shift();
    const t = G.cells[a], o = G.cells[b], nv = t.v * 2, nt = { id: G.nextId++, v: nv };
    G.cells[a] = null; G.cells[b] = nt; G.score += nv; G.moves++;
    const res = { moves: [{ id: t.id, from: a, to: b }], merges: [{ a: o.id, b: t.id, id: nt.id, to: b, v: nv }], gain: nv };
    res.spawn = spawn(G); res.extra = refill(G);
    G.best = Math.max(G.best, nv);
    if (!G.won && nv >= G.target) { G.won = true; res.won = true; }
    if (G.over) res.over = true;
    return res;
  }
  const maxTile = G => Math.max(0, ...G.cells.map(c => c ? c.v : 0));
  // Speichern/Laden (ohne Verlauf zu groß werden zu lassen)
  function save(G) { return JSON.stringify({ n: G.n, cells: G.cells, score: G.score, moves: G.moves, best: G.best, rs: G.rs, nextId: G.nextId, won: G.won, keep: G.keep, over: G.over, target: G.target, tap: !!G.tap, hist: G.hist.slice(-10) }); }
  function load(s) { try { const o = JSON.parse(s); if (!o || !Array.isArray(o.cells) || o.cells.length !== o.n * o.n) return null; return Object.assign({ hist: [] }, o); } catch (e) { return null; } }
  function daily(d) { const k = dayKey(d); return { key: k, seed: hash('deluxe-2048:' + k) }; }

  const D = { DIRS, mulberry, hash, dayKey, newGame, spawn, move, canMove, undo, smash, linked, partners, hasPair, refill, tapMerge, maxTile, save, load, daily };
  if (typeof module !== 'undefined' && module.exports) module.exports = D;
  root.D2048 = D;
})(typeof window !== 'undefined' ? window : globalThis);
