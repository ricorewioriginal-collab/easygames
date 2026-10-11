/* GayLife – Möbel, Miete und Besuch in der eigenen Wohnung.
   Möbel werden am Laptop gekauft und auf 8 feste Stellflächen gestellt. Benutzbare Möbel geben Bedürfniswerte, Dekoration hebt die Stimmung.
   Die Miete wird montags abgebucht (halbiert, wenn ein Partner eingezogen ist). Gäste (Date zu Hause) und der Partner erscheinen als Figur in der Wohnung.
   S.home: { own:{id:1}, placed:{"0":id}, partner, rentDay, debt } */
(function () {
  'use strict';
  var S = GL.S, L = S.life, H = S.home;
  var F = GL.furn = {};
  var RENT = 70, RENT2 = 40;
  var SLOTS = [[-2.2, -3.2], [1.9, -2.9], [4.7, -1.9], [4.9, 1.8], [-6.2, 4.5], [-3.0, 4.8], [3.2, 4.8], [5.2, 4.9]];
  /* use: [Beschriftung, Minuten, Bedürfnis-Änderung, Stimmung, Text]; b: Dekorationsbonus auf die Stimmung; c: Kollisionsgröße */
  var CAT = {
    regal: { n: 'Bücherregal', e: '📚', p: 60, c: [1.6, .6], use: ['Lesen', 60, { stress: -16, energy: -3 }, 4, 'Ein gutes Buch. Stress −16'] },
    hantel: { n: 'Hantelbank', e: '🏋️', p: 80, c: [1.6, 1], use: ['Trainieren', 40, { energy: -14, hygiene: -22, stress: -18, hunger: -10 }, 6, 'Ordentlich geschwitzt. Stress −18'], min: { energy: 25 } },
    plattenspieler: { n: 'Plattenspieler', e: '🎵', p: 120, c: [1, .8], use: ['Platte auflegen', 30, { stress: -13, social: 3 }, 6, 'Deine Lieblingsplatte läuft. Stress −13'] },
    kaffee: { n: 'Kaffeemaschine', e: '☕', p: 90, c: [.8, .8], use: ['Kaffee kochen', 10, { energy: 14, stress: 3 }, 2, 'Wach durch Kaffee. Energie +14'], max: 3 },
    aquarium: { n: 'Aquarium', e: '🐠', p: 150, c: [1.4, .7], b: 2, use: ['Fische beobachten', 20, { stress: -9 }, 4, 'Die Fische sind unbeeindruckt von allem. Stress −9'] },
    lampe: { n: 'Regenbogenlampe', e: '💡', p: 30, c: [.6, .6], b: 1 },
    kunst: { n: 'Kunst-Skulptur', e: '🗿', p: 70, c: [.9, .9], b: 2 },
    sessel: { n: 'Zocker-Sessel', e: '🎮', p: 110, c: [1.2, 1.2], use: ['Zocken', 60, { stress: -16, energy: -5, hunger: -6 }, 5, 'Ein Level mehr geschafft. Stress −16'] },
    yoga: { n: 'Yogamatte', e: '🧘', p: 35, c: [1, 1.8], use: ['Yoga machen', 30, { stress: -14, energy: 4 }, 5, 'Ruhig und biegsam. Stress −14'] }
  };
  F.CAT = CAT; F.SLOTS = SLOTS; F.RENT = RENT;
  var objs = {}, cols = {}, uses = { d: 0, kaffee: 0 }, guestFig = null, guestId = '', C = function () { return GL.core; };

  function valid() { Object.keys(H.placed).forEach(function (k) { if (!CAT[H.placed[k]] || !H.own[H.placed[k]] || SLOTS[+k] === undefined) delete H.placed[k]; }); }
  F.bonus = function () { var b = 0; Object.keys(H.placed).forEach(function (k) { var c = CAT[H.placed[k]]; if (c && c.b) b += c.b; }); return Math.min(b, 6); };
  F.rent = function () { return H.partner ? RENT2 : RENT; };
  F.nextRentDay = function () { var d = L.day; while ((d - 1) % 7 !== 0 || d <= H.rentDay || d < 8) d++; return d; };

  /* ---------- 3D-Modelle aus einfachen Quadern ---------- */
  function model(id) {
    var g = new THREE.Group();
    function box(w, h, d, col, x, y, z, o) { var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), C().lmat(col, o)); m.position.set(x, y, z); g.add(m); return m; }
    if (id === 'regal') { box(1.6, 2.4, .5, 0x8a6a52, 0, 1.2, 0); [.4, .95, 1.5, 2].forEach(function (y, i) { box(1.5, .06, .45, 0x6e4f3c, 0, y, .02); [0xff3b6b, 0x2ea8ff, 0xffe14d, 0x3ddc84, 0x9b5cff].forEach(function (c, j) { if ((i + j) % 4) box(.2, .35, .3, c, -.6 + j * .3, y + .2, .02); }); }); }
    else if (id === 'hantel') { box(1.4, .35, .6, 0x2a2d3a, 0, .2, 0); box(.1, .9, .1, 0x888899, -.55, .7, 0); box(.1, .9, .1, 0x888899, .55, .7, 0); box(1.5, .08, .08, 0xc0c0c8, 0, 1.1, 0); box(.12, .5, .5, 0x222222, -.65, 1.1, 0); box(.12, .5, .5, 0x222222, .65, 1.1, 0); }
    else if (id === 'plattenspieler') { box(.9, .5, .7, 0x6e4f3c, 0, .25, 0); box(.8, .12, .6, 0x2a2d3a, 0, .56, 0); box(.5, .03, .5, 0x111111, 0, .64, 0); box(.12, .12, .12, 0xff4fa3, 0, .7, 0); }
    else if (id === 'kaffee') { box(.7, .1, .7, 0x6e4f3c, 0, .05, 0); box(.5, .6, .4, 0x2a2d3a, 0, .4, 0); box(.5, .12, .5, 0xc0c0c8, 0, .76, 0); box(.15, .15, .15, 0xfff0f6, 0, .1, .3); }
    else if (id === 'aquarium') { box(1.4, .6, .6, 0x6e4f3c, 0, .3, 0); box(1.3, .8, .5, 0x7fd3ff, 0, 1, 0, { transparent: true, opacity: .45 }); box(.2, .12, .08, 0xff9f1c, -.2, 1, 0); box(.15, .1, .08, 0xff4fa3, .25, 1.15, .05); box(1.3, .12, .5, 0xe8d9a8, 0, .68, 0); }
    else if (id === 'lampe') { box(.5, .1, .5, 0x3a3750, 0, .05, 0); box(.08, 1.6, .08, 0x9a7ca3, 0, .9, 0); ['#ff3b6b', '#ff9f1c', '#ffe14d', '#3ddc84', '#2ea8ff', '#9b5cff'].forEach(function (c, i) { box(.5 - i * .04, .06, .5 - i * .04, parseInt(c.slice(1), 16), 0, 1.5 + i * .06, 0, { emissive: parseInt(c.slice(1), 16), emissiveIntensity: .5 }); }); }
    else if (id === 'kunst') { box(.8, .15, .8, 0xe9eef5, 0, .08, 0); box(.5, .9, .5, 0x9b5cff, 0, .6, 0); box(.35, .35, .35, 0xff4fa3, 0, 1.2, 0).rotation.y = .8; box(.2, .2, .2, 0xffe14d, 0, 1.55, 0).rotation.y = .4; }
    else if (id === 'sessel') { box(1.2, .5, 1.2, 0x2a2d3a, 0, .3, 0); box(1.2, 1, .25, 0x2a2d3a, 0, .8, -.5); box(.25, .4, 1, 0xff3b6b, -.6, .6, 0); box(.25, .4, 1, 0x2ea8ff, .6, .6, 0); }
    else if (id === 'yoga') { box(.9, .05, 1.8, 0x9b5cff, 0, .04, 0); box(.9, .06, .3, 0xff4fa3, 0, .05, -.7); }
    return g;
  }

  /* ---------- Möbel stellen ---------- */
  function clear(k) {
    if (objs[k]) { var r = GL.home.root(); if (r) r.remove(objs[k]); delete objs[k]; }
    if (cols[k]) { var W = GL.W, i = W && W.colliders.indexOf(cols[k]); if (i >= 0) W.colliders.splice(i, 1); delete cols[k]; }
  }
  F.refresh = function () {
    var W = GL.W, r = GL.home.root(); if (!W || !r) return; valid();
    SLOTS.forEach(function (s, k) {
      var id = H.placed[k]; clear(k); if (!id) return;
      var g = model(id), x = s[0], z = s[1]; g.position.set(x, 0, z); g.rotation.y = z > 0 ? Math.PI : x < 0 && z < 0 ? Math.PI / 2 : 0; r.add(g); objs[k] = g;
      var c = CAT[id].c, o = GL.home.O; cols[k] = { x0: o.x + x - c[0] / 2, x1: o.x + x + c[0] / 2, z0: o.z + z - c[1] / 2, z1: o.z + z + c[1] / 2 }; W.colliders.push(cols[k]);
    });
  };
  F.buy = function (id) {
    var c = CAT[id]; if (!c || H.own[id]) return false;
    if (!GL.eco.spend(c.p, 'Möbel: ' + c.n)) return false;
    H.own[id] = 1; GL.save(); return true;
  };
  F.place = function (k, id) {
    if (SLOTS[k] === undefined) return false;
    if (!id) { delete H.placed[k]; } else {
      if (!CAT[id] || !H.own[id]) return false;
      Object.keys(H.placed).forEach(function (q) { if (H.placed[q] === id) delete H.placed[q]; });
      H.placed[k] = id;
    }
    F.refresh(); GL.save(); GL.life.hud(); return true;
  };

  /* ---------- Laptop-Menü ---------- */
  function esc(s) { return C().esc(s); }
  F.laptop = function () {
    var due = F.nextRentDay();
    GL.ui.menu('Laptop', 'Kontostand ' + Math.floor(L.money) + ' €' + (H.debt ? ' · <b>Mietschulden ' + H.debt + ' €</b>' : ''), [
      { e: '💾', t: 'Speichern', s: 'Der Spielstand wird auch automatisch gesichert.', fn: function () { GL.save(); GL.ui.close(); C().toast('Gespeichert.'); } },
      { e: '🛋️', t: 'Möbel kaufen', s: Object.keys(CAT).filter(function (i) { return !H.own[i]; }).length + ' Stücke im Angebot', fn: shop },
      { e: '🏠', t: 'Einrichten', s: 'Möbel auf die Stellflächen verteilen.', fn: slots },
      { e: '🧾', t: 'Miete & Vermieter', s: F.rent() + ' € pro Woche, nächste Abbuchung Tag ' + due, fn: rentMenu },
      { e: '✖', t: 'Schließen', fn: GL.ui.close }], 'laptop');
  };
  function shop() {
    var items = Object.keys(CAT).map(function (i) { var c = CAT[i]; return { e: c.e, t: c.n + ' – ' + c.p + ' €', s: H.own[i] ? 'Schon gekauft' : c.use ? c.use[0] : 'Dekoration: Stimmung +' + c.b, dis: !!H.own[i] || L.money < c.p, fn: function () { if (F.buy(i)) { C().sfx('ok'); C().toast(c.n + ' gekauft. Jetzt unter „Einrichten“ aufstellen.'); } shop(); } }; });
    GL.ui.menu('Möbelhaus Regenbogen', 'Lieferung sofort. Kontostand ' + Math.floor(L.money) + ' €', items.concat([{ e: '↩', t: 'Zurück', fn: F.laptop }]), 'laptop');
  }
  function slots() {
    valid();
    var items = SLOTS.map(function (s, k) { var id = H.placed[k], c = id && CAT[id]; return { e: c ? c.e : '▫️', t: 'Platz ' + (k + 1) + (c ? ': ' + c.n : ': frei'), s: k < 4 ? 'hinten' : 'vorn', fn: function () { pickFor(k); } }; });
    GL.ui.menu('Einrichten', 'Wähle eine Stellfläche.', items.concat([{ e: '↩', t: 'Zurück', fn: F.laptop }]), 'laptop');
  }
  function pickFor(k) {
    var items = Object.keys(CAT).filter(function (i) { return H.own[i]; }).map(function (i) { var c = CAT[i]; return { e: c.e, t: c.n, s: H.placed[k] === i ? 'steht hier' : '', dis: H.placed[k] === i, fn: function () { F.place(k, i); slots(); } }; });
    if (H.placed[k]) items.push({ e: '🧹', t: 'Platz leeren', fn: function () { F.place(k, ''); slots(); } });
    if (!items.length) items.push({ e: '🛋️', t: 'Du besitzt noch keine Möbel', s: 'Im Möbelhaus am Laptop kaufen.', dis: true, fn: function () {} });
    GL.ui.menu('Platz ' + (k + 1), 'Was soll hier stehen?', items.concat([{ e: '↩', t: 'Zurück', fn: slots }]), 'laptop');
  }
  function rentMenu() {
    var items = [];
    if (H.debt) items.push({ e: '💶', t: 'Schulden zahlen: ' + H.debt + ' €', dis: L.money < H.debt, fn: function () { if (GL.eco.spend(H.debt, 'Mietschulden')) { H.debt = 0; GL.save(); C().toast('Schulden beglichen.'); } F.laptop(); } });
    GL.ui.menu('Miete & Vermieter', 'Herr Brandt ist nett, aber pünktlich. Miete ' + F.rent() + ' € pro Woche' + (H.partner ? ' (geteilt mit ' + esc(GL.social.npc(H.partner).n) + ')' : '') + '. Abbuchung montags.' + (H.debt ? '<br><b>Offen: ' + H.debt + ' €</b>' : ''), items.concat([{ e: '↩', t: 'Zurück', fn: F.laptop }]), 'laptop');
  }

  /* ---------- Miete montags ---------- */
  F.charge = function () {
    var r = F.rent(); H.rentDay = L.day;
    if (GL.eco.spend(r, 'Miete')) { C().toast('Miete abgebucht: ' + r + ' €'); }
    else { H.debt += r; GL.life.change({ stress: 8 }, -3); C().banner('Miete offen', 'Dir fehlen ' + r + ' €. Zahle am Laptop, sonst wird es teurer.'); }
    if (H.debt > 0 && H.debt >= 3 * RENT) { GL.life.change({ stress: 6 }, -2); }
    GL.save();
  };
  GL.on('newDay', function (day) {
    uses.d = day; uses.kaffee = 0;
    if (day >= 8 && (day - 1) % 7 === 0 && H.rentDay < day) {
      if (H.debt && L.money >= H.debt + F.rent()) { GL.eco.spend(H.debt, 'Mietschulden'); H.debt = 0; }
      F.charge();
    }
  });
  GL.on('phoneMoney', function () {
    return '<div class="pcard"><b>🏠 Wohnung</b><br><small class="sub">Miete ' + F.rent() + ' € pro Woche' + (H.partner ? ' (geteilt)' : '') + ', nächste Abbuchung Tag ' + F.nextRentDay() + (H.debt ? '.<br><b>Offene Miete: ' + H.debt + ' €</b>, zahlbar am Laptop zu Hause' : '') + '</small></div>';
  });

  /* ---------- Möbel benutzen ---------- */
  function use(k) {
    var id = H.placed[k], c = CAT[id], u = c && c.use; if (!u) return;
    if (c.min) for (var n in c.min) if (L.needs[n] < c.min[n]) { C().toast('Dafür bist du gerade zu erschöpft.'); C().sfx('no'); return; }
    if (c.max && uses[id] >= c.max) { C().toast('Genug Kaffee für heute.'); return; }
    if (c.max) uses[id] = (uses[id] || 0) + 1;
    GL.ui.fade(c.e + ' ' + u[0] + ' …', function () { GL.life.advance(u[1]); GL.life.change(u[2], u[3]); C().toast(u[4]); GL.save(); }, 900);
  }

  /* ---------- Gäste und Partner in der Wohnung ---------- */
  function visitor() {
    var h = GL.life.hour(), a, i, c = S.cal;
    for (i = 0; i < c.length; i++) { a = c[i]; if (a.st === 'open' && a.place === 'home') { var ap = GL.dating.apptFor(a.npc); if (ap === a) return a.npc; } }
    if (H.partner && (h >= 18 || h < 8) && GL.dating.rel(H.partner).st === 'partner') return H.partner;
    return '';
  }
  function figure(id) {
    if (guestId === id && guestFig) return guestFig;
    var W = GL.W, o = GL.home.O; if (guestFig) GL.home.root().remove(guestFig);
    guestFig = C().makePerson(GL.social.npc(id).look); guestFig.position.set(-1.2, 0, -.2); guestFig.rotation.y = Math.PI / 2 + .6; GL.home.root().add(guestFig); guestId = id; return guestFig;
  }
  var acc = 0;
  GL.on('tick', function (dt, W) {
    acc += dt; if (acc < 1) return; acc = 0;
    if (!W.inside || !GL.home.root()) return;
    var id = visitor();
    if (!id) { if (guestFig) guestFig.visible = false; return; }
    figure(id).visible = true;
  });
  GL.on('worldBuilt', function (W) {
    F.refresh();
    SLOTS.forEach(function (s, k) {
      W.inter.push({ x: GL.home.O.x + s[0], z: GL.home.O.z + s[1] + (s[1] > 0 ? -1.1 : 1.1), r: 1.4,
        get on() { var c = CAT[H.placed[k]]; return !!(W.inside && c && c.use); },
        get label() { var c = CAT[H.placed[k]]; return c && c.use ? c.use[0] + ' (' + c.n + ')' : ''; }, fn: function () { use(k); } });
    });
    W.inter.push({ x: GL.home.O.x - 1.9, z: GL.home.O.z - .2, r: 1.6,
      get on() { return !!(W.inside && guestFig && guestFig.visible); },
      get label() { var n = guestId && GL.social.npc(guestId); return n ? 'Mit ' + n.n + ' reden' : ''; },
      fn: function () { var n = W.npcs.filter(function (q) { return q.d.id === guestId; })[0]; if (n) { n.wait = 4; GL.dating.menu(n); } } });
  });
  F.visitor = visitor;
})();
