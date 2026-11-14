/* AnMaCha – Der Podcast: Fahren in der Stadt (Gisela und Autos), Verkehr, Besorgungen und Rangeleien.
   Ein Bedienkonzept: Stick/WASD lenken und Gas geben, Ⓐ/Leertaste hupen, Ⓑ/C Handbremse, Ⓧ/E aussteigen.
   Gisela fährt nur Marco – er fährt besonders achtsam. Andrew darf ihr allein nicht zu nahe kommen.
   Rangelei statt Kampf gegen Fantasiewesen: Kabeldiebe schnappen sich Studio-Kabel, man rangelt sie mit Ⓧ zu Boden. */
(function (root) {
  'use strict';
  const AMC = root.AMC = root.AMC || {};
  const U = AMC.U, I = AMC.Input, W = AMC.World, D = AMC.Data;
  const DR = AMC.Drive = {};
  let T, C;   // THREE, Kontext aus play.js

  const ERRANDS = [
    { x: 45, z: -30, name: 'Elektromarkt', what: 'Neue XLR-Kabel holen', m: 'Die guten Kabel. Nicht die vom Grabbeltisch, Andrew.', a: 'Ich hab doch nur EINMAL Lakritz-Kabel gekauft.' },
    { x: -45, z: 30, name: 'Imbiss am Ring', what: 'Pommes fürs Team', m: 'Imbisskind-Mission! Mayo UND Ketchup.', a: 'Gisela riecht danach drei Wochen nach Pommes.' },
    { x: 0, z: -62, name: 'Getränkemarkt', what: 'Kaffee für die Nachtsendung', m: 'Ohne Kaffee keine Podcastnacht.', a: 'Und Mate für Rico. Sonst plant er nur halb so schnell.' },
    { x: -30, z: 0, name: 'Festival im Park', what: 'Zum Podfluencer-Treffen fahren', event: true, m: 'Event! Gisela wird bestaunt werden.', a: 'Oder abgeschleppt. Mal sehen.' },
    { x: 62, z: 45, name: 'Campingplatz-Shop', what: 'Lichterkette für Gisela', m: 'Gisela braucht Glitzer. Sie hat es verdient.', a: 'Sie hat mehr Deko als mein Wohnzimmer.' },
    { x: -62, z: -45, name: 'Sendemast', what: 'Ersatzantenne bringen', m: 'Vorsichtig – die Antenne liegt hinten auf dem Bett.', a: 'Ich halte sie fest. Mit Gefühl.' },
    { x: 45, z: 62, name: 'Radio-Flohmarkt', what: 'Altes Röhrenradio abholen', event: true, m: 'Ein Grundig von 1962! Wie Gisela, nur kleiner.', a: 'Wo soll das hin? Gisela ist voll.' }
  ];
  const CRASH = ['Marco: GISELA! Alles gut, Schatz? Ich fahr jetzt ganz langsam.', 'Marco: Sorry, Gisela … das war der Bordstein, nicht ich.', 'Marco: Ich hab das Gefühl, sie ist jetzt beleidigt.', 'Marco: Atmen, Gisela. Atmen.'];
  const CARCRASH = ['Hoppla! Gut, dass das kein Dienstwagen ist.', 'Rumms! Die Versicherung hört bestimmt keinen Podcast.', 'Kurzer Kratzer. Erzählen wir in der nächsten Folge.'];
  const ANDREW_NO = ['Marco (von weitem): ANDREW! Finger weg von Gisela!', 'Gisela hupt empört. Andrew allein? Keine Chance.', 'Marco: Gisela lässt sich nicht von jedem anfassen. Schon gar nicht von dir.', 'Andrew: Ich wollte nur gucken! … Sie hat mich angehupt.'];
  const PED = ['Ey, pass doch auf!', 'Hupen kann ich auch!', 'Ist das Gisela?! Autogramm!', 'Langsam, ihr Radiomenschen!'];
  const RIVAL = ['Ihr habt mehr Hörer als ich! Das ist unfair!', 'Radio Funkloch war zuerst da! … Glaub ich.', 'Nicht die Frisur! Die hat 20 Minuten gedauert!', 'Okay, okay – eure Folgen sind gar nicht so schlecht.'];
  const THIEF = ['Die Kabel brauch ich für meinen eigenen Podcast!', 'Ich wollte doch nur den Sound ausleihen!', 'Lass los, das ist mein Kabelsalat!', 'Okay, okay! Ich geb’s zurück!'];

  DR.build = function (ctx) {
    T = root.THREE; C = ctx; const S = C.S;
    S.cars = []; S.traffic = []; S.drive = null; S.errand = null; S.thieves = [];
    // Gisela fahrbar machen (Box aus play.js)
    if (S.gisela) S.cars.push({ g: S.gisela.g, x: S.gisela.x, z: S.gisela.z, h: S.gisela.g.rotation.y, v: 0, gisela: true, box: S.col[S.col.length - 1], name: 'Gisela', max: 13, len: 2.3, wid: 1.1 });
    // Geparkte Autos am Straßenrand
    const rng = S.rng, cols = [0xd8342c, 0x2c6fd8, 0xf2f2f2, 0x2a2a2e, 0xffc12e, 0x37a35b];
    [[5.5, -60, 0], [-39.5, 10, Math.PI], [52, 5.5, Math.PI / 2], [-15, -39.5, -Math.PI / 2]].forEach(([x, z, h], i) => {
      const g = carMesh(cols[i % cols.length]); g.position.set(x, 0, z); g.rotation.y = h; S.group.add(g);
      const car = { g, x, z, h, v: 0, name: ['Kombi', 'Kleinwagen', 'Sportflitzer', 'Lieferwagen'][i], max: [20, 18, 26, 16][i], len: 2.1, wid: 1.0 };
      car.box = C.addBox(x - 1.4, x + 1.4, z - 1.4, z + 1.4, 1.4); car.box = S.col[S.col.length - 1]; S.cars.push(car);
    });
    // KayKit-Autos parken am Straßenrand – alle fahrbar
    if (W.models && W.models.kk_car_sedan) {
      const KK = [['kk_car_hatchback', 'Kompaktwagen', 19], ['kk_car_stationwagon', 'Kombi', 20], ['kk_car_sedan', 'Limousine', 22], ['kk_car_taxi', 'Taxi', 21], ['kk_car_police', 'Polizeiauto', 25]];
      let n = 0;
      for (let i = 0; i < 40 && n < [6, 9, 12][W.quality]; i++) {
        const r = C.ROADS[i % 3], ax = (i >> 1) % 2, sd = i % 4 < 2 ? 1 : -1, s = -80 + rng() * 160;
        if (C.ROADS.some(q => Math.abs(q - s) < 10) || S.cars.some(c => Math.hypot(c.x - (ax ? s : r + sd * 4.3), c.z - (ax ? r + sd * 4.3 : s)) < 7)) continue;
        const x = ax ? s : r + sd * 4.3, z = ax ? r + sd * 4.3 : s, h = ax ? (sd > 0 ? Math.PI / 2 : -Math.PI / 2) : (sd > 0 ? 0 : Math.PI), m = KK[n % KK.length];
        const g = W.prop(m[0], 4.3); if (!g) break; g.position.set(x, 0, z); g.rotation.y = h; S.group.add(g);
        const car = { g, x, z, h, v: 0, name: m[1], max: m[2], len: 2.1, wid: 0.95 };
        C.addBox(x - (ax ? 2.1 : 1), x + (ax ? 2.1 : 1), z - (ax ? 1 : 2.1), z + (ax ? 1 : 2.1), 1.4); car.box = S.col[S.col.length - 1]; S.cars.push(car); n++;
      }
    }
    // Verkehr: Autos fahren auf den Straßen hin und her
    const nT = [3, 5, 8][W.quality] || 4;
    for (let i = 0; i < nT; i++) {
      const road = C.ROADS[i % 3], axis = i % 2 ? 'x' : 'z', dir = i % 4 < 2 ? 1 : -1, s = -80 + rng() * 160;
      const TM = [['kk_car_sedan', 'Limousine'], ['taxi', 'Taxi'], ['kk_car_hatchback', 'Kompaktwagen'], ['van', 'Kleinbus'], ['kk_car_taxi', 'Taxi'], ['police_car', 'Polizeiauto'], ['kk_car_stationwagon', 'Kombi'], ['delivery_van', 'Lieferwagen']], tm = TM[i % TM.length];
      const g = (W.models && W.models[tm[0]] && W.prop(tm[0], 4.2)) || (W.models && W.models.sedan && W.prop('sedan', 4.2)) || carMesh(cols[Math.floor(rng() * cols.length)]); S.group.add(g);
      S.traffic.push({ g, road, axis, dir, s, v: 9 + rng() * 4, base: 9 + rng() * 4, stop: 0, name: tm[1] });
    }
    // Kabeldiebe (nur frei spielen und Themenjagd): echte Menschen, mit denen man rangelt
    if (S.mode === 'free' || S.mode === 'jagd') spawnThieves(S.mode === 'free' ? 3 : 2);
    if (S.mode === 'free') nextErrand(true);
  };

  function carMesh(color) {
    const g = new T.Group(), body = W.mat(color, { r: 0.35, m: 0.4 }), glass = W.mat(0x1d2a38, { r: 0.1, m: 0.5 }), dark = W.mat(0x161616, { r: 0.8 });
    W.box(1.8, 0.55, 4.0, body, 0, 0.62, 0, g); W.box(1.6, 0.5, 2.0, glass, 0, 1.12, -0.2, g); W.box(1.62, 0.08, 2.02, body, 0, 1.4, -0.2, g);
    [[-0.85, 1.25], [0.85, 1.25], [-0.85, -1.25], [0.85, -1.25]].forEach(([x, z]) => { const w = W.cyl(0.32, 0.32, 0.24, dark, x, 0.32, z, g, 14); w.rotation.z = Math.PI / 2; });
    [-0.6, 0.6].forEach(x => { W.box(0.3, 0.12, 0.04, W.mat(0xfff4c0, { e: 0xffe080, ei: 1 }), x, 0.7, 2.01, g, false); W.box(0.3, 0.1, 0.04, W.mat(0xff2a2a, { e: 0xff2020, ei: 0.8 }), x, 0.72, -2.01, g, false); });
    return g;
  }

  // ------------------------------------------------------------------ Kabeldiebe & Rangelei
  /** Gegenspieler nach dem Bosskampf: rangeln statt schießen */
  DR.spawnRival = async function (name, x, z, onDone) {
    const S = C.S, my = S;
    const fig = await AMC.People.make(W.kit, { body: 'm', skin: '#e9b896', hair: { style: 'short', color: '#222', vol: 1.2 }, brow: '#222', top: '#2a2f3a', topStyle: 'long', bottom: '#1d1d22', shoes: '#111', build: 1.1, belly: 0.6, hat: (S.ch && S.ch.season === 3) ? { type: 'crown', color: '#c0c4cc' } : { type: 'sunglasses', color: '#111' } }).catch(() => null);
    if (C.S !== my || !fig) { if (fig) fig.dispose(); if (!fig) onDone(); return; }
    fig.root.position.set(x, 0.16, z); S.group.add(fig.root);
    const th = { fig, x, y: 0.16, z, vx: 0, vy: 0, vz: 0, yaw: 0, onGround: true, anim: '', hp: 5, down: 0, done: false, t: 0, name, rival: true, onDone };
    th.mark = W.glow(0xff4040, 1.6, fig.root, 0, 2.4, 0);
    C.setAnim(th, 'arms'); S.thieves.push(th);
    W.particles.burst(x, 1.5, z, 0xff4040, 40, { speed: 6 }); AMC.Audio.sfx('boss');
  };
  async function spawnThieves(n) {
    const S = C.S, my = S;
    for (let i = 0; i < n; i++) {
      const fig = await W.makeFan(900 + i * 37 + Math.floor(S.rng() * 1000)).catch(() => null);
      if (C.S !== my) { if (fig) fig.dispose(); return; }
      if (!fig) continue;
      const [x, y, z] = C.freeSpot(S.rng, 12);
      fig.root.position.set(x, y, z); S.group.add(fig.root);
      const th = { fig, x, y, z, vx: 0, vy: 0, vz: 0, yaw: 0, onGround: true, anim: '', hp: 3, down: 0, done: false, t: 0, name: U.pick(['Kabel-Kalle', 'Stecker-Steffi', 'Klinken-Klaus', 'Adapter-Anja']) };
      th.mark = W.glow(0xff4040, 1.3, fig.root, 0, 2.35, 0);
      const tx = W.textTex(['🔌'], { w: 128, h: 128, bg: '#2a0f12', size: 84, accent: '#ff4040' });
      th.icon = new T.Sprite(new T.SpriteMaterial({ map: tx, depthTest: false })); th.icon.scale.set(0.5, 0.5, 1); th.icon.position.y = 2.35; fig.root.add(th.icon);
      C.setAnim(th, 'idle'); S.thieves.push(th);
    }
  }
  function updThieves(dt) {
    const S = C.S, p = S.pl;
    for (const th of S.thieves) {
      if (!th.fig) continue; th.fig.update(dt);
      if (th.done) { th.t += dt; if (th.t > 4) { S.group.remove(th.fig.root); th.fig.dispose(); th.fig = null; } continue; }
      if (th.down > 0) { th.down -= dt; if (th.down <= 0) C.setAnim(th, 'idle'); continue; }
      const dx = th.x - p.x, dz = th.z - p.z, d = Math.hypot(dx, dz);
      let wx = 0, wz = 0, sp = 0;
      if (d < 9 && !S.drive) { wx = dx / (d || 1); wz = dz / (d || 1); sp = th.rival ? 4.4 : 5.6; if (th.rival && Math.hypot(th.x + 22.5, th.z - 22.5) > 14) { wx = -wx; wz = -wz; } }   // flieht – Sprinten holt ihn ein
      else { th.t += dt; wx = Math.sin(th.t * 0.4 + th.x); wz = Math.cos(th.t * 0.33 + th.z); sp = 1.4; }
      const s = C.moveBody(th, dt, wx, wz, sp, 6);
      C.setAnim(th, s < 0.4 ? 'idle' : s < 3 ? 'walk' : 'jog');
      if (th.icon) th.icon.position.y = 2.35 + Math.sin(S.time * 4 + th.x) * 0.1;
    }
    S.thieves = S.thieves.filter(t => t.fig);
  }
  function scuffle(th) {
    const S = C.S, p = S.pl;
    p.busy = 0.45; C.setAnim(p, U.pick(['punch', 'push']), { once: true, restart: true, speed: 1.4 });
    p.yaw = Math.atan2(th.x - p.x, th.z - p.z); if (p.fig) p.fig.root.rotation.y = p.yaw;
    th.hp--; th.vx = Math.sin(p.yaw) * 7; th.vz = Math.cos(p.yaw) * 7; th.vy = 3; th.onGround = false;
    AMC.Audio.sfx('hit'); W.cam.shake = 0.25; W.particles.burst(th.x, th.y + 1.2, th.z, 0xffffff, 10, { speed: 4, life: 0.35 });
    if (th.hp > 0) { th.down = 0.35; C.setAnim(th, 'push', { once: true, restart: true }); C.msg('🤼 ' + th.name + ': „' + U.pick(th.rival ? RIVAL : THIEF) + '“', 2.2); return; }
    th.done = true; th.t = 0; C.setAnim(th, 'down', { once: true }); if (th.icon) th.icon.visible = false; if (th.mark) th.mark.visible = false;
    if (th.rival) { AMC.Audio.sfx('win'); W.particles.burst(th.x, th.y + 1.4, th.z, 0xffd23f, 60, { speed: 8 }); th.onDone && th.onDone(); return; }
    S.score += 400; S.kills = (S.kills || 0) + 1; S.got.tech = (S.got.tech || 0) + 2; C.drawRub && C.drawRub();
    AMC.Audio.sfx('perfect'); W.particles.burst(th.x, th.y + 1, th.z, 0xffd23f, 26);
    C.msg('🔌 Kabel zurück! ' + th.name + ' gibt auf. +400 · +2 Technik' + (p.H.id === 'marco' ? ' – Marco: „Und jetzt ordentlich aufrollen!“' : ' – Andrew: „War doch gar nicht so schlimm.“'), 3);
  }

  // ------------------------------------------------------------------ Besorgungen mit Gisela
  function nextErrand(first) {
    const S = C.S, last = S.errand ? S.errand.e : null;
    const e = U.pick(ERRANDS.filter(x => x !== last));
    if (S.errand && S.errand.g) S.group.remove(S.errand.g);
    const g = new T.Group(); g.position.set(e.x, 0, e.z); S.group.add(g);
    const ring = new T.Mesh(new T.TorusGeometry(3, 0.15, 8, 40), W.mat(e.event ? 0xff3da8 : 0xffd23f, { e: e.event ? 0xff3da8 : 0xffb000, ei: 1.4 })); ring.rotation.x = Math.PI / 2; ring.position.y = 0.2; g.add(ring);
    const col = new T.Mesh(new T.CylinderGeometry(0.4, 0.4, 30, 12, 1, true), new T.MeshBasicMaterial({ color: e.event ? 0xff3da8 : 0xffd23f, transparent: true, opacity: 0.25, depthWrite: false })); col.position.y = 15; g.add(col);
    S.errand = { e, g, ring };
    if (!first) C.msg('🚐 Neue Besorgung: ' + e.what + ' (' + e.name + ')', 3);
  }
  DR.errandText = () => { const S = C && C.S; if (!S || !S.errand) return ''; return (S.errand.e.event ? '🎪 Event: ' : '🚐 Besorgung: ') + S.errand.e.what + ' – ' + S.errand.e.name; };
  function updErrand(dt) {
    const S = C.S, E = S.errand; if (!E) return;
    E.ring.rotation.z += dt; E.g.position.y = Math.sin(S.time * 2) * 0.1;
    const car = S.drive;
    if (!car || !car.gisela) return;
    if (Math.hypot(car.x - E.e.x, car.z - E.e.z) < 4 && Math.abs(car.v) < 6) {
      const pts = Math.round((E.e.event ? 120 + (AMC.Camper && AMC.Camper.has('markise') ? 40 : 0) : 60) * (AMC.Camper ? AMC.Camper.errandBonus() : 1));
      AMC.Save.earn(pts);
      S.score += E.e.event ? 1200 : 600; S.errands = (S.errands || 0) + 1;
      AMC.Audio.sfx('horn'); AMC.Audio.sfx('perfect'); W.particles.burst(E.e.x, 2, E.e.z, E.e.event ? 0xff3da8 : 0xffd23f, 50, { speed: 7 });
      C.msg('✅ ' + E.e.name + ' erledigt! +' + pts + ' 🎟️ · Marco: „' + E.e.m + '“ · Andrew: „' + E.e.a + '“', 4.5);
      nextErrand();
    }
  }

  // ------------------------------------------------------------------ Einsteigen, Fahren, Aussteigen
  DR.interact = function (p) {
    const S = C && C.S; if (!S || !S.cars || S.drive || S.net) return null;
    for (const th of S.thieves) if (th.fig && !th.done && th.down < 0.15 && Math.hypot(th.x - p.x, th.z - p.z) < 2.3) return { label: 'Rangeln 🤼', run: () => scuffle(th) };
    for (const car of S.cars) {
      if (Math.hypot(car.x - p.x, car.z - p.z) > 3.4) continue;
      if (car.gisela && AMC.Play.onAction && AMC.Camper && (Math.sin(car.h) * (p.x - car.x) + Math.cos(car.h) * (p.z - car.z)) < -1.2) return { label: '🛠️ Gisela von innen: ' + (AMC.Camper.value() ? 'Ausbau ' + AMC.Camper.value() + '/' + AMC.Camper.UP.length : 'ausbauen'), run: () => { S.giselaAt = { x: car.x, z: car.z, h: car.h }; AMC.Save.data.giselaAt = S.giselaAt; AMC.Play.onAction('camper'); } };
      if (car.gisela && p.H.id !== 'marco') return { label: 'Marco ans Steuer von Gisela 🚐', run: () => { C.swapHost('marco'); setTimeout(() => C.S && enter(car), 250); } };
      return { label: (car.gisela ? 'Mit Gisela fahren 🚐' : 'Einsteigen: ' + car.name + ' 🚗'), run: () => enter(car) };
    }
    return null;
  };
  /** Nachrangig (nach Orten und Figuren): jedes haltende Auto lässt sich leihen (Stadtverkehr und Welten) */
  DR.borrowTarget = function (p) {
    const S = C && C.S; if (!S || !S.cars || S.drive || S.net) return null;
    const t = S.traffic.find(t => t.v < 3 && Math.hypot(t.g.position.x - p.x, t.g.position.z - p.z) < 3.6);
    if (t) return { label: 'Auto leihen: ' + t.name + ' 🚗', run: () => borrow(t.g, t.name, () => { S.traffic.splice(S.traffic.indexOf(t), 1); }) };
    const w = AMC.WorldFX && AMC.WorldFX.nearCar && AMC.WorldFX.nearCar(p.x, p.z, 3.6);
    if (w) return { label: 'Auto leihen: ' + w.name + ' 🚗', run: () => { if (AMC.WorldFX.take(w)) borrow(w.g, w.name); } };
    return null;
  };
  const LEND = ['Fahrer: „Na gut – aber bringt ihn heil zurück!“', 'Fahrerin: „Ihr seid doch die vom Podcast! Klar, fahrt ’ne Runde.“', 'Fahrer: „Nur wenn ich in der nächsten Folge gegrüßt werde.“', 'Fahrerin: „Tank ist voll. Hupe funktioniert. Viel Spaß!“'];
  function borrow(g, name, done) {
    const S = C.S; done && done();
    const car = { g, x: g.position.x, z: g.position.z, h: g.rotation.y, v: 0, name, max: /Polizei/.test(name) ? 24 : /Liefer|Bus|Van/.test(name) ? 16 : 20, len: 2.1, wid: 1.0, lent: true };
    S.cars.push(car); C.msg('🔑 ' + U.pick(LEND), 2.6); enter(car);
  }
  function enter(car) {
    const S = C.S, p = S.pl; if (S.drive) return;
    S.drive = car; car.v = 0; car.cool = 0.4;
    const i = S.col.indexOf(car.box); if (i >= 0) S.col.splice(i, 1);
    [p, S.fo].forEach(e => { if (e && e.fig) e.fig.root.visible = false; });
    W.cam.dist0 = W.cam.dist; W.cam.dist = car.gisela ? 10 : 9;
    AMC.Audio.sfx(car.gisela ? 'horn' : 'door');
    const k = I.device === 'pad' ? ['Ⓐ', 'Ⓑ', 'Ⓧ'] : I.device === 'touch' ? ['Springen', 'Ausweichen', 'Welle'] : ['Leertaste', 'C', 'E'];
    C.msg((car.gisela ? '🚐 Marco fährt Gisela – ganz achtsam. ' : '🚗 ' + car.name + ' – ') + 'Lenken mit dem Stick, ' + k[0] + ' hupt, ' + k[1] + ' bremst, ' + k[2] + ' steigt aus.', 3.4);
  }
  function exit() {
    const S = C.S, car = S.drive, p = S.pl; if (!car) return;
    S.drive = null; car.v = 0;
    const sx = Math.cos(car.h), sz = -Math.sin(car.h);   // links neben der Tür
    p.x = car.x + sx * 1.9; p.z = car.z + sz * 1.9; p.y = 0.16; p.vx = p.vz = p.vy = 0;
    if (C.solidAt(p.x, 1, p.z)) { p.x = car.x - sx * 1.9; p.z = car.z - sz * 1.9; }
    if (S.fo) { S.fo.x = p.x - sz * 1.4; S.fo.z = p.z + sx * 1.4; S.fo.y = 0.16; }
    [p, S.fo].forEach(e => { if (e && e.fig) { e.fig.root.visible = true; e.fig.root.position.set(e.x, e.y, e.z); } });
    const c = Math.cos(car.h), s = Math.sin(car.h), xs = [], zs = [];
    [[-car.wid, -car.len], [car.wid, -car.len], [-car.wid, car.len], [car.wid, car.len]].forEach(([a, b]) => { xs.push(car.x + a * c + b * s); zs.push(car.z - a * s + b * c); });
    C.addBox(Math.min(...xs) + 0.3, Math.max(...xs) - 0.3, Math.min(...zs) + 0.3, Math.max(...zs) - 0.3, car.gisela ? 2.1 : 1.4); car.box = S.col[S.col.length - 1];
    if (car.gisela) { S.gisela.x = car.x; S.gisela.z = car.z; }
    if (W.cam.dist0) W.cam.dist = W.cam.dist0;
    AMC.Audio.sfx('door');
  }
  /** true = Fahren übernimmt diesen Frame (play.js überspringt das Laufen) */
  DR.update = function (dt) {
    const S = C && C.S; if (!S || !S.cars) return false;
    updTraffic(dt); updThieves(dt); updErrand(dt); andrewGuard();
    const car = S.drive; if (!car) return false;
    const p = S.pl;
    [p, S.fo].forEach(e => { if (e && e.fig) e.fig.root.visible = false; });
    if (car.cool > 0) car.cool -= dt;
    if (I.hit('act') && car.cool <= 0) { car.leave = true; if (Math.abs(car.v) > 3) C.msg('Bremsen … und aussteigen.', 1.2); }
    if (car.leave && Math.abs(car.v) < 3) { car.leave = false; exit(); return true; }
    if (I.hit('jump')) { if (car.gisela && C.honk && !(C.S.gisela.t > 0)) C.honk(); else AMC.Audio.sfx('horn'); honkPeds(car); }
    // Gas/Bremse: Stick/WASD oder Trigger (RT Gas, LT Bremse/rückwärts) – Rückwärts klappt immer
    const rt = padVal(7), lt = padVal(6);
    const thr = car.leave ? 0 : U.clamp(I.move.y + rt - lt, -1, 1), steer = I.move.x, hb = I.keys.has('KeyC') || I.keys.has('ShiftRight') || C.padHeld(1) || AMC.UI.touchHeld('b') || AMC.UI.touchHeld('dodge');
    const max = car.max * (I.sprint && !car.gisela ? 1.25 : 1), rev = car.gisela ? 5 : 8;
    if (thr > 0.05) car.v += thr * (car.gisela ? 7 : 11) * dt * (car.v < -0.3 ? 3 : 1);
    else if (thr < -0.05) car.v += thr * (car.v > 0.3 ? 16 : 7) * dt;
    else car.v = U.damp(car.v, 0, 1.4, dt);
    if (hb || car.leave) car.v = U.damp(car.v, 0, 4, dt);
    car.v = U.clamp(car.v, -rev, max);
    // Lenken: auch langsam und im Stand ein wenig, damit man aus jeder Ecke herauskommt
    const sp = Math.abs(car.v), turn = steer * (car.gisela ? 1.6 : 2.2) * Math.max(Math.abs(thr) > 0.05 ? 0.35 : 0, Math.min(1, sp / 4)) * (car.v < -0.1 || (sp < 0.3 && thr < -0.05) ? -1 : 1) * (hb ? 1.5 : 1);
    const h0 = car.h, h1 = car.h - turn * dt;
    const fx = Math.sin(h1), fz = Math.cos(h1);
    let nx = car.x + fx * car.v * dt, nz = car.z + fz * car.v * dt, nh = h1;
    const was = blocked(car, car.x, car.z, h0);
    const tNear = (x, z) => S.traffic.find(t => Math.hypot(t.g.position.x - x, t.g.position.z - z) < 3.2 && Math.hypot(t.g.position.x - x, t.g.position.z - z) < Math.hypot(t.g.position.x - car.x, t.g.position.z - car.z) - 0.001);
    const bad = (x, z, h) => (!was && blocked(car, x, z, h)) || (was && blocked(car, x, z, h) > was) || tNear(x, z);
    if (bad(nx, nz, nh)) {
      // an Wänden entlang rutschen statt hängen zu bleiben
      if (!bad(nx, car.z, nh)) nz = car.z;
      else if (!bad(car.x, nz, nh)) nx = car.x;
      else if (!bad(car.x, car.z, nh)) { nx = car.x; nz = car.z; }
      else { nx = car.x; nz = car.z; nh = h0; }
      const tHit = tNear(car.x + fx * car.v * dt, car.z + fz * car.v * dt);
      if (nx === car.x && nz === car.z) { crash(car, sp); car.v *= -0.25; if (tHit) tHit.stop = 1.2; }
      else car.v *= 0.85;
    }
    // Rettung: hängt man über 1,5 s fest, setzt Gisela/das Auto auf die letzte freie Stelle zurück
    car.stuck = (Math.abs(thr) > 0.3 && Math.hypot(nx - car.x, nz - car.z) < 0.02 * Math.max(1, sp)) ? (car.stuck || 0) + dt : 0;
    if (car.trail && car.stuck > 1.5) {
      const back = car.trail[0]; car.stuck = 0; car.v = 0;
      if (back) { nx = back.x; nz = back.z; nh = back.h; C.msg('🔧 Freigefahren – zurück auf die Straße.', 1.6); }
    }
    car.h = nh;
    car.trail = car.trail || [];
    if (!blocked(car, nx, nz, nh) && (!car.trailT || S.time > car.trailT)) { car.trailT = S.time + 0.5; car.trail.push({ x: nx, z: nz, h: nh }); if (car.trail.length > 6) car.trail.shift(); }
    car.x = nx; car.z = nz;
    car.g.position.set(car.x, Math.abs(car.v) > 1 ? Math.abs(Math.sin(S.time * 14)) * 0.025 : 0, car.z); car.g.rotation.y = car.h;
    car.g.rotation.z = U.damp(car.g.rotation.z || 0, -steer * Math.min(1, Math.abs(car.v) / 12) * 0.05, 6, dt);
    if (car.gisela) { S.gisela.x = car.x; S.gisela.z = car.z; }
    // Spieler fährt mit
    p.x = car.x; p.z = car.z; p.y = 0.16; p.yaw = car.h; S.dist = (S.dist || 0) + Math.abs(car.v) * dt;
    if (S.fo) { S.fo.x = car.x; S.fo.z = car.z; S.fo.y = 0.16; }
    pushPeds(car);
    // Kamera schwenkt hinter das Fahrzeug, solange nicht selbst gedreht wird
    if (Math.abs(I.look.x) < 0.001 && Math.abs(car.v) > 2) W.cam.yaw += U.angDiff(W.cam.yaw, car.h + Math.PI) * Math.min(1, dt * 2.2);
    if (car.gisela && car.v > 11 && Math.random() < dt * 0.25) C.msg('Marco: Nicht so schnell, Gisela ist keine 20 mehr!', 2);
    return true;
  };
  function padVal(b) { const ps = I.pads ? I.pads() : []; const x = ps[0] && ps[0].buttons[b]; return x ? (x.value > 0.08 ? x.value : (x.pressed ? 1 : 0)) : 0; }
  /** Anzahl blockierter Messpunkte rund um das Fahrzeug (0 = frei) */
  function blocked(car, x, z, h) {
    const S = C.S, fx = Math.sin(h), fz = Math.cos(h), rx = Math.cos(h), rz = -Math.sin(h); let n = 0;
    for (const [a, b] of [[0, 1], [0.9, 1], [-0.9, 1], [0, -1], [0.9, -1], [-0.9, -1], [1, 0], [-1, 0]]) {
      const px = x + fx * car.len * b + rx * car.wid * a, pz = z + fz * car.len * b + rz * car.wid * a;
      if (C.solidAt(px, 0.8, pz)) n++;
    }
    if (S.areas && AMC.Worlds ? !AMC.Worlds.inside(x, z, 1.5) : Math.abs(x) > 88 || Math.abs(z) > 88) n += 4;
    return n;
  }
  DR.driving = () => !!(C && C.S && C.S.drive);
  function crash(car, v) {
    if (v < 3 || car.crashT > C.S.time) return;
    car.crashT = C.S.time + 0.8;
    AMC.Audio.sfx('hit'); W.cam.shake = Math.min(0.8, v / 20);
    W.particles.burst(car.x + Math.sin(car.h) * car.len, 1, car.z + Math.cos(car.h) * car.len, 0xcccccc, 14, { speed: 3 });
    if (car.gisela) { C.S.giselaBumps = (C.S.giselaBumps || 0) + 1; C.msg(U.pick(CRASH), 2.6); }
    else C.msg(U.pick(CARCRASH), 2);
  }
  function honkPeds(car) {
    for (const n of C.S.npcs) if (n.fig && Math.hypot(n.x - car.x, n.z - car.z) < 10) { n.fig.root.rotation.y = Math.atan2(car.x - n.x, car.z - n.z); C.setAnim(n, car.gisela ? 'yes' : 'arms'); setTimeout(() => n.fig && C.setAnim(n, 'idle'), 1400); }
  }
  function pushPeds(car) {
    for (const n of C.S.npcs) {
      if (!n.fig || n.follow) continue;
      const dx = n.x - car.x, dz = n.z - car.z, d = Math.hypot(dx, dz);
      if (d < 2.6 && Math.abs(car.v) > 2) {   // springt zur Seite – niemand wird angefahren
        n.x += dx / (d || 1) * 1.6; n.z += dz / (d || 1) * 1.6; n.fig.root.position.set(n.x, n.y, n.z);
        if (!(n.pedT > C.S.time)) { n.pedT = C.S.time + 3; C.msg('🗣️ ' + n.name + ': „' + U.pick(PED) + '“', 1.8); car.v *= 0.6; }
      }
    }
  }
  // Andrew allein an Gisela? Gisela hupt empört, Andrew wird zurückgeschubst
  function andrewGuard() {
    const S = C.S, p = S.pl, g = S.gisela; if (!g || S.drive || S.net || p.H.id !== 'andrew') return;
    const d = Math.hypot(p.x - g.x, p.z - g.z), fd = S.fo ? Math.hypot(S.fo.x - g.x, S.fo.z - g.z) : 99;
    if (d < 2.9 && fd > 5 && !(S.guardT > S.time)) {
      S.guardT = S.time + 2.5; const dx = (p.x - g.x) / (d || 1), dz = (p.z - g.z) / (d || 1);
      p.vx = dx * 12; p.vz = dz * 12; p.vy = 5; p.onGround = false;
      AMC.Audio.sfx('horn'); W.particles.burst(g.x, 2.4, g.z, 0xff4040, 16); C.msg(U.pick(ANDREW_NO), 2.6);
    }
  }
  // ------------------------------------------------------------------ Verkehr
  function updTraffic(dt) {
    const S = C.S, p = S.pl, me = S.drive;
    for (const t of S.traffic) {
      const lane = t.road + t.dir * 2.6, ax = t.axis === 'x';
      const x = ax ? t.s : lane, z = ax ? lane : t.s;
      // anhalten vor Spieler, Fahrzeug oder Fußgängern
      const ahead = (ex, ez) => { const dx = ex - x, dz = ez - z, along = ax ? dx * t.dir : dz * t.dir, side = ax ? Math.abs(dz) : Math.abs(dx); return along > 0 && along < 9 && side < 2.6; };
      const block = ahead(p.x, p.z) || (me && ahead(me.x, me.z)) || S.traffic.some(o => o !== t && ahead(o.g.position.x, o.g.position.z));
      if (t.stop > 0) t.stop -= dt;
      t.v = U.damp(t.v, block || t.stop > 0 ? 0 : t.base, block ? 6 : 1.5, dt);
      if (block && t.v < 1 && !(t.honkT > S.time) && Math.hypot(p.x - x, p.z - z) < 7) { t.honkT = S.time + 4; AMC.Audio.sfx('horn'); }
      t.s += t.dir * t.v * dt;
      if (t.s > 88) t.s = -88; if (t.s < -88) t.s = 88;
      t.g.position.set(ax ? t.s : lane, 0, ax ? lane : t.s);
      t.g.rotation.y = ax ? (t.dir > 0 ? Math.PI / 2 : -Math.PI / 2) : (t.dir > 0 ? 0 : Math.PI);
      // zu Fuß angestoßen? kleiner Schubs statt Schaden
      if (!me && Math.hypot(p.x - t.g.position.x, p.z - t.g.position.z) < 1.9 && t.v > 3) { p.vx = (ax ? 0 : Math.sign(p.x - lane)) * 8; p.vz = (ax ? Math.sign(p.z - lane) : 0) * 8; p.vy = 4; p.onGround = false; t.stop = 1.5; }
    }
  }
  DR.mapDots = () => { const S = C && C.S; if (!S || !S.cars) return []; return S.cars.map(c => ({ x: c.x, z: c.z, c: c.gisela ? '#3aa7a0' : '#ddd' })).concat(S.errand ? [{ x: S.errand.e.x, z: S.errand.e.z, c: S.errand.e.event ? '#ff3da8' : '#ffd23f', big: true }] : []).concat(S.thieves.filter(t => t.fig && !t.done).map(t => ({ x: t.x, z: t.z, c: '#ff4040' }))); };
  DR.stop = function () {
    const S = C && C.S; if (!S) return;
    (S.thieves || []).forEach(t => { if (t.fig) { t.fig.dispose(); t.fig = null; } });
    if (W.cam.dist0) { W.cam.dist = W.cam.dist0; W.cam.dist0 = 0; }
  };
})(typeof window !== 'undefined' ? window : globalThis);
