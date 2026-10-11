/* GayLife – Hauptgeschichte „Ein Leben in allen Farben“: Das Regenbogen-Zentrum von Tante Gerda soll schließen.
   Fünf Kapitel mit messbaren Zielen aus den übrigen Systemen (Freundschaften, Spenden, Viertel, Entscheidungen), danach eine Abstimmung im Stadtrat.
   Der Ausgang hängt von deinen Taten ab (drei Enden). Danach geht das Leben weiter. S.story = { ch, don, plan, fest, vis, end, pts, tea } */
(function () {
  'use strict';
  var S = GL.S, L = S.life, ST = GL.story = {};
  function s() { return S.story; }
  var NEED_DON = 200, NEED_SUP = 3, NEED_VIS = 4;
  function gerda() { return GL.core.NPCDEF.filter(function (x) { return x.id === 'gerda'; })[0]; }
  function say(lines, cb) { var g = gerda(); GL.core.say(g.n, g.look, lines, cb); }
  ST.sup = function () { return Object.keys(S.rel).filter(function (id) { return GL.social.npc(id) && id !== 'gerda' && S.rel[id].f >= 30; }).length; };
  ST.vis = function () { return Object.keys(s().vis).length; };
  ST.bonus = function () { var e = s().end; return e === 'saved' ? 4 : e === 'compromise' ? 2 : 0; };
  var CH = [null,
    { t: 'Der Brief', obj: 'Gewinne ' + NEED_SUP + ' Menschen als Unterstützer (Freundschaft ab 30 mit anderen Leuten im Kiez).', prog: function () { return Math.min(NEED_SUP, ST.sup()) + ' von ' + NEED_SUP; }, ok: function () { return ST.sup() >= NEED_SUP; } },
    { t: 'Spendenaktion', obj: 'Sammle ' + NEED_DON + ' € für das Zentrum: Spenden bei Gerda oder ein gelungener Tanzabend im Club (Benefiz).', prog: function () { return Math.min(NEED_DON, s().don) + ' von ' + NEED_DON + ' €'; }, ok: function () { return s().don >= NEED_DON; } },
    { t: 'Der Stadtrat', obj: 'Entscheide mit Gerda, wie ihr vor dem Stadtrat auftretet.', prog: function () { return s().plan ? 'entschieden' : 'offen'; }, ok: function () { return !!s().plan; } },
    { t: 'Das Straßenfest', obj: 'Fahre mit der Tram in ' + NEED_VIS + ' verschiedene Viertel, lade Leute ein, und plane mit Gerda das Fest.', prog: function () { return Math.min(NEED_VIS, ST.vis()) + ' von ' + NEED_VIS + ' Vierteln' + (s().fest ? ', Fest geplant' : ''); }, ok: function () { return ST.vis() >= NEED_VIS && !!s().fest; } },
    { t: 'Die Abstimmung', obj: 'Sprich mit Gerda, wenn du bereit bist. Mehr Unterstützer, Spenden und ein Partner an deiner Seite helfen.', prog: function () { return 'Chancen: ' + chance(); }, ok: function () { return false; } }];
  ST.CH = CH;

  function score() {
    var p = s().pts || {}, partner = Object.keys(S.rel).some(function (id) { return S.rel[id].st === 'partner'; });
    return Math.min(6, ST.sup()) + (s().don >= NEED_DON ? 2 : 0) + (s().don >= 400 ? 1 : 0) + (partner ? 1 : 0) + (p.plan || 0) + (p.fest || 0);
  }
  ST.score = score;
  function chance() { var v = score(); return v >= 11 ? 'sehr gut' : v >= 8 ? 'gut' : v >= 6 ? 'offen' : 'schlecht'; }

  /* Dialoge je Kapitel: [Zeilen beim Abschluss, Glitzer, Euro] */
  var DONE = {
    1: [['„Du hast Freunde gefunden. Das ist mehr wert als jeder Anwalt, Schatz.“', 'Gerda zieht einen zerknüllten Brief aus der Strickjacke: „Die Immobilienfirma Falk & Söhne will das Haus kaufen. Ein Hochhaus soll hin, ohne Platz für uns. Am Ende des Monats stimmt der Stadtrat ab.“', '„Wir brauchen Geld für den Mietrückstand und einen Plan. Das Zentrum gehört nicht Gerda, das gehört euch allen.“'], 40, 0],
    2: [['„Zweihundert Euro. Und so viel Herz dazu. Ich muss mir kurz die Nase putzen.“', 'Sie lacht und weint gleichzeitig. „Der Mietrückstand ist bezahlt. Jetzt müssen wir noch den Stadtrat überzeugen.“'], 60, 40],
    3: [['„Gut. Dann machen wir es so. Ich suche meine gute Bluse raus.“'], 40, 0],
    4: [['„Das Straßenfest war ein Traum. Ich habe die ganze Stadt tanzen sehen. Sogar der Bürgermeister hat Konfetti im Anzug.“', '„Nächste Woche ist die Abstimmung. Sprich mich an, wenn du bereit bist.“'], 80, 30]
  };
  var END = {
    saved: ['Der Stadtrat stimmt mit 7 zu 2 für das Zentrum. Gerda springt auf und wirft ihre Strickjacke in die Luft.', 'Die Immobilienfirma zieht sich zurück. Aus dem Zentrum wird ein Haus mit Café, Beratung und Tanzraum für ganz Rainbow City.', '„Ein Leben in allen Farben“, sagt Gerda. „Und du hast dazu gemalt.“'],
    compromise: ['Es wird knapp: 5 zu 4. Das Zentrum bleibt, aber in kleineren Räumen, und die Firma baut daneben.', 'Gerda hakt sich bei dir ein. „Nicht alles gewonnen. Aber nichts verloren, was uns wichtig ist.“'],
    lost: ['Der Stadtrat stimmt knapp gegen das Zentrum. Gerda bleibt gefasst, bis sie draußen ist, dann nimmt sie dich in den Arm.', '„Ein Haus kann man abreißen. Menschen nicht. Wir treffen uns künftig im Café Sonntag, und wir geben nicht auf.“']
  };
  var END_REW = { saved: [300, 150, 'Das Regenbogen-Zentrum ist gerettet!'], compromise: [150, 60, 'Das Zentrum bleibt, kleiner aber lebendig.'], lost: [50, 0, 'Das Zentrum schließt, aber die Gemeinschaft bleibt.'] };

  function advance() {
    var c = s().ch, d = DONE[c]; if (!d) return;
    say(d[0], function () { s().ch++; GL.core.gain(d[1]); if (d[2]) GL.eco.earn(d[2], 'Dank von Gerda'); GL.core.banner('Kapitel ' + c + ' abgeschlossen: ' + CH[c].t, '+' + d[1] + ' Glitzer' + (d[2] ? ' · +' + d[2] + ' €' : '')); GL.core.sfx('ok'); GL.save(); GL.phone && GL.phone.refresh && GL.phone.refresh(); });
  }
  function decideStage() {
    var sup = ST.sup(), friend = (S.rel.gerda && S.rel.gerda.f) || 0;
    GL.ui.menu('Der Stadtrat', 'Gerda: „Wie treten wir auf?“ Jede Wahl ist stark, wenn sie zu deiner Lage passt.', [
      { e: '📣', t: 'Laut und sichtbar', s: 'Demo vor dem Rathaus. Stark mit vielen Unterstützern (jetzt ' + sup + ', ab 5 am stärksten).', fn: function () { pickPlan('loud', sup >= 5 ? 2 : 1); } },
      { e: '🤝', t: 'Ruhig und im Gespräch', s: 'Einzelgespräche mit den Ratsleuten. Stark, wenn Gerda dir vertraut (Freundschaft jetzt ' + friend + ', ab 40 am stärksten).', fn: function () { pickPlan('calm', friend >= 40 ? 2 : 1); } },
      { e: '📸', t: 'Über die Medien', s: 'Geschichten und Bilder verbreiten. Stark mit Bekanntheit (Glitzer jetzt ' + GL.core.fmt(S.glitzer) + ', ab 500 am stärksten).', fn: function () { pickPlan('media', S.glitzer >= 500 ? 2 : 1); } },
      { e: '✖', t: 'Später entscheiden', fn: GL.ui.close }], 'story');
  }
  function pickPlan(k, pts) { s().plan = k; s().pts.plan = pts; GL.ui.close(); GL.save(); advance(); }
  function festStage() {
    if (ST.vis() < NEED_VIS) { say(['„Wir müssen die ganze Stadt einladen, Schatz. Du warst erst in ' + ST.vis() + ' Vierteln. Fahre mit der Tram und rede mit den Leuten, ' + NEED_VIS + ' sollten es sein.“']); return; }
    GL.ui.menu('Das Straßenfest', 'Was soll im Mittelpunkt stehen?', [
      { e: '🎶', t: 'Live-Musik (50 €)', s: 'Bühne und Anlage mieten, volle Wirkung.', dis: L.money < 50, fn: function () { pickFest('musik', 50, 2); } },
      { e: '🍲', t: 'Gemeinsames Essen (30 €)', s: 'Eine lange Tafel für alle, volle Wirkung.', dis: L.money < 30, fn: function () { pickFest('essen', 30, 2); } },
      { e: '🧵', t: 'Mit eigenen Mitteln (gratis)', s: 'Selbstgemachtes Fest, kleinere Wirkung.', fn: function () { pickFest('selbst', 0, 1); } },
      { e: '✖', t: 'Später', fn: GL.ui.close }], 'story');
  }
  function pickFest(k, cost, pts) { if (cost && !GL.eco.spend(cost, 'Straßenfest')) return; s().fest = k; s().pts.fest = pts; GL.ui.close(); GL.life.advance(120); GL.life.change({ social: 25, stress: -10, energy: -10 }, 6); GL.save(); advance(); }
  function donate() {
    GL.ui.menu('Spenden', 'Gespendet: ' + s().don + ' €. Ziel: ' + NEED_DON + ' €. Dein Konto: ' + Math.floor(L.money) + ' €.', [25, 50, 100].map(function (a) {
      return { e: '💶', t: a + ' € spenden', dis: L.money < a, fn: function () { if (GL.eco.spend(a, 'Spende fürs Zentrum')) { s().don += a; GL.save(); GL.core.sfx('ok'); } GL.ui.close(); donate(); } };
    }).concat([{ e: '↩', t: 'Zurück', fn: function () { GL.ui.close(); } }]), 'story');
  }
  function vote() {
    var v = score(), end = v >= 11 ? 'saved' : v >= 7 ? 'compromise' : 'lost';
    GL.ui.menu('Die Abstimmung', 'Stand deiner Vorbereitung: <b>' + chance() + '</b> (Unterstützer ' + ST.sup() + ', Spenden ' + s().don + ' €, Plan ' + (s().plan || '–') + ', Fest ' + (s().fest || '–') + '). Danach gibt es kein Zurück.', [
      { e: '🏛️', t: 'Zur Abstimmung gehen', fn: function () { GL.ui.close(); finale(end); } },
      { e: '⏳', t: 'Noch vorbereiten', s: 'Unterstützer gewinnen, spenden, einen Partner finden.', fn: GL.ui.close }], 'story');
  }
  function finale(end) {
    GL.ui.fade('Im Rathaus … 🏛️', function () {
      GL.life.advance(180); var r = END_REW[end]; s().end = end; s().ch = 6; GL.core.gain(r[0]); if (r[1]) GL.eco.earn(r[1], 'Belohnung Stadtrat'); GL.life.change({ stress: -20, social: 15 }, 10); GL.save();
      say(END[end], function () { GL.core.banner(r[2], '+' + r[0] + ' Glitzer' + (r[1] ? ' · +' + r[1] + ' €' : '')); GL.core.sfx('ok'); GL.save(); });
    }, 900);
  }
  function chapterMenu(n, base) {
    var c = s().ch, items = [];
    if (c >= 1 && c <= 5) {
      var ch = CH[c];
      items.push({ e: '📖', t: 'Kapitel ' + c + ': ' + ch.t, s: ch.obj + ' · ' + ch.prog(), fn: function () { GL.ui.close(); action(); } });
      if (c === 2) items.push({ e: '💶', t: 'Spenden', s: s().don + ' von ' + NEED_DON + ' €', fn: function () { GL.ui.close(); donate(); } });
    } else if (c === 6) {
      items.push({ e: '☕', t: 'Kaffee und Plausch mit Gerda', s: s().tea === L.day ? 'Heute schon gehabt.' : 'Eine halbe Stunde, ' + (s().end === 'lost' ? 'im Café Sonntag' : 'im Zentrum') + '. Kontakte +12, Stress −8.', dis: s().tea === L.day, fn: function () { GL.ui.close(); tea(); } });
    }
    items.push({ e: '🗨️', t: 'Anliegen und Aufträge', s: 'Das Übliche.', fn: function () { GL.ui.close(); base(n); } });
    GL.ui.menu('Tante Gerda', c >= 1 && c <= 5 ? 'Es geht um das Regenbogen-Zentrum.' : c === 6 ? 'Das Zentrum: ' + END_REW[s().end][2] : '', items.concat([{ e: '👋', t: 'Tschüss', fn: GL.ui.close }]), 'talk');
  }
  function tea() { s().tea = L.day; GL.ui.fade('Kaffee mit Gerda … ☕', function () { GL.life.advance(30); GL.life.change({ social: 12, stress: -8 }, 3); if (S.rel.gerda) S.rel.gerda.f = GL.clamp(S.rel.gerda.f + 2, 0, 100); GL.save(); GL.core.toast('Gerda erzählt von früher. Kontakte +12, Stress −8'); }, 800); }
  function action() {
    var c = s().ch;
    if (c === 3 && !s().plan) return decideStage();
    if (c === 4 && !s().fest) return festStage();
    if (c === 5) return vote();
    if (CH[c].ok()) return advance();
    say([({ 1: '„Ich brauche Leute, die hinter dem Zentrum stehen, Schatz. Sprich mit anderen im Kiez, werde ihr Freund. Ihr Wort zählt im Rathaus.“', 2: '„Jeder Euro hilft. Spende bei mir oder tanze im Club für den guten Zweck, die Gäste legen etwas in die Box.“', 4: '„Das Fest braucht Leute aus allen Vierteln. Nimm die Tram, besuche die anderen Ecken von Rainbow City und lade sie ein.“' })[c] || '„Wir sind auf dem Weg.“', 'Fortschritt: ' + CH[c].prog()]);
  }
  /* Einstieg: Gerda spricht dich ab Tag 3 an */
  GL.on('talkMenu', function (n, base) {
    if (n.d.id !== 'gerda') return;
    var c = s().ch;
    if (c === 0) {
      if (L.day < 3) return;
      GL.ui.close(); say(['Gerda sieht blass aus und knetet einen Brief. „Ach, Schatz, gut, dass du da bist. Ich muss mit jemandem reden.“', '„Das Regenbogen-Zentrum, mein Lebenswerk, soll geschlossen werden. Ein Investor will das Haus. Ich schaffe das nicht allein.“', '„Hilfst du mir? Es ist keine Pflicht, das Leben geht weiter. Aber es wäre schön.“'], function () {
        GL.ui.menu('Tante Gerda', 'Willst du dem Regenbogen-Zentrum helfen?', [
          { e: '💪', t: 'Ja, ich helfe dir', fn: function () { s().ch = 1; GL.ui.close(); GL.core.banner('Neue Geschichte', 'Das Regenbogen-Zentrum'); GL.core.sfx('ok'); GL.save(); say(['„Danke, mein Schatz. Zuerst brauchen wir Menschen, die hinter uns stehen. Such dir ' + NEED_SUP + ' Freunde im Kiez.“']); } },
          { e: '⏳', t: 'Ich muss darüber nachdenken', fn: GL.ui.close }], 'story');
      });
      return true;
    }
    GL.ui.close(); chapterMenu(n, base); return true;
  });
  /* Ereignisse aus anderen Systemen */
  GL.on('district', function (id) { if (s().ch >= 1 && s().ch <= 5 && id !== 'kiez') { s().vis[id] = 1; GL.save(); } });
  GL.on('danced', function (pts) {
    if (s().ch !== 2 || pts < 3 || !GL.night || !GL.night.state().paid) return;
    var add = 15 + pts * 5; s().don += add; GL.save(); GL.core.toast('Benefiz-Tanzabend: Die Gäste spenden ' + add + ' € fürs Zentrum.');
  });

  /* Handy-App „Geschichte“ */
  GL.phone.register('story', 'Geschichte', '📖', function () {
    var c = s().ch, h = '';
    if (c === 0) return '<p class="sub">Die Hauptgeschichte beginnt, wenn du ab Tag 3 mit Tante Gerda sprichst. Sie ist meist am Brunnenplatz, im Café Sonntag oder im Park.</p>';
    h += '<div class="pcard"><b>Ein Leben in allen Farben</b><br><small class="sub">Das Regenbogen-Zentrum soll schließen. Hilf Tante Gerda.</small></div>';
    for (var i = 1; i <= 5; i++) {
      var st = i < c || c === 6 ? '✅' : i === c ? '▶️' : '⚪';
      h += '<div class="pcard">' + st + ' <b>Kapitel ' + i + ': ' + CH[i].t + '</b>' + (i === c ? '<br><small class="sub">' + GL.core.esc(CH[i].obj) + '<br><b>' + GL.core.esc(CH[i].prog()) + '</b></small>' : '') + '</div>';
    }
    if (c === 6) h += '<div class="pcard"><b>Ende: ' + GL.core.esc(END_REW[s().end][2]) + '</b></div>';
    else if (s().plan || s().fest) h += '<div class="pcard"><small class="sub">Entscheidungen: ' + (s().plan ? 'Auftritt „' + s().plan + '“' : '') + (s().fest ? ' · Fest „' + s().fest + '“' : '') + '</small></div>';
    return h;
  });
})();
