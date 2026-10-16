/*! RicoPoly 3D – Regel-Engine (rein, ohne DOM/3D). Läuft im Browser (window.RicoRules) und in Node (require).
 * Jede Spielaktion geht durch apply(state, action) → { ok, state, events, err }. Der übergebene Zustand wird nie verändert;
 * bei einem Fehler bleibt alles beim Alten (atomar). Zufall (Würfel, Kartenmischen) kommt aus einem Zufallsgenerator mit
 * Startwert im Zustand, damit gespeicherte Partien exakt weiterlaufen und der Gastgeber einer Online-Partie die einzige Quelle ist. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.RicoRules = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var SCHEMA = 1;

  // ---------- Spielbrett (Struktur und Werte; Namen und Farben je Welt stehen in worlds.js) ----------
  function S(g, price, rent, hc) { return { t: 'prop', g: g, price: price, rent: rent, hc: hc }; }
  var BOARD = [
    { t: 'go' },
    S(0, 60, [2, 10, 30, 90, 160, 250], 50), { t: 'chest' }, S(0, 60, [4, 20, 60, 180, 320, 450], 50),
    { t: 'tax', tax: 200 }, { t: 'rail', g: 8, price: 200 },
    S(1, 100, [6, 30, 90, 270, 400, 550], 50), { t: 'chance' }, S(1, 100, [6, 30, 90, 270, 400, 550], 50), S(1, 120, [8, 40, 100, 300, 450, 600], 50),
    { t: 'jail' },
    S(2, 140, [10, 50, 150, 450, 625, 750], 100), { t: 'util', g: 9, price: 150 }, S(2, 140, [10, 50, 150, 450, 625, 750], 100), S(2, 160, [12, 60, 180, 500, 700, 900], 100),
    { t: 'rail', g: 8, price: 200 },
    S(3, 180, [14, 70, 200, 550, 750, 950], 100), { t: 'chest' }, S(3, 180, [14, 70, 200, 550, 750, 950], 100), S(3, 200, [16, 80, 220, 600, 800, 1000], 100),
    { t: 'park' },
    S(4, 220, [18, 90, 250, 700, 875, 1050], 150), { t: 'chance' }, S(4, 220, [18, 90, 250, 700, 875, 1050], 150), S(4, 240, [20, 100, 300, 750, 925, 1100], 150),
    { t: 'rail', g: 8, price: 200 },
    S(5, 260, [22, 110, 330, 800, 975, 1150], 150), S(5, 260, [22, 110, 330, 800, 975, 1150], 150), { t: 'util', g: 9, price: 150 }, S(5, 280, [24, 120, 360, 850, 1025, 1200], 150),
    { t: 'gojail' },
    S(6, 300, [26, 130, 390, 900, 1100, 1275], 200), S(6, 300, [26, 130, 390, 900, 1100, 1275], 200), { t: 'chest' }, S(6, 320, [28, 150, 450, 1000, 1200, 1400], 200),
    { t: 'rail', g: 8, price: 200 }, { t: 'chance' },
    S(7, 350, [35, 175, 500, 1100, 1300, 1500], 200), { t: 'tax', tax: 100 }, S(7, 400, [50, 200, 600, 1400, 1700, 2000], 200)
  ];
  var GROUPS = [];
  BOARD.forEach(function (b, i) { if (b.g != null) (GROUPS[b.g] = GROUPS[b.g] || []).push(i); });
  var JAIL = 10, RAILS = GROUPS[8], UTILS = GROUPS[9];
  var RAIL_RENT = [0, 25, 50, 100, 200];
  function ownable(i) { var t = BOARD[i] && BOARD[i].t; return t === 'prop' || t === 'rail' || t === 'util'; }

  // ---------- Karten (Wirkung; Texte je Welt in worlds.js) ----------
  // money: +/-v an die Bank · move: zu Feld · back/fwd: n Felder · rail/util: nächstes Feld dieser Art (doppelte Miete / 10× Würfel)
  // jail · goojf: Freikarte · repairs: je Haus h, je Hotel ho · payEach/collectEach: an/von jedem Mitspieler
  var CHANCE = [
    { t: 'move', to: 0 }, { t: 'move', to: 24 }, { t: 'move', to: 11 }, { t: 'rail' }, { t: 'rail' },
    { t: 'util' }, { t: 'money', v: 50 }, { t: 'goojf' }, { t: 'back', n: 3 }, { t: 'jail' },
    { t: 'repairs', h: 25, ho: 100 }, { t: 'money', v: -15 }, { t: 'move', to: 5 }, { t: 'move', to: 39 }, { t: 'payEach', v: 50 },
    { t: 'money', v: 150 }, { t: 'money', v: 100 }, { t: 'money', v: -40 }, { t: 'move', to: 19 }, { t: 'fwd', n: 4 }
  ];
  var CHEST = [
    { t: 'move', to: 0 }, { t: 'money', v: 200 }, { t: 'money', v: -50 }, { t: 'money', v: 50 }, { t: 'goojf' },
    { t: 'jail' }, { t: 'collectEach', v: 50 }, { t: 'money', v: 100 }, { t: 'money', v: 20 }, { t: 'collectEach', v: 10 },
    { t: 'money', v: 100 }, { t: 'money', v: -100 }, { t: 'money', v: -50 }, { t: 'money', v: 25 }, { t: 'repairs', h: 40, ho: 115 },
    { t: 'money', v: 10 }, { t: 'money', v: 100 }, { t: 'money', v: -30 }, { t: 'move', to: 1 }, { t: 'back', n: 2 }
  ];
  var DECKS = { chance: CHANCE, chest: CHEST };

  // ---------- Voreinstellungen ----------
  var PRESETS = {
    classic: { startMoney: 1500, passGo: 200, goDouble: false, auctions: true, parkingPot: false, maxRounds: 0, timeLimit: 0, turnTimer: 0, startProps: 0, houses: 32, hotels: 12, jailFine: 50, maxJailTurns: 3 },
    quick: { startMoney: 1500, passGo: 300, goDouble: false, auctions: true, parkingPot: false, maxRounds: 20, timeLimit: 0, turnTimer: 0, startProps: 2, houses: 32, hotels: 12, jailFine: 50, maxJailTurns: 2 }
  };
  var LIMITS = { startMoney: [300, 10000], passGo: [0, 1000], maxRounds: [0, 200], timeLimit: [0, 240], turnTimer: [0, 300], startProps: [0, 4], houses: [8, 88], hotels: [1, 33], jailFine: [0, 500], maxJailTurns: [1, 5] };

  function config(mode, over) {
    var base = PRESETS[mode === 'quick' ? 'quick' : 'classic'], c = {}, k;
    for (k in base) c[k] = base[k];
    if (over) for (k in over) if (k in base) {
      var v = over[k];
      if (typeof base[k] === 'boolean') c[k] = !!v;
      else { v = Math.round(+v); if (isFinite(v)) c[k] = Math.max(LIMITS[k][0], Math.min(LIMITS[k][1], v)); }
    }
    return c;
  }

  // ---------- Zufall (mulberry32, Zustand als Zahl im Spielstand) ----------
  function rnd(s) {
    var t = (s.rng = (s.rng + 0x6D2B79F5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  function die(s) { return 1 + Math.floor(rnd(s) * 6); }
  function shuffle(s, a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd(s) * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  function range(n) { var a = []; for (var i = 0; i < n; i++) a.push(i); return a; }

  // ---------- Neue Partie ----------
  // players: [{ name, char, human, bot: 'easy'|'medium'|'hard', look }]
  function newGame(opt) {
    opt = opt || {};
    var players = (opt.players || []).slice(0, 6);
    if (players.length < 2) throw new Error('Mindestens 2 Spieler');
    var seed = (opt.seed != null ? opt.seed : Math.floor(Math.random() * 4294967296)) >>> 0;
    var cfg = config(opt.mode, opt.cfg);
    var s = {
      v: SCHEMA, id: opt.id || ('m' + seed.toString(36) + Date.now().toString(36)), mode: opt.mode === 'quick' ? 'quick' : (opt.mode === 'custom' ? 'custom' : 'classic'),
      world: opt.world || 'metropolis', online: !!opt.online, cfg: cfg, rng: seed, created: opt.now || 0,
      players: players.map(function (p, i) {
        return { name: String(p.name || ('Spieler ' + (i + 1))).slice(0, 24), char: p.char || 'businessman', look: p.look || null, human: !!p.human, bot: p.human ? null : (p.bot || 'medium'),
          uid: p.uid || null, money: cfg.startMoney, pos: 0, jail: false, jailTurns: 0, cards: [], out: false, doubles: 0 };
      }),
      own: BOARD.map(function (b, i) { return ownable(i) ? { o: -1, h: 0, m: false } : null; }),
      bank: { houses: cfg.houses, hotels: cfg.hotels }, pot: 0,
      decks: { chance: { order: [], i: 0 }, chest: { order: [], i: 0 } },
      cur: 0, round: 1, turnId: 1, phase: 'roll', dice: [0, 0], rolled: false, extra: false,
      pending: null, auction: null, debts: [], cont: null, trades: [], tradeSeq: 1,
      seen: [], seq: 0, log: [], winner: -1, endReason: '', lastAction: null, stats: players.map(function () { return { rentPaid: 0, rentGot: 0, bought: 0, built: 0, trades: 0, auctionsWon: 0, maxMoney: cfg.startMoney, maxAuction: 0 }; })
    };
    s.decks.chance.order = shuffle(s, range(CHANCE.length));
    s.decks.chest.order = shuffle(s, range(CHEST.length));
    if (cfg.startProps) {   // Schnellspiel: zufällig verteilte Startgrundstücke (bezahlt von der Bank, kein Geldabzug)
      var free = shuffle(s, BOARD.map(function (b, i) { return i; }).filter(ownable));
      for (var r = 0; r < cfg.startProps; r++) s.players.forEach(function (p, pi) { var sq = free.pop(); if (sq != null) s.own[sq].o = pi; });
    }
    s.cur = s.first = opt.first != null ? opt.first % s.players.length : 0;
    return s;
  }

  // ---------- Hilfsfunktionen ----------
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function active(s) { return s.players.map(function (p, i) { return p.out ? -1 : i; }).filter(function (i) { return i >= 0; }); }
  function groupOwned(s, g, p) { return GROUPS[g].every(function (i) { return s.own[i].o === p; }); }
  function countOwned(s, g, p) { return GROUPS[g].filter(function (i) { return s.own[i].o === p; }).length; }
  function groupHasBuildings(s, g) { return g < 8 && GROUPS[g].some(function (i) { return s.own[i].h > 0; }); }
  function unmortgageCost(sq) { return Math.ceil(BOARD[sq].price / 2 * 1.1); }

  function rent(s, sq, diceSum, mod) {
    var b = BOARD[sq], o = s.own[sq];
    if (!o || o.o < 0 || o.m) return 0;
    if (b.t === 'prop') {
      if (o.h > 0) return b.rent[o.h];
      return groupOwned(s, b.g, o.o) ? b.rent[0] * 2 : b.rent[0];
    }
    if (b.t === 'rail') { var r = RAIL_RENT[countOwned(s, 8, o.o)]; return mod === 'rail2' ? r * 2 : r; }
    if (b.t === 'util') { var n = countOwned(s, 9, o.o); return diceSum * (mod === 'util10' || n === 2 ? 10 : 4); }
    return 0;
  }
  function buildingsOf(s, p) {
    var h = 0, ho = 0;
    s.own.forEach(function (o) { if (o && o.o === p) { if (o.h === 5) ho++; else h += o.h; } });
    return { houses: h, hotels: ho };
  }
  function worth(s, p) {
    var pl = s.players[p], w = pl.money;
    s.own.forEach(function (o, i) {
      if (!o || o.o !== p) return;
      w += o.m ? BOARD[i].price / 2 : BOARD[i].price;
      if (o.h) w += o.h * BOARD[i].hc;
    });
    return w;
  }
  // Was ein Spieler sofort flüssig machen kann (Gebäude halber Preis, Hypotheken)
  function liquidity(s, p) {
    var v = s.players[p].money;
    s.own.forEach(function (o, i) { if (o && o.o === p) { v += o.h * BOARD[i].hc / 2; if (!o.m) v += BOARD[i].price / 2; } });
    return v;
  }

  function ev(s, out, e) { e.n = ++s.seq; e.r = s.round; out.push(e); s.log.push(e); if (s.log.length > 250) s.log.splice(0, s.log.length - 250); }
  function track(s, p) { var st = s.stats[p]; if (st && s.players[p].money > st.maxMoney) st.maxMoney = s.players[p].money; }

  // ---------- Zahlungen über eine Schuldenschlange (Rest folgt erst, wenn alles bezahlt ist) ----------
  function charge(s, out, from, to, amount, why) { if (amount > 0) s.debts.push({ from: from, to: to, amount: amount, why: why || '' }); }
  function give(s, out, to, amount, why) {
    if (amount <= 0) return;
    s.players[to].money += amount; track(s, to);
    ev(s, out, { e: 'pay', from: -1, to: to, amt: amount, why: why || '' });
  }
  // Bezahlt Schulden der Reihe nach. true = alles erledigt, false = Spieler muss Geld beschaffen (Phase 'debt').
  function settle(s, out) {
    while (s.debts.length) {
      var d = s.debts[0], pl = s.players[d.from];
      if (pl.out) { s.debts.shift(); continue; }
      if (d.to >= 0 && s.players[d.to].out) d.to = -1;
      if (pl.money < d.amount) { s.phase = 'debt'; return false; }
      pl.money -= d.amount;
      if (d.to >= 0) { s.players[d.to].money += d.amount; track(s, d.to); if (d.why === 'rent') { s.stats[d.from].rentPaid += d.amount; s.stats[d.to].rentGot += d.amount; } }
      else if (s.cfg.parkingPot && (d.why === 'tax' || d.why === 'card' || d.why === 'jail')) s.pot += d.amount;
      ev(s, out, { e: 'pay', from: d.from, to: d.to, amt: d.amount, why: d.why });
      s.debts.shift();
    }
    return true;
  }
  // Schulden begleichen und dann mit cont weitermachen
  function pay(s, out, cont) {
    if (!s.cont) s.cont = cont;
    if (s.phase === 'debt' && s.debts.length && s.players[s.debts[0].from].money < s.debts[0].amount) return;
    if (settle(s, out)) { var c = s.cont; s.cont = null; resume(s, out, c); }
  }
  function resume(s, out, c) {
    c = c || { k: 'finish' };
    if (c.k === 'finish') finish(s, out);
    else if (c.k === 'jailMove') { var p = s.players[s.cur]; p.jail = false; p.jailTurns = 0; ev(s, out, { e: 'free', p: s.cur, how: 'fine' }); move(s, out, c.n); }
    else if (c.k === 'phase') { s.phase = c.phase; }
    else if (c.k === 'next') nextTurn(s, out);
  }
  function finish(s, out) {
    if (s.phase === 'over') return;
    if (s.players[s.cur].out) { nextTurn(s, out); return; }
    s.pending = null;
    s.phase = s.extra && !s.players[s.cur].jail ? 'roll' : 'end';
  }

  // ---------- Bewegung ----------
  function move(s, out, steps) {
    var p = s.players[s.cur], from = p.pos, to = (from + steps) % 40, path = [];
    for (var i = 1; i <= steps; i++) path.push((from + i) % 40);
    p.pos = to;
    ev(s, out, { e: 'move', p: s.cur, from: from, to: to, path: path });
    if (from + steps >= 40) passGo(s, out, to === 0);
    land(s, out, null);
  }
  function passGo(s, out, exact) {
    var amt = s.cfg.passGo * (exact && s.cfg.goDouble ? 2 : 1);
    give(s, out, s.cur, amt, 'go');
  }
  function moveTo(s, out, to, mod) {
    var p = s.players[s.cur], from = p.pos, steps = (to - from + 40) % 40, path = [];
    for (var i = 1; i <= steps; i++) path.push((from + i) % 40);
    p.pos = to;
    ev(s, out, { e: 'move', p: s.cur, from: from, to: to, path: path, card: true });
    if (steps > 0 && from + steps >= 40) passGo(s, out, to === 0);
    land(s, out, mod);
  }
  function moveBack(s, out, n) {
    var p = s.players[s.cur], from = p.pos, to = (from - n + 40) % 40, path = [];
    for (var i = 1; i <= n; i++) path.push((from - i + 40) % 40);
    p.pos = to;
    ev(s, out, { e: 'move', p: s.cur, from: from, to: to, path: path, back: true });
    land(s, out, null);
  }
  function toJail(s, out, p, why) {
    var pl = s.players[p];
    pl.pos = JAIL; pl.jail = true; pl.jailTurns = 0; pl.doubles = 0;
    if (p === s.cur) s.extra = false;
    ev(s, out, { e: 'jail', p: p, why: why });
  }

  function land(s, out, mod) {
    var p = s.cur, sq = s.players[p].pos, b = BOARD[sq];
    if (ownable(sq)) {
      var o = s.own[sq];
      if (o.o < 0) { s.pending = { sq: sq }; s.phase = 'buy'; ev(s, out, { e: 'offer', p: p, sq: sq }); return; }
      if (o.o === p || o.m || s.players[o.o].out) { pay(s, out, { k: 'finish' }); return; }
      var sum = s.dice[0] + s.dice[1];
      if (mod === 'util10') { var d1 = die(s), d2 = die(s); sum = d1 + d2; ev(s, out, { e: 'dice', d: [d1, d2], util: true }); }
      var r = rent(s, sq, sum, mod);
      ev(s, out, { e: 'rent', p: p, to: o.o, sq: sq, amt: r });
      charge(s, out, p, o.o, r, 'rent');
      pay(s, out, { k: 'finish' });
      return;
    }
    switch (b.t) {
      case 'tax': ev(s, out, { e: 'tax', p: p, sq: sq, amt: b.tax }); charge(s, out, p, -1, b.tax, 'tax'); pay(s, out, { k: 'finish' }); return;
      case 'chance': case 'chest': draw(s, out, b.t); return;
      case 'gojail': toJail(s, out, p, 'field'); finish(s, out); return;
      case 'park':
        if (s.cfg.parkingPot && s.pot > 0) { var pot = s.pot; s.pot = 0; give(s, out, p, pot, 'pot'); }
        finish(s, out); return;
      default: finish(s, out);
    }
  }

  function draw(s, out, deck) {
    var d = s.decks[deck];
    if (!d.order.length) { finish(s, out); return; }
    if (d.i >= d.order.length) { d.order = shuffle(s, d.order); d.i = 0; ev(s, out, { e: 'shuffle', deck: deck }); }
    var id = d.order[d.i], c = DECKS[deck][id], p = s.cur;
    ev(s, out, { e: 'card', p: p, deck: deck, id: id });
    if (c.t === 'goojf') { d.order.splice(d.i, 1); s.players[p].cards.push(deck); finish(s, out); return; }
    d.i++;
    applyCard(s, out, c);
  }
  function applyCard(s, out, c) {
    var p = s.cur, pl = s.players[p];
    switch (c.t) {
      case 'money':
        if (c.v > 0) { give(s, out, p, c.v, 'card'); finish(s, out); } else { charge(s, out, p, -1, -c.v, 'card'); pay(s, out, { k: 'finish' }); }
        return;
      case 'move': moveTo(s, out, c.to, null); return;
      case 'rail': moveTo(s, out, nearest(pl.pos, RAILS), 'rail2'); return;
      case 'util': moveTo(s, out, nearest(pl.pos, UTILS), 'util10'); return;
      case 'back': moveBack(s, out, c.n); return;
      case 'fwd': move(s, out, c.n); return;
      case 'jail': toJail(s, out, p, 'card'); finish(s, out); return;
      case 'repairs':
        var b = buildingsOf(s, p), amt = b.houses * c.h + b.hotels * c.ho;
        if (amt) charge(s, out, p, -1, amt, 'card');
        pay(s, out, { k: 'finish' }); return;
      case 'payEach':
        active(s).forEach(function (q) { if (q !== p) charge(s, out, p, q, c.v, 'card'); });
        pay(s, out, { k: 'finish' }); return;
      case 'collectEach':
        active(s).forEach(function (q) { if (q !== p) charge(s, out, q, p, c.v, 'card'); });
        pay(s, out, { k: 'finish' }); return;
    }
    finish(s, out);
  }
  function nearest(pos, list) { for (var i = 1; i <= 40; i++) { var q = (pos + i) % 40; if (list.indexOf(q) >= 0) return q; } return list[0]; }

  // ---------- Zugwechsel ----------
  function nextTurn(s, out) {
    s.pending = null; s.auction = null; s.extra = false; s.rolled = false; s.cont = null;
    var act = active(s);
    if (act.length <= 1) { gameOver(s, out, 'bankrupt'); return; }
    var n = s.players.length, i = s.cur, wrapped = false;
    do { i = (i + 1) % n; if (i === s.first) wrapped = true; } while (s.players[i].out);
    if (wrapped) {
      s.round++;
      if (s.cfg.maxRounds && s.round > s.cfg.maxRounds) { s.round = s.cfg.maxRounds; gameOver(s, out, 'rounds'); return; }
    }
    s.cur = i; s.turnId++; s.phase = 'roll'; s.players[i].doubles = 0;
    ev(s, out, { e: 'turn', p: i });
  }
  function gameOver(s, out, reason) {
    var act = active(s), best = -1, bw = -1;
    act.forEach(function (i) { var w = worth(s, i); if (w > bw) { bw = w; best = i; } });
    s.phase = 'over'; s.winner = best; s.endReason = reason; s.pending = null; s.auction = null; s.debts = []; s.cont = null; s.trades = [];
    ev(s, out, { e: 'win', p: best, reason: reason, worth: s.players.map(function (p, i) { return worth(s, i); }) });
  }

  // ---------- Insolvenz ----------
  function bankrupt(s, out, p) {
    var pl = s.players[p], head = s.debts.filter(function (d) { return d.from === p; })[0], cred = head ? head.to : -1, before = pl.money;
    if (cred >= 0 && s.players[cred].out) cred = -1;
    // Gebäude zum halben Preis an die Bank
    s.own.forEach(function (o, i) {
      if (!o || o.o !== p || !o.h) return;
      if (o.h === 5) { s.bank.hotels++; pl.money += BOARD[i].hc * 5 / 2; } else { s.bank.houses += o.h; pl.money += o.h * BOARD[i].hc / 2; }
      o.h = 0;
    });
    var props = [];
    s.own.forEach(function (o, i) { if (o && o.o === p) props.push(i); });
    if (cred >= 0) {
      var c = s.players[cred];
      c.money += pl.money; track(s, cred);
      props.forEach(function (i) {
        s.own[i].o = cred;
        if (s.own[i].m) s.debts.push({ from: cred, to: -1, amount: Math.ceil(BOARD[i].price / 2 * 0.1), why: 'interest' });
      });
      pl.cards.forEach(function (d) { c.cards.push(d); });
    } else {
      props.forEach(function (i) { s.own[i] = { o: -1, h: 0, m: false }; });
      pl.cards.forEach(function (d) { s.decks[d].order.push(DECKS[d].indexOf(DECKS[d].filter(function (x) { return x.t === 'goojf'; })[0])); });
    }
    ev(s, out, { e: 'bankrupt', p: p, to: cred, props: props, cash: pl.money, bsale: pl.money - before });
    pl.money = 0; pl.cards = []; pl.out = true; pl.jail = false;
    s.debts = s.debts.filter(function (d) { return d.from !== p; });
    s.debts.forEach(function (d) { if (d.to === p) d.to = -1; });
    s.trades = s.trades.filter(function (t) { return t.from !== p && t.to !== p; });
    if (active(s).length <= 1) { gameOver(s, out, 'bankrupt'); return; }
    if (s.auction) {   // Aufgabe während einer Versteigerung: die Versteigerung läuft ohne diesen Spieler weiter
      var a = s.auction, k = a.parts.indexOf(p);
      if (k >= 0) { a.parts.splice(k, 1); if (k < a.turn) a.turn--; }
      if (a.bidder === p) { a.bidder = -1; a.high = 0; }
      auctionCheck(s, out);
      return;
    }
    var c = s.cont || { k: 'finish' };
    s.cont = null;
    if (p === s.cur) { c = { k: 'next' }; s.extra = false; }
    s.phase = 'resolve';
    pay(s, out, c);
  }

  // ---------- Versteigerung ----------
  function startAuction(s, out, sq) {
    var parts = [], n = s.players.length;
    for (var k = 0; k < n; k++) { var q = (s.cur + k) % n; if (!s.players[q].out) parts.push(q); }
    s.auction = { sq: sq, parts: parts, turn: 0, high: 0, bidder: -1 };
    s.phase = 'auction'; s.pending = null;
    ev(s, out, { e: 'auction', sq: sq });
  }
  function auctionCheck(s, out) {
    var a = s.auction;
    if (!a) return;
    if (!a.parts.length || (a.parts.length === 1 && a.bidder === a.parts[0])) {
      if (a.bidder >= 0 && !s.players[a.bidder].out) {
        var w = s.players[a.bidder];
        w.money -= a.high; s.own[a.sq].o = a.bidder;
        s.stats[a.bidder].auctionsWon++; s.stats[a.bidder].bought++;
        if (a.high > s.stats[a.bidder].maxAuction) s.stats[a.bidder].maxAuction = a.high;
        ev(s, out, { e: 'sold', p: a.bidder, sq: a.sq, amt: a.high });
      } else ev(s, out, { e: 'unsold', sq: a.sq });
      s.auction = null;
      finish(s, out);
      return;
    }
    if (a.turn >= a.parts.length) a.turn = 0;
  }

  // ---------- Prüfungen ----------
  function canManage(s, p) {
    if (s.phase === 'over' || s.players[p].out) return false;
    if (s.phase === 'debt') return s.debts.length > 0 && s.debts[0].from === p;
    return p === s.cur && (s.phase === 'roll' || s.phase === 'end' || s.phase === 'buy');
  }
  function buildError(s, p, sq) {
    var b = BOARD[sq], o = s.own[sq];
    if (!b || b.t !== 'prop') return 'notStreet';
    if (o.o !== p) return 'notOwner';
    if (!groupOwned(s, b.g, p)) return 'needGroup';
    if (GROUPS[b.g].some(function (i) { return s.own[i].m; })) return 'groupMortgaged';
    if (o.h >= 5) return 'maxLevel';
    var min = Math.min.apply(null, GROUPS[b.g].map(function (i) { return s.own[i].h; }));
    if (o.h > min) return 'uneven';
    if (s.players[p].money < b.hc) return 'noMoney';
    if (o.h === 4 ? s.bank.hotels < 1 : s.bank.houses < 1) return 'noStock';
    return '';
  }
  function sellError(s, p, sq) {
    var b = BOARD[sq], o = s.own[sq];
    if (!b || b.t !== 'prop') return 'notStreet';
    if (o.o !== p) return 'notOwner';
    if (o.h < 1) return 'noBuilding';
    var max = Math.max.apply(null, GROUPS[b.g].map(function (i) { return s.own[i].h; }));
    if (o.h < max) return 'uneven';
    return '';
  }
  function mortgageError(s, p, sq) {
    if (!ownable(sq)) return 'notOwnable';
    var o = s.own[sq];
    if (o.o !== p) return 'notOwner';
    if (o.m) return 'mortgaged';
    if (groupHasBuildings(s, BOARD[sq].g)) return 'hasBuildings';
    return '';
  }
  function unmortgageError(s, p, sq) {
    if (!ownable(sq)) return 'notOwnable';
    var o = s.own[sq];
    if (o.o !== p) return 'notOwner';
    if (!o.m) return 'notMortgaged';
    if (s.players[p].money < unmortgageCost(sq)) return 'noMoney';
    return '';
  }
  function normSide(x) {
    x = x || {};
    var props = Array.isArray(x.props) ? x.props.map(Number).filter(function (v, i, a) { return ownable(v) && a.indexOf(v) === i; }) : [];
    return { money: Math.max(0, Math.floor(+x.money || 0)), props: props.sort(function (a, b) { return a - b; }), cards: Math.max(0, Math.floor(+x.cards || 0)) };
  }
  function sideError(s, p, side) {
    var pl = s.players[p];
    if (side.money > pl.money) return 'noMoney';
    if (side.cards > pl.cards.length) return 'noCard';
    for (var k = 0; k < side.props.length; k++) {
      var sq = side.props[k];
      if (s.own[sq].o !== p) return 'notOwner';
      if (groupHasBuildings(s, BOARD[sq].g)) return 'hasBuildings';
    }
    return '';
  }
  function tradeError(s, t) {
    if (t.from === t.to || !s.players[t.from] || !s.players[t.to]) return 'badPlayer';
    if (s.players[t.from].out || s.players[t.to].out) return 'badPlayer';
    if (!t.give.money && !t.give.props.length && !t.give.cards && !t.get.money && !t.get.props.length && !t.get.cards) return 'emptyTrade';
    return sideError(s, t.from, t.give) || sideError(s, t.to, t.get);
  }
  function transferSide(s, out, from, to, side) {
    if (side.money) { s.players[from].money -= side.money; s.players[to].money += side.money; track(s, to); }
    side.props.forEach(function (sq) {
      s.own[sq].o = to;
      if (s.own[sq].m) s.debts.push({ from: to, to: -1, amount: Math.ceil(BOARD[sq].price / 2 * 0.1), why: 'interest' });
    });
    for (var k = 0; k < side.cards; k++) s.players[to].cards.push(s.players[from].cards.pop());
  }

  // ---------- Aktionen ----------
  // action: { type, p (Spielerindex, -1 = System/Gastgeber), aid (eindeutige Aktions-ID, optional), tid (Zug-ID, optional), ... }
  var TURN_SCOPED = { roll: 1, buy: 1, decline: 1, endTurn: 1, payJail: 1, useCard: 1 };
  // opt.dice nur für Tests (feste Würfel); Netzwerkaktionen kommen nie mit opt an.
  function apply(state, action, opt) {
    if (!action || typeof action.type !== 'string') return fail(state, 'badAction');
    if (action.aid && state.seen.indexOf(String(action.aid)) >= 0) return { ok: true, dup: true, state: state, events: [] };
    if (TURN_SCOPED[action.type] && action.tid != null && action.tid !== state.turnId) return fail(state, 'staleTurn');
    var s = clone(state), out = [], p = action.p | 0, err;
    if (s.phase === 'over' && action.type !== 'noop') return fail(state, 'gameOver');
    if (p >= 0 && (!s.players[p] || s.players[p].out)) return fail(state, 'badPlayer');
    var isCur = p === s.cur;
    switch (action.type) {
      case 'roll': {
        if (!isCur || s.phase !== 'roll') return fail(state, 'notNow');
        var pl = s.players[p], d = opt && opt.dice ? opt.dice.slice(0, 2) : [die(s), die(s)];
        s.dice = d; s.rolled = true;
        var dbl = d[0] === d[1], sum = d[0] + d[1];
        ev(s, out, { e: 'dice', p: p, d: d });
        if (pl.jail) {
          if (dbl) { pl.jail = false; pl.jailTurns = 0; s.extra = false; ev(s, out, { e: 'free', p: p, how: 'double' }); move(s, out, sum); break; }
          pl.jailTurns++;
          if (pl.jailTurns >= s.cfg.maxJailTurns) {
            s.extra = false;
            charge(s, out, p, -1, s.cfg.jailFine, 'jail');
            s.phase = 'resolve'; pay(s, out, { k: 'jailMove', n: sum });
          } else { s.extra = false; s.phase = 'end'; ev(s, out, { e: 'stay', p: p, tries: pl.jailTurns }); }
          break;
        }
        if (dbl) {
          pl.doubles++;
          if (pl.doubles >= 3) { toJail(s, out, p, 'doubles'); s.phase = 'end'; break; }
          s.extra = true;
        } else s.extra = false;
        move(s, out, sum);
        break;
      }
      case 'payJail': {
        var pj = s.players[p];
        if (!isCur || s.phase !== 'roll' || !pj.jail) return fail(state, 'notNow');
        if (pj.money < s.cfg.jailFine) return fail(state, 'noMoney');
        pj.money -= s.cfg.jailFine; if (s.cfg.parkingPot) s.pot += s.cfg.jailFine;
        pj.jail = false; pj.jailTurns = 0;
        ev(s, out, { e: 'pay', from: p, to: -1, amt: s.cfg.jailFine, why: 'jail' });
        ev(s, out, { e: 'free', p: p, how: 'pay' });
        break;
      }
      case 'useCard': {
        var pu = s.players[p];
        if (!isCur || s.phase !== 'roll' || !pu.jail || !pu.cards.length) return fail(state, 'notNow');
        var deck = pu.cards.pop();
        s.decks[deck].order.push(DECKS[deck].indexOf(DECKS[deck].filter(function (x) { return x.t === 'goojf'; })[0]));
        pu.jail = false; pu.jailTurns = 0;
        ev(s, out, { e: 'free', p: p, how: 'card', deck: deck });
        break;
      }
      case 'buy': {
        if (!isCur || s.phase !== 'buy' || !s.pending) return fail(state, 'notNow');
        var sq = s.pending.sq, price = BOARD[sq].price;
        if (s.players[p].money < price) return fail(state, 'noMoney');
        s.players[p].money -= price; s.own[sq].o = p; s.stats[p].bought++;
        ev(s, out, { e: 'buy', p: p, sq: sq, amt: price });
        finish(s, out);
        break;
      }
      case 'decline': {
        if (!isCur || s.phase !== 'buy' || !s.pending) return fail(state, 'notNow');
        var dsq = s.pending.sq;
        ev(s, out, { e: 'decline', p: p, sq: dsq });
        if (s.cfg.auctions) startAuction(s, out, dsq); else finish(s, out);
        break;
      }
      case 'bid': case 'pass': {
        var a = s.auction;
        if (s.phase !== 'auction' || !a || a.parts[a.turn] !== p) return fail(state, 'notYourBid');
        if (action.type === 'bid') {
          var amt = Math.floor(+action.amount);
          if (!(amt > a.high) || amt < 1) return fail(state, 'bidTooLow');
          if (amt > s.players[p].money) return fail(state, 'noMoney');
          a.high = amt; a.bidder = p;
          ev(s, out, { e: 'bid', p: p, amt: amt });
          a.turn = (a.turn + 1) % a.parts.length;
          if (a.parts.length === 1) auctionCheck(s, out);
        } else {
          ev(s, out, { e: 'pass', p: p });
          a.parts.splice(a.turn, 1);
          if (a.turn >= a.parts.length) a.turn = 0;
          auctionCheck(s, out);
        }
        break;
      }
      case 'build': {
        if (!canManage(s, p) || s.phase === 'debt') return fail(state, 'notNow');
        err = buildError(s, p, action.sq); if (err) return fail(state, err);
        var bo = s.own[action.sq], bb = BOARD[action.sq];
        if (bo.h === 4) { s.bank.hotels--; s.bank.houses += 4; } else s.bank.houses--;
        bo.h++; s.players[p].money -= bb.hc; s.stats[p].built++;
        ev(s, out, { e: 'build', p: p, sq: action.sq, h: bo.h, amt: bb.hc });
        break;
      }
      case 'sell': {
        if (!canManage(s, p)) return fail(state, 'notNow');
        var so = s.own[action.sq], sb = BOARD[action.sq];
        if (so && so.h === 5 && so.o === p) {
          var back = Math.min(4, s.bank.houses);   // Hotel abbauen: so viele Häuser zurück, wie die Bank hat (Rest wird mitverkauft)
          s.bank.hotels++; s.bank.houses -= back;
          var lv = 5 - back; so.h = back;
          s.players[p].money += lv * sb.hc / 2;
          ev(s, out, { e: 'sell', p: p, sq: action.sq, h: so.h, amt: lv * sb.hc / 2 });
        } else {
          err = sellError(s, p, action.sq); if (err) return fail(state, err);
          so.h--; s.bank.houses++; s.players[p].money += sb.hc / 2;
          ev(s, out, { e: 'sell', p: p, sq: action.sq, h: so.h, amt: sb.hc / 2 });
        }
        if (s.phase === 'debt') pay(s, out, null);
        break;
      }
      case 'mortgage': {
        if (!canManage(s, p)) return fail(state, 'notNow');
        err = mortgageError(s, p, action.sq); if (err) return fail(state, err);
        s.own[action.sq].m = true; s.players[p].money += BOARD[action.sq].price / 2;
        ev(s, out, { e: 'mortgage', p: p, sq: action.sq, amt: BOARD[action.sq].price / 2 });
        if (s.phase === 'debt') pay(s, out, null);
        break;
      }
      case 'unmortgage': {
        if (!canManage(s, p) || s.phase === 'debt') return fail(state, 'notNow');
        err = unmortgageError(s, p, action.sq); if (err) return fail(state, err);
        var uc = unmortgageCost(action.sq);
        s.own[action.sq].m = false; s.players[p].money -= uc;
        ev(s, out, { e: 'unmortgage', p: p, sq: action.sq, amt: uc });
        break;
      }
      case 'payDebt': {
        if (s.phase !== 'debt' || !s.debts.length || s.debts[0].from !== p) return fail(state, 'notNow');
        if (s.players[p].money < s.debts[0].amount) return fail(state, 'noMoney');
        pay(s, out, null);
        break;
      }
      case 'bankrupt': {
        if (s.phase !== 'debt' || !s.debts.length || s.debts[0].from !== p) return fail(state, 'notNow');
        bankrupt(s, out, p);
        break;
      }
      case 'resign': {   // Partie verlassen: alles geht an die Bank
        if (p < 0) return fail(state, 'badPlayer');
        s.debts = s.debts.filter(function (d) { return d.from !== p; });
        s.debts.unshift({ from: p, to: -1, amount: 1e9, why: 'resign' });
        if (!s.cont && p !== s.cur && s.phase !== 'auction') s.cont = { k: 'phase', phase: s.phase };
        bankrupt(s, out, p);
        break;
      }
      case 'endTurn': {
        if (!isCur || s.phase !== 'end') return fail(state, 'notNow');
        nextTurn(s, out);
        break;
      }
      case 'propose': {
        if (s.phase === 'auction' || s.phase === 'resolve') return fail(state, 'notNow');
        var t = { id: s.tradeSeq, from: p, to: action.to | 0, give: normSide(action.give), get: normSide(action.get), turn: s.turnId };
        err = tradeError(s, t); if (err) return fail(state, err);
        if (s.trades.filter(function (x) { return x.from === p; }).length >= 3) return fail(state, 'tooManyOffers');
        s.tradeSeq++; s.trades.push(t);
        ev(s, out, { e: 'offer2', id: t.id, from: p, to: t.to });
        break;
      }
      case 'accept': case 'reject': case 'cancel': case 'counter': {
        var ti = -1;
        s.trades.forEach(function (x, k) { if (x.id === (action.id | 0)) ti = k; });
        if (ti < 0) return fail(state, 'noTrade');
        var tr = s.trades[ti];
        if (action.type === 'cancel' ? tr.from !== p : tr.to !== p) return fail(state, 'notYourTrade');
        if (action.type === 'accept') {
          if (s.phase === 'auction' || s.phase === 'resolve') return fail(state, 'notNow');
          err = tradeError(s, tr);
          if (err) { s.trades.splice(ti, 1); ev(s, out, { e: 'tradeVoid', id: tr.id }); return { ok: false, err: err, state: commit(s, action), events: out }; }
          s.trades.splice(ti, 1);
          transferSide(s, out, tr.from, tr.to, tr.give);
          transferSide(s, out, tr.to, tr.from, tr.get);
          s.stats[tr.from].trades++; s.stats[tr.to].trades++;
          ev(s, out, { e: 'trade', id: tr.id, from: tr.from, to: tr.to, give: tr.give, get: tr.get });
          // Gehandelte Grundstücke betreffen andere Angebote: ungültige werden entfernt
          s.trades = s.trades.filter(function (x) { var bad = tradeError(s, x); if (bad) ev(s, out, { e: 'tradeVoid', id: x.id }); return !bad; });
          if (s.debts.length) {
            if (s.phase === 'debt') pay(s, out, null);
            else { var keep = s.phase; s.phase = 'resolve'; pay(s, out, { k: 'phase', phase: keep }); }
          }
        } else {
          s.trades.splice(ti, 1);
          ev(s, out, { e: action.type === 'cancel' ? 'tradeCancel' : 'tradeReject', id: tr.id, from: tr.from, to: tr.to });
          if (action.type === 'counter') {
            var ct = { id: s.tradeSeq, from: p, to: tr.from, give: normSide(action.give), get: normSide(action.get), turn: s.turnId, counter: tr.id };
            err = tradeError(s, ct); if (err) return fail(state, err);
            s.tradeSeq++; s.trades.push(ct);
            ev(s, out, { e: 'offer2', id: ct.id, from: p, to: ct.to, counter: tr.id });
          }
        }
        break;
      }
      case 'timeUp': {   // Zeitlimit im Schnellspiel (vom Gastgeber/der Uhr ausgelöst)
        if (p !== -1 || !s.cfg.timeLimit) return fail(state, 'notAllowed');
        gameOver(s, out, 'time');
        break;
      }
      case 'noop': break;
      default: return fail(state, 'badAction');
    }
    return { ok: true, state: commit(s, action), events: out };
  }
  function commit(s, action) {
    if (action.aid) { s.seen.push(String(action.aid)); if (s.seen.length > 64) s.seen.splice(0, s.seen.length - 64); }
    s.lastAction = { type: action.type, p: action.p | 0, aid: action.aid || null, n: s.seq };
    return s;
  }
  function fail(state, err) { return { ok: false, err: err, state: state, events: [] }; }

  // Wer muss als Nächstes handeln? (für KI, Zugtimer und Online-Anzeige)
  function actor(s) {
    if (s.phase === 'over') return -1;
    if (s.phase === 'auction' && s.auction) return s.auction.parts[s.auction.turn];
    if (s.phase === 'debt' && s.debts.length) return s.debts[0].from;
    return s.cur;
  }
  // Mögliche Aktionen eines Spielers (für Oberfläche und Tests)
  function legal(s, p) {
    var r = [];
    if (s.phase === 'over' || !s.players[p] || s.players[p].out) return r;
    var pl = s.players[p];
    if (p === s.cur && s.phase === 'roll') { r.push('roll'); if (pl.jail && pl.money >= s.cfg.jailFine) r.push('payJail'); if (pl.jail && pl.cards.length) r.push('useCard'); }
    if (p === s.cur && s.phase === 'buy') { if (pl.money >= BOARD[s.pending.sq].price) r.push('buy'); r.push('decline'); }
    if (p === s.cur && s.phase === 'end') r.push('endTurn');
    if (s.phase === 'auction' && actor(s) === p) r.push('bid', 'pass');
    if (s.phase === 'debt' && actor(s) === p) { if (pl.money >= s.debts[0].amount) r.push('payDebt'); r.push('bankrupt'); }
    return r;
  }
  function validate(s) {   // Plausibilitätsprüfung eines geladenen Spielstands
    if (!s || s.v !== SCHEMA || !Array.isArray(s.players) || !Array.isArray(s.own) || s.own.length !== 40) return 'schema';
    var h = 0, ho = 0;
    for (var i = 0; i < 40; i++) {
      var o = s.own[i];
      if (ownable(i) !== !!o) return 'own';
      if (o) { if (o.o >= s.players.length || o.h < 0 || o.h > 5) return 'own'; if (o.h === 5) ho++; else h += o.h; }
    }
    if (h + s.bank.houses !== s.cfg.houses || ho + s.bank.hotels !== s.cfg.hotels) return 'buildings';
    if (s.players.some(function (p) { return !(p.money >= 0) || p.pos < 0 || p.pos > 39; })) return 'players';
    return '';
  }

  return {
    SCHEMA: SCHEMA, BOARD: BOARD, GROUPS: GROUPS, RAILS: RAILS, UTILS: UTILS, JAIL: JAIL, RAIL_RENT: RAIL_RENT, CHANCE: CHANCE, CHEST: CHEST, PRESETS: PRESETS, LIMITS: LIMITS,
    newGame: newGame, apply: apply, config: config, rent: rent, worth: worth, liquidity: liquidity, ownable: ownable, groupOwned: groupOwned, countOwned: countOwned,
    buildError: buildError, sellError: sellError, mortgageError: mortgageError, unmortgageError: unmortgageError, unmortgageCost: unmortgageCost, canManage: canManage,
    tradeError: function (s, t) { return tradeError(s, { from: t.from, to: t.to, give: normSide(t.give), get: normSide(t.get) }); },
    groupHasBuildings: groupHasBuildings, buildingsOf: buildingsOf, actor: actor, legal: legal, active: active, validate: validate, clone: clone
  };
});
