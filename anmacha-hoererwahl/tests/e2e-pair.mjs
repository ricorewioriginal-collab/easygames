/* Browser-Test der Handy-Kopplung: Spiel + 2 Handys (je Team eins) über einen lokalen PeerServer.
   Voraussetzung: PeerServer auf :9000 (npm i peer; node -e "require('peer').PeerServer({port:9000,path:'/'})"); optional PEERJS=/pfad/peerjs.min.js QRLIB=/pfad/qrcode.js für Offline-Betrieb.
   Aufruf:  BASE=http://localhost:8080/anmacha-hoererwahl node tests/e2e-pair.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080/anmacha-hoererwahl', PH = 'localhost:9000'; let fails = 0; const errs = [], log = (ok, m) => { console.log((ok ? '✓ ' : '✗ ') + m); if (!ok) fails++; };
const browser = await chromium.launch({ args: ['--no-sandbox'] });
async function mk(vw) { const c = await browser.newContext({ viewport: vw }), p = await c.newPage(); p.on('pageerror', e => errs.push(e.message));
  if (process.env.PEERJS) await p.route('**/peerjs.min.js', r => r.fulfill({ path: process.env.PEERJS, contentType: 'application/javascript' })); if (process.env.QRLIB) await p.route('**/qrcode.js', r => r.fulfill({ path: process.env.QRLIB, contentType: 'application/javascript' })); return p; }
const host = await mk({ width: 1000, height: 700 }); host.on('dialog', d => d.accept());
await host.goto(BASE + '/index.html?ph=' + PH); await host.waitForFunction(() => window.__hw); await host.evaluate(() => { window.__hwFast = 0.03; });
await host.click('#bPairMenu'); await host.waitForFunction(() => /^[A-Z0-9]{4}$/.test(document.getElementById('code').textContent), null, { timeout: 15000 }); const code = await host.textContent('#code'); log(true, 'Gastgeber zeigt Raumcode ' + code); log((await host.innerHTML('#qr')).includes('svg'), 'QR-Code wird angezeigt');
const phones = [];
for (const [i, nm] of ['Anna', 'Ben'].entries()) { const p = await mk({ width: 390, height: 780 }); await p.goto(`${BASE}/index.html?join=${code}&ph=${PH}`); await p.waitForSelector('#cj'); await p.fill('#cn', nm); await p.click(`#ct [data-v="${i}"]`); await p.click('#cj'); await p.waitForFunction(() => /Verbunden|Warte/.test(document.getElementById('ctl').textContent), null, { timeout: 15000 }); phones.push(p); }
await host.waitForFunction(() => document.getElementById('pairList').textContent.includes('Anna') && document.getElementById('pairList').textContent.includes('Ben'), null, { timeout: 10000 }); log(true, 'Beide Handys melden sich beim Spiel an (Team 1: Anna, Team 2: Ben)');
await host.click('#bPairOk'); await host.click('#bPlay'); await host.click('#sgMode [data-v="duell"]'); await host.click('#sgRounds [data-v="3"]'); await host.click('#bStart'); await host.waitForSelector('#board .slot');
let sawPhoneInput = false, sawHostLocked = false, steps = 0, finaleSeen = false; const t0 = Date.now();
while (Date.now() - t0 < 120000) {
  if (await host.isVisible('#end')) break;
  const st = await host.evaluate(() => { const M = window.__hw.M; return M ? { aw: window.__hw.awaiting, next: window.__hw.nextReady, fin: window.__hw.finAccept, phase: M.phase, turn: M.turn, control: M.control, best: M.board && M.phase !== 'finale' ? (M.board.find(b => !b.shown) || {}).t : null, finBest: M.finale && M.finale.i < M.finale.qs.length ? M.finale.qs[M.finale.i].a[0].t : null, finTeam: M.finale ? M.finale.team : null, inpDis: document.getElementById('inp').disabled, finGo: !document.getElementById('finGo').hidden } : null; });
  if (!st) { await host.waitForTimeout(50); continue; }
  if (st.aw && ['faceoff', 'play', 'steal'].includes(st.phase)) { const ph = phones[st.turn]; await ph.waitForSelector('#cinp', { timeout: 8000 }); if (!sawPhoneInput && process.env.SHOT) await ph.screenshot({ path: process.env.SHOT }); sawPhoneInput = true; sawHostLocked = sawHostLocked || st.inpDis; await ph.fill('#cinp', st.best); await ph.press('#cinp', 'Enter'); steps++; await host.waitForTimeout(120); continue; }
  if (st.phase === 'choose') { const ph = phones[st.control]; const b = ph.locator('[data-a="play"]'); if (await b.count()) { await b.click(); await host.waitForTimeout(150); continue; } }
  if (st.next) { const ph = phones[0]; const b = ph.locator('[data-a="next"]'); if (await b.count()) { await b.click(); await host.waitForTimeout(150); continue; } }
  if (st.phase === 'finale' || st.phase === 'finaleEnd') { finaleSeen = true; const ph = phones[st.finTeam]; if (st.finGo) { const b = ph.locator('[data-a="next"]'); if (await b.count()) await b.click(); } else if (st.fin && st.finBest) { await ph.waitForSelector('#cinp', { timeout: 8000 }); await ph.fill('#cinp', st.finBest); await ph.press('#cinp', 'Enter'); } }
  await host.waitForTimeout(80);
}
log(await host.isVisible('#end'), 'Komplette Partie nur über die Handys gespielt (' + steps + ' Antworten vom Handy)'); log(sawPhoneInput, 'Handy zeigt das Eingabefeld, wenn das eigene Team dran ist'); log(sawHostLocked, 'Am Gastgeber ist die Eingabe gesperrt, solange das Handy antwortet'); log(finaleSeen, 'Auch das Finale läuft über das Handy');
const endTxt = await phones[0].textContent('#ctl'); log(/:/.test(endTxt), 'Handy zeigt am Ende den Endstand');
// Fallback: Handys weg → Gastgeber-Tastatur wieder frei
await host.click('#bEndMenu'); await host.click('#bPlay'); await host.click('#bStart'); await host.waitForSelector('#board .slot'); for (const p of phones) await p.goto('about:blank');
await host.waitForFunction(() => window.__hw.pair.phones().length === 0, null, { timeout: 15000 }); await host.waitForFunction(() => window.__hw.awaiting && !document.getElementById('inp').disabled, null, { timeout: 15000 }); log(true, 'Handys getrennt → Eingabe am Gastgeber wieder frei');
console.log(errs.length ? 'Konsolenfehler: ' + errs.join(' | ') : 'Keine Konsolenfehler'); await browser.close(); process.exit(fails || errs.length ? 1 : 0);
