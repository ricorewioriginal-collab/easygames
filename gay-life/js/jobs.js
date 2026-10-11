/* GayLife – weitere Jobs neben dem Barkeeper: Verkäufer (Boutique Fabelhaft), Fitnesstrainer (Muckibude), Fotograf (Studio Klappe Auf), DJ (Regenbogen-Bühne).
   Eine Schicht dauert 4 Stunden und besteht aus drei Situationen mit je drei Antworten (0–2 Punkte). Lohn = Stundenlohn nach Stufe plus Leistungsbonus × Laune.
   Stufen steigen mit Erfahrung und bringen Titel und mehr Lohn. Höchstens 2 Schichten pro Tag, nur zu den Öffnungszeiten, nicht bei Erschöpfung.
   S.jobs[id] = { xp, shifts, earned }, S.jobs.day = { d, n } */
(function () {
  'use strict';
  var S = GL.S, L = S.life, J = GL.jobs = {};
  var JOBS = {
    shop: { n: 'Verkäufer', place: 'Boutique Fabelhaft', g: 'style', base: 9, from: 10, to: 20, cost: { energy: -12, stress: 6, social: 6 }, titles: ['Aushilfe', 'Verkäufer', 'Stylist', 'Filialleiter'],
      sc: [
        ['Jemand sucht ein Outfit für die Pride-Parade.', [['Bunt, mutig und bequem zum Tanzen zusammenstellen', 2], ['Nach dem Budget fragen und dann mischen', 1], ['Das teuerste Teil empfehlen', 0]]],
        ['Ein Kunde ist unsicher, ob ihm die Jacke steht.', [['Ehrlich sagen, was gut sitzt, und eine Alternative zeigen', 2], ['„Steht dir alles!“', 0], ['Den Spiegel entscheiden lassen', 1]]],
        ['Kurz vor Ladenschluss wollen drei Leute gleichzeitig bedient werden.', [['Reihenfolge freundlich klären, Wartenden ein Getränk anbieten', 2], ['Alle gleichzeitig halb bedienen', 0], ['Nur den ersten bedienen', 1]]],
        ['Eine Hose ist falsch ausgezeichnet.', [['Preis prüfen, entschuldigen, den richtigen Preis machen', 2], ['Zum falschen Preis verkaufen, damit es schnell geht', 0], ['Chef fragen und warten lassen', 1]]],
        ['Eine Kundin will umtauschen, hat aber keinen Bon.', [['Kulanz anbieten: Gutschein statt Geld', 2], ['Glatt ablehnen', 0], ['Umtauschen, ohne zu fragen', 1]]]] },
    gym: { n: 'Fitnesstrainer', place: 'Muckibude Muskelkater', g: 'gym', base: 10, from: 8, to: 21, cost: { energy: -22, stress: -4, hygiene: -20, hunger: -12 }, titles: ['Praktikant', 'Trainer', 'Personal Trainer', 'Studioleiter'],
      sc: [
        ['Ein Neuling will sofort das schwerste Gewicht stemmen.', [['Technik zeigen und mit leichtem Gewicht anfangen', 2], ['Machen lassen', 0], ['Verbieten', 1]]],
        ['Jemand klagt über Schmerzen im Knie.', [['Pause, Übung anpassen, bei Anhalten zum Arzt raten', 2], ['„Durchbeißen!“', 0], ['Nach Hause schicken', 1]]],
        ['Eine Gruppe verliert mittendrin die Lust.', [['Musik drehen, Spiel daraus machen', 2], ['Strenger werden', 0], ['Die Einheit verkürzen', 1]]],
        ['Ein Kunde will schnell 10 Kilo abnehmen.', [['Realistisches Ziel setzen und Plan machen', 2], ['Crash-Diät empfehlen', 0], ['Nicken und kassieren', 1]]],
        ['Das Gerät ist kaputt, das Studio ist voll.', [['Schild aufstellen und Alternativen anbieten', 2], ['Ignorieren', 0], ['Studio schließen', 1]]]] },
    cast: { n: 'Fotograf', place: 'Studio Klappe Auf', g: 'cast', base: 11, from: 10, to: 20, cost: { energy: -14, stress: 4, social: 4 }, titles: ['Assistent', 'Fotograf', 'Bildredakteur', 'Studioinhaber'],
      sc: [
        ['Ein Paar ist nervös vor der Kamera.', [['Witz erzählen, erst Probebilder machen', 2], ['Sofort Anweisungen geben', 1], ['Schweigend knipsen', 0]]],
        ['Das Licht ist zu hart.', [['Diffusor aufbauen und Position ändern', 2], ['Nachbearbeiten und hoffen', 1], ['Weiter wie bisher', 0]]],
        ['Jemand mag sich auf keinem Foto.', [['Gemeinsam das beste auswählen, ehrlich loben', 2], ['Alles stark bearbeiten', 1], ['Achselzucken', 0]]],
        ['Eine Gruppe will ein Foto mit zwölf Leuten.', [['Reihen bilden, mehrere Aufnahmen, Augen prüfen', 2], ['Einmal drücken', 0], ['Aufteilen in Zweiergruppen', 1]]],
        ['Eine Kundin ist mit den Bildern unzufrieden.', [['Zuhören und kostenlos nachbessern', 2], ['Auf den Vertrag verweisen', 0], ['Rabatt geben, ohne nachzufragen', 1]]]] },
    stage: { n: 'DJ', place: 'Regenbogen-Bühne', g: 'rave', base: 12, from: 20, to: 2, cost: { energy: -18, stress: -6, social: 12 }, need: 'Barkeeper-Stufe 2', titles: ['Warm-up-DJ', 'Resident-DJ', 'Headliner', 'Festival-Star'],
      sc: [
        ['Die Tanzfläche ist halb leer.', [['Bekanntes Lied spielen und langsam steigern', 2], ['Sofort Gas geben', 0], ['Pause machen', 1]]],
        ['Jemand wünscht sich ein ganz anderes Genre.', [['Freundlich vertrösten, später einbauen', 2], ['Ablehnen', 0], ['Kurzfristig umswitchen', 1]]],
        ['Ein Übergang geht schief, kurz Stille.', [['Ruhig bleiben, mit Effekt übergehen', 2], ['Entschuldigend ins Mikro', 1], ['Panisch alles neu starten', 0]]],
        ['Die Menge will eine Zugabe.', [['Euphorie nutzen: ein Hit, dann sauberer Schluss', 2], ['Doppelt so lang spielen', 1], ['Ablehnen', 0]]],
        ['Der Bass übertönt die Gespräche an der Bar.', [['Lautstärke etwas senken, Tiefen regeln', 2], ['Egal, ist ein Club', 0], ['Alles leiser', 1]]]] }
  };
  J.JOBS = JOBS;
  function st(id) { return S.jobs[id] || (S.jobs[id] = { xp: 0, shifts: 0, earned: 0 }); }
  J.level = function (id) { return Math.min(8, Math.floor(Math.sqrt(st(id).xp / 30)) + 1); };
  J.title = function (id) { var t = JOBS[id].titles; return t[Math.min(t.length - 1, Math.floor((J.level(id) - 1) / 2))]; };
  function isOpen(j) { var h = GL.life.hour(); return j.from < j.to ? h >= j.from && h < j.to : h >= j.from || h < j.to; }
  function today() { var d = S.jobs.day; if (!d || d.d !== L.day) d = S.jobs.day = { d: L.day, n: 0 }; return d; }
  function why(id) {
    var j = JOBS[id];
    if (id === 'stage' && GL.eco.barLevel() < 2) return 'Bruno empfiehlt dich ab Barkeeper-Stufe 2.';
    if (!isOpen(j)) return 'Geöffnet ' + j.from + '–' + j.to + ' Uhr.';
    if (L.needs.energy < 25) return 'Du bist zu müde für eine Schicht.';
    if (today().n >= 2) return 'Heute schon zwei Schichten. Ruh dich aus.';
    return '';
  }
  J.why = why;
  J.shift = function (id) {
    var j = JOBS[id], pool = j.sc.slice().sort(function () { return Math.random() - .5; }).slice(0, 3), i = 0, pts = 0;
    function scene() {
      var q = pool[i], o = q[1].slice().sort(function () { return Math.random() - .5; });
      GL.ui.menu(j.n + ' · ' + j.place, 'Situation ' + (i + 1) + ' von 3: ' + GL.core.esc(q[0]), o.map(function (a) {
        return { e: '▸', t: a[0], fn: function () { pts += a[1]; GL.core.sfx(a[1] === 2 ? 'ok' : a[1] ? 'tap' : 'no'); if (++i < 3) scene(); else done(); } };
      }), 'job');
    }
    function done() {
      GL.ui.close(); var f = GL.life.moodFactor(), lv = J.level(id), wage = Math.round(4 * j.base * (1 + .08 * (lv - 1))), bonus = Math.round(pts * (3 + lv) * f), s = st(id), lv0 = lv;
      GL.ui.fade('Schicht: ' + j.n + ' …', function () {
        GL.life.advance(240); GL.life.change(j.cost, pts >= 5 ? 4 : pts >= 3 ? 1 : -3);
        GL.eco.earn(wage + bonus, 'Schicht: ' + j.n); s.shifts++; s.earned += wage + bonus; s.xp += 10 + pts * 3; today().n++; GL.save();
        var lv1 = J.level(id);
        GL.ui.menu('Schicht beendet', 'Lohn ' + wage + ' € + Leistungsbonus ' + bonus + ' € (' + pts + ' von 6 Punkten, Laune ×' + f.toFixed(2).replace('.', ',') + ') = <b>' + (wage + bonus) + ' €</b><br><small>4 Std. vergangen</small>' +
          (lv1 > lv0 ? '<br><b>Aufstieg! Stufe ' + lv1 + ': ' + J.title(id) + '</b>' : ''), [{ e: '👍', t: 'Weiter', fn: GL.ui.close }], 'job');
      }, 900);
    }
    scene();
  };
  /* Beim Betreten des Gebäudes: Arbeiten oder das Minispiel */
  GL.on('poi', function (id) {
    var j = JOBS[id]; if (!j) return;
    var r = why(id), s = st(id), g = GL.core.gameOf(j.g);
    GL.ui.menu(j.place, 'Job: <b>' + j.n + '</b> · Stufe ' + J.level(id) + ' (' + J.title(id) + ') · ' + s.shifts + ' Schichten, ' + s.earned + ' € verdient', [
      { e: '💼', t: 'Arbeiten: ' + j.n, s: r || 'Vier Stunden, drei Situationen. Stundenlohn ' + j.base + ' € plus Bonus.', dis: !!r, fn: function () { GL.ui.close(); J.shift(id); } },
      { e: '🎮', t: 'Minispiel: ' + g.n, fn: function () { GL.ui.close(); GL.core.openGame(g); } },
      { e: '✖', t: 'Schließen', fn: GL.ui.close }], 'job');
    return true;
  });
  J.card = function () {
    var rows = Object.keys(JOBS).filter(function (i) { return st(i).shifts > 0; }).map(function (i) { return JOBS[i].n + ' (Stufe ' + J.level(i) + ', ' + J.title(i) + '): ' + st(i).shifts + ' Schichten, ' + st(i).earned + ' €'; });
    return rows.length ? '<div class="pcard"><b>💼 Weitere Jobs</b><br><small class="sub">' + rows.map(GL.core.esc).join('<br>') + '</small></div>' : '';
  };
})();
