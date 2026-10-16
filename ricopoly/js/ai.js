/*! RicoPoly 3D – Computergegner. Wählt nur Aktionen, die auch ein Mensch hätte (gleiche Regeln, keine Geldboni,
 * keine Würfelmanipulation). next(state, p) liefert die nächste Aktion des Bots oder null. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./rules.js'));
  else root.RicoAI = factory(root.RicoRules);
})(typeof self !== 'undefined' ? self : this, function (R) {
  'use strict';
  var B = R.BOARD, G = R.GROUPS;
  var PROB = [0, 0, 1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1].map(function (x) { return x / 36; });   // Wahrscheinlichkeit der Augensumme 2..12
  var memo = {};   // Handelsversuche je Bot (nur Gedächtnis des Bots, ändert keine Regeln)

  function lvl(s, p) { return s.players[p].bot || 'medium'; }
  function others(s, p) { return R.active(s).filter(function (q) { return q !== p; }); }
  function ownedBy(s, p) { var r = []; s.own.forEach(function (o, i) { if (o && o.o === p) r.push(i); }); return r; }
  function freeCount(s) { return s.own.filter(function (o) { return o && o.o < 0; }).length; }

  // Wie viel ist ein Feld für Spieler p wert?
  function value(s, p, sq, assumeOwn) {
    var b = B[sq], v = b.price, g = b.g, lots = G[g], mine = 0, theirs = {}, free = 0;
    lots.forEach(function (i) { if (i === sq) return; var o = s.own[i].o; if (o === p) mine++; else if (o < 0) free++; else theirs[o] = (theirs[o] || 0) + 1; });
    if (b.t === 'prop') {
      if (mine === lots.length - 1) v *= 2.2;                     // vervollständigt eine Gruppe
      else if (mine > 0 && free + mine === lots.length - 1) v *= 1.35;
      for (var q in theirs) if (theirs[q] === lots.length - 1) v *= lvl(s, p) === 'hard' ? 1.7 : 1.3;   // blockiert einen Gegner
      if (g >= 3 && g <= 4) v *= 1.12;                            // häufig betretene Felder hinter dem Gefängnis
    } else if (b.t === 'rail') v *= 1 + mine * 0.3;
    else v *= mine ? 1.25 : 0.9;
    return v;
  }
  // Wie viel Bargeld sollte der Bot zurückhalten?
  function reserve(s, p) {
    var L = lvl(s, p);
    if (L === 'easy') return 60;
    var pos = s.players[p].pos, danger = 0, maxR = 0;
    for (var d = 2; d <= 12; d++) {
      var sq = (pos + d) % 40, o = s.own[sq];
      if (o && o.o >= 0 && o.o !== p) { var r = R.rent(s, sq, 7, null); danger += PROB[d] * r; if (r > maxR) maxR = r; }
    }
    if (L === 'medium') return Math.max(120, Math.min(400, maxR * 0.5));
    // Schwer: erwartete Kosten über die nächsten Runden + größte mögliche Einzelmiete auf dem Brett
    var worst = 0;
    s.own.forEach(function (o, i) { if (o && o.o >= 0 && o.o !== p && !o.m) worst = Math.max(worst, R.rent(s, i, 7, null)); });
    return Math.max(150, Math.min(700, danger * 3 + worst * 0.35));
  }

  // ---------- Schulden begleichen ----------
  function raise(s, p) {
    // Zuerst Gebäude verkaufen (billigste Wirkung zuerst), dann Hypotheken (Einzelstücke vor Gruppen)
    var best = null, bl = 1e9;
    ownedBy(s, p).forEach(function (sq) {
      if (s.own[sq].h > 0 && (s.own[sq].h === 5 || !R.sellError(s, p, sq))) { var loss = B[sq].rent[s.own[sq].h] - B[sq].rent[s.own[sq].h - 1]; if (loss < bl) { bl = loss; best = sq; } }
    });
    if (best != null) return { type: 'sell', p: p, sq: best };
    var cand = ownedBy(s, p).filter(function (sq) { return !R.mortgageError(s, p, sq); });
    cand.sort(function (a, b) { return (R.groupOwned(s, B[a].g, p) ? 1 : 0) - (R.groupOwned(s, B[b].g, p) ? 1 : 0) || B[a].price - B[b].price; });
    if (cand.length) return { type: 'mortgage', p: p, sq: cand[0] };
    return null;
  }

  // ---------- Bauen und Hypotheken lösen ----------
  function develop(s, p) {
    var L = lvl(s, p), pl = s.players[p], res = reserve(s, p);
    if (L === 'easy' && pl.money < 500) return null;
    // Hypotheken auf Gruppen lösen, damit gebaut werden kann
    var um = ownedBy(s, p).filter(function (sq) { return s.own[sq].m && !R.unmortgageError(s, p, sq); });
    um.sort(function (a, b) { return (R.groupOwned(s, B[b].g, p) ? 1 : 0) - (R.groupOwned(s, B[a].g, p) ? 1 : 0); });
    if (um.length && pl.money - R.unmortgageCost(um[0]) > res * (R.groupOwned(s, B[um[0]].g, p) ? 1 : 2)) return { type: 'unmortgage', p: p, sq: um[0] };
    var opts = ownedBy(s, p).filter(function (sq) { return !R.buildError(s, p, sq) && pl.money - B[sq].hc >= res; });
    if (!opts.length) return null;
    // Bevorzugt: bis 3 Häuser (bester Ertragssprung), Gruppen mit hoher Miete je Kosten
    opts.sort(function (a, b) {
      var ha = s.own[a].h, hb = s.own[b].h;
      var sa = (B[a].rent[ha + 1] - B[a].rent[ha]) / B[a].hc + (ha < 3 ? 2 : 0), sb = (B[b].rent[hb + 1] - B[b].rent[hb]) / B[b].hc + (hb < 3 ? 2 : 0);
      return sb - sa;
    });
    if (L === 'easy' && s.own[opts[0]].h >= 3) return null;
    return { type: 'build', p: p, sq: opts[0] };
  }

  // ---------- Handel ----------
  function groupWorth(g) { return G[g].reduce(function (a, i) { return a + B[i].price + B[i].rent[3] * 0.5; }, 0); }
  // Gewinn für p, wenn p "give" abgibt und "get" bekommt (Partner partner). Vollständige Gruppen zählen viel – für beide Seiten.
  function tradeValue(s, p, give, get, partner) {
    var t = R.clone(s), v = (get.money || 0) - (give.money || 0) + ((get.cards || 0) - (give.cards || 0)) * 40;
    (get.props || []).forEach(function (sq) { v += B[sq].price * (s.own[sq].m ? 0.45 : 1); });
    (give.props || []).forEach(function (sq) { v -= B[sq].price * (s.own[sq].m ? 0.5 : 1); });
    (give.props || []).forEach(function (sq) { t.own[sq].o = partner; });
    (get.props || []).forEach(function (sq) { t.own[sq].o = p; });
    // Eigene Gruppe: man kann darauf bauen (Wert über Kaufpreis); gegnerische Gruppe: Risiko hoher Mieten
    var L = lvl(s, p), mineF = L === 'hard' ? 1.6 : L === 'medium' ? 1.4 : 1.2, theirF = L === 'hard' ? 1.15 : L === 'medium' ? 1 : 0.8;
    for (var g = 0; g < 8; g++) {
      if (!R.groupOwned(s, g, p) && R.groupOwned(t, g, p)) v += groupWorth(g) * mineF;
      if (!R.groupOwned(s, g, partner) && R.groupOwned(t, g, partner)) v -= groupWorth(g) * theirF;
    }
    return v;
  }
  function threshold(s, p) { var L = lvl(s, p); return L === 'easy' ? -10 : L === 'medium' ? 10 : 30; }
  function respond(s, p, tr) {
    var v = tradeValue(s, p, tr.get, tr.give, tr.from);
    if (tr.get.money && s.players[p].money - tr.get.money < reserve(s, p) * 0.5) return { type: 'reject', p: p, id: tr.id };
    return { type: v > threshold(s, p) ? 'accept' : 'reject', p: p, id: tr.id };
  }
  function missingOne(s, p) {   // Gruppen, in denen p alle bis auf ein Grundstück hat, das einem Gegner gehört
    var r = [];
    for (var g = 0; g < 8; g++) {
      var miss = G[g].filter(function (i) { return s.own[i].o !== p; });
      if (miss.length !== 1 || R.groupHasBuildings(s, g)) continue;
      var q = s.own[miss[0]].o;
      if (q >= 0 && !s.players[q].out) r.push({ g: g, sq: miss[0], q: q });
    }
    return r;
  }
  function propose(s, p) {
    var L = lvl(s, p);
    if (s.trades.some(function (t) { return t.from === p; })) return null;
    var pl = s.players[p], key = p + ':' + s.turnId;
    if (memo[key]) return null;
    memo[key] = 1;
    var want = missingOne(s, p), best = null;
    want.forEach(function (w) {
      var cool = memo['c' + p + ':' + w.sq] || -1e9;
      if (s.turnId - cool < 4 * s.players.length) return;
      var q = w.q, give = { money: 0, props: [], cards: 0 }, get = { money: 0, props: [w.sq], cards: 0 };
      // Tausch, der auch dem Partner eine Gruppe vervollständigt (beide profitieren)
      var swap = missingOne(s, q).filter(function (x) { return s.own[x.sq].o === p && x.g !== w.g; })[0];
      if (swap) give.props.push(swap.sq);
      else if (L === 'easy') return;   // Leicht: nur einfache Tauschgeschäfte, bei denen beide eine Gruppe bekommen
      else {
        var spare = ownedBy(s, p).filter(function (i) { return i !== w.sq && B[i].t === 'prop' && B[i].g !== w.g && !R.groupOwned(s, B[i].g, p) && !R.groupHasBuildings(s, B[i].g); });
        spare = spare.filter(function (i) { var t = R.clone(s); t.own[i].o = q; return !R.groupOwned(t, B[i].g, q); });
        if (spare.length && !(L === 'hard' && s.players[q].money < 250)) { spare.sort(function (a, b) { return B[a].price - B[b].price; }); give.props.push(spare[0]); }
      }
      // Bargeld so ergänzen, dass der Partner (nach Bot-Maßstab) zustimmen würde, aber nicht mehr als nötig
      var theirs = tradeValue(s, q, get, give, p), need = Math.max(0, threshold(s, q) + 20 - theirs);
      var myGain = tradeValue(s, p, give, get, q) - need;
      need = Math.ceil(need / 10) * 10;
      if (need > pl.money - reserve(s, p) * 0.7 || myGain < 30) return;
      give.money = need;
      if (!give.money && !give.props.length) return;
      if (R.tradeError(s, { from: p, to: q, give: give, get: get })) return;
      if (!best || myGain > best.gain) best = { gain: myGain, sq: w.sq, act: { type: 'propose', p: p, to: q, give: give, get: get } };
    });
    if (!best) return null;
    memo['c' + p + ':' + best.sq] = s.turnId;
    return best.act;
  }
  function countOf(s, g, p) { return G[g].filter(function (i) { return s.own[i].o === p; }).length; }

  // ---------- Hauptentscheidung ----------
  function next(s, p) {
    if (s.phase === 'over' || s.players[p].out) return null;
    var L = lvl(s, p), pl = s.players[p];
    // Offene Angebote an den Bot beantworten (außer während Versteigerung)
    if (s.phase !== 'auction' && s.phase !== 'resolve') {
      var inc = s.trades.filter(function (t) { return t.to === p; })[0];
      if (inc) return respond(s, p, inc);
    }
    var who = R.actor(s);
    if (who !== p) return null;
    switch (s.phase) {
      case 'debt':
        if (pl.money >= s.debts[0].amount) return { type: 'payDebt', p: p };
        return raise(s, p) || { type: 'bankrupt', p: p };
      case 'auction': {
        var a = s.auction, sq = a.sq, cap = value(s, p, sq) * (L === 'easy' ? 0.7 : L === 'medium' ? 0.95 : 1.1);
        var budget = pl.money - (L === 'easy' ? 40 : reserve(s, p) * 0.5);
        var max = Math.floor(Math.min(cap, budget));
        if (L === 'hard') {   // Schwer: überbietet nur so weit, dass der Gegner nicht billig gewinnt
          others(s, p).forEach(function (q) { if (s.players[q].money < a.high + 20) max = Math.max(max, Math.min(budget, a.high + 1)); });
        }
        var step = a.high < 100 ? 10 : 20, bid = Math.min(max, a.high + step);
        if (bid > a.high) return { type: 'bid', p: p, amount: bid };
        return { type: 'pass', p: p };
      }
      case 'buy': {
        var bsq = s.pending.sq, price = B[bsq].price, v = value(s, p, bsq);
        var keep = L === 'easy' ? 80 : reserve(s, p) * (v > price * 1.5 ? 0.4 : 1);
        if (pl.money - price >= keep) return { type: 'buy', p: p };
        if (L !== 'easy' && v > price * 1.8 && pl.money < price) { var m = raise(s, p); if (m && m.type === 'mortgage' && R.liquidity(s, p) - price > keep) return m; }
        if (pl.money >= price && L === 'easy' && pl.money - price >= 0 && freeCount(s) > 18) return { type: 'buy', p: p };
        return { type: 'decline', p: p };
      }
      case 'roll': {
        var d = develop(s, p); if (d) return d;
        var t = propose(s, p); if (t) return t;
        if (pl.jail) {
          var late = freeCount(s) < 8 && others(s, p).some(function (q) { return ownedBy(s, q).some(function (i) { return s.own[i].h > 0; }); });
          if (L === 'hard' && late) return { type: 'roll', p: p };   // im Spätspiel sicher im Gefängnis warten
          if (pl.cards.length) return { type: 'useCard', p: p };
          if (pl.money - s.cfg.jailFine > reserve(s, p)) return { type: 'payJail', p: p };
        }
        return { type: 'roll', p: p };
      }
      case 'end': {
        var d2 = develop(s, p); if (d2) return d2;
        return { type: 'endTurn', p: p };
      }
    }
    return null;
  }

  return { next: next, value: value, reserve: reserve, respond: respond, propose: propose, raise: raise, develop: develop, _memo: memo };
});
