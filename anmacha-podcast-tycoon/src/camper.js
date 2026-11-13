/* AnMaCha – Der Podcast · Gisela von innen: Marcos Camper begehbar, ausbaubar und erweiterbar.
   Ausbauten kosten Fan-Punkte, sind innen (und teils außen an Gisela) sichtbar und bringen Vorteile. */
(function (root) {
  'use strict';
  const AMC = root.AMC, U = AMC.U, W = AMC.World, D = AMC.Data, Save = AMC.Save;
  const CP = AMC.Camper = {};
  let T = null, K = null;

  // Ausbauten: id, Name, Kosten, Beschreibung
  const UP = [
    { id: 'bett', icon: '🛏️', name: 'Klappbett', cost: 150, desc: 'Ausschlafen unterwegs: Energie auftanken.' },
    { id: 'kueche', icon: '🍳', name: 'Mini-Küche', cost: 200, desc: 'Gaskocher und Kühlschrank: Hunger stillen.' },
    { id: 'studio', icon: '🎙️', name: 'Mobiles Studio', cost: 350, desc: 'Mikro und Laptop: Gisela-Session mit Klavierlicht-Song, bringt Ideen und Fans.' },
    { id: 'sofa', icon: '🛋️', name: 'Sitzecke', cost: 180, desc: 'Tisch und Bank: quatschen, planen, Spaß.' },
    { id: 'licht', icon: '✨', name: 'Lichterkette', cost: 80, desc: 'Gemütlich! Mehr Spaß bei allem im Camper.' },
    { id: 'solar', icon: '☀️', name: 'Solardach', cost: 400, desc: 'Strom für alles: Besorgungen mit Gisela bringen 50 % mehr Fan-Punkte.' },
    { id: 'markise', icon: '⛱️', name: 'Markise & Campingstühle', cost: 250, desc: 'Außen an Gisela sichtbar: Campingflair! Events mit Gisela bringen 40 Fan-Punkte extra.' },
    { id: 'heck', icon: '🧰', name: 'Heck-Erweiterung', cost: 600, desc: 'Gisela wird länger: Plattenspieler-Ecke mit Klavierlicht-Platten.' }
  ];
  CP.UP = UP;
  const has = id => !!((Save.data.gisela || {}).up || {})[id];
  CP.has = has;
  CP.value = () => UP.filter(u => has(u.id)).length;
  CP.errandBonus = () => has('solar') ? 1.5 : 1;

  // Außen an Gisela sichtbar (Stadt, Studio-Deko)
  CP.decorate = function (g) {
    T = root.THREE; const M = (c, o) => W.mat(c, o || { r: 0.6 });
    if (has('solar')) [-0.5, 0.5].forEach(z => { W.box(1.5, 0.05, 0.9, M(0x1a2a5a, { m: 0.6, r: 0.25 }), 0, 2.14, -0.5 + z * 1.2, g, false); });
    if (has('licht')) for (let i = 0; i < 12; i++) { const b = new T.Mesh(new T.SphereGeometry(0.05, 6, 5), M([0xffd23f, 0xff3da8, 0x3dd6ff][i % 3], { e: [0xffd23f, 0xff3da8, 0x3dd6ff][i % 3], ei: 1.6 })); b.position.set(1.04, 1.62 + Math.sin(i) * 0.04, -2 + i * 0.36); g.add(b); }
    if (has('markise')) { const a = W.box(0.05, 0.04, 3.0, M(0xff8a1e), 1.9, 1.75, -0.4, g, false); W.box(1.9, 0.03, 3.0, M(0xff8a1e, { r: 0.8 }), 1.95, 1.72, -0.4, g, false).rotation.z = -0.12; [-1.8, 1.0].forEach(z => W.cyl(0.03, 0.03, 1.7, M(0xcccccc, { m: 0.6 }), 2.8, 0.85, z, g, 6)); [[2.4, -1], [2.4, 0.3]].forEach(([x, z]) => { W.box(0.5, 0.06, 0.5, M(0x2f7a3a), x, 0.45, z, g, false); W.box(0.5, 0.5, 0.06, M(0x2f7a3a), x, 0.7, z - 0.25, g, false); }); a.visible = true; }
    if (has('heck')) { W.box(1.6, 0.9, 0.7, M(0xf2efe6, { r: 0.5 }), 0, 1.15, -2.5, g, false); W.box(1.62, 0.4, 0.72, M(0x3aa7a0, { r: 0.5 }), 0, 0.55, -2.5, g, false); }
  };

  // ------------------------------------------------------------------ Innenraum
  function build() {
    const sc = new T.Scene(), g = new T.Group(); sc.add(g);
    const L = has('heck') ? 7.0 : 5.4, hl = L / 2, hd = 1.2, M = (c, o) => W.mat(c, o || { r: 0.7 });
    sc.background = new T.Color(0x1b2030);
    sc.add(new T.HemisphereLight(0xfff1e0, 0x3a3040, 0.9));
    const sun = new T.DirectionalLight(0xffe8c8, 0.9); sun.position.set(2, 8, 6); sc.add(sun);
    const warm = new T.PointLight(has('licht') ? 0xffb060 : 0xfff1e0, has('licht') ? 1.6 : 0.9, 10); warm.position.set(0, 2.2, 0); sc.add(warm);
    // Boden (Holz), Rückwand mit Fenstern, Stirnwände, Dachkante; die vordere Wand ist für die Kamera offen
    const ft = W.canvasTex(128, 128, (c, w, h) => { c.fillStyle = '#a07850'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(0,0,0,.12)'; for (let y = 0; y < h; y += 16) c.fillRect(0, y, w, 2); }, [L, 2]);
    const fl = new T.Mesh(new T.PlaneGeometry(L, hd * 2), new T.MeshStandardMaterial({ map: ft, roughness: 0.8 })); fl.rotation.x = -Math.PI / 2; g.add(fl);
    const wallM = M(0xf2efe6, { r: 0.85 }), tq = M(0x3aa7a0), or = M(0xff8a1e, { e: 0xff8a1e, ei: 0.2 });
    W.box(L, 2.2, 0.12, wallM, 0, 1.1, -hd, g, false); W.box(L, 0.5, 0.13, tq, 0, 0.25, -hd + 0.01, g, false); W.box(L, 0.06, 0.14, or, 0, 0.53, -hd + 0.02, g, false);
    W.box(0.12, 2.2, hd * 2, wallM, -hl, 1.1, 0, g, false); W.box(0.12, 2.2, hd * 2, wallM, hl, 1.1, 0, g, false);
    W.box(L, 0.08, hd * 2, M(0xe6e1d4), 0, 2.24, 0, g, false).visible = false;
    // Fenster mit Stadtblick
    const view = W.canvasTex(256, 128, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#7ec8ff'); gr.addColorStop(1, '#ffd9a8'); c.fillStyle = gr; c.fillRect(0, 0, w, h); c.fillStyle = '#5a6b8a'; for (let i = 0; i < 9; i++) { const bw = 18 + (i * 7) % 20, bh = 30 + (i * 13) % 50; c.fillRect(i * 30, h - bh, bw, bh); } c.fillStyle = '#3d6b35'; c.fillRect(0, h - 10, w, 10); });
    [-1.4, 1.0].forEach(x => { if (Math.abs(x) > hl - 0.6) return; const m = new T.Mesh(new T.PlaneGeometry(1.1, 0.6), new T.MeshBasicMaterial({ map: view })); m.position.set(x, 1.45, -hd + 0.07); g.add(m); W.box(1.2, 0.06, 0.06, M(0x666666), x, 1.78, -hd + 0.08, g, false); W.box(1.2, 0.06, 0.06, M(0x666666), x, 1.12, -hd + 0.08, g, false); });
    // Fahrerkabine vorn (+x)
    const cab = hl - 0.6;
    [-0.5, 0.5].forEach(z => { W.box(0.6, 0.45, 0.55, M(0x2a2c36), cab, 0.45, z, g, false); W.box(0.12, 0.7, 0.55, M(0x2a2c36), cab - 0.3, 0.95, z, g, false); });
    W.box(0.35, 0.5, hd * 2 - 0.1, M(0x1a1a1e), hl - 0.18, 0.9, 0, g, false);
    const wheel = new T.Mesh(new T.TorusGeometry(0.2, 0.03, 8, 20), M(0x111111)); wheel.position.set(hl - 0.42, 1.2, -0.5); wheel.rotation.y = Math.PI / 2; wheel.rotation.x = 0.4; g.add(wheel);
    const ws = new T.Mesh(new T.PlaneGeometry(hd * 2 - 0.2, 0.7), new T.MeshBasicMaterial({ map: view })); ws.position.set(hl - 0.07, 1.55, 0); ws.rotation.y = -Math.PI / 2; g.add(ws);
    const dash = W.box(0.06, 0.12, 0.3, M(0x3dd6ff, { e: 0x3dd6ff, ei: 0.9 }), hl - 0.33, 1.18, 0.3, g, false); dash.userData.blink = true;
    // Wackeldackel
    const dog = new T.Mesh(new T.SphereGeometry(0.07, 8, 6), M(0x8a5a3a)); dog.position.set(hl - 0.3, 1.25, 0.6); g.add(dog); dog.userData.wobble = true;
    // Ausbau-Plätze
    const P = {}, xs = has('heck') ? { heck: -hl + 0.8, bett: -hl + 2.4, kueche: -0.3, studio: 1.1, sofa: hl - 1.7 } : { bett: -hl + 0.95, kueche: -0.6, studio: 0.6, sofa: hl - 1.6 };
    const slot = (id, x) => { const o = new T.Group(); o.position.set(x, 0, 0); g.add(o); P[id] = { x, o }; return o; };
    Object.keys(xs).forEach(id => slot(id, xs[id]));
    // Bett
    if (has('bett')) { const o = P.bett.o; W.box(1.5, 0.45, 1.3, M(0x5a4030), 0, 0.22, -0.5, o, false); W.box(1.45, 0.16, 1.25, M(0x3a8be0), 0, 0.52, -0.5, o, false); W.box(0.4, 0.14, 0.9, M(0xffffff), -0.5, 0.66, -0.5, o, false); }
    else ghost(P.bett.o, M);
    if (has('kueche')) { const o = P.kueche.o; W.box(1.2, 0.9, 0.6, M(0xd8d2c4), 0, 0.45, -0.85, o, false); W.box(1.22, 0.05, 0.62, M(0x3a3a3a), 0, 0.92, -0.85, o, false); [-0.25, 0.25].forEach(x => W.cyl(0.12, 0.12, 0.02, M(0x111111), x, 0.95, -0.85, o, 12)); W.box(0.5, 1.4, 0.55, M(0xeeeeee), 0.85, 0.7, -0.85, o, false); const pot = W.cyl(0.11, 0.1, 0.14, M(0xd8342c, { m: 0.4, r: 0.3 }), -0.25, 1.03, -0.85, o, 12); pot.userData.steam = true; }
    else ghost(P.kueche.o, M);
    if (has('studio')) { const o = P.studio.o; W.box(1.1, 0.06, 0.6, M(0x8a6a48), 0, 0.8, -0.85, o, false); W.box(0.06, 0.8, 0.06, M(0x5a4030), -0.5, 0.4, -0.6, o, false); W.box(0.06, 0.8, 0.06, M(0x5a4030), 0.5, 0.4, -0.6, o, false); W.box(0.45, 0.3, 0.03, M(0x111111), -0.1, 1.0, -1.0, o, false); W.box(0.42, 0.27, 0.02, M(0x3dd6ff, { e: 0x3dd6ff, ei: 0.7 }), -0.1, 1.0, -0.98, o, false); W.cyl(0.02, 0.02, 0.35, M(0x222222), 0.3, 1.0, -0.8, o, 6); const mic = new T.Mesh(new T.SphereGeometry(0.07, 10, 8), M(0x9aa0ad, { m: 0.8, r: 0.3 })); mic.position.set(0.3, 1.22, -0.8); o.add(mic); const onair = new T.Mesh(new T.SphereGeometry(0.06, 8, 6), M(0xff2a2a, { e: 0xff2a2a, ei: 1.5 })); onair.position.set(0, 1.75, -1.1); o.add(onair); }
    else ghost(P.studio.o, M);
    if (has('sofa')) { const o = P.sofa.o; W.box(1.2, 0.45, 0.55, M(0xff8a1e), 0, 0.22, -0.85, o, false); W.box(1.2, 0.5, 0.12, M(0xff8a1e), 0, 0.6, -1.08, o, false); W.box(0.8, 0.05, 0.5, M(0xf2efe6), 0, 0.72, -0.3, o, false); W.cyl(0.04, 0.04, 0.7, M(0x888888, { m: 0.6 }), 0, 0.35, -0.3, o, 6); const mug = W.cyl(0.05, 0.05, 0.1, M(0xffffff), 0.2, 0.8, -0.3, o, 10); mug.userData.k = 1; }
    else ghost(P.sofa.o, M);
    if (P.heck) { const o = P.heck.o; W.box(0.9, 0.7, 0.6, M(0x5a4030), 0, 0.35, -0.85, o, false); const disc = W.cyl(0.24, 0.24, 0.02, M(0x111111), 0, 0.72, -0.85, o, 20); disc.userData.spin = 2; W.box(0.08, 0.6, 0.08, M(0x333333), -0.3, 1.0, -0.6, o, false); const bike = new T.Mesh(new T.TorusGeometry(0.28, 0.03, 6, 16), M(0x222222)); bike.position.set(0.1, 0.5, 0.75); o.add(bike); const bike2 = bike.clone(); bike2.position.x = -0.6; o.add(bike2); }
    // Lichterkette an der Decke
    const lights = [];
    if (has('licht')) for (let i = 0; i < 18; i++) { const c = [0xffd23f, 0xff3da8, 0x3dd6ff, 0x6cff8a][i % 4], b = new T.Mesh(new T.SphereGeometry(0.045, 6, 5), M(c, { e: c, ei: 1.6 })); b.position.set(-hl + 0.3 + i * (L - 0.6) / 17, 2.02 - Math.abs(Math.sin(i * 0.9)) * 0.12, -hd + 0.15); g.add(b); lights.push(b); }
    // Gisela-Schild an der Rückwand
    const sign = W.textTex(['🚐 Gisela', 'Ausbaustufe ' + CP.value() + '/' + UP.length], { w: 512, h: 128, size: 52, accent: '#ff8a1e' });
    const sm = new T.Mesh(new T.PlaneGeometry(1.4, 0.35), new T.MeshBasicMaterial({ map: sign, toneMapped: false })); sm.position.set(has('heck') ? -1.6 : -0.1, 1.95, -hd + 0.08); g.add(sm);
    return { sc, g, L, hl, hd, P, lights, cab };
  }
  function ghost(o, M) { const m = W.box(0.9, 0.04, 0.6, M(0xffffff, { t: 0.25 }), 0, 0.03, -0.75, o, false); m.material.transparent = true; m.material.opacity = 0.25; const t = W.textTex(['🛠️'], { w: 96, h: 96, size: 60, bg: '#14161f', accent: '#ff8a1e' }); const s = new T.Sprite(new T.SpriteMaterial({ map: t })); s.scale.set(0.35, 0.35, 1); s.position.set(0, 0.9, -0.75); o.add(s); }

  // ------------------------------------------------------------------ Öffnen
  CP.open = function (host, kit, onClose) {
    T = root.THREE; K = kit;
    const B = build(), who = host || 'marco', other = who === 'andrew' ? 'marco' : 'andrew';
    const R = K.begin({ kind: 'camper', who, sc: B.sc, g: B.g, B, onClose, busy: 0, t: 0, figs: [] });
    const put = (id, x, z, ry, anim) => { const f = W.hosts[id]; if (!f) return null; if (f.root.parent) f.root.parent.remove(f.root); B.g.add(f.root); f.root.visible = true; f.root.position.set(x, 0, z); f.root.rotation.set(0, ry, 0); if (f.talk) f.talk(false); f.play(anim || 'idle', { fade: 0.2 }); return f; };
    put(who, B.hl - 1.6, 0.5, Math.PI);
    const mate = put(other, B.cab, 0.5, -Math.PI / 2, 'idle'); if (mate) R.figs.push(mate);
    const spots = () => {
      const L = [];
      UP.filter(u => B.P[u.id]).forEach(u => { const p = B.P[u.id]; L.push(has(u.id) ? { x: p.x, z: -0.2, r: 1.0, label: useLabel(u), run: () => use(R, u, B) } : { x: p.x, z: -0.2, r: 1.0, label: '🛠️ Hier fehlt was: ' + u.icon + ' ' + u.name + ' (' + u.cost + ' 🎟️)', run: () => shop(R) }); });
      L.push({ x: B.cab, z: 0.2, r: 1.0, label: '💬 Mit ' + D.HOSTS[other].name + ' quatschen', run: () => talk(R, other) });
      L.push({ x: -B.hl + 0.5, z: 0.6, r: 0.9, label: '🚪 Raus in die Stadt', run: () => AMC.Home.close() });
      return L;
    };
    R.w = K.walker({ x: B.hl - 1.6, z: 0.5, fig: W.hosts[who], bounds: { x0: -B.hl + 0.4, x1: B.cab - 0.5, z0: -0.15, z1: 0.85 }, solids: () => [], spots, camOff: [0, 3.9, 4.6] });
    const ui = K.hud('🚐 Gisela · ' + D.HOSTS[who].name + ' an Bord', '<button type="button" class="btn small" id="cpBuild">🛠️ Ausbauen</button>');
    ui.querySelector('#cpBuild').onclick = () => shop(R);
    K.drawNeeds(); W.particles.attach(B.sc);
    AMC.Audio.sfx('door');
    setTimeout(() => K.say(who === 'andrew' ? 'Marco: „Andrew, du darfst rein. Aber NUR mit mir. Und Schuhe aus!“' : CP.value() ? 'Marco: „Willkommen in Gisela! Ausbaustufe ' + CP.value() + ' von ' + UP.length + '. Sie wird immer schöner.“' : 'Marco: „Gisela ist noch leer. Mit „🛠️ Ausbauen“ machen wir sie zum rollenden Studio!“', 5200), 300);
    R.tick = dt => { B.g.traverse(o => { if (o.userData.wobble) o.position.y = 1.25 + Math.sin(R.t * 9) * 0.02; if (o.userData.blink) o.material.emissiveIntensity = 0.5 + 0.5 * Math.sin(R.t * 4); }); B.lights.forEach((b, i) => { b.material.emissiveIntensity = 1 + Math.sin(R.t * 3 + i) * 0.6; }); if (B.P.kueche && has('kueche') && Math.random() < dt * 2) W.particles.burst(B.P.kueche.x - 0.25, 1.15, -0.85, 0xffffff, 1, { speed: 0.4 }); return false; };
    R.dispose = () => {};
    return R;
  };
  function useLabel(u) { return ({ bett: '😴 Ausschlafen', kueche: '🍳 Kochen', studio: '🎙️ Gisela-Session aufnehmen', sofa: '💬 Planen am Tisch', heck: '💿 Platte auflegen' })[u.id] || u.name; }
  function talk(R, other) {
    const L = R.who === 'andrew' ? ['Marco: „Nicht den Kocher anfassen. Nicht das Bett. Eigentlich gar nichts.“', 'Marco: „Gisela hat Gefühle, Andrew.“', 'Marco: „Wenn du hier krümelst, fahren wir nie wieder zusammen.“']
      : ['Andrew: „Marco, warum hat Gisela einen Namen und mein Fahrrad nicht?“', 'Andrew: „Ich will auch mal fahren!“ Marco: „Nein.“', 'Andrew: „Ein Podcast aus dem Camper. Das ist SO 2026.“', 'Andrew: „Riecht hier was nach Pommes?“'];
    K.say(U.pick(L), 4600); const f = W.hosts[other]; if (f) { f.play('yes', { restart: true }); setTimeout(() => f.play('idle', { fade: 0.3 }), 1500); }
  }
  function use(R, u, B) {
    const n = K.needs(R.who), f = W.hosts[R.who], k = has('licht') ? 1.25 : 1, p = B.P[u.id];
    R.busy = R.w.busy = 1.8; if (f) f.root.rotation.y = Math.atan2(p.x - R.w.x, -0.85 - R.w.z);
    const play = a => { if (f) { f.play(a, { fade: 0.2 }); R.w.anim = a; } };
    if (u.id === 'bett') { play('crouch'); n.energy = Math.min(100, n.energy + 45 * k); K.say('😴 Ein Nickerchen in Gisela. Das Dach knistert gemütlich.'); AMC.Audio.sfx('swap'); }
    else if (u.id === 'kueche') { play('knock'); n.hunger = Math.min(100, n.hunger + 35 * k); K.say(R.who === 'andrew' ? '🍳 Andrew kocht. Marco hält den Feuerlöscher bereit.' : '🍳 Marco macht Camper-Nudeln. Mit extra Liebe.'); AMC.Audio.sfx('collect'); }
    else if (u.id === 'sofa') { play('yes'); n.fun = Math.min(100, n.fun + 20 * k); if ((n.ideas || []).length < 3 && Math.random() < 0.5) { n.ideas.push('Roadtrip-Folge aus Gisela'); K.say('💡 Idee am Tisch: Eine Roadtrip-Folge direkt aus Gisela!'); } else K.say('💬 Ihr plant die nächste Tour. Ziel: irgendwo mit WLAN.'); }
    else if (u.id === 'heck') { play('dance'); R.busy = R.w.busy = 5; n.fun = Math.min(100, n.fun + 25 * k); const w = U.pick(D.WISHES.concat(AMC.Home.ownedSongs())); K.say('💿 Auf dem Plattenspieler: „' + w.t + '“', 5000); AMC.Audio.song(w.id).then(song => { if (song && K.alive(R)) R.stopSong = AMC.Audio.playSong(song, { from: song.mel[0][0], sec: 5, vel: 0.6 }); }).catch(() => {}); }
    else if (u.id === 'studio') return session(R);
    n.fun = Math.min(100, n.fun + 3); Save.save(); K.drawNeeds();
    setTimeout(() => { if (K.alive(R) && f) { f.play('idle', { fade: 0.3 }); R.w.anim = 'idle'; } }, R.busy * 1000);
  }
  // Gisela-Session: Rhythmus-Minispiel mit Klavierlicht-Song (über das Minispiel-Fenster des Zuhauses)
  function session(R) {
    if (R.mini) return;
    const box = U.el('div', 'sh-mini'); box.id = 'hmMini'; U.$('homeUi').appendChild(box);
    const w = U.pick(D.WISHES.concat(AMC.Home.ownedSongs())), hid = R.who;
    R.busy = 99;
    AMC.Audio.song(w.id).catch(() => null).then(song => {
      if (!K.alive(R)) { box.remove(); return; }
      R.mini = { box, ctl: AMC.Minis.start(box, 'rhythm', { song: song || null, color: '#3aa7a0', speed: 1, n: 14, label: '🚐 Gisela-Session: „' + w.t + '“' }, q => {
        if (!K.alive(R)) return;
        R.mini.ctl.destroy(); box.remove(); R.mini = null; R.busy = 0;
        const fan = Save.earn(20 + Math.round(q * 70)), n = K.needs(hid);
        n.fun = Math.min(100, n.fun + 12); n.energy = Math.max(0, n.energy - 6);
        if (q >= 0.55 && (n.ideas || []).length < 3) n.ideas.push('Gisela-Session: „' + w.t + '“');
        Save.save(); K.drawNeeds();
        K.say((q >= 0.75 ? '🔥 Die Gisela-Session geht viral!' : q >= 0.45 ? '👍 Schöne Session aus dem Camper!' : '😅 Der Motor war lauter als das Mikro.') + ' +' + fan + ' 🎟️', 4200);
        AMC.Audio.sfx(q >= 0.6 ? 'applause' : 'ok');
      }) };
    });
  }
  // Ausbau-Menü
  function shop(R) {
    const rows = () => UP.map(u => '<button type="button" class="st-item" data-nav data-u="' + u.id + '"' + (!has(u.id) && Save.data.fan < u.cost ? ' aria-disabled="true"' : '') + '><span class="st-ic">' + u.icon + '</span><span><b>' + u.name + (has(u.id) ? ' ✅' : ' · ' + u.cost + ' 🎟️') + '</b><small>' + u.desc + '</small></span></button>').join('');
    const s = AMC.UI.open('<div class="panel glass wide"><header><h2>🛠️ Gisela ausbauen</h2><button class="btn small" data-nav id="cpBack">' + AMC.glyph('b') + ' Zurück</button></header><p class="hint">🎟️ ' + U.fmt(Save.data.fan) + ' Fan-Punkte · Ausbaustufe ' + CP.value() + '/' + UP.length + ' · Ausbauten sieht man auch außen an Gisela.</p><div class="st-list" id="cpList">' + rows() + '</div></div>', { back: () => AMC.UI.close(s) });
    s.el.querySelector('#cpBack').onclick = () => AMC.UI.close(s);
    s.el.querySelector('#cpList').addEventListener('click', e => {
      const b = e.target.closest('[data-u]'); if (!b) return; const u = UP.find(x => x.id === b.dataset.u);
      if (has(u.id)) { AMC.UI.toast(u.icon + ' ' + u.name + ' ist schon eingebaut.'); return; }
      if (Save.data.fan < u.cost) { AMC.Audio.sfx('miss'); AMC.UI.toast('Zu wenig Fan-Punkte – nimm Folgen auf oder erledige Besorgungen mit Gisela!'); return; }
      CP.buy(u.id); AMC.Audio.sfx('buy'); AMC.UI.close(s);
      // Neu aufbauen und weiter im Camper
      const who = R.who, cb = R.onClose; AMC.Home.close(true); AMC.Home.camper(who, cb);
      setTimeout(() => { const r = AMC.Home._state(); if (r && r.kind === 'camper') { K.say('✨ Neu in Gisela: ' + u.icon + ' ' + u.name + '!'); W.particles.burst(r.w.x, 1.6, r.w.z, 0xffd23f, 40, { speed: 5 }); } }, 500);
    });
  }
  CP.buy = function (id) { const u = UP.find(x => x.id === id); if (!u || has(id)) return false; Save.data.fan -= u.cost; const gz = Save.data.gisela = Save.data.gisela || {}; gz.up = gz.up || {}; gz.up[id] = 1; Save.save(); return true; };
})(typeof window !== 'undefined' ? window : globalThis);
