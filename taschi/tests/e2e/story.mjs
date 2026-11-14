// Browsertest: Story-Stellen mit echten Texten in ihren Regionen – Rians Taschi
// im Nebelmoor, Kett & Kora am Wolkenweg, Lyras Finale mit weiblicher Anrede.
// Run: node tests/e2e/story.mjs [screenshot-dir]
import assert from 'node:assert/strict';
import { startSeeded, G, waitIdle } from './helpers.mjs';

const dir = process.argv[2] || null;
const t = await startSeeded({ width: 1280, height: 720 }, (s, { makeMonster, rng }) => {
  s.team.unshift(makeMonster('panzerlon', 60, rng));
  s.badges = 16; for (let r = 0; r < 16; r++) { s.champions[r] = true; s.visited[r] = true; s.flags['arrive:' + r] = true; }
  s.bag.brixcode = 1; s.flags.summitDone = true; s.league = 4;
  for (let i = 0; i < 5; i++) s.trainers['rival_' + i] = true;
});
const { page, errors, close } = t;
const shot = async (name) => { console.log('·', name, new Date().toISOString().slice(11, 19)); if (dir) await page.screenshot({ path: dir + '/' + name + '.png' }); };
const frames = (n = 30) => page.evaluate((n) => new Promise(r => { let k = 0; const f = () => ++k >= n ? r() : requestAnimationFrame(f); requestAnimationFrame(f); }), n);
// zeigt Zeilen im echten Dialog und wartet, bis die gesuchte Zeile ausgeschrieben ist
async function scene(region, src, pick, expect, name) {
  await G(page, (r) => { const g = window.__taschi; g.world.encounterCooldown = 999; return g.travelToRegion(r, 'south'); }, region);
  await waitIdle(page, 240000);
  await G(page, ([src, pick]) => import('./src/data/' + src[0] + '.js').then(m => { const g = window.__taschi; const lines = new Function('m', 'return ' + src[1])(m); g.ui.say(lines.slice(pick)); }), [src, pick]);
  await page.waitForFunction((e) => (document.querySelector('.dlg')?.textContent || '').includes(e), expect, { timeout: 60000 });
  await frames(20);
  await shot(name);
  for (let i = 0; i < 12 && await G(page, () => !!window.__taschi.ui.blocking); i++) { await page.keyboard.press('Enter'); await page.waitForTimeout(400); }
}
try {
  await G(page, () => { window.__taschi.renderer.adaptive = false; });
  await scene(8, ['story', 'm.GUILD_SCENES[3].win'], 3, 'Rians erstes Taschi', 'story-nebelmoor-kaefig');
  await scene(15, ['adventure', 'm.AMBUSHES[15].intro.map(l => ({ ...l, text: l.text.replaceAll("{mon}", "Wolkli") }))'], 0, 'Lieblingsproblem', 'story-wolkenweg-zwillinge');
  await scene(16, ['story', 'm.LEAGUE_FINALE'], 0, 'die neue Sternenmeisterin', 'story-finale-anrede');
  assert.deepEqual(errors, [], 'Browserfehler: ' + errors.join(' | '));
  console.log('OK story');
} finally { await close(); }
