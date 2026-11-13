/* AnMaCha – Der Podcast – Studio und Live-Aufnahme.
   Das Studio (3D) dient als Menü-Hintergrund, Aufnahmeraum und Quizshow-Bühne.
   Die Aufnahme ist ein Befehlsmenü wie in Kingdom Hearts: Thema, Pointe, Übergabe, Jingle, Spezial – dazu Timing-Ring, Tastenfolgen und Störungen. */
(function (root) {
  'use strict';
  const AMC = root.AMC = root.AMC || {};
  const U = AMC.U, D = AMC.Data, W = AMC.World, I = AMC.Input;
  let T;

  // ================================================================== Studio (3D)
  const ST = AMC.Studio = { built: false, mode: 'menu', t: 0, camT: 0, shot: 0 };
  ST.build = function () {
    if (ST.built) return; T = root.THREE; ST.built = true;
    const sc = ST.scene = new T.Scene(), g = new T.Group(); sc.add(g); ST.group = g;
    const env = W.makeSky(sc, 'studio'); env.sun.position.set(2, 7, 6); env.sun.target.position.set(0, 1, 0); ST.env = env;
    const c = env.sun.shadow.camera; c.left = -8; c.right = 8; c.top = 8; c.bottom = -8;
    const M = W.mat;
    // Raum
    const floorTex = W.canvasTex(256, 256, (cx, w, h) => { cx.fillStyle = '#3a2a1e'; cx.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 32) { cx.fillStyle = 'rgba(0,0,0,.25)'; cx.fillRect(0, y, w, 2); for (let x = (y / 32 % 2) * 64; x < w; x += 128) cx.fillRect(x, y, 2, 32); } W.speckle(cx, w, h, 'rgba(0,0,0,0)', 0.12, 2000); }, [4, 4]);
    const floorMat = new T.MeshStandardMaterial({ map: floorTex, roughness: 0.55, metalness: 0.1 });
    const floor = new T.Mesh(new T.PlaneGeometry(16, 12), floorMat); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; g.add(floor);
    const wall = W.mat(0x1b1c24, { r: 0.85 }).clone();
    W.box(16, 6, 0.3, wall, 0, 3, -4.6, g); W.box(0.3, 6, 12, wall, -8, 3, 1, g); W.box(0.3, 6, 12, wall, 8, 3, 1, g);
    // Akustik-Platten
    const pA = W.mat(0x2b2d38, { r: 0.95 }), pB = W.mat(0xff8a1e, { r: 0.9, e: 0x200a00 }).clone();
    // Boden-Varianten für „Studio gestalten“
    const floors = { _0: floorTex };
    const floorTexOf = f => floors[f] || (floors[f] = W.canvasTex(256, 256, (cx, w, h) => {
      if (f === 'tiles') { for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 32) { cx.fillStyle = ((x + y) / 32) % 2 ? '#e8e2d0' : '#1d1d24'; cx.fillRect(x, y, 32, 32); } return; }
      cx.fillStyle = f; cx.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 32) { cx.fillStyle = 'rgba(0,0,0,.25)'; cx.fillRect(0, y, w, 2); for (let x = (y / 32 % 2) * 64; x < w; x += 128) cx.fillRect(x, y, 2, 32); } W.speckle(cx, w, h, 'rgba(0,0,0,0)', 0.12, 2000);
    }, [4, 4]));
    ST.room = { wall, accent: pB, floorMat, floorTex: f => f === '#3a2a1e' ? floorTex : floorTexOf(f) };
    for (let x = -7; x <= 7; x += 1.2) for (let y = 0.9; y < 5.6; y += 1.2) { if (Math.abs(x) < 3.2 && y > 1.4 && y < 4.8) continue; W.box(1.05, 1.05, 0.12, (Math.round(x + y * 3) % 5 === 0) ? pB : pA, x, y, -4.4, g, false); }
    for (let z = -3.6; z <= 5; z += 1.2) for (let y = 0.9; y < 5.6; y += 1.2) { W.box(0.12, 1.05, 1.05, pA, -7.8, y, z, g, false); W.box(0.12, 1.05, 1.05, pA, 7.8, y, z, g, false); }
    // LED-Wand hinter dem Tisch
    const led = document.createElement('canvas'); led.width = 1024; led.height = 512; ST.ledCtx = led.getContext('2d');
    ST.ledTex = new T.CanvasTexture(led); ST.ledTex.encoding = T.sRGBEncoding;
    const ledMesh = new T.Mesh(new T.PlaneGeometry(6.2, 3.1), new T.MeshBasicMaterial({ map: ST.ledTex, toneMapped: false })); ledMesh.position.set(0, 3.05, -4.3); g.add(ledMesh);
    W.box(6.5, 3.4, 0.15, M(0x0b0b10, { r: 0.3, m: 0.5 }), 0, 3.05, -4.38, g, false);
    ST.drawLed({ hype: 50, text: 'ON AIR' });
    // Tisch (Stehtisch) mit Technik
    const desk = new T.Group(); desk.position.set(0, 0, -0.4); g.add(desk); ST.desk = desk;
    const top = W.box(4.2, 0.08, 1.2, M(0x16171c, { r: 0.35, m: 0.3 }), 0, 1.06, 0, desk);
    W.box(4.1, 1.0, 0.06, M(0x111218, { r: 0.4 }), 0, 0.53, 0.55, desk);
    const front = W.sign(desk, W.logoTex({ w: 1024, h: 256, bg: '#111218' }), 2.6, 0.65, 0, 0.6, 0.59, 0);
    W.box(4.1, 0.05, 0.05, M(0xff8a1e, { e: 0xff6a00, ei: 1.5 }), 0, 1.02, 0.6, desk, false);
    W.mic(desk, -0.95, 1.1, -0.15, Math.PI + 0.2); W.mic(desk, 0.95, 1.1, -0.15, Math.PI - 0.2);
    // Mischpult
    const mix = W.box(0.9, 0.08, 0.5, M(0x22242c, { m: 0.6, r: 0.4 }), 0, 1.14, 0.1, desk);
    mix.rotation.x = -0.25;
    for (let i = 0; i < 8; i++) { W.box(0.03, 0.05, 0.12, M(i % 3 ? 0xdddddd : 0xff8a1e, { e: i % 3 ? 0 : 0x803000 }), -0.36 + i * 0.1, 1.19, 0.15, desk, false); W.cyl(0.018, 0.018, 0.03, M(0x111111), -0.36 + i * 0.1, 1.19, -0.02, desk, 10); }
    ST.vu = [];
    for (let i = 0; i < 2; i++) { const v = W.box(0.04, 0.2, 0.01, new T.MeshBasicMaterial({ color: 0x40ff80, toneMapped: false }), 0.38 + i * 0.06, 1.25, 0.32, desk, false); ST.vu.push(v); }
    // Laptop
    const lap = new T.Group(); lap.position.set(1.65, 1.1, 0.1); lap.rotation.y = -0.4; desk.add(lap);
    W.box(0.5, 0.02, 0.34, M(0xb0b4bc, { m: 0.8, r: 0.3 }), 0, 0, 0, lap);
    const scr = W.box(0.5, 0.32, 0.015, M(0xb0b4bc, { m: 0.8, r: 0.3 }), 0, 0.16, -0.17, lap); scr.rotation.x = -0.25;
    const sp = new T.Mesh(new T.PlaneGeometry(0.46, 0.28), new T.MeshBasicMaterial({ map: W.textTex(['AnMaCha24', 'LIVE'], { size: 90 }), toneMapped: false })); sp.position.set(0, 0.16, -0.16); sp.rotation.x = -0.25; lap.add(sp);
    // Kopfhörer
    [-1.5, 1.4].forEach(x => { const h = new T.Mesh(new T.TorusGeometry(0.1, 0.018, 8, 20, Math.PI), M(0x111111, { r: 0.4 })); h.position.set(x, 1.12, 0.25); h.rotation.x = -Math.PI / 2; desk.add(h); });
    // Ringlichter, Neon, Pflanzen, Regal
    const neon = W.logoTex({ w: 1024, h: 320, bg: null });
    W.sign(g, neon, 2.6, 0.8, -5.6, 4.6, -4.2, 0); W.sign(g, W.textTex(['Wir ♥ Medien'], { w: 512, h: 128, bg: '#14161f', size: 70 }), 2.2, 0.55, 5.4, 4.6, -4.2, 0);
    // Farbiges Licht
    ST.keyL = new T.SpotLight(0xffe2c0, 1.5, 20, 0.6, 0.5); ST.keyL.position.set(0, 5.5, 4); ST.keyL.target.position.set(0, 1.2, -0.6); g.add(ST.keyL, ST.keyL.target);
    ST.rimA = new T.PointLight(0xff8a1e, 2.2, 9); ST.rimA.position.set(-3, 3, -3.2); g.add(ST.rimA);
    ST.rimB = new T.PointLight(0x3d7dff, 1.8, 9); ST.rimB.position.set(3, 3, -3.2); g.add(ST.rimB);
    // Quiz-Requisiten (Pulte + KI-Kugel)
    const qz = ST.quizGroup = new T.Group(); qz.visible = false; g.add(qz);
    ST.buzz = [];
    [-1.6, 1.6].forEach((x, i) => {
      const pult = new T.Group(); pult.position.set(x, 0, 1.6); qz.add(pult);
      W.box(1.0, 1.0, 0.7, M(0x16171c, { r: 0.4 }), 0, 0.5, 0, pult);
      W.box(1.02, 0.08, 0.72, M(i ? 0x3dd6ff : 0xff8a1e, { e: i ? 0x1070c0 : 0xb04000, ei: 1.2 }), 0, 1.0, 0, pult);
      const b = W.cyl(0.18, 0.2, 0.1, M(0xff2a3a, { e: 0x600000 }), 0, 1.08, 0, pult); ST.buzz.push(b);
    });
    const orb = ST.orb = new T.Mesh(new T.IcosahedronGeometry(0.6, 2), new T.MeshStandardMaterial({ color: W.lin(0x3dd6ff), emissive: W.lin(0x1a7cff), emissiveIntensity: 1.4, metalness: 0.4, roughness: 0.2, wireframe: false }));
    orb.position.set(0, 2.2, 3.2); qz.add(orb);
    const orbW = new T.Mesh(new T.IcosahedronGeometry(0.85, 1), new T.MeshBasicMaterial({ color: 0x9fe8ff, wireframe: true, transparent: true, opacity: 0.4, toneMapped: false })); orb.add(orbW);
    W.glow(0x3dd6ff, 4, orb);
    ST.particles = W.particles;
    if (AMC.StudioEdit) AMC.StudioEdit.apply();
  };
  ST.drawLed = function (o) {
    const g = ST.ledCtx, w = 1024, h = 512; if (!g) return;
    const hype = U.clamp(o.hype == null ? 50 : o.hype, 0, 100), t = ST.t;
    const grd = g.createLinearGradient(0, 0, w, h); const hue = 20 + (100 - hype) * 1.8;
    grd.addColorStop(0, 'hsl(' + hue + ',90%,' + (12 + hype * 0.12) + '%)'); grd.addColorStop(1, '#07070c');
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
    // Equalizer
    for (let i = 0; i < 48; i++) { const v = (0.2 + 0.8 * Math.abs(Math.sin(t * (2 + (i % 7)) + i))) * (0.3 + hype / 140); g.fillStyle = 'hsla(' + (hue + i * 2) + ',95%,60%,.55)'; g.fillRect(i * 21.3 + 2, h - v * h * 0.55, 17, v * h * 0.55); }
    // Logo
    const r = 70; g.fillStyle = '#ff8a1e'; g.beginPath(); g.arc(150, 150, r, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(128, 116); g.lineTo(190, 150); g.lineTo(128, 184); g.fill();
    g.font = '700 110px Fredoka, system-ui, sans-serif'; g.textBaseline = 'middle'; g.fillStyle = '#fff'; g.fillText('AnMa', 250, 155); g.fillStyle = '#ff8a1e'; g.fillText('Cha', 250 + g.measureText('AnMa').width, 155);
    if (o.text) { g.font = '700 54px Fredoka, system-ui, sans-serif'; g.fillStyle = Math.sin(t * 4) > -0.2 ? '#ff4040' : '#802020'; g.fillText('● ' + o.text, 255, 250); }
    if (o.sub) { g.font = '600 40px Fredoka, system-ui, sans-serif'; g.fillStyle = '#ffe2c0'; g.fillText(o.sub, 60, 330); }
    ST.ledTex.needsUpdate = true;
  };
  /** Hosts ins Studio stellen. pos: 'desk' | 'quiz' | 'menu' */
  ST.placeHosts = function (pos) {
    ['andrew', 'marco'].forEach((id, i) => {
      const f = W.hosts[id]; if (!f) return; ST.group.add(f.root); f.root.visible = true;
      if (pos === 'quiz') { f.root.position.set(i ? 1.6 : -1.6, 0, 2.3); f.root.rotation.y = 0; }
      else { f.root.position.set(i ? 0.95 : -0.95, 0, -1.2); f.root.rotation.y = i ? -0.15 : 0.15; }
      f.play('idle', { fade: 0.3 });
    });
  };
  /** Szenen-Regie für Dialoge: Nahaufnahme, sprechender Mund, Geste und kleine Gags nach Stichwort. who: a | m | n | null (Ende) */
  ST.react = function (who, text) {
    const id = who === 'a' ? 'andrew' : who === 'm' ? 'marco' : null;
    ['andrew', 'marco'].forEach(k => { const f = W.hosts[k]; f && f.talk && f.talk(k === id); });
    clearTimeout(ST.talkTO); ST.say = id; if (!who) return;
    if (id) ST.talkTO = setTimeout(() => { const f = W.hosts[id]; f && f.talk && f.talk(false); }, Math.min(3200, 500 + (text || '').length * 38));
    const f = id && W.hosts[id], t = (text || '').toLowerCase(), A = AMC.Audio;
    let gest = /!|super|geschafft|feiert|rock/.test(t) ? 'arms' : /\?|wirklich|echt/.test(t) ? 'yes' : null;
    if (/gisela/.test(t)) setTimeout(() => A.sfx('horn'), 350);
    if (/haha|lach|witz|hör' mir uff|gurke|pommes|klaus/.test(t)) setTimeout(() => A.sfx('laugh'), 500);
    if (/geschafft|feiert|jubil|frohe|konzert|im kasten/.test(t)) { gest = 'dance'; A.sfx('drum'); ST.fx = 1; }
    if (/funkloch|rausch|stör/.test(t)) { A.sfx('feedback'); ST.glitch = 0.8; }
    if (f && gest) { f.play(gest, { fade: 0.25 }); setTimeout(() => f.play('idle', { fade: 0.4 }), gest === 'dance' ? 2400 : 1600); }
  };
  ST.enter = function (mode) {
    ST.build(); ST.mode = mode; ST.t = 0; ST.shot = 0; ST.camT = 0;
    ST.quizGroup.visible = mode === 'quiz';
    ST.desk.visible = mode !== 'quiz';
    ST.placeHosts(mode === 'quiz' ? 'quiz' : 'desk');
    W.particles.attach(ST.scene);
  };
  ST.leave = function () { ['andrew', 'marco'].forEach(id => { const f = W.hosts[id]; if (f && f.root.parent === ST.group) ST.group.remove(f.root); }); };
  ST.focus = null; // 'andrew' | 'marco' | null
  ST.update = function (dt, o) {
    ST.t += dt; o = o || {};
    ['andrew', 'marco'].forEach(id => { const f = W.hosts[id]; if (f && f.root.parent === ST.group) f.update(dt); });
    if (ST.vu) ST.vu.forEach((v, i) => { const k = 0.3 + Math.abs(Math.sin(ST.t * (7 + i * 3))) * (o.talk ? 1 : 0.3); v.scale.y = k; v.position.y = 1.15 + k * 0.1; });
    if (AMC.StudioEdit) AMC.StudioEdit.tick(ST.t);
    if (ST.orb && ST.quizGroup.visible) { ST.orb.rotation.y += dt * 0.8; ST.orb.rotation.x += dt * 0.3; ST.orb.position.y = 2.2 + Math.sin(ST.t * 1.6) * 0.12; }
    if ((ST.ledT = (ST.ledT || 0) - dt) <= 0) { ST.ledT = 0.08; ST.drawLed(o.led || { hype: 60, text: ST.mode === 'menu' ? 'BEREIT' : 'ON AIR', sub: o.ledSub }); }
    ST.rimA.intensity = 1.6 + Math.sin(ST.t * 1.3) * 0.6 + (o.flash || 0) * 3; ST.rimB.intensity = 1.4 + Math.cos(ST.t * 1.1) * 0.5 + (o.flash || 0) * 3;
    // Kamera
    const cam = W.camera;
    if (ST.mode === 'menu') {
      const a = Math.sin(ST.t * 0.15) * 0.35, narrow = root.innerWidth < 760, P = ST.mp || (ST.mp = [new T.Vector3(), new T.Vector3()]), k = ST.mpOk ? 1 - Math.exp(-dt * 3) : 1;
      let pos, tgt;
      if (ST.say) { const fx = ST.say === 'marco' ? 0.95 : -0.95; pos = [fx * 1.45, narrow ? 1.95 : 1.8, narrow ? 1.5 : 0.8]; tgt = [fx * 0.9, narrow ? 1.0 : 1.2, -1.2]; }
      else if (narrow) { pos = [Math.sin(a) * 1.2, 1.7, 4.2]; tgt = [0, 1.05, -1.2]; }
      else { pos = [0.4 + Math.sin(a) * 0.8, 1.75 + Math.sin(ST.t * 0.2) * 0.08, 3.1]; tgt = [-1.05, 1.42, -1.2]; }
      P[0].lerp(new T.Vector3(...pos), k); P[1].lerp(new T.Vector3(...tgt), k); ST.mpOk = true;
      cam.position.copy(P[0]); cam.lookAt(P[1]);
      if (ST.glitch > 0) { ST.glitch -= dt; cam.position.x += (Math.random() - 0.5) * 0.05 * ST.glitch; cam.position.y += (Math.random() - 0.5) * 0.04 * ST.glitch; }
      if (ST.fx > 0) { ST.fx -= dt * 0.8; ST.rimA.intensity += ST.fx * 4; ST.rimB.intensity += ST.fx * 4; }
    } else if (ST.mode === 'edit') {
      /* Kamera setzt der Editor (AMC.StudioEdit) */
    } else if (ST.mode === 'quiz') {
      const a = Math.sin(ST.t * 0.2) * 0.25;
      cam.position.set(Math.sin(a) * 7.2, 3, 7.6); cam.lookAt(0, 1.6, 1.8);
    } else {
      ST.camT -= dt;
      if (ST.camT <= 0 || o.cut) { ST.camT = U.rand(3.5, 6); ST.shot = o.focusShot != null ? o.focusShot : (ST.shot + 1 + Math.floor(Math.random() * 2)) % 4; }
      const fid = ST.focus, fx = fid === 'marco' ? 0.95 : fid === 'andrew' ? -0.95 : 0;
      const shots = [
        [[0, 2.0, 4.2], [0, 1.5, -1]],
        [[fx * 1.4 + (fx >= 0 ? -1.1 : 1.1), 1.75, 1.0], [fx, 1.55, -1.2]],
        [[-2.6, 1.9, 2.2], [0.3, 1.45, -1]],
        [[2.8, 2.6, 2.6], [-0.3, 1.4, -1]]
      ];
      const s = shots[ST.shot % shots.length], k = 1 - Math.exp(-dt * 2.5);
      ST.cp = ST.cp || new T.Vector3(...s[0]); ST.ct = ST.ct || new T.Vector3(...s[1]);
      ST.cp.lerp(new T.Vector3(...s[0]).add(new T.Vector3(Math.sin(ST.t * 0.3) * 0.2, 0, 0)), k); ST.ct.lerp(new T.Vector3(...s[1]), k);
      cam.position.copy(ST.cp); cam.lookAt(ST.ct);
    }
    W.particles.update(dt);
  };
  ST.render = function () { W.renderer.render(ST.scene, W.camera); };

  // ================================================================== Live-Aufnahme
  const SH = AMC.Show = { active: false };
  let S = null;
  /** cfg: { mode:'story'|'arcade', rounds, goal:[1,2,3 Sterne], cards:[{rub,power,label}] , host } */
  SH.start = function (cfg) {
    S = { cfg, round: 0, rounds: cfg.rounds || 6, hype: Math.min(90, 55 + (AMC.Save.has('neon') ? 10 : 0) + (AMC.StudioEdit ? AMC.StudioEdit.bonus().hype : 0)), listeners: 0, combo: 1, lastSpeaker: '', speaker: cfg.host || 'andrew', jingles: AMC.Save.has('jingle') ? 4 : 3, special: 0, swapUsed: false,
      cards: (cfg.cards || []).map(c => Object.assign({ used: false }, c)), phase: 'intro', menu: 'root', sel: 0, t: 0, mini: null, incident: null, chatT: 0, log: [], arcade: cfg.mode === 'arcade', ended: false };
    SH.active = true;
    ST.enter('show'); ST.focus = S.speaker;
    AMC.Audio.music('show');
    buildUi();
    setTimeout(() => { if (!S) return; AMC.Audio.sfx('onair'); say('n', 'Wir sind ON AIR!'); }, 300);
    setTimeout(() => { if (!S) return; say(S.speaker, U.pick(['Hallo und herzlich willkommen zu AnMaCha – Der Podcast!', 'Seid Ihr bereit, angemacht zu werden? Willkommen!', 'Hey, willkommen zu einer neuen Folge – mit Marco und Andrew!'])); nextRound(); }, 1500);
  };
  SH.stop = function () { SH.active = false; if (S && S.mini && S.mini.ctl) S.mini.ctl.destroy(); S = null; const u = U.$('showUi'); if (u) u.remove(); ST.leave(); };

  function buildUi() {
    const ui = U.el('div', 'show-ui'); ui.id = 'showUi';
    ui.innerHTML =
      '<div class="sh-top"><div class="sh-pill glass"><span class="rec">● REC</span> <b id="shRound"></b></div><div class="sh-pill glass big">🎧 <b id="shLis">0</b> <small>Hörer live</small></div>' +
      '<div class="sh-hype glass"><small>Stimmung</small><i><em id="shHype"></em></i></div><div class="sh-pill glass" id="shCombo"></div></div>' +
      '<div class="sh-say" id="shSay" hidden><img id="shFace" alt=""><div><b id="shWho"></b><p id="shTxt"></p></div></div>' +
      '<div class="sh-chat glass" id="shChat"><h4>💬 Live-Chat</h4><ul id="shChatL"></ul></div>' +
      '<div class="sh-cmd" id="shCmd" hidden><div class="sh-cmdh">BEFEHLE <span id="shSpk"></span></div><ul id="shCmdL" role="menu"></ul><div class="sh-sp"><small>Spezial</small><i><em id="shSpec"></em></i></div></div>' +
      '<div class="sh-mini" id="shMini" hidden></div><div class="sh-inc" id="shInc" hidden></div><div class="sh-pop" id="shPop"></div>';
    U.$('ui').appendChild(ui);
    ui.querySelector('#shMini').addEventListener('pointerdown', e => { if (S && S.mini) { e.preventDefault(); S.mini.tap = true; } });
    updTop();
  }
  function updTop() {
    if (!S) return;
    U.$('shRound').textContent = S.arcade ? 'Runde ' + Math.max(1, S.round) : 'Runde ' + Math.max(1, S.round) + '/' + S.rounds;
    U.$('shLis').textContent = U.fmt(S.listeners);
    const h = U.$('shHype'); h.style.width = S.hype + '%'; h.style.background = S.hype > 66 ? 'linear-gradient(90deg,#ff8a1e,#ffd23f)' : S.hype > 33 ? 'linear-gradient(90deg,#3dd6ff,#ff8a1e)' : 'linear-gradient(90deg,#ff2a3a,#ff8a1e)';
    U.$('shCombo').innerHTML = S.combo > 1 ? '🔥 Kombo ×' + S.combo.toFixed(1) : '🎙️ ' + D.HOSTS[S.speaker].name;
    U.$('shSpec').style.width = S.special + '%';
  }
  function say(who, text) {
    const box = U.$('shSay'); if (!box) return;
    box.hidden = false; box.classList.remove('pop'); void box.offsetWidth; box.classList.add('pop');
    const name = who === 'n' ? 'AnMaCha24' : D.HOSTS[who].name;
    U.$('shWho').textContent = name; U.$('shTxt').textContent = text; U.$('shFace').src = who === 'n' ? AMC.UI.podLogo : AMC.UI.face(who);
    box.style.setProperty('--hc', who === 'n' ? '#ff8a1e' : D.HOSTS[who].color);
    if (who !== 'n') { ST.focus = who; const f = W.hosts[who]; f && f.play(U.pick(['yes', 'arms']), { fade: 0.25 }); f && f.talk && f.talk(true); setTimeout(() => { if (f) { f.play('idle', { fade: 0.4 }); f.talk && f.talk(false); } }, 1800); }
    AMC.Audio.sfx('talk');
    if (AMC.Save.data.settings.subtitles === false) box.hidden = true;
  }
  function chat(kind, n) {
    const ul = U.$('shChatL'); if (!ul) return;
    for (let i = 0; i < (n || 1); i++) {
      const li = U.el('li', kind, '<b>' + U.esc(U.pick(D.FAN_NAMES)) + '</b> ' + U.esc(U.pick(D.CHAT[kind])));
      ul.appendChild(li); while (ul.children.length > 7) ul.firstChild.remove();
    }
  }
  function pop(text, cls) { const p = U.$('shPop'); if (!p) return; const e = U.el('div', 'pp ' + (cls || ''), text); p.appendChild(e); setTimeout(() => e.remove(), 1400); }

  function nextRound() {
    if (!S || S.ended) return;
    if (!S.arcade && S.round >= S.rounds) return endShow();
    if (S.arcade && S.hype <= 0) return endShow();
    S.round++; S.swapUsed = false; updTop();
    if (S.arcade) refillCards();
    // Störung?
    const p = S.round <= 1 ? 0 : S.arcade ? Math.min(0.6, 0.2 + S.round * 0.04) : 0.33;
    if (Math.random() < p) return startIncident();
    openMenu();
  }
  function refillCards() {
    const free = S.cards.filter(c => !c.used);
    while (free.length < 3) { const r = U.pick(D.RUBRIC_IDS), c = { rub: r, power: 1 + Math.random() * (1 + S.round * 0.08), label: D.RUBRICS[r].name, used: false }; S.cards.push(c); free.push(c); }
  }
  function openMenu(sub) {
    S.phase = 'menu'; S.menu = sub || 'root'; S.sel = 0;
    const box = U.$('shCmd'); box.hidden = false; U.$('shSpk').textContent = '· ' + D.HOSTS[S.speaker].name;
    renderMenu();
  }
  function menuItems() {
    if (S.menu === 'cards') {
      const list = S.cards.filter(c => !c.used).map(c => {
        const R = D.RUBRICS[c.rub] || { icon: '🗨️', name: c.label, color: '#ccc' }, strong = D.HOSTS[S.speaker].strong.includes(c.rub);
        return { label: (R.icon || '🗨️') + ' ' + (c.label || R.name), info: '★'.repeat(Math.max(1, Math.round(c.power))) + (strong ? ' · Stärke von ' + D.HOSTS[S.speaker].name : ''), color: R.color, run: () => playCard(c) };
      });
      if (!list.length) list.push({ label: '🗨️ Wenig Interessantes aus unserem Leben', info: '★', run: () => playCard({ rub: 'life', power: 0.8, label: 'Wenig Interessantes', used: false }) });
      return list;
    }
    const sp = S.special >= 100;
    return [
      { label: '🎤 Thema', info: S.cards.filter(c => !c.used).length + ' Karten', run: () => openMenu('cards') },
      { label: '😂 Pointe', info: 'Timing-Ringe + Lacher', run: punchline },
      { label: '🔁 Übergabe an ' + D.HOSTS[S.speaker === 'andrew' ? 'marco' : 'andrew'].name, info: S.swapUsed ? 'schon gewechselt' : 'Kombo-Bonus', dis: S.swapUsed, run: swap },
      { label: '🎵 Jingle', info: S.jingles + '× übrig', dis: S.jingles <= 0, run: jingle },
      { label: '🎛️ Soundboard', info: cool(S.sbRound) ? 'Effekte nachspielen' : 'lädt …', dis: !cool(S.sbRound), run: soundboard },
      { label: '❓ Hörerfrage', info: cool(S.qRound) ? 'Quiz für Fans' : 'lädt …', dis: !cool(S.qRound), run: listenerQ },
      { label: sp ? (S.speaker === 'marco' ? '📖 Marcos Tagebuch' : '🎶 Andrews Musikmoment') : '✨ Spezial', info: sp ? 'BEREIT!' : Math.round(S.special) + ' %', dis: !sp, hot: sp, run: special }
    ];
  }
  function cool(r) { return r == null || S.round - r >= 2; }
  function renderMenu() {
    const ul = U.$('shCmdL'), items = menuItems();
    S.sel = U.clamp(S.sel, 0, items.length - 1);
    ul.innerHTML = '';
    items.forEach((it, i) => {
      const li = U.el('li', (i === S.sel ? 'sel ' : '') + (it.dis ? 'dis ' : '') + (it.hot ? 'hot' : ''), '<button type="button" role="menuitem"><span>' + it.label + '</span><small>' + U.esc(it.info || '') + '</small></button>');
      if (it.color) li.style.setProperty('--c', it.color);
      li.querySelector('button').addEventListener('click', () => { if (!S || S.phase !== 'menu') return; S.sel = i; choose(); });
      ul.appendChild(li);
    });
    if (S.menu === 'cards') { const back = U.el('li', 'back', '<button type="button">' + AMC.glyph('b') + ' Zurück</button>'); back.querySelector('button').onclick = () => { AMC.Audio.sfx('back'); openMenu('root'); }; ul.appendChild(back); }
  }
  function choose() {
    const it = menuItems()[S.sel]; if (!it) return;
    if (it.dis) { AMC.Audio.sfx('miss'); return; }
    AMC.Audio.sfx('ok'); it.run();
  }
  function closeMenu() { U.$('shCmd').hidden = true; S.phase = 'busy'; }

  // --- Thema: Timing-Ring
  function playCard(c) {
    c.used = true; closeMenu();
    const R = D.RUBRICS[c.rub], spk = S.speaker, strong = D.HOSTS[spk].strong.includes(c.rub);
    say(spk, U.pick(D.LINES[c.rub] || D.LINES.life));
    const speed = 0.9 + Math.min(0.5, S.round * 0.04) + (c.power > 2 ? 0.15 : 0);
    startMini('rhythm', { color: R ? R.color : '#ffd23f', speed, bpm: 100 + Math.min(36, S.round * 4), n: 8 + Math.min(8, S.round), hard: c.power > 2 || S.round > 5, label: (R ? R.icon + ' ' + R.name : '🗨️ ' + c.label) }, q => {
      const comboOk = S.lastSpeaker && S.lastSpeaker !== spk;
      if (q > 0.5 && comboOk) S.combo = Math.min(3, S.combo + 0.5); else if (q <= 0.3) S.combo = 1;
      S.lastSpeaker = spk;
      const gain = 30 * c.power * q * (strong ? 1.35 : 1) * S.combo;
      applyGain(gain, q);
      nextSoon();
    });
  }
  function applyGain(gain, q) {
    const add = Math.round(gain * (8 + S.round * 1.5) * (0.6 + S.hype / 100) * (AMC.Save.has('mics') ? 1.1 : 1) * (1 + (AMC.StudioEdit ? AMC.StudioEdit.bonus().lis : 0)));
    S.listeners += add; S.hype = U.clamp(S.hype + gain * 0.35 - 7, 0, 100); S.special = Math.min(100, S.special + gain * 0.45);
    const words = q >= 1 ? ['PERFEKT!', 'perfect'] : q >= 0.8 ? ['STARK!', 'good'] : q >= 0.5 ? ['Okay', 'ok'] : ['Daneben …', 'miss'];
    pop(words[0] + '<small>+' + U.fmt(add) + ' 🎧</small>', words[1]);
    AMC.Audio.sfx(q >= 1 ? 'perfect' : q >= 0.5 ? 'combo' : 'miss');
    if (q >= 0.8) { chat('good', 2); if (S.hype > 80) { chat('hype'); AMC.Audio.sfx('cheer'); W.particles.burst(0, 2.5, -1, 0xff8a1e, 30, { speed: 6 }); } }
    else if (q < 0.5) chat('bad');
    else chat('good');
    S.flash = q >= 0.8 ? 1 : 0;
    updTop();
  }
  function nextSoon(ms) { S.phase = 'wait'; setTimeout(() => S && !S.ended && nextRound(), ms || 1300); }

  // --- Pointe: Tastenfolge
  function punchline() {
    closeMenu();
    const keys = ['a', 'b', 'x', 'y'], n = 3 + Math.min(3, Math.floor(S.round / 3)), seq = [];
    for (let i = 0; i < n; i++) seq.push(U.pick(keys));
    say(S.speaker, U.pick(['Und dann sag ich zu ihm …', 'Wartet, wartet – jetzt kommt der Knaller!', 'Das glaubt ihr nicht …', 'Pass auf, Pointe kommt!']));
    startMini('qte', { n, speed: 1 + Math.min(0.5, S.round * 0.05) }, q => {
      if (q >= 0.75) { say(S.speaker === 'andrew' ? 'marco' : 'andrew', U.pick(['HAHAHA! Ich kann nicht mehr!', 'Ich lach mich weg!', 'Das kommt in die Highlights!'])); applyGain(48 * S.combo, 1); AMC.Audio.sfx('applause'); }
      else { applyGain(4, 0.2); S.hype = Math.max(0, S.hype - 8); say(S.speaker === 'andrew' ? 'marco' : 'andrew', U.pick(['… Ich hab\'s nicht verstanden.', 'Grillenzirpen …', 'Okay. Weiter im Text!'])); }
      updTop(); nextSoon();
    });
  }
  function swap() {
    S.swapUsed = true; S.speaker = S.speaker === 'andrew' ? 'marco' : 'andrew'; ST.focus = S.speaker;
    AMC.Audio.sfx('swap'); say(S.speaker, U.pick(['Übernehm ich!', 'Da muss ich direkt einhaken!', 'Darf ich kurz? Danke!', 'Mein Stichwort!']));
    openMenu('root');
  }
  function jingle() {
    S.jingles--; closeMenu(); AMC.Audio.sfx('jingle');
    pop('🎵 JINGLE!<small>Stimmung +15</small>', 'good'); S.hype = Math.min(100, S.hype + 15); S.special = Math.min(100, S.special + 8); updTop(); chat('good');
    nextSoon(1500);
  }
  function special() {
    closeMenu(); S.special = 0;
    const marco = S.speaker === 'marco';
    say(S.speaker, marco ? 'Liebes Tagebuch … diese Woche war ein Kabel-Abenteuer, das ihr nicht glauben werdet!' : 'Musik-Moment! Diesen Song müsst ihr hören – Lautstärke hoch!');
    ['andrew', 'marco'].forEach(id => { const f = W.hosts[id]; f && f.play('dance', { fade: 0.3 }); });
    setTimeout(() => ['andrew', 'marco'].forEach(id => { const f = W.hosts[id]; f && f.play('idle', { fade: 0.4 }); }), 2600);
    startMini('rhythm', { color: '#ffd23f', speed: 1.15, bpm: 128, n: 16, hard: true, label: marco ? '📖 Marcos Tagebuch' : '🎶 Musikmoment' }, q => {
      applyGain(70 * S.combo * (0.6 + q), q); AMC.Audio.sfx('applause'); W.particles.burst(0, 2.6, -1, 0xffd23f, 60, { speed: 8 }); nextSoon(1600);
    });
  }

  // --- Soundboard: aufleuchtende Pads treffen
  function soundboard() {
    S.sbRound = S.round; closeMenu();
    say(S.speaker, U.pick(['Soundboard-Zeit! Wer drückt am schnellsten?', 'Ich hab neue Effekte – hört mal!', 'Tusch, Hupe, Applaus – los geht\'s!']));
    startMini('simon', { rounds: 3, len: 2 + Math.min(3, Math.floor(S.round / 3)) }, q => {
      applyGain(36 * S.combo * (0.4 + q), q); if (q >= 0.8) AMC.Audio.sfx('applause');
      nextSoon();
    });
  }
  // --- Hörerfrage: Quizfrage aus dem Fan-Postfach
  function listenerQ() {
    S.qRound = S.round; closeMenu();
    const f = U.pick(D.QUIZ), name = U.pick(D.FAN_NAMES);
    say(S.speaker, U.pick(['Frage aus dem Postfach!', 'Ein Hörer will was wissen …', 'Hörerfrage – mal sehen, ob wir das wissen!']));
    startMini('pick', { title: '❓ Hörerfrage', q: name + ': „' + f[0] + '“', opts: U.shuffle(f.slice(1, 5)), right: f[1] }, q => {
      say(S.speaker === 'andrew' ? 'marco' : 'andrew', q >= 1 ? U.pick(['Genau so! Danke für die Frage!', 'Richtig – Gruß zurück!']) : 'Richtig wäre: ' + f[1] + '. Nächstes Mal!');
      applyGain(q >= 1 ? 40 * S.combo : 5, q >= 1 ? 1 : 0.3); nextSoon(1600);
    });
  }

  // --- Störungen
  const INC = [
    { id: 'pegel', name: '🔊 Rückkopplung!', desc: 'Halte den Pegel im grünen Bereich.', help: 'Gedrückt halten = Pegel hoch' },
    { id: 'kabel', name: '🔌 Kabelsalat!', desc: 'Stecke die Kabel in der richtigen Reihenfolge.', help: 'Richtungen nachdrücken' },
    { id: 'anruf', name: '📞 Hörer am Telefon!', desc: 'Welche Rubrik passt zur Frage?', help: 'Antwort wählen' }
  ];
  function startIncident() {
    const inc = U.pick(INC); S.incident = inc; S.phase = 'incident'; AMC.Audio.sfx(inc.id === 'anruf' ? 'onair' : 'static');
    const box = U.$('shInc'); box.hidden = false;
    box.innerHTML = '<h3>' + inc.name + '</h3><p>' + inc.desc + '</p><div class="inc-b"><button type="button" class="btn primary" id="incGo">' + AMC.glyph('a') + ' Lösen</button><button type="button" class="btn" id="incJ"' + (S.jingles ? '' : ' disabled') + '>' + AMC.glyph('y') + ' Jingle drüberlegen (' + S.jingles + ')</button></div>';
    S.incSel = 0;
    U.$('incGo').onclick = () => solveIncident();
    U.$('incJ').onclick = () => { if (S.jingles > 0) { S.jingles--; AMC.Audio.sfx('jingle'); box.hidden = true; S.incident = null; pop('🎵 Gerettet!', 'good'); openMenu(); } };
    say(U.pick(['andrew', 'marco']), inc.id === 'pegel' ? 'Uiii, was pfeift denn da so?!' : inc.id === 'kabel' ? 'Wer hat denn hier die Kabel verknotet?' : 'Wir haben einen Anrufer in der Leitung!');
    chat('bad');
  }
  function solveIncident() {
    const inc = S.incident; U.$('shInc').hidden = true; S.phase = 'busy';
    const done = q => { S.incident = null; if (q >= 0.8) { pop('Gerettet!', 'good'); S.hype = Math.min(100, S.hype + 6); chat('good'); } else { pop('Autsch …', 'miss'); S.hype = Math.max(0, S.hype - 14); S.listeners = Math.max(0, Math.round(S.listeners * 0.95)); chat('bad', 2); } updTop(); setTimeout(() => S && openMenu(), 700); };
    if (inc.id === 'pegel') startMini('mixer', { time: 8 + Math.min(4, S.round * 0.4) }, done);
    else if (inc.id === 'kabel') startMini('cables', { n: S.round > 4 ? 5 : 4, time: 20 }, done);
    else {
      const fl = U.pick(D.FAN_LINES);
      startMini('pick', { q: U.pick(D.FAN_NAMES) + ': „' + fl[0] + '“', opts: U.shuffle([fl[1]].concat(U.shuffle(D.RUBRIC_IDS.filter(r => r !== fl[1])).slice(0, 2))), right: fl[1] }, done);
    }
  }

  // --- Minispiele (Overlay)
  function startMini(kind, o, cb) {
    S.mini = Object.assign({ kind, t: 0, cb, tap: false, done: false }, o);
    const box = U.$('shMini'); box.hidden = false; box.className = 'sh-mini k-' + kind;
    if (AMC.Minis && /^(rhythm|qte|cables|mixer|simon)$/.test(kind)) { const m = S.mini; m.ctl = AMC.Minis.start(box, kind, o, q => { if (S && S.mini === m) endMini(q); }); return; }
    if (kind === 'ring') {
      box.innerHTML = '<div class="mg-lbl">' + U.esc(o.label) + '</div><div class="ring-wrap"><div class="ring-target" style="--c:' + o.color + '"></div><div class="ring-move" id="mgRing" style="--c:' + o.color + '"></div></div><div class="mg-help">' + AMC.glyph('a') + ' drücken, wenn sich die Ringe decken' + (o.triple ? ' (3×)' : '') + '</div>';
      S.mini.hits = []; S.mini.need = o.triple ? 3 : 1; S.mini.r = 1;
    } else if (kind === 'seq') {
      box.innerHTML = '<div class="mg-lbl">' + (o.dirs ? '🔌 Kabel stecken' : '😂 Pointe') + '</div><div class="seq" id="mgSeq">' + o.seq.map(k => '<span>' + (o.dirs ? ({ up: '⬆️', down: '⬇️', left: '⬅️', right: '➡️' }[k]) : AMC.glyph(k)) + '</span>').join('') + '</div><i class="mg-bar"><em id="mgBar"></em></i>' +
        (I.device === 'touch' ? '<div class="seq-pad">' + (o.dirs ? ['up', 'left', 'right', 'down'] : ['a', 'b', 'x', 'y']).map(k => '<button type="button" data-k="' + k + '">' + (o.dirs ? ({ up: '⬆️', down: '⬇️', left: '⬅️', right: '➡️' }[k]) : AMC.glyph(k)) + '</button>').join('') + '</div>' : '') +
        '<div class="mg-help">' + (o.dirs ? 'Steuerkreuz / Pfeiltasten' : I.device === 'kb' ? 'Leertaste = ' + AMC.glyph('a') + ', Esc = B, E = X, Q = Y' : 'Tasten nachdrücken') + '</div>';
      S.mini.i = 0;
      box.querySelectorAll('.seq-pad button').forEach(b => b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); seqPress(b.dataset.k); }));
    } else if (kind === 'level') {
      box.innerHTML = '<div class="mg-lbl">🔊 Pegel halten</div><div class="lvl"><div class="lvl-band" id="mgBand"></div><div class="lvl-needle" id="mgNeedle"></div></div><i class="mg-bar"><em id="mgBar"></em></i><div class="mg-help">' + AMC.glyph('a') + ' gedrückt halten = lauter · loslassen = leiser</div>';
      S.mini.v = 0.3; S.mini.band = 0.5; S.mini.ok = 0;
    } else if (kind === 'pick') {
      box.innerHTML = '<div class="mg-lbl">' + (o.title || '📞 Anruf') + '</div><p class="pick-q">' + U.esc(o.q) + '</p><div class="pick-o">' + o.opts.map((r, i) => '<button type="button" class="btn' + (i === 0 ? ' sel' : '') + '">' + (D.RUBRICS[r] ? D.RUBRICS[r].icon + ' ' + D.RUBRICS[r].name : U.esc(r)) + '</button>').join('') + '</div><div class="mg-help">Wählen mit ' + AMC.glyph('dpad') + ', bestätigen mit ' + AMC.glyph('a') + '</div>';
      S.mini.sel = 0;
      box.querySelectorAll('.pick-o button').forEach((b, i) => b.addEventListener('click', e => { e.stopPropagation(); S.mini.sel = i; pickDone(); }));
    } else if (kind === 'pads') {
      const K = ['y', 'x', 'b', 'a'];
      box.innerHTML = '<div class="mg-lbl">🎛️ Soundboard</div><div class="pads" id="mgPads">' + K.map(k => '<button type="button" data-k="' + k + '">' + AMC.glyph(k) + '</button>').join('') + '</div><i class="mg-bar"><em id="mgBar"></em></i><div class="mg-help">Leuchtendes Pad drücken · <b id="mgCnt">0</b>/' + o.need + '</div>';
      S.mini.hits = 0; S.mini.lit = null; S.mini.lt = 0;
      box.querySelectorAll('.pads button').forEach(b => b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); padPress(b.dataset.k); }));
    }
  }
  function endMini(q) { const m = S.mini; if (!m || m.done) return; m.done = true; setTimeout(() => { if (!S) return; const b = U.$('shMini'); b.hidden = true; if (m.ctl) { m.ctl.destroy(); b.innerHTML = ''; } S.mini = null; m.cb(q); }, m.ctl ? 60 : 380); }
  function seqPress(k) {
    const m = S.mini; if (!m || m.kind !== 'seq' || m.done) return;
    const spans = U.$('mgSeq').children;
    if (k === m.seq[m.i]) { spans[m.i].classList.add('ok'); m.i++; AMC.Audio.sfx('tick'); if (m.i >= m.seq.length) { AMC.Audio.sfx('perfect'); endMini(1); } }
    else { spans[m.i].classList.add('bad'); AMC.Audio.sfx('miss'); endMini(0.2); }
  }
  function padLight(m) {
    const K = ['y', 'x', 'b', 'a']; let k; do k = U.pick(K); while (k === m.lit);
    m.lit = k; m.lt = m.life;
    U.$('mgPads').querySelectorAll('button').forEach(b => b.classList.toggle('lit', b.dataset.k === k));
  }
  function padPress(k) {
    const m = S.mini; if (!m || m.kind !== 'pads' || m.done || !m.lit) return;
    if (k === m.lit) { m.hits++; AMC.Audio.sfx(U.pick(['tick', 'combo', 'cheer'])); U.$('mgCnt').textContent = m.hits; if (m.hits >= m.need) { AMC.Audio.sfx('perfect'); return endMini(1); } padLight(m); }
    else { AMC.Audio.sfx('miss'); m.hits = Math.max(0, m.hits - 1); U.$('mgCnt').textContent = m.hits; }
  }
  function pickDone() { const m = S.mini, r = m.opts[m.sel]; const ok = r === m.right; U.$('shMini').querySelectorAll('.pick-o button').forEach((b, i) => b.classList.add(m.opts[i] === m.right ? 'right' : 'wrong')); AMC.Audio.sfx(ok ? 'perfect' : 'miss'); endMini(ok ? 1 : 0.3); }
  function updMini(dt) {
    const m = S.mini; if (!m) return;
    if (m.ctl) { if (!m.done) m.ctl.update(dt); return; }
    if (m.done) return;
    m.t += dt;
    const press = m.tap || I.hit('ok') || I.hit('jump'); m.tap = false;
    if (m.kind === 'ring') {
      // Ring schrumpft von 1 auf 0 – Ziel bei 0,35
      m.r -= dt * 0.55 * m.speed;
      const el = U.$('mgRing'); if (el) el.style.transform = 'translate(-50%,-50%) scale(' + Math.max(0.05, m.r * 2.6) + ')';
      const diff = Math.abs(m.r - 0.385);
      if (press) {
        const q = diff < 0.03 ? 1 : diff < 0.07 ? 0.8 : diff < 0.13 ? 0.5 : 0.2;
        m.hits.push(q); flashRing(q);
        if (m.hits.length >= m.need) endMini(m.hits.reduce((a, b) => a + b, 0) / m.hits.length); else m.r = 1;
      } else if (m.r < 0.12) { m.hits.push(0.15); flashRing(0.15); if (m.hits.length >= m.need) endMini(m.hits.reduce((a, b) => a + b, 0) / m.hits.length); else m.r = 1; }
    } else if (m.kind === 'seq') {
      const k = ['a', 'b', 'x', 'y', 'up', 'down', 'left', 'right'];
      const pads = I.padHits[0] || [];
      let hit = pads.find(x => k.includes(x));
      if (!hit && I.device !== 'pad') {
        if (m.dirs) hit = ['up', 'down', 'left', 'right'].find(d => I.hit(d));
        else hit = I.hit('jump') ? 'a' : I.hit('back') ? 'b' : I.hit('act') ? 'x' : I.hit('swap') ? 'y' : null;
      }
      if (hit) seqPress(hit);
      const bar = U.$('mgBar'); if (bar) bar.style.width = Math.max(0, 100 - m.t / m.time * 100) + '%';
      if (m.t > m.time && !m.done) { AMC.Audio.sfx('miss'); endMini(0.2); }
    } else if (m.kind === 'level') {
      const held = I.jumpHeld || I.keys.has('Enter') || AMC.UI.pointerHeld;
      m.v = U.clamp(m.v + (held ? 1.0 : -0.8) * dt, 0, 1);
      m.band = 0.5 + Math.sin(m.t * 1.4) * 0.25 + Math.sin(m.t * 3.1) * 0.08;
      const inBand = Math.abs(m.v - m.band) < 0.12; if (inBand) m.ok += dt;
      U.$('mgNeedle').style.left = (m.v * 100) + '%'; const b = U.$('mgBand'); b.style.left = ((m.band - 0.12) * 100) + '%'; b.classList.toggle('in', inBand);
      U.$('mgBar').style.width = Math.min(100, m.ok / 2.4 * 100) + '%';
      if (m.ok >= 2.4) { AMC.Audio.sfx('perfect'); endMini(1); } else if (m.t > 6) endMini(0.3);
    } else if (m.kind === 'pads') {
      if (!m.lit || (m.lt -= dt) <= 0) padLight(m);
      let hit = (I.padHits[0] || []).find(x => ['a', 'b', 'x', 'y'].includes(x));
      if (!hit && I.device !== 'pad') hit = I.hit('jump') ? 'a' : I.hit('back') ? 'b' : I.hit('act') ? 'x' : I.hit('swap') ? 'y' : null;
      if (hit) padPress(hit);
      U.$('mgBar').style.width = Math.max(0, 100 - m.t / m.time * 100) + '%';
      if (m.t > m.time && !m.done) endMini(Math.min(1, m.hits / m.need));
    } else if (m.kind === 'pick') {
      const btns = U.$('shMini').querySelectorAll('.pick-o button');
      if (I.hit('up') || I.hit('left')) { m.sel = (m.sel + btns.length - 1) % btns.length; AMC.Audio.sfx('move'); }
      if (I.hit('down') || I.hit('right')) { m.sel = (m.sel + 1) % btns.length; AMC.Audio.sfx('move'); }
      btns.forEach((b, i) => b.classList.toggle('sel', i === m.sel));
      if (I.hit('ok')) pickDone();
    }
  }
  function flashRing(q) { const w = U.$('shMini').querySelector('.ring-target'); if (!w) return; w.classList.remove('q1', 'q2', 'q3', 'q0'); void w.offsetWidth; w.classList.add(q >= 1 ? 'q3' : q >= 0.8 ? 'q2' : q >= 0.5 ? 'q1' : 'q0'); }

  function endShow() {
    if (S.ended) return; S.ended = true; S.phase = 'end';
    U.$('shCmd').hidden = true;
    const both = ['andrew', 'marco'];
    say(S.speaker, U.pick(['Das war\'s für heute – danke fürs Zuhören! Bis zur nächsten Folge!', 'Tschüss und bleibt angemacht!', 'Danke an alle da draußen. Wir hören uns!']));
    both.forEach(id => { const f = W.hosts[id]; f && f.play('dance', { fade: 0.3 }); });
    AMC.Audio.sfx('applause');
    const res = { listeners: S.listeners, rounds: S.round, hype: S.hype };
    const goal = S.cfg.goal || [1, 2, 3];
    res.stars = S.listeners >= goal[2] * 10 ? 3 : S.listeners >= goal[1] * 10 ? 2 : S.listeners >= goal[0] * 10 ? 1 : 0;
    AMC.Save.data.stats.shows++; AMC.Save.data.stats.listeners += S.listeners; AMC.Save.save();
    setTimeout(() => { if (!S) return; const cb = S.cfg.onEnd; SH.stop(); cb && cb(res); }, 2600);
  }

  /** Test/Debug: Minispiel direkt starten (kind) oder laufendes abbrechen (null) */
  SH._mini = function (kind) {
    if (!S) return;
    if (!kind) { if (S.mini && S.mini.ctl) S.mini.ctl.destroy(); S.mini = null; const b = U.$('shMini'); b.hidden = true; b.innerHTML = ''; return; }
    closeMenu(); startMini(kind, { n: kind === 'cables' ? 4 : undefined, label: 'Test', color: '#ff8a1e' }, () => {});
  };
  SH.update = function (dt) {
    if (!S) return;
    S.t += dt;
    if (S.phase === 'menu') {
      const n = menuItems().length;
      if (I.hit('up')) { S.sel = (S.sel + n - 1) % n; AMC.Audio.sfx('move'); renderMenu(); }
      if (I.hit('down')) { S.sel = (S.sel + 1) % n; AMC.Audio.sfx('move'); renderMenu(); }
      if (I.hit('ok')) choose();
      else if (I.hit('back') && S.menu !== 'root') { AMC.Audio.sfx('back'); openMenu('root'); I.eat('pause'); }
      else if (I.hit('swap') && S.menu === 'root' && !S.swapUsed) { AMC.Audio.sfx('ok'); swap(); }
    } else if (S.phase === 'incident') {
      if (I.hit('ok')) solveIncident(); else if (I.hit('swap') && S.jingles > 0) U.$('incJ').click();
    }
    updMini(dt);
    // Stimmung sinkt in der Arcade langsam
    if (S.arcade && S.phase === 'menu') { S.hype = Math.max(0, S.hype - dt * 1.4); if ((S.topT = (S.topT || 0) - dt) <= 0) { S.topT = 0.3; updTop(); } if (S.hype <= 0) { endShow(); } }
    if ((S.chatT -= dt) <= 0) { S.chatT = U.rand(1.6, 3.4); chat(S.hype > 70 ? (Math.random() < 0.3 ? 'hype' : 'good') : S.hype < 25 ? 'bad' : 'good'); }
    const fl = S.flash || 0; S.flash = Math.max(0, fl - dt * 2);
    ST.update(dt, { talk: S.phase !== 'end', led: { hype: S.hype, text: 'ON AIR', sub: '🎧 ' + U.fmt(S.listeners) + ' Hörer · Runde ' + S.round }, flash: fl });
  };
  SH.render = () => ST.render();
  SH.state = () => S;
  SH.inMenuRoot = () => S && S.phase === 'menu' && S.menu === 'root';
  SH.paused = false;
})(typeof window !== 'undefined' ? window : globalThis);
