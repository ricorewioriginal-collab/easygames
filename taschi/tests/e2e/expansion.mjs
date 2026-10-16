// Browser test for the expansion: meadow encounters, ball choice, move
// manager, EP candy, Taschidex/map tabs and the rival meeting.
// Run: node tests/e2e/expansion.mjs [screenshot-dir]
import assert from 'node:assert/strict';
import { startSeeded, G, advance, waitState, waitIdle, teleport } from './helpers.mjs';

const dir = process.argv[2] || null;
const steps = [];
const step = (s) => { steps.push(s); console.log('  ✓ ' + s); };

const t = await startSeeded({ width: 1280, height: 720 }, (s, { makeMonster, rng }) => {
  s.team.push(makeMonster('wollini', 15, rng));
  s.dex.wollini = 2;
  s.coins = 2000;
  s.bag = { taschiball: 5, heilball: 3, netzball: 3, flinkball: 3, daemmerball: 2, levelball: 2, timerball: 2, superball: 3, trank: 5, levelbonbon: 2 };
});
const { page, errors, close } = t;
const shot = async (name) => { if (dir) await page.screenshot({ path: dir + '/' + name + '.png' }); };
try {
  // 1. meadow: stand in tall grass and walk until something rustles
  const spot = await G(page, () => {
    const g = window.__taschi, L = g.world.current.layout;
    for (const m of L.grass.filter(m => m.rx > 8)) for (let k = 0; k < 200; k++) {
      const x = m.x + (Math.random() - 0.5) * m.rx, z = m.z + (Math.random() - 0.5) * m.rz;
      if (g.world.inGrassAt ? g.world.inGrassAt(x, z) : true) { g.world.placePlayer(x, z, 0); if (g.world.inGrass() && !g.world.blocked(x, z)) return { x, z }; }
    }
    return null;
  });
  assert.ok(spot, 'Wiese gefunden');
  await page.waitForTimeout(600);
  await shot('20-meadow');
  // walk a little for real, then feed further steps directly (headless
  // rendering runs at a few frames per second, so walking is very slow)
  await page.keyboard.down('KeyW'); await page.waitForTimeout(1200); await page.keyboard.up('KeyW');
  let fought = false;
  for (let k = 0; k < 300 && !fought; k++) {
    fought = await G(page, () => { const g = window.__taschi; if (g.state === 'battle' || g.busy) return true; if (!g.world.inGrass()) return false; g.world.stepAcc = 2; g.world.checkEncounters(); return g.state === 'battle' || g.busy > 0; });
  }
  await waitState(page, 'battle');
  assert.ok(fought, 'Zufallsbegegnung im hohen Gras');
  step('Zufallsbegegnung beim Laufen durchs hohe Gras');
  await advance(page, { until: () => !!document.querySelector('.bact.fight') });
  await page.locator('.bact.bag').click(); await page.waitForTimeout(400);
  const balls = await page.locator('.bact.bag').allTextContents();
  assert.ok(balls.filter(b => /ball/i.test(b)).length >= 6, 'Ballauswahl ' + balls.length);
  await shot('21-balls');
  await page.locator('.bact.bag', { hasText: 'Flinkball' }).first().click();
  await advance(page, { max: 120, until: () => window.__taschi.state !== 'battle' || !!document.querySelector('.bact.fight') });
  for (let k = 0; k < 20 && await G(page, () => window.__taschi.state === 'battle'); k++) {
    if (await page.locator('.bact.fight').count()) { await page.locator('.bact.fight').click(); await page.waitForTimeout(200); await page.locator('.bact.move:not(.disabled)').first().click(); }
    await advance(page, { max: 120, until: () => window.__taschi.state !== 'battle' || !!document.querySelector('.bact.fight') });
  }
  await advance(page);
  await waitIdle(page);
  step('Mehrere Ballsorten im Kampf, Flinkball geworfen');

  // 2. move manager and EP candy
  await page.keyboard.press('Escape');
  await page.waitForSelector('.tabs');
  await page.locator('.card', { hasText: 'Wollini' }).first().click();
  await page.getByText('Attacken verwalten').click();
  await page.waitForTimeout(300);
  await shot('22-moves');
  const known0 = await G(page, () => window.__taschi.save.team.find(m => m.id === 'wollini').moves.length);
  await page.locator('.row button', { hasText: 'Vergessen' }).first().click();
  await page.getByText('Ja, vergessen').click();
  await page.waitForTimeout(200);
  assert.equal(await G(page, () => window.__taschi.save.team.find(m => m.id === 'wollini').moves.length), known0 - 1);
  await page.locator('.row button', { hasText: 'Lernen' }).first().click();
  await page.waitForTimeout(300);
  assert.equal(await G(page, () => window.__taschi.save.team.find(m => m.id === 'wollini').moves.length), known0);
  step('Attacke vergessen und beim Attacken-Erinnerer neu gelernt');
  for (let k = 0; k < 4 && await page.locator('.screen').count() > 1; k++) { await page.locator('.screen').last().locator('.closebtn').click(); await page.waitForTimeout(300); }
  await page.locator('.tab', { hasText: 'Tasche' }).click(); await page.waitForTimeout(200);
  await page.getByText('EP-Bonbon').first().click(); await page.waitForTimeout(200);
  const lv0 = await G(page, () => window.__taschi.save.team.find(m => m.id === 'wollini').lv);
  await page.locator('.card', { hasText: 'Wollini' }).last().click();
  // level 16: Wollini evolves outside of battle – allow it, then skip the texts
  for (let k = 0; k < 30; k++) {
    await page.waitForTimeout(300);
    const st = await G(page, () => { const c = document.querySelector('.choice'); if (c) { c.click(); return 'choice'; } return window.__taschi.ui.blocking && document.querySelector('.dlg') ? 'dlg' : 'idle'; });
    if (st === 'dlg') await page.keyboard.press('Enter');
    if (st === 'idle' && k > 3) break;
  }
  const grown = await G(page, () => window.__taschi.save.team.find(m => m.id === 'wollmond' || m.id === 'wollini'));
  assert.equal(grown.lv, lv0 + 1);
  assert.equal(grown.id, 'wollmond', 'Entwicklung außerhalb des Kampfes');
  step('EP-Bonbon: Level 16, Wollini entwickelt sich zu Wollmond');
  for (const tab of ['Taschidex', 'Karte']) { await page.locator('.tab', { hasText: tab }).click(); await page.waitForTimeout(600); await shot('23-tab-' + tab); }
  for (let k = 0; k < 4 && await page.locator('.screen').count(); k++) { await page.keyboard.press('Escape'); await page.waitForTimeout(200); }
  await waitIdle(page);

  // 3. rival on arrival in Korallküste
  await G(page, () => { const g = window.__taschi; g.save.team.forEach(m => { m.hp = 999; }); g.script(() => g.travelToRegion(1, 'south')); });
  await page.waitForFunction(() => (document.querySelector('.dlg')?.textContent || '').includes('Rian'), null, { timeout: 90000 });
  await page.waitForTimeout(300);
  await shot('24-rival');
  await advance(page, { max: 40, until: () => window.__taschi.state === 'battle' });
  await waitState(page, 'battle');
  for (let k = 0; k < 40 && await G(page, () => window.__taschi.state === 'battle'); k++) {
    await advance(page, { max: 120, until: () => window.__taschi.state !== 'battle' || !!document.querySelector('.bact.fight') || !!document.querySelector('.choice') });
    if (await page.locator('.choice').count()) { await page.locator('.choice').first().click(); continue; }
    if (await page.locator('.bact.fight').count()) { await page.locator('.bact.fight').click(); await page.waitForTimeout(200); await page.locator('.bact.move:not(.disabled)').first().click(); }
  }
  await advance(page, { max: 80 });
  const rivalDone = await G(page, () => window.__taschi.save.trainers.rival_0 === true || window.__taschi.state === 'world');
  assert.ok(rivalDone);
  step('Rivale Rian fordert bei Ankunft in der Korallküste heraus');
  assert.deepEqual(errors, []);
  step('Keine Browserfehler');
  console.log('OK');
} catch (e) {
  await shot('zz-expansion-failure').catch(() => {});
  console.error('Fehler-Logs:', errors.slice(0, 10));
  console.error(e);
  process.exitCode = 1;
} finally { await close(); }
