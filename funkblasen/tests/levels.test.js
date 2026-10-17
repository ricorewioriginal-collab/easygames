// Level, Tagesaufgabe, Endlos: node --test funkblasen/tests/
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const E = require('../engine.js');
const L = require('../levels.js');
const bot = require('./bot.js');

test('F: 150 gültige Level', () => {
  assert.equal(L.COUNT, 150); assert.equal(L.WORLDS.length, 10);
  const KINDS = new Set(['n', 'i', 'l', 'h', 'w', 's', 'k', 'x', 'b', 'q']);
  for (let n = 1; n <= 150; n++) {
    const d = L.level(n), st = E.createState(d);
    assert.equal(d.id, n); assert.equal(d.world, Math.ceil(n / 15)); assert.equal(d.index, (n - 1) % 15 + 1);
    assert.ok(['clear', 'rescue', 'score'].includes(d.goal.type), `Ziel ${n}`);
    assert.ok(d.shots >= 6 && d.shots <= 80, `Schüsse ${n}: ${d.shots}`);
    d.rows.forEach((row, r) => { if (row) assert.ok(row.length <= E.rowLen(st, r), `Reihenlänge ${n}/${r}`); });
    let cellsN = 0;
    E.eachCell(st, (cell, r, c) => {
      cellsN++; assert.ok(KINDS.has(cell.k), `Art ${cell.k} in ${n}`);
      if (E.isColored(cell)) assert.ok(d.colors.includes(cell.c), `Farbe ${n}`);
    });
    assert.ok(cellsN > 0 && E.coloredCount(st) > 0, `Level ${n} hat Kugeln`);
    assert.ok(E.maxRow(st) < E.DANGER - 2, `Level ${n} startet nicht an der Linie`);
    const anchored = E.anchoredSet(st); E.eachCell(st, (cell, r, c) => assert.ok(anchored.has(r * 32 + c), `Level ${n}: frei schwebende Kugel ${r},${c}`));
    if (d.goal.type === 'rescue') assert.ok(st.crystals >= d.goal.n && d.goal.n > 0, `Kristalle ${n}`);
    assert.ok(E.colorsPresent(st).includes(st.cur.c) || st.cur.s, 'erste Kugel passt');
    assert.equal(E.afterShot(E.clone(st)).status === 'win', false, `Level ${n} ist nicht schon gewonnen`);
  }
});

test('F2: Level sind reproduzierbar und unterschiedlich', () => {
  for (const n of [1, 37, 88, 150]) assert.deepEqual(L.level(n), L.level(n));
  const a = L.level(5); a.rows[0] = null; assert.notEqual(L.level(5).rows[0], null, 'Cache liefert Kopien');
  for (let w = 0; w < 10; w++) {
    const sigs = new Set();
    for (let i = 1; i <= 15; i++) sigs.add(JSON.stringify(L.level(w * 15 + i).rows));
    assert.equal(sigs.size, 15, `Welt ${w + 1}: alle Level verschieden`);
  }
});

test('F3: Test-Spieler schafft alle 150 Level mit der echten Engine', () => {
  const fails = [];
  for (let n = 1; n <= 150; n++) { const r = bot.play(L.level(n)); if (!r.win) fails.push(n + ':' + r.reason); }
  assert.deepEqual(fails, []);
});

test('H: Tagesaufgabe ist pro UTC-Tag gleich und wechselt täglich', () => {
  assert.deepEqual(L.daily('2026-10-17'), L.daily('2026-10-17'));
  assert.notDeepEqual(L.daily('2026-10-17').rows, L.daily('2026-10-18').rows);
  assert.equal(L.utcDate(new Date('2026-10-17T23:30:00-05:00')), '2026-10-18');
  for (const day of ['2026-01-01', '2026-10-17', '2027-03-09']) { const r = bot.play(L.daily(day)); assert.ok(r.win, 'Tagesaufgabe lösbar ' + day); }
});

test('I: Endlos schiebt Reihen nach und bleibt deterministisch', () => {
  const a = E.createState(L.endless(42)), b = E.createState(L.endless(42));
  assert.deepEqual(a.grid, b.grid);
  const st = E.createState(L.endless(9)); const rows0 = st.rowsPushed;
  for (let i = 0; i < 6; i++) { const { sim, bubble } = E.shoot(st, 0.5 + i * 0.3); E.land(st, sim, bubble); if (E.afterShot(st).status === 'lose') break; }
  assert.ok(st.rowsPushed > rows0, 'neue Reihe nach einigen Schüssen');
  // Spezialkugel nach 24 Ziehungen
  const t = E.createState(L.endless(1)); let special = false; for (let i = 0; i < 30; i++) if (E.draw(t).s) special = true;
  assert.ok(special);
});
