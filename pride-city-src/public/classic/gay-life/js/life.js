/* GayLife – Alltag: Uhrzeit und Wochentag, Bedürfnisse, Stimmung, Auswirkungen von Aktivitäten, Status-Anzeige.
   Zeitmodell: S.world.t ist der Tagesanteil (0 = 6:00 Uhr, 0.25 = Mittag, 0.75 = Mitternacht), S.life.day zählt die Tage (Tag 1 = Montag).
   Ein Spieltag dauert 16 echte Minuten, solange man sich in der Stadt bewegt. Aktivitäten (Minispiele, Schlafen, Kochen …) spulen die Zeit vor. */
(function () {
  'use strict';
  var S = GL.S, L = S.life, clamp = GL.clamp;
  var DAY_SEC = 960;
  var WD = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
  var NEED = [
    ['energy', 'Energie', '⚡', 'Schlafen im eigenen Bett, Kaffee im Späti'],
    ['hunger', 'Satt', '🍝', 'Kochen in der Küche, Essen im Späti'],
    ['hygiene', 'Hygiene', '🚿', 'Duschen zu Hause, Sauna'],
    ['social', 'Kontakte', '💬', 'Mit Leuten reden, Dates, Karaoke, Rave'],
    ['stress', 'Stress', '🌀', 'Fernsehen, Sauna, Schlaf, Sport senken ihn']
  ];
  // Veränderung pro Spielstunde
  var AWAKE = { energy: -4, hunger: -5, hygiene: -3.5, social: -2.5 }, SLEEP = { energy: 12.5, hunger: -2, hygiene: -1, social: 0, stress: -5 };
  var life = GL.life = { NEED: NEED, WD: WD };

  function hourF() { return (S.world.t * 24 + 6) % 24; }
  life.hour = hourF;
  life.weekday = function () { return WD[(L.day - 1) % 7]; };
  life.clock = function () { var h = hourF(), m = Math.floor((h % 1) * 60); return ('0' + Math.floor(h)).slice(-2) + ':' + ('0' + m).slice(-2); };
  life.stamp = function () { return 'Tag ' + L.day + ' · ' + WD[(L.day - 1) % 7].slice(0, 2) + ' ' + life.clock(); };
  life.isNight = function () { var h = hourF(); return h >= 21 || h < 6; };

  function n(k) { return L.needs[k]; }
  life.mood = function () {
    var v = (n('energy') + n('hunger') + n('hygiene') + n('social') + (100 - n('stress'))) / 5 + L.boost + (GL.furn ? GL.furn.bonus() : 0) + (GL.story ? GL.story.bonus() : 0) + (GL.weather ? GL.weather.bonus() : 0);
    return Math.round(clamp(v, 0, 100));
  };
  life.moodName = function (m) { m = m == null ? life.mood() : m; return m >= 75 ? 'Bestens' : m >= 55 ? 'Gut' : m >= 35 ? 'Geht so' : 'Mies'; };
  life.moodIcon = function (m) { m = m == null ? life.mood() : m; return m >= 75 ? '😄' : m >= 55 ? '🙂' : m >= 35 ? '😐' : '😣'; };
  /* Faktor für Trinkgeld und später Flirts: 0.8 (mies) bis 1.15 (bestens) */
  life.moodFactor = function () { return .8 + life.mood() / 100 * .35; };

  /* Bedürfnisse direkt ändern (z. B. Essen, Duschen) */
  life.change = function (d, boost) {
    for (var k in d) if (L.needs[k] != null) L.needs[k] = clamp(L.needs[k] + d[k], 0, 100);
    if (boost) L.boost = clamp(L.boost + boost, -30, 30);
    checkWarn(); life.hud();
  };

  /* Zeit vorspulen (Minuten). sleeping = Schlafwerte statt Wachwerte */
  life.advance = function (min, sleeping) {
    var steps = Math.max(1, Math.ceil(min / 30)), per = min / steps;
    for (var i = 0; i < steps; i++) passMinutes(per, sleeping);
    checkWarn(); life.hud();
  };
  function passMinutes(min, sleeping) {
    var h = min / 60, r = sleeping ? SLEEP : AWAKE, k;
    for (k in r) L.needs[k] = clamp(L.needs[k] + r[k] * h, 0, 100);
    if (!sleeping) {
      var low = 0; ['energy', 'hunger', 'hygiene', 'social'].forEach(function (q) { if (L.needs[q] < 25) low++; });
      L.needs.stress = clamp(L.needs.stress + (low ? low * 1.5 : -1) * h, 0, 100);
    }
    if (!sleeping && S.home && S.home.partner) L.needs.social = clamp(L.needs.social + h, 0, 100); // zusammenwohnen tut gut
    L.boost = L.boost > 0 ? Math.max(0, L.boost - 10 * h) : Math.min(0, L.boost + 10 * h);
    var t0 = S.world.t, t1 = t0 + min / 1440;
    // Mitternacht liegt bei t = 0.75
    var c0 = Math.floor(t0 - .75), c1 = Math.floor(t1 - .75);
    if (c1 > c0) { L.day += c1 - c0; GL.emit('newDay', L.day); }
    S.world.t = ((t1 % 1) + 1) % 1;
  }

  /* Warnungen nur einmal, bis der Wert wieder gut ist */
  var WARN = { energy: 'Du bist hundemüde. Zeit fürs Bett.', hunger: 'Dein Magen knurrt. Koch was oder hol dir was im Späti.', hygiene: 'Eine Dusche wäre jetzt eine gute Idee.', social: 'Dir fehlen Menschen. Sprich mit jemandem!' };
  function checkWarn() {
    var msg = [];
    for (var k in WARN) {
      if (L.needs[k] < 20 && !L.warn[k]) { L.warn[k] = 1; msg.push(WARN[k]); }
      else if (L.needs[k] > 40 && L.warn[k]) L.warn[k] = 0;
    }
    if (L.needs.stress > 80 && !L.warn.stress) { L.warn.stress = 1; msg.push('Du bist total gestresst. Gönn dir eine Pause.'); }
    else if (L.needs.stress < 60 && L.warn.stress) L.warn.stress = 0;
    if (msg.length && GL.W && GL.W.on) GL.core.toast(msg.join(' '));
  }

  /* Laufende Zeit in der Stadt */
  var hudT = 0;
  GL.on('tick', function (dt, W) {
    passMinutes(dt * 1440 / DAY_SEC, false);
    W.spdMul = L.needs.energy < 15 ? .72 : 1;
    hudT += dt; if (hudT > .5) { hudT = 0; checkWarn(); life.hud(); if (!W.dlg && !L.intro && S.world.intro) intro(); }
  });

  /* Auswirkungen der Minispiele (beim Zurückkehren in die Stadt): Minuten, Bedürfnisse, Stimmung */
  var ACT = {
    dates: [90, { social: 20 }, 8, 'Date im Café'], rave: [90, { energy: -10, social: 12, stress: -10 }, 10, 'Auflegen auf der Bühne'],
    style: [45, {}, 5, 'Shopping in der Boutique'], gym: [60, { energy: -15, hygiene: -20, stress: -15, hunger: -8 }, 5, 'Training'],
    match: [30, { stress: -5 }, 3, 'Arcade'], run: [45, { energy: -10, hygiene: -10 }, 4, 'Festwagen-Test'],
    dance: [60, { energy: -12, hygiene: -10, social: 8, stress: -8 }, 6, 'Tanzstunde'], pool: [60, { energy: -8, stress: -10 }, 5, 'Strandbad'],
    kara: [60, { social: 12 }, 8, 'Karaoke'], sauna: [60, { hygiene: 25, stress: -20, energy: -5 }, 5, 'Sauna'],
    dark: [45, { social: 10 }, 4, 'Dunkelparty'], cast: [45, {}, 5, 'Casting'], quiz: [30, { stress: -3 }, 3, 'Quiz im Buchladen']
  };
  GL.on('activity', function (id) {
    var a = ACT[id]; if (!a) return;
    life.advance(a[0]); life.change(a[1], a[2]);
    var parts = []; for (var k in a[1]) parts.push(NEED.filter(function (x) { return x[0] === k; })[0][2] + (a[1][k] > 0 ? '+' : '') + a[1][k]);
    setTimeout(function () { GL.core.toast(a[3] + ': ' + fmtMin(a[0]) + (parts.length ? ' · ' + parts.join(' ') : '')); }, 300);
    GL.save();
  });
  function fmtMin(m) { return m >= 60 ? (m / 60).toFixed(m % 60 ? 1 : 0).replace('.', ',') + ' Std.' : m + ' Min.'; }
  life.fmtMin = fmtMin;

  /* Status-Anzeige in der Stadt */
  function bar(v, warn) { return '<i class="hb"><b style="width:' + Math.round(v) + '%;background:' + (warn ? '#ff5d6c' : v < 30 ? '#ffb020' : '#3ddc84') + '"></b></i>'; }
  life.hud = function () {
    var h = document.getElementById('hud'); if (!h || !GL.W || !GL.W.on) return;
    var s = '<span class="hc">' + life.weekday().slice(0, 2) + ' ' + life.clock() + '</span><span class="hc">💶 ' + Math.floor(L.money) + ' €</span>';
    NEED.forEach(function (q) { var v = L.needs[q[0]], st = q[0] === 'stress'; s += '<span class="hn" title="' + q[1] + '">' + q[2] + bar(st ? 100 - v : v, st ? v > 80 : v < 20) + '</span>'; });
    h.innerHTML = s + '<span class="hn">' + life.moodIcon() + '</span>';
  };

  function intro() {
    L.intro = 1; GL.save();
    var g = GL.core.NPCDEF.filter(function (x) { return x.id === 'gerda'; })[0];
    GL.core.say('Tante Gerda', g.look, [
      'Schön, dass du jetzt richtig hier wohnst! Der Regenbogenkiez ist das Herz von Rainbow City.',
      'Dein Apartment liegt im Süden am Platz. Dort kannst du schlafen, duschen und kochen.',
      'Achte auf dich: Essen, Schlaf, Dusche und Menschen. Dein Handy (📱 oder Taste P) zeigt Uhrzeit, Bedürfnisse, Geld und die Karte.',
      'Geld verdienst du fürs Erste mit Schichten im Club Glitzer. Lebensmittel gibt es im Späti Lecker an der Hauptstraße zwischen Platz und Apartment.'
    ]);
  }
})();
