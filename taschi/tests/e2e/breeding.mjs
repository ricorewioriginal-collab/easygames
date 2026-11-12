// Browsertest: Pension im Heilzentrum, Ei schlüpft beim Laufen, Attacken-Disk.
// Run: node tests/e2e/breeding.mjs [screenshot-dir]
import assert from 'node:assert/strict';
import { startSeeded, G, advance, waitIdle, interactWith } from './helpers.mjs';

const dir = process.argv[2] || null;
const t = await startSeeded({ width: 1280, height: 720 }, (s, { makeMonster, rng }) => {
  s.badges = 3; s.coins = 4000;
  s.team.push(makeMonster('glutzahn', 18, rng), makeMonster('glutzahn', 16, rng));
  s.bag.disk_hieb = 1; s.bag.disk_flammenrad = 1;
  s.eggs = [{ id: 'samenling', iv: { hp: 9, atk: 9, def: 9, speed: 9 }, nature: 2, eggMoves: [], shiny: false, total: 1000, left: 20 }];
});
const { page, errors, close } = t;
const shot = async (name) => { console.log('·', name, new Date().toISOString().slice(11, 19)); if (dir) await page.screenshot({ path: dir + '/' + name + '.png' }); };
try {
  await page.evaluate(() => window.__taschi.script(() => window.__taschi.enterInterior('heal')));
  await waitIdle(page, 90000); await page.waitForTimeout(1200);
  await shot('breeding-healcenter');
  await interactWith(page, (e) => e.kind === 'daycare');
  await advance(page, { max: 10, until: () => !!document.querySelector('.panel') && /Pension/.test(document.querySelector('.panel h2')?.textContent || '') });
  // zwei Glutzahn abgeben
  for (let k = 0; k < 2; k++) { await page.locator('.panel .card', { hasText: 'Glutzahn' }).last().click(); await page.waitForTimeout(500); }
  assert.equal(await G(page, () => window.__taschi.save.daycare.mons.length), 2);
  await page.evaluate(() => document.querySelectorAll('.panel-body').forEach(e => { e.scrollTop = 0; }));
  await shot('breeding-daycare');
  // Ei bereitlegen lassen und abholen
  await page.evaluate(() => { const g = window.__taschi; g.save.daycare.egg = true; });
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  await page.evaluate(() => { import('./src/ui/extras.js').then(m => { m.openDaycare(window.__taschi); }); });
  await page.waitForTimeout(500);
  await page.getByText('🥚 Ei abholen').click(); await page.waitForTimeout(400);
  assert.equal(await G(page, () => window.__taschi.save.eggs.length), 2);
  await page.evaluate(() => { const ui = window.__taschi.ui; while (ui.stack.length) ui.pop(ui.stack[ui.stack.length - 1]); }); await page.waitForTimeout(300);
  // Team-Menü zeigt Eier
  await page.evaluate(() => import('./src/ui/menus.js').then(m => m.openPauseMenu(window.__taschi, 'team')));
  await page.waitForTimeout(600);
  assert.ok(await page.getByText(/Eier \(2\)/).count(), 'Eier fehlen im Team');
  await shot('breeding-eggs');
  await page.evaluate(() => { const ui = window.__taschi.ui; while (ui.stack.length) ui.pop(ui.stack[ui.stack.length - 1]); }); await page.waitForTimeout(300);
  // Laufen lässt das erste Ei schlüpfen
  await page.evaluate(() => window.__taschi.onSteps(40));
  await page.waitForFunction(() => /schlüpft|bewegt/.test(document.querySelector('.dlg')?.textContent || ''), null, { timeout: 20000 });
  await shot('breeding-hatch');
  await advance(page, { max: 20, choose: ['Nein'] });
  assert.ok(await G(page, () => window.__taschi.save.team.some(m => m.id === 'samenling' && m.lv === 1)), 'Junges fehlt');
  // Attacken-Disk lehren
  await page.evaluate(() => import('./src/ui/menus.js').then(m => m.openPauseMenu(window.__taschi, 'bag')));
  await page.waitForTimeout(600);
  await page.locator('.row', { hasText: 'Disk: Wirbelhieb' }).click(); await page.waitForTimeout(600);
  await shot('breeding-disk');
  assert.ok(await page.locator('.card[data-learn]').count(), 'Lern-Hinweis fehlt');
  await page.locator('.card[data-learn="Kann lernen"]').first().click(); await page.waitForTimeout(600);
  await advance(page, { max: 8, choose: ['Vergessen'] }).catch(() => {});
  assert.equal(await G(page, () => window.__taschi.save.bag.disk_hieb), 1, 'Disk verbraucht');
  assert.deepEqual(errors, []);
  console.log('breeding ok');
} finally { await close(); }
