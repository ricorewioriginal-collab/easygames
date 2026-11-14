/* AnMaCha – Der Podcast · Mehrere Welten ohne Ladebruch: Die Medienstadt liegt am Wasser, drumherum drei weitere Welten.
   🚢 Medienhafen (Osten, über die Brücke) · 🎪 Festival-Insel (Süden, mit der Fähre) · 📡 Funkturm-Berg (Norden, über den Damm).
   Alles in einer Szene: laufen, mit Gisela fahren, Bus oder Fähre nehmen. Jede Welt hat eigene Orte mit Aktionen. */
(function (root) {
  'use strict';
  const AMC = root.AMC, U = AMC.U, W = AMC.World, D = AMC.Data, Save = AMC.Save;
  const WO = AMC.Worlds = {};
  // begehbare Flächen (Stadt, Verbindungen, Welten)
  const CITY = { x0: -89, x1: 89, z0: -89, z1: 89 };
  const LINKS = [
    { id: 'bruecke', x0: 86, x1: 131, z0: -4.6, z1: 4.6 },          // Brücke zum Hafen
    { id: 'westbr', x0: -131, x1: -86, z0: -4.6, z1: 4.6 },         // Brücke ins RicoReWi-Universum
    { id: 'damm', x0: 40.5, x1: 49.5, z0: -133, z1: -86 },           // Damm zum Berg
    { id: 'steg', x0: -4, x1: 4, z0: 86, z1: 104 },                  // Fähranleger Stadt
    { id: 'steg2', x0: -4, x1: 4, z0: 122, z1: 139 },                // Fähranleger Insel
    { id: 'autobahn', x0: 212, x1: 302, z0: -5, z1: 5 }              // Autobahn vom Hafen nach Wellenburg (Gisela-Roadtrip)
  ];
  const WORLDS = [
    { id: 'hafen', name: '🚢 Medienhafen', x0: 128, x1: 214, z0: -44, z1: 44, col: 0x8a8f99 },
    { id: 'insel', name: '🎪 Festival-Insel', x0: -62, x1: 62, z0: 136, z1: 214, col: 0xd8c48a },
    { id: 'berg', name: '📡 Funkturm-Berg', x0: -10, x1: 100, z0: -212, z1: -130, col: 0x6f8f55 },
    { id: 'rico', name: '✳️ RicoReWi-Universum', x0: -214, x1: -128, z0: -44, z1: 44, col: 0x2a2440 },
    { id: 'wellen', name: '📻 Wellenburg', x0: 300, x1: 430, z0: -70, z1: 70, col: 0x8d8a82, far: true }
  ];
  WO.WORLDS = WORLDS; WO.LINKS = LINKS;
  const AREAS = [CITY].concat(LINKS, WORLDS);
  const inR = (r, x, z, m) => x >= r.x0 + (m || 0) && x <= r.x1 - (m || 0) && z >= r.z0 + (m || 0) && z <= r.z1 - (m || 0);
  WO.inside = (x, z, m) => AREAS.some(r => inR(r, x, z, m));
  WO.name = (x, z) => { const w = WORLDS.find(r => inR(r, x, z)); return w ? w.name : inR(CITY, x, z) ? null : '🌉 Unterwegs'; };
  // Figur in die nächste begehbare Fläche schieben
  WO.clamp = function (e) {
    if (C && C.S && C.S.ferry && e === C.S.pl) return;
    if (WO.inside(e.x, e.z)) return;
    let best = null, bd = 1e9;
    for (const r of AREAS) { const x = U.clamp(e.x, r.x0, r.x1), z = U.clamp(e.z, r.z0, r.z1), d = (x - e.x) ** 2 + (z - e.z) ** 2; if (d < bd) { bd = d; best = [x, z]; } }
    e.x = best[0]; e.z = best[1];
  };
  // freier Platz in einer Welt (für Fans und Funken)
  WO.spot = function (rng, solidAt) {
    for (let k = 0; k < 30; k++) {
      const w = WORLDS[Math.floor(rng() * (WORLDS.length - 1))], x = U.lerp(w.x0 + 4, w.x1 - 4, rng()), z = U.lerp(w.z0 + 4, w.z1 - 4, rng());
      if (!solidAt(x, 0.6, z) && !solidAt(x + 0.8, 0.6, z) && !solidAt(x, 0.6, z + 0.8)) return [x, 0.12, z];
    }
    return null;
  };
  // Bushaltestellen in den Welten (Linie 1 fährt über Brücke, Damm und Inselfähre)
  if (AMC.Transit) AMC.Transit.STOPS.push(
    { id: 'hafen', name: 'Medienhafen', x: 140, z: 8, d: 'Kanal 9, Druckerei und Funk-Leuchtturm' },
    { id: 'insel', name: 'Festival-Insel', x: 10, z: 146, d: 'Hauptbühne, Riesenrad und Merch' },
    { id: 'berg', name: 'Funkturm-Berg', x: 52, z: -140, d: 'Fernsehturm, Radio-Museum und Funkerhütte' },
    { id: 'rico', name: 'RicoReWi-Universum', x: -140, z: 8, d: 'Musik-Arena, Radioportal, Bücher, Casting und Werkstatt' }
  );

  // ------------------------------------------------------------------ Aufbau
  let C = null, T = null, V = null;
  WO.edges = function (g, mat) {
    // Kaimauer rund um die Stadt mit Lücken für Brücke, Damm und Anleger
    const H = 91, seg = (a, b, fixed, horiz) => { if (b - a < 0.5) return; const m = (a + b) / 2, L = b - a; if (horiz) W.box(L, 1.0, 2, mat, m, 0.5, fixed, g); else W.box(2, 1.0, L, mat, fixed, 0.5, m, g); };
    seg(-92, 40, -H, true); seg(50, 92, -H, true);       // Norden (Damm bei x 40–50)
    seg(-92, -4.5, H, true); seg(4.5, 92, H, true);      // Süden (Anleger bei x 0)
    seg(-92, -5, -H, false); seg(5, 92, -H, false);     // Westen (Brücke ins RicoReWi-Universum bei z 0)
    seg(-92, -5, H, false); seg(5, 92, H, false);       // Osten (Brücke bei z 0)
  };
  WO.build = function (ctx) {
    C = ctx; T = root.THREE; const S = C.S; if (!S || S.mode !== 'free' || S.net) return;
    S.areas = true; V = { S, ferry: null, mini: null, cur: null };
    const g = S.group, M = (c, o) => W.mat(c, o || { r: 0.7 });
    const B = (w, h, d, c, x, y, z, solid, o) => { const m = W.box(w, h, d, M(c, o), x, y, z, g, true); if (solid) C.addBox(x - w / 2, x + w / 2, z - d / 2, z + d / 2, y + h / 2, y - h / 2); return m; };
    // Schild von beiden Seiten lesbar (Rückseite eigene Fläche statt gespiegelter Schrift)
    const sign = (txt, x, y, z, w, ry, acc) => { const t = W.textTex(txt, { w: 1024, h: 256, size: 108, accent: acc || '#ff8a1e' }), mat = new T.MeshBasicMaterial({ map: t, toneMapped: false }), geo = new T.PlaneGeometry(w, w / 4);
      const m = new T.Group(), f = new T.Mesh(geo, mat), b = new T.Mesh(geo, mat); b.rotation.y = Math.PI; b.position.z = -0.03; m.add(f, b); m.position.set(x, y, z); m.rotation.y = ry || 0; g.add(m); return m; };
    // Wasser rund um die Stadt
    const water = new T.MeshStandardMaterial({ color: W.lin(0x1d5f8f), roughness: 0.25, metalness: 0.15, transparent: true, opacity: 0.92 });
    [[0, -171, 500, 158], [0, 171, 500, 158], [-171, 0, 158, 184], [171, 0, 158, 184]].forEach(([x, z, w, d]) => { const p = new T.Mesh(new T.PlaneGeometry(w, d), water); p.rotation.x = -Math.PI / 2; p.position.set(x, 0.04, z); g.add(p); });
    V.water = water;
    // Land der Welten und Verbindungen
    WORLDS.forEach(w => { const s = B(w.x1 - w.x0, 0.24, w.z1 - w.z0, w.col, (w.x0 + w.x1) / 2, 0, (w.z0 + w.z1) / 2, false); s.castShadow = false; C.addBox(w.x0, w.x1, w.z0, w.z1, 0.12); });
    // Brücke (Straße mit Geländer und Bögen)
    B(45, 0.3, 9.6, 0x4a4d55, 108.5, 0.06, 0, false); C.addBox(86, 131, -4.6, 4.6, 0.12);
    [-4.7, 4.7].forEach(z => { B(45, 0.9, 0.2, 0xd8dde6, 108.5, 0.7, z, false); for (let i = 0; i < 4; i++) { const a = W.cyl(0.3, 0.3, 7, M(0xff8a1e), 92 + i * 11.5, 3.6, z, g, 8); a.castShadow = false; } });
    B(45, 0.3, 0.6, 0xff8a1e, 108.5, 7.2, -4.7); B(45, 0.3, 0.6, 0xff8a1e, 108.5, 7.2, 4.7);
    // Brücke West ins RicoReWi-Universum (Neonbögen)
    B(45, 0.3, 9.6, 0x2a2a34, -108.5, 0.06, 0, false); C.addBox(-131, -86, -4.6, 4.6, 0.12);
    [-4.7, 4.7].forEach(z => { B(45, 0.9, 0.2, 0xa46bff, -108.5, 0.7, z, false); for (let i = 0; i < 4; i++) W.cyl(0.25, 0.25, 7, M(0xff3da8, { e: 0xff3da8, ei: 0.8 }), -92 - i * 11.5, 3.6, z, g, 8).castShadow = false; });
    B(45, 0.3, 9.8, 0xffd45a, -108.5, 7.2, 0, false);
    sign(['✳️ RicoReWi-Universum ←'], -92, 5.2, 0, 6, Math.PI / 2, '#ffd45a');
    sign(['🚢 Medienhafen →'], 92, 5.2, 0, 6, -Math.PI / 2, '#3dd6ff');
    // Damm zum Berg
    B(9, 0.3, 47, 0x6a6e76, 45, 0.06, -109.5, false); C.addBox(40.5, 49.5, -133, -86, 0.12);
    [40.3, 49.7].forEach(x => B(0.25, 0.8, 47, 0xd8dde6, x, 0.6, -109.5, false));
    sign(['📡 Funkturm-Berg ↑'], 45, 4, -90, 6, 0, '#6cff8a');
    // Anleger
    [[95, 18], [130.5, 17]].forEach(([z, d]) => { B(8, 0.3, d, 0x8a6a48, 0, 0.06, z, false); C.addBox(-4, 4, z - d / 2, z + d / 2, 0.12); });
    sign(['⛴️ Fähre zur Festival-Insel'], 0, 4, 90, 6, 0, '#ffd23f');
    C.addStation('ferry:hin', '⛴️ Fähre zur Festival-Insel', 0, 100, 3);
    C.addStation('ferry:rueck', '⛴️ Fähre zurück in die Stadt', 0, 126, 3);
    // Fährschiff
    const boat = new T.Group(); W.box(6, 1.2, 10, M(0xffffff, { r: 0.5 }), 0, 0.4, 0, boat, true); W.box(6.2, 0.3, 10.2, M(0x3aa7a0), 0, 1.1, 0, boat, true);
    W.box(3, 1.6, 3, M(0xff8a1e, { r: 0.5 }), 0, 2.0, -2.5, boat, true); W.box(2.6, 0.6, 0.05, M(0x223344, { r: 0.1, m: 0.4 }), 0, 2.3, -0.98, boat, false);
    boat.position.set(0, 0, 109); g.add(boat); V.boat = boat;

    // --- Medienhafen: TV-Studios, Druckerei, Container, Kräne, Leuchtturm
    B(28, 12, 20, 0x2b3448, 158, 6, -26, true); sign(['📺 KANAL 9 · Studios'], 158, 9, -15.9, 14, 0, '#3dd6ff');
    B(6, 4, 0.2, 0x111111, 158, 2, -15.9, false); C.addStation('world:kanal9', '📺 Kanal 9 Studios betreten', 158, -13, 3.2);
    B(22, 9, 16, 0x7a5a48, 192, 4.5, -28, true); sign(['🗞️ Druckerei Morgenpost'], 192, 7, -19.9, 12, 0, '#ffd23f'); C.addStation('world:druck', '🗞️ Druckerei besuchen', 192, -17, 3);
    for (let i = 0; i < 14; i++) { const cx = 145 + (i % 7) * 6.5, cz = 22 + Math.floor(i / 7) * 3.2, h = 2.6 * (1 + (i % 3 === 0 ? 1 : 0)); B(6, h, 2.6, [0xc0392b, 0x2980b9, 0x27ae60, 0xf39c12][i % 4], cx, h / 2 + 0.12, cz, true); }
    [[184, 30], [200, 14]].forEach(([x, z]) => { B(1.2, 18, 1.2, 0xffc93a, x, 9, z, true); B(14, 1, 1, 0xffc93a, x - 5, 18, z, false); B(0.1, 6, 0.1, 0x333333, x - 10, 14.5, z, false); });
    B(5, 22, 5, 0xffffff, 208, 11, 38, true); B(5.4, 3, 5.4, 0xd03030, 208, 23.5, 38, false); const beam = W.glow(0xffe08a, 6, g, 208, 25.5, 38); V.beacon = beam;
    sign(['🗼 Funk-Leuchtturm'], 208, 6, 35.4, 6, 0, '#ff6a6a'); C.addStation('world:leucht', '🗼 Funk-Leuchtturm', 206, 33, 3);
    // --- RicoReWi-Universum: Musik-Arena mit 10 Acts, Radioportal-Turm, Bücherei, Casting-Bühne, Werkstatt, TikTok-Studio
    const ACTS = [['Giftkind', '#7a2bd8'], ['Love United', '#ff3da8'], ['RicoReWi', '#ffd45a'], ['ModeReWi', '#3dd6ff'], ['Slytheris', '#2ecc71'], ['Straßenkind', '#ff8a1e'], ['KAPITÄN KATER', '#4a90e2'], ['XXXPLICIT', '#e74c3c'], ['MIMBALO', '#f1c40f'], ['AERUMA', '#9b59b6']];
    B(30, 10, 14, 0x181428, -185, 5, -26, true); sign(['🎵 RicoReWi Music Arena'], -185, 8.6, -18.9, 16, 0, '#ffd45a'); C.addStation('world:arena', '🎵 Music Arena: 10 Acts', -185, -16, 3.2);
    ACTS.forEach(([n, c], i) => { const x = -206 + i * 4.6, z = -17.5; B(0.12, 3, 0.12, 0x333333, x, 1.6, z + 0.3, false); sign([n], x, 3.2, z, 4, 0, c); });
    B(6, 30, 6, 0x221a3a, -150, 15, -30, true); const dish = new T.Mesh(new T.SphereGeometry(3.2, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), M(0xffd45a, { m: 0.6, r: 0.3 })); dish.position.set(-150, 30.2, -30); g.add(dish);
    V.ricoGlow = W.glow(0xffd45a, 5, g, -150, 34, -30); sign(['📻 RicoReWi × AnMaCha Radioportal'], -150, 6, -26.9, 9, 0, '#ffd45a'); C.addStation('world:portal', '📻 Radioportal: alle Streams', -150, -24.5, 3);
    B(14, 6, 10, 0x6a4a2a, -200, 3, 24, true); sign(['📚 Geschichten, die bleiben'], -200, 5, 18.9, 9, 0, '#ff8a1e'); C.addStation('world:buecher', '📚 RicoReWi-Bücherei', -200, 16.5, 3);
    B(16, 1.2, 9, 0x111111, -168, 0.6, 30, true); B(16, 6, 0.4, 0x2a1840, -168, 3.6, 34.3, true); sign(['★ SHOW ME YOUR VOICE ★'], -168, 7.2, 34, 12, Math.PI, '#ff3da8'); C.addStation('world:casting', '★ Show me your Voice: Casting', -168, 23.5, 3.2);
    B(10, 5, 8, 0x3a3f4a, -140, 2.5, 30, true); sign(['⌘ Builder-Werkstatt'], -140, 4.2, 25.9, 7, 0, '#3dd6ff'); C.addStation('world:werkstatt', '⌘ Werkstatt: Games & Apps', -140, 23.5, 2.8);
    B(6, 4, 6, 0x111111, -205, 2, -2, true); sign(['📱 LIVE-Studio'], -201.9, 3.4, -2, 5, Math.PI / 2, '#ff3da8'); C.addStation('world:tiktok', '📱 Live-Studio: auf Sendung gehen', -199.5, -2, 2.6);
    sign(['„Ich habe nicht zu viele Ideen.', 'Die Welt hat nur zu wenig Tabs offen.“'], -165, 4.5, 2, 12, Math.PI / 2, '#ffd45a');
    for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2; W.glow([0xffd45a, 0xff3da8, 0x3dd6ff, 0xa46bff][i % 4], 1.4, g, -171 + Math.cos(a) * 30, 6 + (i % 3), Math.sin(a) * 30); }
    // --- Festival-Insel: Hauptbühne, Riesenrad, Merch, Zelte
    B(30, 1.4, 14, 0x222228, 0, 0.7, 196, true); B(30, 0.4, 0.4, 0x888888, 0, 12, 190, false); [-15, 15].forEach(x => B(0.5, 12, 0.5, 0x888888, x, 6, 190, false));
    const led = new T.Mesh(new T.PlaneGeometry(22, 8), new T.MeshBasicMaterial({ color: 0xff3da8, toneMapped: false })); led.position.set(0, 7, 202.8); led.rotation.y = Math.PI; g.add(led); V.led = led; B(24, 10, 0.6, 0x111111, 0, 6, 203.3, true);
    sign(['🎤 AnMaCha Radio-Festival'], 0, 12.8, 189.6, 16, Math.PI, '#ff3da8'); C.addStation('world:buehne', '🎤 Auftritt auf der Hauptbühne', 0, 186, 3.5);
    const wheel = new T.Group(); wheel.position.set(-40, 13, 170); g.add(wheel); V.wheel = wheel;
    const rim = new T.Mesh(new T.TorusGeometry(10, 0.3, 8, 40), M(0xffffff, { m: 0.5, r: 0.3 })); wheel.add(rim);
    for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; const sp = W.box(0.15, 10, 0.15, M(0xcccccc), Math.cos(a) * 5, Math.sin(a) * 5, 0, wheel, false); sp.rotation.z = a + Math.PI / 2; const cab = W.box(1.4, 1.4, 1.4, M([0xff3da8, 0x3dd6ff, 0xffd23f, 0x6cff8a][i % 4]), Math.cos(a) * 10, Math.sin(a) * 10 - 1, 0, wheel, false); cab.userData.cab = true; }
    [-2, 2].forEach(z => { const l = W.box(0.5, 14, 0.5, M(0x888888), -40, 6, 170 + z, g, true); l.rotation.x = z > 0 ? 0.15 : -0.15; }); C.addBox(-41, -39, 168, 172, 14);
    C.addStation('world:riesenrad', '🎡 Riesenrad fahren', -40, 160, 3.2);
    B(6, 3, 4, 0x6a3aa8, 35, 1.62, 165, true); sign(['👕 Merch-Stand'], 35, 3.8, 162.9, 5, 0, '#a46bff'); C.addStation('world:merch', '👕 Merch-Stand', 35, 160.5, 2.6);
    for (let i = 0; i < 6; i++) { const x = -50 + i * 20, z = 150 + (i % 2) * 40; if (Math.abs(x) < 16 && z > 180) continue; const t = new T.Mesh(new T.ConeGeometry(3, 3, 4), M([0xffffff, 0xff8a1e, 0x3aa7a0][i % 3])); t.position.set(x, 1.6, z); t.rotation.y = Math.PI / 4; g.add(t); C.addBox(x - 2, x + 2, z - 2, z + 2, 3.1); }
    // --- Funkturm-Berg: Felsen, Fernsehturm, Museum, Funkerhütte
    [[-30, -230, 40, 30], [30, -240, 50, 40], [90, -232, 36, 28], [120, -190, 30, 34]].forEach(([x, z, r, h]) => { const m = new T.Mesh(new T.ConeGeometry(r, h, 7), M(0x5b6b4a, { r: 0.95 })); m.position.set(x, h / 2, z); g.add(m); });
    const tw = W.cyl(1.8, 3, 60, M(0xdddddd, { r: 0.5 }), 45, 30, -175, g, 16); tw.castShadow = true; C.addBox(42, 48, -178, -172, 60);
    const ball = new T.Mesh(new T.SphereGeometry(6, 20, 14), M(0xc0c6d0, { m: 0.6, r: 0.25 })); ball.position.set(45, 48, -175); g.add(ball);
    W.cyl(0.25, 0.25, 22, M(0xd03030), 45, 71, -175, g, 8); V.towerLight = W.glow(0xff3030, 3, g, 45, 82, -175);
    sign(['📡 Fernsehturm · Aussicht'], 45, 5, -170.8, 8, 0, '#6cff8a'); C.addStation('world:turm', '📡 Hoch auf den Fernsehturm', 45, -168, 3);
    B(20, 7, 12, 0x9a7a5a, 10, 3.5, -150, true); sign(['📻 Radio-Museum'], 10, 6, -143.9, 10, 0, '#ffd23f'); C.addStation('world:museum', '📻 Radio-Museum', 10, -141.5, 3);
    B(7, 4, 6, 0x6a4a32, 82, 2, -150, true); B(0.15, 14, 0.15, 0x888888, 86, 7, -152, false); sign(['📶 Funkerhütte'], 82, 4.6, -146.9, 5, 0, '#3dd6ff'); C.addStation('world:funker', '📶 Funkerhütte', 82, -144.5, 2.6);
    // --- Gisela-Roadtrip: Autobahn übers Wasser und Land, dahinter die zweite Stadt Wellenburg
    { const land = new T.Mesh(new T.PlaneGeometry(230, 320), M(0x5f9a45, { r: 0.95 })); land.rotation.x = -Math.PI / 2; land.position.set(365, 0.02, 0); land.receiveShadow = true; g.add(land); }
    B(90, 0.3, 10, 0x3a3d44, 257, 0.06, 0, false); C.addBox(212, 302, -5, 5, 0.12);
    [-5.1, 5.1].forEach(z => B(90, 0.8, 0.25, 0xd8dde6, 257, 0.6, z, false));
    for (let x = 218; x < 252; x += 8) B(1.2, 1, 6, 0x9aa0a8, x, -0.4, 0, false);
    for (let x = 216; x < 300; x += 6) B(2.4, 0.02, 0.2, M(0xffffff, { r: 0.6 }), x, 0.22, 0, false);
    sign(['🚐 A1 → Wellenburg · 90 m'], 214, 5, -6.5, 7, -Math.PI / 2, '#ffd23f'); sign(['🏙️ ← Medienstadt'], 298, 5, 6.5, 6, Math.PI / 2, '#3dd6ff');
    B(10, 3.4, 7, 0xf2f2f2, 272, 1.7, 16, true); B(12, 0.4, 9, 0xd03030, 272, 3.6, 16, false); sign(['⛽ Raststätte Funkpause'], 272, 4.8, 12.4, 7, 0, '#ff6a6a');
    // Wellenburg: Messe, Konkurrenz-Sender, Camping, Plattenladen
    B(40, 11, 20, 0x5a6b8a, 395, 5.5, -40, true); sign(['📻 RADIO-MESSE WELLENBURG'], 395, 9, -29.9, 20, 0, '#3dd6ff'); C.addStation('world:messe', '📻 Radio-Messe besuchen', 395, -27, 3.2);
    B(18, 8, 16, 0x1d1d24, 335, 4, -40, true); W.cyl(0.3, 0.5, 26, M(0x666666), 340, 21, -44, g, 8); V.funkGlow = W.glow(0xff3030, 3, g, 340, 34, -44);
    sign(['🏴‍☠️ Radio Funkloch'], 335, 6.4, -31.9, 9, 0, '#ff3a3a'); C.addStation('world:funkloch', '🏴‍☠️ Radio Funkloch (Ralf Rauschmann)', 335, -29.5, 3);
    [[322, 30, 30, 0.2], [348, 30, 30, 0.2]].forEach(([x, z, d]) => B(0.2, 1, d, 0x8a6a48, x, 0.6, z + 10, false)); sign(['🏕️ Camping Wellenburg'], 335, 3.4, 26, 7, 0, '#6cff8a'); C.addStation('world:camping', '🏕️ Camping: Nacht mit Gisela', 335, 28, 3);
    B(14, 5, 10, 0x6a3a5a, 400, 2.5, 35, true); sign(['💿 Plattenladen Rille'], 400, 4.3, 29.9, 8, 0, '#ff3da8'); C.addStation('world:platten', '💿 Plattenladen Rille', 400, 27.5, 2.8);
    sign(['📻 Willkommen in Wellenburg', 'Partnerstadt der Medienstadt'], 304, 5, -8, 9, -Math.PI / 2, '#ffd23f');
  };

  // ------------------------------------------------------------------ Bewegung: Riesenrad, Leuchtturm, Fähre
  WO.update = function (dt) {
    const S = C && C.S; if (!V || V.S !== S) return;
    const t = performance.now() / 1000;
    if (V.wheel) { V.wheel.rotation.z += dt * 0.12; V.wheel.children.forEach(c => { if (c.userData.cab) c.rotation.z = -V.wheel.rotation.z; }); }
    if (V.led) V.led.material.color.setHSL((t * 0.08) % 1, 0.9, 0.55);
    if (V.beacon) V.beacon.material.opacity = 0.5 + Math.sin(t * 3) * 0.5;
    if (V.water && V.water.map) V.water.map.offset.x = t * 0.01;
    const f = V.ferry, p = S.pl;
    if (f) {
      f.t = Math.min(1, f.t + dt / 6); const k = f.t < 0.5 ? 2 * f.t * f.t : 1 - (-2 * f.t + 2) ** 2 / 2, z = f.z0 + (f.z1 - f.z0) * k;
      V.boat.position.z = z; p.x = 0; p.z = z + (f.z1 > f.z0 ? 2.5 : -2.5); p.y = 1.25; p.vx = p.vz = p.vy = 0; p.onGround = true; p.busy = 0.2; if (S.fo) { S.fo.x = 1.5; S.fo.z = p.z - 1.5; S.fo.y = 1.25; }
      if (f.t >= 1) { V.ferry = null; S.ferry = false; p.z = f.z1 > f.z0 ? 128 : 100; p.y = 0.2; p.busy = 0; C.msg(f.z1 > f.z0 ? '🎪 Willkommen auf der Festival-Insel!' : '🏙️ Zurück in der Medienstadt', 2.4); }
    } else { const home = 109 + Math.sin(t * 0.6) * 0.3; V.boat.position.z = home; }
    V.boat.position.y = Math.sin(t * 1.4) * 0.08;
    if (V.funkGlow) V.funkGlow.material.opacity = 0.4 + Math.abs(Math.sin(t * 2)) * 0.6;
    // Gisela-Roadtrip: mit Gisela nach Wellenburg fahren
    const car = S.drive; if (car && car.gisela && car.x > 302 && !V.trip) { V.trip = true; roadtrip(S); }
  };
  function roadtrip(S) {
    const t = today(), r = Save.data.roadtrip = Save.data.roadtrip || { n: 0 }; if (t.roadtrip) return; t.roadtrip = 1; r.n++; Save.save();
    if (AMC.Career) AMC.Career.mark('tour'); if (AMC.Events) AMC.Events.mark('tour');
    const first = r.n === 1, f = Save.earn(first ? 200 : 40); if (first) idea('Roadtrip-Folge aus Wellenburg');
    if (AMC.Feed) AMC.Feed.post('🚐', 'Roadtrip mit Gisela nach Wellenburg! Wer ist auch hier? 📻', 'story');
    const msg = () => AMC.UI.toast('🚐 Roadtrip nach Wellenburg' + (first ? ' – zum ersten Mal!' : '') + ' +' + f + ' 🎟️ · heute +10 % Hörer (Roadtrip-Folge)', 4600);
    if (first && AMC.Cut) AMC.Cut.play([{ cam: [318, 10, 18], to: [330, 7, 10], look: [365, 4, -10], dur: 8, lines: [
      ['marco', 'Wellenburg! Gisela, du hast es geschafft – ganz ohne Panne.'], ['andrew', 'Hier ist die Radio-Messe … und da drüben: Radio Funkloch. Ralf Rauschmann sendet von hier!'],
      ['marco', 'Dann machen wir hier die beste Roadtrip-Folge aller Zeiten.'], ['gisela', 'Tröööt!']]}], msg); else msg();
  }
  WO.ferry = function (id) {
    const S = C && C.S; if (!V || V.ferry) return;
    const hin = id === 'ferry:hin';
    V.ferry = { t: 0, z0: hin ? 104 : 118, z1: hin ? 118 : 104 }; S.ferry = true;
    if (AMC.Career) AMC.Career.mark('tour'); AMC.Audio.sfx('horn');
    C.msg(hin ? '⛴️ Leinen los! Kurs auf die Festival-Insel' : '⛴️ Zurück in die Stadt', 2.2);
  };
  // Minispiel mitten in der Welt (Stadt pausiert, Kamera bleibt)
  WO.play = (kind, o, cb) => { if (V && !V.mini) mini(kind, o, cb); };
  WO.busy = () => !!(V && V.mini);
  WO.tick = function (dt) { if (!V || !V.mini) return false; V.mini.ctl.update(dt); return true; };
  function mini(kind, o, cb) {
    const box = U.el('div', 'sh-mini wm-mini'); document.body.appendChild(box); AMC.UI.showTouch(false); AMC.Input.dpadEmotes = false;
    V.mini = { box, ctl: AMC.Minis.start(box, kind, o, q => { const m = V && V.mini; if (!m) return; m.ctl.destroy(); box.remove(); V.mini = null; AMC.UI.showTouch(true); if (AMC.CityVibe && AMC.CityVibe.state()) AMC.Input.dpadEmotes = true; cb(q); }) };
    box.classList.add('wm-mini');
  }
  WO.stop = function () { if (V && V.mini) { V.mini.ctl.destroy(); V.mini.box.remove(); } V = null; };

  // ------------------------------------------------------------------ Orte der Welten
  const today = () => { const c = AMC.Career ? AMC.Career.state() : { today: {} }; c.today.places = c.today.places || {}; return c.today.places; };
  const funken = (rub, n) => { const S = C.S; if (S && S.got) S.got[rub] = (S.got[rub] || 0) + n; if (C.drawRub) C.drawRub(); };
  const both = (k, v) => AMC.Home && ['andrew', 'marco'].forEach(id => { const n = AMC.Home.needs(id); n[k] = Math.max(0, Math.min(100, n[k] + v)); });
  const idea = txt => { const n = AMC.Home && AMC.Home.needs(C.S.pl.H.id); if (!n || (n.ideas || []).length >= 3) return false; n.ideas.push(txt); return true; };
  const abos = k => { const c = AMC.Career && AMC.Career.state(), a = Math.round(10 + (c ? c.abos : 100) * k); if (c) c.abos += a; return a; };
  // Museums-Quiz: [Frage, richtige Antwort, drei falsche]
  const QUIZ = [
    ['Wofür steht UKW?', 'Ultrakurzwelle', 'Unterhaltungs-Kanal-Welle', 'Universal-Kabel-Weg', 'Umschalt-Kurz-Wahl'],
    ['Wann lief in Deutschland die erste offizielle Radiosendung?', '1923', '1899', '1949', '1968'],
    ['Woraus ist das Wort „Podcast“ entstanden?', 'iPod + Broadcast', 'Pod-Kapsel + Cast', 'Podium + Castle', 'Postkarte + Cast'],
    ['Auf welchem Frequenzbereich sendet UKW-Radio in Deutschland?', '87,5 bis 108 MHz', '10 bis 20 kHz', '2,4 GHz', '500 bis 600 MHz'],
    ['Wofür steht DAB?', 'Digital Audio Broadcasting', 'Deutscher Antennen-Bund', 'Direkt Auf Band', 'Digitales Abend-Brot'],
    ['Wer gilt als Pionier der drahtlosen Funktelegrafie?', 'Guglielmo Marconi', 'Thomas Edison', 'Konrad Zuse', 'Alexander von Humboldt'],
    ['Was ist ein Jingle?', 'Kurze Erkennungsmelodie', 'Ein Mikrofon-Typ', 'Ein Störgeräusch', 'Die Sendezeit-Uhr'],
    ['In welcher Einheit misst man eine Frequenz?', 'Hertz', 'Watt', 'Dezibel', 'Ohm'],
    ['Wie heißen die beiden Hosts von AnMaCha?', 'Andrew und Marco', 'Anna und Mareike', 'Anton und Max', 'Andi und Chris'],
    ['Wie heißt der Camper von Andrew und Marco?', 'Gisela', 'Gertrud', 'Helga', 'Brigitte']
  ];
  const PLACES = {
    kanal9: ['📺 Kanal 9 Studios', 'Das große TV-Haus im Hafen.', [
      ['🎙️ Gast in der Morgenshow', () => { const a = abos(0.04); funken('tv', 4); return '📺 Live im Fernsehen! +' + a + ' Abos, +4 TV-Funken'; }],
      ['🎥 Kamerafrau für einen Tag (Minispiel)', q => { const f = Save.earn(15 + Math.round(q * 45)); funken('tv', 1 + Math.round(q * 3)); return (q >= 0.75 ? '🎥 Die Regie will euch fest anstellen!' : q >= 0.4 ? '🎥 Ordentliche Bilder.' : '🎥 Viel Wackelkamera …') + ' +' + f + ' 🎟️'; }, 'frame', { title: '🎥 Kanal 9: Kamera 2', subj: ['🎙️', '💃', '🧑‍🍳', '🦜'], shots: 4 }],
      ['🎬 Kulissen-Tour', () => { both('fun', 25); return '🎬 Pappwände, echte Kameras – beide sind begeistert.'; }]]],
    druck: ['🗞️ Druckerei Morgenpost', 'Hier wird die Zeitung von morgen gedruckt.', [
      ['📰 Druckfrische Ausgabe lesen', () => { funken('serious', 3); return '📰 Exklusiv vor allen anderen gelesen! +3 Ernst-Funken' + (idea('Schlagzeile von morgen') ? ' · 💡 Idee' : ''); }],
      ['🗞️ An der Druckmaschine helfen (Minispiel)', q => { const f = Save.earn(10 + Math.round(q * 40)); funken('serious', 1 + Math.round(q * 3)); return (q >= 0.75 ? '🗞️ Keine Zeitung ging verloren!' : '🗞️ Ein paar Blätter fliegen durch die Halle.') + ' +' + f + ' 🎟️'; }, 'catch', { title: '🗞️ Druckerei: Zeitungen fangen', good: ['📰', '📰', '🗞️', '⭐'], bad: ['🔥', '💣'], basket: '📥' }]]],
    leucht: ['🗼 Funk-Leuchtturm', 'Ein alter Leuchtturm mit eigener Funkstation.', [
      ['📡 Grüße übers Meer funken (Minispiel)', q => { funken('feel', 1 + Math.round(q * 3)); const f = Save.earn(10 + Math.round(q * 30)); return (q >= 0.6 ? '📡 Ein Fischkutter funkt zurück: „Wir hören euch!“' : '📡 Nur Rauschen kommt zurück.') + ' +' + f + ' 🎟️'; }, 'simon', { title: '📡 Funksignale nachsenden', rounds: 3, len: 3 }]]],
    buehne: ['🎤 Festival-Hauptbühne', 'Tausende Fans warten. Spiel ein Lied im Takt!', [
      ['🎸 Live-Auftritt (Rhythmus)', null, 'stage']]],
    riesenrad: ['🎡 Riesenrad', 'Der beste Blick über Insel, Stadt und Hafen.', [
      ['🎡 Eine Runde fahren und Fotos machen', q => { both('fun', 30); both('energy', 5); funken('feel', 1 + Math.round(q * 3)); const f = Save.earn(10 + Math.round(q * 30)); return '🎡 Ganz oben sieht man den Funkturm!' + (q >= 0.75 ? ' Die Fotos gehen viral.' : '') + ' +' + f + ' 🎟️'; }, 'frame', { title: '🎡 Fotos aus der Gondel', subj: ['🕊️', '🎈', '🪁'], shots: 3 }]]],
    merch: ['👕 Merch-Stand', 'AnMaCha-Shirts, Tassen und Sticker.', [
      ['👕 Merch-Kanone: Shirts fangen und verteilen', q => { const f = Save.earn(15 + Math.round(q * 30) + Math.round((AMC.Career ? AMC.Career.state().abos : 100) / 200)); return (q >= 0.75 ? '👕 Ausverkauft!' : '👕 Ein paar Shirts landen im Matsch.') + ' +' + f + ' 🎟️'; }, 'catch', { title: '👕 Merch-Kanone', good: ['👕', '🧢', '☕', '🎧'], bad: ['🌧️', '💣'], basket: '📦' }]]],
    turm: ['📡 Fernsehturm', '220 Meter hoch, ganz oben ein Café mit Aussicht.', [
      ['🌄 Aussicht genießen', () => { both('energy', 15); funken('feel', 3); return '🌄 Die ganze Medienstadt liegt euch zu Füßen. +3 Feelgood-Funken'; }],
      ['🔌 Sendeleitung im Turm stecken (Minispiel)', q => { funken('tech', 1 + Math.round(q * 3)); const f = Save.earn(10 + Math.round(q * 40)); return (q >= 0.75 ? '🔌 Sendung läuft in HD!' : '🔌 Bild flackert noch ein bisschen.') + ' +' + f + ' 🎟️'; }, 'cables', { title: '🔌 Fernsehturm: Sendeleitung', n: 4 }]]],
    museum: ['📻 Radio-Museum', 'Röhrenradios, Volksempfänger und die erste Piratensender-Antenne.', [
      ['🏛️ Ausstellung ansehen', () => { funken('tech', 3); return '📻 Radio-Geschichte zum Anfassen. +3 Technik-Funken' + (idea('Radio-Geschichte: vom Volksempfänger zum Podcast') ? ' · 💡 Idee' : ''); }],
      ['❓ Museums-Quiz (Minispiel)', q => { funken('serious', 1 + Math.round(q * 3)); const f = Save.earn(10 + Math.round(q * 50)); return (q >= 1 ? '❓ Alles richtig – ihr bekommt die goldene Röhre!' : q >= 0.5 ? '❓ Gut mitgedacht!' : '❓ Da hilft nur: nochmal reinhören.') + ' +' + f + ' 🎟️'; }, 'quiz', { title: '❓ Radio-Museum: Quiz', n: 4, qs: QUIZ }]]],
    arena: ['🎵 RicoReWi Music Arena', 'Viele Stimmen, viele Gefühle: Giftkind, Love United, RicoReWi, ModeReWi, Slytheris, Straßenkind, KAPITÄN KATER, XXXPLICIT, MIMBALO und AERUMA.', [
      ['🎧 Künstlerradio hören (RicoReWi Radio)', () => { if (AMC.Media) AMC.Media.playStation('ricorewi'); funken('musik', 3); return '🎧 Das Künstlerradio läuft! Alle Acts in einem Stream. +3 Musik-Funken'; }],
      ['🎤 Act als Podcast-Gast einladen', () => { const a = U.pick(['Giftkind', 'Love United', 'ModeReWi', 'Slytheris', 'Straßenkind', 'KAPITÄN KATER', 'MIMBALO', 'AERUMA']); return '🎤 ' + a + ' kommt in die nächste Folge!' + (idea('Musik-Gast: ' + a) ? ' · 💡 Idee' : ' (Kopf voll – erst aufnehmen)'); }]]],
    portal: ['📻 RicoReWi × AnMaCha Radioportal', 'Alle Streams an einem Ort: Pop, Schlager, HipHop, Charts, Rock und Special Interest. Mehr als Radio: eine Community.', [
      ['📻 Alle Sender öffnen', () => { setTimeout(() => AMC.UI.radio(), 50); return '📻 Willkommen im Radioportal!'; }],
      ['🗳️ Für den Lieblingssender abstimmen', () => { const st = U.pick(D.STATIONS), f = Save.earn(10); return '🗳️ Stimme für ' + st.name + ' abgegeben! +' + f + ' 🎟️'; }]]],
    buecher: ['📚 RicoReWi-Bücherei', 'Nicht nur Beats, auch Bücher: „Ich bin das Licht“, „Zotik – Die Splitter der Welten“, „Leuchtfeuer“ und der TikTok-Live-Ratgeber.', [
      ['📖 Ein Buch lesen', () => { const b = U.pick(['Ich bin das Licht', 'Zotik – Die Splitter der Welten', 'Leuchtfeuer', 'TikTok & TikTok Live Ratgeber']); both('energy', 10); funken('feel', 2); return '📖 „' + b + '“ – ein Kapitel und schon hängen geblieben. +2 Feelgood-Funken' + (idea('Buchtipp: ' + b) ? ' · 💡 Idee' : ''); }]]],
    casting: ['★ Show me your Voice', 'Die Casting-Show mit Talenten und Stimmen aus der Creator-Welt. Sing die Melodie der Jury nach!', [
      ['🎙️ Melodie nachsingen (Minispiel)', q => { const a = abos(0.01 + q * 0.03), f = Save.earn(10 + Math.round(q * 40)); funken('musik', 1 + Math.round(q * 3)); return (q >= 0.75 ? '★ Die Jury: „Ihr seid weiter!“' : '★ Die Jury: „Übt noch ein bisschen.“') + ' +' + a + ' Abos, +' + f + ' 🎟️'; }, 'simon', { title: '★ Show me your Voice', rounds: 3, len: 3 }]]],
    werkstatt: ['⌘ Builder-Werkstatt', 'Games, Apps und Radiosoftware: easygames, AnMaCha Cast, laut.fm Manager, RicoReWi Radio und Senderwelt.', [
      ['🛠️ Mit Rico an einer App basteln', () => { funken('tech', 4); return '🛠️ Rico zeigt AnMaCha Cast: Radioautomation, Live-Studio, Podcast. +4 Technik-Funken' + (idea('Tech-Tipp: Radio aus dem eigenen Studio') ? ' · 💡 Idee' : ''); }],
      ['🔌 Studio verkabeln (Minispiel)', q => { funken('tech', 1 + Math.round(q * 3)); const f = Save.earn(10 + Math.round(q * 40)); return (q >= 0.75 ? '🔌 Rico: „Sauber gesteckt, Profi!“' : '🔌 Rico lacht: „Fast!“') + ' +' + f + ' 🎟️'; }, 'cables', { title: '🔌 Werkstatt: Studio verkabeln', n: 5 }]]],
    tiktok: ['📱 Live-Studio', 'Ringlicht an, Kamera läuft: ein Live-Stream mit der Community.', [
      ['🔴 Live gehen und Pointen setzen (Minispiel)', q => { const f = Save.earn(10 + Math.round(q * 30)), a = abos(0.01 + q * 0.02); funken('feel', 1 + Math.round(q * 2)); return (q >= 0.75 ? '🔴 Herzen regnen über den Bildschirm!' : '🔴 Der Stream läuft, die Witze nicht ganz.') + ' +' + a + ' Abos, +' + f + ' 🎟️'; }, 'qte', { title: '🔴 Live: Pointen-Timing', n: 4 }]]],
    funker: ['📶 Funkerhütte', 'Ein alter Funker zeigt euch, wie man Kurzwelle sauber einstellt.', [
      ['🎛️ Kurzwelle einstellen (Minispiel)', null, 'mixer']]]
  };
  Object.assign(PLACES, {
    messe: ['📻 Radio-Messe Wellenburg', 'Neueste Mikrofone, Mischpulte und Sender – und jede Menge Fachpublikum.', [
      ['🎛️ Neues Mischpult testen (Minispiel)', q => { funken('tech', 1 + Math.round(q * 3)); const f = Save.earn(15 + Math.round(q * 40)); return (q >= 0.75 ? '🎛️ Der Hersteller schenkt euch ein Vorführgerät!' : '🎛️ Kling ganz okay.') + ' +' + f + ' 🎟️'; }, 'mixer', { title: '🎛️ Messe: Mischpult-Test', time: 10 }],
      ['❓ Messe-Quiz am Stand (Minispiel)', q => { funken('serious', 1 + Math.round(q * 3)); const f = Save.earn(15 + Math.round(q * 45)); return '❓ ' + (q >= 0.75 ? 'Hauptgewinn am Stand!' : 'Trostpreis: ein Kugelschreiber.') + ' +' + f + ' 🎟️'; }, 'quiz', { title: '❓ Radio-Messe: Quiz', n: 4, qs: QUIZ }]]],
    funkloch: ['🏴‍☠️ Radio Funkloch', 'Ralf Rauschmanns Piratensender. Die Tür steht offen, der Störsender brummt.', [
      ['🔌 Störsender abklemmen (Minispiel)', q => { funken('serious', 2 + Math.round(q * 3)); const f = Save.earn(20 + Math.round(q * 60)); return (q >= 0.75 ? '🔌 Funkstille bei Funkloch! Die ganze Stadt hört wieder klar.' : '🔌 Rauschmann flickt das Kabel schon wieder …') + ' +' + f + ' 🎟️'; }, 'cables', { title: '🔌 Funkloch: Störsender abklemmen', n: 5 }]]],
    camping: ['🏕️ Camping Wellenburg', 'Gisela parkt unter Bäumen, Lagerfeuer, Sternenhimmel.', [
      ['🔥 Nacht mit Gisela am Lagerfeuer', () => { both('energy', 40); both('fun', 20); funken('feel', 3); return '🔥 Marcos Geschichten, Andrews Würstchen, Giselas Hupe um Mitternacht. Beide sind erholt. +3 Feelgood-Funken' + (idea('Lagerfeuer-Talk aus Wellenburg') ? ' · 💡 Idee' : ''); }]]],
    platten: ['💿 Plattenladen Rille', 'Vinyl bis unter die Decke – und ein Besitzer, der jede Platte kennt.', [
      ['💿 Raritäten fangen (Minispiel)', q => { funken('musik', 1 + Math.round(q * 4)); const f = Save.earn(10 + Math.round(q * 40)); return (q >= 0.75 ? '💿 Eine Erstpressung! Die kommt ins Studio.' : '💿 Ein paar Platten landen im Grabbelkorb.') + ' +' + f + ' 🎟️'; }, 'catch', { title: '💿 Plattenladen: Raritäten fangen', good: ['💿', '📀', '🎵'], bad: ['🕷️', '💣'], basket: '🧺' }]]]
  });
  WO.PLACES = PLACES;
  WO.open = function (id) {
    const pl = PLACES[id]; if (!pl || !V) return;
    const used = today(), key = i => 'w:' + id + i;
    const rows = pl[2].map((a, i) => { const off = used[key(i)]; return '<button type="button" class="st-item" data-nav data-w="' + i + '"' + (off ? ' aria-disabled="true"' : '') + '><span class="st-ic">' + a[0].split(' ')[0] + '</span><span><b>' + a[0].split(' ').slice(1).join(' ') + '</b><small>' + (off ? 'Heute schon gemacht – morgen wieder!' : 'Einmal am Tag') + '</small></span></button>'; }).join('');
    const s = AMC.UI.open('<div class="panel glass"><header><h2>' + U.esc(pl[0]) + '</h2><button class="btn small" data-nav id="woB">' + AMC.glyph('b') + ' Zurück</button></header><p class="hint">' + U.esc(pl[1]) + '</p><div class="st-list" id="woL">' + rows + '</div></div>', { back: () => AMC.UI.close(s) });
    s.el.querySelector('#woB').onclick = () => AMC.UI.close(s);
    s.el.querySelector('#woL').addEventListener('click', e => {
      const b = e.target.closest('[data-w]'); if (!b || b.getAttribute('aria-disabled')) return; const i = +b.dataset.w, a = pl[2][i];
      used[key(i)] = 1; if (AMC.Career) AMC.Career.mark('tour'); AMC.UI.close(s); ricoQuest(id); if (AMC.Guests) AMC.Guests.meet(id);
      if (a[2] === 'stage') return stage();
      if (a[2] === 'mixer') return mini('mixer', { color: '#3dd6ff', label: '📶 Kurzwelle' }, q => { const f = Save.earn(10 + Math.round(q * 40)); funken('tech', q >= 0.6 ? 3 : 1); AMC.UI.toast((q >= 0.75 ? '📶 Glasklarer Empfang aus Neuseeland!' : q >= 0.45 ? '📶 Rauschen, aber man versteht was.' : '📶 Nur Pfeifen …') + ' +' + f + ' 🎟️', 4000); });
      if (a[2]) return mini(a[2], Object.assign({ color: '#ffd23f' }, a[3]), q => { AMC.Audio.sfx(q >= 0.5 ? 'applause' : 'miss'); if (AMC.WorldFX && q >= 0.5) AMC.WorldFX.cheer(); Save.save(); AMC.UI.toast(a[1](q), 4400); });
      AMC.Audio.sfx('buy'); Save.save(); AMC.UI.toast(a[1](), 4200);
    });
  };
  // Story: Rico führt Andrew und Marco durch sein Universum (alle sechs Orte)
  const RICO_IDS = ['arena', 'portal', 'buecher', 'casting', 'werkstatt', 'tiktok'];
  WO.ricoQuest = () => { const q = Save.data.ricoU = Save.data.ricoU || { seen: {} }; return { n: RICO_IDS.filter(i => q.seen[i]).length, of: RICO_IDS.length, done: !!q.done }; };
  function ricoQuest(id) {
    if (!RICO_IDS.includes(id)) return; const q = Save.data.ricoU = Save.data.ricoU || { seen: {} }; if (q.seen[id]) return; q.seen[id] = 1;
    const st = WO.ricoQuest();
    if (st.n >= st.of && !q.done) { q.done = true; const f = Save.earn(300); if (AMC.Feed) AMC.Feed.post('✳️', 'Zu Gast im RicoReWi-Universum – danke Rico! Ab heute könnt ihr ihn als Studiogast buchen.', 'story'); if (AMC.Social) AMC.Social.add('RicoReWi', 30); idea('Spezialfolge: Zu Gast im RicoReWi-Universum');
      setTimeout(() => AMC.UI.bubble('RicoReWi', 'Ihr habt alles gesehen! Musik, Radio, Bücher, Casting, Apps – das ist mein Universum. Und ab heute seid ihr ein Teil davon. AnMaCha forever! 🧡', 'Story-Kapitel geschafft · +' + f + ' 🎟️'), 600); }
    else setTimeout(() => C.msg('✳️ RicoReWi-Universum: ' + st.n + '/' + st.of + ' Orte entdeckt', 2.4), 400);
    Save.save();
  }
  function stage() {
    const w = U.pick(D.WISHES.concat(AMC.Home ? AMC.Home.ownedSongs() : []));
    AMC.Audio.song(w.id).then(song => {
      if (!V) return;
      mini('rhythm', { song: song || null, color: '#ff3da8', speed: 1, n: 16, label: '🎤 Festival: „' + w.t + '“' }, q => {
        const f = Save.earn(30 + Math.round(q * 120)), a = abos(0.02 + q * 0.05); funken('musik', 2 + Math.round(q * 4));
        AMC.Audio.sfx(q >= 0.5 ? 'applause' : 'miss'); if (AMC.CityVibe && q >= 0.5) AMC.CityVibe.emote('arms');
        AMC.UI.toast((q >= 0.85 ? '🎤 Zugabe! Die Insel bebt!' : q >= 0.5 ? '🎤 Starker Auftritt!' : '🎤 Holprig, aber die Fans feiern trotzdem.') + ' +' + a + ' Abos, +' + f + ' 🎟️', 4600);
      });
    });
  }
})(typeof window !== 'undefined' ? window : globalThis);
