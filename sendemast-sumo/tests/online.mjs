// Sendemast-Sumo – Online-Test: Fernseher (?tv) + 2 Handys als Controller über ein Test-Relais statt Firebase.
// Start: Server im Repo-Ordner, dann node sendemast-sumo/tests/online.mjs [Basis-URL] [Screenshot-Ordner]
import { chromium } from 'playwright';
const base = (process.argv[2] || 'http://localhost:8766/') + 'sendemast-sumo/', out = process.argv[3] || '';
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
await tv.goto(base + '?tv'); await tv.waitForSelector('#sLobby.on', { timeout: 15000 }); await tv.waitForFunction(() => /^[A-Z0-9]{4}$/.test(document.getElementById('code').textContent), null, { timeout: 8000 });
const code = await tv.textContent('#code'), link = await tv.textContent('#url');
ok(link.startsWith('https://ricorewioriginal-collab.github.io/easygames/sendemast-sumo/') && link.includes('?join=' + code), 'Einladung über die easygames-Homepage');
const phones = [];
for (const name of ['Mia', 'Tom']) { const c = await b.newContext({ viewport: { width: 390, height: 800 }, serviceWorkers: 'block', hasTouch: true, isMobile: true }); await fakePeer(c); const p = await c.newPage(); p.on('pageerror', e => errs.push(name + ': ' + e.message)); await p.goto(base + '?join=' + code); await p.waitForSelector('#sPhone.on', { timeout: 15000 }); await p.fill('#jName', name); await p.click('#bJoin'); await p.waitForSelector('#pPad:not([hidden])', { timeout: 8000 }); phones.push(p); }
await tv.waitForTimeout(300); ok((await tv.locator('.lp').count()) === 2, '2 Handys in der Lobby');
await phones[1].click('#pNext'); await tv.waitForTimeout(300); const tf = await tv.evaluate(() => [...document.querySelectorAll('.lp small')].map(x => x.textContent));
ok(tf[0] !== tf[1], 'Handy wählt anderen Kämpfer: ' + tf.join(' / '));
if (out) { await tv.screenshot({ path: out + '/sumo-16-lobby-tv.jpg', type: 'jpeg', quality: 80 }); await phones[0].screenshot({ path: out + '/sumo-17-handy-pad.jpg', type: 'jpeg', quality: 80 }); }
await tv.click('#lobGo'); await tv.waitForSelector('#sOpts.on'); await tv.click('#oCpu .chip[data-v="1"]'); await tv.click('#oGo'); await tv.waitForTimeout(500);
let s = await tv.evaluate(() => SUMO.state()); ok(s.cur === 'sGame' && s.mode === 'online' && s.wins.length === 3, 'Online-Kampf: 2 Handys + 1 Computer');
await tv.evaluate(() => { SUMO.G.W.t = 2.95; }); await tv.waitForFunction(() => SUMO.state().phase === 'fight', null, { timeout: 8000 });
// Handy 1 schubst: Stick nach rechts halten (Zeiger-Ereignisse) und Schubs drücken
const x0 = await tv.evaluate(() => SUMO.G.W.f[0].x);
const box = await phones[0].locator('.padCtl').boundingBox(); const sx = box.x + box.width * .3, sy = box.y + box.height * .55;
await phones[0].mouse.move(sx, sy); await phones[0].mouse.down(); await phones[0].mouse.move(sx + 50, sy, { steps: 4 }); await tv.waitForFunction(() => SUMO.G.W.fightT > .8, null, { timeout: 8000 });
await phones[0].locator('#pDash').dispatchEvent('pointerdown'); await phones[0].waitForTimeout(600); await phones[0].mouse.up();
const x1 = await tv.evaluate(() => SUMO.G.W.f[0].x); ok(x1 > x0 + .3, 'Handy-Stick und Schubs steuern den Kämpfer am TV (' + x0.toFixed(2) + ' → ' + x1.toFixed(2) + ')');
ok(await tv.evaluate(() => SUMO.G.M.players[0].pushes) >= 1, 'Schubs kam an');
await phones[0].waitForTimeout(700); ok(/Runde/.test(await phones[0].textContent('#pMsg')), 'Handy zeigt den Rundenstatus');
if (out) { await tv.screenshot({ path: out + '/sumo-18-online-kampf.jpg', type: 'jpeg', quality: 80 }); await phones[0].screenshot({ path: out + '/sumo-19-handy-kampf.jpg', type: 'jpeg', quality: 80 }); }
ok(errs.length === 0, 'keine JS-Fehler ' + errs.join(' | '));
await b.close();
