#!/usr/bin/env node
// Tests der Spiellogik von AnMaCha Casino.
//   node anmacha-gold-reels/tests/logic-tests.js              Regeln + Auszahlungsquoten (schnell)
//   node anmacha-gold-reels/tests/logic-tests.js --calibrate  ermittelt scale je Automat (lange Simulation)
'use strict';
const assert = require('assert');
const L = require('../logic.js');
const { MACHINES } = require('../machines.js');
const CAL = process.argv.includes('--calibrate');
let fails = 0;
const t = (name, fn) => { try { fn(); console.log('ok  ' + name); } catch (e) { fails++; console.log('FEHLER ' + name + ': ' + e.message); } };

// --- Linien ---
t('Liniensätze gültig und eindeutig', () => {
  for (const [k, set] of Object.entries(L.LINESETS)) {
    const s = new Set(set.map(l => l.join(','))); assert.strictEqual(s.size, set.length, k);
    const rows = k === 'l40' ? 4 : 3; set.forEach(l => l.forEach(y => assert(y >= 0 && y < rows, k)));
  }
  assert.strictEqual(L.LINESETS.l40.length, 40); assert.strictEqual(L.LINESETS.l25.length, 25);
});

// --- Automaten-Konfiguration ---
t('Automaten vollständig', () => {
  const ids = new Set();
  for (const c of MACHINES) {
    assert(!ids.has(c.id), 'doppelt ' + c.id); ids.add(c.id);
    const m = L.compile(c);
    assert(m.lines === null || m.lines[0].length === c.reels, c.id + ' Linienlänge');
    if (m.lines) assert(Math.max(...m.lines.flat()) < c.rows, c.id + ' Reihen');
    m.tables.forEach((tb, r) => assert(tb.tot > 0, c.id + ' Walze ' + r));
    if (c.wild) assert(m.wild >= 0, c.id + ' wild');
    if (c.scatter) assert(m.scat >= 0, c.id + ' scatter');
    if (c.holdwin) assert(m.coin >= 0, c.id + ' coin');
    assert(m.paying.length >= 3, c.id + ' zahlende Symbole');
  }
});

// --- Auswertung an festen Feldern ---
t('Linienauswertung mit Wild und Scatter', () => {
  const m = L.compile(MACHINES.find(c => c.id === 'gold-reels'));
  const I = m.idx, g = [[I.seven, I.seven, I.seven], [I.wild, I.bell, I.bell], [I.seven, I.crown, I.crown], [I.scatter, I.logo1, I.logo1], [I.scatter, I.scatter, I.logo2]];
  const r = L.evaluate(Object.assign({}, m, { scale: 1 }), g, 2000, 1, null);
  const mid = r.wins.find(w => w.line === 0);   // Mitte: seven, bell, crown → kein Gewinn
  assert(!mid, 'Mittellinie darf nicht gewinnen');
  const top = r.wins.find(w => w.line === 1);   // oben: seven, wild, seven, scatter → 3× seven
  assert(top && top.n === 3 && top.sym === I.seven && top.amt === 137 * 100, 'oben 3× Sieben');
  assert.strictEqual(r.scat.n, 3); assert.strictEqual(r.scat.amt, 2 * 2000); assert.strictEqual(r.free, 10);
});
t('243 Wege zählen Kombinationen', () => {
  const m = Object.assign(L.compile(MACHINES.find(c => c.id === 'golden-dragon')), { scale: 1 });
  const I = m.idx, g = [[I.dragon, I.dragon, I.A], [I.dragon, I.wild, I.K], [I.dragon, I.Q, I.J], [I.A, I.K, I.Q], [I.J, I.T, I.A]];
  const r = L.evaluate(m, g, 5000, 1, null);
  const d = r.wins.find(w => w.sym === I.dragon);
  assert(d && d.n === 3 && d.ways === 4 && d.amt === 50 * 100 * 4, 'Drache 3 Walzen × 4 Wege');
});
t('Diamant-Wild verdoppelt je Wild', () => {
  const m = Object.assign(L.compile(MACHINES.find(c => c.id === 'diamond-7')), { scale: 1 });
  const I = m.idx, g = [[I.blank, I.seven, I.blank], [I.blank, I.wild, I.blank], [I.blank, I.wild, I.blank]];
  const r = L.evaluate(m, g, 500, 1, null);
  const w = r.wins.find(x => x.line === 0);
  assert(w && w.amt === 100 * 100 * 4, 'Sieben + 2 Wild = ×4, erhalten ' + (w && w.amt));
});
t('Buch-Sondersymbol dehnt sich aus', () => {
  const m = Object.assign(L.compile(MACHINES.find(c => c.id === 'book-of-funk')), { scale: 1 });
  const I = m.idx, g = [[I.A, I.mic, I.K], [I.Q, I.J, I.T], [I.K, I.A, I.mic], [I.T, I.Q, I.J], [I.J, I.T, I.A]];
  const r = L.evaluate(m, g, 1000, 1, I.mic);
  assert(r.expand && r.expand.n === 2 && r.expand.amt === 10 * 100 * 10, 'Mikrofon auf 2 Walzen zahlt 10 × 10 Linien');
});

t('Freispiel-Upgrade wertet niedrige Symbole auf', () => {
  const m = L.compile(MACHINES.find(c => c.id === 'eye-of-ra'));
  let seen = 0;
  for (let i = 0; i < 4000 && seen < 20; i++) {
    const r = L.playRound(m, 1000); let lvl = 0;
    for (const s of r.steps) {
      if (s.mode === 'free') {
        for (let k = 0; k < lvl; k++) s.grid.forEach(col => assert(!col.includes(m.upOrder[k]), 'aufgewertetes Symbol darf nicht mehr erscheinen'));
        if (s.upgrade) { assert.strictEqual(s.upgrade.level, lvl + 1); lvl = s.upgrade.level; seen++; }
      }
    }
  }
  assert(seen > 0, 'kein Upgrade gesehen');
});
t('Klebende Wilds bleiben bis zum Ende', () => {
  const m = L.compile(MACHINES.find(c => c.id === 'sticky-fire'));
  let ok = 0;
  for (let i = 0; i < 4000 && ok < 10; i++) {
    const r = L.playRound(m, 1000); const stuck = [];
    for (const s of r.steps) if (s.mode === 'free') { stuck.forEach(([x, y]) => assert.strictEqual(s.grid[x][y], m.wild)); (s.newSticky || []).forEach(c => stuck.push(c)); if (stuck.length) ok++; }
  }
  assert(ok > 0);
});
t('Nugget-Feature: volle Mittelwalze öffnet das nächste Feld, Gewinn = Summe aller Nuggets', () => {
  const m = L.compile(MACHINES.find(c => c.id === 'nugget-rush')), hw = m.holdwin, mid = Math.floor(m.reels / 2);
  L.setRandom(L.seeded(7)); let seen = [0, 0, 0, 0];
  for (let i = 0; i < 200000 && !(seen[2] && seen[3]); i++) {
    const r = L.playRound(m, 100), h = r.steps.find(s => s.type === 'holdwin'); if (!h) continue;
    assert(h.finals.length >= 1 && h.finals.length <= hw.windows); seen[h.finals.length]++;
    h.finals.slice(0, -1).forEach(f => assert(f[mid].every(Boolean), 'Feld geöffnet ohne volle Mitte'));
    const last = h.finals[h.finals.length - 1]; if (h.finals.length < hw.windows) assert(!last[mid].every(Boolean), 'volle Mitte ohne neues Feld');
    let sum = 0; h.finals.forEach(f => f.forEach(col => col.forEach(v => { if (v) sum += L.coinValue(hw, v) * 100; })));
    if (h.full) sum += hw.jackpots.GRAND * 100;
    assert.strictEqual(h.win, Math.round(sum));
    const opened = (h.startOpen || []).length + h.rounds.reduce((a, rd) => a + (rd.opened ? rd.opened.length : 0), 0);
    assert.strictEqual(opened, h.finals.length - 1);
  }
  assert(seen[2] && seen[3], 'Doppel und Dreifach kommen vor');
  L.setRandom(L.seeded(20261016));
});
t('Glücks-Features wechseln und zahlen korrekt', () => {
  L.setRandom(L.seeded(11));
  for (const c of MACHINES) {
    const m = L.compile(c); m.luckyCfg.p = 1; const types = L.luckyTypes(m), seen = new Set();
    if (m.book || m.wildMultEach) assert(!types.includes('wildReel') && !types.includes('wildRain'), c.id + ': keine Wild-Features');
    for (let i = 0; i < 400; i++) {
      const b = L.playRound(m, 100).steps[0], k = b.lucky; assert(k, c.id + ' ohne Feature'); seen.add(k.type);
      const ev = L.evaluate(m, b.grid, 100, k.type === 'mult' ? k.x : 1, null);
      assert.strictEqual(b.win, ev.win + (k.amt || 0), c.id + ' ' + k.type + ' Gewinn');
      if (k.type === 'wildReel') k.reels.forEach(r => assert(b.grid[r].every(v => v === m.wild)));
      if (k.type === 'hammer') { assert(k.hits.length >= 2 && k.hits.length <= 3); k.hits.forEach(([r, y, v]) => { assert(v === m.wild || v === m.coin); assert.strictEqual(b.grid[r][y], v); }); }
      if (k.type === 'mystery') k.cells.filter(([r]) => !(b.expandReels || []).includes(r)).forEach(([r, y]) => { assert.strictEqual(b.grid[r][y], k.sym); assert.strictEqual(k.pre[r][y], -2); });
    }
    assert.strictEqual(seen.size, types.length, c.id + ': alle Feature-Arten kommen vor');
  }
  L.setRandom(L.seeded(20261016));
});
t('Nachdreh: Preis liegt über dem Erwartungswert, Walze ohne Sondersymbole', () => {
  L.setRandom(L.seeded(77));
  for (const c of MACHINES) {
    const m = L.compile(c); m.luckyCfg.p = 0; let paid = 0, won = 0, n = 0;
    for (let i = 0; i < 6000 && n < 25; i++) {
      const r = L.playRound(m, 100); if (r.total || r.steps.length > 1) continue;
      const o = L.nudgeOffer(m, 100, r.steps[0].grid); if (!o) continue; n++;
      const st = L.nudge(m, 100, r.steps[0].grid, o.reel); paid += o.price;
      assert(st.grid[o.reel].every(v => v !== m.scat && v !== m.bon && v !== m.coin));
      st.grid.forEach((col, x) => { if (x !== o.reel) assert.deepStrictEqual(col, r.steps[0].grid[x]); });
      assert.strictEqual(st.win, L.evaluate(m, st.grid, 100, 1).win);
      for (let k = 0; k < 600; k++) won += L.nudge(m, 100, r.steps[0].grid, o.reel).win / 600;   // Erwartungswert schätzen
    }
    if (m.respin) assert.strictEqual(n, 0); else { assert(n > 0, c.id + ' ohne Nachdreh-Angebot'); assert(won / paid < 1.12, c.id + ' Nachdreh zu billig: ' + (won / paid).toFixed(2)); }
  }
  L.setRandom(L.seeded(20261016));
});
t('Bonusspiele: Wahl und Rad zahlen den angezeigten Betrag', () => {
  for (const id of ['pirate-pick', 'fortune-wheel', 'gold-reels']) {
    const m = L.compile(MACHINES.find(c => c.id === id)); let n = 0;
    for (let i = 0; i < 20000 && n < 30; i++) {
      const r = L.playRound(m, 1000); const b = r.steps.find(s => s.type === 'pick' || s.type === 'wheel'); if (!b) continue; n++;
      if (b.type === 'pick') { assert.strictEqual(b.vals.length + b.rest.length, b.items); assert.strictEqual(b.win, Math.round(b.vals.reduce((a, v) => a + v, 0) * b.unit)); }
      else { const sg = b.segs[b.idx]; assert.strictEqual(b.win, sg.x ? Math.round(sg.x * b.unit) : 0); if (sg.free) assert(r.steps.some(s => s.type === 'freeStart' && s.count >= sg.free)); }
    }
    assert(n > 0, id + ' ohne Bonus');
  }
});

// --- Karten ---
t('Blackjack-Werte und Abrechnung', () => {
  const c = (r, s = 0) => s * 13 + r;   // r: 0 = Ass
  assert.deepStrictEqual(L.bjValue([c(0), c(9)]), { total: 21, soft: true });
  assert.strictEqual(L.bjValue([c(0), c(0), c(8)]).total, 21);
  assert.strictEqual(L.bjValue([c(12), c(11), c(1)]).total, 22);
  assert(L.bjIsBlackjack([c(0), c(12)], false)); assert(!L.bjIsBlackjack([c(0), c(12)], true));
  assert.strictEqual(L.bjSettle({ cards: [c(0), c(12)], bet: 100 }, [c(9), c(8)]).ret, 250);
  assert.strictEqual(L.bjSettle({ cards: [c(9), c(8)], bet: 100 }, [c(9), c(8)]).ret, 100);
  assert.strictEqual(L.bjSettle({ cards: [c(9), c(8)], bet: 100 }, [c(9), c(5), c(9)]).ret, 200);
  assert.strictEqual(L.bjSettle({ cards: [c(9), c(5), c(9)], bet: 100 }, [c(9), c(5), c(9)]).ret, 0);
  assert(L.bjDealerShouldHit([c(5), c(9)])); assert(!L.bjDealerShouldHit([c(0), c(5)]));   // weiche 17 steht
  assert(L.bjCanSplit({ cards: [c(9), c(12)] }, [1]));
});
t('Poker-Hände', () => {
  const h = s => s.split(' ').map(x => { const r = 'A23456789TJQK'.indexOf(x[0]); const su = 'shdc'.indexOf(x[1]); return su * 13 + r; });
  const id = s => L.pokerEval(h(s)).id;
  assert.strictEqual(id('As Ks Qs Js Ts'), 'royal'); assert.strictEqual(id('9h Kh Qh Jh Th'), 'sflush');
  assert.strictEqual(id('9h 9s 9d 9c Th'), 'quads'); assert.strictEqual(id('9h 9s 9d Tc Th'), 'full');
  assert.strictEqual(id('2h 9h 4h Jh Th'), 'flush'); assert.strictEqual(id('As 2h 3d 4c 5h'), 'straight');
  assert.strictEqual(id('Ts Jh Qd Kc Ah'), 'straight'); assert.strictEqual(id('Qs Kh Ad 2c 3h'), null);
  assert.strictEqual(id('7s 7h 7d 2c 3h'), 'trips'); assert.strictEqual(id('7s 7h 3d 3c Ah'), 'two');
  assert.strictEqual(id('Js Jh 3d 4c 9h'), 'jacks'); assert.strictEqual(id('As Ah 3d 4c 9h'), 'jacks'); assert.strictEqual(id('Ts Th 3d 4c 9h'), null);
});
t('Roulette-Auszahlungen', () => {
  assert.strictEqual(L.WHEEL.length, 37); assert.strictEqual(new Set(L.WHEEL).size, 37);
  assert.strictEqual(L.roulettePayout({ n17: 10, red: 10, odd: 10, d2: 10, c2: 10 }, 17), 360 + 0 + 20 + 30 + 30);
  assert.strictEqual(L.roulettePayout({ red: 10, black: 10, n0: 5 }, 0), 180);
  // Erwartungswert aller Wetten = 36/37
  for (const k of ['red', 'black', 'even', 'odd', 'low', 'high', 'd1', 'd2', 'd3', 'c1', 'c2', 'c3', 'n5', 'n0']) {
    let s = 0; for (let n = 0; n <= 36; n++) s += L.rouletteBetPays(k, n); assert.strictEqual(s, 36, k);
  }
});
t('Glücksrad hat 54 Felder in richtiger Verteilung', () => {
  assert.strictEqual(L.WHEEL_SEGS.length, 54);
  for (const [k, , n] of L.WHEEL_VALUES) assert.strictEqual(L.WHEEL_SEGS.filter(s => s === k).length, n, k);
});

// --- Auszahlungsquoten der Automaten ---
function sim(c, n, scaleOverride) {
  const m = L.compile(Object.assign({}, c, scaleOverride != null ? { scale: scaleOverride } : {}));
  const bet = 10000; let paid = 0, hw = 0, hits = 0, feat = 0, maxWin = 0;
  for (let i = 0; i < n; i++) {
    const r = L.playRound(m, bet);
    for (const s of r.steps) if (s.type === 'holdwin') hw += s.win;
    paid += r.total; if (r.total) hits++; if (r.steps.length > 1) feat++; if (r.total > maxWin) maxWin = r.total;
    let sum = 0; for (const s of r.steps) if (s.type !== 'freeStart' && s.type !== 'freeEnd') sum += s.win || 0;
    if (sum !== r.total) throw new Error('Summe der Schritte stimmt nicht');
  }
  return { rtp: paid / n / bet, hw: hw / n / bet, hit: hits / n, feat: feat / n, max: maxWin / bet };
}
L.setRandom(L.seeded(20261016));
if (CAL) {
  const N = +(process.env.N || 3e6), TARGET = 0.935;   // + ca. 3 % aus dem Mystery-Jackpot (app.js)
  const only = process.argv.slice(2).filter(a => !a.startsWith('--'));
  for (const c of MACHINES.filter(c => !only.length || only.includes(c.id))) {
    const s = sim(c, N, 1); const A = s.rtp - s.hw;
    console.log(`${c.id.padEnd(14)} roh ${(s.rtp * 100).toFixed(1)}%  holdwin ${(s.hw * 100).toFixed(1)}%  Treffer ${(s.hit * 100).toFixed(1)}%  Feature 1/${Math.round(1 / s.feat)}  →  scale: ${((TARGET - s.hw) / A).toFixed(5)}`);
  }
} else {
  for (const c of MACHINES) t('Quote ' + c.id, () => {
    const s = sim(c, 300000);
    console.log(`    ${(s.rtp * 100).toFixed(1)} %  Treffer ${(s.hit * 100).toFixed(1)} %  Feature 1/${Math.round(1 / s.feat)}  max ${Math.round(s.max)}×`);
    assert(s.rtp > 0.85 && s.rtp < 1.05, 'Quote außerhalb 85–105 %');
    assert(s.hit > 0.12, 'zu selten Gewinne');
  });
}
if (fails) { console.log(fails + ' Fehler'); process.exit(1); } else console.log('alle Tests bestanden');
