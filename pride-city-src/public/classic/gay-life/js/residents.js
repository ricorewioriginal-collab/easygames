/* GayLife – Bewohner der Viertel: zwei Erwachsene pro Viertel (14 Leute) mit eigenem Tagesplan (Wochentag/Wochenende), Interessen und Geschichte.
   Sie arbeiten, essen und feiern an den vier Orten ihres Viertels und sind nachts zu Hause (unsichtbar). Wer sie trifft, kann plaudern, Themen ansprechen,
   gemeinsam Zeit am Ort verbringen und – wenn die Person Interesse hat und die Freundschaft reicht – zum Date einladen. Ein Nein wird respektiert.
   Wer in einer Beziehung ist, lädt niemanden zum Date ein. Intimes bleibt angedeutet. S.res[id] = { met, f, r, talks, last, asked, lock, no, dates, topic, story } */
(function () {
  'use strict';
  var S = GL.S, R = GL.res = {};
  var RES = [
    { id: 'nadine', d: 'down', n: 'Nadine', age: 31, g: 'f', job: 'Anwältin für Mietrecht', tr: 'klar und herzlich', likes: ['kultur', 'essen'], dis: ['party'], into: 1,
      wk: [[7, 9, 3], [9, 13, 2], [13, 14, 1], [14, 18, 2], [19, 22, 0]], we: [[10, 13, 3], [13, 17, 1], [18, 23, 0]], fav: 'Ich lese Mietverträge, damit niemand rausfliegt, der nur anders liebt. Danach brauche ich einen Film mit Happy End.',
      story: ['Ich habe Jura studiert, weil ich als Kind gesehen habe, wie unsere Nachbarn rausgeschmissen wurden. Ich wollte die sein, die die Tür offen hält.', 'Manchmal bin ich so müde vom Kämpfen, dass ich nur noch Streetfood und ein ruhiges Gespräch will. Danke, dass du das teilst.'] },
    { id: 'tarek', d: 'down', n: 'Tarek', age: 28, g: 'm', job: 'Barista und Filmstudent', tr: 'verträumt und witzig', likes: ['kultur', 'musik', 'kunst'], dis: ['sport'], into: 0,
      wk: [[6, 12, 3], [12, 18, 0], [18, 21, 1]], we: [[12, 23, 0]], fav: 'Ich drehe einen Kurzfilm über einen Kaffeeautomaten, der sich verliebt. Es wird sehr traurig und sehr lustig.',
      story: ['Meine Familie weiß nicht, dass ich Film studiere. Sie denken, ich bin ständig im Café. Ist ja auch nicht gelogen.', 'Ich bin glücklich vergeben an meinen Schnitt-Computer. Aber Freunde brauche ich trotzdem, gute.'] },
    { id: 'joon', d: 'neon', n: 'Joon', age: 27, g: 'n', job: 'DJ in der Tanzterrasse', tr: 'cool, aber warmherzig', likes: ['musik', 'party', 'tech'], dis: ['natur'], into: 1,
      wk: [[18, 20, 0], [20, 24, 2], [0, 4, 2]], we: [[18, 20, 0], [20, 24, 2], [0, 5, 2]], fav: 'Ein guter Übergang ist wie ein guter Kuss: Man merkt ihn erst, wenn er vorbei ist.',
      story: ['Ich bin tagsüber unsichtbar und nachts alle. Das ist mein Trick, mich sicher zu fühlen.', 'Du fragst nach, wie es mir wirklich geht. Das tut kaum jemand zwischen zwei Songs.'] },
    { id: 'rico', d: 'neon', n: 'Rico', age: 36, g: 'm', job: 'Nachtportier und Ramen-Fan', tr: 'ruhig und beschützend', likes: ['essen', 'tiere', 'kultur'], dis: ['mode'], into: 0,
      wk: [[18, 22, 1], [22, 24, 3], [0, 5, 3]], we: [[18, 24, 1]], fav: 'Ich habe in zehn Jahren dreihundert Nudelsuppen ausgeteilt und nie jemanden hungrig gehen lassen.',
      story: ['Nachts sieht man, wer niemanden hat. Ich lasse die Tür für sie einfach ein bisschen länger offen.', 'Ich bin gern der, den man anruft, wenn es spät wird. Du kannst das auch jederzeit.'] },
    { id: 'malia', d: 'beach', n: 'Malia', age: 29, g: 'f', job: 'Surflehrerin', tr: 'sonnig und direkt', likes: ['sport', 'natur', 'tiere'], dis: ['tech'], into: 1,
      wk: [[7, 12, 0], [12, 15, 3], [15, 19, 2]], we: [[9, 19, 2]], fav: 'Die Welle fragt nicht, wer du bist. Sie fragt nur, ob du bereit bist. Das mag ich an ihr.',
      story: ['Mit fünfzehn habe ich mich im Meer versteckt, weil ich nicht wusste, wohin mit mir. Jetzt bringe ich anderen bei, sich im Wasser sicher zu fühlen.', 'Ich glaube, Mut ist eine Frage des Atmens. Und der richtigen Leute am Strand.'] },
    { id: 'finn', d: 'beach', n: 'Finn', age: 24, g: 'm', job: 'Eisverkäufer und Hobby-Musiker', tr: 'albern, freundlich', likes: ['musik', 'essen', 'party'], dis: ['kunst'], into: 1,
      wk: [[10, 20, 3]], we: [[10, 20, 3]], fav: 'Ich habe einen Song über Pistazieneis geschrieben. Er hat vier Strophen und keinen Sinn.',
      story: ['Ich bin vor zwei Jahren aus einem kleinen Dorf hergezogen. Hier hat mich an Tag eins jemand gefragt, wie ich heiße. Das war neu.', 'Ich habe noch nie jemanden gefragt, ob er mit mir Eis essen möchte. Üben wir das?'] },
    { id: 'rosa', d: 'love', n: 'Rosa', age: 62, g: 'f', job: 'Floristin', tr: 'liebevoll und frech', likes: ['natur', 'kunst', 'kultur'], dis: ['tech'], into: 0,
      wk: [[8, 19, 1]], we: [[9, 16, 1], [16, 19, 0]], fav: 'Jeder Strauß erzählt eine Geschichte. Meistens sage ich: Ich verkaufe Entschuldigungen und Hochzeitsträume.',
      story: ['Meine Frau und ich haben dieses Geschäft gemeinsam aufgebaut. Sie ist vor drei Jahren gestorben. Die Blumen halten sie nah.', 'Du hörst gut zu, Schätzchen. Das ist selten. Bleib so.'] },
    { id: 'elias', d: 'love', n: 'Elias', age: 30, g: 'm', job: 'Landschaftsgärtner und Dichter', tr: 'sanft und tiefgründig', likes: ['natur', 'kunst', 'kultur', 'tiere'], dis: ['party'], into: 1,
      wk: [[8, 12, 2], [12, 14, 0], [14, 19, 2]], we: [[10, 18, 0]], fav: 'Ich schreibe Gedichte auf Samentütchen. Wenn sie blühen, weiß niemand, wer sie geschrieben hat.',
      story: ['Ich habe lange gedacht, dass ich zu leise bin, um geliebt zu werden. Pflanzen haben mir das Gegenteil gezeigt.', 'Ich möchte jemanden, der auch mal schweigt. Und dabei neben mir sitzt.'] },
    { id: 'yara', d: 'fashion', n: 'Yara', age: 26, g: 'f', job: 'Schneiderin und Upcycling-Fan', tr: 'kreativ und neugierig', likes: ['mode', 'kunst', 'musik'], dis: ['sport'], into: 1,
      wk: [[10, 14, 0], [14, 19, 2]], we: [[11, 17, 3]], fav: 'Aus alten Pride-Fahnen nähe ich Jacken. Jede Naht ist eine kleine Umarmung.',
      story: ['Ich wollte nie in Schubladen passen. Also habe ich gelernt, mir meine eigenen zu nähen.', 'Ein Kleidungsstück ist fertig, wenn sich jemand darin sicher fühlt. Nicht, wenn die Naht gerade ist.'] },
    { id: 'cedric', d: 'fashion', n: 'Cedric', age: 34, g: 'm', job: 'Friseur im Salon Schnittig', tr: 'tratschig, aber verschwiegen', likes: ['mode', 'musik', 'party'], dis: ['natur'], into: 1,
      wk: [[10, 18, 1], [18, 19, 3]], we: [[11, 17, 1]], fav: 'Ich weiß alles über die Stadt. Und ich verrate nichts. Das nennt man Berufsethos.',
      story: ['Mit achtzehn habe ich meiner Mutter die Haare gemacht und dabei gesagt, dass ich schwul bin. Sie hat gelacht und gesagt: Das weiß ich seit dem Kindergarten.', 'Ich mache dir die Haare, wenn du mir erzählst, wovon du träumst. Ich höre besser als jeder Therapeut.'] },
    { id: 'leon', d: 'heights', n: 'Leon', age: 32, g: 'm', job: 'Yogalehrer', tr: 'gelassen und humorvoll', likes: ['sport', 'natur', 'tiere'], dis: ['tech'], into: 1,
      wk: [[6, 10, 2], [10, 17, 0]], we: [[6, 10, 2], [10, 17, 0]], fav: 'Atme ein, atme aus, und gib zu, dass du gerade auf dein Handy geschaut hast.',
      story: ['Ich war mal Banker und hatte jeden Tag Magenschmerzen. Seit ich auf Dächern Yoga mache, schlafe ich wie ein Stein.', 'Ich möchte nicht mehr perfekt sein. Nur noch ehrlich. Mit dir fällt mir das leicht.'] },
    { id: 'amira', d: 'heights', n: 'Amira', age: 35, g: 'f', job: 'Barkeeperin in der Sky-Lounge', tr: 'schlagfertig und fürsorglich', likes: ['party', 'musik', 'kultur'], dis: ['sport'], into: 0,
      wk: [[17, 24, 1], [0, 4, 1]], we: [[17, 24, 1], [0, 4, 1]], fav: 'Wer in meiner Bar nur Wasser bestellt, bekommt trotzdem eine Olive. Es geht um die Würde.',
      story: ['Hinter der Bar höre ich jeden Abend zehn Lebensgeschichten. Meine eigene erzähle ich fast nie.', 'Ich bin ziemlich zufrieden mit meinem Leben. Es fehlt mir nur manchmal jemand zum Anstoßen. Du darfst das sein, als Freund.'] },
    { id: 'ole', d: 'coast', n: 'Ole', age: 45, g: 'm', job: 'Fischer', tr: 'wortkarg und treu', likes: ['natur', 'tiere', 'essen'], dis: ['mode'], into: 0,
      wk: [[5, 12, 0], [12, 16, 2], [16, 20, 3]], we: [[5, 11, 0], [11, 15, 2]], fav: 'Ein Netz ist wie eine Beziehung: Man flickt es jeden Tag, sonst fällt es auseinander.',
      story: ['Ich habe vierzig Jahre lang so getan, als wäre ich nur der Typ mit den Netzen. Mein Mann kennt den Rest.', 'Du hast mir zugehört, ohne zu urteilen. Der Fisch heute schmeckt deshalb besser.'] },
    { id: 'mara', d: 'coast', n: 'Mara', age: 27, g: 'f', job: 'Meeresbiologin', tr: 'neugierig und begeisterungsfähig', likes: ['natur', 'tiere', 'tech', 'kultur'], dis: ['party'], into: 1,
      wk: [[9, 13, 1], [13, 15, 2], [15, 20, 3]], we: [[10, 18, 3]], fav: 'Quallen haben kein Gehirn und trotzdem Stil. Ich glaube, das ist ein gutes Vorbild.',
      story: ['Ich war die Einzige in meiner Klasse, die lieber Seegras sortiert als Beliebtheit. Hier bin ich endlich unter Leuten, denen das gefällt.', 'Ich weiß gar nicht, wann ich zuletzt jemandem so lange zugehört habe. Oder zugehört wurde.'] }
  ];
  R.LIST = RES;
  RES.forEach(function (r, i) {
    var f = r.g === 'f', m = r.g === 'm';
    r.look = { skin: (i * 5 + 1) % 6, hair: f ? [2, 4][i % 2] : m ? [0, 1, 5, 6][i % 4] : 5, hc: (i * 3 + 1) % 10, beard: m ? [0, 1, 2, 3, 4][i % 5] : 0, acc: [0, 1, 0, 2, 4, 0, 9, 0][i % 8], top: (i * 2 + 1) % 5, tc: (i * 3 + 2) % 8, eye: i % 4, build: i % 3, h: (i + 1) % 3, tat: i % 5 === 3 ? 1 : i % 7 === 5 ? 3 : 0 };
  });
  function by(id) { return RES.filter(function (x) { return x.id === id; })[0]; }
  R.by = by;
  function dist(id) { return GL.dist.LIST.filter(function (x) { return x.id === id; })[0]; }
  function rs(id) { var o = S.res || (S.res = {}); return o[id] || (o[id] = { met: 0, f: 0, r: 0, talks: 0, last: 0, asked: 0, lock: 0, no: 0, dates: 0, topic: 0, story: 0 }); }
  R.rel = rs;
  /* Tagesplan: Nummer des Ortes im Viertel (0–3) oder -1 = zu Hause */
  R.spotAt = function (r, hour, weekend) { var l = weekend ? r.we : r.wk; for (var i = 0; i < l.length; i++) if (hour >= l[i][0] && hour < l[i][1]) return l[i][2]; return -1; };
  R.spot = function (id) { return R.spotAt(by(id), GL.life.hour(), GL.people.isWeekend()); };
  R.where = function (id) { var r = by(id), s = R.spot(id); return s < 0 ? 'zu Hause' : dist(r.d).sp[s].e + ' ' + dist(r.d).sp[s].n; };
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return (h >>> 0) % 1000 / 1000; }
  function partner() { var k; if (S.home && S.home.partner) return true; for (k in S.rel) if (S.rel[k] && S.rel[k].st === 'partner') return true; return false; }
  R.compat = function (r) { var mine = (S.dating && S.dating.ints) || [], s = 0; mine.forEach(function (t) { if (r.likes.indexOf(t) >= 0) s += 1; else if (r.dis.indexOf(t) >= 0) s -= .5; }); return Math.max(0, Math.min(1, s / 3)); };
  R.stage = function (id) { var q = rs(id); return !q.met ? 'Unbekannt' : q.r >= 50 ? 'Verliebt' : q.r >= 20 ? 'Interesse' : q.f >= 40 ? 'Befreundet' : q.f >= 15 ? 'Bekannt' : 'Neu kennengelernt'; };
  function clamp(v) { return Math.max(0, Math.min(100, v)); }
  function C() { return GL.core; }
  function esc(t) { return C().esc(t); }

  /* ---------- Menü ---------- */
  var cur = null;   /* gerade angesprochene Person */
  function head(r) { var q = rs(r.id); return esc(r.job) + ' · ' + r.age + ' Jahre · ' + esc(r.tr) + '<br><small>' + R.stage(r.id) + ' · Freundschaft ' + Math.round(q.f) + (q.r ? ' · Romantik ' + Math.round(q.r) : '') + '</small>'; }
  function menu(r) {
    cur = r; var q = rs(r.id), d = dist(r.d), s = R.spot(r.id), sp = s >= 0 ? d.sp[s] : null, today = GL.S.life.day;
    if (!q.met) { q.met = today; GL.save(); C().toast('Neuer Kontakt: ' + r.n + ' (App „Bewohner“)'); }
    var items = [], now = GL.life.hour(), open = sp && sp.open[0] < sp.open[1] ? now >= sp.open[0] && now < sp.open[1] : sp && (now >= sp.open[0] || now < sp.open[1]);
    items.push({ e: '💬', t: 'Plaudern', s: q.last === today ? 'Heute schon geplaudert, tut trotzdem gut.' : 'Ein paar Minuten reden.', fn: function () { talk(r); } });
    items.push({ e: '🗣️', t: 'Ein Thema ansprechen', s: q.topic === today ? 'Heute hast du schon ein Thema angesprochen.' : 'Was interessiert die Person?', dis: q.topic === today, fn: function () { topics(r); } });
    items.push({ e: sp ? sp.e : '🕒', t: 'Zusammen Zeit verbringen', s: !sp ? '' : q.f < 10 ? 'Lernt euch erst ein bisschen kennen.' : !open ? sp.n + ' hat gerade zu.' : sp.n + (sp.cost ? ' (' + sp.cost * 2 + ' € für beide)' : '') + ' · ' + sp.min + ' Min.', dis: !sp || q.f < 10 || !open, fn: function () { together(r, sp); } });
    var why = !r.into ? 'Sieht in dir einen Freund. Das ist in Ordnung.' : partner() ? 'Du bist in einer Beziehung.' : q.no >= 3 ? 'Hat klar gesagt, dass es für sie/ihn nicht passt.' : q.lock > today ? 'Lass etwas Zeit vergehen.' : q.asked === today ? 'Heute schon gefragt.' : q.f < 30 ? 'Ab Freundschaft 30.' : !sp ? '' : !open ? sp.n + ' hat gerade zu.' : '';
    if (r.into || q.r) items.push({ e: '💌', t: 'Zum Date einladen', s: why || 'Ein Date am Ort. Die Person entscheidet frei.', dis: !!why || !sp, fn: function () { invite(r, sp); } });
    items.push({ e: '✖', t: 'Schließen', fn: GL.ui.close });
    GL.ui.menu(r.n, head(r), items, 'res');
  }
  function after(r, msg) { GL.save(); GL.ui.menu(r.n, esc(msg), [{ e: '👍', t: 'Weiter', fn: function () { menu(r); } }, { e: '✖', t: 'Schließen', fn: GL.ui.close }], 'res'); }
  function talk(r) {
    var q = rs(r.id), today = GL.S.life.day, line;
    q.talks++; GL.life.advance(10);
    if (q.last !== today) { q.last = today; q.f = clamp(q.f + 4); GL.life.change({ social: 8 }); } else GL.life.change({ social: 2 });
    var need = [25, 55][q.story];
    if (need !== undefined && q.f >= need) { line = r.story[q.story]; q.story++; q.f = clamp(q.f + 5); line = '„' + line + '“ (Persönliche Geschichte, Freundschaft +5)'; }
    else line = '„' + [r.fav, 'Schön, dich zu sehen. Wie läuft dein Tag?', 'In ' + dist(r.d).n + ' ist immer etwas los, wenn man hinsieht.'][Math.floor(hash(r.id + today + q.talks) * 3)] + '“';
    after(r, line); C().sfx('tap');
  }
  function topics(r) {
    var T = GL.dating.TOPICS, keys = Object.keys(T), today = GL.S.life.day, pick = keys.slice().sort(function (a, b) { return hash(r.id + today + a) - hash(r.id + today + b); }).slice(0, 4);
    GL.ui.menu(r.n + ': Thema', 'Worüber möchtest du sprechen?', pick.map(function (k) {
      return { e: '▸', t: T[k].n, s: T[k].q, fn: function () {
        var q = rs(r.id), like = r.likes.indexOf(k) >= 0, dis = r.dis.indexOf(k) >= 0; q.topic = today; GL.life.advance(10);
        var df = like ? 5 : dis ? 0 : 2; q.f = clamp(q.f + df); GL.life.change({ social: like ? 6 : 3 }, like ? 2 : 0);
        after(r, like ? '„Oh, ' + T[k].n + '! Da könnte ich stundenlang reden.“ (Freundschaft +5)' : dis ? '„' + T[k].n + ' ist nicht so meins, aber danke, dass du fragst.“' : '„Da kenne ich mich nur halb aus, erzähl ruhig.“ (Freundschaft +2)');
      } };
    }).concat([{ e: '◀', t: 'Zurück', fn: function () { menu(r); } }]), 'res');
  }
  function together(r, sp) {
    var q = rs(r.id), price = (sp.cost || 0) * 2;
    if (price && !GL.eco.spend(price, sp.n + ' mit ' + r.n)) { C().toast('Das kostet ' + price + ' €.'); C().sfx('no'); return; }
    GL.ui.fade(sp.e + ' ' + sp.n + ' mit ' + r.n + ' …', function () {
      GL.life.advance(sp.min); GL.life.change(sp.d || {}, (sp.b || 0) + 2); GL.life.change({ social: 6 }); q.f = clamp(q.f + 6);
      GL.save(); C().toast('Schöne Zeit mit ' + r.n + '. Freundschaft +6'); menu(r);
    }, 800);
  }

  /* ---------- Date ---------- */
  var BEATS = [
    ['Ihr sitzt nebeneinander. Die Stimmung ist ruhig.', [['Fragen, wie es der Person wirklich geht, und zuhören', 2], ['Ein lustiges Foto zeigen', 1], ['Dauernd aufs Handy schauen', 0]]],
    ['Es wird kurz still.', [['Die Stille aushalten und lächeln', 2], ['Schnell das Thema wechseln', 1], ['Etwas Peinliches erzählen, um zu beeindrucken', 0]]],
    ['Zum Abschied wird es persönlich.', [['Ehrlich sagen, dass der Abend schön war, und fragen, ob wiederholen gewünscht ist', 2], ['Ein Kompliment machen', 1], ['Ungefragt zu nah kommen', 0]]]
  ];
  function invite(r, sp) {
    var q = rs(r.id), today = GL.S.life.day, score = q.f * .5 + q.r * .5 + R.compat(r) * 20 + (GL.life.mood() - 50) * .25 + hash(r.id + today) * 10;
    q.asked = today;
    if (score < 28) { q.no++; q.lock = today + 2; q.f = clamp(q.f - 2); GL.save(); after(r, '„Das ist lieb gemeint, aber heute lieber nicht. Vielleicht ein andermal.“ ' + (q.no >= 3 ? '(Nach mehreren Absagen: Lass es gut sein. Eine klare Antwort zählt.)' : '')); return; }
    var price = (sp.cost || 0) * 2; if (price && !GL.eco.spend(price, 'Date mit ' + r.n)) { C().toast('Das kostet ' + price + ' €.'); return; }
    var pts = 0, i = 0;
    function beat() { var b = BEATS[i]; GL.ui.menu('Date mit ' + r.n + ' · ' + sp.n, esc(b[0]), b[1].slice().sort(function () { return Math.random() - .5; }).map(function (o) { return { e: '▸', t: o[0], fn: function () { pts += o[1]; C().sfx(o[1] === 2 ? 'ok' : o[1] ? 'tap' : 'no'); if (++i < 3) beat(); else end(); } }; }), 'res'); }
    function end() {
      var add = 3 + pts * 3; if (pts <= 1) add = 0;
      GL.ui.fade('Das Date …', function () {
        GL.life.advance(Math.round(sp.min * 1.5)); GL.life.change(sp.d || {}, 3); GL.life.change({ social: 10, stress: -6 }); q.f = clamp(q.f + 3 + pts); q.r = clamp(q.r + add); q.dates++;
        if (pts <= 1) q.lock = today + 3;
        GL.save();
        after(r, pts >= 5 ? '„Das war ein wunderschöner Abend.“ Ihr verabschiedet euch mit einer langen Umarmung' + (q.r >= 50 ? ' und einem Kuss' : '') + '. (Romantik +' + add + ')' : pts >= 3 ? '„Es war nett. Ich melde mich.“ (Romantik +' + add + ')' : '„Ich glaube, wir sind auf verschiedenen Wellenlängen.“ Ihr geht freundlich auseinander. Ein Date braucht Aufmerksamkeit und Respekt.');
      }, 900);
    }
    beat();
  }

  /* ---------- Figuren im Viertel ---------- */
  var figs = {}, acc = 0;
  function figFor(r, W) {
    var f = figs[r.id]; if (f) return f;
    f = figs[r.id] = { g: C().makePerson(r.look), x: 0, z: 0, tx: 0, tz: 0, sp: -2 }; f.g.visible = false; W.scene.add(f.g); return f;
  }
  var POS = [[-26, -16], [0, -16], [26, -16], [0, 9]];
  function target(r, s, k) { var d = dist(r.d), p = POS[s], side = k % 2 ? 2.6 : -2.6; return { x: d.cx + p[0] + side, z: d.cz + p[1] + 3.4 }; }
  GL.on('tick', function (dt, W) {
    var d = GL.dist.cur(), wk = GL.people.isWeekend(), h = GL.life.hour();
    RES.forEach(function (r, k) {
      var f = figs[r.id];
      if (r.d !== d || W.inside) { if (f) f.g.visible = false; return; }
      f = figFor(r, W);
      var s = R.spotAt(r, h, wk);
      if (s !== f.sp) { var first = f.sp === -2 || !f.g.visible; f.sp = s; if (s >= 0) { var t = target(r, s, RES.indexOf(r)); f.tx = t.x; f.tz = t.z; if (first || f.home) { f.x = t.x; f.z = t.z; } } f.home = s < 0; }
      f.g.visible = s >= 0;
      if (s < 0) return;
      var dx = f.tx - f.x, dz = f.tz - f.z, dd = Math.hypot(dx, dz), mv = dd > .15;
      if (mv) { var st = Math.min(dd, dt * 3); f.x += dx / dd * st; f.z += dz / dd * st; f.g.rotation.y = Math.atan2(dx, dz); }
      else f.g.rotation.y = 0;
      f.g.position.set(f.x, 0, f.z); C().animPerson(f.g, mv ? 1 : 0, W.t);
    });
  });
  GL.on('worldBuilt', function (W) {
    RES.forEach(function (r) {
      W.inter.push({ get x() { return figs[r.id] ? figs[r.id].x : 1e5; }, get z() { return figs[r.id] ? figs[r.id].z + 1.2 : 1e5; }, r: 2.4, get on() { var f = figs[r.id]; return !!f && f.g.visible && GL.dist.cur() === r.d; }, label: 'Ansprechen: ' + r.n, fn: function () { menu(r); } });
    });
  });
  R.talkTo = menu;

  GL.phone.register('res', 'Bewohner', '🏘️', function () {
    var met = RES.filter(function (r) { return rs(r.id).met; });
    if (!met.length) return '<p class="sub">Sprich in den Vierteln mit Leuten, dann erscheinen sie hier. Jede Person hat ihren eigenen Tagesplan.</p>';
    return met.map(function (r) { var q = rs(r.id); return '<div class="pcard"><b>' + esc(r.n) + '</b> · ' + esc(dist(r.d).n) + '<br><small class="sub">' + esc(r.job) + ' · ' + R.stage(r.id) + ' · Freundschaft ' + Math.round(q.f) + (q.r ? ' · Romantik ' + Math.round(q.r) : '') + '<br>Gerade: ' + esc(R.where(r.id)) + (q.dates ? ' · ' + q.dates + ' Dates' : '') + '</small></div>'; }).join('');
  });
})();
