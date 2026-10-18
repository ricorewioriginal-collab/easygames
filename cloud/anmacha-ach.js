/*! AnMaCha Erfolge – spielübergreifende Erfolge für alle easygames (Seite erfolge.html, einbettbar per iframe oder EasyGames.open('erfolge')).
 * Quelle der Erfolge sind die lokalen Spielstände aller Spiele dieses Ursprungs (Spiele, Bestwerte, Sterne, Siege, Zeiten – erkannt über
 * cloud/anmacha-board.js), die kleinen Spielspuren `anmacha-seen` (Tage, Uhrzeit, Geräte), die jedes Spiel still mitschreibt, und die EIGENEN Erfolge
 * der Spiele (cloud/anmacha-gameach.js), die hier zusätzlich gelistet und gezählt werden.
 * Freischaltungen (Zeitpunkt je Stufe) liegen lokal in `anmacha-ach` und – bei Google-Anmeldung – im eigenen Profil users/<uid>/saves/__ach
 * (keine neue Regel nötig: gleiche Regel wie der Spielstand). Das Profil sammelt auch je Spiel die besten Werte (v) und die freigeschalteten Spiel-Erfolge (gu),
 * damit die Seite auch dort stimmt, wo die Spiele unter einer anderen Adresse laufen (Apps) oder auf anderen Geräten gespielt wurden. Beim Abgleich zählt jede
 * Freischaltung, die irgendein Gerät kennt (frühester Zeitpunkt gewinnt, beste Werte bleiben).
 * Nichts davon ist öffentlich. Reine Rechenlogik ohne DOM, damit sie im Test (tools/test-ach.mjs) ohne Browser läuft. */
(function (root) {
  'use strict';

  // Stufen je Erfolg: thr = Schwellen der Stufen, names = Name je Stufe; Punkte je Stufe in PTS
  var PTS = [10, 20, 40, 80, 150];
  var DEFS = [
    { id: 'explore', icon: '🧭', stat: 'played', thr: [1, 5, 10, 20, 35], names: ['Erster Schritt', 'Entdecker', 'Spielkind', 'Weltenbummler', 'Arcade-Legende'], desc: 'Spiele {n} verschiedene Spiele.' },
    { id: 'genres', icon: '🎨', stat: 'genres', thr: [3, 5, 7], names: ['Vielseitig', 'Allrounder', 'Alleskönner'], desc: 'Spiele Spiele aus {n} verschiedenen Kategorien (Abenteuer, Action, Puzzle, Quiz, Simulation, Tisch, Musik).' },
    { id: 'complete', icon: '🌍', stat: 'pct', thr: [50, 90, 100], names: ['Halbzeit', 'Fast alles', 'Komplettist'], desc: 'Spiele {n} % aller Spiele.', unit: '%' },
    { id: 'daily', icon: '📅', stat: 'days', thr: [2, 5, 10, 30, 100], names: ['Wiederkehrer', 'Stammgast', 'Dauergast', 'Fester Bestandteil', 'Inventar'], desc: 'Spiele an {n} verschiedenen Tagen.' },
    { id: 'streak', icon: '🔥', stat: 'streak', thr: [3, 7, 14, 30], names: ['Dranbleiber', 'Wochenserie', 'Zwei Wochen am Stück', 'Monatsserie'], desc: 'Spiele {n} Tage hintereinander.' },
    { id: 'veteran', icon: '🎖️', stat: 'age', thr: [30, 100, 365], names: ['Monatsspieler', 'Urgestein', 'Ein Jahr dabei'], desc: 'Spiele seit {n} Tagen bei easygames.', unit: 'Tage' },
    { id: 'marathon', icon: '🏃', stat: 'marathon', thr: [3, 6, 10], names: ['Dreisprung', 'Spielemarathon', 'Arcade-Nacht'], desc: 'Spiele {n} verschiedene Spiele an einem Tag.' },
    { id: 'records', icon: '🏆', stat: 'bests', thr: [1, 5, 10, 20], names: ['Erster Rekord', 'Rekordjäger', 'Bestenjagd', 'Rekordmaschine'], desc: 'Sammle Bestwerte in {n} Spielen.' },
    { id: 'stars', icon: '⭐', stat: 'stars', thr: [10, 100, 1000, 10000], names: ['Sternschnuppe', 'Sternesammler', 'Sternenhimmel', 'Galaxie'], desc: 'Sammle insgesamt {n} Sterne in allen Spielen.' },
    { id: 'wins', icon: '🥇', stat: 'wins', thr: [1, 10, 50, 250], names: ['Erster Sieg', 'Siegertyp', 'Serienmeister', 'Unbesiegbar'], desc: 'Gewinne insgesamt {n} Partien.' },
    { id: 'speed', icon: '⏱️', stat: 'times', thr: [1, 3, 6], names: ['Zeitfahrer', 'Speedrunner', 'Zeitreisender'], desc: 'Stelle Bestzeiten in {n} Spielen auf.' },
    { id: 'team', icon: '🤝', stat: 'multi', thr: [1, 3, 6], names: ['Mitspieler', 'Teamplayer', 'Partykönig'], desc: 'Spiele {n} Mehrspieler-Spiele.' },
    { id: 'ownach', icon: '🎯', stat: 'ownach', thr: [1, 10, 25, 50, 100], names: ['Erster Spiel-Erfolg', 'Erfolgsjäger', 'Trophäensammler', 'Medaillenregen', 'Hall of Fame'], desc: 'Schalte {n} Erfolge in den Spielen selbst frei (siehe unten).' },
    { id: 'allgame', icon: '💯', stat: 'allgame', thr: [1, 3, 5], names: ['Perfektionist', 'Komplettierer', 'Meister aller Klassen'], desc: 'Schalte in {n} Spielen alle Spiel-Erfolge frei.' },
    { id: 'challenge', icon: '🎯', stat: 'challenge', thr: [1, 7, 30, 100], names: ['Tagesheld', 'Wochenheld', 'Monatsheld', 'Dauerbrenner'], desc: 'Trage dich an {n} Tagen bei der Tagesherausforderung ein (Seite „Heute“).' },
    { id: 'owl', icon: '🌙', stat: 'owl', thr: [1], names: ['Nachteule'], desc: 'Spiele zwischen Mitternacht und 5 Uhr.' },
    { id: 'early', icon: '🌅', stat: 'early', thr: [1], names: ['Frühaufsteher'], desc: 'Spiele zwischen 5 und 8 Uhr morgens.' },
    { id: 'weekend', icon: '🎉', stat: 'weekend', thr: [1], names: ['Wochenend-Held'], desc: 'Spiele am Samstag oder Sonntag.' },
    { id: 'app', icon: '📱', stat: 'app', thr: [1], names: ['App-Spieler'], desc: 'Spiele in einer easygames- oder RicoReWi-App.' },
    { id: 'tv', icon: '📺', stat: 'tv', thr: [1], names: ['Sofa-Held'], desc: 'Spiele auf dem Fernseher.' },
    { id: 'pad', icon: '🎮', stat: 'pad', thr: [1], names: ['Controller-Profi'], desc: 'Spiele mit einem Gamecontroller.' },
    { id: 'cloud', icon: '☁️', stat: 'cloud', thr: [1], names: ['Wolkenspieler'], desc: 'Melde dich mit Google an und sichere deine Spielstände.' },
    { id: 'board', icon: '📣', stat: 'board', thr: [1], names: ['Ranglisten-Star'], desc: 'Gib deine Bestwerte für die Ranglisten frei.' }
  ];

  // Kategorien der Spiele (wie die 7 Gruppen im RicoReWi-Portal) je Cloud-ID; neue Spiele hier ergänzen (tools/test-ach.mjs prüft, dass alle Katalogspiele eingetragen sind)
  var GENRES = {
    abenteuer: ['kiko-sterneninseln', 'taschi', 'quest-rpg', 'aeru', 'urwaldlager', 'gay-life', 'zotik2'],
    action: ['krawallvoegel', 'rico-flap', 'radio-maze', 'lumo', 'pufi-farbwind', 'radio-surfer', 'funkparcours', 'kart', 'turbokick', 'riftzone', 'flipper', 'snake', 'showdown'],
    denken: ['kraterkommando', 'funkblasen', 'radio-match', 'memory', 'wobbel', 'frequenzrad', 'tower-defense'],
    quiz: ['quiz', 'gesucht', 'hoererwahl', 'preisradar', 'machmichaus', 'zeitsprung-wissen', 'zeitsprung-movie', 'zeitsprung-radio', 'zeitsprung-castingshow', 'koffer-dealer'],
    sim: ['ricoville', 'ricolife', 'ricorail', 'mimori', 'markthalle', 'funkhaus', 'klotzfunk', 'bunte-insel', 'anmacha-podcast-tycoon'],
    tisch: ['ricopoly', 'partyverse', 'spielesammlung', 'stapelrausch', 'gold-reels', 'anmacha-undercover'],
    musik: ['beat-surfer', 'prismrush']
  };
  var GENRE_OF = {};
  Object.keys(GENRES).forEach(function (k) { GENRES[k].forEach(function (id) { GENRE_OF[id] = k; }); });

  // Ränge: Schwellen als Anteil der Maximalpunkte (wächst mit neuen Erfolgen mit)
  var RANK_NAMES = ['Neuling', 'Spielkind', 'Zocker', 'Profi', 'Meister', 'Champion', 'Legende'], RANK_FRAC = [0, .03, .1, .22, .4, .62, .85];
  function maxPts() { return DEFS.reduce(function (t, d) { return t + d.thr.reduce(function (x, _, i) { return x + PTS[i]; }, 0); }, 0); }
  var RANKS = RANK_NAMES.map(function (n, i) { return [Math.round(maxPts() * RANK_FRAC[i]), n]; });

  function isObj(o) { return o && typeof o === 'object' && !Array.isArray(o); }
  function num(v) { v = Number(v); return isFinite(v) ? v : 0; }
  function dayIndex(d) { d = num(d); return Math.round(Date.UTC(Math.floor(d / 10000), Math.floor(d / 100) % 100 - 1, d % 100) / 86400000); }

  // Längste Serie aufeinanderfolgender Tage (days = Zahlen JJJJMMTT)
  function streak(days) {
    var ix = (days || []).map(dayIndex).filter(function (x) { return isFinite(x); }).sort(function (a, b) { return a - b; });
    var best = 0, run = 0, prev = null;
    ix.forEach(function (x) { if (x === prev) return; run = prev !== null && x === prev + 1 ? run + 1 : 1; prev = x; if (run > best) best = run; });
    return best;
  }

  // Zusammenführen zweier Zustände: u/gu/g/f {schlüssel: zeit} (früheste Zeit gewinnt), d [tage], m (größte Tagesspielzahl), v {spiel: {wertung: zahl}}
  // (Zeiten asc: kleinster Wert gewinnt, sonst größter)
  function minMap(a, b) {
    var out = {}, k;
    [a, b].forEach(function (m) { if (!isObj(m)) return; for (k in m) { var t = num(m[k]); if (t > 0 && (!out[k] || t < out[k])) out[k] = t; } });
    return out;
  }
  function mergeV(a, b) {
    var out = {};
    [a, b].forEach(function (m) {
      if (!isObj(m)) return;
      Object.keys(m).forEach(function (g) {
        if (!isObj(m[g])) return;
        var o = out[g] || (out[g] = {});
        Object.keys(m[g]).forEach(function (s) {
          var x = num(m[g][s]); if (!(x > 0) || x > 1e12) return;
          o[s] = o[s] == null ? x : (s === 'time' ? Math.min(o[s], x) : Math.max(o[s], x));
        });
        if (!Object.keys(o).length) delete out[g];
      });
    });
    return out;
  }
  function merge(a, b) {
    a = isObj(a) ? a : {}; b = isObj(b) ? b : {};
    var hd = {}, hl = [];
    [a.h, b.h].forEach(function (l) { (Array.isArray(l) ? l : []).forEach(function (d) { d = num(d); if (d > 19000101 && d < 99991231) hd[d] = 1; }); });
    for (var hk in hd) hl.push(Number(hk));
    hl.sort(function (x, y) { return x - y; });
    var days = {}, list = [];
    [a.d, b.d].forEach(function (l) { (Array.isArray(l) ? l : []).forEach(function (d) { d = num(d); if (d > 19000101 && d < 99991231) days[d] = 1; }); });
    for (var d in days) list.push(Number(d));
    list.sort(function (x, y) { return x - y; });
    return { u: minMap(a.u, b.u), gu: minMap(a.gu, b.gu), g: minMap(a.g, b.g), d: list.slice(-400), h: hl.slice(-400), f: minMap(a.f, b.f), m: Math.min(99, Math.max(num(a.m), num(b.m))), v: mergeV(a.v, b.v) };
  }
  function sameState(a, b) { return JSON.stringify(merge(a, {})) === JSON.stringify(merge(b, {})); }

  // Kennzahlen aus der Eingabe: games = [{ id, multi, played, vals: [{ id, v }] }], own = { spiel: { total, done } } (eigene Spiel-Erfolge), state, cloud / board, today (JJJJMMTT)
  function statsOf(input) {
    var games = input.games || [], st = merge(input.state, {}), own = input.own || {}, s = { played: 0, bests: 0, stars: 0, wins: 0, times: 0, multi: 0, total: games.length }, gen = {};
    games.forEach(function (g) {
      var vv = {}; (g.vals || []).forEach(function (x) { vv[x.id] = x.v; });
      var sv = st.v[g.id] || {}; Object.keys(sv).forEach(function (k) { if (vv[k] == null) vv[k] = sv[k]; });
      var keys = Object.keys(vv), played = !!g.played || !!st.g[g.id] || keys.length > 0;
      if (!played) return;
      s.played++; if (g.multi) s.multi++;
      if (GENRE_OF[g.id]) gen[GENRE_OF[g.id]] = 1;
      if (keys.length) s.bests++;
      if (vv.time != null) s.times++;
      s.stars += Math.max(0, num(vv.stars)); s.wins += Math.max(0, num(vv.wins));
    });
    s.stars = Math.floor(s.stars); s.wins = Math.floor(s.wins);
    s.genres = Object.keys(gen).length;
    s.days = st.d.length; s.streak = streak(st.d); s.challenge = st.h.length;
    s.age = st.d.length && input.today ? Math.max(0, dayIndex(input.today) - dayIndex(st.d[0])) : 0;
    s.marathon = st.m;
    s.pct = s.total ? Math.floor(100 * s.played / s.total) : 0;
    ['owl', 'early', 'weekend', 'app', 'tv', 'pad'].forEach(function (k) { s[k] = st.f[k] ? 1 : 0; });
    s.cloud = input.cloud ? 1 : 0; s.board = input.board ? 1 : 0;
    // Spiel-Erfolge: aus den Spielständen (own) und dem Profil (gu: "spiel:id"); je Spiel zählt die größere Zahl
    var perGame = {};
    Object.keys(st.gu).forEach(function (k) { var g = k.split(':')[0]; perGame[g] = (perGame[g] || 0) + 1; });
    var sum = 0, full = 0;
    Object.keys(own).forEach(function (g) { var o = own[g]; if (o) { var n = Math.max(num(o.done), perGame[g] || 0); sum += n; if (o.total > 0 && n >= o.total) full++; delete perGame[g]; } });
    Object.keys(perGame).forEach(function (g) { sum += perGame[g]; });
    s.ownach = sum; s.allgame = full;
    return s;
  }

  // Bewertung: je Erfolg erreichte Stufe, Fortschritt zur nächsten, Zeitpunkte; neue Freischaltungen werden mit `now` in den Zustand geschrieben
  function evaluate(input, now) {
    var st = merge(input.state, {}), s = statsOf({ games: input.games, state: st, own: input.own, cloud: input.cloud, board: input.board, today: input.today }), fresh = [], pts = 0, done = 0, all = 0;
    var items = DEFS.map(function (d) {
      var v = s[d.stat] || 0, level = 0, i;
      for (i = 0; i < d.thr.length; i++) {
        var key = d.id + ':' + (i + 1);
        if (v >= d.thr[i]) {
          level = i + 1;
          if (!st.u[key]) { st.u[key] = now; fresh.push({ id: d.id, level: i + 1, icon: d.icon, name: d.names[i], key: key }); }
        }
      }
      var next = level < d.thr.length ? d.thr[level] : null;
      var prevT = level > 0 ? d.thr[level - 1] : 0;
      for (i = 1; i <= d.thr.length; i++) { all++; if (st.u[d.id + ':' + i] && i <= level) { pts += PTS[i - 1] || PTS[PTS.length - 1]; done++; } }
      return {
        id: d.id, icon: d.icon, name: d.names[Math.max(level, 1) - 1], levels: d.thr.length, level: level, value: v, next: next, unit: d.unit || '',
        pct: next == null ? 100 : Math.max(0, Math.min(100, Math.round(100 * (v - prevT) / (next - prevT)))),
        desc: d.desc.replace('{n}', String(next == null ? d.thr[d.thr.length - 1] : next)), at: level > 0 ? st.u[d.id + ':' + level] || 0 : 0
      };
    });
    var ri = 0; RANKS.forEach(function (r, i) { if (pts >= r[0]) ri = i; });
    var rank = { name: RANKS[ri][1], index: ri, pts: pts, from: RANKS[ri][0], to: ri + 1 < RANKS.length ? RANKS[ri + 1][0] : null, nextName: ri + 1 < RANKS.length ? RANKS[ri + 1][1] : null };
    return { items: items, stats: s, fresh: fresh, state: st, rank: rank, done: done, total: all };
  }

  var api = { DEFS: DEFS, RANKS: RANKS, PTS: PTS, GENRES: GENRES, GENRE_OF: GENRE_OF, streak: streak, merge: merge, sameState: sameState, statsOf: statsOf, evaluate: evaluate };

  // ---- Browser: lokal lesen/schreiben, Spiele einsammeln, mit dem Profil abgleichen ----
  var LS = null;
  try { LS = root.localStorage; } catch (e) {}
  var KEY = 'anmacha-ach', KEY_SEEN = 'anmacha-seen';
  function read(k) { try { var o = JSON.parse(LS.getItem(k) || 'null'); return isObj(o) ? o : {}; } catch (e) { return {}; } }
  function loadState() { return merge(read(KEY), read(KEY_SEEN)); }
  function saveState(st) { try { LS.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
  function todayNum() { var d = new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); }

  // games = Katalogeinträge (sync/catalog.json) mit cloud: { game, prefix }; B = window.AnMaChaBoard
  function collect(games, B) {
    return (games || []).filter(function (g) { return g.cloud && g.cloud.game; }).map(function (g) {
      var pre = String(g.cloud.prefix || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean), pairs = pre.length ? B.localPairs(pre) : [];
      return { id: g.cloud.game, multi: !!g.multiplayer, played: pairs.length > 0, vals: pairs.length ? B.values(g.cloud.game, pairs) : [] };
    });
  }
  // Beste Werte aus den lokalen Spielständen ins Profil-/Zustandsobjekt übernehmen ({spiel: {wertung: zahl}}) und freigeschaltete Spiel-Erfolge ({ "spiel:id": zeit })
  function localExtras(list, own, now) {
    var v = {}, gu = {};
    list.forEach(function (g) { (g.vals || []).forEach(function (x) { if (x.v > 0) { (v[g.id] = v[g.id] || {})[x.id] = x.v; } }); });
    Object.keys(own || {}).forEach(function (g) { Object.keys(own[g].unlocked || {}).forEach(function (id) { gu[g + ':' + id] = Number(own[g].unlocked[id]) > 1 ? Number(own[g].unlocked[id]) : now; }); });
    return { v: v, gu: gu };
  }
  // Auswertung für diese Seite: berechnet, merkt neue Freischaltungen lokal und liefert das Ergebnis. opt.own = Ergebnis von AnMaChaGameAch.collect()
  function run(games, B, opt) {
    opt = opt || {};
    var now = Date.now(), list = collect(games, B), own = opt.own || {}, ex = localExtras(list, own, now);
    var st = merge(loadState(), { v: ex.v, gu: ex.gu });
    var r = evaluate({ games: list, state: st, own: own, cloud: !!opt.cloud, board: !!opt.board, today: todayNum() }, now);
    saveState(r.state);
    return r;
  }
  // Mit dem Profil abgleichen (nur angemeldet): Cloud-Stand holen, vereinigen, zurückschreiben, wenn sich etwas geändert hat. Liefert den vereinigten Zustand.
  function sync(B) {
    var local = loadState();
    return B.getUserDoc('ach').then(function (remote) {
      var m = merge(local, remote);
      saveState(m);
      if (remote && sameState(m, remote)) return m;
      return B.putUserDoc('ach', m).then(function () { return m; }, function () { return m; });
    });
  }
  // Aus einem Spiel heraus (stille Laufzeit): eigene Werte und Spiel-Erfolge dieses Spiels ins Profil schieben, höchstens alle 5 Minuten und nur bei Änderung
  function pushGame(game, B, gameAch) {
    var K = 'anmacha-ach-pushed', last = 0;
    try { last = Number(LS.getItem(K)) || 0; } catch (e) {}
    if (Date.now() - last < 300000) return Promise.resolve();
    var now = Date.now(), pairs = B.localPairs(null), vals = B.values(game, pairs), own = gameAch ? gameAch.collectOne(game) : null;
    var ex = localExtras([{ id: game, vals: vals }], own ? (function (o) { o[game] = own; return o; })({}) : {}, now);
    var local = merge(loadState(), { v: ex.v, gu: ex.gu });
    saveState(local);
    return B.getUserDoc('ach').then(function (remote) {
      try { LS.setItem(K, String(Date.now())); } catch (e) {}
      var m = merge(local, remote);
      saveState(m);
      if (remote && sameState(m, remote)) return;
      return B.putUserDoc('ach', m).catch(function () {});
    });
  }
  // Tagesherausforderung: heutigen Tag als „eingetragen“ merken (lokal; der Abgleich mit dem Profil folgt über sync/pushGame)
  function markChallenge(day) { var st = merge(loadState(), { h: [day] }); saveState(st); return st.h.length; }
  api.markChallenge = markChallenge;
  api.loadState = loadState; api.collect = collect; api.run = run; api.sync = sync; api.pushGame = pushGame;

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.AnMaChaAch = api;
})(typeof window !== 'undefined' ? window : this);
