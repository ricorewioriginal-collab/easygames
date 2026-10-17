// End-to-End-Test im echten Browser (Chromium über Playwright): Desktop, Handy-Ansicht, Offline-Start.
// Startet einen kleinen statischen Server auf dem easygames-Ordner. Aufruf: node e2e/run-e2e.mjs [--shots <ordner>]
import http from 'node:http';
import { readFile, stat, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const SHOTS = process.argv.includes('--shots') ? process.argv[process.argv.indexOf('--shots') + 1] : null;
const req = createRequire(import.meta.url);
let pw;
try { pw = req('playwright'); } catch { pw = req(join(execSync('npm root -g').toString().trim(), 'playwright')); }

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.css': 'text/css' };
const server = http.createServer(async (rq, rs) => {
  try {
    let p = decodeURIComponent(new URL(rq.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const f = join(ROOT, p);
    if (!f.startsWith(ROOT)) throw new Error('403');
    await stat(f);
    rs.writeHead(200, { 'content-type': TYPES[extname(f)] ?? 'application/octet-stream', 'cache-control': 'no-cache' });
    rs.end(await readFile(f));
  } catch { rs.writeHead(404); rs.end('nicht gefunden'); }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const BASE = `http://localhost:${server.address().port}/ricorail/`;
const results = [];
const ok = (name, pass, info = '') => { results.push({ name, pass, info }); console.log(`${pass ? '✔' : '✖'} ${name}${info ? ' – ' + info : ''}`); };
const browser = await pw.chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
if (SHOTS) await mkdir(SHOTS, { recursive: true });
const shot = async (page, n) => { if (SHOTS) await page.screenshot({ path: join(SHOTS, `${n}.png`) }); };

async function session(name, ctxOpts, fn) {
  const ctx = await browser.newContext(ctxOpts);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error' && !/anmacha|cloud|favicon|ERR_|net::/i.test(m.text())) errors.push(m.text()); });
  try { await fn(page, ctx); ok(`${name}: keine Skriptfehler`, errors.length === 0, errors.slice(0, 3).join(' | ')); }
  catch (e) { ok(`${name}: Ablauf`, false, String(e).split('\n')[0]); await shot(page, `${name}-fehler`); }
  await ctx.close();
}

async function drive(page, label) {
  // Warten bis geladen (HUD sichtbar, Ladebildschirm weg)
  await page.waitForSelector('.hud', { timeout: 180000 });
  await page.waitForSelector('.loading', { state: 'detached', timeout: 180000 });
  ok(`${label}: Fahrt geladen`, true);
}

await session('desktop', { viewport: { width: 1280, height: 800 } }, async (page) => {
  await page.goto(BASE);
  await page.waitForSelector('text=Jetzt fahren', { timeout: 30000 });
  ok('Desktop: Hauptmenü', true);
  const menu = await page.locator('.menu2 .btn').allTextContents();
  ok('Desktop: Online als „in Entwicklung“', menu.some((t) => /Online/.test(t) && /in Entwicklung/.test(t)));
  await shot(page, 'desktop-menu');
  // Software-Rendering im Test: niedrige Qualität
  await page.click('text=Einstellungen');
  await page.locator('label.f', { hasText: 'Qualität' }).locator('select').selectOption('low');
  await page.click('button[aria-label="Zurück"]');
  await page.click('.tiles .btn >> nth=0'); await page.click('text=Freies Fahren');
  await page.click('text=Losfahren');
  await drive(page, 'Desktop');
  await page.waitForTimeout(1500);
  await shot(page, 'desktop-cab');
  // Anfahren: Richtungswender vor, Bremse lösen, Fahrhebel auf
  await page.keyboard.press('KeyR');
  await page.keyboard.down('KeyQ'); await page.waitForTimeout(1500); await page.keyboard.up('KeyQ');
  await page.keyboard.down('KeyW');
  for (let i = 0; i < 60 && !/(Fahren |F\d · )([5-9]\d|100) %/.test(await page.locator('.hud .tl').textContent()); i++) await page.waitForTimeout(500);
  await page.keyboard.up('KeyW');
  let v = 0;
  for (let i = 0; i < 90 && v < 1; i++) { await page.waitForTimeout(1000); v = Number(await page.locator('.hud .speed').textContent()); }
  ok('Desktop: Zug fährt an', v > 0, `${v} km/h`);
  await shot(page, 'desktop-fahrt');
  for (const k of ['Digit2', 'Digit3', 'Digit6']) { await page.keyboard.press(k); await page.waitForTimeout(800); }
  await shot(page, 'desktop-kamera');
  await page.keyboard.press('KeyM'); await page.waitForTimeout(800); await shot(page, 'desktop-karte'); await page.keyboard.press('KeyM');
  const fps = await page.evaluate(() => new Promise((r) => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 3000) requestAnimationFrame(f); else r(n / 3); }; requestAnimationFrame(f); }));
  ok('Desktop: Bildrate (Software-Rendering)', fps > 1, `${fps.toFixed(1)} FPS`);
  await page.keyboard.press('Escape');
  await page.click('text=Fahrt beenden');
  await page.waitForSelector('text=Losfahren', { timeout: 10000 });
  ok('Desktop: Fahrt beenden → Auswahl', true);
});

await session('handy', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }, async (page) => {
  await page.goto(BASE);
  await page.waitForSelector('text=Jetzt fahren', { timeout: 30000 });
  await shot(page, 'handy-menu');
  const sw = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
  ok('Handy: kein waagerechtes Scrollen im Menü', sw);
  await page.tap('.tiles .btn >> nth=0'); await page.tap('text=Fahrplanfahrt');
  await page.tap('text=Dienst antreten');
  await drive(page, 'Handy');
  await page.waitForTimeout(1500);
  ok('Handy: Touch-Hebel sichtbar', await page.locator('.lever').isVisible());
  await shot(page, 'handy-fahrt');
  await page.tap('.hud button[aria-label="Pause"]');
  await page.tap('text=Fahrt beenden');
  await page.waitForSelector('text=Dienst antreten', { timeout: 10000 });
});

await session('offline', { viewport: { width: 1024, height: 700 } }, async (page, ctx) => {
  await page.goto(BASE);
  await page.waitForSelector('text=Jetzt fahren', { timeout: 30000 });
  const reg = await page.evaluate(async () => { const r = await navigator.serviceWorker.ready; return !!r.active; });
  ok('Offline: Service Worker aktiv', reg);
  await page.waitForTimeout(1500);
  await ctx.setOffline(true);
  await page.reload();
  await page.waitForSelector('text=Jetzt fahren', { timeout: 30000 });
  ok('Offline: Spiel startet ohne Netz', true);
});

await browser.close();
server.close();
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} Prüfungen bestanden`);
process.exit(failed.length ? 1 : 0);
