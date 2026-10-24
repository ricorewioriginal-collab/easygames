// Wolkenhopser – Browser-Test (Playwright). Start: Server im Repo-Ordner, dann node wolkenhopser/tests/e2e.mjs [Basis-URL] [Screenshot-Ordner]
import { chromium } from 'playwright';
const base = (process.argv[2] || 'http://localhost:8766/') + 'wolkenhopser/', out = process.argv[3] || '';
const b = await chromium.launch({ args: ['--no-sandbox'] });
const errs = [], ok = (c, m) => { console.log((c ? 'ok   ' : 'FEHLER ') + m); if (!c) process.exitCode = 1; };
const shot = async (p, n) => { if (out) await p.screenshot({ path: out + '/hop-' + n + '.jpg', type: 'jpeg', quality: 82 }); };
const relay = new Map();
async function fakePeer(c) {
  await c.exposeBinding('__fp', (src, kind, a, b2) => { if (kind === 'reg') relay.set(a, src.page); else if (kind === 'send') { const to = relay.get(a); if (to) to.evaluate(([from, d, me]) => window.__fpIn(from, d, me), [b2.from, b2.d, a]).catch(() => { }); } });
  await c.route(/cloud\/fire-peer\.js/, async r => { const res = await r.fetch(); r.fulfill({ response: res, body: (await res.text()) + '\n;Object.defineProperty(window, "Peer", { value: window.__FakePeer, writable: true, configurable: true });', contentType: 'text/javascript' }); });
  await c.route(/vendor\/peerjs/, r => r.fulfill({ body: '', contentType: 'text/javascript' }));
  await c.addInitScript(() => {
    window.__conns = {}; window.__peers = {};
    class Conn { constructor(me, other) { this.me = me; this.peer = other; this.open = false; this.h = {}; } on(e, f) { (this.h[e] = this.h[e] || []).push(f); } emit(e, x) { (this.h[e] || []).forEach(f => f(x)); } send(d) { window.__fp('send', this.peer, { from: this.me, d: JSON.parse(JSON.stringify(d)) }); } close() { } }
    window.__fpIn = (from, d, me) => { const key = me + '|' + from; let c = window.__conns[key]; if (d && d.__open) { if (!c) { c = new Conn(me, from); window.__conns[key] = c; window.__peers[me].emit('connection', c); } c.open = true; c.emit('open'); if (!d.__ack) c.send({ __open: 1, __ack: 1 }); return; } if (c) c.emit('data', d); };
    window.__FakePeer = window.Peer = class { constructor(id) { this.id = id || 'g' + Math.random().toString(36).slice(2, 8); this.h = {}; window.__peers[this.id] = this; window.__fp('reg', this.id); setTimeout(() => this.emit('open', this.id), 30); } on(e, f) { (this.h[e] = this.h[e] || []).push(f); } emit(e, x) { (this.h[e] || []).forEach(f => f(x)); }
      connect(id) { const c = new Conn(this.id, id); window.__conns[this.id + '|' + id] = c; setTimeout(() => c.send({ __open: 1 }), 30); return c; } destroy() { } reconnect() { } };
  });
}
async function page(vp, touch, q) { const c = await b.newContext({ viewport: vp, hasTouch: !!touch, isMobile: !!touch, serviceWorkers: 'block' }); await fakePeer(c); const p = await c.newPage(); p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::|firebase|googleapis/i.test(m.text())) errs.push(m.text()); }); await p.goto(base + (q || ''), { waitUntil: 'commit' }); return p; }
const st = p => p.evaluate(() => HOP.state());

const p = await page({ width: 1280, height: 760 });
await p.waitForSelector('#loadBar'); await p.waitForTimeout(250); await shot(p, '01-laden');
await p.waitForSelector('#sTitle.on', { timeout: 15000 }); await p.waitForTimeout(400); await shot(p, '02-titel');
await p.keyboard.press('Enter'); await p.waitForTimeout(500); ok((await st(p)).cur === 'sMenu', 'Hauptmenü'); await shot(p, '03-menue');
await p.keyboard.press('Enter'); await p.waitForTimeout(300); let s = await st(p); ok(s.cur === 'sGame' && !s.demo, 'Spielen startet');
await p.keyboard.down('ArrowRight'); await p.waitForTimeout(500); await p.keyboard.up('ArrowRight'); await p.keyboard.press('Space');
await p.waitForTimeout(2500); s = await st(p); ok(s.maxY > 150, 'Hopsi springt nach oben (' + Math.round(s.maxY) + ')'); await shot(p, '04-spiel');
// höher springen lassen für Screenshot: Hopsi auf Trampolin-Tempo setzen
await p.evaluate(() => { const G = HOP.GS.G; G.p.jet = 2.5; }); await p.waitForTimeout(1600); await shot(p, '05-rakete');
await p.keyboard.press('Escape'); await p.waitForTimeout(200); ok((await st(p)).paused, 'Pause'); await p.keyboard.press('Escape'); await p.waitForTimeout(150);
await p.evaluate(() => { const G = HOP.GS.G; G.plats = []; G.topY = 1e9; G.p.jet = 0; G.p.prop = 0; G.p.vy = -300; G.coinsGot = 120; });
await p.waitForSelector('#ovEnd:not([hidden])', { timeout: 10000 }); await p.waitForTimeout(400); await shot(p, '06-gameover');
ok(/Abgestürzt/.test(await p.textContent('#eTitle')) && +(await p.textContent('#eScore')) > 0, 'Game over mit Punkten');
ok(+(await p.evaluate(() => localStorage.getItem('wolkenhopser-highscore'))) > 0, 'Highscore gespeichert');
await p.click('#eMenu'); await p.waitForTimeout(300);
// Shop: Münzen geben, Kiki kaufen
await p.evaluate(() => localStorage.setItem('wolkenhopser-coins', '400')); await p.click('[data-go="shop"]'); await p.waitForTimeout(300);
await p.click('.skin[data-s="kiki"]'); await p.waitForTimeout(200); ok((await p.evaluate(() => JSON.parse(localStorage.getItem('wolkenhopser-settings')).skin)) === 'kiki', 'Hopsi gekauft und gewählt'); await shot(p, '07-hopsis');
await p.click('#shopX'); await p.click('[data-go="daily"]'); await p.waitForTimeout(400); ok((await st(p)).mode === 'daily', 'Tagesrekord'); await p.keyboard.press('Escape'); await p.click('#pQuit'); await p.waitForTimeout(300);
// Online-Rennen: Gastgeber (PC) + Gast (Handy)
await p.click('[data-go="online"]'); await p.waitForFunction(() => /^[A-Z0-9]{4}$/.test(document.getElementById('code').textContent), null, { timeout: 8000 });
const code = await p.textContent('#code'), link = await p.textContent('#url'); ok(link.startsWith('https://ricorewioriginal-collab.github.io/easygames/wolkenhopser/?join=' + code), 'Einladung über die easygames-Homepage');
const m = await page({ width: 400, height: 820 }, true, '?join=' + code); await m.waitForSelector('#sJoin.on', { timeout: 15000 }); await m.fill('#jName', 'Mia'); await m.click('#bJoin'); await m.waitForSelector('#jWait:not([hidden])', { timeout: 8000 });
await p.waitForTimeout(400); ok((await p.locator('#lobPlayers .lp').count()) === 2, 'Gast in der Lobby'); await shot(p, '08-lobby');
await p.click('#lobGo'); await m.waitForSelector('#sGame.on', { timeout: 8000 }); ok((await st(m)).mode === 'race', 'Rennen startet auch beim Gast');
const seeds = await Promise.all([p, m].map(x => x.evaluate(() => HOP.GS.G.seed))); ok(seeds[0] === seeds[1], 'gleiche Welt für beide');
await m.waitForTimeout(1500); await shot(m, '09-handy-rennen');
await m.locator('#tzR').dispatchEvent('pointerdown'); await m.waitForTimeout(400); await m.locator('#tzR').dispatchEvent('pointerup');
for (const x of [p, m]) await x.evaluate(() => { const G = HOP.GS.G; G.plats = []; G.topY = 1e9; G.p.vy = -300; });
await p.waitForFunction(() => document.getElementById('eAgain').textContent.includes('Neues Rennen'), null, { timeout: 15000 }); ok(true, 'Rennen endet, Gastgeber kann neu starten');
await m.waitForFunction(() => /Platz|gewinnst/.test(document.getElementById('eTitle').textContent), null, { timeout: 8000 }); ok(true, 'Gast sieht Platzierung'); await shot(m, '10-handy-ergebnis');
ok(errs.length === 0, 'keine JS-Fehler ' + errs.join(' | '));
await b.close();
