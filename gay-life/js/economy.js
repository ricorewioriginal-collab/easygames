/* GayLife – Geld und Arbeit: Kontostand mit Buchungsliste, Späti Lecker (Einkauf), Barkeeper-Schichten im Club Glitzer.
   Glitzer (✨) bleibt die Ruf-/Erfahrungswährung für Kleidung; Euro (€) ist das Alltagsgeld. */
(function () {
  'use strict';
  var S = GL.S, L = S.life;
  var eco = GL.eco = {};

  function book(a, t) {
    L.log.unshift({ d: L.day, h: GL.life.clock(), a: Math.round(a), t: String(t).slice(0, 60) });
    if (L.log.length > 30) L.log.length = 30;
  }
  eco.earn = function (a, t) { a = Math.max(0, Math.round(a)); L.money += a; book(a, t); GL.life.hud(); GL.save(); return a; };
  eco.spend = function (a, t) { a = Math.round(a); if (a > L.money) return false; L.money -= a; book(-a, t); GL.life.hud(); GL.save(); return true; };

  /* ---------- Späti Lecker ---------- */
  var KIOSK = { x: 17, z: 37, w: 6, d: 7 };
  var GOODS = [
    { id: 'brezel', e: '🥨', n: 'Brezel', p: 3, s: 'Satt +15', min: 5, d: { hunger: 15 } },
    { id: 'kaffee', e: '☕', n: 'Kaffee to go', p: 3, s: 'Energie +12, Stress +3', min: 5, d: { energy: 12, stress: 3 } },
    { id: 'smoothie', e: '🥤', n: 'Smoothie', p: 4, s: 'Satt +8, Energie +5, gute Laune', min: 5, d: { hunger: 8, energy: 5 }, b: 3 },
    { id: 'menu', e: '🍜', n: 'Nudelbox', p: 8, s: 'Satt +40, direkt gegessen', min: 15, d: { hunger: 40 } },
    { id: 'food', e: '🛒', n: 'Lebensmittel (3 Portionen)', p: 14, s: 'Zum Kochen zu Hause, günstiger als Essen gehen', min: 5, food: 3 }
  ];
  eco.GOODS = GOODS; eco.KIOSK = KIOSK;
  eco.buy = function (id) {
    var g = GOODS.filter(function (x) { return x.id === id; })[0]; if (!g) return false;
    if (!eco.spend(g.p, 'Späti: ' + g.n)) { GL.core.toast('Dafür reicht dein Geld nicht.'); GL.core.sfx('no'); return false; }
    if (g.food) L.food += g.food;
    if (g.d) { GL.life.change(g.d, g.b || 0); }
    GL.life.advance(g.min); GL.core.sfx('ok');
    GL.core.toast(g.food ? 'Eingekauft: ' + g.n + ' · im Kühlschrank: ' + L.food : g.n + ' gegönnt.');
    GL.save(); return true;
  };
  function shop() {
    GL.ui.menu('Späti Lecker', 'Rund um die Uhr geöffnet. Kontostand: <b>' + Math.floor(L.money) + ' €</b> · Im Kühlschrank: ' + L.food + ' Portionen',
      GOODS.map(function (g) { return { e: g.e, t: g.n, s: g.s, r: g.p + ' €', dis: g.p > L.money, fn: function () { if (eco.buy(g.id)) shop(); } }; }), 'shop');
  }
  eco.shop = shop;

  GL.on('worldBuilt', function (W) {
    var C = GL.core, k = KIOSK, g = new THREE.Group(); g.position.set(k.x, 0, k.z); W.scene.add(g);
    var body = new THREE.Mesh(new THREE.BoxGeometry(k.w, 4.2, k.d), C.lmat(0xfff1d6)); body.position.y = 2.1; g.add(body);
    var roof = new THREE.Mesh(new THREE.BoxGeometry(k.w + .6, .5, k.d + .6), C.lmat(0x2e8b6e)); roof.position.y = 4.45; g.add(roof);
    // Schaufenster und Markise zur Straße (Westseite)
    var win = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 2), new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0xffd98a, emissiveIntensity: .35, map: C.cvTex(128, 64, function (c, w, h) {
      c.fillStyle = '#3a4a73'; c.fillRect(0, 0, w, h); var col = ['#ff9f1c', '#3ddc84', '#ff3b6b', '#ffe14d', '#2ea8ff'];
      for (var y = 0; y < 3; y++) for (var x = 0; x < 9; x++) { c.fillStyle = col[(x + y) % 5]; c.fillRect(6 + x * 13, 8 + y * 18, 9, 12); }
    }) }));
    win.rotation.y = -Math.PI / 2; win.position.set(-k.w / 2 - .02, 1.9, -1.2); g.add(win);
    var aw = new THREE.Mesh(new THREE.BoxGeometry(1.6, .2, k.d - .4), C.lmat(0x2e8b6e, { emissive: 0x112211 })); aw.position.set(-k.w / 2 - .7, 3.4, 0); aw.rotation.z = -.25; g.add(aw);
    var door = new THREE.Mesh(new THREE.BoxGeometry(.2, 2.8, 1.6), C.lmat(0x3b2a4a)); door.position.set(-k.w / 2 - .02, 1.4, 2); g.add(door);
    var lb = C.labelSprite('🛒 Späti Lecker', 1.6); lb.position.set(0, 6, 0); g.add(lb);
    W.win.push(win.material);
    W.colliders.push({ x0: k.x - k.w / 2, x1: k.x + k.w / 2, z0: k.z - k.d / 2, z1: k.z + k.d / 2 });
    var ring = new THREE.Mesh(new THREE.RingGeometry(.9, 1.3, 24), new THREE.MeshBasicMaterial({ color: 0x2e8b6e, transparent: true, opacity: .9, side: THREE.DoubleSide }));
    ring.rotation.x = -Math.PI / 2; ring.position.set(k.x - k.w / 2 - 1.6, .1, k.z + .4); W.scene.add(ring);
    W.inter.push({ x: k.x - k.w / 2 - 1.6, z: k.z + .4, r: 2.4, label: 'Einkaufen: Späti Lecker', fn: shop });
    eco.kioskPos = { x: k.x - k.w / 2 - 1.6, z: k.z + .4 };
  });

  /* ---------- Barkeeper im Club Glitzer ---------- */
  eco.barLevel = function () { return Math.floor(Math.sqrt(S.jobs.bar.xp / 40)) + 1; };
  GL.on('poi', function (id) {
    if (id !== 'club') return;
    if (L.needs.energy < 12) {
      var b = GL.core.NPCDEF.filter(function (x) { return x.id === 'bruno'; })[0];
      GL.core.say(b.n, b.look, ['Du schläfst ja gleich im Stehen ein. So lasse ich dich nicht hinter die Bar.', 'Geh nach Hause, schlaf dich aus und komm dann wieder.']);
      return true;
    }
  });
  GL.on('clubShift', function (r) {
    var J = S.jobs.bar, lv = eco.barLevel(), wage = 4 * (10 + Math.min(10, lv - 1)), f = GL.life.moodFactor(), tip = Math.round(r.tips * .2 * f);
    J.shifts++; J.xp += Math.max(1, r.served); var lv2 = eco.barLevel();
    eco.earn(wage + tip, 'Schicht im Club Glitzer'); J.earned += wage + tip;
    GL.life.advance(240); GL.life.change({ energy: -15, stress: 10, social: 10 });
    GL.save();
    return '<p class="sub">Lohn ' + wage + ' € + Trinkgeldanteil ' + tip + ' € (Laune ×' + f.toFixed(2).replace('.', ',') + ') = <b>' + (wage + tip) + ' €</b> · 4 Std. vergangen · ⚡−15 🌀+10 💬+10</p>' +
      (lv2 > lv ? '<p><b>Beförderung!</b> Barkeeper-Stufe ' + lv2 + ': mehr Stundenlohn.</p>' : '') +
      (L.needs.energy < 15 ? '<p class="sub">Du bist völlig erschöpft. Ab ins Bett!</p>' : '');
  });
})();
