/* Wortfunk – Spiellogik (ohne DOM; läuft im Browser, im Worker und in Node für Tests)
 * Brett 15×15, Steine als Zahlen: 1..29 = Buchstabe (A–Z, Ä, Ö, Ü), +32 = Joker. Bank: 0 = Joker.
 * Wörterbuch: DAWG als Uint32-Kanten (siehe tools/wortfunk/mkdawg.py). */
(function (root) {
  'use strict';
  const N = 15, SIZE = N * N, CENTER = 7 * N + 7, RACK = 7, BINGO = 50;
  const AL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ';
  // eigene Verteilung (104 Steine) und eigene Werte – nach Häufigkeit im Deutschen
  const COUNT = { A: 6, B: 2, C: 2, D: 4, E: 15, F: 2, G: 3, H: 4, I: 6, J: 1, K: 2, L: 3, M: 4, N: 9, O: 3, P: 1, Q: 1, R: 6, S: 7, T: 6, U: 6, V: 1, W: 2, X: 1, Y: 1, Z: 1, Ä: 1, Ö: 1, Ü: 1 };
  const VALUE = { A: 1, B: 3, C: 4, D: 1, E: 1, F: 4, G: 2, H: 2, I: 1, J: 6, K: 4, L: 2, M: 2, N: 1, O: 2, P: 5, Q: 10, R: 1, S: 1, T: 1, U: 1, V: 6, W: 3, X: 8, Y: 10, Z: 5, Ä: 6, Ö: 7, Ü: 6 };
  const JOKERS = 2;
  const VAL = [0], CNT = [JOKERS];
  for (let i = 0; i < AL.length; i++) { VAL.push(VALUE[AL[i]]); CNT.push(COUNT[AL[i]]); }
  const VOWEL = new Set([1, 5, 9, 15, 21, 27, 28, 29]); // A E I O U Ä Ö Ü

  // Bonusfelder: ein Viertel (Zeile, Spalte 0..7), an beiden Achsen gespiegelt
  const QUAD = {
    W3: [[0, 3], [3, 0]],
    W2: [[1, 5], [5, 1], [3, 3]],
    B3: [[1, 1], [4, 6], [6, 4]],
    B2: [[0, 0], [0, 7], [7, 0], [2, 4], [4, 2], [6, 6], [7, 3], [3, 7]]
  };
  const BONUS = new Array(SIZE).fill('');
  for (const k in QUAD) for (const [r, c] of QUAD[k]) for (const rr of [r, N - 1 - r]) for (const cc of [c, N - 1 - c]) BONUS[rr * N + cc] = k;
  BONUS[CENTER] = 'ST';
  const LM = b => b === 'B2' ? 2 : b === 'B3' ? 3 : 1;
  const WM = b => b === 'W2' || b === 'ST' ? 2 : b === 'W3' ? 3 : 1;

  const letter = t => t & 31, isJoker = t => (t & 32) !== 0, tileVal = t => isJoker(t) ? 0 : VAL[t & 31];
  const ch = code => AL[code - 1] || '?';
  const enc = s => Array.from(String(s).toUpperCase().replace(/ß/g, 'SS')).map(x => AL.indexOf(x) + 1);
  const dec = a => a.map(ch).join('');

  /* ---------- Zufall (mit Startwert, damit Online-Gastgeber und Tests reproduzierbar sind) ---------- */
  function rng(seed) {
    let a = seed >>> 0;
    return function () { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function shuffle(arr, rnd) { for (let i = arr.length - 1; i > 0; i--) { const j = (rnd() * (i + 1)) | 0; const t = arr[i]; arr[i] = arr[j]; arr[j] = t; } return arr; }

  /* ---------- Wörterbuch ---------- */
  function Dict(buf) {
    const E = buf instanceof Uint32Array ? buf : new Uint32Array(buf);
    const root = E[0];
    function find(node, code) { // Kantenindex oder -1
      if (!node) return -1;
      for (let i = node; ; i++) { const v = E[i]; if ((v & 31) === code) return i; if (v & 64) return -1; }
    }
    function has(codes) {
      let node = root, e = -1;
      for (let k = 0; k < codes.length; k++) { e = find(node, codes[k]); if (e < 0) return false; node = E[e] >>> 7; }
      return e >= 0 && (E[e] & 32) !== 0;
    }
    return { E, root, find, has, hasWord: s => has(enc(s)) };
  }

  /* ---------- Spielstand ---------- */
  function newGame(names, seed) {
    seed = seed >>> 0 || ((Math.random() * 4294967296) >>> 0);
    const rnd = rng(seed), bag = [];
    for (let code = 0; code < CNT.length; code++) for (let k = 0; k < CNT[code]; k++) bag.push(code);
    shuffle(bag, rnd);
    const st = { v: 1, seed, rs: seed, board: new Array(SIZE).fill(0), bag, racks: [], scores: [], names: names.slice(), turn: 0, zero: 0, over: false, log: [], last: null, moves: 0 };
    for (let i = 0; i < names.length; i++) { st.racks.push([]); st.scores.push(0); refill(st, i); }
    return st;
  }
  function nextRnd(st) { const r = rng(st.rs); const v = r(); st.rs = (st.rs + 0x9E3779B9) >>> 0; return v; }
  function refill(st, p) { const r = st.racks[p]; while (r.length < RACK && st.bag.length) r.push(st.bag.pop()); }
  const rackValue = r => r.reduce((s, t) => s + VAL[t], 0);
  const boardEmpty = b => !b.some(x => x);

  /* ---------- Zug prüfen und werten ----------
   * tiles: [{ i: Feldindex, t: Steinwert (Buchstabe oder Buchstabe+32 für Joker) }] */
  function evaluate(board, tiles, dict) {
    const res = { ok: false, err: '', words: [], score: 0, bingo: false };
    if (!tiles.length) { res.err = 'Lege mindestens einen Stein.'; return res; }
    const tmp = board.slice(), seen = new Set();
    for (const x of tiles) {
      if (x.i < 0 || x.i >= SIZE || board[x.i] || seen.has(x.i)) { res.err = 'Feld ist schon belegt.'; return res; }
      if (!(letter(x.t) >= 1 && letter(x.t) <= 29)) { res.err = 'Joker braucht einen Buchstaben.'; return res; }
      seen.add(x.i); tmp[x.i] = x.t;
    }
    const rows = new Set(tiles.map(x => (x.i / N) | 0)), cols = new Set(tiles.map(x => x.i % N));
    if (rows.size > 1 && cols.size > 1) { res.err = 'Alle Steine müssen in einer Reihe liegen.'; return res; }
    const empty = boardEmpty(board);
    if (empty && !seen.has(CENTER)) { res.err = 'Das erste Wort muss über den Stern ★ in der Mitte gehen.'; return res; }
    // Richtung: bei einem Stein die Richtung mit Nachbarn
    let horiz;
    if (tiles.length > 1) horiz = rows.size === 1;
    else { const i = tiles[0].i, c = i % N; horiz = (c > 0 && tmp[i - 1]) || (c < N - 1 && tmp[i + 1]); horiz = !!horiz; }
    const step = horiz ? 1 : N;
    const along = i => horiz ? i % N : (i / N) | 0;
    // lückenlos?
    const idx = tiles.map(x => x.i).sort((a, b) => a - b);
    for (let i = idx[0]; i <= idx[idx.length - 1]; i += step) if (!tmp[i]) { res.err = 'Zwischen deinen Steinen darf keine Lücke sein.'; return res; }
    // Wort entlang einer Richtung ab Feld i
    const wordAt = (i, st) => {
      const lineOf = x => st === 1 ? (x / N) | 0 : x % N, ln = lineOf(i);
      let s = i; while (s - st >= 0 && lineOf(s - st) === ln && tmp[s - st]) s -= st;
      const cells = []; for (let k = s; k < SIZE && lineOf(k) === ln && tmp[k]; k += st) cells.push(k);
      return cells;
    };
    const scoreCells = cells => {
      let sum = 0, mul = 1;
      for (const k of cells) { let v = tileVal(tmp[k]); if (seen.has(k)) { v *= LM(BONUS[k]); mul *= WM(BONUS[k]); } sum += v; }
      return sum * mul;
    };
    const words = [];
    const main = wordAt(idx[0], step);
    if (main.length > 1) words.push(main);
    for (const x of tiles) { const cw = wordAt(x.i, horiz ? N : 1); if (cw.length > 1) words.push(cw); }
    if (!words.length) { res.err = empty ? 'Ein Wort hat mindestens zwei Buchstaben.' : 'Dein Wort muss an vorhandene Steine anschließen.'; return res; }
    if (!empty) {
      const touches = words.some(w => w.some(k => !seen.has(k)));
      if (!touches) { res.err = 'Dein Wort muss an vorhandene Steine anschließen.'; return res; }
    }
    for (const w of words) {
      const codes = w.map(k => letter(tmp[k])), s = scoreCells(w);
      res.words.push({ w: dec(codes), s, ok: !dict || dict.has(codes) });
      res.score += s;
    }
    const bad = res.words.filter(w => !w.ok);
    if (bad.length) { res.err = (bad.length > 1 ? 'Nicht im Wörterbuch: ' : 'Nicht im Wörterbuch: ') + bad.map(w => w.w).join(', '); res.bad = bad.map(w => w.w); return res; }
    if (tiles.length === RACK) { res.bingo = true; res.score += BINGO; }
    res.ok = true;
    void along;
    return res;
  }

  /* ---------- Züge ausführen (Gastgeber/Einzelgerät) ---------- */
  function takeFromRack(rack, tiles) { // nimmt die Steine aus der Bank; false, wenn sie fehlen
    const r = rack.slice();
    for (const x of tiles) {
      const want = isJoker(x.t) ? 0 : letter(x.t);
      const k = r.indexOf(want); if (k < 0) return null; r.splice(k, 1);
    }
    return r;
  }
  function endTurn(st, scored) {
    st.zero = scored ? 0 : st.zero + 1; st.moves++;
    const n = st.names.length;
    if (st.zero >= Math.max(4, 2 * n)) return finish(st, -1);
    st.turn = (st.turn + 1) % n;
    return { over: false };
  }
  function finish(st, outPlayer) {
    st.over = true; const n = st.names.length, adj = new Array(n).fill(0);
    let sumOthers = 0;
    for (let p = 0; p < n; p++) { const v = rackValue(st.racks[p]); if (p !== outPlayer) { adj[p] = -v; sumOthers += v; } }
    if (outPlayer >= 0) adj[outPlayer] = sumOthers;
    for (let p = 0; p < n; p++) st.scores[p] += adj[p];
    const best = Math.max.apply(null, st.scores);
    st.winners = st.scores.map((s, p) => s === best ? p : -1).filter(p => p >= 0);
    st.end = { adj, out: outPlayer };
    st.log.push({ p: outPlayer, k: 'end', adj });
    return { over: true };
  }
  function play(st, p, tiles, dict) {
    if (st.over || st.turn !== p) return { ok: false, err: 'Du bist nicht dran.' };
    const left = takeFromRack(st.racks[p], tiles);
    if (!left) return { ok: false, err: 'Diese Steine hast du nicht.' };
    const ev = evaluate(st.board, tiles, dict);
    if (!ev.ok) return ev;
    for (const x of tiles) st.board[x.i] = x.t;
    st.racks[p] = left; refill(st, p);
    st.scores[p] += ev.score;
    const main = ev.words[0];
    st.last = { p, k: 'play', cells: tiles.map(x => x.i), words: ev.words.map(w => [w.w, w.s]), score: ev.score, bingo: ev.bingo };
    st.log.push(st.last);
    if (!st.racks[p].length && !st.bag.length) { finish(st, p); return Object.assign(ev, { over: true, main }); }
    endTurn(st, true);
    return Object.assign(ev, { main });
  }
  function exchange(st, p, letters) { // letters: Bank-Werte (0 = Joker)
    if (st.over || st.turn !== p) return { ok: false, err: 'Du bist nicht dran.' };
    if (st.bag.length < RACK) return { ok: false, err: 'Tauschen geht nur, solange noch mindestens 7 Steine im Beutel sind.' };
    if (!letters.length) return { ok: false, err: 'Wähle Steine zum Tauschen.' };
    const r = st.racks[p].slice();
    for (const t of letters) { const k = r.indexOf(t); if (k < 0) return { ok: false, err: 'Diese Steine hast du nicht.' }; r.splice(k, 1); }
    const n = letters.length;
    for (let k = 0; k < n; k++) r.push(st.bag.pop());
    st.bag.push.apply(st.bag, letters);
    const rnd = rng(st.rs); st.rs = (st.rs + 0x9E3779B9) >>> 0; shuffle(st.bag, rnd);
    st.racks[p] = r;
    st.last = { p, k: 'swap', n }; st.log.push(st.last);
    const e = endTurn(st, false);
    return { ok: true, over: e.over };
  }
  function pass(st, p) {
    if (st.over || st.turn !== p) return { ok: false, err: 'Du bist nicht dran.' };
    st.last = { p, k: 'pass' }; st.log.push(st.last);
    const e = endTurn(st, false);
    return { ok: true, over: e.over };
  }

  /* ---------- Zuggenerator (Appel & Jacobson, nur DAWG) ---------- */
  const ALL = (() => { let m = 0; for (let c = 1; c <= 29; c++) m |= (1 << c); return m; })();
  function generate(board, rack, dict, opt) {
    opt = opt || {};
    const E = dict.E, root = dict.root, find = dict.find;
    const counts = new Array(30).fill(0); for (const t of rack) counts[t]++;
    const out = [], keys = new Set(), limit = opt.limit || 60000;
    const empty = boardEmpty(board);
    for (const horiz of [true, false]) {
      // Zugriff mit Transposition: (z, s) = Zeile, Spalte in der aktuellen Richtung
      const at = (z, s) => horiz ? z * N + s : s * N + z;
      const get = (z, s) => board[at(z, s)];
      // Querprüfung: erlaubte Buchstaben und Querpunkte je Feld
      const cc = new Int32Array(SIZE), cs = new Int32Array(SIZE), hasX = new Uint8Array(SIZE);
      for (let z = 0; z < N; z++) for (let s = 0; s < N; s++) {
        const k = z * N + s;
        if (get(z, s)) continue;
        const up = (z > 0 && get(z - 1, s)), dn = (z < N - 1 && get(z + 1, s));
        if (!up && !dn) { cc[k] = ALL; continue; }
        hasX[k] = 1;
        let a = z; while (a > 0 && get(a - 1, s)) a--;
        let b = z; while (b < N - 1 && get(b + 1, s)) b++;
        let node = root, okp = true, sc = 0;
        for (let q = a; q < z; q++) { const t = get(q, s); sc += tileVal(t); const e = find(node, letter(t)); if (e < 0) { okp = false; break; } node = E[e] >>> 7; }
        for (let q = z + 1; q <= b; q++) sc += tileVal(get(q, s));
        cs[k] = sc;
        if (!okp) { cc[k] = 0; continue; }
        let m = 0;
        if (node) for (let i = node; ; i++) {
          const v = E[i], L = v & 31;
          if (z === b) { if (v & 32) m |= (1 << L); }
          else {
            let n2 = v >>> 7, e = -1, good = true;
            for (let q = z + 1; q <= b; q++) { e = find(n2, letter(get(q, s))); if (e < 0) { good = false; break; } n2 = E[e] >>> 7; }
            if (good && e >= 0 && (E[e] & 32)) m |= (1 << L);
          }
          if (v & 64) break;
        }
        cc[k] = m;
      }
      const isAnchor = (z, s) => {
        if (get(z, s)) return false;
        if (empty) return at(z, s) === CENTER;
        return (z > 0 && get(z - 1, s)) || (z < N - 1 && get(z + 1, s)) || (s > 0 && get(z, s - 1)) || (s < N - 1 && get(z, s + 1));
      };
      const placed = []; // [s, Steinwert]
      const record = (z) => {
        if (out.length >= limit) return;
        const tiles = placed.map(([s, t]) => ({ i: at(z, s), t }));
        const key = tiles.map(x => x.i + ':' + x.t).sort().join(',');
        if (keys.has(key)) return; keys.add(key);
        // Punkte direkt berechnen
        let sum = 0, mul = 1, cross = 0;
        const sSet = new Map(placed.map(([s, t]) => [s, t]));
        let s0 = Math.min.apply(null, placed.map(p => p[0])); while (s0 > 0 && get(z, s0 - 1)) s0--;
        for (let s = s0; s < N; s++) {
          const pt = sSet.get(s), t = pt !== undefined ? pt : get(z, s);
          if (!t) break;
          let v = tileVal(t);
          if (pt !== undefined) {
            const k = z * N + s, b = BONUS[at(z, s)];
            v *= LM(b); mul *= WM(b);
            if (hasX[k]) cross += (cs[k] + tileVal(t) * LM(b)) * WM(b);
          }
          sum += v;
        }
        let score = sum * mul + cross;
        if (placed.length === RACK) score += BINGO;
        out.push({ tiles, score });
      };
      const extend = (z, s, node, term, anchorS) => {
        if (out.length >= limit) return;
        const t = s < N ? get(z, s) : 0;
        if (t) {
          const e = find(node, letter(t)); if (e < 0) return;
          extend(z, s + 1, E[e] >>> 7, (E[e] & 32) !== 0, anchorS);
          return;
        }
        if (term && s > anchorS && placed.length) record(z);
        if (s >= N || !node) return;
        const m = cc[z * N + s];
        if (!m) return;
        for (let i = node; ; i++) {
          const v = E[i], L = v & 31;
          if (m & (1 << L)) {
            if (counts[L]) { counts[L]--; placed.push([s, L]); extend(z, s + 1, v >>> 7, (v & 32) !== 0, anchorS); placed.pop(); counts[L]++; }
            if (counts[0]) { counts[0]--; placed.push([s, L | 32]); extend(z, s + 1, v >>> 7, (v & 32) !== 0, anchorS); placed.pop(); counts[0]++; }
          }
          if (v & 64) break;
        }
      };
      const left = (z, anchorS, node, lim, len) => {
        extend(z, anchorS, node, false, anchorS);
        if (lim <= 0 || !node || out.length >= limit) return;
        for (let i = node; ; i++) {
          const v = E[i], L = v & 31;
          // Linksteil liegt auf freien Feldern ohne Nachbarn; Position wird nach dem Aufbau korrigiert
          if (counts[L]) { counts[L]--; placed.push([-1, L]); shiftLeft(); left(z, anchorS, v >>> 7, lim - 1, len + 1); unshiftLeft(); placed.pop(); counts[L]++; }
          if (counts[0]) { counts[0]--; placed.push([-1, L | 32]); shiftLeft(); left(z, anchorS, v >>> 7, lim - 1, len + 1); unshiftLeft(); placed.pop(); counts[0]++; }
          if (v & 64) break;
        }
        void len;
      };
      // Linksteil: neue Buchstaben stehen immer direkt links vom Anker; beim Anhängen rücken alle eins nach links
      let anchorNow = 0;
      function shiftLeft() { const n = placed.length; for (let k = 0; k < n - 1; k++) placed[k][0]--; placed[n - 1][0] = anchorNow - 1; }
      function unshiftLeft() { const n = placed.length; for (let k = 0; k < n - 1; k++) placed[k][0]++; }
      for (let z = 0; z < N; z++) {
        for (let s = 0; s < N; s++) {
          if (!isAnchor(z, s)) continue;
          anchorNow = s;
          if (s > 0 && get(z, s - 1)) {
            let a = s - 1; while (a > 0 && get(z, a - 1)) a--;
            let node = root, ok = true;
            for (let q = a; q < s; q++) { const e = find(node, letter(get(z, q))); if (e < 0) { ok = false; break; } node = E[e] >>> 7; }
            if (ok) extend(z, s, node, false, s);
          } else {
            let lim = 0; for (let q = s - 1; q >= 0 && !get(z, q) && !isAnchor(z, q); q--) lim++;
            lim = Math.min(lim, RACK - 1);
            left(z, s, root, lim, 0);
          }
        }
      }
    }
    return out;
  }

  /* ---------- Computer: Zug wählen ---------- */
  function leaveValue(rack, used) {
    const r = rack.slice();
    for (const x of used) { const k = r.indexOf(isJoker(x.t) ? 0 : letter(x.t)); if (k >= 0) r.splice(k, 1); }
    let v = 0, vow = 0, con = 0; const seen = {};
    for (const t of r) {
      if (t === 0) { v += 7; continue; }
      if (VOWEL.has(t)) vow++; else con++;
      seen[t] = (seen[t] || 0) + 1; if (seen[t] > 1) v -= 2.5;
      if (t === 19 || t === 5 || t === 14 || t === 18) v += 1; // S E N R halten
      if (VAL[t] >= 6) v -= 1.5;
    }
    if (r.length) v -= Math.abs(vow - con) * 1.2;
    return v;
  }
  function choose(level, moves, rack, rnd) {
    rnd = rnd || Math.random;
    if (!moves.length) return null;
    if (level === 'schwer') {
      let best = null, bv = -1e9;
      for (const m of moves) { const v = m.score + leaveValue(rack, m.tiles); if (v > bv) { bv = v; best = m; } }
      return best;
    }
    const sorted = moves.slice().sort((a, b) => b.score - a.score);
    if (level === 'mittel') {
      const top = sorted.slice(0, Math.max(1, Math.ceil(sorted.length * 0.12)));
      return top[(rnd() * Math.min(top.length, 6)) | 0];
    }
    // leicht: kurze Wörter aus dem mittleren Bereich, Joker lieber nicht
    let pool = sorted.filter(m => m.tiles.length <= 4 && !m.tiles.some(x => isJoker(x.t)));
    if (!pool.length) pool = sorted;
    const a = Math.floor(pool.length * 0.35), b = Math.max(a + 1, Math.floor(pool.length * 0.8));
    const mid = pool.slice(a, b);
    return mid[(rnd() * mid.length) | 0] || pool[pool.length - 1];
  }
  function swapPick(rack) { // welche Steine tauschen, wenn nichts passt
    const keep = new Set(), out = [];
    rack.forEach((t, k) => { if (t === 0 || ((t === 5 || t === 19 || t === 14) && !keep.has(t))) keep.add(t); else out.push(k); });
    const res = out.map(k => rack[k]);
    return res.length ? res : rack.slice(0, Math.min(rack.length, 3));
  }

  // Zug für Computer oder Tipp: d = { board, rack, level, seed, hint }
  // common: Wörterbuch bekannter Wörter – Leicht, Mittel und Tipps nehmen nur Züge, deren Wörter alle bekannt sind
  function pick(d, dict, common) {
    let moves = generate(d.board, d.rack, dict);
    const rnd = rng(d.seed || 1);
    if (!moves.length) return null;
    if (common && (d.hint || d.level !== 'schwer')) {
      const known = moves.filter(m => evaluate(d.board, m.tiles, common).ok);
      if (known.length) moves = known;
    }
    if (d.hint) { // ein guter, aber nicht unbedingt der beste Zug
      const s = moves.sort((a, b) => b.score - a.score);
      return s[Math.min(s.length - 1, 1 + ((rnd() * 4) | 0))];
    }
    return choose(d.level, moves, d.rack, rnd);
  }

  /* ---------- öffentliche Sicht (für Online-Mitspieler) ---------- */
  function publicView(st, p) {
    return {
      board: st.board, scores: st.scores, names: st.names, turn: st.turn, bag: st.bag.length, over: !!st.over, winners: st.winners || null,
      counts: st.racks.map(r => r.length), last: st.last, end: st.end || null, rack: p >= 0 ? st.racks[p] : null, me: p, moves: st.moves,
      log: st.log.slice(-40), canSwap: st.bag.length >= RACK
    };
  }

  const WF = { N, SIZE, CENTER, RACK, BINGO, AL, VAL, CNT, BONUS, LM, WM, letter, isJoker, tileVal, ch, enc, dec, rng, shuffle, Dict,
    newGame, refill, rackValue, evaluate, play, exchange, pass, generate, choose, pick, swapPick, leaveValue, publicView, boardEmpty, nextRnd };
  if (typeof module !== 'undefined' && module.exports) module.exports = WF;
  root.WF = WF;
})(typeof self !== 'undefined' ? self : this);
