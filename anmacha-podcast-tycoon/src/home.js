/* AnMaCha – Der Podcast: Sims-Teil rund um Medien, Radio und Podcast.
   - Zuhause: Andrew und Marco haben je eine eigene Wohnung zum Herumlaufen, Einrichten und Ausbauen.
     Bedürfnisse (Energie, Hunger, Spaß) sinken durch Aufnahmen und Stadt-Ausflüge und wirken auf die Live-Stimmung.
     Am Schreibtisch entstehen verrückte Ideen, die als Bonus-Themen in die nächste Aufnahme wandern.
   - Begehbares Studio: zu Fuß durchs eigene Studio, am Pult die Aufnahme starten, Rico treffen, einrichten.
   - Musikshop: gemeinfreie Klavierlicht-Melodien kaufen – sie kommen als Hörerwünsche und am Klavier zu Hause.
   Ein Bedienkonzept für alle Geräte: Stick/WASD/Pfeile laufen, Ⓧ/E/Tippen auf den Knopf benutzt, Ⓑ/Esc geht raus. */
(function (root) {
  'use strict';
  const AMC = root.AMC = root.AMC || {};
  const U = AMC.U, I = AMC.Input, W = AMC.World, D = AMC.Data, Save = AMC.Save;
  const HM = AMC.Home = {};
  let T, R = null;   // R = aktive Szene (Zuhause oder Studio)

  // ------------------------------------------------------------------ Bedürfnisse
  const NEEDS = [['energy', '⚡', 'Energie'], ['hunger', '🍔', 'Hunger'], ['fun', '🎮', 'Spaß']];
  function needs(id) {
    const d = Save.data; d.needs = d.needs || {};
    if (!d.needs[id]) d.needs[id] = { energy: 80, hunger: 70, fun: 70, ideas: [] };
    return d.needs[id];
  }
  HM.needs = needs;
  /** Stimmung 0…1 (Durchschnitt der Bedürfnisse) */
  HM.mood = id => { const n = needs(id); return (n.energy + n.hunger + n.fun) / 300; };
  /** Aufnahme oder Ausflug kostet Kraft */
  HM.tire = function (ids, k) {
    (ids || ['andrew', 'marco']).forEach(id => { const n = needs(id); n.energy = Math.max(0, n.energy - 12 * k); n.hunger = Math.max(0, n.hunger - 15 * k); n.fun = Math.max(0, n.fun - 8 * k); });
    Save.save();
  };
  /** Bonus für die Live-Aufnahme: Stimmung und Ideen-Karten (werden verbraucht) */
  HM.showBonus = function () {
    const m = (HM.mood('andrew') + HM.mood('marco')) / 2, cards = [];
    ['andrew', 'marco'].forEach(id => { const n = needs(id); (n.ideas || []).forEach(t => cards.push({ rub: U.pick(D.HOSTS[id].strong), power: 2.4, label: '💡 ' + t, used: false })); n.ideas = []; });
    Save.save();
    const tired = ['andrew', 'marco'].filter(id => HM.mood(id) < 0.35).map(id => D.HOSTS[id].name);
    return { hype: Math.round((m - 0.5) * 24), cards, tired };
  };

  // ------------------------------------------------------------------ Wohnungen: Plätze mit Ausbaustufen
  const HOMES = {
    andrew: {
      name: 'Andrews Wohnung', wall: 0xe8dccb, wall2: 0xff9d2e, floor: '#9a7a56', light: 0xffd8a8,
      slots: [
        { id: 'bed', x: -4.2, z: -2.6, act: 'sleep', lv: [['Matratze am Boden', 0], ['Gemütliches Bett', 250], ['Boxspringbett mit Lichterkette', 650]] },
        { id: 'kitchen', x: 3.9, z: -3.1, act: 'eat', lv: [['Mini-Küche', 0], ['Küche mit Pommes-Fritteuse', 300], ['Profi-Küche (Köttbullar-Station)', 700]] },
        { id: 'sofa', x: -0.4, z: 1.3, act: 'tv', lv: [['Altes Sofa + Röhren-TV', 0], ['Sofa + Flachbild', 280], ['Heimkino mit Soundbar', 750]] },
        { id: 'records', x: 4.3, z: 0.9, act: 'music', lv: [['Kofferradio', 0], ['Plattenspieler', 220], ['DJ-Pult', 600]] },
        { id: 'desk', x: 0.6, z: -3.2, act: 'desk', lv: [['Laptop auf dem Küchentisch', 0], ['Schreibtisch mit Monitor', 260], ['Kreativ-Ecke mit Pinnwand', 620]] },
        { id: 'plant', x: -4.6, z: 1.9, act: 'plant', lv: [['Basilikum (hört Podcast)', 0], ['Pflanzen-Regal', 160], ['Urban-Jungle', 420]] }
      ]
    },
    marco: {
      name: 'Marcos Haus', wall: 0x3a4150, wall2: 0x3aa7a0, floor: '#5a4030', light: 0xcfe0ff,
      slots: [
        { id: 'bed', x: -4.2, z: -2.6, act: 'sleep', lv: [['Klappbett (wie in Gisela)', 0], ['Doppelbett', 250], ['Bett mit Gisela-Kopfteil', 650]] },
        { id: 'kitchen', x: 3.9, z: -3.1, act: 'eat', lv: [['Kochplatte', 0], ['Küche mit Grill', 300], ['Grillstation „Imbisskind“', 700]] },
        { id: 'sofa', x: -0.4, z: 1.3, act: 'tv', lv: [['Sessel + Fernseher', 0], ['Serien-Sofa', 280], ['Heimkino „Marcos Tagebuch“', 750]] },
        { id: 'bench', x: 4.3, z: 0.9, act: 'tech', lv: [['Kabelkiste', 0], ['Werkbank', 240], ['Technik-Labor mit Lötstation', 640]] },
        { id: 'desk', x: 0.6, z: -3.2, act: 'desk', lv: [['Tagebuch und Stift', 0], ['Schreibtisch mit PC', 260], ['Streaming-Setup', 620]] },
        { id: 'piano', x: -4.4, z: 1.7, act: 'music', lv: [['Keyboard', 0], ['E-Piano', 220], ['Klavier mit Klavierlicht', 600]] }
      ]
    }
  };
  HM.HOMES = HOMES;
  const lvOf = (hid, sid) => ((Save.data.homes || {})[hid] || {})[sid] || 0;
  HM.value = hid => HOMES[hid].slots.reduce((a, s) => a + lvOf(hid, s.id), 0);

  const LINES = {
    sleep: { andrew: ['Zzz … Ich träume von einer Folge ohne Kabelsalat.', 'Kurzes Nickerchen. Danach bin ich wieder Feelgood pur.'], marco: ['Zzz … Gisela … nicht so schnell …', 'Ein Power-Nap. Wie bei Gisela: kurz parken, dann weiter.'] },
    eat: { andrew: ['Pommes-Zeit! Imbisskind forever.', 'Köttbullar mit Gummibärchen. Die KI hatte recht. Irgendwie.'], marco: ['Ich hab gegrillt. Die Rauchmelder applaudieren.', 'Ein Brot. Mit Liebe. Und Senf.'] },
    tv: { andrew: ['Noch eine Folge. Nur noch eine. Okay, drei.', 'Im Fernsehen läuft ein Podcast über Fernsehen. Meta!'], marco: ['Serien-Marathon! Für die Recherche, versteht sich.', 'Ich schau eine Doku über Wohnmobile. Gisela wäre stolz.'] },
    music: { andrew: ['Musik-Moment! Lautstärke hoch!'], marco: ['Ich spiel das jetzt auswendig. Fast.'] },
    tech: { marco: ['Ich hab ein Kabel repariert, das gar nicht kaputt war. Vorsichtshalber.', 'Neue Mikrofonhalterung gebaut. Aus einer Kochkelle.'] },
    plant: { andrew: ['Ich spiel dem Basilikum unsere neue Folge vor. Er wächst!', 'Die Pflanzen hören mehr Podcast als manche Hörer.'] }
  };

  // ------------------------------------------------------------------ Laufen (gemeinsam für Zuhause und Studio)
  function walker(o) {
    const w = { x: o.x, z: o.z, yaw: Math.PI, vx: 0, vz: 0, fig: o.fig, anim: '' };
    w.update = function (dt) {
      const mx = I.move.x, mz = -I.move.y, mag = Math.min(1, Math.hypot(mx, mz)), sp = (I.sprint ? 4.6 : 3.1) * mag;
      w.vx = U.damp(w.vx, mag > 0.05 ? mx / (Math.hypot(mx, mz) || 1) * sp : 0, 12, dt); w.vz = U.damp(w.vz, mag > 0.05 ? mz / (Math.hypot(mx, mz) || 1) * sp : 0, 12, dt);
      let nx = w.x + w.vx * dt, nz = w.z + w.vz * dt; const B = o.bounds;
      nx = U.clamp(nx, B.x0, B.x1); nz = U.clamp(nz, B.z0, B.z1);
      for (const s of o.solids()) { if (s.box) { if (nx > s.x0 - 0.3 && nx < s.x1 + 0.3 && nz > s.z0 - 0.3 && nz < s.z1 + 0.3) { const px = Math.min(Math.abs(nx - s.x0 + 0.3), Math.abs(s.x1 + 0.3 - nx)), pz = Math.min(Math.abs(nz - s.z0 + 0.3), Math.abs(s.z1 + 0.3 - nz)); if (px < pz) nx = Math.abs(nx - s.x0) < Math.abs(nx - s.x1) ? s.x0 - 0.3 : s.x1 + 0.3; else nz = Math.abs(nz - s.z0) < Math.abs(nz - s.z1) ? s.z0 - 0.3 : s.z1 + 0.3; } continue; }
        const dx = nx - s.x, dz = nz - s.z, d = Math.hypot(dx, dz), r = s.r + 0.3; if (d < r && d > 0.001) { nx = s.x + dx / d * r; nz = s.z + dz / d * r; } }
      w.x = nx; w.z = nz;
      const v = Math.hypot(w.vx, w.vz); if (v > 0.3) w.yaw = Math.atan2(w.vx, w.vz);
      const f = w.fig; if (f) {
        f.root.position.set(w.x, 0, w.z); f.root.rotation.y += U.angDiff(f.root.rotation.y, w.yaw) * Math.min(1, dt * 12);
        if (!(w.busy > 0)) { const a = (o.anim && o.anim(v)) || (v < 0.3 ? 'idle' : v < 3.4 ? 'walk' : 'jog'); if (w.anim !== a) { f.play(a, { fade: 0.2 }); w.anim = a; } }
        if (!o.noFigUpdate) f.update(dt);
      }
      if (w.busy > 0) w.busy -= dt;
      // Kamera schräg von vorn oben (Sims-Blick), folgt weich
      const cam = W.camera, k = 1 - Math.exp(-dt * 4), off = o.camOff || [0, 6.2, 6.4];
      w.cp = w.cp || new T.Vector3(w.x + off[0], off[1], w.z + off[2]); w.ct = w.ct || new T.Vector3(w.x, 1, w.z);
      w.cp.lerp(new T.Vector3(w.x * 0.6 + off[0], off[1], w.z * 0.5 + off[2]), k); w.ct.lerp(new T.Vector3(w.x * 0.8, 1, w.z * 0.7 - 0.6), k);
      cam.position.copy(w.cp); cam.lookAt(w.ct);
    };
    w.near = function () { let best = null, bd = 1e9; for (const s of o.spots()) { const d = Math.hypot(s.x - w.x, s.z - w.z); if (d < (s.r || 1.6) && d < bd) { bd = d; best = s; } } return best; };
    return w;
  }

  // ------------------------------------------------------------------ Gemeinsame Oberfläche
  function hud(title, extra) {
    const el = U.el('div', 'home-ui'); el.id = 'homeUi';
    el.innerHTML = '<div class="hm-top glass"><b>' + U.esc(title) + '</b><div class="hm-needs" id="hmNeeds"></div></div>' +
      '<div class="hm-act">' + (extra || '') + '<button type="button" class="btn small" id="hmBack">🚪 Raus</button></div>' +
      '<button type="button" class="hm-use glass" id="hmUse" hidden></button><div class="hm-say glass" id="hmSay" hidden></div>';
    U.$('ui').appendChild(el);
    el.querySelector('#hmBack').onclick = () => HM.close();
    el.querySelector('#hmUse').onclick = () => use();
    return el;
  }
  function drawNeeds() {
    const box = U.$('hmNeeds'); if (!box || !R) return;
    const n = needs(R.who);
    box.innerHTML = NEEDS.map(([k, ic, nm]) => '<span class="hm-n' + (n[k] < 30 ? ' low' : '') + '" title="' + nm + '">' + ic + '<i><em style="width:' + Math.round(n[k]) + '%"></em></i></span>').join('') +
      '<span class="hm-n idea" title="Ideen für die nächste Aufnahme">💡 ' + (n.ideas || []).length + '/3</span>';
  }
  function say(text, ms) {
    const b = U.$('hmSay'); if (!b) return; b.hidden = false; if (text.indexOf('<kbd') >= 0) b.innerHTML = text; else b.textContent = text; b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
    clearTimeout(say.t); say.t = setTimeout(() => { if (b) b.hidden = true; }, ms || 3600);
  }
  function use() { if (!R || R.busy > 0) return; const s = R.w.near(); if (s && s.run) { AMC.Audio.sfx('ok'); s.run(); } }

  // ------------------------------------------------------------------ Zuhause
  function buildHome(hid) {
    const H = HOMES[hid], sc = new T.Scene(), g = new T.Group(); sc.add(g);
    sc.background = new T.Color(0x0d0e14);
    sc.add(new T.HemisphereLight(0xfff1e0, 0x3a3040, 0.95));
    const sun = new T.DirectionalLight(0xffffff, 1.2); sun.position.set(4, 9, 6); sc.add(sun);
    const lamp = new T.PointLight(H.light, 1.4, 14); lamp.position.set(0, 3.2, 0); sc.add(lamp);
    const ftex = W.canvasTex(256, 256, (c, w, h) => { c.fillStyle = H.floor; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(0,0,0,.22)'; c.lineWidth = 3; for (let y = 0; y < h; y += 32) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); for (let x = (y / 32 % 2) * 64; x < w; x += 128) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 32); c.stroke(); } } }, [3, 3]);
    const fl = new T.Mesh(new T.PlaneGeometry(12, 9), new T.MeshStandardMaterial({ map: ftex, roughness: 0.8 })); fl.rotation.x = -Math.PI / 2; g.add(fl);
    const wm = W.mat(H.wall, { r: 0.9 }), wm2 = W.mat(H.wall2, { r: 0.7 });
    W.box(12, 3.4, 0.2, wm, 0, 1.7, -4.6, g); W.box(0.2, 3.4, 9, wm, -6.1, 1.7, 0, g); W.box(0.2, 3.4, 9, wm, 6.1, 1.7, 0, g);
    W.box(12, 0.25, 0.22, wm2, 0, 0.12, -4.48, g);
    // Fenster mit Stadtblick und Tür
    const win = W.canvasTex(256, 160, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#1b2a5a'); gr.addColorStop(1, '#ff9358'); c.fillStyle = gr; c.fillRect(0, 0, w, h); c.fillStyle = '#0d0f1a'; for (let i = 0; i < 12; i++) { const bw = 14 + (i * 37) % 22, bh = 40 + (i * 53) % 80; c.fillRect(i * 22, h - bh, bw, bh); } c.fillStyle = '#ffd86a'; for (let i = 0; i < 40; i++) c.fillRect((i * 61) % w, h - 10 - (i * 29) % 70, 3, 4); });
    [-2.6, 2.6].forEach(x => { const m = new T.Mesh(new T.PlaneGeometry(2.2, 1.4), new T.MeshBasicMaterial({ map: win })); m.position.set(x, 2, -4.48); g.add(m); W.box(2.4, 0.1, 0.12, wm2, x, 1.25, -4.44, g); });
    W.box(0.1, 2.3, 1.2, W.mat(0x6b4a30, { r: 0.6 }), 6.0, 1.15, 3, g);
    const sign = W.textTex([H.name], { w: 512, h: 96, size: 52, bg: '#14161f', fg: hid === 'marco' ? '#3dd6ff' : '#ff9d2e', accent: '#ffffff' });
    const sm = new T.Mesh(new T.PlaneGeometry(2.6, 0.5), new T.MeshBasicMaterial({ map: sign })); sm.position.set(0, 3.0, -4.48); g.add(sm);
    // Poster: AnMaCha-Logo, bei Marco Gisela
    const tl = new T.TextureLoader(); tl.load(AMC.UI.podLogo, t => { t.encoding = T.sRGBEncoding; const m = new T.Mesh(new T.PlaneGeometry(1.1, 1.1), new T.MeshBasicMaterial({ map: t })); m.position.set(-6.0, 1.9, -0.8); m.rotation.y = Math.PI / 2; g.add(m); });
    if (hid === 'marco' && AMC.StudioEdit) { const c = AMC.StudioEdit.camper(0.32); c.position.set(5.6, 0.95, -1.4); c.rotation.y = -Math.PI / 2; g.add(c); W.box(0.7, 0.06, 1.7, W.mat(0x5a4030), 5.7, 0.92, -1.4, g); W.box(0.06, 0.9, 0.06, W.mat(0x5a4030), 5.7, 0.45, -1.4, g); }
    const objs = H.slots.map(s => { const m = slotMesh(hid, s, lvOf(hid, s.id)); m.position.set(s.x, 0, s.z); g.add(m); return m; });
    return { sc, g, objs };
  }
  function slotMesh(hid, s, lv) {
    const g = new T.Group(), M = (c, o) => W.mat(c, o || { r: 0.6 }), B = (w, h, d, c, x, y, z, o) => W.box(w, h, d, M(c, o), x, y, z, g), acc = hid === 'marco' ? 0x3dd6ff : 0xff9d2e;
    const glow = (c, x, y, z) => B(0.12, 0.12, 0.12, c, x, y, z, { e: c, ei: 1.4 });
    if (s.id === 'bed') { B(2.0, lv ? 0.45 : 0.22, 2.6, lv ? 0x6b4a30 : 0xdcd6cc, 0, lv ? 0.22 : 0.11, 0); B(1.9, 0.18, 2.4, 0xf2efe6, 0, lv ? 0.54 : 0.3, 0.05); B(1.9, 0.1, 1.5, acc, 0, lv ? 0.66 : 0.42, 0.45); B(0.8, 0.14, 0.4, 0xffffff, -0.45, lv ? 0.68 : 0.44, -0.9); B(0.8, 0.14, 0.4, 0xffffff, 0.45, lv ? 0.68 : 0.44, -0.9); if (lv) B(2.0, 1.0, 0.12, 0x5a4030, 0, 0.7, -1.3); if (lv > 1) for (let i = 0; i < 8; i++) glow([0xffd23f, 0xff3da8, 0x3dd6ff][i % 3], -0.9 + i * 0.26, 1.25, -1.28); }
    else if (s.id === 'kitchen') { B(2.8, 0.9, 0.7, 0xf2efe6, 0, 0.45, 0); B(2.8, 0.06, 0.74, 0x2a2a2e, 0, 0.92, 0); B(0.7, 1.8, 0.7, 0xdadde2, 1.75, 0.9, 0); if (lv) { B(0.6, 0.3, 0.4, 0x333333, -0.8, 1.1, 0); glow(0xff5a2a, -0.8, 1.28, 0.1); } if (lv > 1) { B(2.8, 0.7, 0.4, acc, 0, 2.0, -0.12); B(0.5, 0.25, 0.5, 0x8a5a3a, 0.3, 1.08, 0); } }
    else if (s.id === 'sofa') { const c = lv > 1 ? 0x5a2bb0 : lv ? 0x3a5a85 : 0x7a5a3a; B(2.2, 0.45, 0.9, c, 0, 0.32, 0.8); B(2.2, 0.6, 0.25, c, 0, 0.7, 1.15); B(0.25, 0.55, 0.9, c, -1.1, 0.45, 0.8); B(0.25, 0.55, 0.9, c, 1.1, 0.45, 0.8); B(lv ? 1.6 : 0.8, lv ? 0.9 : 0.65, lv ? 0.06 : 0.6, 0x111111, 0, lv ? 1.2 : 0.95, -1.0); B(lv ? 1.5 : 0.62, lv ? 0.8 : 0.48, 0.02, 0x2a6aff, 0, lv ? 1.2 : 0.97, lv ? -0.96 : -0.69, { e: 0x2a6aff, ei: 0.8 }); B(1.6, 0.5, 0.5, 0x3a2a1e, 0, 0.25, -1.0); if (lv > 1) { B(0.3, 1.1, 0.3, 0x111111, -1.2, 0.55, -1.0); B(0.3, 1.1, 0.3, 0x111111, 1.2, 0.55, -1.0); } }
    else if (s.id === 'records' || s.id === 'piano') {
      if (s.id === 'piano') { B(1.6, lv > 1 ? 1.1 : 0.12, lv > 1 ? 0.6 : 0.35, lv > 1 ? 0x111111 : 0x2a2a2e, 0, lv > 1 ? 0.55 : 0.8, 0); for (let i = 0; i < 14; i++) B(0.1, 0.03, 0.22, 0xffffff, -0.68 + i * 0.105, lv > 1 ? 1.12 : 0.87, 0.08); if (lv < 2) { B(0.06, 0.8, 0.06, 0x444444, -0.6, 0.4, 0); B(0.06, 0.8, 0.06, 0x444444, 0.6, 0.4, 0); } if (lv) glow(0xa46bff, 0, lv > 1 ? 1.3 : 0.95, -0.12); }
      else { B(1.0, 0.8, 0.5, 0x5a4030, 0, 0.4, 0); if (lv) { const p = W.cyl(0.28, 0.28, 0.03, M(0x111111), 0, 0.82, 0, g, 20); p.userData.spin = true; } else B(0.5, 0.3, 0.2, 0xd8342c, 0, 0.95, 0); if (lv > 1) { B(1.6, 0.12, 0.6, 0x111111, 0, 0.9, 0); glow(0xff3da8, -0.6, 0.98, 0.2); glow(0x3dd6ff, 0.6, 0.98, 0.2); } }
    }
    else if (s.id === 'desk') { B(1.6, 0.06, 0.8, 0x8a6a48, 0, 0.78, 0); [[-0.75, -0.35], [0.75, -0.35], [-0.75, 0.35], [0.75, 0.35]].forEach(([x, z]) => B(0.06, 0.78, 0.06, 0x5a4030, x, 0.39, z)); if (lv) { B(0.7, 0.45, 0.05, 0x111111, 0, 1.08, -0.25); B(0.64, 0.38, 0.02, 0x3dd6ff, 0, 1.08, -0.22, { e: 0x3dd6ff, ei: 0.6 }); } else B(0.5, 0.03, 0.35, 0xeeeeee, 0, 0.82, 0); if (lv > 1) { B(1.4, 0.9, 0.04, 0xc8a070, 0, 1.6, -0.42); for (let i = 0; i < 6; i++) B(0.18, 0.14, 0.01, [0xffd23f, 0xff8a1e, 0x3dd6ff][i % 3], -0.5 + (i % 3) * 0.5, 1.45 + Math.floor(i / 3) * 0.3, -0.39); } }
    else if (s.id === 'plant') { const n = lv + 1; for (let i = 0; i < n * 2; i++) { const x = (i % 3 - 1) * 0.5, z = Math.floor(i / 3) * 0.5 - 0.2; W.cyl(0.18, 0.14, 0.3, M(0xb5653a), x, 0.15, z, g, 10); const b = new T.Mesh(new T.SphereGeometry(0.28 + (i % 2) * 0.1, 10, 8), M(0x3f8f4a)); b.position.set(x, 0.55, z); g.add(b); } }
    else if (s.id === 'bench') { B(1.8, 0.08, 0.8, 0x7a5a3a, 0, 0.85, 0); B(1.7, 0.8, 0.7, 0x4a4c55, 0, 0.4, 0); for (let i = 0; i < 4 + lv * 3; i++) { const c = new T.Mesh(new T.TorusGeometry(0.14, 0.03, 6, 14), M([0xff8a1e, 0x3dd6ff, 0x111111, 0xd8342c][i % 4])); c.position.set(-0.7 + (i % 5) * 0.32, 0.95, -0.15 + Math.floor(i / 5) * 0.25); c.rotation.x = Math.PI / 2; g.add(c); } if (lv) { B(1.8, 0.9, 0.05, 0x8a8a8a, 0, 1.4, -0.42); } if (lv > 1) glow(0xff5a2a, 0.6, 1.0, 0.1); }
    g.traverse(o => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = true; } });
    return g;
  }

  HM.open = function (hid, onClose) {
    T = root.THREE; HM.close(true);
    const H = HOMES[hid], built = buildHome(hid), fig = W.hosts[hid];
    if (fig) { if (fig.root.parent) fig.root.parent.remove(fig.root); built.g.add(fig.root); fig.root.visible = true; fig.talk && fig.talk(false); }
    R = { kind: 'home', who: hid, sc: built.sc, g: built.g, objs: built.objs, onClose, busy: 0, t: 0 };
    const solids = () => H.slots.map(s => ({ x: s.x, z: s.z, r: s.id === 'bed' ? 1.3 : s.id === 'kitchen' ? 1.4 : s.id === 'sofa' ? 1.1 : 0.8 }));
    const spots = () => H.slots.map(s => ({ x: s.x, z: s.z, r: s.id === 'bed' || s.id === 'kitchen' ? 2.4 : 2.0, label: actLabel(s), run: () => act(s) })).concat([{ x: 5.4, z: 3, r: 1.6, label: '🚪 Raus in die Stadt', run: () => HM.close() }]);
    R.w = walker({ x: 2.5, z: 2.6, fig, bounds: { x0: -5.6, x1: 5.6, z0: -4.0, z1: 4.0 }, solids, spots });
    R.ui = hud(H.name, '<button type="button" class="btn small" id="hmBuild">🛋️ Einrichten</button>');
    R.ui.querySelector('#hmBuild').onclick = () => furnish(hid);
    drawNeeds();
    W.particles.attach(R.sc);
    AMC.Audio.sfx('door');
    const n = needs(hid);
    setTimeout(() => say(n.energy < 30 ? D.HOSTS[hid].name + ' ist todmüde. Ab ins Bett!' : n.hunger < 30 ? 'Magenknurren! Ab in die Küche.' : n.fun < 30 ? 'Langweilig … Zeit für Fernsehen oder Musik.' : 'Willkommen zu Hause! Am Schreibtisch kommen die verrücktesten Ideen.', 4200), 400);
  };
  function actLabel(s) {
    const L = s.lv[lvOf(R.who, s.id)][0];
    return ({ sleep: '😴 Schlafen', eat: '🍳 Essen machen', tv: '📺 Fernsehen', music: '🎹 Musik machen', desk: '💡 Ideen sammeln', tech: '🔧 Basteln', plant: '🌿 Pflanzen gießen' })[s.act] + ' · ' + L;
  }
  function act(s) {
    const hid = R.who, n = needs(hid), lv = lvOf(hid, s.id), k = 1 + lv * 0.5, f = W.hosts[hid], H = D.HOSTS[hid];
    R.busy = 1.6; R.w.busy = 1.6; if (f) { f.root.rotation.y = Math.atan2(s.x - R.w.x, s.z - R.w.z); }
    const play = a => { if (f) { f.play(a, { fade: 0.2 }); R.w.anim = a; } };
    const line = a => U.pick((LINES[a] && LINES[a][hid]) || ['Herrlich.']);
    if (s.act === 'sleep') { play('crouch'); flash(); n.energy = Math.min(100, n.energy + 60 * k); n.hunger = Math.max(0, n.hunger - 10); say('😴 ' + line('sleep')); AMC.Audio.sfx('swap'); }
    else if (s.act === 'eat') { play('knock'); n.hunger = Math.min(100, n.hunger + 40 * k); n.fun = Math.min(100, n.fun + 5); say('🍳 ' + line('eat')); AMC.Audio.sfx('collect'); W.particles.burst(s.x, 1.3, s.z, 0xff8a1e, 16, { speed: 2 }); }
    else if (s.act === 'tv') { play('yes'); n.fun = Math.min(100, n.fun + 35 * k); n.energy = Math.max(0, n.energy - 4); say('📺 ' + line('tv')); AMC.Audio.sfx('static'); }
    else if (s.act === 'plant') { play('knock'); n.fun = Math.min(100, n.fun + 15 * k); say('🌿 ' + line('plant')); W.particles.burst(s.x, 1, s.z, 0x40d070, 14, { speed: 2 }); }
    else if (s.act === 'tech') { play('knock'); n.energy = Math.max(0, n.energy - 6); n.fun = Math.min(100, n.fun + 20 * k); if ((n.ideas || []).length < 3 && Math.random() < 0.5 + lv * 0.2) { n.ideas.push('Technik-Trick aus der Werkbank'); say('🔧 ' + line('tech') + ' 💡 Neue Idee!'); } else say('🔧 ' + line('tech')); AMC.Audio.sfx('plug'); W.particles.burst(s.x, 1.1, s.z, 0x3dd6ff, 12, { speed: 3 }); }
    else if (s.act === 'music') {
      play('dance'); R.busy = R.w.busy = 6; n.fun = Math.min(100, n.fun + 30 * k);
      const pool = D.WISHES.concat(HM.ownedSongs()), w = U.pick(pool);
      say('🎹 ' + line('music') + ' – „' + w.t + '“', 6000);
      AMC.Audio.song(w.id).then(song => { if (song && R && R.who === hid) R.stopSong = AMC.Audio.playSong(song, { from: song.mel[0][0], sec: 6, vel: 0.65 }); });
      if ((n.ideas || []).length < 3 && Math.random() < 0.3 + lv * 0.15) n.ideas.push('Musikidee: „' + w.t + '“ im Remix');
    }
    else if (s.act === 'desk') {
      play('knock'); n.energy = Math.max(0, n.energy - 5);
      if ((n.ideas || []).length >= 3) say('💡 Der Kopf ist voll! Erst mal eine Folge aufnehmen und die Ideen loswerden.');
      else {
        const idea = U.pick(D.IDEAS.filter(x => x[0] === (hid === 'marco' ? 'm' : 'a'))) || U.pick(D.IDEAS);
        n.ideas.push(idea[1].split(/[.!?]/)[0].slice(0, 42));
        say('💡 ' + H.name + ': „' + idea[1] + '“', 5200); AMC.Audio.sfx('star'); W.particles.burst(R.w.x, 2.2, R.w.z, 0xffd23f, 22, { speed: 3 });
        if (lv >= 1 && Math.random() < 0.35 && (n.ideas || []).length < 3) n.ideas.push('Bonus-Idee vom ' + s.lv[lv][0]);
      }
    }
    Save.save(); drawNeeds();
    setTimeout(() => { if (R && R.who === hid && f) { f.play('idle', { fade: 0.3 }); R.w.anim = 'idle'; } }, R.busy * 1000);
  }
  function flash() { const f = U.el('div', 'hm-flash'); f.textContent = 'Zzz …'; document.body.appendChild(f); setTimeout(() => f.remove(), 1500); }

  // Einrichten: Plätze ausbauen (Fan-Punkte)
  function furnish(hid) {
    const H = HOMES[hid];
    const rows = () => H.slots.map(s => { const lv = lvOf(hid, s.id), nx = s.lv[lv + 1]; return '<button type="button" class="st-item" data-nav data-s="' + s.id + '"' + (nx && Save.data.fan >= nx[1] ? '' : ' aria-disabled="true"') + '><span class="st-ic">' + ['🛏️', '🍳', '📺', '🎶', '💡', '🌿', '🔧', '🎹'][['bed', 'kitchen', 'sofa', 'records', 'desk', 'plant', 'bench', 'piano'].indexOf(s.id)] + '</span><span><b>' + U.esc(s.lv[lv][0]) + ' ' + '★'.repeat(lv + 1) + '</b><small>' + (nx ? 'Ausbau: ' + U.esc(nx[0]) + ' · 🎟️ ' + nx[1] : 'Voll ausgebaut') + '</small></span></button>'; }).join('');
    const s = AMC.UI.open('<div class="panel glass wide"><header><h2>🛋️ ' + U.esc(H.name) + ' einrichten</h2><button class="btn small" data-nav id="fBack">' + AMC.glyph('b') + ' Zurück</button></header><p class="hint">🎟️ ' + U.fmt(Save.data.fan) + ' Fan-Punkte · Besser eingerichtet = Bedürfnisse füllen sich schneller, mehr Ideen.</p><div class="st-list" id="fList">' + rows() + '</div></div>', { back: () => AMC.UI.close(s) });
    s.el.querySelector('#fBack').onclick = () => AMC.UI.close(s);
    s.el.querySelector('#fList').addEventListener('click', e => {
      const b = e.target.closest('[data-s]'); if (!b) return;
      const sl = H.slots.find(x => x.id === b.dataset.s), lv = lvOf(hid, sl.id), nx = sl.lv[lv + 1];
      if (!nx) return; if (Save.data.fan < nx[1]) { AMC.Audio.sfx('miss'); AMC.UI.toast('Zu wenig Fan-Punkte – nimm Folgen auf oder erledige Besorgungen mit Gisela!'); return; }
      Save.data.fan -= nx[1]; Save.data.homes = Save.data.homes || {}; Save.data.homes[hid] = Save.data.homes[hid] || {}; Save.data.homes[hid][sl.id] = lv + 1; Save.save();
      AMC.Audio.sfx('buy'); AMC.UI.close(s);
      const i = H.slots.indexOf(sl), old = R.objs[i]; R.g.remove(old); const m = slotMesh(hid, sl, lv + 1); m.position.set(sl.x, 0, sl.z); R.g.add(m); R.objs[i] = m;
      W.particles.burst(sl.x, 1.5, sl.z, 0xffd23f, 40, { speed: 5 }); say('✨ Neu: ' + nx[0] + '!');
    });
  }

  // ------------------------------------------------------------------ Begehbares Studio
  HM._act = s => R && act(s);
  HM._state = () => R;
  HM.studio = function (o, onClose) {
    T = root.THREE; HM.close(true);
    const ST = AMC.Studio; ST.enter('walk'); if (AMC.StudioEdit) AMC.StudioEdit.apply();
    const hid = o.host || 'andrew', other = hid === 'andrew' ? 'marco' : 'andrew', fig = W.hosts[hid];
    // Partner wartet am Pult, Rico am Rand
    if (fig) { fig.root.position.set(0, 0, 4.4); fig.root.rotation.y = Math.PI; }
    R = { kind: 'studio', who: hid, sc: null, onClose, busy: 0, t: 0, actions: o.actions || {} };
    const items = () => (AMC.StudioEdit ? AMC.StudioEdit.data().items : []).map(it => { const def = AMC.StudioEdit.ITEMS.find(x => x.id === it.id); return { x: it.x, z: it.z, r: def ? Math.min(1.2, def.r) : 0.5 }; });
    const solids = () => [{ box: true, x0: -2.5, x1: 2.5, z0: -1.9, z1: 0.5 }].concat(items()).concat(W.hosts.rico ? [{ x: 2.45, z: -0.35, r: 0.4 }] : []);
    const spots = () => [
      { x: 0, z: 1.1, r: 1.6, label: '🎙️ Ans Pult: Live-Aufnahme starten', run: () => R.actions.live && R.actions.live() },
      { x: 2.45, z: 0.3, r: 1.4, label: '📱 Mit RicoReWi quatschen', run: ricoChat },
      { x: -5.6, z: 3.8, r: 1.8, label: '🛠️ Studio einrichten', run: () => R.actions.edit && R.actions.edit() },
      { x: 5.6, z: 3.8, r: 1.8, label: '🎹 Musikshop', run: () => HM.musicShop() },
      { x: -5.6, z: 0.6, r: 1.6, label: '🕹️ Arcade-Automat: 3D-Minispiele', run: () => R.actions.arcade && R.actions.arcade() },
      { x: 0, z: 5.4, r: 1.5, label: '🚪 Raus in die Stadt', run: () => R.actions.city && R.actions.city() }
    ];
    R.w = walker({ x: 0, z: 4.4, fig, bounds: { x0: -7, x1: 7, z0: -3.6, z1: 5.6 }, solids, spots, camOff: [0, 4.6, 5.6], noFigUpdate: true });
    R.ui = hud('🎙️ AnMaCha-Studio', '');
    U.$('hmNeeds').hidden = false; drawNeeds();
    const of = W.hosts[other]; if (of) of.play('yes');
    setTimeout(() => say(D.HOSTS[other].name + ': „Da bist du ja! Das Pult wartet. Und Rico hat schon wieder was geplant.“', 4200), 300);
    // Schilder an den Spots (schweben über dem Boden)
    R.marks = [[-5.6, 3.8, '🛠️'], [5.6, 3.8, '🎹'], [0, 5.4, '🚪'], [-5.6, 0.6, '🕹️']].map(([x, z, t]) => { const tx = W.textTex([t], { w: 128, h: 128, bg: '#14161f', size: 80, accent: '#ff8a1e' }); const s = new T.Sprite(new T.SpriteMaterial({ map: tx })); s.scale.set(0.42, 0.42, 1); s.position.set(x, 2.3, z); ST.group.add(s); return s; });
    // Arcade-Automat in der Ecke
    { const c = new T.Group(), Mt = (col, o) => W.mat(col, o || { r: 0.5 });
      W.box(0.9, 1.7, 0.8, Mt(0x2a1a4a), 0, 0.85, 0, c); W.box(0.92, 0.25, 0.82, Mt(0xff8a1e, { e: 0xff8a1e, ei: 0.6 }), 0, 1.82, 0, c);
      const scr = W.box(0.7, 0.5, 0.04, Mt(0x3dd6ff, { e: 0x3dd6ff, ei: 0.9 }), 0, 1.35, 0.41, c); scr.rotation.x = -0.15;
      W.box(0.8, 0.08, 0.3, Mt(0x111111), 0, 1.0, 0.5, c); W.cyl(0.05, 0.05, 0.15, Mt(0xd8342c), -0.2, 1.1, 0.5, c, 8);
      c.position.set(-6.3, 0, 0.6); c.rotation.y = Math.PI / 2; ST.group.add(c); R.marks.push(c); }
  };
  function ricoChat() {
    const r = W.hosts.rico; if (r) { r.play('arms', { fade: 0.2 }); setTimeout(() => r.play('idle', { fade: 0.4 }), 1800); }
    say('RicoReWi: „' + U.pick(D.RICO_LINES) + '“', 4600); AMC.Audio.sfx('talk');
  }

  // ------------------------------------------------------------------ Musikshop (Klavierlicht, gemeinfrei)
  let shopList = null;
  HM.ownedSongs = () => (Save.data.songs || []).map(s => ({ id: s.id, t: s.t, r: 'Gekauft im Musikshop – unbedingt spielen! 🎹' }));
  HM.musicShop = function () {
    const s = AMC.UI.open('<div class="panel glass wide"><header><h2>🎹 Musikshop</h2><button class="btn small" data-nav id="msBack">' + AMC.glyph('b') + ' Zurück</button></header><p class="hint">Freie Melodien aus Klavierlicht (gemeinfrei). Gekaufte Lieder wünschen sich die Hörer live, und sie laufen am Klavier zu Hause. 🎟️ <b id="msFan">' + U.fmt(Save.data.fan) + '</b></p><div class="st-list" id="msList"><p>Lade Lieder …</p></div></div>', { back: () => { stopPrev(); AMC.UI.close(s); } });
    let stopP = null; const stopPrev = () => { if (stopP) stopP(); stopP = null; };
    s.el.querySelector('#msBack').onclick = () => { stopPrev(); AMC.UI.close(s); };
    const render = list => {
      const own = new Set((Save.data.songs || []).map(x => x.id)), free = new Set(D.WISHES.map(x => x.id));
      s.el.querySelector('#msList').innerHTML = list.map(x => { const has = own.has(x.id) || free.has(x.id), cost = 60 + (x.diff || 2) * 30; return '<button type="button" class="st-item" data-nav data-id="' + x.id + '" data-cost="' + cost + '"><span class="st-ic">' + (has ? '✅' : '🎵') + '</span><span><b>' + U.esc(x.title) + '</b><small>' + U.esc(x.artist || '') + ' · ' + (has ? 'im Repertoire – antippen zum Anhören' : '🎟️ ' + cost + ' · antippen: anhören, nochmal: kaufen') + '</small></span></button>'; }).join('');
    };
    const load = shopList ? Promise.resolve(shopList) : fetch('../klavierlicht/archiv/index.json').then(r => r.json()).then(j => (shopList = (j.songs || []).filter(x => x.cat !== 'choral').slice(0, 60))).catch(() => (shopList = D.WISHES.map(w => ({ id: w.id, title: w.t, diff: 2 }))));
    load.then(list => { if (!s.closed) render(list); });
    let armed = null;
    s.el.querySelector('#msList').addEventListener('click', e => {
      const b = e.target.closest('[data-id]'); if (!b) return;
      const id = b.dataset.id, x = shopList.find(q => q.id === id), own = (Save.data.songs || []).some(q => q.id === id) || D.WISHES.some(q => q.id === id);
      stopPrev(); AMC.Audio.song(id).then(song => { if (song && !s.closed) stopP = AMC.Audio.playSong(song, { from: song.mel[0][0], sec: 7, vel: 0.6 }); });
      if (own) return;
      if (armed !== id) { armed = id; AMC.UI.toast('🎧 Hörprobe „' + x.title + '“ – nochmal antippen zum Kaufen'); return; }
      const cost = +b.dataset.cost; if (Save.data.fan < cost) { AMC.Audio.sfx('miss'); AMC.UI.toast('Zu wenig Fan-Punkte.'); return; }
      Save.data.fan -= cost; Save.data.songs = (Save.data.songs || []).concat({ id, t: x.title }); Save.save(); AMC.Audio.sfx('buy'); armed = null;
      AMC.UI.toast('✅ „' + x.title + '“ gehört jetzt zum Repertoire!'); s.el.querySelector('#msFan').textContent = U.fmt(Save.data.fan); render(shopList);
    });
  };

  // ------------------------------------------------------------------ Senderhäuser (Räume, Fans, Spiele in sender.js)
  const KIT = { begin: r => (R = r), alive: r => R === r, walker, hud, say, drawNeeds, needs, retitle: t => { const b = document.querySelector('#homeUi .hm-top b'); if (b) b.textContent = t; } };
  HM.SENDER = AMC.Sender.HOUSES;
  HM.SENDER_RUB = AMC.Sender.RUB;
  HM.senderVisited = () => Object.keys(Save.data.senders || {}).length;
  HM.camper = function (host, onClose) {
    T = root.THREE; HM.close(true);
    return AMC.Camper.open(host, KIT, onClose);
  };
  HM.station = function (slug, host, onClose) {
    T = root.THREE; HM.close(true);
    return AMC.Sender.open(slug, host, KIT, onClose);
  };

  // ------------------------------------------------------------------ Schleife
  HM.update = function (dt) {
    if (!R) return;
    R.t += dt; if (R.busy > 0) R.busy -= dt;
    if (R.tick && R.tick(dt)) { W.particles.update(dt); return; }
    if (!R) return;
    if (R.mini) { R.mini.ctl.update(dt); (R.figs || []).forEach(f => f.update(dt)); if (R.w.fig) R.w.fig.update(dt); return; }
    (R.figs || []).forEach(f => f.update(dt));
    if (!(R.busy > 0)) R.w.update(dt); else { if (R.sc && R.w.fig) R.w.fig.update(dt); const cam = W.camera; if (R.w.cp) { cam.position.copy(R.w.cp); cam.lookAt(R.w.ct); } }
    if (I.hit('act')) use();
    if (I.hit('back')) { HM.close(); return; }
    const s = R.w.near(), b = U.$('hmUse');
    if (b) { const txt = s ? AMC.glyph('x') + ' ' + s.label : ''; if (b.innerHTML !== txt) b.innerHTML = txt; b.hidden = !s; }
    if (R.sc) { R.g.traverse(o => { if (o.userData.spin) o.rotation.y += dt * (o.userData.spin === true ? 4 : o.userData.spin); }); W.particles.update(dt); }
    else { AMC.Studio.update(dt); }
  };
  HM.render = function () { if (!R) return; if (R.sc) W.renderer.render(R.sc, W.camera); else AMC.Studio.render(); };
  HM.active = () => !!R;
  HM.close = function (silent) {
    if (!R) return;
    const r = R; R = null;
    if (r.dispose) r.dispose();
    if (r.stopSong) r.stopSong();
    document.querySelectorAll('.hm-bub').forEach(e => e.remove());
    const ui = U.$('homeUi'); if (ui) ui.remove();
    if (r.marks) r.marks.forEach(m => AMC.Studio.group.remove(m));
    if (r.mini) { r.mini.ctl.destroy(); r.mini.box.remove(); }
    if (r.sc) { ['andrew', 'marco', 'rico'].forEach(id => { const f = W.hosts[id]; if (f && f.root.parent === r.g) r.g.remove(f.root); }); r.sc.traverse(o => { if (o.geometry && !o.isSkinnedMesh) o.geometry.dispose(); }); }
    if (!silent && r.onClose) r.onClose();
  };
})(typeof window !== 'undefined' ? window : globalThis);
