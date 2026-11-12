// Browsertest: Fotomodus (freie Kamera, Filter, Foto ins Album) und Fliegen
// auf einem Flug-Taschi zu einem besuchten Ort.
// Run: node tests/e2e/switch.mjs [screenshot-dir]
import assert from 'node:assert/strict';
import { startSeeded, G } from './helpers.mjs';

const dir = process.argv[2] || null;
const t = await startSeeded({ width: 1280, height: 720 }, (s, { makeMonster, rng }) => {
  s.badges = 5; s.visited[1] = true; s.flags.firstQuest = true; s.trainers.rival_0 = true;
  const d = makeMonster('glutdrach', 30, rng);
  s.team.unshift(d); s.companion = d.uid;
});
const { page, errors, close } = t;
const shot = async (name) => { console.log('·', name); if (dir) await page.screenshot({ path: dir + '/' + name + '.png' }); };
const frames = (n = 30) => page.evaluate((n) => new Promise(r => { let k = 0; const f = () => ++k >= n ? r() : requestAnimationFrame(f); requestAnimationFrame(f); }), n);
try {
  // Fotomodus
  await G(page, () => { window.__taschi.openPhoto(); });
  await page.waitForSelector('.photo-mode');
  assert.equal(await G(page, () => !!window.__taschi.world.photo), true, 'Fotomodus aktiv');
  const before = await G(page, () => window.__taschi.world.camera.position.toArray());
  const box = await page.locator('.photo-drag').boundingBox();
  await page.mouse.move(box.width / 2, box.height / 2); await page.mouse.down(); await page.mouse.move(box.width / 2 + 220, box.height / 2 - 60, { steps: 6 }); await page.mouse.up();
  await frames(6);
  const after = await G(page, () => window.__taschi.world.camera.position.toArray());
  assert.ok(Math.hypot(after[0] - before[0], after[2] - before[2]) > 0.5, 'Kamera dreht sich');
  await page.getByText('🎨 Filter').click(); await page.getByText('🕺 Pose').click(); await frames(10);
  await shot('photo-mode');
  await page.getByText('📸 Foto').click();
  await page.waitForSelector('.photo-shot');
  const album = await G(page, () => JSON.parse(localStorage.getItem('taschi.photos.v1') || '[]'));
  assert.equal(album.length, 1, 'Foto im Album');
  assert.match(album[0].src, /^data:image\/jpeg/);
  await shot('photo-shot');
  await page.getByText('Weiter fotografieren').click();
  await page.getByText('✕ Ende').click();
  await frames(4);
  assert.equal(await G(page, () => window.__taschi.world.photo), null, 'Fotomodus beendet');
  console.log('  ✓ Fotomodus: drehen, Filter, Pose, Foto im Album');

  // Fliegen
  await G(page, () => { window.__taschi.flyMenu(); });
  await page.waitForSelector('.row.focusable');
  assert.match(await page.locator('.panel h2').first().innerText(), /Fliegen mit/);
  const fly = page.locator('.row.focusable', { hasText: '2.' });
  const done = G(page, () => new Promise(res => { const g = window.__taschi; const t0 = performance.now(); let peak = 0; const f = () => { peak = Math.max(peak, g.world.lift || 0); if (g.world.current?.region === 1 && g.world.lift === undefined && !g.busy) res(peak); else if (performance.now() - t0 > 240000) res(-1); else requestAnimationFrame(f); }; requestAnimationFrame(f); }));
  await fly.click();
  await page.waitForFunction(() => (window.__taschi.world.lift || 0) > 8, null, { timeout: 30000 });
  await shot('fly-up');
  const peak = await done;
  assert.ok(peak > 20, 'Flug-Taschi steigt auf (' + peak + ')');
  assert.equal(await G(page, () => window.__taschi.world.current.region), 1, 'Angekommen in Region 2');
  assert.equal(await G(page, () => window.__taschi.world.mount), null, 'nach der Landung abgestiegen');
  await frames(20);
  await shot('fly-landed');
  console.log('  ✓ Fliegen: Aufstieg, Reise, Landung');

  // Sternennest-Raid mit Ranger-Helfer
  const nest = await G(page, () => window.__taschi.world.current.layout.nest);
  assert.ok(nest, 'Sternennest in der Region');
  await G(page, (n) => { const g = window.__taschi; g.world.player.root.position.set(n.x + 1.8, 0, n.z); g.world.player.root.rotation.y = -Math.PI / 2; }, nest);
  await frames(10);
  await G(page, () => { const g = window.__taschi; g.script(() => g.interact(g.world.interactables().find(e => e.kind === 'raid'))); });
  await page.waitForSelector('#dialog', { timeout: 30000 });
  assert.equal(await G(page, () => document.body.classList.contains('cine')), true, 'Kinobalken in der Zwischensequenz');
  await shot('raid-ask');
  const ranger = page.locator('.choice', { hasText: 'Ranger' });
  for (let i = 0; i < 10 && !(await ranger.count()); i++) { await page.keyboard.press('Enter'); await page.waitForTimeout(400); }
  await ranger.first().click();
  await page.waitForFunction(() => window.__taschi.state === 'battle', null, { timeout: 60000 });
  const info = await G(page, () => { const b = window.__taschi.battleScene.b; return { format: b.format, ally: !!b.sides[0].team[1]?.ally, boss: b.sides[1].team[0].boss || 0 }; });
  assert.deepEqual([info.format, info.ally, info.boss > 1], [2, true, true], 'Raid: Doppelkampf mit Helfer gegen Riesen');
  await page.locator('.bact.fight').first().waitFor({ timeout: 90000 });
  await shot('raid-battle');
  for (let i = 0; i < 12 && await G(page, () => window.__taschi.state === 'battle'); i++) {
    const run = page.locator('.bact.run'); if (await run.count()) await run.first().dispatchEvent('click');
    await page.waitForTimeout(1500); await page.keyboard.press('Enter');
  }
  await page.waitForFunction(() => window.__taschi.state === 'world', null, { timeout: 60000 });
  console.log('  ✓ Raid: Zwischensequenz, Helfer, Riese, Flucht');
  assert.deepEqual(errors, []);
  console.log('Switch-Test fertig.');
} finally { await close(); }
