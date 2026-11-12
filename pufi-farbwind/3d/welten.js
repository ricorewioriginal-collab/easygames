/* Pufi & der Farbwind 3D – Weltdaten (6 Level auf 3 Inseln) und Erreichbarkeitsprüfung.
 * Koordinaten: y nach oben, die Strecke führt grob Richtung −z. Alle Höhen y = Oberkante (zum Draufstellen).
 * Läuft im Browser (window.PufiWelten) und in Node (require) für die Tests. */
(function (root) {
  'use strict';
  // ---------- Bausteine ----------
  const insel = (x, z, r, y = 0, h = 6) => ({ k: 'insel', x, y, z, r, h });
  const plat = (x, y, z, w = 3, d = 3, mat = 'holz', h = 0.8) => ({ k: 'plat', x, y, z, w, d, h, mat });
  const retro = (x, y, z, w, d, tile = 0, h = 1.5) => ({ k: 'plat', x, y, z, w, d, h, mat: 'retro', tile });
  const lift = (x, y, z, w, d, ax, per = 4, mat = 'lift') => ({ k: 'lift', x, y, z, w, d, h: 0.6, ax, per, mat });
  const brk = (x, y, z, w = 2.5, d = 2.5) => ({ k: 'broeckel', x, y, z, w, d, h: 0.6 });
  const pilz = (x, y, z) => ({ k: 'pilz', x, y, z });
  const eiblock = (x, y, z) => ({ k: 'eiblock', x, y, z });
  const wolke = (x, y, z, gibt, extra) => ({ k: 'wolke', x, y, z, gibt, extra: extra || [] });
  const wind = (x, z, r, y0, hh) => ({ k: 'wind', x, z, r, y: y0, h: hh });
  const schalter = (x, y, z) => ({ k: 'schalter', x, y, z });
  const fblock = (x, y, z, w = 2.5, d = 2.5) => ({ k: 'farbblock', x, y, z, w, d, h: 0.6 });
  const zone = (ax, az, bx, bz, w = 2.2) => ({ k: 'retrozone', ax, az, bx, bz, w });
  const m = (x, y, z) => ({ k: 'muenze', x, y, z });
  const rot = (x, y, z) => ({ k: 'rot', x, y, z });
  const blu = (x, y, z) => ({ k: 'bluete', x, y, z });
  const stern = (x, y, z) => ({ k: 'stern', x, y, z });
  const ring = (x, y, z) => ({ k: 'ring', x, y, z });
  const ziel = (x, y, z) => ({ k: 'ziel', x, y, z });
  const muffel = (x, y, z, r = 3) => ({ k: 'muffel', x, y, z, r });
  const flatter = (x, y, z, ax = [3, 0, 0], per = 4) => ({ k: 'flatter', x, y, z, ax, per });
  const igel = (x, y, z, ax = [4, 0, 0], per = 3) => ({ k: 'igel', x, y, z, ax, per });
  const schnapp = (x, y, z) => ({ k: 'schnapp', x, y, z });
  const baum = (x, y, z, s = 1) => ({ k: 'baum', x, y, z, s });
  const busch = (x, y, z, s = 1) => ({ k: 'busch', x, y, z, s });
  const fels = (x, y, z, s = 1) => ({ k: 'fels', x, y, z, s });
  const boss = (x, y, z, hp = 3, name = 'Brummnebel', col) => ({ k: 'boss', x, y, z, hp, name, col });
  // neue Gegner, Hilfen und Deko
  const hupfer = (x, y, z, r = 3) => ({ k: 'hupfer', x, y, z, r });
  const spucker = (x, y, z) => ({ k: 'spucker', x, y, z });
  const wirbel = (x, y, z, ax = [3, 0, 0], per = 2.6) => ({ k: 'wirbel', x, y, z, ax, per });
  const nebli = (x, y, z, r = 5) => ({ k: 'nebli', x, y, z, r });
  const rutscher = (x, y, z, ax = [3.5, 0, 0], per = 2.4) => ({ k: 'rutscher', x, y, z, ax, per });
  const hilfe = (k, x, y, z) => ({ k, x, y, z });   // herz, feder, magnet, regen
  const tafel = (x, y, z, text) => ({ k: 'tafel', x, y, z, text });
  const deko = (typ, x, y, z, s = 1) => ({ k: 'deko', typ, x, y, z, s });
  const geysir = (x, z, r, y0, hh, per = 3.6) => ({ k: 'wind', x, z, r, y: y0, h: hh, per, geysir: true });
  // Münzreihe zwischen zwei Punkten (Endpunkte eingeschlossen)
  const reihe = (a, b, n) => Array.from({ length: n }, (_, i) => { const f = n > 1 ? i / (n - 1) : 0; return m(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f); });
  const kreis = (x, y, z, r, n) => Array.from({ length: n }, (_, i) => m(x + Math.cos(i / n * Math.PI * 2) * r, y, z + Math.sin(i / n * Math.PI * 2) * r));
  const bogen = (x, y, z, dx, dz, n, hh = 1.6) => Array.from({ length: n }, (_, i) => { const f = n > 1 ? i / (n - 1) : 0; return m(x + dx * f, y + Math.sin(f * Math.PI) * hh, z + dz * f); });

  const HAND = [
    // ---------------- Insel 1: Blütenbucht ----------------
    {
      id: '1-1', name: 'Blütenbucht', welt: 0, theme: 'wiese', start: [0, 0, 5], startYaw: Math.PI,
      tipp: 'Lauf mit dem Stick, springe mit A und halte A zum Flattern. Mit X fängst du Muffel – daraus werden Eier!',
      items: [
        insel(0, 0, 11, 0), baum(-6, 0, -1), baum(8, 0, -2.5, 1.2), busch(-7, 0, 6), busch(5, 0, -7), fels(6.5, 0, 6.5, 0.8),
        ...reihe([0, 1, 1], [0, 1, -8], 5), muffel(-3, 0, -4), muffel(4, 0, -6, 2),
        eiblock(2, 3.0, -2), blu(-8.5, 1.2, 4.5), rot(8.5, 1.1, -5),
        plat(0, 0.4, -13.5), plat(0, 0.8, -17.5), ...reihe([0, 1.6, -13.5], [0, 2, -17.5], 3),
        insel(-6, -16, 2.5, -0.6, 3), blu(-6, 0.6, -16.5), rot(-5, 0.5, -14.6),
        insel(0, -28, 8, 1), ring(0, 2.6, -24), baum(-5, 1, -32, 0.9), busch(4, 1, -24),
        pilz(5, 1, -30), plat(9, 6, -33, 3, 3, 'stein'), blu(9, 7.2, -33), rot(9, 9.5, -33), ...kreis(9, 7, -33, 1.1, 4),
        muffel(-3, 1, -29, 2), wolke(-4, 5.2, -32, 'sterne'), rot(-4, 2.2, -34),
        plat(-2, 2, -38, 2.5, 2.5), plat(0, 3, -41.5, 2.5, 2.5), m(-2, 3, -38), m(0, 4, -41.5),
        insel(0, -52, 9, 3.5), muffel(-3, 3.5, -50), muffel(3, 3.5, -55, 2), baum(-6, 3.5, -56, 1.1), fels(5, 3.5, -48),
        eiblock(-4, 6.6, -50), rot(0, 4.6, -47), rot(-7, 4.6, -52), plat(6, 6, -55, 2.5, 2.5, 'stein'), blu(6, 7.2, -55),
        ...bogen(-3, 4.6, -58, 6, 0, 5),
        lift(0, 3.5, -64, 3, 3, [3, 0, 0], 4), rot(0, 6, -64),
        insel(0, -74, 8, 3.5), ziel(0, 3.5, -76), rot(6, 4.6, -73), blu(-5, 4.7, -79), busch(5, 3.5, -78), stern(-3, 4.6, -70), stern(3, 4.6, -70)
      ]
    },
    {
      id: '1-2', name: 'Farbwind-Höhen', welt: 0, theme: 'abend', start: [0, 0, 4], startYaw: Math.PI,
      tipp: 'Bunte Windsäulen tragen dich nach oben. Spring hinein und lenke dich ans Ziel!',
      items: [
        insel(0, 0, 9, 0), baum(-5, 0, 3), busch(5, 0, 2), rot(-5, 1.1, -3), ...reihe([0, 1, 0], [0, 1, -6], 4), muffel(3, 0, -4), muffel(-3, 0, -5, 2),
        wind(0, -14, 1.9, -2, 9.5), ...reihe([0, 2, -14], [0, 6, -14], 4), rot(0, 5, -14.4), blu(0, 8.2, -14), flatter(3, 5, -14, [3, 0, 0], 4),
        insel(0, -24, 6, 6), ring(0, 7.6, -22), eiblock(-2.5, 9.2, -25), baum(3, 6, -27, 0.9),
        insel(6, -33, 3, 6.5, 4), rot(6, 7.6, -33), insel(12, -40, 3, 7.5, 4), rot(12, 8.6, -40), wolke(12, 11.5, -40, 'bruecke', [plat(2.5, 8, -50, 2, 2, 'wolke'), plat(-2, 8, -52, 2, 2, 'wolke')]),
        flatter(9, 9.5, -36, [0, 1.2, 3], 3.5),
        insel(18, -36, 2, 4, 3), pilz(18, 4, -35.5), blu(18.5, 5.2, -37),
        insel(8, -48, 3, 8, 4), muffel(8, 8, -48, 1.5),
        insel(-7, -54, 2.5, 8, 3), blu(-7, 9.2, -54), rot(-7, 9.2, -55.5),
        lift(8, 8, -55, 2.5, 2.5, [0, 3, 0], 5), m(8, 12.5, -55),
        insel(8, -63, 5, 11), rot(10, 12.1, -62), blu(5, 12.2, -60), busch(5, 11, -64), muffel(8, 11, -62, 2),
        wind(8, -72, 1.9, 4, 12), ...reihe([8, 9, -72], [8, 15, -72], 4), rot(8, 13, -72.5), flatter(5, 14, -72, [6, 0, 0], 5),
        insel(8, -82, 7, 15), ziel(8, 15, -85), blu(3, 16.2, -86), rot(12, 16.1, -81), baum(13, 15, -85, 0.8), stern(6, 16, -78), stern(10, 16, -78)
      ]
    },
    // ---------------- Insel 2: Honigklippen & Wolkenpfad ----------------
    {
      id: '2-1', name: 'Honigklippen', welt: 1, theme: 'klippe', start: [0, 0, 4], startYaw: Math.PI,
      tipp: 'Honigstufen bröckeln, wenn du stehen bleibst. Hinter dem Pixeltor wartet eine Retro-Zone!',
      items: [
        insel(0, 0, 9, 0), fels(-5, 0, 2, 1.2), fels(6, 0, -3), blu(-6.5, 1.2, 4.5), muffel(2, 0, -4), ...reihe([0, 1, 1], [0, 1, -6], 4),
        brk(0, 0.5, -12), brk(0, 1, -15.5), brk(0, 1.5, -19), ...reihe([0, 1.6, -12], [0, 2.6, -19], 3),
        insel(0, -28, 7, 2), igel(0, 2, -28, [4.5, 0, 0], 3.2), ring(4, 3.6, -25), rot(-5, 3.1, -26),
        insel(-9, -30, 2, -0.6, 3), pilz(-9, -0.6, -30.6), blu(-9.4, 0.6, -29),
        zone(0, -35, 0, -76.5),
        retro(0, 2, -39.5, 3, 9, 0), eiblock(0, 5.4, -40), ...reihe([0, 3, -37], [0, 3, -43], 4),
        retro(0, 2, -51.25, 3, 7.5, 0), igel(0, 2, -51, [0, 0, 2.6], 2.6), rot(0, 4.5, -45.7),
        retro(0, 3, -56, 3, 2, 8), retro(0, 4, -58, 3, 2, 8), rot(0, 6, -58),
        retro(0, 5.5, -62, 3, 2, 12, 1), retro(0, 5.5, -66, 3, 2, 12, 1), wolke(0, 9, -62, 'sterne'), blu(0, 8.6, -66), rot(0, 6.6, -64),
        retro(0, 3, -72.25, 3, 8.5, 0), muffel(0, 3, -72, 2), rot(0, 4.2, -75),
        insel(0, -84, 7, 3), muffel(-3, 3, -83), fels(-4, 3, -88), pilz(4, 3, -82), plat(8, 8, -86, 2.5, 2.5, 'honig'), blu(8, 9.2, -86), rot(8, 11.2, -86),
        brk(-6, 4.5, -90), brk(-9, 5.5, -93), rot(-9, 6.6, -93),
        lift(0, 3.5, -94, 3, 3, [3, 0, 0], 3.5),
        insel(0, -104, 7, 4), ziel(0, 4, -106), blu(5, 5.2, -108), rot(-5, 5.1, -101), igel(0, 4, -101, [3, 0, 0], 2.8), stern(-2, 5.1, -99), stern(2, 5.1, -99)
      ]
    },
    {
      id: '2-2', name: 'Wolkenpfad', welt: 1, theme: 'wolken', start: [0, 0, 4], startYaw: Math.PI,
      tipp: 'Stampfe (Y) auf den Farbschalter: Für kurze Zeit erscheinen bunte Blöcke. Beeil dich!',
      items: [
        insel(0, 0, 8, 0), blu(5.5, 1.2, 3), ...reihe([0, 1, 1], [0, 1, -5], 3), muffel(-3, 0, -3),
        plat(0, 0.5, -11, 3, 3, 'wolke'), plat(3, 1.3, -15, 3, 3, 'wolke'), plat(0, 2, -19, 3, 3, 'wolke'), rot(3, 2.5, -15), flatter(-3, 3.5, -15, [0, 0, 3], 3),
        insel(0, -28, 6, 2.5), ring(-3, 4, -26), schalter(3, 2.5, -29), eiblock(-3, 5.7, -30), muffel(0, 2.5, -31, 2),
        fblock(0, 3, -36), fblock(0, 3.5, -40), fblock(0, 4, -44), ...reihe([0, 4, -36], [0, 5, -44], 3), rot(2.6, 4.6, -40),
        insel(0, -50, 6, 4), muffel(2, 4, -49), wolke(-3, 8, -51, 'bruecke', [plat(-8, 4.5, -52, 2.5, 2.5, 'wolke'), plat(-12, 5, -55, 2.5, 2.5, 'wolke')]),
        insel(-16, -59, 2.5, 5.5, 3), rot(-12, 6.1, -55), blu(-16, 6.7, -59), rot(-16, 6.7, -60.5),
        plat(5.5, 6, -53, 2, 2, 'wolke'), blu(5.5, 7.2, -53),
        lift(0, 4, -60, 3, 3, [0, 0, 3], 4), blu(0, 6.5, -60), flatter(3, 6, -60, [0, 1, 0], 2.5), rot(0, 5.4, -60),
        insel(0, -74, 6, 5), muffel(-2, 5, -72), rot(4, 6.1, -71), ziel(0, 5, -76), blu(-4, 6.2, -78), rot(4, 6.1, -78), stern(-1.5, 6.1, -70), stern(1.5, 6.1, -70),
        rot(0, 7.5, -47)
      ]
    },
    // ---------------- Insel 3: Glutgarten & Nebelburg ----------------
    {
      id: '3-1', name: 'Glutgarten', welt: 2, theme: 'glut', start: [0, 0, 4], startYaw: Math.PI,
      tipp: 'Schnappblüten und Igelkugeln frisst man nicht – triff sie mit Eiern (B halten, zielen, loslassen).',
      items: [
        insel(0, 0, 8, 0), fels(-4, 0, 2, 1.2), muffel(3, 0, -3), muffel(-2, 0, -5, 2), eiblock(0, 3, -2), rot(5, 1.1, 2),
        plat(-3, 0.5, -11, 2.5, 2.5, 'stein'), plat(2, 1, -15, 2.5, 2.5, 'stein'), plat(-2, 1.5, -19, 2.5, 2.5, 'stein'), plat(2, 2, -23, 2.5, 2.5, 'stein'),
        m(-3, 1.6, -11), m(2, 2.1, -15), m(-2, 2.6, -19), rot(2, 3.1, -23), blu(-6, 1.7, -15),
        plat(-6, 0.5, -15, 2, 2, 'stein'),
        insel(0, -32, 6, 2.5), ring(2, 4, -29), schnapp(3, 2.5, -34), muffel(-2, 2.5, -30, 2),
        zone(-6, -32, -44, -32),
        retro(-10, 2.5, -32, 8, 3, 3), ...reihe([-7, 3.5, -32], [-13, 3.5, -32], 4),
        lift(-19, 2.5, -32, 3, 3, [3, 0, 0], 3), rot(-19, 4.6, -32),
        retro(-27, 2.5, -32, 5, 3, 3), igel(-27, 2.5, -32, [1.8, 0, 0], 2.2),
        retro(-32, 4, -32, 2, 3, 4), retro(-36, 5, -32, 2, 3, 4), wolke(-34, 8.5, -32, 'bluete'), rot(-32, 5.1, -32), blu(-52, 5.2, -37.5), rot(-36, 6.2, -32),
        retro(-41, 4, -32, 5, 3, 3), muffel(-41, 4, -32, 1.5), blu(-41, 7.6, -32),
        insel(-52, -32, 7, 4), schnapp(-55, 4, -29), igel(-52, 4, -34, [3, 0, 0], 2.6), rot(-48, 5.1, -28), fels(-56, 4, -35),
        lift(-52, 4, -43, 3, 3, [0, 3, 0], 4), rot(-52, 9, -43),
        insel(-52, -54, 6, 8), ziel(-52, 8, -56), schnapp(-48, 8, -52), blu(-56, 9.2, -57), rot(-48, 9.1, -57), stern(-53.5, 9.1, -50), stern(-50.5, 9.1, -50)
      ]
    },
    {
      id: '3-4', name: 'Nebelburg', welt: 2, theme: 'burg', start: [0, 0, 4], startYaw: Math.PI, boss: true,
      tipp: 'Brummnebel! Triff den leuchtenden Bauch mit Eiern oder stampfe auf ihn, wenn er benommen ist. Eierblöcke stehen am Rand.',
      items: [
        insel(0, 0, 7, 0), muffel(2, 0, -3), muffel(-2, 0, -4, 2), blu(-4.5, 1.2, 2.5), rot(4.5, 1.1, 2.5), eiblock(0, 3, -1),
        retro(0, 1, -11, 3, 3, 1, 1.5), retro(0, 2, -15, 3, 3, 1, 1.5), retro(0, 3, -19, 3, 3, 1, 1.5), rot(0, 4.5, -15), m(0, 2, -11), m(0, 4, -19),
        retro(5, 3.5, -15, 2, 2, 9, 1), blu(5, 4.7, -15), retro(-5, 3.5, -15, 2, 2, 9, 1), rot(-5, 4.7, -15),
        insel(0, -34, 13, 3.5, 7), ring(0, 5, -23), retro(-11, 9.5, -28, 2, 2, 1, 6), retro(11, 9.5, -28, 2, 2, 1, 6), retro(-11, 9.5, -40, 2, 2, 1, 6), retro(11, 9.5, -40, 2, 2, 1, 6),
        eiblock(-8, 6.6, -33), eiblock(8, 6.6, -33), eiblock(0, 6.6, -44),
        boss(0, 3.5, -36), ziel(0, 3.5, -34),
        blu(-11, 4.7, -40), blu(11, 4.7, -40), rot(-10, 4.6, -27), rot(10, 4.6, -27), blu(0, 4.7, -46), rot(0, 4.6, -26), rot(-6, 4.6, -45), rot(6, 4.6, -45)
      ]
    }
  ];
  const WELTEN = [
    { name: 'Blütenbucht', farbe: '#7fd27a' },
    { name: 'Honig & Wolken', farbe: '#ffc65c' },
    { name: 'Glut & Nebel', farbe: '#ff7a6a' },
    { name: 'Frostgipfel', farbe: '#9fe0ff' },
    { name: 'Pilzdschungel', farbe: '#6fd36a' },
    { name: 'Kristall & Sternennacht', farbe: '#b89aff' }
  ];

  // ---------- Erreichbarkeit (für Tests und als Bausicherung) ----------
  // Sprungwerte passend zu spiel.js: Sprung 2,2 hoch, mit Flattern ≈ 3,2, Laufweite ≈ 5,2; Pilz ≈ 6,5
  function surfaces(L) {
    const S = [];
    const add = (o, rect, top, extra) => S.push(Object.assign({ o, rect, top }, extra || {}));
    const box = (x, z, w, d) => ({ x0: x - w / 2, x1: x + w / 2, z0: z - d / 2, z1: z + d / 2 });
    const scan = list => list.forEach(o => {
      if (o.k === 'insel') add(o, { cx: o.x, cz: o.z, r: o.r }, o.y);
      else if (o.k === 'plat' || o.k === 'broeckel' || o.k === 'farbblock') add(o, box(o.x, o.z, o.w, o.d), o.y);
      else if (o.k === 'lift') {
        const a = o.ax, A = add(o, box(o.x - a[0], o.z - a[2], o.w, o.d), o.y - a[1], { lift: 1 }), B = add(o, box(o.x + a[0], o.z + a[2], o.w, o.d), o.y + a[1], { lift: 2 });
        void A; void B;
      } else if (o.k === 'wolke' && o.gibt === 'bruecke') scan(o.extra);
    });
    scan(L.items);
    return S;
  }
  function gap(a, b) {   // waagrechter Abstand zweier Grundflächen (Kreis/Rechteck)
    const ra = a.rect, rb = b.rect;
    if (ra.r !== undefined && rb.r !== undefined) return Math.max(0, Math.hypot(ra.cx - rb.cx, ra.cz - rb.cz) - ra.r - rb.r);
    if (ra.r !== undefined || rb.r !== undefined) {
      const c = ra.r !== undefined ? ra : rb, q = ra.r !== undefined ? rb : ra;
      const nx = Math.max(q.x0, Math.min(c.cx, q.x1)), nz = Math.max(q.z0, Math.min(c.cz, q.z1));
      return Math.max(0, Math.hypot(nx - c.cx, nz - c.cz) - c.r);
    }
    const dx = Math.max(0, ra.x0 - rb.x1, rb.x0 - ra.x1), dz = Math.max(0, ra.z0 - rb.z1, rb.z0 - ra.z1);
    return Math.hypot(dx, dz);
  }
  function pointGap(s, x, z) {
    const r = s.rect;
    if (r.r !== undefined) return Math.max(0, Math.hypot(x - r.cx, z - r.cz) - r.r);
    return Math.hypot(Math.max(0, r.x0 - x, x - r.x1), Math.max(0, r.z0 - z, z - r.z1));
  }
  function canJump(a, b, springy) {
    const g = gap(a, b), dy = b.top - a.top;
    if (springy && dy <= 6.5 && g <= 4) return true;
    if (dy <= 1.0 && g <= 5.0 + Math.min(4, Math.max(0, -dy))) return true;
    return dy <= 2.6 && g <= 3.0;
  }
  function validate(L) {
    const S = surfaces(L), items = L.items;
    const pilze = items.filter(o => o.k === 'pilz'), winde = items.filter(o => o.k === 'wind');
    const springy = s => pilze.some(p => pointGap(s, p.x, p.z) < 0.5 && Math.abs(p.y - s.top) < 0.3);
    const st = L.start, start = S.findIndex(s => pointGap(s, st[0], st[2]) === 0 && Math.abs(s.top - st[1]) < 0.3);
    if (start < 0) return { ok: false, reason: 'Start steht auf keiner Fläche' };
    const seen = new Set([start]), q = [start], windOk = new Set();
    while (q.length) {
      const i = q.shift(), a = S[i], sp = springy(a);
      const go = j => { if (!seen.has(j)) { seen.add(j); q.push(j); } };
      S.forEach((b, j) => { if (j !== i && canJump(a, b, sp)) go(j); });
      if (a.lift) S.forEach((b, j) => { if (b.o === a.o && j !== i) go(j); });   // auf dem Lift mitfahren
      winde.forEach((w, wi) => {
        const wc = { rect: { cx: w.x, cz: w.z, r: w.r }, top: a.top };
        if (gap(a, wc) <= 3.5 && a.top >= w.y - 1 && a.top <= w.y + w.h) {
          windOk.add(wi);
          S.forEach((b, j) => { if (b.top <= w.y + w.h + 1.5 && gap(wc, b) <= 4) go(j); });
        }
      });
    }
    const reach = [...seen].map(i => S[i]);
    const near = o => reach.some(s => pointGap(s, o.x, o.z) <= 2.5 && o.y - s.top >= -1.2 && o.y - s.top <= 4.3) ||
      winde.some((w, wi) => windOk.has(wi) && Math.hypot(o.x - w.x, o.z - w.z) <= w.r + 0.8 && o.y >= w.y && o.y <= w.y + w.h + 1);
    const goal = items.find(o => o.k === 'ziel');
    if (!goal) return { ok: false, reason: 'kein Ziel' };
    if (!near(goal)) return { ok: false, reason: 'Ziel nicht erreichbar' };
    for (const o of items) if ((o.k === 'bluete' || o.k === 'rot' || o.k === 'ring') && !near(o)) return { ok: false, reason: o.k + ' bei ' + [o.x, o.y, o.z].join('/') + ' nicht erreichbar' };
    const z = items.find(o => o.k === 'retrozone');
    if (z) {
      const inZone = s => { const r = s.rect; const cx = r.r !== undefined ? r.cx : (r.x0 + r.x1) / 2, cz = r.r !== undefined ? r.cz : (r.z0 + r.z1) / 2; const dx = z.bx - z.ax, dz = z.bz - z.az, l2 = dx * dx + dz * dz, f = ((cx - z.ax) * dx + (cz - z.az) * dz) / l2; return f > 0.02 && f < 0.98; };
      if (!reach.some(inZone)) return { ok: false, reason: 'Retro-Zone nicht erreichbar' };
    }
    return { ok: true, reach: reach.length, total: S.length };
  }
  function totals(L) {
    const c = k => L.items.filter(o => o.k === k).length;
    return { flowers: c('bluete') + L.items.filter(o => o.k === 'wolke' && o.gibt === 'bluete').length, red: c('rot'), coins: c('muenze') };
  }


  // ---------- Levelbaukasten: setzt aus Abschnitten (Stufen, Inseln, Lift, Wind, Pilz, Schalter …) eigene Level zusammen ----------
  // Jeder Abschnitt hält die Sprungweiten aus canJump ein; danach prüft validate() das ganze Level. Gleiche Zahl = gleiches Level.
  function rng(seed) { let a = seed >>> 0; return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const STIL = {
    wiese: { mat: 'holz', deko: ['baum', 'busch', 'blumen', 'fels'], tile: 0 },
    abend: { mat: 'holz', deko: ['baum', 'busch', 'blumen', 'laterne'], tile: 0 },
    klippe: { mat: 'honig', deko: ['fels', 'busch', 'baum'], tile: 0 },
    wolken: { mat: 'wolke', deko: ['busch', 'blumen'], tile: 12 },
    glut: { mat: 'stein', deko: ['fels', 'kristall', 'saeule'], tile: 3 },
    burg: { mat: 'stein', deko: ['saeule', 'laterne', 'fels'], tile: 1 },
    eis: { mat: 'eis', deko: ['tanne', 'schneemann', 'fels', 'tanne'], tile: 12 },
    dschungel: { mat: 'moos', deko: ['palme', 'riesenpilz', 'busch', 'blumen'], tile: 0 },
    kristall: { mat: 'kristall', deko: ['kristall', 'saeule', 'fels', 'kristall'], tile: 4 },
    nacht: { mat: 'stein', deko: ['laterne', 'palme', 'blumen', 'kristall'], tile: 9 }
  };
  const HINWEIS = {
    pilz: 'Spring auf den Federpilz – stampfe (Y) darauf für den Riesensprung!',
    wind: 'Farbwind! Spring hinein, er trägt dich nach oben.',
    geysir: 'Der Glutgeysir pustet nur ab und zu – warte auf den Strahl!',
    schalter: 'Stampfe auf den Farbschalter: Die Blöcke sind 12 Sekunden lang fest.',
    wolke: 'Triff die ?-Wolke mit einem Ei (B halten, zielen, loslassen) – dann erscheint eine Brücke.',
    retro: 'Hinter dem Pixeltor geht es seitlich weiter – wie früher!',
    eis: 'Eisplatten sind rutschig. Lauf vorsichtig und bremse früh!',
    lift: 'Warte auf den Lift und fahr mit.',
    broeckel: 'Bröckelsteine fallen, wenn du stehen bleibst. Weiter, weiter!'
  };
  function build(spec, seed) {
    const R = rng(seed), rr = (a, b) => a + R() * (b - a), pick = a => a[Math.floor(R() * a.length)], st = STIL[spec.theme] || STIL.wiese;
    const items = [], spots = [], k = spec.k || 0, pool = spec.gegner, P = o => (items.push(o), o);
    const box = (x, z, w, d) => ({ x0: x - w / 2, x1: x + w / 2, z0: z - d / 2, z1: z + d / 2 });
    const surfIsl = o => ({ rect: { cx: o.x, cz: o.z, r: o.r }, top: o.y }), surfBox = o => ({ rect: box(o.x, o.z, o.w, o.d), top: o.y });
    let cur = null, ringDone = false, hints = new Set(), helpDone = 0;
    // Abstand korrigieren, bis der Sprung von cur nach o machbar ist
    const fit = (o, sf) => { for (let n = 0; n < 40 && !canJump(cur.s, sf(o), false); n++) o.z += 0.25; return o; };
    const edge = () => cur.z - cur.ext;
    const isl = (r, dy, dx, g) => { const o = insel(cur.x + dx, edge() - g - r, r, Math.round((cur.y + dy) * 10) / 10, 4 + r * 0.4); fit(o, surfIsl); P(o); cur = { x: o.x, y: o.y, z: o.z, ext: o.r, s: surfIsl(o), o, isl: true }; return o; };
    const pl = (w, d, dy, dx, g, mat = st.mat, kind = 'plat') => {
      const y = Math.round((cur.y + dy) * 10) / 10, o = kind === 'brk' ? brk(cur.x + dx, y, edge() - g - d / 2, w, d) : kind === 'fb' ? fblock(cur.x + dx, y, edge() - g - d / 2, w, d) : plat(cur.x + dx, y, edge() - g - d / 2, w, d, mat);
      fit(o, surfBox); P(o); cur = { x: o.x, y: o.y, z: o.z, ext: d / 2, s: surfBox(o), o }; return o;
    };
    const spot = (t, x = cur.x, z = cur.z, y = cur.y) => spots.push({ t, x, y, z });
    const coinsTo = (a, n = 3) => { const b = cur; items.push(...bogen(a.x, a.y + 1.1, a.z - a.ext * 0.6, b.x - a.x, (b.z + b.ext * 0.6) - (a.z - a.ext * 0.6), n, 1.4)); };
    const dekoOn = (n, keep = 2.2) => { for (let i = 0; i < n; i++) { const a = rr(0, Math.PI * 2), r = rr(0.5, 0.85) * cur.ext, x = cur.x + Math.cos(a) * r, z = cur.z + Math.sin(a) * r; if (Math.abs(x - cur.x) < keep) continue; P(deko(pick(st.deko), x, cur.y, z, rr(0.75, 1.15))); } };
    const hint = (key, x, z) => { if (hints.has(key) || !HINWEIS[key]) return; hints.add(key); P(tafel(x, cur.y, z, HINWEIS[key])); };
    const foe = (where) => {
      const kind = pick(pool), r = cur.ext, x = cur.x + rr(-0.45, 0.45) * r, z = cur.z + rr(-0.35, 0.35) * r, y = cur.y;
      if (kind === 'flatter') return P(flatter(cur.x + rr(-2, 2), y + 2.2, z, R() < 0.5 ? [3, 0, 0] : [0, 1.2, 0], rr(3, 4.5)));
      if (kind === 'nebli') return P(nebli(x, y + 0.4, z, Math.min(5, r)));
      if (!cur.isl || r < 3.5) return null;
      const amp = Math.max(1.5, Math.min(3.5, r - 1.5));
      if (kind === 'muffel') return P(muffel(x, y, z, Math.min(2.5, r - 2)));
      if (kind === 'hupfer') return P(hupfer(x, y, z, Math.min(3, r - 1.5)));
      if (kind === 'igel') return P(igel(cur.x, y, z, [amp, 0, 0], rr(2.6, 3.4)));
      if (kind === 'wirbel') return P(wirbel(cur.x, y, z, R() < 0.5 ? [amp, 0, 0] : [amp * 0.7, 0, amp * 0.7], rr(2.2, 3)));
      if (kind === 'rutscher') return P(rutscher(cur.x, y, z, [amp, 0, 0], rr(2, 2.8)));
      if (kind === 'spucker') return P(spucker(cur.x + (R() < 0.5 ? -1 : 1) * r * 0.6, y, cur.z + r * 0.2));
      if (kind === 'schnapp') return P(schnapp(cur.x + (R() < 0.5 ? -1 : 1) * r * 0.5, y, z));
      void where; return null;
    };
    const side = () => {   // geheime Nebeninsel seitlich
      if (!cur.isl) return; const sgn = R() < 0.5 ? -1 : 1, r2 = rr(1.8, 2.4), g = rr(2, 2.8);
      const o = insel(cur.x + sgn * (cur.ext + g + r2), cur.z + rr(-1, 1), r2, Math.round((cur.y + rr(-0.4, 0.8)) * 10) / 10, 3);
      if (!canJump(cur.s, surfIsl(o), false)) return; P(o); spots.push({ t: 'side', x: o.x, y: o.y, z: o.z });
      if (R() < 0.3) P(deko(pick(st.deko), o.x + sgn * 1, o.y, o.z, 0.7));
    };
    const high = () => {   // hohe Kante, nur mit Flattern
      const sgn = R() < 0.5 ? -1 : 1, o = plat(cur.x + sgn * (cur.ext * 0.4), cur.y + 2.3, cur.z - cur.ext * 0.2, 2.2, 2.2, cur.isl ? 'stein' : st.mat);
      if (cur.isl) { o.x = cur.x + sgn * (cur.ext + 1.6); if (!canJump(cur.s, surfBox(o), false)) return; }
      else { o.x = cur.x + sgn * 4.2; o.z = cur.z; if (!canJump(cur.s, surfBox(o), false)) return; }
      P(o); spots.push({ t: 'high', x: o.x, y: o.y, z: o.z });
    };
    const helpOn = () => { if (helpDone >= 2 || !cur.isl) return; helpDone++; P(hilfe(pick(spec.hilfen || ['herz', 'feder', 'magnet', 'regen']), cur.x + rr(-0.4, 0.4) * cur.ext, cur.y + 1.2, cur.z - cur.ext * 0.3)); };
    const SEG = {
      stufen: () => { const n = 3 + (R() < 0.5 ? 1 : 0) + (k > 0.5 ? 1 : 0); for (let i = 0; i < n; i++) { const a = cur; pl(rr(2.4, 3.2), rr(2.4, 3.2), rr(-0.3, 0.9), rr(-2.2, 2.2), rr(1.6, 2.4 + k)); items.push(m(cur.x, cur.y + 1.1, cur.z)); if (i === 1) spot('path'); if (i === 2 && R() < 0.6) high(); void a; }
        if (pool.includes('flatter') && R() < 0.7) P(flatter(cur.x, cur.y + 2.4, cur.z + 3, [3, 0, 0], 4)); },
      eis: () => { hint('eis', cur.x + 2, cur.z - cur.ext + 1.5); for (let i = 0; i < 4; i++) { pl(rr(3, 4), rr(3, 4), rr(-0.2, 0.6), rr(-2, 2), rr(1.6, 2.4), 'eis'); items.push(m(cur.x, cur.y + 1.1, cur.z)); if (i === 2) spot('path'); } },
      inseln: () => { const n = 2 + (R() < 0.6 ? 1 : 0); for (let i = 0; i < n; i++) { const a = cur; isl(rr(2.6, 4), rr(-0.8, 0.8), rr(-4, 4), rr(2, 3 + k * 0.5)); coinsTo(a, 3); spot(i === n - 1 ? 'path' : 'path'); if (cur.ext >= 3.5 && R() < 0.5) foe(); if (R() < 0.35) side(); } },
      broeckel: () => { hint('broeckel', cur.x + 2, cur.z - cur.ext + 1.5); const n = 3 + (k > 0.4 ? 1 : 0); for (let i = 0; i < n; i++) { pl(2.5, 2.5, rr(0.2, 0.6), rr(-1.5, 1.5), rr(1.5, 2.1), st.mat, 'brk'); items.push(m(cur.x, cur.y + 1.1, cur.z)); } spot('path'); },
      lift: () => {
        hint('lift', cur.x + 2, cur.z - cur.ext + 1.5);
        const a = 3, y = cur.y, x = cur.x + rr(-1, 1), zc = edge() - 1.6 - 1.5 - a, o = lift(x, y, zc, 3, 3, [0, 0, a], rr(3.6, 4.6));
        P(o); items.push(m(x, y + 1.2, zc)); cur = { x, y, z: zc - a, ext: 1.5, s: { rect: box(x, zc - a, 3, 3), top: y } };
        if (pool.includes('flatter') && R() < 0.6) P(flatter(x, y + 2.6, zc, [3, 0, 0], 4));
      },
      aufzug: () => {
        const x = cur.x + rr(-1, 1), zc = edge() - 1.5 - 1.5, rise = 2.5, o = lift(x, cur.y + rise, zc, 3, 3, [0, rise, 0], rr(4, 5));
        P(o); items.push(...reihe([x, cur.y + 2, zc], [x, cur.y + 2 * rise, zc], 3)); cur = { x, y: cur.y + 2 * rise, z: zc, ext: 1.5, s: { rect: box(x, zc, 3, 3), top: cur.y + 2 * rise } };
      },
      pilz: () => {
        const base = isl(rr(3.8, 4.6), rr(-0.4, 0.4), rr(-2, 2), rr(2, 2.8)); hint('pilz', base.x - 2.2, base.z + 1.5);
        P(pilz(base.x, base.y, base.z - base.r + 1.3));
        const top = Math.round((base.y + rr(4.8, 5.6)) * 10) / 10, o = plat(base.x + rr(-1.5, 1.5), top, base.z - base.r - 1.8 - 1.5, 3, 3, 'stein');
        P(o); spots.push({ t: 'high', x: o.x, y: o.y, z: o.z }); items.push(...kreis(o.x, o.y + 1.2, o.z, 1.0, 4));
        cur = { x: o.x, y: o.y, z: o.z, ext: 1.5, s: surfBox(o), o };
        // wieder hinunter auf die nächste Insel
        isl(rr(4, 5.5), -rr(3.5, 4.5), rr(-2, 2), rr(2.5, 3.5)); spot('path'); if (R() < 0.6) foe();
      },
      wind: () => {
        const geys = spec.theme === 'glut', rise = rr(5, 6.5), wz = edge() - 2.4, w = geys ? geysir(cur.x, wz, 1.9, cur.y - 2, rise + 3.5) : wind(cur.x, wz, 1.9, cur.y - 2, rise + 3.5);
        hint(geys ? 'geysir' : 'wind', cur.x + 2.4, edge() + 1.5);
        P(w); items.push(...reihe([cur.x, cur.y + 2, wz], [cur.x, cur.y + rise, wz], 4));
        const r = rr(4.5, 5.5), o = insel(cur.x + rr(-1.5, 1.5), wz - 1.9 - rr(1.5, 2.5) - r, r, Math.round((cur.y + rise) * 10) / 10, 5);
        P(o); cur = { x: o.x, y: o.y, z: o.z, ext: r, s: surfIsl(o), o, isl: true }; spot('path'); foe(); dekoOn(2);
      },
      schalter: () => {
        const base = isl(rr(4.5, 5.5), rr(-0.3, 0.5), rr(-2, 2), rr(2, 3)); hint('schalter', base.x + 2.6, base.z + 1.2);
        P(schalter(base.x - 1.8, base.y, base.z - 0.8)); items.push(m(base.x - 1.8, base.y + 2.2, base.z - 0.8));
        for (let i = 0; i < 4; i++) { pl(2.5, 2.5, rr(0, 0.5), rr(-1.2, 1.2), rr(1.4, 2), st.mat, 'fb'); items.push(m(cur.x, cur.y + 1.1, cur.z)); }
        spot('path');
        isl(rr(4, 5), rr(-0.3, 0.6), rr(-2, 2), rr(1.6, 2.2)); spot('path'); foe();
      },
      wolke: () => {
        const base = isl(rr(4.5, 5.5), rr(-0.3, 0.4), rr(-2, 2), rr(2, 3)); hint('wolke', base.x - 2.6, base.z + 1.2);
        P(eiblock(base.x + 1.8, base.y + 3, base.z)); if (R() < 0.6) foe();
        const z1 = edge() - 2 - 1.1, z2 = z1 - 2.2 - 2 - 0.1, b1 = plat(base.x, base.y + 0.4, z1, 2.2, 2.2, 'wolke'), b2 = plat(base.x, base.y + 0.8, z2, 2.2, 2.2, 'wolke');
        P(wolke(base.x, base.y + 4.2, (z1 + z2) / 2 + 1, 'bruecke', [b1, b2]));
        cur = { x: b2.x, y: b2.y, z: b2.z, ext: 1.1, s: surfBox(b2) };
        isl(rr(4, 5), rr(-0.2, 0.6), rr(-1.5, 1.5), 2); spot('path');
      },
      arena: () => {
        isl(rr(6.5, 8.5), rr(-0.6, 0.8), rr(-3, 3), rr(2.2, 3)); spot('path'); spot('path', cur.x + rr(-0.5, 0.5) * cur.ext, cur.z + cur.ext * 0.4);
        const n = 2 + (k > 0.3 ? 1 : 0) + (k > 0.7 ? 1 : 0); for (let i = 0; i < n; i++) foe();
        if (R() < 0.7) P(eiblock(cur.x + rr(-2, 2), cur.y + 3, cur.z + rr(-1.5, 1.5)));
        items.push(...kreis(cur.x, cur.y + 1.1, cur.z, rr(2, 3), 6)); dekoOn(4);
        if (!ringDone && spec.ringAt === 'arena') { ringDone = true; P(ring(cur.x, cur.y + 2.6, cur.z + cur.ext * 0.5)); }
        if (R() < 0.4) P(wolke(cur.x + rr(-2, 2), cur.y + 4.6, cur.z - 1, 'sterne'));
        helpOn(); if (R() < 0.6) side(); if (R() < 0.5) high();
      },
      retro: () => {
        hint('retro', cur.x + 2.4, cur.z - cur.ext + 2);
        const x = cur.x, z0 = edge(); let z = z0, y = cur.y; const t = st.tile;
        const blocks = 4 + (k > 0.5 ? 1 : 0);
        for (let i = 0; i < blocks; i++) {
          const len = i % 2 ? rr(2, 3) : rr(5, 8), g = i === 0 ? 0.6 : rr(1.6, 2.6), dy = i === 0 ? 0 : pick([-1, 0, 1, 1]);
          y = Math.max(cur.y - 1, y + dy); const zc = z - g - len / 2, o = retro(x, y, zc, 3, len, i % 2 ? 8 : t);
          const s0 = { rect: box(x, zc, 3, len), top: y }; if (i > 0 && !canJump(cur.s, s0, false)) { o.z += 0.6; }
          P(o); cur = { x, y, z: o.z, ext: len / 2, s: { rect: box(x, o.z, 3, len), top: y } }; z = o.z - len / 2;
          items.push(m(x, y + 1.1, o.z)); if (len > 4) { if (R() < 0.6) P(R() < 0.5 ? muffel(x, y, o.z, 0) : igel(x, y, o.z, [0, 0, Math.max(1, len / 2 - 1)], 2.4)); P(eiblock(x, y + 3.2, o.z + 1)); }
          if (i === 2) spot('high', x, o.z, y); if (i === 1 && R() < 0.5) P(wolke(x, y + 4, o.z, 'sterne'));
        }
        P(zone(x, z0, x, z - 0.2)); cur.retroEnd = true;
        isl(rr(5, 6), rr(-0.5, 0.5), 0, rr(2, 2.6)); spot('path'); foe();
      }
    };
    // Start
    const r0 = rr(8, 9.5), s0 = insel(0, 0, r0, 0, 6); P(s0); cur = { x: 0, y: 0, z: 0, ext: r0, s: surfIsl(s0), o: s0, isl: true };
    P(tafel(-2.4, 0, 2.2, spec.tipp)); P(eiblock(2.2, 3, -2)); dekoOn(5); items.push(...reihe([0, 1, 0.5], [0, 1, -r0 + 1.5], 4)); spot('path', r0 * 0.5, -2); spot('side', -r0 * 0.55, -3);
    const edible = pool.filter(g => ['muffel', 'hupfer', 'rutscher'].includes(g)); if (edible.length) { const kd = pick(edible); P(kd === 'rutscher' ? rutscher(0, 0, -r0 * 0.5, [2.5, 0, 0], 2.6) : kd === 'hupfer' ? hupfer(-2.5, 0, -4, 2) : muffel(-2.5, 0, -4, 2)); } else P(muffel(-2.5, 0, -4, 2));
    const segs = spec.segs.slice(), mid = Math.floor(segs.length / 2);
    segs.forEach((name, i) => {
      if (name === 'boss') return;
      SEG[name]();
      if (i === mid - 1 && !ringDone && spec.ringAt !== 'arena') { isl(rr(4.5, 5.5), rr(-0.3, 0.5), rr(-2, 2), rr(2, 2.8)); P(ring(cur.x, cur.y + 2.6, cur.z)); ringDone = true; dekoOn(2); helpOn(); spot('path'); }
    });
    if (!ringDone) { isl(5, 0.3, 0, 2.4); P(ring(cur.x, cur.y + 2.6, cur.z)); ringDone = true; }
    if (spec.boss) {
      const a = cur; const R2 = 13, o = insel(cur.x, edge() - 2.6 - R2, R2, Math.round((cur.y + 0.5) * 10) / 10, 7); P(o); cur = { x: o.x, y: o.y, z: o.z, ext: R2, s: surfIsl(o), o, isl: true }; coinsTo(a, 3);
      [[-11, 6], [11, 6], [-11, -6], [11, -6]].forEach(([dx, dz]) => P(retro(o.x + dx, o.y + 6, o.z + dz, 2, 2, st.tile, 6)));
      P(eiblock(o.x - 8, o.y + 3.1, o.z + 1)); P(eiblock(o.x + 8, o.y + 3.1, o.z + 1)); P(eiblock(o.x, o.y + 3.1, o.z - 9));
      P(boss(o.x, o.y, o.z - 2, spec.boss.hp, spec.boss.name, spec.boss.col)); P(ziel(o.x, o.y, o.z)); P(stern(o.x - 2, o.y + 1.1, o.z + 9)); P(stern(o.x + 2, o.y + 1.1, o.z + 9));
      [[-9, 4], [9, 4], [0, 10], [-6, -8], [6, -8], [-10, -2], [10, -2], [0, -11]].forEach(([dx, dz]) => spots.push({ t: 'path', x: o.x + dx, y: o.y, z: o.z + dz }));
    } else {
      const a = cur; isl(rr(6.5, 7.5), rr(-0.3, 0.8), rr(-2, 2), rr(2.2, 3)); coinsTo(a, 3); P(ziel(cur.x, cur.y, cur.z - cur.ext + 2.2)); P(stern(cur.x - 1.5, cur.y + 1.1, cur.z + 2)); P(stern(cur.x + 1.5, cur.y + 1.1, cur.z + 2)); dekoOn(4); foe(); spot('path', cur.x + 3, cur.z); spot('side', cur.x - 3.5, cur.z - 1);
    }
    // Sammelsachen verteilen: Blüten bevorzugt an versteckten Stellen, rote Münzen überall
    const sh = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    const pref = sh(spots.filter(p => p.t !== 'path')), rest = sh(spots.filter(p => p.t === 'path'));
    const fl = pref.splice(0, 5); while (fl.length < 5 && rest.length) fl.push(rest.shift());
    const rd = sh(pref.concat(rest)).slice(0, 8);
    if (fl.length < 5 || rd.length < 8) return null;
    fl.forEach(p => P(blu(p.x, p.y + 1.25, p.z))); rd.forEach(p => P(rot(p.x + 0.2, p.y + 1.1, p.z + 0.2)));
    for (let i = 0; i < 3; i++) { const p = spots[Math.floor(R() * spots.length)]; P(stern(p.x - 0.8, p.y + 1.1, p.z - 0.8)); }
    return { id: spec.id, name: spec.name, welt: spec.welt, theme: spec.theme, start: [0, 0, 4], startYaw: Math.PI, tipp: spec.tipp, boss: !!spec.boss, items };
  }
  function generate(spec) {
    for (let a = 0; a < 60; a++) {
      const L = build(spec, spec.seed + a * 7919); if (!L) continue;
      const v = validate(L), t = totals(L);
      if (v.ok && t.flowers === 5 && t.red === 8 && L.items.filter(o => o.k === 'ring').length >= 1) { L.seed = spec.seed + a * 7919; return L; }
    }
    throw new Error('Level ' + spec.id + ' ließ sich nicht bauen');
  }
  const PLAN = [
    { id: '1-3', name: 'Muffelwiese', welt: 0, theme: 'wiese', seed: 103, segs: ['arena', 'inseln', 'stufen', 'pilz', 'arena', 'broeckel'], gegner: ['muffel', 'hupfer', 'flatter'], tipp: 'Hupfer springen dir entgegen – fang sie mit der Zunge (X) oder spring ihnen auf den Kopf!' },
    { id: '1-4', name: 'Laternenpfad', welt: 0, theme: 'abend', seed: 104, segs: ['stufen', 'lift', 'arena', 'wind', 'inseln', 'aufzug', 'arena'], gegner: ['muffel', 'hupfer', 'nebli', 'flatter'], tipp: 'Nebli schweben dir nach. Ein Ei oder die Zunge hilft!' },
    { id: '2-3', name: 'Bienenstock-Bucht', welt: 1, theme: 'klippe', seed: 203, segs: ['broeckel', 'arena', 'retro', 'pilz', 'stufen', 'arena'], gegner: ['igel', 'hupfer', 'spucker', 'muffel'], tipp: 'Kernspucker schießen – weich aus und triff sie mit Eiern.' },
    { id: '2-4', name: 'Regenbogenbrücke', welt: 1, theme: 'wolken', seed: 204, segs: ['wolke', 'inseln', 'schalter', 'arena', 'wind', 'stufen'], gegner: ['flatter', 'nebli', 'spucker', 'muffel'], tipp: 'Wolken mit ? verstecken Brücken. Triff sie mit einem Ei!' },
    { id: '3-2', name: 'Lavagrotten', welt: 2, theme: 'glut', seed: 302, segs: ['wind', 'stufen', 'arena', 'lift', 'broeckel', 'arena'], gegner: ['schnapp', 'igel', 'spucker', 'wirbel', 'muffel'], tipp: 'Wirbelkreisel tun weh – aber springst du von oben drauf, katapultieren sie dich hoch!' },
    { id: '3-3', name: 'Spukgemäuer', welt: 2, theme: 'burg', seed: 303, segs: ['retro', 'arena', 'aufzug', 'schalter', 'stufen', 'arena'], gegner: ['nebli', 'muffel', 'wirbel', 'spucker'], tipp: 'Im Spukgemäuer schweben Nebli. Bleib in Bewegung!' },
    { id: '4-1', name: 'Frostpfad', welt: 3, theme: 'eis', seed: 401, segs: ['eis', 'arena', 'inseln', 'pilz', 'arena'], gegner: ['rutscher', 'muffel', 'hupfer'], tipp: 'Willkommen auf den Frostgipfeln! Rutscher sausen über das Eis.' },
    { id: '4-2', name: 'Gletscherspalten', welt: 3, theme: 'eis', seed: 402, segs: ['broeckel', 'lift', 'arena', 'eis', 'wind', 'arena'], gegner: ['rutscher', 'nebli', 'spucker', 'flatter'], tipp: 'Über den Spalten fahren Lifte – Geduld zahlt sich aus.' },
    { id: '4-3', name: 'Schneesturmgipfel', welt: 3, theme: 'eis', seed: 403, segs: ['aufzug', 'arena', 'retro', 'inseln', 'stufen', 'arena'], gegner: ['rutscher', 'wirbel', 'hupfer', 'flatter'], tipp: 'Hoch hinaus! Der Gipfel liegt über den Wolken.' },
    { id: '4-4', name: 'Eispalast', welt: 3, theme: 'eis', seed: 404, segs: ['schalter', 'arena', 'lift', 'eis', 'pilz', 'arena', 'wolke'], gegner: ['rutscher', 'spucker', 'wirbel', 'nebli', 'muffel'], tipp: 'Im Eispalast helfen Farbschalter und Federpilze.' },
    { id: '5-1', name: 'Pilzdschungel', welt: 4, theme: 'dschungel', seed: 501, segs: ['pilz', 'arena', 'inseln', 'pilz', 'stufen'], gegner: ['hupfer', 'schnapp', 'spucker', 'muffel'], tipp: 'Im Dschungel federn dich Riesenpilze in die Höhe.' },
    { id: '5-2', name: 'Lianenhain', welt: 4, theme: 'dschungel', seed: 502, segs: ['inseln', 'wind', 'arena', 'broeckel', 'inseln', 'arena'], gegner: ['hupfer', 'flatter', 'nebli', 'schnapp'], tipp: 'Zwischen den Bäumen trägt dich der Farbwind.' },
    { id: '5-3', name: 'Sporensumpf', welt: 4, theme: 'dschungel', seed: 503, segs: ['stufen', 'lift', 'arena', 'retro', 'inseln', 'arena'], gegner: ['spucker', 'hupfer', 'wirbel', 'muffel'], tipp: 'Kernspucker lauern im Sumpf – Eier bereithalten!' },
    { id: '5-4', name: 'Dschungeltempel', welt: 4, theme: 'dschungel', seed: 504, segs: ['aufzug', 'schalter', 'arena', 'wolke', 'stufen', 'arena'], gegner: ['schnapp', 'wirbel', 'spucker', 'hupfer', 'nebli'], tipp: 'Der Tempel ist voller Rätsel: Schalter, Wolken und Lifte.' },
    { id: '6-1', name: 'Kristallgrotte', welt: 5, theme: 'kristall', seed: 601, segs: ['stufen', 'arena', 'lift', 'pilz', 'arena', 'broeckel'], gegner: ['nebli', 'wirbel', 'spucker', 'muffel'], tipp: 'Die Kristalle leuchten dir den Weg.' },
    { id: '6-2', name: 'Sternenstrand', welt: 5, theme: 'nacht', seed: 602, segs: ['inseln', 'arena', 'wind', 'broeckel', 'retro', 'arena'], gegner: ['hupfer', 'rutscher', 'nebli', 'flatter', 'spucker'], tipp: 'Unter dem Sternenhimmel ist es ruhig – fast.' },
    { id: '6-3', name: 'Sternenleiter', welt: 5, theme: 'nacht', seed: 603, segs: ['aufzug', 'wolke', 'arena', 'stufen', 'schalter', 'aufzug', 'arena'], gegner: ['wirbel', 'nebli', 'spucker', 'schnapp', 'flatter'], tipp: 'Die Leiter zu den Sternen ist lang. Nutze die Farbringe!' },
    { id: '6-4', name: 'Sturmnebel-Turm', welt: 5, theme: 'kristall', seed: 604, segs: ['stufen', 'arena', 'aufzug', 'inseln', 'boss'], gegner: ['nebli', 'wirbel', 'spucker', 'muffel'], boss: { hp: 5, name: 'Sturmnebel', col: '#5a8ad8' },
      tipp: 'Sturmnebel! Er ist stärker als Brummnebel: fünf Treffer mit Eiern oder Stampfen.' }
  ];
  const ORDER = ['1-1', '1-2', '1-3', '1-4', '2-1', '2-2', '2-3', '2-4', '3-1', '3-2', '3-3', '3-4', '4-1', '4-2', '4-3', '4-4', '5-1', '5-2', '5-3', '5-4', '6-1', '6-2', '6-3', '6-4'];
  const LEVELS = ORDER.map(id => HAND.find(l => l.id === id) || generate(Object.assign({ k: ORDER.indexOf(id) / (ORDER.length - 1) }, PLAN.find(p => p.id === id))));
  const API = { LEVELS, WELTEN, PLAN, COUNT: LEVELS.length, validate, totals, surfaces };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.PufiWelten = API;
})(typeof window !== 'undefined' ? window : globalThis);
