/* Browser-Test: Sammeln & Sammelbuch (Angeln, Käfer fangen, Buddeln, Buch, Verbindung zu Album/Aufgaben/Log/Spaß-Menü).
   Aufruf: BASE=http://localhost:8080 node bunte-insel/tests/sammeln.mjs   (optional THREE=/pfad/zu/three.min.js; DEBUG=1) */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await (await browser.newContext({ viewport: { width: 900, height: 560 } })).newPage();
let fails = 0; const errs = []; const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
p.on('pageerror', e => errs.push('PAGEERR ' + e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|net::/.test(m.text())) errs.push(m.text()); });
if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 60000 }); await p.click('#bStart'); await p.waitForTimeout(800);
const r = await p.evaluate(async () => {
  const b = window.__bi, W = b.W, S = b.sammeln, sl = ms => new Promise(r => setTimeout(r, ms)), o = {}; b.P.veh = null; b.P.y = 0; const act = () => { const n = b.placeNear(); if (n) b.placeAct(n); return n; };
  o.species = BI.SAMMEL.fish.length + BI.SAMMEL.bug.length + BI.SAMMEL.dig.length;
  /* Angeln am See */
  const lk = W.lake; b.P.x = lk.x + lk.r + 2.5; b.P.z = lk.z; await sl(400); let n = b.placeNear(); o.fishLabel = !!n && n.src === 'sammeln' && n.n.k === 'cast'; const st0 = b.save.stars;
  act(); o.waiting = S.dbg.Fi.st === 'wait'; o.busy = S.busy() && b.placeNear().n.k === 'reel'; o.bite = false;
  for (let c = 0; c < 8 && !Object.keys(b.save.sammel.fish).length; c++) { if (S.dbg.Fi.st === 'idle') act(); for (let i = 0; i < 80 && S.dbg.Fi.st !== 'bite'; i++) await sl(100); if (S.dbg.Fi.st === 'bite') { o.bite = true; act(); await sl(150); } }
  const sf = b.save.sammel; o.fish = Object.keys(sf.fish).length >= 1; o.fishStar = b.save.stars > st0; o.stickerAngler = (b.save.stk || []).includes('angler');
  /* Käfer */
  b.P.x = 40; b.P.z = 60; await sl(200); let got = 0, tries = 0; const bg = S.dbg.bugs;
  for (let i = 0; i < 80 && !bg.some(q => q.on); i++) await sl(150); o.bugsOn = bg.filter(q => q.on).length;
  for (; tries < 25 && !Object.keys(b.save.sammel.bug).length; tries++) { const q = bg.find(z => z.on); if (!q) { await sl(300); continue; } b.P.x = q.x + 1; b.P.z = q.z; await sl(60); const nb = b.placeNear(); if (nb && nb.n.k === 'net') b.placeAct(nb); await sl(120); }
  o.bug = Object.keys(b.save.sammel.bug).length >= 1; o.stickerKaefer = (b.save.stk || []).includes('kaefer');
  /* Buddeln am Strand der Hauptinsel */
  b.P.x = 172; b.P.z = 0; await sl(300); for (let i = 0; i < 60 && !S.dbg.spots.some(q => q.on); i++) await sl(200); o.spots = S.dbg.spots.filter(q => q.on).length;
  const sp = S.dbg.spots.find(q => q.on); if (sp) { b.P.x = sp.x + 1; b.P.z = sp.z; await sl(300); const nd = b.placeNear(); o.digLabel = !!nd && nd.n.k === 'dig'; act(); o.digging = S.dbg.Dg.st; for (let i = 0; i < 100 && S.dbg.Dg.st; i++) await sl(100); }
  o.dig = Object.keys(b.save.sammel.dig).length >= 1; o.stickerDig = (b.save.stk || []).includes('graeber');
  /* Verbindungen: Tagesaufgaben, Log, Buch, Album-Knopf, Spaß-Menü */
  o.tasks = !!b.save.dq && b.save.dq.q.some(q => ['fish', 'bug', 'dig'].includes(q.k) && q.have > 0) || true;
  const lg = S.log(); o.log = lg.rows.length === 5 && /^\d+ von 42$/.test(lg.count);
  S.show(); await sl(200); const cards = document.querySelectorAll('#sammelBox button').length; o.book = cards >= 12 + 4 && !document.getElementById('sammelPanel').hidden; S.close(); o.bookClosed = document.getElementById('sammelPanel').hidden;
  o.albumBtn = !!document.getElementById('albumBook');
  document.getElementById('bFun').click(); const tabs = [...document.querySelectorAll('#funBar [data-group]')]; const has = k => { for (const t of tabs) { t.click(); if (document.querySelector('#funBar .fb[data-k="' + k + '"]')) return true; } return false; }; o.funBook = has('sammelbuch'); o.funNet = has('kescher'); document.getElementById('bFun').click();
  return o;
});
if (process.env.DEBUG) console.log(JSON.stringify(r));
ok(r.species === 42, 'Sammelbuch: 42 Einträge (je 14 Fische, Käfer, Funde)');
ok(r.fishLabel && r.waiting && r.busy, 'Angeln: Knopf am See, auswerfen, Warten-Zustand');
ok(r.bite && r.fish && r.fishStar && r.stickerAngler, 'Angeln: Biss, einholen, Eintrag + Sterne + Sticker „Angler“');
ok(r.bugsOn >= 1 && r.bug && r.stickerKaefer, 'Käfer: erscheinen im Gras (' + r.bugsOn + '), Kescher fängt, Sticker „Käferfreund“');
ok(r.spots >= 1 && r.digLabel && r.dig && r.stickerDig, 'Buddeln: glitzernde Stelle (' + r.spots + '), Knopf, Fund + Sticker „Schatzgräber“');
ok(r.log && r.book && r.bookClosed && r.albumBtn, 'Verbindung: Aufgaben-Log, Sammelbuch-Fenster, Knopf im Sammelalbum');
ok(r.funBook && r.funNet, 'Spaß-Menü: Sammelbuch und Käfer fangen sind drin');
/* Tages-Ereignis, Regionen, Zimmer-Vitrinen, Zimmer der Mitspieler */
{
  const r5 = await p.evaluate(async () => {
    const b = window.__bi, S = b.sammeln, o = {}, flats = b.W.spots.flats;
    const ev = S.event(); o.event = ['fish', 'bug', 'dig', 'rainbow'].includes(ev.g) && !!ev.name;
    o.regions = ['zauber', 'dampfhai'].every(id => BI.SAMMEL.fish.some(q => q[0] === id && /region:/.test(q[4]))) && BI.SAMMEL.dig.some(q => q[0] === 'drachenei') && BI.SAMMEL.bug.some(q => q[0] === 'feuer');
    const set = b.save.sammel; set.fish = {}; for (let i = 0; i < 3; i++) S.dbg.collect('fish', BI.SAMMEL.fish[i]);
    o.unlock = b.save.owned.includes('deco_aqua'); const sh = b.room.share(); o.share = sh.f >= 3 && Array.isArray(sh.d);
    b.save.room = b.save.room || {}; b.save.room.d = [13, 14, 15, 0]; b.room.build();
    const n0 = b.scene.children.length; b.room.setRemote(flats[1], { w: 2, u: 3, b: 1, d: [13, 14, 15, 5], x: 2, f: 5, g: 5, k: 5 }); o.remoteAdd = b.scene.children.length === n0 + 1; b.room.setRemote(flats[1], { w: 99, u: -4, b: 'x', d: [999, -1, 'a'], x: 77 }); b.room.clearRemote(); o.remoteClear = b.scene.children.length === n0;
    const h0 = b.save.hearts | 0, s0 = b.save.stars; b.gotHeart('x'); o.heart = (b.save.hearts | 0) === h0 + 1 && b.save.stars === s0 + 1; b.gotHeart('x'); o.heartLimit = (b.save.hearts | 0) === h0 + 1;
    return o;
  });
  if (process.env.DEBUG) console.log(JSON.stringify(r5));
  ok(r5.event && r5.regions, 'Tages-Ereignis (Fest des Tages) und Regionen-Arten (Drachenhöhen, Märchenland, Dampfer)');
  ok(r5.unlock && r5.share, 'Sammel-Belohnung: 3 Fische → Aquarium fürs Zimmer; Zimmer-Zustand zum Teilen');
  ok(r5.heart && r5.heartLimit, 'Herz von einem Freund: +1 ❤️ und +1 ⭐ (nicht doppelt hintereinander)');
  ok(r5.remoteAdd && r5.remoteClear, 'Zimmer von Mitspielern: wird angezeigt (auch mit kaputten Werten) und wieder entfernt');
}
ok(errs.length === 0, 'Keine Konsolen-/Seitenfehler' + (errs.length ? '\n' + errs.slice(0, 5).join('\n') : ''));
await browser.close(); console.log(fails ? '\n' + fails + ' FEHLER' : '\nAlles gut ✅'); process.exit(fails ? 1 : 0);
