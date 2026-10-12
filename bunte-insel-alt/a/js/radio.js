'use strict';
/* Bunte Insel – Funkwelle: die Radio-Welt. 13 Sender-Plätze im Kreis um den Funkturm. Jeder Platz hat seine eigene Logo-Statue, einen Bildschirm
   (Sender-Anzeige mit Equalizer und „Jetzt läuft“, dazu das „Visual Radio“ als Fenster) und ein Radio, das den Live-Stream des Senders spielt
   (Radio einschalten: E; die Lautstärke hängt von der Entfernung zum Radio ab; verlässt man den Bereich, wird es leise und der Stream pausiert).
   Streams: https://stream.laut.fm/<Sendername> (laut.fm-Betrieb). Das laut.fm-Logo wird aus radio/lautfm.png geladen, sonst steht dort die Schrift „laut.fm“.
   Währung: Noten 🎵 (10 = 1 ⭐). Highlight-Spiel: Frequenz-Dreher (Geschick/Timing). Die Welt liegt weit weg auf einer eigenen Nacht-Insel.
   Lage: große Insel im Südosten der Hauptinsel, erreichbar über eine Brücke (wie die anderen Welten, ohne Portal). Alle Sender-Namen und Logos gehören den jeweiligen Betreibern (hier: RicoReWi Radioportal). */
BI.RADIO = { x: 300, z: 230, R: 112, ring: 76, hub: 34, lautLogo: 'radio/lautfm.png', portalLogo: 'radio/logos/16.png',
  visual: slug => 'https://ricorewi-radio.de/visual-radio-tv.html?station=' + encodeURIComponent(slug) + '&app=1', /* Visual Radio (TV-Seite aus ricorewi-radio; app=1: ohne eigenen Ton – der Ton kommt vom Radio in der Spielwelt) */
  stations: [['RicoReWi Radio', 'ricorewi'], ['YourTime-FM', 'yourtime-fm'], ['RapRadio 24', 'rapradio24'], ['SchlagerPop 24', 'schlagerpop24'], ['ChartRadio 24', 'chartradio24'], ['ClubRadio 24', 'clubradio24'], ['AnMaCha 24', 'anmacha24'],
    ['RadioFloh!', 'radiofloh'], ['RockRadio 24', 'rockradio24'], ['ChristmasRadio 24', 'christmasradio24'], ['KultRadio 24', 'kultradio24'], ['Zocker-FM', 'zockerfm'], ['Special-Radio', 'special-radio']] };
/* Brücke: von der Hauptinsel (Südosten) geradeaus zur Insel; Endpunkte liegen etwas im Inneren der Inseln */
{ const R = BI.RADIO, d = Math.hypot(R.x, R.z), ux = R.x / d, uz = R.z / d, ax = ux * 168, az = uz * 168, bx = R.x - ux * (R.R - 6), bz = R.z - uz * (R.R - 6), L = Math.hypot(bx - ax, bz - az); R.bridge = { ax, az, bx, bz, ux: (bx - ax) / L, uz: (bz - az) / L, L, w: 5.4 }; R.rot = Math.atan2(-ux, -uz); }
BI.RADIO.stations = BI.RADIO.stations.map(([n, slug], i) => ({ i, n, slug, logo: 'radio/logos/' + String(i + 1).padStart(2, '0') + '.png', url: 'https://stream.laut.fm/' + slug }));

/* ---------- statisch: Insel, Hub mit Funkturm, 13 Plätze (Podest, Bildschirm-Rahmen, Radio), Wege, Funk-Tor an der Oberfläche ---------- */
BI.buildRadioGround = function (c) {
  const { W, st: mainSt, lamp: mainLamp, scene } = c, A = BI.RADIO, TAU = Math.PI * 2, X = u => A.x + u, Z = v => A.z + v, ST = A.stations, N = ST.length;
  const st = new BI.Batch(), glow = new BI.Batch(), MARB = 0xe6e8f4, DARK = 0x1a1f3a, GOLD = 0xd8a24a, STONE = 0x3a4068, tmp = new THREE.Color(), hexOf = (i, l) => tmp.setHSL(i / N, .75, l == null ? .55 : l).getHex();
  const Bz = A.bridge, bh = .65, nx = -Bz.uz, nz = Bz.ux;
  W.radio = { x: A.x, z: A.z, R: A.R, bridge: Bz,
    /* Laufregel: auf der Insel frei; auf der Brücke seitlich begrenzt (kein Geländer-Kollider nötig); sonst auf den Inselrand gezogen */
    fix(px, pz, r, out) {
      const dx = px - A.x, dz = pz - A.z, d = Math.hypot(dx, dz); if (d > A.R + 200) return false; out.fx = px; out.fz = pz; out.fhit = false; if (d <= A.R - r) return true;
      const qx = px - Bz.ax, qz = pz - Bz.az, t = qx * Bz.ux + qz * Bz.uz, sd = qx * nx + qz * nz;
      if (t > -4 && t < Bz.L + 4 && Math.abs(sd) < Bz.w / 2 + 5) { const lim = Bz.w / 2 - r, ns = Math.max(-lim, Math.min(lim, sd)); if (ns !== sd) { out.fx = px + nx * (ns - sd); out.fz = pz + nz * (ns - sd); out.fhit = true; } return true; }
      if (d < A.R + 40) { const k = (A.R - r) / d; out.fx = A.x + dx * k; out.fz = A.z + dz * k; out.fhit = true; return true; } return false;
    },
    floor(x, z) { const qx = x - Bz.ax, qz = z - Bz.az, t = qx * Bz.ux + qz * Bz.uz; if (t < 2 || t > Bz.L - 2 || Math.abs(qx * nx + qz * nz) > Bz.w / 2) return 0; return bh; } };
  /* Insel: Nacht-Bühne mit Neon-Rand, Felsunterseite */
  st.disc(X(0), Z(0), A.R, 0, 0x3a4272, 72); st.ring(X(0), Z(0), A.R - 3, A.R + 4, .012, STONE, 72); glow.ring(X(0), Z(0), A.R - 1.2, A.R - .8, .03, 0x6ad0ff, 72); st.cyl(X(0), -60.08, Z(0), A.R + 3.6, 8, 60, 0x2a2f55, 28);
  for (let k = 0; k < 56; k++) { const a = k / 56 * TAU, x = X(Math.sin(a) * (A.R - 1.6)), z = Z(Math.cos(a) * (A.R - 1.6)); st.cyl(x, 0, z, .25, .3, 1.2, STONE, 6); if (k % 4 === 0) glow.sph(x, 1.5, z, .3, hexOf(k / 4, .6), 1); }
  /* Hub: Platz, Ringe, Funkturm (Gitter) mit Antenne und Warnlicht, Sockel für das Portal-Logo */
  st.disc(X(0), Z(0), A.hub, .012, 0x4a5388, 56); for (const [r0, r1, col] of [[8, 8.5, 0x6ad0ff], [20, 20.5, 0xff5ab4], [A.hub - 1, A.hub, 0xffd23f]]) glow.ring(X(0), Z(0), r0, r1, .03, col, 56);
  for (let k = 0; k < 4; k++) { const a = k * TAU / 4 + Math.PI / 4; st.cyl(X(Math.sin(a) * 2.4), 0, Z(Math.cos(a) * 2.4), .15, .45, 34, 0xc9ccdc, 6); }
  for (let y = 4; y < 34; y += 5) { const r = 2.4 - y * .045; st.ring(X(0), Z(0), r, r + .2, y, 0xc9ccdc, 12); } st.cyl(X(0), 34, Z(0), .1, .3, 26, 0xc9ccdc, 6); st.cyl(X(0), 33, Z(0), 3.2, .5, .5, 0xd8d8e8, 12);
  glow.sph(X(0), 60.8, Z(0), .8, 0xff3b3b, 1); for (let k = 0; k < 3; k++) st.box(X(0), 22 + k * 4.5, Z(0), 6 - k * 1.5, .2, .2, 0xff5555 + k * 0x000010, k * 1.1); W.addCircle(X(0), Z(0), 3.6, false, 10);
  st.cyl(X(0), 0, Z(0), 5.2, 5.6, .8, MARB, 20);
  /* Arcade (Hub, Nordwest) */
  A.addArcade = function () { const a = { x: X(-14), z: Z(-18) }, ast = new BI.Batch(), alamp = new BI.Batch(); BI.buildArcades({ W, st: ast, lamp: alamp, only: [{ kind: 'frequenz_radio', x: a.x, z: a.z, yaw: Math.atan2(X(0) - a.x, Z(0) - a.z), body: 0x1a1f5a, top: 0xff5ab4 }] }); A.group.add(ast.mesh(BI.mat())); if (!alamp.empty) A.group.add(alamp.mesh(W.lampMat)); };
  /* 13 Plätze */
  A.plots = ST.map(s => {
    const a = A.rot + (s.i + .5) / N * TAU, o = { x: Math.sin(a), z: Math.cos(a) }, t = { x: o.z, z: -o.x }, f = { x: -o.x, z: -o.z }, ry = Math.atan2(f.x, f.z), col = hexOf(s.i), C = { x: X(o.x * A.ring), z: Z(o.z * A.ring) };
    const at = (u, w) => ({ x: C.x + t.x * u + o.x * w, z: C.z + t.z * u + o.z * w });
    st.strip(X(o.x * (A.hub + A.ring - 15) / 2), Z(o.z * (A.hub + A.ring - 15) / 2), 5, A.ring - 15 - A.hub + 2, a, .015, 0x3a4170);
    st.disc(C.x, C.z, 15.5, .02, hexOf(s.i, .18), 30); glow.ring(C.x, C.z, 15, 15.5, .035, col, 40);
    /* Statue: Sockel mit Logo-Tafel (die Tafel kommt zur Laufzeit) */
    const sp = at(0, 3); st.cyl(sp.x, 0, sp.z, 3, 3.2, .6, MARB, 16); st.cyl(sp.x, .6, sp.z, 2.4, 2.6, .5, STONE, 16); st.cyl(sp.x, 1.1, sp.z, 1, 1.2, 1.3, MARB, 10); glow.ring(sp.x, sp.z, 3.3, 3.6, .65, col, 24); W.addCircle(sp.x, sp.z, 3.2, false, 2.4);
    /* Bildschirm: Rahmen auf zwei Pfosten (das Bild kommt zur Laufzeit) */
    const sc = at(0, 11.5); for (const u of [-4.2, 4.2]) { const p = at(u, 11.5); st.cyl(p.x, 0, p.z, .3, .4, 2.4, DARK, 8); W.addCircle(p.x, p.z, .6, false, 2.4); } st.box(sc.x, 2.2, sc.z, 9.7, 5.6, .4, DARK, ry); st.box(sc.x, 2.1, sc.z, 9.9, .15, .5, col, ry); st.box(sc.x, 7.75, sc.z, 9.9, .15, .5, col, ry);
    /* Radio: Tisch + Gerät mit Lautsprechern und Antenne */
    const rp = at(7.5, -3.5); st.cyl(rp.x, 0, rp.z, .5, .6, 1, DARK, 8); st.box(rp.x, 1, rp.z, 2.6, 1.3, 1, 0x2a2f55, ry); st.box(rp.x, 2.25, rp.z, 2.7, .12, 1.1, col, ry); for (const sd of [-1, 1]) { const q = at(7.5 + sd * .8, -3.5 + .5); st.sph(q.x, 1.65, q.z, .42, 0x12152a, 1); glow.sph(q.x, 1.65, q.z, .2, col, 0); } st.cyl(rp.x + t.x * 1.1, 2.3, rp.z + t.z * 1.1, .03, .05, 1.5, 0xdddddd, 5); W.addCircle(rp.x, rp.z, 1.5, false, 2.4);
    for (let k = 0; k < 4; k++) { const p = at(-9 + k * 1.6, -9); st.cyl(p.x, 0, p.z, .06, .08, 3.2, 0x555a80, 5); glow.sph(p.x, 3.4, p.z, .28, col, 1); }
    return { i: s.i, a, o, t, f, ry, col, C, sp, sc, rp, scr: at(0, 7.5), at };
  });
  /* Zufahrt vom Rand zum Hub + Brücke (Holzdeck, Geländer, Pfähle) */
  st.strip(X(Math.sin(A.rot) * (A.hub + A.R) / 2), Z(Math.cos(A.rot) * (A.hub + A.R) / 2), 5, A.R - A.hub + 6, A.rot, .015, 0x5a6296);
  { const L = Bz.L, cx = (Bz.ax + Bz.bx) / 2, cz = (Bz.az + Bz.bz) / 2, ry = Math.atan2(Bz.ux, Bz.uz); st.box(cx, .35, cz, Bz.w, .3, L, 0xb98650, ry);
    for (const sd of [-1, 1]) { st.box(cx + nx * sd * (Bz.w / 2 - .1), .65, cz + nz * sd * (Bz.w / 2 - .1), .14, 1.0, L, 0x8a5a33, ry); for (let k = 0; k <= L; k += 4) { const px = Bz.ax + Bz.ux * k + nx * sd * (Bz.w / 2 - .1), pz = Bz.az + Bz.uz * k + nz * sd * (Bz.w / 2 - .1); st.cyl(px, 0, pz, .12, .14, 1.2, 0x6a4a2a, 5); } }
    for (let k = 6; k < L; k += 10) for (const sd of [-1, 1]) st.cyl(Bz.ax + Bz.ux * k + nx * sd * 1.9, -1.6, Bz.az + Bz.uz * k + nz * sd * 1.9, .4, .45, 1.9, 0x4a4a52, 8); }
  const grp = new THREE.Group(), stM = st.mesh(BI.mat()), glM = glow.mesh(new THREE.MeshBasicMaterial({ vertexColors: true, fog: false })); stM.frustumCulled = glM.frustumCulled = false; grp.add(stM, glM); grp.visible = false; scene.add(grp); A.group = grp;
};

/* ---------- Laufzeit ---------- */
BI.createRadio = function (G) {
  const { scene, W, A: AU, fx, P, say, save, persist } = G, K = {}, A = BI.RADIO, TAU = Math.PI * 2, X = u => A.x + u, Z = v => A.z + v, ST = A.stations, N = ST.length, grp = A.group;
  const S = () => save.radio || (save.radio = { visit: 0, heard: [], done: [], all: 0, visual: 0, notes: [], pts: 0, paid: 0, played: 0 });
  const note = (f, d, ty, v, del) => { try { AU.note && AU.note(f, d, ty, v, del || 0); } catch (e) { } };
  const bonus = (n, msg) => { G.addStars(n); say(msg + ' +' + n + ' ⭐', 3600); try { AU.fanfare && AU.fanfare(); } catch (e) { } };
  const sign = (txt, x, y, z, w, col) => { const cv = document.createElement('canvas'); cv.width = 512; cv.height = 96; const c = cv.getContext('2d'); let f = 52; c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; const mw = c.measureText(txt).width; if (mw > 480) { f = Math.floor(f * 480 / mw); c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; } c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 10; c.strokeStyle = '#10143a'; c.strokeText(txt, 256, 50); c.fillStyle = col || '#bff0ff'; c.fillText(txt, 256, 50); const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false, fog: false })); sp.scale.set(w, w * 96 / 512, 1); sp.position.set(x, y, z); grp.add(sp); return sp; };
  const colStr = (i, l) => '#' + new THREE.Color().setHSL(i / N, .75, l == null ? .55 : l).getHexString();
  /* Bilder (Logos, laut.fm) erst laden, wenn man in der Nähe ist */
  const imgs = [], loadImg = src => { const im = new Image(); im.src = src; return im; };
  let lautIm = null, portalIm = null; const ready = im => im && im.complete && im.naturalWidth > 0;
  /* ===== Lichtsäulen ===== */
  const beamGeo = new THREE.CylinderGeometry(1.1, 1.8, 90, 8, 1, true); const P0 = A.plots;
  const beams = P0.map(p => { const m = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({ color: p.col, transparent: true, opacity: .18, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide })); m.position.set(p.sp.x, 45, p.sp.z); grp.add(m); return m; });
  /* ===== Schilder ===== */
  const laut = sign('📡 laut.fm', X(0), 44, Z(0), 16, '#ffffff'); sign('📻 Funkwelle – 13 Sender', X(0), 11, Z(0), 16); sign('🕹️ Frequenz-Dreher', X(-14), 6, Z(-18), 8);
  /* ===== Plätze: Logo-Tafel (schwingt), Bildschirm (Canvas), Leuchtkugel am Radio ===== */
  const plateGeo = new THREE.PlaneGeometry(6.2, 6.2), frameB = new BI.Batch(); frameB.box(0, 3.2, 0, 6.9, .3, .3, 0xd8a24a); frameB.box(0, -3.5, 0, 6.9, .3, .3, 0xd8a24a); for (const sd of [-1, 1]) frameB.box(sd * 3.3, -3.3, 0, .3, 6.6, .3, 0xd8a24a); const frameGeo = frameB.mesh(BI.mat()).geometry;
  const scrGeo = new THREE.PlaneGeometry(9.2, 5.18), ballGeo = new THREE.SphereGeometry(.45, 10, 8);
  const PL = P0.map(p => {
    const s = ST[p.i], plateMat = new THREE.MeshBasicMaterial({ color: 0x555a80, transparent: true, alphaTest: .04, side: THREE.DoubleSide, fog: false }), g = new THREE.Group(); g.position.set(p.sp.x, 5.9, p.sp.z);
    const plate = new THREE.Mesh(plateGeo, plateMat); g.add(plate, new THREE.Mesh(frameGeo, BI.mat())); grp.add(g);
    const scrMat = new THREE.MeshBasicMaterial({ color: 0x0b1030, fog: false }), scr = new THREE.Mesh(scrGeo, scrMat); scr.position.set(p.sc.x + p.f.x * .25, 4.95, p.sc.z + p.f.z * .25); scr.rotation.y = p.ry; grp.add(scr);
    const ball = new THREE.Mesh(ballGeo, new THREE.MeshBasicMaterial({ color: p.col, transparent: true, opacity: .25, fog: false })); ball.position.set(p.rp.x, 3.3, p.rp.z); grp.add(ball);
    sign(s.n, p.sp.x, 9.5, p.sp.z, 7, colStr(s.i, .8)); sign('📺 Visual Radio', p.sc.x, 9.2, p.sc.z, 5.6, '#ffffff'); sign('📻 Radio', p.rp.x, 3.9, p.rp.z, 2.6, colStr(s.i, .8));
    return { i: s.i, p, g, plate, plateMat, scrMat, scr, ball, cv: null, tex: null, loaded: false, lastDraw: 0 };
  });
  /* ===== Radio-Wiedergabe (ein Stream gleichzeitig) ===== */
  const R = { el: null, cur: -1, on: false, vol: 0, song: '', songT: 0, err: '', pausedFar: false, heardT: 0 };
  const stopRadio = () => { if (R.el) { try { R.el.pause(); R.el.removeAttribute('src'); R.el.load(); } catch (e) { } } R.on = false; R.cur = -1; R.song = ''; R.err = ''; R.pausedFar = false; try { AU.duck && AU.duck(1); } catch (e) { } };
  const failRadio = msg => { const n = R.cur >= 0 ? ST[R.cur].n : 'Radio'; stopRadio(); R.err = msg; say('📻 ' + n + ': ' + msg, 3600); }; /* Fehler: Radio gilt als aus, die Spielmusik wird wieder normal laut */
  const startStream = i => { if (!R.el) { R.el = new Audio(); R.el.preload = 'none'; R.el.onerror = () => { if (R.on) failRadio('Der Stream ist gerade nicht erreichbar.'); }; } R.el.volume = 0; R.el.src = ST[i].url; const pr = R.el.play(); if (pr && pr.catch) pr.catch(() => { if (R.on && R.cur === i) failRadio('Wiedergabe blockiert – tippe das Radio nochmal an.'); }); };
  const toggleRadio = i => {
    if (R.on && R.cur === i) { stopRadio(); say('📻 ' + ST[i].n + ' aus', 1800); return; }
    stopRadio(); R.on = true; R.cur = i; R.song = ''; R.songT = 0; R.heardT = 0; startStream(i); say('📻 ' + ST[i].n + ' – Stream startet …', 2600); [660, 880].forEach((f, k) => note(f, .3, 'triangle', .08, k * .1));
  };
  const nowPlaying = () => { const i = R.cur, t = performance.now(); if (i < 0 || t - R.songT < 25000) return; R.songT = t; fetch('https://api.laut.fm/station/' + encodeURIComponent(ST[i].slug) + '/current_song').then(r => r.ok ? r.json() : null).then(j => { if (j && R.cur === i) R.song = ((j.artist && j.artist.name) ? j.artist.name + ' – ' : '') + (j.title || ''); }).catch(() => { }); };
  /* ===== Visual Radio: Fenster mit dem Visual-Radio-Bild des Senders ===== */
  const pnl = document.createElement('div'); pnl.hidden = true; pnl.style.cssText = 'position:fixed;inset:3%;z-index:95;background:#0b1030;border:2px solid #6ad0ff;border-radius:18px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 10px 40px #000a;font-family:Fredoka,system-ui,sans-serif;color:#fff';
  pnl.innerHTML = '<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:#141a4a"><span id="rpLogo" style="font:700 22px Fredoka,system-ui,sans-serif;color:#fff">laut.fm</span><b id="rpName" style="flex:1;font-size:18px"></b><a id="rpOpen" target="_blank" rel="noopener noreferrer" style="color:#6ad0ff;font-size:14px">↗ im neuen Tab</a><button id="rpX" style="font:700 18px system-ui;border:0;border-radius:10px;padding:6px 12px;cursor:pointer;background:#ff5a6a;color:#fff">✖</button></div><iframe id="rpFrame" style="flex:1;border:0;background:#000" allow="autoplay; encrypted-media" referrerpolicy="no-referrer"></iframe><div style="padding:6px 12px;background:#141a4a;font-size:13px;color:#9aa6d8">Der Ton kommt vom Radio in der Spielwelt. Bleibt das Bild leer? Dann „im neuen Tab“ öffnen.</div>';
  document.body.appendChild(pnl); const rp = id => pnl.querySelector('#' + id);
  K.open = false; K.stop = stopRadio;
  K.closeVisual = function () { if (!K.open) return; K.open = false; pnl.hidden = true; rp('rpFrame').src = 'about:blank'; G.updateButtons && G.updateButtons(true); };
  rp('rpX').onclick = K.closeVisual;
  const openVisual = i => {
    if (K.open) return; const s = ST[i], z = S(); G.setStick && G.setStick(0, 0); if (!R.on || R.cur !== i) toggleRadio(i); K.open = true; pnl.hidden = false; rp('rpName').textContent = '📺 Visual Radio – ' + s.n; rp('rpOpen').href = A.visual(s.slug); rp('rpFrame').src = A.visual(s.slug);
    if (ready(lautIm)) { const lg = rp('rpLogo'); if (!lg.querySelector('img')) { lg.textContent = ''; const im = document.createElement('img'); im.src = A.lautLogo; im.alt = 'laut.fm'; im.style.height = '28px'; lg.appendChild(im); } }
    if (!z.visual) { z.visual = 1; persist(); G.addStars(1); say('📺 Visual Radio geöffnet! +1 ⭐', 2600); }
  };
  /* ===== Bildschirm zeichnen ===== */
  function drawScreen(q, t) {
    const i = q.i, s = ST[i], active = R.on && R.cur === i, W_ = 512, H_ = 288;
    if (!q.cv) { q.cv = document.createElement('canvas'); q.cv.width = W_; q.cv.height = H_; q.tex = new THREE.CanvasTexture(q.cv); q.scrMat.map = q.tex; q.scrMat.color.setHex(0xffffff); q.scrMat.needsUpdate = true; }
    const c = q.cv.getContext('2d'), g = c.createLinearGradient(0, 0, 0, H_); g.addColorStop(0, '#0b1030'); g.addColorStop(1, colStr(i, .22)); c.fillStyle = g; c.fillRect(0, 0, W_, H_);
    const bars = 26; for (let k = 0; k < bars; k++) { const h = active ? 14 + (Math.sin(t * 5 + k * .7) * .5 + .5) * 92 * (Math.sin(t * 2.3 + k * 1.3) * .3 + .7) : 8 + (k % 3) * 3; c.fillStyle = colStr(i, active ? .6 : .35); c.fillRect(16 + k * 18.6, H_ - 18 - h, 13, h); }
    if (ready(imgs[i])) c.drawImage(imgs[i], 22, 20, 112, 112); c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = '#fff'; c.font = 'bold 38px Fredoka, system-ui, sans-serif'; c.fillText(s.n, 148, 54);
    c.font = '600 22px Fredoka, system-ui, sans-serif'; c.fillStyle = active ? '#7fffb0' : '#9aa6d8'; c.fillText(active ? (R.err ? '⚠ ' + R.err : '▶ läuft live') : '⏸ Radio einschalten (E)', 148, 96);
    if (active && R.song) { c.fillStyle = '#ffe9a8'; c.font = '600 20px Fredoka, system-ui, sans-serif'; let sg = '♪ ' + R.song; while (c.measureText(sg).width > 340 && sg.length > 8) sg = sg.slice(0, -2); c.fillText(sg, 148, 128); }
    if (ready(lautIm)) { const lw = Math.min(104, 40 * lautIm.naturalWidth / lautIm.naturalHeight); c.drawImage(lautIm, W_ - 14 - lw, 6, lw, lw * lautIm.naturalHeight / lautIm.naturalWidth); } else { c.textAlign = 'right'; c.fillStyle = '#ffffffcc'; c.font = 'bold 26px Fredoka, system-ui, sans-serif'; c.fillText('laut.fm', W_ - 16, 24); }
    q.tex.needsUpdate = true;
  }
  /* ===== Noten (Währung): 10 = 1 ⭐ ===== */
  const SP = []; { const rr = BI.rng(555); for (let i = 0; SP.length < 52 && i < 900; i++) { const a = rr() * TAU, d = 8 + rr() * (A.R - 14), x = A.x + Math.sin(a) * d, z = A.z + Math.cos(a) * d; if (!W.free(x, z, .9)) continue; SP.push({ x, z, y: 1.0, v: SP.length % 8 === 7 ? 5 : 1 }); } }
  K.shards = SP; const noteM = new THREE.InstancedMesh(new THREE.OctahedronGeometry(.42, 0), new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false }), SP.length), dm = new THREE.Object3D(), cl = new THREE.Color(); noteM.frustumCulled = false; SP.forEach((q, i) => noteM.setColorAt(i, cl.setHex(q.v > 1 ? 0xffd23f : [0x6ad0ff, 0xff5ab4][i % 2]))); grp.add(noteM);
  /* ===== Ein- und Ausgang ===== */
  /* ===== Nähe / Aktion ===== */
  K.near = function () {
    if (P.veh || P.y > 12 || K.open || !K.inside) return null; const nr = (x, z, r) => Math.hypot(P.x - x, P.z - z) < r;
    for (const p of P0) { if (!nr(p.C.x, p.C.z, 22)) continue; if (nr(p.rp.x, p.rp.z, 3.4)) return { k: 'rradio', i: p.i, label: ['📻', R.on && R.cur === p.i ? ST[p.i].n + ' ausschalten' : ST[p.i].n + ' einschalten'] }; if (nr(p.scr.x, p.scr.z, 5)) return { k: 'rvis', i: p.i, label: ['📺', 'Visual Radio ansehen'] }; if (nr(p.sp.x, p.sp.z, 6.2)) return { k: 'rstat', i: p.i, label: ['📸', ST[p.i].n + '-Statue ansehen'] }; }
    if (nr(X(0), Z(0), 8)) return { k: 'rtower', label: ['📡', 'Funkturm'] };
    return null;
  };
  K.act = function (n) {
    if (!n) return; const s = S();
    if (n.k === 'rradio') toggleRadio(n.i); else if (n.k === 'rvis') openVisual(n.i);
    else if (n.k === 'rstat') { fx.burst(P0[n.i].sp.x, 7, P0[n.i].sp.z, 18, [[1, .9, .5], [1, 1, 1], [.5, .8, 1]], 4, 1.2, 28, -1); say('📻 ' + ST[n.i].n + ' – läuft auf laut.fm/' + ST[n.i].slug, 3400); }
    else if (n.k === 'rtower') { say('📡 Alle 13 Sender senden live über laut.fm – schalte die Radios an den Plätzen ein!', 4200); [523, 659, 784].forEach((f, i) => note(f, 1, 'sine', .1, i * .12)); }
  };
  /* ===== Frame ===== */
  let was = false, shT = 0; const posOf = i => P0[i].rp;
  K.update = function (dt, t) {
    const d0 = Math.hypot(P.x - A.x, P.z - A.z), ins = d0 < A.R + 25; K.inside = ins; if (ins !== was) { was = ins; if (ins) { const s0 = S(); if (!s0.visit) { s0.visit = 1; persist(); setTimeout(() => bonus(2, '📡 Willkommen in der Funkwelle!'), 700); } else say('📡 Funkwelle – 13 Sender', 2200); } else if (R.on || K.open) { K.closeVisual(); stopRadio(); } }
    const near = d0 < 700; if (grp.visible !== near) grp.visible = near;
    if (!ins) return; const s = S();
    if (!lautIm) { lautIm = loadImg(A.lautLogo); portalIm = loadImg(A.portalLogo); }
    for (const q of PL) {
      const p = q.p, dd = Math.hypot(P.x - p.C.x, P.z - p.C.z), act = R.on && R.cur === q.i, nearP = dd < 80;
      if (nearP && !imgs[q.i]) { imgs[q.i] = loadImg(ST[q.i].logo); imgs[q.i].onload = () => { const tx = new THREE.Texture(imgs[q.i]); tx.needsUpdate = true; q.plateMat.map = tx; q.plateMat.color.setHex(0xffffff); q.plateMat.needsUpdate = true; q.lastDraw = 0; }; }
      if (nearP) { q.g.rotation.y = p.ry + Math.sin(t * .7 + q.i) * .45; q.g.position.y = 5.9 + Math.sin(t * 1.3 + q.i) * .15; q.plate.scale.setScalar(1); }
      beams[q.i].material.opacity = act ? .38 + .1 * Math.sin(t * 6) : .14; q.ball.material.opacity = act ? .8 + .2 * Math.sin(t * 8) : .25; q.ball.scale.setScalar(act ? 1 + .25 * Math.sin(t * 8) : 1);
      if ((dd < 45 || (act && dd < 90)) && t - q.lastDraw > .09) { q.lastDraw = t; drawScreen(q, t); }
    }
    if (R.on) {
      const p = posOf(R.cur), d = Math.hypot(P.x - p.x, P.z - p.z), v = d < 12 ? 1 : d > 62 ? 0 : Math.pow(1 - (d - 12) / 50, 1.5); R.vol = v;
      if (R.el) { R.el.volume = Math.max(0, Math.min(1, v * (AU.muted ? 0 : (AU._vol == null ? 1 : AU._vol)))); if (v <= .01 && !R.pausedFar && !R.el.paused) { R.el.pause(); R.pausedFar = true; } else if (v > .03 && R.pausedFar) { R.pausedFar = false; startStream(R.cur); R.el.volume = Math.max(0, Math.min(1, v * (AU.muted ? 0 : (AU._vol == null ? 1 : AU._vol)))); } }
      try { AU.duck && AU.duck(1 - .88 * v); } catch (e) { } nowPlaying();
      if (!R.pausedFar && R.el && !R.el.paused && R.el.readyState > 2 && v > .2) { R.heardT += dt; if (R.heardT >= 20 && !s.done.includes(R.cur)) { s.done.push(R.cur); persist(); G.addStars(1); say('📻 ' + ST[R.cur].n + ' gehört! +1 ⭐ (' + s.done.length + '/13)', 3200); if (s.done.length >= N && !s.all) { s.all = 1; persist(); setTimeout(() => bonus(10, '🏆 Alle 13 Sender gehört!'), 1500); } } }
    }
    SP.forEach((q, i) => { if (s.notes.includes(i)) { dm.position.set(0, -80, 0); dm.scale.setScalar(.001); } else { dm.position.set(q.x, q.y + Math.sin(t * 2 + i) * .18, q.z); dm.scale.setScalar(q.v > 1 ? 1.5 : 1); dm.rotation.set(0, t * 1.2 + i, Math.sin(t + i) * .3); } dm.updateMatrix(); noteM.setMatrixAt(i, dm.matrix); }); noteM.instanceMatrix.needsUpdate = true;
    shT -= dt; if (shT <= 0) { shT = .08; for (let i = 0; i < SP.length; i++) { const q = SP[i]; if (s.notes.includes(i)) continue; if (Math.abs(P.x - q.x) < 1.4 && Math.abs(P.z - q.z) < 1.4 && Math.abs(P.y + .8 - q.y) < 2.2) { s.notes.push(i); s.pts += q.v; note(988, .25, 'triangle', .09, 0); fx.burst(q.x, q.y, q.z, 8, [[.4, .8, 1], [1, .5, .8]], 2.4, .6, 24, 3); const due = Math.floor(s.pts / 10) - s.paid; if (due > 0) { s.paid += due; G.addStars(due); say('🎵 → ⭐ Noten werden zu Sternen: +' + due + ' ⭐ (' + s.pts + ' Noten)', 3000); } else say('🎵 Noten ' + s.pts + ' (alle 10 = 1 ⭐)', 1100); persist(); } } }
    if (Math.random() < dt * 4) fx.emit(X(0) + (Math.random() - .5) * 2, 50 + Math.random() * 8, Z(0) + (Math.random() - .5) * 2, 0, .8, 0, 1.2, 30, .6, .8, 1, -.5, .8);
  };
  K.log = () => { const s = S(); return { title: '📻 Funkwelle', count: ((s.visit ? 1 : 0) + s.done.length + (s.all ? 1 : 0) + (s.visual ? 1 : 0) + Math.min(3, Math.floor(s.pts / 20)) + (s.played ? 1 : 0)) + ' von 20', rows: [
    { ok: !!s.visit, icon: '📡', text: 'Funkwelle besuchen (Brücke im Südosten der Hauptinsel)', dest: 'radio' },
    { ok: s.done.length >= 1, icon: '📻', text: 'Sender hören: ' + s.done.length + ' von 13 (Radio am Platz einschalten, 20 Sekunden zuhören = +1 ⭐)', dest: 'radio' },
    { ok: !!s.all, icon: '🏆', text: 'Alle 13 Sender gehört (+10 ⭐)', dest: 'radio' },
    { ok: !!s.visual, icon: '📺', text: 'Das Visual Radio an einem Bildschirm ansehen', dest: 'radio' },
    { ok: s.pts >= 60, icon: '🎵', text: 'Noten sammeln: ' + s.pts + ' (alle 10 = 1 ⭐)', dest: 'radio' },
    { ok: !!s.played, icon: '🕹️', text: 'Frequenz-Dreher am Spielautomaten spielen', dest: 'radio' }] }; };
  return K;
};
