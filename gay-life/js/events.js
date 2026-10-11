/* GayLife – wiederkehrende Veranstaltungen (aus der Tageszahl berechnet, Tag 1 = Montag):
   - Karaoke-Wettbewerb: jeden Freitag 19–23 Uhr im Karaoke Mikro-Mimosa (3 Lieder, gegen drei Stammgäste, Platz 1–4)
   - Pride-Parade: jeden 28. Tag (Sonntag) 12–18 Uhr, Treffpunkt Regenbogen-Bühne (mitgehen, Konfetti, Kontakte)
   Teilnahme ist freiwillig und höchstens einmal pro Veranstaltung. S.events = { kara: Tag, pride: Tag }. Handy-App „Events“ zeigt die nächsten Termine. */
(function () {
  'use strict';
  var S = GL.S, E = GL.events = {};
  function L() { return GL.S.life; }
  function ev() { return GL.S.events || (GL.S.events = { kara: 0, pride: 0 }); }
  var DAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'], RIV = ['Madame Mimosa', 'Sven', 'Oma Ilse'];
  E.karaDay = function (d) { return d % 7 === 5; };
  E.prideDay = function (d) { return d % 28 === 0; };
  E.nextDay = function (fn) { var d = L().day, i; for (i = 0; i < 60; i++) if (fn(d + i) && !(i === 0 && GL.life.hour() >= 23)) return d + i; return 0; };
  function hour() { return GL.life.hour(); }
  E.karaOpen = function () { return E.karaDay(L().day) && hour() >= 19 && hour() < 23; };
  E.prideOpen = function () { return E.prideDay(L().day) && hour() >= 12 && hour() < 18; };
  function hash(a) { var h = Math.imul(a + 3, 2654435761) >>> 0; h = Math.imul(h ^ h >>> 15, 2246822519) >>> 0; return (h ^ h >>> 13) >>> 0; }

  /* ---------- Karaoke-Wettbewerb ---------- */
  function karaItem() {
    var e = ev(), done = e.kara === L().day, why = !E.karaOpen() ? 'Nur freitags von 19 bis 23 Uhr.' : done ? 'Du hast heute schon mitgemacht.' : L().needs.energy < 20 ? 'Du bist zu müde.' : '';
    return { e: '🏆', t: 'Karaoke-Wettbewerb', s: why || 'Drei Lieder, drei Stammgäste treten gegen dich an. Mitmachen ist freiwillig.', dis: !!why, fn: function () { GL.ui.close(); karaoke(); } };
  }
  function karaoke() {
    var pts = 0, i = 0, J = GL.jobs, lv = J && J.level ? J.level('perf') : 1, skill = Math.max(.1, Math.min(.95, .25 + GL.life.mood() / 250 + (lv - 1) * .05));
    var SONGS = [['Ein Lied zum Mitschunkeln', 2, .9, 'Sicher, das Publikum schunkelt mit.'], ['Eine große Ballade', 4, skill + .1, 'Hohe Töne, viel Gefühl.'], ['Ein wilder Disco-Hit', 3, skill + .3, 'Tempo, Show und Glitzer.']];
    function round() {
      GL.ui.menu('Karaoke-Wettbewerb · Lied ' + (i + 1) + ' von 3', 'Du hast <b>' + pts + '</b> Punkte. Welches Lied singst du?', SONGS.map(function (s) {
        return { e: '🎤', t: s[0], s: s[3] + ' (bis ' + s[1] + ' Punkte)', fn: function () { var got = Math.random() < s[2] ? s[1] : 1; pts += got; GL.core.sfx(got >= s[1] ? 'ok' : 'tap'); GL.life.advance(30); if (++i < 3) round(); else finish(); } };
      }), 'event');
    }
    function finish() {
      var d = L().day, sc = RIV.map(function (n, k) { return { n: n, p: 4 + hash(d * 7 + k) % 6 }; }), me = { n: GL.S.name, p: pts, me: 1 };
      sc.push(me); sc.sort(function (a, b) { return b.p - a.p || (b.me ? 1 : -1); }); var rank = sc.indexOf(me) + 1, prize = [0, 60, 30, 15, 0][rank], gl = [0, 30, 15, 5, 0][rank], soc = [0, 18, 14, 10, 6][rank];
      ev().kara = d; GL.life.change({ energy: -10, stress: -8, social: soc }, rank <= 2 ? 5 : 2); if (prize) GL.eco.earn(prize, 'Karaoke-Wettbewerb Platz ' + rank); if (gl) GL.core.gain(gl); GL.save(); GL.core.sfx(rank <= 3 ? 'ok' : 'tap');
      GL.ui.menu('Platz ' + rank + ' von 4', sc.map(function (x, k) { return (k + 1) + '. ' + GL.core.esc(x.me ? GL.S.name + ' (du)' : x.n) + ': ' + x.p + ' Punkte'; }).join('<br>') + '<br><br>' + (rank === 1 ? '<b>Du hast gewonnen!</b> ' : rank === 4 ? 'Nicht jeder Abend ist ein Sieg, aber der Applaus war ehrlich. ' : '') + '<small>' + (prize ? '+' + prize + ' € · ' : '') + (gl ? '+' + gl + ' Glitzer · ' : '') + 'Kontakte +' + soc + ' · Stress −8</small>', [{ e: '👍', t: 'Weiter', fn: GL.ui.close }], 'event');
    }
    round();
  }

  /* ---------- Pride-Parade ---------- */
  function prideItem() {
    var e = ev(), done = e.pride === L().day, why = !E.prideOpen() ? 'Nur am Parade-Tag (jeder 28. Tag, Sonntag) von 12 bis 18 Uhr.' : done ? 'Du bist heute schon mitgelaufen.' : L().needs.energy < 20 ? 'Du bist zu müde.' : '';
    return { e: '🏳️‍🌈', t: 'Pride-Parade mitgehen', s: why || 'Drei Stunden mit Musik, Konfetti und Leuten aus der ganzen Stadt.', dis: !!why, fn: function () { GL.ui.close(); parade(); } };
  }
  function parade() {
    GL.ui.fade('Die Parade zieht durch Rainbow City …', function () {
      ev().pride = L().day; GL.life.advance(180); GL.life.change({ social: 25, stress: -10, energy: -12, hygiene: -6 }, 6); GL.core.gain(40); GL.save();
      var W = GL.W; if (W) { W.parade = 10; W.conf.visible = true; }
      GL.core.banner('PRIDE-PARADE!', '+40 Glitzer · Kontakte +25 · Stress −10'); GL.core.sfx('ok'); GL.emit('pride', L().day);
    }, 1200);
  }
  GL.jobs.extras.push(function (id) { return id === 'kara' ? [karaItem()] : id === 'stage' ? [prideItem()] : null; });

  GL.phone.register('events', 'Events', '🎉', function () {
    var d = L().day, k = E.nextDay(E.karaDay), p = E.nextDay(E.prideDay);
    function when(x) { return x === d ? 'heute' : x === d + 1 ? 'morgen' : 'in ' + (x - d) + ' Tagen (' + DAYS[(x - 1) % 7] + ')'; }
    return '<div class="pcard"><b>🏆 Karaoke-Wettbewerb</b><br><small class="sub">Jeden Freitag 19–23 Uhr, Karaoke Mikro-Mimosa. Nächster Termin: <b>' + when(k) + '</b>.' + (ev().kara === d ? ' Du hast heute schon mitgemacht.' : '') + '</small></div>' +
      '<div class="pcard"><b>🏳️‍🌈 Pride-Parade</b><br><small class="sub">Jeder 28. Tag (Sonntag) 12–18 Uhr, Treffpunkt Regenbogen-Bühne. Nächster Termin: <b>' + when(p) + '</b>.' + (ev().pride === d ? ' Du bist heute mitgelaufen.' : '') + '</small></div>';
  });
})();
