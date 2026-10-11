/* GayLife – Menschen im Alltag: NPC-Tagesabläufe nach Uhrzeit und Wochentag.
   Jede Person hat einen Plan (von–bis Uhr → Ort). Wer „zu Hause“ ist, ist nicht zu sehen und nicht ansprechbar.
   Termine (Dates) überschreiben den Plan: zur vereinbarten Zeit wartet die Person am verabredeten Ort (GL.dating.apptFor). */
(function () {
  'use strict';
  var S = GL.S;
  var P = GL.people = {};
  // Orte: POI-Kennung, 'plaza' (Brunnenplatz), 'park' (Park im Osten), 'kiosk' (Späti), 'home'
  var WK = 'wk', WE = 'we';
  var SCHED = {
    jonas: { wk: [[8, 13, 'cafe'], [13, 17, 'books'], [17, 21, 'park'], [21, 24, 'club']], we: [[10, 16, 'cafe'], [16, 20, 'park'], [20, 24, 'club']] },
    mehmet: { wk: [[6, 10, 'gym'], [10, 13, 'kiosk'], [17, 21, 'gym']], we: [[8, 12, 'gym'], [12, 15, 'park'], [20, 24, 'club']] },
    luca: { wk: [[10, 15, 'shop'], [15, 19, 'plaza'], [19, 24, 'club']], we: [[12, 18, 'plaza'], [18, 24, 'club']] },
    gerda: { wk: [[8, 12, 'plaza'], [12, 15, 'cafe'], [15, 18, 'park']], we: [[8, 12, 'plaza'], [12, 15, 'cafe'], [15, 18, 'park']] },
    chantal: { wk: [[10, 18, 'shop'], [18, 24, 'club']], we: [[14, 20, 'plaza'], [20, 24, 'club']] },
    bruno: { wk: [[0, 4, 'club'], [20, 24, 'club']], we: [[0, 5, 'club'], [19, 24, 'club']] },
    mimosa: { wk: [[0, 2, 'club'], [12, 17, 'kara'], [18, 24, 'club']], we: [[0, 3, 'club'], [14, 18, 'kara'], [19, 24, 'club']] },
    sven: { wk: [[11, 18, 'arcade'], [18, 22, 'kiosk']], we: [[12, 20, 'arcade']] },
    ilse: { wk: [[8, 12, 'plaza'], [12, 16, 'cafe'], [16, 19, 'park']], we: [[8, 12, 'plaza'], [12, 16, 'cafe'], [16, 19, 'park']] },
    torsten: { wk: [[9, 18, 'pool']], we: [[10, 19, 'pool']] },
    // Auftraggeber mit festem Platz: tagsüber am Brunnen
    kai: { wk: [[9, 21, 'fix']], we: [[10, 21, 'fix']] },
    dennis: { wk: [[9, 21, 'fix']], we: [[10, 21, 'fix']] }
  };
  var LABEL = { plaza: 'Brunnenplatz', park: 'Park im Osten', kiosk: 'Späti Lecker', home: 'zu Hause', fix: 'Brunnenplatz' };
  P.SCHED = SCHED;

  P.isWeekend = function () { return (GL.S.life.day - 1) % 7 >= 5; };
  P.placeAt = function (id, hour, weekend) {
    var sc = SCHED[id]; if (!sc) return 'home';
    var l = sc[weekend ? WE : WK];
    for (var i = 0; i < l.length; i++) if (hour >= l[i][0] && hour < l[i][1]) return l[i][2];
    return 'home';
  };
  P.place = function (id) {
    var a = GL.dating && GL.dating.apptFor(id); if (a) return a.place;
    return P.placeAt(id, GL.life.hour(), P.isWeekend());
  };
  P.label = function (place) {
    if (LABEL[place]) return LABEL[place];
    var o = GL.core.POIS.filter(function (x) { return x.id === place; })[0]; return o ? o.n : place;
  };
  P.where = function (id) { return P.label(P.place(id)); };

  function spot(place, idx, W) {
    var a = idx * 2.399, ox = Math.cos(a) * 2.2, oz = Math.sin(a) * 1.6;
    if (place === 'plaza') return { x: Math.cos(a) * 6.5, z: Math.sin(a) * 6.5 };
    if (place === 'park') return { x: 86 + ox * 2, z: 24 + oz * 2 };
    if (place === 'kiosk') { var k = GL.eco.kioskPos; return { x: k.x - 1.5 + ox, z: k.z + oz }; }
    var p = W.pois[place]; if (!p) return { x: ox, z: oz };
    return { x: p.x + ox * 1.4, z: p.z + oz };
  }

  var acc = 0;
  GL.on('worldBuilt', function (W) {
    W.inter.forEach(function (it) {
      if (!it.npc) return;
      var n = it.npc;
      Object.defineProperty(it, 'on', { configurable: true, get: function () { return !n.hidden; } });
    });
  });
  GL.on('tick', function (dt, W) {
    acc += dt; if (acc < 1) return; acc = 0;
    if (W.parade > 0 || W.inside) { return; }
    var pl = W.player;
    W.npcs.forEach(function (n, idx) {
      var id = n.d.id, sc = SCHED[id]; if (!sc) return;
      var place = P.place(id);
      if (n._pl !== place) {
        var first = n._pl === undefined; n._pl = place;
        if (place === 'home') {
          n.hidden = 1; n.g.visible = false; n.path = []; n.stat = 1;
        } else {
          var was = n.hidden; n.hidden = 0; n.g.visible = true; n.stat = 1;
          if (place === 'fix') { n._tg = { x: n.fx !== undefined ? n.fx : (n.fx = n.x), z: n.fz !== undefined ? n.fz : (n.fz = n.z) }; }
          else n._tg = spot(place, idx, W);
          if (was || first) { n.x = n._tg.x; n.z = n._tg.z; n.g.position.set(n.x, 0, n.z); n.path = []; }
          else n.path = [[0, 0], [n._tg.x, n._tg.z]];
        }
      }
      if (n.hidden || !n._tg) return;
      if (!n.path.length && Math.hypot(n.x - n._tg.x, n.z - n._tg.z) > 1.5) n.path = [[n._tg.x, n._tg.z]];
    });
  });
  // beim Betreten der Stadt (z. B. nach einem Minispiel oder Schlafen) sofort richtig platzieren
  GL.on('enterWorld', function (W) { W.npcs.forEach(function (n) { n._pl = undefined; }); acc = 9; });
})();
