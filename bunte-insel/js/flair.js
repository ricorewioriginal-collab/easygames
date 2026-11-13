'use strict';
/* Bunte Insel – Welten-Flair ✨: jede Themenwelt bekommt eigene Bewegung in der Luft und eine Mitmach-Show.
   🌈 Regenbogenwelt: aufsteigende Regenbogen-Seifenblasen, Konfetti-Kanone.
   🐉 Drachenwelt: Glutfunken und ein kreisender Drache, der auf Ruf herabfliegt und Feuer speit.
   📻 Radiowelt: Equalizer-Ring, der im Takt pulsiert, und ein DJ-Pult mit Lichtshow.
   🏙️ Stadt: Werbe-Luftschiff mit Banner zum Marktrausch-Portal, Stadtfest-Feuerwerk.
   Sparsam: je Welt 1 Partikelwolke + 1–2 Modelle, nur in der Nähe animiert. Erste Show am Tag: +1 ⭐. */
BI.createFlair = function (G) {
  const { scene, W, P, fx, A, say, save, persist } = G, K = { ready: false, list: [] }, TAU = Math.PI * 2, C = BI.C;
  const day = () => { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
  const S = () => save.flair || (save.flair = {});
  function spot(O, f0, avoid) {
    const ok = (x, z) => W.groundY(x, z) < .3 && !W.onRoad(x, z) && W.free(x, z, 2.6) && !(avoid || []).some(q => Math.hypot(q.x - x, q.z - z) < 14);
    for (const f of [f0, f0 - .12, f0 + .12, .3, .8]) for (let i = 0; i < 32; i++) { const a = i / 32 * TAU + 1.9, x = O.x + Math.sin(a) * O.R * f, z = O.z + Math.cos(a) * O.R * f; if (ok(x, z)) return { x, z }; }
    return { x: O.x, z: O.z + O.R * .3 };
  }
  /* Partikelwolke: N Punkte, eigene Bewegungsfunktion */
  function cloud(N, size, colors, fn, opacity) {
    const pos = new Float32Array(N * 3), col = new Float32Array(N * 3), sd = [];
    for (let i = 0; i < N; i++) { sd.push([Math.random(), Math.random(), Math.random(), Math.random()]); const c = colors[i % colors.length]; col.set(c, i * 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const m = new THREE.Points(g, new THREE.PointsMaterial({ size, vertexColors: true, transparent: true, opacity: opacity || .9, depthWrite: false })); m.frustumCulled = false; scene.add(m);
    return { m, upd(t) { for (let i = 0; i < N; i++) fn(pos, i * 3, sd[i], t); g.attributes.position.needsUpdate = true; } };
  }
  /* einfacher Drache aus Kästchen mit schlagenden Flügeln */
  function dragon() {
    const g = new THREE.Group(), b = new BI.Batch();
    b.box(0, 0, 0, 1.4, 1.2, 4, 0xd8452a); b.box(0, .5, 2.4, 1, 1, 1.4, 0xe8553a); b.box(0, .3, 3.2, .7, .5, .8, 0xffb43a); b.box(0, -.1, -2.6, .6, .6, 2.4, 0xc83a22); b.box(0, 0, -4, .3, .9, .9, 0xffb43a);
    for (let i = 0; i < 4; i++) b.box(0, .8, 1.4 - i * 1, .25, .5, .5, 0xffd23f);
    b.box(-.35, 1.1, 2.8, .2, .2, .2, 0x222222); b.box(.35, 1.1, 2.8, .2, .2, .2, 0x222222);
    g.add(b.mesh(BI.mat()));
    const wing = s => { const w = new THREE.Group(), wb = new BI.Batch(); wb.box(s * 2, 0, 0, 4, .15, 2.6, 0xff8a3a); wb.box(s * 3.6, 0, -.6, 1.6, .12, 1.6, 0xffb45a); const m = wb.mesh(BI.mat()); w.add(m); w.position.set(s * .6, .4, .4); g.add(w); return w; };
    const L = wing(-1), R = wing(1); return { g, flap(t, k) { const a = Math.sin(t * (k || 6)) * .6; L.rotation.z = -a; R.rotation.z = a; } };
  }
  K.build = function () {
    if (K.ready) return; K.ready = true;
    const portalSpots = () => Object.keys(W.spots).filter(k => /^portal_/.test(k)).map(k => W.spots[k]);
    /* 🌈 Regenbogen */
    { const O = BI.RAINBOW; if (O) { const RB = [[1, .3, .3], [1, .6, .2], [1, .9, .3], [.35, .9, .45], [.35, .6, 1], [.7, .45, 1]];
      const c = cloud(70, .55, RB, (p, k, s, t) => { const h = (s[0] * 30 + t * (1.2 + s[1])) % 30, a = s[2] * TAU; p[k] = O.x + Math.sin(a) * O.R * .8 * Math.sqrt(s[3]) + Math.sin(t + s[0] * 9) * .8; p[k + 1] = .5 + h; p[k + 2] = O.z + Math.cos(a) * O.R * .8 * Math.sqrt(s[3]); }, .75);
      const at = spot(O, .45, portalSpots()), b = new BI.Batch(); b.cyl(0, 0, 0, 1.3, 1.5, .6, 0xffffff, 16); b.cyl(0, .6, 0, .7, .9, 1.8, 0xff4fa3, 12); for (let i = 0; i < 6; i++) b.cyl(0, 2.4 + i * .08, 0, .95 - i * .05, .95 - i * .05, .08, [0xe8453c, 0xff9a2a, 0xffd23f, 0x3ec46d, 0x3a7bff, 0x9a5bff][i], 12);
      const m = b.mesh(BI.mat()); m.position.set(at.x, 0, at.z); scene.add(m); W.addCircle(at.x, at.z, 1.4, false, 3);
      K.list.push({ key: 'rainbow', O, c, m, at, icon: '🎉', label: 'Konfetti-Kanone zünden', show(t) { for (let i = 0; i < 6; i++) setTimeout(() => fx.burst(at.x, 3, at.z, 26, [C.red, C.orange, C.gold, C.green, C.blue, C.purple, C.pink], 9, 1.6, 26, 5), i * 220); A.fanfare && A.fanfare(); return '🎉 Konfetti für alle! Auf der Regenbogeninsel gehört jeder dazu.'; } }); } }
    /* 🐉 Drachen */
    { const O = BI.DRACHEN; if (O) { const c = cloud(60, .32, [[1, .55, .15], [1, .8, .3], [1, .35, .1]], (p, k, s, t) => { const h = (s[0] * 14 + t * (1.5 + s[1] * 2)) % 14, a = s[2] * TAU + t * .1, r = O.R * .7 * Math.sqrt(s[3]); p[k] = O.x + Math.sin(a) * r + Math.sin(t * 3 + s[1] * 9) * .4; p[k + 1] = .3 + h; p[k + 2] = O.z + Math.cos(a) * r; });
      const D = dragon(); D.g.scale.setScalar(1.3); scene.add(D.g); const at = spot(O, .5, portalSpots()), b = new BI.Batch();
      b.cyl(0, 0, 0, 1.2, 1.4, 1, 0x6a5a50, 10); b.cyl(0, 1, 0, .5, .6, 1.4, 0x8a3a2a, 8); b.cone(0, 2.4, 0, .9, 1.4, 0xffb43a, 8);
      const m = b.mesh(BI.mat()); m.position.set(at.x, 0, at.z); scene.add(m); W.addCircle(at.x, at.z, 1.3, false, 3);
      const it = { key: 'drachen', O, c, m, at, D, swoop: 0, icon: '🐉', label: 'Den Drachen rufen (Drachenhorn)', show() { it.swoop = 6; A.fanfare && A.fanfare(); return '🐉 Der Drache hat dich gehört! Er fliegt eine Runde und speit Feuer!'; } };
      it.anim = (dt, t) => { const sw = it.swoop > 0; if (sw) it.swoop -= dt; const r = sw ? 12 : O.R * .7, hgt = sw ? 9 : 26, sp = sw ? .9 : .25, a = t * sp, cx = sw ? at.x : O.x, cz = sw ? at.z : O.z;
        D.g.position.set(cx + Math.sin(a) * r, hgt + Math.sin(t * 1.3) * 1.5, cz + Math.cos(a) * r); D.g.rotation.y = a + Math.PI / 2; D.g.rotation.z = -.25; D.flap(t, sw ? 9 : 5);
        if (sw && Math.random() < .5) { const q = D.g.position, f = D.g.rotation.y; fx.burst(q.x + Math.sin(f) * 5, q.y, q.z + Math.cos(f) * 5, 4, [C.orange, C.gold, C.red], 5, .7, 30, -1); } };
      K.list.push(it); } }
    /* 📻 Radio */
    { const O = BI.RADIO; if (O) { const N = 24, rr = (O.hub || 19) + 3.5, geo = new THREE.BoxGeometry(.9, 1, .9); geo.translate(0, .5, 0);
      const eq = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ vertexColors: false }), N), mm = new THREE.Matrix4(), cc = new THREE.Color();
      for (let i = 0; i < N; i++) eq.setColorAt(i, cc.setHSL(i / N, .85, .58)); scene.add(eq);
      const c = cloud(40, .7, [[1, 1, 1], [1, .3, .4], [.4, .8, 1], [1, .9, .3]], (p, k, s, t) => { const h = (s[0] * 12 + t * (1 + s[1])) % 12, a = s[2] * TAU + t * .2; p[k] = O.x + Math.sin(a) * (rr + 4 + s[3] * 8); p[k + 1] = 1 + h; p[k + 2] = O.z + Math.cos(a) * (rr + 4 + s[3] * 8); }, .8);
      const at = spot(O, .55, portalSpots()), b = new BI.Batch(); b.box(0, 0, 0, 3.2, 1.1, 1.4, 0x2a2a34); b.box(0, 1.1, 0, 3.4, .12, 1.6, 0xe8253c); b.cyl(-.8, 1.22, 0, .45, .45, .08, 0x111111, 14); b.cyl(.8, 1.22, 0, .45, .45, .08, 0x111111, 14);
      for (let i = 0; i < 4; i++) b.box(-.3 + i * .2, 1.24, .45, .1, .1, .3, [0xff4a5a, 0x4ad8ff, 0xffd23f, 0x6aff7a][i]);
      const m = b.mesh(BI.mat()); m.position.set(at.x, 0, at.z); m.rotation.y = Math.atan2(O.x - at.x, O.z - at.z); scene.add(m); W.addCircle(at.x, at.z, 1.8, false, 3);
      const it = { key: 'radio', O, c, m, at, eq, icon: '🎛️', label: 'Am DJ-Pult auflegen', show() { it.boost = 9; A.fanfare && A.fanfare(); return '🎛️ Bühne frei! Der Equalizer tanzt und die Funkwelle feiert mit dir.'; } };
      it.anim = (dt, t) => { const bo = it.boost > 0; if (bo) it.boost -= dt; const k = bo ? 3.2 : 1;
        for (let i = 0; i < N; i++) { const a = i / N * TAU, h = (.6 + Math.abs(Math.sin(t * (2 + (i % 5) * .6) + i * 1.7)) * 2.2) * k; mm.makeScale(1, h, 1); mm.setPosition(O.x + Math.sin(a) * rr, 0, O.z + Math.cos(a) * rr); eq.setMatrixAt(i, mm); }
        eq.instanceMatrix.needsUpdate = true; if (bo && Math.random() < .15) fx.burst(at.x, 2.5, at.z, 10, [C.red, C.blue, C.gold, C.green], 6, 1, 24, 3); };
      K.list.push(it); } }
    /* 🏙️ Stadt */
    { const O = BI.CITY; if (O) { const g = new THREE.Group(), b = new BI.Batch(); b.sph(0, 0, 0, 1, 0xf2f2f8); const body = b.mesh(BI.mat()); body.scale.set(2.4, 2.4, 6.5); g.add(body);
      const fb = new BI.Batch(); fb.box(0, 2, -5.6, .2, 2.4, 1.8, 0x2aa858); fb.box(0, -2.6, 0, 1.4, .9, 2.4, 0xff9a2a); fb.box(1.6, 0, -5.6, 2.4, .2, 1.8, 0x2aa858); fb.box(-1.6, 0, -5.6, 2.4, .2, 1.8, 0x2aa858); g.add(fb.mesh(BI.mat()));
      const sc = document.createElement('canvas'); sc.width = 512; sc.height = 128; const x = sc.getContext('2d'); x.fillStyle = '#2aa858'; x.fillRect(0, 0, 512, 128); x.fillStyle = '#fff'; x.font = 'bold 48px system-ui,sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('🛒 Marktrausch – Portal!', 256, 66, 490);
      const tex = new THREE.CanvasTexture(sc); for (const s of [-1, 1]) { const ban = new THREE.Mesh(new THREE.PlaneGeometry(8, 2), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide })); ban.position.set(s * 2.45, 0, 0); ban.rotation.y = s * Math.PI / 2; g.add(ban); }
      scene.add(g); const c = cloud(1, .01, [[1, 1, 1]], () => { }); c.m.visible = false;
      const at = spot(O, .5, portalSpots()), lb = new BI.Batch(); lb.cyl(0, 0, 0, .9, 1, .5, 0x555560, 10); lb.box(0, .5, 0, 1, 1, 1, 0xd8253c); for (let i = 0; i < 3; i++) lb.cone(-.3 + i * .3, 1.5, 0, .14, .8, [0xffd23f, 0x4ad8ff, 0xff4fa3][i], 6);
      const m = lb.mesh(BI.mat()); m.position.set(at.x, 0, at.z); scene.add(m); W.addCircle(at.x, at.z, 1.1, false, 3);
      const it = { key: 'city', O, c, m, at, blimp: g, icon: '🎆', label: 'Stadtfest-Feuerwerk starten', show() { for (let i = 0; i < 7; i++) setTimeout(() => { const a = Math.random() * TAU, d = 4 + Math.random() * 10; fx.burst(at.x + Math.sin(a) * d, 16 + Math.random() * 8, at.z + Math.cos(a) * d, 34, [[C.red, C.gold], [C.blue, C.white], [C.pink, C.purple], [C.green, C.gold]][i % 4], 8, 1.8, 30, 2); A.star && A.star(); }, i * 420); return '🎆 Feuerwerk über der Stadt, die niemals schläft!'; } };
      it.anim = (dt, t) => { const a = t * .06; g.position.set(O.x + Math.sin(a) * O.R * .9, 30 + Math.sin(t * .5) * 1.5, O.z + Math.cos(a) * O.R * .9); g.rotation.y = a + Math.PI / 2; };
      K.list.push(it); } }
  };
  K.near = function () {
    if (!K.ready || P.veh || P.y > 1.5) return null;
    for (const it of K.list) if (Math.hypot(P.x - it.at.x, P.z - it.at.z) < 3.6) return { k: 'flair', key: it.key, label: [it.icon, it.label] };
    return null;
  };
  K.act = function (n) {
    const it = n && K.list.find(q => q.key === n.key); if (!it) return; const msg = it.show(), s = S(), d = day();
    if (s[it.key] !== d) { s[it.key] = d; G.addStars && G.addStars(1); persist && persist(); say(msg + ' +1 ⭐', 4200); } else say(msg, 3600);
  };
  K.update = function (dt, t) {
    if (!K.ready) return;
    for (const it of K.list) { const d = Math.hypot(P.x - it.O.x, P.z - it.O.z), vis = d < it.O.R + 90; it.c.m.visible = vis && it.key !== 'city'; if (it.D) it.D.g.visible = vis; if (it.eq) it.eq.visible = vis; if (it.blimp) it.blimp.visible = d < it.O.R + 200;
      if (!vis && !(it.blimp && d < it.O.R + 200)) continue; if (it.key !== 'city') it.c.upd(t); it.anim && it.anim(dt, t); }
  };
  K.dbg = { list: K.list };
  return K;
};
