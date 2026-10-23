/* Funkmaler – Browser-Test (Playwright): Fernseher + 3 Handys, jedes in einem eigenen Browser-Kontext (eigener Speicher wie echte Geräte).
   Die Verbindung läuft über ein Test-Relais, das PeerJS nachbildet (statt Firebase/PeerJS-Server).
   Prüft: TV-Lobby mit QR/Link (?join=), Beitreten per Link, Wortwahl, Malen live auf TV und Handys, Raten (falsch, knapp, richtig),
   Punkte, Handy fällt aus und kommt mit gleichem Platz zurück, Endstand mit Galerie, „Ein Gerät“.
   Aufruf: python3 -m http.server 8765 &  BASE=http://localhost:8765/funkmaler/ [SHOT=/tmp] node funkmaler/tests/e2e.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8765/funkmaler/', SHOT = process.env.SHOT || '';
let fails = 0; const errs = [];
const log = (ok, m) => { console.log((ok ? '✓ ' : '✗ ') + m); if (!ok) fails++; };
const browser = await chromium.launch({ args: ['--no-sandbox'] });

// ---- PeerJS-Relais: Seiten melden ihre Peer-IDs, Nachrichten laufen über Node ----
const owners = new Map(); // peerId -> page
const links = new Map(); // "a|b" -> true (offene Verbindung)
async function relay(source, m) {
  const page = source.page;
  if (m.k === 'reg') { owners.set(m.id, page); if (!page.__fpHooked) { page.__fpHooked = true; page.on('close', () => dropPage(page)); } return; }
  if (m.k === 'unreg') { owners.delete(m.id); return; }
  const to = owners.get(m.to);
  if (m.k === 'connect' && !to) { await page.evaluate(x => window.__fpRecv(x), { k: 'err', to: m.from, type: 'peer-unavailable' }).catch(() => { }); return; }
  if (!to) return;
  if (m.k === 'connect') links.set(m.from + '|' + m.to, true);
  await to.evaluate(x => window.__fpRecv(x), m).catch(() => { });
}
// Seite zu (Handy aus): wie bei WebRTC merkt die Gegenseite, dass die Verbindung weg ist
async function dropPage(page) {
  for (const [id, pg] of [...owners]) if (pg === page) {
    owners.delete(id);
    for (const key of [...links.keys()]) { const [a, b] = key.split('|'); const other = a === id ? b : b === id ? a : null; if (!other) continue; links.delete(key); const op = owners.get(other); if (op) await op.evaluate(x => window.__fpRecv(x), { k: 'close', to: other, from: id }).catch(() => { }); }
  }
}
const FAKE = () => {
  const peers = {};
  window.__fpRecv = m => { const p = peers[m.to]; if (p) p._in(m); };
  class Conn { constructor(me, o) { this.me = me; this.peer = o; this.h = {}; this.open = false; }
    on(e, f) { (this.h[e] = this.h[e] || []).push(f); } emit(e, ...a) { (this.h[e] || []).forEach(f => { try { f(...a); } catch (x) { console.error(x); } }); }
    send(d) { window.__fp({ k: 'data', to: this.peer, from: this.me, d: JSON.parse(JSON.stringify(d)) }); }
    close() { if (!this.open) return; this.open = false; window.__fp({ k: 'close', to: this.peer, from: this.me }); this.emit('close'); } }
  class Peer { constructor(id) { this.id = id || 'p' + Math.random().toString(36).slice(2, 9); this.h = {}; this.c = {}; peers[this.id] = this; window.__fp({ k: 'reg', id: this.id }); setTimeout(() => this.emit('open', this.id), 30); }
    on(e, f) { (this.h[e] = this.h[e] || []).push(f); } emit(e, ...a) { (this.h[e] || []).forEach(f => f(...a)); }
    _in(m) { let c = this.c[m.from];
      if (m.k === 'connect') { c = new Conn(this.id, m.from); this.c[m.from] = c; this.emit('connection', c); setTimeout(() => { c.open = true; c.emit('open'); window.__fp({ k: 'accept', to: m.from, from: this.id }); }, 10); }
      else if (m.k === 'accept' && c) { c.open = true; c.emit('open'); }
      else if (m.k === 'data' && c) c.emit('data', m.d);
      else if (m.k === 'close' && c && c.open) { c.open = false; c.emit('close'); }
      else if (m.k === 'err') this.emit('error', { type: m.type }); }
    connect(id) { const c = new Conn(this.id, id); this.c[id] = c; window.__fp({ k: 'connect', to: id, from: this.id }); return c; }
    destroy() { Object.values(this.c).forEach(c => c.close()); delete peers[this.id]; window.__fp({ k: 'unreg', id: this.id }); } reconnect() { } }
  window.Peer = Peer;
  addEventListener('pagehide', () => Object.values(peers).forEach(p => { try { p.destroy(); } catch (e) { } }));
};
async function device(name, opt) {
  const ctx = await browser.newContext(Object.assign({ serviceWorkers: 'block' }, opt));
  await ctx.exposeBinding('__fp', relay);
  await ctx.addInitScript(FAKE);
  await ctx.route(/cloud\/fire-peer|anmacha-cloud|gamepad\.js|vendor\/peerjs/, r => r.fulfill({ body: '', contentType: 'text/javascript' }));
  const p = await ctx.newPage();
  p.on('pageerror', e => { errs.push(name + ': ' + e.message); console.log('PAGEERR', name, e.message); });
  return { ctx, p };
}
const PHONE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const host = tv => tv.evaluate(() => FUNKMALER.host());
const guest = p => p.evaluate(() => FUNKMALER.guest());
const shot = (p, n) => SHOT ? p.screenshot({ path: SHOT + '/funkmaler-' + n + '.png' }) : null;
const until = async (fn, ms = 8000, what = '') => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await fn()) return true; await new Promise(r => setTimeout(r, 120)); } throw new Error('Zeitüberschreitung: ' + what); };
async function stroke(p, sel) { const b = await p.locator(sel).boundingBox(); await p.mouse.move(b.x + b.width * .2, b.y + b.height * .3); await p.mouse.down(); for (let k = 0; k <= 12; k++) await p.mouse.move(b.x + b.width * (.2 + k * .05), b.y + b.height * (.3 + Math.sin(k / 2) * .2)); await p.mouse.up(); }
const nonWhite = (p, sel) => p.evaluate(s => { const c = document.querySelector(s), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 0; i < d.length; i += 16) if (d[i] < 200) n++; return n; }, sel);

/* ---- 1) Fernseher öffnet den Raum ---- */
const TV = await device('tv', { viewport: { width: 1280, height: 720 } });
await TV.p.goto(BASE + '?tv=1');
await until(async () => /^[A-Z0-9]{4}$/.test(await TV.p.textContent('#code')), 8000, 'Raum-Code');
const code = await TV.p.textContent('#code'), url = await TV.p.textContent('#url');
log(/\?join=[A-Z0-9]{4}$/.test(url), 'TV-Lobby (?tv): Code ' + code + ', Link ' + url);
log(await TV.p.locator('#qr svg, #qr img').count() === 1, 'QR-Code wird angezeigt');
log(await TV.p.isDisabled('#bStart'), 'Start erst ab 2 Handys');

/* ---- 2) Drei Handys treten per Link bei ---- */
const phones = {};
for (const n of ['Mia', 'Ben', 'Lea']) {
  const d = await device(n, PHONE); phones[n] = d;
  await d.p.goto(BASE + '?join=' + code);
  await d.p.waitForSelector('#gJoin.on');
  log((await d.p.inputValue('#gCode')) === code, n + ': Link öffnet „Mitspielen“ mit vorausgefülltem Code');
  await d.p.fill('#gName', n); await d.p.tap('#bJoin');
  await until(async () => (await guest(d.p)).joined, 8000, n + ' beitreten');
  await d.p.waitForSelector('#gPlay.on');
}
await until(async () => (await host(TV.p)).players.length === 3, 5000, '3 Spieler');
log(/Du bist drin, Lea/.test(await phones.Lea.p.textContent('#gMsg')), 'Handy zeigt „Du bist drin“ mit klarer Anleitung');
log(!(await TV.p.isDisabled('#bStart')) && /Mia/.test(await TV.p.textContent('#lobPlayers')), 'TV zeigt alle Spieler, Start ist frei');
await shot(TV.p, 'lobby'); await shot(phones.Mia.p, 'handy-lobby');

/* ---- 3) Spiel: Mia malt, Ben und Lea raten ---- */
await TV.p.selectOption('#setRounds', '1'); await TV.p.selectOption('#setTime', '60');
await TV.p.click('#bStart');
await until(async () => (await guest(phones.Mia.p)).opts.length === 3, 6000, 'Wortauswahl');
log(/Du malst/.test(await phones.Mia.p.textContent('#gMsg')) && /Mia malt gleich/.test(await phones.Ben.p.textContent('#gMsg')), 'Maler sieht 3 Wörter, die anderen „Mia malt gleich“');
log(/Mia ist dran/.test(await TV.p.textContent('#hBanner')), 'TV kündigt den Maler an');
await phones.Mia.p.tap('#gOpts button >> nth=0');
await until(async () => (await host(TV.p)).phase === 'draw', 5000, 'Malphase');
const word = (await host(TV.p)).word;
await until(async () => (await guest(phones.Mia.p)).word === word, 4000, 'Wort beim Maler');
log(true, 'Maler sieht sein Wort: ' + word);
log(/_/.test(await phones.Ben.p.textContent('#gHint')) && !(await phones.Ben.p.textContent('#gBody')).includes(word), 'Rater sehen nur Striche, nicht das Wort');
await stroke(phones.Mia.p, '#gBoard'); await phones.Mia.p.tap('#gTools .col >> nth=3'); await stroke(phones.Mia.p, '#gBoard');
await until(async () => (await host(TV.p)).ops >= 2, 4000, 'Striche auf dem TV');
await until(async () => (await nonWhite(phones.Ben.p, '#gBoard')) > 50, 4000, 'Striche bei Ben');
log(await nonWhite(TV.p, '#hBoard') > 50, 'Zeichnung erscheint live auf dem TV und auf den Handys der Rater');
// Raten
await phones.Ben.p.fill('#gGuessIn', 'Quatschwort'); await phones.Ben.p.tap('#gGuess button');
await until(async () => /Ben: Quatschwort/.test(await TV.p.textContent('#hFeed')), 4000, 'falscher Tipp');
log(true, 'Falscher Tipp erscheint im TV-Verlauf');
const near = word.length >= 5 ? word.slice(0, -1) + (word.endsWith('x') ? 'y' : 'x') : null;
if (near) {
  await phones.Lea.p.fill('#gGuessIn', near); await phones.Lea.p.tap('#gGuess button');
  await until(async () => /knapp/.test(await phones.Lea.p.textContent('#gMine')), 4000, 'knapp');
  log(/Lea ist knapp dran/.test(await TV.p.textContent('#hFeed')) && !(await TV.p.textContent('#hFeed')).includes(near), '„Knapp daneben“ nur für Lea, TV verrät den Tipp nicht');
}
await phones.Ben.p.fill('#gGuessIn', word.toLowerCase()); await phones.Ben.p.tap('#gGuess button');
await until(async () => /Richtig/.test(await phones.Ben.p.textContent('#gBody')), 4000, 'Ben richtig');
log(/Ben hat es erraten/.test(await TV.p.textContent('#hFeed')), 'Richtiger Tipp: Ben bekommt Punkte, TV zeigt ✓');
await shot(TV.p, 'tv-malen'); await shot(phones.Mia.p, 'handy-maler'); await shot(phones.Lea.p, 'handy-rater');

/* ---- 4) Lea fällt aus und kommt zurück (gleicher Platz, gleiche Punkte) ---- */
await phones.Lea.p.close();
await until(async () => (await host(TV.p)).players.find(p => p.name === 'Lea').on === false, 6000, 'Lea offline');
log(true, 'TV merkt, dass Lea offline ist');
phones.Lea.p = await phones.Lea.ctx.newPage(); phones.Lea.p.on('pageerror', e => errs.push('Lea2: ' + e.message));
await phones.Lea.p.goto(BASE + '?join=' + code);
await until(async () => (await guest(phones.Lea.p)).joined, 8000, 'Lea zurück');
const hs = await host(TV.p);
log(hs.players.length === 3 && hs.players.find(p => p.name === 'Lea').on, 'Lea ist automatisch zurück auf ihrem Platz (Name gemerkt, kein neuer Spieler)');
await until(async () => (await nonWhite(phones.Lea.p, '#gBoard')) > 50, 4000, 'Bild nach Rückkehr');
log(true, 'Nach der Rückkehr sieht Lea die bisherige Zeichnung');
await phones.Lea.p.fill('#gGuessIn', word); await phones.Lea.p.tap('#gGuess button');
await until(async () => (await host(TV.p)).phase === 'reveal', 5000, 'Auflösung');
log(/Das Wort war/.test(await TV.p.textContent('#hBanner')) && (await TV.p.textContent('#hBanner')).includes(word), 'Alle haben es: Auflösung mit Punkten auf dem TV');
const sc = Object.fromEntries((await host(TV.p)).players.map(p => [p.name, p.score]));
log(sc.Ben > sc.Lea && sc.Lea > 0 && sc.Mia > 0, 'Punkte: schneller = mehr, Maler bekommt auch Punkte ' + JSON.stringify(sc));
await shot(TV.p, 'tv-aufloesung');

/* ---- 5) Weiter bis zum Endstand ---- */
for (let k = 0; k < 12 && (await host(TV.p)).phase !== 'final'; k++) { await TV.p.click('#bSkip'); await TV.p.waitForTimeout(250); }
await until(async () => (await host(TV.p)).phase === 'final', 6000, 'Endstand');
log(/gewinnt/.test(await TV.p.textContent('#hBanner')) && await TV.p.locator('#gal figure').count() >= 1, 'Endstand mit Podest und Galerie');
await until(async () => /Platz|gewonnen/.test(await phones.Ben.p.textContent('#gMsg')), 4000, 'Endstand Handy');
log(true, 'Handys zeigen ihren Platz');
await shot(TV.p, 'tv-ende');
await TV.p.click('#bFinAgain');
await until(async () => (await host(TV.p)).phase === 'choose', 5000, 'Nochmal');
log(true, '„Nochmal“ startet mit denselben Handys neu');
for (const d of Object.values(phones)) await d.ctx.close();
await TV.ctx.close();

/* ---- 6) Ein Gerät ---- */
{
  const d = await device('lokal', PHONE);
  await d.p.goto(BASE); await d.p.tap('#bLocal'); await d.p.tap('#bLStart');
  await d.p.waitForSelector('#lShow'); log(/Gib das Gerät an/.test(await d.p.textContent('#lMsg')), 'Ein Gerät: klare Übergabe an den Maler');
  await d.p.tap('#lShow'); await d.p.tap('#lOpts button >> nth=0');
  await stroke(d.p, '#lBoard'); log(await nonWhite(d.p, '#lBoard') > 50, 'Ein Gerät: Malen funktioniert');
  await d.p.tap('#lOk'); await d.p.tap('#pickList button >> nth=0');
  log(/\+\d+/.test(await d.p.textContent('#lMsg')), 'Ein Gerät: Wer es erraten hat, bekommt Punkte');
  await shot(d.p, 'ein-geraet');
  await d.ctx.close();
}

await browser.close();
if (errs.length) log(false, 'Seitenfehler: ' + errs.join(' | '));
console.log(fails ? fails + ' Fehler' : 'Alles in Ordnung');
process.exit(fails ? 1 : 0);
