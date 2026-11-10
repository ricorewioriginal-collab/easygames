// Browser test: Wesen/Fähigkeit on the status page, free choice of the companion,
// shiny Taschis and battle weather. Run: node tests/e2e/traits.mjs [screenshot-dir]
import assert from 'node:assert/strict';
import { startSeeded, G, advance, waitIdle } from './helpers.mjs';

const dir = process.argv[2] || null;
const t = await startSeeded({ width: 1280, height: 720 }, (s) => { s.team[1].shiny = true; s.badges = 1; });
const { page, errors, close } = t;
const shot = async (name) => { if (dir) await page.screenshot({ path: dir + '/' + name + '.png' }); };
try {
  await page.evaluate(() => import('./src/ui/menus.js').then(m => m.openPauseMenu(window.__taschi, 'team')));
  await page.waitForTimeout(500);
  await page.locator('.card').nth(1).click(); await page.waitForTimeout(600);
  assert.ok(await page.getByText(/Wesen:/).count(), 'Wesen fehlt');
  assert.ok(await page.getByText(/Fähigkeit:/).count(), 'Fähigkeit fehlt');
  await page.getByText('🐾 Als Begleiter').click(); await page.waitForTimeout(700);
  assert.ok(await page.getByText('🐾 Begleiter (aktiv)').count(), 'Begleiter-Knopf nicht aktualisiert');
  await page.evaluate(() => document.querySelectorAll('.panel-body').forEach(e => { e.scrollTop = 0; })); await page.waitForTimeout(200);
  await shot('traits-status');
  assert.equal(await G(page, () => { const g = window.__taschi; return g.world.follower.id === g.save.team[1].id && g.world.follower.shiny; }), true);
  await page.evaluate(() => { const ui = window.__taschi.ui; while (ui.stack && ui.stack.length) ui.pop(ui.stack[ui.stack.length - 1]); }); await page.waitForTimeout(600);
  await shot('traits-companion');
  // battle in the rain
  await page.evaluate(() => { const g = window.__taschi; g.world.setWeather('rain'); g.script(() => g.randomEncounter('grass')); });
  await advance(page, { max: 60, until: () => window.__taschi.state === 'battle' && !!document.querySelector('.bact.fight') });
  assert.equal(await G(page, () => window.__taschi.battleScene.b.weather), 'rain');
  await shot('traits-weather');
  // Sternstufe: open the attack menu, switch it on and attack
  await page.locator('.bact.fight').first().click(); await page.waitForTimeout(300);
  await page.locator('.bact.star').click(); await page.waitForTimeout(300);
  assert.ok(await page.locator('.bact.star.on').count(), 'Sternstufe-Knopf fehlt');
  await shot('traits-star-menu');
  await page.locator('.bact.move').first().click();
  await page.waitForFunction(() => window.__taschi.battleScene.b.star[0] !== null, null, { timeout: 15000 });
  await page.waitForTimeout(900);
  await shot('traits-star');
  assert.deepEqual(errors, []);
  console.log('traits ok');
} finally { await close(); }
