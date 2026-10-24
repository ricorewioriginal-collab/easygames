// FALL·AKTE – Kern-Tests: node --test fall-akte/tests/core.test.js
const test = require('node:test'), assert = require('node:assert');
const FA = require('../js/core.js'), D = require('../js/data.js');

// Alle Spuren finden und lösen, alle nötigen Fragen stellen → wer bleibt übrig?
function solve(C) {
  const st = FA.newState(C); st.left = 99;
  C.clues.forEach(c => { st.found.add(c.id); if (c.lab) st.solved.add(c.id); });
  for (const c of C.clues) if (FA.ASK.includes(c.attr)) C.sus.forEach(s => FA.ask(C, st, s.i, c.attr));
  return { st, v: FA.verdict(C, st) };
}

test('Daten: 6 Welten mit je 3 Schauplätzen, genug Figuren, Spuren-Texte', () => {
  assert.equal(D.WORLDS.length, 6);
  for (const W of D.WORLDS) {
    assert.equal(W.locs.length, 3, W.id); assert.ok(W.cast.length >= 6, W.id); assert.ok(W.motives.length >= 3);
    W.locs.forEach(L => assert.ok(L.objs.length >= 6, L.id));
  }
  for (const a in D.CLUES) assert.equal(typeof D.CLUES[a].text, 'function');
});

test('Jeder Kampagnenfall ist eindeutig lösbar – und nie mit nur einer Spur', () => {
  for (let w = 0; w < 6; w++) for (let k = 0; k < 3; k++) {
    const C = FA.campaign(w, k), { v } = solve(C);
    assert.equal(C.sus.length, 3 + k);
    const left = v.map((x, i) => x.s !== 'out' ? i : -1).filter(i => i >= 0);
    assert.deepEqual(left, [C.culprit], 'Fall ' + w + '/' + k);
    for (const c of C.clues) assert.ok(c.elim.length <= Math.ceil((C.n - 1) / 2), 'keine Spur klärt alles');
    assert.ok(C.clues.length >= 2);
  }
});

test('Tausende Zufallsfälle: immer genau ein Täter übrig, Fundorte verschieden, Labor-Daten vollständig', () => {
  for (let s = 1; s < 2500; s++) {
    const C = FA.makeCase({ world: s % 6, seed: s * 7919, n: 3 + s % 3 }), { v } = solve(C);
    assert.equal(v.filter(x => x.s !== 'out').length, 1, 'Seed ' + s); assert.equal(v[C.culprit].s, 'ok');
    const spots = C.clues.map(c => c.loc + '.' + c.obj); assert.equal(new Set(spots).size, spots.length);
    for (const c of C.clues) {
      if (c.lab === 'cipher') { assert.ok(c.msg && c.shift > 0); assert.equal(FA.caesar(FA.caesar(c.msg, c.shift), -c.shift), c.msg); }
      if (c.lab === 'letter') { assert.equal(c.order.length, 4); assert.equal(c.rot.length, 4); }
      if (c.lab === 'print') assert.equal(c.decoys.length, 2);
      if (c.lab === 'shoe') assert.ok(c.start !== c.val);
    }
  }
});

test('Gleicher Seed = gleicher Fall; Tagesfall ist für alle gleich', () => {
  assert.deepEqual(FA.makeCase({ world: 2, seed: 42, n: 4 }), FA.makeCase({ world: 2, seed: 42, n: 4 }));
  const d = new Date(2026, 9, 24); assert.deepEqual(FA.daily(d), FA.daily(d)); assert.equal(FA.daily(d).day, '2026-10-24');
  assert.notDeepEqual(FA.daily(d).sus, FA.daily(new Date(2026, 9, 25)).sus);
});

test('Verhör, Fragenbudget, Anklage, Punkte und Sterne', () => {
  const C = FA.campaign(0, 1), st = FA.newState(C), q = st.left;
  assert.equal(FA.ask(C, st, 0, 'shoe'), C.sus[0].shoe); assert.equal(st.left, q - 1);
  assert.equal(FA.ask(C, st, 0, 'shoe'), null, 'doppelte Frage kostet nichts'); assert.equal(st.left, q - 1);
  const wrong = (C.culprit + 1) % C.n;
  assert.equal(FA.accuse(C, st, wrong), false); assert.equal(st.wrong, 1); assert.equal(st.done, false);
  assert.equal(FA.accuse(C, st, C.culprit), true); assert.ok(st.ok && st.done);
  assert.ok(FA.score(C, st) > 0); assert.equal(FA.stars(st), 2);
  const st2 = FA.newState(C); FA.accuse(C, st2, wrong); FA.accuse(C, st2, wrong); FA.accuse(C, st2, wrong);
  assert.ok(st2.done && !st2.ok); assert.equal(FA.score(C, st2), 0, 'drei Fehlanklagen: Fall verloren');
});

test('Tipps führen zum Ziel: erst Spuren, dann Fragen, dann Anklage', () => {
  const C = FA.campaign(3, 2), st = FA.newState(C); st.left = 99;
  let h = FA.hint(C, st); assert.equal(h.k, 'clue');
  C.clues.forEach(c => { st.found.add(c.id); st.solved.add(c.id); });
  for (let k = 0; k < 40; k++) { h = FA.hint(C, st); if (h.k !== 'ask') break; FA.ask(C, st, h.i, h.attr); }
  assert.equal(h.k, 'accuse'); assert.equal(h.n, 1);
});
