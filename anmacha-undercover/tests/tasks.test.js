/* Node-Test für die 24 Mini-Aufgaben: node tests/tasks.test.js */
'use strict';
const assert = require('assert');
const path = require('path');
require(path.join(__dirname, '../src/core/rng.js'));
const T = require(path.join(__dirname, '../src/core/tasks.js'));

let checks = 0, fails = 0;
function check(name, fn) {
  try { fn(); checks++; } catch (e) { fails++; if (fails <= 25) console.error('FAIL ' + name + ': ' + (e && e.message)); }
}
const clone = x => JSON.parse(JSON.stringify(x));

check('24 Aufgaben', () => {
  assert.strictEqual(T.DEFS.length, 24);
  assert.strictEqual(new Set(T.DEFS.map(d => d.id)).size, 24);
  for (const d of T.DEFS) {
    assert.ok(T.LOGIC[d.id], 'LOGIC fehlt: ' + d.id);
    for (const k of ['name', 'icon', 'en', 'hint']) assert.ok(typeof d[k] === 'string' && d[k], d.id + '.' + k);
    for (const f of ['create', 'act', 'done', 'solve']) assert.strictEqual(typeof T.LOGIC[d.id][f], 'function', d.id + '.' + f);
  }
});

const GARBAGE = [null, undefined, 0, 1e308, -1, NaN, 'x', '', [], {}, { t: 1 }, { t: '' }, { t: 'reset ' }, { t: 'set', i: 1e9, v: -1e9 },
  { t: 'set', i: '0', v: '50' }, { t: 'link', l: -1, r: 99 }, { t: 'swap', i: 0, j: 0 }, { t: 'turn', d: Infinity }, { t: 'step', d: 1e12 },
  { t: 'press', i: 0.5, c: -3 }, { t: 'probe', x: 'a', y: null }, { t: 'rot', i: 1e6 }, { t: 'arm', d: NaN }, { t: 'speed', v: 78 },
  { t: 'route' }, { t: 'set', i: 0, b: 99 }, { t: 'send', r: 1e5 }, { t: 'fan', i: 7 }, { t: 'adj', i: 0, k: 'zz', d: 5 },
  { t: 'adj', i: 9, k: 'az', d: 1 }, { t: 'digit', d: 10 }, { t: 'toggle', i: -1 }, { t: 'cell', x: 99, y: 0 }, { t: 'flip', i: 1e3 },
  { t: 'pick', k: 99 }, { t: 'put', s: 99 }, { t: 'give', p: 0, b: 99 }, { t: 'take', p: -5 }, { t: 'chan', v: 0 }, { t: 'power', v: 7 },
  { t: 'ident', v: 'x' }, { t: 'weight', d: 1e9 }, { t: 'hide', x: {} }, { t: '__proto__' }, { t: 'constructor' }, { t: 'toString' }];

const SEEDS = 30;
for (const { id } of T.DEFS) {
  for (let diff = 0; diff <= 2; diff++) {
    for (let s = 0; s < SEEDS; s++) {
      const seed = s * 7919 + 13, tag = id + ' d' + diff + ' s' + seed;
      check(tag, () => {
        const a = T.create(id, seed, diff), b = T.create(id, seed, diff);
        assert.deepStrictEqual(a, b, 'nicht deterministisch');
        assert.deepStrictEqual(clone(a), a, 'nicht JSON-serialisierbar');
        assert.strictEqual(T.done(id, a), false, 'frisch schon gelöst');
        assert.strictEqual(a.err, 0);
        // Lösen
        const acts = T.solve(id, clone(a));
        assert.ok(Array.isArray(acts) && acts.length > 0, 'leere Lösung');
        const st = clone(a);
        for (const x of acts) T.act(id, st, clone(x));
        assert.strictEqual(T.done(id, st), true, 'solve() löst nicht');
        assert.strictEqual(st.err, 0, 'solve() macht Fehler');
        // Zufallsmüll: darf nie werfen, Zustand bleibt serialisierbar
        const g = clone(a);
        for (const x of GARBAGE) T.act(id, g, x);
        assert.deepStrictEqual(clone(g), g);
        // Reset nach Müll + Lösen auch aus verändertem Zustand
        const r = T.create(id, seed, diff); const rng = globalThis.AMU.RNG(seed + 1);
        for (let k = 0; k < 25; k++) { const x = clone(acts[rng.int(acts.length)]); T.act(id, r, x); }
        if (!T.done(id, r)) { for (const x of T.solve(id, clone(r))) T.act(id, r, x); assert.strictEqual(T.done(id, r), true, 'solve() aus Zwischenstand'); }
        const e0 = r.err; T.act(id, r, { t: 'reset' });
        assert.strictEqual(r.err, e0, 'reset behält Fehler');
        assert.strictEqual(T.done(id, r), false, 'reset ungelöst');
        const p = T.prog(id, a); assert.ok(p === null || (p >= 0 && p <= 1));
      });
    }
  }
}

// gezielte Fehler-Regeln
check('schalter: falsche Taste setzt zurück', () => {
  const st = T.create('schalter', 5, 1); T.act('schalter', st, { t: 'ready' });
  T.act('schalter', st, { t: 'press', i: (st.seq[0] + 1) % st.n });
  assert.strictEqual(st.err, 1); assert.strictEqual(st.phase, 'show'); assert.strictEqual(st.round, 1);
});
check('mikro: falscher Kanal setzt zurück', () => {
  const st = T.create('mikro', 9, 2); T.act('mikro', st, { t: 'press', c: st.order[0] });
  T.act('mikro', st, { t: 'press', c: st.order[2] }); assert.strictEqual(st.pos, 0); assert.strictEqual(st.err, 1);
});
check('notfunk: falsche Reihenfolge setzt zurück', () => {
  const st = T.create('notfunk', 3, 0); T.act('notfunk', st, { t: 'cover' }); T.act('notfunk', st, { t: 'hold' });
  assert.strictEqual(st.pos, 0); assert.strictEqual(st.err, 1);
});
check('code: falscher Code zählt Fehler', () => {
  const st = T.create('code', 4, 1); st.code.forEach(d => T.act('code', st, { t: 'digit', d: (d + 1) % 10 })); T.act('code', st, { t: 'enter' });
  assert.strictEqual(st.err, 1); assert.strictEqual(st.entry.length, 0); assert.strictEqual(T.done('code', st), false);
});
check('sicherung: Tausch unter Strom ist Fehler', () => {
  const st = T.create('sicherung', 2, 0), s = st.slots.findIndex(x => !x.ok);
  T.act('sicherung', st, { t: 'pick', k: st.spares.indexOf(st.slots[s].a) }); T.act('sicherung', st, { t: 'put', s });
  assert.strictEqual(st.err, 1); assert.strictEqual(st.slots[s].ok, false);
});
check('licht_memory: Fehlpaar zählt', () => {
  const st = T.create('licht_memory', 1, 0), j = st.cards.findIndex(c => c !== st.cards[0]);
  T.act('licht_memory', st, { t: 'flip', i: 0 }); T.act('licht_memory', st, { t: 'flip', i: j });
  assert.strictEqual(st.err, 1); assert.deepStrictEqual(st.miss, [0, j]);
});
check('unbekannte id wirft bei create, act nicht', () => {
  assert.throws(() => T.create('gibtsnicht', 1, 0));
  assert.strictEqual(T.act('gibtsnicht', {}, { t: 'x' }).constructor, Object);
  assert.strictEqual(T.done('gibtsnicht', {}), false);
});

const total = checks + fails;
console.log((fails ? 'FEHLER' : 'OK') + ': ' + checks + '/' + total + ' Prüfungen bestanden (' + T.DEFS.length + ' Aufgaben × 3 Stufen × ' + SEEDS + ' Seeds)');
process.exit(fails ? 1 : 0);
