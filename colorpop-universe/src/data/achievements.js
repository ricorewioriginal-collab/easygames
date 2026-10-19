/* ColorPop Universe – 53 Erfolge mit echten Bedingungen (geprüft gegen den gespeicherten Spielstand p). */
(function (root) {
  'use strict';
  var CPU = root.CPU || (root.CPU = {});
  function st(p, k) { return (p.stats && p.stats[k]) || 0; }
  function rec(p, k) { return (p.records && p.records[k]) || 0; }
  function won(p) { var n = 0; for (var k in p.levels) if (p.levels[k] && p.levels[k].stars > 0) n++; return n; }
  function stars(p) { var n = 0; for (var k in p.levels) n += (p.levels[k] && p.levels[k].stars) || 0; return n; }
  function worldDone(p, w) { for (var i = (w - 1) * 25 + 1; i <= w * 25; i++) if (!p.levels[i] || !p.levels[i].stars) return false; return true; }
  function worldStars(p, w) { var n = 0; for (var i = (w - 1) * 25 + 1; i <= w * 25; i++) n += (p.levels[i] && p.levels[i].stars) || 0; return n; }
  function puzzles(p, min) { var n = 0, P = p.puzzles || {}; for (var k in P) if (P[k] && P[k].stars >= min) n++; return n; }
  CPU.profileStars = stars; CPU.profileWon = won;

  var A = [
    ['first', 'spark', 'Erster Knall', 'Entferne deine erste Gruppe.', function (p) { return st(p, 'groups') >= 1; }],
    ['g100', 'spark', 'Knallfrosch', 'Entferne 100 Gruppen.', function (p) { return st(p, 'groups') >= 100; }],
    ['g1000', 'spark', 'Dauerknaller', 'Entferne 1.000 Gruppen.', function (p) { return st(p, 'groups') >= 1000; }],
    ['r1k', 'cube', 'Steinbrecher', 'Entferne 1.000 Steine.', function (p) { return st(p, 'removed') >= 1000; }],
    ['r10k', 'cube', 'Abrissprofi', 'Entferne 10.000 Steine.', function (p) { return st(p, 'removed') >= 10000; }],
    ['r50k', 'cube', 'Universumsfeger', 'Entferne 50.000 Steine.', function (p) { return st(p, 'removed') >= 50000; }],
    ['big8', 'burst', 'Achterpack', 'Entferne eine Gruppe mit mindestens 8 Steinen.', function (p) { return st(p, 'maxGroup') >= 8; }],
    ['big12', 'burst', 'Dutzendknall', 'Entferne eine Gruppe mit mindestens 12 Steinen.', function (p) { return st(p, 'maxGroup') >= 12; }],
    ['big20', 'burst', 'Riesengruppe', 'Entferne eine Gruppe mit mindestens 20 Steinen.', function (p) { return st(p, 'maxGroup') >= 20; }],
    ['big30', 'burst', 'Mega-Pop', 'Entferne eine Gruppe mit mindestens 30 Steinen.', function (p) { return st(p, 'maxGroup') >= 30; }],
    ['clear1', 'broom', 'Blitzblank', 'Räume ein Brett komplett leer.', function (p) { return st(p, 'clears') >= 1; }],
    ['clear10', 'broom', 'Saubermacher', 'Räume 10 Bretter komplett leer.', function (p) { return st(p, 'clears') >= 10; }],
    ['clear50', 'broom', 'Glanzleistung', 'Räume 50 Bretter komplett leer.', function (p) { return st(p, 'clears') >= 50; }],
    ['lv1', 'flag', 'Erster Schritt', 'Schaffe Level 1.', function (p) { return !!(p.levels[1] && p.levels[1].stars); }]
  ];
  for (var w = 1; w <= 12; w++) (function (w) {
    A.push(['w' + w, 'planet', (CPU.WORLDS ? CPU.WORLDS[w - 1].name : 'Welt ' + w) + ' geschafft', 'Schaffe alle 25 Level von Welt ' + w + '.', function (p) { return worldDone(p, w); }]);
  })(w);
  A = A.concat([
    ['lv100', 'flag', 'Hundert Level', 'Schaffe 100 verschiedene Level.', function (p) { return won(p) >= 100; }],
    ['lv300', 'crown', 'Universum gerettet', 'Schaffe alle 300 Level.', function (p) { return won(p) >= 300; }],
    ['s100', 'star', 'Sternenregen', 'Sammle 100 Sterne.', function (p) { return stars(p) >= 100; }],
    ['s450', 'star', 'Sternenstaub', 'Sammle 450 Sterne.', function (p) { return stars(p) >= 450; }],
    ['s900', 'crown', 'Perfektes Universum', 'Hole in allen 300 Leveln 3 Sterne.', function (p) { return stars(p) >= 900; }],
    ['wstars', 'star', 'Sternenwelt', 'Hole alle 75 Sterne einer Welt.', function (p) { for (var k = 1; k <= 12; k++) if (worldStars(p, k) >= 75) return true; return false; }],
    ['pure1', 'leaf', 'Pur gespielt', 'Schaffe ein Level ohne Booster.', function (p) { return st(p, 'pureWins') >= 1; }],
    ['pure50', 'leaf', 'Puristin & Purist', 'Schaffe 50 Level ohne Booster.', function (p) { return st(p, 'pureWins') >= 50; }],
    ['boost1', 'hammer', 'Werkzeugkiste', 'Setze einen Booster ein.', function (p) { return st(p, 'boosters') >= 1; }],
    ['daily1', 'sun', 'Tagesform', 'Spiele einen Daily Pop.', function (p) { return st(p, 'daily') >= 1; }],
    ['daily7', 'sun', 'Wochenserie', 'Spiele 7 Tage hintereinander Daily Pop.', function (p) { return (p.dailyStreak || 0) >= 7; }],
    ['week7', 'calendar', 'Ligameisterin & Ligameister', 'Löse alle 7 Aufgaben einer Wochenliga.', function (p) { return st(p, 'weekFull') >= 1; }],
    ['tower10', 'tower', 'Turmkletterer', 'Erreiche im Endlos-Turm Stockwerk 10.', function (p) { return rec(p, 'tower') >= 10; }],
    ['tower25', 'tower', 'Wolkenkratzer', 'Erreiche im Endlos-Turm Stockwerk 25.', function (p) { return rec(p, 'tower') >= 25; }],
    ['duel1', 'robot', 'Erster Sieg', 'Besiege den Bot im KI-Duell.', function (p) { return st(p, 'duelWins') >= 1; }],
    ['duelhard', 'robot', 'Bot-Bezwinger', 'Besiege den schweren Bot.', function (p) { return st(p, 'duelHard') >= 1; }],
    ['local1', 'users', 'Zu zweit', 'Spiele eine Runde Lokal zu zweit.', function (p) { return st(p, 'local') >= 1; }],
    ['puz10', 'puzzle', 'Rätselfuchs', 'Löse 10 Rätsel im Puzzle-Labor.', function (p) { return puzzles(p, 1) >= 10; }],
    ['puz30', 'puzzle', 'Labor-Genie', 'Hole in allen 30 Rätseln 3 Sterne.', function (p) { return puzzles(p, 3) >= 30; }],
    ['sprint3k', 'bolt', 'Sprintstar', 'Erreiche 3.000 Punkte in Sprint 60.', function (p) { return rec(p, 'sprint') >= 3000; }],
    ['classic5k', 'gem', 'Klassik-Profi', 'Erreiche 5.000 Punkte im Klassiker.', function (p) { return rec(p, 'classicMax') >= 5000; }],
    ['items50', 'shell', 'Schatzsucher', 'Bringe 50 Sammelobjekte nach unten.', function (p) { return st(p, 'items') >= 50; }],
    ['ice200', 'snow', 'Eisbrecher', 'Brich 200 Eis- oder Harzschichten.', function (p) { return st(p, 'ice') >= 200; }],
    ['zen10', 'leaf', 'Innere Ruhe', 'Spiele 10 Bretter im Zen-Modus.', function (p) { return st(p, 'zenBoards') >= 10; }],
    ['chaos', 'swirl', 'Chaosbändiger', 'Erreiche 3.000 Punkte im Farbchaos.', function (p) { return rec(p, 'chaos') >= 3000; }],
    ['grav', 'arrows', 'Schwerelos', 'Erreiche 2.000 Punkte in Gravitation+.', function (p) { return rec(p, 'gravity') >= 2000; }],
    ['allmodes', 'crown', 'Allrounder', 'Spiele jeden der 14 Modi mindestens einmal.', function (p) { return Object.keys(p.modesPlayed || {}).length >= 14; }]
  ]);
  CPU.ACHIEVEMENTS = A.map(function (a) { return { id: a[0], icon: a[1], title: a[2], desc: a[3], check: a[4] }; });
  if (typeof module !== 'undefined' && module.exports) module.exports = CPU;
})(typeof window !== 'undefined' ? window : globalThis);
