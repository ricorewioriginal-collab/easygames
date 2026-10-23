/* Wortfunk – Browser-Test (Playwright): Touch-Ziehen, Tastatur/Controller-Tasten, ganze Partie gegen den Computer,
   Online mit TV-Tisch und zwei Handys (Verbindung über eine Test-Attrappe statt Firebase/PeerJS).
   Aufruf: python3 -m http.server 8765 &  BASE=http://localhost:8765/wortfunk/ [SHOT=/tmp] node wortfunk/tests/e2e.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8765/wortfunk/', SHOT = process.env.SHOT || '';
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
async function page(ctx, name) {
  const p = await ctx.newPage();
  p.on('pageerror', e => { errs.push(name + ': ' + e.message); console.log('PAGEERR', name, e.message); });
  await p.addInitScript(FAKE);
  await p.route(/cloud\/fire-peer|anmacha-cloud|gamepad\.js|vendor\/peerjs/, r => r.fulfill({ body: '', contentType: 'text/javascript' }));
  return p;
}
const ready = p => p.waitForFunction(() => !document.getElementById('bNew').disabled, null, { timeout: 20000 });
const myTurn = (p, ms = 25000) => p.waitForFunction(() => /Du bist dran/.test(document.getElementById('turnInfo').textContent), null, { timeout: ms });
const score = (p, k) => p.$$eval('.sc .p', e => e.map(x => +x.textContent)).then(a => a[k]);
const shot = (p, n) => SHOT ? p.screenshot({ path: SHOT + '/wortfunk-' + n + '.png' }) : null;

/* 1) Handy: Touch – Stein ziehen, zurücknehmen, Tipp, legen */
{
  const ctx = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await page(ctx, 'handy');
  await p.goto(BASE); await ready(p);
  await p.tap('#bNew'); await p.tap('#bStart'); await myTurn(p);
  // Stein mit Ziehen auf den Stern legen
  const from = await p.locator('.rk >> nth=0').boundingBox(), to = await p.locator('.cell[data-i="112"]').boundingBox();
  await p.mouse.move(from.x + from.width / 2, from.y + from.height / 2); await p.mouse.down();
  await p.mouse.move(to.x + 5, to.y + 5, { steps: 6 }); await p.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 4 }); await p.mouse.up();
  const joker = await p.isVisible('#ovJoker'); if (joker) await p.click('#jokerGrid button >> nth=4');
  log(await p.locator('.cell[data-i="112"] .tile.pend').count() === 1, 'Ziehen legt einen Stein aufs Brett');
  await p.tap('.cell[data-i="112"]');
  log(await p.locator('.tile.pend').count() === 0, 'Antippen nimmt den Stein zurück');
  await p.tap('#aHint'); await p.waitForSelector('.tile.pend', { timeout: 8000 });
  await shot(p, 'handy');
  const before = await score(p, 0); await p.tap('#aPlay'); await p.waitForTimeout(400);
  log(await score(p, 0) > before, 'Tipp + Legen bringt Punkte (' + await score(p, 0) + ')');
  await ctx.close();
}

/* 2) PC: Tastatur und Controller-Tasten (gamepad.js schickt dieselben Tasten), dann ganze Partie Computer gegen Computer bis zum Ende */
{
  const ctx = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 1366, height: 800 } });
  const p = await page(ctx, 'pc');
  await p.goto(BASE); await ready(p);
  await p.keyboard.press('Enter'); // Fokus liegt auf „Neues Spiel“
  await p.waitForSelector('#sSetup.on');
  await p.click('#bStart'); await myTurn(p);
  await p.keyboard.press('Equal'); await p.keyboard.press('Space'); // RB = nächster Stein, A = legen
  if (await p.isVisible('#ovJoker')) await p.keyboard.press('KeyE');
  log(await p.locator('.tile.pend').count() === 1, 'Controller: Stein wählen und mit A legen');
  await p.keyboard.press('Backspace'); // B = zurück
  log(await p.locator('.tile.pend').count() === 0, 'Controller: B nimmt den Stein zurück');
  await p.keyboard.press('Digit0'); await p.waitForSelector('.tile.pend', { timeout: 8000 }); // Select = Tipp
  await p.keyboard.press('Enter'); // X = Legen
  await p.waitForTimeout(300);
  log(await score(p, 0) > 0, 'Tastatur: Tipp und Enter legen den Zug');
  await p.keyboard.press('Escape'); log(await p.isVisible('#ovMenu'), 'Esc/Start öffnet das Menü');
  await p.keyboard.press('Escape'); log(!(await p.isVisible('#ovMenu')), 'Esc schließt das Menü');
  await shot(p, 'pc');
  // ganze Partie: Mensch spielt per Tipp/Tauschen weiter, bis die Partie endet
  const t0 = Date.now();
  while (Date.now() - t0 < 240000 && !(await p.isVisible('#ovEnd'))) {
    const mine = await p.evaluate(() => /Du bist dran/.test(document.getElementById('turnInfo').textContent) && !document.getElementById('aPlay').closest('.actions').hidden);
    if (mine) {
      const hintOk = await p.evaluate(() => !document.getElementById('aHint').disabled);
      if (hintOk) { await p.keyboard.press('Digit0'); await p.waitForTimeout(500); }
      else {
        // ohne Tipps: einzelnen Stein irgendwo passend legen ist schwer – Passen (zweimal drücken)
        await p.click('#aPass'); await p.click('#aPass');
      }
      if (await p.locator('.tile.pend').count()) await p.keyboard.press('Enter');
      else if (hintOk) { await p.click('#aPass'); await p.click('#aPass'); }
    }
    await p.waitForTimeout(250);
  }
  log(await p.isVisible('#ovEnd'), 'Partie läuft bis zum Endstand: ' + (await p.textContent('#endRank')).replace(/\s+/g, ' '));
  await shot(p, 'ende');
  await p.click('#bEndMenu');
  log(/Partien/.test(await p.textContent('#menuStat')), 'Statistik im Menü: ' + await p.textContent('#menuStat'));
  await ctx.close();
}

/* 3) Online: TV eröffnet (spielt nicht mit), zwei Handys treten per Link bei, dazu ein Computer */
{
  const ctx = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 1280, height: 720 }, hasTouch: true });
  const tv = await page(ctx, 'tv');
  await tv.goto(BASE + '?tv=1'); await ready(tv);
  await tv.waitForFunction(() => /^[A-Z0-9]{4}$/.test(document.getElementById('lobCode').textContent), null, { timeout: 10000 });
  const code = await tv.textContent('#lobCode');
  log(!(await tv.isChecked('#hostPlays')), 'TV-Modus: Fernseher spielt nicht mit, Code ' + code);
  log(/easygames\/wortfunk\/#join=/.test(await tv.textContent('#lobLink')) || /#join=/.test(await tv.textContent('#lobLink')), 'Einladungslink: ' + await tv.textContent('#lobLink'));
  const phones = [];
  for (const n of ['Mia', 'Ben']) {
    const ph = await page(ctx, n); await ph.setViewportSize({ width: 390, height: 844 });
    await ph.addInitScript(nm => { try { localStorage.setItem('wortfunk-name', JSON.stringify(nm)); } catch (e) { } }, n);
    await ph.goto(BASE + '#join=' + code); await ready(ph);
    await ph.waitForSelector('#onGuest:not([hidden])', { timeout: 10000 });
    phones.push(ph);
  }
  await tv.waitForFunction(() => document.querySelectorAll('#lobSeats .pl').length === 2, null, { timeout: 8000 });
  await tv.click('#bAddBot');
  log((await tv.textContent('#lobSeats')).includes('Mia') && (await tv.textContent('#lobSeats')).includes('Ben'), 'Lobby zeigt beide Handys und den Computer');
  await tv.click('#bLobStart');
  for (const ph of phones) await ph.waitForSelector('#sGame.on', { timeout: 8000 });
  log(await tv.locator('.rk').count() === 0, 'TV zeigt keine Steine (nur das Brett)');
  log(await phones[0].locator('.rk').count() === 7 && await phones[1].locator('.rk').count() === 7, 'Jedes Handy sieht seine 7 Steine');
  // zwei Runden spielen
  for (let r = 0; r < 2; r++) for (const [k, ph] of phones.entries()) {
    await myTurn(ph);
    await ph.tap('#aHint'); await ph.waitForSelector('.tile.pend', { timeout: 8000 });
    const b = await score(tv, k); await ph.tap('#aPlay');
    await tv.waitForFunction(([k, b]) => +document.querySelectorAll('.sc .p')[k].textContent > b, [k, b], { timeout: 8000 });
  }
  const tvS = await tv.$$eval('.sc .p', e => e.map(x => x.textContent).join(',')), phS = await phones[1].$$eval('.sc .p', e => e.map(x => x.textContent).join(','));
  log(tvS === phS, 'Punktestand gleich auf TV und Handy: ' + tvS);
  // ungültiger Zug wird vom TV abgelehnt
  await myTurn(phones[0]);
  const bad = await phones[0].evaluate(() => { const b = document.querySelectorAll('.cell'); for (const c of b) if (!c.querySelector('.tile')) return +c.dataset.i; });
  await phones[0].tap('.rk >> nth=0'); await phones[0].tap('.cell[data-i="0"]');
  if (await phones[0].isVisible('#ovJoker')) await phones[0].click('#jokerGrid button >> nth=0');
  log(/anschließen|Wörterbuch|Stern/.test(await phones[0].textContent('#preview')), 'Vorschau warnt vor ungültigem Zug: ' + await phones[0].textContent('#preview'));
  void bad;
  await shot(tv, 'tv'); await shot(phones[0], 'online-handy');
  // Handy fällt aus → Computer übernimmt, Handy kommt zurück
  await phones[1].close({ runBeforeUnload: true });
  await tv.waitForFunction(() => /offline/.test(document.getElementById('scores').textContent), null, { timeout: 8000 });
  log(true, 'Ausgefallenes Handy wird als offline angezeigt');
  const back = await page(ctx, 'Ben2'); await back.setViewportSize({ width: 390, height: 844 });
  await back.addInitScript(() => { try { localStorage.setItem('wortfunk-name', JSON.stringify('Ben')); } catch (e) { } });
  await back.goto(BASE + '#join=' + code); await ready(back);
  await back.waitForSelector('#sGame.on', { timeout: 10000 });
  log(await back.locator('.rk').count() >= 1, 'Handy kommt mit seinem Platz zurück ins Spiel');
  await ctx.close();
}

await browser.close();
if (errs.length) log(false, 'Seitenfehler: ' + errs.join(' | '));
console.log(fails ? fails + ' Fehler' : 'Alles in Ordnung');
process.exit(fails ? 1 : 0);
