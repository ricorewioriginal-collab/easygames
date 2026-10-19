/* ColorPop Universe – Brettmodell, Gruppen (4er-Nachbarschaft), Schwerkraft, Spaltenzusammenzug und Spezialsteine.
 * Rein und deterministisch: keine DOM-, Zeit- oder Zufallsabhängigkeit (Zufall nur über übergebenen Generator).
 *
 * Zelle = 32-Bit-Zahl:  Bit 0–3 Farbe+1 (0 = farblos) · Bit 4–8 Art · Bit 9–10 Eis-/Harzschichten · Bit 11–14 Parameter
 * Ablauf eines Zugs (resolve), feste Reihenfolge:
 *  1. Gruppe bestimmen (BFS, nur oben/unten/links/rechts, mind. minGroup Steine, Prismen zählen als Joker)
 *  2. Gruppe entfernen; Spezialsteine darin lösen in aufsteigender Feldnummer aus, Folgeauslösungen in Warteschlangen-Reihenfolge,
 *     jedes Feld höchstens einmal (Bombe 3×3, Rakete Reihe/Spalte, Kettenblitz verbundene Kettensteine, Regenbogen färbt um, Windpfeil)
 *  3. Nachbarschaft jedes entfernten Steins: Eis/Harz −1 Schicht, Holz zerbricht, Fels −1, Hitzebombe zündet (→ zurück zu 2)
 *     Jedes Feld nimmt pro Zug höchstens einen Schaden. Zerbrochenes Holz/Fels wirkt nicht weiter auf Nachbarn.
 *  4. Zielmarker unter entfernten Farbsteinen erlöschen   5. Regenbogen-Umfärbung
 *  6. Schwerkraft (Windpfeil überschreibt die Richtung dieses Zugs), danach leere Spalten zusammenschieben
 *  7. Sammelobjekte am Boden einsammeln (wiederholt mit Schwerkraft)   8. Förderbänder drehen   9. Portale tauschen
 * 10. Neonsteine wechseln die Farbe   11. Nachfüllen (nur Modi mit Nachfüllen) */
(function (root) {
  'use strict';
  var CPU = root.CPU || (root.CPU = {});

  var K = { NORMAL: 0, BOMB: 1, ROCKET: 2, PRISM: 3, RAINBOW: 4, CHAIN: 5, ANCHOR: 6, NEON: 7, WIND: 8, WOOD: 9, ROCK: 10, ITEM: 11, VOID: 12, PORTAL: 13 };
  var DIR = { DOWN: 0, LEFT: 1, UP: 2, RIGHT: 3 };
  var KIND_NAMES = ['normal', 'bomb', 'rocket', 'prism', 'rainbow', 'chain', 'anchor', 'neon', 'wind', 'wood', 'rock', 'item', 'void', 'portal'];

  function mk(color, kind, ice, arg) { return (((color == null ? -1 : color) + 1) & 15) | ((kind || 0) << 4) | ((ice || 0) << 9) | ((arg || 0) << 11); }
  function color(v) { return (v & 15) - 1; }
  function kind(v) { return (v >> 4) & 31; }
  function ice(v) { return (v >> 9) & 3; }
  function arg(v) { return (v >> 11) & 15; }
  function setColor(v, c) { return (v & ~15) | ((c + 1) & 15); }
  function setIce(v, n) { return (v & ~(3 << 9)) | ((n & 3) << 9); }
  function setArg(v, a) { return (v & ~(15 << 11)) | ((a & 15) << 11); }
  // Zählt als „Stein“ auf dem Brett (alles außer leer, Loch und Portal)
  function isPiece(v) { if (!v) return false; var k = kind(v); return k !== K.VOID && k !== K.PORTAL; }
  function isFixed(v) { if (!v) return false; var k = kind(v); return k === K.ANCHOR || k === K.ROCK || k === K.VOID || k === K.PORTAL || ice(v) > 0; }
  function selectable(v) { return v !== 0 && color(v) >= 0 && ice(v) === 0; }
  function joinable(v, c) { return v !== 0 && ice(v) === 0 && (color(v) === c || kind(v) === K.PRISM); }

  function create(w, h) {
    return { w: w, h: h, cells: new Int32Array(w * h), ids: new Int32Array(w * h), marks: null, nextId: 1 };
  }
  function clone(b) {
    return { w: b.w, h: b.h, cells: b.cells.slice(), ids: b.ids.slice(), marks: b.marks ? b.marks.slice() : null, nextId: b.nextId };
  }
  function fromRows(rows, legend) {
    // Hilfe für Tests/Rätsel: rows = ['01.', '110'] – Ziffer = Farbe, '.' leer, '#' Loch; legend optional {Zeichen: Zellwert}
    var h = rows.length, w = rows[0].length, b = create(w, h);
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
      var ch = rows[y][x], v = 0;
      if (legend && legend[ch] != null) v = legend[ch];
      else if (ch >= '0' && ch <= '9') v = mk(+ch);
      else if (ch === '#') v = mk(-1, K.VOID);
      set(b, x + y * w, v);
    }
    return b;
  }
  function set(b, i, v) { b.cells[i] = v; b.ids[i] = v ? b.nextId++ : 0; }
  function toRows(b) {
    var out = [];
    for (var y = 0; y < b.h; y++) {
      var s = '';
      for (var x = 0; x < b.w; x++) { var v = b.cells[x + y * b.w]; s += !v ? '.' : kind(v) === K.VOID ? '#' : color(v) >= 0 && kind(v) === K.NORMAL && !ice(v) ? String(color(v)) : '*'; }
      out.push(s);
    }
    return out;
  }
  function key(b) { var s = ''; for (var i = 0; i < b.cells.length; i++) s += b.cells[i].toString(36) + ','; return s; }

  // ---------- Gruppen ----------
  var stampArr = null, stamp = 0;
  function scratch(n) { if (!stampArr || stampArr.length < n) { stampArr = new Uint32Array(n); stamp = 0; } stamp++; if (stamp > 4e9) { stampArr.fill(0); stamp = 1; } return stamp; }

  // Gruppe am Feld i (sortierte Feldnummern) – leer, wenn nicht wählbar oder kleiner als minGroup
  function group(b, i, minGroup) {
    var n = b.w * b.h; if (i < 0 || i >= n) return [];
    var v = b.cells[i]; if (!selectable(v)) return [];
    var c = color(v), st = scratch(n), stack = [i], out = [], w = b.w, h = b.h, cells = b.cells;
    stampArr[i] = st;
    while (stack.length) {
      var j = stack.pop(); out.push(j);
      var x = j % w, y = (j - x) / w;
      if (x > 0) push(j - 1); if (x < w - 1) push(j + 1); if (y > 0) push(j - w); if (y < h - 1) push(j + w);
    }
    function push(k) { if (stampArr[k] !== st && joinable(cells[k], c)) { stampArr[k] = st; stack.push(k); } }
    if (out.length < (minGroup || 2)) return [];
    // eine Gruppe nur aus Prismen gibt es nicht (Start ist immer ein Farbstein)
    out.sort(function (a, b2) { return a - b2; });
    return out;
  }
  // Alle legalen Gruppen: [{i: Vertreter (kleinste Feldnummer eines Farbsteins), size, color, cells}]
  function groups(b, minGroup) {
    var n = b.w * b.h, seen = new Uint8Array(n), out = [];
    for (var i = 0; i < n; i++) {
      if (seen[i] || !selectable(b.cells[i])) continue;
      var g = group(b, i, 1);
      var c = color(b.cells[i]), rep = -1;
      for (var k = 0; k < g.length; k++) { var j = g[k]; if (kind(b.cells[j]) !== K.PRISM) { seen[j] = 1; if (rep < 0) rep = j; } }
      if (g.length >= (minGroup || 2)) out.push({ i: rep, size: g.length, color: c, cells: g });
    }
    return out;
  }
  function hasMove(b, minGroup) {
    var w = b.w, h = b.h, cells = b.cells, m = minGroup || 2;
    if (m === 2) {   // schneller Weg: zwei gleichfarbige Nachbarn oder Farbstein neben Prisma
      for (var i = 0; i < cells.length; i++) {
        var v = cells[i]; if (!selectable(v)) continue;
        var c = color(v), x = i % w;
        if (x < w - 1 && joinable(cells[i + 1], c)) return true;
        if (i + w < cells.length && joinable(cells[i + w], c)) return true;
        if (x > 0 && kind(cells[i - 1]) === K.PRISM && ice(cells[i - 1]) === 0) return true;
        if (i - w >= 0 && kind(cells[i - w]) === K.PRISM && ice(cells[i - w]) === 0) return true;
      }
      return false;
    }
    return groups(b, m).length > 0;
  }
  function countPieces(b) { var n = 0; for (var i = 0; i < b.cells.length; i++) if (isPiece(b.cells[i])) n++; return n; }
  function isClear(b) { return countPieces(b) === 0; }

  // ---------- Schwerkraft ----------
  // Linie = Feldnummern vom „Boden“ (Richtung der Schwerkraft) weg
  function gravLines(b, dir) {
    var w = b.w, h = b.h, lines = [], x, y, L;
    if (dir === DIR.DOWN || dir === DIR.UP) for (x = 0; x < w; x++) { L = []; for (y = 0; y < h; y++) L.push(x + (dir === DIR.DOWN ? h - 1 - y : y) * w); lines.push(L); }
    else for (y = h - 1; y >= 0; y--) { L = []; for (x = 0; x < w; x++) L.push((dir === DIR.LEFT ? x : w - 1 - x) + y * w); lines.push(L); }
    return lines;   // DOWN/UP: Spalten links→rechts; LEFT/RIGHT: Reihen unten→oben (Reihenfolge = Zusammenzug-Richtung)
  }
  function compact(b, dir) {
    var lines = gravLines(b, dir), cells = b.cells, ids = b.ids, moved = false;
    for (var l = 0; l < lines.length; l++) {
      var L = lines[l], wr = 0;
      for (var p = 0; p < L.length; p++) {
        var i = L[p], v = cells[i];
        if (!v) continue;
        if (isFixed(v)) { wr = p + 1; continue; }
        if (p !== wr) { var t = L[wr]; cells[t] = v; ids[t] = ids[i]; cells[i] = 0; ids[i] = 0; moved = true; }
        wr++;
      }
    }
    return moved;
  }
  // Leere Spalten (bzw. Reihen bei seitlicher Schwerkraft) rücken zusammen. Linien mit festen Feldern bewegen sich nie und trennen Bereiche.
  function collapse(b, dir) {
    var lines = gravLines(b, dir), cells = b.cells, ids = b.ids, moved = false, n = lines.length;
    var pinned = lines.map(function (L) { for (var k = 0; k < L.length; k++) if (isFixed(cells[L[k]])) return true; return false; });
    var empty = lines.map(function (L) { for (var k = 0; k < L.length; k++) if (cells[L[k]]) return false; return true; });
    var s = 0;
    while (s < n) {
      if (pinned[s]) { s++; continue; }
      var e = s; while (e < n && !pinned[e]) e++;
      var wr = s;
      for (var l = s; l < e; l++) {
        if (empty[l]) continue;
        if (l !== wr) {
          var A = lines[l], B = lines[wr];
          for (var k = 0; k < A.length; k++) { cells[B[k]] = cells[A[k]]; ids[B[k]] = ids[A[k]]; cells[A[k]] = 0; ids[A[k]] = 0; }
          moved = true;
        }
        wr++;
      }
      s = e;
    }
    return moved;
  }
  function gravity(b, dir, doCollapse) {
    var m = compact(b, dir);
    if (doCollapse !== false && collapse(b, dir)) m = true;
    return m;
  }
  // Sammelobjekte am Boden (erstes Feld jeder Schwerkraft-Linie)
  function collectItems(b, dir, out) {
    var lines = gravLines(b, dir), n = 0;
    for (var l = 0; l < lines.length; l++) {
      var i = lines[l][0], v = b.cells[i];
      if (v && kind(v) === K.ITEM) { out.push({ i: i, id: b.ids[i], v: v }); b.cells[i] = 0; b.ids[i] = 0; n++; }
    }
    return n;
  }
  function settle(b, dir, doCollapse, collected) {
    var moved = gravity(b, dir, doCollapse), guard = 0;
    while (collectItems(b, dir, collected) && guard++ < b.w * b.h) { gravity(b, dir, doCollapse); moved = true; }
    return moved;
  }
  function above(b, i, dir) {
    var w = b.w, x = i % w, y = (i - x) / w;
    if (dir === DIR.DOWN) return y > 0 ? i - w : -1;
    if (dir === DIR.UP) return y < b.h - 1 ? i + w : -1;
    if (dir === DIR.LEFT) return x < w - 1 ? i + 1 : -1;
    return x > 0 ? i - 1 : -1;
  }

  // ---------- Zug auflösen ----------
  // opt: { minGroup, gravity (0–3), collapse, colorCount, conveyors: [Reihen], refill: rng|null, specialBonus }
  function resolve(b, i, opt) {
    opt = opt || {};
    var g = group(b, i, opt.minGroup || 2);
    if (!g.length) return null;
    return apply(b, g, opt, false);
  }
  // Kernablauf; seed = Startfelder, die entfernt werden (Gruppe oder Booster)
  function apply(b, seed, opt, isBooster) {
    var w = b.w, h = b.h, n = w * h, cells = b.cells, ids = b.ids;
    var removed = new Uint8Array(n), damaged = new Uint8Array(n), triggered = new Uint8Array(n);
    var res = { group: isBooster ? [] : seed.slice(), removed: [], passive: [], effects: [], iceHits: [], rockHits: [], marks: [], collected: [],
      byColor: [0, 0, 0, 0, 0, 0, 0, 0], specials: 0, gravity: opt.gravity || 0, recolored: [], extra: 0 };
    var queue = [], active = [];
    function removeActive(j) { if (removed[j]) return; removed[j] = 1; active.push(j); var k = kind(cells[j]); if (k !== K.NORMAL && k !== K.ANCHOR && k !== K.NEON && k !== K.PRISM) queue.push(j); }
    function removePassive(j) { if (removed[j]) return; removed[j] = 2; res.passive.push({ i: j, id: ids[j], v: cells[j] }); }
    function blast(j) {
      if (j < 0 || j >= n || removed[j]) return;
      var v = cells[j]; if (!v) return;
      var k = kind(v);
      if (k === K.VOID || k === K.PORTAL || k === K.ITEM) return;
      if (ice(v) > 0) { hitIce(j); return; }
      if (k === K.ROCK) { hitRock(j); return; }
      if (k === K.WOOD) { removePassive(j); return; }
      removeActive(j);
    }
    function hitIce(j) { if (damaged[j]) return; damaged[j] = 1; var v = cells[j], l = ice(v) - 1; cells[j] = setIce(v, l); res.iceHits.push({ i: j, left: l }); }
    function hitRock(j) { if (damaged[j]) return; damaged[j] = 1; var v = cells[j], hp = arg(v) - 1; res.rockHits.push({ i: j, left: Math.max(0, hp) }); if (hp <= 0) removePassive(j); else cells[j] = setArg(v, hp); }
    function trigger(j) {
      if (triggered[j]) return; triggered[j] = 1;
      var v = cells[j], k = kind(v), x = j % w, y = (j - x) / w, dx, dy;
      if (k === K.BOMB) { res.effects.push({ t: 'bomb', i: j }); for (dy = -1; dy <= 1; dy++) for (dx = -1; dx <= 1; dx++) { var xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < w && yy < h) blast(xx + yy * w); } }
      else if (k === K.ROCKET) { var vert = arg(v) & 1; res.effects.push({ t: 'rocket', i: j, v: vert }); if (vert) for (dy = 0; dy < h; dy++) blast(x + dy * w); else for (dx = 0; dx < w; dx++) blast(dx + y * w); }
      else if (k === K.CHAIN) {
        res.effects.push({ t: 'chain', i: j });
        var st = [j], seen = {}; seen[j] = 1;
        while (st.length) { var q = st.pop(), qx = q % w, qy = (q - qx) / w; [qx > 0 ? q - 1 : -1, qx < w - 1 ? q + 1 : -1, qy > 0 ? q - w : -1, qy < h - 1 ? q + w : -1].forEach(function (z) { if (z >= 0 && !seen[z] && kind(cells[z]) === K.CHAIN && ice(cells[z]) === 0) { seen[z] = 1; st.push(z); removeActive(z); } }); }
      }
      else if (k === K.RAINBOW) { res.effects.push({ t: 'rainbow', i: j }); res.recolored.push({ from: arg(v), to: color(v) }); }
      else if (k === K.WIND) { res.effects.push({ t: 'wind', i: j, d: arg(v) & 3 }); res.gravity = arg(v) & 3; }
    }
    var s;
    for (s = 0; s < seed.length; s++) { if (isBooster) blast(seed[s]); else removeActive(seed[s]); }
    // 2.+3. Auslösen und Nachbarschaft, bis nichts Neues passiert
    var ai = 0, guard = 0;
    while ((queue.length || ai < active.length) && guard++ < n * 8) {
      queue.sort(function (a, c) { return a - c; });
      while (queue.length) trigger(queue.shift());
      for (; ai < active.length; ai++) {
        var j = active[ai], x = j % w, y = (j - x) / w;
        neigh(x > 0 ? j - 1 : -1); neigh(x < w - 1 ? j + 1 : -1); neigh(y > 0 ? j - w : -1); neigh(y < h - 1 ? j + w : -1);
      }
    }
    function neigh(z) {
      if (z < 0 || removed[z]) return;
      var v = cells[z]; if (!v) return;
      var k = kind(v);
      if (ice(v) > 0) { hitIce(z); return; }
      if (k === K.WOOD) { removePassive(z); return; }
      if (k === K.ROCK) { hitRock(z); return; }
      if (k === K.BOMB && (arg(v) & 1)) removeActive(z);
    }
    // 4. Entfernen, Marker
    for (s = 0; s < active.length; s++) {
      var a = active[s], av = cells[a], ac = color(av);
      res.removed.push({ i: a, id: ids[a], v: av });
      if (ac >= 0) res.byColor[ac]++;
      if (kind(av) !== K.NORMAL) res.specials++;
      if (b.marks && b.marks[a] && ac >= 0) { b.marks[a]--; res.marks.push(a); }
      cells[a] = 0; ids[a] = 0;
    }
    for (s = 0; s < res.passive.length; s++) { var pz = res.passive[s].i; cells[pz] = 0; ids[pz] = 0; }
    res.extra = Math.max(0, active.length - seed.length);
    // 5. Regenbogen
    res.recolored.forEach(function (rc) { for (var q = 0; q < n; q++) { var v = cells[q]; if (v && color(v) === rc.from) cells[q] = setColor(v, rc.to); } });
    // 6.+7. Schwerkraft, Sammeln
    var dir = res.gravity, col = opt.collapse !== false && !opt.refill;
    settle(b, dir, col, res.collected);
    // 8. Förderbänder (nur Schwerkraft nach unten sinnvoll): bewegliche Felder der Reihe rücken zyklisch eins nach rechts
    if (opt.conveyors && opt.conveyors.length) {
      opt.conveyors.forEach(function (row) {
        if (row < 0 || row >= h) return;
        var pos = []; for (var x = 0; x < w; x++) { var q = x + row * w; if (!isFixed(cells[q])) pos.push(q); }
        if (pos.length < 2) return;
        var lastV = cells[pos[pos.length - 1]], lastId = ids[pos[pos.length - 1]];
        for (var p = pos.length - 1; p > 0; p--) { cells[pos[p]] = cells[pos[p - 1]]; ids[pos[p]] = ids[pos[p - 1]]; }
        cells[pos[0]] = lastV; ids[pos[0]] = lastId;
      });
      settle(b, dir, col, res.collected);
      res.conveyed = true;
    }
    // 9. Portale: Steine direkt über den beiden Portalen eines Paares tauschen
    var pairs = {};
    for (var q = 0; q < n; q++) if (kind(cells[q]) === K.PORTAL && cells[q]) { var pid = arg(cells[q]); (pairs[pid] = pairs[pid] || []).push(q); }
    Object.keys(pairs).sort().forEach(function (pid) {
      var P = pairs[pid]; if (P.length !== 2) return;
      var A = above(b, P[0], dir), B = above(b, P[1], dir);
      if (A < 0 || B < 0) return;
      var va = cells[A], vb = cells[B];
      if (!va || !vb || isFixed(va) || isFixed(vb)) return;
      cells[A] = vb; cells[B] = va; var t = ids[A]; ids[A] = ids[B]; ids[B] = t;
      res.effects.push({ t: 'portal', a: A, b: B });
    });
    // 10. Neon
    var cc = opt.colorCount || 4;
    for (q = 0; q < n; q++) { var nv = cells[q]; if (nv && kind(nv) === K.NEON && ice(nv) === 0) cells[q] = setColor(nv, (color(nv) + 1) % cc); }
    // 11. Nachfüllen
    if (opt.refill) {
      res.spawned = [];
      for (q = 0; q < n; q++) if (!cells[q]) { cells[q] = mk(opt.refill.int(cc)); ids[q] = b.nextId++; res.spawned.push(q); }
    }
    return res;
  }

  CPU.K = K; CPU.DIR = DIR; CPU.KIND_NAMES = KIND_NAMES;
  CPU.cell = { mk: mk, color: color, kind: kind, ice: ice, arg: arg, setColor: setColor, setIce: setIce, setArg: setArg, isPiece: isPiece, isFixed: isFixed, selectable: selectable, joinable: joinable };
  CPU.board = { create: create, clone: clone, fromRows: fromRows, toRows: toRows, set: set, key: key, group: group, groups: groups, hasMove: hasMove,
    countPieces: countPieces, isClear: isClear, compact: compact, collapse: collapse, gravity: gravity, settle: settle, resolve: resolve, apply: apply, gravLines: gravLines };
  if (typeof module !== 'undefined' && module.exports) module.exports = CPU;
})(typeof window !== 'undefined' ? window : globalThis);
