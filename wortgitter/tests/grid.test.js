// Wortgitter – Logiktests:  node --test wortgitter/tests/
'use strict';
const test = require('node:test'), assert = require('node:assert'), fs = require('fs'), path = require('path');
const WF = require('../../wortfunk/js/logic.js'); global.WF = WF;
const WG = require('../js/grid.js');
const load = f => WF.Dict(new Uint32Array(fs.readFileSync(path.join(__dirname, '../../wortfunk/data/', f)).buffer.slice(0)));
const dict = load('woerter.dawg');

test('Gitter je Stufe: richtige Größe, genug Wörter, gleicher Startwert = gleiches Gitter', () => {
  for (const lv of ['leicht', 'mittel', 'schwer']) {
    const t0 = Date.now(), g = WG.make(lv, 2026, dict), L = WG.LEVELS[lv];
    assert.strictEqual(g.grid.length, L.n * L.n);
    assert.ok(g.words.size >= L.want * 0.6, lv + ': ' + g.words.size + ' Wörter');
    assert.ok(Date.now() - t0 < 4000, lv + ' schnell genug: ' + (Date.now() - t0) + ' ms');
    assert.deepStrictEqual(WG.make(lv, 2026, dict).grid, g.grid);
    for (const [w, p] of g.words) {
      assert.ok(WG.validPath(p, g.n), 'Weg ' + w);
      assert.strictEqual(WF.dec(p.map(i => g.grid[i])), w);
      assert.ok(Array.from(w).length >= L.min);
    }
    console.log(lv, L.label, g.words.size, 'Wörter', Date.now() - t0, 'ms');
  }
});

test('Prüfen: zu kurz, doppelt, unbekannt, Weg kaputt, ok', () => {
  const g = WG.make('leicht', 7, dict);
  const [w, p] = Array.from(g.words)[0];
  const r = WG.check(g, p, new Set(), dict); assert.strictEqual(r.res, 'ok'); assert.strictEqual(r.w, w);
  assert.strictEqual(WG.check(g, p, new Set([w]), dict).res, 'doppelt');
  assert.strictEqual(WG.check(g, p.slice(0, 2), new Set(), dict).res, 'kurz');
  assert.strictEqual(WG.check(g, [0, 15, 1], new Set(), dict).res, 'weg');
  assert.strictEqual(WG.check(g, [0, 0, 1], new Set(), dict).res, 'weg');
});

test('Tastatur: Weg zu getipptem Wort finden', () => {
  const g = WG.make('mittel', 99, dict);
  for (const [w] of Array.from(g.words).slice(0, 50)) {
    const p = WG.findPath(g.grid, g.n, WF.enc(w));
    assert.ok(p && WG.validPath(p, g.n) && WF.dec(p.map(i => g.grid[i])) === w, w);
  }
  assert.strictEqual(WG.findPath(g.grid, g.n, WF.enc('QQQ')), null);
});

test('Mehrspieler: doppelte Wörter zählen nicht, Punkte nach Länge', () => {
  assert.deepStrictEqual([3, 4, 5, 6, 7, 8, 9].map(WG.points), [1, 2, 3, 5, 8, 12, 16]);
  const r = WG.scoreRound([['HAUS', 'MAUS', 'ÄRGER'], ['HAUS', 'ROT']], true);
  assert.strictEqual(r[0].score, 2 + 3); assert.strictEqual(r[1].score, 1);
  assert.strictEqual(WG.scoreRound([['HAUS'], ['HAUS']], false)[1].score, 2);
});
