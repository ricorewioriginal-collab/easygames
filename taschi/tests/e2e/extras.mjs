// Browsertest: Taschi-Camp, Glücksrad, Massenausbruch und Kampfturm.
// Run: node tests/e2e/extras.mjs [screenshot-dir]
import assert from 'node:assert/strict';
import { startSeeded, G, advance, waitIdle, interactWith } from './helpers.mjs';

const dir = process.argv[2] || null;
const t = await startSeeded({ width: 1280, height: 720 }, (s, { makeMonster, rng }) => {
  s.badges = 8; s.coins = 4000; s.visited = { 0: true, 1: true };
  s.team.push(makeMonster('glutzahn', 30, rng));
  s.bag.taschikeks = 3;
  s.team[0].friendship = 200;
});
const { page, errors, close } = t;
const shot = async (name) => { console.log('·', name, new Date().toISOString().slice(11, 19)); if (dir) await page.screenshot({ path: dir + '/' + name + '.png' }); };
const closeAll = () => page.evaluate(() => { const ui = window.__taschi.ui; while (ui.stack.length) ui.pop(ui.stack[ui.stack.length - 1]); }).then(() => page.waitForTimeout(300));
try {
  // Camp aus dem Team-Menü
  await page.evaluate(() => { import('./src/ui/menus.js').then(m => m.openPauseMenu(window.__taschi, 'team')); });
  await page.waitForTimeout(600);
  await page.getByText('⛺ Taschi-Camp').click(); await page.waitForTimeout(800);
  await page.getByText(/Taschi-Keks geben/).click(); await page.waitForTimeout(400);
  await page.getByText(/Ball spielen/).click(); await page.waitForTimeout(300);
  assert.equal(await G(page, () => window.__taschi.save.team[0].friendship), 217);
  assert.equal(await G(page, () => window.__taschi.save.bag.taschikeks), 2);
  await shot('extras-camp');
  await closeAll();
  // Quests zeigen den Massenausbruch
  await page.evaluate(() => { import('./src/ui/menus.js').then(m => m.openPauseMenu(window.__taschi, 'quests')); });
  await page.waitForTimeout(600);
  assert.ok(await page.getByText('📣 Massenausbruch heute').count(), 'Ausbruch fehlt');
  await shot('extras-outbreak');
  await closeAll();
  // Heilzentrum: Glücksrad
  await page.evaluate(() => window.__taschi.script(() => window.__taschi.enterInterior('heal')));
  await waitIdle(page, 90000); await page.waitForTimeout(1200);
  await shot('extras-healcenter');
  await interactWith(page, (e) => e.kind === 'wheel');
  await page.waitForFunction(() => !!document.querySelector('.wheel'), null, { timeout: 20000 });
  const coins = await G(page, () => window.__taschi.save.coins), bag = await G(page, () => JSON.stringify(window.__taschi.save.bag));
  await page.getByText('🎡 Drehen').click();
  await page.waitForTimeout(3800);
  await shot('extras-wheel');
  assert.ok(await G(page, () => !!window.__taschi.save.daily.wheel));
  assert.ok(coins !== await G(page, () => window.__taschi.save.coins) || bag !== await G(page, () => JSON.stringify(window.__taschi.save.bag)), 'kein Gewinn');
  await page.keyboard.press('Backspace'); await page.waitForTimeout(500);
  await waitIdle(page, 30000);
  // Kampfturm
  await interactWith(page, (e) => e.kind === 'tower');
  await advance(page, { max: 10, until: () => !!document.querySelector('.panel h2') && /Kampfturm/.test(document.querySelector('.panel h2').textContent) });
  for (const n of ['Plätscher', 'Fellino', 'Glutzahn']) { await page.locator('.panel .card', { hasText: n }).first().click(); await page.waitForTimeout(300); }
  await shot('extras-tower');
  await page.getByText('▶ Herausforderung starten').click();
  await advance(page, { max: 10, choose: ['Weiterkämpfen'], until: () => window.__taschi.state === 'battle' });
  await page.waitForFunction(() => window.__taschi.state === 'battle', null, { timeout: 30000 });
  await page.waitForTimeout(2500);
  await shot('extras-tower-battle');
  // Turm-Kopien kämpfen auf Lv 50, das Original bleibt unberührt
  assert.ok(await G(page, () => window.__taschi.battleScene.b.sides[0].team.every(m => m.lv === 50 && m.uid.startsWith('tw_'))));
  // Gegner schwächen und durchklicken, bis Vera nach der Fortsetzung fragt
  for (let i = 0; i < 200; i++) {
    await page.evaluate(() => { const b = window.__taschi.battleScene.b; if (b) for (const m of b.sides[1].team) if (m.hp > 1) m.hp = 1; });
    const st = await advance(page, { max: 1, choose: ['Pause'], until: () => window.__taschi.state === 'world' && !window.__taschi.ui.blocking }).catch(() => null);
    if (st && st.state === 'world' && !st.blocking) break;
    if (i === 6) await shot('extras-tower-battle-menu');
  }
  await waitIdle(page, 60000);
  assert.equal(await G(page, () => window.__taschi.save.tower.best), 1, 'Sieg fehlt');
  assert.ok(await G(page, () => window.__taschi.save.tower.tp >= 1));
  assert.ok(await G(page, () => window.__taschi.save.team.find(m => m.id === 'glutzahn').lv === 30));
  assert.equal(await G(page, () => window.__taschi.save.tower.run), null);
  assert.deepEqual(errors, []);
  console.log('extras ok');
} finally { await close(); }
