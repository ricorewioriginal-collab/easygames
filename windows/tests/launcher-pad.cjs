// Test der Controller-Einrichtung in der Bibliothek (launcher/index.html): Anzeige, Assistent, gespeicherte Belegung.
//   NODE_PATH=$(npm root -g) node windows/tests/launcher-pad.cjs [easygames-Checkout mit gamepad.js] [Screenshot-Ordner]
// Die Seite läuft ohne App (kein chrome.webview); die Nachricht an die App wird mitgeschnitten.
const path = require('path');
const fs = require('fs');
const http = require('http');
const { chromium } = require('playwright');

const DIR = path.join(__dirname, '..', 'launcher');
const PAD_JS = path.join(process.argv[2] || path.join(__dirname, '..', '..'), 'gamepad.js');
const SHOTS = process.argv[3] || '';
let fails = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FEHL ') + m); if (!c) fails++; };

(async () => {
  const srv = http.createServer((q, r) => {
    const u = decodeURIComponent(q.url.split('?')[0]);
    const f = u === '/' ? path.join(DIR, 'index.html') : u.startsWith('/_launcher/') ? path.join(DIR, u.slice(11)) : null;
    if (!f || !fs.existsSync(f)) { r.statusCode = 404; return r.end(); }
    r.setHeader('Content-Type', f.endsWith('.html') ? 'text/html' : f.endsWith('.svg') ? 'image/svg+xml' : 'application/octet-stream');
    r.end(fs.readFileSync(f));
  }).listen(0);
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  // wie die App: Belegungen + Nur-Normalisierung aus gamepad.js vor allen Skripten; dazu ein Billig-Pad ohne Standard-Zuordnung (Hat-Steuerkreuz)
  await p.addInitScript(`(() => {
    window.sent = [];
    window.chrome = { webview: { postMessage: m => window.sent.push(m), addEventListener: () => {} } };
    window.fake = { id: 'USB Gamepad (Vendor: 0079 Product: 0011)', buttons: Array(10).fill(0), axes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1.2857] };
    const mk = () => [{ id: fake.id, index: 0, connected: true, timestamp: performance.now(), mapping: '',
      buttons: fake.buttons.map(v => ({ pressed: v > .5, touched: v > 0, value: v })), axes: fake.axes.slice() }];
    Object.defineProperty(Navigator.prototype, 'getGamepads', { value: mk, configurable: true });
  })();
  window.EASYGAMES_PADMAPS = {}; window.EASYGAMES_PAD_NORMAL_ONLY = 1;
  ${fs.readFileSync(PAD_JS, 'utf8')}`);
  await p.goto('http://127.0.0.1:' + srv.address().port + '/');
  await p.click('#bPad');
  await p.waitForSelector('[data-pad="0"]');
  const tick = (n = 4) => p.evaluate(n => new Promise(r => { let i = 0; const f = () => ++i >= n ? r() : requestAnimationFrame(f); requestAnimationFrame(f); }), n);
  const set = f => p.evaluate(f => Object.assign(window.fake, f), f);
  ok(await p.textContent('#padBody').then(t => /automatisch angepasst/.test(t)), 'Pad ohne Standard-Zuordnung wird erkannt');
  // Test-Anzeige: Hat nach unten = Steuerkreuz ↓ leuchtet
  await p.evaluate(() => { fake.axes[9] = 0.142857; }); await tick();
  ok(await p.$eval('[data-b="13"]', e => e.classList.contains('on')), 'Test-Anzeige: Hat ↓ leuchtet als Steuerkreuz ↓');
  await p.evaluate(() => { fake.axes[9] = 1.2857; }); await tick();
  if (SHOTS) await p.screenshot({ path: path.join(SHOTS, 'controller-einstellungen.png') });
  // Assistent: Taste 2 als A, Taste 1 als B, Rest überspringen bis zu den Sticks; linker Stick rechts = Achse 0, unten = Achse 1 umgekehrt
  await p.click('[data-pw="map"]'); await tick();
  const press = async (i) => { await p.evaluate(i => { fake.buttons[i] = 1; }, i); await tick(); await p.evaluate(i => { fake.buttons[i] = 0; }, i); await tick(); };
  await press(2);
  if (SHOTS) await p.screenshot({ path: path.join(SHOTS, 'controller-assistent.png') });
  await press(1);
  for (let i = 2; i < 16; i++) { await p.click('#pwSkip'); await tick(); }
  await p.evaluate(() => { fake.axes[0] = 1; }); await tick(); await p.evaluate(() => { fake.axes[0] = 0; }); await tick();
  await p.evaluate(() => { fake.axes[1] = -1; }); await tick(); await p.evaluate(() => { fake.axes[1] = 0; }); await tick();
  await p.click('#pwSkip'); await tick(); await p.click('#pwSkip'); await tick();
  const msg = await p.evaluate(() => window.sent.filter(m => m.cmd === 'padmaps').pop());
  const m = msg && msg.maps['USB Gamepad (Vendor: 0079 Product: 0011)'];
  ok(m && m.b[0].b === 2 && m.b[1].b === 1 && m.b[5] === null && m.a[0].a === 0 && !m.a[0].inv && m.a[1].a === 1 && m.a[1].inv === true, 'Assistent: Belegung an die App geschickt ' + JSON.stringify(m && { b0: m.b[0], b1: m.b[1], a0: m.a[0], a1: m.a[1] }));
  // sofort wirksam (gleiche Adresse wie die Spiele): Taste 2 ist jetzt A, Achse 1 umgekehrt
  // im selben Schritt lesen und wieder loslassen: sonst bedient die Eingabe das offene Fenster (Stick wählt „Tasten neu belegen“, A startet den Assistenten neu)
  const g = await p.evaluate(() => { fake.buttons[2] = 1; fake.axes[1] = -0.8; const x = navigator.getGamepads()[0], r = { a: x.buttons[0].pressed, ly: x.axes[1] }; fake.buttons[2] = 0; fake.axes[1] = 0; return r; });
  ok(g.a && g.ly > 0.7, 'neue Belegung wirkt sofort (A = Taste 2, Stick umgekehrt)');
  await tick();
  ok(await p.textContent('#padBody').then(t => /Eigene Belegung aktiv/.test(t)), 'Anzeige: eigene Belegung aktiv');
  await p.click('[data-pw="reset"]'); await tick();
  const last = await p.evaluate(() => window.sent.filter(m => m.cmd === 'padmaps').pop());
  ok(last && Object.keys(last.maps).length === 0, 'Zurücksetzen entfernt die Belegung');
  ok(!errs.length, 'keine JS-Fehler ' + errs.join(' | '));
  await b.close(); srv.close();
  console.log(fails ? fails + ' Fehler' : 'alles ok');
  process.exit(fails ? 1 : 0);
})();
