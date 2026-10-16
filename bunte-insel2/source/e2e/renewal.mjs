// Prüft die gebaute Neuauflage im Browser, einschließlich Inselwechsel, Speichern und echter Mitfahrt.
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { chromium, devices } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8090/bunte-insel2/';
const OUT = process.env.OUT || '/tmp/bi2-review'; mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const reviewShot = async (p, name) => { await p.waitForFunction(() => !document.querySelector('.banner,.toast')); await p.screenshot({ path: OUT + '/' + name }); };
let page;
try {
  page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.setDefaultTimeout(45000);
  console.log('Prüfe Einstieg …');
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(BASE + '?test=1'); await page.waitForFunction(() => window.__bi2);
  await page.click('#btn-slots'); await page.click('#slot-3 .btn.green'); await page.click('#mode-free .btn');
  await page.getByRole('button', { name: '✔ Fertig', exact: true }).click();
  await page.waitForFunction(() => window.__bi2.g.phase === 'play');
  const start = await page.evaluate(() => { const g = window.__bi2.g; return { pos: { x: g.player.pos.x, z: g.player.pos.z }, dialogue: !!document.querySelector('.dialog') }; });
  assert.ok(Math.hypot(start.pos.x - 4, start.pos.z + 18) < 8); assert.equal(start.dialogue, false);
  await reviewShot(page, '01-ortsplatz.png');
  const worlds = await page.evaluate(() => window.__bi2.g.worlds.defs.map(w => w.id));
  for (const id of worlds) {
    await page.evaluate(id => { const g = window.__bi2.g, w = g.worlds.byId(id); g.teleport(w.spawn.x, w.spawn.z); }, id);
    await page.waitForFunction(id => window.__bi2.g.worlds.loaded.has(id), id);
    const scene = await page.evaluate(id => { const g = window.__bi2.g; return { activity: id === 'bauland' ? !!g.interact.get('freie_baukiste') : !!g.system('neighborhoods').sites.get(id), npc: id === 'bauland' || window.__bi2.sys.npcs.live.has('nachbar_' + id) }; }, id);
    assert.ok(scene.activity && scene.npc, 'Aktivität und Bewohner in ' + id);
  }
  console.log('Alle 20 Welten mit Aktivitäten und Bewohnern geprüft.');
  // Garten: drei Beete säen und gießen, dann die Insel verlassen und wiederkehren.
  await page.evaluate(() => { const g = window.__bi2.g; g.teleport(100, 70); for (let i = 0; i < 3; i++) { const a = g.interact.get('ort:hub:beet' + i); a.act(); a.act(); } g.save.playTime += 15; g.teleport(600, -420); g.teleport(100, 70); for (let i = 0; i < 3; i++) g.interact.get('ort:hub:beet' + i).act(); });
  assert.ok(await page.evaluate(() => window.__bi2.g.flag('ort:hub:fertig')));
  await page.evaluate(() => { const g = window.__bi2.g, s = g.system('neighborhoods').sites.get('hub'); g.teleport(s.x, s.z + 8, Math.PI); });
  await reviewShot(page, '02-hof.png');
  console.log('Prüfe Hof und Küche …');
  // Kochvorgang über die tatsächlichen Knöpfe, Zutaten erst bei erfolgreichem Timing verbrauchen.
  await page.evaluate(() => { const g = window.__bi2.g; g.give('karotte', 2); g.openPanel('hofkueche'); });
  const before = await page.evaluate(() => window.__bi2.g.count('karotte'));
  await page.getByRole('button', { name: '🔪 Zutaten schneiden', exact: true }).click();
  await page.getByRole('button', { name: '🥣 Rühren', exact: true }).click();
  let cooked = false;
  for (let attempt = 0; attempt < 8 && !cooked; attempt++) {
    await page.waitForFunction(() => { const i = document.querySelector('.cooking-meter i'); const n = parseFloat(i?.style.left ?? '0'); return n > 44 && n < 58; });
    await page.getByRole('button', { name: '🍳 Jetzt herausnehmen', exact: true }).click();
    cooked = await page.getByRole('button', { name: '✔ Fertig', exact: true }).isVisible();
  }
  assert.ok(cooked, 'Kochen lässt sich über das sichtbare Timing abschließen');
  await page.getByRole('button', { name: '✔ Fertig', exact: true }).click();
  assert.equal(await page.evaluate(() => window.__bi2.g.count('karotte')), before - 2);
  console.log('Prüfe freies Bauen …');
  // Freies Bauen über die Rasteroberfläche. Rückgängig und Abtragen müssen dasselbe Bauwerk verändern.
  await page.evaluate(() => { const g = window.__bi2.g, w = g.worlds.byId('bauland'); g.teleport(w.spawn.x, w.spawn.z); const a = g.interact.get('freie_baukiste'); g.teleport(a.x, a.z); });
  await page.waitForFunction(() => window.__bi2.g.currentWorld?.id === 'bauland');
  await page.evaluate(() => window.__bi2.g.openPanel('freebuild'));
  await page.getByRole('button', { name: 'Spalte 1, Reihe 1, Höhe 0', exact: true }).click();
  await page.getByRole('button', { name: 'Spalte 1, Reihe 1, Höhe 1', exact: true }).click();
  await page.getByRole('button', { name: '↶ Rückgängig', exact: true }).click();
  assert.equal(await page.evaluate(() => window.__bi2.g.flag('bau:0:0:1')), 0);
  await page.getByRole('button', { name: '✔ Anschauen', exact: true }).click();
  await reviewShot(page, '03-bauwiese.png');
  console.log('Prüfe Mitfahrt …');
  // Riesenrad: Figur bewegt sich tatsächlich mit und kehrt beim Aussteigen zum Einstieg zurück.
  await page.evaluate(() => { const g = window.__bi2.g, w = g.worlds.byId('park'); g.teleport(w.spawn.x, w.spawn.z); g.setFlag('park_laeuft'); const a = g.interact.get('fahrt:riesenrad'); g.teleport(a.x, a.z); a.act(); });
  await page.waitForSelector('.ride-controls');
  await page.waitForFunction(() => { const g = window.__bi2.g; return g.busy === 1 && g.player.pos.y > g.field.height(g.player.pos.x, g.player.pos.z) + 0.5; });
  const riding = await page.evaluate(() => { const p = window.__bi2.g.player.pos; return { x: p.x, y: p.y, z: p.z }; });
  await page.waitForTimeout(2000);
  const moved = await page.evaluate(() => { const p = window.__bi2.g.player.pos; return { x: p.x, y: p.y, z: p.z }; });
  assert.ok(Math.hypot(moved.x - riding.x, moved.y - riding.y, moved.z - riding.z) > 0.5, 'Die Gondel bewegt die Figur entlang der Kreisbahn');
  assert.ok(await page.evaluate(() => window.__bi2.g.persist()));
  const stored = await page.evaluate(() => window.__bi2.store.load(3).data.pos);
  assert.ok(stored.y < 4, 'Spielstand speichert den Einstieg, keine Gondel in der Luft');
  await reviewShot(page, '04-riesenrad.png');
  await page.getByRole('button', { name: '⏏ Aussteigen', exact: true }).click();
  assert.equal(await page.evaluate(() => window.__bi2.g.busy), 0);
  // Bauwerk bleibt auch nach einem vollständigen Neuladen erhalten.
  await page.reload(); await page.waitForFunction(() => window.__bi2);
  assert.equal(await page.evaluate(() => window.__bi2.store.load(3).data.flags['bau:0:0:0']), 1);
  assert.deepEqual(errors, []);
  console.log('Neuauflage: 20 Welten, Hof, Küche, Bauwiese, Mitfahrt und Speichern bestanden.');
  // Touch-Viewport: sichtbare Steuerung, keine horizontale Überbreite.
  await page.close();
  console.log('Prüfe Touch-Viewport …');
  const mobile = await browser.newPage({ ...devices['Pixel 5'], viewport: { width: 390, height: 844 } });
  page = mobile;
  mobile.setDefaultTimeout(45000);
  mobile.on('pageerror', e => { errors.push(e.message); console.error('Touch-Fehler:', e.message); });
  mobile.on('console', m => { if (m.type() === 'error') console.error('Touch-Konsole:', m.text()); });
  await mobile.goto(BASE + '?test=1'); await mobile.waitForFunction(() => window.__bi2);
  await mobile.locator('#btn-slots').tap(); await mobile.locator('#slot-3 .btn.green').tap(); await mobile.locator('#mode-free .btn').tap();
  await mobile.getByRole('button', { name: '✔ Fertig', exact: true }).tap();
  await mobile.waitForFunction(() => window.__bi2.g.phase === 'play');
  await mobile.waitForSelector('.touch:not(.hidden)');
  assert.ok(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  const touchLayout = await mobile.evaluate(() => {
    const stats = document.querySelector('.hud-tl > .statline').getBoundingClientRect();
    const menus = document.querySelector('.hud-tr').getBoundingClientRect();
    const jump = document.querySelector('.tb.jump small').getBoundingClientRect();
    return { separate: stats.right <= menus.left, promptHidden: getComputedStyle(document.querySelector('.prompt')).display === 'none', jumpVisible: jump.bottom <= innerHeight };
  });
  assert.ok(touchLayout.separate, 'Status und Menü überlappen im Hochformat nicht');
  assert.ok(touchLayout.promptHidden, 'Touch-Aktion braucht keinen überlagernden Tastaturhinweis');
  assert.ok(touchLayout.jumpVisible, 'Die Sprungbeschriftung bleibt im Bildschirm');
  await reviewShot(mobile, '05-touch.png');
  assert.deepEqual(errors, []);
} catch (error) {
  if (page && !page.isClosed()) console.error('Fehlerzustand:', await page.evaluate(() => ({ phase: window.__bi2?.g.phase, busy: window.__bi2?.g.busy, editor: !!document.querySelector('.editor'), text: document.body.innerText.slice(-1200) })).catch(() => null));
  await page?.screenshot({ path: OUT + '/failure.png' }).catch(() => {});
  throw error;
} finally { await browser.close(); }
