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
    await s.click('[data-gift="Money Gun"]'); await s.click('[data-troll="invert:10"]');
    ok(await s.evaluate(() => { const r = [...document.querySelectorAll('#ttGifts tr')]; return r.some(x => x.querySelector('[data-k="gift"]').value === 'Money Gun' && x.querySelector('[data-k="action"]').value === 'invert:10'); }), 'Geschenk aus der Liste antippen, Streich zuweisen');
    if (SHOTS) { await s.evaluate(() => document.querySelector('#ttTrolls').scrollIntoView()); await s.screenshot({ path: path.join(SHOTS, 'tiktok-einstellungen.png') }); }
    await s.click('[data-tab="o"]'); await s.click('[data-preset="16x9,all,frame,0"]');
    ok(/stream\.html\?game=deluxe-2048&tiktok=[^&]+&format=16x9$/.test(await s.inputValue('#ttUrl')) && /^https:\/\/ricorewioriginal-collab\.github\.io\/easygames\//.test(await s.inputValue('#ttUrl')), 'Overlay-Adresse 16:9 über die easygames-Homepage');
    await s.click('[data-preset="9x16,info,full,1"]');
    ok(/view=info&layout=full&bg=clear/.test(await s.inputValue('#ttUrl')), 'Vorlage „nur Einblendungen“ (zweite Quelle)');
    if (SHOTS) await s.screenshot({ path: path.join(SHOTS, 'tiktok-overlay-ansichten.png') });
    await s.click('[data-tab="t"]'); if (SHOTS) await s.screenshot({ path: path.join(SHOTS, 'tiktok-streiche.png') });
    await s.click('[data-tab="g"]');
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
    // Streiche: echte Pfeiltaste vertauscht, Zeitlupe
    await p.evaluate(() => { const w = EG_STREAM.frame.contentWindow; w.__keys = []; w.addEventListener('keydown', e => w.__keys.push(e.code)); EG_TIKTOK.run('invert:5'); });
    await p.evaluate(() => { const w = EG_STREAM.frame.contentWindow; w.dispatchEvent(new w.KeyboardEvent('keydown', { code: 'ArrowLeft', key: 'ArrowLeft', bubbles: true })); });
    await p.locator('#game').focus(); await p.keyboard.press('ArrowLeft'); await sleep(200);
    ok(await p.evaluate(() => EG_STREAM.frame.contentWindow.__keys.includes('ArrowRight')), 'invert: echte Taste ← kommt als → im Spiel an');
    const t1 = await p.evaluate(async () => { EG_TIKTOK.run('slow:3'); const w = EG_STREAM.frame.contentWindow, a = w.performance.now(); await new Promise(r => setTimeout(r, 1000)); return w.performance.now() - a; });
    ok(t1 > 250 && t1 < 600, 'Zeitlupe: Spielzeit läuft langsamer (' + Math.round(t1) + ' ms in 1 s)');
    // Eigener Stream-Spielstand: echte Stände bleiben unberührt, Cloud-Abgleich pausiert
    await p.evaluate(k => { const w = EG_STREAM.frame.contentWindow; w.localStorage.setItem(k + 'echt', 'ECHT'); }, pre);
    const cfg = JSON.parse(fs.readFileSync(cfgFile, 'utf8')); cfg.streamSave = true; cfg.games['deluxe-2048'].streamSave = true;
    await new Promise(res => { const w = new WebSocket('ws://127.0.0.1:' + port); w.onopen = () => { w.send(JSON.stringify({ type: 'setConfig', config: cfg })); setTimeout(() => { w.close(); res(); }, 200); }; });
    await sleep(2500);
    const sv = await p.evaluate(k => ({ cur: localStorage.getItem(k + 'echt'), real: localStorage.getItem('eg-real:' + k + 'echt'), flag: !!localStorage.getItem('eg-stream-save:deluxe-2048') }), pre);
    ok(sv.cur === null && sv.real === 'ECHT' && sv.flag, 'Stream-Spielstand: echter Stand beiseitegelegt, Cloud pausiert');
    await p.evaluate(k => localStorage.setItem(k + 'echt', 'STREAM'), pre);
    cfg.streamSave = false; cfg.games['deluxe-2048'].streamSave = false;
    await new Promise(res => { const w = new WebSocket('ws://127.0.0.1:' + port); w.onopen = () => { w.send(JSON.stringify({ type: 'setConfig', config: cfg })); setTimeout(() => { w.close(); res(); }, 200); }; });
    await sleep(2500);
    const sv2 = await p.evaluate(k => ({ cur: localStorage.getItem(k + 'echt'), stream: localStorage.getItem('eg-stream:' + k + 'echt'), flag: !!localStorage.getItem('eg-stream-save:deluxe-2048') }), pre);
    ok(sv2.cur === 'ECHT' && sv2.stream === 'STREAM' && !sv2.flag, 'aus: echter Stand zurück, Stream-Stand aufgehoben');
    for (let i = 0; i < 7; i++) await inject({ type: 'like', user: 'Ben', count: 15 }); await sleep(800);
    ok(/100 Likes/.test(await p.textContent('.tt-feed')), 'Like-Leiste löst bei 100 Likes aus');
    // Neue Streiche: keine Fehler, Steuerung weg sperrt echte Tasten, Bombe vom Chat entschärft, Top-Fans, Teilen
    await p.evaluate(() => EG_TIKTOK.run('drunk:2+tilt:2+ghost:2+fog:2+scare+crash+dance:2+blur:2+drift:2')); await sleep(600);
    ok(await p.evaluate(() => !!document.querySelector('.tt-crash') && /ttDance|ttDrunk/.test(EG_STREAM.frame.style.animation)), 'neue Streiche: Absturz, Tanzen/Betrunken');
    await p.evaluate(() => { const w = EG_STREAM.frame.contentWindow; w.__keys = []; EG_TIKTOK.run('nokeys:3'); });
    await sleep(200); await p.locator('#game').focus(); await p.keyboard.press('ArrowUp'); await sleep(200);
    ok(await p.evaluate(() => !EG_STREAM.frame.contentWindow.__keys.includes('ArrowUp') && !!EG_STREAM.frame.contentWindow.EasyGamesPadNormal.troll.block), 'Steuerung weg: Taste und Controller gesperrt');
    await sleep(3000);
    await p.evaluate(() => EG_TIKTOK.run('bomb:30', 'Lina')); await sleep(300);
    ok(/retten/.test(await p.textContent('.tt-bomb')), 'Bombe zeigt Countdown');
    for (const u of ['A1', 'A2', 'A3', 'A4', 'A5']) await inject({ type: 'chat', user: u, text: '!retten' }); await sleep(700);
    ok(!(await p.$('.tt-bomb')) && /entschärft/.test(await p.evaluate(() => [...document.querySelectorAll('.tt-ban')].map(x => x.textContent).join('|'))), 'Chat entschärft die Bombe');
    ok(/Leon/.test(await p.textContent('.tt-top')), 'Top-Fans zeigt Spender');
    await inject({ type: 'share', user: 'Kim' }); await sleep(500);
    ok(/Kim teilt/.test(await p.textContent('.tt-feed')), 'Teilen löst Aktion aus');
    if (SHOTS) await p.screenshot({ path: path.join(SHOTS, 'tiktok-overlay-9x16.png') });
    // Ansichten und 16:9
    const vi = await (await b.newContext({ viewport: { width: 432, height: 768 } })).newPage(); vi.on('pageerror', x => errs.push('info: ' + x.message));
    await vi.goto(base + '&view=info&layout=full'); await vi.waitForSelector('.tt-leg'); await sleep(800);
    await inject({ type: 'gift', user: 'Ida', gift: 'Perfume', count: 1 }); await sleep(800);
    ok(!(await vi.$('#game')) && await vi.isVisible('.tt-leg') && /Ida/.test(await vi.textContent('.tt-feed')), 'Ansicht „nur Einblendungen“: ohne Spiel, Legende und Ereignisse');
    const vg = await (await b.newContext({ viewport: { width: 432, height: 768 } })).newPage(); vg.on('pageerror', x => errs.push('game: ' + x.message));
    await vg.goto(base + '&view=game'); await sleep(1500);
    ok(await vg.$('#game') && !(await vg.isVisible('.tt-leg')), 'Ansicht „nur Spiel“: Spiel ohne Legende');
    const vl = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage(); vl.on('pageerror', x => errs.push('16x9: ' + x.message));
    await vl.goto(base + '&format=16x9'); await vl.waitForSelector('.tt-leg'); await sleep(1500);
    ok(await vl.evaluate(() => getComputedStyle(document.querySelector('.tt-leg')).right) === '258px', '16:9: Legende neben der Seitenleiste');
    if (SHOTS) await vl.screenshot({ path: path.join(SHOTS, 'tiktok-overlay-16x9.png') });
    // Eingebettet (Windows-App): Skript direkt im Spielfenster, Geschenk wirkt dort
    const e = await (await b.newContext({ viewport: { width: 800, height: 600 } })).newPage();
    e.on('pageerror', x => errs.push('eingebettet: ' + x.message));
    // genau so, wie die Windows-App es einspielt (TikTok.cs EmbedScript, vor dem Laden der Seite, nur oberste Seite)
    await e.addInitScript('if (window === window.top) { window.EG_TIKTOK_EMBED = ' + JSON.stringify({ ws: 'ws://127.0.0.1:' + port, id: 'deluxe-2048', title: '2048', setup: false }) + ';\n' + fs.readFileSync(path.join(ROOT, 'stream-tiktok.js'), 'utf8') + '\n}');
    await e.goto('http://127.0.0.1:' + srv.address().port + '/deluxe-2048/'); await e.waitForSelector('.tt-leg'); await sleep(1500);
    await e.waitForFunction(() => /verbunden/.test(document.querySelector('.tt-state').textContent) && !/nicht/.test(document.querySelector('.tt-state').textContent), null, { timeout: 8000 }).catch(() => { });
    await inject({ type: 'gift', user: 'Noah', gift: 'Perfume', count: 1 });
    const fe = await e.waitForFunction(() => /Noah: 🌹 Perfume/.test(document.querySelector('.tt-feed').textContent), null, { timeout: 4000 }).then(() => true, () => false);
    const pe = await e.waitForFunction(() => !!navigator.getGamepads()[3], null, { timeout: 4000 }).then(() => true, () => false);
    ok(fe && pe, 'Windows-App (eingebettet): Legende, Ereignis' + (fe ? '' : ' [fehlt]') + ' und virtueller Controller' + (pe ? '' : ' [fehlt]') + ' im Spielfenster');
    const eb = () => e.evaluate(() => document.querySelector('#board, .board, main, body').innerText + '|' + JSON.stringify(localStorage));
    const e0 = await eb(); for (const w of ['rechts', 'runter', 'links', 'hoch']) { await inject({ type: 'chat', user: 'Mia', text: w }); await sleep(700); }
    const ef = await e.evaluate(() => /Mia/.test(document.querySelector('.tt-feed').textContent));
    ok(ef && (await eb()) !== e0, 'Windows-App (eingebettet): Chat-Befehle steuern das Spiel im Spielfenster');
    ok(!errs.length, 'keine Fehler ' + errs.join(' | '));
    // Was „A drücken“ im jeweiligen Spiel bedeutet: Kart Rush (A = Gas · Bestätigen) – in der Legende und in den Einstellungen
    const kb = base.replace('game=deluxe-2048', 'game=anmacha-kart');
    const kl = await (await b.newContext({ viewport: { width: 1000, height: 900 } })).newPage(); await kl.goto(kb); await kl.waitForSelector('.tt-leg'); await kl.waitForFunction(() => /A drücken \(/.test(document.querySelector('.tt-leg').textContent), null, { timeout: 15000 }).catch(() => { });   // Kart Rush lädt seine Belegung erst nach dem Start
    const legT = await kl.textContent('.tt-leg'); ok(/A drücken \(Gas/.test(legT), 'Legende zeigt, was A in Kart Rush macht: ' + (legT.match(/A drücken[^→]*/) || [''])[0]);
    const ks = await (await b.newContext({ viewport: { width: 1000, height: 900 } })).newPage(); await ks.goto(kb + '&setup=1'); await ks.waitForSelector('#ttSet'); await sleep(4500);
    await ks.evaluate(() => { const i = document.querySelector('#ttGifts input[list="ttAct"]'); i.dispatchEvent(new Event('input', { bubbles: true })); });
    const mean = await ks.evaluate(() => [...document.querySelectorAll('#ttSet .mean')].map(x => x.textContent).filter(Boolean));
    ok(mean.some(t => /Kart Rush.*Gas/.test(t)), 'Einstellungen: Hinweis unter der Aktion: ' + mean[0]);
    if (SHOTS) await ks.screenshot({ path: path.join(SHOTS, 'tiktok-tastenhinweis.png') });
  } finally { await b.close(); bridge.kill(); srv.close(); try { fs.unlinkSync(cfgFile); } catch (e) { } }
  console.log(fails ? fails + ' Fehler' : 'alles ok'); process.exit(fails ? 1 : 0);
})();
