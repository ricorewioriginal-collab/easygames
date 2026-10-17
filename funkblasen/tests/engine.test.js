// Spielregeln: node --test funkblasen/tests/
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const E = require('../engine.js');

// Hilfen: leeres Feld, Zellen setzen, Kugel direkt in eine Zelle "landen" lassen
function blank(extra) { return E.createState(Object.assign({ rows: [], colors: [0, 1, 2], shots: 20, seed: 7 }, extra)); }
function put(st, r, c, k, col, more) { st.grid[r][c] = Object.assign({ k, c: col == null ? -1 : col }, more || {}); }
const sim = (r, c, bounces) => ({ cell: { r, c }, bounces: bounces || 0, path: [], len: 0 });
function cells(st) { const o = []; E.eachCell(st, (cell, r, c) => o.push([r, c])); return o; }

test('A: Nachbarn in langen und kurzen Reihen, Ränder', () => {
  const st = blank();
  // Reihe 0 lang (11), Reihe 1 kurz (10, nach rechts versetzt)
  assert.equal(E.rowLen(st, 0), 11); assert.equal(E.rowLen(st, 1), 10);
  const key = l => l.map(([r, c]) => r + ':' + c).sort().join(' ');
  assert.equal(key(E.neighbors(st, 0, 0)), key([[0, 1], [1, 0]]));
  assert.equal(key(E.neighbors(st, 0, 10)), key([[0, 9], [1, 9]]));
  assert.equal(key(E.neighbors(st, 1, 0)), key([[1, 1], [0, 0], [0, 1], [2, 0], [2, 1]]));
  assert.equal(key(E.neighbors(st, 1, 9)), key([[1, 8], [0, 9], [0, 10], [2, 9], [2, 10]]));
  assert.equal(key(E.neighbors(st, 2, 5)), key([[2, 4], [2, 6], [1, 4], [1, 5], [3, 4], [3, 5]]));
  // Nachbarschaft ist symmetrisch und alle Nachbarn liegen genau 2R entfernt – in beiden Paritäten
  for (const shift of [0, 1]) {
    st.shift = shift;
    for (let r = 0; r < 8; r++) for (let c = 0; c < E.rowLen(st, r); c++) for (const [a, b] of E.neighbors(st, r, c)) {
      assert.ok(E.neighbors(st, a, b).some(([x, y]) => x === r && y === c), `symmetrisch ${r},${c}`);
      const d = Math.hypot(E.cellX(st, r, c) - E.cellX(st, a, b), E.cellY(st, r) - E.cellY(st, a));
      assert.ok(Math.abs(d - 2) < 1e-9, 'Abstand 2R');
      assert.equal(E.hexDist(st, r, c, a, b), 1);
    }
  }
});

test('B: zwei gleiche bleiben, drei platzen', () => {
  const st = blank(); put(st, 0, 0, 'n', 0); put(st, 0, 5, 'n', 1);
  let ev = E.land(st, sim(0, 1), { c: 0 });
  assert.equal(ev.popped.length, 0); assert.ok(st.grid[0][1]);
  ev = E.land(st, sim(0, 2), { c: 0 });
  assert.equal(ev.popped.length, 3); assert.equal(ev.matched, 3);
  assert.equal(st.grid[0][0], null); assert.ok(st.grid[0][5], 'andere Farbe bleibt');
});

test('C: Spezialblasen', async t => {
  await t.test('Bombe (geschossen) räumt Radius 2', () => {
    const st = blank(); for (let c = 0; c < 11; c++) put(st, 0, c, 'n', c % 3); for (let c = 0; c < 10; c++) put(st, 1, c, 'n', (c + 1) % 3);
    const ev = E.land(st, sim(2, 5), { c: -1, s: 'bomb' });
    assert.ok(ev.booms.length >= 1);
    for (const p of ev.popped) assert.ok(E.hexDist(st, 2, 5, p.r, p.c) <= 2 || p.cause !== 'boom');
    assert.equal(st.grid[0][5], null);
  });
  await t.test('Bombe im Feld löst aus, wenn daneben etwas platzt', () => {
    const st = blank(); put(st, 0, 0, 'n', 0); put(st, 0, 1, 'n', 0); put(st, 0, 3, 'b'); put(st, 0, 4, 'n', 1); put(st, 0, 8, 'n', 2);
    const ev = E.land(st, sim(0, 2), { c: 0 });
    assert.ok(ev.booms.some(b => b.r === 0 && b.c === 3)); assert.equal(st.grid[0][4], null); assert.ok(st.grid[0][8]);
  });
  await t.test('Regenbogen nimmt die größte angrenzende Gruppe', () => {
    const st = blank(); put(st, 0, 0, 'n', 1); put(st, 0, 1, 'n', 1); put(st, 0, 3, 'n', 2); put(st, 0, 4, 'n', 2); put(st, 0, 5, 'n', 2);
    assert.equal(E.rainbowColor(st, 0, 2), 2);
    const ev = E.land(st, sim(0, 2), { c: -1, s: 'rainbow' });
    assert.equal(ev.color, 2); assert.equal(ev.popped.length, 4); assert.ok(st.grid[0][0]);
  });
  await t.test('Regenbogen bei Gleichstand: mehr Kugeln auf dem Feld, dann kleinere Farbe', () => {
    const st = blank(); put(st, 0, 1, 'n', 2); put(st, 0, 3, 'n', 1);
    assert.equal(E.rainbowColor(st, 0, 2), 1);
    put(st, 0, 9, 'n', 2);
    assert.equal(E.rainbowColor(st, 0, 2), 2);
  });
  await t.test('Blitz räumt die ganze Reihe', () => {
    const st = blank(); for (let c = 0; c < 11; c++) if (c !== 4) put(st, 0, c, 'n', c % 3);
    const ev = E.land(st, sim(0, 4), { c: -1, s: 'bolt' });
    assert.deepEqual(ev.bolts, [0]); assert.equal(cells(st).length, 0);
  });
  await t.test('Eis platzt nicht im Dreier, taut aber daneben auf', () => {
    const st = blank(); put(st, 0, 0, 'i', 0); put(st, 0, 1, 'i', 0); put(st, 0, 6, 'n', 1);
    const ev = E.land(st, sim(0, 2), { c: 0 });
    assert.equal(ev.popped.length, 0); assert.equal(ev.thawed.length, 1);
    assert.equal(st.grid[0][1].k, 'n'); assert.equal(st.grid[0][0].k, 'i');
  });
  await t.test('Schalter taut alles Eis', () => {
    const st = blank(); put(st, 0, 0, 'q'); put(st, 0, 5, 'i', 1); put(st, 0, 8, 'i', 2);
    const ev = E.land(st, sim(0, 1), { c: 0 });
    assert.ok(ev.switchFired); assert.equal(st.grid[0][5].k, 'n'); assert.equal(st.grid[0][8].k, 'n');
  });
  await t.test('Kette: eine geplatzte Kettenblase reißt die ganze Kette mit', () => {
    const st = E.createState({ rows: [[null, { k: 'n', c: 0 }, { k: 'n', c: 0 }, null, null, { k: 'h', c: 1 }, { k: 'h', c: 1 }, { k: 'h', c: 1 }]], colors: [0, 1], shots: 9 });
    // drei gleiche (0) neben einer Kette aus anderer Farbe: Kette selbst platzt nicht
    let ev = E.land(st, sim(0, 0), { c: 0 }); assert.equal(ev.chainFired, false);
    ev = E.land(st, sim(0, 4), { c: 1 });
    assert.ok(ev.chainFired); assert.equal(ev.popped.length, 4);
  });
  await t.test('Stein: erst Riss, im nächsten Schuss Bruch', () => {
    const st = blank(); put(st, 0, 0, 'n', 0); put(st, 0, 1, 'n', 0); put(st, 0, 3, 's'); put(st, 0, 4, 'n', 1); put(st, 0, 5, 'n', 1);
    put(st, 1, 2, 'n', 2); put(st, 1, 3, 'n', 2);
    let ev = E.land(st, sim(0, 2), { c: 0 });
    assert.equal(ev.cracked.length, 1); assert.equal(st.grid[0][3].cr, 1);
    ev = E.land(st, sim(1, 4), { c: 2 });
    assert.ok(ev.popped.some(p => p.r === 0 && p.c === 3), 'Stein bricht');
  });
  await t.test('Kristall wird beim Platzen daneben gerettet', () => {
    const st = blank({ goal: { type: 'rescue', n: 1 } }); put(st, 0, 0, 'n', 0); put(st, 0, 1, 'n', 0); put(st, 0, 3, 'k'); put(st, 0, 7, 'n', 1);
    const ev = E.land(st, sim(0, 2), { c: 0 });
    assert.equal(ev.rescued, 1); assert.ok(E.goalDone(st));
  });
});

test('D: lose Gruppen fallen genau einmal und zählen Punkte', () => {
  const st = blank(); put(st, 0, 0, 'n', 0); put(st, 0, 1, 'n', 0); put(st, 0, 6, 'n', 2);
  put(st, 1, 0, 'n', 1); put(st, 2, 0, 'n', 1); put(st, 2, 1, 'n', 2); // hängen nur an Reihe 0, Spalte 0/1
  const ev = E.land(st, sim(0, 2), { c: 0 });
  assert.equal(ev.popped.length, 3); assert.equal(ev.dropped.length, 3);
  const keys = ev.dropped.map(d => d.r + ':' + d.c); assert.equal(new Set(keys).size, keys.length, 'keine doppelten Abstürze');
  assert.equal(ev.points, 3 * 10 + 3 * 20);
  assert.ok(st.grid[0][6]);
  const anchored = E.anchoredSet(st); E.eachCell(st, (cell, r, c) => assert.ok(anchored.has(r * 32 + c)));
});

test('E: Bandenschüsse, Platzieren ohne Überlappung (Zufallstest)', () => {
  const st = blank();
  const one = E.simulate(st, 0.45); assert.ok(one.bounces >= 1);
  const multi = E.simulate(st, 0.16); assert.ok(multi.bounces >= 2);
  for (const p of multi.path) assert.ok(p.x >= E.R - 1e-9 && p.x <= E.W - E.R + 1e-9, 'bleibt im Feld');
  // Gleiche Eingabe -> gleiche Bahn (Vorschau = echter Schuss)
  assert.deepEqual(E.simulate(st, 1.1), E.simulate(st, 1.1));
  let seed = 12345; const rand = () => ((seed = (seed * 1103515245 + 12345) >>> 0) / 4294967296);
  for (let n = 0; n < 60; n++) {
    const t = E.createState({ rows: [], colors: [0, 1, 2, 3], shots: 99, seed: n + 1 });
    for (let r = 0; r < 4; r++) for (let c = 0; c < E.rowLen(t, r); c++) if (rand() < 0.7 && (r === 0 || E.attached(t, r, c))) put(t, r, c, 'n', Math.floor(rand() * 4));
    for (let k = 0; k < 15; k++) {
      const ang = E.MIN_ANG + rand() * (Math.PI - 2 * E.MIN_ANG), s = E.simulate(t, ang);
      assert.ok(s.cell, 'findet Platz'); assert.equal(t.grid[s.cell.r][s.cell.c], null, 'Zelle ist frei');
      E.land(t, s, { c: Math.floor(rand() * 4) });
      const all = cells(t);
      for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
        const [a, b] = all[i], [c, d] = all[j];
        assert.ok(Math.hypot(E.cellX(t, a, b) - E.cellX(t, c, d), E.cellY(t, a) - E.cellY(t, c)) > 1.99, 'keine Überlappung');
      }
    }
  }
});

test('E2: Schusslimit, Gefahrenlinie, Sieg, Kombo', () => {
  let st = blank({ shots: 1 }); put(st, 0, 0, 'n', 0); put(st, 0, 5, 'n', 1);
  E.shoot(st, Math.PI / 2); assert.equal(st.shotsLeft, 0);
  assert.equal(E.afterShot(st).status, 'lose');
  st = blank(); for (let r = 0; r <= E.DANGER; r++) put(st, r, 0, 'n', r % 3);
  assert.deepEqual([E.afterShot(st).status, E.afterShot(st).reason], ['lose', 'danger']);
  st = blank({ shots: 10 }); put(st, 0, 0, 'n', 0); put(st, 0, 1, 'n', 0);
  E.land(st, sim(0, 2), { c: 0 }); const res = E.afterShot(st);
  assert.equal(res.status, 'win'); assert.equal(res.bonus, 10 * 50);
  // Kombo: zwei Treffer nacheinander erhöhen den Faktor, ein Fehlschuss setzt zurück
  st = blank(); put(st, 0, 0, 'n', 0); put(st, 0, 1, 'n', 0); put(st, 0, 5, 'n', 1); put(st, 0, 6, 'n', 1); put(st, 0, 10, 'n', 2);
  const a = E.land(st, sim(0, 2), { c: 0 }), b = E.land(st, sim(0, 7), { c: 1 });
  assert.equal(a.combo, 1); assert.equal(b.combo, 2); assert.equal(b.points, Math.round(30 * 1.5));
  const c = E.land(st, sim(1, 9), { c: 2 }); assert.equal(c.combo, 0);
});

test('E3: Warteschlange nur mit vorhandenen Farben, Tauschen', () => {
  const st = blank({ colors: [0, 1, 2, 3] }); put(st, 0, 0, 'n', 3); put(st, 0, 1, 'n', 3);
  for (let i = 0; i < 50; i++) assert.equal(E.draw(st).c, 3);
  st.cur = { c: 1 }; st.next = { c: 3 }; E.fixQueue(st); assert.equal(st.cur.c, 3);
  st.next = { c: 0, s: null }; const cur = st.cur, next = st.next; E.swap(st);
  assert.equal(st.cur, next); assert.equal(st.next, cur);
});

test('E4: Zustandsmaschine – kein Doppelschuss, Pause, Sieg', () => {
  const def = { rows: [Array.from({ length: 11 }, (_, c) => (c === 5 ? null : { k: 'n', c: 0 }))], colors: [0], shots: 5, seed: 3 };
  const S = new E.Session(def, { resolveTime: 0.1 }); const seen = [];
  S.on(type => seen.push(type));
  assert.equal(S.phase, 'ready');
  assert.ok(S.aim(Math.PI / 2)); assert.equal(S.phase, 'aiming');
  assert.ok(S.fire()); assert.equal(S.fire(), false, 'zweiter Schuss während des Flugs wird ignoriert');
  assert.equal(S.st.shotsUsed, 1);
  assert.equal(S.swap(), false);
  assert.ok(S.pause()); const t0 = S.t; S.update(0.5); assert.equal(S.t, t0, 'Pause hält den Flug an');
  // Pause ruft update nicht auf – das macht die Spielschleife; hier prüfen wir das Fortsetzen
  assert.ok(S.resume()); assert.equal(S.phase, 'flying');
  for (let i = 0; i < 4000 && S.phase !== 'win' && S.phase !== 'lose'; i++) S.update(1 / 60);
  assert.equal(S.phase, 'win'); assert.ok(seen.includes('land') && seen.includes('win'));
  assert.equal(S.fire(), false); assert.equal(S.pause(), false);
});
