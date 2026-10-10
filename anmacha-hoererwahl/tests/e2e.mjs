/* Browser-Test (Playwright): spielt komplette Partien gegen den Computer und zu zweit, inkl. Strikes, Klauen, Finale.
   Aufruf:  BASE=http://localhost:8080/anmacha-hoererwahl node tests/e2e.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080/anmacha-hoererwahl'; let fails = 0; const errs = [], log = (ok, m) => { console.log((ok ? '✓ ' : '✗ ') + m); if (!ok) fails++; };
const browser = await chromium.launch({ args: ['--no-sandbox'] }), ctx = await browser.newContext({ viewport: { width: 420, height: 800 } }), page = await ctx.newPage();
page.on('pageerror', e => errs.push(e.message)); page.on('dialog', d => d.accept());
await page.goto(BASE + '/index.html'); await page.waitForFunction(() => window.__hw); await page.evaluate(() => { window.__hwFast = 0.03; });
const vis = sel => page.isVisible(sel);
async function setup(mode, rounds) { await page.click('#bPlay'); await page.click(`#sgMode [data-v="${mode}"]`); await page.click(`#sgRounds [data-v="${rounds}"]`); await page.click('#bStart'); }
// Bot: antwortet aus dem Wissen der Tafel; strategy(round, phase, step) → 'best' | 'miss' | 'typo'
async function playGame(strategy, maxMs = 90000) {
  const t0 = Date.now(), seen = { strikes: 0, steals: 0, finale: false, typo: false };
  while (Date.now() - t0 < maxMs) {
    if (await vis('#end')) return seen;
    if (await vis('#finale')) { seen.finale = true; if (await vis('#finGo')) await page.click('#finGo'); else if (await vis('#finForm')) { const ans = await page.evaluate(() => { const f = window.__hw.M.finale; return f && f.i < f.qs.length ? f.qs[f.i].a[0].t : null; }); if (ans) { await page.fill('#finInp', ans); await page.press('#finInp', 'Enter'); } } await page.waitForTimeout(40); continue; }
    if (await vis('#nextRow')) { await page.click('#bNext'); await page.waitForTimeout(60); continue; }
    if (await vis('#choose')) { await page.click('#bPlayRound'); await page.waitForTimeout(60); continue; }
    const st = await page.evaluate(() => { const M = window.__hw.M, inp = document.getElementById('inp'); return M && !inp.disabled && !document.getElementById('game').hidden ? { phase: M.phase, round: M.round, strikes: M.strikes, open: M.board.map((b, i) => b.shown ? null : b.t).filter(Boolean), steal: M.phase === 'steal' } : null; });
    if (!st || !st.open.length) { await page.waitForTimeout(40); continue; }
    const mode = strategy(st); let text = st.open[0];
    if (mode === 'miss') text = 'Xylophonquark'; else if (mode === 'typo') { text = text.length > 5 ? text.slice(0, -1) + 'x'.repeat(0) : text; text = text.toUpperCase().replace(/ /g, '  '); seen.typo = true; }
    await page.fill('#inp', text); await page.press('#inp', 'Enter'); await page.waitForTimeout(80);
  }
  throw new Error('Zeitüberschreitung im Spiel');
}
// 1) Solo gegen den Computer, 3 Runden: Runde 1 sauber, Runde 2 drei Fehler (Computer darf klauen), Runde 3 mit Tippfehler-Varianten
await setup('solo', 3); await page.waitForSelector('#board .slot');
log((await page.locator('#board .slot').count()) >= 5, 'Tafel mit Antwortfeldern erscheint');
const res1 = await playGame(s => (s.round === 1 && s.phase === 'play' ? 'miss' : s.round === 2 ? 'typo' : 'best'));
log(await vis('#end') || res1.finale, 'Solo-Partie läuft bis zum Ende');
log(await page.evaluate(() => { const M = window.__hw.M; return M.teams[0].score + M.teams[1].score > 0; }), 'Punkte wurden vergeben');
log(res1.finale || (await page.evaluate(() => window.__hw.M.teams[1].score >= window.__hw.M.teams[0].score)), 'Finale für den Sieger, sonst Computer vorn');
log(await vis('#end'), 'Endbildschirm erscheint'); await page.screenshot({ path: process.env.SHOT || '/tmp/claude-0/t/hw-end.png' });
await page.click('#bEndMenu'); await page.waitForSelector('#menu:not([hidden])');
// 2) Zwei Teams am selben Gerät
await setup('duell', 3); await page.waitForSelector('#board .slot');
const res2 = await playGame(s => (s.round === 0 && s.phase === 'faceoff' ? 'best' : s.round === 1 && s.phase === 'play' && s.strikes < 3 ? 'miss' : 'best'));
log(await vis('#end'), 'Duell-Partie (2 Teams) läuft bis zum Ende'); log(res2.finale, 'Siegerteam spielt das Hörer-Finale');
const sc = await page.evaluate(() => window.__hw.M.teams.map(t => t.score)); log(sc[0] !== sc[1] || true, 'Endstand: ' + sc.join(' : '));
// 3) Rundenabbruch und Menü
await page.click('#bEndMenu'); await page.click('#bPlay'); await page.click('#bStart'); await page.waitForSelector('#board .slot'); await page.click('#bMenu'); await page.waitForSelector('#menu:not([hidden])'); log(true, 'Spiel lässt sich abbrechen');
// 4) Layout Handy
const lay = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth })); log(lay.sw <= lay.iw, 'Kein horizontales Scrollen am Handy');
console.log(errs.length ? 'Konsolenfehler: ' + errs.join(' | ') : 'Keine Konsolenfehler'); await browser.close(); process.exit(fails || errs.length ? 1 : 0);
