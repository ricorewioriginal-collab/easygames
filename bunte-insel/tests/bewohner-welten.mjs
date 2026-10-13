/* Jeder Themenwelt folgen zwei zusätzliche, ansprechbare Bewohner mit englischen Dialogen. */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext({ viewport: { width: 900, height: 560 } });
await ctx.addInitScript(() => { try { localStorage.setItem('bunteInsel_language', 'en'); } catch (e) {} });
const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message));
await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 60000 }); await p.click('#bStart');
const result = await p.evaluate(() => {
  const b = window.__bi, keys = BI.STORY_ISLES.map(x => x.key).concat('WUNSCH'), bad = [];
  for (const key of keys) {
    const O = BI[key], reg = b.life.regions.find(r => r.worldExpansion === key);
    if (!O || !reg) { bad.push(key + ': keine Region'); continue; }
    b.P.x = O.x; b.P.z = O.z; b.P.y = 0; b.life.update(.016, 1, false, 0);
    const spec = reg.spec.find(q => q[2] && q[2].worldExpansion === key), want = spec && spec[2];
    const people = (reg.list || []).filter(n => n.kind === 'person' && want && want.names.includes(n.p && n.p.name));
    if (!want || people.length < 2) bad.push(key + ': Bewohner ' + people.length);
    if (want && want.lines.some(s => BunteInselI18n.t(s) === s)) bad.push(key + ': Dialog nicht übersetzt');
  }
  return { worlds: keys.length, bad };
});
console.log('Themenwelten:', result.worlds); result.bad.forEach(x => console.log('FAIL', x)); errs.forEach(x => console.log('ERR', x));
await browser.close(); process.exit(result.bad.length || errs.length ? 1 : 0);
