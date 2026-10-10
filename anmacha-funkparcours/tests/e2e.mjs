/* Browser-Test (Playwright): Show mit 2 Läufern am selben Gerät (Planer-Bot steuert über window.__fpInput), Wertung, Training mit Geist, Touch-Pad.
   Aufruf:  BASE=http://localhost:8080/anmacha-funkparcours [THREE=/pfad/three.min.js] node tests/e2e.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080/anmacha-funkparcours'; let fails = 0; const errs = [], log = (ok, m) => { console.log((ok ? '✓ ' : '✗ ') + m); if (!ok) fails++; };
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const mk = async (o) => { const ctx = await browser.newContext(o), p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.accept());
  if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' })); await p.goto(BASE + '/index.html'); await p.waitForFunction(() => window.__fp, null, { timeout: 30000 }); return p; };
const SHOT = process.env.SHOT || '/tmp';
const bot = p => p.evaluate(async () => { const { plan } = await import('./bot.js'); let c = {}, until = 0, hold = 0, lastT = 0; window.__fpBot = true; window.__fpInput = sim => { if (window.__fpStupid) return { r: 1 }; if (sim.t < lastT) until = 0; lastT = sim.t; if (sim.t >= until) { c = plan(sim); until = sim.t + 0.05; hold = sim.t + (c.hold || 0.1); } return { l: c.l, r: c.r, j: c.j && sim.t < hold, g: c.g }; }; });
const phase = (p, ph, ms = 60000) => p.waitForFunction(x => window.__fp.G && window.__fp.G.phase === x, ph, { timeout: ms, polling: 100 });

{ // ---- Show, 2 Läufer
  const p = await mk({ viewport: { width: 1000, height: 600 } }); await bot(p); await p.evaluate(() => { window.__fpFast = 3; });
  await p.click('#bPlay'); await p.click('#sgPl [data-v="2"]'); await p.fill('#names input[data-i="0"]', 'Anna'); await p.fill('#names input[data-i="1"]', 'Ben'); await p.click('#bStart');
  let shots = 0;
  for (let ci = 0; ci < 3; ci++) {
    for (let pi = 0; pi < 2; pi++) {
      await p.waitForSelector('#bReady', { timeout: 30000 }); if (ci === 0 && pi === 1) { log((await p.textContent('#cardBox')).includes('Anna'), 'Bereit-Karte zeigt die bisherigen Zeiten'); }
      await p.evaluate(([c, i]) => { window.__fpStupid = c === 0 && i === 1; }, [ci, pi]); await p.keyboard.press('Space');
      await phase(p, 'run'); if (ci === 1 && pi === 0) { await p.waitForTimeout(2500); await p.screenshot({ path: `${SHOT}/fp-run${shots++}.png` }); }
      await phase(p, 'done', 90000);
    }
    await p.waitForSelector('#bNext', { timeout: 30000 });
    const t = await p.textContent('#cardBox'); log(/Wertung/.test(t) && t.includes('Anna') && t.includes('Ben'), `Parcours ${ci + 1}: Wertung zeigt beide Läufer`);
    if (ci === 0) { const pts = await p.evaluate(() => window.__fp.G.players.map(x => x.pts)); log(pts[0] === 2 && pts[1] === 1, 'Platzierungspunkte: Finisher 2, Absturz 1 (' + pts + ')'); await p.screenshot({ path: `${SHOT}/fp-board.png` }); }
    await p.click('#bNext');
  }
  await p.waitForSelector('#bAgain', { timeout: 10000 }); const end = await p.textContent('#cardBox'); log(end.includes('Anna') && end.includes('gewinnt'), 'Endstand nennt den Sieger'); log(await p.isVisible('#cardBox .prize img'), 'Radioportal-Logo am Ende'); await p.screenshot({ path: `${SHOT}/fp-end.png` });
  const b = await p.evaluate(() => JSON.parse(localStorage.getItem('fpBest1') || '{}')); log(!!b[0] && !!b[1] && !!b[2] && b[0].g.length > 20, 'Bestzeiten + Geist gespeichert');
  await p.click('#bToMenu'); await p.waitForSelector('#menu:not([hidden])'); log(true, 'Zurück im Menü');
  await p.close();
}
{ // ---- Training mit Geist, Handy-Format + Touch-Pad
  const p = await mk({ viewport: { width: 420, height: 820 }, hasTouch: true, isMobile: true }); await p.evaluate(() => { window.__fpFast = 3; });
  await p.click('#bTrain'); await p.click('#sgCourse [data-v="0"]'); await p.click('#bStart'); await p.waitForSelector('#bReady'); log(await p.isVisible('#bReady'), 'Training: Bereit-Karte'); await p.click('#bReady'); await phase(p, 'run');
  const x0 = await p.evaluate(() => window.__fp.G.sim.x); const bt = p.locator('#pad [data-k="r"]'); await bt.dispatchEvent('pointerdown', { pointerId: 7, bubbles: true }); await p.waitForTimeout(500);
  const x1 = await p.evaluate(() => window.__fp.G.sim.x); await bt.dispatchEvent('pointerup', { pointerId: 7, bubbles: true }); log(x1 > x0 + 1, 'Touch-Pad „rechts" bewegt den Läufer (' + x0.toFixed(1) + ' → ' + x1.toFixed(1) + ')'); await p.screenshot({ path: `${SHOT}/fp-mobile.png` });
  await phase(p, 'done', 90000); await p.waitForSelector('#bAgain', { timeout: 10000 }); log(/Baden|Zeit|Nochmal/.test(await p.textContent('#cardBox')), 'Training: Ergebnis-Karte');
  const lay = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth })); log(lay.sw <= lay.iw, 'Kein horizontales Scrollen am Handy');
  await bot(p); await p.click('#bAgain'); await p.waitForSelector('#bReady'); await p.click('#bReady'); await phase(p, 'run'); await phase(p, 'done', 90000); await p.waitForSelector('#bAgain'); const t = await p.textContent('#cardBox'); log(/Bestzeit/.test(t), 'Bot-Lauf: Bestzeit wird gemeldet'); await p.click('#bAgain'); await p.waitForSelector('#bReady'); log(await p.evaluate(() => !!window.__fp.G.ghost), 'Geist der Bestzeit ist aktiv'); await p.click('#bReady'); await phase(p, 'run'); await p.waitForTimeout(1500); await p.screenshot({ path: `${SHOT}/fp-ghost.png` });
  await p.close();
}
console.log(errs.length ? 'Konsolenfehler: ' + errs.join(' | ') : 'Keine Konsolenfehler'); await browser.close(); process.exit(fails || errs.length ? 1 : 0);
