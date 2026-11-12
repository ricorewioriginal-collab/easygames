// Browsertest: Taschis aus 3D-Modellen (Quaternius) in Welt, Team-Menü und Kampf.
// Run: node tests/e2e/models.mjs [screenshot-dir]
import assert from 'node:assert/strict';
import { startSeeded, G, advance } from './helpers.mjs';

const dir = process.argv[2] || null;
const t = await startSeeded({ width: 1280, height: 720 }, (s, { makeMonster, rng }) => {
  const d = makeMonster('drakoflamm', 34, rng);
  s.team.unshift(d, makeMonster('hutzel', 8, rng), makeMonster('frostzottel', 32, rng), makeMonster('kosmolino', 30, rng));
  s.companion = d.uid;
  for (const m of s.team) s.dex[m.id] = 2;
});
const { page, errors, close } = t;
const shot = async (name) => { console.log('·', name, new Date().toISOString().slice(11, 19)); if (dir) await page.screenshot({ path: dir + '/' + name + '.png' }); };
const frames = (n = 30) => page.evaluate((n) => new Promise(r => { let k = 0; const f = () => ++k >= n ? r() : requestAnimationFrame(f); requestAnimationFrame(f); }), n);
try {
  // alle Modelle laden
  await page.evaluate(() => import('./src/engine/models.js').then(m => m.preloadModels()));
  await G(page, () => window.__taschi.world.refreshFollower());
  await frames(40);
  assert.ok(await G(page, () => !!window.__taschi.world.follower.c.model), 'Begleiter-Modell fehlt');
  await G(page, () => { const w = window.__taschi.world; w.cam.yaw += 2.4; });
  await frames(30);
  await shot('models-world');
  await page.evaluate(() => { import('./src/ui/menus.js').then(m => m.openPauseMenu(window.__taschi, 'team')); });
  await page.waitForTimeout(1800);
  await shot('models-team');
  await page.evaluate(() => { const ui = window.__taschi.ui; while (ui.stack.length) ui.pop(ui.stack[ui.stack.length - 1]); }); await page.waitForTimeout(300);
  // wilder Kampf gegen ein Modell-Taschi
  await page.evaluate(() => { const g = window.__taschi; import('./src/logic/monster.js').then(M => g.script(() => g.battle({ kind: 'wild', foeTeam: [M.makeMonster('felsgoliath', 30, g.rng)], canCatch: true, ai: 0 }))); });
  await page.waitForFunction(() => window.__taschi.state === 'battle', null, { timeout: 30000 });
  await page.waitForFunction(() => !!document.querySelector('.bact'), null, { timeout: 60000 });
  await frames(20);
  await shot('models-battle');
  const foe = await G(page, () => { const e = [...window.__taschi.battleScene.models.values()].map(x => x.c).find(c => c.id === 'felsgoliath'); return e && { model: !!e.model, clips: Object.keys(e.clips || {}).length }; });
  assert.ok(foe?.model && foe.clips > 3, 'Gegner-Modell fehlt ' + JSON.stringify(foe));
  // eine Attacke: Animation läuft ohne Fehler
  await page.locator('.bact').first().click(); await page.waitForTimeout(400);
  await page.locator('.move, .bmove, .moves button').first().click().catch(() => {});
  await page.waitForTimeout(1200);
  await shot('models-attack');
  assert.deepEqual(errors, []);
  console.log('models ok');
} finally { await close(); }
