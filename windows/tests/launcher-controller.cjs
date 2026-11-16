// Prüft die Controller-Bedienung der Bibliothek (launcher/index.html) wie an der Konsole – mit einem nachgebildeten Standard-Controller.
//   NODE_PATH=$(npm root -g) node windows/tests/launcher-controller.cjs [Screenshot-Ordner]
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..', '..');
const UI = path.join(ROOT, 'windows', 'launcher');
const GAMES = ROOT;
const OUT = process.argv[2] || '';
const list = require('./catalog.cjs').games().slice(0, 14);
const games = list.map((g, i) => ({ id: g.id, title: g.title, short: g.short || g.title, desc: g.desc || '', meta: g.meta || '', cover: g.cover || '', genre: g.genre || '', url: g.url || '',
  kind: g.kind, modes: g.modes || [], installed: i % 2 === 0, update: i === 2, new: i === 3, size: 1e6, play: 0, last: null, needs: [], running: false }));
const state = { type: 'state', version: '1.0.0', online: true, refreshing: false, baseReady: true, busy: null, done: 0, total: 0, queue: [], error: null, toast: null,
  auto: true, fullscreen: false, disk: 38400000, appUpdate: null, appUpdatePct: -1, games };
let fails = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FEHL ') + m); if (!c) fails++; };

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route('https://ricorewioriginal-collab.github.io/**', r => r.abort());
  await p.route('https://appassets.local/**', r => {
    const rel = decodeURIComponent(new URL(r.request().url()).pathname).replace(/^\/+/, '');
    const f = rel === '' ? path.join(UI, 'index.html') : rel.startsWith('_launcher/') ? path.join(UI, rel.slice(10)) : path.join(GAMES, rel);
    if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) return r.fulfill({ status: 404, body: '' });
    r.fulfill({ status: 200, contentType: { '.html': 'text/html', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' }[path.extname(f)] || 'application/octet-stream', body: fs.readFileSync(f) });
  });
  await p.addInitScript(() => {
    window.__sent = [];
    window.chrome = { webview: { postMessage: o => window.__sent.push(o), addEventListener: (t, f) => { window.__recv = f; } } };
    window.pad = { buttons: Array(17).fill(0), axes: [0, 0, 0, 0] };
    Object.defineProperty(Navigator.prototype, 'getGamepads', { value: () => [{ id: 'Xbox Controller (STANDARD GAMEPAD)', index: 0, connected: true, mapping: 'standard', timestamp: performance.now(),
      buttons: pad.buttons.map(v => ({ pressed: v > .5, touched: v > 0, value: v })), axes: pad.axes.slice() }], configurable: true });
    Document.prototype.hasFocus = () => true;
  });
  await p.goto('https://appassets.local/');
  await p.evaluate(s => window.__recv({ data: s }), state);
  await p.waitForTimeout(1200);
  ok(await p.evaluate(() => document.body.classList.contains('pad')), 'Controller ohne Verbindungs-Ereignis erkannt (schon vor dem Start verbunden, kein Mausklick nötig)');
  await p.evaluate(() => { localStorage.clear(); dispatchEvent(new Event('gamepadconnected')); });
  const frames = n => p.evaluate(n => new Promise(r => { let i = 0; const f = () => ++i >= n ? r() : requestAnimationFrame(f); requestAnimationFrame(f); }), n);
  const press = async i => { await p.evaluate(i => { pad.buttons[i] = 1; }, i); await frames(4); await p.evaluate(i => { pad.buttons[i] = 0; }, i); await frames(4); await p.waitForTimeout(220); };
  const sent = () => p.evaluate(() => window.__sent.splice(0));
  const sel = () => p.evaluate(() => (document.querySelector('.grid .card.sel') || {}).dataset?.id || '');
  const inside = s => p.evaluate(s => !!document.activeElement && !!document.activeElement.closest(s), s);
  const L = 14, R = 15, U = 12, D = 13;

  await frames(3);
  ok(await p.isVisible('#ctlHint'), 'Controller-Hinweise sichtbar, sobald ein Controller da ist');
  await press(R); const s1 = await sel(); await press(R); const s2 = await sel();
  ok(s1 && s2 && s1 !== s2, 'Steuerkreuz wählt Spiele im Raster');
  await sent(); await press(0);
  ok((await sent()).some(m => (m.cmd === 'play' || m.cmd === 'install') && m.id === s2), 'A startet bzw. installiert das gewählte Spiel');
  const v0 = await p.evaluate(() => document.querySelector('#nav .on').dataset.view); await press(5);
  const v1 = await p.evaluate(() => document.querySelector('#nav .on').dataset.view); await press(4);
  ok(v0 !== v1 && await p.evaluate(() => document.querySelector('#nav .on').dataset.view) === v0, 'LB/RB wechseln die Ansicht');
  for (let i = 0; i < 8; i++) await press(L);
  ok(await inside('.side'), 'links am Rand: Seitenleiste');
  await press(D); await press(D);
  ok(await inside('.side'), 'Seitenleiste mit dem Steuerkreuz bedienbar');
  if (OUT) await p.screenshot({ path: path.join(OUT, 'launcher-controller-seitenleiste.png') });
  await press(1);
  ok(await inside('.grid'), 'B: zurück ins Raster');
  await press(3);
  ok(await inside('#det'), 'Y: Optionen des Spiels (Details)');
  await press(D);
  ok(await inside('#det'), 'Details mit dem Steuerkreuz bedienbar');
  if (OUT) await p.screenshot({ path: path.join(OUT, 'launcher-controller-details.png') });
  await press(1);
  ok(await inside('.grid'), 'B: aus den Details zurück');
  await press(9);
  ok(await p.isVisible('#ttDlg'), 'Start öffnet TikTok LIVE');
  await press(1);
  ok(await p.isHidden('#ttDlg'), 'B schließt das TikTok-Fenster');
  await press(8);
  ok(await p.isVisible('#padDlg'), 'Select öffnet Controller einrichten');
  await press(D);
  ok(await inside('#padDlg'), 'Controller-Fenster mit dem Steuerkreuz bedienbar');
  await press(1);
  ok(await p.isHidden('#padDlg'), 'B schließt das Controller-Fenster');
  await press(R);
  ok(await inside('.grid'), 'nach dem Schließen: zurück ins Raster');
  ok(!errs.length, 'keine Fehler ' + errs.join(' | '));
  await b.close();
  console.log(fails ? fails + ' Fehler' : 'alles ok'); process.exit(fails ? 1 : 0);
})();
