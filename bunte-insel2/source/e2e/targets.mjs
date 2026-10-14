// Prüft, ob jedes Quest-Ziel eine auffindbare Position hat (Lichtsäule/Minikarte), damit Spieler nie ratlos sind.
import { createRequire } from 'node:module';
const req = createRequire(import.meta.url);
let pw; for (const p of ['playwright', '/opt/node-tools/node_modules/playwright', '/opt/npm-tools/node_modules/playwright']) { try { pw = req(p); break; } catch {} }
const BASE = process.env.BASE || 'http://localhost:8090/bunte-insel2/';
const browser = await pw.chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 640, height: 360 } });
await page.goto(BASE + '?test=1');
await page.waitForFunction(() => window.__bi2, null, { timeout: 60000 });
await page.click('#btn-slots'); await page.waitForTimeout(300);
await page.click('#slot-3 .btn.green'); await page.waitForTimeout(300);
await page.click('#mode-free .btn'); await page.waitForTimeout(800);
await page.click('text=✔ Fertig'); await page.waitForTimeout(1200);
const worlds = await page.evaluate(() => window.__bi2.g.worlds.defs.map(w => w.id));
const bad = [];
for (const w of worlds) {
  await page.evaluate(id => { const g = window.__bi2.g, d = g.worlds.byId(id); g.teleport(d.spawn.x, d.spawn.z); }, w);
  await page.waitForTimeout(1500);
  const r = await page.evaluate(id => {
    const B = window.__bi2, g = B.g, S = B.sys, out = [];
    for (const q of S.quests.defs.values()) {
      if (q.world !== id) continue;
      q.stages.forEach((st, si) => st.objectives.forEach(o => {
        let ok = !!o.at;
        if (!ok && o.type === 'talk') ok = S.npcs.defs.has(o.target);
        if (!ok && o.type === 'enter') ok = !!g.worlds.byId(o.target);
        if (!ok && o.type === 'discover') ok = true;
        if (!ok && o.type === 'flag' && /^done_/.test(o.target)) ok = true;
        if (!ok) ok = !!S.interactFor(o);
        if (!ok) out.push(q.id + ' #' + si + ' ' + o.type + ' ' + o.target + ' „' + o.label + '“');
      }));
    }
    return out;
  }, w);
  bad.push(...r);
}
console.log(bad.length + ' Ziele ohne Ort:\n' + bad.join('\n'));
await browser.close();
