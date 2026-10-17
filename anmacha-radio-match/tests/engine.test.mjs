// Royal Radio Match 3D – Logiktests der Engine (Tausch, Matches, Spezialteile, Kombinationen, Schwerkraft, Hindernisse, Booster, Ziele).
//   node anmacha-radio-match/tests/engine.test.mjs
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
require('../src/core/defs.js'); require('../src/core/rng.js');
const Engine = require('../src/core/engine.js');

let n = 0;
const ok = (name, fn) => { fn(); n++; console.log('PASS ' + name); };

// Brett aus Text: Tokens je Zelle, durch Leerzeichen getrennt. Ziffer = Farbe, danach optional H V B D (Spezial),
// O/X = Frequenzkugel/Remix-Orb, c/p = Kassette/Paket, - = leer, # = unverändert lassen
function setup(rows, def = {}) {
  const H = rows.length, W = rows[0].trim().split(/\s+/).length;
  const e = new Engine(Object.assign({ id: 't', w: W, h: H, moves: 20, colors: 5, seed: 7, goals: [{ type: 'score', n: 999999 }] }, def), { blank: true });
  rows.forEach((r, y) => r.trim().split(/\s+/).forEach((t, x) => {
    const c = e.cell(x, y); if (!c || t === '#') return;
    if (c.b) { c.p = null; return; }
    if (t === '-') { c.p = null; return; }
    const S = { H: 'rh', V: 'rv', B: 'bomb', D: 'drone' };
    if (t === 'O' || t === 'X') c.p = { id: e.idc++, k: -1, s: t === 'O' ? 'orb' : 'remix', item: '', weak: false };
    else if (t === 'c' || t === 'p') c.p = { id: e.idc++, k: -1, s: '', item: t === 'c' ? 'cassette' : 'parcel', weak: false };
    else c.p = { id: e.idc++, k: +t[0], s: S[t[1]] || '', item: '', weak: false };
  }));
  e.ev = [];
  return e;
}
const I = (e, x, y) => e.idx(x, y);
const dry = e => { const c = e.clone(); c.dry = true; c.ev = []; return c; };
const kind = (e, x, y) => { const c = e.cell(x, y); return c && c.p ? (c.p.s || c.p.item || c.p.k) : null; };
const empty = (e, x, y) => !e.cell(x, y).p;

const BASE = [
  '0 1 2 3 4 0 1',
  '1 2 3 4 0 1 2',
  '2 3 4 0 1 2 3',
  '3 4 0 1 2 3 4',
  '4 0 1 2 3 4 0',
  '0 1 2 3 4 0 1',
  '1 2 3 4 0 1 2'];
const row = (y, s) => { const b = BASE.slice(); b[y] = s; return b; };

// ---------- Tausch ----------
ok('ungültiger Tausch: kein Zugverbrauch, Brett unverändert, Rück-Ereignis', () => {
  const e = setup(BASE), h = e.hash();
  const r = e.swap(I(e, 0, 0), I(e, 1, 0));
  assert.equal(r.ok, false); assert.equal(e.moves, 20); assert.equal(e.hash(), h);
  assert.deepEqual(e.ev.map(x => x.e), ['swap']); assert.equal(e.ev[0].ok, false);
});
ok('nicht benachbart / Funkloch / leeres Feld / abgedeckter Stein sind nicht tauschbar', () => {
  const e = setup(BASE, { covers: [{ x: 3, y: 3, t: 'cable', hp: 1 }] });
  assert.equal(e.swap(I(e, 0, 0), I(e, 2, 0)).ok, false);
  assert.equal(e.swap(I(e, 3, 3), I(e, 4, 3)).ok, false);
  e.cell(5, 5).p = null; assert.equal(e.swap(I(e, 5, 5), I(e, 6, 5)).ok, false);
  assert.equal(e.moves, 20);
});
ok('gültiger Dreier: Steine weg, ein Zug verbraucht, Brett aufgefüllt', () => {
  const e = setup(row(0, '0 0 1 0 4 2 3'));
  const r = e.swap(I(e, 2, 0), I(e, 3, 0));
  assert.equal(r.ok, true); assert.equal(e.moves, 19);
  assert(e.cells.every(c => !c || c.p), 'alle Felder gefüllt');
  assert(e.ev.some(x => x.e === 'wave' && x.removed.length >= 3));
});

// ---------- Spezialteile entstehen ----------
ok('Vierer waagerecht -> Wellenrakete (Reihe) am Tauschfeld', () => {
  const b = setup(row(0, '0 0 1 0 3 2 3')); b.cell(2, 1).p.k = 0; // 0 0 _ 0 + 0 von unten
  const d = dry(b); d.swap(I(d, 2, 1), I(d, 2, 0));
  assert.equal(kind(d, 2, 0), 'rh');
});
ok('Vierer senkrecht -> Wellenrakete (Spalte)', () => {
  const b = setup(BASE); [0, 1, 3].forEach(y => { b.cell(6, y).p.k = 4; }); b.cell(5, 2).p.k = 4; b.cell(6, 2).p.k = 1;
  const d = dry(b); d.swap(I(d, 5, 2), I(d, 6, 2));
  assert.equal(kind(d, 6, 2), 'rv');
});
ok('Fünfer -> Frequenzkugel', () => {
  const b = setup(row(0, '2 2 1 2 2 0 3')); b.cell(2, 1).p.k = 2;
  const d = dry(b); d.swap(I(d, 2, 1), I(d, 2, 0));
  assert.equal(kind(d, 2, 0), 'orb');
});
ok('Sechser -> Remix-Orb', () => {
  const b = setup(row(0, '2 2 1 2 2 2 3')); b.cell(2, 1).p.k = 2;
  const d = dry(b); d.swap(I(d, 2, 1), I(d, 2, 0));
  assert.equal(kind(d, 2, 0), 'remix');
});
ok('L/T-Form -> Bassbombe am Kreuzungspunkt', () => {
  const b = setup(BASE);
  b.cell(0, 4).p.k = 1; b.cell(1, 4).p.k = 1; b.cell(2, 3).p.k = 1; b.cell(2, 4).p.k = 3; b.cell(2, 5).p.k = 1; b.cell(2, 6).p.k = 1;
  const d = dry(b); d.swap(I(d, 2, 3), I(d, 2, 4));
  assert.equal(kind(d, 2, 4), 'bomb');
});
ok('großes Kreuz (4+4, 7 Steine) -> Remix-Orb', () => {
  const b = setup(BASE);
  [[0, 3], [1, 3], [2, 3], [3, 3], [2, 1], [2, 2], [2, 4]].forEach(([x, y]) => { b.cell(x, y).p.k = 4; });
  const g = b.findGroups().find(x => x.k === 4);
  assert.equal(g.cells.length, 7); assert.equal(b.specialOf(g), 'remix');
});
ok('2×2-Quadrat -> Funkdrohne', () => {
  const b = setup(BASE);
  b.cell(0, 0).p.k = 3; b.cell(1, 0).p.k = 3; b.cell(0, 1).p.k = 3; b.cell(2, 1).p.k = 3; b.cell(1, 1).p.k = 0;
  const d = dry(b); d.swap(I(d, 2, 1), I(d, 1, 1));
  assert.equal(kind(d, 1, 1), 'drone');
});

// ---------- Spezialteile wirken ----------
function fire(rows, x1, y1, x2, y2, def) { const b = setup(rows, def); const d = dry(b); const r = d.swap(I(d, x1, y1), I(d, x2, y2)); assert.equal(r.ok, true); return d; }
ok('Wellenrakete (Reihe) räumt die ganze Reihe', () => {
  const d = fire(row(3, '3 4 0 1H 2 3 4'), 3, 3, 3, 2);
  for (let x = 0; x < 7; x++) assert(empty(d, x, 2), 'Reihe 2 leer bei x=' + x);
});
ok('Wellenrakete (Spalte) räumt die ganze Spalte', () => {
  const d = fire(row(3, '3 4 0 1V 2 3 4'), 3, 3, 4, 3);
  for (let y = 0; y < 7; y++) assert(empty(d, 4, y));
});
ok('Bassbombe trifft 21 Felder (Radius 2 ohne Ecken)', () => {
  const d = fire(row(3, '3 4 0 1B 2 3 4'), 3, 3, 3, 2);
  const w = d.ev.find(x => x.e === 'wave');
  assert.equal(w.removed.length, 21);
});
ok('Frequenzkugel + Stein entfernt alle Steine dieser Farbe', () => {
  const b = setup(row(3, '3 4 0 O 2 3 4'));
  const cnt = b.cells.filter(c => c && c.p && c.p.k === 2).length;
  const d = dry(b); d.swap(I(d, 3, 3), I(d, 4, 3));
  assert.equal(d.cells.filter(c => c && c.p && c.p.k === 2).length, 0);
  assert.equal(d.ev.find(x => x.e === 'wave').removed.length, cnt + 1);
});
ok('Funkdrohne fliegt zum offenen Ziel (Kiste)', () => {
  const d = fire(row(3, '3 4 0 1D 2 3 4'), 3, 3, 3, 2, { blockers: [{ x: 6, y: 6, t: 'crate', hp: 1 }], goals: [{ type: 'clear', what: 'crate' }] });
  const w = d.ev.find(x => x.e === 'wave');
  const fx = w.fx.find(f => f.t === 'drone');
  assert.equal(fx.to, I(d, 6, 6)); assert.equal(d.count('crate'), 0);
});
ok('Remix-Orb räumt eine 3 breite Reihe und Spalte', () => {
  const d = fire(row(3, '3 4 0 X 2 3 4'), 3, 3, 3, 2);
  for (let x = 0; x < 7; x++) for (let y = 1; y <= 3; y++) assert(empty(d, x, y));
  for (let y = 0; y < 7; y++) for (let x = 2; x <= 4; x++) assert(empty(d, x, y));
});
ok('Spezialteil in einem normalen Match wird mit ausgelöst (Kettenreaktion)', () => {
  const b = setup(row(0, '0 0V 1 0 4 2 3'));
  const d = dry(b); d.swap(I(d, 2, 0), I(d, 3, 0));
  for (let y = 0; y < 7; y++) assert(empty(d, 1, y));
});

// ---------- Kombinationsmatrix ----------
const COMBOS = [
  ['R+R Kreuzstrahl', '1H', '2V', d => { for (let i = 0; i < 7; i++) { assert(empty(d, i, 3)); assert(empty(d, 3, i)); } }],
  ['R+B breite Strahlen', '1H', '2B', d => { for (let i = 0; i < 7; i++) for (let k = 2; k <= 4; k++) { assert(empty(d, i, k)); assert(empty(d, k, i)); } }],
  ['B+B große Fläche 7×7', '1B', '2B', d => { assert(d.cells.filter(c => c && c.p).length === 0 || d.ev.find(x => x.e === 'wave').removed.length >= 40); }],
  ['D+R Drohne mit Rakete', '1D', '2H', d => { assert(d.ev.find(x => x.e === 'wave').fx.some(f => f.t === 'drone')); assert(d.ev.find(x => x.e === 'wave').fx.some(f => f.t === 'row')); }],
  ['D+B Drohne mit Bombe', '1D', '2B', d => { const w = d.ev.find(x => x.e === 'wave'); assert(w.fx.some(f => f.t === 'drone') && w.fx.some(f => f.t === 'blast' && f.r === 2)); }],
  ['D+D drei Drohnen', '1D', '2D', d => { assert.equal(d.ev.find(x => x.e === 'wave').fx.filter(f => f.t === 'drone').length, 3); }],
  ['O+R Steine werden Raketen', 'O', '2H', d => { const w = d.ev.find(x => x.e === 'wave'); assert(w.transformed.length > 0 && w.transformed.every(t => t.piece.s === 'rh' || t.piece.s === 'rv')); }],
  ['O+B Steine werden kleine Bomben', 'O', '2B', d => { const w = d.ev.find(x => x.e === 'wave'); assert(w.transformed.length > 0 && w.transformed.every(t => t.piece.s === 'bomb')); assert(w.fx.filter(f => f.t === 'blast').every(f => f.r === 1)); }],
  ['O+D Steine werden Drohnen', 'O', '2D', d => { const w = d.ev.find(x => x.e === 'wave'); assert(w.transformed.length > 0 && w.fx.filter(f => f.t === 'drone').length === w.transformed.length); }],
  ['O+O ganzes Brett', 'O', 'O', d => { assert.equal(d.cells.filter(c => c && c.p).length, 0); }],
  ['X+R Mega-Remix', 'X', '2H', d => { assert(d.ev.find(x => x.e === 'wave').removed.length >= 35); }],
  ['X+B Mega-Remix', 'X', '2B', d => { assert(d.ev.find(x => x.e === 'wave').removed.length >= 35); }],
  ['X+D Mega-Remix', 'X', '2D', d => { assert(d.ev.find(x => x.e === 'wave').removed.length >= 35); }],
  ['X+O ganzes Brett', 'X', 'O', d => { assert.equal(d.cells.filter(c => c && c.p).length, 0); }],
  ['X+X ganzes Brett', 'X', 'X', d => { assert.equal(d.cells.filter(c => c && c.p).length, 0); }],
];
COMBOS.forEach(([name, a, b, check]) => ok('Kombi ' + name, () => {
  const rows = BASE.slice(); const r2 = rows[2].split(' '); r2[3] = a; rows[2] = r2.join(' '); const r3 = rows[3].split(' '); r3[3] = b; rows[3] = r3.join(' ');
  const d = fire(rows, 3, 2, 3, 3, { blockers: [] });
  check(d);
}));
ok('Spezialteil + Kassette löst das Spezialteil aus', () => {
  const rows = row(3, '3 4 0 1H c 3 4');
  const d = fire(rows, 3, 3, 4, 3);
  assert.equal(kind(d, 3, 3), 'cassette');
  for (let x = 0; x < 7; x++) if (x !== 3) assert(empty(d, x, 3));
});

// ---------- Schwerkraft ----------
ok('Funkloch: Steine fallen darüber hinweg', () => {
  const e = setup(['0 1 2', '3 4 0', '1 2 3'], { mask: ['###', '#.#', '###'], colors: 5 });
  const top = e.cell(1, 0).p.id; e.cell(1, 2).p = null;
  e.gravity();
  assert.equal(e.cell(1, 2).p.id, top);
});
ok('Portal: Stein fällt vom Eingang zum Ausgang in eine andere Spalte', () => {
  const e = setup(['0 1 2', '3 4 0', '1 2 3'], { mask: ['#..', '#..', '..#'], portals: [[0, 1, 2, 2]] });
  const id = e.cell(0, 1).p.id; e.cell(2, 2).p = null;
  e.gravity();
  assert.equal(e.cell(2, 2).p.id, id);
  assert(e.ev.find(x => x.e === 'fall').moves.some(m => m.id === id && m.portal));
});
ok('Lücke unter Kiste wird seitlich nachgefüllt', () => {
  const e = setup(['0 1 2', '3 - 0', '1 2 3'], { blockers: [{ x: 1, y: 0, t: 'crate', hp: 1 }] });
  e.cell(1, 2).p = null; e.cell(1, 1).p = null;
  e.gravity();
  assert(e.cell(1, 1).p && e.cell(1, 2).p, 'beide Felder unter der Kiste gefüllt');
});
ok('Nachfüllen ist mit gleichem Seed reproduzierbar', () => {
  const a = setup(row(0, '0 0 1 0 4 2 3')), b = setup(row(0, '0 0 1 0 4 2 3'));
  a.swap(I(a, 2, 0), I(a, 3, 0)); b.swap(I(b, 2, 0), I(b, 3, 0));
  assert.equal(a.hash(), b.hash());
});

// ---------- Hindernisse ----------
const M3 = row(0, '0 0 1 0 4 2 3');   // Tausch (2,0)<->(3,0) ergibt 0 0 0 in Reihe 0
const swap3 = d => d.swap(I(d, 2, 0), I(d, 3, 0));
ok('Transportkiste: verliert pro benachbartem Match eine Lage', () => {
  const d = dry(setup(M3, { blockers: [{ x: 1, y: 1, t: 'crate', hp: 2 }] })); swap3(d);
  assert.equal(d.cell(1, 1).b.hp, 1);
});
ok('Kiste wird pro Match-Gruppe nur einmal getroffen, auch wenn mehrere Steine angrenzen', () => {
  const d = dry(setup(M3, { blockers: [{ x: 1, y: 1, t: 'crate', hp: 3 }] })); swap3(d);
  assert.equal(d.cell(1, 1).b.hp, 2);
});
ok('Rauschfeld: wird entstört, wenn der Stein darauf matcht', () => {
  const d = dry(setup(M3, { noise: [{ x: 0, y: 0, hp: 1 }, { x: 6, y: 6, hp: 1 }] })); swap3(d);
  assert.equal(d.cell(0, 0).n, 0); assert.equal(d.cell(6, 6).n, 1);
});
ok('Kabelsalat: Stein matcht mit, bleibt liegen, Kabel reißt', () => {
  const d = dry(setup(M3, { covers: [{ x: 0, y: 0, t: 'cable', hp: 1 }] })); swap3(d);
  assert(d.cell(0, 0).p && !d.cell(0, 0).c);
});
ok('Frequenzeis: Stein matcht nicht, Eis taut nur durch Nachbar-Match', () => {
  const e = setup(M3, { covers: [{ x: 0, y: 0, t: 'ice', hp: 2 }] });
  assert.equal(e.matchable(I(e, 0, 0)), false);
  const b = setup(M3, { covers: [{ x: 1, y: 1, t: 'ice', hp: 2 }] }); const d = dry(b); swap3(d);
  assert.equal(d.cell(1, 1).c.hp, 1); assert(d.cell(1, 1).p);
});
ok('Frequenzmoos: wächst ohne Moos-Treffer, wird durch Match daneben entfernt', () => {
  const e = setup(M3, { blockers: [{ x: 6, y: 6, t: 'moss', hp: 1 }] });
  swap3(e);
  assert(e.count('moss') >= 2, 'Moos ist gewachsen');
  const d = dry(setup(M3, { blockers: [{ x: 1, y: 1, t: 'moss', hp: 1 }] })); swap3(d);
  assert.equal(d.count('moss'), 0);
});
ok('Sendesperre + Ketten-Schalter: nur der Reihe nach, dann öffnet die Sperre', () => {
  const e = setup(BASE, { blockers: [{ x: 0, y: 6, t: 'switch', n: 1 }, { x: 6, y: 6, t: 'switch', n: 2 }, { x: 3, y: 6, t: 'barrier', key: 'switch' }] });
  const w = e._wave();
  e._damage(I(e, 6, 6), w, 'special'); assert.equal(e.count('switch'), 2, 'Schalter 2 vor 1 wirkt nicht');
  e._damage(I(e, 3, 6), w, 'special'); assert.equal(e.count('barrier'), 1, 'Sperre unzerstörbar');
  e._damage(I(e, 0, 6), w, 'special'); e._damage(I(e, 6, 6), w, 'special');
  assert.equal(e.count('switch'), 0); assert.equal(e.count('barrier'), 0);
});
ok('Verstaubte Platte: braucht mehrere Treffer', () => {
  const e = setup(BASE, { blockers: [{ x: 3, y: 6, t: 'dusty', hp: 3 }] }); const w = e._wave();
  e._damage(I(e, 3, 6), w, 'adj', 0); e._damage(I(e, 3, 6), w, 'adj', 0); assert.equal(e.count('dusty'), 1);
  e._damage(I(e, 3, 6), w, 'adj', 0); assert.equal(e.count('dusty'), 0);
});
ok('Röhrenverstärker: zündet nach drei Ladungen eine 3×3-Explosion', () => {
  const e = setup(BASE, { blockers: [{ x: 3, y: 3, t: 'amp' }] }); const w = e._wave();
  e._damage(I(e, 3, 3), w, 'adj', 0); e._damage(I(e, 3, 3), w, 'adj', 0); assert.equal(e.count('amp'), 1);
  e._damage(I(e, 3, 3), w, 'adj', 0); e._runQueue(w);
  assert.equal(e.count('amp'), 0); assert(empty(e, 2, 2) && empty(e, 4, 4) && !empty(e, 1, 1));
});
ok('Glasvitrine: bricht und gibt ein Plattenpaket frei, das unten ausgeliefert wird', () => {
  const e = setup(['0 1 2', '3 4 0', '1 2 3'], { blockers: [{ x: 1, y: 1, t: 'glass', hp: 1 }], goals: [{ type: 'deliver', what: 'parcel', n: 1 }] });
  const w = e._wave(); e._damage(I(e, 1, 1), w, 'adj', 0);
  assert.equal(kind(e, 1, 1), 'parcel');
  e.cell(1, 2).p = null; e._settle();
  assert.equal(e.stats.del.parcel, 1); assert(e.goalsMet());
});
ok('Empfangsantenne: nach letzter Reparatur Strahl durch die Reihe', () => {
  const e = setup(BASE, { blockers: [{ x: 3, y: 3, t: 'antenna', hp: 1 }] }); const w = e._wave();
  e._damage(I(e, 3, 3), w, 'adj', 0); e._runQueue(w);
  for (let x = 0; x < 7; x++) assert(empty(e, x, 3));
});
ok('Störsender: legt im Takt Rauschfelder, bis er zerstört ist', () => {
  const e = setup(M3, { blockers: [{ x: 6, y: 6, t: 'jammer', hp: 2, period: 2 }] });
  for (let t = 0; t < 4; t++) { const m = e.findMoves()[0]; e.swap(m[0], m[1]); }
  assert(e.count('noise') >= 1);
});
ok('Generator: nur Matches seiner Farbe daneben laden ihn', () => {
  const e = setup(BASE, { blockers: [{ x: 3, y: 3, t: 'generator', k: 2, need: 2 }] }); const w = e._wave();
  e._damage(I(e, 3, 3), w, 'adj', 1); assert.equal(e.cell(3, 3).b.charge, 0);
  e._damage(I(e, 3, 3), w, 'adj', 2); e._damage(I(e, 3, 3), w, 'adj', 2); assert.equal(e.count('generator'), 0);
});
ok('Generator aktiv öffnet Sendesperren mit Schlüssel Generator', () => {
  const e = setup(BASE, { blockers: [{ x: 3, y: 3, t: 'generator', k: 2, need: 1 }, { x: 0, y: 0, t: 'barrier', key: 'generator' }] }); const w = e._wave();
  e._damage(I(e, 3, 3), w, 'special'); assert.equal(e.count('barrier'), 0);
});
ok('Schutzschild: nur passende Farbe oder Spezialteil', () => {
  const e = setup(BASE, { blockers: [{ x: 3, y: 3, t: 'shield', k: 4, hp: 2 }] }); const w = e._wave();
  e._damage(I(e, 3, 3), w, 'adj', 1); assert.equal(e.cell(3, 3).b.hp, 2);
  e._damage(I(e, 3, 3), w, 'adj', 4); e._damage(I(e, 3, 3), w, 'special'); assert.equal(e.count('shield'), 0);
});
ok('Rollende Platte: rollt nach jedem Zug und kehrt am Rand um', () => {
  const e = setup(BASE, { blockers: [{ x: 5, y: 6, t: 'rolling', hp: 2, dir: 1 }] });
  e._endTurn(); assert.equal(e.cell(6, 6).b && e.cell(6, 6).b.t, 'rolling');
  e._endTurn(); assert.equal(e.cell(6, 6).b.dir, -1);
  e._endTurn(); assert.equal(e.cell(5, 6).b && e.cell(5, 6).b.t, 'rolling');
});
ok('Zielkassette: Spender liefert genau so viele Kassetten wie erlaubt', () => {
  const e = setup(BASE, { spawn: { cassette: { cols: [0, 1, 2, 3, 4, 5, 6], every: 1, total: 3 } } });
  for (let x = 0; x < 7; x++) e.cell(x, 0).p = null;
  e.gravity();
  assert.equal(e.cells.filter(c => c && c.p && c.p.item === 'cassette').length, 3);
});
ok('Spezialteile treffen keine Gegenstände', () => {
  const d = fire(row(3, '3 4 0 1H 2 c 4'), 3, 3, 3, 2);
  assert.equal(kind(d, 5, 3), 'cassette');
});

// ---------- Booster ----------
ok('Hammer: trifft eine Hindernislage, nicht aber die Sendesperre', () => {
  const e = setup(BASE, { blockers: [{ x: 3, y: 3, t: 'crate', hp: 2 }, { x: 0, y: 0, t: 'barrier', key: 'switch' }] });
  assert.equal(e.useBooster('hammer', I(e, 0, 0)).ok, false);
  assert.equal(e.useBooster('hammer', I(e, 3, 3)).ok, true); assert.equal(e.cell(3, 3).b.hp, 1);
  assert.equal(e.moves, 20, 'Booster kostet keinen Zug');
});
ok('Laser/Blitz/Basswelle/Suchlauf treffen die richtigen Felder', () => {
  let e = setup(BASE, { blockers: [{ x: 6, y: 2, t: 'crate', hp: 1 }] }); e.useBooster('laser', I(e, 0, 2)); assert.equal(e.count('crate'), 0);
  e = setup(BASE, { blockers: [{ x: 2, y: 6, t: 'crate', hp: 1 }] }); e.useBooster('blitz', I(e, 2, 0)); assert.equal(e.count('crate'), 0);
  e = setup(BASE, { blockers: [{ x: 4, y: 4, t: 'crate', hp: 1 }] }); e.useBooster('bass', I(e, 3, 3)); assert.equal(e.count('crate'), 0);
  e = setup(BASE, { blockers: [{ x: 0, y: 0, t: 'crate', hp: 1 }, { x: 6, y: 6, t: 'crate', hp: 1 }, { x: 0, y: 6, t: 'crate', hp: 1 }], goals: [{ type: 'clear', what: 'crate' }] });
  e.useBooster('scan'); assert.equal(e.status, 'won');
});
ok('Shuffle/Verstärker/Retter funktionieren und Verstärker nur einmal gleichzeitig', () => {
  let e = setup(BASE); assert.equal(e.useBooster('shuffle').ok, true); assert(!e.findGroups().length && e.hasMoves());
  e = setup(BASE); assert.equal(e.useBooster('boost').ok, true); assert.equal(e.useBooster('boost').ok, false);
  const m = e.findMoves()[0]; e.swap(m[0], m[1]); assert.equal(e.amped, false);
  e = setup(BASE, { goals: [{ type: 'collect', k: 3, n: 50 }] }); const before = e.cells.filter(c => c && c.p && c.p.k === 3).length;
  assert.equal(e.useBooster('rescue').ok, true); assert(e.stats.col[3] + e.cells.filter(c => c && c.p && c.p.k === 3).length >= before + 5 - 0);
});
ok('Booster nach Levelende nicht nutzbar', () => {
  const e = setup(BASE); e.status = 'won'; assert.equal(e.useBooster('laser', 0).ok, false);
});

// ---------- Ziele, Ende ----------
ok('Sieg im letzten Zug ist ein Sieg, keine Niederlage', () => {
  const e = setup(M3, { moves: 1, goals: [{ type: 'collect', k: 0, n: 3 }] });
  swap3(e); assert.equal(e.status, 'won'); assert.equal(e.moves, 0);
});
ok('Niederlage erst nach Abschluss aller Effekte, nie gleichzeitig mit Sieg', () => {
  const e = setup(M3, { moves: 1, goals: [{ type: 'collect', k: 0, n: 300 }] });
  swap3(e); assert.equal(e.status, 'lost'); assert.equal(e.goalsMet(), false);
  assert.equal(e.swap(0, 1).ok, false, 'nach Ende keine Züge');
});
ok('+5 Züge setzen das Brett fort (Fortsetzung, max. 1 Stern)', () => {
  const e = setup(M3, { moves: 1, goals: [{ type: 'collect', k: 0, n: 6 }] });
  swap3(e); assert.equal(e.status, 'lost'); const h = e.hash();
  assert.equal(e.addMoves(5), true); assert.equal(e.status, 'play'); assert.equal(e.moves, 5); assert.notEqual(e.hash(), h);
});
ok('Keine Züge mehr -> faires, reproduzierbares Mischen ohne Endlosschleife', () => {
  const rows = ['0 1 2 3', '2 3 0 1', '0 1 2 3', '2 3 0 1'];
  const a = setup(rows, { colors: 4 }), b = setup(rows, { colors: 4 });
  assert.equal(a.hasMoves(), false); a._ensureMoves(); b._ensureMoves();
  assert(a.hasMoves()); assert.equal(a.hash(), b.hash());
});
ok('Mischen auf fast leerem Brett bricht sauber ab', () => {
  const e = setup(['0 1', '2 3'], { colors: 4, blockers: [] });
  e.cell(0, 0).p = null; e.cell(1, 0).p = null;
  assert.equal(e.shuffle(true), false);
});
ok('Kopie ist unabhängig vom Original', () => {
  const e = setup(M3), c = e.clone(), h = e.hash(); swap3(c);
  assert.equal(e.hash(), h); assert.notEqual(c.hash(), h);
});

console.log(n + ' Engine-Tests bestanden');
