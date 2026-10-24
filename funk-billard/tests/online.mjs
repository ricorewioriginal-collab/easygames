// Funk-Billard 3D – Online-Test: zwei Geräte über ein Test-Relais statt Firebase (gleiche Schnittstelle wie PeerJS).
// Start: Server im Repo-Ordner, dann node funk-billard/tests/online.mjs [Basis-URL] [Screenshot-Ordner]
import { chromium } from 'playwright';
const base = (process.argv[2] || 'http://localhost:8766/') + 'funk-billard/', out = process.argv[3] || '';
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
const vp = { width: 640, height: 400 };
const hc = await b.newContext({ viewport: vp, serviceWorkers: 'block' }); await fakePeer(hc);
const host = await hc.newPage(); host.on('pageerror', e => errs.push('Host: ' + e.message));
await host.goto(base); await host.waitForSelector('#sTitle.on', { timeout: 20000 }); await host.keyboard.press('Enter'); await host.waitForTimeout(300);
await host.click('[data-go="online"]'); await host.fill('#oName', 'Mia'); await host.click('#oHost');
await host.waitForFunction(() => /^[A-Z0-9]{4}$/.test(document.getElementById('code').textContent), null, { timeout: 8000 });
const code = await host.textContent('#code'), link = await host.textContent('#url');
ok(link.startsWith('https://ricorewioriginal-collab.github.io/easygames/funk-billard/') && link.includes('?join=' + code), 'Einladung über die easygames-Homepage: ' + link);
ok(await host.evaluate(() => document.querySelector('#qr svg') !== null), 'QR-Code wird angezeigt');
if (out) await host.screenshot({ path: out + '/fb-30-online-raum.jpg', type: 'jpeg', quality: 80 });
const gc = await b.newContext({ viewport: vp, serviceWorkers: 'block' }); await fakePeer(gc);
const guest = await gc.newPage(); guest.on('pageerror', e => errs.push('Gast: ' + e.message));
await guest.addInitScript(() => { try { localStorage.setItem('funk-billard-settings', JSON.stringify({ name: 'Tom' })); } catch (e) { } });
await guest.goto(base + '?join=' + code);
await guest.waitForFunction(() => FBApp.cur === 'sGame' && FBApp.A.mode === 'online', null, { timeout: 15000 });
await host.waitForFunction(() => FBApp.cur === 'sGame' && FBApp.A.mode === 'online', null, { timeout: 8000 });
const S = p => p.evaluate(() => { const A = FBApp.A, g = A.G; return { me: A.me, turn: g.turn, phase: g.phase, shots: g.shots.slice(), names: A.names.slice(), balls: g.balls.map(b => [b.n, +b.x.toFixed(5), +b.z.toFixed(5), b.in]), local: document.getElementById('msg').textContent, over: g.over }; });
let h = await S(host), g = await S(guest);
ok(h.me === 0 && g.me === 1 && h.names.join() === 'Mia,Tom' && g.names.join() === 'Mia,Tom', 'Beide im Spiel, Namen: ' + g.names.join(' vs '));
ok(JSON.stringify(h.balls) === JSON.stringify(g.balls), 'Gleiche Aufstellung auf beiden Geräten');
// Gast darf nicht stoßen, wenn der Gastgeber dran ist
await guest.evaluate(() => FBApp.strike(1)); await guest.waitForTimeout(300); ok((await S(guest)).shots[0] === 0 && (await S(guest)).phase === 'aim', 'Gast kann nicht für den Gastgeber stoßen');
// Zielen wird übertragen
await host.evaluate(() => { FBApp.A.ang = .05; }); await guest.waitForFunction(() => Math.abs(FBApp.A.ang - .05) < 1e-6, null, { timeout: 3000 }).then(() => ok(true, 'Zielrichtung wird live übertragen'), () => ok(false, 'Zielrichtung wird live übertragen'));
// Anstoß
await host.evaluate(() => FBApp.strike(1));
await guest.waitForFunction(() => FBApp.A.G.shots[0] === 1, null, { timeout: 5000 }).then(() => ok(true, 'Stoß kommt beim Gast an'), () => ok(false, 'Stoß kommt beim Gast an'));
const restBoth = async () => { for (const p of [host, guest]) await p.waitForFunction(() => FBApp.A.G.phase !== 'roll' && !FBApp.A.strike && !FBApp.A.pending, null, { timeout: 60000 }); await host.waitForTimeout(400); };
await restBoth(); h = await S(host); g = await S(guest);
ok(JSON.stringify(h.balls) === JSON.stringify(g.balls) && h.turn === g.turn, 'Nach dem Anstoß: gleicher Stand, am Zug: ' + h.names[h.turn]);
if (out) { await host.screenshot({ path: out + '/fb-31-online-host.jpg', type: 'jpeg', quality: 80 }); await guest.screenshot({ path: out + '/fb-32-online-gast.jpg', type: 'jpeg', quality: 80 }); }
// Noch drei Stöße – jeweils vom Gerät, das dran ist
for (let k = 0; k < 3; k++) {
  const t = (await S(host)).turn, p = t === 0 ? host : guest;
  if ((await S(host)).over) break;
  await p.evaluate(() => { const A = FBApp.A, g = A.G, cs = FB.candidates(g, g.turn); if (g.inHand) FB.place(g, -.5, .1); const c = cs[0]; if (c) A.ang = Math.atan2(c.dz, c.dx); });
  await p.waitForTimeout(250);
  await p.evaluate(() => FBApp.strike(.6)); await p.waitForTimeout(300); await restBoth();
  h = await S(host); g = await S(guest);
  ok(JSON.stringify(h.balls) === JSON.stringify(g.balls) && h.turn === g.turn && h.shots.join() === g.shots.join(), 'Stoß ' + (k + 2) + ' von ' + h.names[t] + ': beide gleich (' + h.local + ')');
}
// Spielende erzwingen und Revanche
await host.evaluate(() => { const A = FBApp.A, g = A.G; g.over = true; g.winner = 0; g.phase = 'over'; g.msg = 'Test'; FBApp.endGame(); });
await host.waitForTimeout(200); ok(!(await host.isHidden('#ovEnd')), 'Ende-Bildschirm');
await host.click('#eAgain');
await guest.waitForFunction(() => FBApp.A.G.shots[0] + FBApp.A.G.shots[1] === 0 && FBApp.A.G.turn === 1, null, { timeout: 5000 }).then(() => ok(true, 'Revanche: neues Spiel, Gast hat den Anstoß'), () => ok(false, 'Revanche: neues Spiel, Gast hat den Anstoß'));
await b.close();
ok(!errs.length, 'Keine Skriptfehler ' + errs.slice(0, 3).join(' | '));
