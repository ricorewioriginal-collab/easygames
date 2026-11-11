/* Städte mit Funktion: Kirche, Waffenladen & Schmiede, Magieladen, Tränke & Extras, Wirtshaus, Wohnhäuser und das begehbare Golden Star Casino.
   Jedes Gebäude hat innen eine Person oder ein Gerät zum Ansprechen (Aktionstaste) – gleiche Bedienung auf Handy, PC, TV und Controller.
   Häuser werden in house() (main.js) gebaut; build() richtet sie ein, flush() setzt danach Personen und Geräte in die Welt. */
export function createTown(C) {
  const { T, mk, G, M, glow, scene } = C;
  const S = () => C.S();
  const KIND = {
    smith: { em: '⚔️', n: 'Waffenladen & Schmiede', role: 'Schmiedin', look: { cloth: 0x8a4a3a, cloth2: 0x3a2a22, apron: 0x4a3a30, hair: 0xc8642a } },
    magic: { em: '✨', n: 'Magieladen', role: 'Magierin', look: { cloth: 0x6a4ac8, cloth2: 0x2a2060, hair: 0xe8e0ff, hood: 1 } },
    potions: { em: '🧪', n: 'Tränke & Extras', role: 'Krämer', look: { cloth: 0x3a9a6a, cloth2: 0x2a4a3a, apron: 0xf0f0e0, hair: 0x5a3a26 } },
    church: { em: '⛪', n: 'Kirche des Sternenlichts', role: 'Priesterin', look: { cloth: 0xf4f0e6, cloth2: 0xd8b04a, hair: 0x8a6a4a } },
    tavern: { em: '🍺', n: 'Wirtshaus', role: 'Wirt', look: { cloth: 0xb87a3a, cloth2: 0x4a3020, apron: 0xf0e8d8, hair: 0x3a2a20, wide: 1.15 } },
    casino: { em: '🎰', n: 'Golden Star Casino' }
  };
  const NAMES = {
    smith: ['Runa', 'Brenna', 'Halda', 'Isolde', 'Marga', 'Torid', 'Edda', 'Gesa', 'Freya', 'Wilma', 'Asta'],
    magic: ['Selene', 'Mirabel', 'Ylva', 'Noctua', 'Aurelia', 'Liora', 'Zira', 'Elune', 'Vesper', 'Sybil', 'Astra'],
    potions: ['Tobi', 'Hauke', 'Lenn', 'Oskar', 'Piet', 'Malte', 'Janno', 'Kuno', 'Emil', 'Rasmus', 'Till'],
    church: ['Elin', 'Thea', 'Clara', 'Maren', 'Alva', 'Ida', 'Greta', 'Nora', 'Luise', 'Johanna', 'Sophia'],
    tavern: ['Bertram', 'Gunnar', 'Henrik', 'Otto', 'Kaspar', 'Lorenz', 'Arno', 'Fiete', 'Veit', 'Hinnerk', 'Jost']
  };
  const TIPS = [
    'In der Kirche heilt dich der Segen und weckt gefallene Gefährten, ganz ohne Splitter.',
    'Die Schmiedin verstärkt Ausrüstung mit Fell, Rissstaub und Kernsplittern. Gegner lassen das Material fallen.',
    'Ein Phönix-Trank holt gefallene Gefährten mitten im Kampf zurück. Der Krämer hat welche.',
    'Wer bei der Magierin Zauberkunde lernt, trifft mit Funkenwirbel und Lichtstoß deutlich härter.',
    'Jeder Gegner hat eine Schwäche. Das Bestiarium im Menü merkt sie sich nach dem ersten Sieg.',
    'Rote Kreise am Boden kündigen Angriffe an. Ausweichen kostet nichts.',
    'Ein Sternensegen aus der Kirche bringt zehn Minuten lang mehr Erfahrung.',
    'In Valdoria steht das Golden Star Casino. Gespielt wird dort nur um Splitter.'
  ];
  const LORE = [
    'Tagebuch: „Seit der Riss am Himmel steht, schließen wir abends die Läden. Aber der Fuchs mit dem blauen Schal macht uns Mut.“',
    'Kochbuch: „Kräutersuppe: zwei Kräuter, eine Prise Geduld. Macht müde Wanderer wieder munter.“',
    'Alte Chronik: „Elf Welten, ein Kern. Wer zuhört, hört sie alle zugleich klingen.“',
    'Kinderbuch: „Felli und der Kristallapfel“ – jemand hat mit Buntstift Sterne an den Rand gemalt.',
    'Schmiedekunde: „Rissstaub schärft die Klinge, Kernsplitter härten sie. Fell hält den Griff warm.“',
    'Reiseführer: „Jede Welt hat ihr Tor. Wer es einmal durchschritten hat, findet immer zurück.“',
    'Notizzettel: „Truhe unter dem Fenster nicht vergessen!“',
    'Sternenkunde: „Der hellste Stern steht über der Kirche. Dort beginnt und endet jede Reise.“'
  ];
  const tex = (w, h, draw) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h); const t = new T.CanvasTexture(cv); if (T.SRGBColorSpace) t.colorSpace = T.SRGBColorSpace; return t; };
  const TX = {};   // Texturen bleiben über Weltwechsel erhalten
  const emo = (s, bg) => TX['e' + s + bg] || (TX['e' + s + bg] = tex(128, 128, g => { if (bg) { g.fillStyle = bg; g.beginPath(); g.arc(64, 64, 62, 0, 7); g.fill(); g.lineWidth = 5; g.strokeStyle = '#ffd86a'; g.stroke(); } g.font = '78px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s, 64, 70); }));
  const flat = (map, w, h) => new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map, transparent: true }));
  const PEND = [];

  /* ---------- Einrichtung (lokale Koordinaten des Hauses: Tür bei +z) ---------- */
  function build(kind, F) {
    const { g, roofGroup, box, table, stool, barrel, lamp, rug, cup, solid, W2, w, d, h, t, Y, x, y, z, ry, H0 } = F;
    const K = KIND[kind], wood = M(0x6a4a30, { r: .85 }), wood2 = M(0x4a3020, { r: .9 }), gold = M(0xe8c060, { r: .3, m: .8, e: 0xe8c060, ei: .5 });
    const P = { kind, W2, ry, x, y, z, w, d, h, t, keeper: null, extra: null };
    const counter = (lx, lz, cw, cd) => { box(wood2, lx, 0, lz, cw, 1.0, cd); box(M(0x8a6a44), lx, 1.0, lz, cw + .12, .08, cd + .12); solid(lx, lz, cw / 2, cd / 2); };
    const bottle = (lx, ly, lz, col) => g.add(mk(G.cyl0, M(col, { e: col, ei: 1.1, r: .2 }), lx, Y + ly, lz, .07, .22, .07, false));
    const COLS = [0xff5a6a, 0x5ab4ff, 0x6aff9a, 0xffd45a, 0xc88aff];
    /* Sockelwand innen: bleibt stehen, wenn die Außenwände drinnen durchsichtig werden – der Raum wirkt geschlossen */
    const dado = (col, trim, hh) => { const m = M(col, { r: .8 }), tm = M(trim, { r: .4, m: .5, e: trim, ei: .25 }), dw = .75; const seg = (lx, lz, sx, sz) => { g.add(mk(G.box, m, lx, Y + hh / 2, lz, sx, hh, sz, false)); g.add(mk(G.box, tm, lx, Y + hh + .04, lz, sx + .04, .08, sz + .04, false)); };
      seg(0, -d / 2 + t + .06, w - 2 * t, .12); for (const sd of [-1, 1]) { seg(sd * (w / 2 - t - .06), 0, .12, d - 2 * t); const hx = (w / 2 - t - dw - .15) / 2; seg(sd * (dw + .15 + hx), d / 2 - t - .06, hx * 2, .12); } };
    if (kind === 'smith') P.keeper = [w / 2 - t - 2.2, -1.5, 0];
    else if (kind === 'tavern') P.keeper = [.9, -d / 2 + t + 1.8, 0];
    else if (kind === 'home') P.extra = { book: [w / 2 - t - 1.4, -d / 2 + t + 1.0] };
    else if (kind === 'magic') {
      cup(-w / 2 + t + 1.2, -d / 2 + t + .3, 1.6); cup(w / 2 - t - 1.2, -d / 2 + t + .3, 1.6);
      counter(0, -d / 2 + t + 1.5, 2.6, .7); for (let k = 0; k < 5; k++) bottle(-1 + k * .5, 1.2, -d / 2 + t + 1.5, COLS[k]);
      g.add(mk(G.cyl, wood2, -w / 2 + t + 1.2, Y + .4, -.3, .5, .8, .5)); solid(-w / 2 + t + 1.2, -.3, .5, .5);
      g.add(mk(G.sph, M(0x9a7aff, { e: 0x8a5aff, ei: 2, r: .1 }), -w / 2 + t + 1.2, Y + 1.15, -.3, .32, .32, .32, false)); g.add(glow(0x9a6aff, 3.4, -w / 2 + t + 1.2, Y + 1.2, -.3, .8));
      for (const [lx, lz] of [[w / 2 - t - .7, 1.2], [w / 2 - t - .7, .2]]) { g.add(mk(G.oct, M(0x6ae8ff, { e: 0x3ad0ff, ei: 1.6, r: .2 }), lx, Y + .5, lz, .25, .5, .25, false)); g.add(glow(0x4ad0ff, 1.8, lx, Y + .6, lz, .6)); }
      rug(.3, .9, 0x4a2a8a); lamp(0, h - .3, 0, 3); P.keeper = [0, -d / 2 + t + .75, 0];
    } else if (kind === 'potions') {
      counter(-.4, -d / 2 + t + 1.5, w - 3.6, .7); for (let k = 0; k < 7; k++) bottle(-.4 - (w - 4.2) / 2 + k * (w - 4.2) / 6, 1.2, -d / 2 + t + 1.5, COLS[k % 5]);
      box(wood2, 0, 1.5, -d / 2 + t + .2, w - 1.6, .08, .35); box(wood2, 0, 2.1, -d / 2 + t + .2, w - 1.6, .08, .35);
      for (let k = 0; k < 9; k++) { bottle(-(w - 2.2) / 2 + k * (w - 2.2) / 8, 1.7, -d / 2 + t + .2, COLS[(k + 2) % 5]); bottle(-(w - 2.2) / 2 + k * (w - 2.2) / 8, 2.3, -d / 2 + t + .2, COLS[(k * 2) % 5]); }
      barrel(w / 2 - t - .6, -d / 2 + t + .6); barrel(w / 2 - t - .6, .6); box(wood, -w / 2 + t + .6, 0, .9, .8, .7, .8); solid(-w / 2 + t + .6, .9, .4, .4); box(wood, -w / 2 + t + .6, .7, .9, .6, .5, .6);
      for (let k = 0; k < 4; k++) g.add(mk(G.cone0, M(0x4aa85a, { r: 1 }), -1.5 + k, h - .35, .4, .14, .5, .14, false));
      rug(0, 1.0, 0x2f6a4a); lamp(0, h - .3, .2, 3); P.keeper = [-.4, -d / 2 + t + .75, 0];
    } else if (kind === 'church') {
      const stone = M(0xc8c4cc, { r: .9 }), red = M(0x9a2a3a, { r: 1 }); dado(0xd8d2c8, 0xe8c060, 1.5);
      g.add(mk(G.box, red, 0, Y + .02, .4, 1.5, .04, d - 2.4, false));
      for (let lz = -d / 2 + 4.6; lz < d / 2 - 1.6; lz += 1.5) for (const sd of [-1, 1]) { const lx = sd * (w / 4 + .35), bw = w / 2 - 1.6; box(wood, lx, .35, lz, bw, .1, .5); box(wood2, lx, 0, lz, bw, .35, .12); box(wood, lx, .45, lz + .25, bw, .55, .08); solid(lx, lz, bw / 2, .3); }
      const az = -d / 2 + t + 1.1; box(stone, 0, 0, az, 2.4, 1.0, .9); box(M(0xf0e8d0, { r: .9 }), 0, 1.0, az, 2.6, .06, 1.05); box(gold, 0, 1.06, az, .5, .5, .1); solid(0, az, 1.2, .5);
      for (const sd of [-1, 1]) { g.add(mk(G.cyl0, gold, sd * 1.7, Y + .7, az, .07, 1.4, .07, false)); g.add(mk(G.sph0, M(0xffe0a0, { e: 0xffc060, ei: 2.4 }), sd * 1.7, Y + 1.5, az, .1, .16, .1, false)); g.add(glow(0xffc060, 2.2, sd * 1.7, Y + 1.5, az, .8)); solid(sd * 1.7, az, .15, .15); }
      const GL = [0x5a8aff, 0xff5a7a, 0xffd45a, 0x6aff9a, 0xc88aff];
      for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) g.add(mk(G.box, M(GL[(i + j * 2) % 5], { e: GL[(i + j * 2) % 5], ei: .55, r: .3 }), (i - 1) * .62, Y + 2.2 + j * .62, -d / 2 + t + .04, .56, .56, .05, false));
      g.add(mk(G.oct, gold, 0, Y + 4.95, -d / 2 + t + .12, .4, .4, .08, false)); g.add(glow(0x9ab8ff, 5, 0, Y + 3.2, -d / 2 + t + .5, .22));
      box(wood2, 2.0, 0, az + 1.3, .5, 1.1, .4); box(wood, 2.0, 1.1, az + 1.3, .7, .06, .5); solid(2.0, az + 1.3, .3, .25);
      for (const sd of [-1, 1]) for (const lz of [-1, 2.5]) lamp(sd * (w / 2 - t - .5), h - 1.6, lz, 1.5);
      /* außen: Satteldach statt Kegeldach, Glockenturm über dem Eingang */
      roofGroup.children[0].visible = false;
      const rm = M(F.roof, { r: .7, e: 0x14142a, ei: 1 }), rise = h * .5, sl = Math.hypot(w / 2 + .4, rise), an = Math.atan2(rise, w / 2 + .4);
      for (const sd of [-1, 1]) { const m = mk(G.box, rm, sd * (w / 4 + .1), h + .25 + rise / 2, 0, sl, .2, d + .7); m.rotation.z = -sd * an; roofGroup.add(m); }
      for (const sz of [-1, 1]) { const m = mk(G.cone, F.wm, 0, h + .2 + rise / 2, sz * (d / 2 - .21), w / 2, rise, .19); roofGroup.add(m); }
      const tz = d / 2 - 1.5, th = 4.2, ty = h + .3;
      roofGroup.add(mk(G.box, F.wm, 0, ty + th / 2, tz, 2.7, th, 2.7));
      for (const a of [0, 1, 2, 3]) { const m = mk(G.box, M(0x2a2030), Math.sin(a * 1.5708) * 1.36, ty + th - 1.1, tz + Math.cos(a * 1.5708) * 1.36, a % 2 ? .05 : 1.1, 1.4, a % 2 ? 1.1 : .05, false); roofGroup.add(m); }
      roofGroup.add(mk(G.sph0, gold, 0, ty + th - 1.0, tz, .45, .5, .45, false));
      const sp = mk(G.cone, rm, 0, ty + th + 1.5, tz, 2.0, 3.0, 2.0); sp.rotation.y = Math.PI / 4; roofGroup.add(sp);
      roofGroup.add(mk(G.oct, gold, 0, ty + th + 3.3, tz, .32, .5, .32, false));
      { const rw = mk(G.cyl, M(0x7ab0ff, { e: 0x5a90ff, ei: 1.4 }), 0, h - .5, d / 2 + .06, .7, .08, .7, false); rw.rotation.x = Math.PI / 2; roofGroup.add(rw); }
      P.keeper = [0, az + 1.5, 0];
    } else if (kind === 'casino') {
      dado(0x2a1440, 0xe8c060, 1.6); g.add(mk(G.box, M(0x1a1030, { r: .6, m: .2 }), 0, Y + .01, 0, w - .9, .03, d - .9, false));
      g.add(mk(G.box, M(0x8a1a3a, { r: 1 }), 0, Y + .02, 0, w - 1.2, .04, d - 1.2, false)); g.add(mk(G.box, M(0xd8a83a, { r: .6, m: .4 }), 0, Y + .03, 0, 2.2, .04, d - 1.2, false));
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const lx = sx * (w / 2 - t - .5), lz = sz * (d / 2 - t - .5); g.add(mk(G.cyl, gold, lx, Y + h / 2, lz, .22, h, .22)); solid(lx, lz, .25, .25); }
      for (const [c, yy] of [[0xff4ad0, 1.85], [0x4ad8ff, 2.05]]) { g.add(mk(G.box, M(c, { e: c, ei: 1.8 }), 0, Y + yy, -d / 2 + t + .14, w - 1.4, .07, .04, false)); for (const sd of [-1, 1]) g.add(mk(G.box, M(c, { e: c, ei: 1.8 }), sd * (w / 2 - t - .14), Y + yy, 0, .04, .07, d - 1.4, false)); }
      /* Bar hinten rechts */
      const bx = w / 2 - t - 2.2, bz = -d / 2 + t + .9; counter(bx, bz, 3.4, .7); for (let k = 0; k < 6; k++) bottle(bx - 1.3 + k * .52, 1.2, bz, COLS[k % 5]); for (let k = 0; k < 3; k++) stool(bx - 1 + k, bz + .9);
      /* drei Kristallslots an der linken Wand, Blick in den Raum (+x) */
      const sx0 = -w / 2 + t + .55, SZ = [-2.9, -1.2, .5], body = M(0x3a1a6a, { r: .5, m: .3 }), dark = M(0x120a20, { r: .9 });
      for (const lz of SZ) { box(body, sx0, 0, lz, .9, 2.0, 1.1); box(dark, sx0 + .36, .95, lz, .22, .62, .92); box(M(0xffd040, { e: 0xffb020, ei: 1.6 }), sx0, 2.0, lz, .9, .25, 1.1); box(gold, sx0 + .5, .55, lz, .3, .08, .9);
        g.add(mk(G.cyl0, gold, sx0 + .2, Y + 1.5, lz + .62, .04, .7, .04, false)); g.add(mk(G.sph0, M(0xff3a4a, { e: 0xff2030, ei: 1.2 }), sx0 + .2, Y + 1.9, lz + .62, .1, .1, .1, false)); g.add(glow(0xffc040, 1.3, sx0 + .3, Y + 2.3, lz, .3)); solid(sx0, lz, .5, .6); }
      /* Sternenrad an der Rückwand */
      box(dark, 0, .5, -d / 2 + t + .08, 3.7, 3.7, .12); for (let a = 0; a < 12; a++) g.add(mk(G.sph0, M(0xffe070, { e: 0xffc030, ei: 2 }), Math.cos(a * .5236) * 1.78, Y + 2.35 + Math.sin(a * .5236) * 1.78, -d / 2 + t + .2, .07, .07, .07, false));
      const ptr = mk(G.cone0, M(0xff4a5a, { e: 0xff2a3a, ei: 1.4 }), 0, Y + 4.05, -d / 2 + t + .3, .16, .4, .1, false); ptr.rotation.z = Math.PI; g.add(ptr); solid(0, -d / 2 + t + .2, 1.9, .25);
      /* Kartentisch rechts */
      const tx = w / 2 - t - 2.4, tz2 = 1.0; box(wood2, tx, 0, tz2, 2.8, .8, 1.5); box(M(0x1a7a4a, { r: 1 }), tx, .8, tz2, 2.7, .06, 1.4); solid(tx, tz2, 1.4, .75);
      lamp(0, h - .5, 0, 2.6); lamp(-3.4, h - .5, 2, 1.8); lamp(3.4, h - .5, -2, 1.8); lamp(tx, h - 1.2, tz2, 1.6);
      roofGroup.add(mk(G.box, M(0xffd040, { e: 0xffb020, ei: 1.2 }), 0, h + .7, d / 2 + .12, 6.4, 1.0, .2, false)); roofGroup.add(mk(G.oct, M(0xffe070, { e: 0xffc030, ei: 2 }), 0, h + 2.0, d / 2 + .1, .8, 1.0, .8, false)); roofGroup.add(glow(0xffc040, 9, 0, h + 1.6, d / 2 + .6, .7));
      /* Vordach mit Lichterkette, goldene Säulen und roter Teppich vor dem Eingang */
      { const gd = M(0xe8c060, { r: .3, m: .8, e: 0xe8c060, ei: .5 }), fz = d / 2 + 1.0; roofGroup.add(mk(G.box, M(0x3a1a6a, { r: .5 }), 0, 3.05, fz - .2, 5.2, .5, 1.9)); roofGroup.add(mk(G.box, gd, 0, 2.78, fz - .2, 5.4, .1, 2.1, false));
        for (let k = 0; k < 9; k++) roofGroup.add(mk(G.sph0, M(k % 2 ? 0xff4ad0 : 0xffe070, { e: k % 2 ? 0xff4ad0 : 0xffc030, ei: 2 }), -2.4 + k * .6, 3.05, fz + .78, .09, .09, .09, false));
        for (const sd of [-1, 1]) { roofGroup.add(mk(G.cyl, gd, sd * 2.3, 1.5, fz + .5, .16, 2.6, .16)); roofGroup.add(mk(G.cyl, gd, sd * 2.3, .22, fz + .5, .26, .16, .26, false)); }
        roofGroup.add(mk(G.box, M(0x8a1a3a, { r: 1 }), 0, .21, fz + .2, 2.0, .05, 3.2, false)); }
      P.extra = { casino: { sx0, SZ, wheel: [0, 2.35, -d / 2 + t + .22], table: [tx, tz2], Y } };
    }
    /* Ladenschild über der Tür (wird wie die Fenster ausgeblendet, sobald man drinnen ist) */
    if (K) { const sg = new T.Group(); sg.position.set(x, y - .2, z); sg.rotation.y = ry; const pl = flat(emo(K.em, '#2a2040'), 1.15, 1.15); pl.position.set(kind === 'casino' ? 4.4 : 0, kind === 'church' ? 3.4 : Math.min(h - .1, 3.3), d / 2 + .12); sg.add(pl); scene.add(sg); H0.wins.push(sg); }
    PEND.push(P);
  }

  /* ---------- Personen und Geräte setzen (nach dem Hausbau der Welt) ---------- */
  let seq = 0;
  function flush(n) {
    for (const P of PEND.splice(0)) {
      const K = KIND[P.kind], i = seq++;
      if (P.keeper && K.role) {
        const q = P.W2(P.keeper[0], P.keeper[1]), nm = K.role + ' ' + NAMES[P.kind][(n - 1) % 11];
        const o = C.addNpc('tw_' + P.kind, nm, q[0], q[1], C.makeVillager(K.look), () => TALK[P.kind](nm, n), P.ry + P.keeper[2]); o.noRoute = 1;
      }
      if (P.extra && P.extra.book) { const q = P.W2(...P.extra.book), txt = LORE[(n * 3 + i) % LORE.length]; C.INT().push({ x: q[0], z: q[1], name: 'Bücherregal', pr: 'Lesen', rad: 1.9, vis: () => true, talk() { C.say([['Buch', txt]]); } }); }
      if (P.extra && P.extra.casino) casino(P, n);
    }
  }
  const heal = () => { const s = S(); s.hp = C.maxHp(); s.mp = C.maxMp(); for (const a of C.CMP()) { C.cmpRevive(a, 1); a.hp = C.cmax(a.id); } C.sfx('heal'); };
  const fee = n => 10 + 5 * Math.min(10, n);
  const TALK = {
    smith: nm => C.say([[nm, 'Klingen, Rüstungen und ein heißer Amboss. Bring Material mit, dann mache ich mehr aus deiner Ausrüstung.']], null, [{ t: 'Waffen & Rüstung', fn: () => C.openShop(nm, 'smith') }, { t: 'Schmieden', fn: () => C.openShop(nm, 'forge') }, { t: 'Später', fn() { } }]),
    magic: nm => C.say([[nm, 'Ringe, Amulette, Äther – und Zauberkunde für alle, die zuhören können.']], null, [{ t: 'Einkaufen', fn: () => C.openShop(nm, 'magic') }, { t: 'Später', fn() { } }]),
    potions: nm => C.say([[nm, 'Tränke gegen jeden Kratzer und allerlei Nützliches für unterwegs!']], null, [{ t: 'Einkaufen', fn: () => C.openShop(nm, 'potions') }, { t: 'Später', fn() { } }]),
    church(nm, n) {
      const s = S(), c = 60 + 20 * Math.min(10, n), on = (s.fl.bless || 0) > (s.t || 0);
      C.say([[nm, 'Das Sternenlicht sei mit dir, Zotik. Hier findest du Ruhe, Heilung und einen sicheren Ort für deine Reise.']], null, [
        { t: '✨ Segen empfangen', fn() { heal(); C.toast('✨ Gesegnet: alle geheilt, Gefährten wieder auf den Beinen'); C.saveGame(true); } },
        { t: on ? '⭐ Sternensegen wirkt noch' : `⭐ Spenden (${c} 💎)`, fn() { if (on) return C.toast('⭐ Der Sternensegen wirkt noch ' + Math.ceil((s.fl.bless - s.t) / 60) + ' Min.'); if (s.shards < c) return C.toast('Nicht genug Splitter'); s.shards -= c; s.fl.bless = (s.t || 0) + 600; C.sfx('level'); C.toast('⭐ Sternensegen: 10 Minuten lang +25 % Erfahrung'); C.saveGame(true); } },
        { t: '💾 Speichern', fn() { C.saveGame(true); C.sfx('quest'); C.toast('💾 Spielstand gespeichert'); } },
        { t: 'Gehen', fn() { } }]);
    },
    tavern(nm, n) {
      const s = S(), c = fee(n);
      C.say([[nm, 'Setz dich, Fuchs! Ein Bett, eine warme Suppe und die neuesten Gerüchte – alles da.']], null, [
        { t: `🛏️ Rasten (${c} 💎)`, fn() { if (s.shards < c) return C.toast('Nicht genug Splitter'); s.shards -= c; heal(); C.toast('🛏️ Ausgeruht: alle geheilt'); C.saveGame(true); } },
        { t: '🗣️ Gerücht hören', fn() { C.say([[nm, TIPS[(Math.random() * TIPS.length) | 0]]]); } },
        { t: 'Später', fn() { } }]);
    }
  };

  /* ---------- Läden (Menüfenster wie beim fahrenden Händler, aber je Laden eigenes Sortiment) ---------- */
  const SHOPT = { smith: '⚔️ Waffenladen', forge: '🔨 Schmiede', magic: '✨ Magieladen', potions: '🧪 Tränke & Extras' };
  const upCost = (d, L) => ({ sh: 100 * (L + 1) * Math.max(1, Math.ceil((d.tier || 10) / 2)), fell: 2 + 2 * L, staub: 2 + L, kern: L });
  function shop(c, t, kind, nm, rer) {
    const s = S(), GEAR = C.GEAR(), tier = C.tier(), m = s.mat || (s.mat = {}), rows = [], it = s.items; s.up = s.up || {};
    t.innerHTML = `<b style="color:var(--gold)">${SHOPT[kind]} · ${nm}</b>`;
    let h = `<div class="row"><span>Deine Splitter</span><span>💎 ${s.shards}</span></div>`;
    const row = (label, price, fn, off, btn) => { rows.push(() => { if (price) { if (s.shards < price) return; s.shards -= price; } fn(); C.sfx('pick'); }); h += `<div class="row"><span>${label}</span><span><button class="cpb" data-tw="${rows.length - 1}" ${off || s.shards < price ? 'disabled' : ''}>${btn || price + ' 💎'}</button></span></div>`; };
    const gear = sl => { for (const [id, d] of Object.entries(GEAR)) { if (!sl.includes(d.s) || d.rare || !d.p || (d.tier || 1) > tier) continue; row(`${d.s === 'w' ? '⚔️' : d.s === 'a' ? '🛡️' : '💍'} ${d.n}<br><small style="color:var(--dim)">${C.statLine(d)}${s.inv[id] ? ' · hast du' : ''}</small>`, d.p, () => C.giveGear(id)); } };
    const dim = x => `<br><small style="color:var(--dim)">${x}</small>`;
    if (kind === 'smith') { h += '<h3>Waffen</h3>'; gear('w'); h += '<h3>Rüstungen</h3>'; gear('a'); }
    else if (kind === 'forge') {
      h += C.XT().forgeRows(true) + '<h3>🛠️ Ausrüstung verstärken</h3>'; let any = 0;
      for (const id of Object.keys(s.inv)) { const d = GEAR[id]; if (!d || !s.inv[id] || !(d.atk || d.def || d.hp)) continue; any = 1; const L = s.up[id] || 0;
        if (L >= 3) { h += `<div class="row"><span>${d.n} +3</span><span>voll verstärkt</span></div>`; continue; } const k = upCost(d, L);
        row(`${d.n}${L ? ' +' + L : ''} → +${L + 1}${dim(`+15 % auf alle Werte · 🧶 ${k.fell} · ✨ ${k.staub}${k.kern ? ' · 💠 ' + k.kern : ''}`)}`, k.sh, () => { m.fell -= k.fell; m.staub -= k.staub; m.kern = (m.kern || 0) - k.kern; s.up[id] = L + 1; C.toast(`🔨 ${d.n} +${L + 1}`); }, (m.fell || 0) < k.fell || (m.staub || 0) < k.staub || (m.kern || 0) < k.kern); }
      if (!any) h += '<p style="color:var(--dim);font-size:13px">Du hast noch keine Ausrüstung zum Verstärken. Waffen und Rüstungen gibt es nebenan im Regal.</p>';
    } else if (kind === 'magic') {
      const L = s.mag || 0, sc = 150 * (L + 1), st = 2 + L, kn = L >= 2 ? L - 1 : 0;
      h += '<h3>Zauberkunde</h3>';
      if (L >= 5) h += '<div class="row"><span>📖 Zauberkunde 5/5</span><span>gemeistert</span></div>';
      else row(`📖 Zauberkunde ${L}/5 → ${L + 1}${dim(`Funkenwirbel und Lichtstoß +10 % Schaden · ✨ ${st}${kn ? ' · 💠 ' + kn : ''}`)}`, sc, () => { m.staub -= st; m.kern = (m.kern || 0) - kn; s.mag = L + 1; C.toast('📖 Zauberkunde Stufe ' + s.mag); }, (m.staub || 0) < st || (m.kern || 0) < kn);
      h += '<h3>Schmuck</h3>'; gear('c'); h += '<h3>Magische Waren</h3>';
      row(`🔷 Äther${dim('füllt 60 % Mana · du hast ' + (it.ether || 0))}`, 40, () => { it.ether = (it.ether || 0) + 1; });
      h += C.XT().brewRows(true, 'ether');
    } else {
      h += '<h3>Tränke</h3>';
      row(`🧪 Heiltrank${dim('+60 % Leben · du hast ' + s.potions)}`, 20, () => { s.potions++; });
      row('🧪🧪🧪 3 Heiltränke', 55, () => { s.potions += 3; });
      row(`🔥 Phönix-Trank${dim('weckt alle gefallenen Gefährten, ohne Mana · du hast ' + (it.phoenix || 0))}`, 150, () => { it.phoenix = (it.phoenix || 0) + 1; }, (it.phoenix || 0) >= 9);
      h += C.XT().brewRows(true, 'potion') + '<h3>Extras</h3>';
      row(`🍐 Kristallfrucht${dim('Futter für Felli · du hast ' + (it.fruit || 0))}`, 90, () => { it.fruit = (it.fruit || 0) + 1; });
      row(`🌿 Kräuterbündel${dim('3 Kräuter zum Kochen und Brauen · du hast ' + s.herbs)}`, 30, () => { s.herbs += 3; });
    }
    c.innerHTML = h;
    c.querySelectorAll('[data-tw]').forEach(b => b.onclick = () => { rows[+b.dataset.tw](); C.saveGame(true); rer(); });
    C.XT().bind(c, rer);
  }

  /* ---------- Golden Star Casino: begehbar, alle Spiele als 3D-Geräte im Raum (nur Spiel-Splitter) ---------- */
  const CAS = { SYM: ['🌙', '🍃', '💎', '🔥', '⭐'], W: [30, 30, 20, 15, 5], PAY: [5, 5, 12, 8, 25], BETS: [10, 50, 100], SEG: [0, 1, 0, 2, 0, 0, 1, 0, 2, 0, 0, 5] };
  const casSym = () => { let r = Math.random() * 100; for (let i = 0; i < 5; i++) { r -= CAS.W[i]; if (r <= 0) return i; } return 0; };
  const slotPay = (r, bet) => r[0] === r[1] && r[1] === r[2] ? bet * CAS.PAY[r[0]] : (r[0] === r[1] || r[1] === r[2] || r[0] === r[2]) ? bet : 0;
  const hiloMul = p => Math.max(1.05, Math.round(9.2 / p) / 10);
  const cardTex = v => TX['c' + v] || (TX['c' + v] = tex(128, 184, g => {
    if (!v) { g.fillStyle = '#3a1a6a'; g.fillRect(0, 0, 128, 184); g.strokeStyle = '#ffd86a'; g.lineWidth = 6; g.strokeRect(8, 8, 112, 168); g.font = '70px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('⭐', 64, 96); return; }
    g.fillStyle = '#fbf6ea'; g.fillRect(0, 0, 128, 184); g.strokeStyle = '#3a1a6a'; g.lineWidth = 5; g.strokeRect(5, 5, 118, 174); g.fillStyle = v % 2 ? '#c0283a' : '#22264a'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold 84px sans-serif'; g.fillText(String(v), 64, 84); g.font = '34px serif'; g.fillText(v % 2 ? '🌙' : '⭐', 64, 150);
  }));
  const wheelTex = () => TX.wheel || (TX.wheel = tex(512, 512, g => {
    const COL = { 0: '#2a2040', 1: '#3a8ad0', 2: '#3ab06a', 5: '#e8b020' };
    CAS.SEG.forEach((v, i) => { const a0 = i * Math.PI / 6, a1 = a0 + Math.PI / 6; g.beginPath(); g.moveTo(256, 256); g.arc(256, 256, 250, a0, a1); g.closePath(); g.fillStyle = COL[v]; g.fill(); g.strokeStyle = '#ffd86a'; g.lineWidth = 4; g.stroke();
      g.save(); g.translate(256, 256); g.rotate(a0 + Math.PI / 12); g.translate(178, 0); g.rotate(Math.PI / 2); g.fillStyle = v ? '#fff' : '#8a80a8'; g.font = 'bold 52px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(v ? '×' + v : '–', 0, 0); g.restore(); });
    g.beginPath(); g.arc(256, 256, 46, 0, 7); g.fillStyle = '#ffd86a'; g.fill(); g.font = '50px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('⭐', 256, 260);
  }));
  const ease = k => 1 - Math.pow(1 - Math.min(1, k), 3);
  let CS = null;   // Zustand des gebauten Casinos (für Tests über die Debug-Schnittstelle)
  function casino(P, n) {
    const X = P.extra.casino, s0 = S(), dyn = new T.Group(); dyn.position.set(P.x, P.y - .2, P.z); dyn.rotation.y = P.ry; scene.add(dyn);
    const off = () => !!(S().cas && S().cas.off), INT = C.INT(), wpos = (lx, ly, lz) => { const q = P.W2(lx, lz); return [q[0], P.y + ly, q[1]]; };
    const st = { busy: false, last: null, slots: [], wheel: null, hilo: null, P }; CS = st;
    const closed = () => C.say([['Golden Star Casino', 'Die Geräte sind ausgeschaltet. Sprich mit Stella am Eingang, wenn du spielen möchtest.']]);
    const broke = () => C.say([['Zotik', 'Dafür reichen meine Splitter nicht.']]);
    const done = (bet, win, x, lz, txt) => { const s = S(); s.shards += win; s.cas.n++; s.cas.best = Math.max(s.cas.best, win); st.busy = false; st.last = { bet, win }; C.sfx(win > bet ? 'level' : win ? 'pick' : 'hit'); C.toast(win > 0 ? `🎰 ${txt}: +${win} 💎` : `🎰 ${txt}: leider nichts`); if (win > bet) { const q = wpos(x, 1.6, lz); C.emit(q[0], q[1], q[2], 0xffd45a, 30, 5, .8, .7, 2); } C.saveGame(true); };
    const bets = (who, txt, go) => { if (off()) return closed(); if (st.busy) return; const s = S(), o = CAS.BETS.filter(b => s.shards >= b).map(b => ({ t: b + ' 💎 setzen', fn: () => { if (st.busy || S().shards < b) return; S().shards -= b; st.busy = true; go(b); } })); if (!o.length) return broke(); o.push({ t: 'Aufhören', fn() { } }); C.say([[who, txt + ' Du hast ' + s.shards + ' 💎.']], null, o); };
    /* Kristallslots: drei echte Walzen je Gerät */
    X.SZ.forEach((lz, mi) => {
      const reels = []; for (let r = 0; r < 3; r++) { const rg = new T.Group(); rg.position.set(X.sx0 + .3, X.Y + 1.26, lz + (r - 1) * .29); { const co = mk(G.cyl0, M(0xf4f0e6, { r: .6 }), 0, 0, 0, .25, .25, .25, false); co.rotation.x = Math.PI / 2; rg.add(co); }
        for (let k = 0; k < 5; k++) { const a = new T.Group(); a.rotation.z = k * 1.2566; const p = flat(emo(CAS.SYM[k], ''), .27, .27); p.position.x = .262; p.rotation.y = Math.PI / 2; a.add(p); rg.add(a); }
        const cur = (mi + r * 2) % 5; rg.rotation.z = -cur * 1.2566; dyn.add(rg); reels.push({ rg, from: rg.rotation.z, to: rg.rotation.z, t0: 0, dur: 0 }); }
      const m = { reels, spin: null }; st.slots.push(m); const q = P.W2(X.sx0 + 1.5, lz);
      const go = bet => { const fin = [casSym(), casSym(), casSym()], now = C.time(); reels.forEach((R, r) => { R.from = R.rg.rotation.z % 6.2832; R.to = -fin[r] * 1.2566 - 6.2832 * (3 + r); R.t0 = now; R.dur = 1.1 + r * .45; }); m.spin = { fin, bet, end: now + 2.15 }; C.sfx('ui'); };
      INT.push({ x: q[0], z: q[1], name: 'Kristallslots', pr: 'Spielen', rad: 1.5, vis: () => true, talk: () => bets('Kristallslots', 'Drei gleiche: ⭐ ×25 · 💎 ×12 · 🔥 ×8 · 🌙 und 🍃 ×5. Zwei gleiche: Einsatz zurück.', go), go });
    });
    /* Sternenrad */
    { const wm = new T.Mesh(new T.CircleGeometry(1.6, 48), new T.MeshBasicMaterial({ map: wheelTex() })); wm.position.set(...X.wheel.slice(0, 1), X.Y + X.wheel[1], X.wheel[2]); dyn.add(wm); const W = st.wheel = { wm, from: 0, to: 0, t0: 0, spin: null };
      const go = bet => { const i = (Math.random() * 12) | 0, now = C.time(); W.from = wm.rotation.z % 6.2832; W.to = Math.PI / 2 + (i + .5) * Math.PI / 6 + 6.2832 * 4; W.t0 = now; W.spin = { i, bet, end: now + 3.4 }; C.sfx('ui'); };
      const q = P.W2(0, X.wheel[2] + 2.2); INT.push({ x: q[0], z: q[1], name: 'Sternenrad', pr: 'Spielen', rad: 2.2, vis: () => true, talk: () => bets('Sternenrad', 'Das Rad zeigt, womit dein Einsatz vervielfacht wird: ×1, ×2 oder ×5 – oder nichts.', go), go }); }
    /* Höher oder Tiefer am Kartentisch */
    { const [tx, tz] = X.table, cards = [0, 1].map(k => { const o = new T.Group(), f = new T.Group(); o.position.set(tx + (k ? .42 : -.42), X.Y + 1.32, tz + .1); o.rotation.x = -.45; const mats = [0, 0, 0, 0, 0, 0].map((_, j) => new T.MeshBasicMaterial(j === 4 ? { map: cardTex(0) } : j === 5 ? { map: cardTex(0) } : { color: 0xe8e0d0 })); f.add(new T.Mesh(new T.BoxGeometry(.56, .8, .02), mats)); f.rotation.y = Math.PI; o.add(f); dyn.add(o); return { f, mats, from: Math.PI, to: Math.PI, t0: 0 }; });
      const show = (k, v) => { const c = cards[k], now = C.time(); if (v) { c.mats[4].map = cardTex(v); c.mats[4].needsUpdate = true; } c.from = c.f.rotation.y; c.to = v ? 0 : Math.PI; c.t0 = now; };
      const H = st.hilo = { cards, round: null, show };
      const draw = () => 1 + ((Math.random() * 13) | 0);
      const pay = () => { const r = H.round; H.round = null; show(0, 0); show(1, 0); done(r.bet, r.pot, tx, tz, 'Höher oder Tiefer'); };
      const ask = () => { const r = H.round; if (!r || CS !== st) return; const c = r.card, ph = (13 - c) / 13, pl = (c - 1) / 13, o = [];
        const g = (hi, p) => ({ t: `${hi ? '⬆ Höher' : '⬇ Tiefer'} ×${String(hiloMul(p))}`, fn() { if (H.round !== r || r.wait) return; r.wait = true; const nx = draw(); show(1, nx); C.sfx('ui'); setTimeout(() => { if (H.round !== r) return; r.wait = false; const ok = hi ? nx > c : nx < c;
          if (!ok) { r.pot = 0; C.say([[dealer, `Eine ${nx}. ${nx === c ? 'Gleichstand zählt für das Haus.' : 'Schade!'} Der Einsatz ist weg.`]], pay); return; }
          r.pot = Math.round(r.pot * hiloMul(p)); r.n++; r.card = nx; show(0, nx); show(1, 0); if (r.n >= 5) C.say([[dealer, `Eine ${nx} – fünf Mal richtig! Du bekommst ${r.pot} 💎.`]], pay); else ask(); }, 650); } });
        if (ph > 0) o.push(g(true, ph)); if (pl > 0) o.push(g(false, pl)); if (r.n) o.push({ t: `💰 Auszahlen (${r.pot} 💎)`, fn: pay });
        C.say([[dealer, `Die Karte ist eine ${c}. ${r.n ? 'Im Topf liegen ' + r.pot + ' 💎. ' : ''}Ist die nächste höher oder tiefer?`]], null, o); };
      const dealer = 'Kartengeber Marlo';
      const start = bet => { H.round = { bet, pot: bet, card: draw(), n: 0 }; st.busy = false; show(0, H.round.card); show(1, 0); setTimeout(ask, 450); };
      H.start = start; H.ask = ask;
      const q = P.W2(tx, tz - 1.25); const o = C.addNpc('tw_dealer', dealer, q[0], q[1], C.makeVillager({ cloth: 0x1a1a2a, cloth2: 0xb02a3a, hair: 0x2a2a30 }), () => { if (off()) return closed(); if (H.round) return ask(); bets(dealer, 'Höher oder Tiefer: Rate, ob die nächste Karte (1 bis 13) höher oder tiefer ist. Jeder Treffer vergrößert den Topf, du kannst jederzeit auszahlen.', start); }, P.ry); o.noRoute = 1; }
    /* Empfang */
    { const q = P.W2(-2.8, P.d / 2 - P.t - 1.3), o = C.addNpc('tw_stella', 'Stella', q[0], q[1], C.makeVillager({ cloth: 0xc02a5a, cloth2: 0x2a1a3a, hair: 0xf0d060 }), () => { const s = S();
        C.say([['Stella', off() ? 'Willkommen im Golden Star! Die Geräte sind gerade ausgeschaltet (Familienoption).' : `Willkommen im Golden Star! Hier wird nur um Spiel-Splitter gespielt, kein echtes Geld. Deine Spiele: ${s.cas.n} · bester Gewinn: ${s.cas.best} 💎.`]], null,
          [{ t: off() ? 'Geräte einschalten' : 'Geräte ausschalten', fn() { s.cas.off = !s.cas.off; C.sfx('ui'); C.toast(s.cas.off ? '🎰 Casino ausgeschaltet' : '🎰 Casino eingeschaltet – viel Glück!'); C.saveGame(true); } }, { t: 'Danke', fn() { } }]); }, P.ry + 1.2); o.noRoute = 1; }
    /* Bewegung der Walzen, des Rads und der Karten */
    C.anim(() => { const now = C.time();
      for (const m of st.slots) { for (const R of m.reels) if (R.dur) { const k = (now - R.t0) / R.dur; R.rg.rotation.z = R.from + (R.to - R.from) * ease(k); if (k >= 1) R.dur = 0; } if (m.spin && now >= m.spin.end) { const sp = m.spin; m.spin = null; done(sp.bet, slotPay(sp.fin, sp.bet), X.sx0, X.SZ[st.slots.indexOf(m)], sp.fin.map(i => CAS.SYM[i]).join(' ')); } }
      const W = st.wheel; if (W.spin) { W.wm.rotation.z = W.from + (W.to - W.from) * ease((now - W.t0) / 3.2); if (now >= W.spin.end) { const sp = W.spin; W.spin = null; const v = CAS.SEG[sp.i]; done(sp.bet, sp.bet * v, 0, X.wheel[2] + 1, 'Sternenrad ' + (v ? '×' + v : '–')); } }
      for (const c of st.hilo.cards) if (c.f.rotation.y !== c.to) { const k = Math.min(1, (now - c.t0) / .35); c.f.rotation.y = c.from + (c.to - c.from) * k; } });
  }

  return { build, flush, shop, has: k => !!KIND[k] || k === 'home', CAS, slotPay, hiloMul, get cs() { return CS; } };
}
