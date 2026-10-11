/* GayLife – Dating und Beziehungen mit fünf Dating-Figuren (Jonas, Mehmet, Luca, Kai, Dennis).
   S.rel[id] = { met, f (Freundschaft 0–100), talks, last (Tag), r (Romantik 0–100), st ('' | 'partner' | 'ex' | 'closed'),
                 rej (Zurückweisungen), lock (bis Tag kein Flirt), dates, story (0–3), mem [{d,t}], conflict (Tag oder 0), cd (Tag letzte Plauderei), flirtDay, ... }
   Grundsätze: Figuren treffen eigene Entscheidungen. Ablehnung und Grenzen werden respektiert: Wer nicht will, bekommt kein „Nochmal-Versuchen-bis-es-klappt“.
   Alle Szenen sind jugendfrei; Intimität wird nur angedeutet (Szenenwechsel) und nur mit einer Person in fester Beziehung, die selbst zustimmt. */
(function () {
  'use strict';
  var S = GL.S, clamp = GL.clamp;
  var D = GL.dating = {};

  var TOPICS = {
    natur: { n: 'Pflanzen und Natur', q: 'Hast du eigentlich Pflanzen oder gehst du lieber raus?' },
    essen: { n: 'Essen und Kochen', q: 'Was kochst du, wenn du Besuch hast?' },
    sport: { n: 'Sport und Training', q: 'Treibst du eigentlich Sport?' },
    musik: { n: 'Musik', q: 'Welche Musik läuft bei dir rauf und runter?' },
    mode: { n: 'Mode und Stil', q: 'Woher hast du eigentlich dein Outfit?' },
    kunst: { n: 'Kunst und Design', q: 'Hast du zuletzt etwas wirklich Schönes gesehen?' },
    tech: { n: 'Technik und Gadgets', q: 'Bist du eher Team Android oder Team Apfel?' },
    tiere: { n: 'Tiere', q: 'Hast du ein Lieblingstier?' },
    kultur: { n: 'Kino, Bücher und Theater', q: 'Was war dein letzter guter Film oder dein letztes gutes Buch?' },
    party: { n: 'Feiern und Nachtleben', q: 'Wann warst du das letzte Mal so richtig tanzen?' }
  };
  D.TOPICS = TOPICS;
  var LIKE = ['Oh, {t}! Da bin ich sofort dabei.', 'Ausgerechnet {t}. Da hast du einen Nerv getroffen, ich könnte stundenlang erzählen.', 'Du fragst nach {t}? Dann setz dich, das wird länger.'];
  var NEUT = ['Hm, {t}. Ich bin da kein Experte, aber erzähl ruhig.', 'Bei {t} kenne ich mich nur halb aus. Klingt aber nett.'];
  var DISL = ['{t}? Ehrlich gesagt nicht so meins. Aber danke, dass du fragst.', 'Oh je, {t}. Lass uns lieber über etwas anderes reden.'];

  /* Profile: Beruf, Charakter, Ziel, Vorlieben, Abneigungen, Lieblingssätze, Geschichte in drei Kapiteln */
  var PROF = {
    jonas: { job: 'Brunch-Kritiker und Pflanzenpapa', trait: 'gemütlich und romantisch', goal: 'ein eigenes Café zwischen lauter Pflanzen', likes: ['natur', 'essen', 'kultur'], dis: ['sport', 'tech'], into: 1, place: 'cafe',
      fav: { natur: 'Monica, meine Monstera, hat dieses Jahr zwei neue Blätter bekommen. Ich habe geweint.', essen: 'Mein Sonntagsbrunch hat eine Warteliste. Eine echte.', kultur: 'Ich lese Kochbücher wie Romane. Mit Spannungsbogen.' },
      story: ['Ich war mal Buchhalter. Der Brunch war mein Fluchtplan. Am ersten freien Sonntag habe ich sieben Cafés abgeklappert und gedacht: Das will ich auch.', 'Mein Traum ist ein Café, in dem man zwischen Pflanzen sitzt. Das Problem: Die Bank findet mich charmant, aber nicht kreditwürdig.', 'Ich habe ein Ladenlokal im Pride District im Auge, gleich neben dem Community-Zentrum. Hilfst du mir beim Businessplan? Zuhören reicht schon.'] },
    mehmet: { job: 'Personal Trainer und Meal-Prep-Meister', trait: 'ehrgeizig und warmherzig', goal: 'ein Studio, in dem sich niemand beobachtet fühlt', likes: ['sport', 'essen', 'musik'], dis: ['mode'], into: 1, place: 'gym',
      fav: { sport: 'Wenn jemand zum ersten Mal eine Hantel hebt und strahlt, dafür mache ich den Job.', essen: 'Meal-Prep ist meine Liebessprache. Ich habe dir schon eine Box gedanklich gepackt.', musik: 'Beim Training läuft alles, solange es 140 BPM hat.' },
      story: ['Als Kind habe ich nie Sport gemacht, weil mich alle ausgelacht haben. Mit zwanzig bin ich in ein Studio, in dem mich keiner kannte. Seitdem lässt mich das nicht mehr los.', 'Ich will ein Studio aufmachen ohne Spiegelwand und ohne Sprüche. Nur Training, und jede Person darf so aussehen, wie sie ist.', 'Meine Familie versteht nicht ganz, was ich beruflich mache. Meine Mutter schickt mir trotzdem jeden Sonntag Essen. Das ist ihre Art, stolz zu sein.'] },
    luca: { job: 'Influencer, filmt auch dein Dessert', trait: 'schillernd, dahinter ein bisschen unsicher', goal: 'echte Freunde statt Follower', likes: ['mode', 'musik', 'tech', 'party'], dis: ['natur'], into: 1, place: 'plaza',
      fav: { mode: 'Ich trage nichts zweimal. Okay, doch, aber nie auf Fotos.', musik: 'Ich schneide meine Videos nur nach dem Takt. Sonst fühlt sich alles schief an.', tech: 'Mein Ringlicht hat einen eigenen Namen. Es heißt Sonja.', party: 'Auf der Tanzfläche muss ich nichts darstellen. Das ist das Beste.' },
      story: ['Dreißigtausend Follower, und wenn ich krank bin, fragt nur einer, ob ich Hunger habe. Der Lieferdienst.', 'Ich wollte nie berühmt sein. Ich wollte, dass mich jemand versteht. Das Internet hat mir stattdessen Herzchen gegeben.', 'Heute Abend habe ich kein einziges Foto gemacht. Das war ein Ziel: einmal einen Abend nur erleben. Danke, dass du das mitgemacht hast.'] },
    kai: { job: 'Grafikdesigner und Katzenpapa von Pixel', trait: 'still und trocken-humorvoll, geht es langsam an', goal: 'ein Kinderbuch illustrieren', likes: ['kunst', 'tiere', 'tech', 'kultur'], dis: ['party'], into: 1, slow: 1, place: 'plaza',
      fav: { kunst: 'Ich zeichne jeden Morgen zehn Minuten, bevor ich das Handy anfasse.', tiere: 'Pixel sitzt auf meinem Tablet und gibt Feedback. Meistens berechtigt.', tech: 'Ich habe drei Grafiktabletts. Zwei davon sind Reserve für das dritte.' },
      story: ['Ich arbeite viel allein. Das ist bequem, aber ab und zu fehlt jemand, der fragt, ob ich schon gegessen habe.', 'Ich möchte ein Kinderbuch illustrieren. Über einen Kater, der Tischmanieren lernt. Pixel ist das Vorbild, und er hält sich für den Autor.', 'Ich war lange in jemanden verliebt, der es nie erfahren hat. Seitdem gehe ich langsam. Mit dir fällt mir das leichter.'] },
    dennis: { job: 'Spätberufener, Dackelpapa von Gerd', trait: 'herzlich, holt vieles nach', goal: 'endlich ohne Angst leben und feiern', likes: ['tiere', 'natur', 'kultur'], dis: ['tech', 'party'], into: 0, place: 'park',
      fav: { tiere: 'Gerd ist mein Seelenverwandter. Mit vier Beinen und schlechter Laune.', natur: 'Früh morgens im Park gehört die Welt noch den Hunden. Das ist meine Lieblingszeit.', kultur: 'Ich hole gerade alle Filme nach, die ich verpasst habe. Ich bin bei 1987.' },
      story: ['Ich habe bis vierzig gewartet, bevor ich offen gelebt habe. Meine Eltern, die Nachbarn, die Arbeit. Gerd war der Erste, der sich nicht dafür interessiert hat.', 'Ich bin spät dran mit allem: Partys, Freunden, Tanzen. Aber ich hole auf. Sag mir, wenn ich peinlich werde.', 'Ich war lange nicht bereit für jemanden. Ich glaube, jetzt bin ich es. Komischer Satz, der da aus mir herauskommt.'] }
  };
  D.PROF = PROF; D.IDS = Object.keys(PROF);
  var STORY_AT = [20, 45, 70];
  var PLACES = [
    { id: 'cafe', n: 'Café Sonntag', cost: 12, from: 8, to: 21, t: 'Kaffee und Kuchen' },
    { id: 'park', n: 'Park im Osten', cost: 0, from: 7, to: 22, t: 'ein Spaziergang am Teich' },
    { id: 'kara', n: 'Karaoke Mikro-Mimosa', cost: 10, from: 12, to: 24, t: 'Karaoke' },
    { id: 'pool', n: 'Strandbad Sonnenbrand', cost: 8, from: 9, to: 20, t: 'ein Nachmittag am Wasser' },
    { id: 'club', n: 'Club Glitzer', cost: 20, from: 19, to: 24, t: 'tanzen im Club' },
    { id: 'home', n: 'Bei dir zu Hause', cost: 8, from: 16, to: 24, t: 'ein Abend zu zweit zu Hause (du bist in deiner Wohnung)' }
  ];
  D.PLACES = PLACES;

  /* ---------- Daten ---------- */
  D.rel = function (id) {
    var r = S.rel[id] || (S.rel[id] = { met: S.life.day, f: 0, talks: 0, last: 0 });
    if (r.r === undefined) { r.r = 0; r.st = ''; r.rej = 0; r.lock = 0; r.dates = 0; r.story = 0; r.mem = []; r.conflict = 0; r.cd = 0; r.fd = 0; r.cmpDay = 0; r.exDay = 0; }
    return r;
  };
  D.mem = function (id, t) { var r = D.rel(id); r.mem.unshift({ d: S.life.day, t: t }); if (r.mem.length > 8) r.mem.length = 8; };
  D.ints = function () { return S.dating.ints || []; };
  D.compat = function (id) {
    var p = PROF[id], mine = D.ints(); if (!p || !mine.length) return 0;
    var s = 0; mine.forEach(function (t) { if (p.likes.indexOf(t) >= 0) s += 1; else if (p.dis.indexOf(t) >= 0) s -= .5; });
    return clamp(s / 3, 0, 1);
  };
  D.shared = function (id) { var p = PROF[id]; return D.ints().filter(function (t) { return p.likes.indexOf(t) >= 0; }); };
  D.isInto = function (id) { var p = PROF[id], r = D.rel(id); return !!(p.into || (id === 'dennis' && r.story >= 3)); };
  D.stage = function (id) {
    var r = D.rel(id);
    if (r.st === 'partner') return 'In einer Beziehung';
    if (r.st === 'ex') return 'Ex';
    if (r.r >= 45) return 'Verliebt';
    if (r.r >= 20) return 'Flirt';
    return GL.social.level(r.f);
  };
  function nm(id) { return GL.social.npc(id).n; }
  function look(id) { return GL.social.npc(id).look; }
  function hash(id) { var h = S.life.day * 31; for (var i = 0; i < id.length; i++) h = (h * 17 + id.charCodeAt(i)) % 997; return h % 11 - 5; } // −5..+5, pro Tag stabil
  D.hash = hash;

  /* ---------- Termine ---------- */
  D.apptFor = function (id) {
    var h = GL.life.hour(), d = S.life.day, ab = (d - 1) * 24 + h;
    for (var i = 0; i < S.cal.length; i++) {
      var a = S.cal[i]; if (a.npc !== id || a.st !== 'open') continue;
      var at = (a.d - 1) * 24 + a.h; if (ab >= at - 1 && ab < at + 3) return a;
    }
    return null;
  };
  D.nextAppt = function () { return S.cal.filter(function (a) { return a.st === 'open'; }).sort(function (a, b) { return (a.d * 24 + a.h) - (b.d * 24 + b.h); })[0] || null; };
  D.addAppt = function (id, place, day, hour) {
    S.cal.push({ npc: id, place: place, d: day, h: hour, st: 'open' }); if (S.cal.length > 40) S.cal = S.cal.filter(function (a) { return a.st === 'open'; }).concat(S.cal.filter(function (a) { return a.st !== 'open'; }).slice(-15));
    GL.save();
  };
  D.placeName = function (pid) { var p = PLACES.filter(function (x) { return x.id === pid; })[0]; return p ? p.n : pid; };
  D.hourText = function (h) { return ('0' + Math.floor(h)).slice(-2) + ':00'; };
  D.dayText = function (d) { var t = S.life.day; return d === t ? 'heute' : d === t + 1 ? 'morgen' : GL.life.WD[(d - 1) % 7] + ' (Tag ' + d + ')'; };

  /* ---------- Gespräch ---------- */
  var busy = 0;
  function after(id, min, needs) { GL.life.advance(min); GL.life.change(needs || { social: 6 }); GL.save(); }
  function reopen(n) { return function () { setTimeout(function () { if (GL.W && GL.W.on) menu(n); }, 120); }; }
  function line(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function react(id, topic) { var p = PROF[id]; return p.likes.indexOf(topic) >= 0 ? 'like' : p.dis.indexOf(topic) >= 0 ? 'dis' : 'neu'; }

  function topicMenu(n) {
    var id = n.d.id, pool = Object.keys(TOPICS), opts = [];
    D.ints().forEach(function (t) { if (opts.indexOf(t) < 0) opts.push(t); });
    pool.sort(function () { return Math.random() - .5; }).forEach(function (t) { if (opts.length < 5 && opts.indexOf(t) < 0) opts.push(t); });
    GL.ui.menu('Worüber reden?', 'Du suchst ein Thema für ' + GL.core.esc(nm(id)) + '. Was jemand mag, merkst du an der Reaktion.', opts.map(function (t) {
      return { e: '💬', t: TOPICS[t].n, s: GL.core.esc(TOPICS[t].q), fn: function () { smalltalk(n, t); } };
    }).concat([{ e: '↩', t: 'Zurück', fn: function () { menu(n); } }]), 'talk');
  }
  function smalltalk(n, topic) {
    var id = n.d.id, r = D.rel(id), p = PROF[id], re = react(id, topic), first = r.cd !== S.life.day, lines = ['Du fragst: „' + TOPICS[topic].q + '“'], tx = TOPICS[topic].n;
    var dF = re === 'like' ? 6 : re === 'neu' ? 3 : 0, dR = re === 'like' ? 1 : 0;
    if (!first) { dF = Math.ceil(dF / 3); dR = 0; }
    r.f = clamp(r.f + dF, 0, 100); r.r = clamp(r.r + (r.st === 'closed' ? 0 : dR), 0, 100); r.cd = S.life.day;
    var a = line(re === 'like' ? LIKE : re === 'neu' ? NEUT : DISL).replace('{t}', tx);
    var out = [a]; if (re === 'like' && p.fav[topic]) out.push(p.fav[topic]);
    if (re === 'dis') out.push('Wir finden bestimmt ein anderes Thema.');
    GL.ui.close(); after(id, 15, { social: first ? 8 : 3 }); GL.core.sfx(re === 'dis' ? 'no' : 'ok');
    GL.core.say(nm(id), look(id), [lines[0]].concat(out), reopen(n));
    if (re === 'like' && first) D.mem(id, 'Gespräch über ' + tx);
  }
  function deep(n) {
    var id = n.d.id, r = D.rel(id), p = PROF[id], ch = r.story;
    GL.ui.close();
    if (ch < 3 && r.f >= STORY_AT[ch]) {
      r.story++; r.f = clamp(r.f + 5, 0, 100); r.r = clamp(r.r + (r.st === 'closed' ? 0 : 3), 0, 100); D.mem(id, 'Hat mir etwas Persönliches erzählt (Kapitel ' + r.story + ')');
      after(id, 40, { social: 15, stress: -8 }); GL.core.sfx('ok');
      GL.core.say(nm(id), look(id), ['Komm, setzen wir uns kurz.', p.story[ch], 'Danke fürs Zuhören. Das bleibt unter uns.'], function () { if (id === 'dennis' && r.story === 3) GL.core.toast('Dennis wirkt jetzt offen für mehr.'); reopen(n)(); });
    } else {
      r.f = clamp(r.f + 2, 0, 100); after(id, 30, { social: 8, stress: -4 }); GL.core.sfx('tap');
      GL.core.say(nm(id), look(id), [ch >= 3 ? 'Wir haben schon so vieles besprochen. Ehrlich, bei dir fühle ich mich verstanden.' : 'Wir haben beide noch nicht genug Vertrauen für die ganz großen Themen. Aber das hier tut gut.'], reopen(n));
    }
  }
  function compliment(n) {
    var id = n.d.id, r = D.rel(id), first = r.cpDay !== S.life.day; GL.ui.close();
    if (r.f < 10) { r.f = clamp(r.f + 1, 0, 100); after(id, 5); GL.core.say(nm(id), look(id), ['Oh. Danke. Wir kennen uns ja kaum, aber das ist nett.'], reopen(n)); return; }
    if (!first) { after(id, 5); GL.core.say(nm(id), look(id), ['Du bist heute wirklich großzügig. Ich werde schon rot, jetzt reicht es erstmal.'], reopen(n)); return; }
    r.cpDay = S.life.day; r.f = clamp(r.f + 4, 0, 100); r.r = clamp(r.r + (r.st === 'closed' ? 0 : 2), 0, 100); after(id, 10, { social: 6 }); GL.core.sfx('ok');
    GL.core.say(nm(id), look(id), [line(['„Dein Lächeln ist wirklich ansteckend.“ Er grinst verlegen. „Das habe ich gebraucht.“', '„Du siehst heute richtig gut aus.“ Er blinzelt. „Okay. Jetzt bin ich nervös.“', '„Mit dir kann man gut reden.“ Er sieht kurz weg. „Das ist das Netteste, was mir diese Woche jemand gesagt hat.“'])], reopen(n));
  }

  /* Flirt: eigene Entscheidung der Figur. Nein bleibt Nein. */
  D.flirtScore = function (id) {
    var r = D.rel(id);
    return r.r * .5 + r.f * .5 + (GL.life.mood() - 50) * .25 + D.compat(id) * 20 + hash(id) + (PROF[id].slow ? -8 : 0);
  };
  function flirt(n) {
    var id = n.d.id, r = D.rel(id), p = PROF[id]; GL.ui.close();
    function say(l, cb) { GL.core.say(nm(id), look(id), l, cb || reopen(n)); }
    if (r.st === 'closed') { say(['Ich habe dir gesagt, wie ich es sehe. Lass uns einfach Freunde sein, das meine ich ernst.']); return; }
    if (r.fd === S.life.day) { say(['Lass den Tag erstmal ausklingen, ja?']); return; }
    if (r.lock > S.life.day) { say(['Ich brauche noch ein bisschen Abstand zu dem Thema. Gib mir ein paar Tage.']); return; }
    if (r.f < 30) { after(id, 5); say(['Wir kennen uns noch gar nicht richtig. Lass uns erstmal ein bisschen reden.']); return; }
    r.fd = S.life.day;
    if (!D.isInto(id)) {
      r.lock = S.life.day + 5; if (id !== 'dennis') { r.rej++; if (r.rej >= 3) r.st = 'closed'; }
      D.mem(id, 'Hat sanft Nein gesagt'); after(id, 10, { social: 2 });
      say([id === 'dennis' ? 'Das ist lieb von dir, wirklich. Aber ich bin gerade nicht bereit für so etwas. Ich mag dich als Freund, und ich hoffe, das reicht erstmal.' : 'Du bist nett, aber bei mir kommt da nichts an. Lass uns Freunde bleiben, okay?']); return;
    }
    var sc = D.flirtScore(id);
    if (sc >= 55) {
      r.r = clamp(r.r + 10, 0, 100); r.rej = 0; D.mem(id, 'Hat auf einen Flirt gelächelt'); after(id, 15, { social: 10, stress: -3 }); GL.core.sfx('ok');
      say([line(['Er lächelt und wird ein wenig rot. „Das war jetzt sehr charmant.“', '„Spielst du gerade mit mir?“ Er hebt die Augenbraue, lächelt aber. „Ich glaube, es gefällt mir.“', 'Er hält deinen Blick einen Moment zu lang. „Frag mich nochmal. Ich meine: irgendwann bald.“'])]);
    } else {
      r.rej++; r.lock = S.life.day + 2; r.f = clamp(r.f - 1, 0, 100); if (r.rej >= 3 && r.f < 70) r.st = 'closed';
      D.mem(id, 'Hat einen Flirt nicht erwidert'); after(id, 10, { social: 2 }); GL.core.sfx('no');
      say([line(['„Das ist lieb gemeint, aber ich spüre da gerade nichts. Lass uns Freunde bleiben.“', '„Ich mag dich, aber nicht so. Ich hoffe, das ist okay.“', '„Heute ist nicht der Tag dafür. Nimm es nicht persönlich.“'])]);
    }
  }

  /* ---------- Einladung ---------- */
  function invite(n) {
    var id = n.d.id, r = D.rel(id), h = GL.life.hour();
    GL.ui.menu('Zum Date einladen', 'Wohin soll es mit ' + GL.core.esc(nm(id)) + ' gehen? Kosten werden geteilt: du zahlst.', PLACES.map(function (pl) {
      var tip = PROF[id].place === pl.id ? ' · ' + nm(id) + ' mag den Ort' : '';
      return { e: '📅', t: pl.n, s: pl.t + ' · ' + (pl.cost ? pl.cost + ' €' : 'kostenlos') + tip, dis: pl.cost > S.life.money, fn: function () { when(n, pl); } };
    }).concat([{ e: '↩', t: 'Zurück', fn: function () { menu(n); } }]), 'talk');
  }
  function when(n, pl) {
    var id = n.d.id, h = GL.life.hour(), d = S.life.day, opts = [];
    [[d, 19], [d, 15], [d + 1, 11], [d + 1, 17], [d + 1, 19], [d + 2, 18]].forEach(function (q) {
      if (q[0] === d && q[1] < h + 1.5) return; if (q[1] < pl.from || q[1] >= pl.to) return;
      if (S.cal.some(function (a) { return a.st === 'open' && a.d === q[0] && Math.abs(a.h - q[1]) < 3; })) return;
      opts.push({ e: '🕐', t: D.dayText(q[0]) + ', ' + D.hourText(q[1]) + ' Uhr', fn: function () { confirm(n, pl, q[0], q[1]); } });
    });
    if (!opts.length) opts.push({ e: '🕐', t: 'Heute passt nichts mehr', s: 'Wähle einen anderen Ort', dis: 1 });
    GL.ui.menu(pl.n, 'Wann?', opts.concat([{ e: '↩', t: 'Zurück', fn: function () { invite(n); } }]), 'talk');
  }
  function confirm(n, pl, day, hour) {
    var id = n.d.id, r = D.rel(id); GL.ui.close();
    // Zusage ist die Entscheidung der Person: nur wer die Einladung wirklich annehmen mag (Freundschaft ab 30, kein Abstand erbeten)
    var yes = r.f >= 30 && r.st !== 'closed' && !(r.lock > S.life.day && r.st !== 'partner');
    var romantic = r.r >= 20 && D.isInto(id);
    if (!yes) { GL.core.say(nm(id), look(id), ['Heute passt es mir nicht. Frag mich bald nochmal.'], reopen(n)); return; }
    D.addAppt(id, pl.id, day, hour); D.mem(id, 'Date verabredet: ' + pl.n); after(id, 5, { social: 4 }); GL.core.sfx('ok');
    GL.core.say(nm(id), look(id), [romantic ? '„Ein Date? Sehr gern!“ Er strahlt. „' + D.dayText(day) + ', ' + D.hourText(hour) + ' Uhr, ' + pl.n + '. Ich freue mich.“' : '„Klar, gern. ' + D.dayText(day) + ', ' + D.hourText(hour) + ' Uhr, ' + pl.n + '. Als Freunde, oder mal schauen.“', 'Der Termin steht im Kalender deines Handys.'], reopen(n));
  }

  /* ---------- Date ---------- */
  function startDate(n, a) {
    var id = n.d.id, r = D.rel(id), p = PROF[id], pl = PLACES.filter(function (x) { return x.id === a.place; })[0];
    if (pl.cost > S.life.money) { GL.core.toast('Du hast nicht genug Geld dabei (' + pl.cost + ' €).'); return menu(n); }
    GL.ui.close(); if (pl.cost) GL.eco.spend(pl.cost, 'Date mit ' + nm(id) + ': ' + pl.n);
    var scenes = [], used = [], pts = 0, i = 0, tl = p.likes.slice().sort(function () { return Math.random() - .5; });
    var topics = [tl[0], Object.keys(TOPICS).filter(function (t) { return p.likes.indexOf(t) < 0 && p.dis.indexOf(t) < 0; })[0], p.dis[0] || tl[1]].sort(function () { return Math.random() - .5; });
    var mine = D.ints()[0] || 'musik';
    function scene() {
      var t = topics[i], re = react(id, t), tx = TOPICS[t].n;
      GL.ui.menu('Date: ' + nm(id) + ' · ' + pl.n, nm(id) + ' kommt auf <b>' + GL.core.esc(tx) + '</b> zu sprechen. Szene ' + (i + 1) + ' von 3.', [
        { e: '🙂', t: 'Interessiert nachfragen', s: 'Du hörst zu und fragst nach.', fn: function () { pick(re === 'dis' ? 0 : re === 'like' ? 2 : 1, re === 'like' ? 'Er blüht auf, weil du wirklich zuhörst.' : re === 'neu' ? 'Er freut sich über dein Interesse.' : 'Du tust interessiert, aber er merkt, dass es ihn nicht freut.'); } },
        { e: '🗣️', t: 'Von deinem Interesse erzählen: ' + TOPICS[mine].n, s: 'Du bringst dich selbst ein.', fn: function () { var ok = p.likes.indexOf(mine) >= 0, bad = p.dis.indexOf(mine) >= 0; pick(ok ? 2 : bad ? 0 : 1, ok ? 'Ihr habt dasselbe Thema. Das Gespräch fließt.' : bad ? 'Er verzieht kurz den Mund. Nicht sein Ding.' : 'Er hört höflich zu.'); } },
        { e: '🔀', t: 'Das Thema wechseln', s: 'Du lenkst das Gespräch um.', fn: function () { pick(re === 'dis' ? 2 : 0, re === 'dis' ? 'Er ist sichtlich erleichtert. „Danke. Das Thema lag mir nicht.“' : 'Er wirkt etwas überrumpelt.'); } }
      ], 'date');
    }
    function pick(v, txt) { pts += v; GL.core.sfx(v >= 2 ? 'ok' : v ? 'tap' : 'no'); GL.ui.close(); GL.core.say(nm(id), look(id), [txt], function () { i++; if (i < 3) scene(); else finish(); }); }
    function finish() {
      if (GL.life.mood() >= 70) pts++;
      var k = pts >= 6 ? 2 : pts >= 3 ? 1 : 0, dR = [2, 8, 14][k], dF = [2, 5, 8][k];
      if (r.st === 'closed' || !D.isInto(id)) dR = 0;
      r.r = clamp(r.r + dR, 0, 100); r.f = clamp(r.f + dF, 0, 100); r.dates++; a.st = 'done';
      D.mem(id, 'Date: ' + pl.n + (k === 2 ? ' – traumhaft' : k === 1 ? ' – schön' : ' – etwas holprig'));
      GL.life.advance(150); GL.life.change({ social: 25, stress: -10, energy: -8 }, k * 4); GL.save();
      GL.core.say(nm(id), look(id), [k === 2 ? 'Der Abend war wundervoll. Die Zeit ist verflogen.' : k === 1 ? 'Das war ein schöner Abend. Danke, dass du dir die Zeit genommen hast.' : 'Es hatte holprige Momente, aber ich hatte trotzdem Spaß.'], function () { endOfEvening(n, r); });
    }
    scene();
  }
  function endOfEvening(n, r) {
    var id = n.d.id, kiss = D.isInto(id) && r.st !== 'closed';
    var items = [{ e: '👋', t: 'Gute Nacht sagen', s: 'Umarmung und Tschüss.', fn: function () { GL.ui.close(); GL.core.say(nm(id), look(id), ['„Gute Nacht. Ich melde mich.“'], function () { followUp(id); reopen(n)(); }); } }];
    if (kiss) items.push({ e: '😘', t: 'Küssen', s: 'Nur wenn er es auch möchte.', fn: function () {
      GL.ui.close();
      if (r.r >= 45) { r.r = clamp(r.r + 6, 0, 100); D.mem(id, 'Erster Kuss'); GL.core.sfx('ok'); GL.core.say(nm(id), look(id), ['Er legt die Hand an deine Wange und erwidert den Kuss. Für einen Moment steht die Stadt still.'], function () { followUp(id); reopen(n)(); }); }
      else { GL.core.say(nm(id), look(id), ['„Ich mag dich, aber das geht mir gerade zu schnell. Lass uns Zeit lassen.“ Er lächelt entschuldigend.'], function () { followUp(id); reopen(n)(); }); }
    } });
    if (r.st === 'partner' && r.r >= 70) items.push({ e: '🌙', t: 'Gemeinsam nach Hause gehen', s: 'Wenn ihr beide es möchtet.', fn: function () {
      GL.ui.close(); GL.ui.fade('… Später. 🌙', function () { r.r = clamp(r.r + 5, 0, 100); D.mem(id, 'Gemeinsame Nacht'); GL.life.advance(480, true); GL.life.change({ social: 20 }, 8); GL.save(); GL.core.banner('Guten Morgen', GL.life.weekday() + ', ' + GL.life.clock()); followUp(id); }, 1600);
    } });
    GL.ui.menu('Wie endet der Abend?', 'Die Entscheidung liegt bei euch beiden.', items, 'date');
  }
  function followUp(id) {
    var r = D.rel(id);
    GL.msg.later(id, r.st === 'partner' ? 'Danke für heute. Ich bin froh, dass es dich gibt. ❤️' : r.r >= 30 ? 'Der Abend war schön. Wollen wir das wiederholen?' : 'Danke für heute, das war nett!', null, 90);
  }

  /* ---------- Beziehung ---------- */
  function propose(n) {
    var id = n.d.id, r = D.rel(id); GL.ui.close();
    function say(l, cb) { GL.core.say(nm(id), look(id), l, cb || reopen(n)); }
    if (r.r >= 65 && r.dates >= 2) {
      r.st = 'partner'; r.r = clamp(r.r + 5, 0, 100); r.conflict = 0; r.last = S.life.day; D.mem(id, 'Wir sind zusammen'); after(id, 10, { social: 15 }); GL.core.sfx('ok');
      GL.core.banner('Ihr seid zusammen!', nm(id) + ' und du');
      say(['„Ja. Ja, sehr gern.“ Er lacht und schüttelt den Kopf. „Ich habe heute Morgen schon gehofft, dass du fragst.“']);
    } else { r.lock = Math.max(r.lock, S.life.day + 2); say(['„Ich mag dich wirklich. Aber ich brauche noch etwas Zeit, bevor ich mich festlege.“ Er nimmt deine Hand. „Das ist keine Absage. Nur ein ‚noch nicht‘.“']); }
  }
  function apologize(n, flowers) {
    var id = n.d.id, r = D.rel(id); GL.ui.close();
    if (flowers && !GL.eco.spend(15, 'Blumen für ' + nm(id))) { GL.core.toast('Für Blumen reicht dein Geld nicht.'); return menu(n); }
    r.conflict = 0; r.f = clamp(r.f + 3, 0, 100); r.r = clamp(r.r + (flowers ? 4 : 1), 0, 100); r.last = S.life.day; D.mem(id, flowers ? 'Hat sich mit Blumen entschuldigt' : 'Hat sich entschuldigt'); after(id, 20, { social: 10 }); GL.core.sfx('ok');
    GL.core.say(nm(id), look(id), [flowers ? '„Blumen? Du Schuft.“ Er nimmt sie trotzdem lächelnd. „Okay. Entschuldigung angenommen.“' : '„Danke, dass du das sagst. Ich war enttäuscht, aber ich merke, dass es dir ernst ist.“'], reopen(n));
  }
  function moveIn(n) {
    var id = n.d.id, r = D.rel(id); GL.ui.close();
    if (r.r >= 80) { S.home.partner = id; r.last = S.life.day; D.mem(id, 'Ist bei mir eingezogen'); GL.core.sfx('ok'); GL.core.banner(nm(id) + ' zieht bei dir ein!', 'Miete jetzt geteilt'); GL.save(); GL.core.say(nm(id), look(id), ['„Ja, das möchte ich. Ich habe schon zwei Kisten gepackt.“ Er lacht. „Aber das Bett bestimmst du.“'], reopen(n)); }
    else GL.core.say(nm(id), look(id), ['„Ich liebe dich, aber ein gemeinsames Zuhause ist ein großer Schritt. Gib mir noch etwas Zeit.“'], reopen(n));
  }
  function breakup(n) {
    var id = n.d.id, r = D.rel(id);
    GL.ui.menu('Beziehung beenden?', 'Das macht ' + GL.core.esc(nm(id)) + ' traurig. Es kann nicht rückgängig gemacht werden, ihr könnt aber Freunde bleiben.', [
      { e: '💔', t: 'Ja, Schluss machen', fn: function () { GL.ui.close(); endRel(id, 'Du hast die Beziehung beendet'); GL.core.say(nm(id), look(id), ['„Das tut weh. Aber danke, dass du ehrlich bist.“'], reopen(n)); } },
      { e: '↩', t: 'Doch nicht', fn: function () { menu(n); } }], 'talk');
  }
  function endRel(id, why) { if (S.home.partner === id) S.home.partner = ''; var r = D.rel(id); r.st = 'ex'; r.exDay = S.life.day; r.r = Math.min(r.r, 20); r.f = clamp(r.f - 10, 0, 100); r.conflict = 0; D.mem(id, why); GL.life.change({ stress: 15, social: -5 }, -8); GL.save(); }
  D.endRel = endRel;

  /* ---------- Menü ---------- */
  function menu(n) {
    var id = n.d.id, r = D.rel(id), W = GL.W, p = PROF[id], d = S.life.day, items = [], ap = D.apptFor(id);
    var sub = '<b>' + GL.core.esc(D.stage(id)) + '</b> · Freundschaft ' + r.f + (r.met ? '' : '') + ' · Romantik ' + r.r + (p ? '<br><small>' + GL.core.esc(p.job) + '</small>' : '');
    if (ap) {
      var pl = PLACES.filter(function (x) { return x.id === ap.place; })[0];
      items.push({ e: '❤️', t: 'Date beginnen: ' + pl.n, s: pl.t + (pl.cost ? ' · ' + pl.cost + ' €' : ''), dis: pl.cost > S.life.money, fn: function () { startDate(n, ap); } });
    }
    items.push({ e: '💬', t: 'Quatschen', s: 'Ein Thema aussuchen.', fn: function () { topicMenu(n); } });
    var nx = r.story < 3 ? STORY_AT[r.story] : 0;
    items.push({ e: '🫶', t: 'Tiefes Gespräch', s: r.story >= 3 ? 'Ihr habt euch alles erzählt.' : r.f >= nx ? 'Er hat etwas auf dem Herzen.' : 'Ab Freundschaft ' + nx + '.', fn: function () { deep(n); } });
    items.push({ e: '🌟', t: 'Kompliment machen', fn: function () { compliment(n); } });
    if (r.st !== 'partner') items.push({ e: '😉', t: 'Flirten', s: r.st === 'closed' ? 'Er hat klar gesagt, was er möchte.' : r.lock > d ? 'Gib ihm ein paar Tage.' : r.f < 30 ? 'Ab Freundschaft 30.' : 'Auf eigenes Risiko: Er entscheidet selbst.', dis: r.st === 'closed', fn: function () { flirt(n); } });
    if (!ap && r.f >= 30 && r.st !== 'closed') items.push({ e: '📅', t: 'Zum Date einladen', s: 'Ort und Zeit aussuchen.', fn: function () { invite(n); } });
    if (r.st !== 'partner' && r.st !== 'closed' && r.r >= 60 && r.dates >= 2) items.push({ e: '💍', t: 'Beziehung ansprechen', s: 'Du fragst, ob ihr zusammen sein wollt.', fn: function () { propose(n); } });
    if (r.conflict) { items.push({ e: '🙏', t: 'Entschuldigen', fn: function () { apologize(n, 0); } }); items.push({ e: '💐', t: 'Blumen schenken (15 €)', dis: S.life.money < 15, fn: function () { apologize(n, 1); } }); }
    if (r.st === 'partner' && !r.conflict) items.push({ e: '🥰', t: 'Zeit zusammen verbringen', s: 'Eine Stunde nur zu zweit.', fn: function () { GL.ui.close(); r.last = d; r.r = clamp(r.r + 2, 0, 100); after(id, 60, { social: 18, stress: -8 }); GL.core.say(nm(id), look(id), ['Ihr sitzt zusammen, redet und schweigt zwischendurch. Genau so soll es sein.'], reopen(n)); } });
    if (r.st === 'partner' && !S.home.partner && r.r >= 75 && r.dates >= 3) items.push({ e: '🏠', t: 'Zusammenziehen', s: 'Er zieht bei dir ein. Die Miete wird geteilt.', fn: function () { moveIn(n); } });
    if (r.st === 'partner') items.push({ e: '💔', t: 'Beziehung beenden', fn: function () { breakup(n); } });
    items.push({ e: '🗨️', t: 'Anliegen und Aufträge', s: 'Das Übliche.', fn: function () { GL.ui.close(); GL.core.talkBase(n); } });
    GL.ui.menu(nm(id), sub, items.concat([{ e: '👋', t: 'Tschüss', fn: GL.ui.close }]), 'talk');
  }
  D.menu = menu;
  GL.on('talkMenu', function (n) { if (!PROF[n.d.id]) return; GL.ui.close(); menu(n); return true; });

  /* ---------- Tagesereignisse ---------- */
  GL.on('newDay', function (day) {
    D.IDS.forEach(function (id) {
      var r = S.rel[id]; if (!r || r.r === undefined) return;
      if (r.st === 'ex' && day - r.exDay >= 14) { r.st = ''; r.rej = 0; }
      if (r.st === 'partner') {
        var idle = day - Math.max(r.last || 0, r.met);
        if (!r.conflict && idle >= 5) { r.conflict = day; GL.msg.push(id, 'Wir haben uns lange nicht gesehen. Fühlt sich an, als wäre ich dir egal.', [['Du hast recht, tut mir leid.', 3, 2, '„Danke, dass du das sagst.“', 'sorry'], ['Ich hatte nur viel um die Ohren.', 0, -2, '„Okay. Ich hoffe, wir sehen uns bald.“']]); D.mem(id, 'Streit: zu wenig Zeit füreinander'); }
        else if (r.conflict && day - r.conflict >= 4) { endRel(id, nm(id) + ' hat die Beziehung beendet'); GL.msg.push(id, 'Ich habe lange gewartet. Ich glaube, es ist besser, wenn wir getrennte Wege gehen. Pass auf dich auf.'); }
        else if (!r.conflict && day % 3 === 0) GL.msg.push(id, ['Guten Morgen! Ich hoffe, du hast gut geschlafen. ☀️', 'Denk an mich, wenn du Kaffee trinkst. ☕', 'Ich freue mich auf nachher!'][day % 3 === 0 ? (day / 3) % 3 : 0]);
      }
    });
    // verpasste Termine
    S.cal.forEach(function (a) {
      if (a.st !== 'open') return; var at = (a.d - 1) * 24 + a.h, now = (day - 1) * 24 + GL.life.hour();
      if (now >= at + 3) missed(a);
    });
  });
  function missed(a) {
    a.st = 'missed'; var r = D.rel(a.npc); r.r = clamp(r.r - 6, 0, 100); r.f = clamp(r.f - 4, 0, 100); D.mem(a.npc, 'Date verpasst');
    if (r.st === 'partner' && !r.conflict) r.conflict = S.life.day;
    GL.msg.push(a.npc, 'Ich habe im ' + D.placeName(a.place) + ' auf dich gewartet. Wo warst du?', [['Entschuldige, es kam etwas dazwischen.', 1, 1, '„Na gut. Sag das nächste Mal bitte vorher Bescheid.“', 'sorry'], ['Habe es vergessen.', -2, -2, '„Schade.“']]);
    GL.save();
  }
  var ct = 0;
  GL.on('tick', function (dt) {
    ct += dt; if (ct < 4) return; ct = 0;
    var h = GL.life.hour(), d = S.life.day, ab = (d - 1) * 24 + h;
    S.cal.forEach(function (a) {
      if (a.st !== 'open') return; var at = (a.d - 1) * 24 + a.h;
      if (ab >= at + 3) missed(a);
      else if (ab >= at - 1 && ab < at + .1 && !a.rem) { a.rem = 1; GL.core.toast('📅 Gleich: Date mit ' + nm(a.npc) + ' im ' + D.placeName(a.place) + ' (' + D.hourText(a.h) + ' Uhr)'); GL.save(); }
    });
  });
  GL.on('phoneTasks', function () {
    var a = D.nextAppt(); if (!a) return '';
    return '<div class="pcard"><b>📅 Date mit ' + GL.core.esc(nm(a.npc)) + '</b><br><small class="sub">' + D.dayText(a.d) + ', ' + D.hourText(a.h) + ' Uhr · ' + GL.core.esc(D.placeName(a.place)) + '</small></div>';
  });
})();
