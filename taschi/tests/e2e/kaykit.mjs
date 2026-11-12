// Browsertest/Schaubild: KayKit-Abenteurer auf dem Stadtplatz und Waffen-Deko an der Arena.
// Run: node tests/e2e/kaykit.mjs <screenshot-dir> [region]
import assert from 'node:assert/strict';
import { startSeeded } from './helpers.mjs';
const dir = process.argv[2], r = Number(process.argv[3] || 2);
const t = await startSeeded({ width: 1280, height: 720 });
const { page, errors, close } = t;
const frames = (n) => page.evaluate((n) => new Promise(r => { const f = () => (--n <= 0 ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);
try {
  await page.evaluate(async (r) => { const g = window.__taschi; g.renderer.setProfile?.('high'); g.renderer.adaptive = false; g.renderer.scale = 1; g.renderer.resize(); await g.world.loadRegion(r, 'south'); g.hud.show(false); g.sky?.setWeather?.('clear'); }, r);
  // Modelle laden lassen
  await page.waitForFunction(() => window.__taschi.world.npcs.filter(n => n.kk).every(n => n.ch.mixer), null, { timeout: 120000 });
  const advs = await page.evaluate(() => window.__taschi.world.npcs.filter(n => n.kk).map(n => ({ name: n.name, x: n.ch.root.position.x, z: n.ch.root.position.z, kids: n.ch.root.children.length })));
  assert.equal(advs.length, 2, 'zwei Abenteurer erwartet');
  const a = advs[0];
  await page.evaluate(({ x, z }) => { const g = window.__taschi; const n = g.world.npcs.find(n => n.kk); n.target = null; n.wait = 99; g.world.placePlayer(x, z + 1.2, Math.PI); g.world.cam.pitch = 0.2; g.world.cam.dist = 4.5; g.world.player.root.visible = false; if (g.world.follower) (g.world.follower.root || g.world.follower.ch?.root || {}).visible = false; n.ch.root.rotation.y = 0; }, a);
  await frames(40);
  await page.screenshot({ path: `${dir}/kaykit-abenteurer.png`, timeout: 90000 });
  await page.evaluate(() => { const g = window.__taschi; g.world.player.root.visible = true; });
  // Gespräch
  page.evaluate(() => { const g = window.__taschi; g.talkToNPC(g.world.npcs.find(n => n.kk)); });
  await page.waitForFunction(() => /Ritterin|Magier|Waldläuferin|Schatzsucher|Kundschafterin|Recke/.test(document.querySelector('.dlg')?.textContent || ''), null, { timeout: 30000 });
  await frames(10);
  await page.screenshot({ path: `${dir}/kaykit-gespraech.png`, timeout: 90000 });
  await page.keyboard.press('Enter'); await page.waitForTimeout(400);
  const ar = await page.evaluate(() => { const b = window.__taschi.world.current.layout.buildings.find(b => b.kind === 'arena'); return { x: b.x, z: b.z + b.d / 2 + 13 }; });
  await page.evaluate(({ x, z }) => { const g = window.__taschi; g.world.placePlayer(x, z, Math.PI); g.world.cam.pitch = 0.3; g.world.cam.dist = 10; }, ar);
  await frames(40);
  await page.screenshot({ path: `${dir}/kaykit-arena.png`, timeout: 90000 });
  assert.deepEqual(errors, []);
  console.log('OK kaykit', advs.map(a => a.name).join(', '));
} finally { await close(); }
