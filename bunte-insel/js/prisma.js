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
  /* Ausbau (Positionen in Insel-Koordinaten a = vom Steg nach innen, b = seitlich) */
  I.KI = { dojo: [-12, -60], ring: [42, -50], altar: [12, -66], targets: [[50, -62], [55, -50], [52, -38]], cloud: [-24, -40], trees: [[-30, -55], [0, -78], [26, -70], [-40, -38], [30, -60]] };
  I.RUNE = { stadium: [64, 0], podium: [54.5, 0], foe: [75, 0], holo: [[60, 0], [68, 0]], booster: [46, 15], prism: [46, -15] };
  I.DATA = { grid: [42, 48], tv: [56, 52], nest: [28, 58], trees: [[26, 46], [30, 64], [56, 30], [64, 40], [12, 48], [38, 68], [60, 24], [22, 74]] };
  I.ORBS = [[-60, -30], [-30, -70], [74, -26], [72, 22], [-55, 40], [-20, 72], [8, 76]];
  return I;
})();
/* Runenkarten (Duell + Sammelalbum): Bild, Name, Kraft, Element (f Feuer, p Pflanze, w Wasser) */
BI.PRISMA_CARDS = [['🐉', 'Kristalldrache', 9, 'w'], ['🧙', 'Sternmagier', 8, 'f'], ['🦊', 'Flammenfuchs', 5, 'f'], ['🐢', 'Panzerkröte', 4, 'w'], ['🌻', 'Sonnenblumen-Ritter', 6, 'p'], ['🦅', 'Sturmgreif', 7, 'f'],
  ['🐙', 'Tintenkrake', 6, 'w'], ['🍄', 'Pilzwichtel', 3, 'p'], ['🦄', 'Regenbogen-Einhorn', 7, 'p'], ['🐝', 'Summ-Soldat', 2, 'p'], ['🐬', 'Wellenreiter', 5, 'w'], ['🦁', 'Goldlöwe', 8, 'f']];
/* Runen-Duell (Mini-Spiel im 2D-Rahmen): fünf Runden, je eine von drei Karten antippen – höhere Kraft gewinnt, Element-Vorteil gibt +3. */
(BI.MINI_EXT = BI.MINI_EXT || []).push(function (M, h) {
  const C = BI.PRISMA_CARDS, EL = { f: '🔥', p: '🌿', w: '💧' }, BEAT = { f: 'p', p: 'w', w: 'f' }, ECOL = { f: '#ff7a4a', p: '#4cc46a', w: '#3f9cff' }, snd = n => { try { h.A[n] && h.A[n](); } catch (e) { } };
  const G = {}; let hand, foe, mine, round, me, ai, wait, msg;
  const deal = () => { const pool = C.map((c, i) => i); hand = []; for (let k = 0; k < 3; k++) hand.push(pool.splice((h.rnd() * pool.length) | 0, 1)[0]); foe = pool[(h.rnd() * pool.length) | 0]; mine = -1; msg = 'Runde ' + round + ' von 5 – wähle eine Karte!'; };
  const lay = () => { const W = h.W(), H = h.H(), cw = Math.min(W / 3.7, H * .27), ch = cw * 1.32, gap = (W - cw * 3) / 4, y = Math.min(H - ch - Math.max(16, H * .04), H * .6); return [0, 1, 2].map(i => ({ x: gap + i * (cw + gap), y, w: cw, h: ch })); };
  const power = (a, b) => C[a][2] + (BEAT[C[a][3]] === C[b][3] ? 3 : 0);
  G.init = function () { round = 1; me = 0; ai = 0; wait = 0; BI.PRISMA_DUEL = { won: false, done: false, me: 0, ai: 0 }; deal(); };
  G.resize = function () { };
  G.tap = function (x, y) {
    if (wait > 0 || mine >= 0) return; const L = lay(), i = L.findIndex(r => x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h); if (i < 0) return; mine = hand[i];
    const a = power(mine, foe), b = power(foe, mine), r = L[i];
    if (a > b) { me++; h.add(3, r.x + r.w / 2, r.y); h.burst(r.x + r.w / 2, r.y + r.h / 2, 16, ['#ffe27a', '#fff', '#b48aff']); snd('ding'); msg = 'Runde gewonnen! ' + a + ' gegen ' + b; }
    else if (a < b) { ai++; snd('bonk'); msg = 'Kaia gewinnt die Runde: ' + b + ' gegen ' + a; }
    else { h.add(1, r.x + r.w / 2, r.y); msg = 'Unentschieden! ' + a + ' gegen ' + b; }
    wait = 1.9;
  };
  G.update = function (dt) {
    if (wait <= 0) return; wait -= dt; if (wait > 0) return;
    if (round >= 5 || me >= 3 || ai >= 3) { BI.PRISMA_DUEL = { won: me > ai, done: true, me, ai }; if (me > ai) M.score += 3; M.t = M.dur; return; }
    round++; deal();
  };
  const card = (c, r, sel, hidden) => {
    const x = h.ctx(); x.save(); x.fillStyle = hidden ? '#3a2a7a' : '#fff8e8'; x.strokeStyle = sel ? '#ffe27a' : '#16335e'; x.lineWidth = sel ? 7 : 4; x.beginPath(); x.roundRect ? x.roundRect(r.x, r.y, r.w, r.h, 14) : x.rect(r.x, r.y, r.w, r.h); x.fill(); x.stroke();
    if (hidden) { h.emoji('🃏', r.x + r.w / 2, r.y + r.h / 2, r.w * .5); x.restore(); return; }
    const k = C[c]; x.fillStyle = ECOL[k[3]]; x.fillRect(r.x + 6, r.y + 6, r.w - 12, r.h * .16); h.text(EL[k[3]] + ' ' + k[2], r.x + r.w / 2, r.y + 6 + r.h * .08, r.w * .17, '#fff');
    h.emoji(k[0], r.x + r.w / 2, r.y + r.h * .54, r.w * .46); h.text(k[1], r.x + r.w / 2, r.y + r.h * .88, Math.min(r.w * .12, 22, r.w * 1.55 / k[1].length), '#ffe27a'); x.restore();
  };
  G.draw = function () {
    const W = h.W(), H = h.H(); h.bg('#2a1a5a', '#6a3aa8'); const L = lay(), cw = L[0].w, ch = L[0].h;
    h.text('Du ' + me + ' : ' + ai + ' Kaia', W / 2, 74, Math.min(34, W * .07), '#fff'); h.text(msg, W / 2, 112, Math.min(24, W * .05), '#ffe27a');
    const fr = { x: W / 2 - cw * .45, y: Math.max(130, L[0].y - ch * .9 - 24), w: cw * .9, h: ch * .9 }; card(foe, fr, false, mine < 0); h.text('Kaia', W / 2, fr.y - 14, 20, '#ff9be0');
    L.forEach((r, i) => card(hand[i], r, hand[i] === mine, false));
    if (mine < 0) h.text('🔥 > 🌿 > 💧 > 🔥  (+3)', W / 2, L[0].y - 16, Math.min(20, W * .045), '#fff');
  };
  G.dbg = () => ({ hand, foe, tapAt: i => { const r = lay()[i]; G.tap(r.x + r.w / 2, r.y + r.h / 2); }, win: () => { me = 3; ai = 0; wait = .01; round = 5; } });
  h.register('duell_prisma', G, { icon: '🃏', name: 'Runen-Duell', help: 'Tippe eine deiner drei Karten an. Die höhere Zahl gewinnt. Feuer schlägt Pflanze, Pflanze schlägt Wasser, Wasser schlägt Feuer (+3). Gewinne 3 Runden!', dur: 120, goal: 9, zone: 'prisma', kids: 1 });
});

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
  BI.buildPrismaWorlds(c);
};

/* Ausbau der drei Zonen zu eigenen kleinen Welten (statisch, alles im EINEN Welt-Mesh):
   Ki-Garten: Kampfkunst-Tempel, Turnier-Ring, Sternkugel-Altar, Kirschbäume · Runen-Arena: Duell-Stadion mit Tribünen, Kartenfeldern, Holo-Sockeln, Kartenautomat
   Datenhain: leuchtendes Datengitter, Datentor (alter Fernseher), Würfelbäume, Datensäulen, Ei-Nest. */
BI.buildPrismaWorlds = function (c) {
  const { W, st, lamp, ROADY } = c, I = BI.PRISMA, at = I.at, RY = I.bridge.ry, TAU = Math.PI * 2, ctr = at(0, 0);
  const face = (p, q) => Math.atan2(q.x - p.x, q.z - p.z), loc = (p, yaw, lx, lz) => ({ x: p.x + lx * Math.cos(yaw) + lz * Math.sin(yaw), z: p.z - lx * Math.sin(yaw) + lz * Math.cos(yaw) });
  /* ---------- Ki-Garten ---------- */
  { const K = I.KI, d = at(K.dojo[0], K.dojo[1]), yaw = face(d, ctr), RED = 0xc8352b, ROOF = 0xd2452f, WALL = 0xfff1dc;
    st.box(d.x, 0, d.z, 15, .5, 12, 0xb89a6a, yaw); st.box(d.x, .5, d.z, 12, 3.4, 8.6, WALL, yaw);
    for (const lx of [-6.2, -2.2, 2.2, 6.2]) for (const lz of [-4.6, 4.6]) { const q = loc(d, yaw, lx, lz); st.cyl(q.x, .5, q.z, .32, .34, 3.6, RED, 10); }
    { const q = loc(d, yaw, 0, 4.33); st.box(q.x, .5, q.z, 2.6, 2.7, .1, 0x5a2a1a, yaw); st.box(q.x, 3.25, q.z, 3.4, .3, .14, 0xffd55b, yaw); }
    for (const lx of [-4.2, 4.2]) { const q = loc(d, yaw, lx, 4.33); st.box(q.x, 1.6, q.z, 1.8, 1.2, .1, 0x8fd0ff, yaw); st.box(q.x, 2.2, q.z, 1.9, .08, .14, RED, yaw); }
    st.box(d.x, 3.9, d.z, 14, .3, 11, 0x5a2a1a, yaw); st.prism(d.x, 4.2, d.z, 11.4, 2.2, 15, ROOF, yaw + Math.PI / 2);
    st.box(d.x, 5.4, d.z, 6.5, 1.8, 5, WALL, yaw); for (const lx of [-3, 3]) for (const lz of [-2.3, 2.3]) { const q = loc(d, yaw, lx, lz); st.cyl(q.x, 5.4, q.z, .2, .2, 1.8, RED, 8); }
    st.box(d.x, 7.2, d.z, 8, .25, 6.4, 0x5a2a1a, yaw); st.prism(d.x, 7.45, d.z, 6.6, 1.9, 9, ROOF, yaw + Math.PI / 2); st.cyl(d.x, 9.1, d.z, .12, .12, 1.2, 0xffd55b, 6); st.sph(d.x, 10.4, d.z, .35, 0xffd55b, 1);
    for (const lx of [-4.5, 0, 4.5]) { const q = loc(d, yaw, lx, 0); W.addCircle(q.x, q.z, 4.6, false, 8); }
    for (const lx of [-3.5, 3.5]) { const q = loc(d, yaw, lx, 7.6); st.cyl(q.x, 0, q.z, .5, .6, .5, 0x8a8fa8, 8); st.cyl(q.x, .5, q.z, .22, .28, 1.4, 0x8a8fa8, 8); st.box(q.x, 1.9, q.z, .9, .8, .9, 0xbfc4d4, yaw); lamp.sph(q.x, 2.3, q.z, .28, 0xffc65c, 1); W.addCircle(q.x, q.z, .6, false, 2.4); }
    W.spots.prismaDojo = loc(d, yaw, 0, 7.4);
    /* Turnier-Ring: achteckige Steinplattform (begehbar), Fliesenfugen, vier Eckpfeiler mit Feuerschalen */
    const r = at(K.ring[0], K.ring[1]); st.cyl(r.x, 0, r.z, 7.2, 7.6, .6, 0xd8d0b8, 8, 0, RY + Math.PI / 8); W.addFloor(r.x, r.z, 7.0, .6);
    for (let k = -5; k <= 5; k += 2.5) { const hl = Math.sqrt(Math.max(0, 6.4 * 6.4 - k * k)); st.strip(r.x + Math.cos(RY) * k, r.z - Math.sin(RY) * k, .08, hl * 2, RY, .61, 0xa89e86); const q = { x: r.x + Math.sin(RY) * k, z: r.z + Math.cos(RY) * k }; st.strip(q.x, q.z, .08, hl * 2, RY + Math.PI / 2, .61, 0xa89e86); }
    for (let j = 0; j < 4; j++) { const an = RY + Math.PI / 4 + j * Math.PI / 2, x = r.x + Math.sin(an) * 8.2, z = r.z + Math.cos(an) * 8.2; st.cyl(x, 0, z, .38, .44, 3.2, 0xe8e0c8, 8); st.cyl(x, 3.2, z, .6, .3, .4, 0x6a5a4a, 8); lamp.sph(x, 3.8, z, .38, 0xff9a2e, 1); W.addCircle(x, z, .5, false, 3.6); }
    for (const t of K.targets) { const q = at(t[0], t[1]); st.cyl(q.x, 0, q.z, .65, .85, 1.3, 0x7885a7, 10); st.cyl(q.x, 1.3, q.z, .8, .6, .15, 0xffd55b, 10); W.addCircle(q.x, q.z, .85, false, 1.5); }
    /* Sternkugel-Altar: Stufensockel mit sieben goldenen Mulden */
    const al = at(K.altar[0], K.altar[1]); st.cyl(al.x, 0, al.z, 2.8, 3.1, .45, 0x8a8fa8, 14); st.cyl(al.x, .45, al.z, 2.0, 2.2, .85, 0xa8adc4, 14); st.cyl(al.x, 1.3, al.z, 2.1, 2.1, .08, 0xffd55b, 14);
    for (let i = 0; i < 7; i++) { const an = i / 7 * TAU; st.cyl(al.x + Math.sin(an) * 1.35, 1.38, al.z + Math.cos(an) * 1.35, .3, .22, .12, 0xffd55b, 8); }
    W.addCircle(al.x, al.z, 3.0, false, 1.4);
    /* Kirschbäume (rosa Kronen) */
    for (const t of K.trees) { const q = at(t[0], t[1]); if (!W.free(q.x, q.z, 1.2)) continue; st.cyl(q.x, 0, q.z, .22, .32, 2.4, 0x6b4423, 7); st.sph(q.x, 3.2, q.z, 1.7, 0xffb7d5, 1, 1, .8, 1); st.sph(q.x + .8, 3.8, q.z - .3, 1.0, 0xffc9e0, 1); W.addCircle(q.x, q.z, .45, false, 3); BI.isleTree(q.x, q.z, 4); }
    const cl = at(K.cloud[0], K.cloud[1]); W.vehicleSpawns.push({ type: 'wolke', x: cl.x, z: cl.z, h: RY });
  }
  /* ---------- Runen-Arena: Duell-Stadion ---------- */
  { const R = I.RUNE, S = at(R.stadium[0], R.stadium[1]), sa = R.stadium[0], SEATS = [0x7a4ad8, 0x4a6ad8, 0xb48aff];
    st.strip(S.x, S.z, 11, 17, RY, ROADY + .02, 0x2b2350); st.strip(S.x, S.z, .14, 17, RY, ROADY + .03, 0xffd55b); st.strip(S.x, S.z, 11, .14, RY, ROADY + .03, 0xffd55b);
    for (const side of [-1, 1]) for (let i = 0; i < 5; i++) { const q = at(sa + side * 4.6, -4 + i * 2); st.strip(q.x, q.z, 1.5, 2.1, RY, ROADY + .028, side < 0 ? 0x2f8fc8 : 0xc83f9a); }
    for (let k = 0; k < 3; k++) { const rr = 15 + k * 1.5, N = 30, h = .7 + k * .75; for (let i = 0; i < N; i++) { const t = (i + .5) / N * TAU; if (Math.abs(t - Math.PI) < .55) continue;
      const q = at(sa + Math.cos(t) * rr, Math.sin(t) * rr), yaw = face(q, S); st.box(q.x, 0, q.z, TAU * rr / N + .12, h, 1.5, SEATS[(i + k) % 3], yaw); if (k === 0 && i % 2 === 0) W.addCircle(at(sa + Math.cos(t) * 16.5, Math.sin(t) * 16.5).x, at(sa + Math.cos(t) * 16.5, Math.sin(t) * 16.5).z, 2.6, false, 2.4); } }
    for (const t of [Math.PI / 4, -Math.PI / 4, Math.PI * .72, -Math.PI * .72]) { const q = at(sa + Math.cos(t) * 20.4, Math.sin(t) * 20.4); st.cyl(q.x, 0, q.z, .25, .35, 9, 0x8a94a6, 8); st.box(q.x, 9, q.z, 1.8, .9, .4, 0x3a3f4a, face(q, S)); lamp.box(q.x, 9.15, q.z, 1.5, .6, .45, 0xfff6c8, face(q, S)); W.addCircle(q.x, q.z, .45, false, 9); }
    for (const [hp, col] of [[R.holo[0], 0x58d9ff], [R.holo[1], 0xff79c9]]) { const q = at(hp[0], hp[1]); st.cyl(q.x, 0, q.z, 1.9, 2.1, .16, 0x3a2f6a, 18); lamp.cyl(q.x, .16, q.z, 1.5, 1.5, .04, col, 18); }
    for (const [pp, col] of [[R.podium, 0x58d9ff], [[R.foe[0] - 1.5, 0], 0xff79c9]]) { const q = at(pp[0], pp[1]); st.box(q.x, 0, q.z, 2.2, 1.1, 1.2, 0x3a2f6a, RY + Math.PI / 2); lamp.box(q.x, 1.1, q.z, 1.9, .08, .9, col, RY + Math.PI / 2); }
    { const q = at(R.podium[0], R.podium[1]); W.spots.prismaPodium = q; }
    /* Kartenautomat und Rätselprisma-Sockel */
    { const q = at(R.booster[0], R.booster[1]), yaw = face(q, ctr); st.box(q.x, 0, q.z, 1.8, 2.5, 1.2, 0x6a4ad8, yaw); st.box(q.x, 2.5, q.z, 2.0, .35, 1.4, 0xffd55b, yaw); const f = loc(q, yaw, 0, .62); lamp.box(f.x, 1.3, f.z, 1.2, .8, .06, 0x8ff0ff, yaw); st.box(f.x, .8, f.z, .9, .12, .1, 0x23262d, yaw); W.addCircle(q.x, q.z, 1.0, false, 2.9); }
    { const q = at(R.prism[0], R.prism[1]); st.cyl(q.x, 0, q.z, 1.5, 1.8, 1.1, 0x5e6b91, 6); st.cyl(q.x, 1.1, q.z, 1.2, 1.2, .1, 0xffd55b, 6); W.addCircle(q.x, q.z, 1.8, false, 1.2); }
  }
  /* ---------- Datenhain ---------- */
  { const D = I.DATA, g = at(D.grid[0], D.grid[1]), NEON = [0x58d9ff, 0xff79c9, 0x8df47a, 0xb48aff];
    st.disc(g.x, g.z, 15, ROADY + .016, 0x173a5c, 48); st.ring(g.x, g.z, 14.4, 15, ROADY + .03, 0x55e6ff, 48);
    for (let k = -12; k <= 12; k += 3) { const hl = Math.sqrt(14.2 * 14.2 - k * k); st.rect(g.x + k - .06, g.z - hl, g.x + k + .06, g.z + hl, ROADY + .024, 0x2fb6e8); st.rect(g.x - hl, g.z + k - .06, g.x + hl, g.z + k + .06, ROADY + .024, 0x2fb6e8); }
    for (let j = 0; j < 4; j++) { const an = Math.PI / 4 + j * Math.PI / 2, q = at(D.grid[0] + Math.cos(an) * 12.6, D.grid[1] + Math.sin(an) * 12.6); st.box(q.x, 0, q.z, .9, .5, .9, 0x2a3f6a); st.box(q.x, .5, q.z, .34, 6.2, .34, NEON[j]); lamp.sph(q.x, 6.9, q.z, .32, NEON[j], 1); W.addCircle(q.x, q.z, .55, false, 7); }
    /* Datentor: alter Röhrenfernseher mit flimmerndem Bildschirm und Antennen */
    { const q = at(D.tv[0], D.tv[1]), yaw = face(q, g); for (const lx of [-2.4, 2.4]) { const l = loc(q, yaw, lx, 0); st.box(l.x, 0, l.z, .4, .8, .4, 0x3a3f4a, yaw); }
      st.box(q.x, .8, q.z, 6.6, 5, 2.6, 0xd9c9a0, yaw); const f = loc(q, yaw, 0, 1.31); st.box(f.x, 1.25, f.z, 5.3, 3.9, .06, 0x23262d, yaw); st.box(f.x, 1.55, f.z, 4.7, 3.3, .1, 0x58d9ff, yaw); for (let k = 0; k < 5; k++) { const l = loc(q, yaw, -1.8 + k * .9, 1.37); st.box(l.x, 2.0 + (k % 3) * .7, l.z, .5, .5, .04, NEON[k % 4], yaw); }
      for (const lx of [-2.8, 2.8]) { const l = loc(q, yaw, lx, 1.32); st.cyl(l.x, 1.0, l.z, .2, .2, .12, 0x5a4a3a, 10, Math.PI / 2, yaw); }
      st.box(q.x, 5.8, q.z, .9, .5, .9, 0x5a4a3a, yaw); for (const sd of [-1, 1]) { const l = loc(q, yaw, sd * .9, 0); st.box(l.x, 6.2, l.z, .1, 2.6, .1, 0xbfc4d4, yaw, 0, -sd * .55); }
      W.addCircle(q.x, q.z, 3.5, false, 6); W.spots.prismaTv = loc(q, yaw, 0, 3.4); }
    /* Würfelbäume */
    D.trees.forEach((t, i) => { const q = at(t[0], t[1]); if (!W.free(q.x, q.z, 1.2)) return; st.box(q.x, 0, q.z, .5, 2.4, .5, 0x2a3f6a); st.box(q.x, 2.4, q.z, 2.4, 1.6, 2.4, NEON[i % 4], i * .4); st.box(q.x + .5, 4.0, q.z - .3, 1.5, 1.2, 1.5, NEON[(i + 1) % 4], i * .7); lamp.box(q.x - .4, 5.2, q.z + .2, .7, .7, .7, NEON[(i + 2) % 4], i); W.addCircle(q.x, q.z, .5, false, 5); BI.isleTree(q.x, q.z, 5); });
    /* Ei-Nest */
    { const q = at(D.nest[0], D.nest[1]); st.cyl(q.x, 0, q.z, 1.7, 2.0, .45, 0x6b4a2a, 14); for (let i = 0; i < 14; i++) { const an = i / 14 * TAU; st.box(q.x + Math.sin(an) * 1.75, .3, q.z + Math.cos(an) * 1.75, .9, .22, .18, i % 2 ? 0x8a6a3a : 0xa8824a, an + .6); } st.cyl(q.x, .45, q.z, 1.2, 1.2, .05, 0xd8c08a, 14); W.addCircle(q.x, q.z, 1.9, false, .8); }
  }
};

/* Die drei Prüfungen sind dauerhaft gespeichert, ansprechbar und geben Sticker sowie Sterne.
   Ausbau: Figuren zum Anquatschen, sieben Sternkugeln + Lichtdrache, Ki-Welle im Turnier-Ring, Holo-Monster und Runen-Duell im Stadion,
   Kartenautomat (12 Runenkarten), Rätselprisma, Partner-Ei im Datenhain, das mit Datenwürfeln in drei Stufen wächst.
   Sparsam: alles in einer Gruppe, die nur in der Nähe der Insel sichtbar ist und gerechnet wird. */
BI.createPrisma = function (G) {
  const { P, save, persist, say, addStars, earn, fx } = G, I = BI.PRISMA, at = I.at, K = {}, TAU = Math.PI * 2, A = G.A || {}, snd = n => { try { A[n] && A[n](); } catch (e) { } };
  const S = () => { const s = save.prisma || (save.prisma = { done: {}, step: {} }); s.done = s.done || {}; s.step = s.step || {};
    if (!Array.isArray(s.orbs) || s.orbs.length !== 7) s.orbs = [0, 0, 0, 0, 0, 0, 0]; if (!Array.isArray(s.cards)) s.cards = []; if (!s.pet || typeof s.pet !== 'object') s.pet = { stage: 0, bits: 0 }; return s; };
  const near = (x, z, r) => !P.veh && P.y < 1.8 && Math.hypot(P.x - x, P.z - z) < r;
  const scene = G.scene, root = new THREE.Group(); if (scene) scene.add(root);
  const ry = I.bridge.ry, ctr = at(0, 0), face = (p, q) => Math.atan2(q.x - p.x, q.z - p.z);
  const sign = (txt, p, y, w) => { const cv = document.createElement('canvas'); cv.width = 512; cv.height = 96; const c = cv.getContext('2d'); let f = 54; c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; const mw = c.measureText(txt).width; if (mw > 470) { f = Math.floor(f * 470 / mw); c.font = 'bold ' + f + 'px Fredoka, system-ui, sans-serif'; }
    c.fillStyle = 'rgba(30,24,70,.82)'; c.fillRect(0, 8, 512, 80); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#fff'; c.fillText(txt, 256, 50);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), depthWrite: false })); sp.position.set(p.x, y, p.z); sp.scale.set(w, w * 96 / 512, 1); root.add(sp); return sp; };
  const mesh = (b, mat) => { const m = b.mesh(mat || BI.mat()); root.add(m); return m; };
  /* ---------- Figuren ---------- */
  const folk = [];
  const npc = (name, ab, look, lines, anim) => { const p = at(ab[0], ab[1]); let c = null; try { c = BI.makeChar(look); } catch (e) { return; } c.group.position.set(p.x, 0, p.z); c.group.rotation.y = face(p, ctr); root.add(c.group); BI.DLG_LOOKS[name] = look; folk.push({ name, x: p.x, z: p.z, c, lines, i: 0, anim, h: c.group.rotation.y }); };
  npc('Meister Wolkenbart', [-9, -50], { shirt: 0xff8a1f, pants: 0x3d4a7a, hair: 0xffffff, skin: 0xf3c9a0, style: 'bald', glassT: 1, wrink: 1, scale: .9 }, ['Willkommen im Ki-Garten, junger Freund! 🥋', 'Im Turnier-Ring übst du die Ki-Welle: Stell dich in die Mitte und drück die Aktion. Triff alle drei Kristalle!', 'Irgendwo auf dem Archipel liegen sieben orange Sternkugeln. Bring sie zum Altar, dann erscheint der Lichtdrache!', 'Mit der goldenen Flugwolke kommst du überall hin. Spring einfach auf!']);
  npc('Kiro', [34, -42], { shirt: 0x3fa0ff, pants: 0xff8a1f, hair: 0x222222, skin: 0xffd2a8, style: 'spiky', scale: .66 }, ['Hah! Hah! Ich trainiere jeden Tag! 💪', 'Wer trainiert, wird stärker. Am wichtigsten ist aber, fair zu bleiben.', 'Hast du schon eine Sternkugel gefunden? Sie leuchten orange!'], 'kata');
  npc('Duellmeisterin Kaia', I.RUNE.foe, { shirt: 0x7a4ad8, pants: 0x23262d, hair: 0xff79c9, skin: 0xe0a979, style: 'long', scale: .95 }, ['Willkommen im Duell-Stadion! 🃏', 'Stell dich aufs blaue Podest und starte ein Runen-Duell. Gewinne drei von fünf Runden!', 'Feuer schlägt Pflanze, Pflanze schlägt Wasser, Wasser schlägt Feuer. Das gibt +3 Kraft!', 'Am Kartenautomaten bekommst du neue Runenkarten. Es gibt 12 verschiedene!']);
  npc('Pixa', [23, 54], { shirt: 0x58d9ff, pants: 0x3d4a7a, hair: 0x8df47a, skin: 0xffe4d1, style: 'twinbuns', glassT: 1, scale: .64 }, ['Hallo! Ich bin Pixa und erforsche den Datenhain. 💠', 'Im Nest liegt ein Partner-Ei. Nimm es mit, dann schlüpft dein Digi-Partner!', 'Die schwebenden Datenwürfel machen deinen Partner stärker. Sammle sie, dann wächst er!', 'Das alte Datentor war früher ein Fernseher. Jetzt summt es vor lauter Daten!']);
  { const d = W_spot('prismaDojo'); if (d) sign('🥋 Ki-Tempel', d, 7.2, 6); }
  sign('🐉 Sternkugel-Altar', at(I.KI.altar[0], I.KI.altar[1]), 4.4, 6.5); sign('🥊 Turnier-Ring', at(I.KI.ring[0], I.KI.ring[1]), 6.5, 6);
  sign('🏟️ Duell-Stadion', at(I.RUNE.stadium[0] - 15, 0), 5.2, 7); sign('🎴 Kartenautomat', at(I.RUNE.booster[0], I.RUNE.booster[1]), 4.2, 5.5); sign('📺 Datentor', at(I.DATA.tv[0], I.DATA.tv[1]), 9.4, 6); sign('🥚 Partner-Nest', at(I.DATA.nest[0], I.DATA.nest[1]), 3.2, 5);
  function W_spot(k) { return G.W && G.W.spots ? G.W.spots[k] : null; }
  /* ---------- Sternkugeln + Altar + Lichtdrache ---------- */
  const orbMesh = (n) => { const b = new BI.Batch(); b.sph(0, 0, 0, .5, 0xffa31a, 2); for (let k = 0; k < n; k++) { const a = n === 1 ? 0 : k / n * TAU; b.sph(Math.sin(a) * (n === 1 ? 0 : .2), Math.cos(a) * (n === 1 ? 0 : .2), .44, .08, 0xe8202a, 0); } return b; };
  const orbs = I.ORBS.map((ab, i) => { const p = at(ab[0], ab[1]), m = mesh(orbMesh(i + 1)); m.position.set(p.x, 1.2, p.z); return { m, x: p.x, z: p.z, i }; });
  const al = at(I.KI.altar[0], I.KI.altar[1]), altarOrbs = orbs.map((o, i) => { const an = i / 7 * TAU, m = mesh(orbMesh(i + 1)); m.scale.setScalar(.55); m.position.set(al.x + Math.sin(an) * 1.35, 1.75, al.z + Math.cos(an) * 1.35); return m; });
  const syncOrbs = () => { const s = S(); orbs.forEach((o, i) => { o.m.visible = !s.orbs[i]; altarOrbs[i].visible = !!s.orbs[i]; }); };
  const DRN = 30, drMat = new THREE.MeshLambertMaterial({ color: 0x6dff8f, emissive: 0x1a6a2a }), drBody = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), drMat, DRN); drBody.frustumCulled = false; drBody.visible = false; root.add(drBody);
  const drHead = (() => { const b = new BI.Batch(); b.sph(0, 0, 0, 1.3, 0x6dff8f, 1, 1, .85, 1.3); b.sph(0, -.25, 1.3, .7, 0x8dffa8, 1, 1, .7, 1); for (const s2 of [-1, 1]) { b.sph(s2 * .55, .45, .75, .22, 0xff3030, 0); b.cyl(s2 * .55, .7, -.3, .05, .16, 1.6, 0xffd55b, 5, -.8, 0, s2 * .3); b.cyl(s2 * .3, -.5, 1.9, .03, .03, 1.6, 0xfff3a0, 4, 1.2, 0, s2 * .5); } return mesh(b); })(); drHead.visible = false;
  const dm = new THREE.Matrix4(), dq = new THREE.Quaternion(), dv = new THREE.Vector3(), ds = new THREE.Vector3(), dpos = (u) => { const r = 5 + Math.sin(u * .8) * 2, y = Math.min(24, 1.5 + u * 3.4); return [al.x + Math.sin(u * 1.4) * r, y, al.z + Math.cos(u * 1.4) * r]; };
  let summon = null;
  function startSummon() {
    summon = { t: 0, wished: false }; drBody.visible = drHead.visible = true; snd('fanfare'); say('🌑 Die sieben Sternkugeln leuchten … der Himmel funkelt!', 2600);
    fx.burst(al.x, 2, al.z, 30, [0xffa31a, 0xffffff, 0x6dff8f], 6, 1.6, 30, 2);
  }
  function stepSummon(dt) {
    const sm = summon; sm.t += dt; const T = sm.t * 1.6, fade = sm.t > 9 ? Math.max(0, 1 - (sm.t - 9) / 1.5) : 1;
    for (let i = 0; i < DRN; i++) { const u = T - i * .2; if (u < 0) { ds.set(0, 0, 0); dm.compose(dv.set(al.x, 0, al.z), dq.identity(), ds); drBody.setMatrixAt(i, dm); continue; }
      const [x, y, z] = dpos(u), k = (1.05 - i / DRN * .7) * fade; dm.compose(dv.set(x, y, z), dq.identity(), ds.set(k, k, k)); drBody.setMatrixAt(i, dm); }
    drBody.instanceMatrix.needsUpdate = true; const [hx, hy, hz] = dpos(T + .2), [nx, ny, nz] = dpos(T + .45); drHead.position.set(hx, hy, hz); drHead.lookAt(nx, ny, nz); drHead.scale.setScalar(fade || .001);
    if (!sm.wished && sm.t > 6.5) { sm.wished = true; const s = S(), first = !s.wish; s.wish = (s.wish | 0) + 1; s.orbs = [0, 0, 0, 0, 0, 0, 0]; persist(); syncOrbs();
      if (first) { earn('prisma_drache'); addStars(20); } else addStars(5); snd('fanfare'); fx.burst(hx, hy, hz, 40, [0x6dff8f, 0xffd55b, 0xffffff], 8, 1.8, 32, -1);
      say('Lichtdrache: „Du hast mich gerufen! Dein Wunsch: ' + (first ? '20' : '5') + ' Sterne für dich! Die Sternkugeln fliegen wieder über die Insel.“', 6200); }
    if (sm.t > 10.6) { summon = null; drBody.visible = drHead.visible = false; }
  }
  /* ---------- Ki-Welle im Turnier-Ring ---------- */
  const ring = at(I.KI.ring[0], I.KI.ring[1]), TCOL = [0x58d9ff, 0xffd55b, 0xff79c9];
  const targets = I.KI.targets.map((ab, i) => { const p = at(ab[0], ab[1]), b = new BI.Batch(); b.sph(0, 0, 0, .7, TCOL[i], 0, 1, 1.5, 1); b.sph(0, 0, 0, .35, 0xffffff, 0, 1, 1.6, 1); const m = mesh(b); m.position.set(p.x, 2.4, p.z); return { m, x: p.x, z: p.z, alive: true, k: 1 }; });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(.28, .28, 1, 10, 1, true), new THREE.MeshBasicMaterial({ color: 0x8ff0ff, transparent: true, opacity: .85, depthWrite: false })); beam.visible = false; root.add(beam);
  const beamBall = new THREE.Mesh(new THREE.SphereGeometry(.55, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .9 })); beamBall.visible = false; root.add(beamBall);
  let shot = null, respawn = 0; const up = new THREE.Vector3(0, 1, 0), bdir = new THREE.Vector3();
  function fire() {
    if (shot) return; const t = targets.find(q => q.alive); if (!t) { say('🌀 Die Kristalle bilden sich gerade neu …', 1600); return; }
    P.h = Math.atan2(t.x - P.x, t.z - P.z); if (G.punch) G.punch(); snd('whoosh'); shot = { t: 0, tg: t, x0: P.x + Math.sin(P.h) * .6, y0: P.y + 1.2, z0: P.z + Math.cos(P.h) * .6 };
  }
  function stepShot(dt) {
    const sh = shot; sh.t += dt; const k = Math.min(1, sh.t / .35), tg = sh.tg, ex = sh.x0 + (tg.x - sh.x0) * k, ey = sh.y0 + (2.4 - sh.y0) * k, ez = sh.z0 + (tg.z - sh.z0) * k;
    bdir.set(ex - sh.x0, ey - sh.y0, ez - sh.z0); const L = Math.max(.01, bdir.length()); beam.visible = beamBall.visible = sh.t < .65; beam.position.set((sh.x0 + ex) / 2, (sh.y0 + ey) / 2, (sh.z0 + ez) / 2); beam.quaternion.setFromUnitVectors(up, bdir.normalize()); beam.scale.set(1, L, 1);
    beam.material.opacity = sh.t > .35 ? Math.max(0, .85 - (sh.t - .35) * 2.8) : .85; beamBall.position.set(ex, ey, ez);
    if (k >= 1 && tg.alive) { tg.alive = false; tg.m.visible = false; snd('pop'); fx.burst(tg.x, 2.4, tg.z, 22, [0x8ff0ff, 0xffffff, 0xffd55b], 6, 1, 28, 4);
      if (targets.every(q => !q.alive)) { const s = S(), first = !s.welle; s.welle = (s.welle | 0) + 1; persist(); if (first) { earn('prisma_welle'); addStars(3); say('🌀 Volltreffer! Alle drei Kristalle getroffen. +3 ⭐', 3000); } else { addStars(1); say('🌀 Super Ki-Welle! +1 ⭐', 2000); } respawn = 3.5; }
      else say('🌀 Treffer! Noch ' + targets.filter(q => q.alive).length + ' Kristall' + (targets.filter(q => q.alive).length === 1 ? '' : 'e') + '.', 1500); }
    if (sh.t > .7) { shot = null; beam.visible = beamBall.visible = false; }
  }
  /* ---------- Runen-Arena: Holo-Monster, Kartenautomat, Rätselprisma ---------- */
  const holoMat = new THREE.MeshLambertMaterial({ vertexColors: true, transparent: true, opacity: .8, emissive: 0x2a3a66 });
  const dragonB = new BI.Batch(); { const b = dragonB, C1 = 0xbfe9ff, C2 = 0x8fd8ff; b.sph(0, 2.2, 0, 1.1, C1, 1, 1, .9, 1.5); b.cyl(0, 2.6, .9, .38, .5, 1.6, C1, 8, -.6); b.sph(0, 4.0, 1.7, .62, C1, 1, 1, .85, 1.3); b.sph(0, 3.8, 2.3, .35, 0xe8f8ff, 1);
    for (const sd of [-1, 1]) { b.sph(sd * .32, 4.2, 2.1, .12, 0x2a6aff, 0); b.cone(sd * .3, 4.4, 1.4, .12, .7, 0xffffff, 5); b.box(sd * 1.7, 3.0, -.2, 2.8, .08, 1.7, C2, 0, 0, sd * -.55); b.cyl(sd * .6, .4, .6, .2, .26, 1.6, C1, 6); b.cyl(sd * .6, .4, -.8, .2, .26, 1.6, C1, 6); }
    for (let k = 0; k < 4; k++) b.sph(0, 2.0 - k * .15, -1.6 - k * .7, .5 - k * .1, C1, 1); }
  const mageB = new BI.Batch(); { const b = mageB, RB = 0x7a4ad8; b.cyl(0, 0, 0, .45, 1.1, 2.7, RB, 10); b.cyl(0, 1.2, 0, .5, .55, .18, 0xffd55b, 10); b.sph(0, 3.1, 0, .48, 0xf0dcff, 1); b.cyl(0, 3.35, 0, .9, .9, .08, 0x4a2aa8, 12); b.cone(0, 3.4, 0, .6, 1.8, 0x4a2aa8, 8);
    for (const sd of [-1, 1]) { b.sph(sd * .18, 3.15, .42, .07, 0xffffff, 0); b.box(sd * .62, 2.0, .2, .32, .9, .32, RB, 0, 0, sd * .5); } b.cyl(1.0, .2, .5, .06, .06, 3.4, 0x8a5a33, 6); b.sph(1.0, 3.7, .5, .3, 0xffe14a, 1); }
  const holo = [[I.RUNE.holo[0], dragonB, 1.1], [I.RUNE.holo[1], mageB, 1.25]].map(([ab, b, sc], i) => { const p = at(ab[0], ab[1]), m = mesh(b, holoMat); m.scale.setScalar(sc); m.position.set(p.x, .3, p.z); m.rotation.y = ry + (i ? Math.PI : 0); return { m, x: p.x, z: p.z, ph: i * 1.7 }; });
  const pr = at(I.RUNE.prism[0], I.RUNE.prism[1]), prismM = (() => { const b = new BI.Batch(); b.cyl(0, 0, 0, 1.3, 0, 2.2, 0xffd55b, 4); b.cyl(0, 2.2, 0, .9, 1.3, .25, 0xffe9a0, 4); b.sph(0, 1.35, .62, .2, 0x7a4ad8, 0, 1, 1, .4); return mesh(b); })(); prismM.position.set(pr.x, 1.5, pr.z);
  const RIDDLE = ['🔺 Das Rätselprisma flüstert: „Was wird nasser, je mehr es trocknet?“ … Ein Handtuch! 😄', '🔺 „Was hat Zähne, aber beißt nie?“ … Ein Kamm!', '🔺 „Je mehr du wegnimmst, desto größer werde ich. Was bin ich?“ … Ein Loch!', '🔺 „Was läuft, hat aber keine Beine?“ … Die Nase! 👃', '🔺 „Was ist immer vor dir, aber du siehst es nie?“ … Die Zukunft! ✨'];
  let riddleI = 0, boostT = 0;
  function pack() {
    const s = S(), C = BI.PRISMA_CARDS, missing = C.map((c, i) => i).filter(i => !s.cards.includes(i)); const i = missing.length && Math.random() < .75 ? missing[(Math.random() * missing.length) | 0] : (Math.random() * C.length) | 0, c = C[i];
    snd('pop'); fx.burst(P.x, 2.2, P.z, 14, [0xb48aff, 0xffd55b, 0xffffff], 4, 1, 24, 3);
    if (!s.cards.includes(i)) { s.cards.push(i); persist(); say('🎴 Neue Runenkarte: ' + c[0] + ' ' + c[1] + ' (Kraft ' + c[2] + ')! ' + s.cards.length + ' von ' + C.length, 3200); if (s.cards.length >= C.length) { earn('prisma_karten'); addStars(5); say('🎴 Alle ' + C.length + ' Runenkarten gesammelt! +5 ⭐', 3600); } }
    else say('🎴 ' + c[0] + ' ' + c[1] + ' hast du schon. Probier es nochmal! (' + s.cards.length + ' von ' + C.length + ')', 2600);
  }
  K.duelDone = function () { const r = BI.PRISMA_DUEL; BI.PRISMA_DUEL = null; if (!r || !r.done) return; const s = S();
    if (r.won) { const first = !s.duel; s.duel = (s.duel | 0) + 1; persist(); if (first) earn('prisma_duell'); say('Duellmeisterin Kaia: „Stark gespielt! Du hast ' + r.me + ' zu ' + r.ai + ' gewonnen. 🏆“', 4200); }
    else say('Duellmeisterin Kaia: „Knapp! ' + r.me + ' zu ' + r.ai + '. Probier es gleich nochmal!“', 3600); };
  /* ---------- Datenhain: Datenwürfel, Partner-Ei, Digi-Partner ---------- */
  const dg = at(I.DATA.grid[0], I.DATA.grid[1]), NB = 10, BCOL = [0x58d9ff, 0xff79c9, 0x8df47a, 0xb48aff];
  const bits = []; for (let i = 0; i < NB; i++) { const an = i / NB * TAU + .3, r = 6 + (i % 3) * 2.6, p = at(I.DATA.grid[0] + Math.cos(an) * r, I.DATA.grid[1] + Math.sin(an) * r); bits.push({ x: p.x, z: p.z, on: true, t: 0, ph: i * .9 }); }
  const bitMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(.55, .55, .55), new THREE.MeshBasicMaterial({ color: 0xffffff }), NB); bitMesh.frustumCulled = false; root.add(bitMesh);
  { const col = new THREE.Color(); for (let i = 0; i < NB; i++) { col.setHex(BCOL[i % 4]); bitMesh.setColorAt(i, col); } if (bitMesh.instanceColor) bitMesh.instanceColor.needsUpdate = true; }
  const nest = at(I.DATA.nest[0], I.DATA.nest[1]);
  const eggM = (() => { const b = new BI.Batch(); b.sph(0, 0, 0, .55, 0xfff8ec, 1, 1, 1.3, 1); for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; b.sph(Math.sin(a) * .5, (k % 2 ? .2 : -.15), Math.cos(a) * .5, .13, k % 2 ? 0x58d9ff : 0xff79c9, 0); } return mesh(b); })(); eggM.position.set(nest.x, 1.2, nest.z);
  const STG = [null, { name: 'Bitti', sc: 1 }, { name: 'Byton', sc: 1 }, { name: 'Gigaflux', sc: 1 }];
  const petB = [null, (() => { const b = new BI.Batch(); b.sph(0, .5, 0, .48, 0x7fe0ff, 1, 1, .9, 1); for (const sd of [-1, 1]) { b.sph(sd * .18, .62, .38, .13, 0xffffff, 0); b.sph(sd * .18, .62, .48, .07, 0x1a1a2a, 0); b.cone(sd * .28, .85, -.05, .1, .45, 0x58d9ff, 5); b.sph(sd * .25, .1, .1, .12, 0x3a8ab8, 0); } b.sph(0, .42, .44, .06, 0xff79c9, 0); return b; })(),
    (() => { const b = new BI.Batch(), O = 0xff9a3a; b.sph(0, .8, 0, .7, O, 1, 1, 1.05, 1.1); b.sph(0, .7, .38, .45, 0xffe2b0, 1, 1, 1, .6); b.sph(0, 1.6, .35, .5, O, 1); b.cone(0, 2.0, .3, .16, .5, 0xffe14a, 5);
      for (const sd of [-1, 1]) { b.sph(sd * .2, 1.72, .78, .11, 0xffffff, 0); b.sph(sd * .2, 1.72, .86, .06, 0x1a1a2a, 0); b.cyl(sd * .35, 0, .1, .16, .2, .45, O, 6); b.box(sd * .62, .95, .2, .2, .5, .2, O, 0, 0, sd * .5); } for (let k = 0; k < 3; k++) b.sph(0, .65 - k * .1, -.75 - k * .38, .3 - k * .07, O, 0); return b; })(),
    (() => { const b = new BI.Batch(), V = 0x8a5cff; b.sph(0, 1.5, 0, 1.0, V, 1, 1, 1.1, 1.1); b.sph(0, 1.4, .7, .55, 0xd8c8ff, 1, 1, 1, .5); b.sph(0, 2.7, .45, .62, V, 1); b.sph(0, 1.7, .95, .2, 0x58d9ff, 0);
      for (const sd of [-1, 1]) { b.sph(sd * .25, 2.85, .98, .12, 0xffffff, 0); b.sph(sd * .25, 2.85, 1.06, .06, 0x1a1a2a, 0); b.cone(sd * .35, 3.15, .3, .14, .7, 0xffd55b, 5); b.box(sd * 1.5, 2.0, -.3, 2.2, .1, 1.3, 0xb48aff, 0, 0, sd * -.5); b.cyl(sd * .45, 0, .1, .25, .32, .7, V, 6); } for (let k = 0; k < 4; k++) b.sph(0, 1.2 - k * .1, -1.1 - k * .45, .4 - k * .08, V, 0); return b; })()];
  const pet = { g: new THREE.Group(), m: [null], x: nest.x, z: nest.z, h: 0, hop: 0, evo: 0, stage: -1 }; root.add(pet.g); for (let i = 1; i <= 3; i++) { const m = petB[i].mesh(BI.mat()); m.visible = false; pet.g.add(m); pet.m.push(m); }
  const showStage = n => { pet.stage = n; for (let i = 1; i <= 3; i++) pet.m[i].visible = i === n; pet.g.visible = n > 0; eggM.visible = n === 0; };
  let bitHintT = 0;
  function evolve(n) { pet.evo = 1.4; pet.next = n; snd('fanfare'); fx.burst(pet.x, 1.4, pet.z, 36, [0x58d9ff, 0xff79c9, 0xffffff, 0x8df47a], 6, 1.4, 30, 2); say('💠 ' + STG[n - 1].name + ' digitiert … zu ' + STG[n].name + '! ✨', 3200); }
  function feed(b) { const s = S(), pt = s.pet; pt.bits = (pt.bits | 0) + 1; persist(); snd('ding'); fx.burst(b.x, 1.4, b.z, 10, [0x58d9ff, 0xffffff], 3, .7, 22, 2);
    const need = pt.stage === 1 ? 4 : pt.stage === 2 ? 10 : 0; if (need && pt.bits >= need) { pt.stage++; persist(); evolve(pt.stage); if (pt.stage === 3) { earn('prisma_partner'); addStars(5); } }
    else if (need) say('💠 Datenwürfel! ' + STG[pt.stage].name + ' wächst: ' + pt.bits + ' von ' + need, 1800); else say('💠 ' + STG[3].name + ' freut sich über den Datenwürfel! 💜', 1600); }
  /* ---------- Interaktion ---------- */
  K.near = () => {
    if (Math.hypot(P.x - I.x, P.z - I.z) > I.R + 24) return null;
    let best = null, bd = 3.6;
    for (const q of I.zones) {
      if (near(q.hint.x, q.hint.z, bd)) { const d = Math.hypot(P.x - q.hint.x, P.z - q.hint.z); if (d < bd) { bd = d; best = { k: 'hint', zone: q.id, label: '📜 Rätselhinweis' }; } }
      for (const p of q.pads) if (near(p.x, p.z, bd)) { const d = Math.hypot(P.x - p.x, P.z - p.z); if (d < bd) { bd = d; best = { k: 'pad', zone: q.id, i: p.i, label: ['🔵', '🟡', '🟣'][p.i] + ' Prüf-Pylon' }; } }
    }
    if (P.veh) return best;
    const cand = (x, z, r, o) => { const d = Math.hypot(P.x - x, P.z - z); if (d < r && (!best || d < bd)) { bd = d; best = o; } };
    for (const f of folk) cand(f.x, f.z, 2.6, { k: 'talk', f, label: '💬 ' + f.name });
    { const s = S(), all = s.orbs.every(Boolean); cand(al.x, al.z, 4.4, summon ? { k: 'altar', label: '🐉 Der Lichtdrache erscheint …' } : all ? { k: 'summon', label: '🐉 Lichtdrache rufen' } : { k: 'altar', label: '🟠 Sternkugel-Altar (' + s.orbs.filter(Boolean).length + ' von 7)' }); }
    if (P.y > .3 && P.y < 1.8 && Math.hypot(P.x - ring.x, P.z - ring.z) < 5.6) cand(ring.x, ring.z, 6, { k: 'welle', label: '🌀 Ki-Welle' });
    { const q = W_spot('prismaPodium'); if (q) cand(q.x, q.z, 2.6, { k: 'duel', label: '🃏 Runen-Duell' }); }
    { const q = at(I.RUNE.booster[0], I.RUNE.booster[1]); cand(q.x, q.z, 2.8, { k: 'pack', label: '🎴 Kartenpack ziehen' }); }
    cand(pr.x, pr.z, 3.2, { k: 'riddle', label: '🔺 Rätselprisma' });
    { const q = W_spot('prismaTv'); if (q) cand(q.x, q.z, 3, { k: 'tv', label: '📺 Datentor' }); }
    { const s = S(); if (!s.pet.stage) cand(nest.x, nest.z, 3.4, { k: 'egg', label: '🥚 Partner-Ei nehmen' }); else if (pet.stage > 0) cand(pet.x, pet.z, 2.2, { k: 'pet', label: '💠 ' + STG[pet.stage].name + ' streicheln' }); }
    return best;
  };
  const complete = (q) => { const s = S(); if (s.done[q.id]) return; s.done[q.id] = true; s.step[q.id] = q.order.length; persist(); earn('prisma_' + q.id); addStars(5); fx.burst(P.x, 2, P.z, 28, [q.colors[0], q.colors[1], q.colors[2], 0xffffff], 5, 1.5, 28, 5); say('✨ ' + q.name + ' gemeistert! +5 ⭐', 3200); };
  K.act = n => {
    if (!n) return;
    if (n.k === 'talk') { const f = n.f, l = f.lines[f.i++ % f.lines.length]; f.c.group.rotation.y = Math.atan2(P.x - f.x, P.z - f.z); say(f.name + ': „' + l + '“', 4200); return; }
    if (n.k === 'summon') { if (!summon) startSummon(); return; }
    if (n.k === 'altar') { if (!summon) { const c2 = S().orbs.filter(Boolean).length; say(c2 ? '🟠 ' + c2 + ' von 7 Sternkugeln liegen im Altar. Die anderen leuchten irgendwo auf dem Archipel!' : '🟠 Sieben orange Sternkugeln sind auf dem Archipel versteckt. Lauf einfach hinein, dann sammelst du sie!', 3800); } return; }
    if (n.k === 'welle') { fire(); return; }
    if (n.k === 'duel') { if (G.startGame) G.startGame('duell_prisma'); return; }
    if (n.k === 'pack') { const now = performance.now(); if (now - boostT < 900) return; boostT = now; pack(); return; }
    if (n.k === 'riddle') { say(RIDDLE[riddleI++ % RIDDLE.length], 4800); prismM.userData.spin = 2; return; }
    if (n.k === 'tv') { const s = S(); fx.burst(P.x, 2.4, P.z, 16, [0x58d9ff, 0xffffff, 0xff79c9], 4, 1, 24, 2); snd('pop'); say('📺 Das Datentor flimmert: ' + (s.pet.stage ? STG[s.pet.stage].name + ' hat schon ' + (s.pet.bits | 0) + ' Datenwürfel gefuttert!' : 'Im Partner-Nest wartet ein Ei auf dich! 🥚'), 3400); return; }
    if (n.k === 'egg') { const s = S(); if (s.pet.stage) return; s.pet.stage = 1; s.pet.bits = 0; persist(); pet.x = nest.x; pet.z = nest.z; showStage(1); snd('fanfare'); fx.burst(nest.x, 1.2, nest.z, 30, [0xfff8ec, 0x58d9ff, 0xff79c9], 5, 1.2, 28, 3); say('Pixa: „Knack! Ein Bitti ist geschlüpft! 💠 Es folgt dir jetzt. Füttere es mit Datenwürfeln, dann wächst es!“', 5200); return; }
    if (n.k === 'pet') { pet.hop = .6; snd('giggle'); fx.burst(pet.x, 1.6 + pet.stage * .5, pet.z, 8, [0xff79c9, 0xffffff], 2.5, .8, 26, -1); say(['💠 Bitti piepst fröhlich: „Bip bip!“', '💠 Byton brummt zufrieden und wedelt mit dem Schwanz.', '💠 Gigaflux breitet stolz die Flügel aus! ✨'][pet.stage - 1], 2200); return; }
    const q = I.zones.find(x => x.id === n.zone); if (!q) return;
    if (n.k === 'hint') { say('🧩 ' + q.clue, 5200); return; }
    const s = S(); if (s.done[q.id]) { say('✅ ' + q.name + ': Prüfung bereits geschafft. Schau dir die Lichter noch einmal an!', 2800); return; }
    const atStep = s.step[q.id] || 0, wanted = q.order[atStep];
    if (n.i !== wanted) { s.step[q.id] = 0; persist(); say('🔄 Fast! Die Folge startet neu. Tipp: erst die Hinweis-Tafel lesen.', 3000); return; }
    s.step[q.id] = atStep + 1; persist(); say('💫 Schritt ' + s.step[q.id] + ' von 3 stimmt!', 1800);
    if (s.step[q.id] >= q.order.length) complete(q);
  };
  /* ---------- Laufzeit (nur in Inselnähe) ---------- */
  let live = null, ready = false;
  K.update = (dt, t) => {
    const px = P.veh ? P.veh.x : P.x, pz = P.veh ? P.veh.z : P.z, py = P.veh ? (P.veh.y || 0) : P.y, on = Math.hypot(px - I.x, pz - I.z) < I.R + 70;
    if (on !== live) { live = on; root.visible = on; }
    if (!on || !dt) return; t = t || 0;
    if (!ready) { ready = true; syncOrbs(); showStage(S().pet.stage | 0); }
    const s = S();
    for (const o of orbs) { if (!o.m.visible) continue; o.m.position.y = 1.2 + Math.sin(t * 2 + o.i) * .2; o.m.rotation.y = t * 1.2 + o.i;
      if (Math.hypot(px - o.x, pz - o.z) < 1.6 && Math.abs(py + .8 - o.m.position.y) < 2.6) { s.orbs[o.i] = 1; persist(); syncOrbs(); snd('star'); fx.burst(o.x, 1.2, o.z, 20, [0xffa31a, 0xffffff, 0xe8202a], 5, 1, 26, 3); const n = s.orbs.filter(Boolean).length; say('🟠 Sternkugel mit ' + (o.i + 1) + ' Stern' + (o.i ? 'en' : '') + ' gefunden! (' + n + ' von 7)' + (n === 7 ? ' Bring sie zum Altar im Ki-Garten!' : ''), 3000); } }
    for (let i = 0; i < 7; i++) if (altarOrbs[i].visible) altarOrbs[i].rotation.y = t + i;
    if (summon) stepSummon(dt);
    if (shot) stepShot(dt);
    if (respawn > 0) { respawn -= dt; if (respawn <= 0) for (const q of targets) { q.alive = true; q.m.visible = true; q.k = 0; } }
    for (const q of targets) if (q.alive) { q.k = Math.min(1, q.k + dt * 2); q.m.scale.setScalar(q.k); q.m.rotation.y = t * 1.5; q.m.position.y = 2.4 + Math.sin(t * 2.2 + q.x) * .15; }
    for (const f of folk) if (f.anim === 'kata' && Math.hypot(px - f.x, pz - f.z) < 40) { f.c.punch((t * 1.4) % 1); }
    for (const hq of holo) { hq.m.position.y = .4 + Math.sin(t * 1.4 + hq.ph) * .25; hq.m.rotation.z = Math.sin(t * .9 + hq.ph) * .05; }
    { const sp = prismM.userData.spin || 0; prismM.rotation.y += dt * (.6 + sp * 3); prismM.userData.spin = Math.max(0, sp - dt); prismM.position.y = 1.5 + Math.sin(t * 1.3) * .15; }
    /* Datenwürfel */
    const dm2 = _m, dqq = _q;
    for (let i = 0; i < NB; i++) { const b = bits[i]; if (!b.on) { b.t -= dt; if (b.t <= 0) b.on = true; }
      const k = b.on ? 1 : 0; dqq.setFromEuler(_e.set(t + b.ph, t * 1.3 + b.ph, 0)); dm2.compose(_v.set(b.x, 1.3 + Math.sin(t * 2.4 + b.ph) * .25, b.z), dqq, _s.set(k, k, k)); bitMesh.setMatrixAt(i, dm2);
      if (b.on && !P.veh && Math.hypot(P.x - b.x, P.z - b.z) < 1.3 && P.y < 2.5) { if (s.pet.stage) { b.on = false; b.t = 25; feed(b); } else if (t > bitHintT) { bitHintT = t + 8; say('💠 Ein Datenwürfel! Hol dir zuerst das Partner-Ei im Nest. 🥚', 2600); } } }
    bitMesh.instanceMatrix.needsUpdate = true;
    /* Ei wackelt, Partner folgt auf dem Archipel (sonst wartet er im Nest) */
    if (pet.stage === 0) { eggM.rotation.z = Math.sin(t * 3) * .12; }
    else if (pet.stage > 0) {
      const home = Math.hypot(px - I.x, pz - I.z) > I.R + 15 || P.veh, tx = home ? nest.x + 2.2 : px - Math.sin(P.h) * 2.2 + Math.cos(P.h) * 1.2, tz = home ? nest.z : pz - Math.cos(P.h) * 2.2 - Math.sin(P.h) * 1.2;
      const dx = tx - pet.x, dz = tz - pet.z, d = Math.hypot(dx, dz);
      if (d > 60) { pet.x = tx; pet.z = tz; } else if (d > .6) { const sp = Math.min(9, 1.4 + d * 2.2); pet.x += dx / d * sp * dt; pet.z += dz / d * sp * dt; pet.h += BI.angDiff(pet.h, Math.atan2(dx, dz)) * Math.min(1, dt * 8); }
      else pet.h += BI.angDiff(pet.h, Math.atan2(px - pet.x, pz - pet.z)) * Math.min(1, dt * 4);
      pet.hop = Math.max(0, pet.hop - dt); const bob = Math.abs(Math.sin(t * (d > .6 ? 9 : 3))) * (d > .6 ? .22 : .06) + (pet.hop > 0 ? Math.sin(pet.hop / .6 * Math.PI) * .9 : 0);
      pet.g.position.set(pet.x, bob + (pet.stage === 3 ? .4 + Math.sin(t * 2) * .2 : 0), pet.z); pet.g.rotation.y = pet.h;
      if (pet.evo > 0) { pet.evo -= dt; const k = 1 + Math.sin(pet.evo * 18) * .25; pet.g.rotation.y += t * 12; pet.g.scale.setScalar(k); if (pet.evo <= .7 && pet.stage !== pet.next) showStage(pet.next); if (pet.evo <= 0) pet.g.scale.setScalar(1); }
    }
  };
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), _s = new THREE.Vector3();
  K.log = () => { const s = S(), done = I.zones.filter(q => s.done[q.id]).length + (s.wish ? 1 : 0) + (s.welle ? 1 : 0) + (s.duel ? 1 : 0) + (s.cards.length >= BI.PRISMA_CARDS.length ? 1 : 0) + (s.pet.stage >= 3 ? 1 : 0);
    return { title: '🌀 Prisma-Archipel', count: done + ' von 8', rows: I.zones.map(q => ({ ok: !!s.done[q.id], icon: q.icon, text: q.name + ' – ' + (s.done[q.id] ? 'Rätsel gelöst' : 'Löse das Drei-Farben-Rätsel an den Licht-Pylonen'), dest: 'prisma' })).concat([
      { ok: !!s.wish, icon: '🐉', text: 'Sternkugeln – ' + (s.wish ? 'Lichtdrache gerufen' : s.orbs.filter(Boolean).length + ' von 7 gefunden, dann am Altar den Lichtdrachen rufen'), dest: 'prisma' },
      { ok: !!s.welle, icon: '🌀', text: 'Ki-Welle – ' + (s.welle ? 'alle Kristalle getroffen' : 'Triff im Turnier-Ring alle drei Kristalle'), dest: 'prisma' },
      { ok: !!s.duel, icon: '🃏', text: 'Runen-Duell – ' + (s.duel ? 'Kaia besiegt' : 'Gewinne ein Duell gegen Kaia im Stadion'), dest: 'prisma' },
      { ok: s.cards.length >= BI.PRISMA_CARDS.length, icon: '🎴', text: 'Runenkarten – ' + s.cards.length + ' von ' + BI.PRISMA_CARDS.length + ' gesammelt', dest: 'prisma' },
      { ok: s.pet.stage >= 3, icon: '💠', text: 'Digi-Partner – ' + (s.pet.stage ? STG[s.pet.stage].name + (s.pet.stage < 3 ? ': sammle Datenwürfel' : ' ist ausgewachsen') : 'Nimm das Partner-Ei im Datenhain'), dest: 'prisma' }]) }; };
  K.state = S; K.dbg = { orbs, targets, bits, pet, get summon() { return summon; }, fire, feed, pack, showStage }; return K;
};
