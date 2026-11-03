// Ich bin das Licht – Logik-Tests.  node --test ich-bin-das-licht/tests/core.test.js
'use strict';
const test = require('node:test'), assert = require('node:assert');
const L = require('../js/core.js');

test('Geschichte: jedes Kapitel hat Text und genau eine Fortsetzung', () => {
  assert.ok(L.CHAPTERS.length >= 10);
  for (const c of L.CHAPTERS) {
    assert.ok(c.title && c.lines.length, c.title);
    const kinds = [!!c.choices, !!c.studio, !!c.show, !!c.end].filter(Boolean).length;
    assert.strictEqual(kinds, 1, c.title);
    for (const [who] of c.lines) assert.ok(who === '' || L.PEOPLE[who], 'Sprecher ' + who);
    for (const p of c.cast) assert.ok(L.PEOPLE[p], 'Figur ' + p);
  }
  assert.ok(L.CHAPTERS.some(c => c.studio) && L.CHAPTERS.some(c => c.show));
});

test('Licht: mutiger Weg erreicht das beste Ende, leiser Weg nicht', () => {
  assert.ok(L.maxStoryLight() >= 100);
  let brave = L.LIGHT_START + 10 + 20, quiet = L.LIGHT_START;
  for (const c of L.CHAPTERS) if (c.choices) { brave += Math.max(...c.choices.map(x => x.light)); quiet += Math.min(...c.choices.map(x => x.light)); }
  assert.strictEqual(L.ending(L.clampLight(brave)).id, 'licht');
  assert.notStrictEqual(L.ending(L.clampLight(quiet)).id, 'licht');
});

test('Garderobe: Look normalisieren und durchschalten', () => {
  assert.deepStrictEqual(L.normLook({ wig: 'gibtsnicht' }), L.DEFAULT_LOOK);
  let l = L.DEFAULT_LOOK; for (let i = 0; i < L.WARDROBE.wig.length; i++) l = L.cycle(l, 'wig', 1);
  assert.strictEqual(l.wig, L.DEFAULT_LOOK.wig);
  assert.strictEqual(L.cycle(L.DEFAULT_LOOK, 'wig', -1).wig, L.WARDROBE.wig[L.WARDROBE.wig.length - 1].id);
});

test('Noten: sortiert, im Song, gültige Spuren, Schwer dichter als Leicht', () => {
  const e = L.chart({ diff: 'leicht', len: 200 }), h = L.chart({ diff: 'schwer', len: 200 });
  for (const n of h) { assert.ok(n.lane >= 0 && n.lane < 4); assert.ok(n.t >= 2 && n.t < 197); }
  for (let i = 1; i < h.length; i++) assert.ok(h[i].t >= h[i - 1].t);
  assert.ok(h.length > e.length * 2, e.length + ' / ' + h.length);
  assert.deepStrictEqual(L.chart({ diff: 'normal', len: 120, seed: 3 }), L.chart({ diff: 'normal', len: 120, seed: 3 }));
});

test('Wertung: perfektes Spiel = 3 Sterne, nichts drücken = 0', () => {
  const S = L.newShow({ diff: 'normal', len: 90 });
  for (const n of S.notes) { L.tick(S, n.t - 0.01); L.press(S, n.lane, n.t + 0.01); }
  L.tick(S, 999);
  assert.strictEqual(S.counts.miss, 0); assert.strictEqual(L.stars(L.accuracy(S)), 3); assert.strictEqual(L.showLight(S), 20);
  assert.ok(S.maxCombo === S.notes.length && S.score > S.notes.length * 300);
  const Z = L.newShow({ diff: 'normal', len: 90 }); L.tick(Z, 999);
  assert.strictEqual(Z.counts.miss, Z.notes.length); assert.strictEqual(L.stars(L.accuracy(Z)), 0);
});

test('Wertung: Zeitfenster und falsche Spur', () => {
  assert.strictEqual(L.judge(0.05), 'perfect'); assert.strictEqual(L.judge(-0.1), 'good'); assert.strictEqual(L.judge(0.2), 'brave'); assert.strictEqual(L.judge(0.3), null);
  const S = L.newShow({ diff: 'leicht', len: 60 }), n = S.notes[0];
  assert.strictEqual(L.press(S, (n.lane + 1) % 4, n.t), null);
  assert.strictEqual(L.press(S, n.lane, n.t), 'perfect');
  assert.strictEqual(L.press(S, n.lane, n.t), null, 'Note nur einmal treffbar');
});

test('Spielstand: kaputte Daten werden repariert', () => {
  const s = L.fixSave({ best: { normal: 5 }, look: { wig: 'x' }, opt: { diff: 'schwer' } });
  assert.strictEqual(s.best.normal, 5); assert.strictEqual(s.best.leicht, 0); assert.strictEqual(s.look.wig, 'cover'); assert.strictEqual(s.opt.diff, 'schwer'); assert.strictEqual(s.opt.bpm, L.SONG.bpm);
  assert.deepStrictEqual(L.fixSave(null), L.newSave());
});

test('Erkunden: Ziele und Lichtfunken', () => {
  const ex = L.CHAPTERS.filter(c => c.goal); assert.ok(ex.length >= 8);
  for (const c of ex) assert.ok(c.obj, c.title);
  const a = L.sparkPlan(3, 5), b = L.sparkPlan(3, 5);
  assert.deepStrictEqual(a, b); assert.strictEqual(new Set(a.map(x => x.i)).size, 3); assert.ok(a.every(x => x.i < 5));
  assert.strictEqual(L.maxSparks(), ex.length * 3);
  assert.deepStrictEqual(L.fixSave({ sparks: [1, 'x', 2] }).sparks, [1, 2]);
});
