'use strict';
/* Bunte Insel – Fahrzeuge (Auto, Motorrad, Polizei, Krankenwagen, Feuerwehr, Bus, Traktor, Eiswagen) und der Zug */
BI.VEH = {
  car:       { name: 'Auto', icon: '🚗', max: 22, rev: 7, acc: 11, brake: 24, drag: 5, turn: 1.9, kind: 'car', horn: 'car', cols: [-1.2, 1.2], r: 1.05, cam: 9 },
  bike:      { name: 'Motorrad', icon: '🏍️', max: 28, rev: 4, acc: 15, brake: 22, drag: 5, turn: 2.3, kind: 'bike', horn: 'bike', cols: [-.5, .5], r: .5, open: true, cam: 7 },
  police:    { name: 'Polizeiauto', icon: '🚓', max: 27, rev: 7, acc: 13, brake: 24, drag: 5, turn: 1.9, kind: 'car', horn: 'car', siren: 'police', cols: [-1.2, 1.2], r: 1.05, cam: 9 },
  ambulance: { name: 'Krankenwagen', icon: '🚑', max: 24, rev: 6, acc: 10, brake: 22, drag: 5, turn: 1.7, kind: 'car', horn: 'truck', siren: 'ambulance', cols: [-1.5, 1.5], r: 1.2, cam: 10.5 },
  fire:      { name: 'Feuerwehr', icon: '🚒', max: 19, rev: 5, acc: 8, brake: 20, drag: 5, turn: 1.4, kind: 'car', horn: 'truck', siren: 'fire', water: true, cols: [-2.2, 0, 2.2], r: 1.4, cam: 12 },
  bus:       { name: 'Bus', icon: '🚌', max: 16, rev: 5, acc: 6, brake: 18, drag: 4, turn: 1.3, kind: 'car', horn: 'bus', cols: [-2.8, 0, 2.8], r: 1.45, cam: 13 },
  tractor:   { name: 'Traktor', icon: '🚜', max: 10, rev: 4, acc: 5, brake: 14, drag: 4, turn: 1.5, kind: 'tractor', horn: 'tractor', open: true, offroad: 1, cols: [-.8, 1], r: 1.2, cam: 8 },
  rc:        { name: 'RC-Auto', icon: '🏎️', max: 15, rev: 5, acc: 16, brake: 24, drag: 6, turn: 2.8, kind: 'bike', horn: 'bike', cols: [-.42, .42], r: .42, cam: 4.2, scale: .36, remote: true },
  boat:      { name: 'Segelboot', icon: '⛵', max: 14, rev: 3.5, acc: 4.5, brake: 7, drag: 1.6, turn: 1.3, kind: 'tractor', horn: 'bus', boat: true, open: true, cols: [-1, 1], r: 1.3, cam: 11 },
  rcheli:    { name: 'RC-Hubschrauber', icon: '🚁', max: 16, rev: 5, turn: 2.4, kind: 'heli', horn: 'bike', fly: true, remote: true, cols: [0], r: .5, cam: 5, scale: .3 },
  heli:      { name: 'Hubschrauber', icon: '🚁', max: 30, rev: 8, turn: 1.7, kind: 'heli', horn: 'bike', fly: true, cols: [0], r: 1.7, cam: 15 },
  ice:       { name: 'Eiswagen', icon: '🍦', max: 18, rev: 6, acc: 9, brake: 20, drag: 5, turn: 1.8, kind: 'car', horn: 'melody', cols: [-1.4, 1.4], r: 1.15, cam: 9.5 }
};
BI.headMat = new THREE.MeshBasicMaterial({ color: 0xfff6d0 });
BI.tailMat = new THREE.MeshBasicMaterial({ color: 0xa02020 });

(function () {
  const GLASS = 0xa8dcff, DARK = 0x2b2f3a, SILVER = 0xc9ced6, wheelGeos = {};
  function wheelGeo(r, w) {
    const key = r + '|' + w; if (wheelGeos[key]) return wheelGeos[key];
    const b = new BI.Batch(); b.cyl(0, -w / 2, 0, r, r, w, 0x23262d, 12, 0, 0, Math.PI / 2); b.cyl(0, -(w + .06) / 2, 0, r * .55, r * .55, w + .06, 0xd6dae2, 8, 0, 0, Math.PI / 2);
    return wheelGeos[key] = b.mesh(BI.mat()).geometry;
  }
  function addBox(m, x, y, z, w, h, d, mat) { const mm = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); mm.position.set(x, y, z); m.add(mm); return mm; }
  const horiz = (b, x, y, z, r, len, color, seg = 10) => b.cyl(x, y - len / 2, z, r, r, len, color, seg, Math.PI / 2); // Zylinder entlang z, Mitte (x,y,z)

  const MODELS = {
    car(b, o) {
      const c = o.color || 0xe8453c;
      b.box(0, .25, 0, 1.9, .55, 4.2, c); b.box(0, .8, -.15, 1.62, .62, 2.3, c); b.box(0, .86, -.15, 1.66, .42, 2.1, GLASS);
      for (const z of [-1.15, .85]) for (const x of [-.82, .82]) b.box(x, .8, z, .1, .62, .12, c);
      b.box(0, 1.38, -.15, 1.5, .08, 2.2, c); b.box(0, .2, 2.05, 1.8, .3, .2, DARK); b.box(0, .2, -2.05, 1.8, .3, .2, DARK);
      return { wheels: [[.95, .38, 1.3, .38, .26, 1], [-.95, .38, 1.3, .38, .26, 1], [.95, .38, -1.3, .38, .26, 0], [-.95, .38, -1.3, .38, .26, 0]], head: [[-.65, .55, 2.1], [.65, .55, 2.1]], tail: [[-.65, .6, -2.1], [.65, .6, -2.1]] };
    },
    police(b) {
      const o = MODELS.car(b, { color: 0xf4f6fa });
      b.box(0, .45, 0, 1.94, .16, 4.0, 0x2f5fd0); b.box(0, .6, 1.5, 1.94, .02, .9, 0x23262d); b.box(0, 1.46, -.15, 1.1, .14, .4, DARK);
      b.box(0, 1.15, 1.18, 1.6, .02, .02, 0x2f5fd0);
      o.beacons = [[-.38, 1.62, -.15, 0xff2020], [.38, 1.62, -.15, 0x2060ff]]; return o;
    },
    ambulance(b) {
      b.box(0, .45, 0, 2.1, 1.9, 5.0, 0xfafcff); b.box(0, .85, 0, 2.14, .26, 4.9, 0xe53b3b); b.box(0, 1.1, 2.51, 1.8, .7, .05, GLASS);
      for (const x of [-1.06, 1.06]) { b.box(x, 1.1, 1.6, .05, .65, 1.1, GLASS); b.box(x, 1.25, -.7, .05, 1.0, .3, 0xe53b3b); b.box(x, 1.6, -.7, .05, .3, 1.0, 0xe53b3b); }
      b.box(0, 2.35, 1.4, 1.5, .14, .4, DARK); b.box(0, .25, 2.55, 2.0, .3, .2, DARK); b.box(0, .25, -2.55, 2.0, .3, .2, DARK);
      return { wheels: [[1.0, .45, 1.6, .45, .3, 1], [-1.0, .45, 1.6, .45, .3, 1], [1.0, .45, -1.6, .45, .3, 0], [-1.0, .45, -1.6, .45, .3, 0]], head: [[-.7, .75, 2.52], [.7, .75, 2.52]], tail: [[-.8, .75, -2.52], [.8, .75, -2.52]], beacons: [[-.5, 2.5, 1.4, 0xff2020], [.5, 2.5, 1.4, 0x2060ff]] };
    },
    fire(b) {
      const R = 0xe0382b;
      b.box(0, .5, 0, 2.3, 1.2, 7.0, R); b.box(0, 1.7, 2.3, 2.3, 1.0, 2.4, R); b.box(0, 1.9, 3.52, 2.1, .62, .05, GLASS); b.box(0, 1.7, -1.0, 2.2, .9, 4.2, R);
      for (const x of [-1.16, 1.16]) { b.box(x, 1.95, 2.4, .05, .6, 1.3, GLASS); b.box(x, 1.0, 0, .05, .3, 6.8, 0xfafafa); }
      b.box(0, 2.6, -.5, .08, .08, 5.6, SILVER); for (const x of [-.5, .5]) b.box(x, 2.6, -.5, .08, .1, 5.6, SILVER);
      for (let k = 0; k < 11; k++) b.box(0, 2.62, -3.1 + k * .5, 1.1, .06, .08, SILVER);
      b.cyl(0, 2.6, 2.9, .14, .14, .5, 0x333c4a, 6); b.box(0, .25, 3.55, 2.2, .3, .2, DARK); b.box(0, .25, -3.55, 2.2, .3, .2, DARK);
      return { wheels: [[1.1, .55, 2.4, .55, .36, 1], [-1.1, .55, 2.4, .55, .36, 1], [1.1, .55, -1.6, .55, .36, 0], [-1.1, .55, -1.6, .55, .36, 0], [1.1, .55, -2.9, .55, .36, 0], [-1.1, .55, -2.9, .55, .36, 0]],
        head: [[-.8, .75, 3.52], [.8, .75, 3.52]], tail: [[-.9, .75, -3.52], [.9, .75, -3.52]], beacons: [[-.7, 2.5, 2.3, 0xff2020], [.7, 2.5, 2.3, 0xff2020]], nozzle: [0, 3.1, 2.9] };
    },
    bus(b) {
      const Y = 0xffc93c;
      b.box(0, .55, 0, 2.5, 2.4, 8.6, Y); b.box(0, 1.45, 0, 2.54, .95, 8.4, GLASS); for (let k = -3; k <= 3; k++) b.box(0, 1.45, k * 1.2, 2.56, .95, .12, Y);
      b.box(0, 1.35, 4.31, 2.3, 1.1, .05, GLASS); b.box(0, 2.95, 0, 2.5, .12, 8.6, 0xfafafa); b.box(0, 1.0, 0, 2.54, .12, 8.62, 0x333c4a);
      b.box(0, .3, 4.35, 2.3, .3, .2, DARK); b.box(0, .3, -4.35, 2.3, .3, .2, DARK);
      return { wheels: [[1.2, .55, 3.0, .55, .36, 1], [-1.2, .55, 3.0, .55, .36, 1], [1.2, .55, -2.8, .55, .36, 0], [-1.2, .55, -2.8, .55, .36, 0]], head: [[-.85, .8, 4.33], [.85, .8, 4.33]], tail: [[-.9, .8, -4.33], [.9, .8, -4.33]] };
    },
    ice(b) {
      b.box(0, .4, 0, 2.0, 1.9, 4.8, 0xffe4f0); b.box(0, 1.2, 2.41, 1.8, .7, .05, GLASS); b.box(0, .85, 0, 2.04, .22, 4.7, 0x5ac8e6);
      b.box(1.02, 1.1, -.4, .05, .8, 1.6, 0x2b2f3a); for (let k = 0; k < 4; k++) b.box(1.3, 1.9, -1.1 + k * .5, .8, .12, .5, k % 2 ? 0xffffff : 0xff5a8f);
      b.cyl(0, 2.3, -.6, .55, .04, 1.5, 0xe0a458, 6); b.sph(0, 3.95, -.6, .6, 0xff8fb8, 1); b.sph(0, 4.7, -.6, .48, 0xfff1b8, 1); b.sph(0, 5.25, -.6, .08, 0xe53b3b, 0);
      b.box(0, .25, 2.45, 1.9, .3, .2, DARK); b.box(0, .25, -2.45, 1.9, .3, .2, DARK);
      return { wheels: [[.95, .42, 1.5, .42, .28, 1], [-.95, .42, 1.5, .42, .28, 1], [.95, .42, -1.5, .42, .28, 0], [-.95, .42, -1.5, .42, .28, 0]], head: [[-.65, .65, 2.42], [.65, .65, 2.42]], tail: [[-.7, .65, -2.42], [.7, .65, -2.42]] };
    },
    heli(b) {
      const Wh = 0xfafafa, R = 0xe0382b;
      b.sph(0, 1.25, .3, 1, Wh, 1, 1, .95, 1.55); b.sph(0, 1.35, 1.35, .8, GLASS, 1, .92, .8, .95);
      b.box(0, 1.0, -2.6, .34, .42, 3.6, Wh); b.box(0, 1.5, -4.0, .12, 1.1, .7, R); b.box(0, .95, .3, 2.12, .16, 2.6, R);
      for (const x of [-.85, .85]) { b.box(x, .02, .2, .1, .1, 3.2, DARK); b.box(x, .1, 1.0, .08, .75, .08, DARK); b.box(x, .1, -.7, .08, .75, .08, DARK); }
      b.box(0, 2.15, .1, .45, .5, .45, DARK);
      return { wheels: [], head: [[0, .6, 2.2]], tail: [[0, 1.2, -4.3]], rotor: { main: [0, 2.7, .1], tail: [.1, 1.8, -4.1] } };
    },
    bike(b, o) {
      const c = o.color || 0xff8a1f;
      b.box(0, .3, 0, .3, .4, 1.1, DARK); b.sph(0, .95, .3, .3, c, 1, .9, .8, 1.5); b.box(0, .78, -.5, .32, .12, .9, 0x23262d);
      b.box(0, .15, .95, .1, .95, .1, SILVER, 0, .32); b.box(0, 1.05, .78, .95, .06, .06, DARK); b.box(0, .4, -.55, .12, .12, 1.0, SILVER, 0, -.2);
      b.box(.28, .22, -.5, .14, .14, 1.0, SILVER); b.box(0, .62, -1.05, .34, .08, .5, c); b.box(0, .62, 1.12, .24, .06, .5, c);
      return { wheels: [[0, .4, 1.0, .4, .2, 1], [0, .4, -.95, .4, .24, 0]], head: [[0, .98, 1.1]], tail: [[0, .72, -1.3]], seat: [0, .85, -.45], lean: 1 };
    }
  };
  MODELS.boat = b => { // Segelboot: weißer Rumpf, blauer Streifen, Kajüte, Mast mit Segel und Wimpel
    const W0 = 0xf5f5f5;
    b.box(0, 0, -.2, 2.2, .75, 4.4, W0); b.box(-.55, 0, 2.5, 1.2, .75, 1.9, W0, -.5); b.box(.55, 0, 2.5, 1.2, .75, 1.9, W0, .5);
    b.box(0, .3, -.2, 2.24, .2, 4.44, 0x2d8cff); b.box(0, .75, -.1, 2.0, .08, 4.2, 0xc8a27a);
    b.box(0, .83, -1.35, 1.6, .85, 1.3, W0); b.box(0, 1.1, -1.35, 1.64, .3, 1.34, 0xa8dcff); b.box(0, 1.68, -1.35, 1.7, .08, 1.4, 0x2d8cff);
    b.cyl(0, .8, .9, .07, .07, 4.8, 0x8a5a33, 6); b.prism(0, 1.3, .0, 3.0, 3.6, .06, 0xfff3d6, Math.PI / 2); b.box(.0, 5.6, .9, .06, .3, .7, 0xff5a5a);
    b.box(0, .83, -2.3, .8, .08, .5, 0x6b4423);
    return { wheels: [], head: [[0, .85, 3.0]], tail: [[0, .85, -2.45]], seat: [0, .85, -.4] };
  };
  MODELS.rcheli = b => MODELS.heli(b);
  MODELS.rc = b => { // Jannis' rotes Rennauto: tiefer Keil, dunkle Scheiben, graue Felgen, Heckflügel, Aufkleber 38
    const R = 0xe2362a, DK = 0x1c1c24;
    b.box(0, .2, 0, 1.9, .42, 4.2, R); b.box(0, .62, -.3, 1.62, .38, 2.1, DK); b.box(0, .98, -.3, 1.5, .1, 1.5, R); b.box(0, .45, 1.45, 1.7, .1, 1.3, R);
    for (const x of [-.78, .78]) b.box(x, .62, -.3, .1, .4, 2.1, R); b.box(0, .62, .8, 1.6, .06, .12, R);
    b.box(0, .85, -2.0, 1.9, .08, .5, DK); for (const x of [-.7, .7]) b.box(x, .4, -1.95, .1, .5, .14, DK);
    for (let i = 0; i < 4; i++) b.box(-.3 + i * .2, .44, 1.75, .1, .02, .5, i % 2 ? 0xffffff : DK);
    return { wheels: [[.95, .38, 1.35, .38, .26, 1], [-.95, .38, 1.35, .38, .26, 1], [.95, .38, -1.3, .38, .26, 0], [-.95, .38, -1.3, .38, .26, 0]], head: [[-.65, .38, 2.12], [.65, .38, 2.12]], tail: [[-.7, .4, -2.12], [.7, .4, -2.12]], decal: '38' };
  };
  MODELS.tractor = function (b) {
    const G = 0x3fa84e, Y = 0xffd23f;
    b.box(0, .5, 1.0, 1.2, 1.0, 2.0, G); b.box(0, .75, -.75, 1.6, .2, 1.9, G); b.box(0, 1.3, -.1, 1.0, .7, .9, G);
    for (const x of [-.75, .75]) for (const z of [-1.5, .1]) b.box(x, .9, z, .1, 1.7, .1, Y);
    b.box(0, 2.55, -.7, 1.8, .1, 2.0, Y); b.box(0, 1.05, -1.35, .7, .18, .6, 0x23262d); b.box(0, 1.2, -1.6, .7, .5, .12, 0x23262d);
    b.cyl(.4, 1.5, 1.4, .07, .07, 1.2, 0x555b66, 6); b.box(0, .25, 2.05, 1.0, .25, .15, DARK);
    return { wheels: [[1.15, .95, -1.1, .95, .55, 0], [-1.15, .95, -1.1, .95, .55, 0], [.85, .5, 1.5, .5, .3, 1], [-.85, .5, 1.5, .5, .3, 1]], head: [[-.4, .8, 2.02], [.4, .8, 2.02]], tail: [[-.7, 1.0, -1.7], [.7, 1.0, -1.7]], seat: [0, 1.0, -.7] };
  };
  const PAINT = [0xe8453c, 0x3f8cff, 0xffc933, 0x4cd07d, 0xb36bff, 0xff8fc8, 0xff8a1f];
  BI.PAINT = PAINT;

  BI.Vehicle = class Vehicle {
    constructor(type, x, z, h, opts) {
      opts = opts || {}; this.type = type; this.spec = BI.VEH[type]; this.x = x; this.z = z; this.h = h || 0; this.v = 0; this.steerCur = 0; this.acc = 0; this.siren = false; this.beat = 0; this.driver = null; this.ai = !!opts.ai; this.yawIdle = 0; this.y = 0; this.vy = 0; this.rotorW = 0;
      const b = new BI.Batch(), model = (MODELS[type] || MODELS.car)(b, { color: opts.color }) || {};
      this.model = model; this.root = new THREE.Group(); this.tilt = new THREE.Group(); this.root.add(this.tilt);
      const body = b.mesh(BI.mat()); body.frustumCulled = false; this.tilt.add(body);
      this.wheels = (model.wheels || []).map(w => {
        const holder = new THREE.Group(); holder.position.set(w[0], w[1], w[2]); const m = new THREE.Mesh(wheelGeo(w[3], w[4]), BI.mat()); holder.add(m); this.tilt.add(holder); return { holder, m, r: w[3], steer: w[5] };
      });
      for (const p of model.head || []) addBox(this.tilt, p[0], p[1], p[2], .4, .2, .1, BI.headMat);
      for (const p of model.tail || []) addBox(this.tilt, p[0], p[1], p[2], .4, .18, .1, BI.tailMat);
      this.beacons = (model.beacons || []).map(p => { const mat = new THREE.MeshBasicMaterial({ color: p[3] }); const m = addBox(this.tilt, p[0], p[1], p[2], .4, .22, .3, mat); return { mat, base: p[3], m }; });
      if (model.rotor) {
        const mk = (bt, pos, ax) => { const g = new THREE.Group(); g.position.set(pos[0], pos[1], pos[2]); g.add(bt.mesh(BI.mat())); this.tilt.add(g); return g; };
        const mb = new BI.Batch(); mb.box(0, 0, 0, .4, .05, 7.4, 0x2b2f3a); mb.box(0, 0, 0, 7.4, .05, .4, 0x2b2f3a); this.rotorMain = mk(mb, model.rotor.main);
        const tb = new BI.Batch(); tb.box(0, -.6, 0, .06, 1.2, .16, 0x2b2f3a); this.rotorTail = mk(tb, model.rotor.tail);
        this.shadow = new THREE.Mesh(new THREE.CircleGeometry(1.9, 16), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .28, depthWrite: false })); this.shadow.rotation.x = -Math.PI / 2; this.root.add(this.shadow);
      }
      if (model.decal) { // Aufkleber mit Startnummer auf beiden Türen
        const cv = document.createElement('canvas'); cv.width = cv.height = 128; const c = cv.getContext('2d'); c.fillStyle = '#fff'; c.fillRect(0, 0, 128, 128); c.fillStyle = '#111'; c.fillRect(10, 10, 108, 108);
        c.font = 'bold 84px Arial Black, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 7; c.strokeStyle = '#fff'; c.strokeText(model.decal, 64, 68); c.fillStyle = '#e2362a'; c.fillText(model.decal, 64, 68);
        const tx = new THREE.CanvasTexture(cv), dm = new THREE.MeshBasicMaterial({ map: tx });
        for (const sd of [-1, 1]) { const pl = new THREE.Mesh(new THREE.PlaneGeometry(.75, .75), dm); pl.position.set(sd * .96, .3, .15); pl.rotation.y = sd * Math.PI / 2; pl.position.y = .45; this.tilt.add(pl); }
      }
      this.seat = model.seat || null; this.lean = model.lean || 0;
      this.cols = this.spec.cols; this.r = this.spec.r;
      if (this.spec.scale) this.root.scale.setScalar(this.spec.scale);
      this.root.position.set(x, 0, z); this.root.rotation.y = this.h;
    }
    setPose(x, z, h) { this.x = x; this.z = z; this.h = h; }
    stepFly(dt, inp, W) {
      const sp = this.spec; this.steerCur = BI.damp(this.steerCur, inp.steer, 6, dt);
      const climb = this.driver ? (inp.climb || 0) : -1;
      this.vy = BI.damp(this.vy, climb * (inp.turbo ? 9 : 6), 2.5, dt); this.y = BI.clamp(this.y + this.vy * dt, 0, 70); if (this.y <= 0 && this.vy < 0) this.vy = 0;
      const air = this.y > 1.0, want = air && this.driver ? (inp.thr > 0 ? inp.thr * sp.max * (inp.turbo ? 1.3 : 1) : inp.thr * sp.rev) : 0, v0 = this.v;
      this.v = BI.damp(this.v, want, air ? 1.5 : 6, dt); this.acc = (this.v - v0) / dt;
      this.h -= this.steerCur * sp.turn * (air ? 1 : .35) * dt;
      this.x += Math.sin(this.h) * this.v * dt; this.z += Math.cos(this.h) * this.v * dt;
      const p = {}; W.resolve(this.x, this.z, this.r, p, this.y); if (p.hit) { this.x = p.x; this.z = p.z; this.v *= .6; }
      return 0;
    }
    stepBoat(dt, inp, W) {
      const sp = this.spec, thr = inp.thr, want = thr > 0 ? thr * sp.max * (inp.turbo ? 1.35 : 1) : thr * sp.rev, v0 = this.v;
      const rate = Math.abs(thr) < .05 ? sp.drag : want * this.v < 0 ? sp.brake : Math.abs(want) > Math.abs(this.v) ? sp.acc : sp.drag * 1.4;
      this.v += BI.clamp((Math.abs(thr) < .05 ? 0 : want) - this.v, -rate * dt, rate * dt); this.acc = (this.v - v0) / dt; this.steerCur = BI.damp(this.steerCur, inp.steer, 5, dt);
      this.h -= this.steerCur * sp.turn * BI.clamp(Math.abs(this.v) / 2.5, .15, 1) * Math.sign(this.v || 1) * dt;
      this.x += Math.sin(this.h) * this.v * dt; this.z += Math.cos(this.h) * this.v * dt;
      let hit = 0; const lo = 206 + this.r, hi = 330, rad = Math.hypot(this.x, this.z) || 1;
      if (rad < lo) { this.x *= lo / rad; this.z *= lo / rad; hit = 1; } else if (rad > hi) { this.x *= hi / rad; this.z *= hi / rad; hit = 1; }
      const P = W.pier, bx = BI.clamp(this.x, P[0], P[2]), bz = BI.clamp(this.z, P[1], P[3]), dx = this.x - bx, dz = this.z - bz, d = Math.hypot(dx, dz);
      if (d < this.r) { if (d > 1e-6) { this.x += dx / d * (this.r - d); this.z += dz / d * (this.r - d); } else this.x += this.r; hit = 1; }
      if (hit) this.v *= .6; return 0;
    }
    step(dt, inp, W, fx) {
      if (this.spec.boat) return this.stepBoat(dt, inp, W);
      if (this.spec.fly) return this.stepFly(dt, inp, W);
      const sp = this.spec, onRoad = W.onRoad(this.x, this.z); this.offroad = !onRoad;
      let max = sp.max * (inp.turbo ? 1.4 : 1) * (onRoad || sp.offroad ? 1 : .72);
      const thr = inp.thr, want = thr > 0 ? thr * max : thr * sp.rev;
      let rate = Math.abs(thr) < .05 ? sp.drag : want * this.v < 0 ? sp.brake : Math.abs(want) > Math.abs(this.v) ? sp.acc : sp.drag * 1.6;
      const target = Math.abs(thr) < .05 ? 0 : want, v0 = this.v;
      this.v += BI.clamp(target - this.v, -rate * dt, rate * dt);
      this.acc = (this.v - v0) / dt;
      this.steerCur = BI.damp(this.steerCur, inp.steer, 9, dt);
      const sf = BI.clamp(Math.abs(this.v) / 3.5, 0, 1), k = 1 - .45 * Math.min(1, Math.abs(this.v) / (sp.max * 1.2));
      this.h -= this.steerCur * sp.turn * sf * k * Math.sign(this.v) * dt;
      this.x += Math.sin(this.h) * this.v * dt; this.z += Math.cos(this.h) * this.v * dt;
      return this.collide(W, fx);
    }
    collide(W, fx) {
      let bumped = 0; const p = {};
      for (const off of this.cols) {
        const cx = this.x + Math.sin(this.h) * off, cz = this.z + Math.cos(this.h) * off;
        W.resolve(cx, cz, this.r, p);
        if (p.hit) { const dx = p.x - cx, dz = p.z - cz; if (dx * dx + dz * dz > 1e-8) { this.x += dx; this.z += dz; bumped = Math.max(bumped, Math.hypot(dx, dz)); } }
      }
      if (bumped > .02) {
        const sp = Math.abs(this.v); this.v *= .55;
        if (sp > 6 && fx) fx.burst(this.x + Math.sin(this.h) * 1.5, .5, this.z + Math.cos(this.h) * 1.5, 6, [BI.C.dust, BI.C.white], 3, .6, 30, 2);
        return sp;
      }
      return 0;
    }
    /* Optik: Räder, Neigung, Blaulicht */
    visual(dt, t, fx) {
      const sp = this.spec; if (sp.boat) this.y = -.28 + Math.sin(t * 1.8 + this.x * .1) * .05; this.root.position.set(this.x, this.y, this.z); this.root.rotation.y = this.h;
      if (sp.boat) {
        this.tilt.rotation.z = BI.damp(this.tilt.rotation.z, -this.steerCur * Math.abs(this.v) / sp.max * .22 + Math.sin(t * 1.3) * .03, 5, dt); this.tilt.rotation.x = BI.damp(this.tilt.rotation.x, BI.clamp(-this.acc * .01, -.08, .08) + Math.sin(t * 1.1) * .02, 4, dt);
        if (fx && Math.abs(this.v) > 1.5 && Math.random() < dt * 40) fx.emit(this.x - Math.sin(this.h) * 2.2 + (Math.random() - .5), -.1, this.z - Math.cos(this.h) * 2.2 + (Math.random() - .5), (Math.random() - .5) * 1.4, .8, (Math.random() - .5) * 1.4, 1.1, 40, .95, .98, 1, 1, .8);
        return;
      }
      if (sp.fly) {
        const air = this.y > .3, on = this.driver || air; this.rotorW = BI.damp(this.rotorW, on ? 32 : 0, on ? 1.2 : .5, dt);
        this.rotorMain.rotation.y += this.rotorW * dt; this.rotorTail.rotation.x += this.rotorW * 1.6 * dt;
        this.tilt.rotation.x = BI.damp(this.tilt.rotation.x, BI.clamp(this.v / sp.max, -.5, 1.4) * .2, 4, dt); this.tilt.rotation.z = BI.damp(this.tilt.rotation.z, air ? this.steerCur * .28 : 0, 4, dt);
        this.tilt.position.y = air ? Math.sin(t * 3) * .08 : 0;
        this.shadow.position.y = .1 - this.y; this.shadow.scale.setScalar(1 + this.y * .02); this.shadow.material.opacity = Math.max(.08, .3 - this.y * .005);
        if (fx && this.y < 9 && this.rotorW > 18 && Math.random() < dt * 30) { const a = Math.random() * Math.PI * 2; fx.emit(this.x + Math.cos(a) * 2, .25 - 0, this.z + Math.sin(a) * 2, Math.cos(a) * 5, .6, Math.sin(a) * 5, .8, 34, .85, .8, .7, 0, .5); }
        return;
      }
      const ratio = BI.clamp(this.v / sp.max, -1, 1.4), lean = this.steerCur * Math.abs(ratio);
      this.tilt.rotation.z = BI.damp(this.tilt.rotation.z, this.lean ? lean * .5 : -lean * .06, 8, dt);
      this.tilt.rotation.x = BI.damp(this.tilt.rotation.x, BI.clamp(-this.acc * .004, -.07, .07), 6, dt);
      for (const w of this.wheels) { w.m.rotation.x += this.v * dt / w.r; if (w.steer) w.holder.rotation.y = -this.steerCur * .5; }
      if (this.siren && this.beacons.length) {
        this.beat += dt * 7; const on = Math.floor(this.beat) % 2;
        this.beacons.forEach((bc, i) => { const lit = (i + on) % 2 === 0; bc.mat.color.setHex(lit ? bc.base : 0x201010); bc.m.scale.setScalar(lit ? 1.25 : 1); });
      } else if (this.beacons.length) this.beacons.forEach(bc => { bc.mat.color.setHex(0x402020); bc.m.scale.setScalar(1); });
      if (fx && Math.abs(this.v) > 8 && this.offroad && Math.random() < dt * 20) fx.emit(this.x - Math.sin(this.h) * 1.5, .3, this.z - Math.cos(this.h) * 1.5, (Math.random() - .5), 1.2, (Math.random() - .5), .7, 34, .85, .78, .55, 0, .6);
    }
    spray(dt, fx) {
      const n = this.model.nozzle; if (!n || !fx) return;
      const sx = Math.sin(this.h), sz = Math.cos(this.h), x = this.x + sx * n[2], z = this.z + sz * n[2];
      for (let i = 0; i < 3; i++) fx.emit(x, n[1], z, sx * (14 + Math.random() * 3) + (Math.random() - .5) * 1.4, 6 + Math.random() * 2, sz * (14 + Math.random() * 3) + (Math.random() - .5) * 1.4, 1.1, 30, .55, .8, 1, 14, .9);
    }
  };

  /* ---------- Zug ---------- */
  function trainBody(kind, color) {
    const b = new BI.Batch();
    if (kind === 'loco') {
      b.box(0, .5, 0, 2.6, .5, 8.0, DARK); horiz(b, 0, 1.75, 1.3, 1.05, 4.8, 0x2f6fe0, 12); b.box(0, .7, -2.3, 2.6, 2.7, 2.6, 0xe0382b); b.box(0, 3.4, -2.3, 3.0, .25, 3.0, 0x333c4a);
      for (const x of [-1.31, 1.31]) b.box(x, 1.7, -2.3, .05, .9, 1.3, GLASS);
      b.cyl(0, 2.7, 2.6, .4, .55, 1.1, 0x23262d, 8); b.sph(0, 2.85, .3, .55, 0xffc933, 1, 1, .8, 1); b.sph(0, 1.75, 3.7, .26, 0xfff6d0, 1);
      b.box(0, .5, 4.1, 2.2, .35, .5, 0x333c4a); b.box(0, .85, -3.65, 2.6, .2, .3, 0x333c4a);
    } else {
      b.box(0, .55, 0, 2.8, 2.5, 7.0, color); b.box(0, 3.02, 0, 2.6, .18, 7.0, 0xfafafa);
      for (const x of [-1.41, 1.41]) for (let k = -2; k <= 2; k++) b.box(x, 1.6, k * 1.35, .05, .95, 1.0, GLASS);
      b.box(0, .5, 0, 2.5, .3, 7.4, DARK);
    }
    return b.mesh(BI.mat());
  }
  BI.Train = class Train {
    constructor(scene, W) {
      this.W = W; this.s = W.stations[0].s; this.v = 0; this.mode = 'wait'; this.timer = 2; this.cruise = 13; this.leaveIdx = -1; this.leaveDist = 0; this.stationIdx = 0; this.driven = false; this.dist = 0; this.puff = 0;
      this.cars = []; const lens = [8, 7, 7, 7], cols = [0, 0xffc933, 0x4cd07d, 0x3f8cff]; let off = 0;
      lens.forEach((len, i) => {
        const g = new THREE.Group(), body = trainBody(i ? 'wagon' : 'loco', cols[i]); body.frustumCulled = false; g.add(body);
        const wh = [], zs = i ? [-2.2, 2.2] : [2.8, 1.5, .2];
        const r = i ? .5 : .75; for (const z of zs) for (const x of [-1.05, 1.05]) { const h = new THREE.Group(); h.position.set(x, r, z); const m = new THREE.Mesh(BI.trainWheel(r), BI.mat()); h.add(m); g.add(h); wh.push({ m, r }); }
        scene.add(g); this.cars.push({ g, len, off: off + len / 2, wh, x: 0, z: 0, h: 0 }); off += len + .8;
      });
      this.total = off; this.update(0, null);
    }
    get front() { return this.cars[0]; }
    /* vorzeichenbehafteter Abstand der Lok-Front zum Halt i (positiv = noch davor, negativ = drüber hinaus) */
    offsetTo(i) { const L = this.W.track.L, d = (((this.W.stations[i].s - this.s + 15) % L) + L) % L - 15; return d; }
    nextStop() {
      let bi = -1, bd = 1e9; for (let i = 0; i < this.W.stations.length; i++) { if (i === this.leaveIdx) continue; const d = this.offsetTo(i); if (d < bd) { bd = d; bi = i; } }
      return { i: bi, d: bd, st: this.W.stations[bi] };
    }
    distToStop() { return this.nextStop().d; }
    update(dt, inp, fx) {
      const L = this.W.track.L;
      if (inp) {
        this.driven = true; const thr = inp.thr, maxV = 24 * (inp.turbo ? 1.2 : 1);
        const target = thr > .05 ? thr * maxV : 0, rate = thr < -.05 ? 14 : thr > .05 ? 4.5 : 2.2;
        this.v += BI.clamp(target - this.v, -rate * dt, rate * dt); this.mode = 'drive'; this.leaveIdx = -1;
      } else {
        if (this.driven) { this.driven = false; this.mode = 'run'; }
        if (this.mode === 'drive') this.mode = 'run';
        if (this.mode === 'wait') { this.v = 0; this.timer -= dt; if (this.timer <= 0) { this.mode = 'run'; this.leaveIdx = this.stationIdx; this.leaveDist = 0; } }
        else {
          const ns = this.nextStop(), d = Math.max(ns.d, 0);
          let target = Math.min(this.cruise, Math.sqrt(2 * 2.2 * Math.max(d - 1.5, 0)) + 1.2);
          this.v += BI.clamp(target - this.v, -3 * dt, 2 * dt);
          if (ns.d < 2.5 && this.v < 1.6) { this.mode = 'wait'; this.timer = 8; this.v = 0; this.s = ns.st.s; this.stationIdx = ns.i; }
        }
      }
      this.s = ((this.s + this.v * dt) % L + L) % L; this.dist += this.v * dt;
      if (this.leaveIdx >= 0) { this.leaveDist += this.v * dt; if (this.leaveDist > 20) this.leaveIdx = -1; }
      const a = {}, b = {};
      for (const c of this.cars) {
        this.W.trackAt(this.s - c.off + c.len * .33, a); this.W.trackAt(this.s - c.off - c.len * .33, b);
        c.x = (a.x + b.x) / 2; c.z = (a.z + b.z) / 2; c.h = Math.atan2(a.x - b.x, a.z - b.z);
        c.g.position.set(c.x, .1, c.z); c.g.rotation.y = c.h;
        for (const w of c.wh) w.m.rotation.x += this.v * dt / w.r;
      }
      if (fx && this.v > .5) { this.puff -= dt; if (this.puff <= 0) { this.puff = .14; const c = this.cars[0]; fx.emit(c.x + Math.sin(c.h) * 2.6, 3.9, c.z + Math.cos(c.h) * 2.6, (Math.random() - .5) * .8, 3 + this.v * .1, (Math.random() - .5) * .8, 1.4, 40, .95, .95, .95, -.4, .7); } }
    }
    /* Abstand zum nächsten Wagen */
    nearest(px, pz) { let best = 1e9; for (const c of this.cars) { const d = Math.hypot(px - c.x, pz - c.z) - c.len * .5; if (d < best) best = d; } return best; }
  };
  const tw = {};
  BI.trainWheel = r => tw[r] || (tw[r] = (() => { const b = new BI.Batch(); b.cyl(0, -.12, 0, r, r, .24, 0x23262d, 12, 0, 0, Math.PI / 2); b.cyl(0, -.15, 0, r * .55, r * .55, .3, 0xe0382b, 8, 0, 0, Math.PI / 2); return b.mesh(BI.mat()).geometry; })());
})();
