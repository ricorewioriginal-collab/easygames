// Test der Telegram-Mini-App (telegram.js + index.html): außerhalb von Telegram passiert nichts; in Telegram öffnet der Startlink
// (?startapp=<spiel-id>) das Spiel, die App geht groß auf, Wischen schließt nicht, Telegrams Zurück-Knopf schließt das Spiel.
//   NODE_PATH=$(npm root -g) node tools/test-telegram.cjs [Screenshot-Ordner]
const path = require('path'), fs = require('fs'), http = require('http');
const { chromium } = require('playwright');
const ROOT = path.join(__dirname, '..'), SHOTS = process.argv[2] || '';
let fails = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FEHL ') + m); if (!c) fails++; };
const FAKE = `window.__tg=[];window.Telegram={WebApp:{version:'8.0',isVersionAtLeast:v=>parseFloat(v)<=8,
  ready(){__tg.push('ready')},expand(){__tg.push('expand')},disableVerticalSwipes(){__tg.push('noswipe')},setHeaderColor(c){__tg.push('header:'+c)},
  setBackgroundColor(c){__tg.push('bg:'+c)},setBottomBarColor(c){__tg.push('bottom:'+c)},
  BackButton:{isVisible:false,show(){this.isVisible=true},hide(){this.isVisible=false},onClick(f){window.__tgBack=f}}}};`;
(async () => {
  const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'; const f = path.join(ROOT, p);
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.statusCode = 404; return r.end(); }
    r.setHeader('Content-Type', { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.webp': 'image/webp', '.jpg': 'image/jpeg' }[path.extname(f)] || 'application/octet-stream'); fs.createReadStream(f).pipe(r); }).listen(0, '127.0.0.1');
  await new Promise(r => srv.once('listening', r));
  const base = 'http://127.0.0.1:' + srv.address().port + '/';
  const b = await chromium.launch(), errs = [];
  try {
    const page = async () => { const c = await b.newContext({ viewport: { width: 412, height: 860 }, deviceScaleFactor: SHOTS ? 2 : 1 }); const loads = [];
      await c.route('https://telegram.org/js/telegram-web-app.js', r => { loads.push(1); r.fulfill({ contentType: 'text/javascript', body: FAKE }); });
      const p = await c.newPage(); p.on('pageerror', e => errs.push(e.message)); return { p, loads }; };
    // 1) normal im Browser: nichts
    const n = await page(); await n.p.goto(base); await n.p.waitForTimeout(1500);
    ok(n.loads.length === 0 && !(await n.p.evaluate(() => !!window.EG_TG)), 'außerhalb von Telegram: nichts geladen, nichts verändert');
    // 2) in Telegram mit Startlink
    const t = await page();
    await t.p.goto(base + '#tgWebAppData=query_id%3DAA%26user%3D%257B%2522id%2522%253A1%257D&tgWebAppVersion=8.0&tgWebAppPlatform=android&tgWebAppStartParam=deluxe-2048');
    await t.p.waitForFunction(() => !document.getElementById('viewer').classList.contains('hidden'), null, { timeout: 8000 }).catch(() => {});
    ok(t.loads.length === 1, 'in Telegram: telegram-web-app.js geladen');
    ok(/deluxe-2048/.test(await t.p.$eval('#frame', f => f.src)), 'Startlink ?startapp=deluxe-2048 öffnet das Spiel');
    const calls = await t.p.evaluate(() => window.__tg);
    ok(['ready', 'expand', 'noswipe', 'header:#080B12', 'bg:#080B12'].every(x => calls.includes(x)), 'groß geöffnet, Wischen gesperrt, Farben wie easygames (' + calls.join(', ') + ')');
    await t.p.waitForTimeout(800);
    ok(await t.p.evaluate(() => Telegram.WebApp.BackButton.isVisible), 'Zurück-Knopf sichtbar, solange das Spiel offen ist');
    if (SHOTS) await t.p.screenshot({ path: path.join(SHOTS, 'telegram-spiel.png') });
    await t.p.evaluate(() => window.__tgBack()); await t.p.waitForTimeout(600);
    ok(await t.p.evaluate(() => document.getElementById('viewer').classList.contains('hidden') && !Telegram.WebApp.BackButton.isVisible), 'Zurück-Knopf schließt das Spiel und verschwindet');
    if (SHOTS) await t.p.screenshot({ path: path.join(SHOTS, 'telegram-liste.png') });
    ok(await t.p.evaluate(() => shareLink(GAMES.find(g => g.id === 'deluxe-2048'))) === 'https://t.me/easygames_ricorewiBot?startapp=deluxe-2048', '„Spiel teilen“ in Telegram = Startlink des Bots');
    ok(!/t\.me/.test(await n.p.evaluate(() => shareLink(GAMES.find(g => g.id === 'deluxe-2048')))), 'außerhalb von Telegram bleibt der Teilen-Link wie bisher');
    // 3) in Telegram ohne Startlink: Liste, Spiel per Tipp, Zurück
    const u = await page(); await u.p.goto(base + '#tgWebAppData=x&tgWebAppVersion=8.0&tgWebAppPlatform=tdesktop'); await u.p.waitForTimeout(1500);
    ok(await u.p.evaluate(() => document.getElementById('viewer').classList.contains('hidden')), 'ohne Startlink: Spieleliste');
    ok(!errs.length, 'keine Skriptfehler' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  } finally { await b.close(); srv.close(); }
  console.log(fails ? fails + ' Fehler' : 'alles ok'); process.exit(fails ? 1 : 0);
})();
