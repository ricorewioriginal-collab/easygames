/* Browser-Test der Handy-Kopplung: Show + 2 Handys als Pads über einen lokalen PeerServer.
   Voraussetzung: PeerServer auf :9000 (npm i peer; node -e "require('peer').PeerServer({port:9000,path:'/',host:'0.0.0.0'})"); optional THREE=/pfad/three.min.js PEERJS=/pfad/peerjs.min.js QRLIB=/pfad/qrcode.js für Offline-Betrieb.
   Aufruf:  BASE=http://localhost:8080/anmacha-funkparcours node tests/e2e-pair.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080/anmacha-funkparcours', PH = 'localhost:9000'; let fails = 0; const errs = [], log = (ok, m) => { console.log((ok ? '✓ ' : '✗ ') + m); if (!ok) fails++; };
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
async function mk(vw, three) { const c = await browser.newContext({ viewport: vw }), p = await c.newPage(); p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.accept());
  if (three && process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
  if (process.env.PEERJS) await p.route('**/peerjs.min.js', r => r.fulfill({ path: process.env.PEERJS, contentType: 'application/javascript' })); if (process.env.QRLIB) await p.route('**/qrcode.js', r => r.fulfill({ path: process.env.QRLIB, contentType: 'application/javascript' })); return p; }
const host = await mk({ width: 1000, height: 640 }, true);
await host.goto(BASE + '/index.html?ph=' + PH); await host.waitForFunction(() => window.__fp, null, { timeout: 30000 });
await host.click('#bPairMenu'); await host.waitForFunction(() => /^[A-Z0-9]{4}$/.test(document.getElementById('code').textContent), null, { timeout: 15000 }); const code = await host.textContent('#code'); log(true, 'Gastgeber zeigt Code ' + code); log(await host.isVisible('#qr svg'), 'QR-Code wird angezeigt');
const phones = [];
for (const nm of ['Anna', 'Ben']) { const p = await mk({ width: 390, height: 800 }); await p.goto(`${BASE}/index.html?join=${code}&ph=${PH}`); await p.waitForSelector('#cj'); await p.fill('#cn', nm); await p.click('#cj'); await p.waitForFunction(() => /Verbunden/.test(document.getElementById('ctl').textContent), null, { timeout: 15000 }); phones.push(p); }
await host.waitForFunction(() => { const t = document.getElementById('pairList').textContent; return t.includes('Anna') && t.includes('Ben'); }, null, { timeout: 10000 }); log(true, 'Beide Handys melden sich beim Spiel an');
{ const p = await mk({ width: 390, height: 800 }); await p.goto(`${BASE}/index.html?join=${code}&ph=${PH}`); await p.waitForSelector('#cj'); await p.fill('#cn', 'Cleo'); await p.click('#cj'); await p.waitForFunction(() => /belegt/.test(document.getElementById('ctl').textContent), null, { timeout: 15000 }); log(true, 'Drittes Handy wird abgewiesen (nur 2 Läufer eingestellt)'); await p.close(); }
await host.click('#bPairOk'); await host.click('#bPlay'); await host.click('#sgPl [data-v="2"]'); log((await host.inputValue('#names input[data-i="0"]')) === 'Anna', 'Handy-Name landet im Namensfeld'); await host.click('#bStart'); await host.waitForSelector('#bReady');
await phones[0].waitForSelector('#cr', { timeout: 8000 }); log(true, 'Handy von Anna zeigt „Bereit!"'); log(!(await phones[1].isVisible('#cr')), 'Handy von Ben wartet'); log(/Anna ist dran|dran/.test(await phones[1].textContent('#ctl')), 'Ben sieht, wer dran ist');
await phones[0].click('#cr'); await host.waitForFunction(() => window.__fp.G.phase === 'run', null, { timeout: 15000 }); await phones[0].waitForSelector('.cpad', { timeout: 8000 }); log(true, 'Nach „Bereit" + Countdown erscheint das Steuer-Pad');
const x0 = await host.evaluate(() => window.__fp.G.sim.x), r = phones[0].locator('.cpad [data-b="2"]'), bb = await r.boundingBox();
await phones[0].mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await phones[0].mouse.down(); await host.waitForTimeout(600); const x1 = await host.evaluate(() => window.__fp.G.sim.x); log(x1 > x0 + 1, 'Handy-Taste „rechts" bewegt den Läufer (' + x0.toFixed(1) + ' → ' + x1.toFixed(1) + ')');
/* rechts gedrückt halten → Anna läuft ins Wasser, der Lauf endet */ await host.waitForFunction(() => window.__fp.G.phase === 'done', null, { timeout: 30000, polling: 100 }); await phones[0].mouse.up();
await host.waitForSelector('#bReady', { timeout: 30000 }); await phones[1].waitForSelector('#cr', { timeout: 8000 }); log(true, 'Danach ist Ben dran – sein Handy zeigt „Bereit!"');
await host.evaluate(() => { window.__fpFast = 3; });
await phones[1].click('#cr'); await host.waitForFunction(() => window.__fp.G.phase === 'run'); log(true, 'Ben startet über sein Handy');
console.log(errs.length ? 'Konsolenfehler: ' + errs.join(' | ') : 'Keine Konsolenfehler'); await browser.close(); process.exit(fails || errs.length ? 1 : 0);
