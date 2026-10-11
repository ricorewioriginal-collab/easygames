/* GayLife – Nachtleben im Club Glitzer (20–5 Uhr): Eintritt, Themenabende nach Wochentag, Tanzen nach Musikstil, Getränke mit Limit.
   Beim Betreten des Clubs: Arbeiten (Barkeeper-Minispiel), Tanzen, Bestellen oder nur das Minispiel. S.jobs.night = { n (Nacht), paid, drinks, danced } */
(function () {
  'use strict';
  var S = GL.S, L = S.life, N = GL.night = {};
  var THEMES = [
    { n: 'Ruhige Bar', fee: 8, mul: .9, st: 'Lounge' }, { n: '2-für-1-Cocktails', fee: 8, mul: 1, st: 'Pop' }, { n: 'Latin Night', fee: 10, mul: 1.1, st: 'Salsa' },
    { n: 'Drag-Show-Abend', fee: 12, mul: 1.15, st: 'Disco' }, { n: 'Rainbow Night', fee: 15, mul: 1.25, st: 'House' }, { n: 'Glitzer-Nacht', fee: 15, mul: 1.25, st: 'Disco' }, { n: 'Sonntagsparty', fee: 10, mul: 1, st: 'Pop' }
  ];
  /* Stil → [beste Bewegung, passable Bewegung] */
  var STYLE = { Lounge: ['Wiegen', 'Wellen'], Pop: ['Wellen', 'Drehung'], Salsa: ['Hüftschwung', 'Drehung'], Disco: ['Drehung', 'Pose'], House: ['Springen', 'Wellen'], Techno: ['Springen', 'Pose'] };
  var MOVES = ['Wellen', 'Drehung', 'Pose', 'Springen', 'Hüftschwung', 'Wiegen'];
  N.theme = function () { return THEMES[(L.day - 1) % 7]; };
  N.isOpen = function () { var h = GL.life.hour(); return h >= 20 || h < 5; };
  function nt() { var h = GL.life.hour(), k = h < 8 ? L.day - 1 : L.day, o = S.jobs.night; if (!o || o.n !== k) o = S.jobs.night = { n: k, paid: 0, drinks: 0, danced: 0 }; return o; }
  N.state = nt;
  function enter() {
    var o = nt(), t = N.theme(); if (o.paid) return true;
    if (L.money < t.fee) { GL.core.toast('Der Eintritt kostet ' + t.fee + ' €.'); GL.core.sfx('no'); return false; }
    GL.eco.spend(t.fee, 'Eintritt Club Glitzer: ' + t.n); o.paid = 1; GL.save(); return true;
  }
  function menu() {
    var o = nt(), t = N.theme(), open = N.isOpen(), cl = 'Der Club öffnet um 20 Uhr.';
    GL.ui.menu('Club Glitzer', 'Heute: <b>' + GL.core.esc(t.n) + '</b> · Musik ' + t.st + ' · Eintritt ' + t.fee + ' €' + (o.paid ? ' (bezahlt)' : '') + (open ? '' : '<br>' + cl), [
      { e: '🍸', t: 'Arbeiten: Barkeeper', s: 'Das Minispiel mit Schicht und Lohn.', fn: function () { GL.ui.close(); GL.core.openGame(GL.core.gameOf('club')); } },
      { e: '💃', t: 'Tanzen', s: open ? '3 Songs, Bewegung passend zur Musik wählen.' : cl, dis: !open || L.needs.energy < 15, fn: dance },
      { e: '👯', t: 'Gruppentanz mit dem Raum', s: GL.mp && GL.mp.on() ? 'Alle im Mehrspieler-Raum tanzen die gleichen Songs. Wenn alle gut sind, gibt es einen Bonus.' : 'Dafür brauchst du einen Mehrspieler-Raum (👥).', dis: !open || !(GL.mp && GL.mp.on()) || L.needs.energy < 15, fn: function () { GL.ui.close(); GL.multi.startDance(); } },
      { e: '🥂', t: 'Etwas bestellen', s: open ? 'Cocktail 8 €, Wasser gratis. ' + o.drinks + ' von 3 Cocktails.' : cl, dis: !open, fn: drinks },
      { e: '✖', t: 'Schließen', fn: GL.ui.close }], 'club');
  }
  /* opt: { styles:[3 Stile], seed (gemeinsame Reihenfolge der Bewegungen), onDone(pts) } für Gruppentänze */
  function dance(opt) {
    opt = opt && opt.styles ? opt : {};
    if (!enter()) return;
    var o = nt(), t = N.theme(), i = 0, pts = 0, styles = opt.styles || [t.st, t.st === 'Lounge' ? 'Pop' : 'House', ['Pop', 'Salsa', 'Disco', 'Techno'][(L.day + o.danced) % 4]], rnd = Math.random;
    if (opt.seed) { var a = opt.seed >>> 0; rnd = function () { a |= 0; a = a + 0x6D2B79F5 | 0; var q = Math.imul(a ^ a >>> 15, 1 | a); q = q + Math.imul(q ^ q >>> 7, 61 | q) ^ q; return ((q ^ q >>> 14) >>> 0) / 4294967296; }; }
    function round() {
      var s = styles[i], b = STYLE[s], sh = function () { return rnd() - .5; }, mv = MOVES.slice().sort(sh).filter(function (m) { return m === b[0] || m === b[1]; }).concat(MOVES.filter(function (m) { return m !== b[0] && m !== b[1]; }).sort(sh).slice(0, 2)).sort(sh);
      GL.ui.menu('Tanzfläche · Song ' + (i + 1) + ' von 3', 'Der DJ legt <b>' + s + '</b> auf. Was tanzt du?', mv.map(function (m) {
        return { e: '🕺', t: m, fn: function () { var p = m === b[0] ? 2 : m === b[1] ? 1 : 0; pts += p; GL.core.sfx(p === 2 ? 'ok' : p ? 'tap' : 'no'); GL.life.advance(30); GL.life.change({ energy: -7 }, 0); if (++i < 3) round(); else finish(); } };
      }), 'club');
    }
    function finish() {
      o.danced++; var soc = Math.round((8 + pts * 3) * t.mul);
      GL.life.change({ social: soc, stress: -(4 + pts * 2), hygiene: -8 }, pts >= 5 ? 6 : pts >= 3 ? 3 : 0); GL.core.gain(pts); GL.save(); GL.emit('danced', pts);
      if (opt.onDone) { GL.ui.close(); opt.onDone(pts, soc); return; }
      GL.ui.menu('Was für ein Abend', pts >= 5 ? 'Die Tanzfläche gehört dir. Alle wollen mit dir tanzen.' : pts >= 3 ? 'Guter Groove. Du hast viel gelacht.' : 'Nicht jede Bewegung passte, aber der Spaß war da.' + '<br><small>Kontakte +' + soc + ' · Stress −' + (4 + pts * 2) + ' · Hygiene −8</small>', [{ e: '👍', t: 'Weiter', fn: menu }], 'club');
    }
    round();
  }
  function drinks() {
    var o = nt();
    GL.ui.menu('Bar', 'Bruno hinter dem Tresen: „Was darf es sein?“', [
      { e: '🍹', t: 'Cocktail (8 €)', s: o.drinks >= 3 ? 'Bruno: „Genug für heute.“' : 'Kontakte +8, Stress −6', dis: o.drinks >= 3 || L.money < 8, fn: function () {
          if (!enter()) return; if (GL.eco.spend(8, 'Cocktail im Club')) { o.drinks++; GL.life.advance(15); GL.life.change({ social: 8, stress: -6, energy: -3 }, 2); GL.core.sfx('ok'); GL.save(); } drinks(); } },
      { e: '💧', t: 'Wasser (gratis)', s: 'Energie +3', fn: function () { if (!enter()) return; GL.life.advance(5); GL.life.change({ energy: 3 }, 0); GL.save(); GL.core.toast('Schön erfrischend.'); drinks(); } },
      { e: '↩', t: 'Zurück', fn: menu }], 'club');
  }
  N.dance = dance; N.STYLES = Object.keys(STYLE); N.enter = enter;
  GL.on('poi', function (id) {
    if (id !== 'club' || L.needs.energy < 12) return; /* bei Erschöpfung greift der Türsteher in economy.js */
    menu(); return true;
  });
})();
