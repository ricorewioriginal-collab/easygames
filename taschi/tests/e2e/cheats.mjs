// Browsertest: Cheat-Menü – öffnen über Menü › System, Schalter per Klick und
// Tastatur, Geschenke (Taschis, Entwicklung, Items) und Effekte (Riese, Aura,
// Regenbogen) an und wieder aus; danach ist der Spielstand wie vorher.
// Run: node tests/e2e/cheats.mjs [screenshot-dir] [phone]
import assert from 'node:assert/strict';
import { startSeeded, G } from './helpers.mjs';

const dir = process.argv[2] || null, phone = process.argv[3] === 'phone';
const t = await startSeeded(phone ? { width: 390, height: 844, touch: true } : { width: 1280, height: 720 }, () => {});
const { page, errors, close } = t;
const shot = async (name) => { console.log('·', name, new Date().toISOString().slice(11, 19)); if (dir) await page.screenshot({ path: dir + '/' + name + '.png' }); };
const frames = (n = 30) => page.evaluate((n) => new Promise(r => { let k = 0; const f = () => ++k >= n ? r() : requestAnimationFrame(f); requestAnimationFrame(f); }), n);
const P = phone ? 'phone-' : '';
const flip = (id) => page.evaluate((id) => document.querySelector('[data-cheat="' + id + '"]').click(), id);
try {
  await G(page, () => { const g = window.__taschi; g.renderer.adaptive = false; g.world.encounterCooldown = 999; });
  const before = await G(page, () => { const s = window.__taschi.save; return JSON.stringify({ team: s.team, box: s.box, dex: s.dex, bag: s.bag, coins: s.coins }); });
  await page.evaluate(() => import('./src/ui/menus.js').then(m => m.openPauseMenu(window.__taschi, 'system')));
  await page.evaluate(() => [...document.querySelectorAll('button.row')].find(b => /Cheats/.test(b.textContent)).click());
  await page.waitForSelector('[data-cheat="god"]');
  await frames(5);
  await shot(P + 'cheats-menu');
  for (const id of ['allmons', 'maxevo', 'items', 'god', 'giant', 'aura', 'disco']) await flip(id);
  // Tastatur: Fokus auf „Ein-Treffer-K.O.“ und mit Enter umschalten
  await page.evaluate(() => { const ui = window.__taschi.ui, sc = ui.stack[ui.stack.length - 1]; sc.nav.focus(document.querySelector('[data-cheat="ohko"]')); });
  await page.keyboard.press('Enter');
  await frames(5);
  const on = await G(page, () => Object.keys(window.__taschi.save.cheats.on).sort());
  assert.deepEqual(on, ['aura', 'allmons', 'disco', 'giant', 'god', 'items', 'maxevo', 'ohko'].sort());
  const st = await G(page, () => { const s = window.__taschi.save; return { box: s.box.length, lv: s.team[0].lv, coins: s.coins }; });
  assert.ok(st.box > 200 && st.lv === 70 && st.coins > 999999, JSON.stringify(st));
  await shot(P + 'cheats-on');
  await page.evaluate(() => window.__taschi.ui.clear());
  await frames(60);
  assert.ok(await G(page, () => document.body.classList.contains('cheat-disco') && window.__taschi.world.player.root.scale.x > 2), 'Effekte fehlen');
  await shot(P + 'cheats-world');
  // alles aus
  await page.evaluate(() => import('./src/ui/cheats.js').then(m => { m.openCheats(window.__taschi); }));
  await page.waitForSelector('[data-cheat="god"]');
  await page.evaluate(() => [...document.querySelectorAll('button.btn')].find(b => /Alle Cheats aus/.test(b.textContent)).click());
  await page.evaluate(() => window.__taschi.ui.clear());
  await frames(60);
  const after = await G(page, () => { const s = window.__taschi.save; return JSON.stringify({ team: s.team, box: s.box, dex: s.dex, bag: s.bag, coins: s.coins }); });
  assert.equal(after, before, 'Spielstand nicht wiederhergestellt');
  assert.ok(await G(page, () => !document.body.classList.contains('cheat-disco') && Math.abs(window.__taschi.world.player.root.scale.x - 1) < 0.01 && !window.__taschi.world.cheatAura.parent), 'Effekte nicht aus');
  await shot(P + 'cheats-off');
  assert.deepEqual(errors, [], 'Fehler: ' + errors.join('\n'));
  console.log('✓ Cheats ok');
} finally { await close(); }
