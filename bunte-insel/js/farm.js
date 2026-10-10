'use strict';
/* Bunte Insel – Bauernhof: Felder mähen (Traktor, Mähdrescher, Aufsitzmäher), Streichelzoo mit Tieren zum Entdecken (Tierbuch),
   Tiere streicheln und füttern, Eier sammeln, Bauer Heinz mit kleinen Aufgaben und dem Hofladen. */
BI.createFarm = function (G) {
  const { scene, W, A, fx, P, save, persist, say, addStars } = G, $ = id => document.getElementById(id), K = { bookOpen: false }, TAU = BI.TAU, clamp = BI.clamp;
  const mat = BI.mat(), S = () => (save.farm = save.farm || {}), book = () => (S().book = S().book || {});

  /* ---------- Tierarten ---------- */
  const SP = {
    cow: { icon: '🐮', name: 'Kuh', snd: 'moo', fact: 'Kühe fressen den ganzen Tag Gras und geben Milch.' }, sheep: { icon: '🐑', name: 'Schaf', snd: 'baa', fact: 'Schafe haben ein dickes, warmes Fell aus Wolle.' },
    goat: { icon: '🐐', name: 'Ziege', snd: 'goat', fact: 'Ziegen können ganz toll klettern, sogar auf Felsen!' }, pig: { icon: '🐷', name: 'Schwein', snd: 'oink', fact: 'Schweine sind sehr schlau und baden gern im Matsch.' },
    chicken: { icon: '🐔', name: 'Huhn', snd: 'cluck', fact: 'Hühner legen Eier – fast jeden Tag eins!' }, horse: { icon: '🐴', name: 'Pferd', snd: 'neigh', fact: 'Pferde können sogar im Stehen schlafen.' },
    rabbit: { icon: '🐰', name: 'Hase', snd: 'giggle', fact: 'Hasen hoppeln schnell und knabbern am liebsten Karotten.' }, donkey: { icon: '🫏', name: 'Esel', snd: 'ia', fact: 'Esel rufen laut „I-A“ und sind sehr treu.' },
    duck: { icon: '🦆', name: 'Ente', snd: 'quack', fact: 'Enten haben wasserdichte Federn – der Regen perlt ab.' }
  };
  const ORDER = ['cow', 'sheep', 'goat', 'pig', 'chicken', 'horse', 'rabbit', 'donkey', 'duck'];
  K.SP = SP; K.ORDER = ORDER;
  const FAV = { rabbit: 'carrot', horse: 'carrot', donkey: 'carrot', chicken: 'corn', pig: 'pumpkin', goat: 'sunflower', cow: 'tulip', sheep: 'rose', duck: 'strawberry' };

  /* ---------- Tier-Modelle ---------- */
  function mk(fn, scale) { const b = new BI.Batch(); fn(b); const g = new THREE.Group(), m = b.mesh(mat); m.frustumCulled = false; g.add(m); g.scale.setScalar(scale || 1); return g; }
  const legs = (b, c, x, z, h, w) => { for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box(sx * x, 0, sz * z, w, h, w, c); };
  const MODEL = {
    cow: () => mk(b => { const C = 0xffffff; b.box(0, .95, 0, .8, .8, 1.7, C); b.box(-.41, 1.0, .1, .04, .4, .5, 0x2b2b30); b.box(.41, 1.15, -.3, .04, .35, .45, 0x2b2b30); legs(b, 0xf2f2f2, .27, .65, .75, .2); b.box(0, 1.2, .95, .5, .55, .5, C); b.box(0, 1.05, 1.28, .38, .28, .2, 0xffb0c0); b.box(-.15, 1.4, 1.0, .06, .06, .04, 0x222222); b.box(.15, 1.4, 1.0, .06, .06, .04, 0x222222); b.cone(-.22, 1.6, .9, .05, .2, 0xf0e0b0, 5); b.cone(.22, 1.6, .9, .05, .2, 0xf0e0b0, 5); b.box(-.32, 1.5, .85, .12, .08, .22, 0x2b2b30); b.box(.32, 1.5, .85, .12, .08, .22, 0x2b2b30); b.box(0, .95, -.95, .08, .7, .08, 0x2b2b30, 0, .15); b.box(0, .5, -.2, .35, .14, .5, 0xffb0c0); }, 1),
    sheep: () => mk(b => { b.sph(0, .65, 0, .5, 0xfdfbf2, 1, .95, .9, 1.25); b.sph(-.25, .85, .1, .28, 0xf4f1e6, 1); b.sph(.25, .85, -.1, .28, 0xf4f1e6, 1); legs(b, 0x4a4a52, .2, .32, .38, .1); b.sph(0, .8, .62, .22, 0x4a4a52, 1); b.cone(-.17, .95, .62, .06, .16, 0x4a4a52, 4); b.cone(.17, .95, .62, .06, .16, 0x4a4a52, 4); b.box(-.08, .85, .8, .04, .04, .03, 0xffffff); b.box(.08, .85, .8, .04, .04, .03, 0xffffff); }, 1),
    goat: () => mk(b => { const W_ = 0xf2eee2; b.box(0, .5, 0, .5, .5, 1.0, W_); legs(b, 0x9a8f80, .18, .38, .5, .12); b.box(0, .85, .6, .34, .4, .4, W_); b.box(0, .9, .85, .2, .2, .18, 0xe8dcc8); b.box(0, .6, .86, .1, .18, .08, 0xe8dcc8); b.cone(-.1, 1.15, .55, .05, .28, 0x8a7a60, 5); b.cone(.1, 1.15, .55, .05, .28, 0x8a7a60, 5); b.box(0, .6, -.55, .1, .22, .12, W_); b.box(-.1, .9, .78, .05, .05, .04, 0x222222); b.box(.1, .9, .78, .05, .05, .04, 0x222222); }, 1),
    pig: () => mk(b => { b.sph(0, .5, 0, .5, 0xffa8c0, 1, .9, .8, 1.3); legs(b, 0xff8fb0, .24, .45, .3, .16); b.sph(0, .62, .62, .3, 0xffa8c0, 1); b.box(0, .55, .9, .22, .17, .1, 0xff7aa2); b.cone(-.16, .95, .6, .1, .2, 0xff8fb0, 4); b.cone(.16, .95, .6, .1, .2, 0xff8fb0, 4); b.sph(0, .7, -.62, .08, 0xff7aa2, 0); b.box(-.1, .7, .86, .05, .05, .04, 0x222222); b.box(.1, .7, .86, .05, .05, .04, 0x222222); }, .95),
    chicken: () => mk(b => { b.sph(0, .35, 0, .3, 0xffffff, 1, .9, .9, 1.1); b.sph(0, .62, .25, .17, 0xffffff, 1); b.cone(0, .72, .25, .06, .15, 0xe0382b, 4); b.cone(0, .62, .42, .05, .14, 0xffa31a, 4); b.box(0, .5, -.3, .1, .3, .3, 0xffffff, 0, -.4); b.box(-.05, 0, .02, .04, .22, .04, 0xffa31a); b.box(.05, 0, .02, .04, .22, .04, 0xffa31a); b.box(-.08, .66, .36, .04, .04, .03, 0x222222); b.box(.08, .66, .36, .04, .04, .03, 0x222222); }, 1),
    horse: () => mk(b => { const C = 0x8a5a33; b.box(0, 1.0, 0, .7, .8, 1.7, C); legs(b, C, .22, .7, 1.0, .18); b.box(0, 1.5, .85, .38, .9, .5, C, 0, .5); b.box(0, 1.9, 1.15, .36, .42, .7, C); b.box(0, 1.85, 1.5, .25, .2, .2, 0x5a3a1e); b.cone(-.12, 2.25, 1.0, .07, .22, C, 4); b.cone(.12, 2.25, 1.0, .07, .22, C, 4); b.box(0, 1.75, .78, .08, .8, .2, 0x2b1a0e); b.box(0, 1.0, -.95, .14, .9, .14, 0x2b1a0e, 0, .2); b.box(-.1, 1.95, 1.3, .05, .05, .04, 0x111111); b.box(.1, 1.95, 1.3, .05, .05, .04, 0x111111); }, 1),
    rabbit: () => mk(b => { b.sph(0, .3, 0, .28, 0xffffff, 1, .9, .9, 1.2); b.sph(0, .48, .28, .18, 0xffffff, 1); b.box(-.07, .6, .26, .07, .38, .05, 0xffffff, 0, 0, .1); b.box(.07, .6, .26, .07, .38, .05, 0xffffff, 0, 0, -.1); b.box(-.07, .62, .28, .03, .28, .03, 0xffb0c8); b.box(.07, .62, .28, .03, .28, .03, 0xffb0c8); b.sph(0, .3, -.35, .1, 0xffffff, 1); b.box(-.07, .5, .43, .04, .04, .03, 0x222222); b.box(.07, .5, .43, .04, .04, .03, 0x222222); b.sph(0, .44, .44, .04, 0xff8fb0, 0); }, 1),
    donkey: () => mk(b => { const C = 0x9aa0a8; b.box(0, .8, 0, .6, .7, 1.4, C); legs(b, C, .2, .55, .8, .15); b.box(0, 1.2, .7, .32, .7, .42, C, 0, .5); b.box(0, 1.5, .98, .32, .38, .6, C); b.box(0, 1.45, 1.3, .24, .18, .18, 0xe8e0d0); b.box(-.14, 1.8, .85, .09, .5, .08, C, 0, 0, .15); b.box(.14, 1.8, .85, .09, .5, .08, C, 0, 0, -.15); b.box(0, .85, -.8, .1, .7, .1, 0x555b66, 0, .2); b.box(-.09, 1.58, 1.13, .04, .04, .03, 0x111111); b.box(.09, 1.58, 1.13, .04, .04, .03, 0x111111); }, 1),
    duck: () => mk(b => { b.sph(0, .25, 0, .3, 0xffe14a, 1, .9, .7, 1.2); b.sph(0, .5, .25, .16, 0xffe14a, 1); b.box(0, .47, .42, .14, .06, .18, 0xff8a1f); b.box(-.06, .55, .35, .04, .04, .03, 0x222222); b.box(.06, .55, .35, .04, .04, .03, 0x222222); b.box(0, .02, 0, .5, .03, .6, 0xffe14a); }, 1)
  };

  /* ---------- Tiere im Streichelzoo (laufen im Gehege umher) ---------- */
  const animals = []; K.animals = animals;
  for (const pen of W.spots.pens) {
    const kind = pen.id === 'chicken' || pen.id === 'rabbit' ? pen.id : pen.id;
    const n = pen.n;
    for (let i = 0; i < n; i++) {
      const m = MODEL[kind](); const x = pen.x0 + Math.random() * (pen.x1 - pen.x0), z = pen.z0 + Math.random() * (pen.z1 - pen.z0);
      const a = { k: kind, m, x, z, h: Math.random() * TAU, tx: x, tz: z, wait: Math.random() * 3, hop: 0, ph: Math.random() * 6, pen, spd: kind === 'horse' ? 1.6 : kind === 'rabbit' ? 2.4 : kind === 'chicken' ? 1.4 : 1.1, vis: true };
      m.position.set(x, 0, z); scene.add(m); animals.push(a);
    }
    if (pen.id === 'donkey') { /* Enten schwimmen im Teich */
      for (let i = 0; i < 4; i++) { const m = MODEL.duck(); const a = { k: 'duck', m, x: pen.x1 - 5, z: pen.cz, h: Math.random() * TAU, tx: 0, tz: 0, wait: 0, hop: 0, ph: Math.random() * 6, pen, pond: { x: pen.x1 - 5, z: pen.cz, r: 2.8 }, ang: i * 1.6, spd: .6, vis: true }; scene.add(m); animals.push(a); }
    }
  }
  /* Kühe + Schafe der alten Koppel (von main verwaltet) */
  const oldW = (G.animals || []).map(o => ({ k: o.k, old: o, get x() { return o.x; }, get z() { return o.z; }, get hop() { return o.hop; }, set hop(v) { o.hop = v; } }));
  const listAll = animals.concat(oldW), all = () => listAll;

  /* ---------- Felder: Halme als Instanzen, werden von Fahrzeugen gemäht ---------- */
  const fields = W.spots.fields.map(f => {
    const cs = 1.5, nx = Math.floor((f.x1 - f.x0) / cs), nz = Math.floor((f.z1 - f.z0) / cs), n = nx * nz;
    const gb = new BI.Batch(); for (let k = 0; k < 7; k++) { const a = k * 2.4, r = .18 + (k % 3) * .1; gb.box(Math.sin(a) * r, 0, Math.cos(a) * r, .1, .9 + (k % 2) * .25, .1, k % 2 ? 0xe8c85a : 0xd9b44a, a, 0, (k % 3 - 1) * .08); }
    const im = new THREE.InstancedMesh(gb.mesh(mat).geometry, new THREE.MeshLambertMaterial({ vertexColors: true }), n); im.frustumCulled = false; im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    const st = new Float32Array(n).fill(1), d = new THREE.Object3D(), pos = [];
    for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) { const x = f.x0 + cs * (i + .5) + (Math.random() - .5) * .4, z = f.z0 + cs * (j + .5) + (Math.random() - .5) * .4; pos.push([x, z, Math.random() * TAU]); }
    const put = idx => { const p = pos[idx], s = st[idx]; d.position.set(p[0], .04, p[1]); d.rotation.set(0, p[2], 0); d.scale.set(1, Math.max(.07, s), 1); d.updateMatrix(); im.setMatrixAt(idx, d.matrix); };
    for (let i = 0; i < n; i++) put(i); im.instanceMatrix.needsUpdate = true; scene.add(im);
    const bales = new THREE.Group(); const bg = new BI.Batch(); bg.cyl(0, 0, 0, .9, .9, 1.2, 0xe8c85a, 12, 0, 0, Math.PI / 2); bg.cyl(0, 0, 0, .92, .92, .12, 0xc9a23a, 12, 0, 0, Math.PI / 2); const bm = bg.mesh(mat); bm.position.y = .9; bm.frustumCulled = false; bales.add(bm); bales.visible = false; scene.add(bales);
    return Object.assign(f, { cs, nx, nz, n, im, st, pos, put, cut: 0, done: false, regrow: 0, bales, bm });
  });
  K.fields = fields;
  function mowAt(v, dt) {
    const R = v.spec.mow; if (!R || P.veh !== v) return; const cx = v.x + Math.sin(v.h) * (v.spec.fly ? 0 : 1.4), cz = v.z + Math.cos(v.h) * 1.4;
    for (const f of fields) {
      if (f.done || cx < f.x0 - R || cx > f.x1 + R || cz < f.z0 - R || cz > f.z1 + R) continue;
      let dirty = false;
      for (let idx = 0; idx < f.n; idx++) { if (f.st[idx] < 1) continue; const p = f.pos[idx], dx = p[0] - cx, dz = p[1] - cz; if (dx * dx + dz * dz < R * R) { f.st[idx] = .07; f.cut++; dirty = true; } }
      if (dirty) { f.touch = true; if (Math.random() < .6) fx.emit(cx, .5, cz, (Math.random() - .5) * 3, 2.5 + Math.random() * 2, (Math.random() - .5) * 3, 1, 22, .9, .85, .3, 7, .9); if (Math.abs(v.v) > .5 && Math.random() < dt * 2.5 && A.swish) A.swish(); }
      if (!f.done && f.cut >= f.n * .95) finishField(f);
    }
  }
  function finishField(f) {
    f.done = true; f.regrow = 160; for (let i = 0; i < f.n; i++) f.st[i] = .07; f.touch = true; f.bales.position.set((f.x0 + f.x1) / 2, 0, (f.z0 + f.z1) / 2); f.bales.visible = true;
    addStars(3); A.fanfare(); say('🌾 Feld gemäht! Schöne Heuballen! +3 ⭐', 3200); fx.burst((f.x0 + f.x1) / 2, 2, (f.z0 + f.z1) / 2, 40, [BI.C.gold, BI.C.white, BI.C.green], 7, 1.6, 30, 9);
    const q = S(); q.mowed = (q.mowed || 0) + 1; persist(); G.earn('farm'); if (G.quest) G.quest('mow');
  }
  function updateFields(dt) {
    for (const f of fields) {
      if (f.done) { f.regrow -= dt; if (f.regrow <= 0) { f.done = false; f.cut = 0; f.bales.visible = false; f.regrowing = true; } }
      if (f.regrowing) { let any = false; for (let i = 0; i < f.n; i++) if (f.st[i] < 1) { f.st[i] = Math.min(1, f.st[i] + dt * .0065); if (f.st[i] < 1) any = true; } f.touch = true; if (!any) f.regrowing = false; }
      if (f.touch) { f.touch = false; for (let i = 0; i < f.n; i++) f.put(i); f.im.instanceMatrix.needsUpdate = true; }
    }
  }
  K.mow = mowAt;
  K.mowedAll = () => fields.every(f => f.done || f.cut >= f.n * .95);

  /* ---------- Eier im Hühnerstall ---------- */
  const egg = new THREE.Mesh(new THREE.SphereGeometry(.17, 8, 6), new THREE.MeshLambertMaterial({ color: 0xfff4dc })); egg.scale.set(.8, 1.1, .8); const eggs = [], henPen = W.spots.pens.find(p => p.id === 'chicken'); let eggT = 4;
  K.eggs = eggs; K.layEgg = () => layEgg();
  function layEgg() { if (eggs.length >= 6 || !henPen) return; const x = henPen.x0 + 1 + Math.random() * (henPen.x1 - henPen.x0 - 2), z = henPen.z0 + 1 + Math.random() * (henPen.z1 - henPen.z0 - 2), m = egg.clone(); m.position.set(x, .18, z); scene.add(m); eggs.push({ m, x, z }); }

  /* ---------- Bauer Heinz + Aufgaben ---------- */
  const F = W.spots.farm, farmer = BI.makeChar({ shirt: 0x4da3ff, pants: 0x3d4a7a, hair: 0xd9d9d9, skin: 0xe0a979, hat: 'cowboy', name: 'Bauer Heinz', scale: 1 }); farmer.group.position.set(F.farmer.x, 0, F.farmer.z); farmer.group.rotation.y = Math.PI; scene.add(farmer.group);
  const QUESTS = [
    { id: 'eggs', icon: '🥚', title: 'Eier sammeln', text: 'Sammle 5 Eier im Hühnerstall und bring sie zu Bauer Heinz.', need: 5, reward: 4 },
    { id: 'mow', icon: '🌾', title: 'Felder mähen', text: 'Mäh beide Felder mit Traktor, Mähdrescher oder Aufsitzmäher.', need: 2, reward: 5 },
    { id: 'veg', icon: '🥕', title: 'Gemüse liefern', text: 'Ernte 3 Sachen in deinem Garten (Wohnung → hinten raus) und bring sie zum Hofladen.', need: 3, reward: 5 },
    { id: 'feed', icon: '🍎', title: 'Tiere füttern', text: 'Füttere 5 verschiedene Tierarten im Streichelzoo.', need: 5, reward: 6 }
  ];
  K.QUESTS = QUESTS;
  const Q = () => { const s = S(); if (!s.q) s.q = { i: 0, p: 0, on: false, rounds: 0, fed: {} }; return s.q; };
  const cur = () => QUESTS[Q().i % QUESTS.length];
  function progress() {
    const q = Q(), c = cur(); if (c.id === 'eggs') return Math.min(c.need, (K.inv().egg || 0)); if (c.id === 'mow') return Math.min(c.need, q.p); if (c.id === 'veg') return Math.min(c.need, ['carrot', 'tomato', 'corn', 'pumpkin', 'strawberry'].reduce((a, k) => a + (K.inv()[k] || 0), 0));
    return Math.min(c.need, Object.keys(q.fed || {}).length);
  }
  K.inv = G.inv;
  K.questEvent = ev => { const q = Q(); if (!q.on) return; if (ev === 'mow' && cur().id === 'mow') { q.p = Math.min(2, q.p + 1); persist(); } };
  G.quest = K.questEvent;
  K.talk = function () {
    const q = Q(), c = cur(); farmer.group.rotation.y = Math.atan2(P.x - F.farmer.x, P.z - F.farmer.z);
    if (!q.on) { q.on = true; q.p = 0; q.fed = {}; persist(); say('Bauer Heinz: „Hallo! Hilfst du mir? ' + c.icon + ' ' + c.text + '“', 5200); return; }
    const p = progress();
    if (p >= c.need) {
      if (c.id === 'eggs') K.inv().egg = Math.max(0, (K.inv().egg || 0) - c.need); if (c.id === 'veg') { let n = c.need; for (const k of ['carrot', 'tomato', 'corn', 'pumpkin', 'strawberry']) { const t = Math.min(n, K.inv()[k] || 0); K.inv()[k] = (K.inv()[k] || 0) - t; n -= t; } }
      const bonus = c.reward + Math.min(4, q.rounds); addStars(bonus); A.fanfare(); fx.burst(P.x, 2.2, P.z, 26, [BI.C.gold, BI.C.white, BI.C.pink], 5, 1.2, 28, 6);
      say('Bauer Heinz: „Super gemacht!“ ' + c.icon + ' +' + bonus + ' ⭐', 4200); q.i++; q.on = false; q.p = 0; q.fed = {}; if (q.i % QUESTS.length === 0) { q.rounds++; addStars(5); say('🏆 Hofmeister! Alle Aufgaben geschafft! +5 ⭐', 4600); G.earn('farmer'); } persist();
    } else say('Bauer Heinz: „' + c.icon + ' ' + c.title + ': ' + p + ' von ' + c.need + '. Du schaffst das!“', 3600);
  };
  K.questText = () => { const q = Q(); if (!q.on) return ''; const c = cur(), p = progress(); return c.icon + ' ' + c.title + ' ' + p + '/' + c.need + (p >= c.need ? ' – zu Heinz!' : ''); };
  K.nearFarmer = () => !P.veh && Math.hypot(P.x - F.farmer.x, P.z - F.farmer.z) < 3.4;

  /* ---------- Tiere entdecken, streicheln, füttern ---------- */
  K.animalNear = function () {
    if (P.veh) return null; let best = null, bd = 2.6; for (const a of all()) { const d = Math.hypot(P.x - a.x, P.z - a.z); if (d < bd) { bd = d; best = a; } } return best;
  };
  function discover(k) {
    const b = book(); if (b[k]) return; b[k] = true; const s = SP[k]; addStars(1); persist(); A.star(); say('📖 Neu im Tierbuch: ' + s.icon + ' ' + s.name + '! ' + s.fact, 5200); if (A.speak) A.speak(s.name + '. ' + s.fact);
    if (ORDER.every(x => b[x])) { addStars(10); say('🏆 Alle Tiere entdeckt! +10 ⭐', 4200); G.earn('zoo'); } if (K.bookOpen) renderBook();
  }
  const NOFEED = ['egg', 'milk', 'jam', 'cake', 'soup', 'popcorn'];
  K.milk = function () {
    const a = K.animalNear(); if (!a || a.k !== 'cow') return false; const now = performance.now();
    if (now - (K.milkT || 0) < 12000) { K.care('stroke'); say('🥛 Die Kuh braucht kurz Zeit für neue Milch …', 2200); return true; }
    K.milkT = now; const inv = K.inv(); inv.milk = (inv.milk || 0) + 1; A.moo && A.moo(); a.hop = .6; fx.burst(a.x, 1.3, a.z, 10, [BI.C.white, BI.C.blue], 3, 1.2, 26, 3); persist(); say('🥛 Frische Milch gemolken! (' + inv.milk + ') – daraus kocht man Leckeres', 2800); G.earn('animal'); return true;
  };
  K.care = function (kind) {
    const a = K.animalNear(); if (!a) return false; const s = SP[a.k], q = Q(), inv = K.inv();
    if (A[s.snd]) A[s.snd](); a.hop = .6; const pos = a; fx.burst(pos.x, 1.4, pos.z, 12, [BI.C.pink, BI.C.red, BI.C.white], 3, 1.2, 28, -1); G.showEmoji(kind === 'feed' ? (FAVI[FAV[a.k]] || '🌾') : '🤗', { x: pos.x, y: 0, z: pos.z, up: 0 });
    G.earn('animal');
    if (kind === 'stroke') { say('🤗 ' + s.icon + ' ' + s.name + ' mag das! 💕', 2000); S().pets = (S().pets || 0) + 1; persist(); return true; }
    let used = null; const fav = FAV[a.k]; if ((inv[fav] || 0) > 0) used = fav; else { const any = Object.keys(inv).find(k => !NOFEED.includes(k) && (inv[k] || 0) > 0); if (any) used = any; }
    if (used) { inv[used]--; addStars(used === fav ? 2 : 1); say('😋 ' + s.icon + ' ' + s.name + ' frisst ' + (G.cropIcon(used) || '') + ' gern! +' + (used === fav ? 2 : 1) + ' ⭐', 2600); } else say('🌾 ' + s.icon + ' ' + s.name + ' mampft Heu. (Ernte im Garten Gemüse – das mögen sie noch lieber!)', 3200);
    q.fed = q.fed || {}; if (!q.fed[a.k]) { q.fed[a.k] = true; } persist(); return true;
  };
  const FAVI = { carrot: '🥕', corn: '🌽', pumpkin: '🎃', sunflower: '🌻', tulip: '🌷', rose: '🌹', strawberry: '🍓' };
  /* Tierbuch */
  function renderBook() {
    const g = $('bookGrid'); g.innerHTML = ''; const b = book(); $('bookCount').textContent = ORDER.filter(k => b[k]).length + ' von ' + ORDER.length + ' Tieren entdeckt';
    for (const k of ORDER) { const s = SP[k], d = document.createElement('div'), ok = b[k]; d.className = 'stk' + (ok ? ' got' : ''); d.innerHTML = '<b>' + (ok ? s.icon : '❔') + '</b><span>' + (ok ? s.name : 'Noch unbekannt') + '</span>'; if (ok) d.onclick = () => { if (A[s.snd]) A[s.snd](); if (A.speak) A.speak(s.name + '. ' + s.fact); say(s.icon + ' ' + s.fact, 4000); }; g.appendChild(d); }
  }
  K.openBook = function () { if (K.bookOpen) return; K.bookOpen = true; G.setStick(0, 0); renderBook(); $('bookPanel').hidden = false; };
  K.closeBook = function () { K.bookOpen = false; $('bookPanel').hidden = true; G.updateButtons(true); };
  $('bookClose').addEventListener('click', K.closeBook);

  /* ---------- Jede Bildschirmzeit ---------- */
  K.update = function (dt, t) {
    const px = P.veh ? P.veh.x : P.x, pz = P.veh ? P.veh.z : P.z;
    {
      for (const a of animals) {
        const far = Math.hypot(a.x - px, a.z - pz) > (save.eco ? 45 : 85); if (far !== !a.vis) { a.vis = !far; a.m.visible = !far; } if (far) continue;
        a.hop = Math.max(0, a.hop - dt); let moving = false;
        if (a.pond) { a.ang += dt * .5; a.x = a.pond.x + Math.cos(a.ang) * a.pond.r; a.z = a.pond.z + Math.sin(a.ang) * a.pond.r; a.h = -a.ang + Math.PI; moving = true; }
        else { a.wait -= dt; if (a.wait <= 0) { const dx = a.tx - a.x, dz = a.tz - a.z, d = Math.hypot(dx, dz); if (d < .5) { a.wait = 1 + Math.random() * 4; a.tx = a.pen.x0 + Math.random() * (a.pen.x1 - a.pen.x0); a.tz = a.pen.z0 + Math.random() * (a.pen.z1 - a.pen.z0); } else { a.h += BI.angDiff(a.h, Math.atan2(dx, dz)) * Math.min(1, dt * 4); a.x += Math.sin(a.h) * a.spd * dt; a.z += Math.cos(a.h) * a.spd * dt; moving = true; } } }
        a.ph += dt * (moving ? (a.k === 'rabbit' ? 10 : 6) : 1); a.m.position.set(a.x, (moving ? Math.abs(Math.sin(a.ph)) * (a.k === 'rabbit' ? .22 : .06) : 0) + (a.hop > 0 ? Math.sin(a.hop / .6 * Math.PI) * .6 : 0), a.z); a.m.rotation.y = a.h;
      }
      // Entdecken: in der Nähe stehen
      for (const a of all()) if (Math.hypot(a.x - px, a.z - pz) < 7) { if (!book()[a.k]) discover(a.k); }
      eggT -= dt; if (eggT <= 0) { eggT = 14 + Math.random() * 8; layEgg(); }
      for (let i = eggs.length - 1; i >= 0; i--) { const e = eggs[i]; e.m.rotation.y += dt; if (!P.veh && Math.hypot(P.x - e.x, P.z - e.z) < 1.3) { scene.remove(e.m); eggs.splice(i, 1); const inv = K.inv(); inv.egg = (inv.egg || 0) + 1; persist(); A.pop(); say('🥚 Ei gesammelt! (' + inv.egg + ')', 1400); fx.burst(e.x, .5, e.z, 6, [BI.C.white, BI.C.gold], 2, .6, 22, 3); } }
    }
    updateFields(dt); farmer.pose(t * 1.2, 0, K.nearFarmer());
    const q = K.questText(), bar = $('farmBar'); if (q !== K._q) { K._q = q; bar.hidden = !q; bar.textContent = q; }
  };
  K.farmerPose = farmer;
  return K;
};
