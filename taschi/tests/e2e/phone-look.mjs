// Schaubild am Handy (Touch, kleines Fenster): Heilzentrum innen und draußen, mit Bildrate.
// Run: node tests/e2e/phone-look.mjs <ordner> [präfix]
import { startSeeded } from './helpers.mjs';
const dir = process.argv[2], pre = process.argv[3] || 'phone';
const t = await startSeeded({ width: 412, height: 870, touch: true }, () => {});
const { page, close, errors } = t;
const frames = (n) => page.evaluate((n) => new Promise(r => { let k = 0; const f = () => ++k >= n ? r() : requestAnimationFrame(f); requestAnimationFrame(f); }), n);
try {
  await page.evaluate(() => window.__taschi.settings.set('graphics', 'medium'));
  await frames(40);
  await page.screenshot({ path: dir + '/' + pre + '-out.png' });
  console.log('out', await page.evaluate(() => JSON.stringify({ p: window.__taschi.renderer.profileName, post: window.__taschi.renderer.postOn, lite: window.__taschi.renderer.post?.lite })));
  await page.evaluate(() => window.__taschi.script(() => window.__taschi.enterInterior('heal')));
  await page.waitForFunction(() => window.__taschi.world.current?.type === 'interior' && !window.__taschi.busy, null, { timeout: 120000 });
  await frames(40);
  await page.screenshot({ path: dir + '/' + pre + '-heal.png' });
  console.log('ok', errors);
} finally { await close(); }
