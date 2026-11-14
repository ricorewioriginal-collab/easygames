/* Rückweg aus den Portal-Spielen: Knopf „Zurück zur Bunten Insel“ im Zielspiel (rueckweg.js) und Ankunft vor dem passenden Portal (?from=<spiel>).
   Aufruf: LANG=de_DE.UTF-8 node bunte-insel/tests/rueckweg.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
let fails = 0; const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
const page = async () => { const p = await (await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'de-DE', hasTouch: true })).newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
  await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort()); return p; };
/* 1. Knopf in jedem Portal-Spiel (nur Seite laden, Spiel muss nicht starten) */
for (const [g, f] of [['gay-life', ''], ['aeru', ''], ['anmacha-podcast-tycoon', ''], ['anmacha-markthalle', ''], ['taschi', 'index.html']]) {
  const p = await page(); await p.route(u => !/rueckweg\.js|\/index\.html$|\/$|\?from=/.test(u.pathname + u.search), r => r.abort());
  await p.goto(BASE + '/' + g + '/' + f + '?from=bunteinsel', { waitUntil: 'domcontentloaded' }); await p.waitForSelector('#egBuntBack', { timeout: 15000 }).catch(() => { });
  const href = await p.evaluate(() => { const a = document.getElementById('egBuntBack'); return a ? a.href : ''; });
  ok(href.endsWith('/bunte-insel/?from=' + g), g + ': Knopf „Zurück zur Bunten Insel“ → ' + href.replace(/^https?:\/\/[^/]+/, ''));
  await p.context().close();
}
{ const p = await page(); await p.route(u => !/rueckweg\.js|\/$/.test(u.pathname), r => r.abort()); await p.goto(BASE + '/gay-life/', { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(800);
  ok(!(await p.$('#egBuntBack')), 'ohne ?from=bunteinsel kein Knopf'); await p.context().close(); }
/* 2. Ankunft auf der Insel vor dem Portal */
for (const g of ['aeru', 'taschi']) {
  const p = await page(); await p.goto(BASE + '/bunte-insel/index.html?from=' + g); await p.waitForFunction(() => window.__bi, null, { timeout: 90000 }); await p.click('#bStart');
  await p.waitForFunction(() => !__bi.portale.arrive, null, { timeout: 60000 }).catch(() => { });
  const r = await p.evaluate(g => { const b = __bi, q = g === 'taschi' ? b.W.spots.taschiportal : b.portale.at(g); return { d: Math.hypot(b.P.x - q.x, b.P.z - q.z), url: location.search, near: !!(g === 'taschi' ? b.taschi.near() : b.portale.near()) }; }, g);
  ok(r.d < 3 && r.near && !/from=/.test(r.url), g + ': Ankunft direkt vor dem Portal (' + r.d.toFixed(1) + ' m), Adresse wieder sauber');
  ok(!p.errs.length, g + ': keine JS-Fehler ' + p.errs.slice(0, 2).join(' | ')); await p.context().close();
}
console.log(fails ? fails + ' FEHLER' : 'Alles gut ✅'); await browser.close(); process.exit(fails ? 1 : 0);
