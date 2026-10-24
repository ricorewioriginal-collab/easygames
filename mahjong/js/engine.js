/* Mahjong 3D – Regeln (rein, ohne DOM, auch in Node testbar).
 * Koordinaten in halben Steinbreiten/-höhen: Ein Stein belegt [x, x+2) × [y, y+2) auf Ebene z.
 * Frei ist ein Stein, wenn kein Stein darüber liegt und links ODER rechts kein Nachbar auf derselben Ebene ist.
 * Bilder: 0–8 Kreise, 9–17 Bambus, 18–26 Zeichen, 27–30 Winde (Ost, Süd, West, Nord), 31–33 Drachen (rot, grün, weiß),
 * 34–37 Blumen, 38–41 Jahreszeiten. Alle Blumen passen zueinander, alle Jahreszeiten ebenso. */
(function (root) {
  'use strict';

  // ---------- Zufall (reproduzierbar) ----------
  function rng(seed) {
    let a = (seed >>> 0) || 0x9e3779b9;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function shuffle(arr, rand) {
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); const t = arr[i]; arr[i] = arr[j]; arr[j] = t; }
    return arr;
  }

  // ---------- Bilder ----------
  const FACE_COUNT = 42;
  function group(f) { return f < 34 ? f : f < 38 ? 34 : 38; }
  function matches(a, b) { return a >= 0 && b >= 0 && group(a) === group(b); }
  // 72 Paare eines vollständigen Satzes (144 Steine)
  function fullPairs() {
    const p = [];
    for (let f = 0; f < 34; f++) { p.push([f, f]); p.push([f, f]); }
    p.push([34, 35], [36, 37], [38, 39], [40, 41]);
    return p;
  }
  // n Paare: bei kleinen Layouts eine zufällige, aber ausgewogene Auswahl (möglichst viele verschiedene Bilder)
  function pickPairs(n, rand) {
    const all = fullPairs();
    if (n >= all.length) { const out = []; while (out.length < n) out.push.apply(out, shuffle(fullPairs(), rand)); return out.slice(0, n); }
    // erst je ein Paar pro Bildgruppe, dann die zweiten Paare
    const first = [], second = [], seen = {};
    shuffle(all, rand).forEach(pr => { const g = group(pr[0]); if (seen[g]) second.push(pr); else { seen[g] = 1; first.push(pr); } });
    return first.concat(second).slice(0, n);
  }

  // ---------- Layout-Graph ----------
  function buildGraph(pos) {
    const n = pos.length, above = [], left = [], right = [];
    for (let i = 0; i < n; i++) { above.push([]); left.push([]); right.push([]); }
    for (let i = 0; i < n; i++) {
      const a = pos[i];
      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        const b = pos[j];
        const ox = Math.abs(a.x - b.x) < 2, oy = Math.abs(a.y - b.y) < 2;
        if (b.z > a.z && ox && oy) above[i].push(j);
        else if (b.z === a.z && oy) {
          if (b.x === a.x - 2) left[i].push(j);
          else if (b.x === a.x + 2) right[i].push(j);
        }
      }
    }
    return { n, pos, above, left, right };
  }
  function overlaps(pos) {   // Steine, die sich auf derselben Ebene überschneiden (Layout-Fehler)
    const bad = [];
    for (let i = 0; i < pos.length; i++) for (let j = i + 1; j < pos.length; j++) {
      const a = pos[i], b = pos[j];
      if (a.z === b.z && Math.abs(a.x - b.x) < 2 && Math.abs(a.y - b.y) < 2) bad.push([i, j]);
    }
    return bad;
  }
  function isFree(g, alive, i) {
    if (!alive[i]) return false;
    const ab = g.above[i];
    for (let k = 0; k < ab.length; k++) if (alive[ab[k]]) return false;
    let l = false, r = false;
    const L = g.left[i], R = g.right[i];
    for (let k = 0; k < L.length; k++) if (alive[L[k]]) { l = true; break; }
    if (!l) return true;
    for (let k = 0; k < R.length; k++) if (alive[R[k]]) { r = true; break; }
    return !r;
  }
  function freeList(g, alive) { const out = []; for (let i = 0; i < g.n; i++) if (isFree(g, alive, i)) out.push(i); return out; }

  // Lösbar verteilen: rückwärts abbauen – je zwei gerade freie Plätze bekommen ein passendes Paar. Die Abbau-Reihenfolge ist eine Lösung.
  function dealSolvable(g, aliveIdx, pairs, rand, tries) {
    tries = tries || 300;
    for (let t = 0; t < tries; t++) {
      const alive = new Uint8Array(g.n); aliveIdx.forEach(i => { alive[i] = 1; });
      const faces = new Int8Array(g.n).fill(-1), order = shuffle(pairs.slice(), rand), sol = [];
      let left = aliveIdx.length, k = 0, ok = true;
      while (left > 0) {
        const free = freeList(g, alive);
        if (free.length < 2) { ok = false; break; }
        // höher liegende Steine etwas bevorzugen: verhindert, dass am Ende zwei Steine übereinander übrig bleiben
        const a = pickWeighted(free, g, rand);
        const rest = free.filter(i => i !== a);
        const b = pickWeighted(rest, g, rand);
        faces[a] = order[k][0]; faces[b] = order[k][1]; k++;
        alive[a] = 0; alive[b] = 0; left -= 2; sol.push([a, b]);
      }
      if (ok) return { faces, solution: sol };
    }
    return null;
  }
  function pickWeighted(list, g, rand) {
    let sum = 0; const w = list.map(i => { const v = 1 + g.pos[i].z * 1.5; sum += v; return v; });
    let r = rand() * sum;
    for (let k = 0; k < list.length; k++) { r -= w[k]; if (r <= 0) return list[k]; }
    return list[list.length - 1];
  }
  // Zufällig verteilen (kann unlösbar sein)
  function dealRandom(g, pairs, rand) {
    const flat = []; pairs.forEach(p => { flat.push(p[0], p[1]); });
    shuffle(flat, rand);
    const faces = new Int8Array(g.n); for (let i = 0; i < g.n; i++) faces[i] = flat[i];
    return { faces, solution: null };
  }

  // Alle möglichen Paare unter den freien Steinen
  function movesOf(g, alive, faces) {
    const free = freeList(g, alive), out = [];
    for (let a = 0; a < free.length; a++) for (let b = a + 1; b < free.length; b++) {
      if (matches(faces[free[a]], faces[free[b]])) out.push([free[a], free[b]]);
    }
    return out;
  }

  // Kurzer Lösbarkeitstest (Tiefensuche mit Gedächtnis, begrenzt) – für „Unlösbar?“-Hinweise im Spiel
  function solvable(g, alive0, faces, budget) {
    budget = budget || 20000;
    const alive = Uint8Array.from(alive0), seen = new Set();
    let steps = 0;
    function key() { let s = ''; for (let i = 0; i < alive.length; i++) s += alive[i] ? '1' : '0'; return s; }
    function rec(left) {
      if (left === 0) return true;
      if (++steps > budget) return null;
      const k = key(); if (seen.has(k)) return false; seen.add(k);
      const mv = movesOf(g, alive, faces);
      // Gruppen mit genau 2 freien Steinen eines Bildes zuerst (sicherer Zug)
      for (let m = 0; m < mv.length; m++) {
        const [a, b] = mv[m]; alive[a] = 0; alive[b] = 0;
        const r = rec(left - 2); alive[a] = 1; alive[b] = 1;
        if (r === true) return true; if (r === null) return null;
      }
      return false;
    }
    let left = 0; for (let i = 0; i < alive.length; i++) left += alive[i];
    return rec(left);
  }

  // ---------- Partie ----------
  const SCORE = { base: 10, comboStep: 10, comboMax: 5, comboWindow: 4500, hint: 20, shuffle: 50, perfect: 250 };

  function Game(opts) {
    // opts: { layout: {id, tiles:[{x,y,z}]}, seed, solvable (Standard true), state (zum Fortsetzen) }
    this.layout = opts.layout;
    this.g = buildGraph(opts.layout.tiles);
    this.seed = opts.seed >>> 0;
    this.rand = rng(this.seed ^ 0xA5A5A5);
    const n = this.g.n;
    this.alive = new Uint8Array(n).fill(1);
    this.history = [];     // [a, b, scoreVorher, comboVorher, letzteZeitVorher, Punkte des Paars]
    this.selected = -1;
    this.score = 0; this.combo = 0; this.bestCombo = 0; this.lastMatch = -1e9;
    this.hints = 0; this.shuffles = 0; this.undos = 0; this.time = 0; this.matchesMade = 0;
    if (opts.state) { this._restore(opts.state); return; }
    const rand = rng(this.seed);
    const pairs = pickPairs(n / 2, rand);
    let d = opts.solvable === false ? null : dealSolvable(this.g, range(n), pairs, rand);
    if (!d) d = dealRandom(this.g, pairs, rand);
    this.faces = d.faces;
    this.solution = d.solution;
  }
  function range(n) { const a = []; for (let i = 0; i < n; i++) a.push(i); return a; }
  Game.prototype = {
    remaining() { let c = 0; for (let i = 0; i < this.g.n; i++) c += this.alive[i]; return c; },
    total() { return this.g.n; },
    isFree(i) { return isFree(this.g, this.alive, i); },
    freeList() { return freeList(this.g, this.alive); },
    moves() { return movesOf(this.g, this.alive, this.faces); },
    won() { return this.remaining() === 0; },
    stuck() { return !this.won() && this.moves().length === 0; },
    // Antippen eines Steins. Ergebnis: { type: 'select'|'deselect'|'match'|'blocked'|'switch'|'none', a, b, points }
    tap(i, now) {
      if (i < 0 || i >= this.g.n || !this.alive[i]) return { type: 'none' };
      if (!this.isFree(i)) return { type: 'blocked', a: i };
      const s = this.selected;
      if (s === i) { this.selected = -1; return { type: 'deselect', a: i }; }
      if (s >= 0 && this.alive[s] && matches(this.faces[s], this.faces[i])) {
        const pts = this.match(s, i, now);
        return { type: 'match', a: s, b: i, points: pts, combo: this.combo };
      }
      const prev = s; this.selected = i;
      return { type: prev >= 0 ? 'switch' : 'select', a: i, prev };
    },
    match(a, b, now) {
      now = now === undefined ? this.time : now;
      this.history.push([a, b, this.score, this.combo, this.lastMatch]);
      this.alive[a] = 0; this.alive[b] = 0; this.selected = -1; this.matchesMade++;
      this.combo = (now - this.lastMatch <= SCORE.comboWindow) ? this.combo + 1 : 1;
      this.bestCombo = Math.max(this.bestCombo, this.combo);
      this.lastMatch = now;
      const pts = SCORE.base + SCORE.comboStep * Math.min(this.combo - 1, SCORE.comboMax - 1);
      this.score += pts;
      this.history[this.history.length - 1].push(pts);
      return pts;
    },
    canUndo() { return this.history.length > 0; },
    undo() {
      const h = this.history.pop(); if (!h) return null;
      this.alive[h[0]] = 1; this.alive[h[1]] = 1;
      // nur die Punkte des Paars abziehen – spätere Abzüge (Tipp, Mischen) bleiben
      this.score = h.length > 5 ? Math.max(0, this.score - h[5]) : h[2]; this.combo = h[3]; this.lastMatch = h[4];
      this.selected = -1; this.undos++;
      return [h[0], h[1]];
    },
    // Tipp: bevorzugt ein Paar, das zur gespeicherten Lösung passt (führt nicht in eine Sackgasse), sonst irgendein mögliches Paar
    hint() {
      const mv = this.moves(); if (!mv.length) return null;
      this.hints++; this.score = Math.max(0, this.score - SCORE.hint);
      return this.bestMove(mv);
    },
    bestMove(mv) {
      mv = mv || this.moves(); if (!mv.length) return null;
      // Paar mit Steinen, die viele andere blockieren, zuerst (einfache, gute Faustregel)
      const g = this.g, alive = this.alive;
      function blocks(i) {
        let c = 0;
        for (let j = 0; j < g.n; j++) if (alive[j] && j !== i) {
          if (g.above[j].indexOf(i) >= 0) c += 2;
          if (g.left[j].indexOf(i) >= 0 || g.right[j].indexOf(i) >= 0) c += 1;
        }
        return c + g.pos[i].z;
      }
      let best = mv[0], bv = -1;
      for (const m of mv) { const v = blocks(m[0]) + blocks(m[1]); if (v > bv) { bv = v; best = m; } }
      return best;
    },
    // Neu mischen: verbleibende Bilder lösbar auf die verbleibenden Plätze verteilen
    reshuffle(free) {
      const idx = [], byGroup = {};
      for (let i = 0; i < this.g.n; i++) if (this.alive[i]) { idx.push(i); const gr = group(this.faces[i]); (byGroup[gr] = byGroup[gr] || []).push(this.faces[i]); }
      if (!idx.length) return false;
      const pairs = [];
      Object.keys(byGroup).forEach(k => { const a = byGroup[k]; for (let i = 0; i + 1 < a.length; i += 2) pairs.push([a[i], a[i + 1]]); });
      const d = dealSolvable(this.g, idx, pairs, this.rand, 400);
      if (!d) return false;
      idx.forEach(i => { this.faces[i] = d.faces[i]; });
      this.solution = d.solution; this.selected = -1;
      if (!free) { this.shuffles++; this.score = Math.max(0, this.score - SCORE.shuffle); }
      return true;
    },
    // Endabrechnung
    finish(par) {
      const sec = Math.round(this.time / 1000);
      const timeBonus = par ? Math.max(0, (par - sec)) * 3 : 0;
      const perfect = this.hints === 0 && this.shuffles === 0 && this.undos === 0 ? SCORE.perfect : 0;
      this.score += timeBonus + perfect;
      return { sec, timeBonus, perfect, score: this.score };
    },
    toJSON() {
      return { v: 1, id: this.layout.id, seed: this.seed, faces: Array.from(this.faces), alive: Array.from(this.alive),
        hist: this.history.slice(-400), score: this.score, combo: this.combo, bestCombo: this.bestCombo, hints: this.hints,
        shuffles: this.shuffles, undos: this.undos, time: Math.round(this.time), made: this.matchesMade };
    },
    _restore(s) {
      const n = this.g.n;
      if (!s || !Array.isArray(s.faces) || s.faces.length !== n || !Array.isArray(s.alive) || s.alive.length !== n) throw new Error('Spielstand passt nicht');
      this.faces = Int8Array.from(s.faces.map(v => (v | 0) >= 0 && (v | 0) < FACE_COUNT ? v | 0 : 0));
      this.alive = Uint8Array.from(s.alive.map(v => v ? 1 : 0));
      if (this.remaining() % 2) throw new Error('Spielstand ungültig');
      this.history = Array.isArray(s.hist) ? s.hist.filter(h => Array.isArray(h) && h.length >= 5 && h[0] >= 0 && h[0] < n && h[1] >= 0 && h[1] < n && !this.alive[h[0]] && !this.alive[h[1]]) : [];
      this.score = +s.score || 0; this.combo = 0; this.bestCombo = +s.bestCombo || 0; this.hints = +s.hints || 0;
      this.shuffles = +s.shuffles || 0; this.undos = +s.undos || 0; this.time = +s.time || 0; this.matchesMade = +s.made || 0;
      this.lastMatch = -1e9; this.solution = null;
    }
  };

  const api = { rng, hash, shuffle, FACE_COUNT, group, matches, fullPairs, pickPairs, buildGraph, overlaps, isFree, freeList,
    dealSolvable, dealRandom, movesOf, solvable, Game, SCORE };
  root.MJEngine = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
