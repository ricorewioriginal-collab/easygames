'use strict';
/* Bunte Insel – Spielschleife, Steuerung, Kamera, Missionen, Figuren, Tiere, Verkehr, Tag/Nacht */
(function () {
  const $ = id => document.getElementById(id), K = BI.WORLD, A = BI.audio, clamp = BI.clamp, TAU = BI.TAU;
  const save = Object.assign({ stars: 0, shirt: 0, hat: 0, pname: '', cu: { skin: 0, hair: 1, style: 1, pants: 0 }, sound: true, music: true, mpIcon: '🐶', night: false, intro: false, hero: 'jannis', pet: 'blitz', owned: [], equip: { hat: 'none', glasses: false, pack: false, teddy: false } }, BI.store.get('save', {}));
  let saveOk = true; const persist = () => { save.ts = Date.now(); saveOk = BI.store.set('save', save); };
  const coarse = matchMedia('(pointer:coarse)').matches || 'ontouchstart' in window;
  const isTouch = () => document.body.classList.contains('touch');
  A.setMuted(!save.sound); A.setMusic(save.music);

  /* ---------- Renderer, Szene, Himmel ---------- */
  const canvas = $('cv'), dpr = window.devicePixelRatio || 1;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: dpr < 1.6, powerPreference: 'high-performance' }); }
  catch (e) { $('loading').innerHTML = '<b>Dein Gerät kann die 3D-Welt leider nicht zeigen.</b><br>Bitte probiere einen anderen Browser aus.'; return; }
  let quality = coarse && dpr > 2 ? 1 : 0;
  const QUAL = [Math.min(dpr, 2), Math.min(dpr, 1.5), 1, .75];
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(60, 1, .8, 800);
  const hemi = new THREE.HemisphereLight(0xdff0ff, 0x8fb06a, .85), sun = new THREE.DirectionalLight(0xfff2d8, .75);
  sun.position.set(60, 100, 40); scene.add(hemi, sun, sun.target);
  scene.fog = new THREE.Fog(0xcfe9ff, 130, 520);
  const skyGeo = new THREE.SphereGeometry(700, 20, 10), skyCol = new Float32Array(skyGeo.attributes.position.count * 3);
  skyGeo.setAttribute('color', new THREE.BufferAttribute(skyCol, 3));
  const sky = new THREE.Mesh(skyGeo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false })); sky.renderOrder = -1; scene.add(sky);
  const starPts = (() => { const n = 160, p = new Float32Array(n * 3), r = BI.rng(5); for (let i = 0; i < n; i++) { const a = r() * TAU, e = .15 + r() * 1.2, d = 650; p[i * 3] = Math.sin(a) * Math.cos(e) * d; p[i * 3 + 1] = Math.sin(e) * d; p[i * 3 + 2] = Math.cos(a) * Math.cos(e) * d; } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); const m = new THREE.PointsMaterial({ color: 0xffffff, size: 2.4, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false }); const pts = new THREE.Points(g, m); scene.add(pts); return pts; })();
  const DAY = { top: new THREE.Color(0x4aa8ff), hor: new THREE.Color(0xcfe9ff), fog: new THREE.Color(0xcfe9ff), hs: new THREE.Color(0xdff0ff), hg: new THREE.Color(0x8fb06a), sun: new THREE.Color(0xfff2d8), wat: new THREE.Color(0x3aa8e8) };
  const NIGHT = { top: new THREE.Color(0x070d2a), hor: new THREE.Color(0x2a3a6a), fog: new THREE.Color(0x1a2548), hs: new THREE.Color(0x7f93d8), hg: new THREE.Color(0x3a4468), sun: new THREE.Color(0xa9bbff), wat: new THREE.Color(0x14407a) };
  const tmpC = new THREE.Color(), tmpD = new THREE.Color();
  let night = save.night ? 1 : 0, nightT = night;
  let wxK = 0; const GREY = new THREE.Color(0x9aa6b4);
  /* Wetter-Dämpfung: Himmel, Nebel und Licht werden grauer (billig, ohne den Himmel neu zu färben) */
  function applyWx() {
    sky.material.color.setScalar(1 - .38 * wxK); mix2(DAY.fog, NIGHT.fog, scene.fog.color); scene.fog.color.lerp(tmpC.copy(GREY).multiplyScalar(1 - night * .8), wxK * .6); scene.background = scene.fog.color;
    hemi.intensity = BI.lerp(.85, .62, night) * (1 - .22 * wxK); sun.intensity = BI.lerp(.75, .4, night) * (1 - .6 * wxK);
  }
  const mix2 = (a, b, out) => out.copy(a).lerp(b, night);
  function applyNight() {
    const n = night, mix = (a, b, out) => out.copy(a).lerp(b, n);
    const pos = skyGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) { const y = clamp(pos.getY(i) / 700, 0, 1), k = Math.pow(y, .6); tmpC.copy(DAY.hor).lerp(NIGHT.hor, n); tmpD.copy(DAY.top).lerp(NIGHT.top, n); tmpC.lerp(tmpD, k); skyCol[i * 3] = tmpC.r; skyCol[i * 3 + 1] = tmpC.g; skyCol[i * 3 + 2] = tmpC.b; }
    skyGeo.attributes.color.needsUpdate = true;
    mix(DAY.fog, NIGHT.fog, scene.fog.color); scene.background = scene.fog.color;
    mix(DAY.hs, NIGHT.hs, hemi.color); mix(DAY.hg, NIGHT.hg, hemi.groundColor); hemi.intensity = BI.lerp(.85, .62, n);
    mix(DAY.sun, NIGHT.sun, sun.color); sun.intensity = BI.lerp(.75, .4, n);
    if (world) { world.water.material.color.copy(DAY.wat).lerp(NIGHT.wat, n); world.setNight(n); }
    applyWx(); starPts.material.opacity = n; BI.headMat.color.setHex(0xfff6d0).lerp(tmpC.setHex(0xffff9a), n); BI.tailMat.color.setHex(0xa02020).lerp(tmpC.setHex(0xff2a2a), n);
  }

  /* ---------- Welt, Effekte ---------- */
  let world = null; world = BI.buildWorld(scene);
  const W = world, fx = new BI.Fx(scene, 520);
  applyNight();
  const miniC = $('mini'), miniS = 150, miniBase = document.createElement('canvas'); miniBase.width = miniBase.height = miniS * 2; world.minimap(miniBase.getContext('2d'), miniS * 2);
  miniC.width = miniC.height = miniS * 2;

  /* ---------- Fahrzeuge ---------- */
  const vehicles = [];
  function addVeh(type, x, z, h, opts) {
    const v = new BI.Vehicle(type, x, z, h, opts); const p = {}; W.resolve(x, z, v.r + .3, p); v.setPose(p.x, p.z, h); v.visual(0, 0); scene.add(v.root); vehicles.push(v); return v;
  }
  for (const s of W.vehicleSpawns) addVeh(s.type, s.x, s.z, s.h);
  addVeh('car', 9, -24, Math.PI, { color: 0xe8453c }); addVeh('car', -9, 24, 0, { color: 0x3f8cff });
  addVeh('ice', -9, -36, Math.PI); addVeh('bus', 31, 9, Math.PI / 2); addVeh('bike', 14, -9, .5, { color: 0xff8a1f }); addVeh('bike', 150, 14, 1.2, { color: 0xff5a9a }); addVeh('bicycle', 7, 36, .4, { color: 0x3f8cff }); addVeh('scooter', -7, 36, -.4, { color: 0xff5a9a }); addVeh('bicycle', 80, 36, 2.2, { color: 0x4cd07d });
  addVeh('car', 150, -12, 1.6, { color: 0x4cd07d });
  const boatV = addVeh('boat', W.dock.x, W.dock.z, 0); boatV.setPose(W.dock.x, W.dock.z, 0);
  const traffic = [];
  for (let i = 0; i < 9; i++) {
    const dir = i % 2 ? -1 : 1, lane = dir > 0 ? K.RB + 2.2 : K.RB - 2.2, v = addVeh('car', 0, lane, 0, { color: BI.PAINT[(i * 3 + 1) % BI.PAINT.length], ai: true });
    traffic.push({ v, a: i / 9 * TAU * 1 + .4 + (i % 2) * .35, dir, lane, sp: 8 + (i % 3) * 1.5 }); v.ai = true;
  }
  /* mehr Fahrzeuge: am Straßenrand geparkt (nicht auf der Ringstraße, damit der Verkehr nicht blockiert) */
  for (let i = 0, made = 0; i < 160 && made < 14; i++) {
    const dir = (Math.random() * 4) | 0, d = 24 + Math.random() * 120, off = (Math.random() < .5 ? -1 : 1) * (6.4 + Math.random() * 1.2), x = [d, -d, off, off][dir], z = [off, off, d, -d][dir], r = Math.hypot(x, z);
    if (Math.abs(r - K.RA) < 8 || Math.abs(r - K.RB) < 8 || W.railSdf(x, z) < 9 || !W.free(x, z, 2.6)) continue;
    const type = ['car', 'car', 'car', 'car', 'bike', 'bike', 'bus', 'ice'][made % 8]; addVeh(type, x, z, dir < 2 ? (Math.random() < .5 ? Math.PI / 2 : -Math.PI / 2) : (Math.random() < .5 ? 0 : Math.PI), { color: BI.PAINT[(Math.random() * BI.PAINT.length) | 0] }); made++;
  }
  const train = new BI.Train(scene, W);
  const trainVeh = { isTrain: true, spec: { name: 'Zug', icon: '🚂', max: 24, kind: 'train', horn: 'train', cam: 17 }, get x() { return train.cars[0].x; }, get z() { return train.cars[0].z; }, get h() { return train.cars[0].h; }, get v() { return train.v; }, siren: false, r: 3 };

  /* ---------- Spielfigur, Menschen, Tiere ---------- */
  let char = null;
  const heroName = () => (save.pname || '').trim() || (save.hero === 'custom' ? 'Held' : BI.heroById(save.hero).name);
  function buildChar() {
    if (char) { if (char.group.parent) char.group.parent.remove(char.group); }
    char = BI.makeChar(charOpts({ hero: save.hero, shirt: save.shirt, hat: save.hat, eq: save.equip, cu: save.cu }, heroName())); scene.add(char.group); return char;
  }
  /* Aussehen aus Held + Schrank (gekaufte Sachen gewinnen gegenüber dem Helden-Kostüm) */
  function charOpts(l, name) {
    const E = l.eq || {}, cu = l.cu || {}, H = BI.heroById(l.hero), po = H.o || {}, ac = k => !!E[k] || !!po[k], accs = { glasses: ac('glasses'), pack: ac('pack'), teddy: ac('teddy'), patch: ac('patch'), cape: ac('cape'), wings: ac('wings') };
    if (H.id === 'custom') return Object.assign({ shirt: BI.SHIRTS[l.shirt | 0] || BI.SHIRTS[0], pants: BI.PANTS[cu.pants | 0] || 0x3d4a7a, skin: BI.SKINS[cu.skin | 0], hair: BI.HAIRS[cu.hair | 0], style: BI.STYLES[cu.style | 0] === 'none' ? undefined : BI.STYLES[cu.style | 0], hat: E.hat && E.hat !== 'none' ? E.hat : BI.HATS[l.hat | 0] || 'none', name }, accs);
    return Object.assign({}, po, { hat: E.hat && E.hat !== 'none' ? E.hat : po.hat || 'none', name }, accs);
  }
  const P = { x: 0, z: 26, y: 0, vy: 0, h: Math.PI, phase: 0, wave: 0, veh: null, speed: 0, step: 0 };
  buildChar(); char.group.position.set(P.x, 0, P.z);

  const npcs = [], SK = [0xffd2a8, 0xe0a979, 0x8d5a3b, 0xf3c9a0], HR = [0x6b4423, 0x222222, 0xd9a441, 0xa14a2b, 0xf3d98a], PN = [0x3d4a7a, 0x5a3d2b, 0x2d6a4f, 0x7a3d6a], rnd = a => a[(Math.random() * a.length) | 0];
  function mkNpc(x, z, o) {
    o = o || {}; const kid = !!o.kid, c = BI.makeChar({ shirt: BI.SHIRTS[(Math.random() * 6) | 0], pants: rnd(PN), hair: rnd(HR), skin: o.skin || rnd(SK), hat: !kid && Math.random() < .15 ? 'cap' : kid && Math.random() < .3 ? 'party' : 'none', scale: kid ? .58 + Math.random() * .14 : .9 + Math.random() * .1 });
    const q = W.resolve(x, z, .6, {}), n = { c, x: q.x, z: q.z, h: Math.random() * TAU, tx: q.x, tz: q.z, wait: Math.random() * 3, phase: Math.random() * 6, hop: 0, spd: kid ? 2.4 + Math.random() * .9 : 1.4 + Math.random() * .9, kid, lead: o.lead || null, fd: o.fd || 0, fs: o.fs || 0 };
    { const pool = kid ? BI.TALK.kids : BI.TALK.adults, L = kid ? (mkNpc.kc = (mkNpc.kc || 0) + 1) : (mkNpc.ac = (mkNpc.ac || 0) + 1), pe = pool[(L - 1) % pool.length]; n.p = { name: kid && L > pool.length ? pe[0] + ' ' + String.fromCharCode(64 + Math.ceil(L / pool.length)) + '.' : kid ? pe[0] : L > pool.length ? pe[0].split(' ')[1] + ' ' + String.fromCharCode(64 + Math.ceil(L / pool.length)) + '.' : pe[0], lines: pe[1], i: 0 }; }
    scene.add(c.group); npcs.push(n); return n;
  }
  const spot = () => W.randRoadPoint(Math.random, 0, 0, 0);
  for (let i = 0; i < 14; i++) { const p = spot(); mkNpc(p.x + (Math.abs(p.x) < 5 ? 6.5 : 0), p.z + (Math.abs(p.z) < 5 ? 6.5 : 0)); }
  for (let f = 0; f < 9; f++) { /* Familien: Eltern vorn, Kinder laufen hinterher */
    const p = spot(), skin = rnd(SK), lead = mkNpc(p.x + 6.5, p.z + 6.5, { skin }); lead.spd = 1.3;
    if (Math.random() < .55) mkNpc(p.x + 7.5, p.z + 6.5, { skin, lead, fd: .6, fs: 1.1 });
    const kids = 1 + ((Math.random() * 2) | 0); for (let k = 0; k < kids; k++) mkNpc(p.x + 6.5, p.z + 8, { skin, kid: true, lead, fd: 1.6 + k * .9, fs: (k % 2 ? 1 : -1) * (.7 + k * .3) });
  }
  for (let i = 0; i < 10; i++) { const p = spot(); mkNpc(p.x + 5, p.z + 5, { kid: true }); } /* spielende Kinder */
  for (const n of npcs) { n.spd0 = n.spd; n.style = 0; n.dancer = 0; }
  function animalMesh(kind) {
    const b = new BI.Batch(), g = new THREE.Group();
    if (kind === 'cow') { b.box(0, .75, 0, .9, .8, 1.7, 0xffffff); b.box(-.46, 1.1, .2, .06, .4, .5, 0x23262d); b.box(.46, 1.0, -.3, .06, .35, .5, 0x23262d); b.box(0, 1.55, .25, .5, .06, .6, 0x23262d); b.box(0, 1.05, .98, .5, .5, .5, 0xffffff); b.box(0, 1.05, 1.22, .36, .26, .08, 0xffb0b8); b.box(-.17, 1.5, .98, .08, .2, .08, 0xf3e9d2); b.box(.17, 1.5, .98, .08, .2, .08, 0xf3e9d2); for (const x of [-.3, .3]) for (const z of [-.6, .6]) b.box(x, 0, z, .2, .75, .2, 0xe8e8e8); }
    else if (kind === 'sheep') { b.sph(0, .85, 0, .6, 0xfafafa, 1, 1, .85, 1.3); b.sph(0, .95, .75, .27, 0x3a3a44, 1); for (const x of [-.22, .22]) for (const z of [-.4, .4]) b.box(x, 0, z, .14, .5, .14, 0x3a3a44); }
    else { b.sph(0, .35, 0, .38, 0xffe14a, 1, 1, .8, 1.2); b.sph(0, .72, .3, .2, 0xffe14a, 1); b.box(0, .66, .52, .14, .06, .18, 0xff8a1f); b.box(0, .02, 0, .5, .03, .6, 0xffe14a); }
    g.add(b.mesh(BI.mat())); return g;
  }
  const animals = [];
  const FR = W.farm;
  for (const [k, n] of [['cow', 4], ['sheep', 5]]) for (let i = 0; i < n; i++) {
    const m = animalMesh(k), a = { k, m, x: FR.x0 + Math.random() * (FR.x1 - FR.x0), z: FR.z0 + Math.random() * (FR.z1 - FR.z0), h: Math.random() * TAU, tx: 0, tz: 0, wait: Math.random() * 3, hop: 0, ph: Math.random() * 6 };
    a.tx = a.x; a.tz = a.z; scene.add(m); animals.push(a);
  }
  /* Pappnase: Jannis' Luftballon (an der Schnur), dazu eine große im Spielzeugladen */
  const pap = BI.makePappnase(); pap.group.scale.setScalar(.8); scene.add(pap.group); pap.wiggle = 0; pap.k = null;
  const strGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), str = new THREE.Line(strGeo, new THREE.LineBasicMaterial({ color: 0xffffff })); str.frustumCulled = false; scene.add(str);
  const kiteC = BI.makeKite(); kiteC.group.visible = false; scene.add(kiteC.group); kiteC.k = null;
  const kiteLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineBasicMaterial({ color: 0xffffff })); kiteLine.frustumCulled = false; kiteLine.visible = false; scene.add(kiteLine);
  const shopPap = BI.makePappnase(), SH = W.spots.shop; shopPap.group.scale.setScalar(1.6); shopPap.group.position.set(SH.x + 2.3, 2.6, SH.z + 1.0); scene.add(shopPap.group);
  const shopStr = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(SH.x + 2.3, 2.6, SH.z + 1.0), new THREE.Vector3(SH.x + 1.4, 1.2, SH.z + 3.5)]), new THREE.LineBasicMaterial({ color: 0xffffff })); scene.add(shopStr);
  const keeper = BI.makeChar({ shirt: 0xb36bff, pants: 0x3d4a7a, hair: 0xa14a2b, skin: 0xf3c9a0, name: 'Frau Bunt' }); keeper.group.position.set(SH.keeper.x, 0, SH.keeper.z); keeper.group.rotation.y = Math.PI; scene.add(keeper.group);
  /* Blitz, der Polizeihund-Helfer: folgt, bellt, spürt Sterne auf */
  const pup = { d: BI.makePet(save.pet), name: (BI.PETS.find(q => q.id === save.pet) || BI.PETS[0]).name, x: P.x + 2.5, z: P.z + 1.5, h: 0, mode: 'follow', star: null, bark: 0, cd: 0, phase: 0, speed: 0, trick: null, trickIdx: 0, tricksDone: 0, fetch: null };
  scene.add(pup.d.group);
  const ducks = []; for (let i = 0; i < 3; i++) { const m = animalMesh('duck'); scene.add(m); ducks.push({ m, a: i * 2.1, r: 5 + i * 2 }); }

  /* ---------- Sterne ---------- */
  const NSTAR = 70, stars = [], sg = new THREE.Shape();
  for (let i = 0; i < 10; i++) { const r = i % 2 ? .42 : 1, a = i * Math.PI / 5; sg[i ? 'lineTo' : 'moveTo'](Math.sin(a) * r, Math.cos(a) * r); }
  const starGeo = new THREE.ExtrudeGeometry(sg, { depth: .3, bevelEnabled: false }); starGeo.translate(0, 0, -.15);
  const starMesh = new THREE.InstancedMesh(starGeo, new THREE.MeshLambertMaterial({ color: 0xffd23f, emissive: 0x9a6a00 }), NSTAR); starMesh.frustumCulled = false; starMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(starMesh);
  function starSpot(near) {
    for (let t = 0; t < 60; t++) {
      let x, z; if (near) { const a = Math.random() * TAU, d = 14 + Math.random() * 22; x = Math.sin(a) * d; z = Math.cos(a) * d; } else { const a = Math.random() * TAU, d = Math.sqrt(Math.random()) * 168; x = Math.sin(a) * d; z = Math.cos(a) * d; }
      if (W.free(x, z, 1.2) && Math.hypot(x - W.lake.x, z - W.lake.z) > W.lake.r + 1) return { x, z };
    } return { x: 0, z: 40 };
  }
  for (let i = 0; i < NSTAR; i++) { const p = starSpot(i < 8); stars.push({ x: p.x, z: p.z, on: true, t: 0, ph: Math.random() * 6 }); }
  const dummy = new THREE.Object3D();

  /* ---------- Zustand ---------- */
  let state = 'menu', t = 0, toastT = 0, mission = null, missionDelay = 0, everDrove = false, introT = 0, saveT = 0;
  const cam = { yaw: 0, pitch: .42, zoom: 1, off: 0, idle: 0, x: 0, y: 8, z: 40, dist: 8, ego: false, egoOff: 0 };
  const inp = { kx: 0, ky: 0, sx: 0, sy: 0, horn: false, turbo: false, act: false, aux: false, jump: false, hornEdge: false, up: false, down: false };
  const keys = {};

  function say(txt, ms) { A.speak(txt); const el = $('toast'); el.textContent = txt; el.classList.add('show'); toastT = ms || 2600; }
  const G = { makePappnase: BI.makePappnase, scene, camera, fx, W, A, P, vehicles, npcs, animals, say, addStars: n => addStars(n), userTrees: () => { const out = []; for (const it of build.items) if (it.t === 'tree') { if (!it.tr) it.tr = { x: it.gx * 4, z: it.gz * 4, top: 4, hp: 8, cd: 0, wob: 0 }; out.push(it.tr); } return out; } };
  const fun = BI.createFun(G), build = BI.createBuild(G), range = BI.createRange(G);
  let pax = 0, lastWarn = -9;
  const platPeople = W.stations.map(stn => {
    const arr = [], a = {};
    for (let i = 0; i < 3; i++) {
      W.trackAt(stn.s - 6 - i * 9, a); const px = Math.cos(a.h), pz = -Math.sin(a.h), q1 = [a.x + px * 5.4, a.z + pz * 5.4], q2 = [a.x - px * 5.4, a.z - pz * 5.4], q = Math.hypot(q1[0], q1[1]) < Math.hypot(q2[0], q2[1]) ? q1 : q2;
      const c = BI.makeChar({ shirt: BI.SHIRTS[(Math.random() * 6) | 0], pants: [0x3d4a7a, 0x5a3d2b, 0x2d6a4f][i % 3], hat: i === 1 ? 'cap' : 'none', hair: [0x6b4423, 0x222222, 0xd9a441][i % 3] });
      c.group.position.set(q[0], .2, q[1]); c.group.rotation.y = Math.atan2(a.x - q[0], a.z - q[1]); scene.add(c.group); arr.push({ c, x: q[0], z: q[1], leaveAt: 0, vis: true, ph: Math.random() * 6 });
    }
    return arr;
  });

  /* ---------- Einsteigen / Aussteigen ---------- */
  function nearVehicle() {
    let best = null, bd = 4.2;
    if (!P.veh) {
      for (const v of vehicles) { if (v.ai) continue; const d = Math.hypot(P.x - v.x, P.z - v.z) - v.r * 1.3 - Math.max(...v.cols.map(Math.abs)) * .5; if (d < bd) { bd = d; best = v; } }
      const dt_ = train.nearest(P.x, P.z); if (dt_ < 4.2 && dt_ < bd) best = trainVeh;
      if (!best) { let rd = 25; for (const q of vehicles) if (q.spec.remote) { const d = Math.hypot(P.x - q.x, P.z - q.z); if (d < rd) { rd = d; best = q; } } }
    }
    return best;
  }
  function enter(v) {
    if (build.active) return;
    fun.setDance(false); P.veh = v; everDrove = true; A.enter(); kids.earn(v.isTrain ? 'train' : v.spec.boat ? 'boat' : v.type === 'heli' || v.type === 'rcheli' ? 'heli' : 'ride');
    if (v.spec.remote) { v.driver = true; startMission(true); updateButtons(true); say('🎮 ' + heroName() + ' steuert sein RC-Auto mit der Fernsteuerung!', 2400); return; }
    if (v.isTrain) { char.group.visible = false; v.siren = false; }
    else {
      v.driver = true; v.v = v.v || 0;
      if (v.spec.open && v.seat) { v.tilt.add(char.group); char.group.position.set(v.seat[0], v.seat[1] - .42, v.seat[2]); char.group.rotation.set(0, 0, 0); char.sit(); char.group.visible = true; } else char.group.visible = false;
    }
    if (v.isTrain) train.driven = true;
    startMission(true); updateButtons(true);
  }
  function leave() {
    const v = P.veh; if (!v) return;
    if (v.spec.remote) { A.leave(); v.driver = null; v.v = 0; P.veh = null; mission = null; clearMissionVisuals(); updateHud(); updateButtons(true); return; }
    if (v.isTrain && train.v > 3) { say('Halte den Zug an zum Aussteigen 🚂', 2200); return; }
    if (v.spec.boat && Math.hypot(v.x - W.dock.x, v.z - W.dock.z) > 10) { say('⚓ Erst am Steg anlegen!', 2000); return; }
    if (v.spec && v.spec.fly && v.y > 1.2) { say(isTouch() ? 'Erst landen! 🚁 Mit ⬇ sinken' : 'Erst landen! 🚁 Mit X sinken', 2200); return; }
    A.leave(); A.horn('car', false); A.siren('police', false); A.water(false);
    const lx = Math.cos(v.h), lz = -Math.sin(v.h), rad = v.isTrain ? 5.5 : v.r + 1.3;
    let px = v.x + lx * rad, pz = v.z + lz * rad;
    if (v.isTrain) { const L = Math.hypot(v.x, v.z) || 1; px = v.x - v.x / L * 6; pz = v.z - v.z / L * 6; }
    if (v.spec.boat) { px = .2; pz = 205.5; }
    if (!v.isTrain) { v.driver = null; v.siren = false; if (char.group.parent !== scene) { v.tilt.remove(char.group); scene.add(char.group); } char.group.rotation.set(0, 0, 0); }
    P.veh = null; char.group.visible = true;
    const q = W.resolve(px, pz, .5, {}); P.x = q.x; P.z = q.z; P.h = v.h; P.y = W.groundY(P.x, P.z); P.vy = 0;
    mission = null; clearMissionVisuals(); updateHud(); updateButtons(true);
  }

  /* ---------- Missionen ---------- */
  const MISSION_BY = { bicycle: 'courier', scooter: 'courier', police: 'patrol', ambulance: 'rescue', fire: 'fire', bus: 'bus', ice: 'ice', car: 'taxi', bike: 'courier', tractor: 'hay', train: 'train', heli: 'fly', boat: 'sail' };
  const MTITLE = { patrol: ['🚓', 'Streife fahren'], rescue: ['🚑', 'Notruf!'], fire: ['🚒', 'Feuerwehr-Einsatz'], bus: ['🚌', 'Bus-Linie'], ice: ['🍦', 'Eis-Lieferung'], taxi: ['🚕', 'Taxi-Fahrt'], courier: ['📦', 'Paket-Kurier'], hay: ['🌾', 'Heu einsammeln'], train: ['🚂', 'Zug-Fahrt'], fly: ['🚁', 'Rundflug'], sail: ['⛵', 'Segeltörn'] };
  const beacon = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 38, 18, 1, true), new THREE.MeshBasicMaterial({ color: 0xffd23f, transparent: true, opacity: .32, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
  beacon.position.y = 19; beacon.visible = false; scene.add(beacon);
  const beaconRing = new THREE.Mesh(new THREE.RingGeometry(2.6, 3.5, 28), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .7, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
  beaconRing.rotation.x = -Math.PI / 2; beaconRing.position.y = .2; beaconRing.visible = false; scene.add(beaconRing);
  const flame = (() => { const g = new THREE.Group(), b = new BI.Batch(); b.cone(0, 0, 0, 1.4, 3.4, 0xff7a1f, 7); b.cone(.5, 0, .3, .9, 2.4, 0xffc933, 6); b.cone(-.5, 0, -.2, .8, 2.0, 0xff4a1f, 6); g.add(b.mesh(BI.mat())); g.visible = false; scene.add(g); return g; })();
  let mNpc = null;
  function clearMissionVisuals() { beacon.visible = beaconRing.visible = flame.visible = false; if (mNpc) { scene.remove(mNpc.c.group); mNpc = null; } }
  function road(prev, min) { return W.randRoadPoint(Math.random, prev ? prev.x : (P.veh ? P.veh.x : P.x), prev ? prev.z : (P.veh ? P.veh.z : P.z), min || 55); }
  function startMission(first) {
    if (!P.veh) { mission = null; clearMissionVisuals(); return; }
    const key = P.veh.isTrain ? 'train' : P.veh.type, kind = MISSION_BY[key]; if (!kind) { mission = null; clearMissionVisuals(); return; }
    const M = { kind, steps: [], i: 0 }; let p = null;
    const reach = (pt, label, npc, r) => ({ x: pt.x, z: pt.z, label, type: 'reach', npc: !!npc, r: r || 7 });
    if (kind === 'patrol') for (let i = 0; i < 3; i++) { p = road(p); M.steps.push(reach(p, 'Kontrollpunkt ' + (i + 1) + ' von 3')); }
    else if (kind === 'rescue') { p = road(null, 60); M.steps.push(reach(p, 'Verletzten abholen 🩹', true, 8)); M.steps.push(reach(W.spots.hospital, 'Ab ins Krankenhaus 🏥', false, 9)); }
    else if (kind === 'fire') { p = road(null, 70); M.steps.push({ x: p.x, z: p.z, label: 'Feuer löschen! Halte 💦 gedrückt', type: 'spray', r: 24, prog: 0 }); }
    else if (kind === 'bus') for (let i = 0; i < 3; i++) { p = road(p, 60); M.steps.push(reach(p, 'Haltestelle ' + (i + 1) + ' von 3 🚏', true, 9)); }
    else if (kind === 'ice') for (let i = 0; i < 3; i++) { p = road(p, 50); M.steps.push(reach(p, 'Eis für Kind ' + (i + 1) + ' von 3', true, 8)); }
    else if (kind === 'taxi') { p = road(null, 50); M.steps.push(reach(p, 'Fahrgast abholen 🙋', true, 7)); const q = road(p, 90); M.steps.push(reach(q, 'Fahrgast zum Ziel bringen 📍', false, 8)); }
    else if (kind === 'courier') for (let i = 0; i < 4; i++) { p = road(p, 45); M.steps.push(reach(p, 'Päckchen ' + (i + 1) + ' von 4', false, 7)); }
    else if (kind === 'hay') for (let i = 0; i < 5; i++) { let q = null; for (let k = 0; k < 40 && !q; k++) { const x = -130 + Math.random() * 70, z = 30 + Math.random() * 90; if (W.free(x, z, 2.2) && Math.hypot(x - W.lake.x, z - W.lake.z) > 20) q = { x, z }; } M.steps.push(reach(q || { x: -80, z: 100 }, 'Heuballen ' + (i + 1) + ' von 5 🌾', false, 4.5)); }
    else if (kind === 'train') {
      const ns = train.nextStop(); let i0 = ns.i; if (Math.abs(train.offsetTo(i0)) < 4 && train.v < 1) i0 = (i0 + 1) % W.stations.length;
      for (let k = 0; k < 3; k++) { const idx = (i0 + k) % W.stations.length, stn = W.stations[idx]; M.steps.push({ type: 'tstop', idx, x: stn.x, z: stn.z, label: 'Halt: ' + stn.name + ' ' + stn.icon, phase: 'drive', timer: 0, prec: 0, speeding: false, shown: '' }); }
    }
    else if (kind === 'sail') {
      for (let i = 0; i < 4; i++) { const a = .5 + Math.random() * (TAU - 1), d = 222 + Math.random() * 70; M.steps.push(reach({ x: Math.sin(a) * d, z: Math.cos(a) * d }, 'Boje ' + (i + 1) + ' von 4 🛟', false, 9)); }
      M.steps.push(reach({ x: W.dock.x + 2, z: W.dock.z + 5 }, 'Zurück zum Steg ⚓', false, 8));
    }
    else if (kind === 'fly') {
      for (let i = 0; i < 4; i++) { const a = Math.random() * TAU, d = 30 + Math.random() * 100; M.steps.push({ x: Math.sin(a) * d, z: Math.cos(a) * d, y: 16 + Math.random() * 22, label: 'Fliege durch den Ring ' + (i + 1) + ' von 4 ⭕', type: 'reach', r: 9, air: true }); }
      M.steps.push({ x: W.spots.helipad.x, z: W.spots.helipad.z, label: 'Lande auf dem Landeplatz 🅷', type: 'land' });
    }
    mission = M; showStep(); updateHud();
    if (first && !save.intro) { save.intro = true; persist(); }
  }
  function showStep() {
    const M = mission; if (!M) return; const s = M.steps[M.i];
    if (mNpc) { scene.remove(mNpc.c.group); mNpc = null; }
    const col = { patrol: 0x3f8cff, rescue: 0xff4a4a, fire: 0xff7a1f, bus: 0xffc933, ice: 0xff8fc8, taxi: 0xffd23f, courier: 0x4cd07d, hay: 0xe8c85a, train: 0x7a5ce0, fly: 0x4da3ff, sail: 0x2d8cff }[M.kind];
    beacon.material.color.setHex(col); beaconRing.material.color.setHex(col);
    const hasPos = s.type === 'reach' || s.type === 'spray' || s.type === 'tstop' || s.type === 'land';
    beacon.visible = beaconRing.visible = hasPos && s.type !== 'spray'; flame.visible = s.type === 'spray';
    if (hasPos) { beacon.position.x = beaconRing.position.x = s.x; beacon.position.z = beaconRing.position.z = s.z; beaconRing.position.y = s.air ? s.y : .2; beaconRing.userData.k = s.air ? 2.6 : 1; beacon.position.y = s.air ? s.y + 19 : 19; }
    if (s.type === 'spray') { flame.position.set(s.x + (Math.abs(s.x) > Math.abs(s.z) ? 0 : 5), 0, s.z + (Math.abs(s.x) > Math.abs(s.z) ? 5 : 0)); flame.scale.setScalar(1); s.fx = flame.position.x; s.fz = flame.position.z; }
    if (s.npc) { const c = BI.makeChar({ shirt: BI.SHIRTS[(Math.random() * 6) | 0], hat: Math.random() < .5 ? 'none' : 'cap' }); c.group.position.set(s.x + 3.2, 0, s.z + 1); c.group.rotation.y = -1.2; scene.add(c.group); mNpc = { c, x: s.x + 3.2, z: s.z + 1 }; }
  }
  function stepDone() {
    const M = mission, s = M.steps[M.i]; A.star(); addStars(1);
    const px = s.type === 'spray' ? s.fx : s.type === 'lap' ? P.veh.x : s.x, pz = s.type === 'spray' ? s.fz : s.type === 'lap' ? P.veh.z : s.z;
    fx.burst(px, s.air ? s.y : 2, pz, 26, [BI.C.gold, BI.C.pink, BI.C.blue, BI.C.green], 8, 1.4, 26, 9);
    if (mNpc) { fx.burst(mNpc.x, 2.2, mNpc.z, 8, [BI.C.pink], 3, 1.2, 40, -1); }
    M.i++;
    if (M.i >= M.steps.length) {
      A.fanfare(); addStars(5); say('🎉 Super gemacht! +5 ⭐', 2800); fx.burst(P.veh.x, 3, P.veh.z, 60, [BI.C.gold, BI.C.pink, BI.C.blue, BI.C.green, BI.C.orange], 11, 1.8, 26, 9);
      mission = null; clearMissionVisuals(); missionDelay = 3; updateHud();
    } else { showStep(); updateHud(); }
  }
  function updateMission(dt) {
    if (!P.veh) return;
    if (!mission) { if (missionDelay > 0) { missionDelay -= dt; if (missionDelay <= 0) startMission(); } return; }
    const M = mission, s = M.steps[M.i], v = P.veh;
    if (s.type === 'reach') { if (Math.hypot(v.x - s.x, v.z - s.z) < s.r && (!s.air || Math.abs((v.y || 0) - s.y) < 7)) stepDone(); }
    else if (s.type === 'land') { if (Math.hypot(v.x - s.x, v.z - s.z) < 9 && (v.y || 0) < 1.6 && Math.abs(v.v) < 2.5) stepDone(); }
    else if (s.type === 'tstop') {
      const off = train.offsetTo(s.idx); let ph = s.phase;
      if (ph === 'drive') { if (Math.abs(off) < 6 && train.v < .6) { s.prec = Math.abs(off); setPhase(s, 'arrived'); A.ding(); say('🚉 Angekommen! Drücke 🚪 Türen', 2600); } else { const missed = off < -12; if (missed !== !!s.missed) { s.missed = missed; updateHud(); } } }
      else if (ph === 'arrived') { if (train.v > 1) setPhase(s, 'drive'); }
      else if (ph === 'doors') { s.timer -= dt; if (s.timer <= 0) { setPhase(s, 'open'); A.ding(); say('Alle sind drin! Türen schließen 🚪', 2400); } }
    }
    else if (s.type === 'spray') {
      const d = Math.hypot(v.x - s.fx, v.z - s.fz);
      if (d < s.r && inp.horn && v.spec.water) { s.prog += dt / 3; flame.scale.setScalar(Math.max(.05, 1 - s.prog)); fx.emit(s.fx + (Math.random() - .5) * 2, 1 + Math.random() * 3, s.fz + (Math.random() - .5) * 2, 0, 2, 0, 1, 70, .6, .6, .6, -1, .6); if (s.prog >= 1) { flame.visible = false; stepDone(); } }
      else if (flame.visible) { flame.scale.y = 1 - s.prog * .9 + Math.sin(t * 14) * .08; if (Math.random() < dt * 12) fx.emit(s.fx + (Math.random() - .5) * 1.5, 3, s.fz + (Math.random() - .5) * 1.5, 0, 3, 0, 1.1, 60, .3, .3, .3, -1, .5); }
    }
    if (mNpc) { mNpc.c.pose(t * 6, .2, true); mNpc.c.group.position.y = Math.abs(Math.sin(t * 5)) * .25; }
    beacon.material.opacity = .26 + Math.sin(t * 4) * .08; beaconRing.scale.setScalar((beaconRing.userData.k || 1) * (1 + (t * 1.3 % 1) * .6)); beaconRing.material.opacity = .7 * (1 - (t * 1.3 % 1));
  }
  function setPhase(s, p) { s.phase = p; updateHud(); }
  function phaseText(s) {
    if (s.phase === 'arrived') return 'Angekommen! Türen öffnen 🚪';
    if (s.phase === 'doors') return 'Fahrgäste steigen ein … 👥';
    if (s.phase === 'open') return 'Türen schließen 🚪';
    return s.missed ? 'Verpasst! Fahre eine Runde weiter 🔄' : s.label + ' – langsam heranfahren';
  }
  function trainDoors() {
    const M = mission, s = M && M.steps[M.i];
    if (!s || s.type !== 'tstop') { A.pop(); say('🚂 Fahre zum nächsten Bahnhof und halte am Schild', 2000); return; }
    if (s.phase === 'arrived') { setPhase(s, 'doors'); s.timer = 3.4; A.ding(); platPeople[s.idx].forEach((p, i) => { p.leaveAt = t + .5 + i * .9; }); pax = Math.max(0, pax - ((Math.random() * 3) | 0)); }
    else if (s.phase === 'open') {
      A.ding(); const bonus = (s.prec < 1.5 ? 2 : s.prec < 3.5 ? 1 : 0) + (s.speeding ? 0 : 1);
      if (bonus) { addStars(bonus); say('🚉 Super Halt! +' + (bonus + 1) + ' ⭐ (genau & nicht zu schnell)', 2600); }
      stepDone();
    } else if (s.phase === 'doors') say('Moment, Fahrgäste steigen ein …', 1300);
    else say('Erst am Bahnsteig anhalten 🚉', 1500);
  }
  function trainLimit() { const ns = train.nextStop(); return ns.d < 90 && ns.d > -12 ? 10 : 22; }
  const gauge = $('gauge');
  function updateGauge() {
    const v = P.veh; if (!v || !(v.isTrain || v.spec.fly) || state !== 'play') { gauge.hidden = true; return; }
    gauge.hidden = false;
    if (v.isTrain) {
      const lim = trainLimit(), over = train.v > lim + 1.5; $('gVal').textContent = Math.round(train.v * 3.6); $('gUnit').textContent = 'km/h'; $('gSub').textContent = 'Limit ' + Math.round(lim * 3.6) + ' · 👥 ' + pax; gauge.classList.toggle('warn', over);
      if (over) { const s = mission && mission.steps[mission.i]; if (s && s.type === 'tstop') s.speeding = true; if (t - lastWarn > 5) { lastWarn = t; say('🐌 Zu schnell! Langsamer fahren', 1600); } }
    } else { $('gVal').textContent = Math.round(v.y); $('gUnit').textContent = 'm Höhe'; $('gSub').textContent = Math.round(Math.abs(v.v) * 3.6) + ' km/h'; gauge.classList.remove('warn'); }
  }
  function addStars(n) { save.stars += n; $('starN').textContent = save.stars; $('stars').classList.remove('pop'); void $('stars').offsetWidth; $('stars').classList.add('pop'); saveT = 1.5; }

  /* ---------- HUD ---------- */
  const mCard = $('mission'), arrow = $('mArrow');
  function updateHud() {
    const M = mission;
    if (M) {
      const s = M.steps[M.i], [ic, ti] = MTITLE[M.kind];
      $('mIcon').textContent = ic; $('mTitle').textContent = ti + (M.steps.length > 1 ? ' · ' + (M.i + 1) + '/' + M.steps.length : ''); $('mText').textContent = s.type === 'tstop' ? phaseText(s) : s.label; mCard.hidden = false; const sk = M.kind + M.i + s.type; if (sk !== spoke && state === 'play') { spoke = sk; if (s.type !== 'tstop') A.speak(s.label); }
    } else if (guide && state === 'play') {
      $('mIcon').textContent = guide.d.icon; $('mTitle').textContent = '🧭 Ziel'; $('mText').textContent = guide.d.name; mCard.hidden = false;
    } else if (!P.veh && state === 'play') {
      $('mIcon').textContent = everDrove ? '⭐' : '🚗'; $('mTitle').textContent = everDrove ? 'Sterne sammeln' : 'Los geht\'s!'; $('mText').textContent = everDrove ? 'Lauf oder fahre zu den Sternen' : 'Geh zu einem Fahrzeug und steige ein'; mCard.hidden = false;
    } else mCard.hidden = true;
    $('starN').textContent = save.stars;
  }
  let btnSig = '';
  function updateButtons(force) {
    const v = P.veh, near = state === 'play' && !v && !build.active ? nearVehicle() : null, spec = v ? v.spec : null;
    const tree = state === 'play' && !v && !build.active ? fun.nearTree() : null, shopNear = state === 'play' && !v && !build.active && !shopOpen && nearCounter(), rangeNear = state === 'play' && !rs.ui && nearRange(), flatN = state === 'play' && !rs.ui && !wardOpen ? flatNear() : null, placeN = state === 'play' ? placeNear() : null, chestNear = state === 'play' && !v && !build.active && !shopOpen && nearChest();
    const sig = [!!v, near && (near.isTrain ? 'train' : near.type), spec && spec.kind, spec && (spec.siren || spec.water || spec.horn), spec && !!spec.fly, spec && !!spec.remote, build.active, !!tree, shopNear, chestNear, rangeNear, flatN && flatN.k, placeN && (placeN.src + (placeN.n ? placeN.n.k : placeN.a ? placeN.a.k : placeN.npc ? placeN.npc.p.name : ''))].join('|');
    if (sig === btnSig && !force) return; btnSig = sig;
    const act = $('bAct'), horn = $('bHorn'), aux = $('bAux'), jump = $('bJump');
    if (v) {
      act.hidden = false; act.innerHTML = spec.remote ? '<b>🎮</b><small>Zurück</small>' : '<b>🚪</b><small>Aussteigen</small>'; act.classList.remove('pulse');
      if (spec.fly) { jump.innerHTML = '<b>⬆</b><small>Steigen</small>'; horn.innerHTML = '<b>🔔</b><small>Klingel</small>'; aux.innerHTML = '<b>⬇</b><small>Sinken</small>'; aux.hidden = false; }
      else {
        jump.innerHTML = '<b>🚀</b><small>Turbo</small>';
        horn.innerHTML = spec.water ? '<b>💦</b><small>Wasser</small>' : spec.horn === 'melody' ? '<b>🎵</b><small>Eis-Lied</small>' : '<b>📣</b><small>' + (v.isTrain ? 'Pfeife' : 'Hupe') + '</small>';
        aux.hidden = !(spec.siren || v.isTrain); aux.innerHTML = v.isTrain ? '<b>🚪</b><small>Türen</small>' : '<b>🚨</b><small>Sirene</small>';
      }
      jump.hidden = false; horn.hidden = false;
    } else {
      act.hidden = !(near || shopNear || chestNear || rangeNear || flatN || placeN); if (near) act.innerHTML = near.spec.remote ? '<b>🎮</b><small>Fernsteuern</small>' : '<b>' + near.spec.icon + '</b><small>Einsteigen</small>'; else if (shopNear) act.innerHTML = '<b>🛒</b><small>Einkaufen</small>'; else if (chestNear) act.innerHTML = '<b>💰</b><small>Schatz</small>'; else if (rangeNear) act.innerHTML = '<b>🎯</b><small>Schießstand</small>'; else if (flatN) act.innerHTML = flatN.k === 'room' ? '<b>🛋️</b><small>Einrichten</small>' : flatN.k === 'bed' ? '<b>🛏️</b><small>Schlafen</small>' : flatN.k === 'ward' ? '<b>👕</b><small>Umziehen</small>' : '<b>💬</b><small>' + PARENT[flatN.f.i][flatN.k === 'mama' ? 0 : 1].name + '</small>'; else if (placeN) { const pl = placeLabel(placeN); act.innerHTML = '<b>' + pl[0] + '</b><small>' + pl[1] + '</small>'; } act.classList.toggle('pulse', !!(near || shopNear || chestNear || rangeNear || flatN || placeN));
      jump.hidden = false; jump.innerHTML = '<b>⤒</b><small>Springen</small>'; horn.hidden = false; horn.innerHTML = '<b>👋</b><small>Hallo!</small>'; aux.hidden = !tree; if (tree) aux.innerHTML = '<b>👊</b><small>Baum hauen</small>';
    }
  }
  function drawMini() {
    const c = miniC.getContext('2d'); c.clearRect(0, 0, miniC.width, miniC.height); c.drawImage(miniBase, 0, 0);
    const S = miniS * 2, k = S / (2 * K.MAP), X = x => S / 2 + x * k, Y = z => S / 2 + z * k;
    if (mission) { const s = mission.steps[mission.i]; const tx = s.type === 'spray' ? s.fx : s.x, tz = s.type === 'spray' ? s.fz : s.z; if (s.type !== 'lap') { c.fillStyle = '#ff2d55'; c.beginPath(); c.arc(X(tx), Y(tz), 7, 0, TAU); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 2.5; c.stroke(); } }
    c.fillStyle = '#ff4f9a'; for (const a of remote.values()) { c.beginPath(); c.arc(X(a.x), Y(a.z), 5, 0, TAU); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 2; c.stroke(); }
    if (guide) { const gp = guide.d.at(); c.fillStyle = 'rgba(255,210,63,.95)'; c.strokeStyle = '#ff7a1f'; c.lineWidth = 3; c.beginPath(); c.arc(X(gp.x), Y(gp.z), 8 + Math.sin(t * 6) * 2, 0, TAU); c.fill(); c.stroke(); }
    c.fillStyle = '#7a5ce0'; for (const cr of train.cars) c.fillRect(X(cr.x) - 2, Y(cr.z) - 2, 4, 4);
    const px = P.veh ? P.veh.x : P.x, pz = P.veh ? P.veh.z : P.z, ph = P.veh ? P.veh.h : P.h;
    c.save(); c.translate(X(px), Y(pz)); c.rotate(Math.PI - ph); c.fillStyle = '#fff'; c.strokeStyle = '#1b2a4a'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(0, -9); c.lineTo(6.5, 7); c.lineTo(0, 3.5); c.lineTo(-6.5, 7); c.closePath(); c.fill(); c.stroke(); c.restore();
  }
  function updateArrow() {
    let tx = null, tz = null, dist = 0;
    const px = P.veh ? P.veh.x : P.x, pz = P.veh ? P.veh.z : P.z;
    if (guide) { const p = guide.d.at(); tx = p.x; tz = p.z; }
    else if (mission) { const s = mission.steps[mission.i]; if (s.type === 'spray') { tx = s.fx; tz = s.fz; } else if (s.type === 'lap') { arrow.hidden = true; $('mDist').textContent = Math.round(Math.min(1, s.prog) * 100) + ' %'; return; } else { tx = s.x; tz = s.z; } }
    else if (!P.veh) {
      if (!everDrove) { let bd = 1e9; for (const v of vehicles) { if (v.ai) continue; const d = Math.hypot(v.x - px, v.z - pz); if (d < bd) { bd = d; tx = v.x; tz = v.z; } } }
      else { let bd = 1e9; for (const s of stars) if (s.on) { const d = Math.hypot(s.x - px, s.z - pz); if (d < bd) { bd = d; tx = s.x; tz = s.z; } } }
    }
    if (tx == null) { arrow.hidden = true; $('mDist').textContent = ''; return; }
    dist = Math.hypot(tx - px, tz - pz); const a = Math.atan2(tx - px, tz - pz) - (cam.yaw + Math.PI); // relativ zur Blickrichtung
    arrow.hidden = false; arrow.style.transform = 'rotate(' + (-a * 180 / Math.PI) + 'deg)'; $('mDist').textContent = Math.round(dist) + ' m';
  }

  /* ---------- Eingabe ---------- */
  function setStick(x, y) { inp.sx = x; inp.sy = y; }
  const zone = $('zone'), joy = $('joy'), sKnob = $('joyKnob'); const stick = { id: null, cx: 0, cy: 0, R: 48, hit: 100 }, drag = { id: null, x: 0, y: 0 };
  function joyGeom() { const r = joy.getBoundingClientRect(); stick.cx = r.left + r.width / 2; stick.cy = r.top + r.height / 2; stick.R = r.width * .34; stick.hit = r.width * .85; return r.width > 0; }
  function moveStick(e) { let dx = e.clientX - stick.cx, dy = e.clientY - stick.cy; const R = stick.R, l = Math.hypot(dx, dy); if (l > R) { dx *= R / l; dy *= R / l; } sKnob.style.transform = 'translate(' + dx + 'px,' + dy + 'px)'; setStick(dx / R, -dy / R); }
  zone.addEventListener('pointerdown', e => {
    A.resume(); if (state !== 'play') return; if (rs.ui === 'play') { rangeAim(e.clientX, e.clientY); rs.down = true; rangeShoot(); try { zone.setPointerCapture(e.pointerId); } catch (x) { } return; } if (!$('funBar').hidden) closeQuick();
    if (stick.id == null && joyGeom() && Math.hypot(e.clientX - stick.cx, e.clientY - stick.cy) < stick.hit) { stick.id = e.pointerId; moveStick(e); }
    else if (drag.id == null) { drag.id = e.pointerId; drag.x = e.clientX; drag.y = e.clientY; drag.t0 = performance.now(); drag.moved = 0; }
    try { zone.setPointerCapture(e.pointerId); } catch (x) { }
  });
  zone.addEventListener('pointermove', e => {
    if (rs.ui === 'play') { if (e.pointerType === 'mouse' || rs.down) rangeAim(e.clientX, e.clientY); return; }
    if (e.pointerId === stick.id) moveStick(e);
    else if (e.pointerId === drag.id) {
      const ddx = e.clientX - drag.x, ddy = e.clientY - drag.y; drag.moved += Math.abs(ddx) + Math.abs(ddy);
      if (cam.ego && P.veh) cam.egoOff = clamp(cam.egoOff - ddx * .006, -1.7, 1.7); else { cam.yaw -= ddx * .006; cam.pitch = clamp(cam.pitch + ddy * .004, .12, 1.3); }
      drag.x = e.clientX; drag.y = e.clientY; cam.idle = 0;
    }
  });
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  function tapGround(cx, cy) { ndc.set(cx / innerWidth * 2 - 1, -(cy / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera); const o = ray.ray.origin, d = ray.ray.direction; if (d.y < -.01) { const k = -o.y / d.y; build.setCursor(o.x + d.x * k, o.z + d.z * k); } }
  const endPtr = e => { rs.down = false; if (e.pointerId === drag.id && build.active && drag.moved < 12 && performance.now() - drag.t0 < 500) tapGround(e.clientX, e.clientY);
    if (e.pointerId === stick.id) { stick.id = null; setStick(0, 0); sKnob.style.transform = 'translate(0,0)'; } if (e.pointerId === drag.id) drag.id = null; };
  zone.addEventListener('pointerup', endPtr); zone.addEventListener('pointercancel', endPtr);
  zone.addEventListener('wheel', e => { cam.zoom = clamp(cam.zoom * (e.deltaY > 0 ? 1.1 : .9), .6, 2.2); e.preventDefault(); }, { passive: false });
  zone.addEventListener('contextmenu', e => e.preventDefault());
  function hold(btn, key) {
    const ks = Array.isArray(key) ? key : [key];
    const on = e => { e.preventDefault(); e.stopPropagation(); A.resume(); for (const k of ks) inp[k] = true; if (ks[0] === 'horn') inp.hornEdge = true; btn.classList.add('down'); };
    const off = e => { for (const k of ks) inp[k] = false; btn.classList.remove('down'); };
    btn.addEventListener('pointerdown', on); btn.addEventListener('pointerup', off); btn.addEventListener('pointerleave', off); btn.addEventListener('pointercancel', off);
  }
  hold($('bHorn'), 'horn'); hold($('bJump'), ['turbo', 'up']); hold($('bAux'), 'down');
  $('bJump').addEventListener('pointerdown', () => { if (!P.veh) inp.jump = true; });
  const tap = (el, fn) => el.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); A.resume(); fn(); });
  tap($('bAct'), () => { inp.act = true; });
  $('bAux').addEventListener('pointerdown', () => { inp.aux = true; });
  const KMAP = { ArrowUp: 'u', KeyW: 'u', ArrowDown: 'd', KeyS: 'd', ArrowLeft: 'l', KeyA: 'l', ArrowRight: 'r', KeyD: 'r' };
  addEventListener('keydown', e => {
    if (e.target && e.target.tagName === 'INPUT') return;
    if (e.repeat) { if (KMAP[e.code] || e.code === 'Space') e.preventDefault(); return; }
    A.resume();
    if (state === 'play' && combat.key(e.code, true)) { e.preventDefault(); return; }
    if (mini.active) { if (e.code === 'Escape') $('mgExit').click(); return; }
    if (kids.open && state === 'play') { if (e.code === 'Escape' && kids.open !== 'break') { kids.close(); e.preventDefault(); } else kids.keydown(e.code) && e.preventDefault(); return; }
    if (gamesOpen && e.code === 'Escape') { closeGames(); e.preventDefault(); return; }
    if (wardOpen && e.code === 'Escape') { closeWard(); e.preventDefault(); return; }
    if (mpOpen) { if (e.code === 'Escape') { mpBack(); e.preventDefault(); } else if (mpView === 'join') { if (e.code === 'Backspace') { joinCode = joinCode.slice(0, -1); renderJoin(); } else if (e.code === 'Enter') mpJoinGo(); else { const ch = net.normCode(e.key); if (ch && e.key.length === 1 && joinCode.length < 4) { joinCode += ch; renderJoin(); } } } return; }
    if (e.code === 'Escape' && rs.ui && state === 'play') { if (rs.ui === 'play' || rs.ui === 'result') exitRange(); else closeRangeUi(); return; }
    if (e.code === 'Escape' || e.code === 'KeyP') { if (state === 'play') pause(true); else if (state === 'pause') pause(false); return; }
    if (state !== 'play') { if ((e.code === 'Enter' || e.code === 'Space') && state === 'menu') { startPlay(); e.preventDefault(); } return; }
    if (KMAP[e.code]) { keys[KMAP[e.code]] = true; e.preventDefault(); }
    if (rs.ui) { if (rs.ui === 'play' && (e.code === 'Space' || e.code === 'Enter')) { e.preventDefault(); rangeShoot(); } else if (e.code === 'KeyE' && rs.ui !== 'play') inp.act = true; return; }
    switch (e.code) {
      case 'Space': e.preventDefault(); if (P.veh) { if (P.veh.spec.fly) inp.up = true; else { inp.horn = true; inp.hornEdge = true; } } else inp.jump = true; break;
      case 'KeyX': inp.down = true; break;
      case 'KeyV': toggleEgo(); break;
      case 'KeyB': toggleBuild(); break;
      case 'KeyG': if (build.active) build.place(); break;
      case 'KeyO': if (build.active) build.rotate(); break;
      case 'KeyK': if (build.active) build.nextColor(); break;
      case 'Delete': case 'Backspace': if (build.active) build.remove(); break;
      case 'Digit1': doFun('dance'); break;
      case 'Digit2': doFun('gum'); break;
      case 'Digit3': doFun('ball'); break;
      case 'Digit4': doFun('fireworks'); break;
      case 'Digit5': doFun('balloons'); break;
      case 'Digit6': doFun('punch'); break;
      case 'Digit7': doFun('bark'); break;
      case 'Digit8': doFun('search'); break;
      case 'Digit9': doFun('bubbles'); break;
      case 'Digit0': doFun('xxl'); break;
      case 'ShiftLeft': case 'ShiftRight': inp.turbo = true; break;
      case 'KeyE': case 'Enter': inp.act = true; break;
      case 'KeyF': inp.aux = true; break;
      case 'KeyH': inp.horn = true; inp.hornEdge = true; break;
      case 'KeyN': toggleNight(); break;
      case 'KeyM': toggleSound(); break;
      case 'KeyC': cam.zoom = cam.zoom > 1.3 ? .75 : cam.zoom + .35; break;
      case 'KeyQ': keys.q = true; break;
      case 'KeyR': keys.r = true; break;
    }
  });
  addEventListener('keyup', e => {
    combat.key(e.code, false);
    if (KMAP[e.code]) keys[KMAP[e.code]] = false;
    if (e.code === 'Space' || e.code === 'KeyH') inp.horn = false;
    if (e.code === 'Space') inp.up = false; if (e.code === 'KeyX') inp.down = false;
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') inp.turbo = false;
    if (e.code === 'KeyQ') keys.q = false; if (e.code === 'KeyR') keys.r = false;
  });
  addEventListener('blur', () => { for (const k in keys) keys[k] = false; inp.horn = inp.turbo = inp.up = inp.down = false; if (state === 'play') pause(true); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && state === 'play') pause(true); });

  /* ---------- Menüs ---------- */
  function toggleNight() { nightT = nightT > .5 ? 0 : 1; save.night = nightT === 1; persist(); $('bNight').textContent = save.night ? '☀️' : '🌙'; }
  function toggleSound() { save.sound = !save.sound; A.setMuted(!save.sound); persist(); $('bSound').textContent = save.sound ? '🔊' : '🔇'; }
  function toggleVoice() { save.voice = save.voice === false; A.setVoice(save.voice); persist(); $('bVoice').classList.toggle('off', !save.voice); if (save.voice) A.speak('Ich lese dir alles vor!'); }
  A.voiceOn = save.voice !== false; $('bVoice').classList.toggle('off', !A.voiceOn); $('bVoice').addEventListener('click', toggleVoice);
  let spoke = ''; const readMission = () => { const M = mission; A.speak(M ? M.steps[M.i].type === 'tstop' ? phaseText(M.steps[M.i]) : M.steps[M.i].label : $('mText').textContent); };
  { const mc = $('mission'); mc.classList.toggle('min', save.mmin !== false);
    mc.addEventListener('pointerdown', e => { e.stopPropagation(); A.resume(); if (mc.classList.contains('min')) { mc.classList.remove('min'); save.mmin = false; persist(); } else if (e.target.id === 'mMin') { mc.classList.add('min'); save.mmin = true; persist(); } else readMission(); }); }
  function toggleMusic() { save.music = !save.music; A.setMusic(save.music); persist(); $('bMusic').classList.toggle('off', !save.music); }
  function pause(on) { if (state === 'menu') return; state = on ? 'pause' : 'play'; $('pause').hidden = !on; if (on) { A.stopAll(); } setStick(0, 0); stick.id = drag.id = null; sKnob.style.transform = 'translate(0,0)'; }
  function startPlay() {
    A.resume(); try { window.focus(); } catch (e) { } state = 'play'; $('menu').hidden = true; $('hud').hidden = false; P.h = Math.PI; cam.yaw = 0; cam.pitch = .42; updateHud(); updateButtons(true); updateFriends();
    setTimeout(() => { if (state === 'play' && !kids.open) kids.daily(); }, 3500);
    if (!save.intro) say(isTouch() ? 'Links wischen = laufen · rechts wischen = Kamera drehen' : 'WASD/Pfeile = laufen · E = einsteigen · Maus ziehen = Kamera', 5200);
    else say('Hallo ' + heroName() + '! Los geht\'s ♥', 2400);
  }
  $('bStart').addEventListener('click', startPlay);
  $('bToMenu').addEventListener('click', () => { persist(); try { if (typeof net !== 'undefined' && net.close) net.close(); } catch (e) { } location.reload(); });
  $('bResume').addEventListener('click', () => pause(false)); $('bPause').addEventListener('click', () => pause(true));
  $('bNight').addEventListener('click', toggleNight); $('bSound').addEventListener('click', toggleSound); $('bMusic').addEventListener('click', toggleMusic);
  $('bNight').textContent = save.night ? '☀️' : '🌙'; $('bSound').textContent = save.sound ? '🔊' : '🔇'; $('bMusic').classList.toggle('off', !save.music);
  $('starN').textContent = save.stars;

  /* ---------- Spielzeugladen: einkaufen mit Sternen ---------- */
  const H = (id, icon, name, price) => ({ id: 'hat_' + id, icon, name, price, slot: 'hat', val: id, tab: 0 });
  const SHOP = [
    H('crown', '👑', 'Krone', 2), H('bunny', '🐰', 'Hasenohren', 2), H('bear', '🐻', 'Bärenohren', 2), H('cat', '🐱', 'Katzenohren', 2), H('cap', '🧢', 'Cap', 2),
    H('pirate', '🏴‍☠️', 'Piratenhut', 3), H('wizard', '🧙', 'Zauberhut', 3), H('chef', '🧑‍🍳', 'Kochmütze', 2), H('party', '🥳', 'Partyhut', 2), H('cowboy', '🤠', 'Cowboyhut', 3), H('helmet', '⛑️', 'Helm', 2),
    { id: 'glasses', icon: '🕶️', name: 'Sonnenbrille', price: 2, slot: 'glasses', tab: 1 }, { id: 'patch', icon: '🏴‍☠️', name: 'Augenklappe', price: 2, slot: 'patch', tab: 1 },
    { id: 'pack', icon: '🎒', name: 'Rucksack', price: 3, slot: 'pack', tab: 1 }, { id: 'teddy', icon: '🧸', name: 'Teddy', price: 3, slot: 'teddy', tab: 1 },
    { id: 'cape', icon: '🦸', name: 'Umhang', price: 3, slot: 'cape', tab: 1 }, { id: 'wings', icon: '🧚', name: 'Feenflügel', price: 3, slot: 'wings', tab: 1 },
    { id: 'kite', icon: '🪁', name: 'Drachen', price: 4, slot: 'kite', tab: 2 }, { id: 'rcheli', icon: '🚁', name: 'RC-Hubschrauber', price: 6, slot: 'rcheli', tab: 2 }
  ];
  const SHOP_TABS = ['👒 Mützen', '🎒 Zubehör', '🧸 Spielzeug']; let shopTab = 0;
  let shopOpen = false, wasInShop = false;
  const shopPanel = $('shopPanel');
  const inShop = () => !P.veh && Math.abs(P.x - SH.x) < SH.half && Math.abs(P.z - SH.z) < SH.half;
  const nearCounter = () => inShop() && Math.hypot(P.x - SH.keeper.x, P.z - (SH.keeper.z - 1.8)) < 5.2;
  const isEq = it => it.slot === 'hat' ? save.equip.hat === it.val : !!save.equip[it.slot];
  function setEq(it, on) { if (it.slot === 'hat') save.equip.hat = on ? it.val : 'none'; else save.equip[it.slot] = on; persist(); buildChar(); }
  function spawnRC(quiet, type) {
    type = type || 'rc'; const out = inShop(), sd = type === 'rcheli' ? 2.2 : 0, hx = (out ? SH.x : P.x + Math.sin(P.h) * 2.4) + Math.cos(P.h) * sd, hz = (out ? SH.z - 10 : P.z + Math.cos(P.h) * 2.4) - Math.sin(P.h) * sd; let v = vehicles.find(q => q.type === type);
    if (v) { const q = W.resolve(hx, hz, .6, {}); v.setPose(q.x, q.z, P.h); v.v = 0; if (v.spec.fly) { v.y = 0; v.vy = 0; } } else addVeh(type, hx, hz, P.h);
    if (!quiet) say(type === 'rcheli' ? '🚁 Dein RC-Hubschrauber steht bereit!' : '🏎️ Dein rotes RC-Auto steht bereit!', 1800);
  }
  function renderShop() {
    $('shopStars').textContent = '⭐ ' + save.stars; const tabs = $('shopTabs'); tabs.innerHTML = '';
    SHOP_TABS.forEach((n, i) => { const t_ = document.createElement('button'); t_.className = 'bt' + (i === shopTab ? ' sel' : ''); t_.textContent = n; t_.onclick = () => { shopTab = i; renderShop(); }; tabs.appendChild(t_); });
    const grid = $('shopGrid'); grid.innerHTML = '';
    for (const it of SHOP.filter(q => q.tab === shopTab)) {
      const owned = save.owned.includes(it.id), c = document.createElement('div'), b = document.createElement('button'); c.className = 'sc' + (owned ? ' own' : '');
      c.innerHTML = '<div class="si">' + it.icon + '</div><div class="sn">' + it.name + '</div><div class="sp">' + (owned ? '✔ gehört dir' : it.price + ' ⭐') + '</div>';
      if (!owned) { b.textContent = 'Kaufen'; b.disabled = save.stars < it.price; b.onclick = () => buyItem(it); }
      else if (it.slot === 'rcheli') { b.textContent = 'Holen'; b.onclick = () => { spawnRC(false, 'rcheli'); closeShop(); }; }
      else { b.textContent = isEq(it) ? 'Ablegen' : 'Anziehen'; b.onclick = () => { setEq(it, !isEq(it)); A.pop(); renderShop(); }; }
      c.appendChild(b); grid.appendChild(c);
    }
  }
  function buyItem(it) {
    if (save.owned.includes(it.id) || save.stars < it.price) return;
    save.stars -= it.price; save.owned.push(it.id); $('starN').textContent = save.stars; A.buy(); fx.burst(P.x, 1.6, P.z, 18, [BI.C.gold, BI.C.pink, BI.C.blue], 5, 1, 28, 6);
    if (it.slot === 'rcheli') spawnRC(true, 'rcheli'); else setEq(it, true); persist(); say('🛍️ Gekauft: ' + it.name + '!', 1800); renderShop();
  }
  function openShop() { if (!nearCounter()) return; shopOpen = true; setStick(0, 0); shopPanel.hidden = false; renderShop(); say('Frau Bunt: „Viel Spaß mit dem Spielzeug!“', 2200); }
  function closeShop() { shopOpen = false; shopPanel.hidden = true; updateButtons(true); }
  $('shopClose').addEventListener('click', closeShop);


  /* ---------- Schießbude: Spielzeug-Blaster, nur Attrappen, Herr Hannes passt auf ---------- */
  const RG = W.spots.range, rs = { ui: '', ax: 0, ay: .05, down: false, w: null, wm: null, kick: 0, fov: 0, near: false, sig: '' };
  const hannes = BI.makeChar({ shirt: 0xff7a1f, pants: 0x3d4a7a, hair: 0x6b4423, skin: 0xf3c9a0, hat: 'cap', name: 'Herr Hannes' }); hannes.group.position.set(RG.sup.x, 0, RG.sup.z); hannes.group.rotation.y = Math.PI * .8; scene.add(hannes.group);
  const RW = ['foam', 'water', 'bow'], RTXT = ['Übung macht den Meister!', 'Gut gemacht!', 'Sehr gut!', 'Spitze, ein Profi!', 'Meisterschütze!'];
  const nearRange = () => !P.veh && !build.active && Math.abs(P.x - RG.x) < 9 && P.z > -69.8 && P.z < RG.z + 6 && Math.hypot(P.x - RG.x, P.z - RG.z) < 7;
  const hannesSay = (m, d) => say('Herr Hannes: „' + m + '“', d || 2600);
  function renderRange() {
    const g = $('rangeGrid'); g.innerHTML = ''; save.rangeBest = save.rangeBest || {};
    for (const k of RW) { const w = range.WEAPONS[k], c = document.createElement('div'), b = document.createElement('button'); c.className = 'sc';
      c.innerHTML = '<div class="si">' + w.icon + '</div><div class="sn">' + w.name + '</div><div class="sp">' + (save.rangeBest[k] ? 'Rekord ' + save.rangeBest[k] : w.ammo + ' Schuss') + '</div>'; b.textContent = 'Los!'; b.onclick = () => beginRange(k); c.appendChild(b); g.appendChild(c); }
  }
  function openRange() { if (!nearRange() || rs.ui) return; rs.ui = 'pick'; setStick(0, 0); renderRange(); $('rangePanel').hidden = false; hannesSay('Hallo ' + heroName() + '! Nur auf Zielscheiben schießen!', 2800); }
  function closeRangeUi() { rs.ui = ''; $('rangePanel').hidden = true; $('rangeResult').hidden = true; updateButtons(true); }
  function rangeFov() { const a = innerWidth / innerHeight; camera.fov = clamp(2 * Math.atan(.58 / a) * 180 / Math.PI, 36, 90); camera.updateProjectionMatrix(); }
  function setWeaponMesh(key) {
    if (rs.wm && rs.wm.parent) rs.wm.parent.remove(rs.wm); rs.wm = null; if (char.remote) char.remote.visible = !key;
    if (key) { const m = range.weaponMesh(key); m.rotation.x = Math.PI / 2; m.position.set(0, -.5, 0); char.armR.add(m); rs.wm = m; }
  }
  function beginRange(key) {
    if (!nearRange() && rs.ui !== 'pick' && rs.ui !== 'result') return;
    fun.setDance(false); A.stopAll(); $('rangePanel').hidden = true; $('rangeResult').hidden = true;
    P.x = RG.x; P.z = RG.z; P.y = 0; P.vy = 0; P.h = Math.PI; P.speed = 0; rs.ui = 'play'; rs.ax = 0; rs.ay = .05; rs.kick = 0; rs.down = false;
    setWeaponMesh(key); document.body.classList.add('ranging'); $('cross').hidden = false; $('rangeHud').hidden = false; rs.sig = ''; rangeFov();
    range.start(key); updateButtons(true);
  }
  function exitRange() {
    if (!rs.ui) return; range.stop(); setWeaponMesh(null); document.body.classList.remove('ranging'); $('cross').hidden = true; $('rangeHud').hidden = true;
    char.armR.rotation.set(0, 0, 0); char.armL.rotation.set(0, 0, 0); resize(); closeRangeUi(); hannesSay('Bis bald, ' + heroName() + '!', 1800);
  }
  function rangeAim(cx, cy) { rs.ax = clamp(cx / innerWidth * 2 - 1, -.92, .92); rs.ay = clamp(-(cy / innerHeight * 2 - 1), -.92, .92); }
  function rangeShoot() {
    if (rs.ui !== 'play' || !range.running) return false; char.group.updateMatrixWorld(true);
    const mu = rs.wm ? rs.wm.localToWorld(rs.wm.userData.muz.clone()) : null;
    if (range.fire(rs.ax, rs.ay, mu)) { rs.kick = 1; return true; } return false;
  }
  range.onEvent = (k, d) => {
    if (k === 'start') hannesSay('Los geht\'s! Nur auf die Attrappen!', 2200);
    else if (k === 'hit' && range.hits % 6 === 0) { hannesSay(['Super Treffer!', 'Ins Schwarze!', 'Toll gezielt!'][(range.hits / 6) % 3 | 0], 1500); A.pop(); }
    else if (k === 'end') {
      kids.earn('shoot');
      setWeaponMesh(null); addStars(d.stars); save.rangeBest = save.rangeBest || {}; if (d.score > (save.rangeBest[d.weapon] || 0)) save.rangeBest[d.weapon] = d.score; persist();
      document.body.classList.remove('ranging'); $('cross').hidden = true; $('rangeHud').hidden = true; resize(); char.armR.rotation.set(0, 0, 0); char.armL.rotation.set(0, 0, 0);
      rs.ui = 'result'; rs.w = d.weapon; $('rrTitle').textContent = d.stars >= 3 ? '🏆 Super!' : 'Geschafft!'; $('rrText').textContent = d.score + ' Punkte · ' + RTXT[Math.min(4, d.stars)] + (d.stars ? ' +' + d.stars + ' ⭐' : '');
      $('rrStars').textContent = d.stars ? '⭐'.repeat(d.stars) : '🎯'; $('rangeResult').hidden = false; if (d.stars) { A.fanfare(); fx.burst(P.x, 2.2, P.z, 24, [BI.C.gold, BI.C.white, BI.C.pink], 5, 1.2, 28, 6); }
      hannesSay(d.stars ? 'Prima geschossen!' : 'Probier es nochmal!', 2400);
    }
  };
  $('rangeClose').addEventListener('click', closeRangeUi); $('rangeExit').addEventListener('click', exitRange);
  $('rrAgain').addEventListener('click', () => beginRange(rs.w)); $('rrWeapon').addEventListener('click', () => { $('rangeResult').hidden = true; rs.ui = 'pick'; renderRange(); $('rangePanel').hidden = false; });
  $('rrDone').addEventListener('click', exitRange);
  function updateRange(dt) {
    const px = P.veh ? P.veh.x : P.x, pz = P.veh ? P.veh.z : P.z;
    if (rs.ui || Math.hypot(px - RG.x, pz - RG.z) < 95) range.update(dt, t);
    const near = state === 'play' && !rs.ui && nearRange(); if (near !== rs.near) { rs.near = near; if (near) hannesSay('Willkommen an der Schießbude! Drück den Knopf 🎯', 3000); }
    hannes.pose(t * 1.4, 0, near); hannes.group.rotation.y = BI.damp(hannes.group.rotation.y, near ? Math.atan2(P.x - RG.sup.x, P.z - RG.sup.z) : Math.PI * .8, 4, dt);
    const hide = rs.ui === 'play'; if (hide !== rs.hid) { rs.hid = hide; pap.group.visible = !hide; str.visible = !hide; char.group.traverse(o => { if (o.isSprite) o.visible = !hide; }); }
    if (hide) { pap.group.visible = false; str.visible = false; }
    if (rs.ui === 'play') {
      const sp = dt * 1.6; rs.ax = clamp(rs.ax + ((keys.r ? 1 : 0) - (keys.l ? 1 : 0)) * sp, -.92, .92); rs.ay = clamp(rs.ay + ((keys.u ? 1 : 0) - (keys.d ? 1 : 0)) * sp, -.92, .92);
      if (rs.down && range.weapon && range.weapon.key === 'water') rangeShoot();
      const c = $('cross'), sg = rs.ax.toFixed(3) + rs.ay.toFixed(3); if (sg !== rs.sig) { rs.sig = sg; c.style.transform = 'translate(' + ((rs.ax + 1) / 2 * innerWidth).toFixed(1) + 'px,' + ((1 - rs.ay) / 2 * innerHeight).toFixed(1) + 'px)'; }
      const tx = '🎯 ' + range.score + '   ' + (range.weapon ? range.weapon.icon : '') + ' ' + range.ammo + '   ⏱ ' + Math.ceil(range.time); if (tx !== rs.txt) { rs.txt = tx; $('rangeTxt').textContent = tx; }
      rs.kick = Math.max(0, rs.kick - dt * 5); const g = char.group; g.position.set(P.x, 0, P.z); g.rotation.set(0, Math.PI - rs.ax * .35, 0);
      char.pose(0, 0, false); char.armR.rotation.set(-1.45 - rs.kick * .22 + rs.ay * .25, 0, -.05); char.armL.rotation.set(-1.1, 0, .35);
    }
  }

  /* ---------- Mitspielen (WebRTC): Freunde in derselben Welt ---------- */
  const ICONS = ['🐶', '🐱', '🦁', '🐼', '🦄', '🐸', '🐯', '🐵'], remote = new Map(), mpEl = $('mpPanel');
  let mpOpen = false, mpFrom = 'menu', mpView = 'choose', joinCode = '', netT = 0, lookSig = '', lookN = 0;
  const myName = () => (save.mpIcon || '🐶') + ' ' + heroName();
  const myLook = () => ({ hero: save.hero, shirt: save.shirt, hat: save.hat, eq: save.equip, cu: save.cu, n: myName(), pk: save.pet });
  const charFor = l => BI.makeChar(charOpts(l, l.n));
  const freeObj = o => { o.traverse(m => { if (m.geometry) m.geometry.dispose(); if (m.isSprite && m.material.map) m.material.map.dispose(); }); if (o.parent) o.parent.remove(o); };
  function dropAvatar(av) { if (av.char) freeObj(av.char.group); if (av.gv) freeObj(av.gv.root); if (av.pet) freeObj(av.pet.d.group); }
  function updateFriends() { if (typeof updateFlats === 'function') updateFlats(); const n = net.count(), on = net.connected(); if ($('emo')) { $('emo').hidden = !(on && state === 'play'); if (!on) $('emoRow').hidden = true; } $('friends').hidden = !(on && state === 'play'); $('friendsN').textContent = n; }
  const mpSay = m => { const el = $('mpStatus'); el.textContent = m || ''; el.classList.remove('err'); };
  const mpErr = m => { const el = $('mpStatus'); el.textContent = m; el.classList.add('err'); };
  function mpShow(v) {
    mpView = v; for (const e of mpEl.querySelectorAll('[data-m]')) e.hidden = e.dataset.m !== v;
    $('mpStop').hidden = !net.role; $('mpBack').textContent = v === 'on' || (v === 'host' && net.role) ? '▶ Weiter spielen' : '‹ Zurück';
    if (v === 'on') renderMp(); if (v === 'join') renderJoin();
  }
  function renderMp() {
    if (mpView !== 'on' && mpView !== 'host') return; const list = $('mpPlayers'); list.innerHTML = '';
    { const s = document.createElement('span'); s.className = 'mpp'; s.textContent = myName() + ' (du)'; list.appendChild(s); }
    for (const a of remote.values()) { const s = document.createElement('span'); s.className = 'mpp'; s.textContent = a.name + ' '; const b = document.createElement('button'); b.className = 'pill'; b.textContent = '🏠 Besuchen'; b.style.cssText = 'padding:2px 10px;font-size:13px'; b.onclick = () => visitFlat(a.id); s.appendChild(b); list.appendChild(s); }
    $('mpOnTxt').textContent = net.role === 'host' ? 'Dein Spiel läuft – Freunde können jederzeit beitreten:' : 'Du spielst in der Welt deines Freundes:'; $('mpOnCode').textContent = net.role === 'host' ? 'Code ' + net.code : '';
  }
  function renderJoin() { $('mpJoinCode').textContent = (joinCode + '····').slice(0, 4).split('').join(''); }
  function openMp(from, view) {
    if (save.mpOff) { say('👪 Mitspielen ist von den Eltern ausgeschaltet', 3000); return; }
    mpFrom = from; mpOpen = true; setStick(0, 0); mpEl.hidden = false; mpSay(''); if (from === 'menu') $('menu').hidden = true;
    const ic = $('mpIcons'); ic.innerHTML = ''; ICONS.forEach(i => { const b = document.createElement('button'); b.className = 'pill' + (save.mpIcon === i ? ' sel' : ''); b.textContent = i; b.setAttribute('aria-label', 'Tier ' + i); b.onclick = () => { save.mpIcon = i; persist(); [...ic.children].forEach(x => x.classList.toggle('sel', x === b)); }; ic.appendChild(b); });
    mpShow(view || (net.role ? 'on' : 'choose'));
  }
  function closeMp() { mpOpen = false; mpEl.hidden = true; if (mpFrom === 'menu' && state === 'menu') $('menu').hidden = false; updateFriends(); updateButtons(true); }
  function mpBack() { if (mpView === 'on' || mpView === 'choose' || (mpView === 'host' && net.role)) closeMp(); else if (net.role && net.connected()) mpShow('on'); else { if (net.role) net.close(true); mpShow('choose'); mpSay(''); } }
  async function mpHost() {
    mpShow('host'); mpSay('Einen Moment … 🌐'); $('mpCode').textContent = '····'; $('mpQr').innerHTML = '';
    try {
      const code = await net.host(); $('mpCode').textContent = code.split('').join(''); mpSay('Warte auf Freunde … 👀'); $('mpStop').hidden = false; $('mpBack').textContent = '▶ Weiter spielen';
      net.loadQR().then(() => { const q = qrcode(0, 'M'); q.addData(net.link()); q.make(); $('mpQr').innerHTML = '<img alt="QR-Code" src="' + q.createDataURL(5, 0) + '" style="image-rendering:pixelated">'; }).catch(() => { });
    } catch (e) { mpShow('choose'); mpErr('Keine Verbindung möglich – ist das Internet an? 🌐'); }
  }
  async function mpJoinGo() {
    if (joinCode.length !== 4) { mpErr('Der Code hat 4 Zeichen 🙂'); return; }
    mpSay('Verbinde … 🔌');
    try { await net.join(joinCode); mpShow('on'); mpSay(''); }
    catch (e) { mpErr(e.message === 'nocode' ? 'Diesen Code gibt es nicht 🤔' : e.message === 'timeout' ? 'Das hat zu lange gedauert. Nochmal versuchen?' : 'Keine Verbindung möglich 🌐'); }
  }
  const PAD = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'.split('');
  { const pad = $('mpPad'); for (const ch of PAD) { const b = document.createElement('button'); b.textContent = ch; b.onclick = () => { if (joinCode.length < 4) { joinCode += ch; renderJoin(); } }; pad.appendChild(b); }
    const del = document.createElement('button'); del.className = 'wide'; del.textContent = '⌫'; del.onclick = () => { joinCode = joinCode.slice(0, -1); renderJoin(); }; pad.appendChild(del);
    const go = document.createElement('button'); go.className = 'go'; go.textContent = 'Los! ▶'; go.onclick = mpJoinGo; pad.appendChild(go); }
  $('mpHost').addEventListener('click', mpHost); $('mpJoin').addEventListener('click', () => { joinCode = ''; mpSay(''); mpShow('join'); });
  $('mpBack').addEventListener('click', mpBack); $('mpStop').addEventListener('click', () => { net.close(); mpShow('choose'); mpSay('Verbindung beendet.'); });
  $('mpCopy').addEventListener('click', () => { try { navigator.clipboard.writeText(net.link()); mpSay('Link kopiert! 📋'); } catch (e) { mpSay(net.link()); } });
  $('bMulti').addEventListener('click', () => openMp('menu')); $('bFriendsP').addEventListener('click', () => openMp('pause')); $('friends').addEventListener('click', () => openMp('play'));
  const net = BI.createNet({
    onMsg: d => {
      if (d.t === 'full') { net.close(true); mpShow('choose'); mpErr('Das Spiel ist leider voll 😅'); return; }
      if (d.t === 'bye') { const a = remote.get(d.id); if (a) { dropAvatar(a); remote.delete(d.id); say(a.name + ' ist gegangen 👋', 2200); updateFriends(); renderMp(); } return; }
      if (d.t === 'e') { const a = remote.get(d.id); if (a && EMOJIS.includes(d.e)) { showEmoji(d.e, a); A.pop(); if (d.e === '🙌') { a.hf = performance.now(); if (a.hf - lastHF < 2600 && Math.hypot(a.x - P.x, a.z - P.z) < 6) highFive(a); } } return; }
      if (d.t === 'p') { const a = remote.get(d.id); if (a && typeof d.x === 'number' && typeof d.z === 'number') startParty(d.x, d.z, a.name, false); return; }
      if (d.t === 'n') { const a = remote.get(d.id); if (a) kids.play(d.i | 0, (d.k | 0) & 7, a); return; }
      if (d.t === 'b') { build.applyRemote(d.o || d.id, d); return; }
      if (d.t === 'g') { applyGame(d.op === 'cnt' ? Object.assign({}, d) : d); return; }
      if (d.t !== 's') return;
      let a = remote.get(d.id);
      if (!a) {
        a = { id: d.id, char: null, gv: null, x: d.x, z: d.z, y: d.y || 0, h: d.h || 0, tx: d.x, tz: d.z, ty: d.y || 0, th: d.h || 0, sp: 0, a: 0, v: '', phase: Math.random() * 6, look: '', name: 'Freund' }; remote.set(d.id, a);
        if (net.role === 'guest' && !P.veh) { const q = W.resolve(d.x + 2, d.z + 2, .5, {}); P.x = q.x; P.z = q.z; }
      }
      if (d.l && JSON.stringify(d.l) !== a.look) { a.look = JSON.stringify(d.l); const pk = d.l.pk || 'blitz'; if (a.pet && a.pet.k !== pk) { freeObj(a.pet.d.group); a.pet = null; } if (!a.pet) { a.pet = { k: pk, d: BI.makePet(pk), x: a.x - 1.5, z: a.z - 1, h: 0, ph: 0 }; scene.add(a.pet.d.group); } if (a.char) freeObj(a.char.group); a.char = charFor(d.l); a.char.group.position.set(a.x, a.y, a.z); scene.add(a.char.group); const first = a.name === 'Freund'; a.name = d.l.n || 'Freund'; if (first) { kids.earn('friend'); say(a.name + ' ist dabei! 🎉', 2600); fx.burst(a.x, 2, a.z, 20, [BI.C.gold, BI.C.pink, BI.C.blue], 5, 1, 28, 6); A.fanfare(); } updateFriends(); renderMp(); }
      a.tx = d.x; a.tz = d.z; a.ty = d.y || 0; a.th = d.h || 0; a.sp = d.sp || 0; a.a = d.a || 0; a.v = d.v || ''; a.vy = d.vy || 0;
    },
    onJoin: id => { lookSig = ''; netT = 0; updateFriends(); shareBuild(id); if (mpOpen && net.role === 'host' && mpView === 'host') mpShow('on'); if (net.role === 'guest') { say('Verbunden! 🎉', 2000); } },
    onLeave: id => { build.dropOwner(id); const a = remote.get(id); if (a) { dropAvatar(a); remote.delete(id); say(a.name + ' ist gegangen 👋', 2200); } updateFriends(); renderMp(); },
    onClosed: () => { build.dropOwner(null); for (const a of remote.values()) dropAvatar(a); remote.clear(); updateFriends(); if (mpOpen && mpView === 'on') { mpShow('choose'); mpSay('Verbindung beendet.'); } },
    onStatus: m => mpSay(m)
  });
  { const m = /join=([A-Za-z0-9]{4})/.exec(location.hash || ''); if (m) { joinCode = net.normCode(m[1]); try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { } setTimeout(() => { openMp('menu', 'join'); mpJoinGo(); }, 400); } }
  function sendNet(dt) {
    if (!net.connected() || state !== 'play') return; const nw = performance.now(); if (nw - netT < 100) return; netT = nw;
    const v = P.veh && !P.veh.spec.remote ? P.veh : null, tr = v && v.isTrain, o = v && !tr ? v : null, r1 = n => Math.round(n * 100) / 100;
    const d = { t: 's', x: r1(o ? o.x : tr ? train.cars[0].x : P.x), z: r1(o ? o.z : tr ? train.cars[0].z : P.z), y: r1(o ? o.y || 0 : tr ? .6 : P.y), h: r1(o ? o.h : tr ? train.cars[0].h : P.h), sp: r1(o ? o.v : P.speed), v: o ? o.type : '', a: sl.t >= 0 && sl.t > 1.1 && sl.t < 3.7 ? 5 : rs.ui === 'play' ? 3 : fun.dancing ? 1 : P.wave > 0 ? 2 : P.punchT > 0 ? 4 : 0 };
    const sg = JSON.stringify(myLook()); if (sg !== lookSig || ++lookN > 40) { lookSig = sg; lookN = 0; d.l = myLook(); }
    net.send(d);
  }
  function updateRemote(dt) {
    for (const a of remote.values()) {
      if (Math.hypot(a.tx - a.x, a.tz - a.z) > 25) { a.x = a.tx; a.z = a.tz; }
      a.x = BI.damp(a.x, a.tx, 12, dt); a.z = BI.damp(a.z, a.tz, 12, dt); a.y = BI.damp(a.y, a.ty, 12, dt); a.h += BI.angDiff(a.h, a.th) * Math.min(1, dt * 10);
      if (a.gv && a.gv.type !== a.v) { freeObj(a.gv.root); a.gv = null; }
      if (a.v && !a.gv) { const v = new BI.Vehicle(a.v, a.x, a.z, a.h, {}); v.type = a.v; scene.add(v.root); a.gv = v; }
      if (a.pet) { /* Haustier des Freundes folgt ihm (läuft auf jedem Gerät selbst) */
        const pt = a.pet, bx = a.x - Math.sin(a.h) * 2.4 + Math.cos(a.h), bz = a.z - Math.cos(a.h) * 2.4 - Math.sin(a.h), pd = Math.hypot(bx - pt.x, bz - pt.z); let sp = 0;
        if (pd > 45) { pt.x = bx; pt.z = bz; } else if (!a.v) sp = pd > 1 ? Math.min(8.5, 1.5 + pd * 2.4) : 0;
        if (sp > 0) { pt.h += BI.angDiff(pt.h, Math.atan2(bx - pt.x, bz - pt.z)) * Math.min(1, dt * 10); pt.x += Math.sin(pt.h) * sp * dt; pt.z += Math.cos(pt.h) * sp * dt; } else pt.h += BI.angDiff(pt.h, Math.atan2(a.x - pt.x, a.z - pt.z)) * Math.min(1, dt * 4);
        pt.ph += dt * (sp > .3 ? 6 + sp * 1.2 : 2); pt.d.group.position.set(pt.x, W.groundY(pt.x, pt.z), pt.z); pt.d.group.rotation.y = pt.h; pt.d.pose(pt.ph, sp > .3 ? Math.min(.85, sp * .12) : 0, sp === 0);
      }
      const inV = !!a.v && !!a.gv; if (a.char) a.char.group.visible = !inV;
      if (inV) { a.gv.root.visible = true; a.gv.setPose(a.x, a.z, a.h); a.gv.y = a.y; a.gv.v = a.sp; a.gv.visual(dt, t, null); }
      else if (a.char) {
        const c = a.char, g = c.group; g.position.set(a.x, a.y, a.z); g.rotation.set(0, a.h, 0); a.phase += dt * (6 + a.sp * 1.2);
        if (a.a === 1) { c.dance(t, 0); g.position.y += Math.abs(Math.sin(t * 8)) * .18; } else if (a.a === 4) c.punch((t * 2.5) % 1);
        else if (a.a === 3) { c.pose(0, 0, false); c.armR.rotation.set(-1.45, 0, 0); } else if (a.a === 5) { c.pose(0, 0, false); g.rotation.set(-Math.PI / 2, 0, 0); } else c.pose(a.phase, a.sp > .3 ? Math.min(1.1, a.sp * .17) : 0, a.a === 2);
      }
    }
  }

  /* ---------- Mitspiel-Extras: Zurufe, Abklatschen, gemeinsames Bauen, Fangen, Sterne-Wettlauf ---------- */
  const EMOJIS = ['❤️', '😂', '👍', '🎉', '🙌', '🐾'], emoSp = {}, emos = []; let lastHF = 0, gm = null;
  function emoSprite(e) {
    if (!emoSp[e]) { const cv = document.createElement('canvas'); cv.width = cv.height = 96; const c = cv.getContext('2d'); c.font = '64px system-ui, "Apple Color Emoji", "Segoe UI Emoji", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(e, 48, 54); emoSp[e] = new THREE.CanvasTexture(cv); }
    return emoSp[e];
  }
  function showEmoji(e, av) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: emoSprite(e), transparent: true, depthWrite: false })); sp.scale.set(1.3, 1.3, 1); scene.add(sp); emos.push({ sp, av, t: 0 }); }
  function updateEmojis(dt) {
    for (let i = emos.length - 1; i >= 0; i--) { const q = emos[i]; q.t += dt; const a = q.av, x = a ? a.x : P.veh ? P.veh.x : P.x, z = a ? a.z : P.veh ? P.veh.z : P.z, y = (a ? (a.y || 0) + (a.up || 0) : P.veh ? 0 : P.y) + 2.9 + q.t * .5; q.sp.position.set(x, y, z); q.sp.material.opacity = Math.min(1, (2.4 - q.t) * 2); q.sp.scale.setScalar(1.1 + Math.sin(Math.min(q.t, .4) / .4 * Math.PI) * .5); if (q.t > 2.4) { scene.remove(q.sp); q.sp.material.dispose(); emos.splice(i, 1); } }
  }
  function highFive(a) {
    const now = performance.now(); if (now - (a.hfDone || 0) < 6000) return; a.hfDone = now; addStars(1); A.star(); A.fanfare(); const px = P.veh ? P.veh.x : P.x, pz = P.veh ? P.veh.z : P.z;
    fx.burst((px + a.x) / 2, 2.3, (pz + a.z) / 2, 24, [BI.C.gold, BI.C.white, BI.C.pink], 5, 1.2, 30, 6); say('🙌 Abklatschen mit ' + a.name + '! +1 ⭐', 2600);
  }
  /* ---- Besuch in der Wohnung eines Freundes + Geburtstagsparty ---- */
  function visitFlat(id) {
    if (P.veh || sl.t >= 0) { say('Steig erst aus 🙂', 1800); return; } const f = flats[slotOf(id)], a = remote.get(id); closeMp(); fx.burst(P.x, 1.2, P.z, 14, [BI.C.white, BI.C.blue], 4, 1, 28, 4);
    P.x = f.door.x; P.z = f.door.z + 1.2; P.y = 0; P.h = Math.PI; cam.yaw = 0; A.fanfare(); say('🏠 Zu Besuch bei ' + (a ? a.name : 'deinem Freund') + '!', 2600); kids.earn('visit');
  }
  const parties = []; let partyCd = 0;
  function startParty(x, z, who, mine) {
    const b = new BI.Batch(); b.cyl(0, 0, 0, .7, .7, .5, 0xffc4dc, 14); b.cyl(0, .5, 0, .5, .5, .4, 0xfff0b0, 14); b.sph(0, .98, 0, .12, 0xff5a5a, 1); for (let k = 0; k < 3; k++) { const a = k * 2.1; b.box(Math.sin(a) * .25, .9, Math.cos(a) * .25, .05, .3, .05, 0x4da3ff); b.sph(Math.sin(a) * .25, 1.25, Math.cos(a) * .25, .06, 0xffd23f, 0); }
    const g = new THREE.Group(), me = b.mesh(BI.mat()); g.add(me); g.position.set(x + 1.2, .6, z); scene.add(g);
    const near = !P.veh && Math.hypot(P.x - x, P.z - z) < 14; parties.push({ g, x, z, t: 14, c: 0, near, own: !!mine });
    A.fanfare(); say('🎂 ' + (mine ? 'Du feierst Geburtstag! Alle kommen zur Party!' : who + ' feiert Geburtstag! Komm zur Party!'), 3600);
    if (near) { addStars(2); kids.earn('party'); fun.setDance(true); }
  }
  function updateParties(dt) {
    partyCd = Math.max(0, partyCd - dt);
    for (let i = parties.length - 1; i >= 0; i--) { const p = parties[i]; p.t -= dt; p.c -= dt; p.g.rotation.y += dt; if (p.c <= 0) { p.c = .7; fx.burst(p.x, 2.6, p.z, 14, [BI.C.gold, BI.C.pink, BI.C.blue, BI.C.white], 4, 1.5, 34, 5); }
      if (p.t <= 0) { scene.remove(p.g); freeObj(p.g); if (p.near && !P.veh) fun.setDance(false); parties.splice(i, 1); } }
  }
  function sendParty() {
    if (!net.connected()) return; if (partyCd > 0) { say('🎂 Die nächste Party gibt es gleich wieder!', 2000); return; } partyCd = 30; const px = P.veh ? P.veh.x : P.x, pz = P.veh ? P.veh.z : P.z; startParty(px, pz, '', true); net.send({ t: 'p', x: px, z: pz });
  }
  function sendEmoji(e) {
    if (!net.connected()) return; A.pop(); showEmoji(e, null); net.send({ t: 'e', e });
    if (e === '🙌') { lastHF = performance.now(); for (const a of remote.values()) if (a.hf && lastHF - a.hf < 2600 && Math.hypot(a.x - P.x, a.z - P.z) < 6) highFive(a); }
  }
  { const row = $('emoRow'); EMOJIS.forEach(e => { const b = document.createElement('button'); b.textContent = e; b.onclick = () => { sendEmoji(e); }; row.appendChild(b); }); const pb = document.createElement('button'); pb.textContent = '🎂'; pb.setAttribute('aria-label', 'Geburtstagsparty'); pb.onclick = () => { row.hidden = true; sendParty(); }; row.appendChild(pb); const g = document.createElement('button'); g.textContent = '🎮'; g.setAttribute('aria-label', 'Spiele'); g.onclick = () => { row.hidden = true; openGames(); }; row.appendChild(g);
    $('emoBtn').addEventListener('click', ev => { ev.stopPropagation(); A.resume(); row.hidden = !row.hidden; }); $('emo').addEventListener('pointerdown', ev => ev.stopPropagation()); }
  /* ---- gemeinsames Bauen ---- */
  build.onOp = op => { if (op.op === 'a') kids.earn('build'); if (net.connected()) net.send(Object.assign({ t: 'b' }, op)); };
  function shareBuild(toId) {
    const mine = { t: 'b', op: 'l', o: selfId(), l: build.exportMine() };
    if (net.role === 'host') { if (toId) { net.sendTo(toId, mine); for (const o of build.owners()) net.sendTo(toId, { t: 'b', op: 'l', o, l: build.exportOwner(o) }); } } else net.send(mine);
  }
  /* ---- Spiele (Mini-Spiele 2D, Schatzsuche, Verstecken, Fangen, Sterne-Wettlauf) ---- */
  const mini = BI.createMini({ A }), MG = mini.GAMES, TAUV = Math.PI * 2, QUIZ = ['count', 'colors', 'animals'];
  const GDEF = Object.keys(MG).map(k => Object.assign({ k, solo: true, multi: true, mini: true }, MG[k])).concat([
    { k: 'treasure', icon: '🗺️', name: 'Schatzsuche', help: 'Irgendwo ist ein Schatz vergraben. „Heiß“ heißt nah dran, „kalt“ heißt weit weg!', solo: true, multi: true, dur: 240 },
    { k: 'hide', icon: '🙈', name: 'Verstecken', help: 'Einer sucht, die anderen verstecken sich. Wer nicht gefunden wird, gewinnt!', solo: false, multi: true, dur: 150 },
    { k: 'tag', icon: '🏃', name: 'Fangen', help: 'Wer „dran“ ist, fängt die anderen. Wer am kürzesten dran war, gewinnt!', solo: false, multi: true, dur: 90 },
    { k: 'stars', icon: '⭐', name: 'Sterne-Wettlauf', help: 'Wer sammelt in 100 Sekunden die meisten Sterne?', solo: false, multi: true, dur: 100 }]);
  const gdef = k => GDEF.find(q => q.k === k), gmNames = id => id === selfId() ? 'Du' : (remote.get(id) ? remote.get(id).name : 'Freund');
  let chestM = null, itMark = null, gamesOpen = false, hideShown = false;
  const gamesPanel = $('gamesPanel');
  function renderGames() {
    const box = $('gamesGrid'); box.innerHTML = ''; save.mini = save.mini || {}; const on = net.connected();
    for (const d of GDEF) {
      const c = document.createElement('div'), row = document.createElement('div'); c.className = 'sc gc'; row.className = 'gb';
      c.innerHTML = '<div class="si">' + d.icon + '</div><div class="sn">' + d.name + '</div><div class="gh">' + d.help + '</div>' + (save.mini[d.k] ? '<div class="sp">Rekord ' + save.mini[d.k] + '</div>' : '');
      if (d.solo) { const b = document.createElement('button'); b.textContent = '👤 Allein'; b.onclick = () => { closeGames(); startGame(d.k, true); }; row.appendChild(b); }
      const b2 = document.createElement('button'); b2.textContent = '👥 Mit Freunden'; b2.disabled = !on; b2.onclick = () => { closeGames(); startGame(d.k, false); }; row.appendChild(b2); c.appendChild(row); box.appendChild(c);
    }
    $('gamesHint').textContent = on ? 'Du bist mit ' + (net.count() - 1) + ' Freund(en) verbunden 🎉' : 'Mit Freunden spielen: erst unter 👥 Mitspielen verbinden.';
  }
  function openGames() { if (state !== 'play' || mini.active || gm) return; gamesOpen = true; setStick(0, 0); renderGames(); gamesPanel.hidden = false; }
  function closeGames() { gamesOpen = false; gamesPanel.hidden = true; updateButtons(true); }
  $('gamesClose').addEventListener('click', closeGames); $('mpGames').addEventListener('click', () => { closeMp(); openGames(); });
  function treasureSpot(seed) { const r = BI.rng(seed); for (let k = 0; k < 120; k++) { const a = r() * TAUV, d = 30 + r() * 100, x = Math.sin(a) * d, z = Math.cos(a) * d; if (W.free(x, z, 2.5) && !W.onRoad(x, z) && !(x > FB.x0 - 6 && x < FB.x1 + 6 && z > FB.zB - 6 && z < FB.zF + 8)) return { x, z }; } return { x: 20, z: 60 }; }
  function mkChest() { const b = new BI.Batch(); b.box(0, 0, 0, 1.2, .6, .8, 0x8a5a33); b.box(0, .6, 0, 1.25, .25, .85, 0xb98650); b.box(0, .3, .42, .2, .22, .06, 0xffd23f); b.box(-.5, 0, 0, .1, .8, .9, 0xffd23f); b.box(.5, 0, 0, .1, .8, .9, 0xffd23f); const m = b.mesh(BI.mat()); m.visible = false; scene.add(m); return m; }
  function runMini(g) {
    const multi = !g.solo; mini.others = () => multi ? [...remote.keys()].map(id => gmNames(id).split(' ')[0] + ' ' + (g.cnt[id] || 0)).join('  ·  ') : '';
    mini.onScore = multi ? n => { g.cnt[selfId()] = n; net.send({ t: 'g', op: 'cnt', k: g.k, n }); } : null; mini.onEnd = r => endMini(r); fun.setDance(false); A.stopAll(); closeMp(); $('mgExit').hidden = false;
    mini.start(g.k, g.seed, g.dur / 1000); $('emo').hidden = true;
  }
  function endMini(r) {
    if (!gm) return; const g = gm, me = selfId(); mini.stop(); $('mgExit').hidden = true; updateFriends(); updateButtons(true);
    if (g.solo) { gm = null; soloResult(g.k, r.score); return; }
    g.cnt[me] = r.score; g.fin[me] = true; g.waitUntil = performance.now() + 6000; net.send({ t: 'g', op: 'cnt', k: g.k, n: r.score, fin: true }); say('Warte auf deine Freunde … ⏳', 2500);
  }
  $('mgExit').addEventListener('click', () => { if (!mini.active) return; const r = { score: mini.score }; if (gm && gm.solo) { mini.stop(); gm = null; $('mgExit').hidden = true; updateButtons(true); } else endMini(r); });
  function soloResult(k, score) {
    kids.earn('mini'); if (QUIZ.includes(k)) kids.earn('quiz'); const d = gdef(k); save.mini = save.mini || {}; const rec = score > (save.mini[k] || 0); if (rec) save.mini[k] = score; const stars = Math.min(5, 1 + Math.floor(score / (d.goal || 20))); addStars(stars); persist(); A.fanfare();
    $('grTitle').textContent = rec ? '🏆 Neuer Rekord!' : 'Geschafft!'; $('grText').textContent = d.name + ': ' + score + ' Punkte  +' + stars + ' ⭐'; $('grList').innerHTML = ''; $('gameRes').hidden = false; mpOpen = true;
  }
  function startGame(k, solo) {
    const def = gdef(k); if (!def) return; if (gm || mini.active) { say('Es läuft schon ein Spiel!', 2000); return; }
    if (!solo && !net.connected()) { say('Dafür brauchst du Mitspieler 👥', 2000); return; } if (P.veh) { say('Steig erst aus 🚪', 1800); return; }
    const ids = [selfId()].concat([...remote.keys()]); const d = { t: 'g', op: 'start', k, seed: (Math.random() * 1e9) | 0, it: ids[(Math.random() * ids.length) | 0], dur: def.dur };
    applyGame(d, !!solo); if (!solo) net.send(d);
  }
  function applyGame(d, solo) {
    const now = performance.now(), me = selfId();
    if (d.op === 'start') {
      const def = gdef(d.k); if (gm || !def) return; gm = { k: d.k, solo: !!solo, seed: d.seed, t0: now, dur: (d.dur || def.dur) * 1000, it: d.it, n: 0, since: now, itTime: {}, cnt: {}, fin: {}, imm: {}, found: {}, phase: d.k === 'hide' ? 'count' : '', ph0: now, done: false };
      closeMp(); closeGames(); $('emoRow').hidden = true; A.fanfare();
      if (def.mini) { runMini(gm); return; }
      if (gm.k === 'tag') say(gm.it === me ? '🏃 Du bist dran! Fang einen Freund!' : '🏃 Fangen! ' + gmNames(gm.it) + ' ist dran – lauf weg!', 3600);
      else if (gm.k === 'stars') say('⭐ Sterne-Wettlauf! Sammle die meisten Sterne!', 3600);
      else if (gm.k === 'treasure') { gm.spot = treasureSpot(gm.seed); if (!chestM) chestM = mkChest(); chestM.position.set(gm.spot.x, 0, gm.spot.z); chestM.visible = false; say('🗺️ Schatzsuche! Suche den versteckten Schatz – heiß = nah!', 4000); }
      else if (gm.k === 'hide') { if (gm.it === me) { fadeEl.classList.add('on'); fadeEl.firstElementChild.textContent = '🙈'; say('🙈 Du suchst! Die anderen verstecken sich – ich zähle bis 20 …', 4000); } else say('🙈 Versteck dich! ' + gmNames(gm.it) + ' zählt bis 20 …', 4000); }
      return;
    }
    if (!gm || gm.k !== d.k) return;
    if (d.op === 'tag' && gm.k === 'tag' && d.n > gm.n) { gm.itTime[gm.it] = (gm.itTime[gm.it] || 0) + now - gm.since; gm.it = d.to; gm.since = now; gm.n = d.n; gm.imm[d.from] = now + 3000; gm.imm[d.to] = now + 3000; A.pop(); if (d.to === me) say('😱 ' + gmNames(d.from) + ' hat dich gefangen – jetzt bist du dran!', 2600); else if (d.from === me) say('✅ Gefangen! Lauf weg!', 2000); }
    else if (d.op === 'cnt') { gm.cnt[d.id] = d.n; if (d.fin) gm.fin[d.id] = true; }
    else if (d.op === 'found') { if (gm.k === 'treasure') { gm.winner = d.id; gm.done = true; } else if (gm.k === 'hide') { const w = d.who || d.id; if (!gm.found[w]) { gm.found[w] = now; A.pop(); say(w === me ? '😮 Du wurdest gefunden!' : '✅ ' + gmNames(w) + ' wurde gefunden!', 2200); } } }
  }
  function finishGame() {
    const g = gm; gm = null; $('gameBar').hidden = true; if (chestM) chestM.visible = false; fadeEl.classList.remove('on'); fadeEl.firstElementChild.textContent = '💤'; const now = performance.now(), me = selfId(), def = gdef(g.k);
    const ids = [me].concat([...remote.keys()]); let rows = [], title = 'Geschafft!', sub = def.name, bonus = 1, win = null; kids.earn('mini'); if (QUIZ.includes(g.k)) kids.earn('quiz'); if (g.k === 'treasure' && g.winner === me) kids.earn('treasure');
    if (g.k === 'tag') { g.itTime[g.it] = (g.itTime[g.it] || 0) + now - g.since; rows = ids.map(id => ({ id, v: (g.itTime[id] || 0) / 1000, s: ((g.itTime[id] || 0) / 1000).toFixed(1) + ' s' })).sort((a, b) => a.v - b.v); sub = 'Fangen – wer war am kürzesten dran?'; }
    else if (g.k === 'treasure') { if (g.winner) { const w = g.winner; rows = [{ id: w, s: '🗺️ Schatz gefunden!' }].concat(ids.filter(id => id !== w).map(id => ({ id, s: '' }))); sub = (w === me ? 'Du hast' : gmNames(w) + ' hat') + ' den Schatz gefunden!'; } else { rows = ids.map(id => ({ id, s: '' })); sub = 'Der Schatz wurde nicht gefunden – nächstes Mal klappt es!'; } }
    else if (g.k === 'hide') { const hiders = ids.filter(id => id !== g.it), nf = hiders.filter(id => g.found[id]).length, seekStart = g.ph0, surv = id => ((g.found[id] || now) - seekStart) / 1000; rows = [{ id: g.it, s: '🔍 Sucher: ' + nf + ' von ' + hiders.length + ' gefunden', v: nf === hiders.length ? 1e9 : -1 }].concat(hiders.map(id => ({ id, s: g.found[id] ? '🙈 gefunden nach ' + surv(id).toFixed(0) + ' s' : '🏆 nicht gefunden!', v: g.found[id] ? surv(id) : 1e8 }))).sort((a, b) => b.v - a.v); sub = 'Verstecken'; }
    else { rows = ids.map(id => ({ id, v: g.cnt[id] || 0, s: (g.cnt[id] || 0) + (g.k === 'stars' ? ' ⭐' : ' Punkte') })).sort((a, b) => b.v - a.v); }
    if (!g.solo) { win = rows[0]; if (g.k === 'treasure' && !g.winner) win = null; } const mine = rows.findIndex(r => r.id === me); if (win && mine === 0) { bonus = 5; title = '🏆 Gewonnen!'; }
    if (g.k === 'treasure' && g.solo) { bonus = g.winner ? Math.min(5, 3 + Math.floor(Math.max(0, g.dur - (now - g.t0)) / 60000)) : 1; title = g.winner ? '🏆 Schatz gefunden!' : 'Geschafft!'; rows = []; }
    $('grTitle').textContent = title; $('grText').textContent = sub + '  +' + bonus + ' ⭐'; const list = $('grList'); list.innerHTML = '';
    rows.forEach((r, i) => { const d = document.createElement('div'); d.className = 'grr' + (r.id === me ? ' me' : ''); d.innerHTML = '<span>' + ['🥇', '🥈', '🥉', '4️⃣'][i] + '</span><span>' + gmNames(r.id) + '</span><span>' + r.s + '</span>'; list.appendChild(d); });
    addStars(bonus); A.fanfare(); fx.burst(P.x, 2.4, P.z, 26, [BI.C.gold, BI.C.white, BI.C.pink], 5, 1.2, 30, 6); $('gameRes').hidden = false; mpOpen = true;
  }
  $('grOk').addEventListener('click', () => { $('gameRes').hidden = true; mpOpen = false; updateButtons(true); });
  let gmTick = 0;
  function updateGame(dt) {
    if (!itMark) { itMark = new THREE.Sprite(new THREE.SpriteMaterial({ map: emoSprite('🔴'), transparent: true, depthWrite: false })); itMark.scale.set(1, 1, 1); itMark.visible = false; scene.add(itMark); }
    if (!gm || gm.k !== 'tag') { itMark.visible = false; } else { const a = remote.get(gm.it), mm = gm.it === selfId(); itMark.visible = !!(a || mm); if (a || mm) itMark.position.set(a ? a.x : P.veh ? P.veh.x : P.x, (a ? a.y : P.y) + 3.4 + Math.sin(t * 6) * .12, a ? a.z : P.veh ? P.veh.z : P.z); }
    if (!gm) return; const now = performance.now(), me = selfId(), def = gdef(gm.k);
    if (!gm.solo && !net.connected()) { if (mini.active) mini.stop(); gm = null; $('gameBar').hidden = true; $('mgExit').hidden = true; fadeEl.classList.remove('on'); return; }
    if (def.mini) { if (gm.waitUntil && (now > gm.waitUntil || [...remote.keys(), me].every(id => gm.fin[id]))) finishGame(); return; }
    const px = P.veh ? P.veh.x : P.x, pz = P.veh ? P.veh.z : P.z;
    if (gm.done) { finishGame(); return; }
    if (now >= gm.t0 + gm.dur) { finishGame(); return; }
    let hint = '';
    if (gm.k === 'tag') { if (gm.it === me && !(gm.imm[me] > now)) for (const a of remote.values()) if (!(gm.imm[a.id] > now) && Math.hypot(a.x - px, a.z - pz) < 1.9) { const d = { t: 'g', op: 'tag', k: 'tag', n: gm.n + 1, from: me, to: a.id }; applyGame(d); net.send(d); break; } }
    else if (gm.k === 'treasure') {
      const d = Math.hypot(px - gm.spot.x, pz - gm.spot.z); chestM.visible = d < 20; hint = d > 90 ? '🧊 Eiskalt' : d > 60 ? '❄️ Kalt' : d > 35 ? '😐 Lauwarm' : d > 18 ? '🙂 Warm' : d > 8 ? '🔥 Heiß' : '🔥🔥 Kochend heiß!';
      if (d < 22 && Math.random() < dt * 3) fx.emit(gm.spot.x + (Math.random() - .5) * 1.5, 1.2, gm.spot.z + (Math.random() - .5) * 1.5, 0, 1.6, 0, 1.4, 26, .9, .85, .3, 6, .9);
      if (d < 2.6) { if (!gm.solo) net.send({ t: 'g', op: 'found', k: 'treasure' }); gm.winner = me; gm.done = true; A.coins && A.coins(); fx.burst(gm.spot.x, 1.4, gm.spot.z, 40, [BI.C.gold, BI.C.white, BI.C.orange], 7, 1.6, 30, 9); }
    }
    else if (gm.k === 'hide') {
      const cnt = 20 - (now - gm.ph0) / 1000;
      if (gm.phase === 'count') { hint = '🙈 ' + (gm.it === me ? 'Ich zähle … ' : 'Versteck dich! ') + Math.max(0, Math.ceil(cnt)); if (cnt <= 0) { gm.phase = 'seek'; gm.ph0 = now; fadeEl.classList.remove('on'); say(gm.it === me ? '🔍 Ich komme! Suche die anderen!' : '😬 ' + gmNames(gm.it) + ' sucht jetzt!', 2600); } }
      else {
        const hiders = [...remote.keys(), me].filter(id => id !== gm.it), nf = hiders.filter(id => gm.found[id]).length; hint = '🔍 ' + (gm.it === me ? 'Gefunden ' : gmNames(gm.it).split(' ')[0] + ' sucht · gefunden ') + nf + '/' + hiders.length;
        if (gm.it === me) for (const a of remote.values()) if (!gm.found[a.id] && Math.hypot(a.x - px, a.z - pz) < 3.4) { net.send({ t: 'g', op: 'found', k: 'hide', who: a.id }); applyGame({ op: 'found', k: 'hide', who: a.id }); }
        if (nf >= hiders.length) gm.done = true;
      }
    }
    gmTick -= dt; if (gmTick > 0) return; gmTick = .25; const left = Math.max(0, Math.ceil((gm.t0 + gm.dur - now) / 1000)), bar = $('gameBar');
    bar.hidden = false; bar.classList.toggle('it', gm.k === 'tag' && gm.it === me);
    bar.textContent = (gm.k === 'tag' ? (gm.it === me ? '🔴 DU bist dran! ' : '🏃 ' + gmNames(gm.it) + ' ist dran · ') : gm.k === 'stars' ? '⭐ Du ' + (gm.cnt[me] || 0) + [...remote.keys()].map(id => ' · ' + gmNames(id).split(' ')[0] + ' ' + (gm.cnt[id] || 0)).join('') + ' · ' : hint + ' · ') + ' ⏱ ' + Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0');
  }
  function photoTargets(k) {
    if (k === 'fountain') return [{ x: 0, y: 2, z: 0 }]; if (k === 'train') return [{ x: trainVeh.x, z: trainVeh.z }];
    const o = farm.animals.filter(a => a.k === k).map(a => ({ x: a.x, z: a.z })); for (const v of vehicles) if (v.type === k) o.push({ x: v.x, y: v.y == null ? 1 : v.y + 1, z: v.z }); return o;
  }
  const kids = BI.createKids({ scene, camera, renderer, A, fx, P, save, persist, say, addStars: n => addStars(n), cam, setStick, updateButtons: f => updateButtons(f), state: () => state, pause: o => pause(o), showEmoji: (e, a) => showEmoji(e, a), send: d => { if (net.connected()) net.send(d); }, pup: () => pup, targets: k => photoTargets(k) });
  let poster = null;
  function drawPoster(img) { const cv = document.createElement('canvas'); cv.width = 320; cv.height = 240; const c = cv.getContext('2d'); if (img) c.drawImage(img, 0, 0, 320, 240); else { c.fillStyle = '#fffdf5'; c.fillRect(0, 0, 320, 240); c.font = '64px system-ui, sans-serif'; c.textAlign = 'center'; c.fillText('🖼️', 160, 100); c.fillStyle = '#16335e'; c.font = 'bold 26px system-ui, sans-serif'; c.fillText('Mal ein Bild!', 160, 170); } return cv; }
  function setPoster(img) {
    const tex = new THREE.CanvasTexture(drawPoster(img));
    if (!poster) { poster = new THREE.Group(); const fr = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, .06), new THREE.MeshLambertMaterial({ color: 0x8a5a33 })), pl = new THREE.Mesh(new THREE.PlaneGeometry(1.45, 1.08), new THREE.MeshBasicMaterial({ map: tex })); pl.position.z = .04; poster.add(fr, pl); poster.userData.pl = pl; scene.add(poster); }
    else { const m = poster.userData.pl.material; if (m.map) m.map.dispose(); m.map = tex; m.needsUpdate = true; }
    placePoster();
  }
  function placePoster() { if (!poster) return; const f = flats[mySlot()]; poster.position.set(f.cx - .6, 1.9, f.zB + .25); }
  kids.onArt = () => kids.loadArt(setPoster); kids.loadArt(setPoster);
  function gameStar() { if (gm && gm.k === 'stars') { const me = selfId(); gm.cnt[me] = (gm.cnt[me] || 0) + 1; net.send({ t: 'g', op: 'cnt', k: 'stars', n: gm.cnt[me] }); } }

  /* ---------- Wohnungen: Zimmer, Eltern, Bett zum Schlafen, Kleiderschrank zum Umziehen ---------- */
  const FB = W.spots.flatBlock, flats = W.spots.flats, wardPanel = $('wardPanel'), fadeEl = $('fade'); let wardOpen = false; const sl = { t: -1, f: null, said: false };
  function textSprite(txt, w, h, fs) {
    const cv = document.createElement('canvas'); cv.width = 512; cv.height = Math.round(512 * h / w); const c = cv.getContext('2d'); c.font = 'bold ' + fs + 'px Fredoka, system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 12; c.strokeStyle = '#16335e'; c.strokeText(txt, 256, cv.height / 2 + 3); c.fillStyle = '#fff'; c.fillText(txt, 256, cv.height / 2 + 3);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false })); sp.scale.set(w, h, 1); return sp;
  }
  const PARENT = [[{ shirt: 0xff6fae, pants: 0x7a5ce0, hair: 0x6b4423, style: 'ponytail', dress: true, name: 'Mama Anna' }, { shirt: 0x4da3ff, pants: 0x3d4a7a, hair: 0x222222, name: 'Papa Tom', hat: 'none' }], [{ shirt: 0xffd23f, pants: 0x3d4a7a, hair: 0xd9a441, style: 'long', dress: true, name: 'Mama Lena', skin: 0xf3c9a0 }, { shirt: 0x4cd07d, pants: 0x5a3d2b, hair: 0x6b4423, name: 'Papa Jonas', skin: 0xf3c9a0 }], [{ shirt: 0xb36bff, pants: 0x3d4a7a, hair: 0x222222, style: 'bun', dress: true, name: 'Mama Amara', skin: 0x8d5a3b }, { shirt: 0xff8a1f, pants: 0x2d6a4f, hair: 0x222222, name: 'Papa Kofi', skin: 0x8d5a3b }], [{ shirt: 0x2fae5a, pants: 0x7a3d6a, hair: 0xa14a2b, style: 'curly', dress: true, name: 'Mama Sophie' }, { shirt: 0xe8453c, pants: 0x3d4a7a, hair: 0x6b4423, name: 'Papa Max' }]];
  for (const f of flats) {
    f.mom = BI.makeChar(Object.assign({ scale: .92, skin: f.i === 2 ? 0x8d5a3b : f.i === 1 ? 0xf3c9a0 : 0xffd2a8 }, PARENT[f.i][0])); f.dad = BI.makeChar(Object.assign({ scale: 1 }, PARENT[f.i][1]));
    f.mom.group.position.set(f.mama.x, 0, f.mama.z); f.dad.group.position.set(f.papa.x, 0, f.papa.z); f.mom.group.rotation.y = 2.2; f.dad.group.rotation.y = -2.4; scene.add(f.mom.group, f.dad.group);
    f.sign = textSprite('Frei', 4.6, 1.0, 66); f.sign.position.set(f.cx, 4.5, f.zF + .8); f.signTxt = 'Frei'; scene.add(f.sign); f.visP = true;
  }
  const selfId = () => net.id || 'me';
  function slotOf(id) { const ids = [selfId()].concat([...remote.keys()]).sort(); return Math.max(0, ids.indexOf(id)) % flats.length; }
  const mySlot = () => slotOf(selfId());
  function updateFlats() {
    placePoster(); room.place(flats[mySlot()]);
    const names = flats.map(() => ''); const ids = [selfId()].concat([...remote.keys()]).sort();
    ids.forEach((id, k) => { names[k % flats.length] = id === selfId() ? myName() : remote.get(id).name; });
    flats.forEach((f, i) => { const txt = names[i] ? '🏠 ' + names[i] : 'Frei'; if (txt !== f.signTxt) { f.signTxt = txt; const old = f.sign; f.sign = textSprite(txt, 4.6, 1.0, 62); f.sign.position.copy(old.position); freeObj(old); scene.add(f.sign); } });
  }
  const PLINES = { mama: ['Hast du schon Hunger, mein Schatz?', 'Du bist mein Sonnenschein! ☀️', 'Räum bitte dein Zimmer auf, ja?', 'Gute Nacht, schlaf schön!', 'Spiel schön mit deinen Freunden!'], papa: ['Na, Abenteurer? Wo warst du heute?', 'Sollen wir später Ball spielen?', 'Pass beim Fahren gut auf!', 'Ich bin stolz auf dich!', 'Willst du mein Pferd… äh, Huckepack? 😄'] };
  let kissCd = 0;
  function flatNear() {
    if (P.veh || P.y > 1 || sl.t >= 0) return null; const x = P.x, z = P.z; if (!(x > FB.x0 && x < FB.x1 && z > FB.zB && z < FB.zF)) return null;
    const f = flats[clamp(((x - FB.x0) / 12) | 0, 0, flats.length - 1)], d = p => Math.hypot(x - p.x, z - p.z);
    if (d(f.chest) < 1.9) return { k: 'room', f }; if (d(f.bed) < 2.7) return { k: 'bed', f }; if (d(f.ward) < 2.9) return { k: 'ward', f }; if (d(f.mama) < 2.6) return { k: 'mama', f }; if (d(f.papa) < 2.6) return { k: 'papa', f }; return null;
  }
  function flatAct(n) {
    if (n.k === 'room') { if (n.f.i === mySlot()) room.show(); else say('🛋️ Das ist nicht dein Zimmer – deins ist in deiner Wohnung!', 2600); } else if (n.k === 'bed') startSleep(n.f); else if (n.k === 'ward') openWard();
    else { const l = PLINES[n.k]; say(PARENT[n.f.i][n.k === 'mama' ? 0 : 1].name + ': „' + l[(Math.random() * l.length) | 0] + '“', 3200); (n.k === 'mama' ? n.f.mom : n.f.dad).group.rotation.y = Math.atan2(P.x - (n.k === 'mama' ? n.f.mama.x : n.f.papa.x), P.z - (n.k === 'mama' ? n.f.mama.z : n.f.papa.z)); if (kissCd <= 0 && n.f.i === mySlot()) { kissCd = 45; addStars(1); A.star(); fx.burst(P.x, 2.2, P.z, 10, [BI.C.pink, BI.C.red], 3, 1.2, 28, -1); say('❤️ ' + PARENT[n.f.i][n.k === 'mama' ? 0 : 1].name + ' drückt dich fest! +1 ⭐', 2400); } }
  }
  function startSleep(f) { sl.t = 0; sl.f = f; sl.said = false; setStick(0, 0); fun.setDance(false); fadeEl.classList.add('on'); A.stopAll(); }
  function updateSleep(dt) {
    if (sl.t < 0) return; sl.t += dt; const f = sl.f, g = char.group;
    if (sl.t > 1.1 && sl.t < 3.6) { P.x = f.bed.x; P.z = f.bed.z - .2; P.y = .78; P.h = Math.PI; g.position.set(P.x, P.y, P.z); g.rotation.set(-Math.PI / 2, 0, 0); char.pose(0, 0, false); if (!sl.said) { sl.said = true; nightT = 0; say('💤 Gute Nacht … Zzz', 1800); } if (Math.random() < dt * 3) fx.emit(P.x, 1.7, P.z - .2, .2, .7, 0, 2, 26, .6, .7, 1, 4, .8); }
    if (sl.t >= 3.6 && sl.t < 3.7) { fadeEl.classList.remove('on'); sl.t = 3.7; P.x = f.bed.x + 2.3; P.z = f.bed.z + 1.2; P.y = 0; g.rotation.set(0, 0, 0); g.position.set(P.x, 0, P.z); say('Guten Morgen, ' + heroName() + '! ☀️', 2600); A.fanfare(); kids.earn('sleep'); }
    if (sl.t > 4.6) sl.t = -1;
  }
  function openWard() { wardOpen = true; setStick(0, 0); wardPanel.hidden = false; renderWard(); say('Such dir etwas Schönes aus! 👕', 1800); }
  function closeWard() { wardOpen = false; wardPanel.hidden = true; updateButtons(true); }
  function renderWard() {
    refreshPickers(); const box = $('wardItems'); box.innerHTML = ''; const mine = SHOP.filter(q => save.owned.includes(q.id) && q.slot !== 'kite' && q.slot !== 'rcheli');
    { const pb = document.createElement('button'); pb.className = 'pill' + (save.papOff ? '' : ' sel'); pb.textContent = '🎈 Pappnase'; pb.onclick = () => { togglePap(); renderWard(); }; box.appendChild(pb); }
    if (!mine.length) { const h = document.createElement('div'); h.textContent = 'Im Spielzeugladen kannst du neue Sachen kaufen 🧸'; box.appendChild(h); return; }
    for (const it of mine) { const b = document.createElement('button'); b.className = 'pill' + (isEq(it) ? ' sel' : ''); b.textContent = it.icon + ' ' + it.name; b.onclick = () => { setEq(it, !isEq(it)); A.pop(); renderWard(); }; box.appendChild(b); }
  }
  $('wardClose').addEventListener('click', closeWard);
  function goHome() {
    if (P.veh || sl.t >= 0) return; const f = flats[mySlot()]; fx.burst(P.x, 1.2, P.z, 16, [BI.C.white, BI.C.gold], 4, 1, 28, 4); P.x = f.door.x; P.z = f.door.z + 1.2; P.y = 0; P.h = Math.PI; cam.yaw = 0; A.fanfare(); fx.burst(P.x, 1.2, P.z, 16, [BI.C.white, BI.C.pink], 4, 1, 28, 4); say('🏠 Zuhause! Mama und Papa warten drinnen.', 2800);
  }
  function updateFlatsLife(dt) {
    kissCd -= dt; const q = Math.hypot(P.x - (FB.x0 + FB.x1) / 2, P.z - (FB.zB + FB.zF) / 2) < 70;
    for (const f of flats) { if (f.visP !== q) { f.visP = q; f.mom.group.visible = f.dad.group.visible = f.sign.visible = q; } if (q) { const nm = Math.hypot(P.x - f.mama.x, P.z - f.mama.z) < 5; f.mom.pose(t * 1.3 + f.i, 0, nm); f.dad.pose(t * 1.1 + f.i * 2, 0, Math.hypot(P.x - f.papa.x, P.z - f.papa.z) < 5); } }
    const ins = !P.veh && W.shelter(P.x, P.z) === 2; if (W.flatRoof.visible === ins) W.flatRoof.visible = !ins;
  }

  /* ---------- Garten, Bauernhof, Freibad ---------- */
  const garden = BI.createGarden({ scene, W, A, fx, P, save, persist, say, addStars: n => addStars(n), mySlot: () => mySlot(), earn: id => kids.earn(id), setStick, updateButtons: f => updateButtons(f) });
  const farm = BI.createFarm({ scene, W, A, fx, P, save, persist, say, addStars: n => addStars(n), animals, inv: () => garden.inv(), cropIcon: k => garden.CROPS[k] && garden.CROPS[k].icon, showEmoji: (e, a) => showEmoji(e, a), earn: id => kids.earn(id), setStick, updateButtons: f => updateButtons(f) });
  let weather = null;
  function applySeason() { if (weather) weather.applySeason(); }
  const pool = BI.createPool({ scene, W, A, fx, P, save, persist, say, addStars: n => addStars(n), earn: id => kids.earn(id), char: () => char, openWard: () => openWard() });
  const kitchen = BI.createKitchen({ W, A, fx, P, say, persist, addStars: n => addStars(n), inv: () => garden.inv(), cropIcon: k => garden.CROPS[k] && garden.CROPS[k].icon, setStick, updateButtons: f => updateButtons(f), earn: id => kids.earn(id) });
  const room = BI.createRoom({ scene, A, fx, P, save, persist, say, setStick, updateButtons: f => updateButtons(f), earn: id => kids.earn(id) });
  const camp = BI.createCamp({ scene, W, A, fx, P, say, addStars: n => addStars(n), setStick, updateButtons: f => updateButtons(f), earn: id => kids.earn(id) });
  const combat = BI.createCombat({ scene, camera, W, A, fx, P, save, persist, say, addStars: n => addStars(n), setStick, updateButtons: f => updateButtons(f), earn: id => kids.earn(id), char: () => char, state: () => state });
  weather = BI.createWeather({ scene, camera, W, A, P, save, say, stars, fx, garden });
  function nearStation() { if (P.veh) return -1; for (let i = 0; i < W.stations.length; i++) { const p = W.stations[i].plat; if (P.x > p[0] - 1.5 && P.x < p[2] + 1.5 && P.z > p[1] - 1.5 && P.z < p[3] + 1.5) return i; } return -1; }
  /* Am Bahnsteig: „Zug fahren“ – der Zug wird an diesen Bahnhof gezaubert und man steigt als Lokführer ein */
  function boardTrain(i) {
    if (P.veh) return; const st = W.stations[i], d = Math.hypot(trainVeh.x - st.x, trainVeh.z - st.z);
    if (d > 7 || train.v > 1.5) { fx.burst(trainVeh.x, 2, trainVeh.z, 20, [BI.C.white, BI.C.blue], 5, 1, 30, 2); train.s = st.s; train.v = 0; train.mode = 'wait'; train.timer = 40; train.stationIdx = i; train.update(0, null, fx); fx.burst(st.x, 2, st.z, 24, [BI.C.gold, BI.C.white, BI.C.pink], 5, 1.2, 30, 4); A.fanfare(); say('🚂 Der Zug fährt für dich vor! Alles einsteigen!', 3000); }
    enter(trainVeh);
  }
  function npcNear() { let best = null, bd = 2.3; if (P.veh) return null; for (const n of npcs) { if (!n.c.group.visible || !n.p) continue; const d = Math.hypot(P.x - n.x, P.z - n.z); if (d < bd) { bd = d; best = n; } } return best; }
  function talkNpc(n) {
    const p = n.p, line = p.lines[p.i++ % p.lines.length]; n.wait = 5; n.h = Math.atan2(P.x - n.x, P.z - n.z); n.c.group.rotation.y = n.h; n.hop = .4;
    say('💬 ' + p.name + ': „' + line + '“', 5200); if (A.speak) A.speak(p.name.split(' ')[0] + ' sagt: ' + line);
    const T = save.talked || (save.talked = []); if (!T.includes(p.name)) { T.push(p.name); persist(); if (T.length >= 5) kids.earn('chat'); }
  }
  function placeNear() {
    if (P.veh || sl.t >= 0 || rs.ui || mpOpen || wardOpen) return null;
    const g = garden.near(); if (g) return { src: 'garden', n: g };
    if (combat.nearKai()) return { src: 'arena' };
    { const si = nearStation(); if (si >= 0) return { src: 'station', i: si }; }
    if (kitchen.near()) return { src: 'kitchen' };
    if (camp.near()) return { src: 'camp' };
    if (farm.nearFarmer()) return { src: 'farmer' };
    const pn = pool.near(); if (pn) return { src: 'pool', n: pn };
    { const nn = npcNear(); if (nn) return { src: 'npc', npc: nn }; }
    const an = farm.animalNear(); if (an) return { src: 'animal', a: an };
    return null;
  }
  const PLN = { plant: ['🌱', 'Pflanzen'], water: ['💧', 'Gießen'], harvest: ['🧺', 'Ernten'], slide: ['🛝', 'Rutschen'], dive: ['🤿', 'Springen'], ice: ['🍦', 'Eis holen'], cabin: ['🚪', 'Umziehen'] };
  function placeLabel(n) { if (n.src === 'station') return ['🚂', 'Zug fahren'];  if (n.src === 'arena') return ['🥊', 'Arena'];  if (n.src === 'npc') return ['💬', n.npc.p.name.split(' ')[0]];  if (n.src === 'camp') return ['📖', 'Geschichten']; if (n.src === 'kitchen') return ['🍳', 'Kochen']; if (n.src === 'animal' && n.a.k === 'cow') return ['🥛', 'Melken']; if (n.src === 'farmer') return ['💬', 'Bauer Heinz']; if (n.src === 'animal') return ['🤗', farm.SP[n.a.k].name]; return PLN[n.n.k]; }
  function placeAct(n) {
    if (n.src === 'garden') garden.act(n.n); else if (n.src === 'farmer') farm.talk(); else if (n.src === 'pool') pool.act(n.n); else if (n.src === 'npc') talkNpc(n.npc); else if (n.src === 'kitchen') kitchen.show(); else if (n.src === 'camp') camp.show(); else if (n.src === 'arena') combat.openPanel(); else if (n.src === 'station') boardTrain(n.i); else if (n.src === 'animal') { if (!farm.milk()) farm.care('stroke'); }
  }
  /* Schwimmen: Körper im Wasser, Schwimmbewegung */
  function swimPose(sw, dt) {
    const g = char.group; g.position.y = P.y - (sw === 2 ? .55 : .22); if (sw === 2) { g.rotation.x = .9; const ph = t * 6; char.armL.rotation.set(-2.3 + Math.sin(ph) * .9, 0, .25); char.armR.rotation.set(-2.3 - Math.sin(ph) * .9, 0, -.25); char.legL.rotation.x = Math.sin(ph * 2) * .6; char.legR.rotation.x = -Math.sin(ph * 2) * .6; }
    if (P.speed > .3 && Math.random() < dt * 14) fx.emit(P.x - Math.sin(P.h) * .3, .2, P.z - Math.cos(P.h) * .3, (Math.random() - .5), .8, (Math.random() - .5), .6, 18, .6, .85, 1, 5, .9);
  }

  /* ---------- Orientierung (🧭 Wohin?) und Eltern-Bereich ---------- */
  const SPOT = W.spots, DEST = [
    { id: 'home', icon: '🏠', name: 'Meine Wohnung', at: () => flats[mySlot()].door }, { id: 'garden', icon: '🌻', name: 'Mein Garten', at: () => { const c = SPOT.gardens[mySlot()].cells[0]; return { x: c.x + 3.2, z: c.z - 1 }; } },
    { id: 'shop', icon: '🧸', name: 'Spielzeugladen', at: () => ({ x: SPOT.shop.x, z: SPOT.shop.z + 8 }) }, { id: 'range', icon: '🎯', name: 'Schießbude', at: () => ({ x: SPOT.range.x, z: SPOT.range.z }) },
    { id: 'hof', icon: '🥕', name: 'Hofladen', at: () => SPOT.farm.customer }, { id: 'fields', icon: '🌾', name: 'Felder & Maschinen', at: () => ({ x: -100, z: 56 }) },
    { id: 'arena', icon: '🥊', name: 'Kampfarena', at: () => ({ x: SPOT.arena.kai.x, z: SPOT.arena.kai.z + 3 }) }, { id: 'forest', icon: '🌲', name: 'Verbotener Wald', at: () => ({ x: SPOT.forest.gate.x, z: SPOT.forest.gate.z }) },
    { id: 'camp', icon: '⛺', name: 'Camp', at: () => ({ x: SPOT.camp.x, z: SPOT.camp.z + 5 }) },
    { id: 'zoo', icon: '🐮', name: 'Streichelzoo', at: () => ({ x: SPOT.pens[0].gate.x + 3, z: SPOT.pens[0].gate.z + 3 }) }, { id: 'pool', icon: '🏊', name: 'Freibad', at: () => ({ x: SPOT.pool.gate.x, z: SPOT.pool.gate.z - 4 }) },
    { id: 'station', icon: '🚂', name: 'Bahnhof', at: () => SPOT.station }, { id: 'hospital', icon: '🏥', name: 'Krankenhaus', at: () => SPOT.hospital },
    { id: 'heli', icon: '🚁', name: 'Hubschrauber', at: () => SPOT.helipad }, { id: 'pier', icon: '⛵', name: 'Boot am Steg', at: () => ({ x: 4.5, z: 170 }) },
    { id: 'ship', icon: '🏴‍☠️', name: 'Piratenschiff', at: () => ({ x: W.ship.cx - 6, z: W.ship.cz + 2 }) }, { id: 'park', icon: '🛝', name: 'Spielplatz', at: () => SPOT.park }
  ];
  let guide = null; const guideEl = $('guidePanel');
  function openGuide() { if (state !== 'play' || mini.active || gm || kids.busy()) return; guideOpen = true; setStick(0, 0); const g = $('guideGrid'); g.innerHTML = '';
    for (const d of DEST) { const c = document.createElement('div'); c.className = 'gc2'; c.innerHTML = '<b>' + d.icon + '</b>' + d.name + '<div class="gb"></div>'; const gb = c.querySelector('.gb');
      const b1 = document.createElement('button'); b1.textContent = '👣 Weg zeigen'; b1.onclick = () => { setGuide(d); closeGuide(); }; const b2 = document.createElement('button'); b2.textContent = '✨ Hinzaubern'; b2.onclick = () => { closeGuide(); beamTo(d); }; gb.append(b1, b2); g.appendChild(c); }
    guideEl.hidden = false; }
  let guideOpen = false; function closeGuide() { guideOpen = false; guideEl.hidden = true; updateButtons(true); }
  function setGuide(d) { guide = { d, t: 0 }; const p = d.at(); say('🧭 Ich zeige dir den Weg: ' + d.icon + ' ' + d.name, 2600); updateHud(); }
  function beamTo(d) {
    if (P.veh) leave(); const p = d.at(); fx.burst(P.x, 1.2, P.z, 18, [BI.C.white, BI.C.gold, BI.C.pink], 4, 1, 28, 4); const q = W.resolve(p.x, p.z, .6, {}); P.x = q.x; P.z = q.z; P.y = 0; P.vy = 0; cam.yaw = 0; A.fanfare(); fx.burst(P.x, 1.2, P.z, 18, [BI.C.white, BI.C.pink], 4, 1, 28, 4); say('✨ Zack! Du bist da: ' + d.icon + ' ' + d.name, 2600); guide = null; kids.earn('guide'); updateHud();
  }
  function updateGuide(dt) { if (!guide) return; const p = guide.d.at(), px = P.veh ? P.veh.x : P.x, pz = P.veh ? P.veh.z : P.z; if (Math.hypot(p.x - px, p.z - pz) < 7) { say('🎉 Angekommen: ' + guide.d.icon + ' ' + guide.d.name + '!', 3000); A.star(); kids.earn('guide'); guide = null; updateHud(); } }
  $('bGuide').addEventListener('click', openGuide); $('guideClose').addEventListener('click', closeGuide);
  /* Eltern-Bereich: Lautstärke, Mitspielen, Sparmodus, Vorlesen, Jahreszeit, Pausen-Erinnerung */
  let parentOpen = false, pHold = 0, pHolding = false; const par = $('parentPanel');
  const SEASONS = [['auto', 'Auto'], ['spring', '🌸 Frühling'], ['summer', '☀️ Sommer'], ['autumn', '🍂 Herbst'], ['winter', '❄️ Winter']];
  const ecoOn = () => !!save.eco;
  function applyVolume() { A.setVolume(save.vol == null ? 1 : save.vol); }
  function applyEco() { if (ecoOn()) quality = Math.max(quality, 2); resize(); }
  function renderParent() {
    $('parVol').value = Math.round((save.vol == null ? 1 : save.vol) * 100); $('parMp').classList.toggle('sel', !save.mpOff); $('parMp').textContent = save.mpOff ? '👥 Mitspielen gesperrt' : '👥 Mitspielen erlaubt'; $('parEco').classList.toggle('sel', ecoOn()); $('parVoice').classList.toggle('sel', A.voiceOn);
    const sb = $('parSeason'); sb.innerHTML = ''; SEASONS.forEach(([k, n]) => { const b = document.createElement('button'); b.className = 'pill' + ((save.season || 'auto') === k ? ' sel' : ''); b.textContent = n; b.onclick = () => { save.season = k; persist(); if (typeof applySeason === 'function') applySeason(); renderParent(); }; sb.appendChild(b); });
    const bb = $('parBreak'); bb.innerHTML = ''; kids.breakOpts.forEach(m => { const b = document.createElement('button'); b.className = 'pill' + ((save.breakMin || 0) === m ? ' sel' : ''); b.textContent = m ? m + ' Min' : 'Aus'; b.onclick = () => { save.breakMin = m; persist(); kids.refreshBreak(); renderParent(); }; bb.appendChild(b); });
  }
  function openParent() { parentOpen = true; setStick(0, 0); renderParent(); par.hidden = false; }
  function closeParent() { parentOpen = false; par.hidden = true; persist(); }
  $('parClose').addEventListener('click', closeParent); $('parVol').addEventListener('input', e => { save.vol = e.target.value / 100; applyVolume(); persist(); });
  $('parMp').addEventListener('click', () => { save.mpOff = !save.mpOff; if (save.mpOff && net.role) { net.close(); } persist(); renderParent(); });
  $('parEco').addEventListener('click', () => { save.eco = !save.eco; persist(); applyEco(); renderParent(); });
  $('parVoice').addEventListener('click', () => { toggleVoice(); renderParent(); });
  const pb = $('bParent'); pb.addEventListener('pointerdown', e => { e.preventDefault(); pHolding = true; pHold = 0; }); const pbu = () => { pHolding = false; pHold = 0; pb.style.setProperty('--p', '0%'); }; pb.addEventListener('pointerup', pbu); pb.addEventListener('pointerleave', pbu); pb.addEventListener('pointercancel', pbu);
  function updateParent(dt) { if (pHolding) { pHold += dt; pb.style.setProperty('--p', Math.min(100, pHold / 1.5 * 100) + '%'); if (pHold >= 1.5) { pHolding = false; pHold = 0; pb.style.setProperty('--p', '0%'); openParent(); } } }
  applyVolume();

  /* ---------- Spaß, Bauen, Ego-Kamera, Held ---------- */
  const SHIP = W.ship; let chestCd = 0, wasOnDeck = false;
  const onDeck = () => !P.veh && P.y > 1.5 && W.onDeck(P.x, P.z);
  const nearChest = () => onDeck() && Math.hypot(P.x - SHIP.chest.x, P.z - SHIP.chest.z) < 3;
  function openChest() {
    if (chestCd > 0) { say('🏴‍☠️ Die Truhe ist leer – komm später wieder!', 2000); return; }
    chestCd = 90; A.coins(); A.fanfare(); addStars(3); say('💰 Schatz gefunden! +3 ⭐', 2600); fx.burst(SHIP.chest.x, 3.4, SHIP.chest.z, 40, [BI.C.gold, BI.C.white, BI.C.orange], 7, 1.6, 30, 9);
  }
  const TRICKS = [['sit', 'Sitz', 1.7], ['paw', 'Pfötchen', 1.9], ['roll', 'Rolle', 1.1], ['beg', 'Männchen', 1.9], ['flip', 'Salto', 1.0]];
  function doPunch() {
    if (state !== 'play' || P.veh || build.active || shopOpen || rs.ui || wardOpen || sl.t >= 0 || P.punchT > 0) return;
    fun.setDance(false); const T = fun.nearTree(); if (T) P.h = Math.atan2(T.x - P.x, T.z - P.z); P.punchT = .4; P.punchHit = false;
  }
  function toggleEgo() {
    if (!P.veh) { say('📷 Ego-Kamera gibt es im Fahrzeug', 1600); return; }
    cam.ego = !cam.ego; cam.egoOff = 0; $('bCam').classList.toggle('on', cam.ego); if (!cam.ego && P.veh.spec.open) char.group.visible = true;
  }
  function doFun(k) {
    if (state !== 'play' || rs.ui || sl.t >= 0 || wardOpen || kids.busy() || parentOpen) return;
    if (k === 'home') { goHome(); return; }
    if (k === 'games') { openGames(); return; }
    if (k === 'pap') { togglePap(); return; } if (k === 'photo') { kids.photo(); return; } if (k === 'music' || k === 'paint') { kids.show(k); return; } if (k === 'album') { kids.show('album'); return; } if (k === 'fotos') { kids.show('photos'); return; } if (k === 'feed' || k === 'stroke') { if (!farm.care(k)) kids.care(k); return; } if (k === 'tierbuch') { farm.openBook(); return; } if (k === 'guide') { openGuide(); return; }
    save.use = save.use || {}; save.use[k] = (save.use[k] || 0) + 1; saveT = 1.5; { const SK = { dance: 'dance', bubbles: 'bubble', xxl: 'bubble' }; if (SK[k]) kids.earn(SK[k]); }
    if (k === 'rcfetch') { for (const q of vehicles) if (q.spec.remote && Math.hypot(P.x - q.x, P.z - q.z) > 12) spawnRC(false, q.type); }
    else if (k === 'cannon') { if (onDeck()) { SHIP.cannons.forEach((c, i) => fun.cannon(c, i * .18)); say('💥 Feuer frei!', 1200); } }
    else if (k === 'ahoi') { A.arr(); P.wave = 1.6; pap.wiggle = 1; say('🏴‍☠️ Ahoi, Käpt\'n ' + heroName() + '!', 1800); fx.burst(P.x, 2.6, P.z, 10, [BI.C.gold, BI.C.white, BI.C.red], 3, 1.2, 30, -1); }
    else if (k === 'trick') {
      if (pup.trick || pup.mode === 'fetch') return; const T = TRICKS[pup.trickIdx % TRICKS.length]; pup.trickIdx++; pup.mode = 'follow'; pup.trick = { name: T[0], t: 0, dur: T[2] }; A.bark(); say('🐶 ' + pup.name + ' macht ' + T[1] + '!', 1600); fx.burst(pup.x, 1.4, pup.z, 6, [BI.C.pink, BI.C.gold], 2, 1, 30, -1);
      if (++pup.tricksDone % TRICKS.length === 0) { addStars(2); A.star(); say('🏅 Trick-Meister! Alle Tricks geschafft! +2 ⭐', 2600); }
    }
    else if (k === 'fetch') {
      if (pup.mode === 'fetch' || pup.trick) return; let bl = fun.balls[fun.balls.length - 1]; if (!bl) { fun.ball(); bl = fun.balls[fun.balls.length - 1]; }
      bl.vx = Math.sin(P.h) * 11; bl.vz = Math.cos(P.h) * 11; bl.vy = 5; bl.cd = .5; pup.fetch = { ball: bl, phase: 'go', t: 0 }; pup.mode = 'fetch'; A.kick(); say('🎾 Hol den Ball, ' + pup.name + '!', 1800);
    }
    else if (k === 'dance') { if (P.veh) { say('🕺 Zum Tanzen erst aussteigen', 1600); return; } if (build.active) return; fun.setDance(!fun.dancing); }
    else if (k === 'punch') doPunch();
    else if (k === 'bubbles') fun.bubbles();
    else if (k === 'xxl') fun.xxl();
    else if (k === 'bark') { pup.bark = .6; A.bark(); say('🐶 Wuff!', 900); fx.burst(pup.x, 1.4, pup.z, 5, [BI.C.pink, BI.C.gold], 2, 1, 32, -1); for (const n of npcs) if (Math.hypot(n.x - pup.x, n.z - pup.z) < 12) { n.hop = .6; n.wave = 2; } }
    else if (k === 'search') {
      if (pup.trick || pup.mode === 'fetch') return;
      if (pup.cd > 0) { say('🐶 ' + pup.name + ' verschnauft kurz …', 1200); return; }
      const px = P.veh ? P.veh.x : P.x, pz = P.veh ? P.veh.z : P.z; let best = null, bd = 1e9; for (const s of stars) if (s.on) { const d = Math.hypot(s.x - px, s.z - pz); if (d < bd) { bd = d; best = s; } }
      if (best) { pup.star = best; pup.mode = 'search'; A.bark(); pup.bark = .3; say('🐶 ' + pup.name + ', such den Stern! 🔎', 1800); }
    }
    else if (k === 'gum') fun.gum(); else if (k === 'ball') fun.ball(); else if (k === 'fireworks') fun.fireworks(); else if (k === 'balloons') fun.balloons();
  }
  /* Schnellmenü: zeigt nur die 6 passendsten Aktionen (je nach Lage + was oft benutzt wird), „Mehr“ zeigt alle */
  const ACTIONS = [
    { k: 'punch', icon: '👊', name: 'Baum hauen', key: '6' }, { k: 'rcfetch', icon: '🏎️', name: 'RC-Auto holen', key: '' }, { k: 'dance', icon: '🕺', name: 'Tanzen', key: '1' },
    { k: 'bubbles', icon: '🫧', name: 'Blasen', key: '9' }, { k: 'balloons', icon: '🎈', name: 'Ballons', key: '5' }, { k: 'gum', icon: '🍬', name: 'Kaugummi', key: '2' },
    { k: 'fireworks', icon: '🎆', name: 'Feuerwerk', key: '4' }, { k: 'ball', icon: '⚽', name: 'Ball', key: '3' }, { k: 'search', icon: '🔎', name: 'Such!', key: '8' },
    { k: 'xxl', icon: '🔮', name: 'XXL-Blase', key: '0' }, { k: 'bark', icon: '🐶', name: 'Wuff!', key: '7' },
    { k: 'home', icon: '🏠', name: 'Nach Hause', key: '' }, { k: 'pap', icon: '🎈', name: 'Pappnase an/aus', key: '' }, { k: 'games', icon: '🎮', name: 'Spiele', key: '' }, { k: 'photo', icon: '📸', name: 'Foto', key: '' }, { k: 'music', icon: '🎹', name: 'Musik', key: '' }, { k: 'paint', icon: '🎨', name: 'Malen', key: '' }, { k: 'feed', icon: '🦴', name: 'Füttern', key: '' }, { k: 'stroke', icon: '🤗', name: 'Streicheln', key: '' }, { k: 'album', icon: '🏅', name: 'Album', key: '' }, { k: 'guide', icon: '🧭', name: 'Wohin?', key: '' }, { k: 'tierbuch', icon: '📖', name: 'Tierbuch', key: '' }, { k: 'fotos', icon: '🖼️', name: 'Fotoalbum', key: '' }, { k: 'cannon', icon: '💥', name: 'Kanone', key: '' }, { k: 'ahoi', icon: '🏴‍☠️', name: 'Ahoi!', key: '' }, { k: 'trick', icon: '🐾', name: 'Trick', key: '' }, { k: 'fetch', icon: '🎾', name: 'Apport', key: '' }
  ];
  let quickAll = false;
  const onFoot = () => !P.veh || P.veh.spec.remote;
  function avail(a) {
    if (a.k === 'punch') return onFoot() && !!fun.nearTree();
    if (a.k === 'dance' || a.k === 'xxl') return onFoot();
    if (a.k === 'rcfetch') return !(P.veh && P.veh.spec.remote) && vehicles.some(q => q.spec.remote && Math.hypot(P.x - q.x, P.z - q.z) > 12);
    if (a.k === 'cannon') return onFoot() && onDeck();
    if (a.k === 'ahoi' || a.k === 'fetch') return onFoot();
    if (a.k === 'home') return !P.veh;
    if (a.k === 'music' || a.k === 'paint' || a.k === 'feed' || a.k === 'stroke') return onFoot();
    return true;
  }
  const Hm = () => (Math.hypot(P.x - (FB.x0 + FB.x1) / 2, P.z - FB.zB) > 40 ? 9 : 0) + (night > .6 ? 30 : 0);
  function score(a) {
    const base = { punch: 0, rcfetch: 120, dance: 30, bubbles: 26, balloons: 22, gum: 20, fireworks: 20 + (night > .5 ? 25 : 0), ball: 18, search: 14 + (mission ? 0 : 25), xxl: 12, bark: 10, home: Hm(), games: 24, photo: 17, music: 15, paint: 12, feed: 13, stroke: 9, album: 6, fotos: 5, guide: 8, tierbuch: 7, cannon: 160, ahoi: 11 + (onDeck() ? 90 : 0), trick: 15, fetch: 13 + (fun.balls.length ? 25 : 0) };
    return (base[a.k] || 0) + (a.k === 'punch' ? 200 : 0) + Math.min((save.use || {})[a.k] || 0, 15) * 1.5;
  }
  function renderQuick() {
    const bar = $('funBar'); bar.innerHTML = ''; const list = ACTIONS.filter(avail).sort((a, b) => score(b) - score(a)), shown = quickAll ? list : list.slice(0, 6);
    for (const a of shown) { const b = document.createElement('button'); b.className = 'fb'; b.dataset.k = a.k; b.innerHTML = a.icon + '<small>' + a.name + '</small>' + (a.key ? '<i class="kbd kb">' + a.key + '</i>' : ''); b.onclick = () => { doFun(a.k); closeQuick(); }; bar.appendChild(b); }
    if (list.length > 6) { const m = document.createElement('button'); m.className = 'fb more'; m.innerHTML = (quickAll ? '▴' : '⋯') + '<small>' + (quickAll ? 'Weniger' : 'Mehr') + '</small>'; m.onclick = () => { quickAll = !quickAll; renderQuick(); }; bar.appendChild(m); }
  }
  function closeQuick() { $('funBar').hidden = true; $('bFun').classList.remove('on'); }
  $('bFun').addEventListener('click', () => { const f = $('funBar'); if (!f.hidden) { closeQuick(); return; } quickAll = false; renderQuick(); f.hidden = false; $('bFun').classList.add('on'); });
  $('bCam').addEventListener('click', toggleEgo);
  let preBuild = null, tab = 0, clearT = 0;
  function renderBuild() {
    const tabs = $('bTabs'); tabs.innerHTML = '';
    build.TABS.forEach((tb, i) => { const b = document.createElement('button'); b.className = 'bt' + (i === tab ? ' sel' : ''); b.textContent = tb.icon + ' ' + tb.name; b.onclick = () => { tab = i; renderBuild(); }; tabs.appendChild(b); });
    const items = $('bItems'); items.innerHTML = '';
    Object.entries(build.CAT).forEach(([id, c]) => { if (c.tab !== tab) return; const b = document.createElement('button'); b.className = 'bi' + (id === build.sel ? ' sel' : ''); b.innerHTML = '<b>' + c.icon + '</b><small>' + c.name + '</small>'; b.onclick = () => { build.setType(id); renderBuild(); }; items.appendChild(b); });
    const cols = $('bColors'); cols.innerHTML = '';
    build.PAL.forEach((c, i) => { const b = document.createElement('button'); b.className = 'sw sm' + (i === build.color ? ' sel' : ''); b.style.background = '#' + c.toString(16).padStart(6, '0'); b.setAttribute('aria-label', 'Farbe ' + (i + 1)); b.onclick = () => { build.color = i; renderBuild(); }; cols.appendChild(b); });
  }
  function toggleBuild() {
    if (state !== 'play' || rs.ui || sl.t >= 0 || wardOpen) return;
    if (build.active) { exitBuild(); return; }
    if (P.veh) { say('🏗️ Zum Bauen erst aussteigen', 1600); return; }
    fun.setDance(false); build.enter(P.x, P.z, P.h); preBuild = { pitch: cam.pitch, zoom: cam.zoom }; cam.pitch = .95; cam.zoom = 1.8;
    document.body.classList.add('building'); $('buildPanel').hidden = false; $('bBuild').classList.add('on'); renderBuild(); updateButtons(true);
    say(isTouch() ? '🏗️ Tippe auf den Boden, wähle ein Teil und drücke ✔ Bauen' : '🏗️ Klicke auf den Boden, wähle ein Teil und drücke G oder ✔ Bauen', 4200);
  }
  function exitBuild() {
    build.exit(); document.body.classList.remove('building'); $('buildPanel').hidden = true; $('bBuild').classList.remove('on');
    if (preBuild) { cam.pitch = preBuild.pitch; cam.zoom = preBuild.zoom; } updateButtons(true);
  }
  $('bBuild').addEventListener('click', toggleBuild); $('bClose').addEventListener('click', exitBuild);
  $('bRot').addEventListener('click', () => { build.rotate(); A.pop(); }); $('bPlace').addEventListener('click', () => build.place()); $('bDel').addEventListener('click', () => build.remove());
  $('bClear').addEventListener('click', () => { if (performance.now() - clearT < 3000) { build.clearAll(); clearT = 0; say('🧹 Alles weggeräumt', 1600); } else { clearT = performance.now(); say('Nochmal drücken: ALLES wegräumen?', 2800); } });
  const pickers = [], refreshPickers = () => { for (const f of pickers) f(); $('hello').textContent = 'Hallo ' + heroName() + '! ♥'; for (const i of document.querySelectorAll('.pn')) if (i !== document.activeElement) i.value = save.pname || ''; };
  function setPet(kind) {
    const def = BI.PETS.find(q => q.id === kind) || BI.PETS[0], g = pup.d.group, was = g.parent; freeObj(g); pup.d = BI.makePet(def.id); pup.name = def.name; pup.trick = null; if (was) scene.add(pup.d.group); pup.d.group.position.set(pup.x, 0, pup.z);
    save.pet = def.id; persist();
  }
  function buildHeroPicker(box) {
    box.innerHTML = '<div class="lab">Wie heißt du?</div><input class="pn" maxlength="12" placeholder="Dein Name" autocomplete="off"><div class="lab">Wer spielt mit?</div><div class="hgrid"></div><div class="cust" hidden><div class="row sws"></div><div class="row skn"></div><div class="row hrs"></div><div class="row sts"></div><div class="row pns"></div><div class="row hts"></div></div><div class="lab">Mein Haustier</div><div class="row pets"></div>';
    const hg = box.querySelector('.hgrid'), cust = box.querySelector('.cust'), sws = box.querySelector('.sws'), hts = box.querySelector('.hts'), skn = box.querySelector('.skn'), hrs = box.querySelector('.hrs'), sts = box.querySelector('.sts'), pns = box.querySelector('.pns'), pnI = box.querySelector('.pn'), pts = box.querySelector('.pets');
    BI.HEROES.forEach(h => { const b = document.createElement('button'); b.className = 'hc'; b.innerHTML = '<b>' + h.icon + '</b>' + h.name; b.onclick = () => { save.hero = h.id; persist(); buildChar(); refreshPickers(); A.pop(); }; hg.appendChild(b); });
    BI.SHIRTS.forEach((c, i) => { const b = document.createElement('button'); b.className = 'sw'; b.style.background = '#' + c.toString(16).padStart(6, '0'); b.setAttribute('aria-label', 'Farbe ' + (i + 1)); b.onclick = () => { save.shirt = i; persist(); buildChar(); refreshPickers(); }; sws.appendChild(b); });
    pnI.value = save.pname || ''; pnI.addEventListener('change', () => { save.pname = pnI.value.replace(/[<>&]/g, '').trim().slice(0, 12); persist(); buildChar(); refreshPickers(); A.pop(); });
    const sw = (row, arr, key) => arr.forEach((c, i) => { const b = document.createElement('button'); b.className = 'sw'; b.style.background = '#' + c.toString(16).padStart(6, '0'); b.setAttribute('aria-label', key + ' ' + (i + 1)); b.onclick = () => { save.cu[key] = i; persist(); buildChar(); refreshPickers(); }; row.appendChild(b); });
    sw(skn, BI.SKINS, 'skin'); sw(hrs, BI.HAIRS, 'hair'); sw(pns, BI.PANTS, 'pants');
    BI.STYLES.forEach((s, i) => { const b = document.createElement('button'); b.className = 'hat'; b.textContent = ['👤', '⚡', '🌀', '💇', '🎀', '🍥', '🐴'][i]; b.setAttribute('aria-label', 'Frisur ' + s); b.onclick = () => { save.cu.style = i; persist(); buildChar(); refreshPickers(); }; sts.appendChild(b); });
    BI.HATS.forEach((h, i) => { const b = document.createElement('button'); b.className = 'hat'; b.textContent = BI.HAT_ICONS[h]; b.setAttribute('aria-label', 'Mütze ' + h); b.onclick = () => { save.hat = i; persist(); buildChar(); refreshPickers(); }; hts.appendChild(b); });
    BI.PETS.forEach(p => { const b = document.createElement('button'); b.className = 'pill'; b.textContent = p.icon + ' ' + p.name; b.onclick = () => { setPet(p.id); refreshPickers(); A.pop(); }; pts.appendChild(b); });
    pickers.push(() => {
      [...hg.children].forEach((b, i) => b.classList.toggle('sel', BI.HEROES[i].id === save.hero)); cust.hidden = save.hero !== 'custom';
      [...sws.children].forEach((b, i) => b.classList.toggle('sel', i === save.shirt)); [...hts.children].forEach((b, i) => b.classList.toggle('sel', i === save.hat)); [[skn, 'skin'], [hrs, 'hair'], [sts, 'style'], [pns, 'pants']].forEach(([r, k]) => [...r.children].forEach((b, i) => b.classList.toggle('sel', i === (save.cu[k] | 0)))); [...pts.children].forEach((b, i) => b.classList.toggle('sel', BI.PETS[i].id === save.pet));
    });
  }
  buildHeroPicker($('heroPick')); buildHeroPicker($('wardPick'));
  { const TC = ['#ff4f9a', '#ff8a1f', '#ffb800', '#4cd07d', '#2d8cff', '#9b6bff']; let li = 0; $('ttl').innerHTML = 'Bunte Insel'.split(' ').map((w, wi) => '<div class="w">' + [...w].map((ch, i) => '<span style="--i:' + (i + wi * 6) + ';color:' + TC[li++ % 6] + '">' + ch + '</span>').join('') + '</div>').join('<i></i>'); }
  const menuView = v => { for (const e of $('menu').querySelectorAll('[data-v]')) e.hidden = e.dataset.v !== v; };
  /* ---------- Spielstände: 3 Plätze im Browser + Sicherungsdatei ---------- */
  const SLOT = BI.store.slot, slotName = s => { const i = BI.store.info(s); return i.has ? (i.pn || BI.heroById(i.hero).name) : 'Neu'; };
  function slotBarRefresh() { const i = BI.store.info(SLOT); $('slotBar').innerHTML = '<span>💾 Spielstand ' + SLOT + ' · ' + (i.has ? heroName() + ' · ⭐ ' + save.stars : 'Neu') + '</span><span>Wechseln ›</span>'; $('slotLab').textContent = '💾 Spielstand ' + SLOT + (saveOk ? '' : ' ⚠️ Speicher voll'); }
  function flushAll() { persist(); try { build.saveNow(); } catch (e) { } }
  function saveNow(quiet) { flushAll(); slotBarRefresh(); if (!quiet) say(saveOk ? '💾 Gespeichert ✔ (Spielstand ' + SLOT + ')' : '⚠️ Speicher voll – lösche Fotos oder sichere in eine Datei', 2600); }
  function download(name, obj) {
    const txt = JSON.stringify(obj), blob = new Blob([txt], { type: 'application/json' });
    try { const f = new File([blob], name, { type: 'application/json' }); if (navigator.canShare && navigator.canShare({ files: [f] })) { navigator.share({ files: [f], title: 'Bunte Insel Spielstand' }).catch(() => { }); return; } } catch (e) { }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.style.display = 'none'; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
  }
  function exportSlot(s) { if (s === SLOT) flushAll(); const d = BI.store.exportSlot(s); if (!d.data.save) return false; download('bunte-insel-spielstand-' + s + '.json', d); return true; }
  function switchSlot(n) { const m = BI.store.meta(); m.last = n; BI.store.setMeta(m); try { sessionStorage.setItem('bi_slot', String(n)); } catch (e) { } flushAll(); location.reload(); }
  let importTo = 0, armDel = 0; const slotMsg = t => { $('slotMsg').textContent = t || ''; };
  function renderSlots() {
    const box = $('slotList'); box.innerHTML = ''; if (SLOT) { /* aktuellen Stand erst sichern, damit die Karten stimmen */ flushAll(); }
    for (let s = 1; s <= 3; s++) {
      const i = BI.store.info(s), h = i.has ? BI.heroById(i.hero) : null, d = document.createElement('div'); d.className = 'slot' + (s === SLOT ? ' cur' : '');
      const when = i.ts ? new Date(i.ts).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }) : '';
      d.innerHTML = '<div class="sn">' + s + '</div><div class="sb"><b>' + (i.has ? h.icon + ' ' + h.name : '🆕 Neues Abenteuer') + '</b><small>' + (i.has ? '⭐ ' + i.stars + ' · 🏅 ' + i.stk + (when ? ' · ' + when : '') : 'Leer – hier startest du neu') + (s === SLOT ? ' · aktiv' : '') + '</small></div><div class="sa"></div>';
      const sa = d.querySelector('.sa'), mk = (t, cls, tt, fn) => { const b = document.createElement('button'); b.textContent = t; if (cls) b.className = cls; b.title = tt; b.setAttribute('aria-label', tt); b.onclick = fn; sa.appendChild(b); return b; };
      mk('▶', 'go', 'Spielen', () => { if (s === SLOT) menuView('home'); else switchSlot(s); });
      if (i.has) mk('📤', '', 'Sichern (Datei)', () => { slotMsg(exportSlot(s) ? '📤 Datei „bunte-insel-spielstand-' + s + '.json“ gespeichert' : 'Nichts zu sichern'); });
      mk('📥', '', 'Aus Datei laden', () => { importTo = s; $('slotFile').value = ''; $('slotFile').click(); });
      if (i.has) { const del = mk('🗑️', '', 'Löschen', () => { if (armDel === s) { armDel = 0; if (s === SLOT) BI.store.frozen = true; BI.store.clear(s); if (s === SLOT) { try { sessionStorage.setItem('bi_slot', String(s)); } catch (e) { } location.reload(); return; } slotMsg('🗑️ Spielstand ' + s + ' gelöscht'); renderSlots(); } else { armDel = s; del.classList.add('arm'); del.textContent = '❓'; slotMsg('Nochmal 🗑️ drücken zum Löschen'); setTimeout(() => { if (armDel === s) { armDel = 0; del.classList.remove('arm'); del.textContent = '🗑️'; } }, 3000); } }); }
      box.appendChild(d);
    }
  }
  $('slotFile').addEventListener('change', () => {
    const f = $('slotFile').files[0]; if (!f || !importTo) return; const s = importTo; importTo = 0; const rd = new FileReader();
    rd.onload = () => { let o = null; try { o = JSON.parse(rd.result); } catch (e) { } if (o && BI.store.importSlot(s, o)) { slotMsg('📥 Spielstand ' + s + ' geladen ✔'); if (s === SLOT) { try { sessionStorage.setItem('bi_slot', String(s)); } catch (e) { } setTimeout(() => location.reload(), 600); } else renderSlots(); } else slotMsg('⚠️ Das ist keine Bunte-Insel-Datei'); };
    rd.onerror = () => slotMsg('⚠️ Datei konnte nicht gelesen werden'); rd.readAsText(f);
  });
  $('slotBar').addEventListener('click', () => { slotMsg(''); renderSlots(); menuView('slots'); }); $('slotBack').addEventListener('click', () => menuView('home'));
  $('bSaveNow').addEventListener('click', () => saveNow()); $('bExport').addEventListener('click', () => { say(exportSlot(SLOT) ? '📤 Sicherungsdatei gespeichert' : 'Nichts zu sichern', 2200); });
  setInterval(() => { if (state !== 'menu') flushAll(); }, 20000);
  addEventListener('pagehide', flushAll); document.addEventListener('visibilitychange', () => { if (document.hidden) flushAll(); });
  slotBarRefresh();

  $('bHero').addEventListener('click', () => menuView('hero')); $('bHeroBack').addEventListener('click', () => { menuView('home'); slotBarRefresh(); });
  refreshPickers();

  /* ---------- Aktualisierung ---------- */
  const _p = {};
  function vehicleObstacles(x, z, r, self) {
    let hit = false;
    for (const o of vehicles) {
      if (o === self) continue;
      for (const off of o.cols) {
        const cx = o.x + Math.sin(o.h) * off, cz = o.z + Math.cos(o.h) * off, dx = x - cx, dz = z - cz, d = Math.hypot(dx, dz), m = r + o.r;
        if (d < m && d > 1e-6) { x += dx / d * (m - d); z += dz / d * (m - d); hit = true; }
      }
    }
    _p.x = x; _p.z = z; _p.hit = hit; return _p;
  }
  function axes() {
    let jx = (keys.r ? 1 : 0) - (keys.l ? 1 : 0), jy = (keys.u ? 1 : 0) - (keys.d ? 1 : 0);
    jx += inp.sx; jy += inp.sy; const l = Math.hypot(jx, jy); if (l > 1) { jx /= l; jy /= l; }
    if (shopOpen || rs.ui || mpOpen || wardOpen || gamesOpen || guideOpen || parentOpen || kids.busy() || garden.open || farm.bookOpen || kitchen.open || room.open || camp.open || combat.panelOpen || pool.busy() || sl.t >= 0 || (gm && gm.k === 'hide' && gm.phase === 'count' && gm.it === selfId())) return [0, 0];
    if (l < .12) { jx = jy = 0; } return [jx, jy];
  }
  let hitCool = 0, hornActive = false;
  function updatePlayer(dt) {
    const [jx, jy] = axes();
    if (inp.act) { inp.act = false; if (build.active) say('Beim Bauen: erst ✖ drücken', 1500); else if (shopOpen) closeShop(); else if (wardOpen) closeWard(); else if (rs.ui) { if (rs.ui !== 'play') closeRangeUi(); } else if (P.veh) leave(); else { const nv = nearVehicle(); if (nv) enter(nv); else if (nearCounter()) openShop(); else if (nearRange()) openRange(); else if (nearChest()) openChest(); else { const fn = flatNear(); if (fn) flatAct(fn); else { const pn = placeNear(); if (pn) placeAct(pn); } } } }
    if (inp.aux) { inp.aux = false; const v = P.veh; if (v && v.isTrain) trainDoors(); else if (v && v.spec.siren) { v.siren = !v.siren; A.pop(); } else if (!v) doPunch(); }
    if (rs.ui) { inp.jump = inp.aux = inp.hornEdge = false; return; }
    if (pool.busy()) { inp.jump = inp.aux = inp.hornEdge = false; return; }
    if (fun.dancing && (jx || jy || inp.jump || P.veh)) fun.setDance(false);
    if (P.veh) {
      const v = P.veh;
      if (v.isTrain) { train.update(dt, { thr: jy, turbo: inp.turbo }, fx); }
      else {
        const sp = v.step(dt, { steer: jx, thr: jy, turbo: inp.turbo, climb: (inp.up ? 1 : 0) - (inp.down ? 1 : 0) }, W, fx);
        const o = v.spec.fly && v.y > 3 ? { hit: false } : vehicleObstacles(v.x, v.z, v.r * .9, v); if (o.hit) { const d = Math.hypot(o.x - v.x, o.z - v.z); v.x = o.x; v.z = o.z; v.v *= .7; if (d > .1 && hitCool <= 0) { hitCool = .4; A.bump(); } }
        if (sp > 6 && hitCool <= 0) { hitCool = .4; A.bump(); cam.shake = .4; }
        if (v.spec.mow) farm.mow(v, dt);
      }
      // Hupe
      const sp = v.spec;
      if (inp.horn && sp.water && !v.isTrain) { v.spray(dt, fx); A.water(true); } else A.water(false);
      if (inp.horn && !(sp.water)) { if (sp.horn === 'melody') { A.melody(); } else A.horn(sp.horn, true); hornActive = true; } else if (hornActive) { A.horn('car', false); hornActive = false; }
      if (inp.hornEdge) { inp.hornEdge = false; if (sp.horn !== 'melody' && !sp.water) fx.burst(v.x, 2.4, v.z, 4, [BI.C.white], 2, .5, 18, 0); }
      A.engine(sp.kind, clamp(Math.abs(v.v) / sp.max + (sp.fly && v.y > .5 ? .25 : 0), 0, 1.2), true);
      if (!v.isTrain && sp.siren) A.siren(sp.siren, v.siren); else A.siren('police', false);
      if (v.spec.remote) { // Jannis bleibt stehen und lenkt mit der Fernsteuerung
        P.speed = 0; P.h += BI.angDiff(P.h, Math.atan2(v.x - P.x, v.z - P.z)) * Math.min(1, dt * 6); const g = char.group; g.position.set(P.x, P.y, P.z); g.rotation.set(0, P.h, 0);
        char.pose(t * 1.5, 0, false); char.armR.rotation.x = -1.2 + Math.sin(t * 3) * .05; char.armR.rotation.z = -.1;
      } else { P.x = v.x; P.z = v.z; P.h = v.h; }
    } else {
      A.engine('car', 0, false); A.siren('police', false); A.water(false); if (hornActive) { A.horn('car', false); hornActive = false; }
      const sw = pool.inWater(P.x, P.z), sm = Math.hypot(inp.sx, inp.sy), kbd = keys.u || keys.d || keys.l || keys.r, running = !sw && (jx || jy) && (inp.turbo || (!kbd && sm > .92)), spd = (running ? 8.8 : 4.6) * (sw === 2 ? .55 : sw === 1 ? .8 : 1);
      let dx = 0, dz = 0;
      if (jx || jy) {
        const fx_ = -Math.sin(cam.yaw), fz_ = -Math.cos(cam.yaw), rx = -fz_, rz = fx_; // Blick- und rechte Richtung
        dx = fx_ * jy + rx * jx; dz = fz_ * jy + rz * jx; const l = Math.hypot(dx, dz) || 1; const m = Math.min(1, Math.hypot(jx, jy));
        P.h += BI.angDiff(P.h, Math.atan2(dx, dz)) * Math.min(1, dt * 14); dx = dx / l * spd * m; dz = dz / l * spd * m;
      }
      P.x += dx * dt; P.z += dz * dt; P.speed = Math.hypot(dx, dz); P.running = !!running;
      if (running && P.y < .1 && Math.random() < dt * 12) fx.burst(P.x - Math.sin(P.h) * .3, .12, P.z - Math.cos(P.h) * .3, 1, [BI.C.dust], 1.2, .4, 22, 2);
      const q = W.resolve(P.x, P.z, .45, {}, P.y > .8 ? P.y : undefined); P.x = q.x; P.z = q.z;
      const o = vehicleObstacles(P.x, P.z, .45, null); P.x = o.x; P.z = o.z;
      const gy = W.groundY(P.x, P.z);
      if (inp.jump) { inp.jump = false; if (P.y <= gy + .05) { P.vy = 7; A.jump(); fx.burst(P.x, .2, P.z, 5, [BI.C.dust], 2, .5, 26, 3); } }
      if (fun.ride) P.vy = P.y < 6 ? 2.2 : 0; else P.vy = Math.max(P.vy - 20 * dt, P.softFall > 0 ? -5 : -14);
      if (P.softFall > 0) P.softFall -= dt;
      P.y += P.vy * dt;
      if (P.y < gy) { P.y = gy; P.vy = 0; if (build.nearType(P.x, P.z, 'tramp', 1.7)) { P.vy = 11.5; A.boing(); fx.burst(P.x, .3, P.z, 6, [BI.C.blue, BI.C.white], 3, .6, 24, 6); } }
      if (P.y <= gy + .02 && P.speed > .5 && Math.random() < dt * 10 && build.nearType(P.x, P.z, 'pool', 1.9)) { fx.burst(P.x, .3, P.z, 3, [BI.C.water], 2, .5, 24, 6); if (Math.random() < .2) A.splash(); }
      P.phase += dt * (6 + P.speed * 1.2); P.wave = Math.max(0, P.wave - dt);
      if (inp.hornEdge) {
        inp.hornEdge = false; P.wave = 1.4; A.hello(); pap.wiggle = 1; A.giggle(); fx.burst(P.x, 2.6, P.z, 6, [BI.C.pink, BI.C.gold], 2.2, 1.2, 36, -1.5);
        for (const n of npcs) if (Math.hypot(n.x - P.x, n.z - P.z) < 12) { n.hop = .6; n.wave = 2; }
        for (const a of animals) if (Math.hypot(a.x - P.x, a.z - P.z) < 12) { a.hop = .6; (a.k === 'cow' ? A.moo : A.baa)(); }
      }
      const g = char.group; g.position.set(P.x, P.y, P.z); g.rotation.y = P.h; g.rotation.x = running && P.y < .1 ? .14 : 0;
      if (P.punchT > 0) {
        P.punchT -= dt; const k = 1 - P.punchT / .4; if (!P.punchHit && k > .45) { P.punchHit = true; const T = fun.nearTree(); if (T) { fun.hitTree(T, P.x, P.z); kids.earn('tree'); } else A.whoosh(); }
        char.punch(k); g.rotation.x = .25 * Math.sin(Math.min(1, k) * Math.PI);
      } else if (fun.dancing) { char.dance(t, fun.style); g.position.y += Math.abs(Math.sin(t * 8)) * .18; g.rotation.y = P.h + Math.sin(t * 2) * .7; }
      else char.pose(P.phase, P.speed > .3 && P.y < .1 ? Math.min(1.1, P.speed * .17 + (running ? .2 : 0)) : (P.y > .1 ? .6 : 0), P.wave > 0);
      if (sw) swimPose(sw, dt);
    }
    hitCool -= dt;
  }
  function updatePup(dt) {
    const dv = P.veh && !P.veh.spec.remote ? P.veh : null;
    const px = dv ? dv.x : P.x, pz = dv ? dv.z : P.z, ph = dv ? dv.h : P.h; let tx, tz, sp = 0;
    pup.cd = Math.max(0, pup.cd - dt); pup.bark = Math.max(0, pup.bark - dt);
    if (pup.trick) {
      pup.trick.t += dt; pup.h += BI.angDiff(pup.h, Math.atan2(px - pup.x, pz - pup.z)) * Math.min(1, dt * 5);
      if (pup.trick.t >= pup.trick.dur) { pup.trick = null; pup.d.reset(); }
    } else if (pup.mode === 'fetch') {
      const Fe = pup.fetch;
      if (!Fe || !fun.balls.includes(Fe.ball) || (Fe.t += dt) > 40) { if (Fe && Fe.ball) Fe.ball.held = false; pup.mode = 'follow'; pup.fetch = null; }
      else {
        const bl = Fe.ball;
        if (Fe.phase === 'go') { tx = bl.x; tz = bl.z; sp = 10; if (Math.hypot(tx - pup.x, tz - pup.z) < 1.1) { Fe.phase = 'bring'; bl.held = true; A.bark(); pup.bark = .3; } }
        else {
          tx = px; tz = pz; sp = 8.5; bl.x = pup.x + Math.sin(pup.h) * .7; bl.z = pup.z + Math.cos(pup.h) * .7; bl.y = .55; bl.vx = bl.vz = bl.vy = 0;
          if (Math.hypot(tx - pup.x, tz - pup.z) < 2.4) { bl.held = false; bl.vx = Math.sin(pup.h) * 2; bl.vz = Math.cos(pup.h) * 2; bl.vy = 2.5; pup.mode = 'follow'; pup.fetch = null; pup.cd = 3; A.star(); addStars(1); pup.bark = .5; say('🐶 Brav, ' + pup.name + '! Ball gebracht! +1 ⭐', 2200); }
        }
      }
    }
    if (!pup.trick && pup.mode === 'search') {
      const s = pup.star; if (!s || !s.on) { pup.mode = 'follow'; }
      else {
        tx = s.x; tz = s.z; const d = Math.hypot(tx - pup.x, tz - pup.z);
        if (d < 1.3) { s.on = false; s.t = 45; A.star(); addStars(1); A.bark(); pup.bark = .5; pup.mode = 'follow'; pup.cd = 4; say('🐾 ' + pup.name + ' hat einen Stern gefunden! +1 ⭐', 2200); fx.burst(s.x, 1.2, s.z, 18, [BI.C.gold, BI.C.white, BI.C.dust], 5, .9, 26, 8); }
        else sp = 9.5;
      }
    }
    if (!pup.trick && pup.mode === 'follow') {
      const bx = -Math.sin(ph) * 2.4 + Math.cos(ph) * 1.0, bz = -Math.cos(ph) * 2.4 - Math.sin(ph) * 1.0; tx = px + bx; tz = pz + bz;
      const d = Math.hypot(tx - pup.x, tz - pup.z);
      if (dv) { /* im Fahrzeug bleibt Blitz sitzen und wartet */ }
      else if (d > 45) { pup.x = tx; pup.z = tz; fx.burst(pup.x, .6, pup.z, 8, [BI.C.white, BI.C.dust], 3, .6, 30, 2); }
      else sp = d > 1.0 ? Math.min(8.5, 1.5 + d * 2.4) : 0;
    }
    if (sp > 0) { const dx = tx - pup.x, dz = tz - pup.z; pup.h += BI.angDiff(pup.h, Math.atan2(dx, dz)) * Math.min(1, dt * 10); pup.x += Math.sin(pup.h) * sp * dt; pup.z += Math.cos(pup.h) * sp * dt; }
    else pup.h += BI.angDiff(pup.h, Math.atan2(px - pup.x, pz - pup.z)) * Math.min(1, dt * 4);
    const q = W.resolve(pup.x, pup.z, .35, {}); pup.x = q.x; pup.z = q.z; pup.speed = sp; pup.phase += dt * (sp > .3 ? 6 + sp * 1.2 : 2);
    const g = pup.d.group; let y = W.groundY(pup.x, pup.z);
    if (pup.bark > 0) y += Math.abs(Math.sin(pup.bark * 14)) * .18; if (fun.dancing) y += Math.abs(Math.sin(t * 8)) * .2;
    g.position.set(pup.x, y, pup.z); g.rotation.y = pup.h + (fun.dancing ? Math.sin(t * 3) * 1.2 : 0); pup.d.pose(pup.phase, sp > .3 ? Math.min(.85, sp * .12) : 0, pup.bark > 0 || fun.dancing || sp === 0);
    if (pup.trick) pup.d.trick(pup.trick.name, pup.trick.t / pup.trick.dur);
  }
  function togglePap() { save.papOff = !save.papOff; persist(); A.pop(); say(save.papOff ? '🎈 Pappnase abgelegt' : '🎈 Pappnase ist wieder da!', 1800); }
  function updatePap(dt) {
    pap.group.visible = str.visible = !save.papOff;
    const dv = P.veh && !P.veh.spec.remote ? P.veh : null;
    const v = dv; let hx, hy, hz;
    if (v) { hx = v.x; hy = (v.y || 0) + (v.isTrain ? 3.4 : 1.7); hz = v.z; }
    else { const ph = P.h; hx = P.x + Math.cos(ph) * .42 + Math.sin(ph) * .1; hy = P.y + .75; hz = P.z - Math.sin(ph) * .42 + Math.cos(ph) * .1; }
    const bob = Math.sin(t * 1.6) * .08 + (fun.dancing ? Math.abs(Math.sin(t * 8)) * .25 : 0), side = v ? 0 : .5, tx = hx + Math.cos(P.h) * side + Math.sin(t * .9) * .18, ty = hy + 1.0 + bob, tz = hz - Math.sin(P.h) * side + Math.cos(t * .7) * .15;
    if (pap.k == null) pap.k = { x: tx, y: ty, z: tz };
    pap.k.x = BI.damp(pap.k.x, tx, 6, dt); pap.k.y = BI.damp(pap.k.y, ty, 6, dt); pap.k.z = BI.damp(pap.k.z, tz, 6, dt);
    if (Math.hypot(pap.k.x - tx, pap.k.z - tz) > 25) { pap.k.x = tx; pap.k.y = ty; pap.k.z = tz; }
    pap.wiggle = Math.max(0, pap.wiggle - dt * 1.2); const g = pap.group; g.position.set(pap.k.x, pap.k.y, pap.k.z);
    g.rotation.y = Math.atan2(camera.position.x - g.position.x, camera.position.z - g.position.z); g.rotation.z = Math.sin(t * 1.1) * .07 + Math.sin(t * 28) * .35 * pap.wiggle;
    const a = strGeo.attributes.position; a.setXYZ(0, hx, hy, hz); a.setXYZ(1, pap.k.x, pap.k.y, pap.k.z); a.needsUpdate = true;
    const sg = shopPap.group; sg.position.y = 2.6 + Math.sin(t * 1.3) * .12; sg.rotation.y = Math.atan2(camera.position.x - sg.position.x, camera.position.z - sg.position.z); sg.rotation.z = Math.sin(t * .9) * .06;
    keeper.pose(t * 1.5, 0, Math.sin(t * .6) > .5);
  }
  function updateKite(dt) {
    const on = !!(save.equip && save.equip.kite); kiteC.group.visible = kiteLine.visible = on; if (!on) return;
    const dv = P.veh && !P.veh.spec.remote ? P.veh : null, ph = dv ? dv.h : P.h, bx = dv ? dv.x : P.x, bz = dv ? dv.z : P.z, by = dv ? (dv.y || 0) + 1.7 : P.y + .75;
    const hx = bx - Math.cos(ph) * .42 + Math.sin(ph) * .1, hz = bz + Math.sin(ph) * .42 + Math.cos(ph) * .1;
    const tx = hx - Math.cos(ph) * 1.3 + Math.sin(t * .8) * .9, ty = by + 5.2 + Math.sin(t * 1.1) * .5, tz = hz + Math.sin(ph) * 1.3 + Math.cos(t * .9) * .9;
    if (!kiteC.k) kiteC.k = { x: tx, y: ty, z: tz }; kiteC.k.x = BI.damp(kiteC.k.x, tx, 3, dt); kiteC.k.y = BI.damp(kiteC.k.y, ty, 3, dt); kiteC.k.z = BI.damp(kiteC.k.z, tz, 3, dt);
    const g = kiteC.group; g.position.set(kiteC.k.x, kiteC.k.y, kiteC.k.z); g.rotation.y = Math.atan2(camera.position.x - g.position.x, camera.position.z - g.position.z); g.rotation.z = Math.sin(t * 1.7) * .25;
    const a = kiteLine.geometry.attributes.position; a.setXYZ(0, hx, by, hz); a.setXYZ(1, kiteC.k.x, kiteC.k.y - .3, kiteC.k.z); a.needsUpdate = true;
  }
  let railT = 3;
  function updateWorldActors(dt) {
    updatePup(dt); updatePap(dt); updateKite(dt); chestCd = Math.max(0, chestCd - dt);
    { const od = onDeck(); if (od && !wasOnDeck && state === 'play') say('🏴‍☠️ Ahoi! Kanone 💥 im Schnellmenü, Schatztruhe vorn', 3600); wasOnDeck = od; }
    { const ins = inShop(); if (ins && !wasInShop && state === 'play') say('🧸 Willkommen im Spielzeugladen! An der Theke 🛒 drücken', 3500); wasInShop = ins; }
    const qx = P.veh ? P.veh.x : P.x, qz = P.veh ? P.veh.z : P.z;
    // Fahrzeuge, die auf den Gleisen stehen bleiben, werden freundlich neben die Strecke gesetzt (nie auf den Schienen parken)
    railT -= dt; if (railT <= 0) { railT = 1.5; for (const v of vehicles) { if (v.ai || v.driver || v === P.veh || v.spec.fly || v.spec.boat) continue; const d = W.railSdf(v.x, v.z); if (d < 3.2 && Math.hypot(v.x - qx, v.z - qz) > 8) { const e = 1.5, gx = W.railSdf(v.x + e, v.z) - W.railSdf(v.x - e, v.z), gz = W.railSdf(v.x, v.z + e) - W.railSdf(v.x, v.z - e), gl = Math.hypot(gx, gz) || 1, s = 8; const nx = v.x + gx / gl * s, nz = v.z + gz / gl * s; if (W.railSdf(nx, nz) > 5.5 && W.free(nx, nz, 1.5)) v.setPose(nx, nz, v.h); else v.setPose(v.x - gx / gl * s, v.z - gz / gl * s, v.h); v.v = 0; } } }
    // Parkende Fahrzeuge rollen aus
    for (const v of vehicles) if (!v.driver && !v.ai && Math.abs(v.v) > .05) { v.step(dt, { steer: 0, thr: 0 }, W, fx); }
    for (const v of vehicles) {
      if (v.driver || v === P.veh) { v.root.visible = true; v.visual(dt, t, fx); continue; }
      const far = Math.abs(v.x - qx) + Math.abs(v.z - qz) > 150; if (far === v.root.visible) v.root.visible = !far; if (!far) v.visual(dt, t, null);
    }
    // Verkehr
    for (const tr of traffic) {
      const v = tr.v; let sp = tr.sp;
      const ahead = (ox, oz) => { const dx = ox - v.x, dz = oz - v.z, f = dx * Math.sin(v.h) + dz * Math.cos(v.h); return f > 0 && f < 14 && Math.abs(dx * Math.cos(v.h) - dz * Math.sin(v.h)) < 3.2; };
      if (ahead(P.veh ? P.veh.x : P.x, P.veh ? P.veh.z : P.z)) sp = 0;
      for (const o of vehicles) if (o !== v && ahead(o.x, o.z) && Math.hypot(o.x - v.x, o.z - v.z) < 12) sp = 0;
      v.v = BI.damp(v.v, sp, 2.5, dt); tr.a += tr.dir * v.v / tr.lane * dt;
      const x = Math.sin(tr.a) * tr.lane, z = Math.cos(tr.a) * tr.lane; v.setPose(x, z, Math.atan2(Math.cos(tr.a) * tr.dir, -Math.sin(tr.a) * tr.dir));
    }
    if (P.veh !== trainVeh) train.update(dt, null, fx);
    // Menschen
    for (const n of npcs) {
      if (n.dancer <= 0 && Math.abs(n.x - qx) + Math.abs(n.z - qz) > (save.eco ? 70 : 120)) { if (n.c.group.visible) n.c.group.visible = false; if (n.lead && Math.abs(n.lead.x - n.x) + Math.abs(n.lead.z - n.z) > 14) { n.x = n.lead.x; n.z = n.lead.z; } continue; }
      if (!n.c.group.visible) n.c.group.visible = true;
      n.wait -= dt; n.hop = Math.max(0, n.hop - dt); let moving = false, dancing = false;
      const fl = P.veh && Math.abs(P.veh.v) > 3 && Math.hypot(n.x - P.veh.x, n.z - P.veh.z) < 7;
      if (fl) { const d = Math.hypot(n.x - P.veh.x, n.z - P.veh.z) || 1; n.x += (n.x - P.veh.x) / d * 5 * dt; n.z += (n.z - P.veh.z) / d * 5 * dt; n.h = Math.atan2(n.x - P.veh.x, n.z - P.veh.z); moving = true; }
      else if (n.lead && n.dancer <= 0) { /* Familie: Platz hinter dem Elternteil halten */
        const L = n.lead, sx = L.x - Math.sin(L.h) * n.fd + Math.cos(L.h) * n.fs, sz = L.z - Math.cos(L.h) * n.fd - Math.sin(L.h) * n.fs, dx = sx - n.x, dz = sz - n.z, d = Math.hypot(dx, dz);
        if (d > 16) { n.x = sx; n.z = sz; } else if (d > .5) { n.h += BI.angDiff(n.h, Math.atan2(dx, dz)) * Math.min(1, dt * 8); const sp = Math.min(5, n.spd + d * 1.1); n.x += Math.sin(n.h) * sp * dt; n.z += Math.cos(n.h) * sp * dt; moving = true; }
        else { n.h += BI.angDiff(n.h, L.h) * Math.min(1, dt * 3); if (n.kid && Math.random() < dt * .25) n.hop = .6; }
      }
      else if (n.wait <= 0) {
        const dx = n.tx - n.x, dz = n.tz - n.z, d = Math.hypot(dx, dz);
        if (d < .6 && n.dancer > 0) { dancing = true; n.h += BI.angDiff(n.h, Math.atan2(P.x - n.x, P.z - n.z)) * Math.min(1, dt * 6); }
        else if (d < .6) { n.wait = n.kid ? .2 + Math.random() * 1.6 : 1 + Math.random() * 4; if (n.kid && Math.random() < .4) n.hop = .6; const a = Math.random() * TAU, r = n.kid ? 4 + Math.random() * 9 : 6 + Math.random() * 16; n.tx = clamp(n.x + Math.sin(a) * r, -150, 150); n.tz = clamp(n.z + Math.cos(a) * r, -150, 150); }
        else { n.h += BI.angDiff(n.h, Math.atan2(dx, dz)) * Math.min(1, dt * 8); n.x += Math.sin(n.h) * n.spd * dt; n.z += Math.cos(n.h) * n.spd * dt; moving = true; }
      }
      const q = W.resolve(n.x, n.z, .4, {}); if (q.hit && Math.hypot(q.x - n.x, q.z - n.z) > .02) n.wait = 0, n.tx = n.x, n.tz = n.z; n.x = q.x; n.z = q.z;
      n.phase += dt * (moving ? 7 : 0); const g = n.c.group; g.position.set(n.x, n.hop > 0 ? Math.sin(n.hop / .6 * Math.PI) * .6 : 0, n.z); g.rotation.y = n.h;
      if (dancing) { n.c.dance(t + n.phase, n.style); g.position.y += Math.abs(Math.sin((t + n.phase) * 8)) * .15; } else n.c.pose(n.phase, moving ? .7 : 0, n.wave > 0 && (n.wave -= dt) > 0);
    }
    // Bahnsteig-Leute: steigen ein, kommen wieder, wenn der Zug weg ist
    platPeople.forEach((arr, idx) => {
      const stn = W.stations[idx], far = Math.hypot(train.cars[0].x - stn.x, train.cars[0].z - stn.z) > 90;
      for (const p of arr) {
        if (p.vis && p.leaveAt && t >= p.leaveAt) { p.vis = false; p.c.group.visible = false; pax++; A.pop(); fx.burst(p.x, 1.8, p.z, 5, [BI.C.pink], 2, 1, 30, -1); }
        else if (!p.vis && far) { p.vis = true; p.leaveAt = 0; p.c.group.visible = true; }
        if (p.vis) p.c.pose(t * 2 + p.ph, 0, Math.sin(t * .7 + p.ph) > .2);
      }
    });
    // Brunnen und Pools aus eigenen Bauten
    for (const it of build.items) if (build.CAT[it.t].fountain && Math.random() < dt * 25 && Math.hypot(it.gx * 4 - P.x, it.gz * 4 - P.z) < 70) { const a = Math.random() * TAU; fx.emit(it.gx * 4 + Math.sin(a) * .3, 2.6, it.gz * 4 + Math.cos(a) * .3, Math.sin(a) * 1.2, 4.5 + Math.random(), Math.cos(a) * 1.2, 1.2, 22, .6, .85, 1, 9, .85); }
    // Tiere
    for (const a of animals) {
      a.wait -= dt; a.hop = Math.max(0, a.hop - dt); let moving = false;
      if (a.wait <= 0) {
        const dx = a.tx - a.x, dz = a.tz - a.z, d = Math.hypot(dx, dz);
        if (d < .5) { a.wait = 1 + Math.random() * 5; a.tx = FR.x0 + Math.random() * (FR.x1 - FR.x0); a.tz = FR.z0 + Math.random() * (FR.z1 - FR.z0); }
        else { a.h += BI.angDiff(a.h, Math.atan2(dx, dz)) * Math.min(1, dt * 4); a.x += Math.sin(a.h) * .9 * dt; a.z += Math.cos(a.h) * .9 * dt; moving = true; }
      }
      a.ph += dt * (moving ? 6 : 1); a.m.position.set(a.x, (moving ? Math.abs(Math.sin(a.ph)) * .05 : 0) + (a.hop > 0 ? Math.sin(a.hop / .6 * Math.PI) * .7 : 0), a.z); a.m.rotation.y = a.h;
    }
    for (const d of ducks) { d.a += dt * .3; const L = W.lake; d.m.position.set(L.x + Math.sin(d.a) * d.r, .1 + Math.sin(t * 3 + d.a) * .03, L.z + Math.cos(d.a) * d.r); d.m.rotation.y = d.a + Math.PI / 2; }
    // Fontäne
    if (Math.random() < dt * 40) { const a = Math.random() * TAU; fx.emit(Math.sin(a) * .4, 3.6, Math.cos(a) * .4, Math.sin(a) * 1.4, 5 + Math.random() * 2, Math.cos(a) * 1.4, 1.5, 24, .6, .85, 1, 9, .85); }
    // Sterne
    const px = P.veh ? P.veh.x : P.x, pz = P.veh ? P.veh.z : P.z, R = P.veh ? 3.6 : 2.3, low = !P.veh || (P.veh.y || 0) < 5;
    for (let i = 0; i < NSTAR; i++) {
      const s = stars[i];
      if (!s.on) { s.t -= dt; if (s.t <= 0) { const p = starSpot(false); s.x = p.x; s.z = p.z; s.on = true; } dummy.scale.setScalar(0); }
      else {
        if (Math.abs(s.x - px) < R && Math.abs(s.z - pz) < R && Math.hypot(s.x - px, s.z - pz) < R && low && state === 'play') { s.on = false; s.t = 45; A.star(); addStars(1); gameStar(); fx.burst(s.x, 1.8, s.z, 14, [BI.C.gold, BI.C.white], 5, .9, 24, 8); }
        dummy.position.set(s.x, 1.9 + Math.sin(t * 2 + s.ph) * .25, s.z); dummy.rotation.set(0, t * 1.8 + s.ph, 0); dummy.scale.setScalar(1.1);
      }
      dummy.updateMatrix(); starMesh.setMatrixAt(i, dummy.matrix);
    }
    starMesh.instanceMatrix.needsUpdate = true;
  }

  /* ---------- Kamera ---------- */
  const camT = new THREE.Vector3();
  function blockedByBuilding(x, z, y) { for (const b of W.boxes) if (y < b.h && x > b.x0 - .6 && x < b.x1 + .6 && z > b.z0 - .6 && z < b.z1 + .6) return true; return false; }
  const EYE = { rc: [0, .45, .2], car: [0, 1.2, .3], police: [0, 1.2, .3], ambulance: [0, 1.9, 1.7], fire: [0, 2.5, 2.9], bus: [0, 2.4, 3.4], tractor: [0, 2.3, -.6], ice: [0, 1.5, 1.0], bike: [0, 1.8, -.1], heli: [0, 1.9, 1.2], train: [0, 3.0, -1.7] };
  function updateCamera(dt) {
    const v = P.veh; let tx, ty, tz, dist, pitch = cam.pitch;
    if (rs.ui === 'play' && state === 'play') { camera.position.set(RG.x + .9, 2.25, RG.z + 2.7); camera.lookAt(RG.x, 1.75, -88); cam.x = RG.x; cam.y = 2.25; cam.z = RG.z + 2.7; sun.position.set(RG.x + 60, 100, RG.z + 40); sun.target.position.set(RG.x, 0, RG.z); sky.position.set(RG.x, 0, RG.z); return; }
    if (state === 'menu') { cam.yaw += dt * .25; tx = P.x; ty = 1.1; tz = P.z; dist = 4.8; pitch = .22; }
    else if (v) {
      if (cam.ego && state === 'play') {
        const e = EYE[v.isTrain ? 'train' : v.type] || [0, 1.4, .4], ex = v.x + Math.sin(v.h) * e[2], ez = v.z + Math.cos(v.h) * e[2], ey = (v.y || 0) + e[1], yaw = v.h + cam.egoOff;
        if (drag.id == null) cam.egoOff = BI.damp(cam.egoOff, 0, 2.5, dt); if (v.spec.open) char.group.visible = false;
        camera.position.set(ex, ey, ez); camera.lookAt(ex + Math.sin(yaw) * 10, ey - .9 + (v.isTrain ? 0 : 0), ez + Math.cos(yaw) * 10); cam.x = ex; cam.y = ey; cam.z = ez; cam.dist = 3; sun.position.set(ex + 60, 100, ez + 40); sun.target.position.set(ex, 0, ez); sky.position.set(ex, 0, ez); return;
      }
      if (v.spec.open) char.group.visible = true;
      tx = v.x; tz = v.z; ty = (v.y || 0) + (v.isTrain ? 3 : 1.3); dist = (v.spec.cam || 9) * cam.zoom; if (v.isTrain) pitch = Math.max(pitch, .4);
      if (drag.id == null) { cam.idle += dt; const want = v.h + Math.PI, speed = Math.abs(v.v) > .5 ? 3.2 : 1.2; cam.yaw += BI.angDiff(cam.yaw, want) * Math.min(1, dt * speed); }
      pitch = BI.lerp(pitch, Math.abs(v.v) > 12 ? .3 : .42, .02);
    } else { tx = P.x; ty = P.y + 1.3; tz = P.z; dist = 7.2 * cam.zoom; const sh = Math.max(build.shelter(P.x, P.z), W.shelter ? W.shelter(P.x, P.z) : 0); cam.sp = BI.damp(cam.sp || 0, sh === 2 ? 1.12 : sh === 1 ? .85 : 0, 3, dt); if (cam.sp > .04 && !build.active) pitch = Math.max(pitch, cam.sp); }
    { const L = !v && combat.lock(); if (L) { tx = L.x; tz = L.z; ty = 1.3; dist = 9; pitch = .3; cam.yaw += BI.angDiff(cam.yaw, L.yaw) * Math.min(1, dt * 3); } }
    if (keys.q) cam.yaw += dt * 1.6; if (keys.r) cam.yaw -= dt * 1.6;
    // Gebäude zwischen Kamera und Ziel -> näher heranholen
    let d = dist; const cp = Math.cos(pitch), sx = Math.sin(cam.yaw) * cp, sz = Math.cos(cam.yaw) * cp;
    for (let i = 1; i <= 6; i++) { const f = i / 6; if (blockedByBuilding(tx + sx * dist * f, tz + sz * dist * f, Math.sin(pitch) * dist * f + ty)) { d = Math.max(2.8, dist * (f - 1 / 6)); break; } }
    cam.dist = BI.damp(cam.dist, d, d < cam.dist ? 12 : 3, dt);
    const gx = tx + sx * cam.dist, gz = tz + sz * cam.dist, gy = ty + Math.sin(pitch) * cam.dist;
    cam.x = BI.damp(cam.x, gx, 14, dt); cam.y = BI.damp(cam.y, gy, 14, dt); cam.z = BI.damp(cam.z, gz, 14, dt);
    camera.position.set(cam.x, Math.max(.8, cam.y), cam.z);
    if (cam.shake > 0) { cam.shake -= dt; camera.position.x += (Math.random() - .5) * .25; camera.position.y += (Math.random() - .5) * .25; }
    if (state === 'menu' && innerWidth > 860) camera.lookAt(tx + Math.cos(cam.yaw) * 1.5, ty + .2, tz - Math.sin(cam.yaw) * 1.5); else camera.lookAt(tx, ty + .4, tz);
    sun.position.set(tx + 60, 100, tz + 40); sun.target.position.set(tx, 0, tz);
    sky.position.set(tx, 0, tz);
  }

  /* ---------- Hauptschleife ---------- */
  function resize() {
    const w = innerWidth, h = innerHeight; renderer.setPixelRatio(QUAL[quality]); renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = w / h < .8 ? 74 : w / h < 1.2 ? 66 : 58; camera.updateProjectionMatrix(); if (rs.ui === 'play') rangeFov();
  }
  addEventListener('resize', resize); resize();
  let last = performance.now(), fpsAcc = 0, fpsN = 0, lowCount = 0;
  P.veh = null; cam.x = 0; cam.z = 40; cam.y = 7; cam.shake = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    let dt = (now - last) / 1000; last = now; if (dt > .1) dt = .1; if (dt <= 0) return;
    fpsAcc += dt; fpsN++;
    if (fpsN >= 90) { const avg = fpsAcc / fpsN; fpsAcc = fpsN = 0; if (avg > .027 && state === 'play') { if (++lowCount >= 2 && quality < 3) { quality++; lowCount = 0; resize(); } } else lowCount = 0; }
    if (state === 'pause') { renderer.render(scene, camera); return; }
    t += dt;
    if (mini.active) { mini.update(dt); updateGame(dt); kids.update(dt); sendNet(dt); if (state !== 'menu') A.music(dt, night > .5); return; }
    if (Math.abs(nightT - night) > .002) { night += clamp(nightT - night, -dt * .8, dt * .8); applyNight(); }
    if (state === 'play') { updatePlayer(dt); updateMission(dt); }
    else if (state === 'menu') { char.group.position.set(P.x, 0, P.z); char.group.rotation.y = P.h; char.pose(t * 2, 0, Math.sin(t) > .6); }
    updateWorldActors(dt); updateRange(dt); updateRemote(dt); updateEmojis(dt); updateGame(dt); kids.update(dt); updateGuide(dt); updateParent(dt); garden.update(dt, t); farm.update(dt, t); weather.update(dt, t); updateParties(dt); camp.update(dt, t, night); { const kk = Math.max(weather.wx, combat.dim); if (Math.abs(kk - wxK) > .004) { wxK = kk; applyWx(); } } pool.update(dt, t); sendNet(dt); updateFlatsLife(dt); updateSleep(dt);
    if (state === 'play') { fun.update(dt, t); combat.update(dt, t); } build.update(dt, t);
    W.update(t, dt, night); fx.update(dt, renderer.domElement.height);
    updateCamera(dt);
    if (state === 'play') { updateButtons(false); updateArrow(); updateGauge(); }
    if (state !== 'menu') A.music(dt, night > .5);
    if (toastT > 0) { toastT -= dt * 1000; if (toastT <= 0) $('toast').classList.remove('show'); }
    if (saveT > 0) { saveT -= dt; if (saveT <= 0) persist(); }
    if (state === 'play' && ((t * 8) | 0) % 2 === 0) drawMini();
    renderer.render(scene, camera);
  }
  spawnRC(true); if (save.owned.includes('rcheli')) spawnRC(true, 'rcheli');
  $('loading').hidden = true; $('menu').hidden = false;
  requestAnimationFrame(frame);
  // Test-/Debug-Zugriff
  window.__bi = { W, npcs, sendParty, visitFlat, parties, weather: () => weather, kitchen, camp, combat, boardTrain, nearStation, room, flatNear, flatAct, flats, kids, cam, openGuide, setGuide, beamTo, get guide() { return guide; }, openParent, closeParent, applyEco, DEST, garden, farm, pool, placeNear, placeAct, saveNow, switchSlot, exportSlot, SLOT, get t() { return t; }, kids, mini, openGames, closeGames, startGame, get gamesOpen() { return gamesOpen; }, get emosN() { return emos.length; }, sendEmoji, startGame, get gm() { return gm; }, showEmoji, flats, FB, flatNear, flatAct, startSleep, goHome, openWard, closeWard, get sl() { return sl; }, get wardOpen() { return wardOpen; }, mySlot, setPet, pup, refreshPickers, net, remote, openMp, mpShow, say, range, rs, RG, nearRange, openRange, beginRange, exitRange, rangeShoot, hannes, SHIP, onDeck, nearChest, openChest, chestCd: () => chestCd, boat: boatV, renderQuick, closeQuick, pap, SHOP, buyItem, openShop, closeShop, get shopOpen() { return shopOpen; }, nearCounter, inShop, spawnRC, pup, fun, build, doPunch, platPeople, trainDoors, get pax() { return pax; }, toggleBuild: () => toggleBuild(), toggleEgo: () => toggleEgo(), doFun: k => doFun(k), P, W, cam, inp, keys, vehicles, train, trainVeh, stars, npcs, animals, get state() { return state; }, get mission() { return mission; }, get save() { return save; }, enter, leave, nearVehicle, startPlay, pause, setNight: n => { nightT = n; }, get quality() { return quality; }, renderer };
})();
