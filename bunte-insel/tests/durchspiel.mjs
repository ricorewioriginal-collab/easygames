/* Durchspiel im Schnellmodus: alle Wohin-Ziele, jedes Fahrzeug fahren, alle Laden-Artikel kaufen/anlegen, alle Menü-Reiter, alle Figuren.
   Prüft Fehler, NaN, unter der Welt. Aufruf: THREE=... node bunte-insel/tests/durchspiel.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await (await browser.newContext({ viewport: { width: 600, height: 400 } })).newPage(); const errs = [];
p.on('pageerror', e => errs.push('PAGEERR ' + e.message + ' ' + (e.stack || '').split('\n').slice(1, 3).join('|'))); p.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|net::/.test(m.text())) errs.push(m.text()); });
if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 60000 }); await p.click('#bStart'); await p.waitForTimeout(800);
const res = await p.evaluate(async () => {
  const b = __bi, P = b.P, sl = ms => new Promise(r => setTimeout(r, ms)), bad = [], out = {}; b.save.stars = 99999; b.save.cheat = b.save.cheat || {}; b.save.cheat.open = true;
  const chk = (tag) => { const y = b.W.groundY(P.x, P.z); if (![P.x, P.y, P.z].every(Number.isFinite)) bad.push(tag + ' NaN'); else if (P.y < y - 3 || P.y < -5) bad.push(tag + ' unter Welt y=' + P.y.toFixed(1)); };
  /* 1. alle Ziele */
  for (const d of b.DEST) { try { const a = d.at(); P.veh = null; P.x = a.x; P.z = a.z; P.y = 0; } catch (x) { bad.push(d.id + ' at(): ' + x.message); continue; } await sl(200); chk('ziel ' + d.id); } out.ziele = b.DEST.length;
  /* 2. jedes Fahrzeug aufrufen und fahren */
  P.veh = null; P.x = 0; P.z = 60; P.y = 0; let nv = 0;
  for (const t of Object.keys(BI.VEH)) { try { b.callVeh(t); await sl(120); const v = b.vehicles.filter(v => v.type === t).pop(); if (!v) continue; b.enter(v); b.inp.y = 1; await sl(500); b.inp.y = 0; chk('fahrzeug ' + t); if (P.veh) b.leave(); nv++; } catch (x) { bad.push('fahrzeug ' + t + ': ' + x.message); } P.veh = null; P.x = 0; P.z = 60; P.y = 0; } out.fahrzeuge = nv;
  /* 3. alle Laden-Artikel kaufen + anlegen, Figur bauen */
  let ni = 0; for (const it of b.shopItems().flat ? b.shopItems().flat() : b.shopItems()) { try { if (!it || !it.id) continue; b.buyItem(it); ni++; b.setEq && it.slot && b.setEq(it.id); } catch (x) { bad.push('laden ' + (it && it.id) + ': ' + x.message); } } out.artikel = ni; await sl(300);
  /* 4. alle Menü-Reiter */
  document.getElementById('bGuide').click(); await sl(150); let nt = 0; for (const t of document.querySelectorAll('#guideTabs .gtab')) { t.click(); await sl(60); nt++; } document.getElementById('guideClose').click(); out.reiter = nt;
  /* 5. alle Figuren bauen */
  let nh = 0; for (const h of Object.keys(BI.HEROES || {})) { try { b.charOpts && b.charOpts({ hero: h }); nh++; } catch (x) { bad.push('held ' + h + ': ' + x.message); } } out.helden = nh;
  await sl(500); chk('ende'); return { bad, out };
});
console.log(JSON.stringify(res.out)); res.bad.concat(errs).slice(0, 30).forEach(x => console.log('FAIL', x));
console.log(res.bad.length + errs.length === 0 ? 'OK  Durchspiel ohne Fehler' : 'FAIL ' + (res.bad.length + errs.length) + ' Fehler'); await browser.close(); process.exit(res.bad.length + errs.length ? 1 : 0);
