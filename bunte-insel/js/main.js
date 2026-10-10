'use strict';
/* Bunte Insel – Spielschleife, Steuerung, Kamera, Missionen, Figuren, Tiere, Verkehr, Tag/Nacht */
(function () {
  const $ = id => document.getElementById(id), K = BI.WORLD, A = BI.audio, clamp = BI.clamp, TAU = BI.TAU;
  const save = Object.assign({ stars: 0, shirt: 0, hat: 0, sound: true, music: true, night: false, intro: false }, BI.store.get('save', {}));
  const persist = () => BI.store.set('save', save);
  const coarse = matchMedia('(pointer:coarse)').matches || 'ontouchstart' in window;
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
  function applyNight() {
    const n = night, mix = (a, b, out) => out.copy(a).lerp(b, n);
    const pos = skyGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) { const y = clamp(pos.getY(i) / 700, 0, 1), k = Math.pow(y, .6); tmpC.copy(DAY.hor).lerp(NIGHT.hor, n); tmpD.copy(DAY.top).lerp(NIGHT.top, n); tmpC.lerp(tmpD, k); skyCol[i * 3] = tmpC.r; skyCol[i * 3 + 1] = tmpC.g; skyCol[i * 3 + 2] = tmpC.b; }
    skyGeo.attributes.color.needsUpdate = true;
    mix(DAY.fog, NIGHT.fog, scene.fog.color); scene.background = scene.fog.color;
    mix(DAY.hs, NIGHT.hs, hemi.color); mix(DAY.hg, NIGHT.hg, hemi.groundColor); hemi.intensity = BI.lerp(.85, .62, n);
    mix(DAY.sun, NIGHT.sun, sun.color); sun.intensity = BI.lerp(.75, .4, n);
    if (world) { world.water.material.color.copy(DAY.wat).lerp(NIGHT.wat, n); world.setNight(n); }
    starPts.material.opacity = n; BI.headMat.color.setHex(0xfff6d0).lerp(tmpC.setHex(0xffff9a), n); BI.tailMat.color.setHex(0xa02020).lerp(tmpC.setHex(0xff2a2a), n);
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
  addVeh('ice', -9, -36, Math.PI); addVeh('bus', 31, 9, Math.PI / 2); addVeh('bike', 14, -9, .5, { color: 0xff8a1f }); addVeh('bike', 150, 14, 1.2, { color: 0xff5a9a });
  addVeh('car', 150, -12, 1.6, { color: 0x4cd07d });
  const traffic = [];
  for (let i = 0; i < 5; i++) {
    const dir = i % 2 ? -1 : 1, lane = dir > 0 ? K.RB + 2.2 : K.RB - 2.2, v = addVeh('car', 0, lane, 0, { color: BI.PAINT[(i * 3 + 1) % BI.PAINT.length], ai: true });
    traffic.push({ v, a: i / 5 * TAU + .4, dir, lane, sp: 8 + (i % 3) * 1.5 }); v.ai = true;
  }
  const train = new BI.Train(scene, W);
  const trainVeh = { isTrain: true, spec: { name: 'Zug', icon: '🚂', max: 24, kind: 'train', horn: 'train', cam: 17 }, get x() { return train.cars[0].x; }, get z() { return train.cars[0].z; }, get h() { return train.cars[0].h; }, get v() { return train.v; }, siren: false, r: 3 };

  /* ---------- Spielfigur, Menschen, Tiere ---------- */
  let char = null;
  function buildChar() {
    if (char) { if (char.group.parent) char.group.parent.remove(char.group); }
    char = BI.makeChar({ shirt: BI.SHIRTS[save.shirt], hat: BI.HATS[save.hat], pants: 0x3d4a7a }); scene.add(char.group); return char;
  }
  const P = { x: 0, z: 26, y: 0, vy: 0, h: Math.PI, phase: 0, wave: 0, veh: null, speed: 0, step: 0 };
  buildChar(); char.group.position.set(P.x, 0, P.z);

  const npcs = [];
  for (let i = 0; i < 12; i++) {
    const p = W.randRoadPoint(Math.random, 0, 0, 0), c = BI.makeChar({ shirt: BI.SHIRTS[(Math.random() * 6) | 0], pants: [0x3d4a7a, 0x5a3d2b, 0x2d6a4f, 0x7a3d6a][i % 4], hair: [0x6b4423, 0x222222, 0xd9a441, 0xa14a2b][i % 4], skin: [0xffd2a8, 0xe0a979, 0x8d5a3b, 0xf3c9a0][(i * 7) % 4], hat: i % 5 === 0 ? 'cap' : 'none' });
    const ox = 6.5 * (Math.random() < .5 ? -1 : 1), n = { c, x: p.x + (Math.abs(p.x) < 5 ? ox : 0), z: p.z + (Math.abs(p.z) < 5 ? ox : 0), h: Math.random() * TAU, tx: 0, tz: 0, wait: Math.random() * 3, phase: Math.random() * 6, hop: 0, spd: 1.5 + Math.random() };
    const q = W.resolve(n.x, n.z, .6, {}); n.x = q.x; n.z = q.z; n.tx = n.x; n.tz = n.z; scene.add(c.group); npcs.push(n);
  }
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
  const cam = { yaw: 0, pitch: .42, zoom: 1, off: 0, idle: 0, x: 0, y: 8, z: 40, dist: 8 };
  const inp = { kx: 0, ky: 0, sx: 0, sy: 0, horn: false, turbo: false, act: false, aux: false, jump: false, hornEdge: false };
  const keys = {};

  function say(txt, ms) { const el = $('toast'); el.textContent = txt; el.classList.add('show'); toastT = ms || 2600; }

  /* ---------- Einsteigen / Aussteigen ---------- */
  function nearVehicle() {
    let best = null, bd = 4.2;
    if (!P.veh) {
      for (const v of vehicles) { if (v.ai) continue; const d = Math.hypot(P.x - v.x, P.z - v.z) - v.r * 1.3 - Math.max(...v.cols.map(Math.abs)) * .5; if (d < bd) { bd = d; best = v; } }
      const dt_ = train.nearest(P.x, P.z); if (dt_ < 4.2 && dt_ < bd) best = trainVeh;
    }
    return best;
  }
  function enter(v) {
    P.veh = v; everDrove = true; A.enter();
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
    if (v.isTrain && train.v > 3) { say('Halte den Zug an zum Aussteigen 🚂', 2200); return; }
    A.leave(); A.horn('car', false); A.siren('police', false); A.water(false);
    const lx = Math.cos(v.h), lz = -Math.sin(v.h), rad = v.isTrain ? 5.5 : v.r + 1.3;
    let px = v.x + lx * rad, pz = v.z + lz * rad;
    if (v.isTrain) { const L = Math.hypot(v.x, v.z) || 1; px = v.x - v.x / L * 6; pz = v.z - v.z / L * 6; }
    if (!v.isTrain) { v.driver = null; v.siren = false; if (char.group.parent !== scene) { v.tilt.remove(char.group); scene.add(char.group); } char.group.rotation.set(0, 0, 0); }
    P.veh = null; char.group.visible = true;
    const q = W.resolve(px, pz, .5, {}); P.x = q.x; P.z = q.z; P.h = v.h; P.y = W.groundY(P.x, P.z); P.vy = 0;
    mission = null; clearMissionVisuals(); updateHud(); updateButtons(true);
  }

  /* ---------- Missionen ---------- */
  const MISSION_BY = { police: 'patrol', ambulance: 'rescue', fire: 'fire', bus: 'bus', ice: 'ice', car: 'taxi', bike: 'courier', tractor: 'hay', train: 'train' };
  const MTITLE = { patrol: ['🚓', 'Streife fahren'], rescue: ['🚑', 'Notruf!'], fire: ['🚒', 'Feuerwehr-Einsatz'], bus: ['🚌', 'Bus-Linie'], ice: ['🍦', 'Eis-Lieferung'], taxi: ['🚕', 'Taxi-Fahrt'], courier: ['📦', 'Paket-Kurier'], hay: ['🌾', 'Heu einsammeln'], train: ['🚂', 'Zug-Fahrt'] };
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
    else if (kind === 'train') { M.steps.push({ x: 0, z: 0, label: 'Fahre eine ganze Runde 🚂', type: 'lap', start: train.dist, prog: 0 }); M.steps.push({ x: 60, z: -118, label: 'Halte am Bahnhof 🚉', type: 'stop' }); }
    mission = M; showStep(); updateHud();
    if (first && !save.intro) { save.intro = true; persist(); }
  }
  function showStep() {
    const M = mission; if (!M) return; const s = M.steps[M.i];
    if (mNpc) { scene.remove(mNpc.c.group); mNpc = null; }
    const col = { patrol: 0x3f8cff, rescue: 0xff4a4a, fire: 0xff7a1f, bus: 0xffc933, ice: 0xff8fc8, taxi: 0xffd23f, courier: 0x4cd07d, hay: 0xe8c85a, train: 0x7a5ce0 }[M.kind];
    beacon.material.color.setHex(col); beaconRing.material.color.setHex(col);
    const hasPos = s.type === 'reach' || s.type === 'spray' || s.type === 'stop';
    beacon.visible = beaconRing.visible = hasPos && s.type !== 'spray'; flame.visible = s.type === 'spray';
    if (hasPos) { beacon.position.x = beaconRing.position.x = s.x; beacon.position.z = beaconRing.position.z = s.z; }
    if (s.type === 'spray') { flame.position.set(s.x + (Math.abs(s.x) > Math.abs(s.z) ? 0 : 5), 0, s.z + (Math.abs(s.x) > Math.abs(s.z) ? 5 : 0)); flame.scale.setScalar(1); s.fx = flame.position.x; s.fz = flame.position.z; }
    if (s.npc) { const c = BI.makeChar({ shirt: BI.SHIRTS[(Math.random() * 6) | 0], hat: Math.random() < .5 ? 'none' : 'cap' }); c.group.position.set(s.x + 3.2, 0, s.z + 1); c.group.rotation.y = -1.2; scene.add(c.group); mNpc = { c, x: s.x + 3.2, z: s.z + 1 }; }
  }
  function stepDone() {
    const M = mission, s = M.steps[M.i]; A.star(); addStars(1);
    const px = s.type === 'spray' ? s.fx : s.type === 'lap' ? P.veh.x : s.x, pz = s.type === 'spray' ? s.fz : s.type === 'lap' ? P.veh.z : s.z;
    fx.burst(px, 2, pz, 26, [BI.C.gold, BI.C.pink, BI.C.blue, BI.C.green], 8, 1.4, 26, 9);
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
    if (s.type === 'reach') { if (Math.hypot(v.x - s.x, v.z - s.z) < s.r) stepDone(); }
    else if (s.type === 'spray') {
      const d = Math.hypot(v.x - s.fx, v.z - s.fz);
      if (d < s.r && inp.horn && v.spec.water) { s.prog += dt / 3; flame.scale.setScalar(Math.max(.05, 1 - s.prog)); fx.emit(s.fx + (Math.random() - .5) * 2, 1 + Math.random() * 3, s.fz + (Math.random() - .5) * 2, 0, 2, 0, 1, 70, .6, .6, .6, -1, .6); if (s.prog >= 1) { flame.visible = false; stepDone(); } }
      else if (flame.visible) { flame.scale.y = 1 - s.prog * .9 + Math.sin(t * 14) * .08; if (Math.random() < dt * 12) fx.emit(s.fx + (Math.random() - .5) * 1.5, 3, s.fz + (Math.random() - .5) * 1.5, 0, 3, 0, 1.1, 60, .3, .3, .3, -1, .5); }
    }
    else if (s.type === 'lap') { s.prog = (train.dist - s.start) / W.track.L; if (s.prog >= .98) stepDone(); }
    else if (s.type === 'stop') { if (train.distToStop() < 9 && train.v < .8) stepDone(); }
    if (mNpc) { mNpc.c.pose(t * 6, .2, true); mNpc.c.group.position.y = Math.abs(Math.sin(t * 5)) * .25; }
    beacon.material.opacity = .26 + Math.sin(t * 4) * .08; beaconRing.scale.setScalar(1 + (t * 1.3 % 1) * .6); beaconRing.material.opacity = .7 * (1 - (t * 1.3 % 1));
  }
  function addStars(n) { save.stars += n; $('starN').textContent = save.stars; $('stars').classList.remove('pop'); void $('stars').offsetWidth; $('stars').classList.add('pop'); saveT = 1.5; }

  /* ---------- HUD ---------- */
  const mCard = $('mission'), arrow = $('mArrow');
  function updateHud() {
    const M = mission;
    if (M) {
      const s = M.steps[M.i], [ic, ti] = MTITLE[M.kind];
      $('mIcon').textContent = ic; $('mTitle').textContent = ti + (M.steps.length > 1 ? ' · ' + (M.i + 1) + '/' + M.steps.length : ''); $('mText').textContent = s.label; mCard.hidden = false;
    } else if (!P.veh && state === 'play') {
      $('mIcon').textContent = everDrove ? '⭐' : '🚗'; $('mTitle').textContent = everDrove ? 'Sterne sammeln' : 'Los geht\'s!'; $('mText').textContent = everDrove ? 'Lauf oder fahre zu den Sternen' : 'Geh zu einem Fahrzeug und steige ein'; mCard.hidden = false;
    } else mCard.hidden = true;
    $('starN').textContent = save.stars;
  }
  let btnSig = '';
  function updateButtons(force) {
    const v = P.veh, near = state === 'play' && !v ? nearVehicle() : null, spec = v ? v.spec : null;
    const sig = [!!v, near && (near.isTrain ? 'train' : near.type), spec && (spec.siren || spec.water || spec.horn)].join('|');
    if (sig === btnSig && !force) return; btnSig = sig;
    const act = $('bAct'), horn = $('bHorn'), aux = $('bAux'), jump = $('bJump');
    if (v) {
      act.hidden = false; act.innerHTML = '<b>🚪</b><small>Aussteigen</small>'; jump.hidden = false; jump.innerHTML = '<b>🚀</b><small>Turbo</small>';
      horn.hidden = false; horn.innerHTML = spec.water ? '<b>💦</b><small>Wasser</small>' : spec.horn === 'melody' ? '<b>🎵</b><small>Eis-Lied</small>' : '<b>📣</b><small>Hupe</small>';
      aux.hidden = !spec.siren; aux.innerHTML = '<b>🚨</b><small>Sirene</small>';
    } else {
      act.hidden = !near; if (near) act.innerHTML = '<b>' + near.spec.icon + '</b><small>Einsteigen</small>'; act.classList.toggle('pulse', !!near);
      jump.hidden = false; jump.innerHTML = '<b>⤒</b><small>Springen</small>'; horn.hidden = false; horn.innerHTML = '<b>👋</b><small>Hallo!</small>'; aux.hidden = true;
    }
  }
  function drawMini() {
    const c = miniC.getContext('2d'); c.clearRect(0, 0, miniC.width, miniC.height); c.drawImage(miniBase, 0, 0);
    const S = miniS * 2, k = S / (2 * (K.R + 6)), X = x => S / 2 + x * k, Y = z => S / 2 + z * k;
    if (mission) { const s = mission.steps[mission.i]; const tx = s.type === 'spray' ? s.fx : s.x, tz = s.type === 'spray' ? s.fz : s.z; if (s.type !== 'lap') { c.fillStyle = '#ff2d55'; c.beginPath(); c.arc(X(tx), Y(tz), 7, 0, TAU); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 2.5; c.stroke(); } }
    c.fillStyle = '#7a5ce0'; for (const cr of train.cars) c.fillRect(X(cr.x) - 2, Y(cr.z) - 2, 4, 4);
    const px = P.veh ? P.veh.x : P.x, pz = P.veh ? P.veh.z : P.z, ph = P.veh ? P.veh.h : P.h;
    c.save(); c.translate(X(px), Y(pz)); c.rotate(Math.PI - ph); c.fillStyle = '#fff'; c.strokeStyle = '#1b2a4a'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(0, -9); c.lineTo(6.5, 7); c.lineTo(0, 3.5); c.lineTo(-6.5, 7); c.closePath(); c.fill(); c.stroke(); c.restore();
  }
  function updateArrow() {
    let tx = null, tz = null, dist = 0;
    const px = P.veh ? P.veh.x : P.x, pz = P.veh ? P.veh.z : P.z;
    if (mission) { const s = mission.steps[mission.i]; if (s.type === 'spray') { tx = s.fx; tz = s.fz; } else if (s.type === 'lap') { arrow.hidden = true; $('mDist').textContent = Math.round(Math.min(1, s.prog) * 100) + ' %'; return; } else { tx = s.x; tz = s.z; } }
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
  const zone = $('zone'), sBase = $('stickBase'), sKnob = $('stickKnob'); const stick = { id: null, ox: 0, oy: 0 }, drag = { id: null, x: 0, y: 0 };
  zone.addEventListener('pointerdown', e => {
    A.resume(); if (state !== 'play') return;
    if (e.pointerType === 'touch' && e.clientX < innerWidth * .5 && stick.id == null) { stick.id = e.pointerId; stick.ox = e.clientX; stick.oy = e.clientY; sBase.style.left = e.clientX + 'px'; sBase.style.top = e.clientY + 'px'; sBase.classList.add('on'); sKnob.style.transform = 'translate(0,0)'; }
    else if (drag.id == null) { drag.id = e.pointerId; drag.x = e.clientX; drag.y = e.clientY; }
    try { zone.setPointerCapture(e.pointerId); } catch (x) { }
  });
  zone.addEventListener('pointermove', e => {
    if (e.pointerId === stick.id) { let dx = e.clientX - stick.ox, dy = e.clientY - stick.oy; const R = 58, l = Math.hypot(dx, dy); if (l > R) { dx *= R / l; dy *= R / l; } sKnob.style.transform = 'translate(' + dx + 'px,' + dy + 'px)'; setStick(dx / R, -dy / R); }
    else if (e.pointerId === drag.id) { cam.yaw -= (e.clientX - drag.x) * .006; cam.pitch = clamp(cam.pitch + (e.clientY - drag.y) * .004, .12, 1.1); drag.x = e.clientX; drag.y = e.clientY; cam.idle = 0; if (P.veh) cam.off = BI.angDiff(0, cam.off); }
  });
  const endPtr = e => { if (e.pointerId === stick.id) { stick.id = null; setStick(0, 0); sBase.classList.remove('on'); } if (e.pointerId === drag.id) drag.id = null; };
  zone.addEventListener('pointerup', endPtr); zone.addEventListener('pointercancel', endPtr);
  zone.addEventListener('wheel', e => { cam.zoom = clamp(cam.zoom * (e.deltaY > 0 ? 1.1 : .9), .6, 2.2); e.preventDefault(); }, { passive: false });
  zone.addEventListener('contextmenu', e => e.preventDefault());
  function hold(btn, key) {
    const on = e => { e.preventDefault(); e.stopPropagation(); A.resume(); inp[key] = true; if (key === 'horn') inp.hornEdge = true; btn.classList.add('down'); };
    const off = e => { inp[key] = false; btn.classList.remove('down'); };
    btn.addEventListener('pointerdown', on); btn.addEventListener('pointerup', off); btn.addEventListener('pointerleave', off); btn.addEventListener('pointercancel', off);
  }
  hold($('bHorn'), 'horn'); hold($('bJump'), 'turbo');
  $('bJump').addEventListener('pointerdown', () => { if (!P.veh) inp.jump = true; });
  const tap = (el, fn) => el.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); A.resume(); fn(); });
  tap($('bAct'), () => { inp.act = true; }); tap($('bAux'), () => { inp.aux = true; });
  const KMAP = { ArrowUp: 'u', KeyW: 'u', ArrowDown: 'd', KeyS: 'd', ArrowLeft: 'l', KeyA: 'l', ArrowRight: 'r', KeyD: 'r' };
  addEventListener('keydown', e => {
    if (e.repeat) { if (KMAP[e.code] || e.code === 'Space') e.preventDefault(); return; }
    A.resume();
    if (e.code === 'Escape' || e.code === 'KeyP') { if (state === 'play') pause(true); else if (state === 'pause') pause(false); return; }
    if (state !== 'play') { if ((e.code === 'Enter' || e.code === 'Space') && state === 'menu') { startPlay(); e.preventDefault(); } return; }
    if (KMAP[e.code]) { keys[KMAP[e.code]] = true; e.preventDefault(); }
    switch (e.code) {
      case 'Space': e.preventDefault(); if (P.veh) { inp.horn = true; inp.hornEdge = true; } else inp.jump = true; break;
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
    if (KMAP[e.code]) keys[KMAP[e.code]] = false;
    if (e.code === 'Space' || e.code === 'KeyH') inp.horn = false;
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') inp.turbo = false;
    if (e.code === 'KeyQ') keys.q = false; if (e.code === 'KeyR') keys.r = false;
  });
  addEventListener('blur', () => { for (const k in keys) keys[k] = false; inp.horn = inp.turbo = false; if (state === 'play') pause(true); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && state === 'play') pause(true); });

  /* ---------- Menüs ---------- */
  function toggleNight() { nightT = nightT > .5 ? 0 : 1; save.night = nightT === 1; persist(); $('bNight').textContent = save.night ? '☀️' : '🌙'; }
  function toggleSound() { save.sound = !save.sound; A.setMuted(!save.sound); persist(); $('bSound').textContent = save.sound ? '🔊' : '🔇'; }
  function toggleMusic() { save.music = !save.music; A.setMusic(save.music); persist(); $('bMusic').classList.toggle('off', !save.music); }
  function pause(on) { if (state === 'menu') return; state = on ? 'pause' : 'play'; $('pause').hidden = !on; if (on) { A.stopAll(); } setStick(0, 0); stick.id = drag.id = null; sBase.classList.remove('on'); }
  function startPlay() {
    A.resume(); try { window.focus(); } catch (e) { } state = 'play'; $('menu').hidden = true; $('hud').hidden = false; P.h = Math.PI; cam.yaw = 0; cam.pitch = .42; updateHud(); updateButtons(true);
    if (!save.intro) say(coarse ? 'Links wischen = laufen · rechts wischen = Kamera drehen' : 'WASD/Pfeile = laufen · E = einsteigen · Maus ziehen = Kamera', 5200);
  }
  $('bStart').addEventListener('click', startPlay);
  $('bResume').addEventListener('click', () => pause(false)); $('bPause').addEventListener('click', () => pause(true));
  $('bNight').addEventListener('click', toggleNight); $('bSound').addEventListener('click', toggleSound); $('bMusic').addEventListener('click', toggleMusic);
  $('bNight').textContent = save.night ? '☀️' : '🌙'; $('bSound').textContent = save.sound ? '🔊' : '🔇'; $('bMusic').classList.toggle('off', !save.music);
  const sw = $('swatches'), hp = $('hats');
  BI.SHIRTS.forEach((c, i) => { const b = document.createElement('button'); b.className = 'sw' + (i === save.shirt ? ' sel' : ''); b.style.background = '#' + c.toString(16).padStart(6, '0'); b.setAttribute('aria-label', 'Farbe ' + (i + 1)); b.onclick = () => { save.shirt = i; persist(); [...sw.children].forEach((x, j) => x.classList.toggle('sel', j === i)); buildChar(); }; sw.appendChild(b); });
  BI.HATS.forEach((h, i) => { const b = document.createElement('button'); b.className = 'hat' + (i === save.hat ? ' sel' : ''); b.textContent = BI.HAT_ICONS[h]; b.setAttribute('aria-label', 'Mütze ' + h); b.onclick = () => { save.hat = i; persist(); [...hp.children].forEach((x, j) => x.classList.toggle('sel', j === i)); buildChar(); }; hp.appendChild(b); });
  $('starN').textContent = save.stars;

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
    if (l < .12) { jx = jy = 0; } return [jx, jy];
  }
  let hitCool = 0, hornActive = false;
  function updatePlayer(dt) {
    const [jx, jy] = axes();
    if (inp.act) { inp.act = false; if (P.veh) leave(); else { const nv = nearVehicle(); if (nv) enter(nv); } }
    if (inp.aux) { inp.aux = false; const v = P.veh; if (v && !v.isTrain && v.spec.siren) { v.siren = !v.siren; A.pop(); } }
    if (P.veh) {
      const v = P.veh;
      if (v.isTrain) { train.update(dt, { thr: jy, turbo: inp.turbo }, fx); }
      else {
        const sp = v.step(dt, { steer: jx, thr: jy, turbo: inp.turbo }, W, fx);
        const o = vehicleObstacles(v.x, v.z, v.r * .9, v); if (o.hit) { const d = Math.hypot(o.x - v.x, o.z - v.z); v.x = o.x; v.z = o.z; v.v *= .7; if (d > .1 && hitCool <= 0) { hitCool = .4; A.bump(); } }
        if (sp > 6 && hitCool <= 0) { hitCool = .4; A.bump(); cam.shake = .4; }
      }
      // Hupe
      const sp = v.spec;
      if (inp.horn && sp.water && !v.isTrain) { v.spray(dt, fx); A.water(true); } else A.water(false);
      if (inp.horn && !(sp.water)) { if (sp.horn === 'melody') { A.melody(); } else A.horn(sp.horn, true); hornActive = true; } else if (hornActive) { A.horn('car', false); hornActive = false; }
      if (inp.hornEdge) { inp.hornEdge = false; if (sp.horn !== 'melody' && !sp.water) fx.burst(v.x, 2.4, v.z, 4, [BI.C.white], 2, .5, 18, 0); }
      A.engine(sp.kind, clamp(Math.abs(v.v) / sp.max, 0, 1.2), true);
      if (!v.isTrain && sp.siren) A.siren(sp.siren, v.siren); else A.siren('police', false);
      P.x = v.x; P.z = v.z; P.h = v.h;
    } else {
      A.engine('car', 0, false); A.siren('police', false); A.water(false); if (hornActive) { A.horn('car', false); hornActive = false; }
      const run = inp.turbo ? 1.6 : 1, spd = 5.4 * run;
      let dx = 0, dz = 0;
      if (jx || jy) {
        const fx_ = -Math.sin(cam.yaw), fz_ = -Math.cos(cam.yaw), rx = -fz_, rz = fx_; // Blick- und rechte Richtung
        dx = fx_ * jy + rx * jx; dz = fz_ * jy + rz * jx; const l = Math.hypot(dx, dz) || 1; const m = Math.min(1, Math.hypot(jx, jy));
        P.h += BI.angDiff(P.h, Math.atan2(dx, dz)) * Math.min(1, dt * 14); dx = dx / l * spd * m; dz = dz / l * spd * m;
      }
      P.x += dx * dt; P.z += dz * dt; P.speed = Math.hypot(dx, dz);
      const q = W.resolve(P.x, P.z, .45, {}); P.x = q.x; P.z = q.z;
      const o = vehicleObstacles(P.x, P.z, .45, null); P.x = o.x; P.z = o.z;
      const gy = W.groundY(P.x, P.z);
      if (inp.jump) { inp.jump = false; if (P.y <= gy + .05) { P.vy = 7; A.jump(); fx.burst(P.x, .2, P.z, 5, [BI.C.dust], 2, .5, 26, 3); } }
      P.vy -= 20 * dt; P.y += P.vy * dt; if (P.y < gy) { P.y = gy; P.vy = 0; }
      P.phase += dt * (6 + P.speed * 1.2); P.wave = Math.max(0, P.wave - dt);
      if (inp.hornEdge) {
        inp.hornEdge = false; P.wave = 1.4; A.hello(); fx.burst(P.x, 2.6, P.z, 6, [BI.C.pink, BI.C.gold], 2.2, 1.2, 36, -1.5);
        for (const n of npcs) if (Math.hypot(n.x - P.x, n.z - P.z) < 12) { n.hop = .6; n.wave = 2; }
        for (const a of animals) if (Math.hypot(a.x - P.x, a.z - P.z) < 12) { a.hop = .6; (a.k === 'cow' ? A.moo : A.baa)(); }
      }
      const g = char.group; g.position.set(P.x, P.y, P.z); g.rotation.y = P.h; g.rotation.x = 0;
      char.pose(P.phase, P.speed > .3 && P.y < .1 ? Math.min(.9, P.speed * .18) : (P.y > .1 ? .6 : 0), P.wave > 0);
    }
    hitCool -= dt;
  }
  function updateWorldActors(dt) {
    // Parkende Fahrzeuge rollen aus
    for (const v of vehicles) if (!v.driver && !v.ai && Math.abs(v.v) > .05) { v.step(dt, { steer: 0, thr: 0 }, W, fx); }
    for (const v of vehicles) if (v.driver) v.visual(dt, t, fx); else v.visual(dt, t, null);
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
      n.wait -= dt; n.hop = Math.max(0, n.hop - dt); let moving = false;
      const fl = P.veh && Math.abs(P.veh.v) > 3 && Math.hypot(n.x - P.veh.x, n.z - P.veh.z) < 7;
      if (fl) { const d = Math.hypot(n.x - P.veh.x, n.z - P.veh.z) || 1; n.x += (n.x - P.veh.x) / d * 5 * dt; n.z += (n.z - P.veh.z) / d * 5 * dt; n.h = Math.atan2(n.x - P.veh.x, n.z - P.veh.z); moving = true; }
      else if (n.wait <= 0) {
        const dx = n.tx - n.x, dz = n.tz - n.z, d = Math.hypot(dx, dz);
        if (d < .6) { n.wait = 1 + Math.random() * 4; const a = Math.random() * TAU, r = 6 + Math.random() * 16; n.tx = clamp(n.x + Math.sin(a) * r, -150, 150); n.tz = clamp(n.z + Math.cos(a) * r, -150, 150); }
        else { n.h += BI.angDiff(n.h, Math.atan2(dx, dz)) * Math.min(1, dt * 8); n.x += Math.sin(n.h) * n.spd * dt; n.z += Math.cos(n.h) * n.spd * dt; moving = true; }
      }
      const q = W.resolve(n.x, n.z, .4, {}); if (q.hit && Math.hypot(q.x - n.x, q.z - n.z) > .02) n.wait = 0, n.tx = n.x, n.tz = n.z; n.x = q.x; n.z = q.z;
      n.phase += dt * (moving ? 7 : 0); const g = n.c.group; g.position.set(n.x, n.hop > 0 ? Math.sin(n.hop / .6 * Math.PI) * .6 : 0, n.z); g.rotation.y = n.h; n.c.pose(n.phase, moving ? .7 : 0, n.wave > 0 && (n.wave -= dt) > 0);
    }
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
    const px = P.veh ? P.veh.x : P.x, pz = P.veh ? P.veh.z : P.z, R = P.veh ? 3.6 : 2.3;
    for (let i = 0; i < NSTAR; i++) {
      const s = stars[i];
      if (!s.on) { s.t -= dt; if (s.t <= 0) { const p = starSpot(false); s.x = p.x; s.z = p.z; s.on = true; } dummy.scale.setScalar(0); }
      else {
        if (Math.abs(s.x - px) < R && Math.abs(s.z - pz) < R && Math.hypot(s.x - px, s.z - pz) < R && state === 'play') { s.on = false; s.t = 45; A.star(); addStars(1); fx.burst(s.x, 1.8, s.z, 14, [BI.C.gold, BI.C.white], 5, .9, 24, 8); }
        dummy.position.set(s.x, 1.9 + Math.sin(t * 2 + s.ph) * .25, s.z); dummy.rotation.set(0, t * 1.8 + s.ph, 0); dummy.scale.setScalar(1.1);
      }
      dummy.updateMatrix(); starMesh.setMatrixAt(i, dummy.matrix);
    }
    starMesh.instanceMatrix.needsUpdate = true;
  }

  /* ---------- Kamera ---------- */
  const camT = new THREE.Vector3();
  function blockedByBuilding(x, z) { for (const b of W.boxes) if (x > b.x0 - .6 && x < b.x1 + .6 && z > b.z0 - .6 && z < b.z1 + .6) return true; return false; }
  function updateCamera(dt) {
    const v = P.veh; let tx, ty, tz, dist, pitch = cam.pitch;
    if (state === 'menu') { cam.yaw += dt * .25; tx = P.x; ty = 1.1; tz = P.z; dist = 4.8; pitch = .22; }
    else if (v) {
      tx = v.x; tz = v.z; ty = v.isTrain ? 3 : 1.3; dist = (v.spec.cam || 9) * cam.zoom; if (v.isTrain) pitch = Math.max(pitch, .4);
      if (drag.id == null) { cam.idle += dt; const want = v.h + Math.PI, speed = Math.abs(v.v) > .5 ? 3.2 : 1.2; cam.yaw += BI.angDiff(cam.yaw, want) * Math.min(1, dt * speed); }
      pitch = BI.lerp(pitch, Math.abs(v.v) > 12 ? .3 : .42, .02);
    } else { tx = P.x; ty = P.y + 1.3; tz = P.z; dist = 7.2 * cam.zoom; }
    if (keys.q) cam.yaw += dt * 1.6; if (keys.r) cam.yaw -= dt * 1.6;
    // Gebäude zwischen Kamera und Ziel -> näher heranholen
    let d = dist; const cp = Math.cos(pitch), sx = Math.sin(cam.yaw) * cp, sz = Math.cos(cam.yaw) * cp;
    for (let i = 1; i <= 6; i++) { const f = i / 6; if (blockedByBuilding(tx + sx * dist * f, tz + sz * dist * f) && Math.sin(pitch) * dist * f + ty < 12) { d = Math.max(2.8, dist * (f - 1 / 6)); break; } }
    cam.dist = BI.damp(cam.dist, d, d < cam.dist ? 12 : 3, dt);
    const gx = tx + sx * cam.dist, gz = tz + sz * cam.dist, gy = ty + Math.sin(pitch) * cam.dist;
    cam.x = BI.damp(cam.x, gx, 14, dt); cam.y = BI.damp(cam.y, gy, 14, dt); cam.z = BI.damp(cam.z, gz, 14, dt);
    camera.position.set(cam.x, Math.max(.8, cam.y), cam.z);
    if (cam.shake > 0) { cam.shake -= dt; camera.position.x += (Math.random() - .5) * .25; camera.position.y += (Math.random() - .5) * .25; }
    camera.lookAt(tx, ty + .4, tz);
    sun.position.set(tx + 60, 100, tz + 40); sun.target.position.set(tx, 0, tz);
    sky.position.set(tx, 0, tz);
  }

  /* ---------- Hauptschleife ---------- */
  function resize() {
    const w = innerWidth, h = innerHeight; renderer.setPixelRatio(QUAL[quality]); renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = w / h < .8 ? 74 : w / h < 1.2 ? 66 : 58; camera.updateProjectionMatrix();
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
    if (Math.abs(nightT - night) > .002) { night += clamp(nightT - night, -dt * .8, dt * .8); applyNight(); }
    if (state === 'play') { updatePlayer(dt); updateMission(dt); }
    else if (state === 'menu') { char.group.position.set(P.x, 0, P.z); char.group.rotation.y = P.h; char.pose(t * 2, 0, Math.sin(t) > .6); }
    updateWorldActors(dt);
    W.update(t, dt, night); fx.update(dt, renderer.domElement.height);
    updateCamera(dt);
    if (state === 'play') { updateButtons(false); updateArrow(); }
    if (state !== 'menu') A.music(dt, night > .5);
    if (toastT > 0) { toastT -= dt * 1000; if (toastT <= 0) $('toast').classList.remove('show'); }
    if (saveT > 0) { saveT -= dt; if (saveT <= 0) persist(); }
    if (state === 'play' && ((t * 8) | 0) % 2 === 0) drawMini();
    renderer.render(scene, camera);
  }
  $('loading').hidden = true; $('menu').hidden = false;
  requestAnimationFrame(frame);
  // Test-/Debug-Zugriff
  window.__bi = { P, W, cam, inp, keys, vehicles, train, trainVeh, stars, npcs, animals, get state() { return state; }, get mission() { return mission; }, get save() { return save; }, enter, leave, nearVehicle, startPlay, pause, setNight: n => { nightT = n; }, get quality() { return quality; }, renderer };
})();
