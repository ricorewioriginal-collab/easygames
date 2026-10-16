// Ablauf-Test: neues Story-Spiel, Prolog-Quest per Gespräch, Fahrzeug, Wald, Speichern/Laden.
import { createRequire } from 'node:module';
const req = createRequire(import.meta.url);
let pw; for (const p of ['playwright', '/opt/node-tools/node_modules/playwright']) { try { pw = req(p); break; } catch {} }
const BASE = process.env.BASE || 'http://localhost:8090/bunte-insel2/';
const OUT = process.env.OUT || '/tmp/claude-0/shots';
const browser = await pw.chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errs = [];
page.on('pageerror', e => errs.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
const ok = (c, m) => { console.log((c ? '✅ ' : '❌ ') + m); if (!c) process.exitCode = 1; };
await page.goto(BASE + '?test=1');
await page.waitForFunction(() => window.__bi2, null, { timeout: 60000 });
await page.click('#btn-slots'); await page.click('#slot-1 .btn.green'); await page.click('#mode-story .btn');
await page.waitForTimeout(800);
await page.fill('input[aria-label="Name"]', 'Testi'); await page.click('text=✔ Fertig');
await page.waitForTimeout(1500);
// Intro-Dialog wegklicken
const closeDlg = async () => { for (let k = 0; k < 25; k++) { if (!(await page.$('.dialog'))) return; await page.keyboard.press('KeyE'); await page.waitForTimeout(180); } };
await page.waitForTimeout(800); await closeDlg();
let st = await page.evaluate(() => { const g = window.__bi2.g; return { q: g.save.quests, tracked: g.save.tracked, phase: g.phase }; });
ok(st.phase === 'play', 'Spiel läuft'); ok(!!st.q.main_0, 'Prolog-Quest gestartet');
const talk = async id => { await closeDlg(); await page.evaluate(i => window.__bi2.g.talk(i), id); await page.waitForTimeout(200); await closeDlg(); };
await page.evaluate(() => { const g = window.__bi2.g; g.teleport(2, -12); });
await page.waitForTimeout(500);
await talk('rosi');
st = await page.evaluate(() => window.__bi2.g.save.quests.main_0);
ok(st && st.stage === 1, 'Rosi-Gespräch → Phase 2 (Stufe ' + (st && st.stage) + ')');
await page.screenshot({ path: OUT + '/10-after-rosi.png' });
await page.evaluate(() => window.__bi2.g.teleport(140, -40));
await page.waitForTimeout(600);
await talk('lasse');
await page.evaluate(() => window.__bi2.g.openPanel('kompass'));
await page.waitForTimeout(300); await page.screenshot({ path: OUT + '/11-kompass.png' });
await page.keyboard.press('Escape');
st = await page.evaluate(() => window.__bi2.g.save.quests.main_0);
ok(st && st.stage === 3, 'Kompass untersucht → Phase 4');
await page.evaluate(() => window.__bi2.g.teleport(2, -12)); await page.waitForTimeout(400);
await talk('rosi');
st = await page.evaluate(() => ({ q: window.__bi2.g.save.quests.main_0, ch: window.__bi2.g.save.story.chapter }));
ok(st.q.done && st.ch === 1, 'Prolog abgeschlossen, Kapitel 1');
// Fahrzeug
await page.evaluate(() => { const g = window.__bi2.g; g.teleport(10, 44); });
await page.waitForTimeout(500);
const veh = await page.evaluate(() => { const g = window.__bi2.g; const ia = g.interact.all.find(i => i.id.startsWith('veh:hub:auto')); if (!ia) return 'keins: ' + g.interact.all.filter(i => i.id.startsWith('veh')).map(i => i.id).join(','); ia.act(); return window.__bi2.sys.vehicles.inVehicle; });
console.log('Fahrzeug:', veh);
ok(veh === true, 'Ins Auto eingestiegen');
await page.keyboard.down('KeyW'); await page.waitForTimeout(1500); await page.keyboard.up('KeyW');
await page.screenshot({ path: OUT + '/12-auto.png' });
await page.keyboard.press('KeyE'); await page.waitForTimeout(300);
ok(await page.evaluate(() => !window.__bi2.sys.vehicles.inVehicle), 'Ausgestiegen');
// Wald
await page.evaluate(() => window.__bi2.g.teleport(-140, -110)); await page.waitForTimeout(4500);
const forest = await page.evaluate(() => ({ zone: window.__bi2.g.currentZone && window.__bi2.g.currentZone.id, inForest: window.__bi2.sys.combat.inForest }));
ok(forest.inForest, 'Verbotener Wald erkannt (Kampfzone)');
for (let i = 0; i < 6; i++) { await page.keyboard.press('KeyJ'); await page.waitForTimeout(200); }
await page.screenshot({ path: OUT + '/13-wald.png' });
await page.evaluate(() => window.__bi2.g.teleport(0, 30)); await page.waitForTimeout(800);
ok(await page.evaluate(() => !window.__bi2.sys.combat.inForest), 'Außerhalb des Waldes kein Kampf');
// Journal, Karte, Rucksack
for (const p of ['journal', 'map', 'inventory']) { await page.evaluate(x => window.__bi2.g.openPanel(x), p); await page.waitForTimeout(500); await page.screenshot({ path: OUT + '/14-' + p + '.png' }); await page.keyboard.press('Escape'); await page.waitForTimeout(200); }
// Speichern & Laden
const saved = await page.evaluate(() => window.__bi2.g.persist());
ok(saved, 'Gespeichert');
await page.reload(); await page.waitForFunction(() => window.__bi2, null, { timeout: 60000 });
const info = await page.evaluate(() => window.__bi2.store.info(1));
ok(info.exists && info.chapter === 1 && info.name === 'Testi', 'Spielstand nach Neuladen vorhanden (Kapitel ' + info.chapter + ')');
console.log(errs.slice(0, 15).join('\n') || 'keine Fehler im Browser');
ok(errs.length === 0, 'Keine Fehler im Browser');
await browser.close();
