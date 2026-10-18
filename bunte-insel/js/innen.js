'use strict';
/* Bunte Insel – Innenräume 🚪 (Open-World-Prinzip): Gebäude in allen Welten sind betretbar und haben Inhalte.
   Jedes Gebäude hat eine Tür (BI.addDoor). An der Tür: „Hineingehen“ → ein eigener kleiner Innenraum (wird erst beim ersten Betreten gebaut, liegt weit draußen im Meer)
   mit Möbeln, Bewohner zum Reden und Dingen zum Mitmachen: Bett (ausruhen), Tisch (Snack), Bücherregal (Wissen), Schatztruhe (⭐ + Futter), je nach Gebäude Laden (einkaufen),
   Schmiede (hämmern), Fernrohr, Kristallkugel, Kamin, Höhle (Abstieg ins Mini-Spiel) … Alles läuft über W.dyn-freie Kollisionsboxen und eigene Wand-Flächen,
   die man nur von innen sieht (Puppenstuben-Ansicht, Kamera sieht nie eine Wand von außen). */
BI.DOORS = BI.DOORS || [];
/* spec: { x, z, h (Blickrichtung beim Rauskommen, Winkel), kind, name, isle } – (x,z) = Platz VOR der Tür */
BI.addDoor = function (d) { d.id = BI.DOORS.length; d.name = d.name || 'Haus'; BI.DOORS.push(d); return d; };
/* Tür-Helfer für Inseln mit lokalem Koordinatensystem at(a,b): door = Tür-Platz, from = Gebäudemitte → Blickrichtung weg vom Gebäude */
BI.doorAt = function (I, a, b, fa, fb, kind, name, isle) { const p = I.at(a, b), f = I.at(fa, fb); return BI.addDoor({ x: p.x, z: p.z, h: Math.atan2(p.x - f.x, p.z - f.z), kind, name, isle }); };
/* Tür-Helfer mit Weltkoordinaten: Gebäudemitte + Radius, Tür zeigt zu (tx,tz) */
BI.doorToward = function (cx, cz, r, tx, tz, kind, name, isle) { const dx = tx - cx, dz = tz - cz, l = Math.hypot(dx, dz) || 1; return BI.addDoor({ x: cx + dx / l * (r + 1.3), z: cz + dz / l * (r + 1.3), h: Math.atan2(dx, dz), kind, name, isle }); };
BI.INNEN_X = 3000; BI.INNEN_Z = 3000;
/* Tür an einem massiven Gebäude finden: vom Mittelpunkt (cx,cz) in Richtung (dx,dz) laufen, bis man aus der Kollision heraus ist; dort steht die Tür.
   Probiert 8 Richtungen (die gewünschte zuerst). Hohle/begehbare Gebäude (Mitte frei) bekommen keine Tür. */
BI.doorScan = function (W, cx, cz, dx, dz, kind, name, isle) {
  const a0 = Math.atan2(dx, dz);
  for (const da of [0, .785, -.785, 1.571, -1.571, 2.356, -2.356, 3.14]) {
    const g = a0 + da, ex = Math.sin(g), ez = Math.cos(g); let seen = false;
    for (let t = 0; t <= 14; t += .25) { const x = cx + ex * t, z = cz + ez * t; if (!W.free(x, z, .35)) seen = true; else if (seen) { const q = t + .8, X = cx + ex * q, Z = cz + ez * q; if (W.free(X, Z, .6) && BI.DOORS.every(o => Math.hypot(o.x - X, o.z - Z) > 2.6)) return BI.addDoor({ x: X, z: Z, h: g, kind, name, isle }); break; } }
  }
  return null;
};
/* Alle massiven Gebäude der Welten bekommen eine Tür (Open-World-Prinzip) – nach dem Bau aller Inseln aufrufen */
BI.registerDoors = function (W) {
  const lo = (I, a, b, da, db, kind, name, isle) => { const c = I.at(a, b), t = I.at(a + da, b + db); return BI.doorScan(W, c.x, c.z, t.x - c.x, t.z - c.z, kind, name, isle || I.id); };
  const wo = (x, z, kind, name, isle, tx, tz) => BI.doorScan(W, x, z, (tx == null ? 0 : tx) - x, (tz == null ? 0 : tz) - z, kind, name, isle);
  const R = BI.RAETSEL, S = BI.SCHLUESSEL, M = BI.MAERCHEN, Q = BI.SCHWAMM, B = BI.BADE;
  if (R) {
    for (const [a, b] of [[-58, -22], [-58, 22], [-44, -24], [-44, 24], [-30, -22], [-30, 22]]) lo(R, a, b, 0, b < 0 ? 1 : -1, 'haus', b > 0 && a === -30 ? 'Gasthaus' : 'Dorfhaus', 'raetsel');
    lo(R, -20, -36, 0, 1, 'schmiede', 'Schmiede', 'raetsel');
    const q = R.at(-40, 47), f = R.at(-40, 52); R.hoehleDoor = BI.addDoor({ x: q.x, z: q.z, h: Math.atan2(q.x - f.x, q.z - f.z), kind: 'hoehle', name: 'Uralte Höhle', isle: 'raetsel' });
  }
  if (S) {
    [[16, -50], [24, -50], [44, -50], [16, -18], [48, -34]].forEach(([a, b], i) => lo(S, a, b, -1, 0, 'haus', 'Haus ' + (i + 1), 'schluessel'));
    lo(S, 34, -44, 0, 1, 'turm', 'Uhrturm', 'schluessel'); lo(S, -56, 18, 1, 0, 'huette', 'Strandhütte', 'schluessel'); lo(S, 58, 14, -1, 0, 'schloss', 'Kristall-Burg', 'schluessel');
    [[0, 0], [8, 3], [-7, 5], [3, -9], [-4, -8]].forEach(([da, db], i) => lo(S, -42 + da, -46 + db, 0, 1, 'pilz', 'Pilzhaus ' + (i + 1), 'schluessel'));
  }
  if (BI.WUNSCH) { const Wn = BI.WUNSCH, h = Wn.P.hut; lo(Wn, h[0], h[1], -1, 0, 'huette', 'Strandhütte (Wunsch-Insel)', 'wunsch');
    /* Tor am Ende der geheimen Schlucht: erst nach dem Rätsel (save.wunsch.cave) begehbar – dahinter die Lichtgrotte */
    const dr = Wn.P.door, q = Wn.at(dr[0] - 3.6, dr[1]), f = Wn.at(dr[0], dr[1]); Wn.lichtDoor = BI.addDoor({ x: q.x, z: q.z, h: Math.atan2(q.x - f.x, q.z - f.z), kind: 'grotte', name: 'Lichtgrotte', isle: 'wunsch', nomark: true, gate: sv => !!(sv.wunsch && sv.wunsch.cave) }); }
  if (BI.TASCHI) { const T = BI.TASCHI; lo(T, -38, 28, 0, -1, 'labor', 'Labor von Professor Ulme', 'taschi'); lo(T, -38, -28, 0, 1, 'heil', 'Taschi-Heilhaus', 'taschi'); { const fd = lo(T, -16, -30, 0, 1, 'laden', 'Taschi-Fangladen', 'taschi'); if (fd) fd.tshop = true; } }
  if (M) { lo(M, 66, -16, -1, 0, 'huette', 'Strandhütte', 'maerchen'); [[5, -33], [19, -33], [5, -41], [19, -41]].forEach(([a, b], i) => lo(M, a, b, 0, 1, 'zelt', ['Wahrsager-Zelt', 'Teppich-Zelt', 'Gewürz-Zelt', 'Lampen-Zelt'][i], 'maerchen')); }
  if (Q) { lo(Q, 14, -32, 0, 1, 'frucht', 'Ananas-Haus', 'schwamm'); lo(Q, 26, -32, 0, 1, 'stein', 'Stein-Haus', 'schwamm'); lo(Q, 38, -32, 0, 1, 'kopf', 'Steinkopf-Haus', 'schwamm'); lo(Q, -14, 34, 0, -1, 'eimer', 'Eimerchen', 'schwamm'); lo(Q, -44, 34, 0, -1, 'held', 'Heldenheim', 'schwamm'); lo(Q, -56, -20, 1, 0, 'huette', 'Strandhütte', 'schwamm'); }
  if (B) { const t = B.at(194, -5.5), k = B.at(184, 12); BI.doorScan(W, t.x, t.z, -B.ux, -B.uz, 'turm', 'Bademeister-Turm', 'bade'); BI.doorScan(W, k.x, k.z, -B.ux, -B.uz, 'laden', 'Eis-Kiosk', 'bade'); }
  wo(25, 385, 'haus', 'Mondhaus', 'zotik', 0, 330); wo(29, 413, 'huette', 'Kristallhütte', 'zotik', 0, 330); wo(31, 348, 'turm', 'Mondturm', 'zotik', 0, 330);
  wo(181, -179, 'haus', 'Bauhaus', 'bauland', 0, -150); wo(207, -148, 'huette', 'Bauhütte', 'bauland', 0, -150); wo(207, -174, 'werkstatt', 'Werkstatt-Haus', 'bauland', 0, -150);
  wo(246, 8, 'laden', 'Park-Büro', 'park', 200, 0); wo(-266, -162, 'haus', 'Hafenhaus', 'dampf', -230, -150); wo(-301, -135, 'kapitaen', 'Kapitänshaus', 'dampf', -270, -150); wo(240, 184, 'turm', 'Funkturm', 'radio', 200, 170);
  wo(-66, 60, 'turm', 'Wasserturm', 'insel', 0, 0); wo(162, -28, 'haus', 'Ferienhaus', 'insel', 100, 0); wo(-165, -11, 'huette', 'Bauernhütte', 'insel', -100, 0);
};

/* Türmatten und goldene Türrahmen (sichtbar, damit Kinder die Tür finden) – nach dem Bau aller Inseln aufrufen */
BI.buildDoorMarks = function (c) {
  const { st, lamp, W } = c; W.doors = BI.DOORS;
  for (const d of BI.DOORS) {
    if (d.nomark) continue; /* eigenes Tor in der Welt (z. B. Lichtgrotte) */
    st.disc(d.x, d.z, 1.1, .05, 0xffd23f, 16); st.disc(d.x, d.z, .75, .06, 0xfff0a0, 16);
    /* sichtbare Haustür an der Wand (Rahmen, Tür, Knauf, Fenster, Laterne, Stufe) – Wand liegt ca. .85 hinter dem Türplatz */
    const nx = Math.sin(d.h), nz = Math.cos(d.h), tx = nz, tz = -nx, wx = d.x - nx * .85, wz = d.z - nz * .85, col = [0x8a4a2a, 0x3a6ad8, 0xc23a3a, 0x2f9a5a][d.id % 4];
    st.box(wx, 0, wz, 2.3, 3.1, .22, 0xf6e6c8, d.h); st.box(wx + nx * .06, 0, wz + nz * .06, 1.8, 2.7, .2, col, d.h); st.box(wx + nx * .17, 1.3, wz + nz * .17, 1.1, 2.1, .06, col + 0x151515, d.h);
    st.sph(wx + nx * .24 + tx * .55, 1.25, wz + nz * .24 + tz * .55, .1, 0xffd23f, 0); lamp.sph(wx + nx * .3 + tx * 1.5, 2.6, wz + nz * .3 + tz * 1.5, .16, 0xfff3b0, 1); lamp.sph(wx + nx * .3 - tx * 1.5, 2.6, wz + nz * .3 - tz * 1.5, .16, 0xfff3b0, 1);
    st.box(wx + nx * .5, 0, wz + nz * .5, 2.2, .14, .7, 0xb8b0a0, d.h);
  }
};

BI.createInnen = function (G) {
  const { scene, W, A, fx, P, say, save, persist } = G, K = { inside: null, panel: null }, TAU = Math.PI * 2, XI = BI.INNEN_X, ZI = BI.INNEN_Z;
  const S = () => { const s = save.innen || (save.innen = {}); s.v = s.v || {}; s.c = s.c || {}; s.o = s.o || {}; return s; };
  const note = (f, d, ty, v, del) => { try { A.note && A.note(f, d, ty, v, del || 0); } catch (e) { } };
  const earn = id => G.earn && G.earn(id), stars = n => G.addStars(n), nr = (o, r) => o && Math.hypot(P.x - o.x, P.z - o.z) < r;
  const mat = new THREE.MeshBasicMaterial({ vertexColors: true });
  const rooms = new Map(); /* id → Raum */
  const KIND = {
    haus: { w: 10, d: 9, wall: [0xf6e6c8, 0xe8d0b0, 0xd8e8d0, 0xf0d8e0], floor: [0xc89a5a, 0xb88a4a], title: '🏠' }, labor: { w: 11, d: 9, wall: [0xd8e8f0, 0xd8f0e0], floor: [0x9aa8b8], title: '🧪' }, kapitaen: { w: 10, d: 9, wall: [0xe8d8b8, 0xc8b090], floor: [0x8a5a3a], title: '⚓' }, werkstatt: { w: 10, d: 8, wall: [0xd0d8e0, 0xaeb8c4], floor: [0x888c94], title: '🛠️' }, huette: { w: 8.4, d: 7.4, wall: [0xc8a070, 0xb89060], floor: [0x9a6a3a], title: '🛖' },
    laden: { w: 11, d: 8, wall: [0xfff0c8, 0xd8f0e8], floor: [0xd0c8b0], title: '🛍️' }, schmiede: { w: 10, d: 8, wall: [0x9a9aa8, 0xb0a898], floor: [0x6a6a78], title: '⚒️' },
    turm: { w: 8.6, d: 8.2, wall: [0xc8c8d8, 0xd8c8c0], floor: [0xa8a8b8], title: '🗼' }, zelt: { w: 8.4, d: 7.4, wall: [0xff9ac0, 0xffb04a, 0x9a7af0], floor: [0xc84a6a], title: '⛺' },
    schloss: { w: 48, d: 38, wall: [0xe8d8f0, 0xc8d0f0], floor: [0xd8c8e8], title: '🏰' }, hoehle: { w: 10, d: 9, wall: [0x4a4658, 0x3a3648], floor: [0x6a6070], title: '🕳️' }, grotte: { w: 9, d: 8, wall: [0x3a2e6a, 0x2e2858], floor: [0x4a3e78], title: '🌠' },
    pilz: { w: 8.4, d: 7.4, wall: [0xfff0d8, 0xffe0e8], floor: [0xf0c898], title: '🍄' }, frucht: { w: 10, d: 9, wall: [0xffe8a0, 0xffd080], floor: [0xd8a050], title: '🍍' },
    stein: { w: 8.4, d: 7.4, wall: [0xe8b0c0, 0xd89aaa], floor: [0xb88a7a], title: '🪨' }, kopf: { w: 9, d: 8, wall: [0x9ab8b0, 0x8aa8a0], floor: [0x6a8a80], title: '🗿' },
    heil: { w: 12, d: 9, wall: [0xffd6e0, 0xfff0f4], floor: [0xf6e8ec], title: '💖' },
    eimer: { w: 9, d: 8, wall: [0xaab4c4, 0x8a96a8], floor: [0x6a7686], title: '🪣' }, held: { w: 10, d: 9, wall: [0xe8f0fa, 0xd0e0f8], floor: [0x6a8ad8], title: '🦸' }
  };
  const NAMEN = [['Oma Berta', ['Komm rein, ich habe Kekse gebacken! 🍪', 'Hier ist es immer gemütlich.']], ['Opa Fritz', ['Setz dich doch! Ich erzähle dir von früher.', 'Früher gab es hier nur Wiese – heute gibt es Abenteuer! 🌍']], ['Lotta', ['Das ist mein Zimmer! Schau, mein Bett ist ganz weich. 🛏️', 'Spielst du mit mir?']], ['Bruno', ['Brumm! Willkommen in meinem Haus!', 'Im Regal stehen spannende Bücher. 📚']], ['Mia', ['Hallo! Hast du die Truhe gesehen? Da ist bestimmt etwas Schönes drin! 🎁', 'Ich sammle Muscheln.']], ['Tilo', ['Pssst, hier drin ist es schön ruhig. 🤫', 'Wenn du Hunger hast: Auf dem Tisch liegt ein Snack!']], ['Frieda', ['Ich putze jeden Tag! Und trotzdem wird es wieder bunt. 🧹', 'Besuch mich gern wieder!']], ['Jonas', ['Cool, dass du da bist! 😎', 'Hier drin ist mein Geheimversteck.']]];
  const TIPPS = ['📚 Im Verbotenen Wald hilft dein Kapselmonster beim Kämpfen.', '📚 In jeder Welt gibt es Schätze – schau in Häuser, Truhen und Höhlen!', '📚 Mit Sternen ⭐ kaufst du im Spielzeugladen tolle Sachen.', '📚 Im Meer kannst du schwimmen – überall am Strand!', '📚 Wenn du essen gehst, kannst du dir Burger für den Wald einpacken.', '📚 Freunde können mit dem Handy dein Controller sein – am Fernseher!', '📚 Rätsel-Insel: Bomben, Bogen und Haken lösen die Rätsel im Turm.', '📚 Das Märchenland hat einen Umzug – lauf mit!'];
  const SHOP = [['apple', '🍎', 'Apfel', 1], ['cookie', '🍪', 'Keks', 1], ['juice', '🧃', 'Saft', 1], ['cakeslice', '🍰', 'Kuchenstück', 2]];
  /* Passende Einrichtung je Gebäude: Bewohner, Bücher-Tipps und ein besonderes Ding zum Mitmachen gehören zur Welt und zum Namen des Hauses */
  const ISLE_TIPS = {
    raetsel: ['📚 Im Prüfungsturm helfen Bomben, Bogen und Enterhaken – jedes Werkzeug öffnet neue Wege.', '📚 Kapsli wird stärker, wenn du es fütterst. Es hilft dir im Verbotenen Wald!', '📚 In der Uralten Höhle wartet jedes Mal ein neues Stockwerk.'],
    schluessel: ['📚 Fünf Schlüssellöcher warten im Schlüsselreich – jedes braucht eine andere Aufgabe.', '📚 Mit dem Lichtschlüssel vertreibst du die Dunkelwichtel. Sammle die Herz-Kristalle 💎!', '📚 Am Uhrturm gibt es Meersalz-Eis – lecker!'],
    schwamm: ['📚 In der Knusper-Krabbe kannst du Burger essen – oder selbst am Grill braten! 🍔', '📚 Mit dem Kescher fängst du Quallen. Aber sanft! 🪼', '📚 Das Wannen-Mobil kann man fahren – es parkt danach von allein.'],
    zotik: ['📚 Lunaris ist die Hauptstadt von Zotik. Sammle Splitter: 10 Splitter = 1 ⭐.', '📚 Am Weltentor-Platz führen sechs Tore zu anderen Welten.', '📚 Moosling Felli hilft dir beim Elementar-Kampf. 🌱'],
    bauland: ['📚 Im Bauland baust du eigene Häuser aus Blöcken. 🧱', '📚 Erst ein Boden, dann Wände, dann ein Dach – so steht dein Haus stabil!', '📚 Mit Farbe 🎨 sieht jedes Haus anders aus.'],
    dampf: ['📚 Der Dampfer fährt zu anderen Häfen – steig einfach ein! 🚢', '📚 Am Kai liegen Kisten und Fässer. Was da wohl drin ist?'],
    maerchen: ['📚 Im Märchenland gibt es einen Umzug – lauf mit! 🎠', '📚 Auf dem Basar gibt es Teppiche, Gewürze und Wunderlampen.'],
    taschi: ['📚 Im Heilhaus werden deine Taschis wieder fit. 💖', '📚 Mit Taschibällen 🔴 fängst du neue Freunde für dein Team.'],
    bade: ['📚 Beim Baden immer in der Nähe des Bademeisters bleiben! 🛟', '📚 Am Eis-Kiosk gibt es kühles Eis. 🍦'],
    radio: ['📚 Auf der Radio-Insel kannst du Sender hören und selbst Musik machen. 📻'],
    park: ['📚 Im Freizeitpark gibt es Karussell, Riesenrad und mehr. 🎡']
  };
  const THEME = {
    gast: { npc: ['Wirtin Grete', ['Herzlich willkommen im Gasthaus! Setz dich, die Suppe ist gleich fertig. 🍲', 'Abenteurer erzählen hier von der Titanen-Festung am Himmel … gruselig!']], side: 'fass', north: 'kamin' },
    dorf: { npc: ['Bauer Korbin', ['Willkommen in unserem Dorf! Warst du schon im Prüfungsturm? 🗿', 'Kapsli mag Futter – je mehr, desto stärker wird es!']], side: 'waffen', north: 'kamin' },
    schl: { npc: ['Schlüsselhüterin Ina', ['Psst … an meinem Brett hängen alle Schlüsselsorten des Reiches! 🗝️', 'Der Lichtschlüssel ist der wichtigste von allen. ✨']], side: 'schluesselbrett' },
    strand: { npc: ['Strandwart Kalle', ['Moin! Hier riecht es nach Meer und Sonnencreme. 🌊', 'Am Strand findest du die schönsten Muscheln.']], side: 'surf', floor: 0xe8d4a0 },
    pilz: { npc: ['Pilzwichtel Pino', ['Hallo, Großer! In meinem Pilzhaus ist alles ein bisschen kleiner. 🍄', 'Meine Glitzersporen machen gute Laune!']], side: 'pilzlampe' },
    ananas: { npc: ['Schwammi', ['Hallo Nachbar! Willkommen in meinem Fruchthaus! 🍍', 'Schneckerich wartet schon auf Streicheleinheiten. 🐌']], side: 'schnecke', north: 'bullauge' },
    stein: { npc: ['Sternchen', ['Hä? Ach, Besuch! Willkommen unter meinem Stein. ⭐', 'Ich mache gerade gar nichts. Darin bin ich der Beste!']], side: 'sand', floor: 0xe8c890 },
    kopf: { npc: ['Tadeus Tintenfuß', ['Bitte leise, ich übe Klarinette. 🎵', 'Kunst braucht Ruhe … und ein bisschen Applaus.']], side: 'musik' },
    eimer: { npc: ['Winzling Plankto', ['Mwahaha! Willkommen im Eimerchen! 🪣', 'Eines Tages finde ich das Geheimrezept … ganz bestimmt!']] },
    held: { npc: ['Meeresmann', ['Willkommen im Heldenheim, junger Held! 🦸', 'Ein echter Held hilft immer seinen Freunden.']] },
    mond: { npc: ['Lyra', ['Willkommen in Lunaris! Hier leuchten die Kristalle in der Nacht. 🌙', 'Hast du schon Splitter gesammelt? Zehn Stück geben einen Stern!']], side: 'kristall', north: 'sterne', wall: [0x3a3a7a, 0x4a3a8a], floor: [0x2a2a5a] },
    bau: { npc: ['Baumeisterin Bea', ['Hallo, Baumeister! Hier plane ich die schönsten Häuser. 🏗️', 'Im Bauland darfst du selbst bauen – Block für Block!']], side: 'kloetze', north: 'plan' },
    hafen: { npc: ['Fischer Hein', ['Ahoi! Heute habe ich drei Fische gefangen – und einen alten Stiefel. 🎣', 'Der Dampfer bringt dich zu anderen Häfen. 🚢']], side: 'netz' },
    ferien: { npc: ['Urlauberin Uta', ['Endlich Ferien! Gleich geht es an den Strand. 🏖️', 'Ich habe viel zu viel eingepackt …']], side: 'koffer' },
    bauer: { npc: ['Bäuerin Frida', ['Willkommen auf dem Hof! Die Kühe geben heute ganz frische Milch. 🐄', 'Auf dem Feld wachsen Möhren und Kürbisse.']], side: 'heu' },
    uhr: { npc: ['Uhrmacher Tick', ['Tick-tack! In meinem Turm läuft jede Uhr ganz genau. 🕰️', 'Oben vom Turm sieht man die ganze Dämmerstadt.']], north: 'uhr' },
    funk: { npc: ['Funkerin Fee', ['Hier ist der Funkturm! Ich spiele Musik für alle Inseln. 📻', 'Möchtest du einen Gruß über Funk schicken?']], north: 'funk' },
    wasser: { npc: ['Brunnenmeister Udo', ['Im Wasserturm wird das Wasser für die ganze Insel gespeichert. 💧', 'Ohne Wasser keine Blumen, kein Saft und kein Planschbecken!']], north: 'tank' },
    bademeister: { npc: ['Bademeisterin Lena', ['Ich passe auf, dass beim Baden alles gut geht. 🛟', 'Nach dem Schwimmen gibt es ein Eis!']], north: 'ring' },
    eis: { npc: ['Eismann Enzo', ['Ciao! Heute gibt es Erdbeere, Vanille und Schoko! 🍦']], shop: [['icecream', '🍦', 'Eis', 2], ['juice', '🧃', 'Saft', 1], ['cookie', '🍪', 'Waffel-Keks', 1]] },
    park: { npc: ['Parkchefin Paula', ['Willkommen im Park-Büro! Von hier aus laufen alle Karussells. 🎡', 'Mit Sternen kannst du hier Leckereien für den Park kaufen.']], shop: [['cookie', '🍪', 'Keks', 1], ['juice', '🧃', 'Saft', 1], ['icecream', '🍦', 'Eis', 2]] },
    teppich: { npc: ['Teppichhändler Aram', ['Meine Teppiche sind die weichsten im ganzen Märchenland! 🧞', 'Einer davon kann sogar fliegen … pssst!']], center: 'teppich' },
    gewuerz: { npc: ['Gewürzhändlerin Safi', ['Riech mal! Zimt, Kurkuma und Paprika. 🌶️', 'Ein bisschen Gewürz macht jede Suppe lecker.']], center: 'gewuerz' },
    grotte: { npc: ['Lichtfee Luma', ['Psst … du hast das Tor geöffnet! Hier schläft das warme Licht der Wunsch-Insel. 🌠', 'Das Licht hat dir den Wunschschlüssel geschenkt. Berühr es ruhig – es kitzelt ein bisschen!']] },
    lampen: { npc: ['Lampenmeister Omar', ['So viele Lampen – und eine davon ist eine Wunderlampe! 🪔', 'Reib vorsichtig daran …']], center: 'lampe' }
  };
  const themeOf = d => { const n = d.name || '', i = d.isle, k = d.kind;
    if (/Gasthaus/.test(n)) return 'gast'; if (i === 'raetsel' && k === 'haus') return 'dorf'; if (/^Haus \d/.test(n)) return 'schl'; if (/Strandhütte/.test(n)) return 'strand'; if (/Pilzhaus/.test(n)) return 'pilz';
    if (k === 'frucht') return 'ananas'; if (k === 'stein') return 'stein'; if (k === 'kopf') return 'kopf'; if (k === 'eimer') return 'eimer'; if (k === 'held') return 'held';
    if (i === 'zotik') return 'mond'; if (i === 'bauland' && k !== 'werkstatt') return 'bau'; if (/Hafenhaus/.test(n)) return 'hafen'; if (/Ferienhaus/.test(n)) return 'ferien'; if (/Bauernhütte/.test(n)) return 'bauer';
    if (/Uhrturm/.test(n)) return 'uhr'; if (/Funkturm/.test(n)) return 'funk'; if (/Wasserturm/.test(n)) return 'wasser'; if (/Bademeister/.test(n)) return 'bademeister'; if (/Eis-Kiosk/.test(n)) return 'eis'; if (/Park-Büro/.test(n)) return 'park';
    if (/Teppich/.test(n)) return 'teppich'; if (/Gewürz/.test(n)) return 'gewuerz'; if (/Lampen/.test(n)) return 'lampen'; if (k === 'grotte') return 'grotte'; return ''; };
  /* Mitmach-Dinge: Text-Reihe, Effekt-Farben, Klang und einmal pro Haus ein kleines Geschenk */
  const FUN = {
    fass: { label: ['🍺', 'Apfelsaft zapfen'], txt: ['🧃 Gluck-gluck … frischer Apfelsaft aus dem Fass!'], gift: ['juice', '🧃 Saft'], col: [[1, .8, .3]], snd: 'pop' },
    waffen: { label: ['🛡️', 'Schild ansehen'], txt: ['🛡️ Ein altes Schild der Uralten. Darauf ist der Prüfungsturm abgebildet!', '⚔️ Hier hängt ein Übungsschwert. In der Schmiede wird es noch stärker!'], col: [[.8, .85, 1]] },
    schluesselbrett: { label: ['🗝️', 'Schlüsselbrett ansehen'], txt: ['🗝️ Ein goldener, ein roter, ein blauer, ein grüner und ein lila Schlüssel – wie die fünf Schlüssellöcher des Reiches!', '✨ Der Lichtschlüssel fehlt am Brett – den trägst du ja schon!'], col: [[1, .9, .3], [.6, .8, 1]], snd: 'chime' },
    surf: { label: ['🐚', 'Muscheln sortieren'], txt: ['🐚 Eine rosa Muschel, eine gestreifte, eine riesige! Halt sie ans Ohr: Rauscht das Meer?', '🏄 Das Surfbrett ist noch nass – Kalle war heute schon auf den Wellen!'], gift: ['apple', '🍎 Apfel'], col: [[1, .7, .8], [1, 1, 1]], snd: 'chime' },
    pilzlampe: { label: ['✨', 'Glitzersporen pusten'], txt: ['✨ Pfffft! Glitzersporen fliegen durchs ganze Zimmer!', '🍄 Die Pilzlampe leuchtet jetzt in Regenbogenfarben!'], col: [[1, .5, .8], [.6, 1, .6], [1, 1, .5]], snd: 'chime' },
    schnecke: { label: ['🐌', 'Schneckerich streicheln'], txt: ['🐌 Miau! Schneckerich schnurrt ganz zufrieden.', '🐌 Schneckerich schlängelt einmal im Kreis – er freut sich!'], col: [[1, .6, .8], [1, 1, 1]], snd: 'pop' },
    sand: { label: ['😴', 'Im Sand dösen'], txt: ['😴 Du kuschelst dich in den warmen Sand. Sternchen schnarcht schon … Chrrr.', '⭐ Sternchen murmelt im Schlaf: „Noch fünf Minuten …“'], col: [[1, .9, .6]] },
    musik: { label: ['🎵', 'Klarinette spielen'], txt: ['🎵 Düüü-düdü-dööö! Tadeus hält sich die Ohren zu … aber er lächelt!', '🎶 Schon besser! Tadeus klatscht dreimal.'], col: [[.7, .6, 1], [1, 1, 1]], snd: 'notes' },
    kristall: { label: ['💎', 'Kristall leuchten lassen'], txt: ['💎 Der Kristall leuchtet hell auf – wie ein kleiner Mond!', '🌙 Im Licht siehst du die Sternbilder von Lunaris an der Wand.'], gift: ['cookie', '🍪 Mondkeks'], col: [[.6, .8, 1], [.9, .7, 1]], snd: 'chime' },
    sterne: { label: ['🌌', 'Sternkarte ansehen'], txt: ['🌌 Auf der Sternkarte ist das Luftschiff Nautilux eingezeichnet!'], col: [[.7, .8, 1]] },
    kloetze: { label: ['🧱', 'Klötze stapeln'], txt: ['🧱 Rot auf Blau auf Gelb – dein Turm steht! Bea klatscht.', '🧱 Huch, umgefallen! Nochmal, diesmal breiter unten.'], col: [[1, .4, .3], [.3, .6, 1], [1, .9, .3]], snd: 'pop' },
    plan: { label: ['📐', 'Bauplan ansehen'], txt: ['📐 Auf dem Bauplan steht ein Haus mit Turm, Rutsche und Pool. Toll!'], col: [[.6, .8, 1]] },
    netz: { label: ['🎣', 'Angelgeschichte hören'], txt: ['🎣 Hein erzählt: „Einmal hab ich einen Fisch so groß wie ein Boot gesehen!“', '🐟 „Der Trick beim Angeln? Geduld … und ein leckerer Wurm.“'], gift: ['apple', '🍎 Apfel'], col: [[.5, .8, 1]] },
    koffer: { label: ['🧳', 'Koffer auspacken'], txt: ['🧳 Badehose, Sonnenhut, Schwimmflügel – und ein Gummi-Entchen! 🦆', '🕶️ Ganz unten liegt eine Sonnenbrille. Cool!'], gift: ['icecream', '🍦 Eis'], col: [[1, .85, .3], [.4, .8, 1]], snd: 'pop' },
    heu: { label: ['🥛', 'Milch zapfen'], txt: ['🥛 Frische Milch von der Kuh Berta – mmmh!', '🌾 Im Heu raschelt es … nur eine kleine Maus. 🐭'], gift: ['juice', '🥛 Milch'], col: [[1, 1, 1], [1, .9, .5]], snd: 'pop' },
    uhr: { label: ['🔔', 'Glocke läuten'], txt: ['🔔 Dong! Dong! Dong! Die ganze Dämmerstadt hört die Glocke.'], col: [[1, .85, .3]], snd: 'bell' },
    funk: { label: ['🎙️', 'Gruß über Funk senden'], txt: ['🎙️ „Hallo an alle Inseln! Hier spricht ein Held!“ – rauscht es aus allen Radios.', '📻 Die Funkerin spielt dein Lieblingslied für alle Inseln!'], col: [[.4, 1, .6]], snd: 'notes' },
    tank: { label: ['🚰', 'Wasserhahn aufdrehen'], txt: ['💧 Pschhh! Kühles Wasser – du füllst deine Flasche auf.'], col: [[.4, .7, 1], [1, 1, 1]], snd: 'pop' },
    ring: { label: ['🛟', 'Rettungsring ansehen'], txt: ['🛟 Der Rettungsring ist für Notfälle. Immer da schwimmen, wo jemand aufpasst!'], col: [[1, .4, .3], [1, 1, 1]] },
    teppich: { label: ['🧞', 'Auf den Teppich setzen'], txt: ['🧞 Der Teppich hebt kurz ab – huiii! – und landet wieder sanft.', '🧞 Aram lacht: „Für weite Flüge musst du noch üben!“'], col: [[1, .3, .4], [1, .85, .3]], snd: 'chime' },
    gewuerz: { label: ['🌶️', 'Gewürze schnuppern'], txt: ['🌶️ Hatschi! Der Pfeffer kitzelt in der Nase.', '🟡 Kurkuma duftet warm und färbt alles gelb.'], col: [[1, .5, .2], [1, .85, .2]], snd: 'pop' },
    licht: { label: ['🌟', 'Warmes Licht berühren'], txt: ['🌟 Das Licht wird warm und hell – es summt ganz leise ein Wunschlied.', '✨ Kleine Lichtfunken tanzen um dich herum. Du fühlst dich mutig!'], gift: ['cookie', '⭐ Sternkeks'], col: [[1, .9, .5], [1, 1, 1]], snd: 'chime' },
    lampe: { label: ['🪔', 'Wunderlampe reiben'], txt: ['🪔 Puff! Ein kleiner Lampengeist erscheint: „Dein Wunsch: ein Stern!“', '🪔 Der Lampengeist zwinkert: „Ein Wunsch pro Tag reicht!“'], gift: ['cookie', '⭐ Glücks-Keks'], col: [[.6, .5, 1], [1, .85, .3]], snd: 'chime' }
  };
  const sprite = (txt, y, w, x, z) => { const cv = document.createElement('canvas'); cv.width = 512; cv.height = 96; const c = cv.getContext('2d'); let f = 50; c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; const mw = c.measureText(txt).width; if (mw > 480) { f = Math.floor(f * 480 / mw); c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; } c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 9; c.strokeStyle = '#3a2a1a'; c.strokeText(txt, 256, 50); c.fillStyle = '#fff3b0'; c.fillText(txt, 256, 50); const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false, depthTest: false })); sp.scale.set(w, w * 96 / 512, 1); sp.position.set(x, y, z); sp.renderOrder = 9; return sp; };
  const floorTex = col => { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const c = cv.getContext('2d'), r = (col >> 16) & 255, g = (col >> 8) & 255, b = col & 255; for (let i = 0; i < 8; i++) { const k = .86 + (i % 3) * .07; c.fillStyle = `rgb(${r * k | 0},${g * k | 0},${b * k | 0})`; c.fillRect(0, i * 8, 64, 8); c.fillStyle = 'rgba(0,0,0,.22)'; c.fillRect(0, i * 8, 64, 1); c.fillRect((i * 23) % 64, i * 8, 1, 8); } const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
  const plane = (w, h, col, x, y, z, ry, rx) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: col })); m.position.set(x, y, z); m.rotation.set(rx || 0, ry || 0, 0); return m; };
  /* ---------- Raum bauen ---------- */
  function build(d) {
    const K0 = KIND[d.kind] || KIND.haus, rng = BI.rng(1000 + d.id * 17), idx = d.id, X0 = XI + (idx % 10) * 36, Z0 = ZI + Math.floor(idx / 10) * 36, hw = K0.w / 2, hd = K0.d / 2, H = 3.6, grp = new THREE.Group(), b = new BI.Batch(), items = [], pick = a => a[(rng() * a.length) | 0];
    const TH = THEME[themeOf(d)] || {}, R = { d, X0, Z0, hw, hd, grp, items, npc: null, exit: { x: X0, z: Z0 + hd - .7 }, shop: TH.shop }, wcol = pick(TH.wall || K0.wall), fcol = TH.floor ? (Array.isArray(TH.floor) ? pick(TH.floor) : TH.floor) : pick(K0.floor); scene.add(grp);
    /* Wände (nur von innen sichtbar), Boden, Tür, Fenster */
    grp.add(plane(K0.w, H, wcol, X0, H / 2, Z0 - hd, 0)); grp.add(plane(K0.w, H, wcol, X0, H / 2, Z0 + hd, Math.PI)); grp.add(plane(K0.d, H, wcol, X0 - hw, H / 2, Z0, Math.PI / 2)); grp.add(plane(K0.d, H, wcol, X0 + hw, H / 2, Z0, -Math.PI / 2));
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(K0.w, K0.d), new THREE.MeshBasicMaterial({ map: floorTex(fcol) })); fl.material.map.repeat.set(K0.w / 2.5, K0.d / 2.5); fl.rotation.x = -Math.PI / 2; fl.position.set(X0, .01, Z0); grp.add(fl);
    grp.add(plane(K0.w, .3, 0x6a4a2a, X0, .15, Z0 - hd + .02, 0)); grp.add(plane(K0.w, .3, 0x6a4a2a, X0, .15, Z0 + hd - .02, Math.PI)); grp.add(plane(K0.d, .3, 0x6a4a2a, X0 - hw + .02, .15, Z0, Math.PI / 2)); grp.add(plane(K0.d, .3, 0x6a4a2a, X0 + hw - .02, .15, Z0, -Math.PI / 2));
    grp.add(plane(1.8, 2.7, 0x7a4a2a, X0, 1.35, Z0 + hd - .03, Math.PI)); grp.add(plane(1.5, 2.4, 0xc89a5a, X0, 1.25, Z0 + hd - .04, Math.PI)); { const kn = new THREE.Mesh(new THREE.SphereGeometry(.09, 6, 5), new THREE.MeshBasicMaterial({ color: 0xffd23f })); kn.position.set(X0 + .5, 1.2, Z0 + hd - .1); grp.add(kn); }
    for (const sx of [-1, 1]) { grp.add(plane(1.5, 1.3, 0x9fe3ff, X0 + sx * hw * .5, 2.0, Z0 - hd + .03, 0)); grp.add(plane(1.7, .12, 0xffffff, X0 + sx * hw * .5, 1.35, Z0 - hd + .04, 0)); grp.add(plane(.12, 1.5, 0xffffff, X0 + sx * hw * .5, 2.0, Z0 - hd + .04, 0)); }
    const box = (x, z, w, dd, h, col, y0) => { b.box(x, y0 || 0, z, w, h, dd, col); }, solid = (x, z, w, dd, h) => { W.addBox(x - w / 2, z - dd / 2, x + w / 2, z + dd / 2, false, h); };
    const fur = (x, z, w, dd, h, col, y0) => { box(x, z, w, dd, h, col, y0); solid(x, z, w, dd, h + (y0 || 0)); };
    /* Außenkollision: Wände als Boxen */
    W.addBox(X0 - hw - 1, Z0 - hd - 1, X0 + hw + 1, Z0 - hd, false, 6); W.addBox(X0 - hw - 1, Z0 + hd, X0 + hw + 1, Z0 + hd + 1, false, 6); W.addBox(X0 - hw - 1, Z0 - hd, X0 - hw, Z0 + hd, false, 6); W.addBox(X0 + hw, Z0 - hd, X0 + hw + 1, Z0 + hd, false, 6);
    /* Teppich */ box(X0, Z0 + .3, hw * 1.0, hd * .8, .03, pick([0xc23a3a, 0x3a6ad8, 0x4cae5a, 0xb48aff]), .02); box(X0, Z0 + .3, hw * .85, hd * .66, .035, 0xfff0d0, .021);
    const it = (type, x, z, r, label, extra) => items.push(Object.assign({ type, x, z, r, label }, extra || {}));
    const bed = (x, z) => { fur(x, z, 2.1, 3.0, .55, 0x8a5a2a); box(x, z - .2, 1.9, 2.4, .25, pick([0xff8fc8, 0x7fb8ff, 0xffd23f]), .55); box(x, z - 1.15, 1.3, .6, .22, 0xffffff, .8); it('bed', x, z + 1.9, 1.7, ['🛏️', 'Ausruhen']); };
    const table = (x, z, food) => { fur(x, z, 1.8, 1.2, .8, 0xa86a3a); for (const sx of [-1, 1]) { box(x + sx * 1.4, z, .7, .7, .5, 0x8a5a2a); } if (food) { box(x - .3, z, .5, .5, .12, 0xfafafa, .8); box(x - .3, z, .3, .3, .25, 0xe0382b, .9); box(x + .4, z, .3, .3, .18, 0xffe27a, .8); it('table', x, z + 1.5, 1.7, ['🍽️', 'Snack nehmen']); } };
    const shelf = (x, z, wall) => { const w = wall === 'n' ? 2.6 : .7, dd = wall === 'n' ? .7 : 2.6; fur(x, z, w, dd, 2.3, 0x7a4a2a); for (let k = 0; k < 4; k++) for (let j = 0; j < 4; j++) box(x + (wall === 'n' ? (j - 1.5) * .55 : 0), z + (wall === 'n' ? 0 : (j - 1.5) * .55), wall === 'n' ? .4 : .5, wall === 'n' ? .5 : .4, .4, [0xe0382b, 0x2f8cff, 0xffd23f, 0x4cd07d, 0xb48aff][(k + j) % 5], .3 + k * .55); it('shelf', x + (wall === 'e' ? -1.4 : wall === 'w' ? 1.4 : 0), z + (wall === 'n' ? 1.4 : 0), 1.8, ['📚', 'Lesen']); };
    const plant = (x, z) => { fur(x, z, .7, .7, .4, 0xc8703a); box(x, z, .5, .5, 1.1, 0x3fae4a, .4); box(x, z, 1.0, 1.0, .5, 0x4cc65a, 1.1); };
    const lamp = (x, z) => { box(x, z, .2, .2, 1.7, 0x6a6a7a); box(x, z, .6, .6, .5, 0xfff0a0, 1.7); solid(x, z, .5, .5, 2.2); };
    const chest = (x, z) => { /* an der Seitenwand: Schloss und Platz zum Öffnen zeigen zur Raummitte – so steht der Held neben der Truhe, nicht davor */
      const side = Math.abs(x - X0) > hw - 2.2 ? Math.sign(X0 - x) : 0; fur(x, z, side ? .9 : 1.4, side ? 1.4 : .9, .8, 0x8a5a2a); box(x, z, side ? 1.0 : 1.5, side ? 1.5 : 1.0, .12, 0xc23a2a, .8);
      if (side) box(x + side * .46, z, .12, .3, .3, 0xffd23f, .35); else box(x, z + .46, .3, .12, .3, 0xffd23f, .35); const open = !!S().c[d.id]; it('chest', side ? x + side * 1.3 : x, side ? z : z + 1.3, 1.5, ['🎁', 'Truhe öffnen'], { open }); };
    const kind = d.kind;
    /* Puppenstuben-Rand oben auf drei Wänden (vorne nicht, sonst läge er im Bild) und goldene Türmatte am Ausgang */
    for (const [x, z, w, dd] of [[X0, Z0 - hd, K0.w + .3, .3], [X0 - hw, Z0, .3, K0.d + .3], [X0 + hw, Z0, .3, K0.d + .3]]) box(x, z, w, dd, .22, 0xfff6e0, H - .02);
    box(X0, Z0 + hd - .75, 1.8, 1.0, .03, 0xffd23f, .01); box(X0, Z0 + hd - .75, 1.4, .7, .035, 0xfff0a0, .012);
    /* Themen-Dinge: an der Westwand (side), an der Nordwand (north), in der Mitte (center, Zelte) */
    const funIt = (type, x, z) => { const F = FUN[type]; if (F) it('fun', x, z, 1.5, F.label, { f: type }); };
    const prop = (type, where) => {
      const sx = X0 - hw + .6, sz = Z0 + .9, nx = X0 + .6, nz = Z0 - hd + .55, side = where === 'side', x = side ? sx : nx, z = side ? sz : nz;
      if (type === 'kamin') { fur(nx, nz, 2.4, .9, 1.4, 0x8a7a6a); box(nx, nz + .1, 1.6, .7, .9, 0x2a1a14, .25); box(nx - .3, nz + .2, .3, .3, .3, 0xff7a2a, .3); box(nx + .2, nz + .2, .3, .3, .45, 0xffc23a, .3); box(nx, nz, 2.7, 1.0, .15, 0x6a5a4a, 1.4); it('fire', nx, nz + 1.5, 1.6, ['🔥', 'Aufwärmen']); return; }
      if (type === 'bullauge') { for (const k of [-1.3, .5]) { b.cyl(nx + k, 1.4, Z0 - hd + .06, .55, .55, .1, 0xc9a24a, 14, Math.PI / 2); b.cyl(nx + k, 1.4, Z0 - hd + .1, .42, .42, .1, 0x5ac8ff, 14, Math.PI / 2); } return; }
      if (type === 'fass') { for (const [dx, dz, yy] of [[0, -.5, 0], [0, .5, 0], [0, 0, .9]]) b.cyl(x + .1 + dx, yy, z + dz, .45, .45, .85, 0x8a5a2a, 10); solid(x + .1, z, 1.0, 1.9, 1.8); box(x + .6, z - .5, .1, .1, .3, 0xc9ccdc, .4); }
      else if (type === 'waffen') { fur(x - .2, z, .3, 2.2, 2, 0x7a4a2a); b.cyl(x - .02, 1.4, z - .5, .45, .45, .08, 0xc23a3a, 12, 0, 0, Math.PI / 2); box(x - .02, z + .5, .06, .12, 1.4, 0xc9ccdc, .5); box(x - .02, z + .5, .08, .45, .1, 0x8a5a2a, .9); }
      else if (type === 'schluesselbrett') { fur(x - .25, z, .2, 2.4, .1, 0x8a5a2a, 1.1); box(x - .2, z, .1, 2.4, 1.2, 0xa86a3a, 1.1); [0xffd23f, 0xe8453c, 0x3f8cff, 0x4cd07d, 0xb48aff].forEach((c, k) => { box(x - .1, z - .9 + k * .45, .06, .1, .4, c, 1.4); b.sph(x - .1, 1.85, z - .9 + k * .45, .1, c, 0); }); }
      else if (type === 'surf') { box(x - .2, z - .5, .2, .7, 2.3, 0x35c6e0, 0, 0, .15); box(x - .1, z - .5, .22, .15, 2.1, 0xffffff, 0); solid(x - .2, z - .5, .4, .8, 2.3); for (let k = 0; k < 5; k++) b.sph(x + .4 + (k % 2) * .3, .08, z + .2 + k * .25, .12, [0xffb0c8, 0xfff0d0, 0xffd08a][k % 3], 0, 1, .5, 1); }
      else if (type === 'pilzlampe') { b.cyl(x, 0, z, .18, .22, 1.6, 0xfff0d8, 10); b.sph(x, 1.7, z, .8, 0xe8453c, 1, 1, .5, 1); for (let k = 0; k < 5; k++) b.sph(x + Math.cos(k * 1.3) * .5, 1.95, z + Math.sin(k * 1.3) * .5, .12, 0xffffff, 0); solid(x, z, .6, .6, 2); for (const dz of [-1.1, 1.1]) { b.cyl(x + .6, 0, z + dz, .12, .15, .45, 0xfff0d8, 8); b.sph(x + .6, .5, z + dz, .3, 0xff8a3a, 0, 1, .45, 1); } }
      else if (type === 'schnecke') { fur(x, z, .9, 1.2, .5, 0x9ad0ff); b.sph(x + .1, .75, z, .28, 0xff7aa8, 1, 1, 1, 1); b.sph(x + .1, .6, z + .3, .14, 0x9ad8ff, 0, 1, .8, 1.4); box(x + .1, z + .42, .03, .03, .2, 0x6a8aff, .78); }
      else if (type === 'sand') { box(x + .4, z, 2.2, 2.6, .12, 0xf2d898, .01); b.sph(x + .2, .1, z - .6, .45, 0x9a8a7a, 0, 1.4, .6, 1); solid(x + .2, z - .6, 1.2, .9, .4); }
      else if (type === 'musik') { box(x + .3, z, .06, .06, 1.2, 0x2a2a3a); box(x + .3, z, .5, .7, .06, 0x2a2a3a, 1.2, 0, -.4); box(x + .25, z + .05, .04, .55, .4, 0xffffff, 1.25); box(x + .45, z - .6, .08, .08, .7, 0x1a1a1a, .5, 0, 0, .5); solid(x + .3, z, .4, .5, 1.5); for (let k = 0; k < 3; k++) box(x - .25, z - 1 + k * .9, .06, .7, .55, [0xffd08a, 0x9ad8ff, 0xffa8c8][k], 1.6); }
      else if (type === 'kristall') { for (const [dx, dz, h, c] of [[0, 0, 1.6, 0x9ad8ff], [.3, -.5, 1.1, 0xc8a8ff], [.25, .5, .9, 0xa8ffe8]]) { b.cone(x + dx, 0, z + dz, .3, h, c, 6); b.sph(x + dx, h * .55, z + dz, .12, 0xffffff, 0); } solid(x + .2, z, .9, 1.4, 1.6); }
      else if (type === 'sterne') { box(nx, nz - .4, 2.4, .06, 1.6, 0x1a1a4a, 1.2); for (let k = 0; k < 9; k++) b.sph(nx - 1 + (k * .53 % 2.1), 1.4 + ((k * 7) % 11) / 10, nz - .35, .05, 0xfff3b0, 0); }
      else if (type === 'kloetze') { for (let k = 0; k < 6; k++) box(x + .1 + (k % 2) * .5, z - .7 + ((k / 2) | 0) * .6, .45, .45, .45, [0xe8453c, 0x3f8cff, 0xffd23f, 0x4cd07d, 0xb48aff, 0xff8a1f][k], (k % 3 === 0) ? .45 : 0); solid(x + .35, z - .1, 1.1, 1.9, .9); }
      else if (type === 'plan') { fur(nx, nz + .1, 2.2, .9, .9, 0xa8b8c8); box(nx, nz + .1, 1.8, .7, .02, 0x3a7ad8, .9); for (let k = 0; k < 4; k++) box(nx - .6 + k * .4, nz + .1, .02, .5, .022, 0xffffff, .91); }
      else if (type === 'netz') { box(x - .25, z, .05, 2.4, 1.6, 0x9a8a6a, .6); for (let k = 0; k < 6; k++) box(x - .22, z - 1.1 + k * .44, .04, .03, 1.6, 0x6a5a3a, .6); b.cyl(x + .2, 0, z + 1.2, .35, .35, .8, 0x7a4a2a, 10); solid(x + .2, z + 1.2, .7, .7, .8); box(x - .2, z - .3, .1, .5, .2, 0x8ad8ff, 1.2); }
      else if (type === 'koffer') { fur(x + .1, z, .7, 1.1, .7, 0xe8453c); box(x + .1, z, .75, .3, .05, 0xffd23f, .7); b.sph(x + .4, .3, z + 1.1, .3, 0xffffff, 1); b.sph(x + .4, .3, z + 1.1, .31, 0x3f8cff, 1, 1, .3, 1); }
      else if (type === 'heu') { fur(x + .1, z - .4, 1.0, 1.3, .8, 0xe8c85a); box(x + .1, z - .4, 1.05, .1, .82, 0xc8a83a); for (const dz of [.6, 1.1]) { b.cyl(x + .2, 0, z + dz, .2, .2, .7, 0xd8dce8, 10); b.cyl(x + .2, .7, z + dz, .1, .2, .15, 0xd8dce8, 10); } solid(x + .2, z + .85, .5, 1, .85); }
      else if (type === 'uhr') { const cx = X0 - .3, wz = Z0 - hd; b.cyl(cx, 1.9, wz + .08, 1.1, 1.1, .1, 0xc9a24a, 20, Math.PI / 2); b.cyl(cx, 1.9, wz + .12, .98, .98, .1, 0xffffff, 20, Math.PI / 2); b.box(cx, 1.9, wz + .2, .07, .62, .04, 0x1a1a2a); b.box(cx + .2, 1.86, wz + .2, .44, .08, .04, 0x1a1a2a); for (let q = 0; q < 12; q++) b.box(cx + Math.sin(q * .5236) * .82, 1.88 + Math.cos(q * .5236) * .82, wz + .19, .07, .07, .03, 0x3a3a5a); b.box(cx, .45, wz + .25, .05, 1.3, .05, 0xc9a24a); b.sph(cx, .45, wz + .25, .2, 0xffd23f, 1, 1, 1, .4); }
      else if (type === 'funk') { fur(nx, nz + .1, 2.4, .9, .85, 0x5a6070); box(nx - .5, nz, .8, .5, .5, 0x3a4050, .85); for (let k = 0; k < 3; k++) b.sph(nx - .75 + k * .25, 1.15, nz + .26, .06, [0x4cd07d, 0xffd23f, 0xe8453c][k], 0); box(nx + .5, nz + .2, .06, .06, .4, 0x2a2a2a, .85); b.sph(nx + .5, 1.3, nz + .2, .1, 0x2a2a2a, 0); }
      else if (type === 'tank') { b.cyl(nx, 0, nz + .3, 1.2, 1.2, 2.6, 0x8ab8d8, 16); b.cyl(nx, 1.2, nz + .3, 1.24, 1.24, .25, 0x6a98b8, 16); box(nx + 1.4, nz + .6, .14, .14, 1.0, 0xc9ccdc, .2); solid(nx, nz + .3, 2.4, 1.6, 2.6); }
      else if (type === 'ring') { b.cyl(nx, 1.8, Z0 - hd + .15, .6, .6, .18, 0xe8453c, 14, Math.PI / 2); b.cyl(nx, 1.8, Z0 - hd + .17, .38, .38, .2, wcol, 14, Math.PI / 2); for (let k = 0; k < 4; k++) b.box(nx + Math.cos(k * 1.571) * .5, 1.72 + Math.sin(k * 1.571) * .5, Z0 - hd + .26, .17, .17, .08, 0xffffff); }
      funIt(type, side ? sx + 1.4 : nx, side ? sz : nz + 1.5);
    };
    /* kleine Auswahl an Möbeln je Gebäude */
    if (kind === 'laden') {
      fur(X0, Z0 - hd + 1.6, hw * 1.5, .9, 1.1, 0xc98f55); box(X0, Z0 - hd + 1.6, hw * 1.55, 1.0, .1, 0xf6e6c0, 1.1); fur(X0 + hw * .5, Z0 - hd + 1.6, .8, .6, .5, 0x4a505c, 1.1); shelf(X0 - hw + .7, Z0 - 1, 'w'); shelf(X0 + hw - .7, Z0 - 1, 'e'); plant(X0 - hw + 1, Z0 + hd - 1.2); lamp(X0 + hw - 1, Z0 + hd - 1.2); chest(X0 + hw - 1.2, Z0 + 2);
      it('shop', X0, Z0 - hd + 3.2, 2.2, ['🛍️', 'Einkaufen']); R.npcAt = [X0 - 1.5, Z0 - hd + .9, 0];
      if (themeOf(d) === 'eis') for (let k = 0; k < 5; k++) { box(X0 - 2 + k * .75, Z0 - hd + 1.6, .55, .5, .12, 0xd8dce8, 1.2); b.sph(X0 - 2 + k * .75, 1.36, Z0 - hd + 1.6, .2, [0xffb0c8, 0xfff0c0, 0x8a5a3a, 0xa8ffc8, 0xc8a8ff][k], 0, 1, .6, 1); }
    } else if (kind === 'labor') {
      /* Professor Ulmes Labor: Versuchstisch, beschriftete Tränke und Sternenmodell */
      fur(X0, Z0 - .7, 2.8, 1.4, .9, 0x536b7c); box(X0, Z0 - .7, 2.9, 1.45, .12, 0xeaf6ff, .9);
      for (let k = 0; k < 5; k++) { const x = X0 - 2.5 + k * 1.25, col = [0x43d6c5, 0xb48aff, 0xff7ba0, 0xffd23f, 0x6bbcff][k]; box(x, Z0 - .55, .42, .42, .6, col, 1.05); b.sph(x, 1.72, Z0 - .55, .22, col, 1); }
      shelf(X0 - hw + .8, Z0 - 1, 'w'); chest(X0 + hw - 1.2, Z0 + 2); it('experiment', X0, Z0 + .7, 1.9, ['🧪', 'Experiment ansehen']); R.npcAt = [X0 + 2.3, Z0 + 1.7, 3.14];
    } else if (kind === 'kapitaen') {
      /* Kapitänshaus: Seekarte, Steuerrad und Fernrohr statt eines gewöhnlichen Wohnzimmers */
      fur(X0, Z0 - 1.1, 3.2, 2.1, .9, 0x7a4a2a); box(X0, Z0 - 1.1, 3.3, 2.2, .12, 0xd8bf8c, .9); box(X0, Z0 - 1.1, 2.2, 1.2, .035, 0x3a9ac8, 1.02);
      for (let k = 0; k < 4; k++) box(X0 - 1.1 + k * .7, Z0 - 1.1, .035, 1.5, .05, [0x3a9ac8, 0x45b87a, 0xe8b43a, 0x3a9ac8][k], 1.06);
      box(X0, Z0 + 1.7, .12, .9, .12, 0x8a5a2a, 1.5); box(X0, Z0 + 1.7, .9, .12, .12, 0x8a5a2a, 1.5); it('map', X0, Z0 + .5, 1.9, ['🗺️', 'Seekarte ansehen']);
      fur(X0 + hw - 1.3, Z0 - hd + 1.3, .7, .7, 1.4, 0x8a5a2a); it('scope', X0 + hw - 1.3, Z0 - hd + 2.3, 1.8, ['🔭', 'Zum Meer spähen']); chest(X0 - hw + 1.2, Z0 + 2.4); R.npcAt = [X0 - 2.5, Z0 + .8, .6];
    } else if (kind === 'werkstatt') {
      /* Werkstatt-Haus: Werkbank, Werkzeugwand und ein benutzbarer Hammerplatz */
      fur(X0, Z0 - hd + 1.4, hw * 1.2, 1, 1, 0x8a5a2a); box(X0, Z0 - hd + 1.4, hw * 1.24, 1.04, .12, 0xd0b070, 1);
      for (let k = 0; k < 4; k++) { box(X0 - 2.2 + k * 1.45, Z0 - hd + .65, .12, .14, 1.4, 0x6b5540, .4); box(X0 - 2.2 + k * 1.45, Z0 - hd + .65, .44, .18, .12, [0xc0d0e0, 0xd0a050, 0xc0d0e0, 0xd0a050][k], 1.2); }
      chest(X0 + hw - 1.2, Z0 + 2); it('hammer', X0, Z0 + .4, 1.9, ['🔨', 'Hämmern']); R.npcAt = [X0 - 2.6, Z0 + 1.3, .8];
    } else if (kind === 'schmiede') {
      fur(X0 - 1.8, Z0 - 1.2, 1.4, 1.0, .9, 0x3a3f4a); box(X0 - 1.8, Z0 - 1.2, 1.9, .6, .25, 0x5a6070, .9); fur(X0 + 2.8, Z0 - hd + 1.2, 2.4, 1.6, 1.3, 0x6a5a4a); box(X0 + 2.8, Z0 - hd + 1.4, 1.8, .2, .9, 0xff7a2a, .3); fur(X0 - hw + .7, Z0 + 1.5, .6, 2.6, 1.6, 0x7a4a2a); for (let k = 0; k < 4; k++) box(X0 - hw + .75, Z0 + .4 + k * .7, .3, .15, 1.2, 0xc9ccdc, .3); chest(X0 + hw - 1.2, Z0 + 2.2); plant(X0 + hw - 1, Z0 + hd - 1.2); lamp(X0 - hw + 1, Z0 + hd - 1.2);
      it('hammer', X0 - 1.8, Z0 + .3, 1.9, ['🔨', 'Hämmern']); R.npcAt = [X0 + 1, Z0 - 1.5, 3.14];
    } else if (kind === 'turm') {
      fur(X0 + hw - 1.2, Z0 - hd + 1.2, 1.4, 1.4, .8, 0x7a4a2a); box(X0 + hw - 1.2, Z0 - hd + 1.2, .25, .25, 1.4, 0x6a6a7a, .8); box(X0 + hw - 1.2, Z0 - hd + .8, .4, .4, 1.6, 0xb08a4a, 1.6 + 0); it('scope', X0 + hw - 1.2, Z0 - hd + 2.6, 1.8, ['🔭', 'Fernrohr']); for (let k = 0; k < 7; k++) fur(X0 - hw + 1.3 + Math.cos(k * .55) * 1.1, Z0 - hd + 1.3 + Math.sin(k * .55) * 1.1, .9, .5, .3 + k * .22, 0xa8a8b8); table(X0 - 1.2, Z0 + 1, true); lamp(X0 + hw - 1, Z0 + hd - 1.2); chest(X0 - hw + 1.2, Z0 + hd - 1.4); R.npcAt = [X0 + 1.4, Z0 + .5, 3.9]; if (TH.north) prop(TH.north, 'north');
    } else if (kind === 'zelt') {
      fur(X0, Z0 - 1.3, 1.3, 1.3, .9, 0x6a3a8a); if (TH.center === 'teppich') { for (let k = 0; k < 3; k++) b.cyl(X0 - .4 + k * .4, .9, Z0 - 1.3, .17, .17, 1.2, [0xc23a3a, 0x3a6ad8, 0xffb04a][k], 10, Math.PI / 2); box(X0, Z0 + 1.6, 2.6, 1.6, .05, 0xc23a5a, .02); box(X0, Z0 + 1.6, 2.2, 1.2, .055, 0xffd23f, .021); }
      else if (TH.center === 'gewuerz') { for (let k = 0; k < 4; k++) { b.cyl(X0 - .45 + (k % 2) * .9, .9, Z0 - 1.6 + ((k / 2) | 0) * .6, .25, .2, .3, 0xd8b88a, 10); b.sph(X0 - .45 + (k % 2) * .9, 1.2, Z0 - 1.6 + ((k / 2) | 0) * .6, .22, [0xe8453c, 0xffc23a, 0x8a4a2a, 0x4cae5a][k], 0, 1, .5, 1); } }
      else if (TH.center === 'lampe') { b.sph(X0, 1.05, Z0 - 1.3, .25, 0xffd23f, 1, 1.6, .6, 1); b.cone(X0 + .45, .95, Z0 - 1.3, .08, .3, 0xffd23f, 6); for (let k = 0; k < 4; k++) { box(X0 - 2.6 + k * 1.7, Z0 - hd + .6, .06, .06, 1.2, 0xc9a24a, 1.6); b.sph(X0 - 2.6 + k * 1.7, 1.5, Z0 - hd + .6, .22, [0xff7a2a, 0x9a5be0, 0x35d6e0, 0xffd23f][k], 1); } }
      else box(X0, Z0 - 1.3, .9, .9, .6, 0xbfeaff, .9);
      if (TH.center) funIt(TH.center, X0, Z0 + .3); else it('ball', X0, Z0 + .3, 1.9, ['🔮', 'Kristallkugel']); for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(X0 + sx * 2.2, Z0 + sz * 1.8 + .8, .9, .9, .35, [0xff5a8a, 0xffd23f, 0x35d6e0, 0xb48aff][(sx + 1 + (sz + 1) / 2) | 0], .02);
      shelf(X0 - hw + .7, Z0 - 1.5, 'w'); chest(X0 + hw - 1.2, Z0 + 2); lamp(X0 + hw - 1, Z0 - hd + 1.2); plant(X0 - hw + 1, Z0 + hd - 1.2); R.npcAt = [X0 + 1.8, Z0 - .5, 4.2];
    } else if (kind === 'schloss') {
      /* Große Kristall-Burg: zentraler Thronsaal, zwei Seitenflügel, Galerie und hohe Fenster. */
      const stone = 0xded4ec, gold = 0xffd45b, rose = 0x9d4e9f, glass = 0x8fd8ff;
      box(X0, Z0 - hd + 4, 9, 5, .65, 0xc23a8a); fur(X0, Z0 - hd + 2.2, 3.2, 2.2, 1.2, rose); box(X0, Z0 - hd + 1.4, 2.2, .45, 2.2, gold, 1.2); box(X0, Z0 - hd + .5, 5.4, .28, 2.0, gold, 2.8);
      box(X0, Z0 + 5, 3.4, 18, .05, 0xc23a3a, .03); box(X0, Z0 + 5, 2.4, 16, .06, 0xffe9b0, .04);
      /* Teilwände lassen breite Tore offen und teilen Thronsaal, Schatzraum und Musikflügel. */
      for (const side of [-1, 1]) {
        const sx = X0 + side * 12;
        box(sx, Z0, 1.1, 27, 5.6, stone);
        box(sx, Z0, 1.25, 27.2, .2, rose, 5.6);
        W.addBox(sx - .6, Z0 - 13.5, sx + .6, Z0 - 4.2, false, 5.7);
        W.addBox(sx - .6, Z0 + 4.2, sx + .6, Z0 + 13.5, false, 5.7);
      }
      for (const sx of [-19, -15, 15, 19]) for (const sz of [-13, -5, 4, 13]) {
        fur(X0 + sx, Z0 + sz, 1.25, 1.25, 8.5, stone);
        box(X0 + sx, Z0 + sz, 1.55, 1.55, .35, gold, 8.5);
      }
      for (const side of [-1, 1]) for (const sz of [-11, 0, 11]) {
        const wx = X0 + side * 23.7;
        box(wx, Z0 + sz, .12, 5.4, 3.3, glass, 4.1);
        box(wx, Z0 + sz, .24, 5.6, .14, gold, 4.1);
        box(wx, Z0 + sz, .24, .14, 3.5, gold, 4.1);
      }
      for (let i = 0; i < 9; i++) {
        const y = .25 + i * .32, z = Z0 - 7 - i * .72;
        box(X0 - 19 + i * .7, z, 3.4, .34, 1.5, stone, y);
        box(X0 + 19 - i * .7, z, 3.4, .34, 1.5, stone, y);
      }
      box(X0, Z0 - 14, 2.6, 12, .22, gold, 5.5);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
        const tx = X0 + sx * 22, tz = Z0 + sz * 16;
        fur(tx, tz, 6.8, 6.8, 15, stone);
        const tower = new THREE.Mesh(new THREE.ConeGeometry(4.8, 9, 8), new THREE.MeshBasicMaterial({ color: ((sx * sz) > 0 ? 0x9b78d1 : 0x668ad6) }));
        tower.position.set(tx, 18, tz); grp.add(tower);
        box(tx, tz, 2.3, 2.3, .5, gold, 10);
      }
      chest(X0 + 18, Z0 - 5); shelf(X0 - 18, Z0 - 5, 'w');
      for (let i = 0; i < 5; i++) { const cx = X0 + (i - 2) * 3, cz = Z0 + 13; box(cx, cz, .6, .6, 1.8 + i % 2, [0xff687f,0xffd34d,0x55b8ff,0x62cf8e,0xb882ff][i]); }
      lamp(X0, Z0 - 4);
      it('throne', X0, Z0 - hd + 6, 2.2, ['👑', 'Auf den Thron setzen']);
      it('stairs', X0 - 16, Z0 - 5, 2.8, ['🪜', 'Galerie erkunden']);
      R.npcAt = [X0 - 3.6, Z0, 4.8];
    } else if (kind === 'hoehle') {
      for (let k = 0; k < 9; k++) { const sx = (rng() - .5) * (K0.w - 2), sz = (rng() - .5) * (K0.d - 3) - 1; if (Math.hypot(sx, sz) < 2.4) continue; b.cone(X0 + sx, 0, Z0 + sz, .4 + rng() * .4, 1.2 + rng() * 1.8, 0x7a7488, 6); solid(X0 + sx, Z0 + sz, .8, .8, 2); } for (const [dx, dz, col] of [[-3.5, -2.5, 0x9ad8ff], [3.4, -3, 0xff9ad8], [-3, 2.5, 0x9affc8]]) { b.cone(X0 + dx, 0, Z0 + dz, .35, 1.4, col, 5); b.sph(X0 + dx, 1.5, Z0 + dz, .25, col, 1); solid(X0 + dx, Z0 + dz, .6, .6, 1.5); }
      box(X0, Z0 - 1.6, 3.2, 3.2, .05, 0x1a1a24, .02); box(X0, Z0 - 1.6, 2.4, 2.4, .06, 0x000000, .03); for (let k = 0; k < 4; k++) box(X0, Z0 - .4 - k * .55, 3.0 - k * .5, .5, .25, 0x8a8a98, 0); it('stairs', X0, Z0 + .6, 2.2, ['🕳️', 'Abstieg ins Mini-Spiel']); chest(X0 + hw - 1.3, Z0 + 2.4); R.npcAt = [X0 - 2.6, Z0 + 2.4, 1.2];
    } else if (kind === 'grotte') {
      /* Lichtgrotte hinter dem Tor der Wunsch-Insel: leuchtende Kristalle am Rand, das warme Licht in der Mitte */
      for (const [dx, dz, col] of [[-3.3, -2.6, 0x9ad8ff], [3.2, -2.8, 0xff9ad8], [-3.4, 1.6, 0x9affc8], [3.4, 1.2, 0xffe08a], [-1.6, -3.2, 0xb89aff], [1.7, -3.3, 0x9ad8ff]]) { b.cone(X0 + dx, 0, Z0 + dz, .4, 1.6, col, 5); b.sph(X0 + dx, 1.7, Z0 + dz, .26, col, 1); solid(X0 + dx, Z0 + dz, .6, .6, 1.6); }
      b.cyl(X0, 0, Z0 - 1.1, 1.1, 1.3, .35, 0x6a5aa8, 14); b.sph(X0, 1.5, Z0 - 1.1, .85, 0xfff0b0, 1); for (let k = 0; k < 7; k++) { const g = k / 7 * TAU; b.sph(X0 + Math.sin(g) * 1.25, 1.2 + (k % 3) * .35, Z0 - 1.1 + Math.cos(g) * 1.25, .12, 0xffd23f, 0); } solid(X0, Z0 - 1.1, 1.3, 1.3, 1.5);
      funIt('licht', X0, Z0 + .4); chest(X0 + hw - 1.3, Z0 + 2.2); R.npcAt = [X0 - 2.6, Z0 + 1.4, 1.2];
    } else if (kind === 'heil') {
      /* Taschi-Heilhaus: Tresen mit Heil-Automat (Ballregal), Betten, Team-Tisch */
      fur(X0, Z0 - hd + 1.5, hw * 1.7, .9, 1.1, 0xffffff); box(X0, Z0 - hd + 1.5, hw * 1.75, 1.0, .12, 0xe8453c, 1.1); box(X0, Z0 - hd + 1.5, 1.2, .2, .14, 0xffffff, 1.2);
      fur(X0 + hw * .5, Z0 - hd + 1.5, 2.4, .9, 1.7, 0xf4f4ff); for (let k = 0; k < 6; k++) { box(X0 + hw * .5 - 1.0 + (k % 3) * 1.0, Z0 - hd + 1.9, .5, .3, .5, [0xe8453c, 0x3f8cff, 0x4cc05a][k % 3], 1.95 - (k > 2 ? .6 : 0)); }
      it('tcenter', X0 + hw * .5, Z0 - hd + 3.1, 2.6, ['💖', 'Taschis heilen']);
      fur(X0 - hw * .5, Z0 - hd + 1.5, 2.2, .9, 1.0, 0xffe0ea); box(X0 - hw * .5, Z0 - hd + 1.5, 1.4, .3, .1, 0xff9ac0, 1.05); it('tteam', X0 - hw * .5, Z0 - hd + 3.1, 2.4, ['🎒', 'Team & Lager ansehen']);
      bed(X0 - hw + 1.4, Z0 + 1.2); bed(X0 + hw - 1.4, Z0 + 1.2); plant(X0 - hw + 1, Z0 + hd - 1.2); plant(X0 + hw - 1, Z0 + hd - 1.2); lamp(X0 + 2.4, Z0 + hd - 1.2);
      R.npcAt = [X0, Z0 - hd + 2.6, 0];
    } else {
      /* Wohnhaus, Hütte, Pilz, Frucht, Stein, Kopf, Eimer, Heldenheim */
      bed(X0 - hw + 1.4, Z0 - hd + 2); table(X0 + 1.2, Z0 - .6, true); shelf(X0 + hw - .7, Z0 - 1.6, 'e'); plant(X0 - hw + 1, Z0 + hd - 1.2); lamp(X0 - hw + 2.1, Z0 + hd - 1.0); chest(X0 + hw - 1.3, Z0 + 2.2);
      if (kind === 'huette') { fur(X0, Z0 - hd + .9, 2.4, 1.2, 1.5, 0x6a5a4a); box(X0, Z0 - hd + 1.1, 1.6, .2, .9, 0xff7a2a, .3); it('fire', X0, Z0 - hd + 2.6, 1.8, ['🔥', 'Aufwärmen']); }
      else if (kind === 'frucht') { fur(X0 - 1.8, Z0 + 1.6, 1.6, .6, .7, 0x4a505c); box(X0 - 1.8, Z0 + 1.6, 1.4, .1, .9, 0x2a2a3a, .6); it('tv', X0 - 1.8, Z0 + 2.6, 1.8, ['📺', 'Fernsehen']); }
      else if (kind === 'held') { fur(X0 - 2.6, Z0 - hd + .9, 1.2, 1.2, 1.1, 0xc9d0e0); box(X0 - 2.6, Z0 - hd + .9, .5, .5, .5, 0xffd23f, 1.1); it('cup', X0 - 2.6, Z0 - hd + 2.4, 1.8, ['🏆', 'Heldenpokal ansehen']); }
      else if (kind === 'eimer') { fur(X0 - 2.2, Z0 + 1.8, 1.4, .8, .9, 0xc9d0e0); box(X0 - 2.2, Z0 + 1.8, .9, .6, .08, 0x3fae4a, .9); it('recipe', X0 - 2.2, Z0 + 2.9, 1.8, ['📜', 'Geheimrezept lesen']); }
      if (TH.side) prop(TH.side, 'side'); if (TH.north && kind !== 'huette') prop(TH.north, 'north');
      R.npcAt = [X0 - .9, Z0 + .4, 0.8];
    }
    grp.add(b.mesh(mat)); const [nm, lines] = NAMEN[(idx * 3 + (d.name.length | 0)) % NAMEN.length]; if (d.tshop) it('tshop', X0 + hw * .5, Z0 - hd + 3.0, 2.6, ['🔴', 'Taschiball-Laden']);
    const themedTalk = { labor: ['Professor Ulme', ['Willkommen in meinem Labor! Hier untersuche ich die bunten Inselpflanzen. 🧪', 'Die Tränke sind nur zum Anschauen – aber das Sternenmodell darfst du drehen!']], kapitaen: ['Kapitänin Mira', ['Willkommen an Bord! Die Karte zeigt alle Inseln, die ich schon besucht habe. 🗺️', 'Durch das Fernrohr kannst du nach neuen Abenteuern Ausschau halten. 🔭']], werkstatt: ['Tüftler Ben', ['Hier repariere ich Fahrzeuge und baue neue Spielsachen. 🛠️', 'Am Werktisch darfst du mir beim Hämmern helfen! 🔨']] };
    R.res = TH.npc || themedTalk[d.kind] || (d.kind === 'heil' ? ['Schwester Hanna', ['Willkommen im Heilhaus! Gib mir dein Team – im Nu sind alle Taschis wieder fit. 💖', 'Tipp: Wenn dein ganzes Team müde ist, wachst du hier wieder auf.']] : [d.kind === 'laden' ? 'Verkäufer ' + nm.split(' ')[0] : d.kind === 'schloss' ? 'Wächter ' + nm.split(' ')[0] : nm, lines]);
    const sp = sprite((K0.title || '🏠') + ' ' + d.name, 3.1, 5.2, X0, Z0 - hd + .5); grp.add(sp);
    grp.visible = false; return R;
  }
  const folkRef = { arr: null };
  K.people = function (folk) { folkRef.arr = folk; };
  function spawnResident(R) {
    const a = R.npcAt || [R.X0, R.Z0, 0], look = [{ shirt: 0xe8453c, pants: 0x4a3a2a, hair: 0x6a4a2a, skin: 0xf6d2b0 }, { shirt: 0x3a8ae8, pants: 0xf4f4ff, hair: 0xf4d060, skin: 0xd8a070, dress: true }, { shirt: 0x4cd07d, pants: 0x3a4a6a, hair: 0x2a2a2a, skin: 0x8a5a33 }, { shirt: 0xb48aff, pants: 0xffffff, hair: 0xe8e8e8, skin: 0xf6d2b0, style: 'long', dress: true }][R.d.id % 4], c = BI.makeChar(Object.assign({ hat: R.d.kind === 'laden' ? 'chef' : R.d.kind === 'schloss' ? 'helmet' : 'none', style: look.style || 'short', scale: .95 }, look));
    c.group.position.set(a[0], 0, a[1]); c.group.rotation.y = a[2]; scene.add(c.group); c.group.visible = false; const n = { c, x: a[0], z: a[1], h: a[2], h0: a[2], p: { name: R.res[0], lines: R.res[1], i: 0 }, wait: 0, hop: 0, kid: false, fixed: true, indoor: R.d.id }; if (folkRef.arr) folkRef.arr.push(n); R.npc = n; W.addCircle(a[0], a[1], .5, false, 1.8);
  }
  /* ---------- Hineingehen / Hinausgehen ---------- */
  K.enter = function (d) {
    if (P.veh) { say('🚪 Steig erst aus 🙂', 1800); return; }
    let R = rooms.get(d.id); if (!R) { R = build(d); rooms.set(d.id, R); spawnResident(R); }
    K.inside = R; K.back = { x: d.x, z: d.z, h: d.h }; for (const r of rooms.values()) { r.grp.visible = r === R; if (r.npc) r.npc.c.group.visible = r === R; }
    fx.burst(P.x, 1.2, P.z, 10, [[1, .85, .3], [1, 1, 1]], 3, .8, 26, 3); A.pop && A.pop(); P.x = R.X0; P.z = R.Z0 + R.hd - 2.8; P.y = 0; P.vy = 0; P.h = Math.PI; if (G.cam) { G.cam.yaw = 0; }
    if (d.onEnter) d.onEnter(); const s = S(); if (!s.v[d.id]) { s.v[d.id] = 1; persist(); stars(1); const n = Object.keys(s.v).length; say('🚪 ' + d.name + ' – neu entdeckt! +1 ⭐ (' + n + ' Gebäude)', 3600); if (n === 5) earn('forscher5'); if (n === 20) earn('forscher20'); if (n === 40) earn('forscher40'); } else say('🚪 ' + d.name, 1800);
  };
  K.leave = function () {
    const R = K.inside; if (!R) return; const b = K.back; K.inside = null; R.grp.visible = false; if (R.npc) R.npc.c.group.visible = false; P.x = b.x; P.z = b.z; P.y = W.groundY(b.x, b.z); P.vy = 0; P.h = b.h; A.pop && A.pop(); fx.burst(P.x, 1.2, P.z, 10, [[1, .85, .3], [1, 1, 1]], 3, .8, 26, 3);
  };
  /* ---------- Aktionen ---------- */
  K.near = function () {
    if (P.veh || P.y - (K.inside ? 0 : W.groundY(P.x, P.z)) > 2.5 || K.panel) return null;
    if (K.inside) { const R = K.inside; if (nr(R.exit, 1.9)) return { k: 'inout', label: ['🚪', 'Hinausgehen'] }; let best = null, bd = 1e9; for (const i of R.items) { const dd = Math.hypot(P.x - i.x, P.z - i.z); if (dd < i.r && dd < bd) { bd = dd; best = i; } } /* das nächste Ding gewinnt, nicht das zuerst gebaute */
      return best ? { k: 'initem', i: best, label: best.type === 'chest' && best.open ? ['🎁', 'Truhe (leer)'] : best.label } : null; }
    if (P.x < 2500) for (const d of BI.DOORS) if (Math.abs(P.x - d.x) < 3 && Math.abs(P.z - d.z) < 3 && Math.hypot(P.x - d.x, P.z - d.z) < 2.3 && (!d.gate || d.gate(save))) return { k: 'door', d, label: ['🚪', d.name + ' betreten'] };
    return null;
  };
  K.busy = () => !!K.panel;
  const close = () => { if (!K.panel) return; K.panel.remove(); K.panel = null; G.updateButtons && G.updateButtons(true); };
  function shop() {
    G.setStick && G.setStick(0, 0); const p = K.panel = document.createElement('div'); p.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(20,10,40,.55);z-index:60;font-family:Fredoka,system-ui,sans-serif'; const card = document.createElement('div'); card.style.cssText = 'background:#fffaf0;border:6px solid #e0902a;border-radius:24px;padding:14px 16px;width:min(92vw,400px);text-align:center'; p.appendChild(card);
    const draw = () => { card.innerHTML = '<div style="font-size:26px;font-weight:900;color:#8a4a1a">🛍️ Einkaufen</div><div style="font-weight:700;color:#6a4a2a;margin:4px 0 8px">⭐ ' + (save.stars | 0) + '</div>'; for (const [id, em, nm, pr] of ((K.inside && K.inside.shop) || SHOP)) { const b = document.createElement('button'); b.type = 'button'; b.style.cssText = 'display:flex;width:100%;align-items:center;gap:10px;margin:5px 0;background:#fff;border:3px solid #f0c890;border-radius:14px;padding:6px 10px;font:800 17px inherit;cursor:pointer'; b.innerHTML = '<span style="font-size:32px">' + em + '</span><span style="flex:1;text-align:left">' + nm + '</span><span style="color:#b07a00">⭐ ' + pr + '</span>'; b.onclick = () => { if ((save.stars | 0) < pr) { say('⭐ Dafür fehlen dir noch Sterne.', 2200); A.bonk && A.bonk(); return; } stars(-pr); const iv = G.inv && G.inv(); if (iv) iv[id] = (iv[id] || 0) + 1; A.buy && A.buy(); say(em + ' ' + nm + ' im Rucksack! (zum Essen oder Füttern)', 2200); draw(); }; card.appendChild(b); } const x = document.createElement('button'); x.type = 'button'; x.textContent = '✔ Fertig'; x.style.cssText = 'margin:8px;border-radius:16px;border:4px solid #4cd07d;background:#fff;padding:8px 26px;font:900 19px inherit;cursor:pointer'; x.onclick = close; card.appendChild(x); };
    draw(); document.body.appendChild(p);
  }
  K.act = function (n) {
    if (!n) return; const s = S();
    if (n.k === 'door') { K.enter(n.d); return; } if (n.k === 'inout') { K.leave(); return; }
    const i = n.i, R = K.inside, id = R.d.id;
    if (i.type === 'chest') { if (s.c[id]) { say('🎁 Die Truhe ist schon leer.', 1800); return; } s.c[id] = 1; i.open = true; const nn = Object.keys(s.c).length, big = ['schloss', 'hoehle', 'schmiede'].includes(R.d.kind); stars(big ? 3 : 1); const iv = G.inv && G.inv(), f = ['apple', 'cookie', 'banana', 'cakeslice', 'icecream'][(id + nn) % 5]; if (iv) iv[f] = (iv[f] || 0) + 1; A.fanfare && A.fanfare(); fx.burst(P.x, 1.6, P.z, 22, [[1, .9, .4], [1, 1, 1], [1, .5, .5]], 4, 1.2, 28, 3); say('🎁 Truhe: +' + (big ? 3 : 1) + ' ⭐ und etwas Leckeres für dein Kapselmonster! (' + nn + ' Truhen)', 4200); if (nn === 10) earn('truhen10'); persist(); return; }
    if (i.type === 'fun') { const F = FUN[i.f], k = 'f' + id + i.f, n = s.o[k] | 0, t = F.txt[n % F.txt.length]; s.o[k] = n + 1; fx.burst(P.x, 1.6, P.z - .6, 16, F.col.concat([[1, 1, 1]]), 3, 1, 26, 3);
      if (F.snd === 'notes') for (let q = 0; q < 5; q++) note(392 + [0, 2, 4, 5, 7][q] * 33, .18, 'sine', .07, q * .16); else if (F.snd === 'bell') for (let q = 0; q < 3; q++) note(262, .5, 'sine', .1, q * .55); else if (F.snd === 'chime') for (let q = 0; q < 3; q++) note(784 + q * 196, .2, 'triangle', .06, q * .09); else A.pop && A.pop();
      const gk = 'g' + id; if (!s.o[gk]) { s.o[gk] = 1; const iv = F.gift && G.inv && G.inv(); if (iv) iv[F.gift[0]] = (iv[F.gift[0]] || 0) + 1; stars(1); say(t + (F.gift ? ' Geschenk: ' + F.gift[1] + ' im Rucksack,' : '') + ' +1 ⭐', 4200); } else say(t, 3800); persist(); return; }
    if (i.type === 'tcenter') { G.taschiHeal && G.taschiHeal(); return; } if (i.type === 'tteam') { G.taschiTeam && G.taschiTeam(); return; } if (i.type === 'tshop') { G.taschiShop && G.taschiShop(); return; }
    if (i.type === 'bed') { fx.burst(P.x, 1.4, P.z, 12, [[.6, .7, 1], [1, 1, 1]], 2, .8, 30, 2); say('😴 Zzz … schön ausgeruht! Jetzt geht es weiter.', 2800); A.hello && A.hello(); return; }
    if (i.type === 'table') { const k = 't' + id; if (!s.o[k]) { s.o[k] = 1; const iv = G.inv && G.inv(); if (iv) iv.apple = (iv.apple || 0) + 1; stars(1); say('🍎 Lecker! Ein Apfel im Rucksack. +1 ⭐', 3000); persist(); } else say('🍽️ Der Tisch ist leer – du hast schon alles aufgegessen. 😋', 2400); A.buy && A.buy(); return; }
    if (i.type === 'shelf') { const own = ISLE_TIPS[R.d.isle] || [], L = own.length ? own.concat(TIPPS.slice(1, 4)) : TIPPS, t = L[(id + (s.o.r | 0)) % L.length]; s.o.r = (s.o.r | 0) + 1; say(t, 5200); A.speak && A.speak(t.replace('📚 ', '')); return; }
    if (i.type === 'shop') { shop(); return; }
    if (i.type === 'hammer') { for (let k = 0; k < 5; k++) note(330 + (k % 2) * 60, .12, 'square', .08, k * .13); fx.burst(P.x - 1, 1, P.z - 1, 14, [[1, .7, .2], [1, 1, .6]], 4, .8, 22, 2); say('🔨 Klong-klong! Funken sprühen!', 2200); return; }
    if (i.type === 'map') { say('🗺️ Auf der Karte sind Strand, Wald und die Inseln eingezeichnet. Wo möchtest du als Nächstes hin?', 3600); return; }
    if (i.type === 'experiment') { const t = ['🧪 Die blaue Mischung glitzert wie das Meer!', '🧪 Die Pflanzenprobe duftet nach Sommer.', '🧪 Das Sternenmodell dreht sich ganz langsam.'][(s.o.lab | 0) % 3]; s.o.lab = (s.o.lab | 0) + 1; say(t, 3200); return; }
    if (i.type === 'scope') { const t = ['🔭 Du siehst die ganze Insel – und das Meer dahinter!', '🔭 Dort hinten schwimmt ein Schwarm bunter Fische.', '🔭 Weit weg leuchtet eine schwebende Festung am Himmel!'][(s.o.s | 0) % 3]; s.o.s = (s.o.s | 0) + 1; say(t, 3600); return; }
    if (i.type === 'ball') { const t = ['🔮 Ich sehe: Heute findest du einen Schatz!', '🔮 Ich sehe: Du bekommst bald ein neues Abenteuer.', '🔮 Ich sehe: Ein Freund wartet auf dich! ❤️'][(s.o.b | 0) % 3]; s.o.b = (s.o.b | 0) + 1; fx.burst(P.x, 1.8, P.z - 1, 14, [[.7, .5, 1], [1, 1, 1]], 3, 1, 28, 2); say(t, 3600); return; }
    if (i.type === 'fire') { say('🔥 Brrr, drinnen ist es schön warm. Du wärmst dir die Hände.', 2800); fx.burst(P.x, 1.2, P.z - 1.4, 10, [[1, .6, .2], [1, .9, .4]], 2, 1, 26, 3); return; }
    if (i.type === 'tv') { say('📺 Ein lustiger Trickfilm läuft: Ein Schwamm brät Burger … Hihi!', 3600); return; }
    if (i.type === 'cup') { say('🏆 Der Heldenpokal! Hier steht: „Für den mutigsten Helden der sieben Meere.“', 4200); return; }
    if (i.type === 'recipe') { say('📜 „Geheimrezept: 1 Brötchen, 1 Frikadelle, viel Liebe.“ Mehr verrät es nicht!', 4200); return; }
    if (i.type === 'throne') { A.fanfare && A.fanfare(); fx.burst(P.x, 2.4, P.z, 24, [[1, .85, .3], [1, .5, .8], [.5, .8, 1]], 4, 1.4, 30, 3); say('👑 Du sitzt auf dem Thron! Alle jubeln.', 3200); return; }
    if (i.type === 'stairs') { say('🕳️ Du steigst die Stufen hinab … Stockwerk 1!', 2200); G.start && G.start('hoehle_raetsel'); return; }
  };
  /* Bild für Bild: Innenraum gibt es nur, solange man drin ist; Tür-Hinweis außen */
  let doorHint = 0;
  K.update = function (dt) {
    if (K.inside) { if (P.x < 2500) { K.inside = null; for (const r of rooms.values()) { r.grp.visible = false; if (r.npc) r.npc.c.group.visible = false; } } else { const R = K.inside; P.x = BI.clamp(P.x, R.X0 - R.hw + .5, R.X0 + R.hw - .5); P.z = BI.clamp(P.z, R.Z0 - R.hd + .5, R.Z0 + R.hd - .5);
      /* Wer ganz bis an die Haustür läuft, geht hinaus – wie durch eine echte Tür (die Aktionstaste geht weiterhin) */
      if (!K.panel && P.z > R.Z0 + R.hd - .58 && Math.abs(P.x - R.X0) < .9) K.leave(); } }
    else if (P.x < 2500) { doorHint -= dt; if (doorHint <= 0) { doorHint = 1; if (!S().o.hint) for (const d of BI.DOORS) if (Math.hypot(P.x - d.x, P.z - d.z) < 6) { S().o.hint = 1; persist(); say('🚪 Gebäude kann man betreten! Stell dich auf die goldene Türmatte und drück die Aktionstaste.', 5200); break; } } }
  };
  K.log = function () {
    const s = S(), n = Object.keys(s.v).length, N = BI.DOORS.length, c = Object.keys(s.c).length; return { title: '🚪 Gebäude erkunden', count: Math.min(3, (n >= 5 ? 1 : 0) + (n >= 20 ? 1 : 0) + (c >= 10 ? 1 : 0)) + ' von 3', rows: [{ ok: n >= 5, icon: '🚪', text: 'Gebäude betreten: ' + n + ' von ' + N + ' (5 für den Sticker)', dest: 'insel' }, { ok: n >= 20, icon: '🏘️', text: '20 verschiedene Gebäude betreten', dest: 'insel' }, { ok: c >= 10, icon: '🎁', text: 'Schatztruhen in Gebäuden öffnen: ' + c + ' von 10', dest: 'insel' }] };
  };
  K.dbg = { rooms, build, S, DOORS: BI.DOORS };
  return K;
};
