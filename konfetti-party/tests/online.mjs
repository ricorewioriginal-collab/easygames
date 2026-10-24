// Konfetti-Party – Online-Test: Fernseher (?tv) + 2 Handys als Controller über ein Test-Relais statt Firebase, ein Computer-Gast füllt auf.
// Start: Server im Repo-Ordner, dann node konfetti-party/tests/online.mjs [Basis-URL] [Screenshot-Ordner]
import { chromium } from 'playwright';
const base = (process.argv[2] || 'http://localhost:8766/') + 'konfetti-party/', out = process.argv[3] || '';
const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
const errs = [], ok = (c, m) => { console.log((c ? 'ok   ' : 'FEHLER ') + m); if (!c) process.exitCode = 1; };
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
const tvc = await b.newContext({ viewport: { width: 1280, height: 720 }, serviceWorkers: 'block' }); await fakePeer(tvc);
const tv = await tvc.newPage(); tv.on('pageerror', e => errs.push('TV: ' + e.message));
await tv.goto(base + '?tv'); await tv.waitForSelector('#sLobby.on', { timeout: 15000 }); await tv.waitForFunction(() => /^[A-Z0-9]{4}$/.test(document.getElementById('code').textContent), null, { timeout: 8000 });
const code = await tv.textContent('#code'), link = await tv.textContent('#url');
ok(link.startsWith('https://ricorewioriginal-collab.github.io/easygames/konfetti-party/') && link.includes('?join=' + code), 'Einladung über die easygames-Homepage: ' + link);
ok(await tv.evaluate(() => !!document.querySelector('#qr svg')), 'QR-Code');
ok(await tv.isDisabled('#lbGo'), 'Start erst mit Mitspieler');
const phones = [];
for (const name of ['Mia', 'Tom']) { const c = await b.newContext({ viewport: { width: 800, height: 390 }, serviceWorkers: 'block', hasTouch: true, isMobile: true }); await fakePeer(c); const p = await c.newPage(); p.on('pageerror', e => errs.push(name + ': ' + e.message)); await p.goto(base + '?join=' + code); await p.waitForSelector('#sPhone.on', { timeout: 15000 }); await p.fill('#jName', name); await p.click('#jGo'); await p.waitForSelector('#pCtl:not([hidden])', { timeout: 8000 }); phones.push(p); }
await tv.waitForTimeout(400); ok((await tv.locator('.seat.on').count()) === 2, '2 Handys in der Lobby');
await tv.click('#lbBots .sg[data-v="1"]'); ok((await tv.locator('.seat.bot').count()) === 1, 'Ein Computer-Gast füllt auf');
if (out) await tv.screenshot({ path: out + '/kp-30-lobby.jpg', type: 'jpeg', quality: 80 });
await phones[0].click('#cGo'); await tv.waitForFunction(() => !!KPApp.A.G, null, { timeout: 5000 }); ok(true, 'Handy startet die Party');
ok(await tv.evaluate(() => KPApp.A.G.players.length === 3 && KPApp.A.G.players[2].bot), '3 Gäste, einer davon Computer');
await tv.waitForFunction(() => KPApp.A.phase === 'play', null, { timeout: 30000 });
// Handy 1: Joystick nach rechts ziehen, dann KNALL
const jb = await phones[0].locator('#cz .jb').boundingBox(), jx = jb.x + jb.width / 2, jy = jb.y + jb.height / 2;
await phones[0].dispatchEvent('#cz', 'pointerdown', { pointerId: 8, clientX: jx, clientY: jy, bubbles: true });
await phones[0].dispatchEvent('#cz', 'pointermove', { pointerId: 8, clientX: jx + 60, clientY: jy, bubbles: true });
await tv.waitForTimeout(700); await phones[0].dispatchEvent('#cz', 'pointerup', { pointerId: 8, bubbles: true });
const pos = await tv.evaluate(() => KPApp.A.G.players[0].x); ok(pos > 1.9, 'Joystick bewegt den Gast am Fernseher (x=' + pos.toFixed(2) + ')');
const ab = await phones[0].locator('#cz .tb-a').boundingBox();
await phones[0].dispatchEvent('#cz', 'pointerdown', { pointerId: 9, clientX: ab.x + ab.width / 2, clientY: ab.y + ab.height / 2, bubbles: true }); await tv.waitForTimeout(300); await phones[0].dispatchEvent('#cz', 'pointerup', { pointerId: 9, bubbles: true });
await tv.waitForTimeout(300); ok(await tv.evaluate(() => KPApp.A.G.bombs.some(b => b.owner === 0)), 'KNALL am Handy legt ein Bonbon');
await phones[0].waitForFunction(() => /🍬/.test(document.getElementById('cPow').textContent), null, { timeout: 5000 }).then(() => ok(true, 'Handy zeigt die Extras'), () => ok(false, 'Handy zeigt die Extras'));
if (out) { await tv.waitForTimeout(1200); await tv.screenshot({ path: out + '/kp-31-tv.jpg', type: 'jpeg', quality: 80 }); await phones[0].screenshot({ path: out + '/kp-32-handy.jpg', type: 'jpeg', quality: 80 }); }
await tv.evaluate(() => { const G = KPApp.A.G; G.players.forEach(p => { p.bot = true; }); G.wins = 1; G.time = 15; G.t = Math.min(G.t, 15); KPApp.A.speed = 10; });
await tv.waitForSelector('#sResult.on', { timeout: 150000 }).then(() => ok(true, 'Siegerehrung am Fernseher'), () => ok(false, 'Siegerehrung am Fernseher'));
await phones[1].waitForFunction(() => /gewinnt|Party/.test(document.getElementById('cStat').textContent) && !document.getElementById('cGo').hidden, null, { timeout: 5000 }).then(() => ok(true, 'Handy zeigt das Ergebnis und „Weiter“'), () => ok(false, 'Handy zeigt das Ergebnis'));
await b.close();
ok(!errs.length, 'Keine Skriptfehler ' + errs.slice(0, 3).join(' | '));
