// Browsertest: Startbildschirm („Drücke eine Taste“ → Hauptmenü), Controller/Tastatur-Navigation,
// Ladebildschirm und Stadt-Titelkarten. Run: node tests/e2e/branding.mjs [screenshot-dir] [phone]
import assert from 'node:assert/strict';
import { launch, seededStorage, waitState, waitIdle, G } from './helpers.mjs';

const dir = process.argv[2] || null, phone = process.argv[3] === 'phone';
const storage = await seededStorage((s) => { s.badges = 3; });
const t = await launch(phone ? { width: 390, height: 844, touch: true, storage } : { width: 1280, height: 720, storage });
const { page, errors, close } = t;
const tag = phone ? 'phone-' : '';
const shot = async (name) => { if (dir) await page.screenshot({ path: dir + '/' + tag + name + '.png' }); };
const frames = (n) => page.evaluate((n) => new Promise(r => { const f = () => (--n <= 0 ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);
try {
  await page.goto(t.base);
  await page.waitForTimeout(400); await shot('boot');
  await waitState(page, 'title');
  await page.waitForTimeout(1500);
  assert.ok(await page.locator('#title.stage-press').count(), 'kein „Drücke eine Taste“');
  assert.equal(await page.locator('.tmenu-item').first().isVisible(), false, 'Menü schon sichtbar');
  await shot('title-press');
  if (phone) await page.tap('#title'); else await page.keyboard.press('Enter');
  await page.waitForSelector('#title.stage-menu'); await page.waitForTimeout(900);
  assert.equal(await G(page, () => document.querySelector('.tmenu-item.focus')?.textContent.includes('Fortsetzen')), true, 'Fortsetzen nicht vorausgewählt');
  await shot('title-menu');
  // Steuerkreuz runter, B/Escape zurück zum Startbild
  await page.keyboard.press('ArrowDown'); await frames(3);
  assert.equal(await G(page, () => document.querySelector('.tmenu-item.focus')?.textContent.includes('Online')), true, 'Navigation runter');
  await page.keyboard.press('Backspace'); await frames(3);
  assert.ok(await page.locator('#title.stage-press').count(), 'Zurück führt nicht zum Startbild');
  await page.keyboard.press('Enter'); await page.waitForSelector('#title.stage-menu');
  // Stadt-Titelkarte beim Fortsetzen
  await page.getByText('Fortsetzen').click();
  await page.waitForSelector('.loadscreen.town', { timeout: 20000 });
  assert.ok((await page.locator('.townname').textContent()).includes('Sonnenhain'), 'Stadtname fehlt');
  await page.waitForTimeout(700); await shot('town-0');
  await waitState(page, 'world'); await waitIdle(page);
  // Motive einiger Regionen und der allgemeine Ladebildschirm
  for (const r of [1, 6, 9, 13]) {
    const p = page.evaluate((r) => window.__taschi.loadWithScreen(() => new Promise(res => setTimeout(res, 1600)), '', r), r);
    await page.waitForSelector('.loadscreen.town'); await page.waitForTimeout(900); await shot('town-' + r); await p;
  }
  const g = page.evaluate(() => window.__taschi.loadWithScreen(() => new Promise(res => setTimeout(res, 1500)), 'Unterwegs …'));
  await page.waitForSelector('.loadscreen:not(.town)'); await page.waitForTimeout(500); await shot('loading'); await g;
  assert.deepEqual(errors, []);
  console.log('branding ok');
} finally { await close(); }
