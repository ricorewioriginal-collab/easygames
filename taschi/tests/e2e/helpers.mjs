// Shared Playwright helpers for TASCHI browser tests.
import { createRequire } from 'node:module';
import { startServer } from '../../tools/serve.mjs';
const require = createRequire(import.meta.url);
export function loadPlaywright() {
  for (const p of ['playwright', 'playwright-core', '/home/claude/.npm-global/lib/node_modules/playwright', '/opt/npm-tools/node_modules/playwright']) { try { return require(p); } catch {} }
  throw new Error('Playwright nicht gefunden (npm i -D playwright-core)');
}
export async function launch({ width = 1280, height = 720, touch = false, storage = null } = {}) {
  const { chromium } = loadPlaywright();
  const port = 9100 + Math.floor(Math.random() * 600);
  const server = await startServer(port);
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const context = await browser.newContext({ viewport: { width, height }, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1 });
  if (storage) await context.addInitScript((s) => { if (!sessionStorage.getItem('__seeded')) { for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v); sessionStorage.setItem('__seeded', '1'); } }, storage);
  const page = await context.newPage();
  const errors = [], logs = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/GPU stall|favicon|ERR_TUNNEL|ERR_NAME|identitytoolkit|firestore|gstatic/.test(m.text())) errors.push(m.text()); logs.push(m.text()); });
  page.on('requestfailed', r => { const u = r.url(); if (u.includes('localhost')) errors.push('request failed ' + u); });
  page.on('response', r => { if (r.status() >= 400 && r.url().includes('localhost')) errors.push('HTTP ' + r.status() + ' ' + r.url()); });
  const base = `http://localhost:${port}/taschi/`;
  return { browser, page, errors, logs, base, close: async () => { await browser.close(); server.close(); } };
}
export const G = (page, fn, arg) => page.evaluate(fn, arg);
export async function waitState(page, state, timeout = 120000) { await page.waitForFunction((s) => window.__taschi?.state === s, state, { timeout }); }
export async function waitIdle(page, timeout = 60000) { await page.waitForFunction(() => { const g = window.__taschi; return g && !g.busy && !g.ui.blocking && g.state === 'world'; }, null, { timeout }); }
// Advance dialogs by pressing confirm until the UI is free or a predicate holds.
export async function advance(page, { max = 200, until = null, choose = null } = {}) {
  for (let i = 0; i < max; i++) {
    const st = await page.evaluate(() => { const g = window.__taschi; return { blocking: g.ui.blocking, busy: g.busy, state: g.state, choices: [...document.querySelectorAll('.choice')].map(c => c.textContent), text: document.querySelector('.dlg')?.textContent || '' }; });
    if (until && await page.evaluate(until)) return st;
    if (!st.blocking && !st.busy && st.state === 'world') return st;
    if (st.choices.length && choose) {
      const idx = st.choices.findIndex(c => choose.some(x => c.includes(x)));
      if (idx >= 0) { await page.locator('.choice').nth(idx).click(); await page.waitForTimeout(150); continue; }
    }
    await page.keyboard.press('Enter');
    await page.waitForTimeout(st.state === 'battle' ? 450 : 350);
  }
  throw new Error('advance(): kein Fortschritt');
}
export async function teleport(page, x, z, ry = 0) { await page.evaluate(([x, z, ry]) => window.__taschi.world.placePlayer(x, z, ry), [x, z, ry]); await page.waitForTimeout(250); }
export async function interactWith(page, pred) {
  // place the player in front of the first interactable matching pred and press E
  const ok = await page.evaluate((src) => {
    const g = window.__taschi, f = new Function('e', 'return (' + src + ')(e)');
    const e = g.world.interactables().find(f);
    if (!e) return false;
    let best = null;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) for (const d of [0.9, 1.3, 1.8, 2.4]) {
      const x = e.x + Math.sin(a) * d, z = e.z + Math.cos(a) * d;
      if (!g.world.blocked(x, z) && (!best || d < best.d)) best = { x, z, d, ry: Math.atan2(e.x - x, e.z - z) };
    }
    if (!best) return false;
    g.world.placePlayer(best.x, best.z, best.ry);
    return true;
  }, pred.toString());
  if (!ok) throw new Error('Interaktion nicht gefunden: ' + pred);
  for (let k = 0; k < 6; k++) {
    await page.waitForTimeout(700);
    await page.keyboard.press('KeyE');
    // E also confirms dialogs, so wait long enough for a slow frame before pressing again
    try { await page.waitForFunction(() => { const g = window.__taschi; return g.busy > 0 || g.ui.blocking || g.state !== 'world'; }, null, { timeout: 2500 }); return; } catch {}
  }
  throw new Error('Interaktion ohne Wirkung: ' + pred);
}

// Build a ready-made save (logic layer) and return localStorage entries.
export async function seededStorage(mutate = () => {}, slot = 1) {
  const { newSave, serialize, keys } = await import('../../src/logic/save.js');
  const { makeMonster } = await import('../../src/logic/monster.js');
  const { createRng } = await import('../../src/core/rng.js');
  const rng = createRng('seed');
  const s = newSave({ name: 'Testi', look: { body: 'teen', hair: 'ponytail', skin: 1, hairColor: 2, top: 'hoodie', topColor: 2, backpack: 0xf2c94a } });
  Object.assign(s.flags, { introDone: true, metUlme: true, starterChosen: true, firstBattle: true, firstQuest: true, travelStarted: true, starter: 'plaetscher' });
  s.team.push(makeMonster('plaetscher', 12, rng), makeMonster('fellino', 10, rng));
  s.dex.plaetscher = 2; s.dex.fellino = 2;
  s.bag = { taschiball: 20, trank: 5, supertrank: 3 };
  s.location = { map: 'region:0', x: 0, z: 30, ry: Math.PI };
  mutate(s, { makeMonster, rng });
  return { [keys.v2(slot)]: serialize(s), [keys.selected]: String(slot) };
}
export async function startSeeded(opts = {}, mutate) {
  const storage = await seededStorage(mutate);
  const t = await launch({ ...opts, storage });
  await t.page.goto(t.base);
  await waitState(t.page, 'title');
  await t.page.getByText('Fortsetzen').click();
  await waitState(t.page, 'world');
  await waitIdle(t.page);
  return t;
}
