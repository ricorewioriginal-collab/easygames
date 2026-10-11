/* Durchlauf der App im Browser (Playwright, Software-GL) mit Bildschirmfotos.
   Aufruf: node tools/app-shot.mjs <prefix> [layout-id] [viewport=1000x600] – Entwicklungsserver auf Port 5180 muss laufen. */
import { createRequire } from 'node:module';
const require = createRequire('/tmp/claude-0/t/');
const { chromium } = require('playwright');
const [prefix = '/tmp/app', layout = 'prismara-01', vp = '1000x600'] = process.argv.slice(2);
const [W, H] = vp.split('x').map(Number);
const b = await chromium.launch({
  args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});
const p = await b.newPage({ viewport: { width: W, height: H } });
const errs = [];
p.on('pageerror', (e) => errs.push('PAGE ' + e.message));
p.on('console', (m) => {
  if (m.type() === 'error') errs.push(m.text().slice(0, 300));
});
await p.goto('http://localhost:5180/');
await p.waitForSelector('.menu', { timeout: 40000 });
await p.waitForTimeout(2500);
await p.screenshot({ path: `${prefix}-menu.png` });
await p.evaluate(() => window.__app.go('setup', { mode: 'bots' }));
await p.waitForSelector('.lgrid', { timeout: 20000 });
await p.waitForTimeout(500);
await p.screenshot({ path: `${prefix}-setup.png` });
await p.evaluate(
  (l) =>
    window.__app.store.update((d) => {
      d.lastSetup.layoutId = l;
      d.lastSetup.rounds = 3;
    }),
  layout,
);
await p.evaluate(() => window.__app.go('setup', { mode: 'bots' }));
await p.waitForSelector('.lgrid');
await p.click('text=Spiel starten');
await p.waitForSelector('.hud', { timeout: 30000 });
await p.waitForTimeout(4000);
await p.screenshot({ path: `${prefix}-game1.png` });
// würfeln sobald möglich
for (let i = 0; i < 40; i++) {
  const roll = await p.$('.actions .roll');
  if (roll) {
    await roll.evaluate((e) => e.click());
    break;
  }
  await p.waitForTimeout(500);
}
await p.waitForTimeout(2500);
await p.screenshot({ path: `${prefix}-game2.png` });
await p.waitForTimeout(6000);
await p.screenshot({ path: `${prefix}-game3.png` });
console.log(
  JSON.stringify({ errs: errs.filter((e) => !/GL Driver|GPU stall|swiftshader/i.test(e)) }, null, 1),
);
await b.close();
