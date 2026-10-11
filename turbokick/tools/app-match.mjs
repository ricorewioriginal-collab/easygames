/* Spielt ein ganzes Spiel (1 Minute, Mensch steht still, Bot-Gegner) und wartet auf das Ende. Aufruf: node tools/app-match.mjs <prefix> [port=5181] */
import { createRequire } from 'node:module';
const require = createRequire('/tmp/claude-0/t/');
const { chromium } = require('playwright');
const [prefix = '/tmp/tkm', port = '5181'] = process.argv.slice(2);
const b = await chromium.launch({
  args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});
const p = await b.newPage({ viewport: { width: 900, height: 540 } });
const errs = [];
p.on('pageerror', (e) => {
  errs.push(e.message);
  console.log('PAGEERROR', e.message);
});
p.on('console', (m) => {
  if (m.type() === 'error' && !/GL Driver|GPU stall|swiftshader/i.test(m.text())) {
    errs.push(m.text().slice(0, 200));
    console.log('console.error', m.text().slice(0, 200));
  }
});
await p.goto(`http://localhost:${port}/`);
await p.waitForSelector('.menu', { timeout: 60000 });
await p.evaluate(() =>
  window.__app.store.update((d) => {
    d.lastSetup = { teamSize: 2, difficulty: 'hard', minutes: 1, arena: 'eis', nitro: true };
    d.settings.quality = 'low';
  }),
);
await p.evaluate(() => window.__app.go('play'));
await p.waitForSelector('.chip');
await p
  .locator('button:has-text("Anstoß")')
  .first()
  .evaluate((e) => e.click());
await p.waitForSelector('.hud', { timeout: 40000 });
const t0 = Date.now();
let shot = 0;
while (Date.now() - t0 < 300000) {
  const st = await p.evaluate(() => ({
    end: !!document.querySelector('.cover table'),
    clock: document.querySelector('.clock')?.textContent,
    score: [...document.querySelectorAll('.scorebar .team')].map((e) => e.textContent),
    banner: document.querySelector('.banner.on')?.textContent,
  }));
  if (st.banner && shot < 3 && /TOR/i.test(st.banner)) {
    shot++;
    await p.screenshot({ path: `${prefix}-goal${shot}.png` });
    console.log('Tor-Ansage:', st.banner, st.score.join(':'));
  }
  if (st.end) {
    console.log('Ende nach', Math.round((Date.now() - t0) / 1000), 's, Stand', st.score.join(':'));
    await p.waitForTimeout(500);
    await p.screenshot({ path: `${prefix}-end.png` });
    break;
  }
  await p.waitForTimeout(700);
}
console.log(JSON.stringify({ errs }));
await b.close();
