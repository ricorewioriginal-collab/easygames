// Bildtafel: Entwicklungslinien der gebauten Taschis nebeneinander (für Optik-Vergleiche).
// Run: node tests/e2e/lineup.mjs <screenshot-dir> [name]
import { startSeeded } from './helpers.mjs';
const dir = process.argv[2], name = process.argv[3] || 'lineup';
const t = await startSeeded({ width: 1280, height: 900 }, () => {});
const { page, close } = t;
try {
  await page.evaluate(async () => {
    const { SPECIES } = await import('./src/data/species.js');
    const { evolutionChain } = await import('./src/logic/monster.js');
    const g = window.__taschi;
    const lines = ['glutzahn', 'plaetscher', 'samenling', 'blitzi', 'fellino', 'flatterling', 'form_0_0', 'form_3_6', 'form_6_12', 'form_9_3', 'form_4_9', 'pilzling'];
    const wrap = document.createElement('div');
    wrap.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#e8eef4;display:grid;grid-template-columns:repeat(6,1fr);gap:4px;padding:8px;overflow:hidden';
    for (const base of lines) for (const id of evolutionChain(base).slice(0, 3).concat([null, null]).slice(0, 3)) {
      const cell = document.createElement('div'); cell.style.cssText = 'text-align:center;font:12px sans-serif';
      if (id) { const img = new Image(); img.src = g.preview.thumbnail(id); img.style.width = '120px'; cell.append(img, document.createElement('br'), SPECIES[id].name); }
      wrap.append(cell);
    }
    document.body.append(wrap);
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: dir + '/' + name + '.png' });
} finally { await close(); }
