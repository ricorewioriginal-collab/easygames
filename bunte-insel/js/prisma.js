'use strict';
/* Bunte Insel – Prisma-Archipel: eigenständige Abenteuerwelt mit drei Genre-Zonen:
   Ki-Training, Runen-Kartenduell und digitale Begleiter. Figuren, Symbole, Rätsel und Fahrzeuge sind eigens erfunden. */
BI.PRISMA = (function () {
  const R = 92, x = 540, z = -380, len = Math.hypot(x, z), ux = x / len, uz = z / len;
  const A0 = { x: ux * 171, z: uz * 171 }, A1 = { x: x - ux * (R - 5), z: z - uz * (R - 5) };
  const I = { id: 'prisma', x, z, R, ux, uz, entry: { x: x - ux * (R - 14), z: z - uz * (R - 14) },
    bridge: { mx: (A0.x + A1.x) / 2, mz: (A0.z + A1.z) / 2, L: Math.hypot(A1.x - A0.x, A1.z - A0.z) + 2, w: 9, ry: Math.atan2(ux, uz) } };
  I.at = (a, b) => ({ x: x + ux * a - uz * b, z: z + uz * a + ux * b });
  I.zones = [
    { id: 'ki', icon: '🥋', name: 'Ki-Garten', a: 17, b: -29, colors: [0xffcf55, 0x48c8ff, 0xf77766], order: [1, 0, 2], clue: 'Rätsel im Ki-Garten: Erst kommt der blaue Atem, dann das goldene Herz, zuletzt die rote Flamme.' },
    { id: 'runen', icon: '🃏', name: 'Runen-Arena', a: 32, b: 0, colors: [0xb48aff, 0x56dbb6, 0xffc65c], order: [2, 1, 0], clue: 'Rätsel in der Runen-Arena: Der goldene Schild steht vor dem grünen Waldzeichen und dem violetten Mond.' },
    { id: 'daten', icon: '💠', name: 'Datenhain', a: 17, b: 29, colors: [0x58d9ff, 0xff79c9, 0x8df47a], order: [0, 2, 1], clue: 'Rätsel im Datenhain: Folge dem blauen Signal, dem grünen Blatt und zum Schluss dem rosa Funken.' }
  ];
  return I;
})();

/* Inselboden, Brücke, drei eigenständige Erlebniszonen und drei fahrbare Themenautos. */
BI.buildPrismaGround = function (c) {
  const { W, st, lamp, ROADY } = c, I = BI.PRISMA, at = I.at;
  W.prisma = I; W.spots.prisma = I.entry; W.spots.prismaZones = [];
  st.disc(I.x, I.z, I.R + 9, 0, 0x66cfa2, 96); st.ring(I.x, I.z, I.R - 5, I.R + 9, .018, 0xffe7a2, 96);
  BI.buildIsleBridge(c, I);
  const path = (a0, b0, a1, b1, w, color) => { const p = at((a0 + a1) / 2, (b0 + b1) / 2), q = at(a0, b0), r = at(a1, b1); st.strip(p.x, p.z, w, Math.hypot(a1 - a0, b1 - b0), Math.atan2(r.x - q.x, r.z - q.z), ROADY + .008, color); };
  path(-77, 0, 0, 0, 6, 0xe9e7f2); path(0, 0, 46, -29, 4, 0xffdf8a); path(0, 0, 47, 29, 4, 0x8dddf2); path(0, 0, 48, 0, 4, 0xd7b8ff);
  /* Empfangstor mit drei Lichtbögen */
  { const g = at(-48, 0); for (const b of [-6, 6]) { const p = at(-48, b); st.cyl(p.x, 0, p.z, 1.05, 1.25, 6.4, 0x5e6b91, 12); st.cyl(p.x, 3.3, p.z, .68, .78, .14, 0xffd55b, 12); W.addCircle(p.x, p.z, 1.2, false, 7); }
    for (let n = 0; n < 3; n++) { const y = 4.5 + n * 1.1, rx = 4.2 - n * .85; st.ring(g.x, g.z, rx, rx + .25, y, [0x55ccff, 0xff83d5, 0xffd55b][n], 32); }
    st.box(g.x, 0, g.z, 15, .4, .8, 0x526080); }
  /* Zentraler Knotenpunkt: drei Wege und eine ruhige holografische Laterne. */
  { const p = at(0, 0); st.disc(p.x, p.z, 11, ROADY + .014, 0xeee9fa, 56); st.ring(p.x, p.z, 8.5, 9.3, ROADY + .03, 0xffcf55, 56);
    st.cyl(p.x, 0, p.z, 2.5, 2.8, .7, 0x7f77a8, 20); st.cyl(p.x, .7, p.z, 1.8, 2.1, .2, 0xffd55b, 20); lamp.sph(p.x, 4.1, p.z, .9, 0x8fe7ff, 1.6);
    for (let j = 0; j < 3; j++) { const a = j * Math.PI * 2 / 3, q = at(Math.cos(a) * 8, Math.sin(a) * 8); st.sph(q.x, 1.1, q.z, .48, [0xffcf55,0xb48aff,0x58d9ff][j], 1); } }
  /* Die Zonen sind architektonisch unterscheidbar und jede hat eine eigene, lösbare Drei-Schritt-Prüfung. */
  for (const q of I.zones) {
    const p = at(q.a, q.b), sign = at(q.a - 5, q.b + 8);
    st.disc(p.x, p.z, 18, ROADY + .012, q.id === 'ki' ? 0x8bddad : q.id === 'runen' ? 0xc0a6f2 : 0x77d8df, 52);
    st.ring(p.x, p.z, 15.8, 16.5, ROADY + .03, q.id === 'ki' ? 0xffcf55 : q.id === 'runen' ? 0xb48aff : 0x55d6f1, 52);
    /* Drei begehbare Prüf-Pylone: Form und Licht codieren die Antwortfolge. */
    q.pads = [];
    for (let i = 0; i < 3; i++) {
      const b = q.b + (i - 1) * 5.4, a = q.a + (q.id === 'runen' ? 1 : 0), v = at(a, b);
      st.cyl(v.x, 0, v.z, 1.55, 1.75, .55, 0x525d7d, 12);
      st.cyl(v.x, .55, v.z, 1.12, 1.25, .12, q.colors[i], 12);
      st.sph(v.x, 1.55, v.z, .72, q.colors[i], 1.3);
      lamp.sph(v.x, 2.05, v.z, .58, q.colors[i], 1.25);
      q.pads.push({ x: v.x, z: v.z, i });
    }
    /* Hinweis-Tafel: sie erzählt das passende Rätsel beim Antippen vor. */
    st.box(sign.x, .8, sign.z, 3.8, 1.7, .35, 0x344866, I.bridge.ry);
    st.box(sign.x, 1.68, sign.z, 3.35, .08, .42, 0xffd55b, I.bridge.ry);
    st.cyl(sign.x, 0, sign.z, .18, .2, 1.5, 0x5c6683, 8);
    const title = at(q.a + 6, q.b), col = q.colors[0];
    for (const side of [-1, 1]) { const v = at(q.a + side * 6, q.b + side * 2); st.cyl(v.x, 0, v.z, .55, .75, 4.2, 0x7885a7, 10); st.cone(v.x, 4.2, v.z, .86, 1.7, col, 10); st.sph(v.x, 6.2, v.z, .24, 0xffffff, 1.3); W.addCircle(v.x, v.z, .62, false, 6); }
    q.hint = sign; W.spots.prismaZones.push({ x: title.x, z: title.z, icon: q.icon, name: q.name, id: q.id });
  }
  /* Eigene futuristische Fahrzeuge: Ki-Blitz-Roadster, Runen-Duell-Coupé, Datenhain-Buggy. */
  for (const [type, a, b, h] of [['kiRoadster', 4, -43, I.bridge.ry], ['runeCoupe', 3, 0, I.bridge.ry], ['dataBuggy', 4, 43, I.bridge.ry]]) {
    const p = at(a, b); W.vehicleSpawns.push({ type, x: p.x, z: p.z, h });
  }
};

/* Die drei Prüfungen sind dauerhaft gespeichert, ansprechbar und geben Sticker sowie Sterne. */
BI.createPrisma = function (G) {
  const { P, save, persist, say, addStars, earn, fx } = G, I = BI.PRISMA, K = {};
  const S = () => { const s = save.prisma || (save.prisma = { done: {}, step: {} }); s.done = s.done || {}; s.step = s.step || {}; return s; };
  const near = (x, z, r) => !P.veh && P.y < 1.8 && Math.hypot(P.x - x, P.z - z) < r;
  K.near = () => {
    if (Math.hypot(P.x - I.x, P.z - I.z) > I.R + 24) return null;
    let best = null, bd = 3.6;
    for (const q of I.zones) {
      if (near(q.hint.x, q.hint.z, bd)) { const d = Math.hypot(P.x - q.hint.x, P.z - q.hint.z); if (d < bd) { bd = d; best = { k: 'hint', zone: q.id, label: '📜 Rätselhinweis' }; } }
      for (const p of q.pads) if (near(p.x, p.z, bd)) { const d = Math.hypot(P.x - p.x, P.z - p.z); if (d < bd) { bd = d; best = { k: 'pad', zone: q.id, i: p.i, label: ['🔵', '🟡', '🟣'][p.i] + ' Prüf-Pylon' }; } }
    }
    return best;
  };
  const complete = (q) => { const s = S(); if (s.done[q.id]) return; s.done[q.id] = true; s.step[q.id] = q.order.length; persist(); earn('prisma_' + q.id); addStars(5); fx.burst(P.x, 2, P.z, 28, [q.colors[0], q.colors[1], q.colors[2], 0xffffff], 5, 1.5, 28, 5); say('✨ ' + q.name + ' gemeistert! +5 ⭐', 3200); };
  K.act = n => {
    if (!n) return; const q = I.zones.find(x => x.id === n.zone); if (!q) return;
    if (n.k === 'hint') { say('🧩 ' + q.clue, 5200); return; }
    const s = S(); if (s.done[q.id]) { say('✅ ' + q.name + ': Prüfung bereits geschafft. Schau dir die Lichter noch einmal an!', 2800); return; }
    const atStep = s.step[q.id] || 0, wanted = q.order[atStep];
    if (n.i !== wanted) { s.step[q.id] = 0; persist(); say('🔄 Fast! Die Folge startet neu. Tipp: erst die Hinweis-Tafel lesen.', 3000); return; }
    s.step[q.id] = atStep + 1; persist(); say('💫 Schritt ' + s.step[q.id] + ' von 3 stimmt!', 1800);
    if (s.step[q.id] >= q.order.length) complete(q);
  };
  K.update = () => {};
  K.log = () => { const s = S(), done = I.zones.filter(q => s.done[q.id]).length; return { title: '🌀 Prisma-Archipel', count: done + ' von 3', rows: I.zones.map(q => ({ ok: !!s.done[q.id], icon: q.icon, text: q.name + ' – ' + (s.done[q.id] ? 'Rätsel gelöst' : 'Löse das Drei-Farben-Rätsel an den Licht-Pylonen'), dest: 'prisma' })) }; };
  K.state = S; return K;
};
