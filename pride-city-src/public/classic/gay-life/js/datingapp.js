/* GayLife – Handy-Apps „Nachrichten“, „Dating“ (fiktive App, nur im Spiel, keine echten Nutzer) und „Kalender“.
   Alle drei bedienen die Spielsysteme aus dating.js, messages.js und life.js. */
(function () {
  'use strict';
  var S = GL.S, ph = GL.phone, D = GL.dating;
  function esc(t) { return GL.core.esc(t); }
  var sub = null; // Unteransicht der Dating-App
  var sel = [];   // Auswahl im Profil-Editor

  ph.badge = function (id) { return id === 'msgs' ? GL.msg.unread() : 0; };
  function nm(id) { return GL.social.npc(id).n; }
  function ageOf(id) { var d = GL.core.DATES.filter(function (x) { return x.id === id; })[0]; return d ? d.age : ''; }
  function chips(list, mark) { return list.map(function (t) { return '<span class="chip' + (mark && mark.indexOf(t) >= 0 ? ' on' : '') + '">' + esc(D.TOPICS[t].n) + '</span>'; }).join(' '); }

  /* ---------- Nachrichten ---------- */
  ph.register('msgs', 'Nachrichten', '💬', function () {
    var h = '';
    if (!S.msgs.length) return '<div class="pcard"><small class="sub">Noch keine Nachrichten. Wer dich kennenlernt, meldet sich irgendwann.</small></div>';
    S.msgs.slice(0, 20).forEach(function (m) {
      var n = GL.social.npc(m.n);
      h += '<div class="pcard"><b>' + esc(n ? n.n : '?') + '</b> ' + (m.u ? '<span class="chip on">neu</span>' : '') + ' <small class="sub">Tag ' + m.d + ', ' + esc(m.h) + '</small><br>' + esc(m.t);
      if (m.r && !m.done) h += '<div class="row" style="margin-top:8px">' + m.r.map(function (o, k) { return '<button class="btn sm" data-mr="' + m.id + '|' + k + '">' + esc(o[0]) + '</button>'; }).join('') + '</div>';
      else if (m.r && m.done) h += '<br><small class="sub">Beantwortet.</small>';
      h += '</div>';
    });
    return h;
  }, function (root) {
    [].forEach.call(root.querySelectorAll('[data-mr]'), function (b) {
      b.onclick = function () {
        var p = b.dataset.mr.split('|'), id = +p[0], m = S.msgs.filter(function (x) { return x.id === id; })[0];
        var ans = GL.msg.reply(id, +p[1]); if (ans) { GL.msg.later(m.n, ans, null, 20); GL.core.sfx('ok'); }
        ph.refresh();
      };
    });
    var any = 0; S.msgs.forEach(function (m) { if (m.u) { m.u = 0; any = 1; } }); if (any) GL.save();
  });

  /* ---------- Dating-App ---------- */
  function profileCard(id) {
    var p = D.PROF[id], r = S.rel[id] ? D.rel(id) : null, c = Math.round(D.compat(id) * 100), sh = D.shared(id), met = !!r;
    var h = '<div class="pcard"><div class="prow"><div class="pav">' + GL.core.avatar(GL.social.npc(id).look, ['#6a3cc8', '#ff5fa8']) + '</div><div style="flex:1;min-width:0"><b>' + esc(nm(id)) + ', ' + ageOf(id) + '</b><br><small class="sub">' + esc(p.job) + '</small></div></div>' +
      '<small class="sub">' + esc(nm(id)) + ' ist ' + esc(p.trait) + '. Sucht: ' + esc(p.goal) + '.</small><div style="margin-top:6px">' + chips(p.likes, sh) + '</div>' +
      '<small class="sub">Passung ' + c + ' %' + (sh.length ? ' · ' + sh.length + ' gemeinsame Interessen' : '') + '</small><div class="bar pbar"><i style="width:' + c + '%;background:#ff4f9a"></i></div>' +
      '<small class="sub">' + (met ? esc(D.stage(id)) + ' · Freundschaft ' + r.f : 'Noch kein Kontakt') + '</small><div class="row" style="margin-top:8px">';
    var today = r && r.appDay === S.life.day;
    if (!r || r.f < 30) h += '<button class="btn sm pri" data-op="' + id + '"' + (today ? ' disabled' : '') + '>' + (today ? 'Heute geschrieben' : 'Nachricht schreiben') + '</button>';
    var open = S.cal.some(function (a) { return a.npc === id && a.st === 'open'; });
    if (r && r.f >= 10 && r.st !== 'closed' && !open) h += '<button class="btn sm" data-mt="' + id + '">Treffen vorschlagen</button>';
    if (open) h += '<span class="chip on">Treffen vereinbart</span>';
    return h + '</div></div>';
  }
  function datingView() {
    var h = '', ints = D.ints();
    if (sub && sub.t === 'edit' || !ints.length) {
      if (!sub) sel = [];
      h += '<p class="sub">Wähle bis zu drei Interessen für dein Profil. Je mehr du mit jemandem gemeinsam hast, desto besser passt ihr zusammen. Die App gibt es nur im Spiel, es gibt keine echten Nutzer.</p><div class="row">';
      Object.keys(D.TOPICS).forEach(function (t) { h += '<button class="btn sm' + (sel.indexOf(t) >= 0 ? ' pri' : '') + '" data-in="' + t + '">' + esc(D.TOPICS[t].n) + '</button>'; });
      return h + '</div><div class="row" style="margin-top:12px"><button class="btn pri" id="dsave"' + (sel.length ? '' : ' disabled') + '>Profil speichern</button></div>';
    }
    if (sub && sub.t === 'opener') {
      var id = sub.id, sh = D.shared(id), p = D.PROF[id];
      h += '<div class="pcard"><b>Nachricht an ' + esc(nm(id)) + '</b><br><small class="sub">Wie beginnst du?</small></div>';
      var opts = [];
      if (sh.length) opts.push(['Ich habe gesehen, dass du auch ' + D.TOPICS[sh[0]].n + ' magst. Erzähl mal!', 'shared']);
      opts.push(['Hey! Dein Profil ist mir aufgefallen. Wie war dein Tag?', 'plain']);
      opts.push(['Du siehst auf deinen Fotos richtig sympathisch aus.', 'comp']);
      opts.forEach(function (o, k) { h += '<button class="row2" data-ot="' + k + '"><span style="flex:1">' + esc(o[0]) + '</span></button>'; });
      sub.opts = opts;
      return h + '<div class="row" style="margin-top:8px"><button class="btn sm" id="dback">Zurück</button></div>';
    }
    if (sub && sub.t === 'meet') {
      var pid = sub.id; h += '<div class="pcard"><b>Treffen mit ' + esc(nm(pid)) + '</b><br><small class="sub">Wo möchtest du dich treffen?</small></div>';
      D.PLACES.filter(function (x) { return x.id === 'cafe' || x.id === 'park'; }).forEach(function (pl) { h += '<button class="row2" data-mp="' + pl.id + '"><span style="flex:1"><b>' + esc(pl.n) + '</b><br><small class="sub">' + esc(pl.t) + (pl.cost ? ' · ' + pl.cost + ' €' : '') + '</small></span></button>'; });
      return h + '<div class="row" style="margin-top:8px"><button class="btn sm" id="dback">Zurück</button></div>';
    }
    if (sub && sub.t === 'meet2') {
      var pl2 = D.PLACES.filter(function (x) { return x.id === sub.place; })[0], d = S.life.day, hh = GL.life.hour(), slots = [];
      [[d, 17], [d + 1, 11], [d + 1, 17], [d + 2, 15]].forEach(function (q) { if (q[0] === d && q[1] < hh + 1.5) return; if (q[1] < pl2.from || q[1] >= pl2.to) return; if (S.cal.some(function (a) { return a.st === 'open' && a.d === q[0] && Math.abs(a.h - q[1]) < 3; })) return; slots.push(q); });
      h += '<div class="pcard"><b>' + esc(pl2.n) + '</b><br><small class="sub">Wann passt es dir?</small></div>';
      slots.forEach(function (q, k) { h += '<button class="row2" data-ms="' + k + '"><span style="flex:1">' + D.dayText(q[0]) + ', ' + D.hourText(q[1]) + ' Uhr</span></button>'; });
      if (!slots.length) h += '<p class="sub">Heute passt nichts mehr. Wähle einen anderen Ort.</p>';
      sub.slots = slots;
      return h + '<div class="row" style="margin-top:8px"><button class="btn sm" id="dback">Zurück</button></div>';
    }
    h += '<div class="pcard"><b>Dein Profil</b><br><div style="margin:6px 0">' + chips(ints, ints) + '</div><button class="btn sm" id="dedit">Interessen ändern</button></div>';
    D.IDS.forEach(function (id) { h += profileCard(id); });
    return h;
  }
  ph.register('dating', 'Dating', '💘', datingView, function (root) {
    var e, go = function (s) { sub = s; ph.refresh(); };
    [].forEach.call(root.querySelectorAll('[data-in]'), function (b) { b.onclick = function () { var t = b.dataset.in, i = sel.indexOf(t); if (i >= 0) sel.splice(i, 1); else if (sel.length < 3) sel.push(t); sub = sub || { t: 'edit' }; ph.refresh(); }; });
    if ((e = root.querySelector('#dsave'))) e.onclick = function () { S.dating.ints = sel.slice(); GL.save(); GL.core.sfx('ok'); go(null); };
    if ((e = root.querySelector('#dedit'))) e.onclick = function () { sel = D.ints().slice(); go({ t: 'edit' }); };
    if ((e = root.querySelector('#dback'))) e.onclick = function () { go(null); };
    [].forEach.call(root.querySelectorAll('[data-op]'), function (b) { b.onclick = function () { go({ t: 'opener', id: b.dataset.op }); }; });
    [].forEach.call(root.querySelectorAll('[data-mt]'), function (b) { b.onclick = function () { go({ t: 'meet', id: b.dataset.mt }); }; });
    [].forEach.call(root.querySelectorAll('[data-mp]'), function (b) { b.onclick = function () { go({ t: 'meet2', id: sub.id, place: b.dataset.mp }); }; });
    [].forEach.call(root.querySelectorAll('[data-ot]'), function (b) {
      b.onclick = function () {
        var id = sub.id, kind = sub.opts[+b.dataset.ot][1], r = D.rel(id), sh = D.shared(id); r.appDay = S.life.day;
        var df = kind === 'shared' ? 8 : kind === 'plain' ? 4 : D.PROF[id].slow ? 2 : 4; if (GL.life.mood() >= 70) df += 2;
        r.f = GL.clamp(r.f + df, 0, 100); D.mem(id, 'Kontakt über die Dating-App'); GL.life.advance(10); GL.life.change({ social: 5 });
        var reply = kind === 'shared' ? 'Hey! Schön, dass du fragst. ' + D.TOPICS[sh[0]].n + ' ist wirklich eins meiner Lieblingsthemen. Wie war dein Tag?' : kind === 'plain' ? 'Hallo! Danke für die Nachricht. Mein Tag war ruhig. Und deiner?' : 'Oh, danke. Das ist lieb. Und du? Was machst du so in Rainbow City?';
        GL.msg.later(id, reply, null, 45); GL.core.sfx('ok'); GL.core.toast('Nachricht an ' + nm(id) + ' gesendet.'); GL.save(); go(null);
      };
    });
    [].forEach.call(root.querySelectorAll('[data-ms]'), function (b) {
      b.onclick = function () {
        var id = sub.id, q = sub.slots[+b.dataset.ms], r = D.rel(id), pl = D.PLACES.filter(function (x) { return x.id === sub.place; })[0];
        if (r.lock > S.life.day) { GL.msg.later(id, 'Gerade passt es mir nicht, ich melde mich. Danke für die Einladung!', null, 20); GL.core.toast('Er braucht noch Zeit.'); go(null); return; }
        D.addAppt(id, pl.id, q[0], q[1]); D.mem(id, 'Treffen verabredet: ' + pl.n);
        GL.msg.later(id, 'Gern! ' + D.dayText(q[0]) + ', ' + D.hourText(q[1]) + ' Uhr im ' + pl.n + '. Ich freue mich.', null, 15); GL.core.sfx('ok'); GL.save(); go(null);
      };
    });
  });

  /* ---------- Kalender ---------- */
  ph.register('cal', 'Kalender', '📅', function () {
    var d = S.life.day, h = '<div class="pcard"><b>' + esc(GL.life.weekday()) + ', Tag ' + d + '</b> · ' + GL.life.clock() + ' Uhr' + (GL.people.isWeekend() ? '<br><small class="sub">Wochenende</small>' : '') + '</div>';
    var open = S.cal.filter(function (a) { return a.st === 'open'; }).sort(function (a, b) { return (a.d * 24 + a.h) - (b.d * 24 + b.h); });
    h += '<div class="lab">Anstehend</div>';
    if (!open.length) h += '<p class="sub">Keine Termine. Lade jemanden zu einem Date ein oder verabrede dich über die Dating-App.</p>';
    open.forEach(function (a, k) { h += '<div class="pcard"><b>' + esc(nm(a.npc)) + '</b><br><small class="sub">' + D.dayText(a.d) + ', ' + D.hourText(a.h) + ' Uhr · ' + esc(D.placeName(a.place)) + '</small><div class="row" style="margin-top:6px"><button class="btn sm" data-cc="' + S.cal.indexOf(a) + '">Absagen</button></div></div>'; });
    var past = S.cal.filter(function (a) { return a.st !== 'open'; }).slice(-4).reverse();
    if (past.length) { h += '<div class="lab">Zuletzt</div>'; past.forEach(function (a) { h += '<div class="pline prow"><span style="flex:1">' + esc(nm(a.npc)) + ' · ' + esc(D.placeName(a.place)) + '<br><small class="sub">Tag ' + a.d + '</small></span><b>' + (a.st === 'done' ? '✅' : a.st === 'missed' ? '❌ verpasst' : 'abgesagt') + '</b></div>'; }); }
    return h;
  }, function (root) {
    [].forEach.call(root.querySelectorAll('[data-cc]'), function (b) {
      b.onclick = function () {
        var a = S.cal[+b.dataset.cc]; if (!a || a.st !== 'open') return; a.st = 'cancel'; var r = D.rel(a.npc); r.f = GL.clamp(r.f - 1, 0, 100); D.mem(a.npc, 'Termin abgesagt');
        GL.msg.later(a.npc, 'Schade, aber danke, dass du vorher Bescheid sagst. Wir finden einen neuen Termin.', null, 20); GL.save(); ph.refresh();
      };
    });
  });
})();
