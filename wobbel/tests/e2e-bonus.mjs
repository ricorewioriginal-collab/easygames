/* Browser-Test: Bonusspiele, Muscheln, Laden, Überspringen, Level-Belohnung.
   Aufruf:  BASE=http://localhost:8080/wobbel THREE=/pfad/three.min.js node tests/e2e-bonus.mjs   (dauert ~2 Minuten: die Spiele laufen in Echtzeit) */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080'; let fails = 0; const errs = [], log = (ok, m) => { console.log((ok ? '✓ ' : '✗ ') + m); if (!ok) fails++; };
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] }), page = await (await browser.newContext({ viewport: { width: 520, height: 820 } })).newPage();
page.on('pageerror', e => errs.push(e.message)); page.on('dialog', d => d.accept());
if (process.env.THREE) await page.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
await page.route('**/fonts.googleapis.com/**', r => r.abort());
await page.addInitScript(() => { if (!localStorage.getItem('wobbelSave1')) localStorage.setItem('wobbelSave1', JSON.stringify({ coins: 0, levels: {}, settings: { sound: false, music: false, dpad: false } })); });
await page.goto(BASE + '/index.html'); await page.waitForFunction(() => window.__wobbel, null, { timeout: 30000 }); await page.waitForSelector('#how:not([hidden])', { timeout: 4000 }).catch(() => {}); await page.evaluate(() => { document.getElementById('how').hidden = true; });
const save = () => page.evaluate(() => JSON.parse(localStorage.getItem('wobbelSave1')));
const coinsUI = () => page.textContent('#bnCoins');
// Laden ohne Muscheln
await page.click('#bBonus'); await page.waitForSelector('#bonus:not([hidden]) .bn-play'); log((await page.locator('.bn-play').count()) === 4, 'Bonus-Bildschirm zeigt 4 Spiele');
await page.click('[data-t="shop"]'); await page.click('[data-k="hat"][data-i="crown"]'); log((await save()).coins === 0 && !((await save()).owned || []).length, 'Ohne Muscheln: Kauf wird abgelehnt');
// Muscheln vorgeben, Krone + Farbe kaufen
await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('wobbelSave1')); s.coins = 200; localStorage.setItem('wobbelSave1', JSON.stringify(s)); });
await page.reload(); await page.waitForFunction(() => window.__wobbel); await page.waitForSelector('#how:not([hidden])', { timeout: 4000 }).catch(() => {}); await page.evaluate(() => { document.getElementById('how').hidden = true; });
await page.click('#bBonus'); await page.click('[data-t="shop"]'); await page.click('[data-k="hat"][data-i="crown"]'); await page.click('[data-k="color"][data-i="c-mint"]');
let sv = await save(); log(sv.coins === 200 - 60 - 15 && sv.look.hat === 'crown' && sv.look.color === '#4fe0b0', 'Krone + Minze gekauft und angelegt (' + sv.coins + ' übrig)');
await page.click('#bnBack'); await page.waitForSelector('#menu:not([hidden])');
await page.evaluate(() => window.__wobbel.startLevel(0)); await page.waitForTimeout(600);
log(await page.evaluate(() => !!window.__wobbel.view.blob.hat), 'Hut erscheint an der 3D-Figur');
await page.screenshot({ path: process.env.SHOT || '/tmp/claude-0/t/bonus-hat.png' });
// Level lösen → Muscheln
const c0 = (await save()).coins; await page.evaluate(() => { window.__ffwd = 6; const s = window.__wobbel.session; [1, 1, 1].forEach(d => s.push(d)); }); 
await page.waitForSelector('#win:not([hidden])', { timeout: 20000 }).catch(() => {}); const winOk = await page.evaluate(() => !document.getElementById('win').hidden);
log(winOk && (await save()).coins > c0 && await page.isVisible('#wCoins'), 'Level gelöst: Muscheln gutgeschrieben (+' + ((await save()).coins - c0) + ')');
await page.evaluate(() => { window.__ffwd = 1; });
// Level überspringen
await page.click('#wMenu'); await page.evaluate(() => window.__wobbel.startLevel(1)); await page.waitForTimeout(400); const c1 = (await save()).coins; await page.click('#bSkip'); await page.waitForTimeout(500); sv = await save();
log(sv.levels[1] && sv.levels[1].skipped && sv.coins === c1 - 25, 'Level überspringen: 25 Muscheln abgebucht, Level 2 frei');
log(await page.evaluate(() => window.__wobbel.session.def.indexInWorld === 2 || window.__wobbel.session.def.index === 2), 'Nach dem Überspringen läuft das nächste Level');
await page.evaluate(() => window.__wobbel.toMenu());
// Tipp, Zeit, Tageslevel, Erfolge, Community
await page.evaluate(() => window.__wobbel.startLevel(3)); await page.waitForTimeout(500); let cTip = (await save()).coins; await page.click('#bTip'); await page.waitForFunction(() => /Tipp:/.test(document.getElementById('toast').textContent), null, { timeout: 30000 }); sv = await save();
log(sv.coins === cTip - 5 && await page.evaluate(() => !!window.__wobbel.view.tip), 'Tipp: 5 Muscheln, Pfeil erscheint in der Szene');
await page.evaluate(() => [0, 1, 2, 3].forEach(d => window.__wobbel.session.push(d))); await page.waitForTimeout(900); log(await page.evaluate(() => !window.__wobbel.view.tip) && /⏱ \d+:\d\d\.\d/.test(await page.textContent('#cTime')), 'Tipp verschwindet nach dem Zug, Zeitanzeige läuft');
await page.evaluate(() => window.__wobbel.toMenu()); await page.click('#bDaily'); await page.waitForTimeout(500); log((await page.textContent('#tWorld')).includes('Tageslevel'), 'Tageslevel startet mit Kennzeichnung');
await page.evaluate(() => window.__wobbel.toMenu());
await page.click('#bLevels'); await page.click('#bComm'); await page.waitForSelector('#cmList .my-row'); log((await page.locator('#cmList .my-row').count()) === 5, 'Community-Liste zeigt 5 Level');
await page.click('#cmList [data-a="play"][data-i="0"]'); await page.waitForTimeout(500); log(await page.evaluate(() => window.__wobbel.session.def.key === 'custom' && document.getElementById('tWorld').textContent.includes('Eigenes')), 'Community-Level startet im Spiel');
await page.evaluate(() => { window.__ffwd = 6; const s = window.__wobbel.session; s.push(1); s.push(1); s.push(1); }); await page.waitForSelector('#win:not([hidden])', { timeout: 20000 }); await page.evaluate(() => { window.__ffwd = 1; }); log((await save()).stats.community === 1, 'Community-Level gelöst wird gezählt');
await page.click('#wNext'); await page.waitForSelector('#cmDlg:not([hidden])'); await page.click('#cmClose'); await page.click('#bLvBack'); await page.waitForSelector('#menu:not([hidden])');
await page.click('#bBonus'); await page.click('[data-t="ach"]'); log((await page.locator('#bnBody .my-row').count()) >= 15 && /Erfolge freigeschaltet/.test(await page.textContent('#bnBody')), 'Erfolge-Liste wird angezeigt'); await page.click('#bnBack');
log(await page.evaluate(async () => { const r = await navigator.serviceWorker.getRegistration(); return !!r || 'no-sw'; }) !== false && (await page.evaluate(() => !!document.querySelector('link[rel=manifest]'))), 'PWA: Manifest eingebunden (Service Worker registriert oder lokal ok)');
// Bonusspiele spielen
async function play(id, act, max) {
  const before = await save(); await page.click('#bBonus'); await page.waitForSelector(`[data-g="${id}"]`); await page.click(`[data-g="${id}"]`); await page.click('#mgGo');
  const t0 = Date.now(); while (Date.now() - t0 < max && !(await page.isVisible('#mgRes'))) { await act(); await page.waitForTimeout(160); }
  const done = await page.isVisible('#mgRes'), after = await save(); log(done && after.bonus[id] && after.bonus[id].plays === 1, `${id}: Spiel endet, Ergebnis gespeichert (Rekord ${after.bonus[id] && after.bonus[id].best}, +${after.coins - before.coins} 🐚)`); log(after.coins >= before.coins && after.coins - before.coins <= 15 + 40, `${id}: Belohnung 0–15 Muscheln (plus mögliche Erfolgs-Prämien)`);
  await page.click('#mgBack2'); await page.waitForSelector('#bonus:not([hidden])'); await page.click('#bnBack'); await page.waitForSelector('#menu:not([hidden])');
}
const box = async () => page.locator('#mgCv').boundingBox(); let n = 0;
await play('melodie', async () => { const b = await box(), i = n++ % 4; await page.mouse.click(b.x + b.width * ([95, 265, 95, 265][i] / 360), b.y + b.height * ([165, 165, 345, 345][i] / 480)); }, 60000);
await play('huschen', async () => { const b = await box(); await page.mouse.click(b.x + b.width * ((70 + (n % 3) * 110) / 360), b.y + b.height * ((150 + (((n++ / 3) | 0) % 3) * 105) / 480)); }, 60000);
await play('sortier', async () => { const b = await box(); await page.mouse.click(b.x + b.width * ([65, 175, 285][n++ % 3] / 360), b.y + b.height * 0.83); }, 60000);
await play('perlen', async () => { const b = await box(); await page.mouse.move(b.x + b.width * (0.15 + 0.7 * ((n++ % 20) / 20)), b.y + b.height * 0.8); }, 70000);
console.log(errs.length ? 'Konsolenfehler: ' + errs.join(' | ') : 'Keine Konsolenfehler'); await browser.close(); process.exit(fails || errs.length ? 1 : 0);
