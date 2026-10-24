// Stadt Land Plus – Online-Test: Fernseher (?tv) + 2 Handys über ein Test-Relais statt Firebase: schreiben, STOPP, Abstimmung, Moderator am Handy, Punkte.
// Start: Server im Repo-Ordner, dann node stadt-land-plus/tests/online.mjs [Basis-URL] [Screenshot-Ordner]
import { chromium } from 'playwright';
const base = (process.argv[2] || 'http://localhost:8766/') + 'stadt-land-plus/', out = process.argv[3] || '';
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
ok(link.startsWith('https://ricorewioriginal-collab.github.io/easygames/stadt-land-plus/') && link.includes('?join=' + code), 'Einladung über die easygames-Homepage: ' + link);
ok(await tv.evaluate(() => !!document.querySelector('#qr svg')), 'QR-Code');
await tv.evaluate(() => { const S = SLFApp.SET; S.bots = 0; S.me = false; S.check = 'vote'; S.third = 'eigene'; S.custom = 'Promi'; S.extra = []; S.rounds = 3; S.mod = ''; });
await tv.click('#lbSetup'); await tv.waitForSelector('#sSetup.on'); await tv.click('#suGo'); await tv.waitForSelector('#sLobby.on');
ok(await tv.isDisabled('#lbGo'), 'Start erst mit Mitspielern');
const phones = [];
for (const name of ['Mia', 'Tom']) { const c = await b.newContext({ viewport: { width: 390, height: 800 }, serviceWorkers: 'block', hasTouch: true, isMobile: true }); await fakePeer(c); const p = await c.newPage(); p.on('pageerror', e => errs.push(name + ': ' + e.message)); await p.goto(base + '?join=' + code); await p.waitForSelector('#sPhone.on', { timeout: 15000 }); await p.fill('#jName', name); await p.click('#jGo'); await p.waitForSelector('#pPlay:not([hidden])', { timeout: 8000 }); phones.push(p); }
await tv.waitForTimeout(400); ok((await tv.locator('.seat.on').count()) === 2, '2 Handys in der Lobby');
if (out) await tv.screenshot({ path: out + '/slp-30-lobby.jpg', type: 'jpeg', quality: 80 });
await phones[0].click('#pGo'); await tv.waitForFunction(() => SLFApp.GM && SLFApp.GM.phase === 'write', null, { timeout: 20000 }); ok(true, 'Handy startet das Spiel');
const L = await tv.evaluate(() => SLFApp.GM.letter);
await phones[0].waitForSelector('.pans'); ok((await phones[0].locator('.pans').count()) === 3, 'Handy: 3 Spalten (Stadt, Land, Promi)');
const w = await tv.evaluate(L => ['stadt', 'land'].map(c => (SLFApp.SLF.candidates(c, L)[0] || {}).n || ''), L);
for (const [i, p] of phones.entries()) { const f = p.locator('.pans'); await f.nth(0).fill(w[0]); await f.nth(1).fill(w[1]); await f.nth(2).fill(L + (i ? 'ollo' : 'ummi')); }
await tv.waitForTimeout(1200); ok(await tv.evaluate(() => SLFApp.GM.ans.n0.stadt.length > 0 && SLFApp.GM.ans.n1.eigene.length > 0), 'Antworten kommen am Fernseher an');
if (out) { await tv.screenshot({ path: out + '/slp-31-tv.jpg', type: 'jpeg', quality: 80 }); await phones[0].screenshot({ path: out + '/slp-32-handy.jpg', type: 'jpeg', quality: 80 }); }
await phones[1].click('#pStop'); await tv.waitForFunction(() => SLFApp.GM.stopBy === 'n1', null, { timeout: 5000 }); ok(true, 'STOPP vom Handy');
await tv.evaluate(() => { SLFApp.GM.t = .2; });
await tv.waitForFunction(() => SLFApp.GM.phase === 'check' && SLFApp.GM.sub === 'vote', null, { timeout: 10000 }); ok(true, 'Abstimmung beginnt');
await phones[0].waitForSelector('.vitem .vb', { timeout: 5000 }); ok((await phones[0].locator('.vitem').count()) === 1, 'Mia stimmt über Toms Promi ab');
if (out) await phones[0].screenshot({ path: out + '/slp-33-abstimmen.jpg', type: 'jpeg', quality: 80 });
await phones[0].click('.vb[data-v="-1"]'); await phones[1].waitForSelector('.vitem .vb'); await phones[1].click('.vb[data-v="1"]');
await tv.waitForFunction(() => SLFApp.GM.phase === 'score', null, { timeout: 5000 }); ok(true, 'Alle haben abgestimmt → Punkte');
const pr = await tv.evaluate(() => SLFApp.GM.rows.eigene.map(a => [a.text, a.valid, a.pts])); console.log(JSON.stringify(pr));
ok(pr[0][1] === true && pr[1][1] === false, 'Abstimmung entscheidet (Tom 👍 für Mia, Mia 👎 für Tom)');
await phones[0].waitForSelector('.pScore'); ok(true, 'Handy zeigt die Punkte'); if (out) { await tv.screenshot({ path: out + '/slp-34-tv-punkte.jpg', type: 'jpeg', quality: 80 }); await phones[0].screenshot({ path: out + '/slp-35-handy-punkte.jpg', type: 'jpeg', quality: 80 }); }
// Runde 2 mit Moderator am Handy (Tom, spielt nicht mit)
await tv.evaluate(() => { const G = SLFApp.GM; G.mod = 'n1'; G.cfg.check = 'mod'; G.players.find(p => p.id === 'n1').plays = false; });
await phones[0].click('#pGo'); await tv.waitForFunction(() => SLFApp.GM.round === 2 && SLFApp.GM.phase === 'write', null, { timeout: 20000 });
await phones[0].locator('.pans').nth(0).fill('Xantener Quatsch'); await tv.waitForTimeout(800); await tv.evaluate(() => { SLFApp.GM.t = .2; });
await phones[1].waitForSelector('#pModOk', { timeout: 10000 }); ok(true, 'Moderator-Ansicht am Handy');
if (out) await phones[1].screenshot({ path: out + '/slp-36-moderator.jpg', type: 'jpeg', quality: 80 });
await phones[1].click('.vb[data-v="1"] >> nth=0'); await tv.waitForTimeout(300); ok(await tv.evaluate(() => SLFApp.GM.rows.stadt.find(a => a.pid === 'n0').valid === true), 'Moderator gibt frei');
await phones[1].click('#pModOk'); await tv.waitForFunction(() => SLFApp.GM.phase === 'score', null, { timeout: 5000 }); ok(true, 'Moderator beendet die Auswertung');
await tv.evaluate(() => SLFApp.afterScore()); await tv.waitForFunction(() => SLFApp.GM.round === 3 && SLFApp.GM.phase === 'write', null, { timeout: 20000 }); await tv.evaluate(() => { SLFApp.GM.t = .2; });
await tv.waitForFunction(() => SLFApp.GM.phase === 'score' || SLFApp.GM.phase === 'check', null, { timeout: 8000 }); await tv.evaluate(() => { if (SLFApp.GM.phase === 'check') SLFApp.finishReview(); SLFApp.afterScore(); });
await tv.waitForSelector('#sEnd.on', { timeout: 5000 }); ok(true, 'Siegerehrung am Fernseher');
await phones[0].waitForFunction(() => /Siegerehrung/.test(document.getElementById('pBody').textContent), null, { timeout: 5000 }).then(() => ok(true, 'Handy zeigt die Siegerehrung'), () => ok(false, 'Handy zeigt die Siegerehrung'));
await b.close();
ok(!errs.length, 'Keine Skriptfehler ' + errs.slice(0, 3).join(' | '));
