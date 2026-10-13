/* Prisma-Archipel: Weltregistrierung, drei Fahrzeuge und drei persistierte Lichtfolgen. Aufruf: node bunte-insel/tests/prisma.mjs */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
const errors = []; page.on('pageerror', e => errors.push(e.message));
if (process.env.THREE) await page.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
await page.route('**/fonts.googleapis.com/**', r => r.abort()); await page.route('**/cloud/**', r => r.abort());
await page.goto(BASE + '/bunte-insel/index.html');
await page.waitForFunction(() => window.__bi && window.__bi.prisma, null, { timeout: 60000 });
const result = await page.evaluate(() => {
  const g = window.__bi, island = BI.PRISMA;
  for (const q of island.zones) for (const i of q.order) g.prisma.act({ zone: q.id, i });
  return {
    zones: island.zones.length,
    registered: BI.STORY_ISLES.some(q => q.key === 'PRISMA'),
    cars: ['kiRoadster', 'runeCoupe', 'dataBuggy'].every(k => !!BI.VEH[k]),
    spawned: ['kiRoadster', 'runeCoupe', 'dataBuggy'].every(k => g.W.vehicleSpawns.some(v => v.type === k)),
    mapHighlights: g.W.spots.prismaZones.length,
    puzzles: island.zones.every(q => g.prisma.state().done[q.id] === true)
  };
});
await browser.close();
const failed = Object.entries(result).filter(([k, v]) => v !== true && !(k === 'zones' && v === 3) && !(k === 'mapHighlights' && v === 3));
for (const [k, v] of Object.entries(result)) console.log((failed.some(x => x[0] === k) ? 'FAIL ' : 'OK   ') + k + ': ' + v);
if (errors.length) { console.error('JS errors:', errors.slice(0, 5)); process.exit(1); }
if (failed.length) process.exit(1);
console.log('Prisma-Archipel funktioniert ✅');
