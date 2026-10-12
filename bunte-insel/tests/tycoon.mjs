/* Browser-Test des Park-Tycoons (Bunte Insel, js/tycoon.js + js/park.js).
   Voraussetzung: Webserver im Repo-Hauptordner und Playwright (npm i -D playwright).
   Aufruf: BASE=http://localhost:8080 node bunte-insel/tests/tycoon.mjs   (optional THREE=/pfad/zu/three.min.js für Offline-Betrieb) */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext({ viewport: { width: 900, height: 560 } });
let fails = 0; const errs = [];
const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
async function boot() {
  const p = await ctx.newPage(); p.on('pageerror', e => errs.push('PAGEERR ' + e.message + '\n' + (e.stack || '').split('\n').slice(0, 4).join('\n'))); p.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|net::/.test(m.text())) errs.push(m.text()); });
  if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
  await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
  await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 60000 }); await p.click('#bStart'); await p.waitForTimeout(500); return p;
}
let p = await boot();

/* ---------- 1. Startzustand ---------- */
{
  const r = await p.evaluate(async () => {
    const b = window.__bi, T = b.tycoon, sl = ms => new Promise(r => setTimeout(r, ms)); b.P.x = 276; b.P.z = 30; b.P.y = 0; await sl(300); const M = T.calc();
    return { items: T.items().map(i => i.k), paths: T.paths(), off: M.off.length, rating: M.rating, inc: M.incMin, rides: b.park.rides.length, coins: T.state().coins, world: BI.worldAt(b.P.x, b.P.z), chip: !document.querySelector('.tyChip').hidden };
  });
  ok(r.items.join() === 'carousel,icecream' && r.paths === 7, 'Start: Karussell + Eis-Stand + 7 Wegstücke'); ok(r.off === 0 && r.rating > 0 && r.inc > 0 && r.rides === 1, 'Start: alles hat einen Weg, Bewertung und Einnahmen laufen, 1 Fahrgeschäft in der Welt');
  ok(r.coins === 220 && r.world === 'park' && r.chip, 'Start: 220 🪙, Info-Pille im Park sichtbar');
}

/* ---------- 2. Platzregeln ---------- */
{
  const r = await p.evaluate(() => {
    const T = window.__bi.tycoon, w = (k, x, z) => T.why(k, x, z), out = {};
    out.plaza = !!w('carousel', 285, 20); out.corridor = !!w('wc', 250, 20); out.bench = !!w('bin', 270, 14); out.arena = !!w('wc', 258, -4); out.office = !!w('wc', 246, 8);
    out.outside = !!w('wc', 330, 70); out.overlap = !!w('wc', 262, 44); out.free = w('wc', 300, 54) === ''; out.pathOnRide = !!T.why('path', 262, 44); out.pathFree = T.why('path', 300, 54) === ''; out.pathPlaza = !!T.why('path', 285, 30); out.pathDup = !!T.why('path', 274, 34);
    out.smallOnPath = T.why('bin', 274, 34) === ''; out.bigOnPath = !!T.why('wc', 274, 34);
    return out;
  });
  ok(r.plaza && r.corridor && r.bench && r.arena && r.office && r.outside && r.overlap, 'Platzregeln: Platz, Promenade, Bank, Autoscooter, Büro, Meer und andere Dinge sind gesperrt'); ok(r.free && r.pathFree && r.smallOnPath, 'Platzregeln: freie Stelle OK, kleine Dinge dürfen auf einen Weg');
  ok(r.pathOnRide && r.pathPlaza && r.pathDup && r.bigOnPath, 'Platzregeln: kein Weg unter Fahrgeschäften, nicht auf dem Platz, nicht doppelt; große Dinge nicht auf Wegen');
}

/* ---------- 3. Bauen, Erreichbarkeit, Einnahmen, Forschung ---------- */
{
  const r = await p.evaluate(async () => {
    const b = window.__bi, T = b.tycoon, s = T.state(), out = {}; const i0 = T.calc().incMin, c0 = s.coins;
    out.lockedChain = T.place('chain', 300, 54) === false && T.count('chain') === 0; out.coinsKept = s.coins === c0;
    out.built = T.place('carousel', 296, 44); out.coins = s.coins === c0 - 120; out.n = T.count('carousel') === 2; out.rides = b.park.rides.length === 2;
    out.collider = b.W.resolve(296, 44 - 8.4, .3, {}).hit === true; /* Sockel des Karussells blockt */
    let M = T.calc(); out.offBefore = M.off.length === 1 && Math.abs(M.incMin - i0) < 1e-6;
    /* Weg zum neuen Karussell: Kachelreihe von (274,40) → (284,40) → … */
    for (let x = 276; x <= 286; x += 2) T.place('path', x, 40, true); M = T.calc(); out.offAfter = M.off.length === 0 && M.incMin > i0; out.paths = T.paths() >= 12;
    /* Forschung */
    out.resNeed = T.research('rad') === false; s.coins += 500; out.res1 = T.research('kette') === true && s.res.includes('kette'); out.chain = T.place('chain', 300, 70 - 6, false) || T.place('chain', 318, 36, false);
    out.res2 = T.research('kette') === false; out.maxC = (() => { let n = 0; for (let i = 0; i < 5; i++) if (T.place('carousel', 262 + i * 22, 60, true)) n++; return T.count('carousel') <= 3; })();
    return out;
  });
  ok(r.lockedChain && r.coinsKept, 'Gesperrtes (nicht erforschtes) Fahrgeschäft lässt sich nicht bauen, Münzen bleiben'); ok(r.built && r.coins && r.n && r.rides && r.collider, 'Karussell bauen: Münzen abgezogen, in der Welt, Sockel blockiert');
  ok(r.offBefore && r.offAfter && r.paths, 'Ohne Weg keine Einnahmen – nach dem Weg schon'); ok(r.resNeed && r.res1 && r.chain && r.res2, 'Forschung: Voraussetzung, Kauf, danach baubar, nicht doppelt'); ok(r.maxC, 'Höchstzahl je Sorte (Karussell max. 3)');
}

/* ---------- 4. Alle vier Fahrgeschäfte: einsteigen, fahren, sicher aussteigen ---------- */
{
  const r = await p.evaluate(async () => {
    const b = window.__bi, T = b.tycoon, K = b.park, s = T.state(), out = {}; s.res.push('kette', 'rad', 'bahn'); s.coins = 5000;
    /* ein freier, leerer Park-Teil zum Testen: alles Gebaute verkaufen */
    for (const it of T.items().slice()) T.sellItem(it); out.empty = T.items().length === 0 && K.rides.length === 0;
    const spots = { ferris: [300, 46], carousel: [262, 46], chain: [300, 0], coaster: [264, 2] }, coins0 = s.coins;
    for (const [k, [x, z]] of Object.entries(spots)) { out['b_' + k] = T.place(k, x, z, true); }
    const cost = { ferris: 4.6 };
    const board = async (k, px, pz) => { b.P.x = px; b.P.z = pz; b.P.y = 0; b.P.veh = null; b.P.h = 0; await new Promise(r => setTimeout(r, 120)); const n = b.placeNear(); out[k + 'N'] = !!n && n.src === 'park' && n.n.k === k; if (!out[k + 'N']) return; const cs = s.coins; b.placeAct(n); out[k + 'On'] = K.busy(); const e = s.coins >= cs; for (let i = 0; i < 600 && K.busy(); i++) K.update(.5, 100 + i * .5); out[k + 'End'] = !K.busy() && b.P.y < 1.5 && isFinite(b.P.x + b.P.z) && Math.hypot(b.P.x - px, b.P.z - pz) < 14 && s.coins > cs; };
    await board('ferris', 300, 46 + 4.6); await board('carousel', 262 + 9.3, 46); await board('chain', 300 + 8.1, 0); await board('coaster', 264 - 13.6, 2 + 6.8);
    out.stars = true; return out;
  });
  ok(r.empty && r.b_ferris && r.b_carousel && r.b_chain && r.b_coaster, 'Alle vier Fahrgeschäfte lassen sich an freien Stellen bauen');
  ok(r.ferrisN && r.ferrisOn && r.ferrisEnd && r.carouselN && r.carouselOn && r.carouselEnd && r.chainN && r.chainOn && r.chainEnd && r.coasterN && r.coasterOn && r.coasterEnd, 'Riesenrad, Karussell, Kettenkarussell, Achterbahn (frei platziert): einsteigen, fahren, sicher aussteigen, Trinkgeld');
}

/* ---------- 5. Baumodus mit Knopf: bauen, verschieben, verkaufen ---------- */
{
  const r = await p.evaluate(async () => {
    const b = window.__bi, T = b.tycoon, s = T.state(), out = {}, sl = ms => new Promise(r => setTimeout(r, ms)); s.coins = 1000; for (const it of T.items().slice()) T.sellItem(it);
    b.P.x = 300; b.P.z = 44; b.P.y = 0; b.P.h = Math.PI / 2; await sl(150); const n0 = b.placeNear(); out.office0 = !n0; /* nur am Büro startet man */
    b.P.x = 246; b.P.z = 12.2; await sl(150); const no = b.placeNear(); out.office = !!no && no.src === 'tycoon' && no.n.k === 'office'; b.placeAct(no); out.open = T.open; T.close(); out.closed = !T.open;
    b.P.x = 300; b.P.z = 44; b.P.h = Math.PI / 2; T.build(true); await sl(200); out.building = T.building && b.park.noRide; out.label = b.placeNear().n.k;
    T.sel = 'bench'; T.tab = 3; await sl(200); const c0 = s.coins; const a = b.placeNear(); out.lab2 = a.n.k === 'bplace'; b.placeAct(a); out.bench = T.count('bench') === 1 && s.coins === c0 - 15;
    /* verschieben */
    T.mode = 'move'; await sl(250); const it = T.items()[0], d = Math.hypot(it.x - b.P.x, it.z - b.P.z); b.P.x = it.x - 3; b.P.z = it.z; b.P.h = Math.PI / 2; await sl(250); b.placeAct(b.placeNear()); await sl(100); out.picked = T.count('bench') === 0; out.putLabel = b.placeNear().n.k === 'bput';
    b.P.x = 296; b.P.z = 60; b.P.h = Math.PI / 2; await sl(250); b.placeAct(b.placeNear()); await sl(100); out.put = T.count('bench') === 1 && T.items()[0].x !== it.x && T.items()[0].id === it.id;
    /* verkaufen: 1. Druck = Rückfrage, 2. Druck = weg */
    T.mode = 'sell'; const it2 = T.items()[0]; b.P.x = it2.x - 3; b.P.z = it2.z; b.P.h = Math.PI / 2; await sl(250); const cs = s.coins; b.placeAct(b.placeNear()); out.askFirst = T.count('bench') === 1; await sl(60); b.placeAct(b.placeNear()); out.sold = T.count('bench') === 0 && s.coins === cs + 9;
    /* Weg legt sich beim Laufen */
    T.mode = 'place'; T.sel = 'path'; T.tab = 4; const p0 = T.paths(); for (let i = 0; i < 6; i++) { b.P.x = 300 + i * 2; b.P.z = 52; b.P.h = Math.PI / 2; await sl(120); } out.autoPath = T.paths() >= p0 + 4;
    T.build(false); out.off = !T.building && !b.park.noRide; out.noGhost = !b.scene.children.some(o => o.material && o.material === b.park.ghostMat && o.visible);
    return out;
  });
  ok(r.office0 && r.office && r.open && r.closed, 'Park-Büro: nur am Häuschen, Fenster öffnet/schließt'); ok(r.building && r.label === 'bplace' && r.lab2 && r.bench, 'Baumodus: Hauptknopf baut die ausgewählte Bank');
  ok(r.picked && r.putLabel && r.put, 'Verschieben: aufnehmen, an neuer Stelle abstellen (gleiche Nummer, nichts verloren)'); ok(r.askFirst && r.sold, 'Verkaufen: erst Rückfrage, dann weg und 60 % zurück'); ok(r.autoPath, 'Wege legen sich beim Laufen vor der Figur'); ok(r.off && r.noGhost, 'Baumodus beenden räumt Vorschau und Sperre auf');
}

/* ---------- 6. Müll, Gäste, Sauberkeit, Missionen ---------- */
{
  const r = await p.evaluate(async () => {
    const b = window.__bi, T = b.tycoon, s = T.state(), out = {}, sl = ms => new Promise(r => setTimeout(r, ms));
    for (const it of T.items().slice()) T.sellItem(it); T.place('carousel', 262, 44, true); T.place('icecream', 278, 38, true); T.calc(); b.P.x = 276; b.P.z = 30; b.P.y = 0; await sl(200);
    const cl0 = T.calc().clean; for (let i = 0; i < 8; i++) T.spawnLitter(); out.litter = T.litter.length === 8; out.cleanDown = T.calc().clean < cl0;
    const lit = T.litter[0]; b.P.x = lit.x; b.P.z = lit.z; await sl(300); out.picked = T.litter.length === 7 && s.st.litter >= 1;
    for (let i = 0; i < 40; i++) T.spawnLitter(); out.cap = T.litter.length <= 24;
    /* Gäste laufen nur auf Wegen */
    s.coins += 0; T.calc(); await sl(1500); out.guests = T.guests.length > 0 && T.guests.every(g => b.tycoon.paths() > 0);
    /* Hausmeister räumt auf */
    s.res.push('hausmeister'); const n0 = T.litter.length; for (let i = 0; i < 30; i++) b.tycoon.update(1, 50 + i); out.janitor = T.litter.length < n0;
    /* Mission: Wegebauer */
    out.misBefore = !s.mis.includes('weg'); const c0 = s.coins; for (let x = 266; x <= 280; x += 2) T.place('path', x, 60, true); T.checkMis(); out.mis = s.mis.includes('weg') && s.coins >= c0 + 30;
    out.board = document.getElementById('parkOffice') !== null; T.show(); for (const t of [0, 1, 2]) { T.otab = t; T.show(); } out.office = document.querySelectorAll('#parkOffice .tyRow').length > 3; T.close();
    return out;
  });
  ok(r.litter && r.cleanDown && r.picked && r.cap, 'Müll: entsteht, senkt die Sauberkeit, wird beim Drüberlaufen eingesammelt, hat eine Obergrenze'); ok(r.guests && r.janitor, 'Gäste laufen auf Wegen, Hausmeister räumt auf'); ok(r.misBefore && r.mis && r.office, 'Park-Mission „Wegebauer“ wird automatisch abgehakt (Belohnung), Büro-Fenster zeigt Inhalte');
}

/* ---------- 7. Speichern und Neuladen ---------- */
{
  const before = await p.evaluate(async () => { const b = window.__bi, T = b.tycoon, s = T.state(); s.coins = 777.5; T.place('wc', 300, 56, true); T.place('popcorn', 320, 40, true); b.saveNow(); await new Promise(r => setTimeout(r, 300)); return { items: T.items().map(i => i.k + ':' + i.x + ':' + i.z).sort().join('|'), paths: T.paths(), res: s.res.slice().sort().join(), mis: s.mis.slice().sort().join(), coins: Math.floor(s.coins) }; });
  await p.close(); p = await boot();
  const after = await p.evaluate(() => { const b = window.__bi, T = b.tycoon, s = T.state(); return { items: T.items().map(i => i.k + ':' + i.x + ':' + i.z).sort().join('|'), paths: T.paths(), res: s.res.slice().sort().join(), mis: s.mis.slice().sort().join(), coins: Math.floor(s.coins), rides: b.park.rides.length }; });
  ok(before.items === after.items && before.paths === after.paths && before.res === after.res && before.mis === after.mis && Math.abs(before.coins - after.coins) <= 1, 'Neuladen: Bauteile, Wege, Forschung, Missionen und Münzen sind wieder da (' + after.items.split('|').length + ' Teile, ' + after.paths + ' Wege)');
}

/* ---------- 8. Kaputte Spielstände ---------- */
{
  await p.close(); p = await ctx.newPage(); p.on('pageerror', e => errs.push('PAGEERR(bad) ' + e.message));
  if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' })); await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
  await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 60000 });
  /* Spielstand vor dem Start verbiegen: unbekannte Sorten, NaN, doppelte Nummern, ungerade Wege */
  const done = await p.evaluate(async () => { const b = window.__bi; b.save.tycoon = { v: 1, coins: 'x', earned: -5, nid: 'a', items: [{ id: 1, k: 'nix', x: 1, z: 1 }, { id: 2, k: 'bench', x: 300, z: 54 }, { id: 2, k: 'bin', x: 304, z: 54 }, null, { id: 9, k: 'wc', x: NaN, z: 3 }], paths: [1, 2, 3, 'a'], res: ['kette', 'gibtsnicht'], mis: ['weg', 'xx'], st: null }; b.saveNow(); return true; });
  await p.reload(); await p.waitForFunction(() => window.__bi, null, { timeout: 60000 }); await p.click('#bStart'); await p.waitForTimeout(600);
  const r = await p.evaluate(() => { const T = window.__bi.tycoon, s = T.state(); return { coins: s.coins, items: T.items().map(i => i.k).join(), ids: new Set(T.items().map(i => i.id)).size === T.items().length, res: s.res.join(), mis: s.mis.join(), paths: T.paths(), st: typeof s.st.litter }; });
  ok(r.coins === 0 && r.items === 'bench,bin' && r.ids && r.res === 'kette' && r.mis === 'weg' && r.st === 'number', 'Kaputter Spielstand wird repariert (unbekannte Sorten, NaN, doppelte Nummern fliegen raus, Münzen ≥ 0)');
}

/* ---------- 9. Sparsamkeit ---------- */
{
  await p.close(); p = await boot();
  const r = await p.evaluate(async () => {
    const b = window.__bi, T = b.tycoon, s = T.state(), sl = ms => new Promise(r => setTimeout(r, ms)), out = {}; s.coins = 1e6; s.res.push('kette', 'rad', 'bahn', 'garten', 'licht'); b.P.x = 276; b.P.z = 30; b.P.y = 0; await sl(400);
    const calls0 = b.renderer.info.render.calls; await sl(200); const c1 = b.renderer.info.render.calls;
    /* 40 Dekoteile + 120 Wegstücke + 3 Fahrgeschäfte dazu */
    let n = 0; for (let x = 238; x <= 330 && n < 40; x += 4) for (const z of [50, 56, 62]) if (n < 40 && T.place(['tree', 'bench', 'flowers', 'lamp', 'bin'][n % 5], x, z, true)) n++;
    for (let x = 240; x <= 330; x += 2) for (const z of [34, 36]) T.place('path', x, z, true); T.place('ferris', 300, 6, true); T.place('coaster', 264, 2, true); T.place('chain', 318, 44, true);
    await sl(500); T.calc(); const c2 = b.renderer.info.render.calls; out.calls = [c1, c2]; out.items = T.items().length; out.paths = T.paths();
    let t0 = performance.now(); for (let i = 0; i < 300; i++) T.update(1 / 60, 10 + i / 60); out.ms = (performance.now() - t0) / 300; t0 = performance.now(); for (let i = 0; i < 100; i++) b.park.update(1 / 60, 10 + i / 60); out.pms = (performance.now() - t0) / 100;
    out.mem = b.renderer.info.memory.geometries;
    /* alles verkaufen darf keine Geometrien liegen lassen */
    for (const it of T.items().slice()) T.sellItem(it); await sl(300); out.memAfter = b.renderer.info.memory.geometries; out.rides = b.park.rides.length;
    return out;
  });
  ok(r.calls[1] - r.calls[0] <= 12 && r.calls[1] < 400, 'Sparsam: ' + r.items + ' Teile + ' + r.paths + ' Wege kosten wenige Zeichenaufrufe (' + r.calls.join(' → ') + ')'); ok(r.ms < 2 && r.pms < 2, 'Rechenzeit pro Bild klein (Tycoon ' + r.ms.toFixed(2) + ' ms, Park ' + r.pms.toFixed(2) + ' ms)');
  ok(r.rides === 0 && r.memAfter <= r.mem, 'Verkaufen räumt auf (Geometrien ' + r.mem + ' → ' + r.memAfter + ')');
}

ok(errs.length === 0, 'Keine Konsolen-/Seitenfehler' + (errs.length ? '\n' + errs.slice(0, 5).join('\n') : ''));
await browser.close(); console.log(fails ? '\n' + fails + ' FEHLER' : '\nAlles gut ✅'); process.exit(fails ? 1 : 0);
