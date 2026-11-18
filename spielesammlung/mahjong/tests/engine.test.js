/* Regeltests: node --test mahjong/tests/*.test.js */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const E = require('../js/engine.js'), L = require('../js/layouts.js'), S = require('../js/save.js');

test('alle Layouts: gerade Steinzahl, höchstens 144, keine Überschneidung, nichts schwebt', () => {
  assert.strictEqual(L.LAYOUTS.length, 29);
  for (const l of L.LAYOUTS) {
    assert.ok(l.count % 2 === 0 && l.count >= 24 && l.count <= 144, l.id + ': ' + l.count);
    assert.deepStrictEqual(E.overlaps(l.tiles), [], l.id + ' überschneidet sich');
    for (const t of l.tiles) if (t.z > 0) assert.ok(l.tiles.some(b => b.z === t.z - 1 && Math.abs(b.x - t.x) < 2 && Math.abs(b.y - t.y) < 2), l.id + ' schwebt');
  }
  assert.strictEqual(L.BY_ID.schildkroete.count, 144);
});

test('Freiheit: oben belegt oder beidseitig eingeklemmt = blockiert', () => {
  const pos = [{ x: 0, y: 0, z: 0 }, { x: 2, y: 0, z: 0 }, { x: 4, y: 0, z: 0 }, { x: 2, y: 0, z: 1 }];
  const g = E.buildGraph(pos), alive = Uint8Array.from([1, 1, 1, 1]);
  assert.ok(E.isFree(g, alive, 0)); assert.ok(E.isFree(g, alive, 2)); assert.ok(!E.isFree(g, alive, 1)); assert.ok(E.isFree(g, alive, 3));
  alive[3] = 0; assert.ok(!E.isFree(g, alive, 1));   // links und rechts Nachbarn
  alive[0] = 0; assert.ok(E.isFree(g, alive, 1));
  // halb versetzter Stein darüber blockiert beide darunter
  const g2 = E.buildGraph([{ x: 0, y: 0, z: 0 }, { x: 2, y: 0, z: 0 }, { x: 1, y: 0, z: 1 }]);
  const a2 = Uint8Array.from([1, 1, 1]);
  assert.ok(!E.isFree(g2, a2, 0) && !E.isFree(g2, a2, 1) && E.isFree(g2, a2, 2));
});

test('Bilder: Blumen und Jahreszeiten passen untereinander, sonst nur gleiche', () => {
  assert.ok(E.matches(34, 37)); assert.ok(E.matches(38, 41)); assert.ok(!E.matches(34, 38));
  assert.ok(E.matches(5, 5)); assert.ok(!E.matches(5, 6));
  const all = E.fullPairs(); assert.strictEqual(all.length, 72);
  const cnt = {}; all.forEach(p => p.forEach(f => { cnt[f] = (cnt[f] || 0) + 1; }));
  for (let f = 0; f < 34; f++) assert.strictEqual(cnt[f], 4);
  for (let f = 34; f < 42; f++) assert.strictEqual(cnt[f], 1);
});

test('jedes Level und viele Tagesrätsel: lösbar gemischt, Lösung geht vollständig auf', () => {
  const defs = L.LEVELS.slice();
  for (let d = 0; d < 40; d++) defs.push(L.dailyFor('2026' + String(100 + d * 7)));
  for (const def of defs) {
    const g = new E.Game({ layout: L.BY_ID[def.layout], seed: def.seed });
    assert.ok(g.solution, def.id + ': keine Lösung');
    let t = 0;
    for (const [a, b] of g.solution) {
      assert.ok(g.isFree(a) && g.isFree(b) && E.matches(g.faces[a], g.faces[b]), def.id + ': Lösungsschritt ungültig');
      g.tap(a, t); const r = g.tap(b, t += 1000); assert.strictEqual(r.type, 'match');
    }
    assert.ok(g.won(), def.id);
  }
});

test('Mischen: verbleibende Steine bleiben dieselben und sind wieder lösbar', () => {
  for (let s = 1; s <= 30; s++) {
    const g = new E.Game({ layout: L.BY_ID.schildkroete, seed: s });
    for (let k = 0; k < 20; k++) { const m = g.moves()[0]; if (!m) break; g.match(m[0], m[1], k * 9000); }
    const before = []; for (let i = 0; i < g.g.n; i++) if (g.alive[i]) before.push(E.group(g.faces[i]));
    assert.ok(g.reshuffle(false));
    const after = []; for (let i = 0; i < g.g.n; i++) if (g.alive[i]) after.push(E.group(g.faces[i]));
    assert.deepStrictEqual(after.sort(), before.sort());
    for (const [a, b] of g.solution) { assert.ok(g.isFree(a) && g.isFree(b) && E.matches(g.faces[a], g.faces[b])); g.match(a, b, 0); }
    assert.ok(g.won());
  }
});

test('Mischen meldet unmögliche Lage (zwei Steine übereinander)', () => {
  const layout = { id: 't', tiles: [{ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }] };
  const g = new E.Game({ layout, seed: 1, solvable: false });
  assert.strictEqual(g.reshuffle(false), false);
});

test('Rückgängig, Kombo, Punkte, Tipp-Abzug', () => {
  const g = new E.Game({ layout: L.BY_ID.pyramide, seed: 3 });
  const [a, b] = g.solution[0], [c, d] = g.solution[1];
  g.match(a, b, 0); assert.strictEqual(g.score, 10);
  g.match(c, d, 2000); assert.strictEqual(g.combo, 2); assert.strictEqual(g.score, 30);
  assert.deepStrictEqual(g.undo(), [c, d]); assert.strictEqual(g.score, 10); assert.ok(g.alive[c] && g.alive[d]);
  const h = g.hint(); assert.ok(h && E.matches(g.faces[h[0]], g.faces[h[1]])); assert.strictEqual(g.score, 0);
  // Abzug nach einem Paar bleibt beim Rückgängig erhalten
  g.match(a, b, 50000); g.match(c, d, 52000); const s0 = g.score; g.hint(); g.undo();
  assert.strictEqual(g.score, Math.max(0, s0 - 20 - 20));
});

test('Spielstand: Partie speichern und fortsetzen', () => {
  const g = new E.Game({ layout: L.BY_ID.festung, seed: 9 });
  g.solution.slice(0, 10).forEach(([a, b], k) => g.match(a, b, k * 9000));
  g.time = 12345;
  const js = JSON.parse(JSON.stringify(g.toJSON()));
  const r = new E.Game({ layout: L.BY_ID.festung, seed: 9, state: js });
  assert.strictEqual(r.remaining(), g.remaining()); assert.strictEqual(r.score, g.score); assert.strictEqual(r.time, 12345);
  assert.deepStrictEqual(Array.from(r.faces), Array.from(g.faces));
  assert.deepStrictEqual(r.undo(), g.solution[9]);
  assert.throws(() => new E.Game({ layout: L.BY_ID.festung, seed: 9, state: { faces: [1], alive: [1] } }));
});

test('Speicher-Reparatur: Müll wird verworfen, gültige Werte bleiben', () => {
  const d = S.repair({ lv: { 'w1-1': { s: 9, t: 50, p: 'x' }, 'boese': {} }, opt: { sfx: 3, style: 'clear', pitch: 10 }, stats: { wins: -4, pairs: 12 }, ach: { sieg1: 5, fake: 1 } });
  assert.deepStrictEqual(d.lv, { 'w1-1': { s: 3, t: 50, p: 0 } });
  assert.strictEqual(d.opt.sfx, S.DEF_OPT.sfx); assert.strictEqual(d.opt.style, 'clear'); assert.strictEqual(d.opt.pitch, 10);
  assert.strictEqual(d.stats.wins, 0); assert.strictEqual(d.stats.pairs, 12);
  assert.deepStrictEqual(Object.keys(d.ach), ['sieg1']);
  assert.deepStrictEqual(S.repair('kaputt'), S.blank());
});
