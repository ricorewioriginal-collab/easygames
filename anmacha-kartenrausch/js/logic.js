'use strict';
/* AnMaCha Kartenrausch 3D – Spiellogik der Kartenspiele (ohne Anzeige, auch in Node testbar: tools/test-kartenrausch.cjs).
   Jedes Spiel: newGame(spieler, optionen) → G, apply(G, aktion) → true/false, botAct(G) → aktion, mkView(G, ich) → Ansicht.
   Karten sind ganze Zahlen, damit Ansichten klein bleiben und online ohne Umwandlung verschickt werden können. */
(function (root) {
  const KR = root.KR = root.KR || {};
  KR.RND = KR.RND || Math.random;
  const R = () => KR.RND();
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = (R() * (i + 1)) | 0; const t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  const int = (x, lo, hi) => Number.isInteger(x) && x >= lo && x <= hi;
  const base = p => ({ name: String(p.name || 'Spieler').slice(0, 14), bot: !!p.bot, fig: int(p.fig, 0, 99) ? p.fig : 0 });
  const pub = p => ({ name: p.name, bot: p.bot, fig: p.fig });
  KR.shuffle = shuffle;
  KR.games = {};

  /* ===================== Stapelrausch: Zahlentürme 1–12, Zielstapel leeren ===================== */
  (function () {
    const mkDeck = () => { const d = []; for (let v = 1; v <= 12; v++) for (let i = 0; i < 12; i++) d.push(v); for (let i = 0; i < 18; i++) d.push(0); return d; };
    const sortHand = h => h.sort((a, b) => (a || 99) - (b || 99));
    function draw(G, P, k) {
      while (k-- > 0) {
        if (!G.deck.length) { if (!G.recycle.length) break; G.deck = shuffle(G.recycle); G.recycle = []; }
        P.hand.push(G.deck.pop());
      }
      sortHand(P.hand);
    }
    const fill = (G, P) => draw(G, P, 5 - P.hand.length);
    const playable = (G, c, p) => c === 0 || c === G.build[p].length + 1;
    function canAct(G) {
      const P = G.players[G.turn]; if (P.hand.length) return true;
      const tops = [P.stock[P.stock.length - 1]].concat(P.disc.map(d => d[d.length - 1]));
      return tops.some(c => c !== undefined && [0, 1, 2, 3].some(p => playable(G, c, p)));
    }
    function endByCount(G) { let b = 0; G.players.forEach((p, i) => { if (p.stock.length < G.players[b].stock.length) b = i; }); G.winner = b; }
    function nextTurn(G) { G.turn = (G.turn + 1) % G.players.length; G.turns++; fill(G, G.players[G.turn]); }
    function settle(G) {
      let g = 0;
      while (G.winner < 0 && !canAct(G)) { if (++g > G.players.length) { endByCount(G); break; } nextTurn(G); }
      if (G.winner < 0 && G.turns > 800) endByCount(G);
    }
    function newGame(pl, opt) {
      const stockN = opt && opt.stock === 15 ? 15 : 30;
      const G = { game: 'stapel', deck: shuffle(mkDeck()), recycle: [], build: [[], [], [], []], turn: 0, winner: -1, turns: 0, seq: 0, fx: null, players: [] };
      pl.forEach(p => G.players.push(Object.assign(base(p), { stock: G.deck.splice(0, stockN), hand: [], disc: [[], [], [], []] })));
      G.players.forEach(P => fill(G, P)); settle(G); return G;
    }
    function cardAt(G, k, i) {
      const P = G.players[G.turn];
      if (k === 'hand') return int(i, 0, P.hand.length - 1) ? P.hand[i] : undefined;
      if (k === 'stock') return P.stock.length ? P.stock[P.stock.length - 1] : undefined;
      if (k === 'disc') { const d = int(i, 0, 3) ? P.disc[i] : null; return d && d.length ? d[d.length - 1] : undefined; }
    }
    function apply(G, a) {
      if (G.winner >= 0 || !a) return false;
      const P = G.players[G.turn];
      if (a.t === 'play') {
        const p = a.p, i = a.k === 'stock' ? 0 : a.i; if (!int(p, 0, 3)) return false;
        const c = cardAt(G, a.k, i); if (c === undefined || !playable(G, c, p)) return false;
        if (a.k === 'hand') P.hand.splice(i, 1); else if (a.k === 'stock') P.stock.pop(); else P.disc[i].pop();
        const B = G.build[p]; B.push(c); const clr = B.length === 12; if (clr) { G.recycle.push(...B); G.build[p] = []; }
        G.fx = { seq: ++G.seq, pl: G.turn, t: 'play', k: a.k, i, p, c, clr };
        if (a.k === 'stock' && !P.stock.length) { G.winner = G.turn; return true; }
        if (!P.hand.length) draw(G, P, 5);
        settle(G); return true;
      }
      if (a.t === 'discard') {
        const i = a.i, d = a.d; if (!(int(i, 0, P.hand.length - 1) && int(d, 0, 3))) return false;
        const c = P.hand.splice(i, 1)[0]; P.disc[d].push(c);
        G.fx = { seq: ++G.seq, pl: G.turn, t: 'disc', k: 'hand', i, d, c };
        nextTurn(G); settle(G); return true;
      }
      return false;
    }
    function botAct(G) {
      const P = G.players[G.turn], B = G.build, need = p => B[p].length + 1;
      const s = P.stock.length ? P.stock[P.stock.length - 1] : -1;
      if (s > 0) for (let p = 0; p < 4; p++) if (s === need(p)) return { t: 'play', k: 'stock', i: 0, p };
      if (s === 0) { let b = 0; for (let p = 1; p < 4; p++) if (B[p].length > B[b].length) b = p; return { t: 'play', k: 'stock', i: 0, p: b }; }
      const srcs = [];
      P.disc.forEach((d, i) => { if (d.length) srcs.push({ k: 'disc', i, c: d[d.length - 1] }); });
      P.hand.forEach((c, i) => srcs.push({ k: 'hand', i, c }));
      let best = null, bs = -1e9;
      for (const x of srcs) for (let p = 0; p < 4; p++) {
        if (!playable(G, x.c, p)) continue;
        const opens = s > 0 && s === need(p) + 1;
        if (x.c === 0 && !opens && P.hand.length > 1) continue;
        const sc = (opens ? 100 : 0) + (x.k === 'disc' ? 5 : 0) + (x.c === 0 ? -20 : x.c * 0.1);
        if (sc > bs) { bs = sc; best = { t: 'play', k: x.k, i: x.i, p }; }
      }
      if (best) return best;
      if (!P.hand.length) { for (const x of srcs) for (let p = 0; p < 4; p++) if (playable(G, x.c, p)) return { t: 'play', k: x.k, i: x.i, p }; }
      let bi = 0, bd = 0; bs = -1e9;
      P.hand.forEach((c, i) => P.disc.forEach((d, k) => {
        const top = d.length ? d[d.length - 1] : -1;
        let sc = c === 0 ? -50 : c * 0.3;
        sc += top < 0 ? 5 : top === 0 ? 0 : top >= c ? 8 - (top - c) : -5 - (c - top);
        if (sc > bs) { bs = sc; bi = i; bd = k; }
      }));
      return { t: 'discard', i: bi, d: bd };
    }
    function mkView(G, me) {
      return {
        game: 'stapel', n: G.players.length, me, turn: G.turn, winner: G.winner, deckN: G.deck.length, build: G.build, fx: G.fx,
        players: G.players.map((p, i) => Object.assign(pub(p), {
          stockN: p.stock.length, stockTop: p.stock.length ? p.stock[p.stock.length - 1] : -1,
          handN: p.hand.length, hand: i === me ? p.hand.slice() : null, disc: p.disc
        }))
      };
    }
    KR.games.stapel = { newGame, apply, botAct, mkView, playable: (build, c, p) => c === 0 || c === build[p].length + 1 };
  })();

  /* ===================== Farbflash: Farbe oder Zeichen bedienen, Hand leeren ===================== */
  /* Karte = Farbe*16 + Wert. Farben 0–3 (Rot, Gelb, Grün, Blau), Werte 0–9, 10 Aussetzen, 11 Richtungswechsel, 12 +2.
     Farbwahl = 77 (4*16+13), Farbwahl +4 = 78. */
  (function () {
    const C = x => x >> 4, V = x => x & 15, W = 77, W4 = 78;
    function mkDeck() { const d = []; for (let c = 0; c < 4; c++) { d.push(c * 16); for (let v = 1; v <= 12; v++) d.push(c * 16 + v, c * 16 + v); } for (let i = 0; i < 4; i++) d.push(W, W4); return d; }
    const sortHand = h => h.sort((a, b) => a - b);
    const top = G => G.pile[G.pile.length - 1];
    const fits = (G, x) => C(x) === 4 || C(x) === G.col || V(x) === V(top(G));
    function take(G, P, k) {
      const got = [];
      while (k-- > 0) {
        if (!G.deck.length) { const t = G.pile.pop(); G.deck = shuffle(G.pile); G.pile = [t]; }
        if (!G.deck.length) break;
        const x = G.deck.pop(); P.hand.push(x); got.push(x);
      }
      sortHand(P.hand); return got;
    }
    const step = (G, k) => { const n = G.players.length; G.turn = ((G.turn + G.dir * k) % n + n) % n; G.turns++; };
    function newGame(pl, opt) {
      const G = { game: 'farb', deck: shuffle(mkDeck()), pile: [], col: 0, dir: 1, turn: 0, winner: -1, turns: 0, seq: 0, fx: null, drawn: -1, players: [] };
      pl.forEach(p => G.players.push(Object.assign(base(p), { hand: [] })));
      G.players.forEach(P => take(G, P, 7));
      let x = G.deck.pop(), g = 0;
      while ((C(x) === 4 || V(x) > 9) && g++ < 200) { G.deck.unshift(x); x = G.deck.pop(); }
      G.pile.push(x); G.col = C(x);
      return G;
    }
    function endByCount(G) { let b = 0; G.players.forEach((p, i) => { if (p.hand.length < G.players[b].hand.length) b = i; }); G.winner = b; }
    function apply(G, a) {
      if (G.winner >= 0 || !a) return false;
      const P = G.players[G.turn], n = G.players.length;
      if (a.t === 'play') {
        const i = a.i; if (!int(i, 0, P.hand.length - 1)) return false;
        if (G.drawn >= 0 && i !== G.drawn) return false;
        const x = P.hand[i]; if (!fits(G, x)) return false;
        P.hand.splice(i, 1); G.pile.push(x); G.drawn = -1;
        G.col = C(x) < 4 ? C(x) : int(a.col, 0, 3) ? a.col : 0;
        const fx = G.fx = { seq: ++G.seq, pl: G.turn, t: 'play', i, c: x, col: G.col, one: P.hand.length === 1 };
        if (!P.hand.length) { G.winner = G.turn; return true; }
        const v = V(x), nxt = () => G.players[((G.turn + G.dir) % n + n) % n];
        if (x === W4 || v === 12) { const vic = nxt(); fx.vic = G.players.indexOf(vic); fx.n = take(G, vic, x === W4 ? 4 : 2).length; step(G, 2); }
        else if (C(x) < 4 && v === 10) { fx.vic = G.players.indexOf(nxt()); step(G, 2); }
        else if (C(x) < 4 && v === 11) { if (n === 2) { fx.vic = G.players.indexOf(nxt()); step(G, 2); } else { G.dir = -G.dir; step(G, 1); } }
        else step(G, 1);
        if (G.turns > 3000) endByCount(G);
        return true;
      }
      if (a.t === 'draw') {
        if (G.drawn >= 0) return false;
        const got = take(G, P, 1), x = got.length ? got[0] : -1;
        G.fx = { seq: ++G.seq, pl: G.turn, t: 'draw', n: got.length };
        if (got.length && fits(G, x)) { G.drawn = P.hand.lastIndexOf(x); return true; }
        step(G, 1); if (G.turns > 3000) endByCount(G); return true;
      }
      if (a.t === 'pass') {
        if (G.drawn < 0) return false;
        G.drawn = -1; G.fx = { seq: ++G.seq, pl: G.turn, t: 'pass' }; step(G, 1); return true;
      }
      return false;
    }
    function bestCol(hand, skip) { const cnt = [0, 0, 0, 0]; hand.forEach((x, i) => { if (i !== skip && C(x) < 4) cnt[C(x)]++; }); let b = (R() * 4) | 0; cnt.forEach((k, c) => { if (k > cnt[b]) b = c; }); return b; }
    function botAct(G) {
      const P = G.players[G.turn], n = G.players.length;
      const nextN = G.players[((G.turn + G.dir) % n + n) % n].hand.length;
      if (G.drawn >= 0) return { t: 'play', i: G.drawn, col: bestCol(P.hand, G.drawn) };
      let best = -1, bs = -1e9;
      P.hand.forEach((x, i) => {
        if (!fits(G, x)) return;
        const v = V(x); let s;
        if (x === W4) s = nextN <= 2 ? 60 : -40;
        else if (x === W) s = nextN <= 2 ? 30 : -30;
        else if (v >= 10) s = (nextN <= 3 ? 50 : 8) + (C(x) === G.col ? 2 : 0);
        else s = 10 + v + (C(x) === G.col ? 3 : 0);
        if (s > bs) { bs = s; best = i; }
      });
      if (best >= 0) return { t: 'play', i: best, col: bestCol(P.hand, best) };
      return { t: 'draw' };
    }
    function mkView(G, me) {
      return {
        game: 'farb', n: G.players.length, me, turn: G.turn, winner: G.winner, dir: G.dir, col: G.col, top: top(G), deckN: G.deck.length,
        drawn: G.turn === me ? G.drawn : -1, fx: G.fx,
        players: G.players.map((p, i) => Object.assign(pub(p), { handN: p.hand.length, hand: i === me ? p.hand.slice() : null }))
      };
    }
    KR.games.farb = { newGame, apply, botAct, mkView, fits: (v, x) => C(x) === 4 || C(x) === v.col || V(x) === V(v.top) };
  })();

  /* ===================== Phasenjagd: 10 Phasen nacheinander erfüllen ===================== */
  /* Karte = Farbe*16 + Zahl (1–12, Farben 0–3), Joker = 77, Aussetzen = 78. */
  (function () {
    const C = x => x >> 4, V = x => x & 15, J = 77, SK = 78;
    const isJ = x => x === J, isS = x => x === SK;
    const PH = [
      [['set', 3], ['set', 3]], [['set', 3], ['run', 4]], [['set', 4], ['run', 4]], [['run', 7]], [['run', 8]],
      [['run', 9]], [['set', 4], ['set', 4]], [['col', 7]], [['set', 5], ['set', 2]], [['set', 5], ['set', 3]]
    ];
    const need = ph => PH[ph].reduce((t, r) => t + r[1], 0);
    function mkDeck() { const d = []; for (let c = 0; c < 4; c++) for (let v = 1; v <= 12; v++) d.push(c * 16 + v, c * 16 + v); for (let i = 0; i < 8; i++) d.push(J); for (let i = 0; i < 4; i++) d.push(SK); return d; }
    const sortHand = h => h.sort((a, b) => (V(a) - V(b)) || (a - b));
    const pen = x => isJ(x) ? 25 : isS(x) ? 15 : V(x) >= 10 ? 10 : 5;
    // Gruppe bilden: Satz (gleiche Zahl), Folge (lückenlos aufsteigend), Farbe (gleiche Farbe). Joker ergänzen, mind. eine echte Karte.
    function mkGroup(t, cards) {
      if (cards.some(isS)) return null;
      const nat = cards.filter(x => !isJ(x)), n = cards.length; if (!nat.length) return null;
      if (t === 'set') { const v = V(nat[0]); if (nat.some(x => V(x) !== v)) return null; return { t, v, cards: nat.concat(cards.filter(isJ)) }; }
      if (t === 'col') { const c = C(nat[0]); if (nat.some(x => C(x) !== c)) return null; return { t, c, cards: sortHand(nat.slice()).concat(cards.filter(isJ)) }; }
      const vs = nat.map(V); if (new Set(vs).size !== vs.length) return null;
      const mn = Math.min(...vs), mx = Math.max(...vs); if (mx - mn + 1 > n || n > 12) return null;
      const lo = Math.min(mn, 13 - n), hi = lo + n - 1, out = [];
      for (let v = lo; v <= hi; v++) { const k = nat.find(x => V(x) === v); out.push(k === undefined ? J : k); }
      return { t, lo, hi, cards: out };
    }
    function partition(reqs, cards) {
      if (!reqs.length) return cards.length ? null : [];
      const [t, n] = reqs[0]; if (cards.length < n) return null;
      const pick = [], m = cards.length;
      const rec = s => {
        if (pick.length === n) {
          const g = mkGroup(t, pick.map(k => cards[k])); if (!g) return null;
          const rest = cards.filter((_, k) => !pick.includes(k)), r = partition(reqs.slice(1), rest);
          return r ? [g].concat(r) : null;
        }
        for (let k = s; k <= m - (n - pick.length); k++) { pick.push(k); const r = rec(k + 1); pick.pop(); if (r) return r; }
        return null;
      };
      return rec(0);
    }
    function fitsGroup(g, x) {
      if (isS(x)) return false;
      if (g.t === 'set') return isJ(x) || V(x) === g.v;
      if (g.t === 'col') return isJ(x) || C(x) === g.c;
      if (isJ(x)) return g.hi < 12 || g.lo > 1;
      return V(x) === g.lo - 1 || V(x) === g.hi + 1;
    }
    function addTo(g, x) {
      if (g.t !== 'run') { g.cards.push(x); return; }
      if (isJ(x) ? g.hi < 12 : V(x) === g.hi + 1) { g.hi++; g.cards.push(x); } else { g.lo--; g.cards.unshift(x); }
    }
    function reshuffle(G) { if (G.deck.length) return; const t = G.pile.pop(); G.deck = shuffle(G.pile); G.pile = t === undefined ? [] : [t]; }
    function deal(G) {
      G.deck = shuffle(mkDeck()); G.pile = []; G.groups = []; G.step = 'draw';
      G.players.forEach(P => { P.hand = sortHand(G.deck.splice(0, 10)); P.done = false; P.skip = false; });
      let x = G.deck.pop(), g = 0; while (isS(x) && g++ < 50) { G.deck.unshift(x); x = G.deck.pop(); }
      G.pile.push(x); G.turn = (G.dealer + 1) % G.players.length;
    }
    function newGame(pl, opt) {
      const len = opt && opt.len === 5 ? 5 : 10;
      const G = { game: 'phase', len, deck: [], pile: [], groups: [], players: [], turn: 0, step: 'draw', dealer: 0, round: 1, winner: -1, wait: false, last: null, seq: 0, fx: null, turns: 0 };
      pl.forEach(p => G.players.push(Object.assign(base(p), { hand: [], ph: 0, done: false, pts: 0, skip: false })));
      deal(G); return G;
    }
    function endRound(G) {
      const rows = G.players.map(P => { const pts = P.hand.reduce((t, x) => t + pen(x), 0); P.pts += pts; const made = P.done; if (made) P.ph++; return { made, pts, ph: P.ph, tot: P.pts }; });
      G.last = { round: G.round, out: G.turn, rows };
      const fin = G.players.map((P, i) => i).filter(i => G.players[i].ph >= G.len);
      if (fin.length) { let b = fin[0]; fin.forEach(i => { if (G.players[i].pts < G.players[b].pts) b = i; }); G.winner = b; }
      else { G.wait = true; G.round++; G.dealer = (G.dealer + 1) % G.players.length; }
      G.fx = { seq: ++G.seq, pl: G.turn, t: 'round' };
    }
    function apply(G, a) {
      if (G.winner >= 0 || !a) return false;
      if (G.wait) { if (a.t !== 'next') return false; G.wait = false; deal(G); G.fx = { seq: ++G.seq, pl: G.turn, t: 'deal' }; return true; }
      const P = G.players[G.turn], n = G.players.length;
      if (a.t === 'draw') {
        if (G.step !== 'draw') return false;
        let c;
        if (a.src === 'pile') { c = G.pile[G.pile.length - 1]; if (c === undefined || isS(c)) return false; G.pile.pop(); }
        else { reshuffle(G); c = G.deck.pop(); }
        if (c !== undefined) { P.hand.push(c); sortHand(P.hand); }
        G.step = 'play'; G.fx = { seq: ++G.seq, pl: G.turn, t: 'draw', src: a.src === 'pile' ? 'pile' : 'deck', c: a.src === 'pile' ? c : -1 };
        return true;
      }
      if (G.step !== 'play') return false;
      if (a.t === 'lay') {
        if (P.done || !Array.isArray(a.cards)) return false;
        const idx = a.cards; if (idx.length !== need(P.ph) || new Set(idx).size !== idx.length || !idx.every(i => int(i, 0, P.hand.length - 1))) return false;
        const gs = partition(PH[P.ph], idx.map(i => P.hand[i])); if (!gs) return false;
        idx.slice().sort((x, y) => y - x).forEach(i => P.hand.splice(i, 1));
        gs.forEach((g, k) => { g.o = G.turn; g.k = k; G.groups.push(g); });
        P.done = true; G.fx = { seq: ++G.seq, pl: G.turn, t: 'lay' };
        if (!P.hand.length) endRound(G);
        return true;
      }
      if (a.t === 'hit') {
        const i = a.i, g = G.groups[int(a.g, 0, 99) ? a.g : -1];
        if (!P.done || !g || !int(i, 0, P.hand.length - 1) || !fitsGroup(g, P.hand[i])) return false;
        const c = P.hand.splice(i, 1)[0]; addTo(g, c);
        G.fx = { seq: ++G.seq, pl: G.turn, t: 'hit', i, g: a.g, c };
        if (!P.hand.length) endRound(G);
        return true;
      }
      if (a.t === 'disc') {
        const i = a.i; if (!int(i, 0, P.hand.length - 1)) return false;
        const c = P.hand.splice(i, 1)[0]; G.pile.push(c);
        const fx = G.fx = { seq: ++G.seq, pl: G.turn, t: 'disc', i, c };
        if (isS(c)) { const v = (G.turn + 1) % n; G.players[v].skip = true; fx.vic = v; }
        if (!P.hand.length) { endRound(G); return true; }
        G.turns++; G.turn = (G.turn + 1) % n; G.step = 'draw';
        let g = 0; while (G.players[G.turn].skip && g++ < n) { G.players[G.turn].skip = false; G.turn = (G.turn + 1) % n; }
        if (G.turns > 4000) { let b = 0; G.players.forEach((p, k) => { if (p.ph > G.players[b].ph || (p.ph === G.players[b].ph && p.pts < G.players[b].pts)) b = k; }); G.winner = b; }
        return true;
      }
      return false;
    }
    // Wie nah ist eine Hand an der Phase? (grobe Schätzung für den Computer)
    function prog(cards, ph) {
      const reqs = PH[ph], nat = cards.filter(x => !isJ(x) && !isS(x)), w = cards.length - nat.length - cards.filter(isS).length;
      let s = 0; const cnt = {}, col = [0, 0, 0, 0]; nat.forEach(x => { cnt[V(x)] = (cnt[V(x)] || 0) + 1; col[C(x)]++; });
      const counts = Object.values(cnt).sort((a, b) => b - a); let si = 0;
      reqs.filter(r => r[0] === 'set').map(r => r[1]).sort((a, b) => b - a).forEach(k => { s += Math.min(k, counts[si++] || 0); });
      reqs.filter(r => r[0] === 'run').forEach(([, k]) => { let b = 0; for (let lo = 1; lo + k - 1 <= 12; lo++) { let d = 0; for (let v = lo; v < lo + k; v++) if (cnt[v]) d++; b = Math.max(b, d); } s += b; });
      reqs.filter(r => r[0] === 'col').forEach(([, k]) => { s += Math.min(k, Math.max(...col)); });
      return Math.min(need(ph), s + w);
    }
    function findLay(hand, ph) {
      const n = need(ph), m = hand.length; if (m < n) return null;
      let best = null, bw = 99; const pick = [];
      const rec = s => {
        if (bw === 0) return;
        if (pick.length === n) {
          const cs = pick.map(k => hand[k]), w = cs.filter(isJ).length;
          if (w < bw && partition(PH[ph], cs)) { bw = w; best = pick.slice(); } return;
        }
        for (let k = s; k <= m - (n - pick.length); k++) { if (isS(hand[k])) continue; pick.push(k); rec(k + 1); pick.pop(); }
      };
      rec(0); return best;
    }
    function botAct(G) {
      if (G.wait) return { t: 'next' };
      const P = G.players[G.turn], h = P.hand;
      if (G.step === 'draw') {
        const t = G.pile[G.pile.length - 1];
        const good = t !== undefined && !isS(t) && (isJ(t) || (P.done ? G.groups.some(g => fitsGroup(g, t)) : prog(h.concat(t), P.ph) > prog(h, P.ph)));
        return { t: 'draw', src: good ? 'pile' : 'deck' };
      }
      if (!P.done) { const l = findLay(h, P.ph); if (l) return { t: 'lay', cards: l }; }
      if (P.done) for (let i = 0; i < h.length; i++) for (let g = 0; g < G.groups.length; g++) if (fitsGroup(G.groups[g], h[i])) return { t: 'hit', i, g };
      const sk = h.findIndex(isS); if (sk >= 0) return { t: 'disc', i: sk };
      let bi = -1, bs = -1e9;
      h.forEach((x, i) => {
        if (isJ(x) && h.some(y => !isJ(y))) return;
        const s = (P.done ? 0 : prog(h.filter((_, k) => k !== i), P.ph) * 100) + pen(x) + V(x) * .1;
        if (s > bs) { bs = s; bi = i; }
      });
      return { t: 'disc', i: Math.max(0, bi) };
    }
    function mkView(G, me) {
      return {
        game: 'phase', n: G.players.length, me, turn: G.turn, winner: G.winner, step: G.step, wait: G.wait, last: G.last, round: G.round, len: G.len,
        deckN: G.deck.length, top: G.pile.length ? G.pile[G.pile.length - 1] : -1, groups: G.groups, fx: G.fx,
        players: G.players.map((p, i) => Object.assign(pub(p), { handN: p.hand.length, hand: i === me ? p.hand.slice() : null, ph: p.ph, done: p.done, pts: p.pts, skip: p.skip }))
      };
    }
    KR.games.phase = { newGame, apply, botAct, mkView, PH, need, fitsGroup, partition, pen };
  })();

  /* ===================== Französisches Blatt (Mau-Mau, Schwimmen, Kartendomino) ===================== */
  /* Karte = Farbe*16 + Rang. Farben 0–3 (♣ ♠ ♥ ♦), Ränge 2–10, 11 Bube, 12 Dame, 13 König, 14 Ass. */
  const FS = x => x >> 4, FR = x => x & 15;
  const fdeck = lo => { const d = []; for (let s = 0; s < 4; s++) for (let r = lo; r <= 14; r++) d.push(s * 16 + r); return d; };
  const fsort = h => h.sort((a, b) => (FS(a) - FS(b)) || (FR(a) - FR(b)));

  /* ===================== Mau-Mau: Farbe oder Wert bedienen; 7 = zwei ziehen, 8 = aussetzen, Bube = Wunschfarbe ===================== */
  (function () {
    const top = G => G.pile[G.pile.length - 1];
    const eff = G => G.wish >= 0 ? G.wish : FS(top(G));
    function fits(G, x) {
      if (G.pen > 0) return FR(x) === 7;
      if (FR(x) === 11) return FR(top(G)) !== 11;
      return FS(x) === eff(G) || (G.wish < 0 && FR(x) === FR(top(G)));
    }
    function take(G, P, k) {
      const got = [];
      while (k-- > 0) {
        if (!G.deck.length) { const t = G.pile.pop(); G.deck = shuffle(G.pile); G.pile = [t]; }
        if (!G.deck.length) break;
        const x = G.deck.pop(); P.hand.push(x); got.push(x);
      }
      fsort(P.hand); return got;
    }
    const step = (G, k) => { const n = G.players.length; G.turn = (G.turn + k) % n; G.turns++; };
    function newGame(pl) {
      const G = { game: 'mau', deck: shuffle(fdeck(7)), pile: [], wish: -1, pen: 0, turn: 0, winner: -1, turns: 0, seq: 0, fx: null, drawn: -1, players: [] };
      pl.forEach(p => G.players.push(Object.assign(base(p), { hand: [] })));
      G.players.forEach(P => take(G, P, 5));
      let x = G.deck.pop(), g = 0;
      while ([7, 8, 11].includes(FR(x)) && g++ < 100) { G.deck.unshift(x); x = G.deck.pop(); }
      G.pile.push(x); return G;
    }
    function endByCount(G) { let b = 0; G.players.forEach((p, i) => { if (p.hand.length < G.players[b].hand.length) b = i; }); G.winner = b; }
    function apply(G, a) {
      if (G.winner >= 0 || !a) return false;
      const P = G.players[G.turn];
      if (a.t === 'play') {
        const i = a.i; if (!int(i, 0, P.hand.length - 1) || (G.drawn >= 0 && i !== G.drawn)) return false;
        const x = P.hand[i]; if (!fits(G, x)) return false;
        P.hand.splice(i, 1); G.pile.push(x); G.drawn = -1; G.wish = -1;
        const r = FR(x), fx = G.fx = { seq: ++G.seq, pl: G.turn, t: 'play', i, c: x, one: P.hand.length === 1 };
        if (r === 11) G.wish = fx.col = int(a.col, 0, 3) ? a.col : FS(x);
        if (!P.hand.length) { G.winner = G.turn; return true; }
        if (r === 7) { G.pen += 2; fx.pen = G.pen; step(G, 1); }
        else if (r === 8) { fx.vic = (G.turn + 1) % G.players.length; step(G, 2); }
        else step(G, 1);
        if (G.turns > 3000) endByCount(G);
        return true;
      }
      if (a.t === 'draw') {
        if (G.drawn >= 0) return false;
        if (G.pen > 0) { const n = take(G, P, G.pen).length; G.pen = 0; G.fx = { seq: ++G.seq, pl: G.turn, t: 'draw', n }; step(G, 1); return true; }
        const got = take(G, P, 1), x = got.length ? got[0] : -1;
        G.fx = { seq: ++G.seq, pl: G.turn, t: 'draw', n: got.length };
        if (got.length && fits(G, x)) { G.drawn = P.hand.lastIndexOf(x); return true; }
        step(G, 1); if (G.turns > 3000) endByCount(G); return true;
      }
      if (a.t === 'pass') { if (G.drawn < 0) return false; G.drawn = -1; G.fx = { seq: ++G.seq, pl: G.turn, t: 'pass' }; step(G, 1); return true; }
      return false;
    }
    function bestSuit(hand, skip) { const c = [0, 0, 0, 0]; hand.forEach((x, i) => { if (i !== skip && FR(x) !== 11) c[FS(x)]++; }); let b = 0; c.forEach((k, s) => { if (k > c[b]) b = s; }); return b; }
    function botAct(G) {
      const P = G.players[G.turn], nextN = G.players[(G.turn + 1) % G.players.length].hand.length;
      if (G.drawn >= 0) return { t: 'play', i: G.drawn, col: bestSuit(P.hand, G.drawn) };
      let best = -1, bs = -1e9;
      P.hand.forEach((x, i) => {
        if (!fits(G, x)) return; const r = FR(x);
        const s = r === 11 ? (P.hand.length <= 2 ? 40 : -30) : r === 7 || r === 8 ? (nextN <= 2 ? 50 : 12) : 10 + r * .1 + (FS(x) === eff(G) ? 2 : 0);
        if (s > bs) { bs = s; best = i; }
      });
      return best >= 0 ? { t: 'play', i: best, col: bestSuit(P.hand, best) } : { t: 'draw' };
    }
    function mkView(G, me) {
      return {
        game: 'mau', n: G.players.length, me, turn: G.turn, winner: G.winner, top: top(G), wish: G.wish, pen: G.pen, deckN: G.deck.length,
        drawn: G.turn === me ? G.drawn : -1, fx: G.fx,
        players: G.players.map((p, i) => Object.assign(pub(p), { handN: p.hand.length, hand: i === me ? p.hand.slice() : null }))
      };
    }
    KR.games.mau = { newGame, apply, botAct, mkView, fits: (v, x) => fits({ pen: v.pen, wish: v.wish, pile: [v.top] }, x) };
  })();

  /* ===================== Schwimmen (31): drei Karten, höchste Summe einer Farbe; Leben verlieren ===================== */
  (function () {
    const val = x => FR(x) === 14 ? 11 : FR(x) >= 10 ? 10 : FR(x);
    function score(h) {
      if (h.length === 3 && FR(h[0]) === FR(h[1]) && FR(h[1]) === FR(h[2])) return 30.5;
      const s = [0, 0, 0, 0]; h.forEach(x => { s[FS(x)] += val(x); }); return Math.max(...s);
    }
    const alive = P => !P.out;
    function deal(G) {
      G.deck = shuffle(fdeck(7)); G.players.forEach(P => { P.hand = P.out ? [] : fsort(G.deck.splice(0, 3)); });
      G.mid = G.deck.splice(0, 3); G.knock = -1; G.passes = 0; G.wait = false;
      let t = G.start; while (G.players[t].out) t = (t + 1) % G.players.length; G.turn = t;
    }
    function newGame(pl) {
      const G = { game: 'swim', deck: [], mid: [], players: [], turn: 0, start: 0, knock: -1, passes: 0, round: 1, winner: -1, wait: false, last: null, seq: 0, fx: null, turns: 0 };
      pl.forEach(p => G.players.push(Object.assign(base(p), { hand: [], lives: 3, out: false })));
      deal(G); return G;
    }
    function endRound(G, why) {
      const sc = G.players.map(P => alive(P) ? score(P.hand) : -1), act = G.players.map((P, i) => i).filter(i => alive(G.players[i]));
      const has31 = act.filter(i => sc[i] === 31), low = Math.min(...act.map(i => sc[i]));
      const lose = has31.length ? act.filter(i => sc[i] !== 31) : act.filter(i => sc[i] === low);
      lose.forEach(i => { const P = G.players[i]; if (P.lives > 0) P.lives--; else P.out = true; });
      G.last = { round: G.round, why, sc, lose, hands: G.players.map(P => P.hand.slice()) };
      const left = G.players.map((P, i) => i).filter(i => alive(G.players[i]));
      if (left.length <= 1) { G.winner = left.length ? left[0] : act.reduce((b, i) => sc[i] > sc[b] ? i : b, act[0]); }
      else { G.wait = true; G.round++; G.start = (G.start + 1) % G.players.length; while (G.players[G.start].out) G.start = (G.start + 1) % G.players.length; }
      G.fx = { seq: ++G.seq, pl: G.turn, t: 'round' };
    }
    function next(G) {
      const n = G.players.length; let t = G.turn;
      do t = (t + 1) % n; while (!alive(G.players[t]));
      G.turn = t; G.turns++;
      if (G.knock === t) { endRound(G, 'knock'); return; }
      if (G.turns > 3000) endRound(G, 'knock');
    }
    function apply(G, a) {
      if (G.winner >= 0 || !a) return false;
      if (G.wait) { if (a.t !== 'next') return false; deal(G); G.fx = { seq: ++G.seq, pl: G.turn, t: 'deal' }; return true; }
      const P = G.players[G.turn], nAct = G.players.filter(alive).length;
      if (a.t === 'swap') {
        if (!int(a.i, 0, 2) || !int(a.j, 0, 2)) return false;
        const x = P.hand[a.i]; P.hand[a.i] = G.mid[a.j]; G.mid[a.j] = x; fsort(P.hand); G.passes = 0;
        G.fx = { seq: ++G.seq, pl: G.turn, t: 'swap', i: a.i, j: a.j, c: x };
      } else if (a.t === 'all') {
        const h = P.hand; P.hand = fsort(G.mid); G.mid = h; G.passes = 0;
        G.fx = { seq: ++G.seq, pl: G.turn, t: 'all' };
      } else if (a.t === 'pass') {
        G.passes++; G.fx = { seq: ++G.seq, pl: G.turn, t: 'pass' };
        if (G.passes >= nAct) { G.deck.unshift(...G.mid); G.mid = G.deck.splice(G.deck.length - 3, 3); G.passes = 0; G.fx.fresh = true; }
      } else if (a.t === 'knock') {
        if (G.knock >= 0) return false;
        G.knock = G.turn; G.fx = { seq: ++G.seq, pl: G.turn, t: 'knock' };
      } else return false;
      if (score(P.hand) === 31) { G.fx.s31 = true; endRound(G, '31'); return true; }
      next(G); return true;
    }
    function botAct(G) {
      if (G.wait) return { t: 'next' };
      const P = G.players[G.turn], cur = score(P.hand);
      let best = { t: 'all' }, bs = score(G.mid);
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { const h = P.hand.slice(); h[i] = G.mid[j]; const s = score(h); if (s > bs) { bs = s; best = { t: 'swap', i, j }; } }
      if (G.knock < 0 && cur >= 27 && bs <= cur + 2) return { t: 'knock' };
      if (bs > cur) return best;
      if (G.knock < 0 && cur >= 24 + R() * 4) return { t: 'knock' };
      return { t: 'pass' };
    }
    function mkView(G, me) {
      return {
        game: 'swim', n: G.players.length, me, turn: G.turn, winner: G.winner, wait: G.wait, last: G.last, round: G.round, mid: G.mid.slice(), knock: G.knock, fx: G.fx,
        players: G.players.map((p, i) => Object.assign(pub(p), { handN: p.hand.length, hand: i === me ? p.hand.slice() : null, lives: p.lives, out: p.out, score: i === me ? score(p.hand) : -1 }))
      };
    }
    KR.games.swim = { newGame, apply, botAct, mkView, score };
  })();

  /* ===================== Kartendomino: von den Siebenen aus Reihen je Farbe bilden ===================== */
  (function () {
    function canPlay(G, x) {
      if (!G.started) return x === 2 * 16 + 7;   // ♥7 eröffnet
      const r = G.rows[FS(x)], k = FR(x);
      if (!r) return k === 7;
      return k === r.lo - 1 || k === r.hi + 1;
    }
    function newGame(pl) {
      const G = { game: 'domino', rows: [null, null, null, null], started: false, players: [], turn: 0, winner: -1, seq: 0, fx: null, turns: 0 };
      pl.forEach(p => G.players.push(Object.assign(base(p), { hand: [] })));
      const d = shuffle(fdeck(2)), n = G.players.length;
      d.forEach((x, i) => G.players[i % n].hand.push(x));
      G.players.forEach((P, i) => { fsort(P.hand); if (P.hand.includes(2 * 16 + 7)) G.turn = i; });
      return G;
    }
    const playable = (G, P) => P.hand.some(x => canPlay(G, x));
    function apply(G, a) {
      if (G.winner >= 0 || !a) return false;
      const P = G.players[G.turn], n = G.players.length;
      if (a.t === 'play') {
        if (!int(a.i, 0, P.hand.length - 1)) return false;
        const x = P.hand[a.i]; if (!canPlay(G, x)) return false;
        P.hand.splice(a.i, 1); G.started = true;
        const s = FS(x), r = G.rows[s]; if (!r) G.rows[s] = { lo: 7, hi: 7 }; else if (FR(x) < r.lo) r.lo = FR(x); else r.hi = FR(x);
        G.fx = { seq: ++G.seq, pl: G.turn, t: 'play', i: a.i, c: x };
        if (!P.hand.length) { G.winner = G.turn; return true; }
      } else if (a.t === 'pass') {
        if (playable(G, P)) return false;
        G.fx = { seq: ++G.seq, pl: G.turn, t: 'pass' };
      } else return false;
      G.turn = (G.turn + 1) % n; G.turns++;
      return true;
    }
    function botAct(G) {
      const P = G.players[G.turn]; let best = -1, bs = -1e9;
      P.hand.forEach((x, i) => {
        if (!canPlay(G, x)) return;
        const s = FS(x), k = FR(x), mine = P.hand.filter(y => FS(y) === s && (k <= 7 ? FR(y) < k : FR(y) > k)).length;
        const sc = mine * 3 - (k === 7 ? 2 : 0) + R();
        if (sc > bs) { bs = sc; best = i; }
      });
      return best >= 0 ? { t: 'play', i: best } : { t: 'pass' };
    }
    function mkView(G, me) {
      return {
        game: 'domino', n: G.players.length, me, turn: G.turn, winner: G.winner, rows: G.rows, started: G.started, fx: G.fx,
        players: G.players.map((p, i) => Object.assign(pub(p), { handN: p.hand.length, hand: i === me ? p.hand.slice() : null }))
      };
    }
    KR.games.domino = { newGame, apply, botAct, mkView, can: (v, x) => canPlay(v, x) };
  })();
})(typeof window !== 'undefined' ? window : globalThis);
