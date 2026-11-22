// Test der Sounds in der TikTok-Steuerung (stream-tiktok.js „🔊 Sounds“ + Brücke): Bibliothek von myinstants.com laden
// (Beste, Suche, Seiten, Details), vorhören, merken, einem Ereignis zuweisen, speichern und im LIVE abspielen.
// Braucht Internet (myinstants.com).   NODE_PATH=$(npm root -g) node tools/test-tiktok-sounds.cjs [Screenshot-Ordner]   (TT_BRIDGE=py: Python-Brücke)
const path = require('path'), fs = require('fs'), http = require('http'), os = require('os');
const { spawn } = require('child_process');
const { chromium } = require('playwright');
const ROOT = path.join(__dirname, '..'), SHOTS = process.argv[2] || '';
let fails = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FEHL ') + m); if (!c) fails++; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
// Abgespielte Sounds mitschreiben statt wirklich abspielen (der Testbrowser hat keinen Ton)
const AUDIO_HOOK = () => { window.__snd = []; window.Audio = function (src) { const a = { src, volume: 1, paused: false, ended: false, preload: '', play() { window.__snd.push({ src, vol: a.volume }); return Promise.resolve(); }, pause() { a.paused = true; } }; return a; }; };

(async () => {
  const srv = http.createServer((q, r) => {
    let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
    const f = path.join(ROOT, p); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.statusCode = 404; return r.end(); }
    r.setHeader('Content-Type', { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json' }[path.extname(f)] || 'application/octet-stream');
    fs.createReadStream(f).pipe(r);
  }).listen(0, '127.0.0.1');
  await new Promise(r => srv.once('listening', r));
  const port = 22300 + Math.floor(Math.random() * 500), cfgFile = path.join(os.tmpdir(), 'eg-tiktok-snd-' + port + '.json');
  const PY = process.env.TT_BRIDGE === 'py';
  const bridge = spawn(PY ? (process.env.PYTHON || 'python3') : process.execPath, [path.join(__dirname, PY ? 'tiktok-bridge.py' : 'tiktok-bridge.mjs'), '--test', '--port', String(port), '--config', cfgFile], { stdio: 'ignore' });
  await sleep(PY ? 1500 : 700);
  const inject = ev => new Promise((res, rej) => { const w = new WebSocket('ws://127.0.0.1:' + port); w.onopen = () => { w.send(JSON.stringify({ type: 'inject', ev })); setTimeout(() => { w.close(); res(); }, 100); }; w.onerror = rej; });
  const b = await chromium.launch(), errs = [];
  const ctx = async v => { const c = await b.newContext({ viewport: v, deviceScaleFactor: SHOTS ? 2 : 1 }); await c.addInitScript(AUDIO_HOOK);
    await c.route('**/easygames/tiktok-gifts.json*', r => r.fulfill({ path: path.join(ROOT, 'tiktok-gifts.json'), contentType: 'application/json' })); return c; };
  const base = 'http://127.0.0.1:' + srv.address().port + '/stream.html?game=deluxe-2048&tiktok=ws://127.0.0.1:' + port;
  try {
    const s = await (await ctx({ width: 1100, height: 950 })).newPage(); s.on('pageerror', e => errs.push(e.message));
    await s.goto(base + '&setup=1'); await s.waitForSelector('#ttSet');
    await s.waitForFunction(() => /verbunden/.test(document.querySelector('#ttConn').textContent) && !/nicht/.test(document.querySelector('#ttConn').textContent));
    await s.click('[data-tab="s"]');
    await s.waitForFunction(() => document.querySelectorAll('#ttSndList .snd').length > 0 || /⚠️/.test(document.querySelector('#ttSndMsg').textContent), null, { timeout: 40000 });
    const best = await s.$$eval('#ttSndList .snd', l => l.length);
    ok(best >= 20, 'Reiter „🔊 Sounds“ lädt „Beste aller Zeiten“ für Deutschland über die Brücke (' + best + ' Sounds, ' + await s.textContent('#ttSndMsg') + ')');
    // Trends, Neu, Suche mit Seiten
    for (const [req, label] of [['trending', 'Trends'], ['recent', 'Neu hochgeladen']]) {
      await s.selectOption('#ttSndReq', req); await s.waitForFunction(() => !/Lade/.test(document.querySelector('#ttSndMsg').textContent), null, { timeout: 40000 });
      ok(await s.$$eval('#ttSndList .snd', l => l.length) >= 20, label + ' geladen (' + await s.textContent('#ttSndMsg') + ')');
    }
    await s.selectOption('#ttSndReq', 'search'); await s.fill('#ttSndQ', 'airhorn'); await s.click('#ttSndGo');
    await s.waitForFunction(() => !/Lade/.test(document.querySelector('#ttSndMsg').textContent), null, { timeout: 40000 });
    const first = await s.$eval('#ttSndList .snd', e => e.dataset.t);
    ok(/airhorn/i.test(first), 'Suche „airhorn“ (' + first + ')');
    const nx = await s.$('#ttSndPager [data-pg="1"]'); ok(!!nx, 'weitere Seiten');
    if (nx) { await nx.click(); await s.waitForFunction(() => /Seite 2/.test(document.querySelector('#ttSndPager').textContent), null, { timeout: 40000 }); ok(true, 'Seite 2 geladen'); await s.click('#ttSndPager [data-pg="-1"]'); await s.waitForFunction(() => /Seite 1/.test(document.querySelector('#ttSndPager').textContent), null, { timeout: 40000 }); }
    // Details, Vorhören, Merken
    await s.click('#ttSndList .snd [data-si]'); await s.waitForFunction(() => /👁/.test((document.querySelector('#ttSndList .snd .info') || {}).textContent || ''), null, { timeout: 40000 });
    ok(true, 'Details: ' + (await s.textContent('#ttSndList .snd .info')).replace(/\s+/g, ' ').slice(0, 90));
    await s.click('#ttSndList .snd [data-sp]'); const pv = await s.evaluate(() => window.__snd.slice(-1)[0]);
    ok(pv && /^https:\/\/www\.myinstants\.com\/media\/sounds\/.+\.mp3$/.test(pv.src), 'Vorhören spielt das MP3 von myinstants (' + (pv && pv.src) + ')');
    await s.click('#ttSndList .snd [data-sp]');
    await s.click('#ttSndList .snd [data-sf]'); ok(await s.$$eval('#ttSndMine .snd', l => l.length) === 1, '⭐ Meine Sounds');
    // Zuweisen: Follow und ein Geschenk (Rose) – Rose behält ihre Aktion, der Sound kommt dazu
    await s.selectOption('#ttSndTo', '#ttFollow'); await s.click('#ttSndList .snd [data-sa]');
    const fol = await s.inputValue('#ttFollow'); ok(/^say:.*\+snd:.+\.mp3$/.test(fol), 'Sound zum Follow dazu (' + fol.slice(0, 80) + ')');
    const rose = await s.evaluate(() => { const o = [...document.querySelectorAll('#ttSndTo option')].find(o => o.textContent === '🎁 Rose'); return o && o.value; });
    await s.selectOption('#ttSndTo', rose); await s.click('#ttSndList .snd:nth-child(2) [data-sa]');
    const ra = await s.$eval('#ttGifts tr', r => r.querySelector('[data-k="action"]').value); ok(/^pad:A\+fx:rain:🌹\+snd:.+/.test(ra), 'Sound zu einem Geschenk (Rose) dazu (' + ra.slice(0, 70) + ')');
    await s.fill('#ttSndVol', '55'); await s.dispatchEvent('#ttSndVol', 'input');
    // Aktions-Auswahl (▾) kennt „Meine Sounds“; Chat-Befehl bekommt den Sound per Auswahl
    await s.click('[data-tab="c"]'); const cmdSel = s.locator('#ttCmds tr').first().locator('[data-pick]');
    const opt = await cmdSel.evaluate(e => { const g = [...e.querySelectorAll('optgroup')].find(g => /Meine Sounds/.test(g.label)); return g && g.querySelector('option').value; });
    ok(!!opt, '▾-Auswahl enthält „🔊 Meine Sounds“'); if (opt) await cmdSel.selectOption(opt);
    const ca = await s.locator('#ttCmds tr').first().locator('[data-k="1"]').inputValue(); ok(/^pad:LEFT\+snd:/.test(ca), 'Chat-Befehl: Sound kommt zur Aktion dazu (' + ca + ')');
    ok(/🔊/.test(await s.locator('#ttCmds tr').first().locator('.mean').textContent()), 'Anzeige unter der Aktion nennt den Sound');
    if (SHOTS) { await s.click('[data-tab="s"]'); await sleep(400); await s.screenshot({ path: path.join(SHOTS, 'tiktok-sounds.png') }); }
    await s.click('#ttSave'); await sleep(500);
    const saved = JSON.parse(fs.readFileSync(cfgFile, 'utf8'));
    ok(saved.sound && saved.sound.vol === 55 && saved.soundLib.length === 1 && /snd:/.test(saved.follow), 'gespeichert an der Brücke (Lautstärke, Meine Sounds, Follow)');
    // Overlay: Follow, Rose und Chat spielen den Sound mit 55 %; ×5-Geschenk nur einmal; Einblendungs-Quelle spielt nichts
    const p = await (await ctx({ width: 432, height: 768 })).newPage(); p.on('pageerror', e => errs.push(e.message));
    const q = await (await ctx({ width: 432, height: 768 })).newPage(); await q.goto(base + '&view=info&bg=clear');
    await p.goto(base); await p.waitForSelector('.tt-leg'); await sleep(1500);
    await inject({ type: 'follow', user: 'Mia' }); await sleep(400);
    await inject({ type: 'gift', user: 'Ben', gift: 'Rose', count: 5 }); await sleep(400);
    await inject({ type: 'chat', user: 'Lina', text: 'links' }); await sleep(800);
    const played = await p.evaluate(() => window.__snd);
    ok(played.length === 3 && played.every(x => /myinstants\.com\/media\/sounds\//.test(x.src) && Math.abs(x.vol - 0.55) < 0.01), 'LIVE: Follow, Rose ×5 (einmal) und Chat spielen ihren Sound mit 55 % (' + played.length + ')');
    ok((await q.evaluate(() => window.__snd.length)) === 0, 'Einblendungs-Quelle spielt keine Sounds doppelt');
    // Aus: nichts
    const c2 = JSON.parse(fs.readFileSync(cfgFile, 'utf8')); c2.sound.on = false;
    await new Promise(res => { const w = new WebSocket('ws://127.0.0.1:' + port); w.onopen = () => { w.send(JSON.stringify({ type: 'setConfig', config: c2 })); setTimeout(() => { w.close(); res(); }, 300); }; });
    await sleep(300); await inject({ type: 'follow', user: 'Noah' }); await sleep(500);
    ok((await p.evaluate(() => window.__snd.length)) === 3, '„Sounds abspielen“ aus → still');
    ok(!errs.length, 'keine Skriptfehler' + (errs.length ? ': ' + errs.join(' | ') : ''));
  } finally { await b.close(); bridge.kill(); srv.close(); try { fs.unlinkSync(cfgFile); } catch (e) { } }
  console.log(fails ? fails + ' Fehler' : 'alles ok'); process.exit(fails ? 1 : 0);
})();
