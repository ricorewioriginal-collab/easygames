// Tortenschlacht – Browser-Test (Playwright): Solo mit Maus, Tastatur und Controller, Konditor, Ende/Rekord, Mehrspieler-Lobby,
// Online: Fernseher + Handy in zwei Browser-Kontexten (Verbindung über ein Test-Relay statt Firebase).
// Start: Server im Repo-Ordner (python3 -m http.server 8765), dann node tortenschlacht/tests/e2e.mjs
import { chromium } from 'playwright';
const URL = process.env.URL || 'http://localhost:8765/tortenschlacht/';
const ok = (c, m) => { if (!c) { console.error('FAIL', m); process.exitCode = 1; } else console.log('PASS', m); };
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1000, height: 600 }, serviceWorkers: 'block' });
await ctx.addInitScript(() => { window.__pad = { b: [], ax: [0, 0] }; navigator.getGamepads = () => [{ index: 0, connected: true, axes: window.__pad.ax, buttons: Array.from({ length: 17 }, (_, i) => ({ pressed: !!window.__pad.b[i], value: window.__pad.b[i] ? 1 : 0 })) }]; });
const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
const st = () => pg.evaluate(() => TORTEN.state());
// stehende Figur mitten ins Bild stellen, Bildschirmkoordinaten von Kopf/Bauch zurück
const target = (type, layer) => pg.evaluate(([type, layer]) => { const g = TORTEN.game(); g.spawnT = 99; g.people.length = 0; const p = TS.spawn(g, type, g.camX + g.A / 2); p.layer = layer; p.z = layer; p.gy = TS.LAYERS[layer].g; p.sc = TS.LAYERS[layer].s * TS.HMAN; p.x = g.camX + g.A / 2; p.v = 0; p.state = 'stand'; p.target = null; p.life = 99; const b = TS.body(p); return { body: TORTEN.toScreen(p.x, (b.by0 + b.by1) / 2), head: TORTEN.toScreen(p.x, b.hy), id: p.id }; }, [type, layer]);
await pg.goto(URL); await pg.waitForTimeout(800);
ok(await pg.isVisible('#sMenu'), 'Menü');
await pg.click('#bSolo'); await pg.waitForTimeout(500);
let s = await st(); ok(s.state === 'play' && s.mode === 'solo' && s.t > 85, 'Solo läuft');
// Maus: Kopftreffer
let t = await target('mod', 2); await pg.mouse.move(t.head.x, t.head.y); await pg.mouse.down(); await pg.mouse.up(); await pg.waitForTimeout(450);
s = await st(); ok(s.players[0].score === 20 && s.players[0].hits === 1, 'Maus: Kopftreffer zählt doppelt (' + s.players[0].score + ')');
// Tastatur: Waffe wechseln und Spritze halten
t = await target('prak', 2); await pg.mouse.move(t.body.x, t.body.y); await pg.keyboard.press('q'); s = await st(); ok(s.players[0].weapon === 'spritze', 'Q wechselt zur Spritze');
await pg.keyboard.down(' '); await pg.waitForTimeout(400); await pg.keyboard.up(' '); await pg.waitForTimeout(300);
s = await st(); ok(s.players[0].hits >= 2 && s.players[0].ammo.spritze < 30, 'Spritze gedrückt halten trifft');
// Controller: Stick bewegt, A wirft, X lädt nach
await pg.keyboard.press('q'); const x0 = (await st()).players[0].x;
await pg.evaluate(() => { __pad.ax = [1, 0]; }); await pg.waitForTimeout(300); await pg.evaluate(() => { __pad.ax = [0, 0]; });
ok((await st()).players[0].x > x0 + .05, 'Stick bewegt das Fadenkreuz');
const am = (await st()).players[0].ammo.torte; await pg.evaluate(() => { __pad.b[0] = true; }); await pg.waitForTimeout(80); await pg.evaluate(() => { __pad.b[0] = false; }); await pg.waitForTimeout(100);
ok((await st()).players[0].ammo.torte === am - 1, 'A wirft');
await pg.evaluate(() => { __pad.b[2] = true; }); await pg.waitForTimeout(80); await pg.evaluate(() => { __pad.b[2] = false; }); await pg.waitForTimeout(1100);
ok((await st()).players[0].ammo.torte === 8, 'X lädt nach');
// Scrollen am Rand
await pg.mouse.move(995, 300); await pg.waitForTimeout(900); ok((await st()).camX > .2, 'Landschaft scrollt am Rand');
// Konditor wirft zurück
await pg.evaluate(() => { const g = TORTEN.game(); g.people.length = 0; const k = TS.spawn(g, 'kond', g.camX + .5); k.t = 1.2; g.spawnT = 99; });
await pg.waitForTimeout(3300); ok((await st()).players[0].stun > 0, 'Konditor-Torte: Sahne im Gesicht');
await pg.screenshot({ path: process.env.SHOT || '/tmp/ts-blind.jpg', type: 'jpeg', quality: 60 });
// Pause
await pg.keyboard.press('Escape'); ok(await pg.isVisible('#ovPause'), 'Pause'); await pg.click('#pGo');
// Ende und Rekord
await pg.evaluate(() => { TORTEN.game().t = .3; }); await pg.waitForSelector('#ovEnd:not([hidden])', { timeout: 3000 });
ok(/Zeit um/.test(await pg.textContent('#endTitle')), 'Ende'); ok(+(await pg.evaluate(() => localStorage.getItem('tortenschlacht-highscore'))) > 0, 'Rekord gespeichert');
await pg.click('#endMenu'); ok(/Rekord/.test(await pg.textContent('#menuStat')), 'Statistik im Menü');
// Mehrspieler an einem Bildschirm: Maus + Controller
await pg.click('#bLocal'); await pg.click('#lobMouse'); ok(await pg.isDisabled('#lobStart'), 'mit 1 Spieler noch nicht startbar');
await pg.evaluate(() => { __pad.b[0] = true; }); await pg.waitForTimeout(150); await pg.evaluate(() => { __pad.b[0] = false; }); await pg.waitForTimeout(100);
ok(!(await pg.isDisabled('#lobStart')), 'Controller tritt mit A bei'); await pg.click('#lobStart'); await pg.waitForTimeout(400);
s = await st(); ok(s.mode === 'local' && s.players.length === 2 && s.players[1].dev === 'pad:0', 'Mehrspieler läuft mit 2 Fadenkreuzen');
await pg.keyboard.press('Escape'); await pg.click('#pQuit');
ok(errs.length === 0, 'keine Fehler (Solo/Mehrspieler) ' + errs.join(' | '));

// Online: Fernseher + Handy, Relay statt Firebase
const relay = new Map(); let nid = 1;
async function fakePeer(c) {
  await c.exposeBinding('__fp', (src, kind, a, b2) => { const page = src.page; if (kind === 'reg') relay.set(a, page); else if (kind === 'send') { const to = relay.get(a); if (to) to.evaluate(([from, d, to2]) => window.__fpIn(from, d, to2), [b2.from, b2.d, a]).catch(() => { }); } });
  // echtes fire-peer.js (für EasyGamesLink), danach das Test-Relais statt Firebase
  await c.route(/cloud\/fire-peer\.js/, async r => { const res = await r.fetch(); r.fulfill({ response: res, body: (await res.text()) + '\n;Object.defineProperty(window, "Peer", { value: window.__FakePeer, writable: true, configurable: true });', contentType: 'text/javascript' }); });
  await c.route(/vendor\/peerjs/, r => r.fulfill({ body: '', contentType: 'text/javascript' }));
  await c.addInitScript(() => {
    const listeners = {}; window.__conns = {};
    class Conn { constructor(me, other) { this.me = me; this.peer = other; this.open = false; this.h = {}; } on(e, f) { (this.h[e] = this.h[e] || []).push(f); } emit(e, x) { (this.h[e] || []).forEach(f => f(x)); } send(d) { window.__fp('send', this.peer, { from: this.me, d: JSON.parse(JSON.stringify(d)) }); } close() { } }
    window.__fpIn = (from, d, me) => { const key = me + '|' + from; let c = window.__conns[key]; if (d && d.__open) { if (!c) { c = new Conn(me, from); window.__conns[key] = c; const P = window.__peers[me]; P.emit('connection', c); } c.open = true; c.emit('open'); if (d.__ack) return; c.send({ __open: 1, __ack: 1 }); return; } if (c) c.emit('data', d); };
    window.__peers = {};
    window.__FakePeer = window.Peer = class { constructor(id) { this.id = id || 'g' + Math.random().toString(36).slice(2, 8); this.h = {}; window.__peers[this.id] = this; window.__fp('reg', this.id); setTimeout(() => this.emit('open', this.id), 30); } on(e, f) { (this.h[e] = this.h[e] || []).push(f); } emit(e, x) { (this.h[e] || []).forEach(f => f(x)); }
      connect(id) { const c = new Conn(this.id, id); window.__conns[this.id + '|' + id] = c; setTimeout(() => c.send({ __open: 1 }), 30); return c; } destroy() { } reconnect() { } };
  });
}
const tvCtx = await b.newContext({ viewport: { width: 1000, height: 600 }, serviceWorkers: 'block' }); await fakePeer(tvCtx);
const tv = await tvCtx.newPage(); tv.on('pageerror', e => errs.push('TV: ' + e.message));
await tv.goto(URL + '?tv'); await tv.waitForTimeout(800);
const code = (await tv.evaluate(() => TORTEN.state())).code; ok(code && code.length === 4, 'TV-Link öffnet Online-Lobby mit Code ' + code);
const link = await tv.textContent('#url'); ok(link.startsWith('https://ricorewioriginal-collab.github.io/easygames/tortenschlacht/') && link.includes('?join=' + code), 'Einladungslink über die easygames-Homepage');
const phCtx = await b.newContext({ viewport: { width: 390, height: 780 }, serviceWorkers: 'block', hasTouch: true }); await fakePeer(phCtx);
const ph = await phCtx.newPage(); ph.on('pageerror', e => errs.push('Handy: ' + e.message));
await ph.goto(URL + '?join=' + code); await ph.fill('#jName', 'Mia'); await ph.click('#bJoin'); await ph.waitForSelector('#ctrl:not([hidden])', { timeout: 5000 });
ok(true, 'Handy beigetreten'); await tv.waitForTimeout(200);
ok((await tv.evaluate(() => TORTEN.state())).slots === 1 && /Mia/.test(await tv.textContent('#lobSlots')), 'Mia steht in der Lobby');
await tv.click('#lobStart'); await tv.waitForTimeout(400);
const tt = await tv.evaluate(() => { const g = TORTEN.game(); g.spawnT = 99; g.people.length = 0; const p = TS.spawn(g, 'mod', g.WW / 2); p.layer = 2; p.z = 2; p.gy = TS.LAYERS[2].g; p.sc = TS.LAYERS[2].s * TS.HMAN; p.x = g.WW / 2; p.v = 0; p.state = 'stand'; p.target = null; p.life = 99; const bb = TS.body(p); return { x: p.x / g.WW, y: (bb.by0 + bb.by1) / 2 }; });
const pr = await ph.locator('#pad').boundingBox();
await ph.touchscreen.tap(pr.x + pr.width * tt.x, pr.y + pr.height * tt.y); await ph.waitForTimeout(200);
const fb = await ph.locator('#cFire').boundingBox(); await ph.touchscreen.tap(fb.x + fb.width / 2, fb.y + fb.height / 2); await tv.waitForTimeout(700);
const tvs = await tv.evaluate(() => TORTEN.state()); ok(tvs.players[0].name === 'Mia' && tvs.players[0].hits === 1, 'Handy zielt und wirft auf dem Fernseher');
ok(/1\d|10/.test(await ph.textContent('#cScore')), 'Punkte erscheinen auf dem Handy');
await tv.screenshot({ path: process.env.SHOT2 || '/tmp/ts-tv.jpg', type: 'jpeg', quality: 60 });
ok(errs.length === 0, 'keine Fehler ' + errs.join(' | '));
await b.close();
