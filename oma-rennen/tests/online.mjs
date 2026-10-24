// Oma-Rennen – Online-Test: Fernseher (?tv) + 2 Handys als Lenkräder über ein Test-Relais statt Firebase, Computer-Omas füllen auf.
// Start: Server im Repo-Ordner, dann node oma-rennen/tests/online.mjs [Basis-URL] [Screenshot-Ordner]
import { chromium } from 'playwright';
const base = (process.argv[2] || 'http://localhost:8766/') + 'oma-rennen/', out = process.argv[3] || '';
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
ok(link.startsWith('https://ricorewioriginal-collab.github.io/easygames/oma-rennen/') && link.includes('?join=' + code), 'Einladung über die easygames-Homepage: ' + link);
ok(await tv.evaluate(() => !!document.querySelector('#qr svg')), 'QR-Code');
ok(await tv.isDisabled('#lbGo'), 'Start erst mit Mitspielerin');
const phones = [];
for (const [name, oma] of [['Mia', 1], ['Tom', 1]]) { const c = await b.newContext({ viewport: { width: 800, height: 390 }, serviceWorkers: 'block', hasTouch: true, isMobile: true }); await fakePeer(c); const p = await c.newPage(); p.on('pageerror', e => errs.push(name + ': ' + e.message)); await p.goto(base + '?join=' + code); await p.waitForSelector('#sPhone.on', { timeout: 15000 }); await p.fill('#jName', name); await p.click('#jOmas .og[data-i="' + oma + '"]'); await p.click('#jGo'); await p.waitForSelector('#pCtl:not([hidden])', { timeout: 8000 }); phones.push(p); }
await tv.waitForTimeout(400); ok((await tv.locator('.seat.on').count()) === 2, '2 Handys in der Lobby');
const omas = await tv.evaluate(() => OmaApp.NETH.seats.map(s => s.oma)); ok(omas[0] !== omas[1], 'Gleiche Oma gewählt: zweite bekommt eine andere (' + omas + ')');
if (out) await tv.screenshot({ path: out + '/or-30-lobby.jpg', type: 'jpeg', quality: 80 });
await tv.evaluate(() => { OmaApp.A.speed = 4; OmaApp.SET.laps = 2; });
await phones[0].click('#cGo'); await tv.waitForFunction(() => !!OmaApp.R, null, { timeout: 5000 }); ok(true, 'Handy startet das Rennen');
const R0 = await tv.evaluate(() => ({ n: OmaApp.R.S.karts.length, views: OmaApp.R.views.length })); ok(R0.n === 8 && R0.views === 2, '8 Omas, geteilter Bildschirm für 2 Handys');
// Handy 1: Steuerung wie AnMaCha Kart Rush – Joystick links nach rechts ziehen, GAS-Taste der Raute halten
const gb = await phones[0].locator('#cz .tb-g').boundingBox(), jb = await phones[0].locator('#cz .jb').boundingBox();
const gx = gb.x + gb.width / 2, gy = gb.y + gb.height / 2, jx = jb.x + jb.width / 2, jy = jb.y + jb.height / 2;
await phones[0].dispatchEvent('#cz', 'pointerdown', { pointerId: 7, clientX: gx, clientY: gy, bubbles: true });
await phones[0].dispatchEvent('#cz', 'pointerdown', { pointerId: 8, clientX: jx, clientY: jy, bubbles: true });
await phones[0].dispatchEvent('#cz', 'pointermove', { pointerId: 8, clientX: jx + 60, clientY: jy, bubbles: true });
await tv.waitForTimeout(1500);
const inp = await tv.evaluate(() => OmaApp.NETH.seats[0].in); ok(inp && inp.g === 1 && inp.s > .5, 'Joystick + GAS kommen am Fernseher an ' + JSON.stringify(inp));
if (out) await phones[0].screenshot({ path: out + '/or-32-handy.jpg', type: 'jpeg', quality: 80 });
await phones[0].dispatchEvent('#cz', 'pointerup', { pointerId: 8, clientX: jx + 60, clientY: jy, bubbles: true });
await phones[0].waitForFunction(() => /Platz \d/.test(document.getElementById('cStat').textContent), null, { timeout: 15000 }).then(() => ok(true, 'Handy zeigt Platz und Runde'), () => ok(false, 'Handy zeigt Platz und Runde'));
if (out) { await tv.waitForTimeout(3000); await tv.screenshot({ path: out + '/or-31-tv-rennen.jpg', type: 'jpeg', quality: 80 }); }
await tv.evaluate(() => { const R = OmaApp.R; R.hk.forEach(k => { R.S.karts[k].assist = 1; }); R.speed = 14; });
await tv.waitForSelector('#sResult.on', { timeout: 150000 }).then(() => ok(true, 'Ergebnis am Fernseher'), () => ok(false, 'Ergebnis am Fernseher'));
await phones[1].waitForFunction(() => !document.getElementById('cGo').hidden, null, { timeout: 5000 }).then(() => ok(true, 'Handy zeigt „Weiter“ nach dem Rennen'), () => ok(false, 'Handy zeigt „Weiter“'));
if (out) await tv.screenshot({ path: out + '/or-33-tv-ergebnis.jpg', type: 'jpeg', quality: 80 });
await b.close();
ok(!errs.length, 'Keine Skriptfehler ' + errs.slice(0, 3).join(' | '));
