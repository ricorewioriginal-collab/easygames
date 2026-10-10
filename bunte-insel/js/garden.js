'use strict';
/* Bunte Insel – Garten hinter der eigenen Wohnung (wie bei Farmville): 6 Beete, 8 Pflanzen (Gemüse, Obst, Blumen).
   Säen → gießen (wächst schneller) → ernten (+⭐ und Vorrat). Die Pflanzen wachsen auch, wenn man nicht spielt (Zeit wird gespeichert). */
BI.createGarden = function (G) {
  const { scene, W, A, fx, P, save, persist, say, addStars } = G, $ = id => document.getElementById(id), K = { open: false, nearK: null };
  const CROPS = {
    carrot: { icon: '🥕', name: 'Karotte', t: 60, kind: 'Gemüse' }, tomato: { icon: '🍅', name: 'Tomate', t: 90, kind: 'Gemüse' }, corn: { icon: '🌽', name: 'Mais', t: 120, kind: 'Gemüse' }, pumpkin: { icon: '🎃', name: 'Kürbis', t: 150, kind: 'Gemüse' },
    strawberry: { icon: '🍓', name: 'Erdbeere', t: 80, kind: 'Obst' }, sunflower: { icon: '🌻', name: 'Sonnenblume', t: 100, kind: 'Blume' }, tulip: { icon: '🌷', name: 'Tulpe', t: 60, kind: 'Blume' }, rose: { icon: '🌹', name: 'Rose', t: 80, kind: 'Blume' }
  };
  K.CROPS = CROPS;
  const farm = () => (save.farm = save.farm || {}), cells = () => (farm().garden = farm().garden || [null, null, null, null, null, null]);
  K.inv = () => (farm().inv = farm().inv || {});
  const WATER_BOOST = 25, WATER_CD = 12000, MAXW = 3;
  const progress = c => c ? Math.min(1, ((Date.now() - c.t) / 1000 + c.w * WATER_BOOST) / CROPS[c.c].t) : 0;
  const stageOf = c => { const p = progress(c); return p >= 1 ? 3 : p >= .62 ? 2 : p >= .3 ? 1 : 0; };
  K.stage = i => { const c = cells()[i]; return c ? stageOf(c) : -1; };

  /* ---------- Pflanzen-Modelle (gleiches Material, Geometrie je Pflanze+Stufe zwischengespeichert) ---------- */
  const geoCache = {}, mat = BI.mat(), GR = 0x3fa84e, GR2 = 0x2f8f3f;
  function plantGeo(crop, st) {
    const key = crop + st; if (geoCache[key]) return geoCache[key]; const b = new BI.Batch(), j = (a, k) => ((a * 7 + k * 13) % 5 - 2) * .12;
    const mound = () => { b.sph(0, .08, 0, .5, 0x6b4a2a, 1, 1, .25, 1); };
    if (st === 0) { mound(); b.sph(-.3, .2, -.2, .06, 0xe8d9a0, 0); b.sph(.2, .2, .3, .06, 0xe8d9a0, 0); }
    else if (crop === 'carrot') { const h = [0, .18, .4, .55][st]; for (let a = 0; a < 5; a++) for (let r = 0; r < 2; r++) { const x = -.6 + a * .3, z = -.3 + r * .6 + j(a, r); b.cone(x, .05, z, .1 + h * .1, h + .1, GR, 5); if (st === 3) b.sph(x, .08, z, .12, 0xff8a1f, 0, 1, .8, 1); } }
    else if (crop === 'tomato') { b.box(0, 0, 0, .06, .5 + st * .35, .06, 0x8a5a33); b.sph(0, .5 + st * .15, 0, .25 + st * .17, GR, 1, 1, .9, 1); if (st === 3) for (let k = 0; k < 6; k++) b.sph(Math.sin(k * 1.05) * .45, .5 + (k % 3) * .22, Math.cos(k * 1.05) * .45, .13, 0xe0382b, 1); }
    else if (crop === 'corn') { for (let a = 0; a < 5; a++) { const x = -.7 + (a % 3) * .7, z = -.4 + ((a / 3) | 0) * .8, h = .5 + st * .5; b.cyl(x, 0, z, .06, .09, h, GR2, 5); b.box(x, h * .55, z, .8, .05, .1, GR, a, 0, .4); b.box(x, h * .7, z, .1, .05, .8, GR, a, 0, -.4); if (st === 3) { b.cyl(x + .12, h * .6, z, .1, .1, .5, 0xffd23f, 6); b.cone(x + .12, h * .6 + .5, z, .11, .2, 0xe8c85a, 6); } } }
    else if (crop === 'strawberry') { for (let a = 0; a < 6; a++) { const x = Math.sin(a * 1.05) * .55, z = Math.cos(a * 1.05) * .55; b.sph(x, .15, z, .22 + st * .06, GR, 1, 1, .6, 1); if (st === 2) b.sph(x, .32, z, .07, 0xffffff, 0); if (st === 3) b.sph(x + .12, .22, z, .13, 0xe0382b, 1, 1, 1.1, 1); } }
    else if (crop === 'pumpkin') { b.box(0, .05, 0, 1.6, .06, .2, GR2, .4); b.box(0, .05, 0, .2, .06, 1.4, GR2, -.2); b.sph(-.5, .3, -.3, .3 + st * .1, GR, 1, 1, .6, 1); if (st === 2) b.sph(.4, .2, .3, .22, 0x9ac248, 1, 1, .8, 1); if (st === 3) { b.sph(.35, .4, .25, .55, 0xff8a1f, 1, 1.15, .9, 1.15); b.box(.35, .85, .25, .1, .2, .1, GR2); } }
    else if (crop === 'sunflower') { const h = .5 + st * .7; b.cyl(0, 0, 0, .06, .08, h, GR2, 5); b.box(.2, h * .5, 0, .5, .05, .2, GR, 0, 0, .5); if (st === 2) b.sph(0, h + .05, 0, .2, 0xb6d84a, 1); if (st === 3) { for (let k = 0; k < 10; k++) b.box(Math.sin(k * .628) * .38, h + .1, Math.cos(k * .628) * .38 + .05, .24, .1, .1, 0xffd23f, -k * .628 + 1.57, 0, 0); b.sph(0, h + .1, .05, .26, 0x6b4423, 1, 1, .5, 1); } }
    else if (crop === 'tulip') { for (let a = 0; a < 5; a++) { const x = -.6 + a * .3, z = j(a, 1) * 2, h = .3 + st * .22; b.cyl(x, 0, z, .03, .04, h, GR, 5); b.box(x + .1, h * .4, z, .25, .04, .12, GR, 0, 0, .5); if (st === 2) b.sph(x, h + .05, z, .1, GR, 0); if (st === 3) { b.sph(x, h + .1, z, .15, [0xe0382b, 0xff8fc8, 0xffd23f, 0xb36bff, 0xff8a1f][a], 1, 1, 1.2, 1); } } }
    else if (crop === 'rose') { b.sph(0, .35 + st * .1, 0, .4 + st * .1, GR2, 1, 1, .9, 1); b.box(0, 0, 0, .05, .4, .05, 0x8a5a33); if (st === 2) for (let k = 0; k < 4; k++) b.sph(Math.sin(k * 1.57) * .4, .6, Math.cos(k * 1.57) * .4, .09, 0x9ac248, 0); if (st === 3) for (let k = 0; k < 5; k++) { b.sph(Math.sin(k * 1.26) * .45, .5 + (k % 2) * .25, Math.cos(k * 1.26) * .45, .17, [0xe0382b, 0xff5a8a][k % 2], 1); b.sph(Math.sin(k * 1.26) * .45, .52 + (k % 2) * .25, Math.cos(k * 1.26) * .45, .08, 0xb0102a, 0); } }
    return geoCache[key] = b.mesh(mat).geometry;
  }
  /* ---------- Beete anzeigen (eigener Garten; folgt dem Wohnungs-Platz) ---------- */
  const meshes = [], spark = []; let slot = -1;
  const tex = (() => { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const c = cv.getContext('2d'); c.font = '44px system-ui, "Apple Color Emoji", "Segoe UI Emoji", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('✨', 32, 36); return new THREE.CanvasTexture(cv); })();
  for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.BufferGeometry(), mat); m.visible = false; m.frustumCulled = false; scene.add(m); meshes.push(m); const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false })); sp.scale.set(1.1, 1.1, 1); sp.visible = false; scene.add(sp); spark.push(sp); }
  const garden = () => W.spots.gardens[Math.max(0, Math.min(W.spots.gardens.length - 1, G.mySlot()))];
  const shown = [];
  function refresh(force) {
    const g = garden(), s = G.mySlot(); if (s !== slot) { slot = s; force = true; }
    cells().forEach((c, i) => {
      const st = c ? stageOf(c) : -1, key = c ? c.c + st : '-'; const m = meshes[i], p = g.cells[i];
      if (force || shown[i] !== key) { shown[i] = key; if (c) { m.geometry = plantGeo(c.c, st); m.visible = true; } else m.visible = false; }
      m.position.set(p.x, .06, p.z); spark[i].position.set(p.x, 1.9, p.z); spark[i].visible = st === 3;
    });
  }
  /* ---------- Bedienung ---------- */
  K.cellNear = function () {
    if (P.veh || P.y > 1) return -1; const g = garden(); let best = -1, bd = 1.9; g.cells.forEach((p, i) => { const d = Math.hypot(P.x - p.x, P.z - p.z); if (d < bd) { bd = d; best = i; } }); return best;
  };
  K.near = function () {
    const i = K.cellNear(); if (i < 0) return null; const c = cells()[i]; if (!c) return { k: 'plant', i }; return { k: stageOf(c) === 3 ? 'harvest' : 'water', i };
  };
  K.act = function (n) {
    if (!n) return; const c = cells()[n.i];
    if (n.k === 'plant') { K.pending = n.i; openSeeds(); }
    else if (n.k === 'water') {
      const now = Date.now(); if (c.w >= MAXW) { say('💧 Genug Wasser! Jetzt heißt es warten … ' + CROPS[c.c].icon, 2200); return; } if (now - (c.n || 0) < WATER_CD) { say('💧 Gerade erst gegossen – gleich nochmal!', 1800); return; }
      c.w++; c.n = now; persist(); A.splash(); const p = garden().cells[n.i]; fx.burst(p.x, 1.2, p.z, 12, [BI.C.water, BI.C.white], 2.5, .8, 24, 3); say('💧 Gegossen! ' + CROPS[c.c].icon + ' wächst schneller (' + Math.round(progress(c) * 100) + ' %)', 2200); refresh();
    } else if (n.k === 'harvest') {
      const cr = CROPS[c.c], inv = K.inv(); inv[c.c] = (inv[c.c] || 0) + 1; cells()[n.i] = null; persist(); A.star(); const p = garden().cells[n.i]; fx.burst(p.x, 1.4, p.z, 20, [BI.C.gold, BI.C.white, BI.C.pink], 4, 1, 28, 6);
      addStars(1); say('🧺 Geerntet: ' + cr.icon + ' ' + cr.name + '! +1 ⭐ (Vorrat: ' + inv[c.c] + ')', 2800); G.earn('garden'); refresh(true);
    }
  };
  K.plant = function (crop) {
    const i = K.pending; if (i == null || !CROPS[crop] || cells()[i]) return; cells()[i] = { c: crop, t: Date.now(), w: 0, n: 0 }; K.pending = null; persist(); A.place(); const p = garden().cells[i]; fx.burst(p.x, .5, p.z, 10, [BI.C.dust, BI.C.green], 2, .7, 24, 3);
    say('🌱 Gepflanzt: ' + CROPS[crop].icon + ' ' + CROPS[crop].name + ' – gieß mich!', 2400); closeSeeds(); refresh(true);
  };
  function openSeeds() {
    K.open = true; G.setStick(0, 0); const box = $('seedGrid'); box.innerHTML = '';
    for (const k of Object.keys(CROPS)) { const c = CROPS[k], b = document.createElement('button'); b.innerHTML = '<b>' + c.icon + '</b><span>' + c.name + '</span><small>' + (c.t >= 60 ? Math.round(c.t / 60 * 10) / 10 + ' Min' : c.t + ' s') + '</small>'; b.onclick = () => K.plant(k); box.appendChild(b); }
    $('seedPanel').hidden = false;
  }
  function closeSeeds() { K.open = false; $('seedPanel').hidden = true; K.pending = null; G.updateButtons(true); }
  $('seedClose').addEventListener('click', closeSeeds); K.close = closeSeeds;
  let tick = 0;
  K.update = function (dt, t) {
    tick -= dt; if (tick <= 0) { tick = .5; refresh(false); }
    for (let i = 0; i < 6; i++) if (spark[i].visible) { spark[i].position.y = 1.9 + Math.sin(t * 3 + i) * .15; }
  };
  K.refresh = refresh; K.count = () => cells().filter(Boolean).length;
  return K;
};
