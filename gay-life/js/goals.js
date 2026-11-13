/* GayLife – Spielfokus: Tagesziele, Regenbogen-Sticker zum Sammeln und Erfolge.
   Jeden Spieltag gibt es drei Tagesziele aus einem Pool (Belohnung: Euro und Glitzer; alle drei = Bonus und Serie).
   In jedem Viertel liegen leuchtende Regenbogen-Sticker (Pride District 12, sonst je 3); man sammelt sie im Vorbeilaufen.
   Erfolge belohnen langfristige Ziele. Alles steht in der Handy-App „Ziele“ und kurz in der Leiste unter dem Status.
   Spielstand: S.goals (lazy). Zählt nur über Ereignisse anderer Module (talk, activity, danced, district, clubShift, shift, earn …). */
(function () {
  'use strict';
  var S = GL.S, L = S.life, C = function () { return GL.core; };
  var G = GL.goals = {};
  function st() {
    var g = S.goals || (S.goals = {});
    g.st = g.st || {}; g.ach = g.ach || {}; g.stk = g.stk || {}; g.list = g.list || []; g.vis = g.vis || {};
    ['walk', 'talk', 'games', 'earn', 'dance', 'trips', 'shifts', 'stk', 'goals', 'days'].forEach(function (k) { g.st[k] = +g.st[k] || 0; });
    g.streak = +g.streak || 0; g.best = +g.best || 0; return g;
  }
  function rng(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  /* ---------- Tagesziele ---------- */
  function m(k) { return function () { return st().st[k]; }; }
  var POOL = [
    { id: 'walk', e: '👟', t: function (n) { return 'Lauf ' + n + ' m durch die Stadt'; }, n: [300, 500, 700], m: m('walk') },
    { id: 'talk', e: '💬', t: function (n) { return 'Sprich mit ' + n + ' Leuten'; }, n: [2, 3, 4], m: m('talk') },
    { id: 'games', e: '🎮', t: function (n) { return n > 1 ? 'Spiele ' + n + ' Minispiele' : 'Spiele ein Minispiel'; }, n: [1, 2, 2], m: m('games') },
    { id: 'earn', e: '💶', t: function (n) { return 'Verdiene ' + n + ' €'; }, n: [40, 70, 100], m: m('earn') },
    { id: 'stk', e: '🌈', t: function (n) { return 'Sammle ' + n + ' Regenbogen-Sticker'; }, n: [1, 2, 3], m: m('stk'), ok: function () { return G.left() > 0; } },
    { id: 'meal', e: '🍝', t: function () { return 'Koch dir zu Hause etwas'; }, n: [1, 1, 1], m: function () { return L.stats.meals; } },
    { id: 'shower', e: '🚿', t: function () { return 'Dusch dich zu Hause'; }, n: [1, 1, 1], m: function () { return L.stats.showers; } },
    { id: 'trip', e: '🚋', t: function (n) { return n > 1 ? 'Fahr ' + n + '× mit der Tram in ein Viertel' : 'Fahr mit der Tram in ein Viertel'; }, n: [1, 1, 2], m: m('trips') },
    { id: 'dance', e: '💃', t: function () { return 'Tanz im Club Glitzer (ab 20 Uhr)'; }, n: [1, 1, 1], m: m('dance') },
    { id: 'shift', e: '💼', t: function () { return 'Arbeite eine Schicht'; }, n: [1, 1, 1], m: m('shifts') },
    { id: 'mood', e: '😄', t: function (n) { return 'Bring deine Stimmung auf ' + n; }, n: [65, 70, 75], m: function () { return st().moodMax || 0; }, abs: 1 }
  ];
  function byId(id) { return POOL.filter(function (p) { return p.id === id; })[0]; }
  function newDay(day) {
    var g = st(), r = rng(hash('gl' + day)), pool = POOL.filter(function (p) { return !p.ok || p.ok(); }), pick = [];
    while (pick.length < 3 && pool.length) pick.push(pool.splice(Math.floor(r() * pool.length), 1)[0]);
    var tier = Math.min(2, Math.floor((day - 1) / 4));
    g.day = day; g.moodMax = GL.life ? GL.life.mood() : 0; g.paid = 0;
    g.list = pick.map(function (p) { return { id: p.id, n: p.n[tier], b: p.abs ? 0 : p.m(), done: 0 }; });
  }
  function prog(q) { var p = byId(q.id); if (!p) return 0; return Math.max(0, Math.min(q.n, p.abs ? p.m() : p.m() - q.b)); }
  G.today = function () { var g = st(); if (g.day !== L.day) newDay(L.day); return g.list.map(function (q) { var p = byId(q.id); return { id: q.id, e: p.e, t: p.t(q.n), p: prog(q), n: q.n, done: !!q.done }; }); };
  var REW = { money: 25, glz: 15, bonus: 60 };
  var OFF = !!window.__GL_NOGOALS;   // nur für ältere Tests, die genaue Kontostände prüfen
  function check() {
    if (OFF) return;
    var g = st(); if (g.day !== L.day) newDay(L.day);
    var changed = false;
    g.list.forEach(function (q) {
      if (q.done || prog(q) < q.n) return;
      q.done = 1; changed = true; g.st.goals++;
      GL.eco.earn(REW.money, 'Tagesziel'); C().gain(REW.glz);
      C().banner('🎯 Tagesziel geschafft!', byId(q.id).t(q.n) + ' · +' + REW.money + ' € · ✨ +' + REW.glz); C().sfx('ok'); if (GL.pad) GL.pad.rumble(120, .5);
    });
    if (!g.paid && g.list.length && g.list.every(function (q) { return q.done; })) {
      g.paid = 1; g.streak++; g.best = Math.max(g.best, g.streak); g.st.days++;
      var bonus = REW.bonus + Math.min(6, g.streak - 1) * 10; C().gain(bonus); changed = true;
      setTimeout(function () { C().banner('🏆 Alle Tagesziele!', 'Serie: ' + g.streak + (g.streak > 1 ? ' Tage' : ' Tag') + ' · ✨ +' + bonus); C().sfx('ok'); }, 3800);
    }
    if (changed) { GL.save(); hud(); achCheck(); if (GL.phone) GL.phone.refresh(); }
  }
  GL.on('newDay', function (day) {
    var g = st(); if (g.day && g.day !== day && !g.paid) g.streak = 0;   // Serie reißt, wenn ein Tag nicht komplett war
    newDay(day); GL.save(); hud();
  });

  /* ---------- Zähler aus anderen Modulen ---------- */
  GL.on('talk', function () { st().st.talk++; check(); });
  GL.on('activity', function () { st().st.games++; check(); });
  GL.on('danced', function (pts) { if (pts >= 1) { st().st.dance++; check(); } });
  GL.on('district', function (id) { var g = st(); if (id !== 'kiez') { g.st.trips++; g.vis[id] = 1; } check(); spawn(); });
  GL.on('clubShift', function () { st().st.shifts++; setTimeout(check, 50); });
  GL.on('shift', function () { st().st.shifts++; check(); });
  GL.on('earn', function (a, t) { if (/Tagesziel|Erfolg|Sticker/.test(t || '')) return; st().st.earn += a; check(); });
  var lx = null, lz = null, acc = 0, mt = 0;
  GL.on('tick', function (dt, W) {
    var p = W.player, g = st();
    if (lx !== null) { var d = Math.hypot(p.x - lx, p.z - lz); if (d < 3) g.st.walk += d; }
    lx = p.x; lz = p.z;
    pick(W, dt);
    mt += dt; if (mt > 1) { mt = 0; var mo = GL.life.mood(); if (mo > (g.moodMax || 0)) g.moodMax = mo; }
    acc += dt; if (acc > 2) { acc = 0; check(); hud(); }
  });

  /* ---------- Regenbogen-Sticker ---------- */
  var AREAS = { kiez: 12 }; (GL.dist && GL.dist.LIST || []).forEach(function (d) { AREAS[d.id] = 3; });
  G.total = function () { var n = 0; for (var k in AREAS) n += AREAS[k]; return n; };
  G.got = function (a) { var g = st(), n = 0; for (var k in AREAS) if (!a || a === k) for (var i = 0; i < AREAS[k]; i++) if ((g.stk[k] | 0) & (1 << i)) n++; return n; };
  G.left = function () { return G.total() - G.got(); };
  var stickers = [], tex = null, ringGeo = null, ringMat = null;
  function area() { return GL.dist && GL.dist.cur && GL.dist.cur() ? GL.dist.cur() : 'kiez'; }
  function blocked(W, x, z) {
    var R = 1.6, i;
    for (i = 0; i < W.colliders.length; i++) { var b = W.colliders[i]; if (x > b.x0 - R && x < b.x1 + R && z > b.z0 - R && z < b.z1 + R) return true; }
    for (i = 0; i < W.circles.length; i++) { var c = W.circles[i]; if (Math.hypot(x - c.x, z - c.z) < c.r + R) return true; }
    return false;
  }
  function stickerTex() {
    return tex || (tex = C().cvTex(128, 128, function (g, w, h) {
      var gr = g.createRadialGradient(64, 64, 8, 64, 64, 62); gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(.55, 'rgba(255,240,255,.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      var cols = ['#ff3b6b', '#ff9f1c', '#ffe14d', '#3ddc84', '#2ea8ff', '#9b5cff'];
      g.lineCap = 'round';
      cols.forEach(function (c, i) { g.strokeStyle = c; g.lineWidth = 7; g.beginPath(); g.arc(64, 78, 44 - i * 6.5, Math.PI, 0); g.stroke(); });
      g.fillStyle = '#fff'; g.beginPath(); g.arc(46, 80, 9, 0, 6.3); g.arc(58, 76, 11, 0, 6.3); g.arc(72, 80, 9, 0, 6.3); g.fill();
    }));
  }
  function clear(W) { stickers.forEach(function (s) { W.scene.remove(s.g); }); stickers = []; }
  function spawn() {
    var W = GL.W; if (!W || !W.scene || OFF) return; clear(W);
    var a = area(), n = AREAS[a] || 0, b = W.bounds, r = rng(hash('stk-' + a)), g = st(), tries = 0, i = 0;
    ringGeo = ringGeo || new THREE.TorusGeometry(.75, .07, 6, 24); ringMat = ringMat || new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .55 });
    while (i < n && tries < 400) {
      tries++; var x = b.x0 + 4 + r() * (b.x1 - b.x0 - 8), z = b.z0 + 4 + r() * (b.z1 - b.z0 - 8);
      if (blocked(W, x, z)) continue;
      var have = (g.stk[a] | 0) & (1 << i), grp = new THREE.Group(), sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: stickerTex(), transparent: true, depthWrite: false }));
      sp.scale.set(1.5, 1.5, 1); grp.add(sp); var ring = new THREE.Mesh(ringGeo, ringMat); ring.rotation.x = -Math.PI / 2; ring.position.y = -1.1; grp.add(ring);
      grp.position.set(x, 1.4, z); grp.visible = !have; W.scene.add(grp);
      stickers.push({ a: a, i: i, x: x, z: z, g: grp, sp: sp, have: !!have, ph: r() * 6 });
      i++;
    }
  }
  G.stickers = function () { return stickers; };
  function pick(W, dt) {
    if (W.inside) { stickers.forEach(function (s) { s.g.visible = false; }); return; }
    var p = W.player, t = W.t;
    stickers.forEach(function (s) {
      if (s.have) return; s.g.visible = true;
      s.g.position.y = 1.4 + Math.sin(t * 2.2 + s.ph) * .18; s.sp.material.rotation = Math.sin(t * 1.5 + s.ph) * .25;
      if (Math.hypot(p.x - s.x, p.z - s.z) < 1.5) collect(s);
    });
  }
  function collect(s) {
    var g = st(); s.have = true; s.g.visible = false; g.stk[s.a] = (g.stk[s.a] | 0) | (1 << s.i); g.st.stk++;
    var got = G.got(s.a), all = AREAS[s.a], tot = G.got();
    C().gain(8); C().sfx('ok'); if (GL.assets) GL.assets.sound('coins', .45); if (GL.pad) GL.pad.rumble(90, .4);
    if (got === all) { var bon = all * 10; GL.eco.earn(bon, 'Sticker-Sammlung'); C().banner('🌈 Alle Sticker hier!', all + '/' + all + ' · +' + bon + ' € · insgesamt ' + tot + '/' + G.total()); }
    else C().toast('🌈 Regenbogen-Sticker ' + got + '/' + all + ' hier · insgesamt ' + tot + '/' + G.total() + ' · ✨ +8');
    GL.save(); check(); achCheck(); hud();
  }
  GL.on('worldBuilt', function () { setTimeout(spawn, 0); });
  GL.on('enterWorld', function () { setTimeout(function () { if (!stickers.length || stickers[0].a !== area()) spawn(); }, 0); });

  /* ---------- Erfolge ---------- */
  var ACH = [
    ['goal1', '🎯', 'Erstes Tagesziel', 'Schaffe ein Tagesziel.', function (g) { return g.st.goals >= 1; }, 20],
    ['day1', '🏆', 'Perfekter Tag', 'Schaffe alle drei Tagesziele an einem Tag.', function (g) { return g.st.days >= 1; }, 40],
    ['streak3', '🔥', 'Drei am Stück', 'Drei perfekte Tage hintereinander.', function (g) { return g.best >= 3; }, 80],
    ['streak7', '🌟', 'Eine Woche voll Farbe', 'Sieben perfekte Tage hintereinander.', function (g) { return g.best >= 7; }, 200],
    ['stk1', '🌈', 'Erster Sticker', 'Sammle einen Regenbogen-Sticker.', function () { return G.got() >= 1; }, 10],
    ['stkKiez', '🏳️‍🌈', 'Pride-District-Profi', 'Alle Sticker im Pride District.', function () { return G.got('kiez') >= AREAS.kiez; }, 80],
    ['stkAll', '💎', 'Ganz Rainbow City', 'Alle Sticker in allen Vierteln.', function () { return G.left() === 0; }, 300],
    ['walk', '👟', 'Stadtläufer', 'Lauf insgesamt 5 km.', function (g) { return g.st.walk >= 5000; }, 50],
    ['talk', '🗣️', 'Kiez-Plaudertasche', 'Führe 50 Gespräche.', function (g) { return g.st.talk >= 50; }, 60],
    ['games', '🎮', 'Spielkind', 'Spiele 20 Minispiele.', function (g) { return g.st.games >= 20; }, 60],
    ['dance', '💃', 'Tanzflächen-Star', 'Tanze 10-mal im Club.', function (g) { return g.st.dance >= 10; }, 60],
    ['shift', '💼', 'Fleißig', 'Arbeite 10 Schichten.', function (g) { return g.st.shifts >= 10; }, 60],
    ['rich', '💶', 'Gut bei Kasse', 'Hab 1000 € auf dem Konto.', function () { return L.money >= 1000; }, 80],
    ['trips', '🚋', 'Weltenbummler', 'Besuche alle Viertel von Rainbow City.', function (g) { return Object.keys(g.vis).length >= Object.keys(AREAS).length - 1; }, 80],
    ['lvl', '✨', 'Glitzer-Ikone', 'Erreiche Level 10.', function () { return C().level() >= 10; }, 120]
  ];
  G.ach = function () { var g = st(); return ACH.map(function (a) { return { id: a[0], e: a[1], t: a[2], d: a[3], r: a[5], done: !!g.ach[a[0]] }; }); };
  function achCheck() {
    if (OFF) return;
    var g = st(), n = 0;
    ACH.forEach(function (a) {
      if (g.ach[a[0]] || !a[4](g)) return;
      g.ach[a[0]] = L.day; n++; C().gain(a[5]);
      setTimeout(function () { C().banner(a[1] + ' Erfolg: ' + a[2], a[3] + ' · ✨ +' + a[5]); C().sfx('ok'); }, 1800 * n);
    });
    if (n) GL.save();
  }

  /* ---------- Anzeige: Leiste unter dem Status und Handy-App ---------- */
  function hud() {
    var h = document.getElementById('wgoal'), W = GL.W; if (!W) return;
    if (!h) {
      var hb = document.getElementById('hud'); if (!hb) return;
      h = document.createElement('button'); h.id = 'wgoal'; h.className = 'wchip'; h.title = 'Tagesziele (Handy)';
      hb.parentNode.insertBefore(h, hb.nextSibling); h.onclick = function () { GL.phone.open('goals'); };
    }
    var t = G.today(), d = t.filter(function (q) { return q.done; }).length, nx = t.filter(function (q) { return !q.done; })[0];
    h.innerHTML = '<b>🎯 ' + d + '/3</b>' + (nx ? ' <span>' + C().esc(nx.e + ' ' + nx.t) + ' <i>' + Math.floor(nx.p) + '/' + nx.n + '</i></span>' : ' <span>Alle Tagesziele geschafft!</span>') + ' <b>🌈 ' + G.got() + '/' + G.total() + '</b>';
  }
  G.hud = hud;
  function bar(p, n) { return '<div class="bar pbar"><i style="width:' + Math.round(Math.min(1, p / n) * 100) + '%"></i></div>'; }
  if (GL.phone) GL.phone.register('goals', 'Ziele', '🎯', function () {
    var g = st(), h = '<div class="pcard"><b>Tagesziele · Tag ' + L.day + '</b><small class="sub">Je Ziel ' + REW.money + ' € und ✨ ' + REW.glz + '. Alle drei: Bonus ✨ ' + REW.bonus + '+ und die Serie wächst. Serie: 🔥 ' + g.streak + ' (Rekord ' + g.best + ')</small></div>';
    G.today().forEach(function (q) { h += '<div class="pcard"><b>' + (q.done ? '✅' : q.e) + ' ' + C().esc(q.t) + '</b> <span class="sub">' + Math.floor(q.p) + ' / ' + q.n + '</span>' + bar(q.p, q.n) + '</div>'; });
    h += '<div class="pcard"><b>🌈 Regenbogen-Sticker ' + G.got() + ' / ' + G.total() + '</b><small class="sub">Leuchtende Sticker liegen überall in Rainbow City – einfach hinlaufen. Alle in einem Viertel bringen Geld.</small>';
    Object.keys(AREAS).forEach(function (k) { var nm = k === 'kiez' ? 'Pride District' : ((GL.dist.LIST.filter(function (d) { return d.id === k; })[0] || {}).n || k); h += '<div class="pline">' + C().esc(nm) + ' <span class="sub" style="float:right">' + G.got(k) + ' / ' + AREAS[k] + '</span></div>'; });
    h += '</div><div class="pcard"><b>🏅 Erfolge ' + G.ach().filter(function (a) { return a.done; }).length + ' / ' + ACH.length + '</b></div>';
    G.ach().forEach(function (a) { h += '<div class="pcard" style="' + (a.done ? '' : 'opacity:.6') + '"><b>' + (a.done ? a.e : '🔒') + ' ' + C().esc(a.t) + '</b> <span class="sub">✨ ' + a.r + '</span><small class="sub">' + C().esc(a.d) + '</small></div>'; });
    return h;
  });
  GL.on('worldBuilt', function () { setTimeout(hud, 0); });
  G.check = check;
})();
