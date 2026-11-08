// RADIO-BINGO – Browser-Test (Playwright): Titel, Menü, Einstellungen (Stimmenwahl), große Show (Runde, Ziehung, Markieren, Bingo-Ruf,
// falscher Ruf, Punkte), Schnelles Bingo mit Muster, Blitz-Bingo, Klassik 90, Tastatur-Steuerung, Online & Handys mit zwei Geräten
// (Gastgeber + Mitspieler: Karten, Kugeln, Bingo-Ruf wird beim Gastgeber geprüft), Handy-Ansicht.
// Start: Server im easygames-Ordner (Port 8766), dann: node radio-bingo-src/tests/e2e.mjs [Screenshot-Ordner] [Basis-URL]
import { chromium } from 'playwright';
const OUT = process.argv[2] || '', BASE = process.argv[3] || 'http://localhost:8766/';
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
const errs = [], ok = (c, m) => { console.log((c ? 'ok   ' : 'FEHLER ') + m); if (!c) errs.push('FAIL ' + m); };
const FAKE = () => { const bc = new BroadcastChannel('fakepeer'), peers = {};
  class Conn { constructor(peer, cid, me) { this.peer = peer; this.cid = cid; this.me = me; this.h = {}; this.open = false; } on(e, f) { (this.h[e] = this.h[e] || []).push(f); } emit(e, d) { (this.h[e] || []).forEach(f => f(d)); }
    send(d) { bc.postMessage({ t: 'data', cid: this.cid, to: this.peer, d: JSON.parse(JSON.stringify(d)) }); } close() { this.open = false; bc.postMessage({ t: 'close', cid: this.cid, to: this.peer }); } }
  class Peer { constructor(id) { this.id = id || 'g' + Math.random().toString(36).slice(2); this.h = {}; this.conns = {}; peers[this.id] = this; setTimeout(() => this.emit('open', this.id), 20); }
    on(e, f) { (this.h[e] = this.h[e] || []).push(f); } emit(e, d) { (this.h[e] || []).forEach(f => f(d)); }
    connect(to) { const cid = Math.random().toString(36).slice(2), c = new Conn(to, cid, this.id); this.conns[cid] = c; bc.postMessage({ t: 'conn', cid, from: this.id, to }); return c; } destroy() { delete peers[this.id]; } reconnect() {} }
  bc.onmessage = ({ data: m }) => { const p = peers[m.to]; if (!p) return;
    if (m.t === 'conn') { const c = new Conn(m.from, m.cid, p.id); p.conns[m.cid] = c; p.emit('connection', c); bc.postMessage({ t: 'ack', cid: m.cid, to: m.from }); setTimeout(() => { c.open = true; c.emit('open'); }, 10); }
    else if (m.t === 'ack') { const c = p.conns[m.cid]; if (c) { c.open = true; c.emit('open'); } }
    else if (m.t === 'data') { const c = p.conns[m.cid]; if (c) c.emit('data', m.d); }
    else if (m.t === 'close') { const c = p.conns[m.cid]; if (c) { c.open = false; c.emit('close'); } } };
  document.addEventListener('DOMContentLoaded', () => { Object.defineProperty(window, 'Peer', { configurable: true, writable: true, value: Peer }); }); };
const SAVE = { set: { quality: 0, tempo: 2, music: false } };
async function page(ctx, vp) {
  const p = await ctx.newPage(); if (vp) await p.setViewportSize(vp);
  await p.addInitScript(FAKE); await p.addInitScript(s => { if (!localStorage.getItem('radio-bingo-save')) localStorage.setItem('radio-bingo-save', s); }, JSON.stringify(SAVE));
  p.on('pageerror', e => errs.push('PAGE ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|WebGL|GPU stall/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
  return p;
}
const shot = async (p, n) => { if (OUT) await p.screenshot({ path: `${OUT}/rb-${n}.jpg`, quality: 82 }); };
const ctx = await b.newContext({ viewport: { width: 1366, height: 820 }, serviceWorkers: 'block' });
await ctx.route(/anmacha-cloud\.js/, r => r.fulfill({ status: 200, body: '', contentType: 'text/javascript' }));
const p = await page(ctx);
await p.goto(BASE + 'radio-bingo/'); await p.waitForSelector('#sTitle.on', { timeout: 30000 }); await shot(p, 'titel');
await p.keyboard.press('Enter'); await p.waitForSelector('#sMenu.on'); ok(await p.locator('#mList .mi').count() === 8, 'Menü mit 6 Modi + Einstellungen + Anleitung');
ok((await p.textContent('[data-go="online"]')).includes('🌐') && (await p.textContent('[data-go="online"]')).includes('Online'), 'Menüpunkt „🌐 Online & Handys“');
await p.waitForTimeout(400); await p.keyboard.press('ArrowDown'); ok(await p.evaluate(() => document.activeElement.dataset.go === 'schnell'), 'Pfeiltasten im Menü'); await shot(p, 'menu');
// Einstellungen: Stimmenwahl und Sprechtempo
await p.click('[data-go="opts"]'); ok(await p.locator('#oVoice option').count() >= 1 && await p.locator('#oRate').count() === 1, 'Einstellungen: Stimmenwahl + Sprechtempo');
await p.locator('#oRate').fill('1.2'); ok(await p.evaluate(() => RBApp.voice.rate === 1.2 && JSON.parse(localStorage.getItem('radio-bingo-save')).set.rate === 1.2), 'Sprechtempo gespeichert'); await shot(p, 'einstellungen'); await p.click('[data-act="x"]');
// Große Show: ohne Studio-Publikum testen, damit der Ruf sicher bei uns landet
await p.click('[data-go="show"]'); await p.waitForSelector('#sSetup.on'); await p.click('[data-cards="2"]'); await p.click('#go'); await p.waitForSelector('#sGame.on');
await p.waitForFunction(() => RBApp.rds.length === 4 && RBApp.me.cards.length === 2, null, { timeout: 30000, polling: 400 }); ok(true, 'Große Show: 4 Runden, 2 Karten');
ok(await p.evaluate(() => RBApp.rds[3].pattern === 'voll' && RBApp.rds[3].jackpot === 66), 'Finale: volle Karte mit Jackpot-Grenze 66');
await p.evaluate(() => { RBApp.bots = []; const t = setInterval(() => { if (!RBApp.playing) clearInterval(t); if (RBApp.bots.length) RBApp.bots = []; }, 50); });
await p.waitForFunction(() => RBApp.drawn.length >= 2, null, { timeout: 60000, polling: 400 });
await p.waitForFunction(() => document.querySelectorAll('#last .lb').length >= 2, null, { timeout: 30000, polling: 400 }).catch(() => {}); const n0 = await p.evaluate(() => RBApp.drawn.length); ok(n0 >= 2 && (await p.locator('#last .lb').count()) >= 2, 'Kugeln werden gezogen und angezeigt'); await shot(p, 'show');
// falscher Bingo-Ruf
await p.evaluate(() => { RBApp.me.cards.forEach(cs => cs.marks = cs.card.cells.map((_, i) => i === 12)); RBApp.renderGame(); });
const pts0 = await p.evaluate(() => (RBApp.me.points = 120)); await p.keyboard.press('KeyB'); await p.waitForTimeout(300);
ok(await p.evaluate(() => RBApp.me.points === 70), 'Falscher Bingo-Ruf kostet 50 Punkte'); void pts0;
// markieren: nicht gezogene Zahl geht nicht, gezogene schon
const tap = await p.evaluate(() => { const cs = RBApp.me.cards[0]; const i = cs.card.cells.findIndex((n, k) => k !== 12 && !RBApp.drawnSet.has(n)); RBApp.tapCell(0, i); return cs.marks[i]; });
ok(tap === false, 'Nicht gezogene Zahl lässt sich nicht markieren');
// Auto-Markieren an, warten bis Bingo möglich, dann rufen (Leertaste)
await p.evaluate(() => { const S = JSON.parse(localStorage.getItem('radio-bingo-save')); }); await p.evaluate(() => { RBApp.me.cards.forEach(cs => cs.card.cells.forEach((n, i) => { if (RBApp.drawnSet.has(n)) cs.marks[i] = true; })); });
await p.evaluate(() => { const iv = setInterval(() => { if (!RBApp.playing) return clearInterval(iv); RBApp.me.cards.forEach(cs => cs.card.cells.forEach((n, i) => { if (RBApp.drawnSet.has(n)) cs.marks[i] = true; })); }, 100); });
await p.waitForFunction(() => RBApp.me.cards.some(cs => RBApp.missingOf(cs) === 0) || !RBApp.playing, null, { timeout: 300000, polling: 400 });
console.log('     (Kugeln bis Bingo: ' + await p.evaluate(() => RBApp.drawn.length + ', Runde ' + RBApp.ri) + ')'); await p.waitForTimeout(150); await p.keyboard.press('Space');
await p.waitForFunction(() => RBApp.me.wins >= 1, null, { timeout: 20000, polling: 400 }).then(() => ok(true, 'Bingo gerufen und gewonnen'), () => ok(false, 'Bingo gerufen und gewonnen'));
ok(await p.evaluate(() => RBApp.me.points > 70), 'Punkte für das Bingo: ' + await p.evaluate(() => RBApp.me.points)); await shot(p, 'bingo');
// Studio-Spiel Höher oder Tiefer erscheint nach Runde 1
await p.waitForFunction(() => !!document.querySelector('.hlBall') || /Höher oder Tiefer/.test(document.getElementById('sub').textContent), null, { timeout: 150000, polling: 400 }).then(() => ok(true, 'Studio-Spiel „Höher oder Tiefer“'), () => ok(false, 'Studio-Spiel „Höher oder Tiefer“')); await shot(p, 'hoeher-tiefer');
await p.click('[data-act="h"]').catch(() => {});
await p.keyboard.press('Escape'); await p.waitForTimeout(400); if (await p.locator('[data-act="quit"]').count()) await p.click('[data-act="quit"]'); else { await p.keyboard.press('Escape'); await p.click('[data-act="quit"]').catch(() => {}); }
await p.waitForSelector('#sMenu.on', { timeout: 10000 }); ok(true, 'Pause → Show beenden → Menü');
// Schnelles Bingo mit Muster „Herz“
await p.click('[data-go="schnell"]'); await p.click('[data-p="herz"]'); await p.click('#go'); await p.waitForFunction(() => RBApp.pat && RBApp.pat.id === 'herz', null, { timeout: 30000, polling: 400 }); ok(true, 'Schnelles Bingo: Muster Herz');
ok(await p.locator('#hudPat .pmini i.on').count() === 16, 'Muster-Vorschau zeigt das Herz'); await p.waitForFunction(() => RBApp.drawn.length >= 1, null, { timeout: 40000, polling: 400 }); await shot(p, 'schnell');
// Tastatur: Feld wählen und markieren
const kb = await p.evaluate(() => { const cs = RBApp.me.cards[0], n = RBApp.drawn[0], i = cs.card.cells.indexOf(n); return i; });
await p.keyboard.press('ArrowRight'); ok(await p.evaluate(() => RBApp.cur && RBApp.cur[1] === 7), 'Tastatur: Pfeil bewegt den Cursor'); void kb;
await p.keyboard.press('Escape'); await p.click('[data-act="quit"]'); await p.waitForSelector('#sMenu.on');
// Klassik 90
await p.click('[data-go="neunzig"]'); await p.click('#go'); await p.waitForFunction(() => RBApp.kind === 90 && RBApp.me.cards.length > 0 && RBApp.me.cards[0].card.cells.length === 27, null, { timeout: 30000, polling: 400 });
ok(await p.locator('.card.c90').count() >= 1, 'Klassik 90: Karten mit 3 × 9 Feldern'); await p.waitForFunction(() => RBApp.drawn.length >= 1, null, { timeout: 40000, polling: 400 }); await shot(p, 'klassik90');
await p.keyboard.press('Escape'); await p.click('[data-act="quit"]'); await p.waitForSelector('#sMenu.on');
// Blitz-Bingo: Punkte fürs schnelle Markieren
await p.click('[data-go="blitz"]'); await p.click('#go'); await p.waitForFunction(() => RBApp.drawn.length >= 3, null, { timeout: 40000, polling: 400 });
const bz = await p.evaluate(() => { const n = RBApp.drawn[RBApp.drawn.length - 1]; for (let ci = 0; ci < RBApp.me.cards.length; ci++) { const i = RBApp.me.cards[ci].card.cells.indexOf(n); if (i >= 0) { RBApp.drawAt = performance.now(); RBApp.tapCell(ci, i); return RBApp.blitzScore; } } return -1; });
ok(bz === -1 || bz >= 10, 'Blitz-Bingo: schnelles Markieren gibt Punkte (' + bz + ')'); ok(await p.locator('#bingo').isHidden(), 'Blitz-Bingo ohne Bingo-Knopf'); await shot(p, 'blitz');
await p.keyboard.press('Escape'); await p.click('[data-act="quit"]'); await p.waitForSelector('#sMenu.on');
// Online & Handys: Gastgeber + Mitspieler
await p.click('[data-go="online"]'); await p.waitForFunction(() => /^[A-Z0-9]{4}$/.test(document.getElementById('code')?.textContent || ''), null, { timeout: 20000, polling: 400 });
const code = await p.textContent('#code'), link = await p.textContent('#url');
ok(/ricorewioriginal-collab\.github\.io\/easygames\/radio-bingo\/\?join=/.test(link), 'Einladungslink über die easygames-Homepage: ' + link);
await p.click('[data-oai]'); await shot(p, 'lobby');
// Software-3D im Test entlasten: Gastgeber rendert in sehr kleiner Auflösung, damit die zweite Seite zügig lädt
await p.evaluate(() => { RBApp.studio.renderer.setPixelRatio(0.25); RBApp.studio.resize(); });
const g = await page(ctx, { width: 390, height: 844 }); await g.goto(BASE + 'radio-bingo/?join=' + code, { waitUntil: 'domcontentloaded', timeout: 120000 }); await g.waitForSelector('#jName', { timeout: 90000 }); await g.fill('#jName', 'Handy-Hanna'); await g.click('#jGo');
await p.waitForFunction(() => RBApp.guests.size === 1, null, { timeout: 15000, polling: 400 }); ok((await p.textContent('.plist')).includes('Handy-Hanna'), 'Mitspieler erscheint in der Lobby');
await p.click('[data-oc="4"]'); await p.click('#oStart'); await g.waitForFunction(() => RBApp.me.cards.length === 4 && RBApp.scr === 'sGame', null, { timeout: 40000, polling: 400 }); ok(true, 'Mitspieler bekommt seine Karten');
await g.waitForFunction(() => RBApp.drawn.length >= 2, null, { timeout: 60000, polling: 400 });
const gd = await g.evaluate(() => RBApp.drawn), hd = await p.evaluate(() => RBApp.drawn); ok(gd.length >= 2 && gd.every((n, k) => hd[k] === n), 'Kugeln kommen beim Mitspieler an (' + gd.length + ')'); await shot(g, 'handy-mitspieler');
// Gast markiert automatisch und ruft Bingo – Gastgeber prüft
await p.evaluate(() => { RBApp.bots = []; const t = setInterval(() => { if (RBApp.bots.length) RBApp.bots = []; }, 50); });
await g.evaluate(() => { setInterval(() => { RBApp.me.cards.forEach(cs => cs.card.cells.forEach((n, i) => { if (RBApp.drawnSet.has(n)) cs.marks[i] = true; })); }, 100); });
await g.waitForFunction(() => RBApp.me.cards.some(cs => RBApp.missingOf(cs) === 0), null, { timeout: 480000, polling: 500 }); await g.click('#bingo');
await g.waitForFunction(() => RBApp.me.wins >= 1 && RBApp.me.points > 0, null, { timeout: 20000, polling: 400 }).then(() => ok(true, 'Bingo des Mitspielers vom Gastgeber bestätigt'), () => ok(false, 'Bingo des Mitspielers vom Gastgeber bestätigt'));
ok(await p.evaluate(() => [...RBApp.guests.values()][0].wins === 1), 'Gastgeber zählt den Sieg des Mitspielers');
await b.close();
console.log(errs.length ? 'FEHLER:\n' + errs.join('\n') : 'ALLES OK'); process.exit(errs.length ? 1 : 0);
