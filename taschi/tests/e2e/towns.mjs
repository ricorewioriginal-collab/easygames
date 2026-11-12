// Browsertest/Schaubild: Platz und Champion-Ort jeder Stadt (eigene Optik je Stadt).
// Run: node tests/e2e/towns.mjs <screenshot-dir> [regionen, z. B. 0,1,2]
import assert from 'node:assert/strict';
import { startSeeded } from './helpers.mjs';
const dir = process.argv[2], list = (process.argv[3] || Array.from({ length: 16 }, (_, i) => i).join(',')).split(',').map(Number);
const t = await startSeeded({ width: 1280, height: 720 });
const { page, errors, close } = t;
const frames = (n) => page.evaluate((n) => new Promise(r => { const f = () => (--n <= 0 ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);
try {
  await page.evaluate(() => { const g = window.__taschi; g.renderer.setProfile?.('high'); g.renderer.adaptive = false; g.renderer.scale = 1; g.renderer.resize(); g.hud.show(false); g.sky?.setWeather?.('clear'); });
  for (const r of list) {
    const info = await page.evaluate(async (r) => {
      const g = window.__taschi; await g.world.loadRegion(r, 'south');
      g.sky?.setWeather?.('clear'); g.hud.show(false);
      const L = g.world.current.layout, b = L.buildings.find(b => b.kind === 'pavilion');
      const champ = g.world.interactables().find(e => e.kind === 'champion');
      return { venue: b.venue, label: b.label, x: b.x, z: b.z, champ: !!champ, centre: g.world.interactables().find(e => e.id === 'fountain')?.label };
    }, r);
    assert.ok(info.champ, 'Champion-Ort ohne Interaktion in Region ' + r);
    await page.evaluate(() => { const g = window.__taschi; g.world.placePlayer(0, 33, Math.PI); g.world.cam.pitch = 0.5; g.world.cam.dist = 11; });
    await frames(30);
    await page.screenshot({ path: `${dir}/stadt-${r}-platz.png`, timeout: 90000 });
    await page.evaluate(({ x, z }) => { const g = window.__taschi; g.world.placePlayer(x, z + 7, Math.PI); g.world.cam.pitch = 0.55; g.world.cam.dist = 11; }, info);
    await frames(30);
    await page.screenshot({ path: `${dir}/stadt-${r}-champion.png`, timeout: 90000 });
    console.log(r, info.label, '·', info.centre);
  }
  assert.deepEqual(errors, []);
  console.log('OK towns');
} finally { await close(); }
