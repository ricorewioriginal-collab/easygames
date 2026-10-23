/* Wortgitter – Browser-Test (Playwright): Wischen, Tippen, Tastatur, Controller-Tasten, Rundenende,
   Online mit TV und zwei Handys plus Computer (Verbindung über eine Test-Attrappe statt Firebase/PeerJS).
   Aufruf: python3 -m http.server 8765 &  BASE=http://localhost:8765/wortgitter/ [SHOT=/tmp] node wortgitter/tests/e2e.mjs */
import { chromium } from 'playwright';
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
const ROOT = new URL('../../', import.meta.url).pathname;
const WF = require(ROOT + 'wortfunk/js/logic.js'); globalThis.WF = WF; const WG = require(ROOT + 'wortgitter/js/grid.js');
const dict = WF.Dict(new Uint32Array(fs.readFileSync(ROOT + 'wortfunk/data/woerter.dawg').buffer.slice(0)));
const BASE = process.env.BASE || 'http://localhost:8765/wortgitter/', SHOT = process.env.SHOT || '';
let fails = 0; const errs = [];
const log = (ok, m) => { console.log((ok ? '✓ ' : '✗ ') + m); if (!ok) fails++; };
const browser = await chromium.launch({ args: ['--no-sandbox'] });
// PeerJS-Attrappe über BroadcastChannel (alle Seiten eines Kontexts sehen sich)
const FAKE = () => {
  const mk = () => new BroadcastChannel('wf-fake');
  class Conn { constructor(me, o, ch) { this.me = me; this.peer = o; this.ch = ch; this.h = {}; this.open = false; }
    on(e, f) { (this.h[e] = this.h[e] || []).push(f); } emit(e, ...a) { (this.h[e] || []).forEach(f => f(...a)); }
    send(d) { this.ch.postMessage({ k: 'data', to: this.peer, from: this.me, d: JSON.parse(JSON.stringify(d)) }); }
    close() { if (!this.open) return; this.open = false; this.ch.postMessage({ k: 'close', to: this.peer, from: this.me }); this.emit('close'); } }
  class Peer { constructor(id) { this.id = id || 'p' + Math.random().toString(36).slice(2, 9); this.h = {}; this.c = {}; this.ch = mk();
      this.ch.onmessage = e => { const m = e.data; if (m.to !== this.id) return; let c = this.c[m.from];
        if (m.k === 'connect') { c = new Conn(this.id, m.from, this.ch); this.c[m.from] = c; this.emit('connection', c); setTimeout(() => { c.open = true; c.emit('open'); this.ch.postMessage({ k: 'accept', to: m.from, from: this.id }); }, 10); }
        else if (m.k === 'accept' && c) { c.open = true; c.emit('open'); }
        else if (m.k === 'data' && c) c.emit('data', m.d);
        else if (m.k === 'close' && c && c.open) { c.open = false; c.emit('close'); } };
      setTimeout(() => this.emit('open', this.id), 20); }
    on(e, f) { (this.h[e] = this.h[e] || []).push(f); } emit(e, ...a) { (this.h[e] || []).forEach(f => f(...a)); }
    connect(id) { const c = new Conn(this.id, id, this.ch); this.c[id] = c; this.ch.postMessage({ k: 'connect', to: id, from: this.id }); return c; }
    destroy() { Object.values(this.c).forEach(c => c.close()); this.ch.close(); } reconnect() { } }
  const all = []; const P0 = Peer; window.Peer = function (id) { const p = new P0(id); all.push(p); return p; };
  addEventListener('pagehide', () => all.forEach(p => { try { p.destroy(); } catch (e) { } }));
};
async function page(ctx, name, clock) {
  const p = await ctx.newPage();
  p.on('pageerror', e => { errs.push(name + ': ' + e.message); console.log('PAGEERR', name, e.message); });
  if (clock) await p.clock.install();
  await p.addInitScript(FAKE);
  await p.route(/cloud\/fire-peer|anmacha-cloud|gamepad\.js|vendor\/peerjs/, r => r.fulfill({ body: '', contentType: 'text/javascript' }));
  return p;
}
const ready = p => p.waitForFunction(() => !document.querySelector('.lvl').disabled, null, { timeout: 20000 });
const shot = (p, n) => SHOT ? p.screenshot({ path: SHOT + '/wortgitter-' + n + '.png' }) : null;
// Gitter aus der Seite lesen und in Node lösen
async function solution(p) {
  const letters = await p.$$eval('.gc', c => c.map(x => x.childNodes[0].textContent));
  const n = Math.round(Math.sqrt(letters.length)), grid = letters.map(l => WF.AL.indexOf(l) + 1), min = n === 4 ? 3 : 4;
  return { n, grid, words: Array.from(WG.solve(grid, n, min, dict)) };
}
async function swipe(p, path) {
  const pts = []; for (const i of path) { const b = await p.locator('.gc').nth(i).boundingBox(); pts.push([b.x + b.width / 2, b.y + b.height / 2]); }
  await p.mouse.move(...pts[0]); await p.mouse.down();
  for (const q of pts.slice(1)) await p.mouse.move(q[0], q[1], { steps: 5 });
  await p.mouse.up();
}
const score = p => p.textContent('#score').then(Number);

/* 1) Handy 4×4: Wischen, Tippen, ungültiges Wort, Runde beenden */
{
  const ctx = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await page(ctx, 'handy');
  await p.goto(BASE); await ready(p);
  await p.tap('.lvl[data-lv="leicht"]'); await p.waitForSelector('#sGame.on');
  const sol = await solution(p);
  log(sol.n === 4 && sol.words.length > 15, '4×4-Gitter mit ' + sol.words.length + ' Wörtern');
  const [w1, p1] = sol.words.find(([w]) => w.length >= 4) || sol.words[0];
  await swipe(p, p1); await p.waitForTimeout(150);
  log(await score(p) === WG.points(w1.length), 'Wischen findet ' + w1 + ' (' + await score(p) + ' Punkte)');
  await swipe(p, p1); await p.waitForTimeout(100);
  log(/schon/.test(await p.textContent('#word')), 'Doppeltes Wort wird erkannt');
  const [w2, p2] = sol.words.find(([w]) => w !== w1);
  for (const i of p2) await p.tap('.gc >> nth=' + i);
  await p.tap('.gc >> nth=' + p2[p2.length - 1]); await p.waitForTimeout(150);
  log((await p.textContent('#found')).includes(w2), 'Antippen + letzten nochmal tippen findet ' + w2);
  await shot(p, 'handy');
  await p.tap('#bMenu'); await p.tap('#mQuit'); await p.waitForSelector('#ovEnd:not([hidden])');
  log(/von \d+ Wörtern/.test(await p.textContent('#endRank')) && (await p.locator('#endMiss span').count()) > 3, 'Auswertung zeigt gefundene und verpasste Wörter');
  await shot(p, 'auswertung');
  await ctx.close();
}

/* 2) PC 6×6: Tastatur tippen, Controller (Pfeile + Leertaste/A, X = Enter, B = Rücktaste) */
{
  const ctx = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 1366, height: 800 } });
  const p = await page(ctx, 'pc');
  await p.goto(BASE); await ready(p);
  await p.click('.lvl[data-lv="schwer"]'); await p.waitForSelector('#sGame.on');
  const sol = await solution(p);
  log(sol.n === 6 && sol.words.length > 60, '6×6-Gitter mit ' + sol.words.length + ' Wörtern');
  const [w1] = sol.words.find(([w]) => w.length >= 5) || sol.words[0];
  await p.keyboard.type(w1.toLowerCase()); await p.keyboard.press('Enter'); await p.waitForTimeout(150);
  log((await p.textContent('#found')).includes(w1), 'Tastatur: ' + w1 + ' getippt und geprüft');
  // Controller: Rahmen per Pfeil zu den Feldern bewegen, A nimmt dazu, X prüft
  const [w2, p2] = sol.words.find(([w]) => w !== w1);
  let cur = Math.floor(36 / 2);
  for (const i of p2) {
    let r = (cur / 6) | 0, c = cur % 6; const tr = (i / 6) | 0, tc = i % 6;
    while (c < tc) { await p.keyboard.press('ArrowRight'); c++; } while (c > tc) { await p.keyboard.press('ArrowLeft'); c--; }
    while (r < tr) { await p.keyboard.press('ArrowDown'); r++; } while (r > tr) { await p.keyboard.press('ArrowUp'); r--; }
    cur = i; await p.keyboard.press('Space');
  }
  await p.keyboard.press('Backspace'); await p.keyboard.press('Space'); // B nimmt weg, A wieder dazu
  await p.keyboard.press('Enter'); await p.waitForTimeout(150);
  log((await p.textContent('#found')).includes(w2), 'Controller: ' + w2 + ' mit Steuerkreuz + A/X');
  await shot(p, 'pc');
  await p.keyboard.press('Escape'); log(await p.isVisible('#ovMenu'), 'Start/Esc öffnet das Menü'); await p.keyboard.press('Escape');
  await ctx.close();
}

/* 3) Online: TV (Uhr vorgespult), zwei Handys, ein Computer; doppelte Wörter zählen nicht */
{
  const ctx = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 1280, height: 720 }, hasTouch: true });
  const tv = await page(ctx, 'tv', true);
  await tv.goto(BASE + '?tv=1'); await ready(tv);
  await tv.waitForFunction(() => /^[A-Z0-9]{4}$/.test(document.getElementById('lobCode').textContent), null, { timeout: 10000 });
  const code = await tv.textContent('#lobCode');
  const phones = [];
  for (const n of ['Mia', 'Ben']) {
    const ph = await page(ctx, n); await ph.setViewportSize({ width: 390, height: 844 });
    await ph.addInitScript(nm => { localStorage.setItem('wortgitter-name', JSON.stringify(nm)); }, n);
    await ph.goto(BASE + '#join=' + code); await ready(ph); await ph.waitForSelector('#onGuest:not([hidden])', { timeout: 10000 });
    phones.push(ph);
  }
  await tv.waitForFunction(() => document.querySelectorAll('#lobSeats .pl').length === 2, null, { timeout: 8000 });
  await tv.click('#bAddBot'); await tv.selectOption('#lobLevel', 'mittel');
  await tv.click('#bLobStart');
  for (const ph of phones) await ph.waitForSelector('#sGame.on', { timeout: 8000 });
  const sTv = await solution(tv), sPh = await solution(phones[0]);
  log(sTv.n === 5 && sTv.grid.join() === sPh.grid.join(), 'TV und Handys haben dasselbe 5×5-Gitter');
  const ws = sTv.words.slice(0, 6);
  await swipe(phones[0], ws[0][1]); await swipe(phones[0], ws[1][1]); // Mia: A, B
  await swipe(phones[1], ws[0][1]); await swipe(phones[1], ws[2][1]); // Ben: A (doppelt), C
  await tv.waitForFunction(() => /Mia 2/.test(document.getElementById('players').textContent.replace(/\s+/g, ' ')), null, { timeout: 5000 });
  log(true, 'TV zeigt live, wie viele Wörter jeder hat');
  await shot(tv, 'tv');
  await tv.clock.runFor(215000);
  for (const ph of phones) await ph.waitForFunction(() => /Runde/.test(document.getElementById('endTitle').textContent) || /Gleichstand/.test(document.getElementById('endTitle').textContent), null, { timeout: 10000 });
  const rank = (await phones[0].textContent('#endRank')).replace(/\s+/g, ' ');
  const p0 = WG.points(Array.from(ws[1][0]).length), p1 = WG.points(Array.from(ws[2][0]).length);
  log(rank.includes('Mia') && rank.includes('Ben') && /🤖/.test(rank), 'Ergebnis auf dem Handy: ' + rank);
  log(await phones[0].textContent('#endScore') === p0 + ' Punkte' && await phones[1].textContent('#endScore') === p1 + ' Punkte', 'Doppeltes Wort zählt für niemanden (Mia ' + p0 + ', Ben ' + p1 + ')');
  log(await phones[0].locator('#endFound span.dup').count() === 1, 'Doppeltes Wort ist durchgestrichen');
  await shot(phones[0], 'online-ergebnis');
  await tv.click('#bEndAgain');
  for (const ph of phones) await ph.waitForFunction(() => !document.getElementById('ovEnd').offsetParent && document.getElementById('sGame').classList.contains('on'), null, { timeout: 8000 });
  log(true, 'Nächste Runde startet auf allen Geräten');
  await ctx.close();
}

await browser.close();
if (errs.length) log(false, 'Seitenfehler: ' + errs.join(' | '));
console.log(fails ? fails + ' Fehler' : 'Alles in Ordnung');
process.exit(fails ? 1 : 0);
