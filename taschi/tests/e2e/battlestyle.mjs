// Browsertest: Kampf in der offenen Welt (Wiese und Wasser), Befehlsmenü rechts unten,
// Plaketten mit Level/Geschlecht, Wurf mit Leuchtspur, Namensschilder, Begleiter-Plakette, Taschibuch.
// Run: node tests/e2e/battlestyle.mjs [screenshot-dir]
import assert from 'node:assert/strict';
import { startSeeded, G, advance, teleport } from './helpers.mjs';

const dir = process.argv[2] || null;
const t = await startSeeded({ width: 1280, height: 720 }, (s, { makeMonster, rng }) => {
  s.badges = 3; s.bag.kapsel = 5;
  const p = makeMonster('panzerlon', 32, rng);
  s.team.push(p);
});
const { page, errors, close } = t;
const shot = async (name) => { console.log('·', name, new Date().toISOString().slice(11, 19)); if (dir) await page.screenshot({ path: dir + '/' + name + '.png' }); };
const frames = (n = 30) => page.evaluate((n) => new Promise(r => { let k = 0; const f = () => ++k >= n ? r() : requestAnimationFrame(f); requestAnimationFrame(f); }), n);
const waitMenu = () => page.waitForFunction(() => document.querySelector('.bact.fight'), null, { timeout: 120000 });
const endBattle = async () => {
  for (let i = 0; i < 20 && await G(page, () => window.__taschi.state === 'battle'); i++) {
    const run = page.locator('.bact.run:not(.disabled)'); if (await run.count()) await run.first().dispatchEvent('click');
    await advance(page, { max: 20, until: () => window.__taschi.state !== 'battle' || !!document.querySelector('.bact.fight') });
  }
};
try {
  await G(page, () => { const g = window.__taschi; g.renderer.adaptive = false; g.world.encounterCooldown = 999; });
  // Namensschilder + Begleiter-Plakette in der Welt
  const wild = await G(page, () => { const w = window.__taschi.world.wild[0]; if (!w) return null; const p = w.c.root.position; return { x: p.x, z: p.z }; });
  assert.ok(wild, 'keine wilden Taschis');
  await G(page, (p) => { const w = window.__taschi.world; w.wild.forEach(x => { x.behavior = 'curious'; }); w.placePlayer(p.x - 5, p.z - 5, Math.atan2(5, 5)); }, wild);
  await frames(30);
  assert.ok(await G(page, () => [...document.querySelectorAll('.wtag')].some(t => !t.hidden && /Lv\. \d+/.test(t.textContent))), 'kein Namensschild');
  assert.ok(await G(page, () => !document.querySelector('.buddy').classList.contains('hidden')), 'keine Begleiter-Plakette');
  await shot('bs-world-tags');
  // Kampf direkt in der Welt gegen dieses Taschi
  page.evaluate(() => { const g = window.__taschi; const w = g.world.wild[0]; g.script(() => g.wildBattle(w)); });
  await waitMenu(); await frames(20);
  assert.equal(await G(page, () => window.__taschi.battleScene.inWorld), true, 'Kampf nicht in der Welt');
  assert.match(await G(page, () => document.querySelector('.bhud.foe').textContent), /Lv\. \d+[♂♀]/);
  assert.equal(await G(page, () => document.querySelectorAll('.bacts .bact').length), 4);
  await shot('bs-battle-meadow');
  await page.locator('.bact.fight').dispatchEvent('click'); await frames(10);
  assert.ok(await G(page, () => document.querySelectorAll('.bact.move').length > 0));
  await page.keyboard.press('ArrowDown'); await frames(5);
  await shot('bs-battle-moves');
  await page.locator('.bact.backbtn').dispatchEvent('click'); await frames(5);
  // Kapsel werfen: Leuchtspur mitten im Flug
  await page.locator('.bact.bag').dispatchEvent('click'); await frames(5);
  await page.locator('.bact.bag').first().dispatchEvent('click');
  await page.waitForFunction(() => window.__taschi.battleScene.root?.children.some(c => c.material?.uniforms?.alpha), null, { timeout: 30000 });
  await shot('bs-throw');
  await endBattle();
  assert.equal(await G(page, () => window.__taschi.world.player.root.visible), true, 'Spieler bleibt unsichtbar');
  // Wasser: surfen und Kampf auf dem Wasser
  await teleport(page, -50, 12, -Math.PI / 2); await frames(10);
  const spot = await page.evaluate(async () => {
    const { fishingWater } = await import('./src/logic/layout.js');
    const g = window.__taschi, L = g.world.current.layout;
    for (let r = 2; r < 60; r += 1.5) for (let a = 0; a < 6.28; a += 0.3) { const x = -50 - Math.sin(a + 1.57) * r, z = 12 + Math.cos(a + 1.57) * r;
      for (let b = 0; b < 6.28; b += 0.4) { let ok = true; for (let k = 0; k <= 12 && ok; k += 2) ok = fishingWater(L, x + Math.sin(b) * k, z + Math.cos(b) * k); if (ok) return { x, z, b }; } }
    return null;
  });
  assert.ok(spot, 'kein Wasser gefunden');
  await G(page, (sp) => { const g = window.__taschi; const m = g.save.team.find(x => x.id === 'panzerlon'); g.world.placePlayer(sp.x, sp.z, sp.b); g.world.setMount('surf', m); g.world.refreshFollower(); }, spot);
  await frames(20);
  page.evaluate(async () => { const { makeMonster } = await import('./src/logic/monster.js'); const g = window.__taschi; g.battle({ kind: 'wild', foeTeam: [makeMonster(g.world.wild[0]?.id || 'glutzahn', 6)] }); });
  await waitMenu(); await frames(20);
  assert.equal(await G(page, () => window.__taschi.battleScene.inWorld && window.__taschi.battleScene.surf), true, 'kein Wasserkampf');
  await shot('bs-battle-water');
  await endBattle();
  // Taschibuch: Raster + großes Modell
  await G(page, async () => { const { openPauseMenu } = await import('./src/ui/menus.js'); openPauseMenu(window.__taschi, 'dex'); });
  await frames(30);
  assert.ok(await G(page, () => document.querySelector('#dexbig canvas') && document.querySelectorAll('.dexcell').length > 50), 'Taschibuch-Raster fehlt');
  await page.keyboard.press('ArrowRight'); await frames(20);
  await shot('bs-dex');
  await page.keyboard.press('Escape'); await frames(10);
  // Handy hochkant
  await page.setViewportSize({ width: 390, height: 844 });
  page.evaluate(async () => { const { makeMonster } = await import('./src/logic/monster.js'); window.__taschi.battle({ kind: 'trainer', trainerName: 'Testerin', foeTeam: [makeMonster('glutzahn', 6), makeMonster('glutzahn', 7)] }); });
  await waitMenu(); await frames(20);
  await shot('bs-battle-phone');
  const over = await G(page, () => { const a = document.querySelector('.bacts .bact').getBoundingClientRect(), b = document.querySelector('.bhud.me').getBoundingClientRect(); return a.left < b.right && b.top < a.bottom && a.top < b.bottom; });
  assert.equal(over, false, 'Menü überdeckt die Plakette');
  await G(page, () => { window.__taschi.battleScene.cancelChoice?.(); });
  await page.setViewportSize({ width: 1280, height: 720 });
  await G(page, () => location.reload());
  console.log('battlestyle ok', errors.length ? errors : '');
  assert.equal(errors.length, 0, errors.join('\n'));
} finally { await close(); }
