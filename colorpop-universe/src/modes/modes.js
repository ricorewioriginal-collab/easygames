/* ColorPop Universe – Spielmodi. Jeder Modus = eigene Regeln auf derselben Engine (CPU.Game). Zeit kommt immer von außen (now in ms),
 * dadurch sind alle Modi im Test ohne echte Uhr prüfbar. Klassiker bleibt rein: keine Booster, kein Timer, kein Nachfüllen, kein Bonus. */
(function (root) {
  'use strict';
  var CPU = root.CPU || (root.CPU = {});
  var B = CPU.board;

  CPU.MODES = [
    { id: 'adventure', icon: 'map', name: 'Abenteuer', desc: '300 Level in 12 Welten mit Sternen und neuen Mechaniken.', tut: 'Jedes Level hat ein Ziel (oben angezeigt). Erreiche es, bis keine Gruppe mehr übrig ist oder die Züge aufgebraucht sind. Mit „Abschließen“ beendest du ein Level, sobald das Ziel erfüllt ist. Sterne gibt es für Punkte.' },
    { id: 'classic', icon: 'gem', name: 'Klassiker', desc: 'Reines Abräumen nach den Originalregeln. Brettgröße und Farben frei wählbar.', tut: 'Tippe Gruppen ab 2 gleichen Steinen an. Punkte: (Steine − 2)² × 10. Leeres Brett: +1000. Keine Booster, keine Zeit, kein Rückgängig – die Runde endet, wenn keine Gruppe mehr da ist.' },
    { id: 'zen', icon: 'leaf', name: 'Zen', desc: 'Kein Zeitdruck, Rückgängig erlaubt, ruhige Musik.', tut: 'Spiel in deinem Tempo. Mit Rückgängig (U) nimmst du Züge zurück. Wenn nichts mehr geht, kommt einfach ein neues Brett.' },
    { id: 'sprint', icon: 'bolt', name: 'Sprint 60', desc: '60 Sekunden Punktejagd mit Combo-Faktor.', tut: '60 Sekunden! Ist ein Brett leer oder ohne Zug, kommt sofort das nächste. Combo: Ein Zug innerhalb von 2 Sekunden nach dem letzten erhöht den Faktor um ×0,1 (bis ×2,0).' },
    { id: 'time', icon: 'clock', name: 'Zeitattacke', desc: '2, 3 oder 5 Minuten mit nachfallenden Steinen.', tut: 'Entfernte Steine werden von oben nachgefüllt, Spalten rücken nicht zusammen. Gruppen ab 8 Steinen bringen +2 Sekunden.' },
    { id: 'moves', icon: 'steps', name: 'Zuglimit', desc: '15, 25 oder 40 Züge – hol das Maximum heraus.', tut: 'Steine werden nachgefüllt. Du hast eine feste Zahl an Zügen; jeder Zug zählt. Plane große Gruppen!' },
    { id: 'puzzle', icon: 'puzzle', name: 'Puzzle-Labor', desc: '30 Knobelrätsel: leere das Brett in möglichst wenigen Zügen.', tut: 'Jedes Rätsel ist nachweislich komplett leerbar. 1 Stern: leer. 2 Sterne: höchstens 2 Züge über dem Bestwert. 3 Sterne: mit der kleinsten möglichen Zugzahl. Rückgängig ist erlaubt.' },
    { id: 'chaos', icon: 'swirl', name: 'Farbchaos', desc: '6–7 Farben, Neonsteine und Regenbogen.', tut: 'Sonderregeln: 6 oder 7 Farben. Neonsteine wechseln nach jedem Zug die Farbe. Regenbogensteine färben ihre Zielfarbe um. +5 Punkte je Stein, den ein Spezialstein zusätzlich entfernt.' },
    { id: 'gravity', icon: 'arrows', name: 'Gravitation+', desc: 'Alle 3 Züge dreht sich die Schwerkraft.', tut: 'Eigene Regeln: Die Schwerkraft wechselt alle 3 Züge reihum (unten → links → oben → rechts). Pfeile am Rand und die Vorschau zeigen die aktuelle und die nächste Richtung. Bei seitlicher Schwerkraft rücken leere Reihen nach unten zusammen.' },
    { id: 'daily', icon: 'sun', name: 'Daily Pop', desc: 'Ein Brett pro Tag – weltweit gleich.', tut: 'Das Brett entsteht aus dem heutigen UTC-Datum, ist also auf allen Geräten gleich. Spiele so oft du willst, dein Bestwert zählt. Klassische Regeln.' },
    { id: 'weekly', icon: 'calendar', name: 'Wochenliga', desc: '7 Aufgaben pro Kalenderwoche.', tut: 'Jede Woche gibt es 7 Aufgaben mit eigenem Ziel. Für jede gelöste Aufgabe zählt deine Punktzahl zur Wochenwertung. Jederzeit spielbar und wiederholbar.' },
    { id: 'tower', icon: 'tower', name: 'Endlos-Turm', desc: 'Stockwerk um Stockwerk schwerer.', tut: 'Jedes Stockwerk hat ein Ziel. Geschafft → nächstes, größeres Stockwerk mit neuen Mechaniken. Dein Fortschritt bleibt gespeichert; nach einer Niederlage startest du das Stockwerk neu.' },
    { id: 'duel', icon: 'robot', name: 'KI-Duell', desc: 'Du gegen den Bot auf demselben Brett.', tut: 'Du spielst zuerst, danach spielt der Bot exakt dasselbe Brett mit echten Zügen (Einfach, Mittel oder Schwer). Wer mehr Punkte hat, gewinnt. Den Bot-Durchgang kannst du dir ansehen.' },
    { id: 'local', icon: 'users', name: 'Lokal zu zweit', desc: 'Zu zweit an einem Gerät.', tut: 'Zugwechsel: Ihr spielt abwechselnd auf einem Brett, jeder sammelt eigene Punkte. Nacheinander: Beide spielen dasselbe Brett, erst Spieler 1, dann Spieler 2.' }
  ];
  CPU.modeInfo = function (id) { for (var i = 0; i < CPU.MODES.length; i++) if (CPU.MODES[i].id === id) return CPU.MODES[i]; return null; };
  CPU.CLASSIC_SIZES = [{ id: 'easy', name: 'Leicht', w: 8, h: 10 }, { id: 'normal', name: 'Normal', w: 12, h: 12 }, { id: 'big', name: 'Groß', w: 16, h: 12 }, { id: 'expert', name: 'Experte', w: 20, h: 15 }];

  function classicBoard(w, h, colors, seed, extra) {
    return CPU.gen.boardFor(Object.assign({ w: w, h: h, colors: colors, seed: seed >>> 0, cluster: 0, shape: 'none', sp: {} }, extra || {}));
  }
  function seedFrom(s) { return (typeof s === 'number' ? s : CPU.hash(String(s))) >>> 0; }

  // Ziel für erzeugte Aufgaben (Daily-Ziel, Wochenliga, Turm): schneller Löser, Ziel = Anteil seines Ergebnisses → immer erreichbar
  function taskFrom(def, plan, q) {
    var g = new CPU.Game(Object.assign({}, def, { goals: [], stars: [0, 0] }));
    var kind = plan === 'leave' || plan === 'clear' ? 'clear' : plan === 'score' ? 'score' : 'goal';
    var prov = [];
    if (plan === 'items') prov = [{ t: 'items', v: 0, n: CPU.countItems(g.board) || 1 }];
    else if (plan === 'ice') prov = [{ t: 'ice' }];
    else if (plan === 'groups') prov = [{ t: 'groups', size: 6, n: 99 }];
    else if (plan === 'blocks') prov = [{ t: 'blocks' }];
    g.goals = prov.map(function (x) { return Object.assign({}, x); });
    var r = CPU.bots.beam(g, { width: 5, evaluate: CPU.bots.evaluator(kind), budget: 6000 }), G = r ? r.game : g;
    var goals;
    if (plan === 'leave' || plan === 'clear') goals = [{ t: 'leave', n: Math.max(0, G.remaining() + 3) }];
    else if (plan === 'score') goals = [{ t: 'score', n: Math.max(10, Math.round(G.score * q / 10) * 10) }];
    else if (plan === 'items') goals = [{ t: 'items', v: 0, n: Math.max(1, G.stats.items[0]) }];
    else if (plan === 'groups') { var n = 0; Object.keys(G.stats.sizes).forEach(function (s) { if (+s >= 6) n += G.stats.sizes[s]; }); goals = [{ t: 'groups', size: 6, n: Math.max(1, Math.floor(n * q)) }]; }
    else { var pr = G.progress()[0]; goals = [{ t: plan, n: Math.max(1, Math.floor(pr.cur * q)) }]; }
    var sc = Math.max(20, G.score);
    return { goals: goals, stars: [Math.round(sc * 0.55 / 10) * 10, Math.round(sc * 0.85 / 10) * 10], botScore: G.score };
  }
  CPU.taskFrom = taskFrom;

  function weeklyTask(week, k) {
    var seed = CPU.hash('cpu-week-' + week + '-' + k), r = CPU.rng(seed);
    var plans = ['score', 'leave', 'groups', 'items', 'ice', 'blocks', 'score'], plan = plans[(k + r.int(7)) % 7];
    var sp = {}; if (plan === 'items') sp.items = [3, 0]; if (plan === 'ice') sp.ice = [8, 1 + r.int(2)]; if (plan === 'blocks') sp.wood = 6;
    if (k >= 3) sp.bomb = 2; if (k >= 5) sp.rocket = 2;
    var w = 8 + (k >> 1), h = 9 + (k >> 1), colors = 4 + (k >= 5 ? 1 : 0);
    var def = { board: CPU.gen.boardFor({ w: w, h: h, colors: colors, seed: seed, cluster: 0.22, shape: 'none', sp: sp }), colors: colors, seed: seed, rules: { specialBonus: 5 } };
    var t = taskFrom(def, plan, 0.7);
    return { k: k, plan: plan, def: Object.assign(def, { goals: t.goals, stars: t.stars }) };
  }
  function towerFloor(floor) {
    var seed = CPU.hash('cpu-tower-' + floor), r = CPU.rng(seed), f = floor - 1;
    var w = Math.min(14, 6 + Math.floor(f / 3)), h = Math.min(14, 7 + Math.floor(f / 3)), colors = Math.min(6, 3 + Math.floor(f / 6));
    var sp = {}, plans = ['score', 'leave'];
    if (floor >= 4) { sp.wood = 2 + (f % 4); plans.push('blocks'); }
    if (floor >= 7) { sp.ice = [3 + (f % 6), 1 + (f % 3)]; plans.push('ice'); }
    if (floor >= 10) { sp.bomb = 1 + (f % 3); sp.items = [2 + (f % 3), 0]; plans.push('items'); }
    if (floor >= 14) { sp.rocket = 1 + (f % 2); sp.chain = 2 + (f % 3); }
    if (floor >= 20) { sp.prism = 1 + (f % 3); sp.neon = 2; }
    var plan = plans[r.int(plans.length)];
    var def = { board: CPU.gen.boardFor({ w: w, h: h, colors: colors, seed: seed, cluster: Math.max(0.1, 0.4 - f * 0.012), shape: 'none', sp: sp }), colors: colors, seed: seed, rules: { specialBonus: 5 }, boosters: true };
    var t = taskFrom(def, plan, Math.min(0.9, 0.55 + f * 0.012));
    return Object.assign(def, { goals: t.goals, stars: t.stars, floor: floor });
  }
  CPU.weeklyTask = weeklyTask; CPU.towerFloor = towerFloor;

  // ---------- Sitzung ----------
  // opt: { mode, now, seed, level (Def), w, h, colors, limit (Sek./Züge), puzzle, bot, variant, week, k, floor, players }
  function Session(opt) {
    this.opt = opt; this.mode = opt.mode; this.t0 = opt.now || 0; this.events = []; this.boardNo = 0; this.combo = 0; this.lastMoveAt = -1e9;
    this.bonusTime = 0; this.total = 0; this.over = false; this.result = null; this.player = 0; this.scores = [0, 0]; this.round = 0;
    this.seed = seedFrom(opt.seed == null ? 12345 : opt.seed);
    this.game = this.makeGame(0);
  }
  var S = Session.prototype;
  S.makeGame = function (n) {
    var o = this.opt, m = this.mode, seed = (this.seed + n * 7919) >>> 0, d;
    switch (m) {
      case 'adventure': return CPU.levels.game(o.level);
      case 'classic': case 'daily':
        d = { board: classicBoard(o.w || 12, o.h || 12, o.colors || 4, seed), colors: o.colors || 4, seed: seed };
        if (m === 'daily' && !this.dailyGoal) { var tg = taskFrom(d, 'score', 0.8); this.dailyGoal = tg.goals[0].n; }
        return new CPU.Game(d);
      case 'zen': return new CPU.Game({ board: classicBoard(o.w || 10, o.h || 12, o.colors || 4, seed, { cluster: 0.2 }), colors: o.colors || 4, seed: seed, allowUndo: true });
      case 'sprint': return new CPU.Game({ board: classicBoard(9, 10, 4, seed, { cluster: 0.2 }), colors: 4, seed: seed });
      case 'time': return new CPU.Game({ board: classicBoard(9, 11, 5, seed), colors: 5, seed: seed, rules: { refill: true, collapse: false } });
      case 'moves': return new CPU.Game({ board: classicBoard(9, 11, 5, seed), colors: 5, seed: seed, rules: { refill: true, collapse: false }, moves: n === 0 ? (o.limit || 25) : Math.max(1, (o.limit || 25) - this.movesSoFar) });
      case 'puzzle': return new CPU.Game({ board: B.fromRows(o.puzzle.grid), colors: o.puzzle.colors, seed: o.puzzle.id, allowUndo: true, goals: [{ t: 'clear' }] });
      case 'chaos': var cc = o.colors || 6; return new CPU.Game({ board: classicBoard(11, 12, cc, seed, { cluster: 0.15, sp: { neon: 10, rainbow: 4, bomb: 2 } }), colors: cc, seed: seed, rules: { specialBonus: 5 } });
      case 'gravity': return new CPU.Game({ board: classicBoard(10, 10, 4, seed, { cluster: 0.18 }), colors: 4, seed: seed, rules: { gravityCycle: [0, 1, 2, 3], cycleEvery: 3 } });
      case 'weekly': return new CPU.Game(weeklyTask(o.week, o.k).def);
      case 'tower': return new CPU.Game(towerFloor(o.floor || 1));
      case 'duel': case 'local': return new CPU.Game({ board: classicBoard(o.w || 10, o.h || 10, o.colors || 4, (this.seed) >>> 0), colors: o.colors || 4, seed: this.seed });
    }
    throw new Error('Unbekannter Modus ' + m);
  };
  S.timeLimit = function () { return this.mode === 'sprint' ? 60 : this.mode === 'time' ? (this.opt.limit || 120) : 0; };
  S.timeLeft = function (now) { var L = this.timeLimit(); if (!L) return Infinity; return Math.max(0, L + this.bonusTime - (now - this.t0 - (this.pausedMs || 0)) / 1000); };
  S.pause = function (now) { if (this.pausedAt == null) this.pausedAt = now; };
  S.resume = function (now) { if (this.pausedAt != null) { this.pausedMs = (this.pausedMs || 0) + (now - this.pausedAt); this.pausedAt = null; } };
  S.score = function () { return this.mode === 'local' && this.opt.variant === 'turns' ? this.scores[0] + this.scores[1] : this.total + this.game.score; };
  S.allowBoosters = function () { return this.mode === 'adventure' || this.mode === 'tower' || this.mode === 'zen'; };
  S.allowHint = function () { return !(this.mode === 'duel' || this.mode === 'local' || this.mode === 'daily' || this.mode === 'weekly'); };
  S.canUndo = function () { return this.game.canUndo(); };
  S.comboMult = function () { return this.mode === 'sprint' ? 1 + Math.min(10, this.combo) * 0.1 : 1; };
  // Zug ausführen; liefert Engine-Ergebnis + Moduszusatz (newBoard, timeBonus, combo, player)
  S.move = function (i, now) {
    if (this.over) return null;
    if (this.timeLimit() && this.timeLeft(now) <= 0) { this.finish('time'); return null; }
    var mult = 1;
    if (this.mode === 'sprint') { this.combo = now - this.lastMoveAt <= 2000 ? this.combo + 1 : 0; mult = this.comboMult(); }
    var who = this.player;
    var res = this.game.move(i, mult);
    if (!res) { if (this.mode === 'sprint') this.combo = 0; return null; }
    this.lastMoveAt = now;
    res.player = who;
    if (this.mode === 'local' && this.opt.variant === 'turns') { this.scores[who] += res.gain; this.player = 1 - who; }
    if (this.mode === 'time' && res.group.length >= 8) { this.bonusTime += 2; res.timeBonus = 2; }
    if (this.mode === 'sprint') res.combo = this.combo;
    var st = this.game.status();
    if (st.over) {
      if (this.mode === 'sprint' || this.mode === 'zen' || ((this.mode === 'time' || this.mode === 'moves') && st.reason === 'nomoves')) {
        this.nextBoard(); res.newBoard = true;
      } else if (this.mode === 'local' && this.opt.variant === 'relay' && this.round === 0) { res.roundOver = true; }
      else this.finish(st.reason);
    }
    return res;
  };
  S.nextBoard = function () {
    if (this.mode === 'moves') { this.movesSoFar = (this.movesSoFar || 0) + this.game.movesUsed; if (this.movesSoFar >= (this.opt.limit || 25)) { this.finish('moves'); return; } }
    this.total += this.game.score; this.boardNo++;
    this.game = this.makeGame(this.boardNo);
  };
  // Spieler 2 beginnt (Nacheinander-Variante)
  S.nextRound = function () { if (this.mode !== 'local' || this.round !== 0) return false; this.scores[0] = this.game.score; this.round = 1; this.player = 1; this.game = this.makeGame(0); return true; };
  S.tick = function (now) {
    if (this.over) return null;
    if (this.timeLimit() && this.pausedAt == null && this.timeLeft(now) <= 0) return this.finish('time');
    return null;
  };
  S.finish = function (reason) {
    if (this.over) return this.result;
    var g = this.game, gr = g.over ? g.result : g.finish(reason);
    this.over = true;
    var r = { mode: this.mode, reason: reason || gr.reason, score: this.score(), won: gr.won, stars: gr.stars, moves: g.movesUsed, remaining: gr.remaining, cleared: gr.cleared, stats: gr.stats, boards: this.boardNo + 1 };
    if (this.mode === 'local') {
      if (this.opt.variant === 'relay') { this.scores[1] = g.score; }
      r.scores = this.scores.slice(); r.winner = this.scores[0] === this.scores[1] ? -1 : this.scores[0] > this.scores[1] ? 0 : 1;
    }
    if (this.mode === 'puzzle') { var p = this.opt.puzzle; r.won = g.cleared; r.stars = !g.cleared ? 0 : g.movesUsed <= p.min ? 3 : g.movesUsed <= p.min + 2 ? 2 : 1; }
    if (this.mode === 'daily') { r.goal = this.dailyGoal; r.goalMet = r.score >= this.dailyGoal; }
    if (this.mode === 'duel') {
      var start = this.makeGame(0), bot = CPU.bots.play(start, this.opt.bot || 'medium', this.seed);
      r.bot = { level: this.opt.bot || 'medium', score: bot.score, moves: bot.moves, remaining: bot.game.remaining() };
      r.winner = r.score === bot.score ? -1 : r.score > bot.score ? 0 : 1;
    }
    this.result = r;
    return r;
  };
  CPU.Session = Session;
  CPU.modes = { create: function (mode, opt) { return new Session(Object.assign({ mode: mode }, opt || {})); }, classicBoard: classicBoard, seedFrom: seedFrom };
  if (typeof module !== 'undefined' && module.exports) module.exports = CPU;
})(typeof window !== 'undefined' ? window : globalThis);
