#!/usr/bin/env node
// Online ohne Server: zwei Browser, einer eröffnet einen Raum (sein Gerät ist der Server), der andere tritt mit dem Code bei.
// Verbindungsaufbau über den Firebase-Emulator (cloud/fire-peer.js), danach gemeinsames Duo-Match.
//   firebase emulators:start --only auth,firestore  (mit cloud/firestore.rules), node scripts/build.mjs, dann node e2e/p2p.mjs
import { createServer } from 'node:http';
import { createReadStream, existsSync, mkdirSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repo = resolve(root, '..');
const { chromium } = (() => {
  for (const p of ['playwright', '/opt/node-tools/node_modules/playwright']) {
    try {
      return require(p);
    } catch {
      /* weiter */
    }
  }
  throw new Error('Playwright nicht gefunden');
})();
const shots = resolve(process.argv[2] ?? join(root, 'test-results'));
mkdirSync(shots, { recursive: true });
const EMU = { auth: 'http://127.0.0.1:9099', fs: 'http://127.0.0.1:8080' };
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.bin': 'application/octet-stream', '.webmanifest': 'application/manifest+json' };
// ganzes easygames-Repo ausliefern, damit ../../cloud/fire-peer.js gefunden wird
const web = createServer((q, r) => {
  let p = decodeURIComponent(new URL(q.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  const f = normalize(join(repo, p));
  if (!f.startsWith(repo) || !existsSync(f) || !statSync(f).isFile()) return r.writeHead(404).end();
  r.writeHead(200, { 'content-type': MIME[extname(f)] ?? 'application/octet-stream' });
  createReadStream(f).pipe(r);
}).listen(0, '127.0.0.1');
await new Promise((r) => web.once('listening', r));
const url = `http://127.0.0.1:${web.address().port}/riftzone/app/`;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const errors = [];
async function open(name) {
  const ctx = await browser.newContext({ viewport: { width: 800, height: 450 }, serviceWorkers: 'block' });
  await ctx.addInitScript((e) => (window.FIRE_PEER_EMU = e), EMU);
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(`${name}: ${e}`));
  page.on('console', (m) => m.type() === 'error' && errors.push(`${name}: ${m.text()}`));
  await page.goto(url);
  await page.waitForSelector('text=Starten', { timeout: 60000 });
  await page.click('text=Starten');
  await page.waitForSelector('button:has-text("Spielen")');
  await page.evaluate(() => {
    const app = window.riftzone;
    app.mode = { ...app.mode, teamSize: 2, players: 12 };
  });
  return page;
}
let ok = true;
try {
  const a = await open('Anna');
  const b = await open('Ben');
  await a.click('button:has-text("Raum eröffnen")');
  await a.waitForFunction(() => !!window.riftzone.priv, null, { timeout: 30000 });
  const code = await a.evaluate(() => window.riftzone.p2p.code);
  console.log('• Raum eröffnet:', code, 'über', await a.evaluate(() => window.riftzone.p2p.host.peer.via));
  const t0 = Date.now();
  await b.fill('input[placeholder="Raumcode"]', code);
  await b.click('button:has-text("Beitreten")');
  await a.waitForFunction(() => window.riftzone.priv?.members.length === 2, null, { timeout: 40000 });
  console.log(`• Ben ist im Raum (${Date.now() - t0} ms)`);
  await a.evaluate(() => window.riftzone.showLobby());
  await a.screenshot({ path: join(shots, 'p2p-1-raum.png'), timeout: 60000 });
  await a.click('button:has-text("Match starten")');
  await a.waitForFunction(() => !!window.riftzone.game?.session.latest, null, { timeout: 60000 });
  await b.waitForFunction(() => !!window.riftzone.game?.session.latest, null, { timeout: 60000 });
  console.log('• beide im Match');
  const ids = await Promise.all([a, b].map((p) => p.evaluate(() => ({ id: window.riftzone.game.session.selfId, team: window.riftzone.game.session.team }))));
  if (ids[0].team !== ids[1].team) throw new Error('nicht im selben Team');
  await a.waitForFunction(() => (window.riftzone.game.session.latest?.busT ?? 0) > 14, null, { timeout: 90000 });
  for (const p of [a, b]) {
    await p.mouse.click(400, 225);
    await p.keyboard.press('Space');
  }
  await a.waitForTimeout(4000);
  const st = await Promise.all([a, b].map((p) => p.evaluate(() => ({ mode: window.riftzone.game.session.self?.body.mode, ping: Math.round(window.riftzone.game.session.ping), seesMate: window.riftzone.game.session.latest.players.some((q) => q.flags & 128) }))));
  console.log('• Zustand', JSON.stringify(st));
  if (!st.every((s) => s.mode >= 1 && s.mode <= 4)) throw new Error('Absprung hat nicht funktioniert');
  if (!st.every((s) => s.seesMate)) throw new Error('Teamkamerad nicht sichtbar');
  await b.screenshot({ path: join(shots, 'p2p-2-match.png'), timeout: 60000 });
} catch (e) {
  ok = false;
  console.error('FEHLER:', e.message);
}
await browser.close();
web.close();
const relevant = errors.filter((e) => !/favicon|AudioContext|anmacha-cloud|ERR_|net::/i.test(e));
if (relevant.length) {
  ok = false;
  console.error('Konsolenfehler:\n  ' + relevant.slice(0, 8).join('\n  '));
}
console.log(ok ? '✓ Test ohne Server bestanden' : '✗ Test ohne Server fehlgeschlagen');
process.exit(ok ? 0 : 1);
