/* Browser-Test der Handy-Kopplung: Spiel + 2 Handys (je Spieler eins) über einen lokalen PeerServer.
   Voraussetzung: PeerServer auf :9000 (npm i peer; node -e "require('peer').PeerServer({port:9000,path:'/',host:'0.0.0.0'})"); optional PEERJS=/pfad/peerjs.min.js QRLIB=/pfad/qrcode.js für Offline-Betrieb.
   Aufruf:  BASE=http://localhost:8080/anmacha-frequenzrad node tests/e2e-pair.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080/anmacha-frequenzrad', PH = 'localhost:9000'; let fails = 0; const errs = [], log = (ok, m) => { console.log((ok ? '✓ ' : '✗ ') + m); if (!ok) fails++; };
const browser = await chromium.launch({ args: ['--no-sandbox'] });
async function mk(vw) { const c = await browser.newContext({ viewport: vw }), p = await c.newPage(); p.on('pageerror', e => errs.push(e.message));
  if (process.env.PEERJS) await p.route('**/peerjs.min.js', r => r.fulfill({ path: process.env.PEERJS, contentType: 'application/javascript' })); if (process.env.QRLIB) await p.route('**/qrcode.js', r => r.fulfill({ path: process.env.QRLIB, contentType: 'application/javascript' })); return p; }
const host = await mk({ width: 1000, height: 700 }); host.on('dialog', d => d.accept());
await host.goto(BASE + '/index.html?ph=' + PH); await host.waitForFunction(() => window.__fr); await host.evaluate(() => { window.__frFast = 0.04; });
await host.click('#bPairMenu'); await host.waitForFunction(() => /^[A-Z0-9]{4}$/.test(document.getElementById('code').textContent), null, { timeout: 15000 }); const code = await host.textContent('#code'); log(true, 'Gastgeber zeigt Raumcode ' + code); log((await host.innerHTML('#qr')).includes('svg'), 'QR-Code wird angezeigt');
const phones = [];
for (const nm of ['Anna', 'Ben']) { const p = await mk({ width: 390, height: 780 }); await p.goto(`${BASE}/index.html?join=${code}&ph=${PH}`); await p.waitForSelector('#cj'); await p.fill('#cn', nm); await p.click('#cj'); await p.waitForFunction(() => /Verbunden/.test(document.getElementById('ctl').textContent), null, { timeout: 15000 }); phones.push(p); }
await host.waitForFunction(() => { const t = document.getElementById('pairList').textContent; return t.includes('Anna') && t.includes('Ben'); }, null, { timeout: 10000 }); log((await host.textContent('#pairList')).includes('Spieler 1') && (await host.textContent('#pairList')).includes('Spieler 2'), 'Beide Handys bekommen einen Spielerplatz');
// dritter Mensch wird abgelehnt (nur 2 Plätze)
{ const p = await mk({ width: 390, height: 780 }); await p.goto(`${BASE}/index.html?join=${code}&ph=${PH}`); await p.waitForSelector('#cj'); await p.fill('#cn', 'Cleo'); await p.click('#cj'); await p.waitForFunction(() => /belegt/.test(document.getElementById('ctl').textContent), null, { timeout: 15000 }); log(true, 'Dritter Mensch wird abgelehnt: „Alle Plätze sind belegt“'); await p.context().close(); }
await host.click('#bPairOk'); await host.click('#bPlay'); await host.click('#sgHum [data-v="2"]'); await host.click('#sgCpu [data-v="0"]'); await host.click('#sgRounds [data-v="3"]'); await host.click('#bStart'); await host.waitForSelector('#tboard .tile.on');
log((await host.textContent('#players')).includes('Anna') && (await host.textContent('#players')).includes('Ben'), 'Namen der Handys erscheinen im Spiel');
let sawHostIdle = false, steps = 0; const t0 = Date.now();
while (Date.now() - t0 < 120000) {
  if (await host.isVisible('#end')) break;
  const st = await host.evaluate(() => { const G = window.__fr.G; if (!G) return null; const V = new Set([...'AEIOUÄÖÜ']), open = [...G.puzzle.t].filter(c => /[A-ZÄÖÜ]/.test(c) && !G.rev.has(c)); return { aw: window.__fr.awaiting, shown: window.__fr.roundShown, phase: G.phase, turn: G.turn, ratio: G.ratio, text: G.puzzle.t, cons: [...new Set(open.filter(c => !V.has(c)))][0] || 'NSRTDHL'.split('').find(c => !G.rev.has(c)), vow: [...new Set(open.filter(c => V.has(c)))][0] || 'EAIOUÄÖÜ'.split('').find(c => !G.rev.has(c)), hostBtn: !!document.getElementById('bSpin') }; });
  if (!st) { await host.waitForTimeout(60); continue; }
  if (st.phase === 'roundEnd') { if (st.shown) { const b = phones[0].locator('[data-a="next"]'); if (await b.count()) await b.click(); } await host.waitForTimeout(100); continue; }
  if (!st.aw) { await host.waitForTimeout(60); continue; }
  sawHostIdle = sawHostIdle || !st.hostBtn; const ph = phones[st.turn];
  if (['consonant', 'vowel', 'vowelFree'].includes(st.phase)) { const ch = st.phase === 'consonant' ? st.cons : st.vow; const b = ph.locator(`[data-k="${ch}"]:not([disabled])`); await b.first().waitFor({ timeout: 8000 }); await b.first().click(); steps++; await host.waitForTimeout(100); continue; }
  if (st.ratio >= 0.7) { const s = ph.locator('[data-a="solve"]'); await s.waitFor({ timeout: 8000 }); await s.click(); await ph.fill('#sinp', st.text); await ph.press('#sinp', 'Enter'); steps++; await host.waitForTimeout(120); continue; }
  const sp = ph.locator('[data-a="spin"]'); await sp.waitFor({ timeout: 8000 }); await sp.click(); steps++; await host.waitForTimeout(150);
}
log(await host.isVisible('#end'), 'Komplette Partie nur über die Handys gespielt (' + steps + ' Aktionen vom Handy)'); log(sawHostIdle, 'Am Gastgeber gibt es keine Bedienknöpfe, solange das Handy spielt');
log(/gewinnt|Unentschieden/.test(await phones[0].textContent('#ctl')), 'Handy zeigt am Ende das Ergebnis');
// Fallback: Handys weg → Gastgeber-Bedienung wieder da
await host.click('#bEndMenu'); for (const p of phones) await p.goto('about:blank'); await host.waitForFunction(() => window.__fr.pair.phones().length === 0, null, { timeout: 15000 });
await host.click('#bPlay'); await host.click('#bStart'); await host.waitForSelector('#bSpin', { timeout: 20000 }); log(true, 'Handys getrennt → Bedienung am Gastgeber wieder da');
console.log(errs.length ? 'Konsolenfehler: ' + errs.join(' | ') : 'Keine Konsolenfehler'); await browser.close(); process.exit(fails || errs.length ? 1 : 0);
