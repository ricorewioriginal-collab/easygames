'use strict';
/* Bunte Insel – Taschi-Land 🌀 (Portal): Fangen und Kämpfen gibt es hier nicht mehr – die Taschis leben jetzt in ihrem eigenen easygames-Spiel.
   In der Arena steht das große Taschi-Portal: hindurchgehen = Spiel speichern und das Taschi-Spiel öffnen (gleiches Gerät, darum lokaler Link ../taschi/).
   Professor Ulme und Schwester Hanna erzählen, warum die Taschis umgezogen sind. Alte Spielstände (save.taschi) bleiben unberührt gespeichert. */
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
    statue: ['🗿 Die Statue zeigt Professor Ulme mit dem allerersten Taschiball. Er hat das Portal zur Taschi-Welt gebaut.'],
    table: ['🔴🔵🟢 Drei Taschibälle – Andenken an die Zeit, als die Taschis hier wohnten. Die echten Taschis warten hinter dem Portal!']
  };
  K.build = function () {
    if (K.ready) return; K.ready = true;
    const mkN = (id, a, b, name, icon, o, label) => { BI.DLG_LOOKS[name] = look(o); const c = BI.makeChar(look(o)), p = place(c.group, a, b); npcs.push({ id, c, x: p.x, z: p.z, name, icon, label, r: 3.2 }); };
    mkN('prof', 14, 8, 'Professor Ulme', '🔬', { shirt: 0xffffff, pants: 0x6a5a4a, hair: 0xc8c8d0, style: 'short', logo: 0xe8453c }, ['🔬', 'Mit Professor Ulme reden']);
    mkN('nurse', -32, -20, 'Schwester Hanna', '💖', { shirt: 0xff9ac0, pants: 0xffffff, hair: 0xff9ac0, style: 'bun' }, ['💖', 'Mit Schwester Hanna reden']);
    mkN('kai', -22, -4, 'Kai', '🧢', { shirt: 0x3f6fd8, pants: 0x3a3a4a, hair: 0x222222, hat: 'cap', style: 'spiky', logo: 0xffffff }, ['🧢', 'Mit Kai reden']);
    { const p = T.at(T.statue.a, T.statue.b); npcs.push({ id: 'statue', x: p.x, z: p.z, label: ['🗿', 'Statue ansehen'], r: 8.5 }); }
    { const p = T.at(-30, 16); npcs.push({ id: 'table', x: p.x, z: p.z, label: ['🔴', 'Taschibälle ansehen'], r: 3.6 }); }
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
    let best = null, bd = 1e9; for (const n of npcs) { const d = Math.hypot(P.x - n.x, P.z - n.z); if (d < n.r && d < bd) { bd = d; best = { k: 'npc', id: n.id, label: n.label }; } }
    return best;
  };
  K.act = K.interact = function (n) {
    if (!n) return; if (n.k === 'portal') return K.travel();
    const id = n.id; if (id === 'prof') flag('ta_ulme'); if (id === 'statue') flag('ta_statue');
    const L = LINES[id]; if (!L) return; const nn = npcs.find(q => q.id === id);
    if (nn && nn.name) { G.showLines ? G.showLines(nn.name, nn.icon, L.map(s => s.replace(/^[^„]*„|“$/g, ''))) : say(L[0], 5200); } else say(L[0], 5200);
  };
  K.healVisit = () => say(LINES.nurse[0], 5200);
  K.openTeam = K.openShop = K.openHub = () => say('🌀 Die Taschis leben jetzt in ihrem eigenen Spiel. Das Portal steht in der Arena von Taschi-Land (🧭 Wohin?).', 5200);
  K.syncToggle = () => { };
  let seenT = 0;
  K.update = function (dt, t) {
    if (!K.ready) return; const d = Math.hypot(P.x - T.x, P.z - T.z), vis = d < T.R + 160; if (K.portalGroup) K.portalGroup.visible = vis; if (!vis) return;
    if (swirl) swirl.rotation.z -= dt * 1.6; if (glow) glow.material.opacity = .12 + Math.sin(t * 2.2) * .05;
    for (const n of npcs) if (n.c && n.c.group) { const gp = n.c.group.position; if (n.gy == null) n.gy = W.groundY(gp.x, gp.z); gp.y = n.gy + Math.sin(t * 2 + n.x) * .02 + .02; }
    seenT -= dt; if (seenT <= 0) { seenT = .5; if (!has('ta_sehen') && Math.hypot(P.x - K.portal.x, P.z - K.portal.z) < 16) { flag('ta_sehen'); G.earn && G.earn('taschi_fang'); say('🌀 Da ist es: das Taschi-Portal! Geh hinein, um ins Taschi-Spiel zu reisen.', 4600); } }
  };
  K.busy = () => !!box;
  K.log = () => ({ title: '🌀 Taschi-Land', count: ['ta_ulme', 'ta_statue', 'ta_sehen', 'ta_reise'].filter(has).length + ' von 4', rows: [
    { ok: has('ta_ulme'), icon: '🔬', text: 'Mit Professor Ulme reden (am Portal)', dest: 'taschi' },
    { ok: has('ta_statue'), icon: '🗿', text: 'Die große Statue auf dem Platz ansehen', dest: 'taschi' },
    { ok: has('ta_sehen'), icon: '🌀', text: 'Das Taschi-Portal in der Arena finden', dest: 'taschi' },
    { ok: has('ta_reise'), icon: '🚀', text: 'Durchs Portal ins Taschi-Spiel reisen', dest: 'taschi' }] });
  K.dbg = { npcs, closeAsk };
  K.cheatAll = function () { for (const f of ['ta_ulme', 'ta_statue', 'ta_sehen', 'ta_reise']) flag(f); G.earn && (G.earn('taschi_fang'), G.earn('taschi_meister')); persist(); };
  return K;
};
