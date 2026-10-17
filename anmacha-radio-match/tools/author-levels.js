#!/usr/bin/env node
// Royal Radio Match 3D – Level-Autorenwerkzeug (nicht Teil des Spiels).
// Baut 200 Kampagnenlevel + 10 Bonuslevel aus kuratierten Rezepten (Brettform, Mechaniken, Ziele, Platzierungsmuster je Welt),
// kalibriert die Züge mit dem Solver und speichert:
//   data/levels.js          die fertigen Leveldaten (vom Spiel geladen)
//   tests/solutions.json    je Level ein aufgezeichneter Siegpfad (Zertifikat unter dem festen Level-Seed)
//   tests/level-report.json Kennzahlen (Formen, Hindernisse, Züge, Stichproben-Siegquoten)
// Aufruf: node anmacha-radio-match/tools/author-levels.js [--quick]
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const { play, replay, Engine } = require('./solver.js');
const RRM = globalThis.RRM;
const QUICK = process.argv.includes('--quick');

// ---------- Brettformen ----------
const grid = (W, H, f) => { const r = []; for (let y = 0; y < H; y++) { let s = ''; for (let x = 0; x < W; x++) s += f(x, y, W, H) ? '#' : '.'; r.push(s); } return r; };
const C = (W, H) => [(W - 1) / 2, (H - 1) / 2];
const MASKS = {
  rect: (W, H) => grid(W, H, () => true),
  cut1: (W, H) => grid(W, H, (x, y) => !((x === 0 || x === W - 1) && (y === 0 || y === H - 1))),
  cut2: (W, H) => grid(W, H, (x, y) => { const a = Math.min(x, W - 1 - x), b = Math.min(y, H - 1 - y); return a + b >= 2; }),
  octagon: (W, H) => grid(W, H, (x, y) => { const a = Math.min(x, W - 1 - x), b = Math.min(y, H - 1 - y); return a + b >= 3; }),
  diamond: (W, H) => { const [cx, cy] = C(W, H), r = (W + H) / 2 * 0.56; return grid(W, H, (x, y) => Math.abs(x - cx) + Math.abs(y - cy) <= r); },
  circle: (W, H) => { const [cx, cy] = C(W, H), r = Math.min(W, H) / 2 + 0.35; return grid(W, H, (x, y) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r); },
  plus: (W, H) => { const [cx, cy] = C(W, H), a = Math.max(1.5, W / 4); return grid(W, H, (x, y) => Math.abs(x - cx) <= a || Math.abs(y - cy) <= a); },
  hourglass: (W, H) => { const [cx, cy] = C(W, H); return grid(W, H, (x, y) => Math.abs(x - cx) <= W / 2 - 1.6 + Math.abs(y - cy) * 0.75); },
  ring: (W, H) => { const [cx, cy] = C(W, H); return grid(W, H, (x, y) => !(Math.abs(x - cx) < 1 && Math.abs(y - cy) < 1.5)); },
  ring2: (W, H) => { const [cx, cy] = C(W, H); return grid(W, H, (x, y) => !(Math.abs(x - cx) < 1.6 && Math.abs(y - cy) < 1.6 && !(Math.abs(x - cx) < 0.6 && Math.abs(y - cy) < 0.6))); },
  hshape: (W, H) => { const [cx] = C(W, H); return grid(W, H, (x, y) => !(Math.abs(x - cx) < 1 && (y < 2 || y > H - 3))); },
  ushape: (W, H) => { const [cx] = C(W, H); return grid(W, H, (x, y) => !(Math.abs(x - cx) < 1.6 && y < 3)); },
  tshape: (W, H) => grid(W, H, (x, y) => !((x < 2 || x > W - 3) && y > H - 4)),
  pyramid: (W, H) => { const [cx] = C(W, H); return grid(W, H, (x, y) => Math.abs(x - cx) <= 1.6 + y * (W / 2 - 1.2) / (H - 1)); },
  funnel: (W, H) => { const [cx] = C(W, H); return grid(W, H, (x, y) => Math.abs(x - cx) <= 1.6 + (H - 1 - y) * (W / 2 - 1.2) / (H - 1)); },
  stairs: (W, H) => grid(W, H, (x, y) => x + (H - 1 - y) >= 2 && (W - 1 - x) + y >= 2),
  lattice: (W, H) => grid(W, H, (x, y) => !(x % 3 === 1 && y % 3 === 1 && x > 0 && y > 0 && x < W - 1 && y < H - 1)),
  midcol: (W, H) => { const [cx] = C(W, H); return grid(W, H, (x, y) => !(Math.abs(x - cx) < 0.6 && y >= 2 && y <= H - 3)); },
  heart: (W, H) => { const [cx] = C(W, H); return grid(W, H, (x, y) => { const dx = Math.abs(x - cx); return y === 0 ? (dx >= 1 && dx <= W / 2 - 1) : y > H - 4 ? dx <= (H - 1 - y) * 1.3 + 0.8 : true; }); },
  butterfly: (W, H) => { const [cx, cy] = C(W, H); return grid(W, H, (x, y) => Math.abs(y - cy) <= 1.6 + Math.abs(x - cx) * 0.9); },
  zigzag: (W, H) => grid(W, H, (x, y) => !(y === 0 && x % 2 === 1) && !(y === H - 1 && x % 2 === 0 && x !== 0 && x !== W - 1)),
  towers: (W, H) => grid(W, H, (x, y) => x < 3 || x > W - 4 || y > H - 4),
  ibeam: (W, H) => { const [cx] = C(W, H); return grid(W, H, (x, y) => y < 3 || y > H - 4 || Math.abs(x - cx) <= 1.6); },
  keyhole: (W, H) => { const [cx, cy] = C(W, H); return grid(W, H, (x, y) => !(Math.abs(x - cx) < 0.6 && Math.abs(y - cy) <= 1.6)); },
  notches: (W, H) => grid(W, H, (x, y) => !((x === 0 || x === W - 1) && y % 3 === 1)),
  xholes: (W, H) => grid(W, H, (x, y) => !((x === y || x === W - 1 - y) && x > 0 && y > 0 && x < W - 1 && y < H - 1 && y % 2 === 1)),
  islands: (W, H) => { const [cx] = C(W, H); return grid(W, H, (x, y) => Math.abs(x - cx) >= 0.6 || y === H - 1 || y === 0); },
  arch: (W, H) => { const [cx] = C(W, H); return grid(W, H, (x, y) => !(Math.abs(x - cx) <= W / 2 - 2.4 && y > H - 3)); },
  steps: (W, H) => grid(W, H, (x, y) => !(y < Math.floor(x / 2) - 1 && x > W / 2)),
  crown: (W, H) => grid(W, H, (x, y) => !(y < 2 && x % 3 !== 1 && y < 2 - (x % 3 === 0 ? 1 : 0) + 1 && (x % 3 === 2))),
  // Portal-Formen: Mittelband aus Funklöchern, Portale verlegen die Spalten (gespiegelt / versetzt)
  mirror: (W, H) => { const b = Math.floor(H / 2); return { mask: grid(W, H, (x, y) => y !== b), portals: Array.from({ length: W }, (_, x) => [x, b - 1, W - 1 - x, b + 1]) }; },
  shift: (W, H) => { const b = Math.floor(H / 2); return { mask: grid(W, H, (x, y) => y !== b), portals: Array.from({ length: W }, (_, x) => [x, b - 1, (x + 2) % W, b + 1]) }; },
  split: (W, H) => { const h = Math.floor(H / 2), w = Math.floor(W / 2); return { mask: grid(W, H, (x, y) => (x < w && y < h) || (x >= W - w && y >= h) || (x === w && W % 2 === 1)), portals: Array.from({ length: w }, (_, x) => [x, h - 1, W - w + x, h]) }; },
  zigportal: (W, H) => { const b1 = 2, b2 = H - 3; return { mask: grid(W, H, (x, y) => y !== b1 && y !== b2), portals: Array.from({ length: W }, (_, x) => [x, b1 - 1, W - 1 - x, b1 + 1]).concat(Array.from({ length: W }, (_, x) => [x, b2 - 1, W - 1 - x, b2 + 1])) }; },
};
const NORMAL_MASKS = Object.keys(MASKS).filter(k => !['mirror', 'shift', 'split', 'zigportal'].includes(k));
const PORTAL_MASKS = ['mirror', 'shift', 'split', 'zigportal'];

// ---------- Platzierungsmuster ----------
function cellsOf(mask) { const o = []; mask.forEach((r, y) => [...r].forEach((ch, x) => { if (ch === '#') o.push([x, y]); })); return o; }
const PATTERNS = {
  bottom: (L, k) => L.cells.filter(([x, y]) => y >= L.h - k),
  top: (L, k) => L.cells.filter(([x, y]) => y < k),
  border: L => L.cells.filter(([x, y]) => x === 0 || y === 0 || x === L.w - 1 || y === L.h - 1),
  sides: (L, k) => L.cells.filter(([x]) => x < k || x >= L.w - k),
  center: (L, k) => { const [cx, cy] = C(L.w, L.h); return L.cells.filter(([x, y]) => Math.abs(x - cx) <= k / 2 && Math.abs(y - cy) <= k / 2); },
  pillars: (L, k) => L.cells.filter(([x, y]) => x % 3 === (k || 1) && y > 1),
  diagonal: L => L.cells.filter(([x, y]) => x === y || x === L.w - 1 - y),
  checker: (L, k) => L.cells.filter(([x, y]) => (x + y) % 2 === 0 && y >= L.h - (k || 4)),
  corners: (L, k) => L.cells.filter(([x, y]) => Math.min(x, L.w - 1 - x) + Math.min(y, L.h - 1 - y) < (k || 2)),
  cross: L => { const [cx, cy] = C(L.w, L.h); return L.cells.filter(([x, y]) => Math.abs(x - cx) < 1 || Math.abs(y - cy) < 1); },
  ringc: (L, k) => { const [cx, cy] = C(L.w, L.h); return L.cells.filter(([x, y]) => { const d = Math.max(Math.abs(x - cx), Math.abs(y - cy)); return d > (k || 1.5) - 1 && d <= (k || 1.5); }); },
  midrow: L => { const cy = Math.floor(L.h / 2); return L.cells.filter(([x, y]) => y === cy); },
  lowrows: (L, k) => L.cells.filter(([x, y]) => y >= L.h - 2 - (k || 0) && y < L.h - (k || 0)),
  scatter: (L, k) => { const pool = L.cells.filter(([x]) => x <= (L.w - 1) / 2); const out = []; const r = L.rng; const cp = pool.slice(); while (out.length < k && cp.length) { const p = cp.splice(r.int(cp.length), 1)[0]; out.push(p); const m = [L.w - 1 - p[0], p[1]]; if (m[0] !== p[0] && L.cells.some(c => c[0] === m[0] && c[1] === m[1])) out.push(m); } return out; },
};
const key = (x, y) => x + ',' + y;

// ---------- Level-Baukasten ----------
class Builder {
  constructor(n, w, h, maskName, rng) {
    let m = MASKS[maskName](w, h);
    this.portals = [];
    if (!Array.isArray(m)) { this.portals = m.portals; m = m.mask; }
    this.n = n; this.w = w; this.h = h; this.mask = m; this.maskName = maskName; this.rng = rng;
    this.cells = cellsOf(m); this.used = {}; this.covered = {}; this.noiseAt = {};
    this.blockers = []; this.covers = []; this.noise = []; this.items = []; this.specials = []; this.goals = []; this.spawn = null;
  }
  free(list, layer) {   // block: leere Zelle ohne Abdeckung/Rauschen; cover: ohne Abdeckung; noise: ohne Rauschfeld
    return list.filter(([x, y]) => {
      const k = key(x, y);
      if (this.used[k]) return false;
      if (layer === 'block') return !this.covered[k] && !this.noiseAt[k] && !this.heads()[k];   // Nachfüllquellen bleiben frei
      if (layer === 'cover') return !this.covered[k];
      return !this.noiseAt[k];
    });
  }
  heads() {
    if (!this._heads) { this._heads = {}; const e = this.engine(); e.chains.forEach(c => { const p = e.xy(c[0]); this._heads[key(p[0], p[1])] = 1; }); }
    return this._heads;
  }
  engine() { return new Engine({ w: this.w, h: this.h, mask: this.mask, portals: this.portals, seed: 1, moves: 1 }, { blank: true, events: false }); }
  tails() { const t = {}; const e = new Engine({ w: this.w, h: this.h, mask: this.mask, portals: this.portals, seed: 1, moves: 1 }, { blank: true, events: false }); e.chains.forEach(c => { const p = e.xy(c[c.length - 1]); t[key(p[0], p[1])] = 1; }); return t; }
  block(t, pat, arg, extra = {}, limit = 99) {
    const pos = this.free(PATTERNS[pat](this, arg), 'block').slice(0, limit);
    pos.forEach(([x, y], i) => { this.used[key(x, y)] = 1; this.blockers.push(Object.assign({ x, y, t }, typeof extra === 'function' ? extra(i, x, y) : extra)); });
    return pos.length;
  }
  cover(t, pat, arg, hp, limit = 99) {
    const pos = this.free(PATTERNS[pat](this, arg), 'cover').slice(0, limit);
    pos.forEach(([x, y]) => { this.covered[key(x, y)] = 1; this.covers.push({ x, y, t, hp }); });
    return pos.length;
  }
  addNoise(pat, arg, hp, limit = 99) {
    const pos = this.free(PATTERNS[pat](this, arg), 'noise').slice(0, limit);
    pos.forEach(([x, y]) => { this.noiseAt[key(x, y)] = 1; this.noise.push({ x, y, hp: typeof hp === 'function' ? hp(x, y) : hp }); });
    return pos.length;
  }
  item(t, count) {
    const tails = this.tails();
    const pos = this.free(PATTERNS.top(this, 2), 'block').filter(([x, y]) => !tails[key(x, y)]);
    const step = Math.max(1, Math.floor(pos.length / count));
    let n = 0;
    for (let i = 0; i < pos.length && n < count; i += step) { const [x, y] = pos[i]; this.used[key(x, y)] = 1; this.items.push({ x, y, t }); n++; }
    return n;
  }
  special(s, k) {
    const pos = this.free(PATTERNS.center(this, 3), 'block').filter(([x, y]) => !this.covered[key(x, y)]);
    if (!pos.length) return;
    const [x, y] = pos[0]; this.used[key(x, y)] = 1; this.specials.push(k != null ? { x, y, s, k } : { x, y, s });
  }
  goal(g) { this.goals.push(g); }
  count(t) { return this.blockers.filter(b => b.t === t).length; }
}

// ---------- Welten-Rezepte ----------
// Jede Welt: Größen, Formen-Vorrat, Mechanik-Einführung und Platzierungsideen. j = 1..20 innerhalb der Welt.
const SIZES = [[[7, 7], [7, 8], [8, 8]], [[8, 8], [8, 9], [7, 9]], [[8, 9], [9, 9], [8, 8]], [[9, 9], [8, 9], [9, 8]], [[9, 9], [9, 10], [8, 10]],
  [[9, 9], [9, 10], [10, 9]], [[9, 10], [9, 9], [10, 10]], [[9, 9], [10, 9], [9, 10]], [[9, 10], [10, 10], [8, 10]], [[9, 10], [10, 10], [9, 9]]];
const DIFF_OF = j => j === 20 ? 'boss' : [7, 10, 13, 15, 17, 19].includes(j) ? 'hard' : 'normal';

function kindsFor(n, w, diff) {
  if (n <= 8) return [0, 1, 2, 3];
  const six = diff === 'hard' && w >= 5 || diff === 'boss' && w >= 6;
  let k = [0, 1, 2, 3, 4];
  if (w >= 3 && n % 3 === 0) k = [0, 1, 6, 3, 4];
  if (w >= 3 && n % 3 === 1) k = [6, 1, 2, 3, 5];
  if (w >= 1 && n % 4 === 2) k = [0, 1, 2, 5, 4];
  if (six) k = k.concat([0, 1, 2, 3, 4, 5, 6].filter(c => !k.includes(c))[0]);
  return k;
}

// Mechanik-Bausteine: legen Hindernisse und das passende Ziel an
const MECH = {
  collect: (B, o) => { const k = B.kinds[(B.n + (o.i || 0)) % B.kinds.length]; B.goal({ type: 'collect', k, n: o.n || 14 + Math.round(B.n / 12) + B.rng.int(6) }); },
  crate: (B, o) => { const c = B.block('crate', o.pat || 'bottom', o.arg != null ? o.arg : 2, (i, x, y) => ({ hp: o.hp || 1 + ((x + y + B.n) % (o.maxHp || 2)) }), o.limit); if (c) B.goal({ type: 'clear', what: 'crate', n: c }); },
  noise: (B, o) => { const c = B.addNoise(o.pat || 'center', o.arg != null ? o.arg : 3, o.hp || ((x, y) => 1 + ((x * 3 + y) % (o.maxHp || 1))), o.limit); if (c) B.goal({ type: 'clear', what: 'noise', n: c }); },
  dusty: (B, o) => { const c = B.block('dusty', o.pat || 'scatter', o.arg || 4, (i) => ({ hp: 2 + (i % (o.maxHp === 3 ? 2 : 1)) }), o.limit); if (c) B.goal({ type: 'clear', what: 'dusty', n: c }); },
  glass: (B, o) => { const c = B.block('glass', o.pat || 'scatter', o.arg || 2, (i) => ({ hp: 1 + (i % (o.maxHp || 1)) }), o.limit || 6); const p = o.parcels ? B.item('parcel', o.parcels) : 0; if (c + p) B.goal({ type: 'deliver', what: 'parcel', n: c + p }); },
  parcel: (B, o) => { const p = B.item('parcel', o.n || 3); if (p) B.goal({ type: 'deliver', what: 'parcel', n: p }); },
  moss: (B, o) => { const c = B.block('moss', o.pat || 'bottom', o.arg != null ? o.arg : 1, { hp: 1 }, o.limit); if (c) B.goal({ type: 'clear', what: 'moss', n: c }); },
  cable: (B, o) => { const c = B.cover('cable', o.pat || 'center', o.arg != null ? o.arg : 3, o.hp || 1, o.limit); if (c) B.goal({ type: 'clear', what: 'cable', n: c }); },
  ice: (B, o) => { const c = B.cover('ice', o.pat || 'bottom', o.arg != null ? o.arg : 2, o.hp || 1, o.limit); if (c) B.goal({ type: 'clear', what: 'ice', n: c }); },
  amp: (B, o) => { const c = B.block('amp', o.pat || 'scatter', o.arg || 2, {}, o.limit || 6); if (c) B.goal({ type: 'clear', what: 'amp', n: c }); },
  antenna: (B, o) => { const c = B.block('antenna', o.pat || 'scatter', o.arg || 2, (i) => ({ hp: 2 + (i % (o.maxHp === 3 ? 2 : 1)) }), o.limit || 6); if (c) B.goal({ type: 'clear', what: 'antenna', n: c }); },
  shield: (B, o) => { const c = B.block('shield', o.pat || 'scatter', o.arg || 3, (i) => ({ k: B.kinds[(i + B.n) % B.kinds.length], hp: 1 + (i % (o.maxHp || 1)) }), o.limit || 10); if (c) B.goal({ type: 'clear', what: 'shield', n: c }); },
  rolling: (B, o) => { const c = B.block('rolling', o.pat || 'midrow', o.arg, (i) => ({ hp: o.hp || 1, dir: i % 2 ? -1 : 1 }), o.limit || 2); if (c) B.goal({ type: 'clear', what: 'rolling', n: c }); },
  generator: (B, o) => {
    const c = B.block('generator', o.pat || 'center', o.arg != null ? o.arg : 1, (i) => ({ k: B.kinds[(i * 2 + B.n) % B.kinds.length], need: o.need || 4 }), o.limit || 1);
    if (c) B.goal({ type: 'clear', what: 'generator', n: c });
    if (c && o.barrier) B.block('barrier', o.barrier, o.barArg, { key: 'generator' }, o.barLimit || 6);
  },
  switch: (B, o) => {
    const c = B.block('switch', o.pat || 'corners', o.arg || 1, (i) => ({ n: i + 1 }), o.limit || 4);
    if (c) { B.goal({ type: 'clear', what: 'switch', n: c }); B.block('barrier', o.barrier || 'midrow', o.barArg, { key: 'switch' }, o.barLimit || 4); }
  },
  jammer: (B, o) => { const c = B.block('jammer', 'center', 1, { hp: o.hp || 5, period: o.period || 3 }, o.limit || 1); if (c) { B.goal({ type: 'clear', what: 'jammer', n: c }); if (o.noise !== false) { const z = B.addNoise(o.npat || 'ringc', o.narg || 2.5, 1, o.nlimit || 10); if (z) B.goal({ type: 'clear', what: 'noise', n: z }); } } },
  cassette: (B, o) => { const cols = o.cols || [1, Math.floor(B.w / 2), B.w - 2]; const total = o.n || 4; B.spawn = { cassette: { cols, every: o.every || 4, total } }; B.goal({ type: 'deliver', what: 'cassette', n: total }); },
  specials: (B, o) => B.goal({ type: 'specials', n: o.n || 6 }),
  combo: (B, o) => B.goal({ type: 'combo', n: o.n || 4 }),
  score: (B, o) => B.goal({ type: 'score', n: o.n || 6000 }),
};

// Rezepte je Welt: Liste von 20 Einträgen [Form, Mechaniken, Tutorial, Vorplatzierte Spezialteile]
// m(name, opts) erzeugt einen Mechanik-Eintrag.
const m = (name, o = {}) => [name, o];
const W = [];
// Welt 1 – Das erste Sendestudio: Grundlagen, Kisten, Rauschfelder
W[0] = [
  ['rect', [m('collect', { n: 12 })], 'swap'],
  ['cut1', [m('collect', { n: 14 }), m('collect', { n: 14, i: 1 })], 'rocket', [['rh', 1]]],
  ['rect', [m('crate', { pat: 'bottom', arg: 1, hp: 1 })], 'crate'],
  ['diamond', [m('collect', { n: 16 }), m('crate', { pat: 'corners', arg: 2, hp: 1 })], 'drone', [['drone', 2]]],
  ['rect', [m('crate', { pat: 'bottom', arg: 2, hp: 1 }), m('collect', { n: 12, i: 2 })], 'bomb', [['bomb', 3]]],
  ['cut2', [m('collect', { n: 30 })], 'orb', [['orb']]],
  ['ring', [m('noise', { pat: 'center', arg: 4, hp: 1 })], 'noise'],
  ['rect', [m('crate', { pat: 'bottom', arg: 2, hp: 2 })], 'crate2'],
  ['plus', [m('crate', { pat: 'border', hp: 1, limit: 12 }), m('collect', { n: 18 })]],
  ['octagon', [m('specials', { n: 5 }), m('crate', { pat: 'corners', arg: 2, hp: 1 })], 'specials'],
  ['hshape', [m('noise', { pat: 'bottom', arg: 3, hp: 1 }), m('collect', { n: 15, i: 1 })]],
  ['tshape', [m('crate', { pat: 'pillars', arg: 1, hp: 1 })]],
  ['circle', [m('noise', { pat: 'checker', arg: 5, hp: 1 }), m('crate', { pat: 'corners', arg: 2, hp: 2 })]],
  ['ushape', [m('crate', { pat: 'bottom', arg: 2, hp: 2, maxHp: 2 }), m('collect', { n: 20, i: 3 })]],
  ['heart', [m('noise', { pat: 'center', arg: 4, hp: 1 }), m('collect', { n: 18, i: 2 })], 'remix', [['remix']]],
  ['stairs', [m('crate', { pat: 'diagonal', hp: 2 }), m('collect', { n: 16 })]],
  ['pyramid', [m('noise', { pat: 'bottom', arg: 3, hp: 1 }), m('crate', { pat: 'top', arg: 1, hp: 1, limit: 6 })]],
  ['lattice', [m('crate', { pat: 'checker', arg: 4, hp: 2 }), m('collect', { n: 20, i: 1 })]],
  ['cut1', [m('noise', { pat: 'border', hp: 1 }), m('collect', { n: 22, i: 4 })]],
  ['octagon', [m('crate', { pat: 'bottom', arg: 2, hp: 2, maxHp: 2 }), m('noise', { pat: 'center', arg: 3, hp: 1 }), m('collect', { n: 20, i: 2 })]],
];
// Welt 2 – Vinyl Lounge: verstaubte Platten, Glasvitrinen, Plattenpakete
W[1] = [
  ['rect', [m('dusty', { pat: 'scatter', arg: 3 })], 'dusty'],
  ['cut1', [m('dusty', { pat: 'bottom', arg: 1 }), m('collect', { n: 16 })]],
  ['diamond', [m('dusty', { pat: 'cross', limit: 8 }), m('crate', { pat: 'corners', arg: 2, hp: 1 })]],
  ['rect', [m('glass', { pat: 'scatter', arg: 2 })], 'glass'],
  ['ring', [m('glass', { pat: 'ringc', arg: 1.5, limit: 4 }), m('collect', { n: 18, i: 1 })]],
  ['zigzag', [m('dusty', { pat: 'lowrows', arg: 0, maxHp: 3, limit: 8 })]],
  ['rect', [m('parcel', { n: 2 }), m('crate', { pat: 'bottom', arg: 1, hp: 1 })], 'parcel'],
  ['keyhole', [m('glass', { pat: 'sides', arg: 1, limit: 4, maxHp: 2 }), m('dusty', { pat: 'center', arg: 2 })]],
  ['circle', [m('collect', { n: 22 }), m('collect', { n: 22, i: 2 })]],
  ['octagon', [m('combo', { n: 4 }), m('dusty', { pat: 'scatter', arg: 2 })], 'combo'],
  ['notches', [m('parcel', { n: 3 }), m('dusty', { pat: 'bottom', arg: 1 })]],
  ['hourglass', [m('glass', { pat: 'scatter', arg: 2, maxHp: 2 }), m('crate', { pat: 'bottom', arg: 1, hp: 2 })]],
  ['towers', [m('dusty', { pat: 'bottom', arg: 2, maxHp: 3 })]],
  ['xholes', [m('glass', { pat: 'scatter', arg: 3, limit: 6 }), m('collect', { n: 20, i: 3 })]],
  ['ibeam', [m('dusty', { pat: 'top', arg: 2, limit: 8 }), m('parcel', { n: 2 })]],
  ['cut2', [m('glass', { pat: 'corners', arg: 2, maxHp: 2, limit: 6 }), m('noise', { pat: 'center', arg: 3, hp: 1 })]],
  ['butterfly', [m('dusty', { pat: 'scatter', arg: 4, maxHp: 3 }), m('collect', { n: 24, i: 1 })]],
  ['midcol', [m('parcel', { n: 3 }), m('glass', { pat: 'bottom', arg: 1, limit: 3 })]],
  ['arch', [m('dusty', { pat: 'border', maxHp: 3, limit: 12 }), m('crate', { pat: 'center', arg: 2, hp: 2 })]],
  ['rect', [m('glass', { pat: 'scatter', arg: 3, maxHp: 2 }), m('dusty', { pat: 'bottom', arg: 1, maxHp: 3 }), m('collect', { n: 22, i: 4 })]],
];
// Welt 3 – Frequenzgarten: Moos, Rauschfelder in verbundenen Strukturen
W[2] = [
  ['rect', [m('moss', { pat: 'bottom', arg: 1, limit: 3 })], 'moss'],
  ['cut1', [m('moss', { pat: 'corners', arg: 2 }), m('collect', { n: 18 })]],
  ['diamond', [m('noise', { pat: 'cross', hp: 1 }), m('moss', { pat: 'corners', arg: 2, limit: 4 })]],
  ['circle', [m('moss', { pat: 'center', arg: 1 }), m('crate', { pat: 'border', hp: 1, limit: 10 })]],
  ['plus', [m('noise', { pat: 'cross', hp: 2, maxHp: 2 })]],
  ['hshape', [m('moss', { pat: 'bottom', arg: 1 }), m('noise', { pat: 'top', arg: 2, hp: 1 })]],
  ['lattice', [m('moss', { pat: 'scatter', arg: 3 }), m('collect', { n: 22, i: 2 })]],
  ['ring2', [m('noise', { pat: 'ringc', arg: 2.5, hp: 1 }), m('crate', { pat: 'center', arg: 0.5, hp: 2 })]],
  ['heart', [m('moss', { pat: 'top', arg: 1, limit: 4 }), m('dusty', { pat: 'bottom', arg: 1, limit: 4 })]],
  ['octagon', [m('score', { n: 7000 }), m('moss', { pat: 'corners', arg: 2, limit: 4 })], 'score'],
  ['butterfly', [m('noise', { pat: 'diagonal', hp: 2, maxHp: 2 }), m('collect', { n: 20, i: 1 })]],
  ['pyramid', [m('moss', { pat: 'bottom', arg: 2, limit: 8 })]],
  ['islands', [m('noise', { pat: 'sides', arg: 2, hp: 1 }), m('moss', { pat: 'center', arg: 1, limit: 2 })]],
  ['funnel', [m('moss', { pat: 'top', arg: 2, limit: 6 }), m('collect', { n: 22, i: 3 })]],
  ['steps', [m('noise', { pat: 'checker', arg: 6, hp: 1 }), m('crate', { pat: 'corners', arg: 2, hp: 2 })]],
  ['cut2', [m('moss', { pat: 'cross', limit: 6 }), m('glass', { pat: 'corners', arg: 1, limit: 2 })]],
  ['circle', [m('noise', { pat: 'border', hp: 2, maxHp: 2 }), m('moss', { pat: 'center', arg: 1 })]],
  ['ushape', [m('moss', { pat: 'scatter', arg: 4 }), m('noise', { pat: 'bottom', arg: 2, hp: 1 })]],
  ['xholes', [m('moss', { pat: 'lowrows', arg: 0, limit: 8 }), m('collect', { n: 24, i: 4 })]],
  ['rect', [m('moss', { pat: 'bottom', arg: 1 }), m('noise', { pat: 'center', arg: 4, hp: 2, maxHp: 2 }), m('dusty', { pat: 'corners', arg: 1, limit: 4 })]],
];
// Welt 4 – Mischpult-Werkstatt: Kabel, Schalter + Sperren, Verstärker, Generatoren
W[3] = [
  ['rect', [m('cable', { pat: 'center', arg: 3, hp: 1 })], 'cable'],
  ['cut1', [m('cable', { pat: 'cross', hp: 1, limit: 10 }), m('collect', { n: 20 })]],
  ['octagon', [m('cable', { pat: 'checker', arg: 4, hp: 2 })]],
  ['rect', [m('switch', { pat: 'corners', arg: 1, limit: 3, barrier: 'midrow', barLimit: 3 }), m('collect', { n: 18, i: 1 })], 'switch'],
  ['diamond', [m('amp', { pat: 'scatter', arg: 2 }), m('crate', { pat: 'bottom', arg: 1, hp: 1 })], 'amp'],
  ['plus', [m('cable', { pat: 'center', arg: 2, hp: 2 }), m('amp', { pat: 'corners', arg: 2, limit: 2 })]],
  ['rect', [m('generator', { pat: 'center', arg: 1, need: 4 }), m('collect', { n: 16, i: 2 })], 'generator'],
  ['hshape', [m('switch', { pat: 'top', arg: 1, limit: 4, barrier: 'bottom', barArg: 1, barLimit: 3 }), m('cable', { pat: 'center', arg: 2, hp: 1 })]],
  ['circle', [m('amp', { pat: 'cross', limit: 4 }), m('noise', { pat: 'corners', arg: 3, hp: 1 })]],
  ['cut2', [m('specials', { n: 7 }), m('cable', { pat: 'center', arg: 3, hp: 1 })]],
  ['ushape', [m('generator', { pat: 'center', arg: 1, need: 5, limit: 2, barrier: 'top', barArg: 1, barLimit: 4 })], 'barrier'],
  ['towers', [m('cable', { pat: 'bottom', arg: 3, hp: 2 }), m('crate', { pat: 'top', arg: 1, hp: 2, limit: 6 })]],
  ['ring', [m('switch', { pat: 'ringc', arg: 1.5, limit: 4, barrier: 'corners', barArg: 1, barLimit: 4 }), m('amp', { pat: 'border', limit: 2 })]],
  ['lattice', [m('amp', { pat: 'scatter', arg: 3, limit: 4 }), m('cable', { pat: 'bottom', arg: 2, hp: 1 })]],
  ['tshape', [m('generator', { pat: 'center', arg: 1, need: 4, limit: 2 }), m('dusty', { pat: 'corners', arg: 2, limit: 4 })]],
  ['keyhole', [m('cable', { pat: 'border', hp: 2, limit: 14 }), m('collect', { n: 24, i: 3 })]],
  ['zigzag', [m('switch', { pat: 'corners', arg: 2, limit: 5, barrier: 'midrow', barLimit: 4 }), m('cable', { pat: 'lowrows', arg: 0, hp: 1 })]],
  ['heart', [m('amp', { pat: 'scatter', arg: 2 }), m('generator', { pat: 'center', arg: 1, need: 5 })]],
  ['arch', [m('cable', { pat: 'cross', hp: 2 }), m('moss', { pat: 'corners', arg: 2, limit: 4 })]],
  ['octagon', [m('switch', { pat: 'corners', arg: 2, limit: 4, barrier: 'center', barArg: 2, barLimit: 4 }), m('amp', { pat: 'sides', arg: 1, limit: 2 }), m('cable', { pat: 'bottom', arg: 2, hp: 2 })]],
];
// Welt 5 – Antennenhöhe: Funklöcher, Portale, Antennen, Kassettenspender
W[4] = [
  ['lattice', [m('collect', { n: 22 }), m('crate', { pat: 'bottom', arg: 1, hp: 1 })], 'holes'],
  ['mirror', [m('collect', { n: 20, i: 1 }), m('noise', { pat: 'top', arg: 2, hp: 1 })], 'portal'],
  ['xholes', [m('antenna', { pat: 'scatter', arg: 2 })], 'antenna'],
  ['shift', [m('antenna', { pat: 'scatter', arg: 2 }), m('crate', { pat: 'bottom', arg: 1, hp: 1 })]],
  ['rect', [m('cassette', { n: 3, every: 4 })], 'cassette'],
  ['midcol', [m('antenna', { pat: 'top', arg: 1, limit: 4, maxHp: 3 }), m('collect', { n: 22, i: 2 })]],
  ['split', [m('collect', { n: 18 }), m('collect', { n: 18, i: 2 })]],
  ['towers', [m('cassette', { n: 4, every: 4, cols: [1, 7] }), m('crate', { pat: 'center', arg: 2, hp: 1 })]],
  ['mirror', [m('antenna', { pat: 'corners', arg: 2, limit: 4 }), m('noise', { pat: 'bottom', arg: 2, hp: 1 })]],
  ['ibeam', [m('specials', { n: 7 }), m('antenna', { pat: 'scatter', arg: 1 })]],
  ['islands', [m('cassette', { n: 4, every: 4 }), m('antenna', { pat: 'bottom', arg: 1, limit: 2 })]],
  ['shift', [m('noise', { pat: 'checker', arg: 4, hp: 2, maxHp: 2 }), m('collect', { n: 22, i: 4 })]],
  ['ring2', [m('antenna', { pat: 'ringc', arg: 2.5, limit: 6, maxHp: 3 })]],
  ['zigportal', [m('collect', { n: 24, i: 1 }), m('crate', { pat: 'top', arg: 1, hp: 1, limit: 4 })]],
  ['funnel', [m('cassette', { n: 4, every: 3 }), m('noise', { pat: 'center', arg: 3, hp: 1 })]],
  ['keyhole', [m('antenna', { pat: 'sides', arg: 1, limit: 4 }), m('cable', { pat: 'center', arg: 2, hp: 1 })]],
  ['split', [m('noise', { pat: 'bottom', arg: 3, hp: 1 }), m('collect', { n: 18, i: 3 })]],
  ['steps', [m('antenna', { pat: 'scatter', arg: 3, maxHp: 3 }), m('cassette', { n: 3, every: 5 })]],
  ['mirror', [m('crate', { pat: 'bottom', arg: 2, hp: 2 }), m('antenna', { pat: 'top', arg: 1, limit: 2 })]],
  ['zigportal', [m('antenna', { pat: 'scatter', arg: 2, maxHp: 3 }), m('cassette', { n: 4, every: 4 }), m('noise', { pat: 'top', arg: 2, hp: 1 })]],
];
// Welt 6 – Elektronische Nacht: Neon-Rauschen, Schutzschilde, erster Störsender
W[5] = [
  ['rect', [m('shield', { pat: 'scatter', arg: 3 })], 'shield'],
  ['circle', [m('noise', { pat: 'center', arg: 5, hp: 2, maxHp: 2 })]],
  ['cut1', [m('shield', { pat: 'bottom', arg: 1, limit: 7 }), m('collect', { n: 22, i: 1 })]],
  ['ring', [m('noise', { pat: 'border', hp: 2, maxHp: 2 }), m('shield', { pat: 'center', arg: 2, limit: 4 })]],
  ['diamond', [m('shield', { pat: 'cross', maxHp: 2, limit: 8 })]],
  ['hourglass', [m('noise', { pat: 'checker', arg: 6, hp: 1 }), m('cable', { pat: 'center', arg: 2, hp: 2 })]],
  ['plus', [m('shield', { pat: 'scatter', arg: 4, maxHp: 2 }), m('crate', { pat: 'bottom', arg: 1, hp: 2 })]],
  ['heart', [m('noise', { pat: 'bottom', arg: 4, hp: 2, maxHp: 2 }), m('collect', { n: 24, i: 2 })]],
  ['lattice', [m('shield', { pat: 'corners', arg: 3, limit: 8 }), m('amp', { pat: 'center', arg: 1, limit: 2 })]],
  ['octagon', [m('combo', { n: 5 }), m('noise', { pat: 'center', arg: 3, hp: 1 })]],
  ['xholes', [m('shield', { pat: 'top', arg: 2, limit: 8, maxHp: 2 }), m('noise', { pat: 'bottom', arg: 2, hp: 1 })]],
  ['towers', [m('noise', { pat: 'sides', arg: 3, hp: 2, maxHp: 2 })]],
  ['ring2', [m('shield', { pat: 'ringc', arg: 1.5, maxHp: 2 }), m('moss', { pat: 'corners', arg: 2, limit: 4 })]],
  ['butterfly', [m('noise', { pat: 'diagonal', hp: 2 }), m('dusty', { pat: 'corners', arg: 2, limit: 4, maxHp: 3 })]],
  ['cut2', [m('jammer', { hp: 4, period: 4, nlimit: 8 })], 'jammer'],
  ['stairs', [m('shield', { pat: 'diagonal', maxHp: 2, limit: 10 }), m('collect', { n: 24, i: 3 })]],
  ['zigzag', [m('noise', { pat: 'border', hp: 2 }), m('cable', { pat: 'center', arg: 3, hp: 2 })]],
  ['keyhole', [m('shield', { pat: 'scatter', arg: 5, maxHp: 2 }), m('noise', { pat: 'center', arg: 2, hp: 2 })]],
  ['arch', [m('jammer', { hp: 5, period: 4, npat: 'top', narg: 2, nlimit: 8 }), m('crate', { pat: 'bottom', arg: 1, hp: 2 })]],
  ['circle', [m('jammer', { hp: 6, period: 3, nlimit: 10 }), m('shield', { pat: 'border', limit: 8, maxHp: 2 })]],
];
// Welt 7 – Senderwelt Festival: Umleitungen, Ketten-Schalter, Generatoren, Kombis
W[6] = [
  ['rect', [m('switch', { pat: 'corners', arg: 1, limit: 4, barrier: 'center', barArg: 2, barLimit: 4 }), m('collect', { n: 22 })]],
  ['shift', [m('generator', { pat: 'center', arg: 1, need: 5, limit: 2 }), m('collect', { n: 18, i: 2 })]],
  ['diamond', [m('amp', { pat: 'cross', limit: 5 }), m('crate', { pat: 'corners', arg: 2, hp: 2 })]],
  ['ushape', [m('parcel', { n: 3 }), m('switch', { pat: 'bottom', arg: 1, limit: 3, barrier: 'midrow', barLimit: 3 })]],
  ['circle', [m('generator', { pat: 'cross', need: 4, limit: 3, barrier: 'border', barLimit: 6 })]],
  ['hshape', [m('amp', { pat: 'scatter', arg: 3, limit: 6 }), m('shield', { pat: 'bottom', arg: 1, limit: 4 })]],
  ['mirror', [m('switch', { pat: 'top', arg: 1, limit: 5, barrier: 'bottom', barArg: 1, barLimit: 4 }), m('noise', { pat: 'center', arg: 2, hp: 1 })]],
  ['heart', [m('glass', { pat: 'scatter', arg: 2, maxHp: 2 }), m('amp', { pat: 'corners', arg: 2, limit: 2 })]],
  ['octagon', [m('generator', { pat: 'corners', arg: 1, need: 4, limit: 4 }), m('cable', { pat: 'center', arg: 2, hp: 2 })]],
  ['cut1', [m('specials', { n: 9 }), m('amp', { pat: 'scatter', arg: 2, limit: 4 })]],
  ['plus', [m('switch', { pat: 'cross', limit: 5, barrier: 'corners', barArg: 2, barLimit: 6 }), m('dusty', { pat: 'top', arg: 1, limit: 4 })]],
  ['islands', [m('amp', { pat: 'sides', arg: 1, limit: 4 }), m('collect', { n: 26, i: 3 })]],
  ['ring', [m('generator', { pat: 'ringc', arg: 1.5, need: 5, limit: 2, barrier: 'corners', barArg: 1, barLimit: 4 }), m('shield', { pat: 'border', limit: 6 })]],
  ['funnel', [m('parcel', { n: 4 }), m('amp', { pat: 'center', arg: 2, limit: 2 })]],
  ['towers', [m('switch', { pat: 'bottom', arg: 1, limit: 5, barrier: 'top', barArg: 1, barLimit: 6 }), m('cable', { pat: 'center', arg: 3, hp: 1 })]],
  ['lattice', [m('amp', { pat: 'scatter', arg: 4, limit: 6 }), m('glass', { pat: 'top', arg: 1, limit: 3 })]],
  ['steps', [m('generator', { pat: 'center', arg: 1, need: 6, limit: 2 }), m('noise', { pat: 'bottom', arg: 2, hp: 2 })]],
  ['zigportal', [m('switch', { pat: 'corners', arg: 1, limit: 4, barrier: 'midrow', barLimit: 4 }), m('collect', { n: 22, i: 1 })]],
  ['butterfly', [m('amp', { pat: 'diagonal', limit: 6 }), m('shield', { pat: 'scatter', arg: 3, maxHp: 2 })]],
  ['octagon', [m('switch', { pat: 'corners', arg: 2, limit: 5, barrier: 'center', barArg: 1, barLimit: 4 }), m('generator', { pat: 'sides', arg: 1, need: 5, limit: 2 }), m('amp', { pat: 'scatter', arg: 2, limit: 4 })]],
];
// Welt 8 – Tiefbass-Tunnel: Frequenzeis, rollende Platten, knifflige Rätsel
W[7] = [
  ['rect', [m('ice', { pat: 'bottom', arg: 2, hp: 1 })], 'ice'],
  ['cut1', [m('ice', { pat: 'center', arg: 3, hp: 2 }), m('collect', { n: 22 })]],
  ['diamond', [m('ice', { pat: 'cross', hp: 2 })]],
  ['rect', [m('rolling', { pat: 'midrow', limit: 2 }), m('collect', { n: 20, i: 1 })], 'rolling'],
  ['ring', [m('ice', { pat: 'border', hp: 1, limit: 16 }), m('rolling', { pat: 'midrow', limit: 1 })]],
  ['hshape', [m('ice', { pat: 'checker', arg: 5, hp: 2 }), m('crate', { pat: 'top', arg: 1, hp: 2, limit: 6 })]],
  ['circle', [m('rolling', { pat: 'lowrows', arg: 1, limit: 2, hp: 2 }), m('noise', { pat: 'center', arg: 3, hp: 1 })]],
  ['octagon', [m('ice', { pat: 'bottom', arg: 3, hp: 3, limit: 12 })]],
  ['plus', [m('ice', { pat: 'cross', hp: 2 }), m('cable', { pat: 'corners', arg: 3, hp: 2 })]],
  ['cut2', [m('score', { n: 9000 }), m('ice', { pat: 'center', arg: 2, hp: 2 })]],
  ['lattice', [m('rolling', { pat: 'midrow', limit: 2, hp: 2 }), m('ice', { pat: 'top', arg: 2, hp: 1 })]],
  ['heart', [m('ice', { pat: 'scatter', arg: 6, hp: 3 }), m('collect', { n: 24, i: 2 })]],
  ['towers', [m('ice', { pat: 'sides', arg: 1, hp: 1, limit: 10 }), m('dusty', { pat: 'center', arg: 2, limit: 4, maxHp: 3 })]],
  ['ushape', [m('rolling', { pat: 'lowrows', arg: 0, limit: 2, hp: 2 }), m('shield', { pat: 'top', arg: 1, limit: 4 })]],
  ['xholes', [m('ice', { pat: 'diagonal', hp: 3 }), m('moss', { pat: 'corners', arg: 2, limit: 4 })]],
  ['keyhole', [m('ice', { pat: 'bottom', arg: 2, hp: 2 }), m('rolling', { pat: 'midrow', limit: 2 })]],
  ['ring2', [m('ice', { pat: 'ringc', arg: 2.5, hp: 2 }), m('amp', { pat: 'corners', arg: 1, limit: 4 })]],
  ['stairs', [m('rolling', { pat: 'midrow', limit: 2, hp: 2 }), m('ice', { pat: 'diagonal', hp: 2 }), m('collect', { n: 22, i: 4 })]],
  ['butterfly', [m('ice', { pat: 'border', hp: 3, limit: 14 }), m('cable', { pat: 'center', arg: 2, hp: 2 })]],
  ['octagon', [m('ice', { pat: 'bottom', arg: 2, hp: 2 }), m('rolling', { pat: 'midrow', limit: 2, hp: 2 }), m('crate', { pat: 'top', arg: 1, hp: 2, limit: 6 })]],
];
// Welt 9 – Wolkenfrequenz: Portal-Umleitungen, Signalpakete, neue Brettformen
W[8] = [
  ['mirror', [m('cassette', { n: 4, every: 4 }), m('collect', { n: 18 })]],
  ['split', [m('parcel', { n: 3 }), m('noise', { pat: 'bottom', arg: 2, hp: 1 })]],
  ['crown', [m('glass', { pat: 'scatter', arg: 3, maxHp: 2 }), m('ice', { pat: 'bottom', arg: 1, hp: 1 })]],
  ['shift', [m('cassette', { n: 5, every: 3 }), m('crate', { pat: 'top', arg: 1, hp: 1, limit: 6 })]],
  ['zigportal', [m('parcel', { n: 3 }), m('antenna', { pat: 'corners', arg: 2, limit: 4 })]],
  ['funnel', [m('glass', { pat: 'top', arg: 2, limit: 4, maxHp: 2 }), m('cable', { pat: 'bottom', arg: 2, hp: 1 })]],
  ['mirror', [m('ice', { pat: 'top', arg: 2, hp: 2 }), m('cassette', { n: 3, every: 4 })]],
  ['arch', [m('parcel', { n: 4 }), m('shield', { pat: 'bottom', arg: 1, limit: 4 })]],
  ['split', [m('antenna', { pat: 'scatter', arg: 2, maxHp: 3 }), m('noise', { pat: 'top', arg: 2, hp: 2 })]],
  ['cut1', [m('combo', { n: 6 }), m('glass', { pat: 'corners', arg: 2, limit: 4 })]],
  ['shift', [m('parcel', { n: 3 }), m('ice', { pat: 'bottom', arg: 2, hp: 2 })]],
  ['steps', [m('cassette', { n: 5, every: 3 }), m('moss', { pat: 'corners', arg: 2, limit: 4 })]],
  ['zigportal', [m('noise', { pat: 'border', hp: 2 }), m('collect', { n: 24, i: 2 })]],
  ['hourglass', [m('glass', { pat: 'scatter', arg: 3, maxHp: 2 }), m('rolling', { pat: 'midrow', limit: 1 })]],
  ['mirror', [m('parcel', { n: 4 }), m('amp', { pat: 'corners', arg: 2, limit: 2 })]],
  ['islands', [m('cassette', { n: 4, every: 4 }), m('cable', { pat: 'center', arg: 2, hp: 2 })]],
  ['mirror', [m('glass', { pat: 'scatter', arg: 2, maxHp: 2 }), m('crate', { pat: 'bottom', arg: 1, hp: 2 })]],
  ['crown', [m('parcel', { n: 3 }), m('cassette', { n: 3, every: 5 }), m('noise', { pat: 'center', arg: 2, hp: 1 })]],
  ['shift', [m('antenna', { pat: 'scatter', arg: 3, maxHp: 3 }), m('ice', { pat: 'top', arg: 1, hp: 2 })]],
  ['zigportal', [m('parcel', { n: 4 }), m('glass', { pat: 'corners', arg: 1, limit: 2 }), m('collect', { n: 20, i: 3 })]],
];
// Welt 10 – Royal Radio Tower: Finale, Mischmissionen, Boss-Störsender
W[9] = [
  ['octagon', [m('jammer', { hp: 5, period: 4, nlimit: 8 }), m('crate', { pat: 'bottom', arg: 1, hp: 2 })]],
  ['mirror', [m('switch', { pat: 'top', arg: 1, limit: 4, barrier: 'bottom', barArg: 1, barLimit: 4 }), m('ice', { pat: 'center', arg: 2, hp: 2 })]],
  ['circle', [m('shield', { pat: 'ringc', arg: 2.5, maxHp: 2, limit: 10 }), m('amp', { pat: 'center', arg: 1, limit: 2 })]],
  ['ring', [m('parcel', { n: 3 }), m('moss', { pat: 'corners', arg: 2, limit: 4 }), m('noise', { pat: 'center', arg: 3, hp: 1 })]],
  ['heart', [m('generator', { pat: 'center', arg: 1, need: 5, limit: 2, barrier: 'corners', barArg: 1, barLimit: 4 }), m('ice', { pat: 'bottom', arg: 1, hp: 2 })]],
  ['shift', [m('cassette', { n: 4, every: 4 }), m('shield', { pat: 'bottom', arg: 1, limit: 5 })]],
  ['lattice', [m('jammer', { hp: 6, period: 4, npat: 'bottom', narg: 2, nlimit: 8 }), m('cable', { pat: 'top', arg: 2, hp: 2 })]],
  ['butterfly', [m('rolling', { pat: 'midrow', limit: 2, hp: 2 }), m('dusty', { pat: 'corners', arg: 2, limit: 4, maxHp: 3 }), m('collect', { n: 22 })]],
  ['towers', [m('antenna', { pat: 'scatter', arg: 3, maxHp: 3 }), m('glass', { pat: 'bottom', arg: 1, limit: 3 })]],
  ['octagon', [m('specials', { n: 10 }), m('jammer', { hp: 4, period: 4, noise: false })]],
  ['zigportal', [m('switch', { pat: 'corners', arg: 1, limit: 4, barrier: 'midrow', barLimit: 4 }), m('parcel', { n: 3 })]],
  ['plus', [m('ice', { pat: 'cross', hp: 3 }), m('amp', { pat: 'corners', arg: 2, limit: 4 })]],
  ['cut2', [m('jammer', { hp: 6, period: 3, nlimit: 10 }), m('shield', { pat: 'corners', arg: 2, limit: 6, maxHp: 2 })]],
  ['split', [m('generator', { pat: 'sides', arg: 1, need: 5, limit: 2 }), m('cassette', { n: 3, every: 4 })]],
  ['keyhole', [m('moss', { pat: 'bottom', arg: 1 }), m('ice', { pat: 'top', arg: 2, hp: 2 }), m('collect', { n: 24, i: 2 })]],
  ['stairs', [m('jammer', { hp: 6, period: 4, npat: 'diagonal', nlimit: 10 }), m('rolling', { pat: 'midrow', limit: 2 })]],
  ['ushape', [m('switch', { pat: 'bottom', arg: 1, limit: 5, barrier: 'top', barArg: 1, barLimit: 5 }), m('glass', { pat: 'center', arg: 2, limit: 3, maxHp: 2 })]],
  ['circle', [m('amp', { pat: 'scatter', arg: 3, limit: 6 }), m('ice', { pat: 'border', hp: 2, limit: 14 }), m('noise', { pat: 'center', arg: 3, hp: 2 })]],
  ['crown', [m('jammer', { hp: 7, period: 4, nlimit: 10 }), m('parcel', { n: 3 }), m('cable', { pat: 'bottom', arg: 1, hp: 2 })]],
  ['octagon', [m('jammer', { hp: 8, period: 3, nlimit: 12 }), m('shield', { pat: 'corners', arg: 2, limit: 6, maxHp: 2 }), m('ice', { pat: 'bottom', arg: 1, hp: 2 }), m('collect', { n: 24, i: 1 })]],
];

// Bonuslevel (zusätzlich, verkürzen den Pfad nicht): Herausforderungen aus dem alten Spiel
const BONUS = [
  ['rect', [m('score', { n: 4000 })], { time: 60 }],
  ['diamond', [m('combo', { n: 4 })], {}],
  ['circle', [m('specials', { n: 6 })], {}],
  ['plus', [m('score', { n: 6000 })], { time: 60 }],
  ['octagon', [m('combo', { n: 5 })], {}],
  ['heart', [m('specials', { n: 8 })], {}],
  ['ring', [m('score', { n: 8000 })], { time: 75 }],
  ['butterfly', [m('combo', { n: 6 })], {}],
  ['cut2', [m('specials', { n: 10 })], {}],
  ['rect', [m('score', { n: 12000 })], { time: 90 }],
];

// ---------- Bau eines Levels ----------
function build(n, recipe, worldIdx, j, bonus) {
  const R = new RRM.Rng(n * 7919 + 13);
  const sizes = SIZES[worldIdx];
  let [w, h] = sizes[(j + worldIdx) % sizes.length];
  const [maskName, mechs, tut, specials] = recipe;
  if (['split'].includes(maskName)) { w = Math.max(8, w); h = 10; }
  if (['towers', 'ibeam'].includes(maskName)) w = Math.max(8, w);
  const diff = bonus ? 'normal' : n <= 6 ? 'easy' : DIFF_OF(j);
  const B = new Builder(n, w, h, maskName, R);
  B.kinds = kindsFor(n, worldIdx, diff);
  (specials || []).forEach(([s, k]) => B.special(s, k != null ? B.kinds[k % B.kinds.length] : undefined));
  mechs.forEach(([name, o]) => MECH[name](B, o));
  const def = {
    id: bonus ? 'B' + bonus : n, world: RRM.WORLDS[worldIdx].id, w, h, mask: B.mask, kinds: B.kinds,
    goals: B.goals, moves: 0, seed: n * 1009 + 37 + (bonus ? 500000 : 0), diff,
  };
  if (tut) def.tut = tut;
  if (!bonus && j === 10) def.tag = 'special';
  if (!bonus && j === 20) def.tag = 'final';
  if (bonus) def.tag = 'bonus';
  if (B.blockers.length) def.blockers = B.blockers;
  if (B.covers.length) def.covers = B.covers;
  if (B.noise.length) def.noise = B.noise;
  if (B.items.length) def.items = B.items;
  if (B.specials.length) def.specials = B.specials;
  if (B.portals.length) def.portals = B.portals;
  if (B.spawn) def.spawn = B.spawn;
  def.maskName = maskName;
  return def;
}

// ---------- Kalibrierung ----------
const FACTOR = { easy: 1.7, normal: 1.32, hard: 1.16, boss: 1.22 };
function calibrate(def) {
  let cert = null;
  for (let t = 0; t < 8 && !cert; t++) {
    const r = play(def, { mode: 'cert', budget: 160, top: 12 });
    if (r.won) cert = r; else def.seed += 101;   // neues Startbrett, falls der Seed unglücklich ist
  }
  if (!cert) return null;
  const seeds = QUICK ? 2 : 5, fair = [];
  for (let s = 1; s <= seeds; s++) { const r = play(def, { mode: 'fair', seed: def.seed + s * 7919, budget: 160 }); fair.push(r.won ? r.used : 160); }
  fair.sort((a, b) => a - b);
  const med = fair[Math.floor(fair.length / 2)];
  let moves = Math.round(Math.max(cert.used, Math.min(med, cert.used * 2.2)) * FACTOR[def.diff]) + 2;
  moves = Math.max(cert.used + 1, Math.min(45, Math.max(def.diff === 'easy' ? 12 : 15, moves)));
  def.moves = moves;
  const rep = replay(def, cert.path);
  if (!rep.won) throw new Error('Level ' + def.id + ': Zertifikat lässt sich nicht nachspielen');
  const rate = fair.filter(u => u <= moves).length / fair.length;
  return { path: cert.path, used: cert.used, fair, rate, left: rep.left };
}

// Zu leichte Level (Siegpfad sehr kurz) werden schrittweise verstärkt: mehr Sammelsteine, mehr Lagen, höhere Ladung
const MAXHP = { crate: 3, dusty: 3, glass: 2, shield: 2, antenna: 3, jammer: 9, rolling: 2 };
const COVERMAX = { cable: 2, ice: 3 };
function intensify(def, round) {
  if (round >= 1 && !def.goals.some(g => g.type === 'collect') && def.goals.length < 3) {   // Mehrziel-Level: Sammelauftrag dazu
    def.goals.push({ type: 'collect', k: def.kinds[(def.seed + round) % def.kinds.length], n: 18 });
    return;
  }
  def.goals.forEach(g => {
    if (g.type === 'collect') g.n = Math.round(g.n * 1.45);
    if (g.type === 'specials') g.n += 3;
    if (g.type === 'combo') g.n += 1;
    if (g.type === 'score') g.n = Math.round(g.n * 1.5 / 100) * 100;
    if (g.type === 'deliver' && g.what === 'cassette') { g.n += 1; def.spawn.cassette.total = g.n; }
  });
  (def.blockers || []).forEach((b, i) => {
    if (MAXHP[b.t] && (i + round) % 2 === 0) b.hp = Math.min(MAXHP[b.t], b.hp + 1);
    if (b.t === 'generator') b.need = Math.min(8, b.need + 1);
  });
  (def.covers || []).forEach((c, i) => { if ((i + round) % 2 === 0) c.hp = Math.min(COVERMAX[c.t], c.hp + 1); });
  (def.noise || []).forEach((z, i) => { if ((i + round) % 2 === 1) z.hp = 2; });
}
function soften(def) {
  def.goals.forEach(g => {
    if (g.type === 'collect') g.n = Math.max(10, Math.round(g.n * 0.7));
    if (g.type === 'specials') g.n = Math.max(3, g.n - 2);
    if (g.type === 'combo') g.n = Math.max(3, g.n - 1);
    if (g.type === 'score') g.n = Math.round(g.n * 0.7 / 100) * 100;
    if (g.type === 'deliver' && g.what === 'cassette' && g.n > 2) { g.n -= 1; def.spawn.cassette.total = g.n; def.spawn.cassette.every = Math.max(2, def.spawn.cassette.every - 1); }
    if (g.type === 'deliver' && g.what === 'parcel' && def.items && def.items.length > 1) { def.items.pop(); g.n -= 1; }
  });
  (def.blockers || []).forEach(b => {
    if (b.hp > 1 && b.t !== 'jammer') b.hp--;
    if (b.t === 'jammer') { b.hp = Math.max(3, b.hp - 1); b.period++; }
    if (b.t === 'generator') b.need = Math.max(3, b.need - 1);
  });
  (def.covers || []).forEach(c => { if (c.hp > 1) c.hp--; });
  (def.noise || []).forEach(z => { z.hp = 1; });
}
const MAXCERT = n => 16 + Math.floor((n - 1) / 20) * 2;
const MINRATE = { easy: 1, normal: 0.6, hard: 0.4, boss: 0.4 };
const TARGET = (n, diff) => n <= 3 ? 3 : n <= 8 ? 6 : diff === 'boss' ? 14 : n <= 20 ? 9 : 11;

function main() {
  const levels = [], bonus = [], solutions = {}, report = { levels: [], masks: {}, blockers: {}, goals: {} };
  const t0 = Date.now();
  for (let n = 1; n <= 200; n++) {
    const wi = Math.floor((n - 1) / 20), j = (n - 1) % 20 + 1;
    const def = build(n, W[wi][j - 1], wi, j, 0);
    let c = calibrate(def);
    for (let round = 0; round < 6 && (!c || c.used > MAXCERT(n)); round++) { soften(def); c = calibrate(def); }
    for (let round = 0; round < 4 && c && c.used < TARGET(n, def.diff); round++) {
      const keep = JSON.stringify(def); intensify(def, round);
      const c2 = calibrate(def);
      if (!c2 || c2.used > MAXCERT(n) || c2.rate < MINRATE[def.diff]) { Object.assign(def, JSON.parse(keep)); c = calibrate(def); break; }
      c = c2;
    }
    for (let round = 0; round < 5 && c && c.rate < MINRATE[def.diff]; round++) { soften(def); c = calibrate(def) || c; }
    if (!c) throw new Error('Level ' + n + ': kein Siegpfad gefunden – Rezept entschärfen');
    solutions[def.id] = c.path;
    levels.push(def);
    report.levels.push({ id: def.id, mask: def.maskName, moves: def.moves, cert: c.used, fair: c.fair, rate: c.rate, goals: def.goals.map(g => g.type + ':' + (g.what || g.k || '')) });
    process.stdout.write(`\r${n}/200  Level ${n}: ${def.w}x${def.h} ${def.maskName} Züge ${def.moves} (Siegpfad ${c.used}, Stichprobe ${c.fair.join('/')})        `);
  }
  BONUS.forEach((rec, i) => {
    const def = build(1000 + i, [rec[0], rec[1]], i, 10, i + 1);
    Object.assign(def, rec[2]);
    let c = calibrate(def);
    for (let round = 0; round < 6 && (!c || c.used > MAXCERT(20)); round++) { soften(def); c = calibrate(def); }
    if (!c) throw new Error('Bonuslevel ' + def.id + ': kein Siegpfad');
    if (def.time) def.moves = 99;   // Zeitlevel: Züge spielen keine Rolle
    solutions[def.id] = c.path;
    bonus.push(def);
  });
  levels.concat(bonus).forEach(d => {
    report.masks[d.mask.join('/')] = (report.masks[d.mask.join('/')] || 0) + 1;
    (d.blockers || []).forEach(b => { report.blockers[b.t] = (report.blockers[b.t] || 0) + 1; });
    (d.covers || []).forEach(b => { report.blockers[b.t] = (report.blockers[b.t] || 0) + 1; });
    if (d.noise) report.blockers.noise = (report.blockers.noise || 0) + d.noise.length;
    if (d.portals) report.blockers.portal = (report.blockers.portal || 0) + d.portals.length;
    if (d.mask.some(r => r.includes('.'))) report.blockers.hole = (report.blockers.hole || 0) + 1;
    if (d.spawn) report.blockers.cassette = (report.blockers.cassette || 0) + 1;
    if (d.items) report.blockers.parcel = (report.blockers.parcel || 0) + d.items.length;
    d.goals.forEach(g => { const k = g.type + (g.what ? ':' + g.what : ''); report.goals[k] = (report.goals[k] || 0) + 1; });
    delete d.maskName;
  });
  report.uniqueMasks = Object.keys(report.masks).length;
  report.seconds = Math.round((Date.now() - t0) / 1000);
  const line = d => '  ' + JSON.stringify(d);
  const out = '/* Royal Radio Match 3D – 200 Kampagnenlevel + 10 Bonuslevel.\n' +
    '   Erzeugt von tools/author-levels.js (Rezepte je Welt, Züge per Solver kalibriert). Nicht von Hand ändern, sondern Rezept anpassen und neu erzeugen.\n' +
    '   Felder: id, world, w, h, mask (# Feld, . Funkloch), kinds (Steinsorten), goals, moves, seed, diff, tut, tag, blockers, covers, noise, items, specials, portals, spawn. */\n' +
    '(function (root) {\n  var RRM = root.RRM || (root.RRM = {});\n  RRM.LEVELS = [\n' + levels.map(line).join(',\n') + '\n  ];\n  RRM.BONUS = [\n' + bonus.map(line).join(',\n') + '\n  ];\n' +
    '  if (typeof module !== \'undefined\' && module.exports) module.exports = RRM;\n})(typeof window !== \'undefined\' ? window : globalThis);\n';
  fs.writeFileSync(path.join(ROOT, 'data', 'levels.js'), out);
  fs.writeFileSync(path.join(ROOT, 'tests', 'solutions.json'), JSON.stringify(solutions));
  fs.writeFileSync(path.join(ROOT, 'tests', 'level-report.json'), JSON.stringify(report, null, 1));
  console.log(`\nFertig: ${levels.length} Level + ${bonus.length} Bonus, ${report.uniqueMasks} verschiedene Brettformen, ${report.seconds} s`);
}
if (require.main === module) main();
module.exports = { build, calibrate, W, BONUS, MASKS };
