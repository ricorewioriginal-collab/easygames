/* ColorPop Universe – Level-Schema, Prüfung und Aufbau einer Spielrunde aus einer Leveldefinition. */
(function (root) {
  'use strict';
  var CPU = root.CPU || (root.CPU = {});
  var GOALS = ['clear', 'leave', 'score', 'color', 'items', 'ice', 'blocks', 'marks', 'groups'];
  CPU.GOAL_TYPES = GOALS;

  // Prüft eine Leveldefinition; gibt eine Liste von Fehlern zurück (leer = gültig)
  function check(d) {
    var e = [];
    function req(c, m) { if (!c) e.push('Level ' + (d && d.id) + ': ' + m); }
    req(d && typeof d === 'object', 'kein Objekt'); if (!d || typeof d !== 'object') return e;
    req(Number.isInteger(d.id) && d.id >= 1, 'id fehlt');
    req(Number.isInteger(d.world) && d.world >= 1 && d.world <= 12, 'world 1–12');
    req(typeof d.title === 'string' && d.title.length > 1, 'title fehlt');
    if (d.grid) { req(Array.isArray(d.grid) && d.grid.length >= 2 && d.grid.every(function (r) { return r.length === d.grid[0].length; }), 'grid ungleichmäßig'); }
    else {
      req(Number.isInteger(d.w) && d.w >= 3 && d.w <= 20, 'w 3–20');
      req(Number.isInteger(d.h) && d.h >= 3 && d.h <= 20, 'h 3–20');
      req(Number.isInteger(d.seed) && d.seed >= 0, 'seed fehlt');
      req(d.gen === CPU.GEN_VERSION, 'Generator-Version passt nicht (' + d.gen + ' statt ' + CPU.GEN_VERSION + ')');
    }
    req(Number.isInteger(d.colors) && d.colors >= 2 && d.colors <= 7, 'colors 2–7');
    req(Array.isArray(d.goals) && d.goals.length >= 1 && d.goals.length <= 3, '1–3 Ziele');
    (d.goals || []).forEach(function (g) {
      req(GOALS.indexOf(g.t) >= 0, 'unbekanntes Ziel ' + g.t);
      if (g.t === 'score' || g.t === 'items' || g.t === 'color' || g.t === 'groups') req(Number.isInteger(g.n) && g.n > 0, 'Ziel ' + g.t + ' ohne n');
      if (g.t === 'leave') req(Number.isInteger(g.n) && g.n >= 0, 'leave ohne n');
      if (g.t === 'color') req(Number.isInteger(g.c) && g.c >= 0 && g.c < d.colors, 'Zielfarbe ungültig');
      if (g.t === 'groups') req(Number.isInteger(g.size) && g.size >= 3, 'Gruppengröße ≥ 3');
    });
    req(d.moves == null || (Number.isInteger(d.moves) && d.moves > 0), 'moves');
    req(Array.isArray(d.stars) && d.stars.length === 2 && d.stars[0] <= d.stars[1], 'stars [s2, s3]');
    return e;
  }
  // Spielrunde für ein Kampagnenlevel. Kampagne: kein Rückgängig, Booster erlaubt, Spezialbonus +5 je Zusatzstein.
  function game(d, extra) {
    var board = CPU.gen.boardFor(d);
    return new CPU.Game(Object.assign({
      board: board, colors: d.colors, seed: d.seed || d.id * 7919,
      rules: { minGroup: 2, gravity: d.gravity || 0, collapse: true, conveyors: d.conveyors || null, specialBonus: 5 },
      goals: d.goals, moves: d.moves || 0, moveBonus: !!d.moveBonus, stars: d.stars, allowUndo: false, boosters: true
    }, extra || {}));
  }
  // Welche Mechaniken ein Level enthält (für Tutorials, Weltkarte)
  function mechanics(d) {
    var b = CPU.gen.boardFor(d), m = {}, C = CPU.cell, K = CPU.K;
    for (var i = 0; i < b.cells.length; i++) { var v = b.cells[i]; if (!v) continue; var k = C.kind(v); if (k !== K.NORMAL) m[CPU.KIND_NAMES[k]] = 1; if (C.ice(v)) m.ice = 1; }
    if (b.marks) m.marks = 1;
    if (d.conveyors && d.conveyors.length) m.conveyor = 1;
    if (d.gravity) m.gravity = 1;
    return Object.keys(m);
  }
  CPU.levels = { check: check, game: game, mechanics: mechanics };
  if (typeof module !== 'undefined' && module.exports) module.exports = CPU;
})(typeof window !== 'undefined' ? window : globalThis);
