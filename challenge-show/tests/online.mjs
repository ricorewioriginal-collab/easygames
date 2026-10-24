// Die große Challenge-Show – Online-Test über ein Test-Relais statt Firebase: Fernseher (?tv) + 2 Handys als Controller (Eingaben, Spiegel, Emojis),
// danach Gastgeber spielt mit + Gast sieht die Show in 3D. Start: Server im Repo-Ordner, dann node challenge-show/tests/online.mjs [Basis-URL] [Screenshot-Ordner]
import { chromium } from 'playwright';
const base = (process.argv[2] || 'http://localhost:8766/') + 'challenge-show/', out = process.argv[3] || '';
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
await tv.goto(base + '?tv&lowfx'); await tv.waitForSelector('#sLobby.on', { timeout: 20000 }); await tv.waitForFunction(() => /^[A-Z0-9]{4}$/.test(document.getElementById('code').textContent), null, { timeout: 8000 });
const code = await tv.textContent('#code'), link = await tv.textContent('#url');
ok(link.startsWith('https://ricorewioriginal-collab.github.io/easygames/challenge-show/') && link.includes('?join=' + code), 'Einladung über die easygames-Homepage: ' + link);
ok(await tv.evaluate(() => !!document.querySelector('#qr svg')), 'QR-Code'); ok(await tv.isDisabled('#lbGo'), 'Start erst mit Mitspielern');
const phones = [];
for (const name of ['Mia', 'Tom']) { const c = await b.newContext({ viewport: { width: 390, height: 800 }, serviceWorkers: 'block', hasTouch: true, isMobile: true }); await fakePeer(c); const p = await c.newPage(); p.on('pageerror', e => errs.push(name + ': ' + e.message)); await p.goto(base + '?join=' + code + '&lowfx'); await p.waitForSelector('#lbJoin:not([hidden])', { timeout: 20000 }); await p.fill('#jName', name); await p.click('#jGo'); await p.waitForFunction(() => /Verbunden/.test(document.getElementById('jMsg').textContent), null, { timeout: 8000 }); phones.push(p); }
await tv.waitForTimeout(400); ok((await tv.locator('#lobbyList .seat').count()) === 2, '2 Handys in der Lobby (Fernseher spielt nicht mit)');
if (out) await tv.screenshot({ path: out + '/cs-on-lobby.jpg', type: 'jpeg', quality: 80 });
await tv.click('#lbN .sg[data-v="12"]'); await tv.click('#lbGo'); await tv.waitForSelector('#sGame.on');
ok(await tv.evaluate(() => CSApp.G.meId === null && CSApp.G.S.cons.filter(c => c.human).length === 2 && CSApp.G.S.cons.length === 12), 'Show: 2 Handys + 10 Computer, Fernseher ohne eigenen Kandidaten');
await phones[0].waitForSelector('#sGame.on', { timeout: 8000 }); ok(await phones[0].evaluate(() => document.body.classList.contains('padOnly') && CSApp.G.meId === 0), 'Handy = Controller (Fernseher-Modus)');
await tv.evaluate(() => { CSApp.G.pt = 0; CSApp.sim(3.3); const R = CSApp.G.S.R; R.light = 'green'; R.lt = 5; });
await phones[0].waitForFunction(() => CSApp.G.phase === 'play', null, { timeout: 8000 }); ok(true, 'Handy folgt in die Runde');
const z0 = await tv.evaluate(() => CSApp.G.S.cons[0].z); await phones[0].keyboard.down('KeyW'); for (let i = 0; i < 6; i++) { await phones[0].evaluate(() => CSApp.sim(.1)); await tv.waitForTimeout(150); await tv.evaluate(() => CSApp.sim(.25)); } await phones[0].keyboard.up('KeyW'); await phones[0].evaluate(() => CSApp.sim(.1));
const z1 = await tv.evaluate(() => CSApp.G.S.cons[0].z); ok(z1 > z0 + 2, `Handy-Eingabe bewegt den Kandidaten am Fernseher (${z0.toFixed(1)} → ${z1.toFixed(1)})`);
await tv.evaluate(() => CSApp.sim(.2)); await phones[0].waitForFunction(() => Math.abs(CSApp.G.S.cons[0].tz || 0) > 1, null, { timeout: 5000 }).then(() => ok(true, 'Spiegel am Handy aktualisiert'), () => ok(false, 'Spiegel am Handy aktualisiert'));
if (out) { await tv.screenshot({ path: out + '/cs-on-tv.jpg', type: 'jpeg', quality: 80 }); await phones[0].screenshot({ path: out + '/cs-on-handy.jpg', type: 'jpeg', quality: 80 }); }
// Tom scheidet aus → Jubel-Emoji kommt am Fernseher an
await tv.evaluate(() => { const c = CSApp.G.S.cons[1]; c.alive = false; c.out = true; c.outRound = CSApp.G.S.k; c.outT = CSApp.G.S.t; CSApp.G.S.ev.push({ t: 'out', id: 1 }); });
await phones[1].waitForSelector('#spect:not([hidden])', { timeout: 5000 }); await phones[1].click('#spEmo button >> nth=1');
await tv.waitForFunction(() => document.querySelectorAll('#hEmo span').length > 0, null, { timeout: 4000 }).then(() => ok(true, 'Emoji vom ausgeschiedenen Handy am Fernseher'), () => ok(false, 'Emoji vom ausgeschiedenen Handy am Fernseher'));
// Show bis zum Ende vorspulen (Computer übernehmen Mia), Siegerehrung auf allen Geräten
await tv.evaluate(() => { CSApp.G.S.cons[0].auto = true; CSApp.G.S.cons[0].kFail = false; for (let i = 0; i < 30 * 600 && CSApp.G && !CSApp.G.S.done; i++) { if (CSApp.G.phase === 'card' || CSApp.G.phase === 'count') CSApp.G.pt = Math.min(CSApp.G.pt, .01); CSApp.sim(1 / 30); } CSApp.sim(8); });
await tv.waitForSelector('#sResult.on', { timeout: 15000 }); ok(true, 'Fernseher: Ergebnis');
await phones[0].waitForSelector('#sResult.on', { timeout: 8000 }).then(() => ok(true, 'Handy: Ergebnis'), () => ok(false, 'Handy: Ergebnis'));
if (out) await phones[0].screenshot({ path: out + '/cs-on-handy-ende.jpg', type: 'jpeg', quality: 80 });
await tv.click('#rsLobby'); await phones[0].waitForSelector('#sLobby.on', { timeout: 5000 }); ok(true, 'Zurück zur Lobby auf allen Geräten');
// Gastgeber spielt mit, Gast sieht die Show selbst in 3D
await tv.click('#lbPlay .sg[data-v="1"]'); await tv.click('#lbGo'); await phones[0].waitForSelector('#sGame.on', { timeout: 8000 });
ok(await phones[0].evaluate(() => !document.body.classList.contains('padOnly') && CSApp.G.meId === 1), 'Gast sieht die Show (kein Fernseher-Modus)');
await tv.evaluate(() => { CSApp.G.pt = 0; CSApp.sim(3.3); CSApp.sim(2); }); await phones[0].waitForTimeout(1500);
if (out) await phones[0].screenshot({ path: out + '/cs-on-gast-3d.jpg', type: 'jpeg', quality: 80 });
await b.close();
ok(!errs.length, 'Keine Skriptfehler ' + errs.slice(0, 3).join(' | '));
