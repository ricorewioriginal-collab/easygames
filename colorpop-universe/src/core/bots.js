/* ColorPop Universe – echte Offline-KI und Löser. Alle Züge laufen über die echte Engine (Game.move), es gibt keine erfundenen Punkte.
 *  easy   – wählt eine zufällige legale Gruppe (mit festem Startwert, also nachspielbar), meidet aber 2er-Gruppen, wenn es größere gibt
 *  medium – ein Zug voraus: Punkte + halbes Gruppenpotenzial danach − Einzelsteine
 *  hard   – Strahlsuche (Breite 6, 1 Zug voraus je Ebene) mit Bewertung aus Punkten, Gruppenpotenzial und Einzelsteinen
 * Dieselbe Strahlsuche erzeugt und belegt die Kampagnenlevel (tools/gen-levels.js). */
(function (root) {
  'use strict';
  var CPU = root.CPU || (root.CPU = {});
  var B = CPU.board, C = CPU.cell;

  // Einzelsteine (kein gleichfarbiger Nachbar) und Gruppenpotenzial (Summe der Gruppenpunkte, wenn man sie jetzt nähme)
  function shape(game) {
    var b = game.board, w = b.w, cells = b.cells, iso = 0, counts = [0, 0, 0, 0, 0, 0, 0, 0];
    for (var i = 0; i < cells.length; i++) {
      var v = cells[i]; if (!C.selectable(v)) continue;
      var c = C.color(v), x = i % w; counts[c]++;
      if ((x > 0 && C.joinable(cells[i - 1], c)) || (x < w - 1 && C.joinable(cells[i + 1], c)) || (i >= w && C.joinable(cells[i - w], c)) || (i + w < cells.length && C.joinable(cells[i + w], c))) continue;
      iso++;
    }
    var lonely = 0; for (var k = 0; k < 8; k++) if (counts[k] === 1) lonely++;
    return { iso: iso, lonely: lonely };
  }
  function potential(game) {
    var gs = game.legal(), p = 0;
    for (var i = 0; i < gs.length; i++) p += CPU.points(gs[i].size);
    return p;
  }
  // Bewertung je Zielart (für Löser/Generator); w = Gewichte
  function evaluator(kind) {
    return function (g) {
      var sh = shape(g), rem = g.remaining(), val = g.score;
      if (kind === 'clear') val = g.score * 0.05 - rem * 25 - sh.iso * 40 - sh.lonely * 300 + (g.cleared ? 1e6 : 0);
      else if (kind === 'score') val = g.score + potential(g) * 0.35 - sh.iso * 8;
      else {   // Ziel-orientiert: Fortschritt zählt stark, Punkte als Gleichstandsbrecher
        var pr = g.progress(), f = 0;
        for (var j = 0; j < pr.length; j++) f += pr[j].target ? Math.min(1, pr[j].cur / pr[j].target) : 1;
        val = f * 5000 + g.score * 0.5 + potential(g) * 0.2 - sh.iso * 10 - rem * 3;
      }
      return val;
    };
  }
  function boardHash(b) { var h = 2166136261; for (var i = 0; i < b.cells.length; i++) { h ^= b.cells[i]; h = Math.imul(h, 16777619); } return h >>> 0; }

  // Strahlsuche: liefert {game (Endzustand), path (Feldnummern), score}
  // opt: { width, evaluate(game), final(game) – Wert des Endzustands, maxDepth, budget (max. Züge insgesamt) }
  function beam(game, opt) {
    opt = opt || {};
    var width = opt.width || 8, ev = opt.evaluate || evaluator('score'), fin = opt.final || function (g) { return g.score; };
    var frontier = [{ g: game.clone(), path: [] }], best = null, bestV = -Infinity, depth = 0, maxDepth = opt.maxDepth || 400, budget = opt.budget || 2e6, used = 0;
    while (frontier.length && depth++ < maxDepth && used < budget) {
      var cand = [], seen = {};
      for (var f = 0; f < frontier.length; f++) {
        var node = frontier[f], gs = node.g.legal();
        if (!gs.length || node.g.status().over) {
          var fv = fin(node.g); if (fv > bestV) { bestV = fv; best = node; }
          continue;
        }
        for (var k = 0; k < gs.length; k++) {
          var g2 = node.g.clone(); if (!g2.move(gs[k].i)) continue; used++;
          var hk = boardHash(g2.board) + ':' + g2.score;
          if (seen[hk]) continue; seen[hk] = 1;
          cand.push({ g: g2, path: node.path.concat(gs[k].i), v: ev(g2) });
        }
      }
      cand.sort(function (a, b2) { return b2.v - a.v; });
      frontier = cand.slice(0, width);
    }
    frontier.forEach(function (node) { var fv = fin(node.g); if (fv > bestV) { bestV = fv; best = node; } });
    return best ? { game: best.g, path: best.path, score: best.g.score, value: bestV } : null;
  }

  // ---------- Spielstärken ----------
  function chooseEasy(game, rnd) {
    var gs = game.legal(); if (!gs.length) return -1;
    var big = gs.filter(function (g) { return g.size > 2; });
    var pool = big.length && rnd() < 0.7 ? big : gs;
    return pool[Math.floor(rnd() * pool.length)].i;
  }
  function chooseMedium(game) {
    var gs = game.legal(); if (!gs.length) return -1;
    var best = -1, bv = -Infinity;
    for (var k = 0; k < gs.length; k++) {
      var g2 = game.clone(); g2.move(gs[k].i);
      var v = g2.score + potential(g2) * 0.5 - shape(g2).iso * 6;
      if (v > bv) { bv = v; best = gs[k].i; }
    }
    return best;
  }
  function chooseHard(game) {
    var r = beam(game, { width: 6, evaluate: evaluator('score'), maxDepth: 3, budget: 4000 });
    if (r && r.path.length) return r.path[0];
    return chooseMedium(game);
  }
  // Ganze Runde spielen (für KI-Duell, Tests): {moves:[…], score, game}
  function play(game, level, seed) {
    var g = game.clone(), rnd = CPU.rng((seed >>> 0) ^ 0xb07), moves = [], guard = 0;
    while (!g.status().over && guard++ < 2000) {
      var i = level === 'easy' ? chooseEasy(g, rnd) : level === 'medium' ? chooseMedium(g) : chooseHard(g);
      if (i < 0 || !g.move(i)) break;
      moves.push(i);
    }
    g.finish();
    return { moves: moves, score: g.score, game: g };
  }
  // Hinweis: guter nächster Zug (mittlere Stärke, schnell)
  function hint(game) { return chooseMedium(game); }

  CPU.bots = { shape: shape, potential: potential, evaluator: evaluator, beam: beam, chooseEasy: chooseEasy, chooseMedium: chooseMedium, chooseHard: chooseHard, play: play, hint: hint, boardHash: boardHash };
  if (typeof module !== 'undefined' && module.exports) module.exports = CPU;
})(typeof window !== 'undefined' ? window : globalThis);
