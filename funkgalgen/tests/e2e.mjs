// Funkgalgen – Browser-Test (Playwright): Solo-Serie (Tastatur, Bildschirmtastatur, Joker, Lösen, Verlieren), Gamecontroller,
// Tageswort, Duell und Online (Fernseher + 2 Handys über ein Test-Relais statt Firebase).
// Start: Server im Repo-Ordner (python3 -m http.server 8765), dann node funkgalgen/tests/e2e.mjs
import { chromium } from 'playwright';
const URL = process.env.URL || 'http://localhost:8765/funkgalgen/', SHOTS = process.env.SHOTS || '';
const ok = (c, m) => { if (!c) { console.error('FAIL', m); process.exitCode = 1; } else console.log('PASS', m); };
const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
const errs = [];
const shot = async (p, n) => { if (SHOTS) await p.screenshot({ path: SHOTS + '/' + n + '.jpg', type: 'jpeg', quality: 72 }); };
const ctx = await b.newContext({ viewport: { width: 1200, height: 700 }, serviceWorkers: 'block' });
await ctx.addInitScript(() => { window.__pad = { b: [], on: false }; navigator.getGamepads = () => !window.__pad.on ? [] : [{ index: 0, id: 'Test', connected: true, mapping: 'standard', axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, (_, i) => ({ pressed: !!window.__pad.b[i], value: window.__pad.b[i] ? 1 : 0 })) }]; });
const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(e.message));
const st = () => pg.evaluate(() => FUNKGALGEN.state());
const press = async c => { await pg.keyboard.press(/[ÄÖÜ]/.test(c) ? c : c.toLowerCase()); await pg.waitForTimeout(60); };
await pg.goto(URL); await pg.waitForTimeout(600);
ok(await pg.isVisible('#sMenu'), 'Menü');
// Solo: Kategorie Tiere, leicht
await pg.click('#bSolo'); await pg.click('#cats .chip[data-c="tiere"]'); await pg.click('#diffs .chip[data-d="leicht"]'); await pg.click('#setupGo'); await pg.waitForTimeout(500);
let s = await st(); ok(s.mode === 'solo' && s.word && s.lives === 8, 'Solo startet mit 8 Kisten (' + s.word + ')');
ok(/Tiere/.test(await pg.textContent('#cat')), 'Kategorie wird angezeigt');
const w1 = s.word, miss = 'QXYJ'.split('').find(c => !w1.includes(c));
await press(miss); s = await st(); ok(s.lives === 7 && await pg.locator('#kbd .key.miss').count() === 1, 'Falscher Buchstabe kostet eine Kiste');
await pg.click('#kbd .key[data-k="' + w1[0] + '"]'); ok(await pg.locator('#tiles i.open').count() >= 1, 'Bildschirmtastatur deckt auf');
await pg.click('#kbd .key[data-x="joker"]'); await pg.waitForTimeout(100);
for (const c of new Set(w1)) await press(c);
await pg.waitForSelector('#ovRound:not([hidden])', { timeout: 4000 }); ok(/Gerettet/.test(await pg.textContent('#rTitle')), 'Wort geschafft');
await shot(pg, 'pc_geschafft');
s = await st(); ok(s.score > 0 && s.streak === 1, 'Punkte und Serie');
await pg.click('#rNext'); await pg.waitForTimeout(400);
// Lösen mit Enter (falsch: 2 Kisten), dann verlieren
s = await st(); await pg.keyboard.press('Enter'); await pg.fill('#sIn', 'Xylofonbaum'); await pg.keyboard.press('Enter'); await pg.waitForTimeout(200);
ok((await st()).lives === 6, 'Falsch gelöst kostet 2 Kisten');
const w2 = s.word; for (const c of 'QXYJVWÖÄÜPCBFGHKMZ') { if ((await st()).done) break; if (!w2.includes(c)) await press(c); }
await pg.waitForSelector('#ovRound:not([hidden])', { timeout: 5000 }); ok(/Torte/.test(await pg.textContent('#rTitle')), 'Verloren: ab in die Torte');
await shot(pg, 'pc_torte');
ok(+(await pg.evaluate(() => localStorage.getItem('funkgalgen-highscore'))) > 0, 'Rekord gespeichert');
await pg.click('#rShare'); ok(await pg.isVisible('#sMenu'), 'zurück ins Menü');
// Gamecontroller: Steuerkreuz + A über ../gamepad.js
await pg.click('#bSolo'); await pg.click('#setupGo'); await pg.waitForTimeout(600);
await pg.evaluate(() => { __pad.on = true; window.dispatchEvent(new Event('gamepadconnected')); }); await pg.waitForTimeout(300);
const padTap = async i => { await pg.evaluate(i => { __pad.b[i] = true; }, i); await pg.waitForTimeout(120); await pg.evaluate(i => { __pad.b[i] = false; }, i); await pg.waitForTimeout(160); };
const l0 = (await st()).lives, used0 = await pg.locator('#kbd .key:disabled').count();
await padTap(15); await padTap(0); await pg.waitForTimeout(200);
ok(await pg.locator('#kbd .key:disabled').count() === used0 + 1, 'Controller: Steuerkreuz wählt, A drückt die Taste');
await padTap(9); ok(await pg.isVisible('#ovPause'), 'Controller: Start = Pause'); await pg.click('#pQuit');
// Tageswort
await pg.click('#bDaily'); await pg.waitForTimeout(400); s = await st(); ok(s.mode === 'daily' && s.word, 'Tageswort');
for (const c of new Set(s.word)) await press(c);
await pg.waitForSelector('#ovRound:not([hidden])', { timeout: 4000 }); ok(!(await pg.isHidden('#rShare')), 'Tageswort: Teilen-Knopf');
await pg.click('#rNext'); await pg.click('#bDaily'); await pg.waitForTimeout(200); ok(/schon/.test(await pg.textContent('#rTitle')), 'Tageswort nur einmal pro Tag'); await pg.click('#rNext');
// Duell
await pg.click('#bDuel'); await pg.fill('#dA', 'Anna'); await pg.fill('#dB', 'Ben'); await pg.click('#dRounds .chip[data-r="2"]'); await pg.click('#duelGo');
ok(/Anna/.test(await pg.textContent('#wTitle')), 'Duell: Anna gibt ein Wort ein');
await pg.fill('#wIn', 'Xqzlbrt'); await pg.click('#wOk'); await pg.waitForTimeout(400); ok(/kenne ich nicht/.test(await pg.textContent('#wErr')), 'Wort wird im Wörterbuch geprüft');
await pg.fill('#wIn', 'Pinguin'); await pg.click('#wOk'); await pg.waitForTimeout(400);
s = await st(); ok(s.mode === 'duel' && s.word === 'PINGUIN', 'Ben rät PINGUIN'); ok(await pg.locator('#kbd .key[data-x="joker"]').count() === 0, 'kein Joker im Duell');
for (const c of 'PINGU') await press(c); await pg.waitForSelector('#ovRound:not([hidden])', { timeout: 4000 }); ok(/Ben hat es/.test(await pg.textContent('#rTitle')), 'Duell-Runde gewonnen');
await pg.click('#rNext'); ok(/Ben/.test(await pg.textContent('#wTitle')), 'Wechsel: Ben gibt ein Wort ein');
await pg.click('#wRand'); await pg.click('#wOk'); await pg.waitForTimeout(300); ok((await st()).mode === 'duel', 'Zufallswort im Duell');
await pg.keyboard.press('Escape'); await pg.click('#pQuit');
// Handy hochkant
const ph0 = await b.newPage({ viewport: { width: 390, height: 800 }, serviceWorkers: 'block', hasTouch: true, isMobile: true }); ph0.on('pageerror', e => errs.push('mobil: ' + e.message));
await ph0.goto(URL); await ph0.waitForTimeout(400); await ph0.tap('#bSolo'); await ph0.tap('#setupGo'); await ph0.waitForTimeout(900);
const pw = (await ph0.evaluate(() => FUNKGALGEN.state())).word; for (const c of [...new Set(pw)].slice(0, 2)) await ph0.tap('#kbd .key[data-k="' + c + '"]'); await ph0.tap('#kbd .key[data-k="Q"]').catch(() => { }); await ph0.waitForTimeout(900);
const kb = await ph0.locator('#kbd').boundingBox(); ok(kb && kb.y + kb.height <= 800 && kb.width <= 390, 'Handy: Tastatur passt aufs Display');
await shot(ph0, 'handy');
ok(errs.length === 0, 'keine Fehler (offline) ' + errs.join(' | '));

// Online: Fernseher + 2 Handys über Test-Relais
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
await tv.goto(URL + '?tv'); await tv.waitForTimeout(900);
const code = (await tv.evaluate(() => FUNKGALGEN.state())).host.code; ok(code && code.length === 4, 'TV-Link öffnet Lobby mit Code');
const link = await tv.textContent('#url'); ok(link.startsWith('https://ricorewioriginal-collab.github.io/easygames/funkgalgen/') && link.includes('?join=' + code), 'Einladung über die easygames-Homepage');
const phones = [];
for (const name of ['Mia', 'Tom']) { const c = await b.newContext({ viewport: { width: 390, height: 800 }, serviceWorkers: 'block', hasTouch: true }); await fakePeer(c); const p = await c.newPage(); p.on('pageerror', e => errs.push(name + ': ' + e.message)); await p.goto(URL + '?join=' + code); await p.fill('#jName', name); await p.click('#bJoin'); await p.waitForSelector('#pPlay:not([hidden])', { timeout: 5000 }); phones.push(p); }
ok(true, '2 Handys beigetreten'); await tv.waitForTimeout(200); ok(!(await tv.isDisabled('#lobStart')), 'Start möglich');
await tv.click('#lobStart'); await tv.waitForTimeout(400);
ok(await phones[0].isVisible('#pSet'), 'Mia soll ein Wort eingeben'); ok(!(await phones[1].isVisible('#pSet')), 'Tom wartet');
await phones[0].fill('#pWord', 'Qxzzy'); await phones[0].click('#pSend'); await phones[0].waitForTimeout(400); ok(/kenne ich nicht/.test(await phones[0].textContent('#pErr')), 'Handy-Wort wird geprüft');
await phones[0].fill('#pWord', 'Torte'); await phones[0].click('#pSend'); await tv.waitForTimeout(400);
ok((await tv.evaluate(() => FUNKGALGEN.state())).host.phase === 'guess', 'Raten beginnt'); ok(await phones[1].isVisible('#pKbd'), 'Tom bekommt die Tastatur');
await phones[1].click('#pKbd .key[data-k="T"]'); await phones[1].click('#pKbd .key[data-k="X"]'); await tv.waitForTimeout(400);
let hs = (await tv.evaluate(() => FUNKGALGEN.state())).host; ok(hs.players.find(p => p.name === 'Tom').score === 8, 'Tom: T ✓ +10, X ✗ −2');
ok((await phones[1].locator('#pKbd .key.hit').count()) === 1 && (await phones[1].locator('#pKbd .key.miss').count()) === 1, 'Handy zeigt benutzte Buchstaben');
await shot(tv, 'tv_online'); await shot(phones[1], 'handy_online');
await phones[1].click('#pKbd .key[data-x="solve"]'); await phones[1].fill('#sIn', 'torte'); await phones[1].click('#sOk'); await tv.waitForTimeout(500);
hs = (await tv.evaluate(() => FUNKGALGEN.state())).host; ok(hs.phase === 'reveal' && hs.players.find(p => p.name === 'Tom').score > 20, 'Tom löst das Wort');
await tv.waitForTimeout(4600); ok(await phones[1].isVisible('#pSet'), 'Nächste Runde: Tom gibt das Wort vor');
ok(errs.length === 0, 'keine Fehler ' + errs.join(' | '));
await b.close();
