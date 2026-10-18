/* Spinwelten 3D – Tests der Minispiel-Logik.  Ausführen: node --test spinwelten/tests/minigames.test.cjs */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

require(path.join(__dirname, '../js/core/rng.js'));
require(path.join(__dirname, '../js/game/minigames.js'));   // darf ohne window/document nicht abstürzen
const SW = globalThis.SW;
const L = SW.Minigames._logic;
const SEEDS = Array.from({ length: 120 }, (_, i) => 'seed-' + i);

test('Grundgerüst: 8 Spiele mit Texten in DE/EN', () => {
  assert.equal(SW.MINIGAMES.length, 8);
  const ids = ['lichtpfad', 'kristallsuche', 'wolkengleiter', 'runenmemory', 'funkelpuzzle', 'reparaturwerk', 'portalsprung', 'schatzkarte'];
  assert.deepEqual(SW.MINIGAMES.map(m => m.id), ids);
  for (const m of SW.MINIGAMES) {
    assert.ok(m.icon);
    for (const k of ['name', 'desc', 'how']) { assert.ok(m[k].de && m[k].en, m.id + '.' + k); }
  }
  assert.equal(typeof SW.Minigames.start, 'function');
  assert.throws(() => SW.Minigames.start('gibtsnicht', {}, {}));
});

test('Lichtpfad: Rätsel sind lösbar, Lösung ist ein Baum, Start nie gelöst', () => {
  const lp = L.lichtpfad;
  for (const d of [1, 3, 5, 6]) {
    const n = lp.size(d);
    for (const s of SEEDS) {
      const pz = lp.generate(s, n, lp.mix(d));
      assert.equal(pz.start.length, n * n);
      // Lösung erleuchtet alle Felder und alle Laternen
      const lit = lp.lit(pz.sol, n, pz.src);
      assert.equal(lit.reduce((a, b) => a + b, 0), n * n, 'Lösung erreicht alle Felder');
      assert.ok(lp.solved(pz.sol, n, pz.src, pz.lamps));
      assert.ok(pz.lamps.length >= 3);
      // Baum: Kanten = Felder - 1, keine Leitungen aus dem Rand
      let ends = 0;
      for (let i = 0; i < n * n; i++) {
        ends += L.bitCount(pz.sol[i]);
        const x = i % n, y = Math.floor(i / n);
        if (y === 0) assert.equal(pz.sol[i] & 1, 0); if (x === n - 1) assert.equal(pz.sol[i] & 2, 0);
        if (y === n - 1) assert.equal(pz.sol[i] & 4, 0); if (x === 0) assert.equal(pz.sol[i] & 8, 0);
      }
      assert.equal(ends / 2, n * n - 1);
      // Start ist Drehung der Lösung, ungelöst, und durch Drehen lösbar
      assert.ok(!lp.solved(pz.start, n, pz.src, pz.lamps), 'Start bereits gelöst: ' + s);
      const fixed = pz.start.map((m, i) => { const k = lp.turns(m, pz.sol[i]); assert.ok(k >= 0); return L.rotMask(m, k); });
      assert.ok(lp.solved(fixed, n, pz.src, pz.lamps));
      assert.ok(pz.minMoves > 0 && lp.limit(pz.minMoves, d) > pz.minMoves);
    }
  }
  // deterministisch je Seed
  assert.deepEqual(lp.generate('x', 6), lp.generate('x', 6));
  assert.equal(L.rotMask(1, 1), 2); assert.equal(L.rotMask(8, 1), 1); assert.equal(L.rotMask(5, 2), 5);
});

test('Funkel-Puzzle: Mischung immer lösbar und nie gelöst', () => {
  const fp = L.funkelpuzzle;
  for (let d = 1; d <= 6; d++) {
    const c = fp.config(d);
    for (const s of SEEDS) {
      const b = fp.shuffle(s, c.n, c.steps);
      assert.equal(b.length, c.n * c.n);
      assert.deepEqual(b.slice().sort((a, z) => a - z), Array.from({ length: c.n * c.n }, (_, i) => i));
      assert.ok(fp.solvable(b, c.n), 'unlösbar: ' + s);
      assert.ok(!fp.solved(b), 'bereits gelöst: ' + s);
      assert.ok(c.limit > c.steps * 2);
    }
  }
  // Paritätsprüfung erkennt unlösbare Stellung (zwei Platten vertauscht)
  assert.ok(!fp.solvable([2, 1, 3, 4, 5, 6, 7, 8, 0], 3));
  assert.ok(!fp.solvable([2, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0], 4));
  assert.ok(fp.solvable([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0], 4));
  // Schieben
  const b = [1, 2, 3, 4, 5, 6, 7, 8, 0];
  assert.equal(fp.slide(b, 3, 0), null);              // nicht in Reihe/Spalte
  assert.deepEqual(fp.slide(b, 3, 6).sort(), [7, 8]);      // zwei Platten nach rechts
  assert.deepEqual(b, [1, 2, 3, 4, 5, 6, 0, 7, 8]);
  fp.slide(b, 3, 8); assert.ok(fp.solved(b));
});

test('Runen-Memory: Paare vollständig, Runen reichen', () => {
  const mm = L.runenmemory;
  for (let d = 1; d <= 6; d++) {
    const c = mm.config(d);
    assert.equal(c.a * c.b, c.pairs * 2);
    assert.ok(c.pairs <= mm.runes);
    for (const s of SEEDS.slice(0, 40)) {
      const deck = mm.deal(s, c.pairs);
      assert.equal(deck.length, c.pairs * 2);
      const cnt = {};
      deck.forEach(r => { cnt[r] = (cnt[r] || 0) + 1; });
      assert.equal(Object.keys(cnt).length, c.pairs);
      Object.values(cnt).forEach(v => assert.equal(v, 2));
    }
  }
});

test('Schatzkarte: Schätze im Raster, Hinweise = Manhattan-Abstand, Grabungen reichen', () => {
  const tk = L.schatzkarte;
  assert.equal(tk.hint(0, 0, [[3, 4]]), 7);
  assert.equal(tk.hint(2, 2, [[0, 0], [3, 2]]), 1);
  assert.equal(tk.hint(5, 1, [[5, 1]]), 0);
  for (let d = 1; d <= 6; d++) {
    const c = tk.config(d), n = c.size;
    for (const s of SEEDS) {
      const t = tk.place(s, n, c.treasures);
      assert.equal(t.length, c.treasures);
      assert.equal(new Set(t).size, t.length);
      t.forEach(i => assert.ok(i >= 0 && i < n * n));
    }
    // Lösbar mit Logik: ein einfacher Löser (behält nur passende Schatzlagen) schafft es immer im Limit
    let worst = 0;
    for (const s of SEEDS.slice(0, d >= 4 ? 25 : 60)) {
      const tre = tk.place(s, n, c.treasures);
      const used = solveTreasure(n, tre, c.treasures, tk);
      worst = Math.max(worst, used);
      assert.ok(used <= c.digs, 'd' + d + ' ' + s + ': ' + used + ' > ' + c.digs);
    }
    assert.ok(worst <= c.digs - 1, 'd' + d + ': Löser braucht ' + worst + ' von ' + c.digs + ' (mind. 1 Reserve)');
  }
});
function solveTreasure(n, tre, count, tk) {
  const N = n * n, xy = i => [i % n, Math.floor(i / n)];
  let cand = [];
  if (count === 1) for (let i = 0; i < N; i++) cand.push([i]);
  else for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) cand.push([i, j]);
  const obs = [], found = new Set();
  const observe = (conf, cell, f) => conf.indexOf(cell) >= 0 ? 0 : tk.hint(...xy(cell), conf.filter(k => !f.has(k)).map(xy));
  for (let digs = 1; digs <= 30; digs++) {
    // Feld wählen: möglichst gute Aufteilung der Kandidaten, bevorzugt mögliche Schatzfelder
    let best = -1, bestScore = Infinity;
    const possible = new Set(); cand.forEach(c => c.forEach(k => { if (!found.has(k)) possible.add(k); }));
    for (let cell = 0; cell < N; cell++) {
      if (obs.some(o => o.cell === cell)) continue;
      const buckets = {};
      for (const c of cand) { const v = observe(c, cell, found); buckets[v] = (buckets[v] || 0) + 1; }
      let sc = 0; for (const k in buckets) sc += buckets[k] * buckets[k];
      if (possible.has(cell)) sc -= 0.5;
      if (sc < bestScore) { bestScore = sc; best = cell; }
    }
    const f = new Set(found), val = observe(tre, best, found);
    obs.push({ cell: best, val, f });
    if (val === 0) found.add(best);
    if (found.size === count) return digs;
    cand = cand.filter(c => obs.every(o => observe(c, o.cell, o.f) === o.val));
  }
  return 99;
}

test('Reparaturwerk: Trefferprüfung, Zeiger, Zonen werden schmaler', () => {
  const rw = L.reparaturwerk;
  assert.ok(rw.inZone(0.5, 0.5, 0.1));
  assert.ok(rw.inZone(0.55, 0.5, 0.1));
  assert.ok(!rw.inZone(0.56, 0.5, 0.1));
  assert.ok(!rw.inZone(0.2, 0.5, 0.2));
  assert.equal(rw.needle(0), 0); assert.equal(rw.needle(0.5), 0.5); assert.equal(rw.needle(1), 1); assert.equal(rw.needle(1.25), 0.75); assert.equal(rw.needle(2), 0);
  for (let d = 1; d <= 6; d++) {
    let prev = 1;
    for (let s = 0; s < rw.params.seams; s++) {
      const z = rw.zone('a', d, s);
      assert.ok(z.width < prev && z.width > 0.05); prev = z.width;
      assert.ok(z.center - z.width / 2 >= 0 && z.center + z.width / 2 <= 1);
    }
    assert.ok(rw.speed(d, 0) < rw.speed(d, 4));
  }
});

test('Portalsprung: Kollision und faire Strecke', () => {
  const ps = L.portalsprung;
  assert.ok(ps.rectHit({ x: 0, y: 0, w: 1, h: 1 }, { x: 0.5, y: 0.5, w: 1, h: 1 }));
  assert.ok(!ps.rectHit({ x: 0, y: 0, w: 1, h: 1 }, { x: 1, y: 0, w: 1, h: 1 }));
  assert.ok(!ps.rectHit({ x: 0, y: 2, w: 1, h: 1 }, { x: 0, y: 0, w: 1, h: 1.5 }));
  const pits = [{ x: 10, w: 2 }];
  assert.ok(ps.overPit(11, pits)); assert.ok(!ps.overPit(9.9, pits)); assert.ok(!ps.overPit(12.5, pits));
  const air = ps.airtime(), apex = ps.params.v0 * ps.params.v0 / (2 * ps.params.g);
  for (let d = 1; d <= 6; d++) {
    for (const s of SEEDS.slice(0, 50)) {
      const c = ps.course(s, d);
      assert.equal(c.lives, d <= 2 ? 2 : 1);
      let prevEnd = 0, mult = 1;
      for (const f of c.feats) {
        const jd = c.base * mult * air;
        assert.ok(f.x - prevEnd >= Math.min(jd * 1.3, 15) || prevEnd === 0, 'Abstand ' + s + ' d' + d);
        if (f.type === 'portal') { mult = f.mult; prevEnd = f.x; continue; }
        if (f.type === 'pit') assert.ok(f.w <= jd * 0.6, 'Lücke zu breit');
        if (f.type === 'rock') {
          assert.ok(f.h + 0.3 < apex, 'Kristall zu hoch');
          // Zeit oberhalb der Kristallhöhe reicht für Breite + Läufer
          const v0 = ps.params.v0, g = ps.params.g, disc = Math.sqrt(v0 * v0 - 2 * g * f.h);
          assert.ok(c.base * mult * (2 * disc / g) > f.w + ps.params.w + 0.3);
        }
        prevEnd = f.x + f.w;
      }
      assert.ok(prevEnd < c.length);
    }
  }
});

test('Portalsprung: Physik – ein einfacher Bot gewinnt jede Strecke, ohne Springen verliert man', () => {
  const ps = L.portalsprung, air = ps.airtime();
  for (const dt of [1 / 60, 1 / 30, 1 / 20]) {
    for (let d = 1; d <= 6; d++) {
      for (const s of SEEDS.slice(0, 30)) {
        const c = ps.course(s, d), st = ps.state(c), obs = c.feats.filter(f => f.type !== 'portal');
        let i = 0, steps = 0;
        while (!st.over && steps++ < 20000) {
          while (i < obs.length && obs[i].x + obs[i].w < st.x) i++;
          const o = obs[i], sp = c.base * st.mult;
          if (o && st.onGround) {
            const lead = o.type === 'pit' ? 0.5 + sp * dt : sp * air * 0.5 - o.w / 2;
            if (o.x - st.x <= lead) ps.press(st);
          }
          ps.step(st, c, dt);
        }
        assert.equal(st.over, 'win', 'Bot verliert: ' + s + ' d' + d + ' dt' + dt.toFixed(3) + ' bei x=' + st.x.toFixed(1));
        assert.equal(st.hits, 0);
        // ohne Springen: verloren
        const st2 = ps.state(c); let n = 0;
        while (!st2.over && n++ < 20000) ps.step(st2, c, dt);
        assert.equal(st2.over, 'lose');
        assert.equal(st2.hits, c.lives);
      }
    }
  }
});

test('Wolkengleiter: Kollision und passierbare Strecke', () => {
  const wg = L.wolkengleiter;
  assert.ok(wg.hit(0, 0, 1, 1.5, 0, 1));
  assert.ok(!wg.hit(0, 0, 1, 2, 0, 1));
  assert.ok(!wg.hit(0, 0, 1, 1.5, 1.5, 1));
  for (let d = 1; d <= 6; d++) {
    for (const s of SEEDS.slice(0, 50)) {
      const c = wg.course(s, d);
      assert.ok(c.clouds.length > 10);
      assert.ok(c.goal / c.speed < 60, 'Strecke < 60 s');
      // An jeder Stelle bleibt eine Lücke, durch die Kivi passt (Wolken mit 0.82·r Kollisionsradius)
      const xs = [...new Set(c.clouds.map(k => Math.round(k.x)))];
      for (const x of xs) {
        const near = c.clouds.filter(k => Math.abs(k.x - x) < 6);
        const blocked = new Array(101).fill(false);
        near.forEach(k => { for (let y = 0; y <= 100; y++) if (Math.abs(y - k.y) < k.r * 0.82 + wg.params.r) blocked[y] = true; });
        let run = 0, bestRun = 0;
        for (let y = 6; y <= 94; y++) { run = blocked[y] ? 0 : run + 1; bestRun = Math.max(bestRun, run); }
        assert.ok(bestRun >= 4, 'keine Lücke bei x=' + x + ' (' + s + ', d' + d + ')');
      }
      c.stars.forEach(st => assert.ok(!c.clouds.some(k => wg.hit(st.x, st.y, 3, k.x, k.y, k.r))));
    }
  }
});

test('Kristallsuche: Konfiguration fair skaliert', () => {
  const ks = L.kristallsuche;
  for (let d = 1; d <= 6; d++) {
    const c = ks.config(d);
    assert.ok(c.crystals >= 5 && c.crystals <= 8);
    assert.ok(c.time / c.crystals >= 6);
  }
  assert.ok(ks.config(1).time > ks.config(6).time);
});
