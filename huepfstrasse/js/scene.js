/* Hüpfstraße – 3D im Klötzchen-Look (Three.js r128): Reihen aus Wiese, Straße, Fluss und Gleisen, Autos, Laster, Stämme, Seerosen,
 * Züge mit Warnlicht, Münzen, fünf Gebiete mit eigenen Farben, Figuren aus Würfeln (Rico, Tiere, Robo …), Drohne, Schaukasten für den Figuren-Laden. */
(function () {
  'use strict';
  const T3 = window.THREE, HS = window.HS;
  let R, SC, CAM, SHOW, SCAM, el, low = false, sun, hemi, t = 0, view = 'world', W = null;
  const perf = { a: 1 / 60, n: 0 };
  const MAT = {}; const mat = (c, o) => { const k = c + (o ? JSON.stringify(o) : ''); return MAT[k] || (MAT[k] = new T3.MeshLambertMaterial(Object.assign({ color: c }, o || {}))); };
  const GEO = {}; const boxG = (w, h, d) => { const k = w + ',' + h + ',' + d; return GEO[k] || (GEO[k] = new T3.BoxGeometry(w, h, d)); };
  function box(p, w, h, d, c, x, y, z, sh) { const m = new T3.Mesh(boxG(w, h, d), typeof c === 'string' || typeof c === 'number' ? mat(c) : c); m.position.set(x || 0, y || 0, z || 0); if (sh !== false && !low) m.castShadow = true; p.add(m); return m; }

  /* ---------- Farben der Gebiete ---------- */
  const PAL = {
    fruehling: { g: ['#8fd96b', '#86d062'], side: '#6fb553', leaf: ['#4caf50', '#5cc25f'], trunk: '#8d5a3b', road: '#4b505e', water: '#4fc3f7', gravel: '#9c8a7c', sky: '#bfe9ff', rock: '#9aa3ad' },
    sommer: { g: ['#c7e26a', '#bdd960'], side: '#a3c04c', leaf: ['#7cb342', '#9ccc65'], trunk: '#8d5a3b', road: '#555a66', water: '#29b6f6', gravel: '#b09a7a', sky: '#ffe9a8', rock: '#b0a99c' },
    herbst: { g: ['#d8b462', '#cfaa58'], side: '#b48e45', leaf: ['#ff8a3d', '#e85d2a', '#ffc145'], trunk: '#7a4a2e', road: '#4a4a52', water: '#3fa7d6', gravel: '#a08670', sky: '#ffd2b0', rock: '#a39c94' },
    winter: { g: ['#eef6fb', '#e4eef6'], side: '#cfdde8', leaf: ['#d9f0ff', '#ffffff'], trunk: '#6d4c41', road: '#5c6270', water: '#7fb7e6', gravel: '#b8b0aa', sky: '#dfefff', rock: '#b9c3cc' },
    nacht: { g: ['#323d6e', '#2c3766'], side: '#232b52', leaf: ['#7c4dff', '#e040fb'], trunk: '#4a3a66', road: '#1f2130', water: '#3949ab', gravel: '#4a4560', sky: '#1a1638', rock: '#5a5f7a' }
  };
  const CARS = ['#ff5252', '#ffb300', '#40c4ff', '#7c4dff', '#00e676', '#ff6ec7'];

  function init(container, opt) {
    el = container; low = !!(opt && opt.low);
    R = new T3.WebGLRenderer({ antialias: !low, powerPreference: 'high-performance' });
    R.setPixelRatio(Math.min(devicePixelRatio || 1, low ? 1 : 1.5));
    if (!low) { R.shadowMap.enabled = true; R.shadowMap.type = T3.PCFSoftShadowMap; }
    el.appendChild(R.domElement);
    SC = new T3.Scene(); SC.background = new T3.Color(PAL.fruehling.sky); SC.fog = new T3.Fog(PAL.fruehling.sky, 22, 40);
    CAM = new T3.PerspectiveCamera(34, 1, .5, 80);
    hemi = new T3.HemisphereLight(0xffffff, 0x8899aa, .75); SC.add(hemi);
    sun = new T3.DirectionalLight(0xffffff, .75); sun.position.set(-6, 14, 6);
    if (!low) { sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); const c = sun.shadow.camera; c.left = -13; c.right = 13; c.top = 13; c.bottom = -13; c.near = 1; c.far = 40; sun.shadow.bias = -.002; }
    SC.add(sun); SC.add(sun.target);
    // Schaukasten (Figuren-Laden)
    SHOW = new T3.Scene(); SHOW.background = new T3.Color('#ffd86b'); SCAM = new T3.PerspectiveCamera(30, 1, .1, 40); 
    SHOW.add(new T3.HemisphereLight(0xffffff, 0xaa8866, .85)); const sl = new T3.DirectionalLight(0xffffff, .6); sl.position.set(-2, 4, 3); SHOW.add(sl);
    const pod = new T3.Mesh(new T3.CylinderGeometry(1.1, 1.2, .3, 6), mat('#ff7f50')); pod.position.y = -.15; SHOW.add(pod);
    addEventListener('resize', resize); resize();
  }
  function resize() { if (!R) return; const w = el.clientWidth || innerWidth, h = el.clientHeight || innerHeight; R.setSize(w, h, false); CAM.aspect = w / h; CAM.updateProjectionMatrix(); SCAM.aspect = w / h; SCAM.updateProjectionMatrix(); const por = w / h < .8; SCAM.position.set(0, 2.1, por ? 8.2 : 6); SCAM.lookAt(0, por ? .45 : .75, 0); }

  /* ---------- Figuren aus Würfeln ---------- */
  function figure(id) {
    const g = new T3.Group(), b = new T3.Group(); g.add(b); g.userData.body = b;
    const legs = (c, sh) => { box(b, .13, .18, .15, c, -.1, .09, 0); box(b, .13, .18, .15, c, .1, .09, 0); if (sh) { box(b, .15, .07, .2, sh, -.1, .035, .025); box(b, .15, .07, .2, sh, .1, .035, .025); } };
    const arms = (c, hand, y) => { y = y || .38; box(b, .1, .26, .12, c, -.27, y, 0); box(b, .1, .26, .12, c, .27, y, 0); if (hand) { box(b, .1, .08, .12, hand, -.27, y - .16, 0); box(b, .1, .08, .12, hand, .27, y - .16, 0); } };
    const eyes = (y, z, c, s) => { s = s || .06; box(b, s, s, .02, c || '#1b1b1b', -.08, y, z, false); box(b, s, s, .02, c || '#1b1b1b', .08, y, z, false); };
    if (id === 'rico') {
      legs('#2c3554', '#f4f4f8'); box(b, .44, .36, .28, '#8645e0', 0, .36, 0); arms('#8645e0', '#f2c6a4');
      box(b, .2, .04, .01, '#ffffff', 0, .4, .145, false);                     // Schallwellen-Aufdruck
      box(b, .5, .06, .06, '#17141c', 0, .55, .08, false);                      // Kopfhörer um den Hals
      box(b, .38, .36, .34, '#f2c6a4', 0, .76, 0);                              // Kopf
      box(b, .4, .1, .36, '#4b2e1a', 0, .97, -.01);                             // Haare
      for (const [x, z, r] of [[-.12, .1, .5], [0, .12, -.3], [.13, .08, -.6], [-.05, -.05, .3], [.1, -.08, -.4]]) { const s = box(b, .1, .16, .1, '#4b2e1a', x, 1.04, z); s.rotation.set(r * .6, 0, r); }
      box(b, .4, .14, .06, '#5e3b22', 0, .63, .16);                             // Vollbart
      box(b, .05, .2, .3, '#5e3b22', -.19, .69, .02); box(b, .05, .2, .3, '#5e3b22', .19, .69, .02);
      box(b, .2, .06, .06, '#5e3b22', 0, .56, .15);
      box(b, .2, .04, .03, '#5e3b22', 0, .7, .185, false);                       // Schnurrbart
      box(b, .07, .08, .06, '#e0a985', 0, .76, .19, false);                      // Nase
      const ring = new T3.Mesh(new T3.TorusGeometry(.03, .009, 5, 12), mat('#e8ebf6', { emissive: '#555566' })); ring.position.set(0, .715, .215); b.add(ring);
      eyes(.83, .175, '#3a2210'); box(b, .1, .025, .02, '#4b2e1a', -.08, .9, .175, false); box(b, .1, .025, .02, '#4b2e1a', .08, .9, .175, false);
      box(b, .04, .06, .06, '#17141c', .2, .7, 0, false); box(b, .015, .06, .015, '#17141c', .21, .63, 0, false); box(b, .04, .015, .015, '#17141c', .21, .645, 0, false); // Ohr-Plug + Kreuz
      box(b, .07, .16, .07, '#26232b', -.27, .2, .07); box(b, .09, .07, .09, '#6d6a78', -.27, .3, .07); // Mikro in der Hand
    } else if (id === 'pingu') {
      box(b, .1, .06, .18, '#ff9800', -.1, .03, .04); box(b, .1, .06, .18, '#ff9800', .1, .03, .04);
      box(b, .46, .6, .38, '#222831', 0, .36, 0); box(b, .32, .44, .04, '#ffffff', 0, .33, .19, false);
      box(b, .06, .3, .2, '#222831', -.26, .38, 0); box(b, .06, .3, .2, '#222831', .26, .38, 0);
      box(b, .4, .3, .34, '#222831', 0, .8, 0); box(b, .3, .18, .02, '#ffffff', 0, .78, .17, false); eyes(.82, .185); box(b, .12, .06, .12, '#ff9800', 0, .74, .23);
    } else if (id === 'fuchs') {
      legs('#3e2723'); box(b, .4, .34, .44, '#ff7a1a', 0, .34, 0); box(b, .26, .2, .04, '#ffffff', 0, .32, .23, false);
      box(b, .38, .32, .32, '#ff7a1a', 0, .7, .06); box(b, .2, .12, .14, '#ffffff', 0, .63, .25); box(b, .06, .05, .04, '#1b1b1b', 0, .67, .32, false);
      box(b, .1, .14, .06, '#ff7a1a', -.12, .92, .04); box(b, .1, .14, .06, '#ff7a1a', .12, .92, .04); eyes(.76, .225);
      const tl = box(b, .18, .16, .36, '#ff7a1a', 0, .36, -.36); tl.rotation.x = .5; box(b, .18, .14, .1, '#ffffff', 0, .46, -.53);
    } else if (id === 'robo') {
      legs('#78909c', '#455a64'); box(b, .46, .38, .32, '#b0bec5', 0, .38, 0); box(b, .2, .1, .02, '#00e5ff', 0, .42, .17, false); arms('#90a4ae', '#455a64');
      box(b, .4, .32, .34, '#cfd8dc', 0, .78, 0); box(b, .3, .08, .02, '#00e5ff', 0, .8, .175, false); box(b, .03, .16, .03, '#455a64', 0, 1.01, 0); box(b, .07, .07, .07, '#ff1744', 0, 1.1, 0, false);
    } else if (id === 'panda') {
      legs('#1b1b1b'); box(b, .46, .4, .36, '#fafafa', 0, .38, 0); arms('#1b1b1b');
      box(b, .42, .36, .36, '#fafafa', 0, .8, 0); box(b, .12, .12, .06, '#1b1b1b', -.17, 1.0, 0); box(b, .12, .12, .06, '#1b1b1b', .17, 1.0, 0);
      box(b, .12, .1, .02, '#1b1b1b', -.09, .82, .18, false); box(b, .12, .1, .02, '#1b1b1b', .09, .82, .18, false); eyes(.83, .19, '#ffffff', .03); box(b, .07, .05, .03, '#1b1b1b', 0, .73, .19, false);
    } else if (id === 'astro') {
      legs('#eceff1', '#90a4ae'); box(b, .44, .4, .3, '#f5f5f5', 0, .38, 0); box(b, .36, .4, .14, '#b0bec5', 0, .42, -.2); arms('#f5f5f5', '#90a4ae');
      box(b, .1, .1, .02, '#ff5252', -.1, .44, .155, false); box(b, .1, .1, .02, '#40c4ff', .08, .44, .155, false);
      box(b, .44, .4, .4, '#ffffff', 0, .8, 0); box(b, .34, .22, .03, '#3949ab', 0, .8, .2, false); box(b, .1, .05, .03, '#9fa8da', -.08, .86, .215, false);
    } else if (id === 'katze') {
      legs('#ffb74d'); box(b, .42, .34, .4, '#ffb74d', 0, .34, 0); box(b, .38, .32, .32, '#ffb74d', 0, .72, .04);
      box(b, .1, .12, .06, '#ffb74d', -.13, .93, .02); box(b, .1, .12, .06, '#ffb74d', .13, .93, .02); box(b, .06, .06, .04, '#ff8a80', 0, .68, .21, false); eyes(.77, .205, '#33691e');
      for (const s of [-1, 1]) for (const y of [.66, .7]) box(b, .14, .012, .012, '#ffffff', s * .2, y, .2, false);
      const tl = box(b, .08, .36, .08, '#ff9800', 0, .55, -.26); tl.rotation.x = -.4; for (const z of [-.05, .1]) box(b, .43, .04, .3, '#ff9800', 0, .34 + z, .02, false);
    } else if (id === 'dino') {
      legs('#43a047'); box(b, .42, .44, .48, '#66bb6a', 0, .4, 0); box(b, .26, .24, .04, '#c5e1a5', 0, .38, .25, false);
      box(b, .38, .3, .44, '#66bb6a', 0, .82, .1); eyes(.88, .325); box(b, .3, .04, .02, '#1b5e20', 0, .74, .325, false);
      box(b, .06, .1, .1, '#66bb6a', -.22, .48, .18); box(b, .06, .1, .1, '#66bb6a', .22, .48, .18);
      const tl = box(b, .22, .2, .4, '#66bb6a', 0, .3, -.38); tl.rotation.x = .3; for (const [y, z] of [[.64, -.1], [.72, .08], [.98, .14], [.5, -.3]]) box(b, .06, .1, .1, '#ffca28', 0, y, z);
    } else if (id === 'einhorn') {
      legs('#fafafa', '#b39ddb'); box(b, .4, .36, .5, '#fafafa', 0, .36, 0); box(b, .36, .36, .32, '#fafafa', 0, .76, .12); box(b, .2, .14, .1, '#f8bbd0', 0, .66, .3);
      eyes(.82, .285); box(b, .06, .22, .06, '#ffd54f', 0, 1.02, .2).rotation.x = .3;
      for (const [y, c] of [[.9, '#ff80ab'], [.76, '#b388ff'], [.62, '#80d8ff']]) box(b, .1, .16, .18, c, 0, y, -.08);
      const tl = box(b, .1, .3, .1, '#ff80ab', 0, .4, -.3); tl.rotation.x = .5;
    }
    g.traverse(o => { if (o.isMesh && !low) o.castShadow = true; });
    return g;
  }

  /* ---------- Welt-Reihen ---------- */
  const built = new Map(); let player = null, figId = 'rico', drone = null, splash = [];
  function setWorld(w, fid) {
    for (const [, g] of built) SC.remove(g); built.clear(); W = w;
    if (player) SC.remove(player); figId = fid || figId; player = figure(figId); SC.add(player);
    if (drone) drone.visible = false; biomeNow = null; camZ = -(W.cam + 2.5);
  }
  function buildRow(Rw) {
    const g = new T3.Group(), P = PAL[Rw.biome] || PAL.fruehling, z = Rw.z; g.position.z = -z;
    const sh = m => { if (!low) m.receiveShadow = true; return m; };
    if (Rw.type === 'grass') {
      sh(box(g, 9, .4, 1, P.g[z & 1], 0, -.2, 0, false)); sh(box(g, 7, .4, 1, P.side, -8, -.2, 0, false)); sh(box(g, 7, .4, 1, P.side, 8, -.2, 0, false));
      const rnd = HS.mulberry(HS.hash('deko' + z));
      for (const x of Rw.trees) tree(g, x, P, rnd);
      for (let x = -10; x <= 10; x++) if (Math.abs(x) > 4 && rnd() < .55) tree(g, x, P, rnd);
      g.userData.coins = {};
      for (const x of Rw.coins) g.userData.coins[x] = coin(g, x);
    } else if (Rw.type === 'road') {
      sh(box(g, 22, .3, 1, P.road, 0, -.17, 0, false));
      for (let x = -10; x <= 10; x += 2) box(g, .9, .02, .08, '#f5f5f5', x, -.01, -.5, false);
      box(g, 22, .02, .04, '#ffffff', 0, -.015, .48, false);
      for (const it of Rw.items) { it._m = car(it); g.add(it._m); }
      g.userData.coins = {}; for (const x of Rw.coins) g.userData.coins[x] = coin(g, x);
    } else if (Rw.type === 'river') {
      box(g, 22, .2, 1, P.water, 0, -.4, 0, false);
      if (Rw.pads) for (const x of Rw.pads) { const p = new T3.Mesh(new T3.CylinderGeometry(.42, .42, .06, 10), mat('#2e7d32')); p.position.set(x, -.27, 0); sh(p); g.add(p); }
      else for (const it of Rw.items) { const m = new T3.Group(); box(m, it.len, .3, .7, '#8d5a3b', 0, -.2, 0); box(m, .06, .26, .62, '#c49a6c', it.len / 2, -.2, 0, false); box(m, .06, .26, .62, '#c49a6c', -it.len / 2, -.2, 0, false); m.traverse(o => { if (o.isMesh) sh(o); }); it._m = m; g.add(m); }
    } else if (Rw.type === 'rail') {
      sh(box(g, 22, .3, 1, P.gravel, 0, -.17, 0, false));
      for (let x = -10.5; x <= 10.5; x += 1.5) box(g, .3, .06, .9, '#6d4c41', x, 0, 0, false);
      box(g, 22, .08, .08, '#b0bec5', 0, .06, -.28, false); box(g, 22, .08, .08, '#b0bec5', 0, .06, .28, false);
      box(g, .1, 1.1, .1, '#455a64', 4.9, .55, .45); const lamp = box(g, .2, .2, .16, mat('#550000').clone(), 4.9, 1.1, .45, false); g.userData.lamp = lamp;
      const tr = new T3.Group(); const L = Rw.train.len;
      for (let k = 0; k < 3; k++) { const x = -L / 2 + 1.5 + k * 3; box(tr, 2.8, 1.1, .9, k ? '#eceff1' : '#e53935', x, .65, 0); box(tr, 2.8, .2, .92, '#1e88e5', x, .55, 0, false); for (const wx of [-.8, 0, .8]) box(tr, .5, .25, .3, '#ffd54f', x + wx, .85, .46, false); }
      tr.visible = false; g.add(tr); g.userData.train = tr;
    }
    SC.add(g); built.set(z, g); Rw._g = g;
  }
  function tree(g, x, P, rnd) {
    if (rnd() < .25) { box(g, .7, .45, .7, P.rock, x, .22, 0); return; }
    box(g, .26, .4, .26, P.trunk, x, .2, 0); const h = .5 + Math.floor(rnd() * 3) * .3, c = P.leaf[Math.floor(rnd() * P.leaf.length)];
    box(g, .78, h, .78, c, x, .4 + h / 2, 0);
  }
  function coin(g, x) { const m = new T3.Mesh(new T3.CylinderGeometry(.24, .24, .07, 12), mat('#ffca28', { emissive: '#8a5a00' })); m.rotation.z = Math.PI / 2; m.position.set(x, .45, 0); g.add(m); return m; }
  function car(it) {
    const m = new T3.Group(), c = CARS[it.c % CARS.length], L = it.len;
    if (it.kind === 'truck') { box(m, L - .7, .7, .76, '#eceff1', -.35, .5, 0); box(m, .7, .55, .72, c, L / 2 - .35, .42, 0); box(m, .05, .2, .5, '#90caf9', L / 2 - .02, .55, 0, false); }
    else { box(m, L, .34, .72, c, 0, .32, 0); box(m, L * .55, .26, .62, c, -.05, .62, 0); box(m, L * .56, .16, .64, '#90caf9', -.05, .6, 0, false); }
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(m, .24, .24, .1, '#212121', sx * (L / 2 - .3), .13, sz * .37, false);
    return m;
  }

  /* ---------- Spieler, Kamera, Effekte ---------- */
  const FACE = { up: Math.PI, down: 0, left: -Math.PI / 2, right: Math.PI / 2 };
  let camZ = 0, camX = 0, shake = 0, biomeNow = null;
  function setBiome(id) {
    if (biomeNow === id) return; biomeNow = id; const P = PAL[id];
    SC.background.set(P.sky); SC.fog.color.set(P.sky);
    const night = id === 'nacht'; hemi.intensity = night ? .45 : .75; sun.intensity = night ? .35 : .75;
  }
  function onEvent(e) { if (e.k === 'die' && (e.how === 'car' || e.how === 'train')) shake = .35; if (e.k === 'die' && e.how === 'water') splashAt(); }
  function splashAt() { const P = W.P; for (let i = 0; i < 10; i++) { const m = box(SC, .12, .12, .12, '#e1f5fe', P.x, -.2, -P.z, false); m.userData.v = new T3.Vector3((Math.random() - .5) * 3, 3 + Math.random() * 2, (Math.random() - .5) * 3); m.userData.l = .8; splash.push(m); } }
  function update(dt) {
    if (!R) return; t += dt;
    if (dt > 0) { perf.a += (dt - perf.a) * .05; perf.n++; if (perf.n > 90 && perf.a > 1 / 38 && R.getPixelRatio() > .75) { R.setPixelRatio(Math.max(.75, R.getPixelRatio() - .25)); resize(); perf.n = 0; } }
    if (view === 'show') { if (SHOW.userData.fig) SHOW.userData.fig.rotation.y = Math.sin(t * .8) * .7 + .3; R.render(SHOW, SCAM); return; }
    if (!W) return;
    // Reihen auf- und abbauen
    for (const [z, g] of built) if (!W.rows.has(z)) { SC.remove(g); built.delete(z); }
    for (const [z, Rw] of W.rows) {
      if (!built.has(z)) buildRow(Rw);
      if (Rw.items.length && !Rw.pads) for (const it of Rw.items) if (it._m) it._m.position.x = it.x;
      const g = Rw._g;
      if (g.userData.coins) for (const x in g.userData.coins) { const m = g.userData.coins[x]; if (!Rw.coins.has(+x)) { g.remove(m); delete g.userData.coins[x]; } else m.rotation.x = t * 3; }
      if (Rw.train) { const T = Rw.train, tr = g.userData.train; tr.visible = T.active; tr.position.x = T.x; g.userData.lamp.material.color.set(T.warn && Math.sin(t * 18) > 0 || T.active ? '#ff1744' : '#550000'); }
    }
    setBiome(HS.biomeOf(W.P.z).id);
    // Spieler
    const P = W.P, b = player.userData.body;
    let x = P.x, y = 0, z = P.z, sq = 1;
    if (P.hop) { const h = P.hop, k = Math.min(1, h.t); x = h.fx + (h.tx - h.fx) * k; z = h.fz + (h.tz - h.fz) * k; y = Math.sin(k * Math.PI) * .45; sq = 1 + Math.sin(k * Math.PI) * .12; }
    const rw = HS.row(W, Math.round(z)); if (!P.hop && rw.type === 'river' && rw.pads) y = -.22; else if (!P.hop && rw.type === 'river') y = -.05;
    player.position.set(x, y, -z); b.scale.set(1 / Math.sqrt(sq), sq, 1 / Math.sqrt(sq));
    if (!P.hop && !P.dead) { const br = 1 + Math.sin(t * 5) * .02; b.scale.y *= br; }
    const fr = FACE[P.face] != null ? FACE[P.face] : Math.PI; let dr = fr - player.rotation.y; dr = Math.atan2(Math.sin(dr), Math.cos(dr)); player.rotation.y += dr * Math.min(1, dt * 18);
    if (P.dead) deadAnim(P, b);
    else if (drone) drone.visible = false;
    // Spritzer
    for (let i = splash.length - 1; i >= 0; i--) { const m = splash[i]; m.userData.l -= dt; m.userData.v.y -= 12 * dt; m.position.addScaledVector(m.userData.v, dt); if (m.userData.l <= 0) { SC.remove(m); splash.splice(i, 1); } }
    // Kamera
    const tz = -(W.cam + 2.6), tx = Math.max(-1.5, Math.min(1.5, x * .35));
    camZ += (tz - camZ) * Math.min(1, dt * 6); camX += (tx - camX) * Math.min(1, dt * 4);
    const asp = CAM.aspect, th = Math.tan(CAM.fov * Math.PI / 360), dist = Math.max(12, Math.min(26, 5.6 / (th * asp)));
    shake = Math.max(0, shake - dt); const sk = shake * .5;
    CAM.position.set(camX + dist * .22 + (Math.random() - .5) * sk, dist * .8, camZ + dist * .56 + (Math.random() - .5) * sk); CAM.lookAt(camX, 0, camZ);
    sun.position.set(camX - 6, 14, camZ + 6); sun.target.position.set(camX, 0, camZ); sun.target.updateMatrixWorld();
    R.render(SC, CAM);
  }
  function deadAnim(P, b) {
    const d = P.dead, k = d.t;
    if (d.how === 'car' || d.how === 'train') { b.scale.set(1.35, .14, 1.2); player.position.x = d.x; player.position.y = .02; if (d.how === 'train') { player.position.x = d.x + d.dir * Math.min(20, k * 22); player.position.y = Math.min(2, k * 4); player.rotation.z += .3; } }
    else if (d.how === 'water' || d.how === 'drift') { player.position.y = -Math.min(1.2, k * 1.4); player.position.x = d.x; }
    else if (d.how === 'drone') {
      if (!drone) { drone = new T3.Group(); box(drone, .9, .2, .9, '#37474f', 0, 0, 0); for (const [x, z] of [[-.55, -.55], [.55, -.55], [-.55, .55], [.55, .55]]) { box(drone, .5, .04, .1, '#90a4ae', x, .14, z, false); } box(drone, .16, .16, .16, '#ff1744', 0, -.12, .4, false); SC.add(drone); }
      drone.visible = true; const dy = k < .5 ? 6 - k * 10 : 1.1 + (k - .5) * 9; drone.position.set(d.x, dy, -P.z); drone.children.forEach((c, i) => { if (i > 0 && i < 5) c.rotation.y = t * 40; });
      if (k > .5) { player.position.set(d.x, dy - .9, -P.z); }
    }
  }
  function showcase(fid) { if (SHOW.userData.fig) SHOW.remove(SHOW.userData.fig); const f = figure(fid); f.scale.setScalar(1.55); SHOW.add(f); SHOW.userData.fig = f; }
  function setView(v) { view = v; }

  function rebuild(z) { const g = built.get(z); if (g) { SC.remove(g); built.delete(z); } }
  window.HSScene = { rebuild, init, setWorld, update, onEvent, showcase, setView, resize, figure };
})();
