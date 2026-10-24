// Werwolf-Nacht – Online-Test: Fernseher (?tv) + 2 Handys über ein Test-Relais statt Firebase, Computer füllen auf.
// Start: Server im Repo-Ordner, dann node werwolf-nacht/tests/online.mjs [Basis-URL] [Screenshot-Ordner]
import { chromium } from 'playwright';
const base = (process.argv[2] || 'http://localhost:8766/') + 'werwolf-nacht/', out = process.argv[3] || '';
const b = await chromium.launch();
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
ok(link.startsWith('https://ricorewioriginal-collab.github.io/easygames/werwolf-nacht/') && link.includes('?join=' + code), 'Einladung über die easygames-Homepage: ' + link);
ok(await tv.evaluate(() => !!document.querySelector('#qr svg')), 'QR-Code');
const phones = [];
for (const name of ['Mia', 'Tom']) { const c = await b.newContext({ viewport: { width: 390, height: 800 }, serviceWorkers: 'block', hasTouch: true, isMobile: true }); await fakePeer(c); const p = await c.newPage(); p.on('pageerror', e => errs.push(name + ': ' + e.message)); await p.goto(base + '?join=' + code); await p.waitForSelector('#sPhone.on', { timeout: 15000 }); await p.fill('#jName', name); await p.click('#jGo'); await p.waitForSelector('#pPlay:not([hidden])', { timeout: 8000 }); phones.push(p); }
await tv.waitForTimeout(300); ok((await tv.locator('.lp').count()) === 2, '2 Handys in der Lobby');
ok(await tv.isDisabled('#lbGo'), 'Start erst ab 5');
for (let i = 0; i < 4; i++) await tv.click('#lbBot');
ok(!(await tv.isDisabled('#lbGo')), 'Mit Computern aufgefüllt: Start möglich'); if (out) await tv.screenshot({ path: out + '/ww-30-lobby.jpg', type: 'jpeg', quality: 80 });
await tv.evaluate(() => { WWApp.A.speed = .05; }); await tv.click('#lbGo');
for (const p of phones) await p.waitForFunction(() => document.getElementById('pRole').textContent.length > 3, null, { timeout: 8000 });
const roles = await Promise.all(phones.map(p => p.evaluate(() => document.getElementById('pRole').textContent)));
ok(roles.every(r => r.length > 3), 'Jedes Handy bekommt eine geheime Rolle: ' + roles.map(r => r.slice(0, 14)).join(' / '));
await phones[0].dispatchEvent('#pCard', 'pointerdown'); ok(await phones[0].evaluate(() => document.getElementById('pCard').classList.contains('show')), 'Karte gedrückt halten zeigt die Rolle');
if (out) await phones[0].screenshot({ path: out + '/ww-31-handy-rolle.jpg', type: 'jpeg', quality: 80 });
await phones[0].dispatchEvent('#pCard', 'pointerup');
// Spiel laufen lassen: Handys tippen immer die erste Möglichkeit, der Fernseher startet die Abstimmung
let asked = 0, shotDone = false;
for (let i = 0; i < 900; i++) {
  const over = await tv.evaluate(() => !document.getElementById('ovEnd').hidden); if (over) break;
  for (const p of phones) { const has = await p.evaluate(() => { const b = document.querySelector('#pAsk [data-v]'); if (!b) return false; b.click(); return true; }); if (has) asked++; if (has && !shotDone && out) { shotDone = true; } }
  await tv.evaluate(() => { const A = WWApp.A; if (A.pend) WWApp.answer(A.pend.spec.opts && A.pend.spec.opts[0] ? A.pend.spec.opts[0].v : (A.pend.targets || [])[0]); });
  if (i === 25 && out) await tv.screenshot({ path: out + '/ww-32-tv.jpg', type: 'jpeg', quality: 80 });
  await tv.waitForTimeout(60);
}
const res = await tv.evaluate(() => WWApp.A.G && WWApp.A.G.over);
ok(!!res && asked > 2, 'Online-Spiel endet (' + res + ') – Handys haben ' + asked + '× geantwortet');
await tv.waitForTimeout(300); if (out) await tv.screenshot({ path: out + '/ww-33-tv-ende.jpg', type: 'jpeg', quality: 80 });
await phones[0].waitForFunction(() => /gewinn/.test(document.getElementById('pInfo').textContent), null, { timeout: 5000 }).then(() => ok(true, 'Handys zeigen das Ergebnis'), () => ok(false, 'Handys zeigen das Ergebnis'));
if (out) await phones[1].screenshot({ path: out + '/ww-34-handy-ende.jpg', type: 'jpeg', quality: 80 });
await b.close();
ok(!errs.length, 'Keine Skriptfehler ' + errs.slice(0, 3).join(' | '));
