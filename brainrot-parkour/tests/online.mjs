// Brainrot Parkour – Online-Test: Gastgeber + Gast über ein Test-Relais statt Firebase: Lobby, Start, sichtbare Mitspieler, Ziel, Ergebnis.
// Start: Server im Repo-Ordner, dann node brainrot-parkour/tests/online.mjs [Basis-URL] [Screenshot-Ordner]
import { chromium } from 'playwright';
const base = (process.argv[2] || 'http://localhost:8766/') + 'brainrot-parkour/', out = process.argv[3] || '';
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
const hc = await b.newContext({ viewport: { width: 1280, height: 720 }, serviceWorkers: 'block' }); await fakePeer(hc);
const host = await hc.newPage(); host.on('pageerror', e => errs.push('HOST: ' + e.message));
await host.goto(base + '?lowfx'); await host.waitForSelector('#sTitle.on', { timeout: 20000 }); await host.keyboard.press('Enter'); await host.waitForSelector('#sMenu.on');
await host.click('[data-go="online"]'); await host.click('#onHost'); await host.waitForSelector('#sLobby.on');
await host.waitForFunction(() => /^[A-Z0-9]{4}$/.test(document.getElementById('code').textContent), null, { timeout: 10000 });
const code = await host.textContent('#code'), link = await host.textContent('#url');
ok(link.startsWith('https://ricorewioriginal-collab.github.io/easygames/brainrot-parkour/') && link.includes('?join=' + code), 'Einladung über die easygames-Homepage: ' + link);
ok(await host.evaluate(() => !!document.querySelector('#qr svg')), 'QR-Code'); ok(await host.isDisabled('#lbGo'), 'Start erst mit Mitspieler');
const gc = await b.newContext({ viewport: { width: 844, height: 390 }, serviceWorkers: 'block', hasTouch: true, isMobile: true }); await fakePeer(gc);
const guest = await gc.newPage(); guest.on('pageerror', e => errs.push('GAST: ' + e.message));
await guest.goto(base + '?lowfx&join=' + code); await guest.waitForSelector('#sLobby.on', { timeout: 20000 }); ok(await guest.inputValue('#jCode') === code, 'Code aus dem Link übernommen');
await guest.fill('#jName', 'Mia'); await guest.click('#jGo'); await guest.waitForFunction(() => /Verbunden/.test(document.getElementById('jMsg').textContent), null, { timeout: 8000 }); ok(true, 'Gast verbunden');
await host.waitForFunction(() => document.querySelectorAll('#lobbyList .seat').length === 2, null, { timeout: 5000 }); ok(true, '2 Spieler in der Lobby');
if (out) await host.screenshot({ path: out + '/br-30-lobby.jpg', type: 'jpeg', quality: 80 });
await host.click('#lbWorld .sg[data-v="2"]'); await host.click('#lbGo');
await guest.waitForFunction(() => BRApp.G && BRApp.G.mode === 'online', null, { timeout: 5000 }); ok(true, 'Rennen startet auch beim Gast');
ok(await host.evaluate(() => BRApp.G.ghosts.size === 1) && await guest.evaluate(() => BRApp.G.ghosts.size === 1), 'Je ein Mitspieler sichtbar');
ok(await host.evaluate(() => JSON.stringify(BRApp.G.W.route.slice(0, 5))) === await guest.evaluate(() => JSON.stringify(BRApp.G.W.route.slice(0, 5))), 'Gleiche Strecke');
await guest.evaluate(() => { BRApp.sim(3.4); const G = BRApp.G; G.me.x += 2; G.me.z += 6; BRApp.sim(.3); }); await host.waitForTimeout(800);
const gpos = await host.evaluate(() => { const g = Array.from(BRApp.G.ghosts.values())[0]; return [g.tx, g.tz]; }); ok(gpos[1] > 3, 'Position des Gasts kommt beim Gastgeber an (z=' + gpos[1].toFixed(1) + ')');
if (out) { await host.evaluate(() => BRApp.sim(3.4)); await host.waitForTimeout(500); await host.screenshot({ path: out + '/br-31-online.jpg', type: 'jpeg', quality: 80 }); }
// beide ins Ziel
for (const pg of [guest, host]) await pg.evaluate(() => { const G = BRApp.G, gl = G.W.objs.find(o => o.kind === 'goal'); G.count = 0; G.me.x = gl.x; G.me.z = gl.z; G.me.y = gl.y; BRApp.sim(.3); });
await host.waitForFunction(() => document.querySelector('#sResult.on'), null, { timeout: 15000 }).then(() => ok(true, 'Ergebnis beim Gastgeber'), () => ok(false, 'Ergebnis beim Gastgeber'));
ok((await host.locator('.podium .pd').count()) === 2, 'Siegertreppchen mit 2 Spielern');
if (out) await host.screenshot({ path: out + '/br-32-result.jpg', type: 'jpeg', quality: 80 });
await b.close();
ok(!errs.length, 'Keine Skriptfehler ' + errs.slice(0, 3).join(' | '));
