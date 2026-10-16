'use strict';
/* AnMaCha Casino – reine Spiellogik ohne Grafik (Slots, Roulette, Blackjack, Video-Poker, Glücksrad, Risiko).
   Nur Spielgeld. Läuft im Browser und in Node (tests/logic-tests.js). */
(function (G) {
  const L = {};

  // ---------- Zufall (kryptografisch, falls verfügbar; für Tests austauschbar) ----------
  let R = (() => {
    try {
      if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        const b = new Uint32Array(64); let i = 64;
        return () => { if (i >= 64) { crypto.getRandomValues(b); i = 0; } return b[i++] / 4294967296; };
      }
    } catch (e) { /* Fallback unten */ }
    return Math.random;
  })();
  const rand = () => R();
  const randInt = n => Math.floor(rand() * n);
  L.setRandom = f => { R = f; };
  L.rand = rand; L.randInt = randInt;
  L.seeded = seed => { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; };

  // ---------- Gewinnlinien ----------
  const L20 = [[1,1,1,1,1],[0,0,0,0,0],[2,2,2,2,2],[0,1,2,1,0],[2,1,0,1,2],[0,0,1,2,2],[2,2,1,0,0],[1,0,0,0,1],[1,2,2,2,1],[0,1,0,1,0],
               [2,1,2,1,2],[1,0,1,2,1],[1,2,1,0,1],[0,1,1,1,0],[2,1,1,1,2],[0,2,0,2,0],[2,0,2,0,2],[1,1,0,1,1],[1,1,2,1,1],[0,0,2,0,0]];
  const L25 = L20.concat([[2,2,0,2,2],[1,0,1,0,1],[1,2,1,2,1],[0,0,1,0,0],[2,2,1,2,2]]);
  // 4 Reihen: alle Muster mit Nachbar-Abstand <= 1, sortiert nach Anzahl Richtungswechsel (gerade Linien zuerst)
  const L40 = (() => {
    const all = [];
    const rec = a => { if (a.length === 5) { all.push(a.slice()); return; } for (let y = 0; y < 4; y++) if (!a.length || Math.abs(a[a.length - 1] - y) <= 1) { a.push(y); rec(a); a.pop(); } };
    rec([]);
    const ch = a => { let c = 0; for (let i = 1; i < 5; i++) if (a[i] !== a[i - 1]) c++; return c; };
    all.sort((a, b) => ch(a) - ch(b) || a.join('').localeCompare(b.join('')));
    return all.slice(0, 40);
  })();
  L.LINESETS = {
    l5x3: [[1,1,1],[0,0,0],[2,2,2],[0,1,2],[2,1,0]],
    l5: [[1,1,1,1,1],[0,0,0,0,0],[2,2,2,2,2],[0,1,2,1,0],[2,1,0,1,2]],
    l10: L20.slice(0, 10), l20: L20, l25: L25, l40: L40
  };

  // ---------- Slot-Maschine vorbereiten ----------
  L.compile = cfg => {
    const m = Object.assign({}, cfg);
    m.idx = {}; cfg.symbols.forEach((s, i) => { m.idx[s.id] = i; });
    const id = k => (k && k in m.idx ? m.idx[k] : -1);
    m.wild = id(cfg.wild); m.scat = cfg.scatter ? id(cfg.scatter.id) : -1; m.coin = cfg.holdwin ? id(cfg.holdwin.coin) : -1;
    m.bon = cfg.bonus ? id(cfg.bonus.id) : -1;
    m.ff = cfg.freeFeature || null;                            // Freispiel-Besonderheit: upgrade | sticky | multUp
    if (m.ff && m.ff.type === 'upgrade') m.upOrder = m.ff.order.map(id);
    m.book = !!cfg.book && m.wild >= 0 && m.wild === m.scat;
    m.lines = cfg.lines === 'ways' ? null : L.LINESETS[cfg.lines];
    m.nLines = m.lines ? m.lines.length : 0;
    m.unit = cfg.unit || m.nLines || 1;
    m.scale = cfg.scale || 1;
    m.tables = [];
    for (let r = 0; r < cfg.reels; r++) {
      const t = []; let tot = 0;
      cfg.symbols.forEach((s, i) => { const w = Array.isArray(s.w) ? s.w[r] : s.w; if (w > 0) { tot += w; t.push([tot, i]); } });
      m.tables.push({ t, tot });
    }
    m.paying = cfg.symbols.map((s, i) => (s.pay && i !== m.wild && i !== m.scat && i !== m.coin && i !== m.bon) ? i : -1).filter(i => i >= 0);
    return m;
  };
  const pickSym = (m, r) => { const T = m.tables[r]; const x = rand() * T.tot; for (const [c, i] of T.t) if (x < c) return i; return T.t[T.t.length - 1][1]; };
  const pickCoin = hw => { let tot = 0; for (const v of hw.values) tot += v[0]; let x = rand() * tot; for (const v of hw.values) { if ((x -= v[0]) < 0) return v; } return hw.values[0]; };
  L.coinValue = (hw, v) => (typeof v[1] === 'string' ? hw.jackpots[v[1]] : v[1]);

  // grid[reel][row]
  const randomGrid = m => { const g = []; for (let r = 0; r < m.reels; r++) { const c = []; for (let y = 0; y < m.rows; y++) c.push(pickSym(m, r)); g.push(c); } return g; };
  L.randomGrid = randomGrid;

  // Linien-Auswertung; u = Wert einer Einheit (Einsatz/unit*scale)
  function evalLines(m, g, u, mult) {
    const wins = [];
    m.lines.forEach((ln, li) => {
      const row = ln.map((y, r) => g[r][y]);
      let s = -1;
      for (const v of row) { if (v === m.wild) continue; s = v; break; }
      let best = null;
      if (s >= 0 && m.symbols[s].pay && m.paying.includes(s)) {
        let n = 0, wc = 0; for (const v of row) { if (v === s || v === m.wild) { n++; if (v === m.wild) wc++; } else break; }
        const p = m.symbols[s].pay[n];
        if (p) {
          let wm = 1; if (m.wildMult && wc) wm = m.wildMultEach ? Math.pow(m.wildMult, wc) : m.wildMult;
          best = { line: li, sym: s, n, amt: p * u * mult * wm, wm };
        }
      }
      if (m.wild >= 0 && m.symbols[m.wild].pay && !m.book) {           // reine Wild-Linie
        let n = 0; for (const v of row) { if (v === m.wild) n++; else break; }
        const p = m.symbols[m.wild].pay[n];
        if (p && (!best || p * u * mult > best.amt)) best = { line: li, sym: m.wild, n, amt: p * u * mult, wm: 1 };
      }
      if (best) { best.amt = Math.round(best.amt); if (best.amt > 0) { best.cells = ln.slice(0, best.n).map((y, r) => [r, y]); wins.push(best); } }
    });
    return wins;
  }
  // 243 Wege: jedes Symbol zählt, wenn es auf aufeinanderfolgenden Walzen ab links liegt (Wild ersetzt)
  function evalWays(m, g, u, mult) {
    const wins = [];
    for (const s of m.paying) {
      let ways = 1, n = 0; const cells = [];
      for (let r = 0; r < m.reels; r++) {
        let c = 0; g[r].forEach((v, y) => { if (v === s || v === m.wild) { c++; cells.push([r, y]); } });
        if (!c) break; ways *= c; n++;
      }
      const p = m.symbols[s].pay[n];
      if (p) {
        const amt = Math.round(p * u * mult * ways);
        if (amt > 0) wins.push({ line: -1, sym: s, n, ways, amt, cells: cells.filter(c => c[0] < n) });
      }
    }
    return wins;
  }

  function evaluate(m, g, bet, mult, special) {
    const u = bet / m.unit * m.scale;
    const wins = m.lines ? evalLines(m, g, u, mult) : evalWays(m, g, u, mult);
    let sc = 0; const scCells = [];
    if (m.scat >= 0) g.forEach((col, r) => col.forEach((v, y) => { if (v === m.scat) { sc++; scCells.push([r, y]); } }));
    let scAmt = 0, free = 0;
    if (m.scat >= 0) {
      const S = m.scatter, n = Math.min(sc, Math.max(...Object.keys(S.pay || { 0: 0 }).map(Number)));
      if (S.pay && S.pay[n]) scAmt = Math.round(S.pay[n] * bet * m.scale * mult);
      if (S.free) { const fk = Math.min(sc, Math.max(...Object.keys(S.free).map(Number))); free = S.free[fk] || 0; }
    }
    let expand = null;
    if (special != null && special >= 0) {                     // Buch-Freispiele: Sondersymbol dehnt sich aus und zahlt auf allen Linien
      const reels = []; g.forEach((col, r) => { if (col.includes(special)) reels.push(r); });
      const p = m.symbols[special].pay[reels.length];
      if (p) expand = { sym: special, reels, n: reels.length, amt: Math.round(p * u * mult * m.nLines) };
    }
    let total = scAmt + (expand ? expand.amt : 0); for (const w of wins) total += w.amt;
    return { wins, scat: { n: sc, cells: scCells, amt: scAmt }, free, expand, win: total };
  }
  L.evaluate = evaluate;

  // fx (nur Freispiele): up = Upgrade-Stufe, sticky = Set klebender Wild-Felder 'r,y'
  function spinStep(m, bet, mode, mult, special, held, fx) {
    const g = randomGrid(m);
    if (held) held.forEach(r => { g[r] = held.grid[r].slice(); });
    let upMap = null, stuck = null;
    if (fx && fx.up > 0) {                                     // niedrige Symbole werden zur aktuellen Stufe aufgewertet
      const to = m.upOrder[fx.up]; upMap = {}; for (let i = 0; i < fx.up; i++) upMap[m.upOrder[i]] = to;
      g.forEach(col => col.forEach((v, y) => { if (v in upMap) col[y] = upMap[v]; }));
    }
    if (fx && fx.sticky) {
      stuck = [...fx.sticky].map(k => k.split(',').map(Number));
      stuck.forEach(([r, y]) => { g[r][y] = m.wild; });
    }
    let vals = null;
    if (m.coin >= 0) { vals = g.map(col => col.map(v => (v === m.coin ? pickCoin(m.holdwin) : null))); }
    let expandReels = null;
    if (m.respin && !held) {                                  // Wild auf der Respin-Walze füllt die ganze Walze
      const wr = m.respin.reel;
      if (g[wr].includes(m.wild)) { g[wr] = g[wr].map(() => m.wild); expandReels = [wr]; }
    }
    const ev = evaluate(m, g, bet, mult, special);
    const coins = vals ? vals.reduce((a, c) => a + c.filter(Boolean).length, 0) : 0;
    let bonusN = 0; if (m.bon >= 0) g.forEach(col => col.forEach(v => { if (v === m.bon) bonusN++; }));
    return Object.assign({ type: held ? 'respin' : 'spin', mode, grid: g, vals, expandReels, held: held ? held.slice() : null, mult, coins, bonusN, stuck }, ev);
  }

  function holdWin(m, bet, base) {
    const hw = m.holdwin, cells = m.reels * m.rows;
    const lock = base.vals.map(col => col.map(v => v));
    let count = base.coins, respins = hw.respins || 3; const rounds = [];
    while (respins > 0 && count < cells) {
      const fresh = [];
      for (let r = 0; r < m.reels; r++) for (let y = 0; y < m.rows; y++) {
        if (!lock[r][y] && rand() < hw.p) { const v = pickCoin(hw); lock[r][y] = v; fresh.push([r, y, v]); count++; }
      }
      respins = fresh.length ? (hw.respins || 3) : respins - 1;
      rounds.push({ fresh, respins });
    }
    let win = 0; lock.forEach(col => col.forEach(v => { if (v) win += L.coinValue(hw, v) * bet; }));
    const full = count >= cells; if (full) win += hw.jackpots.GRAND * bet;
    return { type: 'holdwin', start: base.vals, final: lock, rounds, full, win: Math.round(win) };
  }

  const wpick = list => { let tot = 0; for (const v of list) tot += v[0]; let x = rand() * tot; for (const v of list) { if ((x -= v[0]) < 0) return v; } return list[list.length - 1]; };

  // Bonusspiel „Schatzwahl“: n Felder aufdecken, jedes zeigt einen Gewinn (× Einsatz)
  function pickBonus(m, bet, n) {
    const B = m.bonus, picks = Math.min(B.items || 12, B.picks[Math.min(n, Math.max(...Object.keys(B.picks).map(Number)))] || 3);
    const vals = []; for (let i = 0; i < picks; i++) vals.push(wpick(B.prizes)[1]);
    const rest = []; for (let i = picks; i < (B.items || 12); i++) rest.push(wpick(B.prizes)[1]);
    const win = Math.round(vals.reduce((a, v) => a + v, 0) * bet * m.scale);
    return { type: 'pick', items: B.items || 12, vals, rest, win, unit: bet * m.scale };
  }
  // Bonusrad: ein Feld zeigt × Einsatz oder Freispiele
  function wheelBonus(m, bet) {
    const segs = m.bonus.segs, i = randInt(segs.length), s = segs[i];
    return { type: 'wheel', segs, idx: i, free: s.free || 0, win: s.x ? Math.round(s.x * bet * m.scale) : 0, unit: bet * m.scale };
  }

  // Eine komplette Runde (Grunddreh + Features). Die Grafik spielt die Schritte nacheinander ab.
  L.playRound = (m, bet) => {
    const steps = []; let total = 0;
    const base = spinStep(m, bet, 'base', 1, null, null); steps.push(base); total += base.win;
    if (m.respin && base.expandReels) {
      const held = base.expandReels.slice(); held.grid = base.grid;
      const rs = spinStep(m, bet, 'base', 1, null, held); steps.push(rs); total += rs.win;
    }
    if (m.holdwin && base.coins >= m.holdwin.trigger) { const h = holdWin(m, bet, base); steps.push(h); total += h.win; }
    let fs = base.free;
    if (m.bonus && base.bonusN >= (m.bonus.trigger || 3)) {
      const b = m.bonus.type === 'wheel' ? wheelBonus(m, bet) : pickBonus(m, bet, base.bonusN);
      steps.push(b); total += b.win; if (b.free) fs += b.free;
    }
    if (fs > 0) {
      const special = m.book ? m.paying[randInt(m.paying.length)] : null, ff = m.ff;
      steps.push({ type: 'freeStart', count: fs, special, ff: ff ? ff.type : null });
      let played = 0, fwin = 0, mult = m.freeMult || 1; const max = m.maxFree || 100;
      const fx = { up: 0, sticky: ff && ff.type === 'sticky' ? new Set() : null };
      while (fs > 0 && played < max) {
        fs--; played++;
        const s = spinStep(m, bet, 'free', mult, special, null, fx);
        if (s.free) fs = Math.min(fs + (m.scatter.retrigger || s.free), max - played);
        if (ff) {
          const wc = []; s.grid.forEach((col, r) => col.forEach((v, y) => { if (v === m.wild) wc.push([r, y]); }));
          if (ff.type === 'upgrade' && wc.length && fx.up < m.upOrder.length - 1) {
            fx.up++; s.upgrade = { level: fx.up, from: m.upOrder.slice(0, fx.up), to: m.upOrder[fx.up] };
            if (ff.extra) { const add = Math.min(ff.extra, max - played - fs); fs += add; s.extra = add; }
          }
          if (ff.type === 'sticky') { const fresh = wc.filter(([r, y]) => !fx.sticky.has(r + ',' + y)); fresh.forEach(([r, y]) => fx.sticky.add(r + ',' + y)); s.newSticky = fresh; }
          if (ff.type === 'multUp' && s.win > 0 && mult < ff.max) { mult = Math.min(ff.max, mult + (ff.step || 1)); s.nextMult = mult; }
        }
        s.freeLeft = fs; s.freeNo = played; steps.push(s); total += s.win; fwin += s.win;
      }
      steps.push({ type: 'freeEnd', played, win: fwin });
    }
    return { bet, steps, total };
  };

  // ---------- Karten ----------
  // Karte 0..51: Rang = c % 13 (0 = Ass … 12 = König), Farbe = c / 13 (0 ♠, 1 ♥, 2 ♦, 3 ♣)
  L.RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'B', 'D', 'K'];
  L.SUITS = ['♠', '♥', '♦', '♣'];
  L.rank = c => c % 13; L.suit = c => Math.floor(c / 13); L.isRed = c => L.suit(c) === 1 || L.suit(c) === 2;
  L.shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = randInt(i + 1); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  L.Shoe = decks => {
    const s = { cards: [], decks, fill() { s.cards = []; for (let d = 0; d < decks; d++) for (let c = 0; c < 52; c++) s.cards.push(c); L.shuffle(s.cards); s.cut = Math.floor(s.cards.length * 0.25); },
      draw() { if (!s.cards.length) s.fill(); return s.cards.pop(); }, low() { return s.cards.length < s.cut; } };
    s.fill(); return s;
  };

  // ---------- Blackjack (6 Decks, Bank steht auf Soft 17, Blackjack 3:2, Verdoppeln auf 2 Karten, einmal Teilen) ----------
  L.bjValue = cards => {
    let t = 0, aces = 0;
    for (const c of cards) { const r = L.rank(c); if (r === 0) { aces++; t += 11; } else t += r >= 9 ? 10 : r + 1; }
    while (t > 21 && aces) { t -= 10; aces--; }
    return { total: t, soft: aces > 0 };
  };
  L.bjIsBlackjack = (cards, split) => !split && cards.length === 2 && L.bjValue(cards).total === 21;
  L.bjDealerShouldHit = cards => L.bjValue(cards).total < 17;
  L.bjCanSplit = (hand, hands) => hands.length === 1 && hand.cards.length === 2 && Math.min(10, L.rank(hand.cards[0]) + 1) === Math.min(10, L.rank(hand.cards[1]) + 1);
  // Rückzahlung (inkl. Einsatz) für eine Spielerhand
  L.bjSettle = (hand, dealer) => {
    const p = L.bjValue(hand.cards).total, d = L.bjValue(dealer).total;
    const pBJ = L.bjIsBlackjack(hand.cards, hand.split), dBJ = L.bjIsBlackjack(dealer, false);
    if (p > 21) return { ret: 0, res: 'lose' };
    if (pBJ && !dBJ) return { ret: hand.bet * 2.5, res: 'bj' };
    if (dBJ && !pBJ) return { ret: 0, res: 'lose' };
    if (pBJ && dBJ) return { ret: hand.bet, res: 'push' };
    if (d > 21 || p > d) return { ret: hand.bet * 2, res: 'win' };
    if (p === d) return { ret: hand.bet, res: 'push' };
    return { ret: 0, res: 'lose' };
  };

  // ---------- Video-Poker „Jacks or Better“ (9/6) ----------
  L.POKER = [
    ['royal', 'Royal Flush', 800], ['sflush', 'Straight Flush', 50], ['quads', 'Vierling', 25], ['full', 'Full House', 9],
    ['flush', 'Flush', 6], ['straight', 'Straße', 4], ['trips', 'Drilling', 3], ['two', 'Zwei Paare', 2], ['jacks', 'Bubenpaar oder besser', 1]
  ];
  L.pokerEval = cards => {
    const rs = cards.map(L.rank).sort((a, b) => a - b), ss = cards.map(L.suit);
    const flush = ss.every(s => s === ss[0]);
    const cnt = {}; rs.forEach(r => { cnt[r] = (cnt[r] || 0) + 1; });
    const groups = Object.values(cnt).sort((a, b) => b - a);
    const uniq = Object.keys(cnt).length === 5;
    const royalSet = uniq && rs[0] === 0 && rs[1] === 9 && rs[4] === 12;             // A,10,B,D,K
    const straight = uniq && (rs[4] - rs[0] === 4 || royalSet);
    let id = null;
    if (straight && flush) id = royalSet ? 'royal' : 'sflush';
    else if (groups[0] === 4) id = 'quads';
    else if (groups[0] === 3 && groups[1] === 2) id = 'full';
    else if (flush) id = 'flush';
    else if (straight) id = 'straight';
    else if (groups[0] === 3) id = 'trips';
    else if (groups[0] === 2 && groups[1] === 2) id = 'two';
    else if (groups[0] === 2) { const pr = +Object.keys(cnt).find(k => cnt[k] === 2); if (pr === 0 || pr >= 10) id = 'jacks'; }
    const row = L.POKER.find(p => p[0] === id);
    return row ? { id, name: row[1], mult: row[2] } : { id: null, name: 'Kein Gewinn', mult: 0 };
  };

  // ---------- Roulette (europäisch, eine Null) ----------
  L.WHEEL = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
  L.RED = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
  L.rouletteColor = n => (n === 0 ? 'green' : L.RED.has(n) ? 'red' : 'black');
  L.rouletteSpin = () => randInt(37);
  // Gewinnt der Einsatz bei Zahl n? Liefert den Auszahlungsfaktor (inkl. Einsatz) oder 0
  L.rouletteBetPays = (key, n) => {
    if (key[0] === 'n') return +key.slice(1) === n ? 36 : 0;
    if (n === 0) return 0;
    switch (key) {
      case 'red': return L.RED.has(n) ? 2 : 0;
      case 'black': return L.RED.has(n) ? 0 : 2;
      case 'even': return n % 2 === 0 ? 2 : 0;
      case 'odd': return n % 2 ? 2 : 0;
      case 'low': return n <= 18 ? 2 : 0;
      case 'high': return n >= 19 ? 2 : 0;
      case 'd1': return n <= 12 ? 3 : 0;
      case 'd2': return n >= 13 && n <= 24 ? 3 : 0;
      case 'd3': return n >= 25 ? 3 : 0;
      case 'c1': return n % 3 === 1 ? 3 : 0;
      case 'c2': return n % 3 === 2 ? 3 : 0;
      case 'c3': return n % 3 === 0 ? 3 : 0;
    }
    return 0;
  };
  L.roulettePayout = (bets, n) => { let t = 0; for (const k in bets) t += bets[k] * L.rouletteBetPays(k, n); return t; };

  // ---------- Glücksrad (54 Felder) ----------
  L.WHEEL_VALUES = [['1', 1, 24], ['2', 2, 15], ['5', 5, 7], ['10', 10, 4], ['20', 20, 2], ['star', 40, 1], ['logo', 40, 1]];
  L.WHEEL_SEGS = (() => {
    const segs = new Array(54).fill(null);
    const place = (key, count, off) => {
      for (let k = 0; k < count; k++) {
        let p = Math.round(off + k * 54 / count) % 54, d = 0;
        while (segs[(p + d) % 54] !== null) d = d > 0 ? -d : -d + 1;
        segs[((p + d) % 54 + 54) % 54] = key;
      }
    };
    place('star', 1, 0); place('logo', 1, 27); place('20', 2, 13); place('10', 4, 6); place('5', 7, 3); place('2', 15, 1);
    for (let i = 0; i < 54; i++) if (segs[i] === null) segs[i] = '1';
    return segs;
  })();
  L.wheelSpin = () => randInt(54);
  L.wheelPayout = (bets, key) => { const v = L.WHEEL_VALUES.find(w => w[0] === key); return v && bets[key] ? bets[key] * (v[1] + 1) : 0; };

  // ---------- Risiko (Rot/Schwarz, fair 50 %) ----------
  L.gambleCard = () => randInt(52);

  G.CasinoLogic = L;
  if (typeof module !== 'undefined' && module.exports) module.exports = L;
})(typeof globalThis !== 'undefined' ? globalThis : this);
