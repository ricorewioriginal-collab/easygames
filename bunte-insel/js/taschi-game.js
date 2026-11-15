'use strict';
/* Bunte Insel – Taschi-Land 🌀 (Portal): Fangen und Kämpfen gibt es hier nicht mehr – die Taschis leben jetzt in ihrem eigenen easygames-Spiel.
   In der Arena steht das große Taschi-Portal: hindurchgehen = Spiel speichern und das Taschi-Spiel öffnen (gleiches Gerät, darum lokaler Link ../taschi/).
   Professor Ulme und Schwester Hanna erzählen, warum die Taschis umgezogen sind. Alte Spielstände (save.taschi) bleiben unberührt gespeichert.
   Seit 11/2026 wohnen hier wieder echte Taschis zu Besuch: 18 Taschis aus dem Taschi-Spiel (dieselben Modelle, Quaternius Ultimate Monsters, CC0,
   gebacken in models/taschis.bin) laufen, hüpfen und schweben frei über Wiese, Teich, Felsgrat und Platz – anfassen = streicheln (sie hüpfen vor Freude).
   Dazu vier Taschi-Trainer im KayKit-Look, die mit ihrem Taschi über die Insel spazieren und vom Taschi-Spiel erzählen. Fangen/Kämpfen bleibt im Taschi-Spiel. */
BI.TASCHI_GAME_URL = '../taschi/index.html?from=bunteinsel';
BI.createTaschi = function (G) {
  const { scene, W, P, say, save, persist } = G, K = { ready: false, open: false }, T = BI.TASCHI, TAU = Math.PI * 2, npcs = [];
  const flags = () => save.flags || (save.flags = {}), flag = f => { flags()[f] = 1; }, has = f => !!flags()[f];
  const portalAt = T.at(T.arena.a, T.arena.b);
  K.portal = { x: portalAt.x, z: portalAt.z, r: 4.2 };
  let ring = null, swirl = null, glow = null;
  const look = o => Object.assign({ hat: 'none', style: 'short', skin: 0xf3c9a0, pants: 0x4a4a5a, shoe: 0x333333 }, o);
  const place = (g, a, b, h) => { const p = T.at(a, b); g.position.set(p.x, 0, p.z); g.rotation.y = h == null ? Math.atan2(-T.ux, -T.uz) : h; scene.add(g); return p; };
  const LINES = {
    prof: ['Professor Ulme: „Willkommen! Früher haben die Taschis hier gewohnt. Jetzt haben sie eine eigene, viel größere Welt – mit Fangen, Kämpfen und Orden.“',
      'Professor Ulme: „Das Portal in der Arena bringt dich direkt hin. Dein Inselspiel wird vorher gespeichert, und mit „Zurück“ bist du wieder hier.“'],
    nurse: ['Schwester Hanna: „Die Taschis sind gesund und munter in ihre eigene Welt gezogen. Ich kümmere mich jetzt um müde Inselbesucher!“'],
    kai: ['Kai: „Ich war schon drüben! Hinter dem Portal kannst du Taschis fangen und in der Arena antreten. Trau dich!“'],
    statue: ['🗿 Die Statue zeigt Professor Ulme mit der allerersten Taschi-Kapsel. Er hat das Portal zur Taschi-Welt gebaut.'],
    table: ['✨ Drei Taschi-Kapseln – genau wie im Taschi-Spiel: farbige Hälfte, dunkle Hälfte und ein leuchtender Ring. Hinter dem Portal kannst du damit Taschis fangen!']
  };
  /* ---- Echte Taschis 🐾 (Modell, Name, Größe, schwebt?, Zuhause [a, b, Radius], Satz aus dem Taschi-Spiel) ---- */
  const TA = [
    ['mushnub', 'Hutzel', .9, 0, [-6, 52, 13], 'Hutzel versteckt sich unter seinem Pilzhut, sobald es Schritte hört. Im Regen tanzt es heimlich.'],
    ['pinkblob', 'Glibber', .8, 0, [-34, 0, 16], 'Glibber wackelt bei jedem Schritt und lacht dabei so ansteckend, dass alle mitlachen müssen.'],
    ['greenblob', 'Schleimi', .8, 0, [-6, 52, 13], 'Schleimi hüpft über Moos und hinterlässt glitzernde Spuren.'],
    ['cat', 'Miezo', 1, 0, [-34, 0, 16], 'Miezo schläft am liebsten auf warmen Dächern und schnurrt dabei wie ein kleiner Motor.'],
    ['pigeon', 'Gurri', .85, 0, [-12, 12, 12], 'Gurri läuft Wanderern hinterher, in der Hoffnung auf ein paar Krümel.'],
    ['alpaking', 'Alpuff', 1.25, 1, [48, -34, 12], 'Alpuff schwebt auf seiner dicken Wolle wie auf einer Wolke und kitzelt Bergwanderer an der Nase.'],
    ['armabee', 'Hummlo', .9, 1, [-6, 52, 13], 'Hummlo trägt ein Panzerhemd aus Blütenblättern und bewacht Blumenwiesen gegen gierige Naschkatzen.'],
    ['glub', 'Glubbi', 1.05, 1, [46, 36, 12], 'Glubbi schwimmt durch die Luft, als wäre sie Wasser. Es blubbert fröhlich, wenn es Besuch bekommt.'],
    ['yeti', 'Zottelchen', 1.2, 0, [48, -34, 12], 'Zottelchen rollt sich in Schneewehen und kommt als dicker Schneeball wieder heraus.'],
    ['alien', 'Sternling', 1.05, 0, [-6, -52, 12], 'Sternling fiel als Sternschnuppe vom Himmel. Seine Fühler empfangen Lieder aus dem All.'],
    ['chicken', 'Krähgockel', .85, 0, [-12, -14, 12], 'Krähgockel legt keine Eier, behauptet aber steif und fest, es könne es jederzeit.'],
    ['cactoro', 'Kaktino', 1.05, 0, [-6, -52, 12], 'Kaktino steht stundenlang still in der Sonne. Seine Blüte öffnet sich nur für Freunde.'],
    ['ghost', 'Huschel', 1, 1, [46, 36, 12], 'Huschel versteckt sich in Schränken und erschrickt sich meistens selbst am meisten.'],
    ['pinkblob', 'Glibber', .65, 0, [46, 36, 12], 'Glibber wackelt bei jedem Schritt und lacht dabei so ansteckend, dass alle mitlachen müssen.'],
    ['greenblob', 'Schleimi', .65, 0, [-34, 0, 16], 'Schleimi hüpft über Moos und hinterlässt glitzernde Spuren.'],
    ['mushnub', 'Hutzel', .75, 0, [-6, -52, 12], 'Hutzel versteckt sich unter seinem Pilzhut, sobald es Schritte hört. Im Regen tanzt es heimlich.'],
    ['chicken', 'Krähgockel', .75, 0, [-6, 52, 13], 'Krähgockel legt keine Eier, behauptet aber steif und fest, es könne es jederzeit.'],
    ['cat', 'Miezo', .85, 0, [-38, -16, 9], 'Miezo schläft am liebsten auf warmen Dächern und schnurrt dabei wie ein kleiner Motor.']];
  const pets = [], walkers = [], rnd = BI.rng(9090);
  /* Taschi-Trainer im KayKit-Look (js/figuren.js): spazieren zwischen Platz, Wiese und Teich, ihr Partner-Taschi läuft hinterher */
  const TRAINER = [
    { name: 'Trainerin Lea', icon: '🎒', look: { kk: 'ra', shirt: 0x3fa0e8, pants: 0x2e3446, hair: 0x8a4a2a, style: 'ponytail', skin: 0xf0c8a0, pack: true }, route: [[-20, 10], [-6, 44], [10, 30], [-14, 0]], pal: 2,
      lines: ['Ich bin mit Schleimi unterwegs! Im Taschi-Spiel haben wir schon drei Orden geholt.', 'Taschis mögen es, wenn man langsam auf sie zugeht. Dann darfst du sie streicheln!'] },
    { name: 'Trainer Ben', icon: '🧢', look: { kk: 'ro', shirt: 0xe8453c, pants: 0x3a5a9a, hair: 0x2a2020, style: 'spiky', hat: 'cap', skin: 0xc68a5a }, route: [[-30, -12], [-8, -40], [20, -24], [8, -6]], pal: 10,
      lines: ['Krähgockel und ich trainieren für die Arena im Taschi-Spiel. Wir sind schon ziemlich schnell!', 'Siehst du das Portal in der Arena? Dahinter kannst du Taschis mit Kapseln fangen.'] },
    { name: 'Forscherin Ida', icon: '🔍', look: { kk: 'ma', shirt: 0xffffff, pants: 0x6a5a8a, hair: 0xe8d070, style: 'bob', dress: true, glassT: 1, skin: 0xffd6b3 }, route: [[30, 28], [50, 40], [40, 20], [24, 34]], pal: 7,
      lines: ['Glubbi schwebt am liebsten über dem Teich. Ich schreibe alles in mein Taschi-Buch!', 'Jedes Taschi hat einen eigenen Charakter: manche sind schüchtern, andere verspielt.'] },
    { name: 'Wanderer Tom', icon: '🥾', look: { kk: 'rh', shirt: 0x4cc05a, pants: 0x5a4a3a, hair: 0xd8d8d8, style: 'short', beard: 4, beardc: 0xd8d8d8, ctype: 1, skin: 0xe0a979 }, route: [[36, -26], [54, -40], [44, -14], [24, -30]], pal: 8,
      lines: ['Zottelchen wohnt oben am Felsgrat. Wenn es schneit, rollt es sich zu einem Schneeball!', 'Ich wandere jeden Tag einmal rund um Taschi-Land. Die Taschis kennen mich schon.'] }];
  K.build = function () {
    if (K.ready) return; K.ready = true;
    const mkN = (id, a, b, name, icon, o, label) => { BI.DLG_LOOKS[name] = look(o); const c = BI.makeChar(look(o)), p = place(c.group, a, b); npcs.push({ id, c, x: p.x, z: p.z, name, icon, label, r: 3.2 }); };
    mkN('prof', 14, 8, 'Professor Ulme', '🔬', { shirt: 0xffffff, pants: 0x6a5a4a, hair: 0xc8c8d0, style: 'short', logo: 0xe8453c }, ['🔬', 'Mit Professor Ulme reden']);
    mkN('nurse', -32, -20, 'Schwester Hanna', '💖', { shirt: 0xff9ac0, pants: 0xffffff, hair: 0xff9ac0, style: 'bun' }, ['💖', 'Mit Schwester Hanna reden']);
    mkN('kai', -22, -4, 'Kai', '🧢', { shirt: 0x3f6fd8, pants: 0x3a3a4a, hair: 0x222222, hat: 'cap', style: 'spiky', logo: 0xffffff }, ['🧢', 'Mit Kai reden']);
    { const p = T.at(T.statue.a, T.statue.b); npcs.push({ id: 'statue', x: p.x, z: p.z, label: ['🗿', 'Statue ansehen'], r: 8.5 }); }
    { const p = T.at(-30, 16); npcs.push({ id: 'table', x: p.x, z: p.z, label: ['✨', 'Taschi-Kapseln ansehen'], r: 3.6 }); }
    TRAINER.forEach((d, i) => { BI.DLG_LOOKS[d.name] = look(d.look); const c = BI.makeChar(look(d.look)), pts = d.route.map(([a, b]) => T.at(a, b)); c.group.position.set(pts[0].x, 0, pts[0].z); scene.add(c.group);
      walkers.push({ d, c, pts, k: 1, x: pts[0].x, z: pts[0].z, h: 0, ph: i, wait: 1 + i, talkT: 0 }); });
    /* Portal: Steinbogen-Ring mit Lichtern, wirbelnde Scheibe, Leuchtsäule – 4 Zeichenaufrufe, nur nah gezeichnet */
    const g = new THREE.Group(), b = new BI.Batch(), H = 4.6, R = 3.6, face = Math.atan2(T.entry.x - portalAt.x, T.entry.z - portalAt.z);
    b.cyl(0, 0, 0, 4.4, 4.8, .5, 0xd8d0e8, 24); b.cyl(0, .5, 0, 3.9, 4.2, .25, 0xb8a8e0, 24);
    for (let i = 0; i < 18; i++) { const a = i / 18 * TAU; b.box(Math.cos(a) * R, H + Math.sin(a) * R - .62, 0, 1.25, 1.25, 1.1, i % 2 ? 0x8a7ad8 : 0xb8a8f0, 0, 0, a); }
    for (const s of [-1, 1]) b.box(s * R, 0, 0, 1.3, 1.4, 1.3, 0x8a7ad8);
    ring = b.mesh(BI.mat()); g.add(ring);
    const lamps = new BI.Batch(); for (let i = 0; i < 9; i++) { const a = i / 9 * TAU + .17; lamps.sph(Math.cos(a) * (R + .7), H + Math.sin(a) * (R + .7), .62, .22, [0xff6a6a, 0xffd23f, 0x6ad8ff][i % 3], 1); }
    g.add(lamps.mesh(new THREE.MeshBasicMaterial({ vertexColors: true })));
    { const cv = document.createElement('canvas'); cv.width = cv.height = 256; const c = cv.getContext('2d'), gr = c.createRadialGradient(128, 128, 8, 128, 128, 128);
      gr.addColorStop(0, '#ffffff'); gr.addColorStop(.25, '#ffd6f4'); gr.addColorStop(.55, '#a06bff'); gr.addColorStop(.85, '#3a7bff'); gr.addColorStop(1, 'rgba(40,60,200,0)'); c.fillStyle = gr; c.fillRect(0, 0, 256, 256);
      c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 7; for (let k = 0; k < 5; k++) { c.beginPath(); for (let t = 0; t < 1; t += .02) { const a = k / 5 * TAU + t * 5.5, r = 16 + t * 104; c.lineTo(128 + Math.cos(a) * r, 128 + Math.sin(a) * r); } c.stroke(); }
      const tex = new THREE.CanvasTexture(cv); swirl = new THREE.Mesh(new THREE.CircleGeometry(R - .55, 40), new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false })); swirl.position.y = H; g.add(swirl); }
    glow = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 2.6, 26, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xc08aff, transparent: true, opacity: .16, side: THREE.DoubleSide, depthWrite: false })); glow.position.y = 13; g.add(glow);
    g.position.set(portalAt.x, 0, portalAt.z); g.rotation.y = face; scene.add(g); K.portalGroup = g;
    W.addCircle(portalAt.x + Math.sin(face + Math.PI / 2) * R, portalAt.z + Math.cos(face + Math.PI / 2) * R, .8, false, 9);
    W.addCircle(portalAt.x - Math.sin(face + Math.PI / 2) * R, portalAt.z - Math.cos(face + Math.PI / 2) * R, .8, false, 9);
    W.spots.taschiportal = { x: portalAt.x + Math.sin(face) * 6, z: portalAt.z + Math.cos(face) * 6 };
  };
  /* ---- Rückfrage im Konsolen-Stil (Gamepad: Markierung springt auf „Los“) ---- */
  let box = null;
  function closeAsk() { if (box) { const c = box; box = null; c(); } K.open = false; }
  K.travel = function () {
    if (box) return; K.open = true; G.setStick && G.setStick(0, 0); flag('ta_portal');
    box = BI.portalAsk({ id: 'taPortalAsk', goId: 'taGo', stayId: 'taStay', icon: '🌀', color: '#8a5bff', title: 'Ins Taschi-Abenteuer reisen?', text: 'Das Portal öffnet das easygames-Spiel Taschi: fangen, tauschen, Orden holen. Dein Inselspiel wird vorher gespeichert.',
      onClose: () => { box = null; K.open = false; },
      onGo: () => { flag('ta_reise'); G.earn && G.earn('taschi_meister'); if (K.noNav) { try { persist(); } catch (e) { } return; }
        BI.portalGo({ url: BI.TASCHI_GAME_URL, name: 'Taschi', color: '#8a5bff', persist, onFail: () => say('🌀 Das Portal flackert … versuch es gleich noch einmal!', 3600) }); } });
  };
  K.near = function () {
    if (!K.ready || P.veh || P.y > 1.5 || box) return null; if (Math.hypot(P.x - T.x, P.z - T.z) > T.R + 6) return null;
    if (Math.hypot(P.x - K.portal.x, P.z - K.portal.z) < 7) return { k: 'portal', label: ['🌀', 'Durchs Portal zum Taschi-Spiel'] };
    let best = null, bd = 1e9;
    for (const w of walkers) { const d = Math.hypot(P.x - w.x, P.z - w.z); if (d < 2.8 && d < bd) { bd = d; best = { k: 'trainer', w, label: [w.d.icon, 'Mit ' + w.d.name + ' reden'] }; } }
    for (const t of pets) { const d = Math.hypot(P.x - t.x, P.z - t.z); if (d < 2.4 + t.s * .5 && d < bd) { bd = d; best = { k: 'pet', t, label: ['🐾', t.name + ' streicheln'] }; } }
    if (best) return best; for (const n of npcs) { const d = Math.hypot(P.x - n.x, P.z - n.z); if (d < n.r && d < bd) { bd = d; best = { k: 'npc', id: n.id, label: n.label }; } }
    return best;
  };
  K.act = K.interact = function (n) {
    if (!n) return; if (n.k === 'portal') return K.travel();
    if (n.k === 'pet') return pet(n.t);
    if (n.k === 'trainer') { const w = n.w; w.talkT = 6; w.wait = Math.max(w.wait, 6); flag('ta_trainer'); if (G.showLines) G.showLines(w.d.name, w.d.icon, w.d.lines); else say(w.d.icon + ' ' + w.d.lines[0], 5200); return; }
    const id = n.id; if (id === 'prof') flag('ta_ulme'); if (id === 'statue') flag('ta_statue');
    const L = LINES[id]; if (!L) return; const nn = npcs.find(q => q.id === id);
    if (nn && nn.name) { G.showLines ? G.showLines(nn.name, nn.icon, L.map(s => s.replace(/^[^„]*„|“$/g, ''))) : say(L[0], 5200); } else say(L[0], 5200);
  };
  /* Streicheln: Taschi hüpft vor Freude, Herzchen, sein Satz aus dem Taschi-Spiel; 5 verschiedene gestreichelt = Taschi-Freund (Aufgabe) */
  function pet(t) {
    t.happy = 1.4; t.wait = 2.5; const fx = G.fx; if (fx && fx.burst) fx.burst(t.x, t.y + t.s + .3, t.z, 8, [[1, .45, .65], [1, .8, .9], [1, .85, .3]], 2.4, .7, 22, 2);
    if (G.A && G.A.pop) G.A.pop(); const f = flags(), key = 'ta_t_' + t.m, neu = !f[key]; f[key] = 1;
    const n = TA.filter((q, i) => TA.findIndex(r => r[0] === q[0]) === i && f['ta_t_' + q[0]]).length;
    say('💖 ' + t.name + ' freut sich! ' + t.bio + (neu && n < 5 ? ' (' + n + ' von 5 Taschis gestreichelt)' : ''), 5600);
    if (n >= 5 && !has('ta_freunde')) { flag('ta_freunde'); if (G.addStars) G.addStars(5); setTimeout(() => say('🐾 Du hast 5 verschiedene Taschis gestreichelt – jetzt bist du ein echter Taschi-Freund! ⭐ +5', 4800), 2800); }
    persist();
  }
  /* Taschis erst laden, wenn man in die Nähe kommt (≈ 360 KB, nur einmal) */
  let petsAsked = false;
  function spawnPets() {
    const D = BI.Deko; if (petsAsked || !D || !D.pack) return; petsAsked = true;
    D.pack('taschis.bin', () => { const mat = BI.charMat ? BI.charMat() : BI.mat();
      TA.forEach(([m, name, size, fly, home, bio], i) => { const g = D.geo('t_' + m); if (!g) return; const sz = D.M['t_' + m].size, s = size / Math.max(sz[1], sz[0] * .6), grp = new THREE.Group(), mesh = new THREE.Mesh(g, mat);
        mesh.scale.setScalar(s); grp.add(mesh); const c = T.at(home[0] + (rnd() - .5) * home[2], home[1] + (rnd() - .5) * home[2]); grp.position.set(c.x, 0, c.z); scene.add(grp);
        pets.push({ m, name, bio, s: size, fly: !!fly, home: T.at(home[0], home[1]), hr: home[2], g: grp, mesh, sc: s, x: c.x, z: c.z, y: 0, h: rnd() * TAU, tx: c.x, tz: c.z, sp: .8 + rnd() * .7, wait: rnd() * 3, ph: rnd() * TAU, happy: 0 }); });
      K.petsReady = true; });
  }
  const angTo = (a, b, k) => { let d = b - a; while (d > Math.PI) d -= TAU; while (d < -Math.PI) d += TAU; return a + d * Math.min(1, k); };
  function updatePets(dt, t) {
    for (const p of pets) {
      const dp = Math.hypot(P.x - p.x, P.z - p.z); let moving = false;
      if (p.happy > 0) { p.happy -= dt; p.h += dt * 7; }
      else if (dp < 2.2 && !P.veh) { p.h = angTo(p.h, Math.atan2(P.x - p.x, P.z - p.z), dt * 5); }
      else if (p.wait > 0) p.wait -= dt;
      else { const dx = p.tx - p.x, dz = p.tz - p.z, d = Math.hypot(dx, dz);
        if (d < .4) { p.wait = 1 + rnd() * 4; const a = rnd() * TAU, r = Math.sqrt(rnd()) * p.hr; p.tx = p.home.x + Math.sin(a) * r; p.tz = p.home.z + Math.cos(a) * r; }
        else { const st = Math.min(d, p.sp * dt), nx = p.x + dx / d * st, nz = p.z + dz / d * st; if (p.fly || W.free(nx, nz, .35)) { p.x = nx; p.z = nz; moving = true; } else p.tx = p.x, p.tz = p.z; p.h = angTo(p.h, Math.atan2(dx, dz), dt * 6); } }
      p.ph += dt * (moving ? p.sp * 7 : 2.4); const gy = W.groundY(p.x, p.z), hop = p.happy > 0 ? Math.abs(Math.sin(p.happy * 9)) * .7 : moving ? Math.abs(Math.sin(p.ph)) * .16 * p.s : 0;
      p.y = gy + (p.fly ? .9 + Math.sin(t * 2 + p.ph * .3) * .22 : 0) + hop; p.g.position.set(p.x, p.y, p.z); p.g.rotation.y = p.h;
      const sq = p.fly ? 1 : moving ? 1 + Math.sin(p.ph * 2) * .06 : 1 + Math.sin(p.ph) * .025; p.mesh.scale.set(p.sc / Math.sqrt(sq), p.sc * sq, p.sc / Math.sqrt(sq));
    }
  }
  function updateWalkers(dt) {
    for (const w of walkers) {
      let moving = false; const dp = Math.hypot(P.x - w.x, P.z - w.z);
      if (w.talkT > 0 || (dp < 2.4 && !P.veh)) { w.talkT -= dt; w.h = angTo(w.h, Math.atan2(P.x - w.x, P.z - w.z), dt * 5); }
      else if (w.wait > 0) w.wait -= dt;
      else { const q = w.pts[w.k], dx = q.x - w.x, dz = q.z - w.z, d = Math.hypot(dx, dz);
        if (d < .5) { w.k = (w.k + 1) % w.pts.length; w.wait = 2 + rnd() * 3; } else { const st = Math.min(d, 1.3 * dt), nx = w.x + dx / d * st, nz = w.z + dz / d * st; if (W.free(nx, nz, .4)) { w.x = nx; w.z = nz; moving = true; } else { w.k = (w.k + 1) % w.pts.length; } w.h = angTo(w.h, Math.atan2(dx, dz), dt * 6); } }
      w.ph += dt * (moving ? 8 : 0); w.c.pose(w.ph, moving ? .55 : 0, false); w.c.group.position.set(w.x, W.groundY(w.x, w.z), w.z); w.c.group.rotation.y = w.h;
      const pt = pets.filter(p => p.m === TA[w.d.pal][0])[0]; if (pt && pt.happy <= 0 && !pt.leash) { pt.leash = w; }
      if (pt && pt.leash === w && pt.happy <= 0) { const bx = w.x - Math.sin(w.h) * 1.4 + Math.cos(w.h) * .9, bz = w.z - Math.cos(w.h) * 1.4 - Math.sin(w.h) * .9; pt.tx = bx; pt.tz = bz; pt.wait = 0; pt.home = { x: bx, z: bz }; pt.hr = .1; pt.sp = Math.max(pt.sp, 1.5); }
    }
  }
  K.healVisit = () => say(LINES.nurse[0], 5200);
  K.openTeam = K.openShop = K.openHub = () => say('🌀 Die Taschis leben jetzt in ihrem eigenen Spiel. Das Portal steht in der Arena von Taschi-Land (🧭 Wohin?).', 5200);
  K.syncToggle = () => { };
  let seenT = 0;
  K.update = function (dt, t) {
    if (!K.ready) return; const d = Math.hypot(P.x - T.x, P.z - T.z), vis = d < T.R + 160; if (K.portalGroup) K.portalGroup.visible = vis; if (!vis) { for (const p of pets) p.g.visible = false; for (const w of walkers) w.c.group.visible = false; return; }
    if (swirl) swirl.rotation.z -= dt * 1.6; if (glow) glow.material.opacity = .12 + Math.sin(t * 2.2) * .05;
    for (const n of npcs) if (n.c && n.c.group) { const gp = n.c.group.position; if (n.gy == null) n.gy = W.groundY(gp.x, gp.z); gp.y = n.gy + Math.sin(t * 2 + n.x) * .02 + .02; }
    /* Taschis und Trainer: nur in der Nähe der Insel bewegen und zeigen (Handy-Leistung) */
    if (d < T.R + 120) spawnPets(); const live = d < T.R + 70; for (const p of pets) p.g.visible = live; for (const w of walkers) w.c.group.visible = live;
    if (live) { updatePets(dt, t); updateWalkers(dt); }
    seenT -= dt; if (seenT <= 0) { seenT = .5; if (!has('ta_sehen') && Math.hypot(P.x - K.portal.x, P.z - K.portal.z) < 16) { flag('ta_sehen'); G.earn && G.earn('taschi_fang'); say('🌀 Da ist es: das Taschi-Portal! Geh hinein, um ins Taschi-Spiel zu reisen.', 4600); } }
  };
  K.busy = () => !!box;
  K.log = () => ({ title: '🌀 Taschi-Land', count: ['ta_ulme', 'ta_statue', 'ta_sehen', 'ta_reise', 'ta_freunde'].filter(has).length + ' von 5', rows: [
    { ok: has('ta_ulme'), icon: '🔬', text: 'Mit Professor Ulme reden (am Portal)', dest: 'taschi' },
    { ok: has('ta_statue'), icon: '🗿', text: 'Die große Statue auf dem Platz ansehen', dest: 'taschi' },
    { ok: has('ta_sehen'), icon: '🌀', text: 'Das Taschi-Portal in der Arena finden', dest: 'taschi' },
    { ok: has('ta_reise'), icon: '🚀', text: 'Durchs Portal ins Taschi-Spiel reisen', dest: 'taschi' },
    { ok: has('ta_freunde'), icon: '🐾', text: '5 verschiedene Taschis streicheln', dest: 'taschi' }] });
  K.dbg = { npcs, closeAsk, pets, walkers, pet };
  K.cheatAll = function () { for (const f of ['ta_ulme', 'ta_statue', 'ta_sehen', 'ta_reise', 'ta_freunde']) flag(f); G.earn && (G.earn('taschi_fang'), G.earn('taschi_meister')); persist(); };
  return K;
};
