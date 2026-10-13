#!/usr/bin/env node
// Browser-Test (Playwright + Chromium, Software-WebGL): Start → Lobby → Offline-Match → Bewegung/Schießen → Karte/Inventar.
// Prüft, dass keine Konsolenfehler auftreten und Bildschirmfotos entstehen.
//   node e2e/smoke.mjs [--mobile] [--shots <ordner>]
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer } from '../scripts/serve.mjs';

const require = createRequire(import.meta.url);
function pw() {
  for (const p of ['playwright', '/opt/node-tools/node_modules/playwright', '/opt/npm-tools/node_modules/playwright']) {
    try {
      return require(p);
    } catch {
      /* weiter */
    }
  }
  throw new Error('Playwright nicht gefunden (npm i -D playwright && npx playwright install chromium)');
}
const { chromium, devices } = pw();
const args = process.argv.slice(2);
const mobile = args.includes('--mobile');
const shotsDir = args.includes('--shots') ? resolve(args[args.indexOf('--shots') + 1]) : resolve(dirname(fileURLToPath(import.meta.url)), '..', 'test-results');
mkdirSync(shotsDir, { recursive: true });
const port = 4300 + Math.floor(Math.random() * 500);
const server = await startServer(port);
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM || undefined,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'],
});
const ctx = await browser.newContext(mobile ? { ...devices['Pixel 7 landscape'] } : { viewport: { width: 1280, height: 720 } });
const page = await ctx.newPage();
const errors = [];
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text());
});
page.on('pageerror', (e) => errors.push(String(e)));
const shot = async (n) => page.screenshot({ path: join(shotsDir, `${mobile ? 'mobile' : 'desktop'}-${n}.png`), timeout: 90000 });
const step = (t) => console.log(`• ${t}`);
let ok = true;
try {
  await page.goto(`http://localhost:${port}/?seed=1`);
  step('Startbildschirm');
  await page.waitForSelector('text=Starten', { timeout: 60000 });
  await shot('1-title');
  await page.click('text=Starten');
  step('Lobby');
  await page.waitForSelector('button:has-text("Spielen")', { timeout: 20000 });
  // Kleines, schnelles Match für den Test
  await page.evaluate(() => {
    const app = window.riftzone;
    app.mode = { ...app.mode, kind: 'offline', players: 24, zone: 'fast', time: 'day', weather: 'clear' };
  });
  await page.waitForTimeout(800);
  await shot('2-lobby');
  await page.click('button:has-text("Spielen")');
  step('Match lädt');
  await page.waitForFunction(() => !document.querySelector('.spinner'), null, { timeout: 90000 });
  await page.waitForSelector('.hud', { timeout: 30000 });
  await page.waitForTimeout(2500);
  await shot('3-bus');
  step('Absprung');
  await page.keyboard.press('Space');
  await page.waitForTimeout(1500);
  await shot('4-freefall');
  // Fallen lassen und lenken
  await page.keyboard.down('KeyW');
  await page.waitForTimeout(9000);
  await shot('5-glide');
  await page.waitForTimeout(12000);
  await page.keyboard.up('KeyW');
  await shot('6-landed');
  step('Laufen, springen, schießen');
  await page.keyboard.down('KeyW');
  await page.keyboard.down('ShiftLeft');
  await page.waitForTimeout(1500);
  await page.keyboard.press('Space');
  await page.waitForTimeout(800);
  await page.keyboard.up('ShiftLeft');
  await page.keyboard.up('KeyW');
  await page.keyboard.press('KeyE');
  await page.keyboard.press('KeyQ');
  await page.waitForTimeout(600);
  await shot('7-build');
  await page.keyboard.press('KeyQ');
  step('Karte und Inventar');
  await page.keyboard.press('KeyM');
  await page.waitForTimeout(700);
  await shot('8-map');
  await page.keyboard.press('KeyM');
  await page.keyboard.press('Tab');
  await page.waitForTimeout(500);
  await shot('9-inventory');
  await page.keyboard.press('Tab');
  const state = await page.evaluate(() => {
    const g = window.riftzone.game;
    const s = g?.session;
    return s ? { mode: s.self?.body.mode, alive: s.latest?.alive, hp: s.self?.hp, tick: s.latest?.tick, x: s.self?.body.x, z: s.self?.body.z } : null;
  });
  console.log('  Zustand:', JSON.stringify(state));
  if (!state || !state.tick) throw new Error('Kein Spielzustand empfangen');
} catch (e) {
  ok = false;
  console.error('FEHLER:', e.message);
  await shot('error').catch(() => {});
}
await browser.close();
server.close();
const relevant = errors.filter((e) => !/favicon|AudioContext|net::ERR/i.test(e));
if (relevant.length) {
  console.error('Konsolenfehler:\n  ' + relevant.slice(0, 10).join('\n  '));
  ok = false;
}
console.log(ok ? '✓ Browser-Test bestanden' : '✗ Browser-Test fehlgeschlagen', `(Bilder: ${shotsDir})`);
process.exit(ok ? 0 : 1);
