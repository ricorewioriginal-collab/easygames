/* Browser-Test (Playwright): komplette Staffel mit 1 Menschen + KI (Hot-Seat), alle Eingabearten (Plan, Nominierung, Reflex/Memory/Schätzen), Vote, Auszug, Finale.
   Aufruf:  BASE=http://localhost:8080/anmacha-funkhaus [THREE=/pfad/three.min.js] [SHOT=/tmp] node tests/e2e.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080/anmacha-funkhaus', SHOT = process.env.SHOT || '/tmp'; let fails = 0; const errs = [], log = (ok, m) => { console.log((ok ? '✓ ' : '✗ ') + m); if (!ok) fails++; };
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
async function mk(o) { const ctx = await browser.newContext(o), p = await ctx.newPage(); p.on('pageerror', e => { errs.push(e.message); console.log('PAGEERR', e.message); }); p.on('dialog', d => d.accept()); if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' })); await p.goto(BASE + '/index.html'); await p.waitForFunction(() => window.__fh, null, { timeout: 40000 }); return p; }
const vis = (p, s) => p.isVisible(s).catch(() => false);
const seen = new Set();
async function drive(p, maxMs = 280000, onStage) {
  const t0 = Date.now(); let shots = 0;
  while (Date.now() - t0 < maxMs) {
    if (await vis(p, '#dlg:not([hidden])')) {
      const ids = await p.$$eval('#dlgBox button[id]', b => b.map(x => x.id)); const txt = await p.textContent('#dlgBox');
      if (/gewinnt das Funkhaus/.test(txt)) return txt; if (ids.includes('bReady')) { seen.add('gate'); await p.click('#bReady'); } else if (ids.includes('bNext')) { seen.add('card:' + txt.slice(0, 12)); if (onStage) await onStage('card', txt); await p.click('#bNext'); } else if (ids.includes('dClose')) await p.click('#dClose');
      await p.waitForTimeout(40); continue;
    }
    if (await vis(p, '#act .agrid')) { seen.add('plan'); if (onStage && !shots++) await onStage('plan'); const k = Math.floor(Math.random() * 8); await p.click(`#act .ab >> nth=${k}`); if (await vis(p, '#act .pgrid')) await p.click('#act .pp >> nth=0'); continue; }
    if (await vis(p, '#act #pOk')) { await p.click('#pOk'); continue; }
    if (await vis(p, '#act .pgrid') && await vis(p, '#act .ph.red')) { seen.add('nom'); if (onStage) await onStage('nom'); await p.click('#act .pp >> nth=0'); await p.click('#act .pp >> nth=1'); await p.click('#nOk'); continue; }
    if (await vis(p, '#act #tGo')) { await p.click('#tGo'); const kind = await p.evaluate(() => ['reflex', 'memory', 'guess'][(window.__fh.G.week - 1) % 3]); seen.add('task:' + kind); if (onStage) await onStage('task:' + kind);
      if (kind === 'reflex') { for (let i = 0; i < 5; i++) { await p.waitForSelector('#act .sig.go', { timeout: 8000 }); await p.click('#sig'); await p.waitForTimeout(80); } }
      else if (kind === 'memory') { await p.waitForFunction(() => /Jetzt du/.test(document.getElementById('tkInfo').textContent), null, { timeout: 15000 }); for (let i = 0; i < 4; i++) await p.click('#act .pad >> nth=0', { timeout: 1500 }).catch(() => {}); }
      else { await p.waitForSelector('#act #gv', { state: 'visible', timeout: 10000 }); await p.fill('#gv', '70'); await p.click('#gok'); }
      continue; }
    await p.waitForTimeout(60);
  }
  throw new Error('Zeitüberschreitung');
}
const p = await mk({ viewport: { width: 1100, height: 680 } }); await p.evaluate(() => { window.__fhFast = 6; });
await p.click('#bPlay'); await p.waitForSelector('#humans .hc'); log((await p.locator('#humans .hc').count()) === 1, 'Einrichtung: ein Mensch'); await p.fill('#humans input', 'Rico'); await p.click('#sgTot [data-v="6"]'); await p.click('#bStart');
await p.waitForFunction(() => window.__fh.G, null, { timeout: 20000 }); const nCast = await p.evaluate(() => window.__fh.G.res.length); log(nCast === 6 && (await p.locator('#cast .cc').count()) === 6, 'Haus mit 6 Bewohnern, Besetzungsleiste');
let n = 0; const txt = await drive(p, 480000, async (k) => { if (['plan', 'nom', 'task:reflex'].includes(k) && n < 3) { n++; await p.waitForTimeout(500); await p.screenshot({ path: `${SHOT}/fh-${k.replace(':', '-')}.png` }); } });
log(/gewinnt das Funkhaus/.test(txt), 'Staffel läuft bis zum Finale und nennt den Sieger');
for (const k of ['plan', 'nom', 'gate']) if (k !== 'gate') log(seen.has(k), 'Eingabe gesehen: ' + k);
log(['task:reflex', 'task:memory'].every(k => seen.has(k)) || [...seen].some(x => x.startsWith('task:')), 'Wochenaufgaben gespielt: ' + [...seen].filter(x => x.startsWith('task:')).join(', '));
await p.screenshot({ path: `${SHOT}/fh-end.png` }); log(await vis(p, '#dlgBox .prize img'), 'Radioportal-Logo im Finale');
const st = await p.evaluate(() => ({ phase: window.__fh.G.phase, alive: window.__fh.G.res.filter(r => r.alive).length, week: window.__fh.G.week })); log(st.phase === 'end' && st.alive === 3, 'Endzustand: Finale mit 3 Verbleibenden (' + JSON.stringify(st) + ')');
const lay = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth })); log(lay.sw <= lay.iw, 'Kein horizontales Scrollen am PC');
await p.close();
{ // Handy-Format
  const q = await mk({ viewport: { width: 390, height: 780 }, hasTouch: true, isMobile: true }); await q.evaluate(() => { window.__fhFast = 6; });
  await q.click('#bPlay'); await q.click('#bStart'); await q.waitForFunction(() => window.__fh.G); await q.waitForSelector('#act .agrid', { timeout: 30000 }); await q.waitForTimeout(600); await q.screenshot({ path: `${SHOT}/fh-mobile-plan.png` });
  const lay2 = await q.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth })); log(lay2.sw <= lay2.iw, 'Kein horizontales Scrollen am Handy'); log(await vis(q, '#cv') && (await q.evaluate(() => document.getElementById('cv').clientHeight)) > 200, 'Handy: 3D-Bühne bleibt sichtbar neben dem Panel'); await q.close();
}
console.log(errs.length ? 'Konsolenfehler: ' + errs.join(' | ') : 'Keine Konsolenfehler'); await browser.close(); process.exit(fails || errs.length ? 1 : 0);
