'use strict';
/* Bunte Insel – Atlantis (Erweiterung): eine moderne Stadt tief unter der Erde, inspiriert von der alten Sage von Atlantis
   (Platon, vor ca. 2400 Jahren – gemeinfreie Sage; ob es Atlantis wirklich gab, weiß niemand). Alles Konkrete ist selbst erfunden.
   Eingang: ein leuchtendes Steintor am See der Hauptinsel (🧭 → Atlantis). Die Stadt liegt weit weg in einer eigenen Höhle (Kuppel mit Kristallsternen),
   gebaut wie in der Sage: Ringe aus Land und Wasser (Kanäle mit Brücken), in der Mitte ein Stufen-Berg (Akropolis) mit Tempel und dem „Herz von Atlantis“.
   Was es sonst nirgends gibt: Aqua-Gleiter (schwebende Fahrzeuge), Schwerelos-Halle (Mondschwerkraft), Kristall-Harfe (Spielinstrument),
   Hologramm-Archiv (die Sage in 5 Bildern), Orichalcum-Splitter (→ Sterne), Delfin-Drohnen und Leuchtquallen, Highlight-Spiel „Strömungs-Rätsel“.
   Technik: eigene Batches (nur sichtbar, wenn man in der Nähe ist), beim Hinabsteigen werden die großen Hauptwelt-Meshes ausgeblendet (spart GPU). */
/* Abstieg an der Küste der Hauptinsel (Süden, neben dem Steg): eine breite Steintreppe führt 5,5 m nach unten in einen überdachten Gang; am Ende geht es nahtlos nach Atlantis.
   a = Richtung (Winkel von +z aus, x = sin a), r0 = Radius des Treppenanfangs, L = Länge der Treppe, land = ebenes Stück davor, da = halbe Winkelbreite des Lochs im Boden */
BI.ATLANTIS = { x: 1200, z: 0, S: .6, R: 96, pit: { a: 6 * Math.PI / 180, r0: 154, L: 17, land: 6, depth: 5.5, da: 2 * Math.PI / 180 }, bands: [[36, 46], [80, 92]] };
BI.ATLANTIS.pitPt = (t, l) => { const q = BI.ATLANTIS.pit, ux = Math.sin(q.a), uz = Math.cos(q.a); return [ux * (q.r0 + t) + uz * l, uz * (q.r0 + t) - ux * l]; };
BI.ATLANTIS.portal = { x: Math.sin(BI.ATLANTIS.pit.a) * BI.ATLANTIS.pit.r0, z: Math.cos(BI.ATLANTIS.pit.a) * BI.ATLANTIS.pit.r0 };

/* ---------- statisch: Höhle, Ringe, Kanäle, Brücken, Akropolis, Gebäude, Gärten (+ Eingangstor an der Oberfläche) ---------- */
BI.buildAtlantisGround = function (c) {
  /* Miniatur-Maßstab: Die Höhle wird in Original-Maßen (Radius R0) gebaut und um den Mittelpunkt auf A.S verkleinert (Meshes skaliert, Kollisionen/Laufregeln umgerechnet); nur die Treppe an der Oberfläche bleibt in echten Maßen */
  const { W: W0, st: mainSt, lamp: mainLamp, scene } = c, A = BI.ATLANTIS, S = A.S, R0 = A.R / S, TAU = Math.PI * 2, rn = BI.rng(777), M = (x, z) => [A.x + (x - A.x) * S, A.z + (z - A.z) * S];
  const W = Object.create(W0); W.addCircle = (x, z, r, u, h) => { const p = M(x, z); return W0.addCircle(p[0], p[1], r * S, u, h && h * S); }; W.addBox = (x0, z0, x1, z1, u, h) => { const p = M(x0, z0), q = M(x1, z1); return W0.addBox(p[0], p[1], q[0], q[1], u, h && h * S); };
  const scaleMesh = m => { m.scale.setScalar(S); m.position.set(A.x * (1 - S), 0, A.z * (1 - S)); return m; };
  const st = new BI.Batch(), lamp = new BI.Batch(), glow = new BI.Batch(), X = u => A.x + u, Z = v => A.z + v, P = (r, a) => [X(Math.sin(a) * r), Z(Math.cos(a) * r)];
  const MARBLE = 0xe8f0f6, MARBLE2 = 0xcad8e4, AQUA = 0x35d6e0, COP = 0xe6803a, GOLD = 0xffd23f, TEAL = 0x0f5a73, DEEP = 0x0e2a40, GL = [0x35d6e0, 0x7a8cff, 0xff6ad5, 0x6bffd0];
  /* Laufregeln (früh festlegen, auch die Gleiter beim Aufbau brauchen sie): Rand der Höhle, Kanäle nur über Brücken, Akropolis in 1-m-Stufen */
  W0.atlantis = { x: A.x, z: A.z, R: A.R, bands: A.bands,
    fix(px, pz, r, out) {
      let lx = (px - A.x) / S, lz = (pz - A.z) / S, d = Math.hypot(lx, lz); const ru = r / S; if (d * S > 380) return false; let hit = false;
      if (d > R0 - ru) { const k = (R0 - ru) / d; lx *= k; lz *= k; d = R0 - ru; hit = true; }
      for (const [a, b] of A.bands) if (d > a - ru && d < b + ru && !(Math.abs(lx) < 4.2 || Math.abs(lz) < 4.2)) { const t = d < (a + b) / 2 ? a - ru : b + ru, k = t / d; lx *= k; lz *= k; d = t; hit = true; }
      out.fx = A.x + lx * S; out.fz = A.z + lz * S; out.fhit = hit; return true;
    },
    floor(x, z) { const lx = (x - A.x) / S, lz = (z - A.z) / S; if (lx < -40 || lx > 40 || lz < -40 || lz > 40) return 0; const d = Math.hypot(lx, lz); return d < 36 ? Math.min(6, 1 + Math.floor((36 - d) / 5)) * S : 0; } };
  /* Höhle: Boden, Felsen, riesige Leuchtkristalle am Rand */
  st.disc(X(0), Z(0), 340, -3.2, DEEP, 48);
  for (let i = 0; i < 70; i++) { const a = rn() * TAU, d = 172 + rn() * 130, h = 6 + rn() * 26, [x, z] = P(d, a); glow.cone(x, -3.2, z, 1.5 + rn() * 2.6, h, GL[i % 4], 5); if (i % 3 === 0) glow.cone(x + 2.6, -3.2, z + 1.4, 1 + rn() * 1.4, h * .6, GL[(i + 1) % 4], 5); }
  for (let i = 0; i < 46; i++) { const a = rn() * TAU, d = 168 + rn() * 140, [x, z] = P(d, a); st.sph(x, -3.2, z, 4 + rn() * 7, 0x1b3b55, 1, 1, .7, 1, .2); }
  /* Stadtboden: Außenring (Gärten), Ring 1 (Marmor), Intarsien aus Orichalcum und Aqua */
  st.disc(X(0), Z(0), 172, -1.5, TEAL, 64);
  st.ring(X(0), Z(0), 92, 160, 0, 0x9fe3d0, 96); st.ring(X(0), Z(0), 150, 160, .012, MARBLE, 96); st.ring(X(0), Z(0), 46, 80, 0, 0xdce6ef, 96);
  st.ring(X(0), Z(0), 60.5, 62.5, .012, COP, 96); st.ring(X(0), Z(0), 70, 71, .012, AQUA, 96); st.ring(X(0), Z(0), 118, 120, .012, COP, 96); st.ring(X(0), Z(0), 134, 135, .012, AQUA, 96);
  for (let k = 0; k < 8; k++) { const a = k * TAU / 8 + TAU / 16; for (const [r0, r1] of [[46, 80], [92, 150]]) { const m = (r0 + r1) / 2, [x, z] = P(m, a); st.strip(x, z, 5, r1 - r0, a, .012, 0xf3f6fa); } }
  /* Kanäle: Beckenboden und Ufer-Zierleisten (das Wasser selbst kommt als eigenes Mesh) */
  for (const [a0, b0] of A.bands) { st.ring(X(0), Z(0), a0, b0, -1.4, 0x0d6a86, 64); for (const r of [a0 - .5, b0]) st.ring(X(0), Z(0), r, r + .5, .02, GOLD, 80); }
  /* Brücken (4 je Kanal, auf den Achsen) mit Geländer-Laternen */
  for (const [a0, b0] of A.bands) { const m = (a0 + b0) / 2, L = b0 - a0 + 8; for (const [ux, uz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const x = X(ux * m), z = Z(uz * m), ry = ux ? Math.PI / 2 : 0; st.strip(x, z, 8.6, L, ry, .05, 0xf5f0e6); st.strip(x, z, 1.2, L, ry, .06, AQUA);
    for (const sd of [-1, 1]) { const ox = uz * sd * 4.5, oz = ux * sd * 4.5; st.box(x + ox, 0, z + oz, ux ? L : .3, 1.0, ux ? .3 : L, COP, 0); for (let t = -L / 2 + 5; t <= L / 2 - 5; t += 3.5) { const px = x + ox + ux * t, pz = z + oz + uz * t; W.addCircle(px, pz, .4, false, 1.2); if (Math.abs(t) > .1 && ((t + L / 2) % 7 < 3.5)) { st.cyl(px, 0, pz, .08, .1, 2.2, MARBLE2, 6); glow.sph(px, 2.4, pz, .28, 0xbff6ff, 1); } } } } }
  /* Akropolis: 6 Stufen à 1 m, alle gehbar; Tempel mit Säulen, Kuppel und dem Sockel für das Herz */
  for (let k = 1; k <= 6; k++) { const R = 36 - 5 * (k - 1); st.cyl(X(0), k - 1, Z(0), R, R, 1, k % 2 ? MARBLE : MARBLE2, 56); glow.ring(X(0), Z(0), R - .5, R, k + .015, k % 2 ? AQUA : COP, 56); }
  for (let i = 0; i < 12; i++) { const [x, z] = P(8, i * TAU / 12); st.cyl(x, 6, z, .5, .6, 5, MARBLE, 8); W.addCircle(x, z, .7, false, 11.5); }
  st.cyl(X(0), 11, Z(0), 9.4, 9.4, .6, COP, 24); st.sph(X(0), 11.4, Z(0), 8.6, MARBLE, 1, 1, .5, 1); st.cone(X(0), 15.4, Z(0), .6, 2.6, GOLD, 8); st.cyl(X(0), 6, Z(0), 2.4, 2.8, 1.3, GOLD, 16);
  for (let i = 0; i < 4; i++) { const a = i * TAU / 4, [x, z] = P(15, a); st.cyl(x, 6, z, .35, .45, 2.8, GL[i], 6); glow.sph(x, 9.1, z, .7, GL[i], 1); }
  /* Ring 1: Kuppelhäuser, Archiv-Podeste, Harfen-Platz, Schwerelos-Halle, Wasser-Zentrale */
  const dome = (r, a, rad, col) => { const [x, z] = P(r, a); st.cyl(x, 0, z, rad, rad, 1.4, MARBLE, 20); st.sph(x, 1.4, z, rad * .92, col, 1, 1, .8, 1); W.addCircle(x, z, rad + .3, false, 6); for (let k = 0; k < 4; k++) { const aa = k * TAU / 4 + .4; glow.sph(x + Math.sin(aa) * rad * .98, 1.0, z + Math.cos(aa) * rad * .98, .38, 0xbff6ff, 1); } };
  [5, 45, 95, 180, 270, 355].forEach((deg, i) => dome(72, deg * Math.PI / 180, 6.5, [0x9be8f0, 0xffc9a8, 0xc7b8ff, 0xffe49a, 0xffb3d9, 0xbff0c8][i]));
  for (let i = 0; i < 5; i++) { const a = (20 + i * 15) * Math.PI / 180, [x, z] = P(57, a); st.cyl(x, 0, z, 1.5, 1.8, 1.2, MARBLE, 14); st.cyl(x, 1.2, z, 1.2, 1.2, .1, AQUA, 14); glow.cyl(x, 1.3, z, .9, .9, .06, 0x7fe8ff, 14); W.addCircle(x, z, 1.9, false, 2); }
  { const [hx, hz] = P(62, 135 * Math.PI / 180); st.disc(hx, hz, 13, .012, 0xc9d6e2, 36); st.ring(hx, hz, 11, 12.4, .02, COP, 36); }
  { const [lx, lz] = P(62, 225 * Math.PI / 180); st.ring(lx, lz, 16, 18, .012, MARBLE, 40); st.ring(lx, lz, 17, 17.6, .02, AQUA, 40); for (let k = 0; k < 8; k++) { const a = k * TAU / 8; st.cyl(lx + Math.sin(a) * 17, 0, lz + Math.cos(a) * 17, .4, .5, 5, MARBLE, 8); glow.sph(lx + Math.sin(a) * 17, 5.4, lz + Math.cos(a) * 17, .5, 0xbff6ff, 1); } }
  { const [wx, wz] = P(63, 315 * Math.PI / 180); st.cyl(wx, 0, wz, 7, 7, .5, MARBLE2, 24); st.ring(wx, wz, 5, 6, .52, AQUA, 24); A.arcade = { x: wx, z: wz }; }
  /* Außenring: leuchtende Bäume, Seetang-Spiralen, Muschelpavillons, Gleiter-Station, Torbögen an der Mauer */
  for (let i = 0; i < 70; i++) { const a = rn() * TAU, d = 98 + rn() * 48, [x, z] = P(d, a); if (Math.abs(Math.sin(a)) < .06 || Math.abs(Math.cos(a)) < .06) continue; if (Math.hypot(x - X(0), z - Z(142)) < 22) continue; const h = 2.6 + rn() * 2; st.cyl(x, 0, z, .24, .34, h, 0x7a5a8a, 6); glow.sph(x, h + .9, z, 1.4 + rn() * .6, GL[i % 4], 1, 1, .95, 1); W.addCircle(x, z, .5, false, 4); }
  for (let i = 0; i < 40; i++) { const a = rn() * TAU, d = 96 + rn() * 50, [x, z] = P(d, a); if (Math.abs(Math.sin(a)) < .07 || Math.abs(Math.cos(a)) < .07) continue; const h = 4 + rn() * 5; st.cyl(x, 0, z, .16, .26, h, 0x3fae88, 5); glow.sph(x, h, z, .35, 0x9fffd0, 1); }
  for (let k = 0; k < 4; k++) { const a = (45 + k * 90) * Math.PI / 180, [x, z] = P(105, a); st.cyl(x, 0, z, 5, 5.4, .5, MARBLE2, 5, 0, a); for (let q = 0; q < 5; q++) { const aa = a + q * TAU / 5; st.cyl(x + Math.sin(aa) * 4.6, 0, z + Math.cos(aa) * 4.6, .3, .35, 3.4, COP, 6); } st.cone(x, 3.5, z, 5.6, 2.4, 0xf3a8d8, 5); W.addCircle(x, z, 5.3, false, 3.6); }
  for (let k = 0; k < 24; k++) { const a = k * TAU / 24, [x, z] = P(157, a); if (k === 0) continue; st.cyl(x, 0, z, .8, 1, 7, MARBLE, 8); glow.sph(x, 7.4, z, .6, GL[k % 4], 1); W.addCircle(x, z, 1, false, 7); }
  /* Aufstiegstor im Süden: Bogen aus Stein, Leuchtfläche, Treppe */
  { const gx = X(0), gz = Z(151); for (const sd of [-1, 1]) { st.cyl(gx + sd * 5, 0, gz, 1.1, 1.3, 9, MARBLE, 10); glow.sph(gx + sd * 5, 9.5, gz, .7, GOLD, 1); W.addCircle(gx + sd * 5, gz, 1.4, false, 9); } st.box(gx, 8.4, gz, 12, 1.4, 1.6, COP); for (let k = 0; k < 6; k++) st.box(gx, k * .25, gz - 3 - k * .8, 7 - k * .4, .25, .8, MARBLE2); { const q = M(gx, gz - 2); W.spots.atlExit = { x: q[0], z: q[1], y: 9 * S }; } }
  /* Gleiter-Station: Podest und 3 Aqua-Gleiter */
  { const sx = X(0), sz = Z(124); st.cyl(sx, 0, sz, 15, 15, .25, MARBLE2, 28); st.ring(sx, sz, 12, 13, .27, AQUA, 28); for (const [dx, dz, h] of [[-8, 0, Math.PI], [8, 0, Math.PI], [0, -6, Math.PI]]) { { const q = M(sx + dx, sz + dz); W.vehicleSpawns.push({ type: 'gleiter', x: q[0], z: q[1], h }); } } { const q = M(sx, sz); W.spots.atlGleiter = { x: q[0], z: q[1] }; } }
  /* eigene Meshes (nur in der Nähe sichtbar) */
  const grp = new THREE.Group(), stM = st.mesh(BI.mat()), glowM = glow.mesh(new THREE.MeshBasicMaterial({ vertexColors: true, fog: false })), lampM = lamp.empty ? null : lamp.mesh(W.lampMat);
  stM.frustumCulled = glowM.frustumCulled = false; scaleMesh(stM); scaleMesh(glowM); grp.add(stM, glowM); if (lampM) { scaleMesh(lampM); grp.add(lampM); }
  /* Arcade (Strömungs-Rätsel) im eigenen Batch, damit es unter der Erde sichtbar bleibt – wird von world.js nach den Hauptwelt-Automaten gebaut */
  const mkArcade = a0 => { const a = a0, ast = new BI.Batch(), alamp = new BI.Batch(); BI.buildArcades({ W, st: ast, lamp: alamp, only: [{ kind: a.kind, x: a.x, z: a.z, yaw: Math.atan2(X(0) - a.x, Z(0) - a.z), body: a.body, top: a.top }] }); grp.add(scaleMesh(ast.mesh(BI.mat()))); if (!alamp.empty) grp.add(scaleMesh(alamp.mesh(W.lampMat))); const sp = W0.spots.arcades[W0.spots.arcades.length - 1], q1 = M(sp.x, sp.z), q2 = M(sp.fx, sp.fz); sp.x = q1[0]; sp.z = q1[1]; sp.fx = q2[0]; sp.fz = q2[1]; };
  A.addArcade = function () { mkArcade({ kind: 'stroemung_atlantis', x: A.arcade.x, z: A.arcade.z, body: 0x0f5a73, top: 0x35d6e0 }); };
  A.addExtraArcade = function (kind, lx, lz, body, top) { mkArcade({ kind, x: X(lx), z: Z(lz), body, top }); };
  /* Kuppel (Himmel der Höhle) mit Sternenkristallen, Wasserflächen */
  { const g = new THREE.SphereGeometry(330 * S, 28, 14, 0, TAU, 0, Math.PI / 2), pos = g.attributes.position, col = new Float32Array(pos.count * 3), hor = new THREE.Color(0x0e5a7a), top = new THREE.Color(0x02101f), cc = new THREE.Color();
    for (let i = 0; i < pos.count; i++) { const k = Math.pow(Math.min(1, pos.getY(i) / (330 * S)), .7); cc.copy(hor).lerp(top, k); col[i * 3] = cc.r; col[i * 3 + 1] = cc.g; col[i * 3 + 2] = cc.b; }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3)); const dm = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false })); dm.position.set(A.x, -3 * S, A.z); grp.add(dm);
    const n = 260, sp = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const a = rn() * TAU, e = .1 + rn() * 1.35, d = 320 * S; sp[i * 3] = A.x + Math.sin(a) * Math.cos(e) * d; sp[i * 3 + 1] = -3 * S + Math.sin(e) * d; sp[i * 3 + 2] = A.z + Math.cos(a) * Math.cos(e) * d; }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3)); const stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xbff6ff, size: 3, sizeAttenuation: false, fog: false })); stars.frustumCulled = false; grp.add(stars);
    A.waterMat = new THREE.MeshBasicMaterial({ color: 0x28c8e0, transparent: true, opacity: .88, side: THREE.DoubleSide, fog: false });
    for (const [a0, b0] of A.bands) { const w = new THREE.Mesh(new THREE.RingGeometry(a0 * S, b0 * S, 64), A.waterMat); w.rotation.x = -Math.PI / 2; w.position.set(A.x, -.3 * S, A.z); grp.add(w); } }
  grp.visible = false; scene.add(grp); A.group = grp;
  /* Abstieg an der Oberfläche (Hauptinsel, Küste): Steintreppe nach unten in einen überdachten Gang; im Boden ist dafür ein Loch (siehe world.js, polarGround) */
  { const pa = A.pit, ux = Math.sin(pa.a), uz = Math.cos(pa.a), nx = Math.cos(pa.a), nz = -Math.sin(pa.a), L = pa.L, tl = pa.land, D = pa.depth, END = L + tl, PT = (t, l) => [ux * (pa.r0 + t) + nx * l, uz * (pa.r0 + t) + nz * l], n = Math.ceil(L / .8), run = L / n, rise = D / n;
    for (let k = 0; k < n; k++) { const [x, z] = PT((k + .5) * run, 0), top = -(k + .5) * rise; mainSt.box(x, -D - 1, z, 10.8, top + D + 1, run + .03, k % 2 ? 0xc9cdd8 : 0xdfe3ec, pa.a); }

    { const [x, z] = PT(L + tl / 2, 0); mainSt.box(x, -D - 1, z, 10.8, 1, tl + .03, 0xdfe3ec, pa.a); }
    /* Wände (innen sichtbar), Dach über dem tieferen Teil, Endwand mit leuchtendem Durchgang */
    const wallSeg = (t0, t1, top) => { for (const sd of [-1, 1]) { const [x, z] = PT((t0 + t1) / 2, sd * 5.75); mainSt.box(x, -D - 1.2, z, 1.5, top + D + 1.2, t1 - t0, 0x9aa2b6, pa.a); } };
    wallSeg(-1, 8, 1.0); wallSeg(8, END + 2.4, 3.2);
    { const [x, z] = PT((8 + END + 2.4) / 2, 0); mainSt.box(x, 3.2, z, 14.4, .5, END + 2.4 - 8 + .6, 0xb7bcc9, pa.a); }
    { const [x, z] = PT(END + 1.2, 0); mainSt.box(x, -D - 1.2, z, 14.4, D + 1.2 + 3.2, 2.4, 0x8a92a8, pa.a); const [gx, gz] = PT(END + .02, 0); mainLamp.box(gx, -D, gz, 4.4, 3.6, .05, 0x9fe8ff, pa.a); }
    /* Torbogen oben an der Treppe + Leuchten entlang der Wände */
    for (const sd of [-1, 1]) { const [x, z] = PT(-1.2, sd * 6.7); mainSt.box(x, 0, z, 1.6, 5.4, 1.6, 0xd9dde8, pa.a); mainSt.box(x, 5.4, z, 2.0, .5, 2.0, 0x35d6e0, pa.a); }
    { const [x, z] = PT(-1.2, 0); mainSt.box(x, 5.0, z, 15, .8, 1.4, 0xd9dde8, pa.a); }
    for (let t = 4; t < END; t += 4) for (const sd of [-1, 1]) { const [x, z] = PT(t, sd * 4.95), y = -D * Math.min(1, t / L); mainLamp.sph(x, y + 2.1, z, .22, 0x9fe8ff, 1); }
    /* Kollisionen: Wände und Endwand als Kreisreihen */
    for (let t = -1; t <= END + 2; t += 1) for (const sd of [-1, 1]) { const [x, z] = PT(t, sd * 5.7); W0.addCircle(x, z, .9, false, 8); }
    for (let l = -5.5; l <= 5.6; l += 1) { const [x, z] = PT(END + .7, l); W0.addCircle(x, z, .9, false, 8); }
    { const c = [PT(-2, -8), PT(-2, 8), PT(END + 3, -8), PT(END + 3, 8)]; W0.pads.push([Math.min(...c.map(q => q[0])), Math.min(...c.map(q => q[1])), Math.max(...c.map(q => q[0])), Math.max(...c.map(q => q[1]))]); }
    W0.atlPit = { END, floor(x, z) { const t = x * ux + z * uz - pa.r0, l = x * nx + z * nz; if (Math.abs(l) > 5.2 || t < -.3 || t > END + .5) return null; return t < 0 ? 0 : t < L ? -D * t / L : -D; }, to: (t, l) => PT(t, l), ux, uz };
    W0.spots.atlPortal = { x: PT(0, 0)[0], z: PT(0, 0)[1], ry: Math.atan2(-ux, -uz) }; }
};

/* ---------- Laufzeit ---------- */
BI.createAtlantis = function (G) {
  const { scene, W, A: AU, fx, P, say, save, persist } = G, K = {}, A = BI.ATLANTIS, TAU = Math.PI * 2, X = u => A.x + u * A.S, Z = v => A.z + v * A.S, Pol = (r, a) => [X(Math.sin(a) * r), Z(Math.cos(a) * r)];
  const S = () => save.atlantis || (save.atlantis = { holo: [0, 0, 0, 0, 0], shards: [], pts: 0, paid: 0, harp: 0, lowg: 0, herz: 0, glider: 0, played: 0, visit: 0 });
  const note = (f, d, ty, v, del) => { try { AU.note && AU.note(f, d, ty, v, del || 0); } catch (e) { } }, snd = n => { try { AU[n] && AU[n](); } catch (e) { } };
  const bonus = (n, msg) => { G.addStars(n); say(msg + ' +' + n + ' ⭐', 3600); snd('fanfare'); };
  K.inside = false;
  const sign = (txt, x, y, z, w) => { const cv = document.createElement('canvas'); cv.width = 512; cv.height = 96; const c = cv.getContext('2d'); let f = 52; c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; const mw = c.measureText(txt).width; if (mw > 480) { f = Math.floor(f * 480 / mw); c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; } c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 10; c.strokeStyle = '#06304a'; c.strokeText(txt, 256, 50); c.fillStyle = '#bff6ff'; c.fillText(txt, 256, 50); const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false, fog: false })); sp.scale.set(w, w * 96 / 512, 1); sp.position.set(x, y, z); scene.add(sp); return sp; };
  /* ===== Schwerkraft ===== */
  K.floor = W.atlantis.floor; K.group = () => A.group; const R = A.R;
  const LG = (() => { const [x, z] = Pol(62, 225 * Math.PI / 180); return { x, z, r: 17 * A.S }; })();
  K.gScale = (x, z) => K.inside && Math.hypot(x - LG.x, z - LG.z) < LG.r ? .28 : 1;
  /* ===== Himmel/Stimmung, Sichtbarkeit ===== */
  const inside = () => Math.hypot(P.x - A.x, P.z - A.z) < 380;
  /* ===== Eingang / Ausgang ===== */
  const ptl = W.spots.atlPortal, ext = W.spots.atlExit;
  { sign('🔱 Atlantis – Treppe nach unten', ptl.x, 7.4, ptl.z, 9); sign('⬆ Zurück zur Oberfläche', ext.x, ext.y + 3.4, ext.z, 8); }
  let enterCd = 0;
  K.enter = function () { enterCd = 3; G.fade(() => { P.x = X(0); P.z = Z(138); P.y = 0; P.vy = 0; P.h = Math.PI; G.cam.yaw = 0; const s = S(); if (!s.visit) { s.visit = 1; persist(); setTimeout(() => bonus(2, '🔱 Willkommen in Atlantis!'), 900); } else say('🔱 Willkommen zurück in Atlantis!', 2400); }); };
  K.leave = function () { enterCd = 3; G.fade(() => { const q = W.atlPit.to(A.pit.L - 2, 0); P.x = q[0]; P.z = q[1]; P.y = W.groundY(P.x, P.z); P.vy = 0; P.h = ptl.ry; G.cam.yaw = P.h + Math.PI; say('☀️ Zurück an der Oberfläche', 2000); }); };
  /* ===== Hologramm-Archiv (die Sage in 5 Bildern) ===== */
  const HOLO = [
    ['📜 Platons Geschichte', 'Vor etwa 2400 Jahren schrieb der griechische Denker Platon von einer mächtigen Insel namens Atlantis. Sie sei im Meer versunken. Ob das stimmt, weiß niemand – es ist eine Sage, die man weitererzählt.'],
    ['⭕ Ringe aus Wasser', 'In der Sage war Atlantis rund gebaut: Ringe aus Land und Wasser wie eine Zielscheibe, verbunden durch Brücken. In der Mitte stand ein Tempel. Genau so ist diese Stadt angelegt!'],
    ['🔶 Orichalcum – das rote Gold', 'Platon schrieb von Orichalcum, einem rötlich-goldenen Metall, das an den Mauern glänzte. Niemand weiß genau, was das war – vielleicht Messing. Hier leuchten die Splitter: Zehn davon tauschst du gegen einen ⭐.'],
    ['🌊 Der Untergang', 'Die Sage erzählt: An einem einzigen Tag und in einer Nacht versank Atlantis. Solche Geschichten erinnern vielleicht an echte Vulkanausbrüche oder Fluten. Unsere Stadt hat überlebt – tief unter der Erde!'],
    ['🧭 Die Suche nach Atlantis', 'Menschen suchen Atlantis seit vielen Jahrhunderten – bei Santorini, im Atlantik und anderswo. Gefunden hat man es nie. Das macht Sagen so spannend: Du darfst dir selbst ausmalen, wie es war.']
  ];
  const HP = HOLO.map((h, i) => { const [x, z] = Pol(57, (20 + i * 15) * Math.PI / 180); return { x, z, i }; });
  const holoMat = new THREE.MeshBasicMaterial({ color: 0x7fe8ff, transparent: true, opacity: .6, wireframe: true, fog: false }), holoGeo = [new THREE.CylinderGeometry(.5, .5, 1.3, 10), new THREE.TorusGeometry(.7, .09, 6, 18), new THREE.OctahedronGeometry(.75), new THREE.IcosahedronGeometry(.75, 1), new THREE.SphereGeometry(.7, 10, 8)], holo = HP.map((q, i) => { const m = new THREE.Mesh(holoGeo[i], holoMat); m.position.set(q.x, 3.0, q.z); K.group().add(m); return m; });
  const CSS = () => BI.injectHudCss(), host = (document.getElementById('mission') || {}).parentNode || document.body, panel = document.createElement('div'); CSS(); panel.className = 'pPanel'; panel.hidden = true; panel.innerHTML = '<div class="pT"></div><div class="pB" style="display:block;text-align:left;font-size:16px;line-height:1.35;padding:6px 10px 12px;max-width:420px"></div>';
  { const x = document.createElement('button'); x.className = 'pX'; x.textContent = '✖'; x.addEventListener('click', e => { e.stopPropagation(); panel.hidden = true; }); panel.appendChild(x); host.appendChild(panel); }
  function showHolo(i) {
    const h = HOLO[i], s = S(); panel.querySelector('.pT').textContent = h[0]; panel.querySelector('.pB').textContent = h[1] + (i === 4 ? '' : '') + '  (Sage – kein Beweis!)'; panel.hidden = false; snd('ding');
    if (!s.holo[i]) { s.holo[i] = 1; persist(); G.addStars(1); say('💡 Neues Wissen: +1 ⭐ (' + s.holo.reduce((a, b) => a + b, 0) + '/5)', 2600); if (s.holo.every(v => v)) setTimeout(() => bonus(3, '🏛️ Archiv komplett – du kennst die Sage von Atlantis!'), 1500); }
  }
  /* ===== Kristall-Harfe ===== */
  const HF = (() => { const [hx, hz] = Pol(62, 135 * Math.PI / 180), HZ = [523, 587, 659, 784, 880, 1047, 1175, 1319]; return HZ.map((f, i) => { const a = (-70 + i * 20) * Math.PI / 180, x = hx + Math.sin(a) * 9, z = hz + Math.cos(a) * 9; return { x, z, f, i, hz: 0 }; }); })();
  const harpCols = [0x35d6e0, 0x6bffd0, 0x7a8cff, 0xff6ad5, 0xffd23f, 0xff8a5a, 0x9f7aff, 0xffffff], harp = HF.map(q => { const m = new THREE.Mesh(new THREE.ConeGeometry(.7, 3 + q.i * .45, 5), new THREE.MeshBasicMaterial({ color: harpCols[q.i], fog: false })); m.position.set(q.x, (3 + q.i * .45) / 2, q.z); K.group().add(m); return m; });
  let harpHist = []; const harpPlay = i => { const q = HF[i], s = S(); note(q.f, 1.4, 'sine', .14, 0); note(q.f * 2, .8, 'sine', .04, .02); q.hz = 1; fx.burst(q.x, 3 + i * .45, q.z, 8, [[.4, .9, 1], [1, 1, 1]], 2.4, .9, 26, -1); harpHist.push(i); if (harpHist.length > 8) harpHist.shift(); if (!s.harp && harpHist.length === 8 && harpHist.every((v, k) => v === k)) { s.harp = 1; persist(); setTimeout(() => bonus(2, '🎶 Du hast die Kristall-Harfe gemeistert!'), 600); } };
  /* ===== Herz von Atlantis ===== */
  const heart = new THREE.Mesh(new THREE.OctahedronGeometry(1, 0), new THREE.MeshBasicMaterial({ color: 0x7fffff, fog: false })); heart.scale.set(1.5 * A.S, 2.4 * A.S, 1.5 * A.S); heart.position.set(A.x, 9.2 * A.S, A.z); K.group().add(heart);
  const heartHalo = new THREE.Mesh(new THREE.IcosahedronGeometry(2.8 * A.S, 1), new THREE.MeshBasicMaterial({ color: 0x35d6e0, transparent: true, opacity: .22, wireframe: true, fog: false })); heartHalo.position.copy(heart.position); K.group().add(heartHalo);
  /* ===== Orichalcum-Splitter ===== */
  const SP = []; { const rn = BI.rng(4242); for (let i = 0; SP.length < 72 && i < 800; i++) { const a = rn() * TAU, band = rn() < .45 ? [50, 78] : rn() < .8 ? [96, 148] : [10, 34], r = band[0] + rn() * (band[1] - band[0]), [x, z] = Pol(r, a); if (!W.free(x, z, .9) && r > 40) continue; SP.push({ x, z, y: Math.min(6, K.floor(x, z)) + 1.0, i: SP.length }); } }
  K.shards = SP; const shardM = new THREE.InstancedMesh(new THREE.OctahedronGeometry(.4, 0), new THREE.MeshBasicMaterial({ color: 0xff9a4a, fog: false }), SP.length), dm = new THREE.Object3D(); shardM.frustumCulled = false; K.group().add(shardM);
  /* ===== Delfin-Drohnen, Leuchtquallen, Schwerelos-Blasen ===== */
  const drones = []; { const rn = BI.rng(99); for (let i = 0; i < 6; i++) { const b = new BI.Batch(); b.sph(0, 0, 0, .55, 0xeaf6fb, 1, .7, .7, 2); b.cone(0, 0, 1.15, .3, .9, 0xcad8e4, 6); b.box(0, .5, -.1, .08, .6, .6, 0x35d6e0); b.box(0, 0, -1.3, 1.1, .08, .45, 0x35d6e0); b.sph(0, .25, .5, .14, 0x35e0ff, 1); const m = b.mesh(BI.mat()); m.scale.setScalar(2.2 * A.S); m.frustumCulled = false; K.group().add(m); drones.push({ m, r: (60 + rn() * 80) * A.S, a: rn() * TAU, w: (rn() < .5 ? -1 : 1) * (.12 + rn() * .12) / A.S, y: (36 + rn() * 26) * A.S, ph: rn() * 6 }); } }
  const jelly = []; { const rn = BI.rng(55), jm = [0xff6ad5, 0x6bffd0, 0x7a8cff, 0x35d6e0]; for (let i = 0; i < 16; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 6, 0, TAU, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: jm[i % 4], transparent: true, opacity: .55, side: THREE.DoubleSide, fog: false })); m.frustumCulled = false; K.group().add(m); const [x, z] = Pol(30 + rn() * 118, rn() * TAU); jelly.push({ m, x, z, y: (7 + rn() * 14) * A.S, s: (1.2 + rn() * 1.3) * A.S, ph: rn() * 6, sp: .3 + rn() * .4 }); } }
  const bubM = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.32, 1), new THREE.MeshBasicMaterial({ color: 0xbff6ff, transparent: true, opacity: .5, fog: false }), 36), bub = []; bubM.frustumCulled = false; K.group().add(bubM); { const rn = BI.rng(8); for (let i = 0; i < 36; i++) bub.push({ x: LG.x + (rn() - .5) * 28 * A.S, z: LG.z + (rn() - .5) * 28 * A.S, y: rn() * 14 * A.S, ph: rn() * 6 }); }
  const dome = new THREE.Mesh(new THREE.SphereGeometry(17.5 * A.S, 20, 10, 0, TAU, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x9fe8ff, transparent: true, opacity: .13, side: THREE.DoubleSide, fog: false, depthWrite: false })); dome.position.set(LG.x, 0, LG.z); K.group().add(dome);
  /* ===== Bewohner ===== */
  K.people = function (folk) {
    const mk = (r, a, look, name, lines) => { const [x, z] = Pol(r, a), c = BI.makeChar(look), h = Math.atan2(X(0) - x, Z(0) - z); c.group.position.set(x, 0, z); c.group.rotation.y = h; scene.add(c.group); const n = { c, x, z, h, h0: h, p: { name, lines, i: 0 }, wait: 0, hop: 0, kid: !!look.scale && look.scale < .8, fixed: true }; folk.push(n); K.npcs.push(c.group); return n; };
    K.npcs = [];
    mk(140, .09, { shirt: 0x0f5a73, pants: 0xe8f0f6, hair: 0xe8f0f6, skin: 0xd8a070, hat: 'none', style: 'bun', scale: 1.0 }, 'Kapitänin Perle', ['Willkommen in Atlantis! Hier unten scheint nie die Sonne – dafür leuchten die Kristalle. 🔱', 'Die Stadt ist wie in der alten Sage gebaut: Ringe aus Land und Wasser. Kennst du die Geschichte?', 'Tipp: Im Hologramm-Archiv erfährst du alles. Fünf Stationen im Ring.', 'Der Weg nach oben ist das große Tor ganz im Süden – gleich hier hinter dir.']);
    mk(57, 1.45, { shirt: 0x7a8cff, pants: 0x222222, hair: 0x6b4423, skin: 0xf3c9a0, hat: 'none', style: 'bob', glassT: 1, scale: .98 }, 'Archivarin Thalassa', ['Das Archiv zeigt dir die Sage von Atlantis in fünf Bildern. Tippe ein Hologramm an!', 'Wichtig: Atlantis ist eine Sage. Ob es wirklich existierte, weiß bis heute keiner.', 'Wer alle fünf Hologramme gesehen hat, bekommt von mir einen Bonus. 💡']);
    mk(124, .13, { shirt: 0xff8a1f, pants: 0x3d4a7a, hair: 0x222222, skin: 0x8a5a33, hat: 'helmet', style: 'curly', scale: 1.02 }, 'Techniker Quirl', ['Das sind unsere Aqua-Gleiter! Sie schweben auf einem Wasserkissen. Einsteigen mit E.', 'Schneller als jeder Wagen – aber nur auf den Ringen und Brücken. Wasser ist nichts für Fahrzeuge! 🛸', 'Ganz hinten in der Schwerelos-Halle kannst du fast fliegen. Hüpf mal!']);
    mk(62, 2.36, { shirt: 0xff6ad5, pants: 0x4a3a7a, hair: 0xffe14a, skin: 0xe0a979, hat: 'party', style: 'pig', dress: true, scale: .62 }, 'Muschel', ['Die Kristall-Harfe klingt wunderschön! Spiel die Töne von links nach rechts. 🎶', 'Ich habe schon fünf Orichalcum-Splitter. Zehn gibt einen Stern! ⭐', 'Wenn die Quallen leuchten, bin ich glücklich.']);
    mk(50, 3.4, { shirt: 0xe6803a, pants: 0xe8f0f6, hair: 0xcccccc, skin: 0xc68a5a, hat: 'none', style: 'topknot', wrink: 1, scale: 1.0 }, 'Orakel Okeana', ['Oben auf dem Stufenberg schlägt das Herz von Atlantis. Es summt, wenn jemand mit guten Absichten kommt.', 'Steig die sechs Stufen hinauf – du schaffst das! Die Stufen sind genau einen Meter hoch.', 'Der Sage nach versank die Stadt in einer Nacht. Wir sind tief unter dem Meer gerettet worden. Oder? 🌊']);
  };
  /* ===== Interaktion ===== */
  const nr = (x, z, r) => Math.hypot(P.x - x, P.z - z) < r;
  K.near = function () {
    if (P.veh || P.y > 8) return null;
    if (!K.inside) return null;
    if (nr(ext.x, ext.z, 5)) return { k: 'atlout' };
    for (const q of HP) if (nr(q.x, q.z, 3)) return { k: 'aholo', i: q.i };
    for (const q of HF) if (nr(q.x, q.z, 2.4)) return { k: 'aharp', i: q.i };
    if (P.y > 4.5 * A.S && nr(A.x, A.z, 3.4)) return { k: 'aherz' };
    return null;
  };
  K.act = function (n) {
    if (!n) return; const s = S();
    if (n.k === 'atlin') K.enter(); else if (n.k === 'atlout') K.leave(); else if (n.k === 'aholo') showHolo(n.i); else if (n.k === 'aharp') harpPlay(n.i);
    else if (n.k === 'aherz') { for (let i = 0; i < 6; i++) setTimeout(() => { fx.burst(A.x + (Math.random() - .5) * 8, 9 + Math.random() * 3, A.z + (Math.random() - .5) * 8, 20, [[.4, .9, 1], [1, 1, 1], [1, .6, .8]], 4, 1.4, 28, -1); }, i * 200); [523, 659, 784, 1047].forEach((f, i) => note(f, 2.2, 'sine', .12, i * .12)); if (!s.herz) { s.herz = 1; persist(); setTimeout(() => bonus(3, '💠 Das Herz von Atlantis summt für dich!'), 700); } else say('💠 Das Herz von Atlantis summt leise …', 2400); }
  };
  /* ===== Frame ===== */
  let was = false, shardT = 0, gHint = false, lastG = 0, hallIn = false; const tmp = new THREE.Object3D();
  K.update = function (dt, t) {
    if (!panel.hidden && !HP.some(q => Math.hypot(P.x - q.x, P.z - q.z) < 7)) panel.hidden = true;
    const ins = inside(); K.inside = ins; if (ins !== was) { was = ins; G.mood(ins); }
    enterCd -= dt; if (enterCd <= 0 && !P.veh) { if (!ins) { const pt = W.atlPit, tt = P.x * pt.ux + P.z * pt.uz - A.pit.r0; if (tt > pt.END - 1.6 && P.y < -A.pit.depth + .8) K.enter(); } else if (nr(ext.x, ext.z, 2.8)) K.leave(); }
    const near = Math.hypot(P.x - A.x, P.z - A.z) < 520; if (A.group.visible !== near) A.group.visible = near;
    if (!ins) return;
    const s = S();
    /* Animationen */
    heart.rotation.y = t * .9; heart.position.y = 9.2 * A.S + Math.sin(t * 1.6) * .15; heartHalo.rotation.y = -t * .5; heartHalo.rotation.x = t * .3; heartHalo.position.y = heart.position.y;
    for (const d of drones) { d.a += d.w * dt; const x = A.x + Math.sin(d.a) * d.r, z = A.z + Math.cos(d.a) * d.r, y = d.y + Math.sin(t * .8 + d.ph) * 2.4; d.m.position.set(x, y, z); d.m.rotation.set(Math.sin(t + d.ph) * .08, d.a + (d.w > 0 ? Math.PI / 2 : -Math.PI / 2), 0); }
    for (const j of jelly) { j.y += Math.sin(t * j.sp + j.ph) * .01; j.m.position.set(j.x + Math.sin(t * .3 + j.ph) * 2, j.y + Math.sin(t * j.sp * 2 + j.ph) * .8, j.z + Math.cos(t * .25 + j.ph) * 2); const sc = j.s * (1 + .12 * Math.sin(t * 2.2 + j.ph)); j.m.scale.set(sc, sc * (.8 + .12 * Math.sin(t * 2.2 + j.ph)), sc); }
    holo.forEach((m, i) => { m.rotation.y = t * (.7 + i * .1); m.rotation.x = i === 1 ? t * .5 : 0; m.position.y = 3.0 + Math.sin(t * 1.4 + i) * .12; m.material.opacity = .5 + .15 * Math.sin(t * 3 + i); });
    harp.forEach((m, i) => { const q = HF[i]; q.hz = Math.max(0, q.hz - dt * 1.6); m.scale.setScalar(1 + q.hz * .35); });
    bub.forEach((b, i) => { b.y += dt * (.7 + (i % 5) * .15); if (b.y > 15) b.y = 0; tmp.position.set(b.x + Math.sin(t + b.ph) * .8, b.y, b.z + Math.cos(t * .9 + b.ph) * .8); tmp.scale.setScalar(.8 + .3 * Math.sin(t * 2 + b.ph)); tmp.updateMatrix(); bubM.setMatrixAt(i, tmp.matrix); }); bubM.instanceMatrix.needsUpdate = true;
    /* Splitter: drehen, einsammeln (zehn = ein ⭐) */
    SP.forEach((q, i) => { if (s.shards.includes(i)) { dm.position.set(0, -50, 0); dm.scale.setScalar(.001); } else { dm.position.set(q.x, q.y + Math.sin(t * 2 + i) * .15, q.z); dm.scale.setScalar(1); dm.rotation.set(t * .8 + i, t * 1.1, 0); } dm.updateMatrix(); shardM.setMatrixAt(i, dm.matrix); }); shardM.instanceMatrix.needsUpdate = true;
    shardT -= dt; if (shardT <= 0) { shardT = .08; for (let i = 0; i < SP.length; i++) { const q = SP[i]; if (s.shards.includes(i)) continue; if (Math.abs(P.x - q.x) < 1.3 && Math.abs(P.z - q.z) < 1.3 && Math.abs(P.y + .8 - q.y) < 2) {
        s.shards.push(i); s.pts++; note(1175, .25, 'triangle', .09, 0); fx.burst(q.x, q.y, q.z, 6, [[1, .6, .2], [1, .9, .5]], 2.4, .6, 24, 3); const due = Math.floor(s.pts / 10) - s.paid; if (due > 0) { s.paid += due; G.addStars(due); say('🔶 → ⭐ Orichalcum wird zu Sternen: +' + due + ' ⭐ (' + s.pts + ' Splitter)', 3000); } else say('🔶 Orichalcum-Splitter ' + s.pts + ' (alle 10 = 1 ⭐)', 1100); persist(); } } }
    /* Schwerelos-Halle */
    const inHall = Math.hypot(P.x - LG.x, P.z - LG.z) < LG.r; if (inHall !== hallIn) { hallIn = inHall; if (inHall) { say('🌙 Schwerelos! Spring ganz hoch!', 2600); if (!s.lowg) { s.lowg = 1; persist(); setTimeout(() => G.addStars(1), 400); } } }
    /* Glitzer am Herz und Gleiter-Erfolg */
    if (Math.random() < dt * 6 && Math.hypot(P.x - A.x, P.z - A.z) < 60) fx.emit(A.x + (Math.random() - .5) * 3, 8 + Math.random() * 3, A.z + (Math.random() - .5) * 3, 0, 1.2, 0, 1.4, 34, .5, .95, 1, -.5, .8);
    if (P.veh && P.veh.type === 'gleiter' && !s.glider) { s.glider = 1; persist(); setTimeout(() => bonus(1, '🛸 Erste Fahrt im Aqua-Gleiter!'), 500); }
  };
  K.log = () => { const s = S(), n = s.holo.reduce((a, b) => a + b, 0); return { title: '🔱 Atlantis', count: (n + (s.herz ? 1 : 0) + (s.harp ? 1 : 0) + (s.lowg ? 1 : 0) + (s.glider ? 1 : 0) + Math.min(3, Math.floor(s.pts / 20)) + (s.played ? 1 : 0)) + ' von 12', rows: [
    { ok: !!s.visit, icon: '🔱', text: 'Atlantis betreten (Treppe nach unten an der Küste der Hauptinsel)', dest: 'atlantis' },
    { ok: n === 5, icon: '📜', text: 'Hologramm-Archiv: ' + n + '/5 Bilder ansehen', dest: 'atlantis' },
    { ok: !!s.herz, icon: '💠', text: 'Den Stufenberg besteigen und das Herz von Atlantis berühren', dest: 'atlantis' },
    { ok: !!s.harp, icon: '🎶', text: 'Kristall-Harfe von links nach rechts spielen', dest: 'atlantis' },
    { ok: !!s.lowg, icon: '🌙', text: 'In die Schwerelos-Halle hüpfen', dest: 'atlantis' },
    { ok: !!s.glider, icon: '🛸', text: 'Mit einem Aqua-Gleiter fahren', dest: 'atlantis' },
    { ok: s.pts >= 60, icon: '🔶', text: 'Orichalcum-Splitter sammeln: ' + s.pts + ' (alle 10 = 1 ⭐)', dest: 'atlantis' },
    { ok: !!s.played, icon: '🕹️', text: 'Strömungs-Rätsel am Spielautomaten spielen', dest: 'atlantis' }] }; };
  return K;
};
