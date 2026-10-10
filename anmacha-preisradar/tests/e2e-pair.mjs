/* Browser-Test der Handy-Kopplung: Show + 2 Handys (je Spieler eins) über einen lokalen PeerServer.
   Voraussetzung: PeerServer auf :9000 (npm i peer; node -e "require('peer').PeerServer({port:9000,path:'/',host:'0.0.0.0'})"); optional PEERJS=/pfad/peerjs.min.js QRLIB=/pfad/qrcode.js für Offline-Betrieb.
   Aufruf:  BASE=http://localhost:8080/anmacha-preisradar node tests/e2e-pair.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080/anmacha-preisradar', PH = 'localhost:9000'; let fails = 0; const errs = [], log = (ok, m) => { console.log((ok ? '✓ ' : '✗ ') + m); if (!ok) fails++; };
const browser = await chromium.launch({ args: ['--no-sandbox'] });
async function mk(vw) { const c = await browser.newContext({ viewport: vw }), p = await c.newPage(); p.on('pageerror', e => errs.push(e.message));
  if (process.env.PEERJS) await p.route('**/peerjs.min.js', r => r.fulfill({ path: process.env.PEERJS, contentType: 'application/javascript' })); if (process.env.QRLIB) await p.route('**/qrcode.js', r => r.fulfill({ path: process.env.QRLIB, contentType: 'application/javascript' })); return p; }
const host = await mk({ width: 1000, height: 760 }); host.on('dialog', d => d.accept());
await host.goto(BASE + '/index.html?ph=' + PH); await host.waitForFunction(() => window.__pr); await host.evaluate(() => { window.__prFast = 0.04; });
await host.click('#bPairMenu'); await host.waitForFunction(() => /^[A-Z0-9]{4}$/.test(document.getElementById('code').textContent), null, { timeout: 15000 }); const code = await host.textContent('#code'); log(true, 'Gastgeber zeigt Raumcode ' + code); log((await host.innerHTML('#qr')).includes('svg'), 'QR-Code wird angezeigt');
const phones = [];
for (const nm of ['Anna', 'Ben']) { const p = await mk({ width: 390, height: 800 }); await p.goto(`${BASE}/index.html?join=${code}&ph=${PH}`); await p.waitForSelector('#cj'); await p.fill('#cn', nm); await p.click('#cj'); await p.waitForFunction(() => /Verbunden/.test(document.getElementById('ctl').textContent), null, { timeout: 15000 }); phones.push(p); }
await host.waitForFunction(() => { const t = document.getElementById('pairList').textContent; return t.includes('Anna') && t.includes('Ben'); }, null, { timeout: 10000 }); log(true, 'Beide Handys melden sich beim Spiel an');
{ const p = await mk({ width: 390, height: 800 }); await p.goto(`${BASE}/index.html?join=${code}&ph=${PH}`); await p.waitForSelector('#cj'); await p.fill('#cn', 'Cleo'); await p.click('#cj'); await p.waitForFunction(() => /belegt/.test(document.getElementById('ctl').textContent), null, { timeout: 15000 }); log(true, 'Dritter Mensch wird abgelehnt: „Alle Plätze sind belegt“'); await p.context().close(); }
await host.click('#bPairOk'); await host.click('#bPlay'); await host.click('#sgHum [data-v="2"]'); await host.click('#sgCpu [data-v="0"]'); await host.click('#sgLen [data-v="4"]'); await host.click('#bStart'); await host.waitForSelector('#stage .prod, #stage .cart');
log((await host.textContent('#players')).includes('Anna') && (await host.textContent('#players')).includes('Ben'), 'Namen der Handys erscheinen im Spiel');
async function answer(p, kind) {
  if (kind === 'bid' || kind === 'final') { await p.waitForSelector('#bidInp'); await p.fill('#bidInp', String(20 + Math.floor(Math.random() * 50)) + ',00'); await p.press('#bidInp', 'Enter'); }
  else if (kind === 'dial') { await p.waitForSelector('#dOk'); await p.click('#dOk'); } else if (kind === 'hilo') { await p.waitForSelector('#ctl [data-v]'); for (let i = 0; i < 3; i++) await p.click('#ctl [data-v="1"]'); }
  else { await p.waitForSelector('#ctl .ct'); await p.click('#ctl .ct >> nth=1'); await p.click('#ctl .ct >> nth=4'); await p.click('#cOk'); }
}
let rounds = 0, secretOk = true; const kinds = new Set(), t0 = Date.now();
while (Date.now() - t0 < 120000) {
  if (await host.isVisible('#end')) break;
  const st = await host.evaluate(() => ({ phase: window.__pr.phase, kind: window.__pr.SH && window.__pr.SH.spec ? window.__pr.SH.spec.kind : null, next: window.__pr.nextShown, pending: window.__pr.SH ? window.__pr.SH.humansPending().length : 0, cover: !!document.getElementById('bReady') }));
  if (st.phase === 'collect' && st.pending === 2) { kinds.add(st.kind); await Promise.all(phones.map(p => answer(p, st.kind))); await host.waitForTimeout(150); const txt = await host.textContent('#players'); secretOk = secretOk && !/\d+,\d\d/.test(txt); rounds++; continue; }
  if (st.next) { const b = phones[rounds % 2].locator('#cn2'); await b.waitFor({ timeout: 8000 }); await b.click(); await host.waitForTimeout(150); continue; }
  await host.waitForTimeout(80);
}
log(await host.isVisible('#end'), 'Komplette Show nur über die Handys gespielt (' + rounds + ' Runden)'); log(['bid', 'dial', 'hilo', 'cart', 'final'].every(k => kinds.has(k)), 'Alle Rundenarten über Handys: ' + [...kinds].join(', ')); log(secretOk, 'Gebote bleiben auf dem Gastgeber geheim, bis aufgedeckt wird');
log(/Punkte/.test(await phones[0].textContent('#ctl')), 'Handy zeigt am Ende den Endstand');
// Fallback: Handys weg → Gastgeber reicht herum („Bereit?“)
await host.click('#bEndMenu'); for (const p of phones) await p.goto('about:blank'); await host.waitForFunction(() => window.__pr.pair.phones().length === 0, null, { timeout: 15000 });
await host.click('#bPlay'); await host.click('#bStart'); await host.waitForSelector('#bReady', { timeout: 20000 }); log(true, 'Handys getrennt → Gastgeber reicht das Gerät herum („Bereit?“)');
console.log(errs.length ? 'Konsolenfehler: ' + errs.join(' | ') : 'Keine Konsolenfehler'); await browser.close(); process.exit(fails || errs.length ? 1 : 0);
