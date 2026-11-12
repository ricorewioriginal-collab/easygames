// Browsertest/Schaubild: Welt, Wasser und Kampf in hoher Qualität für Vorher/Nachher-Vergleiche.
// Run: node tests/e2e/look.mjs <screenshot-dir> [prefix]
import { startSeeded, G } from './helpers.mjs';
const dir = process.argv[2], pre = process.argv[3] || 'look';
const t = await startSeeded({ width: 1280, height: 720 });
const { page, errors, close } = t;
const frames = (n) => page.evaluate((n) => new Promise(r => { const f = () => (--n <= 0 ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);
try {
  await page.evaluate(() => { const g = window.__taschi; g.renderer.setProfile?.('high'); g.renderer.adaptive = false; g.renderer.scale = 1; g.renderer.resize(); g.hud.show(false); });
  const views = [['town', 0, 30, Math.PI], ['meadow', 0, -10, Math.PI * 0.8], ['field', 30, 0, -Math.PI / 2]];
  for (const [name, x, z, ry] of views) {
    await page.evaluate(([x, z, ry]) => window.__taschi.world.placePlayer(x, z, ry), [x, z, ry]);
    await frames(40);
    await page.screenshot({ path: dir + '/' + pre + '-' + name + '.png', timeout: 90000 });
  }
  // Himmel: flacher Blick nach oben
  await page.evaluate(() => { const g = window.__taschi; g.sky?.setWeather('clear'); g.world.placePlayer(0, -10, Math.PI * 0.8); g.world.cam.pitch = 0.12; });
  await frames(40);
  await page.screenshot({ path: dir + '/' + pre + '-sky.png', timeout: 90000 });
  await page.evaluate(() => { window.__taschi.world.cam.pitch = 0.7; });
  // Wasser: nächstes Ufer suchen
  const spot = await page.evaluate(async () => {
    const { fishingWater } = await import('./src/logic/layout.js');
    const g = window.__taschi, L = g.world.current.layout;
    for (let r = 4; r < 120; r += 2) for (let a = 0; a < 6.28; a += 0.4) { const x = Math.sin(a) * r, z = Math.cos(a) * r; if (!g.world.blocked(x, z) && fishingWater(L, x + Math.sin(a) * 5, z + Math.cos(a) * 5)) return { x, z, a }; }
    return null;
  });
  if (spot) { await page.evaluate(({ x, z, a }) => window.__taschi.world.placePlayer(x, z, a), spot); await frames(40); await page.screenshot({ path: dir + '/' + pre + '-water.png', timeout: 90000 }); }
  // Kampf
  page.evaluate(async () => { const { makeMonster } = await import('./src/logic/monster.js'); const g = window.__taschi; g.battle({ kind: 'wild', foeTeam: [makeMonster('glutzahn', 8)] }); });
  await page.waitForFunction(() => document.querySelector('.bact.fight'), null, { timeout: 120000 });
  await frames(20);
  await page.screenshot({ path: dir + '/' + pre + '-battle.png', timeout: 90000 });
  console.log('look ok', errors.length ? errors : '');
} finally { await close(); }
