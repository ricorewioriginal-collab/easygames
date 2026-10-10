'use strict';
/* Spiellogik des Slots (ohne Grafik): 5 Walzen x 3 Reihen, 20 Gewinnlinien, Wild, Scatter, Freispiele. Nur Spielgeld. */
const Slot = (() => {
  // Symbole: id, Gewicht je Walze (Wild nur Walzen 2-4), Auszahlung x Linieneinsatz fuer 3/4/5 Treffer
  const SYM = [
    { id: 'seven',   w: 3,  pay: [137, 685, 3425] },
    { id: 'diamond', w: 4,  pay: [103, 411, 1713] },
    { id: 'crown',   w: 5,  pay: [68, 274, 1096] },
    { id: 'bell',    w: 7,  pay: [41, 137, 616] },
    { id: 'cherry',  w: 9,  pay: [27, 82, 342] },
    { id: 'clover',  w: 10, pay: [21, 68, 274] },
    { id: 'horse',   w: 11, pay: [16, 55, 206] },
    { id: 'logoA',   w: 12, pay: [11, 34, 123] },
    { id: 'logoB',   w: 12, pay: [8, 27, 103] },
    { id: 'wild',    w: 3,  pay: null },
    { id: 'scatter', w: 2,  pay: null }
  ];
  const IDX = {}; SYM.forEach((s, i) => { IDX[s.id] = i; });
  const WILD = IDX.wild, SCAT = IDX.scatter;
  const LINES = [[1,1,1,1,1],[0,0,0,0,0],[2,2,2,2,2],[0,1,2,1,0],[2,1,0,1,2],[0,0,1,2,2],[2,2,1,0,0],[1,0,0,0,1],[1,2,2,2,1],[0,1,0,1,0],
                 [2,1,2,1,2],[1,0,1,2,1],[1,2,1,0,1],[0,1,1,1,0],[2,1,1,1,2],[0,2,0,2,0],[2,0,2,0,2],[1,1,0,1,1],[1,1,2,1,1],[0,0,2,0,0]];
  const SCAT_PAY = { 3: 2, 4: 10, 5: 50 };       // x Gesamteinsatz
  const FREE_SPINS = 10, RETRIGGER = 5, FREE_MULT = 2;
  const rnd = (() => { try { if (typeof crypto !== 'undefined' && crypto.getRandomValues) { const b = new Uint32Array(1); return () => { crypto.getRandomValues(b); return b[0] / 4294967296; }; } } catch (e) {} return Math.random; })();
  const tables = [0, 1, 2, 3, 4].map(r => { const t = []; let tot = 0; SYM.forEach((s, i) => { const w = i === WILD && (r === 0 || r === 4) ? 0 : s.w; if (w) { tot += w; t.push([tot, i]); } }); return { t, tot }; });
  const pick = r => { const T = tables[r]; let x = rnd() * T.tot; for (const [c, i] of T.t) if (x < c) return i; return 0; };
  const spinGrid = () => { const g = []; for (let r = 0; r < 5; r++) { g.push([pick(r), pick(r), pick(r)]); } return g; };   // g[reel][row]

  // Auswertung: lineBet = Einsatz pro Linie, mult = Gewinnmultiplikator (Freispiele)
  function evaluate(g, lineBet, mult) {
    const wins = []; let total = 0;
    LINES.forEach((ln, li) => {
      const row = ln.map((y, r) => g[r][y]); let s = -1;
      for (const v of row) { if (v === SCAT) break; if (v !== WILD) { s = v; break; } }
      if (s < 0) s = row[0] === WILD ? IDX.seven : -1; if (s < 0) return;
      let n = 0; for (const v of row) { if (v === s || v === WILD) n++; else break; }
      if (n >= 3) { const amt = SYM[s].pay[n - 3] * lineBet * mult; wins.push({ line: li, sym: s, n, amt }); total += amt; }
    });
    let sc = 0; const scPos = []; g.forEach((col, r) => col.forEach((v, y) => { if (v === SCAT) { sc++; scPos.push([r, y]); } }));
    let scAmt = 0; if (sc >= 3) { scAmt = SCAT_PAY[Math.min(5, sc)] * lineBet * LINES.length * mult; total += scAmt; }
    return { wins, total, scatters: sc, scPos, scAmt };
  }
  return { SYM, IDX, LINES, SCAT_PAY, FREE_SPINS, RETRIGGER, FREE_MULT, spinGrid, evaluate };
})();
if (typeof module !== 'undefined') module.exports = Slot;
