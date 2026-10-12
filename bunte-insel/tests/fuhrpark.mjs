/* Fahrzeug-Menü (alle Fahrzeuge), erweiterter Spielzeugladen, neue Spielfiguren. Aufruf: node bunte-insel/tests/fuhrpark.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await (await browser.newContext({ viewport: { width: 900, height: 600 } })).newPage(); let fails = 0; const errs = []; p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
const sl = ms => new Promise(r => setTimeout(r, ms));
await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 60000 }); await p.click('#bStart'); await p.waitForTimeout(600);
const r = await p.evaluate(async () => {
  const b = __bi, P = b.P, out = {}, sl = ms => new Promise(r => setTimeout(r, ms)), types = Object.keys(BI.VEH);
  /* 1. Fahrzeug-Menü zeigt alle Fahrzeuge */
  document.getElementById('bGuide').click(); await sl(200); [...document.querySelectorAll('#guideTabs .gtab')].find(t => /Fahrz/.test(t.textContent)).click(); await sl(100);
  const rows = [...document.querySelectorAll('#guideGrid .grow')]; out.rows = rows.length; out.all = types.every(t => rows.some(x => x.textContent.includes(BI.VEH[t].name)));
  out.callBtns = rows.filter(x => x.querySelector('button[title="Herholen"]')).length; out.lockedRows = rows.filter(x => /Spielzeugladen/.test(x.textContent)).length;
  document.getElementById('guideClose').click(); await sl(100);
  /* 2. Herholen: Polizeiauto erscheint neben dir, zweiter Aufruf bewegt dasselbe Exemplar */
  P.veh = null; P.x = 0; P.z = 60; P.y = 0; const n0 = b.vehicles.length; b.callVeh('police'); await sl(300); const n1 = b.vehicles.length; const v1 = b.vehicles.filter(v => v.type === 'police' && v.toy); P.x += 20; b.callVeh('police'); await sl(300);
  out.call = n1 === n0 + 1 && v1.length === 1 && b.vehicles.filter(v => v.type === 'police' && v.toy).length === 1 && Math.hypot(v1[0].x - P.x, v1[0].z - P.z) < 6;
  /* 3. Spielzeug-Fahrzeug erst nach Kauf */
  const before = b.vehicles.length; b.callVeh('scooter'); await sl(200); out.lockedToy = b.vehicles.length === before && !b.save.owned.includes('scooter');
  b.save.stars = 100; /* Kaufen über den Laden */ document.getElementById('bGuide'); 
  return out;
});
ok(r.rows >= 28 && r.all, 'Fahrzeug-Menü zeigt alle ' + r.rows + ' Fahrzeuge (' + 28 + ' Arten)'); ok(r.callBtns >= 9, r.callBtns + ' Fahrzeuge lassen sich sofort herholen'); ok(r.lockedRows >= 8, 'Spielzeug-Fahrzeuge sind bis zum Kauf im Spielzeugladen gesperrt'); ok(r.call, 'Herholen: eigenes Polizeiauto neben dir, zweiter Aufruf bewegt dasselbe Exemplar'); ok(r.lockedToy === true, 'Ungekauftes Spielzeug lässt sich nicht herholen');
/* 4. Spielzeugladen: neue Tabs und Artikel, Kauf + Holen + Style */
const sh = await p.evaluate(async () => { const b = __bi, sl = ms => new Promise(r => setTimeout(r, ms)), out = {}, S = b.shopItems(); const tabs = [...new Set(S.map(q => q.tab))].sort(); out.n = S.length; out.tabs = tabs.length; out.veh = S.filter(q => q.tab === 5).length; out.style = S.filter(q => q.tab === 6).length;
  b.save.stars = 300; const sc = S.find(q => q.id === 'scooter'); b.buyItem(sc); await sl(400); out.bought = b.save.owned.includes('scooter'); const before = b.vehicles.length; out.spawned = b.vehicles.some(v => v.type === 'scooter' && v.toy);
  b.P.veh = null; b.P.x = 0; b.P.z = 60; b.callVeh('scooter'); await sl(300); out.callOwned = b.vehicles.filter(v => v.type === 'scooter' && v.toy).length === 1;
  const w = S.find(q => q.id === 'watch'); b.buyItem(w); await sl(300); out.watch = !!b.save.equip.watch; for (const id of ['headband', 'earring', 'necklace', 'mask', 'rainbow', 'fox']) { b.buyItem(S.find(q => q.id === id)); } await sl(300); out.style6 = ['headband', 'earring', 'necklace', 'mask', 'rainbow', 'fox'].every(k => !!b.save.equip[k]);
  /* Menü nach Kauf: Tretroller herholbar */ document.getElementById('bGuide').click(); await sl(200); [...document.querySelectorAll('#guideTabs .gtab')].find(t => /Fahrz/.test(t.textContent)).click(); await sl(100); const row = [...document.querySelectorAll('#guideGrid .grow')].find(x => x.textContent.includes('Tretroller')); out.menuCall = !!(row && row.querySelector('button[title="Herholen"]')); document.getElementById('guideClose').click();
  return out; });
ok(sh.n >= 70 && sh.tabs === 7 && sh.veh >= 9 && sh.style >= 25, 'Spielzeugladen: ' + sh.n + ' Artikel in ' + sh.tabs + ' Reitern (Fahrzeuge ' + sh.veh + ', Style ' + sh.style + ')'); ok(sh.bought && sh.spawned && sh.callOwned, 'Kauf: Tretroller gehört dir, steht bereit, Herholen bewegt dasselbe Exemplar'); ok(sh.watch && sh.style6, 'Style-Zubehör wird angezogen (Uhr, Stirnband, Ohrring, Kette, Maske, Regenbogen, Fuchs)'); ok(sh.menuCall, 'Fahrzeug-Menü: gekauftes Spielzeug ist jetzt herholbar');
const heroes = await p.evaluate(() => { const bad = []; for (const h of BI.HEROES) { try { const c = BI.makeChar(Object.assign({}, h.o, { name: h.name })); if (!c || !c.group) bad.push(h.id); } catch (e) { bad.push(h.id + ':' + e.message); } } return { n: BI.HEROES.length, bad, worlds: [...new Set(BI.HEROES.filter(h => h.world).map(h => h.world))].length, ids: new Set(BI.HEROES.map(h => h.id)).size }; });
ok(heroes.n >= 45 && heroes.ids === heroes.n && !heroes.bad.length, 'Spielfiguren: ' + heroes.n + ' (' + heroes.worlds + ' Welten), alle bauen fehlerfrei ' + heroes.bad.join(','));
ok(errs.length === 0, 'keine JS-Fehler ' + errs.slice(0, 3).join(' | '));
await browser.close(); console.log(fails ? fails + ' FEHLER' : 'Alles gut ✅'); process.exit(fails ? 1 : 0);
