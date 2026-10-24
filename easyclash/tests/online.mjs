// EASYCLASH – Online-Test: Fernseher (?tv) + 2 Handys als Controller über ein Test-Relais statt Firebase.
// Start: Server im Repo-Ordner, dann node easyclash/tests/online.mjs [Basis-URL] [Screenshot-Ordner]
import { chromium } from 'playwright';
const base = (process.argv[2] || 'http://localhost:8766/') + 'easyclash/', out = process.argv[3] || '';
const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--no-sandbox'] });
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
await tv.goto(base + '?tv'); await tv.waitForSelector('#sLobby.on', { timeout: 60000 }); await tv.waitForFunction(() => /^[A-Z0-9]{4}$/.test(document.getElementById('code').textContent), null, { timeout: 8000 });
const code = await tv.textContent('#code'), link = await tv.textContent('#url');
ok(link.startsWith('https://ricorewioriginal-collab.github.io/easygames/easyclash/') && link.includes('?join=' + code), 'Einladung über die easygames-Homepage');
const phones = [];
for (const name of ['Mia', 'Tom']) { const c = await b.newContext({ viewport: { width: 390, height: 800 }, serviceWorkers: 'block', hasTouch: true, isMobile: true }); await fakePeer(c); const p = await c.newPage(); p.on('pageerror', e => errs.push(name + ': ' + e.message)); await p.goto(base + '?join=' + code); await p.waitForSelector('#sPhone.on', { timeout: 15000 }); await p.fill('#jName', name); await p.click('#bJoin'); await p.waitForSelector('#pPad:not([hidden])', { timeout: 8000 }); phones.push(p); }
await tv.waitForTimeout(400); ok((await tv.locator('.slot:not(.off)').count()) === 2, '2 Handys auf den Plätzen');
const f0 = await phones[1].textContent('#pFighter'); await phones[1].click('#pNext'); await phones[1].waitForTimeout(300);
ok((await phones[1].textContent('#pFighter')) !== f0, 'Handy wählt Kämpfer (' + f0 + ' → ' + await phones[1].textContent('#pFighter') + ')');
if (out) { await tv.screenshot({ path: out + '/ec-13-lobby-tv.jpg', type: 'jpeg', quality: 80 }); await phones[0].screenshot({ path: out + '/ec-14-handy-pad.jpg', type: 'jpeg', quality: 80 }); }
await tv.click('#lobGo'); await tv.waitForSelector('#sStage.on'); await tv.click('#stGo');
await tv.waitForFunction(() => ECApp.G.W && ECApp.G.W.phase === 'fight', null, { timeout: 30000 });
ok(await tv.evaluate(() => ECApp.G.mode === 'online'), 'Online-Kampf läuft');
await tv.evaluate(() => { const W = ECApp.G.W; W.f[0].x = -.55; W.f[1].x = .55; W.f[0].z = W.f[1].z = 0; });
const hp1 = await tv.evaluate(() => ECApp.G.W.f[1].hp);
await phones[0].locator('.pBtns .tp').dispatchEvent('pointerdown'); await phones[0].waitForTimeout(80); await phones[0].locator('.pBtns .tp').dispatchEvent('pointerup');
await tv.waitForTimeout(600); ok(await tv.evaluate(() => ECApp.G.W.f[1].hp) < hp1, 'Handy 1: Schlag trifft am Fernseher');
const hp0 = await tv.evaluate(() => ECApp.G.W.f[0].hp);
await phones[1].locator('.pBtns .tk').dispatchEvent('pointerdown'); await phones[1].waitForTimeout(80); await phones[1].locator('.pBtns .tk').dispatchEvent('pointerup');
await tv.waitForTimeout(700); ok(await tv.evaluate(() => ECApp.G.W.f[0].hp) < hp0, 'Handy 2: Tritt trifft am Fernseher');
await tv.waitForTimeout(800); ok(/Runde/.test(await phones[0].textContent('#pMsg')), 'Handy zeigt Rundenstand: ' + await phones[0].textContent('#pMsg'));
if (out) await tv.screenshot({ path: out + '/ec-15-online-kampf.jpg', type: 'jpeg', quality: 80 });
console.log(errs.length ? 'Fehler im Browser:\n' + errs.join('\n') : 'keine Browser-Fehler'); if (errs.length) process.exitCode = 1;
await b.close();
