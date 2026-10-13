// Screenshot helper for visual checks: node tools/shot.mjs <url-path> <out.png> [w] [h] [waitMs]
import { createRequire } from 'node:module';
import { startServer } from './serve.mjs';
const require = createRequire(import.meta.url);
function loadPlaywright() {
  for (const p of ['playwright', '/home/claude/.npm-global/lib/node_modules/playwright', '/opt/npm-tools/node_modules/playwright']) { try { return require(p); } catch {} }
  throw new Error('playwright not found');
}
const [, , path, out, w = 1280, h = 720, wait = 2500] = process.argv;
const { chromium } = loadPlaywright();
const port = 8190 + Math.floor(Math.random() * 400);
const server = await startServer(port);
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: Number(w), height: Number(h) } });
const logs = [];
page.on('console', m => logs.push(m.type() + ': ' + m.text()));
page.on('pageerror', e => logs.push('pageerror: ' + e.message));
await page.goto(`http://localhost:${port}/taschi/${path}`);
await page.waitForFunction(() => window.__ready === true || !!window.__error || (window.__taschi && window.__taschi.state === "title"), null, { timeout: 90000 }).catch(e => logs.push('timeout ' + e.message));
await page.waitForTimeout(Number(wait));
await page.screenshot({ path: out });
console.log(logs.filter(l => !l.includes('GPU stall')).slice(0, 30).join('\n'));
await browser.close();
server.close();
