/* Browser-Test (Playwright): spielt Partien mit Menschen am selben Gerät und Computer-Gegnern.
   Aufruf:  BASE=http://localhost:8080/anmacha-frequenzrad node tests/e2e.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080/anmacha-frequenzrad'; let fails = 0; const errs = [], log = (ok, m) => { console.log((ok ? '✓ ' : '✗ ') + m); if (!ok) fails++; };
const browser = await chromium.launch({ args: ['--no-sandbox'] }), ctx = await browser.newContext({ viewport: { width: 420, height: 820 } }), page = await ctx.newPage();
page.on('pageerror', e => errs.push(e.message)); page.on('dialog', d => d.accept());
await page.goto(BASE + '/index.html'); await page.waitForFunction(() => window.__fr); await page.evaluate(() => { window.__frFast = 0.04; });
async function setup(hum, cpu, rounds) { await page.click('#bPlay'); await page.click(`#sgHum [data-v="${hum}"]`); await page.click(`#sgCpu [data-v="${cpu}"]`); await page.click(`#sgRounds [data-v="${rounds}"]`); await page.click('#bStart'); await page.waitForSelector('#tboard .tile.on'); }
// Bot: spielt als Mensch über die Oberfläche (Klicks). strategy: 'solve' löst sofort, 'letters' rät Buchstaben bis fast alles da ist
async function play(strategy, maxMs = 100000) {
  const t0 = Date.now(), seen = { spins: 0, letters: 0, solves: 0, buys: 0 };
  while (Date.now() - t0 < maxMs) {
    if (await page.isVisible('#end')) return seen;
    if (await page.isVisible('#bNext')) { await page.click('#bNext'); await page.waitForTimeout(80); continue; }
    const st = await page.evaluate(() => { const G = window.__fr.G; if (!G || !window.__fr.awaiting) return null; const t = G.puzzle.t, all = [...t].filter(c => /[A-ZÄÖÜ]/.test(c)), open = all.filter(c => !G.rev.has(c)); const V = new Set([...'AEIOUÄÖÜ']); return { phase: G.phase, ratio: G.ratio, text: t, consOpen: [...new Set(open.filter(c => !V.has(c)))], vowOpen: [...new Set(open.filter(c => V.has(c)))], anyCons: 'NSRTDHLCGMBWFKZPVJXQY'.split('').filter(c => !G.rev.has(c)), anyVow: 'EAIOUÄÖÜ'.split('').filter(c => !G.rev.has(c)), canBuy: G.canBuy(), cpu: G.isCpu }; });
    if (!st || st.cpu) { await page.waitForTimeout(60); continue; }
    if (['consonant'].includes(st.phase)) { const ch = (st.consOpen[0] || st.anyCons[0]); await page.click(`#act [data-k="${ch}"]`); seen.letters++; continue; }
    if (['vowel', 'vowelFree'].includes(st.phase)) { const ch = (st.vowOpen[0] || st.anyVow[0]); await page.click(`#act [data-k="${ch}"]`); seen.letters++; continue; }
    if (st.ratio >= (strategy === 'solve' ? 0 : 0.7)) { await page.click('#bSolve'); await page.fill('#sinp', st.text.toLowerCase()); await page.press('#sinp', 'Enter'); seen.solves++; continue; }
    if (st.canBuy && Math.random() < 0.5 && await page.isVisible('#bBuy')) { await page.click('#bBuy'); seen.buys++; continue; }
    await page.click('#bSpin'); seen.spins++; await page.waitForTimeout(40);
  }
  throw new Error('Zeitüberschreitung im Spiel');
}
// 1) 1 Mensch gegen 2 Computer, 3 Runden (Mensch löst sofort → testet Lösen, Computer drehen/raten)
await setup(1, 2, 3); log((await page.locator('#players .pl').count()) === 3, 'Drei Spieler (1 Mensch + 2 Computer)'); log((await page.locator('#tboard .tile.on').count()) >= 8, 'Rätseltafel mit Buchstabenfeldern');
const r1 = await play('solve'); log(await page.isVisible('#end'), 'Partie gegen Computer läuft bis zum Ende (' + r1.solves + ' Lösungen)'); await page.screenshot({ path: process.env.SHOT || '/tmp/claude-0/t/fr-end.png' }); log((await page.locator('#endScores div').count()) === 3, 'Endstand zeigt alle drei Spieler');
await page.click('#bEndMenu');
// 2) 2 Menschen am selben Gerät, Buchstaben raten, dann lösen
await setup(2, 0, 3); const r2 = await play('letters'); log(await page.isVisible('#end'), 'Partie zu zweit (Buchstaben raten, Vokale kaufen, Lösen) bis zum Ende'); log(r2.letters > 5 && r2.spins > 3, `Rad gedreht (${r2.spins}×) und Buchstaben gewählt (${r2.letters}×)`);
const tot = await page.evaluate(() => window.__fr.G.players.map(p => p.total)); log(tot.some(t => t >= 500), 'Punkte wurden vergeben: ' + tot.join(' : '));
// 3) Abbrechen + Layout
await page.click('#bEndMenu'); await page.click('#bPlay'); await page.click('#bStart'); await page.waitForSelector('#tboard .tile.on'); await page.click('#bMenu'); await page.waitForSelector('#menu:not([hidden])'); log(true, 'Spiel lässt sich abbrechen');
const lay = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth })); log(lay.sw <= lay.iw, 'Kein horizontales Scrollen am Handy');
console.log(errs.length ? 'Konsolenfehler: ' + errs.join(' | ') : 'Keine Konsolenfehler'); await browser.close(); process.exit(fails || errs.length ? 1 : 0);
