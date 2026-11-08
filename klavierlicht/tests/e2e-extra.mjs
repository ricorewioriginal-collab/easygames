// Klavierlicht – Browser-Test der Erweiterungen (Playwright): Doppel-/Wisch-/Goldkacheln, Herausforderungen, Wiederbeleben,
// Shop, Aufgaben, Erfolge, Turnier, Lieblingslieder, MIDI-Import, Lernpfad, beide Hände, Notenzeile, Fehlerstellen, Aufnahme +
// geteilter Link, Klangfarben, Rhythmus, Kalibrierung, Battle und Duett mit zwei Geräten (Verbindung im Test über einen Ersatz für PeerJS).
// Start: Server im Repo-Ordner, dann node klavierlicht/tests/e2e-extra.mjs [Screenshot-Ordner] [Basis-URL] [Test-MIDI-Datei]
import { chromium } from 'playwright';
const OUT = process.argv[2] || '', BASE = (process.argv[3] || 'http://localhost:8766/') + 'klavierlicht/', MID = process.argv[4] || '';
const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }), errs = [];
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FEHLER ') + m); if (!c) errs.push('FAIL ' + m); };
// Ersatz für PeerJS: Seiten im selben Browser-Kontext sprechen über BroadcastChannel
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
  // nach ../cloud/fire-peer.js (Homepage-Links bleiben echt), nur die Verbindung selbst ersetzen
  document.addEventListener('DOMContentLoaded', () => { Object.defineProperty(window, 'Peer', { configurable: true, writable: true, value: Peer }); }); };
async function page(ctx0, opt) { const ctx = ctx0 || await b.newContext(Object.assign({ serviceWorkers: 'block' }, opt)); await ctx.route(/anmacha-cloud\.js/, r => r.fulfill({ status: 200, body: '', contentType: 'text/javascript' }));
  const p = await ctx.newPage(); await p.addInitScript(FAKE); p.on('pageerror', e => errs.push('PAGE ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push('CONSOLE ' + m.text()); }); p.on('dialog', d => d.accept('Test-Melodie')); return [ctx, p]; }
const [ctx, p] = await page(null, { viewport: { width: 1200, height: 800 } });
await p.goto(BASE); await p.waitForSelector('#sTitle.on', { timeout: 8000 }); await p.click('#bPress'); await p.waitForSelector('#sMenu.on');
ok(await p.locator('.mi[data-go="online"]').innerText().then(t => /🌐/.test(t) && /Online/.test(t)), 'Menü zeigt 🌐 Online & Duett');
// Kacheln: Doppel-, Wisch- und Goldkacheln, Herausforderungen
await p.evaluate(() => { KLApp.setMode('klassisch'); KLApp.pick(KLApp.allSongs().find(s => s.id === 'stillenacht'), 'profi'); });
const k1 = await p.evaluate(() => { const G = KLApp.game; return { tw: G.notes.filter(n => n.twin).length, sl: G.notes.filter(n => n.slide != null).length, gold: G.notes.filter(n => n.gold).length, mult: G.mult }; });
ok(k1.tw > 0 && k1.sl > 0, `Schwer: Doppelkacheln (${k1.tw}) und Wischkacheln (${k1.sl}), Goldkacheln ${k1.gold}`);
// Wischkachel halten und mitwischen
const sl = await p.evaluate(async () => { const G = KLApp.game, cv = document.getElementById('cv'), r = cv.getBoundingClientRect(); const n = G.notes.find(x => x.slide != null && x.t > 2.5); if (!n) return 'keine';
  G.notes.forEach(x => { if (x !== n && x.t < n.t + n.d + 0.5) x.hit = 'perfect'; }); G.lives = 3;
  while (KLPiano.ctx.currentTime - G.t0 - G.lat < n.t - 0.01) await new Promise(q => setTimeout(q, 5));
  const X = l => r.left + (l + 0.5) * r.width / 4, y = r.top + r.height * 0.78;
  cv.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 3, clientX: X(n.lane), clientY: y, bubbles: true }));
  while (KLPiano.ctx.currentTime - G.t0 - G.lat < n.t + n.d * 0.5) await new Promise(q => setTimeout(q, 10));
  cv.dispatchEvent(new PointerEvent('pointermove', { pointerId: 3, clientX: X(n.slide), clientY: y, bubbles: true }));
  const moved = !!G.hold[n.slide]; while (KLPiano.ctx.currentTime - G.t0 - G.lat < n.t + n.d + 0.05) await new Promise(q => setTimeout(q, 10));
  cv.dispatchEvent(new PointerEvent('pointerup', { pointerId: 3, clientX: X(n.slide), clientY: y, bubbles: true }));
  return moved && n.held >= 0.97 ? 'ok' : 'moved=' + moved + ' held=' + n.held; });
ok(sl === 'ok', 'Wischkachel: halten und in die Nachbarbahn wischen (' + sl + ')');
await p.evaluate(() => { KLApp.game.run = false; localStorage.setItem('klavierlicht-settings', JSON.stringify(Object.assign(JSON.parse(localStorage.getItem('klavierlicht-settings') || '{}'), { mods: { mirror: true, blind: true, chaos: true } }))); });
await p.reload(); await p.waitForSelector('#sTitle.on'); await p.click('#bPress');
await p.evaluate(() => { KLMeta.data.gems = 50; KLMeta.save(); KLApp.setMode('klassisch'); KLApp.pick(KLApp.allSongs().find(s => s.id === 'jakob'), 'normal'); KLApp.game.lives = 99; }); await p.waitForTimeout(3500);
ok(await p.evaluate(() => { const G = KLApp.game; return G.mods.mirror && G.mods.blind && G.mods.chaos && Math.abs(G.mult - 1.45) < 0.01; }), 'Herausforderungen Spiegel, Blind, Chaos: +45 % Punkte');
if (OUT) await p.screenshot({ path: OUT + '/x-kacheln.png' });
// Wiederbeleben mit Diamanten
await p.evaluate(() => { const G = KLApp.game; G.lives = 1; G.notes.filter(n => n.hit === null).slice(0, 1).forEach(n => { n.t = KLPiano.ctx.currentTime - G.t0 - 1; }); });
await p.waitForSelector('.res h2:has-text("Weiterspielen")', { timeout: 4000 }); await p.click('[data-act="yes"]'); await p.waitForTimeout(300);
const rv = await p.evaluate(() => ({ l: KLApp.game.lives, run: KLApp.game.run, pa: KLApp.game.paused, g: KLMeta.data.gems, r: KLApp.game.revives }));
ok(rv.l === 3 && rv.run && !rv.pa && rv.g === 40 && rv.r === 1, 'Wiederbeleben: 10 💎, volle Herzen, Spiel läuft weiter ' + JSON.stringify(rv));
await p.evaluate(() => { KLApp.game.run = false; localStorage.setItem('klavierlicht-settings', JSON.stringify(Object.assign(JSON.parse(localStorage.getItem('klavierlicht-settings')), { mods: {} }))); KLApp.menu(); });
// Shop, Aufgaben, Erfolge
await p.click('.mi[data-go="shop"]'); await p.click('.shopIt[data-id="neon"]');
ok(await p.evaluate(() => KLMeta.data.use.design === 'neon' && KLMeta.data.own.design.includes('neon') && KLMeta.data.gems === 10), 'Shop: Neon-Design für 30 💎 gekauft und aktiv');
if (OUT) await p.screenshot({ path: OUT + '/x-shop.png' });
await p.click('[data-act="esc"]'); await p.click('.mi[data-go="quests"]'); ok(await p.locator('.quest').count() === 3, 'Aufgaben: drei für heute'); await p.click('[data-act="esc"]');
await p.click('.mi[data-go="ach"]'); ok(await p.locator('.ach').count() >= 20, 'Erfolge: Liste mit 20 Erfolgen'); await p.click('[data-act="esc"]');
// Turnier der Woche
await p.click('.mi[data-go="turnier"]'); await p.waitForSelector('#tourGo'); ok(await p.locator('.tourList li').count() === 5, 'Turnier: fünf Lieder der Woche');
await p.click('#tourGo'); await p.waitForSelector('#sGame.on', { timeout: 8000 }); await p.waitForTimeout(500); await p.evaluate(() => { KLApp.game.len = -10; });
await p.waitForSelector('.res:has-text("1/5")', { timeout: 4000 }); ok(true, 'Turnier: nach Lied 1 → Zwischenstand 1/5');
await p.evaluate(() => { document.getElementById('ov').hidden = true; KLApp.game.run = false; KLApp.menu(); });
// Lieblingslied und Sortierung
await p.click('.mi[data-go="klassisch"]'); await p.click('.card[data-k="b:elise"]'); await p.click('#sgFav'); await p.click('#sgBack'); await p.click('[data-cat="fav"]');
ok(await p.locator('.card[data-k]').count() === 1 && /Elise/.test(await p.locator('.card[data-k]').innerText()), 'Lieblingslied erscheint unter ❤️ Meine');
// MIDI-Datei laden
if (MID) { await p.click('[data-cat="eigen"]'); await p.setInputFiles('#midiFile', MID); await p.waitForSelector('#sSong.on', { timeout: 4000 });
  ok(/test/i.test(await p.textContent('#sgTitle')), 'MIDI-Datei geladen → spielbar'); await p.click('.medal[data-l="leicht"]'); await p.waitForSelector('#sGame.on'); ok(await p.evaluate(() => KLApp.game.notes.length >= 4 && KLApp.song.own), 'Eigenes Lied startet');
  await p.evaluate(() => { KLApp.game.run = false; KLApp.menu(); }); }
// Lernpfad: Lektion 1 bestehen → Lektion 2 offen
await p.click('.mi[data-go="lernen"]'); await p.waitForSelector('[data-les="0"]'); await p.click('[data-les="0"]'); await p.click('[data-act="go"]'); await p.waitForSelector('#sGame.on');
const les = await p.evaluate(async () => { const G = KLApp.game, end = performance.now() + 20000; while (performance.now() < end && G.run) { const n = G.notes.find(x => x.hit === null && Math.abs(x.t - G.lt) < 0.03); if (n) { KLApp.keyDown(n.p); KLApp.keyUp(n.p); } await new Promise(q => setTimeout(q, 6)); } return G.lessonId; });
await p.waitForSelector('.res h2:has-text("bestanden")', { timeout: 8000 }); ok(les === 'c', 'Lernpfad: Lektion 1 bestanden');
await p.click('[data-act="path"]'); ok(await p.locator('[data-les="1"]:not([disabled])').count() === 1, 'Lernpfad: Lektion 2 freigeschaltet');
// beide Hände + Notenzeile + Fehlerstellen
await p.click('[data-cat="alle"]'); await p.click('.card[data-k="b:ode"]'); await p.click('[data-hand="b"]'); if (await p.isChecked('#wait')) await p.click('#wait'); await p.evaluate(() => { const r = document.getElementById('rate'); r.value = 1; r.dispatchEvent(new Event('input')); });
await p.click('.medal[data-l="normal"]'); await p.waitForSelector('#sGame.on'); await p.waitForTimeout(3600);
ok(await p.evaluate(() => KLApp.game.notes.some(n => n.hand === 'L') && KLApp.game.notes.some(n => n.hand === 'R')), 'Beide Hände: Melodie und Bass auf der Tastatur');
if (OUT) await p.screenshot({ path: OUT + '/x-lernen-noten.png' });
await p.evaluate(() => { KLApp.game.len = 0; }); await p.waitForSelector('[data-act="weak"]', { timeout: 4000 }); await p.click('[data-act="weak"]'); await p.waitForTimeout(300);
ok(await p.evaluate(() => KLApp.game.practiceSlice && KLApp.game.rate <= 0.75 && /3×/.test(KLApp.game.chart.title)), 'Fehlerstellen üben: zwei Takte dreimal, langsamer');
await p.evaluate(() => { KLApp.game.run = false; KLApp.menu(); });
// Freies Klavier: Aufnahme, Lied speichern, Link, Klang, Rhythmus
await p.click('.mi[data-go="frei"]'); await p.waitForSelector('#sGame.on'); await p.click('#kRec');
for (const k of ['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT']) { await p.keyboard.down(k); await p.waitForTimeout(120); await p.keyboard.up(k); }
await p.click('#kRec'); await p.waitForSelector('[data-act="song"]'); ok(await p.evaluate(() => KLApp.game.lastRec.length === 5), 'Aufnahme: 5 Töne aufgenommen');
await p.click('[data-act="song"]'); ok(await p.evaluate(() => JSON.parse(localStorage.getItem('kl-own')).some(c => c.title === 'Test-Melodie' && c.mel.length === 5)), 'Aufnahme als Lied gespeichert (📂 Eigene)');
const code = await p.evaluate(() => KLMidi.encode(KLApp.game.lastRec));
await p.click('#kSnd'); await p.click('.shopIt[data-id="epiano"]'); ok(await p.evaluate(() => KLPiano.timbre === 'epiano'), 'Klang: E-Piano gewählt'); await p.click('[data-act="esc"]');
await p.click('#kRhy'); await p.click('[data-k="pop"]'); await p.click('#ra'); await p.click('[data-act="esc"]'); await p.keyboard.down('KeyQ'); await p.waitForTimeout(600); await p.keyboard.up('KeyQ');
ok(await p.evaluate(() => KLApp.game.rhy.style === 'pop' && KLApp.game.rhy.step > 2 && KLApp.game.rhy.auto && !!KLApp.game.rhy.last), 'Rhythmus Pop mit Begleitautomatik läuft');
if (OUT) await p.screenshot({ path: OUT + '/x-frei.png' });
const [, q] = await page(ctx); await q.goto(BASE + '#rec=' + code); await q.waitForSelector('#sTitle.on'); await q.click('#bPress'); await q.waitForSelector('.panel h2:has-text("Melodie für dich")');
ok(true, 'Geteilter Link #rec öffnet „Eine Melodie für dich“'); await q.click('[data-act="play"]'); await q.waitForTimeout(500); ok(await q.evaluate(() => !!KLApp.game.pb || KLApp.game.lights.length > 0), 'Geteilte Melodie wird abgespielt'); await q.close();
// Kalibrierung
await p.evaluate(() => { KLApp.game.run = false; KLApp.menu(); }); await p.click('.mi[data-go="opts"]'); await p.click('[data-act="cal"]');
await p.evaluate(async () => { const pad = document.getElementById('calPad'), t0 = KLPiano.ctx.currentTime; for (let i = 0; i < 9; i++) { const target = t0 + 1 + (i + 2) * 0.6 + 0.08; while (KLPiano.ctx.currentTime < target) await new Promise(r => setTimeout(r, 4)); pad.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); } });
ok(await p.evaluate(() => { const c = JSON.parse(localStorage.getItem('klavierlicht-settings')).cal; return c > 0.02 && c < 0.2; }), 'Kalibrierung misst die Verzögerung');
await p.click('[data-act="esc"]'); await p.click('[data-act="esc"]');
// Battle mit zwei Geräten
const [, h] = await page(null, { viewport: { width: 900, height: 700 } }); const [, g] = await page(h.context(), {});
await h.goto(BASE); await h.waitForSelector('#sTitle.on'); await h.click('#bPress'); await h.click('.mi[data-go="online"]'); await h.click('[data-act="battle"]');
await h.waitForSelector('.netBox .code'); const room = (await h.textContent('.netBox .code')).trim(); const link = await h.textContent('.netBox .link');
ok(/^[A-Z2-9]{4}$/.test(room) && /^https:\/\/ricorewioriginal-collab\.github\.io\/easygames\/klavierlicht\/\?join=/.test(link), 'Battle: Raum mit Code und Einladungslink über die easygames-Homepage');
await h.waitForTimeout(400); ok(await h.locator('#qr svg').count() === 1, 'Battle: QR-Code');
await g.goto(BASE + '?join=' + room); await g.waitForSelector('#sTitle.on'); await g.click('#bPress');
await h.waitForSelector('[data-act="pick"]', { timeout: 6000 }); ok(true, 'Gast tritt über den Link bei'); await h.click('[data-act="pick"]'); await h.click('.card[data-k="b:jakob"]'); await h.click('.medal[data-l="normal"]');
await h.waitForSelector('#sGame.on', { timeout: 8000 }); await g.waitForSelector('#sGame.on', { timeout: 8000 });
const [ht0, gt0] = await Promise.all([h.evaluate(() => performance.timeOrigin + performance.now() + (KLApp.game.t0 - KLPiano.ctx.currentTime) * 1000), g.evaluate(() => performance.timeOrigin + performance.now() + (KLApp.game.t0 - KLPiano.ctx.currentTime) * 1000)]);
ok(Math.abs(ht0 - gt0) < 150, 'Battle: beide Geräte starten gleichzeitig (' + Math.round(Math.abs(ht0 - gt0)) + ' ms)');
await h.waitForTimeout(3500); await h.evaluate(() => { KLApp.game.st.score = 1234; }); await g.waitForTimeout(800);
ok(/1\.234/.test(await g.textContent('#gOpp')), 'Battle: Punkte des Gegners werden angezeigt');
await Promise.all([h.evaluate(() => { KLApp.game.len = 0; }), g.evaluate(() => { KLApp.game.st.score = 99; KLApp.game.len = 0; })]);
await h.waitForSelector('.res h2:has-text("Gewonnen")', { timeout: 6000 }); await g.waitForSelector('.res h2:has-text("verloren")', { timeout: 6000 }); ok(true, 'Battle: Gewinner und Verlierer');
if (OUT) await h.screenshot({ path: OUT + '/x-battle.png' });
// Duett: Gastgeber Melodie, Gast Bass
await h.evaluate(() => { document.querySelector('[data-act="leave"]').click(); }); await g.waitForTimeout(300);
await h.click('.mi[data-go="online"]'); await h.click('[data-act="duett"]'); await h.waitForSelector('.netBox .code'); const room2 = (await h.textContent('.netBox .code')).trim();
await g.evaluate(() => { document.getElementById('ov').hidden = true; KLApp.menu(); }); await g.click('.mi[data-go="online"]'); await g.fill('#joinCode', room2); await g.click('[data-act="join"]');
await h.waitForSelector('[data-act="pick"]', { timeout: 6000 }); await h.click('[data-act="pick"]'); await h.click('.card[data-k="b:ode"]'); await h.click('.medal[data-l="normal"]');
await h.waitForSelector('#sGame.on', { timeout: 8000 }); await g.waitForSelector('#sGame.on', { timeout: 8000 });
const du = await Promise.all([h.evaluate(() => KLApp.game.duet && KLApp.game.notes.every(n => n.hand === 'R')), g.evaluate(() => KLApp.game.duet && KLApp.game.notes.length > 5 && KLApp.game.notes.every(n => n.hand === 'L'))]);
ok(du[0] && du[1], 'Duett: Gastgeber spielt die Melodie, Gast den Bass');
await h.waitForTimeout(3000); await h.evaluate(() => { const G = KLApp.game; const n = G.notes.find(x => x.hit === null); KLApp.laneHit(n.lane); });
await g.waitForTimeout(300); ok(await g.evaluate(() => KLApp.net.partnerHits >= 1), 'Duett: Treffer der Melodie erklingen beim Partner');
console.log(errs.length ? '\n' + errs.join('\n') : '\nAlle Erweiterungs-Tests bestanden'); await b.close(); process.exit(errs.length ? 1 : 0);
