/* Royal Radio Match 3D – reine Spiellogik (ohne Grafik, deterministisch, in Node testbar).
 *
 * Zustand
 *   cells[i]  (i = y*W + x, null = Funkloch)  { p: Stein|null, b: Hindernis|null, c: Abdeckung|null, n: Rauschfeld-HP }
 *   Stein     { id, k: Farbe 0–6 | -1, s: '' | rh | rv | bomb | orb | drone | remix, item: '' | cassette | parcel, weak }
 *   Hindernis { t: crate|moss|barrier|dusty|amp|glass|antenna|jammer|generator|shield|rolling|switch, hp, k, n, dir, need, charge, period, timer, key }
 *   Abdeckung { t: cable|ice, hp }
 *   Fallketten next/prev: Steine fallen entlang der Ketten (Spalte abwärts, Funklöcher werden übersprungen, Portale verbinden Ketten).
 *
 * Ablauf eines Zugs (swap): Tausch prüfen → Wellen (Treffer, Spezialteile, Kombinationen) → Fallen/Nachfüllen → Folge-Matches
 * → Zugende (rollende Platten, Moos, Störsender) → Sieg/Niederlage → bei Bedarf fair mischen.
 * Alle Zufallswerte kommen aus einem seedbaren Generator: gleicher Seed + gleiche Züge = gleiches Spiel.
 * Für die Grafik werden Ereignisse in this.ev gesammelt (swap, wave, fall, collect, turn, shuffle, transform).
 */
(function (root) {
  'use strict';
  var RRM = root.RRM || (root.RRM = {});
  var Rng = RRM.Rng || (typeof require === 'function' ? require('./rng.js') : null);

  var BLOCK_TYPES = ['crate', 'moss', 'barrier', 'dusty', 'amp', 'glass', 'antenna', 'jammer', 'generator', 'shield', 'rolling', 'switch'];
  var COVER_TYPES = ['cable', 'ice'];
  var ITEM_TYPES = ['cassette', 'parcel'];
  var SPECIAL_TYPES = ['rh', 'rv', 'bomb', 'orb', 'drone', 'remix'];

  function Engine(def, opt) {
    opt = opt || {};
    this.def = def;
    this.W = def.w; this.H = def.h;
    this.mode = def.mode || 'level';
    this.kinds = (def.kinds || [0, 1, 2, 3, 4, 5, 6].slice(0, def.colors || 5)).slice();
    this.rng = new Rng(def.seed || 1);
    this.idc = 1;
    this.moves = def.moves || 20;
    this.movesStart = this.moves;
    this.score = 0;
    this.goals = (def.goals || []).map(function (g) { return Object.assign({}, g); });
    this.stats = { col: [0, 0, 0, 0, 0, 0, 0], del: { cassette: 0, parcel: 0 }, specials: 0, maxCombo: 0, turns: 0, boosters: 0 };
    this.spawn = def.spawn && def.spawn.cassette ? { cols: def.spawn.cassette.cols.slice(), every: def.spawn.cassette.every, total: def.spawn.cassette.total, done: 0, cnt: {} } : null;
    this.status = 'play';
    this.amped = false;
    this.nextSwitch = 1;
    this.switchTotal = 0;
    this.ev = opt.events === false ? null : [];
    this._mossCleared = false;
    this._build(def);
    if (!opt.blank) this._fill();
    if (opt.pre) this._applyPre(opt.pre);
    this.work();
    this.ev && (this.ev.length = 0);
  }

  var P = Engine.prototype;
  P.idx = function (x, y) { return y * this.W + x; };
  P.xy = function (i) { return [i % this.W, (i / this.W) | 0]; };
  P.cell = function (x, y) { return x < 0 || y < 0 || x >= this.W || y >= this.H ? null : this.cells[y * this.W + x]; };
  P.emit = function (e) { if (this.ev) this.ev.push(e); };

  // ---------- Aufbau ----------
  P._build = function (def) {
    var W = this.W, H = this.H, self = this, i, x, y;
    this.cells = new Array(W * H);
    for (y = 0; y < H; y++) for (x = 0; x < W; x++) {
      var ch = def.mask ? def.mask[y].charAt(x) : '#';
      this.cells[y * W + x] = ch === '.' || ch === ' ' || ch === '' ? null : { p: null, b: null, c: null, n: 0 };
    }
    (def.blockers || []).forEach(function (o) {
      var c = self.cell(o.x, o.y); if (!c) throw new Error('Hindernis auf Funkloch ' + o.x + ',' + o.y);
      var b = { t: o.t, hp: o.hp || 1 };
      if (o.t === 'shield' || o.t === 'generator') b.k = o.k;
      if (o.t === 'generator') { b.need = o.need || 4; b.charge = 0; }
      if (o.t === 'amp') b.charge = 0;
      if (o.t === 'switch') { b.n = o.n; self.switchTotal = Math.max(self.switchTotal, o.n); }
      if (o.t === 'rolling') b.dir = o.dir || 1;
      if (o.t === 'jammer') { b.period = o.period || 3; b.timer = 0; }
      if (o.t === 'barrier') b.key = o.key || 'switch';
      c.b = b;
    });
    (def.covers || []).forEach(function (o) { var c = self.cell(o.x, o.y); if (c) c.c = { t: o.t, hp: o.hp || 1 }; });
    (def.noise || []).forEach(function (o) { var c = self.cell(o.x, o.y); if (c) c.n = o.hp || 1; });
    // Fallketten
    var N = W * H;
    this.next = new Int16Array(N).fill(-1); this.prev = new Int16Array(N).fill(-1); this.portalIn = new Int16Array(N).fill(-1);
    (def.portals || []).forEach(function (p) { self.portalIn[self.idx(p[0], p[1])] = self.idx(p[2], p[3]); });
    for (i = 0; i < N; i++) {
      if (!this.cells[i]) continue;
      var nx = -1;
      if (this.portalIn[i] >= 0) nx = this.portalIn[i];
      else { x = i % W; for (y = ((i / W) | 0) + 1; y < H; y++) if (this.cells[y * W + x]) { nx = y * W + x; break; } }
      if (nx >= 0 && this.prev[nx] >= 0) {   // Portal-Ausgang hat Vorrang vor dem natürlichen Nachbarn darüber
        if (this.portalIn[i] >= 0) { this.next[this.prev[nx]] = -1; } else nx = -1;
      }
      if (nx >= 0) { this.next[i] = nx; this.prev[nx] = i; }
    }
    this.chains = [];
    for (i = 0; i < N; i++) {
      if (!this.cells[i] || this.prev[i] >= 0) continue;
      var ch2 = [], j = i, guard = 0;
      while (j >= 0 && guard++ < N) { ch2.push(j); j = this.next[j]; }
      this.chains.push(ch2);
    }
    var seen = 0; this.chains.forEach(function (c) { seen += c.length; });
    var live = this.cells.filter(Boolean).length;
    if (seen !== live) throw new Error('Fallketten unvollständig (Portal-Schleife?)');
    this.chainOf = new Int16Array(N).fill(-1); this.chainPos = new Int16Array(N).fill(-1);
    this.chains.forEach(function (c, ci) { c.forEach(function (k, pos) { self.chainOf[k] = ci; self.chainPos[k] = pos; }); });
  };

  P._newPiece = function (k, s, item) { return { id: this.idc++, k: k, s: s || '', item: item || '', weak: false }; };
  P._randKind = function () { return this.kinds[this.rng.int(this.kinds.length)]; };

  P._fill = function () {
    var self = this, W = this.W, H = this.H, def = this.def, tries;
    var preset = {};
    (def.items || []).forEach(function (o) { preset[self.idx(o.x, o.y)] = { item: o.t }; });
    (def.specials || []).forEach(function (o) { preset[self.idx(o.x, o.y)] = { s: o.s, k: o.k }; });
    for (tries = 0; tries < 400; tries++) {
      for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
        var i = y * W + x, c = this.cells[i];
        if (!c) continue;
        c.p = null;
        if (c.b) continue;
        var pr = preset[i];
        if (pr && pr.item) { c.p = this._newPiece(-1, '', pr.item); continue; }
        if (pr && pr.s) { c.p = this._newPiece(pr.s === 'orb' || pr.s === 'remix' ? -1 : (pr.k != null ? pr.k : this._randKind()), pr.s); continue; }
        var ban = {}, a, b2;
        a = this.cell(x - 1, y); b2 = this.cell(x - 2, y);
        if (a && b2 && a.p && b2.p && a.p.k >= 0 && a.p.k === b2.p.k) ban[a.p.k] = 1;
        a = this.cell(x, y - 1); b2 = this.cell(x, y - 2);
        if (a && b2 && a.p && b2.p && a.p.k >= 0 && a.p.k === b2.p.k) ban[a.p.k] = 1;
        a = this.cell(x - 1, y); b2 = this.cell(x, y - 1); var d = this.cell(x - 1, y - 1);
        if (a && b2 && d && a.p && b2.p && d.p && a.p.k >= 0 && a.p.k === b2.p.k && a.p.k === d.p.k) ban[a.p.k] = 1;
        var opts = this.kinds.filter(function (k) { return !ban[k]; });
        c.p = this._newPiece(opts.length ? opts[this.rng.int(opts.length)] : this._randKind());
      }
      if (!this.findGroups().length && this.hasMoves()) return;
    }
    throw new Error('Level ' + (def.id || '?') + ': kein gültiges Startbrett');
  };

  P._applyPre = function (pre) {
    var self = this;
    pre.forEach(function (s) {
      var c = self._bareCells(function (p) { return p.s === ''; });
      if (!c.length) return;
      var i = c[self.rng.int(c.length)], p = self.cells[i].p;
      p.s = s === 'rocket' ? (self.rng.int(2) ? 'rh' : 'rv') : s;
      if (p.s === 'orb' || p.s === 'remix') p.k = -1;
    });
  };

  // Zellen mit freiem, normalem Stein (keine Abdeckung, kein Gegenstand)
  P._bareCells = function (f) {
    var out = [];
    for (var i = 0; i < this.cells.length; i++) {
      var c = this.cells[i];
      if (c && c.p && !c.c && !c.b && !c.p.item && c.p.k >= 0 && (!f || f(c.p))) out.push(i);
    }
    return out;
  };

  // ---------- Hilfsfunktionen ----------
  P.movable = function (i) { var c = this.cells[i]; return !!(c && c.p && !c.b && !c.c); };
  P.matchable = function (i) { var c = this.cells[i]; return !!(c && c.p && c.p.k >= 0 && !c.b && (!c.c || c.c.t === 'cable')); };
  P.neighbors = function (i) {
    var W = this.W, x = i % W, y = (i / W) | 0, o = [];
    if (x > 0 && this.cells[i - 1]) o.push(i - 1);
    if (x < W - 1 && this.cells[i + 1]) o.push(i + 1);
    if (y > 0 && this.cells[i - W]) o.push(i - W);
    if (y < this.H - 1 && this.cells[i + W]) o.push(i + W);
    return o;
  };
  P.adjacent = function (a, b) {
    var W = this.W, ax = a % W, ay = (a / W) | 0, bx = b % W, by = (b / W) | 0;
    return Math.abs(ax - bx) + Math.abs(ay - by) === 1;
  };

  // ---------- Matches ----------
  P.findGroups = function () {
    var W = this.W, H = this.H, cells = this.cells, self = this, x, y, i, k, e;
    var parent = {}, runs = [], squares = [];
    function find(a) { while (parent[a] !== a) { parent[a] = parent[parent[a]]; a = parent[a]; } return a; }
    function uni(a, b) { a = find(a); b = find(b); if (a !== b) parent[b] = a; }
    function add(a) { if (parent[a] === undefined) parent[a] = a; }
    for (y = 0; y < H; y++) {
      x = 0;
      while (x < W) {
        i = y * W + x;
        if (!this.matchable(i)) { x++; continue; }
        k = cells[i].p.k; e = x + 1;
        while (e < W && this.matchable(y * W + e) && cells[y * W + e].p.k === k) e++;
        if (e - x >= 3) { var r = []; for (var q = x; q < e; q++) r.push(y * W + q); runs.push({ d: 'h', k: k, c: r }); }
        x = e;
      }
    }
    for (x = 0; x < W; x++) {
      y = 0;
      while (y < H) {
        i = y * W + x;
        if (!this.matchable(i)) { y++; continue; }
        k = cells[i].p.k; e = y + 1;
        while (e < H && this.matchable(e * W + x) && cells[e * W + x].p.k === k) e++;
        if (e - y >= 3) { var r2 = []; for (var q2 = y; q2 < e; q2++) r2.push(q2 * W + x); runs.push({ d: 'v', k: k, c: r2 }); }
        y = e;
      }
    }
    for (y = 0; y < H - 1; y++) for (x = 0; x < W - 1; x++) {
      i = y * W + x;
      var sq = [i, i + 1, i + W, i + W + 1];
      if (!sq.every(function (j) { return self.matchable(j); })) continue;
      k = cells[i].p.k;
      if (sq.every(function (j) { return cells[j].p.k === k; })) squares.push({ k: k, c: sq });
    }
    if (!runs.length && !squares.length) return [];
    runs.concat(squares).forEach(function (r) { r.c.forEach(add); for (var j = 1; j < r.c.length; j++) uni(r.c[0], r.c[j]); });
    var groups = {}, order = [];
    function grp(a) { var rt = find(a); if (!groups[rt]) { groups[rt] = { cells: [], set: {}, k: cells[a].p.k, runs: [], sq: 0 }; order.push(rt); } return groups[rt]; }
    Object.keys(parent).forEach(function (a) { a = +a; var g = grp(a); g.cells.push(a); g.set[a] = 1; });
    runs.forEach(function (r) { grp(r.c[0]).runs.push(r); });
    squares.forEach(function (s) { grp(s.c[0]).sq++; });
    return order.map(function (rt) { var g = groups[rt]; g.cells.sort(function (a, b) { return a - b; }); return g; })
      .sort(function (a, b) { return a.cells[0] - b.cells[0]; });
  };

  // Welches Spezialteil entsteht aus einer Gruppe?
  P.specialOf = function (g) {
    var max = 0, hasH = false, hasV = false;
    g.runs.forEach(function (r) { max = Math.max(max, r.c.length); if (r.d === 'h') hasH = true; else hasV = true; });
    if (max >= 6) return 'remix';
    if (max === 5) return 'orb';
    if (hasH && hasV) return g.cells.length >= 7 ? 'remix' : 'bomb';
    if (max === 4) { var r4 = g.runs.filter(function (r) { return r.c.length === 4; })[0]; return r4.d === 'h' ? 'rh' : 'rv'; }
    if (g.sq) return 'drone';
    return '';
  };

  P._spawnCell = function (g, prefer) {
    var self = this, cand = g.cells.filter(function (i) { return !self.cells[i].c; });
    if (!cand.length) return -1;
    for (var j = 0; prefer && j < prefer.length; j++) if (cand.indexOf(prefer[j]) >= 0) return prefer[j];
    var h = g.runs.filter(function (r) { return r.d === 'h'; }), v = g.runs.filter(function (r) { return r.d === 'v'; });
    if (h.length && v.length) {
      for (var a = 0; a < h.length; a++) for (var b = 0; b < v.length; b++) {
        var x = h[a].c.filter(function (i) { return v[b].c.indexOf(i) >= 0; })[0];
        if (x !== undefined && cand.indexOf(x) >= 0) return x;
      }
    }
    var longest = g.runs.slice().sort(function (a, b) { return b.c.length - a.c.length; })[0];
    if (longest) { var mid = longest.c[(longest.c.length - 1) >> 1]; if (cand.indexOf(mid) >= 0) return mid; }
    return cand[0];
  };

  // Liegt Zelle i in einer Dreierreihe oder einem 2×2-Quadrat?
  P.localMatch = function (i) {
    if (!this.matchable(i)) return false;
    var W = this.W, H = this.H, x = i % W, y = (i / W) | 0, k = this.cells[i].p.k, self = this;
    function same(xx, yy) { if (xx < 0 || yy < 0 || xx >= W || yy >= H) return false; var j = yy * W + xx; return self.matchable(j) && self.cells[j].p.k === k; }
    var n = 1, t;
    for (t = x - 1; same(t, y); t--) n++;
    for (t = x + 1; same(t, y); t++) n++;
    if (n >= 3) return true;
    n = 1;
    for (t = y - 1; same(x, t); t--) n++;
    for (t = y + 1; same(x, t); t++) n++;
    if (n >= 3) return true;
    for (var dy = -1; dy <= 0; dy++) for (var dx = -1; dx <= 0; dx++) {
      if (same(x + dx, y + dy) && same(x + dx + 1, y + dy) && same(x + dx, y + dy + 1) && same(x + dx + 1, y + dy + 1)) return true;
    }
    return false;
  };

  P.isValidSwap = function (a, b) {
    if (!this.cells[a] || !this.cells[b] || !this.adjacent(a, b) || !this.movable(a) || !this.movable(b)) return false;
    var pa = this.cells[a].p, pb = this.cells[b].p;
    if (pa.s || pb.s) return true;
    if (pa.item && pb.item) return false;
    this.cells[a].p = pb; this.cells[b].p = pa;
    var ok = this.localMatch(a) || this.localMatch(b);
    this.cells[a].p = pa; this.cells[b].p = pb;
    return ok;
  };

  P.findMoves = function (limit) {
    var out = [], W = this.W;
    for (var i = 0; i < this.cells.length; i++) {
      if (!this.movable(i)) continue;
      var x = i % W;
      if (x < W - 1 && this.isValidSwap(i, i + 1)) { out.push([i, i + 1]); if (limit && out.length >= limit) return out; }
      if (i + W < this.cells.length && this.isValidSwap(i, i + W)) { out.push([i, i + W]); if (limit && out.length >= limit) return out; }
    }
    return out;
  };
  P.hasMoves = function () { return this.findMoves(1).length > 0; };

  // ---------- Treffer ----------
  P._wave = function () { return { fx: [], removed: [], dirty: {}, spawned: [], transformed: [], hits: [], q: [], targeted: {}, blocks: 0 }; };

  P._remove = function (i, w) {
    var c = this.cells[i], p = c.p;
    if (!p || p.item) return false;
    c.p = null;
    w.removed.push({ id: p.id, i: i, k: p.k, s: p.s });
    if (p.k >= 0) this.stats.col[p.k]++;
    if (p.s) w.q.push({ s: p.s, i: i, k: p.k, weak: p.weak });
    if (c.n > 0) { c.n--; w.dirty[i] = 1; }
    return true;
  };

  P._hit = function (i, w, src, k) {
    var c = this.cells[i];
    if (!c) return;
    if (src !== 'adj') w.hits.push(i);
    if (c.b) { this._damage(i, w, src, k); return; }
    if (!c.p) return;
    if (c.c) {
      if (src === 'adj' && c.c.t !== 'ice') return;
      c.c.hp--; w.dirty[i] = 1;
      if (c.c.hp <= 0) { c.c = null; w.blocks++; }
      return;
    }
    if (src === 'adj') return;
    this._remove(i, w);
  };

  P._damage = function (i, w, src, k) {
    var c = this.cells[i], b = c.b, gone = false;
    switch (b.t) {
      case 'barrier': return;
      case 'switch':
        if (b.n !== this.nextSwitch) return;
        gone = true; this.nextSwitch++; break;
      case 'shield':
        if (src === 'adj' && k !== b.k) return;
        gone = --b.hp <= 0; break;
      case 'generator':
        if (src === 'adj' && k !== b.k) return;
        b.charge++; gone = b.charge >= b.need; break;
      case 'amp':
        b.charge++;
        if (b.charge >= 3) { gone = true; w.q.push({ s: 'blast1', i: i }); }
        break;
      case 'antenna':
        if (--b.hp <= 0) { gone = true; w.q.push({ s: 'beam', i: i }); }
        break;
      case 'moss':
        gone = --b.hp <= 0; if (gone) this._mossCleared = true; break;
      default:
        gone = --b.hp <= 0;
    }
    w.dirty[i] = 1;
    if (!gone) return;
    c.b = null; w.blocks++;
    if (b.t === 'glass') { c.p = this._newPiece(-1, '', 'parcel'); w.spawned.push({ id: c.p.id, i: i, piece: c.p }); }
    if (b.t === 'switch' && this.nextSwitch > this.switchTotal) this._lift('switch', w);
    if (b.t === 'generator' && !this.count('generator')) this._lift('generator', w);
  };

  P._lift = function (key, w) {
    for (var i = 0; i < this.cells.length; i++) {
      var c = this.cells[i];
      if (c && c.b && c.b.t === 'barrier' && c.b.key === key) { c.b = null; w.dirty[i] = 1; w.fx.push({ t: 'lift', i: i }); }
    }
  };

  P.mostCommon = function () {
    var n = [0, 0, 0, 0, 0, 0, 0], best = -1, bc = 0;
    for (var i = 0; i < this.cells.length; i++) { var c = this.cells[i]; if (c && c.p && c.p.k >= 0 && !c.b && !c.p.s) n[c.p.k]++; }
    for (var k = 0; k < 7; k++) if (n[k] > bc) { bc = n[k]; best = k; }
    return best;
  };

  // Ziele für Funkdrohne und Sendersuchlauf: erst offene Levelziele, dann Hindernisse, dann beliebige Steine
  P._targets = function (n, w) {
    var self = this, tiers = [[], [], []], open = this.openNeeds();
    for (var i = 0; i < this.cells.length; i++) {
      var c = this.cells[i];
      if (!c || w.targeted[i]) continue;
      if (c.b) {
        if (c.b.t === 'barrier' || (c.b.t === 'switch' && c.b.n !== this.nextSwitch)) continue;
        (open.block[c.b.t] ? tiers[0] : tiers[1]).push(i);
      } else if (c.p) {
        if (c.c) (open.cover[c.c.t] ? tiers[0] : tiers[1]).push(i);
        else if (c.p.item) continue;
        else if (open.noise && c.n > 0) tiers[0].push(i);
        else if (c.p.k >= 0 && open.col[c.p.k] && !c.p.s) tiers[0].push(i);
        else if (!c.p.s) tiers[2].push(i);
      }
    }
    var out = [];
    for (var t = 0; t < 3 && out.length < n; t++) {
      var list = tiers[t];
      while (list.length && out.length < n) {
        var j = list.splice(this.rng.int(list.length), 1)[0];
        out.push(j); w.targeted[j] = 1;
      }
    }
    return out;
  };

  P.openNeeds = function () {
    var o = { block: {}, cover: {}, noise: false, col: {} }, self = this;
    this.goals.forEach(function (g) {
      if (self.goalLeft(g) <= 0) return;
      if (g.type === 'clear') { if (g.what === 'noise') o.noise = true; else if (COVER_TYPES.indexOf(g.what) >= 0) o.cover[g.what] = 1; else o.block[g.what] = 1; }
      if (g.type === 'collect') o.col[g.k] = 1;
      if (g.type === 'deliver' && g.what === 'parcel') o.block.glass = 1;
    });
    return o;
  };

  P._area = function (i, f) {
    var W = this.W, H = this.H, x0 = i % W, y0 = (i / W) | 0, out = [];
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) if (this.cells[y * W + x] && f(x - x0, y - y0, x, y)) out.push(y * W + x);
    return out;
  };

  P._act = function (a, w) {
    var self = this, i = a.i, cells, W = this.W;
    var hitAll = function (list) { list.forEach(function (j) { if (j !== i || a.self) self._hit(j, w, 'special'); }); };
    switch (a.s) {
      case 'rh': w.fx.push({ t: 'row', i: i }); hitAll(this._area(i, function (dx, dy) { return dy === 0; })); break;
      case 'rv': w.fx.push({ t: 'col', i: i }); hitAll(this._area(i, function (dx) { return dx === 0; })); break;
      case 'beam': w.fx.push({ t: 'row', i: i, beam: true }); hitAll(this._area(i, function (dx, dy) { return dy === 0; })); break;
      case 'bomb':
        if (a.weak) { w.fx.push({ t: 'blast', i: i, r: 1 }); hitAll(this._area(i, function (dx, dy) { return Math.abs(dx) <= 1 && Math.abs(dy) <= 1; })); }
        else { w.fx.push({ t: 'blast', i: i, r: 2 }); hitAll(this._area(i, function (dx, dy) { return Math.abs(dx) <= 2 && Math.abs(dy) <= 2 && Math.abs(dx) + Math.abs(dy) <= 3; })); }
        break;
      case 'blast1': w.fx.push({ t: 'blast', i: i, r: 1 }); hitAll(this._area(i, function (dx, dy) { return Math.abs(dx) <= 1 && Math.abs(dy) <= 1; })); break;
      case 'orb':
        var k = a.target != null && a.target >= 0 ? a.target : this.mostCommon();
        cells = k < 0 ? [] : this._area(i, function (dx, dy, x, y) { var c = self.cells[y * W + x]; return c.p && !c.b && c.p.k === k && !c.p.item; });
        w.fx.push({ t: 'orb', i: i, k: k, to: cells });
        hitAll(cells); break;
      case 'drone':
        var tg = this._targets(1, w)[0];
        w.fx.push({ t: 'drone', i: i, to: tg == null ? i : tg });
        this.neighbors(i).forEach(function (j) { self._hit(j, w, 'special'); });
        if (tg != null) { if (a.payload) w.q.push({ s: a.payload, i: tg, k: a.k, self: true }); else this._hit(tg, w, 'special'); }
        break;
      case 'drones3': for (var d = 0; d < 3; d++) w.q.push({ s: 'drone', i: i, k: a.k }); break;
      case 'remix': case 'wide':
        w.fx.push({ t: 'cross', i: i, wide: 1 }); hitAll(this._area(i, function (dx, dy) { return Math.abs(dx) <= 1 || Math.abs(dy) <= 1; })); break;
      case 'cross': w.fx.push({ t: 'cross', i: i, wide: 0 }); hitAll(this._area(i, function (dx, dy) { return dx === 0 || dy === 0; })); break;
      case 'bigbomb': w.fx.push({ t: 'blast', i: i, r: 3 }); hitAll(this._area(i, function (dx, dy) { return Math.abs(dx) <= 3 && Math.abs(dy) <= 3; })); break;
      case 'mega': w.fx.push({ t: 'blast', i: i, r: 2 }); w.fx.push({ t: 'cross', i: i, wide: 1 });
        hitAll(this._area(i, function (dx, dy) { return (Math.abs(dx) <= 2 && Math.abs(dy) <= 2) || Math.abs(dx) <= 1 || Math.abs(dy) <= 1; })); break;
      case 'board': w.fx.push({ t: 'board', i: i }); hitAll(this._area(i, function () { return true; })); break;
      case 'convert':
        var conv = this._bareCells(function (p) { return p.s === '' && p.k === a.k; });
        w.fx.push({ t: 'orb', i: i, k: a.k, to: conv });
        conv.forEach(function (j) {
          var p = self.cells[j].p;
          p.s = a.into === 'rocket' ? (self.rng.int(2) ? 'rh' : 'rv') : a.into;
          if (a.into === 'bomb') p.weak = true;
          w.transformed.push({ id: p.id, i: j, piece: { k: p.k, s: p.s, item: '' } });
        });
        conv.forEach(function (j) { self._hit(j, w, 'special'); });
        break;
    }
  };

  P._runQueue = function (w) {
    var guard = 0;
    while (w.q.length && guard++ < 4000) this._act(w.q.shift(), w);
  };

  P._groupsWave = function (groups, w, prefer) {
    var self = this, spawns = [];
    groups.forEach(function (g) {
      var sp = self.specialOf(g), at = sp ? self._spawnCell(g, prefer) : -1;
      g.cells.forEach(function (i) { self._hit(i, w, 'match', g.k); });
      var adj = {};
      g.cells.forEach(function (i) { self.neighbors(i).forEach(function (n) { if (!g.set[n]) adj[n] = 1; }); });
      Object.keys(adj).forEach(function (n) { self._hit(+n, w, 'adj', g.k); });
      if (sp && at >= 0) { spawns.push({ i: at, s: sp, k: sp === 'orb' || sp === 'remix' ? -1 : g.k }); self.stats.specials++; }
    });
    return spawns;
  };

  P._place = function (spawns, w) {
    var self = this;
    spawns.forEach(function (s) {
      var c = self.cells[s.i];
      if (c.p || c.b) return;
      c.p = self._newPiece(s.k, s.s);
      w.spawned.push({ id: c.p.id, i: s.i, piece: c.p });
    });
  };

  // Wellen auflösen, bis das Brett stabil ist. seed(w) befüllt die erste Welle (Tausch, Booster) und liefert Spawns.
  P._resolve = function (seed) {
    var combo = 0, guard = 0;
    while (guard++ < 120) {
      var w = this._wave(), spawns;
      if (seed) { spawns = seed.call(this, w) || []; seed = null; }
      else {
        var groups = this.findGroups();
        if (!groups.length) break;
        spawns = this._groupsWave(groups, w, null);
      }
      this._runQueue(w);
      this._place(spawns, w);
      var gain = Math.round(w.removed.length * 20 * (1 + combo * 0.5)) + w.blocks * 80 + w.spawned.length * 40;
      this.score += gain;
      combo++;
      this.stats.maxCombo = Math.max(this.stats.maxCombo, combo);
      this.emit({ e: 'wave', combo: combo, gain: gain, fx: w.fx, removed: w.removed, dirty: Object.keys(w.dirty).map(Number), spawned: w.spawned, transformed: w.transformed, hits: w.hits });
      if (this.dry) return combo;   // Vorschau ohne Nachfüllen (Solver/Hinweis: kein Blick in den Zufall)
      this._settle();
    }
    return combo;
  };

  // Fallen, Nachfüllen und Ausliefern von Gegenständen, bis nichts mehr passiert
  P._settle = function () {
    for (var g = 0; g < 40; g++) {
      this.gravity();
      var col = [];
      for (var i = 0; i < this.cells.length; i++) {
        var c = this.cells[i];
        if (c && this.next[i] < 0 && c.p && c.p.item && !c.b) {
          col.push({ id: c.p.id, i: i, item: c.p.item });
          this.stats.del[c.p.item]++; this.score += 200; c.p = null;
        }
      }
      if (!col.length) return;
      this.emit({ e: 'collect', items: col });
    }
  };

  // ---------- Schwerkraft ----------
  P.gravity = function () {
    var origin = {}, portal = {}, spawnFrom = {}, self = this;
    for (var it = 0; it < this.cells.length * 2 + 4; it++) {
      this._compact(origin, portal, spawnFrom);
      if (!this._diagonal(origin)) break;
    }
    var moves = [];
    for (var i = 0; i < this.cells.length; i++) {
      var c = this.cells[i];
      if (!c || !c.p) continue;
      var id = c.p.id;
      if (spawnFrom[id]) moves.push({ id: id, from: spawnFrom[id], to: i, piece: c.p, isNew: true });
      else if (origin[id] !== undefined && origin[id] !== i) { var o = this.xy(origin[id]); moves.push({ id: id, from: o, to: i, portal: !!portal[id] }); }
    }
    if (moves.length) this.emit({ e: 'fall', moves: moves });
    return moves.length;
  };

  P._fixed = function (i) { var c = this.cells[i]; return !!(c.b || c.c); };

  P._compact = function (origin, portal, spawnFrom) {
    var self = this;
    this.chains.forEach(function (ch) {
      var s = 0;
      while (s < ch.length) {
        if (self._fixed(ch[s])) { s++; continue; }
        var e = s; while (e < ch.length && !self._fixed(ch[e])) e++;
        // Segment ch[s..e-1]
        var pcs = [];
        for (var j = s; j < e; j++) { var c = self.cells[ch[j]]; if (c.p) { pcs.push({ p: c.p, from: j }); c.p = null; } }
        var slot = e - 1;
        for (var q = pcs.length - 1; q >= 0; q--, slot--) {
          var cell = ch[slot], pc = pcs[q];
          self.cells[cell].p = pc.p;
          if (pc.from !== slot) {
            if (origin[pc.p.id] === undefined && !spawnFrom[pc.p.id]) origin[pc.p.id] = ch[pc.from];
            for (var t = pc.from; t < slot; t++) if (self.portalIn[ch[t]] >= 0) portal[pc.p.id] = 1;
          }
        }
        if (s === 0) {   // Segment beginnt am Kettenkopf: von oben nachfüllen
          var empty = slot - s + 1, head = self.xy(ch[0]);
          for (var r = slot; r >= s; r--) {
            var np = self._spawnPiece(head[0]);
            self.cells[ch[r]].p = np;
            spawnFrom[np.id] = [head[0], head[1] - (empty - (r - s))];
          }
        }
        s = e;
      }
    });
  };

  P._spawnPiece = function (x) {
    var sp = this.spawn;
    if (sp && sp.done < sp.total && sp.cols.indexOf(x) >= 0) {
      sp.cnt[x] = (sp.cnt[x] || 0) + 1;
      if (sp.cnt[x] % sp.every === 0) { sp.done++; return this._newPiece(-1, '', 'cassette'); }
    }
    return this._newPiece(this._randKind());
  };

  // Seitliches Nachrutschen in Lücken unter festen Hindernissen
  P._diagonal = function (origin) {
    var W = this.W;
    for (var y = this.H - 1; y > 0; y--) for (var x = 0; x < W; x++) {
      var i = y * W + x, c = this.cells[i];
      if (!c || c.p || c.b) continue;
      var src = [x - 1, x + 1];
      for (var s = 0; s < 2; s++) {
        var sx = src[s];
        if (sx < 0 || sx >= W) continue;
        var j = (y - 1) * W + sx, d = this.cells[j];
        if (!d || !d.p || d.b || d.c) continue;
        var below = this.next[j];
        if (below >= 0 && !this.cells[below].p && !this._fixed(below)) continue;   // fällt erst gerade nach unten
        if (origin[d.p.id] === undefined) origin[d.p.id] = j;
        c.p = d.p; d.p = null;
        return true;
      }
    }
    return false;
  };

  // ---------- Spielerzüge ----------
  P.swap = function (a, b) {
    if (this.status !== 'play') return { ok: false, reason: 'ended' };
    if (!this.cells[a] || !this.cells[b] || !this.adjacent(a, b) || !this.movable(a) || !this.movable(b)) return { ok: false, reason: 'blocked' };
    var ca = this.cells[a], cb = this.cells[b], pa = ca.p, pb = cb.p;
    if (!this.isValidSwap(a, b)) { this.emit({ e: 'swap', a: a, b: b, ok: false, ids: [pa.id, pb.id] }); return { ok: false, reason: 'nomatch' }; }
    ca.p = pb; cb.p = pa;
    this.emit({ e: 'swap', a: a, b: b, ok: true, ids: [pa.id, pb.id] });
    this.moves--; this.stats.turns++;
    this._mossCleared = false;
    var self = this, amp = this.amped; this.amped = false;
    var before = this.score;
    this._resolve(function (w) {
      var spawns = [];
      if (pa.s && pb.s) {   // Kombination zweier Spezialteile am Zielfeld b
        ca.p = null; cb.p = null;
        w.removed.push({ id: pa.id, i: b, k: pa.k, s: pa.s }, { id: pb.id, i: a, k: pb.k, s: pb.s });
        w.q.push(self._combo(pa, pb, b));
      } else if (pa.s || pb.s) {
        var sp = pa.s ? pa : pb, at = pa.s ? b : a, other = pa.s ? pb : pa;
        if (sp.s === 'orb') { self.cells[at].p = null; w.removed.push({ id: sp.id, i: at, k: -1, s: 'orb' }); w.q.push({ s: 'orb', i: at, target: other.k }); }
        else self._remove(at, w);
      } else spawns = self._groupsWave(self.findGroups(), w, [b, a]);
      if (amp) w.q.push({ s: 'blast1', i: b, self: true });
      return spawns;
    });
    if (this.dry) return { ok: true };
    this._endTurn();
    this.lastGain = this.score - before;
    this._check();
    return { ok: true };
  };

  P._combo = function (pa, pb, at) {
    var T = function (p) { return p.s === 'rh' || p.s === 'rv' ? 'R' : p.s === 'bomb' ? 'B' : p.s === 'orb' ? 'O' : p.s === 'drone' ? 'D' : 'X'; };
    var A = T(pa), B = T(pb), key = [A, B].sort().join(''), col = function (t) { return (T(pa) === t ? pa : pb).k; };
    var rocket = T(pa) === 'R' ? pa : pb;
    switch (key) {
      case 'OO': case 'OX': case 'XX': return { s: 'board', i: at, self: true };
      case 'OR': return { s: 'convert', i: at, k: col('R'), into: 'rocket' };
      case 'BO': return { s: 'convert', i: at, k: col('B'), into: 'bomb' };
      case 'DO': return { s: 'convert', i: at, k: col('D'), into: 'drone' };
      case 'RX': case 'BX': case 'DX': return { s: 'mega', i: at, self: true };
      case 'RR': return { s: 'cross', i: at, self: true };
      case 'BR': return { s: 'wide', i: at, self: true };
      case 'BB': return { s: 'bigbomb', i: at, self: true };
      case 'DR': return { s: 'drone', i: at, payload: rocket.s, k: rocket.k };
      case 'BD': return { s: 'drone', i: at, payload: 'bomb' };
      case 'DD': return { s: 'drones3', i: at };
    }
    return { s: 'cross', i: at, self: true };
  };

  P._endTurn = function () {
    var self = this, rolls = [], dirty = {}, removed = [], fx = [];
    // Rollende Platten
    var rolling = [];
    for (var i = 0; i < this.cells.length; i++) if (this.cells[i] && this.cells[i].b && this.cells[i].b.t === 'rolling') rolling.push(i);
    rolling.forEach(function (i) {
      var c = self.cells[i], b = c.b, x = i % self.W, nx = x + b.dir;
      var j = i + b.dir, t = nx >= 0 && nx < self.W ? self.cells[j] : null;
      if (t && t.p && !t.b && !t.c && !t.p.item && !t.n) {
        var p = t.p; t.p = null; t.b = b; c.b = null; c.p = p;
        rolls.push({ from: i, to: j, id: p.id }); dirty[i] = 1; dirty[j] = 1;
      } else { b.dir = -b.dir; dirty[i] = 1; }
    });
    // Moos wächst, wenn in diesem Zug keins entfernt wurde
    if (!this._mossCleared && this.count('moss')) {
      var cand = {};
      for (var m = 0; m < this.cells.length; m++) {
        var mc = this.cells[m];
        if (!mc || !mc.b || mc.b.t !== 'moss') continue;
        this.neighbors(m).forEach(function (n) { var nc = self.cells[n]; if (nc.p && !nc.b && !nc.c && !nc.p.item && !nc.p.s && nc.p.k >= 0) cand[n] = 1; });
      }
      var list = Object.keys(cand).map(Number).sort(function (a, b) { return a - b; });
      if (list.length) {
        var g = list[this.rng.int(list.length)], gc = this.cells[g];
        removed.push({ id: gc.p.id, i: g, k: gc.p.k, s: '' });
        gc.p = null; gc.b = { t: 'moss', hp: 1 }; dirty[g] = 1; fx.push({ t: 'moss', i: g });
      }
    }
    // Störsender verteilen Rauschen
    for (var q = 0; q < this.cells.length; q++) {
      var jc = this.cells[q];
      if (!jc || !jc.b || jc.b.t !== 'jammer') continue;
      if (++jc.b.timer < jc.b.period) continue;
      jc.b.timer = 0;
      var free = [];
      for (var f = 0; f < this.cells.length; f++) { var fc = this.cells[f]; if (fc && fc.p && !fc.b && !fc.n) free.push(f); }
      if (free.length) { var tgt = free[this.rng.int(free.length)]; this.cells[tgt].n = 1; dirty[tgt] = 1; fx.push({ t: 'jam', i: q, to: tgt }); }
    }
    if (rolls.length || removed.length || fx.length || Object.keys(dirty).length) this.emit({ e: 'turn', rolls: rolls, removed: removed, dirty: Object.keys(dirty).map(Number), fx: fx });
    if (rolls.length) this._resolve(null);
  };

  P._check = function () {
    if (this.mode === 'duel') { this._ensureMoves(); return; }
    if (this.goalsMet()) { this.status = 'won'; this.emit({ e: 'end', won: true }); return; }
    if (this.moves <= 0) { this.status = 'lost'; this.emit({ e: 'end', won: false }); return; }
    this._ensureMoves();
  };

  P._ensureMoves = function () {
    if (this.status === 'play' && !this.hasMoves()) this.shuffle(false);
  };

  // Faires, reproduzierbares Mischen: nur freie normale Steine, Spezialteile bleiben liegen
  P.shuffle = function (manual) {
    var self = this, cells = this._bareCells(function (p) { return p.s === ''; });
    if (cells.length < 3) return false;
    var pieces = cells.map(function (i) { return self.cells[i].p; }), t, ok = false;
    for (t = 0; t < 80 && !ok; t++) {
      this.rng.shuffle(pieces);
      cells.forEach(function (i, j) { self.cells[i].p = pieces[j]; });
      ok = !this.findGroups().length && this.hasMoves();
    }
    for (t = 0; t < 200 && !ok; t++) {
      cells.forEach(function (i) { self.cells[i].p.k = self._randKind(); });
      ok = !this.findGroups().length && this.hasMoves();
    }
    if (!ok) {   // letzter Ausweg: eine Bassbombe garantiert einen Zug
      var i0 = cells[this.rng.int(cells.length)];
      this.cells[i0].p.s = 'bomb';
    }
    this.emit({ e: 'shuffle', manual: !!manual, pos: cells.map(function (i) { var p = self.cells[i].p; return { id: p.id, i: i, piece: { k: p.k, s: p.s, item: p.item } }; }) });
    if (!ok && this.findGroups().length) this._resolve(null);
    return true;
  };

  // ---------- Booster ----------
  P.useBooster = function (id, target) {
    if (this.status !== 'play') return { ok: false, reason: 'ended' };
    var self = this, c = target != null ? this.cells[target] : null;
    var cellBooster = { hammer: 1, laser: 1, blitz: 1, bass: 1 };
    if (cellBooster[id] && !c) return { ok: false, reason: 'target' };
    if (id === 'hammer' && !(c.b ? c.b.t !== 'barrier' && !(c.b.t === 'switch' && c.b.n !== this.nextSwitch) : c.p && !c.p.item)) return { ok: false, reason: 'target' };
    if (id === 'boost' && this.amped) return { ok: false, reason: 'active' };
    var before = this.score;
    switch (id) {
      case 'hammer': this._resolve(function (w) { w.fx.push({ t: 'hammer', i: target }); self._hit(target, w, 'special'); }); break;
      case 'laser': this._resolve(function (w) { w.q.push({ s: 'rh', i: target, self: true }); }); break;
      case 'blitz': this._resolve(function (w) { w.q.push({ s: 'rv', i: target, self: true }); }); break;
      case 'bass': this._resolve(function (w) { w.q.push({ s: 'blast1', i: target, self: true }); }); break;
      case 'scan': this._resolve(function (w) { var t = self._targets(3, w); w.fx.push({ t: 'scan', to: t }); t.forEach(function (j) { self._hit(j, w, 'special'); }); }); break;
      case 'shuffle': if (!this.shuffle(true)) return { ok: false, reason: 'none' }; break;
      case 'boost': this.amped = true; break;
      case 'rescue':
        var col = this.goals.filter(function (g) { return g.type === 'collect' && self.goalLeft(g) > 0; })[0];
        var w0 = this._wave();
        if (col) {
          var cand = this._bareCells(function (p) { return p.s === '' && p.k !== col.k; });
          for (var n = 0; n < 5 && cand.length; n++) {
            var j = cand.splice(this.rng.int(cand.length), 1)[0], p = this.cells[j].p;
            p.k = col.k; w0.transformed.push({ id: p.id, i: j, piece: { k: p.k, s: '', item: '' } });
          }
        } else {
          var cr = this._bareCells(function (p) { return p.s === ''; });
          if (!cr.length) return { ok: false, reason: 'none' };
          var r = cr[this.rng.int(cr.length)], rp = this.cells[r].p;
          rp.s = this.rng.int(2) ? 'rh' : 'rv'; w0.transformed.push({ id: rp.id, i: r, piece: { k: rp.k, s: rp.s, item: '' } });
        }
        if (!w0.transformed.length) return { ok: false, reason: 'none' };
        this.emit({ e: 'transform', list: w0.transformed });
        this._resolve(null);
        break;
      default: return { ok: false, reason: 'unknown' };
    }
    this.stats.boosters++;
    this.lastGain = this.score - before;
    if (this.mode !== 'duel' && this.goalsMet()) { this.status = 'won'; this.emit({ e: 'end', won: true }); }
    else this._ensureMoves();
    return { ok: true };
  };

  P.addMoves = function (n) {
    if (this.status !== 'lost') return false;
    this.moves += n; this.status = 'play'; this.continued = true; this._ensureMoves();
    return true;
  };

  // ---------- Ziele ----------
  P.count = function (what) {
    var n = 0;
    for (var i = 0; i < this.cells.length; i++) {
      var c = this.cells[i];
      if (!c) continue;
      if (what === 'noise') { if (c.n > 0) n++; }
      else if (COVER_TYPES.indexOf(what) >= 0) { if (c.c && c.c.t === what) n++; }
      else if (c.b && c.b.t === what) n++;
    }
    return n;
  };
  P.goalLeft = function (g) {
    switch (g.type) {
      case 'collect': return Math.max(0, g.n - this.stats.col[g.k]);
      case 'clear': return this.count(g.what);
      case 'deliver': return Math.max(0, g.n - this.stats.del[g.what]);
      case 'score': return Math.max(0, g.n - this.score);
      case 'specials': return Math.max(0, g.n - this.stats.specials);
      case 'combo': return Math.max(0, g.n - this.stats.maxCombo);
    }
    return 0;
  };
  P.goalsMet = function () {
    if (!this.goals.length) return false;
    for (var i = 0; i < this.goals.length; i++) if (this.goalLeft(this.goals[i]) > 0) return false;
    return true;
  };
  P.stars = function () {
    if (this.status !== 'won') return 0;
    if (this.continued) return 1;
    var r = this.moves / Math.max(1, this.movesStart);
    return 1 + (r >= 0.12 ? 1 : 0) + (r >= 0.3 ? 1 : 0);
  };
  P.endBonus = function () { return this.status === 'won' ? this.moves * 120 : 0; };

  // ---------- Bewertung (Hinweis-Knopf, Solver, Duell-KI) ----------
  // Verbleibende Arbeit je Ziel, 0 = alles erfüllt (berücksichtigt Lagen/Ladung, nicht nur die Anzahl)
  P._clearWork = function (what) {
    var w = 0;
    for (var i = 0; i < this.cells.length; i++) {
      var c = this.cells[i];
      if (!c) continue;
      if (what === 'noise') w += c.n;
      else if (COVER_TYPES.indexOf(what) >= 0) { if (c.c && c.c.t === what) w += c.c.hp; }
      else if (c.b && c.b.t === what) w += what === 'amp' ? 3 - c.b.charge : what === 'generator' ? c.b.need - c.b.charge : what === 'switch' ? 1 : c.b.hp;
    }
    return w;
  };
  P._itemDist = function (what) {
    var d = 0;
    for (var i = 0; i < this.cells.length; i++) {
      var c = this.cells[i];
      if (c && c.p && c.p.item === what) d += this.chains[this.chainOf[i]].length - 1 - this.chainPos[i] + 1;
    }
    return d;
  };
  P.work = function () {
    var self = this, tot = 0;
    if (!this._w0) this._w0 = this.goals.map(function (g) { return g.type === 'clear' ? Math.max(1, self._clearWork(g.what)) : 0; });
    this.goals.forEach(function (g, gi) {
      var w, base;
      if (g.type === 'clear') { w = self._clearWork(g.what); base = self._w0[gi]; }
      else if (g.type === 'deliver') { w = self.goalLeft(g) + self._itemDist(g.what) * 0.12; base = g.n * (1 + self.H * 0.12); }
      else { w = self.goalLeft(g); base = g.n; }
      tot += Math.min(1.5, w / Math.max(1, base));
    });
    return tot;
  };
  P.value = function () {
    if (this.status === 'won') return 1e7 + this.moves * 1000;
    var sp = 0;
    for (var i = 0; i < this.cells.length; i++) { var c = this.cells[i]; if (c && c.p && c.p.s) sp += c.p.s === 'orb' || c.p.s === 'remix' ? 2 : 1; }
    return -this.work() * 1000 + sp * 14 + this.score * 0.002;
  };
  // Bester Zug nach einer Vorschau ohne Nachfüllen (schaut nicht in den Zufall)
  P.rankMoves = function (scoreOnly) {
    var self = this, base = this.value();
    return this.findMoves().map(function (m) {
      var c = self.clone(); c.dry = true; c.swap(m[0], m[1]);
      return { m: m, v: scoreOnly ? c.score - self.score : c.value() - base };
    }).sort(function (a, b) { return b.v - a.v || a.m[0] - b.m[0]; });
  };
  P.bestMove = function () { var r = this.rankMoves(); return r.length ? r[0].m : null; };

  // ---------- Kopie (Solver) und Prüfsumme ----------
  P.clone = function () {
    var e = Object.create(Engine.prototype), k;
    for (k in this) if (Object.prototype.hasOwnProperty.call(this, k)) e[k] = this[k];
    e.cells = this.cells.map(function (c) {
      return c && { p: c.p && { id: c.p.id, k: c.p.k, s: c.p.s, item: c.p.item, weak: c.p.weak }, b: c.b && Object.assign({}, c.b), c: c.c && { t: c.c.t, hp: c.c.hp }, n: c.n };
    });
    e.rng = new Rng(1); e.rng.s = this.rng.s;
    e.stats = { col: this.stats.col.slice(), del: { cassette: this.stats.del.cassette, parcel: this.stats.del.parcel }, specials: this.stats.specials, maxCombo: this.stats.maxCombo, turns: this.stats.turns, boosters: this.stats.boosters };
    e.spawn = this.spawn && { cols: this.spawn.cols, every: this.spawn.every, total: this.spawn.total, done: this.spawn.done, cnt: Object.assign({}, this.spawn.cnt) };
    e.ev = null;
    return e;
  };
  P.hash = function () {
    var h = 2166136261, s = '';
    for (var i = 0; i < this.cells.length; i++) {
      var c = this.cells[i];
      s += c ? (c.p ? c.p.k + c.p.s + c.p.item : '_') + (c.b ? c.b.t + c.b.hp + (c.b.charge || 0) : '') + (c.c ? c.c.t + c.c.hp : '') + c.n : '#';
      s += ',';
    }
    s += this.moves + '|' + this.score;
    for (var j = 0; j < s.length; j++) { h ^= s.charCodeAt(j); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(16);
  };

  Engine.BLOCK_TYPES = BLOCK_TYPES; Engine.COVER_TYPES = COVER_TYPES; Engine.ITEM_TYPES = ITEM_TYPES; Engine.SPECIAL_TYPES = SPECIAL_TYPES;
  RRM.Engine = Engine;
  if (typeof module !== 'undefined' && module.exports) module.exports = Engine;
})(typeof window !== 'undefined' ? window : globalThis);
