// Browsertest/Schaubild: KayKit-Trainer-Optik (alle Figuren in Trainer-Kleidung) und Spielerfigur.
// Run: node tests/e2e/trainers.mjs <screenshot-dir>
import assert from 'node:assert/strict';
import { startSeeded } from './helpers.mjs';
const dir = process.argv[2];
const t = await startSeeded({ width: 1280, height: 720 });
const { page, errors, close } = t;
const frames = (n) => page.evaluate((n) => new Promise(r => { const f = () => (--n <= 0 ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);
try {
  await page.evaluate(async () => {
    const g = window.__taschi; g.renderer.setProfile?.('high'); g.renderer.adaptive = false; g.renderer.scale = 1; g.renderer.resize(); g.hud.show(false);
    const { createCharacter, TRAINER_MODELS, trainerLook } = await import('./src/engine/characters.js');
    const w = g.world, x0 = 0, z0 = 30;
    w.placePlayer(x0, z0 + 2, Math.PI); w.player.root.visible = false; for (const k of ["follower","companion","buddy"]) if (w[k]?.root) w[k].root.visible = false;
    const models = TRAINER_MODELS.map(m => m[0]);
    window.__line = models.map((m, i) => {
      const ch = createCharacter(trainerLook(m, i), { outline: true });
      ch.root.position.set(x0 - 5 + i * 2, w.current.height(x0 - 5 + i * 2, z0), z0); ch.root.rotation.y = 0;
      w.scene.add(ch.root); return ch;
    });
    w.cam.pitch = 0.08; w.cam.dist = 5.5;
  });
  await page.waitForFunction(() => window.__line.every(c => c.mixer), null, { timeout: 120000 });
  const tick = () => page.evaluate(() => window.__line.forEach(c => c.update(1 / 30)));
  for (let i = 0; i < 20; i++) await tick();
  await frames(20);
  await page.screenshot({ path: `${dir}/trainer-lineup.png`, timeout: 90000 });
  await page.evaluate(() => window.__line.forEach(c => c.root.parent.remove(c.root)));
  // Charakter-Editor: Trainer-Stil mit Männlich/Weiblich/Divers
  await page.evaluate(async () => { const { creatorScreen } = await import('./src/ui/screens.js'); window.__res = creatorScreen(window.__taschi, { mode: 'new' }).then(r => (window.__done = r)); });
  await page.waitForSelector('#creatorview canvas', { timeout: 30000 });
  for (const [g, model] of [['Weiblich', 'Rogue'], ['Divers', 'Rogue'], ['Männlich', 'Knight']]) {
    await page.getByText(g, { exact: true }).click(); await page.waitForTimeout(1500);
    await page.screenshot({ path: `${dir}/trainer-editor-${g}.png` });
    const sel = await page.locator('.chip.sel').allInnerTexts();
    assert.ok(sel.includes('🎒 Trainer'), 'Trainer-Stil ist Standard');
    assert.equal(await page.locator('.chip', { hasText: 'Flink' }).count(), g === 'Männlich' ? 0 : 1);
  }
  await page.getByText('Gelehrt').count().then(n => assert.equal(n, 0));
  await page.getByText('Weiblich', { exact: true }).click();
  await page.getByText('Gelehrt', { exact: true }).click(); await page.waitForTimeout(300);
  await page.getByText('So starte ich').click();
  await page.waitForFunction(() => window.__done);
  const r = await page.evaluate(() => window.__done);
  assert.equal(r.gender, 'w'); assert.equal(r.look.kk, 'Mage');
  assert.deepEqual(errors, []);
  console.log('OK trainers');
} finally { await close(); }
