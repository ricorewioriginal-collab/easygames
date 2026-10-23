// Saftblitz – Kerntests:  node --test saftblitz/tests/
'use strict';
const test = require('node:test'), assert = require('node:assert');
const SB = require('../js/core.js');

test('Treffer Strecke–Kreis', () => {
  assert.ok(SB.segHit(0, 0, 1, 0, .5, .05, .06));
  assert.ok(!SB.segHit(0, 0, 1, 0, .5, .2, .06));
  assert.ok(SB.segHit(0, 0, 0, 0, .03, 0, .05), 'Punkt statt Strecke');
  assert.ok(!SB.segHit(0, 0, 1, 0, 1.2, 0, .1), 'hinter dem Ende');
});

test('Würfe: Früchte steigen ins Bild und fallen wieder', () => {
  const rnd = SB.rng(3);
  for (let k = 0; k < 200; k++) {
    const peak = .1 + rnd() * .3, s = SB.launch(rnd, 1.6, peak, .8);
    const tUp = -s.vy / SB.G, top = s.y + s.vy * tUp + .5 * SB.G * tUp * tUp;
    assert.ok(Math.abs(top - peak) < 1e-9, 'Gipfel ' + top + ' ≈ ' + peak);
    const xTop = s.x + s.vx * tUp; assert.ok(xTop > -.1 && xTop < 1.7, 'bleibt im Bild: ' + xTop);
  }
});

test('Wellen je Modus: Zen ohne Bomben, Klassik mit Bomben, Schwierigkeit steigt', () => {
  const rnd = SB.rng(9); let bombsZen = 0, bombsK = 0, nLow = 0, nHigh = 0;
  for (let k = 0; k < 400; k++) {
    bombsZen += SB.wave('zen', .7, 1.6, rnd).filter(s => s.type === 'bombe').length;
    bombsK += SB.wave('klassik', .7, 1.6, rnd, { lives: 3 }).filter(s => s.type === 'bombe').length;
    nLow += SB.wave('klassik', 0, 1.6, rnd, { lives: 3 }).length; nHigh += SB.wave('klassik', 1, 1.6, rnd, { lives: 3 }).length;
  }
  assert.strictEqual(bombsZen, 0); assert.ok(bombsK > 50); assert.ok(nHigh > nLow * 1.8, nLow + ' → ' + nHigh);
  const r = SB.wave('arcade', .5, 1.6, rnd, { rausch: true });
  assert.ok(r.length >= 3 && r.every(s => s.x < 0 || s.x > 1.6), 'Rausch kommt von den Seiten');
  for (const s of SB.wave('klassik', .5, 1.6, rnd, { lives: 3 })) assert.ok(SB.FRUITS[s.type] || SB.SPECIAL[s.type], s.type);
});

test('Wertung: Combos, kritisch, Takt, doppelt', () => {
  assert.deepStrictEqual(SB.scoreSwipe(1), { pts: 1, combo: 0 });
  assert.deepStrictEqual(SB.scoreSwipe(3), { pts: 6, combo: 3 });
  assert.strictEqual(SB.scoreSwipe(1, { crit: true }).pts, 11);
  assert.strictEqual(SB.scoreSwipe(2, { doppelt: true }).pts, 4);
  assert.strictEqual(SB.scoreSwipe(1, { onBeat: true, streak: 8 }).pts, 4);
  assert.strictEqual(SB.scoreSwipe(0).pts, 0);
});

test('Freischaltungen aufsteigend, Erfolge prüfbar', () => {
  for (const L of [SB.BLADES, SB.SCENES]) for (let k = 1; k < L.length; k++) assert.ok(L[k].need > L[k - 1].need);
  const r = { mode: 'klassik', score: 160, fruits: 120, maxCombo: 4, crit: 0, power: 0, kokos: 0, perfect: 0, missed: 0 };
  const got = SB.ACH.filter(a => a[2](r, { fruits: 120, total: 160 })).map(a => a[0]);
  assert.deepStrictEqual(got, ['erst', 'k50', 'k150', 'c4', 'clean']);
});
