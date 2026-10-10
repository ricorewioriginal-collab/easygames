/* Browser-Test der Handy-Kopplung: 2 Menschen mit je einem Handy (Kandidat am Handy, Lampen am Handy, private Entscheidungen).
   Voraussetzung: PeerServer auf :9000 (npm i peer; node -e "require('peer').PeerServer({port:9000,path:'/',host:'0.0.0.0'})"); optional THREE=/pfad/three.min.js PEERJS=/pfad/peerjs.min.js QRLIB=/pfad/qrcode.js für Offline-Betrieb.
   Aufruf:  BASE=http://localhost:8080/MachMichAus node tests/e2e-pair.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080/MachMichAus', PH = 'localhost:9000'; let fails = 0; const errs = [], log = (ok, m) => { console.log((ok ? '✓ ' : '✗ ') + m); if (!ok) fails++; };
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
async function mk(vw, three) { const c = await browser.newContext({ viewport: vw }), p = await c.newPage(); p.on('pageerror', e => { errs.push(e.message); console.log('PAGEERR', e.message); }); p.on('dialog', d => d.accept());
  if (three && process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
  if (process.env.PEERJS) await p.route('**/peerjs.min.js', r => r.fulfill({ path: process.env.PEERJS, contentType: 'application/javascript' })); if (process.env.QRLIB) await p.route('**/qrcode.js', r => r.fulfill({ path: process.env.QRLIB, contentType: 'application/javascript' })); return p; }
const host = await mk({ width: 1100, height: 680 }, true); await host.goto(BASE + '/index.html?ph=' + PH); await host.waitForFunction(() => window.__mm, null, { timeout: 40000 }); await host.evaluate(() => { window.__mmFast = 6; });
await host.click('#bPlay'); await host.click('#sgPl [data-v="2"]'); await host.click('#bPairSetup'); await host.waitForFunction(() => /^[A-Z0-9]{4}$/.test(document.getElementById('code').textContent), null, { timeout: 15000 }); const code = await host.textContent('#code'); log(true, 'Gastgeber zeigt Code ' + code); log(await host.isVisible('#qr svg'), 'QR-Code wird angezeigt');
const phones = [];
for (const nm of ['Anna', 'Ben']) { const p = await mk({ width: 390, height: 800 }); await p.goto(`${BASE}/index.html?join=${code}&ph=${PH}`); await p.waitForSelector('#cj'); await p.fill('#cn', nm); await p.click('#cj'); await p.waitForFunction(() => /Verbunden/.test(document.getElementById('ctl').textContent), null, { timeout: 15000 }); phones.push(p); }
await host.waitForFunction(() => { const t = document.getElementById('pairList').textContent; return t.includes('Anna') && t.includes('Ben'); }, null, { timeout: 10000 }); log(true, 'Beide Handys melden sich an');
{ const p = await mk({ width: 390, height: 800 }); await p.goto(`${BASE}/index.html?join=${code}&ph=${PH}`); await p.waitForSelector('#cj'); await p.fill('#cn', 'Cleo'); await p.click('#cj'); await p.waitForFunction(() => /belegt/.test(document.getElementById('ctl').textContent), null, { timeout: 15000 }); log(true, 'Drittes Handy wird abgewiesen (nur 2 Menschen)'); await p.close(); }
await host.click('#bPairOk'); log((await host.inputValue('#humans input >> nth=0')) === 'Anna', 'Handy-Name landet im Namensfeld'); await host.click('#bStart');
const seen = new Set(); let privateOk = true;
async function phoneStep(p, who) {
  if (await p.isVisible('#ctl #tGo').catch(() => false)) { seen.add(who + ':talent'); await p.click('#ctl #tGo'); const t = Date.now(); while (await p.isVisible('#ctl #tap').catch(() => false) && Date.now() - t < 15000) { await p.click('#ctl #tap', { timeout: 800 }).catch(() => {}); await p.waitForTimeout(110); } return true; }
  if (await p.isVisible('#ctl .qb').catch(() => false)) { seen.add(who + ':quiz'); await p.click('#ctl .qb >> nth=0'); return true; }
  if (await p.isVisible('#ctl .lamprow button[data-v]').catch(() => false)) { seen.add(who + ':lamp'); if (await host.isVisible('#act .lamprow')) privateOk = false; await p.click('#ctl .lamprow button[data-v="1"] >> nth=0'); return true; }
  if (await p.isVisible('#ctl #jNo').catch(() => false)) { seen.add(who + ':joker'); await p.click('#ctl #jNo'); return true; }
  if (await p.isVisible('#ctl #cOk').catch(() => false)) { seen.add(who + ':choose'); await p.click('#ctl .pp >> nth=0'); await p.click('#ctl #cOk'); return true; }
  return false;
}
const t0 = Date.now(); let r2 = false;
while (Date.now() - t0 < 420000 && !r2) {
  if (await host.isVisible('#dlg:not([hidden])')) { const ids = await host.$$eval('#dlgBox button[id]', b => b.map(x => x.id)); if (ids.includes('bNext')) await host.click('#bNext'); else if (ids.includes('bReady')) await host.click('#bReady'); }
  for (let i = 0; i < 2; i++) await phoneStep(phones[i], ['Anna', 'Ben'][i]);
  r2 = await host.evaluate(() => window.__mm.S && window.__mm.S.round >= 1) && (seen.has('Ben:talent') || await host.evaluate(() => window.__mm.S.round >= 2));
  await host.waitForTimeout(80);
}
log(seen.has('Anna:talent') && seen.has('Anna:quiz'), 'Runde 1: Anna ist Kandidatin und spielt Talent + Quiz am Handy');
log(seen.has('Ben:lamp'), 'Runde 1: Ben entscheidet seine Lampe am Handy'); log(privateOk && !(await host.isVisible('#act .lamprow')), 'Die Lampen-Entscheidung erscheint nicht auf dem großen Bildschirm (privat)');
log(await host.evaluate(() => window.__mm.S.history.length >= 1), 'Runde 1 ist mit Date/Blackout und Punkten abgeschlossen');
log(seen.has('Ben:talent') || await host.evaluate(() => window.__mm.S.round >= 1), 'Runde 2 beginnt: Ben ist Kandidat');
console.log(errs.length ? 'Konsolenfehler: ' + errs.join(' | ') : 'Keine Konsolenfehler'); await browser.close(); process.exit(fails || errs.length ? 1 : 0);
