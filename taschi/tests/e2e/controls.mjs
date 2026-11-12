// Browsertest: Switch-Controller (simuliert), Maus, Bildschirmtastatur,
// getragene Gegenstände und Angeln. Run: node tests/e2e/controls.mjs [screenshot-dir]
import assert from 'node:assert/strict';
import { launch, seededStorage, waitState, waitIdle, G, advance } from './helpers.mjs';

const dir = process.argv[2] || null;
const storage = await seededStorage((s) => { s.bag.heilbeere = 2; s.bag.lernband = 1; });
const t = await launch({ width: 1280, height: 720, storage });
const { page, errors, close } = t;
const shot = async (name) => { if (dir) await page.screenshot({ path: dir + '/' + name + '.png' }); };
// Nintendo Switch Pro Controller nachbilden (Standard-Mapping: 0 unten = B, 1 rechts = A, 2 links = Y, 3 oben = X)
await page.context().addInitScript(() => {
  const pad = { id: 'Pro Controller (STANDARD GAMEPAD Vendor: 057e Product: 2009)', index: 0, connected: true, mapping: 'standard', axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })) };
  window.__pad = pad; navigator.getGamepads = () => [pad];
});
// Taste für einige echte Frames halten und wieder loslassen (swiftshader ist langsam)
const frames = (n) => page.evaluate((n) => new Promise(r => { const f = () => (--n <= 0 ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);
const pad = async (i) => { await page.evaluate((i) => { window.__pad.buttons[i] = { pressed: true, value: 1 }; }, i); await frames(3); await page.evaluate((i) => { window.__pad.buttons[i] = { pressed: false, value: 0 }; }, i); await frames(3); };
const A = 1, B = 0, X = 3, DOWN = 13, RIGHT = 15;
try {
  await page.goto(t.base);
  await waitState(page, 'title');
  await page.getByText('Fortsetzen').click();
  await waitState(page, 'world'); await waitIdle(page);
  // X öffnet das Menü, B schließt es
  await pad(X);
  assert.equal(await G(page, () => window.__taschi.ui.blocking), true, 'X öffnet kein Menü');
  assert.equal(await G(page, () => window.__taschi.input.lastDevice), 'gamepad');
  await shot('controls-menu-pad');
  await pad(B);
  assert.equal(await G(page, () => window.__taschi.ui.blocking), false, 'B schließt das Menü nicht');
  // Einstellungen: Switch-Layout und Übersicht
  await page.evaluate(() => import('./src/ui/menus.js').then(m => m.openPauseMenu(window.__taschi, 'options')));
  await page.waitForTimeout(500);
  assert.ok(await page.getByText(/Nintendo Switch/).count(), 'Switch-Layout fehlt');
  assert.ok(await page.locator('.ctrltable').count(), 'Steuerungsübersicht fehlt');
  await page.locator('.ctrltable').scrollIntoViewIfNeeded(); await shot('controls-options');
  // Maus: Rechtsklick = zurück
  await page.mouse.click(640, 360, { button: 'right' }); await frames(4);
  assert.equal(await G(page, () => window.__taschi.ui.blocking), false, 'Rechtsklick schließt nicht');
  // Bildschirmtastatur mit dem Controller: A tippt „A“, rechts + A tippt „B“, B löscht, X fertig
  const name = page.evaluate(() => window.__taschi.ui.textEntry({ title: 'Test', value: '' }));
  await page.waitForSelector('.oskkey.focus'); await frames(2);
  await pad(A); await pad(RIGHT); await pad(A); await pad(A); await pad(B);
  await shot('controls-osk');
  await pad(X);
  assert.equal(await name, 'AB');
  // Tragen: Heilbeere über den Status-Bildschirm geben
  await page.evaluate(() => import('./src/ui/menus.js').then(m => m.openStatus(window.__taschi, window.__taschi.save.team[0])));
  await page.waitForTimeout(600);
  await page.getByText(/Trägt: nichts/).click(); await page.waitForTimeout(400);
  await page.locator('.row', { hasText: 'Heilbeere' }).first().click(); await page.waitForTimeout(500);
  assert.equal(await G(page, () => window.__taschi.save.team[0].held), 'heilbeere');
  assert.equal(await G(page, () => window.__taschi.save.bag.heilbeere), 1);
  await shot('controls-held');
  await page.evaluate(() => { const ui = window.__taschi.ui; while (ui.stack.length) ui.pop(ui.stack[ui.stack.length - 1]); }); await page.waitForTimeout(500);
  // Angeln: Ufer suchen, zum Wasser drehen, A drücken, beim Anbiss A
  const spot = await page.evaluate(async () => {
    const { fishingWater } = await import('./src/logic/layout.js');
    const g = window.__taschi, L = g.world.current.layout;
    for (let x = -120; x < 120; x += 1.5) for (let z = -120; z < 120; z += 1.5) for (let a = 0; a < 6.28; a += 0.785) {
      if (!g.world.blocked(x, z) && fishingWater(L, x + Math.sin(a) * 2.2, z + Math.cos(a) * 2.2)) return { x, z, a };
    }
    return null;
  });
  assert.ok(spot, 'kein Ufer in Region 0');
  await page.evaluate(({ x, z, a }) => window.__taschi.world.placePlayer(x, z, a), spot);
  await page.waitForFunction(() => window.__taschi.world.near?.kind === 'fish', null, { timeout: 8000 }).catch(() => {});
  assert.equal(await G(page, () => window.__taschi.world.near?.kind), 'fish', 'Angeln wird nicht angeboten');
  // im Spiel selbst auf das „❗“ reagieren (der langsame Testbrowser verpasst sonst das Zeitfenster)
  await page.evaluate(() => { const ob = new MutationObserver(() => { const m = document.querySelector('.fishmark'); if (m && !window.__seen) { window.__seen = 1; window.__shot = 1; } if (document.querySelector('.fishmark.bite')) { ob.disconnect(); window.__pad.buttons[1] = { pressed: true, value: 1 }; setTimeout(() => { window.__pad.buttons[1] = { pressed: false, value: 0 }; }, 600); } }); ob.observe(document.body, { subtree: true, attributes: true, childList: true, characterData: true }); });
  await page.evaluate(() => { window.__pad.buttons[1] = { pressed: true, value: 1 }; });   // A: Angeln
  await frames(3); await page.evaluate(() => { window.__pad.buttons[1] = { pressed: false, value: 0 }; });
  await advance(page, { max: 10, until: () => !!document.querySelector('.fishmark') || window.__taschi.state === 'battle' });
  await shot('controls-fishing');
  await waitState(page, 'battle', 30000);
  assert.ok(await G(page, () => window.__taschi.save.bag.angel === 1));
  await page.waitForTimeout(1500); await shot('controls-fish-battle');
  assert.deepEqual(errors, []);
  console.log('controls ok');
} finally { await close(); }
