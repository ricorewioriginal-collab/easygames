/*! AnMaCha Erfolge – spielübergreifende Erfolge für alle easygames (Seite erfolge.html, einbettbar per iframe oder EasyGames.open('erfolge')).
 * Quelle der Erfolge sind die lokalen Spielstände aller Spiele dieses Ursprungs (Spiele, Bestwerte, Sterne, Siege, Zeiten – erkannt über
 * cloud/anmacha-board.js) und die kleinen Spielspuren `anmacha-seen` (Tage, Uhrzeit), die jedes Spiel still mitschreibt.
 * Freischaltungen (Zeitpunkt je Stufe) liegen lokal in `anmacha-ach` und – bei Google-Anmeldung – im eigenen Profil users/<uid>/saves/__ach
 * (keine neue Regel nötig: gleiche Regel wie der Spielstand). Beim Abgleich zählt jede Freischaltung, die irgendein Gerät kennt, der früheste Zeitpunkt gewinnt.
 * Nichts davon ist öffentlich. Reine Rechenlogik ohne DOM, damit sie im Test (tools/test-ach.mjs) ohne Browser läuft. */
(function (root) {
  'use strict';

  // Stufen je Erfolg: thr = Schwellen der Stufen, names = Name je Stufe, pts = Punkte je Stufe (für den Rang)
  var PTS = [10, 20, 40, 80, 150];
  var DEFS = [
    { id: 'explore', icon: '🧭', stat: 'played', thr: [1, 5, 10, 20, 35], names: ['Erster Schritt', 'Entdecker', 'Spielkind', 'Weltenbummler', 'Arcade-Legende'], desc: 'Spiele {n} verschiedene Spiele.' },
    { id: 'daily', icon: '📅', stat: 'days', thr: [2, 5, 10, 30, 100], names: ['Wiederkehrer', 'Stammgast', 'Dauergast', 'Fester Bestandteil', 'Inventar'], desc: 'Spiele an {n} verschiedenen Tagen.' },
    { id: 'streak', icon: '🔥', stat: 'streak', thr: [3, 7, 14, 30], names: ['Dranbleiber', 'Wochenserie', 'Zwei Wochen am Stück', 'Monatsserie'], desc: 'Spiele {n} Tage hintereinander.' },
    { id: 'records', icon: '🏆', stat: 'bests', thr: [1, 5, 10, 20], names: ['Erster Rekord', 'Rekordjäger', 'Bestenjagd', 'Rekordmaschine'], desc: 'Sammle Bestwerte in {n} Spielen.' },
    { id: 'stars', icon: '⭐', stat: 'stars', thr: [10, 100, 1000, 10000], names: ['Sternschnuppe', 'Sternesammler', 'Sternenhimmel', 'Galaxie'], desc: 'Sammle insgesamt {n} Sterne in allen Spielen.' },
    { id: 'wins', icon: '🥇', stat: 'wins', thr: [1, 10, 50, 250], names: ['Erster Sieg', 'Siegertyp', 'Serienmeister', 'Unbesiegbar'], desc: 'Gewinne insgesamt {n} Partien.' },
    { id: 'speed', icon: '⏱️', stat: 'times', thr: [1, 3, 6], names: ['Zeitfahrer', 'Speedrunner', 'Zeitreisender'], desc: 'Stelle Bestzeiten in {n} Spielen auf.' },
    { id: 'team', icon: '🤝', stat: 'multi', thr: [1, 3, 6], names: ['Mitspieler', 'Teamplayer', 'Partykönig'], desc: 'Spiele {n} Mehrspieler-Spiele.' },
    { id: 'complete', icon: '🌍', stat: 'pct', thr: [50, 90, 100], names: ['Halbzeit', 'Fast alles', 'Komplettist'], desc: 'Spiele {n} % aller Spiele.', unit: '%' },
    { id: 'owl', icon: '🌙', stat: 'owl', thr: [1], names: ['Nachteule'], desc: 'Spiele zwischen Mitternacht und 5 Uhr.' },
    { id: 'early', icon: '🌅', stat: 'early', thr: [1], names: ['Frühaufsteher'], desc: 'Spiele zwischen 5 und 8 Uhr morgens.' },
    { id: 'weekend', icon: '🎉', stat: 'weekend', thr: [1], names: ['Wochenend-Held'], desc: 'Spiele am Samstag oder Sonntag.' },
    { id: 'cloud', icon: '☁️', stat: 'cloud', thr: [1], names: ['Wolkenspieler'], desc: 'Melde dich mit Google an und sichere deine Spielstände.' },
    { id: 'board', icon: '📣', stat: 'board', thr: [1], names: ['Ranglisten-Star'], desc: 'Gib deine Bestwerte für die Ranglisten frei.' }
  ];
  var RANKS = [[0, 'Neuling'], [20, 'Spielkind'], [60, 'Zocker'], [140, 'Profi'], [260, 'Meister'], [420, 'Champion'], [620, 'Legende']];

  function isObj(o) { return o && typeof o === 'object' && !Array.isArray(o); }
  function num(v) { v = Number(v); return isFinite(v) ? v : 0; }

  // Längste Serie aufeinanderfolgender Tage (days = Zahlen JJJJMMTT)
  function streak(days) {
    var ix = (days || []).map(function (d) { d = num(d); return Math.round(Date.UTC(Math.floor(d / 10000), Math.floor(d / 100) % 100 - 1, d % 100) / 86400000); })
      .filter(function (x) { return isFinite(x); }).sort(function (a, b) { return a - b; });
    var best = 0, run = 0, prev = null;
    ix.forEach(function (x) { if (x === prev) return; run = prev !== null && x === prev + 1 ? run + 1 : 1; prev = x; if (run > best) best = run; });
    return best;
  }

  // Zusammenführen zweier Zustände {u: {schlüssel: zeit}, g: {spiel: zeit}, d: [tage], f: {flagge: zeit}}: früheste Zeit gewinnt, Tage werden vereinigt
  function minMap(a, b) {
    var out = {}, k;
    [a, b].forEach(function (m) { if (!isObj(m)) return; for (k in m) { var t = num(m[k]); if (t > 0 && (!out[k] || t < out[k])) out[k] = t; } });
    return out;
  }
  function merge(a, b) {
    a = isObj(a) ? a : {}; b = isObj(b) ? b : {};
    var days = {}, list = [];
    [a.d, b.d].forEach(function (l) { (Array.isArray(l) ? l : []).forEach(function (d) { d = num(d); if (d > 19000101 && d < 99991231) days[d] = 1; }); });
    for (var d in days) list.push(Number(d));
    list.sort(function (x, y) { return x - y; });
    return { u: minMap(a.u, b.u), g: minMap(a.g, b.g), d: list.slice(-400), f: minMap(a.f, b.f) };
  }
  function sameState(a, b) { return JSON.stringify(merge(a, {})) === JSON.stringify(merge(b, {})); }

  // Kennzahlen aus der Eingabe: games = [{ id, multi: bool, played: bool, vals: [{ id, v }] }], state = Zustand, cloud / board = bool
  function statsOf(input) {
    var games = input.games || [], st = merge(input.state, {}), s = { played: 0, bests: 0, stars: 0, wins: 0, times: 0, multi: 0, total: games.length };
    games.forEach(function (g) {
      var played = !!g.played || !!st.g[g.id] || (g.vals && g.vals.length > 0);
      if (!played) return;
      s.played++; if (g.multi) s.multi++;
      var any = false, time = false;
      (g.vals || []).forEach(function (x) {
        any = true;
        if (x.id === 'stars') s.stars += Math.max(0, num(x.v));
        else if (x.id === 'wins') s.wins += Math.max(0, num(x.v));
        else if (x.id === 'time') time = true;
      });
      if (any) s.bests++;
      if (time) s.times++;
    });
    s.stars = Math.floor(s.stars); s.wins = Math.floor(s.wins);
    s.days = st.d.length; s.streak = streak(st.d);
    s.pct = s.total ? Math.floor(100 * s.played / s.total) : 0;
    s.owl = st.f.owl ? 1 : 0; s.early = st.f.early ? 1 : 0; s.weekend = st.f.weekend ? 1 : 0;
    s.cloud = input.cloud ? 1 : 0; s.board = input.board ? 1 : 0;
    return s;
  }

  // Bewertung: je Erfolg erreichte Stufe, Fortschritt zur nächsten, Zeitpunkte; neue Freischaltungen werden mit `now` in den Zustand geschrieben
  function evaluate(input, now) {
    var st = merge(input.state, {}), s = statsOf({ games: input.games, state: st, cloud: input.cloud, board: input.board }), fresh = [], pts = 0, done = 0, all = 0;
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

  var api = { DEFS: DEFS, RANKS: RANKS, PTS: PTS, streak: streak, merge: merge, sameState: sameState, statsOf: statsOf, evaluate: evaluate };

  // ---- Browser: lokal lesen/schreiben, Spiele einsammeln, mit dem Profil abgleichen ----
  var LS = null;
  try { LS = root.localStorage; } catch (e) {}
  var KEY = 'anmacha-ach', KEY_SEEN = 'anmacha-seen';
  function read(k) { try { var o = JSON.parse(LS.getItem(k) || 'null'); return isObj(o) ? o : {}; } catch (e) { return {}; } }
  function loadState() { var a = read(KEY), s = read(KEY_SEEN); return merge(a, s); }
  function saveState(st) { try { LS.setItem(KEY, JSON.stringify(st)); } catch (e) {} }

  // games = Katalogeinträge (sync/catalog.json) mit cloud: { game, prefix }; B = window.AnMaChaBoard
  function collect(games, B) {
    return (games || []).filter(function (g) { return g.cloud && g.cloud.game; }).map(function (g) {
      var pre = String(g.cloud.prefix || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean), pairs = pre.length ? B.localPairs(pre) : [];
      return { id: g.cloud.game, multi: !!g.multiplayer, played: pairs.length > 0, vals: pairs.length ? B.values(g.cloud.game, pairs) : [] };
    });
  }
  // Auswertung für diese Seite: berechnet, merkt neue Freischaltungen lokal und liefert das Ergebnis
  function run(games, B, opt) {
    opt = opt || {};
    var st = loadState(), r = evaluate({ games: collect(games, B), state: st, cloud: !!opt.cloud, board: !!opt.board }, Date.now());
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
  api.loadState = loadState; api.collect = collect; api.run = run; api.sync = sync;

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.AnMaChaAch = api;
})(typeof window !== 'undefined' ? window : this);
