/* GayLife – Rainbow City: sieben weitere Viertel neben dem Pride District (dem bisherigen Regenbogenkiez), erreichbar per Tram.
   Viertel werden erst beim ersten Besuch gebaut und nur sichtbar geschaltet, solange man dort ist (Laden/Entladen). Bäume, Palmen, Lampen und Blumen sind instanziert.
   Jedes Viertel hat vier Orte mit echter Wirkung (Zeit, Geld, Bedürfnisse), Öffnungszeiten und zwei Passanten. Tram: 3 €, 20 Minuten. Nach dem Neuladen steht man wieder im Pride District. */
(function () {
  'use strict';
  var S = GL.S, L = S.life, D = GL.dist = {};
  var FARE = 3, cur = '', built = {};
  var DS = [
    { id: 'down', n: 'Downtown', e: '🏙️', gc: 0xb9b4c8, wc: [0x7fb7e6, 0x9aa6d8, 0xc5b8e8], hs: [14, 20, 11], deco: 'tree', tx: 'Glas, Büros und der beste Streetfood-Stand der Stadt.',
      sp: [{ n: 'Kino Lichtspiel', e: '🎬', open: [12, 24], cost: 12, min: 120, d: { stress: -18, social: 6, hunger: -5 }, b: 4, msg: 'Ein Film, in dem am Ende alle glücklich sind. Stress −18' },
        { n: 'Streetfood Eck', e: '🌮', open: [8, 24], cost: 9, min: 15, d: { hunger: 35 }, b: 2, msg: 'Pappsatt und zufrieden. Hunger +35' },
        { n: 'Stadtbibliothek', e: '📚', open: [9, 19], cost: 0, min: 60, d: { stress: -12, energy: -2 }, b: 3, msg: 'Zwei Stunden Ruhe. Stress −12' },
        { n: 'Coffee-to-go', e: '☕', open: [6, 20], cost: 3, min: 5, d: { energy: 8 }, b: 1, msg: 'Wach. Energie +8' }],
      pas: [['Pendlerin', 'Ich pendle seit sieben Jahren in diese Stadt. Das Gute: Hier darf man sein, wie man ist.'], ['Praktikant', 'Der Kaffee ist schlecht, die Aussicht von der 14. Etage ist großartig.']] },
    { id: 'neon', n: 'Neon Nights', e: '🌃', gc: 0x1e1b3a, wc: [0xff3b9a, 0x2ee6d6, 0x9b5cff], hs: [9, 12, 8], deco: 'neon', tx: 'Leuchtreklame und Nachtleben, erst ab dem Abend richtig wach.',
      sp: [{ n: 'Ramen Nachteule', e: '🍜', open: [18, 6], cost: 11, min: 30, d: { hunger: 50 }, b: 3, msg: 'Heiße Brühe nach Mitternacht. Hunger +50' },
        { n: 'Spielhalle Neon', e: '🕹️', open: [18, 6], cost: 5, min: 45, d: { stress: -10, social: 4 }, b: 4, msg: 'Highscore gerade so verteidigt. Stress −10' },
        { n: 'Tanzterrasse', e: '💃', open: [20, 5], cost: 0, min: 30, d: { social: 10, stress: -8, energy: -8, hygiene: -4 }, b: 5, msg: 'Straßentanz unter Neonlicht. Kontakte +10' },
        { n: 'Mitternachts-Espresso', e: '☕', open: [0, 24], cost: 3, min: 5, d: { energy: 8 }, b: 1, msg: 'Wach. Energie +8' }],
      pas: [['Nachtschwärmer', 'Die Nacht fängt hier erst an, wenn andere Leute schlafen gehen.'], ['Barfrau', 'Ich kenne jede Geschichte, die sich zwischen Mitternacht und vier Uhr abspielt.']] },
    { id: 'beach', n: 'Rainbow Beach', e: '🏖️', gc: 0xf2dfa4, wc: [0xff9f6b, 0x59c8ff, 0xffd84d], hs: [6, 7, 6], deco: 'palm', tx: 'Sand, Palmen und Beachvolleyball bis zum Sonnenuntergang.',
      sp: [{ n: 'Schwimmen im Meer', e: '🏊', open: [7, 21], cost: 0, min: 40, d: { energy: -10, stress: -12, hygiene: 8 }, b: 4, msg: 'Salzwasser und Wellen. Stress −12' },
        { n: 'Sonnenliege', e: '😎', open: [8, 19], cost: 0, min: 60, d: { stress: -16, energy: 4, hygiene: -6 }, b: 3, msg: 'Ein Stündchen gedöst. Stress −16' },
        { n: 'Beachvolleyball', e: '🏐', open: [9, 20], cost: 0, min: 45, d: { social: 14, energy: -12, stress: -6, hygiene: -8 }, b: 5, msg: 'Zwei Sätze mit netten Leuten. Kontakte +14' },
        { n: 'Eisstand', e: '🍦', open: [10, 20], cost: 4, min: 10, d: { hunger: 10, stress: -3 }, b: 2, msg: 'Kugel Regenbogen-Eis. Hunger +10' }],
      pas: [['Rettungsschwimmer', 'Die roten Flaggen heißen Nein, die grünen heißen Ja. Wie im Leben, nur klarer.'], ['Strandverkäufer', 'Sonnencreme, Strohhüte und Glitzer für den Bart. Alles da!']] },
    { id: 'love', n: 'Love Gardens', e: '🌹', gc: 0x9fdc9a, wc: [0xffb3d1, 0xd6a6ff, 0xfff1a8], hs: [5, 6, 5], deco: 'flower', tx: 'Rosen, Linden und stille Ecken für zwei.',
      sp: [{ n: 'Picknickwiese', e: '🧺', open: [8, 20], cost: 10, min: 60, d: { hunger: 30, social: 8, stress: -12 }, b: 5, msg: 'Korb, Decke, Sonne. Stress −12' },
        { n: 'Blumenhändlerin', e: '💐', open: [8, 19], cost: 6, min: 5, d: {}, b: 1, msg: 'Ein Strauß für später. Er hilft bei einer Entschuldigung.', act: 'flowers' },
        { n: 'Rosenlaube', e: '🌹', open: [0, 24], cost: 0, min: 30, d: { stress: -10, social: 2 }, b: 3, msg: 'Ruhig sitzen. Stress −10' },
        { n: 'Entenpfuhl', e: '🦆', open: [0, 24], cost: 0, min: 15, d: { stress: -6 }, b: 2, msg: 'Die Enten sind unbeeindruckt. Stress −6' }],
      pas: [['Verliebtes Paar', 'Hier haben wir uns verlobt. Unter der dritten Linde links.'], ['Gärtner', 'Rosen schneidet man nicht aus Strenge, sondern aus Liebe.']] },
    { id: 'fashion', n: 'Fashion Boulevard', e: '👗', gc: 0xe8d4e2, wc: [0xff7fb0, 0xb48cff, 0xffc46b], hs: [8, 9, 8], deco: 'tree', tx: 'Schaufenster, Friseure und Mode für alle.',
      sp: [{ n: 'Anprobe', e: '🪞', open: [10, 20], cost: 0, min: 20, d: {}, b: 0, msg: '', act: 'editor' },
        { n: 'Friseursalon Schnittig', e: '💇', open: [10, 19], cost: 15, min: 45, d: { hygiene: 10, stress: -4 }, b: 8, msg: 'Frisch frisiert! Die Laune steigt.' },
        { n: 'Schaufensterbummel', e: '🛍️', open: [10, 20], cost: 0, min: 30, d: { stress: -6, social: 2 }, b: 2, msg: 'Geschaut, nicht gekauft. Stress −6' },
        { n: 'Smoothie-Bar', e: '🥤', open: [9, 19], cost: 5, min: 10, d: { hunger: 12, energy: 4 }, b: 2, msg: 'Grün, aber lecker. Hunger +12' }],
      pas: [['Modedesignerin', 'Mode ist, wenn du dich in deiner Haut wohlfühlst. Der Rest ist Stoff.'], ['Stylist', 'Dein Look sagt: neugierig. Und der Rest sagt: gut so.']] },
    { id: 'heights', n: 'Rainbow Heights', e: '🌆', gc: 0xe2e0ec, wc: [0xf0e6c8, 0xdcd7f0, 0xc8e6f0], hs: [24, 30, 20], deco: 'tree', tx: 'Dachterrassen, Aussicht und ruhige Luft über der Stadt.',
      sp: [{ n: 'Dachterrasse', e: '🌇', open: [6, 24], cost: 0, min: 30, d: { stress: -18 }, b: 4, msg: 'Die ganze Stadt zu Füßen. Stress −18' },
        { n: 'Sky-Lounge', e: '🍸', open: [17, 5], cost: 15, min: 45, d: { social: 10, stress: -8 }, b: 5, msg: 'Ein Drink über den Wolken. Kontakte +10' },
        { n: 'Dach-Yoga', e: '🧘', open: [6, 10], cost: 0, min: 30, d: { stress: -14, energy: 3 }, b: 4, msg: 'Sonnengruß mit Aussicht. Stress −14' },
        { n: 'Fernrohr', e: '🔭', open: [0, 24], cost: 0, min: 10, d: { stress: -3 }, b: 1, msg: 'Du erkennst dein Apartment. Und Gerda, die winkt.' }],
      pas: [['Architektin', 'Von hier oben sieht man, wie Rainbow City wirklich gebaut ist: aus lauter kleinen Ecken.'], ['Concierge', 'Willkommen. Wir haben für alle Zimmer. Die Aussicht ist inklusive.']] },
    { id: 'coast', n: 'Crystal Coast', e: '🗼', gc: 0xbfe6f0, wc: [0xf4f6ff, 0x9fd8ff, 0xffffff], hs: [14, 6, 6], deco: 'palm', tx: 'Leuchtturm, Pier und klares Wasser.',
      sp: [{ n: 'Angeln am Pier', e: '🎣', open: [5, 22], cost: 0, min: 60, d: { stress: -12, hunger: -3 }, b: 3, msg: '', act: 'fish' },
        { n: 'Leuchtturm', e: '🗼', open: [9, 20], cost: 0, min: 20, d: { energy: -6, stress: -10 }, b: 4, msg: 'Aussicht bis zum Horizont. Stress −10', act: 'lighthouse' },
        { n: 'Strandcafé Kristall', e: '🍰', open: [8, 20], cost: 7, min: 30, d: { hunger: 25, stress: -5 }, b: 3, msg: 'Kuchen mit Meerblick. Hunger +25' },
        { n: 'Strandspaziergang', e: '🚶', open: [0, 24], cost: 0, min: 40, d: { stress: -8, energy: -3 }, b: 2, msg: 'Muscheln gesammelt. Stress −8' }],
      pas: [['Leuchtturmwärter', 'Ein Licht, das sich dreht, damit sich niemand verirrt. Mehr braucht es nicht.'], ['Angler', 'Heute beißen sie. Gestern war ein Stiefel dran.']] }
  ];
  DS.forEach(function (d, k) { var a = k / DS.length * 6.2832; d.cx = Math.round(Math.cos(a) * 700); d.cz = Math.round(Math.sin(a) * 700); });
  D.LIST = DS;
  var POS = [[-26, -16], [0, -16], [26, -16], [0, 9]];
  function by(id) { return DS.filter(function (d) { return d.id === id; })[0]; }
  D.cur = function () { return cur; };
  function isOpen(o) { var h = GL.life.hour(); return o[0] < o[1] ? h >= o[0] && h < o[1] : h >= o[0] || h < o[1]; }
  function rng(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  var lampM = null;

  function build(d, W) {
    var C = GL.core, g = new THREE.Group(), r = rng(d.cx + 7), mats = {}, dummy = new THREE.Object3D(), k;
    g.position.set(d.cx, 0, d.cz); W.scene.add(g);
    function mat(c, o) { var key = c + JSON.stringify(o || {}); return mats[key] || (mats[key] = C.lmat(c, o)); }
    function box(w, h, dd, c, x, y, z, o) { var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, dd), mat(c, o)); m.position.set(x, y, z); g.add(m); return m; }
    function col(x, z, w, dd) { W.colliders.push({ x0: d.cx + x - w / 2, x1: d.cx + x + w / 2, z0: d.cz + z - dd / 2, z1: d.cz + z + dd / 2, dist: d.id }); }
    function ring(x, z, c) { var m = new THREE.Mesh(new THREE.RingGeometry(1.2, 1.8, 24), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: .9, side: THREE.DoubleSide })); m.rotation.x = -Math.PI / 2; m.position.set(x, .1, z); g.add(m); }
    function label(t, x, y, z, s) { var l = C.labelSprite(t, s || 1.6); l.position.set(x, y, z); g.add(l); }
    function inst(geo, m, pts) { var im = new THREE.InstancedMesh(geo, m, pts.length); pts.forEach(function (p, i) { dummy.position.set(p[0], p[1], p[2]); dummy.scale.set(p[3] || 1, p[4] || p[3] || 1, p[3] || 1); dummy.updateMatrix(); im.setMatrixAt(i, dummy.matrix); }); g.add(im); return im; }
    // Boden und Weg
    var fl = new THREE.Mesh(new THREE.PlaneGeometry(420, 420), mat(d.gc)); fl.rotation.x = -Math.PI / 2; fl.position.y = .02; g.add(fl);
    var pth = new THREE.Mesh(new THREE.PlaneGeometry(7, 90), mat(0x7d7890)); pth.rotation.x = -Math.PI / 2; pth.position.set(0, .04, 0); g.add(pth);
    var pth2 = new THREE.Mesh(new THREE.PlaneGeometry(80, 5), mat(0x7d7890)); pth2.rotation.x = -Math.PI / 2; pth2.position.set(0, .04, -9); g.add(pth2);
    // Gebäude und Orte
    d.sp.forEach(function (s, i) {
      var p = POS[i], x = p[0], z = p[1];
      if (i < 3) {
        var h = d.hs[i], w = 16, dd = 11; box(w, h, dd, d.wc[i], x, h / 2, z - 3); box(w + 1, .6, dd + 1, 0xffffff, x, h + .3, z - 3); box(5, 3.4, .3, 0x3a3250, x, 1.7, z + 2.6);
        for (var wy = 3; wy < h - 1; wy += 3) for (var wx = -5; wx <= 5; wx += 5) { var wm = box(1.6, 1.4, .2, 0xfff2b8, x + wx, wy, z + 2.55, { emissive: 0xffd27a, emissiveIntensity: .1 }); wm.userData.win = 1; }
        col(x, z - 3, w, dd); label(s.e + ' ' + s.n, x, h + 3, z - 3, 1.5);
      } else { box(4, 2.6, 3, d.wc[0], x, 1.3, z - 3); box(4.6, .4, 3.6, 0xffffff, x, 2.8, z - 3); col(x, z - 3, 4, 3); label(s.e + ' ' + s.n, x, 5, z - 3, 1.2); }
      ring(x, z + 1.2, 0xffffff);
    });
    // Tramhaltestelle
    box(.3, 3.4, .3, 0x8a8aa0, 0, 1.7, 30); box(3.2, .3, 1.6, 0x4a8dff, 0, 3.4, 30); label('🚋 Tram', 0, 5, 30, 1.2); ring(0, 32, 0x4a8dff); col(0, 30, 3.2, 1.6);
    // Passanten
    d.pas.forEach(function (p, i) {
      var nd = C.NPCDEF[(Math.abs(d.cx) + i * 3 + 2) % C.NPCDEF.length], look = Object.assign({}, nd.look, { hc: (i * 3 + 1) % 9, top: (i * 2 + 1) % 7, tc: (i * 5 + 2) % 9 }), pg = C.makePerson(look);
      pg.position.set(i ? 12 : -12, 0, 12 + i * 4); pg.rotation.y = i ? -1.2 : 1.2; g.add(pg); col(pg.position.x, pg.position.z, 1, 1);
      p.look = look; p.x = d.cx + pg.position.x; p.z = d.cz + pg.position.z;
    });
    // Deko (instanziert), nicht auf Wegen und Gebäuden
    function free(x, z) { return !(Math.abs(x) < 5 || (z > -27 && z < -6 && Math.abs(x) < 36) || (z > 1 && z < 14 && Math.abs(x) < 8) || (z > 24 && Math.abs(x) < 8)); }
    var pts = []; for (k = 0; k < 160 && pts.length < 26; k++) { var x = r() * 88 - 44, z = r() * 70 - 34; if (free(x, z)) pts.push([x, z]); }
    var trunk, crown;
    if (d.deco === 'palm') { trunk = inst(new THREE.CylinderGeometry(.22, .35, 5, 6), mat(0x8a6a4a), pts.map(function (p) { return [p[0], 2.5, p[1]]; })); crown = inst(new THREE.IcosahedronGeometry(1.8, 0), mat(0x3fbf6a), pts.map(function (p) { return [p[0], 5.4, p[1], 1.2, .55]; })); }
    else if (d.deco === 'tree') { trunk = inst(new THREE.CylinderGeometry(.3, .4, 3, 6), mat(0x6e4f3c), pts.map(function (p) { return [p[0], 1.5, p[1]]; })); crown = inst(new THREE.IcosahedronGeometry(1.9, 0), mat(0x5fbf6a), pts.map(function (p) { return [p[0], 4, p[1], 1]; })); }
    else if (d.deco === 'flower') { var fc = [0xff4fa3, 0xffd84d, 0xb48cff, 0xff7a5a]; fc.forEach(function (c, ci) { inst(new THREE.CylinderGeometry(.9, .9, .15, 8), mat(c), pts.filter(function (p, pi) { return pi % 4 === ci; }).map(function (p) { return [p[0], .12, p[1]]; })); }); trunk = inst(new THREE.CylinderGeometry(.3, .4, 3, 6), mat(0x6e4f3c), pts.slice(0, 8).map(function (p) { return [p[0] + 3, 1.5, p[1]]; })); crown = inst(new THREE.IcosahedronGeometry(1.9, 0), mat(0x7fcf7a), pts.slice(0, 8).map(function (p) { return [p[0] + 3, 4, p[1]]; })); }
    else if (d.deco === 'neon') { [0xff3b9a, 0x2ee6d6].forEach(function (c, ci) { inst(new THREE.BoxGeometry(.3, 6, .3), new THREE.MeshBasicMaterial({ color: c }), pts.filter(function (p, pi) { return pi % 2 === ci; }).map(function (p) { return [p[0], 3, p[1]]; })); }); }
    // Laternen
    lampM = lampM || new THREE.MeshLambertMaterial({ color: 0xfff2b8, emissive: 0xffd27a, emissiveIntensity: .1 });
    inst(new THREE.CylinderGeometry(.1, .12, 4, 6), mat(0x4a4a60), [[-4.5, 2, 20], [4.5, 2, 20], [-4.5, 2, -1], [4.5, 2, -1]]);
    inst(new THREE.SphereGeometry(.4, 8, 6), lampM, [[-4.5, 4.1, 20], [4.5, 4.1, 20], [-4.5, 4.1, -1], [4.5, 4.1, -1]]);
    // Wasser (Strand, Küste)
    if (d.id === 'beach' || d.id === 'coast') { var sea = new THREE.Mesh(new THREE.PlaneGeometry(420, 120), mat(0x3aa8e8)); sea.rotation.x = -Math.PI / 2; sea.position.set(0, .05, 100); g.add(sea); if (d.id === 'coast') { box(5, 14, 5, 0xffffff, 30, 7, 28); box(5.4, 1.2, 5.4, 0xff3b6b, 30, 14.6, 28); box(3, 2, 3, 0xffe9a8, 30, 16, 28, { emissive: 0xffd27a, emissiveIntensity: .8 }); col(30, 28, 5, 5); box(5, .4, 28, 0x8a6a4a, -30, .3, 40); } }
    return g;
  }

  function enter(d, W) {
    if (!built[d.id]) built[d.id] = build(d, W);
    Object.keys(built).forEach(function (k) { built[k].visible = k === d.id; });
    cur = d.id; W.district = d.id; W.bounds = { x0: d.cx - 45, x1: d.cx + 45, z0: d.cz - 36, z1: d.cz + 36 };
    W.player.x = d.cx; W.player.z = d.cz + 26; W.camYaw = Math.PI; W.yaw = Math.PI; W.cam.position.set(W.player.x + Math.sin(W.camYaw) * W.camD, W.camH, W.player.z + Math.cos(W.camYaw) * W.camD);
  }
  function toKiez(W) {
    Object.keys(built).forEach(function (k) { built[k].visible = false; });
    cur = ''; W.district = ''; W.bounds = { x0: -96, x1: 96, z0: -68, z1: 68 }; W.player.x = 10; W.player.z = 22; W.camYaw = Math.PI; W.yaw = 0;
    W.cam.position.set(W.player.x + Math.sin(W.camYaw) * W.camD, W.camH, W.player.z + Math.cos(W.camYaw) * W.camD);
  }
  /* Reise: Fahrpreis, Abblenden, Umschalten. instant = ohne Fahrpreis (z. B. Handy-Karte im Viertel) */
  D.go = function (id, instant) {
    var W = GL.W; if (!W || id === cur || (id === 'kiez' && !cur)) return false;
    if (!instant) { if (L.money < FARE) { GL.core.toast('Die Tram kostet ' + FARE + ' €.'); GL.core.sfx('no'); return false; } GL.eco.spend(FARE, 'Tram'); }
    function sw() {
      if (GL.home.inside()) GL.home.leave(true);
      if (id === 'kiez') toKiez(W); else enter(by(id), W);
      if (!instant) GL.life.advance(20); GL.core.sfx('ok'); GL.save();
    }
    if (instant) sw(); else GL.ui.fade('Mit der Tram unterwegs … 🚋', sw, 700);
    return true;
  };
  D.leave = function () { if (cur) D.go('kiez', true); };

  function tramMenu() {
    var items = [];
    if (cur) items.push({ e: '🏳️‍🌈', t: 'Pride District', s: 'Das bekannte Regenbogenkiez · ' + FARE + ' €, 20 Min.', fn: function () { GL.ui.close(); D.go('kiez'); } });
    DS.forEach(function (d) { if (d.id !== cur) items.push({ e: d.e, t: d.n, s: d.tx + ' · ' + FARE + ' €, 20 Min.', dis: L.money < FARE, fn: function () { GL.ui.close(); D.go(d.id); } }); });
    GL.ui.menu('Tram', 'Linie 1 verbindet alle Viertel von Rainbow City.', items.concat([{ e: '✖', t: 'Schließen', fn: GL.ui.close }]), 'tram');
  }
  D.tramMenu = tramMenu;

  function use(d, s) {
    if (!isOpen(s.open)) { GL.core.toast(s.n + ' hat geschlossen (' + s.open[0] + '–' + s.open[1] + ' Uhr).'); GL.core.sfx('no'); return; }
    if (L.needs.energy < 8 && s.d && s.d.energy < 0) { GL.core.toast('Du bist zu erschöpft dafür.'); GL.core.sfx('no'); return; }
    if (s.act === 'editor') { GL.core.editor(); return; }
    if (s.act === 'flowers' && (L.flowers || 0) >= 5) { GL.core.toast('Du hast schon genug Blumen (5).'); return; }
    if (s.cost && !GL.eco.spend(s.cost, s.n)) { GL.core.toast('Das kostet ' + s.cost + ' €.'); GL.core.sfx('no'); return; }
    GL.ui.fade(s.e + ' ' + s.n + ' …', function () {
      var msg = s.msg;
      GL.life.advance(s.min); GL.life.change(s.d, s.b);
      if (s.act === 'flowers') { L.flowers = (L.flowers || 0) + 1; msg += ' (' + L.flowers + ')'; }
      else if (s.act === 'fish') { if (Math.random() < .6) { L.food++; msg = 'Ein Fang! Fisch fürs Kochen. Stress −12 (Vorrat ' + L.food + ')'; } else msg = 'Heute hat nichts gebissen, aber ruhig war es. Stress −12'; }
      else if (s.act === 'lighthouse') { L.stats.lh = L.stats.lh || 0; if (!L.stats.lh) { L.stats.lh = 1; GL.core.gain(10); msg += ' · Erste Besteigung: +10 Glitzer'; } }
      GL.core.toast(msg); GL.save();
    }, 900);
  }

  GL.on('worldBuilt', function (W) {
    // Nach dem Laden zurück in den Pride District
    var p = W.player; if (!L.inside && (Math.abs(p.x) > 150 || Math.abs(p.z) > 110)) { p.x = 10; p.z = 22; }
    W.inter.push({ x: 10, z: 18, r: 2.6, get on() { return !W.inside && !cur; }, label: 'Tram: andere Viertel', fn: tramMenu });
    DS.forEach(function (d) {
      W.inter.push({ x: d.cx, z: d.cz + 32, r: 2.6, get on() { return cur === d.id; }, label: 'Tram fahren', fn: tramMenu });
      d.sp.forEach(function (s, i) {
        W.inter.push({ x: d.cx + POS[i][0], z: d.cz + POS[i][1] + 1.2, r: 2.4, get on() { return cur === d.id; },
          get label() { return s.e + ' ' + s.n + (s.cost ? ' (' + s.cost + ' €)' : '') + (isOpen(s.open) ? '' : ' – geschlossen'); }, fn: function () { use(d, s); } });
      });
      d.pas.forEach(function (p, i) {
        W.inter.push({ x: d.cx + (i ? 12 : -12), z: d.cz + 12 + i * 4 + 1.6, r: 2.2, get on() { return cur === d.id; }, label: 'Ansprechen: ' + p[0], fn: function () { GL.core.say(p[0], p.look, [p[1]]); } });
      });
    });
    // Ring am Brunnenplatz für die Haltestelle
    var m = new THREE.Mesh(new THREE.RingGeometry(1.2, 1.8, 24), new THREE.MeshBasicMaterial({ color: 0x4a8dff, transparent: true, opacity: .9, side: THREE.DoubleSide })); m.rotation.x = -Math.PI / 2; m.position.set(10, .1, 18); W.scene.add(m);
    var pole = new THREE.Mesh(new THREE.BoxGeometry(.3, 3.4, .3), GL.core.lmat(0x8a8aa0)); pole.position.set(10, 1.7, 16); W.scene.add(pole);
    var sign = GL.core.labelSprite('🚋 Tram', 1.2); sign.position.set(10, 5, 16); W.scene.add(sign);
    W.colliders.push({ x0: 9.8, x1: 10.2, z0: 15.8, z1: 16.2 });
  });
  /* Laternen und Fenster folgen der Tageszeit */
  var acc = 0;
  GL.on('tick', function (dt, W) {
    acc += dt; if (acc < 1.5 || !cur || !built[cur]) return; acc = 0;
    var night = Math.sin(S.world.t * 6.2832) < .15;
    if (lampM) lampM.emissiveIntensity = night ? 1 : .1;
    built[cur].children.forEach(function (c) { if (c.userData.win) c.material.emissiveIntensity = night ? 1 : .1; });
  });

  /* Tram-App im Handy */
  GL.phone.register('tram', 'Tram', '🚋', function () {
    var h = '<p class="sub">Du bist: <b>' + GL.core.esc(cur ? by(cur).n : 'Pride District') + '</b>. Fahrpreis ' + FARE + ' €, Fahrt 20 Minuten.</p>';
    if (cur) h += '<button class="row2" data-t="kiez"><span class="e">🏳️‍🌈</span><span style="flex:1"><b>Pride District</b><br><small class="sub">Das Regenbogenkiez mit Wohnung, Club und Minispielen</small></span></button>';
    DS.forEach(function (d) { if (d.id !== cur) h += '<button class="row2" data-t="' + d.id + '"><span class="e">' + d.e + '</span><span style="flex:1"><b>' + d.n + '</b><br><small class="sub">' + GL.core.esc(d.tx) + '</small></span></button>'; });
    return h;
  }, function (p) { [].forEach.call(p.querySelectorAll('[data-t]'), function (b) { b.onclick = function () { GL.phone.close(); D.go(b.dataset.t); }; }); });
})();
