// Browsertest: Reiten (Taste R) und Surfen über einen Fluss in Region 0.
// Run: node tests/e2e/ride.mjs [screenshot-dir]
import assert from 'node:assert/strict';
import { startSeeded, G, advance, teleport } from './helpers.mjs';

const dir = process.argv[2] || null;
const t = await startSeeded({ width: 1280, height: 720 }, (s, { makeMonster, rng }) => {
  s.badges = 3;
  const p = makeMonster('panzerlon', 32, rng);
  s.team.unshift(p); s.companion = p.uid;
});
const { page, errors, close } = t;
const shot = async (name) => { console.log('·', name, new Date().toISOString().slice(11, 19)); if (dir) await page.screenshot({ path: dir + '/' + name + '.png' }); };
const frames = (n = 30) => page.evaluate((n) => new Promise(r => { let k = 0; const f = () => ++k >= n ? r() : requestAnimationFrame(f); requestAnimationFrame(f); }), n);
const pos = () => G(page, () => { const p = window.__taschi.world.player.root.position; return { x: p.x, y: p.y, z: p.z }; });
try {
  // Reiten an/aus mit R
  await page.keyboard.press('KeyR'); await frames(20);
  assert.equal(await G(page, () => window.__taschi.world.mount?.mode), 'ride');
  const a = await pos();
  await page.keyboard.down('KeyW'); await frames(60); await page.keyboard.up('KeyW');
  const b = await pos();
  assert.ok(Math.hypot(b.x - a.x, b.z - a.z) > 1, 'Reiten bewegt sich nicht');
  assert.ok(b.y - await G(page, () => { const p = window.__taschi.world.player.root.position; return window.__taschi.world.current.height(p.x, p.z); }) > 0.1, 'Figur sitzt nicht oben');
  await shot('ride-land');
  await page.keyboard.press('KeyR'); await frames(10);
  assert.equal(await G(page, () => window.__taschi.world.mount), null);
  // Surfen am Ufer des Flusses
  await teleport(page, -50, 12, -Math.PI / 2); await frames(20);
  assert.match(await G(page, () => window.__taschi.world.near?.prompt || ''), /Surfen/);
  for (let k = 0; k < 5; k++) {
    await page.keyboard.press('KeyE');
    try { await page.waitForFunction(() => document.querySelectorAll('.choice').length > 0, null, { timeout: 3000 }); break; } catch {}
  }
  await shot('ride-surf-ask');
  await advance(page, { max: 6, choose: ['Surfen'] });
  assert.equal(await G(page, () => window.__taschi.world.mount?.mode), 'surf');
  await G(page, () => { window.__taschi.world.encounterCooldown = 999; });
  await page.keyboard.down('KeyW'); await frames(12); await page.keyboard.up('KeyW');
  await G(page, () => { const w = window.__taschi.world; w.cam.yaw += 1.1; w.cam.pitch = 0.62; });
  await frames(30);
  await shot('ride-surf');
  // Speichern merkt sich das Ufer, nicht das Wasser
  await G(page, () => window.__taschi.saveNow());
  assert.ok(Math.abs(await G(page, () => window.__taschi.save.location.x) + 50) < 0.5);
  // zurück ans Ufer: automatisch absteigen
  await G(page, () => { const w = window.__taschi.world; w.player.root.rotation.y = Math.PI / 2; w.cam.yaw = -Math.PI / 2; });
  await page.keyboard.down('KeyW');
  await page.waitForFunction(() => !window.__taschi.world.mount, null, { timeout: 20000 });
  await page.keyboard.up('KeyW');
  assert.equal(await G(page, () => window.__taschi.world.current.map.grid.at(window.__taschi.world.player.root.position.x, window.__taschi.world.player.root.position.z)), 0);
  assert.deepEqual(errors, []);
  console.log('ride ok');
} finally { await close(); }
