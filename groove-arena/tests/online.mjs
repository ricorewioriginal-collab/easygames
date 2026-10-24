// Groove Arena – Online-Test über ein Test-Relais statt Firebase: Bildschirm (?tv) + Handy im selben Raum (Bewegung) + Freund von woanders
// (eigenes Video). Start: Server im Repo-Ordner, dann node groove-arena/tests/online.mjs [Basis-URL] [Screenshot-Ordner]
import { chromium } from 'playwright';
import { stub } from './stubs.mjs';
const base = (process.argv[2] || 'http://localhost:8766/') + 'groove-arena/', out = process.argv[3] || '';
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
const tvc = await b.newContext({ viewport: { width: 1280, height: 720 }, serviceWorkers: 'block' }); await fakePeer(tvc); await stub(tvc);
const tv = await tvc.newPage(); tv.on('pageerror', e => errs.push('TV: ' + e.message));
await tv.goto(base + '?tv&lowfx'); await tv.waitForSelector('#sLobby.on', { timeout: 20000 }); await tv.waitForFunction(() => /^[A-Z0-9]{4}$/.test(document.getElementById('code').textContent), null, { timeout: 8000 });
const code = await tv.textContent('#code'), link = await tv.textContent('#url');
ok(link.startsWith('https://ricorewioriginal-collab.github.io/easygames/groove-arena/') && link.includes('?join=' + code), 'Einladung über die easygames-Homepage: ' + link); ok(await tv.evaluate(() => !!document.querySelector('#qr svg')), 'QR-Code');
const mk = async (name, where) => { const c = await b.newContext({ viewport: { width: 390, height: 800 }, serviceWorkers: 'block', hasTouch: true, isMobile: true }); await fakePeer(c); await stub(c); const p = await c.newPage(); p.on('pageerror', e => errs.push(name + ': ' + e.message)); await p.goto(base + '?join=' + code + '&lowfx'); await p.waitForSelector('#sPhone.on', { timeout: 20000 }); await p.fill('#jName', name); await p.click(`#jWhere .sg[data-v="${where}"]`); await p.click('#jGo'); await p.waitForSelector('#phPlay:not([hidden])', { timeout: 10000 }); return p; };
const ph = await mk('Mia', 'room'), fr = await mk('Tom', 'remote');
await tv.waitForTimeout(500); ok((await tv.locator('#lobbyList .seat').count()) === 2, '2 Mitspieler in der Lobby');
if (out) await tv.screenshot({ path: out + '/ga-on-lobby.jpg', type: 'jpeg', quality: 80 });
// Bildschirm wählt einen Song und tanzt (ohne eigene Bewertung)
await tv.evaluate(() => { GAApp.SET.input = 'none'; GAApp.SYNC.AAAAAAAAAAA = { bpm: 120, beat0: .5 }; GAApp.openSong({ title: 'Tanz die Nacht', artist: 'Test Band', dur: 198, genre: 'Pop', style: 'pop' }); });
await tv.waitForFunction(() => GAApp.S && GAApp.S.ready, null, { timeout: 10000 }); await tv.click('#pGo'); await tv.waitForSelector('#sDance.on');
await ph.waitForFunction(() => GAApp.G && GAApp.G.ch, null, { timeout: 8000 }); ok(true, 'Handy bekommt Song + Choreo');
ok(await ph.evaluate(() => GAApp.G.ch.list.length === GAApp.G.hits.length || GAApp.G.ch.list.length > 50), 'Handy rechnet dieselbe Choreografie');
const same = await ph.evaluate(() => GAApp.G.ch.list.slice(0, 30).map(x => x.mv.n).join()) === await tv.evaluate(() => GAApp.D.ch.list.slice(0, 30).map(x => x.mv.n).join()); ok(same, 'gleiche Moves auf Handy und Bildschirm');
// Handy-Bewegung einspielen: Arm macht die Vortänzer-Hand nach
await ph.evaluate(() => { const C = GAApp.C, M = GASense.Motion; M.on = true; window.__mot = setInterval(() => { const G = GAApp.G; if (!G || !G.ch) return; const now = performance.now() / 1000, t = G.ht + (G.playing ? (performance.now() - G.hat) / 1000 : 0); const a = C.handAccel(G.ch, t - .02, t + .02, 30); M.buf.push({ t: now, m: a[1] || a[0] || 0 }); M.last = now; }, 25); });
await tv.waitForTimeout(9000);
const sc = await ph.evaluate(() => GAApp.G.score); ok(sc > 100, 'Handy-Bewegung wird bewertet: ' + sc + ' Punkte');
await tv.waitForFunction(() => document.querySelectorAll('#dLive div').length >= 1, null, { timeout: 5000 }).then(() => ok(true, 'Live-Punkte am Bildschirm'), () => ok(false, 'Live-Punkte am Bildschirm'));
if (out) { await tv.screenshot({ path: out + '/ga-on-tv.jpg', type: 'jpeg', quality: 80 }); await ph.screenshot({ path: out + '/ga-on-handy.jpg', type: 'jpeg', quality: 80 }); }
// Freund von woanders: eigenes Video, eigene Choreo, gleiche Zeit
await fr.waitForSelector('#phJoinVid:not([hidden])', { timeout: 10000 }); await fr.click('#phJoinVid'); await fr.waitForSelector('#sDance.on');
const dt = await fr.evaluate(() => GAApp.S.player.time()) - await tv.evaluate(() => GAApp.S.player.time()); ok(Math.abs(dt) < 2.5, 'Video von woanders läuft synchron (Versatz ' + dt.toFixed(2) + ' s)');
ok(await fr.evaluate(() => GAApp.D && GAApp.D.locked && GAApp.D.bpm === 120), 'Takt vom Gastgeber übernommen');
await fr.waitForTimeout(1500); if (out) await fr.screenshot({ path: out + '/ga-on-remote.jpg', type: 'jpeg', quality: 80 });
await b.close();
ok(!errs.length, 'Keine Skriptfehler ' + errs.slice(0, 3).join(' | '));
