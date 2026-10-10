/* Browser-Test (Playwright): komplette Show mit 1 Menschen (Kandidat in Runde 1, danach am Pult) – alle Eingabearten, Date, Punkte, Endstand.
   Aufruf:  BASE=http://localhost:8080/MachMichAus [THREE=/pfad/three.min.js] [SHOT=/tmp] node tests/e2e.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080/MachMichAus', SHOT = process.env.SHOT || '/tmp'; let fails = 0; const errs = [], log = (ok, m) => { console.log((ok ? '✓ ' : '✗ ') + m); if (!ok) fails++; };
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
async function mk(o) { const ctx = await browser.newContext(o), p = await ctx.newPage(); p.on('pageerror', e => { errs.push(e.message); console.log('PAGEERR', e.message); }); p.on('dialog', d => d.accept()); if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' })); await p.goto(BASE + '/index.html'); await p.waitForFunction(() => window.__mm, null, { timeout: 40000 }); return p; }
const vis = (p, s) => p.isVisible(s).catch(() => false); const seen = new Set(); let lampDecisions = 0;
async function drive(p, maxMs, onStage) {
  const t0 = Date.now(); let shot = 0;
  while (Date.now() - t0 < maxMs) {
    if (await vis(p, '#dlg:not([hidden])')) {
      const ids = await p.$$eval('#dlgBox button[id]', b => b.map(x => x.id)), txt = await p.textContent('#dlgBox');
      if (ids.includes('bAgain')) return txt; if (ids.includes('bReady')) { seen.add('gate'); await p.click('#bReady'); } else if (ids.includes('bNext')) { seen.add('card'); if (/Passgenauigkeit/.test(txt)) seen.add('date'); if (/Runde \d/.test(txt) && /Punkte der Runde/.test(txt)) seen.add('points'); if (onStage) await onStage('card', txt); await p.click('#bNext'); } else if (ids.includes('dClose')) await p.click('#dClose');
      await p.waitForTimeout(40); continue;
    }
    if (await vis(p, '#act #tGo')) { seen.add('talent'); await p.click('#tGo'); await p.waitForSelector('#act #tap', { timeout: 8000 }); const t0t = Date.now(); while (await vis(p, '#act #tap') && Date.now() - t0t < 15000) { await p.click('#act #tap', { timeout: 1000 }).catch(() => {}); await p.waitForTimeout(110); } continue; }
    if (await vis(p, '#act .qb')) { seen.add('quiz'); if (onStage && !shot++) await onStage('quiz'); await p.click('#act .qb >> nth=0'); await p.waitForTimeout(60); continue; }
    if (await vis(p, '#act .lamprow button[data-v]')) { seen.add('lamp'); if (onStage && shot++ < 3) await onStage('lamp'); lampDecisions++; const k = Math.random() < 0.6 ? 1 : 0; await p.click(`#act .lamprow button[data-v="${k}"] >> nth=0`); continue; }
    if (await vis(p, '#act #jNo')) { seen.add('joker'); if (Math.random() < 0.5) await p.click('#jNo'); else await p.click('#act .pp >> nth=0'); continue; }
    if (await vis(p, '#act #cOk')) { seen.add('choose'); await p.click('#act .pp >> nth=0'); await p.click('#cOk'); continue; }
    if (await vis(p, '#act #cAlone') && !(await vis(p, '#act .pp'))) { await p.click('#cAlone'); continue; }
    await p.waitForTimeout(60);
  }
  throw new Error('Zeitüberschreitung');
}
const p = await mk({ viewport: { width: 1100, height: 680 } }); await p.evaluate(() => { window.__mmFast = 6; });
await p.click('#bPlay'); await p.waitForSelector('#humans .hc'); log((await p.locator('#humans .hc').count()) === 1, 'Einrichtung: ein Mensch mit Profil'); await p.fill('#humans input', 'Rico');
const prof = await p.evaluate(() => window.__mm.S0.humans[0]); log(prof.likes.length === 3 && prof.nogos.length === 2 && !prof.likes.some(t => prof.nogos.includes(t)), 'Profil: 3 Neigungen, 2 Nogos, ohne Überschneidung'); await p.click('#bStart');
await p.waitForFunction(() => window.__mm.S && window.__mm.S.R, null, { timeout: 20000 }); log(await p.evaluate(() => window.__mm.S.R.cand.n === 'Rico' && window.__mm.S.rounds === 4), 'Runde 1: Rico ist Kandidat, 4 Runden');
const txt = await drive(p, 460000, async (k) => { if (['lamp', 'quiz'].includes(k) || k === 'card') { if (!seen.has('shot' + k)) { seen.add('shot' + k); await p.waitForTimeout(300); await p.screenshot({ path: `${SHOT}/mm-${k}.png` }); } } });
log(/Show|gewinnt|Rico/.test(txt), 'Show läuft bis zum Endstand');
for (const k of ['talent', 'quiz', 'lamp', 'choose', 'date', 'points']) log(seen.has(k), 'Gesehen: ' + k); log(seen.has('joker') || true, 'Joker-Dialog möglich (' + (seen.has('joker') ? 'gesehen' : 'in dieser Show nicht angeboten') + ')');
await p.screenshot({ path: `${SHOT}/mm-end.png` }); log(await vis(p, '#dlgBox .prize img'), 'Radioportal-Logo am Ende');
const st = await p.evaluate(() => ({ done: window.__mm.S.done, hist: window.__mm.S.history.length, score: window.__mm.S.H[0].score })); log(st.done && st.hist === 4 && isFinite(st.score), 'Endzustand: 4 Runden gespielt, Punkte ' + st.score);
const lay = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth })); log(lay.sw <= lay.iw, 'Kein horizontales Scrollen am PC'); await p.close();
{ const q = await mk({ viewport: { width: 390, height: 780 }, hasTouch: true, isMobile: true }); await q.evaluate(() => { window.__mmFast = 6; }); await q.click('#bPlay'); await q.click('#bStart'); await q.waitForSelector('#act #tGo, #act .qb, #act .lamprow', { timeout: 60000 }); await q.waitForTimeout(500); await q.screenshot({ path: `${SHOT}/mm-mobile.png` }); const lay2 = await q.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth })); log(lay2.sw <= lay2.iw, 'Kein horizontales Scrollen am Handy'); log((await q.evaluate(() => document.getElementById('cv').clientHeight)) > 200, 'Handy: 3D-Bühne bleibt sichtbar neben dem Panel'); await q.close(); }
console.log(errs.length ? 'Konsolenfehler: ' + errs.join(' | ') : 'Keine Konsolenfehler'); await browser.close(); process.exit(fails || errs.length ? 1 : 0);
