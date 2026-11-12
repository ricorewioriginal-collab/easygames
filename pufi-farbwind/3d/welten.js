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
  const boss = (x, y, z) => ({ k: 'boss', x, y, z });
  // Münzreihe zwischen zwei Punkten (Endpunkte eingeschlossen)
  const reihe = (a, b, n) => Array.from({ length: n }, (_, i) => { const f = n > 1 ? i / (n - 1) : 0; return m(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f); });
  const kreis = (x, y, z, r, n) => Array.from({ length: n }, (_, i) => m(x + Math.cos(i / n * Math.PI * 2) * r, y, z + Math.sin(i / n * Math.PI * 2) * r));
  const bogen = (x, y, z, dx, dz, n, hh = 1.6) => Array.from({ length: n }, (_, i) => { const f = n > 1 ? i / (n - 1) : 0; return m(x + dx * f, y + Math.sin(f * Math.PI) * hh, z + dz * f); });

  const LEVELS = [
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
      id: '3-2', name: 'Nebelburg', welt: 2, theme: 'burg', start: [0, 0, 4], startYaw: Math.PI, boss: true,
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
    { name: 'Glut & Nebel', farbe: '#ff7a6a' }
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

  const API = { LEVELS, WELTEN, COUNT: LEVELS.length, validate, totals, surfaces };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.PufiWelten = API;
})(typeof window !== 'undefined' ? window : globalThis);
