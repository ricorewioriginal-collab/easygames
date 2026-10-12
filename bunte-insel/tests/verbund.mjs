/* Browser-Test der Verbindung Bunte Insel ⇄ ZOTIK-Spiel (Tor auf der Zotik-Insel, Tor/Menüs im Zotik-Spiel).
   Aufruf: BASE=http://localhost:8080 node bunte-insel/tests/verbund.mjs   (optional THREE=/pfad/zu/three.min.js für Offline-Betrieb; DEBUG=1 zeigt Rohwerte) */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext({ viewport: { width: 900, height: 560 } });
let fails = 0; const errs = [];
const dbg = r => { if (process.env.DEBUG) console.log('   ', JSON.stringify(r)); };
const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
const p = await ctx.newPage(); p.on('pageerror', e => errs.push('PAGEERR ' + e.message + '\n' + (e.stack || '').split('\n').slice(0, 4).join('\n'))); p.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|net::/.test(m.text())) errs.push(m.text()); });
if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 60000 }); await p.click('#bStart'); await p.waitForTimeout(500);

/* ---------- Bunte Insel: Tor zum Zotik-Spiel ---------- */
{
  const r = await p.evaluate(async () => {
    const b = window.__bi, Z = BI.ZOTIK, W = b.W, P = b.P, out = {}, sl = ms => new Promise(r => setTimeout(r, ms)), zp = Z.zportal;
    out.inIsle = !!zp && Math.hypot(zp.x - Z.x, zp.z - Z.z) < Z.R - 4; out.coll = W.resolve(zp.x + 1.6, zp.z, .3, {}).hit === true; /* Säule */
    out.menu = b.DEST.some(d => d.id === 'zspiel' && d.cat === 'spiele');
    const urls = []; b.zotik.nav = u => urls.push(u); P.veh = null; P.y = 0; P.x = zp.x; P.z = zp.z + 3; await sl(250);
    const n = b.placeNear(); out.label = !!n && n.src === 'zotik' && n.n.k === 'zspiel'; b.placeAct(n); out.firstAsk = urls.length === 0; b.placeAct(b.placeNear()); await sl(1300);
    out.go = urls.length === 1 && /\/zotik\/\?from=bunteinsel$/.test(urls[0]); out.url = urls[0];
    return out;
  });
  if (process.env.DEBUG) console.log('   ', JSON.stringify(r));
  ok(r.inIsle && r.coll, 'Bunte Insel: Tor zum Zotik-Spiel steht auf der Zotik-Insel (Säulen sind Hindernisse)'); ok(r.menu, 'Bunte Insel: Tor ist im Wohin-Menü (Reiter Spiele)');
  ok(r.label && r.firstAsk && r.go, 'Bunte Insel: Knopf „Ins Zotik-Spiel reisen“, erst Rückfrage, dann Wechsel zu ../zotik/?from=bunteinsel');
}
/* ---------- Bunte Insel: Rückkehr aus dem Zotik-Spiel ---------- */
{
  const q = await ctx.newPage(); q.on('pageerror', e => errs.push('PAGEERR(back) ' + e.message));
  if (process.env.THREE) await q.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' })); await q.route('**/fonts.googleapis.com/**', r => r.abort()); await q.route('**/cloud/**', r => r.abort());
  await q.goto(BASE + '/bunte-insel/index.html?from=zotik'); await q.waitForFunction(() => window.__bi, null, { timeout: 60000 }); await q.click('#bStart'); await q.waitForTimeout(1500);
  const r = await q.evaluate(() => { const b = window.__bi, zp = BI.ZOTIK.zportal; return { near: Math.hypot(b.P.x - zp.x, b.P.z - zp.z) < 9, world: BI.worldAt(b.P.x, b.P.z), clean: !/from=/.test(location.search), back: !!(b.save.zotik && b.save.zotik.back) }; });
  if (process.env.DEBUG) console.log('   ', JSON.stringify(r)); ok(r.near && r.world === 'zotik' && r.clean && r.back, 'Bunte Insel: Rückkehr aus dem Zotik-Spiel setzt dich am Tor in Lunaris ab (+⭐ einmalig, Adresse bereinigt)'); await q.close();
}
/* ---------- Zotik-Spiel: Tor, Titel-Menü und Spielmenü führen zur Bunten Insel ---------- */
{
  const z = await ctx.newPage(); const zerrs = []; z.on('pageerror', e => zerrs.push(e.message)); const reqs = [];
  if (process.env.THREE) await z.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' })); await z.route('**/fonts.googleapis.com/**', r => r.abort()); await z.route('**/cloud/**', r => r.abort()); await z.route('**/anmacha-cloud.js', r => r.abort());
  await z.route('**/bunte-insel/**', r => { reqs.push(r.request().url()); r.abort(); });
  await z.goto(BASE + '/zotik/index.html'); await z.waitForTimeout(1500);
  const r = await z.evaluate(() => ({ btn: !!document.getElementById('bBunt'), mbtn: !!document.getElementById('mBunt'), tor: __zotik.INT.filter(o => o.name === 'Bunte Insel').length, weltentor: __zotik.INT.filter(o => o.name === 'Weltentor').length, url: __zotik.BUNT_URL }));
  if (process.env.DEBUG) console.log('   ', JSON.stringify(r)); ok(r.btn && r.mbtn && r.tor === 1 && r.weltentor === 1, 'Zotik-Spiel: Tor zur Bunten Insel neben dem Weltentor, Knöpfe im Titel- und Spielmenü');
  ok(/\/bunte-insel\/\?from=zotik$/.test(r.url), 'Zotik-Spiel: Ziel-Adresse ../bunte-insel/?from=zotik');
  /* Tor im Spiel: Dialog mit „Hinüberreisen“ / „Noch nicht“; Hinüberreisen führt zur Bunten Insel */
  const d1 = await z.evaluate(async () => { const Zt = window.__zotik, o = Zt.INT.find(x => x.name === 'Bunte Insel'), w = Zt.INT.find(x => x.name === 'Weltentor'); o.talk(); const sl = ms => new Promise(r => setTimeout(r, ms)); for (let i = 0; i < 12 && !document.querySelectorAll('#dOpts button').length; i++) { document.getElementById('dlg').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); await sl(150); } const btns = [...document.querySelectorAll('#dOpts button')].map(b => b.textContent); return { btns, free: !Zt.pBlocked(o.x, o.z), apart: Math.hypot(o.x - w.x, o.z - w.z) > 5 }; });
  ok(d1.btns.length === 2 && /Hinüberreisen/.test(d1.btns[0]) && /Noch nicht/.test(d1.btns[1]), 'Zotik-Spiel: Tor-Dialog hat „Hinüberreisen“ und „Noch nicht“'); ok(d1.free && d1.apart, 'Zotik-Spiel: Tor steht frei und nicht auf dem Weltentor');
  const before = reqs.length; await z.evaluate(() => document.querySelectorAll('#dOpts button')[0].click()); await z.waitForTimeout(800); ok(reqs.length > before && /\/bunte-insel\/\?from=zotik$/.test(reqs[reqs.length - 1]), 'Zotik-Spiel: „Hinüberreisen“ öffnet die Bunte Insel');
  await z.goto(BASE + '/zotik/index.html'); await z.waitForTimeout(1200); reqs.length = 0; await z.evaluate(() => { document.getElementById('tmenu').hidden = false; }); await z.click('#bBunt').catch(() => { }); await z.waitForTimeout(800);
  ok(reqs.some(u => /\/bunte-insel\/\?from=zotik$/.test(u)), 'Zotik-Spiel: Knopf im Titel-Menü öffnet die Bunte Insel');
  const sv = await z.evaluate(() => Object.keys(localStorage).filter(k => /zotik2_save/.test(k)).length); ok(sv === 0, 'Zotik-Spiel: Titel-Knopf legt keinen Spielstand an und überschreibt keinen (Platz 1 bleibt)');
  /* Ankunft aus der Bunten Insel: in Lunaris am grünen Tor, Adresse bereinigt */
  await z.goto(BASE + '/zotik/index.html?from=bunteinsel'); await z.waitForTimeout(1200);
  const ar = await z.evaluate(() => { const Zt = window.__zotik, S = Zt.S(); S.ch = 1; S.x = 30; S.z = 30; Zt.begin(false); const o = Zt.INT.find(x => x.name === 'Bunte Insel'); return { near: Math.hypot(Zt.pl.x - o.x, Zt.pl.z - (o.z - 2.4)) < 6, clean: !/from=/.test(location.search) }; });
  ok(ar.near && ar.clean, 'Zotik-Spiel: Ankunft aus der Bunten Insel setzt dich in Lunaris am grünen Tor ab (Adresse bereinigt)');
  ok(zerrs.length === 0, 'Zotik-Spiel: keine Seitenfehler' + (zerrs.length ? ' – ' + zerrs.join('|') : ''));
  await z.close();
}
ok(errs.length === 0, 'Keine Konsolen-/Seitenfehler' + (errs.length ? '\n' + errs.slice(0, 5).join('\n') : ''));
await browser.close(); console.log(fails ? '\n' + fails + ' FEHLER' : '\nAlles gut ✅'); process.exit(fails ? 1 : 0);
