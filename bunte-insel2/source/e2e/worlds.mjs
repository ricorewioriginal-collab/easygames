// Rundgang: Freie Welt, jede Welt besuchen, Ladezustand/Bewohner/Fehler prüfen, Weltwechsel und Freigabe der Ressourcen.
import { createRequire } from 'node:module';
const req = createRequire(import.meta.url);
let pw; for (const p of ['playwright', '/opt/node-tools/node_modules/playwright']) { try { pw = req(p); break; } catch {} }
const BASE = process.env.BASE || 'http://localhost:8090/bunte-insel2/';
const OUT = process.env.OUT || '/tmp/claude-0/shots';
const browser = await pw.chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1024, height: 600 } });
const errs = [];
page.on('pageerror', e => errs.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 300)); });
const ok = (c, m) => { console.log((c ? '✅ ' : '❌ ') + m); if (!c) process.exitCode = 1; };
await page.goto(BASE + '?test=1');
await page.waitForFunction(() => window.__bi2, null, { timeout: 60000 });
await page.evaluate(() => { const b = window.__bi2; const s = { ...JSON.parse('{}') }; });
await page.click('#btn-slots'); await page.click('#slot-2 .btn.green'); await page.click('#mode-free .btn');
await page.waitForTimeout(600); await page.click('text=✔ Fertig'); await page.waitForTimeout(1500);
for (let k = 0; k < 10; k++) { if (!(await page.$('.dialog'))) break; await page.keyboard.press('KeyE'); await page.waitForTimeout(150); }
const ids = await page.evaluate(() => window.__bi2.g.worlds.defs.map(d => d.id));
ok(ids.length === 20, ids.length + ' Welten registriert');
for (const id of ids) {
  const r = await page.evaluate(async wid => {
    const g = window.__bi2.g, w = g.worlds.byId(wid);
    g.teleport(w.spawn.x, w.spawn.z, w.spawn.yaw);
    await new Promise(r => setTimeout(r, 1300));
    const npcs = [...window.__bi2.sys.npcs.live.values()].filter(n => n.def.world === wid).length;
    const defs = window.__bi2.sys.npcs.byWorld(wid).filter(d => !d.when).length;
    const p = g.player.pos, gr = g.physics.ground(p.x, p.z, p.y + 0.5);
    return { loaded: g.worlds.loaded.has(wid), cur: g.currentWorld && g.currentWorld.id, npcs, defs, y: p.y, ground: gr.y, loadedCount: g.worlds.loaded.size, quests: [...window.__bi2.sys.quests.defs.values()].filter(q => q.world === wid).length };
  }, id);
  await page.screenshot({ path: OUT + '/w-' + id + '.png' });
  ok(r.loaded && r.cur === id && r.npcs >= r.defs && Math.abs(r.y - r.ground) < 1.5, id + ': geladen, ' + r.npcs + '/' + r.defs + ' Bewohner, ' + r.quests + ' Quests, geladene Welten ' + r.loadedCount);
}
const mem = await page.evaluate(() => { const g = window.__bi2.g; return { geo: g.renderer.gl.info.memory.geometries, tex: g.renderer.gl.info.memory.textures, loaded: g.worlds.loaded.size }; });
console.log('Speicher nach Rundgang:', JSON.stringify(mem));
ok(mem.loaded <= 4, 'Ferne Welten werden freigegeben');
console.log(errs.slice(0, 12).join('\n') || 'keine Fehler im Browser');
await browser.close();
