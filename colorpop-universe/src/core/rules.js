/* ColorPop Universe – Spielrunde: Punkte, Ziele, Sterne, Zuglimit, Rückgängig, Booster, Schwerkraft-Wechsel, Speichern/Fortsetzen.
 * Punkte (überall gleich): Gruppe mit n Steinen = (n − 2)² × 10  → 2 = 0, 3 = 10, 4 = 40, 6 = 160, 10 = 640, 20 = 2560.
 * Komplett leeres Brett: +1000. Restzug-Bonus (+100 je übrigem Zug) nur in Leveln mit moveBonus.
 * Zusatz nur in ausgewiesenen Modi: specialBonus (+5 je Stein, den ein Spezialstein zusätzlich entfernt), Combo-Faktor (mult). */
(function (root) {
  'use strict';
  var CPU = root.CPU || (root.CPU = {});
  var B = CPU.board, C = CPU.cell, K = CPU.K;

  function points(n) { return n >= 2 ? (n - 2) * (n - 2) * 10 : 0; }
  CPU.points = points;
  CPU.CLEAR_BONUS = 1000; CPU.MOVE_BONUS = 100;

  var GOAL_TEXT = {
    clear: function () { return 'Räume das Brett komplett leer'; },
    leave: function (g) { return 'Höchstens ' + g.n + ' Steine übrig lassen'; },
    score: function (g) { return g.n.toLocaleString('de-DE') + ' Punkte erreichen'; },
    color: function (g) { return g.n + '× ' + (CPU.COLOR_NAMES ? CPU.COLOR_NAMES[g.c] : 'Farbe ' + g.c) + ' entfernen'; },
    items: function (g) { return g.n + ' ' + (['Sternfragmente', 'Muscheln', 'Schlüssel', 'Edelsteine'][g.v || 0]) + ' nach unten bringen'; },
    ice: function (g) { return g.n ? g.n + ' Eis-/Harzschichten brechen' : 'Alle Eis-/Harzschichten brechen'; },
    blocks: function (g) { return g.n ? g.n + ' Holz-/Felsblöcke zerstören' : 'Alle Holz- und Felsblöcke zerstören'; },
    marks: function (g) { return g.n ? g.n + ' Zielmarker freiräumen' : 'Alle Zielmarker freiräumen'; },
    groups: function (g) { return g.n + ' Gruppen mit mindestens ' + g.size + ' Steinen bilden'; }
  };
  CPU.goalText = function (g) { return (GOAL_TEXT[g.t] || function () { return g.t; })(g); };

  function newStats() { return { removed: 0, byColor: [0, 0, 0, 0, 0, 0, 0, 0], items: [0, 0, 0, 0], ice: 0, blocks: 0, marks: 0, sizes: {}, maxGroup: 0, specials: 0, boosters: 0, undos: 0, hints: 0 }; }
  function cloneStats(s) { return JSON.parse(JSON.stringify(s)); }
  function countIce(b) { var n = 0; for (var i = 0; i < b.cells.length; i++) n += C.ice(b.cells[i]); return n; }
  function countBlocks(b) { var n = 0; for (var i = 0; i < b.cells.length; i++) { var k = C.kind(b.cells[i]); if (b.cells[i] && (k === K.WOOD || k === K.ROCK)) n++; } return n; }
  function countMarks(b) { var n = 0; if (b.marks) for (var i = 0; i < b.marks.length; i++) n += b.marks[i]; return n; }
  function countItems(b, v) { var n = 0; for (var i = 0; i < b.cells.length; i++) { var x = b.cells[i]; if (x && C.kind(x) === K.ITEM && (v == null || C.arg(x) === v)) n++; } return n; }

  // def: { board, colors, rules:{minGroup, gravity, collapse, specialBonus, refill, conveyors, gravityCycle, cycleEvery}, goals, moves, moveBonus, stars:[s2,s3], allowUndo, boosters, seed }
  function Game(def) {
    if (!(this instanceof Game)) return new Game(def);
    this.def = def;
    this.rules = Object.assign({ minGroup: 2, gravity: 0, collapse: true, specialBonus: 0, refill: false, conveyors: null, gravityCycle: null, cycleEvery: 3 }, def.rules || {});
    this.colors = def.colors || 4;
    this.board = B.clone(def.board);
    this.goals = (def.goals || []).map(function (g) { return Object.assign({}, g); });
    this.moveLimit = def.moves || 0;
    this.score = 0; this.movesUsed = 0; this.stats = newStats();
    this.start = { ice: countIce(this.board), blocks: countBlocks(this.board), marks: countMarks(this.board), pieces: B.countPieces(this.board) };
    this.rng = this.rules.refill ? CPU.rng((def.seed >>> 0) ^ 0x5bd1e995) : null;
    this.history = []; this.over = false; this.result = null; this.cleared = false; this.lastGain = 0;
  }
  var P = Game.prototype;
  P.gravityAt = function (m) {
    var c = this.rules.gravityCycle; if (!c || !c.length) return this.rules.gravity || 0;
    return c[Math.floor(m / (this.rules.cycleEvery || 3)) % c.length];
  };
  P.gravityNow = function () { return this.gravityAt(this.movesUsed); };
  P.gravityNext = function () {   // {dir, in: Züge bis zum Wechsel} oder null
    var c = this.rules.gravityCycle; if (!c || !c.length) return null;
    var e = this.rules.cycleEvery || 3, m = this.movesUsed, inn = e - (m % e);
    return { dir: this.gravityAt(m + inn), in: inn };
  };
  P.opt = function () {
    var r = this.rules;
    return { minGroup: r.minGroup, gravity: this.gravityNow(), collapse: r.collapse, colorCount: this.colors, conveyors: r.conveyors, refill: this.rng };
  };
  P.movesLeft = function () { return this.moveLimit ? Math.max(0, this.moveLimit - this.movesUsed) : Infinity; };
  P.preview = function (i) {
    if (this.over) return null;
    var g = B.group(this.board, i, this.rules.minGroup);
    if (!g.length) return null;
    return { cells: g, size: g.length, points: points(g.length) };
  };
  P.legal = function () { return B.groups(this.board, this.rules.minGroup); };
  P.hasMove = function () { return B.hasMove(this.board, this.rules.minGroup); };
  P.remaining = function () { return B.countPieces(this.board); };
  P.snap = function () {
    var b = this.board;
    return { cells: b.cells.slice(), ids: b.ids.slice(), marks: b.marks ? b.marks.slice() : null, nextId: b.nextId, score: this.score, movesUsed: this.movesUsed, stats: cloneStats(this.stats), cleared: this.cleared, rng: this.rng ? this.rng.state() : 0 };
  };
  P.restoreSnap = function (s) {
    var b = this.board; b.cells = Int32Array.from(s.cells); b.ids = Int32Array.from(s.ids); b.marks = s.marks ? Uint8Array.from(s.marks) : null; b.nextId = s.nextId;
    this.score = s.score; this.movesUsed = s.movesUsed; this.stats = cloneStats(s.stats); this.cleared = !!s.cleared;
    if (this.rules.refill) this.rng = CPU.rng(s.rng);
  };
  P.canUndo = function () { return !!this.def.allowUndo && this.history.length > 0 && !this.over; };
  P.undo = function () {
    if (!this.canUndo()) return false;
    var u = this.stats.undos + 1; this.restoreSnap(this.history.pop()); this.stats.undos = u; return true;
  };
  P._record = function (res, gain) {
    var st = this.stats, n = res.group.length;
    st.removed += res.removed.length; st.specials += res.specials;
    for (var c = 0; c < 8; c++) st.byColor[c] += res.byColor[c];
    res.collected.forEach(function (it) { st.items[C.arg(it.v) & 3]++; });
    st.ice += res.iceHits.length; st.marks += res.marks.length;
    st.blocks += res.passive.length;
    if (n) { st.sizes[n] = (st.sizes[n] || 0) + 1; if (n > st.maxGroup) st.maxGroup = n; }
    this.score += gain; this.lastGain = gain;
  };
  // mult: Combo-Faktor (nur Arcade-Modi)
  P.move = function (i, mult) {
    if (this.over || (this.moveLimit && this.movesUsed >= this.moveLimit)) return null;
    var g = B.group(this.board, i, this.rules.minGroup);
    if (!g.length) return null;
    if (this.def.allowUndo) { this.history.push(this.snap()); if (this.history.length > 200) this.history.shift(); }
    var res = B.apply(this.board, g, this.opt(), false);
    var gain = points(g.length) + (this.rules.specialBonus ? this.rules.specialBonus * res.extra : 0);
    if (mult && mult > 1) gain = Math.round(gain * mult);
    this.movesUsed++;
    if (!this.cleared && B.isClear(this.board)) { this.cleared = true; gain += CPU.CLEAR_BONUS; res.clearBonus = CPU.CLEAR_BONUS; }
    this._record(res, gain);
    res.gain = gain;
    return res;
  };
  // Booster: hammer (ein Feld), mini (3×3), color (Stein auf nächste Farbe), shuffle (Farben neu verteilen). Kein Zug, keine Punkte.
  P.booster = function (type, i) {
    if (this.over) return null;
    var b = this.board, n = b.w * b.h, res = null;
    if (this.def.allowUndo) this.history.push(this.snap());
    if (type === 'hammer') {
      var v = b.cells[i]; if (i < 0 || i >= n || !C.isPiece(v) || C.kind(v) === K.ITEM) { if (this.def.allowUndo) this.history.pop(); return null; }
      if (C.ice(v)) b.cells[i] = C.setIce(v, 0);
      if (C.kind(v) === K.ROCK) b.cells[i] = C.setArg(v, 1);   // Hammer zerschlägt Fels in einem Schlag
      res = B.apply(b, [i], this.opt(), true);
      if (C.ice(v)) { res.iceHits.push({ i: i, left: 0 }); this.stats.ice += C.ice(v) - 1; }   // Hammer bricht alle Schichten
    } else if (type === 'mini') {
      if (i < 0 || i >= n) { if (this.def.allowUndo) this.history.pop(); return null; }
      var x = i % b.w, y = (i - x) / b.w, seed = [];
      for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) { var xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < b.w && yy < b.h) seed.push(xx + yy * b.w); }
      res = B.apply(b, seed, this.opt(), true);
      res.effects.unshift({ t: 'bomb', i: i });
    } else if (type === 'color') {
      var cv = b.cells[i]; if (i < 0 || i >= n || !C.selectable(cv)) { if (this.def.allowUndo) this.history.pop(); return null; }
      b.cells[i] = C.setColor(cv, (C.color(cv) + 1) % this.colors);
      res = { group: [], removed: [], passive: [], effects: [{ t: 'paint', i: i }], iceHits: [], rockHits: [], marks: [], collected: [], byColor: [0, 0, 0, 0, 0, 0, 0, 0], specials: 0, extra: 0, recolored: [] };
    } else if (type === 'shuffle') {
      var pos = [], cols = [];
      for (var q = 0; q < n; q++) { var sv = b.cells[q]; if (C.selectable(sv) && C.kind(sv) === K.NORMAL) { pos.push(q); cols.push(C.color(sv)); } }
      if (pos.length < 2) { if (this.def.allowUndo) this.history.pop(); return null; }
      var r = CPU.rng(((this.def.seed >>> 0) ^ Math.imul(this.movesUsed + 1, 2654435761) ^ (this.stats.boosters * 977)) >>> 0), tries = 0;
      do {   // Fisher-Yates, bis es mindestens einen Zug gibt (höchstens 12 Versuche)
        for (var k = cols.length - 1; k > 0; k--) { var j = r.int(k + 1), t = cols[k]; cols[k] = cols[j]; cols[j] = t; }
        for (k = 0; k < pos.length; k++) b.cells[pos[k]] = C.setColor(b.cells[pos[k]], cols[k]);
      } while (!B.hasMove(b, this.rules.minGroup) && ++tries < 12);
      res = { group: [], removed: [], passive: [], effects: [{ t: 'shuffle' }], iceHits: [], rockHits: [], marks: [], collected: [], byColor: [0, 0, 0, 0, 0, 0, 0, 0], specials: 0, extra: 0, recolored: [], shuffled: true };
    } else { if (this.def.allowUndo) this.history.pop(); return null; }
    if (!this.cleared && B.isClear(b)) { this.cleared = true; res.clearBonus = CPU.CLEAR_BONUS; }
    this._record(res, res.clearBonus || 0);
    this.stats.boosters++;
    res.gain = res.clearBonus || 0; res.booster = type;
    return res;
  };
  P.progress = function () {
    var self = this, st = this.stats, b = this.board;
    return this.goals.map(function (g) {
      var cur = 0, target = 1;
      switch (g.t) {
        case 'clear': target = self.start.pieces; cur = self.start.pieces - B.countPieces(b); break;
        case 'leave': target = Math.max(0, self.start.pieces - g.n); cur = Math.min(target, self.start.pieces - B.countPieces(b)); break;
        case 'score': target = g.n; cur = self.score; break;
        case 'color': target = g.n; cur = st.byColor[g.c]; break;
        case 'items': target = g.n; cur = st.items[g.v || 0]; break;
        case 'ice': target = g.n || self.start.ice; cur = self.start.ice - countIce(b); break;
        case 'blocks': target = g.n || self.start.blocks; cur = self.start.blocks - countBlocks(b); break;
        case 'marks': target = g.n || self.start.marks; cur = self.start.marks - countMarks(b); break;
        case 'groups': target = g.n; cur = 0; Object.keys(st.sizes).forEach(function (s) { if (+s >= g.size) cur += st.sizes[s]; }); break;
      }
      return { goal: g, cur: Math.min(cur, target), target: target, done: cur >= target, text: CPU.goalText(g) };
    });
  };
  P.goalsMet = function () { var p = this.progress(); for (var i = 0; i < p.length; i++) if (!p[i].done) return false; return true; };
  // Ist die Runde vorbei? reason: clear | nomoves | moves
  P.status = function () {
    if (this.over) return { over: true, reason: this.result.reason };
    if (this.cleared) return { over: true, reason: 'clear' };
    if (this.moveLimit && this.movesUsed >= this.moveLimit) return { over: true, reason: 'moves' };
    if (!this.hasMove()) return { over: true, reason: 'nomoves' };
    return { over: false };
  };
  P.starsFor = function (score, won) {
    if (!won) return 0;
    var s = this.def.stars || [0, 0];
    return 1 + (score >= s[0] ? 1 : 0) + (score >= s[1] ? 1 : 0);
  };
  // Runde abschließen (reason: clear | nomoves | moves | time | quit | manual)
  P.finish = function (reason) {
    if (this.over) return this.result;
    var won = this.goals.length ? this.goalsMet() : true, bonus = 0, why = reason || this.status().reason || 'manual';
    if (won && this.def.moveBonus && this.moveLimit) bonus = this.movesLeft() * CPU.MOVE_BONUS;
    this.score += bonus;
    this.over = true;
    this.result = { reason: why, won: won, score: this.score, moveBonus: bonus, moves: this.movesUsed, remaining: this.remaining(), cleared: this.cleared, stars: this.starsFor(this.score, won), stats: cloneStats(this.stats) };
    return this.result;
  };
  P.clone = function () {
    var g = Object.create(P);
    g.def = this.def; g.rules = this.rules; g.colors = this.colors; g.board = B.clone(this.board); g.goals = this.goals; g.moveLimit = this.moveLimit;
    g.score = this.score; g.movesUsed = this.movesUsed; g.stats = cloneStats(this.stats); g.start = this.start;
    g.rng = this.rng ? CPU.rng(this.rng.state()) : null; g.history = []; g.over = this.over; g.result = this.result; g.cleared = this.cleared; g.lastGain = 0;
    return g;
  };
  // Für den Spielstand: kompakter Zustand ohne Funktionen
  P.save = function () { var s = this.snap(); s.cells = Array.from(s.cells); s.ids = Array.from(s.ids); s.marks = s.marks ? Array.from(s.marks) : null; return s; };
  P.load = function (s) { this.restoreSnap(s); return this; };

  CPU.Game = Game;
  CPU.countIce = countIce; CPU.countBlocks = countBlocks; CPU.countMarks = countMarks; CPU.countItems = countItems;
  if (typeof module !== 'undefined' && module.exports) module.exports = CPU;
})(typeof window !== 'undefined' ? window : globalThis);
