/* GayLife – Mehrspieler-Ausbau auf dem bestehenden Raum (PIN oder QR-Code, direkt von Gerät zu Gerät, bis 4 Leute):
   - Ort: Du siehst nur Leute am selben Ort (Pride District, Viertel, eine Wohnung). Die Position wird relativ zum Ort gesendet.
   - Besuch in der Wohnung: nur mit Zustimmung des Gastgebers; der Gast sieht dessen Einrichtung.
   - Gruppentanz im Club: alle tanzen dieselben Songs, bei guter Leistung aller gibt es einen Bonus.
   - Gruppenfoto und Foto-App: Countdown für alle am Ort, Bild lokal speichern (nicht hochgeladen).
   Nachrichten laufen über den Umschlag { t:'x', k:Art, d:Daten, to? } (GL.mp.send), Eingaben werden geprüft. */
(function () {
  'use strict';
  var M = GL.multi = {};
  var visit = null, pending = '', hosting = null, groups = {}, curGroup = '', C = function () { return GL.core; };
  function esc(t) { return C().esc(t); }
  function nm(id) { return GL.mp.name(id); }

  /* ---------- Ort ---------- */
  M.loc = function () {
    var W = GL.W;
    if (W && W.inside) return { l: 'h:' + (visit ? visit.owner : GL.mp.me() || 'x'), ox: GL.home.O.x, oz: GL.home.O.z };
    if (GL.dist && GL.dist.cur()) { var d = GL.dist.LIST.filter(function (q) { return q.id === GL.dist.cur(); })[0]; return { l: 'd:' + d.id, ox: d.cx, oz: d.cz }; }
    return { l: 'k', ox: 0, oz: 0 };
  };
  GL.on('mploc', function () { return M.loc(); });
  function peersHere() { var me = M.loc().l, o = {}, pe = GL.mp.peers(); Object.keys(pe).forEach(function (k) { if (pe[k].l === me) o[k] = pe[k]; }); return o; }
  M.peersHere = peersHere;

  /* ---------- Besuch ---------- */
  function goHome() { if (GL.dist && GL.dist.cur()) GL.dist.leave(); if (!GL.home.inside()) GL.home.enter(); }
  M.visitPeer = function (id) {
    if (!GL.mp.on() || !GL.mp.peers()[id]) return;
    if (visit || hosting) { C().toast('Beende zuerst den aktuellen Besuch.'); return; }
    pending = id; GL.mp.send('visit', {}, id); C().toast('Besuchsanfrage an ' + nm(id) + ' gesendet.');
    setTimeout(function () { if (pending === id) { pending = ''; C().toast(nm(id) + ' hat nicht geantwortet.'); } }, 30000);
  };
  function endVisit(leave) { if (!visit) return; visit = null; GL.furn.setVisit(null); if (leave && GL.home.inside()) GL.home.leave(true); }
  function endHosting() { if (hosting) { GL.mp.send('vend', {}, hosting.guest); hosting = null; } }
  GL.on('mpx', function (from, k, d) {
    if (k === 'visit') {
      if (visit || hosting) { GL.mp.send('vno', { why: 'busy' }, from); return; }
      GL.ui.menu('Besuch', esc(nm(from)) + ' möchte dich zu Hause besuchen. Du entscheidest.', [
        { e: '🚪', t: 'Einlassen', fn: function () { GL.ui.close(); hosting = { guest: from }; goHome(); GL.mp.send('vok', { pl: GL.S.home.placed }, from); } },
        { e: '✋', t: 'Ablehnen', s: 'Dein Nein ist in Ordnung. Er bekommt nur eine höfliche Absage.', fn: function () { GL.ui.close(); GL.mp.send('vno', {}, from); } }], 'visit');
    } else if (k === 'vok') {
      if (pending !== from) return; pending = ''; visit = { owner: from }; GL.furn.setVisit(d && d.pl || {}); goHome(); C().toast('Du bist bei ' + nm(from) + ' zu Besuch.');
    } else if (k === 'vno') {
      if (pending === from) { pending = ''; C().toast(d && d.why === 'busy' ? nm(from) + ' hat gerade Besuch oder ist selbst zu Besuch.' : nm(from) + ' möchte gerade keinen Besuch.'); }
    } else if (k === 'vend') {
      if (visit && visit.owner === from) { endVisit(true); C().toast(nm(from) + ' hat den Besuch beendet.'); }
    } else if (k === 'dance') {
      invite(from, d);
    } else if (k === 'djoin') {
      var g = grp(d && d.gid); if (g) g.joined[from] = 1;
    } else if (k === 'dscore') {
      var g2 = grp(d && d.gid); if (g2) { g2.joined[from] = 1; g2.scores[from] = Math.max(0, Math.min(6, +d.pts | 0)); check(g2); }
    } else if (k === 'photo') {
      if (peersHere()[from]) countdown(from);
    }
  });
  var acc = 0;
  GL.on('tick', function (dt) {
    acc += dt; if (acc < 1) return; acc = 0;
    /* Erst beenden, wenn man wirklich drin war (der Szenenwechsel dauert, besonders auf langsamen Geräten) */
    var inH = GL.home.inside();
    if (visit) { if (inH) visit.in = 1; else if (visit.in) endVisit(false); }
    if (hosting) { if (inH) hosting.in = 1; else if (hosting.in) endHosting(); }
  });
  GL.on('mpchange', function () {
    var pe = GL.mp.peers();
    if (visit && !pe[visit.owner]) endVisit(true);
    if (hosting && !pe[hosting.guest]) hosting = null;
    if (!GL.mp.on()) { visit && endVisit(true); hosting = null; pending = ''; }
  });
  M.state = function () { return { visit: visit && visit.owner, hosting: hosting && hosting.guest, pending: pending }; };

  /* ---------- Gruppentanz ---------- */
  function rng(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function stylesFor(seed) { var r = rng(seed), all = GL.night.STYLES.slice(), out = []; for (var i = 0; i < 3; i++) out.push(all.splice(Math.floor(r() * all.length), 1)[0]); return out; }
  function grp(gid) { gid = String(gid || '').slice(0, 12); if (!gid) return null; return groups[gid] || (groups[gid] = { gid: gid, joined: {}, scores: {}, shown: false, me: false }); }
  M.startDance = function () {
    if (!GL.mp.on()) return; if (!GL.night.isOpen()) { C().toast('Der Club hat zu.'); return; }
    var gid = String(Date.now() % 1e9) + '', seed = (Math.random() * 4294967295) >>> 0;
    GL.mp.send('dance', { gid: gid, seed: seed }); join(gid, seed);
  };
  function invite(from, d) {
    var gid = String(d && d.gid || '').slice(0, 12), seed = (d && d.seed) >>> 0; if (!gid || curGroup === gid) return;
    var ok = GL.night.isOpen() && GL.S.life.needs.energy >= 15;
    GL.ui.menu('Gruppentanz', esc(nm(from)) + ' lädt zum Gruppentanz im Club ein. Alle tanzen dieselben drei Songs.' + (ok ? '' : '<br>Gerade nicht möglich (Club zu oder du bist zu müde).'), [
      { e: '👯', t: 'Mitmachen', dis: !ok, fn: function () { GL.ui.close(); join(gid, seed); } },
      { e: '✋', t: 'Nein danke', fn: GL.ui.close }], 'dance');
  }
  function join(gid, seed) {
    var g = grp(gid); g.me = true; curGroup = gid; g.joined[GL.mp.me()] = 1; GL.mp.send('djoin', { gid: gid });
    GL.night.dance({ styles: stylesFor(seed), seed: seed, onDone: function (pts) {
      g.scores[GL.mp.me()] = pts; GL.mp.send('dscore', { gid: gid, pts: pts }); g.fin = Date.now();
      GL.ui.menu('Gruppentanz', 'Du hast ' + pts + ' von 6 Punkten. Warte kurz auf die anderen …', [{ e: '⏳', t: 'Ergebnis jetzt zeigen', fn: function () { show(g); } }], 'dance');
      setTimeout(function () { if (!g.shown) show(g); }, 25000); check(g);
    } });
  }
  function check(g) { if (!g.me || g.shown || g.scores[GL.mp.me()] == null) return; var all = Object.keys(g.joined); if (all.every(function (id) { return g.scores[id] != null; })) show(g); }
  function show(g) {
    if (g.shown) return; g.shown = true; curGroup = '';
    var ids = Object.keys(g.scores).sort(function (a, b) { return g.scores[b] - g.scores[a]; }), good = ids.length >= 2 && ids.every(function (id) { return g.scores[id] >= 3; });
    var rows = ids.map(function (id, i) { return (i + 1) + '. ' + (id === GL.mp.me() ? esc(GL.S.name) + ' (du)' : esc(nm(id))) + ': <b>' + g.scores[id] + '</b> von 6'; }).join('<br>');
    if (good) { GL.life.change({ social: 10 }, 4); C().gain(5); C().sfx('ok'); GL.save(); }
    GL.ui.menu('Gruppentanz', rows + (good ? '<br><br><b>Perfekter Gruppengroove!</b> Alle waren gut: Kontakte +10, Laune +4, +5 Glitzer.' : ids.length < 2 ? '<br><br>Die anderen sind nicht mehr dabei.' : '<br><br>Nächstes Mal klappt es noch besser im Takt. Ein Bonus gibt es, wenn alle mindestens 3 Punkte haben.'), [{ e: '👍', t: 'Weiter', fn: GL.ui.close }], 'dance');
  }

  /* ---------- Fotos ---------- */
  var P = M.photos = [];
  function overlay(src, cap) {
    var o = document.getElementById('photo'); if (!o) { o = document.createElement('div'); o.id = 'photo'; o.style.cssText = 'position:fixed;inset:0;background:rgba(10,5,25,.88);z-index:60;display:flex;align-items:center;justify-content:center;padding:16px'; document.body.appendChild(o); }
    o.innerHTML = '<div style="max-width:560px;width:100%;text-align:center"><img src="' + src + '" style="width:100%;border:6px solid #fff;border-radius:6px;box-shadow:0 8px 30px #000a"><p class="sub">' + esc(cap) + '</p><div class="row" style="justify-content:center"><a class="btn pri" id="phDl" download="gaylife-foto.jpg" href="' + src + '">Speichern</a><button class="btn" id="phX">Schließen</button></div></div>';
    o.style.display = 'flex'; document.getElementById('phX').onclick = function () { o.style.display = 'none'; };
  }
  M.snap = function (cap) {
    var W = GL.W; if (!W || !W.on) return null;
    W.R.render(W.scene, W.cam);
    var src = W.R.domElement.toDataURL('image/jpeg', .82), names = [GL.S.name].concat(Object.keys(peersHere()).map(function (id) { return nm(id); })),
      text = (cap || 'Foto') + ' · ' + names.join(', ') + ' · Tag ' + GL.S.life.day + ', ' + GL.life.clock();
    P.unshift({ src: src, cap: text }); if (P.length > 8) P.length = 8;
    C().sfx('ok'); overlay(src, text); return P[0];
  };
  function countdown(from) {
    var n = 3; C().banner('📸 Gruppenfoto' + (from ? ' mit ' + nm(from) : ''), 'Alle lächeln!');
    var iv = setInterval(function () { n--; if (n > 0) { C().toast('📸 ' + n); return; } clearInterval(iv); M.snap('Gruppenfoto'); }, 900);
  }
  M.group = function () { if (!GL.mp.on()) { C().toast('Für ein Gruppenfoto brauchst du einen Mehrspieler-Raum.'); return; } GL.mp.send('photo', {}); countdown(''); };

  /* ---------- Handy-Apps ---------- */
  GL.phone.register('multi', 'Zusammen', '👥', function () {
    if (!GL.mp.on()) return '<p class="sub">Spiele mit bis zu 3 Freunden zusammen. Ein Gerät öffnet einen Raum, die anderen treten per QR-Code oder 6-stelliger PIN bei. Direkt von Gerät zu Gerät.</p><button class="btn pri" id="mxOpen">Raum öffnen / beitreten</button>';
    var h = '<p class="sub">Du siehst Leute am selben Ort. Dein Ort: <b>' + esc({ k: 'Pride District' }[M.loc().l] || M.loc().l) + '</b></p>', pe = GL.mp.peers(), here = peersHere();
    Object.keys(pe).forEach(function (id) { h += '<div class="pcard prow"><div style="flex:1"><b>' + esc(nm(id)) + '</b><br><small class="sub">' + (here[id] ? 'bei dir' : 'woanders') + '</small></div><button class="btn sm" data-v="' + id + '"' + (visit || hosting ? ' disabled' : '') + '>Besuch anfragen</button></div>'; });
    if (!Object.keys(pe).length) h += '<p class="sub">Noch niemand im Raum. PIN und QR-Code stehen im Raum-Fenster.</p>';
    return h + '<div class="row"><button class="btn" id="mxPanel">Raum anzeigen (PIN/QR)</button><button class="btn" id="mxDance"' + (GL.night.isOpen() ? '' : ' disabled') + '>Gruppentanz</button><button class="btn" id="mxPhoto">Gruppenfoto</button></div>' +
      (visit ? '<p class="sub">Du bist zu Besuch bei ' + esc(nm(visit.owner)) + '.</p>' : hosting ? '<p class="sub">' + esc(nm(hosting.guest)) + ' ist bei dir zu Besuch.</p>' : '');
  }, function (p) {
    var b; if ((b = p.querySelector('#mxOpen')) || (b = p.querySelector('#mxPanel'))) b.onclick = function () { GL.phone.close(); GL.mp.panel(); };
    if ((b = p.querySelector('#mxDance'))) b.onclick = function () { GL.phone.close(); M.startDance(); };
    if ((b = p.querySelector('#mxPhoto'))) b.onclick = function () { GL.phone.close(); M.group(); };
    [].forEach.call(p.querySelectorAll('[data-v]'), function (x) { x.onclick = function () { M.visitPeer(x.dataset.v); }; });
  });
  GL.phone.register('photos', 'Fotos', '📷', function () {
    var h = '<div class="row"><button class="btn pri" id="phShot">Foto machen</button>' + (GL.mp.on() ? '<button class="btn" id="phGrp">Gruppenfoto</button>' : '') + '</div><p class="sub">Fotos bleiben auf diesem Gerät und nur, solange das Spiel offen ist. Mit „Speichern“ lädst du sie herunter.</p>';
    P.forEach(function (f, i) { h += '<button class="row2" data-ph="' + i + '"><img src="' + f.src + '" style="width:72px;border-radius:4px"><span style="flex:1;text-align:left"><small class="sub">' + esc(f.cap) + '</small></span></button>'; });
    return h;
  }, function (p) {
    var b; if ((b = p.querySelector('#phShot'))) b.onclick = function () { GL.phone.close(); setTimeout(function () { M.snap('Foto'); }, 150); };
    if ((b = p.querySelector('#phGrp'))) b.onclick = function () { GL.phone.close(); M.group(); };
    [].forEach.call(p.querySelectorAll('[data-ph]'), function (x) { x.onclick = function () { var f = P[+x.dataset.ph]; if (f) overlay(f.src, f.cap); }; });
  });
})();
