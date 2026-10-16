// Browser test: character creator (gender, name, trainer look), settings
// from the title screen, wardrobe, the offer for older saves and collision.
// Run: node tests/e2e/character.mjs [screenshot-dir]
import assert from 'node:assert/strict';
import { launch, startSeeded, seededStorage, G, waitState, waitIdle, advance } from './helpers.mjs';

const dir = process.argv[2] || null;
const step = (s) => console.log('  ✓ ' + s);
const shot = async (page, name) => { if (dir) await page.screenshot({ path: dir + '/' + name + '.png' }); };

// 1. title + settings in portrait, then the creator
{
  const t = await launch({ width: 412, height: 860, touch: true });
  const { page, errors } = t;
  try {
    await page.goto(t.base);
    await waitState(page, 'title');
    await page.getByText('Einstellungen').click();
    await page.waitForSelector('.screen .panel');
    await page.waitForTimeout(400);
    const top = await G(page, () => +getComputedStyle(document.querySelector('.screen')).zIndex > +getComputedStyle(document.querySelector('#title')).zIndex);
    assert.ok(top, 'Einstellungen liegen über dem Titel');
    assert.equal(await page.locator('.tabs').count(), 0, 'keine Spielreiter im Titel');
    await shot(page, '10-title-settings');
    await page.locator('.closebtn').first().click();
    await page.waitForTimeout(300);
    step('Einstellungen im Titelmenü liegen oben und zeigen nur Optionen');
    await page.getByText('Neues Abenteuer').click();
    await page.waitForSelector('#creatorview canvas', { timeout: 30000 });
    for (const g of ['Männlich', 'Weiblich', 'Divers']) { await page.getByText(g, { exact: true }).click(); await page.waitForTimeout(600); await shot(page, '11-creator-' + g); }
    await page.locator('input.name').fill('Kimi');
    await page.getByText('Männlich', { exact: true }).click();
    await page.waitForTimeout(400);
    assert.equal(await page.locator('input.name').inputValue(), 'Kimi', 'eigener Name bleibt beim Wechsel');
    await page.getByText('So starte ich').click();
    for (let i = 0; i < 40 && !(await G(page, () => window.__taschi.state === 'world')); i++) { await page.keyboard.press('Enter'); await page.waitForTimeout(700); }
    await waitState(page, 'world');
    const p = await G(page, () => window.__taschi.save.player);
    assert.equal(p.name, 'Kimi'); assert.equal(p.gender, 'm'); assert.equal(p.look.hat, 'trainercap'); assert.equal(p.look.top, 'trainer');
    await page.waitForTimeout(1200);
    await shot(page, '12-world-trainer');
    step('Charaktererstellung: Geschlecht, Name, Trainer-Look');
    assert.deepEqual(errors, []);
  } finally { await t.close(); }
}

// 2. older save without gender: offer, then wardrobe and collision
{
  const storage = await seededStorage((s) => { delete s.player.gender; s.player.look = {}; });
  const t = await launch({ width: 1280, height: 720, storage });
  const { page, errors } = t;
  try {
    await page.goto(t.base);
    await waitState(page, 'title');
    await page.getByText('Fortsetzen').click();
    await page.waitForSelector('.choice', { timeout: 60000 });
    await advance(page, { until: () => !!document.querySelector('#creatorview'), choose: ['Jetzt gestalten'] });
    await page.waitForSelector('#creatorview canvas');
    assert.equal(await page.locator('input.name').inputValue(), 'Testi', 'alter Name vorausgefüllt');
    await page.getByText('Divers', { exact: true }).click();
    await page.getByText('So starte ich').click();
    await waitIdle(page);
    assert.equal(await G(page, () => window.__taschi.save.player.gender), 'd');
    assert.equal(await G(page, () => window.__taschi.save.flags.lookOffered), true);
    step('Alter Spielstand: Charaktererstellung wird einmal angeboten');

    await page.keyboard.press('Escape');
    await page.waitForSelector('.tabs');
    await page.locator('.tab', { hasText: 'Trainer' }).click();
    await page.getByText('Umkleiden').click();
    await page.waitForSelector('#creatorview canvas');
    await page.getByText('Sonnenhut', { exact: true }).click();
    await page.waitForTimeout(400);
    await shot(page, '13-wardrobe');
    await page.getByText('Fertig').click();
    await page.waitForTimeout(400);
    assert.equal(await G(page, () => window.__taschi.save.player.look.hat), 'sunhat');
    await page.keyboard.press('Escape');
    await waitIdle(page);
    step('Kleiderschrank im Menü ändert das Outfit');

    const res = await G(page, () => {
      const g = window.__taschi, w = g.world, L = w.current.layout;
      const push = (x0, z0, tx, tz) => {
        w.placePlayer(x0, z0, 0);
        const p = w.player.root.position;
        for (let i = 0; i < 200; i++) {
          const dx = tx - p.x, dz = tz - p.z, l = Math.hypot(dx, dz) || 1, ux = dx / l, uz = dz / l, yaw = w.cam.yaw;
          w.movePlayer(0.05, { move: { x: ux * Math.cos(yaw) - uz * Math.sin(yaw), y: ux * Math.sin(yaw) + uz * Math.cos(yaw) }, held: () => false });
        }
        return Math.hypot(p.x - tx, p.z - tz);
      };
      const out = {};
      const f = L.props.find(p => p.kind === 'fountain'); out.fountain = push(f.x, f.z + 9, f.x, f.z);
      const s = L.signs[0]; out.sign = push(s.x - 4, s.z, s.x, s.z);
      const lamp = L.props.find(p => p.kind === 'lamp'); out.lamp = push(lamp.x + (f.x - lamp.x) * 0.3, lamp.z + (f.z - lamp.z) * 0.3, lamp.x, lamp.z);
      const h = L.buildings.find(b => b.id === 'house0'); out.house = push(h.x - 9, h.z, h.x, h.z);
      return out;
    });
    console.log('    Abstand zum Ziel', JSON.stringify(res));
    assert.ok(res.fountain > 3.4 && res.sign > 0.6 && res.lamp > 0.5 && res.house > 3.8, 'nicht durchgelaufen');
    step('Brunnen, Schild, Laterne und Haus sind fest');
    assert.deepEqual(errors, []);
  } finally { await t.close(); }
}
console.log('Charaktertest fertig.');
