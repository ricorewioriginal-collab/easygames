'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const CPU = require('./load.js');
const B = CPU.board, C = CPU.cell, K = CPU.K;
const rows = b => B.toRows(b);
const at = (b, x, y) => x + y * b.w;

test('Floodfill: nur 4 Richtungen, keine Diagonalen', () => {
  const b = B.fromRows(['01', '10']);
  assert.deepEqual(B.group(b, 0), []);           // Diagonale zählt nicht
  assert.equal(B.groups(b).length, 0);
  assert.equal(B.hasMove(b), false);
});
test('Floodfill: Einzelstein nicht entfernbar, 1x2 Gruppe schon', () => {
  const b = B.fromRows(['001', '211']);
  assert.deepEqual(B.group(b, at(b, 0, 1)), []);   // Einzelstein
  assert.deepEqual(B.group(b, 0), [0, 1]);
  assert.equal(B.resolve(b, at(b, 0, 1), {}), null);
});
test('Floodfill: lange, gezackte Gruppe wird komplett erfasst; alle Farben', () => {
  const b = B.fromRows(['0111', '0101', '0001', '2220']);
  assert.equal(B.group(b, 0).length, 6);
  assert.equal(B.group(b, 1).length, 6);          // 1er-Haken mit Ecke
  for (let c = 0; c < 7; c++) { const bb = B.fromRows([String(c) + String(c)]); assert.equal(B.group(bb, 1).length, 2, 'Farbe ' + c); }
});
test('Ein Klick entfernt die GANZE Gruppe', () => {
  const b = B.fromRows(['000', '010', '000']);
  const r = B.resolve(b, 0, {});
  assert.equal(r.removed.length, 8);
  assert.deepEqual(rows(b), ['...', '...', '1..']);   // Rest fällt und rückt nach links
});
test('Schwerkraft: inneres Loch, stabile Reihenfolge, keine Duplikate', () => {
  const b = B.fromRows(['2', '0', '0', '3', '1']);
  const ids = Array.from(b.ids);
  B.resolve(b, 1, {});
  assert.deepEqual(rows(b), ['.', '.', '2', '3', '1']);
  assert.equal(b.ids[2], ids[0]); assert.equal(b.ids[3], ids[3]);
  const seen = new Set(Array.from(b.ids).filter(Boolean)); assert.equal(seen.size, 3);
});
test('Leere Spalten rücken nach links: links, rechts, mehrfach', () => {
  let b = B.fromRows(['0122', '0122']);           // linke Spalte leer
  B.resolve(b, 0, {}); assert.deepEqual(rows(b), ['122.', '122.']);
  b = B.fromRows(['1200', '1200']);               // rechter Rand
  B.resolve(b, 2, {}); assert.deepEqual(rows(b), ['12..', '12..']);
  b = B.fromRows(['10021', '10021']);             // zwei leere Spalten in der Mitte
  B.resolve(b, 1, {}); assert.deepEqual(rows(b), ['121..', '121..']);
  b = B.fromRows(['0000', '0000']);
  B.resolve(b, 0, {}); assert.equal(B.isClear(b), true);
});
test('Ganze Spalte entfernen', () => {
  const b = B.fromRows(['10', '12', '13']);
  B.resolve(b, 0, {});
  assert.deepEqual(rows(b), ['0.', '2.', '3.']);
});
test('Nach dem Fallen wird nichts automatisch aufgelöst', () => {
  const b = B.fromRows(['1', '0', '0', '1']);
  B.resolve(b, 1, {});
  assert.deepEqual(rows(b), ['.', '.', '1', '1']);   // neue 1er-Gruppe bleibt stehen
  assert.equal(B.groups(b).length, 1);
});
test('Andere Fallrichtungen nur auf Wunsch (Spezialregel)', () => {
  let b = B.fromRows(['1001', '2332']);
  B.resolve(b, 1, { gravity: CPU.DIR.UP });
  assert.deepEqual(rows(b), ['1331', '2..2']);
  b = B.fromRows(['1001', '2332']);
  B.resolve(b, 1, { gravity: CPU.DIR.LEFT });
  assert.deepEqual(rows(b), ['11..', '2332']);
});
test('Punkte: (n-2)^2*10 für 2,3,4,6,10,20', () => {
  assert.deepEqual([2, 3, 4, 6, 10, 20].map(CPU.points), [0, 10, 40, 160, 640, 3240]);
});
test('Vollclear-Bonus +1000 und Spielende', () => {
  const g = new CPU.Game({ board: B.fromRows(['00', '00']), colors: 1 });
  const r = g.move(0);
  assert.equal(r.gain, 40 + 1000); assert.equal(g.score, 1040);
  assert.deepEqual(g.status(), { over: true, reason: 'clear' });
  assert.equal(g.finish().cleared, true);
});
test('Endbedingungen: keine Züge, noch Züge, Zuglimit, Ziel', () => {
  const g = new CPU.Game({ board: B.fromRows(['01', '10']) });
  assert.equal(g.status().reason, 'nomoves');
  const g2 = new CPU.Game({ board: B.fromRows(['0011', '2233']), moves: 2, goals: [{ t: 'score', n: 1 }] });
  assert.equal(g2.status().over, false);
  g2.move(g2.legal()[0].i); g2.move(g2.legal()[0].i);
  assert.equal(g2.status().reason, 'moves');
  assert.equal(g2.move(0), null, 'kein Zug über das Limit');
  assert.equal(g2.finish().won, false, 'Ziel 1 Punkt nicht erreicht (2er = 0 Punkte)');
  const g3 = new CPU.Game({ board: B.fromRows(['000', '111']), goals: [{ t: 'score', n: 10 }] });
  g3.move(0); assert.equal(g3.goalsMet(), true);
});
test('Ungültige Klicks: außerhalb, leer, während Spielende', () => {
  const g = new CPU.Game({ board: B.fromRows(['00', '12']) });
  assert.equal(g.move(-1), null); assert.equal(g.move(99), null); assert.equal(g.move(2), null);
  g.move(0); assert.equal(g.move(0), null, 'leeres Feld');
  g.finish(); assert.equal(g.move(2), null);
});
test('Bombe sprengt 3x3, Eis verliert Schicht statt zu verschwinden', () => {
  const b = B.fromRows(['1111', '1001', '1111']);
  b.cells[at(b, 1, 1)] = C.mk(0, K.BOMB);
  b.cells[at(b, 2, 0)] = C.setIce(C.mk(1), 2);
  const r = B.resolve(b, at(b, 2, 1), {});
  assert.equal(r.effects[0].t, 'bomb');
  assert.ok(r.removed.length >= 7);
  const iceCell = Array.from(b.cells).find(v => C.ice(v) > 0);
  assert.equal(C.ice(iceCell), 1, 'genau eine Schicht weniger (nur ein Schaden pro Zug)');
});
test('Eis: hält fest, nicht wählbar, Nachbargruppe bricht Schicht', () => {
  const b = B.fromRows(['2', '0', '0']);
  b.cells[0] = C.setIce(b.cells[0], 1);
  assert.deepEqual(B.group(b, 0), []);
  B.resolve(b, 1, {});
  assert.equal(b.cells[0], 0);
  assert.equal(C.ice(b.cells[2]), 0);
  assert.equal(C.color(b.cells[2]), 2, 'Schicht gebrochen → Stein ist frei und fällt im selben Zug');
});
test('Rakete räumt Reihe, Kette reißt verbundene Kettensteine mit', () => {
  let b = B.fromRows(['1212', '0012']);
  b.cells[0] = C.mk(1, K.ROCKET, 0, 0);
  b.cells[at(b, 0, 1)] = C.mk(0, K.NORMAL);
  B.resolve(b, at(b, 0, 1), {});
  b = B.fromRows(['0122', '0331']);
  b.cells[at(b, 1, 0)] = C.mk(1, K.CHAIN); b.cells[at(b, 1, 1)] = C.mk(3, K.CHAIN); b.cells[at(b, 2, 1)] = C.mk(3, K.CHAIN);
  const r = B.resolve(b, 0, {});
  assert.ok(r.effects.length === 0, 'Gruppe 0 hat keine Kette');
  const b2 = B.fromRows(['11', '23']);
  b2.cells[0] = C.mk(1, K.CHAIN); b2.cells[2] = C.mk(2, K.CHAIN); b2.cells[3] = C.mk(3, K.CHAIN);
  const r2 = B.resolve(b2, 1, {});
  assert.equal(r2.removed.length, 4, 'Kette nimmt alle verbundenen Kettensteine jeder Farbe mit');
});
test('Prisma verbindet als Joker, ist allein nicht wählbar', () => {
  const b = B.fromRows(['0x0'], { x: C.mk(-1, K.PRISM) });
  assert.deepEqual(B.group(b, 1), []);
  assert.equal(B.group(b, 0).length, 3);
});
test('Regenbogen färbt Zielfarbe um, Neon wechselt Farbe, Wind lenkt einen Zug', () => {
  let b = B.fromRows(['002', '112']);
  b.cells[0] = C.mk(0, K.RAINBOW, 0, 2);
  B.resolve(b, 0, {});
  assert.ok(!Array.from(b.cells).some(v => v && C.color(v) === 2), 'alle 2er wurden 0er');
  b = B.fromRows(['21', '00']); b.cells[0] = C.mk(2, K.NEON);
  B.resolve(b, 2, { colorCount: 3 });
  assert.equal(C.color(b.cells[at(b, 0, 1)]), 0, 'Neon 2 → 0 (3 Farben)');
  b = B.fromRows(['1..', '200', '1..']); b.cells[at(b, 1, 1)] = C.mk(0, K.WIND, 0, CPU.DIR.LEFT);
  const r = B.resolve(b, at(b, 2, 1), {});
  assert.equal(r.gravity, CPU.DIR.LEFT);
});
test('Hitzebombe zündet durch Nachbarschaft, Kettenreaktion endet (keine Endlosschleife)', () => {
  const b = B.create(10, 10);
  for (let i = 0; i < 100; i++) B.set(b, i, C.mk(i % 2 ? 1 : 2, K.BOMB, 0, 1));
  B.set(b, 0, C.mk(0)); B.set(b, 1, C.mk(0));
  const r = B.resolve(b, 0, {});
  assert.equal(r.removed.length, 100, 'alles gesprengt, aber jedes Feld nur einmal');
});
test('Holz zerbricht, Fels braucht Treffer, Anker fällt nie', () => {
  const b = B.fromRows(['w', '0', '0', 'r', 'a', '.'], { w: C.mk(-1, K.WOOD), r: C.mk(-1, K.ROCK, 0, 2), a: C.mk(1, K.ANCHOR) });
  const r = B.resolve(b, 1, {});
  assert.equal(r.passive.length, 1, 'Holz zerbrochen');
  assert.equal(C.arg(b.cells[3]), 1, 'Fels hat noch 1 Treffer');
  assert.equal(C.kind(b.cells[4]), K.ANCHOR, 'Anker bleibt in Reihe 4');
  assert.equal(b.cells[5], 0);
});
test('Sammelobjekte werden am Boden eingesammelt', () => {
  const b = B.fromRows(['s', '0', '0'], { s: C.mk(-1, K.ITEM, 0, 1) });
  const r = B.resolve(b, 1, {});
  assert.equal(r.collected.length, 1);
  assert.equal(B.isClear(b), true);
});
test('Portale tauschen die Steine darüber, Förderband dreht Reihe', () => {
  const P = C.mk(-1, K.PORTAL, 0, 0);
  const b = B.fromRows(['1.2', '003', 'pqp'], { p: P, q: C.mk(3) });
  B.resolve(b, at(b, 0, 1), {});
  assert.deepEqual([C.color(b.cells[at(b, 0, 1)]), C.color(b.cells[at(b, 2, 1)])], [3, 1]);
  const c = B.fromRows(['123', '444']);
  B.resolve(c, at(c, 0, 1), { conveyors: [1], collapse: false });
  assert.deepEqual(rows(c), ['...', '312']);
});
test('Löcher (Inseln): Steine landen darauf, Spalten mit Loch rücken nicht', () => {
  const b = B.fromRows(['10', '00', '#0']);
  B.resolve(b, at(b, 1, 0), {});
  assert.deepEqual(rows(b), ['..', '1.', '#.']);
});
test('Booster: Hammer, Mini-Bombe, Farbwechsler, Mischer (deterministisch)', () => {
  const mk = () => new CPU.Game({ board: B.fromRows(['0120', '1201', '2012']), colors: 3, seed: 5, allowUndo: true });
  const g = mk();
  assert.ok(g.booster('hammer', 0)); assert.equal(g.score, 0); assert.equal(g.movesUsed, 0);
  assert.ok(g.booster('color', 5)); assert.ok(g.booster('mini', 6));
  const a = mk(), b = mk();
  a.booster('shuffle'); b.booster('shuffle');
  assert.deepEqual(rows(a.board), rows(b.board), 'Mischen ist reproduzierbar');
  assert.equal(a.hasMove(), true);
  assert.equal(a.stats.boosters, 1);
});
test('Undo nur, wenn erlaubt; stellt Punkte und Brett exakt her', () => {
  const g = new CPU.Game({ board: B.fromRows(['000', '112']), allowUndo: true });
  const before = rows(g.board);
  g.move(0); assert.ok(g.score > 0);
  assert.equal(g.undo(), true); assert.deepEqual(rows(g.board), before); assert.equal(g.score, 0); assert.equal(g.stats.undos, 1);
  const h = new CPU.Game({ board: B.fromRows(['000', '112']) });
  h.move(0); assert.equal(h.undo(), false, 'Klassik/Wertung: kein Undo');
});
test('Speichern/Fortsetzen einer laufenden Runde', () => {
  const g = new CPU.Game({ board: CPU.modes.classicBoard(8, 8, 4, 9), colors: 4 });
  g.move(g.legal()[0].i);
  const s = JSON.parse(JSON.stringify(g.save()));
  const g2 = new CPU.Game({ board: CPU.modes.classicBoard(8, 8, 4, 9), colors: 4 }).load(s);
  assert.deepEqual(rows(g2.board), rows(g.board)); assert.equal(g2.score, g.score); assert.equal(g2.movesUsed, 1);
});
test('Deterministische Bretter: gleicher Startwert = gleiches Brett', () => {
  const a = CPU.modes.classicBoard(12, 12, 5, 777), b = CPU.modes.classicBoard(12, 12, 5, 777), c = CPU.modes.classicBoard(12, 12, 5, 778);
  assert.equal(B.key(a), B.key(b)); assert.notEqual(B.key(a), B.key(c));
  assert.equal(CPU.hash('daily-2026-10-18'), CPU.hash('daily-2026-10-18'));
});
