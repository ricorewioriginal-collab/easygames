// Browsertest: Abenteuer-Ausbau – Gilden-Hinterhalt auf dem Südpfad (Route 1),
// Lichtsäulen und Minimap-Markierungen, Hinweistafel am Rätsel, Gebietskarte,
// Agentin Juna mit Gildennotiz und Ankunfts-Szene in Region 2.
// Run: node tests/e2e/adventure.mjs [screenshot-dir] [phone]
import assert from 'node:assert/strict';
import { startSeeded, G, advance, interactWith } from './helpers.mjs';

const dir = process.argv[2] || null, phone = process.argv[3] === 'phone';
const t = await startSeeded(phone ? { width: 390, height: 844, touch: true } : { width: 1280, height: 720 }, (s, { makeMonster, rng }) => {
  s.team.unshift(makeMonster('panzerlon', 40, rng));
});
const { page, errors, close } = t;
const shot = async (name) => { console.log('·', name, new Date().toISOString().slice(11, 19)); if (dir) await page.screenshot({ path: dir + '/' + name + '.png' }); };
const frames = (n = 30) => page.evaluate((n) => new Promise(r => { let k = 0; const f = () => ++k >= n ? r() : requestAnimationFrame(f); requestAnimationFrame(f); }), n);
const P = phone ? 'phone-' : '';
try {
  await G(page, () => { const g = window.__taschi; g.renderer.adaptive = false; g.world.encounterCooldown = 999; });
  // Hauptauftrag zeigt den Hinterhalt, Markierungen und Lichtsäulen sind da
  const info = await G(page, () => { const g = window.__taschi; return { obj: g.objective().target, beacons: g.world.beacons.length, amb: g.world.current.layout.ambush, juna: !!g.world.npcs.find(n => n.id === 'juna') }; });
  assert.equal(info.obj, 'ambush', 'Ziel ist nicht der Hinterhalt');
  assert.ok(info.beacons >= 2, 'Lichtsäulen fehlen');
  assert.ok(info.juna, 'Agentin Juna fehlt');
  // Blick auf den Südpfad mit Lichtsäule
  await G(page, (a) => window.__taschi.world.placePlayer(a.x + 2, a.z - 22, 0), info.amb);
  await frames(40);
  await shot(P + 'adv-route-beacon');
  // Hinterhalt auslösen: hinlaufen
  await G(page, (a) => window.__taschi.world.placePlayer(a.x, a.z - 7, 0), info.amb);
  await page.waitForFunction(() => document.body.classList.contains('cine'), null, { timeout: 60000 });
  await advance(page, { max: 12, until: () => /Netz zappelt/.test(document.querySelector('.dlg')?.textContent || '') });
  await frames(20);
  await shot(P + 'adv-ambush-scene');
  await advance(page, { max: 120, until: () => window.__taschi.state === 'battle' });
  await page.waitForFunction(() => document.querySelector('.bact.fight'), null, { timeout: 120000 });
  await frames(10);
  await shot(P + 'adv-ambush-battle');
  await advance(page, { max: 200, until: () => window.__taschi.state === 'world' && document.body.classList.contains('cine') && /befreite|flieht|Funkgerät/.test(document.querySelector('.dlg')?.textContent || '') });
  await frames(20);
  await shot(P + 'adv-ambush-free');
  await advance(page, { max: 40 });
  assert.equal(await G(page, () => !!window.__taschi.save.trainers.amb_0), true, 'Hinterhalt nicht erledigt');
  assert.equal(await G(page, () => window.__taschi.objective().target), 'puzzle');
  // Rätselplatz: Hinweis beim Näherkommen, dann Hinweistafel
  const pz = await G(page, () => window.__taschi.world.current.layout.puzzle);
  await G(page, (p) => window.__taschi.world.placePlayer(p.x, p.z + 17, Math.PI), pz);
  await page.waitForFunction(() => [...document.querySelectorAll('.toast')].some(t => /Hinweistafel/.test(t.textContent)), null, { timeout: 30000 });
  await interactWith(page, (e) => e.kind === 'pzhint');
  await page.waitForFunction(() => /Tipp 1\//.test(document.querySelector('.dlg')?.textContent || ''), null, { timeout: 20000 });
  await frames(10);
  await shot(P + 'adv-puzzle-hint');
  await advance(page, { max: 30 });
  // Agentin Juna: Auftrag annehmen
  await interactWith(page, (e) => e.kind === 'npc' && e.npc.id === 'juna');
  await advance(page, { max: 40, choose: ['Ja, mache ich'] });
  assert.ok(await G(page, () => !!window.__taschi.save.quests.clue_0), 'Juna-Auftrag fehlt');
  // Gebietskarte im Menü mit Markierungen
  await page.evaluate(() => import('./src/ui/menus.js').then(m => m.openPauseMenu(window.__taschi, 'map')));
  await page.waitForSelector('canvas.regionmap');
  assert.ok(await G(page, () => document.querySelectorAll('.legend .mk').length >= 2), 'Legende leer');
  await frames(5);
  await shot(P + 'adv-region-map');
  await G(page, () => window.__taschi.ui.clear());
  await frames(10);
  // Notiz finden und abgeben
  await interactWith(page, (e) => e.kind === 'item' && e.item.id === 'lost:clue_0');
  await advance(page, { max: 30 });
  assert.equal(await G(page, () => !!window.__taschi.save.flags['lost:clue_0']), true, 'Notiz nicht gefunden');
  await G(page, () => { const g = window.__taschi, n = g.world.npcs.find(x => x.id === 'juna'); g.script(() => g.talkToNPC(n)); });
  await page.waitForFunction(() => [...document.querySelectorAll('.dlg')].some(d => /Notiz/.test(d.textContent)), null, { timeout: 30000 }).catch(() => {});
  await frames(20);
  await shot(P + 'adv-juna-note');
  await advance(page, { max: 40 });
  assert.equal(await G(page, () => !!window.__taschi.save.quests.clue_0?.done), true, 'Notiz nicht abgegeben');
  // Ankunfts-Szene in Region 2 (Korallküste)
  await G(page, () => { const s = window.__taschi.save; s.champions[0] = true; s.badges = 1; });
  page.evaluate(() => window.__taschi.travelToRegion(1, 'south')).catch(() => {});
  await page.waitForFunction(() => /Perlenhafen/.test(document.querySelector('.dlg')?.textContent || ''), null, { timeout: 120000 });
  await frames(30);
  await shot(P + 'adv-arrival');
  assert.deepEqual(errors, []);
  console.log('OK adventure');
} finally { await close(); }
