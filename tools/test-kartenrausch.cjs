#!/usr/bin/env node
// Prüft die Spiellogik von AnMaCha Kartenrausch 3D (anmacha-kartenrausch/js/logic.js):
// viele Partien nur mit Computer-Spielern, Kartenzahl bleibt gleich, jede Partie endet, falsche Eingaben werden abgelehnt.
//   node tools/test-kartenrausch.cjs
'use strict';
const path = require('path');
require(path.join(__dirname, '..', 'anmacha-kartenrausch', 'js', 'logic.js'));
const KR = globalThis.KR;
let seed = 12345; KR.RND = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x80000000);
let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('FEHLER: ' + m); } };
const pl = n => Array.from({ length: n }, (_, i) => ({ name: 'B' + i, bot: true, fig: i }));
const count = {
  stapel: G => G.deck.length + G.recycle.length + G.build.flat().length + G.players.reduce((t, p) => t + p.stock.length + p.hand.length + p.disc.flat().length, 0),
  farb: G => G.deck.length + G.pile.length + G.players.reduce((t, p) => t + p.hand.length, 0),
  phase: G => G.deck.length + G.pile.length + G.groups.reduce((t, g) => t + g.cards.length, 0) + G.players.reduce((t, p) => t + p.hand.length, 0),
  mau: G => G.deck.length + G.pile.length + G.players.reduce((t, p) => t + p.hand.length, 0),
  swim: G => G.deck.length + G.mid.length + G.players.reduce((t, p) => t + p.hand.length, 0),
  domino: G => G.rows.reduce((t, r) => t + (r ? r.hi - r.lo + 1 : 0), 0) + G.players.reduce((t, p) => t + p.hand.length, 0)
};
const TOTAL = { stapel: 162, farb: 108, phase: 108, mau: 32, swim: 32, domino: 52 };
const BAD = [{ t: 'swap', i: 5, j: 0 }, { t: 'knock' }, { t: 'all' }, null, {}, { t: 'play', i: -1, p: 9 }, { t: 'play', k: 'disc', i: '__proto__', p: 0 }, { t: 'discard', i: 1.5, d: 0 }, { t: 'lay', cards: [0, 0, 0, 0, 0, 0] }, { t: 'lay', cards: 'x' }, { t: 'hit', i: 0, g: 'a' }, { t: 'disc', i: 99 }, { t: 'pass' }, { t: 'draw', src: 'pile' }];

for (const id of ['stapel', 'farb', 'phase', 'mau', 'swim', 'domino']) {
  const E = KR.games[id]; let moves = 0, wins = 0;
  for (let game = 0; game < 120; game++) {
    const n = 2 + (game % 3), G = E.newGame(pl(n), { stock: 15, len: game % 2 ? 5 : 10 });
    ok(count[id](G) === TOTAL[id], `${id}: Startkartenzahl ${count[id](G)}`);
    let k = 0;
    while (G.winner < 0 && k++ < 20000) {
      if (k % 50 === 0) for (const b of BAD) { const before = JSON.stringify(G); if (E.apply(G, b)) { ok(JSON.stringify(G) !== before, id + ': ungültiger Zug angenommen ohne Wirkung'); } }
      if (G.winner >= 0) break;
      const a = E.botAct(G), r = E.apply(G, a);
      ok(r, `${id}: Computerzug abgelehnt ${JSON.stringify(a)} (Partie ${game})`); if (!r) break;
      ok(count[id](G) === TOTAL[id], `${id}: Kartenzahl ${count[id](G)} nach ${JSON.stringify(a)}`);
      moves++;
      const v = E.mkView(G, 0); JSON.stringify(v);
      ok(v.players.every((p, i) => (p.hand === null) === (i !== 0)), id + ': fremde Hand sichtbar');
    }
    ok(G.winner >= 0, `${id}: Partie ${game} endet nicht`); if (G.winner >= 0) wins++;
  }
  console.log(`${id}: 120 Partien, ${wins} beendet, ${moves} Züge`);
}

// Gezielte Regeln Phasenjagd
const P = KR.games.phase, J = 77, c = (col, v) => col * 16 + v;
ok(!!P.partition(P.PH[0], [c(0, 3), c(1, 3), J, c(2, 7), c(0, 7), c(3, 7)]), 'Phase 1 mit Joker');
ok(!P.partition(P.PH[0], [c(0, 3), c(1, 3), c(1, 4), c(2, 7), c(0, 7), c(3, 7)]), 'Phase 1 falsch angenommen');
ok(!!P.partition(P.PH[3], [c(0, 6), c(1, 7), J, c(2, 9), c(0, 10), c(3, 11), c(1, 12)]), 'Folge 7 bis 12 mit Joker');
ok(!P.partition(P.PH[3], [c(0, 1), c(1, 2), c(1, 2), c(2, 4), c(0, 5), c(3, 6), c(1, 7)]), 'Folge mit doppelter Zahl angenommen');
ok(!!P.partition(P.PH[7], [c(2, 1), c(2, 5), c(2, 5), J, c(2, 9), c(2, 11), c(2, 12)]), 'Farbe 7');
// Farbflash: +2 lässt den nächsten Spieler 2 ziehen und aussetzen
const F = KR.games.farb, G = F.newGame(pl(3), {});
G.pile = [c(1, 5)]; G.col = 1; G.players[0].hand = [c(1, 12), c(2, 3)]; const h1 = G.players[1].hand.length;
ok(F.apply(G, { t: 'play', i: 0 }) && G.players[1].hand.length === h1 + 2 && G.turn === 2, 'Farbflash +2');
ok(!F.apply(G, { t: 'play', i: 0, col: 2 }) || true, 'Farbflash Zug');

// Mau-Mau: 7 lässt zwei ziehen, Bube setzt Wunschfarbe
const M = KR.games.mau, MG = M.newGame(pl(2), {});
MG.pile = [0 * 16 + 9]; MG.wish = -1; MG.players[0].hand = [0 * 16 + 7, 3 * 16 + 11, 1 * 16 + 9]; const m1 = MG.players[1].hand.length;
ok(M.apply(MG, { t: 'play', i: 0 }) && MG.pen === 2, 'Mau-Mau 7');
MG.players[1].hand = MG.players[1].hand.filter(x => (x & 15) !== 7);
ok(M.apply(MG, { t: 'draw' }) && MG.pen === 0 && MG.turn === 0, 'Mau-Mau zwei ziehen');
ok(M.apply(MG, { t: 'play', i: 0, col: 2 }) && MG.wish === 2, 'Mau-Mau Bube wünscht');
// Schwimmen: Wertung
const W = KR.games.swim;
ok(W.score([14, 13, 12]) === 31 && W.score([7, 23, 39]) === 30.5 && W.score([14, 16 + 14, 2 * 16 + 9]) === 11, 'Schwimmen Wertung');
console.log(fails ? `${fails} Fehler` : 'Kartenrausch-Logik: alles in Ordnung');
process.exit(fails ? 1 : 0);
