/* Browser-Test der Handy-Kopplung: 2 Menschen mit je einem Handy (privater Tagesplan, Nominierung, Aufgabe) + KI.
   Voraussetzung: PeerServer auf :9000 (npm i peer; node -e "require('peer').PeerServer({port:9000,path:'/',host:'0.0.0.0'})"); optional THREE=/pfad/three.min.js PEERJS=/pfad/peerjs.min.js QRLIB=/pfad/qrcode.js für Offline-Betrieb.
   Aufruf:  BASE=http://localhost:8080/anmacha-funkhaus node tests/e2e-pair.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080/anmacha-funkhaus', PH = 'localhost:9000'; let fails = 0; const errs = [], log = (ok, m) => { console.log((ok ? '✓ ' : '✗ ') + m); if (!ok) fails++; };
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
async function mk(vw, three) { const c = await browser.newContext({ viewport: vw }), p = await c.newPage(); p.on('pageerror', e => { errs.push(e.message); console.log('PAGEERR', e.message); }); p.on('dialog', d => d.accept());
  if (three && process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
  if (process.env.PEERJS) await p.route('**/peerjs.min.js', r => r.fulfill({ path: process.env.PEERJS, contentType: 'application/javascript' })); if (process.env.QRLIB) await p.route('**/qrcode.js', r => r.fulfill({ path: process.env.QRLIB, contentType: 'application/javascript' })); return p; }
const host = await mk({ width: 1100, height: 680 }, true);
await host.goto(BASE + '/index.html?ph=' + PH); await host.waitForFunction(() => window.__fh, null, { timeout: 40000 }); await host.evaluate(() => { window.__fhFast = 6; });
await host.click('#bPlay'); await host.click('#sgPl [data-v="2"]'); await host.click('#bPairSetup'); await host.waitForFunction(() => /^[A-Z0-9]{4}$/.test(document.getElementById('code').textContent), null, { timeout: 15000 }); const code = await host.textContent('#code'); log(true, 'Gastgeber zeigt Code ' + code); log(await host.isVisible('#qr svg'), 'QR-Code wird angezeigt');
const phones = [];
for (const nm of ['Anna', 'Ben']) { const p = await mk({ width: 390, height: 800 }); await p.goto(`${BASE}/index.html?join=${code}&ph=${PH}`); await p.waitForSelector('#cj'); await p.fill('#cn', nm); await p.click('#cj'); await p.waitForFunction(() => /Verbunden/.test(document.getElementById('ctl').textContent), null, { timeout: 15000 }); phones.push(p); }
await host.waitForFunction(() => { const t = document.getElementById('pairList').textContent; return t.includes('Anna') && t.includes('Ben'); }, null, { timeout: 10000 }); log(true, 'Beide Handys melden sich an');
{ const p = await mk({ width: 390, height: 800 }); await p.goto(`${BASE}/index.html?join=${code}&ph=${PH}`); await p.waitForSelector('#cj'); await p.fill('#cn', 'Cleo'); await p.click('#cj'); await p.waitForFunction(() => /belegt/.test(document.getElementById('ctl').textContent), null, { timeout: 15000 }); log(true, 'Drittes Handy wird abgewiesen (nur 2 Menschen)'); await p.close(); }
await host.click('#bPairOk'); log((await host.inputValue('#humans input >> nth=0')) === 'Anna', 'Handy-Name landet im Namensfeld'); await host.click('#bStart');
// Tagesplan privat am Handy
for (const p of phones) await p.waitForSelector('#ctl .agrid', { timeout: 30000 }); log(true, 'Beide Handys bekommen ihren privaten Tagesplan'); log(!(await host.isVisible('#act .agrid')), 'Am großen Bildschirm erscheint der Plan nicht (privat)');
async function plan(p) { for (let k = 0; k < 3; k++) { await p.click(`#ctl .ab >> nth=${(k * 3) % 8}`); if (await p.isVisible('#ctl .pgrid')) await p.click('#ctl .pp >> nth=0'); } await p.click('#ctl #pOk'); }
await Promise.all(phones.map(plan)); log(true, 'Beide Handys geben ihren Plan ab');
await host.waitForFunction(() => window.__fh.G.day >= 1, null, { timeout: 60000 }); log(true, 'Der Tag läuft, sobald beide abgegeben haben');
// weiter bis zur Nominierung am Handy
const t0 = Date.now(); let nom = false; while (Date.now() - t0 < 280000 && !nom) {
  if (await host.isVisible('#dlg:not([hidden])')) { const ids = await host.$$eval('#dlgBox button[id]', b => b.map(x => x.id)); if (ids.includes('bNext')) await host.click('#bNext'); else if (ids.includes('dClose')) await host.click('#dClose'); }
  for (const p of phones) { if (await p.isVisible('#ctl .agrid')) await plan(p); if (await p.isVisible('#ctl #tGo')) { await p.click('#ctl #tGo'); } if (await p.isVisible('#ctl .ph.red')) nom = true; }
  await host.waitForTimeout(80);
}
log(nom, 'Nominierung erscheint privat auf den Handys (Beichtstuhl)');
if (nom) { for (const p of phones) { await p.waitForSelector('#ctl .ph.red'); await p.click('#ctl .pp >> nth=0'); await p.click('#ctl .pp >> nth=1'); await p.click('#ctl #nOk'); } await host.waitForSelector('#dlg:not([hidden]) #bNext', { timeout: 60000 }); const t = await host.textContent('#dlgBox'); log(/Nominiert/.test(t) && /Anna/.test(t) && /Ben/.test(t), 'Nominierte und alle Wahlen werden am Bildschirm offengelegt'); }
console.log(errs.length ? 'Konsolenfehler: ' + errs.join(' | ') : 'Keine Konsolenfehler'); await browser.close(); process.exit(fails || errs.length ? 1 : 0);
