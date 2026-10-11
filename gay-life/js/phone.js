/* GayLife – Handy: Status, Aufgaben, Stadtkarte, Kontakte, Finanzen, Einstellungen.
   Jede App liest und bedient echte Spielsysteme (GL.life, GL.eco, GL.social, Aufträge aus dem Kern). Öffnen mit 📱 oder Taste P / Tab. */
(function () {
  'use strict';
  var S = GL.S, L = S.life;
  var ph = GL.phone = {}, cur = 'home';
  var APPS = [
    ['status', 'Status', '💗'], ['tasks', 'Aufgaben', '📋'], ['map', 'Karte', '🗺️'],
    ['contacts', 'Kontakte', '👥'], ['money', 'Finanzen', '💶'], ['settings', 'Einstellungen', '⚙️']
  ];
  function el() { return document.getElementById('phone'); }
  function C() { return GL.core; }
  function esc(t) { return C().esc(t); }

  ph.isOpen = function () { var p = el(); return !!(p && p.classList.contains('on')); };
  ph.open = function (app) { var p = el(); if (!p) return; GL.ui.close(); cur = app || 'home'; p.classList.add('on'); render(); };
  ph.close = function () { var p = el(); if (p) p.classList.remove('on'); };
  ph.toggle = function () { if (ph.isOpen()) ph.close(); else ph.open('home'); };

  function bar(v, col) { return '<div class="bar pbar"><i style="width:' + Math.round(v) + '%;background:' + col + '"></i></div>'; }
  function needCol(v, inv) { var x = inv ? 100 - v : v; return x < 20 ? '#ff5d6c' : x < 40 ? '#ffb020' : '#3ddc84'; }

  var VIEWS = {
    home: function () {
      return '<div class="pgrid">' + APPS.map(function (a) { return '<button class="papp" data-app="' + a[0] + '"><span>' + a[2] + '</span>' + a[1] + '</button>'; }).join('') + '</div>' +
        '<p class="sub" style="text-align:center;margin-top:18px">' + esc(GL.life.weekday()) + ', Tag ' + L.day + ' · ' + GL.life.clock() + ' Uhr<br>' + (GL.home.inside() ? 'Zu Hause' : 'Regenbogenkiez, Rainbow City') + '</p>';
    },
    status: function () {
      var m = GL.life.mood(), h = '<div class="pcard"><b>' + GL.life.moodIcon(m) + ' Stimmung: ' + GL.life.moodName(m) + '</b> (' + m + ')' + bar(m, needCol(m)) + '<small class="sub">Die Stimmung ergibt sich aus allen Bedürfnissen und dem, was du zuletzt erlebt hast. Gute Laune bringt mehr Trinkgeld.</small></div>';
      GL.life.NEED.forEach(function (q) {
        var v = L.needs[q[0]], st = q[0] === 'stress';
        h += '<div class="pcard"><b>' + q[2] + ' ' + q[1] + '</b> <span class="sub">' + Math.round(v) + ' / 100</span>' + bar(v, needCol(v, st)) + '<small class="sub">' + q[3] + '</small></div>';
      });
      h += '<div class="pcard"><b>' + esc(S.name) + '</b><br><small class="sub">Level ' + C().level() + ' · ✨ ' + C().fmt(S.glitzer) + ' Glitzer · 💶 ' + Math.floor(L.money) + ' € · 🧊 ' + L.food + ' Portionen · Barkeeper-Stufe ' + GL.eco.barLevel() + '</small></div>';
      return h;
    },
    tasks: function () {
      var Q = C().QUESTS, q = Q[S.world.q], h = '<div class="pcard"><b>Hauptauftrag</b><br>' + (q ? esc(q.t) + '<br><small class="sub">' + esc(q.d) + '</small>' : '<small class="sub">Alle Aufträge im Regenbogenkiez erledigt. Die Geschichte von Rainbow City geht bald weiter.</small>') + '</div>';
      var SIDE = C().SIDE, any = 0;
      for (var k in SIDE) {
        var st = S.world.side[k] || 0; if (st !== 1) continue; any = 1; var npc = GL.social.npc(k);
        h += '<div class="pcard"><b>' + esc(SIDE[k].t) + '</b> <span class="sub">für ' + esc(npc ? npc.n : k) + '</span><br><small class="sub">' + esc(SIDE[k].hint()) + '</small></div>';
      }
      if (!any) h += '<div class="pcard"><small class="sub">Keine offenen Nebenaufträge. Sprich mit den Leuten in der Stadt, manche brauchen Hilfe.</small></div>';
      var w = S.world;
      if (w.dog === 1 || w.dog === 2) h += '<div class="pcard"><b>Gerd suchen</b><br><small class="sub">' + (w.dog === 1 ? 'Dennis’ Dackel ist irgendwo im Osten hinter den Häusern.' : 'Gerd folgt dir. Bring ihn zu Dennis am Brunnen.') + '</small></div>';
      if (w.cat === 1 || w.cat === 2) h += '<div class="pcard"><b>Pixel suchen</b><br><small class="sub">' + (w.cat === 1 ? 'Kais Kater streunt im Park im Osten.' : 'Pixel folgt dir. Bring ihn zu Kai auf den Platz.') + '</small></div>';
      // Alltag: niedrigstes Bedürfnis
      var low = GL.life.NEED.filter(function (x) { return x[0] !== 'stress'; }).sort(function (a, b) { return L.needs[a[0]] - L.needs[b[0]]; })[0];
      if (L.needs[low[0]] < 45) h += '<div class="pcard"><b>Alltag: ' + low[2] + ' ' + low[1] + '</b><br><small class="sub">' + low[3] + '</small></div>';
      if (L.needs.stress > 60) h += '<div class="pcard"><b>Alltag: 🌀 Stress abbauen</b><br><small class="sub">Fernsehen zu Hause, Sauna oder eine Runde schlafen.</small></div>';
      h += '<div class="pcard"><small class="sub">Regenbogen-Sterne: ' + w.stars.length + ' / ' + C().STARS.length + '</small></div>';
      return h;
    },
    map: function () {
      var W = GL.W, p = W ? W.player : { x: 0, z: 0 }, inside = GL.home.inside(), POIS = C().POIS, k = GL.eco.KIOSK;
      var px = inside ? W.pois.home.x : p.x, pz = inside ? W.pois.home.z : p.z, dir = W ? W.yaw : 0;
      var s = '<svg class="pmap" viewBox="-102 -74 204 148"><rect x="-102" y="-74" width="204" height="148" fill="#8fcf9b"/><rect x="-115" y="-75" width="230" height="150" fill="#cdc3dc"/>' +
        '<rect x="-115" y="-6" width="230" height="12" fill="#3a3750"/><rect x="-6" y="-75" width="12" height="150" fill="#3a3750"/><rect x="69" y="-21" width="34" height="62" fill="#7fd18a"/><circle cx="86" cy="14" r="7" fill="#59c8ff"/><circle r="11" fill="#efe6f7"/>';
      POIS.forEach(function (o) { s += '<g data-p="' + o.id + '" class="pm"><rect x="' + (o.x - 7) + '" y="' + (o.z - 7) + '" width="14" height="14" rx="2" fill="#' + ('000000' + o.c.toString(16)).slice(-6) + '"/><text x="' + o.x + '" y="' + (o.z + 3) + '" font-size="8" text-anchor="middle">' + o.e + '</text></g>'; });
      s += '<g data-p="kiosk" class="pm"><rect x="' + (k.x - k.w / 2) + '" y="' + (k.z - k.d / 2) + '" width="' + k.w + '" height="' + k.d + '" fill="#2e8b6e"/><text x="' + k.x + '" y="' + (k.z + 3) + '" font-size="6" text-anchor="middle">🛒</text></g>';
      s += '<g transform="translate(' + px.toFixed(1) + ' ' + pz.toFixed(1) + ') rotate(' + (-dir * 180 / Math.PI).toFixed(0) + ')"><circle r="3.4" fill="#fff" stroke="#ff3b6b" stroke-width="1.4"/><path d="M0 6 L-2.4 1.6 L2.4 1.6Z" fill="#ff3b6b"/></g></svg>';
      var list = POIS.map(function (o) { var g = C().gameOf(o.g), d = W.pois[o.id]; return { id: o.id, e: o.e, n: o.n, s: g ? g.d : 'Dein Zuhause: schlafen, duschen, kochen, umziehen', x: d.x, z: d.z, best: g ? C().bestOf(g) : '' }; });
      var kp = GL.eco.kioskPos; list.push({ id: 'kiosk', e: '🛒', n: 'Späti Lecker', s: 'Essen, Kaffee und Lebensmittel, rund um die Uhr', x: kp.x, z: kp.z, best: '' });
      list.sort(function (a, b) { return Math.hypot(a.x - px, a.z - pz) - Math.hypot(b.x - px, b.z - pz); });
      s += '<p class="sub">Tippe einen Ort an: Die Tram bringt dich vor die Tür (10 Min.).</p>';
      list.forEach(function (o) { s += '<button class="row2" data-p="' + o.id + '"><span class="e">' + o.e + '</span><span style="flex:1"><b>' + esc(o.n) + '</b><br><small class="sub">' + esc(o.s) + '</small>' + (o.best ? '<br><small class="chip">' + esc(o.best) + '</small>' : '') + '</span><small class="sub">' + Math.round(Math.hypot(o.x - px, o.z - pz)) + ' m</small></button>'; });
      return s;
    },
    contacts: function () {
      var ids = Object.keys(S.rel).filter(function (id) { return GL.social.npc(id); }).sort(function (a, b) { return S.rel[b].f - S.rel[a].f; }), all = C().NPCDEF.length;
      var h = '<p class="sub">' + ids.length + ' von ' + all + ' Leuten im Kiez kennengelernt. Ein Gespräch pro Tag stärkt eure Freundschaft.</p>';
      ids.forEach(function (id) {
        var r = S.rel[id], n = GL.social.npc(id);
        h += '<div class="pcard prow"><div class="pav">' + C().avatar(n.look, ['#6a3cc8', '#ff5fa8']) + '</div><div style="flex:1;min-width:0"><b>' + esc(n.n) + '</b> <span class="sub">' + GL.social.level(r.f) + '</span>' + bar(r.f, '#ff4f9a') +
          '<small class="sub">Kennengelernt an Tag ' + r.met + ' · ' + r.talks + ' Gespräche' + (r.last === L.day ? ' · heute gesprochen' : '') + '</small></div></div>';
      });
      if (!ids.length) h += '<div class="pcard"><small class="sub">Noch niemand. Sprich Leute in der Stadt an (E oder Knopf unten).</small></div>';
      return h;
    },
    money: function () {
      var J = S.jobs.bar, h = '<div class="pcard" style="text-align:center"><div class="sub">Kontostand</div><div class="big">' + Math.floor(L.money) + ' €</div></div>' +
        '<div class="pcard"><b>🍸 Barkeeper im Club Glitzer</b><br><small class="sub">Stufe ' + GL.eco.barLevel() + ' · ' + J.shifts + ' Schichten · ' + J.earned + ' € verdient. Eine Schicht dauert 4 Stunden: Stundenlohn plus Trinkgeldanteil, gute Laune zahlt sich aus.</small></div>';
      h += '<div class="lab">Letzte Buchungen</div>';
      if (!L.log.length) h += '<p class="sub">Noch keine Buchungen.</p>';
      L.log.forEach(function (b) { h += '<div class="prow pline"><span style="flex:1">' + esc(b.t) + '<br><small class="sub">Tag ' + b.d + ', ' + esc(b.h) + '</small></span><b style="color:' + (b.a < 0 ? '#ff8a96' : '#3ddc84') + '">' + (b.a > 0 ? '+' : '') + b.a + ' €</b></div>'; });
      return h;
    },
    settings: function () {
      var q = S.settings.q, names = ['Automatisch', 'Niedrig', 'Mittel', 'Hoch'];
      return '<div class="lab">Grafikqualität</div><div class="row">' + names.map(function (n, i) { return '<button class="btn sm' + (q === i - 1 ? ' pri' : '') + '" data-q="' + (i - 1) + '">' + n + '</button>'; }).join('') + '</div>' +
        '<p class="sub">Niedrig schont Akku und schwächere Handys (geringere Auflösung, kürzere Sichtweite).</p>' +
        '<div class="lab">Allgemein</div><div class="row"><button class="btn sm" id="psnd">Ton: ' + (S.sound ? 'an' : 'aus') + '</button><button class="btn sm" id="pfs">Vollbild</button><button class="btn sm pri" id="psave">Jetzt speichern</button><button class="btn sm" id="phub">Minispiel-Übersicht</button></div>' +
        '<div class="lab">Steuerung</div><p class="sub">Laufen: WASD/Pfeiltasten oder Finger links ziehen · Kamera: Maus/Finger rechts ziehen, Q/R · Aktion: E, Leertaste oder Knopf · Handy: P oder Tab · Karte: M · Vollbild: F · Schließen: Esc</p>' +
        '<p class="sub">Spielstand: wird automatisch gesichert (alle paar Sekunden, beim Schlafen und beim Verlassen). Mit Google-Anmeldung (☁) auch geräteübergreifend.</p>';
    }
  };

  function render() {
    var p = el(); if (!p) return;
    var app = APPS.filter(function (a) { return a[0] === cur; })[0];
    p.innerHTML = '<div class="pin"><div class="ptop"><span>' + GL.life.clock() + '</span><span>💶 ' + Math.floor(L.money) + ' €</span></div><div class="phead">' +
      (cur === 'home' ? '<b>Handy</b>' : '<button class="btn sm" id="pback">‹</button><b>' + app[2] + ' ' + app[1] + '</b>') + '<button class="btn sm" id="pclose" style="margin-left:auto">✕</button></div><div class="pbody">' + VIEWS[cur]() + '</div></div>';
    document.getElementById('pclose').onclick = ph.close;
    var b = document.getElementById('pback'); if (b) b.onclick = function () { cur = 'home'; render(); };
    [].forEach.call(p.querySelectorAll('[data-app]'), function (x) { x.onclick = function () { cur = x.dataset.app; render(); }; });
    [].forEach.call(p.querySelectorAll('[data-p]'), function (x) { x.onclick = function () { travel(x.dataset.p); }; });
    [].forEach.call(p.querySelectorAll('[data-q]'), function (x) { x.onclick = function () { S.settings.q = +x.dataset.q; GL.save(); ph.applyQuality(); render(); }; });
    var e;
    if ((e = document.getElementById('psnd'))) e.onclick = function () { S.sound = !S.sound; GL.save(); var w = document.getElementById('wSnd'); if (w) w.textContent = S.sound ? '🔊' : '🔇'; render(); };
    if ((e = document.getElementById('pfs'))) e.onclick = GL.ui.fullscreen;
    if ((e = document.getElementById('psave'))) e.onclick = function () { GL.save(); C().sfx('ok'); C().toast('Gespeichert (' + GL.life.stamp() + ').'); };
    if ((e = document.getElementById('phub'))) e.onclick = function () { ph.close(); C().menuHub(); };
  }

  function travel(id) {
    var W = GL.W; if (!W) return;
    var t = id === 'kiosk' ? { x: GL.eco.kioskPos.x, z: GL.eco.kioskPos.z, yaw: -Math.PI / 2 } : W.pois[id] ? { x: W.pois[id].x, z: W.pois[id].z, yaw: W.pois[id].p.f > 0 ? 0 : Math.PI } : null;
    if (!t) return;
    ph.close();
    GL.ui.fade('Mit der Tram unterwegs …', function () {
      if (GL.home.inside()) GL.home.leave(true);
      W.player.x = t.x; W.player.z = t.z; W.camYaw = t.yaw; W.cam.position.set(t.x + Math.sin(t.yaw) * W.camD, W.camH, t.z + Math.cos(t.yaw) * W.camD);
      GL.life.advance(10); C().sfx('ok'); GL.save();
    }, 600);
  }

  /* Grafikqualität: Auflösung (Pixelverhältnis) und Sichtweite */
  ph.applyQuality = function (Wb) {
    var W = Wb || GL.W; if (!W) return;
    var q = S.settings.q, coarse = (window.matchMedia && matchMedia('(pointer:coarse)').matches) || (navigator.maxTouchPoints > 0 && Math.min(innerWidth, innerHeight) < 820);
    if (q < 0) q = coarse ? 1 : 2;
    var dpr = window.devicePixelRatio || 1, pr = [.75, 1, 1.5][q];
    W.R.setPixelRatio(Math.min(dpr, pr));
    W.scene.fog.near = q === 0 ? 45 : 70; W.scene.fog.far = q === 0 ? 170 : 230;
    if (!W.inside) { W.cam.far = q === 0 ? 260 : 420; W.cam.updateProjectionMatrix(); }
    C().resize();
  };

  GL.on('openMap', function () { ph.open('map'); });
  GL.on('worldBuilt', function (W) {
    var b = document.getElementById('wPh'); if (b) b.onclick = function () { ph.toggle(); };
    var h = document.getElementById('hud'); if (h) h.onclick = function () { ph.open('status'); };
    ph.applyQuality(W);
  });
  // Uhr und Werte im offenen Handy ab und zu auffrischen (nicht bei Listen, damit nichts unter dem Finger springt)
  var rt = 0;
  GL.on('tick', function (dt) { rt += dt; if (rt > 2) { rt = 0; if (ph.isOpen() && (cur === 'home' || cur === 'status')) render(); } });
})();
