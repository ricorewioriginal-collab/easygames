// Test der TikTok-Steuerung im Stream-Overlay (stream-tiktok.js + tools/tiktok-bridge.mjs) mit simulierten LIVE-Ereignissen.
//   NODE_PATH=$(npm root -g) node tools/test-stream-tiktok.cjs [Screenshot-Ordner]
const path = require('path'), fs = require('fs'), http = require('http'), os = require('os');
const { spawn } = require('child_process');
const { chromium } = require('playwright');
const ROOT = path.join(__dirname, '..'), SHOTS = process.argv[2] || '';
let fails = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FEHL ') + m); if (!c) fails++; };
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const srv = http.createServer((q, r) => {
    let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
    const f = path.join(ROOT, p); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.statusCode = 404; return r.end(); }
    r.setHeader('Content-Type', { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json' }[path.extname(f)] || 'application/octet-stream');
    fs.createReadStream(f).pipe(r);
  }).listen(0, '127.0.0.1');
  await new Promise(r => srv.once('listening', r));
  const port = 21300 + Math.floor(Math.random() * 500), cfgFile = path.join(os.tmpdir(), 'eg-tiktok-test-' + port + '.json');
  const bridge = spawn(process.execPath, [path.join(__dirname, 'tiktok-bridge.mjs'), '--test', '--port', String(port), '--config', cfgFile], { stdio: 'ignore' });
  await sleep(600);
  const inject = ev => new Promise((res, rej) => { const w = new WebSocket('ws://127.0.0.1:' + port); w.onopen = () => { w.send(JSON.stringify({ type: 'inject', ev })); setTimeout(() => { w.close(); res(); }, 100); }; w.onerror = rej; });
  const b = await chromium.launch();
  const base = 'http://127.0.0.1:' + srv.address().port + '/stream.html?game=deluxe-2048&tiktok=ws://127.0.0.1:' + port;
  try {
    // Einstellungen: Geschenk „Galaxy“ = Neustart nur für 2048, dazu Rose = rechts; speichern geht an die Brücke
    const s = await (await b.newContext({ viewport: { width: 1000, height: 900 } })).newPage();
    await s.goto(base + '&setup=1'); await s.waitForSelector('#ttSet');
    await s.waitForFunction(() => /verbunden/.test(document.querySelector('#ttConn').textContent) && !/nicht/.test(document.querySelector('#ttConn').textContent));
    await s.selectOption('#ttScope', 'game');
    await s.click('[data-add="g"]');
    const last = s.locator('#ttGifts tr').last();
    await last.locator('[data-k="icon"]').fill('🌹'); await last.locator('[data-k="gift"]').fill('Perfume'); await last.locator('[data-k="action"]').fill('pad:RIGHT'); await last.locator('[data-k="label"]').fill('nach rechts');
    if (SHOTS) await s.screenshot({ path: path.join(SHOTS, 'tiktok-einstellungen.png') });
    await s.click('#ttSave'); await sleep(300);
    const saved = JSON.parse(fs.readFileSync(cfgFile, 'utf8'));
    ok(saved.games && saved.games['deluxe-2048'] && saved.games['deluxe-2048'].gifts.some(g => g.gift === 'Perfume' && g.action === 'pad:RIGHT'), 'Einstellung je Spiel in der Brücke gespeichert');

    // Overlay (wie OBS): Legende, Chat-Befehl bewegt das Spiel, Geschenk mit Anzahl, Galaxy startet neu
    const p = await (await b.newContext({ viewport: { width: 432, height: 768 } })).newPage();
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(base); await p.waitForSelector('.tt-leg'); await sleep(2500);
    ok(/Galaxy/.test(await p.textContent('.tt-leg')) && /Perfume/.test(await p.textContent('.tt-leg')), 'Geschenke-Legende im Overlay (mit Spiel-Belegung)');
    const board = () => p.evaluate(() => { const d = EG_STREAM.frame.contentWindow.document; return d.body.innerText + '|' + JSON.stringify(EG_STREAM.frame.contentWindow.localStorage); });
    await p.evaluate(() => { EG_STREAM.frame.contentWindow.__mark = 1; });
    const b0 = await board();
    for (const w of ['rechts', 'runter', 'links', 'hoch']) { await inject({ type: 'chat', user: 'Mia', text: w + ' bitte' }); await sleep(700); }
    const pad = await p.evaluate(() => { const w = EG_STREAM.frame.contentWindow, g = w.navigator.getGamepads()[3]; return !!(w.EasyGamesPadNormal && g && /virtuell/.test(g.id)); });
    ok(pad, 'virtueller Controller im Spiel angemeldet');
    ok((await board()) !== b0, 'Chat-Befehle bewegen das Spiel');
    await inject({ type: 'gift', user: 'Leon', gift: 'Perfume', count: 2 }); await sleep(1500);
    ok(/Leon: 🌹 Perfume ×2 → nach rechts/.test(await p.textContent('.tt-feed')), 'Geschenk mit Anzahl in der Ereignis-Liste');
    if (SHOTS) await p.screenshot({ path: path.join(SHOTS, 'tiktok-overlay.png') });
    await inject({ type: 'gift', user: 'Emma', gift: 'Galaxy', count: 1 }); await sleep(2000);
    ok(await p.evaluate(() => EG_STREAM.frame.contentWindow.__mark === undefined), 'Galaxy startet das Spiel neu');
    // Effekte, Spielstand löschen (mit Sicherung) und Wiederherstellen
    await p.evaluate(() => EG_TIKTOK.run('fx:flip:5+fx:shake', 'Test')); await sleep(300);
    ok(await p.evaluate(() => /rotate/.test(EG_STREAM.frame.style.transform) && /ttShake/.test(EG_STREAM.frame.style.animation)), 'Effekte: Bild gedreht und wackelt');
    await p.evaluate(() => EG_TIKTOK.run('fx:flip:0'));
    const pre = (JSON.parse(fs.readFileSync(path.join(ROOT, 'sync', 'catalog.json'), 'utf8')).games.find(g => g.id === 'deluxe-2048').cloud.prefix || '').split(',')[0];
    await p.evaluate(k => EG_STREAM.frame.contentWindow.localStorage.setItem(k + 'testsave', '42'), pre);
    await p.evaluate(() => EG_TIKTOK.run('reset', 'Mia')); await sleep(2500);
    ok(await p.evaluate(k => EG_STREAM.frame.contentWindow.localStorage.getItem(k + 'testsave'), pre) === null, 'reset löscht den Spielstand (' + pre + '…)');
    await p.evaluate(() => EG_TIKTOK.restore()); await sleep(1500);
    ok(await p.evaluate(k => EG_STREAM.frame.contentWindow.localStorage.getItem(k + 'testsave'), pre) === '42', 'Wiederherstellen bringt ihn zurück');
    for (let i = 0; i < 7; i++) await inject({ type: 'like', user: 'Ben', count: 15 }); await sleep(800);
    ok(/100 Likes/.test(await p.textContent('.tt-feed')), 'Like-Leiste löst bei 100 Likes aus');
    // Eingebettet (Windows-App): Skript direkt im Spielfenster, Geschenk wirkt dort
    const e = await (await b.newContext({ viewport: { width: 800, height: 600 } })).newPage();
    e.on('pageerror', x => errs.push('eingebettet: ' + x.message));
    await e.addInitScript('window.EG_TIKTOK_EMBED = ' + JSON.stringify({ ws: 'ws://127.0.0.1:' + port, id: 'deluxe-2048', title: '2048' }) + ';\n' + fs.readFileSync(path.join(ROOT, 'stream-tiktok.js'), 'utf8'));
    await e.goto('http://127.0.0.1:' + srv.address().port + '/deluxe-2048/'); await e.waitForSelector('.tt-leg'); await sleep(1500);
    await inject({ type: 'gift', user: 'Noah', gift: 'Perfume', count: 1 }); await sleep(1500);
    ok(/Noah: 🌹 Perfume/.test(await e.textContent('.tt-feed')) && await e.evaluate(() => !!(navigator.getGamepads()[3])), 'Windows-App (eingebettet): Legende, Ereignis und virtueller Controller im Spielfenster');
    ok(!errs.length, 'keine Fehler ' + errs.join(' | '));
  } finally { await b.close(); bridge.kill(); srv.close(); try { fs.unlinkSync(cfgFile); } catch (e) { } }
  console.log(fails ? fails + ' Fehler' : 'alles ok'); process.exit(fails ? 1 : 0);
})();
