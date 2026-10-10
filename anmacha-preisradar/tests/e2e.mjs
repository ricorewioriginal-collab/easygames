/* Browser-Test (Playwright): spielt Shows mit Menschen am selben Gerät (Hot-Seat) und Computer-Gegnern.
   Aufruf:  BASE=http://localhost:8080/anmacha-preisradar node tests/e2e.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080/anmacha-preisradar'; let fails = 0; const errs = [], log = (ok, m) => { console.log((ok ? '✓ ' : '✗ ') + m); if (!ok) fails++; };
const browser = await chromium.launch({ args: ['--no-sandbox'] }), ctx = await browser.newContext({ viewport: { width: 420, height: 820 } }), page = await ctx.newPage();
page.on('pageerror', e => errs.push(e.message)); page.on('dialog', d => d.accept());
await page.goto(BASE + '/index.html'); await page.waitForFunction(() => window.__pr); await page.evaluate(() => { window.__prFast = 0.04; });
async function setup(hum, cpu, len) { await page.click('#bPlay'); await page.click(`#sgHum [data-v="${hum}"]`); await page.click(`#sgCpu [data-v="${cpu}"]`); await page.click(`#sgLen [data-v="${len}"]`); await page.click('#bStart'); await page.waitForSelector('#stage .prod, #stage .cart'); }
const seenKinds = new Set(); let secret = true;
async function play(maxMs = 110000) {
  const t0 = Date.now();
  while (Date.now() - t0 < maxMs) {
    if (await page.isVisible('#end')) return;
    if (await page.isVisible('#bNext')) { await page.click('#bNext'); await page.waitForTimeout(60); continue; }
    if (await page.isVisible('#inDlg')) {
      const kind = await page.evaluate(() => window.__pr.SH.spec.kind); seenKinds.add(kind);
      if (kind === 'bid' || kind === 'final') { await page.fill('#bidInp', String(Math.floor(Math.random() * 90) + 1) + ',50'); await page.press('#bidInp', 'Enter'); }
      else if (kind === 'dial') { await page.click('#dOk'); }
      else if (kind === 'hilo') { for (let i = 0; i < 3; i++) { await page.click('#inDlg [data-v="1"]'); } }
      else { await page.click('#inDlg .ct >> nth=0'); await page.click('#inDlg .ct >> nth=2'); await page.click('#cOk'); }
      await page.waitForTimeout(80); continue;
    }
    if (await page.isVisible('#bReady')) { // Hot-Seat: Gebote dürfen vor dem Bereit-Klick nicht sichtbar sein
      secret = secret && !(await page.isVisible('#bidInp')); await page.click('#bReady'); await page.waitForTimeout(60); continue; }
    await page.waitForTimeout(60);
  }
  throw new Error('Zeitüberschreitung');
}
await setup(2, 1, 4); log((await page.locator('#players .pl').count()) === 3, 'Drei Spieler (2 Menschen + 1 Computer)');
await play(); log(await page.isVisible('#end'), 'Show (4 Spiele + Finale) läuft bis zum Ende'); log(['bid', 'dial', 'hilo', 'cart', 'final'].every(k => seenKinds.has(k)), 'Alle fünf Rundenarten kamen vor: ' + [...seenKinds].join(', ')); log(secret, 'Gebote sind vor „Bereit“ nicht sichtbar (geheim)');
log((await page.locator('#endScores div').count()) === 3, 'Endstand zeigt alle Spieler'); log(await page.isVisible('.prize img'), 'Radioportal-Logo am Ende'); await page.screenshot({ path: process.env.SHOT || '/tmp/claude-0/t/pr-end.png' });
const tot = await page.evaluate(() => window.__pr.SH.players.map(p => p.total)); log(tot.some(t => t > 0), 'Punkte wurden vergeben: ' + tot.join(' : '));
await page.click('#bEndMenu'); await page.click('#bPlay'); await page.click('#bStart'); await page.waitForSelector('#stage .prod'); await page.click('#bMenu'); await page.waitForSelector('#menu:not([hidden])'); log(true, 'Show lässt sich abbrechen');
const lay = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth })); log(lay.sw <= lay.iw, 'Kein horizontales Scrollen am Handy');
console.log(errs.length ? 'Konsolenfehler: ' + errs.join(' | ') : 'Keine Konsolenfehler'); await browser.close(); process.exit(fails || errs.length ? 1 : 0);
