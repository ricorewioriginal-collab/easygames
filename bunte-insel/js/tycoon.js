'use strict';
/* Bunte Insel – Park-Tycoon 🎢: aus dem Freizeitpark wird ein Mini-Rollercoaster-Tycoon.
   Im Park-Büro (Häuschen am Eingang) verwaltet man den eigenen Park: Fahrgeschäfte, Buden, Toiletten, Mülleimer und Deko bauen, verschieben und verkaufen,
   Wege legen (Gäste finden nur, was an einem Weg liegt, der zum Platz am Brunnen führt), Müll einsammeln, neue Dinge erforschen und Park-Missionen erfüllen.
   Alles wird gespeichert (save.tycoon). Sparsam: alle festen Teile (Wege, Buden, Deko) stecken in EINEM Sammel-Mesh, Gäste und Müll sind je ein InstancedMesh,
   nur die Fahrgeschäfte sind einzeln (sie drehen sich). Gerechnet wird einmal pro Sekunde, der Rest passiert nur beim Bauen. */
BI.TYCOON = {
  GRID: 2, MAXD: 49, LCAP: 24, MAXG: 18,
  /* Katalog. tab: 0 Fahrgeschäfte, 1 Buden, 2 Service, 3 Deko, 4 Wege · cost in 🪙 · inc = 🪙 pro Minute bei vollem Gästeglück · res = nötige Forschung · small = darf auf einem Weg stehen */
  CAT: {
    carousel: { tab: 0, t: 'ride', icon: '🎠', name: 'Karussell', cost: 120, inc: 18, max: 3, info: 'Der Klassiker – Pferdchen im Kreis.' },
    chain: { tab: 0, t: 'ride', icon: '🪢', name: 'Kettenkarussell', cost: 200, inc: 28, max: 3, res: 'kette', info: 'Schwingt weit hinaus!' },
    ferris: { tab: 0, t: 'ride', icon: '🎡', name: 'Riesenrad', cost: 350, inc: 45, max: 2, res: 'rad', info: 'Der Star des Parks mit toller Aussicht.' },
    coaster: { tab: 0, t: 'ride', icon: '🎢', name: 'Achterbahn', cost: 600, inc: 80, max: 2, res: 'bahn', info: 'Hände hoch! Zwei Runden Nervenkitzel.' },
    cotton: { tab: 1, t: 'shop', icon: '🍥', name: 'Zuckerwatte', cost: 40, inc: 7, max: 4, c: 0xff8fc8, fp: [-1.7, -1.2, 1.7, 1.2], info: 'Süß und klebrig. Stand an einen Weg stellen!' },
    popcorn: { tab: 1, t: 'shop', icon: '🍿', name: 'Popcorn', cost: 50, inc: 8, max: 4, c: 0xffd23f, fp: [-1.7, -1.2, 1.7, 1.2], info: 'Knusprig warm.' },
    icecream: { tab: 1, t: 'shop', icon: '🍦', name: 'Eis', cost: 50, inc: 8, max: 4, c: 0x4da3ff, fp: [-1.7, -1.2, 1.7, 1.2], info: 'Kühle Erfrischung.' },
    lemonade: { tab: 1, t: 'shop', icon: '🥤', name: 'Limo', cost: 60, inc: 9, max: 4, res: 'limo', c: 0x4cd07d, fp: [-1.7, -1.2, 1.7, 1.2], info: 'Sprudelnd frisch.' },
    wc: { tab: 2, t: 'svc', icon: '🚻', name: 'Toilette', cost: 60, fp: [-1.6, -1.6, 1.6, 1.6], max: 6, info: 'Gäste müssen mal – das macht sie zufriedener.' },
    bin: { tab: 2, t: 'svc', icon: '🗑️', name: 'Mülleimer', cost: 12, fp: [-.6, -.6, .6, .6], small: true, max: 30, info: 'Weniger Müll auf den Wegen.' },
    bench: { tab: 3, t: 'deco', icon: '🪑', name: 'Bank', cost: 15, fp: [-1.2, -.6, 1.2, .6], small: true, max: 30, b: 1, info: 'Zum Ausruhen.' },
    tree: { tab: 3, t: 'deco', icon: '🌳', name: 'Baum', cost: 12, fp: [-1, -1, 1, 1], small: true, max: 40, b: 1, info: 'Schatten und Grün.' },
    flowers: { tab: 3, t: 'deco', icon: '🌷', name: 'Blumenbeet', cost: 18, fp: [-1.2, -1.2, 1.2, 1.2], small: true, max: 30, res: 'garten', b: 1.5, info: 'Bunt und duftend.' },
    lamp: { tab: 3, t: 'deco', icon: '💡', name: 'Laterne', cost: 20, fp: [-.4, -.4, .4, .4], small: true, max: 30, res: 'licht', b: 1, info: 'Abends wunderschön.' },
    fountain: { tab: 3, t: 'deco', icon: '⛲', name: 'Brunnen', cost: 80, fp: [-2.4, -2.4, 2.4, 2.4], max: 4, res: 'garten', b: 3, info: 'Plätschert fröhlich.' },
    path: { tab: 4, t: 'path', icon: '🟫', name: 'Weg', cost: 2, info: 'Einfach loslaufen – der Weg legt sich vor dir!' }
  },
  TABS: [['🎠', 'Fahrgeschäfte'], ['🍿', 'Buden'], ['🚻', 'Service'], ['🌳', 'Deko'], ['🟫', 'Wege']],
  RES: [
    { id: 'kette', icon: '🪢', name: 'Kettenkarussell', cost: 60, text: 'Schwingt hinaus – ein neues Fahrgeschäft.' },
    { id: 'limo', icon: '🥤', name: 'Limo-Stand', cost: 40, text: 'Erfrischung für heiße Tage.' },
    { id: 'garten', icon: '🌷', name: 'Gartenkunst', cost: 60, text: 'Blumenbeete und Brunnen.' },
    { id: 'licht', icon: '💡', name: 'Laternen', cost: 50, text: 'Lichter für den Abend.' },
    { id: 'rad', icon: '🎡', name: 'Riesenrad', cost: 150, need: 'kette', text: 'Hoch hinaus!' },
    { id: 'hausmeister', icon: '🧹', name: 'Hausmeister', cost: 120, text: 'Sammelt von selbst Müll ein.' },
    { id: 'bahn', icon: '🎢', name: 'Achterbahn', cost: 300, need: 'rad', text: 'Der größte Spaß im Park.' },
    { id: 'tickets', icon: '🎟️', name: 'Dauerkarten', cost: 200, need: 'rad', text: '+20 % Einnahmen.' }
  ],
  /* Park-Missionen: werden automatisch abgehakt, sobald das Ziel erreicht ist. get(M) liefert den Fortschritt, n das Ziel */
  MIS: [
    { id: 'weg', icon: '🧱', title: 'Wegebauer', text: 'Lege 15 Wegstücke', n: 15, get: M => M.paths, c: 30, s: 0 },
    { id: 'zwei', icon: '🎠', title: 'Zweites Fahrgeschäft', text: 'Besitze 2 Fahrgeschäfte', n: 2, get: M => M.rides, c: 40, s: 1 },
    { id: 'eimer', icon: '🗑️', title: 'Sauberes Fest', text: 'Stelle 2 Mülleimer auf', n: 2, get: M => M.bins, c: 30, s: 0 },
    { id: 'muell', icon: '🧹', title: 'Müllsammler', text: 'Sammle 5 Müllstücke ein', n: 5, get: (M, s) => s.st.litter, c: 30, s: 1 },
    { id: 'popcorn', icon: '🍿', title: 'Popcorn-Duft', text: 'Eröffne einen Popcorn-Stand', n: 1, get: M => M.kinds.popcorn || 0, c: 35, s: 0 },
    { id: 'wc', icon: '🚻', title: 'Stilles Örtchen', text: 'Baue eine Toilette', n: 1, get: M => M.wc, c: 40, s: 0 },
    { id: 'deko', icon: '🌳', title: 'Grüne Oase', text: 'Stelle 5 Deko-Teile auf', n: 5, get: M => M.decoN, c: 50, s: 1 },
    { id: 'forsch', icon: '🔬', title: 'Forscherdrang', text: 'Erforsche 2 Neuheiten', n: 2, get: (M, s) => s.res.length, c: 60, s: 0 },
    { id: 'drei', icon: '🌟', title: 'Drei Sterne', text: 'Erreiche 3 Sterne Parkbewertung', n: 60, get: M => M.rating, c: 100, s: 2, pct: true },
    { id: 'rad', icon: '🎡', title: 'Riesenrad-Stolz', text: 'Baue ein Riesenrad', n: 1, get: M => M.kinds.ferris || 0, c: 150, s: 2 },
    { id: 'tausend', icon: '🪙', title: 'Tausender', text: 'Verdiene insgesamt 1000 🪙', n: 1000, get: (M, s) => Math.floor(s.earned), c: 200, s: 3 },
    { id: 'bahn', icon: '🎢', title: 'Achterbahn-Boss', text: 'Baue eine Achterbahn', n: 1, get: M => M.kinds.coaster || 0, c: 250, s: 3 },
    { id: 'direktor', icon: '👑', title: 'Parkdirektor', text: '5 Sterne Bewertung und 4 Fahrgeschäfte', n: 1, get: M => (M.rating >= 90 && M.rides >= 4) ? 1 : 0, c: 400, s: 20, big: true }
  ]
};

BI.createTycoon = function (G) {
  const { scene, W, A, fx, P, say, save, persist, park } = G, T = BI.TYCOON, CAT = T.CAT, PK = BI.PARK, RIDES = BI.PARK_RIDES, TAU = BI.TAU || Math.PI * 2, GR = T.GRID;
  const $ = id => document.getElementById(id), K = { open: false, building: false, mode: 'place', sel: '', tab: 0, otab: 0 };
  const mat = BI.mat(), gmat = park.ghostMat, snd = n => { try { A[n] && A[n](); } catch (e) { } };
  const fpOf = k => (CAT[k] && CAT[k].fp) || (RIDES[k] && RIDES[k].fp), isRide = k => !!RIDES[k], rnd = Math.random;
  const el = (t, c, txt) => { const e = document.createElement(t); if (c) e.className = c; if (txt != null) e.textContent = txt; return e; };

  /* ===================== Spielstand ===================== */
  const fresh = () => ({ v: 1, coins: 220, earned: 0, nid: 3, items: [{ id: 1, k: 'carousel', x: 262, z: 44 }, { id: 2, k: 'icecream', x: 278, z: 38 }], paths: [137, 16, 137, 17, 137, 18, 137, 19, 137, 20, 138, 17, 139, 17], res: [], mis: [], st: { litter: 0, rides: 0 }, medal: false });
  function S() { let s = save.tycoon; if (!s || s.v !== 1) s = save.tycoon = fresh(); return s; }
  /* Spielstand prüfen (kaputte oder fremde Daten abfangen) */
  (function sane() {
    const s = S(); s.coins = Number.isFinite(s.coins) ? Math.max(0, s.coins) : 0; s.earned = Number.isFinite(s.earned) ? Math.max(0, s.earned) : 0;
    s.items = (Array.isArray(s.items) ? s.items : []).filter(i => i && CAT[i.k] && CAT[i.k].t !== 'path' && Number.isFinite(i.x) && Number.isFinite(i.z)).slice(0, 400);
    let mx = 0; for (const i of s.items) { i.id = i.id | 0; if (i.id > mx) mx = i.id; } const seen = new Set(); for (const i of s.items) { if (!i.id || seen.has(i.id)) i.id = ++mx; seen.add(i.id); } s.nid = Math.max(s.nid | 0, mx + 1);
    s.paths = (Array.isArray(s.paths) ? s.paths : []).filter(Number.isFinite).map(n => n | 0); if (s.paths.length % 2) s.paths.pop(); if (s.paths.length > 1600) s.paths.length = 1600;
    s.res = (Array.isArray(s.res) ? s.res : []).filter(r => T.RES.some(q => q.id === r)); s.mis = (Array.isArray(s.mis) ? s.mis : []).filter(m => T.MIS.some(q => q.id === m));
    s.st = s.st && typeof s.st === 'object' ? s.st : { litter: 0, rides: 0 }; s.st.litter = s.st.litter | 0; s.st.rides = s.st.rides | 0;
  })();
  let saveDirty = false, saveT = 0; const mark = () => { saveDirty = true; };
  const flush = () => { if (saveDirty) { saveDirty = false; persist(); } };

  /* ===================== Raster, Wege, Verbindung ===================== */
  const key = (ix, iz) => (ix + 512) * 1024 + (iz + 512);
  const pset = new Set(); for (let i = 0; i < S().paths.length; i += 2) pset.add(key(S().paths[i], S().paths[i + 1]));
  const savePaths = () => { const a = []; for (const k of pset) a.push(Math.floor(k / 1024) - 512, (k % 1024) - 512); S().paths = a; mark(); };
  const snap = v => Math.round(v / GR) * GR;
  const ov = (a, b, m) => a[0] < b[2] + m && a[2] > b[0] - m && a[1] < b[3] + m && a[3] > b[1] - m;
  /* feste Sperrflächen: Platz mit Brunnen, Eingangs-Promenade, Bänke, Autoscooter, Park-Büro */
  const PLAZA = 13.5, KEEP = [[230, 15, 275, 25], [268.7, 13.4, 271.3, 14.6], [294.7, 13.4, 297.3, 14.6], [268.7, 25.4, 271.3, 26.6], [294.7, 25.4, 297.3, 26.6],
    [PK.arena.x0 - 2.5, PK.arena.z0 - 2.5, PK.arena.x1 + 2.5, PK.arena.z1 + 2.5], [PK.office.x - 9, PK.office.z - 3, PK.office.x + 5, PK.office.z + 6.4]];
  const circRect = (cx, cz, r, b) => { const nx = Math.max(b[0], Math.min(cx, b[2])), nz = Math.max(b[1], Math.min(cz, b[3])); return Math.hypot(nx - cx, nz - cz) < r; };
  const inDisc = b => [[b[0], b[1]], [b[2], b[1]], [b[0], b[3]], [b[2], b[3]]].every(c => Math.hypot(c[0] - PK.x, c[1] - PK.z) <= T.MAXD);
  const blocked = b => circRect(PK.x, PK.z, PLAZA, b) || KEEP.some(k => ov(b, k, 0));
  /* gespeicherte Wegstücke prüfen: nur im Park, nicht auf gesperrten Flächen (kaputte Spielstände) */
  { const bad = []; for (const k of pset) { const ix = Math.floor(k / 1024) - 512, iz = (k % 1024) - 512, f = [ix * GR - GR / 2, iz * GR - GR / 2, ix * GR + GR / 2, iz * GR + GR / 2]; if (!inDisc(f) || blocked(f)) bad.push(k); } for (const k of bad) pset.delete(k); if (bad.length) savePaths(); }
  const itemFp = it => { const f = fpOf(it.k); return [it.x + f[0], it.z + f[1], it.x + f[2], it.z + f[3]]; };
  const tileFp = (ix, iz) => [ix * GR - GR / 2, iz * GR - GR / 2, ix * GR + GR / 2, iz * GR + GR / 2];
  const isRoot = (ix, iz) => { const x = ix * GR, z = iz * GR; if (circRect(PK.x, PK.z, 15, tileFp(ix, iz))) return true; /* grenzt an den Platz am Brunnen */ return x + 1 >= 229.9 && x - 1 <= 275.1 && z + 1 >= 14.9 && z - 1 <= 25.1 && !ov(tileFp(ix, iz), KEEP[0], 0); };
  let conn = new Set(), connList = [], rootList = [], dirtyConn = true;
  function rebuildConn() {
    conn = new Set(); connList = []; rootList = []; const q = [];
    for (const k of pset) { const ix = Math.floor(k / 1024) - 512, iz = (k % 1024) - 512; if (isRoot(ix, iz)) { conn.add(k); q.push([ix, iz]); } }
    for (let h = 0; h < q.length; h++) { const [ix, iz] = q[h]; for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = key(ix + dx, iz + dz); if (pset.has(k) && !conn.has(k)) { conn.add(k); q.push([ix + dx, iz + dz]); } } }
    for (const [ix, iz] of q) { const t = { ix, iz, x: ix * GR, z: iz * GR }; connList.push(t); if (isRoot(ix, iz)) rootList.push(t); }
    dirtyConn = false;
  }
  const anyTile = f => { for (const t of connList) if (f(t)) return true; return false; };
  /* Ist die Bude / das Fahrgeschäft von einem Weg aus erreichbar, der zum Platz führt? */
  function reach(it) {
    const c = CAT[it.k];
    if (c.t === 'shop') { const fz = it.z + (it.z < PK.z ? 2.6 : -2.6); return anyTile(t => Math.hypot(t.x - it.x, t.z - fz) <= 3.1); }
    if (it.k === 'carousel') return anyTile(t => { const d = Math.hypot(t.x - it.x, t.z - it.z); return d >= 8.8 && d <= 13.6; });
    if (it.k === 'chain') return anyTile(t => { const d = Math.hypot(t.x - it.x, t.z - it.z); return d >= 8.2 && d <= 13.2; });
    if (it.k === 'ferris') return anyTile(t => Math.hypot(t.x - it.x, t.z - (it.z + 4.6)) <= 4.0);
    if (it.k === 'coaster') return anyTile(t => Math.hypot(t.x - (it.x - 13.6), t.z - (it.z + 6.8)) <= 8.0);
    return true;
  }

  /* ===================== Platzieren: darf hier etwas stehen? ===================== */
  const count = k => S().items.filter(i => i.k === k).length;
  const unlocked = k => !CAT[k].res || S().res.includes(CAT[k].res);
  function why(k, x, z, ignoreId) {
    const c = CAT[k], s = S();
    if (c.t === 'path') {
      const ix = Math.round(x / GR), iz = Math.round(z / GR), f = tileFp(ix, iz); if (!inDisc(f)) return 'Das ist schon außerhalb des Parks';
      if (pset.has(key(ix, iz))) return 'Hier liegt schon ein Weg'; if (blocked(f)) return 'Hier muss der Weg frei bleiben';
      for (const it of s.items) if (it.id !== ignoreId && !CAT[it.k].small && ov(f, itemFp(it), 0.05)) return 'Da steht schon etwas'; return '';
    }
    const f = fpOf(k), b = [x + f[0], z + f[1], x + f[2], z + f[3]];
    if (!inDisc(b)) return 'Das ist schon außerhalb des Parks'; if (blocked(b)) return 'Der Eingangsbereich muss frei bleiben';
    for (const it of s.items) if (it.id !== ignoreId && ov(b, itemFp(it), c.small && CAT[it.k].small ? 0 : .5)) return 'Da steht schon etwas';
    if (!c.small) for (const key2 of pset) { const ix = Math.floor(key2 / 1024) - 512, iz = (key2 % 1024) - 512; if (ov(b, tileFp(ix, iz), .05)) return 'Da liegt ein Weg im Weg'; }
    return '';
  }

  /* ===================== Welt-Objekte der Bauteile ===================== */
  const RT = new Map(); // id → { R | cols }
  let dirtyStatic = true, stMesh = null, stT = 0;
  const sg = it => it.z < PK.z ? 1 : -1;
  /* feste Teile zeichnen (absolut um it.x / it.z) – wird beim Bauen in den Sammel-Mesh geschrieben */
  function drawProp(b, it) {
    const c = CAT[it.k], x = it.x, z = it.z;
    if (c.t === 'shop') { const g = sg(it); b.box(x, 0, z, 3.2, 1.1, 2.2, 0xfff0c0); for (let i = 0; i < 8; i++) b.box(x - 1.4 + i * .4, 2.3, z, .4, .12, 2.8, i % 2 ? 0xffffff : c.c, 0, .35 * g); b.box(x - 1.5, 0, z - g, .12, 2.4, .12, 0xdddddd); b.box(x + 1.5, 0, z - g, .12, 2.4, .12, 0xdddddd); b.sph(x, 2.9, z, .5, c.c, 1); b.box(x, 1.1, z + g * 1.05, 2.4, .1, .35, 0xc8803c); }
    else if (it.k === 'wc') { b.box(x, 0, z, 3.0, 2.6, 3.0, 0x9fc6e8); b.box(x, 2.6, z, 3.3, .25, 3.3, 0x4d86c8); b.box(x, 0, z + 1.52, .9, 1.9, .08, 0x8a5a33); b.box(x, 2.0, z + 1.56, .9, .5, .05, 0xffffff); b.sph(x, 3.3, z, .4, 0xffd23f, 1); }
    else if (it.k === 'bin') { b.cyl(x, 0, z, .36, .3, .8, 0x4cd07d, 8); b.cyl(x, .8, z, .4, .4, .08, 0x2f9b5c, 8); }
    else if (it.k === 'bench') { b.box(x, .4, z, 2, .12, .6, 0xc8803c); b.box(x, .52, z - .3, 2, .5, .12, 0xc8803c); b.box(x - .8, 0, z, .12, .4, .5, 0x555a66); b.box(x + .8, 0, z, .12, .4, .5, 0x555a66); }
    else if (it.k === 'tree') { b.cyl(x, 0, z, .2, .3, 2, 0x8a5a33, 6); b.sph(x, 3.2, z, 1.6, [0x4cb85a, 0x5ac966, 0x3fa84e][(Math.abs(x * 7 + z * 3) | 0) % 3], 1, 1, .95, 1); }
    else if (it.k === 'flowers') { b.box(x, 0, z, 2.4, .22, 2.4, 0x6b4a2a); for (let i = 0; i < 8; i++) { const a = i * 2.4, r = .3 + (i % 3) * .3, px = x + Math.sin(a) * r, pz = z + Math.cos(a) * r; b.cyl(px, .2, pz, .03, .03, .45, 0x3fa84e, 3); b.sph(px, .7, pz, .18, [0xff5a5a, 0xffd23f, 0xff8fc8, 0xb36bff][i % 4], 0); } }
    else if (it.k === 'lamp') { b.cyl(x, 0, z, .08, .1, 3.4, 0x555a66, 6); b.sph(x, 3.6, z, .34, 0xffe9a0, 1); }
    else if (it.k === 'fountain') { b.cyl(x, 0, z, 2.3, 2.4, .7, 0xcfd6e2, 16); b.cyl(x, .65, z, 2, 2, .1, 0x57c4ff, 16); b.cyl(x, .5, z, .35, .5, 2.2, 0xff8fc8, 8); b.cyl(x, 2.6, z, .9, .35, .25, 0xcfd6e2, 10); for (let i = 0; i < 4; i++) { const a = i / 4 * TAU; b.sph(x + Math.sin(a) * 1.2, 1.2, z + Math.cos(a) * 1.2, .22, 0x9fe3ff, 0); } }
  }
  function propCols(it) {
    const c = CAT[it.k], f = fpOf(it.k), out = [], x = it.x, z = it.z;
    if (c.t === 'shop') out.push(W.addBox(x - 1.7, z - 1.2, x + 1.7, z + 1.2, false, 3)); else if (it.k === 'wc') out.push(W.addBox(x - 1.5, z - 1.5, x + 1.5, z + 1.5, false, 3));
    else if (it.k === 'bin') out.push(W.addCircle(x, z, .38, false, 1)); else if (it.k === 'bench') out.push(W.addBox(x - 1, z - .3, x + 1, z + .3, false, .8)); else if (it.k === 'tree') out.push(W.addCircle(x, z, .5, false, 3));
    else if (it.k === 'lamp') out.push(W.addCircle(x, z, .15, false, 3)); else if (it.k === 'fountain') out.push(W.addCircle(x, z, 2.4, false, 1.4));
    return out;
  }
  function addWorld(it) {
    if (isRide(it.k)) { const R = park.addRide(it.k, it.x, it.z); RT.set(it.id, { R }); } else { RT.set(it.id, { cols: propCols(it) }); dirtyStatic = true; }
    dirtyConn = true;
  }
  function removeWorld(it) {
    const r = RT.get(it.id); RT.delete(it.id); if (!r) return;
    if (r.R) park.removeRide(r.R); else { for (const c of r.cols) W.removeCollider(c); dirtyStatic = true; }
    dirtyConn = true;
  }
  /* Sammel-Mesh: Wege + alle festen Bauteile (+ Warnschild an Dingen ohne Weg) */
  function rebuildStatic() {
    const b = new BI.Batch(), s = S();
    for (const k of pset) { const ix = Math.floor(k / 1024) - 512, iz = (k % 1024) - 512, f = tileFp(ix, iz); b.rect(f[0], f[1], f[2], f[3], .075, (ix + iz) & 1 ? 0xf1e4c8 : 0xe6d3a8); b.rect(f[0] + .08, f[1] + .08, f[0] + .35, f[1] + .35, .09, 0xd8c08c); }
    for (const it of s.items) if (!isRide(it.k)) drawProp(b, it);
    if (stMesh) { scene.remove(stMesh); stMesh.geometry.dispose(); stMesh = null; } if (!b.empty) { stMesh = b.mesh(mat); scene.add(stMesh); } dirtyStatic = false;
  }

  /* ===================== Bewertung, Einnahmen ===================== */
  let M = { paths: 0, rides: 0, ridesC: 0, shops: 0, shopsC: 0, bins: 0, wc: 0, deco: 0, decoN: 0, kinds: {}, rating: 0, raw: 0, incMin: 0, variety: 0, clean: 1, comfort: 0, beauty: 0, guests: 0, off: [] };
  const litter = []; // { ix, iz, x, z, c }
  function calc() {
    if (dirtyConn) rebuildConn(); const s = S(); const m = { paths: pset.size, rides: 0, ridesC: 0, shops: 0, shopsC: 0, bins: 0, wc: 0, deco: 0, decoN: 0, kinds: {}, raw: 0, off: [] }, kc = new Set();
    for (const it of s.items) {
      const c = CAT[it.k]; m.kinds[it.k] = (m.kinds[it.k] || 0) + 1;
      if (c.t === 'ride' || c.t === 'shop') { const ok = reach(it); if (c.t === 'ride') { m.rides++; if (ok) { m.ridesC++; kc.add(it.k); } } else { m.shops++; if (ok) m.shopsC++; } if (ok) m.raw += c.inc; else m.off.push(it); }
      else if (it.k === 'wc') m.wc++; else if (it.k === 'bin') m.bins++; else if (c.t === 'deco') { m.deco += c.b || 1; m.decoN++; }
    }
    m.variety = Math.min(1, (kc.size * 2 + m.ridesC + m.shopsC * .5) / 8);
    const need = Math.ceil((m.rides + m.shops) / 3); m.comfort = need ? Math.min(1, (m.wc + m.bins * .5) / need) : 0;
    m.clean = 1 - Math.min(1, litter.length / 14); m.beauty = Math.min(1, m.deco / 8);
    m.rating = Math.round(100 * (.35 * m.variety + .25 * m.clean + .2 * m.comfort + .2 * m.beauty));
    m.incMin = m.raw * (.4 + .8 * m.rating / 100) * (s.res.includes('tickets') ? 1.2 : 1);
    m.guests = connList.length ? Math.max(0, Math.min(T.MAXG, Math.round(m.incMin / 9))) : 0;
    M = m; return m;
  }
  K.model = () => M; K.stars = () => Math.max(0, Math.min(5, Math.round(M.rating / 20)));
  const starStr = n => '⭐'.repeat(n) + '☆'.repeat(5 - n);

  /* ===================== Müll ===================== */
  const LMAX = T.LCAP;
  const litGeo = (() => { const b = new BI.Batch(); b.box(0, 0, 0, .34, .14, .26, 0xffffff, .5); b.box(.12, .14, .04, .18, .12, .18, 0xffffff, 1.1); return b.mesh(mat).geometry; })();
  const litMesh = new THREE.InstancedMesh(litGeo, mat, LMAX); litMesh.frustumCulled = false; litMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(litMesh);
  { const cc = new THREE.Color(), LC = [0xe0382b, 0x4da3ff, 0xffd23f, 0xb36bff, 0x8a5a33, 0xffffff]; for (let i = 0; i < LMAX; i++) litMesh.setColorAt(i, cc.setHex(LC[i % LC.length])); } litMesh.count = 0; /* count erst NACH setColorAt (three r128 legt den Farbpuffer mit count an) */
  const _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(1, 1, 1), _e = new THREE.Euler(), _Y = new THREE.Vector3(0, 1, 0);
  function drawLitter() { litMesh.count = litter.length; for (let i = 0; i < litter.length; i++) { const l = litter[i]; _p.set(l.x, .09, l.z); _q.setFromAxisAngle(_Y, l.a); _m.compose(_p, _q, _s); litMesh.setMatrixAt(i, _m); } litMesh.instanceMatrix.needsUpdate = true; }
  function spawnLitter() {
    if (litter.length >= LMAX || !connList.length) return; const t = connList[(rnd() * connList.length) | 0];
    litter.push({ ix: t.ix, iz: t.iz, x: t.x + (rnd() - .5) * 1.4, z: t.z + (rnd() - .5) * 1.4, a: rnd() * TAU }); drawLitter();
  }
  function pickLitter(i, byPlayer) {
    litter.splice(i, 1); drawLitter(); const s = S();
    if (byPlayer) { s.st.litter++; s.coins += 1; snd('pop'); fx.burst(P.x, .6, P.z, 6, [BI.C.white, BI.C.gold], 2, .6, 24, 3); mark(); checkMis(); }
  }
  /* Müll auf einem entfernten Weg verschwindet mit */
  const dropLitterOff = () => { let ch = false; for (let i = litter.length - 1; i >= 0; i--) if (!conn.has(key(litter[i].ix, litter[i].iz))) { litter.splice(i, 1); ch = true; } if (ch) drawLitter(); };

  /* ===================== Gäste (kleine bunte Figuren, laufen nur auf Wegen) ===================== */
  const MAXG = T.MAXG;
  const gBody = (() => { const b = new BI.Batch(); b.cyl(0, 0, 0, .26, .32, .95, 0xffffff, 6); return b.mesh(mat).geometry; })();
  const gHead = (() => { const b = new BI.Batch(); b.sph(0, 1.25, 0, .3, 0xffd2a8, 1); return b.mesh(mat).geometry; })();
  const gbm = new THREE.InstancedMesh(gBody, mat, MAXG), ghm = new THREE.InstancedMesh(gHead, mat, MAXG);
  for (const m of [gbm, ghm]) { m.frustumCulled = false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(m); }
  { const cc = new THREE.Color(), GC = [0xff5a5a, 0x4da3ff, 0xffd23f, 0x4cd07d, 0xb36bff, 0xff8fc8, 0xff8a1f, 0x7de0d0]; for (let i = 0; i < MAXG; i++) { gbm.setColorAt(i, cc.setHex(GC[i % GC.length])); ghm.setColorAt(i, cc.setHex(0xffffff)); } } /* beide brauchen Instanzfarben (three r128: gleiches Material, sonst Absturz) */
  gbm.count = ghm.count = 0;
  const guests = [];
  function newGuest() {
    if (!rootList.length) return null; const t = rootList[(rnd() * rootList.length) | 0];
    return { ix: t.ix, iz: t.iz, nx: t.ix, nz: t.iz, px: t.ix, pz: t.iz, f: 1, spd: 1.3 + rnd() * .8, life: 40 + rnd() * 70, ox: (rnd() - .5) * .9, oz: (rnd() - .5) * .9, yaw: rnd() * TAU, ph: rnd() * 6 };
  }
  const NB = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  function stepGuest(g, dt) {
    g.life -= dt; if (g.life <= 0 || !conn.has(key(g.ix, g.iz))) return false;
    if (g.f >= 1) {
      g.px = g.ix; g.pz = g.iz; g.ix = g.nx; g.iz = g.nz; if (!conn.has(key(g.ix, g.iz))) return false;
      const opts = NB.filter(d => conn.has(key(g.ix + d[0], g.iz + d[1]))); const fwd = opts.filter(d => !(g.ix + d[0] === g.px && g.iz + d[1] === g.pz)); const use = fwd.length ? fwd : opts;
      if (use.length) { const d = use[(rnd() * use.length) | 0]; g.nx = g.ix + d[0]; g.nz = g.iz + d[1]; g.f = 0; g.yaw = Math.atan2(d[0], d[1]); } else g.f = 1;
    }
    if (g.f < 1) g.f = Math.min(1, g.f + dt * g.spd / GR); return true;
  }
  function updateGuests(dt, t, show) {
    const want = show ? M.guests : 0;
    while (guests.length < want) { const g = newGuest(); if (!g) break; guests.push(g); }
    while (guests.length > want) guests.pop();
    for (let i = guests.length - 1; i >= 0; i--) if (!stepGuest(guests[i], dt)) { const g = newGuest(); if (g) guests[i] = g; else guests.splice(i, 1); }
    gbm.count = ghm.count = guests.length;
    for (let i = 0; i < guests.length; i++) {
      const g = guests[i], x = BI.lerp(g.ix, g.nx, g.f) * GR + g.ox, z = BI.lerp(g.iz, g.nz, g.f) * GR + g.oz, bob = Math.abs(Math.sin(t * 7 + g.ph)) * .06;
      _p.set(x, bob, z); _q.setFromAxisAngle(_Y, g.yaw); _m.compose(_p, _q, _s); gbm.setMatrixAt(i, _m); ghm.setMatrixAt(i, _m);
    }
    gbm.instanceMatrix.needsUpdate = ghm.instanceMatrix.needsUpdate = true; gbm.visible = ghm.visible = Math.hypot(P.x - BI.PARK.x, P.z - BI.PARK.z) < 220; /* Gäste nur in Parknähe zeichnen */
  }

  /* ===================== Bauen, Verschieben, Verkaufen ===================== */
  const refund = k => Math.floor(CAT[k].cost * .6);
  function place(k, x, z, free) {
    const c = CAT[k], s = S();
    if (!unlocked(k)) { say('🔒 Das musst du erst im Park-Büro erforschen', 2400); return false; }
    if (c.max && count(k) >= c.max && c.t !== 'path') { say('Mehr als ' + c.max + ' davon passen nicht in den Park 😊', 2200); return false; }
    const w = why(k, x, z); if (w) { say(w + ' 🚫', 1800); return false; }
    if (!free && s.coins < c.cost) { say('Dafür fehlen dir ' + Math.ceil(c.cost - s.coins) + ' 🪙', 2000); return false; }
    if (!free) s.coins -= c.cost;
    if (c.t === 'path') { const ix = Math.round(x / GR), iz = Math.round(z / GR); pset.add(key(ix, iz)); savePaths(); dirtyStatic = true; dirtyConn = true; }
    else { const it = { id: s.nid++, k, x, z }; s.items.push(it); addWorld(it); }
    if (c.t !== 'path') { snd('place'); fx.burst(x, 1.2, z, 12, [BI.C.gold, BI.C.white, BI.C.pink], 3, .8, 26, 4); } else if (!K.autoSnd || performance.now() - K.autoSnd > 200) { K.autoSnd = performance.now(); snd('place'); }
    mark(); if (!s.st.built) { s.st.built = 1; G.earn('tybuild'); } calc(); checkMis(); if (c.t !== 'path') flush(); return true;
  }
  function sell(it) {
    const s = S(); removeWorld(it); s.items.splice(s.items.indexOf(it), 1); const r = refund(it.k); s.coins += r; snd('pop'); fx.burst(it.x, 1.2, it.z, 10, [BI.C.dust, BI.C.white], 3, .8, 26, 4); mark(); calc(); dropLitterOff(); flush(); say(CAT[it.k].icon + ' ' + CAT[it.k].name + ' verkauft: +' + r + ' 🪙', 2200);
  }
  function sellTile(ix, iz) { pset.delete(key(ix, iz)); savePaths(); dirtyStatic = true; dirtyConn = true; S().coins += 1; snd('pop'); calc(); dropLitterOff(); flush(); }

  /* Vorschau-Teile (durchsichtig) */
  const propGhost = {};
  function ghostRoot(k) {
    if (isRide(k)) { const R = park.ghost(k); return R ? R.root : null; }
    if (CAT[k].t === 'path') return null;
    let g = propGhost[k]; if (!g) { const b = new BI.Batch(); drawProp(b, { k, x: 0, z: 0 }); g = propGhost[k] = new THREE.Group(); g.add(b.mesh(gmat)); g.visible = false; scene.add(g); } return g;
  }
  const cur = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0x66ff99, transparent: true, opacity: .38, depthWrite: false, side: THREE.DoubleSide })); cur.rotation.x = -Math.PI / 2; cur.visible = false; scene.add(cur);
  let shown = null, moving = null, pick = null, aimed = { x: 0, z: 0, ok: false, reason: '' }, armSell = null, autoCell = '';
  const hideGhost = () => { if (shown) { shown.visible = false; shown = null; } cur.visible = false; };
  const setCur = (b, ok, col) => { cur.scale.set(b[2] - b[0], b[3] - b[1], 1); cur.position.set((b[0] + b[2]) / 2, .12, (b[1] + b[3]) / 2); cur.material.color.setHex(col != null ? col : ok ? 0x66ff99 : 0xff5a5a); cur.visible = true; };
  function dirv() { return [Math.sin(P.h), Math.cos(P.h)]; }
  /* Zielpunkt vor der Spielfigur (Mittelpunkt der Grundfläche), auf das Raster gelegt */
  function aim(k) {
    const f = fpOf(k) || [-1, -1, 1, 1], d = dirv(), hx = (f[2] - f[0]) / 2, hz = (f[3] - f[1]) / 2, ox = (f[0] + f[2]) / 2, oz = (f[1] + f[3]) / 2, along = Math.abs(d[0]) * hx + Math.abs(d[1]) * hz, dist = Math.min(20, along + 2.6);
    return { x: snap(P.x + d[0] * dist - ox), z: snap(P.z + d[1] * dist - oz) };
  }
  function pickAt() {
    const d = dirv(), gx = P.x + d[0] * 3, gz = P.z + d[1] * 3; let best = null, bd = 1e9;
    for (const it of S().items) { const b = itemFp(it), inside = gx >= b[0] - .6 && gx <= b[2] + .6 && gz >= b[1] - .6 && gz <= b[3] + .6, dd = inside ? 0 : Math.hypot(gx - (b[0] + b[2]) / 2, gz - (b[1] + b[3]) / 2) - 4; if (dd < bd && (inside || dd < 2)) { bd = dd; best = it; } }
    return best ? { it: best } : { tile: [Math.round(gx / GR), Math.round(gz / GR)] };
  }
  function updateBuild(dt) {
    const k = moving ? moving.k : K.sel, s = S();
    if (!CAT[k] && !moving && K.mode === 'place') { hideGhost(); aimed = { x: 0, z: 0, ok: false, reason: '' }; return; }
    if (K.mode === 'place' || moving) {
      if (CAT[k] && CAT[k].t === 'path') {
        const a = aim(k), ix = Math.round(a.x / GR), iz = Math.round(a.z / GR), w = why(k, ix * GR, iz * GR); aimed = { x: ix * GR, z: iz * GR, ok: !w && s.coins >= CAT[k].cost, reason: w };
        hideGhost(); setCur(tileFp(ix, iz), aimed.ok); const c2 = ix + ',' + iz; if (aimed.ok && c2 !== autoCell) { autoCell = c2; place('path', ix * GR, iz * GR); } else if (!aimed.ok && w !== 'Hier liegt schon ein Weg') autoCell = c2; return;
      }
      const a = aim(k), w = why(k, a.x, a.z, moving && moving.id), afford = moving || s.coins >= CAT[k].cost, ok = !w && afford && unlocked(k); aimed = { x: a.x, z: a.z, ok, reason: w || (!unlocked(k) ? 'Noch nicht erforscht 🔒' : !afford ? 'Zu wenig Münzen' : '') };
      const g = ghostRoot(k); if (shown && shown !== g) shown.visible = false; shown = g; if (g) { g.position.set(a.x, 0, a.z); g.visible = true; gmat.color.setHex(ok ? 0xffffff : 0xff9a9a); gmat.emissive.setHex(ok ? 0x103818 : 0x601010); }
      const f = fpOf(k); setCur([a.x + f[0], a.z + f[1], a.x + f[2], a.z + f[3]], ok);
    } else {
      hideGhost(); pick = pickAt();
      if (pick.it) setCur(itemFp(pick.it), true, K.mode === 'sell' ? 0xff9f1a : 0x4da3ff); else if (K.mode === 'sell' && pset.has(key(pick.tile[0], pick.tile[1]))) setCur(tileFp(pick.tile[0], pick.tile[1]), true, 0xff9f1a); else cur.visible = false;
    }
  }
  /* Hauptknopf im Baumodus */
  function buildAct() {
    if (moving) { const a = aim(moving.k), w = why(moving.k, a.x, a.z, moving.id); if (w) { say(w + ' 🚫', 1800); return; } const it = { id: moving.id, k: moving.k, x: a.x, z: a.z }; S().items.push(it); addWorld(it); moving = null; snd('place'); fx.burst(a.x, 1.2, a.z, 10, [BI.C.gold, BI.C.white], 3, .8, 26, 4); mark(); calc(); flush(); renderBuild(true); return; }
    if (K.mode === 'place') { if (!CAT[K.sel]) { say('Wähle unten zuerst etwas zum Bauen aus 👇', 2000); return; } if (CAT[K.sel].t === 'path') { say('Lauf einfach los – der Weg legt sich vor dir 🟫', 2200); return; } place(K.sel, aimed.x, aimed.z); renderBuild(true); return; }
    if (!pick) return;
    if (K.mode === 'move') { if (!pick.it) { say('Wege kann man nur verkaufen, nicht verschieben', 2000); return; } const it = pick.it; removeWorld(it); S().items.splice(S().items.indexOf(it), 1); moving = { id: it.id, k: it.k, from: { x: it.x, z: it.z } }; calc(); say('↔️ ' + CAT[it.k].icon + ' aufgenommen – lauf zum neuen Platz und drück „Hier abstellen“', 3200); snd('pop'); renderBuild(true); return; }
    if (K.mode === 'sell') {
      const id = pick.it ? 'i' + pick.it.id : 't' + pick.tile.join(','), now = performance.now();
      if (!armSell || armSell.id !== id || now - armSell.t > 4000) { armSell = { id, t: now }; say(pick.it ? '🗑️ ' + CAT[pick.it.k].name + ' verkaufen (+' + refund(pick.it.k) + ' 🪙)? Nochmal drücken!' : '🗑️ Weg entfernen? Nochmal drücken!', 3000); return; }
      armSell = null; if (pick.it) sell(pick.it); else sellTile(pick.tile[0], pick.tile[1]); pick = null; renderBuild(true);
    }
  }
  function cancelMove() { if (!moving) return; const it = { id: moving.id, k: moving.k, x: moving.from.x, z: moving.from.z }; S().items.push(it); addWorld(it); moving = null; calc(); mark(); flush(); }
  K.build = function (on) {
    if (on === K.building) return; K.building = on; park.noRide = on;
    if (on) { K.close(); K.sel = ''; K.mode = 'place'; panel.hidden = false; chip.hidden = true; G.setStick(0, 0); cur.visible = false; autoCell = ''; renderBuild(true); say('🔨 Bau-Modus: wähle unten etwas aus und lauf an die richtige Stelle. Wege legen sich beim Laufen!', 4200); }
    else { cancelMove(); hideGhost(); park.clearGhosts(); panel.hidden = true; pick = null; armSell = null; flush(); G.updateButtons(true); }
  };

  /* ===================== Forschung ===================== */
  function research(id) {
    const s = S(), r = T.RES.find(q => q.id === id); if (!r || s.res.includes(id)) return false;
    if (r.need && !s.res.includes(r.need)) { say('Erst „' + T.RES.find(q => q.id === r.need).name + '“ erforschen', 2200); return false; }
    if (s.coins < r.cost) { say('Dafür fehlen dir ' + Math.ceil(r.cost - s.coins) + ' 🪙', 2000); return false; }
    s.coins -= r.cost; s.res.push(id); mark(); snd('ding'); fx.burst(P.x, 2, P.z, 18, [BI.C.gold, BI.C.white, BI.C.blue], 4, 1, 28, 5); say('🔬 Erforscht: ' + r.icon + ' ' + r.name + '!', 3000); calc(); checkMis(); flush(); renderOffice(); return true;
  }

  /* ===================== Missionen ===================== */
  let boardSig = '';
  function checkMis() {
    const s = S(); let any = false;
    for (const m of T.MIS) {
      if (s.mis.includes(m.id)) continue; if (m.get(M, s) < m.n) continue;
      s.mis.push(m.id); any = true; s.coins += m.c; if (m.s) G.addStars(m.s); snd('fanfare'); fx.burst(P.x, 2.4, P.z, 30, [BI.C.gold, BI.C.pink, BI.C.white, BI.C.blue], 6, 1.4, 28, 5);
      say('📋 Park-Mission geschafft: ' + m.icon + ' ' + m.title + '! +' + m.c + ' 🪙' + (m.s ? ' +' + m.s + ' ⭐' : ''), 5200);
      G.earn('tymis'); if (m.id === 'direktor') { s.medal = true; G.earn('tydir'); }
    }
    if (M.rating >= 60 && M.rides >= 1) G.earn('tystar');
    if (any) { mark(); paintBoard(); flush(); if (K.open) renderOffice(); }
  }
  const nextMis = () => T.MIS.find(m => !S().mis.includes(m.id)) || null;

  /* ===================== Anzeigen: Info-Pille, Bau-Leiste, Büro, Tafel ===================== */
  (function css() {
    if (document.getElementById('bi-ty-css')) return; const st = document.createElement('style'); st.id = 'bi-ty-css';
    st.textContent = '.tyChip{position:absolute;left:50%;transform:translateX(-50%);bottom:64px;max-width:min(520px,calc(100% - 440px));display:flex;align-items:center;gap:8px;padding:6px 14px;border-radius:20px;font-weight:700;font-size:14px;line-height:1.25;z-index:6;cursor:pointer}.tyChip[hidden]{display:none}.tyChip small{font-weight:600;opacity:.85}'
      + '#tyBar{bottom:8px;width:min(560px,calc(100% - 440px));padding:8px 8px 8px}#tyBar .tyTabs{display:flex;gap:4px;justify-content:center;flex-wrap:wrap}#tyBar .tyTabs button,#tyBar .tyAct button{padding:4px 9px;border-radius:14px;font-weight:800;font-size:13px;background:#fff;color:#16335e;box-shadow:inset 0 -3px 0 rgba(0,0,0,.14);pointer-events:auto}#tyBar .tyTabs button.sel,#tyBar .tyAct button.sel{background:linear-gradient(180deg,#ffb23f,#ff7a1f);color:#fff}'
      + '#tyBar .tyItems{display:flex;gap:6px;overflow-x:auto;padding:2px 2px 4px;justify-content:flex-start;-webkit-overflow-scrolling:touch}#tyBar .tyItems button{flex:none;display:flex;flex-direction:column;align-items:center;min-width:64px;padding:4px 6px;border-radius:14px;font-weight:800;font-size:11px;background:#fff;color:#16335e;box-shadow:inset 0 -3px 0 rgba(0,0,0,.14);pointer-events:auto}#tyBar .tyItems button span{font-size:22px;line-height:1.1}#tyBar .tyItems button.sel{outline:3px solid #ff9f1a}#tyBar .tyItems button.off{opacity:.45}'
      + '#tyBar .tyAct{display:flex;gap:6px;justify-content:center;flex-wrap:wrap}#tyBar .tyInfo{text-align:center;font-weight:700;font-size:12.5px;color:#16335e;min-height:17px}#tyBar.mini .tyTabs,#tyBar.mini .tyItems,#tyBar.mini .tyInfo{display:none}'
      + '.tyRow{display:flex;align-items:center;gap:10px;margin:6px 0;padding:8px 10px;border-radius:16px;background:rgba(255,255,255,.55);text-align:left}.tyRow.ok{opacity:.75}.tyRow b{display:block}.tyRow small{display:block;opacity:.8}.tyRow .ic{font-size:26px}.tyRow .fl{flex:1}.tyBarB{height:10px;border-radius:99px;background:rgba(0,0,0,.12);overflow:hidden;margin-top:3px}.tyBarB i{display:block;height:100%;background:linear-gradient(90deg,#4cd07d,#ffd23f)}'
      + '@media (orientation:portrait){.tyChip{bottom:25vh;max-width:calc(100% - 24px)}#tyBar{bottom:25vh;width:calc(100% - 24px)}}';
    document.head.appendChild(st);
  })();
  BI.injectHudCss();
  const host = (document.getElementById('mission') || {}).parentNode || document.body;
  const chip = el('div', 'chip tyChip'); chip.hidden = true; host.appendChild(chip); chip.addEventListener('click', e => { e.stopPropagation(); K.show(); });
  const panel = el('div', 'pPanel'); panel.id = 'tyBar'; panel.hidden = true; host.appendChild(panel);
  let barSig = '';
  function renderBuild(force) {
    if (!K.building) return; const s = S(), sig = [K.tab, K.sel, K.mode, !!moving, Math.floor(s.coins), s.res.length, s.items.length, pset.size].join('|'); if (!force && sig === barSig) return; barSig = sig;
    panel.innerHTML = ''; const mini = panel.classList.contains('mini');
    const tabs = el('div', 'tyTabs'); T.TABS.forEach((t, i) => { const b = el('button', K.tab === i && K.mode === 'place' && !moving ? 'sel' : '', t[0] + ' ' + t[1]); b.onclick = e => { e.stopPropagation(); if (moving) return; K.tab = i; K.mode = 'place'; const first = Object.keys(CAT).find(q => CAT[q].tab === i); if (CAT[K.sel].tab !== i) K.sel = first; renderBuild(true); }; tabs.appendChild(b); });
    const items = el('div', 'tyItems');
    for (const k of Object.keys(CAT)) { const c = CAT[k]; if (c.tab !== K.tab) continue; const lock = !unlocked(k), b = el('button', (K.sel === k ? 'sel ' : '') + (lock || s.coins < c.cost ? 'off' : '')); b.innerHTML = '<span>' + (lock ? '🔒' : c.icon) + '</span>' + c.name + '<br>' + c.cost + ' 🪙'; b.onclick = e => { e.stopPropagation(); if (moving) return; K.sel = k; K.mode = 'place'; if (lock) say('🔒 Erst im Park-Büro erforschen: ' + T.RES.find(q => q.id === c.res).name, 2600); else say(c.icon + ' ' + c.name + ' – ' + c.info, 2600); renderBuild(true); }; items.appendChild(b); }
    const info = el('div', 'tyInfo'); info.id = 'tyInfo'; const act = el('div', 'tyAct');
    const mb = (lab, mode) => { const b = el('button', K.mode === mode && !moving ? 'sel' : '', lab); b.onclick = e => { e.stopPropagation(); if (moving) return; K.mode = mode; armSell = null; renderBuild(true); }; return b; };
    act.appendChild(mb('🔨 Bauen', 'place')); act.appendChild(mb('↔️ Verschieben', 'move')); act.appendChild(mb('🗑️ Verkaufen', 'sell'));
    { const b = el('button', '', '📋 Büro'); b.onclick = e => { e.stopPropagation(); K.show(); }; act.appendChild(b); }
    { const b = el('button', '', mini ? '▴ Mehr' : '▾ Klein'); b.onclick = e => { e.stopPropagation(); panel.classList.toggle('mini'); renderBuild(true); }; act.appendChild(b); }
    { const b = el('button', '', moving ? '↩ Zurückstellen' : '✔ Fertig'); b.onclick = e => { e.stopPropagation(); if (moving) { cancelMove(); renderBuild(true); } else K.build(false); }; act.appendChild(b); }
    panel.appendChild(tabs); panel.appendChild(items); panel.appendChild(info); panel.appendChild(act);
  }
  function infoLine() {
    const i = document.getElementById('tyInfo'); if (!i || !K.building) return; const c = moving ? CAT[moving.k] : (CAT[K.sel] || null); let t;
    if (moving) t = '↔️ ' + c.icon + ' ' + c.name + ' – ' + (aimed.reason ? aimed.reason + ' 🚫' : 'Hier abstellen ✔');
    else if (K.mode === 'move') t = pick && pick.it ? '↔️ ' + CAT[pick.it.k].icon + ' ' + CAT[pick.it.k].name + ' aufnehmen (Knopf)' : '↔️ Stell dich vor ein Teil, das du verschieben willst';
    else if (K.mode === 'sell') t = pick && pick.it ? '🗑️ ' + CAT[pick.it.k].name + ' verkaufen: +' + refund(pick.it.k) + ' 🪙' : pick && pset.has(key(pick.tile[0], pick.tile[1])) ? '🗑️ Weg entfernen: +1 🪙' : '🗑️ Stell dich vor ein Teil, das du verkaufen willst';
    else if (!c) t = 'Wähle etwas zum Bauen aus 👇'; else t = c.icon + ' ' + c.name + ' · ' + c.cost + ' 🪙 · ' + (aimed.reason ? aimed.reason + ' 🚫' : c.t === 'path' ? 'Lauf los – der Weg legt sich vor dir' : 'Passt hier ✔');
    if (i.textContent !== t) i.textContent = t;
  }
  /* --- Info-Pille: Münzen, Sterne, nächstes Ziel --- */
  let chipTxt = '';
  function paintChip() {
    const nm = nextMis(), t = '🪙 ' + Math.floor(S().coins) + ' · 🌟 ' + K.stars() + '/5 · +' + Math.round(M.incMin) + '/Min' + (nm ? '  ·  ' + nm.icon + ' ' + Math.min(nm.n, nm.get(M, S())) + '/' + nm.n : '');
    if (t !== chipTxt) { chipTxt = t; chip.innerHTML = '<span style="font-size:20px">🎢</span><span>' + t + '</span>'; }
  }
  /* --- Park-Büro (Fenster) --- */
  const off = el('section', 'screen'); off.hidden = true; off.id = 'parkOffice';
  off.innerHTML = '<div class="card quest"><div class="logo" style="font-size:28px">🏢 Park-Büro</div><div class="row tyOT"></div><div class="tyOB"></div><div class="row"><button class="pill" id="tyGo">🔨 Bauen</button><button class="pill" id="tyBye">✔ Fertig</button></div></div>';
  document.body.appendChild(off);
  const OT = off.querySelector('.tyOT'), OB = off.querySelector('.tyOB');
  off.addEventListener('click', e => { if (e.target === off) K.close(); });
  off.querySelector('#tyBye').onclick = () => K.close(); off.querySelector('#tyGo').onclick = () => { K.close(); K.build(true); };
  function bar(p) { const w = el('div', 'tyBarB'); const i = el('i'); i.style.width = Math.round(Math.max(0, Math.min(1, p)) * 100) + '%'; w.appendChild(i); return w; }
  function renderOffice() {
    if (!K.open) return; const s = S(); OT.innerHTML = '';
    [['📊', 'Park'], ['🔬', 'Forschung'], ['📋', 'Missionen']].forEach((t, i) => { const b = el('button', 'pill' + (K.otab === i ? ' sel' : ''), t[0] + ' ' + t[1]); b.onclick = () => { K.otab = i; renderOffice(); }; OT.appendChild(b); });
    OB.innerHTML = '';
    if (K.otab === 0) {
      const r = el('div', 'tyRow'); r.innerHTML = '<span class="ic">🪙</span><div class="fl"><b>' + Math.floor(s.coins) + ' Münzen · +' + Math.round(M.incMin) + ' pro Minute</b><small>Insgesamt verdient: ' + Math.floor(s.earned) + ' 🪙 · ' + M.guests + ' Gäste unterwegs</small></div>'; OB.appendChild(r);
      const r2 = el('div', 'tyRow'); r2.innerHTML = '<span class="ic">🌟</span><div class="fl"><b>Parkbewertung: ' + starStr(K.stars()) + ' (' + M.rating + ' %)</b></div>'; OB.appendChild(r2);
      for (const [ic, nm, v, tip] of [['🎠', 'Angebot', M.variety, 'Bau verschiedene Fahrgeschäfte und Buden an einen Weg.'], ['🧹', 'Sauberkeit', M.clean, 'Sammle Müll ein und stell Mülleimer auf.'], ['🚻', 'Komfort', M.comfort, 'Toiletten und Mülleimer machen Gäste froh.'], ['🌷', 'Schönheit', M.beauty, 'Bäume, Bänke, Blumen und Laternen verschönern den Park.']]) { const q = el('div', 'tyRow'); q.innerHTML = '<span class="ic">' + ic + '</span><div class="fl"><b>' + nm + ' ' + Math.round(v * 100) + ' %</b><small>' + tip + '</small></div>'; q.querySelector('.fl').appendChild(bar(v)); OB.appendChild(q); }
      if (M.off.length) { const q = el('div', 'tyRow'); q.innerHTML = '<span class="ic">⚠️</span><div class="fl"><b>' + M.off.length + ' Ding(e) ohne Weg</b><small>' + M.off.map(i => CAT[i.k].icon).join(' ') + ' – lege einen Weg vom Platz am Brunnen dorthin, sonst kommen keine Gäste.</small></div>'; OB.appendChild(q); }
    } else if (K.otab === 1) {
      for (const r of T.RES) { const have = s.res.includes(r.id), lockNeed = r.need && !s.res.includes(r.need), q = el('div', 'tyRow' + (have ? ' ok' : '')); q.innerHTML = '<span class="ic">' + r.icon + '</span><div class="fl"><b>' + r.name + (have ? ' ✅' : '') + '</b><small>' + r.text + (lockNeed ? ' · braucht: ' + T.RES.find(z => z.id === r.need).name : '') + '</small></div>';
        if (!have) { const b = el('button', 'pill', r.cost + ' 🪙'); b.disabled = lockNeed || s.coins < r.cost; b.onclick = () => research(r.id); q.appendChild(b); } OB.appendChild(q); }
    } else {
      const done = T.MIS.filter(m => s.mis.includes(m.id)).length; OB.appendChild(el('p', 'help', '📋 Park-Missionen: ' + done + ' von ' + T.MIS.length + (s.medal ? ' · 👑 Parkdirektor' : '') + '. Sie werden von selbst abgehakt.'));
      for (const m of T.MIS) { const ok = s.mis.includes(m.id), v = Math.min(m.n, m.get(M, s)), q = el('div', 'tyRow' + (ok ? ' ok' : '')); q.innerHTML = '<span class="ic">' + (ok ? '✅' : m.icon) + '</span><div class="fl"><b>' + m.title + '</b><small>' + m.text + (m.pct ? '' : ' (' + v + '/' + m.n + ')') + ' · +' + m.c + ' 🪙' + (m.s ? ' +' + m.s + ' ⭐' : '') + '</small></div>'; if (!ok) q.querySelector('.fl').appendChild(bar(v / m.n)); OB.appendChild(q); }
    }
  }
  K.show = function () { if (K.open) return; K.open = true; G.setStick(0, 0); calc(); off.hidden = false; renderOffice(); };
  K.close = function () { if (!K.open) return; K.open = false; off.hidden = true; G.updateButtons(true); };
  /* --- Park-Tafel (Bild am Büro) --- */
  const O = PK.office, cv = document.createElement('canvas'); cv.width = 512; cv.height = 410; const cx = cv.getContext('2d'), tex = new THREE.CanvasTexture(cv);
  function paintBoard(force) {
    const s = S(), sig = s.mis.join() + '|' + K.stars(); if (!force && sig === boardSig) return; boardSig = sig;
    const g = cx.createLinearGradient(0, 0, 0, 410); g.addColorStop(0, '#c2453d'); g.addColorStop(1, '#7a2420'); cx.fillStyle = g; cx.fillRect(0, 0, 512, 410); cx.fillStyle = '#ffd23f'; cx.fillRect(0, 0, 512, 54);
    cx.textBaseline = 'middle'; cx.textAlign = 'center'; cx.fillStyle = '#7a2420'; cx.font = 'bold 32px Fredoka, system-ui, sans-serif'; cx.fillText('🎢 PARK-MISSIONEN · ' + s.mis.length + '/' + T.MIS.length, 256, 29);
    T.MIS.forEach((m, i) => { const y = 78 + i * 25, ok = s.mis.includes(m.id), nx = nextMis() === m; cx.textAlign = 'left'; cx.fillStyle = nx ? '#ffd23f' : ok ? '#a8f0b8' : '#fff'; cx.font = (nx ? 'bold ' : '') + '20px Fredoka, system-ui, sans-serif'; cx.fillText((ok ? '✅ ' : nx ? '▶ ' : '⬜ ') + m.icon + ' ' + m.title, 16, y); });
    tex.needsUpdate = true;
  }
  { const pl = new THREE.Mesh(new THREE.PlaneGeometry(5, 4), new THREE.MeshBasicMaterial({ map: tex })); pl.position.set(O.x - 5.2, 3.6, O.z + 5.2); scene.add(pl); paintBoard(true);
    const b = new BI.Batch(); b.box(O.x - 7.5, 0, O.z + 5, .3, 5.6, .3, 0x6b4a2a); b.box(O.x - 2.9, 0, O.z + 5, .3, 5.6, .3, 0x6b4a2a); b.box(O.x - 5.2, 5.4, O.z + 5, 5.4, .3, .5, 0x6b4a2a); scene.add(b.mesh(mat)); W.addBox(O.x - 7.7, O.z + 4.8, O.x - 7.3, O.z + 5.2, false, 5); W.addBox(O.x - 3.1, O.z + 4.8, O.x - 2.7, O.z + 5.2, false, 5); }

  /* ===================== Interaktion ===================== */
  const shopNear = () => { for (const it of S().items) { const c = CAT[it.k]; if (c.t !== 'shop') continue; if (Math.hypot(P.x - it.x, P.z - (it.z + (it.z < PK.z ? 2.6 : -2.6))) < 2.4) return it; } return null; };
  K.near = function () {
    if (P.veh || park.busy() || P.y > 1.5) return null;
    if (K.building) return { k: moving ? 'bput' : K.mode === 'place' ? 'bplace' : K.mode === 'move' ? 'bmove' : 'bsell' };
    if (K.open) return null; const so = W.spots.parkOffice; if (so && Math.hypot(P.x - so.x, P.z - so.z) < 3.2) return { k: 'office' };
    const sh = shopNear(); if (sh) return { k: sh.k, it: sh };
    return null;
  };
  const SNACK = { cotton: 'cotton', popcorn: 'popcorn', icecream: 'icecream', lemonade: 'juice' };
  K.act = function (n) {
    if (!n) return;
    if (n.k === 'office') { K.show(); return; }
    if (n.k === 'bplace' || n.k === 'bmove' || n.k === 'bsell' || n.k === 'bput') { buildAct(); return; }
    if (n.it) { /* Imbiss: 1 ⭐ gegen Naschwerk (im Rucksack) */
      const c = CAT[n.it.k]; if (save.stars < 1) { say('Dafür brauchst du 1 ⭐', 1600); return; } if (!park.ready('st' + n.k, 700)) return; G.takeStar(1); const iv = G.inv(), kk = SNACK[n.k] || n.k; iv[kk] = (iv[kk] || 0) + 1; snd('buy'); fx.burst(n.it.x, 2.4, n.it.z, 12, [BI.C.pink, BI.C.gold, BI.C.white], 3, 1, 26, 3);
      say(c.icon + ' ' + c.name + ' gekauft – liegt im Rucksack 🎒 (dort kannst du es essen 😋)', 3000); S().coins += 2; mark();
    }
  };
  /* Fahrten im eigenen Park bringen ein Trinkgeld */
  K.onRide = function (kind) { const s = S(); s.st.rides++; const c = CAT[kind] ? Math.max(2, Math.round(CAT[kind].inc / 6)) : 2; s.coins += c; s.earned += c; mark(); };

  /* ===================== Takt ===================== */
  let tick = 0, hsT = 0, bT = 0, offSig = '';
  K.update = function (dt, t) {
    if (dirtyStatic) { stT -= dt; if (stT <= 0) { rebuildStatic(); stT = .08; } }
    if (dirtyConn) { calc(); dropLitterOff(); }
    const playing = G.playing(), s = S();
    /* Wirtschaft: einmal pro Sekunde */
    if (playing) {
      tick += dt; if (tick >= 1) {
        const n = Math.min(tick, 5); tick = 0; calc(); const gain = M.incMin / 60 * n; s.coins += gain; s.earned += gain;
        if (M.guests > 0 && litter.length < LMAX && rnd() < M.guests * .02 * n * (1 - .7 * Math.min(1, M.bins / Math.max(1, Math.ceil(connList.length / 18))))) spawnLitter();
        if (s.res.includes('hausmeister')) { hsT += n; if (hsT >= 9 && litter.length) { hsT = 0; pickLitter(0, false); } }
        checkMis(); paintBoard(false); mark(); saveT += n; if (saveT >= 15) { saveT = 0; flush(); } if (K.open) { const sg2 = [Math.floor(s.coins / 5), M.rating, s.res.length, s.mis.length, M.guests, M.off.length].join(); if (sg2 !== offSig) { offSig = sg2; renderOffice(); } }
      }
    }
    const world = BI.worldAt(P.x, P.z) === 'park' && !P.veh;
    /* Info-Pille nur im Park */
    const showChip = playing && world && !K.building && !K.open; if (chip.hidden === showChip) chip.hidden = !showChip; if (showChip) paintChip();
    const nearPark = Math.hypot(P.x - PK.x, P.z - PK.z) < PK.R + 40;
    updateGuests(dt, t, nearPark && playing);
    if (nearPark && playing && !P.veh && !park.busy()) { for (let i = litter.length - 1; i >= 0; i--) if (Math.hypot(P.x - litter[i].x, P.z - litter[i].z) < 1.5) { pickLitter(i, true); break; } }
    if (K.building) { if (!playing || P.veh || !world) { K.build(false); return; } updateBuild(dt); bT -= dt; if (bT <= 0) { bT = .25; renderBuild(false); } infoLine(); }
  };
  K.log = () => ({ missions: T.MIS, done: S().mis.slice(), rating: M.rating, coins: Math.floor(S().coins), medal: !!S().medal, next: nextMis() });
  K.state = S; K.items = () => S().items; K.count = count; K.paths = () => pset.size; K.sellItem = sell; K.place = place; K.research = research; K.calc = calc; K.litter = litter; K.pickLitter = pickLitter; K.spawnLitter = spawnLitter; K.reach = reach; K.why = why; K.guests = guests; K.checkMis = checkMis; K.flush = flush;
  K.addCoins = n => { S().coins += n; mark(); };
  /* Start: alle gespeicherten Bauteile in die Welt stellen */
  for (const it of S().items.slice()) { if (isRide(it.k) || CAT[it.k]) { const w = why(it.k, it.x, it.z, it.id); if (w === 'Das ist schon außerhalb des Parks' || w === 'Der Eingangsbereich muss frei bleiben') { S().items.splice(S().items.indexOf(it), 1); continue; } addWorld(it); } }
  calc(); rebuildStatic(); paintBoard(true);
  return K;
};
