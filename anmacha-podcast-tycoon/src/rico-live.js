/* AnMaCha – Der Podcast · Bühnen-Szenen: „Ricos Live-Show“ (RicoReWis Originalstimme) und Szenen mit Andrew, Marco und beiden.
   Eigene Bühne nur für die Szene: Ringlicht, LED-Wand mit Zuschauerzähler, farbige Lichtkegel, Herzen und Konfetti.
   Rico: beim ersten Besuch im Live-Studio (RicoReWi-Universum), danach dort („🎬 Ricos Live-Show“).
   Andrew solo (2 Folgen), Marco solo (4 Folgen), beide zusammen (2.000 Abos): Bühne im Stadtpark.
   Alle gesehenen Szenen lassen sich im Story-Menü (📖 Story-Akte) nochmal ansehen.
   Stimme Rico: sounds/rico/live-1…5.mp3 (ElevenLabs, Stimme „RicoReWi“); fehlt eine Datei, spricht die Sprachausgabe. */
(function (root) {
  'use strict';
  const AMC = root.AMC, U = AMC.U, W = AMC.World, Save = AMC.Save;
  const RL = AMC.RicoLive = {}, SC = AMC.Scenes = {};
  let X = -192, Z = -2, Y = 0.12, LOOK = null;   // Bühnenmitte der laufenden Szene
  const clip = i => ({ src: 'sounds/rico/live-' + i + '.mp3' });
  let set = null;

  // ------------------------------------------------------------------ Bühne bauen (nur während der Szene)
  function build(S) {
    const T = root.THREE, g = new T.Group(); g.userData.dyn = true; g.position.set(X, Y, Z);
    const own = [], mk = (geo, mat) => { own.push(geo, mat); return new T.Mesh(geo, mat); };
    const basic = (c, o) => Object.assign(new T.MeshBasicMaterial({ color: c, toneMapped: false }), o || {});
    // Podest mit Neonkanten
    const deck = mk(new T.CylinderGeometry(3.6, 3.9, 0.5, 48), new T.MeshStandardMaterial({ color: 0x0d0b16, roughness: 0.18, metalness: 0.65 })); deck.position.y = 0.25; deck.receiveShadow = true; g.add(deck);
    const rimA = mk(new T.TorusGeometry(3.75, 0.06, 8, 96), basic(LOOK.c[0])); rimA.rotation.x = Math.PI / 2; rimA.position.y = 0.5; g.add(rimA);
    const rimB = mk(new T.TorusGeometry(2.4, 0.04, 8, 72), basic(LOOK.c[1])); rimB.rotation.x = Math.PI / 2; rimB.position.y = 0.52; g.add(rimB);
    const floor = mk(new T.RingGeometry(4.2, 7.5, 64), basic(LOOK.c[3] || 0x7a2bd8, { transparent: true, opacity: 0.25, depthWrite: false, blending: T.AdditiveBlending })); floor.rotation.x = -Math.PI / 2; floor.position.y = 0.03; g.add(floor);
    // LED-Wand hinter Rico (zeigt LIVE, Zuschauer und Herzen)
    const cv = document.createElement('canvas'); cv.width = 768; cv.height = 384; const tex = new T.CanvasTexture(cv); tex.encoding = T.sRGBEncoding; own.push(tex);
    const wall = mk(new T.PlaneGeometry(9.6, 4.8), basic(0xffffff, { map: tex })); wall.position.set(-4.4, 3.4, 0); wall.rotation.y = Math.PI / 2; g.add(wall);
    const frame = mk(new T.BoxGeometry(0.3, 5.3, 10.1), new T.MeshStandardMaterial({ color: 0x14121c, roughness: 0.4, metalness: 0.6 })); frame.position.set(-4.6, 3.4, 0); g.add(frame);
    // Ringlicht auf Stativ
    const ring = mk(new T.TorusGeometry(0.62, 0.07, 12, 48), basic(0xfff4e0)); ring.position.set(-1.3, 2.05, 2.7); ring.rotation.y = Math.PI / 2 - 0.9; g.add(ring);
    const pole = mk(new T.CylinderGeometry(0.03, 0.03, 1.6, 8), new T.MeshStandardMaterial({ color: 0x222222, metalness: 0.8, roughness: 0.3 })); pole.position.set(-1.3, 1.25, 2.7); g.add(pole);
    const phone = mk(new T.BoxGeometry(0.05, 0.32, 0.17), basic(0x111111)); phone.position.copy(ring.position); phone.rotation.y = ring.rotation.y; g.add(phone);
    W.glow(0xfff4e0, 2.6, g, -1.3, 2.05, 2.7);
    // Lichtkegel (sichtbar) und echte Spots
    const beams = [];
    [[LOOK.c[0], -2.8, 3.4], [LOOK.c[1], -2.8, -3.4], [LOOK.c[2], 3.6, 0]].forEach(([c, x, z], i) => {
      const cone = mk(new T.ConeGeometry(1.6, 9, 32, 1, true), basic(c, { transparent: true, opacity: 0.11, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide }));
      cone.geometry.translate(0, -4.5, 0); const pivot = new T.Group(); pivot.position.set(x, 8.6, z); pivot.add(cone); g.add(pivot);
      const head = mk(new T.CylinderGeometry(0.25, 0.32, 0.5, 12), new T.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.8, roughness: 0.3 })); head.position.copy(pivot.position); g.add(head);
      W.glow(c, 2.2, g, x, 8.4, z);
      const sp = new T.SpotLight(c, 2.2, 26, 0.5, 0.6, 1.2); sp.position.set(X + x, Y + 8.6, Z + z); sp.target.position.set(X, Y + 1, Z); sp.castShadow = false;
      S.group.add(sp); S.group.add(sp.target); beams.push({ pivot, sp, ph: i * 2.1, c });
    });
    const key = new T.PointLight(0xfff0e0, 1.4, 9, 2); key.position.set(X + 2.2, Y + 2.6, Z + 1.2); S.group.add(key);
    // Herzen und Emojis, die aus dem Stream aufsteigen
    const hearts = [], emo = ['💜', '❤️', '🔥', '😂', '👏', '💛'].map(e => { const c = document.createElement('canvas'); c.width = c.height = 96; const x = c.getContext('2d'); x.font = '76px serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(e, 48, 54); const t = new T.CanvasTexture(c); own.push(t); return t; });
    for (let i = 0; i < 28; i++) { const m = new T.SpriteMaterial({ map: emo[i % emo.length], transparent: true, depthWrite: false }); own.push(m); const s = new T.Sprite(m); s.visible = false; g.add(s); hearts.push({ s, t: 0, life: 0 }); }
    S.group.add(g);
    set = { S, g, look: LOOK, tex, cv, ctx: cv.getContext('2d'), beams, key, hearts, rimA, rimB, floor, ring, own, t: 0, view: 4, goal: 4, rain: 0.6, last: 0, saved: saveHosts() };
    drawWall(); return set;
  }
  function drawWall() {
    const s = set, c = s.ctx, w = s.cv.width, h = s.cv.height, t = s.t;
    const L = s.look, bg = L.bg || ['#2a0b4a', '#0b1a3a', '#3a0b2a'], hex = n => '#' + n.toString(16).padStart(6, '0');
    const gr = c.createLinearGradient(0, 0, w, h); gr.addColorStop(0, bg[0]); gr.addColorStop(0.55, bg[1]); gr.addColorStop(1, bg[2]); c.fillStyle = gr; c.fillRect(0, 0, w, h);
    c.globalAlpha = 0.18; for (let i = 0; i < 12; i++) { c.fillStyle = hex(L.c[i % 3]); c.beginPath(); c.arc((i * 97 + t * 40) % (w + 80) - 40, h * (0.2 + (i % 5) * 0.16), 26 + (i % 4) * 14, 0, 7); c.fill(); } c.globalAlpha = 1;
    c.fillStyle = Math.sin(t * 6) > 0 ? '#ff2d55' : '#b31a3a'; c.beginPath(); c.roundRect ? c.roundRect(28, 26, 150, 58, 14) : c.rect(28, 26, 150, 58); c.fill();
    c.fillStyle = '#fff'; c.font = 'bold 40px system-ui, sans-serif'; c.textBaseline = 'middle'; c.fillText('● LIVE', 44, 56);
    c.font = 'bold 34px system-ui, sans-serif'; c.textAlign = 'right'; c.fillText('👁 ' + Math.round(s.view).toLocaleString('de-DE'), w - 30, 56); c.textAlign = 'left';
    c.font = '900 76px system-ui, sans-serif'; c.fillStyle = hex(L.c[2]); c.shadowColor = hex(L.c[2]); c.shadowBlur = 24; c.fillText(L.title, 34, 190); c.shadowBlur = 0;
    c.font = 'bold 34px system-ui, sans-serif'; c.fillStyle = '#fff'; c.fillText(L.sub, 38, 256);
    c.font = '28px system-ui, sans-serif'; c.fillStyle = 'rgba(255,255,255,.8)'; c.fillText(s.view >= L.hot ? L.chat[1] : L.chat[0], 38, 330);
    s.tex.needsUpdate = true;
  }
  // Figuren merken und hinterher wieder an ihren Platz stellen (Rico kann die Spielfigur sein)
  function saveHosts() { return ['andrew', 'marco', 'rico'].map(id => { const f = W.hosts[id]; return f && { f, parent: f.root.parent, p: f.root.position.clone(), r: f.root.rotation.y, vis: f.root.visible }; }).filter(Boolean); }
  function place(id, x, z, ry, anim) { const f = W.hosts[id], S = set && set.S; if (!f || !S) return; if (f.root.parent !== S.group) S.group.add(f.root); f.root.visible = true; f.root.position.set(X + x, Y + (Math.hypot(x, z) < 3.6 ? 0.5 : 0), Z + z); f.root.rotation.y = ry; f.play(anim || 'idle', { fade: 0.25 }); }
  function cleanup() {
    const s = set; if (!s) return; set = null;
    s.saved.forEach(o => { if (o.parent) o.parent.add(o.f.root); else if (o.f.root.parent) o.f.root.parent.remove(o.f.root); o.f.root.position.copy(o.p); o.f.root.rotation.y = o.r; o.f.root.visible = o.vis; o.f.play('idle', { fade: 0.2 }); });
    s.beams.forEach(b => { s.S.group.remove(b.sp); s.S.group.remove(b.sp.target); }); s.S.group.remove(s.key); s.S.group.remove(s.g);
    s.g.traverse(o => { if (o.isSprite && o.material && o.material.map === W.glowTex) o.material.dispose(); });
    s.own.forEach(o => { try { o.dispose(); } catch (e) { /* egal */ } });
  }

  // ------------------------------------------------------------------ Effekte je Bild
  function fx(dt) {
    const s = set; if (!s) return; s.t += dt;
    s.beams.forEach(b => { const a = s.t * 0.9 + b.ph; b.pivot.rotation.set(Math.sin(a) * 0.45, 0, Math.cos(a * 0.8) * 0.45); b.sp.target.position.set(X + Math.sin(a) * 2, Y + 0.6, Z + Math.cos(a * 0.8) * 2); b.sp.intensity = 1.8 + Math.sin(s.t * 3 + b.ph) * 0.6; });
    s.rimA.material.color.setHex(s.look.c[0]).offsetHSL(Math.sin(s.t * 0.7) * 0.05, 0, 0); s.rimB.material.color.setHex(s.look.c[1]).offsetHSL(Math.sin(s.t * 1.1) * 0.05, 0, 0);
    s.floor.material.opacity = 0.18 + Math.sin(s.t * 4) * 0.08; s.ring.material.color.setScalar(0.92 + Math.sin(s.t * 10) * 0.04);
    s.view += (s.goal - s.view) * Math.min(1, dt * 1.6);
    if ((s.last += dt) > 0.12) { s.last = 0; drawWall(); }
    s.hearts.forEach(h => {
      if (h.life <= 0) { if (Math.random() < dt * s.rain) { h.life = h.t = U.rand(2.2, 3.4); h.x = U.rand(-1.2, 2.8); h.z = U.rand(-2.5, 2.5); h.s.visible = true; } else return; }
      h.life -= dt; const k = 1 - h.life / h.t; h.s.position.set(h.x + Math.sin(k * 9 + h.z) * 0.3, 1.4 + k * 4.2, h.z); const sc = 0.45 * Math.min(1, k * 5) * (1 - k * 0.4); h.s.scale.set(sc, sc, 1); h.s.material.opacity = 1 - k; if (h.life <= 0) h.s.visible = false;
    });
  }
  const confetti = (n, y) => { for (let i = 0; i < (n || 3); i++) W.particles.burst(X + U.rand(-2, 2), Y + (y || 5), Z + U.rand(-3, 3), (set ? set.look.c.concat([0xffffff]) : [0xffffff])[i % 4], 36, { speed: 6, grav: 4, life: 1.8, size: 0.32, up: 1 }); };

  // ------------------------------------------------------------------ Die Szene
  const R = Math.PI / 2;   // Blick nach +x (zum Publikum)
  const PARK = [-16, 0.2, 30];  // Stadtpark, neben dem Brunnen (Publikum Richtung Osten)
  const SCENES = {
    rico: { t: '📱 Ricos Live-Show', at: [-182, 0.12, 8],   // beim Live-Studio, frei von Straße (z ±2,2), Laternen und Bänken
      look: { c: [0xff3da8, 0x3dd6ff, 0xffd45a, 0x7a2bd8], title: 'RicoReWi', sub: '× AnMaCha – Der Podcast', hot: 300, chat: ['💬 „hallo?“  💬 „wer ist live?“', '💬 „Rico, mach lauter!“  💬 „Anmacher 🔥“'], view: 4 },
      shots: () => [
        { cam: [X + 18, 10, Z + 12], to: [X + 9, 3.4, Z + 4.5], look: [X, 2, Z], dur: 6, fx, pose: () => { place('rico', -0.4, 0, R, 'arms'); place('andrew', 4.8, 1.3, -R, 'idle'); place('marco', 4.8, -1.3, -R, 'idle'); confetti(2, 6); AMC.Audio.sfx('whoosh'); },
          lines: [['rico', 'Licht an, Kamera läuft – willkommen im RicoReWi-Universum!', clip(1)]] },
        { cam: [X + 3.6, 2.3, Z + 1.9], to: [X + 2.7, 2.05, Z + 1], look: [X - 0.4, 1.75, Z], dur: 7, fx, pose: () => place('rico', -0.4, 0, R + 0.25, 'idle'),
          lines: [['rico', 'Andrew, Marco: Ich hab euch ein Tool gebaut, das eure Hörer live zählt. Gerade sind es … vier.', clip(2)]] },
        { cam: [X + 1.6, 2.1, Z + 2.6], to: [X + 2.2, 2, Z + 2], look: [X + 4.8, 1.5, Z], dur: 6, fx, pose: () => { place('andrew', 4.8, 1.3, -R, 'idle'); place('marco', 4.8, -1.3, -R, 'idle'); },
          lines: [['marco', 'Vier? Einer davon bin ich. Mit meinem Zweit-Account.', { gest: 'arms' }], ['andrew', 'Und meine Mutter. Auf drei Handys.', { wait: 0.3, gest: 'yes', do: () => AMC.Audio.sfx('laugh') }]] },
        { cam: [X + 7, 4.5, Z - 6], to: [X + 5, 2.6, Z - 3.6], look: [X - 0.4, 2, Z], dur: 7, fx, pose: () => place('rico', -0.4, 0, R, 'idle'),
          lines: [['rico', 'Kein Stress. Aus vier werden vierhundert, wenn ihr euch was traut.', Object.assign(clip(3), { gest: 'arms', do: () => { if (set) { set.goal = 400; set.rain = 9; } AMC.Audio.sfx('cheer'); } })]] },
        { cam: [X + 2, 1.7, Z + 5.2], to: [X + 2.4, 1.9, Z - 5.2], look: [X - 0.4, 1.7, Z], dur: 8, fx, pose: () => place('rico', -0.4, 0, R, 'idle'),
          lines: [['rico', 'Ich bin RicoReWi. Und das hier ist echt – kein Filter, kein Fake.', clip(4)]] },
        { cam: [X + 11, 3.2, Z], to: [X + 17, 7.5, Z + 7], look: [X + 1, 2, Z], dur: 9, fx: dt => { fx(dt); if (set && Math.random() < dt * 2.2) confetti(1, U.rand(4, 7)); }, pose: () => { place('rico', -0.4, 0, R, 'idle'); place('andrew', 2.2, 1.4, -R + 0.4, 'idle'); place('marco', 2.2, -1.4, -R - 0.4, 'idle'); },
          lines: [['rico', 'Und jetzt: Bühne frei für AnMaCha – der Podcast!', Object.assign(clip(5), { gest: null, do: () => { ['rico', 'andrew', 'marco'].forEach(id => W.hosts[id] && W.hosts[id].play('dance', { fade: 0.3 })); if (set) { set.goal = 4000; set.rain = 14; } confetti(4, 6); AMC.Audio.sfx('applause'); } })], ['andrew', 'Rico, du bist komplett verrückt.', { gest: null, wait: 0.4 }], ['marco', 'Genau deshalb kommt er in unsere Show.', { gest: null }]] }
      ] },
    andrew: { t: '☀️ Andrews Morgen-Show', at: PARK, need: () => act() >= 1 && career().eps >= 2, hint: '☀️ Andrew probt im Stadtpark seine Morgen-Show – schau vorbei!', look: { c: [0xffb03d, 0xff5a3d, 0xffe27a, 0xff8a1e], bg: ['#4a1f0b', '#3a2a0b', '#5a2a12'], title: 'Andrew', sub: 'Die Morgen-Show · live im Stadtpark', hot: 200, chat: ['💬 „Mikro an?“  💬 „guten Morgen 😴“', '💬 „ANDREW 😂“  💬 „Mikro war aus!!“'], view: 12 },
      shots: () => [
        { cam: [X + 16, 9, Z + 10], to: [X + 8, 3.2, Z + 4], look: [X, 2, Z], dur: 6, fx, pose: () => { place('andrew', -0.4, 0, R, 'arms'); confetti(2, 6); AMC.Audio.sfx('whoosh'); },
          lines: [['andrew', 'Guten Morgen, Medienstadt! Hier ist Andrew – live aus dem Stadtpark!']] },
        { cam: [X + 3.4, 2.2, Z + 1.8], to: [X + 2.6, 2, Z + 0.9], look: [X - 0.4, 1.75, Z], dur: 7, fx, pose: () => place('andrew', -0.4, 0, R + 0.2, 'idle'),
          lines: [['andrew', 'Marco schläft noch. Also mache ich die Show heute allein. Was soll schon schiefgehen?']] },
        { cam: [X + 7, 4.5, Z - 6], to: [X + 5, 2.6, Z - 3.6], look: [X - 0.4, 2, Z], dur: 6, fx, pose: () => place('andrew', -0.4, 0, R, 'idle'),
          lines: [['n', 'Drei Minuten später …', { wait: 0.2 }], ['andrew', 'Okay, das Mikro war die ganze Zeit aus. Aber ich sah dabei fantastisch aus!', { wait: 0.6, gest: null, do: () => { const f = W.hosts.andrew; f && f.play('dance', { fade: 0.3 }); if (set) { set.goal = 380; set.rain = 8; } AMC.Audio.sfx('laugh'); } }]] },
        { cam: [X + 10, 3, Z], to: [X + 15, 6.5, Z + 6], look: [X + 1, 2, Z], dur: 7, fx: dt => { fx(dt); if (set && Math.random() < dt * 1.6) confetti(1, U.rand(4, 7)); }, pose: () => place('andrew', -0.4, 0, R, 'idle'),
          lines: [['andrew', 'Morgen gleich nochmal. Diesmal mit Ton!', { gest: 'yes', do: () => { confetti(3, 6); AMC.Audio.sfx('applause'); } }]] }] },
    marco: { t: '🌙 Marco unplugged', at: PARK, need: () => act() >= 2 && career().eps >= 4, hint: '🌙 Marco spielt im Stadtpark unplugged – schau vorbei!', look: { c: [0x6c8cff, 0x3dd6ff, 0xc9a0ff, 0x2a3a8a], bg: ['#0b1030', '#101a3a', '#1a0b3a'], title: 'Marco', sub: 'Unplugged · ganz ehrlich', hot: 150, chat: ['💬 „so ruhig heute“  💬 „💙“', '💬 „Gisela 😭“  💬 „Andrew, Schlüssel her!“'], view: 30 },
      shots: () => [
        { cam: [X + 14, 6, Z - 9], to: [X + 7.5, 2.8, Z - 3.5], look: [X, 1.8, Z], dur: 7, fx, pose: () => { place('marco', -0.4, 0, R, 'idle'); if (set) set.rain = 0.3; },
          lines: [['marco', 'Hallo zusammen. Heute ganz ruhig – nur ich, eine Gitarre, die ich nicht spielen kann, und ihr.']] },
        { cam: [X + 3.4, 2.1, Z - 1.8], to: [X + 2.6, 1.95, Z - 0.9], look: [X - 0.4, 1.7, Z], dur: 7, fx, pose: () => place('marco', -0.4, 0, R - 0.2, 'idle'),
          lines: [['marco', 'Andrew sagt immer, wir müssen lauter werden. Ich finde, wir müssen ehrlicher werden.']] },
        { cam: [X + 2, 1.7, Z + 5], to: [X + 2.4, 1.9, Z - 5], look: [X - 0.4, 1.7, Z], dur: 7, fx, pose: () => place('marco', -0.4, 0, R, 'idle'),
          lines: [['marco', 'Und falls jemand Gisela gesehen hat: Andrew, gib bitte die Schlüssel zurück.', { gest: 'arms', do: () => { if (set) { set.goal = 260; set.rain = 6; } } }], ['gisela', 'Tröööt!', { wait: 0.7, do: () => AMC.Audio.sfx('laugh') }]] }] },
    duo: { t: '🎙️ Der Mitternachts-Talk', at: PARK, need: () => act() >= 3 && career().abos >= 2000, hint: '🎙️ Mitternachts-Talk im Stadtpark – Andrew und Marco warten auf dich!', look: { c: [0xff3da8, 0xffd45a, 0x3dd6ff, 0x7a2bd8], title: 'AnMaCha', sub: 'Der Mitternachts-Talk · Andrew & Marco', hot: 2500, chat: ['💬 „Mitternacht 🌙“  💬 „los geht’s!“', '💬 „Anmacher 🔥🔥“  💬 „Plakat!!“'], view: 1800 },
      shots: () => [
        { cam: [X + 16, 9, Z + 10], to: [X + 8, 3.2, Z + 4], look: [X, 2, Z], dur: 6, fx, pose: () => { place('andrew', -0.2, 1.3, R - 0.25, 'arms'); place('marco', -0.2, -1.3, R + 0.25, 'idle'); confetti(2, 6); AMC.Audio.sfx('whoosh'); },
          lines: [['andrew', 'Mitternachts-Talk! Marco, sag den Leuten, warum wir das hier machen.']] },
        { cam: [X + 3.6, 2.2, Z - 2.6], to: [X + 2.8, 2, Z - 1.6], look: [X - 0.2, 1.75, Z - 1.3], dur: 7, fx, pose: () => place('marco', -0.2, -1.3, R + 0.5, 'idle'),
          lines: [['marco', 'Weil du um Mitternacht nicht schlafen kannst – und ich zu nett bin, um Nein zu sagen.']] },
        { cam: [X + 3.6, 2.2, Z + 2.6], to: [X + 2.8, 2, Z + 1.6], look: [X - 0.2, 1.75, Z + 1.3], dur: 6, fx: dt => { fx(dt); if (set) set.goal = 2000; }, pose: () => { place('andrew', -0.2, 1.3, R - 0.5, 'yes'); if (set) set.rain = 6; AMC.Audio.sfx('cheer'); },
          lines: [['andrew', 'Zweitausend Abos, Marco! Zweitausend Menschen, die uns freiwillig zuhören!']] },
        { cam: [X + 7, 4.5, Z - 6], to: [X + 5, 2.6, Z - 3.6], look: [X - 0.2, 2, Z], dur: 6, fx, pose: () => place('marco', -0.2, -1.3, R, 'idle'),
          lines: [['marco', 'Freiwillig. Das schreiben wir aufs Plakat.', { wait: 0.5, do: () => AMC.Audio.sfx('laugh') }]] },
        { cam: [X + 11, 3.2, Z], to: [X + 17, 7.5, Z + 7], look: [X + 1, 2, Z], dur: 8, fx: dt => { fx(dt); if (set && Math.random() < dt * 2.2) confetti(1, U.rand(4, 7)); }, pose: () => { place('andrew', -0.2, 1.3, R, 'idle'); place('marco', -0.2, -1.3, R, 'idle'); },
          lines: [['andrew', 'Medienstadt – gute Nacht!', { gest: null, do: () => { ['andrew', 'marco'].forEach(id => W.hosts[id] && W.hosts[id].play('dance', { fade: 0.3 })); if (set) { set.goal = 3200; set.rain = 14; } confetti(4, 6); AMC.Audio.sfx('applause'); if (AMC.WorldFX) AMC.WorldFX.cheer(); } }], ['marco', 'Und morgen wieder: AnMaCha!', { gest: null }]] }] }
  };
  SC.LIST = SCENES;
  const career = () => AMC.Career ? AMC.Career.state() : { eps: 0, abos: 0 };
  const act = () => ((Save.data.acts || {}).cur) || 0;   // Szenen gehören in ihren Story-Akt (Andrew ab Akt 2, Marco ab Akt 3, Duo ab Akt 4)
  const sst = () => { const d = Save.data.scenes = Save.data.scenes || {}; if ((Save.data.ricoLive || {}).seen) d.rico = 1; return d; };
  SC.seen = id => !!sst()[id];
  /** Szene abspielen; done läuft danach (auch wenn sie nicht starten kann). */
  SC.play = function (id, done) {
    const d = SCENES[id], S = AMC.Play.state(); if (!d || !S || !AMC.Cut || AMC.Cut.active() || set || S.mode !== 'free') { if (done) done(); return false; }
    X = d.at[0]; Y = d.at[1]; Z = d.at[2]; LOOK = d.look; build(S); set.view = set.goal = d.look.view || 4;
    const ok = AMC.Cut.play(d.shots(), () => { cleanup(); const first = !SC.seen(id); sst()[id] = 1; if (id === 'rico') Save.data.ricoLive = { seen: true }; Save.save(); if (first) { const f = Save.earn(50); AMC.UI.toast('🎬 ' + d.t + ' gesehen! +' + f + ' 🎟️', 3600); } if (done) done(); });
    if (!ok) { cleanup(); if (done) done(); }
    return ok;
  };
  SC.active = () => !!set;
  const seen = () => SC.seen('rico');
  RL.seen = seen; RL.play = done => SC.play('rico', done); RL.active = SC.active;

  // Andrew/Marco/beide: starten von selbst, sobald ihr Ziel erreicht ist (frei in der Stadt, nichts anderes offen)
  if (AMC.Acts && AMC.Acts.update) {
    // Lichtsäule über dem Stadtpark zeigt, wo die nächste Szene wartet
    let pole = null;
    const beam = S => {
      if (!S) { if (pole && pole.parent) pole.parent.remove(pole); return; }
      if (!pole) { const T = root.THREE; pole = new T.Mesh(new T.CylinderGeometry(1.2, 1.2, 60, 20, 1, true), new T.MeshBasicMaterial({ color: 0xffd23f, transparent: true, opacity: 0.22, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide, toneMapped: false })); pole.position.set(PARK[0], 30, PARK[2]); pole.userData.dyn = true; }
      if (pole.parent !== S.group) S.group.add(pole);
    };
    // Nur eine Szene zur Zeit, nie direkt hinter einer anderen Zwischensequenz, und erst, wenn man in den Stadtpark kommt (Hinweis vorher)
    const up = AMC.Acts.update; let wait = 3, hintT = 0;
    AMC.Acts.update = function (dt) {
      up.apply(AMC.Acts, arguments);
      if ((wait -= dt) > 0) return; wait = 1;
      const S = AMC.Play.state(); if (!S || S.mode !== 'free' || S.net || S.drive || AMC.Cut.active() || AMC.UI.isOpen() || (AMC.Worlds && AMC.Worlds.busy && AMC.Worlds.busy())) return;
      const a = Save.data.acts || {}; if (!(a.seen || {})[a.cur || 0] && (a.cur || 0) < 5) return;   // erst die Einleitung des laufenden Akts
      if (AMC.Acts.lastCut && Date.now() - AMC.Acts.lastCut < 45000) return;
      const id = ['andrew', 'marco', 'duo'].find(k => !SC.seen(k) && SCENES[k].need()); if (!id) return beam(null);
      beam(S);
      if (Math.hypot(S.pl.x - PARK[0], S.pl.z - PARK[2]) < 26) { beam(null); SC.play(id); return; }
      if ((hintT -= 1) <= 0) { hintT = 120; AMC.UI.toast(SCENES[id].hint, 5200); }
    };
  }
  // Story-Menü: gesehene Szenen nochmal ansehen
  if (AMC.Acts && AMC.Acts.panel) {
    const pan = AMC.Acts.panel;
    AMC.Acts.panel = function () {
      const s = pan.apply(AMC.Acts, arguments), L = s && s.el && s.el.querySelector('#acL'); if (!L) return s;
      Object.keys(SCENES).forEach(k => { const d = SCENES[k], ok = SC.seen(k); const b = U.el('button', 'st-item', '<span class="st-ic">' + (ok ? '🎬' : '🔒') + '</span><span><b>' + d.t + '</b><small>' + (ok ? 'Bühnen-Szene · nochmal ansehen' : 'Kommt im Lauf der Geschichte') + '</small></span>'); b.type = 'button'; b.dataset.sc = k; b.setAttribute('data-nav', ''); if (!ok) b.setAttribute('aria-disabled', 'true'); b.onclick = e => { e.stopPropagation(); if (!ok) return; AMC.UI.close(s); if (AMC.Game && AMC.Game.menu) { AMC.UI.close(AMC.Game.menu); AMC.Game.menu = null; } setTimeout(() => SC.play(k), 200); }; L.appendChild(b); });
      return s;
    };
  }

  // Live-Studio: beim ersten Besuch läuft die Show, danach gibt es sie im Menü des Studios
  if (AMC.Worlds && AMC.Worlds.open) {
    let tried = false; const open = AMC.Worlds.open, pl = AMC.Worlds.PLACES && AMC.Worlds.PLACES.tiktok;
    AMC.Worlds.open = function (id) {
      if (id === 'tiktok' && !seen() && !tried) { tried = true; return RL.play(() => AMC.Worlds.open(id)); }
      open.apply(AMC.Worlds, arguments);
      if (id === 'tiktok' && pl) { const l = document.querySelector('#woL'); if (l && !l.querySelector('[data-rl]')) { const b = U.el('button', 'st-item', '<span class="st-ic">🎬</span><span><b>Ricos Live-Show nochmal ansehen</b><small>Mit RicoReWis Originalstimme</small></span>'); b.type = 'button'; b.dataset.rl = '1'; b.setAttribute('data-nav', ''); b.onclick = e => { e.stopPropagation(); const x = document.querySelector('#woB'); if (x) x.click(); setTimeout(() => RL.play(), 200); }; l.insertBefore(b, l.firstChild); } }
    };
  }
})(typeof window !== 'undefined' ? window : globalThis);
