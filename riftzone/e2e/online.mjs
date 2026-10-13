#!/usr/bin/env node
// Online-Test: echter Server + zwei Browser. Gruppe erstellen, beitreten, bereit, gemeinsam ins Duo-Match,
// beide empfangen Spielzustand, sehen sich gegenseitig und bewegen sich.
//   npm run server:build && node scripts/build.mjs && node e2e/online.mjs
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync } from 'node:fs';
import { startServer } from '../scripts/serve.mjs';

const require = createRequire(import.meta.url);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
function pw() {
  for (const p of ['playwright', '/opt/node-tools/node_modules/playwright']) {
    try {
      return require(p);
    } catch {
      /* weiter */
    }
  }
  throw new Error('Playwright nicht gefunden');
}
const { chromium } = pw();
const shots = resolve(process.argv[2] ?? join(root, 'test-results'));
mkdirSync(shots, { recursive: true });
const gport = 4800 + Math.floor(Math.random() * 300);
const sport = 5200 + Math.floor(Math.random() * 300);
const game = spawn(process.execPath, [join(root, 'server', 'dist', 'server.mjs')], {
  env: { ...process.env, PORT: String(sport), DATA_DIR: join(root, 'node_modules', '.cache', 'rz-data'), QUEUE_WAIT: '1', PUBLIC_MATCH_SIZE: '12' },
  stdio: ['ignore', 'pipe', 'pipe'],
});
game.stdout.on('data', (d) => process.stdout.write('  [server] ' + d));
game.stderr.on('data', (d) => process.stdout.write('  [server!] ' + d));
await new Promise((r) => setTimeout(r, 3500));
const web = await startServer(gport);
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const errors = [];
async function open(name) {
  const ctx = await browser.newContext({ viewport: { width: 800, height: 450 } });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(`${name}: ${e}`));
  page.on('console', (m) => m.type() === 'error' && errors.push(`${name}: ${m.text()}`));
  await page.goto(`http://localhost:${gport}/?server=localhost:${sport}`);
  await page.waitForSelector('text=Starten', { timeout: 60000 });
  await page.click('text=Starten');
  await page.waitForSelector('button:has-text("Spielen")');
  await page.evaluate((n) => {
    const app = window.riftzone;
    app.mode = { ...app.mode, kind: 'public', teamSize: 2 };
    // Name setzen
    const p = JSON.parse(localStorage.getItem('riftzone.profile'));
    p.name = n;
    localStorage.setItem('riftzone.profile', JSON.stringify(p));
  }, name);
  return page;
}
let ok = true;
try {
  const a = await open('Anna');
  const b = await open('Ben');
  await a.waitForFunction(() => window.riftzone.online.connected, null, { timeout: 15000 });
  await b.waitForFunction(() => window.riftzone.online.connected, null, { timeout: 15000 });
  console.log('• beide verbunden');
  await a.evaluate(() => window.riftzone.online.send({ t: 'party.create' }));
  await a.waitForFunction(() => !!window.riftzone.party, null, { timeout: 5000 });
  const code = await a.evaluate(() => window.riftzone.party.code);
  console.log('• Gruppe', code);
  await b.evaluate((c) => window.riftzone.online.send({ t: 'party.join', code: c }), code);
  await a.waitForFunction(() => window.riftzone.party.members.length === 2, null, { timeout: 5000 });
  await b.evaluate(() => window.riftzone.online.send({ t: 'party.ready', ready: true }));
  await a.waitForTimeout(500);
  await a.evaluate(() => window.riftzone.showLobby());
  await a.screenshot({ path: join(shots, 'online-1-party.png'), timeout: 60000 });
  await a.click('button:has-text("Spielen")');
  console.log('• Suche gestartet');
  await a.waitForFunction(() => !!window.riftzone.game?.session.latest, null, { timeout: 60000 });
  await b.waitForFunction(() => !!window.riftzone.game?.session.latest, null, { timeout: 60000 });
  console.log('• beide im Match');
  const ids = await Promise.all([a, b].map((p) => p.evaluate(() => ({ id: window.riftzone.game.session.selfId, team: window.riftzone.game.session.team }))));
  if (ids[0].team !== ids[1].team) throw new Error('nicht im selben Team');
  // Warten bis Absprung möglich, dann springen
  await a.waitForFunction(() => (window.riftzone.game.session.latest?.busT ?? 0) > 14, null, { timeout: 60000 });
  for (const p of [a, b]) {
    await p.mouse.click(400, 225);
    await p.keyboard.press('Space');
  }
  await a.waitForTimeout(4000);
  const st = await Promise.all([a, b].map((p) => p.evaluate(() => ({ mode: window.riftzone.game.session.self?.body.mode, ping: Math.round(window.riftzone.game.session.ping), seesMate: window.riftzone.game.session.latest.players.some((q) => q.flags & 128) }))));
  console.log('• Zustand', JSON.stringify(st));
  if (!st.every((s) => s.mode === 1 || s.mode === 2 || s.mode === 3 || s.mode === 4)) throw new Error('Absprung hat nicht funktioniert');
  if (!st.every((s) => s.seesMate)) throw new Error('Teamkamerad nicht sichtbar');
  await a.screenshot({ path: join(shots, 'online-2-match.png'), timeout: 60000 });
} catch (e) {
  ok = false;
  console.error('FEHLER:', e.message);
}
await browser.close();
web.close();
game.kill();
const relevant = errors.filter((e) => !/favicon|AudioContext/i.test(e));
if (relevant.length) {
  ok = false;
  console.error('Konsolenfehler:\n  ' + relevant.slice(0, 8).join('\n  '));
}
console.log(ok ? '✓ Online-Test bestanden' : '✗ Online-Test fehlgeschlagen');
process.exit(ok ? 0 : 1);
